import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { DS } from './ds/loadDs'
import BridgePage from './pages/BridgePage'
import RefreshPage from './pages/RefreshPage'
import { CoverageProvider, useCoverage } from './data/CoverageProvider'
import { MESSAGE, emit } from './data/host'
import { useTheme } from './useTheme'

/**
 * Reset scroll on navigation — React Router keeps the previous position, which
 * dropped the member partway down the Refresh page.
 *
 * Two scrollers to consider. Ours, and the host's: when the embedding app sizes
 * the iframe to our content there is no internal scrollbar at all, so the page
 * that actually scrolls is the parent's — which we can't touch cross-origin.
 * Hence the message; the host has to act on it for the fix to be complete.
 */
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    emit(MESSAGE.SCROLL_TOP, { page: pathname === '/refresh' ? 'refresh' : 'bridge' })
  }, [pathname])

  return null
}

/**
 * Holds the routes back until a payload resolves. There is deliberately no
 * loading or error UI: this flow is only shown to lapsed members, and the
 * embedding app owns that chrome. On failure we log and emit, and the host
 * decides what the member sees.
 */
function PayloadGate({ children }) {
  const { status, error } = useCoverage()

  useEffect(() => {
    if (status === 'error') emit(MESSAGE.ERROR, { message: error?.message ?? 'Could not resolve payload' })
  }, [status, error])

  return status === 'ready' ? children : null
}

export default function App() {
  useTheme()

  return (
    <DS.MantineProvider theme={DS.dsSyncMantineTheme}>
      <CoverageProvider>
        <BrowserRouter>
          <ScrollToTop />
          <PayloadGate>
            <Routes>
              <Route path="/" element={<BridgePage />} />
              <Route path="/refresh" element={<RefreshPage />} />
              <Route path="*" element={<Navigate to={{ pathname: '/', search: window.location.search }} replace />} />
            </Routes>
          </PayloadGate>
        </BrowserRouter>
      </CoverageProvider>
    </DS.MantineProvider>
  )
}
