import { useEffect, useState } from 'react'

import { DS } from '../ds/loadDs'
import { MESSAGE, emit, observeHeight } from '../data/host'

/**
 * Shared chrome: the container-query shell, the top bar, and (behind
 * `?preview=1`) the desktop/mobile switcher the comps used.
 */
export function PageShell({ children, footer, onLogoClick }) {
  const [viewport, setViewport] = useState('desktop')
  const previewMode = new URLSearchParams(window.location.search).get('preview') === '1'

  // Let the embedding iframe size itself to the content.
  useEffect(() => observeHeight(), [])

  const width = previewMode && viewport === 'mobile' ? '390px' : '100%'

  return (
    <>
      {previewMode && (
        <div className="vpbtn text-fg-neutral-primary-100">
          {['desktop', 'mobile'].map((id) => (
            <button key={id} type="button" data-on={viewport === id ? '1' : '0'} onClick={() => setViewport(id)}>
              {id === 'desktop' ? 'Desktop' : 'Mobile'}
            </button>
          ))}
        </div>
      )}

      <div className="shell bg-bg-neutral-primary-invert-100 text-fg-neutral-primary-100" style={{ width }}>
        <div className="top">
          {onLogoClick ? (
            <button
              type="button"
              onClick={onLogoClick}
              style={{ flex: 'none', display: 'flex', height: 22, border: 0, background: 'transparent', padding: 0, cursor: 'pointer' }}
              aria-label="Back to your health profile"
            >
              <DS.EverlabLogoFull className="fill-fg-neutral-primary-100" />
            </button>
          ) : (
            <span style={{ flex: 'none', display: 'flex', height: 22 }}>
              <DS.EverlabLogoFull className="fill-fg-neutral-primary-100" />
            </span>
          )}

          <DS.IconButton
            emphasis="secondary"
            appearance="neutral"
            size="sm"
            shape="system"
            label="Close"
            onClick={() => emit(MESSAGE.CLOSE)}
          >
            <DS.IconX size={16} />
          </DS.IconButton>
        </div>

        {children}
        {footer}
      </div>
    </>
  )
}
