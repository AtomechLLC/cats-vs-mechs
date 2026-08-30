---
phase: 05-fight-loop-playtest
plan: D34
subsystem: ops+interactions+render+gate
tags: [d-34, redirect, cancel-step, revert-not-draft, one-commit, s05, s07-3, s06-5, snapshot-placement, focus-preservation, signature-gate]

requires:
  - phase: 03.1-action-authoring-inserted
    plan: "05"
    provides: "editorSig, showAction as the one place that says which action is open, the focus-preserving repaint, [C12], the four-function field contract"
  - phase: 03.1-action-authoring-inserted
    plan: "06"
    provides: "setActionCost / setActionReq / setActionXf, writeSlot / writeTerms / termsOf, requireSlot / requireXfWho / CLEAR_TERM, showAmount's focused-field rule"
  - phase: 03.1-action-authoring-inserted
    plan: "03"
    provides: "createAction / renameAction / removeAction, the three-layer action id gate, requireActionName, the no-op contract"
  - phase: 05-fight-loop-playtest
    plan: D32a
    provides: "the 4/4/4 caps this restore is driven to"
  - phase: 05-fight-loop-playtest
    plan: D33b
    provides: "the sticky .ae-foot the new control had to fit inside"
provides:
  - "[S05] restoreAction — the fifth action write path, one commit, no-op contract, every guard outside it"
  - "[S05] requireRecord / restoredTerms — a snapshot admitted field by field through the four write paths' own gates"
  - "the router's one record-taking arm, with the exception argued at the arm"
  - "[S07.3] the snapshot (snapSide / snapAct / snapRec), taken in showAction, and endPendingEdit / restoreSelected"
  - "[S06.5] the incomplete-paint rule and App.render.editorStale — a defect found, not introduced"
  - "#act-edit-cancel, KNOWN_IDS entry and stub node in the same change"
  - "App.interactions.editorSnapshot — read-only, stringified, for the gate"
  - "gate rows 113, 113b, 113c, 113d; interaction gate 196 -> 200; suite 1253 -> 1261"
  - "browser cells 24, 24b, 24c; 230 -> 242"
  - "deferred-items 12"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "a snapshot that is a held reference to a deep-frozen record, so the freeze IS the copy"
    - "an op that takes a RECORD, with the key-by-key rule kept one layer down instead of given up"
    - "a press that ends a half-made edit through the same revert Escape uses, so no new guard is needed"
    - "a paint that skipped a field records no fingerprint, and a press that discards one says so"
    - "a geometry claim held only by a browser cell, probed by a change the node gate is green over"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D34-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/deferred-items.md
    - .planning/STATE.md

key-decisions:
  - "CANCEL IS A REVERT AND THAT IS WHY THERE IS AN OP RATHER THAN A FLAG. This file commits every edit live through one funnel — that is what keeps the board updating as a rule is written and what keeps Ctrl+Z uniform — so a draft mode would have needed a second uncommitted copy of a rule the board was not drawing, and the artifact would have grown its first state in which an action exists in two versions. The proposal pane's shell comment argues exactly that case about a proposal and the argument transfers whole. So the surface snapshots and the op restores, and the restore is ONE commit because resetFight's own paragraph already measured what the naive spelling costs: one undo entry per write, and a student who mis-pressed pressing Ctrl+Z once per edit and landing on a half-restored rule in between. PROBE A split the one commit into four and reddened 113, 113c and two [S09.10] rows at once."
  - "THE SNAPSHOT IS A HELD REFERENCE TO A DEEP-FROZEN RECORD, AND THE FREEZE IS WHAT MAKES A PLAIN VARIABLE ENOUGH. All four homes were measured against the four sentences the proposal pane's shell comment already wrote: a `ui` key reddens [S09.3]'s key-set row and check 73c, and setUi refuses an object value by contract; a fourth slice reddens the row saying there are three; the build slice reddens nothing and is still wrong, because the build slice is the student's allocation and a snapshot has not happened to the board; the dialog's own dataset is the near miss and fails on TYPE — data-ed-side and data-ed-pick are strings, this is a record, so it would have to be stringified in and JSON.parsed back out, and that parse is a page-supplied string flowing into an op. It lives in [S07.3]'s own scope. What makes that enough rather than merely convenient is [S03]: the live state is deep-frozen between commits and commit() mutates a DETACHED copy, so the record object read out of state can never change afterwards. Holding the reference IS the snapshot — nothing is copied and nothing has to be kept in step. NO KEY SET MOVED IN EITHER DIRECTION, which is the claim, and PROBE C proved it from the failing side: putting the snapshot in the build slice reddened 73c, 113d and THREE codec-and-mirror rows, because a snapshot in a slice really does reach every shared link."
  - "THE HALF-MADE EDIT IS THE HARD PART AND IT IS SOLVED WITH THE REVERT ESCAPE ALREADY USES. Every control in this dialog acts on pointerdown, which the spec puts AHEAD of the focus change, so a student typing into a field and pressing this button reaches the handler with the field still focused and still holding uncommitted text. Left alone, the restore lands and THEN the focusout runs commitAmount, which sees the typed text against the old baseline and dispatches the very edit the press exists to throw away — the cancel appears to work and silently undoes itself one event later with a second undo entry behind it, which is check 67e's mechanism arriving from the other direction. The pending text goes back through revertAmount / revertActionName first, which makes that focusout a no-op by the value-versus-`was` test those two functions already carry. NO NEW GUARD WAS WRITTEN. The field is then BLURRED, because the repaint may never write a focused field (D-19) and this is the one press in the file for which overwriting a focused field is the CONTENT of the request rather than a violation of it — so the honest spelling is to take the focus off and let the ordinary repaint do its ordinary job. Focus is then placed on the button, never left on the body: a modal whose active element is the body has lost the keyboard."
  - "A PAINT THAT SKIPPED A FOCUSED FIELD USED TO RECORD A FINGERPRINT SAYING THE SURFACE MATCHED STATE, AND THAT IS A DEFECT THIS SURFACE HAS CARRIED SINCE PLAN 03.1-05. D-34 is how it was FOUND, not what caused it: a restore puts a record BACK, so it is the one press that can land on exactly the fingerprint an incomplete paint left behind, every time rather than by luck. Two halves, both shipped. editor() now records NO fingerprint when it skipped the name field or an amount field, so the next frame after the blur repaints unconditionally; and App.render.editorStale is the same statement made by a press that threw a field's pending text away, exported as a named function rather than left as an attribute write from [S07.3], because data-ed-sig is [S06]'s bookkeeping and its banner says so. PROBE D removed the call and PROBE E reverted the rule; each reddened 113c alone. The cost is one full repaint per commit while a field holds focus, and that is all of it — frames are raised by invalidate() and nothing ticks, so a student typing with nothing else happening raises no frames to pay for. WHAT IS NOT CLOSED, said plainly: if nothing ever commits again after the blur, no frame is raised and the field stays stale. That needs a focusout that invalidates, it is a change to a shipped contract two plans own, and it is not this instruction."
  - "THE OP TAKES A RECORD, WHICH IS THE ONE PAYLOAD SHAPE THE ROUTER CANNOT PROTECT BY NAMING KEYS — SO THE PROTECTION MOVED ONE LAYER DOWN RATHER THAN BEING GIVEN UP. Every other arm in dispatch names its keys because an op's guards refuse a stray key's VALUE and never see a key nobody meant to send. This one cannot: what it is handed is a whole action record and the keys inside it are the thing being restored. restoreAction therefore rebuilds that record FIELD BY FIELD through requireActionName, requireTokenId, requireXfWho and int() at the same named bounds, so nothing a caller supplied is ever copied across. AND THE STANDARD IS EQUALITY WITH THE WRITE PATH, NOT STRICTNESS: two values started in the refusal table and came out of it measured — a cost of zero and a change past the bound are CLAMPED, because int() compares and clamps and refuses only what is not a whole number. That is what setActionCost and setActionXf do with the same values from a keystroke, and a restore that refused them would refuse records the write path had itself produced, leaving a student unable to put back a rule they had written. The row asserts the clamp against both paths and the two named constants."
  - "THE FOOTER GEOMETRY IS A BROWSER'S CLAIM AND ONLY A BROWSER CELL HOLDS IT. .ae-foot is a `justify-content:flex-end` flex row with NO wrap, and it is STICKY since D-33 P1-3, so a third control in it either fits on the line or takes Done sideways with it — and the node gate has no layout engine to see either. PROBE H put Done before the cancel in the markup: node ran 1261/0, 200 of 200, exit 0, and cell 24 reddened in all four columns. PROBE G and PROBE G2b went further and found something the cell was not written for: an over-wide footer overflows the author pane, `.ae` carries overflow:hidden, and a CHOOSER PILL IN THE TERMS REGION STOPS BEING PRESSABLE — the browser run died on a thirty-second timeout inside cell 23b and never reached cell 24, over a node run that was 1261/0 and 200 of 200. A broken footer breaks the whole dialog. That failure MODE is deferred-items 12."

requirements-completed: []

duration: 175min
completed: 2026-08-30
---

# Phase 05 D-34: A Cancel Step On Modifying Actions Summary

**A student who has changed an action's name, its four cost terms, its four
requirements and its four transformations can now put all thirteen of those edits
back with one press, and that press is one commit and therefore one Ctrl+Z — so a
mis-pressed cancel is itself recoverable, which is what lets it ship with no
confirmation in front of it. The snapshot it restores is a held reference to the
deep-frozen record the state hands out, kept in the editor's own scope: no slice
key moved in either direction, and the build code encoded mid-edit carries the live
name and not the snapshotted one, driven rather than argued. Driving it found a
defect the action editor has carried since plan 03.1-05 — a repaint that skipped a
focused field recorded a fingerprint saying the surface matched state anyway, and a
restore is precisely the press that lands on that fingerprint.**

## The gate, before and after

| Reading | Before | After |
|---|---|---|
| `tests/selftest-node.cjs` | 1253 passed, 0 failed, exit 0 | **1261 passed, 0 failed, exit 0** |
| interaction gate | 196 of 196 | **200 of 200** (+113, +113b, +113c, +113d) |
| stub-drift | 135 shell ids | **136** (`act-edit-cancel`) |
| `DIALOG_FLOOR` | 138, harvest 172 | **138, harvest 172 — unmoved** |
| `FIGHT_FLOOR` | 132, harvest 586 | **132, harvest 586 — unmoved** |
| `PROPOSE_FLOOR` | 23, harvest 62 | **23, harvest 62 — unmoved** |
| `#app` Layer C | 131 | **131 — unmoved** |
| Layer B literals | 8,749 | 8,793 |
| `tests/browser-checks.mjs` | 230 passed, 0 failed | **242 passed, 0 failed** (+24, +24b, +24c × 4) |

**NO FLOOR MOVED, AND THE REASON IS WORTH STATING BECAUSE THE INSTRUCTION EXPECTED
ONE TO.** The new control's label is static markup. Layer A reads it in the
document and Layer B reads it among the string literals — both did, and both are
clean — but Layer C harvests what the RENDER fills into a hand-made stub page, and
a static label is never filled by anything. The dialog harvest reads 172 before and
172 after. The only pinned number that moved is the shell-id count, and it moved by
exactly one, with its `KNOWN_IDS` entry and its stub node in the same change.

## What was built

### The op — `[S05] restoreAction`

The fifth action write path, and the one that writes the other four at once. It
takes `(side, actionId, was)` where `was` is the record the editor snapshotted, and:

- **Every guard is the one the write path already runs, called and never re-typed.**
  `requireSide`, `requireActionId`, then `requireRecord` (an object, not an array,
  not null), then `requireActionName` on the name, then `restoredTerms` — which
  rebuilds all three lists term by term through `requireTokenId`, `requireXfWho`
  and `int()` at `MIN_ACTION_COST` / `MIN_ACTION_REQ` / `MAX_ALLOC` /
  `MIN_XF_DELTA` / `MAX_XF_DELTA`, carrying `setActionXf`'s own refusal of a change
  of nothing. All of it **outside** the commit, so a refusal leaves the board
  byte-identical with no phantom undo step.
- **`restoredTerms` is pure and is called TWICE on purpose** — once outside the
  commit so a refusal happens before anything is recorded, once inside the mutator
  so no object built out here is aliased into the next state. That is `writeTerms`'
  own rule about rebuilding inside the mutator, kept by a function that can be
  called rather than by a comment asking the next reader to be careful.
- **One commit under a label of its own**, `action restore {side}/{id}`. Nothing
  else in the file writes a label beginning `action restore`, so a cancel can never
  fold into the edit before it inside `COALESCE_MS`; the action is on the end so
  restoring two different rules inside half a second is two steps. A second cancel
  with nothing in between never reaches the commit at all — the no-op contract
  returns first — so the folding case that would have been wrong is unreachable.
- **A plain commit and not a structural one**, on `renameAction`'s stated rule:
  `commitStructural`'s trigger is a mutator that changes what `structure()` would
  BUILD, and this one cannot add or remove an action, a unit or a fight.
- **`dmg` and `keywords` are left exactly where they were found.** The
  DELIBERATELY ABSENT block is amended in the same change rather than annotated
  beside an op that contradicts it, because this is the first op in the file that
  writes a whole action record and therefore the first for which "just put the
  record back" would have meant assigning both.

### The router's one record-taking arm

Every arm in `dispatch` names its payload keys because an op's guards refuse a
stray key's VALUE and never see a key nobody meant to send. This arm cannot, and
the exception is argued at the arm rather than left to be noticed: what it forwards
is a whole action record, and the rule is kept one layer down by the field-by-field
rebuild above.

### The surface — `[S07.3]`

- `snapSide` / `snapAct` / `snapRec`, taken in **`showAction`** — the one place
  that says "the editor is now showing this action" — so opening the editor,
  pressing a list row, switching side, creating an action and removing one all
  re-snapshot without any of them having to remember to.
- A restore is **inert unless the side, the id and the record all still agree with
  the dialog.** That case is reachable and is named: `syncEditor` moves
  `data-ed-pick` itself when the selection names an action that has gone, without
  coming through `showAction`.
- `endPendingEdit` puts a focused name or amount field back through the revert
  Escape already uses and blurs it; `restoreSelected` calls it, tells the render
  tier the surface is stale if there was one, dispatches, and places focus on the
  button.
- `App.interactions.editorSnapshot` — read-only, and it hands back a **string**
  rather than the record so nothing can hold the reference and be right about it by
  identity.

### The control

```
#act-edit-cancel   data-act="restoreAction"   data-k="ae/restore"
"Put this action back how it was"
```

It carries `data-act` and a real op name because there is one behind it — that is
the partition this dialog is read by, and a cancel wearing `data-ae` would have
been a control that writes hiding in the channel for controls that do not.

**It does not say "Cancel".** UX-02's rule is a permanent visible label at the 18px
floor, and this file's wording rule everywhere else is that a control is named by
its effect: "New action", "Remove this action", "Start over". *Cancel* names a
MODE — it is the word for discarding a draft and leaving without saving — and there
is no draft here and nothing to leave, because every edit already landed. Measured
at **278px** in both browsers at both sizes.

**It is never disabled.** There is no enable pass for it in `[S06.5]` and there must
not be one. When there is nothing to put back the press is inert, which is a
different thing from being greyed out for a state a student cannot see the shape of.

**Escape is untouched.** It still reverts the field a student is standing in and
then closes the dialog; `[S07.3]`'s `cancel` listener still owns it.

## The defect this found

`[S06.5]`'s repaint is signature-keyed: it computes a fingerprint from state and
returns early when it has not moved. D-19 says the repaint may never write a field
that holds focus, and the two arms obeyed it. **What nothing noticed was that such
a paint is INCOMPLETE** — it drew every other node from state, left one field
holding whatever the student typed, and then recorded a fingerprint saying "this
surface now matches this state". The only thing that can ever put that field right
is a later repaint, and the gate returns early whenever the fingerprint has not
moved.

A restore is the press that lands on exactly that fingerprint, because a restore
puts a record BACK. Both halves are now shipped:

- **`editor()` records no fingerprint when it skipped a field.** `showAmount`
  reports whether it wrote, `fillSlotRows` and `fillTerms` combine the answers
  without short-cutting (a short-cut would leave two of three lists unpainted
  because a student was standing in the first), and `data-ed-sig` is written as the
  empty string, which can never equal a fingerprint.
- **`App.render.editorStale`** is the same statement made from outside, for a press
  that throws a field's pending text away. It is a named function owned by
  `[S06.5]` rather than an attribute write from `[S07.3]`, because those three
  attributes are that region's bookkeeping and its own banner says so.

**What is not closed, said plainly rather than left to be discovered.** If nothing
ever commits again after the blur, no frame is raised and the field stays stale.
Closing that needs a `focusout` that invalidates, which is a change to a shipped
contract two plans own, and it is not the instruction this plan was given.

## Seven probes, against committed snapshots

Every probe was applied to a file copied to a scratchpad directory before the run
and restored by copying it back. **No `git checkout --`, no `git stash`, no `git
clean`.** The tree was verified clean against the commit afterwards.

| Probe | Change | Node gate | Browser | What it proves |
|---|---|---|---|---|
| **A** | the restore split into four commits — the naive spelling `resetFight` warns about | **1259/2, 198 of 200** — 113, 113c and two `[S09.10]` rows red | — | the one-commit claim is held by four rows in two suites |
| **B** | the no-op contract deleted | **1260/1, 199 of 200** — 113b and one `[S09.10]` row red | — | inert really is asserted, not assumed |
| **C** | the snapshot written into the build slice | **1261/0 in the artifact's own suite**, gate **195 of 200** — 73c, 113d and rows **75, 76 and 78** red | — | a snapshot in a slice reaches the codec AND the address bar. The artifact's suite staying green is 73c's own recorded note: it runs before this surface is ever pressed |
| **D** | `App.render.editorStale` call removed | **199 of 200** — 113c red | — | the memo really would have swallowed the repaint |
| **E** | the incomplete-paint rule reverted to `= sig` | **199 of 200** — 113c red | — | the other half of the same rule |
| **F** | the snapshot taken once on open instead of in `showAction` | **199 of 200** — 113d red | — | every clause of 113 passes; only the selection switch can tell |
| **G / G2b** | a 120-character label; then `min-width:900px` on the control | **1261/0, 200 of 200, exit 0 — completely blind** | **THREW** at 30s inside cell 23b | an over-wide footer overflows the pane and a chooser pill in the terms region stops being pressable. **A broken footer breaks the whole dialog** |
| **H** | Done put before the cancel in the markup | **1261/0, 200 of 200, exit 0** | **cell 24 red in all four columns** | the geometry claim is a browser's and only a browser cell holds it |

## The pictures

The footer was screenshotted at **1920x1080** and **1366x768** in real Chrome and
real Edge, because seventeen consecutive rendered changes in this phase had a
defect only a picture showed. Three controls, one line, 82px, in the order
`Proposal | Put this action back how it was | Done`, with Done last and nothing
wrapped or pushed off at either size. The screenshots go to a directory **outside
the repository** by default (`SHOT_DIR`, falling back to the OS temp directory) —
this file is dev-only and must not start producing committed binaries.

## The rows turned in the open

- **`[S09.10]`'s two applier rows, RE-READ AND NOT WIDENED.** D-34 put a new op on
  the export list they filter, which is exactly the event a stale allowlist
  survives by being lucky. `restoreAction` matches neither family, both lists were
  read back after it joined, and both still answer the single name `advanceRound`.
  Nothing was added to either family to make that true, and the paragraph says so.
- **`[S09.10]`'s slice-placement row**, amended to record that a second thing went
  through the same door and was weighed against the same four sentences.
- **`[S05]`'s DELIBERATELY ABSENT block, fourth kind**, amended: the absence was
  tested by the first op that writes a whole action record, and it held.
- **`[S06.5]`'s `data-ed-sig` paragraph**, which used to say "whether anything drawn
  here has moved since the last frame" and now says **complete** frame.
- **The `#act-edit` footer's shell comment**, which named two controls and their
  order and now names three, with the wording ruling and the never-disable ruling
  written at the site.

## Deferred

**Item 12 — the browser cells die on a timeout rather than failing a row.** PROBE G
found it: every `pg.click` in `tests/browser-checks.mjs` throws after thirty
seconds, so the run names the first control that became unpressable, never the
change that made it so, and every cell after it goes unreported. The shape of the
fix is a wrapper that turns a timeout into `ok(..., false, ...)`. Owner: whichever
pass next adds browser cells. The shipped run is green in all four columns.

## Files

- `cats-vs-mechs.html` — `[S05]` `requireRecord` / `restoredTerms` / `restoreAction`,
  the router arm, the export, the amended absence block; `[S06.5]` the
  incomplete-paint rule and `editorStale`; `[S07.3]` the snapshot, `endPendingEdit`,
  `restoreSelected`, the press arm and `editorSnapshot`; the shell control and its
  comment; `[S09.10]`'s D-34 rows and its two turned paragraphs.
- `tests/selftest-node.cjs` — `KNOWN_IDS` + the stub node, checks 113 / 113b / 113c
  / 113d.
- `tests/browser-checks.mjs` — cells 24 / 24b / 24c and the footer screenshot.
- `.planning/phases/05-fight-loop-playtest/deferred-items.md` — item 12.

## Self-Check: PASSED
