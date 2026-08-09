/**
 * Host bridge — the postMessage contract between this site and the app that
 * embeds it in an iframe.
 *
 * INBOUND (host -> site)
 *   { type: 'everlab:coverage:data',  payload: <schema.js payload> }
 *   { type: 'everlab:coverage:theme', theme: 'light' | 'dark' | 'auto' }
 *
 * OUTBOUND (site -> host)
 *   { type: 'everlab:coverage:ready' }                    // send the payload now
 *   { type: 'everlab:coverage:resize',   height }         // for iframe autosizing
 *   { type: 'everlab:coverage:close' }                    // the X button
 *   { type: 'everlab:coverage:navigate', page }           // 'bridge' | 'refresh'
 *   { type: 'everlab:refresh:checkout',  selection, totals, coverage }
 *                                                          // <- opens YOUR modal
 *
 * Every outbound message is also dispatched as a `CustomEvent` of the same name
 * on `window`, so a same-page (non-iframe) embed can listen without postMessage.
 *
 * Origin handling: the site replies to the exact origin that sent it the data.
 * Until that handshake completes it posts to `VITE_HOST_ORIGIN` if configured,
 * otherwise '*' — safe, because pre-handshake messages carry no member data.
 */

export const MESSAGE = {
  DATA: 'everlab:coverage:data',
  THEME: 'everlab:coverage:theme',
  READY: 'everlab:coverage:ready',
  RESIZE: 'everlab:coverage:resize',
  CLOSE: 'everlab:coverage:close',
  NAVIGATE: 'everlab:coverage:navigate',
  CHECKOUT: 'everlab:refresh:checkout',
}

export const isEmbedded = () => {
  try {
    return window.self !== window.top
  } catch {
    return true // cross-origin access threw, which itself means we're framed
  }
}

const configuredOrigins = String(import.meta.env.VITE_HOST_ORIGIN ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

/** Origin we last received a valid message from; replies go straight back to it. */
let handshakeOrigin = null

export function isTrustedOrigin(origin) {
  if (configuredOrigins.length === 0) return true // no allowlist configured
  return configuredOrigins.includes(origin)
}

function replyTarget() {
  if (handshakeOrigin) return handshakeOrigin
  if (configuredOrigins.length === 1) return configuredOrigins[0]
  return '*'
}

const hostWindow = () => (window.opener && !isEmbedded() ? window.opener : window.parent)

/** Send a message to the embedding app, and mirror it as a DOM CustomEvent. */
export function emit(type, detail = {}) {
  const message = { type, ...detail }
  try {
    const target = hostWindow()
    if (target && target !== window) target.postMessage(message, replyTarget())
  } catch (error) {
    console.warn('[coverage] postMessage to host failed', error)
  }
  window.dispatchEvent(new CustomEvent(type, { detail: message }))
}

/**
 * Listen for inbound host messages. Returns an unsubscribe function.
 * Only messages from the embedding window (and, when configured, from an
 * allowlisted origin) are accepted.
 */
export function listen(handlers) {
  const onMessage = (event) => {
    const data = event.data
    if (!data || typeof data !== 'object' || typeof data.type !== 'string') return
    if (!data.type.startsWith('everlab:')) return

    const expected = hostWindow()
    if (expected && event.source !== expected) return
    if (!isTrustedOrigin(event.origin)) {
      console.warn('[coverage] ignored message from untrusted origin', event.origin)
      return
    }

    handshakeOrigin = event.origin && event.origin !== 'null' ? event.origin : handshakeOrigin
    handlers[data.type]?.(data, event)
  }

  window.addEventListener('message', onMessage)
  return () => window.removeEventListener('message', onMessage)
}

/**
 * Report our document height to the host whenever it changes, so the embedding
 * iframe can size itself and avoid a nested scrollbar.
 *
 * The `data-embedded` flag drops the shell's `min-height: 100vh` (see app.css).
 * Without that, a host that sizes the iframe to the height we report pins the
 * content to at least that height, so the measurement can only ever grow —
 * navigating from a tall page to a short one would leave the frame oversized.
 * A host that ignores these messages and fixes the iframe height still looks
 * right, because the body background propagates to the frame's canvas.
 */
export function observeHeight() {
  if (!isEmbedded() || typeof ResizeObserver === 'undefined') return () => {}

  document.documentElement.dataset.embedded = '1'

  let last = 0
  const report = () => {
    // Measure the body, not documentElement: <html> stretches to the frame's
    // own height, so it reports the size we asked for rather than our content's.
    const height = Math.ceil(document.body.scrollHeight)
    if (height && height !== last) {
      last = height
      emit(MESSAGE.RESIZE, { height })
    }
  }

  const observer = new ResizeObserver(report)
  observer.observe(document.body)
  report()

  return () => {
    observer.disconnect()
    delete document.documentElement.dataset.embedded
  }
}
