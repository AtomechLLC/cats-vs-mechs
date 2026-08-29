---
phase: 05-fight-loop-playtest
plan: 06
subsystem: ui
tags: [shell, c14, topbar-reservation, ledger, stub-drift, fight-01, fight-09, fight-14, share-07]

requires:
  - phase: 02-allocation-board
    plan: 01
    provides: "#board's five static siblings, structure()'s never-#board-never-#app rule, and withPreservedFocus scoped to #board"
  - phase: 04-share-reset
    plan: 05
    provides: "the third and fourth topbar controls, the paragraph that named Phase 5's two as the remainder, and #share-said / #sh-load-said as the shipped precedent for reserving an empty hidden node for a later plan"
  - phase: 05-fight-loop-playtest
    plan: 05
    provides: "the fight slice as it now stands — round, decl, past, hand — and 1185/0 with 96 shell ids as the baseline this plan moved"
provides:
  - "two topbar groups that spend the last of D-04's reservation, and the paragraph that closes it in writing"
  - "#fightbar — a static in-page fight region between #topbar and #board, with #fight-prompt, two declaration roots and FIGHT-10's notice reserved empty"
  - "#ledger — a static region that is a SIBLING of #board, hidden until there is a past round, whose rows carry no data-k and no data-act"
  - "[C14] with three named sub-region owners: [C14.1] .fg- (05-07), [C14.2] .ld- (05-08), [C14.3] .dc- (05-09)"
  - "fifteen new shell ids, each in KNOWN_IDS and in the stub, gated in both directions — 96 -> 111"
affects: [05-07, 05-08, 05-09, 05-10, 05-11]

tech-stack:
  added: []
  patterns:
    - "a surface IN THE PAGE rather than in a <dialog> — the first since Phase 2 — taken deliberately so the whole surface sits inside #app and the fight-mode Layer C harvest reads every word of it without a root of its own"
    - "a region placed by DOCUMENT ORDER rather than by `order` or a reversed flex direction, so the sequence a screen reader walks is the one the room sees"
    - "a bounded scroll ON THE ELEMENT ITSELF as the thing that keeps a region above the board from pushing the board down the page"
    - "a reserved empty-and-hidden node checked off against the admission line's four silent-failure rules by name at the site"
    - "an explicit [hidden] rule on a root whose own rule gives it a display, because an author display beats the user agent's [hidden]{display:none} outright"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "THE FIGHT SURFACE IS IN THE PAGE AND NOT A DIALOG, and the paragraph beside it names what the trade costs and what it buys. Cost: no DIALOG_ROOTS entry, no close-request question, no backdrop, no focus trap. Benefit, and the reason it is worth taking: the whole surface sits inside #app, so plan 05-01's fight-mode harvest reads it without a root of its own. Dialogs stayed at 145 across 4"
  - "START THE FIGHT IS ONE CONTROL AND IT ONLY EVER STARTS ONE. SHARE-07's fight reset lives in the surface, beside the Advance it takes back — not as a second meaning bolted onto the topbar button. Two reasons written down: the reservation this plan just closed has no room for a fifth control, and a button that reads one thing before a fight and another during one changes what it does under a cursor that has not moved, in front of a room, when one of the two acts throws a played fight away"
  - "THE LEDGER IS A SIBLING OF #board AND ITS ROWS CARRY NO data-k AND NO data-act. Belt and braces on one measured hazard, and both halves are asserted on the live page: the first [data-k] match scoped to #board is `cats/ap-` before a fight, after startFight and after an Advance, and it is never inside the ledger"
  - "NEWEST NEAREST THE BOARD BY DOCUMENT ORDER ALONE. The region sits above #board, rows are appended in the order the rounds happened, and a column puts the last child at the bottom. No `order` and no reversed direction, because either would put the reading order out of step with the DOM order"
  - "THE LEDGER SHIPS HIDDEN, NOT VISIBLE-AND-EMPTY. A labelled empty box above the board of a student who never starts a fight is a thing they have to interpret for nothing. It is hidden as a REGION in #refband's bookkeeping; the admission line's stricter hidden-AND-empty rule governs #fight-said, and that node keeps it"
  - "46vh ON THE LEDGER'S SCROLL IS A REHEARSAL DIAL, shipped with the measurement that makes it one rather than with a guess, and it is NOT the reason MAX_PAST_ROUNDS is thirty — that cap is a readability bound with its own paragraph and the per-frame measurement behind it"
  - "THE TOPBAR READOUT IS NOT A CONTROL. No data-act and no data-k on it or in it, and topbarButton() is deliberately not used for it in the stub, because a helper that stamps an act onto a reading would put an act on the gate's page that the shell does not carry"

patterns-established:
  - "the three-part rule stated a third time at a new site, with the fourth part's ABSENCE named as a decision: no <dialog> is added, so there is no DIALOG_ROOTS entry, and that is written down rather than left as a gap"
  - "a CSS block whose banner names its three sub-region owners and the plan that owns each, in the [S04.1]-[S04.4] manner, so later plans land where this one says"

requirements-completed: []

duration: 95min
completed: 2026-08-29
---

# Phase 05 Plan 06: The Fight's Two Page Regions Summary

**The topbar's reservation is spent with the closure written where the next
author will look, the fight surface got a home in the page rather than in a
dialog, past rounds got one outside `#board` with the measured focus hazard
recorded beside it — and driving the shipped markup in a real browser found a
CSS shorthand that had silently zeroed the left margin the rule above it had
just computed, which no gate in this repo can see.**

## The gate, before and after

| | before (05-05) | after |
|---|---|---|
| suite | 1185 passed, 0 failed | **1185 passed, 0 failed** |
| `SUITE_FLOOR` | 1155 | 1155 (not moved — nothing renders yet) |
| interaction gate | 147 of 147 | **147 of 147** |
| stub-drift | 96 shell ids | **111 shell ids** (+15) |
| `#app` (setup) | 127, floor 117 | **127** — unchanged |
| `#app` (fight) | 101, `FIGHT_FLOOR` 41 | **101**, floor 41 |
| dialogs | 145 across 4 roots, floor 138 | **145 across 4 roots** — unchanged, this phase adds no dialog |
| proposal pane | 60, floor 23 | 60, floor 23 |
| Layer B literals | 6829 | 6829 |
| perf gate | 7 ms of 50 | 7 ms of 50 |
| naming greps | 0 / 0 | **0 / 0** |

`node tests/selftest-node.cjs` exits 0.

**`#app` staying at 127 is not an accident and is worth stating**, because a
plan adding visible copy to the setup page might expect it to move: Layer C's
`#app` harvest walks the hand-made STUB page, not the shell, and the stub
carries no text for static markup. `#reset-ask-says` already records the same
fact about itself. Layer A reads the new sentences in the document instead, and
did — 18 words, clean.

## Task 1's stub-drift failure, recorded verbatim

Exactly the direction the plan predicted, naming all fifteen ids:

```
1185 passed, 0 failed
perf: 100 commits in 7 ms (budget 50 ms)
STUB DRIFT: cats-vs-mechs.html carries id(s) the stub page does not know: round-label,
       round-count, pool-cats, pool-mechs, fight-label, fight-start, fightbar, fight-head,
       fight-prompt, decl-cats, decl-mechs, fight-said, ledger, ledger-head, ledger-list
       getElementById would return null for these, and every consumer in
       the artifact guards on null — so the code path using them would be
       silently skipped and its checks would pass vacuously. Add each id to
       KNOWN_IDS in makeStubDom() AND build the matching node.
exit=1
```

## The fifteen new ids, what each is for, and which plan fills it

| id | what it is | filled by |
|---|---|---|
| `round-label` | the readout's permanent visible legend, 18px, in the shell | — (static) |
| `round-count` | the round number | 05-07 |
| `pool-cats` | the Cats' action-point reading | 05-07 |
| `pool-mechs` | the Mechs' action-point reading | 05-07 |
| `fight-label` | the start control's permanent visible legend, 18px | — (static) |
| `fight-start` | the one start-the-fight control, `data-k="fg"`, `data-act="startFight"` | disabled by 05-07, pressed by 05-10 |
| `fightbar` | the in-page fight region, between `#topbar` and `#board` | 05-07 |
| `fight-head` | its visible legend, `aria-labelledby` target | — (static) |
| `fight-prompt` | "No fight is running…" so the region is never an empty box | hidden by 05-07 |
| `decl-cats` | the Cats' declaration root, empty and hidden | 05-07 |
| `decl-mechs` | the Mechs' declaration root, empty and hidden | 05-07 |
| `fight-said` | FIGHT-10's notice, empty **and** hidden together | 05-09 |
| `ledger` | the ledger root, sibling of `#board`, hidden | 05-08 |
| `ledger-head` | its visible legend, `aria-labelledby` target | — (static) |
| `ledger-list` | the element that scrolls on itself | 05-08 |

**The count, against the paragraph `#act-edit` asks the next author to read.**
96 → **111**, a delta of **15**. The picker cost 19, the action editor 21 for
two panes, the share pair 23. **Fifteen is under all three**, and the reason is
the shape rather than restraint: two regions built once and flagged need only
their roots, because everything inside them is `createElement`'d by a sub-region
and carries no id at all. The four ids that are not roots are the readout's
value nodes, and those are on the topbar, which is static markup end to end.

## The reservation-closure paragraph, verbatim

```
           THE RESERVATION IS NOW SPENT, AND SAYING SO IS THIS PARAGRAPH'S JOB.
           Nothing is held back here any more. A later phase wanting a control
           per action, per side or per round gets the answer D-05 already gave
           and the paragraph below already restated: put it in the surface, not
           on the bar, because the bar is the one place UX-02 says a projector
           may not grow a queue of controls. The surface is directly beneath
           this bar — #fightbar carries this phase's declaration step, its
           Advance and its fight reset, and every one of those three would have
           been a one-per-round or a one-per-side control up here. IT MUST NOT
           BECOME ONE-PER-ANYTHING, for the fourth time and the last.
```

The two groups sit at the **head** of the cluster rather than at its end, which
is the one arrangement decision the bar needed: a reading a room has to take in
leads the bar instead of joining a queue of controls, and Reset stays last and
apart where SHARE-04's fourth criterion put it, undisturbed.

## The ledger's DOM position and its stacking mechanism

Driven on the live page in Chrome, not read off the markup:

```
#app child order      ['.shell-head', 'topbar', 'fightbar', 'ledger', 'board', 'selftest-report']
ledgerIsSiblingOfBoard                    true      (same parent, and the parent is #app)
ledgerPrecedesBoard                       true
ledgerInsideBoard                         false
ledger [data-k] or [data-act] count       0
```

**The hazard, closed and driven three times.** `withPreservedFocus` scopes to
`#board` and `keyed()` takes the first `[data-k]` match:

```
first [data-k] scoped to #board, setup                 "cats/ap-"   in the ledger? false
                                after startFight       "cats/ap-"   in the ledger? false
                                after an advanceRound  "cats/ap-"   in the ledger? false
```

**The stacking mechanism is document order and nothing else.** The region sits
before `#board`; rows are appended in the order the rounds happened; a column
lays the last child out at the bottom. Six rows driven in:

```
row tops (px)              366, 438, 510, 582, 654, 726     (ascending: oldest above)
newest is last child       "round 6"
```

No `order` and no reversed flex direction, deliberately — either would put this
region's reading order out of step with its DOM order, so a screen reader would
walk the reverse of what the room sees.

**And the bound is what keeps the live board where the student left it.** With
the list at its 46vh cap:

```
live board top, 3 rounds of history      492px   (1080px viewport)
live board top, 30 rounds                879px
so the board travels                     387px and then stops
```

879 of 1080 leaves the live board in the bottom fifth of the screen. That is a
legibility question rather than a layout bug, it is written into `[C14]` with
both figures, and it is on plan 05-11's list with numbers in hand instead of an
opinion.

## `[C14]`, and its three named sub-region owners

```
[C14.1]   .fg-   the fight bar                 plan 05-07
[C14.2]   .ld-   the ledger of past rounds     plan 05-08
[C14.3]   .dc-   the board in fight mode       plan 05-09
```

Three prefixes rather than one, for the argument `[C13]`'s banner makes and
names this phase in. Written into `[C14]`: `[C03]`'s sticky gotcha in its own
words, the ledger scrolling on itself with `[C12]`'s list as the precedent,
UX-02's 18px floor binding a fourth time, the three document-wide prohibitions
(no reference-function-with-a-URI construct, no inline namespaced markup, no new
hex), and one prohibition new to this block — the CSS property that evens out a
heading's line lengths carries a stem the gate refuses document-wide and is
**described rather than spelled**, which is `[C11]`'s and `refCard`'s own rule.

`.fg-apart` is `[C13]`'s `.rs-apart` **restated rather than borrowed**, for
`[C13]`'s own reason: `.rs-` means "the reset confirmation" everywhere else in
this file, and a fight control wearing it would make that one rule two regions
depend on.

Verified over the block: `url(` 0 document-wide, `createElementNS|<svg` 0,
`text-wrap: balance` 0, and `#[0-9a-fA-F]{3,6}` over `[C14]` prints **0** — no
new hex, verified by reading the whole block back and by the pattern finding
nothing at all (`#fightbar` and `#ledger` do not match it; `#decl-` would have,
which is why `[C14]` names the two declaration roots by their class and never by
their id).

## Probes: run after their task's commit, recorded verbatim, reverted from a file snapshot

`git checkout -- cats-vs-mechs.html` was never used. Every revert was `cp` from
a scratchpad snapshot and `git status --short` read clean after each.

### PROBE U(a) — one new id deleted from `KNOWN_IDS`, the stub node left standing

```
1185 passed, 0 failed
perf: 100 commits in 7 ms (budget 50 ms)
STUB DRIFT: cats-vs-mechs.html carries id(s) the stub page does not know: ledger-list
       getElementById would return null for these, and every consumer in
       the artifact guards on null — so the code path using them would be
       silently skipped and its checks would pass vacuously. Add each id to
       KNOWN_IDS in makeStubDom() AND build the matching node.
exit=1
```

Red, by name, in the direction "the shell has an id the gate does not know".

### PROBE U(b) — the `#ledger-list` node deleted from the SHELL, `KNOWN_IDS` and the stub left standing

```
1185 passed, 0 failed
perf: 100 commits in 7 ms (budget 50 ms)
STUB DRIFT: the stub page builds id(s) the shell no longer carries: ledger-list
       Remove them from KNOWN_IDS, or the gate is testing markup that
       has already shipped out of the artifact.
exit=1
```

Red, by name, in the **other** direction. Both arms fire on the same id.

### PROBE U(c) — a stub spelling drifted from the shell. **EXPECTED SILENT, AND IT WAS SILENT.**

Two spellings changed in the stub and neither in the shell: the ledger list's
class from `ld-list` to `Id-list` (a capital i where a lower-case L belongs —
indistinguishable in most editor fonts), and the start control's act from
`startFight` to `startfight`.

```
scan: no forbidden patterns
scan: no comparative language in the document (Layer A, 18 words)
scan: no comparative language in the 6829 string literals (Layer B, 27 words)
1185 passed, 0 failed
perf: 100 commits in 6 ms (budget 50 ms)
stub-drift gate: 111 shell ids, all built by the stub page
scan: 127 rendered strings read from #app (Layer C, 48 words)
scan: 145 rendered strings read from 4 dialog root(s) — #tok-picker, #act-edit, #share, #reset-ask (Layer C, floor 138)
scan: 101 rendered strings read from #app WITH A FIGHT RUNNING (Layer C, floor 41)
scan: 60 rendered strings read from #act-edit-propose with the pane OPEN (Layer C, floor 23), of which 24 are chooser ticks
interaction gate: 147 of 147 checks passed
exit=0
```

**Spotlessly green, over a control nothing would be listening to.** That is the
finding, not a pass. The stub-drift gate reads IDS; nothing anywhere reads a
class or a dataset value back against the markup, so the warning above the stub
builder — *"EVERY DATASET SPELLING BELOW IS COPIED FROM THE SHELL. A typo here
is not a red run: it is a green one, over a control nothing is listening to"* —
is the only thing holding that boundary, and this probe is the measurement that
says so. It is also why the misspelt act was chosen as the second half: a
`startfight` in the stub would make every future row that drives the topbar
control drive an act that does not exist, and the gate would say nothing.

### PROBE V — an overflow on an ancestor of `#strip`. **EXPECTED SILENT, AND IT WAS SILENT.**

The ledger's scroll was moved off `.ld-list` and onto `.shell`, which **is** an
ancestor of both `#topbar` and `#strip` — the plainest form of the mistake
`[C03]` was written to prevent (`.shell{max-height:90vh;overflow-y:auto}`).

```
scan: no forbidden patterns
1185 passed, 0 failed
stub-drift gate: 111 shell ids, all built by the stub page
scan: 127 rendered strings read from #app (Layer C, 48 words)
scan: 145 rendered strings read from 4 dialog root(s) …
interaction gate: 147 of 147 checks passed
exit=0
```

**Nothing said anything.** There is no layout engine in the Node harness, so no
check in this repo can see a sticky element stop sticking. `[C03]`'s own
sentence is the whole of the enforcement — *"There is no error and no warning
when it goes wrong. Sticky simply stops working."* — and it is restated inside
`[C14]`'s rule rather than pointed at, because a pointer is not a guard.

This goes in the limitations list rather than in a claim, and it is a plan 05-11
rehearsal item.

## Deviations from Plan

### Auto-fixed

**1. [Rule 1 — bug] A CSS shorthand silently zeroed the longhand above it, found by driving a real DOM**

- **Found during:** task 2's DOM verification, after the task was committed.
- **Issue:** `#fightbar, #ledger` set `width` and a computed `margin-left`; each
  region's own id rule then wrote `margin:0 0 18px`. Both rules are id-specific,
  the second wins, and the **shorthand reset the longhand**. Measured at
  1920×1080: the fight region sat at `left: 342` against the board's `left: 160`,
  both 1600px wide — 182px out of alignment with the thing it describes, on the
  exact display this file targets. The Node harness computes no layout and
  reported the file spotlessly clean through the whole of it.
- **Fix:** the whole margin is spelled once, in the shared declaration
  (`margin:0 0 18px calc(…)`), and nothing below writes `margin` again. The
  reason is written into `[C14]` beside it, in the sticky gotcha's register,
  because it is the same class of failure: no error and no warning when a
  shorthand resets a longhand.
- **Measured after:** `#fightbar`, `#ledger` and `#board` all report `left: 160`
  and `width: 1600` at 1920, and `left: 22` at 1600 / 1440 / 1366 / 1280 / 1024
  / 760, matching the board at every one.
- **Commit:** `6075988`

**2. [Rule 2 — missing information at the site the next author will look] Two measurements written into the file rather than only into this summary**

- **Issue:** the plan asked for the second-order topbar cost to be *said*, and
  for the ledger's height to be justified. Both were written qualitatively on
  the first pass, which is exactly the thing this file's own register refuses:
  a dial with no measurement beside it is a guess wearing a comment.
- **Fix:**
  - the topbar comment now carries the **measured wrap threshold, before and
    after**: the bar was 64px at 1280 and wrapped only below it; it is now 64px
    at 1512 and 109px at 1440, 1366 and 1280. So `[S08]`'s measured
    `--topbar-now` path runs on an ordinary laptop where it used to run only on
    a narrow window, and `#strip`'s sticky top followed it to 108.59px in the
    same run — which is `[S08]` doing the job it was written for, observed;
  - `[C14]`'s ledger rule now carries the **live board's travel** (492px → 879px
    of a 1080px viewport as the list fills to its bound) as the reason 46vh is a
    rehearsal dial, and **a consequence for plan 05-08** measured in the same
    run.
- **Commit:** `6075988`

### Corrections to the plan's own premises

**3. [finding] The plan's `#app` 127 acceptance is satisfied by the stub, not by restraint**

Task 2's acceptance requires `#app` to stay at 127, which reads as a
prohibition on adding rendered copy to the setup page. It is not one: Layer C's
`#app` harvest walks the hand-made stub, and the stub carries no text for static
markup — `#reset-ask-says` records exactly this about itself. Four new sentences
shipped in the shell and `#app` did not move. Layer A read them in the document
instead and stayed clean at 18 words. Recorded so plan 05-07, whose acceptance
expects `#app` **to** move, knows why: its copy is rendered by `[S06.7]` into
stub nodes, which is the half Layer C does see.

**4. [finding] "One control per anything" and SHARE-07 needed a decision the plan left open, and it was taken toward the surface**

The plan asked for the fight reset to be either the same topbar control or a
control in the surface, and to say which. It is **in the surface**, and both
reasons are written beside the button: the reservation this plan closes has no
room for a fifth control, and a single button that reads "Start the fight"
before a fight and "Reset the fight" during one changes what it does under a
cursor that has not moved — with one of the two acts throwing a played fight
away. `#fight-start` is therefore disabled while a fight is running, which
`.brd-btn` already draws and which plan 05-07 sets.

### Declined by design

- **No `<dialog>`, so no `DIALOG_ROOTS` entry**, and the absence is a written
  decision at both region sites rather than a gap. Dialog harvest unchanged at
  145 across 4.
- **No `[S0N]` script region was touched.** `git diff` over the script block
  outside `[C14]`'s CSS and the shell markup is empty; `MAX_PAST_ROUNDS` was
  already shipped by plan 05-04 with its readability-cap paragraph and was not
  modified.
- **No declaration slots reserved as static markup.** Plan 05-07 decides whether
  its slots are static and says so; the shell comment states that if it chooses
  static, the rows and their ids arrive here beside the two roots.
- **No `ledger-empty` line.** The whole region is hidden while there is nothing
  in it, which makes a "nothing here yet" line a node that could never be seen.
- **Nothing renders, nothing presses, nothing writes state.** Every value node
  this plan added is empty, and every reserved node is hidden.

## Known Stubs

Every id this plan adds is a reserved node, which is the plan's whole output.
Each is listed above with the plan that fills it, each has its reason written at
its site in the shell, and reserving an empty hidden node for a later plan is
shipped practice here (`#share-said`, `#sh-load-said`, and the action editor's
proposal pane before 03.1-07 filled it).

| stub | file | why it is intentional | resolved by |
|---|---|---|---|
| `#round-count`, `#pool-cats`, `#pool-mechs` empty | cats-vs-mechs.html | the readout is filled by `[S06.7]`; a value written here would be a second source for a figure computed at render time | 05-07 |
| `#decl-cats`, `#decl-mechs` empty and hidden | cats-vs-mechs.html | built once and flagged by `[S06.7]`, in `#refband`'s bookkeeping | 05-07 |
| `#fight-said` empty and hidden | cats-vs-mechs.html | FIGHT-10's notice; hidden **and** empty together per the admission line's rule | 05-09 |
| `#ledger-list` empty, `#ledger` hidden | cats-vs-mechs.html | there are no past rounds on a board nobody has fought on | 05-08 |
| `#fight-start` reaches a live op with no surface behind it | cats-vs-mechs.html | `startFight` is a real dispatched op, so the button works the moment it ships; nothing in this repo presses it, and the surface it starts is 05-07's | 05-10 |

None of these prevents this plan's goal, which was to draw the boxes.

## Threat Flags

None. No new network endpoint, auth path, file access pattern or schema change
at a trust boundary. The four mitigations the plan's threat register assigns:

| Threat | Mitigation, as shipped |
|---|---|
| T-05-23 focus restore landing on a dead ledger clone | the ledger is a sibling of `#board` and carries zero `data-k` and zero `data-act`; both asserted on the live page, before a fight, after `startFight` and after an `advanceRound`. Plan 05-10 adds the parallel check to check 63b's |
| T-05-24 a stub spelling drifting from the shell | every class and dataset spelling copied from the markup; **probe U(c) records the green and names it as the reason** — the gate reads ids and nothing reads a class back, so the warning above the stub builder is the whole of the boundary |
| T-05-25 an overflow silently stopping `#strip` sticking | the ledger scrolls on itself, `[C03]`'s own sentence written into the rule; **probe V records that no automated check can see this** and it becomes a rehearsal item. Driven on the live page: every ancestor of `#strip` and `#topbar` reports `overflow: visible`, and `#strip` is still `sticky` after a fight and an Advance |
| T-05-26 the topbar growing one control per round or per side | exactly two groups, one of them not a control at all, and the reservation closed in writing at the place the next author will look |

## Requirements

**None marked complete, and that is deliberate** — the same reading plans 05-04
and 05-05 took. The plan names FIGHT-01, FIGHT-09, FIGHT-14 and SHARE-07, and
this plan draws boxes:

- **FIGHT-01** — the start control exists and reaches a real op, but the surface
  it starts renders nothing. Plan 05-07.
- **FIGHT-09** — the readout nodes are on the bar and empty. Plan 05-07.
- **FIGHT-14** — the ledger has a home, a stacking direction and a bound. Nothing
  puts a round in it. Plan 05-08.
- **SHARE-07** — the reset has a decided home and no control yet. Plans 05-07 and
  05-10.

## What the plans that follow inherit

- **05-07:** the readout ids are `round-count`, `pool-cats`, `pool-mechs`, all
  empty; the declaration roots are `decl-cats` and `decl-mechs`, both `.fg-side`,
  both empty and `hidden`, inside a `.fg-sides` flex row that wraps at a 340px
  basis; the prompt to hide is `#fight-prompt`; the control to disable is
  `#fight-start`. `#fightbar` is the region root and `[C14.1]` is where `.fg-`
  rules go. **`#app`'s Layer C figure will move for your copy and not for
  05-06's**, because the harvest walks the stub and static markup carries no text
  there. If you decide the declaration slots are static markup, they and their
  ids come back into the shell beside the two roots — the shell comment says so.
- **05-08:** `#ledger` is a sibling of `#board`, ships `hidden`, and `#ledger-list`
  is the element that scrolls. **Rows carry no `data-k` and no `data-act` at
  all.** Append in round order and do not reorder — the newest is the last child
  and the last child is the one nearest the live board. **You must scroll
  `#ledger-list` to its end on append**: measured, once the list is past its
  bound the newest row is below the fold of its own scroller, and scrolled to the
  end its bottom edge sits 20px above the live board's top. `#ledger`'s
  `[hidden]` is unset by you. `[C14.2]` is where `.ld-` rules go. The 46vh bound
  is a rehearsal dial with its two figures in the comment.
- **05-09:** `#fight-said` is the FIGHT-10 notice, empty and hidden, and it
  already checks off the admission line's four silent-failure rules. `[C14.3]` is
  where `.dc-` rules go.
- **05-10:** `#fight-start` carries `data-k="fg"` and `data-act="startFight"` and
  is **already live** — `startFight` is a dispatched op, not a `UI_ACTS` entry,
  so the button works today with nothing rendering behind it. The fight reset is
  a control in the surface and not on the bar; that decision is written beside
  the button. Check 63b's parallel for ledger rows is yours.
- **05-11:** six layout questions, every one of them LOW and none of them
  answerable in this repo. Two now have numbers rather than opinions: the bar's
  wrap threshold moved from below 1280 to below 1512 (so `--topbar-now` runs on a
  1440 and a 1366), and the live board's top travels 492px → 879px of a 1080px
  viewport as the ledger fills. The four without numbers: whether the ledger
  scrolling on itself really keeps `#strip` sticky in the room's browser; whether
  the round and both pools are legible from the back; whether "newest nearest the
  board" reads as *stacking upward* to a person; and whether a page carrying a
  bar, a fight region, a board and a ledger is navigable without a scroll that
  leaves the live board unseen.
- **Everyone:** **the Node harness computes no layout, and this is the plan that
  paid for it.** A shorthand resetting a longhand put a 1600px region 182px out
  of alignment with the 1600px board it describes, through a spotlessly green
  run. If a plan writes CSS or shell markup, drive it in a real browser before
  claiming it clean — Playwright against `file://` with `channel: 'chrome'` works
  and took one file.

## Self-Check: PASSED

Files verified present: `cats-vs-mechs.html`, `tests/selftest-node.cjs`,
`.planning/phases/05-fight-loop-playtest/05-06-SUMMARY.md`.

Commits verified in the log: `ebb3f59`, `67ea7dd`, `6075988`.

Verified in the artifact: one `id="fightbar"`, one `id="ledger"`, one
`[C14]` banner, `[C14.1]` / `[C14.2]` / `[C14.3]` each named once with its owning
plan, zero `data-k` and zero `data-act` inside the ledger markup, and zero
`<dialog>` added.

Final run: `node tests/selftest-node.cjs` → **1185 passed, 0 failed**,
stub-drift **111 shell ids**, interaction gate **147 of 147**, `#app` 127,
dialogs 145 across 4 roots, fight-mode 101, perf 7 ms of 50, exit 0. Both naming
greps print **0**; `url(` prints 0; `createElementNS|<svg` prints 0;
`text-wrap: balance` prints 0; the hex pattern over `[C14]` prints 0. Working
tree clean after every probe revert; `git checkout --` was never used on either
file.
