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

**A THIRD CANDIDATE ARRIVED WITH D-28, and it is the cheapest of the three — plan 05-D28.**
D-28 put the projection behind a toggle that opens `#strip` as a fixed 360px sidebar in the fight
view. The redirect record's own orchestrator note flags it: *"the new toggled sidebar is an obvious
candidate home for [the reference cards], and that option is noted on the deferred item for the
playtest decision."*

3. **Put the cards in the toggled sidebar beside the projection.** They would be off the fight tab
   by default exactly as the projection now is, one press away exactly as the projection now is,
   and cost the band and the columns nothing in EITHER view — which is the height dial candidates 1
   and 2 both spend. Cost: the sidebar becomes two things (a projection and a reference), the
   toggle's label stops being true, and REF-03's "readable without leaving the fight view" is then
   being served by the same one press that PROJ-05 is — which is a reasonable reading and is
   nobody's to make but the developer's, since it is their own call on PROJ-05 that made it
   available. Measured for scale: the sidebar is 360x779 at 1920x1080 and 360x641 at 1366x768 and
   already scrolls on itself, and the six cards are seventeen leaf strings.

**Row 101 still asserts the defect in the direction it is TRUE and D-28 did not move it**, because
the cards are still inside the hidden columns. Nothing about this entry is closed.

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

### CLOSED BY D-28 — plan 05-D28, and closed by REMOVAL rather than by a dial

The question this entry asks is *"where does the projection start on the fight tab"*, and after D-28
it does not start anywhere: *"The predictor turn off, and make it toggled sidebar / pop over"*, the
developer, at the real artifact. In the fight view `#strip` is `display: none` until a student
presses `#proj-toggle`, at which point it is a `position: fixed` panel measured at **1531,121
360x779** at 1920x1080 and **977,113 360x641** at 1366x768, in both browsers — under the control
bar, against the right edge, wholly inside the window at both sizes, and carrying the live figures
(browser checks 10c and 10d drive the press and then move the pool to prove the reading is current).

**A fixed box cannot start below the fold**, so the four consecutive plans' worth of height-dial
arithmetic this entry records is retired rather than answered. The BUILD view is untouched: `#strip`
is still sticky there, still in `#board`'s middle track, still pinning at 301/293 — browser check 10
now runs over that view alone, and the reason its fight-view half was removed is written at its site
(a `display:none` element still reports `position: sticky` and a rect of zeros, so the old cell
would have passed over a projection that had left the page).

**What is NOT closed** is whether a room presses it. That is `REHEARSAL.md` B3 and 05-11's item 2.

## 5. `[S06.7]`'s banner names "check 105", and this repository has never had one

**Found:** plan 05-15, handed to plan 05-16, re-read by plan 05-16 and still not fixable here.

`[S06.7]`'s banner in `cats-vs-mechs.html` says *"check 105 is the numbered row that holds it"* about
the disable-is-a-render-decision-and-no-handler-writes-one property. That row shipped as **95b**,
beside the check it was re-homed from, so the banner points at a number that does not exist.

Plan 05-15 left row 105 unused rather than taking it, and the reasoning is right: a battlefield row
numbered 105 would turn a dangling reference into an actively wrong one — a reader following the
banner would land on a check about token shapes and conclude the property is asserted somewhere it
is not. So `tests/selftest-node.cjs` runs `... 95, 95b, 96 ... 104f, 106, 106b ... 106j` with **105
deliberately absent**, and the comment at that gap says so.

**Why plan 05-16 could not close it.** The fix is one word in one comment — `105` → `95b` — inside
`cats-vs-mechs.html`, and plan 05-16's own `section_ownership` says it edits that file **not at all**.
That constraint exists because this plan's whole job is to make the gate able to fail on the shipped
surface, and a plan that edits the artifact it is auditing has stopped being an audit. So the finding
is logged with its measurement, which is plan 05-10's shipped precedent for exactly this shape.

**What it costs:** nothing at runtime. It costs a reader of `[S06.7]` one wrong lookup.

**Owner:** whichever plan next edits `[S06.7]`. It is one word, and the gap in the row numbering is
what will make somebody ask.

**Do not "tidy" the gap by renumbering the battlefield rows into it.** The gap is the record.

### CLOSED BY D-29 — plan 05-D29

D-29 edits `[S06.7]` (its `fgSay`, its `fgCostParts` and its requirement line all take the symbolic
reading), so this item's own stated owner arrived. `check 105` → `check 95b`, with the history kept
in the same sentence: the row shipped as 95b, 105 is deliberately absent from the numbering, and the
gap in `tests/selftest-node.cjs` is still the record. **Nothing was renumbered.**

---

## 6. THE LANE'S SYMBOLIC READINGS ARE NOT REACHABLE AT 1366x768 WITHOUT SCROLLING THE CARD

**Found:** plan 05-D29, by a browser check that went red three times before it went green.

Measured in real Chrome and real Edge with five rounds resolved:

| | @1920x1080 | @1366x768 |
|---|---|---|
| a lane card's window over its content | 238px over 1174px | **115px over 1174px** |
| readings in the lane, and readings reachable by a mouse without scrolling a card | 240 / some | 240 / **none** |

At 768 a card shows its round number, its note and the faction name, and the FIRST unit reading is
already below the fold of its own scroller. Every one of the 240 symbolic readings needs the card
scrolled before a mouse can reach it — which means the tooltip, which is where D-29 put the prose,
is two interactions away rather than one.

**This is D-28's bound and not D-29's notation.** `.ld-row` has been capped at 22vh (15vh below
820px of viewport height) since the lane turned sideways, and a 9-and-3 board has always put twelve
unit readings plus five action lines into that card. What D-29 changed is what the readings are made
of, not how many there are. It is measured here for the first time because until D-29 nothing in
this repository had a reason to ask whether a specific reading in a card could be POINTED AT.

**The candidates, and none is taken here because all three are the developer's call:**

1. **Raise `.ld-row`'s bound at small viewports.** One dial, and it costs the round being played the
   vertical space the phase has already fixed three times.
2. **Show less per card.** A card could draw only the units whose state MOVED that round, with the
   rest behind the card's own scroll. That is a design change to what a past round IS.
3. **Leave it.** A card is a summary you scroll into when you want it, which is what 05-11 item 17
   already asks the room about.

**Owner:** the 05-11 playtest. Item 17 asks the readability half and item 50 asks the symbol half.

---

## 7. THE BATTLEFIELD STILL NAMES ITS TYPES IN TEXT WHILE THE LANE DOES NOT

**Found:** plan 05-D29, on a screenshot, and recorded rather than acted on.

D-29's first sentence — *"show this using the symbols, rather than text"* — arrived with a
screenshot of the LEDGER LANE. The lane, the split readings, the what-changed panel, the picker's
costs and the requirement lines all took the change. `[S06.11]`'s battlefield did not, and the
reason it did not is that it was ALREADY symbols-first: every unit shape has drawn its health,
shield and tallies as that type's own tokens since plan 05-15, with a permanent visible LABEL beside
each row at UX-02's 18px floor.

So one surface on the fight tab reads `Health ●●●` and another reads `●●●` with "Health" on the
hover. **That is a real inconsistency and it is left standing deliberately**, because removing the
battlefield's labels would take the only place on the fight tab where a token type is named in text
at all — and item 50 of the playtest script asks precisely whether a room can read a square as
health without ever having been told. Removing the last label before that question is answered would
remove the thing the answer depends on.

**Owner:** the 05-11 playtest, item 50. If the room reads the symbols fine, the battlefield's labels
are a candidate for the same treatment; if it does not, the labels are what saved it.

---

## 8. THE NO-NEW-HEX RULE IS NOW CHECKED OVER THE FIGHT STYLESHEET AND NOWHERE ELSE

**Found:** plan 05-D30, by PROBE BM, and half-closed in the same plan.

`[C07]`'s banner states the rule — *"colours come out of the existing tokens through
`color-mix()`"* — and `[C13]` and `[C14]` each restate it about themselves, with `[C13]` adding
*"the danger colouring ... is not to be invented a third time"*. **Nothing in this repository had
ever checked it.** PROBE BM replaced D-30's `color-mix(in hsl, var(--accent-2), var(--coral))` with
the byte-identical literal `#ff6d78`:

```
node tests/selftest-node.cjs   1216 passed, 0 failed | 189 of 189 | EXIT=0
browser checks                 190 passed, 4 failed  <- cell 21d only
```

The whole node gate was green, and so were the two browser cells that read the mark's POSITION —
because a typed colour is pixel-identical to a derived one. **One cell caught it**, by moving
`--accent-2` at runtime and watching the mark fail to follow. A claim only a browser can make is
unchecked in every fresh checkout, which is precisely where `tests/browser-checks.mjs` is absent by
design.

**What was closed:** row `107f`, which scans `[C14]` to the close of the `<style>` block as
DECLARATIONS rather than as text — comments stripped, values cut at the colon and the semicolon,
because every id selector in this file begins with the same character a hex literal does. 517
declarations, 110 reading a `[C00]` token, 19 deriving one through `color-mix()`, **0 bearing a
literal**.

**What is still open:** `[C00]` through `[C13]` — roughly three quarters of the stylesheet, and
every block written before this phase — is unscanned. The reason the row was not widened in this
plan is scope: a row that reddened on a colour shipped in Phase 2 would be this plan asking for a
change D-30 did not ask for, and the honest place to make that call is a plan that can look at
whatever it finds.

**Owner:** whichever plan next edits an early `[C]` block. Widening the slice is a one-line change
to `hexAt`; what it costs is whatever the first run turns up.

---

## 9. THE ADVANCE CONTROL IS BELOW THE FOLD AT 1366x768 AND NO DIAL REACHES IT

**Found:** plan 05-D31, by measurement, and turned in the open rather than dialled around.

D-31 puts the two round controls with the ACTION INPUT — Advance is what commits what the input
declared. That puts them below a whole second panel. Swept in real Chrome, three rounds resolved,
twelve declarations standing, reading the bottom edge of Advance at page scroll zero:

```
  state window   @1920x1080 Advance      @1366x768 Advance
    12vh            949 of 1080            869 of 768   BELOW
    22vh           1057 of 1080  shipped   948 of 768   BELOW
    26vh           1100 of 1080  BELOW     973 of 768   BELOW
```

**At 768 no setting clears it, including zero.** Read 869 against its 92px window: the chrome alone
is 777px on a 768px screen. There is no free term in that arithmetic.

**What was done instead of tuning a number until it passed:** browser cell 18 keeps the old claim
unweakened at 1920x1080 and asserts at 768 that the control has a real box, is enabled, and is
within one page scroll of the fold — so a regression that put it at 1600 still reddens. Cell 18c is
new and asserts the property the fold was standing in for and never measured: scrolled to the picker
rows, Advance is wholly on screen **and above them**. PROBE BO is why the last two words are there.

**What is still open:** whether a room can work with it. The fix, if the rehearsal wants it, is one
line at the dial in `[C14.1]` — `max-height:min(22vh, calc(100vh - 710px))` puts Advance at 757 of
768 and costs a 58px state panel at that size. Both readings are in the comment beside the rule.

**Owner:** the 05-11 playtest, items 54 and 55.

---

## 10. THE ACTION EDITOR IS TWELVE ROWS TALL AND HAS NOT BEEN MADE DENSE YET — **CLOSED by plan 05-D32b**

**Closed 2026-08-30.** The terms region measures **707px where it measured 2507**, every one of
the twelve rows is ONE line at 41px where they were 169 and 181, and the whole authoring pane
came down from 3243px to 1421px. Measured in real Chrome and real Edge at 1920x1080 and
1366x768, headless, on the same drive that took the before numbers — browser cell 23. The other
half of this item, "the picker's display of a four-term cost", was re-read and NOT changed:
`.fg-act-cost` wraps its readings and cell 21c measures all thirty-six marks on the picker at
D-30's geometry, so the minimum plan 05-D32a shipped turned out to be the design. What follows
is the entry as it was written, kept because the before numbers in it are what the after
numbers mean anything against.

**Found:** plan 05-D32a, by construction, and it is the OTHER half of D-32 rather than a defect.

D-32 is two sentences. "allow multiple input for all cost/needs/changes" is done — all three
lists cap at four, the ops take a slot, the shell reserves the rows, and every reading below the
surface follows. "make the action configuration more dense" is NOT done, and this plan deliberately
did not start it: a plan that redesigned the terms region while it was also moving three caps, a
codec bound, an op signature and the whole disable arithmetic would have had no way to say which
of those two things broke a row.

**What that leaves on screen right now:** the authoring pane can show twelve term rows at once —
four Spends, four Needs, four Changes — each a full-height row with its own label, its own chooser
strip of one pill per token type, and its own amount field. On a board with six token types that
is twelve rows of eight pills. It WORKS: gate row 69g drives all twelve populated at once and row
110 authors a maxed action by pressing pills and typing amounts, end to end into a resolved round.
It is not dense.

**What part 2 owns:** the density pass on the terms region, and the picker's display of a four-term
cost. `.fg-act-cost` was given a wrapping flex row here so four readings do not butt together into
one long number, which is the minimum that keeps the surface working at the new caps — it is not a
design for four terms.

**Owner:** the second D-32 dispatch. Nothing here blocks the 05-11 playtest; if that runs first,
the terms region is worth watching over a student's shoulder, because how a room actually fills
four cost slots is the thing the density pass should be designed against.

---

## 11. THE ACTION EDITOR STILL SCROLLS, AND WHAT IS LEFT IS NOT THE TERMS

**Found:** plan 05-D32b, by measurement, immediately after closing item 10.

The density pass took the authoring pane from 3243px to **1421px**. The dialog's own box is
1040x1040 at 1920x1080 and 1040x728 at 1366x768 — inside the viewport on all four edges at both,
which browser cell 23c asserts — so the pane is still about 400px taller than the tallest screen
this artifact targets and the surface scrolls. Cell 23c drives that: it scrolls the dialog to its
end and requires Done to be wholly on screen and enabled, so nothing is unreachable.

**What is left is no longer the terms region.** Of the 1421px, the terms are 707. The other 714
are the title, the two teaching notes, the side chooser, the 236px action list, the name field
and the two button rows — every one of them a surface plan 03.1-05 sized and none of them
something D-32 asked about. Halving any of them is a different instruction from the one this plan
was given.

**Owner:** the 05-11 playtest. The question for a room is whether a student authoring a rule ever
needs the list and the terms on screen at the same time; if they do, the obvious move is a
scrolling terms region inside a fixed-height dialog rather than a scrolling dialog, and that is a
change to `.ae` and `.ae-terms` and to nothing else.
