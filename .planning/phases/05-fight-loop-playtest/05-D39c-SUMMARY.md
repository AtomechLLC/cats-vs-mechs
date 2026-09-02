---
phase: 05-fight-loop-playtest
plan: D39c
subsystem: presentation
tags: [d-39, audit-pass-c, p1-4, p1-5, p1-6, g-02-1-d, g-02-1-e, s06-14, s06-15, s06-8, s07-1, s07-3, s08, c14-2, c14-3, c14-6, c14-7, probe-du, rows-turned-in-the-open]

requires:
  - phase: 05-fight-loop-playtest
    plan: D39
    provides: "the audit — P1-4, P1-5 and P1-6 with their measurements, their screenshots and their prescriptions"
  - phase: 05-fight-loop-playtest
    plan: D39b
    provides: "#act-edit-said and [S07.1]'s said-channel pair, which P1-6's receipt is written onto; and the recorded habit of pricing an audit claim before taking it"
  - phase: 05-fight-loop-playtest
    plan: D37
    provides: "[C14.7]'s popup, [S06.15]'s placement, and the one deliberate trade P1-4 had to honour"
  - phase: 05-fight-loop-playtest
    plan: D33b
    provides: "the 22vh ledger dial and the six-row table P1-5's audit claim says does not exist"
  - phase: 05-fight-loop-playtest
    plan: D34
    provides: "restoreAction, the snapshot-at-selection semantic, and rows 113/113b/113c"
provides:
  - "[S06.14] fgBoxAt returning the room it placed into — four arms, idempotent, with a one-row floor"
  - "[C14.7] .fgu bounded by --fgu-h, so the popup can never run past the fold nor back over its own shape"
  - "[S06.15] fguMark — the source shape marked on two channels, exactly one at a time"
  - "[S06.8] ldFill's reading order: the round number, the ACTIONS, then the board"
  - "[C14.2] the ledger card dial re-derived to 26vh against both a typical round and the worst case"
  - "[S07.1] saySaidLine / dropSaidLine — the said channel named for what it carries, not for its first caller"
  - "[S07.3] the restore receipt, and its own sentence for a press that put nothing back"
  - "[S08] the app owns Ctrl+Z and the three free-text boxes are named"
  - "[S07.1] openSole / focusIntoDialog — one function for the two lines all four openers ended in, plus the keyboard"
  - "the recorded rule: a keyboard placement made during pointerdown is overwritten by the browser's own focus-on-mousedown, so it goes on the next frame"
affects: [05-D39d, 05-D39e, 05-D39f, 05-D39g, 05-11]

tech-stack:
  added: []
  patterns:
    - "a placement function measures the room it chose and returns it; only the caller with a scroller applies it"
    - "an allowlist of exceptions faces so that a thing added later defaults to the safe side"
    - "work that must land after a repaint is scheduled on the animation-frame callback list, in registration order, wrapped through the one error boundary"
    - "a said channel carries a refusal or a receipt, and the drop rule does not have to know which"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D39c-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - tests/stub-dom.cjs
    - .planning/phases/05-fight-loop-playtest/deferred-items.md

decisions:
  - "P1-4's first two prescriptions are already the shipped code and the audit's reading of them is wrong on all three counts. It IS clamped — and the clamp is the defect. It IS flipped. It IS placed below when there is room. What no dial and no preference could fix is that the clamp resolved a no-fit by pulling the box onto its own shape, and that is what the bound fixes."
  - "P1-5's dial DID get re-derived under D-33 P1-4 and the audit's claim that step 3 did not happen is wrong; its own measurements ARE 22vh. What was true is that NO setting from 15vh to 40vh put an action line on screen, because they sat under twelve unit lines. The order changed first and the dial second."
  - "P1-6 is a receipt and not a gate. D-17 stands: the test it sets is whether a mis-press is recoverable, and one Ctrl+Z is the answer, so there is still no confirmation in front of the press."
  - "The receipt names no action and no type. The dialog's own list and heading name it four inches away, and a student's word on that line would be one more place ALLOC-10's exemption channel has to reach for nothing gained."
  - "G-02.1-D's allowlist names the three FREE-TEXT boxes rather than the value fields, so a field added by a later plan defaults to the app's undo. The other direction defaults a new value field straight back into this defect."
  - "The keyboard placement and the undo caret are both scheduled a frame out, for plan 05-10's measured reason at a third and fourth surface: our handlers run on pointerdown and the browser's own focus step runs after them."
  - "Row 90d's placement clause was removed after PROBE DU rather than weakened to pass. The stub reproduces the very race the deferral exists to lose and has no frame to defer to, so the claim belongs to browser cell 27d."

metrics:
  duration: ~6h
  completed: 2026-09-02
  tasks: 5
  commits: 6
---

# Phase 5 Plan D39c: D-39 Pass C — The Positional Tier and Two Measured G-Defects Summary

**One-liner:** The unit popup stopped resolving a no-fit by covering the very unit it names and
started saying which one that is; the ledger lane showed an action line for the first time since
D-28 asked for one; the cancel step stopped throwing an authoring session away in silence; and
Ctrl+Z in a field stopped rewinding text a blur then committed as a fresh edit — with five audit
and file claims corrected against measurements, three harness rows and one cell turned in the
open, and one probe that found a check I had just written could not fail.

---

## 1. The headline

| runner | before | after |
|---|---|---|
| `tests/selftest-node.cjs` | 1336 passed, 0 failed, exit 0 | **1336 / 0**, exit 0 |
| interaction gate | 217 of 217 | **218 of 218** (+ row 120b) |
| stub-drift | 163 shell ids | **163** — unchanged |
| Layer C floors | 179 / 32 / 725 / 725 / 747 / 62 | **identical** |
| `tests/selftest-dom.cjs` | 1460 passed, 0 failed | **1460 / 0** |
| `tests/browser-checks.mjs` | 322 passed, 0 failed | **338 / 0** (+ 25e, 26i, 27d, 27e, four columns each) |
| live `#selftest`, real browser | 1460 / 0 | **1460 / 0**, chrome and msedge |

**No floor moved and no shell id was added.** P1-6 adds three rendered strings and the channel they
land on was already reserved by Pass B, hidden and empty; Layer C harvests a leaf only when its
`textContent` is non-empty, so a receipt costs the scan nothing until a student presses the control.

**Zero page errors and zero console errors** in every run, both engines, both viewports.

---

## 2. What landed

### P1-4 · The clamp stopped resolving a no-fit by covering the unit it names — `[S06.14]`, `[S06.15]`, `[C14.3]`, `[C14.7]`

**The audit's measurement is right and its reading of it is wrong on all three counts.** It reports
`popup.y === unit.y − 355` for all twelve and concludes the box is "never placed below a unit, never
flipped, never clamped". Driven here, twelve units, both viewports, both boards:

| | at rest | scrolled so the shape sits high in the window |
|---|---|---|
| placed **below** | 0 of 12 | **yes** — it is the first arm and it is taken |
| **flipped** above | 12 of 12 | yes |
| **clamped** | yes — `Math.max(8, …)` | yes, and the clamp is the defect |

The battlefield sits low in the window at the resting scroll position, so the below arm never wins
there. That is the rule choosing, not the rule being absent.

**What the audit found and did not name is what the clamp DID when neither side had room.** Measured
at 1366×768 with one student-authored unit-scope type (box 467 tall), the page scrolled so Cat 1's
shape sits 300px down:

```
shape 300–365   popup 8–475   covers its own shape: YES, and eight others
shape 400–465   popup 8–475   covers its own shape: YES
```

`r.top − h − 6` is −173, the `Math.max` pulls it to 8, and 8 + 467 lands 110px past the top of the
shape whose numbers the box is showing. `[C14.7]`'s own banner calls that the one thing this must
never do — it rejected the obvious fix on exactly that picture and never asked whether the clamp it
kept could reach the same place.

**So `fgBoxAt` measures the room and the box is bounded to it.** Four arms — below when it fits,
above when it fits, then the side with MORE room bounded to that room — and the bound is what makes
arms 3 and 4 honest. **It is idempotent**, which is the property a bound could have cost: this runs
on every commit and every scroll and measures the box's current height, so each arm's output is
walked to a fixed point in the banner. The publisher drops `--fgu-h` before it measures so a box
arriving from a different anchor is read at its natural size. `[C14.6]`'s nudge gets no bound and the
absence is written at the site: it has no scroller and would clip what a bound cut off.

**D-37's one recorded trade is kept whole.** A box hard against the top of the viewport may still
reach over `#topbar`, which is z-index 20 and drawn under it. `[C14.7]` reasoned that on a picture
and this pass does not re-decide it — arm 4 IS that trade. What it no longer does is come back down
over the shape.

Measured after, all twelve units, chrome and msedge, 1366×768 and 1920×1080, shipped board and a
board with a student type:

| clause | before | after |
|---|---|---|
| covers its own shape | reachable at 1366 by a student's own scroll | **0 of 14 drives** |
| wholly inside the viewport | no | **14 of 14** |
| "Mark dead" reachable | the overflow was the PAGE's | **the overflow is the list's, and it scrolls** |

**And the source shape is marked**, which is the audit's third item and the half no arithmetic can
answer. A 320-wide box up to 467 tall, anchored to one shape in a three-row grid on a 768px window,
WILL cover some of the shapes above or below it whichever side it takes. What a room needs is not a
box that covers nothing; it is to see which shape the box is about. Measured before: nothing at all,
on any of the twelve — no class, no attribute. Now `.bf-unit--open` plus `aria-expanded`, exactly one
at a time, dropped when the box shuts and moved when the box moves.

It is `--state-on-line` / `--state-on-fill` **and it is not an outline**, which is `[C00]`'s own note
read back: those two and `--state-focus` are the same token, and a click leaves the keyboard on the
shape it pressed, so an outline there would be a mark a student cannot tell from their own focus
ring. `.bf-unit--lit` keeps its outline because it is on `--accent-2`. The border-and-fill pair is
the document's other spelling of "this one" — `.fg-act--on`, `.ae-item--on`, `.pk-sw--on` and
`.rr-pill--on` are all exactly these two declarations.

### P1-5 · The lane shows the actions — `[S06.8]`, `[C14.2]`

**Two of the audit's three items are already shipped.** Item 1 says "the dial is still measured
against a card that no longer exists" and "step 3 did not happen"; D-33 P1-4 re-derived it, deleted
the one height query in the file and shipped 22vh with a six-row table, and the audit's own 236px and
167px cards ARE 22vh (15vh would be 162 and 115). Item 3 says to add the left/right edge fade to
`.ld-list`; `[C16]` has shipped it since D-33a, labelled with that finding's own number.

**What was true is that no dial could reach the actions.** Re-measured at 1366×768, three rounds
resolved, twelve declarations a round, one student type — card content **1055px against a 167px box,
84% hidden**:

| `.ld-row` | 15vh | 18vh | 22vh | 26vh | 30vh | 34vh | 40vh |
|---|---|---|---|---|---|---|---|
| action lines seen (of 12) | 0 | 0 | 0 | 0 | 0 | 0 | **1** |
| unit lines seen (of 12) | 3 | 6 | 9 | 9 | 10 | 11 | 12 |

40vh is 305px of a 768px window and it buys one line of twelve. The actions were not under a bound
that was too tight; they were under twelve unit lines and two faction headings.

**So the order changed and only then was the dial worth turning.** `ldFill` appends the round number,
then the actions, then the board. The board's readings are also on the state card 400px below and
drawn larger; the action half is on no other surface in the artifact, because `did` plus `hand` is
the whole of FIGHT-08's log and this lane is the only thing that renders it.

Re-swept after the reorder, both sizes, with the number of declarations a room actually makes beside
the 24-a-round worst case:

| | three declarations a round | | twelve a round | |
|---|---|---|---|---|
| `.ld-row` | @1366 | @1920 | @1366 | @1920 |
| 18vh | 2 of 3 | 3 of 3 | 2 | 3 |
| 22vh | 2 of 3 | 3 of 3 | 2 | 3 |
| **26vh** | **3 of 3** | **3 of 3** | **3** | **4** |
| 30vh | 3 of 3 | 3 of 3 | 3 | 4 |

26vh is the first setting that shows a typical round whole at BOTH sizes and 30vh buys nothing over
it. **What it costs, measured:** the lane goes 183 → 214 at 1366 and 242 → 285 at 1920, and the page
2292 → 2323 and 2351 → 2394. **The Advance control and the state window do not move at all** — read
at every setting from 15vh to 40vh, `.fg-sides`' top and Advance's top are the same number in every
row. That is D-33 P1-6's sticky footer paying for itself a second time.

**Said out loud:** the board half is now the part below the fold — 0 of 12 unit lines inside the card
at 26vh. That is the trade and it is the right way round, because the board is on the state card and
the actions are nowhere else.

### P1-6 · The cancel step leaves a receipt — `[S07.1]`, `[S07.3]`

The audit's journey, all through shipped controls: New action, named it, authored twelve terms,
opened and closed the Proposal, renamed it, cleared a cost term, pressed the control.

```
before:  name "Pounce EDITED",  cost [t1x1, shieldx1, hpx1], +4 req, +4 xf
after:   name "New action",     cost [apx1],                  req [], xf []
```

"All twelve terms gone. No confirmation, no preview of what will be lost, and **no said line
afterwards** stating what came back."

**The behaviour is D-34's recorded semantic and is correct; the silence was the defect.** There is
still no confirmation in front of this press — D-17's test is whether a mis-press is recoverable and
one Ctrl+Z is the answer, which is what `removeAction` and `dropType` each decline a modal for. So
the fix is a receipt:

> This action is back to the name and the 2 terms it had when you selected it. One Ctrl+Z takes that back.
> This action is already the way it was when you selected it. Nothing was put back.

Two facts and no judgement: what came back, **counted off the snapshot rather than described**, and
where the recovery is — the how-to tab's own sentence about this control, moved to the moment a
student needs it instead of left on a tab they are not reading mid-authoring. The comparison is made
before the dispatch, which is the only moment the two records can still differ.

**Neither sentence names an action or a type.** The dialog's list and heading name it four inches
away, and a student's word on this line would be one more place ALLOC-10's exemption channel has to
reach for nothing gained.

`[S07.1]`'s pair is renamed **`saySaidLine` / `dropSaidLine`** — a function called `sayRefusal`
printing a receipt is a name that lies. `refuseLoudly` keeps its own name, because that function is
about the line between a refusal and a defect. The drop rule is unchanged and did not have to learn
which of the two it is dropping, which is the whole value of one pair.

### G-02.1-D · Ctrl+Z in a field reaches the board's undo, once — `[S08]`

The rehearsal closing note found a third behaviour that neither of this file's two written ones
describes. `[S08]`'s comment said *"whenever a text-editing surface has focus, the browser owns
undo"*; 2.1 check 6 said the press *"should do nothing"*; what shipped was:

```
1. rename Slash -> Pounce through the real field, committed with a real Enter
2. Ctrl+Z          -> field reads "Slash", record still "Pounce"
3. click away      -> record "Slash", A FRESH RENAME from text nobody typed
4. Ctrl+Z, Ctrl+Z  -> two presses to reach the name they had
```

The early return means `preventDefault` is never reached, so the browser's own text undo gets exactly
the chance the comment says it is denied. Nothing is lost, which is what makes it quiet.

**The default inverts and the exceptions are named.** Every field but three is a VALUE field that
commits on blur against a baseline recorded on focusin, so a native rewind is an edit the student did
not make sitting in a field about to be committed. The three that are not are `.err-detail`,
`.sh-code` and `.sh-paste` — free text a student composes or pastes and the artifact never reads
keystroke by keystroke. **The allowlist faces that way on purpose:** a field added later defaults to
the app's undo, and the other direction defaults a new value field straight back into this defect.

The field is **left before the undo runs**, so its own region's commit path takes the pending text and
D-19 can repaint it. Measured after: one press, record and field both back, undo depth 1 → 0, and the
blur that follows moves nothing.

### G-02.1-E · The keyboard goes in with the dialog — `[S07.1]`

Measured on the shipped file in real Chrome and real Edge: `document.activeElement` is **BODY** after
either authoring dialog opens through its own topbar control. Phase 2 recorded this as probably its
own test pane. It was not the test pane. `showModal()` will not do it either — the dialog focusing
steps skip a dialog with no `tabindex`, and none of the four has one.

`openSole()` is the two lines all four openers already ended in plus the placement; `focusIntoDialog`
takes the **first focusable**, derived and not chosen, because that is where a Tab from the body was
going anyway. Measured after, all four, both engines, both sizes:

| dialog | the keyboard lands on |
|---|---|
| `#tok-picker` | `pk/list/hp` — which type am I on |
| `#act-edit` | `ae/side/cats` — which side am I on |
| `#share` | `sh/code` — the build code |
| `#reset-ask` | **`rs/cancel`**, and NOT the accented control beside it |

That last row is why this is safe on all four rather than on the two the note named.

---

## 3. The frame that both G items had to be scheduled onto

Both fixes were written synchronously first and both **measured the defect moving rather than
going.** They are the same mechanism at two surfaces, and it is plan 05-10's own sentence:

> "a POINTER press on any control whose own node is rebuilt drops the keyboard to `<body>`, because
> withPreservedFocus restores focus during pointerdown and the browser's own focus-on-mousedown then
> targets a node the rebuild has detached."

**G-02.1-E**, instrumented in the artifact and driven: `focusIntoDialog` entered, focused control 0,
and read `document.activeElement === node` as **TRUE** — and one turn of the event loop later it was
BODY. Every control in this file acts on `pointerdown`, which the spec puts ahead of the browser's
focus-on-mousedown step, and by then the opener is inert. Made inert rather than detached; same event
order, same landing.

**G-02.1-D**, measured: `undo()` only invalidates, the repaint runs on the frame after, and a field
re-focused before that frame is a field D-19 declines to write — record "Slash", field "Pounce", one
blur from committing it.

Both are on the animation-frame callback list now, and the ordering is registration order rather than
a hope: the render frame is booked before either of these books its own. Both are wrapped, which is
`[S06]`'s `schedule()` rule for every frame this file takes out.

---

## 4. Rows and cells turned in the open

Nothing was narrowed to make it pass. Each turned row asserts **more** than it did.

| row / cell | what it asserted | why it had to turn | what it asserts now |
|---|---|---|---|
| node **57** | six inline-style accesses | the bound is a third `--fgu-` publication, written twice by one function | eight, read in context, with the drop-before-measure ordering and the reason the nudge gets none |
| node **103f** | the card has board leaves and action leaves | a leaf count cannot see which half is on top, and the audit photographed a lane whose action lines had never been on screen | plus the card's own child order — round, actions, board — read off the DOM and never off a computed style |
| node **90d** | the panes move and each close hands focus back | **the share half could not fail**: row 90 opens share then reset, D-38's soleDialog shuts the first, and every press below landed on a CLOSED dialog. The hand-back passed by never running | both surfaces driven OPEN, each re-opened through its own shipped control, and both hand-backs actually run |
| browser **17b** | every card has board leaves and action leaves | green in four columns for three plans over a lane whose action lines sat 500px below the card's own fold | the FIRST action line wholly inside the card's box at its resting offset, on every card, plus the child order |
| browser **113 / 113b** | the restore is byte-identical and the inert press is inert | neither said anything about what a student is told | plus the receipt, its term count DERIVED from the snapshot in the row, the channel read before the press and required hidden and empty, and the two sentences compared to each other |

**Four cells added:** browser **25e** (the receipt with a real box, in its own row of the sticky
foot), **26i** (twelve units plus three scroll positions, both placement arms driven), **27d** (four
dialogs, first focusable, not the accented one, and one Tab must move on) and **27e** (the closing
note's exact sequence, plus the paste field keeping the browser's undo). **One node row added:**
**120b** (the source mark on two channels at three moments, including the box MOVING between units).

---

## 5. Six probes, and one of them changed a row

Every probe was run **after** the commit it tests, and reverted from a scratchpad copy of the
committed tree.

| probe | what it took out | result |
|---|---|---|
| **DP** | the shipped two-arm clamp back into `fgBoxAt` | browser **26i** red at 1366 in both engines |
| **DQ** | `fguMark(anchor)` | node **120b** red; browser **26i** red in all four |
| **DR** | the board back on top of the card | node **103f** red; browser **17b** red in all four |
| **DS** | the receipt line | node **113** and **113b** red; browser **25e** red in all four |
| **DT** | the shipped `INPUT / TEXTAREA` early return in the undo shortcut | browser **27e** red in all four |
| **DU** | the keyboard placement out of `openSole` | browser **27d** red in all four — and see below |

### PROBE DU is the finding of this pass

**It stayed green on the node gate**, 218 of 218, over a clause I had just written into row 90d.
The clause asked whether `activeElement` had left the OPENER — and `<body>` is not the opener either,
`<body>` being the exact state G-02.1-E exists to catch. A check that cannot fail is worse than no
check, which is PROBE DL's record two passes back arriving at my own new row.

The honest spelling was written next — `activeElement` is INSIDE the dialog — and it **reddens on the
shipped file.** Measured why: this stub focuses the pressed control AFTER the handler returns, which
is the browser's own focus-on-mousedown reproduced, and it is the very race the placement defers a
frame to lose. There is no frame here to defer to.

So the clause was **removed rather than weakened**, both spellings and both results are written at the
row, and the placement is browser cell 27d's — where there is a real event order, a real selector
engine for `:not([disabled])` and a real Tab. Row 90d keeps the turn that is genuinely its own.

**And PROBE DP's asymmetry is recorded rather than papered over.** It reddens 26i at 1366 in both
engines and stays green at 1920: the defect needs a box taller than the room on both sides, and at
1080 with the shipped roster the box is 349px against roughly 470 above and 530 below. That is the
geometry being honest, and it is in `deferred-items.md` with what it would cost to close.

---

## 6. Five claims corrected, with measurements

**1. P1-4's "never placed below a unit, never flipped, never clamped" is wrong on all three.** It is
clamped — and the clamp is the defect. It is flipped, on all twelve. It is placed below whenever
there is room, which the resting scroll position never gives and a student's own scroll does. Browser
cell 26i drives both arms and prints the counts.

**2. P1-5's "the dial is still measured against a card that no longer exists" is wrong.** D-33 P1-4
re-derived it, deleted the one height query in the file, and shipped 22vh with a six-row table. The
audit's own 236px and 167px cards ARE 22vh.

**3. P1-5's item 3, the `.ld-list` edge fade, already ships.** `[C16]` has carried it since D-33a,
labelled with that finding's own number — the same shape of correction Pass B made about the
scroll affordance.

**4. `[C14.7]`'s own banner is right about the fix it rejected and silent about the one it kept.** It
records that clamping the top to the topbar's foot would land the box on its own shape, and does not
ask whether `Math.max(8, …)` can reach the same place. It can, and this pass measured it.

**5. `[S08]`'s undo comment describes code that is not under it.** *"the preventDefault() guarantees
the browser's own text undo never gets a chance"* — the early return two lines above means
`preventDefault` is never reached. Two decisions in one file disagreeing with a student in between,
which is D-39 P1-1's shape at a fifth site.

---

## 7. Deviations from plan

### Auto-fixed issues

**1. [Rule 3 — blocking] `dropSaid` was already taken, nine call sites away**

- **Found during:** the P1-6 rename
- **Issue:** `[S07]` is ONE IIFE and the share region already owns a zero-argument `dropSaid()`. A
  second `function dropSaid(node)` would have been a REDECLARATION of that binding rather than a
  second function — the two names one variable, the share surface's own drop suddenly taking a node
  it does not want, and nothing in either gate obliged to notice.
- **Fix:** `saySaidLine` / `dropSaidLine`, with the collision written at the banner as the reason.
- **Commit:** `9f5a0d0`

**2. [Rule 1 — bug] Browser cell 25e's first draft killed a cell 200 lines below it**

- **Found during:** the first run of the browser gate with 25e in it
- **Issue:** it opened with `App.ops.resetToDefaults()` to get a known board, which threw away the
  token vocabulary cells 25a and 25b had authored. The round-rules cell then went on pressing a type
  that no longer existed and the whole run died with a page error instead of reporting a red.
- **Fix:** the whole state is recorded and handed back, the handing back is asserted, and nothing in
  the cell is compared against a name typed into the file — the action's own name is read at rest.
- **Commit:** `9f5a0d0`

**3. [Rule 1 — bug] Cell 26i's `markReachable` clause was measuring the wrong thing**

- **Found during:** the first browser run with 26i
- **Issue:** it required the "Mark dead" row to be inside the viewport at rest, which the bound makes
  false on purpose — the list is supposed to scroll. Read that way the cell would have reddened on
  its own fix.
- **Fix:** the clause is the audit's own distinction instead. It measured that row 81px below the fold
  and said why it was fatal: *"`#fg-unit-rows` does not scroll to compensate … the overflow is the
  PAGE's, not the container's."* So what is asserted is that one scroll of THAT container puts the
  control wholly inside both its own box and the window.
- **Commit:** `8639305`

**4. [Rule 1 — bug] Two words this file's own gates refuse, again**

- `/loser/i` is banned as a substring document-wide and matches the middle of "closer" — so the
  banner naming the rehearsal closing note tripped Layer A twice. Reworded.
- **Commit:** `fc72296`

**5. [Rule 3 — blocking] check 57's count is 8 and not 6**

- The first turn wrote 6 → 8 in the row and 6 → 6 in the artifact's own note beside it, because I
  had forgotten the two `--topbar-` publications while counting. Both say 8 now.
- **Commit:** `8639305`

### Findings recorded rather than taken

**6. [Rule 4 — architectural] P1-6's items 2 and 3**

Item 2 wants the restore point named permanently beside the control — a PERMANENT string, which moves
`DIALOG_FLOOR` and `SUITE_FLOOR` where the receipt moves neither, and a second sentence about one
press standing beside the first. Item 3 wants an inert-LOOKING control, which is a new visual state on
a control check 113b reads at five moments for never being disabled; the pass answered the same need
with words, which is what `.fgn-says` and `.fgu-says` already do for "the press moved nothing". Both
are in `deferred-items.md` with the pricing, owned by the 05-11 playtest.

---

## 8. Verification

**Read back off rendered pixels**, real Chrome **and** real Edge, headless, `file://`, 1920×1080
**and** 1366×768, with `--hide-scrollbars` removed from the default args. Every state reached by
pressing shipped controls; every typed value entered with real keystrokes.

| shot | what it settles |
|---|---|
| `*-P14-mark.png` | Cat 5's card filled and outlined while Cat 4 and Cat 6 are plain, the box headed "Cat 5" directly above it, whole with "Mark dead" on screen |
| `*-P14-bounded.png` | the bounded box at the scroll position the shipped clamp failed at: hard against the top, scrolling on itself, clear of its own shape |
| `*-P15-lane-d3.png` | three cards each showing "Cat 1 uses Slash on Mech 1." and the two lines under it — the half D-28 asked for, on screen for the first time |
| `*-P16-receipt.png` | the receipt in its own row of the sticky foot above Proposal / the cancel / Done, with the heading and the field both back to "Slash" |
| `*-GE-reset.png` | the confirmation opening with the focus ring on **Cancel** and not on "Discard and start over" |

**Drivers and measurements:** `scratchpad/d39c/` — `lib.mjs`, `pop.mjs` (twelve units, four boards),
`hole.mjs` (the clamp defect at seven scroll positions), `rest.mjs`, `ld.mjs` (the dial sweep at two
declaration counts), `p16.mjs`, `g.mjs`, `g2.mjs` (the closing note's exact sequence), `live.mjs`, the
`shot*.mjs` drivers, and the `probe-*.txt` runs.

**The live `#selftest` probe carries the closing note's own probe bug as a comment**: `goto(URL)` then
`goto(URL + '#hash')` is a same-document navigation, so `boot()` never runs again and the flag is
never read. It reloads.

---

## 9. Hand-offs

- **Pass D and later** inherit `fgBoxAt` returning a triple. Any new box placed by it gets the room
  measured for free and must decide, at its own call site, whether it has somewhere to put what a
  bound would cut off. `[C14.6]`'s paragraph is the template for saying no.
- **A rule for every later plan that adds a dialog:** it opens through `openSole`, which is the two
  lines and the keyboard. A fifth opener that spells `soleDialog` + `showModal` by hand is a surface
  that opens on `<body>` and nothing will say so.
- **A rule for every later plan that adds a field:** it defaults to the app's Ctrl+Z. Adding it to
  `FREE_TEXT` is a decision to be made and written down, not the path of least resistance.
- **Anything that must land after a repaint** goes on the animation-frame callback list, wrapped.
  Two surfaces measured the same defect this pass and plan 05-10 measured it first.
- **P2 remains unstarted** apart from Pass A's items. P2-5 (the build notice printed twice on the
  fight tab) and P2-14 (the topbar's 37px growth) are still Pass C's leftovers on paper and neither
  was touched.
- **The ledger's board half is now the part below the fold.** Any later plan that wants a unit line
  back has to spend lane height for it, and the sweep tables in `[C14.2]` are the price list.

---

## Known Stubs

None. Nothing in this pass renders a placeholder and no data path was left unwired. The receipt is
written by one function driven in both gates; the popup's bound and mark are written by two functions
driven in both gates.

## Threat Flags

None. No new network surface, no auth path, no file access and no schema change. The three new
strings reach the page through `textContent`, which is `[S08]`'s own rule for the same reason (threat
T-01-02). `aria-expanded` is written with `setAttribute` from a two-value literal and never from
anything a student typed.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND, modified
- `tests/selftest-node.cjs` — FOUND, modified (check 57 turned; rows 90d, 103f, 113, 113b turned; 120b added)
- `tests/browser-checks.mjs` — FOUND, modified (cell 17b turned; 25e, 26i, 27d, 27e added)
- `tests/stub-dom.cjs` — FOUND, modified (one stale identifier in a comment)
- `.planning/phases/05-fight-loop-playtest/deferred-items.md` — FOUND, two entries appended
- `.planning/phases/05-fight-loop-playtest/05-D39c-SUMMARY.md` — FOUND
- commit `8639305` (P1-4) — FOUND in `git log`
- commit `976fa87` (P1-5) — FOUND
- commit `9f5a0d0` (P1-6) — FOUND
- commit `fc72296` (G-02.1-D and G-02.1-E) — FOUND
- commit `b542406` (PROBE DU's correction) — FOUND
- node gate exit 0 (1336/0, 218/218, 163 ids, floors 179/32/725/725/747/62), DOM 1460/0,
  browser 338/0 and live `#selftest` 1460/0 in chrome and msedge, all re-run on the committed tree
