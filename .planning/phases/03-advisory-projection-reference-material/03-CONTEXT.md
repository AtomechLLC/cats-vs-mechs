# Phase 3: Advisory Projection & Reference Material - Context

**Gathered:** 2026-08-28
**Status:** Ready for planning

<domain>
## Phase Boundary

The two things that must be on screen *while a fight is happening*: an advisory projection of what
the allocation implies, and the reference material a student needs without leaving the build.

This is the phase carrying the project's central pedagogical risk. PROJ-06 forbids a verdict
anywhere on screen, and research named it the most likely accidental scope violation in the
project — every tool in the reference class (Kobold Fight Club, PF2e Encounter Builder) centres a
colour-coded Trivial→Extreme readout, and that readout is exactly what this artifact must not have.

Requirements: PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-06, REF-01, REF-02.

Plan split from ROADMAP.md — 2 plans. Section ownership is binding, since everything is one file.

Explicitly NOT in this phase: the build code (Phase 4), the fight loop and any turn mechanics
(Phase 5), and PROJ-05 / REF-03, which sit in Phase 5 because each only becomes observable once
the fight view exists.

</domain>

<decisions>
## Implementation Decisions

The user did not select gray areas for this phase, so all four below were resolved at Claude's
discretion and are recorded here so downstream agents build against them rather than each inventing
an answer. Every one is a judgement the planner may revisit if research contradicts it — with the
exception of the PROJ-06 rules in D-13..D-17, which are the phase's whole point and should be
treated as locked.

### Locked upstream — do not re-litigate

- **D-00a:** The sticky centre strip (`#strip`, Phase 2 D-02) is the projection's home. It already
  ships reading "Projection lands here in Phase 3".
- **D-00b:** Derived values are computed during render and never stored in state. The projection
  therefore updates live for free — there is no cache to invalidate and no second source of truth.
  Storing an eHP or a turn count would create a *mechanical* reason for the projection to disagree
  with the board, muddying the *pedagogical* disagreement this project is built around.
- **D-00c:** `factionEhp`, `bestDamage`, `factionDps`, `unitEhp`, `aliveCount` and `apSpent` are
  shipped pure derivations in `[S02] MODEL`. Phase 3 consumes them; it should not add a parallel
  set.
- **D-00d:** UX-02 forbids conveying anything by hover alone, which PROJ-03 restates for the
  arithmetic specifically.

### The numbers on the shipped board

Measured against the artifact, not estimated:

| | units | AP | eHP | best damage | damage/turn | turns to wipe the other side |
|---|---|---|---|---|---|---|
| Cats | 9 | 3 | 27 | 1 (Slash) | 3 | **9** |
| Mechs | 3 | 3 | 27 | 3 (Lasers) | 9 | **3** |

- **D-01:** **This asymmetry is the phase's best teaching artifact and the plan should treat it as
  such.** Both sides have *identical* effective HP and wildly unequal outcomes, because AP is the
  real constraint: nine Cats hold only three action points, so six cats do nothing each turn. A
  student who reads "27 eHP" on both sides and then "9 turns" against "3 turns" has been handed the
  entire lesson without the tool ever offering an opinion. Do not tune this away; Phase 5's playtest
  gate (FIGHT-11) owns any retune.

### What makes it a range (PROJ-02)

- **D-02:** **The range comes from overkill waste, and from nothing else.** `factionDps` returns one
  number; the spread has to be an honest model of something real, not a decorative ± band. Overkill
  is the honest source: damage spent past a unit's last point of health is wasted, and how much is
  wasted depends on choices the tool deliberately does not make for the student.
- **D-03:** **Fast bound = perfect focus fire, zero waste.** `ceil(targetEhp / dps)` — the
  arithmetic floor.
- **D-04:** **Slow bound = maximal overkill.** Each unit absorbs `ceil(unitEhp / damagePerHit) *
  damagePerHit` before dying, so the waste per unit is that product minus its actual eHP. The slow
  bound divides the target's total absorbed damage rather than its eHP.
- **D-05:** **When the two bounds are equal, show ONE number, not a fake range.** On the shipped
  board both are exact — Lasers do 3 against 3-HP Cats and Slash does 1 against anything — so the
  default board reads "≈9 turns" and "≈3 turns", with no spread at all. **This is a feature.** The
  range appears precisely when overkill exists, which means its appearance teaches that overkill
  exists. A permanently-displayed range would teach nothing and would be dishonest on a board where
  the arithmetic is exact.
- **D-06:** **Integers only, everywhere. No decimals** (PROJ-02 is explicit, and Phase 1's D-00b
  already makes state integers-only). Round the fast bound up: a fraction of a turn is a whole turn
  in a game played in turns.
- **D-07:** **The leading "≈" stays even on an exact single number.** The arithmetic is exact; the
  *claim about the fight* is not, because the model ignores five named things (PROJ-04). Dropping
  the tilde when the division happens to be clean would assert a precision the tool does not have.

### How the arithmetic shows (PROJ-03)

- **D-08:** **A worked line per side, in the strip, with both operands and the operator visible.**
  The shape is `27 eHP ÷ 3 per turn → ≈9 turns`. Not a tooltip, not a hover, not a details
  disclosure — PROJ-03 and UX-02 both forbid it, and an instructor pointing at a projector cannot
  hover.
- **D-09:** **Each side's panel states its own durability and its own offense.** "What I can take"
  (eHP) and "what I can do" (turns to wipe the *other* side). Naming the direction explicitly in
  the label matters — "turns to wipe Mechs" is unambiguous where a bare "3 turns" is not.
- **D-10:** **The strip is narrow, so the arithmetic wraps rather than scrolls.** It sits between
  two faction columns on a projector. If a line cannot fit, shorten the label, never the numbers,
  and never introduce a horizontal scroll inside the strip.
- **D-11:** **`tabular-nums` on every figure**, matching the file's existing `.num` convention, so a
  number changing under a stepper does not shift the layout beside it.

### Where the reference material lives (REF-01, REF-02)

- **D-12:** **Action cards render inside each faction's column, below its roster; effect cards are
  part of the action card. The counter map goes in a full-width band below both columns.**
  This is a deliberate amendment to Phase 2's D-02, which put both in the band. REF-02 requires
  effect cards to be attached *to the actions that carry them*, and actions belong to a faction —
  they cannot be simultaneously in a shared band and attached to a per-faction action. The counter
  map is genuinely cross-faction (Slash < Fly, Hairball < Lasers, Fly < Recharge), so the band is
  right for it.
  The data already supports this: actions ship as `{ id, name, dmg, keywords }` with keywords like
  `['slowdown']` on the action record.

### No verdict — stated positively (PROJ-06)

The requirement is written as a prohibition, which is not enough to build against. These are the
affirmative rules. **Treat D-13..D-17 as locked; they are the reason this phase exists.**

- **D-13:** **Each side's projection lives in its own panel with its own numbers.** No shared axis,
  no paired bars, no midpoint marker, no common scale. The two figures sit side by side and the
  *student* compares them; the tool never performs the comparison.
- **D-14:** **No comparative language anywhere in the rendered page.** Not "stronger", "ahead",
  "outmatched", "favoured", "winner", "advantage". The projection reports two independent readings
  and stops.
- **D-15:** **Colour encodes faction and token identity only — never quality.** No red-amber-green
  anywhere near a projection figure. This is already the file's convention and must not drift here.
- **D-16:** **The "what this ignores" list (PROJ-04) is permanent and adjacent to the numbers.**
  Not collapsed, not a disclosure, not hover-revealed. It names counters, effects, focus fire,
  overkill, and the student's own rulings. It is the sentence that turns a number from a verdict
  into an argument, so it must be as visible as the number it qualifies.
- **D-17:** **Extend the machine-enforced grep.** `verdict|balanced|rating|difficulty` has been a
  zero-hit acceptance criterion since Phase 1. Phase 3 should widen it to cover comparative
  vocabulary — `stronger`, `weaker`, `advantage`, `outmatch`, `favou?red`, `winner`, `loser` —
  so PROJ-06 is mechanically enforced rather than promised. **Check any new word against the
  existing traps before adding it**; see `<code_context>`.

### Claude's Discretion

All of D-01 through D-17 were resolved at Claude's discretion after the user declined the discussion
round. D-13..D-17 should nonetheless be treated as locked, because they encode PROJ-06, which is the
project's stated central risk rather than an implementation preference.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and requirements
- `.planning/PROJECT.md` — core value, and the Out of Scope list. Two entries bear directly on this
  phase: **"Difficulty verdict badge"** (named as the most likely accidental scope violation in the
  project) and **"Batch simulation / win-rate statistics"** (would make the projection
  authoritative). The "Design tension worth preserving" note in `## Context` is this phase's brief.
- `.planning/REQUIREMENTS.md` — PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-06, REF-01, REF-02.
- `.planning/ROADMAP.md` § Phase 3 — the five success criteria. Criterion 4 is the long one and it
  is written as a prohibition on purpose.

### Architecture
- `.planning/research/ARCHITECTURE.md` — the two-tier render argument; the projection is a sync-tier
  consumer, not a structural one.
- `.planning/research/PITFALLS.md` — Pitfall 12 (single-file entropy) is live; the file is past
  6,800 lines.

### Prior phase output
- `.planning/phases/02-allocation-surface/02-CONTEXT.md` — D-02 reserved the strip for this phase.
  Note D-12 above amends its placement of the reference material.
- `.planning/phases/02.1-token-authoring-inserted/02.1-CONTEXT.md` — the token vocabulary is now
  student-authored, so any label this phase draws from a token type must read through `labelFor`
  rather than a literal. The Damage bug (`e7f14ef`) was exactly that mistake.
- `.planning/phases/02.1-token-authoring-inserted/02.1-REVIEW-FIX.md` — the interaction-gate and
  stub-DOM machinery this phase's tests will extend.

### Visual language
- `../game-feel-study-guide.html` — the sibling artifact's tokens, already in `[C00]`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `App.model.factionEhp` / `bestDamage` / `factionDps` / `unitEhp` / `aliveCount` / `apSpent` —
  shipped pure derivations. `factionDps(faction, activeUnits)` is
  `Math.min(faction.ap, active) * bestDamage(faction)`, which is why AP is the binding constraint
  on the shipped board.
- `#strip` — the reserved sticky panel, currently holding placeholder text.
- `App.data.DEFAULTS.{cats,mechs}.actions` — `{ id, name, dmg, keywords }` per action, with keywords
  already attached. REF-02 needs no new data.
- `App.render.labelFor(state, tokenId)` — the only correct way to name a token type on screen.
- `statLine` / `readout` / `tokenRow` / `setData` in `[S06]` — the builders the strip should reuse.
- The `SYNC_HOOKS` seam in `[S06.1]` — how a sub-region gets reconciled by the same frame as the
  board. The strip is exactly that kind of consumer.
- `.num { font-variant-numeric: tabular-nums }` — the existing convention for a figure that changes.

### Established Patterns
- One classic `<script>`, one `<style>`; all page text via `createElement` + `textContent`; no
  markup-parsing sink anywhere; no `https?://` (hence no inline SVG — shapes are CSS).
- Namespaced IIFE per section returning `Object.freeze({...})`; cross-section references resolved at
  call time as `App.x.y()`.
- `node tests/selftest-node.cjs` is the gate: **363 assertions**, interaction gate **46 of 46**,
  stub-drift **35 ids**.

### The coverage gap that bit three agents in Phase 2.1 — read before writing a test
`node tests/selftest-node.cjs` runs **363** rows, but the artifact's full suite is **430**. The
other 67 are document-gated and execute only with a DOM. **A green Node run is not full coverage**,
and this gap hid a stale assertion and two blockers during Phase 2.1. To run the full suite: lift
`makeStubDom()` out of `tests/selftest-node.cjs` at run time, run the artifact in a `vm` with that
DOM, call `App.selftest.run()`, and supply `Event`, `MouseEvent` and `KeyboardEvent` — the harness
does not, because it never calls `run()` in its DOM context. `App.render` and the section surfaces
are `Object.freeze`d, so runtime monkey-patching silently no-ops; prove things by editing a scratch
copy.

### The naming trap, which this phase makes worse
Two greps must stay at **zero** over `cats-vs-mechs.html`:

    grep -ci "counter\|rating\|balanced\|difficulty"
    grep -c "verdict\|balanced\|rating\|difficulty"

**`counter` is banned — and REF-01 is the counter map.** The feature cannot be named after itself in
code or comments. Use *the counters map*… no: use **"the beats map"**, "what beats what", or
"matchup map". Likewise `rating` hides inside `generating` (write "generated", never "generating"),
`operating`, `iterating`, `separating`, `enumerating`, `decorating` — and inside `encounter`, which
is otherwise the natural word for a fight. Safe: *tally*, *count*, *counting*, *matchup*, *beats*.

D-17 widens this grep further. **Every word added must itself be checked against the existing
greps** — an added term that contains `rating` or `counter` would make the gate unsatisfiable.

</code_context>

<specifics>
## Specific Ideas

- The shipped board's "27 eHP each, 3 turns versus 9 turns" is the demo an instructor should open
  on. If the plan can make that legible at a glance without commentary, the phase has done its job.
- The "what this ignores" list should read as five plain nouns, not a paragraph. It is scanned, not
  read, and it sits next to a number that is competing for the same attention.
- The counter map is three relationships, not a matrix. Three lines of "X loses to Y" is more
  legible on a projector than a 3×3 grid, and it is what the whiteboard actually showed.

</specifics>

<deferred>
## Deferred Ideas

- **A range that models focus-fire choice** rather than only overkill — richer, but it would require
  the tool to assume a targeting strategy, which is the student's ruling to make.
- **Per-action projection** ("what if I lead with Hairball?") — genuinely useful and genuinely a new
  capability; its own phase if it ever happens.
- **Showing the counter map as a matrix** — set aside in favour of three lines for projector
  legibility. Revisit only if the relationships grow past three.

</deferred>

---

*Phase: 3-Advisory Projection & Reference Material*
*Context gathered: 2026-08-28*
