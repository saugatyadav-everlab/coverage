import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { DS } from './ds/loadDs'
import BridgePage from './pages/BridgePage'
import RefreshPage from './pages/RefreshPage'
import { CoverageProvider, useCoverage } from './data/CoverageProvider'
import { useTheme } from './useTheme'

function Centred({ children }) {
  return (
    <div
      className="bg-bg-neutral-primary-invert-100 text-fg-neutral-primary-100"
      style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}
    >
      <div style={{ maxWidth: 460, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>{children}</div>
    </div>
  )
}

/** Holds the routes back until a payload has resolved. */
function PayloadGate({ children }) {
  const { status, error, reload } = useCoverage()

  if (status === 'loading') {
    return (
      <Centred>
        <DS.Spinner />
        <span className="text-fg-neutral-secondary-100 typography-body-200-regular">Loading your health profile…</span>
      </Centred>
    )
  }

  if (status === 'error') {
    return (
      <Centred>
        <div className="typography-body-400-medium">We couldn&rsquo;t load your health data</div>
        <div className="text-fg-neutral-secondary-100 typography-body-200-regular" style={{ lineHeight: 1.5 }}>
          {error?.message ?? 'Something went wrong.'}
        </div>
        <DS.Button emphasis="secondary" appearance="neutral" size="sm" onClick={reload}>
          Try again
        </DS.Button>
      </Centred>
    )
  }

  return children
}

export default function App() {
  useTheme()

  return (
    <DS.MantineProvider theme={DS.dsSyncMantineTheme}>
      <CoverageProvider>
        <BrowserRouter>
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
