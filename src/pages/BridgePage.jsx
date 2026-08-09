import { useNavigate } from 'react-router-dom'

import { DS } from '../ds/loadDs'
import { PageShell } from '../components/PageShell'
import { StatCard } from '../components/StatCard'
import { CoverageDial } from '../components/charts'
import { PanelAccordion } from '../components/PanelAccordion'
import { AtRiskTable } from '../components/AtRiskTable'
import { useCoverage } from '../data/CoverageProvider'
import { MESSAGE, emit } from '../data/host'
import { formatMonthYear, pct, plural } from '../data/format'

function CoverageHero({ profile }) {
  const { tracked, outdated, valid, validPct, outdatedPct } = profile

  const headline =
    outdated === 0
      ? `All ${tracked} of your biomarkers are up to date.`
      : (
          <>
            Out of {tracked} biomarkers,
            <br />
            {outdated} of them are out of date now.
          </>
        )

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
        {headline}
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

export default function BridgePage() {
  const navigate = useNavigate()
  const { payload } = useCoverage()
  const { profile, panels, atRisk } = payload

  // Panels worth surfacing, worst first.
  const needsAttention = panels
    .filter((panel) => panel.counts.outdated > 0 || panel.counts.never > 0)
    .sort((a, b) => b.counts.outdated - a.counts.outdated || b.counts.never - a.counts.never)

  const goToRefresh = () => {
    emit(MESSAGE.NAVIGATE, { page: 'refresh' })
    navigate({ pathname: '/refresh', search: window.location.search })
  }

  const footer = (
    <div
      className="foot border-br-neutral-tertiary-100 bg-bg-neutral-primary-invert-100 text-fg-neutral-primary-100"
      style={{ position: 'sticky', bottom: 0, borderTopWidth: 1, borderTopStyle: 'solid' }}
    >
      <div className="footin" style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="typography-body-300-medium">Bring your data up to date</div>
          <div className="text-fg-neutral-tertiary-100 typography-body-200-regular" style={{ marginTop: 4 }}>
            Pick what to retest and see our recommendations.
          </div>
        </div>
        <span className="footcta" style={{ flex: 'none', display: 'flex' }}>
          <DS.Button emphasis="primary" appearance="neutral" size="lg" onClick={goToRefresh}>
            Continue
          </DS.Button>
        </span>
      </div>
    </div>
  )

  return (
    <PageShell footer={footer}>
      <div className="page">
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40, paddingTop: 30 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="pagetitle typography-display-300">Your health profile</div>

            <div className="statgrid">
              <StatCard label="Biomarkers tracked" value={profile.tracked} />
              <StatCard label="Last tested" value={formatMonthYear(profile.lastTested)} />
              <StatCard
                label="Biological age"
                value={profile.bioAge ?? '—'}
                blurred={!profile.bioAgeKnown}
                tip={profile.bioAgeKnown ? null : profile.bioAgeNote}
              />
            </div>

            <CoverageHero profile={profile} />
          </div>

          {needsAttention.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="seclabel typography-body-400-medium">Panels that need attention</div>
              <PanelAccordion panels={needsAttention} />
            </div>
          )}

          {atRisk.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div className="seclabel typography-body-400-medium">Biomarkers at risk</div>
                <div
                  className="text-fg-neutral-secondary-100 typography-body-200-regular"
                  style={{ lineHeight: 1.6, marginTop: 7, maxWidth: 640 }}
                >
                  Whether they improved, held, or got worse since is unanswered until they are measured again.
                </div>
              </div>
              <AtRiskTable markers={atRisk} />
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
