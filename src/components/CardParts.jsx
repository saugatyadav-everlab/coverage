import { DS } from '../ds/loadDs'
import { CheckIcon } from './icons'
import { ProgressRing } from './charts'

/**
 * Shared pieces of the Refresh page's two card types.
 *
 * Desktop follows Figma 315:70020 with the footer from 324:4896; mobile follows
 * 315:72536 / 315:72499. The same DOM serves both: at the narrow breakpoint the
 * name drops below the image, and the footer splits into a contribution line and
 * a price row with an Add button. Wide layouts hide the button, since the whole
 * card is clickable there.
 */

/**
 * The selection state, as a circle. Shared with the at-home row so one choice
 * looks the same wherever it is offered.
 */
export function SelectCircle({ selected, size = 24 }) {
  return (
    <span
      className={
        selected
          ? 'selcircle bg-bg-neutral-primary-100 text-fg-neutral-primary-invert-100'
          : 'selcircle selcircle--empty border-br-neutral-secondary-100'
      }
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {selected && <CheckIcon size={Math.round(size * 0.52)} />}
    </span>
  )
}

/** The price and its note. */
function Price({ className, price, note }) {
  return (
    <div className={className}>
      <div className="typography-body-300-medium">{price}</div>
      {note && (
        <div className="text-fg-neutral-tertiary-100 typography-body-200-regular" style={{ marginTop: 4 }}>
          {note}
        </div>
      )}
    </div>
  )
}

/** Image, title and sub-line, with the selection circle opposite. */
export function CardHead({ image, title, subtitle, selected }) {
  return (
    <div className="rcard-head">
      {image && <img className="rcard-media rounded-3xl" src={image} alt="" loading="lazy" />}

      <div className="rcard-meta">
        {title}
        {subtitle}
      </div>

      <SelectCircle selected={selected} />
    </div>
  )
}

/**
 * What the item refreshes, with the price opposite.
 *
 * The ring carries the contribution and the plus sits inside it, so the number
 * and its share of the gap read as one thing rather than two.
 */
export function CardFoot({ count, label, fraction, ringLabel, price, priceNote, action, onAction, actionDisabled }) {
  return (
    <div className="rcard-foot">
      <div className="rcard-refresh">
        <span className="rcard-contrib">
          <ProgressRing fraction={fraction} size={36} stroke={4} label={ringLabel} />
          <span className="rcard-contrib-plus text-fg-neutral-secondary-100 typography-body-300-medium" aria-hidden="true">
            +
          </span>
        </span>

        <div className="rcard-count">
          <span className="typography-body-300-regular">{count}</span>
          <span className="text-fg-neutral-secondary-100 typography-body-200-regular">{label}</span>
        </div>
      </div>

      <div className="rcard-foot-rule border-br-neutral-tertiary-100" />

      <Price className="rcard-price" price={price} note={priceNote} />

      {action && (
        <span className="rcard-add">
          <DS.Button emphasis="secondary" appearance="neutral" size="sm" disabled={actionDisabled} onClick={onAction}>
            {action}
          </DS.Button>
        </span>
      )}
    </div>
  )
}

/** Section heading. */
export function SectionHeading({ children }) {
  return (
    <div className="rsection-head">
      <span className="typography-headlines-500">{children}</span>
    </div>
  )
}
