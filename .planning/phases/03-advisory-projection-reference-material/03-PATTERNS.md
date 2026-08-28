# Phase 3: Advisory Projection & Reference Material - Pattern Map

**Mapped:** 2026-08-28
**Files analyzed:** 2 (`cats-vs-mechs.html`, `tests/selftest-node.cjs`) — 11 in-file regions created or edited
**Analogs found:** 10 / 11 (one technique has no analog; named in `## No Analog Found`)

> This project is one self-contained HTML file plus one dev-only harness. "New file → closest
> existing file" degenerates here, so the unit of mapping is **the region**, not the file. Every
> analog below is in-file and was read this session at the line numbers cited.

---

## File Classification

| Region to create or edit | File | Role | Data flow | Closest analog | Match |
|---|---|---|---|---|---|
| `soakTotal` / `turnsToWipe` | `cats-vs-mechs.html` `[S02]` | model | pure transform | `factionDps` / `factionEhp`, same file L992–1005 | **exact** |
| `[S06.3] RENDER — PROJECTION` | `cats-vs-mechs.html` `[S06]` | renderer sub-region | build-once + per-frame reconcile | `[S06.2] RENDER — PICKER` L3059–3380 | **exact** |
| projection node builders (`projPanel`, worked line) | `[S06.3]` | component builder | state → DOM | `statLine` L2563 / `readout` L2573 / `factionHead` L2641 | role-match (must NOT reuse `.brd-value`) |
| `syncProjection` on `SYNC_HOOKS` | `[S06.3]` | reconcile hook | per-frame pull | `syncPicker` L3364–3379 | **exact** |
| `[C10] PROJECTION` style region | `cats-vs-mechs.html` `<style>` | config/style | n/a | `[C07] PICKER` L333–347 (prefix-scoping rationale); `[C03]` L92–165 (grid + sticky) | **exact** |
| `REFERENCE` constant + `data.reference` | `[S01] DATA` | data/config | static literal | `DEFAULTS` L896–943 + `deepFreeze` L696–703 | **exact** |
| action + effect cards in each column | `[S06.1] buildColumn` L2721–2741 | component builder | state → DOM | `unitCard` L2674–2713 (append shape); `factionHead` L2641 | role-match — **cross-plan edit, plan 02-01 owns it** |
| `#refband` shell node + band renderer | shell L519–524 + `[S06.3]/[S06.4]` | structural shell | build-once | `#board-empty` L523 + `#board-empty{grid-column:1/-1}` L141 | **exact** |
| `[S09.8] SUITE: projection` | `[S09]` | test | assertions | `[S09.2]` L5113–5161 (no-DOM) + `[S09.4]` L5507–5560 (DOM-gated) | **exact** |
| `[S09.9] SUITE: reference material` | `[S09]` | test | assertions | `[S09.1]` L5014–5067 (`tuple` + bidirectional checks) | **exact** |
| `VERDICT_WORDS` gate + `KNOWN_IDS` growth | `tests/selftest-node.cjs` | test gate | source scan | `FORBIDDEN` L32–86; `KNOWN_IDS` L182–199 + stub-drift gate L578–609 | role-match (see note) |

---

## Pattern Assignments — Plan 03-01 (projection)

### `soakTotal` / `turnsToWipe` → `[S02] MODEL` (model, pure transform)

**Analog:** `cats-vs-mechs.html` L992–1020, same section. The section's own banner already names
this phase as the owner:

```
/* ===================== [S02] MODEL =====================
 * PURE derivations. Every function takes the state, or a slice of it, as an
 * argument. Nothing here reads the state singleton, reads or writes the page,
 * or stores a derived value ...
 * Turns-to-wipe ranges, formatting and the projection panel are Phase 3
 * (plan 03-01) and deliberately do not live here.          <-- L976-977
```

**Reduce-over-units pattern to copy** (L992–998) — `soakTotal` is this shape with a `Math.ceil`
inside, and the `hit <= 0` guard placed *above* the `reduce`, not inside it:

```js
  function factionEhp(faction) {
    return faction.units.reduce(function (n, u) { return n + unitEhp(u); }, 0);
  }

  function bestDamage(faction) {
    return faction.actions.reduce(function (n, a) { return a.dmg > n ? a.dmg : n; }, 0);
  }
```

**Guard-in-the-derivation pattern** (L1013–1020) — the precedent for `turnsToWipe` returning `null`
rather than the caller sanitising `Infinity`. `apSpent` already argues exactly this:

```js
  // Floored, because build and fight are independent slices by design and
  // nothing stops a student lowering the build pool while a fight is running.
  // The raw subtraction then reads "AP spent: -2" on a projector. The
  // derivation owns the meaning of this number, so it is the only place that
  // can hold the floor.
  function apSpent(buildFaction, fightSide) {
    return Math.max(0, buildFaction.ap - fightSide.ap);
  }
```

Copy the *comment shape* too: state the reachable bad render (`"≈Infinity turns"` /
`"≈NaN turns"`), then the guard. That is this file's house style for a guard.

**Default-argument pattern** (L1002–1005) — `turnsToWipe` must call `factionDps(attacker)` with one
argument during setup (research §2.1); the default is already written here, do not re-derive it:

```js
  function factionDps(faction, activeUnits) {
    var active = (activeUnits === undefined) ? faction.units.length : activeUnits;
    return Math.min(faction.ap, active) * bestDamage(faction);
  }
```

**Export pattern** (L1022–1029) — append the two names to the existing frozen literal; no new
surface, no new section:

```js
  return Object.freeze({
    unitEhp: unitEhp,
    factionEhp: factionEhp,
    bestDamage: bestDamage,
    factionDps: factionDps,
    aliveCount: aliveCount,
    apSpent: apSpent
  });
```

**Do NOT copy:** formatting. `[S02]`'s banner excludes it. `≈`, `–` and the copy branches belong to
`[S06.3]`.

---

### `[S06.3] RENDER — PROJECTION` (renderer sub-region, build-once + per-frame reconcile)

**Analog:** `[S06.2] RENDER — PICKER`, L3059–3380. It is the only sub-region precedent in the file
and it is a very close one: it paints a page region outside `#board`'s columns, on its own trigger,
reuses `[S06.1]`'s closure helpers, and registers on `SYNC_HOOKS` without editing `[S06.1]`.

**Banner pattern** (L3059–3075) — copy this shape verbatim in structure, changing only the subject:

```js
  /* ===================== [S06.2] RENDER — PICKER =====================
   * The token-appearance surface, appended as its own sub-region rather than
   * folded into the board renderer above: it paints a different page region,
   * on a different trigger, and it changes NOTHING in [S06.1]. It reuses
   * [S06.1]'s helpers — el, text, setData, makeToken, styleFor, safeShape,
   * safeColor and withPreservedFocus — because a swatch that were built by a
   * second, parallel token builder could drift away from the board's, ...
   * deps: App.data, [S06.1]'s helpers
   * owner: Phase 2, plan 02-03; list-plus-editor by plan 02.1-04
   * =================================================================== */
  // #region [S06.2] RENDER — PICKER
```

…and close with the matching `// #endregion [S06.2] RENDER — PICKER` (L3380). Both `#region`
markers are required; every section in the file carries them.

**Registration pattern** (L3364–3379) — the whole hook, end to end. Note the shape: read own
bookkeeping off the DOM, guard, then repaint; `SYNC_HOOKS.push` on the line after the function:

```js
  function syncPicker(state) {
    var dlg = document.getElementById('tok-picker');
    if (!dlg || dlg.open !== true) { return; }
    var id = String(dlg.dataset.tok || '');
    var vocab = state.build.tokens;
    if (!vocab) { return; }
    if (!Object.prototype.hasOwnProperty.call(vocab, id)) {
      var live = Object.keys(vocab);
      if (live.length === 0) { return; }
      id = live[0];
      dlg.dataset.tok = id;
    }
    picker(state, id);
  }

  SYNC_HOOKS.push(syncPicker);
```

`syncProjection` is the same shape with `document.getElementById('strip')` and a
`strip.dataset.built !== '1'` build-once branch — `dataset.built` is the direct analog of
`dlg.dataset.tok` / `dlg.dataset.sig` (L3320–3327: *"an attribute of its own rather than the head of
a joined string"*).

**The seam itself** (L2921–2925, and its run at L3056) — read but do not edit:

```js
  // The one extension seam [S06] declares. A sub-region that paints a page
  // region outside #board pushes its own per-frame reconcile here; sync() walks
  // the list as its last act, so every region this file owns is repainted by
  // one frame rather than by whichever handler happened to touch it last.
  var SYNC_HOOKS = [];
  ...
    SYNC_HOOKS.forEach(function (hook) { hook(state); });   // L3056, sync()'s last act
```

**Frozen surface** (L3387–3405) — `[S06.3]` adds **nothing** here. `App.render` exports
`structure, sync, picker, amountFor, labelFor, COMPACT_AT, MAX_UNITS` and is `Object.freeze`d; that
is why the region must be inside the `[S06]` IIFE. Any export must earn its place the way
`amountFor` and `labelFor` did, with the named caller written in the comment.

---

### Projection node builders (component builder, state → DOM)

**Analogs:** `[S06.1]`'s builders, L2380–2577.

**Helper pattern** (L2380–2396) — these are in the same closure; call them directly, do not re-type:

```js
  function el(tag, cls) {
    var node = document.createElement(tag);
    if (cls) { node.className = cls; }
    return node;
  }

  function text(tag, cls, s) {
    var node = el(tag, cls);
    node.textContent = s;
    return node;
  }

  function setData(node, pairs) {
    Object.keys(pairs).forEach(function (k) {
      if (pairs[k] !== undefined && pairs[k] !== null) { node.dataset[k] = pairs[k]; }
    });
  }
```

**The `.num` convention** (`readout`, L2573–2577) — copy the class, **not** the attribute:

```js
  function readout(amt, side) {
    var node = text('span', 'brd-value num', '0');
    setData(node, { amt: amt, side: side });
    return node;
  }
```

> **Copy `num`. Do not copy `brd-value` or `data-amt`.** `sync()`'s value pass (L2946–2949) writes
> **every** `.brd-value` inside `#board` from `amountFor`, and `#strip` is inside `#board`.
> `amountFor`'s fall-through is `return 0;` at L2812 — an unknown `data-amt` renders a silent `0`
> with no error. Use `data-prj="turns" | "work"` and `.prj-*` classes instead (research §3.2 rule 1).

**The label the projection must NOT route through `labelFor`** — contrast pair. `factionHead`
L2670 builds the shipped total-health line, which *does* carry a token label:

```js
    head.appendChild(statLine('brd-label', 'Total health', readout('ehp', side), null));
```

`labelFor` (L2832–2839) is the only correct way to name a *token type*. The projection's "health"
is the **sum of `hp` + `shield`**, so the worked line carries **no `data-lbl`** — otherwise
`sync()`'s relabel pass (L2958–2961) would rewrite it, and the pass reaches the strip.

**Three attributes that are forbidden in `#strip`**, each with the analog that proves it:

| Attribute | Why | Analog |
|---|---|---|
| `data-k` | `keyed()` L2398–2400 takes the **first** document match, and `#strip` precedes `#col-mechs`; focus restore (L2429–2434) would land in the strip | `withPreservedFocus` L2413–2435 |
| `data-act` + `data-side` on one node | `peerOrdinal`/`peerList` L2446–2464 use that pair as the focus fallback list | same |
| `.brd-line--opt` | the hide pass L3037–3043 reads `amountFor`, which returns `0` for any projection key, so the line would be `hidden` forever | `sync()` hide pass |

**Anti-verdict comment precedent** (L2661–2666) — the register to write `[S06.3]`'s comments in.
This is the file's own voice on PROJ-06 and it is *already in the artifact*:

```js
    // Q-2 -- where the red diamonds live. App.model.bestDamage is a shipped
    // pure derivation that until now had no consumer at all, ...
    // The label is the plain word, never a score, a grade or a judgement.
```

Note the three Layer-B words (`score`, `grade`, `judgement`) live on this line. Do not reword it;
put those words in the literal-only scan (see the harness section below).

---

### `[C10] PROJECTION` style region (config/style)

**Analog A — the prefix-scoping rationale:** `[C07] PICKER` L333–347.

```css
  /* ===================== [C07] PICKER ===================== */
  /* The token-appearance dialog. Every class here carries the .pk- prefix,
     which is fake scoping and entirely deliberate: a single stylesheet has no
     real scope, so a Phase 5 rule for .row or .grid would otherwise restyle
     this surface from two thousand lines away. ... */
```

`[S06.3]`'s classes carry the `.prj-` prefix for exactly this reason; the band's carry `.ref-`.

**Analog B — the sticky contract and the grid escape:** `[C03] BOARD` L92–102 and L131–158.

```css
  /* STICKY GOTCHA, written here because it is invisible everywhere else: a
     sticky element sticks to its nearest ancestor that has a scrolling
     mechanism, and ANY overflow value other than visible creates one. So no
     ancestor of #topbar or #strip -- html, body, .shell, #board -- may ever
     be given overflow:hidden, scroll or auto. ... Sticky simply stops working. */
```

```css
  #board{
    display:grid;grid-template-columns:1fr minmax(220px, 320px) 1fr;gap:18px;align-items:start;
    ...
  }
  #board-empty{grid-column:1 / -1}        /* L141 — the full-width-band precedent for #refband */

  #strip{
    position:sticky;top:var(--topbar-now, var(--topbar-h));align-self:start;
    border:1px dashed var(--ink-faint);border-radius:var(--radius);
    padding:22px 18px;min-height:180px;
    display:grid;place-items:center;text-align:center;
    color:var(--ink-dim);font-size:18px;
  }
```

Editing `#strip` (dashed border → solid, `place-items:center` → `start stretch`, adding
`grid-auto-flow:row`) is a `[C03]` edit and should be named as such. **No `overflow` on the strip
or any ancestor. No `white-space:nowrap` on the worked line** (D-10).

**Analog C — the typography floor:** `[C04]` L164–169 and L188–190.

```css
  /* ... The sizes are the projector legibility spec, not taste: every value is
     at least 24px and weight 700, every label at least 18px, and nothing at or
     below 14px is allowed to carry information. Every numeric readout also
     takes the shipped .num class ... */
  .brd-label{font-size:18px;color:var(--ink-dim);min-width:128px}
  .brd-value{font-size:24px;font-weight:700}
  .brd-note{font-size:18px;color:var(--ink-dim)}
```

Size `.prj-turns` off `.brd-value`, `.prj-work` and `.prj-ignores` off `.brd-note` / `.brd-label`.
`.num` is L63: `.num{font-variant-numeric:tabular-nums}` (D-11). `.eyebrow` and `.ex` are 12 px —
neither may carry projection or reference information.

**D-15 colour:** the analog to copy is `.pk-sw--on` L383 — *"the live choice is marked by an outline
AND a tick, never by colour on its own."* For the projection, the rule is stricter still: no
`--green` / `--gold` / `--coral` anywhere in `.prj-*`. Those are token-identity colours.

---

### `[S09.8] SUITE: projection` (test)

**Analog A — the DOM-free half:** `[S09.2]` L5113–5161. Same section, and its comment at L5120–5122
is the one already-shipped sentence in this file about the 27-eHP coincidence:

```js
  App.selftest.suite('model derivations', function (t) {
    var d = App.data.defaults();

    // The two sides landing on the same eHP is a coincidence of the board's
    // token rows, not a claim about the matchup. Phase 5's playtest gate is
    // what settles that question, by being played.
    t.eq('cats eHP', App.model.factionEhp(d.cats), 27);
    ...
    var snapshot = JSON.stringify(d.cats);
    App.model.factionEhp(d.cats);
    App.model.factionEhp(d.cats);
    t.eq('model is pure', JSON.stringify(d.cats), snapshot);
```

Copy the purity row and the integer row (L5152–5159 `.every(Number.isInteger)`) — PROJ-02's
"never `Infinity`, never `NaN`, never a decimal" sweep is that row widened.

**Analog B — the DOM-gated half:** `[S09.4]` L5511–5560. Copy the skip guard and the
save/restore bracket exactly:

```js
    // Everything below needs a page. tests/selftest-node.cjs loads this file
    // into a bare sandbox with no document, so the suite says so and stops
    // rather than painting a terminal run red for something that is not a
    // defect. A browser run gains the real coverage.
    if (typeof document === 'undefined') {
      t.info('render', 'skipped — no DOM');
      return;
    }

    var savedAll = JSON.stringify(App.state.get());
    ...
    App.state.restore(savedAll);
    App.state.flush();
    t.eq('the render suite handed the board back untouched',
      JSON.stringify(App.state.get()), savedAll);
```

The PROJ-01 "updates as allocation changes" row is L5549–5554's shape — drive a real op, `flush()`,
read the node back:

```js
    App.ops.setUnitMaxHp('cats', first.id, App.render.COMPACT_AT);
    App.state.flush();
    row = document.querySelector(sel);
    t.eq('at the threshold the row swaps mode', row ? row.dataset.mode : '(no row)', 'c');
```

**Table-of-contents edits this suite forces:** the `[S09]` index at L4840–4847 gains a row; the
section index at L631–641 gains `[S06.3]`.

---

## Pattern Assignments — Plan 03-02 (reference material)

### `REFERENCE` constant → `[S01] DATA` (data/config, static literal)

**Analog:** `DEFAULTS` L896–943 and `deepFreeze` L696–703. `[S01]`'s comment at L887–888 already
reserves the name:

```js
  // Effect keyword ids live here; their card copy and the action-versus-action
  // reference table are data.reference, owned by Phase 3 plan 03-02.
```

**Freeze pattern** (L696–703) — reuse the existing helper, do not write a second one:

```js
  function deepFreeze(o) {
    if (o === null || typeof o !== 'object') { return o; }
    Object.getOwnPropertyNames(o).forEach(function (k) {
      var v = o[k];
      if (v !== null && typeof v === 'object' && !Object.isFrozen(v)) { deepFreeze(v); }
    });
    return Object.freeze(o);
  }
```

**Allowlist-constant pattern** (L729–731) — the precedent for a frozen sibling constant that is
exported so `[S09]` asserts against it rather than a re-typed copy:

```js
  var SHAPES = deepFreeze(['sq', 'rect', 'tri', 'dia', 'circ', 'hex']);
  var COLORS = deepFreeze(['green', 'gold', 'accent', 'coral', 'violet', 'accent-2', 'ink-dim']);
  var TOKEN_IDS = deepFreeze(['hp', 'ap', 'shield', 'dmg', 'dead']);
```

`REFERENCE` is `deepFreeze({ effects: [...], beats: [...] })`, declared **beside** `DEFAULTS` and
**not inside it** — `defaults()` L946–948 is `JSON.parse(JSON.stringify(DEFAULTS))` and that copy is
what Phase 4 encodes:

```js
  function defaults() {
    return JSON.parse(JSON.stringify(DEFAULTS));
  }
```

**Export pattern** (L950–966) — append `REFERENCE: REFERENCE` to the existing frozen return literal.

**The data being read** (L903–905, L914–916) — no new data is needed for REF-02; the keyword ids are
already on the action records:

```js
        { id: 'slash', name: 'Slash', dmg: 1, keywords: [] },
        { id: 'hairball', name: 'Hairball', dmg: 0, keywords: ['slowdown'] },
        { id: 'screech', name: 'Screech', dmg: 0, keywords: ['confuse'] }
        ...
        { id: 'fly', name: 'Fly', dmg: 0, keywords: ['evade'] },
        { id: 'lasers', name: 'Lasers', dmg: 3, keywords: ['range'] },
        { id: 'recharge', name: 'Recharge', dmg: 0, keywords: ['shield'] }
```

**Lookup pattern** — `styleFor` L2819–2823 and `labelFor` L2832–2839. Copy the guard *and* its
stated reason; the keyword lookup must be `hasOwnProperty` or `Array.find`, never a bare index:

```js
  // The vocabulary is read at render time and never copied into state.
  // hasOwnProperty, not a bare index: from Phase 4 this object can arrive from
  // a pasted build code, and a bare lookup for 'constructor' resolves on the
  // prototype instead of failing.
  function styleFor(state, amt) {
    var vocab = state.build.tokens;
    if (vocab && Object.prototype.hasOwnProperty.call(vocab, amt)) { return vocab[amt]; }
    return App.data.DEFAULTS.tokens.hp;
  }
```

---

### Action + effect cards in each column — **cross-plan edit into `buildColumn`**

**Analog / edit site:** `[S06.1] buildColumn` L2721–2741, owned by plan 02-01. D-12 appends the
cards after the setup-only Add button, so they survive fight mode for free:

```js
  function buildColumn(col, state, side) {
    var faction = state.build[side];
    var setup = (state.fight === null);
    var parts = [factionHead(state, faction, side)];

    faction.units.forEach(function (unit) {
      parts.push(unitCard(state, faction, unit, side, setup));
    });

    if (setup) {
      var add = el('button', 'brd-add');
      add.type = 'button';
      add.textContent = (side === 'cats') ? '+ Add Cat' : '+ Add Mech';
      add.disabled = faction.units.length >= MAX_UNITS;
      setData(add, { k: side + '/add', act: 'addUnit', side: side });
      parts.push(add);
    }
    // <-- 03-02 appends the action cards HERE, outside the `if (setup)`

    col.replaceChildren();
    parts.forEach(function (part) { col.appendChild(part); });
  }
```

**Card-builder analog:** `unitCard` L2674–2713 — `el('article', 'unit-card')`, a head row, then
appended lines. An action card is the same shape: an `article`, the action name from
`DEFAULTS[side].actions[].name`, its damage, then one effect chip per keyword.

**Cards are read-only, so `[S07]` needs no edit.** `[S07.1]`'s banner L3426–3429 and its `UI_ACTS`
comment L3449–3451 name *"Phase 3's reference cards"* as a future consumer of the seams; a card with
no `data-act` consumes nothing, and that is the cheaper answer. If a card ever gains a control, it
goes through `UI_ACTS` / `UI_HANDLERS` / `LATE_BINDERS` (L3457–3490), never into `[S05]`.

**P11 — `labelFor` is forbidden here.** The keyword id `shield` collides by name with the token id
`shield`. A student renaming the Shield *token* has not renamed the Recharge *keyword*. The effect
card's name comes from `REFERENCE.effects[].name`.

---

### `#refband` shell node + band renderer

**Analog:** the shell markup L519–524 and `#board-empty`'s grid rule L141.

```html
  <div class="board" id="board">
    <section class="brd-col" id="col-cats"></section>
    <aside class="brd-strip" id="strip">Projection lands here in Phase 3</aside>
    <section class="brd-col" id="col-mechs"></section>
    <p class="muted" id="board-empty">The allocation board renders here.</p>
  </div>
```

```css
  #board-empty{grid-column:1 / -1}
```

`<section class="brd-band" id="refband"></section>` goes before `#board-empty`, with
`#refband{grid-column:1 / -1}` in `[C03]`. `structure()` L2743–2763 replaces only the column
interiors, so the band survives a rebuild the same way `#strip` does — same build-once,
sync-every-frame treatment.

**Bidirectional gate this trips:** see the harness section — `KNOWN_IDS` and a stub node in the same
commit, or the run fails.

---

### `[S09.9] SUITE: reference material` (test)

**Analog:** `[S09.1]` L5014–5067. Two patterns to lift.

**Tuple comparison** (L5018–5020, used at L5048–5057) — the way this file asserts a table of records
in one row instead of nine:

```js
  function tuple(action) {
    return [action.id, action.name, action.dmg, action.keywords];
  }
  ...
    t.eq('cats actions', d.cats.actions.map(tuple), [
      ['slash', 'Slash', 1, []],
      ...
    ]);
```

**Bidirectional coverage** — `[S09.6]` L5699–5705 is the closest shape: assert every shipped record
is inside the allowlist that will be offered. REF-02 needs it *both ways* — every keyword on every
action has copy in `REFERENCE.effects`, **and** every entry in `REFERENCE.effects` is carried by some
action — so a keyword added to `DEFAULTS` with no copy fails loudly:

```js
    var shippedLegal = App.data.TOKEN_IDS.every(function (id) {
      var s = App.data.DEFAULTS.tokens[id];
      return App.data.SHAPES.indexOf(s.shape) !== -1
        && App.data.COLORS.indexOf(s.color) !== -1
        && App.data.GLYPHS.indexOf(s.glyph) !== -1;
    });
    t.ok('every shipped token style is drawn from the offered allowlists', shippedLegal);
```

**Frozen-write row** (L5064–5067) — `REFERENCE` gets the same treatment `DEFAULTS` has:

```js
    t.throws('DEFAULTS is deep-frozen', function () {
      App.data.DEFAULTS.cats.units[0].maxHp = 99;
    });
    t.eq('DEFAULTS survived the frozen write', App.data.DEFAULTS.cats.units[0].maxHp, 3);
```

---

## Shared Patterns

### The `[S09.0]` assertion vocabulary
**Source:** `cats-vs-mechs.html` L4998–5012 (`t.eq`, `t.ok`, `t.throws`, `t.info`); the harness
itself L4852–4900.
**Apply to:** `[S09.8]`, `[S09.9]`.
`t.eq` refuses a both-sides-`undefined` comparison (L4894–4900) — *"An assertion where both sides are
missing is not a pass, it is a question nobody asked."* When reading a node's `textContent`, use the
`row ? row.dataset.mode : '(no row)'` idiom from L5552 so a missing node reads as a distinct string
rather than `undefined`.

### The forbidden-pattern scan → the analog for D-17's verdict gate
**Source:** `tests/selftest-node.cjs` L32–47 (`FORBIDDEN`) and L72–86 (the whole-document scan).
**Apply to:** the new Layer A / Layer B word gates.

```js
const FORBIDDEN = [
  { label: 'absolute URL', re: /https?:\/\// },
  ...
  { label: 'markup injection sink', re: /innerHTML|outerHTML|insertAdjacentHTML|document\s*\.\s*write|createContextualFragment/ },
```

```js
const hits = [];
FORBIDDEN.forEach((rule) => {
  const re = new RegExp(rule.re.source, rule.re.flags.replace('g', '') + 'g');
  let m;
  while ((m = re.exec(html)) !== null) {
    const line = html.slice(0, m.index).split('\n').length;
    hits.push('  line ' + line + ' [' + rule.label + ']: ' + m[0]);
    if (m[0] === '') { re.lastIndex++; }
  }
});
```

**Copy the mechanism, not the array.** Per research Open Question 4: add a sibling `VERDICT_WORDS`
array with its own loop and its own failure message (*"PROJ-06: comparative language reached the
artifact"*), because `FORBIDDEN` means "unsafe sink" and a verdict word is not a sink. Layer B is a
third scan over the quoted string literals of the `<script>` block, so L2666's `score` / `grade` /
`judgement` comment survives untouched. Also copy the honesty clause from L60–65 of the harness —
*"this catches the known sinks written literally … it does NOT catch computed access"* — for the
structural checks that are heuristics.

### The stub-drift gate
**Source:** `tests/selftest-node.cjs` L182–199 (`KNOWN_IDS`), L389–394 (`idNode`), L419–422 (the
board build), L578–609 (the bidirectional check).
**Apply to:** `#refband`, and any other new shell id.

```js
  const KNOWN_IDS = [
    'app', 'board', 'board-empty', 'topbar', 'tokedit-label', 'col-cats',
    'strip', 'col-mechs',
    ...
    // plan 02.1-04 — the picker as list-plus-editor (D-05). ...
    'tok-pick-list', 'tok-pick-list-label',
```

```js
  const board = idNode('board');
  app.appendChild(board);
  ['col-cats', 'strip', 'col-mechs'].forEach((id) => board.appendChild(idNode(id, 'section')));
  board.appendChild(idNode('board-empty', 'p'));
```

Note the existing comment convention: new ids are grouped under a `// plan NN-NN — …` line. Add
`'refband'` under a `// plan 03-02 — …` line **and** `board.appendChild(idNode('refband','section'))`
in the same commit. The gate runs both directions (L592–608): a stub id with no shell node fails too.

### Section bookkeeping every new region owes
**Source:** L631–641 (section index) and L4840–4847 (`[S09]` index).
**Apply to:** `[S06.3]`, any `[S06.4]`, `[C10]`, `[S09.8]`, `[S09.9]`.

```
 *   [S06] RENDER        page structure and per-tick reconcile from state   (Phase 2, plan 02-01)
```
```
 *   [S09.7] token authoring — the id gate and the name gate   (plan 02.1-01)
```

Every region also carries `// #region [X]` / `// #endregion [X]` markers and a banner ending in
`deps:` and `owner: plan NN-NN`.

### Naming — checked against both gates this session
Both greps are at **0** right now (verified). Every identifier below measured at 0 whole-file hits in
`cats-vs-mechs.html` this session: `soakTotal`, `turnsToWipe`, `perTurn`, `turnsText`, `projPanel`,
`syncProjection`, `prj-`, `refband`, `ref-card`, `refCard`, `effectCard`, `buildRefBand`, `beats`,
`ignores`, `VERDICT_WORDS`.

**One correction to RESEARCH.md §6.3:** `matchup` measures **1** hit in the artifact, not 0 — it is
already in `[S09.2]`'s comment at L5121 (*"not a claim about the matchup"*). `matchup` is not a
banned substring, so this is harmless; the word is already blessed by the file's own precedent.

Comment-writing rules, unchanged from research §6.3: write "generated" not "generating", "the matchup
map" or "what beats what" not "the counter map", "the fight" not "the encounter". Reword L4736's
`weaker` before adding that stem to Layer A.

---

## No Analog Found

| Technique | Role | Data flow | Why there is no analog |
|---|---|---|---|
| Layer C — walking the **rendered** page and harvesting leaf `textContent` + `aria-label` / `title` / `placeholder` to prove no comparative word reached the screen | test | DOM traversal | Nothing in the file inspects its own rendered copy. Every existing DOM assertion targets a known selector and reads one value (`[S09.4]` L5543–5546). The closest structural relative is `deepFreeze` L696–703 / `allIntegers` L5024–5033 — recursive walks with an early scalar return — so copy the **recursion shape** from `allIntegers` and write the DOM traversal fresh. It must skip `[data-lbl]` nodes (research A6). |

---

## Metadata

**Analog search scope:** `cats-vs-mechs.html` (7,083 lines, sections `[C00]`–`[C09]`, `[S00]`–`[S10]`),
`tests/selftest-node.cjs` (1,969 lines).
**Regions read this session:** `[S01]` L691–969, `[S02]` L971–1031, `[S06.1]` L2363–2862,
`sync()` L2900–3057, `[S06.2]` L3059–3406, `[S07.1]` L3420–3500, `[S09.0]`–`[S09.6]` selected,
`[C03]` L92–165, `[C04]` L164–200, `[C07]` L333–400, shell L519–545; harness L26–115, L178–215,
L386–425, L520–612, L640–700.
**Baseline re-measured:** grep 1 = 0, grep 2 = 0. (RESEARCH.md's other pinned numbers — 363 / 430 /
35 ids / L4736 / L2666 / L4724 — were not re-run here; they were measured in the research session
against an unchanged file.)
**Pattern extraction date:** 2026-08-28
