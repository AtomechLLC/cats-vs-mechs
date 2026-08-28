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
//     #err-panel and the STATIC text of a dialog. (Layer C harvested #app alone
//     when this paragraph was written; plan 03.1-01 pointed it at the dialog
//     roots too, but only for text the artifact RENDERS -- the stub page is a
//     hand-made stand-in rather than a parser, so text written directly into
//     the markup is empty there.) A verdict feature
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
// takes. It does NOT catch a string built by concatenation, a value arriving
// through a ${...} substitution, or text assembled at render time -- that is
// Layer C's job. It also cannot see the CSS or the markup outside the script
// block, which Layer A already reads in full.
//
// Backticks ARE read, as of this row. They were not, and that was a hole
// rather than a scope decision: this layer is the ONLY one that scans code for
// `score`, `grade`, `judgement`, `rank`, `ahead`, `wins`, `win`, `edge`,
// `lead` and `worse` -- Layer A deliberately excludes them so the file can
// discuss its own rule -- so a backtick string carrying one of those passed
// Layer A because it is not on that list and passed Layer B because it was
// never extracted. Layer C would have caught it only if that particular string
// reached #app on the stub page in setup mode, which the closing note down in
// Layer C lists five reasons it might not.
//
// A template literal with no substitution IS a plain literal and has to be
// read as one. One WITH a substitution is read for its static halves, which is
// strictly more than not reading it at all.
//
// The backtick arm deliberately does NOT exclude newlines, because a real
// template literal may span lines and excluding them would silently truncate
// the one thing this arm exists to read.
//
// Measured before shipping, because an extractor that swallows more than it
// should is the same kind of silent shrink the floor below exists to catch:
// the artifact uses no template literal in code today and all 192 backticks
// sit in comments, paired, none spanning a line. Adding the arm takes the
// count from 2466 to 2555, of which 94 are backtick-delimited. Five
// single-quoted literals stop being extracted separately -- every one of them
// a duplicate occurrence sitting INSIDE a comment's backtick span, such as
// `default: throw new Error('Unknown op: ' + act)`, which is itself scanned as
// one chunk. So the swallowed text is still read; it is read as a larger
// string. No word coverage is given up.
//
// The extraction is escape-aware so a literal containing \' does not truncate
// and leave the rest of the file misparsed as code. The count is printed on a
// clean run and floored below, because the failure mode of a broken extractor
// is not a red run -- it is a green one that scanned nothing, which is exactly
// the vacuous pass the stub-drift gate was added to close.
const STRING_LITERAL =
  /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g;
const literals = match[1].match(STRING_LITERAL) || [];

// The floor moves with the extractor. It was 1500 against a measured 2466 when
// this layer read two quote characters; the backtick arm takes the measurement
// to 2555, so 2000 keeps the same job -- catching an extractor that silently
// scans nothing or nearly nothing -- with room for a legitimate deletion.
if (literals.length < 2000) {
  fail('Layer B extracted only ' + literals.length + ' string literals from the ' +
    'script block. The artifact carries well over 2000, so this is a broken ' +
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

// THE TOTAL IS ASSERTED, NOT ONLY THE FAILURE COUNT, and plan 03.1-07 adds this
// because `failed === 0` is green over a suite that never ran. A suite whose
// body throws costs ONE failing record and loses every row after the throw —
// and a suite whose registration was deleted, renamed or bracketed on a
// condition that stopped holding costs no record at all and reports a
// spotlessly clean run with a smaller number nobody was reading. The CONTEXT
// for this phase names that failure directly: "assert the TOTAL, not just
// failed === 0."
//
// This is the DOM-FREE total, which is what this harness produces — it loads
// the script into a sandbox with no document, so every row bracketed on one is
// skipped here. The full figure with a DOM is larger and is measured
// separately; the floor below bounds THIS run.
//
// History, kept so the next plan to move it inherits data rather than a bare
// constant:
//   plan 03.1-03 opened the action-authoring suite at 412 rows in this run;
//   plan 03.1-06 took it to 786;
//   plan 03.1-07 takes it to 789 and floors it at 760 — a margin of 29, which
//     is more than any single row group this phase added and far above the
//     zero a suite that failed to register would report.
const SUITE_FLOOR = 760;
if (result.passed < SUITE_FLOOR) {
  fail('SUITE TOTAL COLLAPSED: ' + result.passed + ' rows passed against a floor of '
    + SUITE_FLOOR + '. Nothing failed, which means rows went MISSING rather than red '
    + '— a suite that threw, or one that stopped registering.');
}

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
    'refband',
    // plan 03.1-04 — ACT-07's line beside Remove, saying which actions name
    // the open type before it is taken away. Same rule as every entry above:
    // the id, this entry and the stub node arrive together or the run fails in
    // one direction or the other.
    'tok-pick-names',
    // plan 03.1-05 — the action editor (ACT-01). One dialog with two panes:
    // the authoring pane below, and a proposal pane that is reserved, empty and
    // hidden until plan 03.1-07 fills it. The topbar label beside it is the
    // second PERMANENT, BOUNDED button on the bar, and the shell comment on it
    // says out loud that it is not the row Phase 2.1 collapsed.
    //
    // Every entry here obeys the rule the whole list obeys: the id, this entry
    // and the stub node arrive together, and — new since plan 03.1-01 — a
    // <dialog> also needs its DIALOG_ROOTS entry or the run fails at 47b.
    'actedit-label',
    'act-edit', 'act-edit-pane-author', 'act-edit-title',
    'act-edit-sides-label', 'act-edit-side-cats', 'act-edit-side-mechs',
    'act-edit-list-label', 'act-edit-list',
    'act-edit-new', 'act-edit-remove',
    'act-edit-name-label', 'act-edit-name',
    // The reserved term rows. They are static in the shell for the reason the
    // name field is static — plan 03.1-06 puts a number in each, and a number
    // half-typed is what a rebuilt row throws away — so they are static here
    // too. Their COUNT is asserted against App.data.MAX_ACTION_REQ and
    // App.data.MAX_ACTION_XF further down, because a hand-written row count and
    // a constant that can move are two places for one number to live.
    'act-edit-terms', 'act-edit-cost', 'act-edit-cost-amt',
    'act-edit-req-0', 'act-edit-req-0-amt',
    'act-edit-req-1', 'act-edit-req-1-amt',
    'act-edit-xf-0', 'act-edit-xf-0-amt',
    'act-edit-xf-1', 'act-edit-xf-1-amt',
    'act-edit-done',
    // plan 03.1-07 — the proposal pane, and the button on the authoring pane
    // that switches to it. Reserved empty by plan 03.1-05 and filled here.
    //
    // Every static row inside it is built below for the reason the term rows
    // are: they are static markup in the shell so a half-typed number survives
    // the per-frame repaint, so they are static here too, and their COUNT is
    // asserted against App.data.MAX_ACTION_XF rather than hand-written twice.
    // The amount fields carry .ae-prop-amt and NOT .ae-amt — one class name is
    // the whole distance between a field that proposes and a field that
    // dispatches an op, and a typo here would be a green run over a pane
    // nothing is listening to.
    'act-edit-propose', 'act-prop-open',
    'act-prop-title', 'act-prop-refuse', 'act-prop-says',
    'act-prop-caster-label', 'act-prop-target-label',
    'act-prop-cost', 'act-prop-reqs',
    'act-prop-rows', 'act-prop-close'
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
  // plan 03.1-05's one new topbar control. The shell comment beside it records
  // that this is a second PERMANENT, BOUNDED button rather than the row Phase
  // 2.1 collapsed; here it is one more entry, spelled from the markup.
  topbar.appendChild(idNode('actedit-label', 'span'));
  topbarButton('act', 'openActionEditor', null);

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

  // ACT-07's line beside Remove. Empty and hidden in the shell and here, with
  // the action-name marker on it, because [S06.2] writes a student's words into
  // it and the rendered-page walk must skip its text for the same reason it
  // skips a token type's label. The class matters: [C07] hides it while it is
  // empty, and a check reading it selects on the class rather than on a
  // structure this stub does not reproduce.
  const namesLine = idNode('tok-pick-names', 'p');
  namesLine.className = 'pk-warn';
  namesLine.dataset.anm = '';
  namesLine.hidden = true;
  picker.appendChild(namesLine);

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

  /* ---- plan 03.1-05's action editor, hand-made from the static markup ------
     Exactly the three members beyond a plain element the picker above has, and
     no more: .open, showModal() and close(), the last dispatching the `close`
     event the focus hand-back is bound to. [S07.3]'s editorDialog() probes for
     a close() FUNCTION before it will do anything, so a plain div here would
     keep the whole editor path skipped — the precise state the picker was in
     before this stub was written, with gate checks reporting green over a
     handler that bailed out on its second line.

     EVERY DATASET SPELLING BELOW IS COPIED FROM THE SHELL. A typo here is not
     a red run: it is a green one, over a control nothing is listening to. The
     same goes for the classes — [S07.3] tells the name field apart by .ae-name
     exactly as [S07.2] tells .pk-name apart, so without it every keystroke,
     Enter, Escape and blur handler declines on its first line. */
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

  const authorPane = idNode('act-edit-pane-author');
  editor.appendChild(authorPane);
  authorPane.appendChild(idNode('act-edit-title', 'h2'));

  // The side chooser. Two static buttons, each holding a name node [S06.5]
  // writes on every repaint and a tick the class hides until the side is live.
  const sideGroup = createElement('div');
  authorPane.appendChild(sideGroup);
  sideGroup.appendChild(idNode('act-edit-sides-label', 'h3'));
  [['act-edit-side-cats', 'cats'], ['act-edit-side-mechs', 'mechs']].forEach(([id, side]) => {
    const b = idNode(id, 'button');
    b.className = 'ae-side';
    b.dataset.act = 'selectActionSide';
    b.dataset.edSide = side;
    b.dataset.k = 'ae/side/' + side;
    const nameNode = createElement('span');
    nameNode.className = 'ae-side-name';
    b.appendChild(nameNode);
    const tick = createElement('span');
    tick.className = 'ae-check';
    tick.textContent = '✓';
    b.appendChild(tick);
    sideGroup.appendChild(b);
  });

  // The list of every action on the chosen side, empty exactly as it ships:
  // its rows come from the LIVE build slice at render time, which is what makes
  // an action a student authored appear in it with no second tier (D-07).
  const aeListGroup = createElement('div');
  authorPane.appendChild(aeListGroup);
  aeListGroup.appendChild(idNode('act-edit-list-label', 'h3'));
  aeListGroup.appendChild(idNode('act-edit-list'));

  const aeNewRow = createElement('div');
  authorPane.appendChild(aeNewRow);
  [
    ['act-edit-new', 'createAction', 'ae/new'],
    ['act-edit-remove', 'removeAction', 'ae/remove']
  ].forEach(([id, act, k]) => {
    const b = idNode(id, 'button');
    b.dataset.act = act;
    b.dataset.k = k;
    aeNewRow.appendChild(b);
  });

  const aeNameGroup = createElement('div');
  authorPane.appendChild(aeNameGroup);
  aeNameGroup.appendChild(idNode('act-edit-name-label', 'h3'));
  const aeName = idNode('act-edit-name', 'input');
  aeName.type = 'text';
  aeName.className = 'ae-name';
  aeName.dataset.k = 'ae/name';
  aeNameGroup.appendChild(aeName);

  /* ---- plan 03.1-06's term rows (ACT-02, ACT-03, ACT-04) ------------------
     No longer hidden as a block: plan 03.1-05 reserved it and plan 03.1-06
     fills it. Every row is STATIC here exactly as it is in the shell, and so is
     the amount field inside it — a rebuilt field throws away a half-typed
     number, which is the whole reason [S06.5] writes into these rather than
     building them.

     EVERY CLASS AND EVERY DATASET SPELLING IS COPIED FROM THE SHELL, and the
     amount field's class is the load-bearing one: [S07.3] tells an amount field
     apart by .ae-amt exactly as it tells the name field apart by .ae-name, so
     without it every keystroke, Enter, Escape and blur handler declines on its
     first line and a gate check driving them reads green over a field nothing
     is listening to. The two chooser boxes are found by class from inside the
     row, so they are classed rather than given ids of their own — the id budget
     is a line in this file per entry, and five amount fields was the whole of
     what a term row genuinely needs to be reachable by. */
  const aeTerms = idNode('act-edit-terms');
  aeTerms.className = 'ae-terms';
  authorPane.appendChild(aeTerms);

  function aeTermRow(id, field, slot, withWho) {
    const row = idNode(id);
    row.className = 'ae-term';
    if (field !== 'cost') { row.hidden = true; }
    if (withWho) {
      const who = createElement('div');
      who.className = 'ae-term-who';
      row.appendChild(who);
    } else {
      const lbl = createElement('span');
      lbl.className = 'ae-term-lbl';
      row.appendChild(lbl);
    }
    const toks = createElement('div');
    toks.className = 'ae-term-toks';
    row.appendChild(toks);
    const amt = idNode(id + '-amt', 'input');
    amt.type = 'text';
    amt.className = 'ae-amt';
    amt.dataset.aeField = field;
    amt.dataset.aeSlot = String(slot);
    amt.dataset.k = 'ae/amt/' + field + '/' + slot;
    row.appendChild(amt);
    aeTerms.appendChild(row);
    return row;
  }

  aeTermRow('act-edit-cost', 'cost', 0, false);
  aeTermRow('act-edit-req-0', 'req', 0, false);
  aeTermRow('act-edit-req-1', 'req', 1, false);
  aeTermRow('act-edit-xf-0', 'xf', 0, true);
  aeTermRow('act-edit-xf-1', 'xf', 1, true);

  const aeActions = createElement('div');
  authorPane.appendChild(aeActions);
  // plan 03.1-07's pane switch. data-ap and NOT data-act: it is page work with
  // no op behind it, and the proposal pane's own delegated listener is what
  // reads it.
  const aePropOpen = idNode('act-prop-open', 'button');
  aePropOpen.dataset.ap = 'open';
  aePropOpen.dataset.k = 'ap/open';
  aeActions.appendChild(aePropOpen);
  const aeDone = idNode('act-edit-done', 'button');
  aeDone.dataset.ae = 'done';
  aeActions.appendChild(aeDone);

  /* ---- plan 03.1-07's proposal pane (ACT-05's first half, ACT-06, ACT-07) --
     Reserved empty by plan 03.1-05 and filled here, hand-made from the static
     markup exactly as every block above it is.

     EVERY CLASS IS COPIED FROM THE SHELL and two of them are load-bearing
     rather than decorative. [S06.5] selects the transformation rows by
     .ae-prop-row and the override row by .ae-prop-over, so the override row
     must NOT wear the first of those or it would be filled as a fourth
     transformation. And [S07.3]'s proposal block tells an amount field apart
     by .ae-prop-amt, which is deliberately NOT .ae-amt: a field in here
     wearing the authoring class would dispatch the very op this pane exists
     not to send, and the whole of the nothing-lands check would be green over
     a pane that writes. */
  const aePropose = idNode('act-edit-propose', 'section');
  aePropose.className = 'ae-pane';
  aePropose.hidden = true;
  editor.appendChild(aePropose);

  aePropose.appendChild(idNode('act-prop-title', 'h2'));

  const aePropRefuse = idNode('act-prop-refuse', 'p');
  aePropRefuse.className = 'ae-prop-refuse';
  aePropRefuse.hidden = true;
  aePropose.appendChild(aePropRefuse);

  const aePropSays = idNode('act-prop-says', 'p');
  aePropSays.className = 'ae-prop-says';
  aePropose.appendChild(aePropSays);

  [['caster', 'act-prop-caster-label'],
    ['target', 'act-prop-target-label']].forEach(([kind, labelId]) => {
    const group = createElement('div');
    aePropose.appendChild(group);
    group.appendChild(idNode(labelId, 'h3'));
    const box = createElement('div');
    box.className = 'ae-prop-picks ae-prop-' + kind;
    group.appendChild(box);
  });

  const aePropCost = idNode('act-prop-cost', 'p');
  aePropCost.className = 'ae-prop-report';
  aePropose.appendChild(aePropCost);
  const aePropReqs = idNode('act-prop-reqs');
  aePropReqs.className = 'ae-prop-reports';
  aePropose.appendChild(aePropReqs);

  const aePropRows = idNode('act-prop-rows');
  aePropRows.className = 'ae-prop-rows';
  aePropose.appendChild(aePropRows);

  function aePropRow(slot) {
    const row = createElement('div');
    row.className = 'ae-prop-row';
    row.hidden = true;
    const lbl = createElement('span');
    lbl.className = 'ae-prop-lbl';
    row.appendChild(lbl);
    const amt = createElement('input');
    amt.type = 'text';
    amt.className = 'ae-prop-amt';
    amt.dataset.apSlot = String(slot);
    amt.dataset.k = 'ap/amt/' + slot;
    amt.setAttribute('aria-label', 'How much this change is');
    row.appendChild(amt);
    aePropRows.appendChild(row);
    return row;
  }
  aePropRow(0);
  aePropRow(1);

  const aePropOver = createElement('div');
  aePropOver.className = 'ae-prop-over';
  aePropRows.appendChild(aePropOver);
  ['ae-prop-who', 'ae-prop-toks'].forEach((cls) => {
    const box = createElement('div');
    box.className = cls;
    aePropOver.appendChild(box);
  });
  const aePropOverAmt = createElement('input');
  aePropOverAmt.type = 'text';
  aePropOverAmt.className = 'ae-prop-amt';
  aePropOverAmt.dataset.apSlot = 'over';
  aePropOverAmt.dataset.k = 'ap/amt/over';
  aePropOverAmt.setAttribute('aria-label', 'How much the added line is');
  aePropOver.appendChild(aePropOverAmt);

  const aePropClose = idNode('act-prop-close', 'button');
  aePropClose.dataset.ap = 'close';
  aePropClose.dataset.k = 'ap/close';
  aePropose.appendChild(aePropClose);

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

/* --- 40b-40g. ACT-07 and D-12: the line beside Remove, saying which actions
       name this type BEFORE it is taken away. Phase 2.1's D-17 chose no
       confirmation on removal because a modal costs an instructor a click
       mid-demo to guard against something undo already covers; D-12 says
       something references a type now. A LINE reconciles them — no click, no
       surface, removal still one undoable commit.

       Every row below drives the real ops and reads the real node. The term is
       written through restore() because no op in this phase writes a
       transformation — ACT-05 is half-delivered by design (D-05b) and the
       editor is another plan's — and restore() is the documented writer for
       exactly this. The board is put back at the end. --- */
const pkNames = dom.byId['tok-pick-names'];
function pkLine() {
  return pkNames ? pkNames.textContent : '(no node)';
}
function pkLineHidden() {
  return pkNames ? pkNames.hidden : '(no node)';
}

const warnSaved = JSON.stringify(A.state.get());
press(openBtn);
release(openBtn);
A.state.flush();

check(
  '40b. the line beside Remove says nothing on the shipped board. Measured '
    + 'while writing this row: Slash and Lasers both carry a health term, so '
    + 'without the arm that keeps it silent for a type the board is BUILT on, '
    + 'the picker would open cold on a permanent sentence about removing '
    + 'Health — a removal this surface does not offer, because Remove is '
    + 'disabled for exactly those five',
  pkLine() === '' && pkLineHidden() === true && pkRemove.disabled === true,
  'line=' + JSON.stringify(pkLine()) + ' hidden=' + pkLineHidden()
    + ' open on=' + JSON.stringify(dlg.dataset.tok)
    + ' remove disabled=' + pkRemove.disabled
);

// A type of the student's own, and an action of the student's own with a term
// naming it. The action is authored through the real op and the term is
// written through restore(), for the reason stated above the block.
press(pkNewUnit);
release(pkNewUnit);
A.state.flush();
const warnTok = dlg.dataset.tok;
const warnRemoveBefore = pkRemove.disabled;
const warnLineBefore = pkLine();
const warnSigBefore = dlg.dataset.sig;

const warnMade = A.ops.createAction('cats', 'Pounce');
A.state.flush();
const warnLineAfterCreate = pkLine();

const warnState = JSON.parse(JSON.stringify(A.state.get()));
warnState.build.cats.actions.forEach((a) => {
  if (a.id === warnMade) { a.xf = [{ who: 'target', tok: warnTok, d: -1 }]; }
});
A.state.restore(JSON.stringify(warnState));
A.state.flush();
const warnLineNamed = pkLine();
const warnSigNamed = dlg.dataset.sig;
const warnRemoveNamed = pkRemove.disabled;

check(
  '40c. authoring an action that names a student-made type puts both names on '
    + 'the line, read live — an action whose terms do NOT name it leaves the '
    + 'line alone, which is what says the row is about the reference and not '
    + 'merely about an action existing',
  warnLineBefore === ''
    && warnLineAfterCreate === ''
    && warnLineNamed === 'New type is named by Pounce. Removing it will leave '
      + 'that action without a term.'
    && pkLineHidden() === false,
  'before=' + JSON.stringify(warnLineBefore)
    + ' after a create that names nothing=' + JSON.stringify(warnLineAfterCreate)
    + ' once it names the type=' + JSON.stringify(warnLineNamed)
    + ' hidden=' + pkLineHidden()
);

// Both names are read LIVE, so a student who renamed either is told about the
// word they chose. Two renames, one of each record, each a PLAIN commit — so
// the line moves on a sync-only frame with no rebuild behind it.
A.ops.renameTokenType(warnTok, 'Venom');
A.state.flush();
const warnLineTokRenamed = pkLine();
A.ops.renameAction('cats', warnMade, 'Prowl');
A.state.flush();
const warnLineActRenamed = pkLine();

check(
  '40d. renaming either record moves the line, on a plain commit with no '
    + 'structural frame behind it — a student who renamed one is told about '
    + 'the word THEY chose, which is removeTokenType\'s own stated technique '
    + 'applied one tier up',
  warnLineTokRenamed === 'Venom is named by Pounce. Removing it will leave '
      + 'that action without a term.'
    && warnLineActRenamed === 'Venom is named by Prowl. Removing it will leave '
      + 'that action without a term.',
  'after the type rename=' + JSON.stringify(warnLineTokRenamed)
    + ' after the action rename=' + JSON.stringify(warnLineActRenamed)
);

check(
  '40e. the signature moved when the line did, so the surface is not born '
    + 'stale. Every one of these three changes leaves the whole token '
    + 'vocabulary the fingerprint used to read untouched, which is exactly the '
    + 'pre-02.1-04 defect with a different record in it',
  typeof warnSigBefore === 'string' && warnSigBefore !== ''
    && warnSigNamed !== warnSigBefore
    && dlg.dataset.sig !== warnSigNamed,
  'before=' + JSON.stringify(String(warnSigBefore).slice(-60))
    + ' once named=' + JSON.stringify(String(warnSigNamed).slice(-60))
    + ' after the renames=' + JSON.stringify(String(dlg.dataset.sig).slice(-60))
);

A.ops.removeAction('cats', warnMade);
A.state.flush();
const warnLineAfterRemove = pkLine();
const warnRemoveAfter = pkRemove.disabled;

check(
  '40f. removing the action clears the line, and the Remove button\'s enabled '
    + 'state is IDENTICAL through every state above. This line reports; it does '
    + 'not disable. Whether a rule that names a departing type is worth keeping '
    + 'is the student\'s ruling, and adjudicating it is the exercise',
  warnLineAfterRemove === ''
    && pkLineHidden() === true
    && warnRemoveBefore === false
    && warnRemoveNamed === false
    && warnRemoveAfter === false,
  'line=' + JSON.stringify(warnLineAfterRemove) + ' hidden=' + pkLineHidden()
    + ' remove disabled: before=' + warnRemoveBefore
    + ' while named=' + warnRemoveNamed + ' after=' + warnRemoveAfter
);

if (dlg.open === true) { dlg.close(); }
A.state.restore(warnSaved);
A.state.flush();
clearPanel();

check(
  '40g. and the board was handed back untouched by all of it',
  JSON.stringify(A.state.get()) === warnSaved,
  'state matches the snapshot: ' + (JSON.stringify(A.state.get()) === warnSaved)
);

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

   THE ONE KEY PHASE 3.1 ADMITTED, named here rather than left to be noticed as
   an absence from the list above. `anm` marks a node whose whole text is the
   live name of one action, and sync() writes it — so by the sentence this
   check is written around it belongs in the list, and leaving it out silently
   would be the list quietly meaning something narrower than it says. It is
   admitted because a card's name is a word a STUDENT typed and ACT-01 makes it
   a per-frame read, exactly as ALLOC-10 already made a token type's label one;
   what the five keys are actually about is a card becoming a CONTROL, and a
   node that can only ever be written a name is not one. It is admitted as
   EXACTLY itself and no wider: check 63c below asserts that every card carries
   precisely one such node and that it names its own action, so a card that
   grew a second one, or one pointed at somebody else's action, is caught here
   rather than in a rehearsal.

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

/* 63c. The other half of the exception 63b admits: `anm` is allowed on a card
   EXACTLY once and pointed at that card's own action. Without this row the
   admission is open-ended — a second marker under a card, or one carrying
   another side's id, would be a card painting somebody else's name, and 63b
   would say nothing because the key is on its permitted list.

   The side is checked too, and it is not decoration. nextActionId numbers each
   side's own list, so `x1` on the Cats and `x1` on the Mechs are two different
   actions with one id; a marker that carried the id and not the side would
   paint one column's name into the other's card the moment a student authored
   a first action on each side. */
const refNameDrift = [];
['cats', 'mechs'].forEach((side) => {
  refCards(side).forEach((card, i) => {
    const marked = [];
    (function walk(n) {
      if (n.dataset && n.dataset.anm !== undefined) { marked.push(n); }
      n.children.forEach(walk);
    })(card);
    if (marked.length !== 1) {
      refNameDrift.push(side + '/card' + i + ': ' + marked.length + ' marked nodes');
      return;
    }
    const want = A.state.get().build[side].actions[i];
    if (!want || marked[0].dataset.anm !== want.id || marked[0].dataset.aside !== side) {
      refNameDrift.push(side + '/card' + i + ': marker names '
        + JSON.stringify(marked[0].dataset.aside + '/' + marked[0].dataset.anm)
        + ' but the card is the ' + (want ? want.id : '(none)') + ' card');
    }
  });
});
check(
  '63c. and the one attribute 63b admits is on each card exactly once, naming '
    + 'that card\'s own action AND its own side — an open-ended exception is '
    + 'not an exception, and a marker carrying an id without a side would paint '
    + 'one column\'s name into the other\'s card as soon as a student authored '
    + 'a first action on each',
  refCards('cats').length === 3 && refCards('mechs').length === 3
    && refNameDrift.length === 0,
  refNameDrift.length === 0
    ? 'six cards, six markers, each naming its own side and action'
    : JSON.stringify(refNameDrift)
);

/* 64. THE CARDS READ THE BUILD SLICE, mirrored here because the artifact's own
   row for it needs a page and this file is the only thing CI runs. [S09.9]
   carries the same claim in the same two halves; measured while writing this
   one, a build with refActions pointed back at the frozen board left the whole
   terminal run green at 640 passed and 71 of 71 checks — the phase's headline
   behaviour, broken, with nothing red in CI. That is precisely the shape of
   hole the stub page exists to close.

   TWO HALVES, and they catch different defects. A create is a STRUCTURAL
   commit and runs the builder, so the first half catches a builder still
   reading the frozen board. A rename is a PLAIN one and runs the sync passes
   alone, so the second half — with no structural commit between the write and
   the read — catches a card whose name was baked in at build time with no
   per-frame channel behind it. Either half alone passes on the other's
   defect. */
const cardNames = (side) => refCards(side)
  .map((c) => (c.querySelectorAll('.ref-action')[0] || {}).textContent);
const tripBefore = cardNames('cats').join(',');
const tripMade = A.ops.createAction('cats', 'Pounce');
A.state.flush();
const tripAfterCreate = cardNames('cats').join(',');
const tripMechs = refCards('mechs').length;
A.ops.renameAction('cats', tripMade, 'Prowl');
A.state.flush();
const tripAfterRename = cardNames('cats').join(',');
A.ops.removeAction('cats', tripMade);
A.state.flush();

check(
  '64. an action a student CREATES arrives as a card in that side\'s column, '
    + 'and one they RENAME changes the card with no structural frame between '
    + 'the write and the read — the read the card builder spent two phases '
    + 'predicting would have to change, asserted by walking the page rather '
    + 'than by reading this repo\'s own source',
  tripBefore === 'Slash,Hairball,Screech'
    && tripAfterCreate === 'Slash,Hairball,Screech,Pounce'
    && tripAfterRename === 'Slash,Hairball,Screech,Prowl'
    && tripMechs === 3
    && cardNames('cats').join(',') === 'Slash,Hairball,Screech',
  'before=' + JSON.stringify(tripBefore)
    + ' after create=' + JSON.stringify(tripAfterCreate)
    + ' after rename=' + JSON.stringify(tripAfterRename)
    + ' mechs cards while the cats column grew=' + tripMechs
    + ' after remove=' + JSON.stringify(cardNames('cats').join(','))
);

/* 64b. And the band's sentences follow a rename of a SHIPPED action, which is a
   third path again: the band is built once, so its two sentences need a
   per-frame read of their own or they keep naming an action by a word the
   student has already changed. That is the Damage bug (e7f14ef) with a
   different record underneath it, and this is the row that would have caught
   it. The keyword card beside it must NOT move — a rule is not a name. */
const bandWas = refBandLines().map((n) => n.textContent).join(' | ');
const lasersWas = A.state.get().build.mechs.actions
  .filter((a) => a.id === 'lasers')[0].name;
A.ops.renameAction('mechs', 'lasers', 'Pew');
A.state.flush();
const bandNow = refBandLines().map((n) => n.textContent).join(' | ');
const chipNow = refCards('mechs').map((c) =>
  (c.querySelectorAll('.ref-effect')[0] || {}).textContent).join(',');
A.ops.renameAction('mechs', 'lasers', lasersWas);
A.state.flush();

check(
  '64b. renaming a shipped action moves the relationship line that names it, '
    + 'with no structural frame in between, and leaves the keyword cards where '
    + 'they were — a rule is not a name',
  bandWas === 'Fly beats Slash | Lasers beat Hairball'
    && bandNow === 'Fly beats Slash | Pew beat Hairball'
    && chipNow === 'Evade,Range,Shield'
    && refBandLines().map((n) => n.textContent).join(' | ') === bandWas,
  'was=' + JSON.stringify(bandWas) + ' under the rename=' + JSON.stringify(bandNow)
    + ' keyword cards=' + JSON.stringify(chipNow)
    + ' put back=' + JSON.stringify(refBandLines().map((n) => n.textContent).join(' | '))
);

A.state.restore(refSaved);
A.state.flush();

/* --- 65-68. plan 03.1-05's action editor -------------------------------------

   65. THE RESERVED TERM ROWS ARE COUNTED FROM THE SHELL, AGAINST THE CONSTANTS.
   The rows are static markup for the reason the name field is (D-19): plan
   03.1-06 puts a number in each, and a number half-typed is exactly the text a
   rebuilt row throws away. That leaves the row COUNT written down in two
   places — as literal ids in the shell, and as App.data.MAX_ACTION_REQ /
   App.data.MAX_ACTION_XF in [S01] — and two places for one number is where a
   raised cap silently stops being reachable. So the count is read out of the
   real markup rather than out of the stub, because the stub is hand-written
   from the same source and asserting it against itself would assert nothing.

   THE PROPOSAL PANE'S OWN ROWS ARE COUNTED IN THE SAME BREATH, and this half
   is WIDENED by plan 03.1-07 rather than replaced. It used to read the pane
   back EMPTY, which was the honest claim while the pane was reserved. The pane
   is filled now, so the claim that carries the same weight is the one about
   the COUNT: the shell reserves exactly MAX_ACTION_XF editable rows plus ONE
   override row, and those two numbers live in the markup and in [S01] exactly
   as the authoring rows' do. The pane is still hidden while the authoring pane
   is showing, which is the other half of what the old row said. */
const shellReqRows = (html.match(/id="act-edit-req-\d+"/g) || []).length;
const shellXfRows = (html.match(/id="act-edit-xf-\d+"/g) || []).length;
const shellPropRows = (html.match(/class="ae-prop-row"/g) || []).length;
const shellPropOver = (html.match(/class="ae-prop-over"/g) || []).length;
const aeDialog = dom.byId['act-edit'];
const aeProposePane = dom.byId['act-edit-propose'];
const stubPropRows = aeProposePane
  ? aeProposePane.querySelectorAll('.ae-prop-row').length : -1;
const stubPropOver = aeProposePane
  ? aeProposePane.querySelectorAll('.ae-prop-over').length : -1;
check(
  '65. the shell reserves exactly MAX_ACTION_REQ requirement rows, '
    + 'MAX_ACTION_XF transformation rows and — on the proposal pane — '
    + 'MAX_ACTION_XF editable rows plus exactly ONE override row. Every one of '
    + 'them is static markup so a half-typed number survives the per-frame '
    + 'repaint, which puts each count in the markup AND in [S01], and a raised '
    + 'cap that reached only one of them would leave a term a student can hold '
    + 'and cannot type. The proposal pane is hidden while the authoring pane '
    + 'is showing, which is the half of this row that has been true since plan '
    + '03.1-05 reserved the pane',
  shellReqRows === A.data.MAX_ACTION_REQ && shellXfRows === A.data.MAX_ACTION_XF
    && shellPropRows === A.data.MAX_ACTION_XF && shellPropOver === 1
    && stubPropRows === A.data.MAX_ACTION_XF && stubPropOver === 1
    && aeProposePane !== null && aeProposePane.hidden === true,
  'requirement rows in the shell=' + shellReqRows + ' (cap ' + A.data.MAX_ACTION_REQ + ')'
    + ' transformation rows=' + shellXfRows + ' (cap ' + A.data.MAX_ACTION_XF + ')'
    + ' proposal rows in the shell=' + shellPropRows + ' override rows=' + shellPropOver
    + ' proposal rows in the stub=' + stubPropRows + ' override rows=' + stubPropOver
    + ' proposal pane hidden=' + (aeProposePane ? aeProposePane.hidden : '(no node)')
);

/* 66-66e. [S06.5] THE EDITOR REPAINT. These rows drive App.render.editor and
   the per-frame hook DIRECTLY rather than through a control, because that is
   what they are about: [S07.3]'s handlers get their own rows further down, and
   a render row that went through a handler would go red for two unrelated
   reasons at once. The dialog is opened with showModal() here for the same
   reason — there is no press to make yet at this point in the file.

   Everything below is put back before Layer C runs, because the harvest reads
   the shipped board and a stray action of a student's own in it would move
   every floor in the file. */
const aeSaved = JSON.stringify(A.state.get());
const aeList = dom.byId['act-edit-list'];
const aeName = dom.byId['act-edit-name'];
const aeNew = dom.byId['act-edit-new'];
const aeRemove = dom.byId['act-edit-remove'];

function aeOpen(side, actionId) {
  if (aeDialog.open !== true) { aeDialog.showModal(); }
  A.render.editor(A.state.get(), side, actionId);
  A.state.flush();
}
function aeRowIds() {
  return aeList.children.map((c) => c.dataset.edPick);
}
function aeRowNames() {
  return aeList.children.map((c) => {
    const n = c.querySelectorAll('.ae-item-name')[0];
    return n ? n.textContent : '(no name node)';
  });
}
const aeSigNow = () => aeDialog.dataset.edSig;

/* 66. One row per action on the side, in board order, and the row names the
   action by ID and never by the student's text — because data-ed-pick is what
   [S07.3] reads back off a press and a name is a string a student can put a
   selector metacharacter into. A create adds one row; a shipped action and an
   authored one are the same row shape, which is D-07 on the page. */
aeOpen('cats', 'slash');
const aeIdsBefore = aeRowIds().join(',');
const aeNamesBefore = aeRowNames().join(',');
const aeShapesMatch = aeList.children
  .every((c) => c.tagName === 'BUTTON' && c.className.indexOf('ae-item') !== -1);
const aeMade = A.ops.createAction('cats', 'Pounce');
A.state.flush();
const aeIdsAfter = aeRowIds().join(',');
const aeMechsRows = (() => { aeOpen('mechs', 'fly'); const r = aeRowIds().join(','); aeOpen('cats', aeMade); return r; })();
check(
  '66. the editor lists every action on the chosen side in board order, shipped '
    + 'and authored in ONE list with no second tier, and each row names its '
    + 'action by ID rather than by the words the student typed',
  aeIdsBefore === 'slash,hairball,screech'
    && aeNamesBefore === 'Slash,Hairball,Screech'
    && aeShapesMatch === true
    && aeIdsAfter === 'slash,hairball,screech,' + aeMade
    && aeMechsRows === 'fly,lasers,recharge',
  'cats rows before=' + JSON.stringify(aeIdsBefore)
    + ' names=' + JSON.stringify(aeNamesBefore)
    + ' every row a button carrying the row class=' + aeShapesMatch
    + ' after a create=' + JSON.stringify(aeIdsAfter)
    + ' mechs rows=' + JSON.stringify(aeMechsRows)
);

/* 66b. A rename reaches the row and the heading on the frame it happens, with
   NO structural commit in between. renameAction is a PLAIN commit by plan
   03.1-03's recorded decision, so structure() never runs for one — a surface
   that only repainted on a structural frame would sit there showing the old
   word until something unrelated forced a rebuild. That is the Damage bug
   (e7f14ef) a third time, with a third record underneath it. */
A.ops.renameAction('cats', aeMade, 'Prowl');
A.state.flush();
const aeRenamedRow = aeRowNames().join(',');
const aeRenamedHead = dom.byId['act-edit-title'].textContent;
check(
  '66b. renaming an action moves its row and the editor heading on the frame '
    + 'it happens, with no structural commit between the write and the read',
  aeRenamedRow === 'Slash,Hairball,Screech,Prowl' && aeRenamedHead === 'Prowl',
  'rows=' + JSON.stringify(aeRenamedRow) + ' heading=' + JSON.stringify(aeRenamedHead)
);

/* 66c. THE FINGERPRINT NAMES EVERY FIELD OF THE RECORD, all six of them, each
   driven separately and each compared against the signature taken immediately
   before it. Two of those fields the surface draws today; four are what the
   reserved term rows exist to draw, and they are in the fingerprint now rather
   than added by plan 03.1-06 beside the code that draws them — a fingerprint
   widened in the same change as the thing it draws is a surface that was born
   stale in every release before that change, which is the pre-02.1-04 defect
   and then ACT-07's line, twice in two phases.

   [S05] has no op that writes dmg, keywords, cost, req or xf, so those four are
   driven through App.state.restore, which is [S09]'s documented writer and
   exists for exactly this. */
function aeFieldMoves(mutate) {
  const before = aeSigNow();
  const s = JSON.parse(JSON.stringify(A.state.get()));
  const rec = s.build.cats.actions.filter((a) => a.id === aeMade)[0];
  mutate(rec);
  A.state.restore(JSON.stringify(s));
  A.state.flush();
  return aeSigNow() !== before;
}
const aeNameMoves = (() => {
  const before = aeSigNow();
  A.ops.renameAction('cats', aeMade, 'Lunge');
  A.state.flush();
  return aeSigNow() !== before;
})();
const aeDmgMoves = aeFieldMoves((r) => { r.dmg = 4; });
const aeKwMoves = aeFieldMoves((r) => { r.keywords = ['range']; });
const aeCostMoves = aeFieldMoves((r) => { r.cost = [{ tok: 'ap', n: 2 }]; });
const aeReqMoves = aeFieldMoves((r) => { r.req = [{ tok: 'hp', n: 2 }]; });
const aeXfMoves = aeFieldMoves((r) => { r.xf = [{ who: 'target', tok: 'hp', d: -2 }]; });
check(
  '66c. the fingerprint moves for every field of an action record — the name, '
    + 'the damage, the keywords, the cost, a requirement and a transformation — '
    + 'so a surface that draws any of them cannot be born stale. Each is driven '
    + 'and read separately, because a fingerprint that misses exactly one field '
    + 'passes any row that only checks that SOMETHING moves',
  aeNameMoves && aeDmgMoves && aeKwMoves && aeCostMoves && aeReqMoves && aeXfMoves,
  'name=' + aeNameMoves + ' dmg=' + aeDmgMoves + ' keywords=' + aeKwMoves
    + ' cost=' + aeCostMoves + ' req=' + aeReqMoves + ' xf=' + aeXfMoves
);

/* 66d. The repaint never writes a focused field, and the list keeps its scroll
   offset across a rebuild. Both are D-19 applied to this surface: the dialog
   rides SYNC_HOOKS, so it repaints on every frame while it is open, and a
   student halfway through typing a name must not be handed the old text back.
   The scroll half is the same defect [C07]'s list had — every repaint empties
   the box, which clamps the offset to zero, and selecting a row IS a repaint,
   so a row pressed near the bottom went off the top. */
aeName.focus();
aeName.value = 'Half-typ';
aeList.scrollTop = 84;
A.ops.renameAction('cats', 'slash', 'Rake');
A.state.flush();
const aeFieldKept = aeName.value;
const aeScrollKept = aeList.scrollTop;
aeName.blur();
A.ops.renameAction('cats', 'slash', 'Slash');
A.state.flush();
check(
  '66d. a repaint raised from outside leaves a FOCUSED name field untouched '
    + 'and puts the list back at the offset it was scrolled to — a student '
    + 'halfway through a word is not handed the old one back, and a row near '
    + 'the bottom does not jump off the top',
  aeFieldKept === 'Half-typ' && aeScrollKept === 84
    && aeRowNames()[0] === 'Slash',
  'field read ' + JSON.stringify(aeFieldKept) + ' (was typed as "Half-typ")'
    + ' scroll offset=' + aeScrollKept + ' (was 84)'
    + ' first row now=' + JSON.stringify(aeRowNames()[0])
);

/* 66e. THE TWO BOUNDS, RE-DECIDED FROM STATE ON EVERY REPAINT. Remove is shut
   for a shipped action, because the reference band names those six by id and a
   removed one would leave the band naming nothing (plan 03.1-03's recorded
   decision). New is shut at MAX_CUSTOM_ACTIONS. Both are bounds on what the
   TOOL may do, never rulings on what the STUDENT may do — the distinction
   [S02]'s affordability comment draws.

   The undo is the half that matters. A surface that toggled these when
   something was pressed would leave New disabled forever after a create was
   undone, because nothing pressed anything to turn it back on. */
aeOpen('cats', 'slash');
const aeRemoveOnShipped = aeRemove.disabled;
aeOpen('cats', aeMade);
const aeRemoveOnOwn = aeRemove.disabled;
const aeNewBelowCap = aeNew.disabled;
while (A.state.get().build.cats.actions
  .filter((a) => A.data.ACTION_IDS.indexOf(a.id) === -1).length
  < A.data.MAX_CUSTOM_ACTIONS) {
  A.ops.createAction('cats', 'Filler');
}
A.state.flush();
const aeNewAtCap = aeNew.disabled;
A.ops.undo();
A.state.flush();
const aeNewAfterUndo = aeNew.disabled;
check(
  '66e. Remove is shut for one of the six the board ships with and open for an '
    + 'action the student made; New is shut at MAX_CUSTOM_ACTIONS and open '
    + 'below it; and BOTH are re-decided from state on every repaint, so an '
    + 'undo moves them — a surface that toggled them on a press would leave New '
    + 'shut forever after the create that shut it was taken back',
  aeRemoveOnShipped === true && aeRemoveOnOwn === false
    && aeNewBelowCap === false && aeNewAtCap === true && aeNewAfterUndo === false,
  'Remove on a shipped action disabled=' + aeRemoveOnShipped
    + ' on an authored one disabled=' + aeRemoveOnOwn
    + ' New below the cap disabled=' + aeNewBelowCap
    + ' at the cap disabled=' + aeNewAtCap
    + ' after undoing the create that reached it=' + aeNewAfterUndo
);

if (aeDialog.open === true) { aeDialog.close(); }
A.state.restore(aeSaved);
A.state.flush();

/* 67-68d. [S07.3] THE EDITOR'S HANDLERS. Everything below goes through a real
   control — the topbar button, a list row, the side chooser, New, Remove, the
   name field — because that is the difference between these rows and 66's: 66
   asserts what the region PAINTS, and these assert that a student pressing
   something reaches it. Plan 03.1-04's probe L-1 is why they are here at all
   rather than only in [S09]: a row behind the artifact's own no-DOM bracket
   does not run in CI, and CI runs this file. */
const aeOpenBtn = stub.querySelector('[data-act="openActionEditor"]');
const aeSideCats = dom.byId['act-edit-side-cats'];
const aeSideMechs = dom.byId['act-edit-side-mechs'];
const aeDone = dom.byId['act-edit-done'];
function aePress(node) { press(node); release(node); A.state.flush(); }
function aeOwnCats() {
  return A.state.get().build.cats.actions
    .filter((a) => A.data.ACTION_IDS.indexOf(a.id) === -1);
}

/* 67. The topbar button opens the surface cold on the first side and that
   side's first action, and the act it dispatches is one the seam actually
   handles. An act sitting in UI_ACTS with nothing registered against it is the
   file's documented "claimed and ignored" window, which is honest between two
   plans and is a dead button if a plan ships in it — so this reads the LIVE
   registration rather than the claim. */
clearPanel();
aePress(aeOpenBtn);
const aeOpened = aeDialog.open;
const aeColdSide = aeDialog.dataset.edSide;
const aeColdPick = aeDialog.dataset.edPick;
check(
  '67. the topbar button opens the action editor cold on the first side and '
    + 'that side\'s first action, and the act it dispatches is one the LIVE '
    + 'registration handles rather than one merely claimed',
  aeOpenBtn !== null && aeOpened === true
    && aeColdSide === 'cats' && aeColdPick === 'slash'
    && A.interactions.UI_ACTS.indexOf('openActionEditor') !== -1
    && A.interactions.UI_HANDLED.indexOf('openActionEditor') !== -1
    && errPanel.hidden === true,
  'opened=' + aeOpened + ' side=' + JSON.stringify(aeColdSide)
    + ' action=' + JSON.stringify(aeColdPick)
    + ' claimed=' + (A.interactions.UI_ACTS.indexOf('openActionEditor') !== -1)
    + ' handled=' + (A.interactions.UI_HANDLED.indexOf('openActionEditor') !== -1)
);

/* 67b. A row press selects that action; the other side button moves the editor
   to that faction's FIRST action rather than carrying the id across. Carrying
   it would be silently wrong: nextActionId numbers each side's own list, so an
   authored `x1` exists on both sides and names two different rules. */
const aeRowScreech = aeList.children.filter((c) => c.dataset.edPick === 'screech')[0];
aePress(aeRowScreech);
const aeAfterRow = aeDialog.dataset.edSide + '/' + aeDialog.dataset.edPick;
aePress(aeSideMechs);
const aeAfterSide = aeDialog.dataset.edSide + '/' + aeDialog.dataset.edPick;
const aeMechsList = aeRowIds().join(',');
aePress(aeSideCats);
const aeBackToCats = aeDialog.dataset.edSide + '/' + aeDialog.dataset.edPick;
check(
  '67b. a press on a list row selects that action, and the side chooser moves '
    + 'the editor to the other faction\'s FIRST action rather than carrying an '
    + 'id that names a different rule over there',
  aeRowScreech !== undefined && aeAfterRow === 'cats/screech'
    && aeAfterSide === 'mechs/fly' && aeMechsList === 'fly,lasers,recharge'
    && aeBackToCats === 'cats/slash' && errPanel.hidden === true,
  'after the row press=' + JSON.stringify(aeAfterRow)
    + ' after the side press=' + JSON.stringify(aeAfterSide)
    + ' mechs rows=' + JSON.stringify(aeMechsList)
    + ' back on cats=' + JSON.stringify(aeBackToCats)
);

/* 67c. New adds one and lands the student in it — createAction hands the made
   id back for exactly that, so nothing here re-derives which action was just
   made. Remove takes an authored one away, leaves a LIVE selection, and places
   focus on a real row: the selected action's own row is what disappears, so
   keyed() has nothing to restore to and focus would otherwise land on <body>. */
const aeCountBeforeNew = aeRowIds().length;
aePress(aeNew);
const aeNewPick = aeDialog.dataset.edPick;
const aeNewName = A.state.get().build.cats.actions
  .filter((a) => a.id === aeNewPick)[0];
const aeCountAfterNew = aeRowIds().length;
aePress(aeRemove);
const aeAfterRemove = aeDialog.dataset.edPick;
const aeRemoveLeftLive = aeRowIds().indexOf(aeAfterRemove) !== -1;
const aeFocusOnRow = stub.activeElement !== null
  && stub.activeElement.dataset !== undefined
  && String(stub.activeElement.dataset.k || '').indexOf('ae/list/') === 0;
check(
  '67c. New adds one action and lands the student in it, and Remove takes an '
    + 'authored one away, leaves a LIVE selection behind and puts focus on a '
    + 'real row rather than dropping it onto the body — the removed action\'s '
    + 'own row is the node that disappears, so nothing else would catch it',
  aeCountAfterNew === aeCountBeforeNew + 1
    && aeNewName !== undefined
    && aeNewName.name === A.interactions.NEW_ACTION_NAME
    && aeNewPick === aeNewName.id
    && aeRowIds().length === aeCountBeforeNew
    && aeRemoveLeftLive === true && aeFocusOnRow === true
    && errPanel.hidden === true,
  'rows before New=' + aeCountBeforeNew + ' after=' + aeCountAfterNew
    + ' selected=' + JSON.stringify(aeNewPick)
    + ' named=' + JSON.stringify(aeNewName && aeNewName.name)
    + ' rows after Remove=' + aeRowIds().length
    + ' selection still live=' + aeRemoveLeftLive
    + ' focus on a list row=' + aeFocusOnRow
    + ' (activeElement data-k=' + JSON.stringify(stub.activeElement
      && stub.activeElement.dataset && stub.activeElement.dataset.k) + ')'
);

/* 67d. Enter commits ONCE and the blur that follows commits nothing. Without
   the value-versus-`was` early return, typing a name, pressing Enter and then
   clicking away applies the rename TWICE — the same measured defect commitField
   and commitName each carry the same guard for. Escape puts the recorded text
   back and commits nothing; that it also leaves the DIALOG open is the half
   this harness cannot reach, because the stub <dialog> has no close-request
   behaviour at all. */
function aeNameFocus() { aeName.focus(); }
function aeNameType(s) { aeName.value = s; aeName.dispatchEvent(dom.event('input')); }
function aeNameKey(k) { aeName.dispatchEvent(dom.event('keydown', { key: k })); }
function aeNameBlur() { aeName.dispatchEvent(dom.event('focusout')); }
clearPanel();
aeNameFocus();
const aeWasRecorded = aeName.dataset.was;
const aeForRecorded = aeName.dataset.forSide + '/' + aeName.dataset.forAct;
aeNameType('Rake');
const aeCommitsBeforeEnter = commits();
aeNameKey('Enter');
const aeAfterEnter = A.state.get().build.cats.actions
  .filter((a) => a.id === 'slash')[0].name;
const aeFromEnter = commits() - aeCommitsBeforeEnter;
aeNameBlur();
const aeFromBlur = commits() - aeCommitsBeforeEnter - aeFromEnter;
aeName.blur();
A.state.flush();
A.ops.renameAction('cats', 'slash', 'Slash');
A.state.flush();
aeNameFocus();
aeNameType('Maul');
const aeCommitsBeforeEsc = commits();
aeNameKey('Escape');
const aeEscValue = aeName.value;
const aeEscCommits = commits() - aeCommitsBeforeEsc;
aeName.blur();
A.state.flush();
check(
  '67d. Enter renames the action the text was typed FOR, once and not twice, '
    + 'and Escape puts the recorded text back and commits nothing. The target '
    + 'is recorded on the field at focus — side and action together — because '
    + 'every control here moves the selection on pointerdown, which the spec '
    + 'puts ahead of the focus change',
  aeWasRecorded === 'Slash' && aeForRecorded === 'cats/slash'
    && aeAfterEnter === 'Rake' && aeFromEnter === 1 && aeFromBlur === 0
    && aeName.dataset.was === 'Slash'
    && aeEscValue === 'Slash' && aeEscCommits === 0
    && A.state.get().build.cats.actions.filter((a) => a.id === 'slash')[0].name === 'Slash'
    && errPanel.hidden === true,
  'baseline recorded on focus=' + JSON.stringify(aeWasRecorded)
    + ' target recorded=' + JSON.stringify(aeForRecorded)
    + ' name after Enter=' + JSON.stringify(aeAfterEnter)
    + ' commits from Enter=' + aeFromEnter + ' from the blur after it=' + aeFromBlur
    + ' field after Escape=' + JSON.stringify(aeEscValue)
    + ' commits from Escape=' + aeEscCommits
);

/* 67e. THE ROW PROBE Q FORCED, AND THE FINDING IS WORTH MORE THAN THE ROW.
   The obvious way to hold the value-versus-`was` test is to type a name, press
   Enter, blur, and assert the blur produced no second commit. That row is
   VACUOUS in this file and 67d above says so by carrying it as one clause among
   several rather than as its own claim: renameAction has a no-op contract, so a
   second dispatch of the same name returns false and commits nothing whether
   the guard is there or not. Measured — the guard was deleted and every row in
   this file stayed green.

   What the guard actually prevents is a SILENT UNDO OF SOMEBODY ELSE'S EDIT.
   The repaint deliberately does not write a focused field (D-19), so while the
   student stands in the name box the field holds the text that was there when
   they arrived — and a rename raised from anywhere else, an undo included,
   moves state and leaves that text standing. Without the guard, the focusout
   that follows dispatches the STALE text as a fresh rename and puts the old
   word back, with an extra commit and an extra undo step behind it. The student
   pressed nothing and lost an edit.

   Reported rather than exploited: [S07.2]'s check 36 carries the weaker form of
   this row for the picker's own name field, and renameTokenType has the same
   no-op contract, so the same hole is open there. It is another plan's region
   and no copy this plan ships depends on it, so it is named here and not
   widened. A plan that touches check 36 should carry this row across. */
clearPanel();
aeOpen('cats', 'slash');
aeNameFocus();
const aeStaleWas = aeName.dataset.was;
A.ops.renameAction('cats', 'slash', 'Rake');
A.state.flush();
const aeStaleField = aeName.value;
const aeCommitsBeforeStaleBlur = commits();
aeNameBlur();
const aeStaleAfterBlur = A.state.get().build.cats.actions
  .filter((a) => a.id === 'slash')[0].name;
const aeStaleCommits = commits() - aeCommitsBeforeStaleBlur;
aeName.blur();
A.state.flush();
A.ops.renameAction('cats', 'slash', 'Slash');
A.state.flush();
check(
  '67e. a rename raised from OUTSIDE while the name field holds focus survives '
    + 'the blur that follows. The repaint may not write a focused field, so the '
    + 'field is left holding the old word — and without the value-versus-`was` '
    + 'test the blur dispatches that stale text as a fresh rename and silently '
    + 'puts the old word back, taking an edit the student made elsewhere with '
    + 'it. This is what that guard is load-bearing for HERE; the second-commit '
    + 'row everyone writes for it is vacuous, because the op refuses a no-op',
  aeStaleWas === 'Slash' && aeStaleField === 'Slash'
    && aeStaleAfterBlur === 'Rake' && aeStaleCommits === 0
    && errPanel.hidden === true,
  'baseline on focus=' + JSON.stringify(aeStaleWas)
    + ' field after the outside rename=' + JSON.stringify(aeStaleField)
    + ' (the repaint skips a focused field, so it is deliberately stale)'
    + ' name after the blur=' + JSON.stringify(aeStaleAfterBlur)
    + ' (expected the outside rename to stand)'
    + ' commits from the blur=' + aeStaleCommits
);

/* 68. A REFUSAL REACHES THE ERROR BOUNDARY AND LEAVES THE SURFACE CONSISTENT.
   Every state-changing press in this dialog dispatches FIRST and does page work
   only after dispatch has returned, so an op that refuses throws out of the
   handler into [S08]'s listener boundary and the page work never runs. Driven
   at the cap, which is the refusal a student can actually reach. */
clearPanel();
while (aeOwnCats().length < A.data.MAX_CUSTOM_ACTIONS) {
  A.ops.createAction('cats', 'Filler');
}
A.state.flush();
const aeAtCapIds = aeRowIds().join(',');
const aeCapPick = aeDialog.dataset.edPick;
const aeCommitsAtCap = commits();
// The button is disabled at the cap, which is the bound a student sees; the
// press is driven anyway, because a disabled attribute is a courtesy and the
// op is the guard. Both halves are asserted: the courtesy AND the guard.
const aeNewDisabledAtCap = aeNew.disabled;
aePress(aeNew);
const aeCapPanel = errPanel.hidden === false && errMessage.textContent !== '';
const aeCapNamesCap = String(errMessage.textContent)
  .indexOf(String(A.data.MAX_CUSTOM_ACTIONS)) !== -1;
check(
  '68. at the cap the New button is disabled AND the op still refuses if the '
    + 'press is driven anyway — the courtesy and the guard are two things — and '
    + 'the refusal reaches the styled panel through the listener boundary while '
    + 'the board, the selection and the commit total all stand still',
  aeNewDisabledAtCap === true && aeCapPanel === true && aeCapNamesCap === true
    && aeRowIds().join(',') === aeAtCapIds
    && aeDialog.dataset.edPick === aeCapPick
    && commits() === aeCommitsAtCap,
  'New disabled at the cap=' + aeNewDisabledAtCap
    + ' panel raised=' + aeCapPanel
    + ' message names the cap=' + aeCapNamesCap
    + ' rows unchanged=' + (aeRowIds().join(',') === aeAtCapIds)
    + ' selection unchanged=' + (aeDialog.dataset.edPick === aeCapPick)
    + ' commits delta=' + (commits() - aeCommitsAtCap)
);
clearPanel();

/* 68b. A repeated Enter keydown on a button in this dialog is cancelled before
   it can become a click, the first press is not, and a held key in the name
   field is left alone. A held Enter on New is otherwise one createAction per OS
   auto-repeat, and one undo entry each to rewind. */
A.state.restore(aeSaved);
A.state.flush();
aePress(aeOpenBtn);
clearPanel();
const aeOwnBeforeHold = aeOwnCats().length;
const aeFirstKey = dom.event('keydown', { key: 'Enter', repeat: false });
aeNew.dispatchEvent(aeFirstKey);
let aeRepeatCancelled = null;
for (let i = 0; i < 10; i++) {
  const rep = dom.event('keydown', { key: 'Enter', repeat: true });
  aeNew.dispatchEvent(rep);
  aeRepeatCancelled = rep.defaultPrevented;
}
A.state.flush();
aeNameFocus();
const aeHeldSpace = dom.event('keydown', { key: ' ', repeat: true });
aeName.dispatchEvent(aeHeldSpace);
aeName.blur();
A.state.flush();
check(
  '68b. a repeated Enter keydown on a button in the editor is cancelled before '
    + 'it can become a click, the FIRST press is not, and a held key in the '
    + 'name field is left alone — a held Enter on New is otherwise one action '
    + 'per OS auto-repeat and one undo entry each to rewind',
  aeRepeatCancelled === true && aeFirstKey.defaultPrevented === false
    && aeOwnCats().length === aeOwnBeforeHold
    && aeHeldSpace.defaultPrevented === false
    && errPanel.hidden === true,
  'repeat cancelled=' + aeRepeatCancelled
    + ' first press cancelled=' + aeFirstKey.defaultPrevented
    + ' actions made by the hold=' + (aeOwnCats().length - aeOwnBeforeHold)
    + ' held space in the field cancelled=' + aeHeldSpace.defaultPrevented
);

/* 68c. EVERY LISTENER ON THE DIALOG ROOT WENT THROUGH THE ERROR BOUNDARY. One
   bound raw would throw past [S08] and leave the surface dead with nothing on
   screen to say so — the failure the boundary exists for, on the one root a
   student spends this whole feature inside.

   The test is structural because the behavioural one cannot reach every
   listener: App.boot.wrap returns an ANONYMOUS zero-arity function that closes
   over the handler, and every handler in [S07.3] is a named function declared
   with its own parameter. So a raw binding is visible by name and by arity, and
   there is no way to bind one accidentally that this does not see. Floored on
   the count, because a root with no listeners at all passes a per-listener test
   spotlessly. */
const aeRaw = [];
Object.keys(aeDialog._listeners).forEach((type) => {
  aeDialog._listeners[type].forEach((fn) => {
    if (typeof fn !== 'function' || fn.name !== '' || fn.length !== 0) {
      aeRaw.push(type + ' -> ' + (typeof fn === 'function'
        ? (fn.name || '(anonymous)') + '/' + fn.length : typeof fn));
    }
  });
});
const aeListenerCount = Object.keys(aeDialog._listeners)
  .reduce((n, type) => n + aeDialog._listeners[type].length, 0);
check(
  '68c. every listener bound on the action editor\'s root went through '
    + 'App.boot.wrap. One bound raw would throw past the boundary and leave the '
    + 'surface dead with nothing on screen to say so, on the one root this '
    + 'whole feature is used inside. Floored on the count, because a root '
    + 'carrying no listeners passes a per-listener test spotlessly',
  aeListenerCount >= 8 && aeRaw.length === 0,
  'listeners on the root=' + aeListenerCount
    + ' bound outside the boundary: ' + (aeRaw.join(', ') || 'none')
);

/* 68d. UI_HANDLED, READ OFF THE LIVE REGISTRATION, NAMES EVERY UI-ONLY ACT THIS
   SURFACE DISPATCHES — and every act it dispatches that is NOT UI-only is a
   real op exported by [S05]. The two halves together are the point: the acts
   are collected off the page rather than typed out here, from the static markup
   AND from the rows the repaint built, so a control that names an act nobody
   registered is caught, and so is an act quietly moved into UI_ACTS to make a
   refusal go away. */
const aeActs = [];
(function walk(n) {
  if (n.dataset && typeof n.dataset.act === 'string' && n.dataset.act !== ''
    && aeActs.indexOf(n.dataset.act) === -1) {
    aeActs.push(n.dataset.act);
  }
  n.children.forEach(walk);
})(aeDialog);
aeActs.push(aeOpenBtn.dataset.act);
const aeUiOnly = aeActs.filter((a) => A.interactions.UI_ACTS.indexOf(a) !== -1);
const aeUnhandled = aeUiOnly.filter((a) => A.interactions.UI_HANDLED.indexOf(a) === -1);
const aeStateActs = aeActs.filter((a) => A.interactions.UI_ACTS.indexOf(a) === -1);
const aeNotOps = aeStateActs.filter((a) => typeof A.ops[a] !== 'function');
check(
  '68d. every act the editor\'s markup and its built rows dispatch is either a '
    + 'UI-only act the LIVE registration handles, or a real op [S05] exports — '
    + 'collected off the page rather than re-typed here, so a control naming an '
    + 'act nobody registered is caught, and so is a state op quietly moved into '
    + 'UI_ACTS to make a refusal go away',
  aeActs.length >= 5 && aeUiOnly.length >= 3 && aeStateActs.length >= 2
    && aeUnhandled.length === 0 && aeNotOps.length === 0,
  'acts found=' + JSON.stringify(aeActs)
    + ' UI-only=' + JSON.stringify(aeUiOnly)
    + ' claimed but unhandled=' + JSON.stringify(aeUnhandled)
    + ' state acts=' + JSON.stringify(aeStateActs)
    + ' state acts [S05] does not export=' + JSON.stringify(aeNotOps)
);

/* Done ends the visit, and the close hands focus back to the opener — a modal
   that drops focus onto <body> is the same keyboard failure the board's remove
   control had to solve, and <dialog> only restores the element that HELD focus
   when the modal opened, which a student who reached the button with a pointer
   never did. */
aePress(aeDone);
check(
  '68e. Done closes the editor and hands focus back to the topbar button that '
    + 'opened it, which <dialog> does not do for a student who reached that '
    + 'button with a pointer rather than with the keyboard',
  aeDialog.open === false && stub.activeElement === aeOpenBtn,
  'open=' + aeDialog.open + ' activeElement data-k='
    + JSON.stringify(stub.activeElement && stub.activeElement.dataset
      && stub.activeElement.dataset.k)
);

/* --- 69-69f. plan 03.1-06's term editors (ACT-02, ACT-03, ACT-04) ------------

   Everything below goes through a REAL control — a chooser button, an amount
   field, Enter, Escape, a blur — for the reason 67-68e give: a row that drove
   App.render or App.ops directly would assert what the region paints and say
   nothing about whether a student pressing something reaches it. Plan
   03.1-04's probe L-1 is why these live here rather than only in [S09]: a row
   behind the artifact's own no-DOM bracket does not run in CI, and CI runs
   this file. */
A.state.restore(aeSaved);
A.state.flush();
clearPanel();
aePress(aeOpenBtn);

const aeTermRowOf = (field, slot) => dom.byId[field === 'cost'
  ? 'act-edit-cost' : 'act-edit-' + field + '-' + slot];
const aeAmtOf = (field, slot) => dom.byId[(field === 'cost'
  ? 'act-edit-cost' : 'act-edit-' + field + '-' + slot) + '-amt'];
const aePills = (field, slot) =>
  aeTermRowOf(field, slot).querySelectorAll('.ae-pill');
const aePillFor = (field, slot, key, value) =>
  aePills(field, slot).filter((b) => b.dataset[key] === value)[0];

function aeTypeAmount(field, text) {
  if (stub.activeElement !== field) { field.focus(); }
  field.value = text;
  field.dispatchEvent(dom.event('input'));
  field.dispatchEvent(dom.event('keydown', { key: 'Enter' }));
}
function aeRecordOf(id) {
  return A.state.get().build.cats.actions.filter((a) => a.id === id)[0];
}

/* 69. THE DEVELOPER'S OWN EXAMPLE, AUTHORED ON SCREEN. One action point spent,
   two Health needed and not spent, the target losing three Health — and then a
   second transformation on the caster over a token type the student invented
   during the same visit. If this can be authored the phase works, so the record
   is read back and compared WHOLE rather than field by field: a comparison of
   parts passes over a stray key, and a stray key one nesting level from a token
   id is the thing this phase is most exposed to. */
const exMade = (() => { aePress(aeNew); return aeDialog.dataset.edPick; })();
aePress(aePillFor('cost', 0, 'edTok', 'ap'));
aeTypeAmount(aeAmtOf('cost', 0), '1');

aePress(aePillFor('req', 0, 'edTok', 'hp'));
aeTypeAmount(aeAmtOf('req', 0), '2');

aePress(aePillFor('xf', 0, 'edTok', 'hp'));
aePress(aePillFor('xf', 0, 'edWho', 'target'));
aeTypeAmount(aeAmtOf('xf', 0), '-3');

const exTok = A.ops.createTokenType({
  name: 'Rage', shape: 'circ', color: 'violet', glyph: '', scope: 'unit'
});
A.state.flush();
aePress(aePillFor('xf', 1, 'edTok', exTok));
aePress(aePillFor('xf', 1, 'edWho', 'caster'));
aeTypeAmount(aeAmtOf('xf', 1), '2');
aeAmtOf('xf', 1).blur();
A.state.flush();

const exExpected = JSON.stringify({
  id: exMade, name: A.interactions.NEW_ACTION_NAME, dmg: 0, keywords: [],
  cost: [{ tok: 'ap', n: 1 }],
  req: [{ tok: 'hp', n: 2 }],
  xf: [{ who: 'target', tok: 'hp', d: -3 }, { who: 'caster', tok: exTok, d: 2 }]
});
const exActual = JSON.stringify(aeRecordOf(exMade));
// The chooser is drawn from the LIVE vocabulary, so the type made mid-visit is
// choosable and a rename reaches every row. Read back by NAME, because the name
// is what a student picks from.
const exRenamed = (() => {
  A.ops.renameTokenType(exTok, 'Fury');
  A.state.flush();
  const pill = aePillFor('xf', 1, 'edTok', exTok);
  return pill ? pill.textContent + pill.children.map((c) => c.textContent).join('') : '(no pill)';
})();
check(
  '69. the developer\'s own example is authorable on screen through real '
    + 'controls — one action point spent, two Health needed and not spent, the '
    + 'target losing three Health, and a second change on the caster over a '
    + 'token type invented during the same visit. The record is read back WHOLE '
    + 'rather than field by field, because a comparison of parts passes over a '
    + 'stray key one nesting level from a token id',
  exActual === exExpected && exRenamed.indexOf('Fury') !== -1
    && errPanel.hidden === true,
  'authored=' + exActual + ' expected=' + exExpected
    + ' the chooser after the type was renamed=' + JSON.stringify(exRenamed)
);
A.ops.renameTokenType(exTok, 'Rage');
A.state.flush();

/* 69b. A LEADING SIGN IS PART OF THE VALUE, NEVER A MODE. [S07.1]'s stepper
   field reads "+5" as "step by five" and "5" as "set to five"; a transformation
   amount is signed by nature (D-08), so "-3" typed over a 5 must write -3 and
   not 2. The two fields look identical on the page, which is exactly why this
   is driven rather than assumed. */
aeTypeAmount(aeAmtOf('xf', 0), '5');
const exAfterFive = aeRecordOf(exMade).xf[0].d;
aeTypeAmount(aeAmtOf('xf', 0), '-3');
const exAfterMinus = aeRecordOf(exMade).xf[0].d;
aeTypeAmount(aeAmtOf('xf', 0), '+4');
const exAfterPlus = aeRecordOf(exMade).xf[0].d;
aeTypeAmount(aeAmtOf('xf', 0), '-3');
aeAmtOf('xf', 0).blur();
A.state.flush();
check(
  '69b. a leading sign in an amount is part of the VALUE and never the '
    + 'delta-versus-absolute mode the board\'s steppers use — typing -3 over a 5 '
    + 'writes -3, not 2, and +4 writes 4, not 9',
  exAfterFive === 5 && exAfterMinus === -3 && exAfterPlus === 4
    && errPanel.hidden === true,
  'after typing 5=' + exAfterFive + ' after -3=' + exAfterMinus
    + ' (a delta reading would give 2) after +4=' + exAfterPlus
    + ' (a delta reading would give 9)'
);

/* 69c. THE PARSER IS A REGEX AND NOT Number(). All of these fail SILENTLY
   through Number() / parseInt() / Math.trunc() — '' and '   ' become 0, '1e3'
   becomes 1000, '0x5' becomes 5, 'Infinity' becomes Infinity, '5.5' becomes
   5.5 — and the empty-string case is the dangerous one, because a student who
   selects all, presses Delete and clicks away would write a cost of nothing.
   Driven on the QUIET path, which is a blur: clicking away from a half-typed
   value is not an error and must not open a panel. Escape gets its own clause
   for the same reason it does on the name field. */
//
// DRIVEN ON A REQUIREMENT AS WELL AS ON A TRANSFORMATION, and probe S is what
// forced that. A transformation amount of zero is refused by [S05] outright — a
// change of nothing is not a change — so the empty string, the single most
// dangerous entry in this table, is caught one layer BELOW the parser on that
// field and the row read green with the parser swapped for Number(). On a
// REQUIREMENT zero is a legal value a student may write, so there is no second
// layer there and the parser is the only thing standing between a cleared field
// and a silent requirement of nothing. A row driven on one field kind would
// have been blind to exactly the case its own label calls the worst.
const exBad = [];
[['xf', 0], ['req', 0]].forEach(([exField, exSlot]) => {
  ['abc', '1e3', '0x5', '5.5', 'Infinity', '', '   ', '+', '-', '1000', '--3', '3px']
    .forEach((bad) => {
      const f = aeAmtOf(exField, exSlot);
      if (stub.activeElement !== f) { f.focus(); }
      const wasText = f.dataset.was;
      const wroteBefore = JSON.stringify(aeRecordOf(exMade)[exField]);
      f.value = bad;
      f.dispatchEvent(dom.event('input'));
      f.dispatchEvent(dom.event('focusout'));
      A.state.flush();
      if (f.value !== wasText
        || JSON.stringify(aeRecordOf(exMade)[exField]) !== wroteBefore) {
        exBad.push(exField + '/' + exSlot + ' ' + JSON.stringify(bad)
          + ' -> field=' + JSON.stringify(f.value)
          + ' record=' + JSON.stringify(aeRecordOf(exMade)[exField]));
      }
      f.blur();
      A.state.flush();
    });
});
// Padding alone is TRIMMED and taken, not refused, which is the same kindness
// [S07.1]'s own parser extends: trim() runs first and every test runs on the
// trimmed result, so a stray space is not a rule a student has to debug.
const exPadded = (() => {
  const f = aeAmtOf('xf', 0);
  f.focus();
  f.value = ' 3 ';
  f.dispatchEvent(dom.event('input'));
  f.dispatchEvent(dom.event('focusout'));
  A.state.flush();
  const out = aeRecordOf(exMade).xf[0].d;
  f.blur();
  A.state.flush();
  aeTypeAmount(aeAmtOf('xf', 0), '-3');
  aeAmtOf('xf', 0).blur();
  A.state.flush();
  return out;
})();
const exEscField = (() => {
  const f = aeAmtOf('xf', 0);
  f.focus();
  f.value = '-9';
  f.dispatchEvent(dom.event('input'));
  const before = commits();
  f.dispatchEvent(dom.event('keydown', { key: 'Escape' }));
  const out = [f.value, commits() - before, aeDialog.open];
  f.blur();
  A.state.flush();
  return out;
})();
check(
  '69c. an amount that is not a whole number changes nothing and leaves the '
    + 'field holding the text it recorded on focus — every one of these is a '
    + 'value Number(), parseInt() and Math.trunc() would each have taken '
    + 'SILENTLY, the empty string most dangerously of all. Escape puts the '
    + 'recorded text back, commits nothing, and leaves the dialog open. A '
    + 'number with padding around it is TRIMMED and taken, which is the same '
    + 'kindness the parser on the board extends',
  exBad.length === 0 && exPadded === 3
    && exEscField[0] === '-3' && exEscField[1] === 0
    && exEscField[2] === true && errPanel.hidden === true,
  'values that got through: ' + (exBad.join(' | ') || 'none')
    + ' | a padded number is trimmed and taken, and wrote=' + exPadded
    + ' | field after Escape=' + JSON.stringify(exEscField[0])
    + ' commits from Escape=' + exEscField[1]
    + ' dialog still open=' + exEscField[2]
);

/* 69d. THE REPAINT DOES NOT WRITE A FOCUSED AMOUNT FIELD, and an undo DOES
   repaint the row it is not standing in. Both are D-19 on this surface: the
   dialog rides SYNC_HOOKS, so it repaints on every frame while it is open, and
   a student halfway through typing "-4" must not be handed "-3" back — while a
   row nobody is standing in must follow state wherever state goes, including
   backwards. The undo is measured against a write that cannot have coalesced
   with the one before it, because commit() folds same-label writes inside its
   window and a probe that let the two touch would measure nothing. */
const exFocusField = aeAmtOf('xf', 0);
exFocusField.focus();
exFocusField.value = '-4';
A.ops.renameAction('cats', 'slash', 'Rake');
A.state.flush();
const exMidTyping = exFocusField.value;
exFocusField.value = exFocusField.dataset.was;
exFocusField.blur();
A.state.flush();
A.ops.renameAction('cats', 'slash', 'Slash');
A.state.flush();

A.ops.renameAction('cats', exMade, 'Prowl');
A.state.flush();
aeTypeAmount(aeAmtOf('xf', 0), '-8');
aeAmtOf('xf', 0).blur();
A.state.flush();
const exBeforeUndo = aeAmtOf('xf', 0).value;
A.ops.undo();
A.state.flush();
const exAfterUndo = aeAmtOf('xf', 0).value;
const exUndoAgrees = exAfterUndo === String(aeRecordOf(exMade).xf[0].d);
check(
  '69d. a repaint raised from outside leaves a FOCUSED amount field untouched, '
    + 'and an undo repaints a row nobody is standing in back to the value state '
    + 'now holds — the first is why the field is static markup, the second is '
    + 'why the fill runs from the record on every frame rather than from '
    + 'whoever last pressed something',
  exMidTyping === '-4' && exBeforeUndo === '-8' && exAfterUndo !== '-8'
    && exUndoAgrees === true && errPanel.hidden === true,
  'field mid-typing under an outside commit=' + JSON.stringify(exMidTyping)
    + ' field after the write=' + JSON.stringify(exBeforeUndo)
    + ' after the undo=' + JSON.stringify(exAfterUndo)
    + ' record now=' + JSON.stringify(aeRecordOf(exMade).xf[0])
);

/* 69e. EMPTYING A SLOT SHORTENS THE LIST, AND THE SURPLUS ROW IS HIDDEN RATHER
   THAN DESTROYED. The empty entry at the head of a chooser is the one named
   path [S05] gives for removing a term, so there is no second control and no
   second spelling. A destroyed static row is a row the next repaint cannot
   find, which is why the parent is read back too. */
const exXfWas = aeRecordOf(exMade).xf.length;
aePress(aePillFor('xf', 1, 'edTok', ''));
A.state.flush();
const exXfOne = aeRecordOf(exMade).xf.length;
aePress(aePillFor('xf', 0, 'edTok', ''));
A.state.flush();
const exXfNone = aeRecordOf(exMade).xf.length;
const exSurplus = dom.byId['act-edit-xf-1'];
const exFirstRow = dom.byId['act-edit-xf-0'];
check(
  '69e. the empty entry at the head of a chooser takes a term out of the list '
    + 'and the list gets SHORTER, the row that is now surplus is hidden rather '
    + 'than destroyed, and one empty slot is always left to write into — that '
    + 'empty slot is the whole affordance, so there is no Add control anywhere '
    + 'and no second spelling of a removal',
  exXfWas === 2 && exXfOne === 1 && exXfNone === 0
    && exSurplus.hidden === true
    && exSurplus.parentNode === dom.byId['act-edit-terms']
    && exFirstRow.hidden === false
    && aeAmtOf('xf', 0).hidden === true
    && errPanel.hidden === true,
  'transformations before=' + exXfWas + ' after one removal=' + exXfOne
    + ' after both=' + exXfNone
    + ' surplus row hidden=' + exSurplus.hidden
    + ' still in the terms block=' + (exSurplus.parentNode === dom.byId['act-edit-terms'])
    + ' the empty slot is shown=' + (exFirstRow.hidden === false)
    + ' with its amount hidden=' + aeAmtOf('xf', 0).hidden
);

/* 69f. THE PARTY CHOOSER IS THE EXPORTED ALLOWLIST, AND THE AMOUNT FIELD
   CARRIES NO data-act. The first half is T-03.1-27: `who` is checked against
   XF_WHO by [S05] and turned into one of the page's own two words here, so the
   id never reaches a class, a selector or a rendered string — and a word
   missing from the page's map would silently drop a party from the chooser,
   which is why the two lists are compared rather than eyeballed.

   The second half is a trap this dialog sets for itself. Every other control in
   here is routed by data-act on pointerdown, so a data-act on an INPUT would
   fire the very op the field exists to send on Enter, the moment a student
   clicked into it to type. */
aePress(aePillFor('xf', 0, 'edTok', 'hp'));
A.state.flush();
const exWhoPills = aePills('xf', 0).filter((b) => typeof b.dataset.edWho === 'string');
const exWhoIds = exWhoPills.map((b) => b.dataset.edWho).join(',');
const exWhoWords = exWhoPills.map((b) =>
  b.children.map((c) => c.textContent).join('')).join('|');
const exAmtActs = ['cost', 'req', 'xf'].map((field) => {
  const slots = field === 'cost' ? [0] : [0, 1];
  return slots.map((slot) => aeAmtOf(field, slot))
    .filter((f) => typeof f.dataset.act === 'string').length;
}).reduce((a, b) => a + b, 0);
check(
  '69f. the party chooser is the EXPORTED XF_WHO allowlist turned into the '
    + 'page\'s own two words — the id never reaches a class, a selector or a '
    + 'rendered string, and a party with no word here would be dropped from the '
    + 'chooser silently, so the two lists are compared. And no amount field '
    + 'carries a data-act: every other control in this dialog is routed by one '
    + 'on pointerdown, so an input wearing one would fire its op the moment a '
    + 'student clicked in to type',
  exWhoIds === A.data.XF_WHO.join(',')
    && exWhoWords === 'Caster✓|Target✓'
    && exAmtActs === 0
    && errPanel.hidden === true,
  'party ids on the chooser=' + JSON.stringify(exWhoIds)
    + ' allowlist=' + JSON.stringify(A.data.XF_WHO.join(','))
    + ' words on the page=' + JSON.stringify(exWhoWords)
    + ' amount fields carrying a data-act=' + exAmtActs
);

if (aeDialog.open === true) { aeDialog.close(); }
clearPanel();
A.state.restore(aeSaved);
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
       writes, so a static title on a relabelled node is still read.

       ACT-01 IS THE SAME REQUIREMENT ABOUT A SECOND RECORD, and it needs a
       THIRD entry here rather than a reuse of the first. Since phase 3.1 a
       student can name an ACTION, and that name reaches the page in three
       places — the card in the faction column, the relationship lines in the
       band, and the strip's line naming what the figures leave out. An action
       is not a token type: it is a different record, read by a different
       function, and routing one through the other would put the token
       vocabulary's fall-through behaviour on an action's card. So [data-anm]
       is its own channel and is skipped for TEXT only, exactly as [data-lbl]
       is, and for the same reason — a static title on such a node is still
       read. The marker carries the action's id where the node's whole text is
       one name, and carries nothing where the node's text is a sentence the
       region assembled out of names; both are text a student supplied, which
       is the only fact this walk is deciding on.

       THE WALK IS A NAMED FUNCTION BECAUSE IT NOW RUNS OVER MORE THAN ONE ROOT.
       `</main>` closes at cats-vs-mechs.html:692 and the first <dialog> opens at
       :728, a SIBLING of #app rather than a descendant — so every string a
       dialog renders was outside this gate entirely, measured at 96 of them for
       the token-appearance picker alone. Layer A still reads a dialog's static
       markup and Layer B still reads a whole-string literal; what neither can
       see is copy ASSEMBLED at render time out of fragments, which is the shape
       every line the action-authoring surfaces produce will take. So the harvest
       is lifted out, run over #app exactly as before, and run again over each
       dialog — with DIALOG_ROOTS gated in BOTH directions against the dialogs
       the stub page builds, for the same reason the stub-drift gate is
       bidirectional: a promise that a list will be grown is not a gate. */
A.state.flush();

const LABEL_ATTRS = ['aria-label', 'title', 'placeholder'];

// Each entry records WHERE it was read as well as WHAT was read, so a hit names
// the surface it came off rather than leaving the reader to find it.
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
      const value = node.getAttribute ? node.getAttribute(attr) : null;
      if (typeof value === 'string' && value !== '') {
        into.push({ s: value, where: where });
      }
    });
    node.children.forEach(harvest);
  })(root);
  return into;
}

const renderedText = harvestInto(dom.byId['app'], [], '#app');

/* --- the dialog roots, and the gate that keeps this list honest --------------
   DIALOG_ROOTS names every <dialog> the shell carries and, where the static
   markup supplies one, the act a student presses to reach it. Driving the
   opener rather than calling showModal() by hand is deliberate: it exercises
   the same handler a student does, so a dialog whose opener was unregistered
   harvests an empty box and trips its own floor instead of passing on nothing.

   The list is checked in BOTH directions against the dialogs the stub page
   actually builds. A dialog the stub builds that is missing from here would be
   a surface this gate never reads — which is the state the picker was in before
   this plan, and the state the next dialog would inherit by default. An entry
   here the stub does not build would be this gate reporting a clean scan over a
   node that is not there. Neither can be left to a future author remembering. */
const DIALOG_ROOTS = [
  { id: 'tok-picker', act: 'openTokenPicker' },
  // plan 03.1-05's action editor. It is harvested from the moment it exists,
  // which is the whole point of the check below being bidirectional: this entry
  // could not have been forgotten, because leaving it out fails the run.
  { id: 'act-edit', act: 'openActionEditor' }
];

const stubDialogIds = [];
(function findDialogs(node) {
  node.children.forEach((child) => {
    if (child.tagName === 'DIALOG') {
      stubDialogIds.push(String(child.getAttribute('id')));
    }
    findDialogs(child);
  });
})(dom.document.body);

const rootIds = DIALOG_ROOTS.map((r) => r.id);
const dialogsNotHarvested = stubDialogIds.filter((id) => rootIds.indexOf(id) === -1);
const rootsNotBuilt = rootIds.filter((id) => stubDialogIds.indexOf(id) === -1);

check(
  '47b. every <dialog> the stub page builds is named in DIALOG_ROOTS and every '
    + 'DIALOG_ROOTS entry is a dialog the stub page builds — the rendered-page '
    + 'walk reads #app, and a surface that is a SIBLING of #app rather than a '
    + 'descendant is outside it until this list says otherwise',
  dialogsNotHarvested.length === 0 && rootsNotBuilt.length === 0,
  'built by the stub but never harvested: '
    + (dialogsNotHarvested.join(', ') || 'none')
    + ' | named here but not built: ' + (rootsNotBuilt.join(', ') || 'none')
);

// Open, let the frame land, read, close. openDialogs() is a function because
// check 47d below drives the identical pass a second time under a renamed type.
function openDialogs() {
  const out = [];
  DIALOG_ROOTS.forEach((root) => {
    const node = dom.byId[root.id];
    if (!node) { return; }
    if (node.open === true && typeof node.close === 'function') { node.close(); }
    const opener = root.act
      ? stub.querySelector('[data-act="' + root.act + '"]')
      : null;
    if (opener !== null) { press(opener); release(opener); }
    else if (typeof node.showModal === 'function') { node.showModal(); }
    A.state.flush();
    harvestInto(node, out, '#' + root.id);
    if (typeof node.close === 'function') { node.close(); }
    A.state.flush();
  });
  return out;
}

const dialogText = openDialogs();

const RENDERED_VERDICT_WORDS = VERDICT_WORDS.concat(VERDICT_LITERAL_WORDS);

// ONE word list for both roots, not two. A second list is a second thing to
// keep in step, and the only difference between a word on the board and the
// same word in a dialog is which node it was read off — which the record
// already carries.
function verdictHitsIn(items) {
  const found = [];
  items.forEach((item) => {
    RENDERED_VERDICT_WORDS.forEach((rule) => {
      if (rule.re.test(item.s)) {
        found.push('[' + rule.label + '] in ' + JSON.stringify(item.s)
          + ' (read from ' + item.where + ')');
      }
    });
  });
  return found;
}

// TWO GAPS IN THE WORD LIST, MEASURED THIS SESSION AND REPORTED RATHER THAN
// WIDENED. /\blead\b/i does not match "leads", so "leads on damage" passes; and
// /dominat/i does not match "dominant", because the word is dominan-t, so "the
// dominant action" passes. Neither is widened here — a widening belongs with
// the plan that measures its false positives — and neither is exploited: the
// copy this phase ships is arithmetic, not evaluative.
const renderedHits = verdictHitsIn(renderedText.concat(dialogText));

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
//     to 125;
//   plan 03.1-04 takes it DOWN, to 127, and the floor to 117 — the first plan
//     to move this number in that direction, and the reason is worth having in
//     front of whoever moves it next. Nothing was removed from the page. Eight
//     strings that used to be READ here are now EXEMPT, because they are words
//     a student typed rather than words the artifact chose: six action names,
//     one per card, and the two relationship lines in the band, which are built
//     out of action names. That is the same trade plan 03.1-01 made in the
//     dialog, where 96 became 91.
//
// 117 is chosen against five measurements, taken this session against the
// patched artifact, rather than picked. The shipped board harvests 127 here and
// 123 on a board with no gate drives behind it; a board shrunk to one unit a
// side harvests 95; each unit card is worth EXACTLY 7 strings, measured by
// adding three Mechs one at a time and watching 123 go 130, 137, 144; and an
// authored action is worth 1, its name being exempt and its damage line not. So
// 117 sits a full unit card and a half below the shipped figure — headroom
// against a legitimate change to the shipped roster — while sitting far above
// the zero a walk reading the wrong node would report.
//
// The strip's 13 strings and the reference material's 12 — one in the band's
// heading, eleven across the six action cards — are roster-INdependent, and
// every one of them is separately pinned by checks 49-55 and 58-60, which
// assert them by name. This floor is only ever about the walk still reaching
// the page.
check(
  '47. the rendered-page walk actually reaches the page, so a clean result is a '
    + 'read page rather than an empty one',
  renderedText.length > 117,
  'harvested ' + renderedText.length + ' strings from #app; the floor is 117'
);

// THE DIALOG HARVEST'S OWN FLOOR, kept separate from 125 above because the two
// numbers move for unrelated reasons: 125 tracks the roster and the board, this
// one tracks how many strings a dialog paints while it is open. Same history
// habit, so the next plan to touch it inherits data rather than a bare number.
//   plan 03.1-01 opens this line. The token-appearance picker renders 96 strings
//     unexempted — the figure phase 3.1's research measured — and 91 once the
//     list row's label and the editor heading take their exemption marker. The
//     difference is exactly six: one label per live token type, of which the
//     shipped board has five, plus the heading.
//   plan 03.1-04 adds ACT-07's line beside Remove and the figure does NOT move:
//     91 before, 91 after. Two reasons at once, and both are worth having
//     written down. On the shipped board the line is empty, and the walk's own
//     non-empty test skips it. Once a student's own type has an action naming
//     it the line fills — and it carries the action-name marker, so it is
//     skipped for text either way. Check 47g drives exactly that state and
//     reads this same harvest off it, so the zero here is a measured zero
//     rather than an untested surface.
//
//   plan 03.1-05 adds a SECOND dialog and the figure goes 91 -> 98. The action
//     editor is worth exactly seven: two faction names and two ticks on the
//     side chooser, and one tick per list row, three of them on the shipped
//     board. Its heading and its three row labels are all action names, so all
//     four take the action-name marker and none of them is read — the same
//     trade the picker made when 96 became 91, and the reason a surface built
//     almost entirely out of the student's own words adds so little here.
//
// 84 WAS CHOSEN AGAINST ONE DIALOG AND IS RAISED TO 91 FOR TWO, WHICH IS THE
// POINT OF THIS PARAGRAPH RATHER THAN A HOUSEKEEPING NOTE. The floor is over
// the TOTAL of every root, so a floor left at 84 while the total went to 98
// would have stopped bounding either surface: the whole action editor could
// have gone dark — never opened, its opener unregistered — and 91 would still
// have cleared it. The original arithmetic is kept exactly: 84 was seven below
// the one-dialog figure of 91, and 91 is seven below the two-dialog figure of
// 98. Seven is still more than an entire list is worth on either surface, so a
// board stripped back to a single token type and a single action a side still
// clears it, and it still sits far above the zero a dialog that never opened
// would report.
//
// The three swatch grids are fixed by SHAPES, COLORS and GLYPHS and move only
// when those allowlists do. A picker list row is worth EXACTLY ONE harvested
// string — measured: the shipped board harvests 91, one type of a student's own
// takes it to 92 and a second to 93 — and an editor list row is worth exactly
// one for the same reason, the tick beside it, the name being exempted.
//
// THE RULE FOR THE NEXT PLAN THAT ADDS A DIALOG: re-measure, and move this
// number so it stays one surface's worth below the new total. A floor that is
// not moved when a root is added is a floor that quietly stops bounding
// anything, which is the same silent shrink every other floor in this file
// carries a history note to prevent.
//
// 91 IS RAISED TO 134 BY PLAN 03.1-06, AND THE RULE ABOVE IS WHY. That plan
// added no root, but it filled the action editor's term rows, and the total
// went from 98 to 141 in one change. The rows are worth 43 strings between
// them: three legends and three notes that are the artifact's own words, two
// party pills and a token pill per row per token type on the board, each with
// its tick, and an aria-label on each of the five amount fields. Left at 91,
// every one of those could have gone dark and the picker's 91 alone would
// still have cleared the floor. The arithmetic is the one this note has kept
// twice already: seven below the measured total.
const DIALOG_FLOOR = 134;

// The floor for a harvest of the PICKER ALONE, which check 47g takes because it
// opens one dialog rather than every one. It was reading DIALOG_FLOOR, and that
// was wrong in a way that was invisible while the two numbers happened to be
// close: DIALOG_FLOOR is over the TOTAL of every root, and a one-root harvest
// compared against it passed by a single string. Raising the total floor for
// plan 03.1-06 is what surfaced it. This is the original one-dialog arithmetic,
// kept: seven below the picker's measured 91.
const PICKER_FLOOR = 84;
console.log('scan: ' + dialogText.length + ' rendered strings read from '
  + DIALOG_ROOTS.length + ' dialog root(s) — '
  + DIALOG_ROOTS.map((r) => '#' + r.id).join(', ')
  + ' (Layer C, floor ' + DIALOG_FLOOR + ')');

check(
  '47c. the dialog harvest actually reaches the dialogs. Every surface this '
    + 'phase builds lives in one, and a dialog that was never opened harvests '
    + 'nothing and would report a spotlessly clean scan forever',
  dialogText.length > DIALOG_FLOOR,
  'harvested ' + dialogText.length + ' strings from '
    + DIALOG_ROOTS.map((r) => '#' + r.id).join(', ')
    + '; the floor is ' + DIALOG_FLOOR
);

check(
  '48. PROJ-06 — nothing on the rendered page judges a build, in #app or in any '
    + 'dialog, and a student who names their own type after a comparative word '
    + 'does not trip it',
  renderedHits.length === 0,
  renderedHits.length === 0
    ? 'clean across ' + (renderedText.length + dialogText.length)
      + ' rendered strings (' + renderedText.length + ' from #app, '
      + dialogText.length + ' from the dialogs)'
    : renderedHits.join(' | ')
);

/* --- 47d. THE CONTROL FOR THE EXEMPTION, because an exemption nothing exercises
       is a comment. ALLOC-10 lets a student name a token type anything, and the
       picker paints that name twice — once per list row, once in the editor
       heading. Before this plan neither node carried the marker and neither was
       read, so the extension above would have turned a student's own word into a
       red CI run: the gate would have been asserting the opposite of the
       requirement, which is about what the ARTIFACT says.

       Driven through the real rename op and the real repaint rather than by
       planting text, because a planted string proves nothing about the path the
       word actually travels. The board is put back afterwards. --- */
const controlWas = A.state.get().build.tokens.hp.name;
A.ops.renameTokenType('hp', 'Winner');
A.state.flush();
const controlText = openDialogs();
const controlHits = verdictHitsIn(controlText);
A.ops.renameTokenType('hp', controlWas);
A.state.flush();

check(
  '47d. a type a student named after a comparative word reaches the dialog '
    + 'through labelFor and does NOT redden the run — the exemption marker on '
    + 'the list row and on the editor heading is load-bearing, not decorative',
  controlHits.length === 0 && controlText.length > DIALOG_FLOOR,
  controlHits.length === 0
    ? 'clean across ' + controlText.length + ' dialog strings under the rename'
    : controlHits.join(' | ')
);

/* --- 47e. THE SAME CONTROL FOR THE SECOND RECORD, and it is a separate row
       rather than a widening of 47d because it exercises a different channel on
       a different surface. ACT-01 lets a student name an ACTION anything, and
       that name reaches #app in two places at once: the card in the faction
       column, and — for one of the six the board ships with — the relationship
       lines in the band, which are built out of action names.

       BOTH WRITE PATHS ARE DRIVEN, because they are not the same frame. A
       rename is a plain commit and lands through the sync passes alone; a
       create is structural and lands through the builder. A row that drove only
       one of them would leave half the exemption unexercised, which is the
       WR-01 lesson from Phase 3 written as a control instead of as a tripwire.

       Driven through the real ops and the real repaint rather than by planting
       text, for 47d's reason: a planted string proves nothing about the path the
       word actually travels. The board is put back afterwards. --- */
const actCtlWas = A.state.get().build.mechs.actions
  .filter((a) => a.id === 'lasers')[0].name;
A.ops.renameAction('mechs', 'lasers', 'Winner');
const actCtlMade = A.ops.createAction('cats', 'Overpowered');
A.state.flush();
const actCtlText = harvestInto(dom.byId['app'], [], '#app');
const actCtlHits = verdictHitsIn(actCtlText);
const actCtlBand = refBandLines().map((n) => n.textContent).join(' | ');
A.ops.removeAction('cats', actCtlMade);
A.ops.renameAction('mechs', 'lasers', actCtlWas);
A.state.flush();

check(
  '47e. an ACTION a student named after a comparative word — one renamed, one '
    + 'created — does NOT redden the run, and the band naming the renamed one '
    + 'moved with it. The card marker and the band marker are load-bearing, not '
    + 'decorative, and the band half is what proves the rename reached a '
    + 'sentence rather than only a label',
  actCtlHits.length === 0
    && actCtlText.length > 117
    && actCtlBand.indexOf('Winner') !== -1,
  actCtlHits.length === 0
    ? 'clean across ' + actCtlText.length + ' #app strings under the two names; '
      + 'band read ' + JSON.stringify(actCtlBand)
    : actCtlHits.join(' | ')
);

/* --- 47f. THE THIRD SURFACE A STUDENT'S ACTION NAME REACHES, and the one that
       was easiest to miss: D-16's admission line names the actions the figures
       leave out, so it prints a student's word into the strip. If that line
       were read by this walk, an action a student named after a comparative
       word and then wrote a rule the projection cannot carry would redden CI
       for saying exactly what D-16 requires it to say.

       The line is driven into its VISIBLE state on purpose. Empty it is
       excluded by the walk's own non-empty test and this row would prove
       nothing — which is the vacuous shape this repo has now found four times.

       restore() rather than an op, because no op in this phase writes a
       transformation: ACT-05 is half-delivered by design and the editor is
       another plan's. restore() is the suite's documented writer. --- */
const admitSaved = JSON.stringify(A.state.get());
const admitDriven = JSON.parse(admitSaved);
admitDriven.build.cats.actions.push({
  id: 'x1', name: 'Better', dmg: 0, keywords: [],
  cost: [{ tok: 'ap', n: 1 }], req: [],
  xf: [{ who: 'target', tok: 'shield', d: -2 }]
});
A.state.restore(JSON.stringify(admitDriven));
A.state.flush();
const admitNode = strip ? strip.querySelectorAll('[data-prj="ignored"]')[0] : null;
const admitRead = admitNode ? admitNode.textContent : '(no node)';
const admitHidden = admitNode ? admitNode.hidden : '(no node)';
const admitText = harvestInto(dom.byId['app'], [], '#app');
const admitHits = verdictHitsIn(admitText);
A.state.restore(admitSaved);
A.state.flush();
const admitAfter = admitNode ? admitNode.textContent : '(no node)';

check(
  '47f. the strip NAMES the actions its figures leave out, and a student who '
    + 'named one after a comparative word does not redden the run for it — the '
    + 'admission carries the same marker the cards do, and the line goes quiet '
    + 'again when the board does',
  admitHits.length === 0
    && admitRead === 'Not shown in these figures: Better.'
    && admitHidden === false
    && admitAfter === ''
    && admitText.length > 117,
  admitHits.length === 0
    ? 'line read ' + JSON.stringify(admitRead) + ', hidden=' + admitHidden
      + ', put back as ' + JSON.stringify(admitAfter)
      + ', clean across ' + admitText.length + ' #app strings'
    : admitHits.join(' | ')
);

/* --- 47g. THE FOURTH SURFACE, and the only one where a student's two records
       appear in the SAME sentence: ACT-07's line beside Remove names a token
       type and the actions that name it, both read live. 47d covered a type in
       the dialog and 47e an action on the board; neither covers the line that
       holds both at once, which is the string a student would actually be
       looking at when they named a type one comparative word and an action
       another.

       Driven the way 40b-40g drive it — the real opener, the real create, the
       real renames — and read off the open dialog through the same harvest the
       gate uses, not off the node by hand. The board is put back after. --- */
const bothSaved = JSON.stringify(A.state.get());
if (dlg.open === true) { dlg.close(); }
press(openBtn);
release(openBtn);
A.state.flush();
press(pkNewUnit);
release(pkNewUnit);
A.state.flush();
const bothTok = dlg.dataset.tok;
A.ops.renameTokenType(bothTok, 'Winner');
const bothAct = A.ops.createAction('cats', 'Overpowered');
A.state.flush();
const bothState = JSON.parse(JSON.stringify(A.state.get()));
bothState.build.cats.actions.forEach((a) => {
  if (a.id === bothAct) { a.xf = [{ who: 'target', tok: bothTok, d: -1 }]; }
});
A.state.restore(JSON.stringify(bothState));
A.state.flush();
const bothLine = pkLine();
const bothText = harvestInto(dlg, [], '#tok-picker');
const bothHits = verdictHitsIn(bothText);
if (dlg.open === true) { dlg.close(); }
A.state.restore(bothSaved);
A.state.flush();
clearPanel();

check(
  '47g. a type named after one comparative word and an action named after '
    + 'another meet in ACT-07\'s line beside Remove, and the run stays clean — '
    + 'the line carries the action-name marker, which is what keeps a gate '
    + 'about what the ARTIFACT says from reddening on what a STUDENT typed',
  bothHits.length === 0
    && bothLine === 'Winner is named by Overpowered. Removing it will leave '
      + 'that action without a term.'
    && bothText.length > PICKER_FLOOR,
  bothHits.length === 0
    ? 'line read ' + JSON.stringify(bothLine) + ', clean across '
      + bothText.length + ' picker strings (floor ' + PICKER_FLOOR + ')'
    : bothHits.join(' | ')
);

/* --- 69g. LAYER C OVER THE ACTION EDITOR WITH EVERY TERM ROW POPULATED, and
       with a comparative word in every channel a student can reach: the action
       name, a token type name, and therefore every chooser pill and the editor
       heading at once. This is the row plan 03.1-06 owes, and it is separate
       from 47d and 47e because it exercises a THIRD channel — the term rows
       draw a token type's name once per pill per row, which is five rows times
       the whole vocabulary, and not one of those nodes existed when 47d was
       written.

       The editor is driven directly rather than through openDialogs(), because
       that helper opens each root through its own opener and the editor opens
       COLD on the first side and that side's first action — which is not the
       action this row populated. --- */
const fullSaved = JSON.stringify(A.state.get());
const fullTok = A.ops.createTokenType({
  name: 'Superior', shape: 'hex', color: 'coral', glyph: '', scope: 'unit'
});
const fullAct = A.ops.createAction('mechs', 'Unfair');
A.ops.setActionCost('mechs', fullAct, fullTok, 2);
A.ops.setActionReq('mechs', fullAct, 0, 'hp', 2);
A.ops.setActionReq('mechs', fullAct, 1, fullTok, 1);
A.ops.setActionXf('mechs', fullAct, 0, A.data.XF_WHO[1], 'hp', -3);
A.ops.setActionXf('mechs', fullAct, 1, A.data.XF_WHO[0], fullTok, 2);
A.state.flush();

const fullDlg = dom.byId['act-edit'];
if (fullDlg.open !== true) { fullDlg.showModal(); }
A.render.editor(A.state.get(), 'mechs', fullAct);
A.state.flush();
const fullRowsShown = ['act-edit-cost', 'act-edit-req-0', 'act-edit-req-1',
  'act-edit-xf-0', 'act-edit-xf-1'].filter((id) => dom.byId[id].hidden === false);
const fullAmountsShown = ['act-edit-cost-amt', 'act-edit-req-0-amt',
  'act-edit-req-1-amt', 'act-edit-xf-0-amt', 'act-edit-xf-1-amt']
  .filter((id) => dom.byId[id].hidden === false && dom.byId[id].value !== '');
const fullText = harvestInto(fullDlg, [], '#act-edit');
const fullHits = verdictHitsIn(fullText);
if (fullDlg.open === true) { fullDlg.close(); }
A.state.restore(fullSaved);
A.state.flush();
clearPanel();

check(
  '69g. every term row of the action editor is populated at once — a cost, two '
    + 'requirements and two transformations, over an action and a token type a '
    + 'student named after comparative words — and the rendered-page walk over '
    + 'the whole dialog stays clean. The token name reaches the page once per '
    + 'chooser pill per row, which is a channel that did not exist when the '
    + 'first exemption control was written',
  fullHits.length === 0 && fullRowsShown.length === 5
    && fullAmountsShown.length === 5,
  fullHits.length === 0
    ? 'clean across ' + fullText.length + ' strings harvested from #act-edit '
      + 'with all ' + fullRowsShown.length + ' term rows shown and all '
      + fullAmountsShown.length + ' amounts filled'
    : fullHits.join(' | ')
);

/* --- 71-71e. plan 03.1-07's PROPOSAL PANE ------------------------------------

   ACT-05's first half, ACT-06 and ACT-07. These rows drive App.render.editor
   and the pane attribute DIRECTLY rather than through a control, for the
   reason 66-66e give about the authoring pane: the handlers get their own rows
   further down, and a render row that went through a handler would go red for
   two unrelated reasons at once.

   THE PANE IS WALKED EXPLICITLY RATHER THAN READ OFF textContent. The stub's
   textContent is NOT recursive — it is whatever was assigned to that one node
   — so a row that read the pane's own textContent would read the empty string
   and pass over anything. Every assertion below concatenates the leaf text,
   which is the same walk Layer C uses minus the exemption skip: here the
   student's own words are exactly what is being asserted. */
const apDlg = dom.byId['act-edit'];
const apPane = dom.byId['act-edit-propose'];

function paneText(node) {
  const out = [];
  (function walk(n) {
    if (!n) { return; }
    if (n.children.length === 0 && typeof n.textContent === 'string') {
      out.push(n.textContent);
    }
    n.children.forEach(walk);
  })(node);
  return out.join('');
}

// Every control in the pane, keyed by its data-k so the reading survives the
// chooser pills being rebuilt on every repaint. A raw node list would compare
// object identity and go red for a repaint rather than for a disable.
function disabledIn(root) {
  const out = [];
  ['button', 'input'].forEach((tag) => {
    root.querySelectorAll(tag).forEach((n) => {
      out.push(String(n.dataset.k || n.getAttribute('id') || '?')
        + '=' + (n.disabled === true));
    });
  });
  return out.sort().join('|');
}

function apShow(side, actionId) {
  if (apDlg.open !== true) { apDlg.showModal(); }
  apDlg.dataset.edPane = 'propose';
  A.render.editor(A.state.get(), side, actionId);
  A.state.flush();
}
function apHide() {
  apDlg.dataset.edPane = 'author';
  A.render.editor(A.state.get(), apDlg.dataset.edSide, apDlg.dataset.edPick);
  A.state.flush();
}
function apRows() {
  return apPane.querySelectorAll('.ae-prop-row').filter((r) => r.hidden === false);
}
function apAmounts() {
  return apPane.querySelectorAll('.ae-prop-row')
    .map((r) => (r.hidden ? null : r.querySelectorAll('.ae-prop-amt')[0].value))
    .filter((v) => v !== null);
}

/* 71. THE DEVELOPER'S OWN EXAMPLE, PROPOSED. One action point, needs two
   Health, target Health minus three — the exact action CONTEXT names as the
   test this phase is built toward — read back off the pane as a restatement,
   a cost line, a requirement line and one editable field pre-filled from the
   record. */
const apSaved = JSON.stringify(A.state.get());
const apAct = A.ops.createAction('cats', 'Pounce');
A.ops.setActionCost('cats', apAct, 'ap', 1);
A.ops.setActionReq('cats', apAct, 0, 'hp', 2);
A.ops.setActionXf('cats', apAct, 0, A.data.XF_WHO[1], 'hp', -3);
A.state.flush();
apShow('cats', apAct);

// Read off the live board rather than written down here. The gate has driven
// the roster and the pool by the time these rows run, and a hand-typed 27
// would assert this file's memory of the shipped board instead of what the
// report is reading.
const apHave = A.state.get().build.cats.ap;
const apHp = A.state.get().build.cats.units.reduce((n, u) => n + u.maxHp, 0);
const apUnits = A.state.get().build.cats.units.length;

const apSays = paneText(dom.byId['act-prop-says']);
const apCostLine = paneText(dom.byId['act-prop-cost']);
const apReqLine = paneText(dom.byId['act-prop-reqs']);
const apFields = apAmounts();
const apTitle = paneText(dom.byId['act-prop-title']);
const apCasterPicks = apPane.querySelectorAll('[data-ap="caster"]').length;
const apTargetPicks = apPane.querySelectorAll('[data-ap="target"]').length;
const apChosen = apPane.querySelectorAll('[data-ap="target"]')
  .filter((b) => b.className.indexOf('ae-prop-pill--on') !== -1)
  .map((b) => b.dataset.apUnit).join(',');

check(
  '71. the proposal restates the student\'s own rule — the party, the token '
    + 'and the SIGNED amount, in the terms the record holds — and reports what '
    + 'the action costs against what the side has and what the requirement '
    + 'needs against what is present. One editable field per transformation is '
    + 'pre-filled from the record. This is the developer\'s own example, the '
    + 'action CONTEXT names as the test the phase is built toward',
  apSays === 'Your Pounce says: target Health -3, caster Action points -1'
    && apCostLine === 'Pounce costs 1 Action points of ' + apHave + '. Enough to spend.'
    && apReqLine === 'Pounce needs 2 Health of ' + apHp + '. Requirement met.'
    && apFields.join(',') === '-3'
    && apTitle === 'Pounce'
    && apCasterPicks === apUnits
    && apTargetPicks === apUnits + A.state.get().build.mechs.units.length
    && apChosen === A.state.get().build.cats.units[0].id,
  'says=' + JSON.stringify(apSays) + ' cost=' + JSON.stringify(apCostLine)
    + ' req=' + JSON.stringify(apReqLine) + ' fields=' + JSON.stringify(apFields)
    + ' title=' + JSON.stringify(apTitle)
    + ' caster picks=' + apCasterPicks + ' target picks=' + apTargetPicks
    + ' target chosen=' + JSON.stringify(apChosen)
);

/* 71b. THE NAMES ARE READ LIVE. A student who renames Health to Vigor must
   read Vigor in the restatement, in the cost line, in the requirement line and
   on the editable row's label, on the frame the rename lands — and the static
   rows must NOT have been rebuilt underneath them, which is the whole reason
   they are static markup. Node identity is compared before and after. */
const apRowNodes = apPane.querySelectorAll('.ae-prop-row');
const apRowWas = apRowNodes[0];
const apAmtWas = apRowWas.querySelectorAll('.ae-prop-amt')[0];
A.ops.renameTokenType('hp', 'Vigor');
A.state.flush();
const apSaysV = paneText(dom.byId['act-prop-says']);
const apReqV = paneText(dom.byId['act-prop-reqs']);
const apRowLblV = paneText(apRowWas.querySelectorAll('.ae-prop-lbl')[0]);
const apSameNodes = apPane.querySelectorAll('.ae-prop-row')[0] === apRowWas
  && apRowWas.querySelectorAll('.ae-prop-amt')[0] === apAmtWas;
A.ops.renameTokenType('hp', 'Health');
A.state.flush();

check(
  '71b. every token name on the proposal is read LIVE, so renaming Health to '
    + 'Vigor moves the restatement, the requirement line and the editable '
    + 'row\'s own label on the frame it lands — and the static row and the '
    + 'field inside it are the SAME NODES afterwards, which is the whole '
    + 'reason they are static markup rather than rebuilt',
  apSaysV === 'Your Pounce says: target Vigor -3, caster Action points -1'
    && apReqV === 'Pounce needs 2 Vigor of ' + apHp + '. Requirement met.'
    && apRowLblV === 'target Vigor'
    && apSameNodes === true,
  'says=' + JSON.stringify(apSaysV) + ' req=' + JSON.stringify(apReqV)
    + ' row label=' + JSON.stringify(apRowLblV)
    + ' same nodes=' + apSameNodes
);

/* 71c. ACT-06, AND IT IS THE WHOLE OF IT. The report is a statement about what
   the BOARD holds and never a ruling on what the STUDENT may do, so driving
   the side to nothing to spend and the roster below a requirement must move
   the NUMBERS and must not move one control's disabled state.

   The full set is compared rather than the terminal control alone, keyed by
   data-k so the chooser pills being rebuilt on every repaint does not read as
   a change. A row that watched one button would be green over a pane that
   disabled every other one. */
A.ops.setActionReq('cats', apAct, 0, 'hp', 99);
A.state.flush();
const apDisabledWas = disabledIn(apPane);
const apCostWas = paneText(dom.byId['act-prop-cost']);
const apReqWas = paneText(dom.byId['act-prop-reqs']);

A.ops.setFactionAp('cats', 0);
A.state.flush();
const apDisabledPoor = disabledIn(apPane);
const apCostPoor = paneText(dom.byId['act-prop-cost']);

A.state.get().build.cats.units.forEach((u) => { A.ops.setUnitMaxHp('cats', u.id, 1); });
A.state.flush();
const apDisabledThin = disabledIn(apPane);
const apReqThin = paneText(dom.byId['act-prop-reqs']);

check(
  '71c. the affordability report rules on NOTHING. Driving the side to no '
    + 'action points and every unit below the requirement moves the numbers on '
    + 'the cost line and on the requirement line, and changes not one '
    + 'control\'s disabled state anywhere on the pane. The tool never decides '
    + 'whether an action happens — the picker\'s Remove IS disabled and that is '
    + 'a bound on what the TOOL may do, which is a different thing entirely',
  apCostWas === 'Pounce costs 1 Action points of ' + apHave + '. Enough to spend.'
    && apCostPoor === 'Pounce costs 1 Action points of 0. Not enough to spend. Short by 1.'
    && apReqWas === 'Pounce needs 99 Health of ' + apHp + '. Requirement not met.'
    && apReqThin === 'Pounce needs 99 Health of ' + apUnits + '. Requirement not met.'
    && apDisabledWas === apDisabledPoor && apDisabledWas === apDisabledThin
    && apDisabledWas.indexOf('=true') === -1,
  'cost before=' + JSON.stringify(apCostWas) + ' after=' + JSON.stringify(apCostPoor)
    + ' req before=' + JSON.stringify(apReqWas) + ' after=' + JSON.stringify(apReqThin)
    + ' disabled set before=' + JSON.stringify(apDisabledWas)
    + ' with nothing to spend=' + JSON.stringify(apDisabledPoor)
    + ' with the roster thinned=' + JSON.stringify(apDisabledThin)
);

/* 71d. ACT-07. A rule naming a token type that has GONE is refused by name and
   never draws — not skipped, not fired with a missing term. The message names
   the action by its LIVE name and the term by the ID it still carries, which
   is deliberate: the type's record has gone, so asking labelFor for a name
   would get the shipped health label back and print a name that is actively
   wrong. */
A.state.restore(apSaved);
A.state.flush();
const apGoneTok = A.ops.createTokenType({
  name: 'Poison', shape: 'dia', color: 'violet', glyph: '', scope: 'unit'
});
const apGoneAct = A.ops.createAction('cats', 'Envenom');
A.ops.setActionXf('cats', apGoneAct, 0, A.data.XF_WHO[1], apGoneTok, -2);
A.ops.renameAction('cats', apGoneAct, 'Sting');
A.state.flush();
apShow('cats', apGoneAct);
const apDrewBefore = apRows().length;
A.ops.removeTokenType(apGoneTok);
A.state.flush();
const apRefuseNode = dom.byId['act-prop-refuse'];
const apRefuseText = paneText(apRefuseNode);
const apDrewAfter = apRows().length;
const apSaysAfter = paneText(dom.byId['act-prop-says']);
const apReportAfter = paneText(dom.byId['act-prop-cost'])
  + paneText(dom.byId['act-prop-reqs']);

check(
  '71d. an action naming a token type that has since been removed is REFUSED '
    + 'by name — the message names the action\'s live name and the term\'s ID, '
    + 'and no proposal is drawn at all. The id rather than a name is the point: '
    + 'the type\'s record has gone, so the label reader falls back to the '
    + 'shipped health label for an id it cannot find and would print a name '
    + 'that is actively wrong',
  apDrewBefore === 1 && apDrewAfter === 0
    && apRefuseNode.hidden === false
    && apRefuseText === 'Cannot fire Sting. What it changes names ' + apGoneTok
      + ', which is no longer a token type on this board. Nothing has changed.'
    && apSaysAfter === '' && apReportAfter === '',
  'rows before the removal=' + apDrewBefore + ' after=' + apDrewAfter
    + ' refusal hidden=' + apRefuseNode.hidden
    + ' refusal=' + JSON.stringify(apRefuseText)
    + ' restatement after=' + JSON.stringify(apSaysAfter)
    + ' report after=' + JSON.stringify(apReportAfter)
);

/* 71e. LAYER C OVER THE PROPOSAL PANE, and it is a row of its own rather than
   a widening of 69g because it exercises a channel nothing else can reach.
   Every line on this pane is ASSEMBLED at render time out of the artifact's
   words and the student's — which is precisely what Layers A and B cannot see,
   because not one of those sentences exists as a literal anywhere. The
   dialog-wide harvest opens each root COLD, so it lands on the authoring pane
   and reads none of this; the pane has to be opened here or the whole surface
   is outside the only gate that could read it.

   Driven over an action named after one comparative word and a token type
   named after another, so the exemption on the assembled fragments is
   exercised rather than asserted. */
A.state.restore(apSaved);
A.state.flush();
const apCTok = A.ops.createTokenType({
  name: 'Winner', shape: 'hex', color: 'coral', glyph: '', scope: 'unit'
});
const apCAct = A.ops.createAction('mechs', 'Superior');
A.ops.setActionCost('mechs', apCAct, 'ap', 2);
A.ops.setActionReq('mechs', apCAct, 0, apCTok, 1);
A.ops.setActionXf('mechs', apCAct, 0, A.data.XF_WHO[1], 'hp', -4);
A.ops.setActionXf('mechs', apCAct, 1, A.data.XF_WHO[0], apCTok, 3);
A.state.flush();
apShow('mechs', apCAct);
const apCText = harvestInto(apPane, [], '#act-edit-propose');
const apCHits = verdictHitsIn(apCText);
const apCSays = paneText(dom.byId['act-prop-says']);
apHide();
A.state.restore(apSaved);
A.state.flush();
clearPanel();

// THE PROPOSAL PANE'S OWN FLOOR, kept apart from DIALOG_FLOOR for the reason
// PICKER_FLOOR is kept apart from it: that number is over the TOTAL of every
// root with each opened COLD, so it lands on the AUTHORING pane and reads none
// of this. The proposal only exists once something inside the dialog has been
// pressed, which is entry 13 on the closing list of what this gate cannot
// reach — this row is that entry closed for one surface.
//
// MEASURED AT 60 on the board this row drives — a Mechs action carrying two
// transformations and a cost, over a 9-and-3 roster and a vocabulary of seven
// — and 23 is chosen by arithmetic rather than by taste. The arithmetic is the
// per-pill worth, measured in the same run:
//   a unit pill is worth EXACTLY 2, its name and its tick, because a unit's
//     name carries no exemption — no op in this file renames one;
//   a party pill is worth exactly 2, for the same reason;
//   a token pill is worth exactly 1, the tick alone, because the type's name
//     is a word the STUDENT typed and carries the exemption marker.
// So the 3 caster and 12 target pills are worth 30 and the override row's 7
// token pills are worth 7 — 37 of the 60 move with the roster or with the
// vocabulary. The remaining 23 move with neither: the restatement's fragments,
// the cost line's, the requirement line's, the two editable row labels, the
// three aria-labels on the amount fields and the override row's two party
// pills.
//
// 23 is therefore the exact reading of a pane whose unit choosers AND token
// chooser went dark, which trips it — while the smallest board this file can
// produce, one unit a side over the five shipped types that cannot be removed,
// reads 23 + 6 + 5 = 34 and clears it. THE RULE FOR THE NEXT PLAN THAT ADDS A
// LINE HERE: re-measure, and move this number by the roster-independent part
// alone.
const PROPOSE_FLOOR = 23;
const apCTicks = apCText.filter((item) => item.s === '✓').length;
console.log('scan: ' + apCText.length + ' rendered strings read from '
  + '#act-edit-propose with the pane OPEN (Layer C, floor ' + PROPOSE_FLOOR
  + '), of which ' + apCTicks + ' are chooser ticks');

check(
  '71e. every line the proposal pane paints is assembled at render time out of '
    + 'the artifact\'s words and the student\'s, which is the one shape Layers '
    + 'A and B cannot see — and the walk over the OPEN pane stays clean with '
    + 'an action named after one comparative word and a token type named after '
    + 'another. The harvest is floored, because a pane that never opened reads '
    + 'spotlessly clean forever',
  apCHits.length === 0 && apCText.length > PROPOSE_FLOOR
    && apCSays === 'Your Superior says: target Health -4, caster Winner +3, '
      + 'caster Action points -2',
  apCHits.length === 0
    ? 'clean across ' + apCText.length + ' strings harvested from the open '
      + 'proposal pane (floor ' + PROPOSE_FLOOR + ', of which ' + apCTicks
      + ' are chooser ticks); restatement=' + JSON.stringify(apCSays)
    : apCHits.join(' | ')
);

/* --- 72-72c. NOTHING LANDS, AND THAT IS THE REQUIREMENT ----------------------

   These are the phase's most important rows. PROJECT.md's Out of Scope entry
   says a tool that resolved combat would remove the learning, and CONTEXT.md
   answers it with four sentences: the tool SHOWS what the student's rule says,
   the student accepts it, edits it or overrides it entirely, NOTHING LANDS
   until they say so, and in this phase "they say so" is Advance — which is
   Phase 5. Everything above proves the pane shows the rule. These prove the
   other half, which is an ABSENCE, and an absence is the one kind of claim
   that rots silently.

   72 IS DRIVEN THROUGH REAL CONTROLS END TO END and asserts BOTH halves at
   once, which is deliberate: a row that only compared the state would be green
   over a pane whose every press did nothing at all. So the page is read back
   as well — the ticks moved, the fields hold what was typed, the override row
   points at what was pressed — and only then is the state compared character
   for character. */

// FNV-1a, so a failing run prints something a reader can compare at a glance
// instead of two four-thousand-character strings. The equality assertion is on
// the strings themselves; this is for the message.
function fnv(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
}

const nlSaved = JSON.stringify(A.state.get());
const nlAct = A.ops.createAction('cats', 'Pounce');
A.ops.setActionCost('cats', nlAct, 'ap', 1);
A.ops.setActionReq('cats', nlAct, 0, 'hp', 2);
A.ops.setActionXf('cats', nlAct, 0, A.data.XF_WHO[1], 'hp', -3);
A.ops.setActionXf('cats', nlAct, 1, A.data.XF_WHO[0], 'shield', 2);
A.state.flush();

// Ended and reopened, so the open is COLD and lands on the first side — the
// rows above left the editor standing on the Mechs. Driven through Done rather
// than by calling close(), for the reason every row in this block is driven
// through a control.
if (apDlg.open === true) {
  const nlEnd = dom.byId['act-edit-done'];
  press(nlEnd); release(nlEnd);
  A.state.flush();
}

// Opened through the topbar control a student presses, then moved onto the
// authored action by pressing its own row — no attribute is poked anywhere in
// this block.
const nlOpener = stub.querySelector('[data-act="openActionEditor"]');
press(nlOpener); release(nlOpener);
A.state.flush();
const nlRow = dom.byId['act-edit-list'].children
  .filter((c) => c.dataset.edPick === nlAct)[0];
press(nlRow); release(nlRow);
A.state.flush();

// THE READING EVERYTHING BELOW IS COMPARED AGAINST: taken after the authoring
// and before the proposal is opened.
const nlBefore = JSON.stringify(A.state.get());
const nlDepthBefore = A.state.undoDepth();
const nlCommitsBefore = commits();

const nlOpenBtn = dom.byId['act-prop-open'];
press(nlOpenBtn); release(nlOpenBtn);
A.state.flush();
const nlShown = apDlg.dataset.edPane === 'propose'
  && apPane.hidden === false
  && dom.byId['act-edit-pane-author'].hidden === true;
const nlPreFilled = apAmounts().join(',');

// Every field on the pane, changed through the keyboard: focus records the
// baseline, Enter commits — which here means the field holds the number and
// nothing was written.
const nlTyped = [];
apPane.querySelectorAll('.ae-prop-amt').forEach((field, i) => {
  field.focus();
  field.value = String(-9 - i);
  nlTyped.push(String(-9 - i));
  field.dispatchEvent(dom.event('keydown', { key: 'Enter' }));
});
A.state.flush();

// A caster and a target the student chooses, and the override line the rule
// did not state. Re-queried after every press, because the choosers are
// rebuilt on every repaint.
function nlPress(sel, index) {
  const node = apPane.querySelectorAll(sel)[index];
  press(node); release(node);
  A.state.flush();
  return node;
}
const nlCasterId = nlPress('[data-ap="caster"]', 3).dataset.apUnit;
const nlTargetId = nlPress('[data-ap="target"]', 10).dataset.apUnit;
const nlWhoId = nlPress('[data-ap="over-who"]', 1).dataset.apWho;
const nlTokId = nlPress('[data-ap="over-tok"]', 2).dataset.apTok;

function nlOn(sel, key) {
  return apPane.querySelectorAll(sel)
    .filter((b) => b.className.indexOf('ae-prop-pill--on') !== -1)
    .map((b) => b.dataset[key]).join(',');
}
const nlPageMoved = nlOn('[data-ap="caster"]', 'apUnit') === nlCasterId
  && nlOn('[data-ap="target"]', 'apUnit') === nlTargetId
  && nlOn('[data-ap="over-who"]', 'apWho') === nlWhoId
  && nlOn('[data-ap="over-tok"]', 'apTok') === nlTokId
  && apPane.querySelectorAll('.ae-prop-amt').map((f) => f.value).join(',')
    === nlTyped.join(',');

const nlCloseBtn = dom.byId['act-prop-close'];
press(nlCloseBtn); release(nlCloseBtn);
A.state.flush();

const nlAfter = JSON.stringify(A.state.get());

check(
  '72. THE NOTHING-LANDS CHECK. A full cycle driven through real controls — '
    + 'open the editor, select an authored action, open the proposal, change '
    + 'EVERY field, choose a caster and a target, add an override line the '
    + 'rule did not state, close the pane — moves the page and leaves the '
    + 'state BYTE-IDENTICAL to the reading taken before the proposal opened. '
    + 'The undo depth does not move and no commit is made. Both halves are '
    + 'asserted together on purpose: a row that compared only the state would '
    + 'be spotlessly green over a pane whose every press did nothing at all',
  nlShown === true && nlPreFilled === '-3,2' && nlPageMoved === true
    && nlAfter === nlBefore
    && A.state.undoDepth() === nlDepthBefore
    && commits() === nlCommitsBefore
    && apDlg.dataset.edPane === 'author',
  'pane shown=' + nlShown + ' pre-filled=' + JSON.stringify(nlPreFilled)
    + ' typed=' + JSON.stringify(nlTyped.join(','))
    + ' page moved=' + nlPageMoved
    + ' caster=' + nlCasterId + ' target=' + nlTargetId
    + ' override=' + nlWhoId + '/' + nlTokId
    + ' state before=' + fnv(nlBefore) + ' (' + nlBefore.length + ' chars)'
    + ' after=' + fnv(nlAfter) + ' (' + nlAfter.length + ' chars)'
    + ' identical=' + (nlBefore === nlAfter)
    + ' undo depth ' + nlDepthBefore + ' -> ' + A.state.undoDepth()
    + ' commits ' + nlCommitsBefore + ' -> ' + commits()
    + ' pane after the close=' + apDlg.dataset.edPane
);

/* 72b. THE NO-APPLIER CHECK, and the absence IS the requirement rather than an
   accident of what has been written so far. There is no op that applies a
   transformation because a declared action lands on ADVANCE, in Phase 5
   (D-05b) — so the export list is read back off the live object, and the
   router is driven with an applier's name to prove there is no arm for one
   either. A list read from source spelling would be blind to an applier
   reached through a helper, which is Phase 3's own WR-01 lesson. */
const nlExports = Object.keys(A.ops).sort();
const nlAppliers = nlExports.filter((k) =>
  /^(apply|resolve|advance|spend|fire|perform|execute|enact|land|deal|damage)/i.test(k));
let nlRouterRefused = false;
try {
  A.ops.dispatch('applyProposal', { side: 'cats' });
} catch (refused) {
  nlRouterRefused = true;
}
const nlAfterRouter = JSON.stringify(A.state.get());

check(
  '72b. THE NO-APPLIER CHECK. [S05] exports no function that applies a '
    + 'transformation, and App.ops.dispatch has no arm for one — read off the '
    + 'LIVE export list and driven through the LIVE router rather than grepped '
    + 'for, because a check written against source spelling cannot see '
    + 'behaviour reached through a helper. The absence is the requirement: the '
    + 'tool proposes and the student disposes, and a declared action lands on '
    + 'Advance, which belongs to Phase 5',
  nlAppliers.length === 0 && nlExports.length > 0 && nlRouterRefused === true
    && nlAfterRouter === nlAfter,
  'appliers found: ' + (nlAppliers.join(', ') || 'none')
    + ' | router refused an applier act: ' + nlRouterRefused
    + ' | state stood still: ' + (nlAfterRouter === nlAfter)
    + ' | App.ops exports ' + nlExports.length + ': ' + nlExports.join(', ')
);

/* 72c. THE FIELD CONTRACT, and the ONE line of it this pane keeps differently.
   Enter commits — which here means the field holds the number — and a repaint
   raised from outside immediately afterwards must NOT hand the rule's own
   number back. That is the one place in this file where "nothing derived is
   stored" needs care rather than obedience: everywhere else the field shows a
   number STATE holds, and here it shows the student's INPUT, which no record
   remembers because writing one is the thing this pane does not do.

   Escape puts the recorded text back and leaves the dialog open. And closing
   and reopening shows the RULE'S numbers again, which is the deliberate
   behaviour of a surface that lands nothing rather than an edit lost. */
press(nlOpenBtn); release(nlOpenBtn);
A.state.flush();
const fcField = apPane.querySelectorAll('.ae-prop-row')
  .filter((r) => r.hidden === false)[0].querySelectorAll('.ae-prop-amt')[0];
const fcFresh = fcField.value;
fcField.focus();
fcField.value = '-4';
fcField.dispatchEvent(dom.event('keydown', { key: 'Enter' }));
const fcTyped = fcField.value;
// FOCUS IS MOVED OFF THE FIELD FIRST, AND THAT LINE IS THE WHOLE ROW.
//
// Written without it, this clause was VACUOUS and probe Y proved it: the fill
// already skips a field that holds focus — showAmount's rule (D-19), which
// every field on this surface keeps — so a repaint driven while the caret is
// still in the field is skipped for a reason that has nothing to do with the
// edit. Removing the edited-field guard entirely left this row green.
//
// The case that MATTERS is the one a student actually reaches: type -4, press
// Enter, click away, and then something elsewhere moves the board. Focus is
// gone by then, so the only thing standing between the student's number and
// the rule's own is the edited flag.
stub.body.focus();
// A repaint raised from OUTSIDE, on a field the student has changed and is no
// longer standing in.
A.ops.setFactionAp('cats', 2);
A.state.flush();
const fcSurvived = fcField.value;

fcField.value = '-7';
fcField.dispatchEvent(dom.event('keydown', { key: 'Escape' }));
const fcReverted = fcField.value;
const fcStillOpen = apDlg.open === true && apPane.hidden === false;

press(nlCloseBtn); release(nlCloseBtn);
A.state.flush();
press(nlOpenBtn); release(nlOpenBtn);
A.state.flush();
const fcReopened = apPane.querySelectorAll('.ae-prop-row')
  .filter((r) => r.hidden === false)[0].querySelectorAll('.ae-prop-amt')[0].value;

const fcCommits = commits();
const fcState = JSON.stringify(A.state.get());
press(nlCloseBtn); release(nlCloseBtn);
A.state.flush();
A.state.restore(nlSaved);
A.state.flush();
clearPanel();

check(
  '72c. Enter over a pre-filled amount leaves the field holding the student\'s '
    + 'number, a repaint raised from outside immediately afterwards does NOT '
    + 'restore the rule\'s own, Escape puts the recorded text back and leaves '
    + 'the dialog open, and closing and reopening the pane shows the record\'s '
    + 'numbers again — the edits were never persisted, which is the deliberate '
    + 'behaviour of a pane that lands nothing and not a defect',
  fcFresh === '-3' && fcTyped === '-4' && fcSurvived === '-4'
    && fcReverted === '-4' && fcStillOpen === true && fcReopened === '-3',
  'fresh=' + JSON.stringify(fcFresh) + ' after Enter=' + JSON.stringify(fcTyped)
    + ' after an outside repaint=' + JSON.stringify(fcSurvived)
    + ' after Escape=' + JSON.stringify(fcReverted)
    + ' dialog still open=' + fcStillOpen
    + ' after close and reopen=' + JSON.stringify(fcReopened)
    + ' commits during the reopen=' + fcCommits
    + ' state length=' + fcState.length
);

/* --- 73-73c. THE PHASE'S OWN ACCEPTANCE RUN, END TO END ----------------------

   CONTEXT.md names this as the test the phase is built toward: "cost = 1 action
   point (consumed), requirement = 2 health (not consumed), transformation =
   target loses some amount of a resource. If that action can be authored,
   fired, proposed and confirmed, the phase works." Confirm is Advance and
   belongs to Phase 5 (D-05b); everything before it is here, as ONE contiguous
   sequence driven through real controls with no state poked anywhere in it.

   IT LIVES HERE RATHER THAN IN [S09.10], and the reason is worth writing down.
   That suite opens by saying every row in it is DOM-FREE on purpose, so the
   terminal harness gets the whole of it rather than a skip row — and an
   acceptance run driven through the surface is the opposite of DOM-free. A row
   bracketed on `typeof document !== 'undefined'` inside that suite would not
   run in this harness at all, which is where the phase's verification actually
   looks. So the DRIVEN half is here, where it runs, and the BOUNDARY half — no
   applier, no proposal in any slice, the remaining half of ACT-05 owned by
   Phase 5 — is in [S09.10], where it is DOM-free and runs everywhere. */

// The shipped board, so the figures below are the ones plan 03.1-02 pinned
// rather than whatever this gate's earlier drives left behind. This line is
// SETUP and sits outside the sequence the row asserts.
if (apDlg.open === true) {
  const accEnd = dom.byId['act-edit-done'];
  press(accEnd); release(accEnd);
  A.state.flush();
}
A.ops.resetToDefaults();
A.state.flush();

const accShippedState = JSON.stringify(A.state.get());
const accShipped = [prjText('turns', 'cats'), prjText('work', 'cats'),
  prjText('turns', 'mechs'), prjText('work', 'mechs')].join(' | ');
const accShippedCards = refCards('cats')
  .map((c) => c.querySelectorAll('.ref-action')[0].textContent).join(',');

/* ---- the sequence. Every step below is a control a student presses. ---- */
press(nlOpener); release(nlOpener);
A.state.flush();
aePress(aeNew);
const accId = aeDialog.dataset.edPick;

const accName = dom.byId['act-edit-name'];
accName.focus();
accName.value = 'Pounce';
accName.dispatchEvent(dom.event('input'));
accName.dispatchEvent(dom.event('keydown', { key: 'Enter' }));
A.state.flush();

aePress(aePillFor('cost', 0, 'edTok', 'ap'));
aeTypeAmount(aeAmtOf('cost', 0), '1');
aePress(aePillFor('req', 0, 'edTok', 'hp'));
aeTypeAmount(aeAmtOf('req', 0), '2');
aePress(aePillFor('xf', 0, 'edTok', 'hp'));
aePress(aePillFor('xf', 0, 'edWho', 'target'));
aeTypeAmount(aeAmtOf('xf', 0), '-3');
aeAmtOf('xf', 0).blur();
A.state.flush();

// The card in the faction column names it, which is the authored action
// reaching the BOARD rather than only the dialog.
const accCard = refCardNamed('cats', 'Pounce');
// And the strip moves to the figure plan 03.1-02 measured for this exact
// action: three damage a use, three uses a turn off a three-point pool.
const accProjected = [prjText('turns', 'cats'), prjText('work', 'cats')].join(' | ');

press(nlOpenBtn); release(nlOpenBtn);
A.state.flush();
const accSays = paneText(dom.byId['act-prop-says']);
const accCost = paneText(dom.byId['act-prop-cost']);
const accReq = paneText(dom.byId['act-prop-reqs']);

const accBefore = JSON.stringify(A.state.get());
const accField = apPane.querySelectorAll('.ae-prop-row')
  .filter((r) => r.hidden === false)[0].querySelectorAll('.ae-prop-amt')[0];
accField.focus();
accField.value = '-6';
accField.dispatchEvent(dom.event('keydown', { key: 'Enter' }));
const accEdited = accField.value;
const accOverWho = nlPress('[data-ap="over-who"]', 0).dataset.apWho;
const accOverTok = nlPress('[data-ap="over-tok"]', 1).dataset.apTok;
const accOverAmt = apPane.querySelector('.ae-prop-over')
  .querySelectorAll('.ae-prop-amt')[0];
accOverAmt.focus();
accOverAmt.value = '+4';
accOverAmt.dispatchEvent(dom.event('keydown', { key: 'Enter' }));
const accOverride = accOverWho + '/' + accOverTok + '/' + accOverAmt.value;

press(nlCloseBtn); release(nlCloseBtn);
A.state.flush();
const accAfter = JSON.stringify(A.state.get());

// Undone through the topbar control, not through the op, and only until the
// board is the shipped one again — a fixed count would be a second place the
// number of commits this sequence makes has to be kept in step.
const accUndo = stub.querySelector('[data-act="undo"]');
let accSteps = 0;
while (JSON.stringify(A.state.get()) !== accShippedState && accSteps < 20) {
  press(accUndo); release(accUndo);
  A.state.flush();
  accSteps++;
}
const accBack = [prjText('turns', 'cats'), prjText('work', 'cats'),
  prjText('turns', 'mechs'), prjText('work', 'mechs')].join(' | ');
const accBackCards = refCards('cats')
  .map((c) => c.querySelectorAll('.ref-action')[0].textContent).join(',');

check(
  '73. THE PHASE\'S OWN ACCEPTANCE RUN. An action created, named, given a cost '
    + 'of one action point, a requirement of two Health and a transformation of '
    + 'target Health minus three — all through real controls — appears on the '
    + 'board\'s own card, moves the projected figure to what plan 03.1-02 '
    + 'measured for this exact action, and then restates itself on the '
    + 'proposal with the board\'s real numbers beside it. A number is changed '
    + 'and a line the rule did not state is added; the pane closes; the state '
    + 'is byte-identical to the reading taken before it opened; and an undo '
    + 'back to the shipped board returns every figure to its shipped value',
  accCard !== null
    && accShipped === '≈9 turns to wipe Mechs | 27 health ÷ 3 per turn'
      + ' | ≈3 turns to wipe Cats | 27 health ÷ 9 per turn'
    && accProjected === '≈3 turns to wipe Mechs | 27 health ÷ 9 per turn'
    && accSays === 'Your Pounce says: target Health -3, caster Action points -1'
    && accCost === 'Pounce costs 1 Action points of 3. Enough to spend.'
    && accReq === 'Pounce needs 2 Health of 27. Requirement met.'
    // The second entry of the shipped vocabulary, which is deterministic
    // because the board was reset to defaults at the head of this sequence.
    // "+4" is read back as "4": the sign is a value, so the field is left
    // holding the number the parser read rather than the text that made it.
    && accEdited === '-6' && accOverride === 'caster/ap/4'
    && accAfter === accBefore
    && accBack === accShipped && accBackCards === accShippedCards
    && accSteps > 0 && accSteps < 20,
  'card on the board=' + (accCard === null ? 'MISSING' : 'Pounce')
    + ' | shipped strip=' + JSON.stringify(accShipped)
    + ' | with the action authored=' + JSON.stringify(accProjected)
    + ' | restatement=' + JSON.stringify(accSays)
    + ' | cost=' + JSON.stringify(accCost) + ' | requirement=' + JSON.stringify(accReq)
    + ' | field after the edit=' + JSON.stringify(accEdited)
    + ' | override line=' + JSON.stringify(accOverride)
    + ' | state before the proposal=' + fnv(accBefore)
    + ' after the close=' + fnv(accAfter)
    + ' identical=' + (accBefore === accAfter)
    + ' | undo steps=' + accSteps
    + ' | strip back to=' + JSON.stringify(accBack)
    + ' | cards back to=' + JSON.stringify(accBackCards)
);

/* 73b. THE TWO PARTY WORDS, BOTH SPELLINGS, AGAINST THE EXPORTED ALLOWLIST.
   The page says a party TWICE in two registers — capitalised on a control, and
   lower-case inside the restatement — and each spelling is its own map in
   [S06.5]. An id with no word in either would be pasted through as an empty
   fragment and read as a rule about nobody, so both maps are compared against
   App.data.XF_WHO here rather than trusted. Check 69f already holds the
   control spelling; this holds the sentence one, which no other row can see. */
A.ops.resetToDefaults();
A.state.flush();
const wsAct = A.ops.createAction('cats', 'Both');
A.data.XF_WHO.forEach((who, i) => {
  A.ops.setActionXf('cats', wsAct, i, who, 'hp', (i === 0) ? 2 : -2);
});
A.state.flush();
apShow('cats', wsAct);
const wsSaid = paneText(dom.byId['act-prop-says']);
const wsRowWords = apPane.querySelectorAll('.ae-prop-row')
  .filter((r) => r.hidden === false)
  .map((r) => paneText(r.querySelectorAll('.ae-prop-lbl')[0]).split(' ')[0]);
const wsPillWords = apPane.querySelectorAll('[data-ap="over-who"]')
  .map((b) => b.dataset.apWho + '=' + paneText(b).replace('✓', ''));
apHide();
A.state.restore(nlSaved);
A.state.flush();
clearPanel();

check(
  '73b. every party on the exported XF_WHO allowlist has a word in BOTH of the '
    + 'page\'s registers — capitalised on the override control, lower-case '
    + 'inside the restatement — and the two agree on which id they name. A '
    + 'party with no word in one of them would reach the page as an empty '
    + 'fragment and read as a rule about nobody',
  wsRowWords.join(',') === A.data.XF_WHO.join(',')
    && wsPillWords.join(',') === A.data.XF_WHO.map((w) =>
      w + '=' + w.charAt(0).toUpperCase() + w.slice(1)).join(',')
    && wsSaid === 'Your Both says: caster Health +2, target Health -2, '
      + 'caster Action points -1',
  'restatement=' + JSON.stringify(wsSaid)
    + ' | row words=' + JSON.stringify(wsRowWords.join(','))
    + ' | control words=' + JSON.stringify(wsPillWords.join(','))
    + ' | allowlist=' + JSON.stringify(A.data.XF_WHO.join(','))
);

/* 73c. THE SLICE KEY SETS, READ AFTER THE WHOLE RUN. This phase grows the
   record a faction holds, so the growth has to be LOUD — and the proposal is
   the one piece of this phase that must not be in any slice at all. Research
   measured that `Object.keys(build[side])` was asserted NOWHERE before plan
   03.1-01, so writing build.cats.proposal reddened nothing; the equality rows
   in [S09.3] closed that, and this reads them back HERE, after every drive in
   this file has run, rather than trusting a suite that runs before them.

   The name walk is the second half and it is not a duplicate: a key set can be
   correct at the top level while a proposal hides one level down inside a unit
   or an action, which is exactly where a plan under time pressure would put
   it. */
const skState = A.state.get();
const skWords = [];
(function walkKeys(node, where) {
  if (!node || typeof node !== 'object') { return; }
  Object.keys(node).forEach((k) => {
    if (/propos|override|caster|target|pending/i.test(k)) {
      skWords.push(where + '.' + k);
    }
    walkKeys(node[k], where + '.' + k);
  });
})(skState, 'state');

check(
  '73c. the three slices hold exactly their pinned key sets after every drive '
    + 'in this file, each faction holds exactly its five, and NOTHING anywhere '
    + 'in the state — at any depth, inside a unit or inside an action — is '
    + 'named after a proposal, an override, a caster, a target or a pending '
    + 'anything. The proposal lives on the DOM, which is what makes it '
    + 'impossible for undo, for a build code or for the projection to read one',
  Object.keys(skState).sort().join(',') === 'build,fight,ui'
    && Object.keys(skState.build).join(',') === 'schema,cats,mechs,tokens'
    && Object.keys(skState.build.cats).join(',') === 'id,name,ap,units,actions'
    && Object.keys(skState.build.mechs).join(',') === 'id,name,ap,units,actions'
    && skWords.length === 0,
  'slices=' + JSON.stringify(Object.keys(skState).sort().join(','))
    + ' build=' + JSON.stringify(Object.keys(skState.build).join(','))
    + ' cats=' + JSON.stringify(Object.keys(skState.build.cats).join(','))
    + ' mechs=' + JSON.stringify(Object.keys(skState.build.mechs).join(','))
    + ' | proposal-shaped keys found: ' + (skWords.join(', ') || 'none')
);

/* --- 70-70b. THE RULE IS A RECORD, AND THAT IS NOW A CHECK -------------------

   These two are the phase's defining constraint made mechanical. A student
   authoring an action is one small step from authoring code: a condition, a
   formula field, a "when" expression would each be a string the tool would have
   to interpret, and the moment one exists the artifact is running whatever a
   pasted build code says. Both halves are needed and neither implies the other
   — an artifact with no interpreter can still be handed a term holding a
   function, and a term walk cannot see an interpreter that has not been fed
   one yet. */

// 70. The source half. The abort at the top of this file already scans for
// these two patterns and exits before a single suite runs, and this row is NOT
// a duplicate of it: that scan is a shipping gate over a list of fourteen
// unrelated hazards, and this one is a NUMBERED check whose message names what
// it protects, so a plan that ever loosened the list would have to answer this
// row as well. Read off the artifact source rather than off anything in here.
const DYNAMIC_CODE = [
  { label: 'eval', re: /\beval\s*\(/g },
  { label: 'the Function constructor', re: /\bnew\s+Function\b|\bFunction\s*\(/g },
  { label: 'a string handed to setTimeout', re: /setTimeout\s*\(\s*['"]/g },
  { label: 'a string handed to setInterval', re: /setInterval\s*\(\s*['"]/g }
];
const dynamicHits = [];
DYNAMIC_CODE.forEach((rule) => {
  const re = new RegExp(rule.re.source, 'g');
  let m;
  while ((m = re.exec(html)) !== null) {
    dynamicHits.push('line ' + html.slice(0, m.index).split('\n').length
      + ' [' + rule.label + ']: ' + m[0]);
  }
});
check(
  '70. the artifact carries no way to turn a string into code — no eval, no '
    + 'Function constructor, no string handed to a timer. This phase lets a '
    + 'student write a RULE, which is one small step from writing code, and the '
    + 'whole of it rests on that rule staying a record the tool READS. An '
    + 'authored term is an id, an allowlisted word and a whole number, and the '
    + 'day one of these appears is the day a pasted build code can run whatever '
    + 'it likes on a workshop laptop',
  dynamicHits.length === 0,
  dynamicHits.length === 0
    ? 'none across ' + html.split('\n').length + ' lines of the artifact'
    : dynamicHits.join(' | ')
);

/* 70b. The data half, driven rather than read off the shipped board: every
   authored term in a state with all three field kinds populated on an action of
   a student's own, walked value by value. Every value must be a string from a
   list the board itself holds — a live token id, or a party on the exported
   XF_WHO allowlist — or a whole number. A function, an object, an array or a
   string naming nothing is a term the tool would have to interpret rather than
   read, and that is the line this phase does not cross. */
const walkSaved = JSON.stringify(A.state.get());
const walkTok = A.ops.createTokenType({
  name: 'Venom', shape: 'dia', color: 'violet', glyph: '', scope: 'unit'
});
const walkAct = A.ops.createAction('cats', 'Walked');
A.ops.setActionCost('cats', walkAct, walkTok, 3);
A.ops.setActionReq('cats', walkAct, 0, 'hp', 2);
A.ops.setActionReq('cats', walkAct, 1, walkTok, 0);
A.ops.setActionXf('cats', walkAct, 0, A.data.XF_WHO[1], 'hp', -3);
A.ops.setActionXf('cats', walkAct, 1, A.data.XF_WHO[0], walkTok, 5);
A.state.flush();

const TERM_KEYS = { cost: 'n,tok', req: 'n,tok', xf: 'd,tok,who' };
const walkVocab = Object.keys(A.state.get().build.tokens);
const walkBad = [];
let walkSeen = 0;
['cats', 'mechs'].forEach((side) => {
  A.state.get().build[side].actions.forEach((a) => {
    ['cost', 'req', 'xf'].forEach((field) => {
      const list = a[field];
      if (!Array.isArray(list)) {
        walkBad.push(side + '/' + a.id + '/' + field + ' is not a list');
        return;
      }
      list.forEach((term, i) => {
        const where = side + '/' + a.id + '/' + field + '[' + i + ']';
        walkSeen++;
        if (term === null || typeof term !== 'object' || Array.isArray(term)) {
          walkBad.push(where + ' is not a record: ' + typeof term);
          return;
        }
        const keys = Object.keys(term).sort().join(',');
        if (keys !== TERM_KEYS[field]) {
          walkBad.push(where + ' holds keys ' + JSON.stringify(keys)
            + ' rather than ' + JSON.stringify(TERM_KEYS[field]));
        }
        Object.keys(term).forEach((k) => {
          const v = term[k];
          if (typeof v === 'function') { walkBad.push(where + '.' + k + ' is a function'); return; }
          if (v !== null && typeof v === 'object') { walkBad.push(where + '.' + k + ' is an object'); return; }
          if (k === 'tok') {
            if (walkVocab.indexOf(v) === -1) {
              walkBad.push(where + '.tok names no token type on the board: ' + JSON.stringify(v));
            }
            return;
          }
          if (k === 'who') {
            if (A.data.XF_WHO.indexOf(v) === -1) {
              walkBad.push(where + '.who is not on the allowlist: ' + JSON.stringify(v));
            }
            return;
          }
          if (!Number.isInteger(v)) {
            walkBad.push(where + '.' + k + ' is not a whole number: ' + JSON.stringify(v));
          }
        });
      });
    });
  });
});
A.state.restore(walkSaved);
A.state.flush();
check(
  '70b. every value in every authored term, in a driven state with a cost, two '
    + 'requirements and two transformations on an action of a student\'s own, '
    + 'is either a string the board itself holds — a live token id, or a party '
    + 'on the exported XF_WHO allowlist — or a whole number. Not a function, '
    + 'not an object, not an array, and not a string naming nothing. A rule the '
    + 'tool READS is the whole of what this phase ships; a term holding '
    + 'anything else is a rule it would have to interpret',
  walkBad.length === 0 && walkSeen >= 11,
  walkBad.length === 0
    ? walkSeen + ' terms walked, every value an allowlisted string or a whole number'
    : walkBad.join(' | ')
);
clearPanel();

/* --- WHAT THIS GATE CANNOT REACH, named rather than left to be discovered.
       There is no browser and no layout engine in this repo, and the stub page
       is a hand-made stand-in rather than a parser. The behaviours numbered
       below therefore have no check above and are carried to the phase's
       closing rehearsal instead. (The count was written as "four" when the
       list held four; it is kept as a numbered list rather than a number in
       prose so that adding an entry cannot leave a stale total behind.)

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
            appears only once the fight has started is outside its reach until
            that surface is built and the walk is pointed at it. The dialog half
            of this entry was closed by plan 03.1-01 — see 12 and 13 below for
            what remains of it. The same goes for the static markup of the
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
            Still no layout engine here to answer it.
        12. A close request declined by ANY dialog, not only the picker. Entry 1
            named this of one surface; the harvest above is written to take a
            list of them, and the stub <dialog> has no close-request behaviour
            for any entry on that list. So the Escape-reverts-and-stays-open
            contract is a rehearsal item once per dialog, and adding a dialog
            adds one. What the bidirectional DIALOG_ROOTS gate does guarantee is
            that the new surface cannot be forgotten by the WALK; it says
            nothing about this behaviour.
        13. Words a dialog paints only after something happens INSIDE it. The
            harvest opens each dialog the way a student reaches it, lets one
            frame land and reads what is on it — so a line that appears only
            after a control in the dialog has been used is unread, exactly as
            entry 5 describes for the fight. Closing that needs the drive to be
            extended per surface, not the list. --- */

console.log(
  'interaction gate: ' + (gateChecks - gateFailures.length) + ' of ' + gateChecks
    + ' checks passed'
);

if (gateFailures.length > 0) {
  fail('INTERACTION GATE: ' + gateFailures.length + ' check(s) failed — '
    + gateFailures.join('; '));
}

process.exit(result.failed ? 1 : 0);
