---
phase: 05-fight-loop-playtest
plan: 16
subsystem: gate+docs
tags: [gate-surgery, d-27, fight-floor, layer-c, browser-checks, limitations, ref-03, playtest-script]

requires:
  - phase: 05-fight-loop-playtest
    plan: 15
    provides: "the battlefield, the 1216/0 + 180/180 baseline, the 423-string fight harvest and the check-105 numbering hand-off"
  - phase: 05-fight-loop-playtest
    plan: 14
    provides: "D-27's grid, check 95's turned disable contract and 95b, and the fgPick/fgDeclare helpers every fight row now presses through"
  - phase: 05-fight-loop-playtest
    plan: 13
    provides: "App.model.spokenFor / needsAt / defaultAt, which row 102 now reads the surface back against"
  - phase: 05-fight-loop-playtest
    plan: 12
    provides: "the view switch and #views, which rows 93, 93b and 101 now read"
provides:
  - "FIGHT_FLOOR re-measured 120 -> 116 with a fifth history entry, a per-SIDE per-card cost and six named axes"
  - "check 92's harvest taken on a fully dressed board — 423 -> 467 strings — with the dressing ASSERTED rather than hoped for"
  - "every fight gate row rewritten to the claim the shipped surface actually makes, with its reading recorded"
  - "the acceptance run re-driven through the grid, printing the spoken-for reading verbatim through five moments"
  - "116 new browser checks in Chrome and Edge at 1920x1080 and 1366x768 — 22 -> 138 passed, 0 failed"
  - "a MEASURED REF-03 finding: the per-action reference cards are not on the fight tab"
  - "the limitations list re-read entry by entry; 30 CLOSED, 32 reopened, seven new entries 33-39"
  - "05-11's playtest script brought up to date surgically, 38 -> 46 items, still plan 11, still blocking"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "a dial re-measure that varies each roster SEPARATELY and finds the per-card cost is a figure per SIDE rather than one number"
    - "a floor that moves DOWN, with the reason written out — strings moving from the constant into the coefficient is not the same as a floor that has stopped bounding"
    - "a row that asserts the DRESSING of its own board, because a floor cannot tell a dressed board from an undressed one"
    - "a row that asserts a DEFECT in the direction it is true, so a fix reddens it and the paragraph explaining it gets read"
    - "a probe whose three variants measure invisibility, coupling and a silently-dropped clause rather than only 'it goes red'"
    - "a browser check whose settling clause is written against the scroll that ACTUALLY happened rather than the one that was asked for"
    - "a playtest script edited surgically with every edit marked inline, so a reader sees what moved and why without a diff"

key-files:
  created: []
  modified:
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/05-11-PLAN.md
    - .planning/phases/05-fight-loop-playtest/deferred-items.md
    - .planning/REHEARSAL.md

key-decisions:
  - "FIGHT_FLOOR GOES DOWN, 120 -> 116, AND THE REASON IS WRITTEN OUT RATHER THAN THE NUMBER DEFENDED. A falling floor is exactly the shape of a floor that has stopped bounding anything, so the entry says what happened: D-27 retired a form whose cost was mostly roster-INDEPENDENT (three chooser legends, the cost report, the Declare button, the Declared-so-far list with its own legend and empty-list sentence, twice over) and replaced it with a grid whose cost is almost entirely roster-DEPENDENT. The strings did not go away — the same 12-card board read 420 under 05-09 and reads 467 now — they moved out of the constant and into the coefficient"
  - "THE PER-CARD COST IS NOW A FIGURE PER SIDE AND THAT IS THE ENTRY'S FINDING RATHER THAN A DETAIL OF IT. A cat costs 29 and a mech costs 30, measured by varying one roster at a time across eleven boards. The one string of difference is the lit retarget: the drive leaves a change half made on the CATS side, so every MECHS shape is lit and each lit shape says so in a real text node. A plan reading only the totals would have averaged them into 29.125 and got the model wrong — the fifth time running that reading only the totals would have been wrong"
  - "THE FLOOR IS SET AT 116, THE DRESSED READING, AND NOT AT 106, THE UNDRESSED ONE. The token vocabulary is a real axis and the drive PINS it: the board is dressed on every run and row 92 asserts that it was. A floor of 106 would clear a dressed page that had lost every unit on it, which is precisely the failure this floor exists for"
  - "THE COMPACTION AXIS POINTS THE SAFE WAY, MEASURED RATHER THAN ASSUMED. The plan warned that a compacted token row is MORE strings than an uncompacted one, so a floor taken on a fresh board could be cleared mid-fight. Measured on a 4-cat 3-mech board with the cats' health varied: 322 (shipped) / 322 (at 11) / 329 (at 12) / 331 (at 17) / 330 (at 30). Every compacted reading is ABOVE both uncompacted ones, so this axis cannot take the page below the floor. The one-string dip from 331 to 330 is recorded and deliberately not explained"
  - "ROW 92 ASSERTS ITS OWN DRESSING. Probe AS is the argument: with the old drive — nothing declared, no rulings, no retarget, no dressing — the run is 1216/0, 180 of 180, exit 0, and the harvest reads 364 against a floor of 116. A floor cannot tell a dressed board from an undressed one, so the row now reads back the view, the two standing declarations, the disabled buttons, the twelve shapes, the half-made retarget, the lit count and both student-authored words"
  - "THE PLAN'S PREMISE ABOUT THE RENAMED TYPE WAS WRONG AND THE MEASUREMENT IS RECORDED AT THE SITE. It expected a renamed type's word to ENTER the Layer C harvest on a third surface. It does not: every .bf-lbl carries the token-name exemption channel and harvestInto skips it. So the row reads BOTH directions — the words are counted ON THE PAGE (12 labels each) and IN THE HARVEST (0 each) — which is what says the drive reached the battlefield AND that the channel is load-bearing there"
  - "THE ACT PARTITION DID NOT MOVE, AND THAT IS THE FINDING RATHER THAN THE ABSENCE OF ONE. This plan's job was to assume it had. Read off the live handler, D-27 retired four CONTROLS — data-fg=\"declare\", \"clear\", \"by\" and the chooser spelling of \"at\" — and not one ACT. declare and clearDeclaration survive the whole redesign. What moved is the payload and the control count, and neither is row 93's claim"
  - "A HELD ENTER ON AN ACTION BUTTON NEEDS THE SUPPRESSION, AND THE ARITHMETIC IS THE REASON RATHER THAN THE SYMMETRY. The button is radio-semantic, so a hold does not repeat one act — it FLIPS between declare and clearDeclaration at the OS auto-repeat rate. Two different commit labels means D-20's coalescing window does not fold them, so a two-second hold is roughly sixty undo entries. It is already covered by onFightKeyDown's data-fg scope, and row 93c now ASSERTS that rather than assuming it"
  - "ROW 101 ASSERTS A DEFECT IN THE DIRECTION IT IS TRUE. The per-action reference cards are inside the roster columns and the fight view hides those, so REF-03's 'readable without leaving the fight view' is half unserved. The row asserts `all six in a column, none in the band`, so the day somebody moves them the gate reddens and the paragraph explaining it gets read. A row that had simply stopped counting them would have been the fourth green row in this file over a surface nobody was watching"
  - "THE SPOKEN-FOR READING IS PRINTED, NEVER ASSERTED, AND PROBE AU IS WHY — IN THE FILE. Three measured costs of hard-coding the expected string: (a) invisible on the shipped board, 1216/0 and 180 of 180; (b) red on a board a student can make in two presses, with an evidence line that can no longer show the reading; (c) it silently stops asserting the UNDO — a run that never presses undo passes 180 of 180 hard-coded and 179 of 180 verbatim. Half of FIGHT-09 is the reading coming BACK, and an assertion about a string cannot see a direction"
  - "THE BROWSER CHECKS' SETTLING CLAUSE IS WRITTEN AGAINST THE SCROLL THAT HAPPENED. Asking for scrollTop 2400 on a page a few hundred pixels tall does not scroll to 2400; it clamps, and four readings at four clamped offsets look like a strip that never settles. scrollY is read back at every stop and printed beside the top; what is asserted is what holds at any page length — sticky, ancestors visible, never off the top, and consistent per offset REACHED"
  - "THE CHECK-105 GAP IS TAKEN, CONFIRMED AND LEFT OPEN. [S06.7]'s banner names a check 105 this file has never had; the property is asserted by 95b. The fix is one word inside cats-vs-mechs.html and this plan edits that file not at all, so 105 stays unused, the battlefield rows stay at 106-106j, and the gap is the record. deferred-items item 5 carries it with a warning against renumbering into it"

requirements-completed: [FIGHT-03, FIGHT-09, FIGHT-12, FIGHT-13, PROJ-05, REF-03]

duration: 214min
completed: 2026-08-29
---

# Phase 05 Plan 16: GATE SURGERY Summary

**Every row that watches the fight now watches the surface that ships. The floor was
re-measured off the board it actually harvests and came back with a different
SHAPE, not just a different number — the per-card cost is a figure per side now.
The acceptance run presses the grid a student presses and prints back a pool
figure that moves. Two browsers at two sizes agree that a whole round can be
played by clicking. And taking a row to the fight tab for the first time found a
real REF-03 defect that four plans had shipped past.**

## The gate, before and after

| | before (post-05-15) | after |
|---|---|---|
| suite | 1216 passed, 0 failed | **1216 passed, 0 failed** |
| `SUITE_FLOOR` | 1186 | 1186 — **not moved**; this plan adds no `[S09.*]` row |
| interaction gate | 180 of 180 | **180 of 180** — no row added, twelve rewritten |
| stub-drift | 114 shell ids | **114 — unchanged, no id added** |
| `#app` (setup) | 128, floor 117 | **128, floor 117 — unchanged** |
| `#app` (fight) | 423, `FIGHT_FLOOR` 120 | **467, `FIGHT_FLOOR` 116** |
| dialogs | 145 across 4 roots, floor 138 | 145 across 4 roots, floor 138 — unchanged |
| proposal pane | 60, floor 23 | 60, floor 23 — unchanged |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 8016 literals, 0 hits | 8016 literals, **0 hits** |
| no-writer gate | 58 ops, 26 arms, 497 records | unchanged |
| perf | — | 100 commits in 6 ms (budget 50) |
| **browser checks** | 22 passed, 0 failed | **138 passed, 0 failed** |

`node tests/selftest-node.cjs` exits 0.
`PLAYWRIGHT_DIR=... node tests/browser-checks.mjs` reports **138 passed, 0 failed**.
Run with Playwright unresolvable it still prints the SKIP line and exits **0** — verified, not assumed.

**`counter|balanc|rating` 0, whole document. `url(` 0. `innerHTML` 0. One classic
`<script>`, one `<style>`. `git diff 963559b..HEAD -- cats-vs-mechs.html` is
EMPTY — this plan edits the artifact not at all. `DEFAULTS.cats.ap` untouched (D-25).**

## Task 1 — check 92's drive, and FIGHT_FLOOR's fifth entry

### The drive, re-pointed

The harvest is now taken on a board that is DRESSED before `startFight` and
asserted afterwards. Every piece of the dressing is there because a specific
class of string is unreachable without it, and each arrives through a real op:

| what | why it is there |
|---|---|
| `shield` renamed to `Ward` | a renamed type's word on a third surface |
| an INVENTED type `Zeal`, unit-scoped, with a tally | D-24's no-second-tier, and the vocabulary axis |
| a shield allocated | so the battlefield's second line is drawn rather than hidden at zero |
| declarations standing on BOTH sides at harvest | probe X's finding — the landing readings, cost nodes and requirement sentences exist nowhere as literals |
| one unit RULED dead, one at zero health UNRULED | the marker, its accessible name and the still-standing reading, all three at once |
| a retarget HALF MADE on the cats' side | the lit state's real text node on every opposing shape, plus the change-target label |
| at least one action button DISABLED | the one state this walk had never read |
| the view asserted to be on the fight tab | plan 05-12's edge; a harvest of a hidden region loses every string at once |

**Row 92's reading, verbatim:**

```
harvested 467 strings from #app with a fight running (floor 116)
| the view followed startFight=true | declarations standing=2
| action buttons disabled on the cats grid=3 | battlefield shapes painted=12
| a change of target is half made=true and the opposing shapes lit=3
| the INVENTED type is drawn on 12 labels and harvested 0 times;
  the RENAMED one is drawn on 12 labels and harvested 0 times
; board after endFight is byte-identical to the board before startFight
```

**Two corrections the measurement forced, both recorded at the site rather than fixed quietly:**

1. **The at-button lookup was on the wrong row.** `advanceRound` empties the
   declaration list, so the only cats declaration standing when the retarget
   runs is the one made *after* the Advance. Pressing the first row found no
   control at all and `halfMade` came back `false` on the first run.
2. **A renamed type does NOT enter the harvest.** The plan expected it to. Every
   `.bf-lbl` carries the token-name exemption channel and `harvestInto` skips
   it — the same marker doing its job that the 41→56, 83→108 and 108→120 entries
   each recorded about a different node. So the row reads BOTH directions
   instead: on the page (12 each) and in the harvest (0 each).

### FIGHT_FLOOR: 120 → 116, and the derivation

Measured on ONE artifact, rosters trimmed **before** `startFight`, varying each
roster **separately** — which is the instruction this entry adds to the method,
because the two sides no longer cost the same.

```
cats varied, mechs held at 3     cards  strings  delta
  2 cats                            5     264
  3 cats                            6     293     +29
  4 cats                            7     322     +29
  5 cats                            8     351     +29
  6 cats                            9     380     +29
  9 cats                           12     467     +29 x3

mechs varied, cats held at 9
  2 mechs                          11     437
  3 mechs                          12     467     +30
  4 mechs                          13     497     +30
  5 mechs                          14     527     +30
  6 mechs                          15     557     +30
```

**A cat costs 29, a mech costs 30**, and the one string of difference is the lit
retarget landing on one roster and not the other.

**The roster-independent part is 116 and it reproduces every board measured:**

| cats × mechs | 29c + 30m + 116 | measured |
|---|---|---|
| 1 × 1 | 175 | 175 |
| 2 × 2 | 234 | 234 |
| 2 × 3 | 264 | 264 |
| 3 × 3 | 293 | 293 |
| 4 × 4 | 352 | 352 |
| 6 × 6 | 470 | 470 |
| 9 × 3 | 467 | 467 |
| 9 × 6 | 557 | 557 |

**The six axes, three of them new, each measured with its direction:**

| # | axis | direction | measurement |
|---|---|---|---|
| 1 | the action count | up, both figures | 3/4/5 cat actions → 322/331/340 on a 4×3 board; +9 an action, 2 per cat row |
| 2 | resolved rounds | up | the drive resolves exactly one; 116 is at the floor of it |
| 3 | the number of sides | fixed at 2 | — |
| 4 | **the picker is a PRODUCT** | up | a unit is one row plus one button per action, so per-card moves with axis 1 |
| 5 | **the battlefield + compaction** | up | 322 / 322 / 329 / 331 / 330 at hp shipped / 11 / 12 / 17 / 30 |
| 6 | **the token vocabulary** | up, and this drive PINS it | undressed 298, dressed 322 on a 4×3 board → K 106 vs 116 |

**Why it fell.** D-27 moved strings out of the constant and into the coefficient.
The same 12-card board read **420** under plan 05-09 and reads **467** now, while
the constant behind it went 120 → 116. A page whose two grids and two
battlefields went dark entirely reads exactly 116 and trips it; the smallest
board this file can produce clears it by 59.

### PROBE AS — the harvest with nothing declared

**Applied:** the dressing, both rulings, all four declarations and the retarget
removed from the drive; the row's assertion put back to the three clauses it
carried before this plan.

**Reading, verbatim:**

```
1216 passed, 0 failed
PROBE AS: declStanding=0 disabled=0 halfMade=false lit=0 shapes=12
          invented on page=0 renamed on page=0
scan: 364 rendered strings read from #app WITH A FIGHT RUNNING (Layer C, floor 116)
interaction gate: 180 of 180 checks passed
EXIT=0
```

**The finding is the GREEN**, in probe X's and probe U(c)'s register: the
old-shaped row is spotlessly green over a board where nothing is declared,
nothing is ruled, no retarget is half made, no shape is lit and neither student
word is on the page. The harvest clears a floor of 116 by 248. That is the
measurement that says the drive is load-bearing, and it is why row 92 now asserts
its own dressing. One detail worth keeping: `shapes=12` — the battlefield IS
painted on a bare `startFight`, so it is the only part of the dressing a floor
alone would have seen.

**Reverted** by `cp` from a scratchpad snapshot; `git status --short` clean.

### PROBE AT — one grid string rendered as a single node

**Applied:** `fgActBtn`'s two nodes — the marked action-name node and the cost
node — collapsed into ONE unmarked text node, which is exactly what a tidy
refactor of that function looks like. `slash` renamed to `Winner` through the
real `renameAction` op in the drive, and declared through the real op.

**Reading, verbatim:**

```
FAIL  interaction gate :: 92. Layer C reads the page a SECOND time ...
      [winner] in "Winner 1 Action points" (read from #app) | (x9)
      | harvested 467 strings ... | the view followed startFight=true
      | declarations standing=2 | action buttons disabled on the cats grid=3
      | battlefield shapes painted=12 | a change of target is half made=true
        and the opposing shapes lit=3 | ...
interaction gate: 179 of 180 checks passed
EXIT=1
```

**Nine hits, one per cats unit.** The harvest reaches the grid; the drive is
correct; the exemption channel on the action-name node is load-bearing rather
than decorative. **Reverted** from snapshots of both files; tree clean.

### Every other floor, re-read

| floor | reading | moved? |
|---|---|---|
| `SUITE_FLOOR` 1186 | 1216 | no — nothing roster-independent was added to the suite |
| `#app` setup floor 117 | 128 | no — this plan paints nothing |
| `DIALOG_FLOOR` 138 | 145 across 4 roots | no — no dialog added, none changed |
| `PROPOSE_FLOOR` 23 | 60 | no |
| `FIGHT_FLOOR` 120 | 467 | **yes → 116**, derived above |

## Task 2 — every fight row, old claim and new claim

| row | what it asserted | what it asserts NOW | its reading |
|---|---|---|---|
| **93** act partition | six ops named, walked over `#fightbar`/`#ledger`/`#board` | **the same six, RE-READ off D-27's surface and recorded as unmoved** — what the redesign retired was four CONTROLS, not one act — plus `#views` as a fourth root and `data-vw` in the private count | acts found `["nudgeAp","ap","nudgeMaxHp","maxHp","nudgeShield","shield","startFight"]`; UI-only `[]`; parked `[]`; **private controls 65** (floor 45) |
| **93b** listeners | two roots, two floors | **three roots, three floors**; `#views`' floor is 1 because it binds one delegated listener and never had two | `#fightbar`=3, `#board`=3, **`#views`=2**; none bound outside the boundary |
| **93c** the keyboard ramp | Advance + the alive toggle | **plus an ACTION BUTTON**, with the cost written out: a hold FLIPS a declaration, two commit labels, an undo entry per flip. Covered by `data-fg` SCOPE, and now asserted rather than assumed | repeat cancelled `true`; first press cancelled `false`; **action-button repeat cancelled `true`**, its first press `false`; the declaration `"true" -> "true"`; rounds resolved by the hold 0 |
| **94** ledger attributes | no `data-k`/`act`/`amt`/`.brd-value`/`.brd-line--opt` in `#ledger` | **unchanged**, and probe AG's measured cost kept verbatim at the site: `keyed(#board)` survives, `keyed(#app)` returns a ledger row | rows 2, leaf strings 159, attributes found `[]` |
| **94b** key uniqueness | every `data-k` unique, floor 120 | **unchanged claim, and the key space recorded as a PRODUCT** of units × actions plus one per shape; the floor deliberately NOT raised to the reading | **149 keys** (floor 120), duplicates `[]` |
| **96** Advance moves state AND page | state + page fingerprint + round + ledger | **plus the grid's spoken-for reading through idle/declared/resolved** | round `"1" -> "2"`; ledger 0 → 1; team reading `"Action points 0 of 3 spoken for 3 left to spend"` → `"...1 of 3 ... 2 left..."` → back |
| **97** D-13's rendered half | a leaf walk over `.dc-live` | **plus a leaf walk over BOTH grid columns**, where the risk moved: every picker row already names a unit on the opposing roster | live boxes 1, leaves 11, naming both `[]`; **grid leaves 214, naming both `[]`** |
| **98** the dead marker | four readings on the board's unit card | **plus a FIFTH on the other tab**: a ruled unit's buttons are all out of reach, a zero-health unruled unit's are all live | c1 zero health unruled **0 of 3** out of reach; c2 ruled dead **3 of 3**; c2 ruled back **0** |
| **99** focus over a rebuilt list | the retired chooser | **the grid's action button**, plus the recorded note of WHICH path it is green about — the pointer path drops to `<body>` file-wide | key `"fg/act/cats/c1/slash"`, node replaced `true`, keyboard on the same key, reads as chosen `"true"` |
| **100** an op that redraws without a stepper | the bar says the new action name (found once) | **counted across every button of that side** | bar moved `true`, says the new name on **9 of 9** buttons; ledger moved and says the new token name; the already-drawn row is the SAME node |
| **101** REF-03 with a fight played | six cards present with text | **taken ON THE FIGHT TAB — and it found a defect.** Asserts the view, the six cards, AND that all six are inside a hidden roster column with none in the band | view `"fight"`; **6 cards, 0 in `#refband`, 6 in a roster column**; 17 leaf strings; `#refband` still readable, 3 leaves |
| **102** the acceptance run | two declarations of one kind, six values, the pool line verbatim | **two declarations of two KINDS** (a one-press default, and a retarget by real presses), **the default read back against `App.model.defaultAt`**, and **the spoken-for reading verbatim through FIVE moments** | below |
| 95, 95b | plan 05-14's | **not touched.** Recorded: 95 compares 149 controls, outside/inside both true, funded/cannot-pay/ruled-dead all true; 95b reads the property 0 times over 35 239 characters, 24 buttons out of reach after a declaration | — |
| 103, 103b, 103c | plan 05-12's | re-read, unchanged | view attribute + both controls' state + byte-identical state; `#strip`/`#refband` in neither side of the switch; the view follows a fight across both edges and not between them |
| 104–104f | plan 05-13/05-14's | re-read, unchanged | the default lands on `"m1"` and `defaultAt` agrees; the default skips a dead-ruled enemy and not a zero-health one; the change-target press dispatches nothing; the battlefield press moves only what the declaration points at; nothing is disabled by the flow (150 controls compared) |
| 106–106j | plan 05-15's | re-read, unchanged | 9/3 shapes against the roster; the shape draws the FIGHT's health 6→4 while the board stays 6; an authored type drawn as authored and harvested 0 times; `COMPACT_AT` 12; a ruled unit still drawn; the lit set equals the opposing roster; **12 battlefield keys inside the 149 unique**; nothing disabled; delta rather than rebuild |

### Row 102's own reading, verbatim

```
declaration lines on the page=2
| DECLARATION ONE, one press: the record says at="m1" and
  App.model.defaultAt says "m1"; the row reads "Lands on Mech 1."
| DECLARATION TWO, retargeted by real presses: "c1" -> "c9" with 9 opposing
  shapes lit at the moment of the click; the row now reads "Lands on Cat 9."
| THE SPOKEN-FOR READING, VERBATIM, THROUGH FIVE MOMENTS:
    idle           "Action points 0 of 3 spoken for 3 left to spend"
 -> declared       "Action points 1 of 3 spoken for 2 left to spend"
 -> undone         "Action points 0 of 3 spoken for 3 left to spend"
 -> declared again "Action points 1 of 3 spoken for 2 left to spend"
 -> resolved       "Action points 0 of 3 spoken for 3 left to spend"
| THE SIX: round="2"
  cats pool="CatsAction points0 of 3 spent3 left to spend"
  mechs pool="MechsAction points0 of 3 spent3 left to spend"
  m1 health tokens=6 ledger rows=1
  what changed="Cats Cat 9 — Health 3 to 0. Mechs Mech 1 — Shield 3 to 2."
| the hand marker is shown=true and says "Set by hand"
| the health row beside it is the BUILD allocation and did not move: 6 -> 6
| ... after the fight reset: round="1" ledger rows=0 cards=9 build byte-identical=true
```

**Both pairs are printed and neither is the other.** The topbar pair still reads
`0 of 3 spent`, deliberately, because that is a shipped fact about `advanceRound`
spending and refilling in one commit. The grid pair MOVES. That is limitations
entry 30 closed by measurement.

### A REAL DEFECT, found by row 101 — REF-03 is half unserved on the fight tab

The first time any row in this repository read the reference cards **with a
view**, this came back:

```
the view while this reading is taken="fight"
| action and reference cards on the board=6
  of which inside #refband=0
  and inside a roster column (which the fight view hides)=6
| leaf strings still readable in #refband on the fight tab=3
```

`refCard()` is appended by `buildColumn()` into `#col-cats` / `#col-mechs`, and
`[C15]` writes `#app[data-view="fight"] .brd-col{display:none}`. So the six cards
that say what Slash does, what it costs and what it damages are on the page and
off the screen for the whole of a fight. `#refband` and `#strip` survive because
they are children of `#board` rather than of a column.

**Why it went unseen for four plans:** `buildColumn`'s own cross-plan comment
(plan 03-05) states the premise — *"a student reading what Lasers does needs it
at least as much mid-fight as mid-build — which is REF-03, in Phase 5"* — and it
was true for three phases. Plan 05-12 put the columns behind a switch and nothing
read them with a view, so nothing went red.

**Not fixed here** (this plan edits the artifact not at all). Logged with its
measurement and two candidate fixes as `deferred-items.md` item 4, surfaced in
05-11's item 29, and **asserted in the direction it is true** so a fix reddens the
row rather than passing quietly.

### PROBE AU — the pool line asserted rather than read back

Three variants, each measured:

| variant | what was done | reading |
|---|---|---|
| **AU(a)** | the reading hard-coded against an expected string, the four comparisons dropped | **1216 passed, 0 failed; 180 of 180.** The substitution is invisible on the shipped board |
| **AU(b)** | the same, on a board with the cats' pool set to 5 — two presses for a student | **179 of 180.** Red on a correct surface — and the evidence line then reads `the spoken-for reading matched the expected string=true`, because a row that asserts a string has no reading left to print |
| **AU(c)** | the undo drive removed, run against both forms | **hard-coded: 180 of 180. Verbatim: 179 of 180.** The hard-coded form silently stops asserting the UNDO |

AU(c) is the argument in two numbers: half of FIGHT-09 is the reading coming
**back**, and an assertion about a string cannot see a direction. **Reverted**,
and the probe is written into row 102's banner rather than only into this summary
— because the next reader of that row will have the same tidy-up idea.

### The limitations list

| entry | what happened |
|---|---|
| **5** | re-read with the tab built. What the fight harvest now covers is named (view, dressing, rulings, retarget, disabled), and **three kinds** of what it still does not: static markup, copy behind an undriven interaction, and — new — **a word a MARKED node carries**, which the exemption channel makes structurally unreachable |
| **13** | re-read; the undriven list is **longer**, not shorter: a fight past two rounds so a record rolls off `MAX_PAST_ROUNDS`; a declaration naming nobody on an emptied board; a cost in an invented type; a requirement unmet in an invented type; `fgGoneTerm`'s refusal line; every error-panel line |
| **21** | **rewritten a second time.** The tab is the structural answer — board top 844→**301** at 1080 and 730→**293** at 768. What it did NOT fix is stated as plainly: the fight tab's own budget, the newest round still not fitting whole at 768, the fight-and-board-on-two-tabs trade, and the REF-03 finding |
| **24** | **sharper.** When it was written, "how this file draws a control a student may not use" was hypothetical on the fight page. It is not: a real disabled treatment now sits a few hundred pixels from the dimmed past rounds, so a student can compare the two dimmings side by side |
| **30** | **CLOSED, and rewritten rather than deleted** so the closure is legible. Which half still holds (the topbar pair, by design) and which closed (the grid pair) with the five-moment reading printed in the entry |
| **32** | **reopened in a different form.** Finding the declaration STEP is answered — there is one row per unit and one button per action. Finding the **TAB** is not, and the undriven case is a student who has switched back to the board to make a ruling |
| **33–39** | **NEW, seven entries**, for what only a room can settle: whether a disabled action reads as *the board says no*; whether `units × actions` buttons is a wall; whether a student notices a target was chosen and whether *Change target* reads as a change or a correction; whether a lowest-health default nudges toward focus fire; whether the battlefield and the picker compete; whether tokens are legible at battlefield scale; whether it all holds at 24-a-side on a projector |

## Task 3 — browser checks, and 05-11's script

### `tests/browser-checks.mjs`: 22 → 138 passed, 0 failed

Header, `PLAYWRIGHT_DIR` loader and skip contract **untouched**; skip-cleanly
re-verified (exit 0 with the SKIP line). Fourteen new checks × four combinations
(Chrome/Edge × 1920×1080/1366×768) = **116 new**.

| # | check | assertion |
|---|---|---|
| 4 / 4b | the tab | both controls switch the view; `#views`, `.fg-band`, `#board` share one column |
| 5 / 5b | the grid's order | each column `[SIDE]` → battlefield → team → picker rows by **measured top**; `[ROUND]` above both; columns side by side, cats' left measured against mechs' |
| 6 / 6b | the product | one row per unit, `units × actions` buttons; the grid's box inside the viewport — on 9-and-3 **and** at 24 a side |
| 7 / 7b / 7c | the battlefield | one labelled shape per unit per side, every box non-zero; **Cats' cluster measured LEFT of Mechs'**; every token mini-shape has a real box |
| 7d | they really are CSS shapes | Health restyled to a hexagon through the real op → a real `polygon()` clip-path, and it goes back |
| 8 | dead stays drawn | ruled through the board tab, read on the battlefield: still there, box intact, marked, sentence shown |
| 9 | the board mid-fight | `#board`'s top recorded rather than thresholded |
| 10 / 10b | `#strip` pins | sticky, every ancestor `overflow: visible`, never off the top, consistent per offset reached — in **both** views; `#refband` a real box in both |
| 11 | a full round by real clicks | both readings move, round 1→2, one ledger row |
| 12 / 12b / 12c / 12d | the change-target flow | the lit set equals the opposing roster and none of its own, read from computed style AND the real text node; a real click moves the target and the lights go out; two presses cancel; re-pressing the action takes declaration and target away |
| 13 | disabled without colour | differs in the property and in **three** non-hue channels |
| 15 | an authored type | hex + violet + the authored glyph + the authored name, with a real clip-path and 4 tokens |
| 16 | errors | page errors and console errors `[]` on every run |

### The four-column table

| reading | Chrome 1920×1080 | Chrome 1366×768 | Edge 1920×1080 | Edge 1366×768 |
|---|---|---|---|---|
| `#views` / `.fg-band` / `#board` left/width | 152/1600 | 14/1322 | 152/1600 | 14/1322 |
| cats column tops head/field/team/rows | 417/513/891/976 | 409/505/884/969 | 417/513/891/976 | 409/505/884/969 |
| mechs column tops | 417/513/742/827 | 409/505/735/820 | 417/513/742/827 | 409/505/735/820 |
| grid 9-and-3 rows cats/mechs | 9/3 | 9/3 | 9/3 | 9/3 |
| grid 9-and-3 buttons cats/mechs | 27/9 | 27/9 | 27/9 | 27/9 |
| `.fg-sides` top/height/bottom vs viewport | 415/281/696 of 1080 | 407/200/607 of 768 | 415/281/696 of 1080 | 407/200/607 of 768 |
| **battlefield 9-and-3 cluster heights** cats/mechs | **363/214** | 363/214 | 363/214 | 363/214 |
| battlefield 9-and-3 cluster lefts cats/mechs | 173/521 | 35/383 | 173/521 | 35/383 |
| dead shape box | 262×90 | 262×90 | 262×90 | 262×90 |
| **`#board` top mid-fight** | **301 of 1080** | **293 of 768** | 301 | 293 |
| `#strip` top @scroll (build) | 301 / 267 / 261 / 247 | 293 / 259 / 253 / 239 | same | same |
| **`#strip` top @scroll (fight)** | **690 / 672 / 409 / 235** | **787 / 754 / 737 / 502** | 690 / 672 / 408 / 235 | **608 / 590 / 573 / 313** |
| scrollY reached (fight) | 186/204/467/641 max 741 | 0/33/50/285 max 889 | 186/204/468/641 max 741 | **179**/197/214/474 max 889 |
| `#refband` box, both views | 1600×120 | 1322×120 | 1600×120 | 1322×120 |
| cats team reading idle → declared | `0 of 3 spoken for / 3 left` → `1 of 3 / 2 left` | same | same | same |
| mechs row landing reading | `Lands on Cat 1.` | same | same | same |
| round by real clicks | 1 → 2 | 1 → 2 | 1 → 2 | 1 → 2 |
| lit shapes / roster | 9/9 | 9/9 | 9/9 | 9/9 |
| change-target reading | `Lands on Cat 1.` → `Lands on Cat 9.` | same | same | same |
| disabled vs enabled, channels differing | opacity, borderStyle, cursor | same | same | same |
| disabled / enabled opacity | 0.45 / 1 | 0.45 / 1 | 0.45 / 1 | 0.45 / 1 |
| grid 24-a-side rows / buttons | 24/24, 72/72 | 24/24, 72/72 | 24/24, 72/72 | 24/24, 72/72 |
| **battlefield 24-a-side cluster heights** cats/mechs | **884/1779** | 884/1779 | 884/1779 | 884/1779 |
| authored type on the battlefield | `Zeal / tok--hex tok--violet / 12×12 / polygon(...)` | same | same | same |

**WHERE THE TWO BROWSERS DISAGREE — one place, and it is about SCROLL, not
layout.** Every layout number above is byte-identical between Chrome and Edge at
every size. In the fight view at 1366×768, `window.scrollTo(0, 0)` reached
scrollY **0** in Chrome and **179** in Edge, so Edge reports the same strip on a
page already scrolled. At 1920×1080 the two agree to one pixel. Both satisfy the
assertions (never off the top; consistent per offset reached). Recorded rather
than reconciled.

**Three findings from the numbers:**

1. **`#strip` in the fight view still starts below the fold at 1366×768** —
   787 of 768 in Chrome. Improved by 216px at 1080 (906 → 690). This is the
   re-measure `deferred-items.md` item 3 handed to plans 05-14 and 05-15;
   neither took it, so this plan did. Updated there with both readings.
2. **At 24 a side the battlefield clusters are 884px and 1779px**, inside a
   `.fg-sides` box that is 281px/200px and scrolls on itself. Recorded in
   `REHEARSAL.md` B3 as a room question.
3. **`#board`'s top mid-fight is 301/293** against 844/730 before the tab. The
   viewport budget is not tight any more; it is not a budget.

### Three corrections the browser checks needed, each recorded at its site

- **The shipped board draws every token as a square**, so the clip-path clause
  was vacuous on it. Split: the box claim is unconditional, and check **7d**
  restyles Health to a hexagon through the real op so the shape claim is
  exercised.
- **The repaint must be AWAITED between the op and the reading.** Doing the
  restyle, invalidate, flush and read inside one synchronous `evaluate` read the
  node as it stood *before* the frame landed. `openDialogs`' recorded lesson
  arriving through a fifth door.
- **`GLYPHS[0]` is the empty string** — "none, the shipped board, and the honest
  default" — so a type authored with it draws no glyph node at all.
- **`resetFight` leaves the fight RUNNING**, so `#fight-start` stays disabled and
  the next click waits thirty seconds for a control doing exactly what it should.
  An `endFight` helper was added with the reason at the site.

### `05-11-PLAN.md` — surgical, 24 inline `[D-27 EDIT]` marks

**Still plan 11. Still `wave: 11`. Still `checkpoint:human-verify gate="blocking"`.
Its playtest core — two played fights, hot-seat, adjudicated as a student would,
judged on whether the shipped default feels contested — is untouched, and
`DEFAULTS.cats.ap` is still untouched (D-25).**

| where | edit |
|---|---|
| task name + item ranges | thirty-eight → **forty-six** items, throughout |
| a banner at the top | says what moved and why, and that the playtest is not diluted |
| the pre-rehearsal figures | re-quoted from this plan's final run, including `FIGHT_FLOOR` 120 → 116 and browser checks 138/0 |
| `<what-built>` | the tab, the battlefield, one-press declaration, team resources, the default target, the disable — and **the two clauses that came off the never-does list, both on the developer's own word** |
| **item 2** (PROJ-05) | re-pointed at what is actually in front of them: battlefield + strip + band on one tab, unit cards one press away |
| **item 3** (D-23) | **rewritten.** The overrule's exact scope (three conditions, grid only), where the old rule still stands (Advance still lets a side over-commit), and the two open questions |
| **item 14** | **replaced.** The tab dissolved it (measurements quoted); what is left is whether anything you need at once is now on two tabs |
| item 15 | re-pointed: on the fight tab "the live board" is the battlefield and the two picker columns |
| **item 20** | **rewritten** onto the spoken-for reading, plus whether watching it come down teaches the team-resource lesson |
| item 25 | the two view controls are in their own row; the machine half is closed, the narrow-window half is not |
| **item 29** | carries a **measured half-no** and the two candidate fixes |
| section C header | the *"no browser in this repo"* premise corrected; items split into machine-closed and human-only; the limitations list's own renumbering named |
| **section F, NEW** | **items 39–46**, one per open D-27 call: the lowest-health default (verbatim), the opposing-side-only target flow, the read-only battlefield, two health readings on two tabs (verbatim), the unit name as a label, the round in two places, the vanished Clear, requirements read on the caster side |
| acceptance criteria, resume signal, verification, output | item range, verbatim list (+39, +42), and three new criteria |

### `.planning/REHEARSAL.md` B3 and `deferred-items.md`

- **B3** gains a second measured table (the tab's before/after in both browsers at
  both sizes) and a rewritten "what only the room can answer" list: the
  below-the-fold projection at 768, the 884/1779 clusters at 24 a side, 144
  buttons on a projector, the two-tab trade, and the REF-03 finding.
- **`deferred-items.md`** gains **item 4** (REF-03 on the fight tab, with the
  mechanism, why it went unseen and two candidate fixes) and **item 5** (the
  check-105 dangling reference), and **item 3** gains the re-measurement that two
  plans owed.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — Bug] Check 92's retarget press was aimed at a row with no control on it**
- **Found during:** Task 1
- **Issue:** `advanceRound` empties the declaration list, so after the second pair
  of declarations the only cats declaration standing is on the LAST cat. The
  drive pressed the change-target control on the FIRST cat's row, where no such
  control is drawn; `halfMade` read `false`.
- **Fix:** the lookup moved to `fightCatIds[fightCatIds.length - 1]`, with the
  reason written at the site rather than fixed silently.
- **Commit:** `ec3c4ce`

**2. [Rule 1 — Bug] `App.model.defaultAt` was called with the wrong argument in row 102**
- **Found during:** Task 2
- **Issue:** called with the whole state rather than the fight slice; it returns
  `null` for anything that is not a fight slice, so the run was red for a reason
  that had nothing to do with the surface.
- **Fix:** called with `A.state.get().fight`, the same argument `[S06.7]` uses,
  with a note at the site.
- **Commit:** `f0cfc96`

**3. [Rule 3 — Blocking] `resetFight` leaves the fight running, so the browser checks hung**
- **Found during:** Task 3
- **Issue:** `#fight-start` is disabled while a fight is running, so the 24-a-side
  step waited out a 30-second click timeout and the run crashed.
- **Fix:** an `endFight` helper, with the reason and the mid-fight-`addUnit`
  caveat written at the site.
- **Commit:** `a7167ce`

**4. [Rule 1 — Bug] Two browser checks asserted things the shipped board cannot show**
- **Found during:** Task 3
- **Issue:** (a) every shipped token draws as a square, so the "non-square token
  has a clip-path" clause was vacuous; (b) `GLYPHS[0]` is the empty string, so a
  type authored with it has no glyph node.
- **Fix:** the clip-path claim split into an unconditional box claim plus a new
  check 7d that restyles through the real op; the glyph chosen as the first
  non-empty one. Both recorded at their sites.
- **Commit:** `a7167ce`

### Corrections to the plan's own premises, recorded rather than worked around

**1. A renamed token type does NOT enter the Layer C harvest.** The plan expected
it to ("this is where a renamed type's word enters the harvest"). Measured: every
`.bf-lbl` carries the exemption channel and `harvestInto` skips it. Row 92 now
reads both directions instead, which is a stronger claim than the one asked for.

**2. The act partition did NOT move.** The plan expected "the surface now
dispatches a different set". Read off the live handler, the six are unchanged;
D-27 retired four controls and no acts. Recorded as the finding.

**3. `check 93c`'s control still exists.** The plan expected it to press "a
control that may no longer exist". Advance survives; the row gained an action
button rather than being re-pointed.

## Threat Flags

None. This plan created no network endpoint, no auth path, no file access and no
schema change — it edits `cats-vs-mechs.html` not at all, and both test files are
dev-only and unshipped.

## Known Stubs

None.

## Self-Check: PASSED

Files:
- FOUND: `tests/selftest-node.cjs`
- FOUND: `tests/browser-checks.mjs`
- FOUND: `.planning/phases/05-fight-loop-playtest/05-11-PLAN.md`
- FOUND: `.planning/phases/05-fight-loop-playtest/deferred-items.md`
- FOUND: `.planning/REHEARSAL.md`

Commits:
- FOUND: `ec3c4ce` check 92 re-driven, FIGHT_FLOOR's fifth entry
- FOUND: `f0cfc96` every fight row rewritten, the acceptance run re-driven
- FOUND: `997e344` probe AU recorded at row 102
- FOUND: `a7167ce` browser checks, 22 → 138
- FOUND: `85ac8ca` 05-11's script, REHEARSAL B3, deferred-items 3 and 4
- FOUND: `819c9fc` the check-105 gap logged as deferred-items item 5

Gates:
- `node tests/selftest-node.cjs` — **1216 passed, 0 failed**, interaction gate **180 of 180**, exit 0
- `node tests/browser-checks.mjs` — **138 passed, 0 failed** with `PLAYWRIGHT_DIR` set; **exit 0 with the SKIP line** without it
- `git diff 963559b..HEAD -- cats-vs-mechs.html` — **empty**
- `counter|balanc|rating` 0; `url(` 0; `innerHTML` 0; one `<script>`; one `<style>`
