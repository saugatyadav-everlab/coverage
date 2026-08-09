/**
 * Example payload for embed-example.html — a compact, hand-written instance of
 * the wire format. See src/data/schema.js for the full field reference, and
 * src/data/demo.js for a larger example (108 markers across 6 panels).
 */
export const PAYLOAD = {
  v: 1,
  currency: 'AUD',
  locale: 'en-AU',

  profile: {
    tracked: 34,
    lastTested: '2026-02-14',
    bioAge: 42,
    // Too much data has aged out to trust the number — render it blurred.
    bioAgeKnown: false,
  },

  panels: [
    {
      id: 'hormone',
      name: 'Hormone panel',
      lastTested: '2024-04-15',
      markers: {
        outdated: ['Testosterone (total)', 'Free testosterone', 'SHBG', 'DHEA-S', 'Oestradiol', 'TSH', 'Free T4', 'Free T3'],
        never: ['Reverse T3'],
        current: ['Prolactin'],
      },
    },
    {
      id: 'cardiovascular',
      name: 'Cardiovascular panel',
      lastTested: '2025-06-10',
      markers: {
        outdated: ['Total cholesterol', 'LDL-C', 'HDL-C', 'Triglycerides', 'ApoB', 'Lp(a)'],
        never: ['Oxidised LDL', 'Lp-PLA2'],
        current: ['hs-CRP', 'Homocysteine', 'Fibrinogen', 'ApoA1'],
      },
    },
    {
      id: 'metabolic',
      name: 'Metabolic panel',
      lastTested: '2026-02-14',
      markers: {
        outdated: ['Fasting insulin', 'HOMA-IR'],
        never: ['C-peptide'],
        current: ['Glucose (fasting)', 'HbA1c', 'Sodium', 'Potassium', 'Calcium'],
      },
    },
  ],

  atRisk: [
    { name: 'ApoB', value: 1.28, unit: 'g/L', lastTested: '2025-06-10', status: 'outdated', verdict: 'out-of-range', position: 0.84 },
    { name: 'Free T3', value: 2.9, unit: 'pmol/L', lastTested: '2024-04-15', status: 'outdated', verdict: 'out-of-range', position: 0.11 },
    { name: 'Serum alkaline phosphatase (ALP)', value: 118, unit: 'U/L', lastTested: '2025-06-10', status: 'current', verdict: 'suboptimal', position: 0.62 },
  ],

  membership: {
    id: 'baseline',
    name: 'Baseline Membership',
    description: 'Bring most of your markers up to date.',
    price: 299,
    priceNote: 'per year',
    image: '/assets/member-card.png',
    // How many outdated markers this brings back. The page turns it into
    // "8 of 16 outdated markers · 50%" — don't send a percentage.
    markers: 8,
    perks: [
      'Blood test covering 40+ health markers across heart, organs, metabolism and more',
      'Biological age recalculated and historical reports retrieved',
      'Always-on access to the Everlab AI health copilot',
      'Member pricing on everything below',
    ],
  },

  // The three shapes the Refresh page has to handle.
  products: [
    {
      // Selectable, contributes markers.
      id: 'hormone-panel',
      name: 'Hormone & Thyroid Panel',
      price: 249,
      memberPrice: 199,
      image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=240&h=240&fit=crop',
      markers: 8,
    },
    {
      // Already paid for: locked, and its contribution is in the progress ring
      // from first paint.
      id: 'vo2',
      name: 'VO2 Max & Physical Assessment',
      why: 'Recommended retesting every year',
      price: 399,
      memberPrice: 299,
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=240&h=240&fit=crop',
      status: 'paid',
      markers: 4,
    },
    {
      // Recommended, but contributes nothing to the outdated pile — it's a new
      // test rather than a retest, so the ring doesn't move.
      id: 'calcium',
      name: 'Heart Risk Snapshot (CT Calcium Score)',
      why: 'Never tested',
      price: 699,
      memberPrice: 599,
      image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=240&h=240&fit=crop',
      recommended: true,
      contributesToProgress: false,
      markers: 4,
    },
  ],
}
