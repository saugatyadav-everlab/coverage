import { SummaryRing } from './charts'
import { BasketIcon, CheckIcon } from './icons'

/**
 * The three blocks of the Refresh summary, shared by the desktop column and the
 * narrow-layout sticky bar so the two are identical rather than merely similar.
 */

/** Ring, count and label. */
export function CoverageSummaryCard({ selection }) {
  const { refreshed, outdatedTotal, fraction } = selection

  return (
    <div
      className="rounded-2xl border-br-neutral-tertiary-100"
      style={{ borderWidth: 1, borderStyle: 'solid', padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}
    >
      <SummaryRing fraction={fraction} label={`${refreshed} of ${outdatedTotal} outdated biomarkers refreshed`} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="typography-display-100">{refreshed}</div>
        <div className="text-fg-neutral-secondary-100 typography-body-200-regular" style={{ marginTop: 3, lineHeight: 1.4 }}>
          Outdated biomarkers being refreshed
        </div>
      </div>
    </div>
  )
}

/** The line items, or the empty state when there is genuinely nothing listed. */
export function SummaryLineItems({ lines }) {
  if (lines.length === 0) {
    return (
      <div style={{ padding: '22px 10px 6px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <span
          className="bg-bg-neutral-tertiary-100 text-fg-neutral-primary-100"
          style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <BasketIcon />
        </span>
        <div>
          <div className="typography-body-300-medium">Nothing selected yet.</div>
          <div className="text-fg-neutral-secondary-100 typography-body-200-regular" style={{ marginTop: 6, lineHeight: 1.5 }}>
            As you add items, you can see how much they contribute to refreshing your outdated biomarkers.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: 4 }}>
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
    </div>
  )
}

/** Subtotal, member discount and total. */
export function TotalsCard({ selection, money }) {
  const { subtotal, saved, total } = selection

  return (
    <div className="rounded-2xl bg-bg-neutral-tertiary-100" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <span className="typography-body-200-regular" style={{ flex: 1 }}>
          Subtotal
        </span>
        <span className="typography-body-200-regular" style={{ flex: 'none' }}>
          {money(subtotal)}
        </span>
      </div>

      {saved > 0 && (
        <div
          className="border-br-neutral-tertiary-100"
          style={{ display: 'flex', alignItems: 'baseline', gap: 12, paddingTop: 14, borderTopWidth: 1, borderTopStyle: 'solid' }}
        >
          <span className="typography-body-200-regular" style={{ flex: 1 }}>
            Member discount
          </span>
          <span className="text-fg-range-optimal-primary-100 typography-body-200-regular" style={{ flex: 'none' }}>
            -{money(saved)}
          </span>
        </div>
      )}

      <div
        className="border-br-neutral-tertiary-100"
        style={{ display: 'flex', alignItems: 'baseline', gap: 12, paddingTop: 14, borderTopWidth: 1, borderTopStyle: 'solid' }}
      >
        <div style={{ flex: 1 }}>
          <div className="typography-body-400-medium">Total</div>
          <div className="text-fg-neutral-tertiary-100 typography-body-100-regular" style={{ marginTop: 2 }}>
            (GST inc.)
          </div>
        </div>
        <span className="typography-body-500-medium" style={{ flex: 'none' }}>
          {money(total)}
        </span>
      </div>
    </div>
  )
}
