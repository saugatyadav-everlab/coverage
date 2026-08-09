import { useEffect, useState } from 'react'

import { MESSAGE, listen } from './data/host'

/**
 * Applies the `theme-dark` class the design system's tokens key off.
 *
 * Precedence: `?theme=` in the URL, then whatever the host posts via
 * `everlab:coverage:theme`, then the OS preference. The comps did the last of
 * those only; the first two exist so an embedding app can keep the iframe in
 * step with its own theme switcher.
 */
export function useTheme() {
  const [override, setOverride] = useState(
    () => new URLSearchParams(window.location.search).get('theme') || null,
  )

  useEffect(
    () =>
      listen({
        [MESSAGE.THEME]: (message) => setOverride(message.theme ?? null),
      }),
    [],
  )

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const dark = override === 'dark' || (override !== 'light' && query.matches)
      document.documentElement.classList.toggle('theme-dark', dark)
      document.body.classList.toggle('theme-dark', dark)
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    }

    apply()
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [override])

  return override
}
