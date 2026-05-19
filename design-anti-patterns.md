# Design Anti-Patterns — Shared Reference

> The marketing design skills (`design-plan`, `design-system`, `design-ui-components`, and the platform skills) all read from this file. Update this file whenever a new AI-tell is observed in real output.

This file is the canonical anti-pattern list. Each platform skill references it and adds only its platform-specific tells inline. Treat every entry below as a hard rule unless a brand's `DESIGN-PLAN.md` explicitly waives it.

## How to use this file

Before claiming any artifact is done, scan the section headers below and verify the artifact violates none. If you spot a new tell in real output that isn't listed here, add it — that's how this file maintains its bite.

## Related canonical references

This file is the **hard floor** — the list of things that are forbidden. It is paired with two sibling references that every skill also reads:

- **`design-principles.md`** — the positive craft floor: typographic hierarchy, spatial rhythm, color theory, layout logic, visual tension. What good looks like, not just what bad looks like.
- **`design-variation-sop.md`** — the procedure for choosing a distinct visual direction every invocation, with a named-aesthetic roster defined in concrete CSS terms.

When any of those docs appears to permit something this file forbids (e.g. "layer gradients for atmosphere"), **this file wins.** Atmosphere/depth techniques are permitted only for directions that explicitly earn them and only in non-banned forms.

---

## 1. Universal — never, regardless of brand

These are non-negotiable across every artifact, every brand, every direction.

- No purple-to-cyan, blue-to-pink, or sage-to-mint gradients
- No floating orbs, glowing nodes, breath circles, brain meshes, neuron visualizations
- No robot/cyborg iconography, brain-with-circuits, "AI as a face"
- No generic geometric/circuit patterns used as background decoration
- No 3D isometric illustrations (servers, devices, dashboards floating in space)
- No stock photography of people pointing at screens
- No drop shadows on text, anywhere
- No emojis (unless `DESIGN-PLAN.md` explicitly allows)
- No exclamation points (unless the brand's voice section calls for them)
- No medieval/heraldic imagery (Honeycomb-era observability cliché)
- No graph-spaghetti backgrounds (real-looking charts as decoration, not data)
- No filled-background callouts in body content (use a left rule + color hint instead)
- **No indigo/violet/purple as the default accent or primary.** Specifically the `hsl(230–280)` family — Tailwind's `indigo-500` (`#6366F1`) and its neighbors — on a near-white surface. This is the single most-recognized AI tell (Tailwind's old default, now self-reinforcing in scraped training data). Allowed ONLY when `DESIGN-PLAN.md` names purple as a brand color with a stated reason, and even then never as a gradient.
- **No purple→blue / "aurora" / gradient-mesh backgrounds, and no gradient-fill text.** This is the 2020–21 web look frozen into the training corpus. Backgrounds are a flat surface token unless the direction explicitly earns atmosphere (see `design-variation-sop.md`), and earned atmosphere is still never the banned gradient families.
- **No glassmorphism by default** — frosted/translucent panels via `backdrop-filter: blur()`, especially layered over a gradient. If a surface must be translucent it carries an explicit opaque scrim guaranteeing WCAG-AA text contrast; absent that, forbidden.
- **No ambient gradient "blobs"** — soft pastel or neon shapes floating behind the UI as background atmosphere. This is the orbs tell in softer clothing; the existing orbs ban covers it and so does this.
- **No single global border-radius applied uniformly to every element** (the `rounded-lg`-on-everything tell). Radius is a deliberate, role-specific decision — a button, a card, an image, and an input do not all share one corner. See `design-principles.md`.
- **No timid, evenly-weighted palette** where every color carries roughly equal visual weight at low overall contrast. The polished-neutral "safe SaaS" palette is itself a slop signal. Dominant surface + one sharp, sparingly-used accent — see `design-principles.md` and `design-variation-sop.md`.

## 2. Type — emphasis is a deliberate choice

The default AI-emphasis move is to italicize one word in a headline. The cousin move is to color one word semantically. Both read as AI within seconds.

- **No italicized single word as emphasis.** If you emphasize a word, do something stronger: 3×+ scale shift, weight shift (700 vs 400), position (drop to next line), or a real typographic event (different family, oversized punctuation).
- **No single-word color-emphasis.** Coloring one word in the accent or signal color is the same move as italicizing it — just dressed in semantic clothes. Forbidden as a default emphasis. Allowed only when the color is doing real semantic work AND the rest of the artifact uses the same color in the same role (e.g. `--color-crit` highlighting actual critical content, not just an emphasized adjective).
- **No more than 2 type families per artifact.** Mono labels count as a third only when used in their proper role as labels.
- **No display-font flourishes that read as "designer trying"** (excessive ligatures, swash variants used decoratively, optical-size axis pushed to extremes for no reason).
- **No center-aligned hero blocks** (unless the brand explicitly calls for symmetry).
- **No Inter, Roboto, Arial, Open Sans, Lato, Helvetica, or OS system stack as the primary display or body family.** This is the AI-default sans monoculture — the fastest non-color tell. The primary family must be a deliberate, category-matched choice from the roster in `design-variation-sop.md` (Fraunces/Playfair/Crimson Pro for editorial; Clash Display/Satoshi/Cabinet Grotesk for startup; IBM Plex/Source Sans 3 for technical; JetBrains Mono/Fira Code for code; Bricolage Grotesque/Obviously/Newsreader for distinctive). Allowed only if `DESIGN-PLAN.md` names one of the banned families for a stated brand reason.
- **Space Grotesk is a yellow flag, not a distinctive pick.** It has already over-converged across AI output. Permitted as a supporting/code face; never sold as "the distinctive choice."

## 3. Color — semantic over decorative

- No accent color used decoratively. Accent earns its place per surface — a single most-important action, a status signal, a structural rule. If the accent appears in 3+ unrelated locations on one canvas, it's decoration.
- No signal colors (ok-green, warn-amber, crit-red) used outside their semantic role. Green is "ok"; never "brand color" by default.
- No "accent color on a single punctuation mark" (period, em-dash, slash). Clever the first time, AI-tell after that.
- No "warm cream + dark ink + oxblood accent" specifically (Hollow's choice is now its own pattern; if a NEW brand goes this route, justify why and execute differently).
- No "dark surface + green-accent + amber/red signals" specifically (Tail's choice; same justification rule).
- **No evenly-distributed palette.** Dominant colors with sharp accents outperform timid, evenly-weighted palettes (Anthropic's own frontend-aesthetics guidance). One hue owns the large surfaces; the accent is small, saturated, and rare. If you can't point to the single dominant and the single accent, the palette is slop.
- No indigo/violet primary (cross-listed from §1 — it is a color rule as much as a universal one).

## 4. Layout — architecture novelty must reach the inner blocks

The most common second-iteration failure: the OUTER architecture is novel (`inverse-text`, `pattern-led`, `object-of-content`) but the INNER text block reverts to chrome-led (eyebrow + headline + meta footer-row). Architecture choice applies recursively.

- **No `eyebrow + headline + meta-row` inside a panel** when the outer canvas already broke the chrome-led mold. Pick simpler inner block (just headline; or headline + one supporting line; no row).
- **No 3-column footer rows** (`auto / 1fr / auto` with mark / spacer / url) by default. This pattern survives every iteration unless explicitly broken. Vary placement: corner-only, embedded in copy, on top instead of bottom, or absent entirely.
- **No "top metadata row" disguised as functional context.** Mono-caps row at the top with category · date · version IS an eyebrow. Counts toward the eyebrow restriction. If you remove eyebrows but add a top mono-row, you haven't removed the chrome.
- **No "brand mark always lives in lower-right."** Vary placement across artifacts in a brand. Lower-right · upper-left · embedded in copy · absent. If 3 artifacts in a brand all have the mark in the lower-right, the system has collapsed.
- **No bento-grid layouts by default.** Bento grids became their own 2024-era cliché.
- **No three-up icon-card feature grid as the default content section** — three boxes, each an icon in a circle/rounded-square above a bold label and two lines of body, uniform padding and radius across all three. This is the statistical median of every scraped Tailwind tutorial and the loudest layout tell. Feature/benefit content uses a non-card structure (numbered text blocks, a definition list, an asymmetric editorial run) unless the brand has a stated reason for cards.
- **No "hero → three cards → CTA band" page skeleton** as the reflexive page architecture. If the page's bones match the median tutorial, the architecture has collapsed regardless of how the surface is styled.

## 5. Editorial cosplay — wrong genre tells

These survive because they "feel literary" but they read as AI mimicking editorial design.

- No `§ 01` / `§ 02` section markers unless the artifact is genuinely part of a numbered series the user is producing
- No `No. 01` / `Issue One` / `Notebook · No. 01` framing — pastiche of literary magazines
- No `EP. 01` / `Episode 01` markers unless the user has an actual numbered video series
- No "From the founder · DATE" eyebrow unless the artifact is genuinely a founder note (not just a generic announcement)
- No `/Brand` slash-prefix mark (Vercel/Linear-era cliché, dated by ~2024)
- No "Notebook" / "Quarterly" / "Volume" labels on one-off artifacts

## 6. Voice & copy — category-specific marketing tells

Add to this section as new categories produce their own voice patterns.

### Wellness / journaling / meditation
- No "your inner voice deserves to be heard" energy
- No therapist-speak: "hold space", "lean in", "your truth", "show up for yourself"
- No "discover your X with Y's mindful Z" templates
- No watercolor/serif-italic mindfulness aesthetic

### Observability / SRE / dev tools
- No "single pane of glass"
- No "actionable insights"
- No "next-generation observability"
- No "AI-powered" anything (even when AI is involved)
- No "the future of [category] is here"
- No "digital transformation"
- No "observability for the modern stack"

### SaaS launch (any category)
- No "ANNOUNCING" / "INTRODUCING" eyebrows on launch artifacts
- No countdown timers
- No "join the waitlist for early access" with urgency framing
- No "The wait is over"

### Any category — calls to action
The generic-CTA tell is as strong as the purple tell. A value-free button label says the copy was never written for this specific artifact.

- No "Get Started", "Get started for free", "Learn More", "Sign Up", "Try it now", "Read More", "Discover More", "Explore" as the primary action. These name no action and carry no value.
- The CTA names the actual next step and what the reader gets: "Read the 4-minute teardown", "See the December numbers", "Install the CLI", "Watch the 90-second demo". Specific verb + specific object.
- No two-CTA hero (a filled primary next to a ghost "Learn more"). One action per surface — the accent earns its place on exactly one.
- Authenticity over generic everywhere copy appears: real datelines (not "today"), the brand's actual voice (not aspirational filler like "Build the future" / "for the modern team"), concrete nouns over category abstractions.

## 7. Cross-artifact rules — system-level, not per-artifact

Before generating an artifact, list previous artifacts in `./design/<brand-slug>/artifacts/` and read their variation comments. Apply these rules:

- **Architecture archetype must differ** from the most recent artifact. Strong rule.
- **Footer signature treatment must differ** from the most recent artifact (corner-only · embedded · on-top · row · absent). Vary across the set.
- **Brand mark placement must rotate** — if the last 2 artifacts placed the wordmark lower-right, this one places it elsewhere or omits it.
- **Eyebrow / top-metadata-row counts as chrome.** If the last artifact had one, the current one should NOT — variation is the discipline.
- **Inner text block architecture must match outer.** If the outer archetype is `inverse-text`, the inner block can't revert to `chrome-led` structure.

## 8. Animation — almost always wrong

- No animations by default on static artifacts (LinkedIn, Twitter, YouTube, Instagram). Animation belongs in motion artifacts, not stills.
- On stream overlays: ONE animation maximum across all scenes, and it must be functional (pulse on a status indicator, not decorative motion). A pulsing dot AND a blinking cursor is two animations — drop one.
- No transitions for transitions' sake (slide-in, fade-in, parallax). Static design has its own discipline.

---

## Maintenance

When a new AI-tell appears in real output during a smoke test or production use:

1. Identify which section it belongs to (or create a new section)
2. Add it as a bullet with the explicit rule
3. If it's a category-specific marketing phrase, add it under section 6
4. If a previous rule needs strengthening (e.g., italics-ban needed to extend to color-emphasis), edit in place

Do not delete entries. Once an anti-pattern is identified it stays — these are cumulative learnings, not opinions.
