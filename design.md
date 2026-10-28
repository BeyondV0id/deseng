# desgnix design.md

The visual contract for this frontend: the token schema, the sidebar's
geometry, the two themes, the motion rules, and the skills that govern all of
it.

**How this file relates to the others**

| File | Owns |
| --- | --- |
| `AGENTS.md` | Working rules: stack, icon boundary, where code lives, checks |
| `PROJECT_CONTEXT.md` | One-page session snapshot of the app's behaviour |
| `design.md` (this file) | The visual system: tokens, spacing, themes, motion, skills |

Read this before changing anything a person looks at.

---

## 1. Schema

A design decision flows in one direction. Never skip a layer.

```
tokens  ->  surfaces  ->  components  ->  motion  ->  checks
```

| Layer | Lives in | Rule |
| --- | --- | --- |
| Tokens | `src/index.css` (`:root`, `:root.dark`), `src/components/arc/foundation.css` | Semantic names only. No raw hex on a surface. |
| Shape | `src/lib/shape-context.tsx` | `pill` is the app's shape. Radius comes from the shape map, not from a one-off class. |
| Size | `src/lib/size-context.tsx` | `default` (36px control, 16px icon) and `compact` (28px, 14px icon). |
| Surfaces | `src/lib/elevated.tsx`, `src/lib/surface-context.tsx`, `surfaceClasses()` | Elevation from the 1 to 8 ladder, never a hand-written shadow. |
| Components | `src/components/arc/**` (compose), `src/components/ui/**` (app primitives) | Arc first. Do not restyle Arc internals. |
| Motion | `src/components/arc/motion-tokens.ts`, `src/lib/springs.ts` | Named springs and durations only. No hand-rolled timings. |

The app layer (`index.css`) loads after `foundation.css`, so its `:root` values
win. Both are `:root` scoped: the app layer is the override, not a fork.

---

## 2. Tokens

### 2.1 Space

| Token | Value | Use |
| --- | --- | --- |
| `--space-1` | 4px | Icon to text at its tightest, chip padding |
| `--space-2` | 8px | Row inset, control padding, the default gap |
| `--space-3` | 12px | Card padding, group insets |
| `--space-4` | 16px | Card padding, section gaps |
| `--space-6` | 24px | Page rhythm, large gaps |

Spacing is a 4px grid. Any new gap is one of these steps; do not invent 6, 10,
14, or 18 as a *spacing* value. (The sidebar's 10px icon gap is a deliberate
type/glyph relationship, documented in section 4.)

### 2.2 Radius

| Token | Value | Use |
| --- | --- | --- |
| `--radius-control` | 8px | Inputs, small buttons, inset corners |
| `--radius-panel` | 12px | Popovers, menus, the mobile drawer's inner edge |
| `--radius-card` | 24px | Resource cards, dialogs |
| `--radius-card-inset` | 16px | A surface nested in a card (`24 - 8`) |
| `--radius-sidebar-inset` | 8px | A row inside the drawer (`12 - 4`) |
| `--radius-pill` | 9999px | Nav rows, search field, filter pills |
| Row radius | 20px | `shape.item` in the pill shape map |

**Nested corners are concentric.** A corner inside another corner shares its
centre, so derive the inner radius, never eyeball it:

| Outer | Gap | Inner |
| --- | --- | --- |
| `--radius-card` 24px | 16px padding | `--radius-card-inset` 16px |
| `--radius-panel` 12px | 8px inset | 4px |
| Drawer 12px | 4px inset | 8px |

### 2.3 Type

| Role | Size / line | Notes |
| --- | --- | --- |
| Display | 28 / 34 | Page heading, one per surface |
| Title | 16 / 22 | Card and section titles |
| Subtitle | 14 / 20 | Supporting heading |
| Body | 13 / 20 | Default copy, row labels |
| Caption | 12 / 16 | Metadata, descriptions |
| Micro | 11 / 14 | Copyright, counts, keyboard chips |

- Family: **Geist Sans** for the app. The sidebar column uses **Inter Variable**
  because Fluid Functionalism animates weight and Geist's static cut cannot.
- Weights: 400 and 500 only. A 600 exists in the font files for the brand
  mark; do not introduce it elsewhere.
- Letter spacing tightens with size (`-0.6px` at brand size, `-0.01em` at
  micro). Never positive tracking.

### 2.4 Icons

| Context | Library | Size |
| --- | --- | --- |
| App code | Reicon via `@/components/icons` | 14, 15, 16, 17, 18, 20 |
| Sidebar rows | Reicon, via the barrel | **18** |
| Inside Arc | `lucide-react`, `strokeWidth={1.75}` | Arc's own |

The boundary is strict: app files import from `@/components/icons` only. Add a
glyph to the barrel; never import `reicon-react` in a component.

### 2.5 Elevation

`--surface-1` to `--surface-8` and `--shadow-1` to `--shadow-8`, light and dark
steps. Elevation is relative to what a panel opened from.

| Surface | Level |
| --- | --- |
| Page | 1 |
| Popover, dropdown, select menu | `Elevated offset={2}` |
| Dialog, modal | `Elevated offset={4}` |
| Mobile drawer | `substrate + 2`, clamped to 8 |

---

## 3. Themes

The app ships **light** and **dark**, resolved from a preference of `light`,
`dark`, or `system`. `system` follows `prefers-color-scheme` live through a
`matchMedia` listener. Dark is `data-theme="dark"` **and** `.dark` on `<html>`;
both are set by `src/pages/page.tsx`.

### 3.1 The palette

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--page-background` | `#fafafa` | `#020202` | The ground under everything |
| `--surface-muted` | `#f4f4f4` | `#131313` | A resting surface, one step off the page |
| `--hover` | `#ededed` | `#131313` | The only hover fill in the app |
| `--hover-foreground` | `#151515` | `var(--card-foreground)` | Everything that sits on `--hover` |
| `--selected` | `#e7e7e7` | `#202020` | The active row's fill |
| `--text-primary` | `#151515` | `#f9f9f9` | Body and headings |
| `--text-secondary` | `#55585d` | `#bec1c7` | Supporting text |
| `--text-tertiary` | `#92969b` | `#858a93` | Metadata |
| `--border` | `#e5e7eb` | `rgb(255 255 255 / 8%)` | Hairline only |
| `--card-surface` | `#ffffff` | `#060606` | Card face |
| `--card-foreground` | `#262931` | `#f9f9f9` | Text on a card |
| `--accent` | `#404040` | `oklch(80% 0 0)` | Neutral accent |
| `--submit-accent` | `#a855f7` | `#a855f7` | The one coloured action |
| `--submit-accent-hover` | `#b365ff` | `#b365ff` | Its hover |
| `--focus-ring` | `#777777` | `#858585` | Keyboard focus |

### 3.2 The rules

1. **Every hover fill is `--hover`, and everything on it is
   `--hover-foreground`.** Set both together. Never write a new grey.
2. **The three washes ladder.** In light: resting `--surface-muted`, hover
   `--hover`, selected `--selected`. In dark the ladder reverses, so `--hover`
   is the resting step and `--selected` sits a step lighter.
3. **Semantic tokens only.** No raw hex on an Arc surface, no `#fff` shortcuts
   in components. If a value is missing, add a token.
4. **Colour marks state, not decoration.** Active and selected rows may carry
   fill; everything else is near-monochrome. The Submit button is the single
   coloured action.
5. **One theme control, one sound control, both in the account menu.** They live
   behind the avatar at the head of the sidebar, on desktop and in the phone
   drawer alike. There is no gear in the top bar and none at the foot of the
   column.
6. **Borders are hairlines.** `1px`, low contrast, and never a second border
   pretending to be a shadow.

### 3.3 Where the controls live

Theme and sound have exactly one home: the account menu behind the avatar at
the head of the sidebar. The chrome carries no gear.

| Surface | Component | Holds |
| --- | --- | --- |
| Desktop account menu | Arc `UserMenu` (`showTheme`, `showSound`) | Identity, Theme, Sound, Sign out |
| Phone account panel | `SidebarAccount` inline disclosure in `app-sidebar.tsx` | The same rows, with Arc `SegmentedControl` for both switches |

Why two implementations: the phone sidebar is a focus trap, and a portalled
menu opened inside it is dismissed before it can paint. The drawer therefore
gets an inline panel in the same subtree, carrying the same two rows.

- Theme options are light, dark, system, icon only, each with a screen-reader
  name. `system` follows the OS live.
- Sound options are off and on, icon only, and write through
  `setSoundMuted` / `useSoundMuted` in `src/components/ui/sound.tsx`.
- Both switches keep the menu open. A theme change runs through the view
  transition (`rise`), so the page crossfades instead of snapping.
- Neither switch appears anywhere else: not in the top bar, not in a dialog,
  not in the sidebar footer.

---

## 4. Sidebar

The sidebar is a fixed 256px column on the page (not a floating card), and a
drawer below 760px. It carries navigation only: a label and a glyph per row,
plus the size of the set that row opens, at the right edge in the micro step.

### 4.1 Geometry

These are the six rules, in the order they were specified.

| # | Property | Value | Why |
| --- | --- | --- | --- |
| 1 | Panel radius | **12px** on the drawer's inner edge, 0 on the desktop column | Softer corners where the panel floats; the desktop column is flush, so a radius there would be invisible |
| 2 | Row inset | **8px** off the column edge | Selection sits inside the column instead of bleeding to the edge |
| 3 | Icon size | **18px** | At 22 the glyph was louder than the label |
| 4 | Icon to label gap | **10px** | At 4 (and 8) the icon and text read as one shape |
| 5 | Row height | **32px** | A comfortable pointer target without opening the list up |
| 6 | Group gap | **20px** between groups | Groups read as groups; 2px made the column one continuous list |

Supporting geometry:

| Part | Value |
| --- | --- |
| Column width | 256px (`16rem`), fixed |
| Header | 60px tall, 12px horizontal padding |
| Row radius | 20px (`shape.item`, pill shape) |
| Group label | 32px tall, 8px horizontal padding |
| Footer | 8px / 12px padding, 11.5px copyright and Info; no controls |
| Content block padding | 8px top and bottom (breathing room only) |

**Where the CSS lives.** `src/index.css`, under `[data-sidebar="sidebar"]`.
Row geometry comes from the component (`h-8`, `pl-2`); the app layer sets the
glyph size, the icon gap, the group rhythm, and the drawer radius.

```css
[data-sidebar="sidebar"] [data-sidebar="menu-button"] { column-gap: 10px; }
[data-sidebar="sidebar"] [data-sidebar="menu-button"] > svg { width: 18px; height: 18px; }
[data-sidebar="sidebar"] [data-sidebar="content"] { row-gap: 20px; padding-block: 8px; }
[data-sidebar="sidebar"] [data-sidebar="group"] { padding-block: 0; }
[data-sidebar="sidebar"][data-mobile="true"] {
  border-radius: 0 var(--radius-panel) var(--radius-panel) 0;
}
```

### 4.2 No dividers

The column draws no lines.

- No edge hairline against the content (`bordered={false}`).
- No scroll dividers inside the list (the `.scroll-divider` pseudo-elements are
  disabled under `[data-sidebar="sidebar"]`).
- Region separation comes from spacing, not strokes.

### 4.3 Behaviour

| Rule | Detail |
| --- | --- |
| Desktop is fixed | No collapse rail, no resize handle, no toggle button, no `[` shortcut |
| Mobile is a drawer | Below 760px the top bar shows the trigger; rows, the X, the scrim, and Escape all close it |
| Selection | The current view takes `--selected`; hover takes `--hover` |
| Shared highlight | One fluid hover highlight, owned by `use-fluid-hover` + `fluid-hover-highlight.tsx` |
| No scale on rows | The highlight is a sibling, so scaling the row would shrink the label inside a still fill |
| Settings | Theme and sound live in the account menu at the head of the column, not in the footer |

---

## 5. Motion

Motion is a named vocabulary, not a per-component decision.

### 5.1 Tokens

From `src/components/arc/motion-tokens.ts`:

| Token | Value | Use |
| --- | --- | --- |
| `duration.instant` | 120ms | Colour and opacity on small state changes |
| `duration.fast` | 160ms | Press feedback, hover transitions |
| `duration.exit` | 180ms | Exits |
| `duration.standard` | 240ms | Entering panels |
| `duration.considered` | 480ms | Deliberate, rare moments |
| `ease.enter` | `cubic-bezier(.16, 1, .3, 1)` | Entrances |
| `ease.exit` | `cubic-bezier(.7, 0, .84, 0)` | Exits |
| `ease.standard` | `cubic-bezier(.22, 1, .36, 1)` | Hover, colour, small transitions |
| `ease.inOut` | `cubic-bezier(.65, 0, .35, 1)` | Movement already on screen |
| `spring.snappy` | visual 0.26s, bounce 0 | Presses, toggles, indicators |
| `spring.smooth` | visual 0.4s, bounce 0 | Panels, height, layout shifts |
| `spring.morph` | visual 0.42s, bounce 0 | Shared highlights, shape morphs |

CSS-side equivalents: `--duration-instant` 120ms, `--duration-fast` 160ms,
`--duration-standard` 240ms, `--duration-considered` 480ms, `--ease-enter`,
`--ease-standard`.

### 5.2 The press contract

Every control the app renders itself answers the pointer:

```css
.thing {
  transition:
    transform var(--duration-fast) var(--ease-standard),
    background-color var(--duration-fast) var(--ease-standard),
    color var(--duration-fast) var(--ease-standard),
    border-color var(--duration-fast) var(--ease-standard);
}
.thing:active { transform: scale(.97); }
```

Hover without a transition snaps and reads as a glitch. Arc's own buttons
already carry a press spring, so they are not in this list.

Two deliberate exceptions: sidebar rows (shared sibling highlight) and the
resource card's click surfaces (hover already reveals the actions).

### 5.3 When something should animate

| Frequency | Decision |
| --- | --- |
| 100+ times/day (shortcuts, command palette, core navigation) | No animation |
| Tens of times/day (hover, list navigation) | Near-imperceptible, or nothing |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare or first-time (onboarding, success, empty states) | The delight budget lives here |

Name the purpose before writing a line: feedback, spatial consistency, state
indication, preventing a jarring change, explanation, or delight. If it is only
"it looks cool" on a frequent surface, do not animate it.

### 5.4 Never

| Never | Instead |
| --- | --- |
| `transition: all` | Name the exact properties |
| Entering from `scale(0)` | `scale(0.95)` plus `opacity: 0` |
| `ease-in` on UI | `ease-out` or a strong custom curve |
| Animating `width`, `height`, `margin`, `padding`, `top`, `left` | `transform` and `opacity` |
| Keyframes on toasts or toggles | CSS transitions (interruptible) |
| A hover effect without a transition | Hover plus press plus a transition |
| Motion with no `prefers-reduced-motion` branch | Gentler, not zero: keep opacity, drop movement |

The global reduced-motion fallback sits at the bottom of `src/index.css`.

---

## 6. Skills

These are agent skills, loaded with the skill tool. The paths below are the
canonical files.

| Skill | Path | Use it when |
| --- | --- | --- |
| **emil-design-eng** | [SKILL.md](file:///C:/Users/harsh/.agents/skills/emil-design-eng/SKILL.md) | The craft bar for any UI work: polish, component feel, the unseen details. Review output must be a Before / After / Why table. |
| **animate** | [SKILL.md](file:///C:/Users/harsh/.agents/skills/animate/SKILL.md), [RECIPES.md](file:///C:/Users/harsh/.agents/skills/animate/RECIPES.md) | Building motion from scratch: the frequency gate, purpose, tool choice, curve, duration, interruption, exit, reduced motion. Start from a recipe when the task matches one. |
| **find-animation-opportunities** | [SKILL.md](file:///C:/Users/harsh/.agents/skills/find-animation-opportunities/SKILL.md) | A read-only sweep for places that should animate and, more importantly, places that should not. It proposes exact values; it does not implement. |
| **animation-vocabulary** | [SKILL.md](file:///C:/Users/harsh/.agents/skills/animation-vocabulary/SKILL.md) | Turning a vague description into the exact term ("the bouncy thing when a popover opens" is a pop in). Naming only. |

Related skills available for audits, not part of the day-to-day loop:
`review-animations`, `animation-performance`, `baseline-ui`,
`tailwind-design-system`.

**How they combine here**

1. `find-animation-opportunities` to decide *whether* a surface should move.
2. `animate` to build it with this repo's tokens.
3. `emil-design-eng` as the review bar before shipping.
4. `animation-vocabulary` when discussing motion with someone who describes it
   by feel.

None of them override section 5's tokens. If a skill suggests a value this
repo already names, use the repo's token.

---

## 7. Custom skills

Project rules, written as skills so they can be applied without re-deriving
them.

### 7.1 `deseng-sidebar`

**Trigger:** any change to the navigation column, its rows, or its drawer.

**Rules**

1. Geometry is the table in section 4.1. Rows: 32px tall, 8px inset, 18px
   glyph, 10px icon gap. Groups: 20px apart. Drawer: 12px inner edge.
2. No dividers. No edge hairline, no scroll hairlines.
3. Desktop is fixed. Never add a collapse rail, a resize handle, a toggle, or a
   keyboard shortcut.
4. Mobile is a drawer. The trigger is the only way in, and the X, a row, the
   scrim, and Escape all close it.
5. Rows carry a label and a glyph only. No counts, no badges, no chevrons.
6. Rows do not scale on press.

**Check:** 256px column at 1440; drawer at 390; no horizontal scroll.

### 7.2 `deseng-tokens`

**Trigger:** adding a colour, radius, shadow, spacing step, or size.

**Rules**

1. Search `index.css` first. If the value exists, use the token.
2. New colour: add light and dark values together, in the same commit.
3. Hover: `--hover` fill plus `--hover-foreground` label. Both, always.
4. New radius: derive it from the concentric rule, do not eyeball it.
5. Never raw hex in a component. Never a new grey.

**Check:** toggle both themes; the token resolves in each.

### 7.3 `deseng-surfaces`

**Trigger:** anything that floats or nests.

**Rules**

1. Elevation comes from `Elevated` or `surfaceClasses()`, never a hand-written
   box-shadow.
2. A panel inside a dialog climbs the ladder on its own; do not hard-code its
   level.
3. No nested cards. A card inside a card is a layout failure.
4. Corners stay concentric (outer = inner + gap).

**Check:** popover inside a dialog stays above it in both themes.

### 7.4 `deseng-motion`

**Trigger:** any transition, animation, or press state.

**Rules**

1. Use `motionTokens` or `--duration-*` / `--ease-*`. No new timings.
2. Press feedback is `scale(.97)` at 160ms, unless the row or card is one of
   the two documented exceptions.
3. Name the purpose. If it is decoration on a frequent surface, remove it.
4. Keyboard-initiated actions do not animate.
5. Ship the reduced-motion branch with the motion, not after.
6. `transition: all` is a defect. So is `scale(0)`.

**Check:** 2x slow-motion pass in DevTools, then reduced motion on.

### 7.5 `deseng-icons`

**Trigger:** adding or sizing a glyph.

**Rules**

1. App code imports from `@/components/icons` only.
2. Add the glyph to the barrel, never import `reicon-react` in a component.
3. `lucide-react` stays inside `src/components/arc/**` at `strokeWidth={1.75}`.
4. Sidebar rows: 18px. Toolbar and controls: 16px. Inline metadata: 14px.

**Check:** no `lucide-react` import outside `src/components/arc`.

### 7.6 `deseng-copy`

**Trigger:** any user-visible string.

**Rules**

1. Sentence case. No all-caps.
2. No eyebrow or overline label above a heading.
3. No em dashes. Use a colon, a comma, or a full stop.
4. One `h1` per surface, one primary action.
5. A toast is never the only confirmation.

**Check:** read the surface aloud; if a label repeats the heading, delete it.

---

## 8. Before shipping

```bash
npm run build
```

Then confirm, in both themes:

- [ ] Hover fills are `--hover`, labels are `--hover-foreground`
- [ ] Focus rings come from Arc, not a hand-made outline
- [ ] Empty, loading, error, and disabled states exist
- [ ] The sidebar matches section 4.1 and draws no dividers
- [ ] Theme and sound are reachable only from the account menu, and both still
      work after a reload (the preference is stored, the mute is stored)
- [ ] 390, 768, 1024, 1440: no horizontal scroll, 44px touch targets
- [ ] Reduced motion still reads correctly
