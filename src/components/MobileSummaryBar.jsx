import { useState } from 'react'

import { DS } from '../ds/loadDs'
import { SummaryRing } from './charts'
import { CheckIcon } from './icons'

/**
 * Sticky coverage indicator for the narrow layout, where the summary column
 * drops below the whole product list and scrolls out of view.
 *
 * Two variants are built so they can be compared in the console; one gets
 * deleted once picked. Switch with ?mobilebar=bar|sheet.
 *
 *   bar   — always-visible: ring, count, total, CTA
 *   sheet — collapsed to the same row, expands on tap to the line items
 *
 * All copy here already exists on the page: the count line is the comps'
 * `refreshLine`, the rest is Total / (GST inc.) / Continue to checkout.
 */

export const MOBILE_BAR_VARIANTS = ['bar', 'sheet']

export function mobileBarVariant(search = window.location.search) {
  const value = new URLSearchParams(search).get('mobilebar')
  return MOBILE_BAR_VARIANTS.includes(value) ? value : 'bar'
}

/** The comps' `refreshLine`, verbatim. */
function CountLine({ selection }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="typography-body-200-medium" style={{ lineHeight: 1.3 }}>
        {selection.refreshed} of {selection.outdatedTotal} outdated biomarkers refreshed
      </div>
    </div>
  )
}

/** Same Total / (GST inc.) pairing the summary card uses, laid out compactly. */
function TotalBlock({ label }) {
  return (
    <div style={{ flex: 'none', textAlign: 'right' }}>
      <div className="typography-body-300-medium">{label}</div>
      <div className="text-fg-neutral-tertiary-100 typography-body-100-regular" style={{ marginTop: 2 }}>
        (GST inc.)
      </div>
    </div>
  )
}

export function MobileSummaryBar({ variant, selection, lines, money, onCheckout }) {
  const [open, setOpen] = useState(false)
  const expandable = variant === 'sheet'

  const withTotal = { ...selection, totalLabel: money(selection.total) }

  return (
    <div
      className="mobilebar border-br-neutral-tertiary-100 bg-bg-neutral-primary-invert-100 text-fg-neutral-primary-100"
      data-variant={variant}
    >
      {expandable && open && (
        <div className="mobilebar-sheet border-br-neutral-tertiary-100">
          {lines.map((line, index) => (
            <div
              key={line.key}
              className="sumitem border-br-neutral-tertiary-100"
              style={{ borderBottomWidth: index === lines.length - 1 ? 0 : 1 }}
            >
              <span className="bg-bg-neutral-primary-100" style={{ flex: 'none', width: 6, height: 6 }} />
              <span className="typography-body-200-regular" style={{ flex: 1, minWidth: 0, lineHeight: 1.4 }}>
                {line.name}
              </span>
              <span
                className={`${line.paid ? 'text-fg-range-optimal-primary-100' : ''} typography-body-200-regular`}
                style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {line.paid && <CheckIcon size={13} />}
                {line.price}
              </span>
            </div>
          ))}

          {selection.saved > 0 && (
            <div className="sumitem" style={{ borderBottomWidth: 0 }}>
              <span className="typography-body-200-regular" style={{ flex: 1 }}>
                Member discount
              </span>
              <span className="text-fg-range-optimal-primary-100 typography-body-200-regular">-{money(selection.saved)}</span>
            </div>
          )}
        </div>
      )}

      <div className="mobilebar-row">
        <SummaryRing
          fraction={selection.fraction}
          size={40}
          label={`${selection.refreshed} of ${selection.outdatedTotal} outdated biomarkers refreshed`}
        />

        {expandable ? (
          <button
            type="button"
            className="mobilebar-toggle"
            onClick={() => setOpen((on) => !on)}
            aria-expanded={open}
            aria-label={open ? 'Hide summary' : 'Show summary'}
          >
            <CountLine selection={withTotal} />
            <TotalBlock label={withTotal.totalLabel} />
            <span className="text-fg-neutral-tertiary-100" style={{ flex: 'none', display: 'flex', transform: open ? 'rotate(180deg)' : 'none' }}>
              <DS.IconChevronDown size={18} />
            </span>
          </button>
        ) : (
          <>
            <CountLine selection={withTotal} />
            <TotalBlock label={withTotal.totalLabel} />
          </>
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
