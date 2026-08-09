/**
 * Products and the recommendation engine for the Refresh page.
 *
 * Every item carries how many outdated markers it contributes. That number is
 * authoritative — the page computes the percentage and the progress ring from
 * it, so you never have to send a percentage.
 *
 *   markers: 40                      // <- the contribution. Required in practice.
 *   status:  'paid'                  // already booked; counts toward progress
 *                                    //   immediately and can't be deselected
 *   contributesToProgress: false     // a genuinely new test, not a retest:
 *                                    //   renders "Outside your outdated markers"
 *
 * Wire shape:
 *   {
 *     id, name,
 *     why:         'Recommended for your age',   // optional; generated from `covers.panels`
 *     image, price, memberPrice, priceNote,
 *     markers:     40,                           // contribution to the outdated pile
 *     status:      'available' | 'paid',
 *     recommended: true,                         // optional; otherwise derived
 *     contributesToProgress: true,
 *     covers: { panels: ['hormone'] }            // optional. Enables better copy,
 *   }                                            //   and de-duplicates overlapping
 *                                                //   items when no `markers` count
 *                                                //   was given.
 */

import { MARKER_STATUS, markerKey, outdatedMarkerKeys } from './schema'

/** Outdated markers belonging to a given panel id. */
function panelOutdatedKeys(payload, panelId) {
  const panel = payload.panels.find((p) => p.id === panelId || p.name === panelId)
  if (!panel) return []
  return panel.markers
    .filter((m) => m.status === MARKER_STATUS.OUTDATED)
    .map((m) => markerKey(m.name))
}

/**
 * Work out what a product contributes.
 *
 * An explicit `markers` count wins, because that's what the host actually
 * knows. Panel references are the fallback, and they're better when present:
 * two items covering the same panel resolve to the same marker keys, so the
 * union doesn't double-count them. With explicit counts we have to trust the
 * numbers and simply add them (capped at the outdated total).
 */
function resolveContribution(raw, payload, outdated) {
  const outside = raw.contributesToProgress === false || raw.countsTowardCoverage === false

  const keys = new Set()
  for (const panelId of raw.covers?.panels ?? []) {
    for (const key of panelOutdatedKeys(payload, panelId)) keys.add(key)
  }
  for (const name of raw.covers?.markers ?? []) {
    const key = markerKey(name)
    if (outdated.has(key)) keys.add(key)
  }

  const explicit = Number(raw.markers ?? raw.markerCount ?? raw.covers?.count)
  const hasExplicit = Number.isFinite(explicit) && explicit >= 0

  const count = hasExplicit ? explicit : keys.size

  return {
    count,
    // Only usable for de-duplication when we didn't override with a count.
    keys: hasExplicit ? new Set() : keys,
    countedSeparately: hasExplicit ? count : 0,
    outside,
    panelKeys: keys,
  }
}

function normaliseProduct(raw, payload, outdated, kind) {
  const contribution = resolveContribution(raw, payload, outdated)
  const price = Number(raw.price) || 0
  const memberPrice = raw.memberPrice != null ? Number(raw.memberPrice) : price

  return {
    id: String(raw.id),
    kind,
    name: raw.name ?? 'Untitled',
    // Sub-line under the name. Your copy, verbatim — nothing is generated here.
    why: raw.why ?? raw.description ?? null,
    image: raw.image ?? null,
    price,
    memberPrice,
    priceNote: raw.priceNote ?? null,
    perks: Array.isArray(raw.perks) ? raw.perks : null,
    paid: raw.status === 'paid' || raw.paid === true,

    // How many markers the test itself covers. Shown on the card even when
    // none of them are outdated — the number describes the test, the subtitle
    // explains whether it moves the needle.
    markerCount: contribution.count,
    // What it actually takes off the outdated pile.
    contribution: contribution.outside ? 0 : contribution.count,
    contributionKeys: contribution.outside ? new Set() : contribution.keys,
    contributionCount: contribution.outside ? 0 : contribution.countedSeparately,
    outside: contribution.outside,

    // `recommended` may be set by the host; otherwise the greedy pass below fills it in.
    recommended: raw.recommended === true,
    recommendedByHost: raw.recommended === true,
  }
}

/**
 * Normalise every product and flag a recommended subset.
 *
 * If the host marked anything `recommended`, we respect that verbatim — it may
 * well include an item with no contribution at all (a first-time test). Only
 * when nothing is marked do we derive recommendations with a greedy pass that
 * repeatedly takes the item adding the most still-uncovered markers.
 */
export function resolveProducts(payload, { maxRecommended = 2 } = {}) {
  const outdated = outdatedMarkerKeys(payload)

  const membership = payload.membership
    ? normaliseProduct(payload.membership, payload, outdated, 'membership')
    : null

  const products = (payload.products ?? []).map((p) => normaliseProduct(p, payload, outdated, 'addon'))

  if (!products.some((p) => p.recommendedByHost)) {
    // Already accounted for: anything paid, plus whatever the membership covers.
    const covered = new Set()
    let coveredCount = 0
    for (const product of [...products.filter((p) => p.paid), ...(membership ? [membership] : [])]) {
      for (const key of product.contributionKeys) covered.add(key)
      coveredCount += product.contributionCount
    }

    const candidates = products.filter((p) => !p.paid && !p.outside && p.contribution > 0)

    for (let i = 0; i < maxRecommended; i += 1) {
      let best = null
      let bestGain = 0
      for (const product of candidates) {
        if (product.recommended) continue
        const gain = product.contributionKeys.size
          ? [...product.contributionKeys].filter((key) => !covered.has(key)).length
          : product.contribution
        if (gain > bestGain) {
          best = product
          bestGain = gain
        }
      }
      if (!best) break
      best.recommended = true
      for (const key of best.contributionKeys) covered.add(key)
      coveredCount += best.contributionCount
    }
  }

  return { membership, products, outdated }
}

/** Price + progress totals for the current selection. */
export function computeSelection({
  membership,
  products,
  outdated,
  selectedIds,
  membershipSelected,
  atHome = null,
  atHomeSelected = false,
}) {
  const selected = new Set(selectedIds)
  const isMember = Boolean(membershipSelected)

  // The at-home draw only exists as an option on the plan, so it can't be
  // charged unless the plan itself is in the basket.
  const atHomeCharged = Boolean(atHome && isMember && atHomeSelected)

  const paid = products.filter((p) => p.paid)
  const chosen = products.filter((p) => !p.paid && selected.has(p.id))

  const priceOf = (product) => (isMember ? product.memberPrice : product.price)

  const subtotal =
    (isMember && membership ? membership.price : 0) +
    (atHomeCharged ? atHome.price : 0) +
    chosen.reduce((sum, p) => sum + p.price, 0)
  const saved = isMember ? chosen.reduce((sum, p) => sum + (p.price - p.memberPrice), 0) : 0
  const total = subtotal - saved

  // Prepaid items count toward progress from the moment the page loads — the
  // member has already bought them, so those markers are on their way back.
  const contributing = [...chosen, ...paid, ...(isMember && membership ? [membership] : [])]

  const refreshedKeys = new Set()
  let refreshedCounted = 0
  for (const product of contributing) {
    if (product.outside) continue
    for (const key of product.contributionKeys) refreshedKeys.add(key)
    refreshedCounted += product.contributionCount
  }

  const outdatedTotal = outdated.size
  const refreshed = Math.min(outdatedTotal, refreshedKeys.size + refreshedCounted)
  const remaining = Math.max(0, outdatedTotal - refreshed)

  return {
    isMember,
    chosen,
    paid,
    priceOf,
    // A delivery choice, not a test — charged, but deliberately absent from the
    // coverage maths above so the ring doesn't move when it's ticked.
    atHomeCharged,
    subtotal,
    saved,
    total,
    refreshed,
    remaining,
    outdatedTotal,
    fraction: outdatedTotal ? refreshed / outdatedTotal : 0,
    anySelected: isMember || chosen.length > 0,
  }
}

/** Share of the outdated pile a single item contributes. */
export const contributionShare = (product, outdatedTotal) =>
  outdatedTotal ? Math.round((product.contribution / outdatedTotal) * 100) : 0
