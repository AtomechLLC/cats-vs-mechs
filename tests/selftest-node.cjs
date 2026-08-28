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

// --- 1b. comparative-language scan, whole document (Layer A) ------------------
// PROJ-06: the artifact never judges a build. No verdict, no traffic light, no
// meter, no colour-coded rating, no comparison of one side against the other.
// Two greps have carried that promise since Phase 1 and nothing has ever run
// them; this is the first place it is mechanical rather than documentary.
//
// This is a sibling of FORBIDDEN rather than an entry in it, deliberately.
// FORBIDDEN means "an unsafe sink is present". A comparative word is not a
// sink, and folding the two together would make one failure message speak for
// two unrelated kinds of breakage -- the reader of a red run would be told a
// security pattern had appeared when what actually happened is that somebody
// wrote a sentence.
//
// Stated as plainly as the scan above states its own limits: this catches the
// literal spelling, in comments, in CSS and in rendered copy alike, which is
// the shape an accidental reintroduction takes. It does NOT catch a sentence
// assembled from fragments at run time, and it does NOT catch a synonym nobody
// thought of. Layer C, in the interaction gate, walks the rendered page for the
// first of those; the second is a review problem, not a grep problem.
//
// Every entry below was counted against the artifact and measured zero before
// it was added here. Words the artifact legitimately uses in its own prose
// about this very rule -- score, grade, judgement, worse -- are deliberately
// absent from this layer and live in VERDICT_LITERAL_WORDS instead. The file
// carries a comment reading "never a score, a grade or a judgement", which is
// the anti-verdict rule stated in three of the words a naive widening would
// ban. A gate that reddened on the file's own statement of the rule would be a
// gate asserting the opposite of the truth. Hence two layers, not one.
//
// `judgment` here is the US spelling on purpose: the UK spelling the artifact
// uses in that comment is handled by Layer B, where it is checked only against
// rendered strings.
// WHAT BELONGS IN THIS LAYER, and what does not.
//
// This layer reads the WHOLE document -- markup, CSS, comments and code alike
// -- so a word in it is banned from prose as well as from copy. That reach is
// the right instrument for a word that NAMES THE BANNED FEATURE: `verdict`,
// `rating`, the `balanc` and `difficult` stems, `counter`, a traffic light, a
// good or bad build. None of those has an innocent reading in this codebase,
// and a CSS class or a comment carrying one is evidence the feature itself is
// arriving, which is worth catching before any copy exists.
//
// It is the WRONG instrument for a comparative adjective. `better`, `weak`,
// `stronger`, `advantage`, `dominat`, `optimal` are ordinary engineering
// prose, and a gate that reddens on them tells its reader
//   "comparative language reached cats-vs-mechs.html ... The artifact reports
//    what a build costs and what it can take"
// -- a diagnosis about RENDERED COPY for something that is not rendered copy.
// This phase already paid that toll once: a comment reading "the weaker half
// of the same guarantee" was reworded to "the narrower half" for no reason but
// this list. The stem also bans `text-wrap: balance`, which the project's own
// stack notes list as a progressive enhancement to use.
//
// So those thirteen move to VERDICT_LITERAL_WORDS below. That is not a new
// idea -- it is the split this file already invented for `score`, `grade`,
// `judgement` and `worse`, for a reason stated a few lines up that applies to
// them word for word. Keeping `judgment` here while `judgement` sat there, and
// `better` here while `worse` sat there, was an inconsistency rather than a
// policy.
//
// WHAT THE MOVE GIVES UP, stated exactly, because narrowing a PROJ-06 layer is
// a real trade and not a tidy-up:
//   RETAINED for all thirteen -- every string literal in the script block,
//     via Layer B; and the whole rendered page, via Layer C, which scans
//     VERDICT_WORDS.concat(VERDICT_LITERAL_WORDS) and is therefore completely
//     unaffected by which of the two lists a word sits in.
//   GIVEN UP for those thirteen only -- the CSS block, and static markup
//     outside the script block that Layer C's walk does not reach, which is
//     #err-panel and the <dialog> (Layer C harvests #app). A verdict feature
//     wearing a `.better-build` class in CSS with no matching literal and no
//     rendered word would now pass. That is the hole, and it is accepted
//     because a feature of that shape would have to avoid all sixteen words
//     below as well, every one of which still reads the whole document.
const VERDICT_WORDS = [
  { label: 'verdict', re: /verdict/i },
  { label: 'balance stem', re: /balanc/i },
  { label: 'rating', re: /rating/i },
  { label: 'difficulty stem', re: /difficult/i },
  { label: 'counter', re: /counter/i },
  { label: 'outmatch', re: /outmatch/i },
  { label: 'outclass', re: /outclass/i },
  { label: 'winner', re: /winner/i },
  { label: 'loser', re: /loser/i },
  { label: 'traffic light', re: /traffic light/i },
  { label: 'overpowered', re: /overpowered/i },
  { label: 'underpowered', re: /underpowered/i },
  { label: 'unfair', re: /unfair/i },
  { label: 'good build', re: /good build/i },
  { label: 'bad build', re: /bad build/i },
  { label: 'should aim', re: /should aim/i }
];

const verdictHits = [];
VERDICT_WORDS.forEach((rule) => {
  const re = new RegExp(rule.re.source, rule.re.flags.replace('g', '') + 'g');
  let m;
  while ((m = re.exec(html)) !== null) {
    const line = html.slice(0, m.index).split('\n').length;
    verdictHits.push('  line ' + line + ' [' + rule.label + ']: ' + m[0]);
    if (m[0] === '') { re.lastIndex++; }
  }
});

if (verdictHits.length > 0) {
  console.error('PROJ-06 VIOLATION: comparative language reached cats-vs-mechs.html (' +
    verdictHits.length + '):');
  console.error('  The artifact reports what a build costs and what it can take.');
  console.error('  It never says which build is the better one. Reword or remove:');
  verdictHits.forEach((h) => console.error(h));
  process.exit(1);
}
console.log('scan: no comparative language in the document (Layer A, ' +
  VERDICT_WORDS.length + ' words)');

// --- 2. locate the single classic script block --------------------------------
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) {
  fail('Could not find a classic script block in cats-vs-mechs.html');
}

// --- 2b. comparative-language scan, string literals only (Layer B) ------------
// The second half of the PROJ-06 gate. These words the artifact does use, and
// should keep using, when its comments discuss the rule or reason about the
// arithmetic -- `worse` appears eleven times in prose, `score` and `grade` and
// `judgement` in the very comment that states the anti-verdict rule. What must
// never happen is one of them reaching a string the page can render.
//
// So this layer reads only the quoted string literals of the script block: a
// comment may discuss the concept, a rendered string may not carry the word.
//
// Same honesty clause as the two scans above. This catches the literal
// spelling inside a literal, which is the shape an accidental reintroduction
// takes. It does NOT catch a string built by concatenation, a word arriving
// through a template, or text assembled at render time -- that is Layer C's
// job. It also cannot see the CSS or the markup outside the script block,
// which Layer A already reads in full.
//
// The extraction is escape-aware so a literal containing \' does not truncate
// and leave the rest of the file misparsed as code. The count is printed on a
// clean run and floored below, because the failure mode of a broken extractor
// is not a red run -- it is a green one that scanned nothing, which is exactly
// the vacuous pass the stub-drift gate was added to close.
const STRING_LITERAL = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g;
const literals = match[1].match(STRING_LITERAL) || [];

if (literals.length < 1500) {
  fail('Layer B extracted only ' + literals.length + ' string literals from the ' +
    'script block. The artifact carries well over 1500, so this is a broken ' +
    'extractor scanning nothing, not a clean file.');
}

// Two groups, one rule: a comment may discuss the concept, a rendered string
// may not carry the word.
//
// The first ten are the original set -- words the artifact uses in its own
// prose about the anti-verdict rule, which a document-wide ban would redden on.
//
// The last thirteen arrived from VERDICT_WORDS, for the reasoning written out
// above that list: they are comparative adjectives with ordinary engineering
// readings, not names for the banned feature. Nothing about their coverage of
// RENDERED output changed in the move -- Layer C concatenates both lists -- and
// nothing about their coverage of string literals changed either, because this
// layer reads every literal in the script block. What changed is that a comment
// may now say "the weaker half of the guarantee" and mean it.
const VERDICT_LITERAL_WORDS = [
  { label: 'score', re: /score/i },
  { label: 'grade', re: /grade/i },
  { label: 'judgement', re: /judgement/i },
  { label: 'rank', re: /rank/i },
  { label: 'ahead', re: /ahead/i },
  { label: 'wins', re: /\bwins\b/i },
  { label: 'win', re: /\bwin\b/i },
  { label: 'edge', re: /\bedge\b/i },
  { label: 'lead', re: /\blead\b/i },
  { label: 'worse', re: /worse/i },
  { label: 'stronger', re: /stronger/i },
  { label: 'strongest', re: /strongest/i },
  { label: 'weak stem', re: /weak/i },
  { label: 'weakest', re: /weakest/i },
  { label: 'advantage', re: /advantage/i },
  { label: 'favoured', re: /favou?red/i },
  { label: 'fair', re: /\bfair\b/i },
  { label: 'superior', re: /superior/i },
  { label: 'inferior', re: /inferior/i },
  { label: 'dominate stem', re: /dominat/i },
  { label: 'optimal', re: /optimal/i },
  { label: 'better', re: /better/i },
  { label: 'judgment', re: /judgment/i }
];

const literalHits = [];
literals.forEach((lit) => {
  VERDICT_LITERAL_WORDS.forEach((rule) => {
    if (rule.re.test(lit)) {
      literalHits.push('  [' + rule.label + ']: ' + lit);
    }
  });
});

if (literalHits.length > 0) {
  console.error('PROJ-06 VIOLATION: a comparative word reached a rendered string, ' +
    'not a comment (' + literalHits.length + '):');
  console.error('  These words are allowed in prose about the rule and nowhere else.');
  literalHits.forEach((h) => console.error(h));
  process.exit(1);
}
console.log('scan: no comparative language in the ' + literals.length +
  ' string literals (Layer B, ' + VERDICT_LITERAL_WORDS.length + ' words)');

// --- 2c. load the single script body into a bare sandbox ----------------------

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
    'tok-pick-done',
    // plan 02.1-04 — the picker as list-plus-editor (D-05). The list of every
    // type, the name field, and the make-one / take-one-away row.
    'tok-pick-list', 'tok-pick-list-label',
    'tok-pick-name', 'tok-pick-name-label',
    'tok-pick-new-unit', 'tok-pick-new-side', 'tok-pick-remove',
    // plan 03-05 — the reference band, full width below both columns. The
    // node is built a dozen lines below in the same change: this list and the
    // stub page disagreeing in EITHER direction fails the run at section 5b.
    'refband'
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
      // Emptying a box clamps its scroll offset to zero, and that is modelled
      // rather than skipped because it is the whole of one defect: the artifact
      // rebuilds a scrolling list this way on every repaint, and a stub that
      // quietly kept the offset would report a fix that had not been made. This
      // is the only layout consequence in here and it needs no layout engine —
      // no content means nowhere to be scrolled to.
      node.scrollTop = 0;
      kids.forEach((k) => node.appendChild(k));
    };

    node.addEventListener = (type, fn) => {
      if (!node._listeners[type]) { node._listeners[type] = []; }
      node._listeners[type].push(fn);
    };
    node.dispatchEvent = (evt) => dispatch(node, evt);

    // Moving focus DISPATCHES, and that is the single most load-bearing line
    // in this stub. What was here assigned doc.activeElement and fired nothing,
    // so every path that moves focus programmatically — the dialog's focus
    // hand-back, the removed-row placement, withPreservedFocus's restore —
    // ran here with no focusin and no focusout behind it. Two defects of the
    // authoring surface lived in exactly that hole and the gate below reported
    // green over both of them, because the only way a focusout ever reached a
    // handler was a check dispatching one by hand, which no check did ACROSS a
    // change of selection. A programmatic focus() fires blur/focusout on the
    // previously focused element synchronously in every engine, so the stub
    // that stands in for one has to as well.
    //
    // Re-focusing the node that already holds focus dispatches nothing, which
    // is also what a browser does — and it is what keeps withPreservedFocus's
    // restore of an untouched field from looking like the student left it.
    node.focus = () => {
      const prev = doc.activeElement;
      if (prev === node) { return; }
      doc.activeElement = node;
      if (prev && typeof prev.dispatchEvent === 'function') {
        dispatch(prev, event('focusout', { relatedTarget: node }));
      }
      dispatch(node, event('focusin', { relatedTarget: prev || null }));
    };
    node.blur = () => {
      if (doc.activeElement !== node) { return; }
      doc.activeElement = doc.body;
      dispatch(node, event('focusout', { relatedTarget: doc.body }));
    };
    node.select = () => {};
    node.setSelectionRange = () => {};
    node.setPointerCapture = () => {};
    node.releasePointerCapture = () => {};

    // No layout engine here, so a node reports whatever height the gate gave
    // it. _rectHeight defaults to 0, which is the "no layout at all" case
    // [S08]'s measurement is required to decline rather than publish.
    node._rectHeight = 0;
    node.getBoundingClientRect = () => ({
      width: 0, height: node._rectHeight, top: 0, left: 0, right: 0, bottom: node._rectHeight
    });

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

  // <html>, for the one thing the artifact does with it: publishing the
  // measured chrome height as a custom property so #strip's sticky offset
  // stops guessing at --topbar-h.
  doc.documentElement = {
    _props: Object.create(null),
    style: {
      setProperty(name, value) { doc.documentElement._props[name] = String(value); },
      getPropertyValue(name) { return doc.documentElement._props[name] || ''; }
    }
  };

  const app = idNode('app', 'main');
  body.appendChild(app);

  const topbar = idNode('topbar');
  topbar._rectHeight = 88;   // one wrapped row taller than the shipped 64px floor
  app.appendChild(topbar);

  const board = idNode('board');
  app.appendChild(board);
  ['col-cats', 'strip', 'col-mechs'].forEach((id) => board.appendChild(idNode(id, 'section')));
  // plan 03-05's band, in the shell's own order: after both columns and before
  // #board-empty. The order matters to nothing the stub does today and matters
  // to any future assertion that reads #board's children, which is the cheaper
  // moment to get it right.
  board.appendChild(idNode('refband', 'section'));
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
  // produce because it has no HTML parser. These two controls ship in
  // cats-vs-mechs.html as literal markup and must be kept in step with it: the
  // Undo button, and the one token button beside it.
  //
  // There used to be a row of token buttons here, built from a hardcoded list
  // of the types the board ships with, and every selector below reached for the
  // one that named Health. D-05 collapsed that row to a single button carrying
  // no type at all, so the list is gone and the selectors are keyed on the act
  // alone. The alternative — keeping a type on the stub button so the old
  // selectors kept matching — would have made this page disagree with the
  // markup it stands in for, which is the exact drift the gate below exists to
  // make impossible.
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
  topbarButton('tok', 'openTokenPicker', null);

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

  // The list of every token type (D-05), empty exactly as it ships: its rows
  // are built from the LIVE vocabulary at render time, which is what makes a
  // type a student invented appear in it without a second tier.
  const listGroup = createElement('div');
  picker.appendChild(listGroup);
  listGroup.appendChild(idNode('tok-pick-list-label', 'h3'));
  listGroup.appendChild(idNode('tok-pick-list'));

  // The make-one / take-one-away row. The dataset spellings are copied from
  // the static markup and must be kept in step with it, exactly as the topbar
  // buttons above are: plan 02.1-05 registers the handlers these names route
  // to, and a typo here would make that plan's gate checks green over nothing.
  const newRow = createElement('div');
  picker.appendChild(newRow);
  [
    ['tok-pick-new-unit', 'createTokenType', { scope: 'unit', k: 'pk/new-unit' }],
    ['tok-pick-new-side', 'createTokenType', { scope: 'side', k: 'pk/new-side' }],
    ['tok-pick-remove', 'removeTokenType', { k: 'pk/remove' }]
  ].forEach(([id, act, extra]) => {
    const b = idNode(id, 'button');
    b.dataset.act = act;
    Object.keys(extra).forEach((key) => { b.dataset[key] = extra[key]; });
    newRow.appendChild(b);
  });

  // The name field is STATIC in the shell and static here, which is the whole
  // point of it: [S06.2] skips it while it holds focus rather than rebuilding
  // it, so a half-typed name survives the per-frame repaint (D-19).
  const nameGroup = createElement('div');
  picker.appendChild(nameGroup);
  nameGroup.appendChild(idNode('tok-pick-name-label', 'h3'));
  const nameField = idNode('tok-pick-name', 'input');
  nameField.type = 'text';
  // The class is NOT decoration here: [S07.2] tells the name field apart from
  // everything else in the dialog by it, exactly as [S07.1] tells a stepper
  // field apart by its own class. Without it every keystroke, Enter, Escape and
  // blur handler declines the event on its first line, and a gate check driving
  // them would read green over a field nothing is listening to.
  nameField.className = 'pk-name';
  nameField.dataset.k = 'pk/name';
  nameGroup.appendChild(nameField);

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

// [S08] observes the topbar so a wrapped control cluster republishes the sticky
// offset. There is no layout here, so the observer is a list of callbacks the
// gate can fire by hand after changing a reported height.
const resizeCallbacks = [];
function StubResizeObserver(fn) {
  this.observe = () => { resizeCallbacks.push(fn); };
  this.unobserve = () => {};
  this.disconnect = () => {};
}

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

/* --- 10. a UI-only act is claimed and ignored, on the pointer path. The
       selector names the act and nothing else: after D-05 the topbar carries
       one token button and it carries no type, so there is no longer a type to
       select it by. --- */
const tokBtn = stub.querySelector('[data-act="openTokenPicker"]');
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
const openBtn = stub.querySelector('[data-act="openTokenPicker"]');
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
// The opened-on-hp half is now ASSERTED rather than incidental. It used to
// follow from which of four buttons was pressed; with one button that names no
// type, the starting selection is a decision [S07.2] makes, and checks 18, 21
// and 23 below all restyle tokens.hp on the strength of it.
check(
  '17. a token-appearance press opens the picker on the default type and fills '
    + 'all three grids from the vocabulary allowlists',
  openBtn !== null && dlg.open === true && dlg.dataset.tok === 'hp'
    && String(gridSizes) === String(wantSizes)
    && dom.byId['tok-pick-preview'].children.length === 3,
  'open=' + dlg.open + ' tok=' + JSON.stringify(dlg.dataset.tok)
    + ' grids=' + JSON.stringify(gridSizes)
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

/* --- 23. a commit that did NOT come from the picker's own handlers. Ctrl+Z
       reaches App.ops.undo() from inside the open dialog, because [S08]'s
       listener only steps aside for INPUT / TEXTAREA / contentEditable and a
       swatch is a <button>. Nothing repainted the dialog on that commit, so it
       went on marking the undone value as live. --- */
A.ops.undo();
A.state.flush();
const shapeUndone = A.state.get().build.tokens.hp.shape;
const markedOn = dlg.querySelectorAll('[data-act="setTokenStyle"][data-shape]')
  .filter((n) => String(n.className).indexOf('pk-sw--on') !== -1)
  .map((n) => n.dataset.shape);
// D-07: a shipped test that asserts the OLD shape is updated by the plan that
// changes the shape, in the same commit. This check used to read
//   String(dlg.dataset.sig).indexOf('hp/' + shapeUndone + '/') === 0
// against the four-field id/shape/color/glyph signature. Plan 02.1-04 replaced
// that gate with a JSON fingerprint of the whole drawn vocabulary — because the
// four-field one moved for neither a rename nor a new type — and moved the
// selected id into dlg.dataset.tok so no id is ever parsed back out of a
// delimiter-joined string a student can type into. What is asserted is
// unchanged and slightly stronger: the dialog repainted, it still knows which
// type it is showing, and the fingerprint carries the undone shape (read out of
// the structure rather than prefix-matched).
const sigParsed = (() => {
  try { return JSON.parse(dlg.dataset.sig); } catch (e) { return null; }
})();
const sigHpShape = sigParsed
  ? ((sigParsed[1] || []).filter((r) => r[0] === 'hp')[0] || [])[2]
  : '(unparsable)';
check(
  '23. an undo taken while the picker is open repaints its selection marks',
  shapeUndone === shapeBefore && String(markedOn) === shapeUndone
    && dlg.dataset.tok === 'hp' && sigHpShape === shapeUndone,
  'state shape=' + shapeUndone + ' (wanted ' + shapeBefore + '), swatches marked live='
    + JSON.stringify(markedOn) + ', dialog tok=' + JSON.stringify(dlg.dataset.tok)
    + ', fingerprint shape for hp=' + JSON.stringify(sigHpShape)
);

/* --- 21. the same non-primary rule on the picker's own root, while the dialog
       is still open. The swatch is re-queried rather than reused: check 18's
       restyle repainted all three grids, so the node pressed there is detached
       and would take no event at all — a check that passes because nothing
       happens is the failure mode this whole commit is about. It also targets a
       shape that is NOT the live one, so an unguarded handler would visibly
       move state. --- */
const liveShape = A.state.get().build.tokens.hp.shape;
const otherShape = A.data.SHAPES.filter((s) => s !== liveShape)[0];
const swatch2 = dlg.querySelector('[data-act="setTokenStyle"][data-shape="' + otherShape + '"]');
const swatchBefore = JSON.stringify(A.state.get().build.tokens.hp);
let swatchRightDelta = -1;
if (swatch2 !== null) {
  const beforeRightSwatch = commits();
  swatch2.dispatchEvent(dom.event('pointerdown', { pointerId: 1, button: 2 }));
  swatch2.dispatchEvent(dom.event('pointerup', { pointerId: 1, button: 2 }));
  swatchRightDelta = commits() - beforeRightSwatch;
}
check(
  '21. a right-button press on a swatch restyles nothing',
  swatch2 !== null && swatchRightDelta === 0
    && JSON.stringify(A.state.get().build.tokens.hp) === swatchBefore,
  'commits delta=' + swatchRightDelta + ' wanted shape ' + otherShape
    + ' to be refused; tokens.hp=' + JSON.stringify(A.state.get().build.tokens.hp)
);

press(dom.byId['tok-pick-done']);
release(dom.byId['tok-pick-done']);
check(
  '19. Done closes the picker and hands focus back to the button that opened it',
  dlg.open === false && stub.activeElement === openBtn,
  'open=' + dlg.open + ' activeElement='
    + String(stub.activeElement && stub.activeElement.dataset.k)
);

/* --- 20. pointerdown fires for the right and middle buttons too, so a control
       that does not inspect e.button steps its value and starts a hold ramp
       under a native context menu — where the ramp's own stop conditions may
       never arrive. What a real browser does with pointerup while that menu is
       up could not be executed here (no browser in this repo); what IS executed
       is that the handler now declines the event outright. --- */
const rightTarget = stub.querySelector('[data-act="nudgeMaxHp"][data-step="1"]');
let rightDelta = -1;
let rightHold = '(no stepper)';
if (rightTarget !== null) {
  const beforeRight = commits();
  rightTarget.dispatchEvent(dom.event('pointerdown', { pointerId: 1, button: 2 }));
  rightHold = A.interactions.holdSource();
  rightTarget.dispatchEvent(dom.event('pointerup', { pointerId: 1, button: 2 }));
  rightDelta = commits() - beforeRight;
}
check(
  '20. a non-primary press on a stepper commits nothing and starts no ramp',
  rightTarget !== null && rightDelta === 0 && rightHold === null,
  'commits delta=' + rightDelta + ' holdSource=' + rightHold
);

/* --- 22. held Enter on a button. The browser generates one click{detail:0}
       per repeated keydown and onClick cannot tell them apart, because click
       events carry no repeat field — so the suppression has to happen on the
       keydown, and preventDefault is what stops the click being synthesised at
       all. This stub does not synthesise clicks from keydowns, so what is
       asserted here is the guard itself: a repeat is cancelled, a first press
       is not. Whether Chrome really withholds the click after a cancelled
       keydown is spec-documented and NOT executed here — there is no browser in
       this repo. --- */
const undoBtn = stub.querySelector('[data-act="undo"]');
let repeatCancelled = null;
let firstCancelled = null;
let undoDelta = -1;
if (undoBtn !== null) {
  const depthBeforeHold = A.state.undoDepth();
  const firstPress = dom.event('keydown', { key: 'Enter', repeat: false });
  undoBtn.dispatchEvent(firstPress);
  firstCancelled = firstPress.defaultPrevented;
  for (let i = 0; i < 10; i++) {
    const rep = dom.event('keydown', { key: 'Enter', repeat: true });
    undoBtn.dispatchEvent(rep);
    repeatCancelled = rep.defaultPrevented;
  }
  undoDelta = A.state.undoDepth() - depthBeforeHold;
}
check(
  '22. a repeated Enter keydown on a button is cancelled before it can become a '
    + 'click, and the first press is not',
  undoBtn !== null && repeatCancelled === true && firstCancelled === false
    && undoDelta === 0,
  'first press cancelled=' + firstCancelled + ' repeat cancelled=' + repeatCancelled
    + ' undoDepth delta across ten repeats=' + undoDelta
);

/* --- 24. an error raised while a modal is up. A showModal() dialog is promoted
       to the top layer, which is above every z-index in the document, and it
       makes the rest of the document inert — so .err-panel painted behind it
       could be neither read through the 76%-opaque backdrop nor clicked, and
       dismiss.focus() landed on an inert button. The top-layer and inert
       semantics are spec behaviour and are NOT executed here; there is no
       browser in this repo. What IS executed is that fail() now closes the
       modal before it raises the panel. --- */
press(openBtn);
release(openBtn);
const modalWasOpen = dlg.open;
const rogue2 = stub.createElement('button');
rogue2.dataset.act = 'notAnOp';
dom.byId['topbar'].appendChild(rogue2);
press(rogue2);
check(
  '24. an error raised while the picker is modal closes it first, so the '
    + 'recovery panel is reachable',
  modalWasOpen === true && dlg.open === false && errPanel.hidden === false
    && errTitle.textContent !== '',
  'modal was open=' + modalWasOpen + ', now open=' + dlg.open
    + ', panel hidden=' + errPanel.hidden
    + ', title=' + JSON.stringify(errTitle.textContent)
);
rogue2.remove();
clearPanel();

/* --- 25. a numeric field whose data-act drifted. The delta direction was
       always allowlisted; the absolute direction passed el.dataset.act straight
       into App.ops.dispatch, so a field carrying act="alive" reached setAlive
       and surfaced its "No fight in progress" instead of failing at the page
       boundary where the mistake actually is. The message is the discriminator
       here: both spellings raise the panel, and only one of them names the
       real fault. undoDepth rather than commits, because the keydown itself
       legitimately flips ui.kbdNav through commitUi. --- */
const rogueField = stub.createElement('input');
rogueField.className = 'stp-field num';
rogueField.dataset.k = 'cats/c1/rogue';
rogueField.dataset.act = 'alive';
rogueField.dataset.amt = 'hp';
rogueField.dataset.side = 'cats';
rogueField.dataset.unit = 'c1';
rogueField.dataset.was = '';
rogueField.value = '1';
dom.byId['col-cats'].appendChild(rogueField);
const depthBeforeRogueField = A.state.undoDepth();
rogueField.dispatchEvent(dom.event('keydown', { key: 'Enter' }));
const rogueFieldDepth = A.state.undoDepth() - depthBeforeRogueField;
check(
  '25. a field whose data-act is not one a field may drive is refused at the '
    + 'page boundary, not forwarded to whatever op it names',
  rogueFieldDepth === 0 && errPanel.hidden === false
    && errMessage.textContent.indexOf('No set op for "alive"') !== -1,
  'undoDepth delta=' + rogueFieldDepth
    + ' message=' + JSON.stringify(errMessage.textContent)
);
rogueField.remove();
clearPanel();

/* --- 26. #strip stuck at a hardcoded --topbar-h while #topbar is min-height
       with a wrapping control cluster, and the markup comment above that
       cluster plans for Phase 4 and Phase 5 to add to it. When the two
       disagree there is no error and no warning: the sticky panel simply parks
       under the bar. The offset is measured now, and republished when the bar
       changes size. The CSS consequences are NOT executed here — there is no
       browser and no layout engine in this repo — but the publish-and-
       republish path is. --- */
const styleOf = dom.document.documentElement.style;
const firstPublish = styleOf.getPropertyValue('--topbar-now');
dom.byId['topbar']._rectHeight = 120;
resizeCallbacks.forEach((fn) => fn());
const secondPublish = styleOf.getPropertyValue('--topbar-now');
check(
  '26. boot publishes the measured topbar height and republishes it when the '
    + 'bar changes size',
  firstPublish === '88px' && resizeCallbacks.length === 1 && secondPublish === '120px',
  'first=' + JSON.stringify(firstPublish) + ' after resize=' + JSON.stringify(secondPublish)
    + ' observers registered=' + resizeCallbacks.length
);

/* --- 8. P-05, asserted rather than trusted to a comment --- */
check(
  '8. the hold ramp stays inside the undo coalescing window',
  A.interactions.HOLD_FIRST_MS < A.state.COALESCE_MS,
  'HOLD_FIRST_MS=' + A.interactions.HOLD_FIRST_MS + ' COALESCE_MS=' + A.state.COALESCE_MS
);


/* --- 27-35. the authoring surface, driven end to end. Everything above this
       point proved the picker could be opened and a swatch pressed; nothing
       proved a student could reach a type of their own, make one, name one or
       take one away. These nine do, and each of them corresponds to something
       that was measured broken or was unreachable before this plan. --- */

const pkList = dom.byId['tok-pick-list'];
const pkName = dom.byId['tok-pick-name'];
const pkNewUnit = dom.byId['tok-pick-new-unit'];
const pkNewSide = dom.byId['tok-pick-new-side'];
const pkRemove = dom.byId['tok-pick-remove'];

function pkRows() {
  return pkList ? pkList.children : [];
}
function pkRowFor(tokenId) {
  return pkList ? pkList.querySelector('[data-tok="' + tokenId + '"]') : null;
}
function pkRowLabel(tokenId) {
  const row = pkRowFor(tokenId);
  const span = row ? row.querySelector('.pk-sw-label') : null;
  return span ? span.textContent : '(no row)';
}
function pkMarked() {
  return pkRows()
    .filter((n) => String(n.className).indexOf('pk-sw--on') !== -1)
    .map((n) => n.dataset.tok);
}
function vocabIds() {
  return Object.keys(A.state.get().build.tokens);
}
function rightPress(node) {
  node.dispatchEvent(dom.event('pointerdown', { pointerId: 1, button: 2 }));
  node.dispatchEvent(dom.event('pointerup', { pointerId: 1, button: 2 }));
}

/* --- 27. D-05, asserted on the markup the stub stands in for. The bar used to
       carry one button per type the board ships with, which is a bar that grows
       every time a student invents one. With one button that names no type, the
       starting selection is a decision the handler makes rather than a value
       read off whichever control was pressed. --- */
if (dlg.open === true) { dlg.close(); }
const tokButtons = stub.querySelectorAll('[data-act="openTokenPicker"]');
press(openBtn);
release(openBtn);
check(
  '27. the topbar carries exactly one token button, it names no type, and it '
    + 'opens the picker on the type the handler defaults to',
  tokButtons.length === 1 && tokButtons[0].dataset.tok === undefined
    && dlg.open === true && dlg.dataset.tok === 'hp',
  'buttons=' + tokButtons.length
    + ' data-tok=' + JSON.stringify(tokButtons.length ? tokButtons[0].dataset.tok : '(none)')
    + ' open=' + dlg.open + ' tok=' + JSON.stringify(dlg.dataset.tok)
);

/* --- 28. one row per vocabulary entry, `dead` included (D-05). Excluding one
       would rebuild exactly the special case a single list exists to delete. --- */
const rowIds = pkRows().map((n) => n.dataset.tok);
check(
  '28. the list carries one row per type on the board, the dead marker included',
  String(rowIds) === String(vocabIds()) && rowIds.indexOf('dead') !== -1,
  'rows=' + JSON.stringify(rowIds) + ' vocabulary=' + JSON.stringify(vocabIds())
);

/* --- 29. picking a type is PAGE WORK. It moves an attribute and asks for a
       repaint; it must not reach [S05] dispatch, and it must not leave a step
       on the undo stack for a student to rewind past. --- */
const depthBeforePick = A.state.undoDepth();
const commitsBeforePick = commits();
const dmgRow = pkRowFor('dmg');
if (dmgRow !== null) { press(dmgRow); release(dmgRow); }
check(
  '29. pressing a list row moves the editor to that type and commits nothing',
  dmgRow !== null && dlg.dataset.tok === 'dmg'
    && String(pkMarked()) === 'dmg'
    && A.state.undoDepth() === depthBeforePick
    && commits() === commitsBeforePick
    && errPanel.hidden === true,
  'tok=' + JSON.stringify(dlg.dataset.tok) + ' marked=' + JSON.stringify(pkMarked())
    + ' undoDepth delta=' + (A.state.undoDepth() - depthBeforePick)
    + ' commits delta=' + (commits() - commitsBeforePick)
);

/* --- 30. THE PITFALL 4 REGRESSION TEST, and it is written to fail against a
       signature-gated picker. The repaint gate this replaces fingerprinted four
       fields of one record — id, shape, colour, glyph — so a rename moved
       nothing: not the gate, not the heading, not the list row. The red-then-
       green run against that older gate was performed in plan 02.1-04 and its
       nine failing rows are recorded there. What is asserted here is the pair
       that matters to a student: the name follows in the dialog AND on the
       board, from one commit, with no rebuild asked for. --- */
const hpLabelsBefore = stub.querySelectorAll('[data-lbl="hp"]').length;
A.ops.renameTokenType('hp', 'Vigor');
A.state.flush();
const boardSaysVigor = stub.querySelectorAll('[data-lbl="hp"]')
  .every((n) => n.textContent === 'Vigor');
const listSaysVigor = pkRowLabel('hp');
A.ops.renameTokenType('hp', 'Health');
A.state.flush();
check(
  '30. a rename repaints the picker list and the board label alike, which the '
    + 'four-field signature this replaces did neither of',
  hpLabelsBefore > 0 && boardSaysVigor === true && listSaysVigor === 'Vigor'
    && pkRowLabel('hp') === 'Health',
  'board labels=' + hpLabelsBefore + ' all read Vigor=' + boardSaysVigor
    + ' list row read=' + JSON.stringify(listSaysVigor)
    + ' and back to ' + JSON.stringify(pkRowLabel('hp'))
);

/* --- 31. New, at both scopes. The scope is a property of the act, not of the
       editor (D-03), so the two buttons are two acts. A unit-scope type draws a
       line on every unit card; a side-scope one draws a line on each faction
       head instead. --- */
const pkCardCount = stub.querySelectorAll('.unit-card').length;
const optBeforeNew = stub.querySelectorAll('.brd-line--opt').length;
press(pkNewUnit);
release(pkNewUnit);
A.state.flush();
const madeUnitId = dlg.dataset.tok;
const optAfterUnit = stub.querySelectorAll('.brd-line--opt').length;
press(pkNewSide);
release(pkNewSide);
A.state.flush();
const madeSideId = dlg.dataset.tok;
const optAfterSide = stub.querySelectorAll('.brd-line--opt').length;
check(
  '31. New draws a line on every unit card at unit scope and one on each '
    + 'faction head at side scope, and lands the student in the new type',
  pkCardCount > 0
    && optAfterUnit - optBeforeNew === pkCardCount
    && optAfterSide - optAfterUnit === 2
    && pkRowFor(madeUnitId) !== null && pkRowFor(madeSideId) !== null
    && String(pkMarked()) === String(madeSideId)
    && A.state.get().build.tokens[madeUnitId].scope === 'unit'
    && A.state.get().build.tokens[madeSideId].scope === 'side',
  'cards=' + pkCardCount + ' opt lines ' + optBeforeNew + ' -> ' + optAfterUnit
    + ' -> ' + optAfterSide + ' made=' + JSON.stringify([madeUnitId, madeSideId])
    + ' marked=' + JSON.stringify(pkMarked())
);

/* --- 32. a tally nobody has written is not a line saying zero, it is nothing
       at all. The line EXISTS from the moment the type does — building it on
       demand would make a tally going 0 -> 1 a structural change — and the hide
       pass decides whether it is on screen. Asserted on the .hidden PROPERTY,
       because the stub's selector grammar parses a tag, a class and a data-*
       attribute and nothing else — an attribute selector naming the hidden
       attribute matches nothing here and would pass for the wrong reason,
       which is why there is a standing grep saying none may appear. This
       comment therefore describes that selector rather than spelling it. --- */
const optLine = stub.querySelector('.brd-line--opt[data-amt="' + madeUnitId + '"][data-unit="c1"]');
const hiddenAtZero = optLine ? optLine.hidden : '(no line)';
A.ops.nudgeTally('cats', 'c1', madeUnitId, 1);
A.state.flush();
const hiddenAtOne = optLine ? optLine.hidden : '(no line)';
check(
  '32. a line for a number nobody wrote is hidden, and writing one reveals it '
    + 'without rebuilding the card it is on',
  optLine !== null && hiddenAtZero === true && hiddenAtOne === false
    && stub.querySelector('.brd-line--opt[data-amt="' + madeUnitId + '"][data-unit="c1"]') === optLine,
  'line found=' + (optLine !== null) + ' hidden at 0=' + hiddenAtZero
    + ' hidden at 1=' + hiddenAtOne
);

/* --- 33. the removed-row focus case. When the selected type goes, so does its
       list row: keyed() has nothing to restore focus to, and fallbackTarget
       cannot help because it resolves through data-side and no node in this
       dialog carries one. Focus lands on <body> unless the handler places it —
       the same failure peerOrdinal solved for the board's remove control. --- */
const removeMe = madeUnitId;
const pickRow = pkRowFor(removeMe);
if (pickRow !== null) { press(pickRow); release(pickRow); }
press(pkRemove);
release(pkRemove);
A.state.flush();
const landedOn = stub.activeElement;
check(
  '33. removing the selected type takes its row with it and leaves focus on a '
    + 'real node rather than on the document body',
  pkRowFor(removeMe) === null
    && Object.prototype.hasOwnProperty.call(A.state.get().build.tokens, removeMe) === false
    && landedOn !== null && landedOn !== stub.body
    && dlg.dataset.tok === 'hp'
    && errPanel.hidden === true,
  'row gone=' + (pkRowFor(removeMe) === null)
    + ' focus data-k=' + JSON.stringify(landedOn && landedOn.dataset && landedOn.dataset.k)
    + ' is body=' + (landedOn === stub.body)
    + ' tok=' + JSON.stringify(dlg.dataset.tok)
);

/* --- 34. the same non-primary rule check 21 applies to a swatch, applied to
       the three controls that can now change the vocabulary. Without it a
       right-click to inspect a control in DevTools — ordinary behaviour for the
       instructor this artifact is built for — would make a type or take one
       away under the context menu. --- */
const vocabBeforeRight = JSON.stringify(vocabIds());
const tokBeforeRight = dlg.dataset.tok;
const commitsBeforeRight = commits();
const rightRow = pkRowFor('dmg');
if (rightRow !== null) { rightPress(rightRow); }
rightPress(pkNewUnit);
rightPress(pkRemove);
check(
  '34. a right-button press on a list row, on New and on Remove each change '
    + 'nothing at all',
  rightRow !== null && JSON.stringify(vocabIds()) === vocabBeforeRight
    && dlg.dataset.tok === tokBeforeRight
    && commits() === commitsBeforeRight
    && errPanel.hidden === true,
  'vocabulary=' + JSON.stringify(vocabIds()) + ' (was ' + vocabBeforeRight + ')'
    + ' tok=' + JSON.stringify(dlg.dataset.tok) + ' (was ' + JSON.stringify(tokBeforeRight) + ')'
    + ' commits delta=' + (commits() - commitsBeforeRight)
);

/* --- 35. check 23's idea, extended to the nodes this plan added. Ctrl+Z
       reaches App.ops.undo() from inside the open dialog, and the commit it
       raises came from no handler of the picker's own — so nothing would repaint
       the list or the name field unless the per-frame hook does it. --- */
const beforeUndoName = pkName ? pkName.value : '(no field)';
A.ops.renameTokenType('hp', 'Vigor');
A.state.flush();
const midName = pkRowLabel('hp');
A.ops.undo();
A.state.flush();
check(
  '35. an undo taken while the picker is open repaints the list row and the '
    + 'name field alike',
  pkName !== null && midName === 'Vigor' && pkRowLabel('hp') === 'Health'
    && A.state.get().build.tokens.hp.name === 'Health'
    && pkName.value === A.render.labelFor(A.state.get(), dlg.dataset.tok),
  'list row mid-rename=' + JSON.stringify(midName)
    + ' after undo=' + JSON.stringify(pkRowLabel('hp'))
    + ' name field=' + JSON.stringify(pkName && pkName.value)
    + ' (was ' + JSON.stringify(beforeUndoName) + ')'
    + ' showing=' + JSON.stringify(dlg.dataset.tok)
);

if (dlg.open === true) { dlg.close(); }


/* --- 36-38. the name field. It is deliberately NOT one of the board's stepper
       fields — that class is what isField keys on and everything downstream of
       it is numeric, so a name typed into one would be parsed as a figure and
       refused on Enter — so the PATTERN is reused and the plumbing is not, and
       that means the pattern needs coverage of its own here. --- */

// focus() is now the whole of it. The hand-written focusin that used to follow
// this line was the harness compensating for a stub that dispatched nothing,
// and keeping it beside a stub that does would fire the handler twice — which
// is not what a browser does and not what these checks should be reading.
function nameFocus() {
  pkName.focus();
}
function nameType(text) {
  pkName.value = text;
  pkName.dispatchEvent(dom.event('input'));
}
function nameKey(key) {
  pkName.dispatchEvent(dom.event('keydown', { key: key }));
}
function nameBlur() {
  pkName.dispatchEvent(dom.event('focusout'));
}
// Leaving the field for real. The repaint SKIPS a focused field on purpose
// (D-19), so a rename raised from outside while it still holds focus would
// leave both the text and the recorded baseline standing — correct behaviour,
// and a trap for any check that sets up its next case with one.
function nameLeave() {
  pkName.blur();
  A.state.flush();
}

press(openBtn);
release(openBtn);
clearPanel();

/* --- 36. Enter commits, and the blur that follows it commits NOTHING. Without
       the value-versus-was early return commitField carries for the same
       reason, typing a name, pressing Enter and then clicking away applies the
       rename TWICE. --- */
nameFocus();
const wasRecorded = pkName.dataset.was;
nameType('Vigor');
const commitsBeforeEnter = commits();
nameKey('Enter');
const afterEnter = A.state.get().build.tokens.hp.name;
const commitsFromEnter = commits() - commitsBeforeEnter;
nameBlur();
const commitsFromBlur = commits() - commitsBeforeEnter - commitsFromEnter;
check(
  '36. Enter renames the selected type, and the blur that follows applies it '
    + 'once rather than twice',
  wasRecorded === 'Health' && afterEnter === 'Vigor'
    && commitsFromEnter === 1 && commitsFromBlur === 0
    && pkName.dataset.was === 'Vigor' && errPanel.hidden === true,
  'baseline recorded on focus=' + JSON.stringify(wasRecorded)
    + ' name after Enter=' + JSON.stringify(afterEnter)
    + ' commits from Enter=' + commitsFromEnter + ' from blur=' + commitsFromBlur
    + ' baseline now=' + JSON.stringify(pkName.dataset.was)
);
nameLeave();
A.ops.renameTokenType('hp', 'Health');
A.state.flush();

/* --- 37. Escape puts the recorded text back and commits nothing. That it also
       leaves the DIALOG open is the half this harness cannot reach: the stub
       <dialog> has .open, showModal() and close() and no close-request
       behaviour at all, so the cancel interception goes to the rehearsal. --- */
nameFocus();
nameType('Poison');
const commitsBeforeEsc = commits();
nameKey('Escape');
check(
  '37. Escape puts the recorded name back and commits nothing',
  pkName.value === 'Health' && commits() === commitsBeforeEsc
    && A.state.get().build.tokens.hp.name === 'Health'
    && errPanel.hidden === true,
  'field reads ' + JSON.stringify(pkName.value)
    + ' commits delta=' + (commits() - commitsBeforeEsc)
    + ' state name=' + JSON.stringify(A.state.get().build.tokens.hp.name)
);

/* --- 38. the cut, and the two refusal volumes. A 30-emoji paste is cut on the
       code-point array at the keystroke boundary, so nothing downstream ever
       sees half an astral pair and Phase 4's encoder cannot be handed one
       (D-12a). Enter is loud because it is an explicit request; blur is quiet
       because clicking away from a half-typed name is not an error. --- */
nameType('\u{1F480}'.repeat(30));
const cutLength = Array.from(pkName.value).length;
let cutEncodes = false;
try { encodeURIComponent(pkName.value); cutEncodes = true; } catch (e) { cutEncodes = false; }
nameType('   ');
nameKey('Enter');
const loudPanel = errPanel.hidden === false && errMessage.textContent !== '';
const loudReverted = pkName.value;
clearPanel();
nameType('   ');
nameBlur();
check(
  '38. a paste past the cap is cut by code point, and a name the op refuses is '
    + 'loud on Enter and quiet on blur',
  cutLength === A.data.MAX_TOKEN_NAME && cutEncodes === true
    && loudPanel === true && loudReverted === 'Health'
    && errPanel.hidden === true && pkName.value === 'Health'
    && A.state.get().build.tokens.hp.name === 'Health',
  'cut to ' + cutLength + ' code points (cap ' + A.data.MAX_TOKEN_NAME + ')'
    + ' encodes=' + cutEncodes + ' loud panel=' + loudPanel
    + ' reverted to ' + JSON.stringify(loudReverted)
    + ' quiet panel hidden=' + errPanel.hidden
    + ' field now ' + JSON.stringify(pkName.value)
);
clearPanel();
nameLeave();
if (dlg.open === true) { dlg.close(); }

/* --- 39. THE ONE THE 39-CHECK GREEN RUN ABOVE COULD NOT SEE. Every control in
       this dialog that moves the selection moves it on pointerdown, which the
       spec puts BEFORE the focus change — so the focusout that commits a
       half-typed name arrives after the editor has already moved to a different
       type. Checks 36-38 each drive a focusout, and every one of them does it
       without changing the selection in between, which is precisely the case
       that works.

       Three presses, each one a shape a student makes without trying:
         a row press must land the text on the type it was typed for;
         New must do the same, and the newly made type must keep its own name;
         Remove must take the half-typed name away with the type it removes and
           must not put it on one of the five the board is built on. That third
           one needs no emulated ordering at all — dropType calls focus()
           explicitly inside its own pointerdown handler, and a programmatic
           focus() fires focusout synchronously in every engine. --- */

// A press that moves focus, in the order the browser does it: the pointerdown
// handler runs first, and only then does the default action move focus — which
// is what fires focusout on whatever the student was typing in.
function pressMovingFocus(node) {
  press(node);
  node.focus();
  release(node);
  A.state.flush();
}

press(openBtn);
release(openBtn);
clearPanel();

// CASE A — a name typed for a student-made type, then a press on another row.
press(pkNewUnit);
release(pkNewUnit);
A.state.flush();
const caseAId = dlg.dataset.tok;
nameFocus();
nameType('Poison');
pressMovingFocus(pkRowFor('dmg'));
const caseAName = A.state.get().build.tokens[caseAId].name;
const caseADmg = A.state.get().build.tokens.dmg.name;

// CASE C — a name typed for one type, then New. The text belongs to the type it
// was typed for; the type that did not exist when it was typed keeps the
// placeholder it arrives with.
const caseCFor = dlg.dataset.tok;
nameFocus();
nameType('Frost');
pressMovingFocus(pkNewUnit);
const caseCId = dlg.dataset.tok;
const caseCName = A.state.get().build.tokens[caseCFor].name;
const caseCMade = A.state.get().build.tokens[caseCId].name;

// CASE B — a name typed for a student-made type, then Remove. This is the one
// that renamed Health.
nameFocus();
nameType('Venom');
press(pkRemove);
release(pkRemove);
A.state.flush();
const caseBHealth = A.state.get().build.tokens.hp.name;
const caseBGone = Object.prototype.hasOwnProperty.call(A.state.get().build.tokens, caseCId) === false;

check(
  '39. a half-typed name commits to the type it was typed for, and never to '
    + 'whichever type the editor moved to under it',
  caseAName === 'Poison' && caseADmg === 'Damage'
    && caseCName === 'Frost' && caseCMade === A.interactions.NEW_TOKEN_NAME
    && caseBHealth === 'Health' && caseBGone === true
    && errPanel.hidden === true,
  'row press: typed-for type=' + JSON.stringify(caseAName) + ' (want "Poison")'
    + ' dmg=' + JSON.stringify(caseADmg) + ' (want "Damage")'
    + ' | New: typed-for type=' + JSON.stringify(caseCName) + ' (want "Frost")'
    + ' made type=' + JSON.stringify(caseCMade)
    + ' (want ' + JSON.stringify(A.interactions.NEW_TOKEN_NAME) + ')'
    + ' | Remove: health=' + JSON.stringify(caseBHealth) + ' (want "Health")'
    + ' removed type gone=' + caseBGone
    + ' panel hidden=' + errPanel.hidden
);
clearPanel();
nameLeave();
// Put the board back for anything added after this point: the two types made
// above that were not removed, and the reveal one of them left standing.
[caseAId].forEach((id) => {
  if (Object.prototype.hasOwnProperty.call(A.state.get().build.tokens, id)) {
    A.ops.removeTokenType(id);
  }
});
A.state.flush();
if (dlg.open === true) { dlg.close(); }

/* --- 40. checks 23 and 35 both undo a RENAME, and a rename cannot make the
       open selection stop existing. Nothing undid a create. Undo is bound on
       the document and only steps aside for a field, so it is reachable from
       inside the modal with focus on a button — which is exactly where focus
       sits after pressing New. The repaint hook was written to stop the dialog
       asserting a value state no longer holds; it stopped short of the one
       commit that SHRINKS the vocabulary, and bailed out instead, leaving a
       ghost row for the vanished type with Remove still enabled. The next
       press on it raised the styled error panel. --- */
press(openBtn);
release(openBtn);
A.state.flush();
clearPanel();
press(pkNewUnit);
release(pkNewUnit);
A.state.flush();
const ghostId = dlg.dataset.tok;
A.ops.undo();
A.state.flush();
const ghostRow = pkRowFor(ghostId);
const ghostShowing = dlg.dataset.tok;
const ghostRemoveOff = pkRemove.disabled;
// The press a student makes next, on the surface as the undo left it.
const swatchAfterUndo = dom.byId['tok-pick-shapes'].firstElementChild;
if (swatchAfterUndo !== null) { press(swatchAfterUndo); release(swatchAfterUndo); }
A.state.flush();
check(
  '40. undoing a create repaints the open picker onto a live type rather than '
    + 'leaving a ghost row for the type that vanished under it',
  ghostRow === null
    && Object.prototype.hasOwnProperty.call(A.state.get().build.tokens, ghostShowing)
    && ghostRemoveOff === true
    && errPanel.hidden === true,
  'made=' + JSON.stringify(ghostId)
    + ' ghost row still present=' + (ghostRow !== null)
    + ' showing=' + JSON.stringify(ghostShowing)
    + ' (live=' + Object.prototype.hasOwnProperty.call(A.state.get().build.tokens, ghostShowing) + ')'
    + ' remove disabled=' + ghostRemoveOff
    + ' panel hidden=' + errPanel.hidden
    + ' panel says ' + JSON.stringify(errMessage.textContent)
);
clearPanel();
if (dlg.open === true) { dlg.close(); }

/* --- 41. the accessible name follows a rename, on all three stepper nodes and
       for a type the board is built on as well as one a student made. The
       visible label was moved to a per-frame read and the aria one was left
       baked at build time, so the projector and the screen reader disagreed
       from the first rename onwards. --- */
function ariaOf(node) {
  return node ? node.getAttribute('aria-label') : '(no node)';
}
function hpStepperNodes() {
  return ['cats/c1/maxHp-', 'cats/c1/maxHp', 'cats/c1/maxHp+']
    .map((k) => stub.querySelector('[data-k="' + k + '"]'));
}
const hpAriaBefore = hpStepperNodes().map(ariaOf);
A.ops.renameTokenType('hp', 'Vigor');
A.state.flush();
const hpAriaAfter = hpStepperNodes().map(ariaOf);
A.ops.renameTokenType('hp', 'Health');
A.state.flush();
const hpAriaBack = hpStepperNodes().map(ariaOf);

// And the same again for a type the student invented, which is the case the
// phase exists for.
press(openBtn);
release(openBtn);
press(pkNewUnit);
release(pkNewUnit);
A.state.flush();
const madeAria = dlg.dataset.tok;
if (dlg.open === true) { dlg.close(); }
function madeStepperNodes() {
  return ['cats/c1/' + madeAria + '-', 'cats/c1/' + madeAria, 'cats/c1/' + madeAria + '+']
    .map((k) => stub.querySelector('[data-k="' + k + '"]'));
}
const madeAriaBefore = madeStepperNodes().map(ariaOf);
A.ops.renameTokenType(madeAria, 'Poison');
A.state.flush();
const madeAriaAfter = madeStepperNodes().map(ariaOf);
A.ops.removeTokenType(madeAria);
A.state.flush();

check(
  '41. a rename moves the accessible name on the field and on both nudge '
    + 'buttons, for a type the board is built on and for one a student made',
  String(hpAriaBefore) === String(['Decrease Cat 1 Health', 'Cat 1 Health', 'Increase Cat 1 Health'])
    && String(hpAriaAfter) === String(['Decrease Cat 1 Vigor', 'Cat 1 Vigor', 'Increase Cat 1 Vigor'])
    && String(hpAriaBack) === String(hpAriaBefore)
    && String(madeAriaBefore) === String(['Decrease Cat 1 New type', 'Cat 1 New type', 'Increase Cat 1 New type'])
    && String(madeAriaAfter) === String(['Decrease Cat 1 Poison', 'Cat 1 Poison', 'Increase Cat 1 Poison']),
  'built-in before=' + JSON.stringify(hpAriaBefore)
    + ' after=' + JSON.stringify(hpAriaAfter)
    + ' back=' + JSON.stringify(hpAriaBack)
    + ' | student-made before=' + JSON.stringify(madeAriaBefore)
    + ' after=' + JSON.stringify(madeAriaAfter)
);

/* --- 42. the other end of the trap check 32 covers. The stepper that writes a
       tally is built INSIDE the line a zero hides, so the last press of the −
       that reaches zero puts the button under the student's finger inside a
       display:none ancestor and there is no route back to it on the page. The
       line has to survive while the student is standing on it, and collapse on
       the next frame after they leave. Driven with the reveal moved OFF the
       type, which is the state a student is in whenever the editor is closed or
       showing something else. --- */
press(openBtn);
release(openBtn);
press(pkNewUnit);
release(pkNewUnit);
A.state.flush();
const downTok = dlg.dataset.tok;
if (dlg.open === true) { dlg.close(); }
// Move the reveal off it, exactly as opening the editor on another type does.
A.ops.setUi('revealTok', '');
A.ops.nudgeTally('cats', 'c1', downTok, 3);
A.state.flush();
const downLine = stub.querySelector('.brd-line--opt[data-amt="' + downTok + '"][data-unit="c1"]');
const downMinus = stub.querySelector('[data-k="cats/c1/' + downTok + '-"]');
const downShownAtThree = downLine ? downLine.hidden === false : '(no line)';
// Step it to zero from the keyboard, with focus on the button being pressed —
// which is where a student's focus is by construction.
if (downMinus !== null) {
  downMinus.focus();
  for (let n = 0; n < 3; n++) { press(downMinus); release(downMinus); }
}
A.state.flush();
const downAmount = A.render.amountFor(A.state.get(), downTok, 'cats', 'c1');
const downStillThere = downLine ? downLine.hidden === false : '(no line)';
const downFocusHeld = stub.activeElement === downMinus;
// And it goes away on the NEXT FRAME after focus leaves it — not at the moment
// focus moves, which raises no frame of its own. That is the whole shape of the
// fix: the line lingers rather than vanishing under the finger.
if (downMinus !== null) { downMinus.blur(); }
A.state.invalidate();
A.state.flush();
const downGoneAfterLeaving = downLine ? downLine.hidden === true : '(no line)';
A.ops.removeTokenType(downTok);
A.state.flush();
check(
  '42. stepping a tally to zero keeps the line while the student is standing '
    + 'on it, and collapses it on the frame after they leave',
  downLine !== null && downMinus !== null
    && downShownAtThree === true && downAmount === 0
    && downStillThere === true && downFocusHeld === true
    && downGoneAfterLeaving === true,
  'line found=' + (downLine !== null) + ' minus found=' + (downMinus !== null)
    + ' shown at 3=' + downShownAtThree + ' amount after three presses=' + downAmount
    + ' line shown at 0 while focused=' + downStillThere
    + ' focus still on the minus=' + downFocusHeld
    + ' hidden once focus left=' + downGoneAfterLeaving
);

/* --- 43. check 22's guard, asserted on the OTHER root. The dialog is a sibling
       of #app, so nothing pressed inside it ever reaches the listener check 22
       drives, and this phase put six act-carrying buttons plus every swatch and
       every list row in here. Held Enter on New would make one type per OS
       auto-repeat until the cap disabled the button, and leave that many undo
       entries to rewind one at a time. Same three assertions as check 22, and
       the same caveat: this stub does not synthesise clicks from keydowns, so
       what is asserted is the guard, and one more thing check 22 has no need
       of — that a held key inside the NAME FIELD is not silenced, because that
       is a student typing. --- */
press(openBtn);
release(openBtn);
A.state.flush();
clearPanel();
const pkVocabBeforeHold = vocabIds().length;
const pkFirst = dom.event('keydown', { key: 'Enter', repeat: false });
pkNewUnit.dispatchEvent(pkFirst);
let pkRepeatCancelled = null;
for (let i = 0; i < 10; i++) {
  const rep = dom.event('keydown', { key: 'Enter', repeat: true });
  pkNewUnit.dispatchEvent(rep);
  pkRepeatCancelled = rep.defaultPrevented;
}
A.state.flush();
// A held Space in the name field is a student holding the space bar, not a
// button being hammered, and must survive untouched.
nameFocus();
const heldSpace = dom.event('keydown', { key: ' ', repeat: true });
pkName.dispatchEvent(heldSpace);
nameLeave();
check(
  '43. a repeated Enter keydown on a picker button is cancelled before it can '
    + 'become a click, the first press is not, and a held key in the name '
    + 'field is left alone',
  pkRepeatCancelled === true && pkFirst.defaultPrevented === false
    && vocabIds().length === pkVocabBeforeHold
    && heldSpace.defaultPrevented === false
    && errPanel.hidden === true,
  'repeat cancelled=' + pkRepeatCancelled
    + ' first press cancelled=' + pkFirst.defaultPrevented
    + ' types made by the hold=' + (vocabIds().length - pkVocabBeforeHold)
    + ' held space in the field cancelled=' + heldSpace.defaultPrevented
);
clearPanel();
if (dlg.open === true) { dlg.close(); }

/* --- 44. the list keeps its scroll offset across a repaint. [C07] caps the
       list's height and lets it scroll, and at the cap it is roughly twice as
       tall as the box it sits in. Every repaint empties it, which clamps the
       offset to zero, and selecting a row IS a repaint — so pressing a row near
       the bottom threw the list to the top, and the focus restore then declined
       to scroll it back because it asks for that explicitly. The row the
       student pressed went off the top of the box. --- */
press(openBtn);
release(openBtn);
A.state.flush();
clearPanel();
if (pkList !== null) { pkList.scrollTop = 120; }
const scrollRow = pkRowFor('shield');
if (scrollRow !== null) { press(scrollRow); release(scrollRow); }
A.state.flush();
const scrollAfterRow = pkList ? pkList.scrollTop : '(no list)';
// And across a repaint raised from outside the dialog, which is the other way
// the list is rebuilt under a student.
if (pkList !== null) { pkList.scrollTop = 96; }
A.ops.renameTokenType('dmg', 'Hurt');
A.state.flush();
const scrollAfterRename = pkList ? pkList.scrollTop : '(no list)';
A.ops.renameTokenType('dmg', 'Damage');
A.state.flush();
check(
  '44. the type list keeps its scroll offset when a repaint rebuilds it, so a '
    + 'row pressed near the bottom does not jump off the top',
  pkList !== null && scrollAfterRow === 120 && scrollAfterRename === 96
    && dlg.dataset.tok === 'shield',
  'offset after a row press=' + scrollAfterRow + ' (was 120)'
    + ' offset after a rename raised from outside=' + scrollAfterRename + ' (was 96)'
    + ' showing=' + JSON.stringify(dlg.dataset.tok)
);
clearPanel();
if (dlg.open === true) { dlg.close(); }

/* --- 45. two News in a row must not produce two records nothing but the
       invisible id tells apart. A new type inherits the look of whatever the
       editor is showing and then the editor moves onto it, so the second New
       inherited the first — same name, same shape, same colour, same glyph, on
       the very first press of the flow this phase exists for. The colour is
       what is rotated; the name stays the placeholder it is on purpose. --- */
press(openBtn);
release(openBtn);
A.state.flush();
clearPanel();
const runOfNew = [];
for (let i = 0; i < 4; i++) {
  press(pkNewUnit);
  release(pkNewUnit);
  A.state.flush();
  runOfNew.push(dlg.dataset.tok);
}
const runLooks = runOfNew.map((id) => {
  const rec = A.state.get().build.tokens[id];
  return [rec.shape, rec.color, rec.glyph].join('/');
});
const runColors = runOfNew.map((id) => A.state.get().build.tokens[id].color);
const runAllValid = runColors.every((c) => A.data.COLORS.indexOf(c) !== -1);
const runNamesStillDefault = runOfNew
  .every((id) => A.state.get().build.tokens[id].name === A.interactions.NEW_TOKEN_NAME);
runOfNew.forEach((id) => A.ops.removeTokenType(id));
A.state.flush();
check(
  '45. four New presses in a row produce four types a student can tell apart, '
    + 'and the placeholder name is left a placeholder',
  new Set(runLooks).size === runOfNew.length
    && runAllValid === true && runNamesStillDefault === true
    && errPanel.hidden === true,
  'looks=' + JSON.stringify(runLooks)
    + ' distinct=' + new Set(runLooks).size + ' of ' + runOfNew.length
    + ' every colour on the shipped palette=' + runAllValid
    + ' names all still the placeholder=' + runNamesStillDefault
);
clearPanel();
if (dlg.open === true) { dlg.close(); }

/* --- 49-57. the projection strip, mirrored into the half that runs in CI ------
       [S09.8]'s document-gated rows are the primary home for this behaviour and
       they are richer than these. But `node tests/selftest-node.cjs` loads the
       artifact into a sandbox with no document at all, so that half is SKIPPED
       there and only a browser run ever sees it. These rows read the same nodes
       off the stub page, so the highest-value ones cannot rot unnoticed between
       one rehearsal and the next.

       Two of [S09.8]'s rows are deliberately RE-SPELLED here rather than
       copied, because copying them would have produced two passes that mean
       nothing. The stub's selector engine understands a class and a [data-*]
       test and nothing else, so `#strip [style]` matches no node here for a
       reason that has nothing to do with the artifact. And the stub's
       textContent is a plain own property rather than a value computed over
       descendants, so `strip.textContent` is the empty string no matter what
       the page holds. Both are written out longhand below so they are about the
       page rather than about this file's limits.

       Every drive is bracketed: the board is put back to the shipped one before
       each assertion that names a shipped number, and the whole state recorded
       here is handed back at the end so Layer C's walk reads the same page it
       has always read. --- */
const prjSaved = JSON.stringify(A.state.get());
const strip = dom.byId['strip'];

function prjNode(kind, side) {
  if (!strip) { return null; }
  return strip.querySelectorAll('[data-prj="' + kind + '"][data-side="' + side + '"]')[0] || null;
}
function prjText(kind, side) {
  const n = prjNode(kind, side);
  return n ? n.textContent : '(no node)';
}
function stripLeafText() {
  const out = [];
  (function walk(n) {
    if (!n) { return; }
    if (n.children.length === 0) {
      if (typeof n.textContent === 'string' && n.textContent !== '') { out.push(n.textContent); }
      return;
    }
    n.children.forEach(walk);
  })(strip);
  return out;
}

A.ops.resetToDefaults();
A.state.flush();

check(
  '49. the shipped board puts one figure per side in the strip, and each names '
    + 'the side it wipes rather than leaving a bare number to be read either way',
  prjText('turns', 'cats') === '≈9 turns to wipe Mechs'
    && prjText('turns', 'mechs') === '≈3 turns to wipe Cats',
  'cats=' + JSON.stringify(prjText('turns', 'cats'))
    + ' mechs=' + JSON.stringify(prjText('turns', 'mechs'))
);

check(
  '50. and the arithmetic behind each figure is on the page as text, both '
    + 'operands and the operator, with nothing to hover and nothing to open',
  prjText('work', 'cats') === '27 health ÷ 3 per turn'
    && prjText('work', 'mechs') === '27 health ÷ 9 per turn',
  'cats=' + JSON.stringify(prjText('work', 'cats'))
    + ' mechs=' + JSON.stringify(prjText('work', 'mechs'))
);

/* PROJ-01 on the page. The DOM-free half proved the model can produce a spread;
   this is the spread ARRIVING on the surface a student looks at. */
A.state.get().build.cats.units
  .map((u) => u.id)
  .forEach((id) => A.ops.setUnitMaxHp('cats', id, 4));
A.state.flush();
const soakNode = prjNode('soak', 'mechs');
check(
  '51. raising every Cat to 4 health makes the mechs panel read a two-bound '
    + 'RANGE on the page, and brings up the line that explains its second bound',
  prjText('turns', 'mechs') === '≈4–6 turns to wipe Cats'
    && prjText('soak', 'mechs') === '54 soaked ÷ 9 per turn with overkill'
    && soakNode !== null && soakNode.hidden === false,
  'figure=' + JSON.stringify(prjText('turns', 'mechs'))
    + ' soak line=' + JSON.stringify(prjText('soak', 'mechs'))
    + ' soak line hidden=' + (soakNode ? soakNode.hidden : '(no node)')
);

/* The singular, mirrored from [S09.8]. Every other figure pinned in this file
   is 3, 4-6, 9 or 12, and one noun spelled once agrees with all of them — which
   is how a hard-coded plural sat on the highest-contrast figure on the board
   without a single row noticing. One is the only quantity whose noun differs,
   and it is reachable through a shipped op, so CI pins it too.

   The ids are snapshotted BEFORE the loop: removeUnit commits structurally and
   the op refuses the last unit, so the slice both avoids that refusal and keeps
   the walk off an array being spliced under it. */
A.ops.resetToDefaults();
A.state.flush();
A.state.get().build.cats.units.slice(1).map((u) => u.id)
  .forEach((id) => A.ops.removeUnit('cats', id));
A.state.flush();
check(
  '52b. one Cat left standing reads as one TURN, not one turns — the noun on '
    + 'the projected figure agrees with the figure. Every other number this '
    + 'file pins is plural, so the plural was free to be hard-coded and was',
  prjText('turns', 'mechs') === '≈1 turn to wipe Cats',
  'figure=' + JSON.stringify(prjText('turns', 'mechs'))
    + ' cats units left=' + A.state.get().build.cats.units.length
);

A.ops.resetToDefaults();
A.state.flush();
A.ops.setFactionAp('cats', 0);
A.state.flush();
const zeroApStrip = stripLeafText().join(' | ');
check(
  '52. a side with nothing to spend reads as WORDS, and neither of the two '
    + 'things a raw division would otherwise have put on a projector appears '
    + 'anywhere in the strip',
  prjText('turns', 'cats') === 'no damage to spend'
    && prjText('work', 'cats') === '0 per turn'
    && zeroApStrip.indexOf('Infinity') === -1
    && zeroApStrip.indexOf('NaN') === -1,
  'figure=' + JSON.stringify(prjText('turns', 'cats'))
    + ' worked=' + JSON.stringify(prjText('work', 'cats'))
    + ' strip text=' + JSON.stringify(zeroApStrip)
);

A.ops.resetToDefaults();
A.state.flush();
const builtBeforeAdd = strip ? strip.dataset.built : '(no strip)';
A.ops.addUnit('mechs');
A.state.flush();
check(
  '53. a structural rebuild leaves the strip standing and its figures moved '
    + 'with the roster — #strip is a child of #board and structure() replaces '
    + 'only the two column interiors, which is a fact about another function '
    + 'and therefore exactly the kind that changes quietly',
  builtBeforeAdd === '1'
    && (strip ? strip.dataset.built : null) === '1'
    && prjText('turns', 'cats') === '≈12 turns to wipe Mechs',
  'built before=' + JSON.stringify(builtBeforeAdd)
    + ' after=' + JSON.stringify(strip ? strip.dataset.built : '(no strip)')
    + ' cats figure=' + JSON.stringify(prjText('turns', 'cats'))
);

A.ops.resetToDefaults();
A.state.flush();

/* --- D-13 held by SHAPE. One panel per side, and no figure without a side. --- */
const prjPanels = strip ? strip.querySelectorAll('.prj-panel[data-side]') : [];
check(
  '54. the strip holds exactly two panels, one per side, with no third box for '
    + 'a figure about both of them',
  prjPanels.length === 2
    && prjPanels.map((p) => p.dataset.side).join(',') === 'cats,mechs',
  'panels=' + prjPanels.length
    + ' sides=' + JSON.stringify(prjPanels.map((p) => p.dataset.side))
);

const prjNums = strip ? strip.querySelectorAll('.num') : [];
const prjOrphans = prjNums.filter((n) => {
  let up = n.parentNode;
  while (up && up !== strip) {
    if (up.dataset && up.dataset.side !== undefined) { return false; }
    up = up.parentNode;
  }
  return true;
});
check(
  '55. and every figure in it sits under a panel naming ONE side. A figure with '
    + 'no side is, by construction, a figure about both sides, which is the '
    + 'comparison the tool never performs. Floored, because a walk that found '
    + 'no figures at all would report no orphans and pass spotlessly',
  prjNums.length >= 6 && prjOrphans.length === 0,
  'figures=' + prjNums.length + ' (floor 6) without a sided ancestor='
    + prjOrphans.length
);

const prjStyled = [];
(function walkForStyle(n) {
  if (!n) { return; }
  n.children.forEach((c) => {
    if (c.getAttribute && c.getAttribute('style') !== null) { prjStyled.push(c.className); }
    walkForStyle(c);
  });
})(strip);
check(
  '56. nothing in the strip carries an inline style attribute',
  prjStyled.length === 0,
  'nodes carrying one: ' + JSON.stringify(prjStyled)
);

/* 56b. The four rules [S06.3] and [S06.4] each state at length as SILENT
   failure modes, mirrored into CI. Until this row every one of them was held
   by prose alone — and prose is the exact instrument this file refuses to
   trust one paragraph away, where [S09.8] says of D-13 that it asserts the
   shape rather than trusting the note.

   Each is a rule about what must NOT be on a node, so it cannot be broken by
   deleting code, only by adding one key to an object literal — and the cost
   of adding it is invisible. A data-k in either region steals keyed()'s first
   document match, and since #strip sits ahead of #col-mechs in document order
   it takes the focus restore for the whole Mechs column with it. A data-amt,
   or a .brd-value for sync()'s value pass to find, paints a confident zero
   over the copy. A .brd-line--opt is pinned shut by the hide pass for good.

   Walked rather than selected, for the reason 63b is walked: the walk is
   about the page and not about this file's selector engine, and it reads
   dataset, which is what setData actually writes. The walk starts AT each
   region so the region's own node is in scope; `built` is deliberately not in
   the key list, because that flag is the bookkeeping both banners call for. */
const boardRuleBreaks = [];
['strip', 'refband'].forEach((id) => {
  const region = dom.byId[id];
  if (!region) { boardRuleBreaks.push(id + ': the region is missing'); return; }
  (function walk(n) {
    ['k', 'amt', 'lbl', 'albl'].forEach((key) => {
      if (n.dataset && n.dataset[key] !== undefined) {
        boardRuleBreaks.push(id + '/' + n.className + ': data-' + key);
      }
    });
    if (typeof n.className === 'string' && n !== region) {
      if (n.className.indexOf('brd-value') !== -1) {
        boardRuleBreaks.push(id + '/' + n.className + ': brd-value');
      }
      if (n.className.indexOf('brd-line--opt') !== -1) {
        boardRuleBreaks.push(id + '/' + n.className + ': brd-line--opt');
      }
    }
    n.children.forEach(walk);
  })(region);
});
const stripBuilt = dom.byId['strip'] ? dom.byId['strip'].children.length : 0;
const bandBuilt = dom.byId['refband'] ? dom.byId['refband'].children.length : 0;
check(
  '56b. neither region this phase appended to #board carries any of the four '
    + 'things sync() and keyed() act on. Each is a silent failure mode both '
    + 'banners spell out at length, and each was held by that comment and by '
    + 'nothing else. Floored on both regions being built, because a walk over '
    + 'two empty nodes finds nothing and passes spotlessly',
  stripBuilt > 0 && bandBuilt > 0 && boardRuleBreaks.length === 0,
  'strip children=' + stripBuilt + ' refband children=' + bandBuilt
    + ' rules broken: ' + JSON.stringify(boardRuleBreaks)
);

const styleAccesses = html.split('.style').length - 1;
check(
  '57. and .style appears exactly once in the whole artifact, which is the '
    + 'topbar measurement. A proportional bar, a shared scale and a midpoint '
    + 'marker each need an inline length or a per-frame custom property, and '
    + 'both of those are that one access — so this count is the cheapest '
    + 'available proof that none of the three exists anywhere on the page',
  styleAccesses === 1,
  'occurrences: ' + styleAccesses
);

A.state.restore(prjSaved);
A.state.flush();

/* --- 58 to 63. The reference material, plan 03-05's half of the gate --------
       [S09.9] in the artifact asserts all of this and more against a page, but
       it is SKIPPED in a terminal run — the suites are executed at section 3,
       in a sandbox with no document, long before the stub page below exists.
       So the rows CI actually runs are these, and they are the ones that have
       to bite. Same reasoning [S09.8] and checks 49-57 were written under.

       Every drive is bracketed: the whole state is recorded here and handed
       back at the end, so Layer C's walk below reads the same page it has
       always read. --- */
const refSaved = JSON.stringify(A.state.get());
A.ops.resetToDefaults();
A.state.flush();

const refBand = dom.byId['refband'];

function refTexts(nodes) {
  return nodes.map((n) => n.textContent);
}
function refBandLines() {
  return refBand ? refBand.querySelectorAll('.ref-beats') : [];
}
function refCards(side) {
  const col = dom.byId['col-' + side];
  return col ? col.querySelectorAll('.ref-card') : [];
}
function refCardNamed(side, actionName) {
  return refCards(side).filter((c) => {
    const head = c.querySelectorAll('.ref-action')[0];
    return head && head.textContent === actionName;
  })[0] || null;
}
function refActionName(id) {
  let name = '(no such action: ' + id + ')';
  ['cats', 'mechs'].forEach((side) => {
    A.data.DEFAULTS[side].actions.forEach((action) => {
      if (action.id === id) { name = action.name; }
    });
  });
  return name;
}

/* REF-01. The sentences are checked TWICE and against two different things,
   because they can break two ways: assembled from DEFAULTS here, so a renderer
   that hand-typed them goes red; and written out as the approved wording, so a
   change to the DATA the renderer faithfully followed goes red as well. The
   count is pinned at two rather than left open — the board was transcribed with
   three relationships and the intra-Mechs one was left OUT on instruction, so
   restoring it should be a decision somebody makes rather than a diff nobody
   notices. */
const refAssembled = A.data.REFERENCE.beats.map(
  (rec) => refActionName(rec.over) + ' ' + rec.verb + ' ' + refActionName(rec.under)
);
const refHeadNode = refBand ? refBand.querySelectorAll('.ref-band-head')[0] : null;
check(
  '58. the band below both columns is built, carries the heading this feature '
    + 'is forced to use because it may not be named after itself, and states '
    + 'TWO relationships — both as the data assembles them and as the approved '
    + 'wording reads',
  refBand !== null
    && refBand.dataset.built === '1'
    && refBand.hidden !== true
    && (refHeadNode ? refHeadNode.textContent : null) === 'What beats what'
    && refBandLines().length === 2
    && refTexts(refBandLines()).join(' | ') === refAssembled.join(' | ')
    && refTexts(refBandLines()).join(' | ') === 'Fly beats Slash | Lasers beat Hairball',
  'built=' + JSON.stringify(refBand ? refBand.dataset.built : '(no node)')
    + ' heading=' + JSON.stringify(refHeadNode ? refHeadNode.textContent : '(no node)')
    + ' lines=' + JSON.stringify(refTexts(refBandLines()))
    + ' assembled=' + JSON.stringify(refAssembled)
);

check(
  '59. each faction column carries one action card per action of its own '
    + 'faction, naming that action — the cards are IN the columns, which is '
    + 'what lets an effect attach to the action that carries it',
  refCards('cats').length === 3
    && refCards('mechs').length === 3
    && refTexts(refCards('cats').map((c) => c.querySelectorAll('.ref-action')[0])).join(',')
      === 'Slash,Hairball,Screech'
    && refTexts(refCards('mechs').map((c) => c.querySelectorAll('.ref-action')[0])).join(',')
      === 'Fly,Lasers,Recharge',
  'cats=' + JSON.stringify(refTexts(refCards('cats').map((c) => c.querySelectorAll('.ref-action')[0])))
    + ' mechs=' + JSON.stringify(refTexts(refCards('mechs').map((c) => c.querySelectorAll('.ref-action')[0])))
);

/* REF-02 IN BOTH DIRECTIONS, on the rendered page. Data can be complete while
   the renderer drops half of it, and a renderer can paint a card the data never
   described; those are different defects and neither row catches the other's.
   Floored first, for the reason check 47's harvest is floored — a walk that
   found no cards would report no gaps in either direction and pass twice over. */
const refMissing = [];
const refUnknown = [];
const refNames = A.data.REFERENCE.effects.map((r) => r.name);
let refPainted = 0;
['cats', 'mechs'].forEach((side) => {
  A.data.DEFAULTS[side].actions.forEach((action) => {
    const card = refCardNamed(side, action.name);
    const chips = card ? refTexts(card.querySelectorAll('.ref-effect')) : [];
    refPainted += chips.length;
    action.keywords.forEach((id) => {
      const rec = A.data.REFERENCE.effects.filter((r) => r.id === id)[0];
      if (!rec || chips.indexOf(rec.name) === -1) { refMissing.push(action.id + '/' + id); }
    });
    chips.forEach((name) => {
      if (refNames.indexOf(name) === -1) { refUnknown.push(action.id + '/' + name); }
    });
  });
});
check(
  '60. REF-02 both ways at once — every keyword an action carries has a card '
    + 'inside THAT action\'s card, and every card on the page names an entry in '
    + 'the data, so a card built from a literal fails the second half',
  refPainted >= 5 && refMissing.length === 0 && refUnknown.length === 0,
  'cards painted=' + refPainted + ' (floor 5) missing from the page='
    + JSON.stringify(refMissing) + ' painted but not in the data='
    + JSON.stringify(refUnknown)
);

/* T-03-20, driven rather than read. The keyword id shield and the token id
   shield are the same string in two different objects.

   READ THIS BEFORE SIMPLIFYING IT. The card is checked after a rename TWICE,
   and the second read is the one that does the work. A rename is a plain
   commit, so it runs sync() and NOT structure(); the cards are built by
   buildColumn, which only structure() calls, and they carry no attribute the
   sync pass writes. So a rename alone can never repaint a card whatever the
   builder does — and a row that stopped after the first read would pass just
   as happily on a builder that called the label reader at BUILD time, which is
   precisely the drift this row exists to catch. It was measured passing on
   exactly that mutation before the structural read was added.

   So: rename, read (that covers sync-time drift), then force a structural
   rebuild while the rename is still in force and read again (that covers
   build-time drift). The board's own shield row is read as well, because if
   the rename never landed at all then "the card did not change" would be true
   for entirely the wrong reason. */
A.ops.renameTokenType('shield', 'Barrier');
A.state.flush();
const refRecharge = refCardNamed('mechs', 'Recharge');
const refChipsAfterSync = refRecharge
  ? refTexts(refRecharge.querySelectorAll('.ref-effect')).join(',') : '(no card)';
const refBoardLabel = stub.querySelector('[data-lbl="shield"]');
A.ops.addUnit('mechs');          // structural: buildColumn runs again, under the rename
A.state.flush();
const refRebuilt = refCardNamed('mechs', 'Recharge');
const refChipsAfterRebuild = refRebuilt
  ? refTexts(refRebuilt.querySelectorAll('.ref-effect')).join(',') : '(no card)';
check(
  '61. renaming the Shield TOKEN to Barrier leaves the Recharge KEYWORD card '
    + 'reading Shield — after the sync the rename triggers AND after a '
    + 'structural rebuild that re-runs the builder — while the board\'s own '
    + 'shield row does read Barrier. A student renaming a resource has not '
    + 'renamed a rule',
  refChipsAfterSync === 'Shield'
    && refChipsAfterRebuild === 'Shield'
    && refBoardLabel !== null && refBoardLabel.textContent === 'Barrier',
  'card after sync=' + JSON.stringify(refChipsAfterSync)
    + ' card after structural rebuild=' + JSON.stringify(refChipsAfterRebuild)
    + ' board shield row=' + JSON.stringify(refBoardLabel ? refBoardLabel.textContent : '(no node)')
);

/* REF-03 pre-satisfied, and asserted rather than assumed. The cards are
   appended OUTSIDE buildColumn's setup-only branch. The Add-button half is what
   makes this a statement about the branch: without it the row would pass on a
   board where startFight() had quietly done nothing at all. */
A.ops.resetToDefaults();
A.state.flush();
A.ops.startFight();
A.state.flush();
check(
  '62. starting a fight leaves every action card on the page while the '
    + 'setup-only Add button goes away — Phase 5\'s REF-03 is pre-satisfied by '
    + 'where the append sits, and this is the row that says so',
  refCards('cats').length === 3
    && refCards('mechs').length === 3
    && stub.querySelectorAll('.brd-add').length === 0,
  'cats cards=' + refCards('cats').length + ' mechs cards=' + refCards('mechs').length
    + ' add buttons=' + stub.querySelectorAll('.brd-add').length
);

A.state.restore(refSaved);
A.state.flush();

/* A SOURCE-LEVEL row, and the honest description of what it is: a heuristic
   against drift, not a proof against a determined author — the register the
   FORBIDDEN scan uses about itself.

   It reads the card builder's region out of the document between its #region
   markers and STRIPS THE COMMENTS before searching. That is the whole point of
   the row rather than a detail of it. The label reader's rule has to be
   written down in the comment in BOTH directions, because half of it is the
   opposite of the other half and a reader who learns only one will "fix" the
   other; a plain grep over the region would therefore be a grep that can never
   return zero, and a check that can never pass is not a check. Stripping the
   comments makes the row about the CODE, which is where the rule actually has
   to hold. Same finding as checks 56 and 57: what a source count catches and
   what a walk catches are not the same surface.

   The marker pair is floored too — a rename of either marker would slice an
   empty string, and an empty string contains nothing at all. */
function stripComments(src) {
  let out = '';
  let i = 0;
  let quote = null;
  while (i < src.length) {
    const c = src[i];
    const d = src[i + 1];
    if (quote) {
      if (c === '\\') { out += c + (d || ''); i += 2; continue; }
      if (c === quote) { quote = null; }
      out += c; i++; continue;
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; out += c; i++; continue; }
    if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') { i++; } continue; }
    if (c === '/' && d === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) { i++; }
      i += 2; continue;
    }
    out += c; i++;
  }
  return out;
}

const REF_OPEN = '// #region [S06.1] the reference cards';
const REF_CLOSE = '// #endregion [S06.1] the reference cards';
const refOpenAt = html.indexOf(REF_OPEN);
const refCloseAt = html.indexOf(REF_CLOSE);
const refRegionCode = (refOpenAt !== -1 && refCloseAt > refOpenAt)
  ? stripComments(html.slice(refOpenAt, refCloseAt)) : '';
/* Only the two words the artifact actually SPELLS. `data-act` and `data-k`
   used to sit in this list and could never have fired: the artifact never
   writes either literal in its JavaScript. Attributes are written through
   setData(node, { act: ..., k: ... }), which builds the attribute name from a
   dataset key, so the only spelling a real regression can take was invisible
   to a source scan — two list entries that read as protection and were not.
   Check 63b below asserts the built page instead, which no spelling can
   evade. `labelFor` and `createElementNS` stay here because they ARE spelled,
   and a source scan is the right instrument for a spelled thing. */
const refBanned = ['labelFor', 'createElementNS']
  .filter((w) => refRegionCode.indexOf(w) !== -1);
check(
  '63. the card builder\'s CODE calls no label reader and builds no namespaced '
    + 'element — read between the region markers with the comments stripped, '
    + 'because the comment has to state the label rule by name and a raw grep '
    + 'could never pass',
  refRegionCode.length > 400 && refBanned.length === 0,
  'code-only region ' + refRegionCode.length + ' chars (floor 400); found: '
    + JSON.stringify(refBanned)
);

/* 63b. The same rule, asserted against the RENDERED page. This is the half
   check 63 could not carry, and the register checks 56 and 60 already use: a
   walk over what was built cannot be evaded by a spelling, so it holds for
   setData, for a direct dataset write and for a setAttribute alike.

   The five keys are the whole dispatch and sync surface: `act` is what [S07]
   routes a press on, `k` is what keyed() matches and would steal the first
   hit for, `amt` is what sync()'s value pass writes a number into, and `lbl`
   and `albl` are what its label and aria-label passes own the text of. A
   reference card carrying any one of them is a card the rest of the machine
   believes is a control.

   Read through `dataset` rather than through a selector on purpose: dataset
   is what setData actually writes, so this reads the same surface the artifact
   wrote rather than trusting the stub's selector engine, which understands a
   class and a [data-*] test and nothing else.

   Floored on the card count for the reason check 55 is floored: a walk that
   found no cards would find no attributes and pass spotlessly. */
const refAttrDrift = [];
['cats', 'mechs'].forEach((side) => {
  refCards(side).forEach((card) => {
    (function walk(n) {
      ['act', 'k', 'amt', 'lbl', 'albl'].forEach((key) => {
        if (n.dataset && n.dataset[key] !== undefined) {
          refAttrDrift.push(String(n.className) + '/' + key);
        }
      });
      n.children.forEach(walk);
    })(card);
  });
});
check(
  '63b. and no reference card ON THE PAGE — the card or anything under it — '
    + 'carries an attribute the interaction layer dispatches on or the sync '
    + 'pass writes. The source scan above cannot see setData(node, { act: … }), '
    + 'which is the only spelling this file uses, so a card that silently '
    + 'became a live stepper passed every check in this repo',
  refCards('cats').length === 3 && refCards('mechs').length === 3
    && refAttrDrift.length === 0,
  'cats cards=' + refCards('cats').length
    + ' mechs cards=' + refCards('mechs').length
    + ' attributes found: ' + JSON.stringify(refAttrDrift)
);

A.state.restore(refSaved);
A.state.flush();

/* --- Layer C of the PROJ-06 gate: the rendered page ---------------------------
       Layers A and B, up at the top of this file, read the SOURCE. This one
       reads the PAGE, for two reasons. The roadmap's criterion is written about
       reading the rendered artifact top to bottom and finding no judgement on
       it, which is a statement about output. And a sentence assembled at render
       time out of fragments no single literal contains passes both source
       layers while failing the requirement outright.

       The walk collects the textContent of every LEAF node under #app plus the
       aria-label, title and placeholder of every node it passes. Leaves are the
       exact set rather than an approximation: the stub's textContent is a plain
       own property, not a concatenation computed over descendants, so a parent
       carries no copy of its children's words and collecting parents too would
       add nothing while risking nothing being missed either way.

       The recursion shape is lifted from allIntegers in [S09.1] — scalar case
       first, then recurse into children — rather than invented here.

       ALLOC-10 lets a student name a token type anything they like, and a
       student who names one `Winner` must not redden CI. The requirement is
       about what the ARTIFACT says, not about what a student typed into their
       own build. So the two attributes through which a student's word reaches
       the page are excluded at exactly the place it lands: sync() writes
       [data-lbl] nodes' text from labelFor, and [data-albl] nodes' aria-label
       from the same call, so the first is skipped for text and the second for
       aria-label. Each is skipped only for the channel labelFor actually
       writes, so a static title on a relabelled node is still read. */
A.state.flush();

const renderedText = [];
const LABEL_ATTRS = ['aria-label', 'title', 'placeholder'];

(function harvest(node) {
  if (!node) { return; }
  if (node.children.length === 0
    && typeof node.textContent === 'string' && node.textContent !== ''
    && !('lbl' in node.dataset)) {
    renderedText.push(node.textContent);
  }
  LABEL_ATTRS.forEach((attr) => {
    if (attr === 'aria-label' && ('albl' in node.dataset)) { return; }
    const value = node.getAttribute ? node.getAttribute(attr) : null;
    if (typeof value === 'string' && value !== '') { renderedText.push(value); }
  });
  node.children.forEach(harvest);
})(dom.byId['app']);

const RENDERED_VERDICT_WORDS = VERDICT_WORDS.concat(VERDICT_LITERAL_WORDS);
const renderedHits = [];
renderedText.forEach((s) => {
  RENDERED_VERDICT_WORDS.forEach((rule) => {
    if (rule.re.test(s)) {
      renderedHits.push('[' + rule.label + '] in ' + JSON.stringify(s));
    }
  });
});

// A walk that silently collects nothing would report a spotlessly clean page
// forever. That is precisely the defect KNOWN_IDS carried before section 5b
// existed: a gate failing in the direction of green. So the harvest is floored
// rather than merely searched, and the number is printed on a clean run as well
// as a failing one, because a baseline nobody can read is a baseline nobody
// notices collapsing.
console.log('scan: ' + renderedText.length + ' rendered strings read from #app (Layer C, '
  + RENDERED_VERDICT_WORDS.length + ' words)');

// THIS FLOOR IS RE-MEASURED EVERY TIME THE PAGE GROWS, and the history is kept
// so the next plan to touch it inherits data rather than a bare constant.
//   plan 03-01 shipped 100 against a measurement of 102 — a margin of two, and
//     it flagged that margin in its own summary as too thin to survive a roster
//     edit;
//   plan 03-03's projection strip took the harvest to 115 and the floor to 105;
//   plan 03-05's reference band and action cards take it to 135, and the floor
//     to 125.
//
// 125 is chosen against four measurements, taken this session, rather than
// picked. The shipped board harvests 135 here and 131 on a board with no gate
// drives behind it; a board shrunk to one unit a side harvests 61; and each
// unit card is worth 7 strings, measured by adding three Mechs and watching 131
// become 152. So 125 leaves more than one unit card of headroom against a
// legitimate change to the shipped roster, while sitting far above the zero a
// walk reading the wrong node would report.
//
// The strip's 13 strings and the reference material's 20 — three in the band,
// seventeen across the six action cards — are roster-INdependent, and every one
// of them is separately pinned by checks 49-55 and 58-60, which assert them by
// name. This floor is only ever about the walk still reaching the page.
check(
  '47. the rendered-page walk actually reaches the page, so a clean result is a '
    + 'read page rather than an empty one',
  renderedText.length > 125,
  'harvested ' + renderedText.length + ' strings from #app; the floor is 125'
);

check(
  '48. PROJ-06 — nothing on the rendered page judges a build, and a student who '
    + 'names their own type after a comparative word does not trip it',
  renderedHits.length === 0,
  renderedHits.length === 0
    ? 'clean across ' + renderedText.length + ' rendered strings'
    : renderedHits.join(' | ')
);

/* --- WHAT THIS GATE CANNOT REACH, named rather than left to be discovered.
       There is no browser and no layout engine in this repo, and the stub page
       is a hand-made stand-in rather than a parser. Four behaviours of the
       authoring surface therefore have no check above and are carried to the
       phase's closing rehearsal instead:

         1. The dialog declining a close request. Escape inside the name field
            must put the recorded text back and leave the picker OPEN. The stub
            <dialog> has .open, showModal() and close() and no close-request
            behaviour at all, so the listener that declines one cannot be
            driven here. Check 37 covers the revert half and only that half.
         2. The hide pass actually collapsing a line. Check 32 asserts the
            .hidden PROPERTY, which is the artifact's decision; whether the
            line then takes no space is a cascade question, and there is no
            layout engine here to answer it.
         3. maxlength on a real input. It is ergonomic only — it stops a
            student typing past the cap — and it counts UTF-16 units while the
            op counts code points, so the two legitimately disagree for an
            emoji name. Check 38 covers the code-point cut, which is the guard.
         4. Whether eleven rows of the type list are legible on a projector.
            That is an empirical question a rehearsal answers and nothing else
            does.
         5. Any words Layer C's page does not currently show. The walk reads
            #app as the stub page renders it in setup mode, so a string that
            appears only once the fight has started, or only inside an open
            dialog, is outside its reach until that surface is built and the
            walk is pointed at it. The same goes for the static markup of the
            shell: the stub is a hand-made stand-in and not a parser, so text
            written directly into the HTML is empty here and only the text the
            artifact renders is read. Layers A and B still read all of those in
            the source; it is only the assembled-at-render case that waits.
         6. Whether the strip's content still STICKS on a short viewport. Its
            reserved minimum height is gone and the content sets the height now,
            and a sticky box taller than the space between the bar and the
            bottom of the window behaves as though it were not sticky for the
            part that does not fit. There is no layout engine here to measure it.
         7. Whether the three characters the projection prints — the almost-equal
            sign, the division sign and the en dash — reach a screen as glyphs
            rather than as replacement boxes in the shipped font stack. Checks
            49 to 52 assert the code points; only a display asserts the glyphs.
         8. Whether a four-digit turn count is legible from the back of a room at
            .brd-value's 24px. The figure is SIZED for four digits, which is an
            arithmetic claim about the widest realistic roster and not a claim
            about anybody's eyes. Same rehearsal, same afternoon.
         9. Whether a column holding a faction head, up to twenty-four unit
            cards, an Add button and three action cards still fits a laptop
            viewport, and whether the band underneath is reachable without a
            scroll that leaves it unseen. The columns grew this phase and
            nothing here measures height.
        10. Whether the band's two sentences are legible from the back of a
            room at 24px. Check 58 asserts the characters; only a display
            asserts that anybody can read them.
        11. Whether the strip still STICKS now that the content beside it is
            taller. Entry 6 named this before the columns grew; the columns
            have now grown, so the same unanswered question is worth more.
            Still no layout engine here to answer it. --- */

console.log(
  'interaction gate: ' + (gateChecks - gateFailures.length) + ' of ' + gateChecks
    + ' checks passed'
);

if (gateFailures.length > 0) {
  fail('INTERACTION GATE: ' + gateFailures.length + ' check(s) failed — '
    + gateFailures.join('; '));
}

process.exit(result.failed ? 1 : 0);
