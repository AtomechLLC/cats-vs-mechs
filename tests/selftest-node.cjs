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
  // Plan 05-01 adds exactly two words to this layer, and the test they had to
  // pass is the doctrine written above rather than "the phase would like them
  // banned". `victor` and `triumph` NAME AN OUTCOME the way `winner` and `loser`
  // two lines up do; neither has an innocent reading in this codebase, and a
  // comment or a CSS class carrying one is evidence the banned feature is
  // arriving. Measured over cats-vs-mechs.html before they were added here:
  // /victor/i -> 0 hits, /triumph/i -> 0 hits, whole document, comments and CSS
  // included.
  //
  // The other eleven candidates that plan measured are NOT here, and the reason
  // is the paragraph above rather than their hit counts. `won`, `winning`,
  // `lose`, `lost`, `defeat`, `outlast`, `dominant`, `leads`, `best`, `harder`
  // and `easier` are comparative or narrative English, not names for the banned
  // feature — the same judgement that moved `better`, `weak` and `dominat` down
  // to Layer B. Their measured document counts are recorded beside them there.
  { label: 'victor stem', re: /victor/i },
  { label: 'triumph stem', re: /triumph/i },
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
  // WIDENED BY PLAN 05-01, from /\bwins\b/ and /\bwin\b/ as two entries to one
  // that also covers `winning`. Measured over cats-vs-mechs.html first, because
  // that is the standing rule below: 2 hits in the whole document (line 198
  // `wins`, line 15795 `win`, both prose) and ZERO in the 5582 string literals
  // this layer reads. So the widening costs nothing here and closes the spelling
  // a fight surface reaches for first — "Mechs are winning".
  { label: 'win/wins/winning', re: /\bwin(s|ning)?\b/i },
  // `won` as a WHOLE WORD, not a stem: `wonder` and `wondering` are ordinary
  // English. Measured 0 document hits and 0 literal hits.
  { label: 'won', re: /\bwon\b/i },
  { label: 'edge', re: /\bedge\b/i },
  // WIDENED BY PLAN 05-01 from /\blead\b/ — this was one of the two gaps the
  // paragraph beside Layer C reported and declined to close, and this is the
  // plan that measured it: 3 document hits (lines 982, 987, 1604, all prose) and
  // ZERO literal hits.
  { label: 'lead/leads', re: /\bleads?\b/i },
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
  // WIDENED BY PLAN 05-01 from /dominat/, the second of the two reported gaps.
  // The word is dominan-t, so the old stem caught `dominate` and `domination`
  // and missed `dominant` — which is the spelling a fight surface would actually
  // reach for. One character class closes it. Measured: /dominan/i -> 0 document
  // hits, 0 literal hits.
  { label: 'dominant/dominate stem', re: /domina[nt]/i },
  { label: 'optimal', re: /optimal/i },
  { label: 'better', re: /better/i },
  { label: 'judgment', re: /judgment/i },
  // --- the rest of plan 05-01's widening, each with the count it was measured
  // at over cats-vs-mechs.html before it was added. Document hits are prose and
  // are what Layer A would have reddened on; literal hits are what THIS layer
  // reads, and every entry here measured ZERO of them.
  { label: 'defeat stem', re: /defeat/i },     // doc 4 (lines 3440, 3591, 6645, 8008), lit 0
  { label: 'outlast stem', re: /outlast/i },   // doc 0, lit 0
  { label: 'harder', re: /\bharder\b/i },      // doc 1 (line 571), lit 0
  { label: 'easier', re: /\beasier\b/i }       // doc 0, lit 0
];

// --- 2b-ii. the third list: words banned on the RENDERED page only ------------
// A THIRD list is not a third idea. It is the SAME split this file already made
// once, taken one notch further, and plan 05-01 was forced into it by
// measurement rather than choosing it for tidiness.
//
// The split above says: a COMMENT may discuss the concept, a STRING LITERAL may
// not carry the word. Three of that plan's candidates cannot live under that
// rule, because the artifact carries the word in a string literal that is not
// rendered copy at all — it is the prose of an in-file selftest CHECK LABEL:
//
//   /\blos(e|es|ing)\b/i  measured 13 document hits and 2 literal hits:
//       'and the columns rebuilt their cards rather than losing them'   (:16608)
//       'THAT GOES RED, instead of every shared build quietly losing the value inside a ' (:19275)
//   /\blost\b/i           measured 5 document hits and 1 literal hit:
//       'writes, and the only place a field can be lost without either half of the ' (:19358)
//   /\bbest\b/i           measured 4 document hits and 2 literal hits:
//       'cats best damage'    (:13454)
//       'mechs best damage'   (:13455)   — labels naming App.model.bestDamage
//
// Every one of those five is ordinary engineering English about DOM nodes,
// values and a model function. None of them judges a build. The wording is not
// wrong, so it was not reworded to make a pattern fit — that is the rule this
// plan worked under, and the artifact is untouched by it.
//
// The two alternatives were both worse. Narrowing until the hits vanish costs
// `losing`, which is the single likeliest spelling a fight surface would reach
// for, and there is no narrowing available at all for `best` or `lost`, which
// are already whole words. Declining them outright leaves "Cats lost", "Mechs
// are losing" and "the best build" shippable, and those are exactly the
// sentences this plan exists to make impossible.
//
// So they sit here: read by Layer C over the rendered page, and by nothing else.
//
// WHAT THAT GIVES UP, stated exactly, because narrowing a PROJ-06 layer is a
// real trade and not a tidy-up. For these three words only: the string literals
// of the script block, and the whole document. A verdict carrying one of them
// that never reaches a node this gate's walk reads would pass. Layer C reads
// #app in setup, #app with a fight running, and every dialog root — so the hole
// is copy that exists and is never painted in any of those five driven states,
// which is harness limitation 13's territory and is named there.
//
// THE RULE FOR THE NEXT PLAN THAT ADDS A WORD: try Layer A, then Layer B, then
// here, in that order, and put it in the highest layer whose measured hit count
// over cats-vs-mechs.html is zero. A word placed lower than it had to be is
// coverage given away for nothing.
const VERDICT_RENDERED_WORDS = [
  { label: 'lose/loses/losing', re: /\blos(e|es|ing)\b/i },
  { label: 'lost', re: /\blost\b/i },
  { label: 'best', re: /\bbest\b/i }
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
//     zero a suite that failed to register would report;
//   plan 04-01 opens [S09.11], the build-code suite, at 109 rows and takes the
//     run to 898, floored at 868 — the same margin of 30, and worth stating
//     plainly: all 109 of those rows run HERE. A codec is state work, so the
//     suite sits entirely above the no-DOM bracket five other suites stop at,
//     and this floor is the only thing bounding it. Eight of the 109 were
//     added AFTER the deliberate-failure probe that plan owed: the round-trip
//     rows alone stayed green over a byte layer written the naive way, because
//     the writer and the reader are symmetric and agree with each other while
//     both are wrong. The byte-shape and measured-cost rows are what the probe
//     reddens, and they are the reason this figure is 109 rather than 101.
//   plan 04-02 fills [S09.11] out with encode, decode and the round trip: 109
//     rows becomes 149 and the run goes to 938, floored at 908 — the same
//     margin of 30 the two plans before it kept. Forty rows, and the shape of
//     them is the point: six boards, each DRIVEN THROUGH THE SHIPPED OPS
//     rather than written out as a state literal, each round-tripped over a
//     stable writing of the record, each held against the alphabet allowlist
//     and each measured. A hand-written fixture agrees with whatever its
//     author believed the state shape was; a driven board agrees with the
//     file. Three of the six carry a size gate with the measured margin
//     written into the label; the two ceiling boards deliberately carry none,
//     because they are over the message limit by construction and the honest
//     thing is to record what they cost.
//     THREE OF THOSE FORTY-THREE were added AFTER the probe that plan owed, and
//     the reason is worth keeping: replacing the derived ordinal order with
//     plain object enumeration left every one of the six round trips GREEN,
//     because a DRIVEN vocabulary always enumerates in the order it was
//     written. The rows that see it hand encode the same board with its
//     vocabulary written down in another order and require the identical code
//     back. The run is 941 and the floor is 911.
//   plan 04-03 adds the HOSTILE half — the refusal matrix, the bad-input table,
//     the prototype rows and the reconstruction tripwire: 152 rows becomes 243
//     and the run goes to 1032, floored at 1002, which is the same margin of 30
//     the three plans before it kept. Ninety-one rows, and what makes them rows
//     about ninety-one things rather than one thing ninety-one times is a single step
//     that is invisible from the count: every tamper that names a CONTENT guard
//     changes the body and then RECOMPUTES the four-character digest, so it
//     arrives at the content guard instead of stopping at the checksum. Two
//     probes hold that claim up — removing one content bound reddened EXACTLY
//     one row, and removing the checksum comparison entirely reddened exactly
//     two and left all twelve content rows green, which is the proof they were
//     reaching past the digest all along.
//   plan 05-02 opens [S09.12], the fight loop: 40 rows, and the run goes from
//     1051 to 1093, floored at 1063 — the same margin of 30 the four plans
//     before it kept. Forty-two rows added in total, and the extra two are the
//     part worth recording: two SHIPPED rows in [S09.3] were repaired after a
//     probe measured them asserting nothing. Every shape row in that suite —
//     and this file's own check 73c — reads a state whose `fight` is null, so
//     the JSON-clonable and integers-only rules had never once been applied to
//     the slice Phase 5 writes into. A function put on the fight slice, and a
//     declaration array deliberately named `pending`, both left the entire
//     repo green. 73c is NOT widened for it: its job is to keep the proposal
//     off the slices and reaching further costs that guarantee. The reach is
//     added inside [S09.12] instead, over a fight that actually exists, with a
//     declaration and a resolved round in it.
//   plan 05-03 adds the shield-then-health split and the declaration to
//     [S09.12]: 40 rows becomes 75 and the run goes from 1093 to 1128, floored
//     at 1098 — the same margin of 30 the five plans before it kept. Thirty-five
//     rows, and the two worth recording are the ones that were WRONG on their
//     first run rather than the thirty-three that were right. One asserted an
//     undo-depth DELTA of four and measured zero, because UNDO_LIMIT is thirty
//     and by that point in the suite the stack is at its cap — so four new
//     entries push four old ones off the bottom and the delta reads zero over a
//     run where each declaration was its own entry AND over a run where all
//     four coalesced into one. It is now driven: declare two, undo once, and
//     read that the first is still standing. The other accepted only three
//     shapes of refusal message and so went red on the three that
//     requireActionId hands back opening with the offending id in quotes — a
//     row refusing the file's own refusals. Both are the same lesson from a
//     different angle: a row that cannot distinguish the failure it names from
//     the success it names is asserting nothing.
//     TWO PROBES ALSO CAME BACK GREEN AND THE DIAGNOSIS IS WORTH KEEPING. The
//     key-name row plan 05-02 added placed its declaration through a
//     hand-written App.state.commit, correctly, because no op existed. Once
//     declareAction shipped, re-spelling the OP's record { caster, target } left
//     the whole repo green: the walk was reaching a fight, but a fight the
//     SUITE had written rather than the one the op writes. The row now drives
//     the shipped op, and the same probe reddens naming
//     state.fight.decl.0.caster.
//   plan 05-04 ships advanceRound — the ONE applier in the file — and the run
//     goes from 1128 to 1156, floored at 1126, which is the same margin of 30
//     the six plans before it kept. Twenty-eight rows: one in [S09.10], where
//     the two boundary assertions written AGAINST this phase were turned in the
//     open into their positive form (an allowlist of exactly ['advanceRound'],
//     and a row that still DRIVES the router but now against a board with no
//     fight running), plus a fourth row holding "no op reads REFERENCE.beats
//     and no op writes keywords"; and the rest in [S09.12], where one round is
//     driven end to end with every consequence asserted separately. Check 72b
//     in THIS file carries the same allowlist and was turned in the same
//     change — it banned the applier family outright and would otherwise have
//     been a boundary assertion deleted by going quiet.
//     FOUR THINGS THE PROBES FOUND ARE WORTH KEEPING. PROBE M renamed the op
//     away and the new relationship row THREW a TypeError instead of failing,
//     aborting [S09.10] with one of its own rows never run and the board left
//     dirty for every suite after it — the third time in three plans that a
//     row which could throw was the defect. PROBE O then found that same row
//     half-blind: Hairball ships with an empty transformation list, so the
//     second of the two shipped relationships had no number to move and a
//     violation firing only on that pair would have passed; the row now
//     authors a term onto Hairball first. PROBE P found the undo row honest
//     and PROBE Q found the history row honest, both first time. And the
//     "declaration naming a removed unit" refusal the plan asked for is NOT
//     reachable: removeUnit edits the build, the fight roster is copied once
//     at startFight and never rebuilt, so no unit ever leaves a running fight.
//   plan 05-05 adds the hand rulings to [S09.12]: 102 rows becomes 131 and the
//     run goes from 1156 to 1185, floored at 1155 — the same margin of 30 the
//     seven plans before it kept. Twenty-nine rows, two of them measurements
//     (the ruling cap and the bytes it costs inside every one of the thirty
//     snapshots), and the [S09.3] shield
//     tripwire rewritten in place rather than added to: it said "shield is a
//     BUILD write, Phase 5 owns the fight slice's own copy" and asserted only
//     the build half, so a setFightShield that wrote `build` would have left it
//     spotlessly GREEN. It never reddened on this plan at all — a comment
//     tripwire rather than a mechanical one — and it is now a PAIR that drives
//     each writer against both slices.
//     THE THREE DEFECTS THE ROWS HAD ON THEIR FIRST RUN ARE THE PART WORTH
//     KEEPING, and all three were found by running them rather than by a probe.
//     One compared the board against a reading taken BEFORE its own fixture
//     step. One called the encoder by a namespace that does not exist and took
//     the suite down with a TypeError — the fifth plan in a row taught that a
//     row must be able to FAIL and not to THROW. And the marker row expected a
//     by-hand health ruling that was never recorded, because a real Advance had
//     already taken that unit to zero and the set landed where the board
//     already was: "a set that moved nothing is not a ruling", met in a
//     resolved round rather than in a comment. The row now reads both.
//   plan 05-13 ships D-27's three derivations — App.model.spokenFor, needsAt
//     and defaultAt — and the run goes from 1188 to 1207, floored at 1177,
//     which is the same margin of 30 the nine plans before it kept. NINETEEN
//     rows, all of them in [S09.12] and all of them above any no-DOM bracket,
//     because this plan is pure state work and draws nothing: six for
//     spokenFor (an empty round, one cost, a sum with the other side's
//     declaration excluded, an authored action taken away out from under a
//     standing declaration, a cost the file cannot price, and the fight slice
//     still opening on its five keys afterwards), five for needsAt (the two
//     shipped actions that aim a term at what they point at, the four that do
//     not plus one aimed at the one who acts, and the three malformed shapes a
//     pasted build code can hand over) and eight for defaultAt (the lowest
//     health, a dead-ruled unit skipped, a zero-health unit NOBODY ruled kept
//     — which is D-00d and the one a tidy implementation loses — a tie broken
//     by roster order and answered the same twice, nobody left standing,
//     an empty roster, never a unit on the acting side, and the prototype).
//     Then D-27's radio: declareAction replaces rather than appends when the
//     declaration names a performer who already holds one, and the run goes
//     from 1207 to 1216, floored at 1186 — the same margin of 30 again. NINE
//     more rows in [S09.12]: a replace that does not grow the list, a
//     different performer on the same side appending, a retarget (a replace
//     that moves only `at`), three nameless declarations all standing, a
//     replace succeeding at the ceiling while an append is refused by name
//     with the shipped wording, `at: null` in and `at: null` out on a board
//     where App.model.defaultAt would have answered a unit, two units in a
//     burst being two undo entries, two re-picks for ONE unit being one, and
//     the prototype. NOT ONE EXISTING ROW'S CLAIM CHANGED, and that was
//     verified by reading rather than assumed: every drive of this op in the
//     repo names a different performer per side within a round, and the one
//     pair that names `c1` twice has an advanceRound between them, whose step
//     4 empties `decl`.
const SUITE_FLOOR = 1186;
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
    // D-32 raised all three caps to four and gave the cost list slotted row
    // ids of its own — #act-edit-cost became #act-edit-cost-0 — so all three
    // lists spell a row the same way. The STUB DRIFT guard is what caught the
    // shell change here: it named all sixteen new ids on the first run after
    // the markup moved, which is exactly the failure it exists for.
    'act-edit-terms',
    'act-edit-cost-0', 'act-edit-cost-0-amt',
    'act-edit-cost-1', 'act-edit-cost-1-amt',
    'act-edit-cost-2', 'act-edit-cost-2-amt',
    'act-edit-cost-3', 'act-edit-cost-3-amt',
    'act-edit-req-0', 'act-edit-req-0-amt',
    'act-edit-req-1', 'act-edit-req-1-amt',
    'act-edit-req-2', 'act-edit-req-2-amt',
    'act-edit-req-3', 'act-edit-req-3-amt',
    'act-edit-xf-0', 'act-edit-xf-0-amt',
    'act-edit-xf-1', 'act-edit-xf-1-amt',
    'act-edit-xf-2', 'act-edit-xf-2-amt',
    'act-edit-xf-3', 'act-edit-xf-3-amt',
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
    'act-prop-rows', 'act-prop-close',
    // plan 04-05 — the share surface (SHARE-01, SHARE-04). One dialog with two
    // panes (D-21): the copy pane, whose code field is rewritten by [S06.6] on
    // every frame the build moves, and the load pane, whose paste field is the
    // one node on this surface [S06.6] is forbidden to touch. The two panes
    // take DIFFERENT id stems, share-* and sh-load-*, for the reason act-edit-*
    // and act-prop-* do: their controls then partition by attribute.
    //
    // The topbar labels beside them are the THIRD and FOURTH permanent bounded
    // buttons on the bar, both reserved by name in D-04 and both paid for in a
    // shell comment that states the bound.
    //
    // Same rule as every entry above: the id, this entry, the stub node AND —
    // since plan 03.1-01 — the DIALOG_ROOTS entry arrive together, or the run
    // fails in one direction or the other.
    'share-label', 'reset-label',
    'share', 'share-pane-copy', 'share-title', 'share-code',
    'share-length', 'share-over', 'share-said',
    'share-copy', 'share-to-load', 'share-done',
    'sh-load', 'sh-load-label', 'sh-load-field', 'sh-load-said',
    'sh-load-do', 'sh-load-back',
    // plan 04-05 — the reset confirmation (SHARE-06, D-19). Its OWN root rather
    // than a third pane, because it is a different act with a different opener.
    // It draws nothing from state, so it rides no SYNC_HOOKS entry — which is
    // why there is no repaint to stub anything for here, only markup.
    'reset-ask', 'reset-ask-title', 'reset-ask-says',
    'reset-ask-cancel', 'reset-ask-confirm',
    // plan 05-06 — phase 5's two page regions and the two topbar groups that
    // spend the last of D-04's reservation. NOTHING HERE IS A <dialog>, which
    // is the one thing that makes this group different from the two above it:
    // the fight surface is IN THE PAGE, so there is no DIALOG_ROOTS entry to
    // add and the dialog harvest stays at the four roots it already walks.
    // The benefit that bought is that the whole surface sits inside #app, so
    // the fight-mode Layer C harvest reads every word of it without a root of
    // its own.
    //
    // Same three-part rule as every entry above, and it is now the only rule
    // this group has to keep: the id, this entry and the stub node arrive
    // together, and section 5b fails the run in BOTH directions if one of the
    // three is missing.
    //
    // Every one of these is EMPTY on the shipped shell and a later plan in
    // this phase fills it — 05-07 the readout and the two declaration roots,
    // 05-08 the ledger list, 05-09 the notice. That is the same reservation
    // #share-said and #sh-load-said already ship under.
    'round-label', 'round-count', 'pool-cats', 'pool-mechs',
    'fight-label', 'fight-start',
    'fightbar', 'fight-head', 'fight-prompt',
    'decl-cats', 'decl-mechs', 'fight-said',
    // plan 05-D31 - the developer's fifth live-feedback round: "separate the
    // current round state from the action input area." SIX ids, and they are
    // the whole of what D-31 costs this list: two area roots, their two
    // headings, and the state area's own pair of column roots. The decl pair
    // above is the INPUT area's pair and did not move or change name, which is
    // what keeps [S07.5]'s FG_DECL_IDS table and every dispatch off it untouched
    // by a layout change.
    //
    // Same three-part rule as every group above and no exception for arriving
    // late in a phase: the id, this entry and the stub node arrive together, and
    // section 5b fails the run in BOTH directions if one of the three is
    // missing. Neither area is a <dialog>, so the harvest still walks four
    // roots.
    'fight-state', 'fight-state-head', 'state-cats', 'state-mechs',
    'fight-input', 'fight-input-head',
    'ledger', 'ledger-head', 'ledger-list',
    // plan 05-12 - the view switch (D-27). THREE ids and no more: the switch
    // root and its two controls. Same three-part rule as every entry above and
    // it is the only rule this group has to keep either - the id, this entry
    // and the stub node arrive together, and section 5b fails the run in BOTH
    // directions if one of the three is missing. Nothing here is a <dialog>,
    // so the harvest still walks four roots.
    //
    // Each control carries data-vw and NOT data-act, and that spelling is
    // copied from the markup rather than typed from memory - the warning above
    // this builder is the whole of that boundary, and check 103 reads the
    // attribute back off the page it drives.
    'views', 'view-build', 'view-fight',
    // plan 05-D28 - D-28's projection toggle. ONE id and no more, and the
    // reason there is not a second is the decision the shell comment carries in
    // full: the sidebar this control opens IS #strip, the node that already
    // ships, rather than a second panel carrying a copy of the same figures.
    // So there is a control id here and no root id, which is the one shape this
    // group has that the group above it does not.
    //
    // Same three-part rule as every entry above - the id, this entry and the
    // stub node arrive together, and section 5b fails the run in BOTH
    // directions if one of the three is missing. It carries data-pv and NOT
    // data-vw and NOT data-act, and that spelling is copied from the markup
    // rather than typed from memory: check 103 counts the data-vw controls and
    // check 103d counts the data-pv ones, and the two counts are what assert
    // the partition off the page.
    'proj-toggle'
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
    // ADDED BY PLAN 05-14, and it is a gap in this stub rather than a new
    // capability: insertBefore is ordinary DOM and this page simply never
    // needed it until [S06.7] had to put the round figure ABOVE .fg-sides
    // without touching the shell markup. A null reference appends, which is
    // what a browser does, so the artifact's fall-through arm is modelled too.
    node.insertBefore = (child, before) => {
      if (child.parentNode) { child.parentNode.removeChild(child); }
      const i = before === null || before === undefined
        ? -1 : node.children.indexOf(before);
      child.parentNode = node;
      if (i === -1) { node.children.push(child); } else { node.children.splice(i, 0, child); }
      return child;
    };
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
    // The selection, which used to be two no-ops. It is modelled now because
    // plan 04-05 gave one field in this artifact the OPPOSITE of D-19's rule —
    // #share-code is rewritten while it holds focus and its selection is
    // re-applied afterwards — and a no-op setSelectionRange makes that contract
    // untestable in the direction that matters. selectionStart stays undefined
    // until something sets it, which is what [S06.1]'s withPreservedFocus
    // already reads it as, so nothing that passed before this reads differently
    // because of it.
    node.select = () => {
      node.selectionStart = 0;
      node.selectionEnd = String(node.value === undefined ? '' : node.value).length;
    };
    node.setSelectionRange = (from, to) => {
      node.selectionStart = from;
      node.selectionEnd = to;
    };
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

  // plan 05-06's two page regions, built HERE rather than at the bottom of
  // this function because #app's child order is the appendChild order and the
  // shell puts both of them between the bar and the board. That order matters
  // to nothing this stub does today and matters to any future assertion that
  // reads #app's children — plan 03-05's band made the same call for the same
  // reason, and this is the cheaper moment to get it right.
  //
  // NEITHER IS A <dialog>, so neither takes a DIALOG_ROOTS entry and the
  // harvest below still walks four roots. Every class and every attribute here
  // is spelled from the markup, which is the warning the stub <dialog>s carry
  // and the one that costs the most when ignored.
  // plan 05-12's view switch, built BEFORE the fight region for the reason the
  // fight region is built before the board: #app's child order here is the
  // appendChild order, and the shell puts the switch between #topbar and the
  // band so a screen reader meets the control before either thing it switches
  // between. It is not a <dialog>, so it takes no DIALOG_ROOTS entry.
  //
  // NO TEXT ON EITHER LABEL AND NO TICK CHARACTER, which is this stub's
  // standing convention for STATIC markup rather than an omission: this page is
  // a hand-made stand-in and not a parser, so text written directly into the
  // shell is empty here and Layer A reads it in the document instead.
  // #round-label and #fight-head above ship exactly the same way. The aria-label
  // on the root IS copied, because Layer C reads accessible names as well as
  // leaf text and a name present in one page and absent from the other is the
  // drift section 5b exists to make impossible, arriving through an attribute.
  //
  // Every class and every dataset spelling below is copied from the markup.
  const views = idNode('views');
  views.className = 'vw-switch';
  views.setAttribute('role', 'group');
  // AMENDED BY PLAN 05-D28 IN THE SAME CHANGE THAT AMENDED THE MARKUP. The
  // group holds D-28's projection toggle as well as the two view controls now,
  // and an accessible name present in one page and different in the other is
  // exactly the drift section 5b exists to make impossible, arriving through an
  // attribute rather than through a typo.
  views.setAttribute('aria-label', 'Which screen, and the projection');
  app.appendChild(views);
  [['view-build', 'build', 'vw-btn vw-on', 'true'],
    ['view-fight', 'fight', 'vw-btn', 'false']].forEach(([id, vw, cls, pressed]) => {
    const b = idNode(id, 'button');
    b.className = cls;
    b.type = 'button';
    b.dataset.k = 'vw/' + vw;
    b.dataset.vw = vw;
    b.setAttribute('aria-pressed', pressed);
    views.appendChild(b);
    const name = createElement('span');
    name.className = 'vw-name';
    b.appendChild(name);
    const tick = createElement('span');
    tick.className = 'vw-check';
    b.appendChild(tick);
  });
  // plan 05-D28's toggle, a SIBLING of the two above and inside the same root,
  // which is what lets [S07.6]'s one delegated pair reach all three. Built to
  // the same convention as they are: no text on the label and no tick
  // character, because text written directly into the shell is empty here and
  // Layer A reads it in the document. Every class and every dataset spelling is
  // copied from the markup, including aria-expanded, which this control carries
  // and the two above do not.
  const projToggle = idNode('proj-toggle', 'button');
  projToggle.className = 'pv-btn';
  projToggle.type = 'button';
  projToggle.dataset.k = 'pv/proj';
  projToggle.dataset.pv = 'strip';
  projToggle.setAttribute('aria-pressed', 'false');
  projToggle.setAttribute('aria-expanded', 'false');
  projToggle.setAttribute('aria-controls', 'strip');
  views.appendChild(projToggle);
  const projName = createElement('span');
  projName.className = 'pv-name';
  projToggle.appendChild(projName);
  const projTick = createElement('span');
  projTick.className = 'pv-check';
  projToggle.appendChild(projTick);

  // THE LEDGER IS BUILT AND APPENDED BEFORE #fightbar, AND THE ORDER IS THE
  // CLAIM RATHER THAN HOUSEKEEPING (plan 05-D28). D-28 made the ledger a
  // full-width LANE ABOVE the round being played, and the shell carries that in
  // the markup rather than with a CSS `order` — so #app's child order here has
  // to match, because this page's child order IS its appendChild order and
  // check 103e reads the pairing off both pages. The other property this page
  // can hold is the one plan 05-06 built it for: the ledger is a SIBLING of
  // #board and not a child, which is what keeps the first [data-k] match scoped
  // to #board a live node after a structural rebuild. Its rows carry no data-k
  // and no data-act at all, so there is nothing to stub inside the list —
  // [S06.8] appends into it.
  const ledger = idNode('ledger', 'section');
  ledger.hidden = true;
  app.appendChild(ledger);
  const ledgerHead = idNode('ledger-head', 'h2');
  ledgerHead.className = 'ld-head';
  ledger.appendChild(ledgerHead);
  const ledgerList = idNode('ledger-list');
  ledgerList.className = 'ld-list';
  ledger.appendChild(ledgerList);

  const fightbar = idNode('fightbar', 'section');
  app.appendChild(fightbar);
  const fightHead = idNode('fight-head', 'h2');
  fightHead.className = 'fg-head';
  fightbar.appendChild(fightHead);
  const fightPrompt = idNode('fight-prompt', 'p');
  fightPrompt.className = 'fg-prompt';
  fightbar.appendChild(fightPrompt);
  /* D-31's TWO AREAS, IN THE SHELL'S OWN ORDER: state first, input second. The
     order is the CLAIM here and not housekeeping, exactly as it is for #ledger
     twenty lines up — this page's child order IS its appendChild order, and row
     108 reads the separation off both this page and the artifact's markup. A
     stub that built them the other way round would make a passing row out of a
     surface where the student is asked to act before being shown what they are
     acting on.

     BOTH SHIP HIDDEN AND SO DO ALL FOUR COLUMN ROOTS, which is the shell
     verbatim and matters to more than tidiness: fgRest puts every one of them
     back behind [hidden], and a stub that started them visible would let a
     teardown check pass without the teardown having done anything. */
  const fightArea = (areaId, headId, sideIds) => {
    const area = idNode(areaId, 'section');
    area.className = 'fg-area';
    area.hidden = true;
    fightbar.appendChild(area);
    const areaHead = createElement('div');
    areaHead.className = 'fg-area-head';
    area.appendChild(areaHead);
    const areaName = idNode(headId, 'h3');
    areaName.className = 'fg-area-name';
    areaHead.appendChild(areaName);
    const sides = createElement('div');
    sides.className = 'fg-sides';
    area.appendChild(sides);
    sideIds.forEach((id) => {
      const side = idNode(id);
      side.className = 'fg-side';
      side.hidden = true;
      sides.appendChild(side);
    });
  };
  fightArea('fight-state', 'fight-state-head', ['state-cats', 'state-mechs']);
  fightArea('fight-input', 'fight-input-head', ['decl-cats', 'decl-mechs']);
  // FIGHT-10's line, reserved by plan 05-06 and filled by plan 05-09. Hidden
  // AND empty together, which is the admission line's own rule and the reason
  // there is no text on it here.
  const fightSaid = idNode('fight-said', 'p');
  fightSaid.className = 'fg-said';
  fightSaid.hidden = true;
  fightbar.appendChild(fightSaid);

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
  // plan 05-06's two new topbar groups, FIRST in the cluster because that is
  // where the markup puts them: a reading a room has to take in leads the bar
  // rather than joining the end of a queue of controls, and Reset stays last
  // and apart where SHARE-04's fourth criterion put it.
  //
  // THE FIRST GROUP IS NOT A CONTROL, so topbarButton() is deliberately not
  // used for it. That helper stamps a data-act onto whatever it makes, and a
  // reading carrying an act would be an act on this page the shell does not
  // carry — which is precisely the drift section 5b exists to make impossible,
  // arriving through a convenience rather than through a typo. Three empty
  // value nodes, no data-act, no data-k, spelled from the markup.
  const fightRead = createElement('div');
  fightRead.className = 'brd-tokedit fg-read';
  topbar.appendChild(fightRead);
  const roundLabel = idNode('round-label', 'span');
  roundLabel.className = 'brd-tokedit-label';
  fightRead.appendChild(roundLabel);
  [['round-count', 'fg-round'],
    ['pool-cats', 'fg-pool'],
    ['pool-mechs', 'fg-pool']].forEach(([id, cls]) => {
    const n = idNode(id, 'span');
    n.className = cls;
    fightRead.appendChild(n);
  });
  // And the sixth control, which IS one. It takes an id where the four buttons
  // below take none, because [S06.7] has to reach it by id to disable it while
  // a fight is running — topbarButton() hands back no id, so the button is
  // built by hand here and its act and its key are copied off the markup.
  // startFight is state work, so it is dispatched and is deliberately NOT in
  // UI_ACTS; there is no handler to register for it and nothing in this repo
  // presses it until plan 05-10.
  const fightLabel = idNode('fight-label', 'span');
  fightLabel.className = 'brd-tokedit-label';
  topbar.appendChild(fightLabel);
  const fightStart = idNode('fight-start', 'button');
  fightStart.className = 'brd-btn';
  fightStart.dataset.k = 'fg';
  fightStart.dataset.act = 'startFight';
  topbar.appendChild(fightStart);

  topbarButton('undo', 'undo', null);
  topbar.appendChild(idNode('tokedit-label', 'span'));
  topbarButton('tok', 'openTokenPicker', null);
  // plan 03.1-05's one new topbar control. The shell comment beside it records
  // that this is a second PERMANENT, BOUNDED button rather than the row Phase
  // 2.1 collapsed; here it is one more entry, spelled from the markup.
  topbar.appendChild(idNode('actedit-label', 'span'));
  topbarButton('act', 'openActionEditor', null);
  // plan 04-05's two new topbar controls, the third and fourth permanent
  // buttons on the bar and both reserved by name in D-04. Spelled from the
  // markup, exactly as the two above are. Their acts are page work claimed by
  // [S07.4], which is plan 04-06's — so nothing in this file presses either of
  // them yet, and the DIALOG_ROOTS entries below open the two new dialogs
  // through showModal() rather than through an opener that does not exist.
  topbar.appendChild(idNode('share-label', 'span'));
  topbarButton('sh', 'openShare', null);
  topbar.appendChild(idNode('reset-label', 'span'));
  topbarButton('rs', 'openResetAsk', null);

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
    /* D-32 PART 2: EVERY ROW CARRIES A READING AND NO ROW CARRIES A LABEL.
       The span this replaces was `.ae-term-lbl` and it held the word "Spends"
       or "Needs" in the shell and nothing at all here — which is exactly why
       the swap is worth a note rather than a silent edit: a stub node with no
       text is invisible to the Layer C harvest, so the eight printings of two
       words that left the shell cost this gate nothing, while the twelve
       READINGS that arrived cost it two harvested attributes each. The row
       count moved by zero and the dialog harvest moved a long way up, and
       both of those are measured in the plan summary rather than assumed.

       It is built for the xf rows TOO, which the label never was: a change is
       a term like the other two and reads like one. */
    const read = createElement('div');
    read.className = 'ae-term-read';
    row.appendChild(read);
    if (withWho) {
      const who = createElement('div');
      who.className = 'ae-term-who';
      row.appendChild(who);
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

  // WRITTEN OUT RATHER THAN LOOPED OVER THE ARTIFACT'S CAPS, and the reason is
  // mechanical: makeStubDom runs BEFORE the artifact is evaluated — it is what
  // the artifact is evaluated against — so `A` does not exist yet here. That
  // was measured, not assumed: the looped spelling threw "Cannot access 'A'
  // before initialization" on its first run. So these are hand-written twice,
  // once here and once in the shell, and check 65 is what holds both counts to
  // App.ops.MAX_ACTION_COST / App.data.MAX_ACTION_REQ / App.data.MAX_ACTION_XF
  // rather than to each other. D-32 moved all three from their old counts in
  // the same change the constants moved.
  aeTermRow('act-edit-cost-0', 'cost', 0, false);
  aeTermRow('act-edit-cost-1', 'cost', 1, false);
  aeTermRow('act-edit-cost-2', 'cost', 2, false);
  aeTermRow('act-edit-cost-3', 'cost', 3, false);
  aeTermRow('act-edit-req-0', 'req', 0, false);
  aeTermRow('act-edit-req-1', 'req', 1, false);
  aeTermRow('act-edit-req-2', 'req', 2, false);
  aeTermRow('act-edit-req-3', 'req', 3, false);
  aeTermRow('act-edit-xf-0', 'xf', 0, true);
  aeTermRow('act-edit-xf-1', 'xf', 1, true);
  aeTermRow('act-edit-xf-2', 'xf', 2, true);
  aeTermRow('act-edit-xf-3', 'xf', 3, true);

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

  // A container under D-32, matching the shell: one report line per cost term.
  const aePropCost = idNode('act-prop-cost');
  aePropCost.className = 'ae-prop-reports';
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
  // Four, with the cap, under D-32 — hand-written for makeStubDom's stated
  // reason (the artifact is not evaluated yet) and held to the constant by
  // check 65, which counts the SHELL's rows against App.data.MAX_ACTION_XF and
  // the stub's against the same number.
  aePropRow(0);
  aePropRow(1);
  aePropRow(2);
  aePropRow(3);

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

  /* ---- plan 04-05's share surface, hand-made from the static markup --------
     Exactly the three members beyond a plain element both dialogs above have,
     and no more: .open, showModal() and close(), the last dispatching the
     `close` event a focus hand-back binds to. A plain div here would keep the
     whole surface skipped, which is the state the picker was in before its stub
     was written — two gate checks green over a handler that bailed on its
     second line.

     EVERY CLASS AND EVERY DATASET SPELLING IS COPIED FROM THE SHELL, and two of
     the classes are load-bearing rather than decorative. [S06.6] tells the code
     field apart from the paste field by .sh-code against .sh-paste, and the
     whole of this plan's contract is which of those two it may write: it
     rewrites the first even while it holds focus and never touches the second.
     A typo in either is not a red run — it is a green one, over a field nothing
     is listening to.

     The two panes take different id stems, share-* and sh-load-*, so their
     controls partition by attribute exactly as act-edit-* and act-prop-* do. */
  const share = idNode('share', 'dialog');
  share.open = false;
  share.dataset.shPane = 'copy';
  share.showModal = () => { share.open = true; };
  share.close = () => {
    if (!share.open) { return; }
    share.open = false;
    dispatch(share, event('close'));
  };
  body.appendChild(share);

  const sharePane = idNode('share-pane-copy', 'section');
  sharePane.className = 'sh-pane';
  share.appendChild(sharePane);
  sharePane.appendChild(idNode('share-title', 'h2'));

  const shareCode = idNode('share-code', 'textarea');
  shareCode.className = 'sh-code';
  shareCode.dataset.k = 'sh/code';
  sharePane.appendChild(shareCode);

  const shareLen = idNode('share-length', 'p');
  shareLen.className = 'sh-len';
  sharePane.appendChild(shareLen);

  const shareOver = idNode('share-over', 'p');
  shareOver.className = 'sh-warn';
  shareOver.hidden = true;
  sharePane.appendChild(shareOver);

  const shareSaid = idNode('share-said', 'p');
  shareSaid.className = 'sh-said';
  shareSaid.hidden = true;
  sharePane.appendChild(shareSaid);

  [['share-copy', 'copy', 'sh/copy'],
    ['share-to-load', 'to-load', 'sh/to-load'],
    ['share-done', 'done', 'sh/done']].forEach(([id, sh, k]) => {
    const b = idNode(id, 'button');
    b.dataset.sh = sh;
    b.dataset.k = k;
    sharePane.appendChild(b);
  });

  const shLoad = idNode('sh-load', 'section');
  shLoad.className = 'sh-pane';
  shLoad.hidden = true;
  share.appendChild(shLoad);
  shLoad.appendChild(idNode('sh-load-label', 'h2'));

  const shPaste = idNode('sh-load-field', 'textarea');
  shPaste.className = 'sh-paste';
  shPaste.dataset.k = 'sh/paste';
  shLoad.appendChild(shPaste);

  const shLoadSaid = idNode('sh-load-said', 'p');
  shLoadSaid.className = 'sh-said';
  shLoadSaid.hidden = true;
  shLoad.appendChild(shLoadSaid);

  [['sh-load-do', 'load', 'sh/load'],
    ['sh-load-back', 'to-copy', 'sh/to-copy']].forEach(([id, sh, k]) => {
    const b = idNode(id, 'button');
    b.dataset.sh = sh;
    b.dataset.k = k;
    shLoad.appendChild(b);
  });

  /* ---- plan 04-05's reset confirmation (SHARE-06, D-19) -------------------
     Its own root, because it is a different act with a different opener. It
     draws NOTHING from state and rides no SYNC_HOOKS entry, so there is no
     repaint to exercise here — but it is still a <dialog>, so it still needs
     its three members, its ids and its DIALOG_ROOTS entry, and the harvest
     still walks it from the moment it exists. That is the whole point of the
     gate being bidirectional: this entry could not have been forgotten.

     The sentence on #reset-ask-says is STATIC MARKUP in the shell, so its text
     is empty here — this page is a hand-made stand-in rather than a parser, and
     Layer A reads that sentence in the document instead. */
  const resetAsk = idNode('reset-ask', 'dialog');
  resetAsk.open = false;
  resetAsk.showModal = () => { resetAsk.open = true; };
  resetAsk.close = () => {
    if (!resetAsk.open) { return; }
    resetAsk.open = false;
    dispatch(resetAsk, event('close'));
  };
  body.appendChild(resetAsk);
  resetAsk.appendChild(idNode('reset-ask-title', 'h2'));
  const resetSays = idNode('reset-ask-says', 'p');
  resetSays.className = 'rs-says';
  resetAsk.appendChild(resetSays);
  [['reset-ask-cancel', 'cancel', 'rs/cancel'],
    ['reset-ask-confirm', 'confirm', 'rs/confirm']].forEach(([id, rs, k]) => {
    const b = idNode(id, 'button');
    b.dataset.rs = rs;
    b.dataset.k = k;
    resetAsk.appendChild(b);
  });

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
  // [S04.4] writes the mirror through history.replaceState and deliberately
  // has no fallback, so without these three lines the mirror is inert here and
  // every check below it would be green about nothing. The spelling is COPIED
  // from the artifact rather than recalled: a typo in this object name is not a
  // red run, it is a green one over a mirror that never wrote anything --
  // exactly the failure mode the stub-drift gate exists for one tier up.
  // A real browser normalises the fragment onto location.hash with its leading
  // '#'; the artifact writes one and reads one back off, so the stub stores
  // what it is handed.
  history: {
    replaceState: (data, title, fragment) => {
      domSandbox.location.hash = String(fragment);
    }
  },
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

// D-32: one spelling for all three lists. The cost arm's exception went with
// the id, which is the point of moving the id at all.
const aeTermRowOf = (field, slot) => dom.byId['act-edit-' + field + '-' + slot];
const aeAmtOf = (field, slot) =>
  dom.byId['act-edit-' + field + '-' + slot + '-amt'];
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
//
// SCOPE_IDS MAKES THAT RECORD MEAN WHAT THE SENTENCE ABOVE ALREADY CLAIMED IT
// MEANT. Before plan 05-01 every string under #app was recorded as '#app',
// whatever region actually painted it, and the claim "a hit names the surface it
// came off" was true only at dialog granularity. That was harmless while every
// use of the record was a diagnostic message. It stopped being harmless the
// moment a check needed to ASSERT on the record — see the relationship-verb
// guard below, whose whole mechanism is that one region is allowed a word the
// rest of the page is not.
//
// So a node whose id is named here switches the label for its own subtree. The
// list is short on purpose: an id belongs here when a check ASSERTS on the
// region's name, or when a hit read off it would otherwise be reported against a
// root big enough to be useless as a diagnosis. `refband` is the first; `strip`
// is the second — plan 05-01's probe B put a relationship verb in the projection
// strip and was told it came "from #app", which is true of roughly a third of
// the page and points at nothing. Adding an id here changes no assertion except
// the relationship guard's, and costs nothing: the harvest's length, and
// therefore every floor over it, is untouched by which label a record carries.
const SCOPE_IDS = ['refband', 'strip'];

/* --- data-tsay: THE FOURTH EXEMPTION CHANNEL, ADDED BY D-29 -------------------

   D-29 moves the fight surface's prose off the page and into tooltips: "mouse
   over tooltip for the text description". THE SINGLE MOST DANGEROUS THING ABOUT
   THAT CHANGE IS THIS FUNCTION, and the danger is the wave-1 lesson in its
   attribute edition — a word that leaves textContent leaves a scanner that only
   reads textContent, and a scanner that cannot see a surface reports it CLEAN
   FOREVER.

   HALF OF THE ANSWER WAS ALREADY HERE AND SAYING SO IS THE HONEST PART.
   LABEL_ATTRS has carried `title` since the walk was lifted out over the dialog
   roots, so a tooltip is read by this harvest today with no change at all, and
   the brief's instruction to "extend the harvest to read tooltip text" was
   already satisfied when this plan opened it. Probe BG measures that end
   directly rather than trusting the reading.

   THE HALF THAT WAS MISSING IS THE ONE ALLOC-10 CREATES. The three shipped
   channels each mark a node whose WHOLE text is a student's own word — data-lbl
   and data-anm for text, data-albl for an accessible name — because every line
   this artifact assembles is built one node per fragment and only the student's
   fragment is marked. A TOOLTIP CANNOT BE SPLIT ACROSS NODES: it is one string
   on one attribute, and a reading like "Cat 1 — Ward 2." holds the artifact's
   words and the student's together. Read whole, it reddens CI the day a student
   names a type after a word on one of the three lists. Skipped whole — which is
   what data-albl does, and correctly, because a stepper's accessible name is a
   prefix that is ALSO rendered visibly beside it — it would take "took 1 of the
   1" out of the only layer that can ever see it, since not one sentence [S06.8]
   or [S06.12] produces exists as a literal anywhere in the file.

   SO THE MARKER CARRIES THE FRAGMENT AND THE HARVEST REMOVES IT. What is left
   is the artifact's half of the sentence, and it is scanned like any other copy.

   IT CARRIES THE WORD AND NOT THE TOKEN ID, AND THAT IS A DECISION ABOUT WHICH
   SIDE RE-DERIVES. An id would make this gate call labelFor to work out what the
   artifact rendered — a second derivation of a string that already exists, and
   one that answers WRONGLY for a type the vocabulary has since lost, because
   labelFor falls through to the shipped health label. The region says what it
   wrote; this reads it back.

   AND THE ONE HOLE IN IT IS NAMED RATHER THAN LEFT TO BE FOUND: a student who
   names a type after a word that also appears in the artifact's half of a
   tooltip has that word removed from BOTH halves. It is admissible because the
   only way to reach it is to name a type after the very word in question, and a
   type named after a word on the lists is exempt by ALLOC-10 anyway — the
   removal takes out a word the scan was going to be told to ignore. Layer A
   still reads every literal in the document and Layer B every quoted string, so
   an artifact word can only go missing from ONE of the three layers. */
function tsayStripped(value, word) {
  if (typeof word !== 'string' || word === '') { return value; }
  return value.split(word).join(' ');
}

function harvestInto(root, into, where) {
  (function harvest(node, where) {
    if (!node) { return; }
    const ownId = node.getAttribute ? node.getAttribute('id') : null;
    if (typeof ownId === 'string' && SCOPE_IDS.indexOf(ownId) !== -1) {
      where = '#' + ownId;
    }
    if (node.children.length === 0
      && typeof node.textContent === 'string' && node.textContent !== ''
      && !('lbl' in node.dataset)
      && !('anm' in node.dataset)) {
      into.push({ s: node.textContent, where: where });
    }
    LABEL_ATTRS.forEach((attr) => {
      if (attr === 'aria-label' && ('albl' in node.dataset)) { return; }
      const raw = node.getAttribute ? node.getAttribute(attr) : null;
      if (typeof raw !== 'string' || raw === '') { return; }
      // The removal is applied to the two channels [S06.12] writes and to
      // neither of the others: a `placeholder` is a field's own prompt and no
      // region composes one out of a student's word, so widening it there would
      // be an exemption nothing asks for.
      const value = (attr === 'title' || attr === 'aria-label')
        ? tsayStripped(raw, node.dataset.tsay) : raw;
      if (value !== '') { into.push({ s: value, where: where }); }
    });
    node.children.forEach((child) => harvest(child, where));
  })(root, where);
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
  { id: 'act-edit', act: 'openActionEditor' },
  // plan 04-05's two new surfaces. Both carried act: null for exactly one
  // plan — the openers are page work and [S07.4] is plan 04-06's, so there was
  // no handler to drive and driving an unregistered act would have put the
  // styled error panel on screen instead of opening anything. Plan 04-06
  // registered both, so both nulls are gone and the walk now reaches these two
  // surfaces the way a student does rather than through showModal(). That
  // matters here for the reason this list's own comment gives: a dialog whose
  // opener was unregistered would harvest an empty box and trip its own floor
  // instead of passing on nothing.
  { id: 'share', act: 'openShare' },
  { id: 'reset-ask', act: 'openResetAsk' }
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
    // ASK FOR A FRAME RATHER THAN HOPING ONE IS DUE. flush() runs a PENDING
    // frame and does nothing when none is pending, which was invisible while
    // every root here was reached through an opener — an opener paints its
    // surface directly and asks for the next frame on the way out, so one was
    // always due. Plan 04-05's two roots have no opener yet, showModal() asks
    // for nothing, and their per-frame hooks would therefore never have run:
    // the walk would have read an empty surface and called it clean, which is
    // the precise failure this whole harvest exists to prevent. One invalidate
    // makes the frame due for every root the same way, however it was opened.
    A.state.invalidate();
    A.state.flush();
    harvestInto(node, out, '#' + root.id);
    if (typeof node.close === 'function') { node.close(); }
    A.state.flush();
  });
  return out;
}

const dialogText = openDialogs();

const RENDERED_VERDICT_WORDS = VERDICT_WORDS
  .concat(VERDICT_LITERAL_WORDS)
  .concat(VERDICT_RENDERED_WORDS);

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

/* --- THE RELATIONSHIP VERB, CLOSED BY SCOPE RATHER THAN BY STEM --------------
   `beat`, `beats` and `beaten` cannot go on any of the three word lists, and the
   reason is not that they are innocent. They are the exact words a fight surface
   would use to announce an outcome — "Cats beat Mechs" — and they are ALSO the
   artifact's own approved vocabulary: [S06.4] renders "Fly beats Slash" and
   "Lasers beat Hairball" off App.data.REFERENCE.beats, under a heading that
   reads "What beats what". That copy is the reference material the workshop is
   built on. A stem ban reddens the shipped board.

   So the question is not WHICH WORD it is. It is WHICH SURFACE SAID IT — and
   the harvest already carries that, in the `where` each record was read with.
   One action beating another is a relationship between two moves in the
   reference band. One SIDE beating the other is a ruling on a student's build,
   and PROJ-06 says the artifact never makes one.

   THE ALLOWED SET IS DERIVED FROM WHERE THE STRING WAS READ, NEVER FROM ITS
   TEXT, and that distinction is the whole of this guard's value. A text
   allowlist — "Fly beats Slash" and "Lasers beat Hairball" are fine, everything
   else reddens — would be a list of exactly the sentences somebody thought of on
   the day, and it would go green the moment a student renamed an action, which
   they can do since phase 3.1. Scoping by read-site holds for every sentence the
   band can ever produce and for no sentence produced anywhere else.

   The band's own id is in SCOPE_IDS above, which is why '#refband' is a label
   this can compare against at all. If that entry is ever removed, every band line
   is recorded as '#app', this guard reddens on the shipped board, and the run
   says so — which is the failure direction a gate should fail in. MEASURED, not
   asserted: plan 05-01 emptied SCOPE_IDS and re-ran, and this row went red with
   exactly one hit.

   AND THAT ONE HIT IS WORTH NAMING, BECAUSE IT IS NOT THE ONE A READER EXPECTS.
   It was "What beats what", the band's HEADING. The band's relationship lines —
   "Fly beats Slash", "Lasers beat Hairball" — are not read by this walk at all:
   they carry the [data-anm] marker, because they are sentences assembled out of
   names a student can rename, and the walk skips such a node for TEXT. So the
   allowed set is exercised today by the heading alone. That is a fact about the
   present board rather than a weakness in the scope — the moment the band paints
   any line without that marker, or a later plan gives the band a sentence of the
   artifact's own words, the same allowance covers it and no edit is needed. It
   is written down here so nobody reads this guard as protecting a string Layer C
   has never once read. */
const RELATIONSHIP_VERB = /\bbeat(s|en)?\b/i;
const RELATIONSHIP_SCOPE = '#refband';

function relationshipHitsIn(items) {
  const found = [];
  items.forEach((item) => {
    if (!RELATIONSHIP_VERB.test(item.s)) { return; }
    if (item.where === RELATIONSHIP_SCOPE) { return; }
    found.push('[relationship verb outside ' + RELATIONSHIP_SCOPE + '] in '
      + JSON.stringify(item.s) + ' (read from ' + item.where + ')');
  });
  return found;
}

/* --- THE WORD LISTS' HISTORY, KEPT THE WAY THE FLOORS BELOW KEEP THEIRS ------
   This paragraph used to read "TWO GAPS IN THE WORD LIST, MEASURED THIS SESSION
   AND REPORTED RATHER THAN WIDENED", naming /\blead\b/ against "leads" and
   /dominat/ against "dominant", and it closed with the standing rule that a
   widening belongs with the plan that measures its false positives. Plan 05-01
   is that plan. Both gaps are closed above, and the rule is kept — every word
   added carries the count it was measured at, in a comment beside it.

   WHAT WAS MEASURED, 2026-08-29, over the whole of cats-vs-mechs.html and over
   the 5582 string literals Layer B extracts from it. Nineteen words passed all
   three layers before this plan; these are the readings that decided where each
   one went.

     candidate                    doc   lit   placed
     won            \bwon\b         0     0   Layer B
     win/wins/winning              2     0   Layer B (widened from two entries)
     lose/loses/losing            13     2   Layer C only — the 2 are check labels
     lost           \blost\b        5     1   Layer C only — the 1 is a check label
     defeat         /defeat/        4     0   Layer B
     victor         /victor/        0     0   Layer A
     triumph        /triumph/       0     0   Layer A
     outlast        /outlast/       0     0   Layer B
     dominan[t]                     0     0   Layer B (widened from /dominat/)
     best           \bbest\b        4     2   Layer C only — the 2 are check labels
     leads          \bleads?\b      3     0   Layer B (widened from /\blead\b/)
     harder         \bharder\b      1     0   Layer B
     easier         \beasier\b      0     0   Layer B
     beat/beats/beaten            44    21   NEITHER — closed by scope, above

   THREE CANDIDATES WERE MEASURED AND DECLINED IN THE SPELLING THEY WERE ASKED
   FOR, and the readings are worth keeping because the next reader's instinct
   will be to "tidy" them into stems:
     /los/    221 document hits, 23 literal hits — it catches `close`, `closest`
              and `lossless`. Whole-word alternation only.
     /best/   29 document hits — it catches `bestPair` and `bestDamage`, which
              are shipped [S02] identifiers. WHOLE WORD ONLY. A stem here reddens
              the model layer.
     /beat/   44 document hits, 21 literal hits — the artifact's own reference
              material. This is the one that proves the scoped guard was
              necessary rather than elegant.

   THE GATE IS A FLOOR AND NOT A CEILING, and closing the mechanical hole did not
   make the rest of the vocabulary shippable. EIGHT WORDS MEASURED MECHANICALLY
   CLEAN AND ARE STILL NOT WRITABLE: `contested`, `one-sided`, `blowout`,
   `lopsided`, `even`, `close`, `tight`, `behind`. They are balance judgements
   wearing a neutral coat, and they are deliberately NOT added, because the
   measurement says what a widening would cost: /\bclose\b/ has 77 document hits
   and 16 literal hits, /\bbehind\b/ has 50 and 13, /\beven\b/ has 15 and 4 —
   every one of them ordinary English across roughly a megabyte of deliberate
   prose. A list widened to catch those is a build that goes red on a sentence
   somebody wrote two phases ago, which is how a gate stops being trusted. That
   these stay off the page is a WRITTEN RULE, not a regular expression, and it is
   plan 05-11's to judge with a person in the room. Harness limitation 18 names
   it as such.

   AND ONE GAP THIS PLAN MEASURED AND COULD NOT CLOSE: camelCase evades every
   word-boundary rule in all three layers. `winsBy`, `leadBy` and `edgeOf` pass
   Layer B today and would pass Layer C. Reported, not exploited, and not
   widened — a camelCase-splitting scanner over 5582 literals is a change with
   its own false-positive budget and no phase has needed it yet. Harness
   limitation 19. */
const renderedHits = verdictHitsIn(renderedText.concat(dialogText))
  .concat(relationshipHitsIn(renderedText.concat(dialogText)));

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
//
// PLAN 04-05 ADDED TWO ROOTS AND THE TOTAL DID NOT MOVE FOR THEM, WHICH IS
// WORTH A LINE BECAUSE IT LOOKS LIKE THE FAILURE THIS NUMBER GUARDS AGAINST AND
// IS NOT. The share surface and the reset confirmation are almost entirely
// STATIC MARKUP — a title, a note, a sentence, the button legends — and this
// page is a hand-made stand-in rather than a parser, so static text is empty
// here for the same reason the picker's title is. Layer A reads every one of
// those words in the document instead, in full, including the CSS and the
// comments. What Layer C can see of the share surface is the ONE line [S06.6]
// renders: the code's length in characters. So the total moves by one, not by
// forty, and the floor moves with it rather than by a surface's worth — see the
// number below and SHARE_FLOOR, which is where the honest bound on this
// particular surface lives.
//
// 134 IS RAISED TO 138 BY PLAN 04-05, against a measured 145. The arithmetic is
// the one this note has kept three times already: seven below the measured
// total.
const DIALOG_FLOOR = 138;

// The floor for a harvest of the PICKER ALONE, which check 47g takes because it
// opens one dialog rather than every one. It was reading DIALOG_FLOOR, and that
// was wrong in a way that was invisible while the two numbers happened to be
// close: DIALOG_FLOOR is over the TOTAL of every root, and a one-root harvest
// compared against it passed by a single string. Raising the total floor for
// plan 03.1-06 is what surfaced it. This is the original one-dialog arithmetic,
// kept: seven below the picker's measured 91.
const PICKER_FLOOR = 84;

// THE SHARE SURFACE'S OWN FLOOR, kept apart from DIALOG_FLOOR for the reason
// PICKER_FLOOR and PROPOSE_FLOOR are kept apart from it: that number is over
// the TOTAL of every root, and a one-root harvest compared against it either
// passes on the other roots' strings or fails on arithmetic that has nothing to
// do with the surface being read.
//
// AND IT IS SMALL, WHICH IS A FACT ABOUT THE SURFACE AND NOT A WEAK GATE — said
// plainly here because a reader coming from PICKER_FLOOR's 84 will otherwise
// assume a typo. Almost everything on the share surface is STATIC MARKUP: the
// title, the note, the sentence on the load pane, the legend on every control.
// Layer A reads all of it, in the document, in full. What this page can see is
// what [S06.6] RENDERS, and that is exactly one line below CODE_WARN — the
// code's length in characters — and exactly two above it, when D-18's
// over-budget line joins it.
//
// So the honest bound is one, and the job this floor does is precise: it
// proves the surface was OPENED and its per-frame hook RAN. A harvest of zero
// means the repaint never fired, which is the failure that would otherwise
// report a spotlessly clean scan forever — the same failure check 47c exists to
// catch, one surface down. The build code itself is deliberately NOT in the
// count: it is written to the field's value rather than its text, which is what
// a field is, and it carries no readable words anyway because every name in it
// travels base64url-encoded through the codec's name table.
const SHARE_FLOOR = 0;
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
    + 'does not trip it. The relationship verb rides in this row rather than in '
    + 'one of its own, because it is the same claim about the same harvest: the '
    + 'reference band may say one action beats another, and nothing else on the '
    + 'page may say anything beats anything',
  renderedHits.length === 0,
  renderedHits.length === 0
    ? 'clean across ' + (renderedText.length + dialogText.length)
      + ' rendered strings (' + renderedText.length + ' from #app, '
      + dialogText.length + ' from the dialogs)'
    : renderedHits.join(' | ')
);

/* --- 92. LAYER C READS THE PAGE A SECOND TIME, WITH A FIGHT RUNNING ----------
   Every harvest above this line is taken in SETUP MODE. That was written down as
   entry 5 on the closing list — "a string that appears only once the fight has
   started is outside its reach until that surface is built and the walk is
   pointed at it" — and it was named there as Phase 5's to close. This is the
   walk being pointed at it, deliberately BEFORE the phase writes a word of fight
   copy, for the reason plan 03.1-01 gave when it did the same thing for the
   dialogs: a gate extended after the copy exists is a gate that was green for
   the whole of the window in which the copy was written.

   THE DRIVE FOLLOWS openDialogs' RECORDED LESSON EXACTLY, and the lesson is
   worth restating because it was learned the expensive way one plan up. Drive
   the REAL op, then ASK FOR A FRAME rather than hoping one is due. flush() runs
   a PENDING frame and does nothing at all when none is pending; the per-frame
   hooks a fight surface will hang off do not run otherwise, and the walk would
   read a page that happens to still be painted from setup and call it clean —
   which is the precise failure this whole harvest exists to prevent. One
   invalidate makes the frame due.

   ONE WORD LIST, THREE SURFACES. This scans through the same verdictHitsIn and
   the same relationshipHitsIn the two harvests above use, over the same
   RENDERED_VERDICT_WORDS. A second list would be a second thing to keep in step
   and the only difference between a word on the setup board and the same word on
   the fight board is which of them was on screen when it was read — which the
   record already carries.

   WHY THE HITS ARE HELD HERE RATHER THAN CONCATENATED INTO renderedHits ABOVE:
   so that a red run names WHICH PAGE said it. Row 48 is over a board a student
   is building; this row is over a board a student is playing, and those are two
   different conversations to have with whoever is reading the failure. */
/* THIS HARVEST IS TAKEN ON A FIGHT WITH AN EMPTY DECLARATION LIST, AND THAT IS
   A HOLE PLAN 05-10 HAS TO CLOSE. Measured by plan 05-07's probe X rather than
   suspected: [S06.7] assembles one declaration line per record out of the
   artifact's words and the student's, one node per fragment, with the
   action-name exemption marker on the student's half — and that whole
   arrangement is UNEXERCISED by this row, because startFight() leaves
   state.fight.decl empty and no declaration line is ever painted for the walk
   to read.

   The probe spelled one line as a SINGLE STRING instead — the exact defect the
   channel exists to prevent — renamed an action to a word on this file's own
   list, and took two harvests off the same page:

     with nothing declared   211 strings, ZERO hits   <- what this row takes
     with one declaration    212 strings, ONE hit:
         [winner] in "Cat 1 uses Winner on Mech 1." (read from #app)

   So the channel is correct and live — with the shipped spelling the same board
   harvests 213 strings and stays clean, because the walk skips the marked node
   and reads "Cat 1 uses " and " on Mech 1." as two of the artifact's own
   fragments — and this row cannot see either outcome. THE FIX IS ONE LINE: this
   harvest must be taken with at least one declaration on the page, on each
   side, through the real op. Plan 05-10 owns it. */
/* THE HOLE ABOVE IS NOW CLOSED, AND THE LEDGER IS WHY IT HAD TO BE. Plan 05-08
   built [S06.8], whose rows carry every word this artifact writes about a
   round that has already resolved — the action lines, the damage split as
   three facts, and every by-hand ruling. NOT ONE OF THOSE STRINGS EXISTS ON A
   PAGE WHERE startFight() HAS JUST BEEN CALLED: `past` is empty, so the region
   paints its heading and one sentence and stops. A floor taken off that page
   bounds the ledger at exactly nothing, and the plan's own threat register
   assigns the mitigation for "a ledger row that comments on what happened
   instead of reporting it" to THIS HARVEST. A mitigation that reads an empty
   region is not one.

   So the drive below PLAYS A ROUND rather than starting a fight: one
   declaration a side, a real Advance, and one declaration a side again. That
   is three surfaces on the page at once instead of one —

     the declaration list, which probe X measured as invisible to this row and
       which plan 05-07 named as requirement 2 on plan 05-10. The second pair
       of declarations is there for exactly that, because advanceRound EMPTIES
       the declaration list and a harvest taken straight after an Advance would
       have closed the ledger's hole and left that one open;
     one resolved round in the ledger, with its actions and its split;
     the what-changed reading, on a board that now has something to say.

   Every op below is a REAL op driven through App.ops, and the frame is ASKED
   FOR rather than hoped for — openDialogs' recorded lesson, restated one more
   time because it is the lesson this whole harvest exists on top of. */
/* AND THE HOLE THE TWO PARAGRAPHS ABOVE CLOSED IS NOT THE LAST ONE. PLAN 05-16
   RE-DROVE THIS HARVEST ONTO THE SURFACE D-27 SHIPPED, and the reason is the
   same one probe X gave and probe U(c) gave after it: a drive pointed at a
   surface that has moved harvests a page nobody plays on and stays green
   forever. Three surfaces arrived between plan 05-10 and this row — the view
   switch (05-12), the declaration GRID (05-13/05-14) and the BATTLEFIELD
   (05-15) — and not one of their strings existed on the page this drive was
   built against.

   SO THE BOARD IS DRESSED BEFORE THE FIGHT STARTS, and every piece of the
   dressing is here because a specific class of string is unreachable without
   it. Each is driven through a REAL op and never planted, which is 47d's
   standing rule and its reason:

     a SHIPPED token type RENAMED — the battlefield draws a label per token type
       per unit, and a renamed type's word enters the Layer C harvest on a THIRD
       surface here. Check 47d owns that claim for the dialogs; this is the same
       claim arriving on the battlefield, and the harvest must stay clean over
       it;
     a token type the STUDENT INVENTED, with a tally on a unit — the token
       vocabulary is an axis of this page's string count, and D-24's
       no-second-tier rule means an authored type draws exactly as a shipped one
       does. A board carrying only the shipped five cannot see that;
     a SHIELD allocated, so the battlefield's second line is non-zero and drawn
       rather than hidden at zero;
     DECLARATIONS STANDING ON BOTH SIDES when the harvest is taken — probe X's
       finding, unchanged and now larger: the grid's per-row landing reading, its
       per-button cost node and its per-action requirement sentence are all new
       strings and not one of them exists as a literal anywhere in this file, so
       Layers A and B cannot see them and this is the only layer that can;
     ONE UNIT RULED DEAD and ONE AT ZERO HEALTH THAT NOBODY RULED — the dead
       marker, its accessible name and the still-standing reading are three
       different strings and the pair of units is what puts all three on the
       page at once;
     A RETARGET HALF MADE on one side — the lit state is said by a real text
       node on every shape of the opposing roster, and the change-target
       control's own label sits beside the row that started it. Half-made is a
       PAGE state and not a state slice, so it is driven by pressing the real
       control;
     AND AT LEAST ONE ACTION BUTTON DISABLED. New with plan 05-16 and it is the
       one state this walk had never read. A disabled control's text and its
       accessible name are harvested exactly as an enabled one's are, so this is
       where a sentence explaining a refusal would be caught the day somebody
       writes one. The ruled-dead unit is what supplies it — fgActionOff's first
       condition — so it costs no second board.

   THE SNAPSHOT IS TAKEN TWICE, and that is not bookkeeping fussiness. The row
   asserts the board is BYTE-IDENTICAL after endFight to what it was before
   startFight, which is a claim about endFight and not about the dressing; so
   the comparison is against the DRESSED board, and the undressed one is
   restored underneath it afterwards for every row below. */
const fightSaved = JSON.stringify(A.state.get());

const fightOwnTok = A.ops.createTokenType({
  name: 'Zeal', shape: 'hex', color: 'violet', glyph: '\u{1F49C}', scope: 'unit'
});
A.ops.renameTokenType('shield', 'Ward');
const fightCatIds = A.state.get().build.cats.units.map((u) => u.id);
const fightMechIds = A.state.get().build.mechs.units.map((u) => u.id);
A.ops.setTally('cats', fightCatIds[0], fightOwnTok, 4);
A.ops.setUnitShield('cats', fightCatIds[0], 2);
A.state.flush();
const fightDressed = JSON.stringify(A.state.get());

A.ops.startFight();
A.state.invalidate();
A.state.flush();
// PLAN 05-12'S EDGE, ASSERTED HERE RATHER THAN ASSUMED: starting a fight moves
// the view to the fight tab. If it ever stops doing that, this harvest is taken
// on a hidden region and every string below goes missing at once — which is the
// failure this whole row exists to make loud rather than quiet.
const fightViewFollowed = String(dom.byId['app'].dataset.view || '') === 'fight';
A.ops.declareAction('cats', 'slash', fightCatIds[0], fightMechIds[0]);
A.ops.declareAction('mechs', 'lasers', fightMechIds[0], fightCatIds[0]);
A.state.invalidate();
A.state.flush();
A.ops.advanceRound();
A.state.invalidate();
A.state.flush();
A.ops.declareAction('cats', 'slash',
  fightCatIds[fightCatIds.length - 1], fightMechIds[fightMechIds.length - 1]);
A.ops.declareAction('mechs', 'lasers',
  fightMechIds[fightMechIds.length - 1], fightCatIds[fightCatIds.length - 1]);
A.state.invalidate();
A.state.flush();
// THE TWO HEALTH READINGS THAT MUST BOTH BE ON THE PAGE AT ONCE. The unit ruled
// dead is deliberately NOT one of the two that declared, so both declarations
// stay standing underneath it.
const fightDeadId = fightCatIds[1];
const fightZeroId = fightMechIds[1];
A.ops.setAlive('cats', fightDeadId, false);
A.ops.setUnitHp('mechs', fightZeroId, 0);
A.state.invalidate();
A.state.flush();
// A CHANGE OF TARGET, HALF MADE, through the control a student presses. THE ROW
// IT IS PRESSED ON IS THE LAST CAT'S AND NOT THE FIRST'S, and that is the drive
// meeting the same fact the second pair of declarations exists for: advanceRound
// EMPTIES the declaration list, so the only cats declaration standing when this
// runs is the one made after the Advance. A press on the first row would find no
// control there at all, which is how this reading came back false on its first
// run and is recorded here rather than quietly fixed.
const fightAtBtn = dom.byId['decl-cats'].querySelectorAll('[data-fg="at"]')
  .filter((b) => b.dataset.fgBy === fightCatIds[fightCatIds.length - 1])[0] || null;
if (fightAtBtn !== null) { press(fightAtBtn); release(fightAtBtn); }
A.state.invalidate();
A.state.flush();
const fightHalfMade = String(dom.byId['decl-cats'].dataset.fgAct || '') !== ''
  && String(dom.byId['decl-cats'].dataset.fgBy || '') !== '';
// THE SIX PAGE STATES THIS ROW NOW DEPENDS ON, read back OFF THE PAGE rather
// than assumed, so a drive that has quietly stopped reaching the surface says so
// by name instead of by a floor that happens to still clear. This is the answer
// to probe AS, which took this harvest with nothing declared and stayed green:
// the floor alone cannot tell a dressed board from an undressed one.
function fightPressedIn(rootId) {
  return dom.byId[rootId].querySelectorAll('[data-fg="act"]')
    .filter((b) => b.getAttribute('aria-pressed') === 'true').length;
}
const fightDeclStanding = fightPressedIn('decl-cats') + fightPressedIn('decl-mechs');
const fightDisabledActs = dom.byId['decl-cats'].querySelectorAll('[data-fg="act"]')
  .filter((b) => b.disabled === true).length;
/* THE TWO BATTLEFIELD READINGS ARE TAKEN FROM THE STATE ROOTS AS OF D-31, AND
   THE TURN IS RECORDED RATHER THAN QUIETLY REPOINTED. Until D-31 the clusters
   were inside the same two roots the pickers are in, and this row read them
   there. "separate the current round state from the action input area" moves the
   battlefield to the STATE area, because a cluster of shapes is a reading of
   what IS. The recorded RED is the run on the commit before this line changed:
   106 reported "shapes cats=0 mechs=0 against the fight roster [9,3]", 106b
   reported "the shape's health row -1 -> -1", and this row's own dressing
   clauses went with them — 92 failed on fightShapes, fightLit and both label
   counts at once.

   THE CLUSTER IS STILL READ FROM A ROOT AND NEVER FROM THE DOCUMENT, which is
   the property that matters and the reason this is not simply a wider
   querySelector: a lookup from #app takes the FIRST match and would stop telling
   the two sides apart the day anything else on the page grows a .bf-unit. */
const fightShapes = dom.byId['state-cats'].querySelectorAll('.bf-unit').length
  + dom.byId['state-mechs'].querySelectorAll('.bf-unit').length;
const fightLit = dom.byId['state-mechs'].querySelectorAll('.bf-unit')
  .filter((n) => String(n.className || '').indexOf('bf-unit--lit') !== -1).length;
const fightText = harvestInto(dom.byId['app'], [], '#app');
const fightHits = verdictHitsIn(fightText).concat(relationshipHitsIn(fightText));
/* THE RENAMED TYPE'S WORD AND THE AUTHORED TYPE'S WORD, MEASURED IN BOTH
   DIRECTIONS — AND THE MEASUREMENT CORRECTED WHAT THIS DRIVE WAS WRITTEN TO
   EXPECT, so the correction is recorded rather than papered over. The
   expectation was that a renamed type's word ENTERS this harvest on a third
   surface, in 47d's territory. It does not, and the reason is the marker doing
   exactly the job the 41 -> 56, 83 -> 108, 108 -> 120 and 120 -> N entries of
   the floor's history each record about a different node: every .bf-lbl carries
   the token-name exemption channel, so harvestInto SKIPS it.

   SO BOTH DIRECTIONS ARE READ. The words are counted ON THE PAGE, off the label
   nodes, which is what says the drive really reached the battlefield with a
   dressed board; and they are counted IN THE HARVEST, where they must be ZERO,
   which is what says the exemption channel is load-bearing on this surface too.
   A row that read only the second would be green over a battlefield that was
   never painted. */
function fightLabelsSaying(word) {
  return ['state-cats', 'state-mechs'].reduce((n, id) =>
    n + dom.byId[id].querySelectorAll('.bf-lbl')
      .filter((l) => l.textContent === word).length, 0);
}
const fightAuthoredOnPage = fightLabelsSaying('Zeal');
const fightRenamedOnPage = fightLabelsSaying('Ward');
/* THE HARVEST HALF IS A SUBSTRING TEST NOW AND NOT AN EQUALITY, AND THE TURN IS
   D-29's. It was `e.s === 'Zeal'` because until today a student's word only ever
   reached the page as the WHOLE text of one marked node — data-lbl, data-albl
   and data-anm each mark exactly that shape, and the lines this artifact
   assembles are built one node per fragment precisely so the marker can be that
   narrow. D-29 puts a student's word INSIDE an assembled sentence on a `title`
   and an `aria-label`, so an equality test would have gone on reading zero over
   a harvest full of "Cat 1 — Ward 2." and reported the exemption load-bearing
   while it was doing nothing at all. That is the fourth-green-row failure this
   phase keeps finding, and the widening is what stops this row joining it.

   IT IS ALSO WHAT MAKES data-tsay AN ASSERTION RATHER THAN A COMMENT: the
   channel removes the student's fragment from the two attributes it marks, and
   this reading is the only thing in the file that would notice if it stopped. */
const fightAuthoredSeen = fightText.filter((e) => e.s.indexOf('Zeal') !== -1).length;
const fightRenamedSeen = fightText.filter((e) => e.s.indexOf('Ward') !== -1).length;

/* --- THE SAME PAGE WITH D-28's PROJECTION SIDEBAR OPEN, harvested a second
   time and scanned again (plan 05-D28). Row 92b below is what this is for.

   THE WAVE-1 LESSON IS THE WHOLE REASON THIS EXISTS: a surface the walk never
   reaches reports clean forever. D-28 takes the projection OUT of the default
   fight view, and a walk that only ever saw the default fight view would stop
   scanning every word [S06.3] renders — silently, with no row going red and no
   number moving, which is exactly the shape check 47c and probe AS each
   measured from a different direction.

   AND THE HONEST HALF, WHICH IS THAT THIS PAGE CANNOT SEE THE HIDING. The stub
   has no stylesheet at all, and harvestInto reads the text of every leaf under
   #app WITHOUT asking whether an ancestor is displayed — the shell's own view
   switch comment says so about both views. So the projection's words are in the
   CLOSED harvest too, and the two readings differ by nothing at all in this
   page. What this drive therefore asserts is what it CAN: that the toggle is
   real and moves the attribute both ways when a student presses it, and that
   the projection's words are scanned in the state a student actually reads them
   in. The claim that the closed state really removes the panel from the page is
   a LAYOUT claim, it is asserted in tests/browser-checks.mjs check 10 in two
   browsers at two sizes, and it is named here so a reader does not mistake this
   row for it. */
const fightProjBtn = dom.byId['proj-toggle'];
press(fightProjBtn);
release(fightProjBtn);
A.state.invalidate();
A.state.flush();
const fightProjOpen = String(dom.byId['app'].dataset.proj || '') === '1'
  && dom.byId['proj-toggle'].getAttribute('aria-expanded') === 'true';
const fightOpenText = harvestInto(dom.byId['app'], [], '#app');
const fightOpenHits = verdictHitsIn(fightOpenText).concat(relationshipHitsIn(fightOpenText));
const fightStripText = harvestInto(dom.byId['strip'], [], '#strip');
const fightStripInOpen = fightStripText
  .filter((e) => fightOpenText.some((o) => o.s === e.s)).length;
press(fightProjBtn);
release(fightProjBtn);
A.state.invalidate();
A.state.flush();
const fightProjShut = String(dom.byId['app'].dataset.proj || '') === ''
  && dom.byId['proj-toggle'].getAttribute('aria-expanded') === 'false';

A.ops.endFight();
A.state.invalidate();
A.state.flush();
// THE BOARD IS PUT BACK AND THE PUTTING BACK IS ASSERTED, in check 62's manner.
// A harvest that costs the board something is a harvest no later row can trust,
// and "it costs nothing" is a claim worth reading rather than a habit worth
// having. endFight() is the op that owes this, not restore() — so the reading is
// taken BEFORE the restore, and the restore below is the belt to its braces.
// It is compared against the DRESSED board, for the reason the banner gives.
const fightBoardBack = JSON.stringify(A.state.get()) === fightDressed;
A.state.restore(fightSaved);
A.state.flush();

/* THE FIGHT PAGE'S OWN FLOOR, kept apart from the #app floor of 117 above for
   exactly the reason PICKER_FLOOR and PROPOSE_FLOOR are kept apart from
   DIALOG_FLOOR: 117 is a bound on the SETUP page, and a floor over one state of
   a surface cannot bound another state of it. A fight page that painted nothing
   at all would clear 117 by not being compared against it.

   AND IT IS SMALL TODAY, WHICH IS A FACT ABOUT THE SURFACE AND NOT A WEAK GATE —
   said out loud here for the reason SHARE_FLOOR's comment says it. NONE of this
   phase's fight surface exists yet. The fight page is the setup page minus the
   setup-only roster chrome and plus nothing, so this number is BELOW the setup
   figure rather than above it, and a reader arriving from 117 would otherwise
   assume a typo.

   MEASURED, four readings this session, and the arithmetic is written down
   rather than the answer:
     the shipped 9-and-3 board harvests 101 strings with a fight running,
       against 127 in setup. The 26 that go missing are exactly the setup-only
       chrome: 2 strings per unit card for the Remove button, 12 cards, plus one
       Add button per side worth 1 each;
     each unit card is worth EXACTLY 5 here, measured by adding three Mechs one
       at a time and watching 101 go 106, 111, 116 — two fewer than the 7 a card
       is worth in setup, which is the Remove button that left;
     so 12 cards carry 60 of the 101 and 41 move with no roster at all;
     and the model was CHECKED rather than assumed: a board shrunk to one unit a
       side reads 41 + 2x5 = 51, and 51 is what it measured. The same arithmetic
       reproduces setup exactly — 127 - 12x7 = 43, and the shrunk board reads
       43 + 2x7 = 57, measured — so the 41 and the 43 differ by the two Add
       buttons and nothing else, which is the whole of the difference between
       these two pages today.
   41 IS THEREFORE THE ROSTER-INDEPENDENT PART, and the floor is set AT it rather
   than below it, in PROPOSE_FLOOR's manner. The comparison is strictly greater
   than, so this is the exact reading of a fight page whose two columns went dark
   entirely — that trips it — while the smallest board this file can produce
   clears it by two whole unit cards. A walk pointed at the wrong node reads 0
   and does not come close.

   THE RULE FOR THE PLANS THAT BUILD THIS SURFACE — 05-07, 05-08 and 05-09, named
   here so the obligation has an owner rather than a hope: re-measure, and move
   this number by the roster-independent part alone. A floor left unmoved when a
   surface arrives is a floor that has quietly stopped bounding anything, which
   is the same silent shrink DIALOG_FLOOR's history note exists to prevent — and
   it is a likelier failure here than anywhere else in this file, because this
   floor was written before the thing it bounds.

   HISTORY — 41 -> 56, PLAN 05-07, THE FIRST OF THE THREE TO PAY IT.
   [S06.7] arrived and put the round, both pools, both survivor readings and a
   declaration list on the fight page. The move was measured on ONE artifact
   before and after the change, on two roster sizes, rather than reasoned about:

       board                       before [S06.7]   after   delta
       the suite's board here             101        116     +15
       a reset-to-defaults 9-and-3         97        112     +15
       one unit a side                     47         62     +15

   THE DELTA IS THE SAME ON EVERY BOARD, WHICH IS WHAT MAKES IT THE
   ROSTER-INDEPENDENT PART, and it is fifteen strings that can be named one at a
   time: the round number (1); each side's faction word, its spent reading and
   its remainder reading on the bar (3 x 2 = 6); and inside each declaration
   root the faction word, the survivor reading, the list's legend and the line a
   side with nothing declared says (4 x 2 = 8). The pool's own LABEL is a
   sixteenth string and is deliberately not counted: it carries the token-name
   exemption marker, so the walk skips it — which is the marker doing exactly
   its job, on a word a student can rename.

   41 + 15 = 56, and 56 is what 116 - 12x5 comes to on the board this row
   actually harvests. The two readings agree, which is the check on the
   arithmetic rather than a coincidence worth noting.

   ONE FIGURE IN THE PARAGRAPH ABOVE IS BOARD-SPECIFIC AND IS WORTH SAYING SO,
   because the next plan to re-measure will hit it: the roster-independent part
   is 41 on the board THIS ROW harvests and 37 on a reset-to-defaults board.
   Four strings of difference, and they are earlier checks' content rather than
   a defect in the 5-per-card model — which reproduces both boards exactly. Take
   the reading off THIS row's board, which is the one the floor is compared
   against.

   HISTORY — 56 -> 83, PLAN 05-07 AGAIN, ITS SECOND TASK.
   The declaration form arrived: three choosers a side, the cost report and the
   two round controls. Measured the same way and on the same two boards:

       board                       task 1   task 2   delta
       the suite's board here         116      215     +99
       a reset-to-defaults 9-and-3    112      211     +99

   AND THE MARGINAL COST OF A UNIT CARD MOVED, which is the part a plan reading
   only the totals would get wrong. It was 5 on the fight page; it is now 11,
   measured by trimming both rosters to two a side and then to one and watching
   the harvest go 123 -> 101. The extra 6 are the three chooser entries a unit
   now appears in — its own side's who-acts, and BOTH sides' what-it-lands-on,
   which is 03.1-07's asymmetry showing up in the arithmetic — at two strings
   each, because a chooser entry is a name node and a tick node.

   So the roster-independent part is 215 - 12x11 = 83, and it is 79 on a
   reset-to-defaults board by the same four strings of difference the entry
   above records. 83 is the reading off THIS row's board, which is the one the
   floor is compared against.

   ONE AXIS IS NEW AND IS WORTH NAMING, because it is not a roster: the action
   chooser draws one entry per action on the side, so the roster-independent
   part now also moves with the ACTION count. It only ever moves UPWARD — the
   six the board ships with cannot be removed ([S05]'s rule, because the
   reference band names them by id), so 83 is measured at the floor of that axis
   too and a student authoring actions can only clear it by more.

   HISTORY — 83 -> 108, PLAN 05-08, AND THE DRIVE MOVED WITH THE FLOOR.
   [S06.8] arrived: the ledger of resolved rounds and the what-changed reading
   beneath it. This is the entry where the number and the BOARD IT IS TAKEN OFF
   both change, so the two readings are recorded separately and the reason the
   drive changed is written above the drive rather than here.

   On the drive AS IT STOOD — startFight() and nothing else — the region paints
   its heading and the one sentence that says round 1 has not resolved yet, and
   the harvest goes 215 -> 217. Measured on three roster sizes:

       cards on the board          12    4    2
       harvest, old drive         217  129  107      per card 11, unchanged
       roster-independent part                       85

   That +2 is the whole of what a floor over the OLD drive can ever see of this
   region, because every row it draws needs a round that has resolved.

   On the drive as it now stands — one declaration a side, an Advance, one
   declaration a side again — the same three boards read:

       cards on the board          12    4    2
       harvest, new drive         276  164  136
       per card                          14   14
       roster-independent part                       108

   AND THE MARGINAL COST OF A UNIT CARD MOVED AGAIN, 11 -> 14, which is the
   part a plan reading only the totals would get wrong for the third time
   running. The extra 3 are the ledger row's own line for that unit: the walk
   reads its name-and-dash fragment, the fragment between its two numbers and
   the fragment after the second, and SKIPS the two token-name nodes between
   them because those carry the rename exemption marker. Three strings a unit,
   one row, and it is three rather than five for exactly the reason the pool's
   label was not counted in the 41 -> 56 entry: the marker doing its job.

   276 - 12x14 = 108, and 108 is the reading off THIS row's board, which is the
   one the floor is compared against. TWO AXES NOW MOVE THE ROSTER-INDEPENDENT
   PART AND BOTH ONLY EVER MOVE IT UPWARD: the action count, recorded in the
   entry above, and now THE NUMBER OF ROUNDS ALREADY RESOLVED — one more row is
   one more round label, one more note, two more faction words, one line per
   unit and the action lines with their three-fact split. The drive resolves
   exactly one round, so 108 is measured at the floor of that axis too.

   HISTORY — 108 -> 120, PLAN 05-09, THE LAST OF THE THREE TO PAY IT.
   [S06.9] arrived: the dead marker and its toggle and the by-hand marker on
   every unit card, FIGHT-10's line at two sites, and PROJ-05's live reading in
   #strip. Measured the same way and on the same three boards:

       cards on the board          12    4    2
       harvest                    420  220  170
       per card                          25   25
       roster-independent part                       120

   420 - 12x25 = 120, and 220 - 4x25 and 170 - 2x25 come to 120 as well, which
   is the check on the arithmetic rather than a coincidence worth noting.

   AND THE MARGINAL COST OF A UNIT CARD MOVED FOR THE FOURTH TIME RUNNING,
   14 -> 25, which is the part a plan reading only the totals would get wrong
   again. The extra ELEVEN are named one at a time, and the arithmetic is worth
   writing out because one third of it was a SURPRISE:
     the alive toggle's word and its tick                              2
     three by-hand markers — health, shield and the dead flag — each a
       glyph node and a word node                                      6
     and the SAME three markers read a SECOND time through their
       aria-label                                                      3
   The last three are the surprise and they are this walk behaving exactly as
   written: harvestInto reads every attribute in LABEL_ATTRS, aria-label among
   them, and skips one only when the node carries the stepper's own data-albl
   channel. A marker that says its state twice — once in text and once as an
   accessible name, which is [C07]'s standing rule — is therefore read twice.
   The dead marker's own LABEL is NOT among the eleven, because it carries the
   token-name exemption marker: the same marker doing its job that the 41 -> 56
   entry recorded about the pool's label and the 83 -> 108 entry recorded about
   the ledger row's two token names.

   THE TWELVE THAT ARE ROSTER-INDEPENDENT are FIGHT-10's line at its two sites
   plus the live reading: the line on the bar (1), the line in each of the two
   column heads (2), the live reading's heading (1), and per side its faction
   word, its survivor reading, the tail of its points reading and its turn
   reading (4 x 2 = 8). The points reading's LABEL is a thirteenth string and is
   deliberately not counted, for the third time in this comment's history: it
   carries the token-name exemption marker, so the walk skips it.

   A THIRD AXIS NOW MOVES THE ROSTER-INDEPENDENT PART AND IT ALSO ONLY EVER
   MOVES IT UPWARD: the number of SIDES, which is two and is not going to
   change. The action count and the number of resolved rounds are the other two
   and both are recorded above. 120 is measured at the floor of all three.

   NOTHING WAS STILL OWING AT THAT LINE. Plans 05-07, 05-08 and 05-09 were the
   three this comment named and all three had paid. The sentence that stood here
   said "a plan that adds a fight surface after this one inherits the same
   obligation and the same method", and THREE MORE ARRIVED — so the entry below
   is that obligation being paid a fifth time.

   HISTORY — 120 -> 116, PLAN 05-16, AND IT IS THE FIRST ENTRY THAT MOVES THE
   NUMBER DOWN. Three surfaces arrived after plan 05-09 and not one of the three
   plans that built them touched this comment: the view switch (05-12), the
   declaration GRID that retired the old form (05-13 and 05-14), and the
   BATTLEFIELD (05-15). The drive above was re-pointed at all three; this is the
   arithmetic that came back.

   AND THE PER-CARD FIGURE IS NO LONGER ONE NUMBER. It is a figure PER SIDE, and
   that is the finding of this entry rather than a detail of it. Measured on one
   artifact by varying one roster at a time:

       cats varied, mechs held at 3        cards   strings   delta
         2 cats                              5       264
         3 cats                              6       293       +29
         4 cats                              7       322       +29
         5 cats                              8       351       +29
         6 cats                              9       380       +29
         9 cats                             12       467       +29 x3

       mechs varied, cats held at 9
         2 mechs                            11       437
         3 mechs                            12       467       +30
         4 mechs                            13       497       +30
         5 mechs                            14       527       +30
         6 mechs                            15       557       +30

   A CAT COSTS 29 AND A MECH COSTS 30, and the one string of difference is the
   RETARGET. The drive leaves a change of target half made on the CATS side, so
   every shape on the MECHS battlefield is lit and each lit shape says so in a
   real text node. Lighting is a property of the OPPOSING side, so it lands on
   one roster and not on the other. A plan reading only the totals would have
   averaged the two into 29.125 and got the model wrong — which is the fifth
   time running that reading only the totals would have been wrong.

   THE ROSTER-INDEPENDENT PART IS 116 AND IT REPRODUCES EVERY BOARD MEASURED,
   which is the check on the arithmetic rather than a coincidence worth noting:

       cats x mechs     29c + 30m + 116     measured
         1 x 1                175              175
         2 x 2                234              234
         2 x 3                264              264
         3 x 3                293              293
         4 x 4                352              352
         6 x 6                470              470
         9 x 3                467              467
         9 x 6                557              557

   EVERY ROSTER ON THAT TABLE WAS TRIMMED BEFORE startFight, which is the method
   the closing paragraph prescribes and the reason it prescribes it.

   WHY THE NUMBER WENT DOWN, said plainly, because a floor that FALLS is exactly
   the shape of a floor that has quietly stopped bounding anything — and this one
   has not. D-27 retired a form whose cost was mostly roster-INDEPENDENT: three
   chooser legends, the cost report, the Declare button, and the "Declared so
   far" list with its own legend and its empty-list sentence, all of it twice
   over for two sides. It replaced them with a GRID whose cost is almost entirely
   roster-DEPENDENT — one row per unit, one button per action on it. The strings
   did not go away; they moved out of the constant and into the coefficient. The
   totals say so: the same 12-card board read 420 under plan 05-09 and reads 467
   now, while the constant behind it fell from 120 to 116.

   THE AXES THAT MOVE THE ROSTER-INDEPENDENT PART. Three of the six are new with
   this phase, each is MEASURED rather than reasoned about, and each is stated
   with its direction:

     1. THE ACTION COUNT (recorded first at 83). Still up-only, and it now moves
        BOTH figures. On a 4-cat, 3-mech board: 3 cat actions 322, 4 cat actions
        331, 5 cat actions 340 — +9 an action, of which 2 per cat row is the new
        button and the remainder is roster-independent. The six shipped actions
        cannot be removed ([S05]'s rule, because the reference band names them by
        id), so 116 is measured at the floor of this axis.
     2. THE NUMBER OF RESOLVED ROUNDS (recorded first at 108). Up-only, and the
        drive resolves exactly one, so 116 is measured at the floor of it.
     3. THE NUMBER OF SIDES (recorded first at 120). Two, and not going to
        change.
     4. THE PICKER IS A PRODUCT AND NOT A CONSTANT — NEW. A unit on the fight
        page is no longer a fixed number of strings: it is one row plus one
        button per action, so the PER-CARD figure itself moves with the action
        count. That is axis 1 arriving in the coefficient, and it is why every
        per-card figure above is quoted with the board it was taken on.
     5. THE BATTLEFIELD, AND THE COMPACTION TRAP — NEW, and it is the axis that
        looks as though it points the wrong way. A shape draws one line per token
        type the unit holds a non-zero amount of, and a row at or above
        App.render.COMPACT_AT draws a COUNT string where a loose row draws none —
        so a BIGGER number is MORE strings and not fewer. Measured on a 4-cat,
        3-mech board with the cats' health varied:
            shipped                       322
            11 (one below COMPACT_AT=12)  322
            12                            329
            17                            331
            30                            330
        Every compacted reading is ABOVE both uncompacted ones, so this axis
        cannot take the page below the floor. It is recorded because this plan
        was told to CHECK the direction rather than assume it, and the direction
        is the safe one. The one-string dip from 331 at 17 to 330 at 30 is
        measured and deliberately not explained here; both are above the
        uncompacted reading and the floor does not turn on which is larger.
     6. THE TOKEN VOCABULARY — NEW, and it is the axis this drive PINS. A type a
        student invents is drawn on every unit that holds it, and the drive above
        deliberately carries one. Measured on a 4-cat, 3-mech board:
            no invented type, no rename, no shield allocated   298
            the drive's own dressing                           322
        The dressing is worth +2 a card and +10 to the roster-independent part,
        so the UNDRESSED constant is 106 and the dressed one is 116. THE FLOOR IS
        SET AT 116, WHICH IS THE READING OFF THE BOARD THIS ROW ACTUALLY
        HARVESTS: the drive dresses the board on every run and the row ASSERTS
        that it did, so the dressing is not a free axis here. A floor set at 106
        would clear a dressed page that had lost every unit on it, which is
        precisely the failure this floor exists for.

   116 IS THEREFORE THE FLOOR. The comparison is strictly greater than, so a
   fight page whose two grids and two battlefields went dark entirely reads
   exactly 116 and trips it, while the smallest board this file can produce — one
   unit a side — clears it by 59. A walk pointed at the wrong node reads 0 and
   does not come close.

   HISTORY — 116 -> 116, PLAN 05-D28, AND THE ENTRY IS THE MEASUREMENT RATHER
   THAN THE MOVE. D-28 rearranged the whole fight tab: the band became a
   full-width stack, the ledger became a horizontal lane above the round being
   played, and the projection left the default fight view for a toggled sidebar.
   Three changes, any of which a plan would reasonably expect to move a floor.
   The obligation above says a plan that adds a fight surface re-measures, so
   this one did, by the method the paragraph below prescribes — rosters trimmed
   BEFORE startFight, each side varied separately:

       cats varied, mechs held at 3        cards   strings   delta
         2 cats                              5       264
         3 cats                              6       293       +29
         4 cats                              7       322       +29
         5 cats                              8       351       +29
         6 cats                              9       380       +29
         9 cats                             12       467       +29 x3

       mechs varied, cats held at 9
         2 mechs                            11       437
         3 mechs                            12       467       +30
         4 mechs                            13       497       +30
         5 mechs                            14       527       +30
         6 mechs                            15       557       +30

       cats x mechs     29c + 30m + 116     measured
         2 x 2                234              234
         2 x 3                264              264
         3 x 3                293              293
         4 x 4                352              352
         6 x 6                470              470
         9 x 3                467              467
         9 x 6                557              557

   EVERY FIGURE IS BYTE-IDENTICAL TO THE 120 -> 116 ENTRY ABOVE. A cat still
   costs 29, a mech still costs 30, and the roster-independent part is still 116
   on the board this row harvests.

   WHY NOTHING MOVED, WHICH IS THE PART WORTH WRITING DOWN, because "we changed
   three surfaces and the count did not move" is exactly the reading that means
   a drive has stopped reaching something:

     1. THE LANE'S ACTION LINES WERE ALREADY THERE. D-28 asks for past rounds
        "showing the past state and acctions selected", and ldDidInto has
        rendered exactly that since plan 05-08 — one line per declaration naming
        who used what on whom, with the split's three facts under it. What D-28
        moved is where those lines SIT, not whether they exist. Row 103f now
        asserts both halves off a card so the day somebody tidies the actions
        out of a card there is a row that says so.
     2. THE TOGGLE RENDERS NO WORD, BY DESIGN. [S06.10]'s banner refuses a label
        that says "Show the projection" and then "Hide the projection", and
        ships one permanent label plus a real tick node instead. A permanent
        label is STATIC MARKUP, this stub carries no text for static markup by
        its standing convention, and Layer A reads it in the document. So the
        control costs this harvest zero strings — which is the same reason
        #round-label and #fight-head have always cost it zero.
     3. THE PROJECTION NEVER LEFT THIS HARVEST AT ALL, and it is the one of the
        three that a reader will assume moved the number. The hiding is a CSS
        display rule; this page has no stylesheet and harvestInto never asks
        whether an ancestor is displayed. So the strip's strings are in the
        closed reading exactly as they are in the open one. Row 92b drives the
        toggle anyway and harvests the OPEN state, for the wave-1 reason its own
        comment gives; the claim that the closed state removes the panel from
        the page is a layout claim and lives in tests/browser-checks.mjs.

   AND ONE AXIS IS RETIRED FROM THE LIST BELOW RATHER THAN LEFT STANDING: there
   is no seventh axis for the sidebar, because open and closed are the same
   number here. If a later plan gives the toggle a rendered word, that word is a
   seventh axis and it moves the constant.

   THE OBLIGATION STANDS, RESTATED RATHER THAN RETIRED, and it now carries one
   more instruction than it did. A plan that adds a fight surface after this one
   inherits the same method: trim the roster BEFORE startFight — a mid-fight
   removeUnit moves the build and leaves the fight slice, the ledger's record and
   the grid holding every unit, and a per-card figure taken that way measures the
   setup chrome alone — AND vary each roster SEPARATELY, because as of this entry
   the two sides no longer cost the same.

   HISTORY — 116 -> 130, D-29, AND THIS ONE MOVES THE NUMBER UP FOR THE FIRST
   TIME SINCE 108 -> 120. D-29 takes the fight surface's prose off the page and
   puts it on `title` and `aria-label`: past board states, the what-changed
   panel, the split's three facts, the shortfall line, hand rulings, the picker's
   costs and the requirement lines all now draw a SYMBOL and describe themselves
   on hover. Every one of those sentences is still harvested — LABEL_ATTRS has
   carried `title` since the walk was lifted over the dialog roots — so the
   strings did not leave; they moved channel, and TWO channels are written where
   one was, because a tooltip without an accessible name is a reading assistive
   technology cannot see. Re-measured by the method above, rosters trimmed BEFORE
   startFight, each side varied separately, with the harvest broken down by
   region because the totals alone would have hidden what follows:

       cats varied, mechs held at 3    total   #ledger  #fightbar  #board  delta
         2 cats                          320      71        97       144
         3 cats                          358      77       111       162    +38
         4 cats                          396      83       125       180    +38
         5 cats                          434      89       139       198    +38
         6 cats                          472      95       153       216    +38
         9 cats                          586     113       195       270    +38 x3

       mechs varied, cats held at 9
         2 mechs                         548     108       180       252
         3 mechs                         586     113       195       270    +38
         4 mechs                         624     118       210       288    +38
         5 mechs                         662     123       225       306    +38
         6 mechs                         700     128       240       324    +38

   A CAT AND A MECH BOTH COST 38 NOW, AND THAT SYMMETRY IS A COINCIDENCE OF TWO
   OPPOSITE ASYMMETRIES RATHER THAN A SIMPLIFICATION — which is why the regional
   breakdown is in the table above and why the method's closing instruction to
   vary each side SEPARATELY stands unchanged. Read across:

         a cat    #ledger 6 + #fightbar 14 + #board 18 = 38
         a mech   #ledger 5 + #fightbar 15 + #board 18 = 38

   THE LANE COSTS A CAT ONE STRING MORE THAN A MECH, AND THE CAUSE IS D-29's OWN
   ZERO FORM. A shipped cat has shield 0 and a shipped mech has shield 3
   (DEFAULTS: `makeUnits('c', 'Cat', 9, { maxHp: 3, shield: 0 })` against
   `makeUnits('m', 'Mech', 3, { maxHp: 6, shield: 3 })`). A quantity of zero
   cannot be drawn by repetition, so [S06.12] draws D-21's compact form — the
   count, the sign and one token — and that count node is a leaf. A cat's lane
   reading is therefore a name leaf, two tooltips, two accessible names and a
   `0×`; a mech's is the same without the last. THE GRID COSTS A MECH ONE MORE
   THAN A CAT and that asymmetry is the one plan 05-16 already recorded from the
   other side: the drive leaves a change of target half made on the CATS side, so
   every shape on the MECHS battlefield is lit and each lit shape says so in a
   real text node. The two differences are one string each, in opposite
   directions, and they cancel. A plan reading only the totals would conclude the
   two sides cost the same and be right by accident.

   THE ROSTER-INDEPENDENT PART IS 130 AND IT REPRODUCES EVERY BOARD MEASURED:

       cats x mechs     38c + 38m + 130     measured
         2 x 2                282              282
         2 x 3                320              320
         3 x 3                358              358
         4 x 4                434              434
         6 x 6                586              586
         9 x 3                586              586
         9 x 6                700              700

   ONE BOARD IS OFF THE TABLE AND SAYS SO RATHER THAN BEING QUIETLY DROPPED.
   1 x 1 measures 196 against a model of 206, and the ten strings are the TWO
   RULINGS this drive cannot make on it: it rules the second cat dead and drives
   the second mech to zero health, and a one-unit roster has no second unit on
   either side. Plan 05-D28 recorded the cats half of that; the mechs half is the
   same fact one roster over. It clears the floor by 66 all the same.

   THE SIX AXES, RE-READ, AND ONE OF THEM HAS A NEW DIRECTION:

     1-4. THE ACTION COUNT, THE NUMBER OF RESOLVED ROUNDS, THE NUMBER OF SIDES
        and THE PICKER BEING A PRODUCT are unchanged in kind. The drive still
        resolves exactly one round, the six shipped actions still cannot be
        removed, and there are still two sides, so 130 is measured at the floor
        of each.
     5. THE COMPACTION TRAP NOW POINTS BOTH WAYS, AND THAT IS THIS ENTRY'S ONE
        NEW FINDING ABOUT AN OLD AXIS. Plan 05-16 recorded that a BIGGER number
        is MORE strings, because a row at or above App.render.COMPACT_AT draws a
        count where a loose row draws none. D-29 adds the other end: a quantity
        of ZERO also draws a count, for the reason above. Measured on a 4-cat,
        3-mech board with the cats' health varied:
            0                             397
            1                             398
            3   (shipped)                 396
            11  (one below COMPACT_AT)    396
            12                            408
            17                            411
            30                            410
        THE SHIPPED READING IS THE MINIMUM OF THAT SWEEP, which is the only
        thing the floor turns on: no health value takes the page below the board
        it is measured on. The 397 and 398 at zero and one are the resolution
        readings changing shape on a board where a unit is dying rather than the
        compaction axis, and they are recorded rather than explained for the
        reason 05-16 gives about its own one-string dip — both are above the
        floor and the floor does not turn on which is larger.
     6. THE TOKEN VOCABULARY, AND THE DRESSING COSTS EXACTLY WHAT IT COST
        BEFORE, which is the check on this whole re-measurement. Undressed
        boards, same drive, no invented type, no rename, no shield allocated:
            2 x 2  264      4 x 3  372      5 x 3  408      4 x 4  408
        That is 36 a unit on either side over a constant of 120 — so the
        dressing is worth +2 A CARD AND +10 TO THE CONSTANT, byte-identical to
        the figure plan 05-16 measured. The dressing's shape did not change at
        all; only the base under it moved.

   130 IS THEREFORE THE FLOOR, and it is the dressed constant for plan 05-16's
   stated reason: the drive dresses the board on every run and row 92 ASSERTS
   that it did, so the dressing is not a free axis here. A floor set at the
   undressed 120 would clear a dressed page that had lost every unit on it,
   which is precisely the failure this floor exists for. The comparison is
   strictly greater than, so a fight page whose two grids and two battlefields
   went dark entirely reads exactly 130 and trips it.

   AND ONE OBLIGATION IS ADDED TO THE METHOD RATHER THAN REPLACING IT. A plan
   that moves prose ONTO OR OFF an attribute re-measures this constant too, not
   only one that adds a surface — because D-29 moved no surface at all and moved
   this number by 14. The three channels that carry copy are `title`,
   `aria-label` and the text of a leaf, LABEL_ATTRS names the first two, and a
   sentence that changes channel changes this count.

   HISTORY — 130 -> 132, D-31, AND IT IS THE SMALLEST MOVE THIS CONSTANT HAS
   EVER MADE. "separate the current round state from the action input area."
   The round splits into two areas, each holding its own pair of columns, so
   each side's NAME is now drawn twice — once at the head of its state column
   and once at the head of its input column. That is two strings, they are
   roster-independent, and they are the whole of the move. Re-measured by the
   method above, rosters trimmed BEFORE startFight, each side varied separately,
   with the regional breakdown kept because the totals alone hide where a change
   landed:

       cats varied, mechs held at 3    total   #ledger  #fightbar  #board  delta
         2 cats                          322      71        99       144
         3 cats                          360      77       113       162    +38
         4 cats                          398      83       127       180    +38
         5 cats                          436      89       141       198    +38
         6 cats                          474      95       155       216    +38
         9 cats                          588     113       197       270    +38 x3

       mechs varied, cats held at 9
         2 mechs                         550     108       182       252
         3 mechs                         588     113       197       270    +38
         4 mechs                         626     118       212       288    +38
         5 mechs                         664     123       227       306    +38
         6 mechs                         702     128       242       324    +38

   A CAT AND A MECH STILL COST 38 EACH AND THE +2 IS ENTIRELY IN #fightbar,
   which is what says the change landed where D-31 put it and nowhere else. Read
   against the D-29 table above, every board is exactly two strings larger, the
   ledger column is byte-identical at every row, and the board column is
   byte-identical at every row. The whole of the difference is the fight
   region's own: 195 -> 197 at 9x3, 180 -> 182 at 9x2, 240 -> 242 at 9x6 — two
   per board, never two per unit.

       cats x mechs     38c + 38m + 132     measured
         2 x 2                284               284
         2 x 3                322               322
         3 x 3                360               360
         4 x 4                436               436
         6 x 6                588               588
         9 x 3                588               588
         9 x 6                702               702

   AND THE TWO AREA HEADINGS COST THIS NUMBER NOTHING, WHICH IS A GAP IN THIS
   LAYER RATHER THAN A SAVING. "Where the round stands" and "What you are about
   to do" are written into the SHELL MARKUP, and this page is a hand-made stand-
   in rather than a parser — the paragraph beside VERDICT_WORDS says so in as
   many words: "text written directly into the markup is empty there". So the
   two new headings are invisible to Layer C exactly as #fight-head's "This
   round" and #ledger-head's "Earlier rounds" already are, and exactly as
   load-bearing: they are covered by LAYER A, which reads the whole document
   including its markup, and that is where a heading naming a resolution would
   be caught. This is written down rather than left implicit because a future
   reader comparing +2 against four new strings will otherwise conclude the
   measurement is wrong. */
const FIGHT_FLOOR = 132;

console.log('scan: ' + fightText.length + ' rendered strings read from #app WITH '
  + 'A FIGHT RUNNING (Layer C, floor ' + FIGHT_FLOOR + ')');

check(
  '92. Layer C reads the page a SECOND time, with a fight actually running, and '
    + 'nothing the fight page paints judges a build. The floor and the scan ride '
    + 'in one row because they are two halves of one claim — a scan of a page '
    + 'that was never painted is a spotlessly clean scan of nothing, which is '
    + 'the failure row 47c exists to catch one surface down. AND THE BOARD IT IS '
    + 'TAKEN ON IS READ BACK BESIDE THE COUNT: the view followed the start, '
    + 'declarations are standing on both sides, at least one action button is '
    + 'DISABLED, both battlefields are painted, a change of target is half made '
    + 'and the opposing shapes are lit, and a type the student RENAMED and a '
    + 'type the student INVENTED are both DRAWN on the battlefield and both '
    + 'ABSENT from the harvest, which is the exemption channel load-bearing on '
    + 'a third surface. A floor cannot tell a dressed board from an undressed '
    + 'one — probe AS measured exactly that — so the dressing is asserted '
    + 'rather than hoped for. The board is put back afterwards and the putting '
    + 'back is read here too, because a harvest that costs the board something '
    + 'is a harvest no row below can trust',
  fightHits.length === 0 && fightText.length > FIGHT_FLOOR && fightBoardBack
    && fightViewFollowed === true && fightDeclStanding === 2
    && fightDisabledActs > 0 && fightShapes > 0 && fightHalfMade === true
    && fightLit > 0 && fightAuthoredOnPage > 0 && fightRenamedOnPage > 0
    && fightAuthoredSeen === 0 && fightRenamedSeen === 0,
  (fightHits.length === 0 ? '' : fightHits.join(' | ') + ' | ')
    + 'harvested ' + fightText.length + ' strings from #app with a fight running'
    + ' (floor ' + FIGHT_FLOOR + ')'
    + ' | the view followed startFight=' + fightViewFollowed
    + ' | declarations standing=' + fightDeclStanding
    + ' | action buttons disabled on the cats grid=' + fightDisabledActs
    + ' | battlefield shapes painted=' + fightShapes
    + ' | a change of target is half made=' + fightHalfMade
    + ' and the opposing shapes lit=' + fightLit
    + ' | the INVENTED type is drawn on ' + fightAuthoredOnPage + ' labels and '
    + 'harvested ' + fightAuthoredSeen + ' times; the RENAMED one is drawn on '
    + fightRenamedOnPage + ' labels and harvested ' + fightRenamedSeen + ' times'
    + '; board after endFight is '
    + (fightBoardBack ? 'byte-identical to the board before startFight'
      : 'NOT the board it was before startFight')
);

console.log('scan: ' + fightOpenText.length + ' rendered strings read from #app WITH '
  + 'A FIGHT RUNNING AND D-28\'s PROJECTION SIDEBAR OPEN (Layer C, floor '
  + FIGHT_FLOOR + ')');

check(
  '92b. AND THE SAME PAGE WITH THE PROJECTION SIDEBAR OPEN, harvested and '
    + 'scanned a SECOND time. D-28 takes the projection out of the default '
    + 'fight view, and the wave-1 lesson is that a surface the walk never '
    + 'reaches reports clean forever — so the toggle is PRESSED, the open state '
    + 'is harvested, and every string [S06.3] renders is scanned in the state a '
    + 'student actually reads it in. The toggle is driven BOTH WAYS and both '
    + 'ends are read back off the page, because a control that opens and cannot '
    + 'close is a panel a student is stuck with. THIS PAGE CANNOT SEE THE '
    + 'HIDING and the row says so rather than implying it: the stub has no '
    + 'stylesheet and the walk never asks whether an ancestor is displayed, so '
    + 'the two harvests are the same length by construction and the claim that '
    + 'the closed state removes the panel is a LAYOUT claim asserted in '
    + 'tests/browser-checks.mjs in two browsers at two sizes. Floored on the '
    + 'projection\'s own leaves being FOUND and on every one of them being '
    + 'present in the open harvest, because a walk over a strip that was never '
    + 'painted finds nothing to judge spotlessly',
  fightOpenHits.length === 0
    && fightProjOpen === true && fightProjShut === true
    && fightOpenText.length > FIGHT_FLOOR
    && fightStripText.length > 0
    && fightStripInOpen === fightStripText.length,
  (fightOpenHits.length === 0 ? '' : fightOpenHits.join(' | ') + ' | ')
    + 'harvested ' + fightOpenText.length + ' strings with the sidebar OPEN'
    + ' against ' + fightText.length + ' with it closed (floor ' + FIGHT_FLOOR + ')'
    + ' | one press opened it=' + fightProjOpen
    + ' and a second press shut it=' + fightProjShut
    + ' | the projection renders ' + fightStripText.length + ' leaves, of which '
    + fightStripInOpen + ' are in the open harvest'
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
const fullSideTok = A.ops.createTokenType({
  name: 'Fastest', shape: 'circ', color: 'gold', glyph: '', scope: 'side'
});
const fullAct = A.ops.createAction('mechs', 'Unfair');
/* D-32: THE ACTION IS DRIVEN TO THE CAP ON ALL THREE LISTS — four costs, four
   requirements, four changes — because "the editor must accept adding up to
   four terms per list" is the claim, and an editor drive that filled two of
   four would be green over a shell that reserved two. Every write goes through
   the shipped op at its own slot, which is what says the slot argument arrives
   where it is meant to; a run that wrote slot 0 four times would leave a
   one-term list and this row's counts would say so. */
const fullSlots = [0, 1, 2, 3];
fullSlots.forEach((slot) => {
  A.ops.setActionCost('mechs', fullAct, slot,
    slot === 0 ? 'ap' : (slot === 1 ? fullSideTok : fullTok), slot + 1);
  A.ops.setActionReq('mechs', fullAct, slot,
    slot === 0 ? 'hp' : (slot === 1 ? 'shield' : fullTok), slot + 1);
  A.ops.setActionXf('mechs', fullAct, slot, A.data.XF_WHO[slot % 2],
    slot === 0 ? 'hp' : fullTok, slot === 0 ? -3 : (slot + 1));
});
A.state.flush();
const fullRecord = A.state.get().build.mechs.actions
  .filter((a) => a.id === fullAct)[0];
const fullLengths = [fullRecord.cost.length, fullRecord.req.length,
  fullRecord.xf.length];

const fullDlg = dom.byId['act-edit'];
if (fullDlg.open !== true) { fullDlg.showModal(); }
A.render.editor(A.state.get(), 'mechs', fullAct);
A.state.flush();
const fullRowIds = ['cost', 'req', 'xf'].reduce((all, field) =>
  all.concat(fullSlots.map((slot) => 'act-edit-' + field + '-' + slot)), []);
const fullRowsShown = fullRowIds.filter((id) => dom.byId[id].hidden === false);
const fullAmountsShown = fullRowIds
  .filter((id) => dom.byId[id + '-amt'].hidden === false
    && dom.byId[id + '-amt'].value !== '');
const fullText = harvestInto(fullDlg, [], '#act-edit');
const fullHits = verdictHitsIn(fullText);
if (fullDlg.open === true) { fullDlg.close(); }
A.state.restore(fullSaved);
A.state.flush();
clearPanel();

const fullCap = A.ops.MAX_ACTION_COST + A.data.MAX_ACTION_REQ
  + A.data.MAX_ACTION_XF;
check(
  '69g. every term row of the action editor is populated at once — FOUR costs, '
    + 'four requirements and four transformations under D-32, over an action '
    + 'and a token type a student named after comparative words — and the '
    + 'rendered-page walk over the whole dialog stays clean. The token name '
    + 'reaches the page once per chooser pill per row, which is a channel that '
    + 'did not exist when the first exemption control was written. TURNED IN '
    + 'THE OPEN: this row read FIVE rows and five amounts until D-32, over a '
    + 'cost that could only be one term and lists that stopped at two; the '
    + 'recorded RED is the run on the commit that raised the caps, where it '
    + 'threw on act-edit-cost because that id had become act-edit-cost-0. The '
    + 'counts are read off the exported CAPS rather than typed, so the next '
    + 'plan to move them moves this row with them, and the record is read back '
    + 'beside the page so a shell that drew twelve rows over a four-term list '
    + 'cannot satisfy it',
  fullHits.length === 0 && fullRowsShown.length === fullCap
    && fullAmountsShown.length === fullCap
    && fullLengths.join(',') === [A.ops.MAX_ACTION_COST,
      A.data.MAX_ACTION_REQ, A.data.MAX_ACTION_XF].join(','),
  fullHits.length === 0
    ? 'clean across ' + fullText.length + ' strings harvested from #act-edit '
      + 'with all ' + fullRowsShown.length + ' term rows shown (cap ' + fullCap
      + ') and all ' + fullAmountsShown.length + ' amounts filled, over a '
      + 'record carrying cost/req/xf lengths ' + fullLengths.join('/')
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
A.ops.setActionCost('cats', apAct, 0, 'ap', 1);
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
A.ops.setActionCost('mechs', apCAct, 0, 'ap', 2);
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
A.ops.setActionCost('cats', nlAct, 0, 'ap', 1);
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

/* 72b. THE ONE-APPLIER CHECK, and the ALLOWLIST is the requirement rather than
   an accident of what has been written so far.

   TURNED BY PLAN 05-04, IN THE OPEN, AND REWRITTEN RATHER THAN DELETED — the
   same treatment [S09.10]'s two boundary rows got in the same change, and for
   the same stated reason: a deleted boundary assertion is an Out of Scope entry
   that has quietly stopped being enforced. This check was written when a
   declared action landed on an Advance that did not exist yet (D-05b). It does
   now, it is called advanceRound, and what this check asserts is that it is the
   ONLY one: applyDamage, spendAp, fireAction, resolveRound, dealDamage,
   landAction, performAction, executeRound and enactRound all still redden here.

   The export list is read back off the live object and the router is still
   driven with an applier's name, because a list read from source spelling would
   be blind to an applier reached through a helper — Phase 3's own WR-01 lesson.
   The [S09.10] row in the artifact carries the same allowlist; this one fires in
   CI over the LIVE gate as well, which is the earlier of the two signals. */
const nlExports = Object.keys(A.ops).sort();
const APPLIER_ALLOWED = 'advanceRound';
const nlAppliers = nlExports.filter((k) =>
  /^(apply|resolve|advance|spend|fire|perform|execute|enact|land|deal|damage)/i.test(k));
const nlExtraAppliers = nlAppliers.filter((k) => k !== APPLIER_ALLOWED);
let nlRouterRefused = false;
try {
  A.ops.dispatch('applyProposal', { side: 'cats' });
} catch (refused) {
  nlRouterRefused = true;
}
const nlAfterRouter = JSON.stringify(A.state.get());

check(
  '72b. THE ONE-APPLIER CHECK. [S05] exports EXACTLY ONE function that applies '
    + 'a transformation and it is advanceRound; App.ops.dispatch has no arm for '
    + 'any other — read off the LIVE export list and driven through the LIVE '
    + 'router rather than grepped for, because a check written against source '
    + 'spelling cannot see behaviour reached through a helper. The allowlist is '
    + 'the requirement: the tool proposes, the student disposes, and the one '
    + 'thing that lands a declared action may restate and may never decide',
  nlExtraAppliers.length === 0 && nlAppliers.length === 1
    && nlExports.length > 0 && nlRouterRefused === true
    && nlAfterRouter === nlAfter,
  'appliers found: ' + (nlAppliers.join(', ') || 'none')
    + ' | outside the allowlist: ' + (nlExtraAppliers.join(', ') || 'none')
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

/* 74. THE NO-DAMAGE-WRITER CHECK, and like 72b the ABSENCE is the requirement
   rather than an accident of what has been written so far.

   An action's `dmg` and its `keywords` are the two fields the build code does
   NOT carry. [S04]'s banner states why — nothing writes either, so both are
   reconstructible, so paying characters for them would be paying for a value
   the reader already knows — and [S05]'s DELIBERATELY ABSENT block states the
   same fact from the other end. The day a later phase ships a setActionDmg,
   that stops being true and every shared build silently loses the figure: a
   student sets it, shares the link, and the classmate who opens it reads a
   different action with no error anywhere.

   [S09.11] carries the other half of this tripwire — a driven board round
   tripped, with both fields required to equal their reconstructed values. That
   row only fires if somebody DRIVES the new writer. This one fires the moment
   the writer EXISTS, which is the earlier and cheaper of the two signals, and
   it is why research asked for both rather than either.

   Read off the LIVE export list and driven through the LIVE router, never
   grepped for, which is Phase 3's WR-01 lesson and check 72b's shipped
   precedent: a check written against source spelling cannot see behaviour
   reached through a helper. The detail line names how many exports were walked
   and how many router arms were actually driven, because a walk that found
   nothing at all passes spotlessly and a driver that reached no arm at all
   passes just as spotlessly. */
const dwBefore = JSON.stringify(A.state.get());

// The board this drives has to CARRY actions of both kinds, or an op that
// wrote damage would have had nothing to write it on.
A.ops.resetToDefaults();
const dwOwn = A.ops.createAction('cats', 'Pounce');
A.ops.setActionCost('cats', dwOwn, 0, 'ap', 1);

// Read as DRIFT FROM THE RECONSTRUCTED VALUE rather than as a before-and-after
// string. Several of the arms driven below add and remove actions, so the list
// itself moves — a string comparison would redden on an action that was created
// rather than on a field that was written, which is a check about the wrong
// thing. This is the same invariant [S09.11]'s reconstruction row holds, read
// here against the LIVE board instead of a decoded one.
let dwActionsWalked = 0;
function dwDrift() {
  const build = A.state.get().build;
  const off = [];
  ['cats', 'mechs'].forEach((side) => {
    build[side].actions.forEach((act) => {
      dwActionsWalked++;
      let shipped = null;
      A.data.DEFAULTS[side].actions.forEach((s) => { if (s.id === act.id) { shipped = s; } });
      const wantDmg = (shipped === null) ? 0 : shipped.dmg;
      const wantWords = (shipped === null) ? '' : shipped.keywords.join('+');
      if (act.dmg !== wantDmg || (act.keywords || []).join('+') !== wantWords) {
        off.push(side + '.' + act.id + '=' + act.dmg + ':' + (act.keywords || []).join('+'));
      }
    });
  });
  return off;
}
const dwDriftBefore = dwDrift();

// The live export list, and the names a writer for either field would take.
const dwExports = Object.keys(A.ops).sort();
const dwWriters = dwExports.filter((k) => /dmg|damage|keyword/i.test(k));

// Every export name driven as an ACT, plus the names such a writer would
// plausibly be routed under. An act the router does not know throws
// 'Unknown op: ' — anything else means an arm ran, which is what is counted.
const dwProbes = dwExports.concat([
  'setActionDmg', 'setActionDamage', 'setActionKeywords', 'setActionKeyword',
  'addKeyword', 'removeKeyword', 'dmg', 'damage', 'keywords'
]);
let dwArmsDriven = 0;
const dwPayload = {
  side: 'cats', unitId: 'c1', actionId: dwOwn, tokenId: 'hp', index: 0,
  who: 'caster', name: 'Pounce', value: 3, delta: 1, n: 1, d: 1, dmg: 7,
  damage: 7, keywords: ['ranged'], patch: {}, shape: 'sq', color: 'green',
  glyph: '', scope: 'unit'
};
const dwDriftDuring = [];
dwProbes.forEach((act) => {
  try {
    A.ops.dispatch(act, dwPayload);
    dwArmsDriven++;
  } catch (refused) {
    if (!/^Unknown op: /.test(String(refused.message))) { dwArmsDriven++; }
  }
  // Read after EVERY act rather than once at the end: `reset` is one of the
  // arms, and a field written by an earlier act and then reset away would
  // leave a final reading that is spotlessly clean over a run that had
  // already gone wrong. [S09.10]'s prototype rows make the same argument.
  dwDrift().forEach((seen) => { dwDriftDuring.push(act + ' -> ' + seen); });
});
const dwDriftAfter = dwDrift();
A.state.restore(dwBefore);
A.state.flush();

// Printed on a CLEAN run as well, in the idiom the stub-drift gate uses: the
// check helper shows its detail line only on a failure, and a check asserting
// an ABSENCE is exactly the one whose measured numbers a reader needs to see
// while it is still green. A walk that found nothing passes spotlessly.
console.log('no-writer gate: ' + dwExports.length + ' exported ops walked, '
  + dwArmsDriven + ' dispatch arms driven of ' + dwProbes.length + ' acts tried, '
  + dwActionsWalked + ' action records read');

check(
  '74. THE NO-DAMAGE-WRITER CHECK. [S05] exports no op that writes an action\'s '
    + 'damage or its keyword list, App.ops.dispatch has no arm for one, and '
    + 'driving every export name AND every name such a writer would plausibly '
    + 'take moves neither field on any action of either kind. Read off the LIVE '
    + 'export list and driven through the LIVE router rather than grepped for, '
    + 'because a check written against source spelling cannot see behaviour '
    + 'reached through a helper. The absence is the requirement: neither field '
    + 'is on the wire, so the day one becomes writable and the codec is not '
    + 'told, every shared build loses it silently. [S09.11]\'s reconstruction '
    + 'row is the other half and fires only if somebody drives the writer; this '
    + 'one fires the moment it exists',
  dwWriters.length === 0 && dwExports.length > 0 && dwArmsDriven > 0
    && dwActionsWalked > 0
    && dwDriftBefore.length === 0 && dwDriftDuring.length === 0 && dwDriftAfter.length === 0
    && JSON.stringify(A.state.get()) === dwBefore,
  'writers found: ' + (dwWriters.join(', ') || 'none')
    + ' | exported ops walked: ' + dwExports.length
    + ' | dispatch arms driven: ' + dwArmsDriven + ' of ' + dwProbes.length + ' acts tried'
    + ' | action records read: ' + dwActionsWalked
    + ' | drift from the reconstructed values: '
    + (dwDriftDuring.concat(dwDriftAfter).join(', ') || 'none')
    + ' | state restored: ' + (JSON.stringify(A.state.get()) === dwBefore)
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
A.ops.setActionCost('cats', walkAct, 0, walkTok, 3);
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

/* --- 75-78. THE ADDRESS-BAR MIRROR, DRIVEN AND READ BACK.
       Never grepped for. Phase 3's WR-01 is the reason: a row that searched
       [S04.4] for an assignment would be asserting a spelling, and the mirror
       is reached through a debounce, a scheduler and a token rewrite, none of
       which a source search can see. So every row below drives a real op
       through the real funnel, flushes the mirror the way [S03].flush() lets a
       frame be flushed, and reads location.hash back off the stub.

       The stub's history.replaceState is three lines beside domSandbox above.
       Without it the mirror is inert and every row here would be green about a
       write that never happened, which is why the first row asserts the hash
       MOVED before it asserts anything about what it moved to. --- */
const mirrorSaved = JSON.stringify(A.state.get());

// Key order is not part of the claim: the decoder rebuilds a build field by
// field and the ops build one their own way, so two spellings of the same
// board must compare equal. Same shape and same reason as [S09.11]'s
// stableText, which cannot be reached from here.
function stableJson(value) {
  if (Array.isArray(value)) { return '[' + value.map(stableJson).join(',') + ']'; }
  if (value !== null && typeof value === 'object') {
    return '{' + Object.keys(value).sort()
      .map((k) => JSON.stringify(k) + ':' + stableJson(value[k])).join(',') + '}';
  }
  return JSON.stringify(value);
}
function codeFromHash() {
  return A.serialize.codeInHash();
}

domSandbox.location.hash = '';
const mirrorBlank = domSandbox.location.hash;
const apBeforeMirror = A.state.get().build.cats.ap;
A.ops.setFactionAp('cats', apBeforeMirror === 5 ? 4 : 5);
const mirrorFlushed = A.serialize.flushUrlSync();
const mirrorFirst = domSandbox.location.hash;
const mirrorFirstCode = codeFromHash();
const mirrorFirstBack = mirrorFirstCode === null
  ? { ok: false, why: 'the hash carries no build-code token' }
  : A.serialize.decode(mirrorFirstCode);
check(
  '75. a real op reaches the address bar. Driving setFactionAp through the ops layer '
    + 'schedules one mirror write, and the code sitting in the hash afterwards decodes '
    + 'back to THIS BOARD rather than to any board — which is the reload-and-bookmark '
    + 'half of SHARE-05, and the only half of it a gate with no browser can assert',
  mirrorFlushed === true
    && mirrorFirst !== mirrorBlank
    && mirrorFirstBack.ok === true
    && stableJson(mirrorFirstBack.build) === stableJson(A.state.get().build),
  'flushed=' + mirrorFlushed + ' hash=' + JSON.stringify(mirrorFirst)
    + ' decoded=' + (mirrorFirstBack.ok === true ? 'ok' : String(mirrorFirstBack.why))
    + ' same board=' + (mirrorFirstBack.ok === true
      && stableJson(mirrorFirstBack.build) === stableJson(A.state.get().build))
);

check(
  '75b. and nothing was swallowed getting it there. [S04.4] catches everything inside '
    + 'the scheduled write so a mirror failure can never cost a frame or raise the error '
    + 'panel over an ordinary edit — and it TALLIES what it caught, because a convenience '
    + 'that fails quietly is right and one that fails invisibly is not. This row is the '
    + 'difference between those two',
  A.serialize.syncFailures() === 0,
  'swallowed failures: ' + A.serialize.syncFailures()
);

A.ops.undo();
A.serialize.flushUrlSync();
const mirrorAfterUndo = domSandbox.location.hash;
const mirrorUndoCode = codeFromHash();
const mirrorUndoBack = mirrorUndoCode === null
  ? { ok: false, why: 'the hash carries no build-code token' }
  : A.serialize.decode(mirrorUndoCode);
check(
  '76. an undo moves the address bar back with it. undo() calls the mirror at the same '
    + 'call site commit() does and inside the same try, so the hash tracks the board in '
    + 'both directions — a reload after taking an edit back must not bring the edit back',
  mirrorAfterUndo !== mirrorFirst
    && mirrorUndoBack.ok === true
    && mirrorUndoBack.build.cats.ap === apBeforeMirror
    && stableJson(mirrorUndoBack.build) === stableJson(A.state.get().build),
  'hash moved=' + (mirrorAfterUndo !== mirrorFirst)
    + ' decoded=' + (mirrorUndoBack.ok === true ? 'ok' : String(mirrorUndoBack.why))
    + ' ap back to ' + (mirrorUndoBack.ok === true ? mirrorUndoBack.build.cats.ap : '?')
    + ' (was ' + apBeforeMirror + ')'
);

const mirrorBeforeUi = domSandbox.location.hash;
A.ops.setUi('kbdNav', true);
const uiFlushed = A.serialize.flushUrlSync();
check(
  '77. a ui-only commit moves it NOT AT ALL. commitUi is the one funnel that deliberately '
    + 'does not call the mirror (D-09): keyboard-navigation mode is a view preference and '
    + 'not part of anybody\'s build, so it belongs in neither the undo stack nor a shared '
    + 'code. Nothing was even scheduled, which is a stronger reading than a hash that '
    + 'happened to be rewritten with the same text',
  uiFlushed === false && domSandbox.location.hash === mirrorBeforeUi,
  'a write was scheduled=' + uiFlushed
    + ' hash before=' + JSON.stringify(mirrorBeforeUi)
    + ' hash after=' + JSON.stringify(domSandbox.location.hash)
);
A.ops.setUi('kbdNav', false);

domSandbox.location.hash = '#selftest';
A.ops.setFactionAp('mechs', A.state.get().build.mechs.ap === 5 ? 4 : 5);
A.serialize.flushUrlSync();
const coexistHash = domSandbox.location.hash;
const coexistCode = codeFromHash();
const coexistBack = coexistCode === null
  ? { ok: false, why: 'the hash carries no build-code token' }
  : A.serialize.decode(coexistCode);
check(
  '78. #selftest SURVIVES A STEPPER PRESS. The mirror replaces only its own '
    + 'comma-separated token and carries every other one through untouched, because '
    + 'hasFlag reads the hash as a token list — a mirror that wrote the whole hash would '
    + 'wipe the flag on the student\'s first press and the developer report would vanish '
    + 'mid-demo. Both halves are read live: the flag is still true through the artifact\'s '
    + 'own reader, and the code beside it still decodes to this board',
  A.hasFlag('selftest') === true
    && coexistBack.ok === true
    && stableJson(coexistBack.build) === stableJson(A.state.get().build),
  'hash=' + JSON.stringify(coexistHash)
    + ' hasFlag(selftest)=' + A.hasFlag('selftest')
    + ' decoded=' + (coexistBack.ok === true ? 'ok' : String(coexistBack.why))
);

A.state.restore(mirrorSaved);
A.state.flush();
domSandbox.location.hash = '';
A.serialize.flushUrlSync();
clearPanel();

/* --- 79-82. A SECOND STUB PAGE, BOOTED WITH A PREPARED HASH.
       WHY THIS EXISTS AND WHAT IT COSTS, so the next reader does not fold it
       back into the load above. The gate loads the artifact ONCE, into a
       sandbox whose hash is empty, and [S10] LAUNCH calls boot.start() during
       that load — so the boot-time hash read has already happened before the
       first check in this file runs, and there is no way to re-drive it on a
       page that has already booted. The thing under test is what start() does
       on the way UP.

       So each row below gets its OWN page and its OWN script evaluation.
       makeStubDom() is a function rather than a singleton, which is what makes
       that possible. The cost is one more parse and evaluation of the whole
       artifact per boot, measured and printed below so it stays visible.

       Every reading is taken off the RENDERED page rather than off state,
       because the claim is that a link opens on the classmate's board — which
       is the whole path, from the hash through decode through the rebuild
       through the boot writer to the first paint, and a reading off state
       would see all of it except the last step. --- */

// A distinctive board to carry on the link: an action-point pool nobody
// ships, one cat at eight health, and a fourth mech. Each of the three is
// visible on the page as a different kind of change. EIGHT rather than a
// larger figure on purpose: past COMPACT_AT the row draws a count and one
// token instead of one token per point, so a bigger number would be read
// through a different render path than the one a workshop board takes.
const linkSaved = JSON.stringify(A.state.get());
A.ops.resetToDefaults();
A.ops.setFactionAp('cats', 7);
A.ops.setUnitMaxHp('cats', 'c1', 8);
A.ops.addUnit('mechs');
const linkCode = A.serialize.encode(A.state.get().build);
const linkCats = A.state.get().build.cats.units.length;
const linkMechs = A.state.get().build.mechs.units.length;
A.state.restore(linkSaved);
A.state.flush();
domSandbox.location.hash = '';

function bootWithHash(hashText, label) {
  const page = makeStubDom();
  const box = {
    console: console,
    ResizeObserver: StubResizeObserver,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    queueMicrotask: queueMicrotask,
    requestAnimationFrame: (fn) => setTimeout(fn, 0),
    document: page.document,
    window: page.window,
    location: { hash: hashText },
    history: { replaceState: (d, t, fragment) => { box.location.hash = String(fragment); } },
    CSS: page.CSS
  };
  vm.runInNewContext(match[1], box, { filename: 'cats-vs-mechs.html (' + label + ')' });
  box.App.state.flush();
  return { box: box, page: page, App: box.App };
}
function cardsIn(booted, side) {
  return booted.page.byId['col-' + side].querySelectorAll('.unit-card').length;
}
function healthRowOf(booted, unitId) {
  const row = booted.page.document
    .querySelector('.tok-row[data-amt="hp"][data-unit="' + unitId + '"]');
  return row === null ? -1 : row.children.length;
}

const bootClock = Date.now();
const fromLink = bootWithHash('#b=' + linkCode, 'boot from a link');
const bootCostMs = Date.now() - bootClock;
console.log('second stub page: the artifact parsed, evaluated and booted from a prepared '
  + 'hash in ' + bootCostMs + ' ms');

check(
  '79. A LINK CARRYING A BUILD CODE OPENS ON THAT BOARD. A second page is booted with the '
    + 'code already in its hash, and the rendered board is the one the code describes — '
    + 'the health row under c1 is eight tokens long and the mech column carries a fourth '
    + 'card. Read off the PAGE and not off state, because a reading off state would see '
    + 'every step of this except the one that matters, which is that the first paint drew '
    + 'the loaded board rather than the shipped one',
  healthRowOf(fromLink, 'c1') === 8
    && cardsIn(fromLink, 'cats') === linkCats
    && cardsIn(fromLink, 'mechs') === linkMechs
    && fromLink.App.state.get().build.cats.ap === 7
    && fromLink.page.byId['err-panel'].hidden === true,
  'c1 health row=' + healthRowOf(fromLink, 'c1') + ' (want 8)'
    + ' cats cards=' + cardsIn(fromLink, 'cats') + '/' + linkCats
    + ' mechs cards=' + cardsIn(fromLink, 'mechs') + '/' + linkMechs
    + ' cats ap=' + fromLink.App.state.get().build.cats.ap
    + ' error panel hidden=' + fromLink.page.byId['err-panel'].hidden
);

check(
  '80. AND THE UNDO STACK AT THAT MOMENT IS EMPTY. This is D-20 asserted rather than '
    + 'asserted ABOUT: a board arriving on a link is the starting state, so there is '
    + 'nothing to undo back to, and the stack holds the student\'s own edits and nothing '
    + 'else. Ctrl+Z on a freshly-opened link therefore does nothing, which is also read '
    + 'here — undo() returns false at the bottom of the stack rather than throwing',
  fromLink.App.state.undoDepth() === 0
    && fromLink.App.ops.undo() === false
    && fromLink.App.state.undoDepth() === 0,
  'undo depth after boot=' + fromLink.App.state.undoDepth()
);

const damagedCode = linkCode.slice(0, linkCode.length - 1)
  + (linkCode.charAt(linkCode.length - 1) === 'z' ? 'y' : 'z');
const fromBadLink = bootWithHash('#b=' + damagedCode, 'boot from a damaged link');
const badPanelMessage = fromBadLink.page.byId['err-message'].textContent;
const badPanelTitle = fromBadLink.page.byId['err-title'].textContent;
check(
  '81. A LINK CARRYING A DAMAGED CODE OPENS ON THE SHIPPED BOARD, SAYS WHAT WAS WRONG, '
    + 'AND STAYS USABLE. The failure is NON-TERMINAL on purpose: a terminal one hides '
    + 'Dismiss and tells the student to reload, which for a bad link means reloading the '
    + 'same bad link. So Dismiss is offered, the panel names the diagnosis the codec '
    + 'handed back rather than a stack trace, and the shipped nine-and-three board is on '
    + 'screen behind it',
  fromBadLink.page.byId['err-panel'].hidden === false
    && fromBadLink.page.byId['err-dismiss'].hidden === false
    && badPanelTitle === 'Build code in the link'
    && badPanelMessage.indexOf('did not arrive intact') !== -1
    && cardsIn(fromBadLink, 'cats') === 9
    && cardsIn(fromBadLink, 'mechs') === 3
    && fromBadLink.App.state.undoDepth() === 0,
  'panel hidden=' + fromBadLink.page.byId['err-panel'].hidden
    + ' dismiss hidden=' + fromBadLink.page.byId['err-dismiss'].hidden
    + ' title=' + JSON.stringify(badPanelTitle)
    + ' message=' + JSON.stringify(badPanelMessage)
    + ' cards=' + cardsIn(fromBadLink, 'cats') + '/' + cardsIn(fromBadLink, 'mechs')
    + ' undo depth=' + fromBadLink.App.state.undoDepth()
);

const fromBoth = bootWithHash('#selftest,b=' + linkCode, 'boot from a link beside the flag');
check(
  '82. A LINK CARRYING BOTH DOES BOTH. #selftest and a build code are two tokens in one '
    + 'comma-separated hash, and neither breaks the other: the board is the classmate\'s '
    + 'and the developer report still opens, read back through the artifact\'s own '
    + 'hasFlag rather than by looking at the string. This is the coexistence check 78 '
    + 'holds for the WRITE half, held here for the READ half',
  fromBoth.App.hasFlag('selftest') === true
    && healthRowOf(fromBoth, 'c1') === 8
    && cardsIn(fromBoth, 'mechs') === linkMechs
    && fromBoth.App.state.undoDepth() === 0,
  'hasFlag(selftest)=' + fromBoth.App.hasFlag('selftest')
    + ' c1 health row=' + healthRowOf(fromBoth, 'c1')
    + ' mechs cards=' + cardsIn(fromBoth, 'mechs')
    + ' undo depth=' + fromBoth.App.state.undoDepth()
);

check(
  '82b. AND THE BOOT WRITER CANNOT RUN TWICE, asserted on the one page in this repo that '
    + 'has legitimately run it once. Calling it again on the booted page throws by its '
    + 'own guard, and the board does not move — so a later plan wiring a second caller '
    + 'gets a red run rather than a second board with nothing on the stack behind it',
  (() => {
    const wasText = JSON.stringify(fromLink.App.state.get());
    let outcome = 'it ran a second time';
    try { fromLink.App.ops.loadBuildCodeAtBoot(linkCode); } catch (refused) {
      outcome = String(refused.message).indexOf('commitInitial(') === 0
        ? 'refused by its own single-use guard'
        : 'threw for another reason: ' + refused.message;
    }
    return outcome === 'refused by its own single-use guard'
      && JSON.stringify(fromLink.App.state.get()) === wasText
      && fromLink.App.state.undoDepth() === 0;
  })(),
  'a second boot-load on the booted page was refused and the board did not move'
);

clearPanel();

/* --- 83 to 89. PLAN 04-05's SHARE SURFACE, and the one thing it must never do.
       Every row below is driven through the REAL repaint on the REAL stub page,
       never by planting a value, because the whole claim being made is about
       what the surface does on a frame nobody asked it for.

       The surface is opened with showModal() rather than through an opener,
       because the opener is page work claimed by [S07.4], which is plan 04-06's
       and does not exist yet. That is the same reason both DIALOG_ROOTS entries
       carry act: null, and it is why every helper below asks for a frame by
       hand: flush() runs a PENDING frame and does nothing when none is due. --- */
const shareDlg = dom.byId['share'];
const shareCodeField = dom.byId['share-code'];
const shareLenLine = dom.byId['share-length'];
const shareOverLine = dom.byId['share-over'];
const sharePasteField = dom.byId['sh-load-field'];

function shareFrame() {
  A.state.invalidate();
  A.state.flush();
}
function openShareSurface() {
  if (shareDlg.open !== true) { shareDlg.showModal(); }
  shareFrame();
}
function closeShareSurface() {
  if (shareDlg.open === true) { shareDlg.close(); }
  shareFrame();
}
function liveCode() { return A.serialize.encode(A.state.get().build); }

openShareSurface();
const shareOwnText = harvestInto(shareDlg, [], '#share');
const shareOwnHits = verdictHitsIn(shareOwnText);
check(
  '83. the share surface is REACHED by the rendered-page walk and its per-frame '
    + 'hook actually ran. A dialog that was never painted harvests nothing and '
    + 'reports a spotlessly clean scan forever, which is check 47c\'s failure one '
    + 'surface down. The floor is small because almost everything on this surface '
    + 'is static markup Layer A reads in the document instead — see SHARE_FLOOR',
  shareOwnHits.length === 0 && shareOwnText.length > SHARE_FLOOR,
  'harvested ' + shareOwnText.length + ' rendered strings from #share (floor '
    + SHARE_FLOOR + ')'
    + (shareOwnHits.length === 0 ? '' : ' | ' + shareOwnHits.join(' | '))
);

/* 84. THE CODE ON THE FIELD IS THE CODE FOR THE BOARD THAT IS ON SCREEN, read
   after a real op rather than at open. Reading it at open would prove only that
   something was written once; the claim this surface lives or dies by is that
   it is written AGAIN, on the frame anything moves, while a student is looking
   at it. */
A.ops.nudgeFactionAp('cats', 1);
shareFrame();
const afterOpCode = shareCodeField.value;
const afterOpRead = A.serialize.decode(afterOpCode);
check(
  '84. with the surface open, a REAL op moves the board and the code on the '
    + 'field is re-produced for the board that is now on screen — decode accepts '
    + 'it, and what it decodes to re-encodes to the same string, so the trip is '
    + 'closed rather than half-asserted',
  afterOpRead.ok === true
    && afterOpCode === liveCode()
    && A.serialize.encode(afterOpRead.build) === liveCode(),
  'decode ok=' + afterOpRead.ok + ' why=' + JSON.stringify(afterOpRead.why || null)
    + ' field===live encode=' + (afterOpCode === liveCode())
    + ' round trip=' + (afterOpRead.ok === true
      && A.serialize.encode(afterOpRead.build) === liveCode())
);

/* 85. THE READOUT IS THE LENGTH AND NOTHING ELSE, over three different boards
   so a readout that had frozen on the first would be caught. The sentence is
   asserted whole rather than by parsing a number out of it, because the words
   beside the figure are the half that must never become an adjective. */
const lengthPairs = [];
[
  () => {},
  // A NAME, not a number, and not another unit. An identical unit added to a
  // side run-lengths into the run beside it and the code does not grow, which
  // is the codec working exactly as designed — and it is why the first draft of
  // this row read the same length twice and asserted nothing.
  () => { A.ops.renameTokenType('hp', 'Stamina and grit'); },
  () => { A.ops.setUnitMaxHp('cats', 'c1', 17); A.ops.setUnitShield('cats', 'c2', 9); }
].forEach((drive) => {
  drive();
  shareFrame();
  lengthPairs.push([shareCodeField.value.length, shareLenLine.textContent]);
});
check(
  '85. the readout beside the code is a COUNT OF CHARACTERS and it is the count '
    + 'of the string on the field, over three different boards. It carries no '
    + 'adjective: the sentence is asserted whole, because "295 characters" is '
    + 'bookkeeping and any word of appraisal beside it would be a ruling on a '
    + 'student\'s build (PROJ-06)',
  lengthPairs.every(([n, said]) => said === n + ' characters')
    && new Set(lengthPairs.map(([n]) => n)).size >= 2,
  'pairs=' + JSON.stringify(lengthPairs)
);

/* 86 and 87. THE TWO OPPOSITE ANSWERS TO D-19, ON ONE SURFACE, and they are two
   rows rather than one because they are two different claims and a single row
   asserting both would go green on either being right.

   The paste field holds text a STUDENT typed, so a repaint that overwrote it
   would lose half a pasted code. The code field holds text the ARTIFACT
   produced, and there the same rule would leave a student copying a code for a
   board that no longer exists — which is the worst thing this surface can do,
   because nobody finds out until a classmate loads it. */
sharePasteField.value = 'v1~half-a-pasted-code';
sharePasteField.focus();
A.ops.nudgeFactionAp('mechs', 1);
shareFrame();
check(
  '86. a repaint driven while the PASTE field holds focus leaves that field\'s '
    + 'value untouched (D-19). It is the rule #tok-pick-name, #act-edit-name and '
    + 'every term row keep, and it is kept here for the original reason: this is '
    + 'text a student typed',
  sharePasteField.value === 'v1~half-a-pasted-code'
    && stub.activeElement === sharePasteField,
  'paste field=' + JSON.stringify(sharePasteField.value)
    + ' still focused=' + (stub.activeElement === sharePasteField)
);
sharePasteField.blur();

shareCodeField.focus();
shareCodeField.select();
const selectedWas = shareCodeField.value;
A.ops.nudgeFactionAp('mechs', 1);
shareFrame();
check(
  '87. a repaint driven while the CODE field holds focus REWRITES it and leaves '
    + 'a selection over the whole of the new code — the opposite answer, on the '
    + 'one field in this file whose text the artifact produced rather than the '
    + 'student. A stale code reaching a clipboard is discovered by somebody else, '
    + 'an hour later, with no way back to what was meant',
  shareCodeField.value !== selectedWas
    && shareCodeField.value === liveCode()
    && shareCodeField.selectionStart === 0
    && shareCodeField.selectionEnd === shareCodeField.value.length,
  'rewritten=' + (shareCodeField.value !== selectedWas)
    + ' matches live encode=' + (shareCodeField.value === liveCode())
    + ' selection=' + shareCodeField.selectionStart + '..'
    + shareCodeField.selectionEnd + ' of ' + shareCodeField.value.length
);
shareCodeField.blur();

/* 89. THE FINGERPRINT COVERS THE WHOLE BUILD SLICE, asserted through a change no
   narrower fingerprint would see.

   THIS ROW EXISTS BECAUSE OF PROBE S AND WHAT THE PROBE ACTUALLY MEASURED IS
   WRITTEN DOWN HERE, INCLUDING THE PART THAT WENT AGAINST THE EXPECTATION.
   Plan 04-05 narrowed [S06.6]'s fingerprint to the unit health values and drove
   a token-type rename with the surface open. THREE rows objected, not one: 84,
   87 and this one. So the surface is not resting on a single tripwire, which is
   the better outcome and is recorded rather than quietly enjoyed.

   WHAT IS STILL ONLY TRUE OF THIS ROW: 84 and 87 caught that narrowing by
   accident of which op they happen to drive — both nudge a faction's action
   points, which a health-only fingerprint also misses. Rewrite either of them to
   nudge a unit's health instead and both go green under the same probe, because
   neither is ABOUT the fingerprint. This one is. A rename is chosen because it
   changes the code — a type's name travels in the codec's name table — while
   touching no number the board draws through a stepper, so no narrowing that
   keeps the rest of this gate green can also pass it.

   The board is put back afterwards. */
openShareSurface();
const sigWas = A.state.get().build.tokens.hp.name;
A.ops.renameTokenType('hp', 'Stamina');
shareFrame();
const afterRename = shareCodeField.value;
const afterRenameLive = liveCode();
A.ops.renameTokenType('hp', sigWas);
shareFrame();
check(
  '89. the code on the field is re-produced for a change that moves NO NUMBER on '
    + 'the board — renaming a token type with the surface open. The fingerprint '
    + 'is the whole build slice and nothing narrower, and this is the row that '
    + 'says so: a fingerprint cut back to the health values passes every other '
    + 'share row in this file and ships a stale code from this one',
  afterRename === afterRenameLive
    && shareCodeField.value === liveCode()
    && A.state.get().build.tokens.hp.name === sigWas,
  'after rename: field===live encode=' + (afterRename === afterRenameLive)
    + ' | after putting it back: field===live encode='
    + (shareCodeField.value === liveCode())
    + ' name restored=' + JSON.stringify(A.state.get().build.tokens.hp.name)
);

/* 88. D-18's LINE, DRIVEN OVER THE THRESHOLD RATHER THAN ASSERTED ABOUT IT, and
   it is the last row in this gate because taking a board past CODE_WARN means
   BUILDING one and there is nothing after it that reads the board.

   WHERE THE CHARACTERS ACTUALLY ARE decided the recipe. [S01]'s measured
   decomposition records that the tally stream is 1,360 of the 3,186 at the
   ceiling, so the lever is DISTINCT tallies on distinct units — an identical
   tally on every unit run-lengths into one run and costs almost nothing, which
   is the codec working as designed and was how the first draft of this row
   reached 545 characters and thought it had built a large board.

   Put back with resetToDefaults, deliberately, and NOT with App.state.restore:
   [S03]'s banner names restore's one legitimate caller and it is [S09] SELFTEST.
   A gate reaching for it would make that inventory false. */
// The shipped board, first, so this row starts from a known place: every gate
// row above it has been authoring types and actions, and MAX_CUSTOM_TYPES is a
// cap a drive that ignored what came before would hit rather than measure.
A.ops.resetToDefaults();
shareFrame();
const overWasHidden = shareOverLine.hidden;
const overWasSaid = shareOverLine.textContent;
const overWasLen = shareCodeField.value.length;
const unitIdsOf = (side) => A.state.get().build[side].units.map((u) => u.id);
['cats', 'mechs'].forEach((side) => {
  while (A.state.get().build[side].units.length < A.ops.MAX_UNITS) { A.ops.addUnit(side); }
});
['cats', 'mechs'].forEach((side) => {
  unitIdsOf(side).forEach((id, i) => {
    A.ops.setUnitMaxHp(side, id, 11 + (i * 37) % 88);
    A.ops.setUnitShield(side, id, 11 + (i * 53) % 88);
  });
});
const overTypes = [];
for (let m = 0; m < A.data.MAX_CUSTOM_TYPES; m++) {
  overTypes.push(A.ops.createTokenType({
    name: 'Padding type ' + m,
    shape: A.data.SHAPES[m % A.data.SHAPES.length],
    color: A.data.COLORS[m % A.data.COLORS.length],
    glyph: A.data.GLYPHS[1 + m],
    scope: 'unit'
  }));
}
['cats', 'mechs'].forEach((side) => {
  unitIdsOf(side).forEach((id, j) => {
    overTypes.forEach((tok, k) => {
      A.ops.setTally(side, id, tok, 11 + ((j * 13 + k * 29) % 88));
    });
  });
});
shareFrame();
const overShown = {
  hidden: shareOverLine.hidden,
  said: shareOverLine.textContent,
  len: shareCodeField.value.length,
  saidLen: shareLenLine.textContent
};
A.ops.resetToDefaults();
shareFrame();
check(
  '88. the over-budget line is HIDDEN below App.data.CODE_WARN and SHOWN above '
    + 'it, driven over the threshold on a real board rather than asserted about. '
    + 'It describes the CODE and says nothing about the board that produced it '
    + '(D-18), which is what keeps a size fact from becoming a ruling on a build '
    + '— and the count beside it stays a plain count on both sides of the line',
  overWasHidden === true && overWasSaid === ''
    && overWasLen <= A.data.CODE_WARN
    && overShown.len > A.data.CODE_WARN
    && overShown.hidden === false
    && overShown.said === 'This code is longer than a message allows.'
    && overShown.saidLen === overShown.len + ' characters'
    && shareOverLine.hidden === true && shareOverLine.textContent === ''
    && shareCodeField.value === liveCode(),
  'below (' + overWasLen + ' chars): hidden=' + overWasHidden + ' said=' + JSON.stringify(overWasSaid)
    + ' | above (' + overShown.len + ' chars, warn at ' + A.data.CODE_WARN
    + '): hidden=' + overShown.hidden + ' said=' + JSON.stringify(overShown.said)
    + ' length line=' + JSON.stringify(overShown.saidLen)
    + ' | back below: hidden=' + shareOverLine.hidden
    + ' len=' + shareCodeField.value.length
);

closeShareSurface();
clearPanel();

/* --- 90 to 90f. PLAN 04-06's HANDLERS, AND THE ONE CLIPBOARD TIER THIS GATE
       CAN ACTUALLY REACH.

       Everything below goes through a REAL control — the topbar button, the
       pane switches, Copy, Done, Cancel — because that is the difference
       between these rows and 83 to 89's: those assert what the surface PAINTS,
       and these assert that a student pressing something reaches it.

       The one thing worth saying before the rows: there is no `navigator` in
       this sandbox and no `document.execCommand` on the stub page, so a Copy
       press here lands on tier 3 by construction. That is not a gap being
       worked around — it is the reason row 90e exists and can assert anything
       at all. Tier 3 is the tier SHARE-01's first criterion names in as many
       words ("a selectable field appears with the code already highlighted"),
       and a bare sandbox is the only place in this repo it can be driven. What
       that leaves unreachable is written into the limitations list below as its
       own numbered entry rather than left for a reader to notice. --- */

const shareOpener = stub.querySelector('[data-act="openShare"]');
const resetOpener = stub.querySelector('[data-act="openResetAsk"]');
const resetDlg = dom.byId['reset-ask'];
const shareSaidLine = dom.byId['share-said'];
const shareCopyBtn = dom.byId['share-copy'];
const shareToLoad = dom.byId['share-to-load'];
const shareBackBtn = dom.byId['sh-load-back'];
const shareDoneBtn = dom.byId['share-done'];
const resetCancelBtn = dom.byId['reset-ask-cancel'];
const sharePaneCopy = dom.byId['share-pane-copy'];
const sharePaneLoad = dom.byId['sh-load'];

function shPress(node) { press(node); release(node); A.state.flush(); }

/* 90. BOTH OPENERS REACH A REGISTERED HANDLER. An act sitting in UI_ACTS with
   nothing registered against it is the file's documented "claimed and ignored"
   window, which is honest between two plans and is a dead button if a plan
   ships in it — and that is exactly the window these two controls sat in for
   the whole of plan 04-05. So this reads the LIVE registration rather than the
   claim, and it drives the control rather than calling showModal(). */
shPress(shareOpener);
const shOpened = shareDlg.open;
const shColdPane = shareDlg.dataset.shPane;
shPress(resetOpener);
const rsOpened = resetDlg.open;
check(
  '90. both topbar controls reach a handler the LIVE registration holds rather '
    + 'than one merely claimed, and the share surface opens COLD on the copy '
    + 'pane. A claimed act with no handler is the file\'s documented '
    + '"claimed and ignored" window — honest between two plans, a dead button '
    + 'if a plan ships in it, and the window both of these sat in for the whole '
    + 'of plan 04-05',
  shareOpener !== null && resetOpener !== null
    && shOpened === true && rsOpened === true && shColdPane === 'copy'
    && ['openShare', 'openResetAsk'].every((a) =>
      A.interactions.UI_ACTS.indexOf(a) !== -1
      && A.interactions.UI_HANDLED.indexOf(a) !== -1)
    && errPanel.hidden === true,
  'share opened=' + shOpened + ' cold pane=' + JSON.stringify(shColdPane)
    + ' reset opened=' + rsOpened
    + ' claimed=' + JSON.stringify(['openShare', 'openResetAsk']
      .filter((a) => A.interactions.UI_ACTS.indexOf(a) !== -1))
    + ' handled=' + JSON.stringify(['openShare', 'openResetAsk']
      .filter((a) => A.interactions.UI_HANDLED.indexOf(a) !== -1))
);

/* 90b. THE ACT PARTITION, COLLECTED OFF THE PAGE, in 68d's shape and for its
   reason — with one difference from 68d that is a fact about this surface and
   is stated rather than smoothed over.

   68d walks the action editor and finds acts INSIDE it, because that dialog's
   own controls carry data-act. BOTH of plan 04-05's dialogs carry ZERO acts
   inside them, deliberately: every control in there carries a private data-sh
   or data-rs, which is #act-prop-open's shipped idiom, and 04-05's summary
   records the two reasons. So "acts collected off the dialog" is legitimately
   zero here and a row demanding it be non-zero would be demanding the surface
   be built differently. What IS counted off each dialog is the private
   controls, and both of those counts are floored.

   The half that catches the failure this row exists for is asserted directly
   and in the general form rather than by name: NO act in the live UI_ACTS may
   be a function [S05] exports. That is what "a state op quietly moved into
   UI_ACTS to make a refusal go away" IS, and stating it generally catches the
   move for any op rather than for the two this phase happens to know about.
   Those two are then also named, because they are the two plan 04-07 will add
   and the whole point is that they are not here yet. */
function actsUnder(root) {
  const found = [];
  (function walk(n) {
    if (n.dataset && typeof n.dataset.act === 'string' && n.dataset.act !== ''
      && found.indexOf(n.dataset.act) === -1) {
      found.push(n.dataset.act);
    }
    n.children.forEach(walk);
  })(root);
  return found;
}
function privateUnder(root, key) {
  const found = [];
  (function walk(n) {
    if (n.dataset && typeof n.dataset[key] === 'string' && n.dataset[key] !== ''
      && found.indexOf(n.dataset[key]) === -1) {
      found.push(n.dataset[key]);
    }
    n.children.forEach(walk);
  })(root);
  return found;
}
const shInsideActs = actsUnder(shareDlg);
const rsInsideActs = actsUnder(resetDlg);
const shPrivate = privateUnder(shareDlg, 'sh');
const rsPrivate = privateUnder(resetDlg, 'rs');
const shOpenerActs = [shareOpener.dataset.act, resetOpener.dataset.act];
const shAllActs = shInsideActs.concat(rsInsideActs, shOpenerActs);
const shUiOnly = shAllActs.filter((a) => A.interactions.UI_ACTS.indexOf(a) !== -1);
const shUnhandled = shUiOnly.filter((a) => A.interactions.UI_HANDLED.indexOf(a) === -1);
const shStateActs = shAllActs.filter((a) => A.interactions.UI_ACTS.indexOf(a) === -1);
const shNotOps = shStateActs.filter((a) => typeof A.ops[a] !== 'function');
const uiActsThatAreOps = A.interactions.UI_ACTS.filter((a) => typeof A.ops[a] === 'function');
const laterOps = ['loadBuildCode', 'resetToDefaults'];
const laterOpsParked = laterOps.filter((a) => A.interactions.UI_ACTS.indexOf(a) !== -1);
const laterOpsMissing = laterOps.filter((a) => typeof A.ops[a] !== 'function');
check(
  '90b. every act these two surfaces dispatch is a UI-only act the LIVE '
    + 'registration handles, and NO act in UI_ACTS is a function [S05] exports '
    + '— collected off the page rather than re-typed here. The second half is '
    + 'the one that matters: parking a state op in UI_ACTS is how a refusal is '
    + 'made to go away, and the two ops plan 04-07 will wire are named as still '
    + 'being ops and still not being here. Both dialogs carry ZERO acts inside '
    + 'them on purpose (04-05 gave every control in them a private data-sh or '
    + 'data-rs), so it is those private controls that are floored',
  shPrivate.length >= 5 && rsPrivate.length >= 2
    && shUiOnly.length >= 2 && shUnhandled.length === 0 && shNotOps.length === 0
    && uiActsThatAreOps.length === 0
    && laterOpsParked.length === 0 && laterOpsMissing.length === 0,
  'acts inside #share=' + JSON.stringify(shInsideActs)
    + ' inside #reset-ask=' + JSON.stringify(rsInsideActs)
    + ' | private controls #share=' + JSON.stringify(shPrivate)
    + ' #reset-ask=' + JSON.stringify(rsPrivate)
    + ' | UI-only=' + JSON.stringify(shUiOnly)
    + ' claimed but unhandled=' + JSON.stringify(shUnhandled)
    + ' state acts [S05] does not export=' + JSON.stringify(shNotOps)
    + ' | UI_ACTS entries that ARE ops=' + JSON.stringify(uiActsThatAreOps)
    + ' | 04-07\'s ops parked in UI_ACTS=' + JSON.stringify(laterOpsParked)
    + ' missing from [S05]=' + JSON.stringify(laterOpsMissing)
);

/* 90c. EVERY LISTENER ON BOTH NEW ROOTS WENT THROUGH THE ERROR BOUNDARY, in
   68c's shape and for its reason: App.boot.wrap returns an ANONYMOUS zero-arity
   function, and every handler in [S07.4] is a named function declared with its
   own parameter, so a raw binding is visible by name AND by arity. TWO roots
   and TWO floors, because a root carrying no listeners at all passes a
   per-listener test spotlessly and one floor covering both would be satisfied
   by either one of them alone. */
function rawOn(root) {
  const raw = [];
  Object.keys(root._listeners).forEach((type) => {
    root._listeners[type].forEach((fn) => {
      if (typeof fn !== 'function' || fn.name !== '' || fn.length !== 0) {
        raw.push(type + ' -> ' + (typeof fn === 'function'
          ? (fn.name || '(anonymous)') + '/' + fn.length : typeof fn));
      }
    });
  });
  return raw;
}
function countOn(root) {
  return Object.keys(root._listeners)
    .reduce((n, type) => n + root._listeners[type].length, 0);
}
const shRaw = rawOn(shareDlg);
const rsRaw = rawOn(resetDlg);
const shCount = countOn(shareDlg);
const rsCount = countOn(resetDlg);
check(
  '90c. every listener bound on BOTH of plan 04-05\'s roots went through '
    + 'App.boot.wrap. One bound raw would throw past the boundary and leave the '
    + 'surface dead with nothing on screen to say so — and on the share surface '
    + 'that means a student pressing Copy, seeing nothing happen, and pasting '
    + 'whatever was on their clipboard already. Two roots and two floors, '
    + 'because a root carrying no listeners passes a per-listener test '
    + 'spotlessly',
  shCount >= 6 && rsCount >= 4 && shRaw.length === 0 && rsRaw.length === 0,
  'listeners on #share=' + shCount + ' (floor 6) on #reset-ask=' + rsCount
    + ' (floor 4) | bound outside the boundary: #share='
    + (shRaw.join(', ') || 'none') + ' #reset-ask=' + (rsRaw.join(', ') || 'none')
);

/* 90d. THE PANES MOVE BOTH WAYS AND THE VISIT ENDS WITH FOCUS BACK ON THE
   CONTROL THAT STARTED IT. <dialog> restores only the element that HELD focus
   when the modal opened, which a student who reached the button with a pointer
   never did — the same keyboard failure 68e asserts one surface down, and it is
   asserted separately per surface because the two hand-backs name two different
   constant selectors. */
shPress(shareToLoad);
const paneAfterToLoad = [shareDlg.dataset.shPane, sharePaneCopy.hidden, sharePaneLoad.hidden];
shPress(shareBackBtn);
const paneAfterBack = [shareDlg.dataset.shPane, sharePaneCopy.hidden, sharePaneLoad.hidden];
shPress(shareDoneBtn);
const shClosedOn = [shareDlg.open, stub.activeElement === shareOpener];
shPress(resetCancelBtn);
const rsClosedOn = [resetDlg.open, stub.activeElement === resetOpener];
check(
  '90d. the pane switch moves the surface both ways and hides the pane it is '
    + 'not showing, Done ends the visit, Cancel declines the reset, and each '
    + 'close hands focus back to the topbar control that opened it. A modal '
    + 'that drops focus onto <body> is the keyboard failure 68e asserts one '
    + 'surface down; the hand-back is asserted per surface because the two name '
    + 'two different constant selectors',
  JSON.stringify(paneAfterToLoad) === JSON.stringify(['load', true, false])
    && JSON.stringify(paneAfterBack) === JSON.stringify(['copy', false, true])
    && JSON.stringify(shClosedOn) === JSON.stringify([false, true])
    && JSON.stringify(rsClosedOn) === JSON.stringify([false, true])
    && errPanel.hidden === true,
  'after "paste a build code"=' + JSON.stringify(paneAfterToLoad)
    + ' after back=' + JSON.stringify(paneAfterBack)
    + ' | share [open, focus back]=' + JSON.stringify(shClosedOn)
    + ' reset [open, focus back]=' + JSON.stringify(rsClosedOn)
);

/* 90e. THE ONE CLIPBOARD TIER THIS GATE CAN REACH, DRIVEN RATHER THAN DESCRIBED
   — and the only row in this project that will ever assert anything about the
   copy at all, which is why it asserts the branch and not merely the press.

   There is no `navigator` in this sandbox and no `document.execCommand` on the
   stub page, so this press lands on tier 3 by construction. Three things are
   read back and all three are the point: the press did not throw; the code
   field is FOCUSED and selected over the whole of the code, because SHARE-01
   asks for the selection to be a real surface rather than something that
   appears on failure; and the line on screen is the select-all one and NOT a
   "Copied".

   That last assertion is the whole row. CLAUDE.md names an optimistic "Copied"
   as a specific anti-pattern, because a silent clipboard failure sends a
   student to the course thread with stale text and they debug this tool instead
   of their build. A row that drove the press and read only "something was said"
   would go green over exactly that. The tier the artifact believes it took is
   read off data-sh-tier as well, so the two halves — what was DONE and what was
   SAID — are asserted against each other rather than one standing for both. */
clearPanel();
shPress(shareOpener);
A.ops.nudgeFactionAp('mechs', 1);
A.state.flush();
const beforeCopyLive = liveCode();
let copyThrew = null;
try { shPress(shareCopyBtn); } catch (err) { copyThrew = String(err && err.message); }
const copySaid = shareSaidLine.textContent;
const copyTier = shareSaidLine.dataset.shTier;
const copySelection = [shareCodeField.selectionStart, shareCodeField.selectionEnd];
check(
  '90e. a real Copy press in a sandbox with NO clipboard API and NO copy '
    + 'command does not throw, leaves the code field focused with the whole of '
    + 'the code selected, and says the select-all line rather than a "Copied". '
    + 'The line naming the tier that actually fired is the whole of this row: '
    + 'an optimistic one sends a student to the course thread with stale text '
    + 'on their clipboard, and tier 3 is the only tier this repo can ever drive',
  copyThrew === null
    && errPanel.hidden === true
    && shareSaidLine.hidden === false
    && copySaid === 'Select-all is done — press Ctrl+C.'
    && copySaid.indexOf('Copied') === -1
    && copyTier === 'select'
    && stub.activeElement === shareCodeField
    && copySelection[0] === 0
    && copySelection[1] === shareCodeField.value.length
    && shareCodeField.value.length > 0,
  'threw=' + JSON.stringify(copyThrew) + ' panel hidden=' + errPanel.hidden
    + ' | said=' + JSON.stringify(copySaid) + ' tier=' + JSON.stringify(copyTier)
    + ' hidden=' + shareSaidLine.hidden
    + ' | focused=' + (stub.activeElement === shareCodeField)
    + ' selection=' + copySelection[0] + '..' + copySelection[1]
    + ' of ' + shareCodeField.value.length
);

/* 90f. AND THE CODE THAT PRESS PRODUCED IS THE LIVE ONE. Check 84 closes this
   loop from the REPAINT side — a frame lands and the field is current. This
   closes it from the PRESS side, which is a different claim: the press asks
   [S06.6] for the code synchronously inside the gesture, before anything
   asynchronous can happen, and a press that read something produced at open
   would pass 84 and ship a stale code anyway. The op above ran with the surface
   already open, so the field the press read had to have been re-produced. */
const copiedCode = shareCodeField.value;
const copiedRead = A.serialize.decode(copiedCode);
check(
  '90f. the code the press put under the selection is the code for the board '
    + 'that is on screen, driven after a REAL op with the surface already open. '
    + 'It decodes, and what it decodes to re-encodes to the same string — so '
    + 'the trip is closed from the press side as well as from the repaint side',
  copiedCode === beforeCopyLive
    && copiedCode === liveCode()
    && copiedRead.ok === true
    && A.serialize.encode(copiedRead.build) === liveCode()
    // AND THE PRESS IS WHAT PUT IT THERE. Without this clause the row goes
    // green over a Copy button that does nothing at all: the per-frame hook
    // keeps the field current on its own, so "the field holds the live code"
    // is true whether or not anything was pressed. The selection is the only
    // thing on this surface that ONLY the press produces.
    && shareCodeField.selectionStart === 0
    && shareCodeField.selectionEnd === copiedCode.length,
  'field===live encode=' + (copiedCode === liveCode())
    + ' decode ok=' + copiedRead.ok
    + ' why=' + JSON.stringify(copiedRead.why || null)
    + ' round trip=' + (copiedRead.ok === true
      && A.serialize.encode(copiedRead.build) === liveCode())
    + ' length=' + copiedCode.length
    + ' selection=' + shareCodeField.selectionStart + '..'
    + shareCodeField.selectionEnd
);

shPress(shareDoneBtn);
A.ops.nudgeFactionAp('mechs', -1);
A.state.flush();
clearPanel();

/* --- 91 to 91e. PHASE 4'S OWN ACCEPTANCE RUN, END TO END --------------------

   Check 73's register, one phase on: ONE numbered check that drives the whole
   feature through real controls and reads the answer OFF THE PAGE. The four
   rows after it hold the parts of the phase that a single end-to-end pass
   cannot fail on — a refusal's wording, a refusal's silence, a cancel that
   costs nothing, and a confirm that costs exactly one undo entry.

   WHAT IS SETUP AND WHAT IS THE SEQUENCE, said out loud because the distinction
   is the whole value of a row like this. The BOARD is built through ops: check
   73 already drives the authoring surface through its own controls and there is
   nothing for this phase to add to that. The SEQUENCE this row asserts begins
   at the topbar Share control and every step of it after that — Copy, Done, the
   reset opener, Confirm, the pane switch, Load, the undo button — is a control
   a student presses.

   WHY IT READS THE BOARD RATHER THAN THE STATE. A reading off state would see
   every step of this except the one that matters. The claim SHARE-02 makes is
   "a student pastes a classmate's code and gets that classmate's board", and a
   board is a thing on a page: cards, a health row of the right length, the
   student's own name for a built-in type, a tally under a type they invented,
   and a card in the faction column for an action they authored. Eight of those
   are compared below and the detail line says how many. --- */

const accPasteField = dom.byId['sh-load-field'];
const accLoadBtn = dom.byId['sh-load-do'];
const accLoadSaid = dom.byId['sh-load-said'];
const accConfirmBtn = dom.byId['reset-ask-confirm'];
const accUndoBtn = stub.querySelector('[data-act="undo"]');

const accCards = (side) => dom.byId['col-' + side].querySelectorAll('.unit-card').length;
const accRow = (amt, unit) => {
  const r = stub.querySelector('.tok-row[data-amt="' + amt + '"][data-unit="' + unit + '"]');
  return r === null ? -1 : r.children.length;
};
const accLabel = (tokenId) => {
  const n = stub.querySelector('[data-lbl="' + tokenId + '"]');
  return n === null ? '(no label node)' : n.textContent;
};
// The whole of both faction columns as the page renders them. paneText walks to
// the leaves, so this is the words and the numbers a student is looking at and
// not a node count.
const accBoardText = () => paneText(dom.byId['col-cats']) + '|' + paneText(dom.byId['col-mechs']);

/* ---- SETUP: a board a student would recognise. Outside the sequence. ---- */
clearPanel();
A.ops.resetToDefaults();
A.state.flush();
// restore() CLEARS the undo stack, which is what makes the depth readings below
// exact rather than saturated: this gate has driven several hundred commits by
// now and App.state's stack is hard-capped at UNDO_LIMIT, so a delta taken on
// the live stack reads 0 for a commit that really happened.
A.state.restore(JSON.stringify(A.state.get()));
A.state.flush();

A.ops.addUnit('cats');
A.ops.addUnit('mechs');
A.ops.setUnitMaxHp('cats', 'c1', 8);
A.ops.setUnitShield('cats', 'c1', 4);
A.ops.renameTokenType('hp', 'Vigor');
const accTok = A.ops.createTokenType({
  name: 'Momentum', shape: 'dia', color: 'violet', glyph: '', scope: 'unit'
});
A.ops.setTally('cats', 'c1', accTok, 3);
const accAct2 = A.ops.createAction('cats', 'Pounce');
A.ops.setActionCost('cats', accAct2, 0, 'ap', 1);
A.ops.setActionReq('cats', accAct2, 0, 'hp', 2);
A.ops.setActionXf('cats', accAct2, 0, A.data.XF_WHO[1], 'hp', -3);
A.state.flush();

const accMine = JSON.stringify(A.state.get());
const accMineStable = stableJson(A.state.get().build);
const accWant = [accCards('cats'), accCards('mechs'), accRow('hp', 'c1'),
  accRow('shield', 'c1'), accRow(accTok, 'c1'), accLabel('hp'), accLabel(accTok),
  refCardNamed('cats', 'Pounce') === null ? 'MISSING' : 'Pounce'];

/* ---- THE SEQUENCE. Every line below is a control a student presses. ---- */
shPress(shareOpener);
shPress(shareCopyBtn);
// READ OUT OF THE FIELD, not off a clipboard. There is no clipboard in this
// runtime at all — see limitations entry 17, which says what that costs and
// where the real crossing is rehearsed instead.
const accCode = shareCodeField.value;
shPress(shareDoneBtn);

shPress(resetOpener);
const accAskOpened = resetDlg.open;
const accAskCostNothing = JSON.stringify(A.state.get()) === accMine;
shPress(accConfirmBtn);
const accAskClosed = resetDlg.open;
// The board really was discarded, read off the page — without this the paste
// below could be loading a board that never left.
const accWiped = [accCards('cats'), accLabel('hp'),
  refCardNamed('cats', 'Pounce') === null ? 'MISSING' : 'Pounce'];
const accDefaults = JSON.stringify(A.state.get());

shPress(shareOpener);
shPress(shareToLoad);
// Pasted the way a code arrives out of a chat message: a leading space and a
// trailing newline. decode trims and so does the press; this is the row that
// says a student is never punished for either.
accPasteField.value = ' ' + accCode + '\n';
shPress(accLoadBtn);
const accSaidOnSuccess = [accLoadSaid.textContent, accLoadSaid.hidden];
const accFieldKept = accPasteField.value === ' ' + accCode + '\n';
shPress(shareDoneBtn);

const accGot = [accCards('cats'), accCards('mechs'), accRow('hp', 'c1'),
  accRow('shield', 'c1'), accRow(accTok, 'c1'), accLabel('hp'), accLabel(accTok),
  refCardNamed('cats', 'Pounce') === null ? 'MISSING' : 'Pounce'];

// The undo walk, through the topbar control. A load is ONE entry and the reset
// before it is ONE entry, so the first press must land on the shipped board and
// the second on the student's own — that is the ordering claim, and a fixed
// count would be a second place the number of commits has to be kept in step.
press(accUndoBtn); release(accUndoBtn); A.state.flush();
const accBackOne = JSON.stringify(A.state.get()) === accDefaults;
press(accUndoBtn); release(accUndoBtn); A.state.flush();
const accBackTwo = JSON.stringify(A.state.get()) === accMine;
const accWalkedCards = accCards('cats');

check(
  '91. PHASE 4\'S OWN ACCEPTANCE RUN. A board a student would recognise — two '
    + 'rosters grown, a health and a shield set, a built-in type renamed, a type '
    + 'of their own invented and tallied, an action authored with a cost, a '
    + 'requirement and a change — is copied through the real Copy press, '
    + 'discarded through the real reset confirmation, and pasted back through '
    + 'the real Load press with a leading space and a trailing newline on it. '
    + 'EIGHT values are then read back OFF THE PAGE, not off state: both card '
    + 'counts, the health row, the shield row, the tally row, the renamed '
    + 'built-in\'s label, the invented type\'s label, and the authored action\'s '
    + 'card in the faction column. Then two presses of the topbar undo control '
    + 'walk the board back through the load and the reset in that order, because '
    + 'each of them is exactly one entry',
  accAskOpened === true && accAskCostNothing === true && accAskClosed === false
    // the reset really did discard it, or the paste proves nothing
    && accWiped[0] !== accWant[0] && accWiped[1] === 'Health' && accWiped[2] === 'MISSING'
    && accCode !== '' && accCode.length > 0
    && JSON.stringify(accGot) === JSON.stringify(accWant)
    && accSaidOnSuccess[0] === '' && accSaidOnSuccess[1] === true
    && accFieldKept === true
    && stableJson(A.state.get().build) !== ''
    && accBackOne === true && accBackTwo === true && accWalkedCards === accWant[0]
    && errPanel.hidden === true,
  'page-side values compared=' + accWant.length
    + ' | before the copy=' + JSON.stringify(accWant)
    + ' | after the confirmed reset=' + JSON.stringify(accWiped)
    + ' | after the paste=' + JSON.stringify(accGot)
    + ' identical=' + (JSON.stringify(accGot) === JSON.stringify(accWant))
    + ' | code length=' + accCode.length
    + ' | said on success=' + JSON.stringify(accSaidOnSuccess[0])
    + ' hidden=' + accSaidOnSuccess[1] + ' pasted text kept=' + accFieldKept
    + ' | one undo -> the shipped board=' + accBackOne
    + ' two undos -> the student\'s board=' + accBackTwo
    + ' | error panel hidden=' + errPanel.hidden
);

/* 91b. THE FOUR REFUSALS ARE FOUR DIFFERENT SENTENCES, READ OFF THE PAGE.

   DISTINCTNESS IS THE WHOLE ROW, and it is asserted as distinctness rather than
   as non-emptiness on purpose. Four tokens routed onto one sentence would pass
   any row that only asked whether something was said, and it would throw away
   the only diagnosis this tool can offer: "you pasted the wrong thing", "your
   copy of this file is older than the code", "that code arrived cut short" and
   "that code names something this board has no such thing as" are four
   different things a student does four different things about.

   The tamper shapes are built here rather than imported, which is deliberate:
   they are a SECOND reader of the grammar, exactly as [S09.11]'s own tamper
   helpers are, so a row built out of decode's parse would agree with decode by
   construction. */
const accSEP = A.data.CODE_SEP.section;
const accBodyOf = (c) => {
  const rest = c.slice(c.indexOf(accSEP) + 1);
  return rest.slice(0, rest.lastIndexOf(accSEP));
};
const accSealed = (b) => A.data.CODE_VERSION + accSEP + b + accSEP + A.serialize.checksum(b);
const accShapes = [
  ['shape', 'hello there'],
  ['version', 'v2' + accSEP + accBodyOf(accCode) + accSEP
    + A.serialize.checksum(accBodyOf(accCode))],
  ['checksum', accCode.slice(0, -1) + (accCode.slice(-1) === 'z' ? 'y' : 'z')],
  ['content', (() => {
    const made = accBodyOf(accCode).split(accSEP);
    // section 2 is the first side's block; a roster count of zero is refused by
    // the same bound the add path enforces.
    made[2] = 'A0';
    return accSealed(made.join(accSEP));
  })()],
  // A SECOND content refusal with a DIFFERENT `what`, and it is here for one
  // reason: it is what proves the record's own wording reaches the page. Two
  // content refusals that read the same sentence would mean the page had
  // dropped the `what` and was saying only "something was wrong" — which is
  // the sentence the other three already cover between them.
  ['content', (() => {
    const made = accBodyOf(accCode).split(accSEP);
    made[1] = 'V!!!!!';
    return accSealed(made.join(accSEP));
  })()]
];

shPress(shareOpener);
shPress(shareToLoad);
const accSaid = [];
const accWhy = [];
const accBoardMoved = [];
const accUndoMoved = [];
// ONE reading taken before the whole sequence, and every refusal compared
// against IT as well as against the frame before it. PROBE W measured why: a
// handler that wrecks the board on the FIRST refusal makes every pairwise
// comparison after it green, because the board it wrecked to is now the board
// each subsequent refusal starts from. The pairwise clause names WHICH refusal
// moved it; this one is what makes the row red for all of them.
const accBoardAtStart = accBoardText();
const accBoardDrifted = [];
accShapes.forEach(([, code]) => {
  const boardWas = accBoardText();
  const depthWas = A.state.undoDepth();
  accPasteField.value = code;
  shPress(accLoadBtn);
  accSaid.push(accLoadSaid.textContent);
  accWhy.push(accLoadSaid.dataset.shWhy);
  accBoardMoved.push(accBoardText() !== boardWas);
  accBoardDrifted.push(accBoardText() !== accBoardAtStart);
  accUndoMoved.push(A.state.undoDepth() !== depthWas);
});
// The four TOKENS are the first four shapes; the fifth is the second content
// refusal and is scored separately, because it is a claim about the `what`
// reaching the page rather than about the four tokens being told apart.
const accFour = accSaid.slice(0, 4);
const accDistinct = accFour.filter((s, i) => accFour.indexOf(s) === i).length;

check(
  '91b. the four ways a build code can be wrong produce FOUR DIFFERENT '
    + 'SENTENCES on the page, driven one shape at a time through the real Load '
    + 'press. The row asserts DISTINCTNESS and not merely that something was '
    + 'said: four tokens collapsed onto one message passes any row that only '
    + 'asked whether the line was non-empty, and it costs a student the only '
    + 'diagnosis this tool is able to offer. Each sentence is also required to '
    + 'be non-empty, shown, and to name no board — the code is a string and the '
    + 'board it describes was never read',
  accFour.length === 4 && accDistinct === 4
    && accSaid.every((s) => typeof s === 'string' && s.length > 12)
    && JSON.stringify(accWhy)
      === JSON.stringify(['shape', 'version', 'checksum', 'content', 'content'])
    // AND THE CONTENT SENTENCE NAMES THE OFFENDING THING. Two content refusals
    // with two different `what`s read as two different sentences — a page that
    // dropped the `what` would say the same thing twice, which is the state
    // where a student is told a code is wrong and nothing about how.
    && accSaid[3] !== accSaid[4]
    && accLoadSaid.hidden === false
    && errPanel.hidden === true,
  'distinct sentences=' + accDistinct + ' of ' + accFour.length
    + ' | shape=' + JSON.stringify(accSaid[0])
    + ' | version=' + JSON.stringify(accSaid[1])
    + ' | checksum=' + JSON.stringify(accSaid[2])
    + ' | content=' + JSON.stringify(accSaid[3])
    + ' | a second content refusal=' + JSON.stringify(accSaid[4])
    + ' names a different thing=' + (accSaid[3] !== accSaid[4])
    + ' | tokens read off data-sh-why=' + JSON.stringify(accWhy)
);

check(
  '91c. AND NOT ONE OF THEM MOVED THE BOARD. The rendered text of both faction '
    + 'columns is taken before and after each of the four refusals and compared '
    + 'whole, and the undo depth beside it — because a refusal that wrote a '
    + 'phantom undo step would leave the board looking right and one Ctrl+Z '
    + 'away from being wrong. The op commits nothing on a refusal and the '
    + 'handler writes only the message; this is the row that says the handler '
    + 'kept its half of that. Each refusal is compared BOTH against the frame '
    + 'before it and against one reading taken before the whole sequence — '
    + 'PROBE W measured that the pairwise clause alone goes green for every '
    + 'refusal after the first one that wrecked the board',
  accBoardMoved.every((moved) => moved === false)
    && accBoardDrifted.every((drifted) => drifted === false)
    && accUndoMoved.every((moved) => moved === false)
    && errPanel.hidden === true,
  'board moved on any of the four=' + JSON.stringify(accBoardMoved)
    + ' drifted from the board before the sequence=' + JSON.stringify(accBoardDrifted)
    + ' undo depth moved=' + JSON.stringify(accUndoMoved)
    + ' | rendered board length=' + accBoardText().length + ' characters'
    + ' | error panel hidden=' + errPanel.hidden
);

shPress(shareDoneBtn);

/* 91d and 91e. THE CONFIRMATION, BOTH ANSWERS, ON A STACK WITH ROOM IN IT.
   The depth readings are taken after a restore(), which clears the stack — see
   the note at the head of 91. Without it both deltas read 0 on a saturated
   stack and both rows would be green about nothing. */
A.state.restore(JSON.stringify(A.state.get()));
A.state.flush();
A.ops.nudgeFactionAp('cats', 1);
A.state.flush();

const accCancelBefore = JSON.stringify(A.state.get());
const accCancelDepth = A.state.undoDepth();
shPress(resetOpener);
const accCancelOpened = resetDlg.open;
shPress(resetCancelBtn);
check(
  '91d. CANCELLING COSTS NOTHING, and "nothing" is the literal claim rather '
    + 'than a figure of speech: the state is byte-identical to the reading '
    + 'taken before the confirmation was opened, the undo depth has not moved, '
    + 'and the dialog is closed with focus back on the control that opened it. '
    + 'A cancel that quietly reset anyway would leave a student with a board '
    + 'they declined to discard and a Ctrl+Z they have no reason to press',
  accCancelOpened === true && resetDlg.open === false
    && JSON.stringify(A.state.get()) === accCancelBefore
    && A.state.undoDepth() === accCancelDepth
    && stub.activeElement === resetOpener
    && errPanel.hidden === true,
  'opened=' + accCancelOpened + ' closed=' + (resetDlg.open === false)
    + ' | state before=' + fnv(accCancelBefore)
    + ' after=' + fnv(JSON.stringify(A.state.get()))
    + ' identical=' + (JSON.stringify(A.state.get()) === accCancelBefore)
    + ' | undo depth ' + accCancelDepth + ' -> ' + A.state.undoDepth()
    + ' | focus back on the opener=' + (stub.activeElement === resetOpener)
);

const accConfirmBefore = JSON.stringify(A.state.get());
const accConfirmDepth = A.state.undoDepth();
shPress(resetOpener);
shPress(accConfirmBtn);
const accConfirmDelta = A.state.undoDepth() - accConfirmDepth;
const accConfirmIsShipped = JSON.stringify(A.state.get().build)
  === JSON.stringify(A.data.defaults());
press(accUndoBtn); release(accUndoBtn); A.state.flush();
const accConfirmUndone = JSON.stringify(A.state.get()) === accConfirmBefore;

check(
  '91e. CONFIRMING IS EXACTLY ONE UNDO ENTRY, and ONE press of the topbar undo '
    + 'control brings the student\'s build back BYTE FOR BYTE. This is the '
    + 'sentence the confirmation dialog makes to a student before they press '
    + 'it, asserted rather than promised — and it is what makes the modal a '
    + 'question rather than a warning. It is also the reason the confirm arm '
    + 'dispatches once and does nothing else beside it: a second commit in the '
    + 'same frame would fold into this one under commit()\'s coalescing window '
    + 'and one Ctrl+Z would step back past both. The board really did go to the '
    + 'Workshop 16 defaults in between, which a row asserting only the undo '
    + 'would be green without',
  accConfirmIsShipped === true && accConfirmDelta === 1
    && accConfirmUndone === true && resetDlg.open === false
    && errPanel.hidden === true,
  'build === the shipped defaults after confirming=' + accConfirmIsShipped
    + ' | undo depth ' + accConfirmDepth + ' -> ' + (accConfirmDepth + accConfirmDelta)
    + ' delta=' + accConfirmDelta + ' (cap ' + A.state.UNDO_LIMIT + ')'
    + ' | one undo restores byte for byte=' + accConfirmUndone
    + ' | state before=' + fnv(accConfirmBefore)
    + ' after the undo=' + fnv(JSON.stringify(A.state.get()))
);

/* --- 93-102. PLAN 05-10: THE FIGHT, DRIVEN FROM THE PAGE ---------------------

   EVERY ROW BELOW DRIVES THE PAGE, and the reason is Phase 3's WR-01 lesson
   restated by three of this phase's own probes: a check written against source
   spelling cannot see behaviour reached through a helper, and — worse here — a
   check written against STATE cannot see a marker derived wrongly on the way to
   the screen. Probe AB drew the dead marker from `hp === 0` instead of the
   stored flag and the whole repository stayed green over it, because every
   D-00d row in this file reads state and state is not what a student sees.
   Probe AE rendered the live reading as one statement naming both sides and
   nothing said anything. Probe W disabled the Advance control for a side that
   could not pay and 147 of 147 still passed. All three are closed below, and
   each row says which probe it answers.

   THE LEDGER IS ASSERTED BY DRIVING A REAL ADVANCE AND READING ROWS OFF THE
   PAGE rather than by grepping [S06.8] for an appendChild, for the same
   reason. --- */

A.ops.resetToDefaults();
A.state.flush();
clearPanel();

const fgBar = dom.byId['fightbar'];
const fgLedgerRoot = dom.byId['ledger'];
const fgBoard = dom.byId['board'];
const fgApp = dom.byId['app'];
const fgStrip = dom.byId['strip'];
const fgStart = dom.byId['fight-start'];
const fgUndoBtn = stub.querySelector('[data-act="undo"]');

// One press, one frame. Every drive below goes through this, so no row can
// quietly reach a handler without the page having caught up with it.
function fgPress(node) {
  press(node);
  release(node);
  A.state.flush();
}
function fgSideRootOf(side) { return dom.byId['decl-' + side]; }
/* D-31's SECOND COLUMN ROOT PER SIDE. The two names below are the whole of what
   the split costs the readers in this file, and they are deliberately two
   functions rather than one taking an area: every call site then says WHICH
   HALF of the round it is reading, and a row that quietly starts reading the
   wrong one is visible at the call rather than in an argument.

     fgSideRootOf   the INPUT column — picker rows, the reading box, and the two
                    half-made-change attributes [S07.5] writes.
     fgStateRootOf  the STATE column — the side's name, its survivor reading, its
                    battlefield cluster and its team resources. */
function fgStateRootOf(side) { return dom.byId['state-' + side]; }
function fgOne(root, sel) { return root.querySelectorAll(sel)[0] || null; }

/* THE DECLARATION PRESS, REWIRED BY PLAN 05-14 ONTO D-27's GRID. The three
   choosers and the Declare button are gone — [S07.5]'s own banner records the
   four arms that retired with them — so what these two helpers PRESS has moved.
   NOT ONE ROW'S CLAIM MOVED WITH THEM: every row below still asserts exactly
   what it asserted, on a surface that reaches the same ops by one press instead
   of four.

   THE BUTTON IS FOUND BY SIDE, BY PERFORMER AND BY ACTION — never by position —
   for the reason the retired helper gave about its own lookup: a row that
   pressed whatever happened to be first would pass over a grid that drew the
   wrong buttons in the right order.

   AND `atId` IS GONE FROM fgDeclare's SIGNATURE RATHER THAN IGNORED IN ITS
   BODY. Under D-27 one press declares and the tool points the declaration at
   the lowest-health living enemy; there is no target argument to give, and a
   parameter that silently did nothing would let a row go on claiming it chose
   something. Where a row needs a target the default would not pick, it drives
   the change-target flow instead. */
function fgActBtnOf(side, byId, actionId) {
  return fgSideRootOf(side).querySelectorAll('[data-fg="act"]')
    .filter((b) => b.dataset.fgBy === byId && b.dataset.fgVal === actionId)[0] || null;
}
function fgPick(side, byId, actionId) {
  const btn = fgActBtnOf(side, byId, actionId);
  if (btn !== null) { fgPress(btn); }
  return btn;
}
function fgDeclare(side, actionId, byId) {
  fgPick(side, byId, actionId);
}
// The change-target control on one row, and the reading beside it.
function fgAtBtnOf(side, byId) {
  return fgSideRootOf(side).querySelectorAll('[data-fg="at"]')
    .filter((b) => b.dataset.fgBy === byId)[0] || null;
}
function fgLandsOn(side, byId) {
  const at = fgAtBtnOf(side, byId);
  if (at === null) { return null; }
  const lands = at.parentNode.querySelectorAll('.fg-lands')[0] || null;
  return lands === null ? null : fgLeaves(lands).join('');
}
function fgAdvancePress() { fgPress(fgOne(fgBar, '[data-fg="advance"]')); }
function fgAliveBtn(side, unitId) {
  return fgBoard.querySelectorAll('[data-dc="alive"]')
    .filter((b) => b.dataset.dcSide === side && b.dataset.dcUnit === unitId)[0] || null;
}
function fgLeaves(root) {
  const out = [];
  (function walk(n) {
    if (!n) { return; }
    if (n.children.length === 0 && typeof n.textContent === 'string'
      && n.textContent !== '') {
      out.push(n.textContent);
    }
    n.children.forEach(walk);
  })(root);
  return out;
}
/* THE OTHER CHANNEL, ADDED BY D-29: what a region says on HOVER and to a screen
   reader. fgLeaves reads the text a room sees; this reads the `title` and the
   `aria-label` of every node under the same root, in document order, unstripped
   -- the exemption is Layer C's business and these rows are asserting that a
   word ARRIVED, not that it is admissible.

   THE TWO ARE COLLECTED SEPARATELY AND NEVER CONCATENATED, because the whole
   point of every row below that uses both is which of the two a word is IN. A
   walk that merged them would be green over prose that never moved out of the
   text and green over prose that never arrived in the tooltip. */
function fgSaid(root) {
  const out = [];
  (function walk(n) {
    if (!n) { return; }
    ['title', 'aria-label'].forEach((attr) => {
      const v = n.getAttribute ? n.getAttribute(attr) : null;
      if (typeof v === 'string' && v !== '') { out.push(v); }
    });
    n.children.forEach(walk);
  })(root);
  return out;
}
function fgActNamed(side, name) {
  return A.state.get().build[side].actions.filter((a) => a.name === name)[0];
}

const fgCatsAct = A.state.get().build.cats.actions[0].id;
// THE MECHS' ACTION IS CHOSEN BY WHAT IT DOES RATHER THAN BY ITS POSITION, and
// plan 05-14 moved it for a reason a row's own label states: row 102 claims
// that BOTH sides declare "an action naming who acts and what it lands on", and
// under D-27 the target is the tool's answer to App.model.needsAt rather than a
// chooser press. The mechs' FIRST action aims nothing at anybody, so a
// declaration of it names nobody and the claim would have quietly stopped being
// true. Read through the shipped derivation, so the row and the artifact agree
// about which actions have a target at all.
const fgMechsAct = A.state.get().build.mechs.actions
  .filter((a) => A.model.needsAt(a))[0].id;

// A BOARD SOMEBODY HAS ACTUALLY PLAYED ON, built through real presses, because
// every reading below is taken on it. Two rounds resolved and a declaration
// standing in the third: the ledger has rows, the declaration list has lines,
// and both are things that do not exist on a board where startFight() has just
// been called — which is what probe X measured about check 92 before plan
// 05-08 moved that drive.
fgPress(fgStart);
fgDeclare('cats', fgCatsAct, 'c1');
fgDeclare('mechs', fgMechsAct, 'm1');
fgAdvancePress();
fgDeclare('cats', fgCatsAct, 'c2');
fgAdvancePress();
fgDeclare('mechs', fgMechsAct, 'm1');

/* 93. THE ACT PARTITION, COLLECTED OFF THE PAGE, in 68d and 90b's shape and
   extended over the four regions this phase paints. The two halves together
   are the point: a control naming an act nobody registered is caught, and so is
   a state op quietly moved into UI_ACTS to make a refusal go away.

   THE SECOND HALF IS THE ONE THAT MATTERS HERE, and the six ops are named in
   this row's own label so a move reddens with an explanation rather than with a
   number. Probe AF drives exactly that move.

   ============================================================================
   PLAN 05-16 RE-READ THE PARTITION OFF THE SHIPPED SURFACE, AND THE FINDING IS
   THAT THE SET DID NOT MOVE. That is worth writing down rather than leaving as
   a silent no-change, because this plan's whole job was to assume it HAD moved:
   D-27 retired the three choosers, the cost report, the Declare button and the
   per-line Clear, and [S07.5]'s own banner lists four data-fg spellings that
   went with them — data-fg="declare", "clear", "by" and the chooser spelling of
   "at". Every one of those was a CONTROL and not an ACT. Read off the live
   handler, the acts this surface dispatches today are still exactly the six
   below: declare and clearDeclaration survive the whole redesign, advanceRound,
   resetFight and setAlive were never touched, and startFight still comes off
   the topbar's own data-act.

   WHAT DID MOVE IS THE PAYLOAD AND THE CONTROL COUNT, and neither is this row's
   claim. `declare` is now built from one press rather than from three chooser
   selections and a fourth press on Declare — its argument list is
   App.model.defaultAt's answer where it used to be a chooser's — and the
   private-attribute count has moved TWICE since the floor beneath it was set:
   down with plan 05-14, which replaced twenty-six chooser pills with one button
   per unit per action, and up with plan 05-15's twelve battlefield shapes.

   AND #views IS NOW WALKED AS A FOURTH ROOT (plan 05-16). Plan 05-12 built a
   region of controls with a private data-vw and no data-act, and check 103
   asserts that absence — but check 103 is a row about the SWITCH and this is
   the row about the PARTITION. A data-act appearing in there is [S07.1] routing
   a view press into App.ops.dispatch, which is the one way page work becomes
   state work without anybody deciding to make it, and it belongs in the same
   walk as the other three regions rather than in a clause of its own. */
const FG_DISPATCHED = [
  // the act the page sends          the op [S05] exports for it
  ['startFight', 'startFight'],
  ['resetFight', 'resetFight'],
  ['declare', 'declareAction'],
  ['clearDeclaration', 'clearDeclaration'],
  ['advanceRound', 'advanceRound'],
  ['setAlive', 'setAlive']
];
const fgActsFound = [];
[fgBar, fgLedgerRoot, fgBoard, dom.byId['views']].forEach((root) => {
  (function walk(n) {
    if (n.dataset && typeof n.dataset.act === 'string' && n.dataset.act !== ''
      && fgActsFound.indexOf(n.dataset.act) === -1) {
      fgActsFound.push(n.dataset.act);
    }
    n.children.forEach(walk);
  })(root);
});
if (fgActsFound.indexOf(fgStart.dataset.act) === -1) {
  fgActsFound.push(fgStart.dataset.act);
}
const fgUiOnly = fgActsFound.filter((a) => A.interactions.UI_ACTS.indexOf(a) !== -1);
const fgUnhandled = fgUiOnly.filter((a) => A.interactions.UI_HANDLED.indexOf(a) === -1);
const fgStateActs = fgActsFound.filter((a) => A.interactions.UI_ACTS.indexOf(a) === -1);
// A FIELD's act is the third legitimate kind and the row would be wrong without
// it. [S07.1] reads a numeric field's data-act and looks the op up in FIELD_OPS
// rather than in App.ops, so `maxHp` and `nudgeShield` are dispatched names
// that [S05] deliberately does not export — the table's own comment says the
// four keys exist "because a FIELD carries them". The allowlist is read off the
// LIVE exported table for the reason every list in this file is: a re-typed
// copy checks itself.
const fgFieldActs = [];
Object.keys(A.interactions.FIELD_OPS).forEach((key) => {
  const row = A.interactions.FIELD_OPS[key];
  [row.set, row.nudge].forEach((name) => {
    if (typeof name === 'string' && fgFieldActs.indexOf(name) === -1) {
      fgFieldActs.push(name);
    }
  });
});
const fgNotOps = fgStateActs.filter((a) =>
  typeof A.ops[a] !== 'function' && fgFieldActs.indexOf(a) === -1);
const fgParked = FG_DISPATCHED
  .filter((pair) => A.interactions.UI_ACTS.indexOf(pair[0]) !== -1)
  .map((pair) => pair[0]);
const fgNoOpBehind = FG_DISPATCHED
  .filter((pair) => typeof A.ops[pair[1]] !== 'function')
  .map((pair) => pair[1]);
// The two surfaces this phase built carry ZERO acts inside them on purpose —
// [S06.7]'s control register and [S06.9]'s toggle both give every control a
// private data-fg or data-dc — so it is those PRIVATE controls that are
// floored. A region with no controls at all passes an all-clear spotlessly.
const fgActsInside = fgBar.querySelectorAll('[data-act]').length
  + fgLedgerRoot.querySelectorAll('[data-act]').length
  + dom.byId['views'].querySelectorAll('[data-act]').length;
const fgPrivateCount = fgBar.querySelectorAll('[data-fg]').length
  + fgBoard.querySelectorAll('[data-dc]').length
  + dom.byId['views'].querySelectorAll('[data-vw]').length;
// THE FLOOR MOVED WITH THE SURFACE AND NOT WITH THE CLAIM (plan 05-14). It was
// 60 and it is 45, because D-27 retired three choosers whose entries were one
// per unit on BOTH rosters — twenty-six "what it lands on" pills alone — and
// replaced the whole form with one button per unit per action.
// PLAN 05-16 RE-READ IT ON THIS EXACT PLAYED BOARD, and the count now takes
// data-vw with the other two: 27 cats action buttons + 9 mechs action buttons
// + 1 change-target control + 12 battlefield shapes + Advance + Reset inside
// #fightbar, 12 alive toggles inside #board, and 2 view controls inside #views.
// The floor is NOT a measurement of the surface; it exists for the sentence in
// this row's own label — "a region with no controls at all passes an all-clear
// spotlessly" — so it stays set below what the smallest legal board draws and
// above zero, and it is deliberately NOT raised to the reading. A floor pinned
// to a count is a floor that reddens every time a plan adds a control, which is
// how a floor stops being read and starts being edited.
check(
  '93. THE ACT PARTITION FOR THE FIGHT, read off a page somebody has played on. '
    + 'Every act #fightbar, #ledger, #board, #views and the start control '
    + 'dispatch is either a UI-only act the LIVE registration handles or a real '
    + 'op [S05] exports — and NOT ONE of startFight, resetFight, declare, '
    + 'clearDeclaration, advanceRound or setAlive is in UI_ACTS. That second '
    + 'half is the whole row: an entry there is a name [S07] handles itself '
    + 'instead of dispatching, which is exactly how a refusal is made to stop '
    + 'being raised. The SIX WERE RE-READ OFF D-27\'s SHIPPED SURFACE and did '
    + 'not move, which is the finding rather than the absence of one: what the '
    + 'redesign retired was four CONTROLS, not one act. The three fight '
    + 'surfaces and the view switch carry ZERO acts inside them on purpose, so '
    + 'it is their private data-fg, data-dc and data-vw controls that are '
    + 'floored — a region with no controls at all passes an all-clear '
    + 'spotlessly',
  fgActsInside === 0 && fgUnhandled.length === 0 && fgNotOps.length === 0
    && fgParked.length === 0 && fgNoOpBehind.length === 0
    && fgPrivateCount >= 45 && fgStateActs.indexOf('startFight') !== -1,
  'acts on data-act inside #fightbar + #ledger + #views=' + fgActsInside
    + ' | acts found=' + JSON.stringify(fgActsFound)
    + ' | UI-only=' + JSON.stringify(fgUiOnly)
    + ' | claimed but unhandled=' + JSON.stringify(fgUnhandled)
    + ' | field acts, read off the live FIELD_OPS=' + JSON.stringify(fgFieldActs)
    + ' | state acts that are neither an op nor a field act='
    + JSON.stringify(fgNotOps)
    + ' | FIGHT OPS PARKED IN UI_ACTS=' + JSON.stringify(fgParked)
    + ' | dispatched acts with no op behind them=' + JSON.stringify(fgNoOpBehind)
    + ' | private data-fg + data-dc + data-vw controls=' + fgPrivateCount
);

/* 93b. EVERY LISTENER ON BOTH OF THIS PLAN'S ROOTS WENT THROUGH THE ERROR
   BOUNDARY, in 68c's and 90c's shape and for their reason. One bound raw would
   throw past [S08] and leave the surface dead with nothing on screen to say so
   — and on this surface that means a student pressing Advance in front of a
   room, seeing nothing happen, and pressing it again.

   Structural rather than behavioural, because the behavioural test cannot reach
   every listener: App.boot.wrap returns an ANONYMOUS zero-arity function that
   closes over the handler, and every handler in [S07.5] is a named function
   declared with its own parameter. So a raw binding is visible by name and by
   arity. TWO ROOTS AND TWO FLOORS, because a root carrying no listeners at all
   passes a per-listener test spotlessly.

   THREE ROOTS AND THREE FLOORS AS OF PLAN 05-16, because plan 05-12 built a
   third one. #views is a static element that outlives every rebuild and carries
   the two controls a student uses to move between the board and the fight — and
   the argument for flooring it is the argument this row was already making,
   arriving on a region that did not exist when the row was written: a root
   carrying no listeners at all passes a per-listener test spotlessly, and a
   region whose listeners were silently moved elsewhere would read zero and pass.
   The floor is 1 rather than 3 because [S07.6] binds ONE delegated listener
   there and not the pair the other two roots carry — a floor set at what the
   other roots read would be a floor asserting a shape this region never had. */
function fgRawOn(root) {
  const raw = [];
  Object.keys(root._listeners).forEach((type) => {
    root._listeners[type].forEach((fn) => {
      if (typeof fn !== 'function' || fn.name !== '' || fn.length !== 0) {
        raw.push(type + ' -> ' + (typeof fn === 'function'
          ? (fn.name || '(anonymous)') + '/' + fn.length : typeof fn));
      }
    });
  });
  return raw;
}
function fgListenersOn(root) {
  return Object.keys(root._listeners)
    .reduce((n, type) => n + root._listeners[type].length, 0);
}
const fgBarRaw = fgRawOn(fgBar);
const fgBoardRaw = fgRawOn(fgBoard);
const fgViewsRaw = fgRawOn(dom.byId['views']);
const fgBarListeners = fgListenersOn(fgBar);
const fgBoardListeners = fgListenersOn(fgBoard);
const fgViewsListeners = fgListenersOn(dom.byId['views']);
check(
  '93b. every listener bound on ALL THREE of the fight page\'s static roots '
    + 'went through App.boot.wrap. #fightbar, #board and #views are the three '
    + 'elements that outlive every rebuild — [S06.7] replaces the '
    + 'declaration-root interiors inside the first, structure() replaces the '
    + 'column interiors inside the second, and the third is the switch plan '
    + '05-12 built — so a listener bound any deeper would be thrown away by the '
    + 'first repaint, and the alive toggle lives inside a unit card. Three '
    + 'roots and three floors, because a root carrying no listeners passes a '
    + 'per-listener test spotlessly, and the third floor is 1 rather than 3 '
    + 'because that region binds one delegated listener and never had two',
  fgBarListeners >= 3 && fgBoardListeners >= 3 && fgViewsListeners >= 1
    && fgBarRaw.length === 0 && fgBoardRaw.length === 0
    && fgViewsRaw.length === 0,
  'listeners on #fightbar=' + fgBarListeners
    + ' bound outside the boundary: ' + (fgBarRaw.join(', ') || 'none')
    + ' | listeners on #board=' + fgBoardListeners
    + ' bound outside the boundary: ' + (fgBoardRaw.join(', ') || 'none')
    + ' | listeners on #views=' + fgViewsListeners
    + ' bound outside the boundary: ' + (fgViewsRaw.join(', ') || 'none')
);

/* 93c. AN ADVANCE IS NEVER HELD, ON THE KEYBOARD EITHER — and this row exists
   because [S07.1]'s suppression cannot reach these controls. onKeyDown finds a
   repeat through actTarget, actTarget returns null for anything carrying no
   data-act, and every control in [S07.5] carries a private data-fg or data-dc
   instead. D-17's own paragraph says what that costs: a held Enter on a focused
   button makes the browser synthesise a click per repeated keydown, and the
   click handler has no e.repeat to test because click events do not carry one.
   Held on Advance that is the forty-rounds outcome HOLD_ACTS exists to prevent,
   arriving through the other door; held on Reset it throws a played fight away
   over and over.

   THE FIRST PRESS IS NOT CANCELLED, which is what keeps Enter on a fight
   control behaving exactly like a click, and it is asserted beside the repeat
   because a suppression that swallowed both would be a control the keyboard
   cannot reach at all. Check 68b holds the same pair one surface over.

   WHAT THIS ROW CANNOT REACH is written into the limitations list by number:
   the stub synthesises no click from a keydown, so what is asserted here is
   that the artifact ASKS the browser not to — which is the whole of what
   preventDefault can do — and not that a real browser then obliges.

   ============================================================================
   PLAN 05-16 ADDS THE THIRD CONTROL AND ANSWERS THE QUESTION IT WAS TOLD TO ASK.
   The question: does an ACTION BUTTON on D-27's grid need this suppression at
   all? A held Enter on Advance is forty resolved rounds; a held Enter on an
   action button is something quieter, and quiet is where an unasked question
   usually goes.

   THE ANSWER IS YES, and the arithmetic is the reason rather than the symmetry.
   The button is radio-semantic: pressing it declares, pressing it again clears
   — so a held Enter does not repeat one act, it FLIPS between two, at the OS
   auto-repeat rate. Each flip is a real commit through App.ops.dispatch, so a
   two-second hold is roughly sixty commits and sixty undo entries, and D-20's
   coalescing window does NOT fold them into one because they are not the same
   label: declare and clearDeclaration are two different commits and the label
   carries the act. The visible outcome is a student holding a key, seeing the
   button flicker, letting go on whichever parity the release lands on, and
   finding that Ctrl+Z now walks backwards through their own hold instead of
   through their own play. That is a different cost from Advance's forty rounds
   and it is not an acceptable one.

   AND IT IS ALREADY COVERED — BY SCOPE RATHER THAN BY A THIRD ARM. onFightKeyDown
   tests `node.closest('[data-fg]')`, and an action button carries data-fg="act",
   so it is inside the suppression today with no line written for it. THIS ROW
   ASSERTS THAT RATHER THAN ASSUMING IT, which is the whole reason the control was
   added here: a coverage that holds because of an attribute nobody re-checked is
   a coverage that a later spelling change removes silently. The declaration is
   read back either side of the hold as well, so a suppression that stopped
   working would show up as a flipped declaration and not only as an uncancelled
   event. */
const fgAdvanceBtn = fgOne(fgBar, '[data-fg="advance"]');
const fgRoundBeforeHold = A.state.get().fight.round;
const fgFirstKey = dom.event('keydown', { key: 'Enter', repeat: false });
fgAdvanceBtn.dispatchEvent(fgFirstKey);
let fgRepeatCancelled = null;
for (let i = 0; i < 10; i++) {
  const rep = dom.event('keydown', { key: 'Enter', repeat: true });
  fgAdvanceBtn.dispatchEvent(rep);
  fgRepeatCancelled = rep.defaultPrevented;
}
A.state.flush();
const fgAliveHeld = fgAliveBtn('cats', 'c1');
const fgAliveRepeat = dom.event('keydown', { key: ' ', repeat: true });
fgAliveHeld.dispatchEvent(fgAliveRepeat);
A.state.flush();
// THE THIRD CONTROL, plan 05-16: an action button on D-27's grid. The first
// press is read too, for the same reason it is read on Advance, and the
// declaration is read either side of the hold so a suppression that stopped
// working shows as a moved declaration rather than only as an event nobody
// cancelled.
const fgActHeld = fgActBtnOf('mechs', 'm1', fgMechsAct);
const fgActDeclWas = fgActHeld.getAttribute('aria-pressed');
const fgActFirstKey = dom.event('keydown', { key: 'Enter', repeat: false });
fgActHeld.dispatchEvent(fgActFirstKey);
let fgActRepeatCancelled = null;
for (let i = 0; i < 10; i++) {
  const rep = dom.event('keydown', { key: 'Enter', repeat: true });
  fgActHeld.dispatchEvent(rep);
  fgActRepeatCancelled = rep.defaultPrevented;
}
A.state.flush();
const fgActDeclNow = fgActBtnOf('mechs', 'm1', fgMechsAct).getAttribute('aria-pressed');
check(
  '93c. a repeated Enter on the Advance control, a repeated Space on the alive '
    + 'toggle and a repeated Enter on an ACTION BUTTON are all cancelled before '
    + 'any of them can become a click, and the FIRST press of each is not. '
    + '[S07.1] cancels a held key through actTarget, which returns null for '
    + 'every control in this region because not one of them carries a data-act '
    + '— so without this the browser would synthesise one click per OS '
    + 'auto-repeat. Held on Advance that resolves rounds until the history a '
    + 'student just played has rolled off the end of the list; held on an '
    + 'action button it FLIPS a declaration on and off at the auto-repeat rate, '
    + 'which is two different commits and therefore an undo entry per flip '
    + 'rather than one coalesced entry. The action button is covered by SCOPE '
    + 'and not by an arm of its own — onFightKeyDown tests data-fg and the '
    + 'button carries data-fg="act" — so this row asserts that coverage rather '
    + 'than assuming it, and reads the declaration back either side of the hold',
  fgRepeatCancelled === true && fgFirstKey.defaultPrevented === false
    && fgAliveRepeat.defaultPrevented === true
    && fgActRepeatCancelled === true && fgActFirstKey.defaultPrevented === false
    && fgActDeclNow === fgActDeclWas
    && A.state.get().fight.round === fgRoundBeforeHold
    && errPanel.hidden === true,
  'the repeat is cancelled=' + fgRepeatCancelled
    + ' | the first press is cancelled=' + fgFirstKey.defaultPrevented
    + ' | a held Space on the toggle is cancelled=' + fgAliveRepeat.defaultPrevented
    + ' | a held Enter on an action button is cancelled=' + fgActRepeatCancelled
    + ' and its own first press is cancelled=' + fgActFirstKey.defaultPrevented
    + ' | the declaration either side of that hold: '
    + JSON.stringify(fgActDeclWas) + ' -> ' + JSON.stringify(fgActDeclNow)
    + ' | rounds resolved by the hold='
    + (A.state.get().fight.round - fgRoundBeforeHold)
);

/* 94. NO LEDGER ROW CARRIES AN ATTRIBUTE THE INTERACTION LAYER DISPATCHES ON OR
   THE SYNC PASS WRITES — check 63b's parallel one region over, and it is the
   cheap version of the whole focus-hazard section. THE REGION IS WALKED AND THE
   SOURCE IS NOT GREPPED, for 63b's stated reason: the source scan cannot see
   setData(node, { k: … }), which is the only spelling this file uses, so a row
   that silently became a live control passed every check in this repo.

   data-k is the one with teeth. withPreservedFocus takes the FIRST match for a
   key scoped to its container, and this phase added the first repeated region
   in the file's history — a key in here would put focus restore into a list
   that rebuilds on every Advance. Probe AG drives it and measures what it
   costs. Floored on the row count for check 55's reason: a walk that found no
   rows would find no attributes and pass spotlessly.

   PROBE AG'S MEASURED COST IS KEPT HERE VERBATIM (plan 05-16), because it is
   the half a reader needs and the half a later plan will otherwise re-derive
   wrongly: with a colliding data-k on a ledger row, `keyed(#board)` SURVIVES —
   because #ledger is a SIBLING of #board and not a child of it — while
   `keyed(#app)` RETURNS THE LEDGER ROW. So the arrangement is safe because of
   the container the focus restore is scoped to, and only because of it. ANY
   FUTURE PLAN THAT WIDENS A FOCUS RESTORE FROM #board TO THE SHELL HANDS THE
   KEYBOARD TO A HISTORY ENTRY, and this sentence is where it will find that
   out. The shell comment on #ledger records the same measurement from the
   markup's side.

   PLAN 05-16 RE-READ THIS ROW AND ITS CLAIM DID NOT MOVE. The region below it
   grew a key space of roughly units x actions — see 94b — but not one of those
   keys is inside #ledger, which is what this row says and the only thing it
   says. Its leaf floor of 20 was set against a ledger with rows in it and reads
   159 today. */
const fgLdDrift = [];
(function walk(n) {
  if (n.dataset) {
    ['k', 'act', 'amt'].forEach((key) => {
      if (n.dataset[key] !== undefined) {
        fgLdDrift.push(String(n.className || '(root)') + '/data-' + key);
      }
    });
  }
  const cls = String(n.className || '');
  if (cls.indexOf('brd-value') !== -1) { fgLdDrift.push(cls + '/.brd-value'); }
  if (cls.indexOf('brd-line--opt') !== -1) { fgLdDrift.push(cls + '/.brd-line--opt'); }
  n.children.forEach(walk);
})(fgLedgerRoot);
const fgLdRows = fgLedgerRoot.querySelectorAll('.ld-row').length;
const fgLdLeaves = fgLeaves(fgLedgerRoot).length;
check(
  '94. no node ON THE PAGE inside #ledger — a row or anything under it — '
    + 'carries data-k, data-act, data-amt, .brd-value or .brd-line--opt. The '
    + 'region is WALKED rather than the source grepped, for check 63b\'s '
    + 'reason: the source scan cannot see the setData spelling this file '
    + 'actually uses. data-k is the one with teeth, because withPreservedFocus '
    + 'takes the FIRST match for a key inside its container and this phase '
    + 'added the first repeated region in this file\'s history',
  fgLdRows >= 2 && fgLdLeaves >= 20 && fgLdDrift.length === 0,
  'rows on the page=' + fgLdRows + ' leaf strings=' + fgLdLeaves
    + ' attributes found: ' + JSON.stringify(fgLdDrift)
);

/* 94b. AND EVERY data-k ON THE PAGE IS UNIQUE, document-wide, with a fight
   running. Same mechanism, stated as the property rather than as its absence:
   keyed() takes the first match, so two nodes sharing a key means a repaint can
   hand the keyboard to the wrong one. Unit ids are unique across both sides —
   no unit is on two sides — which is what makes `fg/alive/c1` unique by
   construction, and this row is what says the construction held.

   AND THE KEY SPACE GREW BY units x actions (plan 05-16 re-read it). D-27's
   grid writes `fg/act/<side>/<unit>/<action>` on every button, so where the
   retired form wrote a handful of chooser keys this one writes one per unit per
   action; plan 05-15 then added `fg/bf/<side>/<unit>` per battlefield shape.
   Read on this exact played board the page carries 149 keys against the 120 the
   floor was set at, and NOT ONE of them repeats. THE FLOOR IS DELIBERATELY LEFT
   AT 120 rather than raised to 149: it exists so a walk that found no keys
   cannot pass this row spotlessly, and a floor pinned to the reading would
   redden every time a plan adds a control — which is how a floor stops being
   read and starts being edited. The claim is the UNIQUENESS and the floor is
   only there to prove the walk arrived.

   THE PRODUCT IS ALSO WHY THE UNIQUENESS CLAIM MATTERS MORE THAN IT DID. A key
   space that grows as a product is a key space where a collision is a naming
   accident rather than a typo — two actions sharing an id on one side, or a
   unit id repeated across rosters, would both produce one — and keyed() taking
   the FIRST match means the cost lands on the keyboard rather than in an error.
   Row 106h reads the battlefield's twelve against both rosters; this row reads
   the whole page. */
const fgKeys = {};
const fgKeyDupes = [];
let fgKeyCount = 0;
(function walk(n) {
  if (n.dataset && typeof n.dataset.k === 'string' && n.dataset.k !== '') {
    fgKeyCount++;
    if (Object.prototype.hasOwnProperty.call(fgKeys, n.dataset.k)) {
      fgKeyDupes.push(n.dataset.k);
    }
    fgKeys[n.dataset.k] = true;
  }
  n.children.forEach(walk);
})(fgApp);
check(
  '94b. every data-k on the page is unique with a fight running, two rounds in '
    + 'the ledger and a declaration standing — over a key space that D-27 grew '
    + 'into a PRODUCT of units by actions, plus one per battlefield shape. '
    + 'keyed() takes the FIRST match, so a repeated key is a repaint handing '
    + 'the keyboard to a node the student was not on, and a product is where a '
    + 'collision arrives as a naming accident rather than as a typo. The floor '
    + 'is not raised to the reading: it is only there so a walk that found no '
    + 'keys cannot pass this row spotlessly',
  fgKeyCount >= 120 && fgKeyDupes.length === 0,
  'keys on the page=' + fgKeyCount + ' (floor 120) duplicates='
    + JSON.stringify(fgKeyDupes)
);

/* 95. THE DISABLE CONTRACT, IN BOTH DIRECTIONS, AND THE RULE IT REPLACED.

   ==================================================================
   WHAT THIS ROW USED TO SAY, AND WHY IT DOES NOT SAY IT ANY MORE.
   ==================================================================
   It asserted that NOTHING on the fight page is disabled for anything a student
   did — 147 controls across three boards, compared as whole sets. That was
   D-23's rule ("a declared cost that exceeds the pool is reported, never
   prevented"), and D-23 was an ORCHESTRATOR ASSUMPTION standing in for the
   developer. The developer has now answered, at the 05-11 checkpoint, in their
   own words: "Disable any actions whose requirements are not met."

   SO THE ROW IS TURNED IN THE OPEN, on the 03.1-04 precedent, and it is
   REWRITTEN RATHER THAN DELETED — a deleted boundary assertion is an Out of
   Scope entry that has quietly stopped being enforced, which is 72b's own
   sentence about itself. It was recorded RED against the new contract before it
   was touched:

     controls compared=137 | funded === cannot pay and cannot meet=false
     | funded === three ruled dead=false | fight pools driven to [0,0]
     | the report moved: "" -> "Slash needs 99 Health of 27. Requirement not
     met." | the advance entry=["fg/advance=false"] | every =true
     entry=["fg=true"] | alive toggles disabled=[]

   Two of the three whole-set comparisons failed and the other four clauses
   held, which is the shape the overrule is supposed to have: it reached the
   grid and nothing else.

   ==================================================================
   WHAT IT SAYS NOW. TWO HALVES, AND THE FIRST IS THE ONE THAT ERODES.
   ==================================================================
   OUTSIDE THE GRID, the whole disabled set is still compared across all three
   boards and must be IDENTICAL. That is the never-disable rule still in force
   on everything the overrule does not reach: Advance on a side that cannot pay,
   Reset, the change-target control, the alive toggle on a unit already marked,
   every stepper on the board and every control in the topbar. The scope of an
   overrule is the half nobody re-reads, so it is the half asserted first.

   INSIDE THE GRID, the expected set is computed from `(a) or (b) or (c)`
   INDEPENDENTLY OF THE RENDER and compared with what the page actually shows,
   BOTH DIRECTIONS: nothing disabled that should not be, nothing enabled that
   should be. The expectation reads App.model — affordability, spokenFor and
   actionApCost — because re-deriving those here would be a second arithmetic
   agreeing with itself; what it does NOT read is anything [S06.7] wrote. The
   three conditions are spelled out again below in the harness's own words,
   which is the point: two independent spellings of one contract, and the row is
   what makes them agree.

   AND A THIRD CLAUSE, because the two above would both be green over a page
   that never disabled anything at all: the funded board must show NOTHING
   disabled inside the grid, the cannot-pay board must show SOMETHING, and the
   ruled-dead board must show every button of every ruled unit disabled. That is
   the contract firing rather than merely being agreed with.

   THE THREE BOARDS ARE BUILT TO THE SAME SHAPE ON PURPOSE, and the first draft
   of this row was WRONG for exactly the reason probe W's comparison was built
   like-for-like: the funded board carried a declaration and the driven one
   resolved it on the Advance that emptied the pools, so a control on that line
   went away and the two sets differed for a reason that had nothing to do with
   anything being disabled. Every board below therefore has a fight running and
   exactly ONE declaration standing, and they differ only in what the side can
   pay, what it can meet, and who has been ruled dead.

   WHAT THIS HARNESS CANNOT SEE, named rather than left to be discovered: the
   stub page has no hit testing, so fgPress on a DISABLED control still reaches
   the handler here where a real browser would swallow the click entirely. That
   is why every clause below reads the disabled PROPERTY off the page rather
   than asserting that a press did nothing — a row written the other way round
   would be asserting a browser behaviour this file cannot model. Plan 05-16
   owes the limitations entry. */

/* THE EXPECTATION, COMPUTED FROM STATE AND FROM App.model, AND FROM NOTHING
   [S06.7] WROTE. The caster shim is spelled again here rather than reached for,
   because it is [S06.7]'s private helper and a row borrowing it would be a row
   asserting that the artifact agrees with itself. sideFromBuild carries a
   unit's allocated health across as `hp` and affordability reads `maxHp`; that
   rename is what this shim is. */
function fgExpectedOff(side) {
  const st = A.state.get();
  const actions = st.build[side].actions;
  const live = st.fight[side];
  const caster = {
    ap: live.ap,
    units: live.units.map((u) => ({ maxHp: u.hp, shield: u.shield }))
  };
  if (live.tally) { caster.tally = live.tally; }
  /* TURNED IN THE OPEN UNDER D-32. This mirror computed condition (b) against
     ONE pool — `rep.apCost > (live.ap - spoke + pledge)` — because a cost was
     one term and action points were the only pool there was. D-32 made a cost a
     LIST and made a side-scope type a student invented a pool on the same terms
     (D-24), so the expectation walks every term the report prices and asks the
     same question of each. The recorded RED is the run on the commit that moved
     [S06.7] and left this reader on the old shape: the shipped board is ap-only
     so it stayed GREEN there, and the row below that puts a two-pool cost on
     the board is what actually made the difference visible — which is why that
     row exists rather than this rewrite standing alone.

     THE VOCABULARY IS HANDED IN because whether a term names a pool is a fact
     about the TYPE. The three conditions and their order are unchanged, and so
     is every sentence about why: the flag first because it settles the row, the
     requirement second because it is the same answer for every row of a side,
     the pool last because it is the only one that depends on what else has been
     declared this round. */
  const vocab = st.build.tokens;
  const spoke = A.model.spokenForPools(actions, st.fight.decl, side, vocab);
  const out = [];
  live.units.forEach((u) => {
    const held = st.fight.decl.filter((d) => d.side === side && d.by === u.id)[0] || null;
    // The row's OWN pledge, per pool: what replacing this declaration gives
    // back. Computed through the same derivation the preview uses, over a list
    // holding only this row's standing declaration.
    const pledge = held === null
      ? Object.create(null)
      : A.model.spokenForPools(actions, [held], side, vocab);
    actions.forEach((a) => {
      const rep = A.model.affordability(caster, a, vocab);
      let off;
      // (c) the student's own ruling, read off the STORED flag and never off
      //     the health — D-00d, and the direction probe AX drives.
      if (u.alive === false) { off = true; }
      // (a) a requirement term unmet on the CASTER SIDE.
      else if (rep.met.some((m) => m.have < m.need)) { off = true; }
      // (b) EVERY POOL THE COST NAMES, each against the room left in it with
      //     this row's own pledge given back — the clause probe AQ drives,
      //     asked once per term under D-32. A term this file holds no pool for
      //     never disables, which is D-16's stance moved down to the term.
      else {
        off = rep.pays.some((c) => c.pool === true
          && c.need > (c.have - A.model.pooledAt(spoke, c.tok)
            + A.model.pooledAt(pledge, c.tok)));
      }
      out.push('fg/act/' + side + '/' + u.id + '/' + a.id + '=' + off);
    });
  });
  return out.sort().join('|');
}
function fgInsideGrid(set) {
  return set.split('|').filter((e) => e.indexOf('fg/act/') === 0).sort().join('|');
}
function fgOutsideGrid(set) {
  return set.split('|').filter((e) => e.indexOf('fg/act/') !== 0).sort().join('|');
}
function fgExpectedBoth() {
  return (fgExpectedOff('cats') + '|' + fgExpectedOff('mechs'))
    .split('|').sort().join('|');
}

function fgFundedBoard() {
  A.ops.resetToDefaults();
  A.state.flush();
  fgPress(fgStart);
  fgDeclare('cats', fgCatsAct, 'c1');
}
fgFundedBoard();
const fgDisabledFunded = disabledIn(fgApp);
const fgFundedTrue = fgDisabledFunded.split('|').filter((e) => e.indexOf('=true') !== -1);
const fgFundedReport = fgLeaves(fgOne(fgSideRootOf('cats'), '.fg-reportbox')).join('');
const fgFundedInside = fgInsideGrid(fgDisabledFunded);
const fgFundedWant = fgExpectedBoth();
const fgFundedOffCount = fgFundedInside.split('|')
  .filter((e) => e.indexOf('=true') !== -1).length;

// NOTHING TO SPEND AND BELOW EVERY REQUIREMENT. The pool is driven to zero
// through a real Advance rather than by writing a number into the slice,
// because advanceRound is the only thing in this file that refills it — so the
// build is set to nothing first and the Advance carries that through. The
// declaration is then made again, so this board has the same one standing.
fgFundedBoard();
A.ops.setActionCost('cats', fgCatsAct, 0, 'ap', 9);
A.ops.setActionReq('cats', fgCatsAct, 0, 'hp', 99);
A.ops.setFactionAp('cats', 0);
A.ops.setFactionAp('mechs', 0);
A.state.get().build.cats.units.forEach((u) => { A.ops.setUnitMaxHp('cats', u.id, 1); });
A.state.get().build.mechs.units.forEach((u) => { A.ops.setUnitMaxHp('mechs', u.id, 1); });
A.state.flush();
fgAdvancePress();
fgDeclare('cats', fgCatsAct, 'c1');
const fgDisabledOwing = disabledIn(fgApp);
const fgOwingReport = fgLeaves(fgOne(fgSideRootOf('cats'), '.fg-reportbox')).join('');
const fgPoorAp = [A.state.get().fight.cats.ap, A.state.get().fight.mechs.ap];
const fgAdvanceEntry = fgDisabledOwing.split('|')
  .filter((e) => e.indexOf('fg/advance=') === 0);
const fgOwingInside = fgInsideGrid(fgDisabledOwing);
const fgOwingWant = fgExpectedBoth();
const fgOwingOffCount = fgOwingInside.split('|')
  .filter((e) => e.indexOf('=true') !== -1).length;

// AND THE SAME BOARD WITH THREE UNITS RULED DEAD, through three real presses.
fgPress(fgAliveBtn('cats', 'c1'));
fgPress(fgAliveBtn('cats', 'c2'));
fgPress(fgAliveBtn('mechs', 'm1'));
const fgDisabledDead = disabledIn(fgApp);
const fgDeadToggles = fgDisabledDead.split('|')
  .filter((e) => e.indexOf('fg/alive/') === 0 && e.indexOf('=true') !== -1);
const fgDeadInside = fgInsideGrid(fgDisabledDead);
const fgDeadWant = fgExpectedBoth();
const fgDeadRuledOff = fgDeadInside.split('|').filter((e) =>
  (e.indexOf('fg/act/cats/c1/') === 0 || e.indexOf('fg/act/cats/c2/') === 0
    || e.indexOf('fg/act/mechs/m1/') === 0) && e.indexOf('=false') !== -1);

/* AND A FOURTH BOARD: THE LAST ACTION A SIDE CAN PAY FOR, DECLARED. It is here
   because PROBE AQ found the first three could not tell condition (b)'s
   `+ own pledge` from its absence — on all three of them the row's remaining
   pool was large enough either way, so removing the clause changed nothing and
   the probe was spotlessly green. That is probe AD's recorded lesson arriving
   again: A ROW HAS TO BE TAKEN ON A BOARD WHERE THE DISTINCTION SHOWS.

   The board that shows it: the action costs exactly what the side holds, and
   one unit has declared it. With the pledge given back the row's own pool is
   3 - 3 + 3 = 3 and its own button is still live — which is what makes
   re-click-to-undo reachable. Without it the pool is 0, the button that made
   the declaration is out of reach, and the student is holding a declaration
   they cannot take back from the only control that takes it back. Every OTHER
   row on the side is out of reach on both spellings, which is correct and is
   why only the declaring row can tell them apart. */
fgFundedBoard();
// THE COST IS RAISED UNDER THE DECLARATION THAT IS ALREADY STANDING, and it is
// deliberately not re-declared: fgFundedBoard has already pressed c1's button,
// and a second press on the same action is an UNDO — the radio semantics
// working. The first draft of this board did press it again, cleared the
// declaration, and left the row with nothing to give back and nothing to tell
// the two spellings apart. spokenFor reads the LIVE cost, so raising it moves
// the sum without a second press.
A.ops.setActionCost('cats', fgCatsAct, 0, 'ap', A.state.get().fight.cats.ap);
A.state.flush();
const fgDisabledLast = disabledIn(fgApp);
const fgLastInside = fgInsideGrid(fgDisabledLast);
const fgLastWant = fgExpectedBoth();
const fgLastOwnRow = fgLastInside.split('|')
  .filter((e) => e.indexOf('fg/act/cats/c1/' + fgCatsAct + '=') === 0);
const fgLastOtherRow = fgLastInside.split('|')
  .filter((e) => e.indexOf('fg/act/cats/c4/' + fgCatsAct + '=') === 0);

/* AND A FIFTH BOARD: D-00d, ON A SIDE THAT CAN AFFORD EVERYTHING. It is here
   because PROBE AX drove condition (c) off `hp === 0` instead of the stored
   flag and the four boards above were spotlessly green over it — on the
   ruled-dead board every button is ALREADY out of reach because the side cannot
   pay and cannot meet, so condition (c) never decides anything on its own and
   the two spellings agree by accident. Probe AD's lesson for the second time in
   one row.

   The board that shows it is FUNDED, so (a) and (b) never fire and the disabled
   set inside the grid is exactly what (c) says. It carries the two units that
   tell the two spellings apart, both put there through the shipped controls a
   student uses:
     c3 is driven to ZERO HEALTH and nobody rules it — its buttons stay LIVE,
       which is what keeps a Shield ruling representable and is the direction a
       tidy implementation loses;
     c4 is at FULL HEALTH and is RULED DEAD through the alive toggle — its
       buttons go out of reach.
   Under `hp === 0` both answers invert, which is why both are asserted by
   name. */
fgFundedBoard();
A.ops.dispatch('setUnitHp', { side: 'cats', unitId: 'c3', value: 0 });
A.state.flush();
fgPress(fgAliveBtn('cats', 'c4'));
const fgDisabledFlag = disabledIn(fgApp);
const fgFlagInside = fgInsideGrid(fgDisabledFlag);
const fgFlagWant = fgExpectedBoth();
const fgFlagZeroRow = fgFlagInside.split('|')
  .filter((e) => e.indexOf('fg/act/cats/c3/') === 0 && e.indexOf('=true') !== -1);
const fgFlagRuledRow = fgFlagInside.split('|')
  .filter((e) => e.indexOf('fg/act/cats/c4/') === 0 && e.indexOf('=false') !== -1);
const fgFlagHp = [A.state.get().fight.cats.units[2].hp,
  A.state.get().fight.cats.units[3].hp];
const fgFlagAlive = [A.state.get().fight.cats.units[2].alive,
  A.state.get().fight.cats.units[3].alive];
const fgAtEntries = fgDisabledDead.split('|')
  .filter((e) => e.indexOf('fg/at/') === 0 && e.indexOf('=true') !== -1);
const fgControlCount = fgDisabledFunded.split('|').length;
const fgOutsideSame = fgOutsideGrid(fgDisabledFunded) === fgOutsideGrid(fgDisabledOwing)
  && fgOutsideGrid(fgDisabledFunded) === fgOutsideGrid(fgDisabledDead)
  && fgOutsideGrid(fgDisabledFunded) === fgOutsideGrid(fgDisabledLast)
  && fgOutsideGrid(fgDisabledFunded) === fgOutsideGrid(fgDisabledFlag);
check(
  '95. THE DISABLE CONTRACT, IN BOTH DIRECTIONS, AND THE NEVER-DISABLE RULE '
    + 'STILL IN FORCE EVERYWHERE IT REACHES. This row REPLACES the assertion '
    + 'that nothing on this page is ever disabled, which was D-23 — an '
    + 'orchestrator assumption — and which the developer overruled at the 05-11 '
    + 'checkpoint in their own words: "Disable any actions whose requirements '
    + 'are not met." The overrule is scoped to the fight declaration grid, the '
    + 'never-disable rule REMAINS in force on the build and proposal surfaces '
    + '(check 71c holds that one and is untouched), and this row is what says '
    + 'so mechanically. OUTSIDE the grid the whole disabled set is identical '
    + 'across three boards that differ only in what a side can pay, what it can '
    + 'meet and who has been ruled dead — Advance stays enabled on a side that '
    + 'cannot pay, the alive toggle stays enabled on a unit already marked, the '
    + 'change-target control is never disabled, and the single =true is still '
    + 'the start control bounding what the TOOL may do to ITSELF. INSIDE the '
    + 'grid the disabled set is exactly the three conditions — requirement '
    + 'unmet, the row\'s own remaining pool cannot pay, or the unit ruled dead '
    + '— computed here from state independently of the render and compared BOTH '
    + 'WAYS on all three boards. And the contract is asserted to FIRE: nothing '
    + 'is out of reach on the funded board, something is on the one that cannot '
    + 'pay, and every button of every ruled unit is on the third. AND A FOURTH '
    + 'BOARD CARRIES CONDITION (b)\'s `+ own pledge` ON ITS OWN, because the '
    + 'other three cannot tell it from its absence: an action costing exactly '
    + 'what the side holds, declared, leaves the DECLARING row\'s own button '
    + 'live and every other row\'s out of reach — which is what keeps '
    + 're-click-to-undo reachable at all. AND A FIFTH CARRIES D-00d ON A SIDE '
    + 'THAT CAN AFFORD EVERYTHING, because on a starved board condition (c) '
    + 'never decides anything by itself: a unit driven to ZERO HEALTH that '
    + 'nobody ruled keeps every one of its buttons, and a unit at FULL HEALTH '
    + 'that a student ruled dead loses every one of them',
  fgOutsideSame === true
    && fgFundedInside === fgFundedWant
    && fgOwingInside === fgOwingWant
    && fgDeadInside === fgDeadWant
    && fgLastInside === fgLastWant
    && fgLastOwnRow.length === 1
    && fgLastOwnRow[0] === 'fg/act/cats/c1/' + fgCatsAct + '=false'
    && fgLastOtherRow.length === 1
    && fgLastOtherRow[0] === 'fg/act/cats/c4/' + fgCatsAct + '=true'
    && fgFlagInside === fgFlagWant
    && fgFlagZeroRow.length === 0 && fgFlagRuledRow.length === 0
    && fgFlagHp[0] === 0 && fgFlagHp[1] > 0
    && fgFlagAlive[0] !== false && fgFlagAlive[1] === false
    && fgFundedOffCount === 0 && fgOwingOffCount > 0
    && fgDeadRuledOff.length === 0
    && fgOwingReport !== fgFundedReport
    && fgFundedTrue.length === 1 && fgFundedTrue[0] === 'fg=true'
    && fgAdvanceEntry.length === 1 && fgAdvanceEntry[0] === 'fg/advance=false'
    && fgDeadToggles.length === 0 && fgAtEntries.length === 0
    && fgControlCount >= 100,
  'controls compared=' + fgControlCount
    + ' | OUTSIDE the grid identical across all three boards=' + fgOutsideSame
    + ' | INSIDE, page === expectation: funded='
    + (fgFundedInside === fgFundedWant)
    + ' cannot pay=' + (fgOwingInside === fgOwingWant)
    + ' ruled dead=' + (fgDeadInside === fgDeadWant)
    + ' last affordable action=' + (fgLastInside === fgLastWant)
    + ' the stored flag=' + (fgFlagInside === fgFlagWant)
    + ' | on the fourth board the DECLARING row reads '
    + JSON.stringify(fgLastOwnRow)
    + ' and another row reads ' + JSON.stringify(fgLastOtherRow)
    + ' | on the fifth, c3 at health ' + fgFlagHp[0] + ' alive='
    + fgFlagAlive[0] + ' has buttons out of reach='
    + JSON.stringify(fgFlagZeroRow)
    + ' and c4 at health ' + fgFlagHp[1] + ' alive=' + fgFlagAlive[1]
    + ' has buttons still live=' + JSON.stringify(fgFlagRuledRow)
    + ' | buttons out of reach: funded=' + fgFundedOffCount
    + ' cannot pay=' + fgOwingOffCount
    + ' | a ruled unit\'s buttons still enabled=' + JSON.stringify(fgDeadRuledOff)
    + ' | fight pools driven to ' + JSON.stringify(fgPoorAp)
    + ' | the report moved: ' + JSON.stringify(fgFundedReport)
    + ' -> ' + JSON.stringify(fgOwingReport)
    + ' | the advance entry=' + JSON.stringify(fgAdvanceEntry)
    + ' | every =true entry OUTSIDE the grid=' + JSON.stringify(
      fgOutsideGrid(fgDisabledFunded).split('|').filter((e) => e.indexOf('=true') !== -1))
    + ' | alive toggles disabled=' + JSON.stringify(fgDeadToggles)
    + ' | change-target controls disabled=' + JSON.stringify(fgAtEntries)
);

/* 95b. NO HANDLER WRITES A DISABLED STATE — the assertion plan 05-10 shipped as
   an ACCEPTANCE LINE rather than as a numbered check, re-homed here, which is
   exactly how a boundary gets forgotten. That line was `grep -c "\\.disabled"`
   over [S07.5] printing 0, and it still prints 0 — it is read below off the
   artifact's own source, sliced between the region's two markers in the shape
   check 63 already uses.

   BUT THE GREP IS THE WEAKER HALF AND IS NOT THE ROW. The property the new
   contract makes true is stronger and is what is driven: EVERY DISABLED STATE
   ON THIS PAGE IS WRITTEN BY THE RENDER TIER AND RE-DECIDED FROM STATE ON EVERY
   REPAINT. Three drives:
     a real declaration takes a set of buttons out of reach;
     an op of probe S's character — a RENAME, which changes what is drawn
       without changing what the contract answers — rebuilds the picker rows,
       and the disabled set is identical while the BUTTON NODES ARE DIFFERENT
       OBJECTS. That pair is the whole of "re-derived rather than sticky": new
       nodes, written afresh, the same answer. A disable a handler had toggled
       onto the old nodes would simply not be on the new ones and the set would
       come back all-false;
     and an UNDO is driven through the topbar control until the declaration is
       gone, after which the set follows it back to what it was before.
   A handler that toggled the property instead fails the second drive outright,
   and fails the third for a second reason: the undo moves the state and nothing
   would move the page.

   THE NO-OP FRAME IS DELIBERATELY NOT THE DRIVE, AND THE FIRST DRAFT OF THIS
   ROW USED ONE AND WAS WRONG. invalidate() plus flush() over a board nothing
   has changed rebuilds nothing at all — [S06.7]'s fingerprint gate returns
   early, which is the gate working — so the node came back IDENTICAL and the
   row failed for a reason that had nothing to do with stickiness. The drive has
   to be an op the fingerprint actually sees. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
A.state.restore(JSON.stringify(A.state.get()));
A.state.flush();
const fgReDisWas = disabledIn(fgApp);
// A cost the side can pay exactly once, so ONE declaration takes every other
// row's button out of reach and the contract has something to say.
A.ops.setActionCost('cats', fgCatsAct, 0, 'ap', 3);
A.state.flush();
fgDeclare('cats', fgCatsAct, 'c1');
const fgReDisAfter = disabledIn(fgApp);
const fgReNodeWas = fgActBtnOf('cats', 'c3', fgCatsAct);
A.ops.renameAction('cats', fgCatsAct, 'Pounce');
A.state.flush();
const fgReDisIdle = disabledIn(fgApp);
const fgReNodeNow = fgActBtnOf('cats', 'c3', fgCatsAct);
fgPress(fgUndoBtn);
fgPress(fgUndoBtn);
const fgReDisUndone = disabledIn(fgApp);
const fgReNameBack = A.state.get().build.cats.actions
  .filter((a) => a.id === fgCatsAct)[0].name;
const fgReOffAfter = fgReDisAfter.split('|')
  .filter((e) => e.indexOf('fg/act/') === 0 && e.indexOf('=true') !== -1).length;
const FG_S075_OPEN = '// #region [S07.5] INTERACTIONS — THE FIGHT';
const FG_S075_CLOSE = '// #endregion [S07.5] INTERACTIONS — THE FIGHT';
const fgS075 = html.slice(html.indexOf(FG_S075_OPEN),
  html.indexOf(FG_S075_CLOSE) + FG_S075_CLOSE.length);
const fgS075Writes = (fgS075.match(/\.disabled/g) || []).length;
check(
  '95b. THE DISABLE IS A RENDER DECISION AND NO HANDLER WRITES ONE, re-homed '
    + 'from the acceptance line plan 05-10 shipped it as. The source of '
    + '[S07.5] is sliced between its own two region markers and the property '
    + 'that takes a control away appears in it ZERO times — but that grep is '
    + 'the weaker half. What is DRIVEN is the property the new contract makes '
    + 'true: a real declaration takes buttons out of reach; a RENAME rebuilds '
    + 'the picker rows and the disabled set is identical while the button NODES '
    + 'are different objects, which is re-derived rather than sticky; and the '
    + 'topbar undo puts the set back to what it was before the declaration. A '
    + 'handler that toggled the property fails the second drive outright, '
    + 'because a disable it wrote onto the old nodes is not on the new ones. '
    + 'Re-deciding is what makes an undo move it too, '
    + 'which is setEditorEnabled\'s rule and its reason',
  fgS075Writes === 0
    && fgReOffAfter > 0
    && fgReDisAfter !== fgReDisWas
    && fgReDisIdle === fgReDisAfter
    && fgReNodeNow !== fgReNodeWas && fgReNodeNow !== null
    && fgReDisUndone === fgReDisWas && fgReNameBack !== 'Pounce',
  'the property appears in [S07.5] ' + fgS075Writes + ' times over '
    + fgS075.length + ' characters'
    + ' | buttons out of reach after the declaration=' + fgReOffAfter
    + ' | the set moved on the declaration=' + (fgReDisAfter !== fgReDisWas)
    + ' | a rename left it identical=' + (fgReDisIdle === fgReDisAfter)
    + ' while the node was replaced=' + (fgReNodeNow !== fgReNodeWas)
    + ' | the undo put it back=' + (fgReDisUndone === fgReDisWas)
    + ' | the action name is back to ' + JSON.stringify(fgReNameBack)
);

/* 96. AN ADVANCE MOVES THE STATE **AND** THE PAGE, asserted in ONE row. This is
   checks 72 and 73's lesson with its claim inverted: there the claim was that
   nothing lands, and the row asserted state identity and page stillness
   together because "a row that compared only the state would be spotlessly
   green over a pane whose every press did nothing at all — and probe Y proved
   that is not hypothetical." Here the claim is that something DOES land, so
   both halves are asserted together for the same reason pointing the other way:
   a row that only read the state would be green over a press that changed
   nothing on screen. Probe AH makes the handler dispatch nothing and both
   halves must fire.

   PLAN 05-16 RE-DROVE IT THROUGH D-27's GRID AND THE CLAIM DID NOT MOVE, which
   is the whole point of re-driving it: what changed is which control the two
   declarations come off, and a row whose claim shifted to fit a new surface
   would have stopped asserting the thing it was written for. The declarations
   are made by pressing an action button on a picker row (plan 05-14 moved
   fgDeclare there); the round, the ledger and the page fingerprint are read
   exactly as they were.

   AND THE GRID'S OWN READING IS READ SEPARATELY, because the page fingerprint
   moves over any one of a dozen things while the reading a student actually
   watches is the one this phase built. The cats' team-resource pair says what
   this round's declarations have SPOKEN FOR; an Advance resolves the round and
   empties the declaration list, so it must come back to where it started. That
   is FIGHT-09's reading measured MOVING rather than asserted about, and it is
   the half of limitations entry 30 that an Advance owns. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
function fgTeamRead(side) {
  return fgLeaves(fgOne(fgStateRootOf(side), '.fg-team')).join(' ');
}
const fgTeamIdle = fgTeamRead('cats');
fgDeclare('cats', fgCatsAct, 'c1');
fgDeclare('mechs', fgMechsAct, 'm1');
const fgTeamSpoken = fgTeamRead('cats');
const fgPageBefore = fgLeaves(fgBar).join('') + ''
  + fgLeaves(fgLedgerRoot).join('') + ''
  + fgLeaves(dom.byId['col-cats']).join('');
/* ==========================================================================
   D-33 P1-5 — TWO KINDS OF CARD LIVE IN THIS LANE NOW, AND EVERY ROW THAT
   COUNTS THEM HAS TO SAY WHICH IT MEANS.
   ==========================================================================
   The audit measured round one: #ledger-list was an EMPTY div under a heading,
   with 1,180px of empty page beside it — "a label with nothing under it, which
   reads as a rendering failure". P1-5 renders ONE placeholder card there, at
   .ld-row's own geometry with a dashed border, naming the round it waits for.

   IT CARRIES .ld-row BECAUSE IT IS THE SAME OBJECT AT THE SAME SIZE — that is
   the whole point of a placeholder — so `.ld-row` counts one more than it did
   at exactly the moments `past` is empty. Rather than narrow every reader and
   lose the claim, the two are counted SEPARATELY and BOTH are asserted, which
   turns a defect this pass would otherwise have to work around into the
   contract P1-5 actually makes: the placeholder is present exactly when there
   is no history, and gone the moment there is. */
function ldReal(root) {
  return root.querySelectorAll('.ld-row')
    .filter((n) => String(n.className || '').indexOf('ld-row--wait') === -1).length;
}
function ldWaiting(root) {
  return root.querySelectorAll('.ld-row')
    .filter((n) => String(n.className || '').indexOf('ld-row--wait') !== -1).length;
}
const fgStateBefore = JSON.stringify(A.state.get().fight);
const fgRoundBefore = dom.byId['round-count'].textContent;
const fgRowsBefore = ldReal(fgLedgerRoot);
const fgWaitBefore = ldWaiting(fgLedgerRoot);
fgAdvancePress();
const fgPageAfter = fgLeaves(fgBar).join('') + ''
  + fgLeaves(fgLedgerRoot).join('') + ''
  + fgLeaves(dom.byId['col-cats']).join('');
const fgStateAfter = JSON.stringify(A.state.get().fight);
const fgRoundAfter = dom.byId['round-count'].textContent;
const fgRowsAfter = ldReal(fgLedgerRoot);
const fgWaitAfter = ldWaiting(fgLedgerRoot);
const fgTeamResolved = fgTeamRead('cats');
check(
  '96. ONE PRESS OF THE REAL ADVANCE CONTROL MOVES THE STATE AND MOVES THE '
    + 'PAGE, and both halves ride in one row. Checks 72 and 73 assert the '
    + 'opposite claim the same way and for the same reason: a row that compared '
    + 'only the state would be spotlessly green over a press that changed '
    + 'nothing on screen. The round on the bar steps, the ledger grows a row, '
    + 'and the rendered text of the bar, the ledger and a faction column all '
    + 'move together. AND THE GRID\'S OWN SPOKEN-FOR READING IS READ THROUGH '
    + 'ALL THREE MOMENTS — idle, declared, resolved — because the page '
    + 'fingerprint moves over anything at all while this is the reading a '
    + 'student is actually watching. The declarations come off an action button '
    + 'on a picker row, which is D-27\'s surface, and the claim is exactly the '
    + 'one this row was written with. AND D-33 P1-5\'s PLACEHOLDER CARD IS '
    + 'COUNTED BESIDE THE REAL ONES RATHER THAN WITH THEM: at round one the '
    + 'lane holds ONE dashed card and NO history, and one Advance later it '
    + 'holds one round and NO placeholder. That clause was added when the '
    + 'placeholder landed - this row read `.ld-row` and went red on "1 -> 1", '
    + 'which was the placeholder being counted as a round. Narrowing the reader '
    + 'alone would have left the placeholder unasserted anywhere; counting both '
    + 'makes its whole contract a claim in the gate',
  fgStateAfter !== fgStateBefore && fgPageAfter !== fgPageBefore
    && fgRoundAfter !== fgRoundBefore && fgRowsAfter === fgRowsBefore + 1
    && fgWaitBefore === 1 && fgWaitAfter === 0
    && fgTeamSpoken !== fgTeamIdle && fgTeamResolved === fgTeamIdle
    && errPanel.hidden === true,
  'state moved=' + (fgStateAfter !== fgStateBefore)
    + ' (' + fnv(fgStateBefore) + ' -> ' + fnv(fgStateAfter) + ')'
    + ' | page moved=' + (fgPageAfter !== fgPageBefore)
    + ' (' + fnv(fgPageBefore) + ' -> ' + fnv(fgPageAfter) + ')'
    + ' | the round on the bar ' + JSON.stringify(fgRoundBefore)
    + ' -> ' + JSON.stringify(fgRoundAfter)
    + ' | ledger rounds ' + fgRowsBefore + ' -> ' + fgRowsAfter
    + ', placeholder cards ' + fgWaitBefore + ' -> ' + fgWaitAfter
    + ' | the cats\' team reading, verbatim: idle ' + JSON.stringify(fgTeamIdle)
    + ' -> declared ' + JSON.stringify(fgTeamSpoken)
    + ' -> resolved ' + JSON.stringify(fgTeamResolved)
);

/* 97. D-13's RENDERED HALF, AND IT HAD NO MECHANICAL CHECK ANYWHERE IN THIS
   REPOSITORY UNTIL THIS ROW. Probe AE rendered the live reading as ONE
   statement naming both sides — the exact comparison D-13 forbids — and the
   whole repository stayed green: 1188 passed, 0 failed, 147 of 147, every scan
   clean, both naming greps 0. [S09.8] holds the STRUCTURAL half (one builder,
   called once per side, every figure carrying its own side) and cannot see
   what is drawn.

   IT IS A LEAF WALK AND NOT A REGION WALK, and that is the whole shape of it:
   the region legitimately names both factions — once per side, in two different
   statements — which is the whole of what D-13 permits. What it forbids is ONE
   statement holding both, so the unit of the test is the leaf. Floored on the
   leaf count, because a walk over a region that painted nothing passes
   spotlessly.

   PLAN 05-16 EXTENDS IT OVER D-27's GRID, AND THE GRID IS WHERE THE RISK NOW
   LIVES. The live reading in #strip was the only per-side prose on the page
   when this row was written. It is not any more: each side's column carries a
   head, a team-resource pair, one picker row per unit with a landing reading
   beside it, and a report box of requirement sentences — every one of them a
   statement about ONE side, and every one of them a place where a sentence
   naming the other side could helpfully be written. The landing reading is the
   likeliest of the lot, because it already names a unit on the opposing roster
   and a faction word is one edit away. What D-13 forbids is a leaf setting the
   two FACTIONS against each other, and this is the walk that would see it.

   THE TWO WALKS ARE HELD APART AND BOTH ARE FLOORED, in row 92's manner and
   for its reason: a red run should say WHICH surface said it, and a walk over
   a region that painted nothing passes spotlessly. */
const fgCatsName = A.state.get().build.cats.name;
const fgMechsName = A.state.get().build.mechs.name;
function fgNamesBoth(list) {
  return list.filter((t) =>
    t.indexOf(fgCatsName) !== -1 && t.indexOf(fgMechsName) !== -1);
}
const fgLiveBoxes = fgStrip.querySelectorAll('.dc-live');
const fgLiveLeaves = [];
fgLiveBoxes.forEach((box) => { fgLeaves(box).forEach((t) => fgLiveLeaves.push(t)); });
const fgBothNamed = fgNamesBoth(fgLiveLeaves);
/* BOTH OF D-31's COLUMN ROOTS PER SIDE, WHICH WIDENS THIS ROW RATHER THAN
   MOVING IT. Until D-31 one root per side held every leaf the round surface
   drew. The round is two areas now, and reading only the picker's half would
   have left the state area — the side's name, its survivor reading, its
   battlefield labels and its team resources — permanently unscanned by the one
   row in this file that reads a LEAF for both faction names at once. That is
   the wave-1 lesson arriving on a layout change: a surface the walk never
   reaches reports clean for ever. Four roots in, one claim, unchanged. */
const fgGridLeaves = [];
['cats', 'mechs'].forEach((side) => {
  fgLeaves(fgSideRootOf(side)).forEach((t) => fgGridLeaves.push(t));
  fgLeaves(fgStateRootOf(side)).forEach((t) => fgGridLeaves.push(t));
});
const fgGridBothNamed = fgNamesBoth(fgGridLeaves);
check(
  '97. D-13 ON THE PAGE: no single leaf of the live fight reading NOR OF THE '
    + 'DECLARATION GRID names BOTH factions. Each region names each of them — '
    + 'once per side, in its own statement — and that is the whole of what D-13 '
    + 'permits; what it forbids is one sentence setting the two against each '
    + 'other. So the unit of this row is the LEAF and not the region. Probe AE '
    + 'rendered exactly that sentence and the entire repository stayed green '
    + 'over it, which is why this row exists — and D-27\'s grid is where the '
    + 'risk moved, because every picker row already names a unit on the '
    + 'opposing roster and a faction word is one edit away from being beside it',
  fgLiveBoxes.length === 1 && fgLiveLeaves.length >= 8 && fgBothNamed.length === 0
    && fgGridLeaves.length >= 40 && fgGridBothNamed.length === 0,
  'live reading boxes=' + fgLiveBoxes.length
    + ' leaf strings=' + fgLiveLeaves.length
    + ' | faction names read live=' + JSON.stringify([fgCatsName, fgMechsName])
    + ' | leaves naming both=' + JSON.stringify(fgBothNamed)
    + ' | grid leaf strings across both columns=' + fgGridLeaves.length
    + ' of which naming both=' + JSON.stringify(fgGridBothNamed)
);

/* 98. THE DEAD MARKER IS DRAWN FROM THE STORED FLAG, READ OFF THE PAGE. Probe
   AB drew it from `hp === 0` instead and the repository stayed green — because
   every row in this file that asserts D-00d reads STATE, and state is not what
   a student sees. Three readings, and the third is the direction a tidy
   implementation loses:
     a unit at ZERO HEALTH that nobody ruled draws as ALIVE — which is what
       keeps a Shield ruling representable;
     a unit at FULL HEALTH that a student ruled dead draws as DEAD;
     and a unit ruled dead and then ruled BACK returns to the first reading.
   Each is read as four things at once, because [C07]'s rule is that a state is
   said more than once and never in colour alone: the card's class, the toggle's
   aria-pressed, the token in the marker row, and the sentence beside it.

   AND A FIFTH READING, WHICH D-27 CREATED AND PLAN 05-16 ADDS. The four above
   are all on the BOARD tab's unit card. The overrule put a consequence of the
   same flag on the FIGHT tab: fgActionOff's first condition disables every
   action button of a unit the student ruled dead. So the stored flag now has a
   second rendered consequence, on a different tab, drawn by a different region
   — and it is EXACTLY the place the same wrong derivation would land, because
   `unit.hp === 0` is the tidy-looking test and it is the one D-00d forbids.

   IT IS READ IN BOTH DIRECTIONS, and the second is the one a tidy
   implementation loses: a unit RULED dead has its buttons out of reach, and a
   unit at ZERO HEALTH that nobody ruled has its buttons STILL LIVE. That second
   half is what keeps a Shield ruling playable — a student who says "she's on
   one shield point and still swinging" must be able to declare for her — and a
   grid that read the health instead of the flag would take the action away and
   the room would have to argue with the tool. It is a DISABLE rather than a
   marker, so nothing about it is said in words; the reading is the property.

   The ruled-back reading is taken on the grid too, so nothing here is sticky. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
function fgDeadRead(side, unitId) {
  const btn = fgAliveBtn(side, unitId);
  if (btn === null) { return null; }
  const line = btn.parentNode;
  const card = line.parentNode;
  const row = line.querySelectorAll('[data-amt="dead"]')[0] || null;
  const said = line.querySelectorAll('.dc-state')[0] || null;
  return {
    marked: String(card.className || '').indexOf('dc-card--dead') !== -1,
    pressed: btn.getAttribute('aria-pressed'),
    tokens: row === null ? -1 : row.children.length,
    saidShown: said === null ? null : (said.hidden === false),
    says: said === null ? null : said.textContent,
    enabled: btn.disabled !== true
  };
}
// THE FIFTH READING'S OWN HELPER: how many of a unit's action buttons on
// D-27's grid are out of reach. Read off the page, off the disabled property,
// never off the class and never off state.
function fgOffCount(side, unitId) {
  return fgSideRootOf(side).querySelectorAll('[data-fg="act"]')
    .filter((b) => b.dataset.fgBy === unitId && b.disabled === true).length;
}
function fgActCount(side, unitId) {
  return fgSideRootOf(side).querySelectorAll('[data-fg="act"]')
    .filter((b) => b.dataset.fgBy === unitId).length;
}
A.ops.dispatch('setUnitHp', { side: 'cats', unitId: 'c1', value: 0 });
A.state.flush();
const fgReadZeroAlive = fgDeadRead('cats', 'c1');
const fgZeroHp = A.state.get().fight.cats.units[0].hp;
const fgZeroOff = fgOffCount('cats', 'c1');
const fgZeroActs = fgActCount('cats', 'c1');
fgPress(fgAliveBtn('cats', 'c2'));
const fgReadFullDead = fgDeadRead('cats', 'c2');
const fgFullHp = A.state.get().fight.cats.units[1].hp;
const fgDeadOff = fgOffCount('cats', 'c2');
const fgDeadActs = fgActCount('cats', 'c2');
fgPress(fgAliveBtn('cats', 'c2'));
const fgReadBack = fgDeadRead('cats', 'c2');
const fgBackOff = fgOffCount('cats', 'c2');
check(
  '98. THE DEAD MARKER DRAWS THE STORED FLAG AND NEVER THE HEALTH, read OFF '
    + 'THE PAGE rather than out of state — because every other D-00d row in '
    + 'this file reads state, and probe AB proved a marker derived wrongly on '
    + 'the way to the screen leaves the whole repository green. A unit at zero '
    + 'health nobody ruled draws as standing, a unit at full health somebody '
    + 'ruled draws as marked, and a unit ruled and then ruled back returns to '
    + 'the first — that last is the direction a tidy implementation loses. Four '
    + 'readings each, because a state is said more than once and never in '
    + 'colour alone. AND A FIFTH READING, ON THE OTHER TAB, WHICH D-27 CREATED: '
    + 'the ruled unit\'s action buttons are ALL out of reach on the '
    + 'declaration grid and the zero-health unit nobody ruled has ALL of its '
    + 'buttons still live — which is what keeps a Shield ruling playable, and '
    + 'is the direction a grid reading the health instead of the flag would '
    + 'lose. It is a disable and not a marker, so the reading is the property',
  fgZeroHp === 0 && fgFullHp > 0
    && fgReadZeroAlive.marked === false && fgReadZeroAlive.pressed === 'false'
    && fgReadZeroAlive.tokens === 0 && fgReadZeroAlive.saidShown === false
    && fgReadFullDead.marked === true && fgReadFullDead.pressed === 'true'
    && fgReadFullDead.tokens === 1 && fgReadFullDead.saidShown === true
    && fgReadBack.marked === false && fgReadBack.pressed === 'false'
    && fgReadBack.tokens === 0 && fgReadBack.saidShown === false
    && fgReadZeroAlive.enabled === true && fgReadFullDead.enabled === true
    && fgZeroActs > 0 && fgZeroOff === 0
    && fgDeadActs > 0 && fgDeadOff === fgDeadActs && fgBackOff === 0,
  'c1 at health ' + fgZeroHp + ', nobody ruled=' + JSON.stringify(fgReadZeroAlive)
    + ' | c2 at health ' + fgFullHp + ', ruled dead=' + JSON.stringify(fgReadFullDead)
    + ' | c2 ruled BACK=' + JSON.stringify(fgReadBack)
    + ' | THE FIFTH READING, on the grid: c1 (zero health, nobody ruled) '
    + fgZeroOff + ' of ' + fgZeroActs + ' action buttons out of reach; '
    + 'c2 (ruled dead) ' + fgDeadOff + ' of ' + fgDeadActs
    + '; c2 ruled back ' + fgBackOff
);

/* 99. THE FOCUS CONTRACT OVER A REBUILT CHOOSER LIST, which is what replaces
   check 65's static-row shape on this one surface — [S06.7]'s banner argues at
   length why the declaration slots are NOT static markup (not one node in the
   region is a field, and MAX_DECLARATIONS is 48) and names this row as what it
   owes instead. The chooser is pressed, the region rebuilds under it, and the
   keyboard is read back on the node it was on: a DIFFERENT node object carrying
   the SAME key, which is withPreservedFocus doing exactly its job. */
/* THE CONTROL THIS ROW PRESSES MOVED WITH THE SURFACE (plan 05-14). The "who
   acts" chooser is gone; the node that rebuilds under a student now is an
   action button on a picker row, and it is the same claim about the same
   contract — press it, let the region rebuild, read the keyboard back.

   PLAN 05-16 RE-READ IT AND KEPT BOTH HALVES, and re-states here what this row
   does NOT see, because the reading is easy to over-claim. THE KEYBOARD PATH IS
   WHAT IS ASSERTED. The POINTER path drops focus to <body> on every rebuilding
   surface in this file — measured in real Chrome and real Edge on this grid, on
   plan 05-07's retired chooser and on plan 02-03's token picker, two phases
   older, which is what makes it a file-wide property rather than this region's
   regression. The mechanism is written out in deferred-items.md item 1:
   withPreservedFocus restores the keyboard during pointerdown and the browser's
   own default focus-on-mousedown then targets the node the rebuild has just
   detached. THIS ROW CANNOT SEE IT — the stub has no default focus-on-mousedown
   — and it is not this row's to fix; the fix lives in withPreservedFocus and
   would change how every rebuilding surface in the file behaves. What it costs
   is one Tab starting from the top of the document. Recorded here so a reader
   of a green row knows which of the two paths it is green about. */
const fgPickBefore = fgActBtnOf('cats', 'c1', fgCatsAct);
const fgPickKey = fgPickBefore.dataset.k;
fgPickBefore.focus();
fgPress(fgPickBefore);
const fgPickAfter = fgActBtnOf('cats', 'c1', fgCatsAct);
const fgFocusK = stub.activeElement && stub.activeElement.dataset
  ? stub.activeElement.dataset.k : null;
check(
  '99. AN ACTION-BUTTON PRESS REBUILDS THE PICKER GRID UNDER THE STUDENT AND '
    + 'THE KEYBOARD IS STILL ON THE CONTROL THEY WERE ON. The node is a '
    + 'DIFFERENT object and the key is the SAME, which is both halves of the '
    + 'claim: a row that only read the key would be green over a grid that '
    + 'never rebuilt, and a row that only read the node would be green over '
    + 'focus dropped to the body. This is what stands in for check 65 on this '
    + 'surface, and [S06.7]\'s own banner says why the rows are not static '
    + 'markup. It is the KEYBOARD path — the pointer path drops to <body> on '
    + 'every rebuilding surface in this file and is deferred-items item 1',
  fgPickAfter !== fgPickBefore && fgFocusK === fgPickKey
    && fgPickAfter.getAttribute('aria-pressed') === 'true',
  'key=' + JSON.stringify(fgPickKey)
    + ' | the node was replaced=' + (fgPickAfter !== fgPickBefore)
    + ' | the keyboard is on=' + JSON.stringify(fgFocusK)
    + ' | it reads as chosen=' + JSON.stringify(fgPickAfter.getAttribute('aria-pressed'))
);

/* 100. PROBE S's CHARACTER, DRIVEN ON THIS PHASE'S TWO SURFACES. Plan 04-05's
   probe S found that a narrowed fingerprint passed every share row except the
   one whose driving op CHANGES WHAT IS DRAWN WITHOUT MOVING A STEPPER. Two
   renames here, both of that character and neither touching a number:
     renaming an ACTION must move the name on every one of that side's action
       BUTTONS — the chooser pill this line used to name is gone, and D-27 put
       the same word on units x actions nodes instead;
     renaming a TOKEN TYPE must move an ALREADY-DRAWN ledger row — which is the
       narrower half, because that row was painted for a round that has already
       resolved and a fingerprint watching only the row COUNT never repaints it.
   Both names are put back afterwards.

   PLAN 05-16 RE-READ IT AND THE ROW'S CLAIM DID NOT MOVE — only what the first
   rename is drawn on did. The fingerprint under test is fgSig, which takes both
   whole slices, and the grid, the battlefield and the ledger all repaint off
   it; the fight bar's leaf walk therefore covers all three at once, because
   #fightbar is the root every one of them paints inside. That is why the reading
   is taken off the bar rather than off a node the redesign could move again. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
fgDeclare('cats', fgCatsAct, 'c1');
fgAdvancePress();
fgDeclare('cats', fgCatsAct, 'c2');
const fgBarTextWas = fgLeaves(fgBar).join('|');
const fgLdTextWas = fgLeaves(fgLedgerRoot).join('|');
const fgLdRowWas = fgLedgerRoot.querySelectorAll('.ld-row')[0];
const fgLdSaidWas = fgSaid(fgLedgerRoot).join('|');
const fgLdSaidCount = fgSaid(fgLedgerRoot).length;
A.ops.renameAction('cats', fgCatsAct, 'Pounce');
A.state.flush();
const fgBarTextNamed = fgLeaves(fgBar).join('|');
// THE TWO RENAMES ARE READ APART NOW, AND THE REASON IS A DEFECT IN THE ROW AS
// IT STOOD RATHER THAN A REFINEMENT OF IT. "the ledger moved" was captured after
// BOTH renames, so the clause was satisfied by the ACTION rename -- whose new
// word lands in the lane's own action lines -- and the token half of the row was
// carried by fgLdSaysNew alone. D-29 made that visible by taking the token name
// out of the lane's text, and this reading is taken between the two renames so
// the token half now has to move something on its own.
const fgLdTextMid = fgLeaves(fgLedgerRoot).join('|');
const fgLdSaidMid = fgSaid(fgLedgerRoot).join('|');
A.ops.renameTokenType('hp', 'Vigor');
A.state.flush();
const fgLdTextNamed = fgLeaves(fgLedgerRoot).join('|');
const fgLdSaidNamed = fgSaid(fgLedgerRoot).join('|');
const fgLdRowSame = fgLedgerRoot.querySelectorAll('.ld-row')[0] === fgLdRowWas;
const fgBarSaysNew = fgBarTextNamed.indexOf('Pounce') !== -1;
const fgLdSaysNew = fgLdSaidNamed.indexOf('Vigor') !== -1;
const fgLdTextSaysNew = fgLdTextNamed.indexOf('Vigor') !== -1;
const fgLdSaidMoved = fgLdSaidNamed !== fgLdSaidMid;
// AND IT IS ON EVERY BUTTON OF THAT SIDE, counted rather than found once. A
// rename that reached one node and missed the rest would satisfy an indexOf and
// leave a grid disagreeing with itself in front of a room.
const fgBtnsSayNew = fgSideRootOf('cats').querySelectorAll('.fg-act-name')
  .filter((n) => n.textContent === 'Pounce').length;
const fgBtnsForAct = fgSideRootOf('cats').querySelectorAll('[data-fg="act"]')
  .filter((b) => b.dataset.fgVal === fgCatsAct).length;
A.ops.renameTokenType('hp', 'Health');
A.state.flush();
check(
  '100. AN OP THAT CHANGES WHAT IS DRAWN WITHOUT MOVING A STEPPER REPAINTS '
    + 'BOTH FIGHT SURFACES — plan 04-05\'s probe S carried onto this phase, and '
    + 'the row plan 05-07 was told to record and plan 05-10 owes. CLAIM TURNED '
    + 'IN THE OPEN UNDER D-29: renaming a token type used to have to move the '
    + 'lane\'s TEXT, and under "show this using the symbols, rather than text" '
    + 'the lane no longer prints a type\'s name anywhere — it draws that '
    + 'type\'s own mark and says the name on hover. So this row reads the '
    + 'TOOLTIP channel, and reads it BETWEEN the two renames, which is strictly '
    + 'MORE than it asserted before: the old reading was captured after BOTH '
    + 'renames and its "the ledger moved" clause was satisfied by the ACTION '
    + 'rename\'s word landing in the lane\'s action lines, leaving the token '
    + 'half carried by an indexOf alone. Now the token rename must move the '
    + 'tooltips of an ALREADY-DRAWN row ON ITS OWN — the narrower half, '
    + 'because that row was painted for a round that has already resolved and a '
    + 'fingerprint watching only the row COUNT would never repaint it. Renaming '
    + 'an ACTION still moves the bar and still puts the new word on EVERY ONE of '
    + 'that side\'s buttons for it, counted rather than found once, because an '
    + 'action\'s name is text and D-29 did not touch it. The row NODE is the '
    + 'same object afterwards, so the region rewrote what it had rather than '
    + 'throwing the history away. AND THE NEW WORD IS ASSERTED ABSENT FROM THE '
    + 'TEXT, which is the clause that says the change actually happened rather '
    + 'than that a tooltip was added beside prose nobody removed. Floored on '
    + 'tooltips being FOUND in the lane at all, because a lane with none would '
    + 'have an empty channel that moved to another empty one',
  fgBarTextNamed !== fgBarTextWas && fgLdSaidMoved === true
    && fgBarSaysNew === true && fgLdSaysNew === true
    && fgLdTextSaysNew === false && fgLdRowSame === true
    && fgLdSaidWas !== '' && fgLdSaidCount > 0
    && fgBtnsForAct > 1 && fgBtnsSayNew === fgBtnsForAct,
  'the bar moved=' + (fgBarTextNamed !== fgBarTextWas)
    + ' and says the new action name=' + fgBarSaysNew
    + ' on ' + fgBtnsSayNew + ' of ' + fgBtnsForAct + ' buttons for that action'
    + ' | the lane carries ' + fgLdSaidCount + ' tooltips before any rename'
    + ' | they MOVED on the token rename alone=' + fgLdSaidMoved
    + ' and say the new token name=' + fgLdSaysNew
    + ' | the lane\'s TEXT says it=' + fgLdTextSaysNew
    + ' (its text moved on the ACTION rename=' + (fgLdTextMid !== fgLdTextWas) + ')'
    + ' | the already-drawn row is the same node=' + fgLdRowSame
);

/* 101. REF-03, EXTENDED RATHER THAN DUPLICATED. Check 62 asserts that starting
   a fight leaves every action card on the page while the setup-only Add button
   goes away. This takes the same reading on a board where a fight has actually
   been PLAYED — two rounds in the ledger and a declaration standing — because
   that is the state the requirement is about: the reference a student needs is
   needed most in the middle of a round, not at the moment the fight opens. The
   cards are read for their TEXT and not merely counted, because a card present
   and empty is a card that is not readable.

   AND AS OF PLAN 05-16 IT IS TAKEN ON THE FIGHT TAB, WHICH IS WHAT "THE FIGHT
   VIEW" NOW MEANS — AND TAKING IT THERE FOUND SOMETHING. REF-03 is "readable
   without leaving the fight view", and until plan 05-12 there was only one
   view, so the requirement had nothing to bite on: any reading of the cards was
   a reading in the fight view by default. The switch made it a real question
   for the first time, and this row is the first thing in the repository to ask
   it.

   ==========================================================================
   THE FINDING, RECORDED RATHER THAN ASSERTED AROUND. Measured here: with the
   view on the fight, all SIX action cards sit inside a roster column and NONE
   is inside #refband. `#app[data-view="fight"] .brd-col{display:none}` hides
   those columns. SO THE PER-ACTION REFERENCE — the card that says what Lasers
   does and what it costs — IS NOT ON THE FIGHT TAB. What survives the switch is
   #refband, which is a child of #board rather than of a column and carries the
   counter map; and #strip, for the same reason.

   THIS IS NOT THIS PLAN'S TO FIX AND IT IS NOT FIXED HERE. The cards are
   appended by buildColumn, which is plan 02-01's function carrying plan
   03-05's named cross-plan edit — and that edit's own paragraph says in as many
   words why they went into the column: "a student reading what Lasers does
   needs it at least as much mid-fight as mid-build — which is REF-03, in Phase
   5." The premise held for three phases and plan 05-12 changed it without
   anything going red, because nothing in this repository read the cards WITH A
   VIEW. The measurement and the two candidate fixes are in
   deferred-items.md item 4; this plan edits cats-vs-mechs.html not at all.

   SO THE ROW ASSERTS THE DEFECT IN THE DIRECTION IT IS TRUE, which is 95's
   turned-in-the-open treatment and 72b's rule against quietly weakening a
   boundary. `all six inside a column, none in the band` is asserted, so the
   day somebody moves them THIS ROW GOES RED and whoever moved them reads this
   paragraph. A row that had simply stopped counting them would have been the
   fourth green row in this file over a surface nobody was watching.
   ==========================================================================

   THIS ROW AND CHECK 103b ARE THE TWO HALVES OF REF-03 AND NEITHER IS THE
   OTHER. 103b asserts that #refband is not INSIDE either side of the switch —
   a structural claim about the markup, and it is the half that HOLDS. This
   asserts what a student can actually read mid-round with the view on the
   fight, and it is the half that does not. A surface can pass either one and
   fail the other, which is exactly what it is doing today. */
const fgRefView = String(fgApp.dataset.view || '');
const fgRefCards = fgBoard.querySelectorAll('.ref-card');
const fgRefLeaves = fgRefCards.reduce((n, card) => n + fgLeaves(card).length, 0);
const fgRefInBand = dom.byId['refband'].querySelectorAll('.ref-card').length;
const fgRefInCols = dom.byId['col-cats'].querySelectorAll('.ref-card').length
  + dom.byId['col-mechs'].querySelectorAll('.ref-card').length;
// AND WHAT DOES SURVIVE THE SWITCH, read rather than assumed: #refband's own
// content. It is a child of #board and not of a column, so the fight view's
// `.brd-col{display:none}` does not reach it.
const fgBandLeaves = fgLeaves(dom.byId['refband']).length;
const fgAddButtons = stub.querySelectorAll('.brd-add').length;
const fgLdRowsNow = fgLedgerRoot.querySelectorAll('.ld-row').length;
check(
  '101. REF-03 WITH A FIGHT ACTUALLY BEING PLAYED, AND ON THE FIGHT TAB. Check '
    + '62 reads the cards at the moment a fight starts; this reads them with '
    + 'rounds in the ledger, a declaration standing and THE VIEW ON THE FIGHT — '
    + 'which is when a student actually reaches for them, and which is what '
    + '"the fight view" means now that plan 05-12 built a switch. The cards are '
    + 'read for their TEXT rather than counted, because a card present and '
    + 'empty is a card nobody can read; and the setup-only Add button is still '
    + 'gone. AND IT RECORDS WHERE THEY ARE, WHICH IS THE FINDING THIS ROW WENT '
    + 'LOOKING FOR: all six sit inside a roster COLUMN and none inside '
    + '#refband, and the fight view hides those columns — so the per-action '
    + 'reference is NOT on the fight tab today. That is asserted in the '
    + 'direction it is TRUE, so the day somebody moves them this row reddens '
    + 'and the paragraph above it gets read; the measurement and the two '
    + 'candidate fixes are deferred-items item 4. What DOES survive the switch '
    + 'is #refband, whose own content is read here too',
  fgRefView === 'fight'
    && fgRefCards.length === 6 && fgRefLeaves >= 12 && fgAddButtons === 0
    && fgRefInBand === 0 && fgRefInCols === fgRefCards.length
    && fgBandLeaves > 0
    && fgLdRowsNow >= 1,
  'the view while this reading is taken=' + JSON.stringify(fgRefView)
    + ' | action and reference cards on the board=' + fgRefCards.length
    + ' of which inside #refband=' + fgRefInBand
    + ' and inside a roster column (which the fight view hides)=' + fgRefInCols
    + ' | leaf strings read out of those cards=' + fgRefLeaves
    + ' | leaf strings still readable in #refband on the fight tab='
    + fgBandLeaves
    + ' | setup-only Add buttons=' + fgAddButtons
    + ' | rounds in the ledger=' + fgLdRowsNow
);

/* 102. THE PHASE'S OWN ACCEPTANCE RUN, and it is a RUN rather than a list of
   assertions — plan 04-07's shape, and it lives here rather than in [S09] for
   16a's reason: every [S09.*] row this phase wrote sits above a no-DOM bracket,
   so every surface assertion the phase makes has to live in this file or
   nowhere.

   A fight a student would recognise, driven end to end through real presses on
   real controls: start it, declare for BOTH sides naming a performer and
   something to point at, advance, and read SIX values back OFF THE PAGE — the
   round, both pools, one unit's health, the ledger's row count and the
   what-changed reading. Then a hand ruling and its marker; a unit ruled dead
   and still in its own column; an undo that brings the board back; and a fight
   reset that leaves the build standing, which is SHARE-07.

   NOT ONE VALUE BELOW IS READ OUT OF STATE. The state is read once, at the end,
   and only to say that the build survived the reset — which is a claim about a
   slice the page does not draw.

   ==========================================================================
   PLAN 05-16 RE-DROVE EVERY PRESS THROUGH D-27's GRID, AND ADDED THE THREE
   THINGS THE OLD RUN COULD NOT DO.

   1. TWO DECLARATIONS OF TWO DIFFERENT KINDS. One is a SINGLE press that lands
      on the tool's own default; the other is retargeted through the
      change-target control and a click on the opposing battlefield. The old run
      made two presses of the same kind, which would have been green over a
      surface where the retarget did nothing at all.

   2. THE DEFAULT IS READ BACK AGAINST THE DERIVATION THAT PRODUCED IT. The
      record's `at` is compared with App.model.defaultAt's own answer on the
      same board, so the run asserts that the surface USES the shipped
      derivation rather than re-implementing "lowest health" beside it. Two
      implementations of one rule is how a room ends up arguing with a tool that
      disagrees with itself.

   3. THE SPOKEN-FOR READING, VERBATIM, THROUGH FOUR MOMENTS — and this is
      limitations entry 30 closed by measurement rather than by assertion. The
      entry recorded that the reading this run printed back measured ZERO at
      every observable moment, because advanceRound spends and refills in the
      same commit. THAT IS STILL TRUE AND IT IS STILL PRINTED, because it is a
      shipped fact about the TOPBAR pair and the gate should stay on the record
      about it. What is new is that D-27 built a SECOND pair, on the grid, that
      answers a different question — what this round's declarations have SPOKEN
      FOR — and that one MOVES. It is read here before a declaration, after it,
      after an undo of it, and after the re-declaration, so the movement is a
      reading in the evidence rather than a claim in a comment.

   BOTH PAIRS ARE PRINTED AND NEITHER IS THE OTHER, which is the artifact's own
   division said back to it: the topbar pair follows a student across the view
   switch and reports the pool; the grid pair sits above the picker and reports
   the intent. A run that printed only one of them would be a run that had
   quietly picked a side in a question the developer answered.

   ==========================================================================
   PROBE AU — WHY THE READING IS PRINTED RATHER THAN ASSERTED, MEASURED. The
   obvious tidy-up of this row is to compare the reading against an expected
   string instead of printing it. That was DRIVEN rather than argued about, and
   it costs three things, in ascending order of how quiet they are:

     AU(a)  the substitution is INVISIBLE on the shipped board. Hard-coding
            "Action points 0 of 3 spoken for 3 left to spend" and dropping the
            four comparisons leaves the run at 1216 passed, 0 failed and the
            gate at 180 of 180. Nothing says anything.
     AU(b)  it couples the gate to a DEFAULT rather than to a behaviour. With
            the cats' pool set to 5 — a board any student can make in two
            presses — the hard-coded row goes red at 179 of 180 while the
            surface is behaving perfectly. Worse than the redness: the evidence
            line then reads `the spoken-for reading matched the expected
            string=true`, because a row that asserts a string has no reading
            left to print. A red row whose evidence cannot show what made it
            red is a row somebody edits rather than reads.
     AU(c)  IT SILENTLY STOPS ASSERTING THE UNDO. A hard-coded expectation has
            nothing to compare the undone moment against, so the undo clause
            goes with it — and a run that never presses undo at all then passes
            SPOTLESSLY: 180 of 180. The same removal against the verbatim form
            is 179 of 180, because `undone === idle` fails. That is the whole
            argument in two numbers: half of FIGHT-09 is the reading coming
            BACK, and an assertion about a string cannot see a direction.

   So the reading is read back verbatim, in both directions, and the probe is
   recorded here rather than only in a summary — because the next reader of
   this row will have the same tidy-up idea. */
A.ops.resetToDefaults();
A.state.flush();
clearPanel();
const accBuildWas = JSON.stringify(A.state.get().build);
fgPress(fgStart);
const accStarted = A.state.get().fight !== null;
// THE TWO READINGS, EACH OFF ITS OWN NODE. accPool* is the TOPBAR pair, which
// follows a student across the view switch; accTeam* is the GRID pair, which
// says what this round's declarations have spoken for. Read as raw text, so
// what the evidence prints is what a room sees.
function accTeam(side) {
  return fgLeaves(fgOne(fgStateRootOf(side), '.fg-team')).join(' ');
}
/* ==========================================================================
   D-33 P1-1 — THE TOPBAR CLAUSE OF THIS ROW IS TURNED, IN THE OPEN.
   ==========================================================================
   WHAT THIS ROW ASSERTED AND PRINTED, in its own words: "the TOPBAR pair is
   printed beside it still reading zero, which is the shipped fact this gate
   stays on the record about." It printed `0 of 3 spent  3 left to spend` at
   every moment while the card beside it printed `3 of 3 spoken for  0 left to
   spend`, and this row was GREEN over the pair, because the only clause it made
   about the topbar was `accPoolCats !== ''`.

   THE AUDIT PHOTOGRAPHED WHAT THAT COST: two figures for one pool, 770px apart
   on one screen, disagreeing — and the one a room was looking at was the one
   that never moved. D-33 P1-1 makes both surfaces print [S06.7]'s fgPoolWords
   over the one spokenForPools walk fightBar already takes.

   SO THE CLAUSE BECOMES ITS OPPOSITE AND STOPS BEING A FLOOR. The topbar pair
   is read at the SAME FIVE MOMENTS as the card and must carry the CARD'S OWN
   ap-row reading at every one of them. That is strictly more than "not empty":
   a bar that went blank fails, a bar that froze on one figure while the card
   moved fails, and a bar that printed a different arithmetic for the same pool
   — which is exactly what shipped for two plans — fails. Read as raw text off
   both nodes, never compared against a string typed here, for PROBE AU's
   recorded reason one paragraph down. */
function accPool(side) { return fgLeaves(dom.byId['pool-' + side]).join(' '); }
function accTeamApRow(side) {
  return fgLeaves(fgOne(fgStateRootOf(side), '.fg-res')).join(' ');
}
// A pair of readings AGREE when the bar's line carries the card's line whole.
// The bar leads with the faction's name and the card does not — that is the one
// difference between them and it is the reason this is a containment and not an
// equality.
function accAgree(side) {
  const card = accTeamApRow(side);
  return card !== '' && accPool(side).indexOf(card) !== -1;
}
const accTeamIdle = accTeam('cats');
const accPoolIdle = accPool('cats');
const accAgreeIdle = accAgree('cats');

// DECLARATION ONE: a SINGLE press, and the tool points it at the lowest-health
// living enemy. Read the target off the RECORD and against the derivation that
// produced it, so this run asserts the surface uses App.model.defaultAt rather
// than carrying a second answer to "lowest health" of its own.
fgDeclare('cats', fgCatsAct, 'c1');
const accTeamSpoken = accTeam('cats');
const accPoolSpoken = accPool('cats');
const accAgreeSpoken = accAgree('cats');
const accRec1 = A.state.get().fight.decl
  .filter((d) => d.side === 'cats' && d.by === 'c1')[0] || null;
// THE DERIVATION TAKES THE FIGHT SLICE AND NOT THE WHOLE STATE, which this row
// got wrong on its first run and which is worth a line rather than a silent
// fix: passing the whole state returns null, and a run comparing the record
// against null would have been red for a reason that had nothing to do with
// the surface. It is called with the same argument [S06.7] calls it with.
const accDefaultSaid = A.model.defaultAt(A.state.get().fight, 'cats');
const accLandsSaid = fgLandsOn('cats', 'c1');

// AND THE READING COMES BACK WHEN THE DECLARATION IS UNDONE, through the topbar
// control a student presses. This is the pair moving in BOTH directions, which
// is the half a row reading it only after a declaration would be green without.
fgPress(fgUndoBtn);
const accTeamUndone = accTeam('cats');
const accPoolUndone = accPool('cats');
const accAgreeUndone = accAgree('cats');
fgDeclare('cats', fgCatsAct, 'c1');
const accTeamAgain = accTeam('cats');
const accAgreeAgain = accAgree('cats');

// DECLARATION TWO: the other kind. Declared on the mechs' side and then
// RETARGETED — press the change-target control, then click a shape on the
// opposing battlefield. Every press a real press on a real control.
fgDeclare('mechs', fgMechsAct, 'm1');
const accRec2Was = A.state.get().fight.decl
  .filter((d) => d.side === 'mechs' && d.by === 'm1')[0] || null;
const accAtBtn = fgAtBtnOf('mechs', 'm1');
if (accAtBtn !== null) { fgPress(accAtBtn); }
const accLitCount = fgStateRootOf('cats').querySelectorAll('[data-fg="bf"]')
  .filter((n) => String(n.className || '').indexOf('bf-unit--lit') !== -1).length;
const accPickTarget = A.state.get().fight.cats.units[
  A.state.get().fight.cats.units.length - 1].id;
const accBfNode = fgStateRootOf('cats').querySelectorAll('[data-fg="bf"]')
  .filter((n) => n.dataset.fgVal === accPickTarget)[0] || null;
if (accBfNode !== null) { fgPress(accBfNode); }
const accRec2Now = A.state.get().fight.decl
  .filter((d) => d.side === 'mechs' && d.by === 'm1')[0] || null;
const accLandsRetargeted = fgLandsOn('mechs', 'm1');

// TWO DECLARATIONS STANDING, COUNTED OFF THE PAGE. The separate "Declared so
// far" list is gone — the pressed button IS the declaration now — so what this
// counts is the buttons reading as pressed. Same claim, same number, read off
// the control that carries it instead of off a second spelling of it.
const accDeclLines = fgSideRootOf('cats').querySelectorAll('[data-fg="act"]')
  .filter((b) => b.getAttribute('aria-pressed') === 'true').length
  + fgSideRootOf('mechs').querySelectorAll('[data-fg="act"]')
    .filter((b) => b.getAttribute('aria-pressed') === 'true').length;
fgAdvancePress();
const accTeamResolved = accTeam('cats');
const accPoolResolved = accPool('cats');
const accAgreeResolved = accAgree('cats');

// THE SIX, off the page.
const accRound = dom.byId['round-count'].textContent;
const accPoolCats = fgLeaves(dom.byId['pool-cats']).join('');
const accPoolMechs = fgLeaves(dom.byId['pool-mechs']).join('');
// AND THE OTHER SIDE'S PAIR, because a bar wired for one side and left alone
// for the other is a defect a run reading only the cats' bar is green over.
const accAgreeMechs = accAgree('mechs');
const accHpRow = fgBoard.querySelectorAll('.tok-row')
  .filter((r) => r.dataset.amt === 'hp' && r.dataset.unit === 'm1')[0];
const accHealth = accHpRow ? accHpRow.children.length : -1;
const accLedgerRows = ldReal(fgLedgerRoot);
const accWaitAfterOne = ldWaiting(fgLedgerRoot);
const accWhatChanged = fgLeaves(fgOne(fgLedgerRoot, '.ld-now-body')).join(' ');

/* A HAND RULING, and its marker read off the card rather than out of the round.

   AND A FINDING THIS ROW HAD TO BE REWRITTEN AROUND, recorded here rather than
   asserted around: THE HEALTH ROW ON A UNIT CARD DRAWS THE BUILD'S ALLOCATION
   AND NOT THE FIGHT'S LIVE HEALTH, during a fight as much as before one.
   amountFor's `hp` arm reads unit.maxHp off state.build, which is FIGHT-10's
   division stated one region over in as many words — "the steppers on the
   board still edit the build" — so a ruling that moves the FIGHT's health by
   one moves no number on that card at all. What it DOES move is the marker
   beside it and the what-changed reading in the ledger, and both are asserted
   here. The board's own health row is asserted to be UNMOVED, so a later plan
   that points it at the fight slice reddens this row rather than shipping a
   second, silent answer to what a health number on this board means. Whether
   the marker reads as being about the fight when the number beside it is not
   is a rehearsal item, and it is on the list below by number. */
const accWhatChangedWas = accWhatChanged;
A.ops.dispatch('setUnitHp', { side: 'mechs', unitId: 'm1', value: 7 });
A.state.flush();
const accHandMark = fgBoard.querySelectorAll('.dc-hand')
  .filter((n) => n.dataset.dcUnit === 'm1' && n.dataset.dcHand === 'hp')[0] || null;
const accMarkShown = accHandMark !== null && accHandMark.hidden === false;
const accMarkSays = accHandMark === null ? null : accHandMark.getAttribute('aria-label');
const accHealthRuled = accHpRow ? accHpRow.children.length : -1;
const accWhatChangedNow = fgLeaves(fgOne(fgLedgerRoot, '.ld-now-body')).join(' ');

// A UNIT RULED DEAD IS STILL ON THE ROSTER — FIGHT-06, read as a card in its
// own column rather than as a flag.
const accCardsWas = dom.byId['col-cats'].querySelectorAll('.unit-card').length;
fgPress(fgAliveBtn('cats', 'c1'));
const accCardsNow = dom.byId['col-cats'].querySelectorAll('.unit-card').length;
const accDeadRead = fgDeadRead('cats', 'c1');

// UNDO, through the topbar control a student presses.
const accBoardBeforeUndo = fgLeaves(dom.byId['col-cats']).join('|');
fgPress(fgUndoBtn);
const accBoardAfterUndo = fgLeaves(dom.byId['col-cats']).join('|');
const accUndoRead = fgDeadRead('cats', 'c1');

// AND THE FIGHT RESET, which is SHARE-07: the rosters go back and the build is
// untouched. Read off the page for the fight and off state for the build,
// because the build slice is not what the fight page draws.
fgPress(fgOne(fgBar, '[data-fg="reset"]'));
const accResetRound = dom.byId['round-count'].textContent;
const accResetRows = ldReal(fgLedgerRoot);
// AND THE PLACEHOLDER IS BACK, which is the half of D-33 P1-5's contract only a
// reset can reach: the lane returns to having no history, so it returns to
// saying so. A fight reset that left an empty lane under a heading would be the
// audit's finding arriving through the one door that clears `past` without
// ending the fight.
const accWaitAfterReset = ldWaiting(fgLedgerRoot);
const accResetCards = dom.byId['col-cats'].querySelectorAll('.unit-card').length;
const accBuildSurvived = JSON.stringify(A.state.get().build) === accBuildWas;
check(
  '102. PHASE 5\'S OWN ACCEPTANCE RUN, RE-DRIVEN THROUGH D-27\'s GRID. A fight '
    + 'is started; ONE side declares in a SINGLE press and the tool points it '
    + 'at the lowest-health living enemy, read back off the record AND against '
    + 'App.model.defaultAt\'s own answer so the surface is using the shipped '
    + 'derivation rather than a second one; the OTHER side declares and is then '
    + 'RETARGETED through the change-target control and a click on the opposing '
    + 'battlefield; and the round is advanced — every one of them a real press '
    + 'on a real control. THE GRID\'S SPOKEN-FOR READING IS PRINTED VERBATIM '
    + 'THROUGH FIVE MOMENTS — idle, declared, undone, declared again, resolved '
    + '— so FIGHT-09 is closed by a reading that MOVES rather than by an '
    + 'assertion about one, and THE TOPBAR PAIR IS READ AT THE SAME FIVE '
    + 'MOMENTS AND MUST CARRY THE CARD\'S OWN LINE AT EVERY ONE OF THEM. '
    + 'THAT CLAUSE IS TURNED IN THE OPEN UNDER D-33 P1-1 AND IT USED TO SAY '
    + 'THE OPPOSITE: what stood here was "the TOPBAR pair is printed beside it '
    + 'still reading zero, which is the shipped fact this gate stays on the '
    + 'record about", and the only assertion under it was that the bar was not '
    + 'EMPTY. So the bar printed "0 of 3 spent, 3 left to spend" while the card '
    + '770px below it printed "3 of 3 spoken for, 0 left to spend" about the '
    + 'same pool in the same frame, and this row was green over the pair for '
    + 'two plans — until the audit photographed it. Both surfaces go through '
    + '[S06.7]\'s fgPoolWords now, over the one spokenForPools walk fightBar '
    + 'already takes, so there is no second arithmetic left for them to '
    + 'disagree through — and the agreement is asserted rather than assumed, on '
    + 'BOTH sides, because a bar wired for the cats and left alone for the '
    + 'mechs passes a run that reads one of them. It is strictly more than the '
    + 'floor it replaces: a blank bar fails, a bar frozen on one figure while '
    + 'the card moves fails, and a bar running a different arithmetic for one '
    + 'pool fails. Then SIX '
    + 'values are read back OFF THE PAGE and not out of state: the round on the '
    + 'bar, both pools, one unit\'s health row, the ledger\'s row count and the '
    + 'what-changed reading. A hand ruling puts a marker on the card of the '
    + 'unit it names and moves the what-changed reading, while the health row '
    + 'beside that marker does NOT move — because that row draws the BUILD '
    + 'allocation, which is FIGHT-10 division, asserted here so a later plan '
    + 'pointing it at the fight slice reddens rather than shipping a second, '
    + 'silent answer to what a health number on this board means; '
    + 'a unit ruled dead is still a card in its own column; one press of the '
    + 'topbar undo brings the board back; and the fight reset puts the rosters '
    + 'back with the student\'s build untouched, which is SHARE-07. AND D-33 '
    + 'P1-5\'s PLACEHOLDER IS READ AT BOTH ENDS: gone once a round has '
    + 'resolved, and BACK after the fight reset - which is the one door that '
    + 'empties `past` without ending the fight, and therefore the only place '
    + 'the placeholder can be lost without any other row noticing',
  accStarted === true && accDeclLines === 2
    && accRec1 !== null && accRec1.at === accDefaultSaid
    && accDefaultSaid !== null && accLandsSaid !== null && accLandsSaid !== ''
    && accTeamSpoken !== accTeamIdle && accTeamUndone === accTeamIdle
    && accTeamAgain === accTeamSpoken && accTeamResolved === accTeamIdle
    && accRec2Was !== null && accRec2Now !== null
    && accLitCount > 0 && accRec2Now.at === accPickTarget
    && accRec2Now.at !== accRec2Was.at
    && accRound === '2' && accPoolCats !== '' && accPoolMechs !== ''
    && accAgreeIdle === true && accAgreeSpoken === true
    && accAgreeUndone === true && accAgreeAgain === true
    && accAgreeResolved === true && accAgreeMechs === true
    && accPoolSpoken !== accPoolIdle && accPoolUndone === accPoolIdle
    && accPoolResolved === accPoolIdle
    && accHealth >= 0 && accLedgerRows === 1 && accWaitAfterOne === 0
    && accWhatChanged !== ''
    && accMarkShown === true && accHealthRuled === accHealth
    && accWhatChangedNow !== accWhatChangedWas
    && accCardsNow === accCardsWas && accDeadRead.marked === true
    && accBoardAfterUndo !== accBoardBeforeUndo && accUndoRead.marked === false
    && accResetRound === '1' && accResetRows === 0 && accWaitAfterReset === 1
    && accResetCards === accCardsWas && accBuildSurvived === true
    && errPanel.hidden === true,
  'declaration lines on the page=' + accDeclLines
    + ' | DECLARATION ONE, one press: the record says at='
    + JSON.stringify(accRec1 === null ? null : accRec1.at)
    + ' and App.model.defaultAt says ' + JSON.stringify(accDefaultSaid)
    + '; the row reads ' + JSON.stringify(accLandsSaid)
    + ' | DECLARATION TWO, retargeted by real presses: '
    + JSON.stringify(accRec2Was === null ? null : accRec2Was.at) + ' -> '
    + JSON.stringify(accRec2Now === null ? null : accRec2Now.at)
    + ' with ' + accLitCount + ' opposing shapes lit at the moment of the click'
    + '; the row now reads ' + JSON.stringify(accLandsRetargeted)
    + ' | THE SPOKEN-FOR READING, VERBATIM, THROUGH FIVE MOMENTS: idle '
    + JSON.stringify(accTeamIdle) + ' -> declared ' + JSON.stringify(accTeamSpoken)
    + ' -> undone ' + JSON.stringify(accTeamUndone)
    + ' -> declared again ' + JSON.stringify(accTeamAgain)
    + ' -> resolved ' + JSON.stringify(accTeamResolved)
    + ' | THE TOPBAR PAIR AT FOUR OF THE SAME MOMENTS, VERBATIM: idle '
    + JSON.stringify(accPoolIdle) + ' -> declared ' + JSON.stringify(accPoolSpoken)
    + ' -> undone ' + JSON.stringify(accPoolUndone)
    + ' -> resolved ' + JSON.stringify(accPoolResolved)
    + ' | the bar carries the card\'s line: idle=' + accAgreeIdle
    + ' declared=' + accAgreeSpoken + ' undone=' + accAgreeUndone
    + ' again=' + accAgreeAgain + ' resolved=' + accAgreeResolved
    + ' mechs=' + accAgreeMechs
    + ' | THE SIX: round=' + JSON.stringify(accRound)
    + ' cats pool=' + JSON.stringify(accPoolCats)
    + ' mechs pool=' + JSON.stringify(accPoolMechs)
    + ' m1 health tokens=' + accHealth
    + ' ledger rounds=' + accLedgerRows
    + ' placeholder after one round=' + accWaitAfterOne
    + ' placeholder after the reset=' + accWaitAfterReset
    + ' what changed=' + JSON.stringify(accWhatChanged)
    + ' | the hand marker is shown=' + accMarkShown
    + ' and says ' + JSON.stringify(accMarkSays)
    + ' | the health row beside it is the BUILD allocation and did not move: '
    + accHealth + ' -> ' + accHealthRuled
    + ' | the what-changed reading DID move: ' + JSON.stringify(accWhatChangedNow)
    + ' | cards before/after ruling a unit dead=' + accCardsWas + '/' + accCardsNow
    + ' and it draws as marked=' + accDeadRead.marked
    + ' | the undo moved the board=' + (accBoardAfterUndo !== accBoardBeforeUndo)
    + ' and the unit draws as standing again=' + (accUndoRead.marked === false)
    + ' | after the fight reset: round=' + JSON.stringify(accResetRound)
    + ' ledger rows=' + accResetRows + ' cards=' + accResetCards
    + ' build byte-identical=' + accBuildSurvived
);

A.ops.resetToDefaults();
A.state.flush();
clearPanel();

/* --- THE VIEW SWITCH (D-27, PROJ-05, REF-03, UX-02 — plan 05-12). Three rows,
   and each one answers a probe rather than a hope, which is the standard
   [S06.8]'s and [S06.9]'s banners set for their own:

     103   probe AJ writes the view into state.ui. A row that read only the
           attribute back would be spotlessly green over it.
     103b  probe AK moves #strip inside .fg-band. A row that read a comment
           would be spotlessly green over that too.
     103c  the between-the-edges clause, which is the one a tidy implementation
           loses and the one a student mid-fight notices.  --- */

const vwRoot = dom.byId['views'];
const vwBuildBtn = dom.byId['view-build'];
const vwFightBtn = dom.byId['view-fight'];
const vwRefband = dom.byId['refband'];

function vwRead() {
  return {
    view: String(fgApp.dataset.view || ''),
    build: vwBuildBtn.getAttribute('aria-pressed') + ' ' + vwBuildBtn.className,
    fight: vwFightBtn.getAttribute('aria-pressed') + ' ' + vwFightBtn.className
  };
}
function vwSaysOn(entry) {
  return entry.indexOf('true ') === 0 && entry.indexOf('vw-on') !== -1;
}
function vwSaysOff(entry) {
  return entry.indexOf('false ') === 0 && entry.indexOf('vw-on') === -1;
}

const vwStateWas = JSON.stringify(A.state.get());
const vwAtRest = vwRead();
fgPress(vwFightBtn);
const vwOnFight = vwRead();
const vwStateMid = JSON.stringify(A.state.get());
fgPress(vwBuildBtn);
const vwOnBuild = vwRead();
const vwStateNow = JSON.stringify(A.state.get());
// T-05-47 read off the page rather than off the markup comment: a control here
// wearing a data-act would be routed into App.ops.dispatch by [S07.1], which is
// the one way page work becomes state work without anybody deciding to make it.
const vwActsInside = vwRoot.querySelectorAll('[data-act]').length
  + ((typeof vwRoot.dataset.act === 'string' && vwRoot.dataset.act !== '') ? 1 : 0);
const vwPrivate = vwRoot.querySelectorAll('[data-vw]').length;
check(
  '103. THE SWITCH MOVES THE PAGE AND MOVES NOTHING ELSE. Each control is '
    + 'pressed in turn and four things are read back: #app\'s data-view, both '
    + 'controls\' aria-pressed, both controls\' class, and the WHOLE state '
    + 'serialised before and after. The state must be byte-identical across '
    + 'both presses, and that clause is the row — checks 72 and 73\'s shape, '
    + 'because a row that read only the attribute would be green over a switch '
    + 'that also wrote into a slice, and a view that lived in state would ride '
    + 'in a build code and step under undo. Neither control carries a data-act, '
    + 'read off the page too: one would be routed into App.ops.dispatch by '
    + '[S07.1] whatever this region intended. Floored on the two private '
    + 'controls being found, because a switch with no controls at all passes '
    + 'spotlessly',
  vwAtRest.view === 'build'
    && vwOnFight.view === 'fight'
    && vwSaysOn(vwOnFight.fight) && vwSaysOff(vwOnFight.build)
    && vwOnBuild.view === 'build'
    && vwSaysOn(vwOnBuild.build) && vwSaysOff(vwOnBuild.fight)
    && vwStateWas === vwStateMid && vwStateWas === vwStateNow
    && vwActsInside === 0 && vwPrivate === 2,
  'at rest=' + JSON.stringify(vwAtRest)
    + ' | after pressing the fight=' + JSON.stringify(vwOnFight)
    + ' | after pressing the board=' + JSON.stringify(vwOnBuild)
    + ' | state byte-identical across press one=' + (vwStateWas === vwStateMid)
    + ' and across press two=' + (vwStateWas === vwStateNow)
    + ' | state length=' + vwStateWas.length
    + ' | data-act under #views=' + vwActsInside
    + ' | data-vw controls=' + vwPrivate
);

/* 103b. PROJ-05 AND REF-03, READ OFF THE DOM AND OFF THE MARKUP RATHER THAN OFF
   A COMMENT.

   ==================================================================
   THIS ROW'S CLAIM WAS TURNED BY D-28 AND THE OLD CLAIM IS WRITTEN OUT
   BEFORE THE NEW ONE. Plan 05-D28.
   ==================================================================
   WHAT IT ASSERTED, plan 05-12's: neither #strip nor #refband has #views as an
   ancestor, both are still inside #board, and the band's own markup slice
   carries neither spelling. Read as a whole with plan 05-12's summary, the row
   stood for a stronger sentence than it literally checked — that the projection
   is READABLE in the fight view without navigating away, in its Phase 3 box, on
   arrival.

   WHAT D-28 SAYS, verbatim: "The predictor turn off, and make it toggled
   sidebar / pop over". So the projection is NOT on the default fight view any
   more, and PROJ-05's "readable without navigating away" is read as satisfied
   by ONE toggle press — the developer's call, flagged once in the redirect
   record and taken there rather than here.

   WHAT THIS ROW ASSERTS NOW, and the reason it is turned rather than deleted:
   the STRUCTURAL claim is not weakened by D-28, it is what D-28 depends on. The
   sidebar is #strip itself, so #strip must still be the node inside #board that
   [S06.3] paints and check 103d reads — a plan that answered D-28 by building a
   second panel in the fight band would leave a projection that agrees with the
   board only for as long as somebody keeps two surfaces in step, and probe AK
   measured that the WHOLE SUITE stays green over the strip being moved into the
   band. So both halves stand exactly as they were, and the markup half gains
   one clause: [C15]'s slice must carry BOTH of D-28's rules — the one that
   takes the projection off the default fight view AND the one that brings it
   back. A file with only the first is a projection a student cannot reach, and
   it is one deleted line away at all times.

   The switch is allowed to put the two roster columns away and it is
   allowed to put the fight band away. It is NOT allowed to take the projection
   or the reference band OUT OF #board, because PROJ-05 wants the projection
   visible AT THE MOMENT the fight contradicts it and REF-03 wants
   reference material readable without leaving the fight view.

   TWO HALVES, AND THE SPLIT IS AN HONEST ONE RATHER THAN A BELT-AND-BRACES
   FLOURISH. The stub page can answer "is #views an ancestor" and "is #board an
   ancestor" because it models both. It CANNOT answer the .fg-band half at all:
   the band is a class-only wrapper with no id, plan 05-06 deliberately did not
   build it here, and section 5b only gates ids — so a walk for it in this page
   would find nothing and pass spotlessly forever. The markup half closes that
   by slicing cats-vs-mechs.html between the band's own two markers, which is
   the shape check 63's REF_OPEN/REF_CLOSE slice already ships. Both halves are
   floored on the thing they read being non-empty. */
function vwAncestorsOf(node) {
  const out = [];
  let n = node ? node.parentNode : null;
  while (n) { out.push(n); n = n.parentNode; }
  return out;
}
const vwStripUp = vwAncestorsOf(fgStrip);
const vwBandUp = vwAncestorsOf(vwRefband);
const vwStripInSwitch = vwStripUp.indexOf(vwRoot) !== -1;
const vwRefInSwitch = vwBandUp.indexOf(vwRoot) !== -1;
const vwStripInBoard = vwStripUp.indexOf(fgBoard) !== -1;
const vwRefInBoard = vwBandUp.indexOf(fgBoard) !== -1;

const vwSwitchAt = html.indexOf('id="views"');
const vwSwitchText = vwSwitchAt === -1 ? '' : html.slice(vwSwitchAt, html.indexOf('</div>', vwSwitchAt));
const vwBandAt = html.indexOf('class="fg-band"');
const vwBandText = vwBandAt === -1 ? '' : html.slice(vwBandAt, html.indexOf('<!-- .fg-band -->'));
const vwBoardAt = html.indexOf('id="board"');
const vwBoardText = vwBoardAt === -1 ? '' : html.slice(vwBoardAt, html.indexOf('id="selftest-report"'));
const vwStripSpelling = 'id="strip"';
const vwRefSpelling = 'id="refband"';
/* D-28's two rules, read out of the stylesheet by the exact selectors that
   carry them. Sliced from [C15]'s own marker to the close of the <style> block,
   which is check 63's REF_OPEN/REF_CLOSE idiom and this row's own markup half
   one level up. The slice is floored on being non-empty for the reason every
   slice in this row is: a slice that came back empty carries neither spelling
   and passes spotlessly. */
const vwCssAt = html.indexOf('[C15] THE VIEW SWITCH');
const vwCssText = vwCssAt === -1 ? '' : html.slice(vwCssAt, html.indexOf('</style>', vwCssAt));
const vwHideRule = '#app[data-view="fight"] #strip{display:none}';
const vwShowRule = '#app[data-view="fight"][data-proj="1"] #strip{';
check(
  '103b. #strip AND #refband ARE IN NEITHER SIDE OF THE SWITCH AND BOTH ARE '
    + 'STILL INSIDE #board, walked from both nodes rather than asserted about '
    + 'them. That is what makes REF-03 structural and what makes D-28\'s '
    + 'sidebar THE projection rather than a second one: #board stands in BOTH '
    + 'views, only the two .brd-col columns are put away, and probe AK measured '
    + 'that the whole suite stays green over the strip being moved into the '
    + 'fight band. The markup half carries the claim the stub page structurally '
    + 'cannot: .fg-band is a class-only wrapper this page does not build, so '
    + 'the band\'s own slice of cats-vs-mechs.html is read for both spellings '
    + 'instead, and the board\'s slice is read for both being present. AND THE '
    + 'STYLESHEET HALF IS D-28\'s, added when this row\'s claim was turned: '
    + '[C15] must carry BOTH the rule that takes the projection off the default '
    + 'fight view and the rule that brings it back, because a file with only '
    + 'the first is a projection a student cannot reach and it is one deleted '
    + 'line away at all times. Floored on both nodes being found and on all '
    + 'four slices being non-empty, because a walk that found neither and a '
    + 'slice that came back empty each pass spotlessly',
  fgStrip !== null && vwRefband !== null
    && vwStripInSwitch === false && vwRefInSwitch === false
    && vwStripInBoard === true && vwRefInBoard === true
    && vwSwitchText.length > 0 && vwBandText.length > 0 && vwBoardText.length > 0
    && vwCssText.length > 0
    && vwSwitchText.indexOf(vwStripSpelling) === -1
    && vwSwitchText.indexOf(vwRefSpelling) === -1
    && vwBandText.indexOf(vwStripSpelling) === -1
    && vwBandText.indexOf(vwRefSpelling) === -1
    && vwBoardText.indexOf(vwStripSpelling) !== -1
    && vwBoardText.indexOf(vwRefSpelling) !== -1
    && vwCssText.indexOf(vwHideRule) !== -1
    && vwCssText.indexOf(vwShowRule) !== -1,
  '#strip inside the switch=' + vwStripInSwitch
    + ' inside #board=' + vwStripInBoard
    + ' | #refband inside the switch=' + vwRefInSwitch
    + ' inside #board=' + vwRefInBoard
    + ' | markup slices, chars: switch=' + vwSwitchText.length
    + ' band=' + vwBandText.length + ' board=' + vwBoardText.length
    + ' [C15]=' + vwCssText.length
    + ' | the band\'s markup carries #strip=' + (vwBandText.indexOf(vwStripSpelling) !== -1)
    + ' #refband=' + (vwBandText.indexOf(vwRefSpelling) !== -1)
    + ' | the board\'s markup carries #strip=' + (vwBoardText.indexOf(vwStripSpelling) !== -1)
    + ' #refband=' + (vwBoardText.indexOf(vwRefSpelling) !== -1)
    + ' | [C15] carries D-28\'s hide rule='
    + (vwCssText.indexOf(vwHideRule) !== -1)
    + ' and its show rule=' + (vwCssText.indexOf(vwShowRule) !== -1)
);

/* 103c. THE VIEW FOLLOWS A FIGHT ACROSS BOTH EDGES AND NOT BETWEEN THEM. The
   middle step is the row: a student who switches to the board mid-fight — to
   rule a unit dead, which is what the board is FOR during a fight — must not be
   thrown back onto the fight by the next commit. A region that wrote the view
   from state.fight on every frame would pass every other step here and fail
   that one, and it is the tidier of the two implementations. */
A.ops.resetToDefaults();
A.state.flush();
const vwEdges = [];
vwEdges.push('at rest=' + fgApp.dataset.view);
fgPress(fgStart);
vwEdges.push('after startFight=' + fgApp.dataset.view);
fgPress(vwBuildBtn);
vwEdges.push('after pressing the board=' + fgApp.dataset.view);
fgDeclare('cats', fgCatsAct, 'c1');
fgAdvancePress();
vwEdges.push('after an advance=' + fgApp.dataset.view);
A.ops.endFight();
A.state.flush();
vwEdges.push('after endFight=' + fgApp.dataset.view
  + ' flag=' + JSON.stringify(String(fgApp.dataset.viewFg || '')));
fgPress(fgStart);
vwEdges.push('started again=' + fgApp.dataset.view);
A.ops.endFight();
A.state.flush();
A.ops.startFight();
A.state.flush();
const vwBeforeUndo = fgApp.dataset.view;
A.ops.undo();
A.state.flush();
const vwAfterUndo = fgApp.dataset.view;
vwEdges.push('undo of startFight=' + vwAfterUndo);
check(
  '103c. THE VIEW FOLLOWS A FIGHT ACROSS BOTH EDGES AND NOT BETWEEN THEM. '
    + 'Starting a fight puts the student on the fight without a second press; '
    + 'ending one puts them back on the board and clears the private flag; '
    + 'starting again takes them there again. AND IN BETWEEN THE TWO EDGES THE '
    + 'VIEW IS THE STUDENT\'S: a press of the board control mid-fight holds '
    + 'through a real Advance, because a region that re-derived the view from '
    + 'state.fight every frame would throw a student back onto the fight on the '
    + 'commit that follows their own ruling. The last step is an UNDO of a '
    + 'startFight, which the view follows for free — the flag lives on the page '
    + 'and is re-derived every commit, so the undo arrives as the closing edge '
    + 'rather than as something anybody had to store',
  vwEdges[0] === 'at rest=build'
    && vwEdges[1] === 'after startFight=fight'
    && vwEdges[2] === 'after pressing the board=build'
    && vwEdges[3] === 'after an advance=build'
    && vwEdges[4] === 'after endFight=build flag=""'
    && vwEdges[5] === 'started again=fight'
    && vwBeforeUndo === 'fight' && vwAfterUndo === 'build',
  vwEdges.join(' | ') + ' | before the undo=' + vwBeforeUndo
);

A.ops.resetToDefaults();
A.state.flush();
clearPanel();

/* --- 103d, 103e, 103f. D-28, DRIVEN (plan 05-D28). The developer, at the real
   artifact, with a screenshot of the fight tab attached:

     "this is way too compressed - let the fight take the whole width.
      earlier rounds should be a full lane above showing the past state and
      acctions selected.
      The predictor turn off, and make it toggled sidebar / pop over"

   Three rows for three claims, split by what each one can be wrong about
   independently:

     103d  PROJ-05's NEW READING. The projection is reachable from the fight
           view by ONE toggle press, and the row asserts THAT rather than the
           old placement claim — the toggle exists, it opens, the projection's
           figures are present AND CURRENT inside it, it closes, and the whole
           state is byte-identical across both presses.
     103e  THE LANE IS ABOVE THE ROUND BEING PLAYED and its newest card is its
           LAST child, read off both pages' DOM order and off the markup, with
           the stylesheet read for the two properties that would put reading
           order and document order out of step silently.
     103f  A CARD CARRIES THE BOARD AS IT STOOD AND THE ACTIONS THAT WERE
           SELECTED. D-28 asks for both; ldDidInto has drawn the second half
           since plan 05-08 and nothing asserted it, so a tidy-up that dropped
           the actions from a card would have been invisible.

   WHAT THIS BLOCK DOES NOT DO IS AS DELIBERATE AS WHAT IT DOES. It does not
   assert that the closed projection is off the screen, that the lane scrolls
   sideways, or that Advance is above the fold. All three are LAYOUT and this
   page has no layout engine — asserting them here would be the fourth green
   row in this file over a surface nobody was watching. They are in
   tests/browser-checks.mjs, in two browsers at two sizes. --- */

A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
const pvAtRestView = String(fgApp.dataset.view || '');
const pvBtn = dom.byId['proj-toggle'];
function pvRead() {
  return {
    proj: String(fgApp.dataset.proj || ''),
    pressed: pvBtn.getAttribute('aria-pressed'),
    expanded: pvBtn.getAttribute('aria-expanded'),
    cls: String(pvBtn.className || '')
  };
}
function pvSaysOn(r) {
  return r.proj === '1' && r.pressed === 'true' && r.expanded === 'true'
    && r.cls.indexOf('pv-on') !== -1;
}
function pvSaysOff(r) {
  return r.proj === '' && r.pressed === 'false' && r.expanded === 'false'
    && r.cls.indexOf('pv-on') === -1;
}
const pvClosed = pvRead();
const pvStateWas = JSON.stringify(A.state.get());
fgPress(pvBtn);
const pvOpen = pvRead();
const pvStateMid = JSON.stringify(A.state.get());
// THE FIGURES INSIDE IT, AND THEY MUST BE CURRENT RATHER THAN MERELY PRESENT.
// A sidebar carrying a COPY of the projection would read non-empty here and
// would be exactly the thing [C15]'s "the same projection, not a second one
// that happens to carry the same words" refuses. So the reading is taken, a
// real op moves the number the projection is derived from, and the reading is
// taken again: the two must DIFFER. That is a claim about the path a figure
// travels and not about a string, which is probe AU's ruling applied here.
const pvSaysFirst = fgLeaves(fgStrip);
A.ops.setFactionAp('cats', 9);
A.state.flush();
const pvSaysAfter = fgLeaves(fgStrip);
A.ops.setFactionAp('cats', 3);
A.state.flush();
fgPress(pvBtn);
const pvShut = pvRead();
const pvStateNow = JSON.stringify(A.state.get());
// The partition, read off the page rather than off the shell comment that says
// it: no node carries both routing words, and neither routing word is a
// data-act — one would be routed straight into App.ops.dispatch by [S07.1]
// whatever this region intended.
const pvPrivate = vwRoot.querySelectorAll('[data-pv]').length;
const pvAlsoVw = vwRoot.querySelectorAll('[data-pv]')
  .filter((n) => typeof n.dataset.vw === 'string' && n.dataset.vw !== '').length;
const pvActs = vwRoot.querySelectorAll('[data-act]').length;
const pvDisabled = vwRoot.querySelectorAll('button')
  .filter((n) => n.disabled === true).length;
check(
  '103d. PROJ-05 UNDER D-28: THE PROJECTION IS ONE PRESS AWAY FROM THE FIGHT '
    + 'VIEW, AND THE PRESS IS DRIVEN. This is the reading that replaces plan '
    + '05-12\'s placement claim, and it is a STRONGER row than the one it '
    + 'replaces rather than a weaker one — the old row read where the '
    + 'projection sat and could not tell a live projection from a dead copy of '
    + 'one. Four things are read back through both states: the attribute on '
    + '#app, both aria attributes, the on-class, and THE PROJECTION\'S OWN '
    + 'FIGURES, which must be present AND MOVE when a real op moves the pool '
    + 'they are derived from. A sidebar carrying a copy would read non-empty '
    + 'and stand still. The whole state is serialised before, between and after '
    + 'and must be byte-identical at all three readings: a panel a student '
    + 'opened is a page preference, and a page preference in a slice would ride '
    + 'in a build code and step under undo, which is check 103\'s claim '
    + 'arriving on a second attribute. AND THE TOGGLE CARRIES data-pv AND NOT '
    + 'data-act AND NOT data-vw, counted off the page. Nothing in this region '
    + 'is ever disabled',
  pvAtRestView === 'fight'
    && pvSaysOff(pvClosed) && pvSaysOn(pvOpen) && pvSaysOff(pvShut)
    && pvSaysFirst.length > 0 && pvSaysAfter.length > 0
    && pvSaysFirst.join('|') !== pvSaysAfter.join('|')
    && pvStateWas === pvStateMid && pvStateWas === pvStateNow
    && pvPrivate === 1 && pvAlsoVw === 0 && pvActs === 0 && pvDisabled === 0,
  'the view when the fight started=' + pvAtRestView
    + ' | closed=' + JSON.stringify(pvClosed)
    + ' | after ONE press=' + JSON.stringify(pvOpen)
    + ' | after a second=' + JSON.stringify(pvShut)
    + ' | the projection renders ' + pvSaysFirst.length + ' leaves and they '
    + (pvSaysFirst.join('|') === pvSaysAfter.join('|') ? 'DID NOT move' : 'moved')
    + ' when the pool moved'
    + ' | state byte-identical across press one=' + (pvStateWas === pvStateMid)
    + ' and across press two=' + (pvStateWas === pvStateNow)
    + ' | data-pv controls=' + pvPrivate + ' of which also data-vw=' + pvAlsoVw
    + ' | data-act under #views=' + pvActs
    + ' | disabled controls under #views=' + pvDisabled
);

/* 103e. THE LANE IS ABOVE THE ROUND BEING PLAYED, AND THE ORDER IS READ RATHER
   THAN ARRANGED. D-28: "earlier rounds should be a full lane above". The
   orchestrator's own note on that line is that the lane runs HORIZONTALLY with
   the newest nearest the round being played, because a full-width vertical
   stack pushes the current round off screen — the exact defect class this phase
   has now fixed three times.

   THE ROW IS ABOUT ORDER AND NOT ABOUT PIXELS, which is the honest split: this
   page cannot see a lane. What it CAN see, and what a CSS `order` or a
   `row-reverse` would break silently while every DOM-order check in this
   repository stayed green, is that document order and reading order are the
   same thing. So three things are read: #ledger comes before #fightbar in this
   page's own child order; the band's markup slice spells them in that same
   order; and the three rule bodies that decide it carry NEITHER `order:` NOR a
   reversed direction.
   The third clause is the one that catches the tidy fix.

   AND THE NEWEST CARD IS THE LAST CHILD, driven with two resolved rounds rather
   than asserted — which is [S06.8]'s append contract read from the end a room
   sees it from. */
A.ops.resetToDefaults();
A.state.flush();
const ldKids = fgApp.children.map((n) => String(n.getAttribute('id') || n.className || '?'));
const ldLedgerAt = ldKids.indexOf('ledger');
const ldBarAt = ldKids.indexOf('fightbar');
const ldBandLedgerAt = vwBandText.indexOf('id="ledger"');
const ldBandBarAt = vwBandText.indexOf('id="fightbar"');
/* THE STYLESHEET HALF READS THE THREE RULE BODIES THAT DECIDE THIS, AND NOT A
   BLOCK — a correction PROBE BB forced and one worth writing out, because the
   first draft of this row was GREEN over the exact defect it was written for.
   That draft sliced [C14.2] THE LEDGER and scanned it, which reads like the
   right block and is not: `.ld-list` is declared up in [C14] beside the frame,
   and only `.ld-row` is in [C14.2]. Probe BB set the lane to `row-reverse` —
   the newest card at the wrong end of the lane, every DOM-order clause below
   still true — and the run came back 1216/0, 184 of 184, exit 0.

   So the three rules are read BY NAME instead of by neighbourhood: #ledger,
   which could carry an `order` that moves the whole region; .ld-list, which
   carries the lane's direction; and .ld-row, which could carry an `order` that
   moves one card. Each is floored on being FOUND, because a rule body that came
   back empty carries no property and would pass this row by not existing —
   which is precisely how the first draft passed. */
function ldCssRule(sel) {
  const at = html.indexOf('\n  ' + sel + '{');
  if (at === -1) { return ''; }
  const end = html.indexOf('}', at);
  return end === -1 ? '' : html.slice(at, end + 1);
}
const ldRuleLedger = ldCssRule('#ledger');
const ldRuleList = ldCssRule('.ld-list');
const ldRuleRow = ldCssRule('.ld-row');
const ldCssText = ldRuleLedger + ldRuleList + ldRuleRow;
const ldCssOrder = /(^|[;{\s])order\s*:/.test(ldCssText);
const ldCssReverse = /(row|column)-reverse/.test(ldCssText);
fgPress(fgStart);
fgDeclare('cats', fgCatsAct, 'c1');
fgAdvancePress();
fgDeclare('cats', fgCatsAct, 'c1');
fgAdvancePress();
const ldList = dom.byId['ledger-list'];
const ldRounds = ldList.children.map((r) => String(r.dataset.ldRound || '?'));
const ldNewestIsLast = ldRounds.length > 1
  && Number(ldRounds[ldRounds.length - 1]) === Math.max.apply(null, ldRounds.map(Number));
check(
  '103e. THE LANE OF EARLIER ROUNDS IS ABOVE THE ROUND BEING PLAYED AND ITS '
    + 'NEWEST CARD IS ITS LAST CHILD, read off this page\'s child order, off '
    + 'the band\'s own markup and off the stylesheet. D-28 moved the ledger '
    + 'from a right-hand column to a full-width lane above, and the move was '
    + 'made in the MARKUP: a CSS `order` would have put the sequence a screen '
    + 'reader walks out of step with the sequence the room sees, and every '
    + 'DOM-order check in this repository would have stayed green over it. So '
    + 'the three rule bodies that decide it - #ledger, .ld-list and .ld-row - '
    + 'are read BY NAME for `order:` and for a reversed flex direction and must '
    + 'carry NEITHER, which is the clause that catches the tidy fix. PROBE BB '
    + 'is why they are read by name rather than by neighbourhood: the first '
    + 'draft of this row sliced the [C14.2] BLOCK, .ld-list turns out to be '
    + 'declared up in [C14] beside the frame, and a lane set to row-reverse ran '
    + '1216 passed, 184 of 184 and exit 0. '
    + 'The append contract is driven rather than asserted — two rounds are '
    + 'resolved through the real controls and the newest must be the LAST card, '
    + 'because that is the end of the lane and the end of the lane is what '
    + 'touches the round being played. Floored on both regions being FOUND in '
    + 'both pages and on the stylesheet slice being non-empty, because an '
    + 'indexOf of -1 is smaller than every other index and would pass this row '
    + 'by not existing - and on all THREE rule bodies being found, for the same '
    + 'reason arriving from the stylesheet side',
  ldLedgerAt !== -1 && ldBarAt !== -1 && ldLedgerAt < ldBarAt
    && ldBandLedgerAt !== -1 && ldBandBarAt !== -1 && ldBandLedgerAt < ldBandBarAt
    && ldRuleLedger.length > 0 && ldRuleList.length > 0 && ldRuleRow.length > 0
    && ldCssOrder === false && ldCssReverse === false
    && ldRounds.length === 2 && ldNewestIsLast,
  '#app child order=' + JSON.stringify(ldKids)
    + ' | #ledger at ' + ldLedgerAt + ', #fightbar at ' + ldBarAt
    + ' | in the band\'s markup, #ledger at ' + ldBandLedgerAt
    + ' and #fightbar at ' + ldBandBarAt
    + ' | rule bodies read, chars: #ledger=' + ldRuleLedger.length
    + ' .ld-list=' + ldRuleList.length + ' .ld-row=' + ldRuleRow.length
    + ', carries order:=' + ldCssOrder
    + ' carries a reversed direction=' + ldCssReverse
    + ' | cards in the lane=' + JSON.stringify(ldRounds)
    + ' newest is the last child=' + ldNewestIsLast
);

/* 103f. AND A CARD SHOWS THE STATE AND THE ACTIONS, which is the half of D-28's
   sentence a layout change is most likely to lose. "earlier rounds should be a
   full lane above showing the past state and acctions selected" — two things,
   and the second one has been drawn by ldDidInto since plan 05-08 with NOTHING
   IN THIS FILE ASSERTING IT. A card narrowed to 340px is exactly the moment
   somebody decides the action lines do not fit.

   BOTH HALVES ARE READ OFF THE SAME CARD, and the action half is read for the
   three things that make it readable rather than for a node count: the unit
   that acted, the action it used, and what it landed on. The words are compared
   against the BUILD's own names rather than against strings typed here, which
   is check 102's rule — a row carrying its own copy of a unit name is a row
   asserting that this file agrees with itself.

   THE BOARD HALF'S CLAIM IS TURNED IN THE OPEN UNDER D-29, and the turn is the
   difference between "the card says something" and "the card says it the way
   the developer asked for". As written, the board half required the card's TEXT
   to name the faction, and it would have gone on passing over a lane that
   printed "Cat 1 — Health 3, Shield 0" for ever — which is the exact reading
   D-29's screenshot was of. It now asserts BOTH: the faction is still named in
   text, because a faction name is a word and no symbol carries it; and the
   unit states are SYMBOLIC — the card draws token nodes, its text names no
   token type at all, and the type's name is in the tooltip instead. The action
   half is untouched, because D-29 keeps "Cat 2 uses Slash on Mech 1" as a
   sentence by name. */
const ldNewest = ldList.children[ldList.children.length - 1] || null;
const ldCardBoardBox = ldNewest === null ? null : ldNewest.querySelector('.ld-board');
const ldCardBoard = ldCardBoardBox === null ? [] : fgLeaves(ldCardBoardBox);
const ldCardActs = ldNewest === null ? [] : fgLeaves(ldNewest.querySelector('.ld-acts'));
const ldCardAll = ldCardActs.join(' ');
const ldBoardToks = ldCardBoardBox === null ? 0
  : ldCardBoardBox.querySelectorAll('.tok').length;
const ldBoardSyms = ldCardBoardBox === null ? 0
  : ldCardBoardBox.querySelectorAll('.sym').length;
const ldBoardSaid = ldCardBoardBox === null ? [] : fgSaid(ldCardBoardBox);
// The two shipped durability types, by the name the LIVE vocabulary holds for
// them, so a renamed board is read by its own words and never by strings typed
// into this row — check 102's rule again, arriving on the other channel.
const ldHpWord = A.render.labelFor(A.state.get(), 'hp');
const ldShieldWord = A.render.labelFor(A.state.get(), 'shield');
const ldBoardTextNamesType = ldCardBoard.join(' ').indexOf(ldHpWord) !== -1
  || ldCardBoard.join(' ').indexOf(ldShieldWord) !== -1;
const ldBoardSaidNamesType = ldBoardSaid.join(' ').indexOf(ldHpWord) !== -1
  && ldBoardSaid.join(' ').indexOf(ldShieldWord) !== -1;
const ldBuildNow = A.state.get().build;
const ldUnitWord = ldBuildNow.cats.units[0].name;
const ldActWord = (ldBuildNow.cats.actions.filter((a) => a.id === fgCatsAct)[0] || {}).name;
const ldSideWord = ldBuildNow.cats.name;
const ldSaysUnit = ldCardAll.indexOf(ldUnitWord) !== -1;
const ldSaysAct = typeof ldActWord === 'string' && ldCardAll.indexOf(ldActWord) !== -1;
const ldBoardSaysSide = ldCardBoard.join(' ').indexOf(ldSideWord) !== -1;
check(
  '103f. EVERY CARD IN THE LANE SHOWS THE BOARD AS IT STOOD AND THE ACTIONS '
    + 'THAT WERE SELECTED — D-28 asks for both and only one of the two had a '
    + 'row watching it. CLAIM TURNED IN THE OPEN UNDER D-29, on the board half '
    + 'only: as written it required the card\'s TEXT to name the faction and '
    + 'would have gone on passing over "Cat 1 — Health 3, Shield 0" for ever, '
    + 'which is the exact reading the developer sent the screenshot of. It now '
    + 'reads THREE things off the board box — the faction still named in text, '
    + 'because a faction name is a word and no symbol carries it; TOKEN NODES '
    + 'actually drawn, because a symbolic reading that drew nothing would be a '
    + 'card that lost the state entirely; and the two shipped durability types '
    + 'named in the TOOLTIPS and in NEITHER leaf of the text, which is the '
    + 'clause that says the prose moved rather than that a tooltip was added '
    + 'beside prose nobody removed. Both type names are taken from the LIVE '
    + 'vocabulary and never typed here. The action half is UNTOUCHED and still '
    + 'reads off the card\'s action box for the UNIT that acted and the ACTION '
    + 'it used, because D-29 keeps that a sentence by name; both are compared '
    + 'against the live build\'s own words, which is check 102\'s rule: a row '
    + 'carrying its own copy of a name asserts that this file agrees with '
    + 'itself. This is the clause a 340px card is most likely to lose, and '
    + 'losing it would have moved no number and reddened nothing',
  ldNewest !== null && ldCardBoard.length > 0 && ldCardActs.length > 0
    && ldBoardSaysSide && ldSaysUnit && ldSaysAct
    && ldBoardToks > 0 && ldBoardSyms > 0
    && ldBoardTextNamesType === false && ldBoardSaidNamesType === true,
  'the newest card carries ' + ldCardBoard.length + ' board leaves and '
    + ldCardActs.length + ' action leaves'
    + ' | the board half names the faction ' + JSON.stringify(ldSideWord)
    + '=' + ldBoardSaysSide
    + ' | it draws ' + ldBoardToks + ' token nodes across ' + ldBoardSyms
    + ' symbolic readings carrying ' + ldBoardSaid.length + ' tooltips'
    + ' | its TEXT names ' + JSON.stringify(ldHpWord) + ' or '
    + JSON.stringify(ldShieldWord) + '=' + ldBoardTextNamesType
    + ' and its TOOLTIPS name both=' + ldBoardSaidNamesType
    + ' | the action half names the unit ' + JSON.stringify(ldUnitWord)
    + '=' + ldSaysUnit + ' and the action ' + JSON.stringify(ldActWord)
    + '=' + ldSaysAct
    + ' | the action half reads: ' + JSON.stringify(ldCardAll.slice(0, 120))
    + ' | one board tooltip reads: ' + JSON.stringify(ldBoardSaid[0] || '')
);

A.ops.resetToDefaults();
A.state.flush();
clearPanel();

/* --- 104-104f. D-27's TARGETING, DRIVEN (plan 05-14). "Default target to the
   lowest health enemy. Add a button to change target (rather than require a
   picker every time)" — the addendum, verbatim, and six rows that read the
   answer off the RECORD after a real press rather than off the derivation.

   THE SPLIT BETWEEN THESE ROWS AND [S09.12]'s IS THE WHOLE POINT OF THEM
   EXISTING AT ALL. Plan 05-13 asserts App.model.defaultAt exhaustively, in
   twenty-eight rows, against state. NOT ONE OF THOSE ROWS CAN SEE WHETHER THE
   SURFACE ACTUALLY USES IT — probe AB's lesson, one phase and three surfaces
   later: a derivation computed correctly and then ignored on the way to the
   page leaves every state row green. So each row below drives a real control
   and reads the record the press produced.

   AND THE DEFAULT IS COMPARED AGAINST THE DERIVATION'S OWN ANSWER ON THE SAME
   BOARD rather than against a hardcoded unit id, so this reads the derivation
   instead of re-implementing it. A row carrying its own copy of "the lowest
   health living enemy" would be two implementations agreeing with each other
   and neither of them with the artifact. --- */

A.ops.resetToDefaults();
A.state.flush();
clearPanel();

const fgAtCatsAct = A.state.get().build.cats.actions
  .filter((a) => A.model.needsAt(a))[0].id;
const fgNoAtCatsAct = A.state.get().build.cats.actions
  .filter((a) => !A.model.needsAt(a))[0].id;

function fgHalfOf(side) {
  const root = fgSideRootOf(side);
  return String(root.dataset.fgAct || '') + '/' + String(root.dataset.fgBy || '');
}
function fgDeclOf(side, byId) {
  return A.state.get().fight.decl
    .filter((d) => d.side === side && d.by === byId)[0] || null;
}

/* THE BATTLEFIELD'S CONTROL DOES NOT EXIST YET AND IS BUILT HERE TO THE
   CONTRACT [S07.5] FIXES. Plan 05-15 builds the real one; this page builds one
   node carrying exactly the four attributes that banner names, appends it
   inside #fightbar so the shipped delegated listener is the thing that routes
   it, and takes it away again afterwards. That is the honest shape for an arm
   whose sender is a plan away: the ARM is what these rows assert, the control
   is not, and building it to a spelling written down in the artifact is what
   makes 05-15 able to disagree with this page loudly rather than silently. */
function fgPressBf(side, unitId) {
  const b = dom.document.createElement('button');
  b.type = 'button';
  b.dataset.fg = 'bf';
  b.dataset.fgSide = side;
  b.dataset.fgVal = unitId;
  b.dataset.k = 'fg/bf/' + side + '/' + unitId;
  fgBar.appendChild(b);
  fgPress(b);
  // TAKEN AWAY AGAIN IN THE SAME BREATH, so no reading below is taken over a
  // page carrying a control the artifact does not build. A row that left one
  // standing would be comparing disabled sets that include a node this file
  // invented.
  fgBar.removeChild(b);
}

fgPress(fgStart);
fgDeclare('cats', fgAtCatsAct, 'c1');
const fgDefAnswer = A.model.defaultAt(A.state.get().fight, 'cats');
const fgOneClick = fgDeclOf('cats', 'c1');
const fgOneClickSays = fgLandsOn('cats', 'c1');
fgDeclare('cats', fgNoAtCatsAct, 'c2');
const fgNoAtRecord = fgDeclOf('cats', 'c2');
const fgNoAtBtn = fgAtBtnOf('cats', 'c2');
check(
  '104. AN ACTION THAT AIMS A TERM AT WHAT IT POINTS AT DECLARES IN ONE PRESS, '
    + 'ALREADY POINTED AT SOMEBODY — D-27\'s addendum, driven. The record\'s '
    + '`at` is compared against App.model.defaultAt\'s OWN answer on the same '
    + 'board rather than against a unit id typed into this row, so what is '
    + 'asserted is that the surface USES the derivation: plan 05-13 proves the '
    + 'derivation is right and cannot see whether anything reads it. The row '
    + 'beside it says what it lands on, in words. And an action that aims at '
    + 'nobody declares in the same ONE press with `at` null and carries no '
    + 'change-target control at all, because there is nothing on it to change',
  fgOneClick !== null && fgOneClick.at === fgDefAnswer && fgDefAnswer !== null
    && fgOneClick.act === fgAtCatsAct && fgOneClick.by === 'c1'
    && fgOneClickSays !== null && fgOneClickSays.indexOf('Lands on') === 0
    && fgNoAtRecord !== null && fgNoAtRecord.at === null
    && fgNoAtBtn === null && errPanel.hidden === true,
  'one press left the record ' + JSON.stringify(fgOneClick)
    + ' | App.model.defaultAt answered ' + JSON.stringify(fgDefAnswer)
    + ' | the row says ' + JSON.stringify(fgOneClickSays)
    + ' | the action that aims at nobody left ' + JSON.stringify(fgNoAtRecord)
    + ' and drew a change-target control=' + (fgNoAtBtn !== null)
);

/* 104b. D-00d ON THE DEFAULT, READ OFF THE RECORD. Two directions, and the
   second is the one a tidy implementation loses: a unit at ZERO HEALTH that
   nobody ruled is still pointed at, because death is stored and never inferred.
   Both are driven through real presses on real controls — the health by the
   shipped op a hand ruling sends, the death by the alive toggle a student
   presses — and both are read out of the declaration the press wrote. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
A.ops.dispatch('setUnitHp', { side: 'mechs', unitId: 'm2', value: 0 });
A.state.flush();
fgDeclare('cats', fgAtCatsAct, 'c1');
const fgZeroTargeted = fgDeclOf('cats', 'c1');
const fgZeroHpNow = A.state.get().fight.mechs.units[1].hp;
fgPress(fgAliveBtn('mechs', 'm2'));
fgDeclare('cats', fgAtCatsAct, 'c1');
fgDeclare('cats', fgAtCatsAct, 'c1');
const fgDeadSkipped = fgDeclOf('cats', 'c1');
const fgDeadFlag = A.state.get().fight.mechs.units[1].alive;
check(
  '104b. THE DEFAULT SKIPS A DEAD-RULED ENEMY AND DOES NOT SKIP A '
    + 'ZERO-HEALTH ENEMY NOBODY RULED, read off the RECORD a real press wrote. '
    + 'D-00d is the file\'s oldest ruling — death is stored, never inferred — '
    + 'and this is the surface half of it: [S09.12] asserts the derivation '
    + 'against state, and probe AB proved that a derivation used wrongly on the '
    + 'way to the page leaves every state row green. A unit driven to zero '
    + 'health that nobody ruled is STILL what the tool points at, which is what '
    + 'keeps a Shield ruling representable; the same unit ruled dead is skipped '
    + 'for the next one on the roster',
  fgZeroHpNow === 0 && fgZeroTargeted !== null && fgZeroTargeted.at === 'm2'
    && fgDeadFlag === false && fgDeadSkipped !== null
    && fgDeadSkipped.at !== 'm2' && fgDeadSkipped.at === 'm1'
    && errPanel.hidden === true,
  'm2 at health ' + fgZeroHpNow + ' with nobody ruling it, the default points at '
    + JSON.stringify(fgZeroTargeted && fgZeroTargeted.at)
    + ' | m2 ruled dead (alive=' + fgDeadFlag + '), the default points at '
    + JSON.stringify(fgDeadSkipped && fgDeadSkipped.at)
);

/* 104c. THE CHANGE-TARGET PRESS MOVES THE PAGE AND MOVES NOTHING ELSE — checks
   72, 73 and 103's shape, and the clause that IS the row is the byte-identical
   one. A control that started a change and also wrote into a slice would put a
   half-made intention into a build code and under undo, which is precisely what
   the shell comment on #act-edit-propose argues at length and what [S09.3] pins
   the `ui` key set to prevent. Probe AN drives exactly that.

   AND THE NAME WALK RIDES IN THIS ROW BECAUSE 73c CANNOT REACH HERE, which
   probe AN measured rather than this row assuming. Check 73c walks the whole
   live state for a key named after a proposal, an override, a caster, a target
   or a pending anything — but it runs at the top of this file, hundreds of
   drives before the fight surface is ever pressed, and every board it reads was
   built through OPS. A key written by a HANDLER during a flow is invisible to
   it. Probe AN wrote `state.fight.pendingTarget` from pressAt and 73c stayed
   green over it; the byte-identical clause below caught it, and this walk is
   what makes the CATCH NAME THE KEY instead of only reporting that something
   moved. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
fgDeclare('cats', fgAtCatsAct, 'c1');
const fgAtStateWas = JSON.stringify(A.state.get());
const fgAtDepthWas = A.state.undoDepth();
const fgAtHalfWas = fgHalfOf('cats');
fgPress(fgAtBtnOf('cats', 'c1'));
const fgAtHalfNow = fgHalfOf('cats');
const fgAtStateMid = JSON.stringify(A.state.get());
const fgAtPressed = fgAtBtnOf('cats', 'c1').getAttribute('aria-pressed');
fgPress(fgAtBtnOf('cats', 'c1'));
const fgAtHalfBack = fgHalfOf('cats');
const fgAtStateNow = JSON.stringify(A.state.get());
const fgAtDeclStands = fgDeclOf('cats', 'c1');
const fgAtNamed = [];
(function walkKeys(node, where) {
  if (!node || typeof node !== 'object') { return; }
  Object.keys(node).forEach((k) => {
    if (/propos|override|caster|target|pending/i.test(k)) {
      fgAtNamed.push(where + '.' + k);
    }
    walkKeys(node[k], where + '.' + k);
  });
})(A.state.get(), 'state');
check(
  '104c. PRESSING THE CHANGE-TARGET CONTROL DISPATCHES NOTHING AND PRESSING IT '
    + 'TWICE PUTS IT BACK. The whole state is serialised before, between and '
    + 'after, and must be byte-identical at all three readings while the two '
    + 'attributes on the side\'s own root move and come back — a half-made '
    + 'change is a form\'s transient selection and a slice is the one place it '
    + 'may never live, because from there it would ride in a build code and '
    + 'step under undo. The declaration itself is still standing afterwards, '
    + 'unchanged, which is what makes the second press a CANCEL rather than an '
    + 'undo. AND NOTHING REACHABLE FROM THE STATE IS NAMED after a proposal, an '
    + 'override, a caster, a target or a pending anything, walked at any depth '
    + 'HERE because check 73c runs before this surface is ever pressed and '
    + 'every board it reads was built through ops — a key written by a handler '
    + 'is invisible to it',
  fgAtNamed.length === 0
    && fgAtHalfWas === '/' && fgAtHalfNow === fgAtCatsAct + '/c1'
    && fgAtHalfBack === '/' && fgAtPressed === 'true'
    && fgAtStateWas === fgAtStateMid && fgAtStateWas === fgAtStateNow
    && A.state.undoDepth() === fgAtDepthWas
    && fgAtDeclStands !== null && fgAtDeclStands.act === fgAtCatsAct
    && errPanel.hidden === true,
  'keys named after a proposal, an override, a caster, a target or a pending '
    + 'anything=' + JSON.stringify(fgAtNamed)
    + ' | the two attributes ' + JSON.stringify(fgAtHalfWas) + ' -> '
    + JSON.stringify(fgAtHalfNow) + ' -> ' + JSON.stringify(fgAtHalfBack)
    + ' | the control reads pressed=' + JSON.stringify(fgAtPressed)
    + ' | state byte-identical across press one='
    + (fgAtStateWas === fgAtStateMid) + ' and across press two='
    + (fgAtStateWas === fgAtStateNow)
    + ' | undo depth ' + fgAtDepthWas + ' -> ' + A.state.undoDepth()
    + ' | the declaration still standing=' + JSON.stringify(fgAtDeclStands)
);

/* 104d. THE COMPLETING PRESS MOVES ONLY WHAT THE DECLARATION POINTS AT, and one
   undo takes exactly that back.

   THE SECOND DECLARATION IN BETWEEN IS NOT DECORATION. commit()'s coalescing
   window folds two commits under the SAME label inside 500ms into one undo
   entry, and plan 05-13 made the label carry the PERFORMER precisely so that a
   declare and an immediate retarget of the same unit are one act and one
   Ctrl+Z. That is the shipped behaviour and it is the right one — so to assert
   that a retarget ALONE is undoable, this row puts a declaration for a
   different performer between the two, which breaks the label chain. Both
   properties are recorded in the reading below rather than one of them being
   arranged away. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
// THE STACK IS CLEARED FIRST, which is 91d's note taken again one surface over:
// UNDO_LIMIT is 30 and every row above this one has been committing, so the
// stack arrives here SATURATED and a depth delta reads 0 whether an entry was
// pushed or not. Without this the undo clause below would be green about
// nothing.
A.state.restore(JSON.stringify(A.state.get()));
A.state.flush();
fgDeclare('cats', fgAtCatsAct, 'c1');
const fgRtFirst = JSON.stringify(fgDeclOf('cats', 'c1'));
fgDeclare('cats', fgAtCatsAct, 'c2');
const fgRtDepthWas = A.state.undoDepth();
const fgRtLenWas = A.state.get().fight.decl.length;
fgPress(fgAtBtnOf('cats', 'c1'));
fgPressBf('mechs', 'm3');
const fgRtMoved = fgDeclOf('cats', 'c1');
const fgRtHalfAfter = fgHalfOf('cats');
const fgRtLenNow = A.state.get().fight.decl.length;
const fgRtDepthNow = A.state.undoDepth();
fgPress(fgUndoBtn);
const fgRtUndone = JSON.stringify(fgDeclOf('cats', 'c1'));
const fgRtOtherStands = fgDeclOf('cats', 'c2');
check(
  '104d. THE BATTLEFIELD PRESS MOVES ONLY WHAT THE DECLARATION POINTS AT. The '
    + 'side, the action and the performer all stand, the list does not grow — '
    + 'because [S05] replaces a performer\'s record in place rather than '
    + 'clearing and appending — the two half-made attributes are cleared by the '
    + 'same press, and ONE press of the topbar undo puts the old target back '
    + 'while the other side\'s neighbour declaration stands untouched. The '
    + 'control this row presses is built to the spelling [S07.5]\'s banner '
    + 'fixes for plan 05-15, because the arm exists and its sender does not '
    + 'yet',
  fgRtMoved !== null && fgRtMoved.at === 'm3'
    && fgRtMoved.act === fgAtCatsAct && fgRtMoved.by === 'c1'
    && fgRtMoved.side === 'cats'
    && fgRtLenNow === fgRtLenWas && fgRtHalfAfter === '/'
    && fgRtDepthNow === fgRtDepthWas + 1
    && fgRtUndone === fgRtFirst
    && fgRtOtherStands !== null && errPanel.hidden === true,
  'the record ' + fgRtFirst + ' -> ' + JSON.stringify(fgRtMoved)
    + ' | declarations standing ' + fgRtLenWas + ' -> ' + fgRtLenNow
    + ' | the half-made change after the press=' + JSON.stringify(fgRtHalfAfter)
    + ' | undo depth ' + fgRtDepthWas + ' -> ' + fgRtDepthNow
    + ' | one undo left ' + fgRtUndone
    + ' | the other performer still stands=' + JSON.stringify(fgRtOtherStands)
);

/* 104e. THE TWO PRESSES THAT HAVE NOTHING TO DO, and both DECLINE QUIETLY
   rather than raising a panel: a battlefield press with no change half made,
   and a battlefield press on a unit of the acting side's own roster, which the
   one-line predicate in [S07.5] refuses today and which one edit would allow.
   AND THE ACTION PRESS WINS OVER A HALF-MADE CHANGE — D-27's "re-click of the
   declared action cancels, target and all" — so the same press that clears the
   declaration clears the change with it. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
fgDeclare('cats', fgAtCatsAct, 'c1');
const fgRestState = JSON.stringify(A.state.get());
const fgRestPage = fgLeaves(fgBar).join('|');
fgPressBf('mechs', 'm2');
const fgRestStillState = JSON.stringify(A.state.get());
const fgRestStillPage = fgLeaves(fgBar).join('|');
// half made, and then a press on the ACTING side's own unit
fgPress(fgAtBtnOf('cats', 'c1'));
fgPressBf('cats', 'c3');
const fgOwnSideKept = fgDeclOf('cats', 'c1');
const fgOwnSideHalf = fgHalfOf('cats');
// and the action press, while the change is still half made
fgPress(fgActBtnOf('cats', 'c1', fgAtCatsAct));
const fgActWinsHalf = fgHalfOf('cats');
const fgActWinsDecl = fgDeclOf('cats', 'c1');
check(
  '104e. A PRESS THAT HAS NOTHING TO DO DECLINES QUIETLY, and an action press '
    + 'wins over a change that is half made. A battlefield press at rest moves '
    + 'neither the state nor the rendered text of the region and leaves the '
    + 'error panel shut; a battlefield press on the ACTING side\'s own unit is '
    + 'refused by the one-line predicate that says which side this flow may '
    + 'pick from, leaving the declaration and the half-made change exactly '
    + 'where they were; and a press on the declared action clears the '
    + 'declaration AND the half-made change together, which is D-27\'s '
    + '"re-click of the declared action cancels, target and all"',
  fgRestState === fgRestStillState && fgRestPage === fgRestStillPage
    && fgOwnSideKept !== null && fgOwnSideKept.at !== 'c3'
    && fgOwnSideHalf === fgAtCatsAct + '/c1'
    && fgActWinsDecl === null && fgActWinsHalf === '/'
    && errPanel.hidden === true,
  'at rest: state moved=' + (fgRestState !== fgRestStillState)
    + ' page moved=' + (fgRestPage !== fgRestStillPage)
    + ' | a press on the acting side\'s own unit left the record '
    + JSON.stringify(fgOwnSideKept)
    + ' and the half-made change ' + JSON.stringify(fgOwnSideHalf)
    + ' | the action press left the record '
    + JSON.stringify(fgActWinsDecl) + ' and the half-made change '
    + JSON.stringify(fgActWinsHalf)
    + ' | error panel hidden=' + errPanel.hidden
);

/* 104f. AND NOTHING ANYWHERE IS DISABLED BY ANY OF IT. The whole disabled set
   is read at four points across the change-target flow and compared as a set —
   at rest, with a change half made, after the completing press, and after the
   undo — because a row watching one control would be green over a page that
   took every other one away.

   THIS ROW IS THE CONTROL RUN FOR THE TURN THAT FOLLOWS IT, and it is written
   BEFORE that turn deliberately. The commit after this one disables action
   buttons under three conditions and rewrites check 95 to assert them; this row
   is the reading of what the page looked like when NOTHING a student did could
   take a control away, taken over a flow the new contract does not touch at
   all. The change-target control is never disabled — it is not one of the three
   conditions and a fourth is exactly what the overrule does not license. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
fgDeclare('cats', fgAtCatsAct, 'c1');
// AND A SECOND PERFORMER, for the reason 104d gives at length: commit()
// coalesces two commits under the same label inside 500ms, a declare and an
// immediate retarget of ONE performer share a label by design, and an undo over
// the pair would take the declaration away with the retarget — leaving the
// fourth reading below without a change-target control at all and the set
// comparison failing for a reason that has nothing to do with anything being
// disabled. That is check 95's own like-for-like lesson, met here first.
fgDeclare('cats', fgAtCatsAct, 'c2');
const fgFlowRest = disabledIn(fgApp);
fgPress(fgAtBtnOf('cats', 'c1'));
const fgFlowHalf = disabledIn(fgApp);
const fgFlowAtEntry = fgFlowHalf.split('|')
  .filter((e) => e.indexOf('fg/at/cats/c1=') === 0);
fgPressBf('mechs', 'm3');
const fgFlowDone = disabledIn(fgApp);
fgPress(fgUndoBtn);
const fgFlowUndone = disabledIn(fgApp);
const fgFlowTrue = fgFlowRest.split('|').filter((e) => e.indexOf('=true') !== -1);
check(
  '104f. NOTHING ANYWHERE IS DISABLED BY THE CHANGE-TARGET FLOW. The whole '
    + 'disabled set is read at four points — at rest, half made, completed and '
    + 'undone — and compared as a SET rather than one control at a time, which '
    + 'is 71c\'s shape and its reason. The change-target control itself is '
    + 'enabled at every one of them: a student handed a default they cannot '
    + 'change has been given a resolution rather than a suggestion. The single '
    + '=true the set holds is the start control, which is the tool bounding '
    + 'what it can do to ITSELF',
  fgFlowRest === fgFlowHalf && fgFlowRest === fgFlowDone
    && fgFlowRest === fgFlowUndone
    && fgFlowTrue.length === 1 && fgFlowTrue[0] === 'fg=true'
    && fgFlowAtEntry.length === 1 && fgFlowAtEntry[0] === 'fg/at/cats/c1=false'
    && errPanel.hidden === true,
  'controls compared=' + fgFlowRest.split('|').length
    + ' | rest === half made=' + (fgFlowRest === fgFlowHalf)
    + ' | rest === completed=' + (fgFlowRest === fgFlowDone)
    + ' | rest === undone=' + (fgFlowRest === fgFlowUndone)
    + ' | the change-target entry=' + JSON.stringify(fgFlowAtEntry)
    + ' | every =true entry=' + JSON.stringify(fgFlowTrue)
);

/* --- 106-106i. THE BATTLEFIELD, READ OFF THE PAGE (plan 05-15). D-27's
   addendum, verbatim: "a visual presentation of the battle field on the current
   turn (shapes for cats with smaller shapes for status points / health on them
   - on one side, same on the right for the other side)".

   THEY ARE NUMBERED FROM 106 AND 105 IS DELIBERATELY LEFT UNUSED, which is
   worth a sentence rather than a gap nobody can explain. [S06.7]'s banner says
   "check 105 is the numbered row that holds it" about the disable-is-a-render-
   decision property — and that row shipped as 95b, beside the check it was
   re-homed from. The banner names a number this file has never had. Taking 105
   here would make that sentence point at a battlefield row, which is worse than
   a dangling reference: it would be an actively wrong one. The correction
   belongs to [S06.7]'s owner and plan 05-16 owns every other fight row's claim,
   so it is handed on by name rather than reached for.

   PLAN 05-16 TOOK THE HAND-OFF, RE-READ IT, AND COULD NOT CLOSE IT — recorded
   here rather than left as a gap that outlives its explanation. The reading is
   confirmed: [S06.7]'s banner still names check 105, this file still has no row
   105, and the property that banner is talking about is asserted by 95b. The
   fix is one word in a comment inside cats-vs-mechs.html, and plan 05-16 edits
   that file NOT AT ALL — which is its own section ownership and plan 05-10's
   shipped precedent for a finding a plan cannot act on. So 105 STAYS UNUSED,
   deliberately and now twice over, the battlefield rows stay at 106-106j, and
   the one-word correction is logged with its measurement in
   deferred-items.md item 5. A LATER PLAN MUST NOT "TIDY" THIS by renumbering
   the battlefield rows down into the gap: the gap is the record.

   EVERY ROW BELOW READS THE PAGE AND NOT THE STATE. That is the whole reason
   they exist next to [S09.12]'s and plan 05-13's: probe AB's lesson, now three
   surfaces and two phases old — a derivation computed correctly and then
   ignored on the way to the screen leaves every state row green. --- */

A.ops.resetToDefaults();
A.state.flush();
clearPanel();

// The battlefield's own readers. Scoped to a side's STATE root — D-31's, since
// the cluster is a reading of what IS — for the reason fgActBtnOf is scoped to
// the input root: a lookup from the document would take the FIRST match and
// #fightbar sits ahead of #board.
function bfShapesOf(side) {
  return fgStateRootOf(side).querySelectorAll('[data-fg="bf"]');
}
function bfShapeOf(side, unitId) {
  return bfShapesOf(side).filter((n) => n.dataset.fgVal === unitId)[0] || null;
}
function bfLineOf(side, unitId, tok) {
  const n = bfShapeOf(side, unitId);
  return n === null
    ? null : (n.querySelectorAll('.bf-line[data-bf-amt="' + tok + '"]')[0] || null);
}
// The token COUNT on one line, and -1 for a line that is not there at all, so a
// missing line and an empty one can never be read as the same answer.
function bfToksOf(side, unitId, tok) {
  const line = bfLineOf(side, unitId, tok);
  return line === null ? -1 : line.querySelectorAll('.tok').length;
}
function bfLineTextOf(side, unitId, tok) {
  const line = bfLineOf(side, unitId, tok);
  return line === null ? null : fgLeaves(line).join('|');
}
function bfLabelOf(side, unitId, tok) {
  const line = bfLineOf(side, unitId, tok);
  if (line === null) { return null; }
  const lbl = line.querySelectorAll('.bf-lbl')[0] || null;
  return lbl === null ? null : lbl.textContent;
}
function bfLineNames(side, unitId) {
  const n = bfShapeOf(side, unitId);
  return n === null ? [] : n.querySelectorAll('.bf-line').map((l) => l.dataset.bfAmt);
}
function bfHasClass(node, cls) {
  return node !== null && String(node.className).split(/\s+/).indexOf(cls) !== -1;
}
// Every LIT shape on the page, by key, so the set can be compared against a
// roster rather than counted.
function bfLitKeys() {
  const out = [];
  fgBar.querySelectorAll('[data-fg="bf"]').forEach((n) => {
    if (bfHasClass(n, 'bf-unit--lit')) { out.push(String(n.dataset.k)); }
  });
  return out.sort();
}
function bfRosterKeys(side) {
  return A.state.get().fight[side].units
    .map((u) => 'fg/bf/' + side + '/' + u.id).sort();
}
// The REAL control this time, and not plan 05-14's stub: the whole point of
// this plan is that the node exists now.
function bfPressUnit(side, unitId) {
  const n = bfShapeOf(side, unitId);
  if (n !== null) { fgPress(n); }
  return n;
}

/* 106. BOTH CLUSTERS ARE ON THE FIGHT TAB AND EACH DRAWS ONE SHAPE PER UNIT OF
   ITS OWN SIDE'S FIGHT ROSTER — the addendum's "on one side, same on the right
   for the other side", read off the page.

   AND THE ROSTER IT FOLLOWS IS THE FIGHT'S, WHICH IS FIGHT-10's DIVISION
   ARRIVING ON A ROSTER RATHER THAN ON A NUMBER. A mid-fight addUnit moves the
   BUILD and leaves the fight slice alone — addUnit's own mutator touches
   s.build and nothing else — so the battlefield must NOT grow a shape for a
   unit that is not in the fight, and it must grow one on the next startFight.
   The harvest comment above row 92 records the same fact from the other end and
   nothing asserted it.

   THE ROSTER-SIGNATURE REBUILD IS DRIVEN THROUGH THE OTHER AXIS THE SIGNATURE
   WATCHES, because the roster axis cannot be moved mid-fight at all: a
   unit-scoped token type created while a fight is running adds a line to every
   shape on the board, and the build-once flag has to notice. Driven through the
   real op and read back as a LINE COUNT per shape. */
A.ops.resetToDefaults();
A.state.flush();
clearPanel();
fgPress(fgStart);
const bfCatsN = bfShapesOf('cats').length;
const bfMechsN = bfShapesOf('mechs').length;
const bfRoster = [A.state.get().fight.cats.units.length,
  A.state.get().fight.mechs.units.length];
const bfKeysSeen = bfShapesOf('cats').map((n) => String(n.dataset.k)).sort();
const bfNamesSeen = bfShapesOf('mechs')
  .map((n) => n.querySelectorAll('.bf-name')[0].textContent);
A.ops.addUnit('cats');
A.state.flush();
const bfCatsAfterAdd = bfShapesOf('cats').length;
const bfBuildAfterAdd = A.state.get().build.cats.units.length;
A.ops.endFight();
A.state.flush();
fgPress(fgStart);
const bfCatsAfterRestart = bfShapesOf('cats').length;
const bfLinesBefore = bfLineNames('cats', 'c1').length;
const bfMidTok = A.ops.createTokenType({
  name: 'Fury', shape: 'tri', color: 'coral', glyph: '', scope: 'unit'
});
A.state.flush();
const bfLinesAfter = bfLineNames('cats', 'c1');
const bfEveryShapeGrew = bfShapesOf('cats')
  .every((n) => n.querySelectorAll('.bf-line').length === bfLinesBefore + 1);
A.ops.removeTokenType(bfMidTok);
A.state.flush();
const bfLinesBack = bfLineNames('cats', 'c1').length;
check(
  '106. THE BATTLEFIELD IS ON THE FIGHT TAB, ONE CLUSTER PER SIDE INSIDE THAT '
    + 'SIDE\'S OWN STATE COLUMN, WITH ONE LABELLED SHAPE PER UNIT — D-27\'s '
    + 'addendum read off the page. THE WORD "STATE" IS D-31\'s AND THE CLAUSE IS '
    + 'TURNED IN THE OPEN: until D-31 the cluster sat in the same root as the '
    + 'picker rows and this row read it there. "separate the current round state '
    + 'from the action input area" puts a cluster of shapes on the side of the '
    + 'boundary that reports what IS, so bfShapesOf reads #state-{side} now. The '
    + 'recorded RED is the run on the commit that moved the markup and had not '
    + 'yet moved this reader: "shapes cats=0 mechs=0 against the fight roster '
    + '[9,3]", with 106b, 92 and 102 red beside it. The claim is otherwise '
    + 'unchanged, and WHICH ROOT is now asserted by row 108 rather than left to '
    + 'this one. Counted per side against the FIGHT roster and not the '
    + 'build one, which is FIGHT-10\'s division arriving on a roster: a '
    + 'mid-fight addUnit moves the build and leaves the fight slice alone, so '
    + 'the cluster must NOT grow a shape for a unit that is not in the fight '
    + 'and MUST grow one on the next start. AND THE BUILD-ONCE FLAG CARRIES A '
    + 'ROSTER SIGNATURE, driven through the axis that can actually move while a '
    + 'fight is running: a unit-scoped token type created mid-fight adds a line '
    + 'to EVERY shape and removing it takes the line away again. A flag that '
    + 'was a bit rather than a fingerprint leaves the cluster drawn for a board '
    + 'that has gone',
  bfCatsN === bfRoster[0] && bfMechsN === bfRoster[1]
    && bfCatsN > 0 && bfMechsN > 0
    && bfKeysSeen.length === bfCatsN
    && bfKeysSeen[0].indexOf('fg/bf/cats/') === 0
    && bfNamesSeen.length === bfMechsN
    && bfNamesSeen.every((s) => typeof s === 'string' && s !== '')
    && bfCatsAfterAdd === bfCatsN && bfBuildAfterAdd === bfCatsN + 1
    && bfCatsAfterRestart === bfCatsN + 1
    && bfLinesAfter.length === bfLinesBefore + 1
    && bfLinesAfter.indexOf(bfMidTok) !== -1
    && bfEveryShapeGrew === true && bfLinesBack === bfLinesBefore
    && errPanel.hidden === true,
  'shapes cats=' + bfCatsN + ' mechs=' + bfMechsN
    + ' against the fight roster ' + JSON.stringify(bfRoster)
    + ' | the mechs\' shapes are labelled ' + JSON.stringify(bfNamesSeen)
    + ' | a mid-fight addUnit left the cluster at ' + bfCatsAfterAdd
    + ' while the build went to ' + bfBuildAfterAdd
    + ' and the next start drew ' + bfCatsAfterRestart
    + ' | lines per shape ' + bfLinesBefore + ' -> ' + bfLinesAfter.length
    + ' -> ' + bfLinesBack + ', every shape grew=' + bfEveryShapeGrew
    + ' | the lines now read ' + JSON.stringify(bfLinesAfter)
);

/* 106b. EACH SHAPE DRAWS THE FIGHT'S HEALTH AND NOT THE BUILD'S ALLOCATION, and
   this row is the MIRROR of check 102's clause about the board.

   102 asserts that the board's own health row does NOT move when a hand ruling
   changes the fight's health, because that row draws the ALLOCATION. This
   asserts the other half on the other surface, in the same drive and at the
   same moment: one hand ruling, and the battlefield's token row moves while the
   board's stands. A later plan pointing either surface at the other slice
   reddens one of the two rows rather than shipping a second, silent answer to
   what a health number on this artifact means. Probe AY drives the violation. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
const bfHpWas = bfToksOf('mechs', 'm1', 'hp');
const bfBoardRow = () =>
  fgBoard.querySelectorAll('.tok-row[data-amt="hp"][data-unit="m1"]')[0] || null;
const bfBoardWas = bfBoardRow() === null ? -1 : bfBoardRow().children.length;
const bfAllocWas = A.state.get().build.mechs.units[0].maxHp;
A.ops.dispatch('setUnitHp', { side: 'mechs', unitId: 'm1', value: bfAllocWas - 2 });
A.state.flush();
const bfHpNow = bfToksOf('mechs', 'm1', 'hp');
const bfBoardNow = bfBoardRow() === null ? -1 : bfBoardRow().children.length;
const bfAllocNow = A.state.get().build.mechs.units[0].maxHp;
const bfLiveNow = A.state.get().fight.mechs.units[0].hp;
check(
  '106b. THE SHAPE DRAWS THE FIGHT\'S HEALTH AND THE BOARD DRAWS THE BUILD\'S '
    + 'ALLOCATION, and both are read off the page in ONE drive so the division '
    + 'cannot be half-kept. FIGHT-10: state.build[].units[].maxHp is what a '
    + 'student spent setting the faction up and state.fight[].units[].hp is '
    + 'what the board holds now. A hand ruling moves the battlefield\'s token '
    + 'row and does NOT move the board\'s, which is check 102\'s clause from '
    + 'the other end. Drawn from the build here, a fight\'s damage would appear '
    + 'not to land at all — a whole exercise spent wondering why the tool was '
    + 'broken',
  bfHpWas === bfAllocWas && bfHpNow === bfAllocWas - 2
    && bfHpNow === bfLiveNow
    && bfBoardWas > 0 && bfBoardNow === bfBoardWas
    && bfAllocNow === bfAllocWas && errPanel.hidden === true,
  'the shape\'s health row ' + bfHpWas + ' -> ' + bfHpNow
    + ' | the board\'s health row ' + bfBoardWas + ' -> ' + bfBoardNow
    + ' | the ALLOCATION ' + bfAllocWas + ' -> ' + bfAllocNow
    + ' | the fight\'s live health is now ' + bfLiveNow
);

/* 106c. A TYPE A STUDENT INVENTED AND STYLED APPEARS IN THE BATTLE EXACTLY AS
   THEY AUTHORED IT — D-07's "they are the same kind of thing", ALLOC-10 and
   D-24's no-second-tier, on the surface that was most likely to grow a second
   token vocabulary of its own.

   DRIVEN THROUGH THE REAL OPS AND NEVER A PLANTED STRING, which is check 47d's
   shipped shape and its reason: a planted string proves nothing about the path
   the word actually travels. The type is CREATED with a shape, a colour and a
   glyph, RESTYLED through setTokenStyle, and RENAMED through renameTokenType,
   and each of the three is read back off the shapes.

   AND THE LABEL CARRIES THE EXEMPTION CHANNEL. This is a new place a student's
   own word reaches the page, and an unmarked one turns a rename into a red CI
   run — the gate asserting the opposite of the requirement, which is 47d's own
   sentence about itself. */
A.ops.resetToDefaults();
A.state.flush();
const bfOwnTok = A.ops.createTokenType({
  name: 'Zeal', shape: 'hex', color: 'violet', glyph: '\u{1F49C}', scope: 'unit'
});
A.ops.setTally('cats', 'c1', bfOwnTok, 4);
A.state.flush();
fgPress(fgStart);
const bfOwnCount = bfToksOf('cats', 'c1', bfOwnTok);
const bfOwnTokNode = bfLineOf('cats', 'c1', bfOwnTok)
  ? bfLineOf('cats', 'c1', bfOwnTok).querySelectorAll('.tok')[0] : null;
const bfOwnClass = bfOwnTokNode === null ? '(no token)' : bfOwnTokNode.className;
const bfOwnGlyph = bfOwnTokNode === null
  ? '(no token)'
  : ((bfOwnTokNode.querySelectorAll('.tok-g')[0] || { textContent: '(no glyph node)' }).textContent);
const bfOwnLabel = bfLabelOf('cats', 'c1', bfOwnTok);
const bfOwnLblNode = bfLineOf('cats', 'c1', bfOwnTok).querySelectorAll('.bf-lbl')[0];
const bfOwnMarked = ('lbl' in bfOwnLblNode.dataset) && bfOwnLblNode.dataset.lbl === bfOwnTok;
A.ops.setTokenStyle(bfOwnTok, { shape: 'dia', color: 'gold', glyph: '\u{1F49B}' });
A.ops.renameTokenType(bfOwnTok, 'Ardour');
A.state.flush();
const bfOwnTokNode2 = bfLineOf('cats', 'c1', bfOwnTok).querySelectorAll('.tok')[0];
const bfOwnClass2 = bfOwnTokNode2 === null ? '(no token)' : bfOwnTokNode2.className;
const bfOwnGlyph2 = bfOwnTokNode2 === null
  ? '(no token)'
  : ((bfOwnTokNode2.querySelectorAll('.tok-g')[0] || { textContent: '(no glyph node)' }).textContent);
const bfOwnLabel2 = bfLabelOf('cats', 'c1', bfOwnTok);
const bfOwnHarvest = harvestInto(dom.byId['app'], [], '#app')
  .filter((e) => e.s === 'Ardour').length;
check(
  '106c. A TOKEN TYPE A STUDENT INVENTED, STYLED AND RENAMED APPEARS ON THE '
    + 'BATTLEFIELD EXACTLY AS THEY AUTHORED IT — the shape suffix, the colour '
    + 'suffix and the glyph on the token node, and their own name on the label '
    + 'beside it. Driven through createTokenType, setTokenStyle and '
    + 'renameTokenType rather than by planting a string, which is 47d\'s shape: '
    + 'a planted string proves nothing about the path the word travels. This is '
    + 'what calling the shipped styleFor / makeToken buys, and it is why this '
    + 'region may not build token nodes of its own. AND THE LABEL CARRIES THE '
    + 'TOKEN-NAME EXEMPTION CHANNEL, so the student\'s word is not harvested '
    + 'into the no-verdict scan — an unmarked one would redden CI on a word the '
    + 'STUDENT chose rather than on one the artifact says',
  bfOwnCount === 4
    && bfOwnClass === 'tok tok--hex tok--violet'
    && bfOwnGlyph === '\u{1F49C}'
    && bfOwnLabel === 'Zeal' && bfOwnMarked === true
    && bfOwnClass2 === 'tok tok--dia tok--gold'
    && bfOwnGlyph2 === '\u{1F49B}'
    && bfOwnLabel2 === 'Ardour'
    && bfOwnHarvest === 0
    && errPanel.hidden === true,
  'as authored: ' + bfOwnCount + ' tokens, class ' + JSON.stringify(bfOwnClass)
    + ', glyph ' + JSON.stringify(bfOwnGlyph)
    + ', label ' + JSON.stringify(bfOwnLabel)
    + ', label carries data-lbl=' + bfOwnMarked
    + ' | after a real restyle and rename: class ' + JSON.stringify(bfOwnClass2)
    + ', glyph ' + JSON.stringify(bfOwnGlyph2)
    + ', label ' + JSON.stringify(bfOwnLabel2)
    + ' | the renamed word appears in the Layer C harvest ' + bfOwnHarvest
    + ' times'
);

/* 106d. COMPACTION IS THE SHIPPED THRESHOLD AND THERE IS NO SECOND ONE. D-20's
   one constant, D-21's count-then-one-token form, read off the live export
   rather than typed as 12 — a row carrying its own copy of the number would
   agree with itself and with nothing else.

   AND THE BOARD IT IS TAKEN ON IS ONE WHERE THE DISTINCTION SHOWS. A compacted
   row is FEWER token nodes and MORE rendered strings than an uncompacted one,
   so a row that only counted nodes would read a compacted row as a smaller
   number rather than as a different form. Both are read: the node count and the
   words. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
const BF_AT = A.render.COMPACT_AT;
A.ops.dispatch('setUnitHp', { side: 'cats', unitId: 'c1', value: BF_AT - 1 });
A.state.flush();
const bfLooseToks = bfToksOf('cats', 'c1', 'hp');
const bfLooseText = bfLineTextOf('cats', 'c1', 'hp');
A.ops.dispatch('setUnitHp', { side: 'cats', unitId: 'c1', value: BF_AT });
A.state.flush();
const bfTightToks = bfToksOf('cats', 'c1', 'hp');
const bfTightText = bfLineTextOf('cats', 'c1', 'hp');
const bfTightCount = (bfLineOf('cats', 'c1', 'hp')
  .querySelectorAll('.tok-count')[0] || { textContent: '(none)' }).textContent;
check(
  '106d. THE BATTLEFIELD COMPACTS AT App.render.COMPACT_AT AND AT NO SECOND '
    + 'THRESHOLD OF ITS OWN. One below it the row draws one token per point; at '
    + 'it the row draws a count, a multiplication sign and exactly ONE token — '
    + 'D-20 and D-21, held on this surface because the same syncRow decides '
    + 'them rather than because this region agreed to. A student who learned '
    + 'the board\'s compaction reads this one the same way. The threshold is '
    + 'read off the LIVE export and never typed here, and both the node count '
    + 'and the rendered words are taken, because a compacted row is fewer nodes '
    + 'and more strings than an uncompacted one and a count alone cannot tell '
    + 'the two forms apart',
  BF_AT > 1 && bfLooseToks === BF_AT - 1 && bfTightToks === 1
    && bfTightCount === String(BF_AT) + '×'
    && bfLooseText !== bfTightText
    && errPanel.hidden === true,
  'COMPACT_AT read off the live export=' + BF_AT
    + ' | at ' + (BF_AT - 1) + ' the row draws ' + bfLooseToks + ' tokens: '
    + JSON.stringify(bfLooseText)
    + ' | at ' + BF_AT + ' it draws ' + bfTightToks + ' token: '
    + JSON.stringify(bfTightText)
    + ' with the count node reading ' + JSON.stringify(bfTightCount)
);

/* 106e. A UNIT RULED DEAD STAYS DRAWN AND IS MARKED, AND A ZERO-HEALTH UNIT
   NOBODY RULED IS DRAWN AS STANDING. FIGHT-06 and D-00d together, on the second
   surface that now has to keep both, and taken FOUR WAYS as check 98 takes them
   on the board — because a state is said more than once and never in colour
   alone, and because probe AB proved a marker derived wrongly on the way to the
   screen leaves the whole repository green.

   THE SECOND DIRECTION IS THE ONE A TIDY IMPLEMENTATION LOSES. A unit driven to
   zero health that nobody ruled has to draw as standing, because that is what
   keeps a student's "it survived on its Shield" ruling representable at all.
   Probe AZ drives the violation from both ends.

   ==========================================================================
   THE ZERO-HEALTH CLAUSE IS TURNED IN THE OPEN UNDER D-33 P2-11, AND IT USED
   TO ASSERT THE DEFECT. Plan 05-D33c.
   ==========================================================================
   It read `bfZeroRead.hp === 0` — the health row draws NO tokens — and that
   was green over the thing the audit photographed: a shape reading "Mech 1 /
   Health" with nothing whatever after the word. The row was asserting that the
   line stayed and never that the line SAID anything, so a labelled empty box
   satisfied it exactly.

   IT NOW ASSERTS THE READING RATHER THAN THE ABSENCE, and the clause is
   STRONGER in both directions. At zero health the line draws the count form —
   the "0×" node and EXACTLY ONE token standing for the type, which is
   [S06.12]'s symQtyRow and D-21's shape, the same notation the lane, the
   picker and the editor all use for a zero. So a page that went back to the
   empty row reddens here, and so does a page that drew a token per point of a
   health a unit does not have. The count node is read BY NAME rather than the
   token counted alone, because one token in a tally row and one token in a
   count form are the same DOM in the first reading and opposite readings in
   the second.

   THE MARKER HALF IS UNTOUCHED AND IS WHY THE TWO LIVE IN ONE ROW: zero health
   still draws NO dead marker and NO sentence, because D-00d is upstream of all
   of this and the whole point of drawing the zero is that the student is the
   one who decides what it means. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
A.ops.dispatch('setUnitHp', { side: 'cats', unitId: 'c2', value: 0 });
A.state.flush();
const bfZeroShape = bfShapeOf('cats', 'c2');
const bfZeroRead = {
  drawn: bfZeroShape !== null,
  marked: bfHasClass(bfZeroShape, 'bf-unit--dead'),
  markerTokens: bfToksOf('cats', 'c2', 'dead'),
  says: (bfZeroShape === null
    ? null : fgLeaves(bfZeroShape).filter((s) => s.indexOf('ruled dead') !== -1)),
  hp: bfToksOf('cats', 'c2', 'hp'),
  // D-33 P2-11: the reading the line now carries, read BY NAME off the count
  // node symQtyRow writes rather than inferred from a token total.
  zeroSaid: (() => {
    const line = bfLineOf('cats', 'c2', 'hp');
    const c = line === null ? null : (line.querySelectorAll('.tok-count')[0] || null);
    return c === null ? null : c.textContent;
  })(),
  zeroText: bfLineTextOf('cats', 'c2', 'hp'),
  flag: A.state.get().fight.cats.units[1].alive
};
fgPress(fgAliveBtn('cats', 'c1'));
const bfDeadShape = bfShapeOf('cats', 'c1');
const bfDeadRead = {
  drawn: bfDeadShape !== null,
  marked: bfHasClass(bfDeadShape, 'bf-unit--dead'),
  markerTokens: bfToksOf('cats', 'c1', 'dead'),
  says: (bfDeadShape === null
    ? null : fgLeaves(bfDeadShape).filter((s) => s.indexOf('ruled dead') !== -1)),
  hp: bfToksOf('cats', 'c1', 'hp'),
  flag: A.state.get().fight.cats.units[0].alive,
  disabled: bfDeadShape === null ? null : bfDeadShape.disabled
};
fgPress(fgAliveBtn('cats', 'c1'));
const bfBackRead = {
  drawn: bfShapeOf('cats', 'c1') !== null,
  marked: bfHasClass(bfShapeOf('cats', 'c1'), 'bf-unit--dead'),
  markerTokens: bfToksOf('cats', 'c1', 'dead'),
  flag: A.state.get().fight.cats.units[0].alive
};
check(
  '106e. A UNIT A STUDENT RULED DEAD IS STILL A SHAPE ON THE BATTLEFIELD AND IT '
    + 'IS MARKED, AND A UNIT AT ZERO HEALTH THAT NOBODY RULED IS DRAWN AS '
    + 'STANDING. FIGHT-06 — dead units stay visible rather than disappearing — '
    + 'and D-00d, the file\'s oldest ruling, on the surface a student is '
    + 'actually looking at during a fight. FOUR READINGS each, as check 98 '
    + 'takes them on the board: the shape is still there, its class says dead, '
    + 'the marker token is there, and the artifact\'s own sentence is beside '
    + 'it. The shape at zero health keeps its full health row and NO marker, '
    + 'which is the direction a tidy implementation loses and the one that '
    + 'keeps a Shield ruling representable. And a unit ruled and then ruled '
    + 'back returns to the first, so nothing here is sticky. NEITHER IS EVER '
    + 'DISABLED. THE ZERO-HEALTH CLAUSE IS TURNED IN THE OPEN UNDER D-33 P2-11 '
    + 'AND IT USED TO ASSERT THE DEFECT: it required the health row to draw NO '
    + 'tokens, which is a labelled empty box — "Health" and then nothing — and '
    + 'is exactly what the audit photographed. It now requires the line to SAY '
    + 'its zero in [S06.12]\'s own count form, the "0×" node read by name plus '
    + 'exactly one token standing for the type, so both the old empty row and a '
    + 'row drawing a health the unit does not have redden here',
  bfZeroRead.drawn === true && bfZeroRead.marked === false
    && bfZeroRead.markerTokens === 0 && bfZeroRead.says.length === 0
    && bfZeroRead.hp === 1 && bfZeroRead.zeroSaid === '0×'
    && bfZeroRead.flag === true
    && bfDeadRead.drawn === true && bfDeadRead.marked === true
    && bfDeadRead.markerTokens === 1 && bfDeadRead.says.length === 1
    && bfDeadRead.hp > 0 && bfDeadRead.flag === false
    && bfDeadRead.disabled === false
    && bfBackRead.drawn === true && bfBackRead.marked === false
    && bfBackRead.markerTokens === 0 && bfBackRead.flag === true
    && errPanel.hidden === true,
  'c2 at zero health that nobody ruled=' + JSON.stringify(bfZeroRead)
    + ' | c1 at full health that a student ruled=' + JSON.stringify(bfDeadRead)
    + ' | c1 ruled back=' + JSON.stringify(bfBackRead)
);

/* 106f. THE LIT SET IS EXACTLY THE OPPOSING SIDE'S UNITS WHILE A CHANGE OF
   TARGET IS HALF MADE, AND EMPTY AT EVERY OTHER MOMENT.

   THIS ROW EXISTS BECAUSE THE RULE LIVES IN TWO PLACES AND NEITHER CAN CALL THE
   OTHER. [S07.5]'s fgMayPoint decides which side a press may COMPLETE on;
   [S06.11] decides which side LIGHTS; they are in different IIFEs. Widening one
   without the other lights a unit a press then declines, or leaves a legal pick
   dark, and neither of those raises anything. So the set is COMPARED AGAINST
   THE ROSTER rather than counted — a count would be green over a page that lit
   the wrong side's units in the right number. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
const bfLitRest = bfLitKeys();
fgDeclare('cats', fgAtCatsAct, 'c1');
const bfLitDeclared = bfLitKeys();
fgPress(fgAtBtnOf('cats', 'c1'));
const bfLitArmed = bfLitKeys();
const bfLitWant = bfRosterKeys('mechs');
const bfLitWords = fgBar.querySelectorAll('[data-fg="bf"]')
  .filter((n) => {
    const w = n.querySelectorAll('.bf-pick')[0];
    return w !== undefined && w.hidden === false && w.textContent !== '';
  }).length;
const bfLitDisabled = fgBar.querySelectorAll('[data-fg="bf"]')
  .filter((n) => n.disabled === true).length;
fgPress(fgAtBtnOf('cats', 'c1'));
const bfLitCancelled = bfLitKeys();
check(
  '106f. WHILE A CHANGE OF TARGET IS HALF MADE THE OPPOSING SIDE\'S UNITS LIGHT '
    + 'ON THE BATTLEFIELD AND NOTHING ELSE DOES, and at every other moment '
    + 'NOTHING lights. The lit set is compared against the opposing roster as a '
    + 'SET rather than counted, because the rule that decides it lives in two '
    + 'regions that cannot call each other — [S07.5]\'s one-line predicate says '
    + 'which side a press may complete on and [S06.11] says which side lights, '
    + 'and a count would be green over a page that lit the wrong side\'s units '
    + 'in the right number. THE STATE IS SAID IN TWO CHANNELS AND COLOUR IS '
    + 'NEITHER: the class, and a real text node a screen reader and this walk '
    + 'both read. AND NOTHING LIT IS DISABLED — lit is not enabled and unlit is '
    + 'not disabled',
  bfLitRest.length === 0 && bfLitDeclared.length === 0
    && bfLitArmed.join('|') === bfLitWant.join('|')
    && bfLitWant.length > 0
    && bfLitWords === bfLitWant.length
    && bfLitDisabled === 0
    && bfLitCancelled.length === 0 && errPanel.hidden === true,
  'lit at rest=' + JSON.stringify(bfLitRest)
    + ' | lit with a declaration standing=' + JSON.stringify(bfLitDeclared)
    + ' | lit with the change half made=' + JSON.stringify(bfLitArmed)
    + ' | the opposing roster=' + JSON.stringify(bfLitWant)
    + ' | shapes showing the word=' + bfLitWords
    + ' | lit shapes disabled=' + bfLitDisabled
    + ' | lit after the change was cancelled=' + JSON.stringify(bfLitCancelled)
);

/* 106g. A PRESS ON A LIT SHAPE MOVES ONLY WHAT THE DECLARATION POINTS AT, AND A
   PRESS AT REST MOVES NOTHING AT ALL.

   THIS IS 104d AND 104e's CLAIM DRIVEN THROUGH THE REAL CONTROL. Those two rows
   pressed a stub node plan 05-14 built to the key contract and took away again,
   because the arm existed and its sender did not; the sender exists now, so the
   same claim is taken on the node a student actually presses. Both rows stay:
   theirs assert the ARM, this asserts the CONTROL, and a plan that broke the
   spelling between them would redden here while they stayed green.

   THE SECOND PERFORMER IS NOT DECORATION, and 104d's paragraph says why at
   length: commit() coalesces two commits under the same label inside 500ms, a
   declare and an immediate retarget of ONE performer share a label by design,
   and an undo over the pair would take the declaration with it. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
A.state.restore(JSON.stringify(A.state.get()));
A.state.flush();
fgDeclare('cats', fgAtCatsAct, 'c1');
const bfRtFirst = JSON.stringify(fgDeclOf('cats', 'c1'));
fgDeclare('cats', fgAtCatsAct, 'c2');
const bfRtDepthWas = A.state.undoDepth();
const bfRtLenWas = A.state.get().fight.decl.length;
fgPress(fgAtBtnOf('cats', 'c1'));
const bfRtPressed = bfPressUnit('mechs', 'm3');
const bfRtMoved = fgDeclOf('cats', 'c1');
const bfRtHalfAfter = fgHalfOf('cats');
const bfRtLenNow = A.state.get().fight.decl.length;
const bfRtDepthNow = A.state.undoDepth();
fgPress(fgUndoBtn);
const bfRtUndone = JSON.stringify(fgDeclOf('cats', 'c1'));
const bfRtOther = fgDeclOf('cats', 'c2');
// and a press at rest
const bfRestState = JSON.stringify(A.state.get());
const bfRestPage = fgLeaves(fgBar).join('|');
bfPressUnit('mechs', 'm2');
const bfRestStateNow = JSON.stringify(A.state.get());
const bfRestPageNow = fgLeaves(fgBar).join('|');
check(
  '106g. A PRESS ON A LIT BATTLEFIELD SHAPE MOVES ONLY WHAT THE DECLARATION '
    + 'POINTS AT, AND A PRESS AT REST MOVES NOTHING AND OPENS NOTHING. The '
    + 'side, the action and the performer all stand, the declaration list does '
    + 'not grow because [S05] replaces a performer\'s record in place, the two '
    + 'half-made attributes are cleared by the same press, and ONE press of the '
    + 'topbar undo puts the old target back while the neighbour declaration '
    + 'stands untouched. THIS IS 104d AND 104e\'s CLAIM ON THE REAL CONTROL '
    + 'RATHER THAN ON THE STUB PLAN 05-14 BUILT TO THE KEY CONTRACT: both rows '
    + 'stay, because theirs assert the arm and this asserts the sender, and a '
    + 'plan that broke the spelling between them reddens here while they stay '
    + 'green',
  bfRtPressed !== null
    && bfRtMoved !== null && bfRtMoved.at === 'm3'
    && bfRtMoved.act === fgAtCatsAct && bfRtMoved.by === 'c1'
    && bfRtMoved.side === 'cats'
    && bfRtLenNow === bfRtLenWas && bfRtHalfAfter === '/'
    && bfRtDepthNow === bfRtDepthWas + 1
    && bfRtUndone === bfRtFirst && bfRtOther !== null
    && bfRestState === bfRestStateNow && bfRestPage === bfRestPageNow
    && errPanel.hidden === true,
  'the control pressed carries data-k='
    + JSON.stringify(bfRtPressed === null ? null : bfRtPressed.dataset.k)
    + ' | the record ' + bfRtFirst + ' -> ' + JSON.stringify(bfRtMoved)
    + ' | declarations standing ' + bfRtLenWas + ' -> ' + bfRtLenNow
    + ' | the half-made change after the press='
    + JSON.stringify(bfRtHalfAfter)
    + ' | undo depth ' + bfRtDepthWas + ' -> ' + bfRtDepthNow
    + ' | one undo left ' + bfRtUndone
    + ' | at rest: state moved=' + (bfRestState !== bfRestStateNow)
    + ' page moved=' + (bfRestPage !== bfRestPageNow)
    + ' | error panel hidden=' + errPanel.hidden
);

/* 106h. AND NO KEY COLLIDES, WITH THE BATTLEFIELD PAINTED. Check 94b's reading
   taken again on a page that now carries one more key per unit per side.
   keyed() takes the FIRST match, so a repeated key is a repaint handing the
   keyboard to a node the student was not on. The space is disjoint by
   construction — `fg/bf/{side}/{unit}` cannot collide with `fg/act/...`,
   `fg/at/...` or `fg/alive/...`, and no unit is on two sides — and this row is
   what says the construction held rather than assuming it. THE COUNT IS
   RECORDED so the next plan starts from a reading. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
fgDeclare('cats', fgAtCatsAct, 'c1');
fgPress(fgAtBtnOf('cats', 'c1'));
const bfKeys = {};
const bfKeyDupes = [];
let bfKeyCount = 0;
let bfBfKeys = 0;
(function walk(n) {
  if (n.dataset && typeof n.dataset.k === 'string' && n.dataset.k !== '') {
    bfKeyCount++;
    if (n.dataset.k.indexOf('fg/bf/') === 0) { bfBfKeys++; }
    if (Object.prototype.hasOwnProperty.call(bfKeys, n.dataset.k)) {
      bfKeyDupes.push(n.dataset.k);
    }
    bfKeys[n.dataset.k] = true;
  }
  n.children.forEach(walk);
})(fgApp);
const bfKeyWant = A.state.get().fight.cats.units.length
  + A.state.get().fight.mechs.units.length;
check(
  '106h. EVERY data-k ON THE PAGE IS STILL UNIQUE WITH THE BATTLEFIELD PAINTED '
    + 'AND A CHANGE OF TARGET HALF MADE — 94b\'s reading, taken again on the '
    + 'page this plan added one key per unit per side to. The two key spaces '
    + 'are disjoint by construction and this row is what says the construction '
    + 'held: `fg/bf/` cannot collide with `fg/act/`, `fg/at/` or `fg/alive/`, '
    + 'and no unit is on two sides. Floored on the battlefield\'s own keys '
    + 'being FOUND and counted against both rosters, because a walk over a '
    + 'cluster that was never painted finds no duplicates spotlessly',
  bfKeyDupes.length === 0 && bfBfKeys === bfKeyWant && bfKeyWant > 0
    && bfKeyCount >= 120,
  'keys on the page=' + bfKeyCount + ' of which battlefield keys=' + bfBfKeys
    + ' against both rosters=' + bfKeyWant
    + ' duplicates=' + JSON.stringify(bfKeyDupes)
);

/* 106i. NOTHING ON THE BATTLEFIELD IS EVER DISABLED, on any board, in any
   state. [S07.5]'s banner requires it of this plan BY NAME — "it must never
   disable one. UNLIT IS NOT DISABLED" — and a fourth disable condition is
   exactly what the D-27 overrule does not license: it is scoped to the grid's
   action buttons and this surface is outside it.

   THE WHOLE SET IS COMPARED ACROSS THREE BOARDS rather than one control being
   watched, which is 71c's shape and its reason. The three are the ones on which
   a disable would arrive if it were going to: a funded board, a board driven to
   nothing, and a board with three units ruled dead — the third condition of the
   grid's contract, applied to units whose shapes are right here. */
function bfDisabledField() {
  const out = [];
  // The side list is read off the LIVE export rather than typed here, which is
  // the rule every list in this file keeps: a re-typed copy checks itself.
  A.ops.SIDES.forEach((side) => {
    fgStateRootOf(side).querySelectorAll('[data-fg="bf"]').forEach((n) => {
      out.push(String(n.dataset.k) + '=' + (n.disabled === true));
    });
  });
  return out.sort().join('|');
}
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
const bfOffFunded = bfDisabledField();
// The pool is driven to zero through a REAL Advance rather than by writing a
// number into the slice, which is check 95's own method and its reason:
// advanceRound is the only thing in this file that refills it, so the build is
// set to nothing first and the Advance carries that through.
A.ops.setFactionAp('cats', 0);
A.ops.setFactionAp('mechs', 0);
A.state.flush();
fgAdvancePress();
const bfOffStarved = bfDisabledField();
const bfPools = [A.state.get().fight.cats.ap, A.state.get().fight.mechs.ap];
fgPress(fgAliveBtn('cats', 'c1'));
fgPress(fgAliveBtn('cats', 'c2'));
fgPress(fgAliveBtn('mechs', 'm1'));
const bfOffRuled = bfDisabledField();
const bfRuledFlags = [A.state.get().fight.cats.units[0].alive,
  A.state.get().fight.cats.units[1].alive,
  A.state.get().fight.mechs.units[0].alive];
const bfOffTrue = bfOffRuled.split('|').filter((e) => e.indexOf('=true') !== -1);
check(
  '106i. NOTHING ON THE BATTLEFIELD IS DISABLED, ON ANY BOARD. The whole set of '
    + 'battlefield controls is read on a funded board, on a board whose pools '
    + 'have been driven to nothing, and on a board with three units ruled dead, '
    + 'and compared as a SET both times — 71c\'s shape and its reason: a row '
    + 'watching one control would be green over a page that took every other '
    + 'one away. [S07.5]\'s banner requires this of this plan BY NAME, because '
    + 'an unlit shape is a press that DECLINES QUIETLY and a fourth disable '
    + 'condition is exactly what the D-27 overrule does not license — it is '
    + 'scoped to the grid\'s action buttons and this surface is outside it. '
    + 'Floored on controls being FOUND, because an empty set is identical to '
    + 'an empty set',
  bfOffFunded.split('|').length > 1
    && bfOffFunded === bfOffStarved && bfOffFunded === bfOffRuled
    && bfOffTrue.length === 0
    && bfPools[0] === 0 && bfPools[1] === 0
    && bfRuledFlags.join(',') === 'false,false,false'
    && errPanel.hidden === true,
  'controls compared=' + bfOffFunded.split('|').length
    + ' | funded === starved=' + (bfOffFunded === bfOffStarved)
    + ' | funded === three ruled dead=' + (bfOffFunded === bfOffRuled)
    + ' | fight pools driven to ' + JSON.stringify(bfPools)
    + ' | the three ruled flags=' + JSON.stringify(bfRuledFlags)
    + ' | every =true entry=' + JSON.stringify(bfOffTrue)
);

/* 106j. NODE IDENTITY UNDER A DELTA, AND THIS ROW EXISTS BECAUSE PROBE BA
   FOUND THAT NOTHING IN THIS REPOSITORY ASSERTED IT.

   THE PROBE, AND WHAT IT MEASURED. It replaced this region's syncRow call with
   an ordinary loop — empty the row, append n fresh tokens — keeping compaction
   so that only RULES 2 and 3 were violated. Measured in real Chrome on the
   shipped board, one point of health moved by one hand ruling:

                                          shipped        the loop
       nodes of 3 replaced on a -1            0              3
       nodes replaced on the +1 back          0              2
       tokens playing the entry pop           1              3
       the board's own row (control)          0              0

   THE SUITE WENT 178 OF 179 AND THAT WAS ALMOST A GREEN. The one row that
   reddened was 106c, and it reddened for the WRONG REASON: it compares the
   token's whole className and the loop's tokens carry the entry-pop class, so
   what it caught was an animation flag rather than a replacement. Every other
   row was spotless, because a row that counts tokens cannot tell three surviving
   nodes from three new ones. THAT IS THE FINDING, and this row is the answer to
   it rather than a note in a summary.

   WHY IT MATTERS ENOUGH TO BE A ROW. syncRow's own comment says it: appendChild
   on a node that is already a child is a MOVE, removal from the document
   cancels that element's CSS animations, and re-insertion replays them from the
   beginning — so "every token replaying its pop on a game-feel course artifact
   is a correctness bug, not a polish item". On a nine-health unit the loop
   plays nine pops for one point of damage, and the ONE pop a student is
   supposed to read is lost among eight it invented. Check 100's third clause is
   the only thing in this repository that asserts anything of this shape, one
   region over and about a ledger row rather than a token.

   IT IS DRIVEN THROUGH A REAL HAND RULING IN BOTH DIRECTIONS, because down and
   up fail differently: down is a removal and must move nothing else, up is a
   single append and must animate exactly the one node it appended. */
A.ops.resetToDefaults();
A.state.flush();
clearPanel();
fgPress(fgStart);
const bfIdToks = () => {
  const line = bfLineOf('cats', 'c1', 'hp');
  return line === null ? [] : line.querySelectorAll('.tok');
};
const bfIdHp = A.state.get().fight.cats.units[0].hp;
const bfIdBefore = bfIdToks().length;
bfIdToks().forEach((n, i) => { n.dataset.probeIdentity = String(i); });
A.ops.dispatch('setUnitHp', { side: 'cats', unitId: 'c1', value: bfIdHp - 1 });
A.state.flush();
const bfIdDown = bfIdToks();
const bfIdDownSurv = bfIdDown
  .filter((n) => n.dataset.probeIdentity !== undefined).length;
bfIdDown.forEach((n, i) => { n.dataset.probeIdentity2 = String(i); });
A.ops.dispatch('setUnitHp', { side: 'cats', unitId: 'c1', value: bfIdHp });
A.state.flush();
const bfIdUp = bfIdToks();
const bfIdUpSurv = bfIdUp
  .filter((n) => n.dataset.probeIdentity2 !== undefined).length;
const bfIdUpNew = bfIdUp
  .filter((n) => n.dataset.probeIdentity2 === undefined).length;
const bfIdAnimating = bfIdUp
  .filter((n) => String(n.className).split(/\s+/).indexOf('tok--in') !== -1).length;
check(
  '106j. THE BATTLEFIELD GROWS AND SHRINKS BY DELTA AND NEVER REBUILDS A TOKEN '
    + 'ROW — RULES 2 AND 3, asserted by NODE IDENTITY rather than by a count, '
    + 'because a count cannot tell three surviving nodes from three new ones. '
    + 'Every token is tagged, one hand ruling takes the health DOWN by one, and '
    + 'every remaining node must be the SAME OBJECT; then one takes it back UP '
    + 'and exactly ONE node is new and exactly ONE carries the entry class. '
    + 'This is the animation contract and not a performance one: removal from '
    + 'the document cancels an element\'s CSS animations and re-insertion '
    + 'replays them, so a rebuilt row plays nine pops for one point of damage '
    + 'and the one pop a student is meant to read is lost among eight the tool '
    + 'invented. PROBE BA MEASURED EXACTLY THAT — 3 of 3 nodes replaced against '
    + '0, and 3 tokens animating against 1 — and the whole suite was green over '
    + 'it except one row that caught the animation CLASS by accident. This row '
    + 'is what makes the catch deliberate',
  bfIdBefore === bfIdHp && bfIdBefore > 1
    && bfIdDown.length === bfIdHp - 1
    && bfIdDownSurv === bfIdHp - 1
    && bfIdUp.length === bfIdHp
    && bfIdUpSurv === bfIdHp - 1 && bfIdUpNew === 1
    && bfIdAnimating === 1 && errPanel.hidden === true,
  'the row held ' + bfIdBefore + ' tokens for a unit at ' + bfIdHp + ' health'
    + ' | after -1 it holds ' + bfIdDown.length + ' of which '
    + bfIdDownSurv + ' are the SAME objects (replaced='
    + (bfIdBefore - 1 - bfIdDownSurv) + ')'
    + ' | after +1 it holds ' + bfIdUp.length + ' of which ' + bfIdUpSurv
    + ' are the same objects and ' + bfIdUpNew + ' are new'
    + ' | tokens playing the entry pop=' + bfIdAnimating
);

A.ops.resetToDefaults();
A.state.flush();
clearPanel();

/* --- 107-107d. D-29, DRIVEN. The developer, at the real artifact, with the
   D-28 lane on screen and a screenshot of it attached:

     "show this using the symbols, rather than text"
     "instead of showing cost in 1 Action Points, show it as - then the symbol
      for the action points. Same with the cost of other skills."
     "mouse over tooltip for the text description"

   FOUR ROWS, AND THE SPLIT BETWEEN THEM IS THE SPLIT BETWEEN FOUR DIFFERENT
   WAYS THIS CHANGE CAN BE HALF-DONE AND LOOK FINISHED:

     107  the lane READS in symbols and every reading carries the prose on BOTH
          channels a person can reach - the tooltip and the accessible name.
     107b a type the student INVENTED, STYLED and RENAMED arrives in the lane
          and on an action button as THEY authored it, symbol and word.
     107c a cost is a minus sign and the type's own tokens, compacted at
          App.render.COMPACT_AT and at no second threshold of this change's own.
     107d THE GATE STILL READS THE WORDS. This is the one that matters most and
          it is the wave-1 lesson in its attribute edition: prose that moves
          from textContent into an attribute leaves a scanner that reads only
          textContent, and a scanner that cannot see a surface reports it CLEAN
          FOREVER. Probe BG drives the failure directly.

   THE BOARD IS DRESSED FIRST AND EVERY WORD IS READ OFF THE LIVE VOCABULARY
   rather than typed here, which is check 102's rule and 106c's: a row carrying
   its own copy of a name asserts that this file agrees with itself, and a
   PLANTED string proves nothing about the path a word travels. */
A.ops.resetToDefaults();
A.state.flush();
clearPanel();
// A type the student INVENTED, one they RENAMED, and a restyle on the renamed
// one - three different paths a student's own authoring reaches this surface by.
const symOwnTok = A.ops.createTokenType({
  name: 'Zeal', shape: 'hex', color: 'violet', glyph: '\u{1F49C}', scope: 'unit'
});
A.ops.renameTokenType('shield', 'Ward');
A.ops.setTokenStyle('shield', { shape: 'tri', color: 'coral', glyph: '\u{1F525}' });
A.ops.renameTokenType('hp', 'Grit');
A.state.flush();
fgPress(fgStart);
fgDeclare('cats', fgCatsAct, 'c1');
fgAdvancePress();
fgDeclare('cats', fgCatsAct, 'c2');
fgAdvancePress();
A.state.invalidate();
A.state.flush();

const symState = A.state.get();
const symHpWord = A.render.labelFor(symState, 'hp');
const symShWord = A.render.labelFor(symState, 'shield');
const symLane = fgLedgerRoot.querySelectorAll('.sym');
const symCards = fgLedgerRoot.querySelectorAll('.ld-row');
const symNewest = symCards[symCards.length - 1] || null;

/* 107. EVERY READING IN THE LANE IS A SYMBOL WITH THE PROSE ON BOTH CHANNELS.

   THE FOUR CLAUSES PER READING ARE FOUR SEPARATE WAYS TO SHIP THIS HALF-DONE,
   and they are checked as a COUNT OF FAILURES rather than on one sampled node,
   which is 71c's shape: a row that read the first .sym would be green over a
   lane where every other one had lost its tooltip.
     role="img"            - without it a screen reader reads the count nodes
                             and the label BOTH, which is the sentence twice.
     a non-empty title     - D-29's own sentence.
     aria-label === title  - the two are written from ONE variable in [S06.12]
                             and this is what says they still are. A tooltip
                             without an accessible name is a reading a keyboard
                             cannot reach and assistive technology cannot see.
     a .tok inside         - a reading that drew no symbol is prose with a
                             tooltip, which is the change not having happened.

   AND THE SPLIT'S OWN SENTENCE IS READ BACK VERBATIM, because "Shield took 1 of
   the 1" is the exact reading the developer screenshotted and the exact one
   D-29 asks to see as symbols. It is matched against a pattern built from the
   LIVE label, so a rename moves the row's expectation with the board. */
const symBad = symLane.filter((n) =>
  n.getAttribute('role') !== 'img'
  || typeof n.getAttribute('title') !== 'string'
  || n.getAttribute('title') === ''
  || n.getAttribute('aria-label') !== n.getAttribute('title')
  || n.querySelectorAll('.tok').length === 0).length;
const symActBox = symNewest === null ? null : symNewest.querySelector('.ld-acts');
const symActSyms = symActBox === null ? [] : symActBox.querySelectorAll('.sym');
const symActSaid = symActSyms.map((n) => n.getAttribute('title'));
/* CLAIM TURNED IN THE OPEN UNDER D-30, and the turn is on the PREFIX. The
   split's tooltip read "Shield took 1 of the 1." until D-30 took the minus sign
   out of the text run and made it a red mark on the shape; a state said in
   colour and position alone is the pair [C07] refuses, and inside a role="img"
   the accessible name is the only channel left. So the reading now names the
   removal in words and this pattern says so. THE PREFIX IS READ OFF THE LIVE
   EXPORT and never typed here, which is 107c's rule about COMPACT_AT arriving
   on a string: a row carrying its own copy would assert that the gate agrees
   with itself. */
const symTaken = A.render.SYM_TAKEN;
const symTookRe = new RegExp('^' + symTaken + symShWord
  + ' took \\d+ of the \\d+\\.$');
const symTookSaid = symActSaid.filter((t) => symTookRe.test(t))[0] || '';
const symActText = (symActBox === null ? [] : fgLeaves(symActBox)).join(' ');
const symActNamesType = symActText.indexOf(symHpWord) !== -1
  || symActText.indexOf(symShWord) !== -1;
const symSigns = fgLedgerRoot.querySelectorAll('.sym-sign')
  .filter((n) => n.textContent === '−').length;
/* D-30's OWN CLAUSE, ON THE LANE, AND IT IS WHAT STOPS THE THREE CLAUSES ABOVE
   FROM BEING GREEN BY ACCIDENT. Counting minus signs was the whole of this
   row's reading of the sign and it passed identically before and after D-30 —
   the character did not move out of the DOM, it moved out of the text RUN. So
   the parent is read: every sign in the lane must be a child of a .tok, which
   is the node [C14.5]'s `left:0; top:25%` resolves against and therefore the
   only parent that makes the developer's geometry mean what it says. A sign
   appended to the reading instead would still be one node with one character
   and would still be counted by the line above. */
const symLaneSigns = fgLedgerRoot.querySelectorAll('.sym-sign');
const symSignsOffShape = symLaneSigns.filter((n) => !(n.parentNode
  && n.parentNode.classList && n.parentNode.classList.contains('tok'))).length;
check(
  '107. THE LANE OF EARLIER ROUNDS READS IN SYMBOLS AND THE PROSE IS ON THE '
    + 'HOVER — D-29\'s first and third sentences, driven over three resolved '
    + 'rounds. EVERY symbolic reading in the lane is read, not one sampled one, '
    + 'because a row that checked the first would be green over a lane where '
    + 'every other reading had lost its tooltip. Four clauses each, and each is '
    + 'a different way to ship this half-done: role="img", so a screen reader '
    + 'reads the sentence once rather than the counts and then the sentence; a '
    + 'NON-EMPTY title, which is the developer\'s own ask; an aria-label EQUAL '
    + 'to that title, because the two are written from one variable in [S06.12] '
    + 'and a tooltip without an accessible name is a reading a keyboard cannot '
    + 'reach and assistive technology cannot see; and a token node actually '
    + 'DRAWN inside, because a reading that drew no symbol is prose with a '
    + 'tooltip on it. THE SPLIT\'S OWN SENTENCE IS READ BACK VERBATIM off the '
    + 'tooltip — "Shield took 1 of the 1" is the exact reading the screenshot '
    + 'was of — matched against a pattern built from the LIVE label so a rename '
    + 'moves the expectation with the board, and the action box\'s TEXT is '
    + 'asserted to name NEITHER durability type, which is the clause that says '
    + 'the prose moved rather than that a tooltip was added beside it. The '
    + 'minus signs are counted too: a hit taken is a subtraction and it says '
    + 'so. TWO CLAUSES TURNED IN THE OPEN UNDER D-30, which made the minus a '
    + 'RED MARK ON THE SHAPE rather than a dash beside it. First, the split\'s '
    + 'sentence is matched with the removal PREFIX on it — read off the live '
    + 'export, never typed here — because inside a role="img" the accessible '
    + 'name is the only channel a red mark cannot reach and colour plus '
    + 'position is the pair [C07] refuses to let a state be said in. Second, '
    + 'EVERY minus sign in the lane must be a CHILD OF A .tok: counting the '
    + 'signs passed identically before and after D-30, because the character '
    + 'never left the DOM, only the text run — so the count alone was green by '
    + 'accident and the parent is what says the mark is on the shape',
  symLane.length > 0 && symBad === 0 && symCards.length === 2
    && symActSyms.length > 0 && symTookSaid !== ''
    && symActNamesType === false && symSigns > 0
    && symLaneSigns.length > 0 && symSignsOffShape === 0,
  'the lane carries ' + symLane.length + ' symbolic readings across '
    + symCards.length + ' cards, of which ' + symBad + ' fail one of the four '
    + 'clauses'
    + ' | the newest card\'s action box carries ' + symActSyms.length
    + ' readings and ' + symSigns + ' minus signs are drawn in the lane, of '
    + 'which ' + symSignsOffShape + ' are not parented to a shape'
    + ' | the removal prefix read off the export: ' + JSON.stringify(symTaken)
    + ' | the split reads: ' + JSON.stringify(symTookSaid)
    + ' | its neighbours read: ' + JSON.stringify(symActSaid.slice(0, 4))
    + ' | the action box\'s TEXT names ' + JSON.stringify(symHpWord) + ' or '
    + JSON.stringify(symShWord) + '=' + symActNamesType
    + ' | that text reads: ' + JSON.stringify(symActText.slice(0, 110))
);

/* 107b. A TYPE THE STUDENT AUTHORED ARRIVES AS THEY AUTHORED IT — 106c's claim,
   taken on the two surfaces D-29 changed rather than on the battlefield.

   THE POINT OF THIS ROW IS THAT [S06.12] CALLS styleFor AND makeToken AND
   BUILDS NO TOKEN NODE OF ITS OWN. A region that drew its own mark would be
   free to draw a generic one, and a generic mark for a type a student invented
   is the artifact quietly saying their type is a second-class one — D-24 and
   the whole purpose of Phase 2.1. So both halves are read: THE SYMBOL, by its
   shape suffix, its colour suffix and its glyph, and THE WORD, off the tooltip.

   IT IS DRIVEN THROUGH createTokenType, renameTokenType AND setTokenStyle
   rather than by planting a string, which is 47d's shape: a planted string
   proves nothing about the path a word travels. The RENAMED type is read in the
   LANE and the INVENTED one on an ACTION BUTTON, because those are the two
   places D-29 moved and they reach the vocabulary by different calls. */
const symLaneShield = symLane
  .filter((n) => String(n.getAttribute('title') || '').indexOf(symShWord) !== -1)[0]
  || null;
const symLaneTokCls = symLaneShield === null ? ''
  : String((symLaneShield.querySelectorAll('.tok')[0] || {}).className || '');
const symLaneGlyph = symLaneShield === null ? ''
  : String(((symLaneShield.querySelectorAll('.tok-g')[0] || {}).textContent) || '');
// The INVENTED type as the cost of an action, which is the one path a
// student-made type reaches an action button by: affordability prices action
// points and nothing else, so the report hands back null and the button draws
// the term the student actually wrote.
A.ops.setActionCost('cats', fgCatsAct, 0, symOwnTok, 3);
A.state.invalidate();
A.state.flush();
const symOwnWord = A.render.labelFor(A.state.get(), symOwnTok);
const symCostBox = fgOne(fgSideRootOf('cats'), '.fg-act-cost');
const symCostSym = symCostBox === null ? null : symCostBox.querySelector('.sym');
const symCostSaid = symCostSym === null ? '' : symCostSym.getAttribute('title');
const symCostCls = symCostSym === null ? ''
  : String((symCostSym.querySelectorAll('.tok')[0] || {}).className || '');
const symCostGlyph = symCostSym === null ? ''
  : String(((symCostSym.querySelectorAll('.tok-g')[0] || {}).textContent) || '');
const symCostText = symCostBox === null ? '' : fgLeaves(symCostBox).join(' ');
/* AND THE OTHER PRIMITIVE IS READ TOO, WHICH PROBE BI FOUND THIS ROW MISSING.
   [S06.12] has two shapes of reading — symQty, a QUANTITY of a type, and
   symMark, ONE token standing for the type inside a sentence — and this row as
   first written read only the first: the lane's shield reading and the picker's
   cost are both quantities. Probe BI replaced symMark's `makeToken(styleFor(
   state, tok))` with a hard-coded health token, so every requirement line, the
   shortfall line and every unlanded-term line drew the shipped health mark for
   whatever type they named, AND THE WHOLE SUITE RAN 188 OF 188. A generic mark
   for a type a student invented is the exact failure this row exists to catch,
   and it had no instrument. The requirement line is the site: a requirement
   NAMING the invented type puts symMark on the picker, where its token can be
   read back by shape, colour and glyph like any other. */
A.ops.setActionReq('cats', fgCatsAct, 0, symOwnTok, 2);
A.state.invalidate();
A.state.flush();
const symReqBox = fgOne(fgSideRootOf('cats'), '.fg-req');
const symReqSym = symReqBox === null ? null : symReqBox.querySelector('.sym');
const symReqSaid = symReqSym === null ? '' : symReqSym.getAttribute('title');
const symReqCls = symReqSym === null ? ''
  : String((symReqSym.querySelectorAll('.tok')[0] || {}).className || '');
const symReqGlyph = symReqSym === null ? ''
  : String(((symReqSym.querySelectorAll('.tok-g')[0] || {}).textContent) || '');
const symReqText = symReqBox === null ? '' : fgLeaves(symReqBox).join(' ');
check(
  '107b. A TOKEN TYPE A STUDENT INVENTED, RENAMED AND RESTYLED APPEARS IN THE '
    + 'LANE AND ON AN ACTION BUTTON EXACTLY AS THEY AUTHORED IT — 106c\'s claim '
    + 'taken on the two surfaces D-29 changed. BOTH HALVES: the SYMBOL, by its '
    + 'shape suffix, its colour suffix and its glyph on the token node, and the '
    + 'WORD, off the tooltip — because a symbol that is right with a tooltip '
    + 'that names the shipped type would be a reading that is half theirs. '
    + 'Driven through createTokenType, renameTokenType and setTokenStyle rather '
    + 'than by planting a string, which is 47d\'s shape: a planted string '
    + 'proves nothing about the path the word travels. THIS IS WHAT CALLING '
    + 'styleFor AND makeToken BUYS, and it is why [S06.12] may not build a '
    + 'token node of its own — a region free to draw its own mark is free to '
    + 'draw a generic one, and a generic mark for a type a student invented is '
    + 'the artifact saying their type is a second-class one. The cost box\'s '
    + 'TEXT is asserted to name the type NOWHERE, so the word arrived on the '
    + 'hover rather than beside it. AND BOTH OF [S06.12]\'s SHAPES ARE READ, '
    + 'which probe BI proved this row was missing: symQty draws a QUANTITY and '
    + 'symMark draws ONE token standing for the type inside a sentence, and as '
    + 'first written this row read only the first. A hard-coded health token in '
    + 'symMark made every requirement line, every shortfall line and every '
    + 'unlanded-term line draw the shipped mark for whatever type they named, '
    + 'and the whole suite ran 188 of 188 over it. The same invented type is '
    + 'now put on an action as a REQUIREMENT and read back off the picker\'s '
    + 'own reading line, symbol and word, with the sentence around it intact. '
    + 'THE TWO EXPECTED TOOLTIPS DIFFER BY THE REMOVAL PREFIX UNDER D-30 AND '
    + 'THAT DIFFERENCE IS THE POINT: a COST removes something and says so, a '
    + 'REQUIREMENT removes nothing and must NOT say so — [S06.7]\'s own comment '
    + 'rules on it and [S06.12]\'s banner names the two surfaces the mark may '
    + 'appear on. A prefix applied to every reading rather than to every '
    + 'removal would pass the cost clause and fail this one',
  symLaneShield !== null && symLaneTokCls.indexOf('tok--tri') !== -1
    && symLaneTokCls.indexOf('tok--coral') !== -1 && symLaneGlyph !== ''
    && symCostSym !== null && symCostCls.indexOf('tok--hex') !== -1
    && symCostCls.indexOf('tok--violet') !== -1
    && symCostGlyph === '\u{1F49C}'
    && symCostSaid === A.render.SYM_TAKEN + '3 ' + symOwnWord
    && symCostText.indexOf(symOwnWord) === -1
    && symReqSym !== null && symReqCls.indexOf('tok--hex') !== -1
    && symReqCls.indexOf('tok--violet') !== -1
    && symReqGlyph === '\u{1F49C}'
    && symReqSaid === symOwnWord
    && symReqText.indexOf(symOwnWord) === -1
    && symReqText.indexOf(' needs 2 ') !== -1,
  'the RENAMED type in the lane: tooltip=' + JSON.stringify(
    symLaneShield === null ? null : symLaneShield.getAttribute('title'))
    + ' token class=' + JSON.stringify(symLaneTokCls)
    + ' glyph=' + JSON.stringify(symLaneGlyph)
    + ' | the INVENTED type on an action button: tooltip='
    + JSON.stringify(symCostSaid) + ' token class=' + JSON.stringify(symCostCls)
    + ' glyph=' + JSON.stringify(symCostGlyph)
    + ' | the cost box\'s TEXT reads ' + JSON.stringify(symCostText)
    + ' and names ' + JSON.stringify(symOwnWord) + '='
    + (symCostText.indexOf(symOwnWord) !== -1)
    + ' | the same type as a REQUIREMENT, through symMark: tooltip='
    + JSON.stringify(symReqSaid) + ' token class=' + JSON.stringify(symReqCls)
    + ' glyph=' + JSON.stringify(symReqGlyph)
    + ' | the requirement line reads ' + JSON.stringify(symReqText)
);

/* 107c. A COST IS A MINUS SIGN AND THE TYPE'S OWN TOKENS, AND IT COMPACTS AT
   App.render.COMPACT_AT AND AT NO SECOND THRESHOLD OF ITS OWN.

   106d's row, taken on the picker rather than on the battlefield, and it is a
   SEPARATE row for the reason 106d gives about its own surface: the threshold
   is read off the LIVE export and never typed here, and BOTH the node count and
   the rendered words are taken, because a compacted row is fewer nodes and more
   strings than an uncompacted one and a count alone cannot tell the two forms
   apart. D-29's brief says the counts follow the file's existing convention
   rather than inventing a second one; this is what says they did.

   THE SIGN IS ASSERTED TO BE U+2212 AND NOT U+002D, which looks like a
   typographic nicety and is a legibility one: at projector distance a
   hyphen-minus is drawn as a word-joiner and reads as part of the number.

   THE COST IS DRIVEN PAST WHAT THE SIDE CAN PAY AND THE BUTTON GOES DISABLED,
   which is D-27's contract and is left alone here on purpose — this row is
   about the NOTATION, and a reading that stopped being drawn the moment it
   priced something out of reach would be the surface hiding the arithmetic at
   the one moment a student needs it. */
const symBelow = A.render.COMPACT_AT - 1;
A.ops.setActionCost('cats', fgCatsAct, 0, 'ap', symBelow);
A.state.invalidate();
A.state.flush();
const symCostAt = () => fgOne(fgSideRootOf('cats'), '.fg-act-cost');
const symLowBox = symCostAt();
const symLowToks = symLowBox === null ? -1 : symLowBox.querySelectorAll('.tok').length;
const symLowCount = symLowBox === null ? -1
  : symLowBox.querySelectorAll('.tok-count').length;
const symLowSaid = symLowBox === null ? '' : String(
  (symLowBox.querySelector('.sym') || { getAttribute: () => '' }).getAttribute('title'));
const symLowSignNode = symLowBox === null ? null
  : (symLowBox.querySelectorAll('.sym-sign')[0] || null);
const symLowSign = symLowSignNode === null ? ''
  : String(symLowSignNode.textContent || '');
/* D-30, ON THE PICKER: THE SIGN'S PARENT IS THE SHAPE. Read in BOTH of
   syncRow's forms, because they put the first .tok in different places — below
   COMPACT_AT the row is tokens and the shape is the first child, at or above it
   the row is a count and then exactly one token. A mark anchored to the READING
   rather than to the shape looks right in the first form and lands on the left
   edge of "12×" in the second, which is the one arrangement D-30's sentence
   rules out by name. */
const symSignParent = (n) => (n && n.parentNode && n.parentNode.classList
  && n.parentNode.classList.contains('tok'));
const symLowOnShape = symSignParent(symLowSignNode);
A.ops.setActionCost('cats', fgCatsAct, 0, 'ap', A.render.COMPACT_AT);
A.state.invalidate();
A.state.flush();
const symHighBox = symCostAt();
const symHighToks = symHighBox === null ? -1 : symHighBox.querySelectorAll('.tok').length;
const symHighCountNode = symHighBox === null ? null
  : symHighBox.querySelectorAll('.tok-count')[0] || null;
const symHighCount = symHighCountNode === null ? ''
  : String(symHighCountNode.textContent);
const symApWord = A.render.labelFor(A.state.get(), 'ap');
const symHighSaid = symHighBox === null ? '' : String(
  (symHighBox.querySelector('.sym') || { getAttribute: () => '' }).getAttribute('title'));
const symHighText = symHighBox === null ? '' : fgLeaves(symHighBox).join(' ');
const symHighOnShape = symHighBox === null ? false
  : symSignParent(symHighBox.querySelectorAll('.sym-sign')[0] || null);
const symCostTaken = A.render.SYM_TAKEN;
check(
  '107c. A COST ON THE PICKER IS A MINUS SIGN AND THE TYPE\'S OWN TOKENS, AND '
    + 'IT COMPACTS AT App.render.COMPACT_AT AND AT NO SECOND THRESHOLD OF ITS '
    + 'OWN — D-29\'s second sentence, verbatim: "instead of showing cost in 1 '
    + 'Action Points, show it as - then the symbol for the action points". One '
    + 'below the threshold the box draws one token per point and NO count node; '
    + 'at it, exactly ONE token and a count reading "12x", which is D-20 and '
    + 'D-21 held here because the same syncRow decides them rather than because '
    + 'this region agreed to. The threshold is read off the LIVE export and '
    + 'never typed into this row, and BOTH the node count and the rendered '
    + 'words are taken, because a compacted row is fewer nodes and more strings '
    + 'than an uncompacted one and a count alone cannot tell the two apart. THE '
    + 'SIGN IS U+2212 AND NOT U+002D, which is a legibility claim and not a '
    + 'typographic one: at projector distance a hyphen-minus is drawn as a '
    + 'word-joiner and reads as part of the number. TWO CLAUSES TURNED IN THE '
    + 'OPEN UNDER D-30. The tooltip was the EXACT string this button printed '
    + 'before D-29 — the figure, a space, the label — and it now carries the '
    + 'REMOVAL PREFIX in front of those same three pieces in the same order, '
    + 'because D-30 took the minus out of the text run and made it a red mark '
    + 'on the shape: colour and position are two channels and inside a '
    + 'role="img" neither reaches a screen reader, so the name is the third and '
    + 'the only one left. The prefix is read off the LIVE export exactly as the '
    + 'threshold is, never typed here. AND THE SIGN\'S PARENT IS ASSERTED TO BE '
    + 'THE SHAPE IN BOTH FORMS, which is the clause that makes the geometry '
    + 'mean anything: [C14.5]\'s `left:0; top:25%` resolves against .tok, and a '
    + 'sign parented to the reading instead would look right below the '
    + 'threshold and sit on the left edge of "12x" above it. The box\'s own '
    + 'text still names the type nowhere',
  symLowToks === symBelow && symLowCount === 0
    && symLowSign === '−' && symLowOnShape === true && symHighOnShape === true
    && symLowSaid === symCostTaken + String(symBelow) + ' ' + symApWord
    && symHighToks === 1 && symHighCount === String(A.render.COMPACT_AT) + '×'
    && symHighSaid === symCostTaken + String(A.render.COMPACT_AT) + ' '
      + symApWord
    && symHighText.indexOf(symApWord) === -1,
  'COMPACT_AT read off the export=' + A.render.COMPACT_AT
    + ', the removal prefix=' + JSON.stringify(symCostTaken)
    + ' | the sign is parented to the shape below the threshold='
    + symLowOnShape + ' and at it=' + symHighOnShape
    + ' | at ' + symBelow + ': ' + symLowToks + ' tokens, ' + symLowCount
    + ' count nodes, sign=' + JSON.stringify(symLowSign)
    + ', tooltip=' + JSON.stringify(symLowSaid)
    + ' | at ' + A.render.COMPACT_AT + ': ' + symHighToks + ' tokens, count node '
    + JSON.stringify(symHighCount) + ', tooltip=' + JSON.stringify(symHighSaid)
    + ' | the box\'s TEXT reads ' + JSON.stringify(symHighText)
    + ' and names ' + JSON.stringify(symApWord) + '='
    + (symHighText.indexOf(symApWord) !== -1)
);

/* 107d. AND THE GATE STILL READS THE WORDS. THIS IS THE ROW THE WHOLE CHANGE
   TURNS ON.

   The wave-1 lesson is that a surface the walk never reaches reports CLEAN
   FOREVER, and D-29 is that lesson arriving through an attribute: every
   sentence this phase spent five plans writing moves out of textContent and
   into a `title`, and a scanner that reads only textContent would go on
   printing "0 hits" over a fight surface it had stopped reading. Nothing would
   move. No number would change. Probe BG drives exactly that.

   THREE CLAUSES, AND THEY ARE THREE DIFFERENT FAILURES:

     1. A SENTENCE THAT EXISTS NOWHERE IN THE PAGE'S TEXT IS IN THE HARVEST.
        The split's own reading is chosen because it is the strongest available
        example: it is assembled at render time out of a live label and two
        numbers, so it is not a literal anywhere in the file, Layers A and B
        cannot see it, and it appears in NO leaf of #app. If it is in the scan,
        the scan is reading tooltips.
     2. THE ARTIFACT'S HALF OF A MARKED TOOLTIP IS IN THE HARVEST. data-tsay
        removes the student's fragment and MUST NOT remove anything else — an
        exemption that skipped the whole attribute would take "took 1 of the 1"
        out of the only layer that can ever see it, since not one sentence this
        region produces exists as a literal.
     3. THE STUDENT'S HALF IS NOT. ALLOC-10: a student who names a type after a
        word on one of the three lists must not redden CI. The word is one this
        drive RENAMED a type to, so it is a word that reaches the page by the
        real path and appears in no static markup.

   THE HARVEST IS TAKEN HERE AND NOT REUSED FROM ROW 92, because row 92's board
   is not this one and a floor is not an instrument for this question. */
/* AND THE CHANNEL LIST ITSELF IS READ, WHICH IS THE CLAUSE PROBE BG's THIRD
   STAGE PROVED THIS ROW NEEDED. Stage one planted an assembled judgement word
   in a tooltip and rows 92 and 92b reddened by name. Stage two took BOTH
   channels out of LABEL_ATTRS and the harvest fell 590 -> 417, the planted word
   went unseen, and THIS row was one of the four that caught it. Stage three
   took out only `title` — and rows 92 and 92b still reddened, because [S06.12]
   writes the same sentence to `aria-label` from the same variable, while THIS
   ROW STAYED GREEN: its "the sentence is in the scan" clause was satisfied by
   the accessible name. That is a real gap and it is closed by naming both
   channels rather than by inferring them, because a plan that dropped `title`
   from the list would take the tooltip out of the scan and leave every scan in
   this file green on the accessible name alone. */
const symChannels = LABEL_ATTRS.slice();
const symScan = harvestInto(dom.byId['app'], [], '#app');
const symScanText = symScan.map((e) => e.s);
const symLeafText = fgLeaves(dom.byId['app']);
const symMarked = symLane.filter((n) => 'tsay' in n.dataset)[0] || null;
const symMarkedRaw = symMarked === null ? '' : String(symMarked.getAttribute('title'));
const symMarkedWord = symMarked === null ? '' : String(symMarked.dataset.tsay);
const symMarkedStripped = symMarkedRaw.split(symMarkedWord).join(' ');
const symStrippedSeen = symScanText.indexOf(symMarkedStripped) !== -1;
const symWordSeen = symScanText.filter((t) => t.indexOf(symMarkedWord) !== -1).length;
/* THE SPLIT'S SENTENCE IS COMPARED IN ITS STRIPPED FORM, AND THE FIRST DRAFT OF
   THIS ROW COMPARED THE RAW ONE AND WENT RED. That is worth keeping rather than
   quietly correcting, because the red was the row telling the truth: the split's
   tooltip is a MARKED one, so what reaches the harvest is the artifact's half
   with the type's name taken out of it. Asserting the raw string would have been
   asserting that data-tsay does nothing. Both directions are taken now — the
   stripped form present, the raw form absent — which is a strictly sharper pair
   than the one clause the draft had. */
const symTookStripped = symTookSaid.split(symShWord).join(' ');
const symTookInScan = symScanText.indexOf(symTookStripped) !== -1;
const symTookRawInScan = symScanText.indexOf(symTookSaid) !== -1;
const symTookInText = symLeafText.filter((t) => t.indexOf(' took ') !== -1).length;
check(
  '107d. THE PROSE MOVED INTO TOOLTIPS AND THE NO-VERDICT GATE STILL READS IT '
    + '— the row this whole change turns on, and the wave-1 lesson in its '
    + 'attribute edition: a surface the walk never reaches reports clean '
    + 'FOREVER, so words leaving textContent for an attribute is the one way '
    + 'D-29 could have made every scan in this file green by making it blind. '
    + 'THREE CLAUSES, THREE DIFFERENT FAILURES. First, a sentence that exists '
    + 'in NO leaf of #app is present in the harvest: the split\'s reading is '
    + 'assembled at render time from a live label and two numbers, so it is not '
    + 'a literal anywhere and neither source layer can see it — if the scan has '
    + 'it, the scan is reading tooltips. It is compared in its STRIPPED form and '
    + 'the RAW form is asserted ABSENT, which is the pair the first draft of '
    + 'this row did not have: it compared the raw string, went red, and the red '
    + 'was the row telling the truth — this tooltip is a MARKED one, so '
    + 'asserting the raw string would have been asserting that data-tsay does '
    + 'nothing. Second, the ARTIFACT\'S half of a '
    + 'marked tooltip is in the harvest: data-tsay removes the student\'s '
    + 'fragment and must remove nothing else, because an exemption that skipped '
    + 'the whole attribute would take these sentences out of the only layer '
    + 'that can ever see them. Third, the STUDENT\'S half is not, which is '
    + 'ALLOC-10 — and the word is one this drive RENAMED a type to, so it '
    + 'reaches the page by the real path and appears in no static markup. AND '
    + 'FOURTH, LABEL_ATTRS IS READ AND MUST NAME BOTH CHANNELS, which is the '
    + 'clause probe BG\'s third stage proved this row needed: taking only '
    + '`title` out of that list left rows 92 and 92b reddening on the '
    + 'accessible name and left THIS row green, so the tooltip could have '
    + 'dropped out of the scan with nothing saying so. Floored on a marked '
    + 'reading being FOUND, because a lane with none would satisfy every '
    + 'clause by having nothing to strip',
  symMarked !== null && symMarkedWord !== '' && symMarkedRaw !== ''
    && symMarkedStripped !== symMarkedRaw
    && symStrippedSeen === true && symWordSeen === 0
    && symTookSaid !== '' && symTookInScan === true
    && symTookRawInScan === false && symTookInText === 0
    && symChannels.indexOf('title') !== -1
    && symChannels.indexOf('aria-label') !== -1,
  'the harvest reads the attribute channels ' + JSON.stringify(symChannels)
    + ' | it holds ' + symScan.length + ' strings and the page\'s TEXT '
    + symLeafText.length + ' leaves'
    + ' | a sentence that is in no leaf at all — ' + JSON.stringify(symTookSaid)
    + ' — reaches the scan STRIPPED as ' + JSON.stringify(symTookStripped)
    + '=' + symTookInScan + ' and RAW=' + symTookRawInScan
    + ' (leaves containing " took "=' + symTookInText + ')'
    + ' | one marked tooltip reads ' + JSON.stringify(symMarkedRaw)
    + ', its student fragment is ' + JSON.stringify(symMarkedWord)
    + ', the harvest holds the stripped form=' + symStrippedSeen
    + ' as ' + JSON.stringify(symMarkedStripped)
    + ' | harvested strings containing the student\'s word=' + symWordSeen
);

/* 107e. THE REMOVAL MARK, ON EVERY SURFACE THAT DRAWS ONE, AND IN ALL THREE
   CHANNELS — D-30, verbatim: "make the - for removing a resource red and make
   it appear in the top-left corner (25% from the top, center aligned to the
   left edge) of the symbol/shape - rather than a normal dash".

   THIS IS A SEPARATE ROW FROM 107 AND 107c RATHER THAN A THIRD CLAUSE ON
   EITHER, and the reason is the same one 107b was corrected for: those two
   rows each read ONE surface, and the notation is one thing rendered by two.
   107 reads the lane's split facts, 107c reads the picker's costs, and a
   change that fixed one and dropped the other would leave one of them green.
   This row walks #app and finds every mark there is.

   WHAT A RED MARK CANNOT SAY, AND WHY THE ROW COUNTS THREE CHANNELS.
   [C07]'s rule is that a state is never said in colour alone; D-30 moves the
   minus OUT OF THE TEXT RUN and onto the shape, which is colour AND position
   — two channels, both visual, and both invisible to a screen reader, because
   every reading [S06.12] builds carries role="img" and that prunes the sign
   out of the accessibility tree along with the tokens. So three things are
   read for every mark on the page:
     the CHARACTER  - still U+2212, still a real text node, therefore still in
                      every leaf walk and in the Layer C harvest. The mark did
                      not leave the DOM; it left the RUN.
     the PARENT     - a .tok, which is what makes [C14.5]'s `left:0; top:25%`
                      resolve against the shape's own box. This is the whole of
                      the developer's geometry and the node gate's only reach
                      on it; the pixels are browser-checks cells 21 and 21b.
     the NAME       - the reading's title and aria-label, both starting with
                      the removal prefix, from one variable in [S06.12].

   AND THE CONVERSE IS READ TOO, because the two halves can drift apart in
   either direction: a reading whose NAME says a removal must DRAW one, and a
   reading that draws one must SAY so. A prefix applied to every reading would
   pass the first and fail the second; a mark drawn with no prefix fails the
   first. Both are counted as failures across all readings rather than sampled,
   which is 71c's shape and 107's.

   FLOORED ON FINDING A MARK ON BOTH SURFACES BY NAME. A walk that found none
   satisfies every clause spotlessly, and a walk that found four in the lane
   and none on the picker would satisfy them just as well — which is exactly
   the half-done change this row exists to catch. */
const remScan = harvestInto(dom.byId['app'], [], '#app').map((e) => e.s);
const remTaken = A.render.SYM_TAKEN;
const remBoxOf = (n) => {
  let p = n.parentNode;
  while (p && p.classList && !p.classList.contains('sym')) { p = p.parentNode; }
  return (p && p.classList && p.classList.contains('sym')) ? p : null;
};
const remSigns = dom.byId['app'].querySelectorAll('.sym-sign');
const remBad = remSigns.filter((n) => {
  const onShape = n.parentNode && n.parentNode.classList
    && n.parentNode.classList.contains('tok');
  const box = remBoxOf(n);
  const said = box === null ? '' : String(box.getAttribute('title') || '');
  return !(onShape && n.textContent === '−' && box !== null
    && said.indexOf(remTaken) === 0
    && box.getAttribute('aria-label') === said);
}).length;
/* THE OTHER DIRECTION: a reading that SAYS it removes something and draws no
   mark. This is the failure a prefix written at the callers rather than in
   symQty would produce, and it is invisible to the clause above because that
   one starts from the marks. */
const remSaidNoMark = dom.byId['app'].querySelectorAll('.sym')
  .filter((n) => String(n.getAttribute('title') || '').indexOf(remTaken) === 0
    && n.querySelectorAll('.sym-sign').length === 0).length;
const remInLane = fgLedgerRoot === null ? 0
  : fgLedgerRoot.querySelectorAll('.sym-sign').length;
const remOnPicker = ['cats', 'mechs'].reduce((sum, side) => {
  const root = fgSideRootOf(side);
  return sum + (root === null ? 0 : root.querySelectorAll('.sym-sign').length);
}, 0);
const remCharInScan = remScan.filter((s) => s === '−').length;
check(
  '107e. THE REMOVAL MARK IS ON THE SHAPE, ON EVERY SURFACE THAT DRAWS ONE, '
    + 'AND THE REMOVAL IS SAID IN THREE CHANNELS — D-30, verbatim: "make the - '
    + 'for removing a resource red and make it appear in the top-left corner '
    + '(25% from the top, center aligned to the left edge) of the symbol/shape '
    + '- rather than a normal dash". A SEPARATE ROW FROM 107 AND 107c FOR '
    + '107b\'s recorded reason: those two each read ONE surface and the '
    + 'notation is one thing rendered by two, so a change that fixed the lane '
    + 'and dropped the picker would leave one of them spotless. This one walks '
    + '#app. THREE CHANNELS PER MARK, because D-30 moved the sign out of the '
    + 'text RUN and onto the shape — which is colour AND position, both '
    + 'visual, and both pruned out of the accessibility tree by the role="img" '
    + 'every reading carries. So: the CHARACTER is still U+2212 and still a '
    + 'real text node, therefore still in the Layer C harvest, counted there by '
    + 'name; the PARENT is a .tok, which is what makes [C14.5]\'s `left:0; '
    + 'top:25%` resolve against the shape\'s own box rather than the reading\'s '
    + '— the whole of the developer\'s geometry, and this gate\'s only reach on '
    + 'it, the pixels being browser cells 21 and 21b; and the NAME carries the '
    + 'removal prefix on BOTH channels, read off the live export. AND THE '
    + 'CONVERSE: a reading whose name says a removal must DRAW one. The two '
    + 'halves drift in either direction — a prefix written at the callers '
    + 'instead of in symQty passes the first clause and fails this one — and '
    + 'both are counted as FAILURES across every reading rather than sampled. '
    + 'FLOORED ON A MARK BEING FOUND ON BOTH SURFACES BY NAME, because a walk '
    + 'that found four in the lane and none on the picker would satisfy every '
    + 'clause above it',
  remSigns.length > 0 && remBad === 0 && remSaidNoMark === 0
    && remInLane > 0 && remOnPicker > 0
    && remCharInScan >= remSigns.length,
  'the page draws ' + remSigns.length + ' removal marks — ' + remInLane
    + ' in the lane and ' + remOnPicker + ' on the two pickers — of which '
    + remBad + ' fail one of the three channels'
    + ' | readings that SAY a removal and draw no mark=' + remSaidNoMark
    + ' | the prefix read off the export=' + JSON.stringify(remTaken)
    + ' | the character reaches the Layer C harvest ' + remCharInScan
    + ' times against ' + remSigns.length + ' marks drawn'
);

/* 107f. NO COLOUR LITERAL ANYWHERE IN THE FIGHT STYLESHEET — the rule [C07]
   states, [C13] and [C14] each restate about themselves, and NOTHING IN THIS
   REPOSITORY HAS EVER CHECKED. That absence is a probe finding rather than a
   guess: PROBE BM replaced D-30's color-mix with the byte-identical literal
   `#ff6d78` and this gate ran 1216 passed, 189 of 189 and exit 0, with the two
   browser cells that read the mark's POSITION green as well, because a
   hard-coded colour is pixel-identical to a derived one. One browser cell
   caught it, by MOVING --accent-2 and watching the mark fail to follow — and a
   claim that can only be made by a browser is a claim that is unchecked
   wherever Playwright is absent, which is every fresh checkout.

   SO THE SOURCE-SIDE HALF IS ADDED HERE, and the two halves catch different
   things, which is why both are worth having. This row catches the literal
   BEING WRITTEN; cell 21d catches a colour that stopped deriving for any
   reason at all, including one this scan cannot see. Neither subsumes the
   other.

   IT IS SCANNED AS DECLARATIONS AND NOT AS TEXT, and the difference is the
   whole reason a naive version of this row would be unusable. Every id
   selector in this stylesheet begins with the same character a hex literal
   does — `#fightbar`, `#ledger`, `#app` — and a plain `#[0-9a-f]{3,6}` over
   the slice would have to be tuned against them for ever. Comments are
   stripped first (they QUOTE the palette by hex on purpose, and they should
   keep being allowed to), and what is left is cut at `:` and `;` so only
   VALUES are read. 517 declarations, 0 bearing a literal, at the time this row
   was written.

   THE SLICE IS [C14] TO THE CLOSE OF THE STYLE BLOCK, which is every rule this
   phase has added — the fight band, its five sub-blocks including [C14.5]'s
   marks, and [C15]'s view switch. Earlier blocks are NOT scanned, because a
   row that reddened on a colour shipped three phases ago would be a row asking
   this plan to change something D-30 did not touch. Floored on the slice being
   found, on it carrying the rule this plan wrote BY NAME, and on the
   declaration list being non-empty — an empty slice bears no literal
   spotlessly, which is 103b's own recorded reason for flooring its four. */
const hexAt = html.indexOf('[C14] ');
const hexEnd = html.indexOf('</style>');
const hexSlice = (hexAt === -1 || hexEnd === -1 || hexEnd < hexAt) ? ''
  : html.slice(hexAt, hexEnd).replace(/\/\*[\s\S]*?\*\//g, ' ');
const hexDecls = hexSlice.match(/:[^;{}]*[;}]/g) || [];
const hexLiterals = hexDecls.filter((d) => /#[0-9a-fA-F]{3,8}\b/.test(d));
const hexDerived = hexDecls.filter((d) => d.indexOf('var(--') !== -1).length;
const hexHasMark = hexSlice.indexOf('.sym-sign{') !== -1;
const hexMixes = hexDecls.filter((d) => d.indexOf('color-mix(') !== -1).length;
check(
  '107f. NOT ONE COLOUR LITERAL IN THE WHOLE FIGHT STYLESHEET — [C07]\'s rule, '
    + 'which [C13] and [C14] each restate about themselves and which NOTHING '
    + 'IN THIS REPOSITORY HAS EVER CHECKED. That is a probe finding and not a '
    + 'guess: PROBE BM replaced D-30\'s color-mix with the byte-identical '
    + 'literal and this gate ran 1216 passed, 189 of 189 and exit 0, with both '
    + 'browser cells that read the mark\'s POSITION green too, because a typed '
    + 'colour is pixel-identical to a derived one. ONE browser cell caught it, '
    + 'by moving --accent-2 and watching the mark fail to follow — and a claim '
    + 'only a browser can make is unchecked in every fresh checkout, which is '
    + 'where Playwright is absent by design. The two halves catch different '
    + 'things and neither subsumes the other: this one catches the literal '
    + 'being WRITTEN, cell 21d catches a colour that stopped deriving for any '
    + 'reason at all. IT IS SCANNED AS DECLARATIONS AND NOT AS TEXT, because '
    + 'every id selector in this file starts with the character a hex literal '
    + 'does — #fightbar, #ledger, #app — so comments are stripped (they quote '
    + 'the palette by hex on purpose and may keep doing so) and what is left is '
    + 'cut at the colon and the semicolon so only VALUES are read. The slice is '
    + '[C14] to the close of the style block: every rule this phase added, and '
    + 'no earlier one, because a row reddening on a colour shipped three phases '
    + 'ago would be asking this plan to change what it did not touch. Floored '
    + 'on the slice being found, on it carrying [C14.5]\'s own rule BY NAME, '
    + 'and on the declaration list being non-empty — an empty slice bears no '
    + 'literal spotlessly',
  hexSlice.length > 0 && hexHasMark === true && hexDecls.length > 0
    && hexDerived > 0 && hexMixes > 0 && hexLiterals.length === 0,
  'the fight stylesheet slice is ' + hexSlice.length + ' characters and holds '
    + hexDecls.length + ' declarations, of which ' + hexDerived
    + ' read a [C00] token and ' + hexMixes + ' derive one through color-mix()'
    + ' | declarations bearing a colour literal=' + hexLiterals.length
    + ' | the first few: ' + JSON.stringify(hexLiterals.slice(0, 4))
    + ' | the slice carries .sym-sign by name=' + hexHasMark
);

/* --- 108-108b. D-31's SEPARATION, READ OFF THE PAGE (plan 05-D31). The
   developer at the real artifact for the fifth time: "separate the current
   round state from the action input area."

   WHY THIS NEEDS ROWS OF ITS OWN AT ALL, when 106 and 107 already read the
   surface: because every one of them reads a root BY NAME and would go on
   passing over a page that had put the two areas back together. Row 106 asks
   what is inside #state-cats; nothing in this file asked whether #state-cats is
   a different REGION from #decl-cats, whether the state one comes FIRST, or
   whether the picker rows stayed out of it. A repointed reader is not a
   contract — it is a reader agreeing with whatever the page happens to be.

   AND THE ORDER CLAUSE IS 103e's SHAPE FOR 103e's REASON, restated rather than
   pointed at because the cost of getting it wrong is what makes it stick: a
   separation made with a CSS `order` puts the sequence a screen reader walks
   out of step with the sequence the room sees, and every DOM-order check in
   this repository stays green over it. PROBE BB measured exactly that on the
   lane. So three things are read here too — this page's own child order inside
   #fightbar, the artifact's markup slice spelling the same order, and the rule
   bodies that could move either area read BY NAME for `order:` and for a
   reversed direction. The third clause is the one that catches the tidy fix.

   THE PAIRING CLAUSE IS THE HALF A LAYOUT CHANGE LOSES QUIETLY. D-31's own
   sentence is that Cats-left / Mechs-right survives inside each area, and an
   area that had ended up with one column, or with the two in the other order,
   would satisfy every containment clause above. So each area's own .fg-sides is
   read for exactly two .fg-side roots, in roster order, each carrying its
   side's name off the LIVE build rather than a word typed here. */
A.ops.resetToDefaults();
A.state.flush();
clearPanel();
fgPress(fgStart);
const sepKids = dom.byId['fightbar'].children
  .map((n) => String(n.getAttribute('id') || n.className || '?'));
const sepStateAt = sepKids.indexOf('fight-state');
const sepInputAt = sepKids.indexOf('fight-input');
const sepMarkAt = html.indexOf('id="fight-state"');
const sepMarkInputAt = html.indexOf('id="fight-input"');
function sepCssRule(sel) {
  const at = html.indexOf('\n  ' + sel + '{');
  if (at === -1) { return ''; }
  const end = html.indexOf('}', at);
  return end === -1 ? '' : html.slice(at, end + 1);
}
const sepRuleArea = sepCssRule('.fg-area');
const sepRuleSides = sepCssRule('.fg-sides');
const sepRuleSide = sepCssRule('.fg-side');
/* AND THE SCAN IS OVER EVERY RULE THAT CAN REACH THESE BOXES, NOT OVER THREE
   RULES READ BY NAME — PROBE BQ, and it is 103e's own PROBE BB arriving on this
   plan's markup. The first draft read `.fg-area`, `.fg-sides` and `.fg-side` by
   name, exactly as 103e reads its three. The probe added ONE line —
   `.fg-area--input{order:-1}` — which lifts the picker above the state on
   screen while every DOM-order clause in this row stays true, and the whole
   node gate ran 192 of 192, exit 0. A modifier class is not one of the three
   names, and a name list cannot be completed by adding a fourth name.

   SO THE SLICE IS SCANNED AS RULES. Comments are stripped first (they discuss
   `order:` on purpose, and 107f strips them for the same reason arriving from
   the colour side), the slice is cut into selector/body pairs, and any rule
   whose SELECTOR mentions the fight region or one of its boxes has its BODY
   read for `order:` and for a reversed direction. The three by-name reads are
   KEPT as the floor: a slice that came back empty carries no property and
   would pass this row by not existing, which is 103e's recorded reason for
   flooring its own three. */
const sepCssSlice = (() => {
  const at = html.indexOf('[C14] ');
  const end = html.indexOf('</style>');
  return (at === -1 || end === -1 || end < at) ? ''
    : html.slice(at, end).replace(/\/\*[\s\S]*?\*\//g, ' ');
})();
const sepCssRules = (sepCssSlice.match(/[^{}]+\{[^{}]*\}/g) || [])
  .map((r) => {
    const brace = r.indexOf('{');
    return { sel: r.slice(0, brace), body: r.slice(brace) };
  })
  .filter((r) => /\.fg-area|\.fg-side|#fightbar/.test(r.sel));
const sepCssOffenders = sepCssRules.filter((r) =>
  /(^|[;{\s])order\s*:/.test(r.body) || /(row|column)-reverse/.test(r.body));
const sepCssText = sepRuleArea + sepRuleSides + sepRuleSide;
const sepCssOrder = /(^|[;{\s])order\s*:/.test(sepCssText)
  || sepCssOffenders.length > 0;
const sepCssReverse = /(row|column)-reverse/.test(sepCssText);
// WHAT IS IN WHICH, COUNTED IN BOTH DIRECTIONS. A clause that only asked
// whether the battlefield is in the state area would pass over a page that drew
// it in BOTH — which is what a build function copied instead of split produces.
function sepHas(rootId, sel) {
  return dom.byId[rootId].querySelectorAll(sel).length;
}
const sepStateHolds = ['cats', 'mechs'].map((side) => [
  sepHas('state-' + side, '.fg-standing'),
  sepHas('state-' + side, '.fg-field'),
  sepHas('state-' + side, '.fg-team'),
  sepHas('state-' + side, '.fg-rows'),
  sepHas('state-' + side, '.fg-reportbox')
].join(','));
const sepInputHolds = ['cats', 'mechs'].map((side) => [
  sepHas('decl-' + side, '.fg-standing'),
  sepHas('decl-' + side, '.fg-field'),
  sepHas('decl-' + side, '.fg-team'),
  sepHas('decl-' + side, '.fg-rows'),
  sepHas('decl-' + side, '.fg-reportbox')
].join(','));
// THE ROUND FIGURE IS ON THE STATE AREA'S HEAD AND THE TWO CONTROLS ARE ON THE
// INPUT AREA'S, which is where D-31 puts each of them and is the one clause
// that reads a CONTROL rather than a reading. Both are read as counts inside
// each area, so a figure drawn in both areas fails as loudly as one drawn in
// neither.
/* ==========================================================================
   D-33 P1-6 — THE CONTROLS' CLAUSE IS TURNED, IN THE OPEN, AND WHAT IT
   ASSERTS IS STRICTLY STRONGER THAN WHAT IT ASSERTED.
   ==========================================================================
   WHAT STOOD HERE, kept verbatim because it is the record of the probe that
   made this clause and of the reason it has to be replaced rather than relaxed:

     "AND EACH IS READ OFF THE AREA'S OWN HEAD LINE RATHER THAN OFF THE AREA,
      WHICH PROBE BO FORCED. The first draft counted the two controls anywhere
      INSIDE #fight-input, and the probe moved them to the FOOT of that area —
      Advance at 1408 of a 1080 viewport, which is the below-the-fold defect
      this phase has fixed four times — and this row ran 192 of 192, exit 0,
      because both controls were still inside the area it asked about. The
      browser caught it at 1080 and did NOT catch it at 768. So what is asserted
      is where D-31's own arrangement puts them: on the area's HEAD line, above
      the scroller that grows with the roster times the action list."

   D-33 P1-6 MOVES THEM TO THE FOOT — the exact arrangement PROBE BO drove and
   found broken — because the audit measured what the head line cost: the
   destructive control was the brightest object in the region, the commit was a
   plain outline pill, and both sat above the nine rows they act on. "The commit
   follows what it commits."

   SO THE PROPERTY PROBE BO WAS PROTECTING IS ASSERTED DIRECTLY INSTEAD OF BEING
   STOOD IN FOR BY A POSITION. What made the foot unsafe was that nothing held
   the control in the window; what makes it safe is `position:sticky; bottom:0`
   on .fg-round-acts, which cannot be pushed off the fold by any roster at any
   viewport at any setting of any dial in the file. TWO CLAUSES, and neither
   subsumes the other:

     the two controls are inside #fight-input and are its LAST CHILD, which is
       "after the rows" said as child order rather than as a measurement, and is
       the half a CSS reordering would leave true (103e's and PROBE BQ's shape);
     and the STYLESHEET gives .fg-round-acts a sticky position AND a bottom
       inset, read out of the rule body BY NAME. That second clause is 103b's
       idiom held here for the same stated reason: the rule that makes this
       arrangement safe "is one deleted line away at all times", and a row that
       only read child order would be green over the exact page PROBE BO drove.

   NEITHER CLAUSE IS THE MEASUREMENT AND THIS ROW DOES NOT PRETEND TO BE ONE.
   Browser cells 18 and 18c carry the pixels, in two browsers at two sizes, and
   18c is the one that reads Advance and the rows on screen together. */
const sepInputHead = dom.byId['fight-input'].querySelectorAll('.fg-area-head')[0] || null;
const sepStateHead = dom.byId['fight-state'].querySelectorAll('.fg-area-head')[0] || null;
const sepFigInState = sepStateHead === null ? 0 : sepStateHead.querySelectorAll('.fg-round-head').length;
const sepFigInInput = sepHas('fight-input', '.fg-round-head');
const sepActsInInput = sepHas('fight-input', '[data-fg="advance"]')
  + sepHas('fight-input', '[data-fg="reset"]');
const sepActsInState = sepHas('fight-state', '[data-fg="advance"]')
  + sepHas('fight-state', '[data-fg="reset"]');
// ON THE HEAD LINE IS NOW THE FAILURE, which is this clause inverted rather
// than dropped: a page that put them back where D-31 had them fails here.
const sepActsOnHead = sepInputHead === null ? 0
  : sepInputHead.querySelectorAll('[data-fg="advance"]').length
    + sepInputHead.querySelectorAll('[data-fg="reset"]').length;
const sepInputKids = dom.byId['fight-input'].children;
const sepActsLast = sepInputKids.length > 0
  && String(sepInputKids[sepInputKids.length - 1].className || '')
    .indexOf('fg-round-acts') !== -1;
const sepStickyRule = sepCssRule('.fg-round-acts');
const sepSticky = /position\s*:\s*sticky/.test(sepStickyRule)
  && /(^|[;{\s])bottom\s*:/.test(sepStickyRule);
const sepNames = ['fight-state', 'fight-input'].map((areaId) => {
  const sides = dom.byId[areaId].querySelectorAll('.fg-sides');
  if (sides.length !== 1) { return 'sides=' + sides.length; }
  return sides[0].children
    .map((c) => fgLeaves(c)[0] || '?').join('|');
});
const sepWantNames = A.ops.SIDES
  .map((side) => A.state.get().build[side].name).join('|');
check(
  '108. THE ROUND STATE AND THE ACTION INPUT ARE TWO REGIONS, IN THAT ORDER, '
    + 'AND NEITHER HOLDS THE OTHER\'S CONTENTS — D-31, verbatim: "separate the '
    + 'current round state from the action input area". Rows 106 and 107 each '
    + 'read a root BY NAME and would go on passing over a page that had put the '
    + 'two back together, which is why the separation gets a row rather than a '
    + 'repointed reader: a reader that follows the page is a reader that agrees '
    + 'with whatever the page is. FOUR CLAIMS. The ORDER is read three ways — '
    + 'this page\'s own child order inside #fightbar, the artifact\'s markup '
    + 'spelling the same order, and EVERY RULE IN [C14] whose selector reaches '
    + 'one of these boxes scanned for `order:` and for a reversed direction. '
    + 'PROBE BQ is why it is a scan and not three names: the first draft read '
    + 'three rules BY NAME, the probe added one line — .fg-area--input with an '
    + 'order of -1 — which lifts the picker above the state ON SCREEN while '
    + 'every DOM-order clause in this row stays true, and the gate ran 192 of '
    + '192, exit 0. A modifier class is not one of three names, and a name list '
    + 'cannot be completed by adding a fourth name. That is '
    + '103e\'s shape and PROBE BB\'s reason: a separation made in CSS puts the '
    + 'sequence a screen reader walks out of step with the one the room sees and '
    + 'every DOM-order check here stays green over it. The CONTENTS are counted '
    + 'in BOTH directions, because a clause asking only whether the battlefield '
    + 'is in the state area passes over a page that draws it in both — the '
    + 'survivor reading, the cluster and the team resources are in the state '
    + 'column and in NO input column; the picker rows and the reading box are in '
    + 'the input column and in NO state column. The two ROUND CONTROLS are '
    + 'asserted at the FOOT of the INPUT area and the round FIGURE onto the '
    + 'state area\'s head. THAT CLAUSE IS TURNED IN THE OPEN UNDER D-33 P1-6 '
    + 'AND IT USED TO ASSERT THE OPPOSITE — the controls were required to be ON '
    + 'the input area\'s HEAD LINE, and PROBE BO is why: with them moved to the '
    + 'FOOT this row ran 192 of 192 and exit 0 while the Advance stood at 1408 '
    + 'of a 1080 viewport, which is the defect this phase has fixed four times, '
    + 'and the browser caught that at 1080 and did NOT catch it at 768. D-33 '
    + 'P1-6 makes the move the probe found broken — "the commit follows what it '
    + 'commits", after the nine rows it acts on rather than above them — so the '
    + 'property the head line was standing in for is asserted DIRECTLY instead. '
    + 'TWO CLAUSES AND NEITHER SUBSUMES THE OTHER: the row is the LAST CHILD of '
    + '#fight-input, which is "after the rows" said as child order and is the '
    + 'half a CSS reordering leaves true; and the STYLESHEET gives '
    + '.fg-round-acts a sticky position AND a bottom inset, read out of the '
    + 'rule body by name, which is 103b\'s idiom for the same stated reason — '
    + 'the one line that makes the foot safe is one deletion away at all times, '
    + 'and a row reading only child order would be green over the exact page '
    + 'PROBE BO drove. The controls being back on the HEAD line is now a '
    + 'FAILURE rather than the requirement. It is still D-31\'s "Advance lives '
    + 'with the input, since it commits what the input declared" — the pixels '
    + 'are browser cells 18 and 18c, in two browsers at two sizes, and 18c is '
    + 'the one that reads the control and the rows on screen together. And the '
    + 'COLUMN PAIRING survives inside EACH '
    + 'area: exactly two .fg-side roots per area, in roster order, each named '
    + 'off the LIVE build rather than by a word typed into this row',
  sepStateAt !== -1 && sepInputAt !== -1 && sepStateAt < sepInputAt
    && sepMarkAt !== -1 && sepMarkInputAt !== -1 && sepMarkAt < sepMarkInputAt
    && sepRuleArea.length > 0 && sepRuleSides.length > 0 && sepRuleSide.length > 0
    && sepCssRules.length >= 3
    && sepCssOrder === false && sepCssReverse === false
    && sepStateHolds.every((s) => s === '1,1,1,0,0')
    && sepInputHolds.every((s) => s === '0,0,0,1,1')
    && sepFigInState === 1 && sepFigInInput === 0
    && sepInputHead !== null && sepStateHead !== null
    && sepActsInInput === 2 && sepActsInState === 0
    && sepActsOnHead === 0 && sepActsLast === true
    && sepStickyRule.length > 0 && sepSticky === true
    && sepNames.length === 2 && sepWantNames.indexOf('|') !== -1
    && sepNames.every((s) => s === sepWantNames),
  '#fightbar child order=' + JSON.stringify(sepKids)
    + ' | #fight-state at ' + sepStateAt + ', #fight-input at ' + sepInputAt
    + ' | in the markup, at ' + sepMarkAt + ' and ' + sepMarkInputAt
    + ' | rule bodies read, chars: .fg-area=' + sepRuleArea.length
    + ' .fg-sides=' + sepRuleSides.length + ' .fg-side=' + sepRuleSide.length
    + ', carries order:=' + sepCssOrder
    + ' carries a reversed direction=' + sepCssReverse
    + ' | rules in [C14] whose selector reaches these boxes=' + sepCssRules.length
    + ', of which carry order: or a reversed direction=' + sepCssOffenders.length
    + (sepCssOffenders.length === 0 ? ''
      : ' | the first: ' + JSON.stringify(sepCssOffenders[0].sel.trim()))
    + ' | state columns hold standing,field,team,rows,reportbox='
    + JSON.stringify(sepStateHolds)
    + ' | input columns hold the same five=' + JSON.stringify(sepInputHolds)
    + ' | the round figure: state=' + sepFigInState + ' input=' + sepFigInInput
    + ' | Advance and Reset in the input area=' + sepActsInInput
    + ', on that area\'s head line=' + sepActsOnHead
    + ', the row is the area\'s last child=' + sepActsLast
    + ' | .fg-round-acts carries a sticky bottom=' + sepSticky
    + ' (rule body read, ' + sepStickyRule.length + ' chars)'
    + ', in the state area=' + sepActsInState
    + ' | the columns of each area read ' + JSON.stringify(sepNames)
    + ' against the live build\'s ' + JSON.stringify(sepWantNames)
);

/* 108b. AND THE PREVIEW STILL CROSSES THE BOUNDARY, DRIVEN RATHER THAN
   ASSUMED. This is the one BEHAVIOUR a purely structural change could have
   broken silently, and D-31 names it by name: "The spoken-for resource preview
   stays with the resources in the state area ... but continues to react live as
   declarations are made in the input area."

   Before D-31 the reading and the button that moves it were siblings inside one
   root and one repaint. They are now in two different regions of the page, and
   fightBar's per-side pass hands the same `spoke` figure to both — so a version
   of this change that rebuilt only the region the press landed in would leave
   the resources reading a round that is one press stale, on a projector, with
   every structural row above spotlessly green. That is this phase's recurring
   failure and this row is the answer to it.

   THREE MOMENTS AND THE MIDDLE ONE IS THE CLAIM: idle, declared, and undone by
   a second press on the same button — the radio semantics D-27 asked for. The
   reading is taken VERBATIM off the state column each time and must MOVE and
   COME BACK, because a row asserting only that it moved would be green over a
   reading that never returned.

   AND THE TEARDOWN IS HERE TOO, because it is the other half of what the shell
   ruling costs: both areas are bordered, headed panels now, so a fight that has
   ended must put them back behind [hidden] AND empty their columns — otherwise
   a student who never starts a fight, or who ends one, is left reading two
   labelled empty boxes, which is the exact failure #ledger's own hidden rule
   exists for. Read as attributes AND as child counts, because a region hidden
   and full is one CSS change away from being visible and full. */
function sepTeamOf(side) {
  return fgLeaves(fgOne(fgStateRootOf(side), '.fg-team')).join(' ');
}
const sepIdle = sepTeamOf('cats');
const sepActBtn = fgActBtnOf('cats', 'c1', fgCatsAct);
fgPress(sepActBtn);
const sepDeclared = sepTeamOf('cats');
const sepDeclStanding = A.state.get().fight.decl.length;
fgPress(fgActBtnOf('cats', 'c1', fgCatsAct));
const sepUndone = sepTeamOf('cats');
const sepUndoneStanding = A.state.get().fight.decl.length;
A.ops.endFight();
A.state.invalidate();
A.state.flush();
const sepAreasHidden = ['fight-state', 'fight-input']
  .every((id) => dom.byId[id].hidden === true);
const sepRootsHidden = ['state-cats', 'state-mechs', 'decl-cats', 'decl-mechs']
  .every((id) => dom.byId[id].hidden === true);
const sepRootsEmpty = ['state-cats', 'state-mechs', 'decl-cats', 'decl-mechs']
  .reduce((n, id) => n + dom.byId[id].children.length, 0);
const sepFigGone = dom.byId['fightbar'].querySelectorAll('.fg-round-head').length
  + dom.byId['fightbar'].querySelectorAll('.fg-round-acts').length;
check(
  '108b. THE SPOKEN-FOR PREVIEW LIVES IN THE STATE AREA AND STILL MOVES WHEN A '
    + 'BUTTON IN THE INPUT AREA IS PRESSED — D-31\'s own sentence, driven. This '
    + 'is the ONE behaviour a purely structural change could break silently: '
    + 'before D-31 the reading and the control that moves it were siblings in '
    + 'one root, and they are now in two regions of the page. A version of this '
    + 'change that repainted only the region the press landed in would leave the '
    + 'resources one press stale with every structural row above green, which is '
    + 'this phase\'s recurring failure. THREE MOMENTS, TAKEN VERBATIM: idle, '
    + 'declared, and UNDONE by a second press on the same button, which is the '
    + 'radio semantics D-27 asked for — the reading must move AND come back, '
    + 'because a row asserting only that it moved is green over one that never '
    + 'returns. The declaration list is read beside it so a reading that moved '
    + 'for some other reason cannot satisfy this row. AND THE TEARDOWN RIDES '
    + 'HERE, because D-31 gives both areas a border, a heading and a tint: a '
    + 'fight that has ended must put them back behind [hidden] AND empty all '
    + 'four columns AND take the round figure and the two controls off their '
    + 'head lines, or a student who ends a fight is left reading two labelled '
    + 'empty boxes — the exact failure #ledger\'s own hidden rule exists for. '
    + 'Hidden AND empty are read separately, because a region hidden and full is '
    + 'one CSS change away from being visible and full',
  sepIdle !== '' && sepDeclared !== '' && sepUndone !== ''
    && sepIdle !== sepDeclared && sepUndone === sepIdle
    && sepDeclStanding === 1 && sepUndoneStanding === 0
    && sepAreasHidden === true && sepRootsHidden === true
    && sepRootsEmpty === 0 && sepFigGone === 0,
  'the cats team reading in the STATE area, verbatim: idle ' + JSON.stringify(sepIdle)
    + ' -> declared ' + JSON.stringify(sepDeclared)
    + ' -> undone ' + JSON.stringify(sepUndone)
    + ' | declarations standing ' + sepDeclStanding + ' -> ' + sepUndoneStanding
    + ' | after endFight: both areas hidden=' + sepAreasHidden
    + ', all four columns hidden=' + sepRootsHidden
    + ', children left in them=' + sepRootsEmpty
    + ', round figure and controls left on a head line=' + sepFigGone
);

/* --- 109. D-32 ON THE FIGHT SURFACE: A COST THAT NAMES TWO POOLS -------------

   "A multi-token cost spends what it names." Every clause of that reaches a
   different piece of this surface, and the shipped board cannot exercise any of
   them, because every action it ships costs action points and nothing else. So
   the board is DRIVEN into the shape the claim is about: a type the student
   invents at SIDE scope, a tally of it on the side, and an action costing both
   action points and that type — all through the shipped ops.

   FOUR CLAUSES, AND EACH ONE FAILS DIFFERENTLY.

   (a) THE PREVIEW DEPLETES BOTH POOLS. The team resources draw one reading per
       pool and both must move on the declaration and come BACK on the undo,
       because a row that watched only the fall is green over a preview that
       never returns — 108b's own argument, on a second pool.

   (b) THE DISABLE CHECKS THE POOL THE ROW IS SHORT OF, WHICHEVER IT IS. The
       board is driven twice: once where the action-point pool is the binding
       one and once where the student's own pool is, with the other left
       generous. A version of [S06.7] that walked only the ap term is green on
       the first and red on the second, which is precisely the asymmetry a
       single-pool check cannot see. The whole disabled set is compared against
       the model-derived expectation rather than one control, which is 71c's
       shape.

   (c) A COST TERM NAMING SOMETHING THAT IS NOT A POOL DISABLES NOTHING. Health
       is on units; there is no side pool to be short of; and a tool that cannot
       show a side cannot pay does not get to act as though it can. Driven with
       a cost naming health at more than the whole roster holds — every button
       for that action must stay ENABLED.

   (d) THE PICKER DRAWS EVERY TERM. The cost box on the button must carry one
       reading per cost term, each with its own removal mark on its own shape,
       and the box's own text must still name no type — which is 107c's claim
       at a count of four instead of one.

   FLOORED ON THE BOARD ACTUALLY BEING IN THE SHAPE THE CLAIMS ARE ABOUT: the
   action's cost list is read back off state and must hold the terms the drive
   wrote, because every clause above is satisfied spotlessly by a one-term
   cost. --- */
A.ops.resetToDefaults();
A.state.flush();
clearPanel();

const d32Pace = A.ops.createTokenType({
  name: 'Momentum', shape: 'hex', color: 'gold', glyph: '', scope: 'side'
});
const d32Act = A.ops.createAction('cats', 'Surge');
A.ops.setActionCost('cats', d32Act, 0, 'ap', 1);
A.ops.setActionCost('cats', d32Act, 1, d32Pace, 2);
A.ops.setTally('cats', null, d32Pace, 5);
A.ops.setFactionAp('cats', 9);
A.state.flush();
const d32Terms = A.state.get().build.cats.actions
  .filter((a) => a.id === d32Act)[0].cost
  .map((c) => c.tok + ':' + c.n).join(',');

fgPress(fgStart);
A.state.flush();
const d32TeamIdle = fgLeaves(fgOne(fgStateRootOf('cats'), '.fg-team')).join(' ');
fgDeclare('cats', d32Act, 'c1');
const d32TeamSpoken = fgLeaves(fgOne(fgStateRootOf('cats'), '.fg-team')).join(' ');
// (a) both pools moved, and the map behind the reading says so in numbers.
const d32Map = A.model.spokenForPools(A.state.get().build.cats.actions,
  A.state.get().fight.decl, 'cats', A.state.get().build.tokens);
const d32Both = A.model.pooledAt(d32Map, 'ap') === 1
  && A.model.pooledAt(d32Map, d32Pace) === 2;
fgDeclare('cats', d32Act, 'c1');
const d32TeamUndone = fgLeaves(fgOne(fgStateRootOf('cats'), '.fg-team')).join(' ');

// (d) one reading per term on the button, each mark on its own shape.
const d32Btn = fgOne(fgSideRootOf('cats'), '[data-k="fg/act/cats/c1/' + d32Act + '"]');
const d32CostBox = d32Btn ? fgOne(d32Btn, '.fg-act-cost') : null;
// Counted by CLASS and not by attribute selector, which is 107c's own reading:
// each term is one .sym box carrying its own accessible name, and each carries
// one .sym-sign mark parented to a .tok. A count of readings and a count of
// marks are two different failures — a version that drew four shapes under one
// name would satisfy the second and not the first.
const d32Marks = d32CostBox ? d32CostBox.querySelectorAll('.sym').length : -1;
const d32Minus = d32CostBox
  ? d32CostBox.querySelectorAll('.sym-sign').length : -1;
const d32OnShape = d32CostBox
  ? d32CostBox.querySelectorAll('.sym-sign').every((n) => n && n.parentNode
    && n.parentNode.classList && n.parentNode.classList.contains('tok')) : false;
const d32BoxText = d32CostBox ? fgLeaves(d32CostBox).join(' ') : '';

/* THE FIGHT IS RE-SEEDED AFTER EVERY BUILD EDIT BELOW, AND THAT IS FIGHT-10
   RATHER THAN CEREMONY: a pool edited on the build reaches a running fight at
   the NEXT refill and not before, so a row that edited the build and read the
   grid without restarting would be reading last round's pool and would say the
   disable never fired. Measured on the first run of this row: every clause read
   0 buttons off with the fight still holding 9 action points. */
function d32Restart() {
  A.ops.endFight();
  A.state.flush();
  fgPress(fgStart);
  A.state.flush();
}

// (b) the ACTION-POINT pool binding: plenty of Momentum, no action points.
A.ops.setFactionAp('cats', 0);
A.ops.setTally('cats', null, d32Pace, 40);
A.state.flush();
d32Restart();
const d32ApBoundSet = fgInsideGrid(disabledIn(fgApp));
const d32ApBoundWant = fgExpectedBoth();
const d32ApBoundOff = d32ApBoundSet
  .split('|').filter((e) => e.indexOf(d32Act) !== -1 && e.indexOf('=true') !== -1).length;

// (b) the STUDENT'S OWN pool binding: plenty of AP, one Momentum left. A
//     [S06.7] that walked only the ap term reads every one of these as enabled.
A.ops.setFactionAp('cats', 40);
A.ops.setTally('cats', null, d32Pace, 1);
A.state.flush();
d32Restart();
const d32PaceBoundSet = fgInsideGrid(disabledIn(fgApp));
const d32PaceBoundWant = fgExpectedBoth();
const d32PaceBoundOff = d32PaceBoundSet
  .split('|').filter((e) => e.indexOf(d32Act) !== -1 && e.indexOf('=true') !== -1).length;

// (c) a cost naming health, at more than the whole roster holds, disables
//     nothing at all.
A.ops.setActionCost('cats', d32Act, 1, 'hp', 99);
A.ops.setFactionAp('cats', 40);
A.state.flush();
d32Restart();
const d32NoPoolOff = fgInsideGrid(disabledIn(fgApp))
  .split('|').filter((e) => e.indexOf(d32Act) !== -1 && e.indexOf('=true') !== -1).length;
const d32NoPoolRows = A.state.get().build.cats.actions
  .filter((a) => a.id === d32Act)[0].cost.length;

A.ops.resetToDefaults();
A.state.flush();
clearPanel();

check(
  '109. A COST THAT NAMES TWO POOLS DEPLETES BOTH, DISABLES ON WHICHEVER ONE '
    + 'THE ROW IS SHORT OF, AND DRAWS ONE READING PER TERM — D-32, verbatim: '
    + '"allow multiple input for all cost/needs/changes", and the orchestrator '
    + 'call under it that a multi-token cost spends what it names. NOT ONE '
    + 'CLAUSE OF THIS IS REACHABLE ON THE SHIPPED BOARD, because every action '
    + 'the file ships costs action points and nothing else — so the board is '
    + 'driven into the shape through createTokenType, setActionCost twice, '
    + 'setTally and the real start and declare presses. THE TWO BINDING '
    + 'DIRECTIONS ARE BOTH TAKEN and that pair is the point: with the '
    + 'action-point pool short the old single-pool arithmetic is right, and '
    + 'with the STUDENT\'S OWN pool short it is wrong while every other row in '
    + 'this gate stays green. The preview is read verbatim at three moments — '
    + 'idle, declared, undone — because half of the contract is the reading '
    + 'coming BACK. A term naming HEALTH disables nothing, which is D-16 '
    + 'arriving at the term: health lives on units, there is no side pool to '
    + 'be short of, and a tool that cannot show a side cannot pay does not act '
    + 'as though it can. Floored on the cost list actually holding two terms, '
    + 'because every clause here is satisfied spotlessly by a cost of one',
  d32Terms === 'ap:1,t1:2'.replace('t1', d32Pace)
    && d32Both === true
    && d32TeamIdle !== '' && d32TeamSpoken !== ''
    && d32TeamSpoken !== d32TeamIdle && d32TeamUndone === d32TeamIdle
    && d32Marks === 2 && d32Minus === 2 && d32OnShape === true
    && d32BoxText.indexOf('Momentum') === -1
    && d32ApBoundSet === d32ApBoundWant && d32ApBoundOff > 0
    && d32PaceBoundSet === d32PaceBoundWant && d32PaceBoundOff > 0
    && d32NoPoolRows === 2 && d32NoPoolOff === 0,
  'cost terms on the record=' + JSON.stringify(d32Terms)
    + ' | pools spoken for ap/own correct=' + d32Both
    + ' | team reading idle ' + JSON.stringify(d32TeamIdle)
    + ' -> declared ' + JSON.stringify(d32TeamSpoken)
    + ' -> undone ' + JSON.stringify(d32TeamUndone)
    + ' | readings on the button=' + d32Marks + ' removal marks=' + d32Minus
    + ' every mark on a shape=' + d32OnShape
    + ' box names the type=' + (d32BoxText.indexOf('Momentum') !== -1)
    + ' | action-points binding: set matches the model=' + (d32ApBoundSet === d32ApBoundWant)
    + ' buttons off=' + d32ApBoundOff
    + ' | the student\'s own pool binding: set matches the model='
    + (d32PaceBoundSet === d32PaceBoundWant) + ' buttons off=' + d32PaceBoundOff
    + ' | a cost term naming health, cost rows=' + d32NoPoolRows
    + ' buttons off=' + d32NoPoolOff
);

A.ops.resetToDefaults();
A.state.flush();
clearPanel();

/* --- 110. THE MAXED ACTION, END TO END, THROUGH THE REAL CONTROLS -----------

   D-32's hard requirement stated as one drive: an action carrying FOUR cost
   terms, FOUR requirements and FOUR changes is authored in the EDITOR through
   its chooser pills and its amount fields, then declared on the fight picker,
   then resolved by the Advance button, and every reading is taken off the page
   at each step.

   IT IS A SEPARATE ROW FROM 69g AND 109 BECAUSE EACH OF THOSE READS ONE
   SURFACE. 69g reads the editor with the record planted by ops; 109 reads the
   picker and the disable on a two-term cost. Neither of them carries a term
   from a KEYSTROKE all the way to a resolved round, and the seams between them
   are exactly where a slot argument gets dropped: a chooser that wrote every
   pill into slot 0, an amount field that sent no index, a picker that priced
   only the first term, an Advance that spent only the action points. Every one
   of those leaves both of those rows green.

   THE AUTHORING GOES THROUGH THE PILLS AND THE FIELDS AND NEVER THROUGH
   App.ops, which is 69-69f's own rule and its reason: a row that drove the ops
   would assert what the region paints and say nothing about whether a student
   pressing something reaches it. The two ops that have no control on this
   surface — createAction and createTokenType — are driven directly, and the
   editor is opened on the action they made.

   FLOORED IN FOUR PLACES, because this drive is long enough that a step
   quietly doing nothing would leave the rest of it reading a shorter rule than
   it thinks: the record's three list lengths after authoring, the button being
   found on the picker, the declaration standing, and the round actually
   resolving. --- */
A.ops.resetToDefaults();
A.state.flush();
clearPanel();

const e2eSide = A.ops.createTokenType({
  name: 'Momentum', shape: 'hex', color: 'gold', glyph: '', scope: 'side'
});
const e2eUnit = A.ops.createTokenType({
  name: 'Poison', shape: 'circ', color: 'violet', glyph: '', scope: 'unit'
});
const e2eAct = A.ops.createAction('cats', 'Everything');
A.state.flush();

// The editor, opened on the action that was just made, and driven by pressing.
const e2eDlg = dom.byId['act-edit'];
if (e2eDlg.open !== true) { e2eDlg.showModal(); }
A.render.editor(A.state.get(), 'cats', e2eAct);
A.state.flush();

/* ONE TERM WRITTEN THE WAY A STUDENT WRITES ONE: press the token pill in the
   row, then type the amount into that row's field and press Enter. The row is
   re-rendered by the press, so the pill is looked up again for each write
   rather than held across a repaint — which is the same reason [S07.3] records
   the side and the action at focus time. */
function e2eWriteTerm(field, slot, tok, amount, who) {
  if (field === 'xf') {
    const whoPill = aePillFor('xf', slot, 'edWho', who);
    if (whoPill !== undefined) { aePress(whoPill); A.state.flush(); }
  }
  const pill = aePillFor(field, slot, 'edTok', tok);
  if (pill === undefined) { return false; }
  aePress(pill);
  A.state.flush();
  if (field === 'xf') {
    const whoAgain = aePillFor('xf', slot, 'edWho', who);
    if (whoAgain !== undefined) { aePress(whoAgain); A.state.flush(); }
  }
  aeTypeAmount(aeAmtOf(field, slot), String(amount));
  A.state.flush();
  return true;
}

const e2eCostToks = ['ap', e2eSide, 'hp', e2eUnit];
/* THE FOUR REQUIREMENTS ARE ALL READ AT SIDE SCOPE, and that is a finding
   rather than a convenience. The first draft of this drive asked for one of
   the student's PER-UNIT type and the button came back DISABLED, correctly:
   requirements are read on the CASTER SIDE — affordability's own comment says
   so in as many words — and a unit-scope tally is not at side scope, so it
   reads zero and the requirement is unmet. The drive wants the declaration to
   go through, so it asks for four things the side actually holds. The
   unit-scope type is still in the COST list, where it is the term that must
   spend nothing. */
const e2eReqToks = ['hp', 'shield', e2eSide, 'ap'];
const e2eXfToks = ['hp', e2eUnit, 'shield', e2eSide];
const e2eWrites = [];
e2eCostToks.forEach((tok, i) => {
  e2eWrites.push(e2eWriteTerm('cost', i, tok, i + 1));
});
e2eReqToks.forEach((tok, i) => {
  e2eWrites.push(e2eWriteTerm('req', i, tok, 1));
});
e2eXfToks.forEach((tok, i) => {
  e2eWrites.push(e2eWriteTerm('xf', i, tok, i === 0 ? -2 : 1,
    A.data.XF_WHO[i === 0 ? 1 : 0]));
});
if (e2eDlg.open === true) { e2eDlg.close(); }
A.state.flush();

const e2eRec = A.state.get().build.cats.actions.filter((a) => a.id === e2eAct)[0];
const e2eLens = [e2eRec.cost.length, e2eRec.req.length, e2eRec.xf.length];
const e2eCostSaid = e2eRec.cost.map((c) => c.tok + ':' + c.n).join(',');
const e2eCostWant = e2eCostToks.map((tok, i) => tok + ':' + (i + 1)).join(',');

// The board is funded so the requirements are met and both pools can pay.
A.ops.setFactionAp('cats', 9);
A.ops.setTally('cats', null, e2eSide, 9);
A.ops.setUnitShield('cats', 'c1', 2);
A.ops.setTally('cats', 'c1', e2eUnit, 4);
A.state.flush();

fgPress(fgStart);
A.state.flush();
const e2eApBefore = A.state.get().fight.cats.ap;
const e2ePaceBefore = A.state.get().fight.cats.tally
  ? A.state.get().fight.cats.tally[e2eSide] : 0;

// The picker: the button is found by side, performer and action, and its cost
// box must carry one reading per cost term.
const e2eBtn = fgActBtnOf('cats', 'c1', e2eAct);
const e2eBox = e2eBtn === null ? null : fgOne(e2eBtn, '.fg-act-cost');
const e2eReadings = e2eBox === null ? -1 : e2eBox.querySelectorAll('.sym').length;
const e2eOff = e2eBtn === null ? null : e2eBtn.disabled;

fgDeclare('cats', e2eAct, 'c1');
A.state.flush();
const e2eStanding = A.state.get().fight.decl
  .filter((d) => d.side === 'cats' && d.by === 'c1').length;
const e2eTeamSpoken = fgLeaves(fgOne(fgStateRootOf('cats'), '.fg-team')).join(' ');

fgAdvancePress();
A.state.flush();
const e2eRound = A.state.get().fight.round;
const e2eEntry = (A.state.get().fight.past[0]
  && A.state.get().fight.past[0].did[0]) || null;
const e2eSpent = e2eEntry === null ? '' : e2eEntry.spent
  .map((c) => c.tok + ':' + c.want + '/' + c.paid).join(',');
const e2eSpentWant = ['ap:1/1', e2eSide + ':2/2', 'hp:3/0', e2eUnit + ':4/0'].join(',');
const e2ePaceAfter = A.state.get().fight.cats.tally
  ? A.state.get().fight.cats.tally[e2eSide] : 0;
// The lane drew the round, and it drew it in symbols.
const e2eLane = dom.byId['ledger'];
const e2eCards = e2eLane ? e2eLane.querySelectorAll('.ld-row').length : -1;
const e2eLaneSyms = e2eLane ? e2eLane.querySelectorAll('.sym').length : -1;

A.ops.resetToDefaults();
A.state.flush();
clearPanel();

check(
  '110. ONE MAXED ACTION, EDITOR TO LEDGER, THROUGH THE SHIPPED CONTROLS — '
    + 'four cost terms, four requirements and four changes authored by pressing '
    + 'chooser pills and typing into amount fields, then declared on the picker '
    + 'and resolved by Advance, with every reading taken off the page. THIS IS '
    + 'THE ROW THAT WATCHES THE SEAMS. 69g reads the editor over a record ops '
    + 'planted and 109 reads the picker over a two-term cost; neither carries a '
    + 'term from a KEYSTROKE to a resolved round, and the seams between them are '
    + 'exactly where a slot argument gets dropped — a chooser writing every pill '
    + 'into slot 0, a field sending no index, a picker pricing the first term '
    + 'only, an Advance spending only the action points. Every one of those '
    + 'leaves both of those rows green. THE COST IS READ BACK AS AN ORDERED '
    + 'LIST, token and amount, because a drive that wrote four terms in the '
    + 'wrong order would satisfy a length check. THE SPEND IS READ OFF THE '
    + 'ROUND RECORD, term by term, want beside paid: the action points and the '
    + 'side-scope type pay, the health term and the per-unit type pay NOTHING '
    + 'because neither names a pool — and the tool choosing which unit pays '
    + 'would be it adjudicating. THE SIDE POOL LANDS AT 8 AND NOT AT 7, and '
    + 'that arithmetic is the whole loop in one number: the cost took 2 and '
    + 'the rule\'s OWN caster-side change gave 1 back on the same Advance, in '
    + 'the same commit, out of the same bag. A row expecting 7 would be asking '
    + 'the tool to run the cost and drop the student\'s change. Floored in four places because a drive this '
    + 'long has four ways to quietly do less than it says: the three list '
    + 'lengths after authoring, the button being found, the declaration '
    + 'standing, and the round actually resolving',
  e2eWrites.every((ok) => ok === true)
    && e2eLens.join(',') === [A.ops.MAX_ACTION_COST, A.data.MAX_ACTION_REQ,
      A.data.MAX_ACTION_XF].join(',')
    && e2eCostSaid === e2eCostWant
    && e2eBtn !== null && e2eOff === false && e2eReadings === 4
    && e2eStanding === 1 && e2eTeamSpoken.indexOf('spoken for') !== -1
    && e2eRound === 2 && e2eEntry !== null
    && e2eSpent === e2eSpentWant
    && e2eApBefore === 9 && e2ePaceBefore === 9 && e2ePaceAfter === 8
    && e2eCards === 1 && e2eLaneSyms > 0,
  'every write landed=' + e2eWrites.every((ok) => ok === true)
    + ' | list lengths after authoring=' + e2eLens.join('/')
    + ' | cost read back=' + JSON.stringify(e2eCostSaid)
    + ' wanted ' + JSON.stringify(e2eCostWant)
    + ' | picker readings=' + e2eReadings + ' button disabled=' + e2eOff
    + ' | declarations standing=' + e2eStanding
    + ' | team reading after declaring ' + JSON.stringify(e2eTeamSpoken)
    + ' | round after Advance=' + e2eRound
    + ' | spent=' + JSON.stringify(e2eSpent) + ' wanted ' + JSON.stringify(e2eSpentWant)
    + ' | the side pool went ' + e2ePaceBefore + ' -> ' + e2ePaceAfter
    + ' (2 spent by the cost, 1 given back by the rule\'s own caster change)'
    + ' | lane cards=' + e2eCards + ' symbols in the lane=' + e2eLaneSyms
);

A.ops.resetToDefaults();
A.state.flush();
clearPanel();

/* 111. THE EDITOR AND THE FIGHT SAY ONE SENTENCE, AND THE ROW COMPARES THEM
   RATHER THAN ASSERTING BOTH — D-32 part 2, the redirect's own words: "the
   editor and the fight read as one language".

   THE COMPARISON IS THE CLAIM AND A PAIR OF SEPARATE ASSERTIONS IS NOT. A row
   that read "the editor says Removes: 2 Action points" and, separately, "the
   picker says Removes: 2 Action points" is two typed strings agreeing with two
   surfaces, and it stays green on the day one of them changes and the typed
   copy changes with it. What cannot be typed past is the two SURFACES being
   equal to each other: [S06.5]'s termReading and [S06.7]'s fgCostParts both
   call symQty, and the moment one of them passes a different prefix, a
   different suffix or a different removal flag, this row goes red without
   anybody having decided in advance what the sentence ought to be.

   IT IS READ AS AN ORDERED LIST OF TWO, because a cost is an ordered list and
   one term would let an editor that drew the terms backwards pass. The second
   term names a type the student INVENTED, which is the arm data-tsay exists
   for and the one a shipped-type-only drive would never reach.

   THE REMOVAL MARK IS ASKED FOR FOUR TIMES IN ONE BREATH, and the four answers
   are the whole of the ruling [S06.5]'s termReading paragraph makes: a cost
   carries it, a requirement does not, a change DOWNWARD carries it, a change
   UPWARD does not. This is 107b's claim on the fight surface arriving on the
   build surface, and it is a distinction a prefix applied to every reading
   would fail on two of the four.

   AND THE TOOLTIP IS STILL SCANNED, which is the thing that goes wrong
   silently. Words moving into an attribute leave a scanner that reads only
   textContent, and D-29's answer is data-tsay: the harvest reads the tooltip
   with the STUDENT'S fragment removed and the ARTIFACT'S half kept. So the row
   runs the real harvest over the real row and asserts the artifact's words are
   in it and the student's word is not. */
const edSaved = JSON.stringify(A.state.get());
const edTok = A.ops.createTokenType({
  name: 'Vigour', shape: 'hex', color: 'violet', glyph: '', scope: 'unit'
});
const edAct = A.ops.createAction('cats', 'Twin');
A.ops.setActionCost('cats', edAct, 0, 'ap', 2);
A.ops.setActionCost('cats', edAct, 1, edTok, 3);
A.ops.setActionReq('cats', edAct, 0, 'hp', 1);
A.ops.setActionXf('cats', edAct, 0, 'target', 'hp', -3);
A.ops.setActionXf('cats', edAct, 1, 'caster', edTok, 2);
A.state.flush();
aeOpen('cats', edAct);

function edReading(field, slot) {
  const row = aeTermRowOf(field, slot);
  const box = row ? row.querySelector('.ae-term-read') : null;
  const sym = box ? box.querySelector('.sym') : null;
  if (!sym) { return null; }
  const sign = sym.querySelectorAll('.sym-sign')[0] || null;
  return {
    said: sym.getAttribute('title'),
    aria: sym.getAttribute('aria-label'),
    tsay: sym.dataset.tsay,
    toks: sym.querySelectorAll('.tok').length,
    sign: sign !== null,
    onShape: sign !== null
      && String(sign.parentNode.className).split(' ').indexOf('tok') !== -1
  };
}
const edCost = [edReading('cost', 0), edReading('cost', 1)];
const edReq = edReading('req', 0);
const edDown = edReading('xf', 0);
const edUp = edReading('xf', 1);
const edSaidHere = edCost.map((r) => (r === null ? '(none)' : r.said)).join(' | ');
// The harvest over the row that names the student's type, run for real.
const edHarvest = harvestInto(aeTermRowOf('cost', 1), [], '#act-edit')
  .map((e) => e.s).join(' ~ ');
if (aeDialog.open === true) { aeDialog.close(); }
A.state.flush();

// The same action, on the picker, through the shipped controls.
A.ops.setFactionAp('cats', 9);
A.state.flush();
fgPress(fgStart);
A.state.flush();
const edBtn = fgActBtnOf('cats', 'c1', edAct);
const edBox = edBtn === null ? null : fgOne(edBtn, '.fg-act-cost');
const edSaidThere = edBox === null ? '(no box)'
  : edBox.querySelectorAll('.sym')
    .map((n) => n.getAttribute('title')).join(' | ');
A.state.restore(edSaved);
A.state.flush();
clearPanel();

check(
  '111. THE EDITOR DRAWS A TERM IN THE FIGHT\'S OWN NOTATION, AND THE TWO '
    + 'SURFACES ARE COMPARED TO EACH OTHER RATHER THAN EACH TO A TYPED STRING '
    + '— D-32 part 2, "the editor and the fight read as one language". Both '
    + 'readings come through [S06.12]\'s symQty, so an editor that passed a '
    + 'different prefix, suffix or removal flag from the picker fails here with '
    + 'nobody having had to decide in advance what the sentence should say. '
    + 'READ AS AN ORDERED PAIR, because a cost is an ordered list and a single '
    + 'term would pass an editor that drew them backwards; the second names a '
    + 'type the student invented, which is the only arm that exercises '
    + 'data-tsay. THE MARK IS ASKED FOR FOUR TIMES: a cost carries it, a '
    + 'requirement does not, a change DOWNWARD carries it, a change UPWARD does '
    + 'not — 107b\'s distinction arriving on the build surface, and one a prefix '
    + 'written at every reading would fail twice. AND THE REAL HARVEST IS RUN '
    + 'OVER THE ROW: the artifact\'s half of the tooltip must be IN it and the '
    + 'student\'s word must be OUT of it, because a sentence that moved into an '
    + 'attribute and out of the scan reports clean for ever',
  edCost[0] !== null && edCost[1] !== null && edReq !== null
    && edDown !== null && edUp !== null
    && edSaidHere === edSaidThere && edSaidThere.indexOf('(no box)') === -1
    && edCost[0].said === edCost[0].aria && edCost[1].tsay === 'Vigour'
    && edCost[0].toks === 2 && edCost[1].toks === 3
    && edCost[0].sign === true && edCost[0].onShape === true
    && edCost[1].sign === true && edCost[1].onShape === true
    && edReq.sign === false && edDown.sign === true && edDown.onShape === true
    && edUp.sign === false
    && edDown.toks === 3 && edUp.toks === 2
    && edHarvest.indexOf('Removes:') !== -1
    && edHarvest.indexOf('Vigour') === -1,
  'the editor says ' + JSON.stringify(edSaidHere)
    + ' | the picker says ' + JSON.stringify(edSaidThere)
    + ' | marks cost/cost/req/down/up='
    + [edCost[0], edCost[1], edReq, edDown, edUp]
      .map((r) => (r === null ? '(none)' : (r.sign ? 'mark' : 'no mark'))).join('/')
    + ' | tokens drawn=' + [edCost[0], edCost[1], edReq, edDown, edUp]
      .map((r) => (r === null ? '-' : r.toks)).join('/')
    + ' | harvest over the authored-type row=' + JSON.stringify(edHarvest)
);

/* 112. THE DENSITY PASS IS STRUCTURAL, AND IT IS READ OFF THE SHELL, THE STUB
   AND THE STYLESHEET RATHER THAN OFF A SCREENSHOT.

   A HEIGHT IS A BROWSER'S CLAIM AND THIS HARNESS HAS NO LAYOUT ENGINE, so the
   707px the terms region measures is cells 23 and 23b's to make. What this row
   holds is the SHAPE that produces it, which is the half that can be undone by
   an edit rather than by a stylesheet: the eight repeated words are gone, the
   twelve readings that replaced them exist in BOTH pages, and the three lists
   are grouped so the two distances a flat run could not tell apart are two
   numbers.

   .ae-term-lbl IS ASKED FOR ACROSS THE WHOLE DOCUMENT AND NOT ONLY THE MARKUP.
   A class deleted from the shell and left in the stylesheet is a rule for
   nothing; left in the stub it is a node the artifact will never fill.

   AND IT IS ASKED FOR WITH THE COMMENTS STRIPPED, WHICH IS 107f's LESSON
   ARRIVING BY A DIFFERENT DOOR AND WAS THIS ROW'S FIRST RECORDED RED. This
   file's own convention is that a rule a change reverses is QUOTED VERBATIM
   beside the rule that replaced it rather than deleted — [C12] carries the old
   .ae-term-lbl declaration and the old .ae-terms declaration for exactly that
   reason, and D-32 part 1 did the same with the cost chooser's emptying
   entry. So a row scanning raw text finds the class it is asserting gone, and
   finds the OLD gap value ahead of the new one, and reddens over the honesty
   the file requires. Comments are removed first, in both spellings, and what
   is left is what a browser is actually given. */
const dnLive = html.replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/\/\*[\s\S]*?\*\//g, ' ');
/*
   THE STUB IS COUNTED AGAINST THE SHELL IN BOTH DIRECTIONS, which is the
   stub-drift gate's own discipline applied to a CLASS rather than to an id.
   Nothing about this change moved an id, so the id gate reads 135 on both
   sides of it and would have stayed green over a stub that kept twelve label
   spans and grew no reading at all — and [S06.5] fills the reading by class,
   so every row of every editor drive would have quietly drawn nothing.

   THE TWO TICK RULES ARE HERE BECAUSE THEY WERE MISSING, and that is a defect
   this plan found rather than a claim it invented. [C12]'s banner says "the
   live row is marked by an outline AND a tick"; [S06.5]'s choicePill says the
   same about a pill; [C07] writes .pk-sw--on .pk-check for the picker. Only
   .ae-item--on .ae-check was ever written here, so a chooser pill and a side
   button each built a tick, paid for its width, and never showed it. */
const dnLbl = dnLive.indexOf('ae-term-lbl');
const dnShellRead = (dnLive.match(/class="ae-term-read"/g) || []).length;
const dnShellList = (dnLive.match(/class="ae-term-list"/g) || []).length;
const dnShellHead = (dnLive.match(/class="ae-term-head"/g) || []).length;
const dnTermsNode = dom.byId['act-edit-terms'];
const dnStubRead = dnTermsNode
  ? dnTermsNode.querySelectorAll('.ae-term-read').length : -1;
const dnStubLbl = dnTermsNode
  ? dnTermsNode.querySelectorAll('.ae-term-lbl').length : -1;
const dnStubRows = dnTermsNode
  ? dnTermsNode.querySelectorAll('.ae-term').length : -1;
const dnCap = A.ops.MAX_ACTION_COST + A.data.MAX_ACTION_REQ + A.data.MAX_ACTION_XF;
const dnStyle = (dnLive.match(/<style>([\s\S]*?)<\/style>/) || ['', ''])[1];
const dnGapOf = (selector) => {
  const at = dnStyle.indexOf(selector + '{');
  if (at === -1) { return null; }
  const body = dnStyle.slice(at + selector.length + 1,
    dnStyle.indexOf('}', at));
  const hit = body.match(/gap:(\d+)px/);
  return hit === null ? null : Number(hit[1]);
};
const dnOuterGap = dnGapOf('.ae-terms');
const dnInnerGap = dnGapOf('.ae-term-list');
const dnPillTick = dnStyle.indexOf('.ae-pill--on .ae-check');
const dnSideTick = dnStyle.indexOf('.ae-side--on .ae-check');
check(
  '112. THE DENSITY PASS IS STRUCTURAL AND IS READ OFF THE SHELL, THE STUB AND '
    + 'THE STYLESHEET. .ae-term-lbl — the span that printed "Spends" four times '
    + 'and "Needs" four more under legends that already said both — is asked '
    + 'for across the WHOLE document, because a class deleted from the markup '
    + 'and left in the stylesheet is a rule for nothing and left in the stub is '
    + 'a node the artifact will never fill. The twelve readings that replaced '
    + 'it are counted in BOTH pages against the three caps, which is the '
    + 'stub-drift gate\'s discipline applied to a CLASS: this change moved no '
    + 'id, so that gate reads 135 either way and would have passed a stub that '
    + 'kept the labels and grew no reading, leaving every editor drive in this '
    + 'file quietly drawing nothing. The three lists are grouped, and the gap '
    + 'INSIDE a list and the gap BETWEEN two lists are read out of the '
    + 'stylesheet and must DIFFER — one number for two distances is the flat '
    + 'run this pass replaced. AND THE TWO TICK RULES ARE ASSERTED TO EXIST '
    + 'because they did not: [C12], [S06.5] and [C07] all say the live one is '
    + 'an outline AND a tick, and only .ae-item--on .ae-check was ever written, '
    + 'so a pill and a side button each built a tick, paid for its width in '
    + 'every row of every chooser, and never showed it',
  dnLbl === -1
    && dnShellRead === dnCap && dnStubRead === dnCap && dnStubRows === dnCap
    && dnStubLbl === 0
    && dnShellList === 3 && dnShellHead === 3
    && dnOuterGap !== null && dnInnerGap !== null && dnOuterGap !== dnInnerGap
    && dnPillTick !== -1 && dnSideTick !== -1,
  'ae-term-lbl anywhere in the document=' + (dnLbl === -1 ? 'no' : 'at ' + dnLbl)
    + ' | readings in the shell=' + dnShellRead + ' in the stub=' + dnStubRead
    + ' (cap ' + dnCap + ', rows in the stub=' + dnStubRows + ')'
    + ' | label spans left in the stub=' + dnStubLbl
    + ' | lists=' + dnShellList + ' heads=' + dnShellHead
    + ' | gap between lists=' + dnOuterGap + ' inside a list=' + dnInnerGap
    + ' | .ae-pill--on .ae-check=' + (dnPillTick !== -1)
    + ' .ae-side--on .ae-check=' + (dnSideTick !== -1)
);

A.ops.resetToDefaults();
A.state.flush();
clearPanel();

/* --- WHAT THIS GATE CANNOT REACH, named rather than left to be discovered.
       THIS HARNESS has no layout engine, and the stub page is a hand-made
       stand-in rather than a parser. The behaviours numbered below therefore
       have no check above and are carried to the phase's closing rehearsal
       instead.

       AND THE FIRST SENTENCE OF THIS BANNER USED TO SAY "there is no browser
       and no layout engine in this repo", WHICH WAS FALSE AND WAS WHAT PUT
       LAYOUT ITEMS ON A HUMAN'S LIST FOR THREE PHASES. Measured 2026-08-29:
       real Chrome and real Edge both load the artifact from file:// with zero
       page errors and expose real computed geometry, and Playwright 1.62.1
       drives both. tests/browser-checks.mjs is the dev-only harness that does
       it and it skips cleanly where Playwright is absent, so nothing about the
       shipped gate changed. The distinction that matters is therefore no longer
       "reachable or not" but WHICH OF THE TWO: entries that turn on computed
       geometry — 2, 6, 9, 11 and 20 — are MACHINE-closable by a browser and
       are not this gate's to close; entries that turn on a person reading
       something — 4, 8, 10, 18 — are not closable by any machine at all. (The count was written as "four" when the
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
         5. Any words Layer C's page does not currently show. THE FIGHT-MODE
            HALF OF THIS ENTRY IS CLOSED, by plan 05-01, and the sentence that
            used to stand here is kept so the closure is legible rather than
            merely absent: "The walk reads #app as the stub page renders it in
            setup mode, so a string that appears only once the fight has started
            is outside its reach until that surface is built and the walk is
            pointed at it." The walk is now pointed at it. Row 92 takes a SECOND
            harvest of #app with a fight actually running, driven through the
            real startFight(), and scans it through the same word list — so the
            copy plans 05-07, 05-08 and 05-09 are about to write is inside the
            gate's reach before any of it exists. The dialog half was closed the
            same way one phase earlier, by plan 03.1-01.
            WHAT STILL STANDS, and it is the static-markup half rather than the
            fight half: the stub is a hand-made stand-in and not a parser, so
            text written directly into the HTML is empty here and only the text
            the artifact RENDERS is read. Layers A and B still read all of it in
            the source; it is the assembled-at-render case that Layer C exists
            for, and now reads in three page states rather than one. What no
            number of page states reaches is copy that is never painted in any of
            them — see 13, which this plan widened to say so.
            PLAN 05-10 RE-READ THIS ENTRY WITH THE SURFACE BUILT AND IT STILL
            READS CORRECTLY, which is worth one sentence rather than silence:
            row 92's second harvest is taken on a board where a round has been
            PLAYED, so the fight bar, the ledger and the board's own markers are
            all painted for it. The three regions plans 05-07 through 05-09
            wrote are inside its reach, and the harvest moved from 101 strings
            to 420 across those three plans, which is the measurement that says
            so rather than the claim.
            PLAN 05-16 RE-READ IT WITH THE TAB BUILT, AND WHAT THE FIGHT-MODE
            HARVEST NOW COVERS IS WORTH NAMING RATHER THAN ASSUMING. The drive
            puts the view ON the fight tab and reads it back, so the harvest is
            of the page a student plays on and not of a hidden region; and the
            board it is taken on now carries a SHIPPED type renamed, a type the
            student INVENTED, a shield allocated, declarations standing on both
            sides, a unit ruled dead, a unit at zero health nobody ruled, a
            change of target half made, and at least one action button DISABLED.
            The harvest reads 467 strings, up from 420 when this entry was last
            re-read, and the floor beneath it was re-measured to 116.
            WHAT IT STILL DOES NOT COVER, and there are three kinds. (i) The
            static-markup half above, unchanged: the stub is not a parser, so
            only text the artifact RENDERS is read. (ii) Copy behind an
            interaction that this drive does not make — entry 13 carries the
            list and plan 05-16 lengthened it. (iii) A word a marked node
            carries. The exemption channel is why the harvest is 467 rather
            than several hundred more: every token-type LABEL, every action
            NAME, the pool label and the dead marker's label are skipped by
            construction. That is the channel doing its job and check 47d, 47e,
            47f and 106c are what watch it — but it means this scan is
            structurally unable to see a verdict word that arrives through a
            marked node, and a plan that marks a node carrying ARTIFACT copy
            rather than a student's word has moved a string out of this gate's
            reach. Nothing here can catch that; a reader of the marker's site
            can.
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
            PLAN 04-05 ADDED TWO DIALOGS AND PLAN 04-06 WIRED THEM, so this
            entry now stands for FOUR roots rather than two, and the two new
            ones divide differently. #share binds a cancel listener with a real
            job — Escape inside the paste field must put the recorded text back
            and leave the surface OPEN — and that listener is unreachable here
            for the reason above, so it is one more rehearsal item. #reset-ask
            binds NO cancel listener, deliberately: it has no field, Escape
            there means Cancel, and <dialog>'s own default close is exactly
            that. The reason is written into bindResetAsk rather than left as an
            absence, and what remains unrehearsed for that root is only that the
            default fires the close listener and hands focus back, which is one
            more thing to watch in the same afternoon.
            PLAN 05-01 ADDS NO DIALOG AND PHASE 5 ADDS NONE, which is worth
            recording as a fact rather than leaving as an omission: this entry
            still stands for FOUR roots after this phase, and a reader checking
            whether a fight dialog was forgotten can stop here. The phase's
            surfaces are regions inside #app, which is why the harvest it needed
            was a second page state and not a fifth root.
        13. Words a surface paints only after something happens INSIDE it. The
            harvest opens each dialog the way a student reaches it, lets one
            frame land and reads what is on it — so a line that appears only
            after a control in the dialog has been used is unread. Closing that
            needs the drive to be extended per surface, not the list; row 71e's
            proposal pane is that done once, for one surface, and PROPOSE_FLOOR
            is its floor.
            PLAN 05-01 GIVES THIS ENTRY THE FIGHT PAGE AS A SECOND INSTANCE, and
            it is the more consequential one, because it is what remains of entry
            5 after that entry's fight half was closed. Row 92 harvests #app with
            a fight running, which reads every word the fight page paints ON
            ARRIVAL — and nothing a student has to act to reveal. A declaration
            row nobody has opened paints nothing; a ledger with no rounds in it
            has no rows; a shield split that appears only once damage lands is
            not there to read. So a second harvest is a second page state, not a
            second surface, and the copy behind an interaction inside it is still
            unread. THE PLAN THAT OWES THE REST OF IT is 05-10, whose driven
            round is the only place in this phase where a fight has actually been
            played far enough for those lines to exist.
            PLAN 05-10 PAID IT, AND WHAT IT PAID IS NAMED HERE RATHER THAN LEFT
            AS A TICK. Rows 93 through 102 drive the fight surface with real
            presses and every reading is taken off the page, so the copy behind
            an interaction inside it is now READ: a declaration line that exists
            only because somebody declared (rows 93, 95, 102), a ledger row that
            exists only because somebody advanced (rows 94, 96, 100, 101), the
            dead marker and its sentence, which appear only because somebody
            ruled a unit (row 98), and the by-hand marker, which appears only
            because somebody set a number (row 102).
            WHAT IS STILL NOT DRIVEN, named so the entry keeps meaning what it
            says. PLAN 05-16 RE-READ THE LIST AGAINST D-27'S SURFACE AND IT IS
            LONGER RATHER THAN SHORTER, which is what a redesign costs a walk:
              a fight carried past two rounds, so the oldest record rolling off
                MAX_PAST_ROUNDS is unread on the page. The drive resolves ONE
                round and MAX_PAST_ROUNDS is not 1, so no row in this file has
                ever seen a record leave the ledger;
              a declaration naming NOBODY in the target position. The choosers
                that made it easy are gone; under D-27 it happens when an action
                that asks for a target is declared on a board with no living
                enemy left, and FIGHT_NOBODY_WORD is the string that appears.
                Check 104 declares an action that aims at nobody, which is the
                other case; the empty-board case is undriven;
              an action whose COST is in a type a student invented, which the
                report says it cannot price. affordability has a pool figure for
                action points and for nothing else, so this is a real branch and
                nothing above takes it;
              a REQUIREMENT that is unmet on a board where the requirement's
                token type is one a student invented. Check 95 drives an unmet
                requirement in a SHIPPED type; the sentence for an authored one
                travels through labelFor and is unread;
              an action whose declared term names a token type that has since
                been REMOVED — fgGoneTerm's refusal line. ACT-07's branch, drawn
                in the grid's report box, and no row above puts a board into it;
              and every line the error panel would carry, because no press above
                is meant to raise one and every row asserts it did not.
        14. A REAL RELOAD AND A REAL BOOKMARK. Checks 75 to 78 prove the board
            reaches location.hash and checks 79 to 82 prove a prepared hash
            reaches the board, but the stub has no reload and never navigates,
            so the two halves are joined here by a second script load rather
            than by a browser. "Close the tab, open the bookmark, and the build
            comes back" is therefore a rehearsal item — it is item 9 in plan
            04-08. The same goes for whether history.replaceState behaves on
            file:// outside Chrome 151, which is where the research measured
            it, and for whether this alphabet round-trips through location.hash
            verbatim in a browser other than Chrome.
        15. Whether a boot-time load lands before the first paint with NO
            VISIBLE FLASH of the shipped board. The ordering is real and
            deliberate — the hash step sits above the first structural
            invalidate in start() — but a flash is a thing only a person can
            see. Moving the step below that line changes what a student watches
            and reddens nothing here, which was measured rather than assumed.
            Rehearsal, same afternoon.
        16. THE CLIPBOARD, which is a FOURTH KIND of unreachable and is worth
            saying plainly rather than folding into entry 5. The other three
            kinds are a thing not yet rendered, a thing with no layout engine to
            measure it, and a thing only a person can see. This one is none of
            those: `navigator` does not exist in this runtime at all, and
            `document.execCommand` is not on the stub page, so tiers 1 and 2 of
            [S07.4]'s copy press are never executed here — not in any browser,
            not under any flag, not once.
            WHAT THAT COSTS, stated rather than softened. Row 90e drives a real
            Copy press and asserts the tier-3 branch, which is the tier SHARE-01
            names in as many words and the only one a bare sandbox can reach. So
            the branch is proved to EXIST and proved to be taken when nothing
            better is available. What is NOT proved is that the other two arms
            ever fire, that they fire in the right order, that the promise's
            resolve arm upgrades the line, that its reject arm falls through to
            the copy command, or that a refusal stays out of the styled error
            panel. Those are LOW confidence here and are stated as such.
            All of it is plan 04-08's rehearsal, items 1 through 6, by number:
            tier 1 in Chrome with the window focused; tier 1 in Edge, because
            Firefox could not be launched in the environment that measured any
            of this and CLAUDE.md's Firefox gap stands; a copy with DevTools
            focused; a copy with the window backgrounded; a forced tier 3 with
            the clipboard API deliberately blocked; and, in each of those five,
            whether the line the student reads genuinely names the tier that
            succeeded.
        17. A BUILD CODE GENUINELY CROSSING BETWEEN TWO BROWSERS. Check 91 is
            this phase's acceptance run and it drives the whole feature —
            Copy, a confirmed reset, Load — through real controls, then reads
            eight values back off the page. What it CANNOT do is what entry 16
            explains: there is no clipboard in this runtime, so the code it
            "copies" is read out of #share-code by the test rather than off a
            clipboard, and the code it pastes is written straight onto
            #sh-load-field rather than by a person pressing Ctrl+V.
            WHAT THAT LEAVES UNPROVED, stated plainly. The producing side and
            the consuming side of that trip are the SAME PROCESS, the same
            evaluation of the same file and the same App. So the run proves the
            codec, the ops, the handlers and the rendering all agree with each
            other; it proves nothing about a code surviving a clipboard, a chat
            client's line wrapping, or a second browser's reading of this
            alphabet. That crossing is plan 04-08's rehearsal, item 7, and it
            is the only place in this project it ever happens. Entry 14 makes
            the same distinction for a real reload and a real bookmark.
            One thing the run DOES prove about the crossing, and it is worth
            naming because it is the failure a chat client actually causes: the
            paste it drives carries a leading space and a trailing newline, and
            the board still arrives.
        18. EIGHT WORDS THAT ARE MECHANICALLY CLEAN AND STILL NOT SHIPPABLE.
            `contested`, `one-sided`, `blowout`, `lopsided`, `even`, `close`,
            `tight`, `behind`. Every one of them passes all three layers today,
            and plan 05-01 measured each and DELIBERATELY DID NOT ADD IT. The
            readings are why, and they are kept beside the word lists as well:
            /\bclose\b/ alone has 77 document hits and 16 literal hits over the
            artifact, /\bbehind\b/ has 50 and 13, /\beven\b/ has 15 and 4. A list
            widened far enough to catch a balance judgement wearing a neutral
            coat is a list that reddens on ordinary English across roughly a
            megabyte of deliberate prose, and a gate that goes red on a sentence
            somebody wrote two phases ago is a gate that stops being trusted.
            SO THIS IS A WRITTEN RULE AND NOT A REGULAR EXPRESSION, which is a
            FIFTH kind of unreachable and belongs on this list for the reason
            entry 16 belongs on it: it is not a thing unrendered, a thing with no
            layout engine, or a thing only a person can see — it is a thing no
            mechanism in this file can decide. The standing rule it stands on is
            the artifact's own: report what happened arithmetically, never what
            it was like. Whether these eight read as neutral to a student in the
            room is plan 05-11's judgement, item 31 on its list, and that is the
            only place it can be settled.
        19. camelCase EVADES EVERY WORD-BOUNDARY RULE IN ALL THREE LAYERS.
            `winsBy`, `leadBy` and `edgeOf` pass Layer B today and would pass
            Layer C, because \b does not fire inside a hump. Plan 05-01 measured
            this and reported it rather than closing it: a camelCase-splitting
            scanner over 5582 literals is a change with its own false-positive
            budget, and it would have to be measured the way every widening in
            that plan was measured. Reported, not exploited.
            WHAT IT DOES AND DOES NOT LEAVE OPEN, because the entry reads worse
            than it is: a rendered SENTENCE is written in words with spaces
            between them, so this is a hole in the layers that read CODE rather
            than in the layer that reads the page. An identifier named winsBy is
            a smell in a file whose comments are half of its documentation; it is
            not something a student ever sees.
        20. AN OVERFLOW ON AN ANCESTOR SILENTLY TAKING #strip's STICKING AWAY.
            [C03] states the cost in its own sentence — there is no error and no
            warning when it goes wrong, sticky simply stops working — and this
            entry is the measurement behind that sentence rather than a
            restating of it. Driven TWICE, by two plans, from two different
            regions: plan 05-06's probe V moved the ledger's scroll onto .shell,
            and plan 05-08's probe AA put max-height and overflow-y:auto on
            #app, which is an ancestor of #topbar, #strip and both fight
            regions. BOTH RUNS WERE SPOTLESSLY GREEN HERE: 1188 passed, 0
            failed, 147 of 147, every scan clean, exit 0.
            AND A REAL BROWSER SEES IT IMMEDIATELY, which is what moves this
            entry off the human rehearsal list and onto the browser harness's.
            Chrome, 1920x1080, one round resolved, the page scrolled to 0 /
            1200 / 1600 / 2200 and #strip's viewport top read at each:
              clean      1116 -> 64 -> 64 -> 64      (it pins, as intended)
              probe AA   1116 -> 900 -> 900 -> 900   (it never pins)
            and the document's own scrollHeight collapses from 3490 to 1296,
            because #app has become the scroller. So this is not a thing no
            machine can see; it is a thing THIS harness cannot see, and the two
            readings above are the shape of the row that belongs in
            tests/browser-checks.mjs.
        21. THE VIEWPORT BUDGET: WHETHER THE FIGHT REGIONS FIT ABOVE THE BOARD
            ON A LAPTOP SCREEN. FIXED, AND THE ENTRY IS REWRITTEN RATHER THAN
            TICKED, because what it still cannot see is the point of keeping it.
            #fightbar and #ledger were two full-width regions STACKED above
            #board, so the page paid their SUM. Measured by plan 05-09 and again
            by plan 05-10, one round resolved, identical in Chrome and Edge:
              board top @1920x1080 = 1257      @1366x768 = 1048
            and the whole sweep of the three dials, down to 18/18/10, read
              922 @1080 and 825 @768 — NO SETTING AT ALL CLEARED A 768-TALL
            SCREEN, and every setting below 34vh gave up the whole-newest-round
            property plan 05-08 chose 34vh for.
            WHAT WAS DONE, OUTSIDE THE PLAN SEQUENCE AND BY THE ORCHESTRATOR,
            because plan 05-11 is a blocking playtest and a person cannot play a
            board that is off the bottom of the screen: the two regions were put
            SIDE BY SIDE in a .fg-band wrapper and [C14]'s frame rule was
            rewritten onto it. Driven with one round resolved, in real Chrome AND
            real Edge, at both sizes, identical in all four:
              board top @1920x1080 = 844 of 1080     @1366x768 = 730 of 768
            and unchanged at thirty rounds, because the ledger is shorter than
            the fight bar beside it and the page pays the taller of the two.
            THE THREE HEIGHT DIALS WERE NOT TURNED DOWN. .fg-sides is still 34vh
            and .ld-now-body is still 20vh. .ld-list went 34vh -> 46vh, which is
            the number plan 05-06 set it at: side by side it is no longer in
            #fightbar's budget, and 34vh in the narrower column no longer held a
            whole round. Whole-newest-round at 1920x1080 was LOST by the
            rearrangement and RECOVERED by that dial, and it is asserted here
            rather than assumed: 446px round inside a 450px list.
            WHAT IS STILL NOT TRUE, STATED PLAINLY. At 1366x768 the newest round
            does NOT fit whole — 46vh is 353px there and a round in that column
            is 740px, so it scrolls. That is not a regression: every row of plan
            05-09's sweep read "no" at 768 including the shipped one. It is a
            property of a 768-tall screen and not of an arrangement.
            AND WHAT THIS HARNESS STILL CANNOT SEE IS THE WHOLE OF IT. Not one
            number above came from this file. tests/selftest-node.cjs computes no
            layout, and a board below the fold is invisible to every row in it —
            which is exactly how four consecutive plans each set a height dial
            against a page the next plan then changed. A plan that writes CSS or
            shell markup must drive a real browser before claiming it clean.

            AND THEN D-27 DISSOLVED THE QUESTION STRUCTURALLY, which is why this
            entry is REWRITTEN A SECOND TIME rather than ticked. The fight is a
            TAB now (plan 05-12): the two regions no longer sit above the board,
            so the page does not pay their sum and does not pay the board's
            height at the same time. The viewport budget is not tight any more;
            it is not a budget.
            WHAT THE TAB DID NOT FIX, stated as plainly as what it did:
              the fight tab has its own budget, and it is the one that binds now.
                Plan 05-12 measured #strip's top in the FIGHT view at 906 of 1080
                and 792 of 768 — below the fold at the smaller size — and handed
                the re-measure to the two plans that then changed the column
                underneath it. Plan 05-16's browser checks take that reading
                again on the surface that ships;
              the newest round STILL does not fit whole at 1366x768. That was a
                property of a 768-tall screen before the tab and it is one after;
              a student who wants the fight and the BOARD at once — to make a
                hand ruling while reading the picker — now has them on two tabs
                rather than on one long page. The tab traded a scroll for a
                switch, and whether that trade is the right one is a question for
                a room and is on plan 05-11's list;
              and the per-action reference cards are inside the roster columns,
                which the fight view hides. That is a REF-03 finding rather than
                a layout one, it was measured by row 101 rather than by any
                browser, and it is deferred-items item 4.
        22. WHETHER THE LEDGER SCROLLING ON ITSELF LEAVES #strip STILL PINNING.
            [C14.2] puts the scroll on .ld-list rather than on an ancestor, and
            entry 20 above is the measurement of what happens when a scroll goes
            on an ancestor instead: #strip stops pinning, silently, with no error
            and no warning. The ledger's own scroll is a DESCENDANT of nothing
            #strip is inside, so it should be safe — "should" is the word this
            entry exists for. Machine-closable, in tests/browser-checks.mjs, in
            entry 20's exact shape: scroll the ledger to its end at 1366x768 and
            read #strip's viewport top at four page scroll offsets.
            DRIVEN AND CLEAN, BUT NOT YET A ROW, and the difference matters. The
            viewport fix took exactly that reading in both browsers at both
            sizes, thirty rounds deep with the list scrolled to its end: #strip
            reports position sticky, every ancestor of it reports overflow
            visible, and its viewport top reads 107 at 1080 and 99 at 768 at
            every page scroll offset. That is the measurement this entry asked
            for and it came back clean. It is still an entry rather than a check
            because nothing in tests/browser-checks.mjs asserts it, so nothing
            would go red if a later plan took it away.
        23. WHETHER THE TOPBAR CLUSTER WRAPS. Plan 05-06 added #fight-start to a
            bar that already carried four controls, and [S08] MEASURES the bar's
            height to set the sticky offset every region below it uses. A bar
            that wraps to two lines at a narrower width moves that measurement,
            and nothing here has a width. Machine-closable: read the bar's
            height and #strip's computed top at 1920, 1366 and 1024.
        24. WHETHER A PAST ROUND READS AS PAST RATHER THAN AS DISABLED. [C14.2]
            dims the resolved rounds, and dimming is also how this file draws a
            control a student may not use. The two readings are a person's to
            tell apart and no measurement settles it. Human.
            AND D-27 MADE IT SHARPER RATHER THAN LEAVING IT WHERE IT WAS. When
            this entry was written, "how this file draws a control a student may
            not use" was a HYPOTHETICAL on the fight page: check 95's earlier
            form asserted that nothing there was ever disabled. It is not
            hypothetical now. The overrule ships a real disabled treatment on the
            action buttons, a few hundred pixels from the dimmed rounds, and both
            are on the fight tab at the same time. So a student can compare the
            two dimmings SIDE BY SIDE, which is a harder test than the one this
            entry originally described and a better one: if a past round and an
            unaffordable action look alike, the answer will be obvious in the
            room and invisible here. Row 106i and check 95 together say the
            battlefield and everything outside the grid are never disabled, so
            the only two dimmed things on that tab are these two. Human, and it
            is item 3 on plan 05-11's list as D-27 rewrote it.
        25. WHETHER THE ROUND AND BOTH POOLS ARE LEGIBLE FROM THE BACK OF A
            ROOM. UX-02's 18px floor is asserted in the stylesheet and a floor
            is not a reading; the artifact goes on a projector, at a distance,
            in a lit room. Human, and it is PROJ-05's own question.
        26. WHETHER A DEAD UNIT IS LEGIBLE AS DEAD WITHOUT RELYING ON COLOUR.
            [C07]'s rule is that a state is said more than once — the card's
            class, the toggle's accessible name, a token in the marker row and a
            sentence beside it, all four of which row 98 reads — and whether
            those four ADD UP to something a person sees across a room is not
            what row 98 asserts. Human.
        27. WHETHER THE THREE-FACT SPLIT IS CLEARER THAN ONE NUMBER, OR MERELY
            LONGER. The ledger reports what an action did as separate facts
            rather than as a single figure, deliberately. Which of those a
            student actually reads faster is a judgement. Human.
        28. D-13 NOW HAS A MECHANICAL CHECK AND THIS ENTRY RECORDS WHICH HALF.
            Probe AE, plan 05-09, rendered the live reading as ONE statement
            naming both sides and the entire repository stayed green over it —
            1188 passed, 0 failed, 147 of 147, every scan clean, exit 0. Row 97
            closes the RENDERED half by walking the LEAVES under .dc-live and
            refusing any leaf that holds both faction names, and [S09.8] holds
            the structural half. WHAT NEITHER OF THEM CAN SEE is a comparison
            made WITHOUT naming either side — "the gap is three" — which is a
            sentence no word list and no leaf walk catches, and which is a
            person's to refuse. Human, and it is the one D-13 question left.
        29. WHETHER A BY-HAND MARKER READS AS BEING ABOUT THE FIGHT WHEN THE
            NUMBER BESIDE IT IS THE BUILD'S. Row 102 records the mechanism: the
            health row on a unit card draws unit.maxHp off state.build, which is
            FIGHT-10's division said out loud, so a ruling that moves the
            FIGHT's health by one puts a marker on a line whose number did not
            move. The marker is correct, the number is correct, and whether the
            two together read as "a person set this" or as "the tool disagrees
            with itself" is exactly the sort of thing only a person in the room
            can answer. Human, and it is new with this plan.
        30. THE SPENT READING MEASURED ZERO AT EVERY OBSERVABLE MOMENT —
            **CLOSED BY D-27, AND THE ENTRY IS REWRITTEN RATHER THAN DELETED**
            because half of it is still true and a reader needs to know WHICH
            half. This is a FIXED item on a list of open ones, kept here so the
            closure is legible rather than merely absent.
            WHAT IT SAID, and it still holds, about the TOPBAR pair:
            advanceRound spends each declared cost and refills both pools from
            the build in the SAME commit, so no frame is ever rendered between
            the two writes and `0 of 3 spent` is what #pool-cats says on every
            frame. Plan 05-07 measured it, wrote the two admissible fixes at the
            derivation and chose neither; plan 05-10 read the zero back verbatim
            rather than asserting around it.
            WHAT CLOSED IT. The developer chose the second of those two fixes at
            the 05-11 checkpoint and promoted it from a bar figure to the core
            interaction: D-27's grid draws a PAIR OF READINGS PER SIDE — what
            this round's declarations have SPOKEN FOR, and what is left to spend
            — summed through App.model.spokenFor at render time and stored
            nowhere. FIGHT-09's "spent visibly distinct from available" is served
            by that pair, distinguished four ways and by colour in none of them.
            HOW IT IS PROVED, by a reading that MOVES rather than by an
            assertion that it does. Row 102 prints the grid's reading verbatim
            through five moments and row 96 prints it through three:
              idle             "Action points 0 of 3 spoken for 3 left to spend"
              declared         "Action points 1 of 3 spoken for 2 left to spend"
              undone           "Action points 0 of 3 spoken for 3 left to spend"
              declared again   "Action points 1 of 3 spoken for 2 left to spend"
              resolved         "Action points 0 of 3 spoken for 3 left to spend"
            Both directions are read, which is what a row printing it only after
            a declaration would have been green without.
            WHAT IS STILL TRUE AND STILL PRINTED. The topbar pair still reads
            `0 of 3 spent`, deliberately, and row 102 still prints it verbatim
            beside the grid's. The two answer different questions — the bar
            reports the POOL and follows a student across the view switch, the
            grid reports the INTENT and sits above the picker — and the artifact
            says so at both sites. Whether a room finds two readings of one
            number helpful or noisy is not a thing this file can measure and is
            on plan 05-11's list.
        31. WHETHER A REAL BROWSER OBLIGES A CANCELLED KEY REPEAT. Row 93c
            asserts that a repeated Enter on Advance and a repeated Space on the
            alive toggle are cancelled — which is the whole of what
            preventDefault can do — and the stub synthesises no click from a
            keydown at all, so what it CANNOT assert is that the browser then
            declines to synthesise one. Entry 12's shape, one region over.
            Machine-closable in tests/browser-checks.mjs: hold Enter on Advance
            in real Chrome and read the round back.
        32. WHETHER A STUDENT FINDS THE DECLARATION STEP AT ALL. Every row above
            drives the surface by selecting a control and pressing it, which
            presupposes knowing which control to press. Whether the three
            choosers, the report between them and the Declare button below them
            read as ONE step in an order — pick, pick, pick, declare — or as
            four unrelated things is the first question a workshop answers and
            the last thing any harness can. Human.
            D-27 IS THE ANSWER TO THAT FORM OF THE QUESTION AND THE QUESTION
            STAYS OPEN IN A DIFFERENT ONE. The four unrelated things are gone:
            there is one row per unit and one button per action, and pressing a
            button IS declaring. Nothing is left to find within the step. WHAT
            REPLACED IT IS FINDING THE TAB. The fight now lives behind a switch
            (plan 05-12), so a student who has built a roster has to press
            something to see the fight at all — and if they press Start Fight
            from the topbar the view follows for them, which is the case the
            gate drives. THE UNDRIVEN CASE IS THE ONE A ROOM PRODUCES: a student
            who has switched back to the board tab to make a hand ruling, and
            has to find their way to the fight again. Whether the two controls
            read as tabs, and whether the fight one reads as "where the fight
            is" rather than as a mode, is the first question a workshop answers
            and the last thing any harness can. Human.

        33. WHETHER A DISABLED ACTION READS AS *THE BOARD SAYS NO* OR AS *THE
            TOOL SAYS NO*. D-27 overruled D-23 for this one surface, and the
            whole justification is that the refusal is BOOKKEEPING — the pool
            cannot pay, the requirement is not met, the student ruled the unit
            dead — rather than the tool adjudicating. Check 95 asserts the
            arithmetic in both directions and the artifact writes the
            requirement sentence in the same words the authoring dialog uses.
            None of that decides how it LANDS. A student who reaches for an
            action and finds it out of reach either thinks "we can't afford
            that" or thinks "the app won't let me", and the second one is the
            students-are-the-rules-engine principle failing quietly. Human, and
            it is the question the developer is asked in their own words on plan
            05-11's item 3. NEW with plan 05-16.

        34. WHETHER A GRID OF units x actions BUTTONS IS LEGIBLE FROM THE BACK
            OR IS A WALL. The shipped board draws 9 cats x 3 actions plus 3
            mechs x 3 — thirty-six buttons — and MAX_UNITS allows 24 a side,
            which is 144. Every button carries a name and a cost at UX-02's
            18px floor, so the arithmetic is fine and the READING is the
            question: a room scanning for one unit's row among twenty-four is
            doing something no measurement here describes. Browser checks count
            them and read the grid's box at both viewports on both boards;
            whether a person finds a row in it is a rehearsal. Human. NEW.

        35. WHETHER A STUDENT NOTICES THAT A TARGET WAS CHOSEN FOR THEM, AND
            WHETHER "CHANGE TARGET" READS AS A CHANGE RATHER THAN AS A
            CORRECTION. One press declares and the row then says what it lands
            on. A student who does not read that line has had a target chosen
            for them without knowing it — which is fine if they would have
            chosen the same one and is a silent decision if they would not. And
            the control beside it is labelled for the act of changing; whether
            that reads as "you may change this" or as "the tool got it wrong,
            fix it" is a difference in tone that no attribute carries. Human.
            NEW.

        36. WHETHER A LOWEST-HEALTH DEFAULT NUDGES A ROOM TOWARD FOCUS FIRE.
            THIS IS THE ONE PLACE IN THE PHASE WHERE THE TOOL MAKES A
            SUGGESTION, and it is worth saying that plainly rather than folding
            it into 35. Everything else here is bookkeeping: the tool adds up
            what a student said and reports what happened. `defaultAt` picks
            the weakest living enemy, which is a TACTIC, and a room that
            declares six actions in six presses has been handed six votes for
            finishing off the same unit. The developer chose it explicitly and
            it is changeable in one press, both of which are the mitigation
            rather than the answer. Whether a workshop's fights come out more
            alike because of it is a thing only two rooms playing two afternoons
            can see. Human. NEW.

        37. WHETHER THE BATTLEFIELD READS AS THE FIGHT AND THE PICKER ROWS AS
            THE PAPERWORK, OR THE TWO COMPETE. The addendum put a visual of the
            battle above the picker in each column, so each side's column now
            carries two representations of the same roster — shapes above,
            rows below — and every unit appears in both. That is either an
            at-a-glance state and a place to act, or it is the same list twice.
            The failure this entry names is specific: a student looking for
            "where is Cat 3" having to decide which of the two to look in.
            Human. NEW.

        38. WHETHER A UNIT'S TOKENS ARE LEGIBLE AT BATTLEFIELD SCALE FROM THE
            BACK OF THE ROOM, OR WANT THEIR OWN --tok. Plan 05-15 overrode
            --tok locally to 12px with 3px gaps and wrote the arithmetic at the
            site: at the shipped 22px/6px a nine-health row is 246px against a
            332px column and the cluster would be one unit per line. So the
            small size is a LAYOUT necessity and its legibility is an
            unmeasured consequence of it. UX-02's floor is about legends and
            does not reach a token. If the answer is no, the dial is one line
            and the cost is the layout that forced it. Human. NEW.

        39. WHETHER THE TWO-COLUMN GRID PLUS TWO BATTLEFIELD CLUSTERS HOLD AT
            24-A-SIDE ON A REAL PROJECTOR. The browser checks measure the boxes
            at 1920x1080 and 1366x768 in Chrome and Edge on the shipped board
            and at 24-a-side, and record the cluster heights because they are
            what moves .fg-sides' bound. What no measurement reaches is a
            projector: lower contrast, a longer throw, a lit room and a person
            at the back. That has been entry 25's point about the round and both
            pools since plan 05-08 and it is worth restating for a surface four
            times the size. Human. NEW. --- */

console.log(
  'interaction gate: ' + (gateChecks - gateFailures.length) + ' of ' + gateChecks
    + ' checks passed'
);

if (gateFailures.length > 0) {
  fail('INTERACTION GATE: ' + gateFailures.length + ' check(s) failed — '
    + gateFailures.join('; '));
}

process.exit(result.failed ? 1 : 0);
