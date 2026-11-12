# Positioning

Status: working draft for review. Date: 2026-11-04.
Assumption: copy below keeps `desgnix` as the working name until the rename decision in `docs/brand/naming.md` lands. Swap the name, keep the words.

## Audience

Primary: **design engineers and product designers who ship**. People who move between Figma and the editor in the same hour, who care about easing curves and bundle weight equally, and who already know the names of the tools they use but not every tool that exists. They are:

- Under time pressure: the gap between "I need X" and "the name of the thing that does X" is the cost.
- Allergic to listicles: a 400-item "Top design resources 2026" post is noise. They want a maintained, filterable, opinionated index.
- Working professionals: paid tools are fine, free tools are fine, only quality matters. Sponsorships are tolerated when labelled, invisible otherwise.

Secondary: **design leads and art directors** assembling reference for a team; **founders and frontend devs** wearing the design hat badly and needing a shortlist; **the curious public** arriving from search who have no account and never need one.

Explicitly not the audience: students collecting mood images for fun; people hunting freebie bundles; recruiters; clients of the linked products.

## Problem

The internet's design-reference supply is enormous and unfiltered. The experience of needing "a good icon set" or "an easing function that doesn't feel cheap" is:

1. Search, drown in SEO listicles and affiliate posts.
2. Open nine tabs, half are dead, one is a paywall, one is a newsletter farm.
3. Bookmark it, lose the bookmark, repeat next month.

Meanwhile existing directories optimise for breadth and ad density, not for the moment of actual need. Nobody maintains the middle: the tool, not the hype.

## Positioning statement

For interface makers who need the right tool fast, **desgnix is a hand-kept library of interface references**: every entry reviewed, every shelf organised by the job you are doing, open without an account, ordered so good things stay findable. Unlike evergreen listicles or bloated directories, it is a working catalogue, not a content farm.

One-line form, for the top of the Info page and about dialogs:

> A small, hand-kept library of the tools, references and examples behind good interfaces.

## Three value propositions

1. **Find it by the job, not by the name.** Tags name plain tasks (`Shaders`, `Hosting`, `Accessibility`), shelves group them by question (`Observe`, `Read`, `Create`, `Build`, `Components`, `Assets`, `Tools`, `Desk`), and search matches name, url, description and category. You never need to know the product's name to find it.
2. **Curated, not accumulated.** Every entry is reviewed and every removal is deliberate. The order is fixed and meaningful (captured from stars and traffic, not re-ranked by engagement), so the grid is trustworthy to skim. Paid placements are labelled and never bend the order.
3. **Yours to keep, free to browse.** Browsing, shelves and search need no account. An account adds favourites, moodboards and submissions; it never gates the catalogue.

## Brand voice and tone

Voice (constant): **the senior designer who sits next to you and says the right thing, briefly.** Practical, unimpressed, generous, precise. Sounds like a person at a workbench, not a brand at a microphone.

Tone rules:

- Plain words over fancy ones. "Hand-kept", not "artisanal". "Reviewed", not "vetted by experts".
- Short sentences. One idea each. Line breaks are free; use them.
- Name the reader's task, not the product's virtue. "Find what you need" beats "discover our amazing collection".
- Concrete beats abstract: durations, counts, labels, real names.
- Warmth through specificity, never through exclamation marks.
- No all-caps, no em dashes, no eyebrow labels above headings, no filler superlatives (revolutionary, seamless, powerful, elevate).
- British spelling, matching the codebase copy (`favourites`, `colour`).
- Numbers as numerals: `36 items`, not "thirty-six items".
- One h1 per surface; labels in Title Case (`All resources`, `Create moodboard`); prose in sentence case.

Tone by context:

| Context | Register | Example |
| --- | --- | --- |
| Home / landing | Quiet, inviting, task-first | "Resources for design engineers" + the one-line subheading |
| Shelf and tag pages | Encyclopaedic, helpful, terse | "Every entry filed under this tag, in the library's order." |
| Empty states | Encouraging, zero blame | "Nothing saved as a favorite" + the one tap that fixes it |
| Errors | Calm, specific, actionable | "Could not add the resource. Try again." |
| Auth and account | Reassuring, minimal | "An account is only needed for favourites, moodboards, and submitting a resource." |
| Submit flow | Exact, slightly formal | "We review every submission before it can appear in the shared catalogue." |
| Legal | Plain, complete, unadorned | "What desgnix stores, why it is needed, and the choices you have." |

## Do and don't, drawn from the real app

**Do** (these exist in the product, keep them):

- "Find what you need." (Info page H1) Says exactly what the page does.
- "A curated collection of interfaces, interactions and details that caught our eye." (catalogue subheading) First person plural, honest about taste, no superlatives.
- "Search by name, tag, or purpose when you have a specific job in mind." (FAQ) Teaches the mental model in one sentence.
- "You never pay for looking." is the substance behind the FAQ answer; keep it plain: "No. You can browse every shelf, search the catalogue, and open any source without signing in."
- "Nothing saved as a favorite" + "Tap the heart on anything you want to find quickly." Empty state with the exact next step.
- "Try a tool, a component, an icon set or a colour." Recovery hint, lists real nouns.
- "This shelf is ready for something" (no results, empty addable shelf). Charming without being cute.
- "Group the references you want to keep together." (Create moodboard) One line, one job.
- "Enter a valid web address." Error copy that names the fix, not the fault.
- Paid placements labelled and kept separate from the catalogue order (Terms, Info FAQ). Trust is the product; say so plainly.

**Don't** (and why):

- "Discover thousands of curated design resources." (We say "hand-kept", small on purpose. Scale is the wrong flex.)
- "Unlock the ultimate design toolkit." (Unlock, ultimate: filler. We list tools; we do not gate them.)
- "Welcome to your new home for inspiration." ("Inspiration" is mush; our noun is references, tools, examples. "Home" is a lie; it is a shelf.)
- "Oops! Something went wrong." (We never oops. Say what failed and what to do.)
- "Submissions are reviewed by our expert curation team." (We say "Every link is looked at before it is added." Fewer words, truer claim.)
- "desgnix: where design meets excellence." (Slogan soup. No tagline-on-signoff; the last thing on the Info page is the wordmark, not a slogan.)
- Exclamation points anywhere. If the copy is exciting, the exclamation point ruins it; if it is not, the exclamation point lies.
- "Simply", "just", "easy" as minimisers. The work is not always simple; pretending is contempt.
- Referring to moodboards as folders. The concept is a moodboard everywhere; consistency is respect.

## Messaging hierarchy

One home, three jobs: **home** (orient + trust), **shelf pages** (depth + order), **submit** (contribute + gatekeep). Empty states carry the brand's manners everywhere.

### Home (Explore surface)

- H1: **Resources for design engineers.** (unchanged; it is already correct)
- Sub: **Sites, flows, components, assets and the tools around them, filed by what you need when you open the editor.**
- Order of persuasion: shelf names first (Observe, Read, Create...), curation second, catalogue size third. Stats live on Info, not home.
- Primary action: the search field. Secondary: browse a band. Never a signup wall before value.
- Proof line (footer/Info adjacency, not hero): hand-kept, reviewed, fixed order, paid placements labelled.

### Shelf and tag pages

- Shelf H1: the shelf's name (`Build`), sub: the shelf's one-line promise from `catalog.ts`.
  - Example: Build: "The stack that ships it, from the first component to the last deploy."
- Tag H1: the tag (`Shaders`), sub: "Every entry filed under this tag, in the library's order."
- Pills filter in place; the tag list is built from what the shelf holds (never fake a tag with zero entries).
- Empty tag after search: fall back to `All` for the shelf; never show a chosen pill over an empty grid.

### Submit

- Dialog title: **Add a resource.** Description: **Save a useful link to the shared library.**
- The promise to the curator is explicit: name, link, category, note; reviewed before it appears; not guaranteed acceptance; submissions are tagged and enter at the end of the order.
- After submit: return to the library with the entry filed; the person sees their link land.
- Voice check: encouraging but exact. Never "Submit your awesome find!".

### Empty states

Every empty state: one plain sentence naming the situation, one sentence or one button naming the next step.

- No search match: **Nothing matches "<query>"** / **Try a tool, a component, an icon set or a colour.**
- Empty shelf (addable): **This shelf is ready for something** / **Add a resource or save one from the directory.** + primary action.
- Favourites empty: **Nothing saved as a favorite** / **Tap the heart on anything you want to find quickly.** (Currently says "favorite"; the app's British spelling standard would be "Nothing saved to favourites". Fix copy-side, never in code ids.)
- Moodboards empty: **No moodboards yet** / **Create a moodboard to give your references a place to live.** + **New moodboard**.
- Search palette empty: **Nothing in the library matches that.** / **Try a tool, an interaction, a category or a colour.**

## Naming discipline for the rename

If `Cabinet` (or another name) is chosen, the voice above does not change; the metaphor deepens it. Rules for any name:

- The name is never explained in-product. No "What is Cabinet?" onboarding; the nav teaches it.
- The domain is invisible in copy; nobody writes "at cabinet.design" in the UI.
- Pronunciation is never fought; say it normally and let context do the work.
