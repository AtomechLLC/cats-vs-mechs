---
phase: 05-fight-loop-playtest
plan: 13
subsystem: model
tags: [s02, s05, d-27, spokenFor, needsAt, defaultAt, declareAction, radio, fight-03, fight-09, fight-12]

requires:
  - phase: 05-fight-loop-playtest
    plan: 03
    provides: "declareAction, clearDeclaration, clearDeclarations, MAX_DECLARATIONS, the { side, act, by, at } record and namedOr"
  - phase: 05-fight-loop-playtest
    plan: 04
    provides: "advanceRound and its step-4 empty of `decl`, which is why no existing row declared twice for one performer inside a round"
  - phase: 05-fight-loop-playtest
    plan: 07
    provides: "the measured apSpent-reads-zero finding and the two admissible fixes written into the file, of which D-27 chose the second"
  - phase: 05-fight-loop-playtest
    plan: 12
    provides: "the fight tab this plan's arithmetic will be painted onto, and the 1188/0 + 163/163 + 114-id baseline"
provides:
  - "App.model.spokenFor(actions, decl, side) — what one side's standing declarations have spoken for, summed through actionApCost, floored in the derivation, storing nothing"
  - "App.model.needsAt(action) — whether an action aims a term at what it points at, read through App.data.XF_WHO rather than a spelled word"
  - "App.model.defaultAt(fight, side) — the lowest-health living enemy, ties by roster order, `alive === false` the only exclusion (D-00d), null a real answer"
  - "declareAction with radio-per-performer semantics: a named performer's second declaration REPLACES in place; a null performer always appends; the ceiling refuses on the append path only; the label carries the performer"
  - "App.ops.SIDES, frozen and exported, so defaultAt derives the other side instead of spelling a fourth ['cats','mechs'] literal"
  - "28 rows in [S09.12], all above any no-DOM bracket and all running in CI. SUITE_FLOOR 1158 -> 1186"
affects: [05-14, 05-15, 05-16, 05-11]

tech-stack:
  added: []
  patterns:
    - "a derivation that SUGGESTS rather than reports, kept honest by four written properties — one press to overrule, a record indistinguishable from a hand-picked one, nothing surviving into the applier, and no op calling it"
    - "a record shape enforcing a UI rule, so the rule can be driven at the op instead of asserted about a button"
    - "a commit label carrying the ACTOR rather than the SLOT, so one act of changing one's mind costs one Ctrl+Z and two acts cost two"
    - "a derivation amended rather than retired when its readers live in sections the plan does not own — the decision written at the site, not left to a plan file"
    - "a suite fill bounded by a COUNT and never by the quantity the op under test controls, because the failure mode of the other spelling is a HANG rather than a red row"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "apSpent IS AMENDED AND NOT RETIRED, AND THE DECISION IS WRITTEN AT THE DERIVATION. It has two live readers ([S06.7]'s pool line and [S06.9]'s ledger figure) in sections this plan's ownership explicitly excludes, and it answers a question spokenFor does not: what a MID-FIGHT BUILD EDIT did to the pool, which is FIGHT-10's own hazard and the direction its floor guards. The two numbers look in opposite directions — apSpent BACKWARD at two slices that have drifted, spokenFor FORWARD at a list of intents nothing has resolved. Leaving the old comment standing while it argued for a reading the page no longer takes would have been the [S03] banner-that-quietly-lies failure, so the measured reads-zero finding and D-27's resolution are now written there"
  - "THE DEFAULT IS A DERIVATION AND THE OP NEVER LEARNS ABOUT IT. declareAction still stores exactly what it is handed — null in is null stored — and App.model.defaultAt is not called from it. An op that filled a target in would make 'Hairball, no target' unrecordable and would move a SUGGESTION into the one layer that may only restate. PROBE AV drove exactly that and reddened TWO rows: the new one, and plan 05-02's shipped 'Hairball, no target' row, which is the corroboration that the drift really does take a record away"
  - "SIDES IS EXPORTED AND FROZEN RATHER THAN A FOURTH ['cats','mechs'] LITERAL BEING WRITTEN IN [S02]. [S04]'s WIRE_SIDES and [S06]'s FIGHT_SIDES are the first two copies and each states a reason of its own; a third with no reason is how a side added in one place stops existing in another. defaultAt reads it at CALL time, the way needsAt reads App.data.XF_WHO, so it is a read of a frozen constant and not a load-time dependency. Freezing came with the export: a constant handed out of a frozen return object is only as constant as the thing behind the key, and this one is the side allowlist __proto__ guard depends on"
  - "A NULL PERFORMER ALWAYS APPENDS, AND THE PARAGRAPH SAYS SO RATHER THAN THE SILENCE. There is no ROW on D-27's grid for nobody, so there is nothing for a nameless declaration to be one-of-a-kind about; folding two of them together would take away a record the student made and the surface never offered to make singular. PROBE AL drove the unconditional replace and the row reddened printing [1,\"slash\",\"true\"] against [3,...]"
  - "THE CEILING'S REFUSAL MOVED ONTO THE APPEND PATH ONLY, WORDING UNCHANGED. A replace adds nothing to the list, so refusing one at MAX_DECLARATIONS would turn a bound on the RECORD into a ruling on what a student may do — the distinction affordability's comment draws. PROBE AM left it on both paths and the row reddened by name, printing the refusal where a 0 belonged"
  - "THE COMMIT LABEL CARRIES THE PERFORMER AND NO LONGER THE SLOT INDEX, and it serves plan 03.1-06's stated reason BETTER under the new shape. Two units declared in a burst are two labels and stay two Ctrl+Z steps; a student re-picking for the SAME unit inside COALESCE_MS folds into one, which is one act of changing their mind costing one step back. A RETARGET IS THAT SAME ACT — the change-target flow re-declares for the same performer — so declare-then-immediately-retarget is one undo entry, which is what a student will expect"
  - "NOT ONE EXISTING ROW'S CLAIM CHANGED, AND THAT WAS VERIFIED BY READING RATHER THAN ASSUMED. The plan expected the row that 'declares cats/slash/c1/m1 TWICE' to need rewriting; it does not, because those two declares have an advanceRound between them whose step 4 empties `decl`. Every other drive of this op in the repo names a different performer per side within a round, and the MAX_DECLARATIONS t.info pushes onto a detached CLONE. Both were read; neither moved"
  - "THE WHOLE SUITE SITS ABOVE THE NO-DOM BRACKET AND RUNS IN CI. This plan is pure state work — three derivations and one record shape — so all 28 rows can fail a build, which is where a wrong default or a wrong sum has to be caught. A wrong number in a teaching artifact teaches a wrong lesson"

patterns-established:
  - "a probe that finds a defect in the ROW before it finds anything about the code, and the row is fixed and re-probed rather than the probe being called satisfied"
  - "a suite fill bounded by presses, never by the list it is filling, when the op under test decides that list's length"
  - "three derivations exported together with a written statement of the two naming gates they were checked against — the applier stem list they must not near-miss, and the key-name stems check 73c refuses"

requirements-completed: [FIGHT-03, FIGHT-09, FIGHT-12]

duration: 82min
completed: 2026-08-29
---

# Phase 05 Plan 13: The Arithmetic Behind D-27's Preview Summary

**Three pure derivations that store nothing — what a round has spoken for,
whether an action needs somebody to point at, and who it points at unless the
student says otherwise — plus a record shape that makes one unit hold one
action because the RECORD says so and not because a button stopped anybody. The
op still stores precisely what it is handed, so a declaration made by default
and one made by hand are the same four keys with the same values.**

## The gate, before and after

| | before (post-05-12) | after |
|---|---|---|
| suite | 1188 passed, 0 failed | **1216 passed, 0 failed** (+28) |
| `SUITE_FLOOR` | 1158 | **1186** (+28) |
| margin above floor | 30 | **30 — kept for the tenth plan running** |
| interaction gate | 163 of 163 | **163 of 163 — unchanged** |
| stub-drift | 114 shell ids | **114 — unchanged, no id added** |
| `#app` (setup) | 128 | **128 — unchanged** |
| `#app` (fight) | 421, `FIGHT_FLOOR` 120 | **421 — unchanged** |
| `FIGHT_FLOOR` | 120 | 120 — **not moved** |
| dialogs | 145 across 4 roots | 145 across 4 roots — unchanged |
| proposal pane | 60, floor 23 | 60, floor 23 — unchanged |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 7554 literals, 0 hits | **7903 literals**, 0 hits |
| perf | 7 ms of 50 | **6 ms of 50** |

`node tests/selftest-node.cjs` exits 0.

**`url(` 0. `createElementNS|<svg` 0. `innerHTML` 0. `text-wrap` 0.
`counter|balanc|rating` 0, whole document, identifiers included. One classic
`<script>`, one `<style>`. `DEFAULTS.cats.ap` untouched (D-25) — the whole of
`[S01] DATA` diffs EMPTY.**

**Nothing renders, so nothing on the page moved.** Every Layer C figure and the
whole interaction gate are unchanged, which is the shape a pure-state plan
should have and is worth stating rather than assuming.

## What was built

### `[S02]` — three derivations

| name | signature | answers |
|---|---|---|
| `spokenFor` | `(actions, decl, side)` → non-negative integer | the sum of `actionApCost` over one side's standing declarations |
| `needsAt` | `(action)` → boolean | whether the action aims a term at what it points at |
| `defaultAt` | `(fight, side)` → unit id or `null` | the lowest-health living enemy, ties by roster order |

**`spokenFor`.** The action is found by an `Array.find` over the record's own
`id`, never a bare keyed lookup — from Phase 4 an id can arrive from a pasted
build code and a bare lookup for `constructor` resolves on the prototype. A
declaration naming a departed action contributes **0 and is not a refusal**; a
cost `actionApCost` cannot price contributes **0**, for the reason
`affordability` hands back `apCost: null` rather than throwing. The answer is
floored **in the derivation**, not at the call site.

The paragraph says what the number **is not**, first, because that is the whole
hazard: it is not spent, nothing has resolved, no pool has moved, and
`advanceRound` is byte-for-byte the op it was.

**`needsAt`.** Reads `App.data.XF_WHO[1]` at the call site instead of spelling
the word, so this derivation and the codec read one table. A missing `xf`, a
non-array `xf` and a term that is not an object all answer `false`.

**`defaultAt`.** The candidates are the units of the side that is not `side`,
taken from the shipped side list. `alive === false` is the **only** exclusion —
**a unit at zero health that nobody ruled is still pointed at**, which is D-00d
and the clause a tidy implementation loses. Ties go to roster order, and that
tie-break is chosen *because it is the only one stable across repaints*: a
most-recently-damaged or a random pick would move the unit under a student
between two frames. No living enemy answers `null`, which is a real answer.

**The paragraph beside it names it as a suggestion and keeps it changeable.**
Four properties, all written at the site: the change-target control is one press
away; the record is indistinguishable from a hand-picked one; nothing about it
survives into `advanceRound`, which reads `at` and has no way to know how it got
there; and no op calls it. This is the one derivation in the file that proposes
rather than reports, and an unexplained suggestion is how a tool starts
adjudicating.

### `[S02]` — the `apSpent` decision, taken and written down

**Amended, not retired.** Its two readers live in `[S06.7]` and `[S06.9]`,
sections this plan's ownership explicitly excludes, and it answers a question
`spokenFor` does not — what a mid-fight build edit did to the pool. Both facts
are now in its own comment together with the measured reads-zero finding and
D-27's resolution, so the derivation no longer argues for a reading the page is
about to stop taking.

### `[S05]` — one performer, one action

```
by names a unit + a standing declaration by that unit on this side  -> OVERWRITE in place at its index
by names a unit + no standing declaration by that unit              -> APPEND
by is null                                                          -> ALWAYS APPEND
```

One assignment (`decl[index] = { ... }`) serves both paths, because an index
equal to the length appends. The record is **built** rather than patched even on
the replace path, so a previous shape's keys cannot survive.

- **`MAX_DECLARATIONS`' refusal moved onto the append branch only.** Wording
  untouched.
- **The label is `'declare ' + side + '/' + (by || 'nobody')`.**
- **The returned index is the index it landed at, whichever path ran.** Read
  `:26241`'s descendant first — it is a fresh fight and still expects `0`.
- **`atUnitId` keeps its exact meaning.** `App.model.defaultAt` is not called
  from here and must not be, and the paragraph says why.

Everything else is unchanged and seen to be: guards outside the commit, `fightOf`
on the LIVE state, `findAction` refusing by name, `findUnit` bounding `by` to
this side and `unitAnywhere` letting `at` name **either side's** (03.1-07's
ruling, restated at the site so this op does not quietly become where a
restriction gets added).

### `App.ops.SIDES`, frozen and exported

So `defaultAt` derives "the side that is not the acting one" instead of writing a
fourth `['cats','mechs']` literal. Read at call time. Frozen in the same change,
because a constant handed out of a frozen return object is only as constant as
the thing behind the key — and this one is the allowlist the `__proto__` guard
above it depends on.

### The 28 rows, all in `[S09.12]`, all above the no-DOM bracket

**Task 1 — 19 rows.** Six for `spokenFor` (an empty round; one cost read through
`actionApCost`; a sum with the other side's declaration excluded; an authored
action taken away out from under a standing declaration; a cost the file cannot
price plus the never-negative clause; and the fight slice still opening on its
five keys afterwards). Five for `needsAt` (the two shipped actions that aim a
term at what they point at; the four that do not, plus one aimed at the one who
acts; and three malformed shapes a pasted build code can hand over). Seven for
`defaultAt`, plus the prototype.

**Task 2 — 9 rows.** A replace that does not grow the list and returns the index
it replaced; a different performer appending; a retarget (a replace that moves
only `at`); three nameless declarations standing as three; a replace succeeding
at the ceiling while an append is refused by name with the shipped wording;
`at: null` in and `at: null` out on a board where `defaultAt` would have answered
a unit; two units in a burst being two undo entries; two re-picks for one unit
being one; the prototype.

**The boards are driven through the shipped ops wherever the ops can make them**
— PROBE I's finding, that a literal agrees with whatever its author believed the
shape was while a driven board agrees with the file. Three shapes the ops
deliberately cannot make are literals and each says so at the row: an empty enemy
roster (`MIN_UNITS` forbids it), a cost in a token that is not action points
(`setActionCost` forbids it), and a malformed term (every authoring op refuses
one). All three arrive from a pasted build code, which is why the derivations are
defensive about them at all.

## Every amended row's OLD claim and NEW claim, side by side

**There are none, and that is the finding.** The plan expected at least four rows
to need rewriting. Every one was read and every one still holds:

| row | plan's expectation | what reading found | outcome |
|---|---|---|---|
| the pair that declares `cats/slash/c1/m1` **twice** | "with replace semantics the second no longer appends; this row's claim changes" | the two declares have an `advanceRound()` **between them**, and its step 4 sets `g.decl = []`. The second is an append onto an empty list exactly as before | **unchanged** |
| the row reading the returned index | "assert both paths' returns" | it is taken on a fresh fight where the append path runs and `0` is still correct. **Both paths' returns are asserted in the NEW rows instead**, where a board exists that can tell them apart | **unchanged; the claim is added rather than moved** |
| the rows declaring with `by: null` | "assert those still APPEND, twice, and that the list holds both" | the four-declaration row holds exactly one `by: null`. **A new row drives three of them** rather than widening a row written for a different claim | **unchanged; the claim is added** |
| the `MAX_DECLARATIONS` `t.info` | "pushes onto a clone — verify, do not assume" | verified by reading: `JSON.parse(JSON.stringify(App.state.get()))` and then `wide.fight.decl.push(...)`. The op is never called | **unchanged** |
| "EACH DECLARATION IS ITS OWN UNDO ENTRY" | not named | drives `c1` and `m1` — different sides, different labels under the new spelling too. **A new row drives `c1` and `c2` on ONE side**, which is what the performer in the label is newly responsible for | **unchanged; the claim is added** |

Rewriting a row to restate a claim it already made would have been churn, and
changing a drive until an old number came back would have been the failure the
plan warned about. The new claims went into new rows.

## The probes — all three run, all three recorded, all three reverted

### PROBE AL — the replace made unconditional, so a null `by` collapses too

**First run: it did not go red. It HUNG.**

```
$ node tests/selftest-node.cjs
[no output; killed after 300s]
```

**Diagnosis, and it is a defect in the ROW rather than in the op.** The
ceiling row's fill was spelled `while (fight().decl.length <
App.ops.MAX_DECLARATIONS)` — reading the very quantity `declareAction`
controls. Under an unconditional replace the nameless declarations fold into
one, the list stops at 2, and the loop runs for ever. **A harness that hangs is
worse than one that aborts, because there is nothing at all to read.** Plans
05-02 through 05-05 each taught that a row must be able to FAIL and not to
THROW; this is a third shape of the same lesson.

**Fixed** (commit `159e74c`): bounded by the number of presses, so the same
violation leaves the row failing with both numbers printed. Re-run green
(1216/0), re-committed, re-probed.

**Second run, against the fixed row — red by name:**

```
FAIL  the fight loop :: A DECLARATION THAT NAMES NOBODY ALWAYS APPENDS, AND
      THREE OF THEM STAND AS THREE. ...
      actual:   [1,"slash","true"]
      expected: [3,"hairball,screech,slash","true,true,true"]
FAIL  the fight loop :: AT THE CEILING A REPLACE STILL SUCCEEDS WHILE AN
      APPEND IS REFUSED BY NAME. ...
      actual:   [2,0,2,"screech","DID NOT REFUSE"]
1214 passed, 2 failed
interaction gate: 163 of 163 checks passed
```

Two rows, and the second is the fix earning its place: it now reports a
readable failure where it previously reported nothing at all.

### PROBE AM — the `MAX_DECLARATIONS` refusal left on both paths

```
FAIL  the fight loop :: AT THE CEILING A REPLACE STILL SUCCEEDS WHILE AN
      APPEND IS REFUSED BY NAME. ...
      actual:   [48,"REFUSED: This round already holds 48 declarations. Clear
                one before adding another.",48,"slash","This round already
                holds 48 declarations. Clear one before adding another."]
      expected: [48,0,48,"screech","This round already holds 48 declarations.
                Clear one before adding another."]
1215 passed, 1 failed
interaction gate: 163 of 163 checks passed
```

Exactly one row, and it names the failure: the replace was refused, the record
still says `slash`, and the student who wanted to change their mind on a full
board could not.

### PROBE AV — `App.model.defaultAt` called from inside `declareAction`

```
FAIL  the fight loop :: a declaration names a PERFORMER and a unit it POINTS
      AT, and neither is required: "Hairball, no target" is a thing a student
      says and therefore a thing this records ...
      actual:   ["hairball","act,at,by,side",true,false]
      expected: ["hairball","act,at,by,side",true,true]
FAIL  the fight loop :: THE OP STORES EXACTLY WHAT IT WAS HANDED: null in the
      `at` position is null stored ...
      actual:   ["m1",true,"m1",true]
      expected: [null,true,"m1",true]
1214 passed, 2 failed
interaction gate: 163 of 163 checks passed
```

**The second red row is the corroboration.** It is plan 05-02's shipped
"Hairball, no target" row, and it going red is the mechanical proof of the
sentence in the op's paragraph: an op that filled a target in makes
"Hairball, no target" **unrecordable**. This is the one drift the whole
paragraph exists to prevent, and it is now held by two rows written five plans
apart.

**Every probe was applied after a commit, reverted from a scratchpad `cp`
snapshot rather than `git checkout --`, and `git status --short` printed empty
after each.**

## Diffs proved empty by line span, not asserted

```
[S01] DATA           3300-4112     -> 3300-4112       diff EMPTY  (DEFAULTS.cats.ap, D-25)
<style>                 7-2256     ->    7-2256       diff EMPTY
ruleRound + advanceRound  7615-7891 -> 7880-8156      diff EMPTY  (277 lines)
[S06] region       9389-15306      -> 9669-15586      diff EMPTY
[S07] region      15332-18782      -> 15612-19062     diff EMPTY
```

Thirteen hunks in `cats-vs-mechs.html`, all of them in `[S02]`, `[S05]` or
`[S09.12]`. No `[S06.*]` line, no `[S07.*]` line, no `<style>` line, no static
shell markup, no interaction-gate row, no shell id.

## Threat register outcomes

| Threat | Outcome |
|---|---|
| T-05-52 bare keyed lookup on a pasted action id | `Array.find` over the record's own `id` in `spokenFor`; the rule stated at the site |
| T-05-53 a replace collapsing two legitimate nameless declarations | replace only when `by` names a unit; asserted both ways; **PROBE AL drove the violation and the row reddened** |
| T-05-54 the ceiling refusing a mind change on a full board | the refusal moved onto the append path; **PROBE AM drove the violation and the row reddened by name** |
| T-05-55 one undo taking back two acts | the label carries the performer; two rows, one for two units on one side and one for two re-picks of one unit |
| T-05-56 a "spoken for" reading that is really a spent reading | the derivation stores nothing, `advanceRound` diffs empty over 277 lines, and the paragraph says what the number is not — plus a driven row reading the slice's key set back after the reading |
| T-05-68 the default migrating into `declareAction` | the op is handed the answer and never computes it; **PROBE AV drove the violation and TWO rows reddened**, one of them plan 05-02's |
| T-05-69 a default moving under the student between frames | the tie-break is roster order and the derivation is pure; a row reads the same board twice in one assertion |
| T-05-70 a dead-ruled unit chosen, or a zero-health unruled unit skipped | `alive === false` the only exclusion, D-00d written at the site, both directions driven through the shipped rulings |
| T-05-SC npm/pip/cargo installs | zero packages installed |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The ceiling row's fill could hang instead of failing**

- **Found during:** Task 2, PROBE AL
- **Issue:** `while (fight().decl.length < App.ops.MAX_DECLARATIONS)` reads the
  quantity the op under test controls. Under the probe's violation the list
  never grows and the loop never ends: the run did not go red and did not
  throw, it hung, and a hung harness reports nothing at all.
- **Fix:** bounded by the number of presses as well as the list length, so the
  same violation leaves the row failing with both numbers printed. The
  diagnosis is written at the row in the register plans 05-02..05-05 used for
  the row-must-fail-not-throw lesson.
- **Files modified:** `cats-vs-mechs.html`
- **Commit:** `159e74c`

### Judgement calls the plan left open

**2. `apSpent` amended rather than retired.** The plan said "decide, and write
the decision down". Retiring it would have required editing `[S06.7]` and
`[S06.9]`, which `section_ownership` excludes, and it answers a question
`spokenFor` does not. Amended, with both halves of the reasoning at the site.

**3. `App.ops.SIDES` exported and frozen.** The plan required `defaultAt` to
derive the other side "from `SIDES` rather than spelled". `SIDES` lived in
`[S05]` unexported and `[S02]` had no reach to it. Exporting it — read at call
time, the way `needsAt` reads `App.data.XF_WHO` — was chosen over writing a
fourth `['cats','mechs']` literal. Freezing came with the export.

**4. No existing row was amended.** See the table above; the plan expected four
rewrites and reading found none needed. New claims went into new rows.

## Known Stubs

None. This plan ships no surface, no node and no string. The three derivations
are called by no shipped region yet — **that is the plan's design, not a stub**:
`[S02]` is where arithmetic lands before the surfaces in 05-14 and 05-15 read it
rather than invent it. All three are driven exhaustively by rows that run in CI,
so none of them is unexercised.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND, contains `spokenFor`, `needsAt`, `defaultAt`
- `tests/selftest-node.cjs` — FOUND, `SUITE_FLOOR = 1186`
- `.planning/phases/05-fight-loop-playtest/05-13-SUMMARY.md` — FOUND
- commit `2f3a212` — FOUND
- commit `b73d09e` — FOUND
- commit `159e74c` — FOUND
- `node tests/selftest-node.cjs` exits 0: 1216 passed, 0 failed; 163 of 163
  interaction checks; `git status --short` empty after every probe revert
