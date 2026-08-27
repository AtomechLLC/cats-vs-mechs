# Phase 2: Allocation Surface — Pattern Map

**Mapped:** 2026-08-27
**Files analyzed:** 1 source file modified (`cats-vs-mechs.html`), 1 dev-only test file modified (`tests/selftest-node.cjs`)
**Analogs found:** 3 / 3 work units

> **Scoping note.** This project ships one self-contained HTML file. There are no new files in
> Phase 2 — every work unit fills a region that already exists as a declared no-op stub or adds a
> `[SNN]`/`[CNN]` sibling next to a written one. The unit of pattern assignment is therefore the
> **work unit → section**, not the file. All three work units have a real in-repo analog; none had
> to be invented.

---

## File Classification

| Work unit | Sections owned | Role | Data flow | Closest analog | Match quality |
|---|---|---|---|---|---|
| **02-01** render + style | `[S06] RENDER`, `<style>` `[C03] [C04] [C06]`, static shell markup in `<body>` | view / renderer + stylesheet | state → DOM, per-frame reconcile | `[S09] SELFTEST` `report()` (cats-vs-mechs.html:1179–1218) for the DOM-building idiom; `../game-feel-study-guide.html:7–178` for the stylesheet shape | **exact** for the DOM idiom, **exact** for CSS |
| **02-02** interactions + ops | `[S07] INTERACTIONS`, additions to `[S05] OPS`, `tests/selftest-node.cjs` gate | controller / event handler + transformer | DOM event → op → commit; request-response | `[S08] BOOT` `start()` listener wiring (cats-vs-mechs.html:984–1052) for delegation+`wrap`; `[S05] OPS` `setUnitMaxHp` (710–715) for the op body; `tests/selftest-node.cjs:90–131` for the gate | **exact** |
| **02-03** token vocabulary + picker | `[S01] DATA` `tokens` addition, `[S05].setTokenStyle`, `<style>` `[C05] [C07]` | model/data + transformer + view | static data → render; validated write | `[S01] DATA` `DEFAULTS` (cats-vs-mechs.html:229–253) for the data literal; `[S05] OPS` `setUi` (784–796) for the key+value allowlist op | **exact** |

**Cross-cutting analog for every unit:** the section banner + `#region` + IIFE-returning-a-frozen-surface
shape, which is uniform across `[S00]`–`[S10]`.

---

## Pattern Assignments

### 02-01 — `[S06] RENDER` (view, state → DOM)

**Primary analog:** `cats-vs-mechs.html` `[S09] SELFTEST` `report()`, lines 1179–1218. It is the
only function in the repo today that builds a page subtree from data, and it does so under exactly
the constraints Phase 2 inherits: no markup sink, `createElement` + `textContent` only, class names
written from data.

**The stub to grow into** (lines 841–858) — keep the banner, replace only the two function bodies:

```js
/* ===================== [S06] RENDER =====================
 * Produces the page from state, in two tiers, and this split is decided here
 * so Phase 2 inherits it rather than re-deciding it:
 *   structure(state) — the rare rebuild. Runs when the roster's shape changes.
 *   sync(state)      — the per-tick keyed reconcile. Updates text and classes
 *                      in place so the node under the cursor, and the focused
 *                      input, are never destroyed mid-interaction.
 * Never mutates state. Never binds per-node listeners; that is [S07]'s job.
 * deps: App.model, App.data
 * owner: Phase 2, plan 02-01
 * ======================================================== */
// #region [S06] RENDER
App.render = Object.freeze({
  // Declared no-ops until Phase 2 plan 02-01 fills them in.
  structure: function () {},
  sync: function () {}
});
// #endregion [S06] RENDER
```

Note the shape: `App.render` is a **frozen object literal**, not an IIFE, because the stub has no
private state. Phase 2 needs private helpers (`withPreservedFocus`, `makeToken`, `syncRow`), so
convert it to the IIFE form used by `[S01]`, `[S02]`, `[S03]`, `[S05]`, `[S08]`, `[S09]` — copy that
wrapper verbatim from `[S02] MODEL` (lines 281–329), which is the smallest instance:

```js
App.model = (function () {
  'use strict';

  function unitEhp(unit) { … }
  …
  return Object.freeze({
    unitEhp: unitEhp,
    factionEhp: factionEhp,
    …
  });
})();
```

**DOM-building pattern to copy** (lines 1195–1215) — element creation, class from data, text via
`textContent`, `appendChild`, and `replaceChildren()` as the permitted clear:

```js
    rows.replaceChildren();
    …
    ordered.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'st-row ' + (r.pass ? 'st-row--pass' : 'st-row--fail');

      var head = document.createElement('b');
      head.textContent = (r.pass ? 'PASS' : 'FAIL') + ' — ' + r.suite;
      row.appendChild(head);
      …
      rows.appendChild(row);
    });
```

`replaceChildren()` is already in the shipped file and already passes the forbidden-pattern scan —
02-01 does not need to justify it again. It is the correct clear for `structure()` and for the
compaction-mode switch in `syncRow()`.

**Missing-node guard pattern** (lines 1180–1184) — render must survive being loaded with no page,
because `tests/selftest-node.cjs` runs the whole script in a bare `vm` sandbox with **no `document`**:

```js
  function report(result) {
    if (typeof document === 'undefined') { return; }
    var panel = document.getElementById('selftest-report');
    var summary = document.getElementById('selftest-summary');
    var rows = document.getElementById('selftest-rows');
    if (!panel || !summary || !rows) { return; }
```

`[S08] BOOT.byId` (lines 891–894) is the same guard factored into a helper. **Copy one of these two
into `[S06]`.** Without it, `App.state.flush()` inside the Node gate throws the moment `render`
stops being a no-op — which is the single most likely way 02-01 turns the currently-green
81/81 suite red.

**Static shell markup to add** (`<body>`, currently lines 100–117). The existing shell is the analog
for indentation, id naming and the `class`-then-`id` attribute order:

```html
<main class="shell" id="app">

  <div class="shell-head">
    <h1>Cats vs Mechs</h1>
    <div class="muted">Workshop 16 — allocation and fight sandbox</div>
  </div>

  <div class="board" id="board">
    <p class="muted" id="board-empty">The allocation board renders here.</p>
  </div>
```

`#app` and `#board` already exist and are the delegation roots. `#topbar`, `#col-cats`, `#strip`,
`#col-mechs` are added as static siblings here, **not** built by `structure()` — same reasoning as
`#err-panel` (lines 119–128) and `#selftest-report` (111–115) being static: a listener bound to a
static root outlives every rebuild.

---

### 02-01 — the `<style>` block (`[C03] [C04] [C06]`)

**Primary analog:** `C:\Projects\GameDesignSkills\GameFeelDirectionCourse\game-feel-study-guide.html`
lines 7–178 — the sibling course artifact whose visual language this file is required to match.
**Secondary analog:** the already-written `[C00]`–`[C02]`, `[C08]`, `[C09]` in `cats-vs-mechs.html`
lines 8–95, which are that stylesheet already ported into the `[CNN]` banner convention.

**The tokens are already imported — do not re-derive them.** `cats-vs-mechs.html:9–26` is
`game-feel-study-guide.html:8–24` verbatim plus two artifact-specific additions:

```css
    --radius:14px;
    /* artifact-specific */
    --coral:#ff8a5c;--maxw:1280px;
```

That trailing comment is the pattern for adding `--tok`, `--topbar-h` and any Phase 2 variable:
append below the shared set with a comment marking it as this artifact's own, never edit the
shared block.

**Section-banner format in CSS** (line 43, and 70, 85):

```css
  /* ===================== [C02] SHELL ===================== */
```

**Card / panel surface to reuse rather than restyle** (`cats-vs-mechs.html:48–50`, itself
`game-feel-study-guide.html:88–90`):

```css
  .card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);
    padding:20px 22px;margin:14px 0}
  .card.tight{padding:16px 18px}
```

The unit card (`[C04]`) should be `.card` plus a `.unit-*` modifier, not a new surface.

**Modifier-suffix convention** — `[C09]` is the in-file precedent for BEM-ish state classes written
by the renderer, which is exactly what `render.sync()` will do (`cats-vs-mechs.html:89–94`):

```css
  .st-row{border:1px solid var(--line);border-radius:9px;padding:8px 12px;font-size:14px}
  .st-row--pass{border-left:3px solid var(--green)}
  .st-row--fail{border-left:3px solid var(--coral)}
  .st-row b{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.6px;margin-bottom:3px}
  .st-row--pass b{color:var(--green)}
  .st-row--fail b{color:var(--coral)}
```

Research §6 prescribes region prefixes (`.brd-`, `.unit-`, `.tok-`, `.stp-`, `.pk-`); `.st-row--pass`
is the shipped instance of that same rule, so the prefix convention is not new — it is already the
file's habit.

**Button chrome analog** (`cats-vs-mechs.html:80–83`) — the stepper `−`/`+`, the per-unit remove
control (D-06 "quiet outline, not filled destructive") and the top-bar undo all descend from this:

```css
  .err-btn{background:var(--panel);border:1px solid var(--line);color:var(--ink);
    border-radius:999px;padding:6px 14px;font:inherit;font-size:13px;cursor:pointer}
  .err-btn:hover{border-color:var(--accent)}
  .err-btn--danger{border-color:var(--accent-2);color:var(--accent-2)}
```

`--danger` is border+text only, never a filled fill — that is already the "available but not
inviting" treatment D-06 and the `<specifics>` note ask for.

**Numeric readout** (`cats-vs-mechs.html:40–41`) — the delta-typing input and the `n×` compaction
count both need this, and the class already exists:

```css
  /* every numeric readout in this file gets stable digit widths */
  .num{font-variant-numeric:tabular-nums}
```

**Sticky precedent** (`game-feel-study-guide.html:39–43`) — the sibling's sidebar is the repo's only
existing `position:sticky`, and it is the cautionary case for research §6 G-1 (it *is* an
`overflow-y:auto` ancestor):

```css
  .sidebar{
    width:300px;flex:0 0 300px;position:sticky;top:0;height:100vh;
    overflow-y:auto;background:var(--bg-2);border-right:1px solid var(--line);
    padding:22px 16px 60px;
  }
```

`#topbar` and `#strip` must **not** copy the `overflow-y:auto`. Write G-1 as a comment above the
sticky rule, as research §6 prescribes.

**Hidden-state pattern** (`cats-vs-mechs.html:73` and `86`) — how the reserved center strip, the
setup-only add/remove controls (D-05) and the picker dialog are hidden, using the `hidden` attribute
plus a display override rather than a JS style write:

```css
  .err-panel[hidden]{display:none}
  .st-report[hidden]{display:none}
```

(Both exist because `display:flex`/`display:grid` beat the UA `hidden` rule. Any new flex/grid
region that toggles needs the same line.)

**Responsive breakpoint already chosen** (`cats-vs-mechs.html:54`, `game-feel-study-guide.html:94`):
`@media(max-width:760px){.g2,.g3{grid-template-columns:1fr}}` — the D-01 two-column board should
collapse at the same breakpoint rather than picking a new one.

---

### 02-02 — `[S07] INTERACTIONS` (controller, DOM event → op)

**Primary analog:** `cats-vs-mechs.html` `[S08] BOOT` `start()`, lines 1013–1024 — the only listener
the file binds today, and it is already a delegated, `wrap`-ed, target-filtered handler.

**The stub to grow into** (lines 860–873), again as an IIFE once it needs private hold-timer state:

```js
// #region [S07] INTERACTIONS
App.interactions = Object.freeze({
  // Declared no-op until Phase 2 plan 02-02 fills it in.
  bind: function () {}
});
// #endregion [S07] INTERACTIONS
```

**Listener pattern — copy this shape exactly** (lines 1013–1024). Note four things Phase 2's
handlers must all reproduce: `App.boot.wrap(label, fn)` wrapping, an early-return target filter, a
`return` (not a throw) for "not mine", and exactly one `App.ops.*` call at the bottom:

```js
      document.addEventListener('keydown', wrap('undo shortcut', function (e) {
        if (!(e.ctrlKey || e.metaKey)) { return; }
        if (e.shiftKey) { return; }
        if (e.key !== 'z' && e.key !== 'Z') { return; }

        var el = e.target;
        var tag = el ? el.tagName : '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || (el && el.isContentEditable)) { return; }

        e.preventDefault();
        App.ops.undo();
      }));
```

Inside `[S07]` the wrapper is reached as `App.boot.wrap(...)` at the call site, never captured at
section-body scope — see the TOC rule at lines 147–149 and the `[S03]` lazy-`cur` comment at
371–377, which exists specifically to enforce it.

**The error-boundary contract** (lines 973–982) — the reason every listener is wrapped. 02-02 adds
no new boundary:

```js
  function wrap(label, fn) {
    return function () {
      try {
        return fn.apply(this, arguments);
      } catch (err) {
        fail(label, err, false);
        return undefined;
      }
    };
  }
```

`fail(..., false)` is non-terminal — the board stays on screen. This is why a `nudge` that hits the
clamp bound should return `false` rather than throw (research §Code Examples): a throw would flash
the panel on every over-press.

**Second binding precedent** (lines 1029–1040) — a listener bound to `#board` via `byId`, showing
that a root-scoped delegated listener is already the established form:

```js
        if (board) {
          board.addEventListener('click', wrap('board click', function () {
            throw new Error('Deliberate handler failure (#throwhandler)');
          }));
        }
```

**Where `bind()` is called from** (line 1026) — do not add a second call site:

```js
      App.interactions.bind();
```

---

### 02-02 — additions to `[S05] OPS` (transformer, validated write)

**Primary analog:** `setUnitMaxHp`, lines 710–715 — the exact op `nudgeUnitMaxHp` is a sibling of:

```js
  function setUnitMaxHp(side, unitId, maxHp) {
    requireSide(side);
    App.state.commit('maxHp ' + side + '/' + unitId, function (s) {
      findUnit(side, unitId, s.build[side].units).maxHp = int(maxHp, 0, 99, 'max health');
    });
  }
```

Four load-bearing details to copy: `requireSide` **outside** the commit (see the comment at 701–702
— an unknown side must leave no phantom undo step); the label string `'maxHp ' + side + '/' + unitId`
(this is what D-10's 500 ms coalescing keys on, so a nudge op **must reuse the identical label** or
a press-and-hold becomes forty undo entries); `int(value, min, max, what)` as the value boundary; and
one commit per op, no exceptions.

**Value boundary to call, not re-implement** (lines 638–645):

```js
  function int(value, min, max, what) {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new TypeError('Expected a whole number for ' + what + ', got ' + JSON.stringify(value));
    }
    if (value < min) { return min; }
    if (value > max) { return max; }
    return value;
  }
```

The comment above it (636–637) already assigns the string→number conversion to `[S07]`:
*"A DOM input hands back a string, so [S07] converts it explicitly at that one call site."*
Research §Code Examples honors this with `Number(d.step)` in `fire()`. Do not move the conversion
into `int()`.

**Key boundary to call, not re-implement** (lines 655–662):

```js
  var SIDES = ['cats', 'mechs'];

  function requireSide(value) {
    if (SIDES.indexOf(value) === -1) {
      throw new Error('Unknown side "' + String(value) + '"');
    }
    return value;
  }
```

**Dispatch table to extend** (lines 806–819) — new acts go in this switch, and this is the only
entry point `[S07]` may call:

```js
  function dispatch(act, payload) {
    var p = payload || {};
    switch (act) {
      case 'ap': return setFactionAp(p.side, p.value);
      case 'maxHp': return setUnitMaxHp(p.side, p.unitId, p.value);
      …
      default: throw new Error('Unknown op: ' + act);
    }
  }
```

**The reservation comment to update** (lines 821–825) — Phase 2 removes its own two lines from it
and leaves Phase 5's:

```js
  // DELIBERATELY ABSENT, do not "helpfully" add them here:
  //   - roster add and remove, and the stepper nudge — Phase 2, plan 02-02
  //   - turn and round advance, action-point spending, damage application and
  //     the fight record — Phase 5, plan 05-01
```

**Structural-frame precedent** (lines 483–486, inside `undo()`) — the shape-change ops
(`addUnit`/`removeUnit`) follow their commit with the same call:

```js
      invalidate({ structural: true });
```

From `[S05]` this is written `App.state.invalidate({ structural: true });`, matching how
`restore()` (line 567) and `boot.start()` (line 1044) already spell it.

---

### 02-02 — `tests/selftest-node.cjs` interaction gate

**Primary analog:** the file itself, `tests/selftest-node.cjs:90–131`. A stub-DOM gate is a new
*capability* for this harness, but it slots into an existing, explicitly-numbered section structure.

**Section comment convention** (lines 60, 90, 112, 133):

```js
// --- 2. load the single script body into a bare sandbox -----------------------
```

**The sandbox to extend** (lines 96–106) — a stub-DOM gate adds a minimal `document`/`location` to
this object. The comment above it states the current design intent, so **changing it means editing
that comment too**:

```js
// Deliberately no `document` and no `location`: [S10] LAUNCH stays inert and
// App.hasFlag takes its undefined-location path.
const sandbox = {
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  queueMicrotask: queueMicrotask,
  requestAnimationFrame: (fn) => setTimeout(fn, 0)
};

vm.runInNewContext(match[1], sandbox, { filename: 'cats-vs-mechs.html' });
```

Supplying a `document` makes `[S10] LAUNCH` (line 1564) fire `App.boot.start()`. Either keep the
main sandbox document-free and build a **second** context for the DOM gate, or accept boot and
assert on it — the plan must state which, because it changes what 81/81 means.

**Gate-failure pattern** (lines 49–52 and 147–149):

```js
function fail(message) {
  console.error(message);
  process.exit(1);
}
…
if (perfElapsed >= PERF_BUDGET_MS) {
  fail('PERF: 100 commits took ' + perfElapsed + ' ms, over the ' + PERF_BUDGET_MS + ' ms budget');
}
```

**Counted-assertion pattern for "exactly twenty"** — the in-file precedent is the burst-coalescing
block at `cats-vs-mechs.html:1490–1499`, which counts undo depth across a loop:

```js
    var depthB = App.state.undoDepth();
    for (i = 0; i < 40; i++) {
      App.state.commit('burst', function (s) { s.build.cats.ap = 12; });
    }
    t.eq('burst coalesces to one entry', App.state.undoDepth() - depthB, 1);
```

ALLOC-07's "20 pointerdown → 20 commits" gate is the same shape against
`App.state.stats().commits` (exported at line 574–576) instead of `undoDepth()`.

---

### 02-03 — `[S01] DATA` token vocabulary (model/data)

**Primary analog:** `DEFAULTS`, lines 229–253:

```js
  var DEFAULTS = deepFreeze({
    schema: 1,
    cats: {
      id: 'cats',
      name: 'Cats',
      ap: 3,
      units: makeUnits('c', 'Cat', 9, { maxHp: 3, shield: 0 }),
      actions: [
        { id: 'slash', name: 'Slash', dmg: 1, keywords: [] },
        …
```

The `tokens:` map goes inside this literal, as a peer of `cats`/`mechs`, and inherits the deep
freeze for free. Two shipped conventions to match: **enumerated ids as short lowercase strings**
(`'slash'`, `'cats'`, `'slowdown'`) and **a trailing comment naming the board source**, as at 224–228:

```js
  // D-01: a literal reading of the board's token rows. A starting point, not a
  // conclusion — the Phase 5 playtest gate (plan 05-03) is the mechanism that
  // retunes these, and this object is the single place that edit happens.
```

**Ship-the-shape-before-the-mechanic precedent** — `dead` shipping with no consumer copies exactly
what `shield` already does (lines 686–689):

```js
  // Like `log`, the field ships now and its writer arrives with the phase that
  // has a surface to spend from — Phase 5, plan 05-01. Nothing here decides
  // how a shield behaves; the table still rules that.
```

**Shape assertion that must be updated** — `cats-vs-mechs.html:1392`. Adding `tokens` to `build`
turns this row red the moment 02-03 lands:

```js
    t.eq('the board has its three build keys', Object.keys(App.state.get().build), ['schema', 'cats', 'mechs']);
```

---

### 02-03 — `[S05].setTokenStyle` (transformer, allowlisted write)

**Primary analog:** `setUi`, lines 784–796 — the file's existing key-**and**-value allowlist op, and
the precedent research §4 names explicitly:

```js
  var UI_KEYS = ['kbdNav'];

  function setUi(key, value) {
    if (UI_KEYS.indexOf(key) === -1) {
      throw new Error('Unknown ui key "' + String(key) + '"');
    }
    if (typeof value !== 'boolean' && typeof value !== 'string' && !Number.isInteger(value)) {
      throw new TypeError('ui.' + key + ' must be a boolean, a whole number or a string');
    }
    App.state.commitUi('ui ' + key, function (s) {
      s.ui[key] = value;
    });
  }
```

Copy: the module-scope `_KEYS` array, the `indexOf(...) === -1` test, the `String(value)` coercion
inside the message (so a symbol or object cannot throw while building the error), and the explicit
field assignment inside the mutator. **Diverge on one point:** `setUi` uses `commitUi` (not
undoable); `setTokenStyle` uses `commit` — D-13 puts token appearance in `build`, which makes it
undoable and shareable. The label convention is `'token ' + tokenId`.

The comment above `setUi` (776–783) already records why the allowlist exists; a new op should
reference it rather than restate the reasoning at length.

---

### 02-03 — `[C05] [C07]` picker styles

**Analog for the modal:** `#err-panel` (`cats-vs-mechs.html:119–128` markup, `70–83` CSS). It is a
static-in-shell, `hidden`-toggled, `role="alert"` panel with an action row — the closest thing in
the repo to a picker surface. If the plan chooses `<dialog>` (CLAUDE.md endorses it, Baseline since
2022-03) there is **no in-repo analog for `<dialog>`/`showModal`** — say so in the plan and take the
pattern from research rather than from a file.

**Analog for shape/color swatch chrome:** `.ex` (`cats-vs-mechs.html:67–68`), the shipped example of
a small bordered chip built from a color token at low alpha:

```css
  .ex{display:inline-block;font-size:12px;color:var(--green);background:rgba(91,217,156,.08);
    border:1px solid rgba(91,217,156,.25);padding:2px 9px;border-radius:6px;margin-top:6px}
```

Research §6 prescribes `color-mix()` for exactly this derivation instead of the hand-written
`rgba(91,217,156,.08)` literal — the swatch is the analog, `color-mix(in srgb, var(--green) 8%, transparent)`
is the modern spelling of it.

---

## Shared Patterns

### 1. Section banner + `#region` + owner line

**Source:** every section, e.g. `cats-vs-mechs.html:270–280` and `841–852`.
**Apply to:** all three work units, for every new `[SNN]` sub-section and every new `[CNN]` block.

```js
/* ===================== [S02] MODEL =====================
 * PURE derivations. Every function takes the state, or a slice of it, as an
 * argument. …
 * deps: none
 * owner: plan 01-01
 * ======================================================= */
// #region [S02] MODEL
…
// #endregion [S02] MODEL
```

Mandatory fields: what the section is, **`deps:`**, **`owner: <phase>, plan NN-NN`**. Banners sit at
column 0; code is indented two spaces (stated at lines 157–158). Self-test sub-suites use the
lighter one-line form (line 1223): `/* --- [S09.4] SUITE: <name> — owner plan 02-02 --- */`.

### 2. Namespaced IIFE returning a frozen surface

**Source:** `[S02] MODEL` (281–329), `[S05] OPS` (622–838), `[S08] BOOT` (885–1060).
**Apply to:** `[S06] RENDER` and `[S07] INTERACTIONS`, both of which must convert from the frozen
object literal to the IIFE form once they hold private state.

```js
App.model = (function () {
  'use strict';
  … private helpers, module-scope vars …
  return Object.freeze({ /* only the public names */ });
})();
```

`'use strict'` is not decoration here — the banner at 155–156 states it is what makes a write to
frozen state throw instead of failing silently.

### 3. Call-time cross-section reference

**Source:** the TOC rule at 147–149, and the `[S03]` lazy-`cur` comment at 371–377.
**Apply to:** every reference `[S06]` makes to `App.model.*` / `App.data.*`, and every reference
`[S07]` makes to `App.ops.*` / `App.boot.wrap` / `App.state.get`.

Write `App.boot.wrap('label', fn)` at the call site. Never `var wrap = App.boot.wrap;` at section-body
scope. This is the rule WR-11 was filed against.

### 4. No markup sink — `createElement` + `textContent` only

**Source:** `[S09] report()` (1195–1214), `[S08] fail()` (949–953), and the gate at
`tests/selftest-node.cjs:32–47`.
**Apply to:** every string 02-01 and 02-03 put on screen.

The gate scans the **whole document including comments** for
`innerHTML|outerHTML|insertAdjacentHTML|document.write|createContextualFragment|DOMParser|srcdoc`,
`https?://`, `url(`, `@import`, ` src=`, `eval(`, `Function(`. `createElementNS` for SVG is blocked
because the SVG namespace is a URL — this is why token shapes are CSS (`clip-path:polygon()`,
`transform:rotate()`), verified in research §4.

Permitted and already shipped: `replaceChildren()`, `textContent`, `className`, `dataset`,
`el.value` on a form control, `document.createElement`.

### 5. The commit funnel is the only writer

**Source:** `[S03]` banner (332–358), `commit` (412–450), `commitUi` (456–462).
**Apply to:** every op 02-02 and 02-03 add.

One op = one `commit(label, mutator)`. Validation runs **before** the commit call; arithmetic runs
**inside** the mutator (the atomic read-modify-write research §Code Examples requires for a 40 ms
ramp). `[S06] RENDER` never writes state at all; `[S07] INTERACTIONS` never writes state directly.

### 6. Render is reached only through `invalidate()`

**Source:** `frame()` (502–512), `invalidate()` (532–537), `schedule()` (523–530), and boot's first
paint (1044).

```js
  function frame() {
    if (!dirty) { return; }
    dirty = false;
    frames++;
    var state = get();
    if (structural) {
      App.render.structure(state);
      structural = false;
    }
    App.render.sync(state);
  }
```

Two consequences the planner must hold: `structure(state)` **always** runs immediately before
`sync(state)` in the same frame (so `structure` may leave rows empty and let `sync` fill them), and
`render` receives the frozen state as an argument — it must not call `App.state.get()` itself.

### 7. Self-test suite registration

**Source:** `cats-vs-mechs.html:1223–1237` (harness suite), `1239–1301`, `1303–1351`, `1353–1554`.
**Apply to:** every new gate all three units add.

```js
/* --- [S09.0] SUITE: the assertion harness itself — owner plan 01-01 --- */
(function () {
  'use strict';

  App.selftest.suite('assertion harness', function (t) {
    t.eq('key order is not a difference', { a: 1, b: 2 }, { b: 2, a: 1 });
    t.throws('throws() actually sees a throw', function () {
      throw new Error('deliberate');
    });
  });
})();
```

Available assertions (`makeAsserts`, 1109–1147): `t.eq(label, actual, expected)` (key-order
insensitive), `t.ok(label, condition)`, `t.throws(label, fn)`, `t.info(label, value)` — `info` is
always green and is where a timing number goes, never `eq`.

**Restore-what-you-touched rule** (1380–1387 and 1547–1552) — any DOM-touching suite must copy this,
because a suite that leaves the board dirty ships that dirt to an instructor's demo tab:

```js
    var savedAll = JSON.stringify(App.state.get());
    …
    App.state.restore(savedAll);
    t.eq('the suite handed the board back untouched', JSON.stringify(App.state.get()), savedAll);
    t.eq('the suite left no undo history behind', App.state.undoDepth(), 0);
```

### 8. The comment-prose grep trap

**Source:** `.planning/phases/01-foundation-data-state-funnel-undo/01-REVIEW-FIX.md:26–28`.
**Apply to:** all three units — Phase 2 writes more comment prose than any prior phase.

```
grep -ci "counter|rating|balanced|difficulty"   → must be 0
grep -c  "verdict|balanced|rating|difficulty"   → must be 0
grep -c  "innerHTML|eval(|new Function|https?://|<link|type=\"module\"|queueMicrotask|structuredClone"  → must be 0
```

`rating` is a substring of *generating*, *operating*, *iterating*, *decorating*, *separating*. The
shipped file already dodges this — note line 256 says *"faster than the platform's deep-clone call"*
rather than naming `structuredClone`, and line 1247 says *"Walks anything JSON-shaped"* rather than
*"iterating"*. Copy that habit; re-run both greps after writing any comment.

---

## No Analog Found

| Thing | Unit | Reason |
|---|---|---|
| `<dialog>` / `showModal()` | 02-03 | Nothing in the repo or in either sibling artifact uses `<dialog>`. `#err-panel` (a static, `hidden`-toggled, `role="alert"` overlay) is the nearest surface but is not a modal. Take the pattern from CLAUDE.md / research, not from a file. |
| Pointer events, `setPointerCapture`, press-and-hold ramp | 02-02 | The repo binds exactly two listener types today (`keydown`, `click`) and neither repeats. Research §2 and §Code Examples are the source; there is nothing to copy from. |
| `position:sticky` used correctly for a grid item | 02-01 | The only sticky in the repo is `game-feel-study-guide.html:39–43`, which is a flex sidebar with `overflow-y:auto` — a **counter**-example for research §6 G-1, not a template. Take `align-self:start` and `--topbar-h` from research §6. |
| CSS nesting and `color-mix()` | 02-01 / 02-03 | Sanctioned by CLAUDE.md and research §6, but no instance exists in any of the three artifacts. 02-01 sets the house style for both; keep nesting ≤ 2 deep per research §6. |
| Keyed DOM reconcile / delta token sync | 02-01 | `[S09] report()` rebuilds wholesale; nothing in the repo patches in place. Research §1's `setValue` / `syncTokens` / `syncRow` are the source. |

---

## Metadata

**Analog search scope:**
- `C:\Projects\GameDesignSkills\GameFeelDirectionCourse\CatsVsMech\cats-vs-mechs.html` (1,568 lines, read in full)
- `C:\Projects\GameDesignSkills\GameFeelDirectionCourse\CatsVsMech\tests\selftest-node.cjs` (151 lines, read in full)
- `C:\Projects\GameDesignSkills\GameFeelDirectionCourse\game-feel-study-guide.html` (`<style>` 7–178, `<script>` 665–707)
- `C:\Projects\GameDesignSkills\GameFeelDirectionCourse\game-feel-types-frameworks.html` (`<script>` 378–389 — confirms the token set and delegation habit are a shared convention, contributes no unique pattern)

**Files scanned:** 4 (the complete source surface of the project and its two sibling artifacts)
**Pattern extraction date:** 2026-08-27
