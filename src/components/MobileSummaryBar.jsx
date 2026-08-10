import { DS } from '../ds/loadDs'
import { SummaryRing } from './charts'

/**
 * Sticky summary for the narrow layout, where the summary column otherwise
 * drops below the whole product list and scrolls out of view.
 *
 * Same structure as the Bridge page's sticky footer — ring and text on the
 * left, CTA on the right, no card around it — so the two pages end the same
 * way. Content matches the desktop summary card: the count, and the line the
 * desktop uses under it.
 *
 * The breakdown stays in the column above rather than folding into this bar,
 * so nothing is hidden behind a tap.
 */

function Lead({ selection }) {
  const { refreshed, outdatedTotal, fraction } = selection

  return (
    <>
      <span style={{ flex: 'none', display: 'flex' }}>
        <SummaryRing fraction={fraction} size={40} label={`${refreshed} of ${outdatedTotal} outdated biomarkers refreshed`} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="typography-body-300-medium">{refreshed}</div>
        <div className="text-fg-neutral-tertiary-100 typography-body-200-regular" style={{ marginTop: 4 }}>
          Outdated biomarkers being refreshed
        </div>
      </div>
    </>
  )
}

export function MobileSummaryBar({ selection, onCheckout }) {
  return (
    <div className="mobilebar foot border-br-neutral-tertiary-100 bg-bg-neutral-primary-invert-100 text-fg-neutral-primary-100">
      <div className="footin">
        <div className="footlead">
          <Lead selection={selection} />
        </div>

        <span className="footcta" style={{ flex: 'none', display: 'flex' }}>
          <DS.Button emphasis="primary" appearance="neutral" size="lg" disabled={!selection.anySelected} onClick={onCheckout}>
            Continue to checkout
          </DS.Button>
        </span>
      </div>
    </div>
  )
}
