/** Presentation helpers. All tolerant of null so the UI never renders "null". */

const EN_DASH = '–'

// Intl's en-AU "short" month leaves June and July unabbreviated ("June 2025"),
// which breaks the even rhythm of the stat row. The comps use three letters
// throughout, so spell them out.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatMonthYear(value, fallback = EN_DASH) {
  if (!value) return fallback
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value) // already-formatted string
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function formatMoney(amount, { currency = 'AUD', locale = 'en-AU' } = {}) {
  const value = Number(amount) || 0
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  })
    .format(value)
    // en-AU renders AUD as "A$"; the comps use a bare "$".
    .replace(/^A\$/, '$')
}

export function formatMeasurement(value, unit) {
  if (value == null || value === '') return EN_DASH
  return unit ? `${value} ${unit}` : String(value)
}

export const pct = (value, digits = 1) => `${Number(value || 0).toFixed(digits)}%`

export const plural = (count, one, many = `${one}s`) => `${count} ${count === 1 ? one : many}`
