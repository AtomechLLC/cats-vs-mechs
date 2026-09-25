---
phase: 05-fight-loop-playtest
plan: D41a
subsystem: data-model+ops+codec+selftest
tags: [d-41, redirect, part-1-of-2, reserve, move-op, conservation, s01, s04, s05, s09, refusal-matrix, no-surface]

requires:
  - phase: 05-fight-loop-playtest
    plan: D35a
    provides: "the template this pass copies — schema growth, bounded(), a v1 extension proved by a REAL old code, the refusal matrix grown one shape per guard, and sizes re-measured by driving"
  - phase: 05-fight-loop-playtest
    plan: D39b
    provides: "the refusal/defect split — a plain Error carrying a sentence is a refusal, anything else is a defect — which every refusal moveToken raises is written to"
  - phase: 05-fight-loop-playtest
    plan: D34
    provides: "one-commit composite op with every guard outside the commit, a label no other op writes, and the export list turned openly"
  - phase: 05-fight-loop-playtest
    plan: "REHEARSAL-CLOSER"
    provides: "the measurement that same-label commits inside COALESCE_MS fold — the reason the move label carries the commit count"
provides:
  - "faction.reserve — a sparse per-side bag of unit-scope token counts, absent when empty, so the shipped board did not move"
  - "App.ops.moveToken(tokenId, fromSide, fromUnitId, toSide, toUnitId) — ONE op for unit->unit (either side), unit->pool, pool->unit, pool->pool; a null unit is the side's end"
  - "App.ops.readReserve(faction, tokenId) and App.data.MAX_RESERVE (= MAX_ALLOC)"
  - "router arm `moveToken`, read key by key with flat ends"
  - "removeTokenType drops the departed type's reserve in the same mutator"
  - "the wire: a trailing `P` section, written only when a reserve is non-empty; the tail read by letter (R then P, each at most once); nine reserve guards"
  - "[S09.13] the reserve and the move — a new suite, wholly above any no-DOM bracket"
  - "the refusal matrix at 39 shapes, 32 content rows, 31 distinct guards"
affects: ["the second D-41 dispatch (the pool UI and the pointer drag)", 05-11]

tech-stack:
  added: []
  patterns:
    - "a bound that REFUSES instead of clamping, because the write is a transfer and a clamp destroys a token"
    - "a directional bound test — the source against its floor, the target against its ceiling — so a number left outside a tightened bound can still move TOWARD it"
    - "an undo label carrying [S03]'s monotonic commit count, so two discrete gestures can never fold"
    - "an optional wire tail read by its LETTERS in a fixed order, so a second optional section is still backwards-decodable"
    - "a whole-build conservation equality over a fixed-seed sweep, required to be non-vacuous (floor, ceiling and scope refusals all met)"
    - "a blindness claim made as two driven boards differing in ONE thing, compared byte for byte, with the one-difference asserted first"
    - "probes run on scratchpad copies of the committed tree, never on the working tree, with an EOL-aware patcher that refuses to run a probe whose target is not found exactly once"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D41a-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - .planning/phases/05-fight-loop-playtest/deferred-items.md
    - .planning/STATE.md

key-decisions:
  - "THE RESERVE IS NOT HELD TO THE TYPE'S AUTHORED D-35 PAIR — decided by measurement, as the amendment asked. With Health given an authored ceiling of 3 (the natural 'no cat holds more than three'), a reserve held to the type's pair refuses the FOURTH cat's health on a side holding 27. [S09.13] drives it: all 27 go in, none refused, and the ceiling still binds the UNIT a token is dragged back onto."
  - "BUT IT IS CAPPED, AT MAX_RESERVE = MAX_ALLOC = 99, because conservation itself demands it: a MOVE conserves and a STEPPER does not, so step-then-pool grows a reserve without limit, and an unbounded count is a build code with no length ceiling. Named separately from MAX_ALLOC so one can move without the other; placed in [S01] so [S04] and [S05] both read it and WIRE_BOUNDS needs no re-typed copy (MAX_ROUND_RULES' precedent) — which is also why no WIRE_BOUNDS drift row moved: there is nothing re-typed to drift. Cost: met on the 99th drag of one type into one side's reserve; the shipped board's largest one-type side total is 27."
  - "BOUNDS REFUSE WHOLE AND THE TEST IS DIRECTIONAL. Clamping either half would destroy a token, so an admitted move writes both numbers EXACTLY and a breaching one writes nothing. D-41's sentence is taken literally — source against floor, target against ceiling — which is the only reading under which a mech left at 6 under a ceiling tightened to 2 can still give one away (it reads 5, not 2)."
  - "ONE OP, FLAT ENDS. Four ops would be four copies of the same guards. The router arm reads five flat keys rather than two end objects, for the tally arms' reason one level further out."
  - "SCOPE BINDS, AND EVERY SCOPE BREACH IS A REFUSAL, NOT A DEFECT: a side-scope type onto or off a unit, and Damage and the dead marker, which nobody allocates, are all drags a student can make on part two's surface. Only a non-string token id — which no drag can produce — is a TypeError."
  - "A SAME-END DROP IS NOTHING: it returns false, writes nothing and leaves no undo step (renameTokenType's no-op contract)."
  - "THE UNDO LABEL IS 'token move ' + App.state.stats().commits. The count only rises and every commit raises it, so two moves — even the same type between the same two ends, back to back inside COALESCE_MS — are two entries. Driven against a CONTROL in the same run: two stepper presses on one number DO fold, so the window was open."
  - "THE FIGHT IS BLIND BY CONSTRUCTION AND BY MEASUREMENT. sideFromBuild copies ap, units and tally BY NAME; presentOnCaster sums health and shield off the UNITS. [S09.13] drives two boards differing in the reserve alone through the same three-round fight and requires the fight slice byte-identical and every projection figure identical, at rest and mid-fight."
  - "THE WIRE STAYS v1, EARNED BY A LITERAL. A real code driven at 1966699 (17 sections, rules among them) decodes with no reserve key on either side and re-encodes byte for byte. The reserve's seed is empty, so EMPTY AND ABSENT MEAN THE SAME THING here — unlike the rules — and an empty written section is refused as a second spelling of one board."
  - "THE UNCOMMITTED PRE-AMENDMENT ATTEMPT WAS PARKED, NOT BUILT ON AND NOT DISCARDED. See Deviations."

requirements-completed: []

metrics:
  duration: 44min
  completed: 2026-09-25
---

# Phase 5 D-41a: the conserved reserve and one move for every drag — Summary

**Each side now carries a reserve of unit-scope tokens, and one op, `moveToken`, moves one token
between any two ends on the board: unit to unit across sides, unit to either side's reserve, reserve
to any unit, and side to side. It conserves every type's whole-build total, refuses a bound breach
whole instead of clamping it, and is one commit and one undo entry that can never fold into
another. The fight and the projection never read the reserve, and it travels in the build code as
a v1 section that an empty reserve does not write. Nothing is drawn. Part two builds the pool and the
drag on this op.**

---

## What shipped

| where | what |
|---|---|
| `[S01]` | `MAX_RESERVE = MAX_ALLOC`, exported, with the measurement that decided it |
| `[S05]` | `readReserve` / `writeReserve` / `dropReserve` (the tally's two sparse rules); `moveScope` (reuses `[S02]`'s `isPoolToken`); `moveEnd`; the two bound sentences; `moveToken`; the router arm; the export; `removeTokenType` drops the reserve in its mutator; the DELIBERATELY ABSENT block records the move as allocation, not an applier |
| `[S04.2]` | a `P` section after the rules: one bag per side, `ordinal!count` joined by `.`, sides by `_`, written only when either bag is non-empty |
| `[S04.3]` | the tail read by letter: `R` then `P`, each at most once; nine reserve guards, nine sentences |
| `[S09.13]` | new suite, fifteen records (fourteen rows and one info row), all state work, no no-DOM bracket. With `[S09.11]`'s four wire rows and eleven matrix shapes at two records each, that is the +41 |
| `[S09.11]` | four D-41 wire rows, eleven matrix shapes, fixtures B/H/I re-driven, three counts and three sizes turned |
| `[S09.10]` | the applier-allowlist paragraph re-read and turned in prose; the assertion is unchanged (`['advanceRound']`) |

### The four drags, as one op

```
moveToken(tokenId, fromSide, fromUnitId, toSide, toUnitId)   // unit null = that side's end
```

The side's end is **the reserve** for a type kept on each unit, and **the side's own number**
(`ap`, or the side tally) for a type kept on the whole side. Driven in eleven spellings, each read
back as source −1, target +1, whole-build total unmoved:

| drag | spellings driven |
|---|---|
| unit → unit | same side (hp), across sides (shield), a student's unit type across sides |
| unit → pool | own side's reserve, the OTHER side's reserve |
| pool → unit | own side, the OTHER side |
| pool → pool | reserve to reserve across sides, action points side to side, a student's side type side to side |

### Refusals — each a plain Error with a sentence, each writing nothing

Twelve driven; after each the build is byte-identical, the undo depth unchanged and the commit
count unmoved:

| drag | sentence |
|---|---|
| a side-scope type onto / off a unit | `"Action points" is kept on the whole side, so it cannot be moved onto or off a single unit.` |
| Damage or the dead marker | `"Damage" is not a number anyone allocates, so there is none of it to move.` |
| a target at its ceiling | `Cat 1 holds at most 4 "Health", so it cannot take another.` |
| a source at an authored floor | `Cat 2 keeps at least 1 "Health", so none of it can be moved away.` |
| an empty reserve / unit | `The Mechs reserve has no "Shield" to move.` / `Cat 1 has no "Shield" to move.` |
| a full reserve | `The Cats reserve already holds 99 "Health", which is as many as a reserve holds.` |
| unknown side / unit / type | the shipped guards' own sentences |

A non-string token id is the one **TypeError** (a defect, no drag can produce it). A same-end drop
returns `false` and commits nothing.

---

## Measurements

### Conservation sweep — 400 fixed-seed moves over every end and six types

| moved | same-end | refused at a floor | at a ceiling | on scope | whole-build drift | defects |
|---|---|---|---|---|---|---|
| 67 | 17 | 79 | 26 | 211 | **0** | **0** |

The board is built to meet the bounds constantly: health ceiling 4 while every mech holds 6,
shield ceiling 2, the student's unit type ceiling 3. The row requires >50 moves and at least one
refusal of each kind, because an all-refused sweep conserves spotlessly.

### Build-code sizes — re-measured by driving, 05-D35a's method

| board | before | after | why |
|---|---|---|---|
| A — shipped | 45 | **45** | an empty reserve writes no section |
| B — realistic 12v5 | 344 | **346** | three parked tokens (one of them a cat's Poison into the MECHS' reserve). The 9-char section is almost repaid by the moves shortening the streams they came off |
| D — 24v24, nothing authored | 283 | **283** | no reserve on this fixture |
| E — 24v24 authored | 909 | **909** | no reserve on this fixture |
| H — adversarial ceiling | 3542 | **3623** | all eight unit-kept types in BOTH reserves at two base36 digits — the widest a count is (MAX_RESERVE is `2r`) |
| I — ceiling in emoji | 3744 | **3825** | the same +81: a reserve is ordinals and counts, no text |

A reserve entry is at most five characters with its separator. The whole of D-41 at its own ceiling
is **81** characters, or **2%**.

### Undo

Two moves back to back, with the same type between the same two ends inside `COALESCE_MS`, give
**2 entries**. In the same run, the control (two stepper presses on one number) gives **1**. A move
straight after a stepper press on the same number is its own entry.

---

## The refusal matrix: 28 → 39 shapes

Nine content shapes, one per reserve guard, each past a **recomputed digest**, each reaching a guard
no other row reaches:

| shape | guard |
|---|---|
| three bags for two sides | `a reserve is the wrong shape` |
| an entry with no count | `a reserve entry is the wrong shape` |
| an ordinal one past the code's own vocabulary (**a departed type**) | `a reserve names no token type` |
| action points in a reserve (**a side-scope type**) | `a reserve holds only types kept on each unit` |
| one type twice in one bag | `a reserve names a type twice` |
| `-3` (**a negative count**, which has no base36 spelling) | `a reserve count is not a whole number` |
| `MAX_RESERVE + 1` (**over the cap**) | `a reserve count is out of bounds` |
| a count of zero | `a reserve count of zero is not written down` |
| `P_`, a section holding nothing | `an empty reserve is not written down` |

Plus two **shape** rows: the reserve section before the rules section, and the reserve section
written twice.

---

## Rows turned in the open — RED recorded, rewritten, GREEN

| where | read | RED printed | reads now |
|---|---|---|---|
| `[S09.11]` decoded faction key sets | `[…,tally]`, `[id,name,ap,units,actions]` | `["…,tally,reserve","…,actions,reserve"]` | that, with the order argued; a seventh key still reddens it |
| `[S09.11]` content rows | 23 | 32 | 32 |
| `[S09.11]` distinct guards | 22 | 31 | 31 |
| `[S09.11]` hostile sweep | `[48, 46, 0]` | `[59, 57, 0]` | `[59, 57, 0]` |
| `[S09.11]` board B / H / I info rows and the B<400 label | 344 / 3542 / 3744 | — (info rows never fail) | 346 / 3623 / 3825, re-measured and not scaled |
| `[S01]` measured-sizes comment, `CODE_TARGET` comment | 344 / 3542 / 3744 | — | 346 / 3623 / 3825, decomposition added |
| `[S09.10]` applier paragraph | "moves no token" (D-34's non-applier) | — (prose) | D-41's non-applier DOES move a token; why it is still not an applier; both lists re-read, not widened |

**Nothing pinned noticed the new export.** With the op and codec committed and no rows yet, every
instrument stood at baseline (1341/0, 222/222, 164). The new rows are what hold it now. Checks 72b
and 74 walk it automatically: the no-writer walk went from **69 → 71** exports, **34 → 35** arms
driven, and **78 → 80** acts tried.

---

## Probes — committed first, run on scratchpad copies, working tree never touched

| probe | change | node | gate | rows that caught it |
|---|---|---|---|---|
| **A** half-transfer | two commits with the ceiling test between | 1378/4 | 222 | refusals-write-nothing, conservation sweep, reserve-ceiling, two-undo |
| **B** clamp | ceiling refusal → `Math.min` on the target write | 1379/3 | 222 | conservation sweep, refusals-write-nothing, reserve-ceiling |
| **C1** fight reads reserve | `sideFromBuild` copies `reserve` | 1381/1 | 222 | blindness |
| **C2** projection reads reserve | `presentOnCaster` adds reserve health | 1381/1 | 222 | blindness |
| **D** moves fold | constant label `'token move'` | 1381/1 | 222 | two-undo |
| **E** empty reserve on the wire | encode always writes `P` | 1347/35 | **212** | the 45-char rows, old-code re-encode, round trips; gate 75/76/78/79/82/84/90f/91/113d |

**None stayed green, so the if-it-stays-green clause was not triggered.** Under all six, rows
**failed, never threw, never hung**, with each run finishing in 13 to 18 s. That only became true after
the deviation below: the first run of probe E threw.

---

## Deviations from Plan

### 1. [Rule 3 — Blocking] An uncommitted pre-amendment D-41 attempt was sitting in the main tree

- **Found during:** startup, before any baseline.
- **Issue:** `git status` showed ~1,021 lines uncommitted in `cats-vs-mechs.html` and
  `tests/selftest-node.cjs`, written 13:46–13:48 against D-41 **as first recorded**, before the
  15:38 amendment (whose own heading says "before any code was written"). HEAD reproduced every
  dispatch baseline exactly (1341/0, 222/222, 164, 1465/0). The WIP tree did not: DOM read **1479
  passed, 1 failed**. It also carried drag **surface**, which part one forbids, implemented the
  **withdrawn** within-a-side rule, and defined a `dropRefusal` op name that collides with `[S07.1]`'s.
- **Fix:** it was not built on, and it was not discarded. It is parked verbatim on the local branch
  **`wip/d41-pre-amendment-drag-ui` at `d081c3b`** (not pushed), and `main` returned to HEAD by
  switching branches. No `git checkout --`, `git stash` or `git clean` was used. A patch and file
  copies are also in the session scratchpad. Recorded in deferred-items for part two to mine.
- **Commit:** d081c3b (on the side branch)

### 2. [Rule 1 — Bug] A D-32 row threw instead of failing under a refusal

- **Found during:** probe E, first run: `build code :: suite threw — TypeError: Cannot read
  properties of undefined (reading 'cats')`.
- **Issue:** the term-ORDER row (commit 3e90273) read `wireBack.build` with no refusal check, while
  the row one above it guards. When decode refused, the throw stopped `[S09.11]`, and every row below
  it went unreported, the whole refusal matrix included.
- **Fix:** guarded in the sibling's own idiom. A green run is unchanged. Under probe E the suite now
  reports all of its rows.
- **Commit:** c6f1ebc

### 3. [Rule 1 — Bug in a row of mine] The first round-trip row demanded bag key order the file does not keep

- **Found during:** the first run of the new rows. The live reserve held `{t1, shield}` in drag
  order, while the decoder builds in ordinal order.
- **Fix:** the board is compared key-sorted and the code byte-for-byte, the same split every BOARD
  row makes. No bag in this file keeps key order (the tally bag behaves identically). The
  order-sensitive half of the claim is the re-encode. The finding is recorded at the row.
- **Commit:** ed3a48e

### 4. Two smaller corrections, both before commit

- `c`**`loser`** inside "rehearsal closer" tripped PROJ-06 Layer A (`/loser/i` over the whole
  document), so the prose was reworded.
- `App.model.presentOnCaster` is not exported. The blindness row now reaches it through
  `affordability` on an authored action that REQUIRES health and the student's own type, which is
  the path probe C2 then proved it covers.

---

## Instruments

| | baseline (HEAD 1966699) | after (c6f1ebc) |
|---|---|---|
| `node tests/selftest-node.cjs` | 1341 / 0, exit 0 | **1382 / 0, exit 0** (+41) |
| interaction gate | 222 of 222 | **222 of 222** (no gate row added; 72b and 74 walk the new op on their own) |
| stub-drift | 164 shell ids | **164** (no surface) |
| `node tests/selftest-dom.cjs` | 1465 / 0 | **1506 / 0** (+41; the tier delta is still 124, so every new row runs in the bare sandbox) |
| `tests/browser-checks.mjs` | 374 / 0 headless | **374 / 0 headless, exit 0** (four columns) |
| live `#selftest`, real Chrome + real Edge | 1465 / 0 | **1506 / 0** in both, no page errors |
| whole in-file suite, wall clock | 1127 ms | 1826 ms (the ceiling boards fill their reserves one token at a time) |

`DEFAULTS` untouched. No surface added. No banned key (`propos|override|caster|target|pending`):
the new state key is `reserve`.

## Known Stubs

None. Nothing in this pass renders anything. The absence of a surface is the brief, and part two
owns it.

## Threat Flags

| Flag | File | Description |
|---|---|---|
| threat_flag: wire-input | cats-vs-mechs.html `[S04.3]` | A new pasted-code section (`P`) reaches state. It is rebuilt key by key from `order` (never from a pasted key), every count is re-bounded, the scope is re-checked, and nine refusal shapes are asserted past recomputed digests. `__proto__` cannot arrive as a key, because ordinals index a list. |

## Self-Check: PASSED

Files: 05-D41a-SUMMARY.md, cats-vs-mechs.html, deferred-items.md, STATE.md all present. Commits d081c3b (side branch), 6c9c2b5, ed3a48e, c6f1ebc present; 1966699 and 3e90273 (cited) present. Final instruments measured on c6f1ebc with the artifact and tests byte-identical to it: node 1382/0 exit 0, gate 222 of 222, 164 shell ids, DOM 1506/0, browser 374/0 headless exit 0, live #selftest 1506/0 in real Chrome and real Edge.
