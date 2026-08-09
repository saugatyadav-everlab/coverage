import { CoverageDial } from './charts'
import { pct, plural } from '../data/format'

/** The Bridge page's coverage hero. */
export function CoverageHero({ profile }) {
  const { tracked, outdated, valid, validPct, outdatedPct } = profile

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
    <div
      className="theme-dark rounded-2xl"
      style={{
        color: '#fff',
        padding: 24,
        backgroundColor: '#5a2716',
        backgroundImage: 'url(/assets/brand-texture.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="herotitle typography-body-500-medium" style={{ lineHeight: 1.35 }}>
        Out of {tracked} biomarkers,
        <br />
        {outdated} of them are out of date now.
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
    </div>
  )
}
