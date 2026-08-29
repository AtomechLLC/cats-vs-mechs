# Phase 4: Share & Reset — Pattern Map

**Mapped:** 2026-08-28
**Work units analysed:** 14 (11 regions of `cats-vs-mechs.html`, 3 of `tests/selftest-node.cjs`)
**Analogs found:** 11 / 14 — three techniques have no precedent anywhere in the repo, and one of the
three is actively contradicted by policy the file states twice.

> **This project is two files.** "New file" has no meaning here; the unit of work is a **region**
> (`[S0N]` / `[S0N.M]` / `[C0N]`) inside `cats-vs-mechs.html`, plus sections of
> `tests/selftest-node.cjs`. Every analog is therefore in-file.
>
> **Phase 4 is unusually well-provisioned by its predecessors.** `[S04] SERIALIZE` already exists as
> a banner and a frozen no-op; `commit()` and `undo()` already call `App.serialize.scheduleUrlSync()`;
> `App.ops.resetToDefaults()` already exists and is already wired to a button; the topbar comment
> already reserves the slot for share and reset by name. Four of this phase's five ROADMAP criteria
> have a shipped template. The fifth — the confirmation dialog — does not, and § No Analog Found
> explains why that is a decision to be taken rather than a gap to be filled.

---

## Rule 0 — the four things to read before writing any identifier, comment or line of copy

### 0.1 `[S04]` is not a new section. It is a reserved one, with a contract already written.

`cats-vs-mechs.html:2564-2578`
```js
/* ===================== [S04] SERIALIZE =====================
 * Compact positional build code: encode(build) -> string,
 * decode(string) -> build, a mandatory version prefix and a checksum.
 * Knows about `build` only — never about `fight` or `ui`.
 * scheduleUrlSync() is a declared no-op today so that the commit() call site
 * exists from the first day and is never retrofitted.
 * deps: App.data
 * owner: Phase 4, plan 04-01
 * =========================================================== */
// #region [S04] SERIALIZE
App.serialize = Object.freeze({
  // Declared no-op until Phase 4 plan 04-01 fills it in.
  scheduleUrlSync: function () {}
});
// #endregion [S04] SERIALIZE
```
The banner's four claims are binding on the plan: `build` only; a mandatory version prefix; a
checksum; `deps: App.data` and nothing else. A plan that reaches `App.state` from inside `[S04]`
is editing that contract and must say so in the banner, not quietly.

The table-of-contents entry already exists too, at `:1374` — `[S04] SERIALIZE  build-code encode /
decode + hash sync  (Phase 4, plan 04-01)`. It does **not** need adding; it needs its sub-regions
adding if the plan splits `[S04]` the way `[S06]` and `[S07]` are split.

### 0.2 The three call sites already exist. Do not add a fourth without deciding it.

| Call site | Line | Calls `scheduleUrlSync`? | Why |
|---|---|---|---|
| `commit(label, mutator)` | `:2416` | **yes**, inside a `try` with `invalidate()` in the `finally` | every undoable change is a shareable change |
| `undo()` | `:2453` | **yes**, same `try`/`finally` shape | the restored state is already live, so the frame is owed whether or not the sync succeeds |
| `commitUi(label, mutator)` | `:2426-2434` | **NO, deliberately** | *"nothing lands on the undo stack and nothing reaches the share code (D-09)"* |
| `restore(snapshotJson)` | `:2534-2538` | **no** | `[S09]`-only writer; named as the single documented exception in the `[S03]` banner at `:2307-2310` |

The `finally` at `:2412-2420` is the load-bearing part and its own comment says why:
```js
    // The finally is not defensive noise. State has already moved by the time
    // this runs, so a throw from the sync must never be able to leave a
    // committed change with no frame scheduled for it -- the undo entry would
    // exist, the board would read the old numbers, and nothing would ever
    // reconcile the two. The page always catches up with state.
    try {
      App.serialize.scheduleUrlSync();
    } finally {
      invalidate();
    }
```
**A `scheduleUrlSync` that throws must therefore be survivable.** It is inside the funnel every
student action passes through, and its failure may not cost the frame.

### 0.3 The naming trap, measured this session against the four live checks.

`/rating/i` is a **document-wide** ban (Layer A, `tests/selftest-node.cjs:170`). Measured against the
live word lists, the following ordinary Phase-4 words **fail**:

| Word | Fails | Layer |
|---|---|---|
| `generating`, `generate`… (`generating a code`) | `rating` | **A — whole document, comments and CSS included** |
| `operating`, `separating`, `decorating`, `integrating` | `rating` | **A** |
| `counter`, `encounter` | `counter` | **A** |
| `balance`, `rebalance` | `balance stem` | **A** |
| `difficulty` | `difficulty stem` | **A** |
| `underscore` | `score` | **B — string literals only** |
| `upgrade`, `downgrade`, `degraded` | `grade` | **B** |
| `lead` (bare word) | `lead` | **B** |
| `frank` | `rank` | **B** |
| `wins` | `wins` | **B** |

Measured **clean** on both lists: `share`, `build code`, `copy`, `copied`, `paste`, `load`, `reset`,
`confirm`, `discard`, `start over`, `Workshop 16 defaults`, `clipboard`, `address bar`, `link`,
`characters`, `character count`, `counting`, `countdown`, `truncated`, `incomplete`, `version`,
`schema`, `restore`, `overwrite`, `replace`, `bookmark`, `reload`, `shorter`, `longer`, `fits`,
`budget`, `limit`, `window`.

Two consequences for this phase specifically:
- **Never write "generating a build code"** in a comment, a CSS comment or a rendered string. Write
  *"producing"*, *"writing"*, *"building"*.
- **Never write "counter"** for the monotonic id sequence. `[S05]` already avoids it: `nextUnitId`
  (`:3126`) and `nextTokenTypeId` (`:2789`) both say *"scan every id already in use, take the largest
  suffix and add one"* and never name the thing a counter.

`FORBIDDEN` (`tests/selftest-node.cjs:32-46`) adds four more traps that a URL phase walks straight
into: `/https?:\/\//`, `/url\(/`, `/javascript:/` and `/ src=|setAttribute\(\s*['"]src['"]/`. **A CSS
rule or a comment containing the three characters `url(` fails the run.** So does a comment that
writes out an example `https://` link.

### 0.4 The Node harness's `location` is a bare object with one key.

`tests/selftest-node.cjs:1202-1214`
```js
const domSandbox = {
  console: console,
  ResizeObserver: StubResizeObserver,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  queueMicrotask: queueMicrotask,
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  document: dom.document,
  window: dom.window,
  location: { hash: '' },
  CSS: dom.CSS
};
```
And the **section-3 sandbox has no `location` at all**, deliberately, `:339-347`:
```js
// Deliberately no `document` and no `location`: [S10] LAUNCH stays inert and
// App.hasFlag takes its undefined-location path.
```

So, mechanically, in the gate today:
- `location.hash = '...'` **works** (plain property assignment on a plain object) and is
  **observable** — the gate can read `domSandbox.location.hash` back. That is the cheap, already-
  available way to assert SHARE-05.
- `history.replaceState` **does not exist** and `location.reload` **does not exist**. Using either
  requires growing the stub, and growing the stub is the plan's job to name.
- Anything in `[S04]` that runs during the **DOM-free** section-3 load must take the
  `typeof location === 'undefined'` path, exactly as `App.hasFlag` does at `:1419`.

---

## Work-unit Classification

| Work unit | Region | Role | Data flow | Closest analog | Match |
|---|---|---|---|---|---|
| 1. `[S04]` section fill-in — IIFE, banner, exports | `[S04]` | config/module | — | `[S02]` `:1939-2301` and `[S03]` `:2302-2562`, both end to end | **exact** |
| 2. `encode(build)` / `decode(code)` pure functions | `[S04]` | service (pure) | transform | `[S02]`'s `actionApCost` `:2015-2023`, `turnsToWipe` `:2265-2280` | **exact** |
| 3. Version prefix, checksum, alphabet, size caps | `[S01]` + `[S04]` | model/config | static data | `MAX_CUSTOM_TYPES` `:1536`, `MAX_CUSTOM_ACTIONS` `:1712-1714`, `TOKEN_SCOPES` `:1548`, `XF_WHO` `:1746` | **exact** |
| 4. `scheduleUrlSync()` — the `location.hash` write | `[S04]` | service | event-driven | **partial only** — `App.hasFlag` `:1417-1430` is the read; `:9388-9390` is the only write | **partial** |
| 5. Hash read at boot | `[S08]` `start()` | controller | request-response | `App.hasFlag('selftest')` / `'throwinit'` / `'throwhandler'` in `start()` `:9487-9560` | **role-match** |
| 6. `loadBuildCode(code)` — the one non-op state write | `[S05]` | controller (writer) | batch | `resetToDefaults` `:3230-3235`, and `restore()` `:2534-2538` as the **anti**-pattern | **role-match** |
| 7. Named ops for share/reset | `[S05]` | controller (writer) | CRUD | `createAction` / `renameAction` / `removeAction` `:3651-3785`; `resetToDefaults` `:3230-3235` | **exact** |
| 8. The share `<dialog>` shell + ids | shell markup | component | — | `#tok-picker` `:993-1092` and `#act-edit` `:1094-1363`, end to end | **exact** |
| 9. `[S06.6]` share-dialog repaint, sig-keyed | new `[S06.6]` | component | request-response | `[S06.2]` `:5235-5664` and `[S06.5]` `:6130-7188` | **exact** |
| 10. `[S07.4]` share-dialog attachment | new `[S07.4]` | controller | event-driven | `[S07.2]` `:7814-8334` and `[S07.3]` `:8336-9305` | **exact** |
| 11. `[C13]` share-dialog styles | `<style>` | config | — | `[C07]` `:351-476` and `[C12]` `:643-~886` | **exact** |
| 12. The reset confirmation | shell + `[S07.4]` | controller | staged form | **none, and the file argues against it twice** — see § No Analog Found | **none** |
| 13. Clipboard write with tiered fallback | `[S07.4]` | service | side-effect | **none** — `grep -c "clipboard\|writeText\|execCommand"` over the artifact reads **0** | **none** |
| 14. The gates — new `[S09.11]` + harness | `[S09.11]`, `tests/selftest-node.cjs` | test | — | `[S09.10]` `:13291-14551`; stub-drift `:1160-1192`; Layer C `:4311-4700` | **exact** |

---

## Pattern Assignments

### Work unit 1 — `[S04]`: the section, opened for real

**Analog A — section shape.** Every section is an IIFE opening with `'use strict'` and returning a
frozen object. The reason is in the table of contents, `:1401-1404`:
```
 *   2. Each section is an IIFE opening with 'use strict'. Strict mode is what
 *      makes a write to the frozen defaults throw instead of failing silently.
 * Section banners and #region markers sit at column 0; code is indented two
 * spaces, matching the siblings.
```
`[S04]` today is **not** an IIFE — it is a bare frozen literal, because it holds one no-op. Opening
it means becoming one, in `[S02]`'s exact shape (`App.model = (function () { 'use strict'; … return
Object.freeze({…}); })();`, `:1951` / `:2282-2299`).

**Analog B — the dependency-arrow rule, which decides where the section may read from.** `:1394-1397`
```
 * Region order is fixed. Dependency arrows point DOWN only; reference another
 * section as App.x.y() at the call site, never by capturing it at section-body
 * scope, so reordering can never break anything.
```
`[S04]` sits **above** `[S05]`, `[S06]`, `[S07]`. So `[S04]` may call `App.data.*` freely; it may
call `App.state.get()` only *at a call site*, never captured; and it may not read or write the page
at all. `[S03]`'s own banner already names `App.serialize` in its `deps` line (`:2326`), which is the
downward arrow already drawn.

**Analog C — the sub-region split, if `[S04]` needs one.** `[S06]` and `[S07]` both split, and both
state the criterion in the sub-banner rather than in the TOC. `[S06.3]:5665-5672` is the shortest
statement of it. If the codec, the hash mirror and the paste path become `[S04.1]` / `[S04.2]` /
`[S04.3]`, follow `[S09]`'s convention instead: `[S09]`'s own banner (`:9626-9640`) carries the
sub-region index because *"the table of contents at the top of the script names sections, not
sub-regions"*.

**Export block to write:** the shape at `:2282-2299` — one frozen object, one key per exported
function, nothing else.

---

### Work unit 2 — `[S04]`: `encode` and `decode` as pure functions

**Analog:** `[S02]`, and specifically the two functions that already model "refuse rather than
repair".

`cats-vs-mechs.html:2015-2023` — the shape a decoder's per-field reader wants, and note the last
line of its comment, which was written *for this phase*:
```js
  // A record with no cost is the shipped default of one point, which is what
  // keeps the six actions this file ships reading exactly as they did.
  // Every term is read through its own `tok` FIELD, never a key position, so a
  // record that arrived from a pasted build code in Phase 4 cannot name a
  // property of the prototype by sitting in the right slot.
  function actionApCost(a) {
    if (!a.cost) { return 1; }
    if (!Array.isArray(a.cost) || a.cost.length !== 1) { return null; }
    var c = a.cost[0];
    if (!c || c.tok !== 'ap') { return null; }
    if (!Number.isInteger(c.n) || c.n < 1) { return null; }
    return c.n;
  }
```
**Four things to copy structure-for-structure:** a guard per assumption, each on its own line; the
`Array.isArray` test before any index; `Number.isInteger` before any arithmetic; and a `null` return
that means *"this cannot be priced"* rather than a thrown error or a repaired value.

**The refusal-above-the-arithmetic idiom**, `soakTotal` `:2218-2220`:
```js
  function soakTotal(faction, hit) {
    if (!(hit > 0)) { return 0; }
```
Written as *"not greater than zero"* so a `NaN` is refused by the same line. A decoder reading a
run-length count off a pasted string wants exactly this spelling.

**The record-return contract**, `turnsToWipe` `:2265-2280` — *return a record of whole numbers or
`null`, and format nothing.* `decode()`'s failure path is the same shape: hand back a record naming
what went wrong, and let the page choose the words. **`[S02]`'s banner forbids the alternative
outright**, `:1939-1947`:
```
 * PURE derivations. Every function takes the state, or a slice of it, as an
 * argument. Nothing here reads the state singleton, reads or writes the page,
 * or stores a derived value ...
 * ... nothing below produces a symbol or a string,
 * because the page owns how a range is written down.
```
`[S04]`'s banner inherits the same posture by its `deps: App.data` line. **A `decode` that throws a
sentence the page shows verbatim is the boundary violation to avoid.** Compare how `[S02]` and
`[S06.3]` split it today: the model returns `null`, and `turnsText(r, foeName)` at `:5900`-ish holds
the words. Do the same — `decode` returns `{ ok: false, why: 'version' | 'checksum' | 'shape' }`,
and the share dialog writes the sentence.

**The one existing statement of what "never load garbage silently" costs**, `[S09]`'s harness comment
`:9663-9670`:
```js
    //   - anything that stringifies to nothing at all compared as EQUAL to
    //     anything else that does, so a typo'd property path passed silently.
    // The second one is the dangerous one: a gate that fails quietly is worse
    // than no gate, because it is believed.
```

---

### Work unit 3 — `[S01]`: the version, the checksum, the alphabet and the caps

**Analog A — the `MAX_*` cap idiom.** Every cap in `[S01]` is a named `var`, exported, with the
arithmetic that chose it in the comment above it. Three examples, and the third is the one to copy
because it is already written **about this phase's budget**:

`:1532-1536`
```js
  // How many token types of their own a student may keep (D-18). Ships at 6
  // and is a Phase 4 dial, exactly as --tok shipped as a rehearsal dial for
  // the projector: six definitions at roughly 30 characters each is ~180 of
  // SHARE-04's 512-character build code before a single tally is written.
  var MAX_CUSTOM_TYPES = 6;
```
`:1553-1555`
```js
  // The name cap (D-12), and the unit is CODE POINTS, not UTF-16 code units.
  // ... cutting one in half leaves a lone surrogate
  // that makes Phase 4's encodeURIComponent throw URIError a long way from the
  // code that caused it. A Phase 4 budget dial, like MAX_CUSTOM_TYPES above.
  var MAX_TOKEN_NAME = 24;
```
`:1694-1714` — the fullest worked example, and the arithmetic Phase 4 must now **check against a real
measurement** rather than inherit:
```js
  // How many actions of their own a student may keep per side (D-10), and the
  // two term caps. Each is a named exported constant in the MAX_CUSTOM_TYPES
  // idiom, and each is a PHASE 4 CODEC DIAL rather than a taste call — so the
  // arithmetic is written down here and the next plan to move one moves it
  // against measured cost instead of a feeling:
  //   a compact positional spelling of one authored action carrying one cost,
  //     one requirement and one transformation measured about 20 characters at
  //     a six-character name; a name at MAX_TOKEN_NAME adds up to 18 more, and
  //     each extra term about 6 — call it 50 worst case;
  //   three per side, both sides, is about 300 against SHARE-04's 512-character
  //     budget, of which the token vocabulary already claims roughly 180. ...
  var MAX_CUSTOM_ACTIONS = 3;
  var MAX_ACTION_REQ = 2;
  var MAX_ACTION_XF = 2;
```
**This is a prediction Phase 4 is obliged to either confirm or correct in writing.** 180 + 300 = 480
against a 512-character design target, with the roster, the tallies, the appearance fields and the
version prefix still unpaid. If the measurement lands over budget, the escalation path is already
named in the same comment and in CLAUDE.md: `CompressionStream('deflate-raw')` + base64url, with the
`v<N>~` prefix kept **outside** the compressed blob.

**Analog B — the index-stability paragraph, which three allowlists already carry and which the codec
is the sole reason for.** `TOKEN_SCOPES` `:1543-1548`:
```js
  // INDEX STABILITY — the same rule GLYPHS carries below, for the same reason.
  // Phase 4 may encode a scope as its POSITION here. Entries may be APPENDED
  // to the end. They may never be reordered, and never removed, without
  // bumping the build code's schema version.
  var TOKEN_SCOPES = deepFreeze(['unit', 'side']);
```
The same paragraph is on `GLYPHS` (`:1595`) and on `XF_WHO` (`:1740-1746`). **Phase 4 is the phase
that makes those three promises load-bearing.** Whatever the codec encodes positionally, its
allowlist must carry this paragraph and `[S09.11]` must assert the order — because a reorder is now
a silent wrong-board on a link shared last term, which is the exact failure `:1595` predicts.

**Analog C — `schema: 1` already exists in the build slice.** `:1769`, inside `DEFAULTS`. Four
assertions already pin the build key set as `['schema', 'cats', 'mechs', 'tokens']` — `:10183`,
`:11050`, `:11251`, `:11432`, plus `:12988` sorted, plus `tests/selftest-node.cjs:5666`. **Six places
go red if the codec adds a key to `build`.** That is a feature: it means the version prefix belongs
in the *code string*, not in a new state key. `build.schema` is the record's version; the `v1~` prefix
is the *wire* version; if they are the same number the plan should say so, and if they are not it
should say why.

**Export block to extend:** `:1904-1937`.

---

### Work unit 4 — `[S04]`: the `location.hash` write

**There is one hash write in the entire artifact, and it is a bail-out rather than a mirror.**
`cats-vs-mechs.html:9384-9394`
```js
    reset.addEventListener('click', wrap('Reset to defaults', function () {
      // After a terminal failure nothing in memory is trustworthy, so start
      // over from a clean hash rather than writing to state.
      if (terminal) {
        location.hash = '';
        location.reload();
        return;
      }
      App.ops.resetToDefaults();
      panel.hidden = true;
    }));
```
Two things to lift and one to leave:
- **Lift the `location.hash = ''` spelling.** Direct property assignment, not
  `history.replaceState`. It is the spelling the Node stub already supports (§ Rule 0.4) and it is
  the spelling already in the file.
- **Lift the "clean hash" concept**: a reset must not leave a stale build code in the address bar
  that a reload would then load back. Write the hash on reset, in the same commit's wake.
- **Do not lift `location.reload()`.** It exists here only because `terminal === true` means memory
  is untrustworthy. Nothing in Phase 4 is in that state.

**The read half, and the sentence Phase 4 invalidates.** `[S00]`'s banner, `:1408-1414`:
```
 * The single global. Every section hangs off it.
 * hasFlag() is the only place hash text is read anywhere in this file, and it
 * compares whole tokens by exact equality: a link ending #notselftest or
 * #selftestx must not open the developer report. Hash text never reaches a
 * page sink or a dynamic code path.
```
```js
App.hasFlag = function (name) {
  'use strict';
  if (typeof location === 'undefined') { return false; }
  var raw = location.hash || '';
  if (raw.charAt(0) === '#') { raw = raw.slice(1); }
  var tokens = raw.split(',');
  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i].trim() === name) { return true; }
  }
  return false;
};
```
**Three facts the plan must handle explicitly:**
1. `"hasFlag() is the only place hash text is read anywhere in this file"` **stops being true** the
   moment `[S04]` reads a build code out of the hash. That banner sentence must be amended in the
   same change, not left as *"a banner that quietly lies"* — the phrase `[S03]`'s banner uses at
   `:2309-2310` for exactly this hazard.
2. **The hash is comma-tokenised.** `#selftest` and a build code must coexist:
   `#selftest,v1~abc…` already parses correctly under `hasFlag`, because it splits on `,` and
   compares whole tokens. So the build code must be a token in the same comma list, and it must
   contain no comma. **That is a constraint on the codec alphabet**, and it is discoverable only
   from this function.
3. `if (typeof location === 'undefined') { return false; }` is the guard idiom. `[S04]` needs the
   same first line, because section 3 of the harness loads the script with no `location` at all.

**`isSecureContext` / clipboard / `CompressionStream` are all available from `file://`** per CLAUDE.md's
verified capability matrix, and none of them appears anywhere in the artifact today.

---

### Work unit 5 — `[S08]`: reading a build code at boot

**Analog:** `start()`'s three existing hash-driven branches, `:9487-9560`. The shape is
"`App.hasFlag(...)` guards a named, optional behaviour, and the whole thing sits inside `start()`'s
one try/catch":
```js
      if (App.hasFlag('throwinit')) {
        throw new Error('Deliberate init failure (#throwinit)');
      }
      ...
      if (App.hasFlag('selftest')) {
        attempt('Self-test', function () { App.selftest.report(App.selftest.run()); });
      }
```
**`attempt(label, fn)` is the wrapper to use** — `:9469`-ish, "one wiring step, non-terminal". A
build code that fails to decode must be **non-terminal**: the panel appears, the shipped board stays
on screen, `dismiss` is offered. A terminal failure hides `dismiss` (`:9459`) and tells the student
to reload, which is the wrong answer for a bad link.

**Ordering matters and the existing code shows where.** The first paint is requested at `:9557`:
```js
      // The very first paint goes through the same path every later update
      // does, so there is no separate first-render code path to keep in step.
      App.state.invalidate({ structural: true });
```
A hash-loaded build must land **before** that line, or the student sees the shipped board flash and
then be replaced.

---

### Work unit 6 — `[S05]`: the one write path a pasted code takes

**The anti-pattern first, because it is the tempting one.** `App.state.restore()` at `:2534-2538`
takes a JSON string, replaces `cur` wholesale and **clears the undo stack**:
```js
  function restore(snapshotJson) {
    cur = freeze(JSON.parse(snapshotJson));
    past.length = 0;
    invalidate({ structural: true });
  }
```
It is reserved to `[S09]` by name in the `[S03]` banner (`:2307-2310`) and in the `[S05]` banner
(`:2584-2586`): *"App.state.restore() is the one non-op writer in the file."* **Loading a build code
through it would clear the undo stack and make SHARE criterion 4's sibling — "after confirming,
Ctrl+Z still brings the build back" — impossible for paste as well as for reset.**

**The pattern instead:** `resetToDefaults`, `:3222-3235`, which is the exact shape of "replace
`s.build` wholesale, in one commit, structurally":
```js
  // One commit, therefore one undo entry (D-12). The undo stack is never
  // cleared here: a mis-clicked reset has to be recoverable.
  //
  // Structural because it replaces s.build wholesale, which puts units.length
  // back to the shipped 9/3. This is the op the memory-based spelling of the
  // rule missed, and it is the one a student reaches most easily: type `abc`
  // into a health field, get the error panel, press its "Reset to Workshop 16
  // defaults" button. A sync-only frame left the extra cards on the page with
  // no units behind them — still clickable, reading zero, and raising a second
  // error panel on the next press. ...
  function resetToDefaults() {
    commitStructural('reset to defaults', function (s) {
      s.build = App.data.defaults();
      s.fight = null;
    });
  }
```
**A paste-to-load op is this function with a decoded record instead of `App.data.defaults()`.** Every
property carries over: one commit, one undo entry, `commitStructural` because `units.length` moves,
`s.fight = null` because the loaded build is a setup-mode board.

**`commitStructural` and why it is not optional here**, `:3070-3094`:
```js
  // That rule used to live as a trailing App.state.invalidate({structural:true})
  // that each op had to remember. Two ops remembered and three did not, and the
  // page silently kept showing eleven cards for a nine-unit roster. ...
  function commitStructural(label, mutator) {
    App.state.commit(label, mutator);
    App.state.invalidate({ structural: true });
  }
```

**Guards outside the commit, with the one documented exception.** `createAction` `:3638-3651` +
`:3656-3665`. A paste has **no** cap-from-detached-copy problem, so **every** guard stays outside:
decode first, validate the whole record, and only then enter the commit. A decode that fails must
never reach `commitStructural`, because a mutator that throws leaves no trace *but a decode that
half-succeeds does not throw at all.*

**Field by field, never a merge helper — and this is the phase where it earns its keep.**
`createAction`'s mutator, `:3695-3708`:
```js
      // Field by field, never a merge helper, for the reason createTokenType's
      // mutator already gives: a merge copies whatever keys the caller
      // supplied, which is how a reserved key slips past an allowlist that
      // only inspected the values. It holds INSIDE a term too — every cost,
      // requirement and transformation entry is built from named fields.
```
**A decoded build is caller-supplied data by definition.** `s.build = decoded` is a merge helper
wearing a different hat. The rebuild must be field by field, key by key, all the way down through
`tokens` (a **keyed bag**, so `RESERVED_KEYS` and `TOKEN_ID_PATTERN` apply — `:2660-2760`) and
through every `cost` / `req` / `xf` entry.

**The value boundary, which four functions already define:**

| Guard | Line | What it refuses |
|---|---|---|
| `int(value, min, max, what)` | `:2608-2616` | non-number, non-integer; clamps out-of-range |
| `requireSide(value)` | `:2626-2631` | any key not in `SIDES` — *"`s.build['__proto__']` resolves to `Object.prototype`, which is not frozen"* |
| `requireTokenId` / `requireNewTokenId` | `:2660-2760` | reserved keys **by name, before** the pattern test — order is load-bearing |
| `requireActionId` / `requireNewActionId` / `requireActionName` | `:2831-2932` | the action half of the same boundary |
| `requireDelta(delta, what)` | `:2933-2941` | a signed change that is not a whole number |

`int()`'s own comment names this phase, `:2597-2607`:
```js
  // Clamp, and reject rather than silently coerce. ... Everything a handler
  // supplies — and, from Phase 4, everything a pasted build code supplies —
  // comes through here.
```
And `dropTally`'s comment, `:3395`-region, says the same about `hasOwnProperty`:
```js
  // hasOwnProperty on every step. A bare `owner.tally` test would read an
  // inherited name as present, and from Phase 4 a bag can arrive from a pasted
  // build code rather than from this file.
```
**Six separate comments in the artifact are addressed to this work unit by name.** Grep
`grep -n "Phase 4" cats-vs-mechs.html` before writing the plan; each hit is a contract already
accepted on this phase's behalf.

---

### Work unit 7 — `[S05]`: the named ops

**Analog:** the action trio from 03.1, which is the newest and cleanest example of the whole
convention. `createAction` `:3651-3701`, `renameAction` `:3716-3743`, `removeAction` `:3765-3785`.

**(a) The dispatch arm, read key by key.** `:4192-4197`
```js
      // The action arms, read key by key for the same reason the create arm
      // above is: the op's own guards would refuse a stray key's VALUE, but
      // they would never see a key nobody meant to send.
      case 'createAction': return createAction(p.side, p.name);
      case 'renameAction': return renameAction(p.side, p.actionId, p.name);
      case 'removeAction': return removeAction(p.side, p.actionId);
```
`reset` already has its arm at `:4181`: `case 'reset': return resetToDefaults();`. **A paste op needs
one more, of the form `case 'loadBuildCode': return loadBuildCode(p.code);` — one key, named.**

**(b) The `fire()` payload-key exception, and why Phase 4 almost certainly does not need a second
one.** `[S07.1]:7413-7429`:
```js
  // The `tokenId` key is plan 02.1-03's one recorded exception to the section
  // banner above, which promises later plans attach through the seams rather
  // than edit [S07.1]. ... there is no seam through which a payload key can
  // be added.
  function fire(btn) {
    var d = btn.dataset;
    return App.ops.dispatch(d.act, {
      side: d.side, unitId: d.unit, delta: Number(d.step), tokenId: d.amt
    });
  }
```
03.1-05 recorded that it needed **no** second exception, and gave the reason (`[S07.3]` banner
`:8342-8351`): *"every press inside this dialog is read by the dialog's own delegated listener, which
calls `App.ops.dispatch` directly with a patch of known shape."* **A share dialog is the same
arrangement.** A `code` payload key read off a `<textarea>` is not a `fire()` key at all. If the plan
finds itself wanting one, it must name it as the file's **second** recorded exception, in writing.

**(c) `resetToDefaults` already exists and is already dispatchable and already exported** (`:4181`,
`:4235`). Phase 4 does **not** write a reset op. It writes a *surface* for the one that ships, plus
whatever hash-clearing the surface owes. That is a smaller change than the ROADMAP's plan-04-02 line
implies, and the plan should say so.

**(d) The label is the coalescing key.** `commit()` `:2394-2401`:
```js
    // Same label inside the window means one continuous edit — press-and-hold
    // is one undo step, not forty (D-10). The window slides on each repeat.
```
A paste is a single discrete act; its label must be unique per paste or two pastes 400 ms apart
collapse into one undo entry. `tallyLabel` (`:4152-4155`) is the precedent for *deliberately* sharing
a label; `'action new ' + side + '/' + made` (`:3656`) is the precedent for deliberately not.

**Export block to extend:** `:4222-4260`.

---

### Work unit 8 — the share `<dialog>`: shell markup and the id budget

**Analog:** `#tok-picker` `:993-1092` and `#act-edit` `:1094-1363`. Both are **static siblings of
`#err-panel`, outside `#app`.** The reason, `:993-996`:
```html
<!-- The token-appearance picker (ALLOC-09, D-11). Static markup and a sibling
     of #err-panel, outside #app, so nothing about it depends on a rebuild:
     [S06.2] fills the list and the three grids, and [S07.2] opens it and reads
     the presses.
     Its own delegated root is bound through [S07]'s LATE_BINDERS seam. -->
```

**The static-field rule, which a share dialog needs twice over** (the paste field and, if there is
one, a code-length field), `:1013-1015`:
```html
     #tok-pick-name is STATIC, and that is the whole reason it lives here and
     not in a builder. The dialog repaints on every frame while it is open, and
     a field rebuilt or overwritten mid-typing loses the half-typed text; a node
     that is never rebuilt can simply be skipped while it holds focus (D-19).
```
**The paste target must be static markup**, not built by the renderer. And the code output field must
be static for the same reason — SHARE criterion 1 requires it to be *selectable with the code already
highlighted*, which means it holds focus and a selection that a repaint would destroy.

**The topbar slot is already reserved, by name, for this phase.** `:897-900`:
```html
  <!-- D-04. The control cluster's slot is decided once, here: Phase 4 adds
       reset and share to it, Phase 5 adds turn state and start-fight, and
       neither of them has to re-lay-out the page to do it. -->
  <div class="brd-topbar" id="topbar">
```
But **the two existing buttons each cost a paragraph of justification**, and the second one's is the
template — `:927-945`:
```html
      <!-- THE SECOND PERMANENT BUTTON, AND IT IS PAID FOR HERE RATHER THAN
           NOTICED LATER. ... it is ONE button, it is
           PERMANENT, and it is BOUNDED ...
           IT MUST NOT BECOME ONE-PER-ANYTHING. ... -->
```
**Phase 4 adds a third and possibly a fourth.** SHARE criterion 4 says reset *"sits apart from the
non-destructive controls"*, which argues for a visual separation inside `.brd-cluster` (`:117`) rather
than for a second bar. Whatever is chosen, the comment beside it must be written in this register and
must state the bound, because the next reader will otherwise read the row Phase 2.1 collapsed as
having quietly come back.

**The id budget, measured.** The shell carries **101 ids** today (`shellIds.length`, printed by the
stub-drift gate). The picker cost 19; the action editor cost 21 for two panes. The `#act-edit` shell
comment records the arithmetic that decided one dialog over two, `:1105-1110`:
```html
       3. The id budget. The picker cost 19 of the file's 37 shell ids; two
          dialogs would land this file near sixty, and every one of them is a
          line in tests/selftest-node.cjs that has to be built by hand.
```
**Budget 12–18 for a share surface**, and read the same paragraph before deciding whether share and
reset-confirm are one dialog with two panes (the `data-ed-pane` technique, `:1140`) or two dialogs.
Every argument in that list transfers, and argument 2 transfers with extra force: *"the Node stub has
no close-request behaviour at all."*

**The three-part arrival rule, stated in both dialogs' comments** — `:1074-1077` and `:1137-1140`:
```html
     Adding an id here without teaching tests/selftest-node.cjs about it fails
     the run in both directions — and, since plan 03.1-01, so does adding a
     <dialog> without an entry in DIALOG_ROOTS. The id, the KNOWN_IDS entry, the
     stub node and the DIALOG_ROOTS entry arrived together.
```

**Naming conventions for the new ids, read off the two that ship:**

| Convention | Evidence |
|---|---|
| Dialog id is a short hyphenated noun phrase: `tok-picker`, `act-edit` | `:1016`, `:1140` |
| Every child id is the dialog id + a role: `tok-pick-list`, `act-edit-name` | throughout |
| A `<h3>` legend paired with the thing it labels gets `-label`: `act-edit-list-label` | `:1157` |
| A numeric field inside a named row gets `-amt`: `act-edit-cost-amt` | `KNOWN_IDS:498` |
| Repeated static rows are numbered from 0: `act-edit-req-0`, `act-edit-req-1` | `:499-501` |
| The topbar label span is `<thing>edit-label` with no hyphen: `tokedit-label`, `actedit-label` | `:922`, `:948` |
| A second pane takes a **different id stem** so its controls partition by attribute: `act-prop-*` vs `act-edit-*` | `:1319-1356`, and check 68d `:3931-3965` reads that partition back |
| `data-k` is a slash path naming the **id**, never the student's text: `pk/name`, `ae/side/cats`, `ap/amt/0` | `:1080`, `:1160`, `:1345` |
| `data-act` on a control routed by `[S07.1]`; a private attribute (`data-pk`, `data-ap`, `data-ed-*`) on a control the dialog's own listener reads | `:1090` vs `:1160`; `[S07.3]` banner `:9042-9047` |

**The `data-k` uniqueness rule is load-bearing and is stated twice** (`:911-919`, `:941-945`): the
structural rebuild restores focus by taking the **first** `[data-k="…"]` match, so a key rendered
inside a repeated region silently breaks focus restore.

---

### Work unit 9 — new `[S06.6]`: the share dialog's repaint

**Analog:** `[S06.5]` `:6130-7188`, which is itself `[S06.2]` `:5235-5664` copied end to end. Copy
the newer one; it has the three-attribute dataset and the settled fallback.

**(a) The sub-region banner, and the criterion for being one.** `:6130-6167`:
```
   * The action-authoring surface (ACT-01), appended as its own sub-region for
   * the mechanical reason [S06.2] and [S06.3] both state: it reconciles
   * through SYNC_HOOKS, SYNC_HOOKS is a closure variable of this IIFE, and it
   * paints a different page region on a different trigger. It changes NOTHING
   * in [S06.1], [S06.2], [S06.3] or [S06.4].
   *
   * IT REUSES [S06.1]'s HELPERS — el, text, setData, withPreservedFocus ...
```
`[S06.1]`'s helpers, for reference: `el` `:4320`, `text` `:4326`, `setData` `:4332`,
`withPreservedFocus` `:4353`.

**(b) The signature gate.** `editorSig` `:6991-7001`:
```js
  function editorSig(state, side, actionId, dlg) {
    return JSON.stringify([side, actionId, refActions(state, side).map(function (a) {
      return [a.id, a.name, a.dmg, a.keywords, a.cost, a.req, a.xf];
    }), Object.keys(state.build.tokens).map(function (id) {
      return [id, labelFor(state, id)];
    }), proposalSig(dlg), SIDE_IDS.map(function (each) {
      return [state.build[each].ap, state.build[each].units.map(function (u) {
        return [u.id, u.name, u.maxHp, u.shield, u.tally];
      })];
    })]);
  }
```
and the gate itself, `:7032-7033`:
```js
    var sig = editorSig(state, side, actionId, dlg);
    if (dlg.dataset.edSig === sig) { return; }
```
**Two rules the share dialog inherits, and one that is new.**
- `pickerSig`'s comment (`:5426-5432`): *"JSON.stringify of an ARRAY, never a joined string: a name
  is text a student types, so any delimiter is a character they can enter."*
- The 03.1-05 lesson, recorded in that plan's summary: *widen the fingerprint for the rows that
  already exist, before the code that draws them* — a fingerprint widened beside the drawing code
  means the surface was born stale in every release before that change.
- **New for Phase 4:** a share dialog's drawn content is *the encoding of the whole build slice*.
  The honest fingerprint is therefore the build code itself, or `JSON.stringify(state.build)`. Either
  is O(board) per frame. `actionsNaming` was measured at 0.75–2.0 µs per full scan and called free;
  a full `JSON.stringify` of the build slice is larger and the plan should **measure it** rather than
  assume, because this hook runs on every frame while the dialog is open.

**(c) The three dataset attributes, each answering exactly one question.** `[S06.5]`'s
`dlg.dataset.edSide` / `edPick` / `edSig`, plus `data-ed-pane` on the dialog node
(`:1140`, owned by `[S06.5]`, `:1113-1115`). `[S06.2]`'s statement of the rule, `:5560`-region:
```js
    // dataset.tok is WHICH type the editor is showing ... dataset.sig is
    // WHETHER anything drawn here has moved since the last frame, and nothing
    // ever reads a value out of it.
```

**(d) The per-frame hook, its registration and its self-healing fallback.** `syncEditor`
`:7164-7185`, `SYNC_HOOKS.push(syncEditor)` `:7187`. The paragraph above it, `:7144-7152`, is the one
to carry across verbatim in spirit:
```
  // A SELECTION NAMING NOTHING IS A REASON TO REPAINT ONTO SOMETHING LIVE,
  // NEVER A REASON TO STOP PAINTING.
```
For a share dialog the equivalent is: **a build code that no longer matches the board is a reason to
re-encode, never a reason to leave a stale code on screen for a student to copy.** That is the single
highest-consequence failure this surface can have.

**(e) The never-overwrite-a-focused-field rule (D-19).** `[S06.2]:5480`-region:
```js
      var nameField = document.getElementById('tok-pick-name');
      if (nameField && nameField !== document.activeElement) {
        nameField.value = labelFor(state, id);
        nameField.dataset.was = nameField.value;
      }
```
The paste field is exactly this case. **The generated-code field is the interesting variant:** it is
written by the artifact, not typed by the student, but it must hold a selection while focused. Decide
and state which rule wins.

**(f) Enable/disable is re-decided from state on every repaint, never toggled.** `setEditorEnabled`
`:7003-7006`, and `[S06.2]`'s statement of why, `:5540`-region:
```js
      // A bound the student can see coming is a disabled button, not an error
      // panel they have to read their way out of. Both are re-decided from
      // state on every repaint rather than toggled by whoever last pressed
      // something, so an undo moves them too.
```

**Register on `[S06]`'s return** beside `picker: picker` and `editor: editor`, `:7196-7207`.

---

### Work unit 10 — new `[S07.4]`: attachment

**Analog:** `[S07.3]` `:8336-9305`, whose banner is the statement of the whole contract, `:8336-8341`:
```
   * The action-authoring dialog's handling (ACT-01). It ATTACHES rather than
   * edits, in exactly the shape [S07.2] does: it pushes three entries into
   * UI_ACTS, assigns three entries in UI_HANDLERS, pushes one entry into
   * LATE_BINDERS, and changes NOT ONE LINE of [S07.1] or of [S07.2].
```

**The four seams, and their line numbers.** `[S07.1]`, `:7271-7304`:
```js
  var UI_ACTS = ['openTokenPicker', 'selectTokenType'];   // :7271  page work, never dispatched
  var UI_HANDLERS = {};                                    // :7283  act -> function (btn, e)
  var HOLD_ACTS = ['nudgeAp', 'nudgeMaxHp', 'nudgeShield', 'nudgeTally'];  // :7298
  var LATE_BINDERS = [];                                   // :7304  roots outside #app
```
**`UI_ACTS`'s own comment names this phase**, `:7262-7264`:
```js
  // This array is the landing place for EVERY future UI-only act: Phase 3's
  // reference cards, Phase 4's share dialog, Phase 5's fight controls. Nothing
  // UI-only may be added to [S05] to serve a dialog.
```
Live registrations to extend by **pushing, never editing**: `UI_ACTS.push(...)` `:9304`,
`LATE_BINDERS.push(bindPicker)` `:8333`, `LATE_BINDERS.push(bindEditor)` `:9035`,
`LATE_BINDERS.push(bindProposal)` `:9295`; `SYNC_HOOKS.push` at `:5658`-ish, `:6127`-ish, `:6129`-ish
and `:7187`.

**The page-work-versus-state-work fork, which decides where every act lives.** `:7256-7261`:
```js
  // [S05] OPS's banner states that layer never reads or writes the page, and
  // opening a dialog is nothing but page work, so a UI-only act has no legal
  // home there. Forwarding one would also land on dispatch's
  // `default: throw new Error('Unknown op: ' + act)` arm, which App.boot.wrap
  // turns into the styled error panel — so a student's very first click on a
  // button plan 02-01 already shipped would show an error.
```
Applied to Phase 4:
- `openShare`, `closeShare`, `switchSharePane`, `showCopyFallback` → **UI-only**, `UI_ACTS`.
- `loadBuildCode`, `reset` → **state work**, real ops, `App.ops.dispatch`, deliberately **not** in
  `UI_ACTS`. Check 68d (`:3931-3965`) reads that partition off the page and reddens if a state op is
  quietly moved into `UI_ACTS` to make a refusal go away.
- **The clipboard write is neither.** It is a side effect on the platform, not on state and not on
  the page. It has no home in either list and § No Analog Found says so.

**The opener handler.** `UI_HANDLERS.openActionEditor` `:8467-8483`, and the rule beside it:
```js
  // An already-open dialog keeps what it is showing; a cold open starts on the
  // first side and that side's first action. The button carries no side and no
  // action, and it must never grow one: a hidden data-side here would be the
  // topbar growing a control per faction ...
```

**One delegated listener per root, dispatch-first-then-page-work.** `onPickerPress` `:8222-8290`:
```js
  // One delegated listener on the dialog, never one per swatch: the grids are
  // rebuilt on every restyle, so per-node listeners would have to be rebound on
  // every click and the first missed rebind is a dead swatch nobody notices.
```
```js
    // State work, and every one of the three below follows the ordering the
    // restyle beneath them already ships: dispatch FIRST, page work only after
    // dispatch has returned. An op that refuses throws out of here into [S08]'s
    // listener boundary and the page work never runs
```
**This ordering is the one Phase 4 must invert exactly once, and deliberately.** CLAUDE.md's verified
finding: *"`writeText` must be called synchronously in the gesture. Encode the build code before the
`await`, never after."* So the share dialog's copy press is: **encode first (page work), then the
clipboard call, then the toast** — and the toast must branch on which tier actually succeeded, not be
optimistic. The plan must record this as a stated divergence from `onPickerPress`'s ordering, with the
reason, because a later reader will otherwise read it as the ordering rule being forgotten.

**The keyboard double-fire guard.** `:8228`-region (`e.repeat` on a button) and the `detail !== 0`
click guard, `[S07.3]`'s copy of which is at `:8970`-ish:
```js
  function onPickerClick(e) {
    if (e.detail !== 0) { return; }
    onPickerPress(e);
  }
```
`isPrimaryPress(e)` at `:7623` is the shared front gate.

**The binder, and every listener through `App.boot.wrap`.** `bindEditor` `:8999-9033`:
```js
  // EVERY LISTENER GOES THROUGH App.boot.wrap. A handler bound raw would throw
  // past the boundary and leave the surface dead with nothing on screen to say
  // so — the failure the boundary exists for — and there is a numbered check in
  // tests/selftest-node.cjs that reads the registrations on this root back and
  // reddens if any one of them is not wrapped.
  function bindEditor() {
    var dlg = editorDialog();
    if (dlg === null) { return; }
    dlg.addEventListener('pointerdown', App.boot.wrap('editor press', onEditorPress));
    dlg.addEventListener('click', App.boot.wrap('editor key-press', onEditorClick));
    dlg.addEventListener('close', App.boot.wrap('editor close', onEditorClose));
    dlg.addEventListener('focusin', App.boot.wrap('editor field focus', onEditorFocusIn));
    dlg.addEventListener('focusout', App.boot.wrap('editor field blur', onEditorFocusOut));
    dlg.addEventListener('input', App.boot.wrap('editor typing', onEditorInput));
    dlg.addEventListener('keydown', App.boot.wrap('editor keydown', onEditorKeyDown));
    dlg.addEventListener('cancel', App.boot.wrap('editor close request', function (e) { … }));
  }
  LATE_BINDERS.push(bindEditor);
```
Eight listeners; check 68c floors the count at 8 (`:3920-3930`).

**The `cancel` arm is the only place a close request can be declined**, `:9017-9026`, and it carries
its own "NOT EXERCISED by the Node gate" note. That note now applies a **third** time, and
limitations entry 12 (`:5867-5874`) already generalised it.

**Focus hand-back on close.** `closeEditor` / `onEditorClose` `:8526-8540`:
```js
  // <dialog> restores the opener itself, but only for the element that held
  // focus when the modal opened, which a student who reached the button with a
  // pointer never did.
```

**Export block to extend:** `:9306-9345`, especially `UI_HANDLED` (`:9327-9330`), read off the live
registration at the moment the section closes.

---

### Work unit 11 — `[C13]`: the styles

**Analog:** `[C12]` `:643-~886`, which is itself `[C07]` `:351-476` restated. `[C12]`'s banner is the
instruction, `:644-666`:
```css
  /* The action-authoring dialog (ACT-01, plan 03.1-05). Every class here
     carries the .ae- prefix, which is the same fake scoping [C07] explains for
     .pk- and [C10] repeats for .prj-: a single stylesheet has no real scope, so
     a Phase 5 rule for .row or .item would otherwise restyle this surface from
     three thousand lines away.

     [C07] IS THE LAYOUT ANALOG AND THIS BORROWS ITS SHAPE RATHER THAN ITS
     CLASSES. ... They are re-stated rather
     than shared because .pk- means "the token-appearance picker" everywhere
     else in this file, and a second surface wearing those classes would make
     every .pk- rule in [C07] a rule two dialogs depend on. */
```
So: **a third prefix, restated rather than shared.** The box, backdrop, title, note, group and legend
rules are near-identical across `[C07]:366-380` and `[C12]:667-681`:
```css
  .ae{
    background:var(--panel);color:var(--ink);
    border:1px solid var(--line);border-radius:var(--radius);
    padding:22px 24px;max-width:660px;width:calc(100vw - 48px);
    font:inherit;
  }
  .ae::backdrop{background:color-mix(in srgb, var(--bg) 76%, transparent)}
  .ae-legend{display:block;margin:0 0 8px;font-size:18px;font-weight:400;color:var(--ink-dim)}
```
**The 18px legend floor is UX-02 and is stated in both regions** (`:376-377`, `:679-680`): *"a
permanent visible label at the 18px minimum, never an icon and never a `title=` tooltip."*

**The code field is a `<textarea>`-shaped surface, and `[C08]` already has one.** `.err-detail`,
`:483-485`:
```css
  .err-detail{background:var(--panel);border:1px solid var(--line);border-radius:9px;color:var(--ink-dim);
    width:100%;min-height:96px;padding:8px 10px;
    font-family:ui-monospace,Consolas,monospace;font-size:12.5px;resize:vertical;user-select:text}
```
`user-select:text` and the monospace stack are exactly what a selectable build code wants, and
`#err-detail` exists *"so it can be pasted into the course thread"* (`[S08]`, `:9400-9402`) — the same
job, one phase early.

**The destructive-control colour already exists**, `[C08]:490`:
```css
  .err-btn--danger{border-color:var(--accent-2);color:var(--accent-2)}
```
That is the shipped answer to *"reset sits apart from the non-destructive controls"* and the shipped
Reset button already wears it (`:989`). **Do not invent a new hex.** `[C07]`'s banner says why,
`:363-365`: colours are derived with `color-mix()` from the existing tokens.

**Two hard prohibitions from the gate, both already stated in `[C12]`:**
- `url(` is forbidden document-wide (`FORBIDDEN`, `:40`) — so **no** `background-image`, no data-URI
  icon, no CSS-loaded font.
- No inline SVG and no `createElementNS`: `[C12]:663-666` — *"the namespaced element constructor
  takes a URI of the shape the dev gate refuses document-wide."* A shape is a `clip-path`, as `[C05]`
  already does.

---

### Work unit 12 — the reset confirmation

See § No Analog Found. In summary: **there is no confirmation dialog anywhere in this repo, and the
absence is a decision recorded three times.** The nearest partials:

**(a) The one existing destructive control, and its no-confirmation posture.** `#err-reset`, `:989`:
```html
    <button type="button" class="err-btn err-btn--danger" id="err-reset">Reset to Workshop 16 defaults</button>
```
wired at `:9384-9394`, and the op's own comment at `:3222-3224`:
```js
  // One commit, therefore one undo entry (D-12). The undo stack is never
  // cleared here: a mis-clicked reset has to be recoverable.
```
**Recovery-by-undo is the shipped answer to the problem a confirmation solves.**

**(b) The two places the file argues against a modal, in the same words.** `removeTokenType`
(02.1's D-17) and `removeAction` `:3765-3775`:
```js
  // There is no confirmation dialog here, on purpose, for the reason plan 02.1
  // gives for the same choice: everything the mutator does happens in ONE
  // commit, so one Ctrl+Z brings the action back whole, and a modal would cost
  // an instructor a click mid-demo to guard against something undo covers.
```

**(c) The one time the file reconciled that policy with a competing requirement, and the shape it
chose.** The `#tok-pick-names` line, `:1054-1072` — a **permanent line** that reports what a removal
will break, rather than a modal:
```html
  <!-- ACT-07 and D-12: what a removal will break, said BEFORE it happens.
       ... A LINE and not a dialog, which is D-12 and phase
       2.1's D-17 reconciled rather than one overruling the other: D-17 chose no
       confirmation because a modal costs an instructor a click mid-demo to
       guard against something undo already covers, and that is still true — a
       line costs no click, adds no surface and leaves removal one undoable
       commit, while saying the thing D-17 had nothing to say.

       IT REPORTS AND IT DISABLES NOTHING. -->
```
**This is the strongest available partial analog and the plan should engage with it explicitly.**
SHARE criterion 4 says *"asks for confirmation first"*, which is an explicit requirement and outranks
a plan-level design decision — but the plan must record that it is overruling D-17 for this one case,
and give the reason (reset replaces the whole board, not one record; and the ROADMAP names it), rather
than letting the next reader find two contradictory policies with nothing between them.

**(d) The `[S05]` banner is the deciding constraint on where a confirmation may live.** `:2580-2586`:
*"this layer is the only writer of state reachable from a student action ... It never reads or writes
the page."* So a confirmation is `[S07.4]` page work in front of an unchanged `App.ops.resetToDefaults`,
never a flag inside the op.

---

### Work unit 13 — the gates

#### 13a. New in-file suite `[S09.11]`

**Analog:** `[S09.10]` action authoring, `:13291-14551`. Copy four things.

**The suite's own opening bracket and the DOM-free declaration.** `:13291-13300`:
```js
  App.selftest.suite('action authoring', function (t) {
    // Every row below is DOM-free on purpose, the same choice [S09.7] made for
    // the token half: an id gate, a name gate and three write paths are state
    // work and proving them needs no page at all, so the terminal harness gets
    // the whole suite rather than a skip row.

    // The rows below reach the live board's write path, so the whole state is
    // recorded here and handed back as this suite's last act, exactly as
    // [S09.3], [S09.6] and [S09.7] do.
    var savedAll = JSON.stringify(App.state.get());
```
**A codec suite is DOM-free by nature. Write the whole thing that way** and the terminal run gets all
of it — see 13b for why that matters more than it looks.

**Assert against the exported function and the named constant, never a re-typed copy.**
`:13332-13340`:
```js
    /* --- the guards exist and are exported. Every row in this suite asserts
           against the EXPORTED function and the NAMED constant, never against
           a re-typed copy of either — a copy drifts away from what the op
           actually runs, and then the suite is green about the copy. --- */
    t.eq('the action id gate is exported', typeof App.ops.requireActionId, 'function');
```

**The bad-input table**, `[S09.7]`'s form:
```js
    ['sparkle', 'T1', 't1 ', 't1\n', 't100', '', 5, null, {}].forEach(function (bad) {
```
A codec's table wants: `''`, `'v0~…'`, `'v2~…'`, a truncated code, a code with one character flipped,
a code with a trailing newline (the shape a Discord paste actually takes), a code with surrounding
whitespace, `null`, `5`, `{}`, and a code carrying `__proto__` in every position the schema has.

**The prototype-intact check after every path**, `:13320-13327`:
```js
    function protoIntact() {
      return Object.getPrototypeOf({}) === Object.prototype
        && Object.prototype.polluted === undefined
        && Object.prototype.name === undefined
        && !Object.prototype.hasOwnProperty.call(Object.prototype, 'dmg');
    }
```
*"The prototype is checked after every path below rather than at the end. Both corruption shapes
evaporate or hide, so a single check at the bottom would read clean over a run that had already gone
wrong."* **A decoder is the single highest-value place in this file for these rows.**

**The trap this suite must not fall into, from the 03.1 precedent (RESEARCH Pitfall 2).** Adding a
field to a record and running **520/0** because the board-defaults suite projects records through a
tuple that never named the new field. **Every wave that adds a field to `build` must add the row that
would go red without it** — and for Phase 4 the equivalent is stronger: *every field added to `build`
must be added to the codec **and** to a round-trip row, or a shared build silently loses it.* The
round-trip assertion should be written as `stable(decode(encode(b))) === stable(b)` over a **driven**
board (authored types, authored actions, restyled tokens, edited tallies), not over `DEFAULTS`.

**Also assert the size budget.** SHARE-04 is a numeric criterion and nothing in the file measures it.
`t.info` is the right instrument for the shipped-board number (`:9705-9712`: *"A measurement, not a
gate"*), and `t.ok` against `MAX_*`-derived arithmetic is the right instrument for the worst case.

**Register the suite in `[S09]`'s banner index**, `:9630-9640`, which is *"the only index of them"*.

#### 13b. THE SPLIT — the single most important testing fact in this file

**`[S09.*]` rows behind `typeof document === 'undefined'` DO NOT RUN IN CI.**

The mechanism, precisely:

1. `tests/selftest-node.cjs:339-347` loads the script into a sandbox that has **no `document` and no
   `location`**:
   ```js
   // Deliberately no `document` and no `location`: [S10] LAUNCH stays inert and
   // App.hasFlag takes its undefined-location path.
   const sandbox = { console, setTimeout, clearTimeout, queueMicrotask, requestAnimationFrame };
   ```
2. `:356` runs `sandbox.App.selftest.run()`. Every suite executes, but **every row behind the
   no-DOM bracket is skipped**.
3. The bracket, spelled identically in five places — `:9748`, `:10514`, `:10580`, `:11599`, `:12538`
   and `:13030`. The fullest statement of it, `[S09.9]:13023-13033`:
   ```js
       /* --- The rendered half, plan 03-05's. Everything below needs a page.
              tests/selftest-node.cjs runs these suites in a bare sandbox with no
              document at all, so the suite says so and stops rather than painting
              a terminal run red for something that is not a defect — the bracket
              [S09.4] and [S09.8] both use. The gate in that file mirrors the
              highest-value rows below against its own stub page, which is what
              keeps this behaviour reachable from CI at all. --- */
       if (typeof document === 'undefined') {
         t.info('reference material', 'skipped — no DOM');
         return;
       }
   ```
4. **The numbers.** DOM-free total: **789 passed**, floored at `SUITE_FLOOR = 760` (`:397`). Full
   total with a DOM: **~764+ and growing**, measured only by a hand-built one-off runner that
   **is not in the repo**. Plan 03.1-05's summary records this as an outstanding debt: *"the Node
   harness still does not run the in-file suite against a DOM, and this is now the FIFTH plan in a
   row to rebuild the same one-off runner in a scratchpad."*
5. **The consequence, stated as a rule for the Phase 4 author:** an assertion written below a no-DOM
   bracket is documentation until somebody opens the file with `#selftest`. **Anything that must fail
   the build belongs in `tests/selftest-node.cjs`'s interaction gate, not in `[S09.*]`.**
6. **The corollary that makes this phase lucky:** a codec is state work. Write `[S09.11]` entirely
   above any bracket and CI runs all of it. Only the *share dialog* half needs the interaction gate.

**The second half of the same lesson, from Phase 3's WR-01:** a check written against source spelling
cannot see behaviour expressed through a helper. `[S09.9]:13010-13022` records it:
```
           A ROW COMPARING TWO SPELLINGS WAS NOT THE REPLACEMENT EITHER. ...
           So the replacement is a DOM WALK — drive a real
           create, read the new card off the page; drive a real rename, read
           the changed text off the page ...
```
**Applied here: assert the hash mirror by driving a real op and reading `location.hash` back**, never
by grepping `[S04]` for the assignment.

**And `SUITE_FLOOR` must move.** `:381-397`:
```js
// THE TOTAL IS ASSERTED, NOT ONLY THE FAILURE COUNT ... because `failed === 0` is
// green over a suite that never ran.
//   plan 03.1-03 opened the action-authoring suite at 412 rows in this run;
//   plan 03.1-06 took it to 786;
//   plan 03.1-07 takes it to 789 and floors it at 760 — a margin of 29 ...
const SUITE_FLOOR = 760;
```
Same history habit: re-measure, move the floor, add a line to the history.

#### 13c. `tests/selftest-node.cjs` — the interaction gate

**The stub-drift gate, bidirectional, `:1160-1192`.** It is the tax on every new id:
```js
const shellIds = Array.from(new Set(
  (html.match(/\bid="[A-Za-z0-9_-]+"/g) || []).map((m) => m.slice(4, -1))
));
const missingFromStub = shellIds.filter((id) => dom.KNOWN_IDS.indexOf(id) === -1);
const missingFromShell = dom.KNOWN_IDS.filter((id) => shellIds.indexOf(id) === -1);
```
Both directions call `fail()`, which is `process.exit(1)` — **an abort, not a red check.**

**`KNOWN_IDS`, grouped by owning plan with a comment per group**, `:453-521`. The newest group is the
template, `:493-501`:
```js
    // plan 03.1-05 — the action editor (ACT-01). One dialog with two panes ...
    // Every entry here obeys the rule the whole list obeys: the id, this entry
    // and the stub node arrive together, and — new since plan 03.1-01 — a
    // <dialog> also needs its DIALOG_ROOTS entry or the run fails at 47b.
    'actedit-label',
    'act-edit', 'act-edit-pane-author', 'act-edit-title',
```

**The stub `<dialog>` — exactly three members beyond a plain element**, `:902-911`:
```js
  const editor = idNode('act-edit', 'dialog');
  editor.open = false;
  editor.dataset.edPane = 'author';
  editor.showModal = () => { editor.open = true; };
  editor.close = () => {
    if (!editor.open) { return; }
    editor.open = false;
    dispatch(editor, event('close'));
  };
  body.appendChild(editor);
```
and the warning above it, `:886-899`:
```js
     EVERY DATASET SPELLING BELOW IS COPIED FROM THE SHELL. A typo here is not
     a red run: it is a green one, over a control nothing is listening to. The
     same goes for the classes — [S07.3] tells the name field apart by .ae-name
     exactly as [S07.2] tells .pk-name apart, so without it every keystroke,
     Enter, Escape and blur handler declines on its first line.
```
**The share dialog's paste field needs its own class, in the shell AND in the stub**, or every
handler declines on line one and the gate reads green over a field nothing is listening to.
`idNode(id, tag)` is at `:713-718`.

**`DIALOG_ROOTS` — a new dialog must be added here or the run fails at 47b.** `:4408-4413`:
```js
const DIALOG_ROOTS = [
  { id: 'tok-picker', act: 'openTokenPicker' },
  // plan 03.1-05's action editor. It is harvested from the moment it exists,
  // which is the whole point of the check below being bidirectional: this entry
  // could not have been forgotten, because leaving it out fails the run.
  { id: 'act-edit', act: 'openActionEditor' }
];
```
The bidirectional check is 47b, `:4430-4441`. `openDialogs()` at `:4438-4457` **drives the real
opener rather than calling `showModal()`**, deliberately: *"a dialog whose opener was unregistered
harvests an empty box and trips its own floor instead of passing on nothing."*

**`DIALOG_FLOOR` must move, and the rule for doing so is written down.** `:4586-4598`:
```js
// THE RULE FOR THE NEXT PLAN THAT ADDS A DIALOG: re-measure, and move this
// number so it stays one surface's worth below the new total. A floor that is
// not moved when a root is added is a floor that quietly stops bounding
// anything, which is the same silent shrink every other floor in this file
// carries a history note to prevent.
const DIALOG_FLOOR = 134;
```
`PICKER_FLOOR = 84` (`:4607`) exists because a one-root harvest compared against a total floor
*"passed by a single string"* — the precedent for giving a new surface **its own floor** rather than
folding it into the total. `PROPOSE_FLOOR` at `:5137` is the second instance.

**The gate-check helper**, `:1229-1240` — `check(label, condition, detail)`, numbered labels, detail
line naming the measured values. Phase 4's checks continue from **73c**; the next free number is
**74**.

**Two check shapes to copy verbatim.**

*The listener-boundary check, floored on the count* — `68c`, `:3899-3930`:
```js
const aeRaw = [];
Object.keys(aeDialog._listeners).forEach((type) => {
  aeDialog._listeners[type].forEach((fn) => {
    if (typeof fn !== 'function' || fn.name !== '' || fn.length !== 0) {
      aeRaw.push(type + ' -> ' + (fn.name || '(anonymous)') + '/' + fn.length);
    }
  });
});
```
*"App.boot.wrap returns an ANONYMOUS zero-arity function ... so a raw binding is visible by name and
by arity. Floored on the count, because a root with no listeners at all passes a per-listener test
spotlessly."*

*The act partition, collected off the page* — `68d`, `:3931-3965`: walk the dialog for every
`data-act`, split against `UI_ACTS` / `UI_HANDLED` / `App.ops`, and assert both halves.

*The static-row count read from the REAL markup, not the stub* — `65`, `:3370-3400`:
```js
const shellReqRows = (html.match(/id="act-edit-req-\d+"/g) || []).length;
```
*"not out of the stub, which is hand-written from the same source and would be asserting itself."*
**Any `MAX_*` cap Phase 4 turns into static markup needs this row.**

**Limitations entries 12 and 13 acquire a third instance.** `:5867-5879`. Add the new dialog to
entry 12 (close-request behaviour undrivable), and note under entry 13 that **the clipboard is a
fourth kind of unreachable**: it is not merely unrendered, it does not exist in Node at all. The
plan should extend the list rather than leave the reader to discover it — that is what the list is
for.

#### 13d. The three-layer no-verdict gate, and what a Phase 4 author must not write

| Layer | Reads | Words | Location | Effect on failure |
|---|---|---|---|---|
| **A** | the **whole document** — markup, CSS, comments, code | `VERDICT_WORDS`, 16 | `tests/selftest-node.cjs:167-207` | `process.exit(1)` before anything else runs |
| **B** | **every quoted string literal in the script block** (`'`, `"` and backtick, escape-aware) | `VERDICT_LITERAL_WORDS`, 23 | `:265-335` | `process.exit(1)` |
| **C** | **the rendered page** — `textContent` of every leaf under `#app`, plus every dialog in `DIALOG_ROOTS`, plus `aria-label` / `title` / `placeholder` | `VERDICT_WORDS.concat(VERDICT_LITERAL_WORDS)`, 39 | `:4311-4700` | a red `check` |

**Each layer is separately floored so it cannot pass by scanning nothing:**
- Layer B: `if (literals.length < 2000) fail(...)`, `:272-278`.
- Layer C `#app`: `renderedText.length > 117`, check 47, `:4532-4537`.
- Layer C dialogs: `dialogText.length > DIALOG_FLOOR`, check 47c, `:4613-4621`.

**The exemption channels, and why a share dialog needs one.** `harvestInto`, `:4372-4391`:
```js
function harvestInto(root, into, where) {
  (function harvest(node) {
    if (!node) { return; }
    if (node.children.length === 0
      && typeof node.textContent === 'string' && node.textContent !== ''
      && !('lbl' in node.dataset)
      && !('anm' in node.dataset)) {
      into.push({ s: node.textContent, where: where });
    }
    LABEL_ATTRS.forEach((attr) => {
      if (attr === 'aria-label' && ('albl' in node.dataset)) { return; }
      …
```
Three channels exist: `data-lbl` (a token type's name, text only), `data-albl` (the same name in an
`aria-label`), `data-anm` (an action's name, text only). **A share surface that echoes a decoded
build's names — a "this code carries: Vigor, Barrier, Pounce" summary — is text a student typed and
needs `data-anm` / `data-lbl`, or a classmate who named a token `Winner` reddens CI on a legitimate
paste.** That is exactly the failure `:4330-4337` describes and the reason the channels exist.

**And the trap in the other direction:** the gate's own detail lines are `check()` **labels**, which
Layer A reads because the harness is not scanned — but any *artifact* string is. **Test labels inside
`cats-vs-mechs.html` (`[S09.11]`'s `t.eq(...)` first argument) are string literals and Layer B reads
them.** Plan 03.1-05 recorded rewording a comment from *"the weaker half"* to *"the narrower half"*
for exactly this reason.

**Two measured gaps, reported and deliberately not exploited**, `:4479-4484`:
```js
// TWO GAPS IN THE WORD LIST, MEASURED THIS SESSION AND REPORTED RATHER THAN
// WIDENED. /\blead\b/i does not match "leads" ... and
// /dominat/i does not match "dominant" ... Neither is widened here — a widening belongs with
// the plan that measures its false positives — and neither is exploited: the
// copy this phase ships is arithmetic, not evaluative.
```
Phase 4 inherits that standing: **the share surface reports what a code is and what it costs, and
never what a build is like.** The one number this phase puts on screen — the character count — is
arithmetic, and phrasing it as *"fits comfortably"* rather than *"280 characters"* is where an
evaluative word would first appear.

**The selector engine is narrower than it looks.** `matches()` `:1199-1226` supports a tag name,
classes and `[data-*]` tests **only** — no `#id`, no descendant combinator, no `[hidden]`. And the
stub's `textContent` is a plain own property, **non-recursive** (`:4321-4325`). Every probe selector
must be a class or a `[data-*]`, and any probe reasoning over a subtree's text must walk it.

---

## Shared Patterns

### The four extension seams — the whole reason this phase needs no edit to `[S07.1]`
**Source:** `cats-vs-mechs.html:7252-7304`; `[S07.2]` at `:8333`, `[S07.3]` at `:9035` / `:9295` /
`:9304` as the worked users.
**Apply to:** work units 9, 10, 12.
Push and assign; edit no line of `[S07.1]`. The one documented exception in the file's history is
`fire()`'s payload key list (`:7413-7429`), and 03.1 explicitly declined to add a second.

### Guards outside the commit
**Source:** `:3638-3641`, `:3656-3665` (the one exception, and why it is safe).
**Apply to:** work units 6 and 7.
A refusal must leave **no phantom undo step**. The single documented exception is a guard that needs
the count off the detached copy, and it is safe only because `commit()` runs the mutator before it
records anything (`:2382-2390`).

### One mutator is one snapshot is one Ctrl+Z
**Source:** `:3781-3784`, `:3222-3224`.
**Apply to:** the paste op and the reset path. A build loaded from a code must be **one** undo entry,
and Ctrl+Z must put the student's own board back. That is SHARE criterion 4's sibling and it is free
if the op is written this way and expensive if it is not.

### Nothing derived is stored
**Source:** `[S02]` banner `:1941-1943`; `[S06.3]` banner; CLAUDE.md's *"Storing derived eHP/DPS in
state"* prohibition.
**Apply to:** **the build code itself.** It is a derived value. It must be computed at render time
and at copy time, never held in `state.ui` or anywhere else — a stored code is a second, mechanical
reason for the code on screen and the board to disagree, and `[S09.3]` pins the `ui` key set anyway
(`:10183` and three siblings).

### `[S05]` never touches the page; the page never gets a string from `[S02]` or `[S04]`
**Source:** `[S05]` banner `:2580-2586`; `[S02]` banner `:1939-1947`; the `openTokenPicker`-absence
note at `:4214-4220`.
**Apply to:** the decode failure message. `[S04]` returns a reason; `[S06.6]` writes the sentence.

### Lookup is an `Array.find` over a record's own `id`, never a bare index
**Source:** `findAction` `:3630-3636`; `effectRecord`; `REFERENCE`'s array rationale `:1836-1841`.
**Apply to:** every read the decoder makes out of a positional list. *"An array has no key position
at all"* — which is precisely why the record shapes the codec encodes are arrays.

### Every listener goes through `App.boot.wrap`
**Source:** `:8999-9005`, and check 68c reads it back structurally.
**Apply to:** every listener in `[S07.4]`.

### Describe, never quote
**Source:** `refCard`'s prohibition block; `[C12]:663-666`; the whole of § Rule 0.3.
**Apply to:** every comment in this phase. Several live gates scan the source for the very words and
attributes a comment might helpfully spell out — `url(`, `https://`, `counter`, `generating` — so a
comment promising not to use something is the thing that fails the scan.

### Floors carry their history
**Source:** `:4500-4530` (`#app`), `:4539-4598` (`DIALOG_FLOOR`), `:381-397` (`SUITE_FLOOR`),
`:5137` (`PROPOSE_FLOOR`).
**Apply to:** every number this phase moves. Re-measure, move it, and add a line to the history
paragraph so the next plan inherits data rather than a bare constant.

---

## No Analog Found

| Technique | Role | Data flow | Why there is no analog |
|---|---|---|---|
| **The clipboard write and its tiered fallback** | service | side-effect | `grep -c "clipboard\|writeText\|execCommand\|navigator\."` over `cats-vs-mechs.html` reads **0**. Nothing in the artifact has ever called a platform API with a permission model, an async result, or a failure the page must branch on. The two mentions of the word (`:1602`, `:10941`) are about a *text editor's* clipboard mangling a literal. CLAUDE.md carries the verified capability data and the four-tier design; the artifact carries nothing. It is also **unreachable from the Node gate entirely** — not merely unrendered, absent from the runtime — so its correctness is a rehearsal item, and the plan must say which tier each rehearsal step exercises. |
| **A confirmation dialog** | controller | staged form | Nothing in this repo asks a student to confirm anything. Every destructive control commits on the press: `removeTokenType` and `removeAction` both **decline** a confirmation in writing (`:3765-3775`), `#err-reset` fires `resetToDefaults()` on one click (`:9391`), and the one time the policy met a competing requirement the answer was a **permanent line**, not a modal (`:1054-1072`). SHARE criterion 4 requires one anyway, so this is a policy the plan must knowingly overrule and record — the file's own precedent for that is `clampTokenName` `:2769-2775`, which opens *"the one technique in this phase with no precedent anywhere else in the file"* and then explains itself at length. |
| **A `location.hash` write that is a mirror rather than a bail-out** | service | event-driven | The only hash write in the file (`:9388`) clears the hash and reloads, from a state where memory is untrustworthy. Nothing debounces, nothing round-trips, and `[S00]`'s banner still asserts that `hasFlag` is *"the only place hash text is read anywhere in this file"* — a sentence this phase makes false and must therefore amend. The Node stub's `location` is `{ hash: '' }` with no `history` and no `reload`, so the mirror is drivable and the reload path is not. |

Two further items with facts but no pattern, escalated rather than answered:
- **Whether share and reset-confirm are one dialog with two panes or two dialogs.** The
  `#act-edit` shell comment (`:1099-1112`) gives the three costs that decided it last time, all three
  of which transfer. It is a scope decision, and the id-budget arithmetic (§ work unit 8) is the part
  that is arithmetic rather than judgement.
- **Whether the codec's measured size confirms `[S01]`'s 480-of-512 prediction** (`:1694-1714`). That
  arithmetic was written on this phase's behalf and has never been checked against a real encoder. If
  it lands over budget the escalation path is already named — `CompressionStream('deflate-raw')` +
  base64url, with the `v<N>~` prefix outside the compressed blob — and moving a `MAX_*` dial is the
  cheaper alternative that the same comment says must be moved *"against measured cost instead of a
  feeling."*

---

## Metadata

**Analog search scope:** `cats-vs-mechs.html` (14,564 lines) — the static shell `:889-1363`, `[C07]`,
`[C08]`, `[C12]`, `[S00]`, `[S01]`, `[S02]`, `[S03]`, `[S04]`, `[S05]`, `[S06.1]`, `[S06.2]`,
`[S06.5]`, `[S07.1]`, `[S07.2]`, `[S07.3]`, `[S08]`, `[S09.0]`, `[S09.9]`, `[S09.10]`, `[S10]`.
`tests/selftest-node.cjs` (5,891 lines) — the header and `FORBIDDEN`, Layers A / B / C, sections 2c,
3, 5, 5b, `makeStubDom`, `DIALOG_ROOTS`, the floors, checks 65 / 68c / 68d, and the limitations list.
**Files scanned:** 2 source files, 4 planning documents.
**Reads:** targeted, non-overlapping offset/limit ranges located by grep first; no range read twice.
**Measurements taken this session:** the 39 gate words run against 54 candidate Phase-4 vocabulary
items (§ Rule 0.3); shell id count (101); the four `App.serialize.scheduleUrlSync` call-site facts.
**Pattern extraction date:** 2026-08-28
