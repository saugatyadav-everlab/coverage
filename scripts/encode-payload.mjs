#!/usr/bin/env node
/**
 * Encode a payload JSON file into the `?d=` parameter.
 *
 *   npm run encode -- ./my-payload.json
 *   npm run encode -- ./my-payload.json https://coverage.everlab.com/
 *
 * Prints the parameter value, the resulting URL, and the size so you can see
 * how much headroom you have. Mirrors src/data/codec.js — gzip, then base64url.
 */

import { readFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const [file, baseUrl = 'http://localhost:5173/'] = process.argv.slice(2)

if (!file) {
  console.error('usage: npm run encode -- <payload.json> [baseUrl]')
  process.exit(1)
}

const json = JSON.stringify(JSON.parse(readFileSync(file, 'utf8')))
const encoded = gzipSync(Buffer.from(json), { level: 9 })
  .toString('base64')
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '')

const url = new URL(baseUrl)
url.searchParams.set('d', encoded)

const kb = (n) => `${(n / 1024).toFixed(2)}KB`

console.log(`\n?d= value (${kb(encoded.length)}):\n`)
console.log(encoded)
console.log(`\nURL (${kb(url.toString().length)} total):\n`)
console.log(url.toString())
console.log(
  `\nJSON ${kb(json.length)} -> encoded ${kb(encoded.length)} ` +
    `(${Math.round((1 - encoded.length / json.length) * 100)}% smaller). ` +
    `Keep the whole URL under ~8KB.\n`,
)

if (url.toString().length > 8192) {
  console.error('WARNING: this URL exceeds 8KB. Use the postMessage path instead.')
  process.exit(2)
}
