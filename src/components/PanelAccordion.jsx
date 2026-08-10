import { useState } from 'react'

import { DS } from '../ds/loadDs'
import { MARKER_STATUS } from '../data/schema'
import { monthsAgo } from '../data/format'

const GROUPS = [
  {
    status: MARKER_STATUS.OUTDATED,
    heading: 'Outdated',
    dot: <span className="bg-bg-brand-orange-primary-100" style={{ flex: 'none', width: 6, height: 6, borderRadius: '50%' }} />,
    textClass: '',
  },
  {
    status: MARKER_STATUS.NEVER,
    heading: 'Never tested',
    dot: (
      <span
        className="border-br-neutral-primary-300"
        style={{ flex: 'none', width: 6, height: 6, borderRadius: '50%', borderWidth: 1, borderStyle: 'dashed' }}
      />
    ),
    textClass: 'text-fg-neutral-secondary-100',
  },
  {
    status: MARKER_STATUS.CURRENT,
    heading: 'Still current',
    dot: <span className="bg-bg-neutral-primary-300" style={{ flex: 'none', width: 6, height: 6, borderRadius: '50%' }} />,
    textClass: 'text-fg-neutral-secondary-100',
  },
]

function MarkerGroup({ group, markers }) {
  if (markers.length === 0) return null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span className="typography-body-200-medium">{group.heading}</span>
        <span className="rounded-full bg-bg-neutral-tertiary-200 typography-body-100-regular" style={{ padding: '3px 9px' }}>
          {markers.length}
        </span>
      </div>
      <div className="mkgrid">
        {markers.map((marker) => (
          <div key={marker.name} style={{ padding: '6px 0', display: 'flex', alignItems: 'center', gap: 9 }}>
            {group.dot}
            <span className={`${group.textClass} typography-body-200-regular`} style={{ minWidth: 0 }}>
              {marker.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * How much of the panel has aged out, as a proportion of its markers. Reading
 * the bar against the count lets several panels be ranked at a glance, which
 * the marker total on its own never allowed.
 */
function OutdatedBar({ outdated, total }) {
  const remainder = Math.max(0, total - outdated)

  return (
    <div className="pbar" aria-hidden="true">
      {outdated > 0 && <span className="bg-bg-brand-orange-primary-100 pbar-fill" style={{ flexGrow: outdated }} />}
      {remainder > 0 && <span className="bg-bg-neutral-primary-300 pbar-rest" style={{ flexGrow: remainder }} />}
    </div>
  )
}

function PanelRow({ panel, open, onToggle }) {
  const bodyId = `panel-body-${panel.id}`
  const tested = monthsAgo(panel.lastTested)

  return (
    <div className="rounded-xl bg-bg-neutral-tertiary-100" style={{ overflow: 'hidden' }}>
      <button type="button" className="prow prowin" onClick={onToggle} aria-expanded={open} aria-controls={bodyId}>
        <div className="pmeta">
          <div className="pname typography-body-300-medium">{panel.name}</div>
          {tested && (
            <div className="ptested text-fg-neutral-secondary-100 typography-body-200-regular">
              <DS.IconClock size={16} />
              <span>{tested}</span>
            </div>
          )}
        </div>

        <div className="pprogress">
          <OutdatedBar outdated={panel.counts.outdated} total={panel.total} />
          <div className="pcount typography-body-100-regular">
            <span className="bg-bg-brand-orange-primary-100" style={{ flex: 'none', width: 6, height: 6, borderRadius: '50%' }} />
            <span className="text-fg-brand-orange-primary-100">{panel.counts.outdated}</span>
            <span className="text-fg-neutral-secondary-100">/ {panel.total} outdated</span>
          </div>
        </div>

        <span className="text-fg-neutral-tertiary-100" style={{ flex: 'none', display: 'flex' }}>
          <span style={{ display: 'flex', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .14s ease' }}>
            <DS.IconChevronDown size={16} />
          </span>
        </span>
      </button>

      {open && (
        <div
          id={bodyId}
          className="border-br-neutral-tertiary-100"
          style={{ borderTopWidth: 1, borderTopStyle: 'solid', padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {GROUPS.map((group) => (
            <MarkerGroup key={group.status} group={group} markers={panel.markers.filter((m) => m.status === group.status)} />
          ))}
        </div>
      )}
    </div>
  )
}

export function PanelAccordion({ panels }) {
  const [openId, setOpenId] = useState(() => panels[0]?.id ?? null)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {panels.map((panel) => (
        <PanelRow
          key={panel.id}
          panel={panel}
          open={openId === panel.id}
          onToggle={() => setOpenId((current) => (current === panel.id ? null : panel.id))}
        />
      ))}
    </div>
  )
}
