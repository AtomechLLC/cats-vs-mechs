---
phase: 05-fight-loop-playtest
plan: 02
subsystem: state
tags: [fight-slice, s03-banner, s05-ops, reset-fight, s09-12, share-07, d-24, tally]

requires:
  - phase: 01-foundation
    provides: "commit()/commitStructural, the undo stack, thaw() as the JSON-clonable enforcement, startFight/endFight/setUnitHp/setAlive and sideFromBuild"
  - phase: 02.1-token-authoring
    provides: "the single token-type list with explicitly no second tier — D-24's whole argument"
  - phase: 04-share-reset
    provides: "encode taking the build slice as an ARGUMENT, which is what makes SHARE-07 structural; and the tally bag's hasOwnProperty discipline"
  - phase: 05-fight-loop-playtest
    plan: 01
    provides: "the verdict gate pointed at a fight-mode page, so this plan's comments and labels were written inside a gate that could already read them"
provides:
  - "the fight slice this phase writes into: { round, decl, past, cats, mechs }, with `turn` and `log` retired BY NAME"
  - "a student-invented tally carried into the fight at both scopes, mirroring the build (D-24)"
  - "MAX_PAST_ROUNDS = 30, exported, with the measurement that says it is a readability cap and not a performance one"
  - "resetFight — one commitStructural, one undo entry, build untouched, guarded inside the mutator"
  - "freshFight() — one spelling of the opening slice, shared by startFight and resetFight"
  - "[S05]'s DELIBERATELY ABSENT block in its positive form: what exists, that advanceRound is the ONE applier, and that no writer decides anything"
  - "[S09.12] the fight loop — 40 rows, every one above any no-DOM bracket"
  - "the key-name walk over a fight that actually exists, which no shipped walk had"
affects: [05-04, 05-05, 05-06, 05-07, 05-08, 05-09, 05-10, 05-11]

tech-stack:
  added: []
  patterns:
    - "a banner rewritten in the SAME change that makes its old text untrue, with the declined alternative named beside the decision"
    - "one spelling of a seed shared by every op that produces it, so two producers cannot diverge"
    - "a suite row must be able to FAIL; it must not be able to THROW — a throwing row takes the whole suite and unrelated checks with it"
    - "an assertion whose subject does not exist yet (a fight's declaration list) is placed through App.state.commit and labelled as standing in for the op that will write it"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "turn is RETIRED rather than repurposed — the round loop is simultaneous, so there is no side whose turn it is; the alternative (repurpose it to 'the side that declared first') names a fact the loop does not have"
  - "log is DELETED rather than given a writer — past[i].did + past[i].hand is the record and it is the same object the ledger renders; two structures both claiming to be what happened will disagree"
  - "a student-made tally IS spendable in a fight (D-24), and the fight carries its OWN copy, MIRRORING the build at both scopes rather than always-present or side-only"
  - "setUnitHp's clamp stays MAX_ALLOC — a heal that cannot overshoot and a shield that cannot read as temporary health are both RULINGS, and rulings belong to the table"
  - "check 73c is NOT widened to reach the fight slice; the reach is added inside [S09.12] instead, because widening 73c costs the guarantee it exists for"
  - "no requirement is marked complete: all three this plan names need a control or a surface, and this plan renders nothing"

patterns-established:
  - "jsonDrops() — name the PATH of a value a JSON round trip would drop, because the report serialises a failed row with JSON too and would print two identical strings"
  - "tallyOf() in a suite — read a bag the way readTally does, so a row about an absent bag fails with 0 instead of throwing"

requirements-completed: []

duration: 105min
completed: 2026-08-29
---

# Phase 05 Plan 02: The Fight Slice, the Lifecycle, and Four Deferred Rulings Summary

**`[S03]`'s banner stopped describing a slice the file does not have, `resetFight` costs exactly one Ctrl+Z, and two probes discovered that every shape rule in this repo had been reading a state whose fight was `null` — so the rules the phase depends on had never once been applied to the slice the phase writes into.**

## The gate, before and after

| | before | after |
|---|---|---|
| suite | 1051 passed, 0 failed | **1093 passed, 0 failed** (+42) |
| `SUITE_FLOOR` | 1019 | **1063** |
| interaction gate | 147 of 147 | 147 of 147 |
| stub-drift | 96 shell ids | 96 shell ids |
| `#app` (setup) | 127, floor 117 | 127, floor 117 |
| `#app` (fight) | 101, floor 41 | 101, floor 41 |
| dialogs | 145 across 4 roots, floor 138 | 145 across 4 roots, floor 138 |
| proposal pane | 60, floor 23 | 60, floor 23 |
| Layer B literals | 5582 | 5865 |
| exported ops (check 74) | 48 | **49** |
| dispatch arms driven (check 74) | 18 of 57 | **19 of 58** |
| action records read (check 74) | 425 | **432** |

Every floor the plan required to be unchanged is unchanged. `tests/selftest-node.cjs`
changed in exactly two places — `SUITE_FLOOR` and its history paragraph. **Check 73c was
not touched**, confirmed by diffing the harness across this plan's five commits.

## Suite delta: 42 rows, and where they came from

- **40 rows** are `[S09.12]`, the new suite. Counted off the `node` output: 40 rows carry
  the `the fight loop ::` prefix, and **zero are skipped** — the suite has no no-DOM
  bracket anywhere in it.
- **2 rows** are the `[S09.3]` repair that probe F forced. See Deviations.

## The four rulings, as written, each with the alternative it declined

### 1. `turn` is retired, not repurposed

The key shipped with plan 01-02 and encoded **alternating turns**. The round loop the
developer settled on 2026-08-28 is **simultaneous**: one Advance resolves both sides, so
there is no side whose turn it is. `[S03]`'s banner opens by forbidding a banner that
quietly lies, and a key named after a concept the file no longer has is exactly that.

What replaces the readable fact it carried: **the round number and both pools** — a
statement about the board rather than about a turn order.

**Declined:** repurposing the key to mean "the side that declared first". That is not a
fact the loop has, and inventing one to keep a key alive is worse than deleting it.

### 2. `log` is folded into `past`

`fight.log` shipped as `[]` with no writer and no reader. `past[i].did` plus
`past[i].hand` **is** FIGHT-08's record, and it is the same object FIGHT-14's ledger
renders. Two structures both claiming to be what happened will disagree.

**Declined:** keeping `log` for a flat, sentence-per-line reading. A derived reading of
`past` cannot go stale; a stored parallel one can.

Both paragraphs are written into `[S03]`'s banner so the next reader does not restore
either field, and `[S09.12]` carries a row asserting the absence **by name**.

### 3. A student-invented tally is spendable in a fight (D-24)

`sideFromBuild`'s own comment used to say *"Whether a tally should be spendable DURING a
fight is a fight-semantics ruling, and Phase 5 owns it."* Ruled: **yes, on the same terms
as a shipped type.** Phase 2.1 existed so the vocabulary stops being ours and starts being
theirs, and it shipped with a single list and explicitly no second tier. A type that
worked everywhere except in the fight would put that tier back at the one moment it
matters most, and it would do it silently.

The fight carries its **own** bag, copied through the file's own `JSON.parse(JSON.stringify(x))`
idiom with `hasOwnProperty` on every step — so nothing in the fight loop writes to `build`,
and the codec still cannot see a fight because there is nothing of the fight anywhere it
reads.

**Declined:** leaving a tally as a build-time annotation the student increments by hand.
Smaller slice, further from interpreting a student-made type — but the tool interprets
nothing either way, and "smaller slice" is a cost paid by nobody against a second tier
paid for by every student who invented a type.

> **This is where the plan was deviated from — see Deviations, item 3.** The plan's shape
> block put `tally` on the SIDE only. A unit-scoped type would then have had nowhere in
> the fight slice to live, which is the same second tier one level down.

### 4. `setUnitHp`'s clamp stays `MAX_ALLOC`

The comment left this "consciously, not missed" to Phase 5. Ruled: **the clamp stays.**
Whether a heal may overshoot the allocation, and whether a shield may read as temporary
health above it, are both **rulings** — and rulings belong to the table, not to a clamp.
The bound that remains is a bound on what a FIELD can hold, not on what a fight can mean.

**Declined:** clamping at `maxHp + shield`, so fight health can never exceed the eHP the
projection promised. Tidier, and exactly the tool deciding.

## The slice, measured

```
fight key set     : cats,decl,mechs,past,round
turn present      : false
log present       : false
whole-slice scan  : no turn, no log anywhere
cats side keys    : ap,units          (no student-made type on the shipped board)
unit keys         : alive,hp,id,shield
fight slice bytes : 600
```

`JSON.parse(JSON.stringify(state))` is identical to `state` with a fight running and a
tally set at both scopes: **true**.

## The build code, with and without a fight

```
code before startFight : v1~N~V~A9~3~9*3!0~9*~~~~B3~3~3*6!3~3*~~~~7tvo
code after  startFight : v1~N~V~A9~3~9*3!0~9*~~~~B3~3~3*6!3~3*~~~~7tvo
byte-identical         : true
```

Asserted in `[S09.12]` across **four** fight states — no fight, a fight running, a
declaration standing, and a round resolved — plus a companion row proving the reading is
not vacuous (the code decodes back to the board and re-encodes to itself).

## `resetFight`, measured

```
threw with no fight        : true  ("No fight in progress") | undo depth 0 -> 0
both sides back to build   : true  | round 1 | decl 0 | past 0
undo depth delta           : 1
build byte-identical       : true
one undo restores mid-fight: true
build still byte-identical : true
```

Written as one `commitStructural` reusing `freshFight(s.build)` — the same seed
`startFight` uses, so a reset and a fresh start cannot diverge. The guard is `fightOf(s)`
**inside** the mutator, so a refusal leaves no phantom undo step. Structural for a reason
of its own rather than `startFight`'s: FIGHT-10 lets a student edit the build mid-fight,
so rebuilding from the build can add or remove a card, which `sync()` can neither create
nor destroy.

**The reset confirmation is deliberately not reused**, and the sentence is beside the op:
D-17's test is *does undo stop being able to recover this while the student is still
working?* — a fight reset leaves the build intact and the board one Ctrl+Z away, so it
does not meet the test.

## The DELIBERATELY ABSENT block, rewritten

`grep -c "Phase 5, plan 05-01" cats-vs-mechs.html` → **0**. The note is rewritten, not
annotated, and the old text is paraphrased rather than quoted so the grep is honest.

The block is now four numbered **kinds** of absence:

1. **Rewritten.** What now exists (the lifecycle, the record's home, and round advance in
   05-04 as **one op** named `advanceRound`), and what still does not: **no writer decides
   anything.** `REFERENCE.beats` has no consumer in `[S05]` and must gain none; `keywords`
   has no writer at all; nothing decides a fight is over.
2. **Unchanged** — `loadBuildCodeAtBoot` has no arm and must never be given one.
3. **Unchanged** — `openTokenPicker` is page work with a home in `[S07]`.
4. **Unchanged** — there is no writer for an action's `dmg` or `keywords`, because neither
   field is student-writable.

## Probes: run after their task's commit, recorded verbatim, reverted from a file snapshot

`git checkout -- cats-vs-mechs.html` was never used. Every revert was `cp` from a
scratchpad snapshot.

### PROBE E — the declaration array named `pending` instead of `decl`

**STAYED GREEN.** `1051 passed, 0 failed`, `interaction gate: 147 of 147`, exit 0. Check
73c passed with its full label printed.

The plan warned about exactly this: *"If it stays green, the walk is not reaching the
fight slice — record that, because the whole key naming in this phase rests on it."*

### PROBE E2 — the positive control (added, because E's green needed a diagnosis)

A green probe has two explanations: the walk never reaches the fight, or the walk is
broken outright. `pendingProbe: 1` added to every unit in `makeUnits`:

```
FAIL  interaction gate :: 73c. the three slices hold exactly their pinned key sets ...
      slices="build,fight,ui" build="schema,cats,mechs,tokens" cats="id,name,ap,units,actions"
      mechs="id,name,ap,units,actions" | proposal-shaped keys found:
      state.build.cats.units.0.pendingProbe, ... state.build.mechs.units.2.pendingProbe
```

Twelve hits, named by path. **The walk works at any depth over the build slice.** The
diagnosis is therefore precise: at the moment check 73c reads state, `state.fight` is
`null`, so the fight slice has never been inside its reach. `[S09.10]`'s second boundary
row reads the same null fight and is green for the same reason.

### PROBE F — a function on the fight slice

First run: **`1051 passed, 0 failed`, gate 147 of 147.** Green.

Two rows should have caught it and neither did:

- **`integers only`** reads a state whose `fight` is `null` — same root cause as probe E.
- **`json clonable`** could never have caught it at all. It read
  `t.eq('json clonable', JSON.stringify(JSON.parse(live)), live)` where
  `live = JSON.stringify(App.state.get())` — a JSON string compared against a
  re-serialisation of itself, which is **true for every input**. `JSON.stringify` drops a
  function-valued key, so the value the row guards against never reaches either side.

Both fixed (see Deviations). Re-run:

```
FAIL  state contract :: integers only WITH A FIGHT RUNNING — ...
      actual:   false
      expected: true
FAIL  state contract :: json clonable WITH A FIGHT RUNNING, for the same reason
      actual:   ["state.fight.probeFn [function]"]
      expected: []
1051 passed, 2 failed
```

An intermediate spelling — deep-equality against the round trip through the harness's
`stable()` — **did** redden, but printed **two identical strings** as actual and expected,
because the report serialises a failed row with JSON too. That reading is why the shipped
row names the path instead.

### PROBE G — `resetFight` as `endFight(); startFight();`

Run first as a direct drive, and it broke **two** properties rather than one:

```
threw with no fight: false | undo depth 0 -> 2
Error: A fight is already in progress — end it before starting a new one
    at Object.startFight (cats-vs-mechs.html:3566:5)
```

The refusal disappears entirely — a `resetFight()` with no fight running silently starts
one and costs **two** undo entries — and the next legitimate `startFight()` then throws.

Re-run against `[S09.12]` once it shipped: **five rows red**, headed by the one the plan
named:

```
FAIL  the fight loop :: AND IT COSTS EXACTLY ONE UNDO ENTRY, therefore one Ctrl+Z ...
      actual:   2
      expected: 1
FAIL  the fight loop :: and one undo puts the mid-fight board back BYTE FOR BYTE
      actual:   ... "fight":null ...
      expected: ... "fight":{"round":1,...,"c1","hp":0,...,"alive":false} ...
FAIL  the fight loop :: resetFight with no fight in progress throws BY NAME and leaves no
      phantom undo entry ...
      actual:   [false,"",1]
      expected: [true,"No fight in progress",0]
FAIL  the fight loop :: endFight with no fight in progress does NOT throw ...
FAIL  the fight loop :: and every writer that needs a fight refuses when there is none ...
      actual:   ["resetFight DID NOT THROW"]
      expected: []
1088 passed, 5 failed
```

### PROBE H, first half — `sideFromBuild` skips the tally bag

First run: the D-24 rows **did** redden, but by **throwing**:

```
FAIL  the fight loop :: suite threw
      actual:   TypeError: Cannot read properties of undefined (reading 't1')
      expected: no exception
1064 passed, 1 failed
FAIL  interaction gate :: 82. A LINK CARRYING BOTH DOES BOTH ...
```

**That is a real defect the probe found** — a throwing row killed the whole suite, took 29
of its own rows with it, left the board dirty and reddened an unrelated interaction check.
Fixed with `tallyOf()` (Deviations, item 5). Re-run:

```
FAIL  the fight loop :: A TYPE A STUDENT INVENTED IS IN THE FIGHT ON THE SAME TERMS ...
      actual:   [0,0]
      expected: [4,7]
FAIL  the fight loop :: and it crosses at BOTH scopes ...
      actual:   ["alive,hp,id,shield","ap,units"]
      expected: ["alive,hp,id,shield,tally","ap,tally,units"]
FAIL  the fight loop :: THE FIGHT CARRIES ITS OWN COPY ...
      actual:   [9,0,1,0]
      expected: [9,4,1,7]
1090 passed, 3 failed
interaction gate: 147 of 147 checks passed
```

Three named failures, readable values, the suite runs to completion and the gate is
untouched.

### PROBE H, second half — `encode` reads `App.state.get()` instead of its argument

```
FAIL  the fight loop :: A BUILD CODE IS BYTE-IDENTICAL ACROSS FOUR FIGHT STATES ...
      actual:   ["v1~...~1~0yzx","v1~...~1~0yzx","v1~...~2~25x0"]
      expected: ["v1~...~7tvo","v1~...~7tvo","v1~...~7tvo"]
FAIL  the fight loop :: and the reading is not vacuous ...
      actual:   false
      expected: true
1091 passed, 2 failed
```

The fight-running codes carry the round number and a different digest. The row reddens and
**names the divergence**, and its non-vacuity companion reddens with it.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — bug] Every state-shape row in the repo reads a `null` fight slice**

- **Found during:** probes E and F, after Task 1 was committed
- **Issue:** `[S09.3]`'s `integers only` and `json clonable` rows, check 73c's key-name
  walk and `[S09.10]`'s second boundary row all read a state whose `fight` is `null`. The
  shape rule `[S03]`'s banner states had **never once** been applied to the slice this
  phase writes into. Task 1's acceptance criterion asserted 73c's walk *"must report zero
  over a state with a fight running"* — a claim whose premise was false.
- **Fix:** both `[S09.3]` shape rows re-read after `startFight()`, labelled with why.
  Check 73c is **not** amended — the plan forbids it and the reason holds: its job is to
  keep the proposal off the slices and reaching further costs that guarantee. The reach is
  added inside `[S09.12]` instead, over a fight with a declaration and a resolved round in
  it.
- **Files modified:** `cats-vs-mechs.html`
- **Commits:** `4d667f4`, `ae78fa7`

**2. [Rule 1 — bug] The `json clonable` row was a tautology**

- **Found during:** probe F
- **Issue:** `JSON.stringify(JSON.parse(live)) === live` is true for every input.
- **Fix:** `jsonDrops()` — a walk naming the path of any value a round trip would drop or
  mangle (function, undefined, symbol, non-finite number). It reports the path rather than
  a boolean because the report serialises a failed row with JSON too, and a deep-equality
  spelling printed two identical strings.
- **Commit:** `4d667f4`

**3. [Rule 2 — missing critical functionality] The tally crosses at BOTH scopes, not the side only**

- **Found during:** Task 1
- **Issue:** the plan's shape block put `tally` on the fight SIDE only, and `[S09.12]`'s
  row list said each unit carries *"id, hp, shield, alive and nothing else"*. `TOKEN_SCOPES`
  has two entries and a **unit-scoped** student-made type keeps its tally on the unit
  record. Copying only the side bag leaves a unit-scoped type with nowhere in the fight
  slice to live — which is the same second tier D-24 forbids, one level down, and it would
  leave plan 05-04's spender with nothing to spend.
- **Fix:** `sideFromBuild` **mirrors the build** — present where `build` has one, absent
  where it does not, at both levels. One rule instead of a special case, and it is the rule
  the build slice already keeps (D-04: a bag with no keys deletes itself). `readTally`
  already answers 0 for an absent bag, so no reader has to know which shape it got.
  `[S03]`'s shape block is written as `{ ap, units: [ { id, hp, shield, alive, tally? } ], tally? }`
  and `[S09.12]` asserts all three states: crossed at both scopes, absent where nothing was
  written down, and the fight's copy not moving when the build's does.
- **Commit:** `0514bd7`

**4. [Rule 1 — bug] Two comments named a plan number that had moved**

- **Found during:** Task 1
- **Issue:** `setUnitShield` and `setUnitHp` both deferred to *"Phase 5, plan 05-01"*, and
  `DEFAULTS`' header named *"plan 05-03"* as the retune. Phase 5's numbering has since
  moved.
- **Fix:** the shield writer is **plan 05-05**; the retune is **plan 05-11**, with D-25's
  "no plan before it touches `DEFAULTS.cats.ap`" written beside it.
- **Commit:** `0514bd7`

**5. [Rule 1 — bug] A `[S09.12]` row could abort the whole suite**

- **Found during:** probe H, first half
- **Issue:** three rows read `owner.tally[id]` directly. With the bag taken away that
  throws a `TypeError`, and a throwing row kills the suite: 29 of its own rows never ran,
  the board was left dirty and interaction check 82 went red behind it. The reported
  failure was a stack trace rather than the two numbers a reader needs.
- **Fix:** `tallyOf()`, borrowing `readTally`'s `hasOwnProperty` discipline. A row must be
  able to say "0, expected 4"; it must not be able to abort the run.
- **Commit:** `21d9d93`

**6. [Rule 1 — bug] An undo-depth assertion was pinning the clock**

- **Found during:** Task 3's first run
- **Issue:** the row for `endFight` with no fight running asserted one undo entry and
  measured **zero** — the `endFight` two rows above carries the same commit label and fell
  inside the 500 ms coalescing window.
- **Fix:** the deterministic facts are asserted (no throw, fight stays `null`, board
  byte-identical), the cost is **bounded** at 0..1 with the reason written into the label,
  and the run's actual figure is recorded through `t.info`.
- **Commit:** `ae78fa7`

### Corrections to the plan's own interface notes

- The plan's interfaces block states *"startFight and endFight have arms, setAlive and
  setUnitHp DO NOT."* **They do** — under the act names `hp` and `alive`, at `:6543-6544`.
  No comment was written claiming otherwise; the dispatch comment records the real
  situation and names plan 05-05 as the plan that gets to decide whether that spelling
  stands.
- The plan's `section_ownership` names `[S00]`'s table of contents. **No TOC change was
  needed**: the TOC lists `[S04]`, `[S06]` and `[S07]` sub-regions and deliberately does
  not list `[S09]`'s — `[S09]`'s own banner says it is the only index of them and explains
  why. `[S09.12]` is registered there.
- Task 2's probe G could not run against a suite row at the time the plan places it,
  because the row it names is Task 3's. It was run twice: as a direct drive after Task 2's
  commit, and against the shipped rows after Task 3's.

### Declined by design

- **Check 73c was not widened.** The plan says do not amend it and Task 1's acceptance
  requires it unmodified. Confirmed by diff: the only change to `tests/selftest-node.cjs`
  in this plan is `SUITE_FLOOR` and its history paragraph.
- **`DEFAULTS.cats.ap` was not touched** (D-25). Only the comment above `DEFAULTS` moved,
  and only to correct a plan number.
- **The static shell's two "Phase 5's turn state and start-fight" lines were left alone.**
  They describe the topbar reservation, not the retired `fight.turn` key, and the shell is
  outside this plan's ownership. Plan 05-06 owns them.
- **`[S09.0]`'s `{ fight: { turn: 'cats', round: 1 } }` literal was left alone.** It is
  sample data for a key-order comparison in the harness's own suite, not a claim about the
  slice.

## Requirements

**None marked complete, and that is deliberate.** The plan names FIGHT-01, FIGHT-14 and
SHARE-07, and all three need something a person can reach:

- **FIGHT-01** — `startFight` has an op and a router arm, and **no control on the page**.
  The topbar's reservation still names start-fight as unspent. Plan 05-06.
- **SHARE-07** — structurally satisfied and asserted at the state level; `resetFight` has
  no control either. Plan 05-06.
- **FIGHT-14** — needs a rendered history. `past` is its home and nothing writes it yet.
  Plans 05-04 and 05-08.

Marking any of them here would be the same defect the whole plan is about.

## Verification

- `node tests/selftest-node.cjs` exits **0**: **1093 passed, 0 failed**, interaction gate
  **147 of 147**, 96 shell ids, `#app` 127 (floor 117), `#app` with a fight 101
  (`FIGHT_FLOOR` 41), dialogs 145 across 4 roots (floor 138), proposal 60 (floor 23).
- `grep -ci "counter\|rating\|balanced\|difficulty" cats-vs-mechs.html` → **0**
- `grep -c "verdict\|balanced\|rating\|difficulty" cats-vs-mechs.html` → **0**
- `grep -c "Phase 5, plan 05-01" cats-vs-mechs.html` → **0**
- Every row of `[S09.12]` runs in the terminal harness: **40 of 40**, zero skipped.
- Probes E, E2, F, G and H each run, recorded above, and reverted from a scratchpad
  snapshot.

## Known Stubs

None. This plan renders nothing and ships no page surface. `decl` and `past` open empty and
stay empty by design — plan 05-04's `advanceRound` is their only writer, and `[S03]`'s
banner, `startFight`'s comment and `[S09.12]`'s key-name group all say so by name.

## Threat Flags

None. No file changed in this plan introduces a network endpoint, an auth path, a file
access pattern or a schema change at a trust boundary. The three mitigations the plan's
threat register assigns are all in place and asserted:

| Threat | Mitigation, asserted |
|---|---|
| T-05-05 prototype pollution | 28 hostile drives across seven side values, two writers and both router arms; `protoIntact()` checked inside the walk |
| T-05-06 the fight slice reaching a build code | `encode` byte-identical across four fight states, with a non-vacuity companion row |
| T-05-07 a banner describing a slice the file lacks | `[S03]` rewritten in the same change; `turn`/`log` absence asserted by name |
| T-05-08 `resetFight` costing two undo entries | one `commitStructural`; delta asserted at exactly 1; probe G drives the naive spelling and reddens five rows |

## For the plans that follow

- **05-04:** `advanceRound` is the **one** applier and `[S05]`'s absence block now says so.
  `past` is capped at `App.data.MAX_PAST_ROUNDS` (30) — read the constant, do not re-type
  the number. Your commit label **must carry the round number**: `COALESCE_MS` is 500 and
  two same-label commits inside it are one Ctrl+Z. `[S09.12]` already places a
  representative declaration and a representative round record through `App.state.commit`
  and asserts their key names are clean — when your op ships, those two commits should
  become drives of the op.
- **05-05:** `setFightShield` is named in `setUnitShield`'s comment as yours, and the
  `[S09.3]` shield tripwire at the fight-slice copy is yours to turn. The `hp` and `alive`
  router arms are yours to keep or rename.
- **05-06:** the topbar's reservation is exactly two controls and it still names start-fight.
  `resetFight` and `endFight` both have arms and no control. `endFight` with no fight
  running is idempotent and its undo cost is timing-dependent — `[S09.12]` bounds it rather
  than pinning it, and names you as the plan that decides whether a press with nothing to
  end should cost a step.
- **05-07 through 05-10:** `[S09.12]`'s opening comment bars every surface assertion in
  this phase from that suite by name. Yours go in `tests/selftest-node.cjs`'s interaction
  gate. You are also the named owners of `FIGHT_FLOOR`, which is still 41.
- **05-11:** four items. (1) Retiring `turn` and (2) folding `log` into `past` are both
  judgement calls the developer has not seen, and both are cheap to reverse in one
  direction only. (3) D-24's tally copy is a CONTEXT assumption taken while the developer
  was away — and this plan widened it to both scopes on its own reasoning. (4) The retune
  is yours; `DEFAULTS`' header now says so.
- **Everyone:** two shipped walks in this repo claim to cover "the whole state at any
  depth" and both read a state whose fight is `null`. `[S09.12]` is the only place that
  claim is true today. If you add a slice, add the reading too — and probe it, because both
  of those walks were green for months.

## Self-Check: PASSED
