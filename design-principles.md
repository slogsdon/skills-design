# Design Principles — Shared Reference

> The positive craft floor. `design-anti-patterns.md` lists what is forbidden; this file lists what good requires. `design-variation-sop.md` is the procedure for choosing a distinct direction every time. Every design skill reads all three.

This file is the canonical principles list. `design-anti-patterns.md` is the **hard floor and wins any conflict** — nothing here licenses a forbidden pattern. Treat every principle below as a requirement unless a brand's `DESIGN-PLAN.md` explicitly overrides it with a stated reason.

## How to use this file

Before claiming any artifact is done, run the five litmus tests at the bottom. If you can't answer all five with a specific yes, the artifact is not done — it's generic.

The unifying idea: **generic = the absence of decisions.** Slop is what you get when every dimension defaults to the safe middle. Each principle below forces one dimension off the middle.

---

## 1. Typographic hierarchy — one dominant voice, decisive contrast

Hierarchy is the cheapest, highest-impact lever. AI defaults to timid hierarchy (400 vs 600 weight, 1.5× size jumps) and that timidity is itself the tell.

- **Use weight extremes.** 100/200 against 800/900 — not 400 against 600. The contrast between the light and heavy voice should be unmistakable at a glance.
- **Use size jumps of 3×+, not 1.5×.** If the display is 64px the body is ~16–18px, not 28px. Mid-sizes blur the hierarchy; the jump IS the hierarchy.
- **Pick one distinctive family and use it decisively.** Pairing logic: display + monospace, serif + geometric sans, or a single variable font ranged across its full weight axis. Never more than 2 families (mono labels count as a third only in their proper label role — same rule as anti-patterns §2).
- **One dominant typographic voice per artifact.** Decide what the eye lands on first (a massive headline, an oversized number, a single line of body set huge) and subordinate everything else hard. Two competing voices = no voice.
- **Case and tracking are hierarchy too.** Uppercase + wide tracking (0.14–0.2em) for small labels; tight negative tracking (-0.02em) on large display. Don't leave default tracking on display type — it reads unset.
- Never use the banned default families (Inter/Roboto/Arial/Open Sans/Lato/system) as the primary — see anti-patterns §2 and the roster in `design-variation-sop.md`.

## 2. Spatial rhythm — a grid you could prove with a ruler

Padding is not rhythm. Rhythm is a repeating unit a reader can feel without seeing.

- **One spacing scale, one base unit.** Every gap, pad, and margin is a multiple of the base (4 / 6 / 8px per the brand's density). No off-scale magic numbers. If a value isn't a scale token, it's wrong.
- **Whitespace is a deliberate element, not leftover space.** Negative space should be allocated on purpose — a wide margin that frames the content, a deliberate void that creates tension. "Evenly padded everywhere" reads as AI; uneven, intentional space reads as designed.
- **Vertical rhythm tracks the type.** Line-heights and block spacing derive from the type scale, not arbitrary px. Related things sit close; unrelated things get a full rhythm unit of air. Proximity carries grouping — don't outsource it to borders and boxes.
- **Density is a decision.** Compact (information-dense, tight leading) vs spacious (generous air, large leading) is a brand choice stated up front, applied consistently — not drifted per section.

## 3. Color theory — dominant surface, one earned accent

- **One dominant color owns the large surfaces. One sharp accent, used rarely.** Dominant + sharp accent beats timid evenly-distributed every time (Anthropic's own guidance, and anti-patterns §3). If you can't name the single dominant and the single accent, the palette is slop.
- **Limit the palette.** Surface, ink, one or two ink-softs, a rule color, the accent, semantic signals. That's the whole budget. Off-palette color to "make it pop" is the failure.
- **Neutrals do the structural work; the accent does the pointing.** Hierarchy, separation, and depth come from neutral steps and contrast — not from spending color. The accent marks exactly one thing per surface: the single most important action or the one status that matters.
- **Earn the accent.** If the accent appears in 3+ unrelated places it has become decoration (anti-patterns §3). Reserve it; scarcity is what makes it read as signal.
- **Draw the palette from somewhere real** — an IDE theme, a cultural or material reference, the subject matter — not the neutral SaaS center. Never the indigo/violet default (anti-patterns §1).
- **Contrast is non-negotiable.** Body text ≥ 4.5:1, large text ≥ 3:1. A translucent or low-contrast surface that fails this is forbidden, not a style choice.

## 4. Layout logic — content-driven, axis-disciplined

- **Content drives layout, not widgets.** Start from what the content IS (a claim, a number, a list, a fragment of the product) and let that choose the structure. Don't reach for a card/grid/hero component and pour content into it. The component-first reflex is the median-tutorial tell.
- **Grid discipline.** Establish a column structure and hold it. Elements align to shared axes — a reader should be able to draw 2–3 vertical lines that most edges snap to. Random left edges read as unfinished; everything centered reads as AI.
- **Establish a clear alignment axis and commit.** Strong left axis, or a deliberate asymmetric split, or a true optical center — pick one. Mixed, accidental alignment is the most common "almost right but feels off" failure.
- **Architecture novelty must reach the inner blocks** (anti-patterns §4). A novel outer structure with a chrome-led inner block (eyebrow + headline + meta row) has not varied — it has reskinned the default.
- **The skeleton must not match the median.** "Hero → three cards → CTA" is a collapsed architecture no matter how it's styled (anti-patterns §4).

## 5. Visual tension & contrast — boring = low contrast at every level

Homogeneity is low contrast generalized. The fix is contrast at *every* level, not just color.

- **Scale contrast:** one element dramatically larger than everything else. A timid size range is a flat artifact.
- **Weight contrast:** hair-thin against heavy (see §1).
- **Space contrast:** dense passages against deliberate emptiness. Uniform density is the quiet killer.
- **Structural contrast:** one element that breaks the grid on purpose — the punctum. A composition with no rule-breaker has no focal point.
- **Color contrast:** dominant vs sharp accent, not a wash of equal weights (see §3).
- If you can describe the artifact as "clean and balanced and professional" and nothing else, it is slop. Designed work has a point of maximum tension you can name.

---

## Litmus test — answer all five with a specific yes

1. **Typography:** What is the single dominant voice, and what are the exact weight + size extremes? (Numbers, not "bold and big.")
2. **Rhythm:** What is the base spacing unit, and where is whitespace doing deliberate work rather than just padding?
3. **Color:** Name the one dominant and the one accent. Where does the accent appear, and is that exactly once per surface?
4. **Layout:** What did the *content* dictate about the structure? Which 2–3 axes does everything align to?
5. **Tension:** What is the single point of maximum contrast — the thing the eye lands on first and why?

Any "it's clean / balanced / modern" answer is a failed test. Specific or slop.

---

## Maintenance

When real output is technically anti-pattern-clean but still reads as generic, the gap is usually a missing *positive* decision, not a present forbidden one. Add the principle that would have forced the decision here. Like the anti-patterns file: entries are cumulative, not opinions — do not delete.
