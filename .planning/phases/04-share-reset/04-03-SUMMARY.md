---
phase: 04-share-reset
plan: 03
subsystem: serialization
tags: [codec, decode, refusal, prototype-safety, tripwire, selftest, single-file-html]

# Dependency graph
requires:
  - phase: 04-share-reset
    plan: 02
    provides: "[S04.2] encode, [S04.3] decode and its four refusal tokens, [S09.11] at 152 rows, App.serialize.WIRE_BOUNDS"
  - phase: 04-share-reset
    plan: 01
    provides: "[S01] wire constants, [S04.1] primitives, [S09.11] opened above the no-DOM bracket"
  - phase: 03.1-action-authoring
    provides: "check 72b's read-the-live-export-list idiom, [S05]'s DELIBERATELY ABSENT block, [S09.10]'s bad-input and prototype idioms"
provides:
  - "[S09.11] the refusal matrix — 17 tamper shapes, each reaching its own guard past a RECOMPUTED digest"
  - "[S09.11] the bad-input table — 20 shapes a pasted code arrives in, none of them throwing, two of them admitted on purpose"
  - "[S09.11] the prototype rows — a reserved key in every text position the schema has, with the decoded record's OWN prototypes walked at every depth"
  - "[S09.11] the state-byte-identical sweep and the no-partial-build row"
  - "[S09.11] the reconstruction tripwire — dmg and keywords come BACK as they went IN on a board driven through every action-touching op"
  - "tests/selftest-node.cjs check 74 — the no-damage-writer gate, read off App.ops's live export list and driven through the live router"
  - "[S04.3] one new guard: a tally naming a type the vocabulary lost is a refusal rather than a TypeError"
affects: [04-04 hash mirror, 04-05 boot read, 04-06 share dialog, 04-07 the refusal message]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "a tamper row changes the BODY and then RECOMPUTES the digest, so it reaches the guard it names instead of stopping four characters earlier"
    - "a bad-input table carries an EXPECTED OUTCOME per row, so the two shapes that should be admitted are asserted as admitted rather than bent into refusals"
    - "a row about a decoded record asserts ok === true as part of the row, because a walk over a refusal walks nothing and reports zero occurrences of a word it never looked for"
    - "three readings per field, not two — what went IN, what came BACK, and what the constants say — because a decoder that rebuilds a value agrees with the rebuild by construction"
    - "a check asserting an ABSENCE prints its measured numbers on a CLEAN run, because a walk that found nothing passes spotlessly"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "the matrix is seventeen tamper shapes of which TWELVE are content rows, not eleven — the plan says eleven in three places and research's own table lists twelve; the measured figure is twelve and a suite row pins it"
  - "two rows of the bad-input table expect the code to be ADMITTED: decode trims, so a good code with a trailing newline is a good code, and demanding a refusal there would be demanding a defect"
  - "unbag now refuses rather than dereferencing tokens[id] on the strength of an invariant of the function — probe J broke the lockstep by one line and threw a TypeError out of a function whose banner says it never throws"
  - "the reconstruction tripwire compares what came BACK against what went IN, not against the reconstruction — probe K proved the second comparison is a tautology and stayed green over the exact data loss it exists to catch"

patterns-established:
  - "the refusal row shape: assert [threw, ok, why, saw-or-what] as one equality, and protoIntact() after every row"
  - "the tamper helper is a SECOND reader of the grammar — it splits the body itself rather than sharing decode's parse, which would agree with it by construction"

requirements-completed: [SHARE-03, SHARE-08]

# Metrics
duration: 95min
completed: 2026-08-28
---

# Phase 4 Plan 03: The Refusal, One Guard At A Time — Summary

**Seventeen ways a build code can be wrong, each refused by its own name past a recomputed checksum — and two tripwires that stand between a future `setActionDmg` and every shared build silently losing the figure, both of which a probe made fire.**

## Performance

- **Duration:** ~95 min
- **Tasks:** 3 planned, 6 commits (three extra, all probe-driven — see Deviations)
- **Files modified:** 2

## Accomplishments

- `[S09.11]` grew from **152 rows to 243**, every one of them still above every no-DOM bracket and therefore running in CI.
- All seventeen tamper shapes are refused, each collecting the `why` token research measured and the `what` string beside it — **the readings agree with research's column exactly, seventeen for seventeen**.
- Every one of the twelve content rows carries a digest recomputed over its own tampered body. Two rows assert that mechanism rather than trusting it, and a third pins the count of distinct readings at eleven over twelve rows.
- A reserved key sits in every text position the schema has and the prototype survives — asserted three ways, one of which (the decoded record's OWN prototypes at every depth) is the row probe J reddens by name.
- Both mitigations research specified are built, and probe K fired both. A second variant of that probe (the writer exported but never driven) left `[S09.11]` spotlessly green and reddened check 74 alone, which is the exact case the second mitigation exists for.

## Task Commits

| # | Task | Commit | Type |
|---|---|---|---|
| 1 | the refusal matrix — seventeen shapes, each reaching its own guard | `435c17e` | test |
| 2 | hostile shapes, a reserved key in every position, a refusal that changes nothing | `963c8f2` | test |
| 2+ | *(probe J)* a tally naming a lost type is a refusal, not a TypeError | `28ba53f` | fix |
| 2+ | *(probe J)* the hostile rows survive their own subject failing | `c540646` | test |
| 3 | both tripwires for the data loss nobody will be looking for | `ca598fc` | test |
| 3+ | *(probe K)* the reconstruction row compared the decoder against itself | `21979f3` | fix |

## The Seventeen `why` Tokens, Beside Research's Measured Column

| # | Tamper | Research | Measured | `what` measured |
|---|---|---|---|---|
| 1 | wrong version prefix | `version` | **`version`** | `saw: 'v2'` |
| 2 | truncated, last 12 characters cut | `checksum` | **`checksum`** | — |
| 3 | one character flipped | `checksum` | **`checksum`** | — |
| 4 | empty string | `shape` | **`shape`** | — |
| 5 | arbitrary prose | `shape` | **`shape`** | — |
| 6 | glyph index past the end of `GLYPHS` | `content` | **`content`** | `no such glyph` |
| 7 | shape index past the end of `SHAPES` | `content` | **`content`** | `no such shape` |
| 8 | a health value over `MAX_ALLOC` | `content` | **`content`** | `a value is out of bounds` |
| 9 | a tally on a built-in token type | `content` | **`content`** | `a built-in type carries no tally` |
| 10 | a unit-scope type tallied on the side | `content` | **`content`** | `that type is kept on each unit` |
| 11 | a roster of zero units | `content` | **`content`** | `the roster is out of bounds` |
| 12 | a roster past `MAX_UNITS` | `content` | **`content`** | `the roster is out of bounds` |
| 13 | a run length that does not fill the roster | `content` | **`content`** | `a run length disagrees with the roster` |
| 14 | two units sharing an id | `content` | **`content`** | `two units share an id` |
| 15 | a name index naming nothing | `content` | **`content`** | `no such name` |
| 16 | a name over `MAX_TOKEN_NAME` | `content` | **`content`** | `a name is out of bounds` |
| 17 | a name carrying a control character | `content` | **`content`** | `a name carries a character the board cannot show` |

**Seventeen for seventeen, no disagreement with research anywhere.**

One correction to the plan's own arithmetic, recorded because three of its acceptance criteria depend on it: the plan says **eleven** content rows in three places. The matrix is 17 shapes of which 1 is the version, 2 are the digest and 2 are not a build code at all, leaving **twelve**. Research's own table lists twelve. A suite row now pins the figure at twelve so a later reader inherits the measurement rather than the arithmetic.

### How the recomputation is done

Every content row is produced by `tampered(fn)`:

1. `bodyOf(code)` takes everything between the first `~` and the last one. This is a **second, independent reader of the grammar** — it deliberately does not share `decode`'s parse, which would agree with it by construction.
2. The body is split on the section separator into its 16 parts, the edit function mutates one part, and the parts are rejoined.
3. `sealed(body)` writes `CODE_VERSION + '~' + body + '~' + App.serialize.checksum(body)` — the digest computed over the **tampered** body, using the exported primitive rather than a re-typed copy.

Two rows assert that this happened rather than trusting it: one recomputes `checksum(bodyOf(row.code))` and requires it to equal the last four characters of every content row's code; the other requires every content row's body to differ from the untouched one, because a tamper that changed nothing would carry a valid digest too and would decode perfectly.

## Measurements Recorded

| Reading | Value |
|---|---|
| Suite total before | 941 passed / 0 failed |
| Suite total after | **1032 passed / 0 failed** (delta **+91**) |
| `[S09.11]` rows, terminal harness | **243**, zero skipped (was 152) |
| `SUITE_FLOOR` | **911 → 1002** (margin 30, the same margin the three plans before it kept) |
| Interaction gate | **118 of 118** (was 117 of 117) |
| Check 74 — exported ops walked | **46** |
| Check 74 — dispatch arms driven | **17**, of 55 acts tried |
| Check 74 — action records read | **409** |
| Stub-drift shell ids | **73** — unchanged |
| Layer C `#app` | **127** — unchanged |
| Layer C dialogs | **144** across 2 roots (floor 134) — unchanged |
| Layer C proposal pane | **60** (floor 23) — unchanged |
| `grep -ci "counter\|rating\|balanced\|difficulty"` | **0** |
| `grep -c "verdict\|balanced\|rating\|difficulty"` | **0** |
| `grep -cF "url("` | **0** |
| `grep -cF "eval(" / "new Function" / "innerHTML" / "insertAdjacentHTML" / "DOMParser"` | **0** each |
| Layer B string literals scanned | 5,240 (was 4,917) |

All four page-side numbers are unchanged, as the plan required: this plan renders nothing.

## The Guard That Had To Be Added

**One**, and probe J is what found it.

`[S04.3]`'s `unbag` dereferenced `tokens[id].scope` on the strength of an invariant of the *function* rather than a property of the *input* — the ordinal list and the vocabulary are built in lockstep, so an id taken off `order` always names a record. Probe J broke that lockstep by one line and the dereference threw a `TypeError` out of a function whose banner says, twice, that it never throws. A thrown decode would surface the styled panel instead of a sentence a student can act on, which is precisely the failure `decode`'s record-not-an-exception contract exists to prevent.

`if (!tokens[id]) { return stop('no such token type'); }` — one line, and it converts an internal disagreement into the same refusal every other unreadable ordinal already collects. Commit `28ba53f`.

No refusal row failed to fire for want of a guard: all seventeen were refused on the first run.

## Deliberate-Failure Probes

All five (H, I, J twice, K twice) were run against committed state, their readings recorded, and every one reverted **from a file snapshot** rather than by `git checkout`. Working tree verified clean after each.

### PROBE H — the glyph-index bound removed from `[S04.3]`

`entryAt(App.data.GLYPHS, vf[3], 'no such glyph')` replaced with `App.data.GLYPHS[p36(vf[3])]`. Run: **980 passed, 1 failed.**

```
FAIL  build code :: REFUSED at the content guard — a glyph position past the end of GLYPHS
      actual:   [false,true,null,""]
      expected: [false,false,"content","no such glyph"]
```

**Exactly one row moved**, which is what the plan required. Read the `actual` column twice: `ok` came back **`true`**. Without the bound the tampered code does not merely collect a different refusal — it **decodes successfully into a wrong valid build**, carrying a token type whose glyph is `undefined`. That is the same failure class research found in its own reference codec, reproduced here on demand.

### PROBE I — the checksum comparison removed entirely

`if (digest !== mine)` replaced with `if (false)`. Run: **979 passed, 2 failed.**

```
FAIL  build code :: REFUSED at the checksum guard — a code with its last twelve characters cut off …
      actual:   [false,false,"shape",""]
      expected: [false,false,"checksum",""]
---
FAIL  build code :: REFUSED at the checksum guard — a code with exactly one character flipped …
      actual:   [false,true,null,""]
      expected: [false,false,"checksum",""]
```

**Exactly two rows moved, and they are the two the plan named. All twelve content rows stayed green** — which is the proof they were reaching past the digest all along and the whole reason the matrix is seventeen guards rather than one guard seventeen times.

Two further readings worth keeping. The truncated code falls through to `shape` rather than being admitted, because the remaining string no longer parses into 16 sections — so truncation is caught twice over, by the digest and by the grammar. The flipped-character code, by contrast, comes back **`ok: true`**: a single transcription error with no checksum is a silently wrong board, which is exactly what those four characters are for and exactly what `[S04]`'s banner says they are *only* for.

### PROBE J — the vocabulary keyed by a value taken from the code string

`tokens[madeId] = {` replaced with `tokens[cName] = {`.

**First run, against the decoder as plan 04-02 left it: 910 passed, 1 failed, and the run also tripped `SUITE_FLOOR`.**

```
FAIL  build code :: suite threw
      actual:   TypeError: Cannot read properties of undefined (reading 'scope')
      expected: no exception
```
```
SUITE TOTAL COLLAPSED: 910 rows passed against a floor of 911.
```

The probe was caught — loudly — but **not by a prototype row**. It was caught by `decode` throwing, which killed the suite at board B's round trip, before any prototype row could run. That is a red run that reports the wrong thing about the wrong function, and it is the finding that produced the guard above.

**Second run, against the hardened decoder: 1005 passed, 22 failed, no throw.** The rows the plan asked for reddened by name:

```
FAIL  build code :: and the decoded record's OWN prototypes are the ordinary ones at every
depth after "__proto__" — which is the row that sees a decoder assigning into an object
under a key it took from the code string, because that sets the prototype instead of
adding an entry and leaves the shared one spotless
---
FAIL  build code :: and NO key anywhere in the decoded record is "constructor" — a name is
a value and never a key, which is what makes the whole class harmless rather than merely
unexercised
---
FAIL  build code :: and a code whose ENTIRE name table is "prototype" in every position is
read without touching the shared prototype and without growing a key of that name
---
FAIL  build code :: a decoded build holds EXACTLY the four keys the slice holds, in the
order the slice holds them
```

The two halves of the prototype block turn out to divide the work cleanly, and neither is redundant: `__proto__` is caught by the **prototype walk** (assigning it sets the object's prototype, so no key ever appears and a key walk sees nothing), while `constructor` and `prototype` are caught by the **key walk** (they become ordinary own keys and the prototypes stay intact). A block carrying only one of the two would have been half green over this probe.

The second run also exposed two rows of my own that read the wrong thing when their subject failed — a `keysAnywhere` walk over a refusal walks nothing and reports zero occurrences of a word it never looked for, and the pinned-key-set rows reached into an absent `build` and threw, taking every row after them. Both now assert `ok === true` as part of the row. Commit `c540646`.

### PROBE K — a `setActionDmg` shipped, exported, routed and driven

**First run, against the tripwire as Task 3 first wrote it: 1030 passed, 1 failed — and the row that failed was the WRONG ONE.**

Check 74 reddened correctly. The `[S09.11]` row *named* as the tripwire stayed **green**, and the only `[S09.11]` row that moved was the round-trip row beside it, whose label explains something else entirely. The reason is worth writing down because it is the same class of finding as plan 04-01's probe B and plan 04-02's probe G: **the row compared the DECODED damage against the RECONSTRUCTED damage, and `[S04.3]` produces the decoded value *by* reconstructing it.** Both readings were `0`. The figure the student set was gone and the row read spotlessly clean.

Fixed by reading each action three ways — what went **IN**, what came **BACK**, and what the two constants say it should be. Commit `21979f3`.

**Second run, against the corrected tripwire: 1029 passed, 3 failed.** Both tripwires fired, and the tripwire row now shows the loss directly:

```
FAIL  build code :: THE RECONSTRUCTION TRIPWIRE. On a board driven through EVERY op that
touches an action … THE DAY AN OP SHIPS THAT WRITES EITHER AND A STUDENT USES IT, THIS IS
THE ROW THAT GOES RED …
      actual:   slash=1: hairball=0:slowdown screech=0:confuse x1=0: fly=0:evade
                lasers=3:range recharge=0:shield x1=0:
      expected: slash=1: hairball=0:slowdown screech=0:confuse x1=7: fly=0:evade
                lasers=3:range recharge=0:shield x1=7:
```
```
FAIL  interaction gate :: 74. THE NO-DAMAGE-WRITER CHECK …
      writers found: setActionDmg | exported ops walked: 47 | dispatch arms driven: 19 of
      56 acts tried | action records read: 416 | drift from the reconstructed values: none
      | state restored: true
```

**Both reddened, and neither is redundant.** A third run proves the second half's independent value: with `setActionDmg` **exported but never routed and never driven**, `[S09.11]` reports **1032 passed / 0 failed — spotlessly green — and check 74 reddens alone**, naming the writer. That is exactly the case research asked for the second mitigation for, and it is the one the first mitigation cannot see.

## Deviations from Plan

### 1. [Rule 1 — a bug the probe exposed] `unbag` threw where its banner says it never does

**Found during:** Task 2, probe J.
**Issue:** `tokens[id].scope` was dereferenced on the strength of a function invariant. One line of drift turned it into a `TypeError` escaping a function documented as pure and non-throwing, which would surface the styled panel instead of a message a student can act on.
**Fix:** `if (!tokens[id]) { return stop('no such token type'); }`.
**Files:** `cats-vs-mechs.html` `[S04.3]`.
**Commit:** `28ba53f`.

### 2. [Rule 1 — a suite row asserting a tautology] The reconstruction tripwire

**Found during:** Task 3, probe K.
**Issue:** The row named as the tripwire compared `decode`'s output against the same reconstruction `decode` performs, so it could not fail on the exact data loss it exists to catch. The plan's own wording ("assert that on every action of the decoded board, `dmg` and `keywords` equal their reconstructed values") describes that tautology; the plan's stated intent ("the day a `setActionDmg` ships and a student uses it, the row goes red") requires the other comparison.
**Fix:** three readings per action — in, back, and reconstructed — so the first pair is the tripwire and the second pair states the decision as an equality. Both reddened under probe K.
**Commit:** `21979f3`.

### 3. [Rule 2 — rows that read the wrong thing when their subject fails] Hostile rows hardened

**Found during:** Task 2, probe J's second run.
**Issue:** A walk over a refusal walks nothing and reports zero occurrences of a word it never looked for; and rows dereferencing `pinBack.build` threw when the code was refused, taking every row after them with them.
**Fix:** `ok === true` is now part of each row, and the key-set rows read through a helper that names what happened instead of dereferencing.
**Commit:** `c540646`.

### 4. [scope — the plan's list adjusted where it would have demanded a defect] Two rows of the bad-input table ADMIT the code

The plan lists "a code with a **trailing newline**" and "a code with surrounding whitespace" among shapes where "every one returns a refusal record". `decode` trims before it reads anything, deliberately, so both of those are **good codes** and a row demanding a refusal there would be a row demanding a defect — and would have been "fixed" by making the friendliest behaviour in the codec illegal. Both are asserted as **ADMITTED** instead, with the reasoning written beside them; the shapes that genuinely are bad (an internal space, a comma, a percent sign) are asserted as refused. The non-throwing property is asserted for all twenty rows either way.

### 5. [measurement] The plan's "eleven content rows" is twelve

Recorded above under the matrix. Three acceptance criteria and one threat-register row use the figure; none of their meanings change, but the number does, and a suite row now pins it.

### 6. [scope] Extra rows beyond the plan's list

The bad-input table also carries a percent-sign shape and four additional truncation points; the prototype block also carries a whole-name-table variant per reserved key; the pinned-key-set group also carries the action-id and vocabulary-id rows. All are within the block this plan owns and none replaces a row the plan asked for.

## Known Stubs

None. `App.serialize.scheduleUrlSync` remains the declared no-op plan 04-04 owns, unchanged by this plan.

## Threat Flags

None. No new network endpoint, auth path, file access pattern or schema change at a trust boundary. This plan renders nothing and adds no surface.

The plan's six threat-register rows are all mitigated and all provable:

| Threat | Mitigation | Proved by |
|---|---|---|
| T-04-10 a content guard never reached because the checksum stops everything first | every content row recomputes the digest, and two rows assert that it did | **probe I** — the checksum comparison removed reddened exactly two rows and left all twelve content rows green |
| T-04-11 a reserved key from a pasted code reaching a key position | ids rebuilt from the sequence number, `tok` as a field, the decoded record's own prototypes walked at every depth, `protoIntact()` after every path | **probe J** — reddened the prototype walk and the key walk by name |
| T-04-12 a half-applied build from a refusal | the state-byte-identical sweep over all 37 codes, plus the no-`build`-key row | both rows, green, over a sweep that refused 35 and threw 0 |
| T-04-13 silent loss of an action's damage or keywords | the reconstruction row and check 74 off the live registration | **probe K** — both fired; a third run proved check 74 fires alone when the writer is exported but never driven |
| T-04-14 a refusal collapsed into one message | every row asserts the `why` TOKEN and the `saw`/`what` beside it | 17 rows, plus the version-before-digest ordering row |
| T-04-SC npm/pip/cargo installs | accept | zero packages installed by this phase |

## For the Next Plan (04-04, the hash mirror; 04-07, the message)

- **The four tokens are proved; the WORDS are not.** This plan asserts that a truncated code collects `checksum` and a stale one collects `version`. What a student *reads* for each is plan 04-07's, and rehearsal item 8 is where it is under test — by a person, because the wording is the thing.
- **`what` is a diagnosis, not a sentence.** Eleven distinct strings over twelve content guards, listed in the table above. They are written to be *quoted inside* a sentence the page owns, not shown raw.
- **`decode` never throws, and that is now a row rather than a habit** — twenty paste shapes, each called inside a try that records an exception as a failure. Write the paste handler against that property.
- **A good code with a trailing newline or surrounding whitespace is a GOOD CODE.** `decode` trims. The paste handler must not trim first and must not treat whitespace as damage.
- **A refusal carries no `build` key at all**, asserted over all 37 hostile codes. There is nothing to half-apply even by mistake, so the consuming op can branch on `ok` alone.
- **Two tripwires now guard `dmg` and `keywords`.** If a later phase ships a writer for either, it must add the field to the codec in the same commit. `[S05]`'s DELIBERATELY ABSENT block and `[S04]`'s banner both name the two tripwires by where they live.
- `SUITE_FLOOR` is **1002** against a measured 1032; the interaction gate is **118**.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND
- `tests/selftest-node.cjs` — FOUND
- `.planning/phases/04-share-reset/04-03-SUMMARY.md` — FOUND
- commit `435c17e` — FOUND
- commit `963c8f2` — FOUND
- commit `28ba53f` — FOUND
- commit `c540646` — FOUND
- commit `ca598fc` — FOUND
- commit `21979f3` — FOUND
- `node tests/selftest-node.cjs` exits 0 at 1032 passed / 0 failed — VERIFIED
- interaction gate 118 of 118 — VERIFIED
- stub-drift 73, `#app` 127, dialogs 144, proposal 60 — VERIFIED unchanged
- both naming greps print 0 — VERIFIED
- working tree clean after every probe revert — VERIFIED
