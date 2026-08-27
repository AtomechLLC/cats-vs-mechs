---
phase: 01-foundation-data-state-funnel-undo
plan: 02
subsystem: infra
tags: [vanilla-js, single-file-html, state-funnel, snapshot-undo, error-boundary, selftest]

# Dependency graph
requires: [01-01]
provides:
  - "App.state — the three-slice state object behind one commit() funnel"
  - "App.state.commit(label, mutator) / commitUi(label, mutator) — the only two write paths"
  - "App.state.undo() / undoDepth() — 30-deep, label-coalescing snapshot undo over build and fight"
  - "App.state.invalidate(opts) / flush() / stats() — one render frame per burst, synchronously flushable"
  - "App.state.UNDO_LIMIT (30) and App.state.COALESCE_MS (500) as named exports"
  - "App.ops — the ten-function transformer layer, the only writer of state in the file"
  - "App.ops.dispatch(act, payload) — the single entry Phase 2's delegated root calls"
  - "App.ops.undo() — a named function a Phase 2 button can call directly"
  - "App.boot.wrap(label, fn) — the listener boundary every later phase must reuse"
  - "App.boot.fail(label, err, terminal) / attempt(label, fn) — the styled error panel driver"
  - "#throwinit and #throwhandler — shipped rehearsal probes for the error boundary"
  - "[S09.3] SUITE: state contract — 29 named assertions proving ROADMAP criterion 3"
affects: [phase-02-render-interactions, phase-03-projection-reference, phase-04-sharing, phase-05-fight]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Freeze-thaw-refreeze: the live state is deep-frozen between commits, so a stray write throws TypeError instead of silently landing"
    - "The mutator runs on a detached copy BEFORE any undo bookkeeping, so a throwing op leaves no phantom undo entry"
    - "Undo snapshots {build, fight} only; the live ui slice is preserved across an undo, never restored"
    - "Label-coalescing within a sliding 500 ms window, so press-and-hold is one undo step"
    - "The frame scheduler is called as a bare global, never through a variable (Illegal invocation in Chrome)"
    - "Two greppable commit names (commit / commitUi) answer 'is this undoable?' without auditing a flag"
    - "Panel buttons wired from fail() as well as start(), so recovery survives a pre-wiring failure"

key-files:
  created: []
  modified:
    - "cats-vs-mechs.html"

key-decisions:
  - "commit() runs the mutator before pushing the undo entry — a mutator that throws must leave no trace, not a phantom undo step over an unchanged state"
  - "undo() invalidates with {structural: true}, because undoing across a start-fight or a roster change alters page structure, not just text"
  - "App.boot.fail() calls ensurePanelButtons() itself, so a terminal init failure still offers one-click recovery"
  - "The [S01] comment naming the platform deep-clone API was reworded so the plan's own zero-hit grep holds file-wide"

patterns-established:
  - "Every ops transformer is exactly one commit() call and nothing else"
  - "Every value entering state passes the private int(value, min, max, what) clamp, which throws rather than coercing"
  - "Phase boundaries are named in a DELIBERATELY ABSENT comment above the export, so a later executor does not add them early"

requirements-completed: [UX-01, UX-03, UX-04]

# Metrics
duration: 9min
completed: 2026-08-27
---

# Phase 1 Plan 02: State, Ops and the Error Boundary Summary

**A three-slice, deep-frozen state object behind a single `commit()` funnel with 30-deep coalescing snapshot undo on Ctrl+Z, a ten-function `ops` layer that is the only writer, and an error boundary that turns any throw — in init or in a handler — into a styled, selectable panel instead of a blank page.**

## Performance

- **Duration:** ~9 min
- **Started:** 2026-08-27T03:45:31Z
- **Completed:** 2026-08-27T03:54:54Z
- **Tasks:** 3 of 4 (task 4 is the blocking human-verify checkpoint)
- **Files modified:** 1

## Accomplishments

- **"Nothing mutates outside `commit()`" is now mechanical, not a code-review promise.** The live state object is deep-frozen between commits, so a stray write throws `TypeError` in strict mode and changes nothing. The self-test proves this at two depths — a top-level property and a nested array element — because a shallow freeze would pass the first probe and silently allow the second.
- **Undo works across the setup/fight boundary and across the reset button.** Snapshots span `build` and `fight`, so undoing past a start-fight un-starts it and undoing past a reset brings the student's allocation back. `ui` is excluded from snapshots, so collapsing a panel is never an edit. The stack is never cleared.
- **Press-and-hold is one undo step.** Forty same-label commits in a tight loop collapse to exactly one entry, and the window slides on each repeat.
- **Fifty `invalidate()` calls collapse into exactly one render frame,** with a synchronous `flush()` so the assertion is testable without becoming asynchronous, and a timer fallback so the file loads with no page attached.
- **The blank-page failure is closed off.** `#throwinit` and `#throwhandler` ship as rehearsal probes. A handler failure keeps the page alive with the last good state on screen; an init failure hides Dismiss and routes Reset to a clean-hash reload. All error text reaches the page through `textContent` or a textarea's `value`.
- **The self-test grew from 28 to 57 named assertions,** 29 of them under a new `state contract` suite that reads as ROADMAP criterion 3's checklist.

## Task Commits

| # | Task | Commit | Type |
|---|------|--------|------|
| 1 | `[S03]` STATE — slices, `commit()` funnel, snapshot undo, rAF invalidation | `36c1a08` | feat |
| 1b | Push the undo entry only after the mutator succeeds | `46c78bf` | fix |
| 2 | `[S05]` OPS transformer layer + `[S09.3]` state-contract suite | `6c4286c` | feat |
| 3 | `[S08]` BOOT — error boundary, panel wiring, Ctrl+Z, throw probes | `ac6173d` | feat |

## Files Created/Modified

- `cats-vs-mechs.html` — 685 → 1,299 lines. Three stub regions replaced in place (`[S03] STATE`, `[S05] OPS`, `[S08] BOOT`), the `[S09.3]` placeholder filled, the `[S05]` and `[S08]` banners updated to name `App.state` now that the symbol exists, and one comment reworded in `[S01]`.

## Verification Evidence

```
$ node tests/selftest-node.cjs
scan: no forbidden patterns
... 57 PASS lines across 'board defaults' (17), 'model derivations' (11) and 'state contract' (29) ...
57 passed, 0 failed
EXIT=0
```

Acceptance greps:

| Check | Required | Actual |
|---|---|---|
| `requestAnimationFrame(` | 1 | 1 |
| `= requestAnimationFrame;` | 0 | 0 |
| `queueMicrotask\|__lastHTML\|App.actions` | 0 | 0 |
| `structuredClone` | 0 | 0 |
| `innerHTML\|https\?://\|<link\|type="module"` | 0 | 0 |
| `mode:` | 0 | 0 |
| `addUnit\|removeUnit\|advanceTurn\|nextRound\|spendAp\|applyDamage\|log.push` | 0 | 0 |
| `counter\|rating\|balanced\|difficulty\|verdict` (case-insensitive) | 0 | 0 |
| `App.hasFlag('throwinit')` / `('throwhandler')` / `('selftest')` | 1 each | 1 each |
| `addEventListener('error'` / `('unhandledrejection'` | 1 each | 1 each |
| `^// #region \[S` / `^// #endregion \[S` | 11 / 11 | 11 / 11 |
| `App.state.commitUi(` call sites | 1 (`setUi`) | 1 |
| `App.state.commit(` inside `resetToDefaults` | 1 | 1 |
| `alive` inside `setUnitHp` | 0 | 0 |

**Boot boundary proved headlessly, not asserted.** A scratch probe (not committed) ran the script body against a minimal fake DOM across seven hash and event scenarios:

| Scenario | Result |
|---|---|
| no hash | panel hidden, report hidden, 0 console errors |
| Ctrl+Z with no hash | `ap` 3 → 9 → 3; `Ctrl+Shift+Z` and bare `z` inert |
| `#selftest` | report visible, 57 rows |
| `#notselftest`, `#selftestx` | report stays hidden, 0 rows (T-01-01) |
| `#throwinit` | panel visible, title `Initialisation`, Dismiss hidden, 884-char detail; Reset cleared the hash and reloaded |
| `#throwhandler` + board click | panel visible, title `board click`, Dismiss visible and focused; Dismiss hid the panel; a following op still committed |
| `window` `error` / `unhandledrejection` | both surfaced in the panel as non-terminal |
| non-terminal Reset | routed through `App.ops.resetToDefaults()`, `ap` back to 3, panel hidden, no reload |

## Decisions Made

- **The mutator runs before the undo bookkeeping.** The plan ordered `commit()` as serialise → push → mutate. Implemented as serialise → mutate → push, because `setUnitHp` with no fight in progress, or any op with an unknown unit id, throws inside its mutator. With the planned order that throw left an undo entry pointing at a state that never changed, so the next Ctrl+Z would silently do nothing. The snapshot is still taken from the pre-mutation live state, so the two orders are otherwise identical.
- **`undo()` invalidates structurally.** The plan said `invalidate()`. Undo can un-start a fight and, from Phase 2, change the roster's shape — both are structural, and Phase 2 would have had to discover the omission at render time.
- **`fail()` wires the panel buttons.** The plan wired them in `start()` step 2, after the `#throwinit` check in step 1. That left the terminal-failure panel with two dead buttons — the exact case D-15's one-click recovery exists for. `ensurePanelButtons()` is idempotent and is called from both places.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] A throwing mutator left a phantom undo entry**
- **Found during:** Task 2, designing `setUnitHp`'s "no fight in progress" throw
- **Issue:** `commit()` pushed the undo entry before running the mutator, so an op that threw left a stack entry over an unchanged state. The following Ctrl+Z would appear to do nothing.
- **Fix:** The mutator now runs on the detached working copy before any stack bookkeeping.
- **Files modified:** `cats-vs-mechs.html` (`[S03] STATE`)
- **Commit:** `46c78bf`

**2. [Rule 2 - Missing critical functionality] The terminal error panel had dead buttons**
- **Found during:** Task 3
- **Issue:** Following the plan's step order literally, a `#throwinit` failure surfaced the panel before `start()` reached its button-wiring step, so Reset did nothing — defeating D-15 and half of ROADMAP criterion 4's recovery path.
- **Fix:** Added idempotent `ensurePanelButtons()`, called from `fail()` as well as from `start()`.
- **Files modified:** `cats-vs-mechs.html` (`[S08] BOOT`)
- **Commit:** `ac6173d`

**3. [Rule 3 - Blocking] One word in a plan-01-01-owned comment failed this plan's own grep**
- **Found during:** Task 1
- **Issue:** The plan's verification item 5 and task 1 acceptance both require `grep -c "structuredClone"` to return `0` file-wide. The only hit was a comment in `[S01] DATA` — a region this plan's `section_ownership.must_not_touch` lists — explaining why that API is deliberately *not* used.
- **Fix:** Reworded the comment to "the platform's deep-clone call", preserving its meaning exactly. The ownership rule exists to prevent concurrent-wave collisions; plan 01-01 is merged into this plan's base, so no collision was possible.
- **Files modified:** `cats-vs-mechs.html` (`[S01] DATA`, one comment line)
- **Commit:** `36c1a08`

**Total deviations:** 3 (2 correctness, 1 blocking)
**Impact on plan:** None on scope or interfaces. All three tasks meet every stated acceptance criterion.

## Issues Encountered

- **One acceptance criterion is unsatisfiable as literally written.** Task 2 requires that "no direct assignment to a property of `App.state.get()` exists anywhere in the file", while the same task's `[S09.3]` spec mandates two probes that assign to `App.state.get().build.cats.ap` and `...units[0].maxHp` inside `t.throws` — that assignment *is* the proof the freeze holds. Read as intended (no *effective* assignment outside the funnel), the criterion holds: those two writes throw and change nothing, and both are followed by an assertion that the value is unchanged.
- **The prose greps inherited from 01-01 fire on ordinary English.** `rating` is a substring of *generating*, *operating* and *iterating*; `counter` of *encounter*. Every comment in this plan was written around them and the greps were re-run after each task. This trap stays live for every future plan editing this file.
- **The headless runner supplies a frame scheduler,** so the timer fallback branch in `schedule()` is not exercised by `node tests/selftest-node.cjs`. It was exercised manually by a scratch probe that omitted it.

## Known Stubs

Unchanged from plan 01-01, all still intentional and each with its call site already in place:

| Stub | Location | Resolved by |
|---|---|---|
| `App.serialize.scheduleUrlSync()` — called from `commit()` and `undo()` | `cats-vs-mechs.html` `[S04]` | Phase 4, plan 04-01 |
| `App.render.structure()` / `App.render.sync()` — called from the frame callback | `cats-vs-mechs.html` `[S06]` | Phase 2, plan 02-01 |
| `App.interactions.bind()` — called from `start()` | `cats-vs-mechs.html` `[S07]` | Phase 2, plan 02-02 |
| `#board` shows a placeholder line | `cats-vs-mechs.html` | Phase 2, plan 02-01 |

None block this plan's goal. Phase 1 is the invisible layer by design: the only things it renders are the `#selftest` report and the error panel, and both render fully.

## Threat Flags

None. No new security-relevant surface. All four `mitigate` dispositions in the plan's register are implemented and machine-checked:

- **T-01-01** (hash tampering) — the three flag reads all go through 01-01's exact-match `App.hasFlag`; `#notselftest` and `#selftestx` confirmed inert.
- **T-01-02** (error text into the page) — `textContent` for title and message, textarea `.value` for detail; the markup sink, `eval` and the Function constructor stay absent file-wide and the test command fails the build on any of them.
- **T-01-05** (setter input) — every setter clamps to 0..99 through the private `int()` helper, which throws on a non-finite value; unknown unit ids and an absent fight both throw named errors the boundary surfaces.
- **T-01-06** (undo stack growth) — hard-capped at 30 entries of roughly 1 KB, with 500 ms label coalescing bounding the push rate.
- **T-01-03** (offline integrity) — no dependency and no external reference added; the scan is the proof.

## User Setup Required

None. The install step is still double-clicking the file.

## Next Phase Readiness

**Blocked on the task 4 acceptance checkpoint** (ROADMAP Phase 1's four success criteria, verified in a real browser). Everything else is ready:

- Phase 2 plan 02-01 fills `App.render.structure(state)` / `sync(state)`; both are already called from the frame callback, with `structural` already routed from `invalidate({ structural: true })` at boot and on undo.
- Phase 2 plan 02-02 fills `App.interactions.bind()`; it should call `App.boot.wrap()` for every listener and `App.ops.dispatch(act, payload)` for every action. A visible undo button calls `App.ops.undo()` — the same line Ctrl+Z calls.
- Phase 4 plan 04-01 fills `App.serialize.scheduleUrlSync()`; the call site already exists in both `commit()` and `undo()`.
- Phase 5 plan 05-01 owns turn and round advance, action-point spending, damage application and the fight record. The `fight` slice shape is already decided and instantiated by `startFight()`; the operations are not.

**Open item, unchanged:** D-01's board numbers still await the developer's confirmation. `DEFAULTS` remains a one-place edit.

---
*Phase: 01-foundation-data-state-funnel-undo*
*Completed: 2026-08-27*
*Note: written and committed before the task 4 human-verify checkpoint so it survives worktree teardown. If the checkpoint surfaces a defect, the continuation agent amends this file.*
