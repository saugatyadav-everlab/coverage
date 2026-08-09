/**
 * Demo payload — the same numbers as the original design comps.
 *
 * Used only when no payload arrives (standalone `npm run dev`, or the page
 * opened outside an iframe with no `?d=`). Embedding apps never see this.
 * It doubles as a worked example of the wire format.
 */

const photo = (id, size = 200) =>
  `https://images.unsplash.com/photo-${id}?w=${size}&h=${size}&fit=crop`

const PANEL_MARKERS = {
  hormone: [
    'Testosterone (total)', 'Free testosterone', 'SHBG', 'DHEA-S', 'Oestradiol',
    'Progesterone', 'LH', 'FSH', 'Prolactin', 'TSH', 'Free T4', 'Free T3',
    'Reverse T3', 'TPO antibodies', 'Thyroglobulin antibodies', 'Cortisol (AM)',
    'IGF-1', 'Aldosterone',
  ],
  cardiovascular: [
    'Total cholesterol', 'LDL-C', 'HDL-C', 'Non-HDL-C', 'Triglycerides', 'ApoB',
    'ApoA1', 'Lp(a)', 'LDL particle number', 'HDL particle number',
    'Small dense LDL', 'Remnant cholesterol', 'VLDL cholesterol',
    'Cholesterol / HDL ratio', 'Triglyceride / HDL ratio', 'Oxidised LDL',
    'hs-CRP', 'Homocysteine', 'Fibrinogen', 'Lp-PLA2', 'Myeloperoxidase',
    'TMAO', 'ADMA', 'Galectin-3', 'NT-proBNP', 'Troponin I',
  ],
  micronutrient: [
    'Vitamin D', 'Vitamin B12', 'Active B12', 'Folate', 'Iron', 'Ferritin',
    'Transferrin saturation', 'TIBC', 'Zinc', 'Copper', 'Selenium',
    'Magnesium (RBC)', 'Vitamin A', 'Vitamin E', 'Vitamin B1', 'Vitamin B6',
    'Iodine', 'Omega-3 index', 'Omega-6 : 3 ratio', 'Vitamin K1',
  ],
  metabolic: [
    'Glucose (fasting)', 'HbA1c', 'Fasting insulin', 'HOMA-IR', 'C-peptide',
    'Sodium', 'Potassium', 'Chloride', 'Bicarbonate', 'Calcium', 'Phosphate',
    'Magnesium (serum)',
  ],
  fbc: [
    'Haemoglobin', 'Haematocrit', 'Red cell count', 'MCV', 'MCH', 'MCHC', 'RDW',
    'Platelets', 'MPV', 'White cell count', 'Neutrophils', 'Lymphocytes',
    'Monocytes', 'Eosinophils', 'Basophils', 'ESR', 'Reticulocytes',
    'Immature granulocytes',
  ],
  renalhepatic: [
    'ALT', 'AST', 'ALP', 'GGT', 'Total bilirubin', 'Albumin', 'Total protein',
    'Globulin', 'Creatinine', 'eGFR', 'Urea', 'Cystatin C', 'Uric acid',
    'Urine albumin / creatinine',
  ],
}

/** Split a panel's markers into the grouped wire form. */
const split = (id, outdated, never) => {
  const all = PANEL_MARKERS[id]
  return {
    outdated: all.slice(0, outdated),
    never: all.slice(outdated, outdated + never),
    current: all.slice(outdated + never),
  }
}

const PANEL_SPECS = [
  { id: 'hormone', name: 'Hormone panel', outdated: 18, never: 0, lastTested: '2024-04-15' },
  { id: 'cardiovascular', name: 'Cardiovascular panel', outdated: 18, never: 4, lastTested: '2025-06-10' },
  { id: 'micronutrient', name: 'Micronutrient panel', outdated: 14, never: 2, lastTested: '2025-06-10' },
  { id: 'metabolic', name: 'Metabolic panel', outdated: 6, never: 1, lastTested: '2026-02-14' },
  { id: 'fbc', name: 'Full blood count', outdated: 5, never: 2, lastTested: '2026-02-14' },
  { id: 'renalhepatic', name: 'Kidney & liver panel', outdated: 3, never: 1, lastTested: '2026-02-14' },
]

export const DEMO_PAYLOAD = {
  v: 1,
  currency: 'AUD',
  locale: 'en-AU',

  profile: {
    tracked: 108,
    lastTested: '2026-02-14',
    bioAge: 42,
    bioAgeKnown: false,
  },

  panels: PANEL_SPECS.map((p) => ({
    id: p.id,
    name: p.name,
    lastTested: p.lastTested,
    markers: split(p.id, p.outdated, p.never),
  })),

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
    markers: 40, // the contribution — the page derives 40/64 = 63% from this
    perks: [
      'Blood test covering 40+ health markers across heart, organs, metabolism and more',
      'Biological age recalculated and historical reports retrieved',
      'Always-on access to the Everlab AI health copilot',
      'Member pricing on everything below',
    ],
  },

  // Each item states its own contribution. The three shapes the Refresh page
  // has to handle are all represented here:
  //   vo2      — already paid for, so it's in the ring from first paint
  //   dexa     — selectable, contributes 16 markers
  //   calcium  — recommended but contributes nothing to the outdated pile
  products: [
    {
      id: 'vo2',
      name: 'VO2 Max & Physical Assessment',
      why: 'Recommended retesting every year',
      price: 399,
      memberPrice: 299,
      image: photo('1461896836934-ffe607ba8211', 240),
      status: 'paid',
      markers: 8,
    },
    {
      id: 'dexa',
      name: 'DEXA Body Composition & Bone Density Scan',
      why: 'Recommended for your age',
      price: 499,
      memberPrice: 399,
      image: photo('1579165466991-467135ad3110', 240),
      markers: 16,
    },
    {
      id: 'calcium',
      name: 'Heart Risk Snapshot (CT Calcium Score)',
      why: 'Never tested',
      price: 699,
      memberPrice: 599,
      image: photo('1530026405186-ed1f139313f8', 240),
      recommended: true,
      contributesToProgress: false,
      markers: 4,
    },
  ],
}
