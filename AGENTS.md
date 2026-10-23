# AGENTS.md

Project rules for **Fieldnotes** (`design-library`), a curated catalogue of design references.

Read this before changing UI. It records the stack, the icon rule, the token
system, and the two reference sites the product is modelled on.

---

## 1. Stack

| Concern | Choice | Where |
| --- | --- | --- |
| Framework | React 19 + TypeScript 5.8 | `src/` |
| Build | Vite 7 (`@vitejs/plugin-react`) | `vite.config.ts` |
| Styles | Tailwind CSS v4 (`@tailwindcss/vite`), CSS Modules for components | `src/index.css` |
| Component library | **Arc** (uiarc.dev), vendored | `src/components/arc/` |
| Icons (app) | **Reicon** (`reicon-react`), glyph by glyph | `src/components/icons.ts` |
| Icons (inside Arc) | `lucide-react`, `strokeWidth={1.75}` | `src/components/arc/**` |
| Motion | `motion` (Motion for React) | `motion/react` |
| Audio | `@web-kits/audio` | `src/components/ui/sound.tsx` |
| Text morph | `torph` | `src/components/application/dashboard/resource-section-header.tsx` |
| Class merge | `cn` | `src/lib/utils.ts` |
| Surfaces | Fluid Functionalism `Elevated` / `SurfaceProvider` | `src/lib/elevated.tsx`, `src/lib/surface-context.tsx` |
| Data | `microlink` API for Open Graph, cached in `localStorage` | `src/lib/link-metadata.ts` |
| Fonts | Geist Sans (display) + Inter (body), Instrument Serif (Explore hero), via `@fontsource` | `src/main.tsx` |
Aliases: `@` -> `src`. shadcn registries are wired in `components.json`:
`@uiarc` -> `https://uiarc.dev/r/{name}.json`, `@kobra` -> `https://kobra.systems/r/{name}.json`.

Install Arc pieces with the shadcn CLI, never by hand-writing them:

```bash
npx shadcn@latest add @uiarc/button @uiarc/dialog
```

---

## 2. Icon rule (two libraries, one boundary)

**The app uses Reicon. Arc uses Lucide. Never mix inside one file.**

- Application code (`src/components/application/**`, `src/components/ui/**`,
  `src/pages/**`) imports icons **only** from `@/components/icons`.
- `@/components/icons` is a barrel of individual Reicon glyph imports. Add a
  glyph there; never import `reicon-react` directly in a component.
- `lucide-react` is allowed **only** inside `src/components/arc/**`, because
  Arc's own components are authored against it at `strokeWidth={1.75}`.
  Do not edit vendored Arc internals.

```ts
// good
import { ArrowUpRight, Folder, Heart } from '@/components/icons'
// bad
import { Heart } from 'lucide-react'          // app layer
import { Heart } from 'reicon-react/icons/Heart' // bypasses the barrel
```

Reicon glyphs are filled paths, not strokes. They take `size` and
`weight={'Outline' | 'Filled'}`. Sizes used in the app: 14, 15, 16, 17, 18, 20.

---

## 3. Components: Arc first

Arc is the design system. Compose it; do not restyle its internals.

**Use a component from the Arc catalog for every job the catalog covers.** The
catalog lives at `.claude/skills/arc/components.md`, and the "Instead of"
column names the hand-rolled thing to delete. If you catch yourself writing a
`<button>` with a tooltip, an empty state, a copy action, an initials tile, or
a number that changes, the catalog already has it:

| Job | Arc item |
| --- | --- |
| Anything clickable | `button` |
| A text field, a long field | `input`, `textarea` |
| A choice of many | `select`; `radio-group` for 2 to 5 visible options |
| A colour | `color-picker` |
| A short form that must interrupt | `dialog` |
| Detail beside the page | `drawer` |
| A small anchored control | `popover` |
| A hint on an unfamiliar control | `tooltip` |
| Copying a value | `copy-button` |
| Nothing to show yet | `empty-state` |
| A number that changes | `animated-counter` |
| A logo or initials | `avatar` |
| Two to five views of the same data | `segmented-control` |
| A status label | `badge` |

- `src/components/arc/foundation.css` is imported once in `src/main.tsx` and
  holds the base tokens. `src/index.css` is the **app layer** that overrides
  them for this product. Both are `:root` scoped, so `index.css` wins by
  load order.
- Arc components live in `src/components/arc/<name>/<name>.tsx` with a
  sibling `<name>.module.css`.
- Motion tokens live in `src/components/arc/motion-tokens.ts` and are
  re-exported as `@/components/arc/lib/motion-tokens`. Use
  `spring.smooth` (panels), `spring.snappy` (presses), `spring.morph`
  (shared highlights). Never hand-roll durations.
- Arc's own guidance: https://uiarc.dev/docs/ai, and the installed skill at
  `.claude/skills/arc/SKILL.md`.
- `shadcn add` prunes files it thinks are orphaned, so install a component
  and the ones it needs in the same command, then check the build.

Always: one `h1` per surface, one primary action, semantic tokens only,
weights 400/500 only, every state designed (empty, loading, error, disabled),
reduced motion handled.

Never: eyebrow/overline labels above headings, all-caps, em dashes in copy,
hand-made focus rings, raw hex on Arc surfaces, nested cards, decorative
gradients, a toast as the only confirmation.

---

## 4. Colour system

Two references, both read from the live sites:

- **aisdkagents.com/ai-components** -> the **colour and component shape**.
  Neutral, near-monochrome, hairline borders, pill filters, one black active
  pill.
- **designeer.xyz** -> the **application we are building**. Same catalogue
  product: browse, inspiration, resources, tools, portfolios, folders,
  favourites, search, submit, login.

Our token layer lives in `src/index.css` (light in `:root`, dark in
`:root.dark`). The rules that matter:

| Token | Light | Dark | Notes |
| --- | --- | --- | --- |
| `--hover` | `#ededed` | `#131313` | The hover fill. One step below `--selected`, one step above `--surface-muted`. |
| `--hover-foreground` | `#151515` | `var(--card-foreground)` | Anything that sits on a `--hover` fill. Always set it together with the fill. |
| `--background-secondary-hover` | `var(--hover)` | `var(--hover)` | Same fill as `--hover`. |
| `--background-tertiary-hover` | `var(--hover)` | `var(--hover)` | Same fill as `--hover`. |
| `--surface-muted` | `#f4f4f4` | `#131313` | A resting surface, one step off the page. Never a hover fill. |
| `--selected` | `#e7e7e7` | `#131313` | The selected row's fill. Slightly darker than `--hover`, so the active row still reads. |
| `--border` | `#e5e7eb` | `rgb(255 255 255 / 12%)` | Hairline only. |
| `--separator` | `#e1e3e7` | `rgb(255 255 255 / 12%)` | The hairline on a bordered surface, such as the mobile drawer. The dotted frame is `--dotted-rule`; the two are not the same thing. |
| `--card-surface` | `#ffffff` | `#060606` | Card face. |
| `--accent` | `#404040` | `oklch(80% 0 0)` | Neutral accent. Colour marks active/selected only. |

**Every hover fill in the app resolves to `--hover`, and everything that sits
on one resolves to `--hover-foreground`.** When you add a hover state, use both
tokens; do not write a new grey, and do not leave the label on the old
foreground colour.

The sidebar's rows are the trap: the label and the icon carry their own
Tailwind `group-hover:text-text-primary` utility, which beats the button's
own `color`. `src/index.css` re-asserts them with `.sidebar-nav-item:hover
.sidebar-item-label` and `.sidebar-nav-item[data-fluid-hover-active] svg`,
because rules outside Tailwind's utility layer win over the utilities.

Dark mode is `data-theme="dark"` plus the `.dark` class on `<html>` (both are
set by `src/pages/page.tsx`).

The theme is stored as a **preference** (`light`, `dark`, or `system`) and
resolved to a concrete theme at render. `system` follows
`prefers-color-scheme` live, through a `matchMedia` listener. The settings
popover owns that choice; the account menu does not.

The account lives in the top bar's right cluster, next to Favourites and the
submit button: the photo alone for the account. The account menu holds
Settings, Submissions and Sign out, and it opens without Arc's inline theme
switch, so there is one theme control in the app, not two.

The theme and the sound live in the settings popover, and that popover hangs
off the gear at the **foot of the sidebar**, not off the top bar. The popover
is controlled from the page (`settingsOpen`), so the account menu's Settings
item opens the same panel.

The sidebar carries no counts. A row is a label and a glyph, nothing else.

The sidebar is flat. It is a column on the page, not a floating panel: no
radius, no shadow, no inset from the edge. The mobile drawer is the one
exception, since it sits over the content and needs a surface of its own.

The page is held together by a **dotted frame**, the same fine dotted rule
the reference draws. It runs down the sidebar column's right edge and along
the foot of the top bar, and the two cross at the corner, so the logo sits in
the cell they cut out. The rule is `--dotted-rule` on `.app-shell`; the top
bar's copy starts at `--sidebar-width`, not at the left of the page. The top
bar sits on the page ground (`--page-background`) rather than on a
transparent one, so content that scrolls behind it passes under the bar and
not through it. On mobile the column is a drawer over the content, so there
is no corner to cut out and the rule runs the full width of the bar.

---

## 5. Motion

- Arc's `motionTokens` for anything Arc ships.
- `src/lib/springs.ts` for the fluid-hover list springs.
- `src/hooks/use-fluid-hover.ts` + `src/components/fluid-hover-highlight.tsx`
  own the shared hover highlight in the sidebar. Use them; do not hand-roll a
  second highlight.
- Every animation needs a `prefers-reduced-motion` branch. The global
  fallback lives at the bottom of `src/index.css`.

### Every pressable thing answers the pointer

A control that the app renders itself must have a hover state, a press state,
and a transition between them. Hover without a transition snaps and reads as
a glitch rather than a state.

```css
:where(.create-moodboard-item, .resource-moodboard-popover button, ...) {
  transition: transform var(--duration-fast) var(--ease-standard), background-color ..., color ..., border-color ...;
}
:where(...):active { transform: scale(.97); }
```

Use the repo's tokens: `--duration-fast` (160ms) and `--ease-standard`. Arc's
own buttons already carry a press spring, so they are not in that list.

Two deliberate exceptions:

- The **sidebar nav rows** do not scale. The shared hover highlight is a
  sibling element, so scaling the row would shrink the label inside a fill
  that stayed put.
- The **resource card's** click surfaces do not scale either. Hovering the
  card already reveals its actions, which is the affordance.

---

## 6. Layout

- One page container. Sidebar is a fixed 240px column; content sits in
  `.main-shell`.
- The resource grid is a CSS multi-column masonry (`.resource-grid` with
  `column-count`), not a grid of fixed rows.
- Check 390, 768, 1024, 1440px. No sideways scroll. Touch targets at least
  44px.

### Nested corners are concentric

A corner inside another corner shares its parent's centre, so the inner radius
is the outer radius minus the gap between them: **outer = inner + padding**.
Derive it, never eyeball it:

| Outer | Gap | Inner |
| --- | --- | --- |
| `--radius-card` 24px (resource card) | 16px padding | `--radius-card-inset` 16px |
| `--radius-sidebar` 16px (mobile drawer) | 8px inset | `--radius-sidebar-inset` 8px |
| `--radius-card` 24px (agent card) | 16px padding | `--radius-control` 8px |

The mobile drawer is 16px, matching the reference catalogue's sidebar card. Its
nav rows are 8px, because they sit 8px inside it. The desktop sidebar is flat,
so its rows take their radius from the pill token instead. When you nest a
rounded shape inside another, compute `outer radius - gap` and set it from a
token.

### Surfaces

Elevation comes from Fluid Functionalism's eight-level ladder, not from
hand-written shadows.

- `src/main.tsx` wraps the app in `<SurfaceProvider value={1}>` (1 is the page).
- A panel that floats uses `<Elevated offset={2}>` (popover, dropdown, select
  menu) or `<Elevated offset={4}>` (dialog, modal). The offset is relative to
  whatever it opened from, so a popover inside a dialog stays above it.
- `surfaceClasses(level)` is the manual form, for components that cannot wrap
  their panel in `Elevated`.
- The level ladder and the shadow ladder are the `--surface-1` to
  `--surface-8` and `--shadow-1` to `--shadow-8` tokens in `src/index.css`.
  Both have light and dark steps; in dark the steps are real, in light the
  elevation reads through the shadow.

Arc's `Popover` and `Dialog` already wrap their panel in `Elevated`, so a
popover inside a dialog climbs the ladder on its own.

### Pills

The nav rows, the search field, and the favourites link are all pills
(`--radius-pill`). The filter tabs are Arc `Button`s, not hand-rolled chips:
pick `variant="secondary"` for an inactive tab and `variant="primary"` for the
active one, and let Arc own the hover, press, and focus behaviour. Do not add
a `.resource-tag` style back. The tab strip sets `--radius-control` to the
pill radius, so the rounded shape comes from the token, not from a rule.

---

## 7. State and data

- Resources, moodboards and theme persist in `localStorage` under the
  `fieldnotes-*` keys. Read them through the `store.read` helper in
  `src/pages/page.tsx`.
- Cards share one surface. `src/components/card.tsx` renders `.ui-card`, and
  `.ui-card` owns the border, radius, fill and shadow in both themes. A card
  anywhere in the app uses it, so the dark border is the same everywhere.
  Pass `href` to `Card` and it renders a link rather than a card around one.
- The concept is a **moodboard** (`LibraryMoodboard`, `moodboardId`). It used
  to be called a folder; the rename went through the type, the props, the
  components, the CSS hooks, and the copy.
- Seed catalogue lives in `src/catalog.ts`. The categories come from Design
  Engineer Tools; the `collections` array groups them into the shelves the
  sidebar shows (Design Inspiration, UI, Graphics, Mockups, Illustrations,
  Icons, Style, Colours, Fonts, Tools). A shelf may hold several categories,
  and those show up as a tag strip under the heading.
- The catalogue is versioned. When its shape changes, bump `catalogVersion`
  in `src/pages/page.tsx` so a stale copy in `localStorage` is replaced by
  the new seed instead of being mixed with it.
- A catalogue entry may carry a one-line description:
  `['Name', 'https://url', 'What it does.']`. Search matches name, url,
  description and category, so the description is what makes an entry
  findable by purpose rather than by name.
- The Explore page (`src/components/application/dashboard/explore-page.tsx`)
  is the landing surface: the large search is the hero, and the shelves sit
  under it as rows of six. Clicking a row takes you to that shelf in the
  sidebar. It is the only view with the big search, so the top bar's field
  steps aside while it is open.
- A resource added through the submit dialog is tagged `submitted`, and the
  Submissions view lists them.
- The agents directory lives in `src/catalog-agents.ts` and renders from
  `src/components/application/dashboard/agents-library.tsx`. Each agent's logo
  is its own favicon, with its initials as the fallback.
- `src/lib/link-metadata.ts` fetches Open Graph data from microlink. It
  caches in `localStorage` and dedupes in-flight requests.

---

## 8. Checks before finishing

```bash
npm run build   # tsc -b && vite build
```

Then confirm, in both themes: hover fills are `--hover`, focus rings come
from Arc, empty and loading states exist, and nothing overflows horizontally.
