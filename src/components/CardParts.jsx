import { DS } from '../ds/loadDs'
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
 * The price and its note.
 *
 * Rendered in both the head and the foot, with CSS showing exactly one: the
 * two sit in different containers at the two breakpoints, and `display: none`
 * keeps the hidden copy out of the accessibility tree as well as the page.
 */
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

/** Image, title and sub-line, with the price opposite on wide layouts. */
export function CardHead({ image, title, subtitle, price, priceNote }) {
  return (
    <div className="rcard-head">
      {image && <img className="rcard-media rounded-3xl" src={image} alt="" loading="lazy" />}

      <div className="rcard-meta">
        {title}
        {subtitle}
      </div>

      <Price className="rcard-head-price" price={price} note={priceNote} />
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
