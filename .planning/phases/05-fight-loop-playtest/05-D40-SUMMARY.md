---
phase: 05-fight-loop-playtest
plan: D40
subsystem: model+render+style+gate+browser
tags: [d-40, redirect, s02, s06-5, s06-12, c12, cost-pool-preview, editorsig, one-sentence-two-surfaces, probe-eb, probe-ec, probe-ed, probe-ee, probe-ef, probe-eg]

requires:
  - phase: 05-fight-loop-playtest
    plan: D32a
    provides: "affordability.pays, isPoolToken and the ruling that a pool is action points or a side-scope type and nothing else — the derivation this preview is a projection over, and the exclusion that decides which rows it draws"
  - phase: 05-fight-loop-playtest
    plan: D32b
    provides: "termReading, .ae-term-read and the editor speaking the fight's notation — the language this reading is written in, and row 111's compare-two-surfaces technique"
  - phase: 05-fight-loop-playtest
    plan: D30
    provides: "SYM_TAKEN, symMinusOnto and [C14.5]'s .sym-sign geometry, on a fourth surface unchanged"
  - phase: 05-fight-loop-playtest
    plan: D34
    provides: "editorStale and the incomplete-paint rule — the restore this preview has to come back from"
  - phase: 05-fight-loop-playtest
    plan: D39b
    provides: "fgPoolReading and the one-source-function shape — taken for the SENTENCE and consciously declined for the slice, with the reason recorded"
provides:
  - "[S02] costPools(report) — the pools a cost names, one row each, summed by token in first-appearance order"
  - "[S06.5] costShortSaid — the affordability sentence, lifted out of fillReport so two panes share one function"
  - "[S06.5] fillCostPools and #act-edit-cost-pool — the live per-pool depletion reading in the Cost region"
  - "[C12] .ae-pool as a two-column grid so every pool row's sentence starts at one x"
  - "editorSig covering the side's own tally bag and each token type's scope"
  - "[S09.11] five costPools rows; interaction gate rows 123 and 123b; browser cells 30, 30b, 30c"
affects: ["05-11", "any later pass that touches the editor's Cost region or editorSig"]

tech-stack:
  added: []
  patterns:
    - "a projection over a report rather than a second walk of the slice, so a reading cannot see an input its derivation did not"
    - "one function that writes a sentence, two surfaces that call it, and a row that compares them to EACH OTHER"
    - "a fingerprint slot added for an input that was ALREADY being drawn and already un-fingerprinted, with the pre-existing wrongness named"
    - "display:contents on a grouping wrapper so two rows' answers share a column without losing the pairing a screen reader walks"
    - "a defect found in a screenshot after every number in the repository had gone green over it"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D40-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/stub-dom.cjs
    - tests/browser-checks.mjs
    - .planning/STATE.md

decisions:
  - "The preview does NOT share fgPoolReading, and declining it was the whole first decision. That function is D-39 P1-2's one-pool-truth and reaching for it here would have looked like the obedient move — but it reads state.fight[side].ap against spokenForPools over THIS ROUND'S DECLARATIONS, and none of those three things exists on an authoring surface. The editor is open in the build view before any fight starts; the pool being authored is the BUILD pool; and an action being written down has not been declared. Sharing it would have made the preview either refuse to draw exactly when authoring happens or answer a question nobody asked. What IS shared is the SENTENCE — costShortSaid — which is D-39 P1-2's actual lesson: that pass reconciled three readings by making them share a function that writes WORDS, not by making them share a slice, because two arithmetics over one slice is how the first two came apart."
  - "PER POOL AND NOT PER TERM. `pays` is one row per cost TERM because a cost is an ordered list a student wrote and two terms in two token types cannot be added up. A DEPLETION is a different question: a pool has one number and is drawn down once, so an action costing two action points and then two more takes FOUR out of one pool, and a preview drawing two rows for that shows a student two pools they do not have. costPools sums by token in first-appearance order, so the rows sit in the order the student's own terms first named them."
  - "A TERM NAMING A NON-POOL DRAWS NOTHING, and the exclusion is the reading's honesty rather than an omission. isPoolToken already ruled that health, shield and a unit-scope type are not pools and cannot be, because spending them means choosing which unit pays. A depletion preview for one of them would be this surface inventing an economy the applier does not run — the exact sentence [S06.7] kept in view when tallies did not deplete — and the student is not left in the dark: the proposal pane's cost line says 'This report has no figure for that pool' for the same term, in the same dialog, off the same report."
  - "editorSig gained TWO slots and BOTH were already missing. The side's own tally bag is read by presentOnCaster and has been printed by the proposal pane since plan 03.1-07 as the 'of 5' in 'costs 3 Momentum of 5' — so a student nudging a side tally from the board tab with the editor open was already reading a figure the board had stopped holding. The units' bags were fingerprinted; the side's was not, one slot along, which is the near-miss this file keeps finding. Each type's scope decides whether a cost term names a pool AT ALL, which flips both this preview and the proposal pane's choice of sentence. The preview did not create either defect; it made the first one visible."
  - "The scope slot is defensive and is SAID to be. No op in this file moves a type's scope — createTokenType writes it once and nothing writes it again — so on any authored board a scope that differs comes with an id that differs and the slot beside it has already moved. What it covers is a vocabulary arriving WHOLE from a decoded build code carrying the same id and the same name at the other scope. Row 123b drives exactly that: two states differing in nothing else, restored one after the other. PROBE ED removed the slot and measured the preview reading 1 row and then 1 row where it should read 1 and 0."
  - "THE ALIGNMENT FIX IS A SCREENSHOT'S FINDING AND NOTHING ELSE COULD HAVE MADE IT. The first draft of [C12]'s block was a flex column of flex rows and it measured green on every number this repository takes: 66px tall, rows of 29 and 22, no overflow, four browser columns agreeing exactly, node gate 222 of 222. The PICTURE showed the two pool rows' sentences beginning at 232px and 252px, because each row's sentence started wherever its own run of tokens happened to end. That is D-39 P2-8's 'all four rows end in one column' and D-39 P2-14's 'three left edges on one bar', arriving a third time. .ae-pool is a two-column grid now with .ae-pool-row at display:contents, so the pairing a screen reader walks survives and no measurement may read that wrapper's rectangle — which is why cell 30 reads the reading and the sentence instead."
  - "PROBE EF IS THE RECORDED LIMIT OF THE SHARED-SENTENCE CLAIM. Re-typing the sentence at fillCostPools BYTE-IDENTICALLY instead of calling costShortSaid ran 1341 passed, 0 failed, 222 of 222, exit 0. What row 123 enforces is DRIFT and not DUPLICATION: PROBE EF2 moved the shared function's wording by two words and reddened row 123 AND the pre-existing row 71c, which is the proof that one function feeds both panes. That is exactly row 111's limit, said out loud rather than left for the next reader to discover."

metrics:
  duration: ~4h
  completed: 2026-09-02
  tasks: 2
  commits: 3
---

# Phase 5 Plan D40: D-40 — Preview the Pool While Setting Up an Action Summary

**One-liner:** The action editor's Cost region now says, live and per pool, what the cost
being written takes out of the side that would pay it — three readings in D-29's notation
with D-30's red mark on the taken one, the affordability machinery's own words when a cost
outruns its pool, and a fingerprint that finally covers the two inputs it was drawing and
had never been watching.

---

## 1. The headline

| runner | before | after |
|---|---|---|
| `tests/selftest-node.cjs` | 1336 passed, 0 failed, exit 0 | **1341 / 0**, exit 0 |
| interaction gate | 220 of 220 | **222 of 222** (+ 123, 123b) |
| stub-drift | 163 shell ids | **164** (+ `#act-edit-cost-pool`) |
| `tests/selftest-dom.cjs` | 1460 passed, 0 failed | **1465 / 0** |
| `tests/browser-checks.mjs` | 362 passed, 0 failed | **374 / 0** headless (+ 30, 30b, 30c × four columns) |
| live `#selftest`, real browser | 1460 / 0 | **1465 / 0**, chrome and msedge, **0 page and console errors** |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 10,684 literals, 0 hits | **10,751 literals**, 0 hits |
| Layer C, four dialog roots | 179 (floor 138) | **188 (floor 138 — NOT moved)** |
| Layer C, `#app` setup / fight / sidebar / popup | 220 / 725 / 725 / 749 | **identical** |
| `#act-edit-propose` | 62 (floor 23) | **62** |
| perf | 100 commits in 7 ms (budget 50) | **unchanged** |

**`DIALOG_FLOOR` did not move and that is the decision, not an oversight.** 179 → 188 is
the nine strings one pool row adds to the shipped board's editor (three readings × `title`
and `aria-label`, the arrow, and the sentence). The floor is a tripwire for a surface going
DARK, never a ratchet on a growing one — which is the reading plan 05-D32b took at 145 → 166
and plan 05-D39b took again, and there is no reason for this pass to be the one that changes
it. **`FIGHT_FLOOR`, `PICKER_FLOOR`, `PROPOSE_FLOOR`, `HOWTO_FLOOR` and `SUITE_FLOOR` are
untouched**: no board surface, no fight surface and no other dialog was modified.

**The ops, the codec and the defaults were not gone near.** `git diff` over
`cats-vs-mechs.html` for this plan touches no `DEFAULTS.`, no `MAX_ACTION_*`, no
`WIRE_BOUNDS` and adds no `App.ops.` call. No new hex literal. One classic `<script>`, one
`<style>`. `innerHTML` 0, `url(` 0, forbidden-pattern scan clean.

---

## 2. What the surface says

Measured in real Chrome and real Edge at 1920×1080 and 1366×768, headless. **All four
columns agree exactly.** The board: Cats at three action points, a side-scope type the
student invented called Momentum with five of it on the side, and an action authored
through the real pills and the real fields carrying **two action points, three Momentum,
two more action points and one Health**.

```
▲▲▲   ⁻▲▲▲▲  →  0×▲     Not enough to spend. Short by 1.
●●●●● ⁻●●●   →  ●●       Enough to spend.
```

| reading | value |
|---|---|
| rows as the four terms land | **1 → 0 → 1 → 2 → 2 → 2** |
| `#act-edit-cost-pool` height | **66px** |
| reading / sentence heights | 29 and 18px / 22 and 22px |
| the reading column's left edge | **one x** (467 at 1920, 190 at 1366) |
| the sentence column's left edge | **one x** (713 at 1920, 436 at 1366) — *was 232 and 252 in the flex draft* |
| horizontal overflow of the box | **false**, both viewports |
| `--tok` on every reading | **16px**, matching `.ae-term-read` |
| marks per row | **0,1,0** — the taken figure and neither of its neighbours |
| the mark's geometry | **0px from the shape's left edge, 0.25 down it** — D-30 exactly, the same three numbers cells 21b and 23d read on two other surfaces |
| `#act-edit-terms` | **822px** (was 707 under D-32b) |

The tooltips, read off the live page:

- `3 Action points this side holds`
- `Removes: 4 Action points when this action is used`
- `0 Action points left to spend`

Every one of them **equals its own `aria-label`**, which is `symQty`'s contract arriving at
a fifth surface, and the middle one carries `SYM_TAKEN` because `symQty` prefixes it at the
one place that knows a thing is being taken away.

**The three suffixes are borrowed rather than invented.** `' when this action is used'`
echoes the Cost legend's own tooltip four lines above it ("Spent when the action is used")
so the heading says what a cost IS and the reading says what THIS one does in the same
words. `' left to spend'` is `fgPoolWords`' own sentence ending, so the phrase a student
learns on the fight tab is the phrase that meets them here.

---

## 3. The four functions, and the one that was declined

**`App.model.costPools(report)`** — `[S02]`. A **projection over an affordability report**
and not a second walk of the slice. `pooledAt` one region down is the argument: a reading
built from its own walk of the same slice is a second arithmetic, and D-33 P1-1 and D-39
P1-2 are two passes' worth of evidence about what two arithmetics over one slice do to two
sentences. Taking the REPORT means there is no input this reading can see that
`affordability` did not.

**`costShortSaid(need, have)`** — `[S06.5]`, lifted out of `fillReport` in the same change.
The one place in the file that turns a need and a have into words about whether a pool
covers a cost. Both the preview and the proposal pane's cost line call it.

**`fillCostPools(state, side, live)`** — `[S06.5]`. Three `symQty` readings and a sentence
per pool. The remainder **floors at none** rather than drawing a negative one, because a
board cannot hold less than none of a thing and `advanceRound` already takes
`Math.min(want, held)`; how far past the end a cost reaches is the sentence's job and not
the picture's.

**`fgPoolReading` — NOT SHARED, and that is the decision this plan opened with.** It reads
`state.fight[side].ap` against `spokenForPools` over this round's DECLARATIONS. Three
things an authoring surface does not have: the editor is open in the build view before any
fight exists, the pool being reasoned about is the BUILD pool, and an action being written
down has not been declared. Sharing it would have made the preview either refuse to draw
exactly when authoring happens or answer a question nobody asked. **What is shared is the
SENTENCE, which is D-39 P1-2's actual lesson** — that pass reconciled three readings by
making them share a function that writes WORDS, not by making them share a slice.

---

## 4. `editorSig` — two slots, both already missing

The preview draws figures out of the side's pools and decides which pools exist from each
type's scope. Neither was in the fingerprint. **Neither was new to this surface**, and
saying so is the point rather than an excuse.

| slot | reached by | already wrong? |
|---|---|---|
| `state.build[each].tally` | `setTally` and `nudgeTally`, from the board tab, with the editor open | **Yes.** `presentOnCaster` reads `faction.tally`, and the proposal pane has printed it since plan 03.1-07 as the "of 5" in "costs 3 Momentum of 5" |
| each type's `scope` | nothing — no op moves it; a **decoded build code** is the path | **Yes**, for the same pane: `c.pool` is `isPoolToken` over the scope and it picks which of two sentences a cost term gets |

The units' bags were fingerprinted — `u.tally`, **one slot along**. That is the shape of
near-miss this file keeps finding: the half of a pair that the code of the day happened to
read got fingerprinted and the other half did not.

**Rule 1 auto-fix, recorded as such.** Widening the signature is D-40's requirement; the
staleness it closes is older than D-40 and belonged to `fillReport`.

---

## 5. Every row and cell turned in the open

| row / cell | was | now |
|---|---|---|
| interaction gate | 220 of 220 | **222** (+123, +123b) |
| stub-drift | 163 shell ids | **164**, with the `KNOWN_IDS` entry and the stub node in the same change |
| `[S09.11]` projection suite | — | **five new rows** on `costPools`, taken over the same four-term report the `affordability` rows above them already read |
| browser cell **23d** | `#act-edit-terms .sym-sign` counted **5** | **`.ae-term-read .sym-sign` counted 5, and `#act-edit-cost-pool .sym-sign` counted 2 SEPARATELY** |
| browser cell **23**, terms region | 707px, budget 900 | **822px**, budget 900 — recorded rather than raised |
| browser cell **30**, first draft's claim | "a brand-new action names no pool and the box is NOT DRAWN" | **corrected by its own measurement** |

**Cell 23d is the one that matters.** It counted every mark in `#act-edit-terms` and
expected five — which was the same set as "every mark on a TERM READING" only for as long
as the term readings were the only readings in the region. D-40 puts a pool preview inside
the Cost list and its taken figure wears the same mark for the same reason, so the region
count went 5 → 7. **The two are counted apart now rather than the number being raised**: a
preview mark appearing among the term readings would be invisible to a single total, which
is exactly the kind of merge that lets one surface cover another's regression.

**Cell 30's first claim was wrong and the measurement corrected it.** A brand-new action
does not name no pool: a record with **no `cost` field costs the one action point the board
always implied**, which is `actionCostTerms`' shipped default. So the preview says so from
the first frame, and the not-drawn state is reached the way a student reaches it — by
**emptying** the cost through the chooser's own entry. That is the better arm anyway: an
emptied `pays` means "this report has no figures for that cost" and never "this costs
nothing", so drawing nothing is the honest rendering and a row of zeroes would be the
surface answering a question it was not asked.

---

## 6. The probes

Every one ran against the **committed** artifact, with the break applied by script and the
file **restored from a scratchpad copy** — never `git checkout --`, never `git stash`.
Every one is reported as a row going **FAIL**, never a throw and never a hang.

| probe | the break | result |
|---|---|---|
| **EB** | `costPools` stops summing — one row per term instead of per pool | **1337 passed, 4 failed; gate 220 of 222.** Four `[S09.11]` rows and BOTH gate rows |
| **EC** | `state.build[each].tally` removed from `editorSig` | **1341 / 0; gate 221 of 222.** Row 123b **alone** |
| **ED** | each type's `scope` removed from `editorSig` | **1341 / 0; gate 221 of 222.** Row 123b alone — and the reading it printed is the finding: the preview measured **1 pool row and then 1 pool row** where it must read 1 and 0 |
| **EE** | the taken reading loses D-30's mark (`minus: false`) | **1341 / 0; gate 220 of 222.** Rows 123 and 123b |
| **EF** | the sentence re-typed at `fillCostPools`, **byte-identically**, instead of calling `costShortSaid` | **EVERYTHING GREEN — 1341 / 0, 222 of 222, exit 0.** The recorded limit |
| **EF2** | the shared function's wording moved by two words | **gate 220 of 222.** Row 123 **and the pre-existing row 71c** — the proof one function feeds both panes |
| **EG** | `.ae-pool` reverted to the flex column that shipped in the first draft | **node 1341 / 0, gate 222 of 222, DOM 1465 / 0 — all green.** Browser result in §7 |

**PROBE EF is the honest one and it is written down rather than buried.** What row 123
enforces is **drift, not duplication**: a byte-identical copy of the sentence passes
everything, and only a change to either wording is caught. That is precisely row 111's
limit — the same technique has the same hole at both sites — and the mitigation is the
same: the row compares two SURFACES, so nobody has to decide in advance what the sentence
ought to say, and the day either surface's wording moves, the other has to move with it.

---

## 7. PROBE EG — the alignment is a browser's claim and nothing else holds it

The one fix in this plan that came out of a **picture** rather than a number gets the probe
that proves nothing else could have found it. Reverting `[C12]`'s `.ae-pool` to the flex
column of flex rows that the first draft shipped:

- `node tests/selftest-node.cjs` — **1341 passed, 0 failed, 222 of 222, exit 0**
- `node tests/selftest-dom.cjs` — **1465 passed, 0 failed**
- `node tests/browser-checks.mjs` — **370 passed, 4 FAILED.** Cell 30, in **all four
  columns**, and the reading it printed is the defect coming back verbatim: sentences at
  **701 and 713** at 1920×1080 and at **424 and 436** at 1366×768, with the readings still
  correctly at one x because the ragged edge was never in the pictures — it was in where
  each picture happened to end.

That is the same shape as D-32b's PROBE CF and D-30's PROBE BM: a layout claim is a
browser's claim, the node tiers are structurally blind to it, and a cell that asserts a
REGIME — every row's answer starts at one x — is the only thing standing between this
surface and the ragged edge the screenshot showed.

---

## 8. What this does not do

- **It disables nothing.** The never-disable rule is in full force on authoring surfaces: a
  student may write an action that costs more than the side has, and the tool reports it and
  goes on letting them author. Row 123 collects every switched-off control in the dialog BY
  NAME at rest and again with the cost past the pool and compares the two — a count taken
  only afterwards proves nothing, because Remove and New carry bounds of their own.
- **It rules on nothing.** The sentence is the affordability machinery's, unchanged: "Enough
  to spend." or "Not enough to spend. Short by N." Layer A and Layer B are clean, and no
  word in the reading appears in either list.
- **It does not price a non-pool.** A cost naming health, shield or a unit-scope type draws
  no row here and is reported in full by the proposal pane, in the same dialog, off the same
  report.
- **It says nothing about legibility from the back of a room.** Cells 30, 30b and 30c
  measure rectangles at 1366×768; whether a room reads a three-part token picture as one
  depletion at a projector's throw is a rehearsal item and stays one.

---

## Deviations from plan

### Auto-fixed issues

**1. [Rule 1 — Bug] `editorSig` was blind to the side's own tally bag**
- **Found during:** widening the fingerprint for the preview's inputs.
- **Issue:** `presentOnCaster` reads `faction.tally` for a side-scope type, and the proposal
  pane has printed that figure since plan 03.1-07. The fingerprint carried every UNIT's bag
  and not the SIDE's, so a student nudging a side tally from the board tab with the editor
  open read a number the board had stopped holding until some unrelated commit moved the
  signature.
- **Fix:** the side's bag rides beside its pool in the fifth slot. Driven by gate row 123b
  with the op raised from outside and nothing else moving; PROBE EC reddens that row alone.
- **Files modified:** `cats-vs-mechs.html`
- **Commit:** `ea305d8`

**2. [Rule 1 — Bug] `editorSig` was blind to a token type's scope**
- **Found during:** the same widening.
- **Issue:** `isPoolToken` reads the scope and decides which of `fillReport`'s two sentences
  a cost term gets. A vocabulary arriving whole from a decoded build code can carry the same
  id and the same name at the other scope, and the signature would not move.
- **Fix:** the scope rides beside the name in the vocabulary slot. Driven by row 123b as two
  whole states differing in nothing else; PROBE ED measured the stale paint directly.
- **Files modified:** `cats-vs-mechs.html`
- **Commit:** `ea305d8`

**3. [Rule 1 — Bug] the pool rows' sentences did not share a left edge**
- **Found during:** reading back cell 30's own screenshot, after every number in the
  repository had gone green.
- **Issue:** a flex column of flex rows put each row's sentence wherever its own run of
  tokens happened to end — 232px and 252px on the shipped screenshot at 1920.
- **Fix:** `.ae-pool` is a two-column grid and `.ae-pool-row` takes `display:contents`, so
  the pairing a screen reader walks survives and the answers share a column. Cell 30 asserts
  one x for the readings and one for the sentences; PROBE EG is the proof no node tier can
  see it.
- **Files modified:** `cats-vs-mechs.html`, `tests/browser-checks.mjs`
- **Commit:** `ea305d8`, `12e0464`

**4. [Rule 3 — Blocking] browser cell 23d counted marks over a region that grew**
- **Found during:** the first full browser run.
- **Issue:** the cell read `#act-edit-terms .sym-sign` and expected 5. The preview lives in
  that region and its taken figure wears the same mark, so the count went to 7 and a cell
  about the TERM readings reddened on a change it is not about.
- **Fix:** the term readings and the preview are counted separately rather than the total
  being raised, because a preview mark appearing among the term readings would be invisible
  to one number.
- **Files modified:** `tests/browser-checks.mjs`
- **Commit:** `12e0464`

### Claims corrected by measurement

**1. "A brand-new action names no pool."** False. A record with no `cost` field costs the
one action point the board always implied — `actionCostTerms`' shipped default — so the
preview reads from the first frame. Cell 30's drive now reaches the not-drawn state the way
a student does, by emptying the cost.

**2. "The shared-sentence row catches a re-typed sentence."** False, and PROBE EF measured
it: a byte-identical copy passes everything. The row catches DRIFT, which is row 111's
limit at a second site, and it is recorded rather than papered over.

---

## Known Stubs

None. Every figure the preview draws is read from state on the frame it is drawn, and every
row it draws exists because a cost term named a pool.

## Self-Check: PASSED

Files: `cats-vs-mechs.html`, `tests/selftest-node.cjs`, `tests/stub-dom.cjs`,
`tests/browser-checks.mjs`, `.planning/STATE.md` and this summary — all present.
Commits `ea305d8` and `12e0464` both in `git log --all`.
Symbols read back off the shipped artifact: `costPools`, `costShortSaid`, `fillCostPools`,
`#act-edit-cost-pool`, `.ae-pool-row{display:contents}`, `costPools: costPools` on the
model export. Rows read back off the harness: gate 123, gate 123b, browser cells 30, 30b,
30c.

Runners re-run after the last probe was reverted from its scratchpad copy, with the
artifact and both harness files verified **byte-identical to `HEAD`** (`git diff HEAD --`
empty for `cats-vs-mechs.html` and `tests/`):

- `node tests/selftest-node.cjs` — **1341 passed, 0 failed, 222 of 222, 164 shell ids**, exit 0
- `node tests/selftest-dom.cjs` — **1465 passed, 0 failed**
- `node tests/browser-checks.mjs` — **374 passed, 0 failed**, headless, four columns
- live `#selftest`, real Chrome and real Edge from `file://` — **1465 / 0**, **0 page and
  console errors** in both
