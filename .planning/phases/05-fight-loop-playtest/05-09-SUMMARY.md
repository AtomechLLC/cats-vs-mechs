---
phase: 05-fight-loop-playtest
plan: 09
subsystem: ui
tags: [s06-9, c14-3, fight-04, fight-05, fight-06, fight-07, fight-10, proj-05, d-22, fight-floor, viewport-budget]

requires:
  - phase: 05-fight-loop-playtest
    plan: 05
    provides: "the ruling record { side, unit, tok, from, to } on the round, the four hand ops, and setByHand() proved derivable from state alone — the read this plan renders from"
  - phase: 05-fight-loop-playtest
    plan: 06
    provides: "#fight-said, reserved by name for this plan, and [C14]'s frame with [C14.3] left free"
  - phase: 05-fight-loop-playtest
    plan: 07
    provides: "[S06.7]'s control register — every fight control takes a .fg- class and a PRIVATE data-*, and not one of them carries data-act"
  - phase: 05-fight-loop-playtest
    plan: 08
    provides: "FIGHT_FLOOR 108, the marginal cost of a unit card at 14, check 92's drive that PLAYS a round, and the three-dial layout budget with its measurements"
  - phase: 02-allocation-board
    plan: 01
    provides: "unitCard, amountFor, syncRow, makeToken/styleFor and the zero-tally hide pass whose third input records the focus-drop bug this plan must not repeat"
provides:
  - "[S06.9] — the dead marker drawn from the stored flag, the alive toggle outside everything the marking hides, the by-hand marker derived from the round's ruling list, FIGHT-10's line at two sites, and PROJ-05's live fight reading"
  - "[C14.3] — the .dc- rules, and a fourth height dial on a different axis from the other three"
  - "amountFor's `dead` arm, above the build-roster early return, drawn from state.fight and never from health"
  - "turnsToWipe's third argument USED, which discharges D-22's actual consequence — it is neither left unused nor retired"
  - "FIGHT_FLOOR 108 -> 120; the marginal cost of a unit card on the fight page 14 -> 25; fight harvest 276 -> 420"
  - "the finding that harvestInto reads aria-label, so a marker that says its state twice is READ twice"
  - "REHEARSAL.md B3 rewritten from a dial question into a measured structural decision"
affects: [05-10, 05-11]

tech-stack:
  added: []
  patterns:
    - "a per-frame pass with NO fingerprint, because the region rebuilds nothing — every write is an idempotent property, attribute or class on a node that goes on existing, and only text is written conditionally"
    - "append-if-missing rather than a build-once flag, for a node placed inside a region structure() throws away: the presence of the node IS the flag"
    - "a bound taken on a DESCENDANT of the sticky element rather than on an ancestor — the sticky gotcha pointing the other way for the first time in this phase"
    - "a marker that says its state twice costs the rendered-page walk twice, because aria-label is in LABEL_ATTRS"
    - "a requirement RECONCILED rather than chosen, with both collapses spelled out at the site so the developer's answer is one comment either way"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - .planning/REHEARSAL.md

key-decisions:
  - "THE DEAD MARKER IS ONE NEW ARM IN amountFor AND NOTHING ELSE. It draws through the shipped makeToken / styleFor / syncRow path, so the marker, its entry animation, its compact mode and its restyle all come free and there is no second token painter anywhere. The arm sits ABOVE `if (!unit) return 0` for a reason that is NOT the one the arm above it gives: its owner is the FIGHT roster and that guard is about the BUILD one. The two rosters carry the same ids today, so the wrong placement would look correct on the shipped board and be wrong the moment addUnit or removeUnit is used mid-fight — which is the very thing FIGHT-10's line exists to say is possible"
  - "FIGHT-10'S LINE IS PERMANENT WHILE A FIGHT RUNS RATHER THAN RAISED BY AN EDIT, and the first reason is mechanical: `the build was edited during this fight` is NOT DERIVABLE. sideFromBuild copies build into fight once at startFight and the fight's numbers then move for reasons that have nothing to do with an edit, so the only way to raise it on an edit would be to STORE a flag — the shape plan 05-05 declined for the by-hand marker, for the same reason. The second reason is better: a notice that appears after the edit tells a student something they have already done"
  - "THE SECOND INSTANCE WENT TO THE FACTION HEADS AND A MEASUREMENT PUT IT THERE. #strip was the first choice and the argument for it was good — it is sticky, so a line in it is in view wherever the student has scrolled. But #strip is #board's middle column at minmax(220px,320px): the sentence wraps to five lines and 130px in there, and with the live reading beside it the strip stood at 984px against the 704px a 768-tall viewport leaves. A STICKY ELEMENT TALLER THAN ITS SPACE STOPS PINNING — measured top -203 where it should read 64 — which would have taken the projection off screen, the one thing PROJ-05 forbids"
  - "PROJ-05 IS RECONCILED RATHER THAN CHOSEN, and both collapses are written at the site. [S06.3]'s figures are untouched and go on reading state.build; the fight's own figures sit beside them, labelled. That discharges D-22's actual consequence — the third argument is USED rather than left unused or retired — while keeping research's point that a strip which silently tracks the fight has nothing left to be contradicted. It is the first PROJ-05 question at 05-11 and it is one comment's work either way"
  - "TURNING THE THREE LAYOUT DIALS CANNOT FIX THE VIEWPORT BUDGET, and the sweep says so rather than an opinion. No setting clears a 768-tall screen — 18/18/10 is 825 — and every setting below 34vh loses the whole-newest-round property 05-08 chose 34vh FOR. Laying #fightbar and #ledger SIDE BY SIDE clears 1080 with 236px to spare and comes within 20px of clearing 768 at the shipped dials. That change is plan 05-06's shell and plan 05-06's frame rule, so it is handed to the checkpoint WITH ITS NUMBERS rather than made on the last wave"
  - "THE REGION HAS NO FINGERPRINT AND THAT IS A DEPARTURE FROM FOUR SIBLINGS, written down rather than left to be noticed. Those four rebuild surfaces, so an unneeded repaint throws nodes away and the fingerprint buys node identity back. This one rebuilds nothing: every write is idempotent, so a frame on which nothing moved writes the values already there over about thirty nodes. Only text is written conditionally, because assigning textContent replaces the text node even when the string is identical"
  - "aria-label IS READ BY THE RENDERED-PAGE WALK, which the first draft of this region's own comment got BACKWARDS. harvestInto reads every attribute in LABEL_ATTRS and skips one only for the stepper's data-albl channel, so a marker saying its state twice is harvested twice — three of the eleven strings a unit card gained. The rule that survives is the better one: an accessible name IS copy, the gate reads it like any other copy, and a type's name belongs in the one place that keeps a rename live"

patterns-established:
  - "a deliberate-failure probe that stays green because it was taken on the WRONG BOARD rather than because the row is wrong — probe AD's byte-identical row is indistinguishable from the defect on a board where nobody has died, because aliveCount equals units.length there and that is exactly bestPair's default"
  - "a probe whose expected outcome is silence, recorded as the finding and handed on with the exact three-line row that reddens it"
  - "a browser measurement that CHANGES a plan's chosen site rather than confirming it"

requirements-completed: []

duration: 110min
completed: 2026-08-29
---

# Phase 05 Plan 09: The Board in Fight Mode Summary

**A unit at zero health that a student ruled alive draws as alive and a unit at
full health that a student ruled dead draws as dead, both from the stored flag
and neither from the arithmetic; a by-hand value is marked from the round's own
record with nothing stored on the unit; and PROJ-05's two disagreeing documents
are reconciled on screen rather than adjudicated — while a real browser found
that the live reading, placed where the plan first put it, would have stopped the
sticky projection pinning on a laptop, and that no setting of the phase's three
layout dials can put the live board on a 768px screen at all.**

## The gate, before and after

| | before (05-08) | after |
|---|---|---|
| suite | 1188 passed, 0 failed | **1188 passed, 0 failed** |
| `SUITE_FLOOR` | 1158 | 1158 |
| interaction gate | 147 of 147 | **147 of 147** |
| stub-drift | 111 shell ids | **111** — this plan adds no id |
| `#app` (setup) | 127 | **127** — unchanged, and correctly so |
| `#app` (fight) | 276, `FIGHT_FLOOR` 108 | **420**, `FIGHT_FLOOR` **120** |
| marginal cost of a unit card (fight) | 14 | **25** |
| dialogs | 145 across 4 roots | **145 across 4 roots** — no dialog added |
| proposal pane | 60, floor 23 | 60, floor 23 |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 7279 literals | **7445 literals**, 0 hits |
| perf gate | 7 ms of 50 | **7 ms of 50** |
| naming greps | 0 / 0 | **0 / 0** |
| `url(` / `createElementNS\|<svg` | 0 / 0 | **0 / 0** |
| `text-wrap` anywhere | 0 | **0** |
| new hex in `[C14.3]` | — | **0** |

`node tests/selftest-node.cjs` exits 0.

## The three alive/dead driven readings, off the PAGE and not off state

Real Chrome and real Edge, `file://`, 1920×1080, every op through `App.ops`,
every reading taken from the rendered card. Identical in both browsers.

```
1. c1 at ZERO HEALTH, never ruled dead
   state  {"id":"c1","hp":0,"shield":0,"alive":true}
   page   cardClass "(none)"  aria-pressed "false"  dead tokens 0  says ""  hidden true
2. c2 at FULL HEALTH, ruled dead
   state  {"id":"c2","hp":3,"shield":0,"alive":false}
   page   cardClass "dc-card--dead"  aria-pressed "true"  dead tokens 1
          says "Still on the roster, ruled dead."  hidden false
3. c1 driven to ZERO BY AN ADVANCE (Lasers, 3 damage)
   state  {"id":"c1","hp":0,"shield":0,"alive":true}
   page   cardClass "(none)"  aria-pressed "false"  dead tokens 0   <- draws as ALIVE
3b. and then ruled dead     -> dc-card--dead, "true", 1 token, the sentence
3c. and ruled BACK alive    -> "(none)", "false", 0 tokens, the sentence gone
```

3c is the direction a tidy implementation loses, and it is driven for that
reason.

## The cards, before and after marking three dead

```
unit cards on the page, before / after marking c1, c2 and m1 dead = [12, 12]
and the three are still in their own columns = ["c1 present","c2 present","m1 present"]
```

FIGHT-06 was decided by the zero-tally hide pass and is not re-decided here. A
dead unit keeps its card, its health line, its shield line and every stepper on
it.

## The alive toggle's ancestor walk, hand-written

`matches()` has no `[hidden]` support, so the walk is written out and every link
is read. On a unit that IS marked dead:

```
button.dc-alive.dc-alive--on   hidden false  display inline-block  visibility visible
div.dc-line                    hidden false  display block         visibility visible
article.unit-card.dc-card--dead hidden false display flex          visibility visible
section#col-cats.brd-col       hidden false  display flex          visibility visible
div#board.board                hidden false  display grid          visibility visible
main#app.shell                 hidden false  display block         visibility visible
body                           hidden false  display block         visibility visible

any hidden ancestor = false
box            = 103.8 x 24, non-zero
disabled       = false
it takes focus = true
```

## `data-k` uniqueness, document-wide

```
alive toggles / distinct data-k          = [12, 12]
every data-k on the page / duplicates    = [174, 0]
a sample key                             = fg/alive/c1
```

## The by-hand marker, and nothing stored on the unit

```
before any ruling, c1 health   {"cls":"dc-hand","ariaLabel":"Set by hand",
                                "text":"✎Set by hand","hidden":true,"shown":false}
after setUnitHp('cats','c1',1) {"cls":"dc-hand","ariaLabel":"Set by hand",
                                "text":"✎Set by hand","hidden":false,"shown":true}
c1 SHIELD, which nobody ruled  hidden true, shown false
the record it is derived from  [{"side":"cats","unit":"c1","tok":"hp","from":3,"to":1}]
after an Advance, c1 health    hidden true, shown false
and the live list is           no `hand` key at all
a unit's key set, with a ruling standing   alive,hp,id,shield
```

The marker is in **both** its class (`dc-hand`) and an accessible name
(`aria-label="Set by hand"`), and it clears itself on an Advance because
`advanceRound` moves the record into `past` — there is no line in this region
that clears it.

## FIGHT-10's line, verbatim, and its five readings

```
The steppers on the board still edit the build. A change made now applies to the
build and not to this fight, and it takes effect the next time you start a fight.
```

```
NO fight running   #fight-said {"text":"","hidden":true}   .dc-said nodes on the page 0
fight running      #fight-said {"text":"<the line>","hidden":false}
                   .dc-said    ["brd-col-head [shown]","brd-col-head [shown]"]
both sites carry the SAME string = true

no data-k          false
no data-amt        false
not .brd-value     false
not .brd-line--opt false
BUILT ONCE across a plain build edit: same node object = true
and #fight-said is the shell node it always was       = true
```

**One of the five needed a correction rather than a pass, and it is a fact about
`[S06.1]` rather than about this line.** An Advance is a `commitStructural`, so
`structure()` rebuilds both column interiors and the faction head with them:

```
after an Advance: sameNode false, stillThere 2, and the head's own stepper rebuilt too
```

That is why the site uses **append-if-missing** rather than a build-once flag —
a flag would outlive the node it describes. `#fight-said` is the shell node and
is genuinely built once for the life of the page.

**Two things the line does not say**, and both are deliberate: it does not
promise the fight is "unaffected" in a reassuring register, and **it says nothing
about undo at all**, because a Ctrl+Z chain does eventually un-start the fight
(D-08) and a notice implying the two slices are independent would be wrong.

## `[S06.3]`'s two shipped figures, before and during a fight

```
BEFORE  ["owner/cats=Cats","turns/cats=≈9 turns to wipe Mechs",
         "work/cats=27 health ÷ 3 per turn","soak/cats=",
         "owner/mechs=Mechs","turns/mechs=≈3 turns to wipe Cats",
         "work/mechs=27 health ÷ 9 per turn","soak/mechs=","ignored/-="]
DURING  … identical …                                   BYTE-IDENTICAL = true
AFTER A ROUND RESOLVED  … identical …                   STILL BYTE-IDENTICAL = true
AND ON A BOARD WHERE EIGHT CATS ARE MARKED DEAD … identical …  = true
```

The last of those four is the one probe AD needed and the first three did not
have — see below.

## The live fight reading's five readings

```
exists during a fight            true
its lines
  ["Cats",  "9 of 9 still standing.", "Action points: 0 spent, 3 left.",
            "≈9 turns to wipe Mechs, counting only the 9 still standing."]
  ["Mechs", "3 of 3 still standing.", "Action points: 0 spent, 3 left.",
            "≈3 turns to wipe Cats, counting only the 3 still standing."]
no decimal anywhere in it        true
no LEAF names both sides         true
absent outside a fight           .dc-live 0 / .dc-said 0 / #fight-said hidden true, text ""
```

**turnsToWipe's third argument, proved by making the answer move through the
survivor count alone with the build never touched:**

```
with 9 standing  "≈9 turns to wipe Mechs, counting only the 9 still standing."
with 1 standing  "≈27 turns to wipe Mechs, counting only the 1 still standing."
it moved                              true
the projection beside it did NOT      true
```

`bestPair` affords `min(floor(ap / cost), active)` uses, so one Cat standing
buys one use instead of nine and the figure triples-and-then-some. That is the
parameter doing exactly what its own comment said it was for.

**One wording bug the driven reading found.** The first spelling was
`", counting only those N"`, which printed **"counting only those 1"** the moment
a side was down to its last unit. The file's own rule is that no renderer
guesses at agreement — `turnsText` branches on plurality one region up for this
reason — so the phrasing was changed to repeat the noun instead of pointing at
it.

## Check 62's claim, still holding

```
reference/action cards on the page, setup / fight = [39, 39]
the setup-only Add button,          setup / fight = [2, 0]
```

REF-03 stays pre-satisfied.

## `FIGHT_FLOOR` — 108 → 120, and the per-card cost 14 → 25

The last of the three payments plan 05-01 named. Measured on three roster sizes,
trimming the roster **before** `startFight` — which turned out to be the whole
method:

| cards on the board | 12 | 4 | 2 | per card | roster-independent |
|---|---|---|---|---|---|
| base (05-08) | 276 | 164 | 136 | 14 | **108** |
| after task 1 | 408 | 208 | 158 | **25** | 108 — unchanged |
| after task 2 | **420** | 220 | 170 | **25** | **120** |

`420 − 12×25 = 120`, and `220 − 4×25` and `170 − 2×25` both come to 120 as well.

**A method error was found and corrected before any of this was trusted.** The
first measurement trimmed the roster with a fight already running, and read a
per-card cost of 16 with a roster-independent part of 216. `removeUnit` moves the
**build** and leaves the fight slice, the ledger's record and both choosers
holding every unit, so a per-card figure taken that way measures the setup chrome
alone. Re-taken with the trim before `startFight`, the base file reproduced
05-08's 276 / 164 / 136 exactly, which is what makes the new figures comparable.

**The eleven strings a unit card gained, named one at a time:**

```
the alive toggle's word and its tick                         2
three by-hand markers, each a glyph node and a word node      6
and the SAME three markers read AGAIN through aria-label      3
```

**The last three are a finding.** `harvestInto` reads every attribute in
`LABEL_ATTRS`, `aria-label` among them, and skips one only when the node carries
the stepper's `data-albl` channel. A marker that says its state twice — which is
[C07]'s standing rule — is therefore read twice. This region's own comment said
the opposite in its first draft and is corrected in place.

The dead marker's **label** is not among the eleven: it carries the token-name
exemption marker, which is the same marker doing its job that the 41 → 56 entry
recorded about the pool's label and the 83 → 108 entry recorded about the ledger
row's token names.

**The twelve roster-independent strings** are FIGHT-10's line at three sites
(the bar and both column heads), the live reading's heading, and per side its
faction word, survivor reading, points tail and turn reading (4 × 2 = 8). The
points reading's **label** is a thirteenth and is deliberately not counted, for
the same reason, for the third time in that comment's history.

## THE VIEWPORT BUDGET — measured, and it is not a dial question any more

Driven in real Chrome and real Edge, one round resolved, identical in both.

### The sweep, and what it says

| `.fg-sides` / `.ld-list` / `.ld-now-body` | board top @1920×1080 | @1366×768 | newest round whole |
|---|---|---|---|
| **34 / 34 / 20 — shipped** | **1257** | **1048** | yes / no |
| 30 / 30 / 18 | 1181 | 986 | no |
| 26 / 26 / 16 | 1095 | 930 | no |
| 24 / 24 / 14 | 1052 | 902 | no |
| 22 / 22 / 12 | 1008 | 871 | no |
| 20 / 20 / 12 | 965 | 856 | no |
| 18 / 18 / 10 | 922 | 825 | no |

**No setting at all clears a 768-tall screen**, and every setting below 34vh
loses the property 05-08 chose 34vh for. Turning them trades a measured property
away and still leaves the board below the fold. **They were not turned, and the
table is written into `[C14]` so the next reader does not reach for them first.**

### What does clear it, measured

| arrangement | board top @1920×1080 | @1366×768 |
|---|---|---|
| stacked (shipped) | 1257 | 1048 |
| **side by side, dials unchanged** | **844** | **788** |
| side by side, 28 / 28 / 16 | 779 | 742 |
| ledger hidden entirely | 844 | 730 |

`#fightbar` and `#ledger` are two full-width regions stacked above the board, so
the page pays their **sum**; side by side it pays the **taller**. That is the
move 05-08 already made one level down, inside the ledger, and recorded as a
pattern.

**It is handed to the checkpoint rather than made here**, and the reason is
section ownership rather than difficulty: it needs a wrapper element in the shell
and a rewrite of `[C14]`'s `#fightbar, #ledger` rule — plan 05-06's markup and
plan 05-06's frame rule, and that rule is the one whose own paragraph records a
shorthand silently zeroing a longhand and putting a region 182px out of
alignment. Making that change on the last wave before a checkpoint, in a section
this plan does not own, is how a phase ends badly. **The numbers are in
`[C14]`, in `REHEARSAL.md` B3 and here.**

### What this plan itself cost the budget, and what it gave back

`#fight-said` grew `#fightbar` by **88px** (499 → 587), which is the one part of
the budget this plan added and it is the node the shell reserved for it by name.
Everything else this region draws is **inside** `#board` and moves its top by
exactly zero.

### The layout defect this plan found in its own work, and fixed

**The first placement put FIGHT-10's line and the live reading in `#strip`, and
a real browser said no.** `#strip` is `#board`'s middle column at
`minmax(220px, 320px)`: the notice wraps to five lines and 130px in there, the
live reading to 321px, and the strip stood at **984px** against the **704px** a
768-tall viewport leaves under the top bar.

```
1366x768, scrolled to the board:   #strip top = -203      (it should read 64/107)
```

**A sticky element taller than the space it has stops pinning.** That would have
taken the projection off screen exactly when a student scrolls down to the live
board — the precise opposite of PROJ-05. Two fixes, each measured:

1. FIGHT-10's line moved to the **faction heads**, which is the plan's own
   phrase — "beside the roster steppers" — and where the same sentence is three
   lines instead of five and costs the board's top nothing;
2. `.dc-live` took a **24vh bound with its own scroll**, which is `[C12]`'s
   action list and `[C14]`'s list one level further in. The scroll is on a
   **descendant** of the sticky element, which cannot take its sticking away —
   the first time in this phase that gotcha points the other way.

```
after:  strip 779px @1920x1080, pins at 64   |   strip 704px @1366x768, pins at 107
        both browsers, zero page errors, zero console errors
```

24vh costs a 1920×1080 projector nothing: the reading measures 225px and 24vh is
259px there, so it does not scroll at all on the screen this artifact targets.

**There are now four dials and they are not one budget.** The three above the
board add their heights together; the fourth is inside `#board`, in the sticky
column, and exists for a different failure with a different measurement. Both
`[C14]` and `[C14.3]` say so at their own sites.

## The four probes, run after their task's commit, recorded verbatim, reverted

`git checkout -- cats-vs-mechs.html` was never used. Every revert was `cp` from a
scratchpad snapshot and `git status --short` read clean after each.

### PROBE AB — the dead marker drawn from `hp === 0` instead of the flag

All three driven readings redden by name:

```
AB: 1. c1 at zero health, never ruled dead
       state {"id":"c1","hp":0,"shield":0,"alive":true}
       page  cardClass "dc-card--dead"  pressed "true"  dead tokens 1
             says "Still on the roster, ruled dead."          <-- RED
AB: 2. c2 at full health, RULED DEAD
       state {"id":"c2","hp":3,"shield":0,"alive":false}
       page  cardClass "(none)"  pressed "false"  dead tokens 0  <-- RED
AB: 3c. ruled dead and then ruled BACK alive
       page  cardClass "dc-card--dead"  pressed "true"  1 token   <-- RED
```

**AND THE SHIPPED REPOSITORY STAYED SPOTLESSLY GREEN OVER IT:**

```
1188 passed, 0 failed
interaction gate: 147 of 147
scan: 420 rendered strings read from #app WITH A FIGHT RUNNING (floor 120)
exit=0
```

**That is the finding.** Every row in this file that asserts D-00d reads
**state**, and state is not what a student sees. The rows that redden it are
written into `[S06.9]`'s banner with `App.render.boardFight` exported so they can
be driven, and plan 05-10 is named for them.

### PROBE AC — the alive toggle inside a node the dead state hides

The tidy-looking shape: the marker, its sentence and the control that undoes it
wrapped as one block, and the block hidden when the unit is marked.

```
AC: 5. toggle present = true                      <-- STILL GREEN
AC: 5. toggle box     = 0 x 0 at (0,0)
AC: 5. ANCESTOR WALK  = [ button.dc-alive.dc-alive--on  hidden false display inline-block,
                          div.dc-acwrap              hidden TRUE  display NONE,
                          div.dc-line …, article.unit-card.dc-card--dead …,
                          section#col-cats …, div#board …, main#app …, body … ]
AC: 5. any hidden ancestor = true                 <-- RED, and it is the hand-written walk
AC: 5. it takes focus      = false                <-- the focus-drop bug, reproduced
```

**The walk IS walking**, which is the outcome the plan said to record either
way. Two further findings the plan did not ask for: a **presence-only** check
passes this bug (`toggle present = true`), and the focus drop the zero-tally hide
pass recorded two phases ago reproduces exactly — `document.activeElement` does
not become the button.

**And the shipped repository was green over that too:** 1188 passed, 0 failed,
147 of 147, exit 0.

### PROBE AD — `[S06.3]` passing `activeUnits` into its OWN figures

**It stayed green, and the plan predicted the shape of that outcome.**

```
AD: 12. projection BEFORE the fight  = ["…turns/cats=≈9 turns to wipe Mechs"…]
AD: 12. projection DURING the fight  = … identical …
AD: 12. BYTE-IDENTICAL               = true          <-- STILL GREEN
```

**The row was comparing the right two readings on the WRONG BOARD**, and that is
recorded precisely because the plan asked which two it was comparing. On a fresh
fight every unit is alive, so `aliveCount(fight[side]) === units.length` — which
is **exactly `bestPair`'s default when `activeUnits` is undefined.** The two
spellings are indistinguishable on any board where nobody has died.

Re-taken on a board where eight Cats are marked dead, probe AD reddens by name:

```
AD: 12b. the same row, taken on a board where survivors moved
         ["owner/cats=Cats","turns/cats=≈27 turns to wipe Mechs",
          "work/cats=27 health ÷ 1 per turn", …]
AD: 12b. BYTE-IDENTICAL against the pre-fight reading = false     <-- RED
```

On the shipped file the same reading is `true`. **The board the row is taken on
is part of the row**, and that is now recorded with the arithmetic that makes it
so.

### PROBE AE — the live reading as ONE statement naming both sides. **EXPECTED SILENT, AND IT WAS SILENT.**

```
AE: 13. its lines
      ["Cats",  "Cats 9 still standing, Mechs 3 still standing.", …]
      ["Mechs", "Cats 9 still standing, Mechs 3 still standing.", …]
AE: 13. no LEAF names both sides in one statement = false
```

The whole shipped repository over it:

```
scan: no forbidden patterns
scan: no comparative language in the document (Layer A, 18 words)
scan: no comparative language in the 7445 string literals (Layer B, 27 words)
1188 passed, 0 failed
perf: 100 commits in 7 ms (budget 50 ms)
stub-drift gate: 111 shell ids
scan: 127 rendered strings read from #app (Layer C, 48 words)
scan: 145 rendered strings read from 4 dialog root(s)
scan: 420 rendered strings read from #app WITH A FIGHT RUNNING (Layer C, floor 120)
interaction gate: 147 of 147 checks passed
exit=0
naming greps: 0 / 0
```

**Nothing said anything. D-13 has no mechanical check anywhere in this
repository, and that is the recorded finding.** `[S09.8]` holds the
**structural** half — one builder, called once per side, every figure carrying
its own side — and cannot see the rendered half.

**The row is written into `[S06.9]`'s banner rather than left in this file**,
with its exact shape: walk the **leaves** under `.dc-live` and require that no
leaf's text holds both faction names. It has to be a leaf walk and not a region
walk, because the region legitimately names both sides — once per side, in two
different statements, which is the whole of what D-13 permits. **Plan 05-10 owns
it**, on 05-08's precedent for probe Y.

## Deviations from Plan

### Auto-fixed

**1. [Rule 1 — bug] The live reading, placed where the plan put it, stopped the sticky projection pinning at 1366×768**

- **Found during:** task 2's browser verification, after the task's code was written and before it was committed.
- **Issue:** `#strip` is `#board`'s middle column at `minmax(220px,320px)`. FIGHT-10's line wrapped to five lines and 130px in there and the live reading to 321px, taking the strip to **984px** against the **704px** a 768-tall viewport leaves. A sticky element taller than its space stops pinning: measured top **-203** where it should read 64. PROJ-05 asks that the projection stay on screen.
- **Fix:** FIGHT-10's line moved to the faction heads — the plan's own phrase, "beside the roster steppers" — and `.dc-live` took a 24vh bound with the scroll on itself, which is a descendant of the sticky element and therefore safe. Strip now 779px @1080 and 704px @768, pinning correctly in both browsers.
- **Commit:** `9af14f2`

**2. [Rule 1 — bug] "counting only those 1"**

- **Issue:** the live reading's turn line used a demonstrative that has to agree with its number, and a driven reading printed `"≈27 turns to wipe Mechs, counting only those 1."` the moment a side was down to its last unit. `turnsText` branches on plurality one region up for exactly this reason.
- **Fix:** the phrasing repeats the noun instead of pointing at it — `"counting only the 1 still standing."` — which is correct at every count.
- **Commit:** `9af14f2`

**3. [Rule 1 — a comment that was actively wrong] `aria-label` and the rendered-page walk**

- **Issue:** the by-hand marker's paragraph said an aria-label is not text the walk reads and that a student's word must therefore stay out of one. That is backwards. `harvestInto` reads every attribute in `LABEL_ATTRS`.
- **Fix:** corrected in place with the arithmetic that found it — three of the eleven strings a unit card gained are the same three markers read a second time through their label. The rule that survives is the better one.
- **Commit:** `f5998c1`

**4. [Rule 1 — a measurement method that under-reported] the `FIGHT_FLOOR` re-measure**

- **Issue:** the first measurement trimmed the roster with a fight already running and read a per-card cost of 16 against a roster-independent part of 216. `removeUnit` moves the build and leaves the fight slice, the ledger's record and both choosers holding every unit.
- **Fix:** the trim was moved before `startFight` and the base file was re-measured with the corrected method first — it reproduced 05-08's 276 / 164 / 136 exactly, which is what makes the new figures comparable. The method is written into check 92's history entry so the next plan does not repeat it.
- **Commit:** `9af14f2`

**5. [Rule 2 — a listed word list that reddened its own gate] the region banner**

- **Issue:** the banner's first draft listed the clean-but-unshippable words by name and Layer B reddened on the list itself.
- **Fix:** described rather than spelled, which is `[C11]`'s and `refCard`'s rule, with the reason at the site.
- **Commit:** `f5998c1`

### Corrections to the plan's own premises

**6. [finding] `FIGHT_FLOOR` does not move for task 1, and that is correct**

Both tasks ask for the floor to be re-measured and moved. Task 1 adds **nothing
roster-independent** — every string it adds is per unit card — so the honest
reading after task 1 is `FIGHT_FLOOR` **108, unchanged**, with the marginal cost
of a card moving 14 → 25. The floor moved to 120 with task 2, which is the task
that adds a fixed surface. This is the same class of correction plans 05-07 and
05-08 each recorded about `#app` (setup).

**7. [finding] The gate stays at 147 of 147, so the two rows probes AB and AE found are handed on rather than added**

Both tasks' acceptance criteria require `interaction gate 147 of 147`. Adding a
row to `tests/selftest-node.cjs` moves that count, and 05-08's own summary
records plan 05-10 as the owner of the fight checks. Both rows are therefore
written into `[S06.9]`'s banner with the exact comparison that reddens them, on
05-08's precedent for probe Y — which is the same treatment the plan explicitly
permits for probe AE.

**8. [finding] The mid-fight line cannot be raised BY an edit, so it is permanent while a fight runs**

The plan's acceptance is *"editing the build with a fight running renders the
line; editing with no fight running renders nothing"*, and a permanent line
satisfies it exactly. It has to be permanent: *"the build was edited during this
fight"* is not derivable from state, because `sideFromBuild` copies build into
fight once at `startFight` and the fight's numbers then move for reasons that
have nothing to do with an edit. The only way to raise it on an edit is to store
a flag — the shape 05-05 declined for the by-hand marker. It is also simply
better: a notice that appears **after** the edit tells a student something they
have already done.

**9. [finding] The line's second site is the faction heads, not `#strip`**

The plan's ownership names `#strip` and each unit card. `#strip` was the first
choice, a browser measurement took it away (deviation 1), and the faction head is
the plan's own phrase for where the line belongs — *"beside the roster steppers
that are still live during a fight"*. It is inside a column, so it costs the
board's top nothing.

### Handed on rather than answered

**10. [finding, and it is still the phase's largest layout question] The page above the live board does not fit either screen**

`#board`'s top is at **1257 of 1080** and **1048 of 768** with one round
resolved. The dial sweep says no setting fixes it and every setting below 34vh
costs a measured property. The side-by-side arrangement is measured — **844 and
788** at the shipped dials — and is plan 05-06's shell and frame rule to ship.
`[C14]`, `REHEARSAL.md` B3 and this summary all carry the full table.

### Declined by design

- **No `data-act` anywhere in this region.** [S06.7]'s control register is kept
  whole: the alive toggle carries a private `data-dc` and a `data-k`, and plan
  05-10 attaches the listener. Until then the press does nothing, throws nothing
  and opens no panel, which is `UI_HANDLERS`' recorded "claimed and ignored"
  window.
- **No shell id added**, so no `KNOWN_IDS` or stub change and no three-part rule
  to keep. `#fight-said` was already reserved.
- **No `<dialog>`**, so no `DIALOG_ROOTS` entry; the harvest stays at four roots.
- **No `[S05]` op and no `[S07]` handler.** Nothing in this plan writes state.
- **Nothing infers a death in either direction** (D-00d), and nothing announces
  a fight is over or renders a terminal state (D-26).
- **No second token painter.** The dead marker goes through `makeToken`,
  `styleFor` and `syncRow`, so its entry animation, its compact mode and its
  restyle all come free.
- **No fingerprint on the per-frame pass**, with the reason written at the site.
- **The two sides of the live reading are STACKED and not laid along a row**,
  because two boxes on one line share an axis and a shared axis is the thing
  D-13 exists to keep off this page.

## What plan 05-10 owes, with the probe behind each

1. **The D-13 leaf row.** Probe AE rendered one statement naming both sides and
   the whole repository stayed green. Walk the leaves under `.dc-live`; no leaf's
   text may hold both faction names. Written into `[S06.9]`'s banner.
2. **The dead-marker source row, read off the PAGE.** Probe AB drew the marker
   from `hp === 0` and the repository stayed green, because every D-00d row in
   this file reads state. Three readings, driven through `App.render.boardFight`,
   written into the banner.
3. **The alive toggle's presser.** `data-dc="alive"` with `data-dc-side` and
   `data-dc-unit` on it, `setAlive` as the op. A presence-only check passes probe
   AC's bug, so the row that matters is the hidden-ancestor walk.
4. Everything 05-08 handed on — the ledger node-identity row, the check-63b
   parallel and the probe-S driving row — is unchanged and still owing.

## What plan 05-11 inherits

- **PROJ-05 is the first question**, and it is one comment either way. Two
  readings sit side by side, both labelled: does that read as **one honest
  surface** or as two numbers a student has to reconcile? To collapse toward
  D-22, make `[S06.3]`'s own figures pass the third argument and delete
  `[S06.9]`'s block; to collapse toward research, delete the block and **retire**
  the third argument from `turnsToWipe`, `bestPair`, `bestDamage` and
  `factionDps`. Both spellings are written at the site.
- **`REHEARSAL.md` B3 is now a decision with numbers rather than a dial
  question**, and it is still the phase's largest.
- **The judgements no measurement settles:** whether a dead unit is legible as
  dead from the back of a room without relying on colour; whether the mid-fight
  line is seen at the moment of the edit or is somewhere the student is not
  looking; whether the by-hand marker reads as *a person set this* rather than as
  *the tool disagrees*; and whether "Marked dead" on a toggle reads as a state or
  as an instruction.

## Known Stubs

| stub | file | why it is intentional | resolved by |
|---|---|---|---|
| the alive toggle has no presser | cats-vs-mechs.html | [S06.7]'s control register forbids `data-act` on a fight control, and plan 05-10 owns the listener that reads `data-dc`. Until then the press does nothing, throws nothing and opens no panel — `UI_HANDLERS`' recorded "claimed and ignored" window, and the only honest behaviour for it. The plan says so by name: "Plan 05-10 presses it" | 05-10 |
| `App.render.boardFight` is exported with no caller | cats-vs-mechs.html | exported so the row probe AB found can paint this region onto a state it has just written and read the cards back — a surface reachable only through `SYNC_HOOKS` cannot be driven. The reason is written at the export | 05-10 |
| no numbered check watches the dead marker's source or D-13's rendered half | cats-vs-mechs.html | plan 05-10's section ownership claims the fight checks, and the gate count is fixed at 147 by this plan's own acceptance. Probes AB and AE are recorded verbatim and both rows are written into `[S06.9]`'s banner with the comparison that reddens | 05-10 |

None of the three prevents this plan's goal, which was to make the board tell the
truth about a fight without deciding anything about it.

## Threat Flags

None. No new network endpoint, auth path, file access pattern or schema change
at a trust boundary. The five mitigations the plan's threat register assigns:

| Threat | Mitigation, as shipped |
|---|---|
| T-05-37 the dead marker drawn from health rather than the flag | drawn from the stored flag through one new `amountFor` arm; three driven readings covering both directions and the return trip; **probe AB drives the health-derived spelling and reddens all three, and the whole repository is green over it** — which is the finding, and the row is written into the banner |
| T-05-38 the alive toggle hidden by the state it toggles | the toggle is a SIBLING of the marker and of everything the dead state hides; a hand-written hidden-ancestor walk, because `matches()` has no `[hidden]`; **probe AC drives the tidy-looking shape and the walk catches it, along with the focus drop the hide pass recorded two phases ago** |
| T-05-39 a per-value provenance flag stored on a unit | derived from the round's ruling list through plan 05-05's own proved-derivable read; the unit's key set is `alive,hp,id,shield` with a ruling standing; check 73c and `[S09.10]`'s boundary row were not widened |
| T-05-40 the projection quietly switching to describe the fight | `[S06.3]` is untouched and its two figures are byte-identical before, during and after a resolved round, **and on a board where eight units are marked dead** — which is the reading probe AD needed and the first three did not have; the live reading is a separate labelled node |
| T-05-41 a live reading that compares both sides in one statement | one builder called once per side with the side as an argument, `projPanel`'s own shape; no leaf names both sides; **probe AE tests for the gap, the gap is real, and the closing row is written into the banner with plan 05-10 named** |
| T-05-SC npm/pip/cargo installs | zero packages installed. Playwright was resolved from an existing scratchpad install through `PLAYWRIGHT_DIR`, exactly as `tests/browser-checks.mjs` documents, and nothing was added to the repository |

## Requirements

**None marked complete, and that is deliberate** — the reading plans 05-04
through 05-08 all took. The plan names FIGHT-05, FIGHT-06, FIGHT-07, FIGHT-10 and
PROJ-05:

- **FIGHT-05 / FIGHT-04's marker** — a unit at zero health is marked only when a
  student says so, stays in the roster, and can be toggled back. Whether the
  marking reads as *dead* from the back of a room without relying on colour is
  plan 05-11's.
- **FIGHT-06** — the marker is a marker and not a removal; the card, the lines
  and every stepper stay. Driven; the judgement is 05-11's.
- **FIGHT-07** — a by-hand value is marked from the round's own record with
  nothing stored on the unit. Whether it reads as *a person set this* rather than
  as *the tool disagrees* is 05-11's.
- **FIGHT-10** — a mid-fight build edit says so on a permanent line at two sites
  that disables nothing and does not contradict D-08. Whether it is seen at the
  moment of the edit is 05-11's.
- **PROJ-05** — the projection stays on screen describing the allocation it has
  always described, with the fight's own figures beside it and labelled. Whether
  two readings side by side are one honest surface is the first PROJ-05 question
  at 05-11 and is explicitly not answered here.

Marking any of them here would be the same defect this phase keeps finding.

## Self-Check: PASSED

Files verified present: `cats-vs-mechs.html`, `tests/selftest-node.cjs`,
`.planning/REHEARSAL.md`,
`.planning/phases/05-fight-loop-playtest/05-09-SUMMARY.md`.

Commits verified in the log: `f5998c1`, `9af14f2`, `458ae9e`.

Verified in the artifact: one `[S06.9] RENDER — FIGHT MODE ON THE BOARD` banner,
one `#region`/`#endregion` pair for it, one `SYNC_HOOKS.push(syncBoardFight)`,
one `boardFight: boardFight` on `[S06]`'s return, one `[S00]` table-of-contents
line for `[S06.9]`, one `[C14.3] THE BOARD IN FIGHT MODE` banner, and zero
`data-act` inside the region.

Final run: `node tests/selftest-node.cjs` → **1188 passed, 0 failed**, stub-drift
**111 shell ids**, interaction gate **147 of 147**, `#app` 127, dialogs 145
across 4 roots, fight-mode **420** against floor **120**, proposal 60, Layer A 18
words clean, Layer B 7445 literals clean, perf 7 ms of 50, exit 0. Both naming
greps print **0**; `url(` prints 0; `createElementNS|<svg` prints 0; `text-wrap`
prints 0; the hex pattern over `[C14.3]` prints 0. Real Chrome and real Edge both
report **zero page errors and zero console errors** on every run. Working tree
clean after every probe revert; `git checkout --` was never used on either file.
