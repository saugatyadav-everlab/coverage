import { useNavigate } from 'react-router-dom'

import { DS } from '../ds/loadDs'
import { PageShell } from '../components/PageShell'
import { StatCard } from '../components/StatCard'
import { CoverageHero } from '../components/CoverageHero'
import { ProgressRing } from '../components/charts'
import { PanelAccordion } from '../components/PanelAccordion'
import { AtRiskTable } from '../components/AtRiskTable'
import { useCoverage } from '../data/CoverageProvider'
import { MESSAGE, emit } from '../data/host'
import { formatMonthYear } from '../data/format'

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
      className="foot foot--bridge border-br-neutral-tertiary-100 bg-bg-neutral-primary-invert-100 text-fg-neutral-primary-100"
      style={{ position: 'sticky', bottom: 0, borderTopWidth: 1, borderTopStyle: 'solid' }}
    >
      <div className="footin">
        {/* Ring and text are their own group, so the footer's 22px gap only
            separates them from the CTA — the ring sits tight to its label. */}
        <div className="footlead">
          {/* Same fraction as the hero dial — the state being carried into the
              next step. Neutral rather than the hero's white-on-brand, since
              the footer sits on the page background. */}
          <span className="footring" style={{ flex: 'none', display: 'flex' }}>
            <ProgressRing
              fraction={profile.tracked ? profile.valid / profile.tracked : 0}
              size={40}
              label={`${profile.valid} of ${profile.tracked} biomarkers still valid`}
            />
          </span>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="typography-body-300-medium">Bring your data up to date</div>
            <div className="text-fg-neutral-tertiary-100 typography-body-200-regular" style={{ marginTop: 4 }}>
              Pick what to retest and see our recommendations.
            </div>
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
