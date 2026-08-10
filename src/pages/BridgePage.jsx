import { useNavigate } from 'react-router-dom'

import { DS } from '../ds/loadDs'
import { PageShell } from '../components/PageShell'
import { CoverageHero } from '../components/CoverageHero'
import { ProgressRing } from '../components/charts'
import { PanelAccordion } from '../components/PanelAccordion'
import { AtRiskTable } from '../components/AtRiskTable'
import { useCoverage } from '../data/CoverageProvider'
import { MESSAGE, emit } from '../data/host'
import { monthsSince } from '../data/format'

export default function BridgePage() {
  const navigate = useNavigate()
  const { payload } = useCoverage()
  const { profile, panels, atRisk } = payload

  // Which panels appear, and in what order, is the host's call — it filters on
  // its own recency threshold before sending. We render what we're given.
  const monthsStale = monthsSince(profile.lastTested)

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
            <CoverageHero profile={profile} />
          </div>

          {panels.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div className="seclabel typography-body-400-medium">
                  {monthsStale} {monthsStale === 1 ? 'month' : 'months'} since your last test
                </div>
                <div
                  className="text-fg-neutral-secondary-100 typography-body-200-regular"
                  style={{ lineHeight: 1.6, marginTop: 6, maxWidth: 640 }}
                >
                  Whether they improved, held, or got worse since is unanswered until they are measured again.
                </div>
              </div>
              <PanelAccordion panels={panels} />
            </div>
          )}

          {atRisk.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* This section's subtitle moved up to the panels heading, where it
                  covers every outdated marker rather than just the flagged ones.
                  Repeating it here would say the same sentence twice on one screen. */}
              <div className="seclabel typography-body-400-medium">Biomarkers at risk</div>
              <AtRiskTable markers={atRisk} />
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
