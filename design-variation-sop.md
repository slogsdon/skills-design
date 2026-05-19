# Variation SOP — Shared Reference

> The procedure for choosing a *distinct* visual direction every time, so output doesn't collapse to the same safe look. Paired with `design-anti-patterns.md` (hard floor) and `design-principles.md` (craft floor). Every design skill reads all three.

`design-anti-patterns.md` wins any conflict. Nothing here licenses a forbidden pattern; the roster makes directions distinct *within* the floor.

## The core failure this prevents

Asked for "a design," the model converges on one look: neutral sans, near-white surface, soft indigo accent, gentle radius, centered hero, three cards. Every artifact becomes a variant of that. The fix is not "try to be creative" — it's a **named commitment made before any markup**, biased away from the safe middle and away from what was made last.

## Scope — where the roster applies

| Context | What varies | Mechanism |
|---|---|---|
| `design-plan` / `design-system` (defining a brand) | The brand's whole aesthetic | **Pick from the roster below.** This is where the named direction is chosen. |
| Brandless / one-off artifact (no `DESIGN.md`) | The artifact's whole aesthetic | Pick from the roster below. |
| Platform artifact *within an established brand* | The artifact's composition, NOT the brand aesthetic | The brand direction is fixed. Vary via the skill's existing archetype / layout / type-pressure / color-usage axes + the cross-artifact "must differ from recent" rule. Do **not** switch a brand's roster direction per artifact. |

So: the roster chooses the brand. Inside a brand, the per-skill axes choose the artifact. Both must actively avoid the recent and the default.

## Rule 1 — never default to "clean minimal"

Minimal is one of nine+ directions, not the gravity well. If nothing forces a choice, you will land on minimal — that IS the slop. Minimal is permitted only when *chosen against the alternatives*, never as the path of least resistance. The same applies to "modern", "professional", "sleek" — those are not directions, they are the absence of one.

## Rule 2 — roll a direction, deterministically biased

1. List the directions already used by recent artifacts/brands in scope (read the variation comments in `./design/<brand-slug>/artifacts/` and recent `DESIGN.md` files).
2. **Exclude every recently-used direction** and exclude minimal-by-default.
3. From what remains, pick the direction that best fits the *content and audience* — not the one that's easiest. When genuinely free, derive the pick from the topic (e.g. hash/seed off the topic slug) so repeated runs don't all land the same place. Never pick the same direction twice in a row for one brand/user.
4. State the chosen direction and *why this one* before writing any tokens or markup.

## Rule 3 — offer 3, default 1

Before committing, sketch **three distinct directions** — three different rows of the roster (or, inside a brand, three different archetype × axis combos). Present them as a one-line menu:

```
Three directions for <thing>:
  A. <direction> — <one-line on type/color/layout signature>
  B. <direction> — <one-line>
  C. <direction> — <one-line, deliberately the riskiest>
Generating A by default. Say "B", "C", or "all three" to change.
```

Default to generating **one** (the best-fit, option A) to keep output lean. Generate all three only when the user asks ("all", "options", "compare"). The discipline is the *divergent sketch*, not the output volume — three real alternatives must be considered even when one ships. C should be the one you'd be slightly afraid to show — that's how you know the set actually spans.

## The roster — directions defined in CSS terms, not vibes

Each is a concrete commitment. "One forbidden thing" keeps the direction from drifting back to the median.

### Swiss / International (neo-grotesque)
- **Type:** one grotesque across weights (e.g. a Helvetica-alternative like Inter Tight only if brand-permitted, else Söhne / Neue Montreal / a real grotesque). Flush-left, ragged-right. Tight tracking on display.
- **Color:** white/black + exactly one primary (often red). No tints.
- **Radius:** 0. **Density:** tight, mathematical. **Layout:** strict visible column grid, hard alignment to 2–4 axes, generous outer margin.
- **Forbidden here:** any radius, any gradient, any centered block.

### Brutalist / neobrutalist
- **Type:** system-raw or oversized grotesque; default-ugly used on purpose; underlines unstyled.
- **Color:** high-contrast primaries on stark white or black; one harsh accent.
- **Radius:** 0. Borders thick (2–4px) and black. Shadows either hard-offset solid or none. **Density:** dense, deliberately uncomfortable. **Layout:** exposed structure, visible boxes, asymmetry.
- **Forbidden here:** soft shadows, gentle radius, pastel anything.

### Editorial / literary
- **Type:** serif display (Fraunces, Playfair Display, Crimson Pro, Newsreader) + restrained sans or mono labels. Large measure, real text scale.
- **Color:** warm paper surface (not pure white), near-black ink, one quiet accent. Hairline rules, never boxes.
- **Radius:** 0–2px. **Density:** spacious, long-form rhythm. **Layout:** strong left axis, drop caps / standfirsts / bylines used honestly (not as cosplay — see anti-patterns §5).
- **Forbidden here:** cards, filled buttons, icon grids.

### Warm minimal
- **Type:** one humanist sans, 2–3 weights, generous leading.
- **Color:** warm neutral surface (#faf8f4-ish), soft ink, a single muted accent.
- **Radius:** 8–12px, consistent. **Density:** very spacious. **Layout:** few elements, large air, one focal element.
- **Forbidden here:** more than one accent, dense sections, decoration. (This is minimal done *deliberately* — only valid when chosen against the others.)

### Bold geometric / expressive
- **Type:** heavy display sans (Clash Display, Cabinet Grotesk, Satoshi, Obviously) at 800–900 against 100–200 body.
- **Color:** high-saturation, committed; large color fields; sharp single accent.
- **Radius:** 0 or large (8–16px) — no timid middle. **Density:** punchy, big scale jumps (4×+). **Layout:** oversized type as the composition; type can bleed/clip.
- **Forbidden here:** mid-weights, low contrast, polite scale.

### Technical / engineering
- **Type:** IBM Plex Sans/Mono, Source Sans 3; mono caps labels mandatory.
- **Color:** cool neutrals or near-black; single saturated signal accent (often green/amber); grid-paper texture allowed.
- **Radius:** 0–2px. **Density:** compact, information-dense. **Layout:** tabular, aligned, instrument-panel discipline.
- **Forbidden here:** decorative color, soft radius, generous whitespace.

### Code / terminal
- **Type:** monospace-led (JetBrains Mono, Fira Code) for display and structure; one sans for long body if needed.
- **Color:** true dark or warm paper; ANSI-restrained accent set; no glow.
- **Radius:** 0. **Density:** dense, line-oriented. **Layout:** prompt/log/diff structures used as real composition, not decoration.
- **Forbidden here:** glassmorphism, neon glow, gradient (anti-patterns §1 still applies hard).

### Solarpunk / organic-optimistic
- **Type:** retro-futurist display + clean technical body.
- **Color:** warm optimistic — greens, golds, earth tones; bright but not neon.
- **Radius:** organic/mixed (some pill, some sharp) intentionally. **Density:** open, hopeful. **Layout:** organic shape language meeting technical structure.
- **Forbidden here:** cold corporate neutrals, indigo, sterile grids.

### Distinctive display
- **Type:** one idiosyncratic face as the entire event (Bricolage Grotesque, Obviously, Fraunces at extreme optical size); minimal supporting type.
- **Color:** restrained so the type carries everything — usually two colors total.
- **Radius:** matches the type's character. **Density:** type-driven. **Layout:** the headline IS the layout; everything else recedes.
- **Forbidden here:** a second expressive element competing with the type.

### Archival / index
- **Type:** mono or grotesque caps; numbered; tabular figures.
- **Color:** paper + ink + one stamp-like accent. Hairline rules and tables.
- **Radius:** 0. **Density:** dense, catalog-like. **Layout:** looks like a ledger / index / catalog of the actual content (an `object-of-content` archetype).
- **Forbidden here:** hero blocks, marketing chrome, CTAs styled as buttons.

## Verification

Before claiming any artifact done:

- [ ] A named direction (or, in-brand, a named archetype × axis combo) was chosen *before* markup and stated with a one-line reason.
- [ ] It differs from the recent artifacts/brands in scope.
- [ ] It is not minimal-by-default (or, if minimal, it was chosen against the listed alternatives).
- [ ] Three distinct directions were sketched; the menu was offered even though one shipped.
- [ ] The chosen direction's "one forbidden thing" is honored, and nothing violates `design-anti-patterns.md`.

## Maintenance

When a new coherent aesthetic recurs in real briefs, add it as a roster row with the same six fields (Type / Color / Radius / Density / Layout / One forbidden thing). When a roster direction starts producing its own sameness, tighten its "forbidden" line. Entries are cumulative — do not delete.
