---
phase: 02-allocation-surface
plan: 02
subsystem: ui
tags: [vanilla-js, event-delegation, pointer-events, press-and-hold, input-parsing, stub-dom, node-vm]

# Dependency graph
requires:
  - phase: 01-foundation-data-state-funnel-undo
    provides: "App.state.commit/undo/invalidate funnel, App.state.stats() as ALLOC-07's instrument, App.boot.wrap as the one listener error boundary, [S05] int()/requireSide value and key boundaries"
  - phase: 02-allocation-surface
    provides: "plan 02-01's static shell roots, both [S06] render tiers, and the data-k / data-act / data-amt attribute contract"
provides:
  - "[S05] nudgeFactionAp / nudgeUnitMaxHp / nudgeUnitShield, each returning a changed-or-not boolean"
  - "[S05] setUnitShield — the build-slice shield writer (Q-1 resolved)"
  - "[S05] addUnit / removeUnit with a max-suffix nextUnitId scan, both requesting a structural frame"
  - "[S05] MAX_ALLOC / MIN_UNITS / MAX_UNITS as exported named bounds (Q-5 resolved)"
  - "[S07] INTERACTIONS as a namespaced IIFE: one delegated listener per event type on #app"
  - "The four extension seams later plans attach to — UI_ACTS, UI_HANDLERS, HOLD_ACTS, LATE_BINDERS"
  - "The press-and-hold ramp with six stop conditions and a read-only holdSource() accessor"
  - "Delta-typed numeric fields: a regex parser, Enter/Escape/blur/arrow semantics"
  - "ui.kbdNav's writer, which has been missing since Phase 1 shipped the key"
  - "tests/selftest-node.cjs section 5 — an inline stub page in a second vm context, 14 counted checks"
  - "[S09.5] SUITE: interaction contract, three DOM-free rows plus a DOM-gated mirror"
affects: [02-03-token-picker, 03-projection-reference, 04-serialization, 05-fight-loop]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "pointerdown drives every action control; click runs only at e.detail === 0, which is the keyboard path"
    - "UI-only acts are claimed by an allowlist inside [S07] before App.ops.dispatch is reachable, on both input paths"
    - "The press-and-hold ramp is one engine keyed by source ('pointer' / 'key'), driven by a closure so a stepper and an arrow key share it"
    - "Ops that change the roster's shape return no value and follow their commit with invalidate({ structural: true }); ops that change a number return whether it moved"
    - "A regex parser at the [S07] boundary, with int() kept as the backstop rather than the front line"
    - "A stub page inline in the Node harness, in a second vm context, so a document can exist without changing what the first context's assertion count means"

key-files:
  created: []
  modified:
    - "cats-vs-mechs.html — [S05] OPS, [S07] INTERACTIONS (whole region), [S09.3], new [S09.5], one [S06] comment"
    - "tests/selftest-node.cjs — new section 5 with an inline stub DOM"

key-decisions:
  - "Q-1 resolved YES: shield gets a stepper, on the build slice only. The fight slice's own shield copy still has no writer and is named for Phase 5's setFightShield in a comment."
  - "Q-5 resolved: MAX_ALLOC hoisted, clamp semantics unchanged. setUnitHp deliberately still clamps fight health to MAX_ALLOC rather than the unit's own maxHp — a fight-semantics ruling Phase 5 owns."
  - "Arrow-key repeat resolved as research option (b): every e.repeat === true event is dropped and the ramp engine supplies the rate, because the OS repeat rate is neither 400ms nor 40ms."
  - "The e.detail rule was used, not the transient-flag fallback. It is stateless and the gate proves it works."
  - "[S07.N] sub-regions live INSIDE the [S07] IIFE, above the return, so a later plan's pushes into UI_ACTS / HOLD_ACTS land before the frozen export copies are taken."
  - "The stub DOM lives in a second vm context. Section 2's document-free sandbox and section 3's count keep their exact prior meaning."

patterns-established:
  - "Pattern: an op that can no-op against a clamp returns a boolean rather than throwing, because App.boot.wrap turns a throw into a visible panel and an over-press is not an error"
  - "Pattern: a field commit compares value against dataset.was before acting, which is what stops Enter-then-click-away applying a delta twice"
  - "Pattern: [S07] never writes a number onto the page — after a field commits it asks for a frame and [S06] writes the result"
  - "Pattern: gate assertions read a synchronous accessor (holdSource()) instead of sleeping past a timer, so the gate stays deterministic"

requirements-completed: [ALLOC-01, ALLOC-02, ALLOC-03, ALLOC-06, ALLOC-07]

# Metrics
duration: 55min
completed: 2026-08-27
---

# Phase 2 Plan 02: Interactions and the ALLOC-07 Gate Summary

**The board is operable: steppers, delta-typed fields, arrow keys and press-and-hold all funnel through one delegated root into one op call each, and an automated gate proves twenty presses are exactly twenty commits — including the case where it fails upward.**

## Performance

- **Duration:** ~55 min
- **Tasks:** 3 of 3
- **Files modified:** 2 (`cats-vs-mechs.html` 2,402 → 3,274 lines; `tests/selftest-node.cjs` 151 → 677 lines)
- **Assertions:** **91 → 122** in the Node harness, 0 failed, plus **14 of 14** interaction-gate checks.

### Assertion counts, before and after

| Surface | Before (02-01) | After (02-02) |
|---|---|---|
| `node tests/selftest-node.cjs`, in-file suites | 91 passed, 0 failed | **122 passed, 0 failed** |
| `node tests/selftest-node.cjs`, section 5 gate | did not exist | **14 of 14 checks passed** |
| Browser `#selftest` (derived, not measured — no browser here) | 96 | **132** |

The browser figure is arithmetic, not a measurement: 122 Node rows, plus the 5 net rows `[S09.4]`'s
DOM half adds over its skip row, plus the 5 net rows `[S09.5]`'s DOM half adds over its skip row.
No browser was available in this environment, exactly as in wave 1.

## Accomplishments

### Task 1 — `[S05]` bounds, delta transformers, build shield, roster ops (`1e12a95`)

`MAX_ALLOC` / `MIN_UNITS` / `MAX_UNITS` replace the bare literals and are exported, so `[S09]`
asserts against the constant. `MAX_UNITS` duplicates `App.render.MAX_UNITS` by necessity — `[S05]`
sits above `[S06]` and may not capture it — so a new row asserts the two agree rather than trusting
the comment that says they must.

The three `nudge*` ops each hold three properties that are invisible from outside and all
load-bearing: the guards run outside the commit so a bad call leaves no phantom undo step; the read
and the write are the same mutator, so a 40ms ramp cannot act on a stale read; and the label string
is byte-identical to the absolute setter's, which is the whole reason a press-and-hold collapses
into one Ctrl+Z. Each returns whether the value moved — the ramp's sixth stop condition.

`setUnitShield` writes `build` only. A comment names Phase 5's future `setFightShield` so the next
planner does not collide with it.

`nextUnitId` scans for the largest suffix in use rather than counting the roster. Removing `c2` from
`c1,c2,c3` and adding one produces `c4`, not a second `c3`. The id-collision gate is a real row.

### Task 2 — the whole of `[S07]` (`ff4a712`)

`[S07]` became a namespaced IIFE because the ramp needs private timer state. It binds one listener
per event type to `#app`, which is static markup and outlives every rebuild, so the `#topbar`
controls need no separate binding.

**The four seams are the durable part of this task.** `UI_ACTS` + `UI_HANDLERS` give UI-only acts a
named home inside `[S07]`, `HOLD_ACTS` scopes the ramp, and `LATE_BINDERS` lets plan 02-03 add a
dialog root without editing a line of `[S07.1]`. Later plans append an `[S07.N]` block inside the
same IIFE, above the return, so their pushes land before the frozen export copies are taken.

The ramp accelerates 400 → 120 → 40ms and stops on six conditions. The five listener-driven ones
are bound in `bind()`; the sixth — the op reporting that nothing moved — lives in `holdTick`.
`holdSource()` is exported read-only so a gate can assert *that no ramp started* synchronously
instead of sleeping past 400ms.

The field parser is a regex, not `Number()`. The empty-string case is the one that matters: a
student who selects all, presses Delete and clicks away would otherwise commit zero health.

### Task 3 — the ALLOC-07 gate (`bf2644d`)

`tests/selftest-node.cjs` gained a hand-written page and a **second** `vm` context. Section 2's
sandbox and its comment are untouched, so section 3's number keeps its exact prior meaning. In the
new context `[S10] LAUNCH` does fire `App.boot.start()`, and that is asserted on rather than worked
around — it is the wiring path the gate exists to exercise.

## Deviations from Plan

### 1. `[S06]`'s comment reworded so the number-state acceptance grep is meaningful (Rule 3)

**Found during:** Task 2 acceptance greps.
**Issue:** `grep -c "type=\"number\"" cats-vs-mechs.html` printed **1**, not 0. The hit was a
**comment** in `[S06]`'s `stepper()` from plan 02-01, explaining why the field is deliberately *not*
that element. The criterion is a mechanical gate against reintroducing a number input, and a comment
tripping it makes the gate permanently useless — it can never again distinguish "the element came
back" from "somebody wrote about it".
**Fix:** Reworded the comment to describe the rejected element rather than spell it, kept and
expanded its reasoning (the sanitisation rule *and* the `setSelectionRange` throw), and added a line
saying why the attribute is not written literally there. No behaviour changed; `[S06]` code is
untouched. This is the only line of a region this plan does not own that it touched.
**Files:** `cats-vs-mechs.html` `[S06] stepper()`. **Commit:** `ff4a712`.

### 2. `setPointerCapture` is wrapped, because a synthetic pointer id has no live pointer (Rule 2)

**Found during:** Task 3, writing `[S09.5]`.
**Issue:** `setPointerCapture()` throws `NotFoundError` when the id does not match an active
pointer. `[S09.5]` and the Node gate both dispatch synthetic `PointerEvent`s, which never have one.
Unwrapped, **opening `#selftest` in a browser would raise the styled error panel** on a code path
that is working perfectly — and worse, it would do so on the one surface an instructor opens to
prove the artifact is healthy.
**Fix:** The capture call is wrapped and the failure swallowed, with a comment recording that
capture is an enhancement: the ramp still stops on pointerup, on window blur and on the tab going
away. The wrapper is not a second error boundary — `App.boot.wrap` still reports everything else.
**Files:** `cats-vs-mechs.html` `[S07] onPointerDown`. **Commit:** `bf2644d`.

### 3. A numeric field carries `data-act` too, and must not fire it (Rule 1)

**Found during:** Task 2.
**Issue:** The plan's `pointerdown` handler is `e.target.closest('[data-act]')`. The health and
shield fields carry `data-act="maxHp"` / `"shield"` by 02-01's contract, so **clicking into a field
to place a caret** would have dispatched an absolute set with no value at all — `int()` would throw
and the panel would open on an ordinary click.
**Fix:** `actTarget()` returns null for `INPUT` and `TEXTAREA`. Pressing into a field is focus, not
an action. Commented at the guard.
**Files:** `cats-vs-mechs.html` `[S07] actTarget`. **Commit:** `ff4a712`.

### 4. A field commit compares against `dataset.was` before acting (Rule 1)

**Found during:** Task 2.
**Issue:** The plan specifies that both Enter and blur commit. Typing `+5`, pressing Enter and then
clicking away therefore applies the delta **twice** — the field still reads `+5` at blur, because
`[S06]` correctly refuses to overwrite the focused field (D-19).
**Fix:** `commitField` returns early when `el.value === el.dataset.was`, and records `was` after a
successful commit. Blur additionally asks for a frame, so `[S06]` repaints the field with the real
number the moment focus leaves — `[S07]` still writes no value onto the page.
**Files:** `cats-vs-mechs.html` `[S07] commitField`, `onFocusOut`. **Commit:** `ff4a712`.

### 5. The `[S09.3]` coalescing row needs the undo stack rewound first

**Found during:** Task 1 — the row failed on its first run with `actual: 0, expected: 1`.
**Issue:** The undo stack is hard-capped at `UNDO_LIMIT`, and the rows above this one leave it full.
A push that also shifts reads as a depth delta of **zero**, so "forty nudges coalesce to one entry"
would have passed or failed for a reason that has nothing to do with coalescing. The shipped burst
row at line ~2270 is immune only because it happens to run just after a drain.
**Fix:** The block rewinds the stack, then commits under a different label to close the previous
window, then measures. A follow-up row asserts one undo takes the whole ramp back. Written up in the
comment so the next person adding a coalescing row does not spend the same twenty minutes.
**Commit:** `1e12a95`.

### 6. The gate ships 14 checks, not 12

The plan's `<action>` enumerates thirteen assertions; its `<acceptance_criteria>` and `<done>` both
say twelve. Thirteen are implemented, numbered 1–13 in the output so a red run names which one
broke, plus a check `0` asserting the stubbed page actually carries the controls the rest drive —
without it, a stub that silently rendered nothing would report thirteen vacuous passes. Total 14.

## The deliberate-break check, observed

The `e.detail !== 0` early return in `[S07] onClick` was replaced with a no-op, making the click
handler run for every click including one already served by `pointerdown`. Re-running produced:

```
FAIL  interaction gate :: 3. one pointerdown plus one mouse click{detail:1} produce exactly one commit
      commits delta was 2, expected exactly 1 — a delta of 2 is the double-fire: the click handler ran for a press pointerdown already served
interaction gate: 13 of 14 checks passed
INTERACTION GATE: 1 check(s) failed — 3. one pointerdown plus one mouse click{detail:1} produce exactly one commit
```

`echo $?` returned **1**. Note that checks 1, 2 and 4 all still passed — the bug fails *upward* and
only the paired-event check catches it, which is exactly why that check exists. The guard was
reverted immediately and `git diff` confirmed the file returned to its committed state.

## Which double-fire rule was used

**`e.detail`, not the transient-flag fallback.** It is stateless, it needs no timer bookkeeping, and
gate checks 3 and 4 prove both halves — a mouse click is served once by `pointerdown`, and a
keyboard-activated click is served once by the `click` path. If a real browser ever disagrees, the
fallback (a flag set in `pointerdown`, cleared on the next macrotask) is described in the plan and
in research §2 F-1.

## Deferred, on purpose

**Q-5's other half.** `setUnitHp` still clamps **fight** health to `MAX_ALLOC` rather than to the
unit's own `maxHp`. That is a fight-semantics ruling — whether a heal may overshoot, whether a
shield reads as temporary health — and Phase 5 plan 05-01 owns fight health. Changing it in a phase
with no fight surface would alter behaviour nothing here can test. Recorded in a comment on the op
itself so it cannot evaporate.

**The fight slice's `shield` writer.** Still none, still Phase 5's, still named `setFightShield` in
the comment above `setUnitShield` so the next planner does not collide.

## Manual checklist handed to 02-03's checkpoint

No browser and no Playwright were available here. These need a human at a real page:

1. **Click a `+` as fast as you can twenty times and confirm the number moved exactly twenty.** The
   gate proves the wiring; only a human proves the browser agrees.
2. **Type into a health field, press Ctrl+Z, and confirm only the text reverted rather than the
   whole board.** This is `01-REVIEW-FIX` WR-04's outstanding item. Phase 2 creates the file's first
   editable field, so this is the first chance to confirm it against anything but a stub.
3. **Press and hold `+` and confirm it accelerates smoothly**, then drag the pointer out of the
   window mid-hold and confirm it stops rather than pinning health at 99.
4. **Type `-8` into a health field and press Enter**, then click away, and confirm the field settles
   on the committed number rather than still reading `-8`. (Expected: it does. `[S06]` repaints the
   field on the frame the blur asks for. Until focus leaves, the typed delta stays visible on
   purpose — the alternative is `[S07]` writing rendered numbers, which the layering forbids.)
5. **Tab to a stepper and press Enter**, confirming exactly one change and a visible focus ring.
6. **Click a token-appearance button** and confirm nothing at all happens — no change, no panel.
   That is the correct behaviour until plan 02-03 registers the handler.

## Verification

| Check | Result |
|---|---|
| `node tests/selftest-node.cjs` | exit **0**, **122 passed, 0 failed**, gate **14 of 14** |
| `grep -ci "counter\|rating\|balanced\|difficulty"` | **0** |
| `grep -c "verdict\|balanced\|rating\|difficulty"` | **0** |
| `grep -ci "accelerating\|generating\|operating\|iterating"` | **0** |
| `grep -cE "innerHTML\|outerHTML\|insertAdjacentHTML\|eval(\|new Function\|https?://\|<link\|type=module\|url(\|createElementNS\|DOMParser\|srcdoc"` | **0** |
| `grep -c "COALESCE_MS = 500"` | **1** — `[S03]` untouched |
| `grep -c "<style>"` / `grep -c "<script>"` | **1** / **1** |
| `grep -c "case 'openTokenPicker'"` | **0** |
| `grep -c 'data-act="openTokenPicker"'` | **4** — no markup added |
| `grep -c "App.interactions.bind()"` | **1** — still one call site |
| `grep -c "type=\"number\""` | **0** |
| `grep -c "setInterval"` | **0** |
| `grep -c "runInNewContext" tests/selftest-node.cjs` | **2** |
| `grep -c "require(" tests/selftest-node.cjs` | **3**, all `fs` / `path` / `vm` |
| `git diff` of `[S03]` since the wave base | empty |

All 16 removed lines across the whole plan were checked individually: three `int(..., 99, ...)` call
sites, Phase 2's line from the reservation comment, one trailing comma in the ops export, the four
lines of the reworded `[S06]` comment, two lines of the `[S07]` banner, and the four-line `[S07]`
stub. Nothing else was deleted.

## Known Stubs

| Surface | Why | Resolved by |
|---|---|---|
| `UI_HANDLERS` is empty | The four `openTokenPicker` buttons ship, the picker does not. An act claimed by `UI_ACTS` with no handler is a deliberate silent no-op — the only honest behaviour for the window between waves, since the alternative is an error panel on a shipped control. Gate checks 10 and 13 assert exactly this. | 02-03 |
| `LATE_BINDERS` is empty | It is a seam, not a feature. It exists now so 02-03 adds a dialog root without editing `[S07.1]`. | 02-03 |
| The fight slice's `shield` has no writer | Unchanged from Phase 1. Phase 5 owns it. | 05-01 |

## Threat Flags

None. Every trust boundary this plan opened is in the plan's own register and mitigated as written:
`parseField` refuses at the `[S07]` boundary (T-02-06), `dispatch`'s `default: throw` arm is intact
and check 11 proves it (T-02-07), `requireSide` runs outside the commit in all six new ops
(T-02-08), the ramp has all six stop conditions (T-02-09), `MAX_UNITS` throws in the op as well as
disabling the button (T-02-10), `UI_ACTS` is tested before `dispatch` is reachable on both input
paths (T-02-19), and `HOLD_ACTS` allowlists the ramp with check 12 asserting it through
`holdSource()` (T-02-20). The harness still requires only `fs`, `path` and `vm` (T-02-02-SC).

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND
- `tests/selftest-node.cjs` — FOUND
- `.planning/phases/02-allocation-surface/02-02-SUMMARY.md` — FOUND
- `1e12a95` — FOUND
- `ff4a712` — FOUND
- `bf2644d` — FOUND
- `STATE.md` / `ROADMAP.md` — untouched, as required in worktree mode
