import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { MESSAGE, listen } from './host'
import { resolvePayload } from './resolvePayload'
import { normalisePayload } from './schema'
import { resolveProducts } from './products'

const CoverageContext = createContext(null)

export function CoverageProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', payload: null, source: null, error: null })

  const load = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading', error: null }))
    try {
      const { payload, source } = await resolvePayload(window.location.search)
      setState({ status: 'ready', payload: normalisePayload(payload), source, error: null })
    } catch (error) {
      console.error('[coverage] could not resolve payload', error)
      setState({ status: 'error', payload: null, source: null, error })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Stay subscribed after the first load so the host can push fresh data (e.g.
  // after the member books a test) without a reload.
  useEffect(
    () =>
      listen({
        [MESSAGE.DATA]: (message) => {
          const next = message.payload ?? message.data
          if (next) setState({ status: 'ready', payload: normalisePayload(next), source: 'postMessage', error: null })
        },
      }),
    [],
  )

  const value = useMemo(() => {
    const catalogue = state.payload ? resolveProducts(state.payload) : null
    return { ...state, catalogue, reload: load }
  }, [state, load])

  return <CoverageContext.Provider value={value}>{children}</CoverageContext.Provider>
}

export function useCoverage() {
  const context = useContext(CoverageContext)
  if (!context) throw new Error('useCoverage must be used inside <CoverageProvider>')
  return context
}

/** Convenience: the normalised payload, once it's ready. */
export function useCoverageData() {
  return useCoverage().payload
}
