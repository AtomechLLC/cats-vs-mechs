---
phase: 05-fight-loop-playtest
plan: D39b
subsystem: interactions
tags: [d-39, audit-pass-b, p1-1, p1-2, p1-3, s07-1, s07-2, s07-3, s07-7, s06-1, s06-7, s06-9, c04, c07, c08, c12, c15, c16, c17, refusal-channel, one-source-function, probe-dl, rows-turned-in-the-open]

requires:
  - phase: 05-fight-loop-playtest
    plan: D39
    provides: "the audit — P1-1, P1-2 and P1-3 with their measurements, their screenshots and their prescriptions"
  - phase: 05-fight-loop-playtest
    plan: D39a
    provides: ".brd-btn--rm, which is the treatment P1-1's panel sub-item wanted; and the recorded habit of pricing an audit claim before taking it"
  - phase: 05-fight-loop-playtest
    plan: D33b
    provides: "fgPoolWords and the one-derivation-two-renderings shape P1-2 takes again at a third site"
  - phase: 05-fight-loop-playtest
    plan: D33c
    provides: "[C15]'s sidebar, .pv-head's sticky top, and REF-03's cards — the three things P1-3 rearranges"
provides:
  - "[S07.1] isRefusal / sayRefusal / dropRefusal / refuseLoudly — the ONE place that tells a refusal from a defect, called from four sub-regions"
  - "four refusal channels with one owner each: .brd-said, #tok-pick-said, #act-edit-said, #rr-refuse"
  - "[S07.3] showAmountValue — showFieldValue's twin for the editor's twelve amount fields"
  - "[S06.7] fgPoolReading — the ONE reading of the action-point pool, rendered at three sites"
  - "[C15] the sidebar's reference as a sticky-bottom bounded scroller, with both ends of the panel closed"
  - "the recorded rule: a page-layer routing guard throws a TypeError, because isRefusal reads the constructor"
  - "PROBE DL — the record that a check driving a defect outside a commit site cannot see a blanket catch"
affects: [05-D39c, 05-D39d, 05-D39e, 05-D39f, 05-D39g]

tech-stack:
  added: []
  patterns:
    - "one discriminator function, four callers: a refusal is rendered where it was raised, a defect is re-thrown to the panel"
    - "a reserved said line per surface, hidden and EMPTY at rest, so a channel costs the Layer C harvest nothing until it says something"
    - "a said line dropped on focusin — dropLoadSaid's rule, applied at four surfaces"
    - "two sticky ends and a scrolling middle, so a panel that names two readings shows both at its resting offset"
    - "background-COLOR and never the shorthand in any rule that outranks [C16]"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D39b-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/stub-dom.cjs
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/deferred-items.md

decisions:
  - "The refusal channel in each DIALOG is in the sticky FOOTER and not under the field. Both dialog bodies scroll (D-33 P1-3), the fields the audit photographed are at the top of 1,466px and 1,087px of content, and a sentence beside a field a student has scrolled past is a sentence nobody reads."
  - "#tok-pick-names, #tok-pick-bounds-said and #rr-said are all left alone. Every one is written FROM STATE on every repaint — they are readings — and a refusal in any of them would be a node with two owners, which is D-39 P2-5's own defect."
  - "P1-2 took the given spec's shape (one source function, three sites, asserted equal) over the audit's (delete the block from #strip). Deleting a reading is what D-33b already declined once for this same finding, and the panel's height was recovered by P1-3's layout instead."
  - "P1-3 declined the audit's 'put the reference cards first'. Its own next item admits that puts the projection below the fold instead — the same defect with the subject swapped, on a panel whose name is both readings. Both ends are pinned instead."
  - "The two page-layer routing guards became TypeErrors. PROBE DL found that a blanket catch passed the entire gate, and with those two throwing plain Errors a drifted data attribute would have printed an internal message on a said line."
  - "Four audit claims corrected with measurements: the scroll-affordance half of P1-3 (a --hide-scrollbars artifact), the narrow-the-panel half of P1-3 (43px of slack, re-swept), the floor moves P1-1 predicts (none moved), and the edge-fade half of P1-3 (already shipped)."

metrics:
  duration: ~5h
  completed: 2026-09-02
  tasks: 3
  commits: 4
---

# Phase 5 Plan D39b: D-39 Pass B — The Behavioural P1 Tier Summary

**One-liner:** A mistyped character stopped opening the crash panel and throwing away an authoring
session on all six typed-value paths, one pool stopped being three readings in two vocabularies,
and the panel called "Projection and reference" showed the reference for the first time in three
rounds — with five harness rows and cells turned in the open, four audit claims corrected with
measurements, and one probe that proved a check I had just written could not fail.

---

## 1. The headline

| runner | before | after |
|---|---|---|
| `tests/selftest-node.cjs` | 1336 passed, 0 failed, exit 0 | **1336 / 0**, exit 0 |
| interaction gate | 216 of 216 | **217 of 217** (+ row 102b) |
| stub-drift | 160 shell ids | **163** (+ three refusal channels) |
| Layer C floors | 179 / 32 / 725 / 725 / 747 / 62 | **identical** |
| `tests/selftest-dom.cjs` | 1460 passed, 0 failed | **1460 / 0** |
| `tests/browser-checks.mjs` | 314 passed, 0 failed | **322 / 0** (+ 10g and 25d, four columns each) |
| live `#selftest`, real browser | 1460 / 0 | **1460 / 0**, chrome and msedge |

**No floor moved,** and the audit predicted three would. Its GATE note for P1-1 says
`PICKER_FLOOR`, `DIALOG_FLOOR` and `SUITE_FLOOR` "all move once", because the guard sentences move
"from `throw` into `textContent`, which is a **new place** for Layer C to harvest". They do not:
every channel ships **hidden and empty**, Layer C harvests a leaf only when its `textContent` is
non-empty, and no row leaves a refusal standing when a harvest is taken. A reserved line costs the
scan nothing until it says something.

**Zero page errors and zero console errors** in every run, both engines, both viewports, before and
after.

---

## 2. What landed

### P1-1 · A typo is a refusal and the panel is for defects — `[S07.1]`, `[S07.2]`, `[S07.3]`, `[S07.7]`, `[C04]`, `[C07]`, `[C08]`, `[C12]`, `[C17]`

**Reproduced first, through the shipped controls, with real keystrokes** — click, select-all, type,
press Enter — because `pg.fill` sets `.value` and the property under test is what Enter does to text
a student typed:

| field | typed | panel | dialog after |
|---|---|---|---|
| `#tok-pick-min` (most is 4) | `9` | yes — "picker keydown" | **closed** |
| `#tok-pick-max` (least is 2) | `1` | yes | **closed** |
| `#tok-pick-min` | `ab` | yes | **closed** |
| `#tok-pick-max` | `999` | yes | **closed** |
| `#tok-pick-name` | *(emptied)* | yes | **closed** |
| `#act-edit-cost-0-amt` | `abc` | yes — "editor keydown" | **closed** |
| `.rr-amt` | `abc` | yes — "round rule keydown" | — |
| board stepper `cats/c1/maxHp` | `abc` | yes — "board keydown" | — |

Six commit functions: `commitField` `[S07.1]`, `commitName` and `commitBound` `[S07.2]`,
`commitActionName` and `commitAmount` `[S07.3]`, `commitRuleAmount` `[S07.7]`. Every one ended in
`if (loud) { throw refused; }`, and `[S08]`'s `fail()` calls `closeModals()`, so in both authoring
dialogs the dialog went with the panel.

**The two decisions that disagreed are both in the file**, twenty thousand lines apart:

```
[S07.2] commitBound:  "`loud` is Enter ... an explicit request earns a readable refusal"
[S08]   the banner:   "A throw from here is a DEFECT and is meant to reach the ... panel"
```

Both are right. The channel was wrong.

**One place decides, four sub-regions call it.** `[S07]` is one IIFE, so `isRefusal`, `sayRefusal`,
`dropRefusal` and `refuseLoudly` are a shared helper rather than four copies — four copies being how
the six paths drifted apart in the first place.

**It is not a blanket catch, and that distinction is load-bearing.** A refusal is a plain
`new Error(sentence)`; a `TypeError`, a subclass, a thrown non-Error or an Error with no message is
re-thrown. That is a real property of `[S05]`, scanned this pass: every guard a student can reach
from a field refuses with a plain Error carrying a sentence, and every `TypeError` there is a
caller-passed-the-wrong-type guard that the page's own parse makes unreachable.

**Four channels, one owner each.** None of them is a node `[S06]` writes from state:

| surface | node | why there |
|---|---|---|
| the board | `.brd-said`, one per stepper line (`[C04]`) | a card carries three to eight steppers; a sentence at its foot would name none of them |
| the token picker | `#tok-pick-said`, in the sticky foot (`[C07]`) | the body scrolls and the fields are at the top of 1,466px |
| the action editor | `#act-edit-said`, in the sticky foot (`[C12]`) | twelve amount fields, and the audit's own measurement was taken with the terms region scrolled |
| the round rules | `#rr-refuse`, in the foot (`[C17]`) | `.rr-rule` is `display:contents` and has no box |

`#tok-pick-names`, `#tok-pick-bounds-said` and `#rr-said` are each written from state on every
repaint and are each left alone. A refusal in one of them is D-39 P2-5's defect — one sentence, two
owners — introduced to save a node.

**It leaves when the student comes back.** `dropLoadSaid`'s recorded rule — *"a sentence about a
paste stops being true the moment the text it was about changes"* — applied at all four surfaces
through the focusin handlers each already had, and on a successful commit.

**Two smaller repairs in the same pass, both the audit's:**

- **The field and the record stopped disagreeing.** `999` into a cost committed with Enter left
  `state.cost[0].n === 99` and `field.value === "999"`. The cause is D-19 and not a missing line —
  `[S06.5]`'s `showAmount` declines to write a **focused** field on purpose, and after Enter the
  field is focused. `showAmountValue` is `showFieldValue`'s twin for the editor's twelve amount
  fields, reading the RECORD and never the typed text. Measured after: field `99`, record `99`.
- **The panel's accented control is the one that keeps the build.** The audit measured
  `brd-btn--danger`-coloured "Reset to Workshop 16 defaults" at x=1563 y=1012 as the loudest object
  on a panel a student met by mistyping a number. `[C08]` gives the accent to "Dismiss and
  continue" and demotes the reset to `.brd-btn--rm`'s treatment — demotion plus separation, D-33
  P1-6's call and D-39 P2-12's, restated under this prefix. The reset keeps every word of its
  label, keeps its one click (D-15) and is never disabled. `.err-btn--danger` stays as a tombstone.

**Read back off pixels**, both viewports, both engines. The board's card:

> Cat 1 · Health `−` **3** `+` ▪▪▪
> *That is not a number this field can take. Type a whole number, or +5 or -8 to adjust the one that is there.*
> Shield `−` 0 `+`

### P1-2 · One pool, one word, three surfaces — `[S06.7]`, `[S06.9]`

The audit's measurement, at 1920, three Cats declared, the sidebar open, all three on one screen:

```
#pool-cats  (topbar,     y=197)  Cats · Action points · 3 of 3 spoken for · 0 left to spend
.fg-res     (state card, y=939)         Action points · 3 of 3 spoken for · 0 left to spend
#strip      (sidebar)                   Action points: 0 of 3 spent so far.
```

Neither figure was wrong. "Spoken for" is what this round's standing declarations have claimed;
"spent" is what the fight has taken out of the build. On round one those are 3 and 0. A student
cannot tell two words apart when both are against one pool and only one of them moves as they
click, and the instructor's line for this tab is *"watch the pool"*.

**D-33b's shape, taken again:** `fgPoolReading(state, side)` is `fgPoolWords` over one
`spokenForPools` walk, and `[S06.9]`'s live block calls it. What is shared is the **sentence** and
not the input — the distinction D-33b's own banner draws, and the reason the first two came apart.

Why this one re-walks and `fgFillPool` does not is written at the site rather than left as an
inconsistency: `fgFillPool` is inside `fightBar`'s per-side loop and is handed the map that loop
built, because the same walk has to feed the reading a student watches *and* the arithmetic that
disables a button. `[S06.9]` has no such loop to sit inside.

**What was given up, said out loud:** `apSpent` loses its last **rendered** site. The derivation is
untouched — still in `[S02]`, still floored, still exercised by the suite. What went is a second
word for one pool standing beside the first, which is P1-2's own third instruction: *"One pool, one
word."*

After, measured, both viewports:

```
topbar      Cats Action points 3 of 3 spoken for 0 left to spend
state card       Action points 3 of 3 spoken for 0 left to spend
sidebar          Action points: 3 of 3 spoken for, 0 left to spend.
```

### P1-3 · The panel called "and reference" shows the reference — `[C15]`, `[C16]`

Measured, `#strip` open in the fight view, every run:

| viewport | clientHeight | scrollHeight | first `.ref-card` top | on screen |
|---|---|---|---|---|
| 1920×1080 | 836 | 1712 | **955** | **no** |
| 1366×768 | 524 | 1637 | **880** | **no** |

All six cards, at both sizes, always. D-33 P3-8 chose this panel for REF-03 *because* P2-12 had
just given it a header and a scroll affordance, and then landed the cards 955px down a container
that shows 836.

**The audit's prescription was declined and its own next item says why.** Item 1 is "put the
reference cards first"; item 2 admits "the projection then falls below the fold instead, which is
the correct trade". That is the same defect with the subject swapped, on a panel whose **name** is
both readings.

**So both ends are pinned and the middle scrolls.** `.pv-head` is already sticky at the top of this
scroller for the reason `[C07]`'s and `[C12]`'s footers are; `.ref-sb` is that idiom turned upside
down. It gets `position:sticky; bottom:0`, a bound of `max(190px, 34vh)`, its own `overflow-y`, its
own sticky section heading and `[C16]`'s cue. The projection keeps its reading order and scrolls
between the two pinned ends.

The bound is in **viewport units and not a percentage**, and that is mechanism rather than taste:
this is a grid item, its containing block is a content-sized row track, and a percentage max-height
against a track with no definite height resolves to `none` — the rule would silently do nothing.

**Both ends of the panel are closed, and a picture found the second one.** A sticky element cannot
leave its containing block, so with `#strip`'s 18px bottom padding in place the pinned section came
to rest 19px above the border and the projection scrolled through the gap underneath it (measured:
ref bottom 735 against panel bottom 754; photographed at 1366 as a strip of *"a hit spills past a
unit's last point of"* running under the cards). The **same gap at the top is older than this plan**:
`.pv-head` carries `margin-top:-18px` so it starts at the border edge in flow, but sticks at `top:0`
— the scrollport's padding-box top, 18px lower — so a sliver of the projection's prose ran along
the top edge over the pink header the moment anybody scrolled. Both paddings go and the two sticky
ends carry them.

`:has(.ref-sb)` gates the bottom half, because with the panel open and **no fight running** there is
no reference section and a flush-to-the-border projection would be the cramped box the padding
prevents. Second use of `:has()` in this file; `[C14]`'s tombstone for the first one expected it.

Measured after, and driven in all four view/fight states:

| state | padding top/bottom | `.ref-sb` |
|---|---|---|
| build, no fight | 18 / 18 | absent |
| build, fight running | 18 / 18 | `display:none` |
| fight, panel open, no fight | **0** / 18 | absent |
| fight, panel open, fight running | **0 / 0** | sticky, 366px at 1080 and 260px at 768, both scrolling |

| viewport | first card reachable at rest | projection figure reachable at rest |
|---|---|---|
| 1920×1080 | **yes** | **yes** |
| 1366×768 | **yes** | **yes** |

---

## 3. Rows and cells turned in the open

Nothing was narrowed to make it pass. Each turned row asserts **more** than it did.

| row / cell | what it asserted | why it had to turn | what it asserts now |
|---|---|---|---|
| node **38** | `loudPanel === true` — Enter on an emptied token name **must open the crash panel** | it was written from the artifact's own word "loud" and nobody asked what channel loud came out on. Green over the defect since plan 02.1-04 | the guard's sentence is on `#tok-pick-said`, the panel stays shut, **the dialog stays open** — a clause the old shape could not carry — the text goes back, the board does not move, and the sentence **leaves** when the student returns to the field |
| node **115** | `errPanel.hidden === false` on **three** refusals, and `errMessage` as the place the type's label had to appear | three typed values were each required to open the panel and, through `closeModals`, to close the dialog being authored in | all three read off `#tok-pick-said` with the panel shut and the dialog open, and the three sentences are compared **to each other** — which is what says the page's refusal did not quietly become one of the op's |
| node **117** | `wtRefusedLoud === true` | a student four presses into authoring a type had the dialog closed under them for typing one number the wrong way round | the same, plus the clause that dialog survives |
| browser **25** | `boundRefusal.panel === true` in four columns of real browser | the half no node row could see: the stub models no close-request behaviour, so `dialogOpen` had to be read in a browser | panel false, dialog open, the sentence naming the type with a real box wholly on screen, and dropped on return |
| browser **10f** | `card.w > 0 && card.h > 0` — REF-03 as a **box in the DOM** | it was green in four columns for three rounds while every one of the six cards sat below the fold | the card, a projection figure and the reference heading are each **reachable inside the panel at scrollTop 0**, plus the mechanism: sticky, bounded, scrolling, four cue layers |

**Two cells added:** browser **25d** (all six commit paths across seven fields, on Enter and on
blur, through the shipped openers, plus the clamp, plus the panel's weight, plus a genuine defect)
and browser **10g** (the three pool readings with real boxes at the same moment). **One node row
added:** **102b** (`accAgree` widened from a pair to a triple, read at four moments).

---

## 4. Five probes, and one of them changed the code

Every probe was run **after** the commit it tests, and reverted with `git checkout`.

| probe | what it took out | result |
|---|---|---|
| **DJ** | put `throw refused` back in `commitBound` | node **115** and **117** red |
| **DK** | pointed the strip's pool line back at `apSpent` | node **102b** red |
| **DL** | replaced `isRefusal`'s body with a bare return-true — a **blanket catch** | **GREEN. 322 passed, 0 failed.** See below |
| **DM** | deleted `[C15]`'s whole `.ref-sb` block | browser **10f** red in all four columns; `cardReachable` and `refHeadReachable` both false, `figureReachable` still true |
| **DN** | swapped `background-color` for the `background` shorthand | browser **10f** red in all four; `refCueLayers` **0** and every other clause still true |
| **DO** | deleted `dropRefusal` from `onPickerFocusIn` | node **38** red |

### PROBE DL is the finding of this pass

A blanket catch is the one thing P1-1 must never become — a swallowed real defect is a board that
quietly stops agreeing with itself for the rest of a workshop, which is strictly worse than an ugly
panel. The gate did not notice. The genuine-defect clause in cell 25d threw from a listener
registered straight through `App.boot.wrap`, so it never reached a commit site and `isRefusal` was
never consulted. **A check that cannot fail is worse than no check.**

Two things came out of it, both committed:

1. **Two page-layer routing guards were on the wrong side of the line.** `fieldOp`'s
   `No set op for "…"` and `sendAmount`'s `No amount op for "…"` each threw a plain `Error`, so
   each would have been **rendered as a student sentence**. Both are about a data attribute that
   drifted — a defect in this file's own markup. Both are `TypeError`s now, messages unchanged.
   `App.ops.dispatch`'s own `Unknown op` arm stays a plain Error and is **named rather than
   changed**: it is `[S05]`'s, this pass does not touch `[S05]`'s guards, and it is unreachable from
   the six sites because both routing tables are allowlists checked before the dispatch.
2. **The drive goes through a commit site.** `#act-edit-cost-0-amt`'s routing attribute is drifted,
   a perfectly good `2` is typed and committed with Enter, `[S07.3]`'s allowlist throws the
   `TypeError` it exists to throw, and `#err-panel` must open with the said line still **empty**.
   Re-run under PROBE DL, cell 25d now reddens in all four columns.

**And a third thing, about the harness itself.** PROBE DL's second run made the panel never open,
so `pg.click('#err-dismiss')` waited 30 seconds on a `display:none` button and the whole run **died
with a TimeoutError** instead of reporting a red cell. Both dismissals in 25d are conditional now.
A cell must FAIL, never throw and never hang — and a cleanup step that assumes the state the cell
is testing for can take the entire report down with it.

---

## 5. Four audit claims corrected, with measurements

**1. P1-1's floor prediction is wrong.** The audit: *"they move from `throw` into `textContent`,
which is a **new place** for Layer C to harvest, so `PICKER_FLOOR` (84), `DIALOG_FLOOR` (138) and
`SUITE_FLOOR` (1186) all move once."* None moved. Every channel ships hidden and **empty**, and
Layer C reads a leaf only when its `textContent` is non-empty.

**2. P1-1's channel list is wrong.** The audit: *"`#tok-pick-names` (`.pk-warn`) is already the
picker's refusal slot and is currently unused for bounds; `#rr-said` exists and is currently
`hidden` when `.rr-amt` refuses."* Both are written **from state** on every repaint — `#tok-pick-names`
by `setText('tok-pick-names', namedByText(state, id))` and `#rr-said` by `roundRules`' cap sentence.
Neither is a refusal slot; using either would have been D-39 P2-5's own defect, one node with two
owners. Three new channels were added instead, which is why the shell id count moved 160 → 163.

**3. P1-3's scroll-affordance half is a measurement artifact.** The audit: *"the measured gutter is
`offsetWidth − clientWidth = 2` … no scrollbar takes any width, and no scrollbar appears in any of
the 115 screenshots this audit took."* Headless Chrome ships `--hide-scrollbars` in its default
args — **D33a's own recorded trap**, and the thing that made D-33 Pass C ship an unstyled white
scrollbar. Re-driven with it removed: the gutter is **12px**, the bar is in the pictures, and
`getComputedStyle` reports `[C16]`'s four gradient layers on `#strip`. The affordance was always
there. Its item 3 ("add the edge-fade the `[C16]` block already defines") is a no-op; the cue was
**extended** to the new scroller instead, per that block's own rule.

**4. P1-3's narrow-the-panel item is declined again, with the sweep re-taken** rather than D-33c's
quoted. At 1366, reading the projection's headline height as the panel shrank:

| panel width | 360 | 340 | 322 | 317 | 300 | 280 | 264 |
|---|---|---|---|---|---|---|---|
| headline | 38 | 38 | 38 | 38 | **77** | 77 | 77 |
| lines | 1 | 1 | 1 | 1 | **2** | 2 | 2 |

43px of slack, and then the sentence `[C10]` sizes for a four-digit turn count on a 24-unit roster
breaks in two. Recorded in `[C15]` beside the rule that is the lever if a room says otherwise.

---

## 6. Deviations from plan

### Auto-fixed issues

**1. [Rule 1 — bug] The `.pk-said` measure stopped it taking a row of its own**

- **Found during:** reading back the first action-editor screenshot at 1920
- **Issue:** `.pk-said` and `.ae-said` carried the 60ch measure every other said line in this
  document has, and the sentence then **shared the footer's row with Done** instead of taking a row.
  A flex item breaks the line on its *hypothetical* main size — the basis **clamped by max-width** —
  so a 100% basis capped at 60ch is a 480px item that fits beside a button.
- **Fix:** the measure comes off both. It is not lost: the footers are ~610px at 1366 and ~1000px
  at 1920 and the longest sentence either can print is 107 characters, so it sets in one or two
  lines at a comfortable width in every column. Photographed both ways.
- **Commit:** `c0fbdbe`

**2. [Rule 1 — bug] `.rr-refuse` would have sat beside the cap sentence at the cap**

- **Found during:** reading back the round-rules screenshot at 1366
- **Issue:** the same clamping, with a worse consequence: `.rr-said`'s 52ch measure is inherited, so
  at the cap the row would have held `+ Add (200) + cap (420) + refusal (420) = 1040` in a 1284px
  row — **two sentences about two different things, side by side**, which is the whole reason the
  second node exists.
- **Fix:** `max-width:none`, so it takes a row of its own at every width. Measured and written at
  the rule.
- **Commit:** `c0fbdbe`

**3. [Rule 1 — bug] The panel's top edge leaked the projection's prose over its own header**

- **Found during:** reading back the P1-3 screenshots at 1366
- **Issue:** older than this plan. `.pv-head` sticks at the scrollport's padding-box top, 18px below
  its own flow position, so an 18px window opened at the border edge the moment anybody scrolled
  the panel. Photographed.
- **Fix:** taken with P1-3's own bottom-edge fix, because they are one defect at two ends and
  fixing one and photographing the other would have been indefensible.
- **Commit:** `811d6ab`

**4. [Rule 2 — correctness] Two page-layer routing guards threw plain Errors**

- **Found during:** PROBE DL
- **Issue:** `fieldOp` and `sendAmount` guard against a **drifted data attribute** — a defect in
  this file's markup — and threw `new Error(...)`, which `isRefusal` reads as a refusal. A student
  would have met `No amount op for "xyz"` on a said line instead of the panel.
- **Fix:** both are `TypeError`s; messages unchanged. `[S05]`'s own `Unknown op` arm is left alone
  per this pass's constraint and its unreachability is written down rather than assumed.
- **Commit:** `5cfbcdc`

**5. [Rule 1 — bug] A cleanup step in my own new cell could hang the whole run**

- **Found during:** PROBE DL's second run
- **Issue:** `pg.click('#err-dismiss')` on a panel that (correctly, under the probe) never opened
  waited 30s and killed the run with a `TimeoutError` — so the probe reported nothing instead of
  reporting red.
- **Fix:** both dismissals conditional, with the rule written beside them.
- **Commit:** `5cfbcdc`

**6. [Rule 3 — blocking] Three harness-authoring mistakes, each caught by a red run**

- browser 25d's first draft required `d39Paths.length === 6`; there are **seven** field drives,
  because `commitBound` owns two ends and both are worth driving.
- browser 25d's picker setup drove `min=9` (refused, so min stayed 0) and then `max=1`, which 0 is
  happily below — so the op **accepted** it and the cell read an empty said line as a defect. The
  board has to be moved into the state that makes each refusal a refusal, and only then frozen.
- browser 10g left `data-proj="1"` standing for the rest of the run. `[C15]` gives `.fg-band`
  374px of padding-right while the panel is open, so the lane lost ~330px, the 24-a-side picker
  rows wrapped, and **cell 6b** went from a 40px last row to a 77px one 12px past the fold. A cell
  that changes a layout-wide flag owns putting it back.
- **Commits:** `c0fbdbe`, `3732ec6`

**7. [Rule 3 — blocking] Two words this file's own gates refuse**

- The word for a judgement is banned as a substring **document-wide**, so `[S07.2]`'s new markup
  comment could not name the gate that bans it. And Layer B's extractor reads a double-quoted span
  inside a **comment** as a string literal, so a quoted sentence containing a comparative word in
  the `[S07.1]` banner tripped the scan from a comment. Both reworded.

### Two findings recorded rather than taken

**8. [Rule 4 — architectural] P1-2's "9 of 9 still standing" duplicate**

The audit names it in the same finding. It is a **duplication and not a contradiction** — both
readings come from `aliveCount` over the same slice in the same frame and agree to the character —
and removing either is a decision about what one of two regions IS. Three admissible answers are in
`deferred-items.md` with the measurement. The plan's instruction was "one pool truth", and that is
what landed.

**9. [Rule 4 — architectural] `.err-detail`'s unstyled scrollbar**

Found on a screenshot taken without `--hide-scrollbars`: `[C08]`'s stack-trace textarea is the last
box in the file outside `[C16]`'s scrollbar list, so Chrome draws it in its light default — the
exact defect D-33 Pass C fixed on `.pk-body` and `.ae-body`. It predates this task, so it is logged
rather than fixed. One selector, when a pass touches `[C08]` or `[C16]`.

---

## 7. Verification

**Read back off rendered pixels**, real Chrome **and** real Edge, headless, `file://`,
1920×1080 **and** 1366×768, with `--hide-scrollbars` removed from the default args. Every state
reached by pressing shipped controls; every typed value entered with real keystrokes.

| shot | what it settles |
|---|---|
| `*-pk-refuse.png` | the picker refusing a Least above its Most: sentence in the foot, dialog open, no panel |
| `*-ae-refuse.png` | the editor refusing a cost amount, the field back at `1`, twelve terms intact |
| `*-rr-refuse.png` | the round rules refusing an amount, on its own row under the add |
| `*-board-refuse.png` | Cat 1's card with the sentence under the Health stepper and the value back at 3 |
| `*-err-panel.png` | a genuine `TypeError` still opening the panel, with Dismiss accented and the reset demoted |
| `*-P13-strip.png` | the sidebar at rest: projection at the top, ACTION REFERENCE pinned at the foot with cards |
| `*-P13-strip-refscrolled.png` | both halves scrolled independently, both headings still pinned |
| `*-P13-full.png` | the whole 1366 tab in Edge: three agreeing pool readings and a reachable reference in one frame |

**Drivers and measurements:** `scratchpad/d39b/` — `lib.mjs` (the `--hide-scrollbars` removal),
`p1.mjs` (six paths, Enter and blur, plus the defect probe), `p23.mjs` (the three readings and the
strip's layout), `heights.mjs`, `sticky.mjs`, `narrow.mjs` (P1-3 item 4's sweep), `buildview2.mjs`
(four view/fight states), `shots1.mjs`, `strip-shot.mjs`, and the `*-p1.json` / `*-p23.json`
readings before and after.

**Every geometry note in the browser gate is byte-identical to the pre-pass baseline** on a diff of
the full note table, apart from the notes this pass added and the one it deliberately turned.

---

## 8. Hand-offs

- **Pass D** (P1-4, the unit popup) inherits a sidebar that is **two bounded scrollers** rather than
  one 1712px column, so any clamp it derives against the panel's box changes. It also inherits
  `.brd-said`: a per-stepper-line refusal channel exists now, and the popup's own rows are steppers.
- **Pass D also owns P2-9**, which is the *popup's* refusal line announcing itself before anything
  is pressed. `[S07.1]`'s `sayRefusal` / `dropRefusal` pair is exactly the shape that finding wants,
  and the drop-on-focusin rule is the half it is missing.
- **Pass E** (the ledger's dials) should know the fight tab's geometry is unchanged — every browser
  note about the lane, the two areas and the Advance control is byte-identical to the baseline.
- **Pass C's remaining items** are P2-5 (the build notice printed twice on the fight tab) and P2-14
  (the topbar's 37px growth). Neither was touched. P2-14 gets cheaper: the topbar's second row now
  carries three agreeing readings rather than one that disagreed.
- **A rule for every later plan that adds a commit path:** the sentence goes to that surface's own
  said line through `refuseLoudly`, and the guard it calls must throw a **plain Error** if it is a
  refusal and a **TypeError** if it is a defect. `[S07.1]`'s banner has the argument and PROBE DL is
  the record of what happens when a check does not drive it.
- **A warning about `[C16]`:** any rule that outranks it and touches a scroller must write
  `background-color` and never the `background` shorthand. PROBE DN measured the cost — the cue
  silently goes to zero layers with nothing on screen to say so — and cell 10f reads the layer count
  back for `.ref-sb` only.
- **The cheapest open item in the document** is still P2-3 answer 3 (let 1366 wrap and turn cell
  25a), unchanged from Pass A.

---

## Known Stubs

None. Nothing in this pass renders a placeholder, and no data path was left unwired. The four
refusal channels ship hidden and empty by design, and each is written by exactly one function that
is driven in both gates.

## Threat Flags

None. No new network surface, no auth path, no file access and no schema change. Every string that
reaches the page does so through `textContent`, which is the rule `[S08]`'s panel driver states for
the same reason (threat T-01-02) — and the three op sentences that now reach a said line were
already reaching the page through the panel's `textContent` before this pass.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND, modified
- `tests/stub-dom.cjs` — FOUND, modified (three ids, three nodes)
- `tests/selftest-node.cjs` — FOUND, modified (rows 38, 115, 117 turned; 102b added)
- `tests/browser-checks.mjs` — FOUND, modified (cells 25 and 10f turned; 10g and 25d added)
- `.planning/phases/05-fight-loop-playtest/deferred-items.md` — FOUND, three entries appended
- `.planning/phases/05-fight-loop-playtest/05-D39b-SUMMARY.md` — FOUND
- commit `c0fbdbe` (P1-1) — FOUND in `git log`
- commit `3732ec6` (P1-2) — FOUND
- commit `811d6ab` (P1-3) — FOUND
- commit `5cfbcdc` (PROBE DL's two findings) — FOUND
- node gate exit 0 (1336/0, 217/217, 163 ids, floors 179/32/725/725/747/62), DOM 1460/0 and
  browser 322/0 all re-run on the committed tree
