---
phase: 05-fight-loop-playtest
plan: 12
subsystem: ui
tags: [shell, c15, s06.10, s07.6, view-switch, tab, proj-05, ref-03, ux-02, d-27]

requires:
  - phase: 05-fight-loop-playtest
    plan: 06
    provides: "the shell markup this inserts into, #fightbar, #ledger, the .fg-band wrapper the orchestrator's viewport fix added, [C14]'s frame rule and the three-part id rule stated at a new site"
  - phase: 05-fight-loop-playtest
    plan: 10
    provides: "[S07.5]'s press idiom, its UI_ACTS/HOLD_ACTS rulings, checks 93-102 and the 1188/0 + 160/160 + 111-id baseline this plan moved"
  - phase: 02-allocation-board
    plan: 01
    provides: "#board's explicit three-track grid, #strip's sticky rule and [C03]'s sticky gotcha"
provides:
  - "#views, #view-build and #view-fight — the three shell ids D-27's tab is switched with, each control carrying data-vw and no data-act"
  - "[C15] THE VIEW SWITCH — the .vw- rules, the two attribute selectors that put one side of the switch away, and a named [C03] EDIT BY PLAN 05-12 pinning #strip to the middle column in the fight view"
  - "[S06.10] RENDER — THE VIEW SWITCH: the switch repainted from #app's data-view every frame, and a fight followed across its two edges and across nothing between them"
  - "[S07.6] INTERACTIONS — THE VIEW SWITCH: one delegated pointerdown/click pair, page work only, nothing in UI_ACTS and nothing in HOLD_ACTS"
  - "checks 103, 103b and 103c — the view is not state, the projection and the reference band are in neither side of the switch, and the view follows both edges without following what is between them"
  - "the viewport arithmetic four plans in a row were holding, dissolved structurally rather than by a dial"
affects: [05-13, 05-14, 05-15, 05-16, 05-11]

tech-stack:
  added: []
  patterns:
    - "a page-level VIEW driven by one attribute on #app and by an attribute selector in the stylesheet — never by the hidden property, because an author display beats the user agent's [hidden]{display:none} outright"
    - "an EDGE DETECTOR held on the page rather than in state: a private data-* flag compared against the live slice, so a region follows a transition without owning the thing that transitioned and an undo moves it for free"
    - "a check whose two halves are split by what each page can honestly answer — the stub DOM for ancestry it models, a slice of the artifact's own markup for a class-only wrapper it does not"
    - "a requirement kept STRUCTURALLY rather than by a rule: #strip and #refband are outside both sides of the switch because #board stands in both views, so no rule has to remember to spare them"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "THE FIGHT BECOMES A TAB AND THE VIEWPORT PROBLEM DISSOLVES RATHER THAN GETTING SMALLER. Four plans in a row each set a height dial against a page the next plan then changed, and the orchestrator's out-of-sequence fix bought 236px at 1080 and 38px at 768 by laying two regions side by side. Two things that are never on screen together do not compete for one viewport, so the arithmetic stops being anybody's to hold. No dial was turned by this plan — not [C14]'s 736px basis, not [C14.1]'s 34vh bound, not .ld-list's 46vh"
  - "#strip AND #refband ARE OUTSIDE BOTH SIDES OF THE SWITCH BECAUSE #board STANDS IN BOTH VIEWS. Only the two .brd-col columns and #board-empty are put away. That makes PROJ-05 and REF-03 structural rather than a rule somebody has to remember to spare them from — and check 103b reads it off the DOM and off the markup rather than off the comment that says so"
  - "EACH CONTROL CARRIES data-vw AND NOT data-act, AND A VIEW IS NOT STATE. A data-act would be routed straight into App.ops.dispatch by [S07.1] whatever this region intended; and a view written into a slice would ride in a build code and step under undo. Check 103 reads the WHOLE state back before and after each press and requires it byte-identical, which is checks 72/73's shape — probe AJ drives exactly that violation and the row reddens"
  - "THE VIEW FOLLOWS A FIGHT ACROSS ITS TWO EDGES AND ACROSS NOTHING BETWEEN THEM, and the between-the-edges clause is the whole decision. A region that wrote the view from state.fight on every frame is the TIDIER implementation and it would throw a student who deliberately switched to the board mid-fight — to rule a unit dead, which is what the board is for during a fight — straight back onto the fight on the commit that carries their own ruling"
  - "THE EDGE FLAG LIVES ON THE PAGE AND IS DERIVED, WHICH IS WHY UNDO WORKS FOR FREE. data-view-fg on #app holds '1' while a fight is running as far as [S06.10] has noticed. An undo of startFight arrives at the hook as \"the fight is gone and the flag is up\", which is the closing edge — nothing had to be written into any slice for the view to come back"
  - "THE LABELS ARE \"The board\" AND \"The fight\", NOT \"build view\" AND \"fight view\". During a fight the board region is showing the fight's own markers, so a control labelled \"build\" would be describing something the page is not"
  - "A HELD PRESS ON A VIEW CONTROL NEEDS NO SUPPRESSING, AND THE ANSWER IS WRITTEN RATHER THAN THE SILENCE. [S07.5] closes the keyboard's ramp for [data-fg] and [data-dc] because a held Enter on Advance resolves rounds at the OS auto-repeat rate. A repeated Enter here writes the attribute it already holds and repaints two buttons into the state they are already in: no op, no round, no undo entry, no rebuild. Driven in both browsers with Enter held 400ms — nothing moved, no errors. onFightKeyDown's scope is not widened"
  - "NO EXISTING NUMBERED CHECK WAS EDITED, AND CHECK 93 IS THE ONE THAT WAS OFFERED THE CHANCE. Its private-control floor counts [data-fg] inside #fightbar plus [data-dc] inside #board; #views is a sibling of both, so data-vw is arithmetically outside its claim and the count read 63 before and 63 after. T-05-47 is therefore carried by check 103's own data-act clause instead, read off the page"

patterns-established:
  - "the three-part id rule kept in one change for a fourth time, at a surface that is neither a dialog nor a region a later plan fills — the id, the KNOWN_IDS entry and the stub node together, with the run failing in both directions"
  - "a [C] block that decides which of two page regions paints at all, done with an attribute selector on #app rather than with a property, and the reason recorded at the site"
  - "a numbered check split into a DOM half and a MARKUP half by what each page can honestly answer, with both halves floored on the thing they read being non-empty"

requirements-completed: []

duration: 105min
completed: 2026-08-29
---

# Phase 05 Plan 12: The Fight Becomes a Tab Summary

**D-27's tab is built and the viewport arithmetic four plans in a row were holding
is gone — not smaller, gone, because the fight and the board are never on screen
at the same time; and the projection and the reference band survived the change
by construction rather than by a rule, because `#board` stands in both views and
only the two roster columns are put away.**

## The gate, before and after

| | before (05-10 + the viewport fix) | after |
|---|---|---|
| suite | 1188 passed, 0 failed | **1188 passed, 0 failed** |
| `SUITE_FLOOR` | 1158 | 1158 — **not moved** |
| interaction gate | 160 of 160 | **163 of 163** (+3: 103, 103b, 103c) |
| stub-drift | 111 shell ids | **114 shell ids** (+3, named below) |
| `#app` (setup) | 127, floor 117 | **128** (+1, explained below) |
| `#app` (fight) | 420, `FIGHT_FLOOR` 120 | **421** (+1, same cause) |
| `FIGHT_FLOOR` | 120 | 120 — **not moved** |
| dialogs | 145 across 4 roots, floor 138 | 145 across 4 roots — unchanged, no dialog added |
| proposal pane | 60, floor 23 | 60, floor 23 |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 7522 literals, 0 hits | **7554 literals**, 0 hits |
| perf | 7 ms of 50 | 7 ms of 50 |
| check 93 private-control count | 63 | **63 — unchanged** |
| check 95 controls compared | 147 | **149** (+2, both `=false` on all three boards) |

`node tests/selftest-node.cjs` exits 0.

**`url(` prints 0. `createElementNS|<svg` prints 0. `innerHTML` prints 0.
`text-wrap` prints 0. `counter|balanc|rating` prints 0. The hex pattern over
`[C15]` prints 0. One classic `<script>`, one `<style>`.**

### The two Layer C figures moved by exactly one each, and the cause is one attribute

`#app` 127 → **128** and `#app` (fight) 420 → **421**. Both are the same node:
`aria-label="Which screen"` on `#views`. Layer C harvests accessible names as
well as leaf text, and the stub page copies the attribute because a name present
in one page and absent from the other is precisely the drift section 5b exists
to make impossible — arriving through an attribute rather than through a typo.

**Nothing else moved, and that is worth stating rather than assuming.** The two
visible labels are static markup, so the stub carries no text for them (the
convention `#round-label` and `#fight-head` already ship under) and Layer A
reads them in the document instead. `[S06.10]` renders no string at all.

**`FIGHT_FLOOR` was NOT moved.** The fight harvest gained the same one accessible
name the setup harvest did, and a floor moves when the surface it bounds gains
something roster-independent — plan 05-09's correction and the viewport fix's,
kept.

## What was built

### The three new shell ids

| id | what it is | who fills it |
|---|---|---|
| `views` | the switch root, `role="group"`, `aria-label="Which screen"` | — (static) |
| `view-build` | "The board", `data-vw="build"`, `data-k="vw/build"` | painted by `[S06.10]`, pressed by `[S07.6]` |
| `view-fight` | "The fight", `data-vw="fight"`, `data-k="vw/fight"` | same |

111 → **114**. Each control is a real `<button type="button">` in the shipped
outline-and-tick idiom: the state said in the class (`.vw-on`), in `aria-pressed`
and as a tick that is a **real node** — never in colour alone. Both labels
permanent, visible, 18px.

`#app` ships `data-view="build"` in the markup, so the page is never in an
undecided state on the first frame.

### `[C15] THE VIEW SWITCH`

The last block in the stylesheet. It carries the `.vw-` rules, the frame
(`#board`'s width and computed left margin, **spelled once**, nothing below
writing `margin` again), the three attribute selectors that decide which side
paints, and a named `[C03] EDIT BY PLAN 05-12`.

`#views` takes **no overflow of any kind**, stated at the site rather than
pointed at, because `[C03]`'s gotcha is the one failure in this file that arrives
with no error and no warning.

### `[S06.10]` and `[S07.6]`

`[S06.10]` does three things and there is no fourth: it repaints both controls
from `#app`'s `data-view` every frame (re-decided, never toggled —
`setEditorEnabled`'s rule, which is what makes an undo move it); it follows a
fight across its **two edges only**, using `data-view-fg` as a page-side edge
detector in `#fightbar`'s `data-fg-up` register; and it holds two attributes
each answering exactly one question. It takes **no fingerprint**, and the absence
is written down because every region above it has one: this one writes at most
two attributes and two class names on nodes that already exist, so a signature
would cost more than the work it guarded.

`[S07.6]` is one delegated `pointerdown`/`click` pair on `#views`, both through
`App.boot.wrap`, `isPrimaryPress` on the first and the `e.detail !== 0` guard on
the second. It pushes **one** `LATE_BINDERS` entry and **nothing** into
`UI_ACTS`, and the absence is written down as a ruling rather than left to read
as an oversight.

**Diffs proved empty by line span, not asserted:**

```
[S06] line 1 -> end of [S06.9]      diff EMPTY   (9372-15100 -> 9389-15117)
[S07] line 1 -> end of [S07.5]      diff EMPTY   (15196-18509 -> 15332-18645)
```

### Checks 103, 103b, 103c

- **103** presses each control and reads back `data-view`, both `aria-pressed`,
  both classes, **and the whole state serialised before and after** — which must
  be byte-identical. Plus zero `[data-act]` anywhere under `#views`, read off the
  page (T-05-47).
- **103b** walks up from `#strip` and `#refband` in the stub, **and** slices
  `cats-vs-mechs.html` between the band's own markers for the half the stub
  structurally cannot answer. Both halves floored on what they read being
  non-empty.
- **103c** drives the whole edge sequence including the middle step no other row
  would catch, and finishes with an undo of a `startFight`.

## The browser readings — real Chrome and real Edge, 1920x1080 and 1366x768

**Every number below is identical in Chrome and in Edge.** Not one figure in this
plan differs between the two browsers, at either size.

### The frame agrees with itself in every state

`left/width`, all four elements that use the computed margin:

| state | `#topbar` | `#views` | `.fg-band` | `#board` |
|---|---|---|---|---|
| build, no fight @1920 | 152/1600 | 152/1600 | *(not painted)* | 152/1600 |
| fight view, no fight @1920 | **160**/1600 | **160**/1600 | **160**/1600 | **160**/1600 |
| fight view, fight running @1920 | 152/1600 | 152/1600 | 152/1600 | 152/1600 |
| build view, mid-fight @1920 | 152/1600 | 152/1600 | *(not painted)* | 152/1600 |
| every state @1366 | 14/1322 | 14/1322 | 14/1322 | 14/1322 |

**The 8px in row two is the scrollbar and all four move together.** Pressing
"The fight" with no fight running produces a document exactly 1080px tall — the
first page state in this file *shorter* than the viewport. The scrollbar goes
(measured 15 → 0), the containing block gets 15px wider, and every element using
the one shared formula shifts 8px right in step. Nothing goes out of alignment
with anything. Recorded in `[C15]` so a reader who measures only that state does
not find an unexplained 8px.

### `#strip` — sticky, and what pinning actually does

```
position                              sticky, all eight readings, both views, both browsers
overflow of every ancestor            #board:visible | #app:visible | BODY:visible | HTML:visible
                                      all eight readings

viewport top at page scroll 0/800/1600
  build view @1920x1080               301 -> 107 -> 107     pins and holds
  build view @1366x768                293 ->  99 ->  99     pins and holds
  fight view @1920x1080               906 -> 135 -> 135     see below
  fight view @1366x768                792 ->  99 ->  35     pins, then releases
```

Both fight-view rows are read honestly rather than rounded up to "it pins". At
1080 the fight-view document is only 1851px tall, so a scroll of 800 clamps to
771 and the strip never reaches the offset it would stick at — 135 is where it
lands, not where it sticks. At 768 it does reach it (99) and then releases to 35
at the very bottom, which is plain sticky containment: `#board` is 842px tall in
that view and the strip is 704 of it, so it has 138px of travel and the
containing block runs out. Plan 05-09 measured the same shape from the other side.

### `#refband` — non-zero in both views, and nearer in the one that needs it

| | build view | fight view |
|---|---|---|
| box @1920x1080 | 152/1600, top 3004, height 120 | 152/1600, top **1703**, height 120 |
| box @1366x768 | 14/1322, top 2996, height 120 | 14/1322, top **1514**, height 120 |

REF-03 got straightforwardly better: the reference band is roughly 1300px nearer
the top in the fight view, because the two roster columns are no longer between
it and the page head.

### The `[C03] EDIT` measurement, taken before the rule was chosen

| `#strip`, fight view, one fight running | @1920x1080 | @1366x768 |
|---|---|---|
| auto-placed, no rule (the alternative) | left 152, w **622** | left 14, w **483** |
| pinned to column 2 (the shipped rule) | left 792, w **320** | left 515, w **320** |
| and the build view, for comparison | left 792, w 320 | left 515, w 320 |

Auto-placed, the projection is 622px wide and starts at the board's left edge —
`#board`'s three tracks are explicit, so they all still exist when the items in
them are undisplayed and `#strip` flows into the first `1fr`. Pinned, it is
byte-identical to the box a student has been reading since Phase 3, in all four
combinations.

### The switch driven end to end

Eleven steps, both browsers, both sizes, identical everywhere. `view` /
`data-view-fg` / the two controls' `aria-pressed` + class + computed tick
visibility:

```
 1 at rest                             build  ""   B[true .vw-on / visible]  F[false / hidden]
 2 pressed the fight, no fight running fight  ""   B[false / hidden]         F[true .vw-on / visible]
 3 pressed the board                   build  ""   B[true .vw-on / visible]  F[false / hidden]
 4 startFight through the real control fight  "1"  B[false / hidden]         F[true .vw-on / visible]
 5 pressed the board MID-FIGHT         build  "1"  B[true .vw-on / visible]  F[false / hidden]
 6 advanced a round                    fight  "1"  <- the student had pressed the fight back
 7 endFight                            build  ""   B[true .vw-on / visible]  F[false / hidden]
 8 started again                       fight  "1"
 9 undo of startFight                  build  ""
10 Enter on the board control          build  "1"  activated, view moved
11 Enter HELD 400ms                    build  "1"  nothing moved

pageErrors = []   consoleErrors = []   in all four combinations
```

Step 5 is the between-the-edges clause on a real page: a press of "The board"
mid-fight holds. Step 11 is the held-Enter ruling driven rather than argued.

## The probes

**Both were run after the commit they test, recorded verbatim, and reverted from
a scratchpad `cp` snapshot — never `git checkout --`.**

### PROBE AJ — the switch made to write the view into `state.ui`

Applied: `view: 'build'` added to the `ui` slice's initial value and to
`UI_KEYS`, and `[S07.6]`'s handler made to call `App.ops.setUi('view', want)`
before its page work.

```
FAIL  state contract :: the ui slice holds exactly its documented keys
      actual:   ["kbdNav","revealTok","view"]
      expected: ["kbdNav","revealTok"]
1187 passed, 1 failed

FAIL  interaction gate :: 103. THE SWITCH MOVES THE PAGE AND MOVES NOTHING ELSE. ...
      at rest={"view":"build",...} | after pressing the fight={"view":"fight",...}
      | after pressing the board={"view":"build",...}
      | state byte-identical across press one=false and across press two=true
      | state length=1855 | data-act under #views=0 | data-vw controls=2
INTERACTION GATE: 1 check(s) failed — 103. ...
exit=1
```

**Both predicted rows reddened.** `[S09.3]`'s `ui` key-set row names the key it
did not expect; check 103 names *which press* moved the state. Note the second
press reads `true` — pressing back to the default returns the slice to its
opening value — which is exactly why the row compares **both** presses against
the opening state rather than the two presses against each other.

Reverted; `git status --short` empty; 1188/0, 163/163.

### PROBE AK — `#strip` moved inside `.fg-band`

Applied in the shell **and** in the stub together, because the drift rule binds
both ways and a shell-only move would have been a probe of the harness rather
than of the row.

```
1188 passed, 0 failed          <- the WHOLE SUITE stayed green
FAIL  interaction gate :: 103b. #strip AND #refband ARE IN NEITHER SIDE OF THE SWITCH ...
      #strip inside the switch=false inside #board=false
      | #refband inside the switch=false inside #board=true
      | markup slices, chars: switch=440 band=3996 board=279
      | the band's markup carries #strip=true #refband=false
      | the board's markup carries #strip=false #refband=true
INTERACTION GATE: 1 check(s) failed — 103b. ...
exit=1
```

**103b reddened by name, both halves fired, and it is the only row anywhere in
this repository that noticed.** The suite stayed at 1188/0 with the projection
moved into the fight band — which is the measurement that says row 103b is
carrying PROJ-05's placement on its own.

Reverted; `git status --short` empty; 1188/0, 163/163, 114 shell ids.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 2 — missing critical functionality] The `#strip` column pin had to be
released below 760px**

- **Found during:** Task 1, writing `[C15]`.
- **Issue:** `[C03]`'s own `@media(max-width:760px)` collapses `#board` to a
  single column. `#app[data-view="fight"] #strip{grid-column:2}` would then pin
  the projection to a column that no longer exists, creating an **implicit**
  second track and putting it off to the side of a one-column board. Silent, in
  the same class as the sticky gotcha.
- **Fix:** the plan's own narrow-width query releases the pin
  (`grid-column:auto`) alongside the width/margin reset, with the reason written
  at the site.
- **Files modified:** `cats-vs-mechs.html` (`[C15]`).
- **Commit:** `c61b860`.

**2. [Rule 1 — bug] A banned word reached a new banner**

- **Found during:** Task 2, first run after `[S06.10]` landed.
- **Issue:** `PROJ-06 VIOLATION ... line 15166 [verdict]: verdict` — the region's
  own paragraph about *not* being able to trip the no-verdict gate spelled the
  word. Exactly the failure the file's own Layer A doctrine paragraph describes
  (a gate that reddens on the file's statement of its own rule), arriving from
  the author's side.
- **Fix:** reworded to "the gate that refuses comparative language".
- **Files modified:** `cats-vs-mechs.html` (`[S06.10]` banner).
- **Commit:** `437a245`.

### Decisions taken and recorded rather than deviations

**Check 93 was NOT edited, and the plan anticipated it might have to be.** The
action text said to add `data-vw` to its private-control count *if it reddens*.
It did not, and the reason is arithmetic rather than luck: its two counted roots
are `#fightbar` and `#board`, and `#views` is a sibling of both. Count read
**63 before and 63 after** (read by temporarily flooring the row at 99999, then
reverting from the snapshot — same discipline as the probes). `section_ownership`'s
"edits no existing numbered check" therefore holds exactly.

**`requirements-completed` is empty, deliberately.** The plan's frontmatter names
`PROJ-05, REF-03, FIGHT-09, UX-02`.

- `REF-03` and `UX-02` were already **Complete** in `REQUIREMENTS.md` and this
  plan upholds both; nothing to mark.
- `FIGHT-09` ("what remains to spend is unambiguous at a glance") is **not**
  served by this plan at all — D-27's live resource preview is plan 05-14's, and
  the spent-reads-zero finding recorded as limitations entry 30 is still standing.
- `PROJ-05` is served **structurally** here and is not yet closeable: the
  projection is in the fight view and keeps its exact box, but at scroll 0 in the
  fight view it starts at 906 of 1080 and at 792 of 768, which is a question about
  the fight column's height — and that column is rewritten by 05-14 and grown by
  05-15. Marking it complete now would be marking it against a page that is about
  to change twice.

Marking any of the four would have been papering over. Recorded here instead.

## What the next plans owe

**Plans 05-14 and 05-15 both owe a re-measure of every number in this summary's
sticky table.** They are recorded in `[C15]` as a **control run** — proof that
the tab lays out, that the frame agrees with itself and that the projection keeps
its box — and explicitly **not** as settled dials. `[C14]`'s 736px basis,
`[C14.1]`'s 34vh bound and `.ld-list`'s 46vh were all left exactly where they
were, because all three are measured against a column 05-14 replaces.

The one number worth naming for them: **in the fight view the projection starts
below the fold at 1366x768 (top 792 of 768) and 174px visible at 1920x1080 (top
906 of 1080).** That is not a regression — the same band sat above the same board
before this plan — and it is not this plan's dial to turn. It is the number the
fight column's new height decides.

## Known Stubs

None. Every node this plan adds is painted by `[S06.10]` on the first frame and
on every frame after it, and neither control is ever disabled.

## Threat Flags

None. No network endpoint, no auth path, no file access and no schema change:
this plan adds two buttons that write one attribute on `#app` and one CSS block
that reads it. `T-05-47` through `T-05-50` are all mitigated and each is read
back off the page by a numbered row (103, 103b) or measured in two browsers
(`#views` takes no overflow; `#strip`'s ancestors all read `visible`). `T-05-51`
is accepted as planned and the stub spellings were copied from the markup.
`T-05-SC`: **zero packages installed** — Playwright was resolved from the
existing dev-only install through `PLAYWRIGHT_DIR`, and every driver used lives
in the scratchpad and is not committed.

## Commits

| Task | Commit | What |
|---|---|---|
| 1 | `c61b860` | the switch in the shell, `[C15]`, the three ids in `KNOWN_IDS` and in the stub, `[S00]`'s map and its stylesheet sentence amended |
| 2 | `437a245` | `[S06.10]`, `[S07.6]`, `App.render.viewSwitch`, checks 103 / 103b / 103c |

## Self-Check: PASSED

```
FOUND: cats-vs-mechs.html
FOUND: tests/selftest-node.cjs
FOUND: .planning/phases/05-fight-loop-playtest/05-12-SUMMARY.md
FOUND: c61b860   feat(05-12): the view switch in the shell, [C15], and its three ids
FOUND: 437a245   feat(05-12): [S06.10] and [S07.6] - the switch paints, presses and follows a fight

node tests/selftest-node.cjs   exit 0
  1188 passed, 0 failed
  stub-drift gate: 114 shell ids, all built by the stub page
  interaction gate: 163 of 163 checks passed
  Layer A 18 words 0 hits | Layer B 7554 literals 0 hits
  #app 128 | #app (fight) 421, FIGHT_FLOOR 120 | dialogs 145/4 | proposal 60
```
