---
phase: 02-allocation-surface
fixed_at: 2026-08-27T00:00:00Z
review_path: .planning/phases/02-allocation-surface/02-REVIEW.md
iteration: 1
findings_in_scope: 11
fixed: 11
skipped: 0
status: all_fixed
---

# Phase 2: Code Review Fix Report

**Fixed at:** 2026-08-27
**Source review:** `.planning/phases/02-allocation-surface/02-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 11 (CR-01, CR-02, WR-01 through WR-09 — Info findings deliberately out of scope)
- Fixed: 11
- Skipped: 0

**Test state:** `node tests/selftest-node.cjs` → exit 0, **145 passed / 0 failed** (baseline 142),
**stub-drift gate: 28 shell ids all built**, **interaction gate: 27 of 27** (baseline 14).
All four must-not-regress greps over `cats-vs-mechs.html` remain at zero
(`counter|rating|balanced|difficulty` case-insensitive, `verdict|balanced|rating|difficulty`,
`https?://`, `case 'openTokenPicker'`); one `<script>`, one `<style>`, `COALESCE_MS` still 500,
no `TBD|FIXME|XXX`.

**Every fix was negative-tested.** For each one the fix was neutralised, the suite re-run, and the
new assertion confirmed to fail — then restored. A check that cannot fail is the exact defect
WR-02 was about, so none was accepted on trust.

---

## Fixed Issues

### CR-01 + WR-01: shape-changing ops never requested a structural frame

**Files modified:** `cats-vs-mechs.html`, `tests/selftest-node.cjs`
**Commit:** `cad9c9d`
**Status:** fixed

The review asked whether the real fix was to stop relying on each caller remembering. It was.
`addUnit` and `removeUnit` each carried a trailing `App.state.invalidate({structural:true})`;
`resetToDefaults`, `startFight` and `endFight` did not. Three of five sites making the same
mistake is not a rule, it is a habit.

`[S05]` now spells the rule once as `commitStructural(label, mutator)` and all five ops go through
it. The `invalidate` still sits outside and after the commit, so a throwing mutator leaves no
structural frame owed for a change that never landed.

New gate checks **14** (drive `resetToDefaults`, read the card count back) and **15** (start a
fight, confirm the setup-only roster chrome is gone; end it, confirm it is back). Both fail against
the pre-fix source. Note that `[S09.4]`'s existing card-count row could not have caught this — it
calls `App.render.structure()` explicitly on the line above.

Also updated the `[S06]` "DELIBERATELY ABSENT" comment, which described the old spelling.

---

### CR-02: the focused stepper field never showed the result of an arrow-key step

**Files modified:** `cats-vs-mechs.html`, `tests/selftest-node.cjs`
**Commit:** `2386376`
**Status:** fixed

The D-19 guard in `setValue` is untouched, as instructed — it is what stops a sync render
destroying the caret mid-type. The fix is the field-local write the arrow path owed:
`showFieldValue(el)` in `[S07]`, called from `nudgeField` after the op commits.

It reads the value back through a newly exported `App.render.amountFor` rather than adding the
delta locally, so the op's clamp stays the single definition of the number — a second copy of that
sum is the "mechanical reason for the projection to disagree with the board" this file keeps
refusing to introduce. `dataset.was` moves with the displayed text, which closes both secondary
symptoms the review documented: blur can no longer re-read the stepped number as a freshly typed
absolute, and Escape no longer restores a baseline state has moved past.

New gate check **16** presses ArrowUp on a focused field and reads `el.value` and `dataset.was`
back — the first assertion anywhere in the repo that looks at the displayed text of a focused
field. Fails against the pre-fix source.

---

### WR-02: the Node gate never exercised the picker

**Files modified:** `tests/selftest-node.cjs`
**Commit:** `df791ba`
**Status:** fixed

`KNOWN_IDS` grew from 16 to 28 — every id in the shell, not just the six the review named — and the
stub now builds the whole dialog subtree, including a `<dialog>` stand-in with `.open`,
`showModal()` and `close()` (the last dispatching the `close` event the focus hand-back is bound
to). `pickerDialog()` probes for a `close()` function, so a plain div would have kept the path
skipped.

The list is no longer maintained by good intentions. A new **stub-drift gate** scans
`cats-vs-mechs.html` for every `id="..."` and fails the run in **both** directions — a shell id the
stub does not build, or a stub id the shell has dropped. This turns the entire class of silent skip
into a red line. Negative-tested: removing three picker ids produces
`STUB DRIFT: cats-vs-mechs.html carries id(s) the stub page does not know: tok-picker,
tok-pick-title, tok-pick-preview` and exit 1.

New gate checks **17** (the picker opens and fills all three grids from the vocabulary allowlists,
plus the three-token preview), **18** (a swatch press moves `state.build.tokens` and the board's
`.tok` class follows), **19** (Done closes it and hands focus back to the opener).

**On the review's expectation that this would surface new failures:** it did not. Growing the list
made `[S06.2]`/`[S07.2]` execute for the first time and the picker code was correct as written —
`picker`, `pickerSwatch`, `fillGrid`, `safeGlyph`, `bindPicker`, `onPickerPress`, `onPickerClose`
all behaved. WR-05 and WR-06 were real, but neither was a crash; they needed assertions that did
not exist yet rather than assertions that had been suppressed. Checks 10 and 13 now pass over a
handler that actually runs.

---

### WR-03: non-primary mouse buttons activated every control

**Files modified:** `cats-vs-mechs.html`, `tests/selftest-node.cjs`
**Commit:** `bbc963e`
**Status:** fixed: requires human verification

`isPrimaryPress(e)` guards both delegated `pointerdown` handlers — `onPointerDown` at `#app` and
`onPickerPress` at the dialog. `button === 0` covers mouse-left, touch and pen contact;
`undefined` keeps the synthetic events the harnesses dispatch working.

New gate checks **20** (button:2 at a stepper → commits delta 0, `holdSource()` null) and **21**
(button:2 at a swatch → no restyle). Both fail against the pre-fix source.

Check 21 was itself caught being vacuous on the first attempt: it reused the swatch node from check
18, which check 18's own repaint had already detached, so it passed for the wrong reason. It now
re-queries and targets a shape that is *not* live, and fails without the guard.

**Needs a browser:** what a real browser does with `pointerup` while a native context menu is up,
and Chrome's middle-click autoscroll, remain unexecuted. What is executed is that both handlers now
decline the event outright, which is upstream of all of it.

---

### WR-04: no key-repeat suppression on the button path

**Files modified:** `cats-vs-mechs.html`, `tests/selftest-node.cjs`
**Commit:** `2937d49`
**Status:** fixed: requires human verification

Suppression lives on the `keydown` that generates the click, since `click` carries no `repeat`
field. Scoped by `actTarget(e)`, which returns null for `INPUT`/`TEXTAREA` — so a held Space in the
numeric field still types spaces and Enter in a field still reaches `commitField`. Only an
actionable button is silenced, and only on a repeat.

New gate check **22**: a repeat is cancelled, a first press is not, and ten repeated Enters on Undo
move `undoDepth()` by zero. Fails against the pre-fix source.

**Needs a browser:** that Chrome fires `click` per repeated Enter `keydown`, and that
`preventDefault()` on that keydown withholds the synthesised click, are both spec-documented and
neither is executed here. The stub does not synthesise clicks from keydowns, so check 22 asserts
the guard, not the browser's response to it.

---

### WR-05: the open picker's selection marks went stale

**Files modified:** `cats-vs-mechs.html`, `tests/selftest-node.cjs`
**Commit:** `870f06e`
**Status:** fixed

Took the review's first-named option (repaint from the render frame) rather than its fallback,
because the fallback only narrows the window rather than closing it.

`[S06.1]` gains one seam, `SYNC_HOOKS`, in the same shape and for the same reason as `[S07.1]`'s
`LATE_BINDERS`: a sub-region that paints a page region outside `#board` pushes its own reconcile
there, and `sync()` walks the list as its last act. `[S06.2]` attaches `syncPicker` and edits
nothing above it, preserving the sub-region's stated "changes NOTHING in [S06.1]" property in
spirit — the seam is declared by `[S06.1]`, the picker is not named there.

Which type is open is read back out of the signature `picker()` itself wrote, rather than reaching
across into `[S07.2]`'s private `pickerTok`. That keeps one tier reading its own bookkeeping, and
`picker()`'s existing sig comparison keeps a repaint that changes nothing free.

New gate check **23**: restyle, Ctrl+Z-equivalent undo with the dialog open, then read the live
swatch marks and `dlg.dataset.sig` back. Fails against the pre-fix source.

---

### WR-06: pressing the already-selected swatch committed a no-op restyle

**Files modified:** `cats-vs-mechs.html`
**Commit:** `ae75d0c`
**Status:** fixed

`setTokenStyle` now carries the boolean contract `nudgeFactionAp` established, and goes one step
further than its siblings by not committing at all when nothing moves. The nudges commit anyway
because their boolean is a ramp stop condition; this op has no ramp, so the commit was buying
nothing while costing two deep clones and an undo entry per press.

The comparison is read outside the funnel, which is safe here and deliberately is not for the
nudges — they must read and write inside one mutator because a 40 ms ramp could otherwise act on a
number it read a step ago. The comment says so, so the asymmetry is not read as an oversight later.

Three new rows in `[S09.6]`, taking the in-file suite 142 → 145. Two of them fail against the
pre-fix source.

---

### WR-07: the recovery panel rendered underneath an open modal

**Files modified:** `cats-vs-mechs.html`, `tests/selftest-node.cjs`
**Commit:** `a145846`
**Status:** fixed: requires human verification

`fail()` closes every open `<dialog>` before raising the panel — every one, not `tok-picker` by
name, so `[S08]` will not need editing when Phase 4's share modal arrives. The teardown is wrapped
in try/catch because `close()` fires an event whose handler runs through `wrap()` and could
re-enter `fail()`; a failure to tidy up must never pre-empt the message `fail()` was called to
show.

Did **not** take the alternative of making `.err-panel` a `<dialog>` — the review is right that it
changes the panel's non-modal semantics and would need its own review.

New gate check **24**: raise an unknown act with the picker open, read both the dialog and the
panel back. Fails against the pre-fix source.

**Needs a browser:** the top-layer promotion and inert semantics that make this a defect at all are
spec-derived and unexecuted. The fix is upstream of them either way.

---

### WR-08: `applyField`'s absolute path forwarded an unvalidated page key

**Files modified:** `cats-vs-mechs.html`, `tests/selftest-node.cjs`
**Commit:** `399ef0d`
**Status:** fixed

`NUDGE_OF` and the `AMT_OF` map added by CR-02 collapse into one `FIELD_OPS` table carrying the
absolute setter, the delta sibling and the `[S06]` amount key per allowed act, read through
`fieldOp(el, which)`. Both directions now name their op through the same table.

New gate check **25** drives a field carrying `data-act="alive"` and asserts the panel names the
real fault. The message is the discriminator: against the pre-fix source the same check reports
`No fight in progress` — the op ran — instead of `No set op for "alive"`.

---

### WR-09: fixed sticky offset vs. a wrapping topbar; topbar narrower than the board

**Files modified:** `cats-vs-mechs.html`, `tests/selftest-node.cjs`
**Commit:** `b6c7119`
**Status:** fixed: requires human verification

Both halves addressed.

**(1) The offset.** Took the review's first-named option — measure it and publish it — rather than
`height` + `flex-wrap:nowrap`, which trades a silent overlap for a silent clip and is no more
verifiable without a browser. `[S08]` measures `#topbar` and publishes `--topbar-now`, which
`#strip` reads as `top:var(--topbar-now, var(--topbar-h))`.

It is a **separate** property from `--topbar-h` on purpose: writing the measurement back into the
same property that sets `min-height` would ratchet — the bar could never measure smaller than the
largest height it had ever reached, so a window that widened again would keep the taller offset
forever. `--topbar-h` stays the floor.

Everything degrades to the shipped 64px: no `ResizeObserver`, no element, no measurable height, or
a headless page with no layout at all, and the `var()` fallback stands. `ResizeObserver` (not the
`resize` event) is the primary path, because a wrap can be caused by a content change as well as a
viewport change; the `resize` listener is the documented weaker fallback.

**(2) The width.** `#topbar` now carries the same `width` and computed negative `margin-left`
`#board` already has, spelled identically, and the 760px media query resets both together.

New gate check **26** covers the publish-and-republish path: the stub reports a topbar height of
88px, boot publishes `--topbar-now: 88px`, the gate changes the reported height to 120 and fires
the observer, and the property follows. This required giving the stub `getBoundingClientRect`, a
`documentElement.style`, and a `ResizeObserver` stand-in.

**Needs a rehearsal.** The CSS consequences themselves are not executed — there is no browser and
no layout engine in this repo, which is exactly why the review rated this MEDIUM. This stays on the
rehearsal checklist alongside G-02-B, and the change should be eyeballed on the actual workshop
display before the session: specifically, that the widened sticky bar does not visually collide
with `.shell`'s 1280px header above it at projector width.

---

## Skipped Issues

None. All eleven in-scope findings were applied.

The six Info findings (IN-01 through IN-06) were left untouched, per the stated scope.

---

## Notes for the verifier

- **Suite floor moved:** 142 → 145 in-file assertions; interaction gate 14 → 27 checks; one new
  named gate (`stub-drift gate`) that exits 1 on drift. The baseline in any future review should be
  145 / 27, not 142 / 14.
- **New public surface:** `App.render.amountFor` is now exported (frozen surface), for exactly one
  caller — `[S07]`'s `showFieldValue`.
- **New seams:** `SYNC_HOOKS` in `[S06.1]` (one consumer: `syncPicker`), `commitStructural` in
  `[S05]` (five consumers), `FIELD_OPS`/`fieldOp` in `[S07.1]` (two consumers),
  `isPrimaryPress` in `[S07.1]` (two consumers), `closeModals` in `[S08]` (one consumer).
- **Four fixes are reasoned from spec, not executed** — WR-03's browser consequences, WR-04's
  click-on-held-Enter, WR-07's top-layer/inert semantics, WR-09's CSS. In each case the *guard* is
  executed and the *platform behaviour it responds to* is not. Nothing in this report claims a
  browser measurement that was not taken.
- **The two human-verification items the phase already tracks are untouched by this work:** G-02-A
  (twenty rapid clicks, hand-counted) and G-02-B (projector legibility). WR-09's change makes the
  second one slightly more load-bearing, not less.

---

_Fixed: 2026-08-27_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
