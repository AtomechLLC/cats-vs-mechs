---
phase: 05-fight-loop-playtest
plan: 10
subsystem: ui
tags: [s07-5, interaction-gate, act-partition, never-disable, acceptance-run, d-13, d-00d, limitations]

requires:
  - phase: 05-fight-loop-playtest
    plan: 06
    provides: "#fight-start carrying data-act, #fightbar and #ledger as static shell roots, and the control table this plan presses"
  - phase: 05-fight-loop-playtest
    plan: 07
    provides: "[S06.7]'s control register — every fight control takes a private data-fg and none carries data-act — plus the never-disable requirement probe W left, and the 51-control comparison that reddens"
  - phase: 05-fight-loop-playtest
    plan: 08
    provides: "the ledger, App.render.ledger exported for a driven row, and check 92's drive that PLAYS a round"
  - phase: 05-fight-loop-playtest
    plan: 09
    provides: "the alive toggle's data-dc, App.render.boardFight exported, and the two rows probes AB and AE found written into [S06.9]'s banner"
  - phase: 04-share-and-reset
    plan: 06
    provides: "[S07.4] — the banner shape, the partition table, bindShare / bindResetAsk, and bindResetAsk's paragraph for DECLINING a listener in writing"
provides:
  - "[S07.5] — every fight press, attached from the four seams, with NOT ONE LINE of [S07.1] edited (564 lines compared, diff empty)"
  - "the answer to the phase's held-or-not question: HOLD_ACTS untouched, with both reasons written at the site"
  - "the keyboard's own ramp closed on this region, which [S07.1]'s actTarget cannot reach"
  - "interaction gate 147 -> 160; thirteen rows numbered 93 through 102, every one driving the page"
  - "D-13's RENDERED half now has a mechanical check (row 97) — probe AE's silence closed"
  - "the dead marker's source asserted OFF THE PAGE (row 98) — probe AB's silence closed"
  - "the never-disable rule on the fight region watched by a numbered check (row 95) — probe W's silence closed"
  - "the phase's acceptance run (row 102), six values read back off the page"
  - "twelve new limitations entries, 21 through 32, which are plan 05-11's script"
  - "deferred-items.md — two out-of-scope browser findings logged rather than fixed"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "a sub-region that pushes NOTHING into UI_ACTS and writes the argument down rather than leaving the absence to read as an oversight"
    - "a keyboard-repeat suppression bound per-region, because the shared one keys on data-act and this region deliberately carries none"
    - "two delegated roots partitioned by ATTRIBUTE NAME rather than by root, both bound inside #app alongside [S07.1]'s own listener"
    - "a whole-set disabled comparison across boards BUILT TO THE SAME SHAPE — the first draft compared boards whose control sets differed for a reason that had nothing to do with disabling"
    - "a deliberate-failure probe whose second half measures what the defect COSTS rather than only that a row reddens"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/deferred-items.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "THIS REGION PUSHES NOTHING INTO UI_ACTS AT ALL, and the argument is written into the banner rather than left as an absence. UI_ACTS is a table of data-act names routeUi looks up BEFORE App.ops.dispatch is reachable. Every control [S07.5] reads carries a private data-fg or data-dc and no data-act, so routeUi never sees one of them; the single fight control that DOES carry a data-act is #fight-start, and it carries the name of a REAL OP, which is the one kind of name that must never be in that list. An entry here could therefore only be a name nothing sends or a name that turns a state op into page work. There is no third possibility, so there is no entry — the proposal pane's 'claims none' and [S07.4]'s 'two, and not four', one step further along the same argument"
  - "HOLD_ACTS IS UNTOUCHED AND THE CHOICE WAS OFFERED RATHER THAN ASSUMED AWAY. An Advance must never be held: HOLD_FAST_MS is 40, so a held Advance resolves rounds at up to twenty-five a second, MAX_PAST_ROUNDS is 30, and one accidental hold pushes the whole history a student just played off the end — each press its own undo entry, because advanceRound's label carries the round number. The fight HEALTH nudge is the one the phase left open, and plan 05-05 gave nudgeFightHp a boolean return precisely so a ramp could read it. It is not held either, and the FIRST reason is mechanical rather than a judgement: NO CONTROL ON THE PAGE CARRIES THAT OP. [S06.9] draws two markers and one toggle, and the board's steppers go on editing the BUILD, which is the whole of what FIGHT-10's line says. The second reason is that it could not fire if it were there — [S07.1]'s ramp reads btn.dataset.act and every control in this region has none"
  - "THE KEYBOARD'S OWN RAMP HAD TO BE CLOSED HERE, and it is the one thing this plan added that the plan did not ask for. [S07.1]'s repeat suppression finds a held Enter through actTarget, and actTarget returns null for any node without a data-act — so every control in this region sat outside it. D-17's own paragraph says what that costs: the browser synthesises a click per repeated keydown and the click handler has no e.repeat to test. Held on Advance that is the forty-rounds outcome HOLD_ACTS exists to prevent, arriving through the other door. Row 93c asserts it and a real browser confirms it: 1.4s of held Enter resolved exactly ONE round in Chrome and in Edge"
  - "THE FIRST DRAFT OF THE DISABLED-SET ROW WAS WRONG AND THE FIX IS WRITTEN AT THE SITE. The funded board carried a declaration and the driven board resolved it on the Advance that emptied the pools — so the Clear control on that line went away and the two sets differed for a reason that had nothing to do with anything being disabled. Every board in row 95 is now built to the SAME SHAPE, with a fight running and exactly one declaration standing, and they differ only in what the side can pay, what it can meet, and who has been ruled dead. That is probe W's like-for-like construction, taken again"
  - "THE ACCEPTANCE RUN FOUND THAT THE BOARD'S HEALTH ROW DRAWS THE BUILD ALLOCATION AND NOT THE FIGHT'S LIVE HEALTH, and the row was rewritten AROUND the finding rather than asserting around it. amountFor's hp arm reads unit.maxHp off state.build, which is FIGHT-10's division said out loud, so a ruling that moves the fight's health by one moves no number on that card. The row now asserts that the board's health row is UNMOVED and that the marker and the what-changed reading BOTH move — so a later plan pointing the row at the fight slice reddens rather than shipping a second, silent answer to what a health number on this board means. Whether a marker beside a number that did not move reads as 'a person set this' is limitations entry 29"
  - "THE VIEWPORT BUDGET AND THE SPENT READING WERE NOT PAPERED OVER. No row asserts the board is on screen, because it is not — re-measured in real Chrome at 1203@1080 and 1111@768 with a round resolved, and logged to deferred-items.md as plan 05-09's checkpoint decision. And row 102 reads the pool back VERBATIM as '0 of 3 spent' rather than asserting around it, which puts this gate on the record about FIGHT-09 instead of quiet about it"

patterns-established:
  - "a probe whose SECOND half measures the cost of the defect rather than only that a row reddens — probe AG put a colliding data-k on a ledger row and then measured which container's keyed() lookup it captures"
  - "a browser drive used as a CONTROL against a shipped surface two phases older, which is what turned a focus reading from a regression into a pre-existing, file-wide behaviour"

requirements-completed: [FIGHT-01, FIGHT-02, FIGHT-04, FIGHT-05, FIGHT-07, FIGHT-12, FIGHT-13, REF-03, SHARE-07]

duration: 125min
completed: 2026-08-29
---

# Phase 05 Plan 10: The Fight's Presses, and the Gate That Watches Them Summary

**Every fight control is now pressable through a listener inside the error
boundary, attached from all four seams with not one line of `[S07.1]` edited and
with nothing at all pushed into `UI_ACTS` — and the three holes three earlier
probes found, each of which the whole repository was spotlessly green over, are
closed by numbered rows that drive the page rather than read the state: D-13's
rendered half, the dead marker's source, and the never-disable rule on the fight
region.**

## The gate, before and after

| | before (05-09) | after |
|---|---|---|
| suite | 1188 passed, 0 failed | **1188 passed, 0 failed** |
| `SUITE_FLOOR` | 1158 | 1158 — no `[S09]` row added, and correctly so (see below) |
| interaction gate | 147 of 147 | **160 of 160** |
| next free check number | 93 | **103** |
| stub-drift | 111 shell ids | **111** — this plan adds no id |
| `#app` (setup) | 127 | **127** |
| `#app` (fight) | 420, `FIGHT_FLOOR` 120 | **420**, `FIGHT_FLOOR` **120** — this plan renders nothing |
| dialogs | 145 across 4 roots, floor 138 | **145 across 4 roots** — no dialog added |
| proposal pane | 60, floor 23 | **60, floor 23** |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 7445 literals | **7522 literals**, 0 hits |
| perf gate | 7 ms of 50 | **7 ms of 50** |
| no-writer gate | 57 ops, 26 arms of 66, 490 records | **identical** |
| naming greps | 0 / 0 | **0 / 0** |
| `url(` / `createElementNS\|<svg` | 0 / 0 | **0 / 0** |
| `.disabled` over `[S07.5]` | — | **0** |
| browser checks | 22 passed, 0 failed | **22 passed, 0 failed** |

`node tests/selftest-node.cjs` exits 0.

**`SUITE_FLOOR` did not move and that is the shape rather than an omission.**
Every assertion this plan makes is a SURFACE assertion, and 16a's split puts
every `[S09.*]` row above a no-DOM bracket — so all thirteen live in the
interaction gate, which is what the plan's objective said in as many words.

## `[S07.1]`'s diff, proved rather than claimed

```
[S07.1] spans lines 14777..15340 in the NEW file
[S07.1] spans lines 14776..15339 in the OLD file
DIFF OVER [S07.1] IS EMPTY: 564 lines compared
```

`git diff -U0` over the whole artifact produces exactly **two hunks** — one line
added to `[S00]`'s region map and 387 lines added between `[S07.4]`'s
`#endregion` and the section's `return`. `[S07.2]`, `[S07.3]` and `[S07.4]` are
untouched as well. `git checkout -- cats-vs-mechs.html` was never used; every
probe revert was a `cp` from a scratchpad snapshot and `git status --short` read
clean after each.

## The partition, as read off the page

Row 93, taken on a board somebody has played on — two rounds resolved, a
declaration standing:

```
acts on data-act inside #fightbar + #ledger = 0
acts found                = ["nudgeAp","ap","nudgeMaxHp","maxHp","nudgeShield","shield","startFight"]
UI-only                   = []
claimed but unhandled     = []
field acts, off the live FIELD_OPS
                          = ["ap","nudgeAp","maxHp","nudgeMaxHp","shield","nudgeShield",
                             "setTally","nudgeTally"]
state acts that are neither an op nor a field act = []
FIGHT OPS PARKED IN UI_ACTS = []
dispatched acts with no op behind them = []
private data-fg + data-dc controls = 63
```

**A FIELD's act is a third legitimate kind and the row was wrong without it.**
`[S07.1]` reads a numeric field's `data-act` and looks the op up in `FIELD_OPS`
rather than in `App.ops`, so `maxHp` and `nudgeShield` are dispatched names
`[S05]` deliberately does not export — that table's own comment says the keys
exist "because a FIELD carries them". The allowlist is read off the live exported
table rather than re-typed.

**The six this region dispatches, and the op behind each:**

| the act the page sends | the op `[S05]` exports | how it is pressed |
|---|---|---|
| `startFight` | `startFight` | `#fight-start`, `data-act` — `[S07.1]` has dispatched it since 05-06 |
| `resetFight` | `resetFight` | `data-fg="reset"` |
| `declare` | `declareAction` | `data-fg="declare"`, four keys built field by field |
| `clearDeclaration` | `clearDeclaration` | `data-fg="clear"` + `data-fg-index` |
| `advanceRound` | `advanceRound` | `data-fg="advance"`, no payload at all |
| `setAlive` | `setAlive` | `data-dc="alive"` + `data-dc-side` + `data-dc-unit` |

**And the three that are page work**, handled here and never dispatched:
`data-fg="act"`, `data-fg="by"`, `data-fg="at"` — each moves ONE attribute on
the side's declaration root and asks `App.render.fightBar` to paint the surface
onto it, which is the caller that export was written for by name.

## The held-or-not decision, with its reasons

**`HOLD_ACTS` is untouched.** Both reasons are in the banner and are recorded in
the decisions above. Driven in real Chrome and real Edge:

```
5. HELD ENTER on Advance for 1.4s: round before/after = [2,3]   -> 1 round
6. HELD POINTER on Advance for 1.6s: rounds resolved  = 1
```

One press, one round, on both paths, in both browsers.

**What the plan did not ask for and this plan added anyway (Rule 2):** the
keyboard's own ramp. `[S07.1]`'s repeat suppression keys on `actTarget`, which
returns null for every control in this region. Row 93c:

```
the repeat is cancelled = true | the first press is cancelled = false
a held Space on the toggle is cancelled = true | rounds resolved by the hold = 0
```

## The listeners, and the two roots

```
listeners on #fightbar = 3   bound outside the boundary: none
listeners on #board    = 3   bound outside the boundary: none
```

Three each — `pointerdown`, `click`, `keydown` — every one through
`App.boot.wrap`, read back structurally by name and arity, floored on the count
per root. `focusin`, `focusout` and `cancel` are declined **in writing**, in
`bindResetAsk`'s register: not one node in either root is a field and neither
root is a `<dialog>`.

## The thirteen rows, and what each one closes

| row | what it asserts | the probe behind it |
|---|---|---|
| 93 | the act partition off the page, both halves, six ops named in the label | AF |
| 93b | every listener on both roots through `App.boot.wrap`, two floors | 68c/90c's shape |
| 93c | a repeated Enter on Advance and Space on the toggle are cancelled; the first press is not | D-17 |
| 94 | no node inside `#ledger` carries `data-k`, `data-act`, `data-amt`, `.brd-value`, `.brd-line--opt` | AG, and 63b's shape |
| 94b | every `data-k` on the page is unique, with a fight running | AG |
| 95 | the whole disabled set across three boards built to the same shape | **W**, AI |
| 96 | an Advance moves the state **and** the page, in one row | **AH**, and 72/73's shape |
| 97 | **D-13's rendered half** — no LEAF of the live reading names both factions | **AE** |
| 98 | **the dead marker draws the stored flag**, read off the PAGE, three readings | **AB** |
| 99 | the focus contract over a rebuilt chooser list | 05-07's requirement 3 |
| 100 | an op that changes what is drawn without moving a stepper repaints both surfaces | **S**, 05-08's requirement 3 |
| 101 | REF-03 with a fight actually being PLAYED | check 62 extended |
| 102 | the phase's acceptance run — six values off the page | 04-07's shape |

Every requirement plans 05-07, 05-08 and 05-09 wrote onto this plan is closed:
05-07's 1, 3, 4, 5 and 6 (2 was closed by 05-08), 05-08's 2 and 3, and 05-09's
1, 2 and 3. **05-08's requirement 1 — ledger row NODE identity — is folded into
row 100's third clause**, which asserts the already-drawn row is the same object
after a rename, which is the identity claim probe Y found nothing watching.

## The three silences, closed

### D-13, probe AE (row 97)

```
live reading boxes = 1   leaf strings = 11
faction names read live = ["Cats","Mechs"]
leaves naming both      = []
```

It is a **leaf** walk and not a region walk, because the region legitimately
names both factions — once per side, in two different statements — which is the
whole of what D-13 permits. What it forbids is one sentence holding both.

### The dead marker's source, probe AB (row 98)

Read off the page, four ways each, because a state is said more than once:

```
c1 at health 0, nobody ruled = {"marked":false,"pressed":"false","tokens":0,
                                "saidShown":false,"says":"","enabled":true}
c2 at health 3, ruled dead   = {"marked":true,"pressed":"true","tokens":1,
                                "saidShown":true,
                                "says":"Still on the roster, ruled dead.",
                                "enabled":true}
c2 ruled BACK                = {"marked":false,"pressed":"false","tokens":0,
                                "saidShown":false,"says":"","enabled":true}
```

### The never-disable rule, probe W (row 95)

```
controls compared = 147
funded === cannot pay and cannot meet = true
funded === three ruled dead           = true
fight pools driven to [0,0]
the report moved: "Slash costs 1 Action points of 3. Enough to spend."
               -> "Slash costs 9 Action points of 0. Not enough to spend. Short by 9."
the advance entry     = ["fg/advance=false"]
every =true entry     = ["fg=true"]
alive toggles disabled = []
```

The one `=true` the set holds is `#fight-start`, and it is **named** rather than
tolerated: `startFight` throws on a fight already running, so that one is the
tool bounding what it can do to ITSELF — 71c's own sentence about the picker's
Remove.

## The acceptance run, value by value (row 102)

Every press below is a real press on a real control. Not one value is read out of
state except the last, which is a claim about a slice the page does not draw.

```
declaration lines on the page = 2

THE SIX, off the page:
  the round on the bar   "2"
  the cats pool          "CatsAction points0 of 3 spent3 left to spend"
  the mechs pool         "MechsAction points0 of 3 spent3 left to spend"
  m1's health row        6 tokens
  ledger rows            1
  what changed           "Cats Nothing on this side changed in round 1.
                          Mechs Mech 1 — Shield 3 to 2."

the hand marker is shown = true  and says "Set by hand"
the health row beside it is the BUILD allocation and did not move: 6 -> 6
the what-changed reading DID move:
  "Cats Nothing on this side changed in round 1.
   Mechs Mech 1 — Health 6 to 7. Mech 1 — Shield 3 to 2."

cards before/after ruling a unit dead = 9/9   and it draws as marked = true
the undo moved the board = true   and the unit draws as standing again = true
after the fight reset: round "1"  ledger rows 0  cards 9  build byte-identical = true
```

**Read the pool line.** `0 of 3 spent` is what the bar says at every observable
moment, and this run reads it back **verbatim** rather than asserting around it.
`advanceRound` spends and refills in one commit, so no frame is rendered between
the two writes. FIGHT-09 wants spent visibly distinct from available; plan 05-07
measured this, wrote the two admissible fixes at the site and handed it on as a
developer decision. It is still one, and it is limitations entry 30.

**And read the health line.** The board's health row draws `unit.maxHp` off
`state.build`, which is FIGHT-10's division said out loud — so a ruling that
moves the FIGHT's health by one puts a marker on a line whose number did not
move. The row asserts the number is UNMOVED so a later plan pointing it at the
fight slice reddens; whether the pair reads as *a person set this* is limitations
entry 29.

## The other rows' readings

```
93b  listeners #fightbar 3 / #board 3, none raw
93c  repeat cancelled true, first press cancelled false, hold resolved 0 rounds
94   rows on the page 2, leaf strings 154, attributes found []
94b  keys on the page 147, duplicates []
96   state moved true (109lli7 -> 1dcd5z) | page moved true (17vhvlj -> 1pkxwot)
     the round on the bar "1" -> "2" | ledger rows 0 -> 1
99   key "fg/by/cats/c1" | node replaced true | keyboard on "fg/by/cats/c1"
     | it reads as chosen "true"
100  bar moved true, says the new action name true
     ledger moved true, says the new token name true
     the already-drawn row is the SAME NODE true
101  action and reference cards 6, leaf strings out of them 17,
     setup-only Add buttons 0, rounds in the ledger 1
```

## The four probes, run after their task's commit, recorded verbatim, reverted

`git checkout -- cats-vs-mechs.html` was never used. Every revert was a `cp` from
a scratchpad snapshot and `git status --short` read clean after each.

### PROBE AF — `advanceRound` moved into `UI_ACTS` and handled locally

**RED, and check 93 NAMES THE OP.** Seven checks reddened, including the shipped
90b:

```
93.  FIGHT OPS PARKED IN UI_ACTS = ["advanceRound"]
90b. UI_ACTS entries that ARE ops = ["advanceRound"]
interaction gate: 153 of 160 — 7 failed
exit=1
```

The seven are 90b, 93, 94, 96, 100, 101 and 102 — 90b and 93 on the partition
itself, the other five because the locally-handled Advance writes no round record
so the ledger never grows. **The walk IS covering the fight region**, and it is
covering it from two directions.

### PROBE AG — one ledger row given a `data-k`, and what it costs

The key injected was `fg/alive/c1`, which is a live control's own key, so both
halves of the hazard are driven at once.

```
94.  rows on the page=2  leaf strings=154
     attributes found: ["ld-row/data-k","ld-row ld-row--in/data-k"]
94b. keys on the page=149  duplicates=["fg/alive/c1","fg/alive/c1"]
interaction gate: 158 of 160 — 2 failed
```

**RED on both.** And the second half — what it COSTS, driven rather than
reasoned about:

```
AG 1. ledger rows on the page = 1
AG 1. and the first row carries data-k = "fg/alive/c1"
AG 2. the keyboard, before the rebuild = BUTTON.dc-alive data-k="fg/alive/c1"
AG 2. keyed(#board, "fg/alive/c1") is the toggle = true
AG 2. keyed(#app,   "fg/alive/c1") is the toggle = false
AG 2. keyed(#app,   ...) is a LEDGER ROW instead = true
AG 3. ledger rows after the second Advance = 2
AG 3. WHERE THE KEYBOARD LANDED = BUTTON.dc-alive data-k="fg/alive/c1"
AG 3. the toggle node was replaced by the rebuild = true
AG 3. and the keyboard is on the NEW toggle = true
```

**The focus restore SURVIVES, and the reason is one scope away from not
surviving.** `structure()` calls `withPreservedFocus(#board, …)` and `#ledger`
sits OUTSIDE `#board`, so `keyed()` never reaches the poisoned row — which is
exactly the position `[S06.8]`'s own comment says it chose the region's place in
the document for. But `keyed(#app, 'fg/alive/c1')` returns **the ledger row**, an
`<article>` that cannot take focus at all. So the hazard is real and it is one
widened container away: any future plan scoping a focus restore to the shell
rather than to `#board` hands the keyboard to a history entry. That is the
measured hazard, reproduced in the gate.

### PROBE AH — the Advance handler made to dispatch nothing

**RED, and row 96 fired on BOTH halves:**

```
96. state moved=false (109lli7 -> 109lli7) | page moved=false (17vhvlj -> 17vhvlj)
    the round on the bar "1" -> "1" | ledger rows 0 -> 0
interaction gate: 154 of 160 — 6 failed
```

Both halves. The other five that reddened — 94, 95, 100, 101 and 102 — are the
downstream consequence of a ledger that never grows, which is itself the point:
a press that does nothing is visible from five directions once the rows drive the
page instead of the state.

### PROBE AI — the alive toggle disabled on a unit already ruled dead

Injected at the tidy-looking place, `[S06.9]`'s per-frame pass beside
`dcClass(btn, 'dc-alive--on', dead)`.

**RED on 95 and on 98, and 95 names the three toggles by key:**

```
95. controls compared=147
    funded === cannot pay and cannot meet = true
    funded === three ruled dead           = FALSE
    alive toggles disabled = ["fg/alive/c1=true","fg/alive/c2=true","fg/alive/m1=true"]
98. c2 at health 3, ruled dead = { …, "enabled":false }
interaction gate: 158 of 160 — 2 failed
```

**The comparison IS reaching this phase's controls** — 147 of them, keyed by
`data-k`, and the three it names are exactly the three that were ruled.

## What a real browser found

Real Chrome **and** real Edge, `channel: 'chrome'` / `'msedge'`, `file://`,
1920x1080, every press a real click. **Zero page errors and zero console errors
in both, on every run.** Identical readings in both browsers throughout.

```
1.  a fight is running after a real click = true;  start control disabled = true
2.  the chooser attributes on the root = ["slash","c1","m1"]
    the pressed pills read as chosen =
      ["fg/act/cats/slash","fg/by/cats/c1","fg/at/cats/m1"]
    the report on the page = "Slash costs 1 Action points of 3. Enough to spend."
3.  the record after both sides declared =
      [{"side":"cats","act":"slash","by":"c1","at":"m1"},
       {"side":"mechs","act":"fly","by":"m1","at":"c1"}]
    declaration lines on the page =
      ["Cat 1 uses Slash on Mech 1.","Mech 1 uses Fly on Cat 1."]
4.  round "2" | ledger rows 1 | what changed
      "Cats Nothing on this side changed in round 1. Mechs Mech 1 — Shield 3 to 2."
5.  HELD ENTER on Advance for 1.4s: 1 round resolved
6.  HELD POINTER on Advance for 1.6s: 1 round resolved
7.  the alive toggle: alive false / pressed "true" / class "unit-card dc-card--dead"
      / disabled false / "Still on the roster, ruled dead." / 1 dead token
    and back on a second click: alive true / pressed "false" / disabled false
8.  an unfinished Declare press: declarations 0 -> 0, the error panel stayed shut
10. after a real fight reset: round "1", ledger rows 0, build survived true
12. page errors and console errors = []
```

### The finding, and the CONTROL that turned it from a regression into a fact

**A POINTER press on any control whose own node is rebuilt drops the keyboard to
`<body>`** — and it does so on plan 02-03's token picker exactly as it does on
this phase's chooser, which is the reading that matters:

```
A. fight chooser, POINTER  = BODY  data-k=undefined
B. fight chooser, KEYBOARD = BUTTON.fg-pill        data-k="fg/by/cats/c2"
C. token picker, POINTER   = BODY  data-k=undefined
C. token picker, KEYBOARD  = BUTTON.pk-list-item   data-k="pk/list/shield"
D. a board stepper (node NOT rebuilt), POINTER = BUTTON.stp-btn  data-k="cats/c1/maxHp+"
E. the alive toggle, POINTER  = BUTTON.dc-alive    data-k="fg/alive/c1"
E. the alive toggle, KEYBOARD = BUTTON.dc-alive    data-k="fg/alive/c2"
```

`withPreservedFocus` restores the keyboard during `pointerdown`; the browser's own
default focus-on-mousedown then targets the node that was under the pointer,
which the rebuild has detached, and focus falls to `<body>`. The KEYBOARD path is
correct on every surface. **Two phases older and identical**, so the fix belongs
in `[S06.1]`'s `withPreservedFocus` and not in this plan's region. Logged to
`deferred-items.md` rather than fixed — the executor's scope boundary, and row 99
records that the stub does not see it.

### The viewport budget, re-read and NOT fixed

Real Chrome, one round resolved through real presses:

```
board top @1920x1080 = 1203
board top @1366x768  = 1111
```

**No row in this plan asserts that the board is on screen, because it is not.**
This plan changed no CSS and no shell markup. It is plan 05-09's measured
checkpoint decision — a wrapper element in the static shell and a rewrite of
`[C14]`'s `#fightbar, #ledger` rule, which are plan 05-06's markup and plan
05-06's frame rule. It is `REHEARSAL.md` B3 and limitations entry 21.

## The limitations list, in full — this is plan 05-11's script

Entries 1 through 20 stand. Two were re-read and extended, and twelve are new.

**Entry 5 — re-read with the surface built, and it still reads correctly.** Row
92's second harvest is taken on a board where a round has been PLAYED, so the
fight bar, the ledger and the board's own markers are all painted for it; the
harvest moved from 101 strings to 420 across plans 05-07 to 05-09, which is the
measurement that says so rather than the claim.

**Entry 13 — paid, and what was paid is named.** Rows 93 to 102 read the copy
behind an interaction: a declaration line that exists only because somebody
declared, a ledger row that exists only because somebody advanced, the dead
marker and its sentence, and the by-hand marker. **What is still not driven** is
named so the entry keeps meaning what it says: a fight carried past two rounds,
so a record rolling off `MAX_PAST_ROUNDS` is unread; a declaration naming NOBODY
in either position; an action whose cost is in a type a student invented; and
every line the error panel would carry.

**The twelve new entries:**

| # | what | who can close it |
|---|---|---|
| 21 | the viewport budget — the sum of two stacked regions, with the full dial sweep and the side-by-side numbers | **a decision**, `REHEARSAL.md` B3 |
| 22 | whether the ledger's own scroll leaves `#strip` still pinning | machine (browser) |
| 23 | whether the topbar cluster wraps and moves `[S08]`'s measured bar height | machine (browser) |
| 24 | whether a past round reads as *past* rather than as *disabled* | human |
| 25 | whether the round and both pools are legible from the back of a room | human |
| 26 | whether a dead unit is legible as dead without relying on colour | human |
| 27 | whether the three-fact split is clearer than one number, or merely longer | human |
| 28 | D-13 now HAS a check; what neither half sees is a comparison made without naming either side | human |
| 29 | whether a by-hand marker reads as being about the fight when the number beside it is the build's | human, **new with this plan** |
| 30 | the spent reading measures zero at every observable moment, and this gate is now on the record about it | a developer decision |
| 31 | whether a real browser obliges a cancelled key repeat | machine — **closed above**, 1 round for 1.4s of held Enter |
| 32 | whether a student finds the declaration step at all | human |

## Deviations from Plan

### Auto-fixed

**1. [Rule 2 — missing critical functionality] The keyboard's own ramp on this
region's controls**
- **Found during:** Task 1, reading `[S07.1]`'s `onKeyDown` alongside `actTarget`
- **Issue:** `[S07.1]` suppresses a held Enter or Space only for nodes carrying a
  `data-act`; every control in `[S07.5]` deliberately carries none, so a held
  Enter on Advance would have resolved rounds at the OS auto-repeat rate — the
  exact outcome the region's own banner says `HOLD_ACTS` exists to prevent.
- **Fix:** `onFightKeyDown`, bound on both roots through `App.boot.wrap`,
  cancelling only a repeat and only for `[data-fg]` / `[data-dc]`.
- **Files modified:** `cats-vs-mechs.html`
- **Commit:** `2bffcb3` — asserted by row 93c (`90f56cf`) and confirmed in both
  browsers.

**2. [Rule 1 — bug] The first draft of row 95 compared boards whose control sets
differed for a reason that had nothing to do with disabling**
- **Found during:** Task 2, the first run of the disabled-set row
- **Issue:** the funded board carried a declaration and the driven board resolved
  it on the Advance that emptied the pools, so the Clear control on that line
  went away and the whole-set comparison reddened over a rebuild rather than over
  a disable.
- **Fix:** every board is now built to the same shape — a fight running and
  exactly one declaration standing — with probe W's like-for-like construction
  written into the comment beside it.
- **Commit:** `90f56cf`

**3. [Rule 1 — plan premise corrected] The acceptance run's "one unit's health"**
- **Issue:** the plan expected a hand ruling to move the health row on the card.
  `amountFor`'s `hp` arm reads `unit.maxHp` off `state.build`, so it does not —
  FIGHT-10's documented division.
- **Fix:** the row asserts the board's health row is UNMOVED and that the marker
  and the what-changed reading BOTH move, with the mechanism written out, so a
  later plan pointing that row at the fight slice reddens rather than shipping.
- **Commit:** `90f56cf`

### Declined, with the reason recorded

**`clearDeclarations` — "clear all" — has no shipped control and this plan did
not add one.** The plan's action names it; `[S06.7]` ships a per-declaration
Clear and no Clear-all, and this plan's section ownership forbids touching any
`[S01]`–`[S06]` region or any static shell markup. The op is reachable,
dispatchable and unpressed, which is `UI_HANDLERS`' recorded "claimed and
ignored" window one layer out. It is **not** in the plan's `must_haves` truths.

**The health and shield hand rulings have no shipped control either**, for the
same reason and with the same consequence: `setUnitHp`, `nudgeFightHp` and
`setFightShield` are reachable and unpressed. That is also the first reason
`HOLD_ACTS` was not given `nudgeFightHp` — there is nothing on the page to hold.

**Nothing was pushed into `UI_ACTS`.** The plan's action says to push; the
argument for pushing nothing is written into the banner and is recorded above as
the plan's first decision. The `key_links` claim — "pushing and assigning; not
one line of `[S07.1]` is edited" — is satisfied on `LATE_BINDERS` (two pushes)
and on the not-one-line half, which is proved.

## Known Stubs

| stub | file | why it is intentional | resolved by |
|---|---|---|---|
| `clearDeclarations` has no control on the page | cats-vs-mechs.html | `[S06.7]` ships a per-declaration Clear and no Clear-all, and this plan owns no `[S06]` region. Advance and the fight reset both empty the list, so the state is reachable; the op is reachable, dispatchable and unpressed | a later plan, or never — the surface may not need one |
| the health and shield hand rulings have no control on the page | cats-vs-mechs.html | the board's steppers edit the BUILD, which is what FIGHT-10's line says out loud. Adding fight-mode steppers is `[S06.9]`'s work and this plan owns no `[S06]` region | 05-11's judgement, then a later plan |
| `App.render.ledger` and `App.render.boardFight` still have no handler caller | cats-vs-mechs.html | both were exported so a row could paint the region onto a state it just wrote. Rows 94, 98 and 100 drive both regions through real presses and `A.state.flush()` instead, which is the stronger reading, so the exports remain reader-facing entry points rather than dead code | — |

None prevents this plan's goal, which was to make every fight control pressable
and to make the gate able to fail on it.

## Threat Flags

None. No new network endpoint, auth path, file access pattern or schema change
at a trust boundary. The plan's six mitigations, as shipped:

| Threat | Mitigation, as shipped |
|---|---|
| T-05-42 a fight op parked in `UI_ACTS` | row 93 reads the partition off the page with all six ops named in the label; **probe AF drives the move and it reddens naming `advanceRound`, on row 93 and on the shipped row 90b** |
| T-05-43 a ledger row carrying `data-k` and stealing focus restore | rows 94 and 94b walk the rendered region and the whole page; **probe AG drives it and MEASURES the cost — `keyed(#board)` survives because `#ledger` sits outside it, `keyed(#app)` returns the row** |
| T-05-44 a press that moves state but not the screen, or the reverse | row 96 asserts both in one row; **probe AH fires BOTH halves** |
| T-05-45 a control disabled on a dead unit | row 95's whole-set comparison over 147 controls across three boards; **probe AI reddens naming the three toggles by key** |
| T-05-46 a spatial failure shipping because nothing names it | twelve numbered limitations entries, 21 through 32, each an item in plan 05-11's script; two logged to `deferred-items.md` |
| T-05-SC npm/pip/cargo installs | zero packages installed by this plan. Playwright was resolved from an existing dev-only install via `PLAYWRIGHT_DIR` and is not a dependency of anything shipped |

## What plan 05-11 inherits

- **The whole limitations list, entries 21 through 32**, which is the script.
  Four are machine-closable and one of those (31) is already closed above.
- **The viewport budget** is the first item and it is a decision with numbers,
  not a dial: `REHEARSAL.md` B3, limitations entry 21, `deferred-items.md` item 2.
- **The spent reading** is the second, with its two admissible fixes at the site.
- **PROJ-05** is still one comment either way, as plan 05-09 left it.
- **Everything is now pressable.** The playtest can be played: start, declare
  both sides, advance, rule by hand, mark a unit down and back, undo, reset —
  every one of them a press, in real Chrome and real Edge, with no console error.

## Self-Check: PASSED

```
FOUND: cats-vs-mechs.html                                   ([S07.5] marker x4)
FOUND: tests/selftest-node.cjs                              (advanceRound x11)
FOUND: .planning/phases/05-fight-loop-playtest/deferred-items.md
FOUND: .planning/phases/05-fight-loop-playtest/05-10-SUMMARY.md
FOUND: 2bffcb3  feat(05-10): [S07.5] — every fight press, through the four seams
FOUND: 90f56cf  test(05-10): the fight's rows — the partition, the ledger, the set, the run
node tests/selftest-node.cjs  ->  1188 passed, 0 failed; 160 of 160; exit 0
PLAYWRIGHT_DIR=... node tests/browser-checks.mjs  ->  22 passed, 0 failed
```
