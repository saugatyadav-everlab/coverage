import { useState } from 'react'

import { DS } from '../ds/loadDs'
import { SummaryRing } from './charts'
import { SummaryLineItems, TotalsCard } from './SummaryParts'

/**
 * Sticky summary for the narrow layout, where the summary column otherwise
 * drops below the whole product list and scrolls out of view.
 *
 * Same structure as the Bridge page's sticky footer — ring and text on the
 * left, CTA on the right, no card around it — so the two pages end the same
 * way. Content matches the desktop summary card: the count, and the line the
 * desktop uses under it.
 *
 * Two variants, switched with ?mobilebar=bar|sheet; one gets deleted once
 * picked.
 *   bar   — the footer alone
 *   sheet — tapping it reveals the desktop line items and totals above
 */

export const MOBILE_BAR_VARIANTS = ['bar', 'sheet']

export function mobileBarVariant(search = window.location.search) {
  const value = new URLSearchParams(search).get('mobilebar')
  return MOBILE_BAR_VARIANTS.includes(value) ? value : 'bar'
}

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

export function MobileSummaryBar({ variant, selection, lines, money, onCheckout }) {
  const [open, setOpen] = useState(false)
  const expandable = variant === 'sheet'

  return (
    <div
      className="mobilebar foot border-br-neutral-tertiary-100 bg-bg-neutral-primary-invert-100 text-fg-neutral-primary-100"
      data-variant={variant}
    >
      {expandable && open && (
        <div className="mobilebar-sheet">
          <SummaryLineItems lines={lines} />
          <TotalsCard selection={selection} money={money} />
        </div>
      )}

      <div className="footin">
        {expandable ? (
          <button
            type="button"
            className="footlead mobilebar-toggle"
            onClick={() => setOpen((on) => !on)}
            aria-expanded={open}
            aria-label={open ? 'Hide summary' : 'Show summary'}
          >
            <Lead selection={selection} />
            <span className="text-fg-neutral-tertiary-100" style={{ flex: 'none', display: 'flex', transform: open ? 'rotate(180deg)' : 'none' }}>
              <DS.IconChevronDown size={20} />
            </span>
          </button>
        ) : (
          <div className="footlead">
            <Lead selection={selection} />
          </div>
        )}

        <span className="footcta" style={{ flex: 'none', display: 'flex' }}>
          <DS.Button emphasis="primary" appearance="neutral" size="lg" disabled={!selection.anySelected} onClick={onCheckout}>
            Continue to checkout
          </DS.Button>
        </span>
      </div>
    </div>
  )
}
