/**
 * Host bridge — the postMessage contract between this site and the app that
 * embeds it in an iframe.
 *
 * INBOUND (host -> site)
 *   { type: 'everlab:coverage:data',  payload: <schema.js payload> }
 *   { type: 'everlab:coverage:theme', theme: 'light' | 'dark' | 'auto' }
 *
 * OUTBOUND — operational protocol (site -> host)
 *   { type: 'everlab:coverage:ready' }                    // send the payload now
 *   { type: 'everlab:coverage:resize',   height }         // for iframe autosizing
 *   { type: 'everlab:coverage:navigate', page }           // 'bridge' | 'refresh'
 *
 * OUTBOUND — member actions (site -> host), each sent via `emitAction`; a flat
 * { source, action } envelope where `action` is the host's allow-list key. These
 * are what the host acts on. Emit either from any control you add:
 *   { source: 'everlab-coverage', action: 'dismiss' }                          // ask the host to close the modal
 *   { source: 'everlab-coverage', action: 'checkout', priceDefinitionIds: [] } // <- opens the host's checkout
 * Note: the host's modal already provides its own close button, so there is no
 * built-in `dismiss` trigger here — emit it only if you add an in-flow "not now".
 *
 * Every outbound message is also dispatched as a `CustomEvent` on `window`
 * (named by `type` for protocol messages, `everlab:coverage:action` for actions),
 * so a same-page (non-iframe) embed can listen without postMessage.
 *
 * Origin handling: the site replies to the exact origin that sent it the data.
 * Until that handshake completes it posts to `VITE_HOST_ORIGIN` if configured,
 * otherwise '*' — safe, because pre-handshake messages carry no member data.
 */

// ⚠️ CONTRACT WITH THE EVERLAB PATIENT APP — DO NOT rename these string values.
// They are matched verbatim by the app's postMessage bridge
// (apps/patientApp/webV2/src/components/Renewal/coverageBridge.ts in ev-admin):
// the app POSTS `DATA` and LISTENS FOR `READY`. Changing a value silently breaks
// the handshake in shipped native builds that can't be hot-fixed — coordinate any
// change on both sides. Adding new protocol messages is safe; renaming is not.
export const MESSAGE = {
  DATA: 'everlab:coverage:data',
  THEME: 'everlab:coverage:theme',
  READY: 'everlab:coverage:ready',
  RESIZE: 'everlab:coverage:resize',
  SCROLL_TOP: 'everlab:coverage:scrolltop',
  NAVIGATE: 'everlab:coverage:navigate',
  ERROR: 'everlab:coverage:error',
}

// ⚠️ CONTRACT WITH THE EVERLAB PATIENT APP — DO NOT change `ACTION_SOURCE` or the
// `ACTION` values. The app validates `event.data.source === 'everlab-coverage'`
// and switches on `action` as its navigation allow-list key (coverageBridge.ts).
// A renamed source is dropped as untrusted; a renamed action silently no-ops.
// Add a new action only in lockstep with a handler on the app side.
export const ACTION_SOURCE = 'everlab-coverage'
export const ACTION_EVENT = 'everlab:coverage:action'
export const ACTION = {
  DISMISS: 'dismiss',
  CHECKOUT: 'checkout',
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

/** Post `message` to the embedding app, and mirror it as a DOM CustomEvent named `eventName`. */
function post(message, eventName) {
  try {
    const target = hostWindow()
    if (target && target !== window) target.postMessage(message, replyTarget())
  } catch (error) {
    console.warn('[coverage] postMessage to host failed', error)
  }
  window.dispatchEvent(new CustomEvent(eventName, { detail: message }))
}

/** Send an operational protocol message (ready, resize, navigate, …). */
export function emit(type, detail = {}) {
  post({ type, ...detail }, type)
}

// ⚠️ CONTRACT WITH THE EVERLAB PATIENT APP — the envelope MUST stay flat and keep
// the field names `source` and `action` (plus per-action fields like the checkout
// `priceDefinitionIds`). The app parses this exact shape; nesting it or renaming a
// field breaks parsing. See coverageBridge.ts in ev-admin.
/** Send a member action the host acts on — a flat { source, action, …detail } envelope. */
export function emitAction(action, detail = {}) {
  post({ source: ACTION_SOURCE, action, ...detail }, ACTION_EVENT)
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
 * Report our document height to the host whenever it changes — advisory, for a
 * host that autosizes its iframe to the content. Everlab's modal renders us at a
 * fixed height and ignores this (the shell fills that height; see app.css), so
 * it's a no-op there and safe for any other host that wants to size to content.
 */
export function observeHeight() {
  if (!isEmbedded() || typeof ResizeObserver === 'undefined') return () => {}

  let last = 0
  const report = () => {
    const height = Math.ceil(document.body.scrollHeight)
    if (height && height !== last) {
      last = height
      emit(MESSAGE.RESIZE, { height })
    }
  }

  const observer = new ResizeObserver(report)
  observer.observe(document.body)
  report()

  return () => observer.disconnect()
}
