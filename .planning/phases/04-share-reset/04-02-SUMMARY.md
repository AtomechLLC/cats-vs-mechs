---
phase: 04-share-reset
plan: 02
subsystem: serialization
tags: [codec, encode, decode, name-table, run-length, round-trip, selftest, single-file-html]

# Dependency graph
requires:
  - phase: 04-share-reset
    plan: 01
    provides: "[S01] wire constants (CODE_VERSION, CODE_SEP, CODE_ALPHABET, CODE_TARGET, CODE_WARN, CODE_LIMIT), [S04.1] primitives, [S09.11] opened above the no-DOM bracket"
  - phase: 02.1-token-authoring
    provides: SHAPES / COLORS / TOKEN_IDS / TOKEN_SCOPES / GLYPHS, MAX_TOKEN_NAME, TOKEN_NAME_REFUSE, MAX_CUSTOM_TYPES
  - phase: 03.1-action-authoring
    provides: ACTION_IDS / XF_WHO, MAX_CUSTOM_ACTIONS / MAX_ACTION_REQ / MAX_ACTION_XF, MIN/MAX_XF_DELTA
provides:
  - "[S04.2] encode(build) -> string | null — versioned, name-tabled, split-stream, checksummed, differences-only"
  - "[S04.3] decode(code) -> { ok: true, build } | { ok: false, why, saw?, what? } — pure, non-throwing, state-free"
  - "the wire's positional vocabulary (side order, side marks, unit prefixes and labels) shared by both directions"
  - "App.serialize.WIRE_BOUNDS — the three [S05] bounds the decoder re-types, exported so the suite can hold them against the live constants"
  - "[S09.11] 152 rows, zero skipped: six driven boards round-tripped, alphabet-checked and measured, plus three size gates and the derived-order rows"
affects: [04-03 the refusal matrix, 04-04 hash mirror, 04-05 boot read, 04-06 share dialog]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "a refusal flag inside one function rather than a null threaded through forty return values; the single check before assembly turns the whole call into null"
    - "a decoded build is rebuilt field by field, key by key, all the way down — never by a merge helper, and never with an id derived from anything name-shaped"
    - "a bound re-typed across a dependency arrow is held to the original by a suite row rather than by a comment"
    - "a board under test is DRIVEN through the shipped ops; a state literal agrees only with its author"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "encode refuses rather than repairs, and refuses on any field it does not encode but cannot reconstruct — a side name, a unit label — so the day a rename-unit or rename-faction op ships, the codec says so out loud instead of handing back a board that quietly changed"
  - "the three [S05] bounds MIN_UNITS, MAX_UNITS and MAX_ACTION_COST are re-typed in [S04.3] rather than reached upward for, and exported as WIRE_BOUNDS so three suite rows hold them against App.ops"
  - "the round trip is asserted over a STABLE writing of the record (keys sorted at every depth) because a tally bag's key order is the order a student set them in and carries no meaning; a separate row records that key order survived anyway on all six boards"
  - "boards H and I carry no size gate by design — they exceed the message limit by construction and are recorded with t.info instead"
  - "the derived ordinal order needed three rows of its own: no round trip over a DRIVEN board can see the difference, because a driven vocabulary always enumerates in the order it was written"

patterns-established:
  - "the six-board fixture: A shipped / B realistic / D wide / E fully authored / H ASCII ceiling / I astral ceiling, every one driven through App.ops"
  - "three rows per board — the trip is exact, the code matches the allowlist, the length is recorded — and the size gates carry their measured margin in the label"

requirements-completed: [SHARE-02, SHARE-03, SHARE-04, SHARE-08]

# Metrics
duration: 70min
completed: 2026-08-29
---

# Phase 4 Plan 02: The Grammar, Both Directions — Summary

**A versioned, name-tabled, split-stream build code that goes out and comes back byte-identical on six boards nobody hand-wrote, with the shipped board at 45 characters and a fully authored 24-versus-24 at 675.**

## Performance

- **Duration:** ~70 min
- **Tasks:** 3 planned, 4 commits (one extra, probe-driven — see Deviations)
- **Files modified:** 2

## Accomplishments

- `[S04.2]` writes a build slice handed to it as an argument, reaches no state, and emits **nothing at all** for a token type or an action a student left alone. A name table, two independently run-length-written unit streams, biased transformation amounts and one separator character per nesting level.
- `[S04.3]` reads shape, then version **by name**, then checksum, then content — and returns a record rather than a sentence or an exception. It rebuilds the build field by field, key by key, all the way down, re-runs every write-path bound plus the name boundary in code points, and rebuilds every id from an encoded sequence number.
- `[S09.11]` grew from 109 rows to **152**, all of them still above every no-DOM bracket, and now drives the live board and hands it back as its last act.
- The two schema decisions research measured were preserved intact and are load-bearing rather than decorative: the ceiling board with distinct emoji names measures **3,186** and not 4,729.

## Task Commits

1. **Task 1: `[S04.2]` encode** — `a12473b` (feat)
2. **Task 2: `[S04.3]` decode** — `eda28a0` (feat)
3. **Task 3: the round trip over six driven boards** — `78d4fce` (test)
4. **Task 3 continued: the rows probe G forced** — `1db2eb1` (test)

## The Six Measured Lengths, Beside Research's

| Board | What it exercises | Research | Measured | Moved |
|---|---|---|---|---|
| **A** | the shipped board, untouched | 45 | **45** | 0.0% |
| **B** | a realistic 12v5 student build | 295 | **297** | **+0.7%** |
| **D** | 24v24, distinct health and shield on every unit | 283 | **283** | 0.0% |
| **E** | 24v24 fully authored, ordinary short names | 675 | **675** | 0.0% |
| **H** | the ceiling, distinct 24-character ASCII names | 2,984 | **2,984** | 0.0% |
| **I** | the ceiling, distinct 23-astral-emoji names | 3,186 | **3,186** | 0.0% |

**Nothing moved more than 15%, and only one figure moved at all.** Board B is two characters longer than research's reference codec, and the two characters are accounted for exactly: plan 04-01's `runs` writes the count marker whenever a payload is EMPTY as well as whenever a run is longer than one, so board B's single empty tally bag spells `1*` where the reference spelled nothing. That was a deliberate 04-01 decision with a row on it — an empty list and a list holding one empty payload are otherwise indistinguishable to the reader — and this is the price, paid once per isolated empty bag. Boards A, D, E, H and I are unaffected because every empty run on them is already longer than one.

Board B verbatim, 297 characters:

```
v1~NVmlnb3Vy.RGFtYWdl.UG9pc29uIOKYoA.TW9tZW50dW0.UG91bmNl.TGljayB3b3VuZHM.QmVhbQ.T3ZlcmNsb2Nr~V0.0.0.0.0_3.3.3.8.1_C1.4.4.f.0.2_C2.5.1.7.1.3~Ac~5~6!2-6!0-a*3!0~5!2-1*-5!1-9*~2!4~6!4~C1.4.1!2.0!2.1!0!2n-0!5!2s_C2.5.1!1..0!0!2t~B5~4~8!4-4*6!3~5!3-4*~~~4.6.1!1..1!0!2o_C1.7.1!1.2!1.0!2!2p-1!0!2m~xfbv
```

The only difference from research's string is `5!2-1*-5!1-9*` where research had `5!2--5!1-9*`, and the checksum that follows from it.

## Measurements Recorded

| Reading | Value |
|---|---|
| Suite total before | 898 passed / 0 failed |
| Suite total after | **941 passed / 0 failed** (delta **+43**) |
| `[S09.11]` rows, terminal harness | **152**, zero skipped |
| `SUITE_FLOOR` | **868 → 911** (margin 30, the same margin the two plans before it kept) |
| Interaction gate | 117 of 117 — unchanged |
| Stub-drift shell ids | 73 — unchanged |
| Layer C `#app` | 127 — unchanged |
| Layer C dialogs | 144 across 2 roots (floor 134) — unchanged |
| Layer C proposal pane | 60 (floor 23) — unchanged |
| `grep -ci "counter\|rating\|balanced\|difficulty"` | **0** |
| `grep -c "verdict\|balanced\|rating\|difficulty"` | **0** |
| `grep -c "eval(\|new Function\|innerHTML\|insertAdjacentHTML\|document.write\|DOMParser"` | **0** |
| `grep -c "Object.keys(build.tokens)\|Object.keys(b.tokens)"` | **0** |

All four page-side numbers are unchanged, as the plan required: this plan renders nothing.

## The `App.state` / `App.ops` Reading

Reading the whole `[S04]` region: **zero call sites** for either. There is exactly **one textual occurrence**, and it is a comment inside `[S04.3]`'s `WIRE_BOUNDS` block explaining why the upward call is not made — which is what the plan's own action text asked for ("say in the comment why the duplication is deliberate rather than an oversight, so the next reader does not 'fix' it into an upward call that reorders the file"). Recorded here because a later strict grep would read that one line and should find this paragraph first.

## Deliberate-Failure Probes

All four were run against the final committed state, their readings recorded, and every one reverted **from a file snapshot** rather than by `git checkout`. Working tree verified clean after each.

### PROBE D — a token type's record emitted even when it is identical to the shipped one

The early return in the built-in vocabulary loop was disabled. Run: **939 passed, 2 failed.**

```
FAIL  build code :: the shipped board fits in 60 characters, and it measures 45 — a
margin of 15, and it is that short only because a type or an action still identical to
the one the file ships writes nothing at all
      actual:   false
      expected: true
---
FAIL  build code :: a board identical to the shipped one except for ONE renamed type
costs only a little more than the untouched board — the other four types and all six
actions write nothing, so the whole difference is one vocabulary record and one name
      actual:   false
      expected: true
```

Both rows the plan named reddened. The second is worth reading twice: with every built-in emitted, a renamed type no longer costs *more* than an untouched board, because the untouched board is already paying for all five — which is the differences-only rule failing in exactly the direction that makes it invisible to a round trip.

### PROBE E — grammar bug 1 re-introduced

An action record's fields joined with the same character its term lists use for their items. Run: **935 passed, 6 failed.**

```
FAIL  build code :: BOARD B round trips EXACTLY — a board a student could actually build …
      actual:   content
FAIL  build code :: BOARD E round trips EXACTLY — 24 versus 24 with all six types …
FAIL  build code :: BOARD H round trips EXACTLY — the ceiling …
FAIL  build code :: BOARD I round trips EXACTLY — the same ceiling with every one of
those names written in astral emoji …
FAIL  build code :: and the key ORDER survives all six trips as well, not only the values …
FAIL  build code :: and that reordered board still round trips exactly …
```

Every board that carries an authored action reddens. The decoder's reading, captured directly against a minimal board with one authored action:

```
code:   v1~NUG91bmNl~V~A9~3~9*3!0~9*~~~C1-0-1!2--~B3~3~3*6!3~3*~~~~rykv
decode: {"ok":false,"why":"content","what":"an action is the wrong shape"}
```

**This is the improvement over research's version of the bug.** Research's spelling decoded to a *wrong valid build*; this one is refused by name, because `[S04.3]` counts the fields of an action record before reading any of them.

### PROBE F — grammar bug 2 re-introduced

The tally bag's items joined with the character the run-length stream uses between runs. Run: **937 passed, 4 failed.**

```
FAIL  build code :: BOARD E round trips EXACTLY — 24 versus 24 with all six types of the
student's own, a tally for every type on every unit, and six actions of their own …
FAIL  build code :: BOARD H round trips EXACTLY — the ceiling …
FAIL  build code :: BOARD I round trips EXACTLY — the same ceiling …
FAIL  build code :: and the key ORDER survives all six trips as well, not only the values …
```

The three boards that redden are exactly the three carrying a bag with **more than one** item, which is what the plan required ("it must be a board that actually carries tallies"). Board A carries none and board B's bags all hold a single entry, so neither can see it — a fact worth recording, because it says the multi-tally boards are load-bearing rather than merely larger. The decoder's reading, captured against a minimal two-tally board:

```
code:   v1~NUG9pc29u.UnVzdA~VC1.4.4.3.0.0_C2.5.1.4.0.1~A9~3~9*3!0~5!2-6!3-8*~~~~B3~3~3*6!3~3*~~~~jjuf
decode: {"ok":false,"why":"content","what":"a run length disagrees with the roster"}
```

### PROBE G — the ordinal order taken from object enumeration

**This probe found a real hole, and the rows were added rather than the expectation changed.**

Run against the suite as Task 3 first wrote it: **938 passed, 0 failed. Zero rows reddened.**

The reason, and it is the same class of finding as plan 04-01's probe B: **every board in the suite is DRIVEN, and a driven vocabulary always enumerates in the order it was written.** The built-ins come out in the order `[S01]` declares them, and the customs in the order they were made — which is also their numeric order, because `nextTokenTypeId` always takes the largest suffix and adds one. So the derived order and the enumerated order agree on every board a student can produce by pressing buttons, and no round trip can tell them apart. A round trip proves the two halves agree; it cannot prove either is right, and it cannot prove a property both halves happen to satisfy for a reason unrelated to the code.

**What was missing:** any row that hands `encode` a build slice whose vocabulary is written down in an order the ops would never produce. That is not a hypothetical from this phase onward — `encode` takes the build as an ARGUMENT, and `[S01]`'s token-id comment names the hazard exactly (an integer-like key sorts first in an object and in numeric order, which is the whole reason the ids carry a leading letter).

Three rows were added: the board carries more than one type of the student's own; the same board with its vocabulary written down in reverse produces the **identical code, character for character**; and that reordered slice still round trips exactly. Re-run with the probe re-applied: **939 passed, 2 failed.**

```
FAIL  build code :: the SAME board with its vocabulary written down in a different order
produces the IDENTICAL code, character for character — the ordinals come from the five
built-ins followed by the student's own types in numeric order, and never from whatever
order the vocabulary happens to be held in
      actual:   null
      expected: v1~NVmlnb3Vy.RGFtYWdl.UG9pc29uIOKYoA.TW9tZW50dW0.UG91bmNl.TGljayB3b3Vu…
---
FAIL  build code :: and that reordered board still round trips exactly, so the code the
row above demands is also a code that means the right thing
      actual:   refused
      expected: {"cats":{"actions":[{"cost":[{"n":1,"tok":"ap"}],"dmg":1,"id":"slash",…
```

The second of the two is the round-trip row over a board with custom types that the plan's acceptance criterion asked for.

## Deviations from Plan

### 1. [Rule 2 — missing critical functionality] The three rows probe G forced

**Found during:** Task 3, probe G.
**Issue:** The round-trip rows as first written could not fail over an encoder that trusted object enumeration, for the reason recorded above. The plan anticipated this case ("If every row stays green, the suite is asserting nothing … add the row that would have caught it and record what was missing").
**Fix:** Three rows added asserting that a build slice whose vocabulary is written down in another order produces the identical code and still round trips. `SUITE_FLOOR` re-measured 908 → 911.
**Commit:** `1db2eb1`.

### 2. [Rule 2 — silent data loss turned into a refusal] Guards on the fields that are NOT encoded

**Found during:** Task 1.
**Issue:** `build[side].id`, `build[side].name`, `build[side].units[].name` and `build.schema` are deliberately not encoded and are restored from `DEFAULTS`. The reference codec restores them unconditionally. That means the day a rename-faction or rename-unit op ships, every shared board silently loses the name — the same failure mode `[S04]`'s banner already documents at length for `dmg` and `keywords`.
**Fix:** `encode` refuses a build whose side id, side name, unit label or record schema does not match what it would reconstruct. The refusal costs four lines and converts a future silent loss into a value that cannot be written at all. `dmg` and `keywords` were deliberately left alone — plan 04-03 owns that tripwire, per this plan's key context.
**Files:** `cats-vs-mechs.html` `[S04.2]`.
**Commit:** `a12473b`.

### 3. [Rule 2 — a re-typed bound needs a keeper] `WIRE_BOUNDS` exported

**Found during:** Task 2.
**Issue:** The plan requires `[S04.3]` to re-run `MIN_UNITS`, `MAX_UNITS` and `MAX_ACTION_COST` while forbidding it to reach `App.ops`. Those three live in `[S05]`, not `[S01]`, and this plan's section ownership forbids touching `[S01]`. So they had to be re-typed — and a re-typed number with nothing holding it to the original is drift with a countdown on it.
**Fix:** The three are a frozen `WIRE_BOUNDS` record, exported, with three `[S09.11]` rows asserting each against the constant `App.ops` actually runs. The comment says why the duplication is deliberate and must not be "fixed" into an upward call.
**Commit:** `eda28a0`.

### 4. [Rule 1 — the decoder refuses where the reference admitted] Extra content guards

**Found during:** Task 2, cross-checking against `cm5.cjs`.
**Issue:** The reference decoder admits several codes the shipped one refuses: two vocabulary records naming the same built-in type (the second silently overwrote the first), two action records naming the same shipped action, an action of the student's own carrying no name, a vocabulary or action record with the wrong number of fields, a gap index outside the roster or repeated, and more authored actions than `MAX_CUSTOM_ACTIONS` allows.
**Fix:** A guard per assumption, each on its own line. The field-count guards are what turn probe E's grammar bug from a wrong valid build into a named refusal.
**Commit:** `eda28a0`.

### 5. [scope] Extra rows beyond the plan's list

The suite also gained the five non-throwing refusal rows, the version-by-name row, the `WIRE_BOUNDS` agreement rows and the key-order row. All four groups are measurements this plan already owned; none of them replaces a row the plan asked for.

## Known Stubs

None. `App.serialize.scheduleUrlSync` remains the declared no-op plan 04-04 owns, which is this plan's explicit instruction and is named as such in `[S04]`'s banner, in `[S04.4]`'s own comment and in a `[S09.11]` row.

`decode` reserves nothing behind the version comparison, which is deliberate: the plan asked for the dispatch to be reserved and nothing shipped behind it, and a comparison against `CODE_VERSION` by name is exactly that — a later `v2` is a one-arm addition.

## Threat Flags

None. No new network endpoint, auth path, file access pattern or schema change at a trust boundary.

The plan's five threat-register rows are all mitigated and all provable:

| Threat | Mitigation | Proved by |
|---|---|---|
| T-04-05 separator inside what it delimits | one character per nesting level from `CODE_SEP` | probes E and F, both reddening round-trip rows |
| T-04-06 a decoded name reaching a key position | ids rebuilt from the encoded sequence number; every term carries `tok` as a field; the prototype checked after every group | the `protoIntact` rows, which run after the round trips |
| T-04-07 a decoded value outside every bound | `decode` re-runs all of them plus the name boundary in code points | the `WIRE_BOUNDS` agreement rows here; the full refusal matrix is plan 04-03's |
| T-04-08 `decode` throwing on hostile input | pure, returns a refusal record | the five non-throwing rows, which assert the absence of an exception as well as the refusal |
| T-04-09 a build code carrying a comma | the alphabet allowlist asserted over all six produced codes | six alphabet rows |

## For the Next Plan (04-03, the refusal matrix)

- Every content guard hands back a `what` string; the seventeen the research matrix names are all present. Tamper the body and **recompute the checksum**, or every row stops at the digest.
- `decode` returns `why: 'content'` with `what` carrying the first guard that refused, never the last. Order matters when writing expectations.
- `App.serialize.WIRE_BOUNDS` is where the roster and cost bounds live for the decoder. Assert against it, not against a re-typed 24.
- The `dmg` / `keywords` reconstruction tripwire is still unbuilt and is yours. `[S04]`'s banner states the decision it protects; `[S04.3]` rebuilds an authored action at `dmg: 0, keywords: []` and a shipped one from `DEFAULTS`.
- Board B's code is 297 characters and not research's 295. If a plan asserts a literal build code anywhere, use the measured figure and read the paragraph above first.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND
- `tests/selftest-node.cjs` — FOUND
- `.planning/phases/04-share-reset/04-02-SUMMARY.md` — FOUND
- commit `a12473b` — FOUND
- commit `eda28a0` — FOUND
- commit `78d4fce` — FOUND
- commit `1db2eb1` — FOUND
- `node tests/selftest-node.cjs` exits 0 at 941 passed / 0 failed — VERIFIED
- interaction gate 117 of 117, stub-drift 73, `#app` 127, dialogs 144 — VERIFIED unchanged
- working tree clean after every probe revert — VERIFIED
