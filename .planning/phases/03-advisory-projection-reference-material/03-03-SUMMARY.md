---
phase: 03-advisory-projection-reference-material
plan: 03
subsystem: render
tags: [projection-strip, proj-06, sync-hooks, dom-assertions, interaction-gate]

# Dependency graph
requires:
  - phase: 03-advisory-projection-reference-material
    plan: 01
    provides: "the three-layer PROJ-06 word gate; Layer C now walks this plan's copy"
  - phase: 03-advisory-projection-reference-material
    plan: 02
    provides: "App.model.turnsToWipe and soakTotal, and the null this plan renders as words"
  - phase: 02-allocation-surface
    provides: "[S06.1]'s helpers, the SYNC_HOOKS seam, [S06.2] as the sub-region template, and the reserved #strip"
provides:
  - "[S06.3] RENDER — PROJECTION: two independent panels and a permanent ignores list, registered on SYNC_HOOKS"
  - "[C10] PROJECTION styles, .prj- prefixed, with no length a shared axis could be drawn along"
  - "[S09.8]'s DOM-gated half — 20 rows reading the rendered strip"
  - "interaction-gate checks 49-57, the CI-reachable half"
  - "a Layer C harvest baseline of 115 rendered strings, with check 47's floor raised 100 -> 105"
affects: [03-04, 03-05, phase-05-fight]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "a sub-region that paints outside #board registers on SYNC_HOOKS and builds once behind a dataset flag"
    - "assert an anti-comparison requirement by SHAPE — one builder per side, no figure without a side, no inline length — not only by word"
    - "when a stub cannot express a selector, write the assertion as a longhand walk rather than accept a pass that means nothing"
key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "the soak line is built once and carried hidden rather than created and destroyed, so the sync pass writes it in one branch"
  - "the panel heading is synced through data-prj like every other figure, so a faction name can never go stale in the strip"
  - "checks 56 and 57 are written as walks rather than as the selectors [S09.8] uses, because the stub would have passed both on nothing"
  - "check 47's floor raised to 105, chosen against three measurements rather than picked"

requirements-completed: [PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-06]

# Metrics
duration: 65min
completed: 2026-08-28
---

# Phase 3 Plan 03: The Projection On Screen Summary

**The centre strip now paints two independent panels — `≈9 turns to wipe Mechs` over `27 health ÷ 3 per turn`, and `≈3 turns to wipe Cats` over `27 health ÷ 9 per turn` — beside a permanent list naming Matchups, Effects, Focus fire, Overkill and Your rulings; the range is proven to APPEAR on the DOM under a real allocation, a side with nothing to spend reads as words, and D-13's prohibition is held by shape rather than by a comment.**

## Performance

- **Duration:** ~65 min
- **Tasks:** 3 of 3
- **Files modified:** 2

## Measured Results

| Gate | Baseline (03-02) | After this plan |
|---|---|---|
| `node tests/selftest-node.cjs` exit | 0 | **0** |
| assertions (Node, no DOM) | 394 passed, 0 failed | **395 passed, 0 failed** |
| **full suite WITH a DOM (stub)** | not measured this phase | **481 passed, 0 failed** |
| `projection` suite rows (with a DOM) | 31 | **51** |
| suites reading `suite threw` | 0 | **0** |
| interaction gate | 48 of 48 | **57 of 57** |
| stub-drift gate | 35 shell ids | **35 shell ids** |
| Layer A | clean, 29 words | **clean, 29 words** |
| Layer B literal count | 2,077 | **2,222, clean** |
| **Layer C harvest** | **102** | **115** |
| check 47's floor | `> 100` (margin 2) | **`> 105` (margin 10)** |
| perf gate | 4 ms / 50 ms | **5 ms / 50 ms** |
| `grep -ci "counter\|rating\|balanced\|difficulty"` | 0 | **0** |
| `grep -c "verdict\|balanced\|rating\|difficulty"` | 0 | **0** |
| `grep -c "\.style"` | 1 | **1** |
| `grep -c "SYNC_HOOKS.push"` | 1 | **2** |
| `grep -c "SYNC_HOOKS.push(syncProjection)"` | 0 | **1** |
| `grep -c "position:sticky"` | 2 | **2** |
| CRLF lines / total lines (`cats-vs-mechs.html`) | 7,405 / 7,405 | **7,834 / 7,834** |
| CRLF lines / total lines (`tests/selftest-node.cjs`) | 2,211 / 2,211 | **2,420 / 2,420** |

**The new assertion floor for later plans in this phase is 395 without a DOM and 481 with one.**

The `395` is `394` plus one `t.info` row — the `skipped — no DOM` notice `[S09.8]`'s new half prints when there is no page. The twenty real rows it guards run only where a document exists.

### The browser number, stated honestly

**No browser was available in this environment, and the 481 above was measured against the STUB DOM**, not a real one, using the runner research §9.3 describes: `makeStubDom()` lifted out of the harness at run time, the artifact loaded into a `vm` with it, `App.selftest.run()` called directly. Every one of the 51 projection rows executed and passed there.

Two of those rows pass **vacuously in the stub and only there**, and both are named rather than left to be discovered:

- `document.querySelectorAll('#strip [style]').length === 0` — the stub's selector engine understands a class and a `[data-*]` test and nothing else, so `#strip` and `[style]` match nothing for a reason that has nothing to do with the artifact.
- `strip.textContent` for the `Infinity` / `NaN` search — the stub's `textContent` is a plain own property, not a value computed over descendants, so it is the empty string whatever the page holds.

Both are **re-spelled as longhand walks** in the interaction gate (checks 56 and 52), which is the half CI actually runs, so neither behaviour is left resting on a vacuous pass. That was the reason for writing them twice rather than once. A real-browser total is still owed to the phase's rehearsal, and it should be `481` or higher.

## The Strip's Rendered Text, All Four States, Verbatim

Printed by a probe loading the artifact into the same stub page the harness builds, driving real ops, and reading the `[data-prj]` nodes back.

**1. The shipped board**

```
Cats            ≈9 turns to wipe Mechs      27 health ÷ 3 per turn
Mechs           ≈3 turns to wipe Cats       27 health ÷ 9 per turn
This projection ignores:
Matchups · Effects · Focus fire · Overkill · Your rulings
One number means nothing is wasted at this damage. A range appears when a hit
spills past a unit's last point of health.
```

Exactly the strings the plan specified. Both soak lines hidden, because nothing spills at 1 and 3 damage against 3- and 9-health units.

**2. After `App.ops.setFactionAp('cats', 0)`**

```
Cats            no damage to spend          0 per turn
Mechs           ≈3 turns to wipe Cats       27 health ÷ 9 per turn
```

`contains Infinity: false   contains NaN: false`. The whole leaf text of the strip was searched, not just the figure.

**3. After raising every Cat to 4 health — THE RANGE, ON THE DOM**

```
Cats            ≈9 turns to wipe Mechs      27 health ÷ 3 per turn
Mechs           ≈4–6 turns to wipe Cats     36 health ÷ 9 per turn
                                            54 soaked ÷ 9 per turn with overkill
```

The soak line is no longer hidden, and it is the line that explains where the second bound came from. The Cats panel is unchanged and should be: the Mechs roster did not move, so the Cats direction did not either. That independence is D-13 visible in the output.

**4. After `App.ops.addUnit('cats')` — a STRUCTURAL commit**

```
strip.dataset.built = "1"
Cats            ≈9 turns to wipe Mechs      27 health ÷ 3 per turn
Mechs           ≈4 turns to wipe Cats       30 health ÷ 9 per turn
```

`structure()` replaced both column interiors and left the strip standing; the Mechs figure moved with the roster on the same frame.

**Structural shape, same probe:** 6 `.num` nodes in the strip, **0** without a `[data-side]` ancestor; **0** nodes carrying an inline style attribute; exactly **2** `[data-side]` panels.

## Task Commits

1. **Task 1 — `[S06.3] RENDER — PROJECTION`** — `f9ecb1b` (feat). 394 passed, gate 48 of 48, Layer C 102 → 115.
2. **Task 2 — `[C10] PROJECTION` and the one `[C03]` edit** — `356c718` (style). 394 passed, gate 48 of 48.
3. **Task 3 — `[S09.8]`'s DOM half and gate checks 49-57** — `02d1706` (test). 395 passed, gate 57 of 57.

## Deliberate-Failure Probes

Four run, all recorded, all reverted. `git diff --quiet cats-vs-mechs.html` returned 0 after each, and `git status --short` is empty.

**Probe 1 — a `.num` node in the strip outside both panels.** Appended `text('div', 'num', '0')` to `#strip` after the ignores block.
Result: **exit 1**, gate **56 of 57**, check 55 FAIL with detail `figures=7 (floor 6) without a sided ancestor=1`. The full stub-DOM suite also went **480 passed / 1 failed**, the failing row being `and every one of them sits under a panel naming ONE side`, `actual: 1  expected: 0`. Both halves bite. Reverted.

**Probe 2 — an inline style attribute on a strip node.** `owner.setAttribute('style', 'width:50%')`.
Result: **exit 1**, gate **56 of 57**, check 56 FAIL with `nodes carrying one: ["prj-owner","prj-owner"]`. **Check 57 PASSED** under this mutation, which is the finding worth recording: `setAttribute` writes an inline style without touching the `.style` count, so the source-level count is not the check that catches a hand-written width — the walk is. Running only one of the two would have left half the surface unguarded. Reverted.

**Probe 2b — the other route, a per-frame custom property.** `document.documentElement.style.setProperty('--prj-scale', '1')` inside `syncProjection`.
Result: **exit 1**, gate **56 of 57**, check 57 FAIL with `occurrences: 2`. Check 56 passed, mirroring probe 2 exactly. The two checks catch disjoint routes to the same forbidden thing, and each was demonstrated to catch the one the other misses. Reverted.

**Probe 3 — `turnsText`'s equal-bounds branch removed**, so it always prints a range. This is the D-05 probe.
Result: **exit 1**, gate **55 of 57**. Check 49 FAIL with `cats="≈9–9 turns to wipe Mechs" mechs="≈3–3 turns to wipe Cats"` — the exact detail the plan predicted — and check 53 FAIL with `cats figure="≈12–12 turns to wipe Mechs"`. The full stub-DOM suite went **478 passed / 3 failed**, the three rows being both shipped-board figures and the post-rebuild one. Checks 50, 51 and 52 passed throughout: the worked lines are unaffected, and `≈4–6` is a real range either way. **So D-05's single-number behaviour is asserted by rows written for it, not inherited from a row about something else.** Reverted.

## Decisions Made

- **The soak line is built once and carried hidden**, rather than created and destroyed as a spread comes and goes. A line that exists is a line the sync pass writes in one branch, and the region is built once by construction. It is hidden through the plain property plus `.prj-work[hidden]{display:none}` in `[C10]` — never through `.brd-line--opt`, which reads `amountFor` and would have pinned it shut forever.
- **The panel heading is synced like every other figure**, through `data-prj="owner"`. Faction names are not student-editable today, so a build-once heading would have been correct today and quietly wrong the first time they are. The `[data-prj]` walk already existed; adding a third branch to it cost one `else if`.
- **The rejected label attribute is described, never spelled**, in `[S06.3]`'s comment. The plan asked for the decision to be recorded AND for the region-scoped grep to return 0, which cannot both be true if the attribute is written down. `[S06.1]` already faced this and states the resolution in its own comment about its own rejected attribute; this follows it and says so.
- **Checks 56 and 57 exist as a pair, and probes 2 and 2b are why.** Neither alone covers the surface.
- **Check 47's floor is 105, chosen against three measurements.** The shipped board harvests 115 in the gate and 111 on a board with no gate drives behind it; a board shrunk to one unit a side harvests 41; each unit card is worth about 7 strings, measured by adding three Mechs and watching 111 become 132. 105 leaves more than one unit card of headroom against a legitimate roster change while sitting far above the zero a broken walk reports. All four numbers are written into the comment so the next plan to touch it has the data rather than a bare constant.
- **The formatting characters are written as escapes** (`≈`, `–`, `÷`) rather than as glyphs, per the plan. `[S06.1]` ships its own `−` and `×` as literal glyphs with a naming comment; the divergence is deliberate and the comment names the characters in the same register, so the file still reads consistently.

## Deviations from Plan

**1. [Rule 3 — Blocking] The worktree was reset to the plan's base at start-up.** `git merge-base HEAD 6828007` exited 1 and `git log` showed a single unrelated commit (`bc0d293 Create static.yml`). The startup check's own remedy applied: `git reset --hard 6828007`, verified. No work was lost — there was none on that branch.

**2. The table-of-contents entry lists all three `[S06]` sub-regions, not only `[S06.3]`.** The plan asked for `[S06.3]` to be added to the TOC. The TOC lists top-level sections only and does not mention `[S06.1]` or `[S06.2]`, so adding one sub-region alone would have told a reader the section has exactly one. Three indented rows were added instead, at the existing `(plan ...)` column of 76. Cosmetic, and it makes the TOC true rather than selectively true.

**3. Probe 2b was added beyond the three the plan named.** Probe 2 as literally worded says "confirm the `.style`-count assertion **or** the `#strip [style]` check fails". It fails only one of them, and which one is the interesting fact — so the second route was probed to establish that the other check is not decorative. Same reasoning waves 1 and 2 used for their own added probes.

**4. Two `[S09.8]` rows were deliberately duplicated rather than mirrored.** The plan asked for "the four highest-value rows" to be mirrored into the gate. Two of them (`#strip [style]` and the `Infinity` / `NaN` search) are structurally incapable of failing in the stub, so mirroring them verbatim would have produced two green checks that assert nothing. They are re-spelled as longhand walks, and both the reason and the limit are written into the gate's comment.

## Threat Register Outcomes

| Threat ID | Disposition | Evidence |
|---|---|---|
| T-03-09 | mitigated | One builder called twice (checks 54, `[S09.8]`); `.style` pinned at 1 (check 57, probe 2b); no inline style in the strip (check 56, probe 2); no computed width and no custom property in any `.prj-*` rule (region-scoped greps, all 0) |
| T-03-10 | mitigated | Check 52 searches the strip's whole leaf text at 0 action points and finds neither word; the `no damage to spend` / `0 per turn` branch is asserted as a whole string |
| T-03-11 | mitigated | Region-scoped grep over `[S06.3]` returns 0 for `data-k`, `data-amt`, `brd-value`, `brd-line--opt`, `data-lbl` and `data-act`; the figures carry `data-prj` and `.prj-` only |
| T-03-12 | mitigated | No `data-k` in the region; focus checks 1-8 stayed green through every run |
| T-03-13 | mitigated | Every string reaches the page through `text(...)` → `textContent`; the FORBIDDEN scan is clean and unchanged |
| T-03-14 | mitigated | Checks assert exact strings and exact counts; check 55 carries its own floor of 6 so an empty walk cannot report zero orphans; four probes recorded above |
| T-03-SC | n/a | No packages. Zero runtime dependencies; the harness is Node built-ins only |

## Known Stubs

None. The strip is fully wired: every figure is read from `App.model` on every frame, and nothing on it is hardcoded, placeholder or awaiting a later plan. The shell's static placeholder line was replaced with `The projection renders here.` in the register of `#board-empty`, and it is cleared by `replaceChildren()` on the first frame.

## Threat Flags

None. No network endpoint, auth path, file access or trust-boundary schema change. The plan adds one read path from state to rendered text.

## Issues Encountered

**The stub DOM is a smaller page than a browser, in two specific ways this plan met head-on.** Its selector engine parses a class and a `[data-*]` test and nothing else, and its `textContent` is an own property rather than a computed one. Both are documented in the harness already; what is new is that this plan's assertions are the first to be shaped by them. The resolution — write the row twice, once expressively for a browser and once longhand for CI, and say in the comment which is which and why — is the pattern any later plan asserting rendered text should copy.

**A real browser has still not run this suite in this phase.** 481 is a stub number. The three things a browser would settle are named as entries 6, 7 and 8 in the gate's "what this cannot reach" note: whether the taller strip still sticks on a short viewport, whether `≈`, `÷` and `–` reach a screen as glyphs, and whether a four-digit figure is legible from the back of a room.

## Next Phase Readiness

Plans 03-04 and 03-05 inherit:

- **The Layer C baseline to beat is 115**, and the floor is `> 105`. New rendered copy should move the harvest; if it does not, the copy is not reaching `#app`.
- **The interaction gate stands at 57 of 57.** Next free number is 58.
- **The assertion floors are 395 without a DOM and 481 with one.** `[S09.8]`'s DOM half is the shape to copy for any later plan asserting rendered text — the `typeof document === 'undefined'` skip, the `savedAll` bracket, and the `node ? node.textContent : '(no node)'` idiom throughout.
- **`#strip` is now built and flagged.** A later plan adding to it must go through `syncProjection`'s build branch or add its own hook; appending from outside `[S06]` is still impossible, because `SYNC_HOOKS` is a closure variable and `App.render` is frozen.
- **The reference material (REF-01, REF-02) is a different region.** `#refband` does not exist yet; research §5.3 places it inside `#board` before `#board-empty` with `grid-column:1 / -1`, and adding a shell id means growing `KNOWN_IDS` in the stub or the stub-drift gate turns red.

No blockers. STATE.md and ROADMAP.md deliberately untouched — the orchestrator owns those.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND
- `tests/selftest-node.cjs` — FOUND
- `.planning/phases/03-advisory-projection-reference-material/03-03-SUMMARY.md` — FOUND
- commit `f9ecb1b` — FOUND
- commit `356c718` — FOUND
- commit `02d1706` — FOUND
- `node tests/selftest-node.cjs` — exit 0, 395 passed / 0 failed, interaction gate 57 of 57, stub-drift 35 shell ids, Layer C 115
- full suite with a DOM — 481 passed / 0 failed, projection suite 51 rows
- `git status --short` — empty; every probe reverted

---
*Phase: 03-advisory-projection-reference-material*
*Completed: 2026-08-28*
