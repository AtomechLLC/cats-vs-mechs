---
phase: 05-fight-loop-playtest
plan: D28
subsystem: ui+gate
tags: [d-28, redirect, c14, c14-1, c14-2, c15, s06-8, s06-10, s07-6, proj-05, fight-14, fight-15, layout, fight-floor, browser-checks]

requires:
  - phase: 05-fight-loop-playtest
    plan: 16
    provides: "FIGHT_FLOOR 116 with its two-axis method, the twelve fight rows as they stood, and the 138-cell browser suite this one extends"
  - phase: 05-fight-loop-playtest
    plan: 15
    provides: "the battlefield inside .fg-field and [C14.1]'s 26vh bound with the sweep that shipped it"
  - phase: 05-fight-loop-playtest
    plan: 14
    provides: "D-27's grid, .fg-round-head and .fg-round-acts, and the fgBuildBar order this plan changes"
  - phase: 05-fight-loop-playtest
    plan: 12
    provides: "#views, [C15], the view switch, and check 103b's placement claim — the row this plan turns"
  - phase: 05-fight-loop-playtest
    plan: 08
    provides: "[S06.8], the ledger's delta growth, its scroll-to-end and [C14.2]"
provides:
  - "the fight bar at the FULL width of the band, and #ledger as a full-width horizontal lane ABOVE it, moved in the MARKUP rather than with a CSS order"
  - "#proj-toggle — one new id — and D-28's projection sidebar, which is #strip itself moved out of flow rather than a second panel"
  - "checks 92b, 103d, 103e and 103f; check 103b's claim turned in the open with its stylesheet half added"
  - "FIGHT_FLOOR re-measured by the two-axis method and NOT moved, with the entry writing out why each of D-28's three changes costs that harvest nothing"
  - "the round controls on the round's own line, which is a MEASURED below-the-fold defect fixed rather than a rearrangement"
  - "[C14.1]'s 26vh -> 32vh with the sweep, because the property that bound was shipped for is now held structurally"
  - "browser checks 138 -> 170, with cells 6b and 10 TURNED and ten cells added"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "a lane bounded by bounding each CARD rather than the lane, because a row's height IS its tallest child and a max-height on the row clips instead of bounding"
    - "a toggled panel that is THE SAME NODE moved out of flow, so a second surface cannot go out of step with the first"
    - "a control moved out of a region's vertical budget entirely rather than a dial turned to fit it back in"
    - "a gate row that reads three RULE BODIES by name rather than a stylesheet block, because a block boundary is a guess about where a rule lives"
    - "a browser cell whose claim is made absolute by adding the settled scroll offset back, so it holds whichever offset the browser reached"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D28-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/05-11-PLAN.md
    - .planning/phases/05-fight-loop-playtest/deferred-items.md
    - .planning/REHEARSAL.md

key-decisions:
  - "THE SIDEBAR IS #strip ITSELF AND THERE IS NO SECOND PROJECTION. The obvious build is a sidebar panel carrying a copy of the figures; it is refused because [C15]'s own sentence about the retired column pin is 'the same projection, not a second one that happens to carry the same words', and PROJ-05 is about seeing THE reading at the moment the fight contradicts it. So the toggle needs ONE new id and no root id, and probe BD is what proves the difference is real — with every repaint of the open panel blocked, row 103d reddens on the one clause a copy would fail"
  - "THE LANE RUNS SIDEWAYS AND THE MOVE IS IN THE MARKUP. A full-width vertical stack of past rounds pushes the round being played off the bottom — the defect class this phase has fixed three times — so the lane is a flex ROW. And #ledger became the band's FIRST CHILD rather than getting an `order:-1`, because an order property puts the sequence a screen reader walks out of step with the sequence the room sees while every DOM-order check in this repository stays green. Row 103e reads the three rule bodies that could reintroduce it"
  - "THE HEIGHT DIAL MOVED OFF .ld-list AND ONTO .ld-row, WHICH IS A DIFFERENT KIND OF CHANGE FROM A NEW NUMBER. A column of rounds is bounded by bounding the column; a ROW of rounds is bounded by bounding each CARD, because the lane's height IS its tallest card and a max-height on the lane clips cards instead of bounding them. The 46vh history is kept whole rather than replaced, because it is the record of four plans turning one dial against four different pages"
  - "THE ROUND CONTROLS MOVED BECAUSE OF A MEASUREMENT, NOT A PREFERENCE. With the lane above and the controls appended below .fg-sides, Advance measured 1094 of a 1080 viewport and 951 of a 768 one in both browsers. A dial would have traded the grid's height for the button's position on the tab whose developer's complaint is that it is too compressed. The controls are on the round's own line now — above the bounded scroller — so no roster and no dial can move them: 656 and 556, and probe BF reddens browser check 18 in all four combinations when they go back"
  - "26vh -> 32vh, AND THE PARAGRAPH THAT SHIPPED 26vh IS WHY IT MOVED RATHER THAN IN SPITE OF IT. That comment's closing line is 'a dial that looks unnecessary after a rearrangement is a dial to re-measure, not one to turn off'. The property it was shipped FOR — Advance not going off the bottom — is now held structurally, so the dial was re-measured against what it actually bounds. 32vh is the largest setting whose box ends inside a 1080 fold and it is taken for a property rather than for pixels: the team resources reading at 1042 is inside the window rather than a scroll away, which is FIGHT-09's own surface"
  - "FIGHT_FLOOR DID NOT MOVE AND THE ENTRY IS THE MEASUREMENT RATHER THAN THE MOVE. Three surfaces changed and every one of the twelve boards reproduces 29c + 30m + 116 byte-identically to the 120 -> 116 entry. The entry writes out why: the lane's action lines were ALREADY rendered by ldDidInto, the toggle renders no word by design, and the projection never left this harvest because the hiding is a CSS display rule and this page has no stylesheet"
  - "ROW 92b HARVESTS THE OPEN STATE AND SAYS PLAINLY WHICH HALF IT CANNOT SEE. The wave-1 lesson is that a surface the walk never reaches reports clean forever, so the toggle is driven and the open page is scanned. But the two harvests are the same length by construction in this page, and the row says so rather than implying a claim it is not making — the closed state really removing the panel is a layout claim and it lives in browser check 10c"
  - "CHECK 10's FIGHT-VIEW HALF WAS REMOVED BECAUSE IT WOULD HAVE PASSED. getComputedStyle on a display:none element still reports position sticky and getBoundingClientRect still reports zeros, and zeros satisfy `top >= 0`. That cell would have been green, in both browsers at both sizes, over a projection that had left the page — which is the fourth-green-row failure this phase keeps finding. The loop runs over the build view alone and 10c takes the fight view's claim by driving the press"
  - "THE WITHPRESERVEDFOCUS HAZARD DOES NOT RETURN, AND THE MEASUREMENT SAYS WHY THE BELT RATHER THAN THE BRACES IS WHAT HOLDS. Probe BE moved #ledger INSIDE #board in both pages and read the first [data-k] match scoped to #board: it came back \"cats/ap-\", a live board control, with 0 keys anywhere inside #ledger. Plan 05-06's sibling placement is the braces; check 94's no-keys-on-a-row rule is the belt, and it is the belt that is load-bearing today"

patterns-established:
  - "a probe that finds a GATE bug rather than an artifact bug, recorded as the reason a row reads what it reads: probe BB set the lane to row-reverse and the first draft of row 103e was spotlessly green, because it sliced the block the rule looked like it should be in"
  - "a claim written against the scroll that settled AND made absolute by adding the offset back, so one cell holds in two browsers that disagree about where scrollTo(0,0) lands"
  - "a comment paragraph kept verbatim under a line that says what it stopped being true about, three times in one change: [C14]'s 736px derivation, [C15]'s column pin, and [C14.1]'s 26vh sweep"

requirements-completed: []

duration: 195min
completed: 2026-08-29
---

# Phase 05 D-28: The Fight Takes the Whole Width Summary

**D-28's three sentences are built and every gate row that watched the surface
they changed was turned in the open. The fight is 1600px wide instead of 736;
earlier rounds are a horizontal lane above it that scrolls sideways and shows
each round's board AND the actions selected in it; the projection is off until
one press opens it as a fixed sidebar that is the SAME node, not a copy. Driving
it in two real browsers found the defect the change had introduced — the control
that ends the round sitting 1094px down a 1080px screen — and driving a probe at
a gate row found that the row written for a reversed lane was green over one.**

## The gate, before and after

| | before (post-05-16) | after |
|---|---|---|
| suite | 1216 passed, 0 failed | **1216 passed, 0 failed** |
| `SUITE_FLOOR` | 1186 | 1186 — **not moved**; this change adds no `[S09.*]` row |
| interaction gate | 180 of 180 | **184 of 184** (+4: 92b, 103d, 103e, 103f) |
| stub-drift | 114 shell ids | **115** (+1: `proj-toggle`) |
| `#app` (setup) | 128, floor 117 | 128, floor 117 — unchanged |
| `#app` (fight) | 467, `FIGHT_FLOOR` 116 | **467**, `FIGHT_FLOOR` **116 — re-measured, not moved** |
| `#app` (fight, sidebar OPEN) | — | **467** (new reading, row 92b) |
| dialogs | 145 across 4 roots, floor 138 | 145 across 4 roots — unchanged, no dialog added |
| proposal pane | 60, floor 23 | 60, floor 23 |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 8016 literals, 0 hits | **8048 literals**, 0 hits |
| no-writer gate | 58 ops, 26 arms, 497 records | unchanged |
| perf | 100 commits in 6 ms (budget 50) | 100 commits in **7 ms** |
| **browser checks** | 138 passed, 0 failed | **170 passed, 0 failed** |

`node tests/selftest-node.cjs` exits 0.
`PLAYWRIGHT_DIR=... node tests/browser-checks.mjs` reports **170 passed, 0 failed**, exit 0.
Run with Playwright unresolvable it still prints the SKIP line and exits **0** — re-verified.

**`counter|balanc|rating` prints 0, whole document. `url(` 0. `innerHTML` 0.
`createElementNS|<svg` 0. One classic `<script>`, one `<style>`.
`DEFAULTS.cats.ap` untouched (D-25).**

## What D-28 asked for, and what each sentence became

> this is way too compressed - let the fight take the whole width.

`#fightbar` was `flex:0 1 736px` inside a 1600px band with `#ledger` beside it —
46% of the width it had. Both regions are `flex:1 1 100%` at every width now and
the `@media(min-width:1180px)` block that overrode them is gone. **Measured: the
Cats picker column is 764px wide at 1920x1080 against 332px before; the Cats and
Mechs battlefield clusters sit at left 173 and left 953.**

Three things went with that media query and each is recorded rather than
deleted: `[C14]`'s **736px basis** (kept as the derivation `[C14.1]`'s `.fg-side`
sweep is written against — *nothing in this file sets 736 any more*), the
**1180px breakpoint**, and this file's **only use of `:has()`**.

> earlier rounds should be a full lane above showing the past state and acctions selected.

`#ledger` is the band's **first child** and `#fightbar` its second — moved in the
markup, not with an `order` property. `.ld-list` is a flex **row**; `.ld-row` is
a 340px card bounded at 22vh (15vh below 820px of viewport height) that scrolls
on itself; `[S06.8]`'s scroll-to-end assigns `scrollLeft` as well as `scrollTop`.

**The lane already showed both halves and that is the finding rather than the
absence of one.** `ldDidInto` has rendered one line per declaration — *"Cat 1
uses Slash on Mech 1."* — with the split's three facts under it since plan 05-08.
Nothing asserted it. Row 103f does now, and it is the clause a 340px card is
most likely to lose.

> The predictor turn off, and make it toggled sidebar / pop over

`#strip` is `display:none` in the fight view and comes back as a
`position:fixed` sidebar while `#app` carries `data-proj="1"`. **The sidebar IS
`#strip`** — the same node, the same `[S06.3]`, the same figures. One new id:
`#proj-toggle`, inside `#views`, `.pv-` prefixed, undisplayed in the build view.

## The one new id, and the two it did not need

| id | what it is | who paints it | who presses it |
|---|---|---|---|
| `proj-toggle` | `.pv-btn`, `data-pv="strip"`, `data-k="pv/proj"`, `aria-pressed` + `aria-expanded` + `aria-controls="strip"` | `[S06.10]`'s `pvPaint` | `[S07.6]`'s existing delegated pair on `#views` |

114 → **115**. `#views`' accessible name is amended in the shell and in the stub
together — *"Which screen"* → *"Which screen, and the projection"* — because a
group label that describes two of its three controls is a banner that quietly
lies, and an attribute present in one page and different in the other is the
drift section 5b exists to make impossible.

**Two ids were considered and are not there.** A sidebar ROOT is not needed
because the sidebar is `#strip`. A `#projbar` container is not needed because the
toggle rides `#views`' row — which also saved the ~62px of vertical budget a
second full-width row would have cost, on a tab that was about to spend it all
on the lane. `[S07.6]` binds no new listener and pushes no new `LATE_BINDERS`
entry, so **check 93b did not have to grow a fourth root** — recorded as a
consequence of the placement rather than as an absence.

## FIGHT_FLOOR — re-measured, and 116 is unmoved

Rosters trimmed **before** `startFight`, each side varied **separately**, which
is the method the floor's own comment prescribes:

```
cats varied, mechs held at 3     cards  strings  delta      mechs varied, cats at 9
  2 cats                            5     264                 2 mechs   11   437
  3 cats                            6     293     +29         3 mechs   12   467   +30
  4 cats                            7     322     +29         4 mechs   13   497   +30
  5 cats                            8     351     +29         5 mechs   14   527   +30
  6 cats                            9     380     +29         6 mechs   15   557   +30
  9 cats                           12     467     +29 x3
```

| cats × mechs | 29c + 30m + 116 | measured |
|---|---|---|
| 2 × 2 | 234 | 234 |
| 2 × 3 | 264 | 264 |
| 3 × 3 | 293 | 293 |
| 4 × 4 | 352 | 352 |
| 6 × 6 | 470 | 470 |
| 9 × 3 | 467 | 467 |
| 9 × 6 | 557 | 557 |

**Every figure is byte-identical to the 120 → 116 entry.** Three surfaces changed
and the constant did not move, and "we changed three things and nothing moved" is
exactly the reading that usually means a drive has stopped reaching something —
so the entry writes out why, one cause at a time:

1. **The lane's action lines were already there.** `ldDidInto` since 05-08.
2. **The toggle renders no word, by design.** `[S06.10]`'s banner refuses a label
   that flips between "Show the projection" and "Hide the projection" and ships
   one permanent label plus a real tick node. A permanent label is static markup,
   the stub carries no text for static markup, Layer A reads it in the document.
3. **The projection never left this harvest.** The hiding is a CSS `display`
   rule; this page has no stylesheet and `harvestInto` never asks whether an
   ancestor is displayed. The strip's strings are in the closed reading exactly
   as in the open one.

**The open-state harvest ships anyway (row 92b), and the row says which half it
cannot see.** `1 × 1` is the one board on the reproduction table this drive
cannot take: it rules `fightCatIds[1]` dead and a one-cat roster has no second
cat. Recorded rather than worked around.

## The defect the browser found, and the defect a probe found

### The browser: Advance below the fold, at both sizes, in both browsers

Three rounds resolved, twelve declarations a round, with the controls still
appended below `.fg-sides`:

```
Advance the round, top of its box     1094 of a 1080 viewport
                                       951 of a  768 viewport
```

**The control that ends the round was off the bottom of the screen** — the exact
defect class this phase has fixed three times (05-07's bar, 05-08's ledger, the
viewport fix's band), re-introduced by this change. Fixed by moving
`.fg-round-acts` onto `.fg-round-head`'s own line, pushed to the far end by an
auto margin, **above** the bounded scroller: **656 of 1080 and 556 of 768**, and
no roster and no dial can move it. `.fg-round-fig` gives the 18px label and the
28px figure their own baseline group so a 44px button can share their line.

**The trade is recorded rather than absorbed:** FIGHT-10's notice (`#fight-said`)
used to sit ABOVE the two controls, deliberately — *"the moment a student most
needs to have read it is the moment before they press Advance"*. It is below them
now. Still on the surface, still permanent, still 18px, and it is 05-11 item 49.

### The probe: row 103e was green over a reversed lane

Recorded in full under PROBE BB below. The first draft sliced the `[C14.2]`
block and scanned it for `order:` and a reversed direction. `.ld-list` turns out
to be declared up in `[C14]` beside the frame, and only `.ld-row` is in
`[C14.2]`. A lane set to `row-reverse` ran **1216 passed, 184 of 184, exit 0**.

## `[C14.1]`'s 26vh → 32vh, with the sweep

The paragraph that shipped 26vh ends *"a dial that looks unnecessary after a
rearrangement is a dial to re-measure, not one to turn off"*. Its stated purpose
was that a looser bound puts Advance off the bottom of a laptop — and Advance is
above the scroller now, so that purpose is held structurally. Re-measured against
what the dial actually bounds:

| `.fg-sides` | @1920x1080 box | @1366x768 box | Advance @1080 / @768 |
|---|---|---|---|
| 26vh | 714/281/995 | 614/200/814 | 656 / 556 |
| 30vh | 714/324/1038 | 614/230/845 | 656 / 556 |
| **32vh** | **714/346/1060** | 614/246/860 | **656 / 556** ← shipped |
| 34vh | 714/367/1082 | 614/261/875 | 656 / 556 |
| 40vh | 714/432/1146 | 614/307/921 | 656 / 556 |
| 46vh | 714/497/1211 | 614/353/967 | 656 / 556 |

**Advance reads 656 and 556 in every row**, which is the argument for turning it
at all. 32vh is the largest setting whose box ends inside a 1080 fold, and it is
taken for a **property**: the cats team resources reading sits at 1042, outside a
26vh window and inside a 32vh one. FIGHT-09 asks that what remains to spend is
unambiguous *at a glance*, and a glance does not include a scroll.

**At 1366x768 every setting overshoots the fold and 26vh did too** — 814 before,
860 after. Stated rather than left to be found on a laptop.

## The gate rows, old claim and new claim

| row | what it asserted | what it asserts NOW | its reading |
|---|---|---|---|
| **92** | the fight harvest with its dressing asserted | **unchanged**, and re-measured: 467 against a floor of 116 | 467 strings, view followed, 2 declarations standing, 3 buttons disabled, 12 shapes, retarget half made, 3 lit |
| **92b** NEW | — | **the same page with the sidebar OPEN**, harvested and scanned again, toggle driven both ways, and the row names the half this page cannot see | 467 open against 467 closed; one press opened it and a second shut it; 22 projection leaves, 22 of 22 in the open harvest |
| **93b** | three roots, three floors | **untouched** — the toggle rides `#views`' existing delegated pair, so there is no fourth root. Recorded as a consequence of the placement | `#fightbar`=3, `#board`=3, `#views`=2 |
| **94b** | every `data-k` unique, floor 120 | unchanged claim; the key space gained `pv/proj` | 150 keys, duplicates `[]` |
| **103** | the switch moves the page and nothing else | unchanged | byte-identical state across both presses; 0 `data-act`; 2 `data-vw` |
| **103b** | `#strip`/`#refband` in neither side of the switch, both inside `#board` | **claim TURNED.** The structural half stands unchanged and is what D-28 DEPENDS on; a **stylesheet half** is added: `[C15]` must carry BOTH the rule that takes the projection off the default fight view and the rule that brings it back | strip in switch=false, in board=true; slices switch 700 / band 4471 / board 356 / `[C15]` 18724; hide rule=true show rule=true |
| **103c** | the view follows a fight across both edges | unchanged | seven steps + an undo |
| **103d** NEW | — | **PROJ-05's new reading.** One press opens it; the projection's own figures are present AND MOVE when a real op moves the pool; a second press shuts it; the whole state is byte-identical across both | closed/open/shut all three channels; 24 leaves that moved; `data-pv`=1 of which `data-vw`=0; 0 `data-act`; 0 disabled |
| **103e** NEW | — | **the lane is above the round being played and its newest card is its last child** — both pages' child order, the band's markup, and the three rule bodies read BY NAME for `order:` and a reversed direction | `#app` order `[topbar, views, ledger, fightbar, board, selftest-report]`; markup 3864 < 4049; rule bodies 52/141/351, order=false reverse=false; cards `["1","2"]`, newest last |
| **103f** NEW | — | **a card shows the board AND the actions**, compared against the live build's own words | 62 board leaves, 8 action leaves; the faction "Cats", the unit "Cat 1" and the action "Slash" all found, and the action half reads *"Cat 1 uses Slash on Mech 1. Shield took 1 of the 1. Health took 0. Nothing was spare."* |
| 95, 95b, 96–102, 104–104f, 106–106j | plans 05-13/14/15/16's | **re-read, unchanged** | all green |

## The browser readings — real Chrome and real Edge, 1920x1080 and 1366x768

**Every layout number below is byte-identical in Chrome and in Edge at both
sizes.** Not one figure in this change differs between the two browsers.

Driven with **three resolved rounds and twelve declarations a round** (and five
rounds for the overflow cell):

| reading | @1920x1080 | @1366x768 |
|---|---|---|
| `#views` / `.fg-band` / `#board` / `#fightbar` / `#ledger` left/width | 152/1600 | 14/1322 |
| `#ledger` bottom → `#fightbar` top | 417 → 435 | 409 → 427 |
| the lane's box, and one card | 1174×242, card 340×238 | 968×149, card 340×115 |
| lane, three rounds: scrollWidth/clientWidth, scrollLeft | 1174/1174, 0 | 1048/968, **80 of 80** |
| lane, five rounds: scrollWidth/clientWidth, scrollLeft/max | 1752/1174, **578/578** | 1752/968, **784/784** |
| **Advance, from the top of the document** | **656 of 1080** | **556 of 768** |
| `.fg-sides` top/height/bottom, three rounds in the lane | 714/346/1060 | 614/246/860 |
| battlefield / team resources / picker rows, tops | 326 / 555 / 603 | 225 / 455 / 503 |
| the Cats and Mechs battlefield clusters, lefts | 173 / 953 | 35 / 676 |
| `#strip` display, fight view: closed → open → closed | none → grid → none | none → grid → none |
| the sidebar box when open | 1531,121 360×779 `fixed` z30 | 977,113 360×641 `fixed` z30 |
| the sidebar reads | `Cats \| ≈9 turns to wipe Mechs \| 27 health ÷ 3 per turn …` | same |
| `#strip` top @scroll, BUILD view | 301 / 267 / 261 / 247 | 293 / 259 / 253 / 239 |
| `#refband` box, both views | 1600×120 | 1322×120 |
| `#board` top mid-fight (board view) | 301 of 1080 | 293 of 768 |
| grid at 24 a side, rows / buttons | 24/24, 72/72 | 24/24, 72/72 |

**The lane is scrolled to its end and the newest card is whole in view at every
depth measured**, which is the reading that says `[S06.8]`'s scroll assignment
reached the right axis: the line it replaced wrote `scrollTop`, which on a flex
row moves nothing at all and would have left round one on screen.

### Two harness corrections, each recorded at its site

- **`[C01]` sets `html{scroll-behavior:smooth}`, so a `scrollTo` must be AWAITED
  before the box is read.** Measured: asked for 28, `window.scrollY` read back 0
  and the box had not moved a pixel, on a document 1058px tall with 290px of
  scroll available. It is `openDialogs`' recorded lesson arriving through a sixth
  door. Check 18's claim is additionally made **absolute** by adding the settled
  offset back, because the two browsers do not agree about where `scrollTo(0,0)`
  lands — Edge read 86 at 1920x1080 on one run, which is plan 05-16's recorded
  disagreement arriving from the other direction.
- **Playwright's stability wait never settles on a smoothly scrolling target.**
  Edge at 1366x768 timed out after 58 stability retries on a button that was on
  the screen the whole time. One browser at one size, and exactly the kind of
  flake that gets "fixed" by deleting a check. The page is put back at the top
  and the animation awaited before the first real click on a control inside a
  scroller.

### The browser cells, turned and added

| cell | what happened |
|---|---|
| **4b** | unchanged and still passing — the band is the frame and the frame did not move |
| **4c** NEW | D-28's first sentence, measured: `#fightbar` and `#ledger` are each the FULL band width and the ledger's box is ABOVE the bar's, read as geometry rather than as DOM order |
| **6b** | **TURNED.** It asserted the grid's box is inside the viewport — true beside a column, false under a lane at 768 (614/246/860). It now asserts the box BEGINS on screen and can be brought wholly into view by a real page scroll, **driven** |
| **10 / 10b** | **SCOPE TURNED to the build view only.** In the fight view a `display:none` element still reports `position: sticky` and a rect of zeros, and zeros satisfy `top >= 0` — the cell would have passed in both browsers at both sizes over a projection that had left the page |
| **10c** NEW | the projection OFF, a real click, a real fixed box wholly inside the window, both aria attributes, a visible tick, and a second click that puts it away |
| **10d** NEW | what the sidebar says is **CURRENT** — it moves when a real op moves the pool it is derived from. A copy would pass every other clause and stand still on this one |
| **10e** NEW | `#refband` still has a real box in the fight view: REF-03 did not go with the projection |
| **17 / 17b / 17c** NEW | three rounds with `[12,12,12]` declarations; every card shows board AND actions; the lane is a row with `order` 0 on every card, the newest is the RIGHTMOST and whole in view without scrolling |
| **18 / 18b** NEW | Advance above the fold at page scroll zero and enabled; the round, the lane, the battlefield, the team resources and the picker rows all have a real box |
| **19** NEW | five rounds overflow the lane sideways, it is scrolled to its maximum, and the newest card is whole in view there |

## The probes

**Every probe was run AFTER the commit it tests, recorded verbatim, and reverted
by `cp` from a scratchpad snapshot. `git checkout --` was never used, and
`git status --short` read clean after each.**

### PROBE BB — the lane reversed, and the row written for it was GREEN

**Applied:** `.ld-list` set to `flex-direction:row-reverse` — the newest card at
the wrong end of the lane, with every DOM-order clause in row 103e still true.

**First reading, against the row as first written:**

```
1216 passed, 0 failed
interaction gate: 184 of 184 checks passed
EXIT=0
```

**The row was spotlessly green over the exact defect it was written for**, and
the cause is a slice: the draft sliced `[C14.2] THE LEDGER` and scanned it, which
reads like the right block and is not — `.ld-list` is declared up in `[C14]`
beside the frame and only `.ld-row` is in `[C14.2]`. Row 103e now reads three
**rule bodies** by name (`#ledger`, `.ld-list`, `.ld-row`), each floored on being
FOUND, because a rule body that came back empty carries no property and would
pass this row by not existing — which is precisely how the first draft passed.

**Re-run against the corrected row:**

```
FAIL  interaction gate :: 103e. THE LANE OF EARLIER ROUNDS IS ABOVE THE ROUND BEING PLAYED ...
      #app child order=["topbar","views","ledger","fightbar","board","selftest-report"]
      | #ledger at 2, #fightbar at 3
      | in the band's markup, #ledger at 3864 and #fightbar at 4049
      | rule bodies read, chars: #ledger=52 .ld-list=149 .ld-row=351,
        carries order:=false carries a reversed direction=true
      | cards in the lane=["1","2"] newest is the last child=true
interaction gate: 183 of 184 checks passed
EXIT=1
```

**Every DOM-order clause reads TRUE in that evidence line and the row is red
anyway**, which is the measurement that says the stylesheet half is carrying the
claim alone.

### PROBE BC — `[C15]`'s show rule deleted (a projection nobody can reach)

**Applied:** `#app[data-view="fight"][data-proj="1"] #strip{…}` removed, leaving
only the rule that hides it.

```
1216 passed, 0 failed
FAIL  interaction gate :: 103b. #strip AND #refband ARE IN NEITHER SIDE OF THE SWITCH ...
      ... | [C15] carries D-28's hide rule=true and its show rule=false
interaction gate: 183 of 184 checks passed
EXIT=1
```

**103b reddens by name and 103d stays GREEN**, which is the split this change was
designed around and worth reading rather than assuming: 103d drives the
attribute and reads the projection's leaves, and in a page with no stylesheet
both are unaffected by a missing CSS rule. The stylesheet clause is 103b's alone
in the node gate; browser check 10c is the other instrument.

### PROBE BD — the sidebar that stops repainting, in two stages

**Stage one, applied:** `syncProjection` (`[S06.3]`) made to return early while
`#app[data-proj] === '1'` — the plausible optimisation, "do not repaint a panel
that was painted when it opened".

```
1216 passed, 0 failed
interaction gate: 184 of 184 checks passed
EXIT=0
```

**Green, and the reason is a fact about the surface worth recording:**
`[S06.9]`'s live fight reading ALSO writes into `#strip` during a fight, so the
panel stayed current through the other renderer. A one-region probe was probing
one of two writers.

**Stage two, applied:** the same early return added to `syncBoardFight`'s
`.dc-live` fill as well.

```
FAIL  interaction gate :: 103d. PROJ-05 UNDER D-28 ...
      the view when the fight started=fight
      | closed={"proj":"","pressed":"false","expanded":"false","cls":"pv-btn"}
      | after ONE press={"proj":"1","pressed":"true","expanded":"true","cls":"pv-btn pv-on"}
      | after a second={"proj":"","pressed":"false","expanded":"false","cls":"pv-btn"}
      | the projection renders 24 leaves and they DID NOT move when the pool moved
      | state byte-identical across press one=true and across press two=true
      | data-pv controls=1 of which also data-vw=0 | data-act under #views=0
      | disabled controls under #views=0
interaction gate: 183 of 184 checks passed
EXIT=1
```

**The row reddens on exactly one clause and names it**, with every other reading
still printed — which is what a row that PRINTS its reading buys over one that
asserts a string (probe AU's ruling, held here).

### PROBE BE — the withPreservedFocus hazard, driven

**Applied in the shell AND in the stub together** (probe AK's discipline, because
the drift rule binds both ways): `#ledger` moved INSIDE `#board`, above the
columns — the exact arrangement plan 05-06 measured and rejected.

```
FAIL  interaction gate :: 103e ...
      #app child order=["topbar","views","fightbar","board","selftest-report"]
      | #ledger at -1, #fightbar at 2
      | in the band's markup, #ledger at -1 and #fightbar at 3865
interaction gate: 183 of 184 checks passed   EXIT=1
```

And the hazard itself, measured directly with a fight running and two rounds in
the lane — the first `[data-k]` match scoped to `#board`, which is what `keyed()`
takes and what `withPreservedFocus` restores onto:

```
with the ledger moved INSIDE #board   ledger inside #board=true  | [data-k] under #board=90
                                      FIRST match key="cats/ap-" | inside #ledger=false
                                      [data-k] inside #ledger=0  | ledger rows=2
the SHIPPED arrangement               ledger inside #board=false | [data-k] under #board=90
                                      FIRST match key="cats/ap-" | inside #ledger=false
                                      [data-k] inside #ledger=0  | ledger rows=2
```

**The dead-clone-first-match defect does not return, and the measurement says
which half is holding it off.** Plan 05-06's sibling placement is the braces;
check 94's rule that a ledger row carries **no `data-k` at all** is the belt, and
it is the belt that is load-bearing — the first scoped match is a live board
control even with the region moved inside `#board`. The lane's move did not go
near either.

### PROBE BF — the round controls put back below the grid

**Applied:** `fgBuildRound` made to `root.appendChild(row)` again, which is the
arrangement D-28's lane shipped over.

```
node tests/selftest-node.cjs      1216 passed, 0 failed, 184 of 184, EXIT=0
tests/browser-checks.mjs          166 passed, 4 failed

FAIL  chrome 1920x1080: 18. with three rounds in the lane the Advance control is ABOVE THE FOLD ...
FAIL  chrome 1366x768:  18. ...
FAIL  msedge 1920x1080: 18. ...
FAIL  msedge 1366x768:  18. ...
      {"scrollY":0,"vh":1080,"advance":{"top":1158,...},"roundHead":{"top":656,...},
       "sides":{"top":713,"height":346,"bottom":1059},...}
```

**The node gate is spotlessly green over it and check 18 reddens in all four
combinations and nothing else does.** That is the whole argument for the browser
suite existing: a control 78px off the bottom of a projector is invisible to a
harness with no layout engine, and it is the fourth time this phase has measured
that from a different direction.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 2 — missing critical functionality] The Advance control was below the fold at both viewports**

- **Found during:** the first browser measurement, immediately after the layout commit.
- **Issue:** D-28's lane costs vertical space where the right-hand column cost
  none. With `.fg-round-acts` still appended below `.fg-sides`, Advance measured
  **1094 of 1080** and **951 of 768**, in both browsers. The control that ends a
  round has to be reachable without scrolling; this is the defect class the phase
  has fixed three times.
- **Fix:** `.fg-round-acts` moved onto `.fg-round-head`'s line with
  `margin-left:auto`; `.fg-round-fig` added so the label and the figure keep
  their baseline; `[C14.1]` carries the before/after readings; `fgRest`'s
  removal order re-read and confirmed still correct.
- **Files modified:** `cats-vs-mechs.html` (`[C14.1]`, `[S06.7]`).
- **Commit:** `eacbdca`.

**2. [Rule 1 — bug] Row 103e was green over the defect it was written for**

- **Found during:** PROBE BB.
- **Issue:** the row sliced the `[C14.2]` block for `order:` and a reversed
  direction. `.ld-list` is declared in `[C14]`, so a `row-reverse` lane passed.
- **Fix:** three rule bodies read by name, each floored on being found.
- **Files modified:** `tests/selftest-node.cjs` (row 103e).
- **Commit:** `67a33ff`.

**3. [Rule 1 — bug] Four comments spelled a banned word stem**

- **Found during:** the first gate run after the layout commit.
- **Issue:** `PROJ-06 VIOLATION … [rating]: rating` at four sites — the phrase
  *"the developer, operating the real artifact"*. `operating` carries the stem
  the dev gate refuses document-wide. The same class of failure plan 05-12
  recorded from the author's side, arriving through an ordinary English word.
- **Fix:** reworded to *"the developer, at the real artifact"* at all four sites.
- **Files modified:** `cats-vs-mechs.html`.
- **Commit:** `2253bc4`.

**4. [Rule 3 — blocking] Two browser-harness corrections for smooth scrolling**

- **Found during:** the browser-check run.
- **Issue:** (a) `[C01]`'s `html{scroll-behavior:smooth}` makes `scrollTo` an
  animation, so a synchronous `getBoundingClientRect` after it reads the old box
  — asked 28, got 0, box unmoved, on a page with 290px of scroll available; (b)
  Playwright's stability wait never settles on a smoothly scrolling target and
  timed out after 58 retries in one browser at one size.
- **Fix:** the two new scroll readings are `async` and awaited; check 18's claim
  is made absolute by adding the settled offset back; a settle is taken before
  check 11's first click. All three recorded at their sites.
- **Files modified:** `tests/browser-checks.mjs`.
- **Commit:** `b015b3c`.

### A dial turned, with its sweep, and the reason it was this plan's to turn

`[C14.1]`'s 26vh → 32vh is not a deviation and not an auto-fix — it is the
instruction that dial's own comment ends with, followed. Its stated purpose was
held by the number and is now held structurally, so it was re-measured against
what it actually bounds, over six settings at two viewports, with Advance's top
printed beside every row to show the dial no longer decides it. The property it
was taken for is named: FIGHT-09's team resources reading moves inside the
window. **`.ld-list`'s 46vh was NOT turned — it was retired with the axis it
bounded, and its whole four-plan history is kept verbatim.**

### Corrections to the orchestrator's own premises, recorded rather than worked around

1. **The lane's action lines did not have to be built.** The brief says the lane
   must show state AND actions; `ldDidInto` has drawn the actions since plan
   05-08. What was missing was a row asserting it, and row 103f is that.
2. **FIGHT_FLOOR did not move.** The brief anticipated it would, from two causes.
   Neither moves it, for reasons written into the floor's history entry.
3. **The toggle needed one new id, not two.** The brief says "the toggle control
   and any sidebar/popover root are new ids"; there is no new root because the
   sidebar is `#strip`, which is the decision the whole change turns on.

## Known Stubs

None. `#proj-toggle` is painted by `[S06.10]` on the first frame and on every
frame after it, is never disabled, and is undisplayed in the build view by a
`[C15]` rule rather than by an empty state.

## Threat Flags

None. No network endpoint, no auth path, no file access and no schema change:
this change moves two regions, adds one button that writes one attribute on
`#app`, and turns four gate rows. Nothing new is written into any slice — checks
103 and 103d both read the whole state back and require it byte-identical across
every press. **Zero packages installed**: Playwright was resolved from the
existing dev-only install through `PLAYWRIGHT_DIR`, and every driver used lives
in the scratchpad and is not committed.

## Commits

| # | Commit | What |
|---|---|---|
| 1 | `2253bc4` | the shell, `[C14]`, `[C14.2]`, `[C15]`, `[S06.8]`, `[S06.10]`, `[S07.6]`, `#proj-toggle` with its `KNOWN_IDS` entry and stub node |
| 2 | `e7d3367` | 103b turned; 92b, 103d, 103e, 103f added; `FIGHT_FLOOR` re-measured |
| 3 | `eacbdca` | the round controls onto the round's line; `.fg-sides` 26vh → 32vh with its sweep; the lane's height query |
| 4 | `b015b3c` | browser checks 138 → 170, cells 6b and 10 turned |
| 5 | `67a33ff` | row 103e reads three rule bodies by name — PROBE BB's finding |
| 6 | `5bc8258` | 05-11's script (46 → 49 items, section G), `REHEARSAL.md` B3, `deferred-items` 3 and 4 |

## Self-Check: PASSED

Files:
- FOUND: `cats-vs-mechs.html`
- FOUND: `tests/selftest-node.cjs`
- FOUND: `tests/browser-checks.mjs`
- FOUND: `.planning/phases/05-fight-loop-playtest/05-11-PLAN.md`
- FOUND: `.planning/phases/05-fight-loop-playtest/deferred-items.md`
- FOUND: `.planning/REHEARSAL.md`
- FOUND: `.planning/phases/05-fight-loop-playtest/05-D28-SUMMARY.md`

Commits:
- FOUND: `2253bc4`, `e7d3367`, `eacbdca`, `b015b3c`, `67a33ff`, `5bc8258`

Gates:
- `node tests/selftest-node.cjs` — **1216 passed, 0 failed**, interaction gate **184 of 184**, stub-drift **115 shell ids**, `FIGHT_FLOOR` **116** with the fight harvest at **467** closed and **467** open, exit **0**
- `node tests/browser-checks.mjs` — **170 passed, 0 failed** with `PLAYWRIGHT_DIR` set; **exit 0 with the SKIP line** without it
- `counter|balanc|rating` 0; `url(` 0; `innerHTML` 0; `createElementNS|<svg` 0; one `<script>`; one `<style>`
- `git status --short` clean after every probe revert
