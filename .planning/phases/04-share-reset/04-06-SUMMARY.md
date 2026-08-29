---
phase: 04-share-reset
plan: 06
subsystem: ui-interaction
tags: [dialog, share, clipboard, tiered-fallback, error-boundary, single-file-html, selftest, D-18, SHARE-01]

# Dependency graph
requires:
  - phase: 04-share-reset
    plan: 05
    provides: "<dialog id='share'> and <dialog id='reset-ask'>, [S06.6]'s repaint, the two topbar openers, [C13], and the openDialogs finding"
  - phase: 04-share-reset
    plan: 04
    provides: "the mirror, the boot read, and the note that encode must be called BEFORE any await"
  - phase: 04-share-reset
    plan: 02
    provides: "[S04.2] encode — synchronous, refusing with null"
  - phase: 03.1-action-authoring-inserted
    plan: 05
    provides: "[S07.3] — the attaches-rather-than-edits shape, bindEditor's eight wrapped listeners, the focus hand-back"
provides:
  - "[S07.4] INTERACTIONS — SHARE AND CONFIRM: two acts pushed into UI_ACTS, two handlers assigned, two binders pushed into LATE_BINDERS, ten listeners across two roots"
  - "the three-tier copy press — the code produced synchronously inside the gesture, the selection always, and a line that names the tier that actually fired"
  - "data-sh-tier on #share-said — which tier the artifact believes it took, readable by a check and by a rehearsal and by no student"
  - "tests/selftest-node.cjs — checks 90 to 90f, DIALOG_ROOTS' two openers, limitations entry 12 extended to four roots and new entry 16"
affects: [04-07 the load and reset presses, 04-08 the rehearsal]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "the file's ONE deliberate inversion of dispatch-first-then-page-work, stated in the code with the reason, because a later reader would otherwise read it as the rule forgotten"
    - "a tiered platform call whose line branches on the tier that ACTUALLY fired, with both arms of the promise handled so a permission refusal never reaches the styled panel"
    - "one producer for a string that reaches both a clipboard and a screen — the press asks [S06.6] for a repaint rather than calling encode a second time"
    - "a line that never outlives the press that wrote it: dropped on the next press, the next key, a pane move and the close, so it can never become a claim about a board that has since moved"
    - "a floor per ROOT rather than one covering both, because one floor is satisfied by either root alone"
    - "an act partition asserted in the GENERAL form — no name in UI_ACTS may be a function [S05] exports — rather than only by the two names this phase knows about"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "the copy press asks App.render.share for a repaint and reads #share-code.value rather than calling App.serialize.encode a second time: one producer, so the string that reaches the clipboard is the string the student can see and select, and a second encode would be a second mechanical reason for the two to disagree with no way for the student to tell which they had"
  - "tiers 1 and 2 say the SAME sentence and the tier is recorded on data-sh-tier instead: from the student's side both are the same fact, and naming which platform API wrote their clipboard would be jargon on a projector"
  - "no cancel listener on #reset-ask, written down as a decision rather than left as an absence: that surface has no field, Escape there means Cancel, and <dialog>'s default close is exactly that — a no-op listener bound to make four roots look alike would be dead code inside the error boundary"
  - "the said line is dropped on every keydown in the dialog, because this root's listener runs BEFORE [S08]'s document-level Ctrl+Z and that is the one moment a copy claim can be taken down ahead of the undo that would make it a claim about a different board"
  - "check 90b asserts the private-control counts rather than the act counts, because both dialogs carry ZERO acts inside them by 04-05's deliberate design — a row demanding non-zero acts would be demanding the surface be built differently"

patterns-established:
  - "a fourth probe run because a row's LABEL claimed more than its clauses proved: 90f read the field, which the per-frame hook keeps current on its own, so it would have gone green over a dead Copy button. The selection is the one thing on this surface only the press produces, and probe W proved the hardening bites"

requirements-completed: [SHARE-01]

# Metrics
duration: 80min
completed: 2026-08-29
---

# Phase 4 Plan 06: A Build Code on a Clipboard, and Nobody Lied About It — Summary

**The share surface opens, switches panes, closes and hands focus back — all of it attached through the four seams with not one line of `[S07.1]`, `[S07.2]` or `[S07.3]` moved — and one press produces the code synchronously inside the gesture, selects it in a field that works without any clipboard API at all, then tries two tiers on top and writes a line naming the one that actually fired.**

## Performance

- **Duration:** ~80 min
- **Tasks:** 3 planned, 4 commits (the fourth hardens a row a fourth probe caught passing vacuously)
- **Files modified:** 2

## Task Commits

| # | Task | Commit | Type |
|---|---|---|---|
| 1 | `[S07.4]` attached through the four seams | `9b09178` | feat |
| 2 | the copy — inside the gesture, three tiers, honest about which one worked | `8b5f80f` | feat |
| 3 | the checks that hold it, and an honest entry for the thing they cannot reach | `9743ab6` | test |
| 3+ | 90f asserts the press, not only the field (probe W) | `cc57811` | test |

## Measurements Recorded

| Reading | Before | After |
|---|---|---|
| Interaction gate | **135 of 135** | **141 of 141** (delta **+6**: checks 90, 90b, 90c, 90d, 90e, 90f) |
| In-file suite | 1049 passed / 0 failed | **1049 passed / 0 failed** — unchanged; this plan adds no `[S09]` row |
| `SUITE_FLOOR` | 1019 | **1019** — unchanged, margin still 30 |
| Stub-drift shell ids | 96 | **96** — unchanged in both directions; this plan renders no new id |
| Dialog harvest | 145 across 4 roots | **145** across **4** roots — unchanged |
| `DIALOG_FLOOR` | 138 | **138** — unchanged |
| `SHARE_FLOOR` | 0 | **0** — unchanged |
| Layer C `#app` | 127 | **127** — unchanged, the shipped board did not move |
| Layer C proposal pane | 60 | **60** — unchanged |
| Layer A words | 16 | **16** |
| Layer B string literals | 5,432 | **5,530** |
| Listeners on `#share` | — | **6**, floor **6** |
| Listeners on `#reset-ask` | — | **4**, floor **4** |
| Private controls on `#share` | — | **5** (`copy`, `to-load`, `done`, `load`, `to-copy`), floor 5 |
| Private controls on `#reset-ask` | — | **2** (`cancel`, `confirm`), floor 2 |
| `data-act` attributes INSIDE either dialog | — | **0** and **0** — by 04-05's design, see check 90b |
| perf gate | 7-8 ms / 100 commits | **7 ms** |
| `grep -ci "counter\|rating\|balanced\|difficulty"` | 0 | **0** |
| `grep -c "verdict\|balanced\|rating\|difficulty"` | 0 | **0** |
| `grep -c "https\?://\|url("` | 0 | **0** |
| `grep -c "Blob\|createObjectURL\|download"` | — | **0** |
| `grep -c "eval(\|new Function\|innerHTML\|insertAdjacentHTML\|document.write"` | 0 | **0** |
| `grep -c "<svg\|createElementNS"` | 0 | **0** |
| `grep -c 'style="'` | 0 | **0** |

### The diff, checked rather than promised

`git diff -U0 9b09178^..HEAD -- cats-vs-mechs.html` is **two hunks**:

```
@@ -1635 +1635,8 @@
@@ -11780,0 +11788,586 @@ App.interactions = (function () {
```

The second is a pure **insertion of 586 lines** immediately after `#endregion [S07.3]`. Region
boundaries as the file now stands: `[S06.6]` 9458-9662, `[S07.1]` 9728-10322, `[S07.2]`
10323-10815, `[S07.3]` 10855-11786, `[S07.4]` 11788-12372. **Not one line inside `[S07.1]`,
`[S07.2]`, `[S07.3]`, `[S05]` or `[S06.6]` changed.** The first hunk is the shell markup and is
deviation 1 below.

## The Ordering Inversion, and Where It Is Written Down

Every press in this file dispatches first and does page work after, so an op that refuses throws
into `[S08]`'s boundary and the page work never runs. The copy press inverts it, once, and the
inversion is written into `[S07.4]` under a boxed heading rather than left to be read as the rule
having been forgotten. Three things are said there:

1. **CLAUDE.md's HIGH-confidence finding.** `writeText` must be called inside the gesture handler
   from Chrome 107; an `await` between the press and the write forfeits it. So the code has to exist
   before anything asynchronous happens.
2. **There is nothing for the old ordering to protect.** This press dispatches nothing, commits
   nothing and leaves no undo entry. There is no op that could refuse.
3. **This is also why `CompressionStream` is not used anywhere in this phase, and the size
   measurement is not what decided it.** `CompressionStream` is asynchronous by construction, so a
   code produced through it could not exist at the moment the clipboard call has to be made. The
   35-versus-1554 measurement made the compact codec the better choice; the gesture rule made it the
   only one.

### The gesture window, read top to bottom and recorded

`grep -c "await \|async "` over the artifact reads **1**, and the single hit is **the word "await"
inside that comment**. There is no `await` keyword and no `async` function anywhere in the file. The
window between the press and the clipboard call, with comments stripped:

```js
  function pressCopy() {
    App.render.share(App.state.get());
    var field = codeField();
    if (field === null) { return; }
    var code = String(field.value || '');
    if (code === '') { return; }
    if (typeof field.focus === 'function') { field.focus(); }
    if (typeof field.select === 'function') { field.select(); }
    say('select', SAID_SELECT);
```

Every line synchronous. `api.writeText(code)` is the next statement after the two `typeof` guards.
**No await and no promise resolution sits between the press and the clipboard call.**

## The Tier-3 Line, Verbatim

```
Select-all is done — press Ctrl+C.
```

`data-sh-tier` reads `"select"`. The other sentence, for tiers 1 and 2:

```
Copied to the clipboard.
```

The plan's approved-copy list spelled the first without a trailing full stop; it ships with one, to
match the other sentence and the register of every other line on this surface. Both are clean
against Layers A, B and C.

**Tiers 1 and 2 say the same sentence on purpose.** From the student's side they are the same fact —
the code is on their clipboard — and naming which platform API put it there would be jargon on a
projector. **Which** tier fired is recorded on `data-sh-tier` (`clipboard` / `command` / `select`),
where check 90e and plan 04-08's rehearsal can read it and no student has to.

## The Second `fire()` Payload-Key Exception: NOT NEEDED

The file still has **exactly one** recorded exception to attaching-rather-than-editing, and it is
still plan 02.1-03's `tokenId`. `[S07.1]` is byte-identical.

The reason is 04-05's decision working exactly as it was meant to: every control **inside** both
dialogs carries a private `data-sh` or `data-rs` that `[S07.4]`'s own delegated listener reads off
the pressed control, and only the two **topbar** openers carry a `data-act` at all — neither of
which carries a payload of any kind. This is 03.1-05's technique applied a second time, and it is
now the shipped answer twice rather than once.

## The Act Partition, and What It Actually Asserts

The plan's acceptance asked that the act counts collected off each dialog be non-zero. **They are
zero, and that is 04-05's deliberate design rather than a defect** — deviation 4 of that plan records
it: every control inside both dialogs carries a private attribute precisely so no second exception
in `[S07.1]` would be needed. A row demanding non-zero acts there would be demanding the surface be
built differently.

So check 90b floors what those dialogs *do* carry — 5 private controls on `#share`, 2 on
`#reset-ask` — and asserts the half the row exists for **in the general form**:

- every `data-act` collected off the page (the two openers) is in the live `UI_ACTS` **and** the live
  `UI_HANDLED`;
- **no name in `UI_ACTS` is a function `[S05]` exports.** That is what "a state op parked in
  `UI_ACTS` to make a refusal go away" *is*, stated so it catches the move for any op rather than for
  the two this phase happens to know about;
- `loadBuildCode` and `resetToDefaults` are named: still ops, still absent from `UI_ACTS`.

**Neither of plan 04-07's two state acts appears in `UI_ACTS`.** The live reading:

```
["openTokenPicker","selectTokenType","openActionEditor","selectAction","selectActionSide","openShare","openResetAsk"]
```

## Deliberate-Failure Probes

All four were run against **committed** state, their readings recorded verbatim, and every probe
reverted **from a file snapshot** — never by `git checkout`. Working tree verified clean after each.

### PROBE T — one listener on a new root bound raw

`dlg.addEventListener('pointerdown', onSharePress);` in place of the wrapped binding. Run: **1049
passed / 0 failed; interaction gate 140 of 141.** Exactly one row moved, and it names the handler by
**name and by arity**:

```
FAIL  interaction gate :: 90c. every listener bound on BOTH of plan 04-05's roots went through
App.boot.wrap. One bound raw would throw past the boundary and leave the surface dead with nothing on
screen to say so — and on the share surface that means a student pressing Copy, seeing nothing happen,
and pasting whatever was on their clipboard already. Two roots and two floors, because a root carrying
no listeners passes a per-listener test spotlessly
      listeners on #share=6 (floor 6) on #reset-ask=4 (floor 4) | bound outside the boundary:
      #share=pointerdown -> onSharePress/1 #reset-ask=none
```

### PROBE U — the copy line made optimistic

`say('select', SAID_COPIED)` in place of `say('select', SAID_SELECT)` — always the "Copied" wording,
regardless of tier. Run: **1049 passed / 0 failed; interaction gate 140 of 141.**

**PROBE U STAYED RED. Nothing had to be fixed and nothing was wrong with the check.** The detail line
is worth keeping because it shows the two halves disagreeing rather than one standing for both — what
was SAID against what was DONE:

```
FAIL  interaction gate :: 90e. a real Copy press in a sandbox with NO clipboard API and NO copy
command does not throw, leaves the code field focused with the whole of the code selected, and says the
select-all line rather than a "Copied". The line naming the tier that actually fired is the whole of
this row: an optimistic one sends a student to the course thread with stale text on their clipboard,
and tier 3 is the only tier this repo can ever drive
      threw=null panel hidden=true | said="Copied to the clipboard." tier="select" hidden=false |
      focused=true selection=0..45 of 45
```

### PROBE V — a state act parked in `UI_ACTS`

`UI_ACTS.push('openShare', 'openResetAsk', 'resetToDefaults')`. Run: **1049 passed / 0 failed;
interaction gate 140 of 141.** One row, named in both readings:

```
FAIL  interaction gate :: 90b. every act these two surfaces dispatch is a UI-only act the LIVE
registration handles, and NO act in UI_ACTS is a function [S05] exports — collected off the page rather
than re-typed here. …
      acts inside #share=[] inside #reset-ask=[] | private controls #share=["copy","to-load","done",
      "load","to-copy"] #reset-ask=["cancel","confirm"] | UI-only=["openShare","openResetAsk"]
      claimed but unhandled=[] state acts [S05] does not export=[] | UI_ACTS entries that ARE
      ops=["resetToDefaults"] | 04-07's ops parked in UI_ACTS=["resetToDefaults"] missing from [S05]=[]
```

### PROBE W — a dead Copy button, run because a row's LABEL claimed more than its clauses proved

Not asked for by the plan. Check 90f's label says "the code the press put under the selection", and
every clause it originally carried read the **field** — which `[S06.6]`'s per-frame hook keeps current
on its own, pressed or not. `pressCopy` was made to return immediately. Run: **1049 passed / 0 failed;
interaction gate 139 of 141.** With the hardening in place **both** rows move, and 90f's reading is the
finding:

```
FAIL  interaction gate :: 90e. …
      threw=null panel hidden=true | said="" tier="" hidden=true | focused=false selection=0..109 of 45
```
```
FAIL  interaction gate :: 90f. the code the press put under the selection is the code for the board that
is on screen, driven after a REAL op with the surface already open. It decodes, and what it decodes to
re-encodes to the same string — so the trip is closed from the press side as well as from the repaint side
      field===live encode=true decode ok=true why=null round trip=true length=45 selection=0..109
```

**Read the detail line.** `field===live encode=true`, `decode ok=true`, `round trip=true` — every
clause 90f carried before the hardening is still spotlessly green over a Copy button that does
nothing at all. Only the selection clause moved. That row would have shipped asserting nothing about
the press, under a label saying it did. Commit `cc57811` adds the two clauses and the reason beside
them: **the selection is the one thing on this surface that only the press produces.**

## The New Limitations Entry, Verbatim

Entry 12 gained a paragraph naming all four roots and the way the two new ones divide — `#share`
binds a cancel listener with a real job, `#reset-ask` deliberately binds none. And a new entry:

```
16. THE CLIPBOARD, which is a FOURTH KIND of unreachable and is worth
    saying plainly rather than folding into entry 5. The other three
    kinds are a thing not yet rendered, a thing with no layout engine to
    measure it, and a thing only a person can see. This one is none of
    those: `navigator` does not exist in this runtime at all, and
    `document.execCommand` is not on the stub page, so tiers 1 and 2 of
    [S07.4]'s copy press are never executed here — not in any browser,
    not under any flag, not once.
    WHAT THAT COSTS, stated rather than softened. Row 90e drives a real
    Copy press and asserts the tier-3 branch, which is the tier SHARE-01
    names in as many words and the only one a bare sandbox can reach. So
    the branch is proved to EXIST and proved to be taken when nothing
    better is available. What is NOT proved is that the other two arms
    ever fire, that they fire in the right order, that the promise's
    resolve arm upgrades the line, that its reject arm falls through to
    the copy command, or that a refusal stays out of the styled error
    panel. Those are LOW confidence here and are stated as such.
    All of it is plan 04-08's rehearsal, items 1 through 6, by number:
    tier 1 in Chrome with the window focused; tier 1 in Edge, because
    Firefox could not be launched in the environment that measured any
    of this and CLAUDE.md's Firefox gap stands; a copy with DevTools
    focused; a copy with the window backgrounded; a forced tier 3 with
    the clipboard API deliberately blocked; and, in each of those five,
    whether the line the student reads genuinely names the tier that
    succeeded.
```

## Deviations from Plan

### 1. [Rule 1 — a legend that said one thing while its act did another] `#sh-load-back`

**Found during:** Task 1, wiring the pane switch.

**Issue:** the load pane's second button has id `sh-load-back` and act `data-sh="to-copy"` — it
returns to the copy pane — and its legend read **`Done`**, which a student reads as "end the visit".
Nothing pressed it until this plan wired `to-copy`, so the wrong word had never been reachable
before; this is the change that made it reachable and therefore the change that had to fix it.

**Fix:** the legend now reads `Back to your code`, with the reasoning in a markup comment beside it
naming `#share-done` on the other pane as the one control that ends the visit.

**Files modified:** `cats-vs-mechs.html` (the shell markup, hunk 1 of 2).
**Commit:** `9b09178`.

### 2. [judgement — a plan instruction weighed against what the surface actually is] No `cancel` listener on `#reset-ask`

The plan asked for a `cancel` listener on **each** root. `#share` has one and it does real work:
Escape inside the paste field must put the recorded text back and leave the surface open.
`#reset-ask` **has none**, and the decision is written into `bindResetAsk` at length rather than left
as an absence. It has no field, so there is nothing for Escape to put back; Escape on a confirmation
means Cancel, which is exactly `<dialog>`'s own default close; and that default fires the close
listener, which hands focus back. A listener bound there could only re-implement the default or —
worse — decline a student's Escape out of a destructive confirmation. **A no-op listener bound to make
four roots look alike would be dead code inside the error boundary**, which is a worse thing to hand
the next reader than the paragraph explaining why it is not there. The harness's limitations entry 12
records what this leaves unrehearsed for that root.

### 3. [Rule 2 — a claim that could outlive the board it was about] The said line is dropped on every press, key, pane move and close

Not asked for by the plan. `#share` is modal, so with it open the **only** way the board can move is
the Ctrl+Z shortcut `[S08]` binds on `document`. A "Copied to the clipboard." standing on screen
after an undo is the same failure as a stale code on the field, one node down: the student reads it as
a statement about the code they are looking at **now**.

This root's listener runs **before** the document one, because the dialog is where the event starts
and document is where it ends up — so dropping the line on every keydown closes that window rather
than narrowing it. The line is also dropped at the top of every press, on a pane move and on the
close. `[S06.6]` could not be asked to do this: it is 04-05's region and this plan's ownership
forbids editing a line of it, and `SYNC_HOOKS` is not reachable from `[S07]`.

The asynchronous arms carry the same rule from the other end: the resolve arm writes "Copied" **only
if the field still holds the code that was copied**, and the reject arm drops the line entirely if the
board or the student has moved on. A copy that really happened, reported beside a code that is no
longer the one on screen, would be the stale claim this whole surface exists to prevent.

### 4. [naming — a function name that tripped the no-comparison scan] `closeResetAsk` → `closeConfirm`

`closeResetAsk` contains the letters `l-o-s-e-R` and the document-wide Layer A scan reddened on it
twice, by line, before any check ran:

```
  The artifact reports what a build costs and what it can take.
  It never says which build is the better one. Reword or remove:
  line 11918 [loser]: loseR
  line 11983 [loser]: loseR
```

Renamed. Recorded because it is the fifth time in this project a banned substring has been found
inside a word nobody would have looked at, and the scan found it in under a second.

### 5. [Rule 2 — a row whose label claimed more than its clauses proved] Check 90f hardened

See **PROBE W** above. Two clauses added, and a comment naming the reason. Commit `cc57811`.

## Threat Register

| Threat | Mitigation as built | Proved by |
|---|---|---|
| T-04-26 an optimistic line claiming a copy that did not happen | the line is written by `say(tier, words)` and every call site names the tier that actually fired; the tier-3 sentence is written synchronously and only replaced when a promise **resolves**; both async arms re-check the field before saying anything | **PROBE U** — the one clipboard row CI can reach reddens on the wording alone, with `said` and `tier` disagreeing in the reading |
| T-04-27 a listener bound outside the boundary leaving the surface dead and silent | all ten listeners across both roots go through `App.boot.wrap`; check 90c reads the registrations back structurally, by name **and** arity, floored **per root** | **PROBE T** — `#share=pointerdown -> onSharePress/1` |
| T-04-28 an unhandled clipboard rejection raising the styled panel over a permission decision | both arms of `writeText`'s promise are handled inside the press; the synchronous-throw case is caught too and falls through to tier 2 | the driven press leaves `errPanel.hidden === true` and `errTitle.textContent === ''` in check 90e; `[S08]`'s `unhandledrejection` net is never reached |
| T-04-29 a state op parked in `UI_ACTS` so a refusal stops being raised | the partition is collected off the page and asserted in the general form — **no** name in `UI_ACTS` may be a function `[S05]` exports — plus the two 04-07 will add, by name | **PROBE V** — `UI_ACTS entries that ARE ops=["resetToDefaults"]` |
| T-04-30 the address bar offered as the share unit, leaking a home-directory path | no control in `[S07.4]` reads or presents `location`; the prohibition is restated in the region's own comment with `[S04.4]`'s three reasons | `grep -c "https\?://\|url("` reads **0** |
| T-04-SC npm/pip/cargo installs | accept | zero packages installed by this phase |

**D-18 held by grep, not by intention:** `grep -c "Blob\|createObjectURL\|download"` reads **0**. The
refusal is written into `[S07.4]`'s banner — considered, declined, by which decision, and what shipped
instead — so the next reader does not add it as an obvious omission.

## Known Stubs

Two, both **reserved by this plan for plan 04-07**, and neither preventing this plan's goal:

| Node | Reason | Resolved by |
|---|---|---|
| `data-sh="load"` | no arm in `onSharePress`. Loading a pasted code writes state, so it is a real op reached through `App.ops.dispatch` — parking it in `UI_ACTS` to get it working one plan early is exactly the move check 90b exists to catch. The absence is written into the listener as a comment rather than left blank | plan 04-07 |
| `data-rs="confirm"` | no arm in `onResetPress`, for the same reason. `Cancel` **is** wired, because declining is page work and a confirmation a student cannot back out of would be worse than no confirmation | plan 04-07 |

`#sh-load-said` remains empty and hidden — the refusal wording is 04-07's, as 04-05 recorded.

## Threat Flags

None. No new network endpoint, no auth path, no file access pattern, no schema change. The one
genuinely new surface is **a call to a platform API with a permission model**, which is registered
above as T-04-28 and is the reason `[S07.4]`'s banner says the clipboard write has no home in either
act list.

## For the Next Plans

- **04-07 (the load press and the reset).** `data-sh="load"` and `data-rs="confirm"` are the two
  arms to add, both in the delegated listeners `[S07.4]` already binds, both reading what they need
  off the pressed control. `App.ops.loadBuildCode(code)` **returns** `{ ok, why, saw?, what? }`
  rather than throwing; `#sh-load-said` is the node and `.sh-said` plus its `[hidden]` rule are
  already in `[C13]`. `dropSaid()` is `#share-said`'s and only `#share-said`'s — the load pane's
  line is a separate node with separate words. Check 90b will redden the moment either op is named
  in `UI_ACTS`, and that is deliberate: both are state work and both must be dispatched.
- **04-08 (the rehearsal).** Six clipboard items land here and are numbered in the harness's own
  limitations entry 16 rather than only in a plan: tier 1 in Chrome with the window focused; tier 1
  in Edge; a copy with DevTools focused; a copy with the window backgrounded; a forced tier 3 with
  the clipboard API blocked; and whether the line names the tier that succeeded in each case.
  `data-sh-tier` on `#share-said` is what makes the last of those readable rather than a matter of
  interpretation. Two more items join from entry 12: Escape in the paste field reverting the field
  and leaving `#share` open, and Escape on `#reset-ask` closing it with focus handed back.
- The interaction gate is **141**; `SUITE_FLOOR` is **1019** against a measured **1049**; the next
  free check number is **91**; shell ids are **96**; `DIALOG_FLOOR` is **138** against **145**.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND
- `tests/selftest-node.cjs` — FOUND
- `.planning/phases/04-share-reset/04-06-SUMMARY.md` — FOUND
- commit `9b09178` — FOUND
- commit `8b5f80f` — FOUND
- commit `9743ab6` — FOUND
- commit `cc57811` — FOUND
- `node tests/selftest-node.cjs` exits 0 at 1049 passed / 0 failed — VERIFIED
- interaction gate 141 of 141 — VERIFIED
- stub-drift 96 in both directions; `#app` 127, dialogs 145 across 4 roots, proposal 60 — VERIFIED
- all seven greps print 0 — VERIFIED
- `git diff` over `cats-vs-mechs.html`: two hunks, the second a pure insertion after
  `#endregion [S07.3]`; zero changed lines inside `[S07.1]`, `[S07.2]`, `[S07.3]`, `[S05]`,
  `[S06.6]` — VERIFIED
- working tree clean after every probe revert — VERIFIED
