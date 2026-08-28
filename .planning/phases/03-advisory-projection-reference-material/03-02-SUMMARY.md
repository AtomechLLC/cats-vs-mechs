---
phase: 03-advisory-projection-reference-material
plan: 02
subsystem: model
tags: [projection, derivations, overkill, guards, selftest]

# Dependency graph
requires:
  - phase: 01-static-shell
    provides: "unitEhp, factionEhp, bestDamage, factionDps and the apSpent guard precedent in [S02] MODEL; the [S09] suite harness"
  - phase: 03-advisory-projection-reference-material
    plan: 01
    provides: "the three-layer PROJ-06 word gate that polices every comment and label added here"
provides:
  - "App.model.soakTotal(faction, hit) — what a roster absorbs, per-unit ceiling, refuses hit <= 0 above the reduce"
  - "App.model.turnsToWipe(attacker, target, activeUnits) — the two bounds on one object, null on zero throughput"
  - "[S09.8] SUITE: projection, the DOM-free half — 31 rows including a 6,144-pair sweep"
  - "a proven range: the two bounds separate under a real allocation, so D-05 is settled by evidence"
affects: [03-03, 03-04, 03-05, phase-05-fight]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "refuse the divisor, not the result: a guard on an input has one case, a guard on a quotient has Infinity and NaN and forgets one"
    - "drive a range into existence from a real allocation rather than asserting the model can produce one"
    - "floor the case count of any sweep, because a sweep that generated nothing passes green"
key-files:
  created: []
  modified:
    - cats-vs-mechs.html

key-decisions:
  - "the guard rule is divisor-versus-result, not read order: a probe showed the refusal can move below the health read and stay correct, so the comment now states the rule that actually bites"
  - "soakTotal's refusal is written `!(hit > 0)` so a NaN hit is refused by the same line as a zero one"
  - "the sweep reuses [S09.2]'s Number.isInteger idiom inside [S09.8] rather than growing [S09.2] itself, keeping sub-region ownership intact"

requirements-completed: [PROJ-02]

# Metrics
duration: 40min
completed: 2026-08-28
---

# Phase 3 Plan 02: The Projection's Arithmetic Summary

**The two bounds exist, are pure, are exported, and cannot put the word `Infinity` or the word `NaN` on a workshop projector by any route the ops layer can reach — and the range is demonstrated separating under a real allocation rather than asserted to be capable of it.**

## Performance

- **Duration:** ~40 min
- **Tasks:** 2 of 2 (Task 1 run as RED / GREEN)
- **Files modified:** 1

## Measured Results

| Gate | Baseline (start of session) | After this plan |
|---|---|---|
| `node tests/selftest-node.cjs` exit | 0 | **0** |
| assertions | 363 passed, 0 failed | **394 passed, 0 failed** |
| `projection` suite rows | did not exist | **31** |
| suites reading `suite threw` | 0 | **0** |
| interaction gate | 48 of 48 | **48 of 48** |
| stub-drift gate | 35 shell ids | **35 shell ids** |
| Layer A | clean, 29 words | **clean, 29 words** |
| Layer B literal count | 2,027 | **2,077, clean** |
| Layer C harvest | 102 rendered strings | **102 rendered strings** |
| perf gate | 5 ms / 50 ms | **4 ms / 50 ms** |
| `grep -ci "counter\|rating\|balanced\|difficulty"` | 0 | **0** |
| `grep -c "verdict\|balanced\|rating\|difficulty"` | 0 | **0** |
| `grep -cE "u2248\|\\u2013\|≈"` | 0 | **0** — no formatting character entered `[S02]` |
| `grep -c "turnsToWipe: turnsToWipe"` | 0 | **1** |
| `grep -c "soakTotal: soakTotal"` | 0 | **1** |
| `grep -c "\[S09.8\]"` | 0 | **3** |
| CRLF lines / total lines | 7,083 / 7,083 | **7,405 / 7,405** |

**The new assertion floor for later plans in this phase is 394.**

**Layer C harvest did not move, and should not have.** This plan is `[S02]` arithmetic and `[S09.8]` assertions with no DOM at all, so it adds no rendered string. Check 47's floor therefore still sits two under its measurement, exactly as plan 03-01 left it. **The recommendation stands unchanged and now falls to plan 03-03**, which builds the strip: once the harvest rises, raise the floor to sit well below the new baseline rather than two strings under it.

## Accomplishments

- **Both garbage renders were reproduced against the shipped artifact before anything was written**, through shipped ops rather than by argument:
  - `App.ops.setFactionAp('mechs', 0)` → `ap = 0` → `factionDps = 0` → `Math.ceil(27 / 0)` → **`Infinity`**.
  - the same side against a target already at zero health → `Math.ceil(0 / 0)` → **`NaN`**.
  - `Math.ceil(9 / 0) * 0` → **`NaN`**, the `hit === 0` case a status-effect-only roster reaches.
  After this plan, the same `App.ops.setFactionAp('mechs', 0)` path through `turnsToWipe` returns **`null`** — verified against the live state object, not a copy.
- **The range is proven, not claimed.** Three allocations a student could actually make drive real overkill into existence and read a real spread back through the same derivation the page will use.
- **The D-05 / Pitfall-2 disagreement is closed by a passing assertion.** The bounds are two independent quantities read off the roster, not a ± on one number; they agree on the shipped board because nothing spills at 1 and 3 damage against 3- and 9-health units, and they come apart the moment a hit carries past a unit's last point of health.
- **The measured aggravating fact is asserted rather than buried**: the cats direction cannot open a range while Slash does 1 damage. That is now a row over eight mechs rosters, not a sentence in a plan.
- **A vacuous probe was caught and replaced**, holding wave 1's bar (see Probe 2 below).

## Task Commits

1. **Task 1 RED — failing rows for both bounds** — `d843c27` (test). Exit 1, 363 passed / 1 failed, `TypeError: App.model.turnsToWipe is not a function`.
2. **Task 1 GREEN — `soakTotal` and `turnsToWipe` in `[S02] MODEL`** — `9e37c15` (feat). 377 passed / 0 failed.
3. **Task 2 — `[S09.8]` widened to the full DOM-free row set** — `5a82b8e` (test). 394 passed / 0 failed.
4. **Comment correction from Probe 2's finding** — `1c646bc` (docs). 394 passed / 0 failed.

## The Literal JSON, Both Directions

Printed by a `node -e` one-liner loading the script block into a bare `vm` sandbox exactly the way `tests/selftest-node.cjs` §2c does:

```
{"perTurn":3,"hit":1,"ehp":27,"soak":27,"fast":9,"slow":9}      cats  into mechs
{"perTurn":9,"hit":3,"ehp":27,"soak":27,"fast":3,"slow":3}      mechs into cats
```

The same probe with `d.mechs.ap = 0` prints `null`. With `d.cats.units.forEach(u => u.maxHp = 4)` it prints `{"perTurn":9,"hit":3,"ehp":36,"soak":54,"fast":4,"slow":6}` — **`ehp` 36, `soak` 54, `fast` 4, `slow` 6**, the spread the plan predicted. Driven through the shipped op instead of by field assignment, `App.ops.setFactionAp('mechs', 0)` then `turnsToWipe(s.build.mechs, s.build.cats)` prints `null`.

## The Sweep

**6,144 pairs**, reported through `t.info` and floored at 500 so a sweep that generated nothing cannot pass green. Every axis crossed: attacker over hit 1–4 × action points 1–4 × unit count 1–4 (64 attackers), against target over health 1–6 × shield 0–3 × unit count 1–4 (96 targets). All 6,144 produced a real projection; **0 unprintable fields** (every field finite, whole, not below zero) and **0 inversions** (`slow` never below `fast`).

## Deliberate-Failure Probes

Five probes run, all recorded, all reverted with `git diff --quiet cats-vs-mechs.html` confirming a clean return.

**Probe 1 — the per-unit ceiling replaced with a faction-total ceiling.**
`soakTotal` rewritten as `Math.ceil(factionEhp(faction) / hit) * hit`.
Result: **exit 1, 390 passed / 4 failed.** The mixed-roster row failed (`actual: 18, expected: 27`) and **all three range rows** failed — at 4 health, `actual {"...","soak":36,"fast":4,"slow":4}` against `expected {"...","soak":54,"fast":4,"slow":6}`, i.e. the range collapsed exactly as the plan said a faction-total ceiling would make it. Reverted.

**Probe 2 — the guard-order mutation as first written. THIS PROBE WAS VACUOUS AND IS RECORDED AS SUCH.**
The `perTurn <= 0` return was moved below the health read and rewritten as `if (!Number.isFinite(fast)) { return null; }`.
Result: **exit 0, 394 passed / 0 failed.** The probe did not bite — and it should not have, because that mutation is *still correct*: `Number.isFinite` catches NaN as well as Infinity, so moving the refusal below the read changed nothing observable.

**This is a finding, not a failed probe.** It shows the rule the plan stated — "the guard must run before the health read" — is not the rule that actually bites. The refusal's *position relative to the read* is not load-bearing; the refusal's *subject* is. Guarding the divisor has exactly one case. Guarding the quotient has two, `Infinity` and `NaN`, and the obvious spelling forgets one. Commit `1c646bc` restates the comment and the assertion label accordingly. Reverted.

**Probe 2b — the guard-order mutation that does bite.** Same relocation, but with the naive result check a developer would actually write: `if (fast === Infinity) { return null; }`.
Result: **exit 1, 393 passed / 1 failed** — and **only the ordering row failed**:

```
FAIL  projection :: no throughput against nothing left to take is still nothing
                    to project, because the refusal is taken on the divisor and
                    not on the result of dividing by it
      actual:   {"perTurn":0,"hit":3,"ehp":0,"soak":0,"fast":null,"slow":null}
      expected: null
```

The `null`s in that line are the harness's `JSON.stringify` rendering; a direct probe against the mutated artifact confirmed `String(r.fast)` is literally **`NaN`**. Every other refusal row — 0 AP against a live target, 0 best damage — still passed under this mutation, which is precisely why the ordering row is worth its own paragraph. Re-run after commit `1c646bc` against the sharpened label: same single failure. Reverted.

**Probe 3 — the throughput refusal removed entirely.**
Result: **exit 1, 391 passed / 3 failed.** All three refusal rows failed, returning objects with `perTurn: 0` and non-finite bounds: the 0-AP row (`ehp 27, soak 27`), the all-status-effects row (`hit 0, soak 0`), and the ordering row. Reverted.

**Probe 4 — `soakTotal`'s `hit <= 0` refusal removed.**
Result: **exit 1, 392 passed / 2 failed.** `soakTotal(cats, 0)` returned NaN (`actual: null` after serialisation) against `expected: 0`, and `soakTotal(cats, -1)` returned **27** against `expected: 0`. The negative case is the more instructive one: it does not produce NaN, it produces a plausible-looking wrong number that no finiteness check anywhere downstream would ever catch. Reverted.

## Decisions Made

- **The guard rule is stated as divisor-versus-result.** See Probe 2. The `[S02]` comment now says the refusal is taken on the divisor above both divisions, and says why: a check on the result has to catch Infinity *and* NaN, and `=== Infinity` catches only the first. `[S09.8]` carries a row that fails for exactly that mistake, and the comment says so.
- **`!(hit > 0)` rather than `hit <= 0`.** Written so a NaN hit is refused by the same line as a zero one, with a comment saying that is the reason. Same for `!(perTurn > 0)`.
- **The sweep reuses `[S09.2]`'s `Number.isInteger` idiom inside `[S09.8]` rather than growing `[S09.2]`.** The plan said "widen `[S09.2]`'s `.every(Number.isInteger)` row rather than inventing a new idiom." Read as an instruction about the idiom, not about the location: `[S09.2]` is owned by plan 01-01 and covers the older derivations, and adding a 03-02 derivation to its row would blur sub-region ownership for no gain. The sweep row does everything a widened row would, over 6,144 cases instead of one.
- **`activeUnits` is forwarded, never used in this phase.** `factionDps(attacker, activeUnits)` with `activeUnits` undefined lets the shipped default stand, because `state.fight` is `null` during setup. The seam exists for Phase 5; a comment says so.
- **Whole-object comparisons for the board rows**, not six scalar rows each, so a change to the returned shape costs one red row naming the whole shape.

## Deviations from Plan

**1. [Rule 1 — Bug] The `[S02]` guard comment and the ordering row's label stated a rule that does not hold.**
- **Found during:** Task 2, Probe 2.
- **Issue:** Both said the refusal must run "before the health read". Probe 2 demonstrated that a refusal moved below that read is still correct as long as it stays on `perTurn`. A comment that names the wrong invariant is worse than none: it invites a future editor to "preserve" the irrelevant property and drop the relevant one.
- **Fix:** Restated as divisor-versus-result, with the concrete failure spelled out (`=== Infinity` misses NaN). The ordering row's label and its paragraph were rewritten to match, and the paragraph now records that every other refusal row still passes under that mistake.
- **Files modified:** `cats-vs-mechs.html`
- **Commit:** `1c646bc`

**2. Probes 2b, 3 and 4 were added beyond the two the plan named.** Probe 2 as literally worded proved nothing (above), so Probe 2b was written to reverse the guard's actual meaning. Probes 3 and 4 were added because the plan's own threat register lists T-03-05 as mitigated by both refusals, and only one of them had a probe. Same reasoning wave 1 used for its probes 3b and 4b.

**3. The `[S09]` index row needed a second pass for column alignment.** Cosmetic; the `(plan ...)` column sits at character 63 for every other row and the first insertion landed at 60.

## Threat Register Outcomes

| Threat ID | Disposition | Evidence |
|---|---|---|
| T-03-05 | mitigated | Probes 2b, 3 and 4 each turn the suite red by removing or weakening a refusal; the 6,144-pair sweep asserts finiteness across the grid |
| T-03-06 | mitigated | Guard lives in `[S02]` with the house-style comment; `[S09.8]` asserts `null` rather than a large number, so a downstream clamp cannot satisfy the suite |
| T-03-07 | mitigated | Three range rows drive real allocations and read a real spread back; Probe 1 shows they fail when the model stops producing one |
| T-03-08 | accepted, unchanged | This plan added no keyed lookup; it reads `faction.units` and `faction.actions` only |
| T-03-SC | n/a | No packages installed. Zero runtime dependencies; harness is Node built-ins only |

## Known Stubs

None. This plan adds arithmetic and assertions; it renders nothing. The projection panel is plan 03-03's, and `[S02]`'s banner now says so explicitly rather than deferring to an unnamed future.

## Threat Flags

None. No network endpoint, auth path, file access or trust-boundary schema change. `turnsToWipe` reads two faction objects and returns a fresh literal.

## Next Phase Readiness

Plan 03-03 builds the strip and inherits:

- **`App.model.turnsToWipe(attacker, target)` returning `null`, and `null` is not an error.** The copy branch for a side that cannot attack belongs to 03-03. It must not be a number, and it must not be a clamp — `[S09.8]` will not accept one.
- **The assertion floor is 394.** `[S09.8]` is the suite to extend; 03-03 adds the DOM-gated half to the same suite rather than a new one.
- **`fast` and `slow` are integers and `fast <= slow` always.** When they are equal, D-05 says one number reaches the student. On the shipped board they are always equal, so **the default screen shows a single number on both sides** — that is correct and expected, not a defect.
- **Layer C's harvest floor is 03-03's to raise.** It is at `> 100` against a measurement of 102, and 03-03 is the plan that moves it.

No blockers. STATE.md and ROADMAP.md deliberately untouched — the orchestrator owns those.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND
- `.planning/phases/03-advisory-projection-reference-material/03-02-SUMMARY.md` — FOUND
- commit `d843c27` — FOUND
- commit `9e37c15` — FOUND
- commit `5a82b8e` — FOUND
- commit `1c646bc` — FOUND
- `node tests/selftest-node.cjs` — exit 0, 394 passed / 0 failed, interaction gate 48 of 48, stub-drift 35 shell ids
- `git status --short` — clean apart from this SUMMARY; every probe reverted

---
*Phase: 03-advisory-projection-reference-material*
*Completed: 2026-08-28*
