Gating & Renewal is now React, deployable to Cloudflare Pages. Two pages: `/` (Bridge) and `/refresh`. Uses the real `@everlab/app-ui` DS, so it's pixel-identical to the comps.

*Everything is driven by one JSON payload we post into the iframe.* Nothing is hardcoded.

*Page 1 — Bridge.* We send `tracked`, `lastTested`, `bioAge`, and the panels, each with its markers grouped as `outdated` / `never` / `current`. Every count on the page is derived from that — outdated total, valid markers, percentages, the dial, the per-panel breakdown. We never send a number that can be computed.

*Page 2 — Refresh.* Each item says how many markers it contributes (`markers: 16`) and we work out `16 / outdated` for the ring and the percentage. Three cases, all handled:
• normal item — selectable, adds to the ring
• `status: "paid"` — locked, free, already counted in the ring on load
• `contributesToProgress: false` — still shows its marker count, ring doesn't move
`recommended: true` puts an item in the *Recommended* section, independent of whether it contributes anything.

Member pricing: selecting Baseline re-prices every add-on, in the basket or not. Subtotal stays at list price, saving shows as its own discount line. 13 assertions cover this.

*Checkout* — the button just emits `everlab:refresh:checkout` with the selection, totals and coverage. Our modal opens from there; it's not built in this app.

*Why postMessage and not URL params:* biomarker values in a query string end up in browser history, server logs and `Referer` headers. postMessage has no size limit and leaves no trace. `?d=` (gzipped, ~1.5KB for 500 markers) still works for standalone links.

There's a test console at `/embed-example.html` — edit the payload JSON on the left, hit Send, watch both pages re-render. Has scenario presets, a live URL-size readout, and a log of every event we'd emit. Best way to see the whole contract in one screen.
