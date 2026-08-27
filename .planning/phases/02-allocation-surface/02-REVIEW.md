---
phase: 02-allocation-surface
reviewed: 2026-08-27T17:25:10Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - cats-vs-mechs.html
  - tests/selftest-node.cjs
findings:
  critical: 2
  warning: 9
  info: 6
  total: 17
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-08-27T17:25:10Z
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Reviewed the Phase 2 additions to `cats-vs-mechs.html` (`[S01]` token vocabulary and `GLYPHS`,
`[S05]` additions, `[S06] RENDER` + `[S06.2]` picker, `[S07] INTERACTIONS` + `[S07.2]` picker,
`[C03]`–`[C07]`, `[S09.4]`–`[S09.6]`) and the new interaction gate in `tests/selftest-node.cjs`.

**Method.** Every finding below marked HIGH confidence was reproduced by executing the shipped
script in a Node `vm` sandbox driven by the project's own stub DOM (sliced verbatim out of
`tests/selftest-node.cjs` so the probe drives the same page the gate drives), extended with a
`<dialog>` and selection support. `node tests/selftest-node.cjs` passes 142/142 assertions,
14/14 gate checks, exit 0 — the defects below are all outside what it asserts. Findings marked
MEDIUM are derived from specified platform behaviour that could not be executed: **there is no
browser and no Playwright in this repo**, so real-browser `<dialog>` top-layer/inert semantics,
`click`-on-held-Enter repetition, non-primary-button `pointerdown`, and all CSS layout claims are
the known gap. Each is flagged inline.

**The claims under review, checked.** Verified true: twenty `pointerdown` → twenty commits and
one undo entry; `pointerdown` + `click{detail:1}` → one commit; `openTokenPicker` never reaches
`[S05] dispatch` on either path while an unknown act still hits `default: throw`; the hold ramp
fires only for `HOLD_ACTS` on the pointer path; `HOLD_FIRST_MS (400) < COALESCE_MS (500)`; token
appearance lives in `build` and is undoable; `setTokenStyle` refuses off-list keys and values
including `__proto__` and `constructor` (Phase 1's CR-02 did **not** recur — the key is
allowlisted before it indexes state, and nothing leaks onto `Object.prototype`); `structure()`
preserves scroll, `data-k` and caret, and lands focus on a real, *sensible* node (removing `c3`
lands on `cats/c4/rm`); `sync()` grows a row by delta without touching existing nodes; both tiers
carry the `typeof document === 'undefined'` guard; the two acceptance greps are at zero. There is
no markup-parsing sink, no `https?://`, and the two string-built selectors (`keyed`/`peerList`
via `CSS.escape`, `onPickerClose` via a `TOKEN_IDS` allowlist) are both closed.

**Claims that did not survive.** "Holding Undo / Add / Remove fires exactly once" is verified only
for the pointer path — the keyboard path has no repeat suppression at all (WR-04). And the
statement that the picker is exercised end to end is false: the Node gate has no picker ids, so
the entire `[S06.2]`/`[S07.2]` code path is skipped and its checks pass vacuously (WR-02).

**The two blockers.** Phase 2's renderer introduced a structural/sync split; `addUnit` and
`removeUnit` honour it and `resetToDefaults` does not, so the shipped error-panel Reset button
leaves the page permanently out of sync with state (CR-01). And the numeric field — the artifact's
primary allocation control — never displays the result of an arrow-key step, so it visibly
contradicts the token row beside it (CR-02).

---

## Critical Issues

### CR-01: `resetToDefaults()` changes the roster shape without requesting a structural frame — the shipped Reset button permanently desynchronises the page from state

**File:** `cats-vs-mechs.html:1421-1426` (op), `cats-vs-mechs.html:456` + `cats-vs-mechs.html:2896-2915` (the reachable trigger)
**Confidence:** HIGH — reproduced end to end through the student-reachable chain.

**Issue:** `[S06]`'s two-tier contract requires any op that changes what `structure()` would build
to follow its `commit()` with `App.state.invalidate({ structural: true })`. `addUnit` (line 1340)
and `removeUnit` (line 1359) do. `resetToDefaults` replaces `s.build` wholesale — which resets
`units.length` to 9/3 — and does not:

```js
function resetToDefaults() {
  App.state.commit('reset to defaults', function (s) {
    s.build = App.data.defaults();
    s.fight = null;
  });
}                       // <-- no invalidate({ structural: true })
```

Only `sync()` runs, and `sync()` walks the *page's* existing `.stp-field` / `.brd-value` /
`.tok-row` nodes. It cannot create or destroy a card.

This is fully reachable in the shipped Phase 2 UI with no developer flags. Reproduced chain:

1. Student presses "+ Add Cat" twice — roster and page both at 11.
2. Student types `abc` into a health field and presses Enter. `commitField(el, true)` throws
   `type a whole number, or +5 / -8 to adjust`; `App.boot.wrap` opens the styled error panel.
3. Student clicks the panel's **"Reset to Workshop 16 defaults"** button (line 456), which calls
   `App.ops.resetToDefaults()`.
4. Measured after the frame flushes: **11 unit cards on the page, 9 units in state.**

The wreckage is not cosmetic. The two ghost cards stay fully interactive, and `amountFor()` (line 1874)'s
`if (!unit) { return 0; }` fallback paints them as a unit with 0 health and an empty token row —
so the board shows a Cat that does not exist and reads zero. Pressing that ghost card's `+`
raises a *second* error panel:

```
No unit "c11" on side "cats" — the last good state is still on screen.
```

So the artifact's one-click recovery affordance (D-15, "the realistic failure moment is an
instructor mid-demo") deposits the student in a state where the next click errors again, and
nothing short of a page reload or another shape-changing op repairs it.

The reverse direction is equally broken: remove two Cats (page and roster both at 7), Reset, and
state goes back to 9 while the page stays at 7 — two units are in the projection and the eHP
readout but have no card.

Note that `[S09.4]`'s "card count matches the roster" row cannot catch this: it calls
`App.render.structure()` explicitly on the line above, and `App.state.restore()` (the only path
the suites use to put the board back) *does* invalidate structurally.

**Fix:** follow the same spelling `addUnit`/`removeUnit` already use.

```js
  function resetToDefaults() {
    App.state.commit('reset to defaults', function (s) {
      s.build = App.data.defaults();
      s.fight = null;
    });
    App.state.invalidate({ structural: true });
  }
```

Consider closing the class rather than the instance — e.g. have `[S05]` route every op whose
mutator can change `units.length` or nullify/populate `s.fight` through one `commitStructural()`
helper, so a Phase 4/5 op cannot reintroduce this by forgetting a trailing line. See WR-01 for the
other two instances.

---

### CR-02: the focused stepper field never shows the result of an arrow-key step — the number the student is editing contradicts the token row beside it

**File:** `cats-vs-mechs.html:1924-1926` (`setValue`), `cats-vs-mechs.html:2532-2545` (the arrow path)
**Confidence:** HIGH — reproduced; logic-level, independent of the stub.

**Issue:** `setValue` deliberately skips the focused field so a half-typed `+5` is not overwritten
(D-19, correct):

```js
function setValue(node, n) {
  if (node !== document.activeElement) { node.value = String(n); }
}
```

But the arrow-key path at line 2543 dispatches the nudge op and **never writes the field itself** —
it relies on the frame it just requested, which is exactly the frame `setValue` refuses to apply
because the field has focus by definition when it receives a `keydown`. Every arrow press and
every ramp tick therefore changes state and the board while the field the student is operating
stays frozen at whatever it read on focus.

Measured, starting from Cat 1 at 3 health with the field focused:

| action | state | token row draws | **field displays** |
|---|---|---|---|
| focus | 3 | 3 | `"3"` |
| ArrowUp × 5 | **8** | **8** | **`"3"`** |
| blur | 8 | 8 | `"8"` |

The field and the tokens sitting on the same line disagree, on a game-feel course artifact whose
whole subject is that the numbers and the picture agree. It self-corrects only on blur.

Two secondary symptoms fall out of the same root cause and are worth fixing together:

1. **The student edits a stale number and commits the wrong value.** Measured: field shows `"3"`,
   Shift+ArrowUp × 5 takes state to **28**, field still shows `"3"`. The student appends a digit
   to what they can see — `"30"` — and blurs. `commitField` sees `"30" !== was "3"`, parses it as
   an absolute, and writes **30**. They believed they were adjusting 28. Nothing in the interface
   told them otherwise.
2. **Escape leaves the field lying.** Measured: ArrowUp (state 3 → 4), then Escape. `revertField`
   (line 2528) restores the field text to `"3"` while state stays at **4**, and because the field
   still has focus `sync()` will not correct it. Escape's contract — "put back what the field held
   on focus" — silently applies to typed text only, and the two are indistinguishable to the
   student.

**Fix:** the arrow path is an explicit request to change the displayed number, so it should write
the field locally, exactly as the section banner already permits ("The three exceptions… are all
field-local text"). Update the caret bookkeeping (`dataset.was`) in the same place so
`commitField`'s no-double-apply guard and `revertField` both stay honest:

```js
  // [S07.1] — the field-local write the ramp owes. Every OTHER number on the
  // board is still written by [S06] and only by [S06]; this is the one field
  // sync() is contractually forbidden to touch, so the stepper owes it.
  function showFieldValue(el) {
    var n = App.render.amountFor
      ? App.render.amountFor(App.state.get(), el.dataset.amt, el.dataset.side, el.dataset.unit)
      : null;
    if (n === null) { return; }
    el.value = String(n);
    el.dataset.was = el.value;   // keeps commitField/revertField in step
  }

  function nudgeField(el, delta) {
    var d = el.dataset;
    if (!Object.prototype.hasOwnProperty.call(NUDGE_OF, d.act)) {
      throw new Error('No step op for "' + String(d.act) + '"');
    }
    var moved = App.ops.dispatch(NUDGE_OF[d.act], {
      side: d.side, unitId: d.unit, delta: delta
    });
    showFieldValue(el);
    return moved;
  }
```

This needs `amountFor` (currently private to `[S06]`, line 1874) exported on `App.render`'s frozen
surface, or an equivalent read helper. Either way, add a `[S09.5]` row that presses ArrowUp on a
field and asserts `field.value === String(state maxHp)` — no existing assertion covers the
displayed text of a focused field.

---

## Warnings

### WR-01: `startFight()` and `endFight()` have the same missing structural frame as CR-01

**File:** `cats-vs-mechs.html:1396-1411`, `cats-vs-mechs.html:1413-1419`
**Confidence:** HIGH — reproduced.

**Issue:** `buildColumn` derives `setup = (state.fight === null)` (line 1819) and uses it to decide
whether per-unit remove buttons and the "+ Add Cat" button exist at all. Both ops flip that
condition and neither requests a structural frame. Measured: after `App.ops.startFight()` and a
flush, `state.fight !== null` but the page still carries the Add button and all 12 remove buttons —
the roster-shaping chrome D-05 exists to hide during a fight. Latent in Phase 2 only because no
page control calls them, but both are exported ops and Phase 5 will wire them to buttons.

**Fix:** append `App.state.invalidate({ structural: true });` to both, or fold all four ops into
the shared `commitStructural()` helper suggested in CR-01.

---

### WR-02: the Node gate never exercises the picker — `KNOWN_IDS` was not grown, so `[S06.2]`/`[S07.2]` are skipped and their checks pass vacuously

**File:** `tests/selftest-node.cjs:175-179`
**Confidence:** HIGH — reproduced; the picker findings in this review were only reachable after
adding the six ids by hand.

**Issue:** The stub's own header says so in capitals:

> Every id the artifact asks for. getElementById returns null for anything else, and **THAT IS THE
> ONE HONEST WEAKNESS OF THIS APPROACH**: every consumer in the artifact guards on null, so a
> missing id degrades to a silent skip rather than a loud failure. **This list must grow when the
> static shell does.**

Plan 02-03 added six ids to the static shell — `tok-picker`, `tok-pick-title`, `tok-pick-shapes`,
`tok-pick-colors`, `tok-pick-glyphs`, `tok-pick-preview` (plus the `data-pk="done"` button) — and
`KNOWN_IDS` was not grown. Consequences, all verified:

- `pickerDialog()` (line 2652) returns `null`, so `UI_HANDLERS.openTokenPicker` returns on its
  second line. `bindPicker()` returns immediately, so `onPickerPress` / `onPickerClick` /
  `onPickerClose` are **never registered and never run** in the gate.
- `App.render.picker()` returns at `if (!dlg) { return; }` — `pickerSwatch`, `fillGrid`,
  `safeGlyph`, `TOKEN_NAMES`, `SHAPE_NAMES`, `COLOR_NAMES` and the preview builder have **zero**
  executed coverage.
- Gate checks **10** and **13** ("a token-appearance press commits nothing and opens no panel")
  therefore prove only that a handler which bails out immediately commits nothing. They would still
  pass if `onPickerPress` were deleted.
- `[S09.6]`'s closing row, `t.ok('a self-test run leaves no picker open over the report', !dlg || dlg.open !== true)`
  (line 3861-3864), passes because `dlg` is `null`.

There is no assertion anywhere in the repo that the picker *opens*, that a swatch press restyles,
or that the board follows. The one gate that could have caught WR-05 and WR-06 is inert.

**Fix:** grow the list and build the dialog in the stub, then assert the real path.

```js
  const KNOWN_IDS = [
    'app', 'board', 'board-empty', 'topbar', 'col-cats', 'strip', 'col-mechs',
    'err-panel', 'err-title', 'err-message', 'err-detail', 'err-dismiss',
    'err-reset', 'selftest-report', 'selftest-summary', 'selftest-rows',
    // [S06.2] / [S07.2] — the token-appearance picker. Kept in step with the
    // static <dialog> in cats-vs-mechs.html; see the note above this list.
    'tok-picker', 'tok-pick-title', 'tok-pick-shapes', 'tok-pick-colors',
    'tok-pick-glyphs', 'tok-pick-preview'
  ];
```

plus a minimal `<dialog>` stand-in (`open`, `showModal()`, `close()` dispatching a `close` event),
and new checks: pressing a `[data-act="openTokenPicker"]` button sets `dlg.open === true` and fills
all three grids; pressing a `[data-act="setTokenStyle"]` swatch moves `state.build.tokens`; the
board's `.tok` class follows. Consider making the list a hard gate instead of a soft one — scan the
HTML for `id="..."` and fail the run when the shell carries an id the stub does not know, which
turns this whole class of silent skip into a red line.

---

### WR-03: non-primary mouse buttons activate every control and start the hold ramp

**File:** `cats-vs-mechs.html:2462-2495` (`onPointerDown`), `cats-vs-mechs.html:2697-2721` (`onPickerPress`)
**Confidence:** HIGH at the logic level (reproduced: a `pointerdown` carrying `button: 2` produced
one commit and `holdSource() === 'pointer'`). MEDIUM on the downstream browser consequences — no
browser available.

**Issue:** Neither delegated `pointerdown` handler inspects `e.button`. `pointerdown` fires for the
right and middle buttons as well as the left, so:

- Right-clicking `+` increments the value **and** starts the press-and-hold ramp, then opens a
  context menu on top of it. The ramp's stop conditions are `pointerup` / `pointercancel` /
  `lostpointercapture` on `#app`, `window` blur and `visibilitychange`; whether any of those fires
  while a native context menu is up is browser-dependent and untested here.
- Middle-clicking `−` decrements and, in Chrome, engages autoscroll — the pointer then leaves the
  button with the ramp running.
- The same applies to every picker swatch: a right-click restyles a token.

Right-clicking a control to inspect it is ordinary behaviour for an instructor demoing in DevTools,
and this artifact explicitly expects that audience.

**Fix:** ignore non-primary presses at the top of both handlers. `button === 0` covers mouse-left,
touch and pen contact; `undefined` keeps the synthetic events the harnesses dispatch working.

```js
  function onPointerDown(e) {
    // Primary contact only. pointerdown fires for the right and middle buttons
    // too, and a right-click on a stepper would otherwise step the value and
    // start a ramp underneath the context menu.
    if (e.button !== undefined && e.button !== 0) { return; }
    var btn = actTarget(e);
    ...
```

Add the same guard to `onPickerPress`, and extend the gate's `press()` helper to dispatch a
`button: 2` event and assert a commits delta of 0.

---

### WR-04: `onClick` has no key-repeat suppression, so holding Enter on a button repeats at the OS rate — including on Undo

**File:** `cats-vs-mechs.html:2497-2512`
**Confidence:** MEDIUM — the code gap is certain; the browser behaviour (Chrome fires `click` on
each repeated `keydown` for Enter on a `<button>`) is documented but **not executable here**.
Verify in a real browser before ranking this.

**Issue:** The keyboard path is `onClick` gated on `e.detail === 0`. The arrow path in `onKeyDown`
takes explicit care to drop OS repeats:

> D-17, read literally. The OS key-repeat rate is neither `HOLD_FIRST_MS` nor `HOLD_FAST_MS` and
> differs per machine, so accepting it would make "held arrows use the same ramp as press-and-hold"
> false. Every repeat event is dropped and the ramp engine below supplies the rate instead.
> `if (e.repeat === true) { return; }`

`onClick` has no equivalent. Holding **Enter** on a focused button produces a stream of
`click{detail: 0}` events at the OS auto-repeat rate, each one reaching `fire(btn)`:

- On a stepper `+`, the value ramps at a per-machine rate that is by construction *not* the D-18
  ramp — the exact failure the `e.repeat` guard above exists to prevent, reached by a different
  door.
- On **Undo**, held Enter rewinds the stack repeatedly. `HOLD_ACTS` deliberately excludes `undo`
  so that "holding Undo fires exactly once", and the interaction gate's check 12 and `[S09.5]`'s
  `undo is not a hold act` row both assert that property — but both assert it only against
  `holdSource()` on the *pointer* path. Neither can see this.
- On **Add** / **Remove**, held Enter repeats until the bound is hit and then throws
  (`That side is full` / `That side needs at least one unit`), flashing the error panel mid-demo —
  again the precise outcome the `HOLD_ACTS` comment argues against.

Note that `click` carries no `repeat` field, so the fix cannot live in `onClick` alone.

**Fix:** suppress the repeat at the `keydown` that generates the click. `onKeyDown` already runs on
the same root and already sees `e.repeat`:

```js
  function onKeyDown(e) {
    noteKeyboard(e);

    // Enter and Space activate a button, and the browser synthesises a
    // click{detail:0} per repeated keydown. Dropping the repeat here is the
    // same rule the arrow ramp below applies, for the same reason: the OS
    // repeat rate is not this file's ramp.
    if (e.repeat === true && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      return;
    }

    var el = e.target;
    ...
```

Then add a gate check that dispatches `keydown{key:'Enter', repeat:true}` on the Undo button ten
times and asserts `undoDepth()` moved by at most one.

---

### WR-05: the open picker's selection marks go stale when state changes underneath it

**File:** `cats-vs-mechs.html:2096-2143` (`picker`), `cats-vs-mechs.html:2901-2915` (the Ctrl+Z listener)
**Confidence:** HIGH — reproduced.

**Issue:** `App.render.picker()` runs only from `UI_HANDLERS.openTokenPicker` and from the tail of
`onPickerPress`. Nothing repaints it on an arbitrary commit. `[S08]`'s Ctrl+Z listener lives on
`document` and only steps aside for `INPUT` / `TEXTAREA` / `contentEditable` — a picker swatch is a
`<button>`, so Ctrl+Z with focus inside the open dialog reaches `App.ops.undo()`.

Measured: open the Health picker, click the Triangle swatch (board and state both become `tri`),
press Ctrl+Z. State and board correctly return to `sq`; the dialog still marks **Triangle** as the
live shape, with the `pk-sw--on` outline and the tick, and `dlg.dataset.sig` still reads
`hp/tri/green/`. The student is looking at a picker asserting a value the board does not hold.

It self-heals on close-and-reopen (the sig comparison at line 2109 catches the difference), so the
window is bounded — but it is the window in which the student is actually using the surface.

**Fix:** repaint the picker from the render frame rather than only from its own handler. The
cheapest correct spelling, given `picker()` is already a no-op when the sig matches, is to have
`[S06]`'s `sync()` call it when the dialog is open, with the open token id passed in from
`[S07.2]`. Failing that, at minimum have `[S07.2]` clear `dlg.dataset.sig` on `close` so a reopen
can never be served a stale early return, and repaint after `undo()`.

---

### WR-06: pressing the already-selected swatch commits a no-op restyle and pushes an undo entry

**File:** `cats-vs-mechs.html:2697-2721` (`onPickerPress`), `cats-vs-mechs.html:1468-1530` (`setTokenStyle`)
**Confidence:** HIGH — reproduced: pressing the live `sq` swatch on a board already using `sq`
produced `commits +1` and `undoDepth +1`.

**Issue:** Every other repeat-capable transformer in `[S05]` reports whether it moved, and the file
argues at length for why (`nudgeFactionAp` and siblings, lines 1250-1258: "at 40ms a step, a hold
saturates against the clamp in about four seconds and would then issue roughly 25 no-op commits a
second, each one a full deep clone of state"). `setTokenStyle` has no such guard, and
`onPickerPress` dispatches unconditionally for any swatch press.

`picker()`'s own comment claims the opposite:

> The same signature idiom syncRow uses, for the same reason: a repaint that changes nothing must
> touch no nodes, so clicking the swatch that is already live does not rebuild the grid under the
> student's finger.

That is true of the *repaint* and false of the *commit* underneath it. Each such press deep-clones
state twice (`thaw` + `freeze`), pushes an undo entry, and schedules a frame. The `token <id>` label
coalesces presses inside 500 ms, so a student tapping around the grid can leave several
do-nothing Ctrl+Z steps between them and the edit they want to take back.

**Fix:** give `setTokenStyle` the same `moved` shape its `nudge*` siblings have, and skip the commit
when nothing changes.

```js
    var t = App.state.get().build.tokens[tokenId];
    var same = (p.shape === undefined || p.shape === t.shape)
      && (p.color === undefined || p.color === t.color)
      && (p.glyph === undefined || p.glyph === t.glyph);
    if (same) { return false; }   // no commit, no undo entry, no frame
```

and return `true` from the committing path, matching the boolean contract `nudgeFactionAp`
established.

---

### WR-07: an error raised while the picker is modal renders the recovery panel underneath it, inert and unreachable

**File:** `cats-vs-mechs.html:367-368` (`.err-panel`), `cats-vs-mechs.html:2820-2853` (`fail`)
**Confidence:** MEDIUM — derived from specified `<dialog>` behaviour (a `showModal()` dialog is
promoted to the top layer and everything outside it becomes inert). **Not executable here — no
browser.** Verify before ranking.

**Issue:** `.err-panel` is `position:fixed; z-index:50` in the normal stacking context. A dialog
opened with `showModal()` sits in the top layer, which is above every `z-index` in the document, and
makes the rest of the document inert — not clickable and not focusable. So while the picker is open:

- the styled error panel paints behind the dialog and its backdrop
  (`.pk::backdrop{background:color-mix(in srgb, var(--bg) 76%, transparent)}` is 76% opaque, so it
  is not even legible through it);
- `dismiss.focus()` at the end of `fail()` silently does nothing, because the button is inert;
- "Dismiss and continue" and "Reset to Workshop 16 defaults" cannot be clicked.

Reachable paths while the modal is up: the `document`-level Ctrl+Z listener (which still fires and
whose `App.ops.undo()` runs through `wrap`), the `window` `error` and `unhandledrejection` safety
nets, and any throw out of `onPickerPress` / `App.render.picker`. D-15 states recovery has to be one
click "even then", and the realistic failure moment is an instructor mid-demo — with a modal open,
it is zero clicks.

**Fix:** move the panel into the top layer alongside the dialog when one is open, or close any open
dialog before showing it. The smallest change that keeps the panel a plain element is to close the
picker from `fail()`:

```js
  function fail(label, err, isTerminal) {
    if (isTerminal === true) { terminal = true; }

    // A modal <dialog> sits in the top layer and makes the rest of the
    // document inert, so a panel raised behind one cannot be read or
    // dismissed. Recovery has to stay one click (D-15).
    var open = byId('tok-picker');
    if (open && open.open === true && typeof open.close === 'function') { open.close(); }
    ...
```

The alternative — making `.err-panel` a `<dialog>` itself — is cleaner but changes the panel's
non-modal semantics and would need its own review.

---

### WR-08: `applyField`'s absolute path forwards an unvalidated page-supplied `data-act` into `App.ops.dispatch`

**File:** `cats-vs-mechs.html:2400-2406`
**Confidence:** HIGH — reproduced: a field carrying `data-act="alive"` reached `setAlive` and
surfaced `No fight in progress`.

**Issue:** The delta half of the same function allowlists the act by construction, and says why:

```js
// The field's data-act names its ABSOLUTE setter; this names the delta
// sibling. An allowlist by construction, for the same reason [S05]'s dispatch
// is one: a data-act read off the page is a caller-supplied key.
var NUDGE_OF = { ap: 'nudgeAp', maxHp: 'nudgeMaxHp', shield: 'nudgeShield' };
```

The absolute half two functions below does the opposite — it passes `d.act` straight through:

```js
function applyField(el, parsed) {
  if (parsed.kind === 'delta') { return nudgeField(el, parsed.n); }
  var d = el.dataset;
  return App.ops.dispatch(d.act, {          // <-- raw page-supplied key
    side: d.side, unitId: d.unit, value: parsed.n
  });
}
```

`App.ops.dispatch` is itself a switch with `default: throw`, so the reachable set is bounded to
real ops — but it is bounded to *all* of them, not to the three a field is allowed to drive. A
field node whose act drifted (a Phase 5 fight-health field, a typo in a later builder) would fire
`alive`, `reset`, `startFight`, `removeUnit` or `undo` on blur instead of failing at the page
boundary where the mistake is. Not exploitable today — `stepper()` is the only builder and it only
ever writes `ap` / `maxHp` / `shield` — but it is precisely the asymmetry the `NUDGE_OF` comment
argues against, and the file's stated posture is that a guard which lives only in one direction is
not a guard.

**Fix:** derive both directions from one table.

```js
  // The absolute setter and its delta sibling, keyed by the act a field is
  // ALLOWED to carry. Both directions read from one table, so a field whose
  // data-act drifts fails here rather than firing whatever op it names.
  var FIELD_OPS = {
    ap:     { set: 'ap',     nudge: 'nudgeAp' },
    maxHp:  { set: 'maxHp',  nudge: 'nudgeMaxHp' },
    shield: { set: 'shield', nudge: 'nudgeShield' }
  };

  function fieldOp(el, which) {
    var act = el.dataset.act;
    if (!Object.prototype.hasOwnProperty.call(FIELD_OPS, act)) {
      throw new Error('No ' + which + ' op for "' + String(act) + '"');
    }
    return FIELD_OPS[act][which];
  }
```

---

### WR-09: `--topbar-h` is used as a fixed sticky offset while `#topbar` is `min-height` with a wrapping cluster, and the sticky bar is narrower than the board it covers

**File:** `cats-vs-mechs.html:31`, `cats-vs-mechs.html:94-98`, `cats-vs-mechs.html:114-123`, `cats-vs-mechs.html:133-139`
**Confidence:** MEDIUM — mechanically evident from the declarations; **no browser available to
render it.** This is a rehearsal item, and CLAUDE.md already flags projector legibility as
empirically unanswered.

**Issue:** Two independent mismatches in the sticky layout:

1. `#topbar` is `min-height:var(--topbar-h)` (64px) and contains
   `.brd-cluster{... flex-wrap:wrap}` holding six items — the "Token appearance" label at 18px plus
   five pill buttons at `padding:8px 16px; min-height:36px; font-size:18px` — alongside
   `.brd-brand` at 20px. `#strip` then sticks at `top:var(--topbar-h)`, a *fixed* 64px. The moment
   the cluster wraps to a second row (narrow window, larger projector text scaling, or one more
   control — the markup comment at line 403 explicitly plans for Phase 4 and Phase 5 to add more),
   the topbar exceeds 64px and the sticky strip parks underneath it, overlapped. There is no error
   and no warning; the offset simply becomes wrong.
2. `#topbar` lives inside `.shell` at `max-width:1280px`, while `#board` is widened to
   `min(1600px, 100vw - 44px)` with a compensating negative margin. On the 1920px projector this
   file targets, the board is ~320px wider than the sticky bar, so board content in the outer
   ~160px on each side scrolls past the top of the viewport with nothing covering it — the sticky
   bar's opaque `background:var(--bg)` and `border-bottom` stop short of the content they are
   meant to sit above.

**Fix:** for (1), stop hardcoding the offset — either measure it once and publish it as a custom
property, or make the two agree by construction:

```css
  #topbar{
    /* height, not min-height: --topbar-h is also #strip's sticky offset, and a
       wrapping cluster would otherwise leave the two disagreeing silently. */
    height:var(--topbar-h);
    ...
  }
  .brd-cluster{ ... flex-wrap:nowrap; ... }   /* or raise --topbar-h and allow two rows */
```

For (2), give `#topbar` the same width/margin treatment `#board` already has, so the bar spans what
it covers. Both belong on the rehearsal checklist CLAUDE.md already calls for.

---

## Info

### IN-01: `unitCard` hardcodes the roster floor instead of using `App.ops.MIN_UNITS`

**File:** `cats-vs-mechs.html:1792`
**Issue:** `rm.disabled = faction.units.length <= 1;` — a bare `1` where `App.ops.MIN_UNITS` exists
and is exported. The sibling line 1830 correctly uses a named constant (`MAX_UNITS`), and
`[S09.3]` asserts `App.ops.MAX_UNITS === App.render.MAX_UNITS` precisely so the page guard and the
throwing guard cannot drift. `MIN_UNITS` gets neither the constant nor the cross-check. `[S05]`'s
own comment at line 1136 makes this argument ("`99` was a bare literal at three call sites… one
number in seven places, quietly waiting to drift apart").
**Fix:** `rm.disabled = faction.units.length <= App.ops.MIN_UNITS;` and add the matching
`t.eq('the roster floor is one number, not two', ...)` row beside the existing ceiling assertion.

### IN-02: glyph swatches carry no visible text label, unlike the shape and colour swatches

**File:** `cats-vs-mechs.html:2127-2129` (`fillGrid` call), `cats-vs-mechs.html:2061-2080` (`pickerSwatch`)
**Issue:** `fillGrid`'s glyph label function returns `''` for every index but 0, and
`pickerSwatch` skips the label node when it is empty. `[C07]`'s banner states the surface's rule as
"a permanent visible label at the 18px minimum, never an icon and never a `title=` tooltip", and
`SHAPE_NAMES` / `COLOR_NAMES` honour it. The 28 emoji swatches are icon-only; their accessible name
is the raw code point. The in-file rationale ("the rest show the emoji itself at token size, which
is exactly what the student is choosing") is reasonable but leaves the surface half-consistent with
its own stated rule.
**Fix:** either add short names (the `GLYPHS` array already carries one per entry as a trailing
comment — `green heart`, `high voltage`, …; lift them into a parallel frozen `GLYPH_NAMES` array so
index stability is preserved) or set `aria-label` from the same source.

### IN-03: a 3-digit over-range entry clamps silently while a 4-digit one errors

**File:** `cats-vs-mechs.html:2360` (`FIELD`), `cats-vs-mechs.html:1113-1120` (`int`)
**Issue:** Measured: typing `500` into a health field commits **99** with no message; typing `1000`
raises `type a whole number, or +5 / -8 to adjust`. The boundary is the regex's `{1,3}`, not
`MAX_ALLOC`, so the same class of mistake gets two different treatments depending on digit count.
The clamped value does become visible on blur, so nothing is lost — this is a consistency note.
**Fix:** either widen the regex and let `int()` own the whole out-of-range story, or say so:
`{1,3}` → keep, and have `parseField` return a `why` when `n > App.ops.MAX_ALLOC`.

### IN-04: the interaction gate counts `stats().commits`, which includes non-undoable `commitUi` calls

**File:** `tests/selftest-node.cjs:470-472`, `cats-vs-mechs.html:2465`
**Issue:** ALLOC-07's criterion is "twenty rapid clicks produce exactly twenty changes", and the
gate measures it with `A.state.stats().commits`. `onPointerDown` line 2465 fires
`App.ops.setUi('kbdNav', false)` — a `commitUi`, which increments the same counter — whenever
kbdNav is live. The gate's checks 1/3/4 only read clean because earlier lines happen to leave
kbdNav false; `[S09.5]` had to add an explicit reset row for the same reason. A future reordering
that leaves kbdNav true would make the counts read one high for a reason unrelated to the bug they
hunt.
**Fix:** measure `undoDepth()` plus the actual roster/health value, or expose a separate
`buildCommits` tally that `commitUi` does not touch.

### IN-05: `pickerTok` is never cleared when the dialog closes

**File:** `cats-vs-mechs.html:2645`, `cats-vs-mechs.html:2687-2694`
**Issue:** `pickerTok` retains the last-opened token id indefinitely. Harmless today — every reader
(`onPickerClose`, `App.render.picker`) validates against `TOKEN_IDS` — but it means "which picker
is open" is unanswerable from the variable that names itself as holding exactly that, which is the
kind of drift the transient-state comment above it is trying to prevent.
**Fix:** `pickerTok = null;` at the end of `onPickerClose`, after the opener has been refocused.

### IN-06: the forbidden-pattern scan does not cover dynamic `import()`

**File:** `tests/selftest-node.cjs:32-47`
**Issue:** The scan blocks `type="module"`, `fetch(`, `XMLHttpRequest`, `eval`, `new Function` and
the markup sinks, but a dynamic `import('...')` is valid syntax inside a classic `<script>` and
would slip past every rule. CLAUDE.md lists `import` (static *or* dynamic) as verified-blocked on
`file://`, so this is a gate completeness note rather than a live risk — the failure mode is a
future edit that looks fine to the gate and dies silently in the browser.
**Fix:** add `{ label: 'dynamic import', re: /\bimport\s*\(/ }` to `FORBIDDEN`.

---

## What could not be verified

Stated explicitly rather than guessed, per this project's culture:

- **No browser, no Playwright in this repo.** Everything was executed in Node against the project's
  own stub DOM. Real `<dialog>` top-layer and inert semantics (WR-07), `click`-on-held-Enter
  repetition (WR-04), `pointerdown` behaviour for non-primary buttons under a native context menu
  (WR-03), pointer capture, and **all** CSS layout and legibility claims (WR-09) are unexecuted.
- **Focus event fidelity.** The stub's `focus()` sets `activeElement` without dispatching
  `focusin`, so the interaction between programmatic focus restore in `withPreservedFocus`,
  `onFocusIn`'s `el.select()`, and the subsequent `setSelectionRange(caret, caret)` was reasoned
  about but not executed. The ordering looks correct; a browser run would settle it.
- **Emoji rendering.** `[S09.6]` mechanically proves every `GLYPHS` entry is a single code point,
  and all 29 have `Emoji_Presentation=Yes` so none needs a variation selector — but whether they
  render as colour glyphs on the actual workshop machine is a rehearsal question.
- **Reduced-motion and the `tok-pop` entry animation** were read, not observed.

---

_Reviewed: 2026-08-27T17:25:10Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
