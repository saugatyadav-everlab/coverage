import { InfoIcon } from './icons'

/**
 * One of the three tiles at the top of the Bridge page. `blurred` is how the
 * comps gate biological age when too much data has aged out — the number stays
 * unreadable, and the tooltip explains why.
 */
export function StatCard({ label, value, blurred = false, tip = null }) {
  return (
    <div className="rounded-xl bg-bg-neutral-tertiary-100" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span className="text-fg-neutral-secondary-100 typography-body-200-regular">{label}</span>

        {tip && (
          <span className="text-fg-neutral-tertiary-100 tipwrap" style={{ position: 'relative', display: 'flex', cursor: 'help' }} tabIndex={0} role="note" aria-label={tip}>
            <InfoIcon />
            <span
              className="tipbub rounded-lg typography-body-100-regular bg-bg-neutral-primary-invert-100 text-fg-neutral-primary-100 border-br-neutral-secondary-100"
              style={{
                position: 'absolute',
                left: -8,
                top: 22,
                zIndex: 20,
                width: 290,
                padding: '11px 13px',
                lineHeight: 1.5,
                borderWidth: 1,
                borderStyle: 'solid',
                boxShadow: '0 10px 28px rgba(0,0,0,.22)',
              }}
            >
              {tip}
            </span>
          </span>
        )}
      </div>

      <div
        className="statval typography-body-500-medium"
        style={{
          marginTop: 9,
          ...(blurred ? { filter: 'blur(6px)', userSelect: 'none', width: 'max-content' } : null),
        }}
        aria-hidden={blurred || undefined}
      >
        {value}
      </div>
    </div>
  )
}
