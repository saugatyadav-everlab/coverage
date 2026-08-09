import { CheckIcon } from './icons'
import { AT_HOME } from '../data/atHome'

/**
 * The at-home draw row inside the Baseline card.
 *
 * Always mounted so it can animate both in and out; `data-open` drives a
 * grid-template-rows transition (see .athome in app.css). Its checkbox is a
 * rounded square to distinguish it from the circular plan-level control — it
 * toggles independently of the card, so the click must not bubble up and
 * deselect the plan underneath.
 */
export function AtHomeAddOn({ open, selected, onToggle, money }) {
  const handle = (event) => {
    event.stopPropagation()
    onToggle()
  }

  return (
    <div className="athome" data-open={open ? '1' : '0'} aria-hidden={!open}>
      <div>
        <div
          className="athome-row border-br-neutral-tertiary-100"
          role="checkbox"
          aria-checked={selected}
          aria-label={`${AT_HOME.name} — ${money(AT_HOME.price)}`}
          tabIndex={open ? 0 : -1}
          onClick={handle}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handle(event)
            }
          }}
        >
          <span
            className="rounded-lg bg-bg-neutral-tertiary-200 text-fg-neutral-primary-100"
            style={{ flex: 'none', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 20, height: 20 }}>
              <path d="M3.5 10.4 12 3.8l8.5 6.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.6 12v7.4h12.8V12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="typography-body-300-medium">{AT_HOME.name}</div>
            <div className="text-fg-neutral-tertiary-100 typography-body-200-regular" style={{ marginTop: 3 }}>
              {AT_HOME.description}
            </div>
          </div>

          <span className="typography-body-300-medium" style={{ flex: 'none' }}>
            {money(AT_HOME.price)}
          </span>

          <span
            className={
              selected
                ? 'rounded-lg bg-bg-neutral-primary-100 text-fg-neutral-primary-invert-100'
                : 'rounded-lg border-br-neutral-secondary-100'
            }
            style={{
              flex: 'none',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: selected ? 0 : 1.4,
              borderStyle: 'solid',
            }}
          >
            {selected && <CheckIcon size={13} />}
          </span>
        </div>
      </div>
    </div>
  )
}
