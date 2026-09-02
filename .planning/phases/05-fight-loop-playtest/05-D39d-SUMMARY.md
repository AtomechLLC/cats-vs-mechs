---
phase: 05-fight-loop-playtest
plan: D39d
subsystem: presentation
tags: [d-39, audit-pass-d, p2-3, p2-5, p2-8, p2-9, p2-10, p2-11, p2-13, p2-14, p3-1, p3-5, p3-7, c03, c07, c08, c14-1, c14-2, c14-7, c16, c17, c18, s06-8, s06-9, s06-10, s06-15, s07-5, probe-ea, rows-turned-in-the-open, expired-premises]

requires:
  - phase: 05-fight-loop-playtest
    plan: D39
    provides: "the audit — the whole P2 and P3 tier, with its measurements and its prescriptions"
  - phase: 05-fight-loop-playtest
    plan: D39a
    provides: "align-items:start on .rr-list, without which P2-3's wrapped row would not read; the .rr-pill pricing this pass re-took; and the recorded habit of pricing an audit claim before taking it"
  - phase: 05-fight-loop-playtest
    plan: D39b
    provides: "the .err-detail deferral this pass closes, and the rule that a cell must FAIL and never throw — which PROBE EA caught me breaking"
  - phase: 05-fight-loop-playtest
    plan: D39c
    provides: "[C14.7]'s bounded popup, which P2-8's fifth column had to fit inside without moving"
provides:
  - "[S06.9] dcSaidOwn — one sentence, two nodes, exactly one speaking, chosen by the view"
  - "[S06.10] the view word handed to [S06.9] rather than re-derived, and the reason a view press runs no sync"
  - "[C03] one left edge on the top bar in both views, and the .fg-apart hairline moved to something it divides"
  - "[C14.2] the .ld-now card treatment, which shipped three plans ago and the parser threw away"
  - "interaction gate 125b — the stylesheet walked the way a parser walks it, for a class of defect nothing here could see"
  - "interaction gate 127b — the column's action heading, one per column, a label and not a control"
  - "[C17] .rr-pill at [C07]'s 18px floor, with cell 25a turned to the shape the surface actually has"
  - "[C14.7]/[S06.15] the figure between the minus and the plus, the dead row in the value rows' shape, and a bound that answers a press"
  - "[C14.1] the two sides' rows on one line, and the retarget reading paired with its own control"
  - "browser cell 27f — the accessible name read off Chrome's own tree, so P3-1 cannot be raised a third time from a textContent read"
affects: [05-D39e, 05-D39f, 05-D39g, 05-11]

tech-stack:
  added: []
  patterns:
    - "a premise written down beside the code it justified, and expiring when a later plan changes the code without reading it"
    - "one derivation, handed to the second region as an argument, from the one place that runs on the press that changes it"
    - "a check about the SOURCE rather than about a named rule, so it holds for rules written after it"
    - "measuring what a property costs in the units the student moves, not in the units the audit named"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D39d-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/deferred-items.md

decisions:
  - "P2-3 is taken, and by none of the three answers Pass A left. The deciding measurement is what one-line-at-1366 costs in TOKEN TYPES rather than in font size: it costs one, and the 18px board and the six-type board are the same board to the pixel in both engines."
  - "P2-14's horizontal half is taken and its height half is priced and declined: reserving the round row spends 37px of a sticky bar on every frame of the build phase to smooth a transition that happens once per fight, at the instant the whole viewport changes tabs."
  - "P3-1 is NOT taken, because its defect does not exist. visibility:hidden excludes a node from the accessible-name computation; both audits measured textContent. The prescription would have removed a working width reservation and added a reflow."
  - "P2-9's second item — naming the end that refused — is paid by P2-8's figure rather than by a second sentence: 'between 0 and 4' beside a visible 0 says it with nothing new to write, scan or keep in step."
  - "P3-6 is left with the three parked developer decisions rather than taken, because it is D-32's density on the surface pass G already owns twice and a pass that moved the tail void without the badge decision would restyle those rows twice."
  - "Five audit claims corrected with measurements, and two of them were about code that had shipped a plan earlier."

metrics:
  duration: ~7h
  completed: 2026-09-02
  tasks: 11
  commits: 11
---

# Phase 5 Plan D39d: D-39 Pass D — Everything P2 and P3 That Was Left Summary

**One-liner:** The mid-fight build notice stopped being printed twice, the top bar stopped having
three left edges, the round-rules controls reached the floor this file sets for itself after a
measurement found the property protecting them had already expired, the unit popup started showing
the number every other stepper in the artifact shows, and `.ld-now`'s card treatment came back after
three plans in which a stray comment close had been silently feeding it to the CSS parser's error
recovery — with five audit claims corrected, four gate rows and cells turned in the open, and one
probe that found a cell I had just written would kill the whole run instead of reddening.

---

## 1. The five instruments, taken one final time on the committed tree

| instrument | baseline | after |
|---|---|---|
| `node tests/selftest-node.cjs` | 1336 passed, 0 failed · **218 of 218** · 163 shell ids · exit 0 | **1336 / 0** · **220 of 220** · **163** · exit 0 |
| `node tests/selftest-dom.cjs` (stub DOM) | 1460 passed, 0 failed | **1460 / 0** |
| `node tests/browser-checks.mjs` (chrome + msedge × 1920 + 1366) | 338 passed, 0 failed | **362 / 0** |
| live `#selftest`, real browser, `file://` | 1460 / 0 in chrome and msedge | **1460 / 0** in chrome and msedge |
| Layer C floors (dialogs / howto / fight / fight+panel / fight+popup / propose) | 179 / 32 / 725 / 725 / 747 / 62 | **179 / 31 / 725 / 725 / 749 / 62** |

Two gate rows added (**125b**, **127b**), twenty-four browser cells added across five new cells
(**9b**, **10h**, **10i**, **26j**, **27f**). **Zero page errors and zero console errors** in every
run, both engines, both viewports.

**The fight harvest is the most interesting number in that table, because it did not move and its
contents did.** 725 before and 725 after — and diffed entry by entry rather than trusted:

```
GONE:  "The steppers on the board still edit the build…"   ×1   (P2-5)
       "How this works"                                    ×1   (P2-13's eyebrow)
NEW :  "Actions"                                           ×2   (P3-7's heading, one per column)
```

Two sentences left and two arrived, and a floor watching only the count would have been green over
both. It is recorded here because the next pass that reads 725 and concludes "nothing changed" will
be wrong.

---

## 2. The remaining-work list, built by subtraction

The instruction was to subtract Passes A, B and C from the audit myself. Every P2 and P3 finding,
with what was true when this pass started:

| finding | before this pass | this pass |
|---|---|---|
| P2-1 three left edges (`#roundrules`/`#howto`) | Pass A — landed | — |
| P2-2 the ticks | Pass A — `.rr-check` and picker landed; `.ae-pill` half priced and deferred | — |
| P2-3 the 15px round-rules labels | Pass A — `.pk-sw` half landed; `.rr-pill` half **reverted**, three answers left | **TAKEN, by a fourth answer** |
| P2-4 the round-rules rows | Pass A — `align-items` landed; the separator claim **corrected** (it already existed) | — |
| **P2-5 the build notice twice** | **untouched** | **TAKEN** |
| P2-6 the accent outline | Pass A — landed on eight consumers | — |
| P2-7 the four classes outside the ramp | Pass A — landed | — |
| **P2-8 the popup has no numeral** | **untouched** | **TAKEN** |
| **P2-9 the popup announces a refusal at rest** | **untouched** | **TAKEN** |
| **P2-10 the two sides drift 75px** | **untouched** | **TAKEN** |
| **P2-11 retarget scroll + the readout wrap** | **untouched** | **scroll half CORRECTED (already shipped); wrap TAKEN** |
| P2-12 the two Remove buttons | Pass A — landed | — |
| **P2-13 the how-to tab** | Pass A — layout half priced and deferred with pictures; **eyebrow half untouched** | **eyebrow TAKEN** |
| **P2-14 the top bar grows and re-aligns** | **untouched** | **horizontal half TAKEN, height half priced and declined** |
| P2-15 the proposal pane's prose | developer decision | **parked by instruction** |
| **P3-1 the hidden tick in the accessible name** | **untouched** | **CORRECTED — the defect does not exist** |
| P3-2 badge scale | developer decision | **parked by instruction** |
| P3-3 +/− sign parity | developer decision | **parked by instruction** |
| P3-4 the dialogs' sticky edges | Pass A — answered with a measurement (the named idiom is a no-op) | — |
| **P3-5 the "THE FIGHT" eyebrow labels Undo** | **untouched** | **TAKEN, and its mechanism corrected** |
| P3-6 the 305px tail void | untouched | **left with pass G, with the reason** |
| **P3-7 `.ld-now` is not a card** | **untouched** | **TAKEN — and it was never not landed** |
| P3-7 `.pk-body` clips 433px | Pass B — the scroll-affordance half answered with a measurement | — |
| P3-7 `#sh-load-field`'s resize grabber | **D-33c answered it with a measurement and a decision** | **CORRECTED — the audit re-raised a closed item** |
| P3-7 four dialogs, four origins | untouched | **deferred with the measurement it would need** |
| **P3-7 the action list has no heading** | **untouched** | **TAKEN** |
| P3-7 "9 of 9" beside "Health 0×" | Pass B — deferred, three answers | **swept, left, with a figure that changed** |

---

## 3. What landed

### P2-5 · One build notice, owned by the tab whose steppers it is about — `[S06.9]`, `[S06.10]`

Measured on the shipped file, both engines, both viewports: `#fight-said` at y=1828 and
`.dc-said--board` at y=1938, both `display:block`, both visible, **110 px apart, 51 identical words**.

D-33 P2-13 de-duplicated this sentence on the board and left a paragraph beside the two survivors
saying they *"are never on one screen"*, because `#fightbar` is undisplayed in the build view. **That
was true when it was written.** D-38's third tab expired it without touching it: the fight view
undisplays the roster **columns** and leaves `#board` displayed, and `.dc-said--board` spans it at
`grid-column: 1 / -1` precisely so it sits above both columns rather than in one.

`dcSaidOwn` decides which of the two speaks and empties the other, because `dcSaidFill`'s own rule is
that hidden and empty are one decision. **The owner is the view and not `state.fight`**, and it has to
be: a student may press "The board" mid-fight and stand in front of the live steppers, which is the
whole state this notice exists for.

**It is called from `[S06.10]` and not from `[S06.9]`'s own hook, and that is required rather than
tidy.** A view press is page work — `[S07.6]` dispatches no op, commits no state and runs no sync — so
a fill left in `syncBoardFight` is correct on every commit and **stale across every tab press**. That
was measured on the first draft of this fix: `#fightbar`'s copy stayed filled and `#board`'s stayed
empty on the board tab, so the notice about the steppers was absent from the one tab the steppers are
on. The view word is **passed** and never re-derived, which is P1-2's shape one region over.

Driven across all three tabs, both engines, both viewports, plus a fight ended: **exactly one sayer in
every state**, and the fight tab's sayer has a real box.

### P2-14 and P3-5 · One left edge, and a hairline that divides something — `[C03]`, `[C14]`

Measured: the control cluster opens at **x=159 on the board and x=487 in a fight**, under an `h1` and a
view switch at 153 that do not move. One declaration did it — `.brd-cluster` is content-sized on the
board so `flex-end` has no slack to spend, and `.fg-read`'s `flex:0 0 100%` makes it full-width in a
fight, where `flex-end` pushes 1278 px of tools to the end of 1600. D-33 P2-1's finding at its third
site. Both rows open at the bar's own edge now, **exactly on it**, at both viewports in both engines.

D-33 P2-2's paragraph about the reading is **followed and not reversed**: its rule is that the reading
hangs under the tools it follows, and what changed is where the tools are.

**P3-5's mechanism is wrong and its observation is right, and both are recorded.** Undo is not inside
the fight group — it is a sibling, outside the `role="group"` and outside its `aria-labelledby`, which
this pass read off the page rather than taking the audit's word for. What was true is that nothing on
screen said so: 13 px on one side against 14 px on the other, from `.brd-cluster`'s 14 px gap against
`.brd-tokedit`'s 8. So `[C14]`'s `.fg-apart` hairline moved off the cluster's **first child** — where
D-33 P2-1's deletion of `.brd-brand` had left it drawing against nothing at all — onto Undo. No sixth
caption on a bar UX-02 caps.

**The hairline goes on a wrapper and not on the button, and a photograph is why.** Put straight onto
`.brd-btn` it draws no divider: that class carries a full border and a 999 px radius, so a
`border-left` re-colours the pill's own edge to `--line` and its padding pushes the word off centre.
Read back at 3×: a lopsided pill and no line. Undo takes a `.brd-tokedit` wrapper, which has neither.

### P3-7 · `.ld-now`'s card treatment shipped three plans ago and the parser threw it away — `[C14.2]`

The audit measured `.ld-now` at `border-width: 0px` and `background-color: rgba(0,0,0,0)` beside
three `.ld-row`s at 1 px and concluded D-33 P1-5's second half *"did not land"*. **The measurement is
exact and the conclusion is wrong, and the difference is the whole finding.**

The rule landed in D-33c and has been in `[C14.2]` ever since, with a border, a radius and an
accent-derived fill. What nobody could see is that the parser never got it: **a comment close sat in
the middle of the paragraph above the rule**, the prose after it became CSS, and recovery from an
invalid selector skips to the next brace and **discards the block after it**. That block was
`.ld-now`'s. Six declarations, deleted in silence, for three plans, against source that read
perfectly to every reviewer who opened it.

**Nothing in this repository could see it.** The node gate has no CSS parser, the stub DOM has no
stylesheet, and the browser gate reads computed styles for the properties its cells name — none of
which was one of the six. What found it was reading a computed style back for a finding about
something else. That is luck.

So **gate row 125b** walks the style block the way a parser walks it and reports every close outside a
comment and every open that never closes. **It is about the source and not about `.ld-now`**, so it
holds for blocks written after it — a row naming this rule would have caught this defect once. And
**browser cell 17c** holds the pixel half, because a rule can also be lost to a specificity fight no
source scan would see.

The comment describing the defect **cannot spell the two characters it is about**, which is how the
defect survived a review in the first place — and it is now written down that it is.

### P3-7 · `.err-detail` is the last unstyled scrollbar in the file — `[C08]`, `[C16]`

Pass B's own deferred item, whose named owner is "any pass that touches `[C08]` or `[C16]`". This is
one. Two things came with it that were not in the pricing:

`[C08]`'s rule went from the `background` **shorthand** to `background-color`. That is Pass B's
recorded rule about `[C16]`, and PROBE DN measured what the shorthand costs — the cue goes to zero
layers with nothing on screen to say so. Order alone would have saved it here; it is written the safe
way anyway, because "later in the sheet" is a property of the file and not of the rule.

**And the cell that reads it back had to be told what its own runner cannot see.** A first draft
asserted the **gutter**, on P1-3's argument that a gutter is the only proof a bar is drawn — which is
true of a runner that drops `--hide-scrollbars`, and **`tests/browser-checks.mjs` does not drop it.**
The gutter read **2 px**, which is the textarea's own two borders and is exactly the "no scrollbar
takes any width" figure the audit reported and Pass B explained. A clause asserting `> 0` on that
number would have been green on a box with no styling at all. Cell 25d asserts `thin`, a thumb colour
that is not the initial `auto`, four cue layers and a box that genuinely overflows. **The pixel half
was taken out of band** at 1400×900 with the flag removed: 12 px of gutter, a dark bar, photographed.

### P2-13's eyebrow half · The only eyebrow in the file that named its own switch — `[C18]`

**Verified before taken**, because "the only one" is the shape this pass corrected twice. There are
nine `.eyebrow` nodes. Eight label **dialogs**, where the eyebrow is the only name on screen for the
surface it opens. This was the ninth and the only one on a **view**, 50 px under a `.vw-btn` printing
the same four words. The accessible name does not move: `#howto` is labelled by `#howto-head`, which
is the `h2` below it.

Layer C's `#howto` harvest 32 → 31, and **`HOWTO_FLOOR` stays at 24**. Row 126's own prose carried "a
measured 32" three times and now records the move and the reason the floor did not follow it down: a
floor that re-floats on every legitimate deletion is a running total of the last measurement nobody
chose.

### P2-3 · The round-rules controls reach the file's own floor — `[C17]`

**The finding this pass was told to find a different shape for, and the different shape is not a CSS
trick.**

Pass A's table is exact and its question was the wrong one. It asked what one-line-at-1366 costs in
**font size**. The question that settles it is what one-line-at-1366 costs in **token types**. Driven
four times at 1366×768, real Chrome and real Edge, two rules, every figure identical in the two
engines to the pixel:

| board | `.rr-pill` 15px | `.rr-pill` 18px |
|---|---|---|
| the five shipped types | slack 17, **ONE line**, card 372 | slack 0, two lines, card 535 |
| **+ ONE student type** | slack 0, **TWO lines**, card 535 | slack 0, two lines, card 535 |
| + a second student type | slack 0, two lines | — |

**The 18 px board and the six-type board are the same board** — card 535, page 3289, the Add control
at 3169, in both engines at both font sizes. 18 px does not create a shape this file does not already
have; it arrives at that shape **one token type early**, and from the sixth type on it is free. At
1920 nothing wraps at all, at either size, at five, six or seven types.

So the property cell 25a was protecting was never a property of the surface. It was a property of the
surface **before the workshop starts**, and one press of "New type on each unit" ended it at 15 px
too. Weighed against it: ten controls per rule, up to eight rules, on the newest authoring surface in
the file, three pixels under a floor `[C07]`'s own banner sets and every other surface keeps.

**Cell 25a turned in the open, and it branches on the width — which is the honest shape rather than
the weak one.** PROBE DC's finding is that `slack` is the reading that catches a stretched token track
and that a row with no free space cannot be caught. At 1366/18 px the row has no free space **for
legitimate reasons**, so the discriminator is not weakened there — it is **absent**, and a cell that
kept the clause anyway would be asserting something the geometry cannot answer. It is asserted at
1920, where 177 px of slack remain, and **PROBE DC was re-run and reddens there in both engines**. At
1366 the wrapped shape is asserted: columns aligned to a pixel, the amount still against its pills,
one Remove per row, and the band bounded at 96 so a **third** line still fails.

**Answer 2 is still open and is not mine.** Shortening "Cats, each unit" recovers about 120 px and buys
the one-line row back on the fresh board. It is a rendered string on four controls and it is the
developer's vocabulary.

### P2-8 and P2-9 · The popup shows the number, and the bound answers a press — `[C14.7]`, `[S06.15]`, `[S07.5]`

P2-8, measured: `#fg-unit`'s rows drew `label − [tokens] +` with **no numeral**, while `#fg-nudge` —
same tab, same nudge idiom, 200 px away — drew `− 3 +` and the board's `.stp-field` drew `3`. Three
stepper presentations in one artifact and the newest was the only one without a figure.

The figure is between the minus and the plus now, where the nudge puts its own, with the tokens
**beside** it rather than instead of it. The dead row takes the value rows' shape: its toggle sits in
the last column instead of spanning from the second, and its own marker is placed explicitly because
it builds three children against their five — auto-placement would have dropped its symbol into the
**minus** column. 95 px → 72 px.

**`.fgu-val`'s minimum came 96 → 64, and a first draft is why.** The fifth column pushed the row past
the shipped 320 px box: `rowsSW 307` against `clientWidth 290`, a horizontal scrollbar under the box
and the `+` cut off its right edge, **at both viewports**. At 64 the row fits with the box unchanged
and the popup comes down from 286 px to 271 px — which keeps P1-4's clamp arithmetic exactly where it
was.

**And the minus still travels a little as the strip grows, and it did before** — measured rather than
assumed, because a button that shifts under a held finger is what that minimum was written about:

| | minus x | `.fgu-val` |
|---|---|---|
| committed (96) | 151 / 145 / 139 | 96 / 102 / 108 |
| after (64) | 149 / 141 / 139 | 64 / 72 / 74 |

The strip passes its own minimum at high counts either way. What the 96 was buying was a **higher
threshold**, not immunity. The `+` is pinned at 307 across 0→15 in both.

P2-9, measured **on open before anything was pressed**: the Shield row already carried the bound
sentence — about a default pair the student never authored — and after two presses at the floor it
stood under two rows at once, 120 px of a 440 px box, re-laying the remaining rows out each time.

**The arithmetic stays in `[S06.15]` beside the derivation it compares, and `[S07.5]` records only that
a press landed** — a page fact. Two row attributes, both consumed by the frame that reads them, and
**neither in state**: plan 05-05's argument about the by-hand marker, restated. A press that moved the
number clears the mark, which is `dropSaidLine`'s rule at a fourth surface.

**P2-9's second item is paid by P2-8 rather than by a second sentence.** It asks the sentence to say
which end refused; the row now prints the figure between its minus and its plus, so *"between 0 and
4"* standing beside a visible **0** says it with nothing new to write, to scan, or to keep in step
with the pair it quotes.

### P2-10 and P2-11 · The two sides' rows on one line, and a reading beside its own control — `[C14.1]`

P2-10, measured at both viewports: the Cats team-resource line at y=953 and the Mechs one at y=878,
**75 px apart**, because each column packs under its own battlefield and the Cats field is three rows
of nine shapes to the Mechs' one row of three. After: **953/953 and 1006/1006**, and the page height
does not move — 2115 and 2168, the same numbers as before.

`align-items:stretch` on `.fg-sides` **and** `flex:1 1 auto` on `.fg-field`. The second is the half the
alignment alone does not do: driven with the alignment changed and nothing else, the columns came out
equal at 360 and 360 and the resource lines stayed at 953 and 878, because the field kept sizing to
its own content and the extra height fell off the bottom.

**Subgrid was declined and the reason is in the stylesheet.** It needs this to be a grid, and
`.fg-side`'s basis is the number `[C14.1]`'s own sweep derived against a measured 679 px of content and
a 1180 px breakpoint — turning it into a grid re-opens every one of those figures for a defect that is
one declaration.

P2-11's remaining half: the declared row is **95 px against its eight neighbours' 40**, with "Lands on
Mech 1." on the first line and "Change target" on the second, **496 px apart at 1920 with eight other
controls between them**. `.fg-row` is a wrapping flex line and the two were independent items. They are
**one item** now — the audit's own second option — so the line breaks in front of both or behind both
and never between. Photographed at 1920: `Lands on Mech 1.` and `Change target`, 8 px apart.

### P3-7 · The column's action cards get a heading — `[C03]`, `[S06.4]`

Measured at 1920: the Add control at y=2164 and the first `.ref-card` at y=2233, with nothing between
them and nothing over the three.

**One word and not two, and the difference is the exemption channel.** "Cats actions" would put a word
the **student** typed into a heading, which is one more place ALLOC-10's channel has to reach — the
same argument P1-6's receipt made about naming an action. The column's own head three feet up already
says whose side this is.

`REF_HEAD_WORD` is one constant, exported, and **row 127b reads the word off the export** rather than
typing it — `COMPACT_AT`'s and `SYM_TAKEN`'s standard. Its four clauses are ways this goes wrong
rather than restatements of the fix: present on **both** columns, **exactly once**, **after** the Add
and **before** the first card, and carrying **no routing attribute** (check 56b's standing rule).

**And the empty case is not driven, with the reason read back off the op.** A first draft removed every
action from a side to assert the heading went with them; `removeAction` **refuses** — the six the
board ships with cannot be removed, only renamed — so `refActions` cannot return an empty list for any
board a student can reach. That refusal is asserted as a fact about the artifact. The guard in the
builder is kept anyway: one comparison, and it states the rule a reader needs.

---

## 4. Five audit claims corrected, with measurements

**1. P3-1's defect does not exist.** The audit: *"the hidden tick is still in every unselected
control's accessible name, and now on three more components"*, and D-33 P3-7 said it first. **Both
readings are of `textContent`, and `textContent` is not the accessible name** — a node that is not
rendered is excluded from the name computation, and `visibility:hidden` is not rendered. Measured
through CDP against Chrome's own accessibility tree:

```
#view-build   (selected)    text "The board✓"   ACCESSIBLE NAME "The board ✓"
#view-fight   (unselected)  text "The fight✓"   ACCESSIBLE NAME "The fight"
.rr-pill--on                text "Cats✓"        ACCESSIBLE NAME "Cats ✓"
.rr-pill (not --on)         text "Mechs✓"       ACCESSIBLE NAME "Mechs"
```

Which is exactly what `[C07]`'s three-times rule wants: a border, a fill and a tick, with the tick
reaching the accessible name as a **third channel a screen reader gets for free**. The prescription —
reserve the width with padding, write the character only onto the selected control — would have
removed the reservation the hidden span provides, put a reflow on every press, and traded a channel
that works for one that already did. **Not taken.** Browser cell **27f** exists so the claim cannot be
raised a third time from a `textContent` read.

**2. P2-11's scrollIntoView already ships.** The audit says fix #2 *"did not"* land. It landed under
D-33 P1-7, plan 05-D33b, guarded three ways with its own paragraph. This is the **third** claim of that
shape in four passes, after P1-3's scroll affordance and P1-5's edge fade.

**3. P2-10's second sentence is false.** *"The same happens to the picker rows below."* It does not:
both `.fg-rows` in the **input** area open at y=1256 on the shipped file, because that area's two
columns carry one heading each and nothing that differs. Only the state area drifted. Cell 10i reads
**both** areas so the correction is a measurement rather than a sentence.

**4. P3-7's `#sh-load-field` bullet was closed a plan ago.** *"`#sh-load-field` still shows the native
resize grabber."* D-33c measured that bullet, found both fields identical to the byte, and **kept the
grabber as a recorded decision**: `[C08]`'s `.err-detail` is that chrome's origin and it is resizable
so a long error can be read, and the same argument holds for a long build code. The audit re-raised a
closed item as if untouched.

**5. `.ld-now` "did not land" — it landed and the parser deleted it.** §3 above.

---

## 5. Rows and cells turned in the open

Nothing was narrowed to pass. Each turned row asserts **more** than it did.

| row / cell | what it asserted | why it had to turn | what it asserts now |
|---|---|---|---|
| browser **25a** | two rules, **ONE LINE EACH**, at both widths, with `slack > 0` as PROBE DC's binding clause | `.rr-pill` reached `[C07]`'s floor, and the one-line property was never a property of the surface — one student token type ends it at 15 px too, and the 18 px board and the six-type board are the same board to the pixel | the floor read off the control; PROBE DC's clause at **1920**, where slack still exists and the probe still reddens; and at 1366 the wrapped shape — columns aligned to a pixel, the amount against its pills, and a band bounded at 96 so a **third** line fails |
| node **121** | the bound sentence the moment a value **sat** on a bound | that is what produced the box announcing a refusal on open, before anything was pressed, about a default pair the student never authored | the shield sitting **at** its floor at rest says nothing; three presses carrying health 3→0 say nothing, because each one **moved**; the fourth answers. Arrived-at and refused-by are two facts and only the second is a thing to tell a student |
| browser **26c** | `clamped.shown === true` after a press it called the fourth | **its prose described a press it never made** — "the FOURTH press has nowhere to go, NO further ruling is recorded", while the drive stopped one short and measured the press that **arrived** | both presses, in order, and the no-further-ruling clause asserted for the first time |
| node **126** | "a measured 32", three times in its own prose | the how-to eyebrow went | 31, with the move recorded and the reason `HOWTO_FLOOR` **did not follow it down** |

**Five cells added:** browser **9b** (the bar's left edges in both views, Undo's containment read off
the page, the 64→101 growth printed rather than judged), **10h** (the build notice across all three
tabs), **10i** (both areas' row alignment and the retarget pair), **26j** (every popup figure compared
to the **model**, the four rows' last column as one x, the overflow clause, P2-9's three states) and
**27f** (the accessible name through CDP). **Two node rows added:** **125b** (the stylesheet's comments,
as a class rather than as a rule) and **127b** (the action heading, four clauses and a refusal read
back).

---

## 6. Six probes, and one of them changed a cell

Every probe ran **after** the commit it tests, and was reverted from a scratchpad copy of the
committed tree.

| probe | what it took out | result |
|---|---|---|
| **DV** | both build-notice nodes filled again | browser **10h** red in all four columns |
| **DW** | `.brd-cluster` and `.fg-read` back to `flex-end` | browser **9b** red in all four |
| **DX** | the stray comment close back into `[C14.2]` | node **125b** red — **and 76 browser cells**, see below |
| **DY** | `.err-detail` off `[C16]`'s scroller list | browser **25d** red in all four |
| **DZ** | the popup's bound line standing at rest again | node **121** red; browser **26c** and **26j** red in all four |
| **EA** | the `.fgu-num` append deleted | **the whole run died**, then red in eight cells — see below |
| **DC** (re-run) | the token track back to `1fr` | browser **25a** red at **1920** in both engines, green at 1366 — the asymmetry cell 25a now documents |
| **EB** | `.fg-sides` back to `flex-start` and the lands-pair unwrapped | browser **10i** red in all four |
| **EC** | the action heading's push removed | node **127b** red |

### PROBE EA is the finding of this pass

It deleted the figure D-39 P2-8 had just added — exactly the regression cell 26c's new clause exists
to catch. The cell read `.textContent` straight off the lookup, so the null took a `TypeError` out
through `page.evaluate` and **killed the whole run**: no red row, no table, no report, 358 cells
replaced by a stack trace.

**A cell must FAIL, never throw and never hang.** That is Pass B's recorded rule, written after its own
cleanup step hung a run on a 30-second click — and I wrote past it two commits after reading it. Cell
26j's equivalent read was already guarded, which is the only reason the asymmetry was visible at all.
Fixed, committed on its own, and re-probed: eight red cells instead of a dead run.

### PROBE DX's blast radius is a second finding

Restoring the stray comment close reddened node 125b **and 76 browser cells** — far more than the one
rule the original defect lost. The reason is that the paragraph I wrote *describing* the defect
contains a literal `{`, so the parser's error recovery skipped to **that** brace and then consumed a
block that was not `.ld-now`'s. The original defect was quiet because the prose after it happened to
contain no brace. **The same typo is worth between one dead rule and most of a stylesheet, depending
on the prose beside it** — which is the argument for 125b rather than for a row naming `.ld-now`.

---

## 7. Deviations from plan

### Auto-fixed issues

**1. [Rule 1 — bug] My own P2-5 fix was stale across every tab press**

- **Found during:** the first read-back of P2-5, driving all three tabs
- **Issue:** the first draft put the ownership decision in `syncBoardFight`, which is a `SYNC_HOOK`. A
  view press runs no sync — `[S07.6]` dispatches no op — so on the board tab mid-fight `#fight-said`
  stayed filled and `.dc-said--board` stayed empty. The notice about the steppers was **absent from
  the one tab the steppers are on**, which is worse than the duplicate it replaced.
- **Fix:** `dcSaidOwn` is called from `[S06.10]`, the one function a view press does run, with the
  view word passed rather than re-derived. Written at both sites.
- **Commit:** `f02d5c7`

**2. [Rule 1 — bug] The P3-5 hairline deformed the button instead of dividing beside it**

- **Found during:** reading back a 3× crop of the top bar
- **Issue:** `.fg-apart` on `.brd-btn` draws no divider at all — the button already carries
  `border:1px solid var(--ink-faint)` and a 999 px radius, so the `border-left` re-coloured the pill's
  own edge and the `padding-left` pushed "Undo" off centre. Photographed.
- **Fix:** a `.brd-tokedit` wrapper, which has neither, carrying no `role` and no caption.
- **Commit:** `b4a4ef1`

**3. [Rule 1 — bug] P2-8's fifth column overflowed the popup**

- **Found during:** reading back the first popup screenshot
- **Issue:** `rowsSW 307` against `clientWidth 290` — a horizontal scrollbar under the box and the `+`
  cut off its right edge, at both viewports.
- **Fix:** `.fgu-val` 96 → 64, box unchanged, popup 286 → 271. The pre-existing minus travel measured
  on the **committed** file rather than assumed to be new.
- **Commit:** `90fd616`

**4. [Rule 1 — bug] Cell 26c threw instead of reddening — PROBE EA**

- Covered in §6. Committed on its own (`927a5c9`) because a cell that can kill the run is a defect in
  the instrument, not in the finding it was written for.

**5. [Rule 3 — blocking] Three words and one character this file's own gates refuse**

- `balanc` is banned as a substring **document-wide**, so a comment saying "nothing reads the
  stylesheet for `balanc`ed comments" tripped Layer A from inside a comment. Reworded.
- A literal comment **close** inside a CSS comment describing comment closes does the very thing it
  describes. The paragraph now says it cannot spell them, and says why.
- An apostrophe in a single-quoted JS string, twice, and a **backtick** inside a template literal —
  each a syntax error that took the gate down until found.

**6. [Rule 3 — blocking] A substring test over a CSS selector, in my own new cell**

- Cell 27f split selected from unselected with `indexOf('--on')`, and the **unselected** pill's own
  selector is `.rr-pill:not(.rr-pill--on)`, which contains it. Three selected, one unselected, red on
  a correct board. A substring test over a selector is a parser written by accident; the two groups
  are named now.

**7. [Rule 3 — blocking] The stub models `children` and not `childNodes`**

- Row 127b's first draft walked `col.childNodes`. A browser would have hidden the difference.

### Findings recorded rather than taken

**8. [Rule 4 — architectural] P2-14's height half.** Reserving the round/pool row spends 37 px of a
sticky bar on **every frame of the build phase** to smooth a transition that happens once per fight,
at the instant the whole viewport changes tabs. Two open deferred items already name the
above-the-fold budget at 768 as scarce. Three admissible answers in `deferred-items.md`; cell 9b
**prints** the 64→101 figure so whoever takes it can read the price without re-driving anything.

**9. [Rule 4 — architectural] P2-3's answer 2.** Shortening "Cats, each unit" recovers ~120 px and buys
the one-line row back at 1366 on the fresh board. It is a rendered string on four controls and it is
the developer's vocabulary, not a layout dial.

**10. [Rule 4 — architectural] P3-7's four dialog origins.** Not obviously a defect: the same bullet
records D-33 P2-5's *flicker* as fixed, which was the case where two origins were a defect because
one surface moved under a student's eye. Four different dialogs opening at four heights is what
centring four boxes of four heights produces. What would settle it is a picture of the two authoring
dialogs at 768, where 1040 and 971 both exceed the viewport and the clamp is doing the work — not a
table of four numbers taken at 1080. This pass photographed neither.

**11. [Rule 4 — architectural] P3-6, with the three parked decisions.** P2-15, P3-2 and P3-3 are parked
by instruction. P3-6 is not flagged as a developer decision and is left with them anyway: it is D-32's
density on the action editor, which pass G already owns twice over (`.ae-prop-pill--on`'s missing tick
rule, and P2-2's `.ae-pill` half with cells 23 and 23c priced), and a pass that moved the tail void
without the badge decision would restyle those rows a second time. Pass A's own sequencing argument,
at the surface it was written about.

---

## 8. The deferred-items sweep

| entry | verdict |
|---|---|
| **D-39 P1-3's side-effect — `.err-detail`'s scrollbar** | **CLOSED.** One selector, plus the shorthand correction and the "what this runner cannot see" paragraph the pricing did not anticipate |
| **D-39 P2-3's `.rr-pill` half** | **CLOSED**, by none of its three answers. Answer 2 recorded as still open and named as the developer's |
| **D-39 P1-4's PROBE DP at 1920** | **left, with a second reason.** The cost is not the two lines of setup — it is that cell 26i would become the only cell in the file building a four-student-type board, so every other clause in it would be measured against geometry no other cell shares. A cell whose setup is unique is a cell whose red run nobody else can reproduce. Both sizes run in both engines on every gate, so the regression is caught at 768 in four columns |
| **D-39 P1-2's standing-count duplicate** | **left — answer 3, and now with a reason rather than an absence of one.** P2-10 landed this pass, so the two standing counts sit **side by side at the same y** instead of 75 px apart. That is a comparison a room can make at a glance and is the reading D-27 asked those columns for; answer 2 would take it away to fix a duplication that is not a contradiction |
| **D-39 P2-13's layout half** | unchanged — Pass A's two pictures still stand |
| **D-39 P3-4, P2-2's `.ae-pill` half, P1-6's items 2 and 3** | unchanged |
| **three new entries** | P2-14's height half; P3-7's four dialog origins; and P3-6 with the parked three, restated so the list is in one place |

---

## 9. Verification

**Read back off rendered pixels**, real Chrome **and** real Edge, headless, `file://`, 1920×1080
**and** 1366×768, with `--hide-scrollbars` removed from the default args. Every state reached by
pressing shipped controls.

| shot | what it settles |
|---|---|
| `after-w1920-bar-fight.png` | both top-bar rows opening at one left edge with a fight running |
| `zoom-undo-board.png` (3×) | before: a lopsided Undo pill with no divider. after: a hairline between "Start the fight" and Undo, and a symmetric pill |
| `after-ldnow.png` | "What changed since the previous round" as a card, accent-tinted border and fill, for the first time since D-33c wrote the rule |
| `after-errpanel.png` | a thin dark scrollbar on the stack-trace box, 12 px of gutter, taken with the flag removed |
| `after-rr-w1366.png` / `after-rr-w1920.png` | every round-rules label at 18 px; the wrapped row at 1366 still reading as one row with its columns aligned |
| `after-popup.png` | `Health − 3 ●●● +`, `Shield − 0 0×▪ +`, the dead row's toggle in the `+` column, no scrollbar, no premature refusal |
| `after-popup-refused.png` | the bound sentence appearing under the Shield row **only after** the press it refuses, beside a visible `0` |
| `after-sides.png` | the two "Action points · 0 of 3 spoken for · 3 left to spend" lines on one line across both columns |
| `after-declrow.png` | "Lands on Mech 1." beside "Change target", 8 px apart |
| `after-refhead.png` | "Actions" between "+ Add Cat" and the Slash card |

**Drivers and measurements:** `scratchpad/d39d/` — `lib.mjs`, `m1`–`m6.mjs`, `rr.mjs` / `rr2.mjs` /
`rr3.mjs` (the token-type sweep in both engines), `pop.mjs` / `popw.mjs` / `popstab.mjs` /
`popstab3.mjs` (the pair-stability comparison against the committed file), `p28.py` / `p29.py`,
`p31b.mjs` (the CDP accessible-name read), `p210.mjs` / `p211.mjs`, `live.mjs`, the `shot-*.mjs`
drivers, and `fight-before.json` / `fight-after.json` (the harvest diff in §1).

---

## Known Stubs

None. Nothing in this pass renders a placeholder and no data path was left unwired. The action
heading is built only where there are cards to head; the popup's figure is written by one function
driven in both gates and compared to the model in the browser gate; the build notice's two nodes are
written by one function with one caller.

## Threat Flags

None. No new network surface, no auth path, no file access and no schema change. Every string this
pass adds reaches the page through `textContent`, which is `[S08]`'s own rule for the same reason
(threat T-01-02), and the one new constant is a literal in the file rather than anything a student
typed.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND, modified
- `tests/selftest-node.cjs` — FOUND, modified (rows 121 and 126 turned; 125b and 127b added)
- `tests/browser-checks.mjs` — FOUND, modified (cells 25a, 25d and 26c turned; 9b, 10h, 10i, 26j, 27f added)
- `.planning/phases/05-fight-loop-playtest/deferred-items.md` — FOUND, four entries closed or swept, three appended
- `.planning/phases/05-fight-loop-playtest/05-D39d-SUMMARY.md` — FOUND
- commit `f02d5c7` (P2-5) — FOUND in `git log`
- commit `b4a4ef1` (P2-14, P3-5) — FOUND
- commit `c243f58` (P3-7 `.ld-now` + row 125b) — FOUND
- commit `5afd348` (P3-7 `.err-detail`) — FOUND
- commit `105ca1c` (P2-13's eyebrow) — FOUND
- commit `9a5ea90` (P2-3) — FOUND
- commit `7216b7f` (P3-1's correction, cell 27f) — FOUND
- commit `90fd616` (P2-8, P2-9) — FOUND
- commit `927a5c9` (PROBE EA's correction) — FOUND
- commit `069c0fb` (P2-10, P2-11) — FOUND
- commit `c46850d` (P3-7's action heading + row 127b) — FOUND
- all five instruments re-run on the committed tree: node exit 0 (1336/0, 220/220, 163 ids, floors
  179 / 31 / 725 / 725 / 749 / 62), DOM 1460/0, browser 362/0, live `#selftest` 1460/0 in chrome and
  msedge
