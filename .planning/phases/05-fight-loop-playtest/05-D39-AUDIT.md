# D-39 — Second design audit, with eyes on the real artifact

**Date:** 2026-09-01. **What this document is:** the second full design audit of
`cats-vs-mechs.html`, taken the way `05-D33-AUDIT.md` was taken and against the same standards. It
covers six rounds of work that have never been looked at with eyes — D-32's dense action editor,
D-34's cancel step, D-35a/b/c's round rules, token bounds and their editors, D-36's click-to-rule
team resources, D-37's unit popup, and D-38's how-to tab and its two dialog-flow fixes — and it
re-checks every D-33 finding for regression. **It changes nothing in the artifact.**

**How it was taken.** Real Chrome (`channel: 'chrome'`), headless, Playwright 1.62.1, `file://`, at
**1920×1080** and **1366×768**, every surface, both viewports. **115 screenshots**, 52 per viewport
plus 3× device-scale crops, every one read back. Every state was reached by pressing shipped
controls: one student token type (**Rage**, per-unit, bounds 0–4) authored through the picker's own
fields, one maxed **4-cost / 4-need / 4-change** action (**Pounce**) authored term by term through
the dense editor's own chips and amount fields, one **−1 Rage each round** rule added through the
D-35c grid, the cancel step pressed, three rounds declared and advanced, unit popups opened on the
edge units of both sides, values ruled through the popup, the share dialog opened and two bad codes
refused, and one full flow walked by keyboard alone. **Zero page errors and zero console errors in
every run** — every failure below is a rendered failure, not a thrown one, except where the report
says a throw is the failure.

**Screenshots and re-runnable drivers** live in
`C:\Users\alexy\AppData\Local\Temp\claude\C--Projects-GameDesignSkills-GameFeelDirectionCourse-CatsVsMech\6955a1c2-1679-4a99-be89-fd3975b5abb0\scratchpad\d39\`.
`w1920-*` / `w1366-*` are full viewports, `zoom-*` are 3× crops, `probe-*.mjs` are the measurement
scripts, and `*-measure.json` / `*-partA|B|C.json` / `*-final.json` hold every number quoted here.

---

## 1. Verdict

D-33's implementation held. Twenty of its twenty-eight findings are measurably fixed on the surfaces
they were written about, and two of them — the state palette and the 120 ms motion ramp — are now
load-bearing infrastructure that thirty-two control classes consume correctly. The problem is that
**six redirect rounds have been built on top of that pass without re-reading it**, and the artifact
has re-grown the same three defects in new places: the pool reading that D-33 P1-1 stopped
contradicting itself between the topbar and the state card now contradicts itself between the state
card and the projection sidebar, in a *different vocabulary* ("3 of 3 spoken for" versus "0 of 3
spent so far", simultaneously, for the same pool); the width breakout that D-33 P2-1 gave
`.shell-head` was never given to `#roundrules` or `#howto`, so the board tab has three left edges
again, 182 px apart; and the mid-fight build notice that D-33 P2-13 de-duplicated on the board is
printed twice, 111 px apart, on the fight tab. Beneath those sits something D-33 could not see
because it never typed into a field: **every typed-value field in the artifact routes a typo into
the global crash panel on Enter** — six paths measured, "SOMETHING WENT WRONG", a raw stack trace in
a textarea, an accented "Reset to Workshop 16 defaults" button, and in the two authoring dialogs the
dialog *closes*, discarding the session. That is the file's own recorded intent ("an explicit
request earns a readable refusal") delivered down the channel `[S05]`'s banner reserves for defects.
The three newest features are each individually well-reasoned and each individually out of step with
the one beside it: the unit popup renders a stepper with no number 200 px from a nudge that renders
one; the round-rules grid runs 15 px control labels under an 18 px floor every other surface
respects; the panel called "Projection and reference" has held six reference cards since D-33c and
has never shown one, at either viewport. None of this is hard to fix — the largest single win
(delete one `outline` declaration from three rules) has zero gate cost — but it will not stay fixed
unless the next redirect reads this document before it starts.

---

## 2. Findings

Each finding: **WHERE** (screenshot + element) · **WHAT** (as measured) · **CHANGE** (concrete, with
the section marker that owns it) · **WHY** (for a room) · **GATE** (what it costs the harness).

The seven harvest floors are `SUITE_FLOOR = 1186`, `DIALOG_FLOOR = 138`, `PICKER_FLOOR = 84`,
`SHARE_FLOOR = 0`, `HOWTO_FLOOR = 24`, `FIGHT_FLOOR = 248`, `PROPOSE_FLOOR = 23`
(`tests/selftest-node.cjs`). **Any change to a rendered string — including a `title` tooltip, per
D-29 — moves a floor.**

> **The standing warning, unchanged:** the no-verdict gate bans `counter` / `balanc` / `rating` as
> *substrings, whole-document*, and forbids `won` / `winning` / `best` / `defeated` outright. Every
> string proposed below has been checked against that list.

---

### P1 — the ones that cost a student their work or teach the wrong thing

---

#### P1-1 · A typo in any field opens the crash panel; in the two authoring dialogs it also closes the dialog

**WHERE** `w1366-30-actedit-typo-CRASH.png` and `w1920-30-actedit-typo-CRASH.png` (the Actions
dialog is gone, replaced by "SOMETHING WENT WRONG · **editor keydown**") ·
`w1920-03c-tokpicker-bounds-CRASH.png` (same, "**picker keydown**", after typing a Range value) ·
`probe-loud.mjs`, `probe-bounds.mjs`, `probe-bounds2.mjs`.

**WHAT** Measured, six paths, every one reached by typing and pressing Enter:

| field | typed | error panel | dialog after |
|---|---|---|---|
| `#tok-pick-min` (max is 4) | `9` | yes — "picker keydown" | **closed** |
| `#tok-pick-max` (min is 2) | `1` | yes — "picker keydown" | **closed** |
| `#tok-pick-min` | `ab` | yes — "picker keydown" | **closed** |
| `#tok-pick-max` | `999` | yes — "picker keydown" | **closed** |
| `#tok-pick-name` | *(empty)* | yes — "picker keydown" | **closed** |
| `#act-edit-cost-0-amt` | `abc` | yes — "editor keydown" | **closed** |
| `.rr-amt` | `abc` | yes | — |
| board stepper `cats/c1/maxHp` | `abc` | yes | — |

The panel is 520 × 294, anchored bottom-right, and contains: the words *"SOMETHING WENT WRONG"*, an
internal listener name as its title (*"picker keydown"*, *"editor keydown"*), a read-only textarea
carrying the raw stack (`Error: … at setTokenBounds (file:///C:/Projects/…)` — measured), and two
buttons of which the accented, `brd-btn--danger` one is **"Reset to Workshop 16 defaults"**
(measured at x=1563, y=1012 at 1920).

This is deliberate. `[S07.2]`'s `commitBound` carries the comment *"`loud` is Enter … an explicit
request earns a readable refusal"* and delivers that refusal by re-throwing into `[S08]`'s boundary.
But `[S05]`'s own banner says *"A throw from here is a DEFECT and is meant to reach the …"* panel.
The two decisions are in the same file and they disagree, and the student is the one who finds out.
The blur path on the identical field handles the identical value correctly and quietly: measured,
`#tok-pick-min` = 9 committed by clicking away reverts the field, keeps the dialog open, opens no
panel. So the graceful path already exists — Enter is the only one that escapes it.

**CHANGE** In **[S07.2]** (`commitBound`, `commitName`) and **[S07.3]** (`commitAmount`), and
**[S07.7]** for `.rr-amt`: catch the refusal at the commit site and render it into a said line on the
surface that raised it, instead of re-throwing. The channels mostly exist —
`#tok-pick-names` (`.pk-warn`) is already the picker's refusal slot and is currently unused for
bounds; `#rr-said` exists and is currently `hidden` when `.rr-amt` refuses; the action editor needs
one (`.ae-said`, the `.fg-said` / `.sh-said` idiom). Keep the throw for genuine defects. The
sentences themselves already exist in `[S05]`'s guards and are already scanned, so no new prose is
being invented.

Two smaller repairs in the same pass:
- `#act-edit-cost-0-amt` typed `999` clamps state to 99 and **leaves `999` in the field** (measured:
  `state.cost[0].n === 99`, `field.value === "999"`). The field and the record disagree until the
  next structural render. Re-show the committed figure, per `showFieldValue`'s own rule.
- The panel should not offer "Reset to Workshop 16 defaults" as its accented control for a
  recoverable input refusal. Even after the refusals move off this channel, "Dismiss and continue"
  is the right default weight.

**WHY** A student mistypes one character in an action's cost and the artifact tells them something
went wrong, shows them a file path and a stack trace, throws away the dialog they were working in,
and offers to delete their whole build. On a workshop day that is the last thing the room sees
before the instructor stops trusting the tool.

**GATE** No new strings if the existing guard sentences are reused — but they move from `throw` into
`textContent`, which is a **new place** for Layer C to harvest, so `PICKER_FLOOR` (84),
`DIALOG_FLOOR` (138) and `SUITE_FLOOR` (1186) all move once. Add browser checks for the Enter path
on `#tok-pick-min`, `#tok-pick-max`, `#tok-pick-name`, `#act-edit-*-amt` and `.rr-amt` asserting the
dialog stays open and `#err-panel` stays hidden — that is the assertion this audit had to discover
by hand.

---

#### P1-2 · Three readings of one pool, on one screen, in two vocabularies, with different numbers

**WHERE** `w1920-16-fight-projection.png` · `probe-fight.mjs` → `threeReadings`.

**WHAT** With three Cats actions declared and the projection panel open, at 1920, all three of these
are on screen at the same time:

| element | reads |
|---|---|
| `#pool-cats` (topbar, y=197) | "Cats · Action points · **3 of 3 spoken for** · 0 left to spend" |
| `.fg-res` (state card, y=939) | "Action points · **3 of 3 spoken for** · 0 left to spend" |
| `#strip` (sidebar) | "Action points: **0 of 3 spent so far.**" |

The first two are **byte-identical**, 742 px apart. The third gives a different figure for the same
pool in the vocabulary D-27 built the round loop to distinguish. "9 of 9 still standing" is likewise
printed twice simultaneously (state card y=823, sidebar y=929).

D-33's P1-1 fixed the topbar-versus-state contradiction by making the topbar render the state's
figures. The contradiction has reappeared one region over, because D-33c's REF-03 work added a
"The fight as it stands" block to `#strip` that computes its own reading. The strip's figure is not
wrong — it is the resolved figure — but a student cannot tell "spoken for" from "spent" when both
are on screen against one pool and only one of them moves as they click.

**CHANGE** In **[S06.3]** / **[S06.4]** (the strip) and **[S06.7]**:
1. **Drop "The fight as it stands" from `#strip` in fight view.** The state card is 400 px away, is
   always rendered, and owns this reading. The strip's job in fight view is the projection and the
   reference. This also recovers height for P1-3.
2. Resolve the remaining duplicate: either the topbar keeps the round number and one compact figure
   per side while the state card keeps the sentence, or the reverse. Two full sentences saying the
   same twelve words 742 px apart is the cheapest 200 px on the fight tab.
3. If the strip's "spent so far" reading is kept anywhere, it must not use "spent" beside a "spoken
   for" reading of the same pool. One pool, one word.

**WHY** This is the interaction the whole fight tab was redesigned around, and the instructor's line
is "watch the pool". Three pools, two words, two numbers.

**GATE** `FIGHT_FLOOR` (248) and `SUITE_FLOOR` move. One re-derivation.

---

#### P1-3 · The panel called "Projection and reference" has never shown the reference

**WHERE** `w1920-16-fight-projection.png` · `w1366-16-fight-projection.png` ·
`probe-fight.mjs` → `stripLayout` · `probe-final.mjs` → `strip`.

**WHAT** Measured, `#strip` in fight view, `overflow-y: auto`:

| viewport | clientHeight | scrollHeight | hidden | % hidden | first `.ref-card` top *inside the panel* | on screen? |
|---|---|---|---|---|---|---|
| 1920×1080 | 836 | 1712 | 876 | 51% | **955** | **no** |
| 1366×768 | 524 | 1740 | 1216 | **70%** | — | **no** |

All six reference cards are below the fold at both viewports, always. `firstRefOnScreen === false`
in every run. D-33 P3-8 chose this panel as REF-03's home precisely because P2-12 was giving it a
header, a close control and a scroll affordance — and the cards landed 955 px down a container that
shows 836.

The scroll affordance is the other half of it. `scrollbar-width: thin` and `scrollbar-color` are set
(D-33a landed them; measured 1 and 1 in the stylesheet, plus 3 `::-webkit-scrollbar` rules), but the
measured gutter is `offsetWidth − clientWidth = 2`, which is the panel's own 1 px borders — **no
scrollbar takes any width, and no scrollbar appears in any of the 115 screenshots this audit took**.
The affordance shipped and is invisible at rest.

Also measured: the panel is a fixed **360 px**, which is **26% of a 1366 viewport**. D-33 P2-12 asked
for "push rather than overlay, **or narrow it**" at ≤1366; it pushes (verified) and does not narrow.

**CHANGE** In **[C15]** / **[S06.4]**:
1. **Put the reference cards first.** The projection is also on the board tab; the reference is not.
   A student who opens a panel named "…and reference" during a fight is looking for what beats what.
2. With P1-2's block removed and the cards moved up, re-measure — the projection then falls below
   the fold instead, which is the correct trade.
3. Add the edge-fade the `[C16]` block already defines for scrollers to the panel's bottom, since
   `scrollbar-width: thin` demonstrably renders nothing here.
4. At ≤1366 narrow the panel to a fractional basis rather than 360 px.

**WHY** REF-03 exists because a student needs the matchup table while declaring. It has been
formally satisfied and functionally absent for three rounds.

**GATE** Reordering moves no strings; removing P1-2's block does. The deferred item's own row 101
already reddened when the cards moved in D-33c and is unaffected by re-ordering inside the panel.

---

#### P1-4 · The unit popup opens 355 px above the unit it names, covers up to four other units, and at 1366 runs off the viewport

**WHERE** `w1920-13-unitpopup-lastcat.png` (heading "Cat 9"; the popup sits on Cat 3 and Cat 6) ·
`w1366-13-unitpopup-lastcat.png` (the popup covers the entire Cats battlefield and its "Mark dead"
row is below the fold) · `probe-popup.mjs`, all twelve units.

**WHAT** Measured at 1366 for every unit on the field: `popup.x === unit.x` exactly and
`popup.y === unit.y − 355` (cats) / `− 301` (mechs), **for all twelve**. The popup is never placed
below a unit, never flipped, never clamped.

| unit | covers other units | offBottom |
|---|---|---|
| Cat 1 / 2 / 3 (row 1) | 0 | −83 |
| Cat 4 / 5 / 6 (row 2) | **2** | −10 |
| Cat 7 / 8 / 9 (row 3) | **4** | −85 |
| Mech 3 | 2 | −161 |
| Mech 3 (shots2 run, last mech) | — | popup opens at **y = 8**, over the page header |

With the student token on the board (the state this audit authored), the Cat 9 popup measures
**y = 434, height = 415 at a 768 px viewport → 81 px below the fold** (`w1366-partB.json`,
`fgu.geom.offBottom = 81`). The Dead-marker row and its "Mark dead" button are unreachable, and
`#fg-unit-rows` does not scroll to compensate because its own `clientHeight === scrollHeight` (348 =
348) — the overflow is the page's, not the container's.

Nothing connects the popup to its unit: no tail, no anchor line, no highlight on the source card.
The heading says "Cat 9" while the two cards under the popup say "Cat 3" and "Cat 6".

**CHANGE** In **[S06.15]** (`.fgu` placement) / **[C14.x]**:
1. Prefer **below** the unit; flip above only when there is not room below.
2. Clamp both axes to the viewport: `top = Math.min(top, innerHeight - h - 8)`, likewise for left.
3. Mark the source unit for the popup's lifetime — the `--state-on-line` / `--state-on-fill` pair
   already exists and is already what "this one" means everywhere else on the fight surface.

**WHY** D-37's own words are *"positioning near the unit"*. A box that opens on top of three other
units and names a fourth is the tool telling a student the wrong thing about which numbers they are
about to change.

**GATE** Geometry cells reading the popup's placement. No strings.

---

#### P1-5 · The ledger card shows a third of what D-28 asked for, at both viewports, and never shows an action line

**WHERE** `w1920-15-fight-3rounds.png` (Round 1's card cuts through "Mech 2") ·
`w1366-16-fight-projection.png` (Round 1's card is at **x = −56** — its round number and the word
"Cats" are scrolled off, with no edge fade) · `shots2.mjs` → `ld.rows`, `probe-final.mjs` → `ldDial`.

**WHAT** Measured with the shipped 9v3 roster plus one student token, three rounds resolved:

| viewport | `.ld-row` clientHeight | scrollHeight | hidden | % |
|---|---|---|---|---|
| 1920×1080 | 236 | 693 | **457** | 66% |
| 1366×768 | **167** | 693 | **526** | **76%** |

What is inside the hidden part, read from `innerText`: the whole Mechs block **and every action
line** — `"Cat 1 uses Slash on Mech 2."` and its deltas. D-28's instruction was *"earlier rounds
should be a full lane above showing the past state **and the actions selected**"*; the actions have
never been on screen.

D-33 P1-4's first two steps landed and are verified: the per-card note is printed once as a lane
caption ("Each card is the board as it stood when that round began.") and the `0×` zero tallies are
suppressed (`Cat 1 ▪▪▪` with nothing after the zero-valued types, `Cat 9 0×▪` where the reading is
genuinely zero). Step 3 — *"re-derive the 15vh dial against the new content, and record the new
number"* — did not happen. The dial is still measured against a card that no longer exists.

Step 4 — the left/right scroll-edge fade on `.ld-list` — also did not happen. Measured at 1366:
`#ledger-list` clientWidth 968 / scrollWidth 1048 → 80 px scrolled past, leftmost card at x = −56,
cut with a hard edge.

**CHANGE** In **[C14.2]** / **[S06.8]**:
1. Re-derive both dials against the measured 693 px, with the 9v3 roster and one student type on the
   board, and record the new figures beside the REHEARSAL DIALS note. This audit is that rehearsal.
2. **Put the action lines first in the card.** They are the part D-28 asked for and the part that is
   never seen; the board state is the part that is also on the state card below.
3. Add the `linear-gradient` edge fade to `.ld-list`'s left and right, in the idiom `[C16]` already
   defines.

**WHY** At 1366 — the resolution a workshop laptop runs — a past-round card shows a number, the word
"Cats", and four names.

**GATE** No strings if only the dials and the fade move. Reordering the card's contents moves no
words either, but geometry cells reading child order will move.

---

#### P1-6 · "Put this action back how it was" discards an entire authoring session, with no scope statement and no receipt

**WHERE** `w1920-07-actedit-modified.png` → `w1920-07b-actedit-after-cancel.png` ·
`w1920-partA.json` → `ae.beforeCancel` / `ae.afterCancel`.

**WHAT** The journey, all through shipped controls: `New action` → named it `Pounce` → authored
**twelve terms** (4 cost, 4 needs, 4 changes) through the dense editor → opened and closed the
Proposal → renamed it and cleared one cost term → pressed the control. Measured result:

```
before:  name "Pounce EDITED",  cost [t1×1, shield×1, hp×1]  (+4 req, +4 xf)
after:   name "New action",     cost [ap×1]                   (req [], xf [])
```

All twelve terms gone. No confirmation, no preview of what will be lost, and **no said line
afterwards** stating what came back.

This *is* D-34's recorded semantic — the snapshot is taken when the action is selected, and creating
an action selects it — so the behaviour is correct. The presentation is the defect. The control is
**278 px wide**, the widest in the dialog, sits between `Proposal` and `Done` in the sticky footer,
and its label describes a small reversal. Nothing on the surface names the restore point. The
how-to tab does say it (*"returns the action to the state it was in when you selected it, in one
step Ctrl+Z can take back"*) — which is a sentence about the current board's history and would be a
**reading**, not an explainer, if it were on the surface.

**CHANGE** In **[C12]** / **[S06.5]** / **[S07.3]**:
1. Print a said line after the restore naming what came back — *"Pounce is back to the four terms it
   had when you selected it."* / *"New action is back to its starting cost."* Same `.sh-said`
   idiom, same channel as every other after-the-fact reading in the file.
2. Say the restore point on or beside the control while the editor is open.
3. When the snapshot equals the current record, make it inert-looking rather than disabled — the
   never-disable convention outside the fight grid is untouched by that.

**WHY** A student who has spent ten minutes authoring an action, presses a button labelled "put it
back", and loses everything will not press anything else in that dialog for the rest of the
workshop.

**GATE** Adds strings → `DIALOG_FLOOR` (138) and `SUITE_FLOOR`. One re-derivation.

---

### P2 — consistency, hierarchy, and what twelve redirects have accreted

---

#### P2-1 · Two new regions never got the width breakout, so the board tab has three left edges again

**WHERE** `w1920-01b-board-fresh-bottom.png` (the "What beats what" band spans x=160–1760; the "Each
round" card starts at x=342) · `w1920-02-howto-top.png` (the "HOW THIS WORKS" eyebrow at x=342 under
a "The board" pill at x=160) · `w1920-measure.json` → `regions`.

**WHAT** Measured at 1920:

| region | x | width |
|---|---|---|
| `.shell-head`, `#topbar`, `#views`, `#board`, `#refband` | **160** | **1600** |
| `#roundrules` | **342** | 1236 |
| `#howto` | **342** | 1236 |

**182 px** of inset, on the two regions added after D-33b fixed exactly this defect for
`.shell-head`. At 1366 the inset is 42 px. `#roundrules` sits directly under `#refband`, so the two
edges are 182 px apart and vertically adjacent.

**CHANGE** In **[C02]** / **[C17]** / **[C18]**: give both regions the same breakout `#topbar` and
`#board` carry. Four lines, twice.

**WHY** It is the first thing an audience registers as unfinished, and it is the same fix the file
already made once.

**GATE** **None** — layout only.

---

#### P2-2 · The selection tick renders outside its own button on every round-rules pill, and 240 px from its label in the picker list

**WHERE** `w1920-01b-board-fresh-bottom.png` and `w1920-08c-roundrules-decay.png` ("Cats✓",
"Mechs✓", "Action points✓" all render as a clipped "⌄") · `w1366-05b-actedit-maxed.png` (nine
selected `.ae-pill`s, nine clipped ticks) · `w1920-measure.json` → `tick_board`, `tick_pk`.

**WHAT** Measured on every `.rr-pill--on`: the `.rr-check` span's right edge is at **534** against
the button's border-box right edge at **530** — the tick is drawn **4 px outside its own button**,
12 px past the padding box, and is clipped by the border. `gapFromName: 3`. Same shape on
`.ae-pill--on`.

The opposite failure survives in the picker's list: measured `tickGap: 240` — the tick sits 240 px
from the name it marks on a 298 px row. That is D-33 P2-8's second failure mode, whose prescription
("on list rows move the tick to the **left** of the label so it travels with what it marks") was not
taken.

**CHANGE** In **[C17]**, **[C12]** and **[C07]**: give the tick a `margin-inline-start` and the pill
enough `padding-inline-end` to contain it; on full-width list rows put the tick **before** the name.
`textContent` is unchanged in both cases.

**WHY** From twenty feet a clipped tick reads as a rendering fault, and a tick 240 px from its word
reads as an unrelated mark.

**GATE** **None** — spacing and order only.

---

#### P2-3 · The round-rules editor runs its control labels 3 px under the file's own floor

**WHERE** `w1920-01b-board-fresh-bottom.png` · `w1920-measure.json` → `fonts`.

**WHAT** Measured font sizes: `.rr-pill-name` **15 px**, `.rr-check` **13 px**, `.rr-col` 16 px —
against `.brd-btn` 18, `.vw-btn` 18, `.unit-rm` 18, `.fg-act` 18, `.pk-list-item` 18, `.ae-pill` 17.
`[C07]`'s banner states the rule: *"a real, permanently visible text label at the 18px minimum,
never an icon."* The round-rules grid is the newest authoring surface, carries **ten controls per
rule × up to eight rules = up to eighty buttons**, and is the only surface below the floor. The
token picker's swatch labels ("Square", "Bar", "Green") are **13 px**, same story.

**CHANGE** In **[C17]** and **[C07]**: 18 px, and re-measure the card's height afterwards — the row
will grow and P2-4's wrap will get worse before it gets better, so do the two together.

**WHY** Projector legibility is the artifact's stated bar and this is the one surface that does not
meet it.

**GATE** **None** — font sizes only. Geometry cells reading the round-rules card height will move.

---

#### P2-4 · The round-rules grid has no rows

**WHERE** `w1920-08c-roundrules-decay.png` · `w1920-measure.json` → `rr`.

**WHAT** Measured: `.rr-rule` computes `display: contents`, bounding box **0 × 0**,
`border-top-width: 0px`. The five cells sit directly in `#rr-list`'s grid
(`grid-template-columns: 122.8px 383.1px 440.3px 90.0px 82.2px`). Consequences:

- **No row separator.** The action editor's `.ae-term` rows *did* get 1 px separators in D-33c. Two
  grids in one artifact, one separated and one not.
- No row hover and no `:focus-within`, on a surface where `.unit-card` and `.fg-row` both have one.
- Once a sixth token type exists, the "Which token" cell **wraps to two lines** (visible in
  `w1920-08c`: "Rage" alone on a second line), so the amount field and Remove button stop sitting on
  the reading's baseline and the rules stop being countable. At eight rules that is a ~1,000 px card.

**CHANGE** In **[C17]**: a 1 px `--line` rule between rules (a `border-block-start` on all five cells
of every rule after the first, since the row itself has no box), and `align-items: start` so a
wrapped token strip does not decentre its siblings.

**GATE** **None.**

---

#### P2-5 · The mid-fight build notice is printed twice, 111 px apart, on the same screen

**WHERE** `w1920-10b-fight-fresh-bottom.png` (the same 51 words at y=733 and again at y=845) ·
`probe-fight.mjs` → `buildNotice`, `probe-regress.mjs` → `buildNoteCount: 2`.

**WHAT** Measured in fight view: `#fight-said.fg-said` at y=1992 and `.dc-said` at y=2103, both
visible, both carrying *"The steppers on the board still edit the build. A change made now applies
to the build and not to this fight, and it takes effect the next time you start a fight."*
D-33 P2-13 de-duplicated this sentence on the **board**; it is now duplicated on the **fight tab**.

**CHANGE** In **[S06.7]** / **[S06.9]**: one owner. The fight surface's own copy (`#fight-said`) is
the one that belongs there; `.dc-said`'s instance during a fight is the redundant one.

**GATE** Removes a rendered instance → `FIGHT_FLOOR` and `SUITE_FLOOR` move.

---

#### P2-6 · Declared and focused are the same 2 px accent ring, one pixel of offset apart

**WHERE** `zoom-declared-vs-focused.png` — Cat 1's Slash is **declared**, Cat 2's Slash is merely
**focused**, and at a glance they are the same object · `probe-ab.mjs`.

**WHAT** Measured with the pointer parked off the surface:

| state | outline | box-shadow | background |
|---|---|---|---|
| `.fg-act--on` (declared) | `2px solid rgb(92,200,255)` @ **offset 2px** | none | `accent / 0.18` |
| `:focus-visible` (focused) | `2px solid rgb(92,200,255)` @ **offset 3px** | `0 0 0 1px rgb(14,16,20)` | none |

The outline is **byte-identical in width, style and colour**. D-33 P1-8's fill landed (and works —
`--state-on-fill` is real and visible), but the outline was never removed from the `--on` rules, so
the accent outline still carries two meanings. `--state-on-line` and `--state-focus` are both
`var(--accent)` by definition (**[C00]**, lines 126–128).

Everything else in P1-8 held: hover is `--state-hover-line` (a 45 % mix) plus a 12 % wash, lit
targets are `--accent-2` (`rgb(255,126,182)` border, 16 % fill), and 24 hover rules exist against 8
`:focus-visible` rules with a shared 120 ms ramp on 32 classes inside the reduced-motion guard.

**CHANGE** In **[C00]**'s three consumers — `.fg-act--on` (line 2839), `.ae-pill--on` (1566),
`.rr-pill--on` (5384): **delete the `outline` and `outline-offset` declarations.** Keep
`border-color: var(--state-on-line)` and `background-color: var(--state-on-fill)`. The accent
outline then means focus, and only focus, everywhere in the file. `.bf-unit--lit` (4192) keeps its
outline because it is on the `--accent-2` channel and does not collide.

**WHY** A keyboard user cannot tell "my focus is here" from "this is declared" — the exact
comprehension failure D-33 P1-8 was written about, 80 % fixed.

**GATE** **None.** Three deleted declarations. This is the cheapest win in the document.

---

#### P2-7 · Four hover rules authored after D-33a's ramp are not in it

**WHERE** `state-probe.json` → `transitionRules`, `hoverSelectors`, `durFight`.

**WHAT** Measured: the ramp's selector list names 32 classes. Four classes have `:hover` rules and
are **not** in it: `.fg-res[data-fg="res"]` (D-36), `.fgu-close` (D-37), `.fgu-alive` (D-37),
`.pv-close` (D-33c). Verified on the live element: `.fgu-close` computes
`transition-duration: 0s, transition-property: all` while `.fg-act` beside it computes `0.12s` on
seven properties. Every control D-36 and D-37 added hover-snaps while everything around it ramps.

**CHANGE** In **[C16]**: add the four class names to the existing selector list and to the
`prefers-reduced-motion` guard's copy of it.

**GATE** **None.**

---

#### P2-8 · The unit popup shows tokens where the control 200 px away shows a number

**WHERE** `w1920-13-unitpopup-lastcat.png` (Health reads `− ▪▪▪ +`) versus `w1920-14-teamres-nudge.png`
(`Cats · Action points · − **3** +`) · `w1920-partB.json` → `fgu.text`, `fgn`.

**WHAT** Measured. `#fg-unit`'s rows render `label − [tokens] +` with **no numeral** when the value
is non-zero, and `label − 0× [token] +` when it is zero. `#fg-nudge` — D-36's team-resource control,
same tab, same nudge idiom, 200 px away — renders `− 3 +`. The board's `.stp-field` renders `3`.
Three stepper presentations in one artifact, and the newest is the only one without a figure.

The popup's fourth row also has a different grammar from its first three: Dead marker has no `−`/`+`
pair, carries a `0×` reading of a boolean, and puts a right-aligned "Mark dead" on a line of its own
— 92 px against the other rows' 46.

**CHANGE** In **[S06.15]**: put the numeral between `−` and `+` as `#fg-nudge` does, tokens beside
it. Give the dead-marker row the same three-column shape, with the toggle where the `−`/`+` pair
sits on the others.

**WHY** A student ruling health from 3 to 2 in the popup watches a token disappear and never sees a
number; the same student ruling the team's action points 200 px away sees "3" become "2".

**GATE** Adds rendered figures → `FIGHT_FLOOR`.

---

#### P2-9 · The popup announces a refusal before anything is pressed, and one per refusing row after

**WHERE** `w1920-13-unitpopup-lastcat.png` (on open, before any press, the Shield row already reads
*"This board keeps this number between 0 and 99."*) · `w1920-13c-unitpopup-floor.png` (the same
sentence now under **both** Health and Shield).

**WHAT** Measured: at rest the popup prints the bounds sentence under any row whose value is at a
bound; after two presses at the floor it prints it under two rows. Two identical sentences consume
**120 px of a 440 px popup**. The sentence names `0 and 99` — the default bounds the student never
authored — and does not say which end refused. Each appearance re-lays the popup out and pushes the
remaining rows down.

**CHANGE** In **[S06.15]**: show the sentence only in response to a refusal, one at a time, naming
the end that refused. A row sitting at a bound with no press is not a refusal.

**GATE** String change → `FIGHT_FLOOR`.

---

#### P2-10 · The two sides' team-resource lines drift apart as the rosters differ

**WHERE** `w1920-11-fight-declared.png` (Cats' "Action points 3 of 3 spoken for" at y=939, Mechs' at
y=864) · `w1366-15-fight-3rounds.png` (y=470 versus y=395).

**WHAT** Measured **75 px** of drift at round 1 and the same at round 4, because each column packs
under its own battlefield and the Cats block is three rows to the Mechs' two. The same happens to
the picker rows below. D-27's instruction is *"show both sides at the same time in columns"*; the
columns are there and the rows are not.

**CHANGE** In **[C14.1]**: `subgrid` on `.fg-sides` (Baseline Widely Available, sanctioned in
`CLAUDE.md`), or a battlefield block whose height is the max of the two sides so the resource line
and the picker start on the same y on both sides.

**GATE** Geometry cells.

---

#### P2-11 · At 1366 a retarget lights a third target that is off the bottom of the screen

**WHERE** `w1366-partB.json` → `fg.retarget`.

**WHAT** Measured at 1366: "Choose a target" pressed at y=1361 (the page is scrolled to the input
area), the three lit units at y = 663, 663 and **764** against a 768 px viewport →
`litVisible: [true, true, false]`. One legal target is not on screen.

D-33 P1-7's fix #1 landed and reads well — the button relabels **in place** from "Change target" to
"Choose a target" (verified), which is real feedback at the press. Fix #2 — `scrollIntoView({ block:
'nearest' })` on the first lit node when the flow arms — did not, and it is the half that matters at
1366.

Same shot family: the declared row's "Change target" button **wraps to a second line**, 400 px from
the "Lands on Mech 1." sentence it belongs to, doubling that row's height against its neighbours
(`zoom-declared-vs-focused.png`).

**CHANGE** In **[S07.5]**: scroll the first lit node into view on arming. In **[C14.1]**: keep the
readout sentence and its change-target button on one line, or stack them as a pair.

**GATE** None for the scroll. Geometry cells if the readout's wrap changes.

---

#### P2-12 · Destructive controls in the two authoring dialogs carry no treatment at all

**WHERE** `w1920-03b-tokpicker-student.png` ("Remove this type" identical to "New type on each
unit") · `w1920-07b-actedit-after-cancel.png` ("Remove this action" identical to "New action") ·
`w1920-measure.json` → `pk.removeBtnClass`, `ae.removeCls`.

**WHAT** Measured: `#tok-pick-remove` and `#act-edit-remove` both carry class `brd-btn` — byte-for-byte
the same as the create buttons beside them. Meanwhile `#reset-ask-confirm` and `#err-reset` carry
`brd-btn--danger`, and `.unit-rm` has its own `--accent-2` hover/focus channel (**[C04]**). Three
conventions for "this deletes the student's work", and the two dialogs where a student actually
deletes an action or a token type have none of them.

**CHANGE** In **[C07]** / **[C12]**: one convention. D-33 P1-6 chose *demotion plus separation* over
reddening for the fight's destructive control; apply the same here — outline weight, a `gap`, placed
at the far end of the row, with `.unit-rm`'s `--accent-2` on hover and focus.

**GATE** **None.**

---

#### P2-13 · The how-to tab is 1,095 px of empty card

**WHERE** `w1920-02-howto-top.png`, `w1920-02c-howto-mid.png` · `w1920-measure.json` → `howtoCards`.

**WHAT** Measured per `.ht-card` at 1920 — card height versus where its content ends:

| card | height | content ends | void |
|---|---|---|---|
| The board | 697 | 487 | **210** |
| Tokens | 697 | 436 | **261** |
| Actions | 697 | 680 | 17 |
| Sharing | 693 | 334 | **359** |
| The fight | 693 | 676 | 17 |
| The round rules | 693 | 462 | **231** |

**1,095 px total**, because `.ht-grid` stretches every card in a row to the tallest. The lede also
wraps at ~50 characters inside a 1,236 px region, leaving ~500 px empty beside it, while the cards
below wrap at ~40. And the eyebrow "HOW THIS WORKS" repeats the tab label "How this works" 50 px
above it.

**CHANGE** In **[C18]**: `align-items: start` on the grid so cards size to their content, or a
`column-count` flow so six cards of unequal length fill. Drop the eyebrow — the tab is the label,
and it is the only view whose heading block repeats its own switch button.

**GATE** `align-items` costs nothing. Removing the eyebrow moves `HOWTO_FLOOR` (24) and
`SUITE_FLOOR`.

---

#### P2-14 · The topbar grows 37 px when a fight starts, and its content jumps from the left edge to the right

**WHERE** `w1920-01-board-fresh.png` versus `w1920-11-fight-declared.png` ·
`w1920-partB.json` → `fg.topbarBox`.

**WHAT** Measured `#topbar` height: **64 px on the board → 101 px in a fight**, at both viewports.
And in fight view the control cluster begins at **x = 495** (1920) instead of x = 160, with the
round readout row beginning at **x = 745** — a 335 px and a 585 px void on the left, under an `h1`
and a view switch that both start at x = 160. On the board the same cluster starts at x = 160.

D-33 P2-3 (eyebrows, verified: six 15 px uppercase labels) and P2-4 (lifecycle toggle, verified:
`#fight-start` reads "End the fight" and is **not** disabled during a fight) both landed. P2-2's
"reserve the round/pool slot permanently so the bar does not change height on `startFight`" did not.

**CHANGE** In **[C03]**: reserve the round/pool row at all times, and left-align both rows to
`#topbar`'s own x so the bar has one left edge in both views. Note that P1-2's recommendation —
stripping one of the duplicate pool readings — removes most of the second row's content and makes
this cheaper.

**GATE** **None** if only layout moves.

---

#### P2-15 · The proposal pane is now the only prose pricing surface in the artifact *(carried from D-33 P2-6 — still needs a developer decision)*

**WHERE** `w1920-06-proposal.png` · `w1920-partA.json` → `ap.text`.

**WHAT** Unchanged since D-33, verified verbatim: eight consecutive sentences each opening
*"Pounce costs…"* / *"Pounce needs…"*; *"This report has no figure for that pool."* printed three
times; the admission line *"Your Pounce says: target Health -2, target Shield -1, …"* with
hyphen-minus; the Changes rows rendering `target Health [-2]` while the editor one pane away renders
the identical fact as D-30's red badge on a green square; *"Nothing here is applied."* at the top
and *"Nothing here has been applied…"* at the bottom; the Target chip row running Cat 1…Cat 9,
Mech 1, Mech 2 with **Mech 3 orphaned on a second line** and no side boundary.

What has changed is the context. D-35's round rules and D-37's popup both render symbolically, so
this pane is now the **only** surface in the file that prices something in prose. It is also the
only said/refusal in the file with its own styling: measured, `#act-prop-refuse` is 17 px `--ink`
with a 1 px left border, against six other said lines at a uniform 18 px `--ink-dim` with none.

Also measured: the pane overflows its own box — `clientWidth 990 / scrollWidth 1014`,
`clientHeight 994 / scrollHeight 1016`.

**CHANGE** As D-33's pass H wrote it, unchanged, plus: normalise `#act-prop-refuse` to the shared
said treatment.

**GATE** `PROPOSE_FLOOR` (23) and the tooltip harvest. **Raise with the developer before
implementing** — it extends D-29's symbol rule to the authoring surface.

---

### P3 — fine polish

---

#### P3-1 · The hidden tick is still in every unselected control's accessible name, and now on three more components
**WHAT** Measured: an undeclared `.fg-act` has `textContent === "Slash−✓"` with its `.fg-check` at
`visibility: hidden`; an unselected `.rr-pill` reads `"Mechs✓"`; `.vw-btn` reads `"The fight✓"`;
`.ae-pill` and `.pk-list-item` the same. D-33 P3-7 unfixed, and the pattern was copied into two
components authored since.
**CHANGE** In **[C14.3]** / **[C17]** / **[C10]** / **[C12]** / **[C07]**: reserve the width with
padding and write the character only onto the selected control.
**GATE** Verify against the harvest **before and after** — that answer decides whether the floors move.

---

#### P3-2 · The removal badge is larger than the token it marks, and the picker's tokens run at half the document scale
**WHAT** Measured in the fight picker: `.sym-sign` is **12.7 × 18 px** (font-size 18 px) sitting on a
`.tok` of **12 × 12 px**, while `--tok` is **22 px** document-wide. So the mark overflows its token
by 6 px vertically and the picker's cost tokens are 55 % of the document scale. `zoom-fg-row1.png`
at 3× shows it as a diagonal stroke across the triangle's top-left corner. One good change since
D-33: the badge is now **one per term group**, not one per repeated glyph — a 2-AP cost draws `−▲▲`
with a single mark.
**GATE** Geometry cells reading token box size. **This is D-30's spec — raise before implementing.**

---

#### P3-3 · A +1 round rule and a −1 round rule differ by a ~4 px mark at 1×
**WHAT** Measured: `{who: mechsEach, tok: shield, d: +1}` renders one plain square,
`.sym-sign` count **0**. `{who: catsEach, tok: Rage, d: −1}` renders one hexagon with **1**
`.sym-sign`. Status decay and shield regen are the two uses D-35 names by example, and at projector
distance they are one token each. Visible in `w1366-15-fight-3rounds.png`: *"Cats ▲▲▲ / Mechs ▲▲▲ /
Cats, each unit ⬢"*.
**CHANGE** Consider a leading `+` in the reading, or a plus badge on the accent channel matching
D-30's red minus. **Touches D-30's spec — raise before implementing.**

---

#### P3-4 · The sticky header and footer cut the dialog body with a hard edge
**WHAT** `w1366-05b-actedit-maxed.png`: a half-row of pill outlines is sliced under the "Pounce"
title at y=95–108, and another above the footer at y=630–645 — no fade, no border, no shadow. Reads
as a rendering fault rather than as an invitation to scroll. `[C16]`'s edge-fade idiom exists and is
not applied to the two sticky edges.
**GATE** **None.**

---

#### P3-5 · The "THE FIGHT" eyebrow labels two unrelated buttons
**WHAT** Measured: `Undo` sits inside the same `.brd-tokedit` group as the eyebrow "The fight" and
the button "End the fight". Every other eyebrow labels exactly one control. Undo is the only topbar
button without a caption of its own, and it reads as part of the fight lifecycle.
**CHANGE** In **[C03]**: give Undo its own group, with or without an eyebrow of its own.
**GATE** `SUITE_FLOOR` if a word is added.

---

#### P3-6 · Every cost/needs row leaves 305 px empty at its tail, and the three term lists have three right edges
**WHAT** Measured at 1920: every `.ae-term` right edge is 1453; the amount field's right edge is
**1148** on cost/needs rows and ~1340 on changes rows. D-33 P2-7's 270 px mid-row void **is fixed**
(chips end at 1068, the amount starts at 1133 — a 65 px gap), and the void moved to the tail. The
empty next-term slot renders seven token pills, **no amount field** and (in Changes) no Caster/Target
pair, so it is structurally a different shape from a real term with nothing saying it is the "add"
affordance (`w1920-07b-actedit-after-cancel.png`). And `None` is chip 1 on cost/needs rows and chip
**3** on changes rows.

---

#### P3-7 · Miscellaneous fine items
- **`.ld-now` is still not a card.** Measured `border-width: 0px`, `background-color: rgba(0,0,0,0)`,
  beside three `.ld-row`s at `border-width: 1px`. D-33 P1-5's second half did not land. (**[C14.2]**)
- **`.pk-body` clips 433 px of 1,305 at 1920** with the "Colour" heading exactly on the fold
  (`w1920-03b-tokpicker-student.png`), and no scrollbar appears in any screenshot — see P1-3's
  measurement of the gutter.
- **`#sh-load-field` still shows the native resize grabber** (`resize: vertical`). The border half of
  D-33 P3-9 is fixed: `#share-code` and `#sh-load-field` now share `1px rgb(42,49,64)`. (**[C13]**)
- **Four dialogs, four vertical origins**: `#tok-picker` y=20 h=1040, `#act-edit` y=55 h=971,
  `#share` y=387 h=306, `#reset-ask` y=392 h=296. D-33 P2-5's flicker **is fixed** — the two share
  panes now differ by 2 px of y and 5 px of height (against 48 px and 102 px before) and the footer
  is one row with `Copy` carrying `brd-btn--go`.
- **The board's action list has no heading.** After "+ Add Cat" the Slash / Hairball / Screech cards
  begin with nothing naming them (`w1920-01b`). D-38 moved the explainer; a two-word heading would
  be a label, not an explainer.
- **"9 of 9 still standing" sits 190 px above a unit reading `Health 0×`** (`w1920-15`). The count is
  the roster's alive flag and the reading is health, and both are correct — but the tool knows both
  and says nothing. Any bridge here must be written carefully against the no-verdict gate; the safe
  version is a reading, not a suggestion.

---

## 3. What D-33 fixed, and whether it held

Checked element by element this run. **20 fixed, 6 partial, 2 not done (both deferred by design).**

| D-33 | status | evidence |
|---|---|---|
| P1-1 pool contradiction | **fixed** between topbar and state card; **re-created** between state card and sidebar | P1-2 above |
| P1-2 nine units, six shown | **fixed** — 9 of 9 render, heading outside the scroller, no `.fg-sides` overflow at either viewport | `fg.scrollers.fresh: []` |
| P1-3 dialogs past the fold | **fixed** — grid + sticky footer, `Done` on screen at both viewports | `w1366-05b` |
| P1-4 ledger card at 1366 | **partial** — note once, zeroes dropped; **dial not re-derived, no edge fade** | P1-5 above |
| P1-5 ledger empty state | **fixed** — dashed "Round 1 will appear here once you advance." card; `.ld-now` card treatment **not** done | `w1920-11` |
| P1-6 destructive outranks commit | **fixed** — Advance filled, bottom-left, caption beneath; Reset demoted, far right | `w1920-10b` |
| P1-7 retarget feedback | **partial** — relabels in place (good); **lit set not scrolled into view** | P2-11 above |
| P1-8 one colour four meanings, no motion | **mostly** — palette separated, 120 ms ramp on 32 classes with the reduced-motion guard; **declared still carries the focus outline**; 4 newer classes outside the ramp | P2-6, P2-7 |
| P2-1 misaligned title, duplicate brand | **fixed** for `.shell-head` (x=160 w=1600, one brand); **re-created** on two new regions | P2-1 above |
| P2-2 topbar reflow | **partial** — one row at both viewports on the board; **still grows 64→101 px and re-aligns right** | P2-14 |
| P2-3 label/button pairs | **fixed** — six 15 px uppercase eyebrows | `w1920-01` |
| P2-4 "Start the fight" dead cell | **fixed** — "End the fight", `disabled === false` | `barBtn` |
| P2-5 four dialog conventions | **mostly** — one footer row, one field border, no pane flicker; four vertical origins remain | P3-7 |
| P2-6 proposal prose | **not done** (pass H, developer decision) | P2-15 |
| P2-7 270 px mid-row void | **fixed** — 65 px; void moved to the row tail | P3-6 |
| P2-8 ticks | **partial** — `.fg-check` correct; **`.rr-check` overflows its button, `.pk-list` tick 240 px away** | P2-2 |
| P2-9 two list designs | **fixed** — picker list is a two-column grid | `w1920-03b` |
| P2-10 `0×` in the lane | **fixed** | `ld.rows` |
| P2-11 labelled empty box | **fixed** — `0×` drawn where zero | `w1920-13c` |
| P2-12 projection panel | **mostly** — header, labelled Close, shadow, pushes not overlays; **clips 51–70 %, not narrowed at 1366** | P1-3 |
| P2-13 build note twice | **fixed** on the board; **re-created** on the fight tab | P2-5 |
| P3-1 the `×` remove control | **fixed** — "Remove", `aria-label="Remove Cat 1"`, 18 px | `probe-regress` |
| P3-2 dead-marker label | **fixed** — "Mark dead" / "Marked dead", tracking `aria-pressed` | `probe-regress` |
| P3-3 no scrollbar styling | **partial** — the declarations exist; the gutter is 0 px and no bar appears in 115 screenshots | P1-3 |
| P3-4 glyph scale | **not done** (developer decision); badge is now one per term group | P3-2 |
| P3-5 emoji in a small shape | **partial** | `w1920-03b` |
| P3-6 `.fg-row:focus-within` | **fixed** — `border-left-color: accent 55%` | CSS scan |
| P3-7 hidden tick in the name | **not done**, and now on three more components | P3-1 |
| P3-8 REF-03 in the sidebar | **landed and invisible** | P1-3 |

---

## 4. Recommended implementation grouping

Seven passes. Ordered so the largest gain arrives first at the lowest gate cost, and so every pass
that moves a floor moves it **once**.

| # | Pass | Findings | Owns | Gate cost |
|---|---|---|---|---|
| **A** | **Free wins** — delete the outline from the three `--on` rules; add the four missing classes to the ramp; breakout `#roundrules` and `#howto`; 18 px on `.rr-pill` / picker swatches; row separators in the round-rules grid; fix the ticks; `align-items: start` on `.ht-grid`; dialog sticky-edge fades; demote the two Remove buttons | P2-1, P2-2, P2-3, P2-4, P2-6, P2-7, P2-12, P2-13(layout half), P3-4 | **[C00]**, **[C02]**, **[C07]**, **[C12]**, **[C16]**, **[C17]**, **[C18]** | **None.** No markup, no strings. Geometry cells on the round-rules card height. |
| **B** | **A typo is not a defect** — route every field refusal to a said line; re-show the committed figure; demote the panel's reset button; add browser checks for all six Enter paths | P1-1 | **[S07.2]**, **[S07.3]**, **[S07.7]**, **[C08]** | `PICKER_FLOOR` + `DIALOG_FLOOR` + `SUITE_FLOOR`. One re-derivation. New browser checks. |
| **C** | **One pool, one word** — drop "The fight as it stands" from `#strip`; resolve the topbar/state duplicate; reference cards first in the panel; narrow the panel at ≤1366; panel edge fade; one build notice; reserve the topbar's round row and left-align it | P1-2, P1-3, P2-5, P2-14 | **[S06.3]**, **[S06.4]**, **[S06.7]**, **[C03]**, **[C15]** | `FIGHT_FLOOR` + `SUITE_FLOOR`. One re-derivation. |
| **D** | **The popup goes where the unit is** — place below then flip, clamp to the viewport, mark the source unit; numerals in the rows; one row grammar; refusal only on refusal | P1-4, P2-8, P2-9 | **[S06.15]**, **[C14.x]** | `FIGHT_FLOOR` + geometry cells. Do the two string changes together, re-derive once. |
| **E** | **The lane earns its height** — re-derive both dials against 693 px; action lines first; left/right edge fade; card the `.ld-now`; subgrid the two sides | P1-5, P2-10, P3-7 (`.ld-now`) | **[C14.2]**, **[S06.8]**, **[C14.1]** | Geometry cells + the dials. No strings if the card is only reordered. |
| **F** | **Say what the cancel did** — the said line after a restore, the restore point on the surface, inert-when-unchanged; scroll the lit set into view; keep the retarget readout on one line | P1-6, P2-11 | **[C12]**, **[S06.5]**, **[S07.3]**, **[S07.5]** | `DIALOG_FLOOR` + `SUITE_FLOOR`. |
| **G** | **Symbols in the proposal; badge and sign scale** *(needs developer decisions first)* | P2-15, P3-2, P3-3 | **[S06.5]**, **[S06.12]**, **[C00]**, **[C14.5]** | `PROPOSE_FLOOR` + the tooltip harvest. |

**Sequencing notes.**

- **Run A first.** Nine findings, zero strings, zero markup outside class lists, and it establishes
  the state vocabulary and the 18 px floor that C, D and E all sit on. Running it later means
  restyling the same elements twice — the same argument D-33's Pass A made, and it held.
- **B second, and on its own.** It is the only pass that touches the commit paths of four different
  surfaces, and it is the finding a student meets first.
- **C before D and E.** C removes a block from `#strip` and a row's worth of height from `#topbar`;
  both change the space D's popup is clamped into and E's dials are derived against.
- **D and E both move `FIGHT_FLOOR`.** If they run in the same turn, re-derive once.
- **G last, and only after the developer confirms.** P2-15 extends D-29's symbol rule to the
  authoring surface; P3-2 and P3-3 are D-30's own notation. All three are theirs to say.

**What this audit did not change.** Nothing in `cats-vs-mechs.html`. D-34's revert semantic, D-35's
bounds-refuse-rather-than-clamp rule, D-36's team-resource nudge, D-37's supersession of it on the
battlefield and D-38's tab split are treated throughout as the developer's settled choices — every
finding above either polishes them or removes something that was defeating them, and none
relitigates them. The no-verdict gate, UX-02's labelling floor, the token system, the single-file
offline contract and the no-`innerHTML` / no-SVG / no-`url(` rules constrain every change proposed
here. **No new hex is proposed** — the stylesheet's 15 hex values were counted this run and every
colour above is an existing token or a `color-mix()` of one.
