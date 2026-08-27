---
status: partial
phase: 02-allocation-surface
source: [02-VERIFICATION.md]
started: 2026-08-27T00:00:00Z
updated: 2026-08-27T00:00:00Z
---

## Current Test

number: 2
name: Projector legibility at the back of the room (G-02-B)
awaiting: human observation on a physical display

## Environment used for the browser-verified items

Driven through the in-app browser pane against
`file:///C:/Projects/GameDesignSkills/GameFeelDirectionCourse/CatsVsMech/cats-vs-mechs.html`.

Two caveats that qualify every result below, stated because they change what the evidence means:

1. **The pane served the page as a `data:` URL, not `file://`** (`location.protocol === "data:"`).
   For input handling and DOM behaviour this is immaterial — none of these tests are origin-gated —
   but it is not the origin the artifact ships under, so `file://`-specific behaviour is still
   unexercised here.
2. **The pane never composited** (`document.visibilityState === "hidden"`), so
   `requestAnimationFrame` was paused throughout and every DOM observation required an explicit
   `App.state.flush()` first. This produced one false alarm during testing — a field reading `3`
   against a state of `23` — which resolved to `23` the moment the frame was flushed. **Not a
   defect**; a measurement artifact. It also means no screenshot could be taken, which is why
   test 2 remains open.

## Tests

### 1. Twenty rapid clicks produce exactly twenty changes (G-02-A)
expected: The value moves exactly twenty — no more, no fewer. Nineteen is a dropped input; forty is a double-fire.
result: pass
recorded: **20**
evidence: Twenty real browser clicks dispatched at "Increase Cat 1 health". Cat 1 `maxHp` moved 3 → 23 (delta exactly 20), `stats().commits` delta exactly 20, `undoDepth` delta 2 (coalescing), error panel never raised. This is the hand-count the criterion is phrased around, taken through the browser's own input path rather than synthesised in the Node stub.

### 2. Projector legibility at the back of the room (G-02-B)
expected: Tokens in a row are countable, the 24px/700 numeric readouts are legible, the remove control is visible-but-not-shouting at `--tok:22px`, and the sticky strip does not collide with a wrapped or widened topbar.
result: [pending]
why_still_open: The Browser pane could not be displayed from the agent side, so no frame was ever composited and no screenshot could be captured. This one genuinely needs a person at the actual workshop display — no automation substitutes for judging countability at distance.
record: the display used, the approximate viewing distance, and the final `--tok` value. Raising `--tok` in `[C00]` is a permitted change; re-run the suite afterwards.

### 3. Non-primary mouse buttons do not glitch the ramp (WR-03)
expected: Right-click opens the context menu with no value change and no ramp start. Middle-click does not trigger browser autoscroll while a ramp is armed.
result: pass (partial coverage)
evidence: A real right-click on "Increase Cat 1 health" produced a `commits` delta of **0**, left `maxHp` unchanged at 3, left `App.interactions.holdSource()` at `null` (no ramp armed), and raised no error panel. `isPrimaryPress()` holds in a real browser.
not_covered: Chrome's middle-click autoscroll — the harness exposes no middle-click action. Still worth a human glance.

### 4. Held Enter does not repeat at the OS rate (WR-04)
expected: Holding Enter on a focused button — Undo especially — fires once, not at the OS auto-repeat rate.
result: pass (mechanism confirmed; OS-level repeat not exercised)
evidence: With Undo focused in a real browser, a `keydown` carrying `repeat: false` came back `defaultPrevented === false` (the browser is left free to synthesise its click), while two `keydown`s carrying `repeat: true` both came back `defaultPrevented === true`. Calling `preventDefault()` on the repeat is precisely the documented mechanism that withholds the synthesised click, so the guard is now measured in Chrome rather than reasoned from spec.
not_covered: A physically held Enter at the OS auto-repeat rate. Real key events were not delivered to the non-displayed pane — confirmed to be a harness limit rather than an app defect, because a real click on the same button in the same state did fire (1 click observed, `undoDepth` 6 → 5).

### 5. The recovery panel is reachable from under a modal dialog (WR-07)
expected: An error raised while the token picker is open closes the picker and shows a clickable, focusable recovery panel — not one rendered inert underneath the dialog's top layer.
result: pass
evidence: The picker opened as a **true modal** (`dialog.matches(':modal') === true`), so the top-layer semantics this finding is about were genuinely in play. An error raised through the real `App.boot.wrap()` listener boundary closed the picker automatically (`open: true → false`), revealed the panel (`hidden: false`) titled from the failing label, and rendered both "Dismiss and continue" and the Reset control. `document.elementFromPoint()` at the panel's own location returned an element **the panel contains**, proving it is the topmost hittable thing rather than inert beneath a top layer. Activating Dismiss hid the panel, left the picker closed, and the page kept committing normally afterwards (`maxHp` 4 → 5) — D-15's one-click recovery works end to end.
note: The panel's own buttons were activated programmatically rather than by pixel click, because the accessibility-tree read truncated before reaching them. The topmost-and-hittable proof above is the part that actually addresses WR-07.

## Additional observations (not part of the five tests)

- **CR-01's fix confirmed in a real browser.** After a reset, the page showed **12 unit cards against 12 units in state** (9 Cats + 3 Mechs) with no ghosts — the defect that produced 11-against-9 before the fix pass.
- **The structure/sync split behaves as designed.** A structural rebuild invalidated every board element reference while the four static topbar buttons kept theirs, which is exactly the intended division of labour.
- **Accessible naming is real.** Every control carries a genuine name — "Increase Cat 1 health", "Remove Cat 1", "Decrease Cats action points" — which is the half of UX-02 that says nothing may be conveyed by hover alone.
- **Low-confidence nit worth a look during the rehearsal:** immediately after `showModal()`, `document.activeElement` was `BODY` rather than an element inside the dialog. A modal would normally take focus. The hidden pane may well be responsible, so this is an observation to confirm rather than a finding.

## Summary

total: 5
passed: 4
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps

[none — no test produced a failure. One test remains unrun for want of a physical display.]
