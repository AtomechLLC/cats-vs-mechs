# Phase 2: Allocation Surface - Context

**Gathered:** 2026-08-27
**Status:** Ready for planning

<domain>
## Phase Boundary

The board goes on screen and becomes operable. This phase delivers the two-tier render
(`render.structure()` for rare structural rebuilds, `render.sync()` for the keyed per-tick
token reconcile), the `<style>` block built on the course design tokens, steppers and
delta-typing for unit health and faction action points, and roster add/remove — all built to
survive a student hammering it live during a workshop.

Requirements: ALLOC-01, ALLOC-02, ALLOC-03, ALLOC-04, ALLOC-05, ALLOC-06, ALLOC-07, UX-02, UX-05.

Plan split from ROADMAP.md — section ownership is binding because everything lives in one file:
- **02-01** owns `[S06] RENDER` and the `<style>` block
- **02-02** owns `[S07] INTERACTIONS` and additions to `[S05] OPS`

Explicitly NOT in this phase: the eHP/DPS projection readout and the reference material
(Phase 3), the build code and reset scopes (Phase 4), the fight loop and any turn mechanics
(Phase 5). This phase *reserves frame space* for Phase 3 and *ships a renderer capable of*
Phase 5's states, but builds neither.

**Scope expansion accepted during this discussion:** student-editable token appearance. See
`<new_requirements>` — this is not covered by any existing ALLOC/UX requirement ID and needs
one before planning.

</domain>

<decisions>
## Implementation Decisions

### Screen layout

- **D-01:** **Side-by-side columns.** Cats left, Mechs right, both fully visible at once.
  Mirrors the whiteboard the students just looked at, and makes the asymmetry readable at a
  glance — which is the pedagogical point of the whole artifact. Each column gets roughly half
  the available width on a projector.
- **D-02:** **A center strip between the columns is reserved for Phase 3's projection.**
  The per-side eHP/DPS readout sits where the eye already travels between the two factions —
  the projection *is* the comparison. Phase 3's reference material (counter map, effect cards)
  goes in a separate full-width band below the columns, not in the strip.
  Phase 2 builds the strip as an empty reserved region so Phase 3 fills it without a re-layout.
- **D-03:** **The page scrolls as one; the center strip is sticky.** One scroll position to
  preserve through a structural rebuild (ALLOC-07), and the projection never leaves the
  viewport while a student changes allocation. Rejected: independent per-column scroll
  containers (three scroll positions to restore, and nested scrollbars are a known
  projector-legibility annoyance).
- **D-04:** **A sticky top bar holds persistent controls** — artifact title left, control
  cluster right. Undo ships into that cluster in Phase 2 (Phase 1's D-11 deliberately left the
  visible control to this phase; `App.ops.undo()` is already callable from a button). Phase 4
  adds reset and share to the same cluster; Phase 5 adds turn state and start-fight. Deciding
  the slot now is what prevents a re-layout in each of those phases.

### Roster editing

- **D-05:** **Add/remove is setup-only.** The controls are present while building and go away
  once a fight starts. Roster shaping and fight bookkeeping are different activities and the
  UI should not blur them.
- **D-06:** **Per-unit remove plus one add button per side.** Each unit card carries its own
  remove control; a single "+ Add Cat" / "+ Add Mech" appends one unit.
  *Claude recommended a whole-side count stepper and the user chose per-unit; recorded as the
  user's call.* The argument against per-unit was that during setup every unit is identical so
  "which one" rarely carries meaning, and the controls cost projector space. Neither is
  disqualifying. Because UX-02 forbids conveying anything by hover alone, the remove control
  must be **persistently visible**, not hover-revealed.
- **D-07:** **Removal is real removal, not a dead-marker.** Marking a unit dead is fight state
  (Phase 1's stored `alive` flag, operated on in Phase 5) and is a separate concept. A student
  who wants a 7-Cat roster removes two units; a student whose Cat died mid-fight marks it dead.

### Token vocabulary

- **D-08:** **Tokens are data, not hardcoded glyphs.** The renderer takes `(shape, color, glyph)`
  per token type rather than branching on four fixed cases. The board's vocabulary becomes the
  first four entries in that vocabulary — green squares for health, yellow triangles for
  actions, blue squares for shield, red diamonds for damage (ALLOC-04, unchanged in appearance).
- **D-09:** **The vocabulary supports simple shapes, colors and emoji, for every token type
  including health and damage.** Phase 5's dead marker (a rectangle with a skull emoji) is
  expressible as one more vocabulary entry rather than a render special-case. Phase 2 ships the
  capable renderer; Phase 5 ships the mechanic that uses it.
- **D-10:** **Every emoji token must be paired with a shape and color that carry the meaning on
  their own.** Emoji render from whatever the OS supplies — Segoe UI Emoji on Windows, Apple
  Color Emoji on macOS — so a glyph will not look identical across a classroom, and emoji
  metrics vary enough to fight row compaction (D-20). The shape and color are the signal; the
  emoji is decoration on top of them.
- **D-11:** **Students can edit token appearance in the UI.** Phase 2 ships the picker.
  *Claude flagged this as a new capability outside the phase's requirement set and the user
  confirmed it; recorded as the user's call.* See D-12 for the sequencing that makes it safe.
- **D-12:** **Editing lands in Phase 2; persistence lands in Phase 4.** Custom token styling
  must survive a share, which means it rides in the Phase 4 build code — where multi-byte emoji
  are expensive against the 512-char design budget. Building the codec extension in Phase 2
  would invert the roadmap's own build-order rule ("serialization must not precede roster
  editing"). So: Phase 2 builds the picker writing into state; Phase 4 extends the codec to
  carry it. Nothing is built twice.
- **D-13:** **Token appearance belongs in the `build` slice**, not `ui` — it round-trips through
  the share code (D-12) and Phase 1's D-00b assigns anything that round-trips to `build`.
  This also makes a token restyle undoable, which is correct: it is an edit to the student's
  build, not a view preference.

### Claude's Discretion

The user did not select these two areas for discussion. Resolved here so downstream agents act
consistently rather than each inventing an answer. Both are open to revision by the planner if
research surfaces a reason.

**Numeric input behavior (ALLOC-01, ALLOC-02, ALLOC-03):**

- **D-14:** The field displays the current **absolute** value at rest (`3`), not an empty box.
- **D-15:** **A leading sign means delta; no sign means absolute.** `-8` subtracts eight, `+5`
  adds five, `12` sets twelve. This is the only rule a student has to learn and it is
  self-describing once seen once.
- **D-16:** **Enter commits, blur commits, Escape reverts** to the value at focus-in. A field
  left mid-edit when the student clicks elsewhere resolves rather than silently discarding.
- **D-17:** **Arrow keys step by 1; Shift+arrow steps by 5.** Held arrows use the same ramp as
  press-and-hold (D-18).
- **D-18:** **Press-and-hold ramp:** roughly 400 ms before the first repeat, then one step per
  ~120 ms, accelerating to one per ~40 ms after about a second. Every repeat is one
  `App.ops.*` call — ALLOC-07 requires twenty rapid clicks to produce exactly twenty changes, so
  no input may be swallowed by the ramp. Phase 1's D-10 label-coalescing (500 ms window) already
  collapses the whole hold into a single undo entry, so no extra work is needed for that.
- **D-19:** **The focused input element must never be destroyed by `render.sync()`.** This is
  the specific case the two-tier render exists to serve (Phase 1 D-00e). A rebuild that blows
  away the node under the cursor fails ALLOC-07 outright.

**Token row compaction (ALLOC-05):**

- **D-20:** **Threshold is 12 tokens.** Below it, render individual tokens. At or above it,
  compact. The shipped board defaults (Cats 3 HP, Mechs 6 HP plus 3 shield) sit comfortably
  under, so the default board always shows the real token vocabulary — which matters, because
  mirroring the board is the point. Compaction only appears once a student pushes a value high.
- **D-21:** **Compacted form is a count, a multiplication sign, then one glyph** at the same size
  as a normal token. Retains the shape-and-color meaning, and gives an exact number, which is
  strictly better than a projector audience trying to count 24 small squares.
- **D-22:** **The transition between modes must not animate.** ALLOC-07 forbids token animations
  restarting under rapid operation, and a value oscillating across the threshold would strobe.

</decisions>

<new_requirements>
## New Requirements Added By This Discussion

**These are not covered by any existing ALLOC/UX requirement ID.** They need IDs in
`.planning/REQUIREMENTS.md` and a ROADMAP note before planning, or they will be invisible to
verification and the phase will pass while missing them.

| What | Phase | Covered by an existing ID? |
|---|---|---|
| Token vocabulary is data — shape, color and glyph per token type (D-08, D-09) | 2 | Partly — extends ALLOC-04, which currently names four fixed glyph types |
| Student can edit token appearance in the UI (D-11) | 2 | **No — new capability** |
| Custom token appearance round-trips through the build code (D-12) | 4 | **No — new capability**, and it enlarges Phase 4's codec scope |

Recommended before `/gsd:plan-phase 2`: add the two new requirement IDs and widen ALLOC-04's
wording. Phase 2's plan count will likely go from 2 to 3.

</new_requirements>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and requirements
- `.planning/PROJECT.md` — core value, the full Out of Scope list, the Key Decisions table.
  The "Design tension worth preserving" and "Manual override is a primary interaction" notes in
  `## Context` are load-bearing for this phase.
- `.planning/REQUIREMENTS.md` — ALLOC-01 through ALLOC-07, UX-02, UX-05 are this phase's
  requirements. Also see `<new_requirements>` above.
- `.planning/ROADMAP.md` § Phase 2 — the five success criteria this phase is verified against,
  and the binding section-ownership split between plans 02-01 and 02-02.
- `.planning/ROADMAP.md` § build-order note — "steppers must not precede the two-tier render
  decision, and serialization must not precede roster editing." Both inversions are forbidden;
  D-12 exists to respect the second.

### Architecture and implementation guidance
- `.planning/research/ARCHITECTURE.md` — the two-tier render argument with measured benchmarks,
  and the `ops` layer boundary between interactions and state.
- `.planning/research/STACK.md` — the verified `file://` capability matrix, the CSS Baseline
  table (`:has()`, container queries, nesting and `color-mix()` are all safe to use), and the
  re-render performance numbers.
- `.planning/research/PITFALLS.md` — Pitfall 7 (full re-render) and Pitfall 12 (single-file
  entropy) are the Phase 2 concerns.

### Phase 1 output — read before touching the file
- `.planning/phases/01-foundation-data-state-funnel-undo/01-CONTEXT.md` — D-00a through D-00f
  are locked upstream decisions this phase builds on, especially D-00e (two-tier render) and
  D-11 (undo callable from a button).
- `.planning/phases/01-foundation-data-state-funnel-undo/01-01-SUMMARY.md` and
  `01-02-SUMMARY.md` — the actual `App.*` surface that exists, section by section.
- `.planning/phases/01-foundation-data-state-funnel-undo/01-REVIEW-FIX.md` — 14 fixes applied
  after Phase 1. Two matter here: `App.state.restore()` now exists as the file's first non-op
  writer, and `shield` rides in the fight slice with no writer (Phase 5 owns that).
- `cats-vs-mechs.html` — `[S06] RENDER` and `[S07] INTERACTIONS` are declared no-op stubs with
  their banners and ownership already written. The style block's `:root` already carries the
  course design tokens.

### Visual language
- `../game-feel-study-guide.html` — sibling course artifact; source of the design tokens
  (`--bg:#0e1014`, `--ink:#e8ebf2`, `--accent:#5cc8ff`, `--gold:#ffd166`, `--green:#5bd99c`,
  `--violet:#b98cff`, `--radius:14px`, Segoe UI stack, radial-gradient body).
- `../game-feel-types-frameworks.html` — second sibling; confirms the token set is a shared
  convention rather than one file's choice.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `App.render.structure()` / `App.render.sync()` — declared no-op stubs at `[S06]`, banners and
  ownership already written. Fill them; do not restructure the region.
- `App.interactions.bind()` — declared no-op stub at `[S07]`. Same.
- `App.ops.dispatch(act, payload)` — the single entry point a delegated root listener calls.
  Already exists; Phase 2 adds ops rather than inventing a second entry.
- `App.state.commit(label, mutator)` / `commitUi(label, mutator)` — the only two write paths.
  Two greppable names answer "is this undoable?" without auditing a flag.
- `App.state.invalidate(opts)` — schedules one render frame per burst via `requestAnimationFrame`.
  Phase 2's render is what that frame finally calls.
- `App.boot.wrap(label, fn)` — the listener error boundary. Every Phase 2 listener must be
  wrapped in it, not bound raw.
- `App.model.*` — pure derivations (`unitEhp`, `factionEhp`, `bestDamage`, `factionDps`,
  `aliveCount`, `apSpent`). Compute during render; never store the result in state.
- The style block's `:root` token set and its `[C01] BASE` surface treatment.

### Established Patterns
- **One classic `<script>`, one `<style>`.** Verified by the self-test's forbidden-pattern scan.
- **No markup-parsing sink anywhere.** All page text via `createElement` plus `textContent`. The
  scan now covers `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `srcdoc`,
  `DOMParser` and bare `Function(` across the whole document.
- **Cross-section references resolved at call time** as `App.x.y()`, never captured at
  section-body scope — Phase 1's WR-11 fix made `[S03]` lazy specifically to honor this.
- **`[SNN]` grep tokens on every region banner, mirrored by `[CNN]` in the style block.**
- **Machine-enforced purity:** `node tests/selftest-node.cjs` currently exits 0 at 81/81 and runs
  the forbidden-pattern scan. Keep it green; add assertions rather than removing them.

### Integration Points
- `[S08] BOOT start()` calls `App.interactions.bind()` and the first render. Phase 2 fills what
  those calls reach, not the call sites.
- `[S10] LAUNCH` calls `App.boot.start()` exactly once. Do not add a second entry point.
- The static shell already carries stable container ids (`#app`, `#board`, `#board-empty`) —
  delegated listeners bind to those roots once, which is what survives structural rebuilds.

### Trap carried forward from Phase 1
Two acceptance greps constrain **comment prose**, not just code, and must stay at zero hits over
`cats-vs-mechs.html`. The forbidden words include "rating", which is a substring of ordinary
words like *generating*, *operating* and *iterating*. This fires easily on new comment text and
is invisible until it does. Re-run both greps after writing any comment. Phase 2 writes a lot of
new comments, so this is a live risk here. The exact grep invocations are recorded in
`01-REVIEW-FIX.md` and in the Phase 1 plan acceptance criteria.

</code_context>

<specifics>
## Specific Ideas

- The dead marker the user described concretely: **a rectangle with a skull emoji inside**.
  Phase 2 must be able to express that as vocabulary data; Phase 5 uses it.
- The center strip should be built as a visibly-reserved empty region in Phase 2, not as a
  zero-width placeholder — an instructor demoing Phase 2 should see where the projection will
  land rather than watching the layout shift when Phase 3 arrives.
- Because the remove control is persistently visible (UX-02 forbids hover-only), it needs a
  visual weight that reads as available-but-not-inviting at projector distance. A quiet outline
  rather than a filled destructive button.

</specifics>

<deferred>
## Deferred Ideas

- **Independent per-column scroll** — rejected in D-03 in favor of one page scroll. Worth
  revisiting only if rosters routinely grow past what one screen holds.
- **Collapsible faction columns** — considered during layout discussion and set aside; a
  collapsed state is one more thing to get wrong during a live demo.
- **Whole-side count stepper for roster size** — Claude's recommendation, not chosen (D-06).
  If per-unit controls prove too crowded on a projector, this is the fallback.
- **Curated vs free-entry emoji picker** — the user chose student-editable tokens (D-11) but the
  picker's own vocabulary (which shapes, which colors, whether emoji entry is free-text or a
  curated set) was not discussed. The planner should treat it as open; a curated set is cheaper
  to encode in Phase 4's build code than arbitrary emoji.

</deferred>

---

*Phase: 2-Allocation Surface*
*Context gathered: 2026-08-27*
