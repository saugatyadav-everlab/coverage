## Wrapping and setup

Every screen must be wrapped once in `MantineProvider` — several components (`Avatar`, `Loader`, `RadioGroup`, `Popover`, `Command`, `DatePicker`, `Carousel`) render via Mantine primitives internally and silently fail (missing styles, or `MantineProvider was not found in component tree` at runtime) without it:

```tsx
import { MantineProvider } from '@mantine/core'

<MantineProvider theme={theme}>
  <YourScreen />
</MantineProvider>
```

Don't build your own theme object — this library ships its own `theme` value already bound to the design tokens below; use it as-is.

## Styling idiom: prefixed Tailwind token classes

Style with Tailwind utility classes, never inline styles or raw hex/`oklch()` values. Every color and typography utility here is a **token class**, prefixed by category rather than a bare Tailwind color name:

| Family        | Example                          | Use for                          |
|---------------|-----------------------------------|-----------------------------------|
| `bg-bg-*`     | `bg-bg-neutral-primary-100`       | background fills                  |
| `text-fg-*`   | `text-fg-neutral-primary-invert-100` | text/icon foreground colors    |
| `border-br-*` | `border-br-sentiment-negative-100` | border colors               |
| `typography-*`| `typography-body-100-medium`     | font size + weight + line-height  |

Common groups within `bg-bg-*` / `text-fg-*`: `neutral-primary`, `neutral-secondary`, `neutral-tertiary` (surfaces and text, light-to-dark ranked by the `-100`/`-200`/`-300` suffix), `sentiment-negative-primary`/`sentiment-warning-primary`/`sentiment-positive-primary` (status colors, each with a paler `-secondary` counterpart), `brand-{blue,orange,earth,yellow,black}` (brand accents), `range-{optimal,suboptimal,out-of-range}-primary` (health-metric ranges). `border-br-*` follows the same neutral/sentiment/brand groups but without the `-primary`/`-secondary` split (e.g. `border-br-neutral-primary-100`, `border-br-sentiment-negative-100`). A `-invert-100` suffix (e.g. `text-fg-neutral-primary-invert-100`) is the ON-fill counterpart — use it for content painted on top of the matching `bg-bg-*` fill, not as a dark-mode variant.

Never reference a `--ds-color-*`/`--ds-font-*` CSS custom property directly (`fill: var(--ds-color-...)`, `style={{ color: 'var(...)' }}`) — always go through the Tailwind class. A handful of chart/gauge components in this library do this internally and it's a known source of the ONE place their color can silently pick the wrong theme; don't repeat the pattern in your own layout code.

Radii and spacing also follow this pattern: prefer semantic scale classes (`rounded-md`, `rounded-2xl`) over arbitrary pixel values.

## Where the truth lives

Before styling a component, read its own `.prompt.md` (usage + prop reference) and `.d.ts` (exact prop types) in this project — they're generated from the real source and are always in sync with what's bundled. The full token/utility-class vocabulary is in the bound `styles.css` (imports `_ds_bundle.css`, which carries every color/typography/spacing utility this library defines) — grep it for a token family before inventing a new class name.

## Example

```tsx
import { MantineProvider } from '@mantine/core'
import Badge from '@everlab/app-ui/core/badges/Badge'
import Button from '@everlab/app-ui/core/buttons/Button'
import CardBody from '@everlab/app-ui/core/cards/CardBody'

<MantineProvider theme={theme}>
  <CardBody className="bg-bg-neutral-primary-100 rounded-2xl p-4">
    <Badge variant="secondary">Active</Badge>
    <p className="typography-body-200-regular text-fg-neutral-secondary-100">
      Everything looks good.
    </p>
    <Button appearance="neutral" size="sm">View details</Button>
  </CardBody>
</MantineProvider>
```

# EverlabAppUI (@everlab/app-ui@0.0.0)

This design system is the published @everlab/app-ui React library, bundled as a single
browser global. All 58 components are the real upstream code.

## Where things are

- `_ds_bundle.js` — the whole-DS bundle at the project root; loads every component to `window.EverlabAppUI`. First line is a `/* @ds-bundle: … */` metadata header.
- `styles.css` — the single stylesheet entry: it `@import`s the tokens, fonts, and component styles (`_ds_bundle.css`). Link this one file.
- `components/<group>/<Name>/<Name>.prompt.md` (example JSX + variants), `<Name>.d.ts` (types), `<Name>.html` (variant grid).
- `tokens/*.css` — CSS custom properties, names verbatim from upstream.
- `fonts/` — `@font-face` files + `fonts.css` (when the package ships fonts).

For a specific component, `read_file("components/<group>/<Name>/<Name>.prompt.md")`.

## Loading

Add these two lines to your page once (React must be on the page first):

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```

Components are then available at `window.EverlabAppUI.*`. Mount into a dedicated child node (e.g. `<div id="ds-root">`), not the host page's own React root, so the two trees don't collide:

```jsx
const { Accordion } = window.EverlabAppUI;
ReactDOM.createRoot(document.getElementById('ds-root')).render(<Accordion />);
```

Wrap the tree in the provider — most components read theme/i18n from context:

```jsx
<MantineProvider theme={dsSyncMantineTheme}>{children}</MantineProvider>
```

## Tokens

1883 CSS custom properties from @everlab/app-ui. Names are
preserved verbatim from upstream. They are declared inside `_ds_bundle.css` (this DS ships one compiled stylesheet rather than separate token files).

- **color** (747): `--tw-animation-fill-mode`, `--tw-border-spacing-x`, `--tw-border-spacing-y`, …
- **spacing** (169): `--tw-space-y-reverse`, `--tw-space-x-reverse`, `--tw-inset-shadow`, …
- **typography** (313): `--tw-font-weight`, `--tw-tracking`, `--mantine-webkit-font-smoothing`, …
- **radius** (54): `--mantine-radius-default`, `--mantine-radius-xs`, `--mantine-radius-sm`, …
- **shadow** (32): `--tw-shadow`, `--tw-shadow-alpha`, `--tw-ring-shadow`, …
- **other** (568): `--tw-animation-delay`, `--tw-animation-direction`, `--tw-animation-duration`, …

## Components

### accordions
- `Accordion`

### alerts
- `AlertCard`

### announcement-floating
- `AnnouncementFloating` (compound: `AnnouncementFloating.Title`, `AnnouncementFloating.Description`, `AnnouncementFloating.Image`, `AnnouncementFloating.ImageBadge`, `AnnouncementFloating.ActionButton`, `AnnouncementFloating.Actions`)

### avatars
- `Avatar`

### badges
- `Badge`
- `BadgeMono`
- `BadgeNotification`
- `BadgeStatus`

### breadcrumbs
- `Breadcrumb`

### buttons
- `Button`
- `IconButton`

### cards
- `CardBody` (compound: `CardBody.Root`, `CardBody.Header`, `CardBody.Footer`, `CardBody.Content`)

### interactive
- `CardInteractive`
- `ListItemInteractive`

### carousels
- `Carousel`

### core
- `Checkbox`
- `Command`
- `Separator`

### form-fields
- `CheckboxField` — Interactive checkbox field component with form validation support.
- `DobField` — Date of birth field component with automatic date formatting (dd/mm/yyyy) and form validation support. The field automatically formats input
- `InputField` — Interactive input field component with form validation support.
- `RadioGroupField` — Interactive radio group field component with form validation support.
- `SelectField`
- `TextareaField` — Interactive textarea field component with form validation support.

### progress
- `CircularProgress`
- `Progress`

### date-pickers
- `DatePicker`

### indicators
- `DottedArcGauge` (compound: `DottedArcGauge.Dot`)
- `SegmentedArcGauge`

### dropdown-menus
- `DropdownMenu`

### empty-states
- `EmptyState` (compound: `EmptyState.Icon`, `EmptyState.Body`, `EmptyState.Heading`, `EmptyState.Subheading`, `EmptyState.Actions`, `EmptyState.ActionButton`)

### flow-step-indicators
- `FlowStepIndicator`

### overlays
- `FullScreenOverlay` (compound: `FullScreenOverlay.Content`, `FullScreenOverlay.Dismiss`, `FullScreenOverlay.DismissButton`, `FullScreenOverlay.Footer`, `FullScreenOverlay.Body`, `FullScreenOverlay.BodySection`, …)

### labels
- `Label` — Label component that displays field labels with optional tooltip and support text. Designed to be used with form fields to provide clear lab

### charts
- `LineChart`
- `PieChart`

### loading
- `Loader`
- `Skeleton`
- `Spinner`
- `TextSkeleton`

### markdown
- `MarkdownRenderer`

### media
- `MediaIcon`
- `MediaImage`
- `MediaLogo`

### chat-kit
- `MessageBubble`

### modals
- `Modal` (compound: `Modal.Content`, `Modal.Header`, `Modal.Body`, `Modal.BodyContent`, `Modal.Footer`, `Modal.FooterActionGroup`, …)

### popovers
- `Popover`

### snackbars
- `Snackbar`

### tabs
- `TabPill`
- `TabPillLoadingSkeleton`
- `TabPillOverflow` — A specialised tab pill for when there are more items to be displayed
- `Tabs`
- `TabsUnderlined`

### text-links
- `TextLink`

### title-groups
- `TitleGroup`

### toggles
- `Toggle`

### tool-cards
- `ToolCard` (compound: `ToolCard.Section`, `ToolCard.DetailsSection`, `ToolCard.ActionsSection`, `ToolCard.FooterSection`)

### tooltips
- `Tooltip` — Tooltip component that displays helpful information on hover. (compound: `Tooltip.ContainerContext`)
