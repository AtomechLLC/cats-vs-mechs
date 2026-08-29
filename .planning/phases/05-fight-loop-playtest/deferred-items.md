# Deferred items — phase 05

Out-of-scope discoveries logged rather than fixed, per the executor's scope boundary.

## 1. A POINTER press on any control whose own node is rebuilt drops the keyboard to `<body>`

**Found:** plan 05-10, driving real Chrome and real Edge.
**Pre-existing, file-wide, and NOT introduced by this phase** — the control reading is what
makes that a measurement rather than a claim.

```
FOCUS A. fight chooser (plan 05-07), POINTER path  = BODY  data-k=undefined
FOCUS B. fight chooser, KEYBOARD path              = BUTTON.fg-pill  data-k="fg/by/cats/c2"
FOCUS C. token picker row (plan 02-03), POINTER    = BODY  data-k=undefined
FOCUS C. token picker row, KEYBOARD path           = BUTTON.pk-list-item  data-k="pk/list/shield"
FOCUS D. a board stepper (node NOT rebuilt), POINTER= BUTTON.stp-btn  data-k="cats/c1/maxHp+"
FOCUS E. the alive toggle, POINTER  = BUTTON.dc-alive  data-k="fg/alive/c1"
FOCUS E. the alive toggle, KEYBOARD = BUTTON.dc-alive  data-k="fg/alive/c2"
```

**The mechanism.** `withPreservedFocus` restores the keyboard onto the new node during
`pointerdown`. The browser's own default focus-on-mousedown then targets the node that was
under the pointer — which the rebuild has detached — and focus falls to `<body>`. A stepper
(D) keeps focus because its node survives; the alive toggle (E) keeps it because a `setAlive`
commit is not structural and the button is not replaced.

**Why it is deferred rather than fixed.** It reproduces identically on plan 02-03's token
picker, two phases older than this one, so it is neither this plan's regression nor this
plan's region: the fix belongs in `withPreservedFocus` ([S06.1], plan 02-01) and would be a
change to how every rebuilding surface in the file behaves. The KEYBOARD path — the one this
matters for — is correct on every surface measured.

**What it costs:** a student who clicks a chooser and then presses Tab starts tabbing from the
top of the document rather than from the control they just used. Nothing is lost and nothing
is mis-set.

## 2. `#board`'s top was below the fold of both a 1080 and a 768 screen — CLOSED

Re-measured by plan 05-10 in real Chrome, one round resolved through real presses:

```
board top @1920x1080 = 1203
board top @1366x768  = 1111
```

**FIXED, out of the plan sequence, by the orchestrator, before plan 05-11.** It was deferred here
because it needed a wrapper element in the static shell and a rewrite of `[C14]`'s
`#fightbar, #ledger` rule — plan 05-06's markup and plan 05-06's frame rule, which plan 05-10 did
not own and did not touch. It stopped being deferrable because plan 05-11 is a **blocking playtest**:
a person cannot play a board that is off the bottom of the screen, so the fix is a precondition for
the checkpoint being executable rather than a polish item inside it.

The two regions were laid side by side in a `.fg-band` wrapper. Driven with a round resolved in real
Chrome and real Edge at both sizes, agreeing to the pixel in all four:

```
board top @1920x1080 = 844 of 1080   (236px of headroom)
board top @1366x768  = 730 of  768   ( 38px of headroom)
```

Unchanged at thirty resolved rounds. `#strip` still pins (107 at 1080, 99 at 768). Both gates green:
`1188/0` with the interaction gate at `160/160`, and `browser-checks` at `22/0`.

**What was NOT fixed** — the newest round still does not fit whole at 1366x768, and below a 1180px
viewport the two regions stack again — is recorded with its measurements in the record file.

Full record: `.planning/phases/05-fight-loop-playtest/05-VIEWPORT-FIX.md`. It is also
`REHEARSAL.md` B3 and limitations entry 21, both rewritten.

## 3. In the FIGHT VIEW the projection starts below the fold — owned by 05-14 / 05-15, not deferred out of the phase

**Found:** plan 05-12, driving real Chrome and real Edge from `file://` at both viewports.

With a fight running and the fight view showing, `#strip`'s viewport top at page scroll 0:

```
@1920x1080   906 of 1080   (174px of the projection visible)
@1366x768    792 of  768   (below the fold; it comes into view on any scroll)
```

**Not a regression.** The same band sat above the same board before this plan — plan 05-10
measured `#board` top at 844 of 1080 with a round resolved, and the viewport fix left it there.
The switch did not move the projection down; it removed the two roster columns from underneath it.

**Why it is not this plan's to fix.** Both numbers are set by `#fightbar`'s HEIGHT, and that
height is `[C14]`'s 736px basis and `[C14.1]`'s 34vh bound measured against a declaration column
**plan 05-14 replaces outright** and **plan 05-15 then adds a battlefield to**. Turning either dial
here would be the fifth consecutive plan to set a height against a page the next plan changes,
which is the failure `05-VIEWPORT-FIX.md` is a record of. Plan 05-12 recorded the readings in
`[C15]` as a control run and explicitly not as settled dials.

**What the two plans owe:** a re-measure of `#strip`'s viewport top in the fight view at both
viewports in both browsers, after their own column lands. `[C15]`'s sticky table is the baseline
to measure against.

## 4. REF-03 IS NOT SERVED ON THE FIGHT TAB — the per-action cards are inside the hidden columns

**Found:** plan 05-16, task 2, by row 101 the first time it was taken WITH A VIEW.
**Not a browser finding.** It came out of `tests/selftest-node.cjs` — no layout engine needed,
because the mechanism is a selector and a parent, not a pixel.

REF-03 is *"the action reference is readable without leaving the fight view."* Measured on the
played board with `#app[data-view="fight"]`:

```
the view while the reading is taken     "fight"
action/reference cards on the board      6
  of which inside #refband               0
  of which inside a roster column        6      <-- and .brd-col is display:none in this view
leaf strings still readable in #refband  3      (the "What beats what" head and its map)
```

**The mechanism.** `refCard()` is appended by `buildColumn()` into `#col-cats` / `#col-mechs`, and
`[C15]` writes `#app[data-view="fight"] .brd-col{display:none}`. So the six cards that say what
Slash does, what it costs and what it damages are on the page and off the screen whenever a fight
is being played. `#refband` and `#strip` survive because they are children of `#board` rather than
of a column — which is the arrangement check 103b asserts, and it is the half of REF-03 that holds.

**Why it went unseen for four plans.** `buildColumn`'s own cross-plan comment (plan 03-05) states
the premise in as many words: *"these cards are reference MATERIAL, and a student reading what
Lasers does needs it at least as much mid-fight as mid-build — which is REF-03, in Phase 5. One
branch placement now costs nothing and saves that phase a re-layout."* That was true for three
phases. Plan 05-12 put the columns behind a switch and nothing in the repository read the cards
**with a view**, so nothing went red. Check 62 reads them at the moment a fight starts; row 101 read
them mid-fight — but neither had a view to read until this plan added one.

**Why it is deferred rather than fixed.** This plan's `section_ownership` says it edits
`cats-vs-mechs.html` **not at all**, and the fix is an artifact change in a function this plan does
not own (`buildColumn`, [S06.1], plan 02-01, carrying plan 03-05's edit). It is also a real design
choice rather than a typo, and the two candidates differ in what they cost a projector:

1. **Move the cards into `#refband`.** One append site changes. `#refband` is already outside the
   hidden columns, already built once and flagged, and already the thing called "the reference".
   Cost: the band grows from three strings to seventeen and gets taller in BOTH views, which is a
   height dial nobody has measured and this phase's own recorded failure mode.
2. **Stop hiding the columns and hide only the unit cards.** `.brd-col` becomes visible in the
   fight view with `.unit-card` and `.brd-add` hidden instead. Cost: the fight tab regains the two
   columns' width and the tab stops being the clean structural answer entry 21 credits it with.

**What it costs today:** a student mid-round who wants to know what an action does has to press
the board tab, read the card, and press back — which is precisely the navigation REF-03 exists to
forbid. It is not a data loss and nothing is mis-set.

**Row 101 asserts the defect in the direction it is TRUE** (`all six in a column, none in the
band`), so the day somebody moves them the gate reddens and this entry gets read. That is the
95-turned-in-the-open treatment rather than a row that quietly stopped counting.

**Owner:** the developer, at the 05-11 playtest — it is a question about what a room needs in
front of it, and item 2 of that plan (PROJ-05, the two readings side by side) is where it lands.

---

## Item 3 — RE-MEASURED BY PLAN 05-16, and the answer is: still below the fold at 768

Plan 05-12 handed the re-measure of `#strip`'s viewport top in the FIGHT view to "the two plans that
then changed the column underneath it" (05-14's grid and 05-15's battlefield). Neither took it —
neither drove a browser — so plan 05-16's browser checks take it. Real Chrome and real Edge, from
`file://`, with a fight running, at page scroll 0:

```
                         plan 05-12        plan 05-16 (the shipped surface)
@1920x1080                906 of 1080       690 of 1080     <- improved by 216px
@1366x768                 792 of  768       787 of  768  (Chrome)
                                            608 of  768  (Edge)
```

**Still below the fold at 1366x768 in Chrome.** It comes into view on any scroll and `#strip` reports
`position: sticky` with every ancestor at `overflow: visible` in both views, so nothing is broken —
this is a budget question, not a stickiness one. At 1920x1080 the grid and the battlefield cost less
than the declaration column they replaced, and the projection moved 216px up the page.

**The Chrome/Edge disagreement at 768 is the second finding and it is about SCROLL, not layout.**
Every layout number the checks take is byte-identical between the two browsers at every size. What
differs is where the page sits when the fight view is entered: `window.scrollTo(0, 0)` reached
scrollY 0 in Chrome and scrollY 179 in Edge, so Edge's reading is the same strip 179px further up a
scrolled page. Recorded rather than reconciled — the browser checks assert what holds in both (the
strip never leaves the top of the window, and two stops that reached the same scroll offset report
the same top) and print the four numbers.

**Not fixed here.** Plan 05-16 edits `cats-vs-mechs.html` not at all, and the lever is a height dial
— `.fg-sides`' 26vh bound or `.ld-list`'s 46vh — which is exactly the class of change that four
consecutive plans in this phase each made against a page the next plan then moved. It is
`REHEARSAL.md` B3's first open bullet and it is a question for a room: **on a 768-tall screen, is one
scroll to reach the projection acceptable, or does the projection need to sit above the fight?**
