---
phase: 05-fight-loop-playtest
plan: D47
subsystem: style+shell+gate+browser
tags: [d-47, redirect, density, spacing-scale, c00, c02, c03, c04, c07, c12, c13, c14, c15, c17, c18, c19, ux-02, reading-floor, scroll-anchoring]

requires:
  - phase: 05-fight-loop-playtest
    plan: D32b
    provides: "the density method (measure, then assert a REGIME in a browser cell) and PROBE CF's lesson: a density pass undone leaves the node gate green"
  - phase: 05-fight-loop-playtest
    plan: D38
    provides: "the rule that explanatory prose leaves the working surfaces for How this works, and #rr-head's precedent: a scanned title on a heading"
  - phase: 05-fight-loop-playtest
    plan: D29
    provides: "LABEL_ATTRS: Layer C harvests title, so a sentence moved into an attribute stays in the no-verdict scan"
  - phase: 05-fight-loop-playtest
    plan: D44
    provides: "the rule that the 16-bit/8-bit picker moves the picture and nothing else (cell 32r), which D-47 ran into and kept"
  - phase: 05-fight-loop-playtest
    plan: D46
    provides: "cell 33m (an Advance lands while a drag is held), which exposed the lane-as-scroll-anchor defect"
provides:
  - "[C00] --sp-1..--sp-5 (4/6/8/12/16), one spacing scale; 95 of 374 spacing declarations on it"
  - "every tab and dialog denser, measured before and after in real Chrome and Edge at 1920x1080 and 1366x768"
  - "the scene's explainer as #scene-head's scanned title and a paragraph on How this works; #scene-hint gone from the shell (174 -> 173 shell ids)"
  - "#ledger{overflow-anchor:none}: the round state is the scroll anchor whenever it is on screen"
  - "browser cell 34 (the reading floor on eleven surfaces, fields included) and 34b (the density as regimes); cell 32 and gate row 130d turned in the open"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "a floor cell that pins every EXISTING exception at its measured size, so it says two things: nothing new goes under the floor, and nothing already under it goes lower"
    - "density asserted as regimes (one line, first screen, no empty panel) plus 'the room comes off the scale' by computed value, because a count of cards on a first screen can be bought by a change somewhere else"
    - "a probe runner lifted VERBATIM from the shipped test file by marker, so a probe tests the cell that ships and not a copy"
    - "an isolation run of the full browser file against the pre-change artifact, to tell a regression from a pre-existing fragility before touching either"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D47-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/stub-dom.cjs
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/deferred-items.md
    - .planning/STATE.md

key-decisions:
  - "DENSITY FROM SPACE, AND THE TYPE WENT UP, NOT DOWN. No font size in the artifact was reduced. Six reading sizes that sat at the body's 17px (the subtitle, How this works' prose, the round rules' reading word, amount field and Remove) went UP to UX-02's 18 on the pass that redrew them, which is what lets cell 34's exception list be an honest inventory rather than a waiver."
  - "THE 18px FLOOR IS UX-02's, STATED AT ~30 SITES IN THE FILE AND ENFORCED BY NOTHING UNTIL NOW. The D-39 audit measured it (`.rr-pill-name` 15 against an 18 floor 'every other surface respects'). Before D-47 the file was under it in two places a student reads (the 17px body copy and a set of dialog readings); cell 34 now walks it, with fields included, because an input's value is not a text node and a leaf walk missed four fields."
  - "ONE SCALE, APPLIED WHERE D-47 REDREW, NOT MECHANICALLY EVERYWHERE. 363 spacing declarations over 30 pixel values and none on a token, measured. D-47 moved every rule it redrew onto --sp-1..5 (95 declarations) and left the rest: several are bleed margins that cancel a padding exactly and must move with it, and a blind rewrite of 279 declarations would have moved geometry on surfaces nobody looked at. Distinct pixel values 30 -> 23. Deferred item 3."
  - "SIDE BY SIDE ONLY WHERE A MEASUREMENT PAID FOR IT. Taken: the picker at the editor's 1040 with Name beside Range; the editor's Side beside its list and New/Remove beside the name; Damage beside Total health; a reference card's effects on its name's line; the fight's side name beside its count, its pool head beside the Reserve line, 'Each round' beside its readings; How this works in columns. TRIED AND DROPPED on the pictures: the board pool's head in a left column (at 1920 it pushed the Reserve slot onto two lines, netting 14px, and at 1366 it pushed the Action points tokens under the stepper). Considered and not tried: two unit cards per row (a card needs ~386px, the column is 620), the scene beside the lane (the lane would show one card)."
  - "THE 16-BIT FIELD HEIGHT WAS TAKEN AND GIVEN BACK. 16-bit draws at 48px at every size, but at 1600x900 and up the field keeps 8-bit's 360px: 60px of empty field. A 16-bit field of 300 made the field's height follow the ART, so the picker moved every sprite and the whole page by 60px and cell 32r reddened. D-44's 'the picker moves the picture and nothing else' outranks 60px. Recorded at [C19] and as deferred item 2: settling it is one big-screen sprite size for both generations, a D-44 decision."
  - "THE LANE IS NEVER THE SCROLL ANCHOR. Cell 33m reddened at both sizes and passed on the pre-D-47 file. Isolated and instrumented: Chrome's scroll anchoring picked the lane's last 10px, visible to the browser and hidden from the student under the opaque sticky bar, and a 180px-taller lane after Advance slid Cat 2 out from under a held token. Before D-47 the lane happened to end 3px above the window. That was a latent defect the denser page exposed, not a pixel to re-aim the cell around: #ledger{overflow-anchor:none} makes the round state the anchor whenever it is on screen. PROBE P10 takes it out and 33m reddens at both sizes."
  - "THE SCENE'S EXPLAINER MOVED TO A PLAIN title, NOT data-tsay. #rr-head's precedent: data-tsay marks a STUDENT's fragment inside a tooltip so Layer C can strip it, and this sentence has none. Layer C reads it through LABEL_ATTRS; row 130d now reads it from the heading and requires it harvested exactly once. The move changed no harvest count; the How this works paragraph added one string to #app, the fight scans and #howto (33 -> 34). No floor moved: they are tripwires, not ratchets (D-32b's reading)."
  - "34b WAS STRENGTHENED BY ITS OWN PROBE. PROBE P6 put D-47's unit-card padding back and 34b stayed GREEN in all four columns: the chrome's compaction bought the third card on its own, and the fourth sits 16px from the fold at 1920, too close to hold as a regime. 34b now also reads the card's computed padding and row gap against the root's --sp-3 / --sp-2. P6 re-run: red x4."

requirements-completed: []

metrics:
  duration: 110min
  completed: 2026-09-28
---

# Phase 05 D-47: Denser Pages Summary

**Every tab and dialog shows more per screen, and the space came from padding, gaps, stacked lines
and a too-narrow picker, never from type. Across the whole artifact no font got smaller, six
readings got larger, and a new browser cell holds the 18px reading floor on eleven surfaces.
Measured in real Chrome and real Edge at 1920x1080 and 1366x768, headless, the two browsers
agreeing to the pixel on every surface.** The board lost 21% of its height, the fight 16-18%, and
How this works 28% at 1920 while its text grew. The token picker fits on one screen at 1920 (it
hid 623px before). The scene's explainer is a tooltip on its heading and a paragraph on How this
works. Two regressions surfaced only in the browser tier and were fixed in the artifact: a scene
height that broke D-44's picker rule, and the lane acting as Chrome's scroll anchor.

## Before and after, per surface

Chrome and Edge measured **identically** on every row, so each cell is both browsers.
"Hidden" is content inside a dialog's scroller that is not on screen.

| Surface | 1920x1080 before -> after | 1366x768 before -> after | First screen, what changed | Smallest reading text |
|---|---|---|---|---|
| **The board** | **3224 -> 2533** (-21%) | **3335 -> 2634** (-21%) | whole Cats unit cards **2 -> 4** at 1920, **0 -> 1** at 1366 (both columns 4 -> 7, 0 -> 2) | 17 -> **18** |
| **How this works** | **2499 -> 1811** (-28%) | **2371 -> 2151** (-9%) | whole cards 0 -> 2 at 1920; ~500px of empty panel in the second grid row -> **0** | 17 -> **18** |
| **The fight, fresh** | **2673 -> 2218** (-17%) | **2686 -> 2211** (-18%) | scene 84px higher (top 294 -> 210); round state starts 1000 -> **881** at 1920; the lane's head 707 -> 586 at 1366 | 17 -> **18** |
| **The fight, 3 rounds in** | **3017 -> 2529** (-16%) | **2922 -> 2414** (-17%) | the lane **whole** on the first screen at 1920 (cut before); round state 1180 -> **1060** | 17 -> **18** |
| **Token picker** | box 1040; content **1495, 623 hidden -> 895, 0 hidden** | content **1495, 935 hidden -> 899, 312 hidden** | create buttons on ONE line (two before); Name beside Range; shapes and colours one row each; emoji 5 rows -> 3 | 18 (standing exceptions unmoved) |
| **Action editor** | box **1010 -> 804**, nothing hidden either way | content **842, 282 hidden -> 663, 76 hidden** | Side beside the action list; New/Remove beside Name | 18 (standing exceptions unmoved) |
| **Share** | **306 -> 253** | **306 -> 253** | the code field's floor 104 -> 80 | 18 |
| **Reset** | **296 -> 267** | **296 -> 267** | the frame on the scale | 18 |

"Smallest reading text" is cell 34's reading: every leaf not on the named standing list. Before
D-47 that was 17 (the subtitle on every tab, How this works' prose, the round rules' reading,
amount and Remove). It is 18 on every surface in every column now.

Picture sets, read back as 2x2 contact sheets (Chrome over Edge, 1920 left and 1366 right) for
every surface before and after, full-page for the three tall tabs, and scrolled-to-end for the
four dialogs. One picture changed the plan on its own: the board pool's left-column head (see Deviations).

## What moved, surface by surface

| Commit | Surface | Change |
|---|---|---|
| `746d4d0` | [C00], the chrome | `--sp-1..5`; `.shell` top air 28 -> 12; title and subtitle on one baseline; bar, tab row, band and board gaps on the scale; `.brd-btn` line-height 1.2 (it inherited the body's 1.6: an 18px label in a 47px pill, now 40); tab pills 44 -> 40 |
| `40ad972` | The board | unit card 14/16/10 -> 8/12/6 (the 44x44 stepper untouched, [C06] states it as WCAG 2.5.5); the Reserve slot shrinks and wraps its own sentence instead of dropping under its label (it overshot by 8px); Damage beside Total health; reference effects on the name's line (display:contents, DOM order kept); strip, reference band and round rules on the scale |
| `fc2b9e5` | The fight | the scene hint to a title and How this works; the state side's name and count on one line (a GRID: a wrapping row parked the Mechs cluster 40px under its name); the fight pool's head on its Reserve line; 'Each round' on one line; bar, area, Advance bleed, sides, rows and ledger on the scale |
| `6593596` | How this works | a multi-column flow at the same 340px measure; prose 17 -> 18; the stretched-row comment answered in place |
| `0fbb727` | The dialogs | one frame, four dialogs, on the scale; picker 660 -> 1040 with Name beside Range; swatch ticks out of the flow to the tile's corner; editor head in two rows; Caster beside Target on the Proposal pane (layout only, not pass G); share field 104 -> 80 |
| `9b88942` | The fight (fix) | the 16-bit field height given back (D-44); `#ledger{overflow-anchor:none}` |

## The gate, before and after

| | before (f2cd768) | after |
|---|---|---|
| node suite | 1436 passed, 0 failed | **1436 passed, 0 failed**, exit 0 |
| interaction gate | 233 of 233 | **233 of 233** (130d turned) |
| stub-drift | 174 shell ids | **173** (`scene-hint`, by exactly that id) |
| DOM runner | 1563/0 | **1563/0** |
| browser | 578/0 headless | **586/0 headless** (+34 and +34b in four columns; 32 turned) |
| live `#selftest` | 1563/0 in Chrome and Edge | **1563/0 in both**, 0 page errors, store untouched |
| Layer C | #app 260, #howto 33, fight 771/771/795 | #app **261**, #howto **34**, fight **772/772/796**: the How this works paragraph; the tooltip move itself changed no count; no floor moved |
| perf | 100 commits in 7 ms | 100 commits in **7 ms** |

No new hex (26 literals before and after), no `url(`, no SVG, no `innerHTML` in the diff. Ops,
codec, `DEFAULTS`, `WIRE_BOUNDS` and the caps untouched: the shipped board still writes the same
45-character code.

## Every row and cell turned or added, with its red

| Row / cell | Red, as recorded | Turn |
|---|---|---|
| **stub** | node exit 1: "the scene's #scene-hint words could not be read out of the shell." | `scene-hint` out of the id list; the heading's title read out of the shell, loud if absent |
| **130d** | 232 of 233: the hint word read from `id="scene-hint"`, counted 0 | read from `#scene-head`'s title, still harvested exactly once |
| **32** | the column STOPPED at line 6723: `getComputedStyle(null)` TypeError, a cell that threw | two shell words read null-safe; the move asserted (hint gone, title carrying it) |
| **32r** | red at 1920 (the picker moved every sprite 60px) | not turned: the ARTIFACT was fixed (16-bit field given back) |
| **33m** | red at both sizes (Cat 2 slid 179px under a held token) | not turned: the ARTIFACT was fixed (lane out of scroll anchoring) |
| **34** NEW | red x4 on the pre-D-47 file (17px readings) | the reading floor on 11 surfaces, fields included, standing list pinned |
| **34b** NEW | red x4 on the pre-D-47 file | the density as regimes, plus the card's room off the scale by computed value |

Only three existing geometry cells moved, and two of those were answered in the artifact. The rest
held because they assert regimes and not pixels, which is D-32b's lesson paying out: the scene
opening 84px higher and the round state 120px higher moved nothing that was not about those
exact things.

## Probes, each against committed HEAD

Browser probes ran on scratch copies of HEAD through `QART`. The repo file was never touched.
Node probes edited the repo and were restored from scratchpad snapshots, with `git status` clean
after each.

| Probe | The regression | What caught it |
|---|---|---|
| **P1** | `.unit-name` 18 -> 17 (a new reading under the floor) | **34**, red x4 |
| **P2** | `.eyebrow` 12 -> 11 (a standing exception going lower) | **34**, red x4, named on all five dialogs |
| **P3** | `.ae-amt` 17 -> 16 (a FIELD) | **34**, red x4, the field clause ("ae-amt 16px < 17") |
| **P4** | How this works 18 -> 17 (a raised size put back) | **34**, red x4 |
| **P5** | picker back to 660px | **34b**, red x4. **Node gate GREEN** (1436/0, 233 of 233): the density is a browser's claim |
| **P6** | unit card back to 14/16/10 | **34b GREEN x4 on the first draft**; node GREEN. The regime was strengthened (key decisions); re-run **red x4** |
| **P7** | `#scene-head` loses its title (the sentence gone from the page) | node exit 1, the stub's own guard |
| **P9** | the stub keeps `scene-hint` | node exit 1, "STUB DRIFT: ... scene-hint" |
| **P10** | `#ledger{overflow-anchor:none}` removed | **33m**, red at both sizes (Cat 2 181 -> 360) |

The numbering skips P8, which was never defined. No probe threw or hung, and cells 34/34b
fail rather than throw by construction.

## Drags, the popup and the scene after the pass

Driven by real `page.mouse` in Chrome and Edge at both sizes, read back through the model:

| | every column |
|---|---|
| board drag, Cat 1 health onto Cat 2 (D-41) | `[3,3] -> [2,4]` |
| fight drag, Cat 1 health onto Cat 2's shape (D-46) | `[3,3] -> [2,4]` |
| still click on Cat 3 opens the unit popup (D-37) | open, on c3, three rows, wholly on screen |
| scene sprite dragged to the field's middle (D-42/D-44) | `(0.5, 0.53)`; y clamps at half a sprite |
| page errors | 0 |

D-42/D-44's cells (32 through 32s), D-41's (31 through 31l) and D-46's (33 through 33n) are all
green in all four columns. Advance stays reachable: cells 18 and 18c are unchanged and green.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 - Bug] The lane was Chrome's scroll anchor, so an Advance slid the round out from under a held token**
- **Found during:** the first full browser run after the surfaces landed (33m red at both sizes).
- **Issue:** isolated against the pre-D-47 file (33m green there) and instrumented. Before, the lane
  ended 3px above the window at the cell's working position, so the browser anchored on the round
  state and scrolled 180px to hold it still. The denser page leaves 10px of lane inside the window,
  under the opaque bar, and the browser anchored on those.
- **Fix:** `#ledger{overflow-anchor:none}`. A browser without scroll anchoring does nothing with it, which is the same as today.
- **Commit:** `9b88942`

**2. [Rule 1 - Bug] D-47's own 16-bit field height broke D-44's picker rule**
- **Found during:** the Chrome quick run (32r red at 1920).
- **Fix:** given back; recorded at [C19] and as deferred item 2.
- **Commit:** `9b88942`

**3. [Rule 1 - Bug] The state side's name and count, first drawn as a wrapping row, parked the Mechs cluster 40px under its name**
- **Found during:** reading the 1920 picture. A wrapping row shares a stretched side's spare height out between its lines.
- **Fix:** a grid that gives that height to the field's row, where the old column's flex put it; `:not([hidden])` because `.fg-side[hidden]` has the same weight and comes earlier.
- **Commit:** `fc2b9e5`

**4. [Rule 3 - Blocking] Cell 32 threw instead of failing when #scene-hint left the shell**
- **Fix:** null-safe reads; see the table above.
- **Commit:** `45f5c0c`

### Tried and dropped on the pictures

- **The board pool's "Pool" in a left column.** 1366: the Action points tokens wrapped under the
  stepper. 1920: the Reserve slot broke onto two lines. Net 14px, and it looked worse. Taken out
  before commit, recorded in `40ad972`.

### Findings recorded rather than fixed

- **Readings already under the floor** (the dense editor's, the Proposal pane's, the share
  field's) are pinned by cell 34 and listed as deferred item 1.
- **The lane's horizontal scroll** cuts the first round card's left edge at 1366 after three
  rounds. Measured on both files (80px before, 70px after), so it is pre-existing and not D-47's.
- **The lane's lede** is D-38-class prose on a surface, the same kind as the scene's. Outside the
  binding scope, so it stays: deferred item 4.

## What is NOT in this plan, on purpose

- **No font size went down anywhere.** The 44x44 stepper is untouched ([C06], WCAG 2.5.5).
- **Ops, the codec, `DEFAULTS`, the caps, `WIRE_BOUNDS`** are untouched.
- **The Proposal pane's symbol question** (D-39 pass G) is untouched. Caster beside Target is layout only.
- **A mechanical rewrite of the other 279 spacing declarations** was declined (deferred item 3).

## Threat Flags

None. No network surface, no auth path, no file access, no schema change. The one attribute
added to the shell is a static `title` of artifact prose. One CSS property,
`overflow-anchor`, changes scroll behaviour only.

## Self-Check: PASSED

Every commit named above is in `git log` (746d4d0, 40ad972, fc2b9e5, 45a9672, 6593596, 0fbb727,
9b88942, 45f5c0c, 03373bb, d2bb428). Every modified file exists. Re-verified at HEAD d2bb428:
node 1436/0 exit 0, 233 of 233, 173 shell ids; DOM 1563/0; browser 586/0 headless; live
`#selftest` 1563/0 in Chrome and Edge.
