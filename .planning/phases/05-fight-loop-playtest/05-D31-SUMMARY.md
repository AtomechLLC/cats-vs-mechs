---
phase: 05-fight-loop-playtest
plan: D31
subsystem: render+shell+gate
tags: [d-31, redirect, c14-1, s06-7, s06-11, two-areas, fold, stub-drift, headless]

requires:
  - phase: 05-fight-loop-playtest
    plan: D28
    provides: "the full-width lane above the round, and the measured ruling that put the two round controls above the scroller that grows with the roster — the property this plan had to keep while moving them"
  - phase: 05-fight-loop-playtest
    plan: D30
    provides: "[C14.5]'s positioned red mark and browser cells 21b/21c/21d, re-read here and byte-identical after the move"
provides:
  - "#fight-state and #fight-input — two <section> panels inside #fightbar, in the MARKUP, each with its own heading and its own pair of columns"
  - "#state-cats / #state-mechs — a second column root per side, so Cats-left / Mechs-right survives inside BOTH areas"
  - "[C14.1]'s .fg-area, .fg-area-head, .fg-area-name and .fg-area[hidden], and a 22vh bound on the state area's scroller with the sweep that chose it"
  - "[S06.7]'s fgBuildStateSide / fgBuildInputSide, fgAreaHead and fgUnseat; [S06.11]'s cluster lookup moved to the state root"
  - "rows 106, 92, 102 and 96 TURNED IN THE OPEN; rows 108 and 108b added; FIGHT_FLOOR 130 -> 132 re-derived by the per-roster method"
  - "browser cells 5, 5b, 6b and 18 turned; 18c, 22 and 22b added. 194 -> 206"
  - "deferred-items 9 — the Advance control at 1366x768, with the sweep and the one-line alternative"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "a separation made in the MARKUP as two sections, because a separation made in CSS puts the sequence a screen reader walks out of step with the one the room sees"
    - "two builders cut from one, with the cut where the instruction puts it and the order either side of it unchanged"
    - "a bound expressed as a sweep with the setting that fails printed beside the one that ships, so the next author reads what was tried"
    - "a claim TURNED at one viewport and REPLACED with a stronger one at both, rather than a number tuned until it passed"
    - "a stylesheet scanned as SELECTOR/BODY pairs rather than by three rule names, because a modifier class is not one of three names"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D31-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/05-11-PLAN.md
    - .planning/phases/05-fight-loop-playtest/deferred-items.md
    - .planning/REHEARSAL.md

key-decisions:
  - "THE SEPARATION IS TWO <section>s IN THE MARKUP AND NOT TWO CLASSES ON ONE, AND THAT CHOICE IS WHAT THE PROBES THEN ATTACKED. 103e's recorded lesson is that a rearrangement made in CSS puts DOM order and reading order out of step while every DOM-order check in this repository stays green — PROBE BB measured exactly that on the lane. Two real sections with two real headings make the areas two landmarks, so a student navigating by heading lands on what IS and then on what they are about to do. PROBE BQ then proved the lesson still had teeth here: one line, `.fg-area--input{order:-1}`, lifts the picker above the state ON SCREEN with every DOM-order clause still true, and the node gate ran 192 of 192, exit 0"
  - "ADVANCE GOES WITH THE INPUT AND THAT COSTS THE FOLD AT 1366x768, WHICH IS MEASURED RATHER THAN MISSED. D-31 puts the two round controls with the picker because Advance is what commits what the input declared. Swept from 12vh to 32vh on the state panel's window: at 1080 the largest setting with real headroom is 22vh (1057 of 1080, 23px spare; 24vh clears by two pixels, which is not a margin). At 768 NO setting clears it including zero — with a 92px window the control reads 869, so the chrome alone is 777px on a 768px screen. There is no free term in that arithmetic and no dial reaches it. So browser cell 18 was TURNED at 768 rather than the number being tuned until it passed, and cell 18c asserts at both sizes the property the fold was standing in for and never actually measured: scrolled to the picker rows, Advance is wholly on screen AND above them"
  - "THE ALTERNATIVE WAS MEASURED, WRITTEN DOWN AT THE DIAL, AND DECLINED — IT IS ONE LINE IF THE ROOM WANTS IT. `min(22vh, calc(100vh - 710px))` puts Advance at 757 of 768 at the price of a 58px state panel there, which shows a faction name and half a reading. The developer's complaint that opened this whole redirect was that the fight tab is 'way too compressed', and a 58px panel is the most compressed thing on the page. Both readings are in the comment beside the rule, in deferred-items 9, and on 05-11 as item 55, so the trade is the room's to overrule rather than a decision buried in a number"
  - "THE HALF-MADE-CHANGE ATTRIBUTES DID NOT MOVE, AND THAT IS WHAT KEPT [S07.5] AT A ZERO DIFF. `data-fg-act` and `data-fg-by` stay on the decl roots: fgSettle reads them, fgSig fingerprints them, [S07.5] writes them through its own restated FG_DECL_IDS table, and [S06.11] lights the battlefield off them. Splitting them across two roots, or moving them to the new pair, would have been a layout plan changing a dispatch contract while it was moving boxes around. Measured mechanically: the diff over cats-vs-mechs.html touches [S06.7], [C14.1], [C14.4], [S06.11] and the shell, and NOTHING in [S01], [S05] or [S07.5]"
  - "BOTH AREAS SHIP HIDDEN, WHICH IS #ledger's OWN RULING ARRIVING AT A NEW NODE. Before D-31 the two declaration roots shipped hidden and .fg-sides had no box of its own, so a student who never started a fight saw nothing. These panels have a border, a heading and a tint — hiding only the ROOTS would have left two labelled empty boxes on the setup page, which is the exact failure #ledger's own hidden rule exists for. So the areas carry [hidden] in the shell, .fg-area[hidden] beats the author display the rule above it gives them, [S06.7] shows them on the first frame of a fight and fgRest hides them again"
  - "FIGHT_FLOOR MOVED BY TWO AND THE TWO NEW HEADINGS COST IT NOTHING, WHICH IS A GAP IN LAYER C RATHER THAN A SAVING. Re-derived by the documented method — rosters trimmed BEFORE startFight, each side varied separately, regional breakdown kept: a cat and a mech still cost 38 each, and the roster-independent constant is 132 against D-29's 130. The whole +2 is in #fightbar and it is the side's NAME drawn at the head of both its columns. 'Where the round stands' and 'What you are about to do' are markup text, and this page is a hand-made stand-in rather than a parser, so Layer C cannot see them — exactly as it cannot see #fight-head's 'This round'. They are covered by LAYER A, which reads the whole document. Written down because a reader comparing +2 against four new strings will otherwise conclude the measurement is wrong"

requirements-completed: []

duration: 210min
completed: 2026-08-30
---

# Phase 05 D-31: The Round State and the Action Input Part Ways Summary

**The round being played is two bordered, headed panels now — what IS above what
you are ABOUT TO DO — with Cats left and Mechs right inside each of them, and the
spoken-for reading still moving in the top panel when a button in the bottom one
is clicked, driven by a real click in real Chrome and real Edge. The one thing
that got worse is stated first rather than found later: on a 1366x768 laptop the
Advance control opens below the fold, and that is measured to the point of
certainty — with the state panel's window set to ZERO the control still lands at
777 on a 768px screen. No dial reaches it, so the fold claim was turned in the
open and replaced with a stronger one that holds at both sizes: Advance sits at
the top of the panel whose rows it commits, so the scroll that brings the picker
into view brings the button with it.**

## The gate, before and after

| | before (post-05-D30) | after |
|---|---|---|
| suite | 1216 passed, 0 failed | **1216 passed, 0 failed** |
| `SUITE_FLOOR` | 1186 | 1186 — **not moved**; no `[S09.*]` row added |
| interaction gate | 190 of 190 | **192 of 192** (+2: 108, 108b) |
| stub-drift | 115 shell ids | **121** (+6, all six arrived with their KNOWN_IDS entries and stub nodes) |
| `#app` (setup) | 128, floor 117 | **128 — unchanged.** No setup surface touched |
| `#app` (fight) | 590, `FIGHT_FLOOR` 130 | **592, `FIGHT_FLOOR` 132** — re-derived, table below |
| `#app` (fight, sidebar open) | 590 | **592** |
| dialogs | 145 across 4 roots, floor 138 | **145 — unchanged** |
| proposal pane | 60, floor 23 | **60** |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 8156 literals, 0 hits | **8167 literals**, 0 hits |
| no-writer gate | 58 ops, 26 arms, 497 records | unchanged |
| perf | 100 commits in 6 ms (budget 50) | 100 commits in **6 ms** |
| **browser checks** | 194 passed, 0 failed | **206 passed, 0 failed** |

`node tests/selftest-node.cjs` exits **0**.
`PLAYWRIGHT_DIR=... node tests/browser-checks.mjs` reports **206 passed, 0
failed**, exit 0, **headless in both browsers** — the default since commit
`54f862a` and still the default here. Run with Playwright unresolvable it prints
the SKIP line and exits **0** — re-verified.

**`counter|balanc|rating` prints 0, whole document. `url(` 0. `innerHTML` 0.
`createElementNS|<svg` 0. `text-wrap` 0. One classic `<script>`, one `<style>`.**

**No behavioural change, and it is measured rather than asserted.** Every hunk of
`git diff 96844ca..HEAD -- cats-vs-mechs.html` mapped to its nearest section
marker:

```
  173 lines  [S06.7]     the two builders, the two seats, the teardown
  129 lines  [C14.1]     .fg-area and the state area's bound
   55 lines  the shell   the two <section>s and their comment
   18 lines  [S06.11]    one lookup, one banner paragraph
   11 lines  [C14.4]     two comments that named the old ancestry
```

**`[S01]`, `[S05]`, `[S07.5]` and every op: zero lines.** `DEFAULTS.cats.ap` is
untouched (D-25). The delegated listener is still bound at `#fightbar` and both
areas are inside it, so not one dispatch path moved.

## What D-31 asked for, and what it became

> separate the current round state from the action input area

```
before                              after
  This round                          This round
  Round 4        [Advance] [Reset]    ┌ Where the round stands — Round 4 ──────┐
  ┌ Cats ─────┬ Mechs ─────┐          │ ┌ Cats ────────┬ Mechs ────────┐       │
  │ 9 standing│ 3 standing │          │ │ 9 standing   │ 3 standing    │       │
  │ ▲▲▲ ■■     │ ▲▲ ■        │          │ │ ▲▲▲ ■■        │ ▲▲ ■           │       │
  │ 3 left    │ 3 left     │          │ │ 3 left       │ 3 left        │       │
  │ [rows]    │ [rows]     │          │ └──────────────┴───────────────┘       │
  └───────────┴────────────┘          └────────────────────────────────────────┘
  Nothing resolves until you advance. ┌ What you are about to do  [Advance] [Reset] ┐
                                      │ ┌ Cats ────────┬ Mechs ────────┐       │
                                      │ │ [rows]       │ [rows]        │       │
                                      │ └──────────────┴───────────────┘       │
                                      └────────────────────────────────────────┘
                                      Nothing resolves until you advance.
```

The order D-27's addendum set survives the cut whole — side, battlefield, team
resources, picker rows, reading box, read top to bottom down the page. A border
and a heading now fall between the resources and the rows, and nothing was
reordered to put them there.

## The measurements — real Chrome and real Edge, 1920x1080 and 1366x768, headless

| reading | @1920x1080 | @1366x768 |
|---|---|---|
| the state panel's box | 494–819 | 547–803 |
| the input panel's box | 831–1265 | 815–1149 |
| the gap between them | **12px** | 12px |
| each panel's border, and its background against `#fightbar`'s | 1px, `rgb(31,37,48)` vs `rgb(25,29,38)` | same |
| both panel headings, computed size | **18px** | 18px |
| the state panel's window, over 364px of content | **238px** | 169px |
| the input panel's window, over 1010px of content | 346px | 246px |
| **Advance, bottom edge, three rounds in the lane** | **1057 of 1080** | **948 of 768** |
| Advance and the picker rows, together, at the offset a room declares from | 390–437 and 502–942 | 177–224 and 289–729 |
| the state columns, left + width | 198+754 / 968+754 | 60+615 / 691+615 |
| the input columns, left + width | 198+754 / 968+754 | 60+615 / 691+615 |
| D-30's marks: count / off a shape / off the geometry / clipped | **126 / 0 / 0 / 0** | 126 / 0 / 0 / 0 |
| D-30's mark: dx from the shape's left edge, dy as a fraction | **0.00px / 0.2500** | 0.00px / 0.2500 |

**Chrome and Edge agree to the digit on every figure.** D-30's badge geometry is
byte-identical to the numbers in its own summary — the mark moved column with the
battlefield and did not move on the shape.

### The dial, swept

The state panel's window is what decides where Advance is, which is the sentence
`[C14.1]`'s 26vh sweep made about the *other* scroller before D-28 moved the
controls above it. Three rounds resolved, twelve declarations standing, at page
scroll zero:

| state window | @1920x1080 Advance | @1366x768 Advance |
|---|---|---|
| 12vh | 949 of 1080 | 869 of 768 **BELOW** |
| 16vh | 992 of 1080 | 902 of 768 **BELOW** |
| 18vh | 1013 of 1080 | 917 of 768 **BELOW** |
| 20vh | 1035 of 1080 | 932 of 768 **BELOW** |
| **22vh** | **1057 of 1080 ← shipped** | 947 of 768 **BELOW** |
| 24vh | 1078 of 1080 | 958 of 768 **BELOW** |
| 26vh | 1100 of 1080 **BELOW** | 973 of 768 **BELOW** |
| 32vh | 1157 of 1080 **BELOW** | 1016 of 768 **BELOW** |

22vh is the largest setting with real headroom at 1080; 24vh clears by two
pixels, which is not a margin. **At 768 no setting clears it, including zero** —
read 869 against its 92px window and the chrome alone is 777px on a 768px screen.

## The gate rows, old claim and new claim

| row | what it asserted | what it asserts NOW | its reading |
|---|---|---|---|
| **106** | the battlefield is one cluster per side **inside that side's own column** | **TURNED.** The word is *state* column now, and `bfShapesOf` reads `#state-{side}`. WHICH root is asserted by row 108 rather than left to this one | 9 and 3 shapes, roster-matched |
| **92** | the fight-page harvest is clean and the board it is taken on is DRESSED — shapes painted, labels drawn | **TURNED at three readings.** `fightShapes`, `fightLit` and both label counts read the state roots | 592 strings, 0 hits, 12 shapes, 3 lit |
| **102, 96** | the acceptance run and the Advance press | **their DRIVES follow the reading to its new root** — the claim is untouched, the lookup moved | green |
| **108** NEW | — | **the separation itself**: order read three ways, contents counted in BOTH directions, the round figure on the state area's HEAD and the two controls on the input area's, and the column pairing inside EACH area | 13 CSS rules scanned, 0 offenders |
| **108b** NEW | — | **the preview crosses the boundary**, driven through three moments, plus the teardown reading both areas hidden AND all four columns empty | `"0 of 3 spoken for"` → `"1 of 3"` → `"0 of 3"` |
| 95, 100, 103e, 103f, 104*, 106b–g, 107* | 05-12 to 05-D30's | **re-read, unchanged** | all green |

### FIGHT_FLOOR, re-derived

Rosters trimmed BEFORE startFight, each side varied separately, regional
breakdown kept because the totals alone hide where a change landed:

```
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

  cats x mechs     38c + 38m + 132     measured
    2 x 2                284               284
    3 x 3                360               360
    9 x 3                588               588
    9 x 6                702               702
```

A cat and a mech still cost **38** each. Against D-29's table every board is
exactly **two** strings larger, the `#ledger` and `#board` columns are
byte-identical at every row, and the whole difference is `#fightbar`'s: 195 → 197
at 9x3, 180 → 182 at 9x2, 240 → 242 at 9x6. **Two per board, never two per
unit** — the side's name at the head of its second column.

## The browser cells, turned and added

| cell | what changed |
|---|---|
| **5** | **TURNED.** The old claim — one column reading name → battlefield → team → rows — cannot be made at all now; the recorded RED is `{"cats":{"head":906,"field":null,"team":null,"rows":958}}`. It reads the same sentence across the cut, plus the state AREA wholly above the input AREA as boxes |
| **5b** | **TURNED.** `[ROUND]` is asserted INSIDE the state panel, and the Cats-left / Mechs-right pairing is read inside EACH area |
| **6b** | **first clause turned at 768.** The picker's scroller begins at 889 of 768 there; the driven half — brought wholly into view by scrolling — is untouched and green at both |
| **18** | **TURNED at 768 only.** 1080 keeps the old claim unweakened. 768 asserts a real box, enabled, within ONE page scroll — so a regression to 1600 still reddens |
| **18c** NEW | scrolled to the picker rows, Advance is **wholly on screen AND above them**. PROBE BO is why the last three words are there |
| **22** NEW | the separation is a **BOX**: real borders, a background distinct from `#fightbar`, a real gap, a visible heading each at the 18px floor. Colours are compared, never typed — 21d's lesson |
| **22b** NEW | a **real click** in the input panel moves the spoken-for reading in the state panel, and a second click puts it back |
| 21b, 21c, 21d and the rest | **re-read, unchanged, green** |

## The probes

**Every probe was run AFTER the commit it tests, recorded verbatim, and reverted
by `cp` from a scratchpad snapshot. `git checkout --` was never used, `git clean`
was never run, and `git status --short` read clean after each.**

### PROBE BN — the separation as spacing rather than as a box

**Applied:** `.fg-area`'s border, padding, radius and background replaced with
`margin-top:28px` — the exact thing the developer's word rules out.

```
node tests/selftest-node.cjs   1216 passed, 0 failed | 192 of 192 | EXIT=0
browser checks                 202 passed, 4 failed  <- cell 22 only
```

**The node gate is spotless over a page where the instruction has been undone**,
and that is the division of labour rather than a hole in it: containment and DOM
order are unchanged by this probe, and a border is not a thing a stub with no
stylesheet can see. Cell 22 exists because of it.

### PROBE BO — the two round controls at the FOOT of the input area

**Applied:** `fgBuildRound`'s seat changed from `fgAreaHead('fight-input')` to
the area itself, so the row appends below the scroller.

```
node tests/selftest-node.cjs   1216 passed, 0 failed | 192 of 192 | EXIT=0
browser: 18 red at 1080 (Advance 1408 of 1080)
         18c GREEN at both sizes  <- and this is the finding
browser checks                 204 passed, 2 failed
```

**Two gaps at once.** Row 108 counted the controls anywhere INSIDE the input
area, so both were still where it looked. And cell 18c was green because at the
offset a room declares from the control sat at 747–794 with the rows at 443–883 —
both on screen, in the wrong order. **The below-the-fold defect this phase has
fixed four times, and one cell caught it at one size.**

Row 108 now reads the input area's own `.fg-area-head` and counts controls
elsewhere in that area as a failure; cell 18c now asserts Advance is ABOVE the
rows. Re-run against them:

```
FAIL  interaction gate :: 108.
      Advance and Reset on the input head=0, elsewhere in that area=2
interaction gate: 191 of 192                                    EXIT=1
browser: 18 red at 1080, 18c red at BOTH sizes
```

### PROBE BP — the state panel painted once and never again

**Applied:** `fgFillStanding` and `fgFillTeam` guarded behind a build-once flag
on the state root — the shape a change that repainted only the region the press
landed in would take.

```
FAIL  interaction gate :: 96., 102., 108b.
interaction gate: 189 of 192                                    EXIT=1
browser: 11, 18b and 22b red in both browsers at both sizes
browser checks                 194 passed, 12 failed
```

Caught in both harnesses and from three directions. This is the one behaviour a
purely structural change could have broken silently, and it is the reason 108b
and 22b exist.

### PROBE BQ — one line of CSS lifts the picker above the state

**Applied:** `.fg-area--input{order:-1}` added to `[C14.1]`.

```
node tests/selftest-node.cjs   1216 passed, 0 failed | 192 of 192 | EXIT=0
browser: 5, 22 red at both sizes; 18 and 18c red at 768
browser checks                 194 passed, 12 failed
```

**103e's own PROBE BB arriving on this plan's markup.** Row 108's first draft
read `.fg-area`, `.fg-sides` and `.fg-side` BY NAME, exactly as 103e reads its
three — and a modifier class is not one of three names. The `[C14]` slice is now
cut into selector/body pairs with comments stripped, and every rule whose
SELECTOR mentions `#fightbar`, `.fg-area` or `.fg-side` has its BODY read for
`order:` and for a reversed direction. **13 rules today, 0 offenders**; with the
probe applied, 14 and 1, and the row goes red.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — bug] Row 108's two head lookups were read before they were
declared**

- **Found during:** the run that was supposed to prove PROBE BO red — by its
  EXIT CODE, not by a failing row.
- **Issue:** `sepFigInState` read `sepStateHead` one statement above the `const`
  that binds it. A temporal-dead-zone throw at module load, **with 1216 in-file
  rows already printed green above it** — so a grep for `passed,` found
  "1216 passed, 0 failed" on a run that never reached the interaction gate's
  summary line at all. The gate had been silently not running its last section
  for two commits.
- **Fix:** both heads read first, and floored on being FOUND — a null head makes
  every count below it zero, and a clause reading "0 in the wrong place" is
  satisfied by a page with no heads at all.
- **Files modified:** `tests/selftest-node.cjs`.
- **Commit:** `52f5f16`.

**2. [Rule 2 — missing critical functionality] Two labelled empty panels on the
setup page**

- **Found during:** writing the shell markup, before the first run.
- **Issue:** before D-31 the two declaration roots shipped hidden and `.fg-sides`
  had no box of its own, so a student who never started a fight saw nothing.
  These panels have a border, a heading and a tint — hiding only the ROOTS would
  have left two bordered, headed, empty boxes above the board of every student
  who never starts a fight, which is the exact failure `#ledger`'s own hidden
  rule exists for and which its shell comment argues at length.
- **Fix:** both areas ship `hidden`; `.fg-area[hidden]{display:none}` beats the
  author display the rule above them gives; `[S06.7]` shows them on the first
  frame of a fight and `fgRest` hides them again. Row 108b asserts the teardown
  reads hidden AND empty separately.
- **Files modified:** `cats-vs-mechs.html` (shell, `[C14.1]`, `[S06.7]`).
- **Commit:** `3f27f29`.

**3. [Rule 3 — blocking] `fgRest` would have thrown on the teardown**

- **Found during:** writing `fgRest`, before the first run.
- **Issue:** the round figure and the two controls are no longer children of
  `#fightbar` — they sit on two different area head lines — and
  `root.removeChild` on a node that is not a child **throws**, which is the one
  failure mode a teardown must not have.
- **Fix:** `fgUnseat`, which asks each node for its own `parentNode` and is
  null-safe at both ends. The shape survives either of them being moved again,
  which is the third time this phase has moved one of them.
- **Files modified:** `cats-vs-mechs.html` (`[S06.7]`).
- **Commit:** `3f27f29`.

### Corrections to the orchestrator's own premises, recorded rather than worked around

1. **"Advance stays reachable — measure it." It was measured, and at 1366x768 it
   cannot stay above the fold.** The brief's own reading of D-31 puts the two
   controls with the input, and the sweep shows a zero-height state panel still
   overshoots by nine pixels at that size. The claim was TURNED with the numbers
   rather than dialled around, the stronger replacement (18c) holds at both
   sizes, and the one-line alternative is written at the dial, in
   deferred-items 9 and on 05-11 as item 55.
2. **"Re-measure FIGHT_FLOOR if the harvest moves" — it moved by 2, not by 4.**
   The two new area headings are markup text and this page is not a parser, so
   Layer C cannot see them. They are covered by Layer A. Written into the
   constant's own history so the next reader does not conclude the measurement is
   wrong.
3. **The brief lists rows 95, 103d/e/f, 106*, 107* as the containment readers to
   check. 95 and 103e turned out not to be containment rows at all** — 95
   partitions by `data-k` prefix and 103e reads `#app`'s child order — and both
   were re-read unchanged. The rows that actually broke were 92, 96, 102, 106 and
   106b, and the recorded RED names them.
4. **PROBE BO found that a row reading "inside the area" is not a row reading
   "on the head line", and PROBE BQ found that three rule names are not a
   stylesheet scan.** Both were the first draft of row 108. Both are corrected in
   commits of their own with the probe named.

## Known Stubs

None. Every node this plan adds is either built on the frame it is shown or ships
in the markup with its own `[hidden]`. `fgAreaHead` and `fgBuildRoundHead` each
keep a fall-through for a missing head, both are documented as unreachable on a
page built from the shipped shell, and both put the node at the region root
rather than nowhere — the closest wrong answer to the right one. No branch
renders an empty panel: the areas are hidden until a fight is running and emptied
when one ends.

## Threat Flags

None. No network endpoint, no auth path, no file access, no schema change. This
change moves existing nodes to different parents, adds two static sections, four
CSS rules and two id tables, and stores nothing anywhere. No caller string is
interpolated into a className or an id — the six new ids are literals in the
markup and in two frozen-shape object literals, and every node inside the panels
is still built by the shipped `makeToken` / `safeShape` / `safeColor` allowlists,
which is T-02-01's mitigation reused rather than restated. The delegated listener
is still bound at `#fightbar` with both areas inside it, so `[S07.5]`'s dispatch
surface is byte-identical. **Zero packages installed**: Playwright was resolved
from the existing dev-only install through `PLAYWRIGHT_DIR`, and every ad-hoc
measurement driver lives in the scratchpad and is not committed.

## Commits

| # | Commit | What |
|---|---|---|
| 1 | `3f27f29` | the two panels, the four column roots, `[C14.1]`'s rules and the 22vh bound, `[S06.7]`'s two builders and teardown, `[S06.11]`'s lookup; KNOWN_IDS + six stub nodes; rows 106/92/102/96 turned, 108 and 108b added, `FIGHT_FLOOR` 130 → 132 |
| 2 | `4fffcbd` | browser checks 194 → 206: cells 5, 5b, 6b and 18 turned; 18c, 22 and 22b added |
| 3 | `bbbcf8e` | PROBE BO's finding — row 108 reads the input area's HEAD, cell 18c asserts Advance is ABOVE the rows |
| 4 | `52f5f16` | the temporal-dead-zone throw found by an exit code |
| 5 | `32d17d2` | PROBE BQ's finding — row 108 scans every rule that can reach these boxes |
| 6 | *(this commit)* | `05-D31-SUMMARY.md`, 05-11 section J (register 1-53 → 1-55), `REHEARSAL.md`'s D-31 block, deferred-items 9, `STATE.md` |

## Self-Check: PASSED

Files:
- FOUND: `cats-vs-mechs.html`
- FOUND: `tests/selftest-node.cjs`
- FOUND: `tests/browser-checks.mjs`
- FOUND: `.planning/phases/05-fight-loop-playtest/05-11-PLAN.md`
- FOUND: `.planning/phases/05-fight-loop-playtest/deferred-items.md`
- FOUND: `.planning/REHEARSAL.md`
- FOUND: `.planning/phases/05-fight-loop-playtest/05-D31-SUMMARY.md`

Commits:
- FOUND: `3f27f29`, `4fffcbd`, `bbbcf8e`, `52f5f16`, `32d17d2`

Gates:
- `node tests/selftest-node.cjs` — **1216 passed, 0 failed**, interaction gate
  **192 of 192**, stub-drift **121 shell ids**, `FIGHT_FLOOR` **132** with the
  fight harvest at **592** closed and **592** open, Layer A 0 hits, Layer B 8167
  literals 0 hits, perf 100 commits in 6 ms, exit **0**
- `node tests/browser-checks.mjs` — **206 passed, 0 failed** with
  `PLAYWRIGHT_DIR` set, real Chrome and real Edge at 1920x1080 and 1366x768,
  **headless**; exit **0** with the SKIP line without it
- `counter|balanc|rating` 0; `url(` 0; `innerHTML` 0; `createElementNS|<svg` 0;
  `text-wrap` 0; one `<script>`; one `<style>`
- `[S01]`, `[S05]`, `[S07.5]` and every op: **zero diff lines** over
  `96844ca..HEAD`
- `git status --short` clean after every probe revert
