# SEO

Status: working plan. Date: 2026-11-04.
The product is called Reference. Set `VITE_SITE_ORIGIN` to the deployed origin before building. The URLs below use `reference.example` as a placeholder.

Scope notes:

- Browsing is public; `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/favorites`, `/moodboards` are excluded from indexing (robots.txt today; add `<meta name="robots" content="noindex, nofollow">` for the account views via `usePageMeta`, see below).
- Shelves and tags are client routes of one document. Google renders JS, but treat the static shell plus per-route `usePageMeta` as the floor, not the ceiling (see Content gaps).
- Tag URLs are `/<shelf>?tag=<slug>`; shelf URLs are `/<shelf>` (from `client/src/lib/view-path.ts`). Query-based tag URLs are indexable but weak; see Content gaps before shipping a path-based scheme.
- Counts below are from `server/src/db/catalog.json` on 2026-11-04 (418 entries, rank-ordered). Re-derive when the seed changes.
- No em dashes; Title Case for UI labels; sentence case prose; British spelling.

## How this catalogue can win search

Reference cannot beat Dribbble or Awwwards for head terms, and should not try. It can own:

1. **Intent-complete long tail**: "css easing generator", "variable fonts library", "react primitives" (unstyled, accessible). One maintained page per tag, each page a working answer, ranked by the grid's own quality and by outbound links.
2. **Name + job queries**: "where to find x" patterns from practitioners. The FAQ and Info page carry this.
3. **Brand + shelf**: "Reference build", "Reference fonts": cheap, owned, grows with awareness.

Ranking levers we actually control: unique curated content per page (real entries, real descriptions), internal linking depth, Core Web Vitals (the app is light), and structured data. Levers we do not control: domain authority from day one.

## Title and meta description patterns

Implementation: `usePageSeo` in `client/src/lib/seo.ts` today; this document renames nothing but constrains what the pattern emits. If touched, move it to `client/src/hooks/use-page-meta.ts` with the same API plus an optional `noindex` flag.

| Surface | document.title | meta description (sentence case, 50 to 160 chars) |
| --- | --- | --- |
| Home `/` | `Reference · your design library` | `A working shelf of interface references: component libraries, motion tools, typefaces, assets and the details in between.` |
| Shelf `/<slug>` | `<Shelf> · Reference` (e.g. `Build · Reference`) | `<Shelf promise> Hand-kept entries, in a fixed, traffic-aware order.` |
| Tag `/<slug>?tag=<slug>` | `<Tag> · <Shelf> · Reference` | `Every entry filed under <Tag>, on the <Shelf> shelf. Reviewed, linked straight to the source.` |
| Info `/info` | `Info · Reference` | `Design resources, tools, and references, all in one place.` |
| Legal `/<page>` | `<Page> · Reference` | first sentence of the document summary |
| Moodboards `/moodboards*` | `Moodboards · Reference` | noindex; description irrelevant |
| Favorites `/favorites` | `Favourites · Reference` | noindex |

Note: current build emits `<Title> · Reference` for non-home routes and does not include the shelf in tag titles. That is acceptable; the two-part title above is the ceiling, not a requirement. Consistency beats cleverness.

Rules:

- One `h1` per surface; the document.title mirrors it (with brand suffix). Nothing in `h1` may duplicate the breadcrumb.
- Description never repeats the title verbatim; it names the job and the method (hand-kept, reviewed, fixed order).
- `max-image-preview:large` stays; `max-snippet:-1` stays.
- Canonical: absolute, no query for shelf pages; for tag pages, canonical to the shelf URL **or** keep self-canonical to the tag URL; pick self-canonical, because the tag content differs and query-canonical strips it. (Current hook passes path + search through; keep.)
- Open Graph mirrors title/description/url; one shared `preview.png` (1200x630, dims and alt declared in `index.html`). Per-shelf OG cards are a design task, not an SEO task; parked in Content gaps.
- `theme-color` and `color-scheme` unchanged.

## Keyword map per shelf

Intent key: **I** = informational, **C** = commercial investigation, **N** = navigational. Difficulty is qualitative (low/medium/high), judged from SERP composition on 2026-11-04; verify in Search Console after launch.

| Shelf | Primary targets (C/I) | Secondary long tail | Difficulty | Owns it today? |
| --- | --- | --- | --- | --- |
| Observe | design inspiration sites, website showcases, product flow examples | ux flow library, interaction demos, identity system references | Medium | No; win with curation depth |
| Read | design engineering essays, interface design books, design guidelines | design systems reading list, ux writing guidelines | Low-medium | Yes, low competition |
| Create | design canvas tools, motion editor, 3d modeling for design | node graph tool, infinite canvas app, garment design software | Low-medium | Yes |
| Build | react frameworks, code agents, animation libraries, shaders | agent context engineering, hosting for design sites, easing api | Medium | Partial |
| Components | react primitives, ui kits, accessible components | micro-motion library, data display components, agent ui | Medium | No |
| Assets | variable fonts, icon libraries, color palettes, 3d assets | free icons for products, illustration libraries, sound for ui | Medium-high | No; volume high, win on picks |
| Tools | css generators, color contrast tools, svg tools, image optimisation | performance budget tool, accessibility checker, easing curve | Medium | Partial |
| Desk | launcher apps, screen recording for design, note taking apps | browser for designers, ai assistant desktop | Low-medium | Yes |

## Keyword map per tag

Each row: **Primary** = the query the page should rank for; **Also** = 1 to 3 variants it naturally captures; **Intent**; **Entry count** on 2026-11-04. Descriptions in Title Case are labels; queries are lower case.

### Observe

| Tag | Primary | Also | Intent | Entries |
| --- | --- | --- | --- | --- |
| Site showcases | best website design showcases | award winning websites, web design inspiration gallery | C | 19 |
| Product flows | ux flow examples | onboarding flow library, product tour examples | I/C | 4 |
| Interaction demos | interaction design demos | micro interaction examples, ux animation examples | I | 2 |
| Identity systems | brand identity systems | logo system examples, design identity guidelines | I/C | 3 |
| Visual search | visual search tools | reverse image search design, design inspiration search | I | 7 |

### Read

| Tag | Primary | Also | Intent | Entries |
| --- | --- | --- | --- | --- |
| Essays | design engineering essays | interface design essays, software design writing | I | 18 |
| Reading list | design books for engineers | ux books, product design reading list | I/C | 9 |
| Guidelines | design guidelines | ux guidelines, interface guidelines, human interface guidelines | I | 18 |

### Create

| Tag | Primary | Also | Intent | Entries |
| --- | --- | --- | --- | --- |
| Design canvases | design canvas software | digital whiteboard design, infinite canvas design tool | C | 9 |
| Motion editors | motion design editor | ui animation editor, motion graphics for interfaces | C | 7 |
| 3D modeling | 3d modeling for designers | blender for product design, 3d mockups tool | C | 5 |
| 3D scanning | 3d scanning software | photogrammetry app, 3d scan object | C | 7 |
| Node graphs | node based editor | node graph software, material node editor | C | 5 |
| Garment design | garment design software | 3d fashion software, clothing design cad | C | 3 |
| Infinite canvas | infinite canvas app | spatial canvas, tldraw miro alternative open source | C | 7 |

### Build

| Tag | Primary | Also | Intent | Entries |
| --- | --- | --- | --- | --- |
| Frameworks | react frameworks 2026 | next.js astro remix, frontend framework comparison | C | 10 |
| Editors | code editors for designers | best code editor, cursor vs vscode | C | 4 |
| Code agents | ai coding agents | claude code cursor agent, ai code review | C | 20 |
| Agent context | agent context engineering | llm context files, agents.md setup | I | 11 |
| Animation libraries | javascript animation libraries | motion framer animation library, spring animation js | C | 7 |
| Shaders | shader examples for web | glsl shader playground, webgl shader library | I/C | 12 |
| Hosting | static site hosting | vercel netlify cloudflare pages, design site hosting | C | 8 |

### Components

| Tag | Primary | Also | Intent | Entries |
| --- | --- | --- | --- | --- |
| Primitives | accessible react primitives | unstyled react components, radix headless ui | C | 9 |
| UI kits | react ui kits | component library design system, open source ui kit | C | 17 |
| Micro-motion | micro interaction libraries | micro animation library, hover animations css | I/C | 20 |
| Agent UI | ai agent interface components | copilot ui components, streaming chat ui library | I/C | 9 |
| Data display | data grid react | table component library, charts for react | C | 13 |

### Assets

| Tag | Primary | Also | Intent | Entries |
| --- | --- | --- | --- | --- |
| Fonts | variable fonts library | free fonts for products, open source typefaces | C/I | 13 |
| Icons | icon libraries for products | open source icons, svg icon set | C | 15 |
| Illustrations | illustration libraries | open source illustrations, spot illustration set | C | 5 |
| Palettes | color palette tools | accessible palette generator, brand palette inspiration | I/C | 5 |
| 3D assets | free 3d models | 3d icon assets, low poly models for web | C | 2 |
| Imagery | stock imagery for products | unsplash alternatives, product photography search | C | 4 |
| Sound | sound for ui | ui sound effects, interface sound design | I | 6 |

### Tools

| Tag | Primary | Also | Intent | Entries |
| --- | --- | --- | --- | --- |
| Easing | easing functions css | cubic bezier generator, easing curve reference | I | 8 |
| Color tools | contrast checker | wcag contrast tool, color contrast analyzer | I | 4 |
| CSS | css generators | css button generator, gradient generator, css shapes | I/C | 10 |
| SVG tools | svg optimiser | svgo, svg to jsx, svg compressor | I | 3 |
| Image tools | image compression tool | squoosh, og image generator, favicon generator | I/C | 16 |
| Code tools | developer utilities | regex tester, json formatter, code snippet tools | I | 4 |
| Performance | web performance tools | lighthouse alternatives, bundle analyzer | I | 4 |
| Accessibility | accessibility audit tools | axe devtools, a11y checker | I | 5 |

### Desk

| Tag | Primary | Also | Intent | Entries |
| --- | --- | --- | --- | --- |
| Launchers | app launcher mac | raycast alfred powertoys | C | 17 |
| Screen recording | screen recorder for design | arcade loom screen studio | C | 16 |
| Notes | note taking for developers | obsidian logseq notes app | C | 6 |
| Assistants | ai desktop assistant | claude desktop chatgpt desktop | C | 8 |
| Browsers | browser for designers | arc browser chrome devtools | C | 4 |

Thin tags (2 to 5 entries) are not liabilities; they are the moat when maintained. For `Interaction demos`, `Identity systems`, `Garment design`, `3D assets`, `SVG tools`, `3D assets`, do not chase volume; chase quality and keep them honest.

## Internal linking plan: shelf to tag to resource

Current state (verified in code):

- Home (`ExplorePage`) renders one band per tag with `See more` -> tag page; featured tools; Latest additions. These are internal links in spirit, but rendered as buttons (`onSeeMore`, `onOpenCategory`), not anchors, so crawlers cannot follow them as links.
- Shelf pages filter in place with pills (Arc Buttons, not anchors). Parent shelf back-link on tag pages uses a button too.
- Legal and Info link out in footer columns.
- Resource cards link out to sources (external).

Plan, in order of effort:

1. **Make the primary navigational affordances real anchors.** In the tag strip, the `See more`, shelf back-link, sidebar rows and footer columns should render `<a href>` via router `Link`, not `<button onClick>`. Visual identical, crawlable, right-clickable, open-in-new-tab works. This is the single highest-leverage SEO change in the app and belongs to whoever owns the dashboard components, not to this document. (Not changed here: out of my file scope for this pass.)
2. **Shelf -> tag:** every shelf page keeps the tag pill strip; pills become links to `/<shelf>?tag=<tag>`. Home bands' `See more` links to the same. Counts on pills stay honest (categories present in the shelf, never zero).
3. **Tag -> shelf:** the back link on every tag page (`Build`, etc.). Breadcrumb over `h1`: `Home / Build / Shaders`, implemented as a visible breadcrumb with schema (below), which doubles as the shelf link.
4. **Tag -> tag (related):** add a "Related tags" row at the foot of tag pages: 3 to 4 sibling tags from the same shelf, by hand, in `catalog.ts` as data (`related: string[]`), not computed. Start with 8 pairs (e.g. Shaders <-> Animation libraries; CSS <-> SVG tools; Easing <-> Micro-motion).
5. **Resource entries:** cards stay outbound links to sources; the internal graph must not depend on them. Instead, each catalogue entry's description is unique copy; that is what prevents doorway-page signals.
6. **Info page:** link every shelf by name (it already lists shelves and tags on the Info/FAQ copy; make the list a link list) and every legal page. This is the crawl hub for the whole site.
7. **Footer:** the Info-page footer columns link the shelves and account views; extend the same footer to every page (it is already the closing edge site-wide via `SiteFooter`).
8. **Sitemap:** list `/`, `/info`, the 8 shelves, and (if paths ship) the 47 tags. Do **not** list `/favorites`, `/moodboards`, auth routes. Add `<lastmod>` when content changes; keep `changefreq` hints as-is.
9. **Anchor hygiene:** tag slugs are lower-hyphen (`view-path.ts`); keep them stable; never rename a tag without a redirect table. (Redirect table lives server-side or in `vercel.json`/host config; not in this repo's client scope.)

## Content gaps

1. **Tag URLs are query strings** (`/build?tag=shaders`). Indexable but split link equity, harder to share, and excluded from any future clean sitemap. Recommend: path-based tags (`/build/shaders`) with redirects from the query form, implemented in `view-path.ts` + host redirects. Decision needed before any SEO push; flagged, not executed.
2. **Client-rendered catalogue.** Google executes JS but queues rendering; crawl budget is real at 418 URLs plus legal pages. If indexed pages matter commercially, prerender at least `/`, `/info`, the 8 shelves and the tag URLs (vite-plugin-prerender or static export of just those routes), or serve a prerendered shell with `react-snap`-style tooling. Measure first: check `site:reference.example` after a month; act only then.
3. **No editorial layer.** The catalogue wins on curation, not copy. Gaps to close with small, permanent pages (Info-sized, not a blog): "What hand-kept means" (selection criteria, already half-written on Info), "How the order works" (rank from GitHub stars and Tranco, one page, honest), and one FAQ rich result. These three pages carry every head-term internal link.
4. **Per-shelf OG images.** One shared `preview.png`; shelves deserve distinct link previews for social CTR. Design task; listed here because it is SEO-adjacent (social CTR feeds sessions, which feed nothing but morale; do it for clicks, not for rank).
5. **Search Console + Bing Webmaster** verification tags are absent. Add `google-site-verification` via env-injected meta when the owner has a property. Not added here (no secrets in repo).
6. **Backlink surface.** The libraries linked from here will not link back; the Info page and the "submit" flow are the natural backlink magnets ("add your tool to Reference"). One line of copy on Info: "Closed shelves? Submit it." No outreach automation; owner decides.
7. **Legal pages indexed** but excluded from sitemap; either fine as-is, or add `noindex` if the owner prefers them out of the index. Recommendation: leave indexable, they are trust signals for the "hand-kept" claim.
8. **Missing structured data** (next section); add once, static, no build dependency.
9. **Thin tag pages risk** being seen as infinite-scroll duplicates; the fixed rank order and stable URLs mitigate; never paginate the grid infinitely without rel=next/prev or unique canonicals.

## Schema.org plan

Static JSON-LD in `client/index.html` covers the home page; per-route JSON-LD is emitted by `usePageMeta` (new `schema` option, or a sibling `usePageSchema`) so it is replaced, never duplicated, on route change. All nodes reference the same `siteUrl`.

**Home `/`**

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Reference",
  "url": "https://reference.example/",
  "description": "A working shelf of interface references: component libraries, motion tools, typefaces, assets and the details in between.",
  "inLanguage": "en",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://reference.example/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

The `SearchAction` ships only when the query is URL-driven (`/?q=`). The current search is React state, not the address; **omit `potentialAction` today**, add it with the same commit that puts search in the URL. Shipping a SearchAction pointing at a state-only search is theatre.

**Shelf and tag pages** (`/build`, `/build?tag=shaders`)

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Shaders · Build · Reference",
  "url": "https://reference.example/build?tag=shaders",
  "isPartOf": { "@type": "WebSite", "name": "Reference", "url": "https://reference.example/" },
  "breadcrumb": { "@type": "BreadcrumbList", "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://reference.example/" },
    { "@type": "ListItem", "position": 2, "name": "Build", "item": "https://reference.example/build" },
    { "@type": "ListItem", "position": 3, "name": "Shaders", "item": "https://reference.example/build?tag=shaders" }
  ] },
  "mainEntity": { "@type": "ItemList", "numberOfItems": 12,
    "itemListOrder": "https://schema.org/ItemListOrderAscending",
    "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "<entry name>", "url": "<entry url>" } ]
  }
}
```

- `ItemList` item `url` is the source site (outbound). This declares "this page curates these links", which is exactly the truth, and feeds carousel rich results.
- `numberOfItems` must match the rendered grid at set time; `usePageMeta` computes it from the same `filtered` array the grid renders. Never hardcode.
- Breadcrumb mirrors the visible breadcrumb once added (Internal linking plan, step 3). Shelf page breadcrumb drops position 3.
- `itemListOrder`: the catalogue's fixed rank order; label ascending.

**Info `/info`**

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [ { "@type": "Question", "name": "What is Reference?", "acceptedAnswer": { "@type": "Answer", "text": "Reference is a small, hand-kept library ..." } } ]
}
```

Only questions visible on the page; one entity per accordion item (7 today). Answers as plain text, no HTML.

**Legal pages:** no schema. **Favorites/moodboards:** none; noindex.

**WebSite + Organization:** if a public entity ever exists (maintainer, sponsor entity), extend home JSON-LD with `publisher: { "@type": "Organization", ... }`; until then omit rather than fake.

Validation: Google Rich Results Test on `/`, `/build`, `/build?tag=shaders`, `/info` before launch; re-validate after rename; JSON-LD must contain the live brand string, never a stale one.
