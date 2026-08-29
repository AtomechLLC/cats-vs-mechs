---
phase: 05-fight-loop-playtest
plan: 14
subsystem: render+interactions
tags: [s06.7, s07.5, c14.1, d-27, grid, radio, defaultAt, change-target, disable, overrule, fight-03, fight-09, fight-12, fight-13, ux-02]

requires:
  - phase: 05-fight-loop-playtest
    plan: 13
    provides: "App.model.spokenFor / needsAt / defaultAt, declareAction's replace-per-performer shape, App.ops.SIDES, and the caller-computes-the-default contract"
  - phase: 05-fight-loop-playtest
    plan: 12
    provides: "the fight tab the grid is painted onto, and the 1216/0 + 163/163 + 114-id baseline"
  - phase: 05-fight-loop-playtest
    plan: 10
    provides: "check 95, the never-disable walk this plan turns, and the [S07.5] disabled-grep-0 acceptance line it re-homes"
  - phase: 05-fight-loop-playtest
    plan: 07
    provides: "the measured apSpent-reads-zero blocker this plan resolves, and the declaration form it removes"
provides:
  - "[S06.7] as D-27's declaration grid: the round spanning both columns, and per side the faction, an empty flagged .fg-field, the team resources and one picker row per unit"
  - "one press declares / undoes / replaces, decided from state and never from aria-pressed, with the default target computed by the surface and passed to the op"
  - "the change-target flow: two root attributes, a never-disabled control, a one-line side predicate, and the data-fg=\"bf\" key contract fixed for plan 05-15"
  - "the preview: team resources depleting by App.model.spokenFor at render time, storing nothing"
  - "the disable contract as an if-and-only-if, re-decided from state every repaint, with both overruled rules turned in the open"
  - "an empty .fg-field per side, built once and never replaced, reserved for plan 05-15"
  - "check 95 rewritten over FIVE boards, check 95b re-homed, and six new rows 104-104f. Interaction gate 163 -> 170"
affects: [05-15, 05-16, 05-11]

tech-stack:
  added: []
  patterns:
    - "a boundary assertion turned in the open: recorded red verbatim, rewritten to the new contract in both directions, recorded green — never deleted"
    - "an expected disabled set computed from the contract independently of the render and compared BOTH WAYS, so the row cannot be green over either direction"
    - "a like-for-like board added per clause, because a board on which two spellings agree by accident asserts nothing about either"
    - "a node reserved EMPTY and FLAGGED for the next plan, with the owner named at the site and the never-replaced rule written beside it"
    - "a UI restriction put behind a one-line predicate with the ruling it narrows, the one-line widening and the concrete case that will surface it written beside it"
    - "a disable that is a RENDER decision, asserted by driving a rebuild and reading the set back off NEW nodes"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "THE UNIT IS A LABEL AND NOT A CONTROL, and it is recorded as a playtest question rather than settled. D-27's sketch draws [C1] in brackets like the actions beside it, but the addendum moved the only job a unit control ever had — being the click surface for targeting — onto the battlefield. A control with nothing to do takes a Tab stop, invites a press that declines quietly, and would need a second data-k on a row check 94b counts. If a room wants the unit pressable, that is one arm in [S07.5] and one node in [S06.7]"
  - "THE ROUND FIGURE COST 57px AND THE DIAL PAID FOR IT, MEASURED RATHER THAN GUESSED. The grid did NOT make the region taller: the 34vh bound held at the same 367px window over 36 buttons as over the old form, and 24 a side changed nothing. What added height was the ROUND on its own line spanning both columns — 45px of figure and 12px of gap — and that pushed the Advance control to 814 of a 768px viewport. .fg-sides went 34vh -> 26vh, which costs the grid 61px of window at 768 and 86px at 1080, and the whole sweep and the trade are written into [C14.1]"
  - "[C14]'s 736px BASIS IS NOT MOVED AND THE RE-MEASURE IS HANDED TO PLAN 05-15 BY NAME. The number still HOLDS — the bar reads 736 during a fight and both columns sit along the line at both viewports — but its derivation was taken against the old content and a picker row is a unit name plus one button per action. [C14] is outside this plan's ownership and the battlefield lands in the same two columns, so moving it twice would be moving it wrongly once. The hand-off is written at the site"
  - "THE DEFAULT TARGET NARROWS 03.1-07's RULING AND THE NARROWING IS WRITTEN AT THE SITE, NOT IN A PLAN FILE. declareAction says `at` may name a unit on EITHER side because \"a heal that lands on a friend and a hit that lands on a foe are the same record with a different unit chosen\". D-27 hands an enemy by default and lights the opposing side for the change, so a heal-shaped action can only be pointed at an enemy FROM THIS SURFACE. Shipped as the developer wrote it, behind fgMayPoint — one line, widened by `return true`, with the heal-shaped case named as what will surface it. declareAction and unitAnywhere are untouched, so the restriction lives only where a student can see it. It is a playtest question"
  - "THE TOPBAR PAIR STAYS, AND THE REASON IS NOW A REAL ONE. #round-count, #pool-cats and #pool-mechs are the ONE reading present in BOTH views — the tab switches the board-vs-fight region and #topbar sits outside it — so a student who has stepped back to the board to make a ruling still sees the round and both pools. Whether two readings of one economy in two places is one too many is recorded as a playtest question rather than settled"
  - "THE GRID'S PAIR AND THE BAR'S PAIR ANSWER DIFFERENT QUESTIONS AND BOTH SHIP. The bar keeps apSpent, which looks BACKWARD at two slices that have drifted and is the FIGHT-10 hazard's own figure; the grid says what this round has SPOKEN FOR, which looks FORWARD at a list of intents nothing has resolved. They are computed from the same slices in the same frame so they cannot disagree, and the comment beside each says which question it answers"
  - "THE SIDE'S READING BOX IS LAST IN THE COLUMN, BELOW THE PICKER ROWS. The addendum fixes four things and their order; the reading box is a fifth. It is a fact about the side's ACTIONS that a student consults after reaching for one, so putting it above the rows would put prose between the team resources and the thing they are about"
  - "THE HARNESS PRESSES A DISABLED CONTROL AND A REAL BROWSER DOES NOT, so every disable clause reads the PROPERTY off the page rather than asserting that a press did nothing. The stub has no hit testing. A row written the other way round would be asserting a browser behaviour this file cannot model. Plan 05-16 owes the limitations entry"

patterns-established:
  - "a probe that finds the defect in the ROW rather than in the code, twice in one row, and the row gets a new board each time rather than the probe being called satisfied"
  - "a disable written on a build-once path is DEAD CODE and a probe placed there measures nothing — both probe AP and probe AR hit it, and the finding is that a faithful violation has to go where the per-frame pass runs"
  - "a stub control built to a key contract the artifact writes down, pressed, and taken away again in the same breath, so an arm whose sender is a plan away is still driven"

requirements-completed: [FIGHT-03, FIGHT-09, FIGHT-12, FIGHT-13, UX-02]

duration: 191min
completed: 2026-08-29
---

# Phase 05 Plan 14: THE GRID Summary

**D-27's declaration surface, built as the addendum ordered it and with the
two rules it knowingly overrules turned in the open: one press declares an
action already pointed at the weakest living enemy, the same press undoes it,
a different press replaces it, the side's resources drop by what has been
spoken for and nothing has resolved — and an action a side cannot pay for,
cannot meet, or whose unit the student ruled dead is visibly out of reach
without the page saying a word about why.**

## The gate, before and after

| | before (post-05-13) | after |
|---|---|---|
| suite | 1216 passed, 0 failed | **1216 passed, 0 failed** |
| `SUITE_FLOOR` | 1186 | 1186 — **not moved**; this plan adds no `[S09.*]` row |
| interaction gate | 163 of 163 | **170 of 170** (+7) |
| stub-drift | 114 shell ids | **114 — unchanged, no id added** |
| `#app` (setup) | 128 | **128 — unchanged** |
| `#app` (fight) | 421, `FIGHT_FLOOR` 120 | **411**, floor 120 — **not moved** |
| dialogs | 145 across 4 roots | 145 across 4 roots — unchanged |
| proposal pane | 60, floor 23 | 60, floor 23 — unchanged |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 7903 literals, 0 hits | **7921 literals**, 0 hits |
| private fight controls | 63 | **51** (floor 60 -> 45) |

`node tests/selftest-node.cjs` exits 0.

**`counter|balanc|rating` 0, whole document. `url(` 0. `createElementNS|<svg` 0.
`innerHTML` 0. `text-wrap` 0. Hex over `[C14.1]` 0. One classic `<script>`, one
`<style>`. `DEFAULTS.cats.ap` untouched — the whole of `[S01] DATA` diffs
EMPTY (D-25).**

### The fight harvest went DOWN, and that is the finding rather than a worry

421 -> **411**. The grid draws far more NODES than the form did — 36 action
buttons where there were three chooser boxes — but fewer distinct rendered
STRINGS, because the three choosers listed every unit on both rosters twice
over and the "Declared so far" list spelled each declaration out as a sentence.
`FIGHT_FLOOR` is 120 and is a floor, so it is not breached; it is **not moved**,
because plan 05-16 owns it and the battlefield in 05-15 will move the harvest
again. Handed on with the number.

## What was built

### `[S06.7]` — rewritten whole, as the declaration grid

`#fightbar` now draws, in the addendum's order:

```
[ROUND]                          .fg-round-head, inserted before .fg-sides
  Cats                           .fg-side-head
  9 of 9 still standing          .fg-standing
  (battlefield)                  .fg-field   <- EMPTY, plan 05-15's
  Action points 1 of 3 spoken for / 2 left to spend
  Cat 1  [Slash 1 Action points ✓] [Hairball 1 …] [Screech 1 …]
         Lands on Mech 1.  [Change target]
  Cat 2  [Slash …] [Hairball …] [Screech …]
  …
  (the side's reading box)       .fg-reportbox
```

Driven in real Chrome and real Edge, both viewports, the children of
`#decl-cats` read back as
`["fg-side-head","fg-standing","fg-field","fg-team","fg-rows","fg-reportbox"]`
and the children of `#fightbar` as
`["fight-head","fight-prompt","fg-round-head","fg-sides","fight-said","fg-round-acts"]`.

**The battlefield container is built empty, flagged, and never replaced.** No
pass in the region calls `replaceChildren` on the side root or on that node —
only on the four boxes beside it. Driven over ten forced frames in both
browsers with a marker on the node: `["field0","field1"]` both times, the same
objects. The reason and plan 05-15's ownership are written at the site, in
`#fight-said`'s and `#share-said`'s shipped register.

**Retired with the form, in the same commit:** `fgPill`'s three kinds,
`fgFillActs` and `fgFillPicks` as choosers, `fgFillDecls` and its per-line
Clear, `fgDeclParts`, `fgBuildSide`'s five groups and the Declare button.
`FIGHT_NOBODY_WORD` survives, lowercased, as the word a row uses when an action
asks for a target and no enemy is left living.

**Kept, because each is load-bearing:** `fgSay`/`fgSayOver` (one node per
fragment, and its paragraph now says why it matters MORE under D-27 — an
action's name sits inside a button beside a figure and a token label),
`fgGoneTerm`, `fgHandOff`, `fgUnitName`, `fgTerms`, `fgAction`, `fgCaster` (the
forced `maxHp`-from-`hp` shim), `fgSettle`, `fgUnitOn`, `fgSig`, `fgRest`,
`fightBar`, `syncFight`, `withPreservedFocus` scoped to `#fightbar`, and both
root attributes with their one-question-each paragraph.

### `[S07.5]` — rewired, and four arms retired with the controls they served

`data-fg="declare"`, `"clear"`, `"by"`, the chooser spelling of `"at"`, the
`FG_PICK_KEY` table and `fgUnitOrNull` are **gone**. One arm replaces all four:

```
nothing standing for this unit  -> declare, with at = needsAt ? defaultAt : null
this same action standing       -> clearDeclaration at its index, read off STATE
a DIFFERENT action standing     -> declare again, replaced in place by [S05],
                                   with a FRESHLY computed default
```

`advance`, `reset`, the board's `alive` arm and `onFightKeyDown`'s scope are
untouched. Nothing is in `UI_ACTS`, nothing is in `HOLD_ACTS`, and both absences
stay written down — with a new sentence about why an ACTION BUTTON must never be
held either, which is new with D-27: the arm alternates declare and clear on one
control, so a hold would toggle a declaration at the auto-repeat rate.

### The change-target flow

- `pressAt` is **page work and dispatches nothing**: it writes `dataset.fgAct`
  and `dataset.fgBy` on the acting side's own root and repaints. Pressing it
  twice clears them and leaves the declaration standing.
- `dataset.fgAt` **retires**. There is no third attribute, because the
  completing click IS the target and it dispatches on the spot. `fgSettle`
  settles two, `fgSig`'s third slot fingerprints two, `fgRest` clears two.
- `pressBf` completes it: same `side`, same `act`, same `by`, only `at` moved,
  in one commit and one undo entry.
- **The key contract for plan 05-15 is fixed in `[S07.5]`'s banner by name and
  by spelling** — `data-fg="bf"`, `data-fg-side`, `data-fg-val`,
  `data-k="fg/bf/{side}/{unit}"` — together with "unlit is not disabled", in the
  register plan 05-07 used to hand a requirement to plan 05-10.

### The preview

Each side's team resources read `spokenFor` against what is left to spend,
computed at render time and stored nowhere. Driven in both browsers:

```
at rest             Action points / 0 of 3 spoken for / 3 left to spend
after 1 declaration Action points / 1 of 3 spoken for / 2 left to spend
after 3             Action points / 3 of 3 spoken for / 0 left to spend
after a re-click    Action points / 2 of 3 spoken for / 1 left to spend
```

The lineage is written at the site: **the number moves because the reading
changed, not because `advanceRound` did.** The applier diffs EMPTY over 281
lines. Tallies sit beside the pair and are not depleted, and the asymmetry is
argued rather than left to be noticed.

### The disable contract

```
disabled  iff  (a) a requirement term is unmet on the CASTER SIDE
           or  (b) fight[side].ap - spokenFor(side) + this row's own pledge
                   cannot pay the action's cost
           or  (c) the row's unit was ruled dead by the student
```

`apCost === null` never disables (D-16). `alive` is the stored flag and never
`hp === 0` (D-00d). The `+ own pledge` and its reason are at the site: without
it a unit that declared the last affordable action would disable its OWN button
and re-click-to-undo would be unreachable.

Driven in both browsers at both viewports: **18 buttons out of reach** after
three declarations on a nine-unit side with three action points, the declaring
row's own button still live, all three buttons of a ruled-dead unit out of
reach, and `["fg"]` — `#fight-start` — the only disabled control outside the
grid.

**Visibly distinct in two non-colour channels**, measured:

| | live | disabled |
|---|---|---|
| border-style | `solid` | **`dashed`** |
| opacity | `1` | **`0.45`** |
| cursor | `pointer` | `not-allowed` |
| colour | `rgb(232, 235, 242)` | `rgb(232, 235, 242)` — **identical** |
| background | `color(srgb 0.42 0.46 0.54 / 0.08)` | **identical** |

There is no colour channel at all to lose on a projector. And no rendered word
explains a disable: a scan of every leaf under `#fightbar` for an explanatory
phrase returns `[]`.

## THE TWO TURNS, IN THE OPEN

### Turn 1 — check 95

**RED, recorded verbatim before the rewrite:**

```
FAIL  interaction gate :: 95. NOTHING IS DISABLED FOR ANYTHING A STUDENT DID, …
      controls compared=137 | funded === cannot pay and cannot meet=false
      | funded === three ruled dead=false | fight pools driven to [0,0]
      | the report moved: "" -> "Slash needs 99 Health of 27. Requirement not met."
      | the advance entry=["fg/advance=false"] | every =true entry=["fg=true"]
      | alive toggles disabled=[]
1216 passed, 0 failed
interaction gate: 168 of 169 checks passed
```

Two of the three whole-set comparisons failed and the other four clauses held,
which is the shape the overrule is supposed to have.

**REWRITTEN, never deleted.** Two halves and a third clause:

- **outside the grid** the whole set is identical across every board;
- **inside**, the expected set is computed from `(a) or (b) or (c)`
  independently of the render — reading `App.model` and nothing `[S06.7]`
  wrote — and compared **both ways**;
- and the contract is asserted to **fire**, so the row cannot be green over a
  page that disables nothing.

**GREEN:**

```
controls compared=137 | OUTSIDE the grid identical across all three boards=true
| INSIDE, page === expectation: funded=true cannot pay=true ruled dead=true
last affordable action=true the stored flag=true
| on the fourth board the DECLARING row reads ["fg/act/cats/c1/slash=false"]
and another row reads ["fg/act/cats/c4/slash=true"]
| on the fifth, c3 at health 0 alive=true has buttons out of reach=[]
and c4 at health 3 alive=false has buttons still live=[]
| buttons out of reach: funded=0 cannot pay=36
| a ruled unit's buttons still enabled=[] | fight pools driven to [0,0]
| the report moved: "" -> "Slash needs 99 Health of 27. Requirement not met."
| the advance entry=["fg/advance=false"]
| every =true entry OUTSIDE the grid=["fg=true"]
| alive toggles disabled=[] | change-target controls disabled=[]
```

The row's label says which rule it replaced, on whose word, and that the
never-disable rule remains in force on the build and proposal surfaces.

### Turn 2 — the `[S07.5]` disabled-grep-0 line, re-homed as check 95b

It shipped in plan 05-10 as an **acceptance line** rather than as a numbered
check, which is exactly how a boundary gets forgotten. It is now a row. It still
reads the grep off the artifact's own source, sliced between `[S07.5]`'s two
region markers — **0 over 33,641 characters** — and then drives the stronger
property the new contract makes true.

**GREEN:**

```
the property appears in [S07.5] 0 times over 33641 characters
| buttons out of reach after the declaration=24
| the set moved on the declaration=true
| a rename left it identical=true while the node was replaced=true
| the undo put it back=true | the action name is back to "Slash"
```

### The scope of the overrule, proved by a shipped check rather than a new one

**Check 71c already makes the claim** for the proposal pane and is untouched.
Its reading, recorded: 33 controls, every one `=false`, and the three sets —
funded, no action points, roster thinned below the requirement — byte-identical,
while the cost line moves from `"Pounce costs 1 Action points of 3. Enough to
spend."` to `"…of 0. Not enough to spend. Short by 1."` and the requirement line
from `"…of 28…"` to `"…of 9…"`. Named rather than duplicated. The board's own
controls ride in 95's outside-the-grid half.

## The six new interaction rows

| row | what it holds |
|---|---|
| 104 | an action that `needsAt` declares in ONE press, `at` compared against `App.model.defaultAt`'s own answer on the same board; one that does not declares with `at: null` and draws no change control |
| 104b | D-00d off the RECORD: the default skips a dead-ruled enemy and does NOT skip a zero-health enemy nobody ruled |
| 104c | the change press dispatches nothing (whole state byte-identical), writes the two attributes, and a second press cancels; plus 73c's key walk, taken here |
| 104d | the completing press moves ONLY `at`; the list does not grow; one undo takes the retarget back |
| 104e | a press at rest and a press on the acting side's own unit both decline quietly; an action press clears a half-made change |
| 104f | the whole disabled set compared at four points across the flow — the CONTROL RUN taken before the turn |

## The probes — six run, six recorded, six reverted

### PROBE AN — the half-made change written into `state`

Reddened **104c and 104d**. The plan expected `[S09.3]`'s key-set row and/or
check 73c; **neither could see it**, and that is the finding. 73c is not weak —
it walks the whole live state at any depth for exactly that stem list — it
simply runs at the TOP of the harness, hundreds of drives before the fight
surface is ever pressed, and every board it reads was built through OPS. A key
written by a HANDLER during a flow is structurally invisible to it.

104c caught the probe on the byte-identical clause but could only report that
*something* moved. **Fixed** (commit `c0cc8e9`): 104c now carries 73c's own walk
after the flow, and the re-probe named the key:

```
keys named after a proposal, an override, a caster, a target or a pending
anything=["state.fight.pendingTarget"]
| state byte-identical across press one=false and across press two=false
```

### PROBE AW — the default from `hp` alone, ignoring the `alive` flag

Reddened **three rows**: 104b and two of plan 05-13's.

```
104b: m2 at health 0 with nobody ruling it, the default points at "m2"
      | m2 ruled dead (alive=false), the default points at "m2"
[S09.12]: actual ["m3",2,false]  expected ["m1",2,false]
[S09.12]: actual ["m2",0]        expected [null,0]
```

### PROBE AP — the disable widened to Advance when a side cannot pay

**First run: GREEN, and that is a finding about probes rather than about the
row.** The probe put the disable in `fgBuildRound`, which is on the BUILD-ONCE
path: it runs on the first frame of a fight when nothing has been declared, so
`spokenFor` is 0, the disable never fires, and there is nothing for any gate to
see. A disable on a build-once path is dead code.

Moved to the per-frame pass — a faithful violation — and check 95 reddened on
exactly the clause it was written for:

```
OUTSIDE the grid identical across all three boards=false
| the advance entry=["fg/advance=true"]
```

### PROBE AQ — condition (b)'s `+ own pledge` removed

**First run: GREEN. The row was asserting nothing on that clause**, and the
reason is probe AD's recorded lesson: none of the three boards could tell the
two spellings apart. On the funded board the side holds 3 and the action costs
1, so the row's pool is 3 either way; on the two starved boards every button is
out of reach on both spellings for other reasons.

**Fixed** (commit `ba4e45f`) with a fourth board — the action costs exactly what
the side holds, declared — and the re-probe reddened by name:

```
INSIDE, page === expectation: … last affordable action=false
| on that board the DECLARING row reads ["fg/act/cats/c1/slash=true"]
and another row reads ["fg/act/cats/c4/slash=true"]
```

The declaring row's own button out of reach is the denial-of-undo the clause
exists to prevent, printed.

*A second finding inside the fix:* the first draft of that board pressed the
action again to declare it, which under radio semantics **undid** it — the
surface working correctly and the row measuring nothing. The cost is raised
under the standing declaration instead, because `spokenFor` reads the live cost.

### PROBE AR — the alive toggle disabled on a unit ruled dead

**First run: GREEN, for the same reason probe AP's first run was** — the disable
went on the unit card's BUILD path, which runs once, when the unit is alive.
Moved to `[S06.9]`'s per-frame writer and **both 95 and 98 reddened, naming the
toggles by key**:

```
95: alive toggles disabled=["fg/alive/c1=true","fg/alive/c2=true","fg/alive/m1=true"]
98: c2 at health 3, ruled dead={… "enabled":false}
```

### PROBE AX — condition (c) driven off `hp === 0`

**First run: GREEN over four boards, one of which rules three units dead.**
Probe AD's lesson for the second time in one row: the ruled-dead board is also
the STARVED board, so every button on it is already out of reach and condition
(c) never decides anything by itself.

**Fixed** (commit `264119e`) with a fifth, FUNDED board carrying c3 driven to
zero health with nobody ruling it and c4 at full health ruled dead. The re-probe
reddened in **both directions, by name**:

```
INSIDE, page === expectation: … the stored flag=false
| on the fifth, c3 at health 0 alive=true has buttons out of reach=
  ["fg/act/cats/c3/hairball=true","fg/act/cats/c3/screech=true","fg/act/cats/c3/slash=true"]
and c4 at health 3 alive=false has buttons still live=
  ["fg/act/cats/c4/hairball=false","fg/act/cats/c4/screech=false","fg/act/cats/c4/slash=false"]
```

**Every probe was applied after a commit, reverted from a scratchpad `cp`
snapshot rather than `git checkout --`, and `git status --short` printed empty
after each.**

## The browser, which found the defect the suite was green over

Real Chrome and real Edge, 1920x1080 and 1366x768, driven by real clicks. Page
errors and console errors `[]` in every run.

**THE DEFECT: the round figure pushed the Advance control off the bottom of a
1366x768 laptop.** The grid itself did not make the region taller — the bound is
what makes its height independent of its contents, and 34vh gave the same 367px
window over 36 buttons as over the old form, unchanged at 24 a side. What added
57px was the ROUND on its own line, which is what D-27's sketch leads with.

| `.fg-sides` | Advance bottom @1920x1080 | @1366x768 |
|---|---|---|
| 34vh, the OLD form | 871 of 1080 | 757 of 768 |
| 34vh, this grid | 928 of 1080 | **814 of 768 — off the fold** |
| 30vh | 884 of 1080 | **783 of 768 — off the fold** |
| 28vh | 863 of 1080 | 768 of 768 — exactly on the edge |
| **26vh — shipped** | **841 of 1080** | **752 of 768** |
| 24vh | 820 of 1080 | 737 of 768 |

Identical in both browsers at every row. **What it costs is said out loud** in
`[C14.1]`: the grid's window goes 261 -> 200 at 768 and 367 -> 281 at 1080, over
1838px of content — roughly three picker rows at a time on a laptop instead of
four. `#strip` is still `sticky`, every ancestor still `visible`, in both
browsers.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 3 - Blocking] `insertBefore` added to the stub DOM**
- **Found during:** Task 1
- **Issue:** the round has to be drawn ABOVE `.fg-sides` without touching shell
  markup, and the stub page — a hand-made stand-in with no parser — implements
  `appendChild`, `removeChild` and `replaceChildren` but not `insertBefore`.
- **Fix:** six lines, standard semantics, with a null reference appending the
  way a browser does so the artifact's fall-through arm is modelled too.
- **Files modified:** `tests/selftest-node.cjs`
- **Commit:** `774129a`

**2. [Rule 1 - Bug] `.fg-sides` re-tuned 34vh -> 26vh**
- **Found during:** Task 1, in a real browser
- **Issue:** the Advance control at 814 of a 768px viewport.
- **Fix:** the sweep above, shipped at 26vh with the trade written into
  `[C14.1]`.
- **Commit:** `774129a`

**3. [Rule 1 - Bug] check 93's private-control floor 60 -> 45**
- **Found during:** Task 1
- **Issue:** the floor was measured against a surface with 26 "what it lands on"
  chooser pills in it. The grid draws 51 private controls on the same board.
- **Fix:** 45, with the count that moved it written at the site and the row's
  own sentence — "a region with no controls at all passes an all-clear
  spotlessly" — restated as what the floor is actually for. **The claim did not
  change.**
- **Commit:** `774129a`

**4. [Rule 2 - Missing assertion] 104c gained 73c's key walk** — probe AN's
finding, commit `c0cc8e9`.

**5. [Rule 2 - Missing assertion] check 95 gained a fourth and a fifth board** —
probes AQ and AX, commits `ba4e45f` and `264119e`.

### Rows whose DRIVE moved, and not one whose CLAIM did

| row | what it pressed | what it presses now |
|---|---|---|
| the played board | four presses per declaration | one press per declaration |
| 95 | `.fg-report` for the moved reading | `.fg-reportbox` |
| 99 | the "who acts" chooser | the action button on the same row |
| 102 | counted `.fg-decl` lines | counts buttons reading `aria-pressed="true"` |
| the mechs' action | `actions[0]` by position | the first action `App.model.needsAt` answers true for |

The last is the one that would otherwise have quietly falsified a label: row
102 claims BOTH sides declare "an action naming who acts and what it lands on",
and the mechs' first action aims at nobody, so under D-27 its declaration names
nobody. Chosen through the shipped derivation so the row and the artifact agree
about which actions have a target at all.

**No row was left red and none was handed to 05-16 red.**

### Judgement calls the plan left open

**6. `[C14]`'s 736px basis not moved.** The plan's task 1 asked for both dials to
be re-derived; the plan's own verification requires `[C14]` to diff EMPTY and
`section_ownership` excludes it. Measured, found still holding, and the
re-measure handed to plan 05-15 at the site — it owns `[C14]` for the change and
the battlefield lands in the same two columns.

**7. `FIGHT_FLOOR` not moved.** The harvest changed (421 -> 411) and is recorded,
but the floor is 120, is not breached, and belongs to plan 05-16.

## Diffs proved empty by line span

```
[C00]–[C14]                8-1403     ->     8-1403      diff EMPTY
[C14.2]…shell           1617-3370     ->  1752-3505      diff EMPTY
[S01] DATA              3408-4112     ->  3543-4247      diff EMPTY  (D-25)
ruleRound + advanceRound 7880-8160    ->  8015-8295      diff EMPTY  (281 lines)
[S06.1]–[S06.6]         9658-12877    ->  9793-13012     diff EMPTY
[S06.8]–[S06.10]       13919-15587    -> 14287-15955     diff EMPTY
[S07.1]–[S07.4]        15588-18538    -> 15956-18906     diff EMPTY
[S07.6]–[S08]          18927-19063    -> 19524-19660     diff EMPTY
```

No shell markup, no shell id, no `[C14]` rule, no `[C14.2]`/`[C14.3]`/`[C15]`
rule and no `[S06.11]`/`[C14.4]` — neither of the last two exists yet and
neither is opened here.

## Threat register outcomes

| Threat | Outcome |
|---|---|
| T-05-57 the overrule leaking off the grid | 95's outside-the-grid clause across five like-for-like boards; **probes AP and AR both drove it and both reddened it once they were faithful** |
| T-05-58 a row's own action disabling itself | condition (b)'s `+ own pledge` with the reason at the site; **probe AQ drove it, found the row blind, and the fourth board closed it** |
| T-05-59 a handler toggling `disabled` | check 95b: the grep, plus a rebuild proving the set is re-derived on NEW nodes, plus an undo the set follows |
| T-05-60 a rendered word explaining a disable | no explanatory text anywhere; a leaf scan of `#fightbar` in both browsers returns `[]`; the reason is arithmetic already on the page |
| T-05-61 a student's action name reddening CI | `fgSay`'s one-node-per-fragment idiom intact, `data-anm` on the name node, the exemption channel on every token label, and the button itself unmarked so the tick stays in the harvest |
| T-05-62 the half-made retarget written into `state` | two root attributes only; **probe AN drove the violation and 104c now names the key** |
| T-05-71 condition (c) or the default off `hp === 0` | D-00d written at both sites; **probes AW and AX drove both, and AX found the row blind until the fifth board** |
| T-05-72 the change flow hiding that `at` may name either side | `fgMayPoint`, one line, with the ruling it narrows, the one-line widening and the heal-shaped example beside it; the op untouched; named as a playtest question |
| T-05-SC npm/pip/cargo installs | zero packages installed; Playwright resolved through `PLAYWRIGHT_DIR` |

## Questions for the playtest, recorded rather than settled

1. **Should the unit itself be pressable?** It is a label today. One arm and one
   node if a room wants it.
2. **Is the topbar's round-and-pools pair one reading too many** now that the
   grid carries its own?
3. **Should the change-target flow be able to point at a friend?**
   `fgMayPoint` is one line and a heal-shaped action is the case that will
   surface it.
4. **Is a 200px grid window at 1366x768 enough** to keep the picker usable, or
   does the round belong somewhere cheaper?
5. **Does a dashed border read as "out of reach" from the back of a room**, or
   does it read as a different kind of control?

## Known Stubs

**One, and it is reserved rather than stubbed.** `.fg-field` — one per side,
built empty, flagged, never replaced, with plan 05-15 named as its owner at the
site. It renders nothing and is invisible on the page (no min-height, no
border), so a student who never sees 05-15's shapes never sees an empty labelled
box either. It does not prevent this plan's goal: every one of D-27's declaration
behaviours is reachable and driven without it. The one thing it does defer is
the LIT half of the change-target flow — until 05-15 ships, what a student sees
change is the change-target control's own pressed state and the row's reading,
which is said in `[S07.5]`'s banner rather than faked here.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND; contains `.fg-field`, `fgActionOff`, `pressAt`,
  `pressBf`, `fgMayPoint`, `spoken for`
- `tests/selftest-node.cjs` — FOUND; contains checks `95.`, `95b.`, `104.`
  through `104f.`
- `.planning/phases/05-fight-loop-playtest/05-14-SUMMARY.md` — FOUND
- commit `774129a` — FOUND
- commit `f7dad68` — FOUND
- commit `c0cc8e9` — FOUND
- commit `b600575` — FOUND
- commit `ba4e45f` — FOUND
- commit `264119e` — FOUND
- `node tests/selftest-node.cjs` exits 0: 1216 passed, 0 failed; 170 of 170
  interaction checks; `git status --short` empty after every probe revert
