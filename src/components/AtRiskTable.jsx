import { DS } from '../ds/loadDs'
import { RangeBar } from './charts'
import { StaleWarningIcon } from './icons'
import { MARKER_STATUS } from '../data/schema'
import { formatMeasurement, formatMonthYear } from '../data/format'

function AtRiskRow({ marker, isLast }) {
  const stale = marker.status === MARKER_STATUS.OUTDATED
  const badgeClass = `bg-bg-range-${marker.verdict}-secondary-100 text-fg-range-${marker.verdict}-primary-100`

  return (
    <div className="riskrow border-br-neutral-tertiary-100" style={{ borderBottomWidth: isLast ? 0 : 1 }}>
      <span className="rname typography-body-200-regular" style={{ minWidth: 0, lineHeight: 1.4 }}>
        {marker.name}
      </span>

      <span className="rmeta">
        <span className="text-fg-neutral-secondary-100 typography-body-200-regular">
          {formatMeasurement(marker.value, marker.unit)}
        </span>
        <span className="rsep text-fg-neutral-tertiary-100" style={{ opacity: 0.5 }}>
          |
        </span>
        <span
          className="text-fg-neutral-secondary-100 typography-body-200-regular"
          style={{ display: 'flex', alignItems: 'center', gap: 7 }}
        >
          {formatMonthYear(marker.lastTested)}
          {stale && <StaleWarningIcon />}
        </span>
      </span>

      <span className="rrange" style={{ display: 'flex' }}>
        <RangeBar position={marker.position} />
      </span>

      <span className="rbadge" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <DS.Badge variant="secondary" className={badgeClass}>
          {marker.verdictLabel}
        </DS.Badge>
      </span>
    </div>
  )
}

export function AtRiskTable({ markers }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {markers.map((marker, index) => (
        <AtRiskRow key={marker.id} marker={marker} isLast={index === markers.length - 1} />
      ))}
    </div>
  )
}
