---
phase: 01-foundation-data-state-funnel-undo
reviewed: 2026-08-26T21:20:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - cats-vs-mechs.html
  - tests/selftest-node.cjs
findings:
  critical: 3
  warning: 11
  info: 8
  total: 22
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-08-26T21:20:00Z
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Phase 1 lays down `[S00]`–`[S10]`: the deep-frozen board, pure derivations, the `commit()` funnel with snapshot undo, the ops layer, the error boundary, and a 57-assertion self-test that passes green in both the browser and the Node harness.

The architecture is sound and the constraints are respected — one classic `<script>`, no `innerHTML`, no network, no modules, derived values computed not stored. **The problem is that the enforcement layer does not enforce.** `[S05] OPS` is documented as "the only writer of state" and as the validation boundary for "everything a handler supplies — and, from Phase 4, everything a pasted build code supplies." It validates neither the value nor the key:

- `int()` cannot reject a non-integer, because it truncates before it checks. `null`, `""`, `false`, `"7"`, `[5]` and `3.9` all sail through as silent integers.
- The `side` argument is never checked against `['cats','mechs']`. `setFactionAp('__proto__', 42)` writes `Object.prototype.ap = 42` — verified, global, and it makes `App.state.get().build.ap` read `42` on a slice that has no such key.

A third defect sits in the render funnel: `frame()` clears the `structural` flag *before* calling `App.render.structure()`, so one throw during a structural rebuild silently and permanently desynchronises the page from state — verified.

The 57 green assertions are not evidence against any of this. Every finding below marked "verified" was reproduced by loading the shipped script into a VM sandbox and executing it; probe transcripts are in the scratchpad.

The self-test itself has two defects that matter for a teaching artifact: it mutates the live singleton and hands back a 30-deep undo stack full of test states (one Ctrl+Z after `#selftest` moves the board to a perf-loop value), and `t.eq` returns PASS when both sides stringify to `undefined`.

No structural pre-pass was supplied with this review, so there is no `## Structural Findings (fallow)` section; everything below is narrative.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: `int()` truncates before it validates, so it can never reject a non-integer

**File:** `cats-vs-mechs.html:551-559`
**Issue:** The comment above this function states the contract explicitly: *"Clamp, and reject rather than silently coerce. A bad value must arrive at the error boundary as a named failure the student can read, not as a NaN that renders as an empty token row."* The implementation does the opposite. `Math.trunc(value)` performs a full `ToNumber` coercion first, so by the time `Number.isFinite(n)` runs, every coercible non-number has already become a valid integer. The guard can only ever catch `NaN`/`Infinity` — never a fractional value, never a wrong type.

Verified against the shipped script:

| input | `what` reported | result stored |
|---|---|---|
| `null` | — (no throw) | `0` |
| `""` | — (no throw) | `0` |
| `false` | — (no throw) | `0` |
| `true` | — (no throw) | `1` |
| `"7"` | — (no throw) | `7` |
| `[5]` | — (no throw) | `5` |
| `3.9` | — (no throw) | `3` |

This is the live path for `setFactionAp`, `setUnitMaxHp` and `setUnitHp`. An empty Phase-2 number input (`""`) silently sets a unit to 0 HP mid-fight. From Phase 4 a build code carrying `null` in an HP slot loads a silently wrong board rather than raising "Couldn't read that build code" — which is precisely the failure CLAUDE.md's codec section says must never happen silently.

**Fix:** Validate the input *before* coercing, and reject fractions explicitly.
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
If a DOM `value` string genuinely has to be accepted, convert at the single call site in `[S07]` with an explicit `Number(raw)` plus an `''`/`NaN` check, so the coercion is visible in one place instead of hidden inside the validator.

---

### CR-02: `side` is never validated — `setFactionAp('__proto__', n)` pollutes `Object.prototype`

**File:** `cats-vs-mechs.html:587-614, 660-673` (also `561-566`, `569-572`)
**Issue:** Every op indexes the state with a caller-supplied `side` string and no allowlist: `s.build[side].ap = …`, `s.build[side].units`, `fightOf(s)[side].units`. `s.build` is a plain `JSON.parse` object, so `s.build['__proto__']` resolves to `Object.prototype` — which is not frozen — and the assignment lands on it.

Verified inside the artifact's own realm:
```
before: ({}).ap = undefined
App.ops.setFactionAp('__proto__', 42);
after : ({}).ap = 42          ([]).ap = 42
Object.prototype.hasOwnProperty('ap') = true
App.state.get().build.ap  -> reads as 42   (own property? false)
App.ops.setFactionAp('constructor', 7)  ->  Object.ap = 7   (no throw)
```
Consequences: every object in the page inherits a phantom `ap`; `deepFreeze` and `JSON.stringify` both walk own properties only, so the pollution is invisible to the state contract, invisible to the self-test's `allIntegers` walk, and survives every thaw/freeze cycle for the life of the page. The other unvalidated sides fail with unreadable internal errors instead of the file's own named-failure style — `setUnitMaxHp('nope', …)` surfaces `TypeError: Cannot read properties of undefined (reading 'units')` to the student.

`[S05]`'s banner names this layer as the validation boundary for handler payloads and, from Phase 4, for pasted build-code content (threat T-01-02). Locking the boundary in now costs four lines; retrofitting it after Phase 4 means auditing every call site.

**Fix:** One guard, applied at the top of every op and inside `dispatch`.
```js
var SIDES = ['cats', 'mechs'];

function side(value) {
  if (SIDES.indexOf(value) === -1) {
    throw new Error('Unknown side "' + String(value) + '"');
  }
  return value;
}

function setFactionAp(sideId, ap) {
  var key = side(sideId);                 // throws before any indexing
  App.state.commit('ap ' + key, function (s) {
    s.build[key].ap = int(ap, 0, 99, 'action points');
  });
}
```
Apply identically in `setUnitMaxHp`, `setUnitHp` and `setAlive`. Add a self-test assertion: `t.throws('side is validated', function () { App.ops.setFactionAp('__proto__', 1); });` plus `t.eq('no prototype pollution', ({}).ap, undefined);`.

---

### CR-03: `frame()` consumes the `structural` flag before the rebuild runs, so one render throw desynchronises the page forever

**File:** `cats-vs-mechs.html:453-462`
**Issue:** The flag is cleared, then the rebuild is attempted:
```js
if (structural) {
  structural = false;          // consumed BEFORE the work
  App.render.structure(cur);   // if this throws...
}
App.render.sync(cur);          // ...this never runs either
```
If `App.render.structure()` throws, three things are lost at once: the structural rebuild for this frame, the `sync()` pass for this frame, and — because `structural` is already `false` — the *record* that a rebuild is still owed. Every subsequent `invalidate()` takes the sync-only path. The DOM is permanently stale against state, with no error state to recover from, and the only signal is a dismissible error toast.

Verified: after one throwing `structure()` call, a later `App.ops.setFactionAp('cats', 4)` produced `structureCalls = 1, syncCalls = 1` — the rebuild was never retried.

This is a no-op today (`[S06]` is a stub), which is exactly why it should be fixed now: Phase 2 inherits this funnel, and a roster add/remove that throws mid-rebuild is the realistic trigger.

**Fix:** Only clear the flag once the rebuild has actually succeeded, and route the frame through the error boundary so `sync()` is still attempted.
```js
function frame() {
  if (!dirty) { return; }
  dirty = false;
  frames++;
  if (structural) {
    App.render.structure(cur);   // throws => structural stays true
    structural = false;          // cleared only on success
  }
  App.render.sync(cur);
}

function schedule(fn) {
  var guarded = App.boot.wrap('Render frame', fn);   // D-13: one boundary
  if (typeof requestAnimationFrame === 'function') { requestAnimationFrame(guarded); return; }
  setTimeout(guarded, 16);
}
```
A failed frame then leaves `structural === true`, so the next `invalidate()` retries the rebuild instead of silently skipping it forever.

## Warnings

### WR-01: `commit()` and `undo()` schedule the URL sync before the render, so a sync failure strands committed state un-rendered

**File:** `cats-vs-mechs.html:407-414, 442-446`
**Issue:** `cur = freeze(working)` has already landed when `App.serialize.scheduleUrlSync()` runs. If that call throws, `invalidate()` on the next line never executes — the state has changed, the undo entry exists, and no frame is ever scheduled. Verified by substituting a throwing `scheduleUrlSync`: `build.cats.ap` moved `3 -> 9`, `flush()` reported no pending frame, frame delta `0`.

`scheduleUrlSync` is a declared no-op today, but the comment states the call site exists now specifically so Phase 4 does not have to retrofit it — which means this ordering is being locked in before the code that can fail is written.

**Fix:** Render first, or make the render unconditional.
```js
cur = freeze(working);
commits++;
try {
  App.serialize.scheduleUrlSync();
} finally {
  invalidate();          // the page always catches up with state
}
```
Apply the same shape in `undo()`.

---

### WR-02: `setUi()` accepts any key and any value, admitting non-JSON data into the frozen state

**File:** `cats-vs-mechs.html:646-650`
**Issue:** `s.ui[key] = value` with no key allowlist and no value check. `[S03]`'s banner defines the state as *"integers only, JSON-clonable, no DOM nodes, no functions."* Verified violations:
```
App.ops.setUi('anythingAtAll', {deep:{nested:true}});
  ui slice -> {"kbdNav":false,"anythingAtAll":{"deep":{"nested":true}}}
App.ops.setUi('fn', function(){});
  hasOwnProperty('fn') === true   // a live function is stored in the frozen `cur`
```
The function survives in `cur` until the next `commit`, at which point `thaw()` deletes it silently — a value that exists, then vanishes one commit later, is the hardest class of bug to diagnose at 11pm before a workshop. `setUi('__proto__', {…})` additionally reparents the `ui` slice rather than setting a key.

**Fix:** Allowlist the keys, and constrain the values to the primitives the slice is documented to hold.
```js
var UI_KEYS = ['kbdNav'];

function setUi(key, value) {
  if (UI_KEYS.indexOf(key) === -1) { throw new Error('Unknown ui key "' + String(key) + '"'); }
  if (typeof value !== 'boolean' && !Number.isInteger(value) && typeof value !== 'string') {
    throw new TypeError('ui.' + key + ' must be a boolean, integer or string');
  }
  App.state.commitUi('ui ' + key, function (s) { s.ui[key] = value; });
}
```

---

### WR-03: `App.selftest.run()` mutates the live board and hands back a 30-deep undo stack of test states

**File:** `cats-vs-mechs.html:1154-1284` (specifically 1195, 1203-1208, 1211-1284)
**Issue:** The `state contract` suite exercises the real singleton. Its final act (`resetToDefaults()`, line 1282) restores `build` and clears `fight`, but restores neither the undo stack nor the `ui` slice. Verified before/after `run()`:
```
undoDepth before: 0    ui: {"kbdNav":false}
undoDepth after : 30   ui: {"kbdNav":true}
one Ctrl+Z after #selftest -> build.cats.ap = 4     (shipped default is 3)
```
`4` is the value written by the 100-iteration perf loop at line 1276. An instructor who opens `#selftest` to show the assertions, then starts the workshop on that same tab, is one Ctrl+Z away from a board silently populated with test data — and `ui.kbdNav` is left flipped. The stack also contains a `startFight`/`endFight` pair, so undoing far enough resurrects a fight that was never played.

`run()` is also non-idempotent in a second way: line 1166 asserts the suite started from shipped defaults, so once Phase 4 can load a build from the URL, `#selftest` on any shared link shows a spurious red row.

**Fix:** Snapshot and restore the full state around the suite, and expose a state-scoped reset for the harness.
```js
// [S03] STATE — export for the self-test only
function restore(snapshotJson) {          // no undo entry, no url sync
  cur = freeze(JSON.parse(snapshotJson));
  past.length = 0;
  invalidate({ structural: true });
}

// [S09.3] — first and last acts of the suite
var savedAll = JSON.stringify(App.state.get());
// ...assertions...
App.state.restore(savedAll);
t.eq('the suite handed the board back', JSON.stringify(App.state.get()), savedAll);
t.eq('the suite left no undo history', App.state.undoDepth(), 0);
```
Relax line 1166 to assert shape rather than exact equality with the shipped defaults, so a loaded build code does not turn the suite red.

---

### WR-04: the Ctrl+Z handler has no target guard and calls `preventDefault()`, hijacking native text undo

**File:** `cats-vs-mechs.html:859-865`
**Issue:** The handler is bound to `document` and fires regardless of what has focus. A student typing in a Phase-2 HP field who presses Ctrl+Z to undo their typo does not get their typo back — the entire board rewinds one commit, and `e.preventDefault()` guarantees the browser's native input undo never runs. The same applies to the error panel's `err-detail` textarea (line 123), which is explicitly designed to be selected and edited for pasting into the course thread.

This also contradicts the file's own stated render doctrine (`[S06]`: *"the node under the cursor, and the focused input, are never destroyed mid-interaction"*) — the input survives, but the value under it is yanked away.

**Fix:** Let the browser own undo whenever a text-editing surface has focus.
```js
document.addEventListener('keydown', wrap('undo shortcut', function (e) {
  if (!(e.ctrlKey || e.metaKey)) { return; }
  if (e.shiftKey) { return; }
  if (e.key !== 'z' && e.key !== 'Z') { return; }

  var el = e.target;
  var tag = el && el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || (el && el.isContentEditable)) { return; }

  e.preventDefault();
  App.ops.undo();
}));
```

---

### WR-05: `startFight()` on an in-progress fight silently discards it

**File:** `cats-vs-mechs.html:616-626`
**Issue:** No guard on `s.fight !== null`. The mutator unconditionally overwrites `round`, `turn`, `log`, and both sides' `hp`/`alive` arrays. Verified: a unit at `hp = 1` mid-fight returned to full health after a second `startFight()`, and the (Phase-5) `log` array is reset to `[]`.

A double-click on the Phase-2 "Start fight" button, or a click on a button the student thought said something else, destroys the entire fight record. It is one commit and therefore recoverable by Ctrl+Z — but only if the student realises what happened before the coalescing window and the 30-entry cap have moved on.

**Fix:** Make restarting explicit.
```js
function startFight() {
  App.state.commit('start fight', function (s) {
    if (s.fight !== null) {
      throw new Error('A fight is already in progress — end it before starting a new one');
    }
    s.fight = { round: 1, turn: 'cats', log: [], cats: sideFromBuild(s.build.cats), mechs: sideFromBuild(s.build.mechs) };
  });
}
```
The mutator runs on the detached copy before anything is recorded, so the throw leaves no phantom undo step — exactly the property `commit()` was built for. Phase 2 can add an explicit `restartFight()` if a restart affordance is wanted.

---

### WR-06: `apSpent()` returns a negative number when build AP is lowered mid-fight

**File:** `cats-vs-mechs.html:309-311`
**Issue:** `buildFaction.ap - fightSide.ap` assumes the build pool only ever moves before a fight starts. Nothing prevents `setFactionAp` during a fight — the build and fight slices are independent by design. Verified: with a fight started at `ap 3` and the build then lowered to `1`, `apSpent` returned `-2`. Phase 3's projection panel will render "AP spent: −2" on a shared screen.

**Fix:** Clamp at the derivation, which is the only place that owns the meaning of the number.
```js
function apSpent(buildFaction, fightSide) {
  return Math.max(0, buildFaction.ap - fightSide.ap);
}
```
Add the case to the model suite: `t.eq('apSpent never goes negative', App.model.apSpent({ap:1},{ap:3}), 0);`.

---

### WR-07: shield exists in `build` and in eHP but has no representation in the fight slice

**File:** `cats-vs-mechs.html:576-583` (with `284-290`)
**Issue:** `unitEhp` is `maxHp + shield`, so mechs project at 27 eHP. `sideFromBuild` copies only `{ id, hp: u.maxHp, alive }` — verified fight-side keys are `["id","hp","alive"]` and mech total fight HP is `18`. The board therefore shows 18 points of health while the projection panel claims 27, and a student who rules "the Recharge shield absorbs that hit" has nowhere to record the shield being spent.

CLAUDE.md is explicit that this class of gap is the one to avoid: storing/omitting derived inputs *"creates a second, mechanical reason for the projection to disagree with the board, muddying the pedagogical disagreement the project is built around."* The 27-vs-18 gap is exactly that mechanical reason.

This is not a request to automate combat — the student still rules how shield behaves. It is a request for a field to write the ruling into.

**Fix:** Carry shield into the fight slice as a spendable pool, alongside `hp`.
```js
function sideFromBuild(faction) {
  return {
    ap: faction.ap,
    units: faction.units.map(function (u) {
      return { id: u.id, hp: u.maxHp, shield: u.shield, alive: true };
    })
  };
}
```
Then add `setUnitShield(side, unitId, shield)` in `[S05]` mirroring `setUnitHp`, and assert in `[S09.3]` that fight-side eHP equals build-side eHP at the moment `startFight()` runs. If shield is genuinely meant to be an abstract eHP modifier with no fight-time representation, say so in the `[S02]` banner — right now the two sections disagree and neither states an intent.

---

### WR-08: `t.eq` reports PASS when both sides stringify to `undefined`, and FAIL on key order alone

**File:** `cats-vs-mechs.html:936-938`
**Issue:** `JSON.stringify(actual) === JSON.stringify(expected)` has two failure modes, both verified against the shipped harness:

```
PASS  undefined equals undefined      <- a typo'd property path passes silently
PASS  undefined equals a function     <- both stringify to `undefined`
FAIL  key order matters               <- {a:1,b:2} vs {b:2,a:1}
```

The false PASS is the dangerous one: `t.eq('…', App.state.get().fight.cats.unts, undefined)` is green. This harness is the artifact's only correctness gate — CLAUDE.md's testing section justifies it precisely because it tests *"the things that fail silently and expensively."* A comparator that itself fails silently undercuts that.

**Fix:** Reject `undefined` on either side, and compare with a key-order-insensitive serialiser.
```js
function stable(v) {
  if (v === undefined) { return '<undefined>'; }
  if (v === null || typeof v !== 'object') { return JSON.stringify(v); }
  if (Array.isArray(v)) { return '[' + v.map(stable).join(',') + ']'; }
  return '{' + Object.keys(v).sort().map(function (k) { return JSON.stringify(k) + ':' + stable(v[k]); }).join(',') + '}';
}

eq: function (label, actual, expected) {
  if (actual === undefined && expected === undefined) {
    push(label, false, 'both sides undefined — assertion is vacuous', 'a real value');
    return;
  }
  push(label, stable(actual) === stable(expected), actual, expected);
}
```
Keep the existing order-sensitive check where order is the point (line 1169's slice-order assertion) by using `t.eq` on `Object.keys(...)` as it already does.

---

### WR-09: a wall-clock performance assertion ships inside the artifact

**File:** `cats-vs-mechs.html:1274-1279`
**Issue:** `t.ok('100 commits stay fast', elapsed < 50)` compares `Date.now()` deltas against a hard 50 ms budget. This is the one assertion in the suite whose result depends on the machine, the browser's background load and whether the tab is throttled. Its failure mode is a red row on a projector during a workshop, caused by nothing the student or instructor did — the worst possible signal from a teaching artifact's own test panel. It also floods the undo stack with 30 `perf N` entries (see WR-03).

**Fix:** Either drop it, or make it report rather than assert — a timing number is useful context and a bad pass/fail gate.
```js
// Reported, not asserted: a timing gate on a shared projector fails for
// reasons that have nothing to do with the code.
var elapsed = Date.now() - started;
t.ok('100 commits completed', App.state.get().build.cats.ap === 4);
records.push({ suite: 'state contract', name: '100 commits took ' + elapsed + ' ms', pass: true, actual: elapsed, expected: 'informational' });
```
If a hard gate is wanted, keep it in `tests/selftest-node.cjs` where the environment is controlled and no student sees it.

---

### WR-10: the forbidden-pattern gate is line-scoped and its sink list has gaps

**File:** `tests/selftest-node.cjs:29-69`
**Issue:** The header comment calls this *"the mechanical proof of 'no outbound requests, no external dependencies, no markup-injection sink.'"* It is a per-line regex scan, so it proves less than that:

1. **Line-scoped.** `html.split(/\r?\n/)` then `rule.re.test(line)` — any pattern broken across a newline evades every rule. `el\n  .innerHTML = x` passes.
2. **Literal-only.** `el['inner' + 'HTML']` and `el[prop]` pass.
3. **Incomplete sink list.** No rule for `outerHTML`, `insertAdjacentHTML`, `document.write`, `srcdoc`, `DOMParser`, `createContextualFragment`, `javascript:` URLs, `<iframe`, `setAttribute('src'…)`, or a bare `Function(` without `new` (only `/new Function/` is checked). Verified none of these are present in the artifact today — the gap is latent, not live — but a gate whose comment claims proof will be trusted rather than re-read when Phase 2 adds the render layer.

**Fix:** Extend the rule set and scan the whole document rather than line by line, keeping line attribution via an index lookup.
```js
const FORBIDDEN = [
  // ...existing rules...
  { label: 'markup injection sink', re: /innerHTML|outerHTML|insertAdjacentHTML|document\.write|createContextualFragment/ },
  { label: 'HTML parser',           re: /DOMParser|srcdoc/ },
  { label: 'javascript: URL',       re: /javascript:/ },
  { label: 'embedded frame',        re: /<iframe/i },
  { label: 'Function constructor',  re: /\bnew\s+Function\b|\bFunction\s*\(/ }
];

FORBIDDEN.forEach((rule) => {
  const re = new RegExp(rule.re.source, 'g');   // whole-document, multi-line safe
  let m;
  while ((m = re.exec(html)) !== null) {
    const line = html.slice(0, m.index).split('\n').length;
    hits.push('  line ' + line + ' [' + rule.label + ']: ' + m[0]);
  }
});
```
Soften the header comment from "mechanical proof" to "a mechanical gate against the known sinks" — the claim should match what the code does.

---

### WR-11: `[S03] STATE` calls into `[S01] DATA` at section-body evaluation time, breaking the file's own stated rule

**File:** `cats-vs-mechs.html:355-359`
**Issue:** The table of contents states the rule at lines 148-150: *"Dependency arrows point DOWN only; reference another section as `App.x.y()` at the call site, never by capturing it at section-body scope, so reordering can never break anything."*

Line 355 does exactly what the rule forbids — `App.data.deepFreeze({ build: App.data.defaults(), … })` executes while the `[S03]` IIFE body is being evaluated, not at a call site. Moving `[S03]` above `[S01]` now throws `TypeError: Cannot read properties of undefined (reading 'deepFreeze')` at load, which is the failure the rule exists to prevent.

A file that states an invariant and violates it three sections later teaches the reader to stop trusting the banners — and the banners are the navigation system for a 1,300-line single file.

**Fix:** Defer the initial state to first use, so nothing crosses a section boundary at evaluation time.
```js
var cur = null;   // built lazily so [S03] does not call [S01] at section-body scope

function initial() {
  return App.data.deepFreeze({ build: App.data.defaults(), fight: null, ui: { kbdNav: false } });
}

function get() {
  if (cur === null) { cur = initial(); }
  return cur;
}
```
Route `commit`, `commitUi` and `undo` through `get()` instead of reading `cur` directly. If lazy init is judged worse than the rule, amend the banner to name this one documented exception rather than leaving the contradiction unexplained.

## Info

### IN-01: `99` is a magic number in three places, and HP is clamped to it rather than to `maxHp`

**File:** `cats-vs-mechs.html:589, 595, 603`
**Issue:** The same bare `99` appears as the ceiling for action points, max health and current health. It also means fight HP is clamped independently of the unit's own `maxHp` — verified `m1.hp = 99` while `m1.maxHp = 6`, so a token row can render 99 pips for a 6-HP mech.
**Fix:** Name the ceilings (`var MAX_AP = 99, MAX_HP = 99;`). If HP above `maxHp` is intended as a manual-override affordance, say so in the `setUnitHp` comment; if not, clamp to the unit's own `maxHp`.

### IN-02: `findUnit`'s `side` argument is used only for the error string

**File:** `cats-vs-mechs.html:561-566`
**Issue:** The caller passes both `side` and `collection` separately, so the error message and the array searched are two independent sources of truth. A future miscall reports a confidently wrong side.
**Fix:** Derive the collection inside the helper — `findUnit(s, side, unitId, 'build' | 'fight')` — or drop the parameter and let the caller compose the message.

### IN-03: `dispatch()` returns `undefined` for every act except `'undo'`

**File:** `cats-vs-mechs.html:660-673`
**Issue:** Seven cases return `undefined`; `case 'undo'` returns a boolean. Phase 2's delegated root cannot use the return value uniformly.
**Fix:** Return a consistent value — `return true;` from each op wrapper, or have `dispatch` always return `undefined` and expose `App.ops.undo()` directly for the one caller that needs the boolean.

### IN-04: the undo shortcut is keyboard-layout dependent

**File:** `cats-vs-mechs.html:862`
**Issue:** `e.key !== 'z' && e.key !== 'Z'` compares the produced character, which differs on Dvorak, AZERTY and non-Latin layouts. `e.code === 'KeyZ'` names the physical key, which is what Ctrl+Z means.
**Fix:** `if (e.code !== 'KeyZ') { return; }`, keeping the `e.key` check as a fallback for browsers without `code`.

### IN-05: every non-terminal error steals focus

**File:** `cats-vs-mechs.html:811`
**Issue:** `dismiss.focus()` fires on each `fail()` call. A recurring handler error — for example, one thrown on every keystroke in a bad input — repeatedly yanks the caret out of the field the student is typing in.
**Fix:** Only take focus the first time the panel becomes visible: `if (!terminal && panel.hidden) { … panel.hidden = false; dismiss.focus(); }` — read `panel.hidden` before setting it.

### IN-06: `undo()` changes state without incrementing `commits`

**File:** `cats-vs-mechs.html:430-447` (with `499-501`)
**Issue:** `commit()` and `commitUi()` both `commits++`; `undo()` does not, though it replaces `cur`. `stats().commits` therefore under-reports state transitions, which will mislead whoever debugs a coalescing problem using it.
**Fix:** Either `commits++` in `undo()`, or rename the field to `edits` and document that undo is deliberately excluded.

### IN-07: `commit()` has no change detection, so no-op actions consume undo slots

**File:** `cats-vs-mechs.html:385-414`
**Issue:** Setting a value to what it already is, or calling `endFight()` when `fight` is already `null`, pushes a real undo entry whenever the label does not coalesce. With `UNDO_LIMIT = 30`, a run of no-op actions evicts recoverable history.
**Fix:** Compare after the mutator and skip both the push and the invalidate when nothing moved.
```js
var next = JSON.stringify({ build: working.build, fight: working.fight });
if (next === snap) { return; }   // nothing changed: no entry, no frame
```

### IN-08: unused CSS and an unguarded smooth-scroll

**File:** `cats-vs-mechs.html:30, 41, 50-68`
**Issue:** `.num`, `.card.tight`, `.g2`, `.g3`, `.grid`, `.callout.accent|gold|green`, `.ex` and `.faint` are defined but unreferenced by the current markup — reasonable as a Phase-2 palette, but currently dead. Separately, `html{scroll-behavior:smooth}` has no `prefers-reduced-motion` guard.
**Fix:** Leave the token classes if Phase 2 will consume them (add a one-line comment saying so, so a later reader does not delete them); wrap the scroll behaviour:
```css
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
```

---

_Reviewed: 2026-08-26T21:20:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
