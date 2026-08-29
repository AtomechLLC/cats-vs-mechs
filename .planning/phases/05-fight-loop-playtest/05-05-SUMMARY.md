---
phase: 05-fight-loop-playtest
plan: 05
subsystem: state
tags: [s05-ops, hand-rulings, fight-07, fight-08, s09-3, s09-12, d-00d, d-04, d-26]

requires:
  - phase: 01-foundation
    provides: "commit()'s label-keyed coalescing and COALESCE_MS, int(), requireDelta, findUnit, fightOf, SIDES, MAX_UNITS, MAX_ALLOC — and setUnitShield's comment, which reserved the name setFightShield for this plan two phases before it was written"
  - phase: 05-fight-loop-playtest
    plan: 02
    provides: "the fight slice with its five keys read whole, freshFight, and [S09.12] itself"
  - phase: 05-fight-loop-playtest
    plan: 04
    provides: "advanceRound and its round record { round, was, did[] }, deliberately WITHOUT a `hand` field; the DOES / does NOT table; and the dispatch comment that handed this plan the `hp`/`alive` spelling decision by name"
provides:
  - "[S05].setFightShield — the fight slice's own shield writer, the op setUnitShield's comment named for this plan in Phase 1"
  - "[S05].nudgeFightHp — the signed sibling, returning a boolean so plan 05-10's press-and-hold question stays open"
  - "the ruling record: `{ side, unit, tok, from, to }` appended to the CURRENT round's `hand` list on the fight slice, created on demand and carried into `past` by Advance"
  - "MAX_HAND_RULINGS = MAX_UNITS * SIDES.length * 3, with its arithmetic and its 8529-byte snapshot cost measured"
  - "the four hand-ruling dispatch arms, renamed from the FIELD_OPS-shaped `hp`/`alive` to the ops' own names"
  - "[S09.3]'s shield tripwire rewritten from one claim into a PAIR that drives each writer against both slices"
  - "[S09.12] grows from 102 rows to 131 — the record's shape, round membership over four rounds, both directions of D-00d at the hand ops, the marker proved derivable, sixty hostile drives, the cap, and the key-name ban walked over a fight that carries rulings"
affects: [05-06, 05-07, 05-08, 05-09, 05-10, 05-11]

tech-stack:
  added: []
  patterns:
    - "a provenance fact stored as an EVENT IN A ROUND rather than as a property of the value it describes — which clears a key-name ban naturally, makes the render-time marker derivable, and puts the record in the same object the ledger already draws"
    - "a sparse list that is REMOVED rather than emptied, so D-04's `a bag with no keys deletes itself` holds on a round record as well as on a tally bag, and a shape row reading the opening key set stays true"
    - "a shipped tripwire turned into a PAIR when the single claim could not distinguish the two things it named — the old row drove one writer and would have stayed green over the other writing the wrong slice"
    - "a one-key router arm that is NOT a FIELD_OPS key is a name nothing on the page can reach; renaming it to the op's own name is what stops the next reader adding a fifth by pattern-match"
    - "a row that reddens with a readable message rather than a length: probe T's failure prints which round each ruling landed in, and a length check would have passed it"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "A RULING IS AN EVENT IN THE ROUND, NOT A FLAG ON THE NUMBER. `{ side, unit, tok, from, to }` on `fight.hand`, moved into `past` by Advance. The declined alternative — a per-value `byHand` flag on the unit — is written into the artifact beside the choice: it is a second copy of a fact the round already holds, and it drifts the first time a value is set by hand twice or set back"
  - "`did` PLUS `hand` IS FIGHT-08'S LOG. No `fight.log` was created and none will be; plan 05-02 deleted that field for this reason and this is the other half of the same decision"
  - "`tok` IS A TOKEN ID, not a field name, so plan 05-09's marker compares a rendered amount against the record. The alive flag is recorded as the shipped `dead` type's own 0-or-1, which is a SPELLING and not a ruling — it makes every from/to in the list a whole number"
  - "NOTHING IS RECORDED WHEN NOTHING MOVED. A set that lands on the value the board already holds is not a ruling, and this turned out to have teeth inside a resolved round — see the marker row's own finding"
  - "`hand` IS CREATED ON DEMAND AND REMOVED RATHER THAN EMPTIED (D-04), on the slice and on the record both. A fresh fight still opens on exactly five keys and a round nobody ruled in carries no key for one"
  - "NO nudgeFightShield, and the asymmetry is written down: plan 05-09 draws no ± pair for a shield and plan 05-10's control table lists four ops, so a fifth would be an op with no presser"
  - "THE ROUTER ARMS `hp` AND `alive` ARE RENAMED to `setUnitHp` and `setAlive` — the decision plan 05-04 handed forward by name. They were one-key names that looked like FIELD_OPS keys and were not in FIELD_OPS at all, so no control ever sent either. The old spellings are GONE rather than kept as aliases"
  - "`DEFAULTS.cats.ap` was not touched (D-25), nothing infers a death in either direction (D-00d), and nothing decides a fight is over (D-26)"

patterns-established:
  - "ruled(g, side, unitId, tok, from, to) — the one recorder every hand op calls, inside the mutator, on the detached copy"
  - "a caller-supplied key position REMOVED rather than guarded: no hand op takes a token id, so there is nothing to validate at that position and a suite row reads the written set back instead"

requirements-completed: []

duration: 135min
completed: 2026-08-29
---

# Phase 05 Plan 05: The Hand Rulings Summary

**Every number the fight tracks now has a by-hand writer, a ruling is stored as
an event in the round it was made in rather than as a flag on the value it
changed — which is simultaneously FIGHT-07's marker, FIGHT-08's log and the
reason check 73c never had to be widened — and the tripwire aimed at this plan
turned out not to be one.**

## The gate, before and after

| | before (05-04) | after |
|---|---|---|
| suite | 1156 passed, 0 failed | **1185 passed, 0 failed** (+29) |
| `SUITE_FLOOR` | 1126 | **1155** |
| `[S09.12]` rows | 102 | **131**, zero skipped |
| interaction gate | 147 of 147 | 147 of 147 |
| stub-drift | 96 shell ids | 96 shell ids |
| `#app` (setup) | 127, floor 117 | 127, floor 117 |
| `#app` (fight) | 101, `FIGHT_FLOOR` 41 | 101, `FIGHT_FLOOR` 41 |
| dialogs | 145 across 4 roots, floor 138 | 145 across 4 roots, floor 138 |
| proposal pane | 60, floor 23 | 60, floor 23 |
| Layer B literals | 6225 | 6829 |
| exported ops (check 74) | 54 | **57** |
| dispatch arms driven (check 74) | 22 of 63 | **26 of 66** |
| action records read (check 74) | 468 | **490** |
| perf gate | 6–7 ms of 50 | **6–7 ms of 50** |
| naming greps | 0 / 0 | **0 / 0** |

`node tests/selftest-node.cjs` exits 0.

## The shield tripwire: it never reddened, and that is the finding

The plan expected `[S09.3]`'s shield row to go **RED** on the day
`setFightShield` shipped, and said that if it went green the tripwire was not
doing anything. **It went green.** Recorded verbatim from the run after task 1's
commit:

```
PASS  state contract :: setUnitShield writes the build slice
PASS  state contract :: the build shield moved
PASS  state contract :: and the fight slice was left for Phase 5
1156 passed, 0 failed
```

**It was a COMMENT tripwire, not a mechanical one.** Its sentence — *"shield is
a BUILD write. Phase 5 owns the fight slice's own copy"* — made two claims and
asserted one. It drove `setUnitShield` with a fight running and required the
fight copy not to move. It never drove a fight-slice writer at all, because
there was none to drive, so:

- a `setFightShield` that wrote `s.build` would have left it **spotlessly
  green** — the fight copy would not have moved, which is the whole of what the
  row asked;
- the sentence naming Phase 5 as the owner became false the moment the op
  shipped, with nothing to say so.

Rewritten into a **pair**, each writer driven against **both** slices with a
fight running, the untouched side read as the **whole slice** rather than as the
one number:

```
PASS  state contract :: setUnitShield writes the build slice
PASS  state contract :: THE BUILD WRITER WRITES THE BUILD AND ONLY THE BUILD,
      driven with a fight actually running …
PASS  state contract :: AND THE FIGHT WRITER WRITES THE FIGHT AND ONLY THE
      FIGHT …
1185 passed, 0 failed
```

Probe R reddens each half independently — see below.

## The ruling record, as written

```js
function ruled(g, side, unitId, tok, from, to) {
  if (!Object.prototype.hasOwnProperty.call(g, 'hand')) { g.hand = []; }
  g.hand.push({ side: side, unit: unitId, tok: tok, from: from, to: to });
  while (g.hand.length > MAX_HAND_RULINGS) { g.hand.shift(); }
}
```

Four rulings in one round, driven:

```json
[{"side":"cats","unit":"c1","tok":"hp","from":3,"to":1},
 {"side":"mechs","unit":"m1","tok":"shield","from":3,"to":5},
 {"side":"cats","unit":"c2","tok":"dead","from":0,"to":1},
 {"side":"mechs","unit":"m2","tok":"hp","from":6,"to":4}]
```

`Advance` carries it into `past` with the round it belongs to:

```
fight slice keys, fresh fight        cats,decl,mechs,past,round      (no `hand`)
fight slice keys, four rulings in    cats,decl,hand,mechs,past,round
past[0] keys after Advance           did,hand,round,was
fight slice keys after Advance       cats,decl,mechs,past,round      (removed, not emptied)
hand per past round, four rounds     ['hp/c1+shield/m1+dead/c2+hp/m2',
                                      'hp/m3', 'no ruling', 'dead/m3']
```

Three things follow, and all three are why it is the right shape:

1. **It clears the key-name ban naturally.** `override` is banned as an object
   key at any depth by `[S09.10]`'s second boundary row and by check 73c, and
   neither was widened. A ruling recorded as an event needs no such key.
2. **It IS FIGHT-08's log.** `did` plus `hand` is each round's actions and every
   override in readable order, in one object — the same object plan 05-08's
   ledger renders. `fight.log` stays deleted.
3. **The marker is derived, not stored.** See below.

### The alternative, declined in the artifact beside the choice

A per-value flag on the unit — `byHand: true` sitting beside `hp`, which
measures clean as a key name and would have worked on the first pass. Declined
because it is a **second copy of a fact the round already holds**: set a value by
hand twice and the flag says one thing while the list says two; set a value by
hand and then set it back, and there is no reading of the flag that is correct
for both the number and the history. It also puts the provenance where undo has
to carry it per unit per round instead of in one list per round.

## The marker is derivable — and the row found something

The exact read plan 05-09 will make, written into `[S09.12]`:

```js
function setByHand(state, side, unitId, tok) {
  var g = state.fight;
  if (g === null || !Object.prototype.hasOwnProperty.call(g, 'hand')) { return false; }
  // …does this round's list name this side, this unit and this token?
}
```

```
mechs/m1 hp   -> true      (a hand ruling that moved a number)
cats/c1 dead  -> true
cats/c1 hp    -> false     <-- see below
cats/c1 shield-> false
mechs/m2 hp   -> false
unit key set  -> alive,hp,id,shield      (nothing stored on the unit)
after one Advance, every one of them -> false
```

**The third figure was expected to be `true` and measured `false`, and the row
was wrong rather than the code.** The fixture declares Lasers at `c1` and
advances, which takes `c1` to zero; the `setUnitHp(c1, 0)` that followed
therefore landed on the value the board already held and recorded **nothing**.
That is the *"a set that moved nothing is not a ruling"* rule meeting a real
resolved round, and the marker reading `false` is correct — nobody changed that
number by hand. The row now reads a health ruling that **did** move a number
(`m1`) beside it, and its own label explains the `false`.

The same finding improved the row above it: *"a unit at zero health is still
alive"* is now driven **both ways into zero in one row** — `c1` by a real
Advance, `c3` by hand — because the original was only ever reading the Advance's
zero while appearing to read a by-hand one.

## Both directions of D-00d, at the hand ops

Plan 05-04 asserted this at the **applier**. These assert it at the ops a
student actually presses:

```
a unit at zero health (by Advance AND by hand) is still alive   [0,true, 0,true, aliveCount 9]
a unit ruled dead at FULL health is dead and keeps its health   [3,false, aliveCount 8]
a unit ruled alive at ZERO health is alive and keeps its zero   [0,true,  aliveCount 8]
and none of the three moved a number it was not asked to move   [shields 0,0 | pools 3,3]
```

`aliveCount` is read in every one of the three, because a reader that fell back
to health would be right in exactly the ordinary case and wrong in both
interesting ones.

Truthiness, driven:

```
setAlive(…, 1)      -> alive = false, no throw
setAlive(…, 'true') -> alive = false, no throw
setAlive(…, {})     -> alive = false, no throw
```

## The two shield writers and the two slices, driven

```
before            {"m1":{"hp":6,"shield":3,"alive":true},"fightAp":[3,3],"buildM1":{"maxHp":6,"shield":3}}
setFightShield 7  {"m1":{"hp":6,"shield":7,"alive":true},"fightAp":[3,3],"buildM1":{"maxHp":6,"shield":3}}
nudgeFightHp  -2  {"m1":{"hp":4,"shield":7,"alive":true},"fightAp":[3,3],"buildM1":{"maxHp":6,"shield":3}}
```

`nudgeFightHp` returns a boolean:

```
inside a bound   nudge(-1) -> true   (typeof boolean)
at the floor     nudge(-1) -> false
at the ceiling   nudge(+1) -> false
```

And the build code is untouched by a whole round of rulings — FIGHT-10 read from
the codec's end, asserted in `[S09.12]`:

```
App.serialize.encode(build) identical across four rulings + one Advance : true
past[0].hand.length                                                      : 4
```

## The undo accounting

```
two rulings on two units, 0 ms apart : undo delta 2  (COALESCE_MS 500)
  after both / one undo / two undos  : [1,1] / [1,3] / [3,3]
forty nudges on ONE unit             : undo delta 1, hp 6 -> 46, 40 rulings recorded
a build shield edit + a fight shield ruling in the same window : undo delta 2
  build/fight shield afterwards      : [9, 1]
```

The last one is why `setFightShield`'s commit label is **not**
`setUnitShield`'s: under a shared label, an allocation edit and a mid-fight
ruling made inside 500 ms would fold into one Ctrl+Z that took back an edit on a
slice the student was not looking at.

## The refusals

Fifty-six hostile side values across all four writers and all four router arms
(one section), plus sixty drives across the unit-id and value positions
(another). Every refusal by name, board byte-identical, no undo entry, prototype
intact after each:

```
setUnitHp / nudgeFightHp / setFightShield / setAlive ('__proto__') -> Unknown side "__proto__"
… the same for '', 5, null, {} and 'constructor', 'prototype'
board byte-identical: true | undo delta: 0

setUnitHp value null / '' / '7' / [5] / NaN / 1.5 -> Expected a whole number for health, got …
setUnitHp value -1   -> clamped to 0
setUnitHp value 999  -> clamped to 99 (MAX_ALLOC)
the RECORD shows the clamped value:  3->40  40->0  0->99
```

**A value merely out of range is clamped, never refused** — int()'s existing
contract and the only bound these ops keep. A student ruling a unit to forty
health because their own house rule says so is the workshop working correctly.

**And there is no token-id position to attack.** The plan's threat model names
*"a caller-supplied unit id and token id — two key positions per hand op"*. That
is not the shape that shipped: **no hand op takes a token id at all.** Each one
writes its own `tok` from a fixed set of three, which removes the position
rather than guarding it, and `[S09.12]` reads the written set back instead
(`every tok ∈ TOKEN_IDS`, `every from/to an integer`).

## The cap, driven

```
MAX_HAND_RULINGS                                    144  (= MAX_UNITS 24 × SIDES 2 × 3)
147 drives -> [length, first kept .to, last .to, live hp] = [144, 4, 27, 27]
bytes of fight slice at the ruling cap                     8529
bytes of fight slice, nothing on it                         600
bytes at the DECLARATION cap, for comparison               3143
```

The arithmetic is one ruling for every rulable number on every unit that can be
on the board at once — health, shield, and whether it is still standing.

## Check 73c and check 74

**73c was not modified**, and it is green. Its own limitation is unchanged and
recorded by wave 2: it walks the state *after* the whole node run, by which time
the fight-loop suite has handed the board back with `fight === null`. So the
reach lives in `[S09.12]`, and this plan extended it to a fight carrying
rulings:

```
refused key names over a state with 3 rounds of recorded rulings
  AND a live ruling on the current round                          []
past rounds carrying a hand list / live list length               3 / 1
```

Driven separately outside the suite over a state with rulings both live and in
`past`, using 73c's own regex verbatim: `[]` before and `[]` after three more
rulings.

Check 74's blind walk, green:

```
no-writer gate: 57 exported ops walked, 26 dispatch arms driven of 66 acts tried,
                490 action records read
```

Every op this plan added is in that walk, driven with `{ side:'cats',
unitId:'c1' }` in whatever fight state the previous probe left behind; none
moves `dmg` or `keywords`. The arms-driven figure rose from 22 to 26 **because
of the rename** — `setUnitHp` and `setAlive` are export names, so the walk now
reaches arms it previously answered `Unknown op` to.

## Probes: run after their task's commit, recorded verbatim, reverted from a file snapshot

`git checkout -- cats-vs-mechs.html` was never used. Every revert was `cp` from
a scratchpad snapshot and `git status --short` read clean after each.

### PROBE R — each shield writer aimed at the other slice

**Part 1, `setFightShield` writing `s.build[side].units[…]`:**

```
FAIL  state contract :: AND THE FIGHT WRITER WRITES THE FIGHT AND ONLY THE FIGHT …
      actual:   [7,1,false]
      expected: [1,2,true]
FAIL  the fight loop :: A ROUND OF HAND RULINGS LEAVES THE BUILD CODE BYTE-IDENTICAL …
      actual:   [false,4]
      expected: [true,4]
1180 passed, 2 failed
```

The fight copy stayed at 7 (unmoved), the build moved to 1, and the build slice
was no longer byte-identical — **all three figures name a different part of the
violation**, and the build-code row caught the consequence a student would
actually feel.

**Part 2, `setUnitShield` writing the fight copy while a fight runs:**

```
FAIL  state contract :: THE BUILD WRITER WRITES THE BUILD AND ONLY THE BUILD …
      actual:   [7,false]
      expected: [2,true]
FAIL  state contract :: AND THE FIGHT WRITER WRITES THE FIGHT AND ONLY THE FIGHT …
      actual:   [1,7,true]
      expected: [1,2,true]
1180 passed, 2 failed
```

**Both halves fire, and neither survived the other's tamper.** The pair genuinely
tells the two slices apart, which the single row it replaced could not.

### PROBE S — the two couplings D-00d forbids

**Part 1, `setUnitHp` setting `alive = false` at zero:**

```
FAIL  state contract :: alive independent of hp                 actual: false  expected: true
FAIL  state contract :: aliveCount reads the flags, not the hit points   actual: 7  expected: 8
FAIL  the fight loop :: THE SPLIT TAKES A UNIT TO ZERO HEALTH AND THE UNIT IS STILL ALIVE …
      actual:   [[3,6,0],0,false,2]   expected: [[3,6,0],0,true,3]
FAIL  the fight loop :: A UNIT AT ZERO HEALTH IS STILL ALIVE UNTIL THE TABLE SAYS OTHERWISE …
      actual:   [0,true,0,false,8]   expected: [0,true,0,true,9]
FAIL  the fight loop :: A UNIT RULED DEAD AT FULL HEALTH IS DEAD AND STILL HAS ITS HEALTH …
      actual:   [3,false,7]          expected: [3,false,8]
FAIL  the fight loop :: AND A UNIT RULED ALIVE AT ZERO HEALTH IS ALIVE …
      actual:   [0,true,7]           expected: [0,true,8]
1176 passed, 6 failed
```

**All three of this plan's D-00d rows redden, and three shipped ones with them.**

**Part 2, `setAlive` also zeroing the health:**

```
FAIL  state contract :: a full-health unit can be ruled dead     actual: false  expected: true
FAIL  the fight loop :: and the flag moves only when a WRITER is called …
      actual:   [false,0,false,1]    expected: [false,6,false,1]
FAIL  the fight loop :: AND THE OTHER DIRECTION … a unit ruled dead at FULL health stays dead too
      actual:   [false,0,false,0,7]  expected: [false,0,false,3,7]
FAIL  the fight loop :: A UNIT RULED DEAD AT FULL HEALTH IS DEAD AND STILL HAS ITS HEALTH …
      actual:   [0,false,8]          expected: [3,false,8]
1178 passed, 4 failed
```

The *"ruled dead at full health keeps its health"* row reddens naming the health
that was taken away.

### PROBE T — the ruling list accumulating instead of moving into `past`

```
FAIL  the fight loop :: ADVANCE CARRIES THE ROUND'S RULINGS INTO `past` …
      actual:   ["did,hand,round,was",4,true,2]
      expected: ["did,hand,round,was",4,false,2]
FAIL  the fight loop :: ROUND TWO'S RULINGS ARE IN ROUND TWO AND NOT IN ROUND THREE …
      actual:   ["1:hp/c1+shield/m1+dead/c2+hp/m2",
                 "2:hp/c1+shield/m1+dead/c2+hp/m2+hp/m3",
                 "3:hp/c1+shield/m1+dead/c2+hp/m2+hp/m3",
                 "4:hp/c1+shield/m1+dead/c2+hp/m2+hp/m3+dead/m3"]
      expected: ["1:hp/c1+shield/m1+dead/c2+hp/m2","2:hp/m3","3:no ruling","4:dead/m3"]
FAIL  the fight loop :: and the marker is a fact about THIS ROUND …
      actual:   [true,true,true]     expected: [false,false,false]
1179 passed, 3 failed
```

**The row is a MEMBERSHIP row, not a length row, and the probe proves it.** Its
failure prints round two, three and four each holding round one's rulings —
which is a wrong history rather than a missing one, and is exactly the shape a
count would have passed. `3:no ruling` in the expected list is the empty round
the fixture carries on purpose, so the D-04 half is driven in the same row.

## Deviations from Plan

### Corrections to the plan's own premises

**1. [Rule 1 — bug] `setUnitHp` and `setAlive` DO have dispatch arms, under different names**

- **Found during:** task 1's read
- **Issue:** the plan says both ops *"ship, are exported, and have no dispatch
  arm,"* and asks for `case 'setAlive':` and `case 'setUnitHp':` to be added.
  They have had arms since Phase 1, spelled `hp` and `alive`. Plan 05-04's own
  dispatch comment records this and **explicitly hands the spelling decision to
  this plan**: *"Plan 05-05 … gets to decide whether that spelling is still the
  right one — it is named here so the question is asked rather than inherited."*
- **Decision taken:** `hp` and `alive` are **renamed** to the ops' own names, and
  the old spellings are gone rather than kept as aliases. The reason is
  mechanical rather than aesthetic: the one-key names in that router — `ap`,
  `maxHp`, `shield`, `tally` — are **FIELD_OPS' own keys**, looked up from a
  control's `data-act`. `hp` and `alive` were never in `FIELD_OPS` and no control
  ever sent either. They were one-key names that *looked* like field ops and were
  not, which is the shape a later reader adds a fifth of by pattern-matching.
  Adding aliases would have given one op two act names, which is what this file
  refuses everywhere else. The rename also matches plan 05-10's own control
  table, which already names these ops `setUnitHp`, `setFightShield`,
  `nudgeFightHp` and `setAlive`.
- **Consequence:** `[S09.12]`'s hostile-drive row reddened on the rename with a
  readable message (`Unknown op: hp` in place of `Unknown side "…"`), which is
  the property a row that *drives* has and a row that reads an export list does
  not. It was turned in the same change and widened from 28 drives to 56.
- **Commit:** `3d64c27`

**2. [finding] The `[S09.3]` shield tripwire never reddens on this plan**

Documented in full above. It is a comment tripwire; it asserted one of the two
claims its sentence made. Turned into a pair rather than rephrased.
**Commit:** `cbbcc52`

**3. [finding] There is no token-id position in any hand op**

The plan's threat register (T-05-18) names *"a caller-supplied unit id and token
id — two key positions per hand op"* and its bad-input table asks for token ids
*"that never existed, that were removed, and that are reserved
object-prototype keys."* No hand op takes a token id: each writes its own `tok`
from a fixed set of three. That is a position removed rather than guarded, and
`[S09.12]` reads the written set back instead of driving one that does not
exist. **Commit:** `cbbcc52`

**4. [Rule 1 — bug] Three of this plan's own rows were wrong on their first run**

All three found by running them, before any probe:

- one compared the board against a reading taken **before its own fixture step**
  (`removeUnit` sat inside the window the byte-identical row was comparing);
- one called the encoder as `App.codec.encode`, which does not exist, and took
  the suite down with a `TypeError` — **the fifth plan in a row taught that a row
  must be able to FAIL and never to THROW**. It is `App.serialize.encode`;
- the marker row expected a by-hand health ruling that was never recorded,
  because a real Advance had already taken that unit to zero. That one is written
  up above as a finding rather than only as a fix, because it is the *"a set
  that moved nothing is not a ruling"* decision meeting a resolved round, and the
  row now reads both sides of it.

**Commit:** `cbbcc52`

### Additions the plan did not specify

**5. [Rule 2 — missing critical functionality] The key-name ban walked over a fight that carries rulings**

- **Issue:** the plan's must-have is *"no state key anywhere is named after what
  a by-hand change obviously is, and the assertion that forbids it is still
  intact."* Check 73c is intact and green — but it walks a state whose `fight` is
  `null`, which is exactly the limitation wave 2 found and recorded. Green there
  says nothing about a slice carrying rulings.
- **Fix:** a row in `[S09.12]`'s hand-ruling section walks the whole state at
  every depth over four rounds of recorded rulings **plus a live one**, using the
  same five-stem test, over records the **ops** wrote rather than ones a suite
  author guessed at. Check 73c itself was not widened — its job is keeping a
  proposal off the slices and reaching further costs that guarantee.
- **Commit:** `a3ea726`

**6. [Rule 2] The ruling cap's snapshot cost, measured**

- **Issue:** T-05-22's mitigation is *"a `MAX_*` bound with its arithmetic,
  driven past its bound."* The bound and its arithmetic are asserted, but the
  reason the bound exists is that `[S03]` stringifies the whole state on every
  write and keeps thirty of those snapshots — and that cost was a number nobody
  had seen.
- **Fix:** two `t.info` readings beside the declaration ones: `MAX_HAND_RULINGS`
  (144) and **8529 bytes** of fight slice at the ruling cap, against 3143 at the
  declaration cap and 600 with nothing on it.
- **Commit:** `0b78ba9`

### Declined by design

- **No `nudgeFightShield`.** Plan 05-09 draws no ± pair for a shield and plan
  05-10's control table lists four ops. The asymmetry is a paragraph in the
  artifact, not an omission, and it names the eight lines that would add it.
- **`fight.log` was not resurrected.** `did` + `hand` is FIGHT-08's log.
- **No per-value provenance flag.** Declined in writing beside the choice.
- **No death inference in either direction**, and `applyTerm`'s fourth statement
  of D-00d is untouched.
- **`DEFAULTS.cats.ap` was not touched** (D-25).
- **Nothing announces an outcome or names a side** (D-26).
- **Check 73c and `[S09.10]` row 2 were not modified.** `git diff` over both is
  empty.
- **`REFERENCE.beats` gained no consumer and `keywords` gained no writer.**

## Known Stubs

None. Nothing in this plan renders. Every field these ops write is driven in CI,
`hand` arrives with its writer rather than as a seeded empty, and the marker
plan 05-09 draws is proved computable from state with nothing stored for it.

## Threat Flags

None. No new network endpoint, auth path, file access pattern or schema change
at a trust boundary. The five mitigations the plan's threat register assigns:

| Threat | Mitigation, asserted |
|---|---|
| T-05-18 prototype pollution through an id on a hand op | `requireSide` outside the commit and `findUnit` inside; 56 hostile side drives across four ops and four arms, 60 more across the unit-id and value positions; `protoIntact()` inside every walk. **The token-id half of this threat does not exist** — no hand op takes one |
| T-05-19 a hand op writing across the slice boundary | the rewritten `[S09.3]` pair driving each writer against both slices; probe R drives both directions and both halves fire; a `[S09.12]` row reads the build CODE unchanged across a round of rulings |
| T-05-20 health and the alive flag coupled | three driven rows covering both directions at the hand ops, `aliveCount` read in each; probe S drives both couplings and reddens six rows |
| T-05-21 a ruling list that accumulates rather than belonging to a round | a MEMBERSHIP row over four rounds of which one is deliberately empty; probe T drives the accumulating shape and the failure prints which round each ruling landed in |
| T-05-22 an unbounded ruling list inside thirty snapshots | `MAX_HAND_RULINGS` with its arithmetic, driven three past the bound and read as four figures; 8529 bytes at the cap measured |

## Requirements

**None marked complete, and that is deliberate** — the same reading plan 05-04
took. The plan names FIGHT-04, FIGHT-05, FIGHT-07 and FIGHT-08, and every one of
them needs something a person can reach:

- **FIGHT-04** — *"Student can apply damage to an individual unit."* The writers
  exist and have router arms; **no control on the page sends one.** Plans 05-09
  and 05-10.
- **FIGHT-05** — the flag is settable in both directions and both are asserted,
  but *"a unit reaching zero health is MARKED dead"* is a surface. Plan 05-09.
- **FIGHT-07** — *"the override is visibly marked as one."* The fact is stored
  and proved derivable; nothing draws it. Plan 05-09.
- **FIGHT-08** — the log exists as `did` + `hand`; nothing renders it. Plan
  05-08.

Marking any of them here would be the same defect this phase keeps finding.

## What the plans that follow inherit

- **05-06:** unchanged. The topbar reservation is still exactly two, and no hand
  op is a topbar control.
- **05-07:** unchanged. `MAX_DECLARATIONS` is still 48 and the declaration ops
  are still sync-only.
- **05-08:** `past[i]` is now `{ round, was, did[], hand? }`. **`hand` is present
  only when the round held a ruling (D-04) — check `hasOwnProperty` before
  reading it, do not assume an array.** Each entry is
  `{ side, unit, tok, from, to }`; `tok` is a token id, so a name comes from
  `labelFor` and `fillProposal`'s fallback trap applies. **`did` plus `hand` is
  the whole of FIGHT-08** — do not build a third structure. Measured: 600 bytes
  empty, 3143 at the declaration cap, 8529 at the ruling cap, 600 / 6581 / 18561
  at 0 / 10 / 30 resolved rounds, 0.075 / 0.325 / 0.625 ms per commit at those
  depths.
- **05-09:** the by-hand marker is `setByHand(state, side, unitId, tok)` and
  `[S09.12]` carries that read as a row, so **nothing needs to be stored on a
  unit** — a unit's key set is still `alive,hp,id,shield` and a row asserts it.
  The alive flag is recorded under the `dead` token type's 0-or-1, which is the
  same quantity `amountFor` will hand back for a `dead` amount. Both directions
  of D-00d are driven at the hand ops as well as at the applier.
- **05-10:** the four acts are `setUnitHp`, `nudgeFightHp`, `setFightShield` and
  `setAlive` — **the router arms were renamed to exactly those names by this
  plan**, and the old `hp` / `alive` spellings no longer exist. Only
  `nudgeFightHp` returns a boolean, so it is the only one of the four that is
  safe in `HOLD_ACTS`; that decision is still open and the return value is what
  keeps it open. A fight-mode stepper adds a `FIELD_OPS` entry pointing at these
  names rather than a second name for them.
- **05-11:** three more decisions nobody has seen on a screen, on top of plan
  05-04's four and plan 05-02's four. (1) A ruling is recorded as an event in a
  round rather than as a flag on the number — a technique with no precedent in
  this repo, and whether it reads right to the next author is the question.
  (2) The alive flag recorded under the `dead` token type rather than under a
  name of its own. (3) `MAX_HAND_RULINGS` at 144, which nobody has ever reached
  and which costs 8529 bytes inside each of thirty snapshots if they do.
- **Everyone:** **five** plans in a row have now had a row that could **throw**
  instead of **fail**. This one's was a mistyped namespace — `App.codec` for
  `App.serialize` — which is not a subtle mistake and still cost the run 24 rows
  and a clean diagnosis. If a row calls anything across a section boundary, run
  it once before trusting it.

## Self-Check: PASSED

Files verified present: `cats-vs-mechs.html`, `tests/selftest-node.cjs`,
`.planning/phases/05-fight-loop-playtest/05-05-SUMMARY.md`.

Commits verified in the log: `3d64c27`, `cbbcc52`, `0b78ba9`, `a3ea726`.

Verified in the artifact: one `function setFightShield`, one
`function nudgeFightHp`, one `function ruled`, one `case 'setFightShield'`, one
`case 'setAlive'`, and **zero** occurrences of `case 'hp'` or `case 'alive'`.

Final run: `node tests/selftest-node.cjs` → **1185 passed, 0 failed**,
interaction gate **147 of 147**, perf 7 ms of 50, exit 0. Both naming greps
print **0**. Working tree clean after every probe revert; `git checkout --` was
never used on the artifact.
