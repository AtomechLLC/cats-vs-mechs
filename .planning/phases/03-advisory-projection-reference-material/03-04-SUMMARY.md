---
phase: 03-advisory-projection-reference-material
plan: 04
subsystem: data
tags: [reference-material, ref-01, ref-02, checkpoint, blocking-decision, proj-06]
status: COMPLETE — Task 1 decided by the developer, Task 2 executed

# Dependency graph
requires:
  - phase: 03-advisory-projection-reference-material
    plan: 01
    provides: "the three-layer PROJ-06 word gate whose Layer A and Layer B lists this plan's draft copy was mechanically checked against"
  - phase: 03-advisory-projection-reference-material
    plan: 03
    provides: "the assertion floors (395 without a DOM, 481 with one), interaction gate 57 of 57, and the Layer C harvest baseline of 115"
provides:
  - "[S01] REFERENCE — a deep-frozen { effects, beats } declared beside DEFAULTS and outside it, exported on App.data"
  - "the five effect keyword NAMES, with no shipped definition, and a suite row that turns red if one is ever added"
  - "two matchup pairs carrying action ids and a per-pair connective, never action names"
  - "[S09.9] SUITE: reference material — 15 DOM-free rows, including REF-02 coverage in BOTH directions"
affects: [03-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "static reference copy lives BESIDE the frozen board and never inside it, so the build slice Phase 4 encodes cannot grow a key the student cannot edit"
    - "a shape row (Object.keys of every record) beside a value row, so a field ADDED to a record turns the run red rather than being silently ignored by a tuple comparison"
    - "coverage asserted in both directions as two separate rows, because one row can only ever catch one of the two defects"
key-files:
  created: []
  modified:
    - cats-vs-mechs.html

key-decisions:
  - "NAMES ONLY on the effect cards — the developer's decision, and now mechanically enforced by a row asserting each record's key set is exactly id,name"
  - "TWO matchup pairs, not three. The intra-Mechs pair was left OUT rather than corrected, and PROJECT.md's transcription is unchanged and still records all three"
  - "the connective is per-pair DATA (beats / beat), so no rendering code has to decide whether an action name is plural"
  - "REFERENCE holds action IDS and never action names, so DEFAULTS stays the one definition of what an action is called"

requirements-completed: [REF-01, REF-02]

# Metrics
duration: 15min (to checkpoint) + 25min (Task 2)
completed: 2026-08-28
---

# Phase 3 Plan 04: Reference Material Summary

**Task 1 is a blocking `checkpoint:decision` and it has been reached, not passed. `cats-vs-mechs.html` is byte-for-byte unchanged (`git diff --quiet` exit 0). No effect copy has been written into the artifact, because the words do not exist in this repository and an agent inventing them would be inventing the content of a workshop.**

## Status

| | |
|---|---|
| Tasks complete | **0 of 2** |
| Current task | Task 1 — approve the effect-card copy and the matchup wording |
| Blocked by | A human decision. `autonomous: false`, `gate="blocking"`. |
| Artifact touched | **No.** `git diff --quiet cats-vs-mechs.html` → exit **0** |

## Why This Stopped

Shield, Slowdown, Confuse, Evade and Range are ids the Workshop 16 board supplies. **The board supplies no definitions, and research verified by grepping the whole repository that no descriptive text for any of the five exists** — not in the artifact, not in `.planning/`, not in either sibling course artifact (`03-RESEARCH.md` §5.1, and A1, which that document names its *"Highest-risk item"*).

`PROJECT.md` § Out of Scope is explicit that adjudication *is* the exercise: *"Students adjudicate effects and counters themselves; that adjudication is the exercise."* These five words are what the students adjudicate with. An agent that filled the blank would be writing workshop rules an instructor then teaches against — threat **T-03-15** in this plan's register, dispositioned `mitigate` precisely by this checkpoint.

## Baseline Measured This Session

Taken before anything was drafted, on the untouched artifact:

| Gate | Measured now | 03-03's recorded value |
|---|---|---|
| `node tests/selftest-node.cjs` exit | **0** | 0 |
| assertions (Node, no DOM) | **395 passed, 0 failed** | 395 / 0 |
| interaction gate | **57 of 57** | 57 of 57 |
| stub-drift gate | **35 shell ids** | 35 shell ids |
| Layer A | **clean, 29 words** | clean, 29 words |
| Layer B | **2,222 literals, clean, 10 words** | 2,222, clean |
| Layer C harvest | **115 rendered strings, 39 words** | 115 |
| `grep -ci "counter\|rating\|balanced\|difficulty"` | **0** | 0 |
| `grep -c "verdict\|balanced\|rating\|difficulty"` | **0** | 0 |

The floors Task 2 must beat are therefore **395** without a DOM and **481** with one, gate **57 of 57**, stub-drift **35** (this plan adds no shell node).

## THE DRAFT — NOT APPROVED, NOT YET IMPLEMENTABLE

> **Task 2 must not read this section.** It becomes implementable only when a human has selected an option below and the approved text has been recorded in a new `## THE APPROVED COPY` section of this file. Until then this is an agent's proposal and nothing more.

Register the draft was written to: **describe what the keyword is, then hand the ruling back to the table.** Never state a mechanical effect the tool would then be implying it enforces — the tool does bookkeeping, the students are the rules engine.

### Five effect lines

| id | name | drafted text | chars |
|---|---|---|---|
| `shield` | Shield | Soaks damage before health. Your table decides how much gets through. | 69 |
| `slowdown` | Slowdown | The target acts later, or acts less. Your table decides how much less. | 70 |
| `confuse` | Confuse | The target's action lands somewhere it did not intend. Your table decides where. | 80 |
| `evade` | Evade | The unit may avoid a hit entirely. Your table decides when it does. | 67 |
| `range` | Range | Reaches a target that closing to melee cannot. Your table decides what that changes. | 84 |

All five are at or under the 90-character ceiling that lets five cards fit the column.

### Three matchup sentences

Assembled from `over` + connective + `under`, with the action names read at render time from `DEFAULTS[side].actions[].name` so there is one definition of what an action is called:

```
Fly beats Slash
Lasers beat Hairball
Recharge beats Fly
```

The connective is per-pair data (`beats` / `beat`) so no rendering code has to guess whether an action name is plural.

### Band heading

```
What beats what
```

## The Gate Check, Run Rather Than Asserted

Every drafted string, every effect name, both connectives, the band heading and all five proposed data keys were checked **against the live word lists lifted out of `tests/selftest-node.cjs` at run time** — parsed out of the source and evaluated, not retyped — plus both acceptance greps.

```
Layer A rules lifted: 29
Layer B rules lifted: 10
candidates: 21   refused: 0
```

All 21 candidates passed. Longest string 84 characters. Nothing collides with `counter`, `balanc`, `rating`, `difficult`, `weak`, `better`, `optimal`, `advantage`, `stronger`, `winner`, `loser` or `\bfair\b`, nor with Layer B's `score`, `grade`, `judgement`, `rank`, `ahead`, `\bwins\b`, `\bwin\b`, `\bedge\b`, `\blead\b` or `worse`.

Two naming facts worth stating because they constrain any replacement wording:

- **The word this feature would naturally be named after is banned outright, case-insensitively, over the whole file — in code, in comments and on screen.** The feature cannot be named after itself. That is why the heading is *What beats what* and the data key is `beats`.
- `rating` hides inside `generating`, `operating`, `iterating`, `separating`, `enumerating` and `decorating`. Any replacement prose must write *generated* and *operated*.

**If the user supplies replacement wording, it gets the same mechanical check before it is accepted**, and any refused word is named back to them rather than quietly reworded.

## The Second Question, Surfaced Rather Than Fixed

`PROJECT.md` § Source material transcribes the board as: *"Expected counters: Slash < Fly, Hairball < Lasers, Fly < Recharge."* Read as ordered pairs where the second wins the exchange, the third relationship is **Recharge over Fly — and both of those are Mechs actions.** One of the three relationships is therefore intra-faction, not cross-faction.

The plan's position, and research Open Question 3's resolution, is to **render it as transcribed and flag it, not tidy it.** It is a faithful reading of the whiteboard, and it is also the reason the band belongs in a full-width strip rather than in either faction column. It changes whether the band reads as cross-faction, which is why it is worth one sentence from the user rather than an agent's silent judgement.

Related and not a defect: `Fly` appears on both sides of the chain — over Slash, under Recharge. That short loop is exactly why three sentences beat a 3x3 grid on a projector (D-12).

**PENDING — awaiting one recorded sentence from the user.**

## Deviations from Plan

**1. [Rule 3 — Blocking] The worktree was reset to the plan's base at start-up.** `git merge-base HEAD 17f7bc1` exited 1 and `git log` showed a single unrelated commit (`bc0d293 Create static.yml`) — the same condition wave 3 hit and recorded. The startup check's own remedy applied: `git reset --hard 17f7bc1`, verified by `git rev-parse HEAD`. No work was lost; there was none on that branch.

No other deviations. Task 1 was executed exactly as written: draft presented, nothing written to the artifact, no self-approval.

## Known Stubs

None. Nothing was rendered and nothing was written. `REFERENCE` does not exist yet and `App.data` is unchanged.

## Threat Flags

None. No network endpoint, auth path, file access or trust-boundary schema change was introduced, because no source file was modified.

## Threat Register Status

| Threat ID | Disposition | Status at this checkpoint |
|---|---|---|
| T-03-15 | mitigate | **Firing as designed.** The checkpoint stopped before a word was written; the approved copy recorded in this file will be Task 2's only source |
| T-03-16 | mitigate | Not yet exercised — Task 2 places `REFERENCE` outside `DEFAULTS` and asserts `defaults()` gained no key |
| T-03-17 | mitigate | Not yet exercised — the `Array.find` / `hasOwnProperty` convention is Task 2's, enforced at source level by 03-05 |
| T-03-18 | mitigate | Not yet exercised — the bidirectional coverage rows and their two probes are Task 2's |
| T-03-19 | mitigate | Not yet exercised — documented at the constant in Task 2, asserted in 03-05 |
| T-03-SC | n/a | No packages. Zero runtime dependencies; the harness is Node built-ins only |

## What Task 2 Needs Before It Can Run

1. An option selected: **approve-draft**, **edit-draft** (with wording), or **names-only**.
2. If `edit-draft`: the replacement text, which will be gate-checked before acceptance.
3. One sentence on whether the intra-Mechs relationship renders as transcribed.
4. The approved text recorded verbatim in a `## THE APPROVED COPY` section of this file.

STATE.md and ROADMAP.md deliberately untouched — the orchestrator owns those.

## Self-Check: PASSED

- `.planning/phases/03-advisory-projection-reference-material/03-04-SUMMARY.md` — FOUND
- `cats-vs-mechs.html` — FOUND, and **unmodified**: `git diff --quiet cats-vs-mechs.html` exit 0
- `tests/selftest-node.cjs` — FOUND, unmodified
- `node tests/selftest-node.cjs` — exit 0, 395 passed / 0 failed, interaction gate 57 of 57, stub-drift 35 shell ids, Layer C 115
- both acceptance greps — 0 and 0
- No task commits exist, and that is correct: Task 1 edits no file, and Task 2 has not begun.

---
*Phase: 03-advisory-projection-reference-material*
*Status: PAUSED at Task 1 — blocking decision checkpoint*

---

## THE APPROVED COPY

**Decided by the developer, 2026-08-28.** Task 2 reads this section and nothing else. The drafted
five-line register above was **not** approved and must not be used.

### Effect cards — NAMES ONLY

No descriptive text. The five cards carry the keyword name and nothing more:

| id | rendered name |
|---|---|
| `shield` | Shield |
| `slowdown` | Slowdown |
| `confuse` | Confuse |
| `evade` | Evade |
| `range` | Range |

**Why:** the developer chose the option that puts no words in the workshop's mouth. These five
keywords are what students adjudicate with, and a shipped definition would be the tool doing the
adjudicating. A student who was not in the room has less to go on — that is the accepted cost, and
it is the same trade the artifact already makes by refusing to resolve combat.

### Matchups — TWO lines, not three

**"Recharge beats Fly" is dropped for now**, on the developer's instruction. The remaining pair are
the two cross-faction relationships:

```
Fly beats Slash
Lasers beat Hairball
```

**Why:** the third relationship was intra-Mechs, and dropping it also removes the short loop where
`Fly` sat on both sides of the chain. Left out rather than corrected — the developer did not call it
a transcription error, so `PROJECT.md`'s source transcription is unchanged and still records all
three. A later phase restoring it should read this note first.

### Band heading

`What beats what` — unchanged. The word this feature would naturally be named after is banned
file-wide, so it cannot be named after itself.

### Carried forward, NOT part of Task 2

The developer's stated priority: **"the key part is that they can describe counters via an editable
tab."** That is student-authored matchup text, which is a new capability with a Phase 4 codec
dependency, and it is not in REF-01/REF-02 as written. It is being handled by the orchestrator as a
scope decision rather than folded into this plan. Task 2 ships the static, names-only band above.


---

# TASK 2 — EXECUTED

*Appended after the developer's decision was recorded above. Everything before this
line is the record as it stood at the checkpoint and has not been rewritten; the
`## THE APPROVED COPY` section was Task 2's only source, and the drafted five-line
register above it was not used.*

**The approved copy is in the artifact, frozen, outside the build slice, and covered in
both directions by assertions that fail when the data and the copy disagree — including
one that fails if a definition is ever added to a card that the developer decided should
carry a name and nothing else.**

## Task Commit

**Task 2 — `[S01] REFERENCE` and `[S09.9]`'s DOM-free half** — `cfee711` (feat).

## Measured Results

| Gate | Checkpoint baseline | After Task 2 |
|---|---|---|
| `node tests/selftest-node.cjs` exit | 0 | **0** |
| assertions (Node, no DOM) | 395 passed, 0 failed | **410 passed, 0 failed** |
| `reference material` suite rows | did not exist | **15, all PASS** |
| interaction gate | 57 of 57 | **57 of 57** |
| stub-drift gate | 35 shell ids | **35 shell ids** (this plan adds no shell node) |
| Layer A | clean, 29 words | **clean, 29 words** |
| Layer B literal count | 2,222 | **2,293, clean** |
| Layer C harvest | 115 | **115** (this plan renders nothing) |
| `grep -ci "counter\|rating\|balanced\|difficulty"` | 0 | **0** |
| `grep -c "verdict\|balanced\|rating\|difficulty"` | 0 | **0** |
| `grep -c "REFERENCE: REFERENCE"` | 0 | **1** |
| `reference` (case-insensitive) inside the brace-matched `DEFAULTS` literal | n/a | **0** |
| CRLF lines / total lines | 7,834 / 7,834 | **8,043 / 8,043** |

**410 is 395 + 15.** The plan asked for no fewer than 8 above the floor; the suite carries
fifteen rows because the coverage requirement is bidirectional and the names-only decision
needed a row of its own.

The `reference` check was run by brace-matching the `DEFAULTS` literal out of the source
rather than by grepping a line range, because `REFERENCE`'s comment block sits immediately
after that literal and a range-based slice reported two hits that were entirely the
comment. The matched literal is 49 lines and contains none of `reference`, `REFERENCE`,
`effects` or `beats`.

## What Was Written

Exactly the approved copy, and nothing that was not approved:

```
effects: shield/Shield, slowdown/Slowdown, confuse/Confuse, evade/Evade, range/Range
beats  : fly  "beats" slash
         lasers "beat" hairball
```

No `text` field on any effect record. No third pair. The heading is not in `[S01]` at all —
it is [S06.4]'s, added by plan 03-05.

## Deliberate-Failure Probes

Three run, all recorded, all reverted. `git status --short` was empty after the last.

**Probe 1 — a keyword on the board with no entry.** Added `'stun'` to Screech's `keywords`
in `DEFAULTS`.
Result: **exit 1**, `408 passed / 2 failed`. `DIRECTION ONE` FAILED with
`actual: ["stun"] expected: []`, and `[S09.1]`'s own `cats actions` row failed alongside it.
**`DIRECTION TWO` PASSED throughout** — which is the point of writing them as two rows.
Reverted.

**Probe 2 — copy for a keyword nobody carries.** Added `{ id: 'stun', name: 'Stun' }` to
`REFERENCE.effects`.
Result: **exit 1**, `407 passed / 3 failed`. `DIRECTION TWO` FAILED with
`actual: ["stun"] expected: []`. **`DIRECTION ONE` PASSED**, mirroring probe 1 exactly.
The two rows catch disjoint defects and each was demonstrated to catch the one the other
misses. Reverted.

**Probe 3 — a shipped definition, which is the developer's decision made mechanical.** Added
`text: 'Soaks damage before health.'` to the `shield` record.
Result: **exit 1**, `409 passed / 1 failed`. The shape row FAILED with
`actual: id,name,text | id,name | ... expected: id,name | id,name | ...`.

**The finding worth recording: the effects TUPLE row passed under probe 3.** It compares
`[id, name]` pairs, so a record that grew a third field compares equal. Had the suite
carried only the tuple row — which is what `[S09.1]`'s idiom suggests — a future agent
could have added a definition to all five cards and the run would have stayed green. The
shape row is the one that holds the developer's decision, and it exists because this probe
was run rather than assumed. Reverted.

## Deviations from Plan

**1. The plan's Task 2 describes `{ id, name, text }` and THREE `beats` records.** The
approved copy is `{ id, name }` and TWO. `03-04-SUMMARY.md`'s `## THE APPROVED COPY` is
Task 2's stated source and the plan's own acceptance criterion 5 anticipates this exactly
("or, under a names-only decision, every entry has a name and the suite asserts that shape
instead"). Implemented as approved.

**2. Fifteen suite rows rather than the eight the plan floors at.** Bidirectional coverage
is two rows not one, the names-only decision needs its own row, the frozen check is the
`t.throws` + survived pair plus a deep-freeze row, and the build-slice check is two rows
(the key set, and the three names it must not have arrived under). Each addition is a
distinct claim rather than a restatement.

**3. A third probe was added beyond the two the plan names.** The plan asks for the two
coverage directions. The names-only decision is the thing the checkpoint existed to
protect, and nothing in the plan's two probes touches it — so it was probed, and the probe
found that the obvious row does not catch it. Same reasoning waves 1, 2 and 3 each used
for their own added probes.

## Threat Register Outcomes

| Threat ID | Disposition | Evidence |
|---|---|---|
| T-03-15 | mitigated | The checkpoint stopped before a word was written; `## THE APPROVED COPY` was Task 2's only source; probe 3 shows a shipped definition now turns the run red |
| T-03-16 | mitigated | `REFERENCE` is declared beside `DEFAULTS`; two rows assert `defaults()`'s key set is exactly `cats,mechs,schema,tokens` and that none of it arrived under `reference`, `effects` or `beats` |
| T-03-17 | mitigated | `beats` and `effects` are arrays; the constant's comment states the `Array.find` rule; plan 03-05 enforces it at the consumer and at source level |
| T-03-18 | mitigated | Two coverage rows, each probed to fail on its own direction and to pass on the other's |
| T-03-19 | documented here, enforced in 03-05 | The collision is asserted as a fact by a row of its own, so it cannot quietly go away and take 03-05's rename proof's subject with it |
| T-03-SC | n/a | No packages |

## Known Stubs

None. `REFERENCE` is complete as the developer approved it. The absence of definition text
is a recorded decision, not a stub: it is asserted, commented at the constant, and named in
`## THE APPROVED COPY` above.

## Threat Flags

None. No network endpoint, auth path, file access or trust-boundary schema change. The plan
adds one frozen constant and the assertions over it.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND, modified
- `.planning/phases/03-advisory-projection-reference-material/03-04-SUMMARY.md` — FOUND
- commit `cfee711` — FOUND
- `node tests/selftest-node.cjs` — exit 0, 410 passed / 0 failed, gate 57 of 57, stub-drift 35, Layer C 115
- both acceptance greps — 0 and 0
- `git status --short` — empty after every probe revert

STATE.md and ROADMAP.md deliberately untouched — the orchestrator owns those.

---
*Phase: 03-advisory-projection-reference-material*
*Task 1 decided 2026-08-28 · Task 2 completed 2026-08-28*
