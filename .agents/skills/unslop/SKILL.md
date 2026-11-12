---
name: unslop
description: Turns vibecoded, AI-looking UI into a designed interface by auditing for AI visual clichés and applying deliberate, product-specific design choices.
---

# Unslop UI Protocol

A skill for stripping AI-generated visual slop and replacing it with intentional design. Use this when a UI looks like it came straight out of a model's default template: purple gradients, glowing blobs, centered hero + three feature cards, emoji icons, untouched shadcn defaults.

---

## When to invoke

- The UI has obvious AI tells (see Phase 1 checklist below)
- The user says it "looks generic", "looks like AI", or "looks sloppy"
- You just generated a significant amount of UI and want to review it

---

## Phase 1 — Audit (Find the Slop)

Scan the target interface for these formulaic markers. List every instance you find before touching any code.

**Color tells**
- Purple/indigo gradients (`#6c5ce7`, violet-to-black, indigo-to-purple)
- Unprompted neon glows, colored drop-shadows with no rationale
- Gradient-clipped heading text that exists purely for visual noise
- Untouched `zinc`, `slate`, or `neutral` Tailwind palettes with no product identity

**Layout tells**
- Centered hero section followed by exactly three feature cards
- Predictable bento grid with identical tile sizes
- "Stats row" with four big numbers and no context
- Footer with four identical link columns

**Typography tells**
- Calligraphy serif paired with a system sans (the "warm brand" trap)
- All-caps eyebrow labels above every heading
- Font sizes that scale uniformly without hierarchy breaks

**Component tells**
- Emoji used as icons (`🚀`, `✨`, `🎯`)
- Unstyled default shadcn/ui or Radix primitives with zero customisation
- `rounded-full` on everything regardless of context
- Glassmorphism applied without a surface beneath it

---

## Phase 2 — Direction (Establish Intent)

Before editing anything, answer these questions from the brief or the existing codebase:

1. **What is this product's one-line character?** (e.g. "precise developer tool", "calm personal finance app", "raw creative portfolio")
2. **What is the dominant feeling?** Choose one: restrained / expressive / editorial / technical / playful
3. **What colour identity does the product actually have?** If none exists yet, derive one from the product's name, category, and audience — never from model defaults.
4. **What is the one visual motif that can anchor the page?** (texture, line weight, a specific radius, a type treatment)

Do not start Phase 3 until you have answered all four.

---

## Phase 3 — Execution Passes

Make changes in this order. Do not jump ahead.

### Pass 1: Spacing and rhythm
- Break the uniform padding. Not everything needs `p-6` or `py-24`.
- Remove predictable vertical rhythm. Introduce deliberate tension: one section that breathes, one that is dense.
- Align to an 8px base grid but allow deliberate breaks at key focal points.

### Pass 2: Colour and tokens
- Remove all hardcoded AI-default colours. Replace with named tokens.
- Constrain the palette: one primary, one accent used sparingly, neutrals.
- Kill decorative gradients unless they carry meaning. A gradient that exists only to look "premium" is slop.

### Pass 3: Typography
- Introduce one meaningful scale break. The hero type should feel different in weight, not just size.
- Remove all-caps eyebrow labels. Use sentence case and smaller font size instead.
- Set line-height and letter-spacing per context, not globally.

### Pass 4: Visual elements and detail
- Replace emoji with actual icons from the project's icon system.
- Replace stock illustrations and blob SVGs with concrete product-specific visuals.
- Remove glassmorphism unless there is a real surface and real depth behind it.
- Every border-radius must be derived from a token, not eyeballed.

---

## Rules

- **Never** swap one cliché for another. "Warm cream + serif + sage green" is also slop.
- **Never** apply a motif globally. One textured section; the rest breathes.
- **Never** add animation for its own sake. Motion must carry meaning.
- **Always** leave the underlying functionality untouched. This is a visual pass only.
- **Always** verify the result reads correctly at the product's real breakpoints.
