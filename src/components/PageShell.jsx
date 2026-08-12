import { useEffect, useState } from 'react'

import { observeHeight } from '../data/host'

/**
 * Shared chrome: the full-height, container-query shell and (behind
 * `?preview=1`) the desktop/mobile switcher the comps used. The embedding
 * modal owns the header and close button, so the shell renders neither.
 */
export function PageShell({ children, footer }) {
  const [viewport, setViewport] = useState('desktop')
  const previewMode = new URLSearchParams(window.location.search).get('preview') === '1'

  // Advisory height reporting for hosts that autosize (Everlab's modal fixes the
  // height and ignores it — the shell fills that height instead).
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
        {children}
        {footer}
      </div>
    </>
  )
}
