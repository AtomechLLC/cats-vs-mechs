/*
 * tests/selftest-dom.cjs — DEV ONLY.
 *
 * This file is never shipped and is never referenced from cats-vs-mechs.html.
 * Node built-ins only (fs, path, vm) — there is nothing to install.
 *
 * WHAT IT IS FOR
 *
 * tests/selftest-node.cjs loads the artifact into a sandbox with no `document`
 * on purpose, so [S10] LAUNCH stays inert and section 3's number means one
 * thing. The cost of that choice is that every suite bracketed
 * `if (typeof document === 'undefined')` takes the skip branch there. Five
 * suites do — render, interactions, the board rows of token authoring,
 * projection, and reference material — and each prints one `skipped — no DOM`
 * row in place of everything it would have asserted.
 *
 * Those rows were reachable from a terminal only by hand. At least five plans
 * (03.1-01 through 03.1-05, and others since) each rebuilt the same throwaway
 * script in a scratchpad: read tests/selftest-node.cjs as text, cut
 * makeStubDom() out of it with a regex, eval the slice, evaluate the artifact
 * against the result, run the suites. Then threw it away, and the next plan
 * wrote it again. This file is that script, kept — and tests/stub-dom.cjs is
 * what turns the source-extraction step into an ordinary `require`.
 *
 * WHAT IT DOES
 *
 *   1. Builds the same stub page selftest-node.cjs's interaction gate uses,
 *      through the shared module. Same page, one definition, no drift.
 *   2. Evaluates the artifact's single classic <script> against it. `document`
 *      exists here, so [S10] LAUNCH fires App.boot.start() — booting IS the
 *      point; the artifact's own suites are then run on a booted board.
 *   3. Runs App.selftest.run() and prints one line per assertion, then the
 *      pass/fail counts.
 *   4. Fails if any of the five suites still says `skipped — no DOM`. A runner
 *      whose whole purpose is the DOM rows must not report green over a run in
 *      which they skipped — that is the vacuous pass this file exists to end.
 *   5. Floors the total, for the same reason selftest-node.cjs does: `failed
 *      === 0` is green over a suite that never registered.
 *
 * WHAT IT IS NOT
 *
 * It is not a browser. The stub is hand-written plain objects with no layout,
 * no styles resolved and no real event loop, so a row that needs a measured
 * box or a computed colour belongs in tests/browser-checks.mjs, not here.
 * It is not a replacement for selftest-node.cjs either: that file owns the
 * forbidden-pattern scans, the comparative-language layers, the timing gate
 * and the interaction gate. Run both.
 *
 * Reports, the day it landed: 1460 passed, 0 failed. selftest-node.cjs reports
 * 1336 in the same suites without a page; the 124 rows between the two numbers
 * are what this file exists for.
 *
 * Usage:  node tests/selftest-dom.cjs
 * Exit:   0 when every assertion passes and no suite skipped.
 */
'use strict';

const vm = require('vm');
const { makeStubDom, scriptBody, fail } = require('./stub-dom.cjs');

const body = scriptBody();
const dom = makeStubDom();

// [S08] observes the topbar so a wrapped control cluster republishes the
// sticky offset. There is no layout here, so the observer collects callbacks
// and nothing ever fires them — this runner makes no claim about resize.
function StubResizeObserver() {
  this.observe = () => {};
  this.unobserve = () => {};
  this.disconnect = () => {};
}

// The artifact's own suites construct events rather than being handed them —
// [S09.5] and [S09.6] do `node.dispatchEvent(new MouseEvent('click', ...))`,
// which selftest-node.cjs's gate never needed because it calls the stub's own
// event() directly. Without these two names both suites throw on their first
// press, and a suite that throws costs one red row AND skips its own state
// restore, so the board stays dirty and every later suite reads a board this
// runner damaged. The constructors return the stub's plain event object: a
// constructor that returns an object hands that object back from `new`.
//
// PointerEvent is deliberately NOT defined. The artifact branches on
// `typeof PointerEvent === 'function'` and falls back to MouseEvent — that
// fallback arm is real code with no other coverage anywhere, and pointerdown
// dispatched as a MouseEvent reaches the same delegated listener by type.
function MouseEvent(type, init) { return dom.event(type, init || {}); }
function Event(type, init) { return dom.event(type, init || {}); }

// Nearly the shape selftest-node.cjs's section 5 uses, with ONE deliberate
// difference: there is no `location` and no `history` here.
//
// That is not an omission, it is the division of labour, and [S09.11] states
// it in its own words — "this suite runs in a sandbox with no location and no
// history at all" — then asserts it: two of its rows require that scheduling a
// mirror write does nothing, that flushing reports nothing to flush, and that
// codeInHash() hands back null. Supply a location here and those two rows go
// red, in a runner whose subject is the DOM and not the URL. What the mirror
// actually WRITES is driven and read back where it belongs: selftest-node.cjs's
// interaction gate, which does supply both and boots a second stub page from a
// prepared hash. Adding a hash here would duplicate that and cost two rows.
//
// The practical consequence: [S00]'s hasFlag takes its undefined-location path,
// so no flag is ever set and the artifact never paints its own report panel
// into the stub page — which would be a second, nested run of these suites.
const sandbox = {
  console: console,
  ResizeObserver: StubResizeObserver,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  queueMicrotask: queueMicrotask,
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  document: dom.document,
  window: dom.window,
  MouseEvent: MouseEvent,
  Event: Event,
  CSS: dom.CSS
};

vm.runInNewContext(body, sandbox, { filename: 'cats-vs-mechs.html (stub DOM)' });

const App = sandbox.App;
if (!App || !App.selftest) {
  fail('Script loaded into the stub page but App.selftest is missing');
}

// boot.start() asked for the first structural frame through
// requestAnimationFrame. Run it now so the suites open on a page that matches
// state rather than on an empty shell.
App.state.flush();

const result = App.selftest.run();

const describe = (value) => {
  if (typeof value === 'string') { return value; }
  try { return JSON.stringify(value); } catch (e) { return String(value); }
};

result.records.forEach((r) => {
  const head = (r.pass ? 'PASS' : 'FAIL') + '  ' + r.suite + ' :: ' + r.name;
  if (r.pass) {
    console.log(head);
  } else {
    console.error(head);
    console.error('      actual:   ' + describe(r.actual));
    console.error('      expected: ' + describe(r.expected));
  }
});

console.log(result.passed + ' passed, ' + result.failed + ' failed (stub DOM)');

// --- the skip gate ------------------------------------------------------------
// The bracketed suites report their skip as an INFORMATIONAL row, which scores
// as a pass. So a page this runner failed to build convincingly enough would
// come out green with the exact coverage this file exists to add missing from
// it. Read the skip marker off the records and refuse.
const skipped = result.records.filter((r) => String(describe(r.actual)).indexOf('skipped — no DOM') !== -1);
if (skipped.length > 0) {
  console.error('SUITES SKIPPED (' + skipped.length + '):');
  skipped.forEach((r) => console.error('  ' + r.suite + ' :: ' + r.name));
  fail('A suite took its no-DOM branch inside the DOM runner. The stub page did '
    + 'not reach it — this run proves nothing about the rows it was written for.');
}
console.log('skip gate: no suite took its no-DOM branch');

// --- the floor ----------------------------------------------------------------
// Same reasoning as selftest-node.cjs's SUITE_FLOOR: nothing failing is green
// over a suite that threw before registering, or one that stopped registering
// at all. This number is the DOM total and is necessarily above the bare-sandbox
// one, because the five bracketed suites contribute their real rows here
// instead of one skip row each: 1460 against selftest-node.cjs's 1336, measured
// the day this file landed. The floor is set below that with room for a
// legitimate deletion, on the same margin selftest-node.cjs's 1186 keeps.
const SUITE_FLOOR = 1400;
if (result.passed < SUITE_FLOOR) {
  fail('SUITE TOTAL COLLAPSED: ' + result.passed + ' rows passed against a floor of '
    + SUITE_FLOOR + '. Nothing failed, which means rows went MISSING rather than red '
    + '— a suite that threw, or one that stopped registering.');
}

process.exit(result.failed ? 1 : 0);
