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
    'views', 'view-build', 'view-fight'
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
  views.setAttribute('aria-label', 'Which screen');
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

  const fightbar = idNode('fightbar', 'section');
  app.appendChild(fightbar);
  const fightHead = idNode('fight-head', 'h2');
  fightHead.className = 'fg-head';
  fightbar.appendChild(fightHead);
  const fightPrompt = idNode('fight-prompt', 'p');
  fightPrompt.className = 'fg-prompt';
  fightbar.appendChild(fightPrompt);
  const fightSides = createElement('div');
  fightSides.className = 'fg-sides';
  fightbar.appendChild(fightSides);
  ['decl-cats', 'decl-mechs'].forEach((id) => {
    const side = idNode(id);
    side.className = 'fg-side';
    side.hidden = true;
    fightSides.appendChild(side);
  });
  // FIGHT-10's line, reserved by plan 05-06 and filled by plan 05-09. Hidden
  // AND empty together, which is the admission line's own rule and the reason
  // there is no text on it here.
  const fightSaid = idNode('fight-said', 'p');
  fightSaid.className = 'fg-said';
  fightSaid.hidden = true;
  fightbar.appendChild(fightSaid);

  // The ledger, and the one property of it this page can actually hold: it is
  // a SIBLING of #board and not a child, which is what keeps the first
  // [data-k] match scoped to #board a live node after a structural rebuild.
  // Its rows carry no data-k and no data-act at all, so there is nothing to
  // stub inside the list — plan 05-08 appends into it.
  const ledger = idNode('ledger', 'section');
  ledger.hidden = true;
  app.appendChild(ledger);
  const ledgerHead = idNode('ledger-head', 'h2');
  ledgerHead.className = 'ld-head';
  ledger.appendChild(ledgerHead);
  const ledgerList = idNode('ledger-list');
  ledgerList.className = 'ld-list';
  ledger.appendChild(ledgerList);

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
      const value = node.getAttribute ? node.getAttribute(attr) : null;
      if (typeof value === 'string' && value !== '') {
        into.push({ s: value, where: where });
      }
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
const fightSaved = JSON.stringify(A.state.get());

A.ops.startFight();
A.state.invalidate();
A.state.flush();
const fightCatIds = A.state.get().build.cats.units.map((u) => u.id);
const fightMechIds = A.state.get().build.mechs.units.map((u) => u.id);
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
const fightText = harvestInto(dom.byId['app'], [], '#app');
const fightHits = verdictHitsIn(fightText).concat(relationshipHitsIn(fightText));

A.ops.endFight();
A.state.invalidate();
A.state.flush();
// THE BOARD IS PUT BACK AND THE PUTTING BACK IS ASSERTED, in check 62's manner.
// A harvest that costs the board something is a harvest no later row can trust,
// and "it costs nothing" is a claim worth reading rather than a habit worth
// having. endFight() is the op that owes this, not restore() — so the reading is
// taken BEFORE the restore, and the restore below is the belt to its braces.
const fightBoardBack = JSON.stringify(A.state.get()) === fightSaved;
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

   NOTHING IS STILL OWING. Plans 05-07, 05-08 and 05-09 were the three this
   comment named and all three have now paid. A plan that adds a fight surface
   after this one inherits the same obligation and the same method: trim the
   roster BEFORE startFight — a mid-fight removeUnit moves the build and leaves
   the fight slice, the ledger's record and both choosers holding every unit,
   and a per-card figure taken that way measures the setup chrome alone. */
const FIGHT_FLOOR = 120;

console.log('scan: ' + fightText.length + ' rendered strings read from #app WITH '
  + 'A FIGHT RUNNING (Layer C, floor ' + FIGHT_FLOOR + ')');

check(
  '92. Layer C reads the page a SECOND time, with a fight actually running, and '
    + 'nothing the fight page paints judges a build. The floor and the scan ride '
    + 'in one row because they are two halves of one claim — a scan of a page '
    + 'that was never painted is a spotlessly clean scan of nothing, which is '
    + 'the failure row 47c exists to catch one surface down. The board is put '
    + 'back afterwards and the putting back is read here too, because a harvest '
    + 'that costs the board something is a harvest no row below can trust',
  fightHits.length === 0 && fightText.length > FIGHT_FLOOR && fightBoardBack,
  (fightHits.length === 0 ? '' : fightHits.join(' | ') + ' | ')
    + 'harvested ' + fightText.length + ' strings from #app with a fight running'
    + ' (floor ' + FIGHT_FLOOR + ')'
    + '; board after endFight is '
    + (fightBoardBack ? 'byte-identical to the board before startFight'
      : 'NOT the board it was before startFight')
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
A.ops.setActionCost('cats', dwOwn, 'ap', 1);

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
A.ops.setActionCost('cats', accAct2, 'ap', 1);
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
function fgOne(root, sel) { return root.querySelectorAll(sel)[0] || null; }

// The chooser press, found by the VALUE it carries rather than by position, so
// a row cannot pass by pressing whatever happens to be first.
function fgPick(side, kind, value) {
  const btn = fgSideRootOf(side).querySelectorAll('[data-fg="' + kind + '"]')
    .filter((b) => b.dataset.fgVal === value)[0] || null;
  if (btn !== null) { fgPress(btn); }
  return btn;
}
function fgDeclare(side, actionId, byId, atId) {
  fgPick(side, 'act', actionId);
  fgPick(side, 'by', byId);
  fgPick(side, 'at', atId);
  fgPress(fgOne(fgSideRootOf(side), '[data-fg="declare"]'));
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
function fgActNamed(side, name) {
  return A.state.get().build[side].actions.filter((a) => a.name === name)[0];
}

const fgCatsAct = A.state.get().build.cats.actions[0].id;
const fgMechsAct = A.state.get().build.mechs.actions[0].id;

// A BOARD SOMEBODY HAS ACTUALLY PLAYED ON, built through real presses, because
// every reading below is taken on it. Two rounds resolved and a declaration
// standing in the third: the ledger has rows, the declaration list has lines,
// and both are things that do not exist on a board where startFight() has just
// been called — which is what probe X measured about check 92 before plan
// 05-08 moved that drive.
fgPress(fgStart);
fgDeclare('cats', fgCatsAct, 'c1', 'm1');
fgDeclare('mechs', fgMechsAct, 'm1', 'c1');
fgAdvancePress();
fgDeclare('cats', fgCatsAct, 'c2', 'm2');
fgAdvancePress();
fgDeclare('mechs', fgMechsAct, 'm1', 'c3');

/* 93. THE ACT PARTITION, COLLECTED OFF THE PAGE, in 68d and 90b's shape and
   extended over the three regions this phase paints. The two halves together
   are the point: a control naming an act nobody registered is caught, and so is
   a state op quietly moved into UI_ACTS to make a refusal go away.

   THE SECOND HALF IS THE ONE THAT MATTERS HERE, and the six ops are named in
   this row's own label so a move reddens with an explanation rather than with a
   number. Probe AF drives exactly that move. */
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
[fgBar, fgLedgerRoot, fgBoard].forEach((root) => {
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
  + fgLedgerRoot.querySelectorAll('[data-act]').length;
const fgPrivateCount = fgBar.querySelectorAll('[data-fg]').length
  + fgBoard.querySelectorAll('[data-dc]').length;
check(
  '93. THE ACT PARTITION FOR THE FIGHT, read off a page somebody has played on. '
    + 'Every act #fightbar, #ledger, #board and the start control dispatch is '
    + 'either a UI-only act the LIVE registration handles or a real op [S05] '
    + 'exports — and NOT ONE of startFight, resetFight, declare, '
    + 'clearDeclaration, advanceRound or setAlive is in UI_ACTS. That second '
    + 'half is the whole row: an entry there is a name [S07] handles itself '
    + 'instead of dispatching, which is exactly how a refusal is made to stop '
    + 'being raised. The two fight surfaces carry ZERO acts inside them on '
    + 'purpose, so it is their private data-fg and data-dc controls that are '
    + 'floored — a region with no controls at all passes an all-clear '
    + 'spotlessly',
  fgActsInside === 0 && fgUnhandled.length === 0 && fgNotOps.length === 0
    && fgParked.length === 0 && fgNoOpBehind.length === 0
    && fgPrivateCount >= 60 && fgStateActs.indexOf('startFight') !== -1,
  'acts on data-act inside #fightbar + #ledger=' + fgActsInside
    + ' | acts found=' + JSON.stringify(fgActsFound)
    + ' | UI-only=' + JSON.stringify(fgUiOnly)
    + ' | claimed but unhandled=' + JSON.stringify(fgUnhandled)
    + ' | field acts, read off the live FIELD_OPS=' + JSON.stringify(fgFieldActs)
    + ' | state acts that are neither an op nor a field act='
    + JSON.stringify(fgNotOps)
    + ' | FIGHT OPS PARKED IN UI_ACTS=' + JSON.stringify(fgParked)
    + ' | dispatched acts with no op behind them=' + JSON.stringify(fgNoOpBehind)
    + ' | private data-fg + data-dc controls=' + fgPrivateCount
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
   passes a per-listener test spotlessly. */
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
const fgBarListeners = fgListenersOn(fgBar);
const fgBoardListeners = fgListenersOn(fgBoard);
check(
  '93b. every listener bound on BOTH of plan 05-10\'s roots went through '
    + 'App.boot.wrap. #fightbar and #board are the two static elements that '
    + 'outlive every rebuild — [S06.7] replaces the declaration-root interiors '
    + 'inside the first and structure() replaces the column interiors inside '
    + 'the second — so a listener bound any deeper would be thrown away by the '
    + 'first repaint, and the alive toggle lives inside a unit card. Two roots '
    + 'and two floors, because a root carrying no listeners passes a '
    + 'per-listener test spotlessly',
  fgBarListeners >= 3 && fgBoardListeners >= 3
    && fgBarRaw.length === 0 && fgBoardRaw.length === 0,
  'listeners on #fightbar=' + fgBarListeners
    + ' bound outside the boundary: ' + (fgBarRaw.join(', ') || 'none')
    + ' | listeners on #board=' + fgBoardListeners
    + ' bound outside the boundary: ' + (fgBoardRaw.join(', ') || 'none')
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
   preventDefault can do — and not that a real browser then obliges. */
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
check(
  '93c. a repeated Enter on the Advance control and a repeated Space on the '
    + 'alive toggle are cancelled before either can become a click, and the '
    + 'FIRST press of each is not. [S07.1] cancels a held key through '
    + 'actTarget, which returns null for every control in this region because '
    + 'not one of them carries a data-act — so without this the browser would '
    + 'synthesise one click per OS auto-repeat and a held Advance would resolve '
    + 'rounds until the history a student just played had rolled off the end of '
    + 'the list, one undo entry at a time',
  fgRepeatCancelled === true && fgFirstKey.defaultPrevented === false
    && fgAliveRepeat.defaultPrevented === true
    && A.state.get().fight.round === fgRoundBeforeHold
    && errPanel.hidden === true,
  'the repeat is cancelled=' + fgRepeatCancelled
    + ' | the first press is cancelled=' + fgFirstKey.defaultPrevented
    + ' | a held Space on the toggle is cancelled=' + fgAliveRepeat.defaultPrevented
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
   rows would find no attributes and pass spotlessly. */
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
   construction, and this row is what says the construction held. */
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
    + 'the ledger and a declaration standing. keyed() takes the FIRST match, so '
    + 'a repeated key is a repaint handing the keyboard to a node the student '
    + 'was not on',
  fgKeyCount >= 120 && fgKeyDupes.length === 0,
  'keys on the page=' + fgKeyCount + ' duplicates=' + JSON.stringify(fgKeyDupes)
);

/* 95. NOTHING IS DISABLED FOR ANYTHING A STUDENT DID, in 71c's shape and
   extended over THREE boards rather than two: a fully funded fight, the same
   fight driven to no action points AND every unit below every requirement, and
   the same fight with three units ruled dead. The whole set is compared, keyed
   by data-k so the choosers and the declaration lines being rebuilt on every
   repaint does not read as a change — a row that watched one button would be
   green over a page that disabled every other one.

   THE ALIVE TOGGLE ON A DEAD UNIT IS THE ONE THIS PHASE WOULD BREAK FIRST, and
   it is what makes a Shield ruling recoverable at all: the tidy shape is to
   hide "the dead part" as one block and the toggle looks like part of it. Probe
   AI drives the disable and probe AC drove the hide.

   THE ONE `=true` THE SET IS ALLOWED TO HOLD is the start control, and it is
   named rather than tolerated: startFight throws on a fight that is already
   running, so that one is the TOOL bounding what it can do to ITSELF, which is
   a different thing entirely — 71c\'s own sentence about the picker\'s
   Remove. */
/* THE THREE BOARDS ARE BUILT TO THE SAME SHAPE ON PURPOSE, and the first draft
   of this row was WRONG for exactly the reason probe W's comparison was built
   like-for-like: the funded board carried a declaration and the driven one
   resolved it on the Advance that emptied the pools, so the Clear control on
   that line went away and the two sets differed for a reason that had nothing
   to do with anything being disabled. Every board below therefore has a fight
   running and exactly ONE declaration standing, and they differ only in what
   the side can pay, what it can meet, and who has been ruled dead. */
function fgFundedBoard() {
  A.ops.resetToDefaults();
  A.state.flush();
  fgPress(fgStart);
  fgDeclare('cats', fgCatsAct, 'c1', 'm1');
}
fgFundedBoard();
const fgDisabledFunded = disabledIn(fgApp);
const fgFundedTrue = fgDisabledFunded.split('|').filter((e) => e.indexOf('=true') !== -1);
const fgFundedReport = fgLeaves(fgOne(fgSideRootOf('cats'), '.fg-report')).join('');

// NOTHING TO SPEND AND BELOW EVERY REQUIREMENT. The pool is driven to zero
// through a real Advance rather than by writing a number into the slice,
// because advanceRound is the only thing in this file that refills it — so the
// build is set to nothing first and the Advance carries that through. The
// declaration is then made again, so this board has the same one standing.
fgFundedBoard();
A.ops.setActionCost('cats', fgCatsAct, 'ap', 9);
A.ops.setActionReq('cats', fgCatsAct, 0, 'hp', 99);
A.ops.setFactionAp('cats', 0);
A.ops.setFactionAp('mechs', 0);
A.state.get().build.cats.units.forEach((u) => { A.ops.setUnitMaxHp('cats', u.id, 1); });
A.state.get().build.mechs.units.forEach((u) => { A.ops.setUnitMaxHp('mechs', u.id, 1); });
A.state.flush();
fgAdvancePress();
fgDeclare('cats', fgCatsAct, 'c1', 'm1');
const fgDisabledOwing = disabledIn(fgApp);
const fgOwingReport = fgLeaves(fgOne(fgSideRootOf('cats'), '.fg-report')).join('');
const fgPoorAp = [A.state.get().fight.cats.ap, A.state.get().fight.mechs.ap];
const fgAdvanceEntry = fgDisabledOwing.split('|')
  .filter((e) => e.indexOf('fg/advance=') === 0);

// AND THE SAME BOARD WITH THREE UNITS RULED DEAD, through three real presses.
fgPress(fgAliveBtn('cats', 'c1'));
fgPress(fgAliveBtn('cats', 'c2'));
fgPress(fgAliveBtn('mechs', 'm1'));
const fgDisabledDead = disabledIn(fgApp);
const fgDeadToggles = fgDisabledDead.split('|')
  .filter((e) => e.indexOf('fg/alive/') === 0 && e.indexOf('=true') !== -1);
const fgControlCount = fgDisabledFunded.split('|').length;
check(
  '95. NOTHING IS DISABLED FOR ANYTHING A STUDENT DID, compared as a WHOLE SET '
    + 'across three boards that differ in nothing else — a funded fight with a '
    + 'declaration standing, the same fight with both pools driven to nothing '
    + 'through a real Advance and the declared action costing more than the '
    + 'side holds and naming a requirement no unit meets, and that board again '
    + 'with three units ruled dead. The report moves; not one control\'s '
    + 'disabled state does. The Advance control stays enabled on a side that '
    + 'cannot pay, and the alive toggle stays enabled on a unit already marked '
    + '— the direction that makes a Shield ruling recoverable, and the one this '
    + 'phase would break first. The single =true the set holds is the start '
    + 'control, which is the tool bounding what it can do to ITSELF rather than '
    + 'a ruling on a student',
  fgDisabledFunded === fgDisabledOwing && fgDisabledFunded === fgDisabledDead
    && fgOwingReport !== fgFundedReport
    && fgFundedTrue.length === 1 && fgFundedTrue[0] === 'fg=true'
    && fgAdvanceEntry.length === 1 && fgAdvanceEntry[0] === 'fg/advance=false'
    && fgDeadToggles.length === 0 && fgControlCount >= 100,
  'controls compared=' + fgControlCount
    + ' | funded === cannot pay and cannot meet='
    + (fgDisabledFunded === fgDisabledOwing)
    + ' | funded === three ruled dead=' + (fgDisabledFunded === fgDisabledDead)
    + ' | fight pools driven to ' + JSON.stringify(fgPoorAp)
    + ' | the report moved: ' + JSON.stringify(fgFundedReport)
    + ' -> ' + JSON.stringify(fgOwingReport)
    + ' | the advance entry=' + JSON.stringify(fgAdvanceEntry)
    + ' | every =true entry=' + JSON.stringify(fgFundedTrue)
    + ' | alive toggles disabled=' + JSON.stringify(fgDeadToggles)
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
   halves must fire. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
fgDeclare('cats', fgCatsAct, 'c1', 'm1');
fgDeclare('mechs', fgMechsAct, 'm1', 'c1');
const fgPageBefore = fgLeaves(fgBar).join('') + ''
  + fgLeaves(fgLedgerRoot).join('') + ''
  + fgLeaves(dom.byId['col-cats']).join('');
const fgStateBefore = JSON.stringify(A.state.get().fight);
const fgRoundBefore = dom.byId['round-count'].textContent;
const fgRowsBefore = fgLedgerRoot.querySelectorAll('.ld-row').length;
fgAdvancePress();
const fgPageAfter = fgLeaves(fgBar).join('') + ''
  + fgLeaves(fgLedgerRoot).join('') + ''
  + fgLeaves(dom.byId['col-cats']).join('');
const fgStateAfter = JSON.stringify(A.state.get().fight);
const fgRoundAfter = dom.byId['round-count'].textContent;
const fgRowsAfter = fgLedgerRoot.querySelectorAll('.ld-row').length;
check(
  '96. ONE PRESS OF THE REAL ADVANCE CONTROL MOVES THE STATE AND MOVES THE '
    + 'PAGE, and both halves ride in one row. Checks 72 and 73 assert the '
    + 'opposite claim the same way and for the same reason: a row that compared '
    + 'only the state would be spotlessly green over a press that changed '
    + 'nothing on screen. The round on the bar steps, the ledger grows a row, '
    + 'and the rendered text of the bar, the ledger and a faction column all '
    + 'move together',
  fgStateAfter !== fgStateBefore && fgPageAfter !== fgPageBefore
    && fgRoundAfter !== fgRoundBefore && fgRowsAfter === fgRowsBefore + 1
    && errPanel.hidden === true,
  'state moved=' + (fgStateAfter !== fgStateBefore)
    + ' (' + fnv(fgStateBefore) + ' -> ' + fnv(fgStateAfter) + ')'
    + ' | page moved=' + (fgPageAfter !== fgPageBefore)
    + ' (' + fnv(fgPageBefore) + ' -> ' + fnv(fgPageAfter) + ')'
    + ' | the round on the bar ' + JSON.stringify(fgRoundBefore)
    + ' -> ' + JSON.stringify(fgRoundAfter)
    + ' | ledger rows ' + fgRowsBefore + ' -> ' + fgRowsAfter
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
   spotlessly. */
const fgCatsName = A.state.get().build.cats.name;
const fgMechsName = A.state.get().build.mechs.name;
const fgLiveBoxes = fgStrip.querySelectorAll('.dc-live');
const fgLiveLeaves = [];
fgLiveBoxes.forEach((box) => { fgLeaves(box).forEach((t) => fgLiveLeaves.push(t)); });
const fgBothNamed = fgLiveLeaves.filter((t) =>
  t.indexOf(fgCatsName) !== -1 && t.indexOf(fgMechsName) !== -1);
check(
  '97. D-13 ON THE PAGE: no single leaf of the live fight reading names BOTH '
    + 'factions. The region names each of them — once per side, in its own '
    + 'statement — and that is the whole of what D-13 permits; what it forbids '
    + 'is one sentence setting the two against each other. So the unit of this '
    + 'row is the LEAF and not the region. Probe AE rendered exactly that '
    + 'sentence and the entire repository stayed green over it, which is why '
    + 'this row exists',
  fgLiveBoxes.length === 1 && fgLiveLeaves.length >= 8 && fgBothNamed.length === 0,
  'live reading boxes=' + fgLiveBoxes.length
    + ' leaf strings=' + fgLiveLeaves.length
    + ' | faction names read live=' + JSON.stringify([fgCatsName, fgMechsName])
    + ' | leaves naming both=' + JSON.stringify(fgBothNamed)
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
   aria-pressed, the token in the marker row, and the sentence beside it. */
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
A.ops.dispatch('setUnitHp', { side: 'cats', unitId: 'c1', value: 0 });
A.state.flush();
const fgReadZeroAlive = fgDeadRead('cats', 'c1');
const fgZeroHp = A.state.get().fight.cats.units[0].hp;
fgPress(fgAliveBtn('cats', 'c2'));
const fgReadFullDead = fgDeadRead('cats', 'c2');
const fgFullHp = A.state.get().fight.cats.units[1].hp;
fgPress(fgAliveBtn('cats', 'c2'));
const fgReadBack = fgDeadRead('cats', 'c2');
check(
  '98. THE DEAD MARKER DRAWS THE STORED FLAG AND NEVER THE HEALTH, read OFF '
    + 'THE PAGE rather than out of state — because every other D-00d row in '
    + 'this file reads state, and probe AB proved a marker derived wrongly on '
    + 'the way to the screen leaves the whole repository green. A unit at zero '
    + 'health nobody ruled draws as standing, a unit at full health somebody '
    + 'ruled draws as marked, and a unit ruled and then ruled back returns to '
    + 'the first — that last is the direction a tidy implementation loses. Four '
    + 'readings each, because a state is said more than once and never in '
    + 'colour alone',
  fgZeroHp === 0 && fgFullHp > 0
    && fgReadZeroAlive.marked === false && fgReadZeroAlive.pressed === 'false'
    && fgReadZeroAlive.tokens === 0 && fgReadZeroAlive.saidShown === false
    && fgReadFullDead.marked === true && fgReadFullDead.pressed === 'true'
    && fgReadFullDead.tokens === 1 && fgReadFullDead.saidShown === true
    && fgReadBack.marked === false && fgReadBack.pressed === 'false'
    && fgReadBack.tokens === 0 && fgReadBack.saidShown === false
    && fgReadZeroAlive.enabled === true && fgReadFullDead.enabled === true,
  'c1 at health ' + fgZeroHp + ', nobody ruled=' + JSON.stringify(fgReadZeroAlive)
    + ' | c2 at health ' + fgFullHp + ', ruled dead=' + JSON.stringify(fgReadFullDead)
    + ' | c2 ruled BACK=' + JSON.stringify(fgReadBack)
);

/* 99. THE FOCUS CONTRACT OVER A REBUILT CHOOSER LIST, which is what replaces
   check 65's static-row shape on this one surface — [S06.7]'s banner argues at
   length why the declaration slots are NOT static markup (not one node in the
   region is a field, and MAX_DECLARATIONS is 48) and names this row as what it
   owes instead. The chooser is pressed, the region rebuilds under it, and the
   keyboard is read back on the node it was on: a DIFFERENT node object carrying
   the SAME key, which is withPreservedFocus doing exactly its job. */
const fgPickBefore = fgSideRootOf('cats').querySelectorAll('[data-fg="by"]')
  .filter((b) => b.dataset.fgVal === 'c1')[0];
const fgPickKey = fgPickBefore.dataset.k;
fgPickBefore.focus();
fgPress(fgPickBefore);
const fgPickAfter = fgSideRootOf('cats').querySelectorAll('[data-fg="by"]')
  .filter((b) => b.dataset.fgVal === 'c1')[0];
const fgFocusK = stub.activeElement && stub.activeElement.dataset
  ? stub.activeElement.dataset.k : null;
check(
  '99. a chooser press rebuilds the list under the student and the keyboard is '
    + 'still on the control they were on. The node is a DIFFERENT object and '
    + 'the key is the SAME, which is both halves of the claim: a row that only '
    + 'read the key would be green over a list that never rebuilt, and a row '
    + 'that only read the node would be green over focus dropped to the body. '
    + 'This is what stands in for check 65 on this surface, and [S06.7]\'s own '
    + 'banner says why the slots are not static markup',
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
     renaming an ACTION must move the chooser pill on the fight bar and the
       already-drawn declaration line beside it;
     renaming a TOKEN TYPE must move an ALREADY-DRAWN ledger row — which is the
       narrower half, because that row was painted for a round that has already
       resolved and a fingerprint watching only the row COUNT never repaints it.
   Both names are put back afterwards. */
A.ops.resetToDefaults();
A.state.flush();
fgPress(fgStart);
fgDeclare('cats', fgCatsAct, 'c1', 'm1');
fgAdvancePress();
fgDeclare('cats', fgCatsAct, 'c2', 'm2');
const fgBarTextWas = fgLeaves(fgBar).join('|');
const fgLdTextWas = fgLeaves(fgLedgerRoot).join('|');
const fgLdRowWas = fgLedgerRoot.querySelectorAll('.ld-row')[0];
A.ops.renameAction('cats', fgCatsAct, 'Pounce');
A.state.flush();
const fgBarTextNamed = fgLeaves(fgBar).join('|');
A.ops.renameTokenType('hp', 'Vigor');
A.state.flush();
const fgLdTextNamed = fgLeaves(fgLedgerRoot).join('|');
const fgLdRowSame = fgLedgerRoot.querySelectorAll('.ld-row')[0] === fgLdRowWas;
const fgBarSaysNew = fgBarTextNamed.indexOf('Pounce') !== -1;
const fgLdSaysNew = fgLdTextNamed.indexOf('Vigor') !== -1;
A.ops.renameTokenType('hp', 'Health');
A.state.flush();
check(
  '100. AN OP THAT CHANGES WHAT IS DRAWN WITHOUT MOVING A STEPPER REPAINTS '
    + 'BOTH FIGHT SURFACES — plan 04-05\'s probe S carried onto this phase, and '
    + 'the row plan 05-07 was told to record and plan 05-10 owes. Renaming an '
    + 'action moves the fight bar; renaming a token type moves an ALREADY-DRAWN '
    + 'ledger row, which is the narrower half, because that row was painted for '
    + 'a round that has already resolved and a fingerprint watching only the '
    + 'row COUNT would never repaint it. The row NODE is the same object '
    + 'afterwards, so the region rewrote what it had rather than throwing the '
    + 'history away and rebuilding it',
  fgBarTextNamed !== fgBarTextWas && fgLdTextNamed !== fgLdTextWas
    && fgBarSaysNew === true && fgLdSaysNew === true && fgLdRowSame === true,
  'the bar moved=' + (fgBarTextNamed !== fgBarTextWas)
    + ' and says the new action name=' + fgBarSaysNew
    + ' | the ledger moved=' + (fgLdTextNamed !== fgLdTextWas)
    + ' and says the new token name=' + fgLdSaysNew
    + ' | the already-drawn row is the same node=' + fgLdRowSame
);

/* 101. REF-03, EXTENDED RATHER THAN DUPLICATED. Check 62 asserts that starting
   a fight leaves every action card on the page while the setup-only Add button
   goes away. This takes the same reading on a board where a fight has actually
   been PLAYED — two rounds in the ledger and a declaration standing — because
   that is the state the requirement is about: the reference a student needs is
   needed most in the middle of a round, not at the moment the fight opens. The
   cards are read for their TEXT and not merely counted, because a card present
   and empty is a card that is not readable. */
const fgRefCards = fgBoard.querySelectorAll('.ref-card');
const fgRefLeaves = fgRefCards.reduce((n, card) => n + fgLeaves(card).length, 0);
const fgAddButtons = stub.querySelectorAll('.brd-add').length;
const fgLdRowsNow = fgLedgerRoot.querySelectorAll('.ld-row').length;
check(
  '101. REF-03 WITH A FIGHT ACTUALLY BEING PLAYED. Check 62 reads the cards at '
    + 'the moment a fight starts; this reads them with rounds in the ledger and '
    + 'a declaration standing, which is when a student actually reaches for '
    + 'them. The cards are read for their TEXT rather than counted, because a '
    + 'card present and empty is a card nobody can read, and the setup-only '
    + 'Add button is still gone',
  fgRefCards.length === 6 && fgRefLeaves >= 12 && fgAddButtons === 0
    && fgLdRowsNow >= 1,
  'action and reference cards on the board=' + fgRefCards.length
    + ' | leaf strings read out of those cards=' + fgRefLeaves
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
   slice the page does not draw. */
A.ops.resetToDefaults();
A.state.flush();
clearPanel();
const accBuildWas = JSON.stringify(A.state.get().build);
fgPress(fgStart);
const accStarted = A.state.get().fight !== null;
fgDeclare('cats', fgCatsAct, 'c1', 'm1');
fgDeclare('mechs', fgMechsAct, 'm1', 'c1');
const accDeclLines = fgSideRootOf('cats').querySelectorAll('.fg-decl').length
  + fgSideRootOf('mechs').querySelectorAll('.fg-decl').length;
fgAdvancePress();

// THE SIX, off the page.
const accRound = dom.byId['round-count'].textContent;
const accPoolCats = fgLeaves(dom.byId['pool-cats']).join('');
const accPoolMechs = fgLeaves(dom.byId['pool-mechs']).join('');
const accHpRow = fgBoard.querySelectorAll('.tok-row')
  .filter((r) => r.dataset.amt === 'hp' && r.dataset.unit === 'm1')[0];
const accHealth = accHpRow ? accHpRow.children.length : -1;
const accLedgerRows = fgLedgerRoot.querySelectorAll('.ld-row').length;
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
const accResetRows = fgLedgerRoot.querySelectorAll('.ld-row').length;
const accResetCards = dom.byId['col-cats'].querySelectorAll('.unit-card').length;
const accBuildSurvived = JSON.stringify(A.state.get().build) === accBuildWas;
check(
  '102. PHASE 5\'S OWN ACCEPTANCE RUN. A fight is started, BOTH sides declare '
    + 'an action naming who acts and what it lands on, and the round is '
    + 'advanced — every one of them a real press on a real control. Then SIX '
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
    + 'back with the student\'s build untouched, which is SHARE-07',
  accStarted === true && accDeclLines === 2
    && accRound === '2' && accPoolCats !== '' && accPoolMechs !== ''
    && accHealth >= 0 && accLedgerRows === 1 && accWhatChanged !== ''
    && accMarkShown === true && accHealthRuled === accHealth
    && accWhatChangedNow !== accWhatChangedWas
    && accCardsNow === accCardsWas && accDeadRead.marked === true
    && accBoardAfterUndo !== accBoardBeforeUndo && accUndoRead.marked === false
    && accResetRound === '1' && accResetRows === 0
    && accResetCards === accCardsWas && accBuildSurvived === true
    && errPanel.hidden === true,
  'declaration lines on the page=' + accDeclLines
    + ' | THE SIX: round=' + JSON.stringify(accRound)
    + ' cats pool=' + JSON.stringify(accPoolCats)
    + ' mechs pool=' + JSON.stringify(accPoolMechs)
    + ' m1 health tokens=' + accHealth
    + ' ledger rows=' + accLedgerRows
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
   A COMMENT. The switch is allowed to put the two roster columns away and it is
   allowed to put the fight band away. It is NOT allowed to take the projection
   or the reference band with either of them, because PROJ-05 wants the
   projection visible AT THE MOMENT the fight contradicts it and REF-03 wants
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
check(
  '103b. #strip AND #refband ARE IN NEITHER SIDE OF THE SWITCH, walked from '
    + 'both nodes rather than asserted about them. Neither has #views as an '
    + 'ancestor and both are still inside #board — which is what makes PROJ-05 '
    + 'and REF-03 structural: #board stands in BOTH views and only the two '
    + '.brd-col columns are put away. The markup half carries the claim the '
    + 'stub page structurally cannot: .fg-band is a class-only wrapper this '
    + 'page does not build, so the band\'s own slice of cats-vs-mechs.html is '
    + 'read for both spellings instead, and the board\'s slice is read for '
    + 'both being present. Floored on both nodes being found and on all three '
    + 'slices being non-empty, because a walk that found neither and a slice '
    + 'that came back empty each pass spotlessly',
  fgStrip !== null && vwRefband !== null
    && vwStripInSwitch === false && vwRefInSwitch === false
    && vwStripInBoard === true && vwRefInBoard === true
    && vwSwitchText.length > 0 && vwBandText.length > 0 && vwBoardText.length > 0
    && vwSwitchText.indexOf(vwStripSpelling) === -1
    && vwSwitchText.indexOf(vwRefSpelling) === -1
    && vwBandText.indexOf(vwStripSpelling) === -1
    && vwBandText.indexOf(vwRefSpelling) === -1
    && vwBoardText.indexOf(vwStripSpelling) !== -1
    && vwBoardText.indexOf(vwRefSpelling) !== -1,
  '#strip inside the switch=' + vwStripInSwitch
    + ' inside #board=' + vwStripInBoard
    + ' | #refband inside the switch=' + vwRefInSwitch
    + ' inside #board=' + vwRefInBoard
    + ' | markup slices, chars: switch=' + vwSwitchText.length
    + ' band=' + vwBandText.length + ' board=' + vwBoardText.length
    + ' | the band\'s markup carries #strip=' + (vwBandText.indexOf(vwStripSpelling) !== -1)
    + ' #refband=' + (vwBandText.indexOf(vwRefSpelling) !== -1)
    + ' | the board\'s markup carries #strip=' + (vwBoardText.indexOf(vwStripSpelling) !== -1)
    + ' #refband=' + (vwBoardText.indexOf(vwRefSpelling) !== -1)
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
fgDeclare('cats', fgCatsAct, 'c1', 'm1');
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
            says: a fight carried past two rounds, so the oldest record rolling
            off MAX_PAST_ROUNDS is unread on the page; a declaration naming
            NOBODY in either position, which is a real record the choosers offer
            and no row above makes; an action whose cost is in a type a student
            invented, which the report says it cannot price; and every line the
            error panel would carry, because no press above is meant to raise
            one and every row asserts it did not.
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
        30. THE SPENT READING MEASURES ZERO AT EVERY OBSERVABLE MOMENT, AND
            THIS PLAN DID NOT PAPER OVER IT. advanceRound spends each declared
            cost and refills both pools from the build in the SAME commit, so no
            frame is ever rendered between the two writes and `0 of 3 spent` is
            what the bar says on every frame — which row 102 reads back verbatim
            as one of its six values rather than asserting around. FIGHT-09 asks
            for spent to be visibly distinct from available. Plan 05-07 measured
            this, wrote the two admissible fixes at the site, and recorded it as
            a developer decision rather than a render-tier change; it is still
            one. Not a gate limitation so much as a shipped fact this gate is
            now on the record about.
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
            the last thing any harness can. Human. --- */

console.log(
  'interaction gate: ' + (gateChecks - gateFailures.length) + ' of ' + gateChecks
    + ' checks passed'
);

if (gateFailures.length > 0) {
  fail('INTERACTION GATE: ' + gateFailures.length + ' check(s) failed — '
    + gateFailures.join('; '));
}

process.exit(result.failed ? 1 : 0);
