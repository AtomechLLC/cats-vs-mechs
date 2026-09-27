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

### CLOSED BY D-33 P3-8 — plan 05-D33c, and it is CANDIDATE 3

**Closed 2026-08-30.** The six per-action cards are built into D-28's toggled sidebar beside the
projection, by `[S06.4]`, on the first frame of a fight and removed at rest. Measured in real
Chrome and real Edge at 1920x1080 and 1366x768, with a fight running and the panel open:

```
the view while the reading is taken     "fight"
action/reference cards on the board      12
  of which inside #refband                0      <- unchanged, and correct: REF-01's map is not
  of which inside a roster column         6         REF-02's cards
  of which inside the panel               6
the two sets name the same six ACTIONS  yes, compared by NAME rather than counted
a card in the panel has a real box       yes, in the fight view, columns display:none
one press of the toggle reopens it       yes; and the panel's OWN "Close" dismisses it
cards on screen in the BUILD view        6, the columns' — the panel's copy is display:none
cards in the panel after endFight        0
```

**Why candidate 3 and not the other two.** This entry already argued it: it "cost the band and the
columns nothing in EITHER view — which is the height dial candidates 1 and 2 both spend", and
D-33's audit made it cheaper still, because P2-12 gave that panel a header, a text-labelled close
control, a deeper shadow and a scroll cue in the same pass. The cards landed in a container that
had just been built to hold them.

**What it cost, exactly as this entry predicted.** The sidebar is two things now, so the toggle's
label and the panel's header both read **"Projection and reference"**, and the two sections inside
carry their own headings. REF-03's "readable without leaving the fight view" is served by the same
one press that PROJ-05 is — which is the developer's own reading of PROJ-05, taken in D-28,
arriving at its consequence.

**Row 101 went red the day the cards moved, exactly as it was written to.** It is turned in the
open and now asserts the arrangement that replaced the defect — six in the panel read for their
text, six in the columns, the same six actions compared BY NAME, none in the band, and the panel's
set gone at rest and back when a fight runs. The layout half is browser cell **10f**, which is new:
the panel covers nothing at either viewport at two scroll offsets, a projection figure and a
reference card both have real boxes in it, its Close dismisses it, one press of the toggle brings
it back, and the build view never shows the six cards twice.

**Not one line of `buildColumn` changed.** Plan 03-05's cross-plan edit stands; the columns still
carry their cards for the build view, which is where a student reads them while allocating.

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

### A NOTE ADDED BY PLAN 05-D33c, because this pass added a control on a rebuilding surface

D-33 P2-12's "Close" button lives inside `#strip`, which `[S06.3]` builds ONCE and never rebuilds,
so the mechanism above does not reach it: the node under the pointer survives the commit and keeps
focus. It is recorded here rather than left to be assumed, because the next control added to a
surface that IS rebuilt inherits this item.

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

---

## 12. THE BROWSER CELLS DIE ON A TIMEOUT RATHER THAN FAILING A ROW

**Found:** plan 05-D34, by PROBE G and PROBE G2b, which were about something else.

Both probes widened the action editor's footer past the dialog's content width — one by giving
D-34's control a 120-character label, one by putting a `min-width:900px` on it. Neither is a
footer defect a reader would predict from either gate: `tests/selftest-node.cjs` ran **1261
passed, 0 failed, 200 of 200, exit 0** over both of them, because it has no layout engine.

What the browser run did was not fail cell 24. It **threw**, thirty seconds into
`page.click('[data-k="ae/setActionXf/1/who/caster"]')` inside cell **23b**, and took the rest of
the run — including cell 24, the cell that would have named the actual problem — with it. The
mechanism is real and is worth writing down: an over-wide footer overflows the author pane, `.ae`
carries `overflow:hidden`, and a chooser pill in the terms region stops being pressable. **A
broken footer breaks the whole dialog, not just the footer.**

**Why this is an item rather than a fix here.** Every `pg.click` in `tests/browser-checks.mjs` has
this property — it is Playwright's default, and it has been correct for every previous pass
because a press that cannot land IS a failure. What it costs is diagnosis: the run names the first
control that became unpressable, never the change that made it so, and every cell after it is
unreported. The shape of the fix is a helper that wraps `pg.click` with a short timeout and turns
a timeout into `ok(..., false, ...)` so the run continues and the LATER cells get to speak.

**Owner:** whichever pass next adds browser cells. Nothing here blocks the 05-11 playtest, and the
shipped run is green in all four columns; this is about what a red run tells you.

---

## 13. THE +3 FORK IS WIDER THAN D-35 RECORDED, AND IT IS A PLAYTEST QUESTION

**Found:** plan 05-D35a, by three shipped rows going red.

D-35 records the fork as "identical while AP is 3, and genuinely different at the candidate
retune of 9". Driving it found the second half is right and the first is narrower than written:
`+3` **adds** to what is on the board and the refill **replaced** it, so the two agree only in a
round where a side spends its pool to nothing.

- **At three, spending all three** — the shipped 9v3 fight — they are byte-identical. `[S09.12]`
  holds that as a whole-slice equality against a literal captured at commit `fe67194`.
- **At three, leaving a point unspent** — they diverge on the shipped board. A round resolving
  one declared Lasers now leaves the pools at `[4, 5]` where a refill left `[3, 3]`.
- **At nine** — `+3` reads 11, 13, 15 over three rounds where the refill reads 9, 9, 9.

**Neither semantic is asserted to be the right one and the old one is still expressible** — a
rule of `+99` clamped by the action-point type's own max IS a refill, and `[S09.12]` drives both
side by side. So this is not work owed; it is a decision.

**The question for a room:** does a pool that carries its leftovers forward make the 9v3
contested, or does it make an under-spent round compound into a runaway? And is a student who
leaves a point unspent rewarded for it, punished for it, or simply unaffected — and did they
notice either way?

**Owner:** the 05-11 playtest, alongside the AP sweep it interacts with directly. Answering it is
a one-line edit to `DEFAULTS.rules`.

---

## 14. D-35's "SHIELD GETS A MAX OF ITS STARTING VALUE" IS NOT A TYPE PROPERTY

**Found:** plan 05-D35a, while writing `DEFAULTS.tokens`.

D-35's orchestrator note says the shield "simply has no round rule by default (and a max of its
starting value)". The first clause shipped exactly as written — the shipped `rules` list carries
no shield entry, which is how the old no-refill ruling survives as an absence a student can fill.
The second cannot be implemented as stated: **bounds are properties of the TYPE**, which is the
developer's own wording ("a property for min and max of a token on a unit or side"), and three
mechs may start at three different shields. There is no single number "the shield's starting
value" for a type-wide field to hold.

What shipped instead: shield carries the type-wide pair `[0, MAX_ALLOC]`, like every other
shipped type, and the no-refill behaviour comes entirely from the absence of a rule.

**Why this is an item rather than a fix.** Two readings would satisfy the note, and both are
changes of kind rather than of value:

1. **A per-unit bound** — a bounds pair on the unit record as well as on the type. That is a new
   scope for a field the whole codec, the whole clamp and the whole authoring surface are built
   around, and it doubles the wire cost of bounds on a 24-a-side board.
2. **A bound that resolves to another field** — `shield.max` meaning "this unit's build shield".
   That is a per-type special case in a vocabulary D-24 exists to keep free of them, and the same
   shape was declined for `ap` in this plan for the same reason.

**Owner:** part two of D-35, or the developer, on the evidence of a room. The concrete question a
playtest answers is whether anybody authoring a `+1 shield` rule then wants it to stop at the
number the unit started with — which is the only case where the difference is visible at all.

---

## 15. WHERE A STUDENT EXPECTS TO EDIT A ROUND RULE MID-FIGHT

**Found:** plan 05-D35b, placing D-35's authoring surface.

D-35's second dispatch was given a placement choice and told to record the alternative. What
shipped: **the reading is in the fight tab's round-STATE panel and the editing is in the build
view**, as one block drawn from one notation ([S06.12]'s `symRoundParts`) by two surfaces.

The alternative — editing inline in that state block — was declined on D-31's own line. D-31
split `#fightbar` into "where the round stands" and "what you are about to do"; a list of eight
editable rows is neither, it is authoring, and it belongs beside the rosters it acts on. The
second reason is a room: an instructor stands in front of a projector in the fight view, and
eight editable rows in that region are eight more things to mis-click while a board is live.

**What a rehearsal has to answer, and this comment cannot.** A student who is three rounds into a
fight, watching a decay rule do something they did not expect, has to switch to the build tab to
change it. Is that switch a cost they notice? Does anyone look for the rule in the panel that is
showing it to them and fail to find a control? Both readings are on screen and one of them is
inert — which is exactly the shape that reads as a broken control if it reads wrong.

**The cheap fix if the answer is "they look in the panel":** the state block gains one line
saying where the rules are written, in the register `#fight-said` already uses. The expensive one
is moving the editor, and it is expensive because it re-opens D-31.

**Owner:** the 05-11 playtest.

---

## 16. THE WHAT-CHANGED READING SAYS A NUMBER MOVED AND NEVER WHICH RULE MOVED IT

**Found:** plan 05-D35b, wiring the third surface.

D-35's dispatch asked for "the ledger's round record and/or the what-changed reading" to show
the round-rule deltas. What shipped is the second: `ldNowSide` walks the tally bags now, so a
decay a student authored is visible as `Cat 1 — Rage 3 to 2` in the same notation and on the same
surface every other change on that board is read in.

**What it does not say is WHICH rule did it**, and that is deliberate on two grounds. The reading
has never attributed a health change to an action either — FIGHT-15's design is a diff derived at
render time, with no second structure claiming to be what happened, and [S06.8]'s own paragraph
rules that a round card carries only the facts a diff CANNOT show. And attribution would need
`advanceRound` to write a per-rule record, which is an ops change this dispatch was explicitly
scoped out of: part one finished the ops and the codec.

**What a room decides.** If a student cannot tell a decay apart from a damage transformation that
happened to land on the same tally, the answer is a per-rule entry on the round record and a
`ldRulesInto` beside `ldDidInto` — one plan, at the same level `hand` already sits at. If they
can, because the "Each round" block above tells them what the rules are, nothing is owed.

**Owner:** the 05-11 playtest.

---

## 17. THE BATTLEFIELD'S RESOURCE READINGS ARE A POINTER AFFORDANCE, NOT A KEYBOARD ONE

**Found:** plan 05-D36, wiring the readings.

D-36 makes every resource reading on the fight tab a press target. Two of the four classes are
reachable by keyboard and two are not, and the reason is a content-model constraint rather than a
choice:

- **The team-resource rows ARE real `<button>`s.** They sit inside nothing, so they can be. Tab
  reaches them, Enter opens the control, the keyboard goes into it, Escape shuts it and hands the
  focus back to the row. Browser cell 26d drives that round trip end to end.
- **A battlefield reading is a `<div>` inside `.bf-unit`, which is itself the retarget flow's
  `<button>`.** `<button>`'s content model allows neither an interactive descendant nor a
  descendant carrying `tabindex`, so the reading cannot be made focusable without either shipping
  invalid markup or restructuring the shape.

**So a student on a keyboard can rule a side's pool and a side's tally from the fight tab, and
cannot rule a unit's health, shield or tally from it.** The board tab's own paths are unchanged
and the alive toggle is still there, but there is no keyboard route to the *fight-slice* unit
numbers from anywhere.

**The fix, priced.** Lift `.bf-lines` OUT of the shape button: `.bf-unit` becomes a plain wrapper
holding a `<button class="bf-plate">` (the retarget control, carrying the name, the dead sentence
and the Pick word) and a sibling `.bf-lines` of real `<button class="bf-res">` readings. It is
valid, it is fully keyboard-operable, and it costs about twenty assertions across both suites —
every one that reads `[data-fg="bf"]` as "the shape node" and then reaches inside it for
`.bf-line`, `.bf-name`, `.bf-said`, `.bf-pick` or the `bf-unit--lit` / `--dead` classes
(`selftest-node.cjs` 11406, 12610-12736, 12968-13061, 13227; `browser-checks.mjs` 595, 698-714,
1084-1126, 2094). It also shrinks the retarget flow's click target from the whole plate to the
name row, which is a **design** question the developer should answer rather than an executor.

**Owner:** the 05-11 playtest, or a plan the developer asks for. It is written down here rather
than half-done in 05-D36, whose scope was the control.

### CLOSED BY D-37 — plan 05-D37, AND NOT BY THE FIX THIS ENTRY PRICED

**Closed 2026-09-01.** The resolution is **a different control**, not the twenty-assertion
restructure priced above — and this entry is closed by NAMING that rather than by implying the
priced fix was taken.

The developer, one round after D-36: *"click on a unit then click on the popup window to modify
the values associated with it."* D-37's own interpretation says what that does to this entry:
*"the popup resolves D-36's own two deferred items (17: the popup is a true keyboard surface with
real buttons; 18: a value at zero is present and clickable in the popup)."*

**Why the content-model problem simply stops existing.** This entry's whole mechanism was that a
`.bf-line` is a `<div>` inside `.bf-unit`, which is a `<button>`, and `<button>`'s content model
allows neither an interactive descendant nor a `tabindex` one. D-37 removes the reading's press
target from the shape entirely — `bfBuildUnit` no longer writes a routing attribute on a line —
and puts every one of a unit's values in `#fg-unit`, whose rows are real
`<button class="stp-btn fgu-btn">` inside a plain `<div>`. There is no nesting left to constrain.

**The route, driven end to end in both suites.** Check 122 in `tests/selftest-node.cjs`; browser
cell 26h in real Chrome and real Edge at 1920x1080 and 1366x768, with a REAL Tab rather than a
stand-in for one:

```
the keyboard on the shape          BUTTON  data-k="fg/bf/cats/c4"
Enter                              popup open on c4, focus on fg/u/cats/c4/hp/less
Enter                              health 3 -> 2, one hand ruling
ArrowUp / ArrowDown                3, then 2 — the KEY decides the sign, not the button
Tab, Tab, Tab                      fg/u/cats/c4/hp/more, shield/less, shield/more
Escape                             box shut and emptied, focus back on fg/bf/cats/c4
```

**What the priced fix would have cost and no longer has to.** Lifting `.bf-lines` out of the shape
button would have moved about twenty assertions and — the reason it was a DESIGN question rather
than an executor's — would have shrunk the retarget flow's click target from the whole plate to
the name row. D-37 leaves the plate whole: the shape is still one control, and it now has two jobs
separated in TIME (at rest it opens the popup; while a change of target is half made it retargets,
which is the developer's own parenthesis).

---

## 18. A RESOURCE READING THAT IS HIDDEN AT ZERO CANNOT BE CLICKED BACK UP

**Found:** plan 05-D36, driving the four reading classes.

`[S06.11]`'s hide pass takes a battlefield line away when its amount is zero — every type except
health, which is exempt for a reason its own paragraph gives at length. So a shield ruled down to
zero, or a tally that reaches zero, **stops being a press target**, and the D-36 control cannot
bring it back up from the fight tab. `[S06.14]` handles this correctly rather than silently: the
box closes on the frame its anchor stops being drawn, instead of floating over the page pointing
at nothing.

**It is not obviously wrong.** A reading that is not there is not a reading, and the rule that
hides it is D-33 P2-11's, measured against a photograph of a labelled empty box. But a student
running a Recharge house rule wants to put a shield back, and today the route is the board tab's
build stepper — which edits the **allocation**, not the fight — or an undo.

**The three admissible answers,** none of them taken here because each is a design decision:
1. exempt `shield` from the hide pass during a fight, as health already is;
2. draw a zero reading for every type in the fight view and let D-33's rule govern the board only;
3. give the nudge box a way to reach the whole unit rather than one reading — which is a different
   control from the one the developer asked for.

**Owner:** the 05-11 playtest.

### CLOSED BY D-37 — plan 05-D37, AND IT IS ANSWER 3

**Closed 2026-09-01.** This entry wrote out three admissible answers and said each was a design
decision. The developer made it, by asking for the third one in as many words: *"click on a unit
then click on the popup window to modify the values associated with it."* D-37's interpretation
confirms the reading — *"18: a value at zero is present and clickable in the popup"*.

**Answers 1 and 2 are NOT taken, and the difference matters.** The battlefield's hide pass is
untouched: `[S06.11]` still takes a line away at zero for every type but health, and D-33 P2-11's
rule that a line which STAYS at zero must SAY zero still governs health alone. Nothing about what
the battlefield draws has changed. What changed is that the battlefield is no longer where a
unit's numbers are ruled on — `[S06.15]`'s popup walks `bfTokenIds` WHOLE and draws every value
the unit holds whatever the number is, in D-21's own count form for a zero.

**Driven, in both suites, on the exact value this entry is about.** Check 121 in
`tests/selftest-node.cjs` drives the FIGHT shield to zero and reads the popup back; browser cell
26g does the same in real Chrome and real Edge at both viewports and confirms the other half by
LAYOUT — that the battlefield's shield line really is gone:

```
the shield line on the shape       hidden=true, height=0px
the popup's shield row             present, "Cat 1 Shield, 0.", the count form with one token
its + button                       present, and one press writes {unit:c1, tok:shield, 0 -> 1}
```

So a student running a Recharge house rule puts a shield back from the fight tab, which is exactly
what this entry said they could not do.

---

## D-39 P2-13's LAYOUT HALF — `align-items:start` on `.ht-grid`

**Raised 2026-09-02 by plan 05-D39a.** D-39's Pass A groups this as a free win: *"`align-items:
start` on the grid so cards size to their content"*, against a measured **1,095px of empty card**
across the how-to tab's six panels.

**The void is real and the measurement reproduces.** At 1366, per `.ht-card`, height versus where
its content ends: 646/185, 646/236, 646/17, 667/333, 667/17, 667/231 — **1,019px**. With
`align-items:start` every card's void drops to 17px.

**It is not taken, because D-38 already took it and reverted it with a picture,** and this pass
took both pictures again rather than trusting either party. `[C18]`'s own banner records the
first run: *"align-items is left at its initial `stretch` DELIBERATELY, and it was changed to
`start` and back again with a picture of each."*

**What the two pictures show** (`ht-stretch.png`, `ht-start.png`, 1366x768, full page, in
`scratchpad/d39a/`): the void does not go away under `start`. It MOVES — out of the panels, where
a border accounts for it, and into the gaps between them, where nothing does. Grid rows are still
sized to their tallest item, so row 1 leaves 167px under "The board" and 218px under "Tokens"
beside a full-height "Actions", and row 2 leaves 316px under "Sharing". The rack reads as three
ragged pairs instead of two rows of three. D-38's sentence is exactly right.

**The audit's own alternative is the live one:** *"or a `column-count` flow so six cards of unequal
length fill."* Not taken here either — it needs `break-inside:avoid` and it changes how a card
relates to its neighbours, which is a design decision and not a token swap.

**And the other half of P2-13 moves a floor anyway.** Dropping the "HOW THIS WORKS" eyebrow — the
part of the finding that is unambiguously right, since it repeats the tab's own switch label 50px
above it — moves `HOWTO_FLOOR` (24) and `SUITE_FLOOR`. So the finding cannot be free in any case.

**Owner:** whichever pass takes P2-13's string half, which can re-derive the floor once and settle
the grid at the same time.

---

## D-39 P3-4 — the dialog's sticky edges cut the body with a hard edge

**Raised 2026-09-02 by plan 05-D39a.** D-39 P3-4, listed under Pass A at **GATE: None**:
*"`[C16]`'s edge-fade idiom exists and is not applied to the two sticky edges."*

**The defect is real and was photographed this pass** (`ae-scrolled.png`, `ae-topedge.png`,
`ae-botedge.png`, 1366x768, a maxed action, `.ae-body` scrolled to a third). At the top the name
field's bottom curve is sliced flat; at the bottom the word "Changes" is cut through the middle of
its letterforms by the sticky footer. It reads as a rendering fault rather than as an invitation
to scroll, exactly as the audit says.

**But the premise of the prescription is false, and that is why this is deferred rather than
done.** `[C16]`'s idiom is the four-layer scroll shadow, and it is a **background**. Backgrounds
paint BEHIND content. It cannot soften a cut through a glyph, and it is *already applied to both
dialog bodies* — `.pk-body` and `.ae-body` have carried all four layers since D-33c. Measured this
run: `bgLayers: 4`, `background-attachment: local, local, scroll, scroll`, `--fade-cover: #191d26`.
Applying the named idiom is a no-op because it is already there.

**What the finding actually needs is an OVERLAY, and there is no Baseline way to make one
self-gating.** The four-layer trick's whole virtue is that it shows nothing when a region does not
overflow. An overlaid gradient has no equivalent — it would dim the first 18px of content
permanently, including when the box is scrolled to the top and nothing is cut, which is the
"permanent smudge at the edge" `[C16]`'s own `--fade-cover` paragraph warns against. The
mechanisms that WOULD gate it are `animation-timeline: scroll()`, which `CLAUDE.md` lists under
**What NOT to Use** ("Not Baseline; Chrome-only"), or a scroll listener, which this file has
deliberately never had.

**Measured, and worth recording for whoever takes it:** `.ae-foot` is `position:sticky` and its
top edge sits at 643 against `.ae-body`'s bottom at 661 — it **overlaps the body by 18px**, which
is exactly the height of the bottom shade layer. So the bottom cue is not merely ineffective, it
is painted underneath the footer and can never be seen. The footer's existing `border-top:1px
solid var(--line)` is present and is not enough on its own.

**The three admissible answers,** none taken here because each is a visual decision rather than a
token swap — the same call `05-D33a` made when it carried P3-6 out of its own Pass A:
1. an overlay pseudo-element on `.ae-head`/`.pk-head` and `.ae-foot`/`.pk-foot`, accepting a
   permanent shallow vignette at both edges;
2. a heavier hairline plus a shadow on the two sticky edges, saying "the box ends here" in shape
   rather than fading anything;
3. give `.ae-foot` a real `box-shadow` upward and stop the body 18px short of it, so the two stop
   overlapping and the existing bottom shade becomes visible for the first time.

**Owner:** a pass that can look at a picture of all three. Answer 3 is the cheapest and is the only
one that makes the shipped cue work rather than adding a second one beside it.

---

## D-39 P2-2's `.ae-pill` HALF — the action editor's tick still hangs outside its button

**Raised 2026-09-02 by plan 05-D39a.** D-39 P2-2 asks for the selection tick to be contained on
both pill classes, at **GATE: None — spacing and order only**. `[C17]`'s `.rr-pill` took it and
the whole harness stayed green. **`[C12]`'s `.ae-pill` did not, and the cost is two browser
cells.**

**Written, run, measured, reverted.** The in-flow spelling — the one `.rr-check` now carries — was
applied to `.ae-check` and `tests/browser-checks.mjs` was run against real Chrome at 1920x1080:

```
FAIL 23.  the terms region is dense — twelve rows, every one of them ONE line
          rows [41,48,48,48,41,48,48,48,87,94,94,94]
          the four CHANGES rows went to TWO lines
FAIL 23c. ... and the tick is SHOWN on the pressed pill
          tickDx  0 -> -14
```

**Both failures are the finding's own price and neither is incidental.** The Changes rows carry the
Caster/Target pair on top of seven token pills, so they sit closest to the line's edge; ~20px of
newly in-flow tick per pill pushes them over. That is D-32b's dense editor — the surface D-33 P2-7
was written about — being broken to fix a 4px mark. And cell **23c reads `tickDx` and asserts the
overhang as the shipped geometry**, so the change does not merely disturb a measurement, it turns
a claim the harness makes on purpose.

**Which makes it D-30's and D-32's, not Pass A's.** D-39 itself reserves the badge-and-sign
notation for its pass G, behind a developer decision, in as many words: *"This is D-30's spec —
raise before implementing."* The tick's position on a pill is the same notation on the same
surface.

**One half of the finding landed for free anyway.** D-39 P2-6 deleted the outline from
`.ae-pill--on`, so the accent ring no longer draws **through** the glyph — which was what made the
tick photograph as a clipped "⌄" rather than as a mark. What remains is the original recorded
trade: 6.5px of mark hanging into a 6px gap, with nothing crossing it.

**The three admissible answers:**
1. contain the tick and pay for it by re-deriving `.ae-term`'s density — re-measure cell 23's
   twelve rows and turn 23c openly, which is a re-measurement pass and not a spacing tweak;
2. contain the tick and claw the width back from `.ae-pill`'s padding, which is the same
   re-measurement with a smaller budget;
3. leave it, on the grounds that with the ring gone the mark reads correctly and the density is
   worth more than the 4px.

**Owner:** pass G, with P3-2 and P3-3, since all three are D-30's notation and the developer has
already been asked to rule on that group.

---

## D-39 P2-3's `.rr-pill` HALF — the round-rules controls are still 3px under the floor

**Raised 2026-09-02 by plan 05-D39a.** D-39 P2-3 is right and its stated cost is wrong.

**The finding holds.** `.rr-pill-name` runs **15px** and `.rr-check` ran **13px**, against `.brd-btn`
18, `.vw-btn` 18, `.unit-rm` 18, `.fg-act` 18 and `.fgu-alive` 18. `[C07]`'s banner sets the rule
— *"a real, permanently visible text label at the 18px minimum, never an icon"* — and the
round-rules grid, which carries up to ten controls per rule across up to eight rules, is the one
authoring surface below it. Projector legibility is this artifact's stated bar.

**The audit's "GATE: None — font sizes only" does not survive 1366.** Driven in real Chrome and
real Edge, `#rr-list` with the five shipped types:

| `.rr-pill` | list width | columns | slack | row heights |
|---|---|---|---|---|
| **15px** (shipped) | 1284 | 123 449 523 90 82 | **17** | 41, 48 — one line |
| **18px** (asked) | 1284 | 123 505 484 90 82 | **0** | 82, 89 — **two lines** |

Browser cell **25a** asserts *"two rules, ONE LINE EACH"* at the shipped vocabulary, in both
engines at 1366, and its binding clause is the **slack** — its own banner says so: *"a track with
no free space cannot claim any... the SLACK is what catches the track."* At 18px there is none.
There were 17px of room and "Who it reaches" alone wants 56 more.

**And the width is not recoverable.** Three reclamations were driven on the live page —
`.rr-cell` `padding-inline-end` 14→8, `.rr-read` `min-width` 96→0, `.rr-pill` `padding` 8→6 — and
**all three together** left `slack: 0` and the rows at 82 and 89. The columns redistribute; the
grid is already over-constrained and the token track is the only one permitted to shrink. This is
not a padding problem.

**The three admissible answers,** none taken here because each decides what this surface *is*:
1. drop a column — "The rule" reading is also drawn in the fight view's own `.fg-eachround` block,
   so the authoring grid may not need to repeat it;
2. shorten the party words — "Cats, each unit" is the longest and it is four controls wide;
3. let 1366 wrap to two lines and turn cell **25a** openly to assert the wrapped shape, which
   `align-items:start` (landed this pass) already makes read correctly.

**Answer 3 is nearly free now** and is the one to look at first: the only thing standing between it
and green is a cell that was written when one line was achievable.

**What DID land this pass:** `[C07]`'s `.pk-sw` went **13px → 18px** (with `min-width` 66 → 84) and
cost nothing at either viewport, and `.rr-check` went 13px → 14px to match `.pk-check` and
`.ae-check`. The `.rr-check` containment also landed and is unaffected — it was re-driven at 15px
and the row stays one line with 17px to spare.

**Owner:** a pass that can turn cell 25a, or the 05-11 playtest if the room says the round-rules
words are unreadable from the back.

### CLOSED BY PLAN 05-D39d, AND BY NONE OF THE THREE ANSWERS ABOVE

**2026-09-02.** The table above is exact and the question it asks is the wrong one. It asks what
one-line-at-1366 costs in **font size**. The question that settles it is what one-line-at-1366 costs
in **token types**, and the answer is one.

Driven four times at 1366x768, real Chrome and real Edge, two rules, every figure identical in the
two engines to the pixel:

| board | `.rr-pill` 15px | `.rr-pill` 18px |
|---|---|---|
| the five shipped types | slack 17, **ONE line**, card 372 | slack 0, two lines, card 535 |
| **+ ONE student type** | slack 0, **TWO lines**, card 535 | slack 0, two lines, card 535 |
| + a second student type | slack 0, two lines | — |

**The 18px board and the six-type board are the same board** — card 535, page 3289, the Add control
at 3169, in both engines at both font sizes. So 18px does not create a shape this file does not
already have; it arrives at that shape **one token type early**, and from the sixth type on it is
free. At 1920 nothing wraps at all, at either size, at five, six or seven types (slack 96 at the
worst measured).

Which makes the property being protected the thing to look at. "Every row is one line at 1366" holds
for the five types the board ships with and stops holding the moment a student authors their first —
which is the exercise this artifact exists for. It was never a property of the surface; it was a
property of the surface *before the workshop starts*.

**What landed:** `.rr-pill` 15px → 18px. Cell **25a** turned in the open and it now branches on the
width, which is the honest shape rather than the weak one — PROBE DC's finding is that `slack` is the
reading that catches a stretched token track and that a row with no free space cannot be caught, so
at 1366/18px the discriminator is **absent** rather than weakened. It is asserted at 1920, where 177
px of slack remain, and PROBE DC was re-run and reddens there in both engines. At 1366 the wrapped
shape is asserted instead: columns aligned to a pixel, the amount still against its pills, one Remove
per row, and the band bounded at 96 so a **third** line still fails.

**ANSWER 2 IS STILL OPEN AND IS NOT A LAYOUT DIAL.** Shortening "Cats, each unit" recovers about
120 px and buys the one-line row back at 1366 on the fresh board. It is a rendered string on four
controls and it is the developer's vocabulary. **Owner:** the developer, or the 05-11 playtest.

---

## D-39 P1-2's SECOND HALF — "9 of 9 still standing" is printed twice, 106px apart

**Raised 2026-09-02 by plan 05-D39b.** P1-2's pool half landed; this is the other duplicate the
audit names in the same finding and it is deliberately not touched.

**What was measured**, 1920, a fight running, the sidebar open, all three readings on one screen:

| element | reads |
|---|---|
| `#state-cats .fg-standing` (state card) | `9 of 9 still standing` |
| `#strip .dc-live-read` (sidebar) | `9 of 9 still standing.` |

**It is a DUPLICATION and not a CONTRADICTION**, which is why it is a different problem from the
pool. Both readings come from `App.model.aliveCount` over the same slice in the same frame and they
agree to the character; a student reading them side by side learns nothing false. The pool
readings disagreed in *figure* and in *vocabulary*, and that is the whole of what this pass was
sent to fix — "one pool truth", in the plan's own words.

**Why it is not simply deleted.** The sidebar's block is `[S06.9]`'s "The fight as it stands", and
the standing count is the first of its three lines; the state card's is `[S06.7]`'s `fgFillStanding`
and is the heading of the side's own column. Each is the opening reading of its own region, and a
region that opened with a turns-to-wipe figure and no roster count would be a projection about a
side it had not named the size of. Removing either is a decision about what one of those two
regions IS, which is the kind of decision D-39's own P1-2 item 2 poses ("either the topbar keeps
the round number and one compact figure per side while the state card keeps the sentence, or the
reverse") and leaves to the developer.

**The three admissible answers:**
1. drop it from `#strip` and let the sidebar open on its pool line, on the ground that the state
   card is 400px away and always rendered;
2. drop it from the state card and let the column open on its team resources, on the ground that
   the battlefield below it already draws one shape per standing unit;
3. leave both, on the ground that they agree and each opens its own region.

**Owner:** the pass that owns `[C15]`'s content, or the 05-11 playtest — this is a question about
what a room reads, and node row 102b's technique (compare the two renderings to each other) is
already in the file for whichever survives.

### SWEPT BY PLAN 05-D39d AND LEFT STANDING — answer 3, with one figure that changed

**2026-09-02.** Re-read and left, because none of the three answers has become cheaper and one of them
has become *less* attractive. What changed is D-39 P2-10, landed this pass: the two sides' rows now
open on the same line, so the state card's two standing counts — "9 of 9 still standing" and "3 of 3
still standing" — sit **side by side at the same y** instead of 75 px apart. That is a comparison a
room can make at a glance, and it is the reading D-27 asked those columns for. Removing the state
card's copy (answer 2) would take that away to fix a duplication that is not a contradiction.

Answer 1 (drop it from `#strip`) is still admissible and still a decision about what that region is.
Answer 3 (leave both) is what ships, and it now has a reason rather than only an absence of one.

---

## D-39 P1-3's SIDE-EFFECT — `.err-detail` is the last unstyled scrollbar in the artifact

**Raised 2026-09-02 by plan 05-D39b,** found on a screenshot taken with `--hide-scrollbars`
removed from headless Chrome's default args.

`[C16]`'s scrollbar treatment names nine boxes and, after this pass, ten. `.err-detail` — the
read-only textarea in `[C08]`'s error panel that carries the stack trace — is not one of them, so
Chrome draws it in its light default: a white bar down the right of a dark panel. It is the exact
shape of the defect D-33 Pass C found on `.pk-body` and `.ae-body` and fixed, one region over.

It is **out of scope for this pass** by the rule this project keeps: only auto-fix what the
current task's own changes caused, and this predates the task. It is also the lowest-stakes
instance of it in the file — the panel is a failure surface, not a workshop one.

**The fix is one selector**, appended to `[C16]`'s three lists with `--fade-cover:var(--panel)`.
Photographed at `d39b/w1920-chrome-err-panel.png`.

**Owner:** any pass that touches `[C08]` or `[C16]`.

### CLOSED BY PLAN 05-D39d — this pass touches both

**2026-09-02.** `.err-detail` joins `[C16]`'s three lists with `--fade-cover:var(--panel)`, exactly as
priced. Two things came with it that were not in the pricing:

1. **`[C08]`'s rule went from the `background` shorthand to `background-color`.** That is Pass B's own
   recorded rule about `[C16]`, and PROBE DN measured what the shorthand costs — the cue silently goes
   to zero layers with nothing on screen to say so. Order alone would have saved it here, because
   `[C16]` is later in the sheet at equal specificity; it is written the safe way anyway, because
   "later in the sheet" is a property of the file and not of the rule.
2. **The cell that reads it back had to be told what its own runner cannot see.** A first draft
   asserted the **gutter**, on P1-3's argument that a gutter is the only proof a bar is drawn. That is
   true of a runner that drops `--hide-scrollbars`, and `tests/browser-checks.mjs` **does not drop
   it** — line 81 launches with Playwright's defaults. The gutter read **2 px**, which is the
   textarea's own two borders and is exactly the "no scrollbar takes any width" figure the D-39 audit
   reported and Pass B explained. Cell 25d asserts `scrollbar-width: thin`, a thumb colour that is not
   the initial `auto`, the four-layer cue and a box that genuinely overflows. **The pixel half was
   taken out of band** at 1400x900 with the flag removed: 12 px of gutter and a dark bar, photographed
   at `d39d/after-errpanel.png`.

**A note for whoever drops `--hide-scrollbars` from line 81:** the gutter clause belongs back in cell
25d that day, and the paragraph at the read says so.

---

## D-39 P1-6's TWO REMAINING ITEMS — naming the restore point, and the inert-looking control

**Raised 2026-09-02 by plan 05-D39c,** which took the finding's first item (the receipt) and
left the other two.

The audit asks for three things of "Put this action back how it was". The first landed: after the
press, `#act-edit-said` states what came back and where the recovery is, and a press with nothing
to put back says so in its own sentence. The other two did not, and each was priced:

**Item 2 — "say the restore point on or beside the control while the editor is open."** This is a
PERMANENT string on a surface that already carries a 278px label saying what the press does. It
moves `DIALOG_FLOOR` (138) and `SUITE_FLOOR` (1186) — unlike the receipt, which ships hidden and
empty and costs the harvest nothing until it says something. It is also a second sentence about
the same press standing beside the first, which is what D-39 P1-2 is a finding about one surface
over. The receipt answers the same question at the moment a student has it.

**Item 3 — "when the snapshot equals the current record, make it inert-looking rather than
disabled."** A new visual state on a control that check 113b reads at five moments for never being
disabled. The pass answered the same need with WORDS instead — the inert press now prints "This
action is already the way it was when you selected it. Nothing was put back." — which is the
channel this artifact already uses for "the press moved nothing" everywhere else (`.fgn-says`,
`.fgu-says`, the bound sentences). A greyed-looking control and a sentence are two answers to one
question, and the sentence is the one the rest of the file gives.

**Owner:** the 05-11 playtest. Both are questions about what a room needs on that surface at the
moment of the press, and the receipt is now on screen to be judged against.

---

## D-39 P1-4's PROBE DP IS GREEN AT 1920 — the clamp defect is not reachable at that height

**Raised 2026-09-02 by plan 05-D39c.**

PROBE DP put the shipped two-arm clamp back into `fgBoxAt` and browser cell 26i reddened at
**1366x768 in both engines and stayed green at 1920x1080 in both.** That is the geometry being
honest rather than the cell being weak: the defect needs a box taller than the room on BOTH sides
of its shape, and at 1080 with the shipped 9v3 roster the box is 349px against roughly 470 above
and 530 below at the cell's own scroll positions. It becomes reachable at 1080 only with enough
student-authored unit-scope types to push the box past ~470px, which is about four.

**What it costs:** a regression in that arithmetic would be caught at 768 and not at 1080. Both
sizes run in both engines on every gate, so nothing is unwatched — but a later plan that narrows
the cell to one viewport would silently lose it.

**The fix, if a pass wants the belt:** author two extra unit-scope types in 26i's own setup before
the scrolled drives, which puts the box past the 1080 threshold too. It was not done here because
the cell would then be building a board no other cell in the file builds, and the note beside it
prints the arm counts a reader can check.

**Owner:** any pass that touches cell 26i.

### SWEPT BY PLAN 05-D39d AND LEFT, for the reason Pass C gave and one more

**2026-09-02.** Re-read against the instruction to close what is genuinely cheap. It is not cheap in
the sense that matters: the fix is not the two lines of setup, it is that **cell 26i would then be
the only cell in the file building a four-student-type board**, and every other clause in that cell
(the arm counts, the bound, the mark, the reachability of "Mark dead") would be measured against
geometry no other cell shares. A cell whose setup is unique is a cell whose red run nobody else can
reproduce.

The asymmetry is also not unwatched: both sizes run in both engines on every gate, so the regression
is caught at 768 in four columns. What the entry actually guards against is a **later** plan
narrowing the cell to one viewport, and the honest protection for that is this paragraph rather than
a board nothing else builds.

**Owner:** unchanged — any pass that touches cell 26i, and now with a reason to leave it alone.

---

## D-39 P2-14's HEIGHT HALF — the top bar still grows 37px when a fight starts

**Raised 2026-09-02 by plan 05-D39d,** which took the finding's horizontal half and priced this one.

**What landed.** The cluster used to open at x=159 on the board and x=487 in a fight — 328 px of
void arriving on one press, under an `h1` and a view switch that do not move. One declaration did it:
`.brd-cluster` is content-sized on the board so its `justify-content` has no slack to spend, and
`.fg-read`'s `flex:0 0 100%` makes it full-width in a fight, where `flex-end` pushed 1278 px of tools
to the end of 1600. Both rows open at the bar's own edge now, at both viewports, in both engines.

**What did not, and the number that decided it.** The audit also asks that the round/pool row be
reserved permanently "so the bar does not change height on `startFight`". Measured: `#topbar` is
**64 px on the board and 101 px in a fight**, at both viewports.

Reserving it spends **37 px of a sticky bar on every frame of the build phase** — the phase a student
spends most of the workshop in — to smooth a transition that happens **once per fight, at the same
instant the whole viewport changes tabs**. Everything else on screen is being replaced at that
moment; the bar's height is the least of what moves. And this file has two open entries about the
above-the-fold budget at 768 (items 2 and 9 above), which is the budget the reservation would spend.

**The three admissible answers:**
1. leave it, on the ground that the growth is paid at a tab change and the reservation is paid always;
2. reserve it, on the ground that a sticky bar that changes height is a sticky bar a room notices —
   which is a claim only a rehearsal can settle;
3. reserve it **only in the fight and howto views**, which is a third `data-view` rule and buys
   nothing, because the board view is the only one where the row is absent.

**Owner:** the 05-11 playtest. Browser cell 9b **prints** the 64-to-101 figure rather than judging it,
so whoever takes this can read what it cost and what it saved without re-driving anything.

---

## D-39 P3-7's FOUR DIALOG ORIGINS — untouched by this pass, and the reason is a measurement it did not take

**Raised 2026-09-02 by plan 05-D39d.**

The audit's fourth P3-7 bullet: "Four dialogs, four vertical origins: `#tok-picker` y=20 h=1040,
`#act-edit` y=55 h=971, `#share` y=387 h=306, `#reset-ask` y=392 h=296."

**It is not obviously a defect and this pass did not have the measurement that would decide.** The
same bullet records that D-33 P2-5's *flicker* is fixed — the two share panes now differ by 2 px of y
and 5 px of height, against 48 and 102 before — which is the case where two origins were a defect,
because the same surface moved under a student's eye. Four *different* dialogs opening at four
heights is what `place-items:center` on four boxes of four heights produces, and centring is the
shipped behaviour of every one of them.

**What would settle it** is a picture of the two authoring dialogs opened in sequence at 768, where
the 1040 and the 971 both exceed the viewport and the clamp is doing the work — not a table of four
numbers taken at 1080. This pass photographed neither.

**Owner:** the 05-11 playtest, or any pass that opens two dialogs in a row at 768 and reads the
result back.

---

## D-39 P3-6 AND P2-15, P3-2, P3-3 — the four this pass was told not to touch, restated so the list is in one place

**Raised 2026-09-02 by plan 05-D39d.**

**P2-15** (the proposal pane is the only prose pricing surface), **P3-2** (the removal badge is larger
than the token it marks; the picker's tokens run at half the document scale) and **P3-3** (a +1 rule
and a −1 rule differ by a ~4 px mark) are the three the audit itself flags as **developer decisions**
and reserves for its pass G. They are untouched here by instruction. Pass A added two more to that
pass's list: `.ae-prop-pill--on`'s outline with no tick rule to show, and P2-2's `.ae-pill` half with
browser cells 23 and 23c priced.

**P3-6** — every cost/needs row leaving 305 px empty at its tail, the three term lists having three
right edges, and `None` being chip 1 on cost/needs and chip **3** on changes — is **not** flagged as a
developer decision by the audit and is untouched here anyway. It is D-32's density on the action
editor, which is the same surface and the same geometry pass G already owns twice over, and a pass
that moved the tail void without the badge decision would be restyling those rows a second time.
Pass A's own sequencing argument, at the surface it was written about.

**Owner:** pass G, after the developer rules on the three.

---

## D-41 PART TWO — the pool and the drag, on top of the op part one built

**Raised 2026-09-25 by plan 05-D41a.**

Part one built everything below the surface: `faction.reserve`, `App.ops.moveToken` (one op, every
drag, flat ends `fromSide`/`fromUnitId`/`toSide`/`toUnitId`, a null unit meaning the side's end),
`App.ops.readReserve`, `App.data.MAX_RESERVE`, and the `P` section on the wire. **Nothing draws the
reserve and nothing drags.** Part two owns the per-side pool at the top of each column, the
pointer-events drag with its threshold, the lit/invalid target states, Escape-to-cancel, and the
interaction-gate rows for all of it. Every refusal the op raises is a plain Error carrying a sentence
already written for a student, so the surface can hand them to `[S07.1]`'s refusal channel as they
stand.

**A PRE-AMENDMENT ATTEMPT AT PART TWO'S SURFACE IS PARKED, NOT LOST.** It was found uncommitted in
the main working tree when this dispatch began, written against D-41 as first recorded — before the
amendment — and it is on the local branch **`wip/d41-pre-amendment-drag-ui`** at `d081c3b`. It
carries a `[S06.16]` tray and ghost, an `[S07.8]` pointer drive, `[C04]` drag CSS and a style-
allowlist turn (8 → 10, `--drg-`). **It is not a working state** — the stub-DOM runner reads 1479
passed, 1 failed on it — and it implements the within-a-side rule the amendment withdrew and its own
`dropRefusal` op, which would collide with `[S07.1]`'s function of the same name. Mine it; do not
merge it.

**THE RESERVE CEILING IS A PLAYTEST-VISIBLE NUMBER.** `MAX_RESERVE` is 99, reached on the ninety-
ninth drag of one type into one side's reserve with none taken out. [S01] records why it is not the
type's authored pair (measured: a reserve held to Health at 3 refuses the fourth cat) and why it is
not unbounded (steppers create tokens). If a room ever pools a whole 24-unit side's health, this is
the number it meets, and the refusal says so by name.

**Owner:** the second D-41 dispatch; the ceiling, the 05-11 playtest.

**CLOSED BY PLAN 05-D41b (2026-09-25), with four things left open below.** The pool, the drag and
the lights shipped on part one's op, unchanged except that its guards moved into `moveRule` and are
exported as `App.ops.moveCheck`, the predicate the surface lights with. The parked branch was mined
for its threshold, its capture-on-`#board` and its `elementFromPoint` hit test. Its tray, its two
ops and its within-a-side rule were not used. **The branch is untouched and its fate is the
orchestrator's.** See `05-D41b-SUMMARY.md`.

---

## D-41 — what the drag does not cover, raised by plan 05-D41b

**Raised 2026-09-25.**

1. **THE RESERVE HAS NO KEYBOARD PATH.** Every number a drag changes on a unit or a side still has
   its − and +, which are the keyboard route (WCAG 2.5.7), and the How-to says drag is pointer-only.
   But moving a token INTO or OUT OF a reserve is only possible by dragging. The reserve is not read
   by the fight or the projection, so no allocation is out of reach. It is still a thing a keyboard
   user cannot do. The recorded answer is real buttons (spec item 4: "if the pool is operable by
   keyboard at all, it goes through real buttons"), for example a "Hold one" / "Give back"
   pair on each reading. That is a design call the developer has not made.
2. **TOUCH AND PEN ARE NOT DRIVEN.** The gesture is Pointer Events with `touch-action:none` on the
   sources, and every browser cell drives it with `page.mouse`. A finger and a stylus take the same
   code path, but no cell has driven one.
3. **FIREFOX AND SAFARI**, as for every other surface (CLAUDE.md § Gaps).
4. **A DRAG ON THE BUILD BOARD WITH A FIGHT RUNNING** is allowed, because a move is allocation and
   the steppers stay live mid-fight. It follows FIGHT-10 (a build edit lands at the next round), but
   no browser cell drives a drag mid-fight.

**Owner:** the developer (1); the 05-11 playtest (2, 4).

---

## D-42 — the battle scene, what it does not settle, raised by plan 05-D42

**Raised 2026-09-26.**

1. **THE SCENE COSTS THE ROUND ITS PLACE ON THE FIRST SCREEN.** It is the fight tab's first panel,
   above the lane, chosen by measurement (`05-D42-SUMMARY.md` § Placement): with three rounds
   resolved the round-state panel moves from 727 to 1180 of 1080 and from 653 to 1046 of 768.
   Advance's reachability (cells 18 and 18c) is untouched at every placement measured. The
   one-line alternative is to move `<section id="scene">` to after `#fightbar` in the band, which
   costs the round nothing and puts the picture off the first screen instead. The developer's call.
2. **A SPRITE HAS NO KEYBOARD PATH, BY DESIGN.** A place in the scene carries no information: every
   name, state and number is on the battlefield and the board, so WCAG 2.5.7 is not engaged. The
   reset control is a real button. Recorded so nobody reads the absence as an oversight.
3. **TOUCH AND PEN ARE NOT DRIVEN**, as for D-41: Pointer Events with `touch-action:none`, every
   cell drives `page.mouse`.
4. **FIREFOX AND SAFARI**, as for every other surface (CLAUDE.md § Gaps) — and the store is one of
   CLAUDE.md's named Firefox unknowns (`privacy.file_unique_origin`). The scene treats a missing
   or refusing store as normal, so the worst case is a layout that lasts until the page closes.
5. **WHETHER A 48px PIXEL CAT READS AS A CAT FROM THE BACK OF A ROOM.** The sprites go to 64px on a
   projector-sized window. Legibility of the names is measured; recognisability of the picture is a
   person's to judge. Harness limitations entry 40.

**Owner:** the developer (1); the 05-11 playtest (3, 5).

---

## D-44 — the two generations of scene art, what they do not settle, raised by plan 05-D44

**Raised 2026-09-27.**

1. **ON A PROJECTOR-SIZED WINDOW THE 16-BIT SPRITES ARE SMALLER THAN THE 8-BIT ONES.** A 16-bit cat
   is 24 sprite pixels and a mech 48, drawn at two screen pixels each: 48px and 96px at every window
   size, where the 8-bit pair goes to 64px and 128px from 1600x900 up. 64 is not a whole multiple
   of 24, and the next whole size, 72px and 144px, does not fit the formation: a row of six 144px
   mechs is 864px against the mechs' 775px strip at 1920 (`05-D44-SUMMARY.md` § Why 48 and 96). The
   names, which are what tell units apart, are the same 18px line in both generations. Two ways
   out, both the developer's call: a second, larger 16-bit sprite set drawn for big windows, or a
   formation with fewer mechs to a row when the sprites are larger.
2. **THE BACKDROP COVERS A FIELD UP TO 2048 BY 720.** The widest field measured is 1582x720
   (24 a side at 1920x1080). A field wider or taller would show the window's own blue past the
   picture's edge. Nothing on a desktop reaches it today.
3. **WHETHER THE 16-BIT PICTURE READS FROM THE BACK OF A ROOM** is D-42 item 5 again, for the new
   art: judged here on screenshots at 1920x1080 and 1366x768 and 3x crops, not on a projector.

**Owner:** the developer (1); the 05-11 playtest (3).

---

## D-45 — generated unit names, what they do not settle, raised by plan 05-D45

**Raised 2026-09-27.**

1. **THE BOARD CARD DOES NOT REPAINT A UNIT'S NAME ON A PLAIN COMMIT.** A unit's name on its card,
   and inside every stepper's accessible name (`data-ablPre`), is written by `structure()` only,
   because no op renames a unit. Measured in real Chrome and Edge at both sizes: a name written
   through `[S03]`'s writer shows on the scene at once (D-42 made the scene read it every frame) and
   on the card only after the next structural frame. Nothing a student can press reaches this
   today. It is the render half of a rename-unit op, which D-45 did not ask for: the day one ships
   it must commit structurally, or teach `sync()` the unit's name the way it already knows a token
   type's. Recorded at `[S09.16]`'s page row.
2. **PAST THE FIRST ROUND OF A LIST, TWO SCENE NAMES CAN TOUCH AT 24 A SIDE.** Every name through
   c52 is at most 7 characters and through m163 at most 8, which is what the 24-a-side formation at
   1366 clears (95.5px between cats, 106.5px between mechs). c53 is "Biscuit 2" (9) and m164 "Elk
   MK-10" (9). Only a side that has minted more than fifty units reaches either, and only the scene
   is narrow enough to show it. Longer lists would push it further out.
3. **THE `build code` SUITE THROWS, RATHER THAN FAILING ROW BY ROW, WHEN ENCODE REFUSES ITS
   HOSTILE BOARD.** Found under D-45's probes P3a and P3b (index-keyed naming): encode rightly
   refuses a board whose names are not its ids' names, and the suite's tamper matrix, built off
   `bodyOf(hostileCode)`, calls `.indexOf` on null. The harness turns it into one "suite threw"
   record and the rest of that suite's rows go unreported (1421 -> 1268 rows). Every D-45 row
   failed cleanly under every probe. Hardening the tamper matrix against an unwritable hostile
   board is a change to a pre-D-45 suite and is left for its owner.
4. **WHETHER THE NAMES READ WELL ALOUD AND FROM THE BACK OF A ROOM** is a person's to judge; the
   lists were chosen to be easy to say and were read back on screenshots only.

**Owner:** the rename-unit op, if one is ever asked for (1); the developer (2, 3); the 05-11
playtest (4).

## D-46 — resource drags on the fight tab, what they do not settle, raised by plan 05-D46

**Raised 2026-09-27.**

1. **THE FIGHT RESERVE IS REACHED ONLY BY DRAGGING.** D-41b's item, one tab over. Every number a
   fight-tab drag changes on a unit or a side has a keyboard path (D-37's popup, D-36's pool
   control); moving a token INTO or OUT OF a fight reserve has none. Said in the How-to card,
   at `[S07.8]`'s banner and here, and not papered over with a focusable token Enter could not
   operate.
2. **WHILE A REFUSAL IS SHOWING AT 1366x768, THE TWO POOLS SIT ABOUT 24px OUT OF LINE.** The
   refusal is said on the column's line under its battlefield (never inside a shape — a sentence
   in a 150px shape reflowed the cluster and hid six cats). The other column's cluster takes the
   slack, but at 1366 the Mechs' cluster is at its scroller's cap, so the slack cannot all be
   taken and the Mechs' pool sits 24px higher than the Cats' until the next drag begins. No shape
   moves. Read on `d46-refused-scope-*-1366x768`.
3. **A TOKEN TYPE REMOVED MID-FIGHT LEAVES ITS FIGHT NUMBERS STANDING, NOW INCLUDING A FIGHT
   RESERVE COUNT.** `removeTokenType` drops the BUILD's tallies and reserve and does not touch the
   fight slice. That was already true of fight tallies before D-46; a fight reserve count of the
   departed type now joins them. All are unread (the pool draws only types the vocabulary holds,
   and the move refuses a departed type by name), and a new fight starts without them. Whether a
   removal should reach into a running fight is a ruling for the developer, not a D-46 fix.
4. **TOUCH AND PEN ARE NOT DRIVEN**, as for D-41 and D-42: Pointer Events with `touch-action:none`
   on every source, real mouse drags only.
5. **A STILL CLICK ON A READING NOW OPENS THE POPUP ON THE RELEASE, NOT THE PRESS.** A click
   cannot tell the difference and every D-36/D-37 cell passes unchanged, but a student who holds
   the button down on a reading and waits will see nothing until they let go. That is the price
   of a threshold between a click and a drag on a node that answers both. (On the board a click
   on a token was nothing, so D-41 never paid it.)

**Owner:** the developer (1, 3); the 05-11 playtest (2, 5); CLAUDE.md § Gaps (4).
