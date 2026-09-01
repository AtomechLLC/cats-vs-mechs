---
phase: 05-fight-loop-playtest
plan: D35a
subsystem: data-model+ops+codec+gate
tags: [d-35, redirect, part-1-of-2, token-bounds, round-rules, s01, s04, s05, s09, wire-bounds, refusal-matrix, no-surface]

requires:
  - phase: 05-fight-loop-playtest
    plan: D32a
    provides: "the discipline this plan copies wholesale — a cap with its arithmetic beside it, wire bounds moved in the SAME change, drift rows that catch the move, and a refusal matrix extended one shape per guard"
  - phase: 05-fight-loop-playtest
    plan: "04"
    provides: "advanceRound and its DOES/does-NOT table — the hardcoded refill this plan replaced, and the table that had to be amended in the open"
  - phase: 05-fight-loop-playtest
    plan: "02"
    provides: "D-00d, `alive` as a stored flag — the line a round rule taking health to the floor comes closest to crossing"
  - phase: 04-share-reset
    plan: "03"
    provides: "the refusal matrix's own-guard discipline and its recomputed-digest mechanism, extended here from twenty shapes to twenty-eight"
  - phase: 02.1-token-authoring
    plan: "01"
    provides: "the three-layer id gate, carried by both new writers"
provides:
  - "a token type carries `min` and `max` — authored, bounded to [0, MAX_ALLOC], shipped at exactly that pair so the board did not move"
  - "App.ops.setTokenBounds(tokenId, patch) and App.ops.tokenBounds(vocab, tokenId) — one writer, one reader, and every write path in the file spends the reader"
  - "bounded(vocab, tok, value, what) replaces the literal 0/MAX_ALLOC pair at eleven write paths"
  - "build.rules — a student-editable round-rule list, `{ who, tok, d }`, capped at MAX_ROUND_RULES = 8"
  - "App.data.ROUND_WHO / ROUND_WHO_IDS — four parties, a side or each of a side's units, index-stable"
  - "App.ops.setRoundRule(index, who, tokenId, d) — one writer covering append, replace and remove, in setActionCost's idiom"
  - "App.ops.rulesNaming(build, tokenId) — actionsNaming one scope up, for part two's surface"
  - "advanceRound applies build.rules where the refill stood; ruleRoundRules refuses a departed type by name, outside the commit"
  - "the codec carries both features at wire version v1, with a real pre-D-35 code driven to prove it"
  - "the refusal matrix at 28 shapes, 23 content rows, 22 distinct guards"
  - "gate check 114; deferred-items 13 and 14"
affects: ["the second D-35 dispatch (the authoring surfaces)", 05-11]

tech-stack:
  added: []
  patterns:
    - "a constant becoming authored data with its shipped value equal to the old constant, so the behaviour change is exactly zero and the schema change is the whole of the diff"
    - "a grammar extended ON THE END at two levels — two fields on a record, one section on a body — so the old shapes remain legal readings and the wire version does not move"
    - "a difference-only section that distinguishes ABSENT from EMPTY, so 'no rules at all' stays shareable"
    - "a byte-identical regression pin captured from the previous commit and pasted as a literal, because a recomputed expectation agrees with whatever the new code does"
    - "a fork preserved as a MEASUREMENT of both semantics side by side rather than resolved by the implementer"
    - "a test block moved to the end of its suite after a resetToDefaults inside it moved the id space out from under the rows below"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D35a-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - .planning/phases/05-fight-loop-playtest/deferred-items.md
    - .planning/STATE.md

key-decisions:
  - "BOUNDS SHIP AT [0, MAX_ALLOC] AND THAT IS WHY THE BOARD DID NOT MOVE. int() has clamped every quantity in this file to 0 and 99 since Phase 1; D-35 makes that pair a property of the token type. Shipping the five built-ins at exactly the old pair means every write path behaves identically on the shipped board BY CONSTRUCTION rather than by care — the diff is a schema change and a clamp that reads its numbers from a record instead of from two literals. The alternative that was declined, and it is the one D-35's own record hints at: ship `ap` with a max equal to the side's configured pool, which would make the +3 rule reproduce the refill in every case. It was declined because a bound that resolves to another field is a per-type special case, the exact second tier D-24 forbids, and because it would clamp a student's own +ap transformation to a pool figure they did not write — and because it would break the AP stepper past 3 on a board every student starts from."
  - "BOUNDS ARE PROPERTIES OF THE TYPE, WHICH MAKES ONE CLAUSE OF D-35 UNIMPLEMENTABLE AS WRITTEN AND IT IS RECORDED RATHER THAN QUIETLY RESOLVED. The developer's words are 'a property for min and max of a token on a unit or side' — the type's property, applied at whichever scope the type keeps its number. The orchestrator note that shield gets 'a max of its starting value' cannot be a TYPE property on a board where three mechs may start at three different shields. So shield ships at the type-wide pair and its no-refill comes entirely from having NO ROUND RULE, which is the other half of the same D-35 sentence and the half that is implementable. Written into DEFAULTS' own comment and into deferred-items 14."
  - "THE CLAMP IS AT WRITE TIME AND DOES NOT REACH BACK, and this is load-bearing in two directions. A bound tightened after a number was written leaves that number standing; the NEXT write obeys it. Forward: a bounds edit that swept two rosters would rewrite numbers on a surface nobody was looking at. Backward: a decoder that REFUSED a value outside its own board's bounds could not round-trip a board the ops legitimately produced — set maxHp to 9, then drop the ceiling to 5, and the board holds a 9 that the ops allow and a refusing decoder would reject. So [S04.3] re-runs MAX_ALLOC on quantities and re-runs the BOUNDS only on the bounds themselves. Both halves are driven."
  - "THE +3 FORK IS TAKEN LITERALLY AND ITS SCOPE IS WIDER THAN D-35 RECORDED — this is the finding of the plan. D-35 names the retune of nine as where +3 and refill part company. They also part company AT THREE, in any round a side leaves a point unspent, because +3 ADDS to what is there and a refill REPLACED it. Three shipped rows went red on exactly that and every one was rewritten rather than relaxed: a hand-ruling round that spends one of three points now reads [4, 5] where it read [3, 3]; a six-point pool spending two reads 7 where it read 6; and the gate's spoken-for clause, which asserted the post-Advance reading equals the idle STRING, now asserts what that clause was actually about — nothing spoken for, the whole pool left to spend — positionally. The shipped 9v3 fight is byte-identical only because nine cats with three points spend all three every round, and [S09.12] drives exactly that fight rather than claiming it."
  - "THE WIRE STAYS v1 AND IT IS EARNED BY A LITERAL, NOT BY AN ARGUMENT. Both extensions are ON THE END: two fields on a vocabulary record, one section on the body, written only when the rules differ from the seed. So a five-field record means the shipped bounds and a sixteen-section body means the shipped rules. That is a construction argument; the row that makes it a measurement is a REAL v1 code produced by driving the artifact at commit fe67194 and pasted as a literal — it decodes, it loads the classmate's board, and every type comes back at [0, 99] with the shipped rule list. The shipped board still writes its old 45 characters exactly, character for character, asserted against the old string."
  - "AN EMPTY RULES SECTION AND AN ABSENT ONE MEAN DIFFERENT THINGS. Writing the section only when it differs from the seed is what keeps the untouched board at 45 characters, and it creates one case that could have been lost: a student who deletes every rule. Seventeen sections with `R` and nothing after it is an empty list; sixteen sections is the seed. Collapsing them would have made 'this board has no round rules' unshareable, which is a board a student is allowed to build."
  - "A DEPARTED TYPE IS ACT-07's TREATMENT, ONE SCOPE UP, AND DELIBERATELY THE SAME ONE. removeTokenType allows the removal and does NOT rewrite the rule, because a rewritten rule is a silently changed rule. rulesNaming is what lets part two's surface say what a removal will break, and Advance refuses BY NAME at fire time — in the ruling pass, outside the commit, so the board and the undo stack are exactly where they were. Refusing the removal instead would have been a new behaviour class in a file where nothing else refuses one."
  - "A ROUND RULE NEVER WRITES `alive`, AND THIS IS THE FIRST FEATURE WHERE A STUDENT'S OWN RULE COULD HAVE. A rule of -99 health floors every unit at the health type's own min and stops; clamping is not killing (D-00d). Driven at a floor of 0 and again at a floor the student raised to 2, reading the whole roster and aliveCount both times, because a row watching one unit is green over an applier that killed the other eight. The DOES/does-NOT table gained the row in the open."
  - "THE APPLIER'S SPLIT IS COMPUTED FIRST AND CLAMPED SECOND, AND THE ORDER IS A RULING. damageSplit reads the shield and health actually on the board and divides the hit; the bounds then say what may be WRITTEN. So a health floor above zero stops the number at the floor and the RECORD still says how much of the hit the health took — the student reads both and rules on the difference. The alternative, clamping the split itself, would have made the bound change what the hit WAS rather than what the board can hold."
  - "PART ONE SHIPS NO SURFACE AND THE GATE ROW SAYS SO. Check 114 is a survival check by design: a board with three bounded types and two student-written rules renders on the board tab, starts a fight, declares through a real picker button and advances through the real Advance, and the rules RUN — the pool moves by the student's rule and the Chill tally comes down. The harvest rides with it, re-taken over that board rather than inherited, because a bounded board is exactly where a helpful sentence about a cap would be written and every such sentence is a judgement the tool may not make."

requirements-completed: []

metrics:
  duration: one session
  completed: 2026-09-01
---

# Phase 5 D-35a: round rules as data and token min/max bounds — Summary

**The developer asked for two things and this dispatch built both below the surface: a token
type now carries an authored `min` and `max` that every write path in the file obeys, and what
happens at the end of a round is a student-editable list Advance reads instead of a refill it
performed. Nothing new is on screen — part two builds the authoring controls — and the shipped
9v3 fight, driven three rounds, is byte-identical to what it was before the change.**

---

## What shipped

### 1. Bounds

`DEFAULTS.tokens.*` gained `min: 0, max: MAX_ALLOC` — exactly the pair `int()` has enforced
since Phase 1, which is why the shipped board does not move by a single number or a single
character of build code. `createTokenType` writes the same pair, so every type on every board
carries the same seven keys and a round trip is exact.

`[S05]` gained two functions and spent them everywhere:

- `tokenBounds(vocab, tokenId)` — reads the pair defensively, because a vocabulary reaches it
  from a pasted code, from an `[S09]` restore of a pre-D-35 snapshot, and from a board a
  student is halfway through authoring. An absent or unreadable bound is the bound this file
  has always enforced.
- `bounded(vocab, tokenId, value, what)` — `int()` with the type's own pair.

Eleven write paths moved from the literal `0, MAX_ALLOC` to `bounded(...)`: `setFactionAp`,
`nudgeFactionAp`, `setUnitMaxHp`, `nudgeUnitMaxHp`, `setUnitShield`, `nudgeUnitShield`,
`setTally`, `nudgeTally`, `setUnitHp`, `nudgeFightHp`, `setFightShield`, plus every arm of
`applyTerm` (ap, tally, shield, plain health, and both halves of the damage split) and both
arms of Advance's cost spend.

`setTokenBounds(tokenId, patch)` is the writer. It carries the three-layer id gate its two
neighbours carry, refuses a bound outside `[0, MAX_ALLOC]` and refuses a min above its max —
**refuses, never clamps**, because writing a different rule from the one the student typed is
the failure the whole file is built to avoid. An end left out means "leave that end alone",
which is what lets the router's one payload write either half.

### 2. Round rules

`build.rules` is a list of `{ who, tok, d }`, capped at `MAX_ROUND_RULES = 8`, seeded with the
developer's own default:

```js
rules: [
  { who: 'cats',  tok: 'ap', d: 3 },
  { who: 'mechs', tok: 'ap', d: 3 }
]
```

`who` is an index into `ROUND_WHO`, four frozen records carrying the side and the reach they
mean — `cats`, `mechs`, `catsEach`, `mechsEach` — so no caller anywhere does string surgery on
an id to find out which side a rule is about. The field names are `who`/`tok`/`d` because the
transformation record one level down already answers the same questions with them, and because
check 73c's banned-name walk refuses `proposal`, `override`, `caster`, `target` and `pending`
— every one of which a round rule could plausibly have been given a field for.

`setRoundRule(index, who, tokenId, d)` is the one writer, in `setActionCost`'s idiom argument
for argument: a write at the end appends, a write inside replaces, a write past the end is
refused, and a `who` of `CLEAR_TERM` removes the slot and closes the hole.

`advanceRound` calls `applyRoundRules(g, s.build)` where `SIDES.forEach(refill)` stood. A rule
naming a scope that holds no such number — action points on each unit, health on a whole side,
the drawing-only `dmg` and `dead` types — lands nowhere, which is `ruleTerm`'s own treatment of
the same case one scope down. A rule naming a departed type is refused **by name** in the
ruling pass, outside the commit.

The shield's no-refill stopped being a ruling of Advance's and became an absence: the shipped
list carries no shield rule, and a student who wants Recharge-style regen writes one. Both
comments — Recharge's in `DEFAULTS` and Advance's own — say so in the open.

### 3. The codec, still v1

| what | old shape | new shape | what an old code means |
|---|---|---|---|
| built-in vocab record | 5 fields | 7 fields | 5 fields → the shipped bounds |
| custom vocab record | 6 fields | 8 fields | 6 fields → `[0, MAX_ALLOC]` |
| body sections | 16 | 16 or 17 | 16 → the shipped rules |

Both extensions are **on the end**, and the rules section is written only when the list differs
from the seed — so the untouched board writes no vocabulary record to hang a bound on and no
rules section at all, and its code is still the same 45 characters, asserted against the old
string. Four new decode guards for the rules and two for the bounds, each with its own
sentence.

---

## The +3 fork, and what driving it found

D-35 records the fork this way: *"+3 capped at the side's configured AP is identical while AP is
3, and genuinely different at the candidate retune of 9. Playtest question: which one makes the
9v3 contested?"*

**The fork is real, it is preserved, and its scope is wider than that.** `+3` ADDS to what is
there; the refill REPLACED it. They agree only when the pool was spent to nothing.

- **At three, spending all three:** identical. The shipped 9v3 fight — nine cats, three action
  points, three declarations a side, three rounds — produces a fight slice **byte-identical**
  to the one the file produced at commit `fe67194`. `[S09.12]` asserts that as a whole-slice
  equality against a 5,429-character literal captured from the old file, not against a
  recomputation.
- **At three, leaving a point unspent:** they diverge. Three shipped rows went red on exactly
  this and all three were rewritten in the open rather than relaxed.
- **At nine:** `[S09.12]` drives the same board twice, once under each semantic, and reads the
  pool back after each of three rounds:

| rule | round 1 | round 2 | round 3 |
|---|---|---|---|
| `+3` (shipped) | 11 | 13 | 15 |
| `+99` clamped at a max of 9 (the old refill, expressed in the new feature) | 9 | 9 | 9 |

Neither is asserted to be the right one. The old semantic remains expressible, so 05-11's
answer is a one-line edit to a seeded rule.

---

## Rows turned in the open

Every one recorded red first, rewritten to the new contract, D-35 cited at the site.

| where | what it read | what it reads now |
|---|---|---|
| `[S09.3]`, `[S09.7]` ×3, `[S09.9]`, `[S09.11]` | the build slice holds four keys | five — `rules` is the fifth, and a sixth still reddens it |
| `[S09.7]` | a type is made of five fields | seven — `min` and `max` join them |
| `[S09.11]` | a decoded build holds four keys in the slice's order | five, order still asserted |
| `[S09.12]` | "the pools read full afterwards, because the pool REFILLS each round" | the arithmetic, stated: leftovers plus the rule |
| `[S09.12]` | six action points less two is four, and the refill puts it back to six | …and the rule then adds three, so it reads seven |
| `[S09.12]` | a hand-ruling round leaves both pools at `[3, 3]` | `[4, 5]` — the fork met by accident on the shipped board |
| `[S09.11]` | 15 content rows / 14 distinct guards / 20 tamper shapes | 23 / 22 / 28 |
| `[S09.11]` | 40 codes swept, 38 refused | 48 / 46 |
| `[S09.11]` | board B 297, board E 675, H 3434, I 3636 | 344 / 909 / 3542 / 3744 |
| gate 73c | `build="schema,cats,mechs,tokens"` | `…,rules` |
| gate 96, 102 | the resolved reading equals the idle STRING | nothing spoken for, the whole pool left to spend — read positionally |
| gate 106i | starve the pool by setting the build to nothing and advancing | starve it through a `-99` round rule, which is the feature doing the work |

The wire-bounds drift rows behaved exactly as `[S04.3]`'s own paragraph says they exist to:
the reordered-vocabulary fixture assembles a build by hand and, without `rules` carried across,
wrote an EMPTY rules section against a straight code that wrote none — a red run naming the one
place in the suite that hands `encode` a slice it built itself.

---

## Measurements

| board | before | after | why |
|---|---|---|---|
| A — the shipped board | 45 | **45** | writes no vocabulary record and no rules section |
| B — a realistic 12v5 | 297 | **344** | two bounded types and three rules authored on the fixture |
| D — 24v24, nothing authored | 283 | **283** | unchanged |
| E — 24v24 fully authored | 879 | **909** | five characters of bounds on each of six types |
| H — the adversarial ceiling | 3434 | **3542** | eleven distinct bound pairs and the rule list at its cap |
| I — the same in astral emoji | 3636 | **3744** | the same 108, because bounds and rules carry no text |

Bounds cost **five characters** per vocabulary record that is written at all; a round rule costs
about **four**. The whole of D-35 at its own ceiling is 89 characters, and the ceiling moved 3%.

**One figure in that table was already stale before this plan touched it.** Board E read 675 in
the source and had measured 879 since D-32 — that change re-measured H and I in the same field
and left E alone. The figure lives in a `t.info` row, and an info row never fails. Recorded
rather than quietly corrected.

---

## The refusal matrix: 20 → 28 shapes

Eight added, each reaching a guard no other row reaches, each past a **recomputed digest**:

| what | guard |
|---|---|
| a max one past `MAX_ALLOC` | `a bound is out of bounds` |
| a min above its max | `a bound is upside down` |
| a rules list one past `MAX_ROUND_RULES` | `too many round rules` |
| a rule whose token ordinal is past the vocabulary | `a round rule names no token type` |
| a rule naming a party past `ROUND_WHO` | `no such round rule party` |
| a rule carrying two fields where the grammar has three | `a round rule is the wrong shape` |
| a rule amount one past `MAX_XF_DELTA` after the bias | `a round rule is out of bounds` |
| a rule that changes nothing | `a round rule of nothing is not written down` |

---

## The near-miss worth writing down

The `[S09.7]` block was first written **above** that suite's no-DOM bracket, beside the other
vocabulary rows, which is where it belongs by subject. Its `resetToDefaults` calls moved the
token id sequence out from under the board rows below it, which create a type and then address
it as `t1`. The whole suite threw on a stub page — and because a thrown suite stops before its
own hand-back, the PAGE was left showing the shipped board, which reddened **interaction-gate
check 82**, three hundred rows away, on a link that had nothing to do with any of it.

The rule the miss states, and it is worth more than the fix: **a suite that drives
`resetToDefaults` is a suite whose successors inherit a different id space.** This file's suites
are one long sequence, not a set of independent cases. The block moved to the end of its suite,
where the only thing after it is the hand-back.

---

## Gate

| | before | after |
|---|---|---|
| in-file selftest | 1261 / 0 | **1327 / 0**, exit 0 |
| interaction gate | 200 of 200 | **201 of 201** (+114) |
| stub-drift | 136 shell ids | **136 — unmoved, and that is the point: this change moved no id** |
| `DIALOG_FLOOR` | 138 / 172 | **138 / 172 — unmoved** |
| `FIGHT_FLOOR` | 132 / 586 | **132 / 592** |
| browser checks | 242 / 0 headless | **242 / 0 headless** |

`DEFAULTS.cats.ap` is untouched (D-25 stands). No banned key (`propos|override|caster|target|
pending`) appears anywhere in state. No op reads `REFERENCE.beats` and none writes `keywords` —
checks 72b and 74 walk the LIVE export list, so the four new exports joined both walks
automatically and both are green.

---

## What part two owns

Every authoring surface: a bounds pair on the token editor, a round-rules list somewhere a
student can read and edit it, and the fight surface saying what a round rule did. `rulesNaming`
is already exported for the removal warning. Nothing in this dispatch renders a word about
either feature, and check 114 says so in its own label.
