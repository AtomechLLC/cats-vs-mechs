---
phase: 01-foundation-data-state-funnel-undo
fixed_at: 2026-08-26T22:40:00Z
review_path: .planning/phases/01-foundation-data-state-funnel-undo/01-REVIEW.md
iteration: 1
findings_in_scope: 14
fixed: 14
skipped: 0
status: all_fixed
---

# Phase 1: Code Review Fix Report

**Fixed at:** 2026-08-26T22:40:00Z
**Source review:** `.planning/phases/01-foundation-data-state-funnel-undo/01-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 14 (CR-01..CR-03, WR-01..WR-11)
- Fixed: 14
- Skipped: 0
- Info findings (IN-01..IN-08): out of scope, untouched

**Gate status after the last commit:**
- `node tests/selftest-node.cjs` — exit 0, **81 passed, 0 failed** (was 57/0), forbidden-pattern scan clean, new dev-side perf gate green.
- `grep -ci "counter|rating|balanced|difficulty"` — 0
- `grep -c "verdict|balanced|rating|difficulty"` — 0
- `grep -c "innerHTML|eval(|new Function|https?://|<link|type=\"module\"|queueMicrotask|structuredClone"` — 0
- Boot-path smoke with a stub DOM and `#selftest`: no error panel, 81 green rows rendered, one keydown listener bound.

All work was done in an isolated git worktree; `master` was fast-forwarded to the
fix commits and the worktree and its temp branch were removed.

## Fixed Issues

### CR-01: `int()` truncates before it validates

**Files modified:** `cats-vs-mechs.html`
**Commit:** `0cdaa9b`
**Applied fix:** Type and integer tests now run before any arithmetic, exactly as
suggested. `Math.trunc()` performed a full `ToNumber` coercion, so `null`, `''`,
`false`, `'7'`, `[5]` and `3.9` all reached state as valid integers. Added six
assertions: fraction, empty string, `null` and numeric string all refused, plus
"the board was left alone" and "no undo entry was created".

The review's note about a DOM `value` string is recorded in the comment rather
than implemented — `[S07]` is a Phase 2 stub, so there is no call site to convert
at yet. The comment states where the conversion belongs when Phase 2 arrives.

### CR-02: `side` is never validated — prototype pollution

**Files modified:** `cats-vs-mechs.html`
**Commit:** `919058c`
**Applied fix:** `SIDES` allowlist plus `requireSide()`, called at the top of
`setFactionAp`, `setUnitMaxHp`, `setUnitHp` and `setAlive`. Named `requireSide`
rather than `side` so the ops keep their `side` parameter name and nothing
shadows anything. The call sits **outside** `App.state.commit()`, so a bad side
throws before the funnel is entered and leaves no phantom undo step. Five
assertions added, including `t.ok('nothing leaked onto the shared object
prototype', ...)` — deliberately `t.ok` and not `t.eq(..., undefined)`, because
after WR-08 an assertion with `undefined` on both sides is now reported as
failing.

`dispatch()` was not separately guarded: every act it routes to already guards
itself, so a second check would be a second thing to keep in step.

### CR-03: `frame()` consumes the `structural` flag before the rebuild

**Files modified:** `cats-vs-mechs.html`
**Commit:** `3a013e8`
**Applied fix:** The flag is cleared only after `App.render.structure()` returns,
and `schedule()` now wraps the frame in `App.boot.wrap('Render frame', …)` so a
render throw reaches the styled panel instead of the browser as an uncaught
error. `flush()` still calls `frame()` directly and stays unguarded, so the
self-test sees throws rather than swallowing them.

Verified with a probe that swaps the frozen render stub for a throwing one: a
failing `structure()` followed by a later commit now calls `structure()` twice
(before: once, never retried).

### WR-01: URL sync scheduled before the render

**Files modified:** `cats-vs-mechs.html`
**Commit:** `5326bc8`
**Applied fix:** `try { App.serialize.scheduleUrlSync(); } finally { invalidate(); }`
in both `commit()` and `undo()`. Verified by substituting a throwing
`scheduleUrlSync`: the commit still rethrows (so the error boundary still sees
it), `ap` still moves 3 → 9, and a frame is now pending where before there was
none.

### WR-02: `setUi()` accepts any key and any value

**Files modified:** `cats-vs-mechs.html`
**Commit:** `29cb584`
**Applied fix:** `UI_KEYS` allowlist plus a boolean / integer / string value
check, as suggested. Three assertions added, including one that pins
`Object.keys(state.ui)` so a future key has to be declared rather than
discovered.

### WR-03: `App.selftest.run()` mutates the live board

**Files modified:** `cats-vs-mechs.html`
**Commit:** `3ff8bf5`
**Applied fix:** Added `App.state.restore(snapshotJson)` — the one non-op writer
in the file — and named it explicitly in **both** the `[S03]` and `[S05]`
banners, since `[S05]`'s banner previously claimed "no exceptions". The suite now
snapshots the whole state (`build`, `fight`, `ui`) as its first act and hands all
three back as its last, and its opening assertion checks the shape of `build`
instead of exact equality with the shipped defaults, so a Phase 4 shared link
will not paint the report red.

Verified with a before/after probe:

| | before | after |
|---|---|---|
| `undoDepth` across `run()` | 0 → 30 | 0 → 0 |
| `ui` across `run()` | `kbdNav:false` → `true` | unchanged |
| one Ctrl+Z after `#selftest` | `cats.ap = 4` (a timing-loop value) | `cats.ap = 3` |
| `run()` twice in a row | 57/57 then **56/57** | 81/81 then 81/81 |

`restore()` clears the undo stack rather than restoring it. In practice
`#selftest` is read from the hash at boot, so the stack is empty anyway; handing
back thirty entries of test values was the failure being fixed.

### WR-04: Ctrl+Z has no target guard

**Files modified:** `cats-vs-mechs.html`
**Commit:** `b7b15d3`
**Applied fix:** Early return for `INPUT`, `TEXTAREA` and `isContentEditable`
targets, before `preventDefault()`. Verified with a probe that drives the real
registered listener: text targets are not prevented and leave state untouched; a
board target still calls `preventDefault()` and still undoes (ap 8 → 3). Board
undo is unchanged, which was the constraint.

### WR-05: `startFight()` silently discards an in-progress fight

**Files modified:** `cats-vs-mechs.html`
**Commit:** `06b34da`
**Applied fix:** Guard inside the mutator, so the refusal runs on the detached
copy and leaves no undo entry. Three assertions: the refusal, the untouched undo
depth, and the untouched round.

### WR-06: `apSpent()` returns a negative number

**Files modified:** `cats-vs-mechs.html`
**Commit:** `3871ad6`
**Applied fix:** `Math.max(0, …)` at the derivation, plus the suggested
assertion.

### WR-07: shield has no representation in the fight slice — **fixed, deliberately scoped**

**Files modified:** `cats-vs-mechs.html`
**Commit:** `f20d2da`
**Applied fix (state shape only):** `sideFromBuild` now carries
`shield: u.shield` into the fight slice, the `[S03]` banner documents the shape as
`{ id, hp, shield, alive }` and states the intent, and `[S02]`'s `unitEhp` gains a
comment naming the same intent — the two sections previously disagreed and
neither said why. Added an assertion that the fight opens at the projected eHP
(mechs: fight pool 27 = `factionEhp(build.mechs)` 27; previously 18 vs 27).

**Deliberately NOT applied:** `setUnitShield(side, unitId, shield)`. Spending a
shield point is damage application, which `[S05]`'s own "DELIBERATELY ABSENT"
list assigns to Phase 5 plan 05-01 — the phase that has a surface to spend it
from. The field ships now with no writer for exactly the reason `log: []` already
does: to lock the shape before Phase 2 renders it and Phase 4 encodes it, without
half-implementing a fight mechanic. **This is the one finding where the fix is
narrower than the review's suggestion; confirm the split is what you want.**

### WR-08: `t.eq` passes when both sides stringify to `undefined`

**Files modified:** `cats-vs-mechs.html`
**Commit:** `6459341`
**Applied fix:** Added `stable()` — key-order-insensitive, and renders
`undefined`, functions and symbols visibly rather than as nothing — and a
both-sides-undefined branch that reports a failure with "proves nothing". Added
an `[S09.0] assertion harness` suite so the comparator has rows of its own
instead of being taken on trust.

Verified with a probe running the same two assertions against both versions:

```
before: PASS a typod property path | FAIL key order
after:  FAIL a typod property path | PASS key order
```

### WR-09: a wall-clock assertion ships inside the artifact

**Files modified:** `cats-vs-mechs.html`, `tests/selftest-node.cjs`
**Commit:** `67f5507`
**Applied fix:** The coverage is moved, not dropped, per the guidance. In-file:
a new `t.info(label, value)` records an always-green informational row
(`100 commits took N ms`) alongside a real assertion that the 100 commits landed.
Dev-side: `tests/selftest-node.cjs` now holds the 50 ms budget as a hard gate,
where the environment is controlled and no student is watching. The file header
was updated from "It does two things" to three.

### WR-10: the forbidden-pattern gate is line-scoped with gaps

**Files modified:** `tests/selftest-node.cjs`
**Commit:** `2e56471`
**Applied fix:** Whole-document scan with line numbers recovered from the match
offset. Rules added for `outerHTML`, `insertAdjacentHTML`, `document.write` (with
`\s*` around the dot, so a split across lines is caught),
`createContextualFragment`, `DOMParser`, `srcdoc`, `javascript:`, `<iframe>`,
`setAttribute('src')` and a bare `Function(` without `new`. `eval(` tightened to
`\beval\s*\(` so it no longer risks matching inside a longer word. Header comment
softened from "the mechanical proof" to "a mechanical gate against the known
sinks", and the remaining limit (computed access such as `el['inner' + 'HTML']`)
is now stated in the comment rather than left implied.

Verified both directions: the artifact is clean under the widened rules, and a
`document` / `.write("x")` pair split across two lines is caught where the old
line-scoped scan waved it through.

### WR-11: `[S03]` calls into `[S01]` at section-body evaluation time

**Files modified:** `cats-vs-mechs.html`
**Commit:** `a30e3d4`
**Applied fix:** Lazy initialisation, as suggested — `cur` starts `null`,
`initial()` builds the board, and `get()` is the one place `cur` may be null.
`commit()`, `commitUi()`, `undo()` and `frame()` all read through `get()`; no
direct `cur` reads remain.

Chose the lazy-init option over amending the banner: the rule buys reorder safety
for a 1,300-line file whose banners are its navigation system, and six lines is a
fair price. Verified with a probe that physically swaps the `[S01]` and `[S03]`
regions — the fixed file loads and runs 81/81, the original throws
`Cannot read properties of undefined (reading 'deepFreeze')`, exactly as the
review predicted.

## Notes for the developer

**Needs a human eye:**

1. **WR-07 scope.** The fight slice now carries `shield`, but there is no writer
   for it until Phase 5. If you wanted `setUnitShield` in Phase 1, that is the
   one place this pass came in under the review's recommendation, and it was a
   judgment call about phase ownership rather than effort.
2. **WR-04 was verified against a stub DOM, not a real browser.** No Playwright
   is installed in this repo, so the target guard was proved by driving the real
   registered listener with synthetic events. It should be confirmed once by
   actually typing in a field and pressing Ctrl+Z — which Phase 2 will make
   possible, since there is no editable board field yet.
3. **No real-browser rehearsal happened at all.** Every check here ran through
   Node's `vm` with a stubbed `document`. Opening `cats-vs-mechs.html` and
   `cats-vs-mechs.html#selftest` by double-click before the phase is signed off
   is still worth the thirty seconds.

**Assertion count moved 57 → 81.** Twenty-four new assertions, all green; no
existing assertion was deleted except `'the suite started from the shipped
defaults'` (replaced by a shape check, WR-03), `'state restored to defaults'`
(replaced by the two handback assertions, WR-03) and `'100 commits stay fast'`
(replaced by a landing assertion plus an informational row, WR-09).

**Info findings IN-01..IN-08 were left untouched**, per scope. IN-01 (`99` as a
magic number in three places, and fight HP clamped to `99` rather than to the
unit's own `maxHp`) is the one worth looking at soon — it is a real
render-correctness issue for Phase 2, not just tidiness.

---

_Fixed: 2026-08-26T22:40:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
