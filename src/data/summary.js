import { AT_HOME } from './atHome'

/**
 * The summary line items, in display order.
 *
 * Already-paid items come first and stay put. They are settled facts rather
 * than part of what the member is assembling now, so anchoring them at the top
 * means the list grows downward as things are ticked, instead of shoving the
 * prepaid row further down with every selection.
 *
 * Everything below them — the plan, the at-home draw and the add-ons alike —
 * follows the order it was picked in. `order` is the sequence of selection
 * keys; anything missing from it falls back to the order built here.
 */
export function summaryLines(selection, membership, money, order = []) {
  const { chosen, paid, isMember, atHomeCharged } = selection

  const added = [
    ...(isMember && membership
      ? [{ key: 'membership', name: membership.name, price: money(membership.price), paid: false }]
      : []),
    ...(atHomeCharged ? [{ key: AT_HOME.id, name: AT_HOME.summaryName, price: money(AT_HOME.price), paid: false }] : []),
    ...chosen.map((product) => ({
      key: product.id,
      name: product.name,
      price: money(selection.priceOf(product)),
      paid: false,
    })),
  ]

  const rank = (line) => {
    const index = order.indexOf(line.key)
    return index === -1 ? Number.MAX_SAFE_INTEGER : index
  }
  added.sort((a, b) => rank(a) - rank(b))

  return [...paid.map((product) => ({ key: product.id, name: product.name, price: 'Paid', paid: true })), ...added]
}
