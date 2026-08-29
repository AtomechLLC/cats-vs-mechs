---
phase: 04-share-reset
plan: 05
subsystem: ui-surface
tags: [dialog, share, reset-confirmation, repaint, fingerprint, single-file-html, selftest, D-19, D-21]

# Dependency graph
requires:
  - phase: 04-share-reset
    plan: 02
    provides: "[S04.2] encode — the build slice to a code string, synchronous, refusing with null"
  - phase: 04-share-reset
    plan: 03
    provides: "[S04.3] decode and its four refusal tokens — what the load pane's message will carry"
  - phase: 04-share-reset
    plan: 04
    provides: "the mirror, the boot read, and the note that encode must be called BEFORE any await"
  - phase: 03.1-action-authoring-inserted
    plan: 05
    provides: "[S06.5] and #act-edit — the two-pane dialog, the signature gate, the focus contract"
provides:
  - "<dialog id='share'> — one dialog, two panes (D-21), a static code field and a static paste field"
  - "<dialog id='reset-ask'> — its own root, carrying the full D-19 argument in the file"
  - "[S06.6] the share surface's repaint — whole-build fingerprint, code produced at render time and stored nowhere"
  - "[C13] SHARE AND CONFIRM — two new prefixes, .sh- and .rs-, plus .brd-btn--danger"
  - "two topbar controls in D-04's reserved slot, the reset one visually apart inside the cluster"
  - "tests/selftest-node.cjs — 23 KNOWN_IDS, two dialog stubs, two DIALOG_ROOTS entries, SHARE_FLOOR, checks 83-89"
affects: [04-06 the handlers and the copy path, 04-07 the refusal message, 04-08 the rehearsal]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "a field the repaint OVERWRITES while it holds focus, which is the first inversion of D-19 in this file — because the text in it is the artifact's, not the student's, and the failure runs the other way"
    - "a selection re-applied over the WHOLE of a replaced string rather than over the old offsets, because the old offsets name nothing in the new one"
    - "a DIALOG_ROOTS entry carrying act: null, with the reason written down, for a surface whose opener a later plan owns"
    - "a floor whose smallness is a fact about the surface rather than a weak gate, said out loud beside the number"
    - "openDialogs asks for a frame rather than hoping one is due — an opener paints and schedules, showModal does neither"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "TWO dialogs, not one and not three: D-21's share-and-load pair stays one dialog with two panes, and the reset confirmation takes its own root because it is a different act with a different opener that Phase 5 will want on the topbar"
  - "the code field is rewritten even while focused and its selection re-applied; the paste field is never written — opposite answers to D-19 on one surface, both written into the code with their reasons"
  - "the fingerprint is JSON.stringify of the whole build slice, not of the produced code: measured 0.030 ms against 0.483 ms on BOARD E, and the failure mode of the cheaper one is a wasted encode while the failure mode of a narrower one is a stale code in somebody's message"
  - "the two new topbar controls carry data-act (page work, claimed by [S07.4]); every control INSIDE both dialogs carries a private data-sh or data-rs, which is #act-prop-open's idiom and avoids a second recorded exception in [S07.1]"
  - "SHARE-01 and SHARE-06 are NOT marked complete: this plan ships the surface they are operated through, and the clipboard write (04-06) and the reset wiring (04-07) are what satisfies them"

patterns-established:
  - "a probe's result recorded beside the row it was run for, INCLUDING the part that went against the expectation — probe S reddened three rows rather than one, and which of the three is actually about the fingerprint is now written down"
  - "a surface whose copy is static markup harvests almost nothing in Layer C and that is stated at the floor, so the next reader does not read a small number as a typo"

requirements-completed: []

# Metrics
duration: 95min
completed: 2026-08-28
---

# Phase 4 Plan 05: The Surface, Built So Its Code Cannot Go Stale — Summary

**Two dialogs arrived complete — markup, ids, stub nodes, harvest entries and styles in one change — and the build code on the copy pane is re-produced from the live slice on every frame anything in the build moves, including while a student is holding a selection over it.**

## Performance

- **Duration:** ~95 min
- **Tasks:** 2 planned, 3 commits (the third records what probe S measured)
- **Files modified:** 2

## Task Commits

| # | Task | Commit | Type |
|---|---|---|---|
| 1 | two dialogs that arrive complete — markup, ids, stubs, harvest entries, styles, topbar | `638a63e` | feat |
| 2 | `[S06.6]` the repaint — a code that cannot go stale, and a count that is only a count | `ca9ad00` | feat |
| 2+ | what probe S actually measured, recorded beside check 89 | `1893356` | docs |

## Measurements Recorded

| Reading | Before | After |
|---|---|---|
| Stub-drift shell ids | **73** | **96** (delta **+23**, budget 18-24 — inside it, at the top) |
| Dialog harvest | **144** across **2** roots | **145** across **4** roots (`#tok-picker`, `#act-edit`, `#share`, `#reset-ask`) |
| `DIALOG_FLOOR` | 134 | **138** — seven below the measured 145, the arithmetic this note has now kept three times |
| `SHARE_FLOOR` | — | **0**, against a share-surface harvest of **1** |
| `PICKER_FLOOR` / `PROPOSE_FLOOR` | 84 / 23 | **84 / 23** — unchanged, neither surface moved |
| Interaction gate | 128 of 128 | **135 of 135** (delta **+7**: checks 83-89) |
| In-file suite | 1049 passed / 0 failed | **1049 passed / 0 failed** — unchanged; this plan adds no `[S09]` row |
| `SUITE_FLOOR` | 1019 | **1019** — unchanged, margin still 30 |
| Layer C `#app` | 127 | **127** — unchanged, both dialogs are siblings of `#app` |
| Layer C proposal pane | 60 | **60** — unchanged |
| Layer B string literals | 5,406 | **5,432** |
| perf gate | 8 ms / 100 commits | **7-8 ms** |
| `grep -ci "counter\|rating\|balanced\|difficulty"` | 0 | **0** |
| `grep -c "verdict\|balanced\|rating\|difficulty"` | 0 | **0** |
| `grep -c "https\?://\|url("` | 0 | **0** |
| `grep -c "<svg\|createElementNS"` | 0 | **0** |
| `grep -c 'style="'` | 0 | **0** |
| `grep -c "eval(\|new Function\|innerHTML\|insertAdjacentHTML\|document.write"` | 0 | **0** |

### The fingerprint and the encode, measured

Averaged over 2,000 calls after a 200-call warm-up, on **BOARD E** — 24 versus 24, all six authored
token types, a tally for every type on every unit, six authored actions, **617 characters** of code:

| Call | Cost per call |
|---|---|
| `JSON.stringify(build)` — what `shareSig` runs | **0.030 ms** |
| `App.serialize.encode(build)` — what a code-keyed fingerprint would have run | **0.483 ms** |

**Sixteen times, and both an order of magnitude under a frame.** Neither is anywhere near the
two-millisecond figure the plan set as the threshold for a finding. Keying the fingerprint on the
produced code would have paid the second figure **twice per frame** for every frame in which nothing
moved, which is most of them. The measurement is written into `[S06.6]`'s banner beside the choice it
decided, not only here.

## The 23 New Shell Ids

| Surface | Ids |
|---|---|
| Topbar | `share-label`, `reset-label` |
| Share dialog | `share`, `share-pane-copy`, `share-title`, `share-code`, `share-length`, `share-over`, `share-said`, `share-copy`, `share-to-load`, `share-done` |
| Load pane | `sh-load`, `sh-load-label`, `sh-load-field`, `sh-load-said`, `sh-load-do`, `sh-load-back` |
| Reset confirmation | `reset-ask`, `reset-ask-title`, `reset-ask-says`, `reset-ask-cancel`, `reset-ask-confirm` |

The two panes take **different id stems** — `share-*` against `sh-load-*` — so their controls
partition by attribute exactly as `act-edit-*` and `act-prop-*` do.

Three ids the first draft carried were removed rather than shipped: a separate legend for the code
field (the pane's own `<h2>` labels it, which is what UX-02 wants anyway), a separate heading for the
load pane, and a second Done. That is what brought the count from 26 to 23 and inside the budget.

## Deliberate-Failure Probes

All four readings were taken against **committed** state, recorded verbatim, and every probe reverted
**from a file snapshot** — never by `git checkout`. Working tree verified clean after each.

### PROBE R — the three-way arrival rule, one direction at a time

**R1 — a shell id with no `KNOWN_IDS` entry.** `<p id="share-probe-r"></p>` added inside the copy pane.
The run **aborts** before any suite:

```
STUB DRIFT: cats-vs-mechs.html carries id(s) the stub page does not know: share-probe-r
       getElementById would return null for these, and every consumer in
       the artifact guards on null — so the code path using them would be
       silently skipped and its checks would pass vacuously. Add each id to
       KNOWN_IDS in makeStubDom() AND build the matching node.
```

**R2 — a `KNOWN_IDS` entry with no shell id.** `'reset-ask-probe-r'` appended to the new group. The run
**aborts the other way**:

```
STUB DRIFT: the stub page builds id(s) the shell no longer carries: reset-ask-probe-r
       Remove them from KNOWN_IDS, or the gate is testing markup that
       has already shipped out of the artifact.
```

**R3 — one new dialog left out of `DIALOG_ROOTS`.** The `{ id: 'reset-ask', act: null }` entry removed.
**134 of 135 checks passed**, and the one that moved is 47b, by name:

```
FAIL  interaction gate :: 47b. every <dialog> the stub page builds is named in DIALOG_ROOTS and every
DIALOG_ROOTS entry is a dialog the stub page builds — the rendered-page walk reads #app, and a surface
that is a SIBLING of #app rather than a descendant is outside it until this list says otherwise
      built by the stub but never harvested: reset-ask | named here but not built: none
```

All three directions of the arrival rule are live. Neither new dialog could have been forgotten.

### PROBE S — the fingerprint narrowed to the unit health values

`shareSig` cut back to `JSON.stringify([pane, SIDE_IDS.map(each => state.build[each].units.map(u => u.maxHp))])`.
Run: **1049 passed / 0 failed in the suite; interaction gate 132 of 135.**

```
FAIL  interaction gate :: 84. with the surface open, a REAL op moves the board and the code on the
field is re-produced for the board that is now on screen — decode accepts it, and what it decodes to
re-encodes to the same string, so the trip is closed rather than half-asserted
      decode ok=true why=null field===live encode=false round trip=false
```
```
FAIL  interaction gate :: 87. a repaint driven while the CODE field holds focus REWRITES it and leaves
a selection over the whole of the new code — the opposite answer, on the one field in this file whose
text the artifact produced rather than the student. A stale code reaching a clipboard is discovered by
somebody else, an hour later, with no way back to what was meant
      rewritten=false matches live encode=false selection=0..109 of 109
```
```
FAIL  interaction gate :: 89. the code on the field is re-produced for a change that moves NO NUMBER on
the board — renaming a token type with the surface open. The fingerprint is the whole build slice and
nothing narrower, and this is the row that says so: a fingerprint cut back to the health values passes
every other share row in this file and ships a stale code from this one
      after rename: field===live encode=false | after putting it back: field===live encode=false
      name restored="Stamina and grit"
```

**PROBE S STAYED RED, on three rows rather than the one that was written for it — and the part that
went against the expectation is recorded rather than quietly enjoyed.**

Check 89 was written **before** the probe, on the assumption it would be the only row that objected.
It was not. Rows 84 and 87 also reddened, and the reason is worth keeping because it decides what a
later author may safely change: both of them drive `nudgeFactionAp`, which moves a faction's action
points and **not** a unit's health, so the narrowed fingerprint missed their op too. **Rewrite either
of those two to nudge a unit's health instead and both go green under the identical probe**, because
neither row is *about* the fingerprint — they are about the code being current and about the focus
rule, and they caught this by accident of instrumentation.

Check 89 is the only row whose op is chosen so that no narrowing which keeps the rest of the gate green
can also pass it: a rename changes the code (a type's name travels in the codec's name table) while
touching no number the board draws through a stepper. **That distinction is now written into the
harness beside check 89**, in commit `1893356`, so the next author does not rewrite 84 or 87 into
uselessness without knowing what they were also carrying.

**No row was missing.** Nothing had to be added because of probe S; what was added was the truth about
what it measured.

## The Two Decisions This Plan Made

### 1. Two dialogs, not one and not three

D-21 settled share and load into **one dialog with two panes**, and that is what shipped: `#share`
carries `data-sh-pane` on the dialog node in `#act-edit`'s technique, and the panes take different id
stems so their controls partition by attribute. The two panes did **not** fight, so D-21's "splitting
is a cheap deviation" escape hatch was not needed for them.

The reset confirmation took **its own root**, and the arithmetic was five shell ids and one
`DIALOG_ROOTS` entry. Three reasons, all recorded in the shell beside it: it is a different act with a
different opener; SHARE-04's fourth criterion requires it to read as unmistakably apart from the
non-destructive controls, which a pane of the sharing surface cannot do; and burying it there would
make "start over" reachable only by first opening the thing a student uses to share.

### 2. The code field is written even while it holds focus; the paste field never is

Both are D-19, and the file now carries both answers with their reasons written beside the code that
implements them.

- **`#sh-load-field` is never written by the repaint.** It holds text a student typed or pasted, and
  a repaint that overwrote it would lose half a pasted code. This is the rule `#tok-pick-name`,
  `#act-edit-name` and every term row already keep.
- **`#share-code` is rewritten whenever the build moves, focused or not, and its selection is
  re-applied.** It holds text the *artifact* produced, and the failure runs the other way: a student
  focuses it to select the code, changes the board, comes back and presses Ctrl+C. Under the ordinary
  rule they would copy a code describing a board that no longer exists, and neither they nor the
  classmate who loads it would ever find out.
- **The selection is re-applied over the whole of the new code, not over the old offsets.** A code is
  not edited in place, it is replaced, so the old offsets name nothing — and a student holding a
  selection over a build code is holding it over all of it, because that is the only selection this
  surface is for.

## D-19 Written Into the File

The reset dialog's shell comment carries the argument at length, in `clampTokenName`'s register, under
a boxed heading. Its four moves, in order:

1. **D-17 declined confirmations, twice, by name** — `removeTokenType` and `removeAction` each carry a
   comment saying a modal costs an instructor a click mid-demo to guard against something undo covers.
2. **The one prior time that policy met a competing requirement** (ACT-07), the answer was a permanent
   **line**, `#tok-pick-names`, explicitly not a dialog.
3. **Reset is different, and the difference is measured.** `resetToDefaults` makes one commit and one
   Ctrl+Z restores the build byte for byte — true of the other two as well. What is *not* true of them
   is what happens next: the undo stack is capped at `UNDO_LIMIT`, which is thirty, and thirty nudges
   of a health field is a minute of the exercise. Reset is the **only** destructive act in this file
   whose escape hatch can age out from under the student, and the board it takes away is all of it.
4. **D-17 stays intact everywhere else**, said in as many words, with the narrow test spelled out:
   *does undo stop being able to recover this while the student is still working?* For every other op
   in this file the answer is no.

`#err-reset` is **deliberately not routed through the confirmation**, and the reason is recorded beside
it: it fires from a state where the board may already disagree with memory, D-15 promises recovery
there in one click, and `App.boot`'s `fail()` already closes open modals for a closely related reason —
so putting one back into the recovery path would be undoing that fix from the other end.

The sentence a student reads is the honest one. It says both that Ctrl+Z brings the board back **and**
that it stops being able to:

> This puts both rosters, both action lists and every token type back to the Workshop 16 defaults. One
> Ctrl+Z brings your board back — but only for the next thirty changes, after which it is gone. Copy
> your build code first if you want to keep it.

## What Layer C Can and Cannot See of This Surface, Stated

`SHARE_FLOOR` is **0** against a harvest of **1**, and the smallness is a fact about the surface rather
than a weak gate. It is written out at the constant so the next reader coming from `PICKER_FLOOR`'s 84
does not read it as a typo:

- Almost everything on both new surfaces is **static markup** — the title, the note, the load pane's
  sentence, the reset dialog's whole paragraph, every button legend. The stub page is a hand-made
  stand-in rather than a parser, so static text is empty there. **Layer A reads all of it, in the
  document, in full**, including the CSS and the comments.
- What `[S06.6]` **renders** is one line below `CODE_WARN` — the code's length in characters — and two
  above it, when D-18's over-budget line joins it.
- The build code itself is deliberately not in the count: it is written to the field's **value** rather
  than its text, which is what a field is, and it carries no readable words anyway because every name
  in it travels base64url-encoded through the codec's name table.

So the job this floor does is precise: **it proves the surface was opened and its per-frame hook ran.**
A harvest of zero means the repaint never fired, which is check 47c's failure one surface down.

## Deviations from Plan

### 1. [Rule 3 — a gate that could not have reached the new roots] `openDialogs` asks for a frame

**Found during:** Task 2, when the dialog harvest read 145 → still 144 with `[S06.6]` in place.

**Issue:** `openDialogs()` opened each root and called `A.state.flush()`. `flush()` runs a **pending**
frame and does nothing when none is due. That was invisible while every root was reached through an
opener — an opener paints its surface directly and schedules the next frame on the way out, so one was
always due. This plan's two roots have no opener yet, `showModal()` schedules nothing, and their
per-frame hooks would therefore **never have run**: the walk would have read an empty surface and
reported it clean, forever.

**Fix:** one `A.state.invalidate()` before the `flush()`, so the frame is due for every root the same
way however it was opened. The reason is written at the call site. This is the same class of failure
check 47c exists to catch, one layer further in.

### 2. [Rule 2 — a contract the harness could not exercise] The stub models a selection

`node.select` and `node.setSelectionRange` were two no-ops. This plan gave one field in the artifact the
**opposite** of D-19's rule, and a no-op `setSelectionRange` makes that contract untestable in the
direction that matters — check 87 would have been green over a repaint that rewrote the field and threw
the selection away. They now record `selectionStart` / `selectionEnd`, which is what a browser does.
`selectionStart` stays `undefined` until something sets it, which is exactly what `withPreservedFocus`
already reads it as, so nothing that passed before reads differently because of it.

### 3. [scope — floors moved in Task 2 rather than Task 1] `DIALOG_FLOOR` and `SHARE_FLOOR`

Task 1's acceptance asked for both floors to move in that task. At the end of Task 1 the dialog harvest
was still **144**: the two new roots rendered nothing, because `[S06.6]` did not exist yet. Moving the
floor there would have raised it above nothing, and `SHARE_FLOOR` would have had to be negative to pass.
So Task 1 shipped the **history note** explaining why the total had not moved for two new roots — which
looks like the failure this number guards against and is not — and Task 2 moved the number once the
surface had something rendered to bound. Both are in the constant's history, in order.

### 4. [judgement — a plan instruction weighed against a shipped precedent] Private attributes inside both dialogs

Plan 04-06 says pane moves are page work that "belong in `UI_ACTS`". Every control **inside** both new
dialogs instead carries a private `data-sh` or `data-rs`, which is `#act-prop-open`'s shipped idiom and
the one § Work unit 8's own convention table prescribes. Two reasons: the two presses that write state —
loading a pasted code and confirming a reset — need a payload key `fire()` does not carry, and
03.1-05 declined to add a second recorded exception to `[S07.1]` by having the dialog's own listener
read what it needs off the pressed control; and an unregistered `data-act` inside a dialog would land on
dispatch's `default: throw` if anything ever pressed it. The **topbar** openers do carry `data-act`
(`openShare`, `openResetAsk`), because those are the acts `[S07.4]` will push into `UI_ACTS`, matching
`openTokenPicker` and `openActionEditor` exactly.

### 5. [correctness — requirements not marked] SHARE-01 and SHARE-06 stay open

The plan's frontmatter claims `[SHARE-01, SHARE-04, SHARE-06]`. **SHARE-04 was already complete** before
this plan. SHARE-01 ("copy a compact build code to the clipboard") and SHARE-06 ("reset to defaults,
behind a confirmation") are **not** satisfied by a surface with no handlers: there is no clipboard write
until plan 04-06 and no reset dispatch until 04-07, both of which claim the same ids. Marking them now
would put a false reading in `REQUIREMENTS.md`. They are left Pending and named here.

## Threat Register

| Threat | Mitigation as built | Proved by |
|---|---|---|
| T-04-21 a stale code left on screen after the board moved, copied into a message | the fingerprint is the whole build slice plus the pane; the code is produced at render time from the live slice and stored nowhere; the code field is rewritten even while focused | **PROBE S** — a health-only fingerprint reddens 84, 87 and 89, and 89 is the row that stays red under any narrowing the rest of the gate tolerates |
| T-04-22 a decoded or typed name reaching a markup sink | nothing in `[S06.6]` builds a node; it writes `textContent`, `.value` and `.hidden` only. The document-wide sink scan reads **0** | `grep -c "eval(\|new Function\|innerHTML\|insertAdjacentHTML\|document.write"` = 0; FORBIDDEN scan clean |
| T-04-23 a stub whose class or dataset spelling differs from the shell | the stub is spelled from the markup; the drift gate is bidirectional and 47b is bidirectional | **PROBE R**, all three directions, each aborting or reddening by name |
| T-04-24 a classmate's token named after a comparative word reddening CI on a legitimate paste | this surface renders no student text at all — the only rendered string is a character count, and the build code carries every name base64url-encoded | check 83 harvests the surface and finds no hit; check 47d's rename control still clean at 145 |
| T-04-25 the character readout acquiring an adjective | the sentence is asserted **whole** over three different boards, and again on both sides of the `CODE_WARN` threshold; Layer C walks the surface from the moment it exists | checks 85 and 88 |
| T-04-SC npm/pip/cargo installs | accept | zero packages installed by this phase |

## Known Stubs

Three, all of them **reserved by this plan for a named later plan**, and none of them preventing this
plan's goal:

| Node | Reason | Resolved by |
|---|---|---|
| `#share-said` | empty and hidden — the line the copy path writes to say which clipboard tier actually worked. There is no copy path yet | plan 04-06 |
| `#sh-load-said` | empty and hidden — where a refusal's words land. `[S04.3]` hands back four tokens; the wording is not this plan's | plan 04-07 |
| `data-act="openShare"` / `data-act="openResetAsk"` | markup with no handler registered. `UI_ACTS`' own comment describes this state ("claimed and ignored"); nothing in the repo presses either yet, and both `DIALOG_ROOTS` entries carry `act: null` with the reason written down | plan 04-06 |

## Threat Flags

None. No new network endpoint, no auth path, no file access pattern, no schema change. The one genuinely
new surface is a **build code rendered onto a page**, which is the same trust boundary plan 04-02
registered for `encode` and is covered by T-04-21 above.

## For the Next Plans

- **04-06 (the handlers).** `App.render.share(state)` is exported and is the one caller's entry point:
  move `data-sh-pane` on `#share`, then call it, exactly as `[S07.3]` does with `App.render.editor`.
  The controls to bind: `data-sh` = `copy` / `to-load` / `to-copy` / `load` / `done`, and `data-rs` =
  `confirm` / `cancel`. Replace both `act: null` entries in `DIALOG_ROOTS` with the acts registered, and
  the two topbar `data-act` spellings are already in the markup and the stub. **`App.serialize.encode`
  must not be called in the copy handler at all** — `#share-code.value` already holds the current code,
  produced synchronously before any gesture, which is exactly what the Chrome-107 rule wants.
- **04-07 (the refusal message).** `#sh-load-said` is the node, with `.sh-said` and its own `[hidden]`
  rule already in `[C13]`. `[S08].linkRefusal` is deliberately not shared; the dialog has a different
  thing to say next.
- **04-08 (the rehearsal).** Four items land here and are in the plan's `<human-check>`: whether both
  dialogs fit a laptop viewport and whether the code field scrolls rather than overflowing at a
  3,000-character adversarial code; whether the character readout is legible from the back of a room and
  reads as a fact; whether the reset control reads as visually apart on a projector; and whether Escape
  in the paste field reverts the field and leaves the dialog open. The harness's limitations list already
  carries entry 12, which says a close request is a rehearsal item **once per dialog** and that adding a
  dialog adds one — this plan added two.
- The interaction gate is **135**; `SUITE_FLOOR` is **1019** against a measured **1049**; the next free
  check number is **90**; shell ids are **96**; `DIALOG_FLOOR` is **138** against **145**.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND
- `tests/selftest-node.cjs` — FOUND
- `.planning/phases/04-share-reset/04-05-SUMMARY.md` — FOUND
- commit `638a63e` — FOUND
- commit `ca9ad00` — FOUND
- commit `1893356` — FOUND
- `node tests/selftest-node.cjs` exits 0 at 1049 passed / 0 failed — VERIFIED
- interaction gate 135 of 135 — VERIFIED
- stub-drift 96 in both directions; `#app` 127, dialogs 145 across 4 roots, proposal 60 — VERIFIED
- all six greps print 0 — VERIFIED
- `git diff` over `[S06.1]`-`[S06.5]`: two insertion-only hunks, both **after** `#endregion [S06.5]` — VERIFIED
- working tree clean after every probe revert — VERIFIED
</content>
</invoke>
