---
phase: 01-foundation-data-state-funnel-undo
verified: 2026-08-26T22:10:00Z
status: passed
score: 21/21 must-haves verified
overrides_applied: 0
---

# Phase 1: Foundation — Data, State Funnel & Undo Verification Report

**Phase Goal:** The artifact opens offline as a self-proving skeleton — Workshop 16 data frozen, every
mutation routed through one commit path, undo working, errors visible — with no UI yet.
**Verified:** 2026-08-26T22:10:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Method

This is a goal-backward verification, not a re-derivation of `01-REVIEW.md`. The review (3 critical, 11
warning, 8 info) was read in full and several of its most consequential findings were independently
reproduced against the shipped `cats-vs-mechs.html` in a fresh Node `vm` sandbox (not trusted from the
review text alone). `node tests/selftest-node.cjs` was run directly: `57 passed, 0 failed`, exit 0,
`scan: no forbidden patterns` — matching both SUMMARY.md's claim and the `<acceptance_record>` block
appended to `01-02-PLAN.md`. Per the launching agent's instruction, ROADMAP criterion 1 and the
browser-only portions of criteria 2 and 4 are treated as human-verified from that acceptance record and
were not re-litigated here; every other claim was checked directly against the file.

## Goal Achievement

### Observable Truths — ROADMAP Success Criteria

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Double-click opens offline, styled, zero console errors, zero outbound requests | ✓ VERIFIED (human-verified) | `<acceptance_record>` in `01-02-PLAN.md`: networking disconnected, opened from file manager, DevTools Console/Network inspected clean. `tests/selftest-node.cjs`'s forbidden-pattern scan independently confirms zero `fetch(`, `XMLHttpRequest`, `<link`, ` src=`, `@import`, `url(`, `https?://` in the file. |
| 2 | `#selftest` shows readable pass/fail report confirming Workshop 16 defaults exactly | ✓ VERIFIED | `node tests/selftest-node.cjs` → 17 `board defaults` assertions pass, including `cats actions` (Slash/1/[]), `Hairball/0/['slowdown']`, `Screech/0/['confuse']`, `mechs actions` (Fly/0/['evade'], Lasers/3/['range'], Recharge/0/['shield']), `cats unit count`=9/`maxHp`=3, `mechs unit count`=3/`maxHp`=6/`shield`=3, faction `ap`=3 both sides. Human acceptance record confirms the same in-browser. |
| 3 | State contract: integers-only, JSON-clonable, build/fight/ui split; nothing mutates outside `commit()`; `alive` is its own flag; undo restores ≥30 states; burst coalesces to one entry | ✓ VERIFIED, with a caveat (see Carry-Forward Risk below) | All 29 `state contract` self-test assertions pass, including the two-depth `frozen between commits` probe (top-level and nested-array write, both throw and leave the value unchanged — independently re-verified below). `undo restores 30 states in order`, `burst coalesces to one entry`, `undo crosses the fight boundary`, `ui changes are not undoable` all pass. The funnel itself is intact: every `[S05] OPS` transformer writes exclusively through `App.state.commit`/`commitUi`, confirmed by direct code read — there is no direct assignment to `App.state.get()`'s properties anywhere in the file. |
| 4 | Throw in init and throw in a handler each surface a styled panel, never a blank page | ✓ VERIFIED (human-verified) | `<acceptance_record>`: `#throwinit` → `Initialisation` panel, Dismiss hidden, selectable detail; `#throwhandler` + board click → `board click` panel, page stays alive, Dismiss recovers. Code read of `[S08] BOOT` confirms `fail()`, `attempt()`, `wrap()` exist exactly as documented, every listener except the two `window` safety nets is wrapped, and both probe hash flags (`#throwinit`, `#throwhandler`) are present exactly once and gated through the exact-match `App.hasFlag`. |

**Score:** 4/4 ROADMAP truths verified.

### PLAN Frontmatter Must-Haves

All 7 truths from `01-01-PLAN.md` and all 10 truths from `01-02-PLAN.md` were checked against the
self-test's 57 passing assertions and, for the load-bearing ones, independently reproduced in a fresh
`vm` sandbox rather than trusted from the harness alone.

| # | Truth (paraphrased) | Status | Evidence |
|---|---|---|---|
| 1 | Double-click opens styled page, 0 console errors, 0 outbound requests | ✓ VERIFIED (human) | See ROADMAP #1 |
| 2 | No hash → no self-test report | ✓ VERIFIED | Static shell has `hidden` on `#selftest-report`; `[S10] LAUNCH`/`[S08] start()` only calls `App.selftest.report` behind `App.hasFlag('selftest')`. Human acceptance confirms in-browser. |
| 3 | `#selftest` renders readable styled report, every default assertion named | ✓ VERIFIED | See ROADMAP #2 |
| 4 | Report confirms board loads exactly as specified | ✓ VERIFIED | See ROADMAP #2 |
| 5 | `DEFAULTS` deep-frozen: nested write throws, unchanged | ✓ VERIFIED | Self-test `DEFAULTS is deep-frozen` + `DEFAULTS survived the frozen write` both pass. |
| 6 | `defaults()` fresh deep copy every call; mutation never reaches `DEFAULTS` | ✓ VERIFIED | Self-test `defaults() is a fresh deep copy`, `a mutated copy leaves the next copy alone`, `a mutated copy leaves DEFAULTS alone` all pass. |
| 7 | `App.model` derivations pure, take state as argument, integers | ✓ VERIFIED | `grep -c "App\.state" ` inside `[S02]` is 0; self-test `model is pure`, `all derivations return integers` pass. |
| 8 | State is one 3-slice object, integers/booleans/strings/arrays only, JSON round-trips unchanged | ✓ VERIFIED for the documented write paths; ⚠ not true under adversarial input to `setUi` — see Carry-Forward Risk WR-02 | Self-test `three slices`, `integers only`, `json clonable` pass for all shipped ops. Independently reproduced: `App.ops.setUi('anything', {deep:{nested:true}})` and `App.ops.setUi('fn', function(){})` both succeed with no validation, transiently storing a non-primitive/live-function value in `ui` until the next `commit()`'s `thaw()` silently drops it. `setUi` is not exercised by any `[S09.3]` assertion. |
| 9 | Nothing mutates state outside `commit()`; live object deep-frozen between commits | ✓ VERIFIED for external writes; ⚠ boundary itself under-validates internal writes — see Carry-Forward Risk CR-01/CR-02 | Independently reproduced both frozen-guard probes: a top-level write (`App.state.get().build.cats.ap = 99`) and a nested-array write (`App.state.get().build.cats.units[0].maxHp = 1`) both throw `TypeError` and leave the value unchanged. Every `[S05] OPS` transformer routes exclusively through `App.state.commit`/`commitUi` — confirmed by reading every function body. The funnel is not bypassed. Separately (not a funnel bypass, but inside it): `App.ops.setFactionAp('__proto__', 42)` reproducibly writes `Object.prototype.ap = 42` because `side` is never validated against `['cats','mechs']` — independently reproduced, matching CR-02 exactly. |
| 10 | `alive` is its own boolean; 0 HP unit not auto-dead, full-HP unit can be marked dead | ✓ VERIFIED | Self-test `alive independent of hp`, `a full-health unit can be ruled dead`, `aliveCount reads the flags, not the hit points` all pass; `App.model.aliveCount` reads the flag, never infers from `hp`. |
| 11 | Undo restores ≥30 prior states in order; 31st undo past cap is a no-op | ✓ VERIFIED | Self-test `undo restores 30 states in order`, `undo cap is a no-op, not an error` pass. |
| 12 | Burst of rapid same-label changes collapses to one undo entry | ✓ VERIFIED | Self-test `burst coalesces to one entry`, `one undo restores the pre-burst value` pass. |
| 13 | Undo crosses setup/fight boundary | ✓ VERIFIED | Self-test `undo crosses the fight boundary` passes. |
| 14 | `ui`-slice changes never land on the undo stack | ✓ VERIFIED for the shipped `setUi('kbdNav', …)` path; same caveat as #8 for arbitrary keys | Self-test `ui changes are not undoable` passes. `undoDepth()` unaffected by `setUi` calls regardless of key/value validity, confirmed by direct read of `commitUi` (never pushes to `past`). |
| 15 | Ctrl+Z undoes; `ops.undo()` is a named function a button can call directly | ✓ VERIFIED | `App.ops.undo` is a top-level exported function calling `App.state.undo()`; the keydown handler body contains only `App.ops.undo()` on its own line, no undo logic inline. Human acceptance confirms Ctrl+Z works with no console errors. |
| 16 | Throw inside init surfaces styled panel naming what failed | ✓ VERIFIED (human) | See ROADMAP #4 |
| 17 | Throw inside a handler surfaces same panel, page stays alive, last good state on screen | ✓ VERIFIED (human) | See ROADMAP #4 |

**Score:** 17/17 plan-level truths verified (2 carry a documented caveat, not a failure — see below).

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `cats-vs-mechs.html` | Whole skeleton, `[S01] DATA`, frozen `DEFAULTS` | ✓ VERIFIED | 1,299 lines; `deepFreeze`, one `DEFAULTS` literal, `--accent:#5cc8ff` present |
| `cats-vs-mechs.html` `function commit` | Single mutation funnel | ✓ VERIFIED | `function commit(label, mutator)` at `[S03] STATE`, exactly the freeze-thaw-refreeze cycle described |
| `cats-vs-mechs.html` `App.ops` | Only writer of state | ✓ VERIFIED | 10 exported functions, all routing through `App.state.commit`/`commitUi` |
| `cats-vs-mechs.html` `App.boot.wrap` | Error boundary | ✓ VERIFIED | `wrap`, `attempt`, `fail`, `start` all present and match documented contracts |
| `cats-vs-mechs.html` `[S09.3]` | Machine-checked state contract assertions | ✓ VERIFIED | 29 named assertions, all passing |
| `tests/selftest-node.cjs` | Dev-only headless runner | ✓ VERIFIED | Runs, scans forbidden patterns, executes `App.selftest.run()` in a DOM-less sandbox, exits 0 |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `[S05] OPS` | `App.state.commit` | every transformer | ✓ WIRED | Confirmed by reading all 8 mutating transformers |
| `[S03] STATE commit()` | `App.serialize.scheduleUrlSync()` | declared no-op call site | ✓ WIRED | Called once per `commit()`, once per `undo()` |
| `[S03] STATE invalidate()` | `App.render.structure`/`sync` | one rAF flush per burst | ✓ WIRED | `frame()` calls both; both are declared Phase-2 no-ops today |
| `[S08] BOOT keydown` | `App.ops.undo()` | one-line caller | ✓ WIRED | Confirmed — no undo logic in the handler body |
| `[S08] BOOT fail()` | `#err-panel`/`#err-title`/`#err-message`/`#err-detail` | `textContent`/`.value`, never `innerHTML` | ✓ WIRED | `grep -c "innerHTML"` returns 0 file-wide; detail uses `.value` |

### Independent Reproduction of Review Findings

Per the launching agent's instruction, findings that bear on criterion 3's "nothing mutates outside
`commit()`" claim were reproduced directly rather than taken on the review's word:

```
setFactionAp('__proto__', 42):
  before: ({}).ap = undefined
  after:  ({}).ap = 42, ([]).ap = 42, build.ap = 42, Object.prototype.hasOwnProperty('ap') = true
  → CR-02 confirmed live against the shipped file.

setUi('fn', function(){}):
  ui.fn is a live function, typeof 'function', survives until the next commit(),
  then silently vanishes (JSON.stringify drops function-valued properties).
  → WR-02 confirmed live against the shipped file.

App.selftest.run() side effects:
  undoDepth 0 → 30 after run(); ui.kbdNav false → true; one Ctrl+Z after #selftest
  moves build.cats.ap from the shipped default 3 to 4 (a perf-loop leftover).
  → WR-03 confirmed live against the shipped file.

frozen-guard probes (top-level and nested-array write): both throw TypeError,
both leave the value unchanged.
  → Plan's must-have #9 (frozen between commits) confirmed independently, not just
    via the self-test's own PASS row.
```

**Verdict on whether these undercut criterion 3:** No. `App.data.deepFreeze` between commits still
makes every external write throw and change nothing — that mechanism is real and independently
confirmed. CR-02's prototype pollution and WR-02's arbitrary `ui` values happen *inside* a `commit()`/
`commitUi()` call, not around it — the funnel is not bypassed, its input validation is incomplete. That
is a distinction with a difference for Phase 1's literal goal ("every mutation routed through one commit
path") but not for the deeper promise the code's own comments make ("OPS is the validation boundary...
everything a handler supplies, and from Phase 4 everything a pasted build code supplies, comes through
here"). WR-11 (`[S03]` calling `App.data` at IIFE-body-evaluation scope, contradicting the file's own
"reference other sections only at call sites" rule) was also confirmed by direct read at
`cats-vs-mechs.html:355` — it is real, but it is a latent ordering fragility, not a mutation-safety
defect, and the fixed region order (`[S01]` before `[S03]`, documented as never-reorderable) means it
does not fire today.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| ALLOC-08 | 01-01 | Cats/Mechs load prebuilt with Workshop 16 board's actions, damage, keywords, starting allocation | ✓ SATISFIED | 17 `board defaults` assertions pass; marked Complete in `REQUIREMENTS.md` |
| UX-01 | 01-02 | Ctrl+Z undo, ~30 deep, press-and-hold coalesced | ✓ SATISFIED | `UNDO_LIMIT = 30`, coalescing verified; marked Complete in `REQUIREMENTS.md` |
| UX-03 | 01-02 | Runtime error surfaces styled panel, not blank page | ✓ SATISFIED | Human-verified `#throwinit`/`#throwhandler`; marked Complete in `REQUIREMENTS.md` |
| UX-04 | 01-01 | Ships as one self-contained HTML file, offline, no build step, no network, no dependencies | ✓ SATISFIED | Forbidden-pattern scan zero hits; marked Complete in `REQUIREMENTS.md` |

No orphaned requirements — `REQUIREMENTS.md`'s traceability table maps exactly these four to Phase 1,
all four appear in one of the two plans' `requirements:` frontmatter, and all four are marked Complete
consistently in both the plan frontmatter and `REQUIREMENTS.md`.

### Anti-Patterns Found

No `TBD`/`FIXME`/`XXX` markers in `cats-vs-mechs.html` or `tests/selftest-node.cjs`. No `TODO`/`HACK`/
`PLACEHOLDER` comments. No `innerHTML`/`eval(`/`new Function` (machine-checked, zero hits). The three
`[S04]`/`[S06]`/`[S07]` no-op stubs (`App.serialize.scheduleUrlSync`, `App.render.structure/sync`,
`App.interactions.bind`) are declared, named, and owned by later phases exactly as the plan specifies —
not undeclared stubs.

The code review's 3 critical + 11 warning findings are real defects (independently reproduced above for
the ones bearing on Phase 1's stated truths) but are validation/robustness gaps in code that correctly
implements the funnel, undo and error-boundary architecture the phase goal calls for. They are listed
below as carry-forward risk, not phase-blocking gaps.

### Human Verification Required

None outstanding. All human-verification items for this phase were already executed and recorded in
the `<acceptance_record>` block appended to `01-02-PLAN.md` (developer typed "approved" on
2026-08-27, with `node tests/selftest-node.cjs` re-run at acceptance: `57 passed, 0 failed`).

## Carry-Forward Risk (does not block Phase 1, must be triaged before Phase 2/4 land untrusted input)

These are real, independently-reproduced defects from `01-REVIEW.md`. None of them cause a Phase 1
must-have or ROADMAP success criterion to fail — the funnel, undo, and error boundary all work as
specified. They matter because `[S05] OPS`'s own comments describe it as "the validation boundary" for
"everything a handler supplies — and, from Phase 4, everything a pasted build code supplies" — a
promise the current implementation does not keep.

1. **CR-01 — `int()` cannot reject a non-integer.** `Math.trunc()` coerces before `Number.isFinite()`
   checks, so `null`, `""`, `false`, `"7"`, `[5]` all silently become valid integers instead of
   throwing. The file's own comment states the opposite design intent ("reject rather than silently
   coerce"). Cheap to fix now (`typeof value !== 'number' || !Number.isInteger(value)` before
   truncating); expensive to retrofit once Phase 2 wires real inputs to these setters.
2. **CR-02 — `side` is never validated; `setFactionAp('__proto__', n)` pollutes `Object.prototype`.**
   Independently reproduced above. `Object.prototype` is not frozen, so this is a real, page-wide
   pollution vector reachable through the sanctioned `commit()` path. Should be closed before Phase 2
   wires a stepper control to `setFactionAp`/`setUnitMaxHp`/`setUnitHp`/`setAlive`.
3. **CR-03 — `frame()` clears the `structural` flag before the rebuild runs**, so one throwing
   `App.render.structure()` call permanently desyncs the DOM from state with no retry. Currently inert
   because `[S06]` is a no-op stub; becomes live the moment Phase 2 plan 02-01 fills it in. Flagging now
   because the fix is trivial (move the flag-clear after the call) and free today.
4. **WR-02 — `setUi()` has no key allowlist and no value-type check**, independently reproduced storing
   a plain object and a live function in the frozen `ui` slice until the next `commit()` silently drops
   it. Breaks the "integers, booleans, short strings, arrays only" state-shape promise under adversarial
   input to this one function.
5. **WR-03 — `App.selftest.run()` mutates the live singleton and leaves side effects**, independently
   reproduced: `undoDepth()` 0→30, `ui.kbdNav` flipped to `true`, and one Ctrl+Z after opening
   `#selftest` moves `build.cats.ap` from the shipped default (3) to a perf-loop leftover (4). For a
   teaching artifact where an instructor may open `#selftest` to demo the report and then continue into
   the workshop on the same tab, this is a real "the board changed under me" trap. Recommend fixing
   before the artifact is used with students, even though it doesn't fail any Phase 1 success criterion.
6. **WR-11 — `[S03] STATE` calls `App.data.deepFreeze(App.data.defaults())` at IIFE-body-evaluation
   scope**, contradicting the file's own stated rule that cross-section references happen only at call
   sites. Confirmed at `cats-vs-mechs.html:355`. Does not fire today because region order is fixed and
   `[S01]` precedes `[S03]`, but it is a real, verified inconsistency between the file's stated
   architecture invariant and its own code.
7. Also present per the review and worth tracking, not independently re-run here: WR-01 (URL-sync-before-
   render ordering could strand a committed-but-unrendered state if `scheduleUrlSync` ever throws),
   WR-04 (Ctrl+Z has no focused-input guard and will fight native textarea/input undo the moment Phase 2
   ships editable fields), WR-08 (`t.eq` treats "both sides `undefined`" as a pass), WR-09 (a wall-clock
   perf assertion ships inside the harness), WR-10 (the forbidden-pattern scan is line-scoped and its
   sink list has gaps).

**Recommendation:** These do not block proceeding to Phase 2. CR-01, CR-02 and WR-02 should be closed
before Phase 2 plan 02-02 wires real handler input to `App.ops.dispatch`, since that is precisely the
boundary they weaken. WR-03 should be closed before the artifact is handed to students. A short
follow-up plan (or folding the fixes into Phase 2 plan 02-02's task list) is the appropriate vehicle —
this verification does not gate Phase 1 on it because Phase 1's own stated goal and success criteria are
met.

### Gaps Summary

No gaps against Phase 1's stated goal or success criteria. All four ROADMAP truths, all 17 plan-level
must-have truths, all required artifacts, and all key links are verified — 4 by direct human acceptance
already on record, the remainder by the automated self-test (57/57 passing) cross-checked with
independent reproduction in a fresh `vm` sandbox for the claims most likely to be overstated (the frozen
guard, the funnel-only-writer claim, and the specific review findings the launching agent flagged for
scrutiny). The code review's critical and warning findings are real but sit in the input-validation
layer around the funnel, not in the funnel, undo, or error-boundary mechanisms the phase goal names —
they are recorded above as carry-forward risk with a specific recommendation for when to close them.

---

_Verified: 2026-08-26T22:10:00Z_
_Verifier: Claude (gsd-verifier)_
