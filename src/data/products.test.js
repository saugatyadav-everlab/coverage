/**
 * Pricing + contribution assertions for the Refresh page.
 *
 * These run in the browser against the real modules (no test runner to install):
 *   open http://localhost:5173/embed-example.html and click "Run tests",
 *   or in any console:  await import('/src/data/products.test.js').then(m => m.run())
 *
 * The rules being pinned down:
 *   - Subtotal is always list price. The member discount is a separate line, so
 *     "subtotal − discount = total" reads correctly on screen.
 *   - Selecting the membership re-prices every add-on, in the cart and out of it.
 *   - Paid items never touch the money, but always count toward progress.
 *   - An item with no memberPrice is simply never discounted.
 */

import { normalisePayload } from './schema'
import { computeSelection, resolveProducts } from './products'

const BASE_PAYLOAD = {
  profile: { tracked: 20 },
  panels: [
    { id: 'a', name: 'Panel A', markers: { outdated: ['m1', 'm2', 'm3', 'm4'], current: ['m5'] } },
    { id: 'b', name: 'Panel B', markers: { outdated: ['m6', 'm7'], current: ['m8'] } },
  ],
  membership: { id: 'base', name: 'Baseline', price: 299, markers: 4 },
  products: [
    { id: 'discounted', name: 'Discounted add-on', price: 400, memberPrice: 300, markers: 2 },
    { id: 'flat', name: 'No member price', price: 150, markers: 1 },
    { id: 'prepaid', name: 'Already paid', price: 500, memberPrice: 400, markers: 2, status: 'paid' },
    { id: 'zero', name: 'Zero-marker test', price: 250, memberPrice: 200, markers: 0 },
    { id: 'outside', name: 'Brand new test', price: 699, memberPrice: 599, markers: 4, contributesToProgress: false },
  ],
}

function select({ payload = BASE_PAYLOAD, ids = [], member = false } = {}) {
  const normalised = normalisePayload(payload)
  const { membership, products, outdated } = resolveProducts(normalised)
  return {
    ...computeSelection({ membership, products, outdated, selectedIds: ids, membershipSelected: member }),
    membership,
    products,
  }
}

const CASES = {
  'nothing selected costs nothing'() {
    const s = select()
    expect(s.subtotal, 0)
    expect(s.saved, 0)
    expect(s.total, 0)
    expect(s.anySelected, false)
  },

  'prepaid items are free but still count toward progress'() {
    const s = select()
    expect(s.total, 0, 'a prepaid item must not be charged again')
    // 6 outdated markers across both panels; the prepaid test refreshes 2.
    expect(s.outdatedTotal, 6)
    expect(s.refreshed, 2, 'prepaid contribution is in the ring from first paint')
    expect(s.remaining, 4)
  },

  'add-on alone is charged at list price'() {
    const s = select({ ids: ['discounted'] })
    expect(s.subtotal, 400)
    expect(s.saved, 0)
    expect(s.total, 400)
    expect(s.priceOf(s.products.find((p) => p.id === 'discounted')), 400)
  },

  'selecting the membership re-prices add-ons already in the cart'() {
    const withoutMembership = select({ ids: ['discounted'] })
    const withMembership = select({ ids: ['discounted'], member: true })

    expect(withoutMembership.total, 400)
    // Subtotal stays at list price; the saving shows as its own line.
    expect(withMembership.subtotal, 299 + 400)
    expect(withMembership.saved, 100)
    expect(withMembership.total, 299 + 300)
    expect(withMembership.priceOf(withMembership.products.find((p) => p.id === 'discounted')), 300)
  },

  'membership re-prices add-ons added afterwards too'() {
    const s = select({ ids: ['discounted', 'flat'], member: true })
    // discounted 400->300 (saves 100), flat has no member price (saves 0).
    expect(s.subtotal, 299 + 400 + 150)
    expect(s.saved, 100)
    expect(s.total, 299 + 300 + 150)
  },

  'an item without a member price is never discounted'() {
    const alone = select({ ids: ['flat'] })
    const withMember = select({ ids: ['flat'], member: true })
    expect(alone.total, 150)
    expect(withMember.total, 299 + 150)
    expect(withMember.saved, 0)
  },

  'deselecting the membership restores list prices'() {
    const on = select({ ids: ['discounted'], member: true })
    const off = select({ ids: ['discounted'], member: false })
    expect(on.total, 599)
    expect(off.total, 400)
    expect(off.saved, 0)
  },

  'prepaid items are never discounted or re-charged by membership'() {
    const s = select({ member: true })
    expect(s.subtotal, 299, 'only the membership is chargeable')
    expect(s.saved, 0, 'a prepaid item generates no member discount')
    expect(s.total, 299)
  },

  'a zero-marker test still costs money but moves nothing'() {
    const s = select({ ids: ['zero'] })
    expect(s.total, 250)
    expect(s.refreshed, 2, 'unchanged from the prepaid baseline')
    const zero = s.products.find((p) => p.id === 'zero')
    expect(zero.markerCount, 0)
    expect(zero.contribution, 0)
  },

  'a non-contributing test shows its markers but adds nothing to progress'() {
    const s = select({ ids: ['outside'] })
    const outside = s.products.find((p) => p.id === 'outside')
    expect(outside.markerCount, 4, 'the card still says "4 markers"')
    expect(outside.contribution, 0, 'but none of them are outdated')
    expect(outside.outside, true)
    expect(s.refreshed, 2, 'ring unchanged')
    expect(s.total, 699)
  },

  'progress never exceeds the outdated total'() {
    const s = select({ ids: ['discounted', 'flat', 'zero', 'outside'], member: true })
    // 4 (membership) + 2 + 1 + 0 + 0 + 2 (prepaid) = 9, capped at 6.
    expect(s.refreshed, 6)
    expect(s.remaining, 0)
    expect(s.fraction, 1)
  },

  'panel-derived contribution is used when no count is given'() {
    const s = select({
      payload: {
        ...BASE_PAYLOAD,
        membership: undefined,
        products: [{ id: 'panelA', name: 'Panel A retest', price: 100, covers: { panels: ['a'] } }],
      },
      ids: ['panelA'],
    })
    const item = s.products.find((p) => p.id === 'panelA')
    expect(item.markerCount, 4, 'Panel A has 4 outdated markers')
    expect(s.refreshed, 4)
  },

  'overlapping panel-derived items are not double counted'() {
    const s = select({
      payload: {
        ...BASE_PAYLOAD,
        membership: undefined,
        products: [
          { id: 'x', name: 'X', price: 100, covers: { panels: ['a'] } },
          { id: 'y', name: 'Y', price: 100, covers: { panels: ['a', 'b'] } },
        ],
      },
      ids: ['x', 'y'],
    })
    expect(s.refreshed, 6, 'union of both, not 4 + 6')
  },
}

// ------------------------------------------------------------------ tiny harness

let failures = []

function expect(actual, wanted, note) {
  const ok = JSON.stringify(actual) === JSON.stringify(wanted)
  if (!ok) failures.push(`got ${JSON.stringify(actual)}, wanted ${JSON.stringify(wanted)}${note ? ` — ${note}` : ''}`)
}

export function run() {
  const results = []
  let passed = 0

  for (const [name, fn] of Object.entries(CASES)) {
    failures = []
    try {
      fn()
    } catch (error) {
      failures.push(`threw: ${error.message}`)
    }
    if (failures.length === 0) {
      passed += 1
      results.push({ name, ok: true })
    } else {
      results.push({ name, ok: false, failures: [...failures] })
    }
  }

  return { passed, total: results.length, results, ok: passed === results.length }
}
