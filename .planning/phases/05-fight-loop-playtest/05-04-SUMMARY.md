---
phase: 05-fight-loop-playtest
plan: 04
subsystem: state
tags: [s05-ops, advance-round, s09-10-boundary, s09-12, fight-02, fight-13, fight-14, fight-16, d-00d, d-23, d-26]

requires:
  - phase: 01-foundation
    provides: "commitStructural and its rule, commit()'s label-keyed coalescing and COALESCE_MS, int(), findUnit, fightOf, SIDES, MAX_ALLOC"
  - phase: 02.1-token-authoring
    provides: "tallyType / tallyOwner / readTally / writeTally — the four functions setTally runs, reused whole so a student-made type has no second tier (D-24)"
  - phase: 03.1-action-authoring
    provides: "the action record shape, findAction, requireXfWho and the exported XF_WHO allowlist, termsOf, and the three [S09.10] boundary rows written against this phase on purpose"
  - phase: 05-fight-loop-playtest
    plan: 02
    provides: "the fight slice with decl and past seeded empty, MAX_PAST_ROUNDS, freshFight, and [S09.12] itself"
  - phase: 05-fight-loop-playtest
    plan: 03
    provides: "App.model.damageSplit and App.model.termDamage — both pure, both unspent until now — state.fight.decl and the three declaration ops, and the named hazard that the auto-kill lives at the applier"
provides:
  - "[S05].advanceRound — THE one applier in this file. One press, one commitStructural, one undo entry, both sides at once"
  - "the DOES / does NOT table written into the artifact above the op, one row and one reason each"
  - "the written ruling on the pool that cannot pay, with its two declined alternatives beside it"
  - "the pool-refills-each-round ruling, an inference from bestPair promoted to an explicit decision"
  - "the shield-does-not-refill ruling, written beside the split"
  - "the round record: { round, was, did[] }, pushed BEFORE the walk, capped at MAX_PAST_ROUNDS with the oldest dropped"
  - "[S09.10] rows 1 and 3 in their positive form — an allowlist of exactly ['advanceRound'], and a row that still DRIVES the router against a board with no fight"
  - "[S09.10]'s new fourth row: no op reads REFERENCE.beats and no op writes keywords, driven from inside a resolved round"
  - "harness check 72b turned the same way in the same change"
  - "[S09.12] grows from 75 rows to 102 — one round driven end to end, D-00d at the applier in both directions, the undo accounting driven, four refusals, and the cap"
affects: [05-05, 05-06, 05-07, 05-08, 05-09, 05-10, 05-11]

tech-stack:
  added: []
  patterns:
    - "a ruling pass on the LIVE board and an apply pass on the detached copy — tallyOwner's two-call shape widened to a whole round, so a refusal leaves no phantom undo step and the mutator cannot throw halfway through"
    - "a boundary assertion rewritten into an ALLOWLIST rather than deleted, so the one legitimate name is stated and every other spelling still reddens"
    - "a row that DRIVES a router arm can tell an absent arm from a silent op, because the two answer with different sentences; a row that reads the export list cannot"
    - "a record-versus-live PAIR reading, because a row that reads only the record is comparing a copy against itself when the record is pushed at the wrong moment"
    - "a suite row must restore inside a `finally` — the fourth plan in a row to be taught this by its own probe"
    - "a non-vacuity check on a driven relationship row: if the losing side of a relationship declares no term, the row cannot move a number and passes over the violation"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "the pool that cannot pay FLOORS AT 0, the shortfall is recorded and the terms STILL LAND — int()'s floor is 0 everywhere and apSpent is floored in the derivation; the two declined alternatives are named in the file"
  - "the pool REFILLS EACH ROUND from state.build[side].ap, as the LAST act of the round — so the pool a student reads while declaring is the pool for the round they are declaring, and a mid-fight build edit reaches the fight at the next refill (FIGHT-10 with a stated boundary)"
  - "the shield does NOT refill; a student's OWN authored +shield term does land, because that is a number they wrote down"
  - "the walk is SEQUENTIAL in declaration order, not taken against a frozen pre-round snapshot — a snapshot reading lets two hits spend the same shield point twice, which is a shield refilling by arithmetic"
  - "commitStructural rather than commit, taken NOW for a reason that lands with plan 05-08, because the op that pushes the record and the frame that draws it must not be able to disagree"
  - "the record carries only what a board diff CANNOT show — what was paid against what was declared, the split's three numbers, and the terms that did not land. `hand` is NOT seeded: a field with no writer beside a record that has one is `log` again"
  - "the split is taken through App.model.termDamage, the file's one reading of a term as damage, so a caster-side negative delta is a plain signed write and whether a shield should absorb self-harm stays the table's ruling"
  - "a term naming a token type the fight slice holds no number for (`dmg`, `dead`) lands nowhere and is RECORDED, which is D-16's treatment; a term naming a type that has been REMOVED is refused by name, which is ACT-07's"
  - "row 2 of [S09.10] was not touched, and the empty diff over it is the evidence"

patterns-established:
  - "roundNow() — read the round so a board with no fight is a VALUE and not an exception, because undo crosses the fight boundary by design"
  - "an allowlist constant beside a boundary check (APPLIER_ALLOWED) so the one legitimate name is stated once"

requirements-completed: []

duration: 150min
completed: 2026-08-29
---

# Phase 05 Plan 04: Advance — The One Applier Summary

**One press now resolves the declared round for both sides in one commit and one
Ctrl+Z, the table of what Advance may never decide is in the artifact rather
than in a plan, and five probes found four defects in this plan's own rows —
including one that made the phase's most important assertion half-blind.**

## The gate, before and after

| | before (05-03) | after |
|---|---|---|
| suite | 1128 passed, 0 failed | **1156 passed, 0 failed** (+28) |
| `SUITE_FLOOR` | 1098 | **1126** |
| `[S09.12]` rows | 75 | **102**, zero skipped |
| `[S09.10]` boundary rows | 3 | **4** |
| interaction gate | 147 of 147 | 147 of 147 |
| stub-drift | 96 shell ids | 96 shell ids |
| `#app` (setup) | 127, floor 117 | 127, floor 117 |
| `#app` (fight) | 101, floor 41 | 101, floor 41 |
| dialogs | 145 across 4 roots, floor 138 | 145 across 4 roots, floor 138 |
| proposal pane | 60, floor 23 | 60, floor 23 |
| Layer B literals | 6101 | 6225 |
| exported ops (check 74) | 53 | **54** |
| dispatch arms driven (check 74) | 21 of 62 | **22 of 63** |
| action records read (check 74) | 461 | **468** |
| perf gate | 7 ms of 50 | **6–7 ms of 50** |
| naming greps | 0 / 0 | **0 / 0** |

`node tests/selftest-node.cjs` exits 0.

## The tripwires, RED before and GREEN after

### Before task 2 — recorded verbatim from the run after task 1's commit

```
FAIL  action authoring :: no op exported by [S05] applies a transformation
      actual:   ["advanceRound"]
      expected: []
FAIL  action authoring :: ACT-05 IS HALF-DELIVERED ON PURPOSE: no op anywhere in
      [S05] applies a transformation, spends a cost, tests a requirement against
      a unit or moves a token ...
      actual:   ["advanceRound"]
      expected: []
FAIL  action authoring :: THE REMAINING HALF OF ACT-05 IS THE ADVANCE PATH AND
      IT BELONGS TO PHASE 5: no op advances a round and the dispatcher refuses
      one ...
      actual:   false
      expected: true
1125 passed, 3 failed

FAIL  interaction gate :: 72b. THE NO-APPLIER CHECK ...
      appliers found: advanceRound | router refused an applier act: true
      | state stood still: true | App.ops exports 54: ...
INTERACTION GATE: 1 check(s) failed
```

**FOUR tripwires reddened, not three.** The plan names rows 1 and 3 of
`[S09.10]`. A **fourth** was found on the run: `[S09.10]` carries an OLDER,
narrower row from plan 03.1-07 (`/^(apply|resolve|advance|spend|fire)/`) whose
family is a subset of row 1's, and **check 72b in `tests/selftest-node.cjs`**
bans the same wide family outright. Both were turned in the same change, for the
same stated reason — see Deviations, item 1.

### After task 2 — all four green, and row 2 untouched

`1129 passed, 0 failed`, interaction gate `147 of 147`, exit 0.

- **Row 1** now asserts the filtered list is **exactly `['advanceRound']`**.
  Probe M confirms `applyDamage`, `resolveRound` and every other spelling still
  redden.
- **Row 3** still **drives** `dispatch('advanceRound')`, now against a board with
  no fight running, and requires `fightOf`'s refusal by name. Probe N confirms it
  reddens differently for an absent arm (`Unknown op: advanceRound`) than for an
  op that stopped refusing (`DID NOT REFUSE`).
- **The older narrow row** now asserts the two families answer the SAME one name,
  which is the one thing a redundant pair can earn its place doing.
- **Check 72b** carries `APPLIER_ALLOWED = 'advanceRound'` and reddens on
  anything outside it.

### Row 2: read, confirmed, and left alone

`git diff` over row 2 is **empty** — the string `NO PROPOSAL LIVES IN ANY SLICE`
does not appear in this plan's diff at all.

Its walk was run separately over the state it never sees at gate time — a fight
carrying **both** an unresolved declaration and a resolved round:

```
round / decl / past    : [2, 1, 1]
row 2 walk over THAT state : []
round-record key set   : did,round,was
did[0] key set         : act,apPaid,apShort,at,by,hit,side,unlanded
was key set            : cats,mechs
```

Green, and green over the record the **op** writes rather than one a suite
author guessed at. It was left alone because its job is keeping a proposal off
the slices; plan 05-03 honoured it by naming (`by` / `at`, never `caster` /
`target`) and this plan does too — every key `advanceRound` writes is clean by
construction.

## The one round, driven

Shipped board, one Slash declared on a Mech, `advanceRound()`:

```
advanceRound returned        2
round                        1 -> 2
cats pool before / after     3 / 3     (paid 1, then refilled — see the ruling)
m1 before {hp, shield, alive} [6, 3, true]
m1 after  {hp, shield, alive} [6, 2, true]
past.length                  0 -> 1
decl.length                  1 -> 0
build byte-identical         true
build code identical         true
```

The record the op wrote, in full:

```json
{"round":1,
 "was":{"cats":{"ap":3,"units":[{"id":"c1","hp":3,"shield":0,"alive":true}, ...]},
        "mechs":{"ap":3,"units":[{"id":"m1","hp":6,"shield":3,"alive":true}, ...]}},
 "did":[{"side":"cats","act":"slash","by":"c1","at":"m1",
         "apPaid":1,"apShort":0,
         "hit":{"shield":1,"health":0,"spare":0},
         "unlanded":[]}]}
```

## The undo accounting, both deltas

```
undo depth delta for ONE Advance                         1
two fast Advances: round after both / after 1 undo / after 2 undos   [3, 2, 1]
one undo restores byte-for-byte (and it really moved)    [true, true]
```

**Two Advances 400 µs apart are two undo entries**, driven with two real calls.
Under probe P's shortened label the same drive reads `[3, 1, "NO FIGHT"]` — one
Ctrl+Z rewinding two rounds and the next landing past `startFight`.

## The refusals

```
advanceRound with no fight        ["No fight in progress", undo delta 0]
advanceRound with NO declarations round 1 -> 2, past.length 1, did.length 0
```

Recording that a side did nothing is a fact, not a defect, and the round steps.

The four reachable refusals are driven in `[S09.12]`, each by name, each leaving
the board byte-identical with no phantom undo entry:

| what | message |
|---|---|
| no fight running | `No fight in progress` |
| a declaration naming an action that has since gone | `There is no action "x1" on this side.` |
| a term naming a token type that has since gone | `"Pounce" changes "t1", and there is no token type "t1" on this board.` |
| a term naming a party the allowlist does not hold | read off `requireXfWho` itself |

**A fifth shape the plan asked for is not reachable, and the finding is worth
more than the row would have been.** *"A declaration naming a removed unit"*
cannot be produced through the shipped ops: `removeUnit` edits the **build**, and
the fight roster is copied once at `startFight` and never rebuilt, so no unit
ever leaves a running fight — and `declareAction` already refuses an id that is
not on it. The refusal exists at declaration time and the declaration bad-input
table drives it there.

## The pool that cannot pay, driven

Cats' pool driven to 0, one Slash declared:

```
pool after / apPaid / apShort   [0, 0, 1]
m1 shield/hp before -> after    [3, 6] -> [2, 6]
hit                             {"shield":1,"health":0,"spare":0}
```

**The pool floors at 0, the shortfall is in the record, and the terms still
land.** As written in the file, with both declined alternatives beside it:

> Declined 1: let the pool go negative and show it. Truthful about the
> over-commitment and untruthful about the pool, which is a quantity of tokens on
> a board and cannot be less than none of them.
> Declined 2: apply nothing, and record that the cost was unpaid. That is
> Advance deciding whether an action happens, which is D-23's other half.

## The refill rulings, as written

**The pool refills each round**, from `state.build[side].ap`, as the **last** act
of the round. Two facts fall out and both are in the file:

- the pool a student reads while declaring is the pool for the round they are
  declaring — always full, never last round's leftovers;
- FIGHT-10's boundary is stated rather than accidental: a build edit made
  mid-fight reaches the fight at the **next refill** and not before.

Its named cost: action points do not carry across a round boundary in either
direction. Unspent points are gone, and a student-authored term that **gained**
points applies to the round it landed in and no later one. One rule instead of
two; the alternative (carrying a delta forward) makes the pool a second drifting
number the projection cannot see.

**The shield does not refill.** `Recharge`'s shield gain stays deliberately
absent from `DEFAULTS`. A student's **own** authored `+shield` term does land,
because that is a number they wrote down themselves — and `[S09.12]` drives
exactly that case.

## The resolution order, measured

The plan asked for the measurement that makes the order a presentational choice.
It holds on the shipped board:

```
cats-first  === mechs-first : true
cats-first  === interleaved : true
```

And the case where it does **not** hold, measured, because the file should not
imply an order-independence it does not have:

```
two 3-damage hits on one Mech (shield 3, health 6), sequential : shield 0, health 3
the same pair against a FROZEN pre-round board would give      : shield 0, health 6
did: [{"shield":3,"health":0,"spare":0},{"shield":0,"health":3,"spare":0}]
```

A frozen-snapshot reading lets each hit spend the same three shield points — **a
shield refilling by arithmetic**, which is the one thing the table above the op
says Advance may not do. So the walk is sequential, in declaration order, and the
comment says both halves.

## No unit is automatically marked dead — both directions

Driven through a real Advance in `[S09.12]`:

```
a real Advance takes c1 to zero health   [hp 0, alive true, aliveCount(cats) 9]
a unit ruled dead stays dead across one,
and a unit ruled dead at FULL health too [false, 0, false, 3, aliveCount 7]
```

Wave 3's message — *"the auto-kill hazard is at `advanceRound`, not in the
split"* — is answered where it lives. `applyTerm` carries the fourth statement of
D-00d in this file, at the exact line where somebody would write the kill.

## The cap, driven

`MAX_PAST_ROUNDS + 3` Advances, read as four figures rather than one:

```
[list.length, first kept .round, last .round, live round]  =  [30, 4, 33, 34]
```

Rounds 1, 2 and 3 dropped off the bottom; the newest is still there; the fight
kept going after the history stopped growing.

## The measurements

```
MAX_PAST_ROUNDS                                        30
UNDO_LIMIT                                             30
COALESCE_MS                                            500
fight slice, nothing declared                         600 bytes
fight slice at the declaration cap                   3143 bytes
bytes of fight slice at 0 / 10 / 30 resolved rounds   600 / 6581 / 18561
ms per commit at those same three depths              0.1 / 0.275 / 0.65
perf gate                                             6-7 ms of a 50 ms budget
```

Research measured 613 B / 21,243 B / 35,003 B and 0.063 / 0.315 / 0.485 ms in a
browser. The sandbox's byte figures come in **lower** at depth — the record this
plan writes is smaller than the one research modelled, because `hand` is not
seeded and `was` carries the two sides only. The per-commit cost is roughly
**1.3× research's** at the cap, which is the sandbox rather than the shape; the
perf gate's hundred commits still land at 6–7 ms against a 50 ms budget.

## Probes: run after their task's commit, recorded verbatim, reverted from a file snapshot

`git checkout -- cats-vs-mechs.html` was never used. Every revert was `cp` from a
scratchpad snapshot, and `git status --short` was read clean after each.

### PROBE M — an applier that is not the one applier

**Part 1, an exported `applyDamage` that does nothing:** RED, and it NAMES it.

```
FAIL  action authoring :: the narrow applier family ... answer the SAME single name ...
      actual:   [["advanceRound","applyDamage"],["advanceRound","applyDamage"]]
      expected: [["advanceRound"],["advanceRound"]]
FAIL  action authoring :: ACT-05 IS DELIVERED BY EXACTLY ONE OP ...
      actual:   ["advanceRound","applyDamage"]
      expected: ["advanceRound"]
1127 passed, 2 failed
FAIL  interaction gate :: 72b. THE ONE-APPLIER CHECK ...
      appliers found: advanceRound, applyDamage | outside the allowlist: applyDamage
FAIL  interaction gate :: 74. THE NO-DAMAGE-WRITER CHECK ...
      writers found: applyDamage
```

**Part 2, `advanceRound` renamed to `resolveRound`:** RED again, with a different
message — **and it found a real defect in one of this plan's own rows.**

```
FAIL  ... actual: [["resolveRound"],["resolveRound"]]  expected: [["advanceRound"],["advanceRound"]]
FAIL  ... actual: ["resolveRound"]                     expected: ["advanceRound"]
FAIL  ... actual: [[],"Unknown op: advanceRound",true] expected: [[],"No fight in progress",true]
FAIL  action authoring :: suite threw
      actual:   TypeError: App.ops.advanceRound is not a function
      expected: no exception
1124 passed, 4 failed
```

`1124 + 4 = 1128` against a run of 1129 — **one row went missing** and the board
was left dirty. See Deviations, item 2. After the repair:

```
FAIL  ... actual: ["THE ROUND WAS REFUSED: App.ops.advanceRound is not a function"]
      expected: [2,2,1,0,"","",""]
PASS  action authoring :: the action-authoring suite handed the board back untouched
1125 passed, 4 failed
```

Four named failures, nothing lost, board handed back.

### PROBE N — the router arm

**Part 1, the `advanceRound` dispatch arm deleted:**

```
FAIL  action authoring :: THE REMAINING HALF OF ACT-05 IS THE ADVANCE PATH ...
      actual:   [[],"Unknown op: advanceRound",true]
      expected: [[],"No fight in progress",true]
1128 passed, 1 failed
```

**Part 2, `advanceRound` made to start a fight instead of refusing:**

```
FAIL  action authoring :: THE REMAINING HALF OF ACT-05 IS THE ADVANCE PATH ...
      actual:   [[],"DID NOT REFUSE",false]
      expected: [[],"No fight in progress",true]
1128 passed, 1 failed
```

**Two different messages for two different violations.** The row drives; it does
not read.

### PROBE O — the phase's most important probe

`advanceRound` made to read `REFERENCE.beats` and halve a damage term when a
relationship matches.

**First run: RED — but only half of it bit, and that is the finding.**

```
FAIL  action authoring :: NO OP IN [S05] READS REFERENCE.beats AND NO OP WRITES `keywords` ...
      actual:   [2,3,0,"","",""]
      expected: [2,2,0,"","",""]
```

Only the **Fly-over-Slash** reading moved. The second shipped relationship is
**Lasers over Hairball**, and Hairball ships with an **empty transformation
list** — so its losing side had no number to move, and a violation firing only on
that pair would have left the row spotlessly green. **The row was half-blind.**
Repaired: it now authors a term onto Hairball through `setActionXf` first, so
both `under` actions carry a hit. Re-run:

```
FAIL  action authoring :: NO OP IN [S05] READS REFERENCE.beats ...
      actual:   [2,3,2,0,"","",""]
      expected: [2,2,1,0,"","",""]
PASS  action authoring :: the action-authoring suite handed the board back untouched
1128 passed, 1 failed
```

**Both** relationship readings now move.

**PROBE O-b, added because the keyword half needed its own control:**
`advanceRound` made to record the effect keywords of every declared action onto
the fight slice.

```
FAIL  action authoring :: NO OP IN [S05] READS REFERENCE.beats AND NO OP WRITES `keywords` ...
      actual:   [2,2,1,0,"","fight.keywords",""]
      expected: [2,2,1,0,"","",""]
1128 passed, 1 failed
```

Red, naming the path. The row is not vacuous in either half.

### PROBE P — the commit label shortened to `'advance'`

**First run: it found a real defect in this plan's own row.**

```
FAIL  the fight loop :: suite threw
      actual:   TypeError: Cannot read properties of null (reading 'round')
      expected: no exception
1137 passed, 1 failed
FAIL  interaction gate :: 82. A LINK CARRYING BOTH DOES BOTH ...
```

Nineteen of `[S09.12]`'s own rows never ran and an unrelated interaction check
went red behind it. See Deviations, item 3. After the repair:

```
FAIL  the fight loop :: AND TWO ADVANCES ARE TWO ENTRIES, not one, driven with
      TWO REAL CALLS microseconds apart rather than by reading the label ...
      actual:   [3,1,"NO FIGHT"]
      expected: [3,2,1]
1155 passed, 1 failed
interaction gate: 147 of 147 checks passed
```

One row, readable: one Ctrl+Z rewound two rounds and the next landed past
`startFight`. **The row drives the funnel; it does not inspect the label.**

### PROBE Q — the record pushed AFTER the walk

```
FAIL  the fight loop :: THE RECORD HOLDS THE BOARD AS IT STOOD BEFORE THE ROUND
      RESOLVED, NOT A COPY OF THE BOARD AFTER ...
      actual:   [1,0,3,0,3]
      expected: [1,2,4,0,3]
FAIL  the fight loop :: THE HISTORY HOLDS EXACTLY MAX_PAST_ROUNDS AND WHAT DROPS
      IS THE OLDEST ...
      actual:   [31,3,33,34]
      expected: [30,4,33,34]
1154 passed, 2 failed
```

**The row reddens by naming the tautology.** Its actual reading is
`[1, 0, 3, 0, 3]` — the recorded shield and health (`0, 3`) are **identical** to
the live ones (`0, 3`), which is exactly the copy-against-itself shape plan
04-03's probe K found once already in this project. The **paired** reading is
what makes that visible; a row reading only the record would have been green.

The cap row reddened alongside it as a second consequence of the reordering, and
named it: `31` records instead of `30`.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 3 — blocking] TWO more applier tripwires reddened than the plan names**

- **Found during:** task 1's verification run
- **Issue:** the plan names rows 1 and 3 of `[S09.10]`. Two others ban the same
  family: an **older, narrower row** in `[S09.10]` from plan 03.1-07
  (`/^(apply|resolve|advance|spend|fire)/`), and **check 72b** in
  `tests/selftest-node.cjs`, which is not in the plan's `section_ownership` at
  all. Both went red on `advanceRound` and both had to be turned or the build
  could not go green.
- **Fix:** both rewritten into their positive form in the same change, never
  deleted — the plan's own instruction applied to the two rows it did not know
  about. Check 72b carries `APPLIER_ALLOWED = 'advanceRound'`. The older narrow
  row now asserts the two families answer the **same one name**, which is what
  keeps a redundant pair from being redundant: a later plan that widens one list
  and leaves the other stale reddens here.
- **Files modified:** `cats-vs-mechs.html`, `tests/selftest-node.cjs`
- **Commit:** `4796b25`

**2. [Rule 1 — bug] Two of this plan's own boundary rows could THROW rather than FAIL**

- **Found during:** probe M part 2
- **Issue:** the new fourth row drives `App.ops.advanceRound()` directly. With
  the export renamed away that is a `TypeError`, and a throwing row kills the
  suite: `[S09.10]` lost one of its own rows and the board was left dirty for
  every suite after it. Row 3's `endFight` drive and `restore` had the same
  exposure. **This is the third plan in a row taught the same lesson by its own
  probe** — plan 05-02 learned it from `tallyOf`, plan 05-03 from the D-23 row.
- **Fix:** both rows drive inside a `try` and restore inside a `finally`. A
  refused round reads back as `'THE ROUND WAS REFUSED: <message>'`, which is a
  value a reader can act on.
- **Commit:** `03b3207`

**3. [Rule 1 — bug] The undo row threw where it was supposed to fail**

- **Found during:** probe P
- **Issue:** the two-Advances row read `fight().round` after two undos. When the
  label is shortened the pair folds into one entry, so the **second** undo lands
  past `startFight` and `state.fight` is `null` — D-08, documented and intended.
  A bare property read on `null` is a `TypeError`: nineteen of `[S09.12]`'s rows
  never ran, the board was left dirty, and interaction check 82 went red behind
  the one that was supposed to fail.
- **Fix:** `roundNow()` answers `'NO FIGHT'` for a board with no fight, so the
  row fails by name. The paragraph beside it records the measurement.
- **Commit:** `3c74a21`

**4. [Rule 1 — bug] The relationship row was half-blind**

- **Found during:** probe O, first run
- **Issue:** the row put both shipped relationships on the board and read back
  the number each losing action moved. **Hairball ships with an empty `xf`**, so
  the Lasers-over-Hairball pair had no number to move at all — a violation firing
  only on that pair would have passed. Only one of the two readings was doing any
  work.
- **Fix:** the row authors a transformation onto Hairball through the shipped
  `setActionXf` before starting the fight, so both `under` actions carry a hit
  and either relationship can redden it. The comment records why that line is
  load-bearing.
- **Commit:** `4f290dc`

### Additions the plan did not specify

**5. [Rule 2 — missing critical functionality] `unlanded` on the round record**

- **Issue:** the plan's record shape is *"the side, the action, the performer, the
  unit it pointed at, what was actually paid, and the three split numbers."* Two
  kinds of term move nothing and leave no trace under that shape: a term whose
  `who` names a unit the student did not name (`Hairball, no target`), and a term
  on `dmg` or `dead`, the two shipped types that are drawing vocabulary with no
  number anywhere on the board. **A student's own declared term quietly doing
  nothing, with no record of it, is the tool dropping their rule.**
- **Fix:** each `did` entry carries `unlanded: [{ who, tok }]`. The two reasons
  collapse into one fact — the term did not land — and which one applies is
  derivable by the page from the declaration and the vocabulary, so nothing
  derived is stored. The treatment itself is D-16's, which `unmodelled()` already
  established for the projection.
- **Commit:** `97f650b`

**6. [Rule 1 — bug] `missingTerm` is not reachable from `[S05]`**

- **Issue:** the plan's interfaces block places `missingTerm` at `:9318` and asks
  the op to refuse a departed token type through it. It lives in `[S06]`, outside
  `[S05]`'s IIFE, and is not reachable from an op.
- **Fix:** the check is taken inline in `ruleTerm` with `hasOwnProperty` on the
  live vocabulary, refusing by name and naming **both** the action and the token
  — which is the property ACT-07's rule actually asks for. It walks the `xf` list
  only: `req` is deliberately not walked, because **Advance does not test a
  requirement**, and that absence is now a row in the DOES NOT table.
- **Commit:** `97f650b`

### Corrections to the plan's own instructions

- **The plan's line numbers are ~150 low throughout** (`commitStructural` is at
  `:5249`, not `:5040`; `[S09.10]`'s rows begin at `:18493`, not `:17878`). The
  interfaces block's own instruction — *"re-grep before trusting a line
  number"* — was followed.
- **The plan says `cats-first, mechs-first and true-simultaneous all produce an
  identical outcome on the shipped board.`** The first two are confirmed by
  measurement. The third is **not true in general** and the file does not say it
  is: a true-simultaneous reading against a frozen pre-round board differs the
  moment two hits land on the same shielded unit, measured above. The file
  records the sequential ruling with that measurement beside it rather than a
  claim it cannot support.
- **The plan asks for a refusal row for "a declaration naming a removed unit."**
  Not reachable through the shipped ops — recorded above and in the suite's own
  comment.
- **The plan asks for `t.info` figures to be read beside research's browser
  numbers.** Done; the byte figures come in lower and the per-commit cost higher,
  and both are recorded rather than reconciled.
- **`hand` is not seeded on the round record.** Research's shape includes it;
  plan 05-05 owns hand rulings, and a field with no writer beside a record that
  already has one is exactly what plan 05-02 deleted `log` for. It arrives with
  its writer.

### Declined by design

- **`DEFAULTS.cats.ap` was not touched** (D-25).
- **Row 2 of `[S09.10]` was not touched**, and the empty diff over it is recorded
  above.
- **`REFERENCE.beats` gained no consumer and `keywords` gained no writer.** Two
  rows now hold that mechanically — one over the export list, one from inside a
  resolved round — and probes O and O-b prove neither is vacuous.
- **No hand-ruling op was added.** Plan 05-05 owns those; the `hp` and `alive`
  router arms are untouched.
- **No new `fire()` payload key.** `advanceRound` takes no argument at all.
- **Nothing announces an outcome, names a side, or renders a terminal state.**
  Advance keeps working on a board where one side is all dead (D-26).

## Known Stubs

None. Nothing in this plan renders. `unlanded` and `apShort` are both written by
the op and both driven in CI; `hand` is deliberately absent rather than stubbed,
and the file says so by name.

## Threat Flags

None. No new network endpoint, auth path, file access pattern or schema change at
a trust boundary. The five mitigations the plan's threat register assigns are all
in place and asserted:

| Threat | Mitigation, asserted |
|---|---|
| T-05-13 Advance acquiring a relationship or keyword consumer | a `[S09.10]` row over the live exports plus a `[S09.12]` row driven through a real round; probes O and O-b drive both violations |
| T-05-14 two Advances folding into one undo entry | the round number in the label; a row driving two real calls; probe P shortens the label |
| T-05-15 the record holding the board as it stood AFTER | the record pushed before the walk; a PAIRED reading against the live board; probe Q inverts the order and the pair names the tautology |
| T-05-16 an unbounded history inflating thirty snapshots | `MAX_PAST_ROUNDS`, a four-figure cap row that catches a dropped NEWEST, and `t.info` bytes and cost at three depths |
| T-05-17 a term naming a removed token or an unknown party | refusal by name through the live vocabulary and `requireXfWho`; four refusals each byte-identical with no undo entry; `protoIntact()` after each |

## Requirements

**None marked complete, and that is deliberate.** The plan names FIGHT-02,
FIGHT-03, FIGHT-13, FIGHT-14 and FIGHT-16. Every one of them needs something a
person can reach:

- **FIGHT-02 / FIGHT-13** — `advanceRound` has an op and a router arm and **no
  control on the page**. Plan 05-10.
- **FIGHT-14** — `past` is now written, and nothing renders it. Plan 05-08.
- **FIGHT-16** — the split is applied and its three numbers are recorded; *"and
  the split is shown"* is a surface. Plans 05-08 and 05-09.
- **FIGHT-03** — the dead marker is a surface. Plan 05-09.

Marking any of them here would be the same defect this phase keeps finding.

## What the plans that follow inherit

- **05-05:** `advanceRound` is the one applier, and a hand-ruling op sits
  **beside** it, not inside it. The round record has **no `hand` field** — create
  it on demand, the way a tally bag with no keys deletes itself (D-04). Every
  ruling the table makes that Advance declined to make is yours: the death
  ruling, the shield ruling, and whether a relationship applied. `setFightShield`
  is still named in `setUnitShield`'s comment as yours.
- **05-06:** `advanceRound` has an arm and no control, alongside `startFight` and
  `resetFight`. The topbar reservation is still exactly two.
- **05-07:** the declaration surface. `MAX_DECLARATIONS` is 48 and the
  declaration ops are still sync-only — the day the list renders one node per
  declaration, all three move to `commitStructural`.
- **05-08:** the history. `past[i]` is `{ round, was, did[] }`; `did[j]` is
  `{ side, act, by, at, apPaid, apShort, hit, unlanded }`. **`was` plus the live
  board IS the complete record of every number that moved** — that is FIGHT-15's
  design and the reason `did` carries no from/to list. `apShort` is the
  over-commitment and `unlanded` is a term the board had nowhere to put; both
  need a sentence and neither has one yet. Measured: 600 / 6581 / 18561 bytes and
  0.1 / 0.275 / 0.65 ms per commit at 0 / 10 / 30 rounds.
- **05-09:** the dead marker. Nothing infers death; `alive` is stored and
  `[S09.12]` drives both directions through a real Advance.
- **05-10:** the Advance press. **No `fire()` payload key** — the op takes no
  argument; give the control a private `data-*` its own delegated listener reads.
- **05-11:** four items are still open from plan 05-02, and this plan adds
  **four more**, all of them decisions nobody has seen on a screen. (1) The pool
  refilling each round, inferred from `bestPair` and written down here for the
  first time. (2) The pool flooring at 0 with the shortfall reported. (3) The
  shield not refilling. (4) The resolution order, which the measurement says does
  not change the shipped outcome and which a student will nonetheless read as a
  claim about who acts first. `DEFAULTS.cats.ap` is still 3 and still yours.
- **Everyone:** four plans in a row have now had a probe find a suite row that
  could **throw** instead of **fail**. If a row drives an op whose failure mode is
  a refusal — or reads a value that undo can take away — put the drive in a `try`
  and the restore in a `finally`, and give it something to say.
</content>
</invoke>

## Self-Check: PASSED

Files verified present: `cats-vs-mechs.html`, `tests/selftest-node.cjs`,
`.planning/phases/05-fight-loop-playtest/05-04-SUMMARY.md`.

Commits verified in the log: `97f650b`, `4796b25`, `03b3207`, `4f290dc`,
`e187683`, `3c74a21`.

Verified in the artifact: one `advanceRound` export, one `case 'advanceRound'`
dispatch arm.

Final run: `node tests/selftest-node.cjs` → **1156 passed, 0 failed**,
interaction gate **147 of 147**, perf 6 ms of 50, exit 0. Both naming greps print
**0**. Working tree clean after every probe revert; `git checkout --` was never
used on the artifact.
