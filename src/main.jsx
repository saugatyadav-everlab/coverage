import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { loadDesignSystem } from './ds/loadDs'
import './app.css'

const container = document.getElementById('root')

function renderFatal(message) {
  container.innerHTML = ''
  const box = document.createElement('div')
  box.style.cssText =
    'font:14px/1.6 system-ui,sans-serif;max-width:34rem;margin:22vh auto;padding:0 24px;text-align:center'
  box.textContent = message
  container.appendChild(box)
}

// The design system must be on `window` before any component renders, so we
// gate the first render on it rather than suspending mid-tree.
loadDesignSystem().then(
  () => createRoot(container).render(<StrictMode><App /></StrictMode>),
  (error) => {
    console.error(error)
    renderFatal("Couldn't load the Everlab design system. Please refresh the page.")
  },
)
