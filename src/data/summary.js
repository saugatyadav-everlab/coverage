import { AT_HOME } from './atHome'

/**
 * The summary line items, in display order.
 *
 * Already-paid items come first and stay put. They are settled facts rather
 * than part of what the member is assembling now, so anchoring them at the top
 * means the list grows downward as things are ticked, instead of shoving the
 * prepaid row further down with every selection.
 */
export function summaryLines(selection, membership, money) {
  const { chosen, paid, isMember, atHomeCharged } = selection

  return [
    ...paid.map((product) => ({ key: product.id, name: product.name, price: 'Paid', paid: true })),
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
}
