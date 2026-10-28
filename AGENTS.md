# AGENTS.md

Project rules for **desgnix** (`design-library`), a curated catalogue of design references.

Read this before changing UI. It records the stack, the icon rule, the token
system, and the two reference sites the product is modelled on.

---

## 1. Stack

| Concern | Choice | Where |
| --- | --- | --- |
| Layout | npm workspaces: `client` (SPA) + `server` (API) | `package.json` |
| Framework | React 19 + TypeScript 5.8 | `client/src/` |
| Build | Vite 7 (`@vitejs/plugin-react`) | `client/vite.config.ts` |
| Styles | Tailwind CSS v4 (`@tailwindcss/vite`), CSS Modules for components | `client/src/index.css` |
| Router | `react-router-dom` 7, `BrowserRouter` | `client/src/App.tsx` |
| Component library | **Arc** (uiarc.dev), vendored | `client/src/components/arc/` |
| Icons (app) | **Reicon** (`reicon-react`), glyph by glyph | `client/src/components/icons.ts` |
| Icons (inside Arc) | `lucide-react`, `strokeWidth={1.75}` | `client/src/components/arc/**` |
| Motion | `motion` (Motion for React) | `motion/react` |
| Audio | `@web-kits/audio` | `client/src/components/ui/sound.tsx` |
| Text morph | `torph` | `client/src/components/application/dashboard/resource-section-header.tsx` |
| Class merge | `cn` | `client/src/lib/utils.ts` |
| Surfaces | Fluid Functionalism `Elevated` / `SurfaceProvider` | `client/src/lib/elevated.tsx`, `client/src/lib/surface-context.tsx` |
| Data | `microlink` API for Open Graph, cached in `localStorage` | `client/src/lib/link-metadata.ts` |
| API | Express 5, mounted under `/api` | `server/src/index.ts` |
| Auth | **Better Auth** 1.7, session cookie | `server/src/auth.ts`, `client/src/lib/auth-client.ts` |
| Database | Postgres (Supabase) through **Drizzle ORM** | `server/src/db/`, `server/drizzle/` |
| Email | Resend over HTTP, console fallback without a key | `server/src/lib/email.ts` |
| Fonts | Inter Variable, for display, body and mono, via `@fontsource-variable` | `client/src/main.tsx` |
Aliases: `@` -> `client/src`. shadcn registries are wired in `client/components.json`:
`@uiarc` -> `https://uiarc.dev/r/{name}.json`, `@kobra` -> `https://kobra.systems/r/{name}.json`.

Install Arc pieces with the shadcn CLI, never by hand-writing them:

```bash
npx shadcn@latest add @uiarc/button @uiarc/dialog
```

---

## 2. Icon rule (two libraries, one boundary)

**The app uses Reicon. Arc uses Lucide. Never mix inside one file.**

- Application code (`client/src/components/application/**`, `client/src/components/ui/**`,
  `client/src/pages/**`) imports icons **only** from `@/components/icons`.
- `@/components/icons` is a barrel of individual Reicon glyph imports. Add a
  glyph there; never import `reicon-react` directly in a component.
- `lucide-react` is allowed **only** inside `client/src/components/arc/**`, because
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

- `client/src/components/arc/foundation.css` is imported once in `client/src/main.tsx` and
  holds the base tokens. `client/src/index.css` is the **app layer** that overrides
  them for this product. Both are `:root` scoped, so `index.css` wins by
  load order.
- Arc components live in `client/src/components/arc/<name>/<name>.tsx` with a
  sibling `<name>.module.css`.
- Motion tokens live in `client/src/components/arc/motion-tokens.ts` and are
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

Our token layer lives in `client/src/index.css` (light in `:root`, dark in
`:root.dark`). The rules that matter:

| Token | Light | Dark | Notes |
| --- | --- | --- | --- |
| `--hover` | `#ededed` | `#131313` | The hover fill. In light it sits a step lighter than `--selected`; in dark it is the resting step and `--selected` is a step lighter. Always one step above `--surface-muted`. |
| `--hover-foreground` | `#151515` | `var(--card-foreground)` | Anything that sits on a `--hover` fill. Always set it together with the fill. |
| `--background-secondary-hover` | `var(--hover)` | `var(--hover)` | Same fill as `--hover`. |
| `--background-tertiary-hover` | `var(--hover)` | `var(--hover)` | Same fill as `--hover`. |
| `--surface-muted` | `#f4f4f4` | `#131313` | A resting surface, one step off the page. Never a hover fill. |
| `--selected` | `#e7e7e7` | `#202020` | The selected row's fill. A step darker than `--hover` in light, a step lighter in dark, so the active row always reads. |
| `--border` | `#e5e7eb` | `rgb(255 255 255 / 12%)` | Hairline only. |
| `--separator` | `#e1e3e7` | `rgb(255 255 255 / 12%)` | The hairline on a bordered surface. The dotted frame is `--dotted-rule`; the two are not the same thing. |
| `--card-surface` | `#ffffff` | `#060606` | Card face. |
| `--accent` | `#404040` | `oklch(80% 0 0)` | Neutral accent. Colour otherwise marks active/selected only. |
| `--avatar-fill` | `#c2185b` | `#c2185b` | The account disc's fill, the one coloured element in the bar. Hover uses `--avatar-fill-hover` (`#d81b60`). |

**Every hover fill in the app resolves to `--hover`, and everything that sits
on one resolves to `--hover-foreground`.** When you add a hover state, use both
tokens; do not write a new grey, and do not leave the label on the old
foreground colour.

The sidebar's rows are the trap: the label and the icon carry their own
Tailwind `group-hover:text-text-primary` utility, which beats the button's
own `color`. `client/src/index.css` re-asserts them with `.sidebar-nav-item:hover
.sidebar-item-label` and `.sidebar-nav-item[data-fluid-hover-active] svg`,
because rules outside Tailwind's utility layer win over the utilities.

Dark mode is `data-theme="dark"` plus the `.dark` class on `<html>` (both are
set by `client/src/pages/page.tsx`).

The theme is stored as a **preference** (`light`, `dark`, or `system`) and
resolved to a concrete theme at render. `system` follows
`prefers-color-scheme` live, through a `matchMedia` listener.

The top bar closes with a cluster of **three 40px circles at the right edge**:
Favourites, Submit, and the account. They are the same height as the search
pill, so the bar reads as one row, and the search owns the middle. Favourites is
a bookmark, Submit is a plus (icon only, with a tooltip), and the account is the
one filled colour in the bar: a disc on `--avatar-fill` carrying the account's
first initial in white. Every circle rests on `--surface-muted` and moves to
`--hover` under the pointer; Favourites marks the view it opens with the
foreground fill, the way an active tag does. Below `lg` only the account stays:
Favourites and Submit become rows of the menu.

The account menu holds Sign out, the account's Settings row, and the app's only
two preferences: theme and sound. There is no gear in the sidebar header and
none at the foot of the column.

Theme and sound are the rows of Arc's `UserMenu` (`showTheme`, `showSound`),
which is the account's only surface. The group caption above them is turned off
(`showSettingsLabel={false}`) because the Settings row already names it, so the
menu reads Theme, Sound, Settings, Sign out: one Settings, not two. It sits in
the top bar rather than in the navigation, so it is outside the menu's focus
trap and can portal as usual; below 640px it opens as a bottom sheet. Sound
writes through `setSoundMuted` / `useSoundMuted` in
`client/src/components/ui/sound.tsx`. Both switches keep the menu open.

The sidebar counts its sets. A row that opens a set wears its size at the
right edge as Arc's `SidebarMenuBadge` at the micro step, through
`.app-sidebar-count`: `All resources`, every shelf, every moodboard. The
number is the size of the whole set, never what the current search leaves of
it. Only rows that open a set count: `Moodboards` gives its trailing slot to
the chevron, and `Create moodboard` is an action. A count keeps the label's
colour and one weight (400), and lifts to the foreground with the row when it
is selected, hovered or focused. Its screen-reader name belongs to the row
(`Observe, 36 items`), so the badge itself is `aria-hidden`.

The second group is the account's own work, not the catalogue. It has no
caption: the `Moodboards` row is its heading, hoverable like any other row, with
a trailing chevron that opens the shelf of every moodboard. Each moodboard the
account has created follows it by the name its owner gave it, and the group
closes with `Create moodboard`, a row with a plus glyph. All of it is built from
state in `app-sidebar.tsx`, so a new moodboard appears in the column the moment
it is created. There is no Submissions row, here or in the account menu.

The sidebar is flat. It is a column on the page, not a floating panel: no
radius, no shadow, no inset from the edge. It exists above `lg` only. Below
`lg` there is no drawer and no second layout: the column leaves the layout and
the top bar's menu carries the same destinations on the whole screen.

The page is held together by **one hairline frame**. A rule runs down the
sidebar column's right edge and another along the foot of the top bar; the two
cross at the corner, so the logo sits in the cell they cut out. Both are
`1px solid var(--border)`. The top bar starts at the sidebar's edge, not at the
left of the page. It sits on the page ground (`--page-background`) rather than
on a transparent one, so content that scrolls behind it passes under the bar
and not through it. Below `lg` there is no column, so there is no corner to cut
out and the rule runs the full width of the bar.

**Below `lg` the bar carries three controls: the menu, the search and the
account.** Favourites and Submit are rows in the menu instead of circles in the
bar, because the menu holds everything the column held. The menu is a
full-screen sheet (`client/src/components/application/dashboard/mobile-menu.tsx`),
opened from Arc's `icon-morph` trigger, with the brand and the close control at
its head and the same shelves, counts, moodboards and footer as the column.
`SidebarProvider mobileBreakpoint={1024}` makes `isMobile` mean "below `lg`":
`AppSidebar` returns `null` there and the menu renders instead. The search keeps
the lane between the menu and the account and stops at 420px, so it never takes
the bar on a small screen.

---

## 5. Motion

- Arc's `motionTokens` for anything Arc ships.
- `client/src/lib/springs.ts` for the fluid-hover list springs.
- `client/src/hooks/use-fluid-hover.ts` + `client/src/components/fluid-hover-highlight.tsx`
  own the shared hover highlight in the sidebar. Use them; do not hand-roll a
  second highlight.
- Every animation needs a `prefers-reduced-motion` branch. The global
  fallback lives at the bottom of `client/src/index.css`.

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
  card already reveals its controls beside the name, which is the affordance.

---

## 6. Layout

- One page container. Above `lg` the sidebar is a fixed 240px column; content
  sits in `.main-shell`. Below `lg` the column is gone and the content takes the
  full width, with the navigation in the top bar's menu.
- The whole shell, sidebar included, is capped at 1280px and centred. On a
  wide screen the gutters either side carry a faint diagonal rule from
  `client/src/components/ui/striped-pattern.tsx`; the shell is opaque, so the pattern
  never crosses the app.
- **All resources is a band per tag.** `explore-page.tsx` splits the catalogue
  into one `resource-rail.tsx` per category, in the taxonomy's order, and each
  band names its tag above the track and ends in `See more`. The band's
  `.rail-track` walks sideways in rank order when nudged by a trackpad or a
  finger, but the band is only a preview: its one button, `See more`, opens the
  tag page, a `Category:<name>` view that `resource-list.tsx` renders as a plain
  grid. The count lives in the page meta line, not in the band.
  A tag page marks its parent shelf in the sidebar through `navViewFor`.
- **A shelf is the grid, split by tags.** `resource-list.tsx` renders
  `ResourceSectionHeader` with the shelf's category pills (Arc `Button`, plus an
  `All` pill) and a `.resource-grid`. Picking a tag filters the grid in place;
  the tag list is built from the categories the shelf actually has, and a
  search that empties the chosen tag falls back to `All` so the page never
  shows an active pill over an empty grid. Favourites and moodboards are grids
  with no tags.
- Every card is the same size: a fixed 3:2 preview and a caption box held to
  two lines, so no card is taller than its neighbour. The preview is
  `object-fit: cover`, so a wide screenshot is cropped at both sides.
- Cards are ordered by one fixed list (`popularityOrder` in `client/src/catalog.ts`),
  captured once from GitHub stars for repository entries and the Tranco
  top-1M traffic rank for sites. It is data, not a score, and nothing
  recalculates it at runtime. `comparePopularity` sorts by the list, then by
  name, so saving, filing or submitting a card never makes a row jump. A
  resource added later falls to the end.
- Check 390, 768, 1024, 1440px. No sideways scroll. Touch targets at least
  44px.

### Nested corners are concentric

A corner inside another corner shares its parent's centre, so the inner radius
is the outer radius minus the gap between them: **outer = inner + padding**.
Derive it, never eyeball it:

| Outer | Gap | Inner |
| --- | --- | --- |
| `--radius-card` 24px (resource card) | 16px padding | `--radius-card-inset` 16px |
| `--radius-card` 24px (agent card) | 16px padding | `--radius-control` 8px |

The sidebar is flat, so its rows take their radius from the pill token, and the
full-screen menu is a page-level surface, so its rows take `--radius-control`.
When you nest a rounded shape inside another, compute `outer radius - gap` and
set it from a token.

### Surfaces

Elevation comes from Fluid Functionalism's eight-level ladder, not from
hand-written shadows.

- `client/src/main.tsx` wraps the app in `<SurfaceProvider value={1}>` (1 is the page).
- A panel that floats uses `<Elevated offset={2}>` (popover, dropdown, select
  menu) or `<Elevated offset={4}>` (dialog, modal). The offset is relative to
  whatever it opened from, so a popover inside a dialog stays above it.
- `surfaceClasses(level)` is the manual form, for components that cannot wrap
  their panel in `Elevated`.
- The level ladder and the shadow ladder are the `--surface-1` to
  `--surface-8` and `--shadow-1` to `--shadow-8` tokens in `client/src/index.css`.
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

- **The library is server data.** Resources, favourites, filings and
  moodboards live in Postgres and arrive through `client/src/lib/api.ts`. There
  is no `desgnix-resources`, `desgnix-moodboards` or `desgnix-account` key any
  more; do not reintroduce one.
- `localStorage` keeps only preferences: the theme (`desgnix-theme-v2`), the
  sound switch through `@web-kits/audio`, and microlink's Open Graph cache in
  `client/src/lib/link-metadata.ts`.
- Cards share one surface. `client/src/components/card.tsx` renders `.ui-card`,
  and `.ui-card` owns the border, radius, fill and shadow in both themes. A card
  anywhere in the app uses it, so the dark border is the same everywhere.
  Pass `href` to `Card` and it renders a link rather than a card around one.
- The concept is a **moodboard** (`LibraryMoodboard`, `moodboardId`). It used
  to be called a folder; the rename went through the type, the props, the
  components, the CSS hooks, and the copy.
- A card carries **no controls over its artwork**. The picture and the caption
  both open the site in a new tab; the save toggle and the add-to-moodboard
  plus sit beside the name, revealed on hover (always visible on a touch
  screen). Filing opens the moodboard popover, which lists the account's
  moodboards, marks the one holding the entry, and ends with `New moodboard`.
- **The catalogue is shared; the state on it is per account.** `resource` holds
  one row per entry for everyone. `user_resource` holds only what an account has
  done to an entry: `favorite`, `moodboardId`, `savedAt`. `GET /api/catalog`
  folds the two together and a card never knows the difference.
- The taxonomy stays in `client/src/catalog.ts`: the category names and glyphs,
  and the eight shelves the sidebar shows (Observe, Read, Create, Build,
  Components, Assets, Tools, Desk). A shelf may hold several categories, and
  each one becomes its own row on the page. There is no People shelf: the
  catalogue lists tools, not people.
- The entries themselves are in `server/src/db/catalog.json`, seeded into
  Postgres by `npm run db:seed`. It is safe to re-run: a URL already in the
  table is left alone, so a corrected description in the database survives.
- `rank` is the catalogue's one fixed order, captured once from GitHub stars
  and the Tranco top-1M rank. Nothing recalculates it; a resource added later
  takes the next rank and falls to the end. The API returns rows by rank, and
  `comparePopularity` reads it.
- A catalogue entry carries a one-line description:
  `{ name, url, description }`. Search matches name, url, description and
  category, so the description is what makes an entry findable by purpose
  rather than by name.
- The Explore page (`client/src/components/application/dashboard/explore-page.tsx`)
  is the landing surface: a page heading and its count, then the catalogue as
  one band per category, each band walking sideways and ending in `See more`.
  The bands follow the taxonomy's order and a category with no entries has no
  band. The shelf pages are the ones that carry the category pills, and those
  filter in place; a tag page is the same grid with one tag already chosen.
- A resource added through the submit dialog is still tagged `submitted`, but
  submissions are not a view: the Library lists moodboards only.
- Moodboards belong to one account. Deleting one does not delete its
  resources; `user_resource.moodboard_id` is set to null and the entries return
  to the library unfiled.

---

## 8. Auth and the API

**Identity comes from Better Auth, and only from Better Auth.** There is no
demo sign-in and no locally edited account. `client/src/components/auth/auth-provider.tsx`
reads the session once; the account menu, the Settings dialog and the guards all
read it from there.

- Routes are `react-router-dom` routes in `client/src/App.tsx`:
  `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, and `/*` for
  the app. `RequireAuth` sends a request without a session to `/sign-in` with
  the address it asked for; `GuestOnly` sends a signed-in account back to the
  app. Both wait for `isPending`, so neither flashes.
- The client is `client/src/lib/auth-client.ts`: `baseURL` is the page's own
  origin and `basePath` is `/api/auth`. Vite proxies `/api` to the Express
  server (`API_URL`, default `http://localhost:3001`), so the session cookie is
  first-party in development and production alike. Never call the auth server's
  origin directly from the client.
- The server config is `server/src/auth.ts`: email and password enabled, Google
  and GitHub enabled only when both halves of a credential pair are set,
  30-day sessions, rate limiting, and secure cookies in production.
- Password reset is the only email flow. `server/src/lib/email.ts` posts to
  Resend when `RESEND_API_KEY` is set and prints the link otherwise, so a local
  reset is one copy-paste from the terminal. Every message is written there, not
  in the auth config.
- `server/src/middleware/session.ts` loads the session onto `res.locals` and
  guards everything except the catalogue read. A new route must mount behind
  `requireSession` unless it is deliberately public.
- `CLIENT_ORIGIN` and `BETTER_AUTH_URL` are Better Auth's trusted origins. A new
  deploy host is added there, not in a CORS rule.

The API surface, all under `/api`:

| Route | Auth | Purpose |
| --- | --- | --- |
| `GET /catalog` | public | The catalogue with this account's state folded in |
| `POST /catalog` | session | Submit an entry, filed at the end of the rank |
| `GET /moodboards` | session | The account's moodboards, oldest first |
| `POST /moodboards` | session | Create one |
| `PATCH /moodboards/:id` | session | Rename, recolour, describe |
| `DELETE /moodboards/:id` | session | Delete; its entries return unfiled |
| `PATCH /resources/:id/state` | session | Favourite and/or file one entry |
| `GET /config` | public | Which social providers have credentials |
| `GET /health` | public | Liveness |

Schema work:

```bash
npm run auth:generate   # after adding a Better Auth plugin
npm run db:generate     # write a migration from the schema diff
npm run db:migrate      # apply it through DIRECT_URL
```

- `server/src/db/auth-schema.ts` is generated by Better Auth. Edit `auth.ts`
  and re-run `auth:generate`; do not hand-edit the four tables.
- `server/src/db/schema.ts` owns the app tables and re-exports the auth ones.
- Migrations run on `DIRECT_URL` (Supabase port 5432), not the transaction
  pooler. The app connects on `DATABASE_URL` (port 6543) with
  `prepare: false`, which transaction pooling requires.
- Secrets live in `server/.env`, which is gitignored. `server/.env.example` is
  the list; nothing secret may start with `VITE_`, because that prefix ships to
  the browser.

---

## 9. Checks before finishing

```bash
npm run typecheck   # client tsc -b, server tsc --noEmit
npm run build       # client tsc -b && vite build, then the server
```

Then confirm, in both themes: hover fills are `--hover`, focus rings come
from Arc, empty and loading states exist, and nothing overflows horizontally.
For auth work, also walk sign-up, sign-out, a protected URL while signed out,
and a reset link from the server console.
