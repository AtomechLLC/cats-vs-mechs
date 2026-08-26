# Architecture Research

**Domain:** Single-file, zero-build, `file://` interactive turn-based balance sandbox
**Researched:** 2026-08-26
**Confidence:** HIGH (core recommendations empirically tested in Chrome under `file://`, not inferred)

> **Method note.** Rather than trusting search summaries, the load-bearing claims in this
> document were tested by running headless Chrome against real `file://` pages. Test IDs
> (T1–T21) below refer to those runs. Where a claim is *not* empirically verified, it is
> marked. Chrome/Chromium is verified; Firefox/Safari are MEDIUM confidence by inference
> (no Firefox on this machine to test against).

---

## Executive Recommendation (read this if you read nothing else)

Four decisions constrain everything downstream:

1. **One classic `<script>`, namespaced IIFEs on a single `App` root.** Not ES modules —
   not because they fail (they *don't*, see below), but because they can't import each
   other inside one file, so they buy nothing and cost ordering surprises.
2. **Two-tier render: rare structural rebuild + per-interaction surgical reconcile,
   both coalesced through one `requestAnimationFrame`.** Full re-render on every stepper
   click is disqualified — not primarily for speed, but because it destroys focus,
   restarts every token's CSS animation, and makes press-and-hold impossible.
3. **Snapshot undo, not command pattern.** A full state clone costs 0.005 ms and 100
   snapshots cost ~105 KB (T-undo). Writing inverse operations is unjustifiable.
4. **Three state slices with three different lifetimes: `build` / `fight` / `ui`.**
   Only `build` goes in the URL. Only `build` + `fight` go in undo.

---

## Verified Platform Facts (`file://`, Chrome)

These were tested, and several contradict the common folklore.

| Capability under `file://` | Result | Test |
|---|---|---|
| **Inline** `<script type="module">` | ✅ **Runs fine.** `import.meta.url` resolves. | T-mod |
| `import` from a `data:` URL (static + dynamic) | ✅ Works | T-mod |
| `import` from a `blob:` URL | ✅ Works | T-mod |
| `<script type="module" src="./x.js">` | ❌ CORS-blocked (origin `null`) | prior art |
| `window.isSecureContext` | ✅ **`true`** | T-cap |
| `navigator.clipboard.writeText` | ✅ Available (follows from secure context) | T-cap |
| `history.replaceState` / `pushState` | ✅ Works, incl. changing the query string | T-cap |
| `location.hash` assignment | ✅ Works | T-cap |
| `localStorage` | ✅ Works | T-cap |
| `CompressionStream`, `structuredClone`, `crypto.randomUUID` | ✅ All present | T-cap |

**The important correction:** the widely repeated claim that "`type="module"` doesn't work
on `file://`" is only true for *external* module scripts. An inline module executes
normally. This matters because it means the choice of module pattern is an **architecture**
decision, not a platform-forced one — and the architecture answer is still "don't use ES
modules," for the reason in the next section.

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│  ONE .html FILE                                                      │
│  <style>  design tokens + component CSS, section-bannered            │
│  <body>   static shell: stable container roots with data-k anchors   │
│  <script> one classic script, sections in dependency order:          │
├──────────────────────────────────────────────────────────────────────┤
│  §7  boot          wire delegation, decode URL, first render         │
├──────────────────────────────────────────────────────────────────────┤
│  §6  interactions  DOM events ──▶ ops.*    (thin, no logic)          │
├──────────────────────────────────────────────────────────────────────┤
│  §5  render        state ──▶ DOM.  NEVER writes state.               │
│      ├── structure()  full rebuild of a region  (rare)               │
│      └── sync()       keyed reconcile in place  (every tick)         │
├──────────────────────────────────────────────────────────────────────┤
│  §4  ops           state transformers. NEVER touches DOM.            │
│                    every one goes through state.commit()             │
├──────────────────────────────────────────────────────────────────────┤
│  §3  serialize     build slice ◀──▶ URL hash, versioned              │
├──────────────────────────────────────────────────────────────────────┤
│  §2  state         { build, fight, ui } + undo stack + invalidate()  │
├──────────────────────────────────────────────────────────────────────┤
│  §1  model         PURE. (stateObj) ──▶ numbers. eHP, DPS, aggregates│
├──────────────────────────────────────────────────────────────────────┤
│  §0  data          frozen Workshop 16 board defaults. No deps.       │
└──────────────────────────────────────────────────────────────────────┘
      dependency arrows point DOWN ONLY. No layer calls upward.
```

### Component Responsibilities

| Component | Owns | Must never |
|---|---|---|
| `data` | Frozen board defaults: factions, actions, damage, keywords, counter map, effect cards. A `defaults()` factory returning a fresh deep copy. | Depend on anything. Be mutated. |
| `model` | Pure derivations: `ehp(faction)`, `dps(faction)`, `apRemaining`, `aliveCount`, `roundsToKill`. Takes state **as an argument**. | Read `App.state`. Touch DOM. |
| `state` | The single `{build, fight, ui}` object, the undo/redo stacks, `commit()`, `invalidate()`. | Contain DOM nodes, functions, or class instances. |
| `serialize` | `encode(build) → string`, `decode(string) → build`, version tag + migrations. | Know about `fight` or `ui`. |
| `ops` | Every state transformation: `setUnitHp`, `addUnit`, `removeUnit`, `setAp`, `nudge`, `startFight`, `endFight`, `advanceTurn`, `resetToDefaults`, `loadFromUrl`. | Touch the DOM. Mutate state outside `commit()`. |
| `render` | Producing/updating DOM from state. Owns `data-k` key vocabulary. | Mutate state. Bind per-node listeners. |
| `interactions` | Delegated event handlers on stable roots; press-and-hold repeat; keyboard. Translates an event into exactly one `ops.*` call. | Contain balance logic or write DOM directly. |
| `selftest` | In-file assertions over `model` + `serialize` round-trips. Run via console or `#selftest`. | Ship as a visible UI feature. |

> **Challenge to the working assumption.** The proposed decomposition was
> `state / model / serialize / render / interactions / data`. It is right in spirit, but
> it is missing a layer: **`ops`**. Without it, `interactions` inevitably becomes the place
> where state mutation logic lives, and then undo, URL sync, and re-render invalidation get
> re-implemented in forty click handlers. Given that PROJECT.md makes *manual override a
> primary interaction available everywhere*, the number of mutation entry points is high —
> which is exactly the condition that makes a single mutation funnel mandatory rather than
> optional. `ops` is the funnel. It is the highest-value addition to the proposed design.

---

## Recommended Project Structure

There are no folders. **The section banner is the file tree.** Use `#region` markers so
VS Code / modern editors give you a collapsible outline that reads like a directory.

```
cats-vs-mechs.html
├── <head>
│   └── <style>
│       ├── #region TOKENS      :root — inherited palette from sibling artifacts
│       ├── #region SHELL       layout, panels, two-column battlefield
│       ├── #region TOKENS-VIZ  .tok / .tok--hp / .tok--ap / .tok--dmg / .tok--shield
│       ├── #region STEPPER     +/- controls, press state, focus ring
│       ├── #region PROJECTION  eHP vs DPS panel
│       ├── #region FIGHT       turn banner, dead-unit treatment, log
│       └── #region REFERENCE   counter map, effect cards
└── <body>
    ├── static shell markup (stable container roots only, no rows)
    └── <script>
        ├── #region §0 DATA
        ├── #region §1 MODEL
        ├── #region §2 STATE
        ├── #region §3 SERIALIZE
        ├── #region §4 OPS
        ├── #region §5 RENDER
        ├── #region §6 INTERACTIONS
        ├── #region §7 BOOT
        └── #region §8 SELFTEST
```

### Structure Rationale

- **CSS sections mirror JS sections.** When you're 3,000 lines in, "the token row looks
  wrong" should route you to `#region TOKENS-VIZ` and `#region §5 RENDER` and nowhere else.
- **Static shell in `<body>`, rows generated by JS.** Container roots must be stable and
  hand-written so delegated listeners can bind once at boot and never rebind (verified:
  delegated handlers survive arbitrary rebuilds of their subtree, T8).
- **One `<script>`, not several.** Multiple classic scripts execute in order and share
  globals, so splitting is legal — but it buys nothing and creates a second ordering
  system to reason about. Keep one.
- **A table-of-contents comment at the top of the script**, listing §0–§8 with one line
  each. This is the substitute for a README and costs 12 lines.

---

## Architectural Patterns

### Pattern 1: Namespaced IIFE on a single root (the module system)

**What:** One global `App`. Each section is an IIFE that returns a frozen public surface
and assigns it to `App.<name>`. Private helpers stay in the closure.

**When to use:** Always, here. This is the whole module story.

**Trade-offs:** No static dependency analysis, no tree-shaking (irrelevant), and load order
matters. In exchange: zero tooling, trivially debuggable from the console (`App.model.ehp(App.state.get())`
works while paused), and every symbol is greppable.

```js
/* ===================== §1 MODEL =====================
 * PURE. Takes state as an argument. Never reads App.state.
 * deps: App.data
 * ==================================================== */
App.model = (function () {
  'use strict';

  // private
  function unitEhp(u) { return u.maxHp + (u.shield || 0); }

  // public
  function factionEhp(faction) {
    return faction.units.reduce((n, u) => n + unitEhp(u), 0);
  }

  function factionDps(faction) {
    // AP is a shared pool: throughput is capped by the pool, not by unit count
    const best = Math.max(...faction.actions.map(a => a.dmg));
    return Math.min(faction.ap, faction.units.length) * best;
  }

  return Object.freeze({ unitEhp, factionEhp, factionDps });
})();
```

**Cross-section reference rule — this is the part that bites people.** Because everything
lives in one script, an IIFE *body* that destructures another namespace at definition time
creates a hard ordering dependency:

```js
// ✗ FRAGILE — breaks the moment sections get reordered
App.render = (function () {
  const model = App.model;        // captured NOW
  ...
})();

// ✓ ROBUST — resolved at call time, order-independent
App.render = (function () {
  function projection(s) {
    return App.model.factionEhp(s.build.cats);   // resolved when called
  }
  ...
})();
```

**Rule: reference other sections as `App.x.y()` at call sites, never destructure at IIFE
body scope.** Declare intent in the banner comment (`deps: App.data, App.model`) so the
dependency graph is still greppable. The tiny verbosity cost buys immunity to reordering.

### Pattern 2: Why NOT ES modules (despite them working)

**What:** Inline `<script type="module">` executes correctly on `file://` (verified, T-mod).
So why not use it?

**Because inline modules cannot import each other.** An inline module has no URL, so there
is nothing for a sibling inline module to `import` *from*. Every cross-section reference
would still have to go through a global — you get the globals anyway, plus three new
problems:

- Module scope is not global, so `App.model = …` requires explicit `window.App` assignment,
  and top-level `function foo(){}` silently isn't global.
- Module scripts are **deferred**, so their execution is interleaved with classic scripts
  in a non-obvious order.
- Debugging from the console can't see module-private bindings.

**Verdict:** ES modules in a single file are *false comfort*. The one legitimate use is
`data:`/`blob:` imports for genuinely dynamic code loading (verified working) — which this
app does not need. Use one classic script.

**Not TiddlyWiki's approach either.** TiddlyWiki — the canonical multi-megabyte single-file
HTML app — builds a real `$tw.modules` registry with `require()`/`exports` inside the file.
That is correct *for TiddlyWiki*, because it dynamically loads third-party plugin tiddlers
at runtime. This app has no dynamic loading, so a registry is pure ceremony. Take the
precedent as proof that single-file apps scale, not as a template.

### Pattern 3: Two-tier render (THE central decision)

**What:** Separate *structural* rendering from *value* rendering.

- **Tier 1 — `render.structure(region)`**: rebuild a region's DOM from scratch. Runs only
  when the *shape* changes: unit added/removed, faction reset, URL loaded, mode switched.
  Wrapped in focus/scroll preservation.
- **Tier 2 — `render.sync()`**: walk existing keyed nodes and update text, classes, and
  token counts **in place**. Runs on every stepper click, every nudge, every turn advance.
  Never creates or destroys a node except the exact tokens that changed.

Both funnel through one `invalidate()` coalesced by `requestAnimationFrame`.

**The evidence.** Full `innerHTML` rebuild is not the cheap default it looks like:

| Measurement | Result | Test |
|---|---|---|
| Full rebuild, no CSS, 12 units × 30 tokens | 0.72 ms | T7 |
| Full rebuild, **with real CSS** (inline-block + keyframe pop), 12u × 30tok | **6.14 ms** | T12 |
| Full rebuild, with real CSS, 20u × 60tok | **19.53 ms** — *dropped frame* | T12 |
| Full rebuild, with real CSS, 60u × 100tok | 275.67 ms | T12 |
| Single row: full rebuild vs keyed reconcile | 0.182 ms vs **0.042 ms** | T16 |

Note the 8× jump from adding CSS. Naive benchmarks that skip styling badly understate the
cost, and this app's tokens will absolutely be styled and animated.

**But performance is the *second* reason. These three are worse:**

1. **Focus is destroyed.** After `innerHTML` replacement, `document.activeElement` is
   `BODY` (T1). `replaceChildren` is identical — it is *not* a fix (T2). A student who tabs
   to a `+` and presses Enter can press it exactly once.
2. **Every CSS animation restarts.** A rebuilt node is a fresh node with a fresh animation
   (T10). Every `+` click would replay the pop animation on *all thirty* existing tokens.
   **For a game-feel course artifact this is a correctness bug, not a polish issue** — the
   artifact would be teaching bad game feel by example.
3. **Press-and-hold becomes impossible.** Auto-repeat on a stepper requires the button node
   to survive between ticks (pointer capture, `:active`, `:hover`). Full re-render destroys
   the button under the student's finger 15 times a second.

**The reconcile fixes all three at once**, and the core of it is five lines:

```js
// The single most important function in the app.
// Grows/shrinks a token row by delta only. Existing tokens keep node identity,
// so ONLY the newly added token plays its entry animation. (verified T15)
function syncTokens(row, n, cls) {
  while (row.children.length > n) row.lastElementChild.remove();
  while (row.children.length < n) {
    const s = document.createElement('span');
    s.className = 'tok ' + cls;
    row.appendChild(s);
  }
}
```

Verified: growing 10 → 11 preserves all 10 original nodes, appends exactly 1, and focus on
a neighbouring button is untouched (T15, T17).

**Rejected alternatives:**

| Option | Why not |
|---|---|
| Full re-render every tick | Focus loss, animation restart, no press-and-hold, 6–20 ms |
| Full re-render + focus restore | Fixes focus only. Animations still restart. Still 6–20 ms. Acceptable for Tier 1 (rare), wrong for Tier 2. |
| Keyed virtual-DOM diffing | You'd be writing a mini framework — hundreds of lines, in a file that must stay navigable. The domain has ~6 node shapes. |
| Vendor **idiomorph** (3.3 KB min+gz, zero deps, inlines fine, has `restoreFocus`) | Genuinely viable and would work under `file://`. But a *generic* morph cannot know that "adding one token should animate only the new token" — it would match by index and could reuse the wrong node. The 5-line domain reconcile is smaller *and* more correct. Keep idiomorph in the back pocket if a faction-authoring surface ever appears. |

### Pattern 4: Focus/scroll preservation for Tier 1

Tier 1 is rare but must not yank the student around. Two gotchas, both verified:

- Container `scrollTop` **survives** replacement when content height is unchanged, but
  **clamps to 0** when content shrinks (T9) — i.e. exactly when you remove a unit.
- `element.focus()` **scrolls the page to the element** (T18: jumped to `scrollY` 1278).
  You must pass `{preventScroll: true}`.

```js
function withPreservedFocus(container, fn) {
  const a  = document.activeElement;
  const k  = a && a.dataset ? a.dataset.k : null;
  const ss = (a && a.selectionStart != null) ? a.selectionStart : null;
  const st = container.scrollTop;
  const wy = window.scrollY;

  fn();

  container.scrollTop = st;            // re-set AFTER content exists (clamping, T9)
  window.scrollTo(0, wy);
  if (!k) return;
  const el = container.querySelector('[data-k="' + CSS.escape(k) + '"]');
  if (!el) return;
  el.focus({ preventScroll: true });   // T18
  if (ss != null && el.setSelectionRange) el.setSelectionRange(ss, ss);
}
```

Verified end-to-end: focus, caret position, and scroll all restored correctly across a full
`innerHTML` replacement (T4).

**Caveat worth knowing:** programmatic `focus()` does **not** re-arm `:focus-visible`
(T19), so the keyboard focus ring disappears after a Tier 1 rebuild even though focus is
correct. Mitigation: style `[data-kbd] :focus` explicitly when a `keydown` set a
`kbd-nav` flag on `<body>`, rather than relying on `:focus-visible` alone.

### Pattern 5: rAF-coalesced invalidation

**What:** Ops never render. They mark the app dirty; one rAF flush renders once.

Verified: 50 `invalidate()` calls collapse into exactly 1 render (T13).

```js
let dirty = false, structural = false;
function invalidate(opts) {
  if (opts && opts.structural) structural = true;
  if (dirty) return;
  dirty = true;
  requestAnimationFrame(function () {
    dirty = false;
    const s = App.state.get();
    if (structural) { structural = false; App.render.structure(s); }
    App.render.sync(s);          // always; cheap (T16: 0.042 ms/row)
  });
}
```

This is what makes press-and-hold at 60 Hz feel free, and it means `ops` can call
`invalidate()` promiscuously without anyone counting.

### Pattern 6: Delegated events on stable roots

Bind once at boot on the hand-written container roots. Verified to survive arbitrary
subtree rebuilds (T8).

```js
document.getElementById('board').addEventListener('click', function (e) {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const { act, side, unit, field } = btn.dataset;
  App.ops.dispatch(act, { side, unit, field, delta: +btn.dataset.delta || 0 });
});
```

Press-and-hold, layered on top (feasible at 16 ms ticks, T21):

```js
// pointerdown → immediate op → 400 ms delay → 60 ms repeat; cancel on pointerup/leave.
// Only safe because Tier 2 never replaces the button node.
```

### Pattern 7: In-file self-test

There is no test runner. `model` and `serialize` are the two places where a silent bug is
invisible to the eye, and both are pure — so make them assertable in ~40 lines, reachable
via `#selftest` or `App.selftest()` in the console.

```js
App.selftest = function () {
  const fails = [];
  const eq = (label, a, b) => { if (JSON.stringify(a) !== JSON.stringify(b)) fails.push(label + ': ' + a + ' != ' + b); };
  const d = App.data.defaults();
  eq('cats eHP 9x3', App.model.factionEhp(d.cats), 27);
  eq('url round-trip', App.serialize.decode(App.serialize.encode(d)), d);
  console[fails.length ? 'error' : 'log']('selftest', fails.length ? fails : 'OK');
  return fails;
};
```

This is cheap insurance and it is the payoff for keeping `model` pure. It also gives the
roadmap a real acceptance check for the model phase.

---

## Data Flow

### The canonical flow: a `+` click on unit health

```
  student clicks [+] on Cat #4 health
        │
        ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ §6 interactions — delegated click on #board                 │
  │   e.target.closest('[data-act]') → {act:'hp', side:'cats',  │
  │                                     unit:'c4', delta:+1}    │
  │   NO logic here. One call out.                              │
  └─────────────────────────────────────────────────────────────┘
        │  App.ops.dispatch(...)
        ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ §4 ops.setUnitHp                                            │
  │   state.commit('hp cats/c4 +1', s => {                      │
  │     const u = s.build.cats.units.find(u => u.id === 'c4');  │
  │     u.maxHp = clamp(u.maxHp + 1, 0, MAX);                   │
  │   });                                                       │
  │   NO DOM here.                                              │
  └─────────────────────────────────────────────────────────────┘
        │
        ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ §2 state.commit                                             │
  │   1. snapshot = structuredClone({build, fight})   (0.014ms) │
  │   2. push to past[] (coalesce if same label < 500ms)        │
  │   3. clear redo[]                                           │
  │   4. apply mutator                                          │
  │   5. schedule debounced serialize → URL hash (300ms)        │
  │   6. invalidate()          ← NOT structural                 │
  └─────────────────────────────────────────────────────────────┘
        │  rAF (coalesces N clicks in one frame → 1 render, T13)
        ▼
  ┌─────────────────────────────────────────────────────────────┐
  │ §5 render.sync(state)                                       │
  │   row = board.querySelector('[data-k="tok:cats:c4:hp"]')    │
  │   syncTokens(row, 4, 'tok--hp')  → appends exactly 1 <span> │
  │   projectionEl.textContent = App.model.factionEhp(...)      │
  │   The [+] button node is NEVER touched.                     │
  └─────────────────────────────────────────────────────────────┘
        │
        ▼
  ✔ focus stays on [+]   ✔ only the new token animates
  ✔ press-and-hold keeps working   ✔ ~0.04 ms
```

### The contrast: adding a unit (structural)

```
  ops.addUnit → state.commit(...) → invalidate({structural:true})
        │
        ▼  rAF
  withPreservedFocus(board, () => render.structure(state))
        │        ├─ save activeElement data-k, caret, container scrollTop, window scrollY
        │        ├─ rebuild the roster region  (6.14 ms — fine, this is rare)
        │        └─ restore scrollTop AFTER (it clamps to 0 on shrink, T9)
        │           refocus with {preventScroll:true} (T18)
        ▼
  render.sync(state)   ← always follows, so values are correct
```

### State Management

```
                  ┌──────────────────────────────────────┐
                  │  App.state.current                   │
                  │  ┌────────┬────────┬────────┐        │
                  │  │ build  │ fight  │  ui    │        │
                  │  └────────┴────────┴────────┘        │
                  │  past[]  ◀── snapshots ──▶  future[] │
                  └──────────────────────────────────────┘
                     ▲                              │
       commit(fn) ───┘                              └──▶ invalidate() ──▶ rAF ──▶ render
                     ▲                              │
                     │                              └──▶ debounce 300ms ──▶ serialize ──▶ location.hash
              ops.* (sole writers)
                     ▲
              interactions (sole callers)
```

**Slice lifetimes — the table that makes reset and share predictable:**

| Slice | In URL | In undo | On `reset` | On `endFight` | On URL load |
|---|---|---|---|---|---|
| `build` | ✅ **only this** | ✅ | replaced by `data.defaults()` | untouched | replaced |
| `fight` | ❌ never | ✅ | cleared to `null` | cleared to `null` | cleared to `null` |
| `ui` | ❌ never | ❌ | mostly kept | kept | `mode = 'setup'` |

### Key Data Flows

1. **Stepper → token row.** Diagrammed above. The whole app's feel lives here; it must
   never touch Tier 1.
2. **Allocation → projection.** `render.sync` recomputes `model.factionEhp/factionDps` on
   every pass. Pure, argument-taking, cheap. Because it is advisory (per PROJECT.md), it is
   rendered as a *panel that stays visible during the fight* — the disagreement between
   projection and outcome is the product.
3. **Build → URL → clipboard.** `serialize.encode(state.build)` on a 300 ms debounce →
   `history.replaceState` on the **hash** → `navigator.clipboard.writeText(location.href)`
   on explicit Copy. Never write the URL per keystroke (history spam; Firefox rate-limits
   `replaceState`).
4. **URL → build.** On boot and on `hashchange`: `decode` → version migrate →
   `ops.loadBuild` → `fight = null`, `mode = 'setup'` → structural render.
5. **Manual override → anything.** Because override is a *primary* interaction, it is just
   another `ops.nudge(path, delta)` through the same funnel. It therefore gets undo, URL
   sync, and coalesced render for free. This is the single strongest argument for the `ops`
   layer.

---

## Two Modes in One Artifact

**Recommendation: one continuous surface with a `ui.mode` flag. Not separate views.**

**Why, specifically for this product.** PROJECT.md's core value is that *the fight
contradicts the projection*. If setup and fight are separate screens, the student cannot
see the projection at the moment the fight disproves it — the artifact's single most
valuable moment is destroyed by navigation. The projection panel and both token rows must
remain on screen continuously.

**What actually changes between modes** is small, which is the point:

| | `mode: 'setup'` | `mode: 'fight'` |
|---|---|---|
| Token row shows | `maxHp` (solid) | `hp` solid + `maxHp − hp` as ghost slots |
| Stepper writes to | `build…maxHp` / `build…ap` | `fight…hp` / `fight…ap` |
| Extra chrome | — | turn banner, round counter, End Turn, log |
| Dead units | n/a | dimmed, struck, kept in place (overkill must stay visible) |

So the token row is **one component with two bindings**, not two components. That halves
the render surface and is why the mode-flag approach is also the cheaper one.

### State-transition implications

- **`startFight()`** *instantiates* rather than copies:
  `fight = { round: 1, turn: 'cats', log: [], cats: {ap: build.cats.ap, units: build.cats.units.map(u => ({id: u.id, hp: u.maxHp}))}, ... }`.
  Note `fight` stores only what *changes* — current hp, current ap, round, turn, log. Names,
  actions, damage, keywords are read through `build`. This keeps `fight` small (snapshot
  cost stays trivial) and means there is exactly one definition of a unit's identity.
- **`endFight()`** sets `fight = null`. Build is untouched, so "run it again" is one click
  and always starts from the same allocation. This is what makes the tool usable for A/B
  balance passes.
- **Can you edit allocation mid-fight?** **Yes — allow it, apply it to `build` only, and
  surface a banner.** Two rejected options and why:
  - *Lock the build during a fight.* Wrong for the room. An instructor demoing live will
    absolutely say "what if Cats had 4 health?" mid-fight, and a lock forces a disruptive
    restart.
  - *Apply build edits retroactively to the running fight.* Wrong for the lesson. It
    silently invalidates the balance read the student is in the middle of forming.
  - **Recommended:** build edits take effect on the *next* fight, and the fight surface
    shows a persistent "build revised mid-fight — this result reflects the original
    allocation" note, plus an explicit "Restart fight with new build" button. This is
    consistent with the artifact's ethos of never papering over a disagreement.
  - Adjusting *current* hp/ap mid-fight is a different thing entirely — that's
    adjudication, and it stays instant and unflagged.

---

## Undo / History

**Recommendation: state snapshots. Command pattern is disqualified.**

**Measured:**

| | Result |
|---|---|
| `structuredClone` of full 9v3 state | **0.0140 ms** |
| `JSON.parse(JSON.stringify(...))` | **0.0053 ms** |
| Full state as JSON | 1,076 bytes |
| 100-deep undo stack | **~105 KB** |
| 30v30 stress: clone | 0.0338 ms / 3.7 KB |

At 0.014 ms and 1 KB per entry, a 100-deep undo stack is free. Snapshot undo is ~25 lines.

**Why command pattern loses here, specifically.** It requires an inverse for every
operation. The highest-frequency operation in this app is `nudge(arbitrary path, delta)` —
manual override, which PROJECT.md designates a *primary* interaction. Inverses for
arbitrary-path mutations are exactly the fiddly case, and getting one wrong produces silent
state corruption that a student would interpret as a rules bug. Snapshots cannot be wrong.

```js
function commit(label, mutator) {
  const prev = JSON.stringify({ build: cur.build, fight: cur.fight });   // ui excluded
  const coalesce = last && last.label === label && (now() - last.t) < 500;
  if (!coalesce) past.push({ label, snap: prev, t: now() });
  else last.t = now();
  if (past.length > 100) past.shift();
  future.length = 0;
  mutator(cur);
  scheduleUrlSync();
  invalidate();
}
```

**Two details that matter more than they look:**

1. **Coalesce by label within ~500 ms.** Without it, holding `+` for two seconds creates 30
   undo entries and Ctrl+Z becomes useless. With it, one press-and-hold is one undo step.
   This is the difference between undo being a feature and being noise.
2. **Exclude `ui` from snapshots.** Undoing a collapsed panel is confusing. Snapshot
   `{build, fight}` only.

**The constraint that pays for itself four times.** Snapshot undo requires state to be
plain JSON-able data — no DOM nodes, no functions, no `Map`/`Set`, no class instances. That
same constraint independently gives you: URL serialization, a `localStorage` crash-recovery
draft, and `copy(App.state.get())` debugging from the console. Enforce it from line one; it
is the cheapest architectural rule in the project and the most expensive to retrofit.

---

## Build vs Fight State, Share, and Reset

**Recommendation: share the build, never the fight.** PROJECT.md frames sharing as posting
a faction design to the Discord thread. A fight-in-progress is not a design, and a URL that
restored someone mid-turn would be confusing to open.

**Encoding — measured:**

| Encoding of a 9v3 build | Size |
|---|---|
| JSON | 111 bytes |
| JSON → base64url | 148 chars |
| Compact positional (`1~9~3.3.3…~5~1.0.0~3~9.9.9~3~0.3.0`) | **45 chars** |
| Compact → base64url | 60 chars |
| gzip(JSON) → base64 | 124 chars — **worse than raw at this size** |

Two findings: (a) the payload is tiny, so complexity is unwarranted; (b) `CompressionStream`
exists on `file://` but **hurts** here — gzip framing overhead exceeds the payload. Skip it.

**Recommendation: compact positional encoding, version-prefixed, placed in the hash.**
~45–60 chars is short enough to paste inline in Discord and short enough that the
`file:///…/cats-vs-mechs.html#b=1~9~3.3.3…` URL stays readable.

```js
// v1 grammar (document this next to the code — it IS the schema):
//   <ver> ~ <catN> ~ <catHp,…> ~ <catAp> ~ <catDmg,…> ~ <mechN> ~ …
App.serialize = (function () {
  const V = 1;
  function encode(build) { /* → "1~9~3.3.3.3.3.3.3.3.3~5~1.0.0~3~9.9.9~3~0.3.0" */ }
  function decode(str) {
    const ver = parseInt(str, 10);
    if (ver > V) return null;                 // future version → fall back to defaults + warn
    return MIGRATE[ver](str);                 // MIGRATE[1] = parse; add MIGRATE[2] later
  }
  return Object.freeze({ encode, decode, VERSION: V });
})();
```

**Hash, not query string.** Both verified working on `file://` including `replaceState`
with a query (T-cap) — but a query string on a `file://` URL is unusual enough that chat
clients and OSes may mangle it, and hash changes never risk a reload. Use `#b=…`.

**Predictable reset/share semantics** follow directly from the slice table:

- `reset()` → `build = data.defaults()`, `fight = null`, clear hash, clear undo? **No —
  keep undo**, so a mis-clicked reset is recoverable. That's a real workshop scenario.
- `copyLink()` → `writeText(location.href)`. `isSecureContext` is `true` on `file://`
  (verified), so the Clipboard API is available. Keep a hidden-`<textarea>` +
  `execCommand('copy')` fallback — verified present — for any browser that disagrees.
- Loading a URL never resurrects a fight, so "open a friend's link" always lands on a clean
  setup surface.

---

## Scaling Considerations

Scale here is roster size, session length, and *source file size* — not users.

| Scale | Adjustments |
|---|---|
| Board default (9v3, ~30 tokens/side) | Everything above is comfortable. Tier 1 at 6 ms, Tier 2 at 0.04 ms. |
| 20v20, high allocations (~60 tokens/unit) | Tier 1 crosses a frame budget (19.5 ms, T12) — still fine because it's rare, but this is where "just re-render everything" would have died. Tier 2 unaffected. |
| Pathological (60 units × 100 tokens) | Tier 1 at 276 ms is visibly janky. Mitigate by capping tokens rendered per row (~40) and switching to a numeric badge beyond that — which is also better *pedagogy*, since 100 undifferentiated squares communicate nothing. |
| Source > ~4,000 lines | Section banners + `#region` folding + the §0–§8 TOC comment are load-bearing. If it passes ~6,000, the split to move is CSS out of `<head>` into… nowhere — so instead enforce the section discipline harder and delete reference content, not structure. |
| Long session (hundreds of nudges) | Undo capped at 100 entries ≈ 105 KB. Non-issue. |

### Scaling Priorities

1. **First bottleneck: Tier 1 rebuild cost as allocations grow.** Fix by narrowing the
   region rebuilt (per-faction, not per-board) before optimising anything else.
2. **Second bottleneck: token count legibility, not speed.** Cap the visual row and show a
   count. This is a design fix that happens to also be the performance fix.
3. **Never a bottleneck: undo, serialization, model math.** Measured; don't optimise them.

---

## Anti-Patterns

### Anti-Pattern 1: "Just re-render everything, it's fast enough"

**What people do:** One `render()` that sets `board.innerHTML = ...`, called from every
handler.
**Why it's wrong:** Verified — focus goes to `BODY` (T1, and `replaceChildren` is no better,
T2), every token's entry animation restarts (T10), press-and-hold is impossible, and with
real CSS it costs 6–20 ms (T12), not the 0.7 ms an unstyled benchmark suggests (T7). For an
artifact whose subject *is* game feel, the animation restart alone is disqualifying.
**Do this instead:** Two-tier render (Pattern 3). Reserve full rebuild for shape changes.

### Anti-Pattern 2: Binding listeners inside `render()`

**What people do:** `row.querySelector('.plus').addEventListener(...)` during render.
**Why it's wrong:** Duplicate handlers after every render, steadily growing leaks, and
double-firing steppers that are maddening to diagnose. It also couples render to ops.
**Do this instead:** Delegate once at boot on the static shell roots (verified to survive
rebuilds, T8). Render emits `data-act` / `data-k` attributes and nothing else.

### Anti-Pattern 3: The DOM as source of truth

**What people do:** `const hp = parseInt(el.textContent, 10) + 1;` — the classic single-file
shortcut, because with no framework nothing stops you.
**Why it's wrong:** State becomes unserializable (breaks share), unsnapshot-able (breaks
undo), and untestable. It also drifts silently once two views show the same number — which
this app has by design (token row *and* projection panel).
**Do this instead:** State → DOM, one direction, always. If you need a value, read `state`.

### Anti-Pattern 4: Encoding the fight in the share URL

**What people do:** Serialize the whole state object because it's one line.
**Why it's wrong:** Reset semantics become ambiguous, the URL churns on every turn, and a
shared link drops the recipient into a stranger's half-finished turn.
**Do this instead:** Serialize `build` only. `fight` and `ui` are ephemeral by definition.

### Anti-Pattern 5: Skipping the `ops` layer

**What people do:** Mutate `state` directly in click handlers.
**Why it's wrong:** Undo, URL sync, and invalidation get re-implemented (or forgotten) at
every call site. With manual override available *everywhere* by design, that's dozens of
sites, and the ones that forget produce bugs that look like rules bugs to a student.
**Do this instead:** Every mutation goes through `ops.*` → `state.commit()`. No exceptions,
including "temporary" debug controls.

### Anti-Pattern 6: Destructuring sibling namespaces at IIFE body scope

**What people do:** `const model = App.model;` at the top of the render IIFE.
**Why it's wrong:** Creates an invisible ordering contract in a file whose sections *will*
get reordered during a 3,000-line refactor. Fails as `undefined` at load, far from the edit.
**Do this instead:** `App.model.x()` at call sites; declare deps in the banner comment.

### Anti-Pattern 7: Reaching for `<script type="module">` to "organize" the file

**What people do:** Split sections into multiple inline modules for cleanliness.
**Why it's wrong:** They run (verified, T-mod) but cannot import one another — there's no
URL to import from. You get globals anyway, *plus* non-global top-level scope, deferred
execution ordering, and worse console debugging.
**Do this instead:** One classic script, namespaced IIFEs.

### Anti-Pattern 8: Restoring focus without `{preventScroll: true}`

**What people do:** `el.focus()` in the post-render restore.
**Why it's wrong:** Verified to scroll the page to the element (T18 — jumped 1,278 px). The
student adds a unit and the page leaps. This looks like a layout bug and is nearly
impossible to guess at.
**Do this instead:** `el.focus({ preventScroll: true })`, and restore container `scrollTop`
*after* new content exists, because it clamps to 0 when content shrinks (T9).

---

## Suggested Build Order

Ordered by dependency, with the architecture-defining risk pulled early.

| # | Component | Depends on | Rationale |
|---|---|---|---|
| **1** | `data` + `model` + `selftest` | nothing | Zero-dependency and pure. Verifiable in the console with no UI at all. Everything downstream reads them, and `selftest` gives the phase a real acceptance check. Getting the stat model (per-unit HP, faction AP pool) wrong here is the one mistake that forces a rewrite. |
| **2** | `state` (store, `commit`, snapshot undo, `invalidate`) | `data` | Every later layer routes through `commit()`. Building it after the UI means retrofitting undo into forty call sites. Also locks in the JSON-able-state constraint before anything can violate it. |
| **3** | `render.sync` + `syncTokens` + Tier 1 `render.structure` for the setup surface | `state`, `model`, `data` | The token row is the app's atom and its game feel. Build the reconcile *first*, not as an optimisation later. |
| **4** | `interactions`: delegated steppers, press-and-hold, roster add/remove | `ops`, `render` | **Build 3 and 4 as one phase.** Roster add/remove (structural) alongside steppers (value-only) is what *forces* the two-tier split to exist and proves it. Doing steppers alone would let a single-tier design look adequate and collapse at step 4. |
| **5** | Projection panel | `model`, `render` | Trivial once `model` is pure — and it validates that purity. Placed here because it must be on screen during the fight, so its layout slot needs to exist before fight chrome is added around it. |
| **6** | `serialize` + share + reset | stable `build` shape | Must come *after* 3–4, because the build shape isn't settled until roster editing works. Serializing early guarantees schema churn and wasted migrations. |
| **7** | Fight mode: `state.fight`, turn/round, AP spend, per-unit death, manual override | everything above | Additive. Reuses the same token row with a different binding (see Two Modes). Comes last among interactive work because it's the only part that can't invalidate earlier decisions. |
| **8** | Reference material: counter map, effect cards | `data` only | Stateless static render. No dependencies on the interactive core, so it can be built in parallel or slotted anywhere — good buffer/parallel work. |

**Critical path:** 1 → 2 → (3+4) → 6 → 7. Items 5 and 8 can float.

**The one ordering rule that matters:** do not let step 6 (serialize) precede step 4 (roster
editing), and do not let step 4 precede step 3 (reconcile). Both inversions are tempting —
serialization feels easy early, and steppers feel easy before roster editing — and both
cost a rework of the layer beneath.

---

## Integration Points

### External Services

None, by constraint. No network at runtime, no backend, no CDN. Every capability used is
verified present on `file://`.

### Internal Boundaries

| Boundary | Communication | Notes |
|---|---|---|
| `interactions → ops` | Direct call, one per event | Handlers contain zero logic |
| `ops → state` | `state.commit(label, mutator)` only | Sole write path; gives undo + URL + render free |
| `state → render` | `invalidate()` → rAF flush | Never synchronous; coalesces (T13) |
| `render → state` | **Read-only** | The invariant. If render ever writes, the design is lost. |
| `render → model` | Pure call, state passed as arg | `model` must never read the store |
| `state ↔ serialize` | `encode/decode(build)` on 300 ms debounce | `build` slice only |
| `* → data` | Read-only, frozen | `defaults()` returns a fresh deep copy |
| `selftest → model, serialize` | Direct | The only consumer allowed to reach across sections freely |

---

## Confidence Assessment

| Claim | Confidence | Basis |
|---|---|---|
| Inline modules run on `file://`; external ones don't | **HIGH** | Directly tested in Chrome (T-mod) + whatwg/html#8121 |
| Full rebuild destroys focus; reconcile preserves it | **HIGH** | Directly tested (T1, T2, T15, T17) |
| Full rebuild restarts CSS animations | **HIGH** | Directly tested (T10) |
| Render costs (6.14 / 19.53 / 275 ms) | **HIGH** for Chrome; MEDIUM as cross-browser guidance | Measured headless; real-browser paint may differ modestly |
| `focus()` scrolls; `preventScroll` fixes it | **HIGH** | Directly tested (T18) + MDN |
| Container scroll clamps on shrink | **HIGH** | Directly tested (T9) |
| Snapshot undo cost & size | **HIGH** | Directly measured |
| URL encoding sizes; gzip counterproductive | **HIGH** | Directly measured |
| `isSecureContext === true` on `file://`, clipboard available | **HIGH** for Chrome; **MEDIUM** for Firefox/Safari | Tested Chrome only — keep the `execCommand` fallback |
| `history.replaceState` works on `file://` | **HIGH** for Chrome; **MEDIUM** elsewhere | Tested Chrome only; hash recommended partly to de-risk this |
| Namespaced-IIFE recommendation | **MEDIUM-HIGH** | Reasoned from constraints + TiddlyWiki precedent; a style judgement, not a measurement |
| Two-modes-one-surface recommendation | **MEDIUM** | Reasoned from PROJECT.md's stated core value; a product judgement to validate by use |

**Gaps worth flagging to the roadmap:**

- No Firefox or Safari available to test. The `file://` capability table should be
  re-verified on Firefox before the share feature is called done — Firefox's per-file
  origin model is the most likely place a difference appears.
- Press-and-hold repeat was validated as *timer-feasible* (T21), not as a full pointer
  interaction (headless can't model real pointer capture). Worth a manual check in phase 4.
- `:focus-visible` not re-arming after programmatic focus (T19) needs a real-browser
  keyboard pass to confirm the proposed `body[data-kbd]` mitigation.

---

## Sources

**Primary (empirical — this machine, Chrome headless, `file://`):**
- Module/CORS behaviour, capability probe, focus & scroll, render cost, reconcile cost,
  snapshot cost, URL encoding sizes — tests T1–T21, scratchpad `mod.html`, `focus.html`,
  `x.html`, `y.html`, `z.html`, `w.html`

**Secondary:**
- [whatwg/html issue #8121 — module scripts and `file://`](https://github.com/whatwg/html/issues/8121) — confirms external module CORS blocking
- [idiomorph — DOM-merging algorithm](https://github.com/bigskysoftware/idiomorph) — id-matched morphing preserves focus; `restoreFocus`, `ignoreActiveValue`; 3.3 KB min+gz, zero deps
- [morphdom issue #135 — input focus after morphing](https://github.com/patrick-steele-idem/morphdom/issues/135) — prior art on focus/caret loss
- [TiddlyWiki Module System (dev docs)](https://tiddlywiki.com/dev/static/Module%2520System.html) — the canonical large single-file HTML app's in-file `require`/`exports` registry
- [Ben Nadel — Restoring activeElement focus after a user interaction](https://www.bennadel.com/blog/4097-restoring-activeelement-focus-after-a-user-interaction-in-javascript.htm) — focus restore pattern
- [HN — "I built two dozen single-file HTML tools that run offline"](https://news.ycombinator.com/item?id=46353359) — URL-as-persistence practice, localStorage limits
- [drakeaxelrod/single-html-file-apps](https://github.com/drakeaxelrod/single-html-file-apps) — corpus of self-contained single-file apps
- Sibling artifact `game-feel-types-frameworks.html` — establishes the `:root` token set, single-`<style>`-in-head / single-`<script>`-before-`</body>` convention this file should inherit

---
*Architecture research for: single-file zero-build interactive balance sandbox (`file://`)*
*Researched: 2026-08-26*
