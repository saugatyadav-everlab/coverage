/* Dial / ring / range-bar SVGs, ported from the comps and parameterised. */

/** Evenly spaced radial tick marks around a circle. */
function ticks({ centre, radius, band, count, stroke, className, strokeWidth }) {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((i + 0.5) / count) * Math.PI * 2 - Math.PI / 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return (
      <line
        key={`t${i}`}
        className={className}
        stroke={stroke}
        strokeWidth={strokeWidth}
        x1={centre + cos * (radius - band / 2)}
        y1={centre + sin * (radius - band / 2)}
        x2={centre + cos * (radius + band / 2)}
        y2={centre + sin * (radius + band / 2)}
      />
    )
  })
}

const arcDash = (radius, fraction) => {
  const circumference = 2 * Math.PI * radius
  return `${circumference * Math.min(1, Math.max(0, fraction))} ${circumference}`
}

/**
 * The dial on the Bridge hero. `fraction` is the share of markers still valid —
 * the solid arc — against a dotted ring of the full set.
 */
export function CoverageDial({ fraction, size = 96, label }) {
  const centre = size / 2
  const radius = size * 0.4
  const band = 9

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ flex: 'none', width: size, height: size, display: 'block' }} role="img" aria-label={label}>
      {ticks({ centre, radius, band, count: 54, stroke: 'rgba(255,255,255,.48)', strokeWidth: 1.4 })}
      <circle
        stroke="#fff"
        cx={centre}
        cy={centre}
        r={radius}
        fill="none"
        strokeWidth={band}
        strokeDasharray={arcDash(radius, fraction)}
        transform={`rotate(-90 ${centre} ${centre})`}
      />
    </svg>
  )
}

/**
 * Small neutral ring — Refresh product cards, and the Bridge footer.
 * Pass `label` where it carries meaning on its own; without one it's decorative
 * and hidden from assistive tech.
 */
export function ProgressRing({ fraction, size = 44, label, stroke = 6 }) {
  const centre = size / 2
  const radius = size * 0.38
  // One value for both: the dashed track and the filled arc occupy the same ring
  // width, so the dashes stop overhanging the arc they sit against.
  const band = stroke

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      style={{ width: size, height: size, display: 'block' }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
    >
      {ticks({ centre, radius, band, count: 26, className: 'text-fg-neutral-tertiary-100', stroke: 'currentColor', strokeWidth: 1.2 })}
      {fraction > 0 && (
        <circle
          className="text-fg-neutral-primary-100"
          stroke="currentColor"
          cx={centre}
          cy={centre}
          r={radius}
          fill="none"
          strokeWidth={band}
          strokeLinecap="butt"
          strokeDasharray={arcDash(radius, fraction)}
          transform={`rotate(-90 ${centre} ${centre})`}
        />
      )}
    </svg>
  )
}

/**
 * Larger summary ring; turns into a tick once everything outdated is covered.
 *
 * `onBrand` switches it to the hero dial's treatment — white arc on translucent
 * white ticks — for use on the brand panel, where the optimal green has nowhere
 * near enough contrast against the red. The completion tick goes white with it,
 * matching the arc rather than fighting it.
 */
export function SummaryRing({ fraction, size = 52, label, onBrand = false }) {
  const centre = size / 2
  const radius = size * 0.38
  const band = 7
  const complete = fraction >= 1

  const tickStyle = onBrand
    ? { stroke: 'rgba(255,255,255,.48)' }
    : { className: 'text-fg-neutral-tertiary-100', stroke: 'currentColor' }
  const arcProps = onBrand
    ? { stroke: '#fff' }
    : { className: 'text-fg-range-optimal-primary-100', stroke: 'currentColor' }

  return (
    <div style={{ flex: 'none' }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, display: 'block' }} role="img" aria-label={label}>
        {ticks({ centre, radius, band, count: 30, strokeWidth: 1.2, ...tickStyle })}
        {fraction > 0 && (
          <circle
            {...arcProps}
            cx={centre}
            cy={centre}
            r={radius}
            fill="none"
            strokeWidth={band}
            strokeDasharray={arcDash(radius, fraction)}
            transform={`rotate(-90 ${centre} ${centre})`}
          />
        )}
        {complete && (
          <path
            {...arcProps}
            d={`M${centre - 6} ${centre} l4.5 4.5 L${centre + 7} ${centre - 5}`}
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  )
}

const RANGE_SEGMENTS = [
  { flex: 1.1, band: 'optimal' },
  { flex: 1, band: 'suboptimal' },
  { flex: 1.2, band: 'out-of-range' },
]

/** Optimal / suboptimal / out-of-range bar with a marker at `position` (0..1). */
export function RangeBar({ position, width = 150 }) {
  return (
    <div style={{ position: 'relative', width, paddingTop: 13 }} aria-hidden="true">
      <div
        className="text-fg-neutral-primary-100"
        style={{
          position: 'absolute',
          top: 0,
          left: `${(position * 100).toFixed(1)}%`,
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '6px solid currentColor',
        }}
      />
      <div style={{ display: 'flex', gap: 4, height: 5 }}>
        {RANGE_SEGMENTS.map((segment) => (
          <div key={segment.band} className={`bg-bg-range-${segment.band}-primary-100 rounded-full`} style={{ flex: segment.flex }} />
        ))}
      </div>
    </div>
  )
}
