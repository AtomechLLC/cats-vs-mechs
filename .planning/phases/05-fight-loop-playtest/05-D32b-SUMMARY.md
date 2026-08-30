---
phase: 05-fight-loop-playtest
plan: D32b
subsystem: render+style+gate
tags: [d-32, redirect, part-2-of-2, density, s06-5, s06-12, c12, symbolic-reading, ae-term-read, browser-checks, ux-02]

requires:
  - phase: 05-fight-loop-playtest
    plan: D32a
    provides: "the 4/4/4 caps, the twelve static rows and deferred-items 10 — the density half this plan owns"
  - phase: 05-fight-loop-playtest
    plan: D29
    provides: "[S06.12]'s symQty/symMark/symBox, data-tsay and the harvest that reads a tooltip with the student's fragment removed"
  - phase: 05-fight-loop-playtest
    plan: D30
    provides: "SYM_TAKEN, symMinusOnto and [C14.5]'s .sym-sign geometry, reused unchanged on a third surface"
  - phase: 03.1-action-authoring-inserted
    plan: "06"
    provides: "fillSlotRows, showAmount's focused-field rule and the term rows this plan redrew without moving one id"
  - phase: 03.1-action-authoring-inserted
    plan: "05"
    provides: "editorSig, the focus-preserving repaint and [C12] itself"
provides:
  - "[S06.5] termReading — the editor's term drawn in the fight's own notation, through symQty"
  - ".ae-term-read on all twelve rows, replacing .ae-term-lbl's eight printings of two words"
  - "[C12] .ae-term-list / .ae-term-head, one gap split into two, .ae max-width 660 -> 1040"
  - ".ae-pill--on .ae-check and .ae-side--on .ae-check — two rules the file promised at three sites and never wrote"
  - "gate rows 111 and 112; interaction gate 194 -> 196"
  - "browser cells 23, 23b, 23c and 23d; 206 -> 222"
  - "deferred-items 10 CLOSED with measurements; item 11 added"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "two surfaces compared to EACH OTHER rather than each to a typed string, so neither can be changed alone"
    - "a repeated word replaced by the thing it named, drawn in the notation the next surface will draw it in"
    - "one gap split into two the moment the markup could tell the two distances apart"
    - "a source-side row read over text with the comments STRIPPED, because this file's convention is to quote the rule a change reverses"
    - "a probe whose finding is that the whole node gate stays green: the density is a browser's claim and only a browser cell holds it"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D32b-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/deferred-items.md

key-decisions:
  - "THE READING IS SYMBOLIC AND THE CHOOSER PILLS KEEP THEIR WORDS, AND THAT LINE IS THE WHOLE OF HOW THIS PLAN OBEYS BOTH INSTRUCTIONS IT WAS GIVEN. The redirect asks for the symbolic language with prose on hover; UX-02 is restated at nine sites in this file as 'never an icon, never revealed on hover, never a title= tooltip', and D-29 bought its own tooltips by proving every one of them describes a reading that is permanently on screen and belongs to no CONTROL. A chooser pill IS a control and its label is a token type's name, so a pill drawn as a bare symbol would be that rule broken rather than answered — and it would have been broken for 104 pills at once. So the density was bought somewhere else and the notation went where it is admissible: .ae-term-read is not a control, it draws the term itself, and its tooltip is D-29's case one surface further on. The measured cost of that choice is the whole reason .ae went from 660 to 1040 — with the names kept, the chooser strip is 613px wide and it cannot share a line with a reading, a party chooser and an amount inside 610."
  - "THE WIDTH WAS SPENT ON HEIGHT, WHICH IS WHY .ae-list AND .ae-name WERE CAPPED IN THE SAME CHANGE. A wider box is only a density win if the thing that gets wider is the thing that was stacking; a name field and a list of action names stretched to 992px are a worse surface than they were at 660 and buy nothing. Both are held at the 610 they measured before, so the only region that took the width is the one that had twelve rows four lines deep. [C12]'s '[C07] IS THE LAYOUT ANALOG' paragraph is ANSWERED IN PLACE rather than deleted: its claim is that the picker and the editor are the same object, and D-32 is what stopped that being true — the picker edits one token type, and the editor now edits twelve terms each carrying a chooser over the whole vocabulary, which is the picker's entire subject appearing eight times inside one row."
  - "THE REMOVAL MARK GOES ON A COST AND ON A CHANGE DOWNWARD AND ON NOTHING ELSE, AND THE PARAGRAPH THAT SAID THERE WERE ONLY TWO SUCH SURFACES IS QUOTED VERBATIM BESIDE IT. [S06.12] enumerates 'a cost, a hit taken and a pool drawn down' as the three subtractions this file draws, and every clause of that was written about the FIGHT surface and stays true there. What is new is that the editor draws a rule's DECLARED terms, and a declared change of minus three health is a subtraction the student wrote down. A requirement still carries none because nothing is subtracted by a requirement — [S06.7]'s ruling and row 107b's claim — and a change upward carries none because it takes nothing away. Four answers from one question asked per field, at the one place that knows, which is symQty's own argument for why SYM_TAKEN lives in symQty."
  - "ROW 111 COMPARES THE TWO SURFACES TO EACH OTHER AND NOT EACH TO A TYPED STRING, AND THE DIFFERENCE IS WHAT CAN BE CHANGED ALONE. A row asserting 'the editor says Removes: 2 Action points' and, separately, 'the picker says Removes: 2 Action points' is two copies of a sentence that a single edit moves together. What cannot be edited past is equality: termReading and fgCostParts both call symQty, and the moment one passes a different prefix, suffix or removal flag the row reddens with nobody having decided in advance what the sentence ought to be. PROBE CC dropped the prefix from the editor alone and reddened 111 and nothing else, over a suite of 1253 and a gate of 195 of 196."
  - "THE TICK WAS BUILT, PAID FOR IN WIDTH, AND NEVER SHOWN — ON EVERY CHOOSER PILL AND ON BOTH SIDE BUTTONS. [C12]'s banner, [S06.5]'s choicePill and [C07]'s .pk-sw--on .pk-check all say the live one is an outline AND a tick; only .ae-item--on .ae-check was ever written. A visibility:hidden node still contributes its text to every harvest this repository runs, which is exactly why no row noticed: the proposal-pane scan even counts '24 chooser ticks' by name. Only a browser can tell built from shown, and cell 23c is now the thing that does. Fixed rather than noted, because a rule written at three sites and implemented at one is the shape of thing the next reader assumes was deliberate."
  - "THE DENSITY IS A BROWSER'S CLAIM AND PROBE CF IS THE PROOF THAT NOTHING ELSE HOLDS IT. Reverting .ae to 660px puts the terms region back to 2131px and every row back to 177px — and the node gate runs 1253 passed, 0 failed, 196 of 196, exit 0. Four browser cells caught it, one per browser and viewport. That is the same shape as D-30's PROBE BM finding about the colour literal, arriving on a layout claim, and it is why cell 23 asserts a REGIME (one line per row, 48px) rather than a pixel: a budget set at the measurement reddens on a font."

requirements-completed: []

duration: 200min
completed: 2026-08-30
---

# Phase 05 D-32 part 2: The Dense Terms Region Summary

**The action editor's terms region measures 707px where it measured 2507, and every
one of its twelve rows is one line of 41px where they were three lines of 169 and
181 — measured in real Chrome and real Edge at 1920x1080 and 1366x768, headless, on
the same drive that took the before numbers. The word "Spends", printed four times
under a legend that already said Cost, is gone and the TERM is drawn in its place in
the fight's own notation: the type's shape, the amount by repetition, D-30's red mark
when something is taken away, and the prose on hover. The editor's sentence and the
picker's sentence are now asserted EQUAL TO EACH OTHER rather than each to a typed
string. And the pass found a defect the file has carried since plan 03.1-05: the tick
that [C12], [S06.5] and [C07] all promise marks the live control was built on every
chooser pill and every side button, paid for in row width, and never shown.**

## The gate, before and after

| | before (post-05-D32a) | after |
|---|---|---|
| suite | 1253 passed, 0 failed | **1253 passed, 0 failed** — this plan adds no `[S09.*]` row |
| interaction gate | 194 of 194 | **196 of 196** (+2: 111, 112) |
| stub-drift | 135 shell ids | **135 — unchanged. No id moved, and that is the point** |
| `#app` (setup) | 128, floor 117 | **128 — unchanged.** No board surface touched |
| `#app` (fight) | 592, `FIGHT_FLOOR` 132 | **592, `FIGHT_FLOOR` 132 — neither moved** |
| `#app` (fight, sidebar open) | 592 | **592** |
| dialogs | 166 across 4 roots, floor 138 | **172** (+6), floor **138 — not moved** |
| proposal pane | 62, floor 23 | **62** |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 8586 literals, 0 hits | **8595 literals**, 0 hits |
| perf | 100 commits in 7 ms (budget 50) | 100 commits in **7 ms** |
| **browser checks** | 206 passed, 0 failed | **222 passed, 0 failed** (+16: cells 23–23d × 4 columns) |

`node tests/selftest-node.cjs` exits 0.
`PLAYWRIGHT_DIR=... node tests/browser-checks.mjs` prints **222 passed, 0 failed**,
exit 0, headless in both browsers.

`counter|balanc|rating` prints **0**, whole document. `url(` **0**. `innerHTML` **0**.
`createElementNS|<svg` **0**. One classic `<script>`, one `<style>`. **Not one new hex
literal** in the whole diff. `git diff 5932d95..HEAD` over `cats-vs-mechs.html` touches
no `DEFAULTS.`, no `MAX_ACTION_*` and no `WIRE_BOUNDS` line — the ops, the caps, the
codec and the defaults are part 1's and this plan did not go near them.

**The dialog floor did not move and that is a decision.** 166 → 172 is the six strings
three readings add to the shipped board's editor (Slash carries one cost, one
requirement and one change; each reading writes `title` and `aria-label`). The floor is
a tripwire for a surface going DARK, not a ratchet on a growing one — which is the
reading plan 05-D32a took when the same count went 145 → 166 and left it at 138.

## The measurement, which is the whole plan

Real Chrome and real Edge, 1920x1080 and 1366x768, headless. A board with seven token
types — the five shipped plus a unit-scope and a side-scope type a student invented —
and one action at the cap on all three lists. All four columns agree exactly.

| reading | before | after |
|---|---|---|
| `#act-edit-terms` | **2507px** | **707px** |
| a cost or requirement row | 169px | **41px** |
| a transformation row | 181px | **41px** |
| the row's chooser strip | 82px (two lines) | **38px (one)** |
| `#act-edit-pane-author` | 3243px | **1421px** |
| the "None" pill | 77px | **54px** |
| pills on screen at once | 104 | 104 |

**Why the row was 169px, measured rather than reasoned about.** `.ae-term-toks` was
821px wide inside 610px of content, so the strip claimed the whole line — and the label
above it and the amount below it each took a line of their own. One row, three lines.
Twelve times, plus three legends and three notes stacked in a flat 14px run.

**Where the 1800px went, in the order it was taken:**

| change | what it bought |
|---|---|
| the chooser strip fits one line | the row stops being three lines |
| the tick out of flow | ~20px per pill, ×8 per strip, which is what makes the line fit |
| `.ae-term-lbl` → `.ae-term-read` | the label's line, and eight printings of two words |
| one gap became two (16 between lists, 6 inside) | 8px × 9 |
| legend and note on one line | a line × 3 |
| `.ae-amt` padding 8 → 6 | 4px × 12 |

## What the terms region says now

```
Cost   Spent when the action is used.
  ▲̶       [None] [Health] [Action points] [Shield] [Damage] [Dead marker] [Zeal] [Momentum]  [ 1 ]
  ●●̶      ...                                                                                [ 2 ]

Needs  Must be there for the action to be used. It is not spent.
  ▪       [None] [Health] ...                                                                 [ 1 ]

Changes  What the action changes, and by how much. Put a minus in front for a change downward.
  ●●●̶     [Caster] [Target]   [None] [Health] ...                                             [-3 ]
```

The reading at the left of each row is `symQty` — the same function, called with the
same arguments, that the fight picker calls for the same cost. Hovering it says
**"Removes: 1 Action points"** in the editor and **"Removes: 1 Action points"** on the
action button, and row 111 asserts those two strings are equal to each other rather
than each to a copy.

## The mark, and the four answers

| term | mark? | why |
|---|---|---|
| a cost | **yes** | a cost is a removal — `fgCostParts`' own arm |
| a requirement | **no** | nothing is subtracted by a requirement; `[S06.7]`'s ruling, 107b's claim |
| a change DOWNWARD | **yes** | a declared minus is a subtraction the student wrote down |
| a change UPWARD | **no** | it takes nothing away |

Measured in both browsers at both sizes: the editor's mark sits **0px from the shape's
left edge, 0.25 down a 12×12 shape**, in `color(srgb 1 0.427451 0.470936)` — the same
three numbers cells 21b/21c/21d read on the fight surface in the same run, which are
unmoved. Five marks in a maxed action's terms region; the requirement rows carry none.

`[S06.12]`'s paragraph naming two surfaces for the notation is **answered in place and
quoted verbatim** at `termReading`, not deleted: every clause of it was written about
the fight surface and every clause of it is still true there.

## Every row and cell turned or added

| row / cell | claim |
|---|---|
| **111** NEW | the editor's reading and the PICKER's are equal, as an ordered pair over a cost whose second term names a student's own type; the mark asked for four times; the real harvest run over the row, artifact's words IN and student's word OUT |
| **112** NEW | `.ae-term-lbl` gone from the whole document with comments stripped; twelve readings in the shell AND in the stub; three lists, three heads; the two gaps DIFFER; both tick rules exist |
| **23** NEW | the terms region measured — 707 against a 900 budget, twelve rows, every one ≤48px |
| **23b** NEW | a 4/4/4 action authored through the dense editor by real clicks: twelve pills, four party pills, twelve amounts typed, record read back whole |
| **23c** NEW | the box inside the viewport on all four edges at both sizes; scrolled to its end, Done wholly on screen; the tick visible on the pressed pill and hidden on the others, centred on the pill's right edge |
| **23d** NEW | D-30's geometry on the editor's own mark, and none on a requirement |
| 65, 69, 69d, 69g, 71b, 107–107f | re-read, unchanged, all green |

**No existing row changed its claim.** Check 65 counts rows out of the markup by id and
no id moved; 69g's twelve rows and twelve amounts are the same twelve; 107e counts marks
on `#app` and the editor is a dialog. That is worth one line rather than silence,
because the last four redirects each turned rows in the open and this one had none to
turn — the density pass changed how a row LOOKS and not what any surface claims.

## Deviations from plan

### Auto-fixed issues

**1. [Rule 1 — Bug] the tick was never visible on a chooser pill or on a side button**
- **Found during:** writing the `.ae-pill` rules for the dense row.
- **Issue:** `[C12]`'s banner ("the live row is marked by an outline AND a tick"),
  `[S06.5]`'s `choicePill` ("marked by an outline AND a tick, never by colour alone")
  and `[C07]`'s `.pk-sw--on .pk-check` all state the idiom. Only
  `.ae-item--on .ae-check` was ever written, so `.ae-pill` and `.ae-side` each built a
  tick node, paid for its width in every row of every chooser, and showed it never. The
  live control was said by an outline and `aria-pressed` alone.
- **Why nothing caught it:** a `visibility:hidden` node still contributes its text to
  every harvest in this repository — the proposal-pane scan counts "24 chooser ticks"
  by name. Built and shown are the same thing to a DOM without a layout engine.
- **Fix:** the two missing rules, plus D-30's own idiom on the pill — the mark's centre
  on the pill's right edge, `pointer-events:none`, out of the flow — so a tick that had
  been costing ~20px of row width while invisible now costs none while being seen.
- **Commit:** `cc4e1a6`

**2. [Rule 3 — Blocking] Layer B's extractor was taken from 8,586 literals to 1,878 by
a comment**
- **Found during:** the first run after the `termReading` banner was written.
- **Issue:** an apostrophe and a backtick on ONE line of a comment inside the script
  block. Layer B's single-quote arm runs first and swallowed the opening backtick,
  leaving the closing one to open a span that crosses lines to the next backtick in the
  file — 46,510 characters of it.
- **Fix:** the phrase spelled out in words, and the trap recorded at the site that
  tripped it so the next author pays for it once rather than again.
- **Not a silent failure, which is the part worth keeping:** the extractor's own floor
  named it in one line. That floor exists precisely because "the failure mode of a
  broken extractor is not a red run — it is a green one that scanned nothing."
- **Commit:** `a838b5b`

### Findings recorded at the row rather than worked around

- **Row 112's first draft reddened on the file's own honesty convention.** It scanned
  raw text for `ae-term-lbl` and found it — in `[C12]`, where this plan quotes the rule
  it replaced verbatim, which is what D-32 part 1 did with the cost chooser's emptying
  entry and what the whole file does. It also read `gap:14px` off the quoted OLD
  `.ae-terms` declaration ahead of the live one. Comments are stripped first now, in
  both spellings, and the reason is written into the row.
- **The stub-drift gate cannot see a class.** PROBE CD put `.ae-term-lbl` back in the
  stub and removed the reading: 135 shell ids, all built, gate green on that line, and
  every editor drive in the file quietly drawing nothing. Rows 111 and 112 caught it.
  Row 112's own paragraph now says so.

## Probes — seven, each against the committed snapshot

| probe | the regression | what caught it |
|---|---|---|
| **CB** | `termReading` marks every reading, not just the removals | **row 111 alone.** Suite 1253/0, gate 195 of 196 |
| **CC** | the editor drops the picker's prefix — the two sentences diverge | **row 111 alone**, 195 of 196. Exactly the claim the row's paragraph makes |
| **CD** | the stub keeps the label span and grows no reading | rows 111 and 112. **The id stub-drift gate stayed green at 135**, which is why row 112 exists |
| **CE** | one number for two distances again (both gaps 16) | **row 112 alone** |
| **CG** | `.ae-pill--on .ae-check` deleted — the tick goes back to never showing | **row 112 alone** |
| **CH** | `showAmount` writes a focused amount field | **row 69d alone** — the focus-preserving repaint still binds through the dense rows, driven rather than assumed |
| **CI** | `editorSig` forgets the token NAMES | rows 69 and 71b — the signature widening still binds |
| **CF** | `.ae` back to 660px — the density undone | **THE WHOLE NODE GATE STAYED GREEN**: 1253 passed, 0 failed, **196 of 196**, exit 0, over a terms region that had gone back to 2131px and rows to 177px. Four browser cells caught it, one per browser and viewport |

Every probe was applied AFTER the commit it tests and reverted from a snapshot; the
working tree was verified clean against `git status` afterwards, and both gates re-run
green.

## What is NOT in this plan, on purpose

- **The ops, the caps, the codec and `DEFAULTS`** — part 1 owns all four and the diff
  touches none of them.
- **The fight surface.** `FIGHT_FLOOR` did not move, `#app` harvests 592 open and
  closed, and cells 21b/21c/21d read the same 126 marks at the same geometry.
- **The chooser pills' words.** They are controls, and UX-02's "nothing conveyed by
  hover alone" is answered rather than waived — see the key decisions.
- **The rest of the dialog's height.** 714 of the remaining 1421px are the title, the
  notes, the side chooser, the action list, the name field and the buttons — surfaces
  plan 03.1-05 sized, and none of them something D-32 asked about.
  `deferred-items.md` item 11 carries it with its owner named.

## Threat Flags

None. No network surface, no auth path, no file access, no schema change and no new
keyed structure. The one new rendering path calls `symQty`, which reaches `styleFor`
and `makeToken` — both of which map an id through `safeShape` / `safeColor` before it
reaches a className, which is T-02-01's shipped mitigation and is unchanged here.

## Self-Check: PASSED

Every file this summary claims exists, exists; every commit hash it names is in
`git log`. Re-verified after writing: `node tests/selftest-node.cjs` prints
**1253 passed, 0 failed** and **196 of 196** interaction rows at exit 0, and
`tests/browser-checks.mjs` prints **222 passed, 0 failed** headless in real Chrome and
real Edge at both viewports.
