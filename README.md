# Everlab — Gating & Renewal

React port of the `Bridge` and `Refresh` comps, built to be embedded as an iframe
in the Everlab app and deployed to Cloudflare Pages.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
```

| Route | Comp | What it does |
| --- | --- | --- |
| `/` | `Bridge v2.dc.html` | Coverage summary, panels, biomarkers at risk |
| `/refresh` | `Refresh.dc.html` | Product selection; the CTA hands off to your checkout modal |
| `/embed-example.html` | — | Test console (see below) |

The design system is the real `@everlab/app-ui` bundle, dropped into `public/ds/`
and loaded as a browser global. It externalises React, so `src/ds/loadDs.js`
hands it the app's own React instance before it evaluates — one React, so hooks
and context work across the boundary. All 461 exports are available as `DS.*`,
including `Modal` if you ever want the checkout modal in here too.

## The payload

Everything both pages render comes from one object. Full field reference with
comments: [`src/data/schema.js`](src/data/schema.js). A worked example:
[`public/embed-example-payload.js`](public/embed-example-payload.js).

```jsonc
{
  "profile": {
    "tracked": 108,              // total biomarkers tracked
    "lastTested": "2026-02-14",
    "bioAge": 42,
    "bioAgeKnown": false         // false => rendered blurred, with the tooltip
  },

  "panels": [{
    "id": "hormone",
    "name": "Hormone panel",
    "markers": {                 // grouped form — smallest on the wire
      "outdated": ["LH", "FSH"],
      "never":    ["Reverse T3"],
      "current":  ["TSH"]
    }
  }],

  "atRisk": [{
    "name": "ApoB", "value": 1.28, "unit": "g/L",
    "lastTested": "2025-06-10",
    "status": "outdated",        // drives the stale warning icon
    "verdict": "out-of-range",   // drives the badge colour + label
    "position": 0.84             // optional 0..1 marker on the range bar
  }],

  "membership": { "id": "baseline", "name": "Baseline Membership",
                  "price": 299, "markers": 40, "perks": ["…"] },
  "products":   [ /* see below */ ]
}
```

**Counts are derived, never sent.** `outdated` is the sum of markers with status
`outdated`; `valid` is `tracked − outdated`; the percentages and the dial follow
from those. Send an explicit `profile.outdated` only if you're showing a subset
of panels but want to count every marker you hold.

> One inherited quirk, carried over deliberately: `valid = tracked − outdated`
> counts never-tested markers as valid. That's what the comp does (108 tracked,
> 64 outdated, "Valid 44" — 10 of which have never been tested). `neverTested`
> is exposed separately if you'd rather split it.

Marker status accepts synonyms (`stale`, `never_tested`, `ok`, `o`/`n`/`c`, …)
and both the grouped and `[{ name, status }]` array forms, so you can send
whatever your API already produces.

Panel rows are **title + marker count only** — no artwork and no placeholder, so
nothing has to be fetched per panel. `panels[].image` is not read. Product images
on the Refresh page are unaffected.

## How page 1 relates to page 2

The Refresh page's items are priced and sized against the panel data from the
Bridge page. Each item states its own contribution; the page computes the
percentage and the ring from it. **Never send a percentage.**

```jsonc
"products": [
  { "id": "dexa", "name": "DEXA Scan", "why": "Recommended for your age",
    "price": 499, "memberPrice": 399, "markers": 16 },

  { "id": "vo2",  "name": "VO2 Max", "price": 399, "memberPrice": 299,
    "markers": 8, "status": "paid" },          // locked; already in the ring

  { "id": "apoe", "name": "ApoE Genetic Test", "why": "Never tested",
    "price": 249, "memberPrice": 199, "markers": 1,
    "contributesToProgress": false }            // "Outside your outdated markers"
]
```

- `markers` — how many markers this item covers. `markers / outdated` gives the
  percentage and the ring fill.
- `status: "paid"` — already booked. Never charged, can't be deselected, and its
  contribution is in the summary ring from first paint.
- `contributesToProgress: false` — a new test rather than a retest. The card
  still shows its marker count; the ring doesn't move.
- `why` — your sub-line under the name, verbatim. Nothing is generated; a
  product without one renders with no sub-line at all.
- `recommended: true` — currently has **no visual effect**. The Recommended
  section was removed; every add-on now sits under **Go further for full
  coverage**, ordered by contribution with paid items last. The flag only
  switches off the greedy derivation described below. Kept in the schema
  because the section may come back.
- If you omit `markers` but pass `covers: { panels: ["hormone"] }`, the count is
  derived from that panel's outdated markers, and overlapping items are
  de-duplicated instead of double-counted.

### The at-home draw

One charged item is **not** in the payload: the at-home blood draw
([`src/data/atHome.js`](src/data/atHome.js), $79). It belongs to the Baseline
plan rather than being a product of its own — it appears inside the plan's card,
is revealed only once the plan is selected, and is dropped again if the plan is
deselected. It adds to the total but contributes no markers, so the coverage
ring does not move when it's ticked. Lift it into the payload (e.g.
`membership.atHome`) if the price ever needs to vary by member.

### Pricing rules

`memberPrice` applies to every add-on the moment the membership is selected,
whether it was already in the basket or added afterwards. Subtotal stays at list
price and the saving shows as its own **Member discount** line, so
`subtotal − discount = total` reads correctly. Items with no `memberPrice` are
never discounted. Paid items never touch the money.

These rules are pinned by assertions in
[`src/data/products.test.js`](src/data/products.test.js) — 18 cases covering
membership toggling in and out of a populated cart, prepaid items, missing
member prices, zero-marker tests, non-contributing tests, and the progress cap.
Run them from the test console, or in any browser console on the dev server:

```bash
await import('/src/data/products.test.js').then(m => console.table(m.run().results))
```

## Getting data in

Resolution order — first hit wins:

| Source | When to use |
| --- | --- |
| `postMessage` | **Production.** No size limit, no CORS, and biomarker values never touch browser history, server logs or `Referer` headers. |
| `?d=<gzip+base64url>` | Standalone or shareable links. The largest fixture — 8 panels, 124 markers — is 9.3KB of JSON and 3.2KB in the URL. Keep the whole URL under 8KB. |
| `?data=<base64url>` | Same, uncompressed — readable while debugging. |
| `?src=<url>` | Page fetches the JSON itself. Needs CORS. |
| demo payload | Dev, or `?demo=1`. |

Health data in a query string is a real leak even when it fits, which is why
`postMessage` is the recommendation rather than just the default.

Independent of the source, either page also accepts:

| Flag | Effect |
| --- | --- |
| `?theme=light\|dark` | Overrides both the host theme message and the OS preference |
| `?timeout=8000` | How long to wait for the host's payload before erroring. Default 8000ms |
| `?preview=1` | Adds the comps' desktop/mobile switcher |

### postMessage contract

Inbound (your app → page):

```js
frame.contentWindow.postMessage({ type: 'everlab:coverage:data', payload }, origin)
frame.contentWindow.postMessage({ type: 'everlab:coverage:theme', theme: 'dark' }, origin)
```

Outbound (page → your app). Each is also dispatched as a `CustomEvent` of the
same name on `window`, for non-iframe embeds:

| Message | Meaning |
| --- | --- |
| `everlab:coverage:ready` | Mounted and waiting — send the payload |
| `everlab:coverage:resize` | `{ height }` — size the iframe, no nested scrollbar |
| `everlab:coverage:close` | The X was pressed |
| `everlab:coverage:navigate` | `{ page: 'bridge' \| 'refresh' }` |
| `everlab:coverage:scrolltop` | Route changed — scroll your frame back to the top |
| `everlab:refresh:checkout` | `{ selection, totals, coverage }` — **open your modal here** |

The page replies to the exact origin that sent it data. Set `VITE_HOST_ORIGIN`
(comma-separated) to reject inbound messages from anywhere else.

The checkout modal is deliberately **not** built here — the button emits the
event and your app takes over.

## Testing

`/embed-example.html` is a test console and doubles as the integration
reference — its `window.addEventListener('message', …)` switch is exactly what a
host needs, including the line where your checkout modal opens. Everything else
in the file is test scaffolding.

- Edit the payload JSON on the left, hit **Send**, watch the pages re-render.
- Three scenario presets built from Everlab's real panels and markers: **Small**
  (4 panels), **Medium** (6, adds a prepaid item), **Big** (8, adds a
  non-contributing item). Panel dates are derived from today, so no fixture
  goes stale.
- Live size readout: raw JSON vs. the `?d=` value, so you can see URL headroom.
- **Open as ?d= URL** tests the standalone path in a new tab.
- **Run tests** runs the pricing assertions.
- The event log shows every message the page sends, including the checkout
  payload your modal will receive.

Also useful:

```bash
npm run encode -- ./payload.json https://coverage.example.com/
```

Prints the `?d=` value, the full URL and the compression ratio, and exits
non-zero if the URL would exceed 8KB.

Breakpoints are container queries on the shell, so they follow the real iframe
width rather than the window — a narrow frame on a desktop gets the narrow
layout. Resize the frame in the console, or use `?preview=1`, to check.

## Deploying to Cloudflare Pages

Build command `npm run build`, output directory `dist`.

- `public/_redirects` — SPA fallback so `/refresh` deep-links work.
- `public/_headers` — immutable caching for `/ds` and `/assets`, plus
  `noindex`, `no-referrer` and `nosniff`.

**Before going live:** `_headers` ships
`Content-Security-Policy: frame-ancestors *`. Replace the `*` with your real app
origins, or anyone can frame this page.
