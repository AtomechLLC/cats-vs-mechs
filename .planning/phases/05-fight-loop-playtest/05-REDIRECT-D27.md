# D-27 — The declaration surface, redesigned by the developer at the 05-11 checkpoint

**Date:** 2026-08-29. **Authority:** the developer, directly, in their own words. This supersedes
the declaration form plans 05-07/05-10 built, and it OVERRULES two recorded rules — knowingly, see
below.

## The spec, verbatim

> I don't like the pop up presentation for actions.
> I would prefer having a full tab on the main screen.
> I want a much simpler UI for 'fights'
> Show something like
>
> [ROUND]
>
> [CATS]
>
> [C1] [ACTION] [ACTION] [ACTION] <-- buttons to pick one
> [C2] [ACTION] [ACTION] [ACTION] <-- buttons to pick one
>
> etc
>
> same thing on the other side.
>
> As actions are selected, deplete the resources. Re clicking an action should undo that preview.
> picking another action should undo any changes and apply the new one. Disable any actions whose
> requirements are not met
>
> Show both sides at the same time in columns.

## What this settles

1. **The fight is a full TAB on the main screen**, not a band stacked above the board. This also
   dissolves the viewport-budget problem structurally — the fight no longer competes with the build
   board for one viewport.
2. **Declaration is per-unit, radio semantics.** One action per unit. Click to declare; re-click the
   same action to undo; click a different action to replace. Both sides visible simultaneously, in
   columns.
3. **Resources deplete as a live preview while declaring.** This IS the resolution of the
   apSpent-reads-zero finding (05-07's blocker): of the two admissible fixes written into the file,
   the developer has effectively chosen "a reading for what this round's declarations have spoken
   for" — and promoted it from a bar figure to the core interaction. FIGHT-09's "spent visibly
   distinct from available" is served by the same mechanism.
4. **Actions whose requirements are not met are DISABLED.**

## The two rules this overrules — deliberately, on the developer's word

- **D-23** ("a declared cost that exceeds the pool is reported, never prevented") — an orchestrator
  assumption, now overruled by the person it was standing in for. The fight declaration surface
  disables what cannot be declared.
- **The never-disable rule on the fight region** — gate check 95 asserts 147 controls across three
  boards are never disabled; wave 10 asserts `grep -c "\.disabled"` over `[S07.5]` prints 0. Both
  must be TURNED IN THE OPEN (the 03.1-04 precedent): recorded red, rewritten to assert the NEW
  contract (disabled if and only if requirements are unmet or the previewed pool cannot pay),
  recorded green. The never-disable rule REMAINS in force on the build/proposal surfaces — ACT-06's
  comment and checks there are untouched. The overrule is scoped to fight declaration.

## Orchestrator interpretation calls (flagged to the developer, proceeding under them)

- **Targets:** the sketch has no target step, but actions carry target-directed terms. Call: clicking
  an action that needs a target lights up the opposing column's unit buttons to pick one; the
  declaration completes on that second click. Untargeted actions declare in one click. Re-click of
  the declared action cancels, target and all.
- **"Pop up presentation for actions"** is read as the fight declaration flow. The action EDITOR
  dialog (#act-edit, authoring) is left as-is; if the developer meant that too, it is a separate
  change to ask for.
- **Tabs and PROJ-05/REF-03:** the tab switches the board-vs-fight region only. `#strip` (projection)
  and `#refband` (reference) stay outside the tabbed region so both remain readable without
  navigating away, which those requirements demand.
- **Dead units:** a unit the student has ruled dead has its action buttons disabled. This is driven
  by the student's own ruling, so it is bookkeeping, not adjudication.
- **What Advance does is UNCHANGED.** The preview depletes a *reading*; nothing resolves until
  Advance. The bookkeeping/adjudication line from wave 4's DOES/does-NOT table is untouched.

## What stays true

- The students are the rules engine. Advance still only spends AP, applies declared xf terms, and
  splits damage shield-then-health. No verdicts anywhere on the new tab.
- The no-verdict gate applies to every rendered word of the new surface.
- The 05-11 playtest still gates the phase — on the NEW surface once it ships.

---

## ADDENDUM — three developer refinements, 2026-08-29, before execution began

Received while the gap plans were being written; they amend the spec above and answer two of the
planner's open calls. Verbatim:

> Place 'team' resources above the action picker.
> Default target to the lowest health enemy. Add a button to change target (rather than require a
> picker every time)

> 2. I like the suggestion for picking target

> I want a visual presentation of the battle field on the current turn (shapes for cats with smaller
> shapes for status points / health on them- on one side, same on the right for the other side)

### What this settles

1. **Team resources sit ABOVE the action picker**, per side.
2. **Targeting: default, don't ask.** Declaring a target-directed action auto-targets the
   **lowest-health living enemy** (fight hp; units ruled dead excluded; tie broken by roster order —
   orchestrator call, recorded here). Each such declaration shows its target and carries a
   **change-target button**; pressing it invokes the approved lights-up flow (the opposing side's
   units light, click one to retarget, re-click cancels). The two-click-every-time flow is
   superseded.
   *Noted in passing:* a lowest-health default is a mild focus-fire suggestion by the tool — the
   developer chose it explicitly, and it is a changeable default, not a resolution.
3. **The fight tab carries a battlefield visual of the current round.** Cats on the left, Mechs on
   the right, matching the columns: one shape per unit (labelled), with smaller shapes on it for
   health / shield / status tallies drawn from each token type's own shape, colour and glyph — so
   student-authored types appear in the battle exactly as they authored them. Units ruled dead stay
   visible with the dead marker (FIGHT-04). CSS shapes and glyphs only — inline SVG is asserted
   absent by the gate and stays absent.
   **This supersedes the planner's call #1** ("unit state is not on the fight tab"): it now is, as
   the battlefield. Hand rulings remain on the board tab; the battlefield is read-only except as the
   click surface for the change-target flow, whose targets light there.

### Column layout per side, top to bottom

[SIDE] → battlefield cluster → team resources → action picker rows. [ROUND] spans above both.

---

## D-28 — Second live-feedback round, 2026-08-29, from the developer operating the real artifact

Verbatim, with a screenshot of the fight tab attached:

> this is way too compressed - let the fight take the whole width.
> earlier rounds should be a full lane above showing the past state and acctions selected.
> The predictor turn off, and make it toggled sidebar / pop over

### What this settles

1. **The fight view takes the whole width.** Nothing shares its row.
2. **The ledger becomes a full-width lane ABOVE the current round** — not a right-hand column.
   Each past round shows its board state AND the actions that were selected that round (the `did`
   record the ledger already stores). This matches the original round-loop description more
   literally than the column did: "the previous state of the board moves up into a history."
3. **The predictor (`#strip`, the projection) is OFF by default in the fight view**, behind a
   toggle that opens it as a sidebar / popover. PROJ-05's "readable without navigating away" is
   read as satisfied by a one-click toggle — the developer's call, flagged once, taken. The gate
   rows asserting the strip's fight-view placement (103b and kin) are turned in the open under this
   decision, not silently.

### Orchestrator notes

- The lane is horizontal: past rounds as cards in one row, newest nearest the current round,
  horizontally scrollable when they overflow. Chosen because a full-width vertical stack would
  push the current round off screen — the exact defect class this phase has fixed three times.
- The REF-03 deferred item (reference cards hidden in fight view) is NOT folded in here — but the
  new toggled sidebar is an obvious candidate home for them, and that option is noted on the
  deferred item for the playtest decision.
- Build view is untouched. The strip behaves as before outside a fight.

---

## D-29 — Third live-feedback round, 2026-08-29: symbols first, prose on hover

Verbatim, with a screenshot of the D-28 ledger lane attached (its prose lists of
"Cat 1 — Health 3, Shield 0" and "Shield took 1 of the 1"):

> show this using the symbols, rather than text

> instead of showing cost in 1 Action Points, show it as - then the symbol for the action points.
> Same with the cost of other skills.

> mouse over tooltip for the text description

### What this settles

1. **The ledger lane renders token SYMBOLS, not prose.** Past board states and the what-changed
   panel use the same mini-token machinery the battlefield uses (styleFor/labelFor/makeToken —
   called, never re-derived), so a student-authored type appears as authored there too. The action
   lines keep their sentence shape only where a symbol cannot carry it; states and deltas are
   symbolic.
2. **Costs are `−` plus the token's symbol** — everywhere the fight surface prices something:
   the picker's action buttons, requirements, and transformation readings. Counts follow the
   file's existing COMPACT_AT convention rather than inventing a second one.
3. **The prose moves to mouse-over tooltips** — the text that renders today becomes the hover
   description of the symbolic reading, not deleted.

### Orchestrator note on the gate

Words moving from textContent into `title` attributes LEAVE the Layer C harvest as it stands —
the scanner would stop seeing them and report clean forever (the wave-1 lesson, attribute
edition). The harvest must be extended to read tooltip text wherever the fight surface uses it,
and the floor re-derived.

---

## D-30 — Fourth live-feedback round, 2026-08-29: the removal minus becomes a badge

Verbatim:

> make the - for removing a resource red and make it appear in the top-left corner (25% from the
> top, center aligned to the left edge) of the symbol/shape - rather than a normal dash

### What this settles

The `−` that marks a resource being removed (D-29's cost/removal notation) is no longer an inline
dash beside the symbol. It is a RED mark anchored on the symbol itself: top-left corner, 25% down
from the top, center-aligned to the left edge of the shape. Applies wherever the removal notation
appears — picker costs, requirement shortfalls, transformation readings, lane deltas.

Also this round, tooling: browser checks now run headless so testing stops popping windows over
the developer's work (committed separately).

---

## D-31 — Fifth live-feedback round, 2026-08-29: state and input part ways

Verbatim:

> separate the current round state from the action input area

### What this settles

The fight tab's current-round region splits into two visually and structurally distinct areas:

1. **Round state** — the round number, both survivor counts, the battlefield clusters, and the
   team resources. What IS.
2. **Action input** — the per-unit action picker rows, the declaration readouts with their
   change-target buttons, and the Advance / reset controls. What the student is ABOUT TO DO.

The spoken-for resource preview stays with the resources in the state area (it is a reading of
state), but continues to react live as declarations are made in the input area.

### Orchestrator interpretation

- Separation means a clear visual boundary (distinct panels/cards with their own headings), not
  merely spacing. The column pairing survives inside each area — Cats left, Mechs right, in both.
- Order top to bottom: earlier-rounds lane (D-28), then round state, then action input. Advance
  lives with the input, since it commits what the input declared.
- No behavioural change — this is layout and grouping only. Every gate row that reads positions
  or containment gets turned openly if it moves.

---

## D-32 — Sixth live-feedback round, 2026-08-30: dense authoring, multi-term everything

Verbatim, two messages:

> make the action configuration more dense and allow multiple effects

> allow multiple input for all cost/needs/changes

### What this settles

1. **The action editor's terms region gets DENSER** — more rule per screen, less chrome per row.
2. **All three term lists become true multi-term lists**: an action may carry multiple cost terms,
   multiple requirements, and multiple transformations.

### Orchestrator calls (recorded, overridable)

- **Caps go to 4 per list** (cost 1→4, req 2→4, xf 2→4). "Multiple" needs a number; 4 keeps the
  codec's adversarial ceiling inside the Discord budget and a row of 4 fits the dense layout. Bump
  on request — it is three constants plus their pinned rows.
- **A multi-token cost spends what it names.** Cost was AP-only in practice; with multiple cost
  terms a cost may name any tally (D-24: student tallies on the same terms). The spoken-for
  preview depletes every named pool, the disable contract's condition (b) checks every named pool,
  and Advance spends every named term. The projection's apCost reading keeps its meaning by
  reading the ap term(s) from the list.
- **Codec: version stays v1 if the grammar is count-driven** (verify, don't assume). Wire bounds
  in [S04] are the same list one level down and must move in the same change — the drift rows
  exist precisely for this. A new code carrying 3+ terms pasted into a STALE copy of the file
  refuses by content rather than loading garbage; that is the codec doing its job, noted not fixed.
- The fight picker's −badge cost reading (D-29/D-30) renders every cost term, compacted per
  COMPACT_AT.

---

## D-33 — Seventh round, 2026-08-30: the polish pass

Verbatim:

> Better. Dramatically improve the usability, presentation and polish

### What this settles

A whole-surface design-quality pass — usability, presentation, polish — with emphasis on the
surfaces the developer has been iterating on (the fight tab and the action editor), but covering
the artifact as one coherent thing: a student and an instructor should experience one designed
tool, not eleven plans' worth of accreted regions.

### How it runs (orchestrator)

1. **Audit first, with eyes.** An agent drives the real artifact headless, screenshots every
   surface and state at both viewports, and writes a PRIORITIZED, CONCRETE spec — specific
   changes with reasons, not adjectives. Usability (affordance, feedback, flow), presentation
   (hierarchy, alignment, rhythm, consistency between surfaces), polish (focus/hover states,
   transitions, empty states, edge legibility).
2. **Then implementation** in gate-disciplined passes.

### Constraints that do not bend for beauty

The no-verdict gate scans everything rendered including tooltips; UX-02's control-labelling rules;
the design tokens (no new hex); no innerHTML/SVG/url(; the single-file offline contract; every
floor and row moved openly. Polish may not soften a refusal, add a judgement, or hide a reading
behind hover that a control depends on.

---

## D-34 — Eighth round, 2026-08-30: a cancel step on modifying actions

Verbatim:

> there should be a cancel step on modifying actions

### What this settles

Editing an action gains an explicit way out. A student who has changed an action's name, cost,
requirements or transformations can discard those modifications instead of hand-reverting them
field by field.

### Orchestrator interpretation (recorded, overridable)

- **Cancel is a REVERT, not a draft mode.** The file's architecture commits every edit live
  through the op funnel — that is what keeps the board updating as you author and keeps Ctrl+Z
  uniform. So: when an action is selected in the editor, its record is snapshotted; **Cancel
  restores that snapshot as ONE commit** (itself undoable — a mis-pressed Cancel is recoverable by
  Ctrl+Z, in keeping with the file's no-confirmation rule D-17).
- Scope of "modifications": everything since the action was selected in this editor session —
  name, cost, req, xf. Creating or removing an action is not "modifying" one; those already have
  their own paths and D-17 rulings.
- The control reads as a plain secondary action beside Done, with wording that states what it does
  (restores the action to how it was when selected). If nothing changed, it is inert but never
  disabled-without-reason — follow the shipped never-disable conventions outside the fight grid.
- Escape's shipped semantics (field revert, then close) are untouched.
