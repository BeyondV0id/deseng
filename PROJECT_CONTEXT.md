# DesEng (design-library) — session context

One-file summary. Read this instead of re-reading AGENTS.md + exploring the codebase each session.

## Stack
- React 19 + TypeScript 5.8, Vite 7 (`@vitejs/plugin-react`), Tailwind CSS v4 (`@tailwindcss/vite`) + CSS Modules for components.
- Arc UI (vendored `src/components/arc/`), motion (Motion for React), `@web-kits/audio`, `torph` (text morph), `cn` (class merge), Fluid Functionalism `Elevated`/`SurfaceProvider`, `microlink` API (OG data, `localStorage` cached), Geist Sans via `@fontsource`.
- Alias `@` -> `src`. `components.json` registries: `@uiarc`, `@kobra`.
- Build: `npm run build` = `tsc -b && vite build`.

## Icon rule (boundary is strict)
- App code (`src/components/application/**`, `src/components/ui/**`, `src/pages/**`) imports icons **only** from `@/components/icons` (Reicon barrel). Add glyphs there; never import `reicon-react` directly in a component.
- `lucide-react` allowed **only** inside `src/components/arc/**` at `strokeWidth={1.75}`.
- Reicon glyphs take `size` and `weight={'Outline'|'Filled'}`. Sizes used: 14, 15, 16, 17, 18, 20.

## Arc first
Compose Arc; don't restyle internals. Use catalog item for every job it covers:
button / input / textarea / select / radio-group / color-picker / dialog / drawer / popover / tooltip / copy-button / empty-state / animated-counter / avatar / segmented-control / badge.
- `src/components/arc/foundation.css` imported once in `src/main.tsx`; `src/index.css` is app-layer override (wins by load order).
- Motion tokens from `src/components/arc/motion-tokens.ts` (re-exported `@/components/arc/lib/motion-tokens`): `spring.smooth` panels, `spring.snappy` presses, `spring.morph` shared highlights. Never hand-roll durations.
- `src/components/arc/<name>/<name>.tsx` + sibling `.module.css`.

## The two references
- `aisdkagents.com/ai-components` -> colour + component shape (neutral, near-monochrome, hairline borders, pill filters, one black active pill).
- `designeer.xyz` -> the application being built (browse/inspiration/resources/tools/portfolios/folders/favourites/search/submit/login).

## Colour tokens (`src/index.css`: light `:root`, dark `:root.dark`)
| Token | Light | Dark |
|---|---|---|
| `--hover` | `#ededed` | `#131313` |
| `--hover-foreground` | `#151515` | `var(--card-foreground)` |
| `--surface-muted` | `#f4f4f4` | `#131313` |
| `--selected` | `#e7e7e7` | `#202020` |
| `--border` | `#e5e7eb` | `rgb(255 255 255 / 12%)` |
| `--separator` | `#e1e3e7` | `rgb(255 255 255 / 12%)` |
| `--card-surface` | `#ffffff` | `#060606` |
| `--accent` | `#404040` | `oklch(80% 0 0)` |
| `--submit-accent` | `#a855f7` | `#a855f7` (hover `#b365ff`) |
| `--radius-pill`, `--radius-card` 24px, `--radius-card-inset` 16px, `--radius-sidebar` 16px, `--radius-sidebar-inset` 8px, `--radius-control` 8px |

Rule: every hover fill resolves to `--hover`; everything on it resolves to `--hover-foreground`. Always set both together.

## Theme
- `data-theme="dark"` + `.dark` class on `<html>` (both set by `src/pages/page.tsx`).
- Stored as preference (`light`|`dark`|`system`); `system` follows `prefers-color-scheme` live via `matchMedia`.
- Account menu is the only home for theme and sound: Arc `UserMenu` on desktop (`showTheme`, `showSound`), inline `SidebarAccount` + `SegmentedControl` in the phone drawer. Both switches keep the menu open. No gear in the top bar or sidebar footer.
- Account = photo at the head of the sidebar (beside Favourites). Account menu holds Sign out, Theme, Sound. No Submissions row.

## Layout
- One page container. Sidebar fixed 240px column; content in `.main-shell`.
- Resource grid: even CSS grid (`.resource-grid`, `grid-template-columns`). Every card same size (fixed 3:2 preview, caption clamped to 2 lines). Cards use the fixed `popularityOrder` in `src/catalog.ts` (a one-time October 2026 snapshot of GitHub stars + Tranco top-1M rank) through `comparePopularity`; name breaks ties. No runtime score, fetch or view tracking.
- Check 390, 768, 1024, 1440px. No sideways scroll. Touch targets ≥44px.
- Dotted frame `--dotted-rule` on `.app-shell`: runs down sidebar column's right edge and along foot of top bar; they cross at the corner (logo sits in the cell they cut out). Top bar starts at `--sidebar-width`. Top bar sits on page ground (`--page-background`). On mobile, column is a drawer over content (no corner; rule runs full bar width).
- Sidebar is flat: no radius, no shadow, no inset. Each row that opens a set (All resources, a shelf, a moodboard) counts its size at the right edge in the micro step; the Moodboards heading and Create moodboard do not.
- Surface elevation: Fluid Functionalism 8-level ladder (`--surface-1`..`--surface-8`, `--shadow-1`..`--shadow-8`). `SurfaceProvider value={1}` in `main.tsx`. Float uses `Elevated offset={2}` (popover/dropdown/select menu) or `offset={4}` (dialog/modal). Manual form: `surfaceClasses(level)`.
- Nested corners are concentric: outer radius = inner radius + gap (outer = inner + padding).

## Pills
Nav rows, search field, favourites link are pills (`--radius-pill`). Filter tabs are Arc `Button`s (`variant="secondary"` inactive, `"primary"` active). Tab strip sets `--radius-control` to pill radius.

## State & data
- Resources, moodboards, theme persist in `localStorage` under `desgnix-*` keys; read via `store.read` helper in `src/pages/page.tsx`.
- `src/components/card.tsx` renders `.ui-card` (owns border, radius, fill, shadow in both themes). Pass `href` to `Card` -> renders a link.
- Concept = **moodboard** (`LibraryMoodboard`, `moodboardId`). Not "folder".
- Seed catalogue: `src/catalog.ts`. Sections from stealth.pm; `collections` array groups them into the eight shelves the sidebar shows (Observe, Read, Create, Build, Components, Assets, Tools, Desk). Shelf may hold several categories -> tag strip under heading. No People shelf or people list.
- Catalogue versioned: bump `catalogVersion` in `src/pages/page.tsx` when shape changes (stale `localStorage` replaced, not mixed).
- Catalogue entry: `{ name, url, description }`. Search matches name, url, description, category.
- Explore page (`src/components/application/dashboard/explore-page.tsx`) = landing surface; big search hero, shelves under it as rows of six. Only view with big search (top bar field steps aside while open).
- Submitted resource tagged `submitted`; there is no Submissions view. The sidebar's second group is the account's moodboards: a hoverable `Moodboards` heading row (chevron) that opens the all-moodboards shelf, each moodboard by name, then a `Create moodboard` row.
- Agents directory: removed. There is no Agents view or nav row.
- `src/lib/link-metadata.ts`: fetches OG data from microlink, caches `localStorage`, dedupes in-flight requests.

## Motion / press states
- Every pressable thing: hover state, press state, transition between them. Use `--duration-fast` (160ms) + `--ease-standard`.
- Exceptions (no scale): sidebar nav rows (shared hover highlight is sibling), resource card click surfaces (hover reveals actions).
- Shared hover highlight: `src/hooks/use-fluid-hover.ts` + `src/components/fluid-hover-highlight.tsx`. Do not hand-roll a second highlight.
- Every animation needs `prefers-reduced-motion` branch. Global fallback at bottom of `src/index.css`.

## Copy & design rules
- One `h1` per surface, one primary action, semantic tokens only, weights 400/500 only.
- Every state designed: empty, loading, error, disabled.
- Reduced motion handled.
- Never: eyebrow/overline labels above headings, all-caps, em dashes in copy, hand-made focus rings, raw hex on Arc surfaces, nested cards, decorative gradients, toast as only confirmation.

## Checks before finishing
`npm run build` then confirm in both themes: hover fills are `--hover`, focus rings from Arc, empty/loading states exist, nothing overflows horizontally.

## Key files
`src/pages/page.tsx` — root page, catalogVersion, store.read, theme.
`src/catalog.ts` — seed catalogue + collections.
`src/index.css` — tokens (light/dark).
`src/main.tsx` — SurfaceProvider, foundation.css, fonts.
`src/lib/springs.ts` — fluid-hover list springs.
`src/lib/utils.ts` — `cn`.
`src/lib/link-metadata.ts` — microlink OG cache.
`src/components/arc/motion-tokens.ts` — motion springs.