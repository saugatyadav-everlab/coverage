/**
 * At-home blood draw — an option belonging to the Baseline plan rather than a
 * product in its own right, so it lives here rather than in the payload.
 *
 * It appears inside the Baseline card, below the price footer, and is revealed
 * only once the plan is selected. It's a delivery choice, not a test: it adds
 * to the total but contributes nothing to the outdated-marker count, so the
 * coverage ring doesn't move when it's ticked.
 *
 * NOTE: the price is hardcoded here. Lift it into the payload (e.g.
 * `membership.atHome`) if it ever needs to vary by member or change without a
 * deploy.
 */
export const AT_HOME = {
  // Hidden for now. Nothing else is stripped: flipping this back to true
  // restores the row, the charge and the summary line as they were.
  enabled: false,
  id: 'at-home-draw',
  // Full name on the card; the shorter label is what the summary lists, where
  // the row has to sit alongside product names in a narrow column.
  name: 'Get your blood drawn at home',
  summaryName: 'At-home pathology',
  description: 'Skip the clinic and waiting.',
  price: 75,
}
