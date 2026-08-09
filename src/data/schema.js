/**
 * Everlab Coverage payload — schema v1.
 *
 * This is the contract between your app and this site. Everything the two
 * pages render is derived from one object of this shape; nothing is fetched
 * from an Everlab API by this site itself.
 *
 * {
 *   v: 1,
 *   profile: {
 *     tracked:     108,            // total biomarkers tracked for this member
 *     lastTested:  '2026-02-14',   // ISO date (or any Date-parseable string)
 *     bioAge:      42,             // number | null
 *     bioAgeKnown: false,          // false => rendered blurred with a tooltip
 *     bioAgeNote:  'Too much of your data has aged out…',
 *     outdated:    64              // OPTIONAL override; normally derived from panels
 *   },
 *
 *   panels: [{
 *     id:         'hormone',
 *     name:       'Hormone panel',
 *     lastTested: '2024-04-01',              // optional
 *     markers:    { outdated: ['LH','FSH'], never: [], current: ['TSH'] }
 *                 // …or the long form: [{ name: 'LH', status: 'outdated' }]
 *   }],
 *
 *   atRisk: [{
 *     name:       'ApoB',
 *     value:      1.28,            // number | string
 *     unit:       'g/L',
 *     lastTested: '2025-06-01',
 *     status:     'outdated',      // marker status — drives the stale warning icon
 *     verdict:    'out-of-range',  // 'optimal' | 'suboptimal' | 'out-of-range'
 *     verdictLabel: 'Out of range',// optional; defaults from `verdict`
 *     position:   0.84             // optional 0..1 position on the range bar
 *   }],
 *
 *   products: [ … ]                // see products.js — drives the Refresh page
 * }
 *
 * Wire-size note: prefer the grouped `markers: { outdated: [...] }` form. For
 * ~500 markers it is roughly a third the size of the array-of-objects form, and
 * it gzips to well under a kilobyte.
 */

export const MARKER_STATUS = {
  OUTDATED: 'outdated',
  NEVER: 'never',
  CURRENT: 'current',
}

export const VERDICT = {
  OPTIMAL: 'optimal',
  SUBOPTIMAL: 'suboptimal',
  OUT_OF_RANGE: 'out-of-range',
}

const STATUS_SYNONYMS = {
  outdated: MARKER_STATUS.OUTDATED,
  stale: MARKER_STATUS.OUTDATED,
  expired: MARKER_STATUS.OUTDATED,
  out_of_date: MARKER_STATUS.OUTDATED,
  'out-of-date': MARKER_STATUS.OUTDATED,
  o: MARKER_STATUS.OUTDATED,

  never: MARKER_STATUS.NEVER,
  never_tested: MARKER_STATUS.NEVER,
  'never-tested': MARKER_STATUS.NEVER,
  untested: MARKER_STATUS.NEVER,
  n: MARKER_STATUS.NEVER,

  current: MARKER_STATUS.CURRENT,
  valid: MARKER_STATUS.CURRENT,
  ok: MARKER_STATUS.CURRENT,
  fresh: MARKER_STATUS.CURRENT,
  c: MARKER_STATUS.CURRENT,
}

const VERDICT_SYNONYMS = {
  optimal: VERDICT.OPTIMAL,
  good: VERDICT.OPTIMAL,
  in_range: VERDICT.OPTIMAL,
  'in-range': VERDICT.OPTIMAL,

  suboptimal: VERDICT.SUBOPTIMAL,
  borderline: VERDICT.SUBOPTIMAL,
  warning: VERDICT.SUBOPTIMAL,

  'out-of-range': VERDICT.OUT_OF_RANGE,
  out_of_range: VERDICT.OUT_OF_RANGE,
  outofrange: VERDICT.OUT_OF_RANGE,
  abnormal: VERDICT.OUT_OF_RANGE,
  critical: VERDICT.OUT_OF_RANGE,
}

export const VERDICT_LABEL = {
  [VERDICT.OPTIMAL]: 'Optimal',
  [VERDICT.SUBOPTIMAL]: 'Suboptimal',
  [VERDICT.OUT_OF_RANGE]: 'Out of range',
}

/** Default range-bar position when the host doesn't send one. */
const VERDICT_POSITION = {
  [VERDICT.OPTIMAL]: 0.22,
  [VERDICT.SUBOPTIMAL]: 0.6,
  [VERDICT.OUT_OF_RANGE]: 0.86,
}

export function normaliseStatus(value, fallback = MARKER_STATUS.CURRENT) {
  if (!value) return fallback
  return STATUS_SYNONYMS[String(value).trim().toLowerCase()] || fallback
}

export function normaliseVerdict(value, fallback = VERDICT.OUT_OF_RANGE) {
  if (!value) return fallback
  return VERDICT_SYNONYMS[String(value).trim().toLowerCase()] || fallback
}

/** Stable identity for a marker across panels and products. */
export const markerKey = (name) => String(name || '').trim().toLowerCase()

const slug = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function normaliseMarkers(raw) {
  if (!raw) return []

  // Grouped form: { outdated: [...], never: [...], current: [...] }
  if (!Array.isArray(raw) && typeof raw === 'object') {
    const out = []
    for (const [group, names] of Object.entries(raw)) {
      const status = normaliseStatus(group, null)
      if (!status || !Array.isArray(names)) continue
      for (const name of names) {
        if (name != null && String(name).trim()) out.push({ name: String(name).trim(), status })
      }
    }
    return out
  }

  // Array form: [{ name, status }] or [{ n, s }] or bare strings (assumed current).
  return raw
    .map((m) => {
      if (m == null) return null
      if (typeof m === 'string') return { name: m.trim(), status: MARKER_STATUS.CURRENT }
      const name = String(m.name ?? m.n ?? '').trim()
      if (!name) return null
      return { name, status: normaliseStatus(m.status ?? m.s) }
    })
    .filter(Boolean)
}

function normalisePanel(raw, index) {
  const name = String(raw?.name ?? raw?.title ?? `Panel ${index + 1}`).trim()
  const markers = normaliseMarkers(raw?.markers ?? raw?.m)

  const counts = { outdated: 0, never: 0, current: 0 }
  for (const m of markers) counts[m.status] += 1

  return {
    id: String(raw?.id ?? slug(name) ?? `panel-${index}`),
    name,
    lastTested: raw?.lastTested ?? raw?.tested ?? null,
    markers,
    counts,
    total: markers.length || Number(raw?.total ?? raw?.count) || 0,
  }
}

function normaliseAtRisk(raw, index) {
  const verdict = normaliseVerdict(raw?.verdict ?? raw?.band)
  const rawPosition = raw?.position ?? raw?.pos
  return {
    id: String(raw?.id ?? slug(raw?.name) ?? `at-risk-${index}`),
    name: String(raw?.name ?? '').trim(),
    value: raw?.value ?? null,
    unit: raw?.unit ?? '',
    lastTested: raw?.lastTested ?? raw?.date ?? null,
    status: normaliseStatus(raw?.status, MARKER_STATUS.CURRENT),
    verdict,
    verdictLabel: raw?.verdictLabel ?? VERDICT_LABEL[verdict],
    position: Number.isFinite(Number(rawPosition))
      ? Math.min(1, Math.max(0, Number(rawPosition)))
      : VERDICT_POSITION[verdict],
  }
}

/**
 * Normalise a raw payload into the shape the pages render from, and derive
 * every count so the host never has to keep totals in sync by hand.
 */
export function normalisePayload(raw) {
  const input = raw && typeof raw === 'object' ? raw : {}
  const profile = input.profile ?? input.stats ?? {}

  const panels = (Array.isArray(input.panels) ? input.panels : []).map(normalisePanel)
  const atRisk = (Array.isArray(input.atRisk ?? input.flags) ? (input.atRisk ?? input.flags) : []).map(
    normaliseAtRisk,
  )

  // Derive totals from the panel data — it is the source of truth. An explicit
  // profile.tracked / profile.outdated still wins if the host sends one, since
  // a host may show a subset of panels while counting every marker it holds.
  const panelMarkerTotal = panels.reduce((n, p) => n + p.total, 0)
  const derivedOutdated = panels.reduce((n, p) => n + p.counts.outdated, 0)
  const derivedNever = panels.reduce((n, p) => n + p.counts.never, 0)

  const tracked = Number(profile.tracked ?? profile.total ?? panelMarkerTotal) || 0
  const outdated = Number(profile.outdated ?? derivedOutdated) || 0

  // NOTE: `valid` is tracked − outdated, which means never-tested markers count
  // as valid. That matches the source design (108 tracked, 64 outdated, 44
  // "Valid" in the legend, with 10 of those 44 never tested). `neverTested` is
  // exposed separately if you'd rather split it out.
  const valid = Math.max(0, tracked - outdated)

  const bioAge = profile.bioAge ?? profile.biologicalAge ?? null
  const bioAgeKnown =
    profile.bioAgeKnown ?? profile.bioAgeAvailable ?? (bioAge != null && outdated === 0)

  return {
    v: 1,
    profile: {
      tracked,
      outdated,
      valid,
      neverTested: Number(profile.neverTested ?? derivedNever) || 0,
      lastTested: profile.lastTested ?? profile.tested ?? null,
      bioAge,
      bioAgeKnown: Boolean(bioAgeKnown),
      bioAgeNote:
        profile.bioAgeNote ??
        'Too much of your data has aged out to calculate your biological age accurately.',
      outdatedPct: tracked ? (outdated / tracked) * 100 : 0,
      validPct: tracked ? (valid / tracked) * 100 : 0,
    },
    panels,
    atRisk,
    products: Array.isArray(input.products) ? input.products : null,
    membership: input.membership ?? null,
    currency: input.currency ?? 'USD',
    locale: input.locale ?? 'en-AU',
  }
}

/** Every outdated marker across all panels, as a Set of marker keys. */
export function outdatedMarkerKeys(payload) {
  const keys = new Set()
  for (const panel of payload.panels) {
    for (const m of panel.markers) {
      if (m.status === MARKER_STATUS.OUTDATED) keys.add(markerKey(m.name))
    }
  }
  return keys
}
