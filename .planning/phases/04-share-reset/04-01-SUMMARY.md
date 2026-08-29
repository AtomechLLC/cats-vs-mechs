---
phase: 04-share-reset
plan: 01
subsystem: serialization
tags: [codec, base64url, utf-8, run-length, fnv-1a, selftest, single-file-html]

# Dependency graph
requires:
  - phase: 02.1-token-authoring
    provides: SHAPES / COLORS / TOKEN_IDS / TOKEN_SCOPES / GLYPHS allowlists, MAX_TOKEN_NAME, TOKEN_NAME_REFUSE
  - phase: 03.1-action-authoring
    provides: ACTION_IDS / XF_WHO allowlists, MAX_CUSTOM_ACTIONS / MAX_ACTION_REQ / MAX_ACTION_XF, the [S09.10] suite shape
provides:
  - "[S01] seven exported wire constants — CODE_VERSION, CODE_SEP, CODE_ALPHABET, CODE_HASH_KEY, CODE_TARGET, CODE_WARN, CODE_LIMIT"
  - "[S04] opened as a real IIFE section with a banner that states what it does not encode and why the checksum is not a boundary"
  - "[S04.1] hand-rolled UTF-8 both directions, base64url, base36, run-length and FNV-1a — no host global anywhere"
  - "[S09.11] a 109-row build-code suite, every row of which runs in the terminal harness"
  - "the index-stability promise on all seven positionally-encoded allowlists, plus a tripwire row per list"
affects: [04-02 encode, 04-03 decode, 04-04 hash mirror, 04-05 boot read, 04-06 share dialog]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "primitives return null rather than throwing; the caller owns every word a student reads"
    - "one separator character per nesting level, named in a frozen record and asserted mechanically"
    - "a codec suite sits entirely above the no-DOM bracket, so every row of it can fail a build"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "CODE_ALPHABET is an allowlist regular expression, never a blocklist — a blocklist reads green about every character nobody thought of"
  - "the comma is excluded by construction because App.hasFlag splits location.hash on it; this is the binding alphabet constraint of the phase and appears in no other project document"
  - "no MAX_* cap moves for build-code budget reasons: the measured cost centres are the tally stream and the name lengths, not the dials"
  - "the deflate-raw compression stream stays ruled out on an asynchrony argument, not a size one — an await between the click and the clipboard write forfeits the Chrome-107 user gesture"
  - "run-length writes the count marker whenever the run is longer than one OR the payload is empty, which is what makes an empty list and a list of one empty payload distinguishable"
  - "a round-trip assertion over a symmetric writer/reader pair proves only that the two halves agree, never that either is right — the byte shape and the measured cost are asserted separately"

patterns-established:
  - "THE WIRE block in [S01]: each constant carries the arithmetic or the source that chose it, and the one figure inherited from secondary sources says so in its own comment"
  - "the reorder tripwire: one row per positionally-encoded allowlist asserting first entry and length, each label naming what a reorder would cost"
  - "[S04] sub-region index carried in [S04]'s own banner, the way [S09] carries its suites"

requirements-completed: [SHARE-03, SHARE-04, SHARE-08]

# Metrics
duration: 95min
completed: 2026-08-29
---

# Phase 4 Plan 01: The Wire, the Primitives and the Suite — Summary

**A pure-ECMAScript codec foundation that needs no host global at all, plus a 109-row suite that runs entirely in CI and reddens on a reorder of any of the seven allowlists the build code encodes by position.**

## Performance

- **Duration:** ~95 min
- **Tasks:** 3 planned, 4 commits (one extra, probe-driven — see Deviations)
- **Files modified:** 2

## Accomplishments

- `[S01]` gained seven named, exported wire constants. `CODE_ALPHABET` is an allowlist that admits base36, base64url and the six separators and refuses the comma, the space and the percent sign by construction. `CODE_SEP` is a frozen record naming one character per nesting level, so "a separator may never appear in anything it delimits" now has something to be asserted against.
- The 480-of-512 prediction `[S01]` had carried since Phase 2.1 is gone, replaced by six round-tripped measurements (45 / 295 / 283 / 675 / 2,984 / 3,186) and the conclusion the measurement supports: **no cap moves**.
- All seven positionally-encoded allowlists carry the index-stability promise, and a reorder of any one of them now fails the run.
- `[S04]` is a real section: an IIFE returning one frozen object, with a banner stating the three things this phase owed the next reader — that `dmg` and `keywords` are deliberately not encoded and why that is only safe while nothing writes them, that the checksum is not a security boundary, and that the section reads `App.data` and nothing else.
- `[S09.11]` runs **109 of 109 rows in the terminal harness**, zero skipped. The whole suite sits above every no-DOM bracket, which is the one thing about Phase 4 that Phase 3.1 could not have.

## Task Commits

1. **Task 1: [S01] the wire constants and the seven positional promises** — `08f8319` (feat)
2. **Task 2: [S04] opened as a real section holding [S04.1]'s primitives** — `8b3f00f` (feat)
3. **Task 3: [S09.11] opened above the bracket** — `e2a9a4d` (test)
4. **Task 3 continued: the byte-shape rows the probe forced** — `051a1ad` (test)

## Files Modified

- `cats-vs-mechs.html` — `[S00]` table of contents (four sub-region lines), `[S01]` (wire constants, four index-stability paragraphs, the rewritten budget comment, the export block), `[S04]` (opened, banner amended, `[S04.1]` primitives, `[S04.4]` no-op kept), `[S09]` banner index, new `[S09.11]` suite.
- `tests/selftest-node.cjs` — `SUITE_FLOOR` 760 → 868, with two history lines added.

## Measurements Recorded

| Reading | Value |
|---|---|
| Suite total before | 789 passed / 0 failed |
| Suite total after | **898 passed / 0 failed** (delta **+109**) |
| `[S09.11]` rows, terminal harness | **109**, zero skipped, zero reporting a skip |
| `SUITE_FLOOR` | **760 → 868** (margin 30, matching the previous margin of 29) |
| Interaction gate | 117 of 117 — unchanged |
| Stub-drift shell ids | 73 — unchanged |
| Layer C `#app` | 127 rendered strings — unchanged |
| Layer C dialogs | 144 across 2 roots (floor 134) — unchanged |
| Layer C proposal pane | 60 (floor 23) — unchanged |
| Layer B string literals | 4,333 → 4,569 (the comment's own "2,555" figure was already stale at baseline) |
| `grep -ci "counter\|rating\|balanced\|difficulty"` | **0** |
| `grep -c "verdict\|balanced\|rating\|difficulty"` | **0** |

The four page-side numbers are unchanged, as required: this plan renders nothing.

## Index-Stability Paragraph — Line Numbers

The plan asked for four line numbers. It got two paragraphs covering four lists, because `SHAPES`, `COLORS` and `TOKEN_IDS` are declared as three consecutive lines under one shared comment block and the file's own idiom is one block per declaration group:

| Line | Covers |
|---|---|
| **1481** | `SHAPES` (1490), `COLORS` (1491), `TOKEN_IDS` (1492) — named individually inside the paragraph |
| **1706** | `ACTION_IDS` (1713) |

The three that already carried it are at 1559 (`TOKEN_SCOPES`), 1607 (`GLYPHS`) and 1805 (`XF_WHO`).

## Deliberate-Failure Probes

All three were run against the final committed state, their readings recorded, and every one reverted from a file snapshot rather than by `git checkout`.

### PROBE A — a reorder and a deletion

**A1, first two entries of `SHAPES` swapped.** Run: 897 passed, 1 failed.

```
FAIL — build code
POSITIONAL ALLOWLIST SHAPES has not been reordered — entries may be APPENDED and
never moved or removed without bumping the build code's schema version, because
otherwise a token a classmate drew as a square would arrive as some other outline
actual: ["rect",6] — expected: ["sq",6]
```

**A2, last entry of `COLORS` deleted.** Run: 895 passed, 3 failed (one tripwire row plus two pre-existing rows that read the palette length).

```
FAIL — build code
POSITIONAL ALLOWLIST COLORS has not been reordered — entries may be APPENDED and
never moved or removed without bumping the build code's schema version, because
otherwise every token on a shared board would repaint itself in somebody else's palette
actual: ["green",6] — expected: ["green",7]
```

### PROBE B — the naive one-UTF-16-unit-at-a-time byte writer

**This probe found a real hole and the rows were fixed, not the expectation.**

Run against the suite as first written: **890 passed, 0 failed. Zero rows reddened.**

The reason, and it is worth writing down: the writer and the reader are **symmetric**. A naive writer emits an astral code point as two three-byte lone-surrogate sequences; the equally naive reader hands both UTF-16 units straight back; the string agrees with itself perfectly. The bytes in between are not UTF-8 and are half again as long, and no round-trip row can see any of it. **A round trip proves the two halves agree with each other. It never proves either half is right.**

Eight rows were added asserting the byte *shape* and the *measured cost* against the research table's figures. Re-run: **895 passed, 3 failed.**

```
FAIL — build code
an astral code point is FOUR bytes with the 0xF0 head UTF-8 gives it, not two
three-byte lone-surrogate sequences — the naive one-unit-at-a-time spelling
produces the second, and every round-trip row above stays green over it
actual: [237,160,189,237,178,128] — expected: [240,159,146,128]
---
FAIL — build code
the measured cost of a name of 3 code points is 11 bytes and 15 base64url
characters — the figures the phase budget was built on, and the rows a byte
layer that writes the wrong shape reddens
actual: [15,20] — expected: [11,15]
---
FAIL — build code
the measured cost of a name of 24 code points is 96 bytes and 128 base64url
characters — the figures the phase budget was built on, and the rows a byte
layer that writes the wrong shape reddens
actual: [144,192] — expected: [96,128]
```

Both the astral-emoji row and the 24-emoji-name row redden, as the plan required.

### PROBE C — a separator changed to a comma

`CODE_SEP.item` set to `,`. Run: **894 passed, 4 failed.**

```
FAIL — build code
every separator is inside CODE_ALPHABET, so a whole code carrying all six still
matches the allowlist end to end
actual: false — expected: true
---
FAIL — build code
no separator is a comma, a space, a percent sign or a hash — the comma because
hasFlag splits location.hash on it and would fragment a code, the space because
it becomes a percent escape on write-back, the percent sign because it is
ambiguous against that escape, and the hash because a second one in a pasted
line is a hazard
actual: false — expected: true
---
FAIL — build code
the run-length spelling of a list that collapses nothing is inside CODE_ALPHABET
actual: false — expected: true
---
FAIL — build code
the run-length spelling of a list of two runs is inside CODE_ALPHABET
actual: false — expected: true
```

The two run-length rows reddening as well is the alphabet allowlist doing its job one level down — a payload built out of a bad separator stops matching the moment it is written.

## The Reference Codec

`cm5.cjs` **was still present** in the research scratchpad and was read and cross-checked against — specifically its `utf8` / `unutf8` / `enc64` / `dec64` / `n36` / `p36` / `rle` / `unrle` / `fnv` at lines 22-107. It was **not copied**. Every primitive in `[S04.1]` was rewritten in this file's idiom (`var`, a guard per assumption on its own line, `null` instead of `throw`), and three things were added that the reference does not have:

1. **Bounds and shape guards in the byte reader** — the reference indexes past the end of its array without checking, and admits a continuation byte where a head byte belongs.
2. **An overlong-spelling refusal** — two spellings of one name are two build codes that read as different strings and mean the same thing, which is the same class of bug as a separator inside what it delimits.
3. **An unambiguous empty payload in run-length** — the reference spells an empty list and a list of one empty payload identically. `[S04.1]` writes the count marker whenever the payload is empty, so the two are distinguishable. There is a `[S09.11]` row for it.

## Deviations from Plan

### 1. [Rule 2 — missing critical functionality] The probe-B rows the plan predicted might be needed

**Found during:** Task 3, probe B.
**Issue:** The round-trip rows as first written could not fail over a naive byte writer, exactly as the plan warned ("if either stays green the row is asserting nothing").
**Fix:** Eight rows added asserting byte shape and measured cost. `SUITE_FLOOR` re-measured 860 → 868.
**Commit:** `051a1ad`.

### 2. [Rule 1 — the acceptance grep contradicted the action text] Host globals named in words, not spellings

**Found during:** Task 2.
**Issue:** Task 2's action text instructs the comments to explain that `btoa` / `atob` / `TextEncoder` / `TextDecoder` are undefined in the sandbox and that `CompressionStream` is ruled out; its acceptance criteria then require `grep -c "btoa\|atob\|TextEncoder\|TextDecoder\|CompressionStream\|crypto\."` to print `0`. Both cannot hold. Baseline was already `1` (the old `CompressionStream('deflate-raw')` mention at `:1710`), so the criterion was never true.
**Fix:** The criterion's *intent* — zero call sites — is satisfied and the *letter* is satisfied too. The comments describe the globals precisely without their literal spellings ("the platform's own base64 pair, its text encoder and decoder, its URL class and its deflate-raw compression stream") and point at `04-RESEARCH.md`'s environment table, which names each one. The pre-existing `:1710` spelling was removed as part of the same rewrite, and the reason for the circumlocution is written into the comment so the next reader does not "fix" it back.
**Reading:** `0`.
**Commits:** `08f8319`, `8b3f00f`.

### 3. [Rule 2 — coherence] `MAX_CUSTOM_TYPES`' stale estimate

**Found during:** Task 1.
**Issue:** `MAX_CUSTOM_TYPES`' comment carries the "~180 of 512" half of the prediction being replaced. Leaving it would have put two disagreeing figures eight screens apart.
**Fix:** A five-line pointer added naming the measured figure (127 at the ceiling, 77 on a fully authored board) and directing the reader to the decomposition. Inside `[S01]`, which this plan owns.
**Commit:** `08f8319`.

### 4. [scope] Index-stability paragraph count

Two paragraphs cover four lists rather than four paragraphs covering four lists, because `SHAPES`, `COLORS` and `TOKEN_IDS` share one declaration block. The paragraph names all three individually. Recorded above with line numbers.

### 5. [scope] Two extra `t.info` rows and one extra measured-cost row

`t.info` records the base64url cost of a cap-length name alongside the three budget constants, and the measured-cost table carries a three-emoji row so the astral-name case is directly gated rather than only covered by the byte-shape row. Both are measurements the phase already owned.

## Known Stubs

None that block this plan's goal. `App.serialize.scheduleUrlSync` is still the declared no-op it has been since plan 01-02 — that is the plan's explicit instruction, it is named as plan 04-04's in both `[S04]`'s banner and `[S04.4]`'s own comment, and there is an `[S09.11]` row asserting it is still a function so the day it changes is a visible day.

`[S04.2]` (encode) and `[S04.3]` (decode) do not exist yet. They are named in `[S04]`'s banner and in `[S00]`'s table of contents with their owning plans, which is the point of naming them before they exist.

## Threat Flags

None. No new network endpoint, auth path, file access pattern or schema change at a trust boundary. The two boundaries the plan's threat model names (`a student's typed name -> the wire`, `a positional index -> a meaning`) are both mitigated as specified, and probes A, B and C prove the mitigations for T-04-01, T-04-02 and T-04-03 respectively can fail. T-04-04 is proved by the `CODE_ALPHABET` refusal rows and by probe C's collateral reddening.

## For the Next Plan (04-02, encode)

- Every primitive is exported off `App.serialize` and asserted against by name. Use `App.data.CODE_SEP.*` at the call site — `[S04.1]` never captures it at section-body scope, and the `App.data.` pattern is what `[S09.11]` reads.
- `runs` writes the count marker for an empty payload. Do not "simplify" that away; there is a row on it.
- Base64url output legally contains `-` and `_`, which are the record and item separators. That is safe **only** because name-table entries are joined with `.` inside a `~`-delimited section. Move a b64 payload into a record or a list and the rule stops holding. The comment above `B64_ALPHABET` says so.
- Keep `[S09.11]` above every bracket. Nothing in it may move below one.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND
- `tests/selftest-node.cjs` — FOUND
- `.planning/phases/04-share-reset/04-01-SUMMARY.md` — FOUND
- commit `08f8319` — FOUND
- commit `8b3f00f` — FOUND
- commit `e2a9a4d` — FOUND
- commit `051a1ad` — FOUND
- `node tests/selftest-node.cjs` exits 0 at 898 passed / 0 failed — VERIFIED
- working tree clean after every probe revert — VERIFIED
