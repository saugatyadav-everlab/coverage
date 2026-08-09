Gating & Renewal is now React and ready to deploy: https://github.com/saugatyadav-everlab/coverage

Two pages — `/` (Bridge) and `/refresh`. Uses the real `@everlab/app-ui` design system, so it matches the comps exactly.

*Everything renders from one JSON payload we post into the iframe.* Nothing is hardcoded.

*Page 1 — Bridge.* We send `tracked`, `lastTested`, `bioAge`, and the panels with their markers grouped as `outdated` / `never` / `current`. Every number on the page is derived from that — outdated total, valid markers, percentages, the dial, the per-panel breakdown. We never send anything that can be computed.

*Page 2 — Refresh.* Each item says how many markers it contributes and we work out the share and the ring from it. Three cases, all covered:
• normal item — selectable, adds to the ring
• `status: "paid"` — locked, free, already in the ring on load
• `contributesToProgress: false` — still shows its marker count, ring doesn't move
`recommended: true` puts an item in the *Recommended* section, whether or not it contributes anything.

Member pricing: selecting Baseline re-prices every add-on, in the basket or not. Subtotal stays at list price, the saving shows as its own discount line. 13 assertions cover this.

*Checkout* just emits `everlab:refresh:checkout` with the selection, totals and coverage — our modal opens from there. Not built in this app.

*Why postMessage over URL params:* biomarker values in a query string end up in browser history, server logs and `Referer` headers. postMessage has no size limit and leaves no trace. `?d=` (gzipped, ~1.5KB for 500 markers) still works for standalone links.

There's a test console at `/embed-example.html` — edit the payload on the left, hit Send, watch both pages re-render. Scenario presets, live URL-size readout, and a log of every event we emit. Quickest way to see the whole contract on one screen.
