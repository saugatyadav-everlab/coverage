/**
 * Payload resolver — one place that decides where the member's data comes from.
 *
 * Resolution order (first hit wins):
 *   1. ?d=<gzip+base64url JSON>   — compressed, self-contained, shareable
 *   2. ?data=<base64url JSON>     — uncompressed, handy while debugging
 *   3. ?src=<url>                 — fetched as JSON (needs CORS)
 *   4. postMessage handshake      — when embedded in an iframe (the default)
 *   5. demo payload               — dev, or ?demo=1
 *
 * postMessage is the recommended production path: no URL length limit, no CORS,
 * and biomarker values never touch browser history, server logs or `Referer`
 * headers. The URL modes exist so the page still works standalone.
 */

import { decodePayload } from './codec'
import { MESSAGE, emit, isEmbedded, listen } from './host'
import { DEMO_PAYLOAD } from './demo'

export const SOURCE = {
  URL_COMPRESSED: 'url:d',
  URL_PLAIN: 'url:data',
  FETCH: 'fetch:src',
  HOST: 'postMessage',
  DEMO: 'demo',
}

const DEFAULT_TIMEOUT_MS = 8000

async function fromHost(timeoutMs) {
  return new Promise((resolve, reject) => {
    const stop = listen({
      [MESSAGE.DATA]: (message) => {
        clearTimeout(timer)
        stop()
        resolve(message.payload ?? message.data ?? null)
      },
    })

    const timer = setTimeout(() => {
      stop()
      reject(
        new Error(
          `No payload received from the embedding app within ${timeoutMs}ms. ` +
            `Post { type: '${MESSAGE.DATA}', payload } in response to '${MESSAGE.READY}'.`,
        ),
      )
    }, timeoutMs)

    // Announce we're mounted and waiting. Some hosts push data before we're
    // ready, so they may also just post it unprompted — either works.
    emit(MESSAGE.READY, { v: 1 })
  })
}

export async function resolvePayload(searchParams, options = {}) {
  const params = searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams(searchParams)
  const timeoutMs = Number(params.get('timeout')) || options.timeoutMs || DEFAULT_TIMEOUT_MS

  const compressed = params.get('d')
  if (compressed) return { payload: await decodePayload(compressed), source: SOURCE.URL_COMPRESSED }

  const plain = params.get('data')
  if (plain) return { payload: await decodePayload(plain), source: SOURCE.URL_PLAIN }

  const src = params.get('src')
  if (src) {
    const response = await fetch(src, { credentials: 'omit', headers: { accept: 'application/json' } })
    if (!response.ok) throw new Error(`Fetching ?src= failed: ${response.status} ${response.statusText}`)
    return { payload: await response.json(), source: SOURCE.FETCH }
  }

  if (params.get('demo') === '1') return { payload: DEMO_PAYLOAD, source: SOURCE.DEMO }

  if (isEmbedded()) return { payload: await fromHost(timeoutMs), source: SOURCE.HOST }

  // Standalone with no parameters: show the demo rather than an empty page.
  return { payload: DEMO_PAYLOAD, source: SOURCE.DEMO }
}
