import { CoverageDial } from './charts'
import { pct, plural } from '../data/format'

/**
 * The Bridge page's headline. Exported so the Refresh page can restate the
 * exact same sentence rather than a paraphrase of it — that repetition is the
 * point: the coverage problem has to still be on screen when the membership
 * card answers it.
 */
export const coverageHeadline = ({ tracked, outdated }) => ({
  lead: `Out of ${tracked} biomarkers,`,
  tail: `${outdated} of them are out of date now.`,
})

/** Shared brand-texture panel, so the two variants read as the same object. */
function BrandPanel({ children, padding }) {
  return (
    <div
      className="theme-dark rounded-2xl"
      style={{
        color: '#fff',
        padding,
        backgroundColor: '#5a2716',
        backgroundImage: 'url(/assets/brand-texture.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {children}
    </div>
  )
}

/** Full hero — Bridge page. */
export function CoverageHero({ profile }) {
  const { tracked, outdated, valid, validPct, outdatedPct } = profile
  const { lead, tail } = coverageHeadline(profile)

  const legend = [
    {
      label: 'Valid',
      pct: pct(validPct),
      count: plural(valid, 'biomarker'),
      glyph: <span style={{ flex: 'none', width: 14, height: 3, borderRadius: 2, background: '#fff' }} />,
      rule: 1,
    },
    {
      label: 'Outdated',
      pct: pct(outdatedPct),
      count: plural(outdated, 'biomarker'),
      glyph: (
        <span
          style={{ flex: 'none', width: 14, height: 0, borderTopWidth: 2, borderTopStyle: 'dashed', borderTopColor: 'rgba(255,255,255,.48)' }}
        />
      ),
      rule: 0,
    },
  ]

  return (
    <BrandPanel padding={24}>
      <div className="herotitle typography-body-500-medium" style={{ lineHeight: 1.35 }}>
        {lead}
        <br />
        {tail}
      </div>

      <div className="herorow">
        <CoverageDial fraction={tracked ? valid / tracked : 0} label={`${valid} of ${tracked} biomarkers still valid`} />

        <div className="legcol">
          {legend.map((item) => (
            <div key={item.label} className="legrow" style={{ borderBottomWidth: item.rule }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                {item.glyph}
                <span className="typography-body-200-medium">{item.label}</span>
              </div>
              <span className="typography-body-200-regular" style={{ textAlign: 'right', opacity: 0.72 }}>
                {item.pct}
              </span>
              <span className="typography-body-200-regular" style={{ textAlign: 'right', opacity: 0.72 }}>
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </BrandPanel>
  )
}

/**
 * Compact restatement — Refresh page. Same panel, same sentence, smaller dial,
 * so the member arrives at the product list with the gap still in view.
 */
export function CoverageCallback({ profile }) {
  const { tracked, valid } = profile
  const { lead, tail } = coverageHeadline(profile)

  return (
    <BrandPanel padding="18px 20px">
      <div className="callbackrow">
        <CoverageDial fraction={tracked ? valid / tracked : 0} size={56} label={`${valid} of ${tracked} biomarkers still valid`} />
        <div className="typography-body-300-medium" style={{ lineHeight: 1.4 }}>
          {lead} {tail}
        </div>
      </div>
    </BrandPanel>
  )
}
