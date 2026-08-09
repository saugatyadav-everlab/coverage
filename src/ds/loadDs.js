/**
 * Loads the Everlab design system (`@everlab/app-ui`, shipped as a prebuilt
 * browser global in `public/ds/`).
 *
 * The bundle externalises React: internally it does `var R = window.React` and
 * builds its own jsx-runtime from `R.createElement`. So we hand it *our* npm
 * React instance before loading it — one React, one hook dispatcher, context
 * works across the boundary.
 *
 * The CSS is linked from index.html so tokens and fonts are in place before
 * first paint.
 */

import React from 'react'
import ReactDOM from 'react-dom'
import * as ReactDOMClient from 'react-dom/client'

const BUNDLE_URL = `${import.meta.env.BASE_URL}ds/_ds_bundle.js`

let loadPromise = null

export function loadDesignSystem() {
  if (loadPromise) return loadPromise

  // Must be set before the bundle evaluates.
  window.React = React
  window.ReactDOM = Object.assign({}, ReactDOM, ReactDOMClient)

  loadPromise = new Promise((resolve, reject) => {
    if (window.EverlabAppUI) return resolve(window.EverlabAppUI)

    const script = document.createElement('script')
    script.src = BUNDLE_URL
    script.async = false
    script.onload = () =>
      window.EverlabAppUI
        ? resolve(window.EverlabAppUI)
        : reject(new Error('Design system loaded but did not define window.EverlabAppUI'))
    script.onerror = () => reject(new Error(`Failed to load the design system from ${BUNDLE_URL}`))
    document.head.appendChild(script)
  })

  return loadPromise
}

export function getDesignSystem() {
  if (!window.EverlabAppUI) {
    throw new Error('Design system not loaded yet — await loadDesignSystem() before rendering')
  }
  return window.EverlabAppUI
}

/**
 * Namespace proxy so components can write `<DS.Button>` with a normal static
 * import. Lookups resolve at render time, after the bundle has loaded.
 */
export const DS = new Proxy(
  {},
  {
    get(_target, key) {
      if (key === Symbol.toPrimitive || key === '$$typeof') return undefined
      const component = getDesignSystem()[key]
      if (component === undefined) {
        throw new Error(`"${String(key)}" is not exported by the Everlab design system`)
      }
      return component
    },
    has: (_target, key) => key in getDesignSystem(),
  },
)
