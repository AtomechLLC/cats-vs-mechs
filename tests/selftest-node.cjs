/*
 * tests/selftest-node.cjs — DEV ONLY.
 *
 * This file is never shipped and is never referenced from cats-vs-mechs.html.
 * The artifact must stay a single self-contained file that opens by
 * double-click, so optional dev tooling lives here in a sibling tests/ folder.
 * It uses Node built-ins only (fs, path, vm) — there is nothing to install.
 *
 * It does three things:
 *   1. Scans the HTML for forbidden patterns. This is a mechanical gate
 *      against the known sinks — "no outbound requests, no external
 *      dependencies, no markup-injection sink" — including inside comments.
 *   2. Loads the single script body into a bare vm sandbox with no document
 *      and no location, then runs App.selftest.run() and prints one line per
 *      assertion. The in-file #selftest report stays the primary surface;
 *      this exists so the same assertions are checkable from a terminal.
 *   3. Holds the wall-clock budget the in-file harness deliberately does not.
 *      A timing gate belongs where the environment is controlled, not on a
 *      workshop projector.
 *
 * Usage:  node tests/selftest-node.cjs
 * Exit:   0 when every assertion passes and nothing forbidden is present.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML_PATH = path.join(__dirname, '..', 'cats-vs-mechs.html');

const FORBIDDEN = [
  { label: 'absolute URL', re: /https?:\/\// },
  { label: 'external stylesheet', re: /<link/ },
  { label: 'external source attribute', re: / src=|setAttribute\(\s*['"]src['"]/ },
  { label: 'ES module script', re: /type="module"/ },
  { label: 'fetch call', re: /fetch\(/ },
  { label: 'XMLHttpRequest', re: /XMLHttpRequest/ },
  { label: 'CSS @import', re: /@import/ },
  { label: 'CSS url() reference', re: /url\(/ },
  { label: 'markup injection sink', re: /innerHTML|outerHTML|insertAdjacentHTML|document\s*\.\s*write|createContextualFragment/ },
  { label: 'HTML parser', re: /DOMParser|srcdoc/ },
  { label: 'javascript: URL', re: /javascript:/ },
  { label: 'embedded frame', re: /<iframe/i },
  { label: 'eval', re: /\beval\s*\(/ },
  { label: 'Function constructor', re: /\bnew\s+Function\b|\bFunction\s*\(/ }
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(HTML_PATH)) {
  fail('MISSING: ' + HTML_PATH);
}

const html = fs.readFileSync(HTML_PATH, 'utf8');

// --- 1. forbidden-pattern scan ------------------------------------------------
// Scanned across the whole document rather than line by line. A line-scoped
// test is evaded by a newline in the middle of the pattern, and
// `el\n  .innerHTML = x` is ordinary formatting, not somebody being clever --
// which is exactly why the old scan would have waved it through. Line numbers
// are recovered from the match offset, so a hit still points somewhere.
//
// Stated plainly, because a gate is trusted rather than re-read: this catches
// the known sinks written literally. It does NOT catch computed access such as
// el['inner' + 'HTML'] or el[prop]. That is the shape a deliberate bypass
// takes; the literal spelling is the shape an accidental reintroduction takes,
// and this file is guarding against the second one.
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

if (hits.length > 0) {
  console.error('FORBIDDEN PATTERNS in cats-vs-mechs.html (' + hits.length + '):');
  hits.forEach((h) => console.error(h));
  process.exit(1);
}
console.log('scan: no forbidden patterns');

// --- 2. load the single script body into a bare sandbox -----------------------
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) {
  fail('Could not find a classic script block in cats-vs-mechs.html');
}

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

if (!sandbox.App || !sandbox.App.selftest) {
  fail('Script loaded but App.selftest is missing');
}

// --- 3. run the in-file suites ------------------------------------------------
const result = sandbox.App.selftest.run();

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

console.log(result.passed + ' passed, ' + result.failed + ' failed');

// --- 4. the timing gate, dev-side only ----------------------------------------
// The in-file harness reports this number through t.info and never fails on it:
// a wall-clock budget on a workshop projector goes red because the tab was
// throttled, which teaches a room full of students nothing. Here the
// environment is controlled and nobody is watching, so here it is allowed to
// be a gate. This runs after the suites, so it is free to leave state dirty.
const PERF_BUDGET_MS = 50;
const perfStarted = Date.now();
for (let i = 0; i < 100; i++) {
  sandbox.App.state.commit('perf ' + i, (s) => { s.build.cats.ap = 4; });
}
const perfElapsed = Date.now() - perfStarted;
console.log('perf: 100 commits in ' + perfElapsed + ' ms (budget ' + PERF_BUDGET_MS + ' ms)');

if (perfElapsed >= PERF_BUDGET_MS) {
  fail('PERF: 100 commits took ' + perfElapsed + ' ms, over the ' + PERF_BUDGET_MS + ' ms budget');
}

// --- 5. interaction gate (stub DOM) -------------------------------------------
// ALLOC-07 says twenty rapid clicks produce exactly twenty changes. That is the
// only measurable criterion this phase has, and it fails in two opposite ways:
// binding pointerdown AND click to the same stepper doubles every press, and
// driving from click alone silently drops presses when a rebuild lands between
// the down and the up. Both are invisible to a casual test. This section drives
// the real delegated listeners through a hand-written page and counts.
//
// It builds a SECOND context rather than adding a document to the one above.
// Supplying a document makes [S10] LAUNCH fire App.boot.start(), which would
// change what section 3's number means. Here boot firing is the point: it is
// the wiring path this gate exists to exercise end to end. Section 5 reports
// its own counts and never touches section 3's.
//
// The stub is inline and uses Node built-ins only, which is the property this
// harness's header advertises and which must survive this file growing.

function makeStubDom() {
  const doc = { _listeners: Object.create(null), activeElement: null };

  // Every id the artifact asks for. getElementById returns null for anything
  // else, and that USED TO BE the one honest weakness of this approach: every
  // consumer in the artifact guards on null, so a missing id degraded to a
  // silent skip rather than a loud failure. That is not a hypothetical — plan
  // 02-03 added the picker's ids, this list was not grown, and the entire
  // picker path went untested while its own gate checks reported green.
  //
  // So the list is no longer maintained by good intentions. Section 5b below
  // scans cats-vs-mechs.html for every id="..." in the shell and fails the run
  // if the two disagree in either direction. Adding an id here without building
  // the matching node below is now just as loud as forgetting it entirely.
  const KNOWN_IDS = [
    'app', 'board', 'board-empty', 'topbar', 'tokedit-label', 'col-cats',
    'strip', 'col-mechs',
    'err-panel', 'err-title', 'err-message', 'err-detail', 'err-dismiss',
    'err-reset', 'selftest-report', 'selftest-summary', 'selftest-rows',
    // [S06.2] / [S07.2] — the token-appearance picker.
    'tok-picker', 'tok-pick-title', 'tok-pick-preview', 'tok-pick-preview-label',
    'tok-pick-shapes', 'tok-pick-shapes-label',
    'tok-pick-colors', 'tok-pick-colors-label',
    'tok-pick-glyphs', 'tok-pick-glyphs-label',
    'tok-pick-done'
  ];

  const byId = Object.create(null);

  function classesOf(node) {
    return String(node.className || '').split(/\s+/).filter((c) => c !== '');
  }

  function unescapeValue(v) {
    return String(v).replace(/\\(.)/g, '$1');
  }

  function datasetKey(attr) {
    return attr.slice(5).replace(/-([a-z])/g, (m, c) => c.toUpperCase());
  }

  // Supports exactly what the artifact asks for: a tag name, one or more
  // classes, and one or more [data-*] tests with or without a value.
  const SEL_PART = /\.([A-Za-z0-9_-]+)|\[([A-Za-z-]+)(?:="((?:[^"\\]|\\.)*)")?\]|([A-Za-z][A-Za-z0-9]*)/g;

  function matches(node, selector) {
    SEL_PART.lastIndex = 0;
    let m;
    let saw = false;
    let ok = true;
    while ((m = SEL_PART.exec(selector)) !== null) {
      saw = true;
      if (m[1] !== undefined) {
        ok = ok && classesOf(node).indexOf(m[1]) !== -1;
      } else if (m[2] !== undefined) {
        if (m[2].indexOf('data-') !== 0) { ok = false; }
        else {
          const key = datasetKey(m[2]);
          if (m[3] === undefined) { ok = ok && node.dataset[key] !== undefined; }
          else { ok = ok && String(node.dataset[key]) === unescapeValue(m[3]); }
        }
      } else if (m[4] !== undefined) {
        ok = ok && node.tagName === m[4].toUpperCase();
      }
    }
    return saw && ok;
  }

  function queryAll(root, selector) {
    const found = [];
    (function walk(n) {
      n.children.forEach((child) => {
        if (matches(child, selector)) { found.push(child); }
        walk(child);
      });
    })(root);
    return found;
  }

  function dispatch(target, evt) {
    evt.target = target;
    let n = target;
    while (n) {
      const list = n._listeners[evt.type];
      if (list) { list.slice().forEach((fn) => fn.call(n, evt)); }
      n = n.parentNode;
    }
    const onDoc = doc._listeners[evt.type];
    if (onDoc) { onDoc.slice().forEach((fn) => fn.call(doc, evt)); }
    return true;
  }

  function createElement(tagName) {
    const node = {
      tagName: String(tagName).toUpperCase(),
      className: '',
      dataset: Object.create(null),
      children: [],
      parentNode: null,
      textContent: '',
      value: '',
      hidden: false,
      disabled: false,
      type: '',
      scrollTop: 0,
      _attrs: Object.create(null),
      _listeners: Object.create(null)
    };

    node.classList = {
      add(c) {
        const list = classesOf(node);
        if (list.indexOf(c) === -1) { list.push(c); node.className = list.join(' '); }
      },
      remove(c) {
        node.className = classesOf(node).filter((x) => x !== c).join(' ');
      },
      contains(c) { return classesOf(node).indexOf(c) !== -1; }
    };

    node.setAttribute = (k, v) => { node._attrs[k] = String(v); };
    node.getAttribute = (k) => (k in node._attrs ? node._attrs[k] : null);

    node.appendChild = (child) => {
      if (child.parentNode) { child.parentNode.removeChild(child); }
      child.parentNode = node;
      node.children.push(child);
      return child;
    };
    node.removeChild = (child) => {
      const i = node.children.indexOf(child);
      if (i !== -1) { node.children.splice(i, 1); child.parentNode = null; }
      return child;
    };
    node.remove = () => { if (node.parentNode) { node.parentNode.removeChild(node); } };
    node.replaceChildren = (...kids) => {
      node.children.forEach((c) => { c.parentNode = null; });
      node.children.length = 0;
      kids.forEach((k) => node.appendChild(k));
    };

    node.addEventListener = (type, fn) => {
      if (!node._listeners[type]) { node._listeners[type] = []; }
      node._listeners[type].push(fn);
    };
    node.dispatchEvent = (evt) => dispatch(node, evt);

    node.focus = () => { doc.activeElement = node; };
    node.blur = () => { if (doc.activeElement === node) { doc.activeElement = doc.body; } };
    node.select = () => {};
    node.setSelectionRange = () => {};
    node.setPointerCapture = () => {};
    node.releasePointerCapture = () => {};

    node.closest = (selector) => {
      let n = node;
      while (n) {
        if (matches(n, selector)) { return n; }
        n = n.parentNode;
      }
      return null;
    };
    node.querySelector = (selector) => queryAll(node, selector)[0] || null;
    node.querySelectorAll = (selector) => queryAll(node, selector);

    Object.defineProperty(node, 'firstElementChild', {
      get: () => node.children[0] || null
    });
    Object.defineProperty(node, 'lastElementChild', {
      get: () => node.children[node.children.length - 1] || null
    });

    return node;
  }

  function idNode(id, tag) {
    const node = createElement(tag || 'div');
    node._attrs.id = id;
    byId[id] = node;
    return node;
  }

  const body = createElement('body');
  doc.body = body;
  doc.activeElement = body;

  const app = idNode('app', 'main');
  body.appendChild(app);

  const topbar = idNode('topbar');
  app.appendChild(topbar);

  const board = idNode('board');
  app.appendChild(board);
  ['col-cats', 'strip', 'col-mechs'].forEach((id) => board.appendChild(idNode(id, 'section')));
  board.appendChild(idNode('board-empty', 'p'));

  const report = idNode('selftest-report', 'section');
  app.appendChild(report);
  report.appendChild(idNode('selftest-summary'));
  report.appendChild(idNode('selftest-rows'));

  const panel = idNode('err-panel');
  panel.hidden = true;
  body.appendChild(panel);
  panel.appendChild(idNode('err-title'));
  panel.appendChild(idNode('err-message'));
  panel.appendChild(idNode('err-detail', 'textarea'));
  panel.appendChild(idNode('err-dismiss', 'button'));
  panel.appendChild(idNode('err-reset', 'button'));

  // A hand-made stand-in for the STATIC #topbar markup, which this stub cannot
  // produce because it has no HTML parser. These five controls ship in
  // cats-vs-mechs.html as literal markup and must be kept in step with it: the
  // Undo button, and one token-appearance button per board token type.
  function topbarButton(k, act, extra) {
    const b = createElement('button');
    b.dataset.k = k;
    b.dataset.act = act;
    Object.keys(extra || {}).forEach((key) => { b.dataset[key] = extra[key]; });
    topbar.appendChild(b);
    return b;
  }
  topbarButton('undo', 'undo', null);
  topbar.appendChild(idNode('tokedit-label', 'span'));
  ['hp', 'ap', 'shield', 'dmg'].forEach((tok) => {
    topbarButton('tok/' + tok, 'openTokenPicker', { tok: tok });
  });

  // The token-appearance <dialog>, likewise hand-made from the static markup.
  // Exactly three members beyond a plain element, because that is all [S06.2]
  // and [S07.2] touch: .open, showModal() and close(), the last dispatching the
  // `close` event the focus hand-back is bound to. pickerDialog() probes for a
  // close() FUNCTION before it will do anything, so a plain div here would keep
  // the whole picker path skipped — which is precisely the state this stub was
  // in before, with two gate checks reporting green over a handler that bailed
  // out on its second line.
  //
  // The three grids are built empty, exactly as they ship: their contents come
  // from App.data.SHAPES / COLORS / GLYPHS at render time.
  const picker = idNode('tok-picker', 'dialog');
  picker.open = false;
  picker.showModal = () => { picker.open = true; };
  picker.close = () => {
    if (!picker.open) { return; }
    picker.open = false;
    dispatch(picker, event('close'));
  };
  body.appendChild(picker);
  picker.appendChild(idNode('tok-pick-title', 'h2'));

  const previewLine = createElement('div');
  picker.appendChild(previewLine);
  previewLine.appendChild(idNode('tok-pick-preview-label', 'span'));
  previewLine.appendChild(idNode('tok-pick-preview'));

  ['shapes', 'colors', 'glyphs'].forEach((kind) => {
    const group = createElement('div');
    picker.appendChild(group);
    group.appendChild(idNode('tok-pick-' + kind + '-label', 'h3'));
    group.appendChild(idNode('tok-pick-' + kind));
  });

  const doneBtn = idNode('tok-pick-done', 'button');
  doneBtn.dataset.pk = 'done';
  picker.appendChild(doneBtn);

  doc.createElement = createElement;
  doc.getElementById = (id) => (KNOWN_IDS.indexOf(id) === -1 ? null : (byId[id] || null));
  doc.querySelector = (selector) => queryAll(body, selector)[0] || null;
  doc.querySelectorAll = (selector) => queryAll(body, selector);
  doc.addEventListener = (type, fn) => {
    if (!doc._listeners[type]) { doc._listeners[type] = []; }
    doc._listeners[type].push(fn);
  };

  const win = { scrollX: 0, scrollY: 0, _listeners: Object.create(null) };
  win.addEventListener = (type, fn) => {
    if (!win._listeners[type]) { win._listeners[type] = []; }
    win._listeners[type].push(fn);
  };
  win.scrollTo = () => {};

  function event(type, props) {
    const evt = { type: type, target: null, detail: 0, bubbles: true, defaultPrevented: false };
    Object.keys(props || {}).forEach((k) => { evt[k] = props[k]; });
    evt.preventDefault = () => { evt.defaultPrevented = true; };
    evt.stopPropagation = () => {};
    return evt;
  }

  return {
    document: doc,
    window: win,
    byId: byId,
    KNOWN_IDS: KNOWN_IDS,
    event: event,
    CSS: { escape: (s) => String(s).replace(/([^A-Za-z0-9_-])/g, '\\$1') }
  };
}

const dom = makeStubDom();

// --- 5b. the stub-drift gate ---------------------------------------------------
// KNOWN_IDS used to be a promise: "this list must grow when the static shell
// does." It did not grow, the six picker ids went missing, getElementById
// returned null for every one of them, and the artifact's own null guards then
// turned a completely unexercised feature into two PASSING checks. A soft gate
// that fails silently in the direction of green is worse than no gate.
//
// So the promise is now mechanical, and it runs in both directions:
//   shell id with no stub node  — the artifact path using it is being skipped
//   stub id with no shell node  — the stub is testing something that shipped out
const shellIds = Array.from(new Set(
  (html.match(/\bid="[A-Za-z0-9_-]+"/g) || []).map((m) => m.slice(4, -1))
));
const missingFromStub = shellIds.filter((id) => dom.KNOWN_IDS.indexOf(id) === -1);
const missingFromShell = dom.KNOWN_IDS.filter((id) => shellIds.indexOf(id) === -1);

if (missingFromStub.length > 0) {
  fail('STUB DRIFT: cats-vs-mechs.html carries id(s) the stub page does not know: '
    + missingFromStub.join(', ')
    + '\n       getElementById would return null for these, and every consumer in'
    + '\n       the artifact guards on null — so the code path using them would be'
    + '\n       silently skipped and its checks would pass vacuously. Add each id to'
    + '\n       KNOWN_IDS in makeStubDom() AND build the matching node.');
}
if (missingFromShell.length > 0) {
  fail('STUB DRIFT: the stub page builds id(s) the shell no longer carries: '
    + missingFromShell.join(', ')
    + '\n       Remove them from KNOWN_IDS, or the gate is testing markup that'
    + '\n       has already shipped out of the artifact.');
}
console.log('stub-drift gate: ' + shellIds.length + ' shell ids, all built by the stub page');

const domSandbox = {
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  queueMicrotask: queueMicrotask,
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  document: dom.document,
  window: dom.window,
  location: { hash: '' },
  CSS: dom.CSS
};

vm.runInNewContext(match[1], domSandbox, { filename: 'cats-vs-mechs.html (stub DOM)' });

const A = domSandbox.App;
if (!A || !A.interactions) {
  fail('Script loaded into the stub page but App.interactions is missing');
}

// boot.start() asked for the first structural frame through requestAnimationFrame.
// Run it now so every assertion below reads a page that matches state.
A.state.flush();

let gateChecks = 0;
const gateFailures = [];

function check(label, condition, detail) {
  gateChecks++;
  const line = 'interaction gate :: ' + label;
  if (condition) {
    console.log('PASS  ' + line);
  } else {
    gateFailures.push(label);
    console.error('FAIL  ' + line);
    console.error('      ' + (detail || 'condition was false'));
  }
}

const stub = dom.document;
const errTitle = dom.byId['err-title'];
const errMessage = dom.byId['err-message'];
const errPanel = dom.byId['err-panel'];

function press(node) {
  node.dispatchEvent(dom.event('pointerdown', { pointerId: 1 }));
}
function release(node) {
  node.dispatchEvent(dom.event('pointerup', { pointerId: 1 }));
}
function clickAt(node, detail) {
  node.dispatchEvent(dom.event('click', { detail: detail }));
}
function commits() {
  return A.state.stats().commits;
}
function clearPanel() {
  errTitle.textContent = '';
  errMessage.textContent = '';
  errPanel.hidden = true;
}

/* --- 9. the wiring path itself came up clean --- */
check(
  '9. boot wired the stubbed page without opening the error panel',
  errTitle.textContent === '' && errPanel.hidden === true,
  'title=' + JSON.stringify(errTitle.textContent) + ' hidden=' + errPanel.hidden
);

let plusHp = stub.querySelector('[data-act="nudgeMaxHp"][data-step="1"]');
check(
  '0. the rendered board carries the controls this gate drives',
  plusHp !== null,
  'no [data-act="nudgeMaxHp"][data-step="1"] in the stubbed page'
);

if (plusHp !== null) {
  /* --- 1 and 2. the criterion, and the undo entry it collapses into --- */
  A.ops.setFactionAp('cats', 3);   // a different label, so the burst starts clean
  const commitsBefore = commits();
  const depthBefore = A.state.undoDepth();
  for (let i = 0; i < 20; i++) {
    press(plusHp);
    release(plusHp);
  }
  const twenty = commits() - commitsBefore;
  check(
    '1. twenty pointerdown at the delegated root produce exactly twenty commits',
    twenty === 20,
    'commits delta was ' + twenty + ', expected exactly 20'
  );
  const depthDelta = A.state.undoDepth() - depthBefore;
  check(
    '2. and those same twenty coalesce to exactly one undo entry',
    depthDelta === 1,
    'undoDepth delta was ' + depthDelta + ', expected exactly 1'
  );

  /* --- 3. the assertion that would have caught the measured 2x double-fire --- */
  A.ops.setFactionAp('cats', 4);
  const beforeBoth = commits();
  press(plusHp);
  clickAt(plusHp, 1);
  release(plusHp);
  const both = commits() - beforeBoth;
  check(
    '3. one pointerdown plus one mouse click{detail:1} produce exactly one commit',
    both === 1,
    'commits delta was ' + both + ', expected exactly 1 — a delta of 2 is the '
      + 'double-fire: the click handler ran for a press pointerdown already served'
  );

  /* --- 4. and the keyboard path still works --- */
  const beforeKey = commits();
  clickAt(plusHp, 0);
  const keyOnly = commits() - beforeKey;
  check(
    '4. one click{detail:0} alone produces exactly one commit',
    keyOnly === 1,
    'commits delta was ' + keyOnly + ', expected exactly 1'
  );
}

/* --- 10. a UI-only act is claimed and ignored, on the pointer path --- */
const tokBtn = stub.querySelector('[data-act="openTokenPicker"][data-tok="hp"]');
const beforeTok = commits();
if (tokBtn !== null) {
  press(tokBtn);
  release(tokBtn);
}
const tokDelta = commits() - beforeTok;
check(
  '10. a token-appearance press commits nothing and opens no panel — the guard '
    + 'against openTokenPicker falling through to [S05] dispatch and raising the '
    + 'styled error on a student\'s first click',
  tokBtn !== null && tokDelta === 0 && errTitle.textContent === '' && errPanel.hidden === true,
  'commits delta=' + tokDelta + ' title=' + JSON.stringify(errTitle.textContent)
    + ' hidden=' + errPanel.hidden
);

/* --- 13. and on the keyboard path, which routeUi also guards --- */
const beforeTokKey = commits();
if (tokBtn !== null) { clickAt(tokBtn, 0); }
const tokKeyDelta = commits() - beforeTokKey;
check(
  '13. the same act is claimed on the keyboard path too',
  tokBtn !== null && tokKeyDelta === 0 && errTitle.textContent === '' && errPanel.hidden === true,
  'commits delta=' + tokKeyDelta + ' title=' + JSON.stringify(errTitle.textContent)
    + ' hidden=' + errPanel.hidden
);
clearPanel();

/* --- 11. the other half of 10: the seam is not a blanket swallow --- */
const rogue = stub.createElement('button');
rogue.dataset.act = 'notAnOp';
dom.byId['topbar'].appendChild(rogue);
press(rogue);
check(
  '11. an act no layer claims still throws and surfaces the styled panel',
  errTitle.textContent !== '' && errMessage.textContent.indexOf('Unknown op') !== -1
    && errPanel.hidden === false,
  'title=' + JSON.stringify(errTitle.textContent)
    + ' message=' + JSON.stringify(errMessage.textContent)
);
rogue.remove();
clearPanel();

/* --- 12. the ramp allowlist, asserted through holdSource() rather than by
       sleeping past HOLD_FIRST_MS in wall-clock time --- */
const addBtn = stub.querySelector('[data-act="addUnit"][data-side="cats"]');
let holdOnAdd = 'no add button';
let addDelta = -1;
let holdOnStepper = 'no stepper';
let holdAfterRelease = 'no stepper';
if (addBtn !== null) {
  const beforeAdd = commits();
  press(addBtn);
  holdOnAdd = A.interactions.holdSource();
  addDelta = commits() - beforeAdd;
  release(addBtn);
  A.state.flush();
}
plusHp = stub.querySelector('[data-act="nudgeMaxHp"][data-step="1"]');
if (plusHp !== null) {
  press(plusHp);
  holdOnStepper = A.interactions.holdSource();
  release(plusHp);
  holdAfterRelease = A.interactions.holdSource();
}
check(
  '12. a hold on a non-stepper act fires exactly once and starts no ramp, while '
    + 'a stepper does start one and releasing stops it',
  holdOnAdd === null && addDelta === 1 && holdOnStepper === 'pointer'
    && holdAfterRelease === null,
  'addUnit: holdSource=' + holdOnAdd + ' commits delta=' + addDelta
    + '; stepper: holdSource=' + holdOnStepper + ' after release=' + holdAfterRelease
);

/* --- 7. the structural frame the roster ops request --- */
A.ops.addUnit('cats');
A.state.flush();
const cardCount = dom.byId['col-cats'].querySelectorAll('.unit-card').length;
const rosterCount = A.state.get().build.cats.units.length;
check(
  '7. after addUnit the rendered card count equals the roster length',
  cardCount === rosterCount,
  'cards=' + cardCount + ' roster=' + rosterCount
);

/* --- 5. node identity is the animation contract --- */
A.ops.setUnitMaxHp('cats', 'c1', 10);
A.state.flush();
const hpRow = stub.querySelector('.tok-row[data-amt="hp"][data-unit="c1"]');
let grewByOne = false;
let growDetail = 'no health row for c1';
if (hpRow !== null) {
  const tenBefore = hpRow.children.slice();
  A.ops.nudgeUnitMaxHp('cats', 'c1', 1);
  A.state.flush();
  const after = hpRow.children;
  grewByOne = tenBefore.length === 10 && after.length === 11
    && tenBefore.every((n, i) => after[i] === n);
  growDetail = 'before=' + tenBefore.length + ' after=' + after.length
    + ' kept=' + tenBefore.filter((n, i) => after[i] === n).length;
}
check(
  '5. growing a token row from ten to eleven keeps all ten original nodes and '
    + 'appends exactly one',
  grewByOne,
  growDetail
);

/* --- 6. P-07: the focused control was the one that got removed --- */
const rmBtn = stub.querySelector('[data-act="removeUnit"][data-side="cats"][data-unit="c2"]');
if (rmBtn !== null) { rmBtn.focus(); }
A.ops.removeUnit('cats', 'c2');
A.state.flush();
check(
  '6. removing the unit whose remove button held focus lands focus on a real node',
  rmBtn !== null && stub.activeElement !== null && stub.activeElement !== stub.body,
  'activeElement is ' + (stub.activeElement === stub.body ? 'body' : String(stub.activeElement && stub.activeElement.dataset.k))
);

/* --- 14. the same structural contract as check 7, through resetToDefaults.
       Check 7 only ever proved that addUnit remembered its trailing
       invalidate(); resetToDefaults did not, and it is the op a student reaches
       most easily — the error panel's own "Reset to Workshop 16 defaults"
       button. This drives the op and reads the page back, so the whole class of
       shape-changing ops is covered rather than the one that happened to be
       right. --- */
A.ops.addUnit('cats');
A.ops.addUnit('cats');
A.state.flush();
A.ops.resetToDefaults();
A.state.flush();
const resetCards = dom.byId['col-cats'].querySelectorAll('.unit-card').length;
const resetRoster = A.state.get().build.cats.units.length;
check(
  '14. after resetToDefaults the rendered card count equals the roster length',
  resetCards === resetRoster && resetRoster === 9,
  'cards=' + resetCards + ' roster=' + resetRoster + ' (expected 9 and 9)'
);

/* --- 15. startFight/endFight flip buildColumn's `setup`, which decides whether
       the roster-shaping chrome is built at all, so they owe a structural frame
       for the same reason. No page control calls them yet; this is the
       assertion that keeps that true when Phase 5 wires them up. --- */
A.ops.startFight();
A.state.flush();
const addDuringFight = stub.querySelector('[data-act="addUnit"][data-side="cats"]');
A.ops.endFight();
A.state.flush();
const addAfterFight = stub.querySelector('[data-act="addUnit"][data-side="cats"]');
check(
  '15. starting a fight rebuilds the column without the setup-only roster '
    + 'chrome, and ending it puts the chrome back',
  addDuringFight === null && addAfterFight !== null,
  'add button during fight=' + (addDuringFight === null ? 'absent' : 'present')
    + ', after fight=' + (addAfterFight === null ? 'absent' : 'present')
);

/* --- 16. the displayed text of a FOCUSED field, which nothing in the repo
       asserted. setValue() skips document.activeElement by design (D-19) so a
       half-typed "+5" survives an unrelated frame — which means the frame an
       arrow press schedules is exactly the frame that will not show its result.
       State and the token row moved; the number the student was looking at did
       not, until blur. This drives the real keydown through the delegated root
       and reads the field back.
       focus() on this stub does not dispatch focusin, so dataset.was is seeded
       here the way onFocusIn would have. --- */
const hpField = stub.querySelector('.stp-field[data-act="maxHp"][data-unit="c1"]');
let fieldShows = '(no field)';
let fieldWas = '(no field)';
let hpAfterArrow = -1;
let hpBeforeArrow = -1;
if (hpField !== null) {
  hpField.focus();
  hpField.dataset.was = hpField.value;
  hpBeforeArrow = A.state.get().build.cats.units[0].maxHp;
  hpField.dispatchEvent(dom.event('keydown', { key: 'ArrowUp' }));
  hpField.dispatchEvent(dom.event('keyup', { key: 'ArrowUp' }));
  A.state.flush();
  fieldShows = hpField.value;
  fieldWas = hpField.dataset.was;
  hpAfterArrow = A.state.get().build.cats.units[0].maxHp;
  hpField.blur();
}
check(
  '16. an arrow-key step shows up in the focused field it was typed into, and '
    + 'moves the recorded baseline with it',
  hpField !== null && hpAfterArrow === hpBeforeArrow + 1
    && fieldShows === String(hpAfterArrow) && fieldWas === fieldShows,
  'field shows ' + JSON.stringify(fieldShows) + ', state went '
    + hpBeforeArrow + ' -> ' + hpAfterArrow
    + ', dataset.was=' + JSON.stringify(fieldWas)
);

/* --- 17-19. the picker, driven end to end. Checks 10 and 13 above proved only
       that an act claimed by UI_ACTS never reaches [S05] dispatch; with the
       dialog missing from the stub they proved it about a handler that returned
       on its second line, and would still have passed with onPickerPress
       deleted. Nothing anywhere asserted that the picker opens, that a swatch
       moves state, or that the board follows. These three do. --- */
const dlg = dom.byId['tok-picker'];
const openBtn = stub.querySelector('[data-act="openTokenPicker"][data-tok="hp"]');
if (dlg.open === true) { dlg.close(); }

let gridSizes = [];
if (openBtn !== null) {
  press(openBtn);
  release(openBtn);
  gridSizes = ['shapes', 'colors', 'glyphs'].map(
    (kind) => dom.byId['tok-pick-' + kind].children.length
  );
}
const wantSizes = [A.data.SHAPES.length, A.data.COLORS.length, A.data.GLYPHS.length];
check(
  '17. a token-appearance press opens the picker and fills all three grids from '
    + 'the vocabulary allowlists',
  openBtn !== null && dlg.open === true
    && String(gridSizes) === String(wantSizes)
    && dom.byId['tok-pick-preview'].children.length === 3,
  'open=' + dlg.open + ' grids=' + JSON.stringify(gridSizes)
    + ' expected=' + JSON.stringify(wantSizes)
    + ' preview=' + dom.byId['tok-pick-preview'].children.length
);

const shapeBefore = A.state.get().build.tokens.hp.shape;
const wantShape = A.data.SHAPES.filter((s) => s !== shapeBefore)[0];
const swatch = dlg.querySelector('[data-act="setTokenStyle"][data-shape="' + wantShape + '"]');
let shapeAfter = '(no swatch)';
let boardClass = '(no swatch)';
if (swatch !== null) {
  press(swatch);
  release(swatch);
  A.state.flush();
  shapeAfter = A.state.get().build.tokens.hp.shape;
  const row = stub.querySelector('.tok-row[data-amt="hp"][data-unit="c1"]');
  const tok = row ? row.firstElementChild : null;
  boardClass = tok ? tok.className : '(no token on the row)';
}
check(
  '18. a swatch press restyles the type in state and the board token follows',
  swatch !== null && shapeAfter === wantShape
    && boardClass.indexOf('tok--' + wantShape) !== -1,
  'shape ' + shapeBefore + ' -> ' + shapeAfter + ' (wanted ' + wantShape
    + '), board token className=' + JSON.stringify(boardClass)
);

press(dom.byId['tok-pick-done']);
release(dom.byId['tok-pick-done']);
check(
  '19. Done closes the picker and hands focus back to the button that opened it',
  dlg.open === false && stub.activeElement === openBtn,
  'open=' + dlg.open + ' activeElement='
    + String(stub.activeElement && stub.activeElement.dataset.k)
);

/* --- 8. P-05, asserted rather than trusted to a comment --- */
check(
  '8. the hold ramp stays inside the undo coalescing window',
  A.interactions.HOLD_FIRST_MS < A.state.COALESCE_MS,
  'HOLD_FIRST_MS=' + A.interactions.HOLD_FIRST_MS + ' COALESCE_MS=' + A.state.COALESCE_MS
);

console.log(
  'interaction gate: ' + (gateChecks - gateFailures.length) + ' of ' + gateChecks
    + ' checks passed'
);

if (gateFailures.length > 0) {
  fail('INTERACTION GATE: ' + gateFailures.length + ' check(s) failed — '
    + gateFailures.join('; '));
}

process.exit(result.failed ? 1 : 0);
