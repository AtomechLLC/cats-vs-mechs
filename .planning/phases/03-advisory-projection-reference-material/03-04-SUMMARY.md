---
phase: 03-advisory-projection-reference-material
plan: 04
subsystem: data
tags: [reference-material, ref-01, ref-02, checkpoint, blocking-decision, proj-06]
status: PAUSED — Task 1 blocking checkpoint, awaiting a human decision

# Dependency graph
requires:
  - phase: 03-advisory-projection-reference-material
    plan: 01
    provides: "the three-layer PROJ-06 word gate whose Layer A and Layer B lists this plan's draft copy was mechanically checked against"
  - phase: 03-advisory-projection-reference-material
    plan: 03
    provides: "the assertion floors (395 without a DOM, 481 with one), interaction gate 57 of 57, and the Layer C harvest baseline of 115"
provides:
  - "NOTHING YET — Task 2 is not started. Task 1 is a blocking decision checkpoint and no file has been edited."
affects: [03-05]

# Tech tracking
tech-stack:
  added: []
  patterns: []
key-files:
  created: []
  modified: []

key-decisions:
  - "PENDING — the five effect definitions and the three matchup lines are awaiting a human decision; nothing has been written into the artifact"

requirements-completed: []

# Metrics
duration: 15min (to checkpoint)
completed: null
---

# Phase 3 Plan 04: Reference Material — CHECKPOINT, NOT COMPLETE

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
