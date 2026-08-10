import { InfoIcon } from './icons'

/**
 * Hover/focus tooltip on an info icon.
 *
 * `align` picks which edge the bubble hangs from — "right" is needed when the
 * icon sits near the right of its container, where a left-anchored bubble would
 * overflow. Positioning lives in CSS rather than inline so layouts can flip the
 * anchor at a breakpoint (see .herobio in app.css, where the icon moves to the
 * left edge on narrow screens).
 */
export function InfoTooltip({ text, align = 'left' }) {
  return (
    <span className="text-fg-neutral-tertiary-100 tipwrap" tabIndex={0} role="note" aria-label={text}>
      <InfoIcon />
      <span
        className={`tipbub tipbub--${align} rounded-lg typography-body-100-regular bg-bg-neutral-primary-invert-100 text-fg-neutral-primary-100 border-br-neutral-secondary-100`}
      >
        {text}
      </span>
    </span>
  )
}
