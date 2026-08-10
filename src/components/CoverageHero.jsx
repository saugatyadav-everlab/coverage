import { DS } from '../ds/loadDs'
import { CoverageDial } from './charts'
import { InfoTooltip } from './InfoTooltip'
import { formatMonthYear, pct, plural } from '../data/format'

/**
 * The Bridge page's coverage hero.
 *
 * This absorbs what used to be a separate row of stat cards above it. Those
 * cards mostly restated the entry-point card in the host app — total tracked is
 * already in the headline, and biological age was already shown blurred there.
 * Folding the two facts that aren't on the entry point into the hero makes it a
 * superset of the card the member tapped rather than a repeat of it:
 *
 *   - Last tested sits beside the headline, so the date and the number it
 *     explains are read together.
 *   - Biological age sits beside the legend, so the blur reads as a consequence
 *     of the outdated count rather than an unrelated metric that happens to be
 *     unavailable.
 */
export function CoverageHero({ profile }) {
  const { tracked, outdated, valid, validPct, outdatedPct, lastTested, bioAge, bioAgeKnown, bioAgeNote } = profile

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
      <div className="herohead">
        <div className="herotitle typography-body-500-medium" style={{ lineHeight: 1.35 }}>
          Out of {tracked} biomarkers,
          <br />
          {outdated} of them are out of date now.
        </div>

        {lastTested && (
          <div className="herotested typography-body-200-regular">
            <DS.IconClock size={20} />
            <span>Last tested {formatMonthYear(lastTested)}</span>
          </div>
        )}
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

        {bioAge != null && (
          <div className="herobio">
            <div
              className="herobio-value typography-display-300"
              style={bioAgeKnown ? undefined : { filter: 'blur(6px)', userSelect: 'none' }}
              aria-hidden={bioAgeKnown ? undefined : true}
            >
              {bioAge}
            </div>
            <div className="herobio-label typography-body-200-medium">
              <span>Biological age</span>
              {!bioAgeKnown && <InfoTooltip text={bioAgeNote} align="right" />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
