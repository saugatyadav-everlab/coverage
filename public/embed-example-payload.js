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
 * Everlab's real panels and the markers under each.
 *
 * A marker can legitimately appear in more than one panel — ALT sits under both
 * Liver Function and Cancer Detection, Serum Ferritin under both Hormone Health
 * and Iron Studies — so the totals here are per-panel, not a distinct set.
 *
 * Only some of these are used by the three presets; the rest are here to swap in.
 */
const LIBRARY = {
  heart: {
    name: 'Heart Health',
    months: 14,
    markers: [
      'Apolipoprotein B', 'CT coronary angiogram (CTCA)', 'Diastolic Blood Pressure Profiling',
      'HDL Cholesterol', 'High Sensitivity C-Reactive Protein', 'LDL Cholesterol',
      'Lipoprotein (a) / Lp (a)', 'Non-HDL Cholesterol', 'Serum Triglycerides',
      'Systolic Blood Pressure Profiling', 'Total Cholesterol', 'CT Calcium Score',
      'Homocysteine', 'ApoB:LDL-C Ratio', 'Remnant Cholesterol', 'AIP (Atherogenic Index)',
      'MHR (Monocyte:HDL Ratio)', 'CAR (CRP:Albumin Ratio)',
    ],
  },
  hormone: {
    name: 'Hormone Health',
    months: 27,
    markers: [
      'Estradiol', 'Progesterone', 'LH/FSH Ratio', 'Luteinizing Hormone (LH)',
      'Follicle-Stimulating Hormone (FSH)', 'Prolactin', 'Free Testosterone',
      'Total Testosterone', 'Free Androgen Index (FAI)', 'DHEAS', 'Cortisol',
      'Sex Hormone-Binding Globulin level (SHBG)', 'Parathyroid Hormone (PTH)', 'ACTH',
      'Serum Ferritin', 'Serum Transferrin', 'Total Iron-Binding Capacity (TIBC)',
    ],
  },
  metabolic: {
    name: 'Metabolic Function',
    months: 13,
    markers: [
      'Estimated Average Glucose', 'Fasting Glucose', 'Fasting Insulin', 'HbA1c (IFCC)',
      'HbA1c (NGSP)', 'Uric Acid', 'HOMA-IR', 'FIB-4', 'AST:ALT Ratio', 'GGT:HDL Ratio',
    ],
  },
  liver: {
    name: 'Liver Function',
    months: 14,
    markers: [
      'Alanine Aminotransferase (ALT)', 'Alkaline Phosphatase (ALP)',
      'Aspartate Transaminase (AST)', 'Gamma-GT', 'Serum Albumin', 'Serum Bilirubin',
      'Serum Globulin', 'Total Serum Protein',
    ],
  },
  cancer: {
    name: 'Cancer Detection',
    months: 21,
    markers: [
      'Cancer Antigen 125', 'Colonoscopy', 'Full Body MRI', 'Gastroscopy',
      'Lung CT chest', 'Ultrasound', 'Comprehensive Skin Check', 'C-Reactive Protein',
      'Prostate Specific Antigen (PSA)', 'Alanine Aminotransferase (ALT)',
      'CT Chest Lung Cancer Screening',
    ],
  },
  nutrition: {
    name: 'Nutrition',
    months: 15,
    markers: [
      'Food Diary Analysis', 'Magnesium', 'Nutrition Optimisation Advice',
      'Continuous Glucose Monitoring (CGM)', 'Folate', 'Serum Calcium',
      'Corrected Calcium', 'Phosphate', 'Active B12',
    ],
  },
  gut: {
    name: 'Gut Health',
    months: 21,
    markers: [
      'Microbial richness', 'Mucin consuming microbes', 'Oral species',
      'Oxalate consuming microbes', 'Propionate producing microbes',
      'TMA producing microbes', 'Faecal occult blood', 'Calprotectin', 'Lactoferrin',
      'Pancreatic elastase', 'Secretory IgA', 'Zonulin', 'Faecal pH',
      'Aeromonas spp.', 'Campylobacter spp.', 'Clostridium difficile toxin B',
      'Cryptosporidium spp.', 'Cyclospora cayetanensis', 'Dientamoeba fragilis',
      'E. coli O157', 'Entamoeba histolytica', 'EAEC', 'EPEC', 'ETEC',
      'Giardia lamblia', 'Hypervirulent Clostridium difficile', 'Salmonella spp.',
      'Shiga Toxin', 'Shigella spp. / EIEC', 'Vibrio spp.', 'Yersinia enterocolitica',
      'Acetate producing microbes', 'B.fragilis toxin producing microbes',
      'BCAA producing microbes', 'Beta-glucuronidase producing microbes',
      'Butyrate producing microbes',
      'Hexa-acylated lipopolysaccharide (hexa-LPS) producing microbes',
      'Hydrogen sulphide producing microbes', '3-IPA producing microbes',
      'Methane producing archaea', 'Microbial diversity',
    ],
  },
  blood: {
    name: 'Blood and Bone Marrow Function',
    months: 13,
    markers: [
      'Haematocrit', 'Haemoglobin', 'Mean Corpuscular Haemoglobin (MCH)',
      'Mean Corpuscular Haemoglobin Concentration (MCHC)',
      'Mean Corpuscular Volume (MCV)', 'Platelets', 'Red Cell Count',
      'Red Cell Distribution Width (RDW)',
    ],
  },
  kidney: {
    name: 'Kidney Function',
    months: 14,
    markers: [
      'Creatinine', 'Estimated Glomerular Filtration Rate (eGFR)', 'Urea', 'BUN',
      'BUN:Creatinine Ratio', 'SUA:Creatinine Ratio', 'Ca:Phosphate Ratio',
    ],
  },
  autoimmunity: {
    name: 'Autoimmunity',
    months: 16,
    markers: ['Basophils', 'Eosinophils', 'Lymphocytes', 'Monocytes', 'Neutrophils', 'Total White Cell Count'],
  },
  dexa: {
    name: 'Full Body Composition/DEXA',
    months: 18,
    markers: [
      'Android/Gynoid Ratio', 'Body Mass Index (BMI)', 'Estimated VAT Mass',
      'Estimated VAT Volume', 'Fat Free Mass Index (FFMI)', 'Fat Mass Index (FMI)',
      'Lean Mass of Arms', 'Lean Mass of Legs', 'Relative Skeletal Muscle Index (RSMI)',
      'Total Body % Fat', 'Total Fat Mass', 'Total Lean Mass',
      'Upper body lean mass asymmetry', 'Lower body lean mass asymmetry',
    ],
  },
  bone: {
    name: 'Bone Health',
    months: 24,
    markers: [
      'Femoral Neck Densities', 'Multi-level Lumbar Spine Densities',
      'Standardised Bone Density Comparisons', 'Total Body Bone Mineral Content',
      'Vitamin D',
    ],
  },
  muscle: {
    name: 'Muscle Health',
    months: 19,
    markers: [
      'Grip Strength', 'Isometric Squat', 'Balance Assessment',
      'Exercise Optimisation Plan', 'Counter Movement Jump (CMJ)',
    ],
  },
  genetic: {
    name: 'Genetic Health',
    months: 30,
    markers: ['Preventive Health Genetic Test', 'Pharmacogenetics Blood Test', 'DNA Methylation'],
  },
  allergies: {
    name: 'Allergies',
    months: 22,
    markers: ['Alternaria alternata', 'Cat Allergy', 'Dustmite', 'Rye Grass Pollen'],
  },
  metals: {
    name: 'Heavy Metals',
    months: 34,
    markers: ['Lead', 'Mercury', 'Zinc'],
  },
  electrolytes: {
    name: 'Electrolytes',
    months: 13,
    markers: ['Bicarbonate', 'Chloride', 'Potassium', 'Sodium'],
  },
  iron: {
    name: 'Iron Studies',
    months: 15,
    markers: ['Serum Iron', 'Transferrin Saturation', 'Serum Ferritin'],
  },
  inflammation: {
    name: 'Inflammation',
    months: 16,
    markers: ['ESR'],
  },
  bloodInflammation: {
    name: 'Blood & Inflammation',
    months: 13,
    markers: [
      'NLR (Neutrophil:Lymphocyte Ratio)', 'PLR (Platelet:Lymphocyte Ratio)',
      'SIRI (Systemic Inflammation Index)',
    ],
  },
  hormoneRatios: {
    name: 'Hormone Ratios',
    months: 27,
    markers: [
      'Cortisol:DHEA-S Ratio', 'T:Cortisol Ratio', 'FAI (Free Androgen Index)',
      'T:E2 Ratio (M only)', 'LH:FSH Ratio', 'Pg:E2 Ratio (F only)',
    ],
  },
  aerobic: { name: 'Aerobic Capacity', months: 19, markers: ['VO2 max'] },
  bioAge: { name: 'Biological Age', months: 27, markers: ['Biological Age'] },
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

// Real markers, dated to the panel each belongs to so the two sections tell the
// same story. All three are stale, since every panel here is past a year.
const AT_RISK = [
  { name: 'Apolipoprotein B', value: 1.28, unit: 'g/L', lastTested: monthsBack(LIBRARY.heart.months), status: 'outdated', verdict: 'out-of-range', position: 0.84 },
  { name: 'Total Testosterone', value: 8.4, unit: 'nmol/L', lastTested: monthsBack(LIBRARY.hormone.months), status: 'outdated', verdict: 'out-of-range', position: 0.11 },
  { name: 'Alkaline Phosphatase (ALP)', value: 118, unit: 'U/L', lastTested: monthsBack(LIBRARY.liver.months), status: 'outdated', verdict: 'suboptimal', position: 0.62 },
]

const PERKS = [
  'Blood test covering 40+ health markers across heart, organs, metabolism and more',
  'Biological age recalculated and historical reports retrieved',
  'Always-on access to the Everlab AI health copilot',
  'Member pricing on everything below',
]

/** Everlab's service artwork. */
const IMAGE = (id) =>
  `https://app.everlab.com.au/cdn-cgi/image/format=auto/https://everlab-public-images.s3.ap-southeast-2.amazonaws.com/airtable/${id}`

/** The blood test panel is a fixed size — it does not scale with the profile. */
const BLOOD_TEST_MARKERS = 40

const membership = (markers) => ({
  id: 'baseline',
  name: 'Baseline Membership',
  description: 'Bring most of your markers up to date.',
  price: 299,
  priceNote: 'per year',
  // Advanced Blood Testing — the card leads with the test, so this is its image.
  image: IMAGE('attOPA6uYbQnB7c1u'),
  // How many outdated markers this brings back. The page turns it into a
  // percentage and a ring — don't send a percentage.
  markers,
  perks: PERKS,
})

// Real services, with contributions sized to the panels each preset carries.
// A blood test can't refresh a DEXA scan or a stool sample, so the add-ons are
// what close the non-blood part of the gap.

// Already booked: locked, never charged, and in the progress ring from load.
const VO2 = {
  id: 'vo2',
  name: 'VO2 Max & Physical Assessment',
  why: 'Recommended retesting every year',
  price: 399,
  memberPrice: 299,
  image: IMAGE('attz3xIaHFHVhx5Vj'),
  status: 'paid',
  markers: 4,
}

const DEXA = {
  id: 'dexa',
  name: 'DEXA Body Composition & Bone Density Scan',
  why: 'Recommended for your age',
  price: 499,
  memberPrice: 399,
  image: IMAGE('attLrcVqxx4UMmTBA'),
  markers: 9,
}

const WBMRI = {
  id: 'wbmri',
  name: 'Whole Body MRI Screening (WBMRI)',
  why: 'Recommended retesting every year',
  price: 999,
  memberPrice: 849,
  image: IMAGE('att6oAYyhmwcMzs4C'),
  markers: 4,
}

const GUT = {
  id: 'gut',
  name: 'Microbiome & Gut Health Assessment',
  why: 'Recommended retesting every year',
  price: 349,
  memberPrice: 279,
  image: IMAGE('atthMpfkCA1tISA7H'),
  markers: 30,
}

// CT Calcium Score is itself a marker inside Heart Health, so this service does
// refresh something — a small, honest contribution rather than a flagged
// recommendation that moves nothing.
const CALCIUM = {
  id: 'calcium',
  name: 'Heart Risk Snapshot (CT Calcium Score)',
  why: 'Recommended for your age',
  price: 699,
  memberPrice: 599,
  image: IMAGE('attfY9fUJpaq0zyB1'),
  markers: 1,
}

// The genuinely non-contributing case: a genetic test is done once and for all,
// so it can never be part of an outdated pile. Recommended on its own merits.
const APOE = {
  id: 'apoe',
  name: 'ApoE Genetic Test',
  why: 'Never tested',
  price: 249,
  memberPrice: 199,
  image: IMAGE('attSVA4DWChdoOCLI'),
  recommended: true,
  contributesToProgress: false,
  markers: 1,
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

// Each size adds two panels to the one below it. Every preset carries at least
// one panel a blood test cannot refresh, so the add-ons have real work to do.
const SMALL = ['heart', 'hormone', 'metabolic', 'dexa']
const MEDIUM = [...SMALL, 'liver', 'cancer']
const BIG = [...MEDIUM, 'gut', 'muscle']

export const PROFILES = {
  'Small — 4 panels': profile({
    panels: SMALL,
    // Above the blood test's fixed 40, so even the smallest profile leaves the
    // add-on real work to do rather than claiming to refresh more than exists.
    outdated: 48,
    never: 3,
    bioAgeKnown: false,
    membershipMarkers: BLOOD_TEST_MARKERS,
    // Simplest case: nothing prepaid, nothing non-contributing.
    products: [DEXA],
  }),

  'Medium — 6 panels': profile({
    panels: MEDIUM,
    outdated: 52,
    never: 4,
    bioAgeKnown: false,
    membershipMarkers: BLOOD_TEST_MARKERS,
    // Adds a prepaid item.
    products: [VO2, DEXA, WBMRI],
  }),

  'Big — 8 panels': profile({
    panels: BIG,
    outdated: 90,
    never: 6,
    bioAgeKnown: false,
    membershipMarkers: BLOOD_TEST_MARKERS,
    // Adds a recommended item that contributes nothing to the outdated pile.
    products: [VO2, DEXA, WBMRI, GUT, CALCIUM, APOE],
  }),
}

/** Default fixture. */
export const PAYLOAD = PROFILES['Small — 4 panels']
