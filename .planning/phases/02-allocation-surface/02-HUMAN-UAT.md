---
status: partial
phase: 02-allocation-surface
source: [02-VERIFICATION.md]
started: 2026-08-27T00:00:00Z
updated: 2026-08-27T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

All five items below need a real browser on a real display. Every one already has a passing
mechanical proof — what is missing is the physical observation the criterion is actually phrased
around. Open `cats-vs-mechs.html` by double-click and work through them in order.

### 1. Twenty rapid clicks produce exactly twenty changes (G-02-A)
expected: The value moves exactly twenty — no more, no fewer. Nineteen is a dropped input; forty is a double-fire.
why_human: The automated gate proves the mechanism at 27/27, including the new non-primary-button guard (check 20) and Enter key-repeat suppression (check 22). It cannot see an input dropped by a real browser under a real finger.
record: the actual number the value moved.
result: [pending]

### 2. Projector legibility at the back of the room (G-02-B)
expected: Tokens in a row are countable, the 24px/700 numeric readouts are legible, the remove control is visible-but-not-shouting at `--tok:22px`, and the sticky strip does not collide with a wrapped or widened topbar.
why_human: No browser and no physical display exist in the build environment. `--tok` remains the shipped 22px, confirmed only by the absence of a change request. WR-09's fix (dynamic `--topbar-now` measurement plus matched topbar/board width) resolves the code-level mismatch but its CSS consequences are unexecuted without a layout engine.
record: the display used, the approximate viewing distance, and the final `--tok` value. Raising `--tok` in `[C00]` is a permitted change; re-run the suite afterwards.
result: [pending]

### 3. Non-primary mouse buttons do not glitch the ramp (WR-03)
expected: Right-click opens the context menu with no value change and no ramp start. Middle-click does not trigger browser autoscroll while a ramp is armed.
why_human: `isPrimaryPress()` now rejects `button !== 0` at both delegated roots and gate checks 20-21 confirm the guard fires. What a real browser does with `pointerup` under an open context menu, and Chrome's middle-click autoscroll, are unexecuted.
result: [pending]

### 4. Held Enter does not repeat at the OS rate (WR-04)
expected: Holding Enter on a focused button — Undo especially — fires once, not at the OS auto-repeat rate.
why_human: The keydown-level `e.repeat` guard is proven by gate check 22 (ten repeated keydowns move `undoDepth` by zero). That Chrome actually synthesizes a click per repeated Enter keydown, and that `preventDefault()` on that keydown withholds it, are spec-documented and unexecuted — the stub does not synthesize clicks from keydowns.
result: [pending]

### 5. The recovery panel is reachable from under a modal dialog (WR-07)
expected: An error raised while the token picker is open closes the picker and shows a clickable, focusable recovery panel — not one rendered inert beneath the dialog's top layer.
why_human: `closeModals()` now runs at the top of `fail()` and gate check 24 confirms the dialog closes and the panel is reachable in the stub DOM. The top-layer and inert semantics that made this a defect are real `<dialog>` browser behavior, unexecuted without a browser.
note: This protects D-15's one-click recovery, which exists for an instructor failing mid-demo with a room watching.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
