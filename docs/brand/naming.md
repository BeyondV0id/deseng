# Naming: the desgnix question

Status: proposal. Nothing in this document has been applied to the codebase.
Date: 2026-11-04.
Assumption at the top: the product currently ships under the string `desgnix` and the canonical origin `https://desgnix.app` (see `client/src/hooks/use-page-meta.ts`, `client/index.html`, `client/public/sitemap.xml`). That origin **appears unregistered today** (Google DoH, NS lookup, 2026-11-04, Status 3 NXDOMAIN with the `.app` TLD SOA in the Authority section; `desgnix.com`, `desgnix.design`, `desgnix.studio` and `desgnix.so` behave the same). Either the domain lapsed, was never registered, or is being withheld. Verify and register before any public launch, whichever name wins.

## Why "desgnix" fails the brief

The word dropped its vowels to look like a brand, which means it cannot be recovered by ear:

- Heard once, a listener types `desgnix`, `deznix`, `desgnex`, `deschnix` or `designix`. None of these are wrong guesses.
- It carries no meaning, so it cannot be recalled by association. Search shows only soundalikes (`designix.in`, `designx.co`, `designxstudio.in`, all agencies), which means the name actively competes with SEO-strong lookalikes for its own head term.
- It is a filename with ambitions. Nothing about it tells a listener "curated design references".
- Five obvious TLDs are all unregistered as of today, which is consistent with nobody being able to find the product from its name alone.

None of this makes the current build bad. It makes the current name bad. The fix is a name that survives being heard once, not a redesign.

## Method and caveats

- Collision research was run on 2026-11-04 via web search (Google grounding) and via DNS-over-HTTPS NS lookups (`dns.google/resolve`). "Appears unregistered" means NXDOMAIN from the TLD authority at query time. Premium, reserved and registry-held names are not detectable this way, and registration can happen between today and launch. Treat every "free?" as "go verify, then register", never as a purchase order.
- Trademark notes are lay observations, not legal advice. No clearance search was performed in any jurisdiction. Before announcing a rename, run a proper mark search (USPTO TESS, EUIPO, and search-engine brand checks) with a qualified attorney, especially for the winner.
- SEO collision risk is judged on what a searcher types, not on who owns what. A common noun is a crowded keyword even when the exact match domain is free.
- No em dashes in this document; copy rules from AGENTS.md apply.

## The ten candidates

### 1. Cabinet

- **Spelling and pronunciation.** `cabinet`, one word, KAB-ih-not. Every letter is doing the work you can hear. Survives being heard once nearly 100% of the time.
- **Why it survives heard-once typing.** Ordinary word, no silent letters, no doubled vowels, no ambiguity in any English accent we care about.
- **What it evokes.** The cabinet of curiosities, the wunderkammer: a room or box where a collector keeps the finest specimens, labelled and ordered. For a catalogue of interface references this is the single most precise metaphor in the set. It also implies browse-first behaviour, which is what the shelves are.
- **Likely domains.** `cabinet.com` registered; `cabinet.app` registered; `cabinet.design` appears unregistered; `cabinet.studio` appears unregistered; `cabinet.so` appears unregistered. Verify all three and register the pair you want the day you commit.
- **SEO collision risk.** High on the bare noun (fitted kitchens, flat-pack furniture, SQL keywords). Low on `cabinet design`, `cabinet library` and `cabinet design library` as phrases. The brand needs its modifier for non-branded search; that is normal for meaningful-word brands.
- **Trademark-ish notes (not legal advice).** Cabinet Magazine (Brooklyn, art and culture quarterly, since 2000, cabinetmagazine.org) is a non-software use in an adjacent cultural space and explicitly built on the same wunderkammer idea. Same-word, different medium, same spirit: flattering, but it is prior use in design-literate circles. Furniture retail is the high-volume use. Neither blocks a software mark outright; both argue for "Cabinet" plus a qualifier or a distinctive styling if you want federal registration. Clear it properly before launch.

### 2. Almanac

- **Spelling and pronunciation.** `almanac`, one word, AL-muh-nak. The `-ac` ending is the only wobble; "almonac" and "almanack" are plausible errors and both near-misses are empty enough to redirect.
- **Why it survives heard-once typing.** It is a print-era word everyone has seen; recognition does the spelling work. Say it once in a room and most people spell it right.
- **What it evokes.** A yearly reference compendium: dense, trusted, hand-kept, organised by purpose rather than by alphabet. Exactly the register of "a hand-kept index of interface craft". "The almanac of interface craft" is a publishable line of copy as-is.
- **Likely domains.** `almanac.com` registered; `almanac.app` registered; `almanac.design` appears unregistered; `almanac.studio` registered; `almanac.so` registered. `almanac.design` is the obvious buy if confirmed.
- **SEO collision risk.** Moderate. `almanac.io` is an async team-wiki and documentation platform (software, adjacent category, not design). "Almanac" otherwise skews to gardening and farmers' almanacs. `almanac design`, `design almanac` and `interface almanac` look open. Risk is the adjacent software company, not the noun.
- **Trademark-ish notes (not legal advice).** Almanac (almanac.io) is the nearest live software mark; different niche, same class-adjacent space (knowledge tools). Ordinary-language word with a long generic history; registration of the bare word is unlikely to be granted broadly, but use as a name with a modifier is common and defensible. Confirm no conflicting registrations in Class 9/42 before filing. Not legal advice.

### 3. Shelf

- **Spelling and pronunciation.** `shelf`, one syllable, trivial.
- **Why it survives heard-once typing.** Perfect phoneme-to-grapheme mapping. Zero error rate from hearing it.
- **What it evokes.** The product's own words: "a working shelf of interface references", "the shelf pages", "the sideboard of the web". Instantly legible, warm, domestic, organised. Strongest immediate clarity of any candidate here.
- **Likely domains.** `shelf.com`, `shelf.app`, `shelf.design`, `shelf.studio`, `shelf.so` all registered. No clean namespace remains in the asked-for TLDs. Getting the bare `.com` would be an aftermarket purchase.
- **SEO collision risk.** Very high on the bare noun (shelving furniture, e-commerce category pages, "off the shelf"). `shelf design library` is usable but you are permanently fighting furniture in first-page results.
- **Trademark-ish notes (not legal advice).** Generic noun for display furniture; as a bare word it is weak and dilutable. Software uses exist (asset-management tools using "shelf"). Not distinctive enough to own without a modifier. Not legal advice.

### 4. Sideboard

- **Spelling and pronunciation.** `sideboard`, one word, SIDE-bord. Compound of two ordinary words.
- **Why it survives heard-once typing.** Compound spelling is discoverable from the parts; "side board" is the only real failure mode and it self-corrects.
- **What it evokes.** The dining-room storage piece: the flat surface with doors below where the good things are kept. Kinship with the existing `Desk` shelf and the furniture metaphor family. Distinctive, a little witty, design-culture literate.
- **Likely domains.** `sideboard.com` registered; `sideboard.app` registered; `sideboard.design` registered; `sideboard.studio` registered; `sideboard.so` appears unregistered. Only `.so` shows open, which tells you where this name stands on the internet.
- **SEO collision risk.** Very high on the bare noun (furniture searches dominate utterly). `sideboard design library` is fine.
- **Trademark-ish notes (not legal advice).** A small Windows memo board app on the Microsoft Store uses the name; furniture retail is the volume collision. Ordinary compound noun, weak standalone mark. Not legal advice.

### 5. Kiln

- **Spelling and pronunciation.** `kiln`, one syllable, KILN. Trivial.
- **Why it survives heard-once typing.** Short, ordinary, unambiguous spelling for an English speaker.
- **What it evokes.** Fired craft: the thing that turns raw material into finished objects. Suggests "the catalogue is where raw references become finished judgement". Beautiful, but the craft is ceramics-first; the design-tool reading is a stretch for cold listeners.
- **Likely domains.** `kiln.com`, `kiln.app`, `kiln.design` all registered; `kiln.studio` appears unregistered; `kiln.so` registered.
- **SEO collision risk.** Moderate to high in tech: `kiln.tech` (open-source LLM evaluation tooling), `editkiln.com` (browser creative suite), Studio Kiln (design/branding agency). Three software-adjacent uses of the same word. `kiln design library` still open-ish, but the word is busy in exactly our audience's orbit.
- **Trademark-ish notes (not legal advice).** Multiple live software uses; agency use in our exact field. Crowded field for a short strong mark. Not legal advice.

### 6. Vitrine

- **Spelling and pronunciation.** `vitrine`, one word, vih-TREE-n. Not obviously an English word. Heard cold, listeners type `vitreen`, `vitrene`, `vitrine` (correct, luckily, by French rules).
- **Why it survives heard-once typing.** It mostly does not. It fails the core test the user asked about.
- **What it evokes.** A glass display case: the museum showcase. Semantically superb for "curated things on view". Also quietly elitist and French, which cuts against the plain-spoken voice in AGENTS.md.
- **Likely domains.** `vitrine.com`, `vitrine.app`, `vitrine.design`, `vitrine.studio`, `vitrine.so` all registered.
- **SEO collision risk.** High and same-category: Vitrine (vitrinecms.com) is collection-management software and public showcase websites for museums, galleries and collectors. That is our exact "curated collection, displayed well" semantics. Unfixable by modifier without awkwardness.
- **Trademark-ish notes (not legal advice).** Same-category prior users; French ordinary word with generic meaning, but the register is niche. Direct competitive collision, not merely legal risk. Not legal advice.

### 7. Folio

- **Spelling and pronunciation.** `folio`, FOH-lee-oh, four letters-ish (five), everyone knows the word from books.
- **Why it survives heard-once typing.** Famous word, phonetic spelling, nobody mistypes it wholesale.
- **What it evokes.** A leaf of a manuscript, or a collection of works (portfolio stem). Design-literate, bookish, quiet. But it is the single most reused name in this space: portfolio builders, UXfolio, Folio templates, digital business cards, PDF apps.
- **Likely domains.** `folio.com` registered; `folio.app` registered; `folio.design` appears unregistered; `folio.studio` registered; `folio.so` registered.
- **SEO collision risk.** Very high. The SERP for "folio" is portfolio tools and bookbinding; "folio design" returns templates and portfolios. You will never rank bare; modifiers needed forever.
- **Trademark-ish notes (not legal advice).** Dozens of uses, weak standalone mark, crowded class. Not legal advice.

### 8. Motif

- **Spelling and pronunciation.** `motif`, moh-TEEF. Six letters, phonetic enough, but the `-if` ending misleads some listeners toward `motife`/`motiff`.
- **Why it survives heard-once typing.** Good hit rate, small miss rate. Acceptable but not clean.
- **What it evokes.** A recurring element in a design system or artwork; the exact thing a component library deals in. Strong for "Components", weaker for the whole catalogue (it says "pattern", not "collection").
- **Likely domains.** `motif.com` indeterminate today (SERVFAIL at query time); `motif.app`, `motif.design`, `motif.studio`, `motif.so` all registered.
- **SEO collision risk.** Very high and same-category: Motif (motif.io) is an agent-native BIM design platform; plus the historic X11 Motif GUI toolkit still surfaces in searches. Two serious design/software priors.
- **Trademark-ish notes (not legal advice).** Live software mark in building/design; historical open-source toolkit name. Crowded. Not legal advice.

### 9. Workbench

- **Spelling and pronunciation.** `workbench`, one word compound, two obvious words, trivially spelled, trivially typed.
- **Why it survives heard-once typing.** Compound of common words; near-zero error.
- **What it evokes.** The bench under the work: tools laid out in order. Perfect register for "the stack that ships it". Slightly developer-only flavour; weaker for the Assets/Read shelves.
- **Likely domains.** `workbench.com` registered; `workbench.app` indeterminate (SERVFAIL); `workbench.design` registered (it is an AI website-redesign workspace); `workbench.studio` registered; `workbench.so` registered.
- **SEO collision risk.** High: Salesforce Workbench, GNOME Workbench, Oracle/IBM offerings, and workbench.design itself. Generic occupational noun; undefendable bare SERP.
- **Trademark-ish notes (not legal advice).** Generic term, many live uses; workbench.design is essentially our name-space. Not legal advice.

### 10. Alcove

- **Spelling and pronunciation.** `alcove`, AL-kohv. Six letters, ordinary-ish word (a recess in a wall).
- **Why it survives heard-once typing.** Mostly good; non-native listeners occasionally split it (`al-cove`). Beats desgnix by a mile; not as clean as Cabinet or Almanac.
- **What it evokes.** A quiet recessed shelf in a wall: exactly where you would put the small perfect thing. Gentle, architectural, domestic. Best imagery of the ten, decent meaning, but the near-homonym "alps" and the French-ish spelling hold it back.
- **Likely domains.** Every asked-for TLD registered: `alcove.com` (registered, parked/unresolved), `alcove.app`, `alcove.design`, `alcove.studio`, `alcove.so`. An `alcove.co` exists (interior-design procurement SaaS). No clean namespace.
- **SEO collision risk.** High and adjacent: alcove.co (interior design procurement platform), Alcov AI (interior design), Framer templates named Alcove. The design-adjacent slot is occupied; interior design will always outrank us for the noun.
- **Trademark-ish notes (not legal advice).** Multiple live uses in our exact audience's peripheral vision; ordinary architectural word. Not legal advice.

## Summary table

| Candidate | Heard-once typing | Semantic fit | Bare-noun SEO | Clear namespace today | Same-category prior use |
| --- | --- | --- | --- | --- | --- |
| Cabinet | Excellent | Excellent (wunderkammer) | Poor (furniture) | `.design` `.studio` `.so` appear open | Cabinet Magazine (arts, publishing) |
| Almanac | Good | Excellent (reference compendium) | Moderate | `.design` appears open | almanac.io (team wikis) |
| Shelf | Perfect | Excellent (product's words) | Poor (furniture) | None in asked TLDs | Asset tools named shelf |
| Sideboard | Good | Good (storage metaphor) | Poor (furniture) | `.so` appears open | Microsoft Store memo app |
| Kiln | Excellent | Good (fired craft) | Moderate-poor | `.studio` appears open | kiln.tech, editkiln, Studio Kiln |
| Vitrine | Poor | Excellent (display case) | Poor | None | vitrinecms.com (same category) |
| Folio | Excellent | Good (manuscript/portfolio) | Poor | `.design` appears open | Ubiquitous portfolio tools |
| Motif | Fair | Fair (recurring element; mis-framed for collections) | Poor | None safely | motif.io (BIM design), X11 Motif |
| Workbench | Excellent | Good (tools at hand) | Poor | None safely | workbench.design, Salesforce/GNOME |
| Alcove | Good | Good (recessed shelf) | Poor | None | alcove.co (interior design SaaS) |

All "appears open/registered" calls are 2026-11-04 Google DoH NS observations, not purchase options. Re-check before committing.

## Top 3 ranked recommendation

1. **Cabinet.** The only candidate where the metaphor is both precise (a curated cabinet of design curiosities) and culturally loaded in our favour (cabinet of curiosities is the oldest name for a curated collection). Trivial to say, spell and type; `.design`/`.studio`/`.so` appear open; Cabinet Magazine is publishing, not software, and is flattered by the association. Its weakness (furniture SEO on the bare noun) is solved by the same modifier discipline every meaningful-word brand uses: "Cabinet, the design library".
2. **Almanac.** "The almanac of interface craft" is the best single line of copy in this document. `almanac.design` appears open; the nearest software prior (almanac.io) is a different niche. Typing risk is the `-ac` tail, mitigated by redirecting "almonac"/"almanack" if you take the name.
3. **Shelf.** The product already speaks this word; clarity does not get better than this. Ranked third only because every asked-for TLD is registered and bare-noun SEO is furniture-dominated; it needs a modifier in every marketable mention, or an aftermarket `.com`.

Honorable mention: Sideboard (best quirk per syllable, .so appears open, furniture SERP though).

## Keep or change: explicit call

**Change the public name.** desgnix fails the heard-once test, carries zero meaning, has no findable namespace today, and actively competes with soundalike agencies for its own searches. The concept ("a hand-kept library of interface craft") is sound; the string is not.

Recommended move, in order:

1. Commit to **Cabinet** (or Almanac if Cabinet fails clearance/registration), and register `cabinet.design` plus one backup TLD immediately. Verify with a registrar, not DoH.
2. Run proper mark clearance (USPTO/EUIPO, Classes 9 and 42) with counsel before the announcement. This document is not that.
3. Keep `desgnix` as the **internal** identifier during the transition (see below). Public copy, meta, manifests, wordmarks and the canonical origin all switch to the new name.
4. If the owner decides against any rename this quarter, then **register desgnix.app today**; it appears unregistered and the whole SEO plan in `docs/brand/seo.md` points at it.

## The reserved brand string in code

One string owns the current identity, and it lives in exactly these places:

- `client/src/hooks/use-page-meta.ts`: `siteUrl = 'https://desgnix.app'` and `socialImage` derived from it. This is the single source of truth for canonical, og:url and og:image.
- `client/index.html`: static copies of the same values (title, description, og:*, application-name, JSON-LD WebSite name/url).
- `client/public/sitemap.xml`, `client/public/robots.txt`, `client/public/site.webmanifest`: absolute URLs and names.
- `client/src/pages/page.tsx`: `usePageMeta({ title: ... 'desgnix · your design library' ... })` and `client/src/lib/theme.ts` (`themeStorageKey = 'desgnix-theme-v2'`).
- Non-SEO identifiers that deliberately stay even after a public rename: package `name` in `package.json`, the `desgnix-*` localStorage keys, `migrateLegacyStorage()` prefixes, `auth-intent` storage key. Renaming those buys nothing and strands existing users' preferences.

A rename is therefore a **small mechanical change, not a refactor**: edit `siteUrl`, the static copies in `index.html`, the public files, and the visible copy strings (wordmark components, aria labels, docs). The TypeScript, storage keys and DB tables stay `desgnix`. Do not bulk-rename identifiers; the failure mode is losing theme preferences and breaking the migration shim for zero user value.

If Cabinet wins: `docs/brand/seo.md` stays valid unchanged because it is keyed to `siteUrl`, not to the literal string. Only the assumption line and the visible brand need editing on rename day.
