---
phase: 03-advisory-projection-reference-material
reviewed: 2026-08-28T16:31:18Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - cats-vs-mechs.html
  - tests/selftest-node.cjs
findings:
  critical: 1
  warning: 5
  info: 7
  total: 13
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-08-28T16:31:18Z
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Phase 3 adds `soakTotal` / `turnsToWipe` to `[S02]`, paints them into `#strip` from
`[S06.3]`, adds the `REFERENCE` record in `[S01]`, the `#refband` band and the in-column
action/effect cards from `[S06.4]` / `[S06.1]`, the `[C10]` / `[C11]` stylesheets, the
`[S09.8]` / `[S09.9]` suites, and the three-layer PROJ-06 gate plus checks 47-63 in
`tests/selftest-node.cjs`.

**Everything was executed, not asserted.** Established baselines:

- `node tests/selftest-node.cjs` — 411 assertions, 0 failed; interaction gate 63 of 63;
  stub-drift 36 shell ids; Layer A 29 words / Layer B 2436 literals / Layer C 135
  rendered strings; perf 5 ms.
- Full in-file suite with a lifted stub DOM (`Event`/`MouseEvent`/`KeyboardEvent`
  supplied) — **TOTAL 516, passed 516, failed 0**, distributed
  `board defaults 24 · model derivations 12 · state contract 82 · render contract 8 ·
  interaction contract 9 · token appearance 24 · token authoring 268 · projection 51 ·
  reference material 35 · assertion harness 3`. The total is asserted, so no suite threw
  past its own state restore.
- Project greps: `grep -ci "counter\|rating\|balanced\|difficulty"` = **0**;
  `grep -c "verdict\|balanced\|rating\|difficulty"` = **0**; injection sinks = 0;
  `https?://` = 0; one `<script>`, one `<style>`.

**Claims that hold, verified by deliberate breakage on a scratch copy:**

- `turnsToWipe`'s divisor-side refusal. Rewriting it as a result check
  (`if (out.fast === Infinity) return null`) leaves *every other* refusal row green and
  turns exactly one red — the 0-against-0 row in `[S09.8]`. The paragraph in `[S02]` is
  accurate.
- Check 61 is genuinely non-vacuous. A build-time label read written *without* the literal
  `labelFor` (`App.state.get().build.tokens[keywordId].name`) reddens gate check 61 and the
  matching `[S09.9]` row, and only on the second, post-structural read.
- The rendered strings. A sweep of every reachable Cats allocation (ap 0-9 × hp 0-6 ×
  shield 0-3 × roster 9→1) produced 84 distinct projection strings with **no** `Infinity`,
  `NaN`, `undefined` or negative anywhere.
- The four `#strip` / `#refband` rules hold *today*: 0 `data-k`, 0 `.brd-value`,
  0 `data-amt`, 0 `.brd-line--opt`, 0 `data-lbl`, 0 `data-act` inside either node, and
  0 dispatchable/sync attributes on any of the six `.ref-card`s.

**What is wrong.** One reachable copy defect on the projected surface (CR-01), and — the
larger finding — two gates whose failure messages are stronger than the gates. A
reference card that becomes a live stepper *and* steals focus restore passes all 516
in-file assertions, all 63 gate checks and all three PROJ-06 layers (WR-01, WR-02), both
proved by mutation.

**Known gaps, stated rather than guessed:** no browser and no Playwright here. Real-browser
layout, `<dialog>` close-request behaviour, sticky behaviour on a short viewport, and glyph
rendering of `≈` / `÷` / `–` are unreviewable in this environment. The stub DOM's selector
engine parses only classes and `[data-*]`, and its `textContent` is an own property; every
stub-only result above was cross-checked against the source.

---

## Critical Issues

### CR-01: The projection prints "≈1 turn**s**" — a reachable grammatical error on the projected figure

**File:** `cats-vs-mechs.html:3909`
**Confidence:** HIGH — executed. Reproduced twice, once by driving `App.ops.removeUnit`
and once by an exhaustive sweep of reachable allocations.

**Issue:** `turnsText` hard-codes the plural noun. When the two bounds agree at 1 the page
renders `≈1 turns to wipe Cats`.

Reproduction from the shipped board, through shipped controls only — press *Remove Cat*
eight times (`removeUnit` refuses only at the last unit):

```
cats units left: 1
mechs panel turns: "≈1 turns to wipe Cats"   work: "3 health ÷ 9 per turn"
```

The mirror case is equally reachable (`≈1 turns to wipe Mechs` at every Mech on 1 health
with Cats at 9 action points). The 84-string sweep of reachable allocations found exactly
one defective string, and this is it. No row in `[S09.8]`, no gate check in 49-57, and no
row in the 516-assertion suite exercises `fast === slow === 1`; every pinned figure is
3, 4-6, 9 or 12.

This is not an arithmetic error — it is a copy error, and on this artifact the copy *is*
the deliverable. It lands at `.brd-value`'s 24px, weight 700, on a workshop projector, in
the one surface the whole phase exists to make trustworthy. Worse, the file already
established the opposite standard eleven hundred lines up: `REFERENCE.beats` carries its
connective as *data* — `beats` / `beat` — precisely so "no rendering code anywhere has to
guess whether an action name is plural". `turnsText` then guesses, and guesses wrong.

**Fix** — one branch, no banned substring introduced, no new data:

```js
  function turnsText(r, foeName) {
    if (r === null) { return 'no damage to spend'; }
    if (r.ehp === 0) { return 'nothing left to wipe'; }
    // The noun agrees with the figure. A single bound of 1 is reachable through
    // the shipped controls — one Cat left against nine points of throughput —
    // and a range is always plural because its two bounds differ by at least 1.
    var noun = (r.fast === r.slow && r.fast === 1) ? ' turn to wipe ' : ' turns to wipe ';
    if (r.fast === r.slow) { return '≈' + r.fast + noun + foeName; }
    return '≈' + r.fast + '–' + r.slow + noun + foeName;
  }
```

Add the missing row to `[S09.8]`'s rendered half and mirror it into the gate beside
checks 49-52, so the singular case is pinned the way 9, 3 and 4-6 already are:

```js
    // A single bound of ONE, which is the only figure whose noun is not the
    // plural one. Reachable from the shipped board by removing Cats.
    App.state.restore(savedAll); App.state.flush();
    App.state.get().build.cats.units.slice(1).forEach(function (u) {
      App.ops.removeUnit('cats', u.id);
    });
    App.state.flush();
    t.eq('a single turn reads as one turn rather than one turns',
      prj('turns', 'mechs'), '≈1 turn to wipe Cats');
```

---

## Warnings

### WR-01: Gate check 63 cannot fail for two of the four things it names — a reference card that dispatches ops passes every gate in the repo

**File:** `tests/selftest-node.cjs:2509-2517`
**Confidence:** HIGH — executed by mutation on a scratch copy.

**Issue:** Check 63 announces that "the card builder's CODE ... carries neither attribute
the interaction layer dispatches on", and enforces it with

```js
const refBanned = ['labelFor', 'data-act', 'data-k', 'createElementNS']
  .filter((w) => refRegionCode.indexOf(w) !== -1);
```

`labelFor` and `createElementNS` are spelled literally in code, so those two halves work.
`data-act` and `data-k` **are never spelled in this file's JavaScript at all** — the
artifact writes attributes through `setData(node, { act: …, k: … })`
(`cats-vs-mechs.html:2703`), which produces `data-act` / `data-k` in the DOM from the
dataset keys `act` / `k`. So the only spellings a real regression can take are invisible
to this check. It is the same shape of vacuity the harness already found and fixed in
check 61, still present one check later.

Proved by mutation. Inserting one line at the top of `refCard`:

```js
setData(card, { act: 'nudgeMaxHp', step: '1', side: 'cats', unit: 'c1',
                amt: 'hp', k: 'mechs/m1/maxHp' });
```

produces, unchanged:

```
411 passed, 0 failed
interaction gate: 63 of 63 checks passed
TOTAL=516 passed=516 failed=0        (full in-file suite with a DOM)
```

while the artifact's behaviour is materially broken. Driving a real `pointerdown` /
`pointerup` on the mutated card:

```
ref-card dataset: {"act":"nudgeMaxHp","step":"1","side":"cats","unit":"c1","amt":"hp", ...}
commits delta: 1    maxHp 3 -> 4
```

A student pressing the *Slash* reference card silently steps a Cat's health. Three
gate layers, 516 assertions and 63 checks all report green.

**Fix:** assert the rendered page as well as the source, which is the register checks 56
and 60 already use — a walk cannot be evaded by a spelling:

```js
const refAttrDrift = [];
['cats', 'mechs'].forEach((side) => {
  refCards(side).forEach((card) => {
    // The card itself and everything under it. Written as dataset reads rather
    // than as a selector, because the stub's engine and a browser's disagree
    // about nothing here and a dataset read is what setData actually writes.
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
  '63b. no rendered reference card carries an attribute the interaction layer '
    + 'dispatches on or the sync pass writes — the source scan above cannot see '
    + 'setData(node, { act: ... }), which is the only spelling this file uses',
  refCards('cats').length === 3 && refAttrDrift.length === 0,
  'attributes found: ' + JSON.stringify(refAttrDrift)
);
```

Keep check 63 for `labelFor` and `createElementNS`, and drop `data-act` / `data-k` from
`refBanned` rather than leaving two entries that can never fire.

### WR-02: The four rules `[S06.3]` and `[S06.4]` call "silent failure modes" are enforced by nothing at all

**File:** `cats-vs-mechs.html:3843-3856` and `cats-vs-mechs.html:4079-4086`
**Confidence:** HIGH — executed by mutation.

**Issue:** Both region banners state, at length, that a `data-k` in `#strip` steals
`keyed()`'s first match, that a `data-amt` on a `.brd-value` paints a confident `0`, and
that a `.brd-line--opt` would be pinned shut for good. All three are true and all three
currently hold (verified: 0 of each in both nodes). **None of them is asserted anywhere.**
The rules live only in prose, in exactly the class of comment the file elsewhere refuses
to trust — `[S09.8]` says "asserts the shape rather than trusting this note" about D-13,
one paragraph away, and then does not do it for these.

Proved by mutation. Adding `k: 'mechs/m1/maxHp'` to the `data-prj="turns"` figure in
`projPanel`:

```
411 passed, 0 failed
interaction gate: 63 of 63 checks passed
```

and the documented breakage is real. `withPreservedFocus` is called with `#board` as its
container (`cats-vs-mechs.html:3204`), `#strip` is a child of `#board` sitting ahead of
`#col-mechs` in document order, so:

```
focus a mechs health field, then addUnit('mechs'):
focus after rebuild -> prj-turns num  data-prj=turns  data-k=mechs/m1/maxHp
```

Focus lands on a non-focusable projection figure instead of the field the student was
typing in — half of ALLOC-07's "twenty clicks make twenty changes", broken silently for
the whole Mechs column. Note the mutation only bites for a `#col-mechs` key; a `#col-cats`
key is masked by document order, which makes this *harder* to notice, not easier.

**Fix:** four lines beside checks 54-56, which already own the strip's shape. Cheap,
mechanical, and it covers `#refband` in the same walk:

```js
const boardRules = [];
['strip', 'refband'].forEach((id) => {
  const n = dom.byId[id];
  if (n.querySelectorAll('[data-k]').length) { boardRules.push(id + ': data-k'); }
  if (n.querySelectorAll('[data-amt]').length) { boardRules.push(id + ': data-amt'); }
  if (n.querySelectorAll('.brd-value').length) { boardRules.push(id + ': .brd-value'); }
  if (n.querySelectorAll('.brd-line--opt').length) { boardRules.push(id + ': --opt'); }
  if (n.querySelectorAll('[data-lbl]').length) { boardRules.push(id + ': data-lbl'); }
});
check(
  '56b. neither region appended to #board by this phase carries any of the four '
    + 'attributes sync() and keyed() act on — each is a silent failure mode and '
    + 'each was, until this row, held only by a comment',
  dom.byId['strip'].children.length > 0 && boardRules.length === 0,
  'rules broken: ' + JSON.stringify(boardRules)
);
```

Mirror it as a row in `[S09.8]` so the in-file harness carries it too.

### WR-03: Layer A bans 25 discretionary words across the entire document, including comments and CSS — it has already cost a comment rewrite and it forecloses a stack-recommended CSS feature

**File:** `tests/selftest-node.cjs:122-152`
**Confidence:** HIGH for the mechanism and the evidence; MEDIUM for the judgement call.

**Issue:** The project's stated requirement is two greps at zero:
`counter|rating|balanced|difficulty`. Layer A enforces those four *and twenty-five more*
— `stronger`, `weak`, `advantage`, `favou?red`, `winner`, `loser`, `overpowered`,
`unfair`, `\bfair\b`, `superior`, `inferior`, `dominat`, `optimal`, `better`, `judgment`,
`outmatch`, `outclass` — case-insensitively, over the **whole file**, in code, in comments
and in CSS alike.

The file itself demonstrates the cost. This phase's own diff contains:

```diff
-    // change, which is the weaker half of the same guarantee. ResizeObserver is
+    // change, which is the narrower half of the same guarantee. ResizeObserver is
```

That comment was reworded for no reason but the gate. `better` and `weak` are ordinary
engineering prose; a future contributor writing "the better path here is …" in a comment
gets a red CI run whose message reads *"PROJ-06 VIOLATION: comparative language reached
cats-vs-mechs.html … The artifact reports what a build costs and what it can take"* —
a diagnosis about rendered copy for something that is not rendered copy. That is the same
category confusion the file's own comment at line 96 argues against when it explains why
`VERDICT_WORDS` is a sibling of `FORBIDDEN` rather than an entry in it.

It also forecloses a documented stack choice: `/balanc/i` bans `text-wrap: balance`, which
`CLAUDE.md`'s Version Compatibility table lists as *"Yes — progressive enhancement,
degrades to nothing"*. The file uses no `text-wrap` today, so this is latent, not broken.

**Fix:** keep the four mandated stems in Layer A — `counter`, `rating`, `balanc`,
`difficult` — plus the unambiguous verdict nouns that have no innocent reading
(`verdict`, `traffic light`, `overpowered`, `underpowered`, `good build`, `bad build`).
Move the rest into `VERDICT_LITERAL_WORDS`, where they are checked against string literals
and the rendered page and **cannot** fire on a comment. That is exactly the split the file
already invented for `score` / `grade` / `judgement` / `worse`, and the reasoning at
lines 113-121 applies verbatim to `weak` and `better`. Net coverage of rendered copy is
unchanged; the false-positive surface on prose goes away.

### WR-04: Layer B's literal extractor does not read template literals

**File:** `tests/selftest-node.cjs:204`
**Confidence:** HIGH — read from source; the gap is latent because the artifact uses no
template literals today (all 84 backticks are inside comments).

**Issue:**

```js
const STRING_LITERAL = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g;
```

Single and double quotes only. Layer B is the **only** layer that scans code for
`score` / `grade` / `judgement` / `rank` / `ahead` / `wins` / `win` / `edge` / `lead` /
`worse` — Layer A deliberately excludes them so the file can discuss its own rule. A
backtick string `` `You win this matchup` `` therefore passes Layer A (not in its list) and
Layer B (not extracted). Layer C would catch it only if that string happens to be rendered
into `#app` in setup mode on the stub page; the harness's own closing note lists five
surfaces Layer C cannot reach.

The section's honesty clause is otherwise scrupulous — it names concatenation, templates
and render-time assembly as out of scope and hands them to Layer C. It does not name this
one, and this one is a plain literal that Layer C only *sometimes* covers.

**Fix:** add the backtick arm and keep the floor, which will rise harmlessly:

```js
// Backticks included. A template literal with no substitution is a plain
// literal and has to be read as one; one WITH a substitution is caught for
// its static halves, which is strictly better than not reading it at all.
const STRING_LITERAL =
  /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g;
```

### WR-05: Nothing pins `state.build[side].actions` to `App.data.DEFAULTS[side].actions`, and the page reads one for the card and the other for the projection

**File:** `cats-vs-mechs.html:3048` (`refActions`) and `cats-vs-mechs.html:1232`
(`bestDamage`, reached with `state.build[side]`)
**Confidence:** MEDIUM — latent, not reachable through any shipped op today; verified by
grep that no op mutates `build[side].actions`.

**Issue:** The Lasers card prints `3 damage` from the frozen `App.data.DEFAULTS`. The
mechs projection prints `27 health ÷ 9 per turn`, where the 9 is
`min(ap, units) × bestDamage(state.build.mechs)` — the **deep copy** in the build slice.
Two reads of the same fact, one frozen and one not, on the same screen, a column apart.

`refActions`'s comment is explicit that this boundary is deliberate and names the day it
has to change: *"The day actions become student-editable, this read is the line that has
to change on purpose."* The decision is sound. What is missing is the tripwire that makes
that day loud. `[S09.1]` asserts `App.data.defaults()`'s actions — but `defaults()` is a
`JSON.parse(JSON.stringify(DEFAULTS))`, so that row agrees with itself by construction and
says nothing about `state.build`. Phase 4 decodes a build code into `state.build`; a code
carrying a tampered `actions[].dmg` would put a card reading "3 damage" beside a worked
line dividing by something else, with nothing red anywhere.

**Fix:** one row in `[S09.9]`, in the register the suite already uses for D-13 and the
`shield` collision:

```js
    /* --- The two reads of one fact, held together. The cards read the FROZEN
           board; the projection reads the BUILD slice. They agree today by
           construction, and the day they stop — a pasted build code from Phase
           4 is the way — a card would print one damage figure while the worked
           line beside it divided by another. This row is that day's alarm. --- */
    t.eq('the actions the cards read and the actions the projection reads are '
      + 'the same actions',
      JSON.stringify([App.state.get().build.cats.actions,
        App.state.get().build.mechs.actions]),
      JSON.stringify([App.data.DEFAULTS.cats.actions,
        App.data.DEFAULTS.mechs.actions]));
```

---

## Info

### IN-01: Dead branch in `syncProjection`

**File:** `cats-vs-mechs.html:4039`
**Issue:** `if (!state.build[side] || !state.build[foe]) { continue; }`. Every `[data-prj]`
node is built by `projPanel(state, side)` with `side` a literal `'cats'` or `'mechs'`, so
`state.build[side]` is always present and `foe` is always the other one. The branch cannot
be taken. It reads as a guard against a case that does not exist, which invites a later
reader to believe `data-side` can carry something else.
**Fix:** delete it, or replace it with the assertion it is actually standing in for —
`if (side !== 'cats' && side !== 'mechs') { continue; }` — which at least describes a
reachable shape (a stray `data-prj` node appended by a later phase).

### IN-02: `turnsToWipe` and `workLines` are recomputed once per node instead of once per side

**File:** `cats-vs-mechs.html:4042-4043`
**Issue:** The loop runs over four `[data-prj]` nodes per panel and calls
`App.model.turnsToWipe(...)` and `workLines(r)` inside it — eight full derivations per
frame where two would do. `workLines` is discarded outright for the `owner` and `turns`
nodes. Not a performance finding (out of scope, and the measured budget is 5 ms for 100
commits): the smell is that four nodes of one panel are computed from four *separate*
calls, so any future non-purity in the model would let one panel disagree with itself.
**Fix:** hoist the per-side derivation above the node loop, keyed by side, and read it
inside.

### IN-03: `weakest` is a dead entry in `VERDICT_WORDS`

**File:** `tests/selftest-node.cjs:131`
**Issue:** `{ label: 'weakest', re: /weakest/i }` sits directly below
`{ label: 'weak stem', re: /weak/i }`. Every string matching `weakest` already matches
`weak`, so this rule can never be the one that fires and its label can never appear in a
failure message. (`stronger` / `strongest` are *not* the same case — neither subsumes the
other — and `unfair` is not subsumed by `\bfair\b` because of the word boundary. Only this
one is dead.)
**Fix:** remove the entry, or reword the `weak` stem if the intent was to catch only the
superlative.

### IN-04: Check 57's `.style` count is a whole-document substring count with a misleading failure message

**File:** `tests/selftest-node.cjs:2266-2273`
**Issue:** `html.split('.style').length - 1 === 1`. It counts the literal substring
anywhere in 8,597 lines including comments and CSS. Writing the words "the `.style`
property" in any future comment reddens CI with a message about proportional bars, shared
scales and midpoint markers. The check is a good idea — it is the cheapest available proof
that D-13 holds — but it should say what it measured.
**Fix:** scope it to the script block (`match[1]`), which is where the access lives, and
report the offending line numbers in the detail string rather than only the count.

### IN-05: `#refband` is styled by id and is the only child of `#board` with no class

**File:** `cats-vs-mechs.html:682` (markup), `cats-vs-mechs.html:147` and `590` (CSS)
**Issue:** Its four siblings carry `.brd-col`, `.brd-strip`, `.brd-col`, `.muted`. `#refband`
carries nothing, and `[C11]` styles it through the id selector — specificity 100, above
every `.ref-` rule in the same region, in a stylesheet whose own banner argues for class
prefixes as the file's scoping discipline. A later `.ref-band` rule cannot override it
without a second id selector or `!important`.
**Fix:** give it `class="brd-refband"` in the shell and move the block from `#refband` to
`.brd-refband`, leaving `#refband{grid-column:1 / -1}` in `[C03]` beside `#board-empty`
where the placement rule belongs.

### IN-06: `.num` (tabular digits) is applied to a string that is usually not a number

**File:** `cats-vs-mechs.html:3126`
**Issue:** `text('span', 'ref-dmg num', dmgText(action.dmg))`. Four of the six shipped
actions render `no damage`, so the tabular-figure class is carried by prose two-thirds of
the time. `.num`'s stated purpose in `[C04]` is that "digits keep a stable width while a
held button steps" — nothing here steps and there are usually no digits.
**Fix:** apply `num` conditionally, or drop it — the figure is static and never animates.

### IN-07: `stripComments` (check 63) is an ad-hoc scanner that mis-parses a regex literal containing a quote

**File:** `tests/selftest-node.cjs:2479-2500`
**Issue:** Quote detection runs before comment detection and there is no regex-literal
state, so a regex such as `/[^']/` in the scanned region opens quote mode at the `'` and
swallows everything up to the next one. Harmless today — the `[S06.1]` reference-card
region contains no regex literals — and the `refRegionCode.length > 400` floor catches a
total slice failure but not a partial one.
**Fix:** name the limitation in the comment beside the function, in the register the
`FORBIDDEN` and Layer A/B scans already use about themselves ("this catches X; it does not
catch Y"), so the next reader who adds a regex to that region knows the scan silently
shrank.

---

_Reviewed: 2026-08-28T16:31:18Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
