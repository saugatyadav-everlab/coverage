import { DS } from '../ds/loadDs'
import { SelectCircle } from './CardParts'
import { AT_HOME } from '../data/atHome'

/**
 * The at-home draw, offered alongside the Baseline card inside the same tinted
 * frame (Figma 315:70020) — same draw, delivered at home rather than a clinic.
 *
 * It is a delivery choice, not a test: ticking it adds to the total but leaves
 * the coverage ring alone. It only exists once the plan is chosen, so it is
 * revealed on selection rather than sitting there unavailable. Always mounted so
 * it can animate both ways.
 */
export function AtHomeAddOn({ open, selected, onToggle }) {
  const handle = (event) => {
    event.stopPropagation()
    if (open) onToggle()
  }

  return (
    <div className="athome" data-open={open ? '1' : '0'} aria-hidden={!open}>
      <div>
        <div
          className="athome-row"
          role="checkbox"
          aria-checked={selected}
          aria-label={AT_HOME.name}
          tabIndex={open ? 0 : -1}
          onClick={handle}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handle(event)
            }
          }}
        >
          <span className="athome-icon bg-bg-surface-100 text-fg-neutral-primary-100" aria-hidden="true">
            <DS.IconHome size={18} />
          </span>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="typography-body-300-medium">{AT_HOME.name}</div>
            <div className="text-fg-neutral-secondary-100 typography-body-200-regular" style={{ marginTop: 4 }}>
              {AT_HOME.description}
            </div>
          </div>

          <SelectCircle selected={selected} size={20} />
        </div>
      </div>
    </div>
  )
}
