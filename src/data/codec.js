/**
 * Payload codec — JSON <-> gzip <-> base64url.
 *
 * Used for the `?d=` URL parameter. A payload with ~500 markers is around 12KB
 * of JSON, ~1.4KB gzipped, ~1.9KB once base64'd — comfortably inside every
 * browser's URL limit (Chrome caps at ~2MB, but proxies and server logs get
 * unhappy well before 8KB, so treat 8KB as the practical ceiling).
 *
 * Everything here uses `CompressionStream`, which is native in all current
 * browsers and in Node 18+. No dependency.
 */

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const GZIP_SUPPORTED = typeof CompressionStream !== 'undefined'
const GUNZIP_SUPPORTED = typeof DecompressionStream !== 'undefined'

function bytesToBase64Url(bytes) {
  let binary = ''
  const CHUNK = 0x8000 // avoid blowing the argument limit on large payloads
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(value) {
  const normalised = String(value).trim().replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalised + '='.repeat((4 - (normalised.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function streamThrough(bytes, transform) {
  const stream = new Blob([bytes]).stream().pipeThrough(transform)
  const buffer = await new Response(stream).arrayBuffer()
  return new Uint8Array(buffer)
}

const isGzip = (bytes) => bytes.length > 2 && bytes[0] === 0x1f && bytes[1] === 0x8b

/**
 * Encode a payload object into a URL-safe string for `?d=`.
 * Falls back to uncompressed base64url where CompressionStream is unavailable —
 * the decoder sniffs the gzip magic bytes, so both forms decode transparently.
 */
export async function encodePayload(payload) {
  const bytes = textEncoder.encode(JSON.stringify(payload))
  if (!GZIP_SUPPORTED) return bytesToBase64Url(bytes)
  return bytesToBase64Url(await streamThrough(bytes, new CompressionStream('gzip')))
}

/** Decode a `?d=` or `?data=` value back into a payload object. */
export async function decodePayload(value) {
  let bytes = base64UrlToBytes(value)
  if (isGzip(bytes)) {
    if (!GUNZIP_SUPPORTED) throw new Error('This browser cannot decompress the payload (no DecompressionStream)')
    bytes = await streamThrough(bytes, new DecompressionStream('gzip'))
  }
  return JSON.parse(textDecoder.decode(bytes))
}

/** Build a full URL to a page of this site carrying `payload` in `?d=`. */
export async function buildPayloadUrl(baseUrl, payload, extraParams = {}) {
  const url = new URL(baseUrl)
  url.searchParams.set('d', await encodePayload(payload))
  for (const [key, value] of Object.entries(extraParams)) {
    if (value != null) url.searchParams.set(key, String(value))
  }
  return url.toString()
}
