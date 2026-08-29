---
phase: 05-fight-loop-playtest
plan: 03
subsystem: state
tags: [s02-model, damage-split, s05-ops, declaration, s09-12, fight-16, fight-12, d-23, d-00d]

requires:
  - phase: 01-foundation
    provides: "commit()/commitStructural, the undo stack and COALESCE_MS, requireSide/int/findUnit/fightOf, setUnitHp and setAlive"
  - phase: 03.1-action-authoring
    provides: "requireActionId and findAction, the term record shape, and the proposal pane whose DOM-only argument this plan records as not transferring"
  - phase: 05-fight-loop-playtest
    plan: 02
    provides: "the fight slice's decl array seeded empty, [S09.12] itself, and the measured finding that every shape rule in the repo reads a null fight"
provides:
  - "[S02].damageSplit(shield, hp, amount) — FIGHT-16 as three separate numbers, refusing above the arithmetic and writing nothing"
  - "[S02].termDamage(term) — THE one reading of a transformation term against DAMAGE_KEYS, now the only spelling in the file"
  - "[S05].declareAction / clearDeclaration / clearDeclarations writing state.fight.decl, with arms and exports"
  - "MAX_DECLARATIONS = MAX_UNITS * 2 = 48, exported, with its arithmetic written above it"
  - "the file's written answer to why a declaration lives in the slice when the proposal lives on the DOM"
  - "D-23 asserted rather than intended: an unaffordable declaration lands and only the shortfall is reported"
  - "[S09.12] grows from 40 rows to 75 — the split exhaustively, D-00d driven, and the byte-identical nothing-resolves row"
affects: [05-04, 05-05, 05-06, 05-07, 05-08, 05-09, 05-10, 05-11]

tech-stack:
  added: []
  patterns:
    - "a refusal written as ONE line above the arithmetic that covers every bad shape, so there is no second case left below it to forget"
    - "a resolution rule asserted as three separate facts, never as a total — a total is green over an implementation that has no rule in it"
    - "a suite row that drives an op whose failure mode is a REFUSAL must catch it; a throwing row aborts the run and takes unrelated checks with it"
    - "a row asserting an undo COST must drive the undo, not read a depth delta — the delta reads zero once the thirty-entry stack is at its cap"
    - "a row about an OPTIONAL position must print the key set, because JSON turns an absent key and an explicit null into the same three letters"
    - "a suite row that stands in for an op that does not exist yet must be re-driven through the op ON THE DAY IT SHIPS, or it goes on agreeing with its author"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "the split is REFUSED above the arithmetic and answers three zeroes rather than null — the shape every caller reads is kept, and three zeroes is a truthful reading of a hit that did not happen where a clamp would print a confident split for a swing nobody took"
  - "the refusal covers the POOLS as well as the amount, on the same line, so there is no second case; and it is Number.isInteger rather than `> 0`, because '3' coerces through a bare comparison and subtracts its way to a NaN split"
  - "termDamage was extracted and actionDamage AND actionModelled both now read it — the plan asked the split to read DAMAGE_KEYS rather than 'hp' inline, and the only honest way to do that with a numbers-only signature is to have ONE term reader in the file"
  - "the declaration record is { side, act, by, at } — a workaround for a shipped assertion rather than a preference, and the file says so"
  - "declareAction refuses NOTHING on affordability (D-23), and the sentence naming the check that holds the surface to the same rule sits beside the op"
  - "`at` may name any unit on either side and `by` names the acting side's — 03.1-07's ruling carried over, stated at the op so it does not quietly become the place a restriction gets added"
  - "clearDeclaration does NOT use int(), because int()'s answer to an out-of-range value is a clamp and a clamped index removes a declaration the student did not name"
  - "sync-only rather than structural, WITH the condition that changes it named: the day a declaration list renders one node per declaration, these three move to commitStructural"

patterns-established:
  - "NAMED_REFUSAL — a suite regex listing the four shapes a refusal from this file takes, so a row cannot be green over a TypeError"
  - "a t.info recording a number the suite deliberately does not gate on, placed where a row that gated on it would be vacuous"

requirements-completed: []

duration: 95min
completed: 2026-08-29
---

# Phase 05 Plan 03: The Split and the Declaration Summary

**The one resolution rule the developer specified is now three numbers a page can write a sentence around, a student can declare an action their side cannot pay for and the tool only reports the shortfall — and four probes found that two of this plan's own rows and one of plan 05-02's were asserting nothing.**

## The gate, before and after

| | before (05-02) | after |
|---|---|---|
| suite | 1093 passed, 0 failed | **1128 passed, 0 failed** (+35) |
| `SUITE_FLOOR` | 1063 | **1098** |
| `[S09.12]` rows | 40 | **75**, zero skipped |
| interaction gate | 147 of 147 | 147 of 147 |
| stub-drift | 96 shell ids | 96 shell ids |
| `#app` (setup) | 127, floor 117 | 127, floor 117 |
| `#app` (fight) | 101, floor 41 | 101, floor 41 |
| dialogs | 145 across 4 roots, floor 138 | 145 across 4 roots, floor 138 |
| proposal pane | 60, floor 23 | 60, floor 23 |
| Layer B literals | 5865 | 6101 |
| exported ops (check 74) | 49 | **53** |
| dispatch arms driven (check 74) | 19 of 58 | **21 of 62** |
| action records read (check 74) | 432 | **461** |
| naming greps | 0 / 0 | **0 / 0** |

`node tests/selftest-node.cjs` exits 0. Every floor the plan required to be unchanged is unchanged.

## The projection's two shipped figures, before and after

Recorded on the shipped board through `App.model` directly, because the claim is
about the derivation and not about a rendered string.

```
                     BEFORE                                    AFTER
cats -> mechs   perTurn 3, hit 1, ehp 27, soak 27, 9/9    identical
mechs -> cats   perTurn 9, hit 3, ehp 27, soak 27, 3/3    identical
bestDamage      cats 1, mechs 3                           cats 1, mechs 3
unmodelled      [] / []                                   [] / []
```

**The shipped 1 and 3 are pinned and stayed pinned**, across a change that
extracted `termDamage` out of `actionDamage` and rewired `actionModelled` to
read it. That extraction is exactly the kind of change these two figures exist
to catch, and they caught nothing because there was nothing to catch.

## The split's six driven readings

`App.model.damageSplit(shield, hp, amount)` → `{ shield, health, spare }`, read
as `[absorbed, to health, spare]`.

| hit | against | reading | what it proves |
|---|---|---|---|
| 2 | `{shield:3, hp:6}` | `[2, 0, 0]` | smaller than the shield, absorbed whole |
| 3 | `{shield:3, hp:6}` | `[3, 0, 0]` | equal to the shield, still reaches no health |
| **3** | **`{shield:2, hp:1}`** | **`[2, 1, 0]`** | **D-05c: overflow by the REMAINDER, not in full** |
| 5 | `{shield:1, hp:2}` | `[1, 2, 2]` | past shield plus health, and the overkill is reported |
| 3 | `{shield:0, hp:6}` | `[0, 3, 0]` | no shield — every Cat on the shipped board |
| 3 | `{shield:0, hp:0}` | `[0, 0, 3]` | zero health absorbs nothing, and rules nothing |

A seventh row asserts that `shield + health + spare === amount` across all six,
which is the only reading that can catch a point lost in the middle.

## The split's refusals — all by the same line, above the arithmetic

Every one answers `[0, 0, 0]`.

```
amount 0            -> [0,0,0]        amount undefined  -> [0,0,0]
amount -1           -> [0,0,0]        amount 2.5        -> [0,0,0]
amount NaN          -> [0,0,0]        amount Infinity   -> [0,0,0]
amount '3'          -> [0,0,0]        shield -1 / hp -1 / shield '3' / hp null -> [0,0,0]
amount null         -> [0,0,0]
```

`'3'` is the reason the line is **not** `soakTotal`'s bare `!(amount > 0)`: the
string coerces straight through that comparison and then subtracts its way to a
NaN split on a projector. The line is
`pool(shield) && pool(hp) && Number.isInteger(amount) && amount > 0`, with
`pool(n)` a one-line predicate so the refusal stays one line and the pools have
no second case of their own.

**Which of `turnsToWipe`'s two shapes was chosen:** the refusal, not the clamp —
but spelled as three zeroes rather than as `null`, so the shape every caller
reads is preserved. Nothing absorbed, nothing taken and nothing spare is a
truthful reading of a hit that did not happen; substituting a number would print
a confident split for a swing nobody took, which is `turnsToWipe`'s own
objection to clamping a throughput of zero. The comment says all of this beside
the code.

## D-00d, driven rather than promised

A Mech at 6 health and 3 shield, taken to zero **through the split's own
numbers** — `damageSplit(3, 6, 9)` → `[3, 6, 0]`, then `setUnitHp` writes
`6 - 6`:

```
split reading            [3, 6, 0]
health after             0
alive after              true
aliveCount(mechs)        3
```

And the other half: the same unit ruled dead by the table, and a unit at **full**
health ruled dead, are the same one `setAlive` away — `[false, 6, false, 1]`.

## Nothing resolves while declaring

Four declarations across both sides, driven through the shipped op:

```
decl length / sides      4 | cats,mechs,cats,mechs
whole state minus decl   BYTE-IDENTICAL to the board before them
cats pool / mechs pool   3 / 3  (unmoved)
cats units / mechs units byte-identical (health, shield and alive flag)
round / past             1 / 0  (unmoved)
build slice              identical (true)
```

Asserted twice on purpose: once over the **whole state** with `fight.decl`
emptied on both sides of the comparison, and once **fact by fact** so a failure
names what moved instead of printing two long strings. Probe L proved both
readings bite and proved the second one names the pool.

## D-23, asserted rather than intended

Cats' pool driven to 0, then a declaration of `slash` (cost 1):

```
declareAction returned   0          (the index — it LANDED)
decl length              1
decl[0].act              'slash'
affordability.apCost     1
affordability.apHave     0
fight pool / build pool  0 / 0      (nothing moved on the way in)
```

The row's label says in as many words that **a refusal here is a plan failure
and not a safety feature**.

## The declaration record, and the key-name walk

```
decl: [{"side":"cats","act":"slash","by":"c1","at":"m1"},
       {"side":"mechs","act":"lasers","by":"m1","at":"c1"},
       {"side":"cats","act":"hairball","by":null,"at":null}]

refused-key walk over a state carrying three declarations:  []
key set of one record:                                      act,at,by,side
```

**Check 73c: green and untouched.** `tests/selftest-node.cjs` changed in exactly
one place this plan — `SUITE_FLOOR` and its history paragraph. 73c still reads a
state whose `fight` is `null` at gate time, which is plan 05-02's finding
unchanged and deliberately not repaired there: its job is to keep the proposal
off the slices and widening it costs that guarantee. The walk that actually
reaches a fight is `[S09.12]`'s, and **this plan made it reach the fight the OP
writes rather than one the suite wrote** — see probe I.

## Check 74's readings

```
no-writer gate: 53 exported ops walked, 21 dispatch arms driven of 62 acts
                tried, 461 action records read
```

The three new ops are in the blind walk. `clearDeclaration` and
`clearDeclarations` are router keys and are driven (refusing with "No fight in
progress", which is not `Unknown op:` and therefore counts as an arm); none of
the three moves `dmg` or `keywords`; no export name matches
`/dmg|damage|keyword/i`.

## The measurements

```
MAX_DECLARATIONS                        48   (MAX_UNITS 24 x 2 sides)
one declaration record                  52 bytes
fight slice, nothing declared          600 bytes
fight slice, at the cap               3143 bytes
```

The last figure is what plan 05-08's ledger rows read a delta against, and it is
the cost of the snapshot `commit()` takes on **every** write, kept thirty deep.

## Probes: run after their task's commit, recorded verbatim, reverted from a file snapshot

`git checkout -- cats-vs-mechs.html` was never used. Every revert was `cp` from
a scratchpad snapshot, and `git status --short` was read clean after each.

### PROBE I — the record spelled `{ side, act, caster, target }`

**First run (after Task 2's commit): STAYED GREEN.** `1093 passed, 0 failed`,
check 73c passed with its full label printed, exit 0.

The diagnosis is precise and it is not plan 05-02's. That plan's key-name row
**does** reach a fight — but it reaches a fight the SUITE wrote, through a
hand-placed `App.state.commit`, because no op existed when it was written. A
literal written in a suite agrees with whatever its author believed the op would
write. That is `[S09.11]`'s driven-board rule met one level down.

**Repair (Task 3):** the row now drives `App.ops.declareAction('cats', 'slash',
'c1', 'm1')`. The round record beside it is still hand-placed, and the paragraph
now carries the instruction to make the same repair on the day `advanceRound`
ships.

**Second run (after Task 3's commit): RED, by name.**

```
FAIL  the fight loop :: NOTHING ANYWHERE IN A RUNNING FIGHT IS NAMED AFTER A
      PROPOSAL, AN OVERRIDE, A CASTER, A TARGET OR A PENDING ANYTHING ...
      actual:   ["state.fight.decl.0.caster","state.fight.decl.0.target"]
      expected: []
FAIL  the fight loop :: and the rule is about OBJECT KEYS and not about words ...
      actual:   [null,null,"act,caster,side,target"]
      expected: ["c1","m1","act,at,by,side"]
1124 passed, 4 failed
```

**It also found a defect in one of this plan's own rows** — see Deviations, item 1.

### PROBE J — `declareAction` refuses when `affordability` reports a shortfall

**First run (after Task 2's commit): STAYED GREEN**, `1093 passed, 0 failed`,
because the D-23 row is Task 3's and did not exist. Confirmed the probe bit by
driving it directly:

```
REFUSED: PROBE J: that costs more than this side has. | decl len 0
```

**Second run (after Task 3's commit): RED — and it aborted the suite.**

```
FAIL  the fight loop :: suite threw
      actual:   Error: PROBE J: that costs more than this side has.
      expected: no exception
1115 passed, 1 failed
FAIL  interaction gate :: 82. A LINK CARRYING BOTH DOES BOTH ...
```

Thirteen of the suite's own rows never ran, the board was left dirty and an
unrelated interaction check went red behind it. **That is a real defect the
probe found in this plan's own row** — see Deviations, item 2.

**Third run (after the repair): RED, readable, one row.**

```
FAIL  the fight loop :: A SIDE WITH NO ACTION POINTS LEFT CAN STILL DECLARE ...
      actual:   ["REFUSED: PROBE J: that costs more than this side has.",0,
                 "nothing declared",1,0]
      expected: [0,1,"slash",1,0]
1127 passed, 1 failed
interaction gate: 147 of 147 checks passed
```

### PROBE K — the auto-kill at zero health

**The probe could not be written where the plan named it, and the reason is the
finding.** The plan asks for the split to write `alive = false` when health
reaches zero. `damageSplit` takes three numbers and returns three numbers — it
never sees a unit and has nothing to write to. So the obvious next line does not
live inside the split at all; it lives at the **writer that spends it**, which is
`setUnitHp`. The probe was applied there: `if (u.hp === 0) { u.alive = false; }`.

```
FAIL  the fight loop :: THE SPLIT TAKES A UNIT TO ZERO HEALTH AND THE UNIT IS
      STILL ALIVE ...
      actual:   [[3,6,0],0,false,2]
      expected: [[3,6,0],0,true,3]
FAIL  state contract :: alive independent of hp
      actual:   false
      expected: true
FAIL  state contract :: aliveCount reads the flags, not the hit points
      actual:   7
      expected: 8
1125 passed, 3 failed
```

Three named failures, the suite runs to completion, and the two `[S09.3]` rows
that reddened alongside are the shipped ones that already guarded the same
property in setup — this plan's row is what extends the guard to a unit driven
there **through the split's own numbers**.

### PROBE L — `declareAction` subtracts the action's cost from the pool

```
FAIL  the fight loop :: A BOARD CARRYING DECLARATIONS IS BYTE-IDENTICAL TO THE
      SAME BOARD CARRYING NONE ...
      actual:   ... "fight":{...,"cats":{"ap":1,...},"mechs":{"ap":1,...}}
      expected: ... "fight":{...,"cats":{"ap":3,...},"mechs":{"ap":3,...}}
FAIL  the fight loop :: and the same claim read fact by fact, so a failure NAMES
      what moved ...
      actual:   [1,1,"[{\"id\":\"c1\",\"hp\":3,...}]",...,1,0,true]
      expected: [3,3,"[{\"id\":\"c1\",\"hp\":3,...}]",...,1,0,true]
1126 passed, 2 failed
```

Both rows reddened and the second **named the pool** — `[1,1,...]` against
`[3,3,...]` — which is the whole reason the fact-by-fact row sits under the
whole-state one.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — bug] A row about an OPTIONAL position printed the same string as its actual and its expected**

- **Found during:** probe I, second run, after Task 3 was committed
- **Issue:** the row asserting *"Hairball, no target"* read
  `[decl[2].act, decl[2].by, decl[2].at]` against `['hairball', null, null]`.
  Under a re-spelled record the keys are absent, absent reads as `undefined`,
  `JSON.stringify` turns `undefined` into `null` inside an array, and the report
  serialises a failed row with JSON — so it printed
  `["hairball",null,null]` as **both** sides. **ABSENT and NULL are different
  facts** and a row that cannot print the difference cannot be read by whoever
  it fails for. This is plan 05-02's `jsonDrops` lesson met a second time.
- **Fix:** the row now carries the sorted key set and reads both positions as
  `=== null` identity tests, so an absent key changes two of the four values.
- **Commit:** `9c9a2b0`

**2. [Rule 1 — bug] The D-23 row could abort the whole suite**

- **Found during:** probe J, second run
- **Issue:** the row drove `App.ops.declareAction` bare. The failure it exists to
  catch **is a refusal**, and a refusal is an exception — so the row could only
  ever THROW, never FAIL. Measured: thirteen of `[S09.12]`'s own rows never ran,
  the board was left dirty, interaction check 82 went red behind it, and the
  report was a stack trace where a reader needed two numbers.
- **Fix:** the drive is inside a `try` and a refusal is reported as the value
  `'REFUSED: ' + message`; the record is read through `fight().decl[0] || {}` so
  an empty list reads `'nothing declared'` instead of throwing a second time.
  This is plan 05-02's `tallyOf` rule applied at the one row where the refusal is
  the entire subject.
- **Commit:** `f4f5df5`

**3. [Rule 1 — bug] An undo-cost row was asserting a depth delta the stack cannot show**

- **Found during:** Task 3's first run
- **Issue:** the row asserted `undoDepth() - before === 4` and measured **0**.
  `UNDO_LIMIT` is thirty and `[S09.12]` runs after several hundred commits, so
  the stack is at its cap: four new entries push four old ones off the bottom and
  the delta reads 0 **over a run where each declaration was its own entry and
  over a run where all four coalesced into one**. The row could not tell its
  failure from its success. Plan 05-02 hit the same wall from the other side
  (its deviation 6) and bounded the figure; here the claim is sharper than a
  bound allows.
- **Fix:** the depth is recorded through `t.info`, and the CLAIM is driven —
  declare two, undo **once**, and read that the first is still standing
  (`['slash,lasers', 'slash', 0]`). That discriminates a coalesced pair from two
  entries no matter where the stack sits.
- **Commit:** `7cdfe4d`

**4. [Rule 1 — bug] The bad-input table was refusing the file's own refusals**

- **Found during:** Task 3's first run
- **Issue:** the table accepted only messages matching
  `/^(Unknown side|No unit|There is no)/` and went red on the three that
  `requireActionId` hands back — `"__proto__" is a name JavaScript keeps for
  itself…` and `"zz9" is not an action on this board.` — which open with the
  offending id in quotes. A row rejecting correct refusals.
- **Fix:** `NAMED_REFUSAL`, a regex naming all **four** shapes a refusal from
  this file takes, written out with the reason: a row that accepted any exception
  at all would be green over a `TypeError` from reading a property of
  `undefined`, which is the failure `findUnit` and `requireActionId` exist to
  replace with a sentence a student can read.
- **Commit:** `7cdfe4d`

**5. [Rule 2 — missing critical functionality] `termDamage` extracted, and both existing readers rewired**

- **Found during:** Task 1
- **Issue:** the plan requires the split to *"read damage through `DAMAGE_KEYS`
  … rather than testing for the string `'hp'` inline"*, and the signature it
  specifies — `(shield, hp, amount)` — has nothing to read a constant with. The
  honest reading is that the addition must not create a **second spelling** of
  "is this term damage", and the file already had two: one inside `actionDamage`
  and one inside `actionModelled`.
- **Fix:** `termDamage(term)` is now THE one reading — positive amount out, 0 for
  anything that is not damage — and both shipped functions call it. Plan 05-04's
  applier spends terms one at a time and would otherwise have written a third.
  The projection's two shipped figures were recorded before and after and did
  not move, which is what makes this an extraction rather than a change.
- **Commit:** `ba91117`

**6. [Rule 2 — missing critical functionality] The refusal covers the POOLS, not only the amount**

- **Found during:** Task 1
- **Issue:** the plan's six recorded refusals are all amounts. A `shield` or `hp`
  that is not a whole number at or above zero reaches `Math.min` and produces a
  NaN or a negative split — the exact three-letters-on-a-projector outcome
  `soakTotal`'s and `turnsToWipe`'s comments are written against.
- **Fix:** folded into the **same** refusal line through a one-line `pool(n)`
  predicate, so the property the plan asks for — one line, no second case left to
  forget — is kept rather than traded away. Four extra readings recorded.
- **Commit:** `ba91117`

**7. [Rule 1 — bug] The DELIBERATELY ABSENT block said `decl` was filled by plan 05-04**

- **Found during:** Task 2
- **Issue:** plan 05-02 wrote *"the `decl` and `past` arrays on the slice, seeded
  empty by freshFight. Plan 05-04 fills them."* This plan makes the first half
  untrue, and `[S03]`'s banner opens by forbidding a banner that quietly lies.
- **Fix:** rewritten **in the same change**, not annotated: `past` is still plan
  05-04's alone; the declaration ops are named with what they do and do not do;
  and `damageSplit` is named as existing in `[S02]` with **no caller in `[S05]`
  yet**, so the next reader does not go looking for one.
- **Commit:** `1ea71dc`

### Corrections to the plan's own instructions

- **Probe K could not be written where the plan places it.** `damageSplit` takes
  numbers and returns numbers; it has no unit and cannot write `alive`. The
  obvious next line lives at the writer that spends the split, so the probe was
  applied to `setUnitHp`. The D-00d row reddened as designed. This is worth
  carrying into plan 05-04: the auto-kill hazard is at `advanceRound`, not in the
  arithmetic.
- **Probes I and J both came back green on their first run**, because both target
  rows that Task 3 owns. They were re-run after Task 3's commit, and both
  readings are recorded above.
- **The plan's acceptance asks for `grep -c "=== 'hp'"` inside `[S02]` to print
  `0`.** It prints **1**, and the single hit is `presentOnCaster`'s requirement
  read at `:2770` — shipped long before this plan, about the health POOL a
  requirement is measured against rather than about damage, and outside this
  plan's scope boundary. The split and `termDamage` contain **zero** `'hp'`
  literals between them, which is the property the criterion is protecting.

### Declined by design

- **Check 73c was not widened.** `tests/selftest-node.cjs` changed in exactly one
  place: `SUITE_FLOOR` and its history paragraph.
- **`DEFAULTS.cats.ap` was not touched** (D-25).
- **`REFERENCE.beats` gained no consumer in `[S05]`**, `keywords` gained no
  writer, nothing decides a unit is dead and nothing decides a fight is over.
- **Nothing in this plan applies a term to any unit.** `damageSplit` is exported
  and has no caller. Plan 05-04 owns `advanceRound`.
- **The affordability report was not consulted by any op.**

## Known Stubs

None. Nothing in this plan renders, and both halves are driven end to end in CI.

## Threat Flags

None. Every position a caller supplies — the side, the action id, both unit ids
and the index — crosses an existing shipped guard outside the commit, and
`protoIntact()` is read after every hostile drive.

## What plan 05-04 inherits

- `App.model.damageSplit` and `App.model.termDamage`, both pure and both
  unspent. `advanceRound` is their first caller.
- `state.fight.decl`, filled and cleared through three ops, with a byte-identical
  row standing behind the claim that nothing in it resolves.
- The instruction, written into `[S09.12]`, to re-drive the hand-placed round
  record through `advanceRound` on the day it ships — the same repair probe I
  forced here.
- `MAX_DECLARATIONS` and the fight slice's byte cost at the cap, so a ledger
  growth figure has something to be read against.
- The named hazard: the auto-kill lives at the applier, not in the arithmetic.
</content>
</invoke>

## Self-Check: PASSED

Files verified present: `cats-vs-mechs.html`, `tests/selftest-node.cjs`,
`.planning/phases/05-fight-loop-playtest/05-03-SUMMARY.md`.

Commits verified in the log: `ba91117`, `1ea71dc`, `7cdfe4d`, `9c9a2b0`,
`f4f5df5`.

Exports verified in the artifact: `damageSplit`, `termDamage`, `declareAction`,
`clearDeclaration`, `clearDeclarations`, `MAX_DECLARATIONS`.

Final run: `node tests/selftest-node.cjs` → **1128 passed, 0 failed**,
interaction gate **147 of 147**, exit 0. Both naming greps print **0**.
Working tree clean after every probe revert.
