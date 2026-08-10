/**
 * Fixtures for the test console — three profile sizes.
 *
 * See src/data/schema.js for the full field reference. Nothing here is special:
 * these are ordinary payloads, built by hand from the panel library below so the
 * three sizes stay realistic rather than synthetic.
 */

/**
 * An ISO date `n` months before today.
 *
 * The rows show relative time ("14 months ago"), so fixed dates would drift —
 * a fixture written today reads as "5 months ago" and, six months from now, as
 * "11 months ago". Deriving them keeps every preset lapsed no matter when it is
 * opened. The payload still carries plain ISO dates, exactly as a host sends.
 */
function monthsBack(n) {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d.toISOString().slice(0, 10)
}

/**
 * Panel names are Everlab's official ones. Which markers sit under each is my
 * grouping, not a clinical mapping — correct it against the real panel
 * definitions before this gets shown as anything but layout.
 */
const LIBRARY = {
  heart: {
    name: 'Heart Health',
    months: 14,
    markers: [
      'Total cholesterol', 'LDL-C', 'HDL-C', 'Non-HDL-C', 'Triglycerides', 'ApoB',
      'ApoA1', 'Lp(a)', 'LDL particle number', 'HDL particle number',
      'Small dense LDL', 'Remnant cholesterol', 'VLDL cholesterol',
      'Cholesterol / HDL ratio', 'Triglyceride / HDL ratio', 'Oxidised LDL',
      'Lp-PLA2', 'Myeloperoxidase', 'TMAO', 'ADMA', 'Galectin-3', 'NT-proBNP',
      'Troponin I', 'Homocysteine',
    ],
  },
  hormone: {
    name: 'Hormone Health',
    months: 27,
    markers: [
      'Testosterone (total)', 'Free testosterone', 'SHBG', 'DHEA-S', 'Oestradiol',
      'Progesterone', 'LH', 'FSH', 'Prolactin', 'TSH', 'Free T4', 'Free T3',
      'Reverse T3', 'Cortisol (AM)', 'IGF-1', 'Aldosterone',
    ],
  },
  blood: {
    name: 'Blood and Bone Marrow Function',
    months: 13,
    markers: [
      'Haemoglobin', 'Haematocrit', 'Red cell count', 'MCV', 'MCH', 'MCHC', 'RDW',
      'Platelets', 'MPV', 'White cell count', 'Neutrophils', 'Lymphocytes',
      'Monocytes', 'Eosinophils', 'Basophils', 'Reticulocytes',
      'Immature granulocytes',
    ],
  },
  nutrition: {
    name: 'Nutrition',
    months: 15,
    markers: [
      'Vitamin D', 'Vitamin B12', 'Active B12', 'Folate', 'Zinc', 'Copper',
      'Selenium', 'Magnesium (RBC)', 'Vitamin A', 'Vitamin E', 'Vitamin B1',
      'Vitamin B6', 'Vitamin K1', 'Iodine', 'Omega-3 index', 'Omega-6 : 3 ratio',
    ],
  },
  metabolic: {
    name: 'Metabolic Function',
    months: 13,
    markers: ['Glucose (fasting)', 'HbA1c', 'Fasting insulin', 'HOMA-IR', 'C-peptide'],
  },
  liver: {
    name: 'Liver Function',
    months: 14,
    markers: ['ALT', 'AST', 'ALP', 'GGT', 'Total bilirubin', 'Albumin', 'Total protein', 'Globulin'],
  },
  kidney: {
    name: 'Kidney Function',
    months: 14,
    markers: ['Creatinine', 'eGFR', 'Urea', 'Cystatin C', 'Uric acid', 'Urine albumin / creatinine'],
  },
  electrolytes: {
    name: 'Electrolytes',
    months: 13,
    markers: ['Sodium', 'Potassium', 'Chloride', 'Bicarbonate', 'Calcium', 'Phosphate', 'Magnesium (serum)'],
  },
  iron: {
    name: 'Iron Studies',
    months: 15,
    markers: ['Iron', 'Ferritin', 'Transferrin saturation', 'TIBC'],
  },
  inflammation: {
    name: 'Inflammation',
    months: 16,
    markers: ['hs-CRP', 'ESR', 'Fibrinogen', 'IL-6', 'TNF-alpha'],
  },
  autoimmunity: {
    name: 'Autoimmunity',
    months: 27,
    markers: [
      'ANA', 'Rheumatoid factor', 'Anti-CCP', 'TPO antibodies',
      'Thyroglobulin antibodies', 'Complement C3', 'Complement C4',
      'Immunoglobulin A', 'Immunoglobulin G',
    ],
  },
  cancer: {
    name: 'Cancer Detection',
    months: 21,
    markers: ['PSA (total)', 'PSA (free)', 'CA 125', 'CA 19-9', 'CEA', 'AFP', 'CA 15-3', 'Beta-2 microglobulin'],
  },
  metals: {
    name: 'Heavy Metals',
    months: 34,
    markers: [
      'Lead', 'Mercury', 'Arsenic', 'Cadmium', 'Aluminium', 'Nickel', 'Thallium',
      'Antimony', 'Barium', 'Caesium', 'Uranium', 'Tin',
    ],
  },
  gut: {
    name: 'Gut Health',
    months: 21,
    markers: [
      'Faecal calprotectin', 'Pancreatic elastase', 'Secretory IgA',
      'H. pylori antigen', 'Faecal occult blood', 'Zonulin',
    ],
  },
  bone: {
    name: 'Bone Health',
    months: 24,
    markers: ['Parathyroid hormone', 'Bone-specific ALP', 'Osteocalcin', 'C-telopeptide (CTX)'],
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
      lastTested: monthsBack(LIBRARY[id].months),
      markers: { outdated: all.slice(0, cut), never: all.slice(cut, end), current: all.slice(end) },
    }
  })
}

// Dates match the panel each marker belongs to, so the two sections tell the
// same story. All three are stale, since every panel here is past a year.
const AT_RISK = [
  { name: 'ApoB', value: 1.28, unit: 'g/L', lastTested: monthsBack(LIBRARY.heart.months), status: 'outdated', verdict: 'out-of-range', position: 0.84 },
  { name: 'Free T3', value: 2.9, unit: 'pmol/L', lastTested: monthsBack(LIBRARY.hormone.months), status: 'outdated', verdict: 'out-of-range', position: 0.11 },
  { name: 'Serum alkaline phosphatase (ALP)', value: 118, unit: 'U/L', lastTested: monthsBack(LIBRARY.liver.months), status: 'outdated', verdict: 'suboptimal', position: 0.62 },
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
  // How many outdated markers this brings back. The page turns it into a
  // percentage and a ring — don't send a percentage.
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

/** The member's own last test is the most recent panel they have. */
const newestOf = (ids) => Math.min(...ids.map((id) => LIBRARY[id].months))

const profile = ({ panels, outdated, never, bioAgeKnown, membershipMarkers, products }) => ({
  v: 1,
  currency: 'AUD',
  locale: 'en-AU',
  profile: { lastTested: monthsBack(newestOf(panels)), bioAge: 42, bioAgeKnown },
  panels: buildPanels(panels, outdated, never),
  atRisk: AT_RISK,
  membership: membership(membershipMarkers),
  products,
})

const SMALL = ['heart', 'hormone', 'blood', 'nutrition', 'metabolic', 'liver', 'kidney', 'electrolytes']
const MEDIUM = [...SMALL, 'iron', 'inflammation']
const BIG = [...MEDIUM, 'autoimmunity', 'cancer', 'metals', 'gut', 'bone']

export const PROFILES = {
  'Small — 60 markers to refresh': profile({
    panels: SMALL,
    outdated: 60,
    never: 4,
    bioAgeKnown: false,
    membershipMarkers: 40,
    // Simplest case: nothing prepaid, nothing non-contributing.
    products: [DEXA, HORMONE],
  }),

  'Medium — 88 markers to refresh': profile({
    panels: MEDIUM,
    outdated: 88,
    never: 6,
    bioAgeKnown: false,
    membershipMarkers: 55,
    // Adds a prepaid item.
    products: [VO2, DEXA, HORMONE],
  }),

  'Big — 130 markers to refresh': profile({
    panels: BIG,
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
