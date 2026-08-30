---
phase: 05-fight-loop-playtest
plan: D29
subsystem: render+gate
tags: [d-29, redirect, s06-12, c14-5, s06-7, s06-8, tooltips, data-tsay, layer-c, fight-floor, ux-02, compact-at, browser-checks]

requires:
  - phase: 05-fight-loop-playtest
    plan: D28
    provides: "the horizontal lane whose prose D-29 replaces, rows 92b/103d/103e/103f, FIGHT_FLOOR 116 and the 170-cell browser suite this one extends"
  - phase: 05-fight-loop-playtest
    plan: 16
    provides: "FIGHT_FLOOR's two-axis derivation method — rosters trimmed BEFORE startFight, each side varied separately — which this plan follows and adds one instruction to"
  - phase: 05-fight-loop-playtest
    plan: 15
    provides: "[S06.11]'s proof that a render sub-region may CALL the board's token machinery across the shared IIFE scope, and [C14.4]'s measured 12px/3px --tok override"
  - phase: 02-allocation-surface
    plan: 01
    provides: "[S06.1]'s styleFor / labelFor / safeShape / safeColor / makeToken / syncRow / COMPACT_AT — called here, never re-derived"
provides:
  - "[S06.12] THE SYMBOLIC READING — symMark, symQty and symDelta, the notation defined once and called from two surfaces"
  - "[C14.5] the .sym- rules, and the first `title` attributes this artifact has ever rendered"
  - "data-tsay, the FOURTH exemption channel: it REMOVES the student's fragment from a tooltip rather than skipping the attribute, so the artifact's half stays in Layer C"
  - "checks 100, 103f and 92 turned in the open; 107, 107b, 107c and 107d added. Interaction gate 184 -> 188"
  - "FIGHT_FLOOR re-derived 116 -> 130, with the harvest broken down by REGION and the cats/mechs symmetry shown to be two opposite asymmetries cancelling"
  - "browser checks 170 -> 182, cell 17b turned, with a DRIVEN HOVER that reads the prose back off the element a real mouse hit"
  - "deferred-items 5 CLOSED (this plan is the [S06.7] editor it was waiting for); items 6 and 7 added"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "a notation defined once in its own sub-region and CALLED by every surface that renders it, because a notation implemented three times is three things to keep in step"
    - "an exemption channel that SUBTRACTS a fragment from an attribute instead of skipping the attribute, so a scanner keeps reading the artifact's half of a sentence it cannot split across nodes"
    - "a marker that carries the WORD rather than the id, so the gate never re-derives what the region rendered"
    - "a browser cell that drives a real pointer and reads its claim off the element the HIT TEST returned rather than off the selector the file chose"
    - "a floor entry that breaks the harvest down by REGION, because two opposite one-string asymmetries can cancel into a symmetry that is right by accident"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D29-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/05-11-PLAN.md
    - .planning/phases/05-fight-loop-playtest/deferred-items.md
    - .planning/REHEARSAL.md

key-decisions:
  - "THE TOOLTIP IS SCANNED BY SUBTRACTION AND NOT BY SKIPPING, AND THAT IS THE WHOLE DESIGN. The three shipped exemption channels each mark a node whose WHOLE text is a student's word, which works because every line this artifact assembles is built one node per fragment. A TOOLTIP CANNOT BE SPLIT ACROSS NODES — it is one string on one attribute holding the artifact's words and the student's together. Read whole it reddens CI on a word ALLOC-10 promises a student they may use; skipped whole it takes 'took 1 of the 1' out of the only layer that can ever see it, because not one sentence [S06.8] or [S06.12] produces is a literal anywhere. So data-tsay carries the exact fragment the region inserted and harvestInto removes it. The one hole is named at the site rather than left to be found"
  - "THE MARKER CARRIES THE WORD AND NOT THE TOKEN ID, AND THE DIFFERENCE IS WHICH SIDE RE-DERIVES. An id would make the gate call labelFor to work out what the artifact rendered — a second derivation of a string that already exists, and one that answers WRONGLY for a type the vocabulary has since lost, which is ldTokenWord's recorded trap arriving in the scanner. The region says what it wrote; the harvest reads it back"
  - "UX-02 IS ANSWERED RATHER THAN WAIVED, AND THE DISTINCTION IS THE WHOLE OF IT. Nine sites in this file say 'never an icon, never revealed on hover, never a title= tooltip', and every one of them was written about a CONTROL'S LABEL. Not one control on this page has its name in a tooltip and none grew one. What hovers DESCRIBES is a reading already permanently on screen in the board's own notation — the type's shape, colour and glyph, with its quantity said by repetition or a count — so nothing is conveyed by hover ALONE. The same string goes to aria-label from the same variable, so a keyboard and a screen reader are not second-class. Three paragraphs are kept verbatim under a line saying what stopped being true about them"
  - "A QUANTITY OF ZERO DRAWS D-21's COMPACT FORM, AND THAT IS ONE CASE RATHER THAN A SECOND RULE. syncRow at zero empties the row, and an empty node is not a reading — but 'Health took 0' is a fact this file states even when it is nothing, because three facts of a fixed shape are a reading a room learns once. So symQtyRow asks syncRow for the compact form at COMPACT_AT and writes the count. THE THRESHOLD THAT DECIDES REPETITION VERSUS A COUNT IS STILL COMPACT_AT AND ONLY COMPACT_AT. It also gives the compaction axis a new direction the floor entry records: a SMALLER number can now be MORE strings"
  - "SENTENCES STAY WHERE A SYMBOL CANNOT CARRY THE MEANING, AND THE LIST IS WRITTEN DOWN RATHER THAN LEFT TO TASTE. The round number, the round's note, every faction and unit name, 'Cat 2 uses Slash on Mech 1', 'Nobody declared an action for this round', 'Nothing was spare', 'no cost', 'standing again', the requirement sentence and the departed-term refusal are all still text. What became symbolic is QUANTITIES and the type names inside them — which is not an icon standing in for a word but the notation this board has used since Phase 2, arriving on the surface that reads the board back"
  - "THE BATTLEFIELD WAS NOT CHANGED AND THE INCONSISTENCY IS DELIBERATE. [S06.11] has been symbols-first since plan 05-15 with a permanent visible label beside each row, so one surface on the fight tab reads 'Health ...' and another reads '...' with the word on the hover. Removing those labels would take the LAST place on the fight tab where a token type is named in text — and 05-11 item 50 asks precisely whether a room can read a square as health without ever being told. Removing the thing the answer depends on before the question is asked is not a tidy-up. Recorded as deferred-items item 7"
  - "FIGHT_FLOOR'S NEW SYMMETRY IS TWO OPPOSITE ASYMMETRIES CANCELLING AND THE ENTRY SAYS SO. A cat and a mech both cost 38 where they cost 29 and 30 — which reads like a simplification and is not. Broken down by region: a cat is ledger 6 + fightbar 14 + board 18, a mech is ledger 5 + fightbar 15 + board 18. The lane costs a cat one more because a shipped cat has shield 0 and draws the zero form; the grid costs a mech one more because the drive's retarget lights the OPPOSING side. A plan reading only the totals would conclude the two sides cost the same and be right by accident, so the method's instruction to vary each side separately stands and the breakdown is in the entry"

patterns-established:
  - "a probe whose expected finding is a RED and whose THIRD stage finds the row's real gap: BG stage one reddened rows 92/92b on a planted word, stage two blinded both channels and 107d caught it, stage three blinded only `title` and 107d stayed GREEN on the accessible name"
  - "a probe that finds a row reading only ONE of a region's two primitives: BI replaced symMark's makeToken with a hard-coded health token and the whole suite ran 188 of 188 over every requirement line drawing the wrong mark"
  - "a browser cell that goes red three times and each red is a finding rather than a flake: the first reading is scrolled off the lane, the page is 28px down from a previous cell, and a card is a 115px window over 1174px of content"

requirements-completed: []

duration: 210min
completed: 2026-08-29
---

# Phase 05 D-29: Symbols First, Prose on Hover Summary

**D-29's three sentences are built and every gate row that watched the words
they moved was turned in the open. The ledger lane draws the board's own tokens
instead of spelling "Cat 1 — Health 3, Shield 0"; a cost on an action button is
`−` and the action-point token instead of "1 Action Points"; and the prose that
rendered yesterday is the mouse-over description today, written to `aria-label`
from the same variable so a keyboard reaches it too. THE SENTENCES ARE STILL
SCANNED — proved by planting a comparative word in a tooltip and watching the
run redden, and by blinding the scanner and watching the same word go unseen.
Three probes each found something the suite was green over.**

## The gate, before and after

| | before (post-05-D28) | after |
|---|---|---|
| suite | 1216 passed, 0 failed | **1216 passed, 0 failed** |
| `SUITE_FLOOR` | 1186 | 1186 — **not moved**; this change adds no `[S09.*]` row |
| interaction gate | 184 of 184 | **188 of 188** (+4: 107, 107b, 107c, 107d) |
| stub-drift | 115 shell ids | **115 — unchanged, no id added** |
| `#app` (setup) | 128, floor 117 | **128 — unchanged.** No setup surface was touched |
| `#app` (fight) | 467, `FIGHT_FLOOR` 116 | **590**, `FIGHT_FLOOR` **130 — re-derived and MOVED** |
| `#app` (fight, sidebar open) | 467 | **590** |
| dialogs | 145 across 4 roots, floor 138 | **145 — unchanged.** D-29 is scoped to the fight surface |
| proposal pane | 60, floor 23 | **60** |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 8048 literals, 0 hits | **8139 literals**, 0 hits |
| no-writer gate | 58 ops, 26 arms, 497 records | unchanged |
| perf | 100 commits in 7 ms (budget 50) | 100 commits in **6 ms** |
| **browser checks** | 170 passed, 0 failed | **182 passed, 0 failed** |

`node tests/selftest-node.cjs` exits 0.
`PLAYWRIGHT_DIR=... node tests/browser-checks.mjs` reports **182 passed, 0 failed**, exit 0.
Run with Playwright unresolvable it still prints the SKIP line and exits **0** — re-verified.

**`counter|balanc|rating` prints 0, whole document. `url(` 0. `innerHTML` 0.
`createElementNS|<svg` 0. `text-wrap` 0. One classic `<script>`, one `<style>`.
`DEFAULTS.cats.ap` untouched (D-25) — the whole of `[S01] DATA` diffs EMPTY
across all eight commits.**

## What D-29 asked for, and what each sentence became

> show this using the symbols, rather than text

`[S06.8]`'s past board states, split facts, shortfall line, unlanded-term lines,
hand rulings and what-changed panel are symbolic. A card now reads

```
Cat 1  ●●●   0×▪        (three health tokens; a shield of zero, in D-21's compact form)
```

where it read `Cat 1 — Health 3, Shield 0.` **Every symbol comes through
`styleFor` / `labelFor` / `makeToken` / `syncRow`, called across `[S06]`'s single
function scope** — the same reuse `[S06.11]`'s banner argues at length, so a type
a student invented, styled and renamed appears in the lane exactly as they
authored it and compaction is `COMPACT_AT` because the same `syncRow` decides it.

> instead of showing cost in 1 Action Points, show it as - then the symbol for
> the action points. Same with the cost of other skills.

`[S06.7]`'s `fgCostParts` returns one node: `−` and the type's own tokens. A
button reads `Slash − ▲`. Two action points is two triangles; twelve is `12× ▲`.
Requirement lines took the same treatment on the type's name — *"Slash needs 2 ▲
of 27. Requirement met."* — and keep their two numbers as digits, because a
requirement is a NEED and a HAVE and a pile of tokens does not say which is
which.

> mouse over tooltip for the text description

Every symbolic reading carries `title` **and** `aria-label`, written from ONE
variable, on a node with `role="img"`. The picker's cost tooltip is the exact
string the button printed before D-29 — *"1 Action Points"* — assembled from the
same two pieces in the same order, so a student who read it last week and hovers
it today is told the same thing rather than a paraphrase.

## The one thing that could have gone wrong invisibly, and the three probes

Words moving out of `textContent` into an attribute leave a scanner that reads
only `textContent` — and a scanner that cannot see a surface reports it **clean
forever**. That is wave 1's lesson in its attribute edition and it was the single
largest risk in this change.

**Half the answer was already in the file and saying so is the honest part.**
`LABEL_ATTRS` has carried `'title'` since the Layer C walk was lifted out over
the dialog roots, so a tooltip is harvested today with no change at all. The
brief's instruction to "extend the harvest to read tooltip text" **was already
satisfied when this plan opened it**, and the probes measure that end directly
rather than trusting the reading.

**The half that was missing is the one ALLOC-10 creates**, and it is
`data-tsay`. See the key decisions above; the mechanism is four lines in
`harvestInto` and about forty of comment.

## FIGHT_FLOOR — re-derived, and 116 → 130

Rosters trimmed **before** `startFight`, each side varied **separately**, which
is the method the floor's own comment prescribes — and this entry adds the
harvest broken down by region, because the totals alone hide what follows.

```
cats varied, mechs at 3   total  #ledger #fightbar #board  delta      mechs varied, cats at 9
  2 cats                    320     71       97      144                2 mechs  548 108 180 252
  3 cats                    358     77      111      162    +38         3 mechs  586 113 195 270  +38
  4 cats                    396     83      125      180    +38         4 mechs  624 118 210 288  +38
  5 cats                    434     89      139      198    +38         5 mechs  662 123 225 306  +38
  6 cats                    472     95      153      216    +38         6 mechs  700 128 240 324  +38
  9 cats                    586    113      195      270    +38 x3
```

| cats × mechs | 38c + 38m + 130 | measured |
|---|---|---|
| 2 × 2 | 282 | 282 |
| 2 × 3 | 320 | 320 |
| 3 × 3 | 358 | 358 |
| 4 × 4 | 434 | 434 |
| 6 × 6 | 586 | 586 |
| 9 × 3 | 586 | 586 |
| 9 × 6 | 700 | 700 |

**A cat and a mech both cost 38 now, and that is two opposite asymmetries
cancelling rather than a simplification** — a cat is `ledger 6 + fightbar 14 +
board 18`, a mech is `ledger 5 + fightbar 15 + board 18`. The lane costs a cat
one more (a shipped cat has `shield: 0` and draws the zero form; a shipped mech
has `shield: 3` and does not); the grid costs a mech one more (plan 05-16's own
finding: the drive leaves a retarget half made on the CATS side, so the MECHS
shapes light and each says so in a real node). A plan reading only the totals
would conclude the two sides cost the same and be right by accident.

**One board is off the table and says so:** `1 × 1` measures 196 against a model
of 206, and the ten strings are the two rulings this drive cannot make on it —
it rules the second cat dead and drives the second mech to zero health, and a
one-unit roster has no second unit on either side. It clears the floor by 66.

**The compaction axis now points BOTH ways**, which is this entry's one new
finding about an old axis. Plan 05-16 recorded that a bigger number is more
strings; a quantity of ZERO also draws a count now. Measured on a 4-cat, 3-mech
board with the cats' health varied: `0 → 397, 1 → 398, 3 → 396, 11 → 396,
12 → 408, 17 → 411, 30 → 410`. **The shipped reading is the minimum of that
sweep**, which is the only thing the floor turns on.

**The dressing costs exactly what it cost before, and that is the check on the
whole re-measurement.** Undressed boards, same drive: `2×2 = 264, 4×3 = 372,
5×3 = 408, 4×4 = 408` — 36 a unit over a constant of 120, so the dressing is
worth **+2 a card and +10 to the constant**, byte-identical to plan 05-16's
figure. The dressing's shape did not change; only the base under it moved.

**One instruction is added to the method rather than replacing it:** a plan that
moves prose ONTO or OFF an attribute re-measures this constant too, not only one
that adds a surface — because D-29 moved no surface at all and moved this number
by 14.

## The gate rows, old claim and new claim

| row | what it asserted | what it asserts NOW | its reading |
|---|---|---|---|
| **92** | a type the student renamed and one they invented are DRAWN and ABSENT from the harvest, by string EQUALITY | **claim WIDENED to a SUBSTRING test.** A student's word now reaches the page INSIDE an assembled sentence on an attribute; an equality test would have read zero over a harvest full of *"Cat 1 — Ward 2."* and reported the exemption load-bearing while it did nothing | 590 strings against a floor of 130; both words drawn on 12 labels each and harvested 0 times |
| **92b** | the same page with the sidebar open | unchanged claim, re-measured | 590 open against 590 closed |
| **100** | renaming a token type moves an ALREADY-DRAWN ledger row's TEXT | **claim TURNED.** It reads the TOOLTIP channel, and reads it BETWEEN the two renames — which found that the old *"the ledger moved"* clause was satisfied by the ACTION rename all along. The new word is asserted ABSENT from the text | RED first: *"the ledger moved=true and says the new token name=false"* |
| **103f** | a card names the faction in TEXT and shows the actions | **board half TURNED.** Token nodes drawn, symbolic readings present, the two durability types in the TOOLTIPS and in NEITHER leaf. As written it would have passed for ever over the exact reading the screenshot was of | faction named; token nodes and readings counted; text names neither type, tooltips name both |
| **107** NEW | — | **every symbolic reading in the lane**: `role="img"`, a non-empty title, an aria-label EQUAL to it, and a token drawn — counted as FAILURES across all of them, not sampled. The split's sentence read back verbatim off the tooltip | 53 readings across 2 cards, 0 failing; the split reads *"Ward took 1 of the 1."* |
| **107b** NEW | — | **a type invented, renamed and restyled arrives as authored on BOTH surfaces and through BOTH of `[S06.12]`'s shapes** — symQty on the lane and the cost, symMark on a requirement line | `tok--tri tok--coral` + 🔥 in the lane; `tok--hex tok--violet` + 💜 on the button and on the requirement |
| **107c** NEW | — | **a cost is U+2212 plus the type's tokens**, compacting at `COMPACT_AT` and at no second threshold, with the tooltip the exact pre-D-29 string | at 11: 11 tokens, 0 counts; at 12: 1 token, `12×`; sign `−`; text names the type nowhere |
| **107d** NEW | — | **THE ROW THE CHANGE TURNS ON.** A sentence in NO leaf of `#app` is in the harvest; the artifact's half of a marked tooltip is in it; the student's half is not; and `LABEL_ATTRS` names BOTH channels | 693 harvested against 630 leaves; `" took 1 of the 1."` present, `"Ward took 1 of the 1."` absent, `"Ward"` in 0 records |
| 93b, 94, 94b, 95–99, 101–104f, 106–106j | plans 05-12 to 05-D28's | **re-read, unchanged** | all green |

## The browser readings — real Chrome and real Edge, 1920x1080 and 1366x768

**Every D-28 geometry figure is byte-identical after this change** — the lane's
box, the card's box, Advance at 656 and 556, `.fg-sides` at 714/346/1060 and
614/246/860, the sidebar, the 24-a-side grid. Nothing moved. What is new:

| reading | @1920x1080 | @1366x768 |
|---|---|---|
| a lane card, window over content | 238px over 1174px | **115px over 1174px** |
| **a driven hover, and what the hit test returned** | 42×12, 3 tokens 12×12 → *"Cat 1 — Health 3."* | same |
| symbolic readings in the lane / with no box / with no token / spilling a card | 240 / 0 / 0 / 0 | 240 / 0 / 0 / 0 |
| a compacted count's font size | 18px | 18px |
| a picker cost: sign box / token box / sign size | 13×18 / 12×12 / 18px | same |
| the cost box's own text, and the type named in it | `"− ▲"`, false | same |

### The browser cells, turned and added

| cell | what happened |
|---|---|
| **17b** | **TURNED.** It counted LEAVES on both halves of a card — the right instrument for D-28's question and the wrong one for D-29's, because a card printing *"Cat 1 — Health 3, Shield 0"* has leaves too. It now reads the board half for token nodes, symbolic readings, the types in the TOOLTIPS and in NEITHER leaf |
| **20** NEW | **A DRIVEN HOVER.** The pointer is moved to the centre of a real reading's rendered box and the claim is read off the element `elementFromPoint` returned, which must be that reading, must match `:hover`, and must carry the prose on both channels |
| **20b** NEW | every reading in the lane has a real box, real tokens, a compacted count at 18px or above read off COMPUTED style, and none spills its card |
| **21** NEW | a picker cost is U+2212 plus the type's own token, both with real boxes, the prose on both channels, the type named nowhere in the button's own text |
| 4b, 4c, 6b, 10–10e, 17, 17c, 18, 18b, 19, and the rest | **re-read, unchanged, green** |

**What is NOT asserted, said plainly:** a native `title` tooltip is painted by
the operating system and is not in the DOM, so no automation in any browser can
read the yellow box itself. What IS driven is the half that can fail — that a
real mouse at a real position lands on the reading and that the browser has the
sentence to show.

## The probes

**Every probe was run AFTER the commit it tests, recorded verbatim, and reverted
by `cp` from a scratchpad snapshot. `git checkout --` was never used, and
`git status --short` read clean after each.**

### PROBE BG — a judgement word planted in a tooltip, in three stages

**Stage one, applied:** `ldSplitInto`'s health fact given `' took ' + hit.health
+ '. The ' + 'strong' + 'er side.'`. **Assembled from two literals on purpose**:
a whole-string plant is caught by Layer B before Layer C can see it, and this
probe is about Layer C. (Measured first with the word whole: Layer B caught it,
which is itself the confirmation that the source layers still work.)

```
FAIL  interaction gate :: 92.  ... [stronger] in "  took 0. The stronger side." (read from #app)
                                | [stronger] in "  took 1. The stronger side." (read from #app)
                                | harvested 590 strings from #app with a fight running (floor 130)
FAIL  interaction gate :: 92b. ... the same four hits
interaction gate: 186 of 188 checks passed          EXIT=1
```

**The gate sees the word, and the leading double space in the evidence is
`data-tsay` doing its job** — the type's name was taken out of the sentence and
the artifact's half was scanned.

**Stage two, applied:** `LABEL_ATTRS` cut to `['placeholder']` — the harvest
blinded to both attribute channels, with the plant still in place.

```
harvested 417 strings (was 590)
rows 92 and 92b: GREEN over the planted word
FAIL  interaction gate :: 47, 47e, 47f, 107d           EXIT=1
```

**Rows 92 and 92b went spotlessly green over a comparative word rendered on the
fight surface**, which is precisely the failure this whole design exists to
prevent, and **107d is the row that caught it**.

**Stage three, applied:** only `'title'` removed, `'aria-label'` left in.

```
harvested 522 strings
rows 92 and 92b: STILL RED  — [S06.12] writes the same sentence to aria-label
row 107d:        GREEN      — its "the sentence is in the scan" clause was
                              satisfied by the accessible name
interaction gate: 186 of 188                            EXIT=1
```

**That is a real gap and the probe is the only thing that would have found it.**
A plan dropping `title` from `LABEL_ATTRS` would take the tooltip out of the scan
and leave every scan in this file green on the accessible name alone. Row 107d
now reads `LABEL_ATTRS` and requires both channels by name — commit `29a0c57`.

### PROBE BH — `data-tsay` made to skip the whole attribute

**Applied:** the tempting simplification — a marked node's `title` and
`aria-label` skipped entirely instead of stripped, which is what the three
shipped channels do.

```
harvested 454 strings (was 590)
FAIL  interaction gate :: 107d ...
      | a sentence that is in no leaf at all — "Ward took 1 of the 1." — reaches
        the scan STRIPPED as "  took 1 of the 1."=false and RAW=false
interaction gate: 187 of 188 checks passed              EXIT=1
```

**107d is the ONLY row that reddens**, and it reddens on the clause that says
the artifact's own sentences left the scan while every student word stayed out.

### PROBE BI — a second compaction threshold, and a generic mark

**Stage one, applied:** `symQtyRow` given a local threshold of 6.

```
FAIL  interaction gate :: 107c ...
      COMPACT_AT read off the export=12 | at 11: 1 tokens, 1 count nodes ...
interaction gate: 187 of 188                            EXIT=1
```

**Stage two, applied:** `symMark`'s `makeToken(styleFor(state, tok))` replaced
with a hard-coded shipped health token — so every requirement line, every
shortfall line and every unlanded-term line drew the green square for whatever
type it named.

```
1216 passed, 0 failed
interaction gate: 188 of 188 checks passed              EXIT=0
```

**GREEN, over a generic mark on a type a student invented — which is the exact
failure row 107b exists for.** The cause: `[S06.12]` has TWO shapes of reading
and 107b read only one. `symQty` draws a quantity (the lane's readings, the
picker's cost); `symMark` draws one token standing for the type inside a
sentence, and nothing in the repository read it. Row 107b now puts the invented
type on an action as a REQUIREMENT and reads it back off the picker's own
reading line — commit `45f8573`. Re-run against the corrected row:

```
FAIL  interaction gate :: 107b ...
      | the same type as a REQUIREMENT, through symMark: tooltip="Zeal"
        token class="tok tok--sq tok--green" glyph=""
      | the requirement line reads "Slash  needs 2   of 0. Requirement not met."
interaction gate: 187 of 188                            EXIT=1
```

### PROBE BJ — the accessible name dropped

**Applied:** `symBox` writes `title` and no `aria-label` — the plausible
"a tooltip is enough" simplification.

```
FAIL  interaction gate :: 107 ...
      the lane carries 53 symbolic readings across 2 cards, of which 53 fail one
      of the four clauses
interaction gate: 187 of 188                            EXIT=1
```

**All 53, by name**, which is what counting failures rather than sampling one
node buys.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — bug] Two readings on one line ran together with no gap**

- **Found during:** the first real screenshot, after the browser suite was green.
- **Issue:** a unit's two pools are two `.sym` boxes inside one `<p>`. With only
  the inline whitespace between them, a cat at three health with no shield
  rendered as one unbroken run — `Cat 1 ●●●0×▪` — and a room has to work out
  where the first quantity ends and the second begins. That is the exact
  ambiguity the symbols were meant to remove, and **the whole suite was green
  over it in both browsers at both sizes**: no cell measures the space between
  two adjacent readings.
- **Fix:** `.sym + .sym{margin-left:10px}` in `[C14.5]`, on the ADJACENT SIBLING
  so a reading standing alone inside a sentence still sits tight against the
  words either side of it. Re-shot and re-read.
- **Files modified:** `cats-vs-mechs.html` (`[C14.5]`).
- **Commit:** `1f90036`.

**2. [Rule 1 — bug] Two comments spelled a banned word stem, twice**

- **Found during:** the first gate run after each of two commits.
- **Issue:** `[S06.12]`'s banner used the word ALLOC-10 exists to protect and the
  word the anti-ruling gate refuses, inside prose ABOUT those rules — the same
  class of failure plans 05-12 and 05-D28 each recorded, arriving through
  ordinary English for the third time. Four sites across two runs.
- **Fix:** reworded at every site with the meaning kept.
- **Files modified:** `cats-vs-mechs.html`.
- **Commits:** `6d71820`, `071e6bf`.

**3. [Rule 3 — blocking] Three browser-harness corrections for the driven hover**

- **Found during:** the browser-check run; cell 20 went red three times.
- **Issue:** (a) the first `.sym` in the DOM is at `x = -344` — with five rounds
  the lane is scrolled to its END and the oldest card is off the left; (b) the
  page is 28px down from cell 6b's real scroll, so the lane's box is above the
  window; (c) at 1366x768 a card is a **115px window over 1174px of content**, so
  not one reading is inside the lane's own box without the card being scrolled.
- **Fix:** the page is returned to the top and the animation awaited; the target
  is the first reading whose centre is inside the LANE, inside the WINDOW and
  inside its own CARD; and the newest card is scrolled to its first reading,
  which is what a student does. Each is recorded at its site.
- **Files modified:** `tests/browser-checks.mjs`.
- **Commit:** `894cee8`.

### Corrections to the orchestrator's own premises, recorded rather than worked around

1. **The harvest already read tooltip text.** The brief says to extend it;
   `LABEL_ATTRS` has carried `'title'` since plan 03.1-05. What was missing was
   the STUDENT-WORD channel on that attribute, which is a different problem with
   a different answer, and probe BG measures the original claim rather than
   assuming it.
2. **There is no transformation reading on the fight surface to convert.** The
   brief names "transformation readings" alongside costs and requirements. The
   fight surface prices three things — the picker's costs, the requirement lines,
   and the ledger's split / shortfall / unlanded-term readings — and the only
   transformation reading it renders is the unlanded-term line, which is turned.
   The action EDITOR's `xf` readings are a BUILD surface and are untouched, which
   is the same scoping D-27 made about the editor dialog.
3. **`FIGHT_FLOOR` moved, and the per-side figures became equal.** The brief
   anticipated a re-derivation; what it could not anticipate is that the equality
   is a coincidence of two opposite asymmetries, which is why the entry carries a
   regional breakdown the previous two entries did not need.
4. **deferred-items item 5 was closable by this plan.** Its stated owner is
   "whichever plan next edits `[S06.7]`", and this one does. `check 105` →
   `check 95b`, with the history kept and nothing renumbered.

## Known Stubs

None. Every symbolic reading is built and written on the same frame its surface
is painted, by the same fingerprints `[S06.7]` and `[S06.8]` already used;
nothing is placeholdered and no branch renders an empty box. The one node that
can render "nothing" is `fgCostParts`' `'no cost'`, which is a sentence chosen
deliberately over a blank and was already there.

## Threat Flags

None. No network endpoint, no auth path, no file access and no schema change.
This change adds render-time nodes and two attributes on them, writes one new
`data-*` marker read only by the dev gate, and stores nothing anywhere — every
symbol is derived at render time from the live vocabulary through the shipped
`safeShape` / `safeColor` allowlists, which is T-02-01's mitigation reused rather
than restated, so a caller string from a pasted build code is still never
interpolated raw into a className. **Zero packages installed**: Playwright was
resolved from the existing dev-only install through `PLAYWRIGHT_DIR`, and every
driver used lives in the scratchpad and is not committed.

## Commits

| # | Commit | What |
|---|---|---|
| 1 | `6d71820` | `[S06.12]`, `[C14.5]`, `[S06.7]`'s costs and requirement lines, `[S06.8]`'s six readings, `ldTokenWord` retired with its ruling kept |
| 2 | `071e6bf` | UX-02's three tooltip paragraphs turned in the open, kept verbatim |
| 3 | `8db0282` | 100, 103f and 92 turned; 107–107d added; `harvestInto` gains `data-tsay`; `FIGHT_FLOOR` 116 → 130 |
| 4 | `1f90036` | the gap between two adjacent readings — found on a screenshot the suite was green over |
| 5 | `894cee8` | browser checks 170 → 182, cell 17b turned, the driven hover |
| 6 | `29a0c57` | row 107d reads `LABEL_ATTRS` by name — PROBE BG stage three's finding |
| 7 | `45f8573` | row 107b reads `symMark` as well as `symQty` — PROBE BI's finding |
| 8 | `efd4054` | 05-11 section H (49 → 52), `REHEARSAL.md`'s D-29 block, `deferred-items` 5 closed and 6/7 added |

## Self-Check: PASSED

Files:
- FOUND: `cats-vs-mechs.html`
- FOUND: `tests/selftest-node.cjs`
- FOUND: `tests/browser-checks.mjs`
- FOUND: `.planning/phases/05-fight-loop-playtest/05-11-PLAN.md`
- FOUND: `.planning/phases/05-fight-loop-playtest/deferred-items.md`
- FOUND: `.planning/REHEARSAL.md`
- FOUND: `.planning/phases/05-fight-loop-playtest/05-D29-SUMMARY.md`

Commits:
- FOUND: `6d71820`, `071e6bf`, `8db0282`, `1f90036`, `894cee8`, `29a0c57`, `45f8573`, `efd4054`

Gates:
- `node tests/selftest-node.cjs` — **1216 passed, 0 failed**, interaction gate **188 of 188**, stub-drift **115 shell ids**, `FIGHT_FLOOR` **130** with the fight harvest at **590** closed and **590** open, Layer A 0 hits, Layer B 8139 literals 0 hits, perf 100 commits in 6 ms, exit **0**
- `node tests/browser-checks.mjs` — **182 passed, 0 failed** with `PLAYWRIGHT_DIR` set, real Chrome and real Edge at 1920x1080 and 1366x768; **exit 0 with the SKIP line** without it
- `counter|balanc|rating` 0; `url(` 0; `innerHTML` 0; `createElementNS|<svg` 0; `text-wrap` 0; one `<script>`; one `<style>`
- `DEFAULTS.cats.ap` untouched — `git diff` over all eight commits touches no `[S01]` line
- `git status --short` clean after every probe revert
