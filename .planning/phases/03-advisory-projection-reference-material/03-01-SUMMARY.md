---
phase: 03-advisory-projection-reference-material
plan: 01
subsystem: testing
tags: [selftest-harness, ci-gate, static-analysis, stub-dom, proj-06]

# Dependency graph
requires:
  - phase: 02.1-token-authoring
    provides: "the interaction gate, its stub DOM, the check()/gateFailures scaffolding and the stub-drift gate this plan's Layer C extends"
  - phase: 01-static-shell
    provides: "the FORBIDDEN whole-document scan whose mechanism Layers A and B reuse, and the two acceptance greps this plan makes mechanical"
provides:
  - "Layer A: a VERDICT_WORDS whole-document scan of 29 comparative words, failing with PROJ-06 named"
  - "Layer B: a string-literal-only scan of 10 more words the artifact's prose legitimately uses, failing with PROJ-06 named"
  - "Layer C: interaction-gate checks 47 and 48, walking the rendered page under #app for words no source scan can see"
  - "a measured Layer C harvest baseline of 102 rendered strings that later plans grow"
affects: [03-02, 03-03, 03-04, 03-05, projection-strip, reference-material, any-plan-writing-copy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "three-layer word gate: whole file / string literals only / rendered page, so comments may discuss what the page may not say"
    - "anti-vacuity floor on any harvest-then-search gate, after the KNOWN_IDS precedent"
key-files:
  created: []
  modified:
    - tests/selftest-node.cjs
    - cats-vs-mechs.html

key-decisions:
  - "VERDICT_WORDS sits beside FORBIDDEN rather than inside it: a comparative word is not an unsafe sink, and one failure message cannot honestly speak for both"
  - "Layer B exists so the artifact's own anti-verdict comment at line 2666 survives: score, grade and judgement are checked against rendered strings only, never against the whole file"
  - "Layer C skips [data-lbl] for text and [data-albl] for aria-label — precisely the two channels labelFor writes — so ALLOC-10 student names cannot redden CI"
  - "check 47 floors the harvest at 100 strings, because the failure mode of a broken walk is a green run, not a red one"

patterns-established:
  - "PROJ-06 enforcement: any new page copy is policed by three scans before review sees it"
  - "deliberate-failure probes are run and recorded rather than assumed, and reverted with git diff --quiet confirming it"

requirements-completed: [PROJ-06]

# Metrics
duration: 25min
completed: 2026-08-28
---

# Phase 3 Plan 01: PROJ-06 Gate Summary

**The project's central risk stopped being a promise: a comparative word in a comment, in a rendered string, or assembled at render time out of fragments now each turn `node tests/selftest-node.cjs` red with PROJ-06 named — and the artifact's own anti-verdict comment survives untouched.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-08-28T14:18Z
- **Completed:** 2026-08-28T14:43Z
- **Tasks:** 2 of 2
- **Files modified:** 2

## Accomplishments

- **Two greps that had been documentation since Phase 1 now run in CI.** `.github/workflows/pages.yml` already invokes this harness, so the gate ships with no new plumbing.
- **Three layers, not one**, because a naive widening was measured to be unbuildable: the artifact states its own anti-verdict rule in three of the words a whole-file ban would have to include.
- **Layer C proved to catch what Layers A and B structurally cannot** — a label assembled as `'Total health ' + 'advant' + 'age'` passes both source scans clean and fails check 48. That is the case the rendered-page walk exists for, and it was demonstrated rather than asserted.
- **The student-rename exemption was proved non-vacuous**, which is the failure this project has already been bitten by once.

## Task Commits

1. **Task 1: reword line 4736, add Layer A and Layer B** — `eecda74` (test)
2. **Task 2: Layer C, the rendered-page walk** — `cae4f3b` (test)

## Files Created/Modified

- `tests/selftest-node.cjs` — added section 1b (`VERDICT_WORDS`, 29 words, whole document), section 2b (`VERDICT_LITERAL_WORDS`, 10 words, string literals only, with an escape-aware extractor and a 1,500-literal floor), and interaction-gate checks 47 and 48 (the `#app` walk). Extended the gate's "what this cannot reach" note with a fifth entry.
- `cats-vs-mechs.html` — one line changed. Line 4736 `weaker` → `narrower`, which is what makes the `weak` stem bannable at all.

## Measured Results

| Gate | Baseline (start of session) | After this plan |
|---|---|---|
| `node tests/selftest-node.cjs` exit | 0 | **0** |
| assertions | 363 passed, 0 failed | **363 passed, 0 failed** |
| suites reading `suite threw` | 0 | **0** |
| stub-drift gate | 35 shell ids | **35 shell ids** |
| interaction gate | 46 of 46 | **48 of 48** |
| Layer A | did not exist | **clean, 29 words** |
| Layer B literal count | did not exist | **2,027 literals, clean, 10 words** |
| Layer C harvest | did not exist | **102 rendered strings, clean, 39 words** |
| `grep -ci "counter\|rating\|balanced\|difficulty"` | 0 | **0** |
| `grep -c "verdict\|balanced\|rating\|difficulty"` | 0 | **0** |
| `grep -ci weak` | 1 (line 4736) | **0** |
| `grep -c "score, a grade or a judgement"` | 1 | **1** (line 2666 untouched) |
| CRLF lines / total lines | 7,083 / 7,083 | **7,083 / 7,083** |

The Layer B literal count landed on 2,027 — exactly the number the plan measured independently, which is the cheapest available evidence that the escape-aware extractor is reading the same thing the plan's author read.

## Deliberate-Failure Probes

Five probes run, all recorded, all reverted. `git diff --quiet cats-vs-mechs.html` confirmed a return to the committed state after each artifact probe.

**1. Layer A — comparative word in a comment.** Inserted `// this build is stronger` near line 4739.
Result: **exit 1**, output `PROJ-06 VIOLATION: comparative language reached cats-vs-mechs.html (1): line 4739 [stronger]: stronger`. Reverted.

**2. Layer B — comparative word in a rendered string.** Changed a literal to `'topbar measure is worse'`.
Result: **exit 1**. Layer A passed clean first (`worse` is deliberately not in Layer A), then `PROJ-06 VIOLATION: a comparative word reached a rendered string, not a comment (1): [worse]: 'topbar measure is worse'`. Reverted.

**3. Layer C — a verdict assembled from fragments.** Changed the `Total health` label to `'Total health ' + 'advant' + 'age'`.
Result: **exit 1**. Layer A clean, Layer B clean at 2,029 literals, then `FAIL interaction gate :: 48` with detail `[advantage] in "Total health advantage"`, gate reporting 47 of 48. **This is the probe that justifies Layer C's existence** — neither source layer could see it. Reverted.

**3b. The same word written plainly**, as a control: `'Total health advantage'`.
Result: **exit 1** at Layer A, line 2670, before the sandbox ever loads. Recorded because it explains why probe 3 had to be written as fragments: a plainly-spelled word can never reach check 48, since Layer A aborts the run first. Reverted.

**4. Student-rename probe.** Added `A.ops.renameTokenType('hp', 'Winner')` + `A.state.flush()` before the walk.
Result: **check 48 still PASSED**, gate 48 of 48. The `[data-lbl]` / `[data-albl]` skip works.

**4b. Non-vacuity control for probe 4.** With the rename still in place, the `[data-lbl]` skip was temporarily disabled.
Result: harvest rose **102 → 132** and check 48 **FAILED** with `[winner] in "Winner"` thirty times over. This proves the rename genuinely reached the rendered page and that the skip — not an inert probe — is what spares CI. Without this control, probe 4 would have been exactly the vacuous pass this plan was written to outlaw. Both temporary edits reverted.

## Decisions Made

- **`judgment` in Layer A, `judgement` in Layer B.** Not a typo. The US spelling measures 0 in the file and is safe to ban outright; the UK spelling is the one the artifact's own anti-verdict comment uses, so it is checked against rendered strings only. A comment states this so a future reader does not "fix" it.
- **Layer C skips per channel, not per node.** A node carrying `data-lbl` is skipped for `textContent`; a node carrying `data-albl` is skipped for `aria-label`. Each is skipped only for the channel `labelFor` actually writes, so a static `title` on a relabelled node is still read. This is slightly tighter than "skip any node carrying `data-lbl`".
- **The harvest count is printed on clean runs, not only on failure.** The plan asks for the number to be recorded as a baseline later plans grow; a baseline nobody can read is a baseline nobody notices collapsing.

## Deviations from Plan

None — plan executed as written. Two additions within its intent, both recorded above:

- Probes **3b** and **4b** were not requested. They were added because probe 3 as literally worded ("change one rendered label to contain the word `advantage`") cannot reach check 48 — Layer A exits first — and because probe 4 as worded passes whether or not the rename does anything. Running only the literal wording would have produced two probes that prove nothing, which is the exact defect the plan's `<proof_obligation>` section exists to prevent.
- A hard floor (`fail()` below 1,500 literals) was added to Layer B alongside the printed count. The plan asked for the count to be *printed*; printing alone still permits a silent green run if the extractor breaks. Same anti-vacuity reasoning as check 47's floor.

## Issues Encountered

**The Layer C harvest floor has a margin of two.** Check 47 asserts `> 100` and the measured harvest is **102**. The floor is the number the plan specified and it passes, but the margin is thin enough that a later plan altering the default roster could redden CI for a reason that has nothing to do with PROJ-06. Flagged for plan 03-02, which adds the projection strip and should grow this number substantially; once it does, the floor should be raised to sit well below the new baseline rather than two strings under it. Not changed here, because lowering or raising it unilaterally would weaken a number the plan set deliberately.

**Layer C sees less of the page than its name suggests.** The stub DOM is a hand-made stand-in, not a parser, so text written directly into the shell markup (`Projection lands here in Phase 3`, `Token appearance`, the selftest report headings) is empty in the stub and never harvested. Only artifact-rendered content is read. Layers A and B do read that static text in the source, so nothing is unguarded — but the limit is real and is now named as entry 5 in the gate's "what this cannot reach" note rather than left to be discovered.

## Known Stubs

None. This plan adds no page surface; it adds gates over the surface later plans will add.

## Threat Flags

None. No new network endpoint, auth path, file access or trust-boundary schema change. The threat register's four entries (T-03-01 through T-03-04) are each mitigated and each has a probe above proving the mitigation fires: T-03-01 by probes 1 and 2, T-03-02 by probe 3, T-03-03 by probes 4 and 4b, T-03-04 by check 47's floor and probe 4b's 102→132 movement.

## Next Phase Readiness

The gate polices every later plan in this phase from its first written word. Plans 03-02 through 03-05 should expect:

- Any comparative word in new copy or in a new comment fails the run and names PROJ-06.
- New rendered surfaces are **not** automatically covered by Layer C. The walk reads `#app` in setup mode. A fight-mode string or dialog string is covered by Layers A and B in source, but the assembled-at-render case waits until the walk is pointed at that surface. A plan adding such a surface should extend the walk.
- The Layer C harvest baseline to beat is **102**. If a plan adds rendered text and this number does not move, the new text is not reaching `#app` and something is wrong.

No blockers. STATE.md and ROADMAP.md deliberately untouched — the orchestrator owns those.

## Self-Check: PASSED

- `tests/selftest-node.cjs` — FOUND
- `cats-vs-mechs.html` — FOUND
- `.planning/phases/03-advisory-projection-reference-material/03-01-SUMMARY.md` — FOUND
- commit `eecda74` — FOUND
- commit `cae4f3b` — FOUND
- `node tests/selftest-node.cjs` — exit 0, 363 passed / 0 failed, interaction gate 48 of 48

---
*Phase: 03-advisory-projection-reference-material*
*Completed: 2026-08-28*
