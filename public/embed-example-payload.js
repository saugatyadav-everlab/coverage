/**
 * Fixtures for the test console — three profile sizes.
 *
 * See src/data/schema.js for the full field reference. Nothing here is special:
 * these are ordinary payloads, built by hand from the marker library below so
 * the three sizes stay realistic rather than synthetic.
 */

// Marker names. The first six panels are the ones from the comps; the last four
// are standard clinical panels added so the larger profiles have real names to
// draw on — swap them for Everlab's actual panel content.
const LIBRARY = {
  hormone: {
    name: 'Hormone panel',
    lastTested: '2024-04-15',
    markers: [
      'Testosterone (total)', 'Free testosterone', 'SHBG', 'DHEA-S', 'Oestradiol',
      'Progesterone', 'LH', 'FSH', 'Prolactin', 'TSH', 'Free T4', 'Free T3',
      'Reverse T3', 'TPO antibodies', 'Thyroglobulin antibodies', 'Cortisol (AM)',
      'IGF-1', 'Aldosterone',
    ],
  },
  cardiovascular: {
    name: 'Cardiovascular panel',
    lastTested: '2025-06-10',
    markers: [
      'Total cholesterol', 'LDL-C', 'HDL-C', 'Non-HDL-C', 'Triglycerides', 'ApoB',
      'ApoA1', 'Lp(a)', 'LDL particle number', 'HDL particle number',
      'Small dense LDL', 'Remnant cholesterol', 'VLDL cholesterol',
      'Cholesterol / HDL ratio', 'Triglyceride / HDL ratio', 'Oxidised LDL',
      'hs-CRP', 'Homocysteine', 'Fibrinogen', 'Lp-PLA2', 'Myeloperoxidase',
      'TMAO', 'ADMA', 'Galectin-3', 'NT-proBNP', 'Troponin I',
    ],
  },
  micronutrient: {
    name: 'Micronutrient panel',
    lastTested: '2025-06-10',
    markers: [
      'Vitamin D', 'Vitamin B12', 'Active B12', 'Folate', 'Iron', 'Ferritin',
      'Transferrin saturation', 'TIBC', 'Zinc', 'Copper', 'Selenium',
      'Magnesium (RBC)', 'Vitamin A', 'Vitamin E', 'Vitamin B1', 'Vitamin B6',
      'Iodine', 'Omega-3 index', 'Omega-6 : 3 ratio', 'Vitamin K1',
    ],
  },
  metabolic: {
    name: 'Metabolic panel',
    lastTested: '2026-02-14',
    markers: [
      'Glucose (fasting)', 'HbA1c', 'Fasting insulin', 'HOMA-IR', 'C-peptide',
      'Sodium', 'Potassium', 'Chloride', 'Bicarbonate', 'Calcium', 'Phosphate',
      'Magnesium (serum)',
    ],
  },
  fbc: {
    name: 'Full blood count',
    lastTested: '2026-02-14',
    markers: [
      'Haemoglobin', 'Haematocrit', 'Red cell count', 'MCV', 'MCH', 'MCHC', 'RDW',
      'Platelets', 'MPV', 'White cell count', 'Neutrophils', 'Lymphocytes',
      'Monocytes', 'Eosinophils', 'Basophils', 'ESR', 'Reticulocytes',
      'Immature granulocytes',
    ],
  },
  renalhepatic: {
    name: 'Kidney & liver panel',
    lastTested: '2026-02-14',
    markers: [
      'ALT', 'AST', 'ALP', 'GGT', 'Total bilirubin', 'Albumin', 'Total protein',
      'Globulin', 'Creatinine', 'eGFR', 'Urea', 'Cystatin C', 'Uric acid',
      'Urine albumin / creatinine',
    ],
  },
  immune: {
    name: 'Immune & inflammation panel',
    lastTested: '2024-04-15',
    markers: [
      'IL-6', 'TNF-alpha', 'ANA', 'Rheumatoid factor', 'Anti-CCP',
      'Complement C3', 'Complement C4', 'Immunoglobulin A', 'Immunoglobulin G',
      'Immunoglobulin M',
    ],
  },
  urinalysis: {
    name: 'Urinalysis',
    lastTested: '2024-11-02',
    markers: [
      'Urine protein', 'Urine glucose', 'Urine ketones', 'Urine blood',
      'Urine leukocytes', 'Urine nitrites', 'Urine pH', 'Urine specific gravity',
      'Urine microalbumin', 'Urine creatinine',
    ],
  },
  tumour: {
    name: 'Tumour marker panel',
    lastTested: '2024-11-02',
    markers: ['PSA (total)', 'PSA (free)', 'CA 125', 'CA 19-9', 'CEA', 'AFP', 'CA 15-3', 'Beta-2 microglobulin'],
  },
  metals: {
    name: 'Heavy metals panel',
    lastTested: '2023-09-20',
    markers: [
      'Lead', 'Mercury', 'Arsenic', 'Cadmium', 'Aluminium', 'Nickel', 'Thallium',
      'Antimony', 'Barium', 'Caesium', 'Uranium', 'Tin',
    ],
  },
}

/**
 * Spread `outdatedTotal` and `neverTotal` across the given panels in proportion
 * to their size, then top up from whichever panels still have room so the totals
 * land exactly on target regardless of rounding.
 */
function buildPanels(ids, outdatedTotal, neverTotal) {
  const size = (id) => LIBRARY[id].markers.length
  const capacity = ids.reduce((n, id) => n + size(id), 0)

  const share = (total) => {
    const counts = ids.map((id) => Math.min(size(id), Math.floor((total * size(id)) / capacity)))
    let shortfall = total - counts.reduce((a, b) => a + b, 0)
    for (let i = 0; shortfall > 0 && i < ids.length; i += 1) {
      const room = size(ids[i]) - counts[i]
      const take = Math.min(room, shortfall)
      counts[i] += take
      shortfall -= take
    }
    return counts
  }

  const outdated = share(outdatedTotal)
  // Never-tested markers have to fit in whatever each panel has left.
  let neverLeft = neverTotal
  const never = ids.map((id, i) => {
    const room = size(id) - outdated[i]
    const take = Math.min(room, Math.ceil(neverLeft / (ids.length - i)))
    neverLeft -= take
    return take
  })

  return ids.map((id, i) => {
    const all = LIBRARY[id].markers
    const cut = outdated[i]
    const end = cut + never[i]
    return {
      id,
      name: LIBRARY[id].name,
      lastTested: LIBRARY[id].lastTested,
      markers: { outdated: all.slice(0, cut), never: all.slice(cut, end), current: all.slice(end) },
    }
  })
}

const AT_RISK = [
  { name: 'ApoB', value: 1.28, unit: 'g/L', lastTested: '2025-06-10', status: 'outdated', verdict: 'out-of-range', position: 0.84 },
  { name: 'Free T3', value: 2.9, unit: 'pmol/L', lastTested: '2024-04-15', status: 'outdated', verdict: 'out-of-range', position: 0.11 },
  { name: 'Serum alkaline phosphatase (ALP)', value: 118, unit: 'U/L', lastTested: '2025-06-10', status: 'current', verdict: 'suboptimal', position: 0.62 },
]

const PERKS = [
  'Blood test covering 40+ health markers across heart, organs, metabolism and more',
  'Biological age recalculated and historical reports retrieved',
  'Always-on access to the Everlab AI health copilot',
  'Member pricing on everything below',
]

const membership = (markers) => ({
  id: 'baseline',
  name: 'Baseline Membership',
  description: 'Bring most of your markers up to date.',
  price: 299,
  priceNote: 'per year',
  image: '/assets/member-card.png',
  markers,
  perks: PERKS,
})

const photo = (id) => `https://images.unsplash.com/photo-${id}?w=240&h=240&fit=crop`

// Already booked: locked, never charged, and in the progress ring from load.
const VO2 = {
  id: 'vo2',
  name: 'VO2 Max & Physical Assessment',
  why: 'Recommended retesting every year',
  price: 399,
  memberPrice: 299,
  image: photo('1461896836934-ffe607ba8211'),
  status: 'paid',
  markers: 8,
}

const DEXA = {
  id: 'dexa',
  name: 'DEXA Body Composition & Bone Density Scan',
  why: 'Recommended for your age',
  price: 499,
  memberPrice: 399,
  image: photo('1579165466991-467135ad3110'),
  markers: 16,
}

const HORMONE = {
  id: 'hormone-retest',
  name: 'Hormone & Thyroid Panel',
  price: 249,
  memberPrice: 199,
  image: photo('1532187863486-abf9dbad1b69'),
  markers: 18,
}

const METALS = {
  id: 'metals',
  name: 'Heavy Metals Screen',
  price: 349,
  memberPrice: 279,
  image: photo('1581595220892-b0739db3ba8c'),
  markers: 12,
}

// Big profile only: recommended, but a first-time test rather than a retest, so
// it contributes nothing to the outdated pile.
const CALCIUM = {
  id: 'calcium',
  name: 'Heart Risk Snapshot (CT Calcium Score)',
  why: 'Never tested',
  price: 699,
  memberPrice: 599,
  image: photo('1530026405186-ed1f139313f8'),
  recommended: true,
  contributesToProgress: false,
  markers: 4,
}

const profile = ({ panels, outdated, never, bioAgeKnown, membershipMarkers, products }) => ({
  v: 1,
  currency: 'AUD',
  locale: 'en-AU',
  profile: { tracked: undefined, lastTested: '2026-02-14', bioAge: 42, bioAgeKnown },
  panels: buildPanels(panels, outdated, never),
  atRisk: AT_RISK,
  membership: membership(membershipMarkers),
  products,
})

export const PROFILES = {
  'Small — 60 markers to refresh': profile({
    panels: ['hormone', 'cardiovascular', 'micronutrient', 'metabolic', 'fbc', 'renalhepatic'],
    outdated: 60,
    never: 4,
    bioAgeKnown: false,
    membershipMarkers: 40,
    // Simplest case: nothing prepaid, nothing non-contributing.
    products: [DEXA, HORMONE],
  }),

  'Medium — 88 markers to refresh': profile({
    panels: [
      'hormone', 'cardiovascular', 'micronutrient', 'metabolic', 'fbc',
      'renalhepatic', 'immune', 'urinalysis',
    ],
    outdated: 88,
    never: 6,
    bioAgeKnown: false,
    membershipMarkers: 55,
    // Adds a prepaid item.
    products: [VO2, DEXA, HORMONE],
  }),

  'Big — 130 markers to refresh': profile({
    panels: [
      'hormone', 'cardiovascular', 'micronutrient', 'metabolic', 'fbc',
      'renalhepatic', 'immune', 'urinalysis', 'tumour', 'metals',
    ],
    outdated: 130,
    never: 8,
    bioAgeKnown: false,
    membershipMarkers: 80,
    // Adds a recommended item that contributes nothing to the outdated pile.
    products: [VO2, DEXA, HORMONE, METALS, CALCIUM],
  }),
}

/** Default fixture. */
export const PAYLOAD = PROFILES['Small — 60 markers to refresh']
