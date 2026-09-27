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

---

## D-35 — Ninth round, 2026-08-31: round rules as data, and token bounds

Verbatim:

> add a feature to configure what happens each round (default +3 action points, but also things
> like -1 of a status effect token) Add a property for min and max of a token on a unit or side

### What this settles

1. **What happens each round is configurable data.** Advance applies a student-editable list of
   round rules — each "who gets what": a side or its units, a token, a signed delta. The shipped
   default is **+3 action points to each side**, per the developer's words. Status decay ("-1 of a
   status token each round") is the named second use.
2. **A token type gains min and max bounds**, at whichever scope it lives (unit or side). Bounds
   are properties of the type — authored, and carried by the build code like every other authored
   property (SHARE-08's spirit).

### Orchestrator calls (recorded, overridable)

- **Bounds clamp at write time** — the house convention (int() clamps; D-34 measured it) — on
  EVERY write path: steppers, ops, round rules, and Advance's xf application. A bound is data the
  recipient of a build code gets.
- **Round rules live in the build slice** (they define how the fight behaves; a classmate loading
  your code must get your rules), authored through named ops with the usual guards, capped
  (MAX_ROUND_RULES, orchestrator default 8).
- **The +3 fork, stated honestly:** today Advance REFILLS pools to full. "+3 capped at the side's
  configured AP" is identical while AP is 3, and genuinely different at the candidate retune of 9
  (+3/round meters a 9-pool over three rounds; refill-to-9 does not). The developer's words are
  taken literally: the default rule is +3. The old refill semantic remains expressible (a rule of
  +9 with max 9). **Playtest question: which one makes the 9v3 contested?** — this interacts
  directly with the AP sweep.
- **Shield stops being a hardcoded no-refill ruling and becomes data**: shield simply has no round
  rule by default (and a max of its starting value). A student who wants Recharge-style regen
  authors a +1 shield rule. The old ruling's comment is amended to say the rule moved into data.
- **Codec**: bounds and round rules must round-trip. Stay v1 ONLY if the grammar extension is
  honestly backwards-decodable (an old code loads with defaults); otherwise bump to v2 with v1
  still decoded. Phase 4's version prefix exists for exactly this — no silent garbage either way.

---

## D-36 — Tenth round, 2026-09-01: click a resource to rule on it

Verbatim:

> add the ability to directly click on a resource to directly modify the value of that resource in
> the current round

### What this settles

Resources on the fight tab become directly editable at the point where they are read. Clicking a
resource reading — a unit's health, shield or status tally on the battlefield, or a side's team
resource — opens a small inline control AT THAT SPOT to change the value in the current round.

### Orchestrator interpretation (recorded, overridable)

- The change is a HAND RULING: it flows through the shipped ruling ops (setUnitHp / nudgeFightHp /
  setFightShield / the fight tally writers), lands in the round's ruling record (FIGHT-07's
  by-hand event), and is one undoable commit per change — exactly the machinery wave 5 built and
  plan 05-10 listed as controls-missing.
- The inline control is a nudge pair (−/+) with the value between, in the shipped stepper idiom,
  dismissed by clicking elsewhere or Escape (field-revert semantics untouched). Clamped by the
  D-35 bounds like every other write.
- This supersedes the D-27-era note that hand rulings live only on the board tab. The board tab's
  paths remain; the fight tab gains the direct one.
- The battlefield stays read-only for anything that is NOT a resource reading; the retarget flow's
  claim on unit-shape clicks is unchanged — a resource click and a unit-shape click must not
  collide (the resource tokens are children; hit-testing must separate them cleanly).

---

## D-37 — Eleventh round, 2026-09-01: the unit popup

Verbatim:

> click on a unit then click on the popup window to modify the values associated with it

### What this settles

Clicking a unit on the battlefield (at rest — a half-made retarget still owns the battlefield)
opens a popup for THAT unit showing every value associated with it: health, shield, every status
tally including the zero-hidden ones, and the dead marker. Clicking a value inside the popup
modifies it — the D-36 nudge idiom, now inside a surface with room to breathe.

### Orchestrator interpretation (recorded, overridable)

- **This supersedes D-36's per-reading nudge ON THE BATTLEFIELD** — the readings there return to
  being readings, the unit shape's click opens the popup, and the nudge lives inside it. The
  team-resource direct click stays as D-36 built it. Recorded as a supersession, not a bug in
  D-36: the popup resolves D-36's own two deferred items (17: the popup is a true keyboard
  surface with real buttons; 18: a value at zero is present and clickable in the popup).
- Every change is still a hand ruling: shipped ops, the round's by-hand record, one undoable
  commit per change, D-35 bounds clamping with readable refusals.
- The popup follows the shipped dialog/popup idioms (positioning near the unit, Escape and
  click-elsewhere dismiss, focus management per the file's conventions), carries the unit's name
  as its heading, and renders values in the D-29 symbolic language with the scanned tooltips.
- The dead marker toggle joins the popup as one of the unit's values (its board-tab control
  remains).

---

## D-38 — Twelfth round, 2026-09-01: the how-to leaves the simulator

Verbatim, with a screenshot of the Actions editor attached:

> this part a the bottom looks cluttery - if you want a how-to-tab, do it separately from the
> simualtor

### What this settles

Instructional prose leaves the working surfaces. The explainer paragraphs sitting inside the
editors and panels — "Every action on a side lives in one list…", the Cost / Needs / Changes
explainer sentences, the round-rules "What Advance does to the board…" paragraph, and their kin —
do not belong on the simulator. If the artifact wants a how-to, it is its OWN tab, beside The
board and The fight.

### Orchestrator interpretation (recorded, overridable)

- **A third tab, "How this works",** collects the displaced instructional prose, organised by
  surface. The teaching text is part of the workshop's value — it moves, it does not die.
- **What stays on the surfaces:** READINGS (the admission line, refusal sentences, the mid-fight
  build notice, cap sentences) — those state facts about the current board and are load-bearing.
  What moves: text that EXPLAINS HOW TO USE a surface or WHAT A CONCEPT IS, independent of the
  current board's state. The one-line hint idiom (a short label like "Spent when the action is
  used") may survive as a scanned tooltip on the term-list headings per the D-29 language, at the
  executor's judgement per site — recorded per site either way.
- **The screenshot also shows two apparent DEFECTS to reproduce and fix or explain:** the Side
  chooser pills render EMPTY (no Cats/Mechs words), and a second panel ("Emoji" + "Done" — the
  token appearance editor's foot) is visible beneath the Actions dialog. Neither is clutter; both
  look wrong. Reproduce this exact state first.

---

## D-40 — 2026-09-02: preview the pool while setting up an action

Verbatim:

> Make it so you can preview the depletion of action points while setting up actions

### Reading taken (recorded, overridable)

The fight tab already depletes resources live while DECLARING (D-27's own spec, shipped). "While
setting up actions" is read as the AUTHORING surface: while a student configures an action's cost
in the action editor, the editor shows what that cost does to the side's pool — live, as the cost
terms change.

### What this settles

- The editor's Cost region gains a live reading per pool the cost names: the side's current pool,
  the cost taken from it (D-30's red mark on the taken symbols), and what remains — in the D-29
  symbol language with the scanned-tooltip prose. Action points first; any side-scope tally a
  multi-term cost names (D-32/D-24) reads the same way.
- It is a READING, not a control — never disables anything (the never-disable rule is fully in
  force on authoring surfaces), and states plainly when a cost exceeds the pool (the same words
  the affordability machinery already owns).
- It updates live as cost terms are added, edited, removed, or cancelled (D-34's restore included),
  and follows the selected side.

---

## D-41 — 2026-09-25: drag tokens to allocate them

Verbatim:

> Can you make it so manual allocation of resources can be done via dragging token elements onto
> the relevant entity or dragging from one to another

### What this settles

Allocation gains a direct-manipulation path alongside the steppers:
1. **Drag onto an entity** — a token type dragged from a source onto a unit (unit-scope types) or
   a side (side-scope types) adds one of it.
2. **Drag from one to another** — a token dragged off one entity onto another moves one: −1 at the
   source, +1 at the target, as ONE commit.

### Orchestrator calls (recorded, overridable)

- **Surface: the build board**, where allocation lives. The fight tab keeps D-37's click-to-rule
  popup; a fight-tab drag would be a hand ruling, not an allocation, and is a follow-up on request.
- **Moves stay within a side** and within a token type's scope (unit→unit, side→side). A
  cross-side drop is refused in the file's refusal register, not silently ignored. One-line change
  if the developer wants cross-side transfers.
- **Sources for "add one":** a per-side tray of that side's token types (shipped and
  student-authored alike — D-24, no second tier), each drawn in its own authored shape/colour/glyph.
- **Each drop is ONE commit, ONE undo entry**, clamped by D-35 bounds on both ends: a move that
  would take the source below its min or the target above its max is refused readably and moves
  nothing (a half-transfer is never written).
- **Pointer Events, not HTML5 drag-and-drop** — the file routes presses through `pointerdown` with
  event delegation, HTML5 DnD does not deliver touch/pen, and its drag image cannot carry the
  token's clip-path shape. A movement threshold separates a click from a drag so existing presses
  keep working.
- **The steppers remain the keyboard and assistive-tech path.** Drag is additive, never the only
  way to reach a value (WCAG 2.5.7). Nothing that exists is removed.
- Drop targets light with D-33's "lit" palette role while a drag is live; an invalid target reads
  as invalid (not merely unlit); Escape cancels a drag in flight.

### D-41 amendment — 2026-09-25, developer, before any code was written

Verbatim:

> allow any unit to any other unit, with a pool at the top of each side for unit to side drags

And, asked what the pool holds, the developer chose **a real reserve** over a source/sink.

**This supersedes two of D-41's calls above:**

1. **Moves are ANY unit → ANY other unit**, across sides included. The "moves stay within a side"
   call is withdrawn. Scope still binds (a unit-scope token moves unit→unit; a side-scope token
   cannot land on a unit), because a token type's scope is a property of the type, not a policy.
2. **The per-side tray becomes a per-side POOL, and the pool is a conserved reserve.**
   - It sits at the top of each side's column.
   - It holds a COUNT per token type. Unit → pool moves one in (−1 unit, +1 pool); pool → unit
     moves one out (−1 pool, +1 unit). Pool → a unit on the OTHER side is allowed (any-to-any).
   - Nothing in a drag creates or destroys a token. Tokens enter the system only by the steppers,
     as today — so the pool starts empty and imposes no budget.
   - The side's own side-scope tokens (action points and student side tallies) are drawn in the
     pool too, since that is where they already live. Side-scope tokens can move pool → pool
     (side to side). They cannot land on a unit.
   - **The reserve is build data.** It round-trips in the build code as a v1 extension, provided an
     old code decodes with an empty reserve, driven with a real pre-D-41 code. It is NOT spent,
     applied, or read by the fight: it is unallocated, and a unit never fights with tokens it has
     not been given. The projection likewise reads only allocated tokens.
   - Bounds (D-35) clamp on units. Whether the pool itself is bounded is decided by measurement:
     a pool at a token's max would refuse a unit→pool drag the student reasonably expects to work.
     Record the choice.

---

## D-42 — 2026-09-26: a Final Fantasy 1-style battle scene, for telling units apart

Verbatim:

> Please create a final fantasy 1 esque visualization of the battlefield. Allow people to drag the
> entities around anywhere they like.
>
> It is simply a visualization for the purpose of them tracking which cat and which mech is which.

### What this settles

The fight tab gains a SCENE: an FF1-style battle view where every unit appears as a pixel sprite
labelled with its name, and students can drag any sprite anywhere inside the scene. Its only job is
identification — which cat is which, which mech is which. It is not a control surface.

### Orchestrator calls (recorded, overridable)

- **Placement:** a panel on the fight tab. It ADDS to the existing battlefield (D-27 addendum),
  which keeps its jobs (retarget targets, the D-37 unit popup). It does not replace it.
- **Look:** an FF1 battle window. A framed scene (FF1's blue menu-window border, derived from the
  design tokens) with a backdrop band. Cats on the left, Mechs on the right, facing each other,
  matching every other column in the artifact. Each unit has a pixel-art cat or mech sprite with its
  name beneath in a monospace system font (no external fonts). A unit ruled dead lies down greyed
  out, the way an FF1 party member falls. The ruling is read from the stored flag and never
  inferred from health (D-00d).
- **Sprites are drawn by code:** canvas, or CSS pixel grids. The gate forbids image files, `url(`,
  ` src=`, inline SVG and innerHTML. Sprite colours are DERIVED from the design tokens at runtime
  (e.g. read from computed custom properties), not typed as literals. No new hex in the stylesheet
  (row 107f).
- **Drag positions are view state only:** not undoable, not in the build code, not in the fight
  slice. They persist best-effort in `localStorage` under a namespaced key (`cvm.v1.*`, try/catch,
  total absence treated as normal — CLAUDE.md's rule). Positions are keyed by unit id. A new unit
  gets a default FF1 formation slot, and a removed unit's saved position is dropped. Every sprite
  stays inside the scene, clamped at the edges.
- **No victory screen, fanfare or outcome text.** FF1's "Victory" moment is exactly the verdict the
  no-verdict gate exists to prevent. The scene shows who is standing, and nothing more (D-26 stands).
- **Accessibility:** positions are cosmetic, so drag-only is acceptable here. No information is
  locked behind a drag. Every sprite still carries its unit's name as an accessible label.

---

## D-43 — 2026-09-27: the mechs are much bigger than the cats

Verbatim:

> make the mechs much bigger than the cats

Orchestrator reading: mech sprites render at about **2× the cats' linear size** (4× the area),
FF1's scale for large monsters. Names stay legible. The default formation, the drag clamp, and the
24-a-side case are all re-measured at the new size.

---

## D-44 — 2026-09-27: 16-bit art, with the 8-bit art kept as a choice

Verbatim:

> change the bar to FFV level art and redraw, keep the original art and let users pick the
> generation, use the new one as default

### What this settles

- **A new art generation for the battle scene, at Final Fantasy V's level of detail** (16-bit
  SNES): higher-resolution sprites with shading and outlines, and a richer layered backdrop band
  (sky, distant scenery, textured ground).
- **The D-42 art is kept** as the 8-bit generation.
- **A picker selects the generation; 16-bit is the default.**

### Orchestrator calls (recorded, overridable)

- "The bar" is read as the scene's backdrop band, and "redraw" as the sprites too. The whole scene
  gets the new generation.
- The picker is labelled by generation ("16-bit" / "8-bit") rather than by game title, to keep
  third-party trademarks off the tool's controls. A one-word change if the developer wants the
  titles.
- The choice is view state, like sprite positions: best-effort `localStorage` under a `cvm.v1.*`
  key. It is not in App.state, undo or the build code.
- D-43's scale holds in both generations: mechs at about 2× the cats' linear size.
- Colours stay derived from the design tokens at runtime (shade ramps built by mixing tokens), with
  no new stylesheet hex (row 107f). Names stay real text above sprites (Layer C, D-42's paint-order
  fix). Dead units lie down greyed in both generations. No victory text.

---

## D-45 — 2026-09-27: generated, themed default names for units

Verbatim:

> Use a name generator to create initial names for the cats and mechs, theme appropriately

### What this settles

Units no longer default to "Cat 1" / "Mech 1". A name generator produces themed initial names:
cat-like names for the Cats, mech designations for the Mechs. They show everywhere a unit's name
already shows: board cards, the fight grid, the battlefield, the battle scene, the ledger and the
unit popup.

### Orchestrator calls (recorded, overridable)

- **Deterministic, not random.** A unit's generated name comes from its side and a stable key (its
  id or slot), so the same board always shows the same names: across reloads, in a classmate's
  copy loaded from a build code, and after undo. Everyone's first cat has the same name, so the
  instructor can name units aloud. A re-roll control is not added (not asked for).
- **A student's own rename always wins.** The generator supplies only the default name.
- **Names are derived, not stored**, where the current model allows it. The build code keeps
  encoding only what the student changed, so the shipped board stays 45 characters and old codes
  still decode. If the model stores default names today, record what changes and why.
- **Theme:**
  - Cats: short, friendly cat names (single words, e.g. Biscuit, Pounce, Mittens).
  - Mechs: industrial designation style (a model name with a mark or number, e.g. "Warden MK-2").
  - Unique within a side up to 24 units. Short enough to fit every surface (scene labels, grid
    rows, cards).
- **The no-verdict gate applies to the name lists.** Names that judge or rank ("Victor",
  "Champion", "Dominator", "Ace", anything on the live word lists or the eight
  clean-but-unshippable words) are excluded. Screen every candidate against the live arrays.

---

## D-46 — 2026-09-27: drag resources on the fight tab

Verbatim:

> I can't drag resources around the battle screen.

D-41 deliberately built drag-to-allocate on the BOARD tab only and recorded the fight tab as a
follow-up ("a fight-tab drag would be a hand ruling, not an allocation"). The developer now wants it.

### What this settles

The fight tab gets D-41's drag model, applied to the FIGHT slice as hand rulings:
- **Drag a resource token between units**: any unit to any other unit, either side, on the fight
  tab's battlefield.
- **The team-resources area is each side's pool**, mirroring D-41's amendment: a conserved per-side
  fight reserve for unit-scope tokens, plus the side's side-scope tokens (action points, student
  side tallies), which move pool to pool.
- **Scope binds exactly as in D-41's `moveToken`**: side-scope types never land on a unit; Damage
  and the dead marker don't move.

### Orchestrator calls (recorded, overridable)

- **Every drop is a hand ruling:** it writes the fight slice only (never the build), is recorded in
  the round's by-hand record (so the ledger's what-changed shows it), and is ONE commit and ONE undo
  entry. Bounds (D-35) are refused whole, never clamped (conservation). A unit taken to zero is
  never marked dead automatically (D-00d).
- **The fight reserve is invisible to the fight's arithmetic:** advanceRound, spokenFor,
  affordability and the projection never read it. A unit fights only with what it holds. The fight
  slice is not in the build code, so there is no codec work.
- **Clicks and drags coexist:** a movement threshold separates them. A still press on a unit keeps
  opening the D-37 popup, and a press on a team resource keeps D-36's nudge. While a retarget is
  half-made the battlefield belongs to the retarget flow and no drag starts.
- **The D-42/D-44 battle scene is untouched:** its sprites drag for position only and carry no
  resources.
- **Reuse, don't fork:** the same op pattern and guard-predicate discipline as D-41 (lit and
  invalid targets computed from the op's own guards), and the same pointer machinery where it can be
  shared.
