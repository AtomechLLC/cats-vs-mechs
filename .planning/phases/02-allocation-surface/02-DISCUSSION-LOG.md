# Phase 2: Allocation Surface - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-27
**Phase:** 2-Allocation Surface
**Areas discussed:** Screen layout, Roster editing model

---

## Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Screen layout | How the two factions sit on screen; the frame Phase 3 and 4 slot into | ✓ |
| Roster editing model | Count stepper vs per-unit controls for add/remove | ✓ |
| Numeric input behavior | Delta-typing, at-rest display, commit trigger, hold ramp | |
| Token row compaction | Threshold and compacted form for ALLOC-05 | |

**User's choice:** Screen layout and Roster editing model.
**Notes:** The two unselected areas were resolved at Claude's discretion (D-14 through D-22).

---

## Screen layout

### Faction arrangement

| Option | Description | Selected |
|--------|-------------|----------|
| Side-by-side columns | Cats left, Mechs right, both visible at once. Mirrors the whiteboard; makes asymmetry readable at a glance. Costs horizontal room. | ✓ |
| Stacked rows | Cats above, Mechs below, full width each. More room per unit, but comparison requires scrolling. | |
| Side-by-side, collapsible | Columns by default, either side collapsible to a summary strip. More build; a collapsed state is one more live-demo failure mode. | |

**User's choice:** Side-by-side columns (Claude's recommendation).

### Frame reservation for Phase 3

| Option | Description | Selected |
|--------|-------------|----------|
| Center strip between columns | Narrow column holding the per-side eHP/DPS readout, where the eye already travels between sides. Reference material goes in a band below. | ✓ |
| Full-width band below | Projection and reference share a band under the rosters. Simplest, but the projection is below the fold exactly when allocation changes. | |
| Fixed right rail | Persistent sidebar. Always visible, but steals width from the rosters permanently. | |
| You decide | Claude's discretion. | |

**User's choice:** Center strip between the columns (Claude's recommendation).

### Scroll model

| Option | Description | Selected |
|--------|-------------|----------|
| Page scrolls as one, projection sticky | One scrollbar; the center strip sticks. One scroll position to preserve through a rebuild. | ✓ |
| Independent per-column scroll | Each column its own scroll container. Three scroll positions to restore; nested scrollbars hurt projector legibility. | |
| No scrolling — fit to viewport | Board always fits one screen; compaction carries more weight. Hard ceiling on roster size. | |

**User's choice:** Page scrolls as one, projection sticky (Claude's recommendation).

### Persistent chrome

| Option | Description | Selected |
|--------|-------------|----------|
| Sticky top bar | Title left, control cluster right. Undo now; Phase 4 and 5 add to the same cluster with no re-layout. | ✓ |
| In the sticky center strip | Controls join the pinned projection column. Saves vertical space but mixes advisory readout with action controls. | |
| Controls near what they affect | Most discoverable in principle, but the control set grows across three phases and likely forces a re-layout. | |

**User's choice:** Sticky top bar (Claude's recommendation).

---

## Roster editing model

### First pass — add/remove affordance

| Option | Description | Selected |
|--------|-------------|----------|
| Per-unit remove + one add button | Each card carries its own remove; one add button appends. | |
| Count stepper for the whole side | "9 Cats" with +/−, matching the token-row vocabulary. | |
| Both | Stepper for bulk, per-unit for surgical edits. | |

**User's response (free text):** *"Add a rectangle with a skull emoji inside as a marker. In
fact support simple shapes, colors and emoji for all tokens, including health and damage."*

**Notes:** The user redirected rather than picking an option. Claude separated the response into
two distinct concerns — a token-vocabulary change (in scope for ALLOC-04/05) and a possible
removal mechanism — and asked two clarifying questions in plain text: whether the skull marker
replaces removal, and whether token appearance is author-defined or student-editable. Claude also
flagged that emoji render from OS-supplied fonts and so will not look identical across a
classroom, and that emoji metrics fight row compaction.

**User's clarification:** *"Skull is mid battle. Adding/removing should be setup only for now."*

This dissolved Claude's original argument for per-unit removal, which had rested on Phase 5
killing units individually. With the skull marker handling fight state, that premise was gone,
and the question was re-asked with the reframing stated explicitly.

### Second pass — add/remove affordance, reframed

| Option | Description | Selected |
|--------|-------------|----------|
| Count stepper per side | Now Claude's recommendation, since "remove the last one" is all setup shaping needs. Simplest; reuses the ALLOC-01/02 stepper. | |
| Per-unit remove + one add button | Lets a student drop a specific unit — but during setup every unit is identical. More controls competing for projector space. | ✓ |
| Both | Two ways to do one thing; the second has almost no setup use case. | |

**User's choice:** Per-unit remove plus one add button — against Claude's reframed
recommendation. Claude withdrew the objection: during setup it is the user's call and the only
cost is screen space.

### Token authorship

| Option | Description | Selected |
|--------|-------------|----------|
| Author-defined in frozen DEFAULTS | Claude picks shape/color/glyph per token type. Costs nothing, ships this phase, no build-code impact. | |
| Student-editable in the UI | Students change token appearance. New capability; must round-trip through the Phase 4 build code, where multi-byte emoji are expensive against a 512-char budget. | ✓ |

**User's choice:** Student-editable in the UI.
**Notes:** Claude flagged this as a new capability outside ALLOC-01–07 and UX-02/05, and raised
it a second time because it changes the roadmap rather than just Phase 2. The user confirmed by
choosing a sequencing option rather than withdrawing.

### Sequencing for student-editable tokens

| Option | Description | Selected |
|--------|-------------|----------|
| Editing UI in Phase 2, persistence in Phase 4 | Phase 2 ships renderer plus picker; Phase 4 extends the codec. Adds requirements to both phases, likely a third plan to Phase 2, but nothing is built twice. | ✓ |
| Its own phase after Phase 4 | Phase 2 ships author-defined tokens; a later phase adds editing and persistence together once the codec is stable. | |
| All of it in Phase 2 | Would build serialization before Phase 4 designs the codec — which the roadmap's build-order note forbids. | |

**User's choice:** Editing UI in Phase 2, persistence in Phase 4 (Claude's recommendation).

---

## Claude's Discretion

The user did not select these areas for discussion; they were resolved in CONTEXT.md so
downstream agents act consistently:

- **Numeric input behavior** (D-14 through D-19) — at-rest absolute display, leading-sign-means-delta
  parsing, Enter/blur commit with Escape revert, arrow-key stepping, the press-and-hold ramp
  curve, and the rule that a focused input is never destroyed by a sync render.
- **Token row compaction** (D-20 through D-22) — a threshold of 12 tokens, a count-plus-glyph
  compacted form, and no animation on the mode transition.

---

## Deferred Ideas

- **Independent per-column scroll** — rejected in favor of one page scroll; revisit only if
  rosters routinely exceed one screen.
- **Collapsible faction columns** — set aside as a live-demo failure mode.
- **Whole-side count stepper for roster size** — Claude's recommendation, not chosen. The
  fallback if per-unit controls prove too crowded on a projector.
- **Curated vs free-entry emoji picker** — the picker's own vocabulary was never discussed. Left
  open for the planner; a curated set is cheaper to encode in Phase 4's build code.
