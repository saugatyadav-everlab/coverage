import { useState } from 'react'

import { DS } from '../ds/loadDs'
import { CoverageSummaryCard, SummaryLineItems, TotalsCard } from './SummaryParts'

/**
 * Sticky summary for the narrow layout, where the summary column otherwise
 * drops below the whole product list and scrolls out of view.
 *
 * Built from the same blocks as the desktop column — nothing here is a compact
 * restatement, so the two layouts can't drift apart.
 *
 * Two variants, switched with ?mobilebar=bar|sheet; one gets deleted once
 * picked.
 *   bar   — the coverage card, pinned, with the CTA under it
 *   sheet — the same card, tapping it reveals the rest of the desktop summary
 */

export const MOBILE_BAR_VARIANTS = ['bar', 'sheet']

export function mobileBarVariant(search = window.location.search) {
  const value = new URLSearchParams(search).get('mobilebar')
  return MOBILE_BAR_VARIANTS.includes(value) ? value : 'bar'
}

export function MobileSummaryBar({ variant, selection, lines, money, onCheckout }) {
  const [open, setOpen] = useState(false)
  const expandable = variant === 'sheet'

  return (
    <div
      className="mobilebar border-br-neutral-tertiary-100 bg-bg-neutral-primary-invert-100 text-fg-neutral-primary-100"
      data-variant={variant}
    >
      {expandable && open && (
        <div className="mobilebar-sheet">
          <SummaryLineItems lines={lines} />
          <TotalsCard selection={selection} money={money} />
        </div>
      )}

      <div className="mobilebar-row">
        {expandable ? (
          <button
            type="button"
            className="mobilebar-toggle"
            onClick={() => setOpen((on) => !on)}
            aria-expanded={open}
            aria-label={open ? 'Hide summary' : 'Show summary'}
          >
            <CoverageSummaryCard selection={selection} />
            <span
              className="text-fg-neutral-tertiary-100 mobilebar-chevron"
              style={{ transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)' }}
            >
              <DS.IconChevronDown size={20} />
            </span>
          </button>
        ) : (
          <CoverageSummaryCard selection={selection} />
        )}
      </div>

      <div className="mobilebar-cta">
        <DS.Button emphasis="primary" appearance="neutral" size="lg" disabled={!selection.anySelected} onClick={onCheckout}>
          Continue to checkout
        </DS.Button>
      </div>
    </div>
  )
}
