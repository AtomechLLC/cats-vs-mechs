---
phase: 05-fight-loop-playtest
plan: D37
subsystem: fight-surface
tags: [d-37, d-36-supersession, s06-15, c14-7, s07-5, s06-11, fight-07, d-00d, d-29, d-33, d-35, hand-rulings, keyboard]

requires:
  - phase: 05-fight-loop-playtest
    plan: D36
    provides: "the five hand-ruling writers, fgnRulable / fgnKey / fgnBoundSaid / fgnText / fgnPlace, the three document-level listeners (elsewhere, Escape, scroll-follow), fgAnyHalfMade, the static-shell-and-focus argument, and deferred items 17 and 18 — which named the conditions this plan meets"
  - phase: 05-fight-loop-playtest
    plan: 15
    provides: "[S06.11] the battlefield, bfTokenIds / bfAmount / bfBuildUnit, and the shape as a real <button> carrying the fg/bf key contract"
  - phase: 05-fight-loop-playtest
    plan: 10
    provides: "the MEASURED focus finding — a pointer press on a control whose own node is REBUILT drops the keyboard to <body> — which is why this region carries a fingerprint"
  - phase: 05-fight-loop-playtest
    plan: D29
    provides: "[S06.12]'s symQty / symQtyRow / symBox and the data-tsay exemption channel, so a unit's values are drawn in the file's one symbolic notation with the prose on a scanned tooltip"
  - phase: 05-fight-loop-playtest
    plan: D35a
    provides: "tokenBounds() and the clamp-at-write-time discipline every write path keeps"
provides:
  - "[S06.15] RENDER — THE UNIT POPUP: one box, one unit's rows at a time, built once per (side, unit, token list) and written every frame"
  - "[C14.7] the .fgu- rules, position:fixed at z-index 40 with --fgu-x / --fgu-y"
  - "[S07.5] pressUnit / fgUnitRule / pressUnitNudge / pressUnitAlive / fgUnitShut / fgUnitArrow / fgUnitShape, and onDocPress split into two arms"
  - "[S06.14] fgBoxAt — the placement arithmetic lifted out so two fixed boxes cannot drift apart"
  - "the shape's press with TWO JOBS separated in time: at rest it opens the popup, armed it retargets"
  - "checks 92c, 121 and 122 in the gate; cells 26g and 26h in the browser suite; rows 57, 104e, 106g, 118, 119, 120 and cells 26, 26b, 26c, 26e, 26f turned in the open"
  - "deferred items 17 and 18 CLOSED, each with the resolution named"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "a transient form selection held on ATTRIBUTES of the node it belongs to, written by [S07] and read by [S06] — fgSettle's arrangement, taken for a fifth surface"
    - "build-once-per-fingerprint as the FOCUS contract where static shell is impossible, because the list's length is a student's decision"
    - "one control with two jobs separated in TIME rather than two controls separated in space"
    - "a fixed box placed by arithmetic shared between callers, each publishing its own custom properties as literals so an in-context source scan stays honest"

key-files:
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/deferred-items.md

decisions:
  - "The popup is a fixed box in the shell and NOT a <dialog> — a modal is centred and has no elsewhere, and a sibling of #app is outside Layer C's fight harvest"
  - "It lives inside #fightbar so its strings ride the existing fight harvest, and a new row DRIVES IT OPEN before taking that harvest"
  - "The rows are built, not shell — so the focus contract is carried by a fingerprint of the side, the unit and the token LIST, never a number"
  - "Deferred 17 is closed by a DIFFERENT control than the one it priced, and the entry says so"
  - "Deferred 18 is closed by its own answer 3; answers 1 and 2 are explicitly not taken and the battlefield's hide pass is untouched"
  - "The popup may cover the sticky top bar and does not cover its own unit — the alternative was measured on a picture and rejected"

metrics:
  duration: one session
  completed: 2026-09-01
---

# Phase 5 Plan D-37: The unit popup — Summary

Clicking a unit on the battlefield opens a popup for that unit holding every value it has —
health, shield, every unit-scope tally the student authored **including the ones sitting at
zero**, and the dead marker — each drawn in D-29's symbols with the prose on a scanned tooltip,
each editable through the shipped ruling ops, and the whole thing operable from the keyboard.
D-36's per-reading nudge on the battlefield is removed in the same change and the record says so.

## What the developer asked for

> click on a unit then click on the popup window to modify the values associated with it

---

## 1. The supersession, done openly

D-37's own interpretation is the instruction and it is quoted at every site that acts on it:

> This supersedes D-36's per-reading nudge ON THE BATTLEFIELD — the readings there return to
> being readings, the unit shape's click opens the popup, and the nudge lives inside it. The
> team-resource direct click stays as D-36 built it.

**Three places in the artifact acted on it, and none of them deleted the argument they replaced.**

| what changed | how | why the paragraph stayed |
|---|---|---|
| `bfBuildUnit` no longer writes `data-fg`, `data-fg-side`, `data-fg-unit`, `data-fg-tok` or a key on a `.bf-line` | the four-attribute block is gone; the comment that argued the `closest()` hit test is REWRITTEN in place to record what withdrew its premise | the mechanism worked; the requirement changed. 03.1-04's register. |
| `[C14.6]`'s `.bf-line[data-fg="res"], .fg-res[data-fg="res"]` | narrowed to `.fg-res[data-fg="res"]` | the rule's own paragraph argued "two surfaces, one affordance"; one of the two stopped existing, and a selector kept for a node that is never built is the dead rule `[C12]` refuses |
| `pressRes`' opening delegation to `pressBf` while armed | deleted | nothing carrying `data-fg="res"` is inside a `[data-fg="bf"]` any more, so the branch could only be dead code inside a handler. **The RULE it enforced is not lost** — `pressBf` enforces it now, over the whole shape rather than only over a reading, which is strictly wider |

**`fgnRulable`, `fgnKey`, `fgnBoundSaid`, `fgnText`, `#fg-nudge`, `[S06.14]` and all five D-36 ops
are untouched.** The team resources are still direct controls and browser cell 26d still drives
their keyboard round trip end to end.

---

## 2. Why it is a fixed box in the shell and not a `<dialog>`

The file has two popup idioms and the choice was made rather than defaulted. `[S06.5]`'s four
`<dialog>`s were weighed and declined for three reasons that are each a **requirement of D-37**:

1. **"positioning near the unit".** A `showModal()` dialog is centred in the viewport by the user
   agent and has no anchor concept; placing one at a shape means overriding its position anyway,
   which is this box with extra machinery.
2. **"click-elsewhere dismiss".** A modal dialog has no *elsewhere* — the backdrop swallows every
   press outside it, and light dismissal is not something `showModal()` offers. `#fg-nudge`'s
   document-level `pointerdown` handler already implements exactly the dismissal D-37 asks for
   and is reused.
3. **The harvest.** A `<dialog>` in this shell is a **sibling of `#app`**, so its words are
   outside Layer C's fight scan and would need a `DIALOG_ROOTS` entry, an opener to drive and a
   floor of its own. `#fg-unit` is inside `#fightbar`, which is inside `#app`.

**So it is not a harvest root, and that was decided consciously rather than by omission.** The
decision costs something and the cost is paid: the popup is **empty and hidden at rest** — its
rows are thrown away on every shut — so a harvest over the default fight page reads not one word
of it. Row **92c** therefore *drives it open* and harvests a third time. That is the wave-1
lesson for the third time in one block: a surface the walk never reaches reports clean forever.

---

## 3. The region: [S06.15], and the one thing it could not copy

`#fg-unit` is four static nodes — the box, the heading, a text-labelled Close and an **empty**
row container. The rows are BUILT, and that is the one place this region could not simply follow
`[S06.14]`.

`#fg-nudge` answered plan 05-10's measured defect ("a POINTER press on any control whose own node
is REBUILT drops the keyboard to `<body>`") by being eight static nodes. **A popup cannot: a unit
carries a different number of values on every board.** So it answers the same defect with a
FINGERPRINT — `JSON.stringify([side, unitId, tokens])`, the token **list** and never a number —
so a nudge repaints values and rebuilds nothing.

**Probe G put the rebuild back and four browser cells went red, and only one clause caught it.**
That is worth writing down, because it is the shape of a hole this repository has now found four
times:

```
probe G: rows rebuilt on every frame
26b reads   hp 4 -> 1 ..... still true      (the number moved)
            3 rulings ..... still true      (all three presses landed)
            focus on the − .. still true    (withPreservedFocus restored it by key)
            same node ...... FALSE          <- the only reading that saw it
```

`withPreservedFocus` finds the new node by key and Playwright's 110 ms between clicks is long
enough for the frame to land, so the three readings D-36's cell was built on all stayed green
over a control that was being destroyed under the pointer. **The node-identity clause is the one
that bites**, and it is in the cell for that reason.

### What each row draws

`bfTokenIds` is CALLED, not restated, so the popup holds exactly the values the battlefield draws
for the same unit in the same order. Each value row is `label | − | reading | +` on a grid, so the
`−` and `+` line up straight down the column whatever the labels are called; the dead marker's row
carries `[S06.9]`'s own toggle instead of a pair. The reading is `[S06.12]`'s `symQty` — the
student's shape, their colour, their glyph, `COMPACT_AT`'s compaction, D-21's count form for a
zero, `title` and `aria-label` written from one variable, and `data-tsay` carrying the student's
fragment so the artifact's half of every sentence stays in the scan and theirs never reddens CI.
The bound sentence is `fgnBoundSaid` — **the same function the team-resource nudge uses**, so a
student who met that sentence on a pool meets it unchanged here.

### The dead marker

D-37: *"The dead marker toggle joins the popup as one of the unit's values (its board-tab control
remains)."* It dispatches `setAlive` and says the state in `DC_ALIVE_WORDS` — `[S06.9]`'s own
pair, read rather than reinvented — so D-33 P3-2's ruling is inherited whole: **the act when
unpressed ("Mark dead"), the state when pressed ("Marked dead")**, with `aria-pressed`, the class,
the word and a real tick all written from ONE reading so they cannot contradict each other. Browser
cell 26g reads the tick's *computed visibility*, not just its presence.

---

## 4. The line held: rulings never write the standing flag

D-00d is the file's oldest ruling and it is the line this surface must not cross. **Driven, not
asserted:** health is taken from 3 to 0 through the popup's own `−` and the unit is still standing
at the bottom, with the survivor count unmoved at `9 of 9`.

```
check 121 (node)      hp 3 -> 0, alive true, standing 9, hand 3
                      the 4th press: hp 0, hand STILL 3, the bound said, panel shut
browser 26b / 26c     hp 4 -> 1 -> 0, alive true, standing 9, in all four columns
```

**Probe F made `fgUnitRule` write `alive:false` when health reached zero and check 121 went red.**

Every ruling lands in `hand` and reads back off the ledger: browser cell 26f advances the round
and reads the "Set by hand this round" list with two of its three entries now made in the popup —
`Health set by hand, 4 to 3.`, `Chill set by hand, 2 to 1.` and, from the team resource,
`Action points set by hand, 3 to 2.` naming the FACTION rather than a unit. **D-37 moved a control
and not a record**, which is what that cell is for.

---

## 5. The keyboard round trip, end to end — deferred 17, closed

D-36 wrote down that a unit's numbers had **no** keyboard route from the fight tab, and the reason
was a content model rather than a choice: a `.bf-line` is a `<div>` inside `.bf-unit`, which is a
`<button>`, and `<button>`'s content model allows neither an interactive descendant nor a
`tabindex` one. D-37 deletes the nesting, so the constraint stops existing.

Browser cell **26h** drives it with a REAL Tab rather than a stand-in for one, in real Chrome and
real Edge at both viewports, identically in all four columns:

```
the keyboard on the shape          BUTTON   data-k="fg/bf/cats/c4"
Enter                              open on c4, focus on fg/u/cats/c4/hp/less
Enter                              health 3 -> 2, one hand ruling
ArrowUp / ArrowDown                3, then 2   — the KEY decides the sign, not the button
Tab, Tab, Tab                      fg/u/cats/c4/hp/more, shield/less, shield/more
Escape                             shut and emptied, focus back on fg/bf/cats/c4
```

The arrows are new and the paragraph at `fgUnitArrow` says why they exist, why `preventDefault` is
called only on a press this handler claimed, and why a held arrow is the same bargain the pointer
already makes (one commit per repeat, one undo entry per `COALESCE_MS` window).
**Probe E disabled them and check 122 went red.**

Three ways out, all driven: the text-labelled **Close** (UX-02 — Escape and a press elsewhere are
both invisible), **Escape**, and a **press elsewhere**.

---

## 6. Deferred 18, closed — and by its own answer 3

That entry wrote out three admissible answers and called each a design decision. The developer made
it by asking for the third: *"give the nudge box a way to reach the whole unit rather than one
reading."*

**Answers 1 and 2 are explicitly NOT taken.** The battlefield's hide pass is untouched; D-33
P2-11's rule still governs the board alone. What changed is that the battlefield is no longer where
a unit's numbers are ruled on. Both halves are measured, and the second half needs real layout:

```
check 121   (node)     shield driven to 0; the popup's shield row present, "Cat 1 Shield, 0.",
                       one press of its + writes {unit:c1, tok:shield, 0 -> 1}
cell 26g  (browser)    the battlefield's shield line: hidden=true, height=0px  <- the defect,
                       photographed by the layout engine, in all four columns
```

**Probe C reintroduced the hide inside the popup**: checks 92c and 118 went red and the run then
**died** at 121, where it presses a `+` the popup no longer draws. That crash is the reading, and
the 118-122 banner says so in as many words: a row that presses a control which no longer exists
cannot fail politely.

---

## 7. The shape's two jobs, separated in time

D-37 settles the collision in its own parenthesis: *"Clicking a unit on the battlefield (AT REST —
a half-made retarget still owns the battlefield) opens a popup for THAT unit."*

|  | at rest | while a change of target is half made |
|---|---|---|
| **a press anywhere on a shape** | opens that unit's popup; declares nothing | retargets if lit; declines quietly if not. **Nothing opens.** |

`fgAnyHalfMade` — the function D-36 wrote after a real centre click found its nesting collision —
moved one function up into `pressBf`, where it now covers the whole shape rather than only the
readings on it. **It is `fgAnyHalfMade` and not "a flow that may point HERE"** deliberately: a
change half made on the pressed unit's own side cannot complete on that shape, but a popup opening
under a student's hand on one of the two columns while they are mid-flow reads as broken.

**Probe B removed the guard: checks 104e, 104f and 120 went red.**
Browser cell 26e drives the same thing with a real centre click — the exact pixel that caught
D-36's collision — and reads the popup in all four moments.

---

## 8. Placement, and what the pictures found

`fgBoxAt` is the placement arithmetic lifted out of `fgnPlace` so the two fixed boxes cannot drift
apart: below the anchor, above it when there is no room, clamped into the viewport on both axes.
Each caller publishes its own pair of custom properties **as literals**, because check 57 reads
every inline-style access *in context* and a shared publisher taking the prefix as an argument
would hold the count at four and defeat the reading.

**Three things only pictures showed.**

1. **The value cell was left-aligned**, so a one-token reading sat hard against the `−` with the
   `+` a hand's width away and the pair did not read as a pair. Centred. No assertion in either
   suite could have seen it.
2. **A popup opened on an edge unit flips ABOVE the shape** and stays wholly on screen — the
   leftmost cat at 1920x1080 and the rightmost mech at 1366x768, both photographed and both read
   back. Cell 26g asserts it.
3. **At 1366x768 the rightmost mech's popup reaches up over `#topbar`.** The obvious fix — clamp
   the top to the bar's measured foot — was tried on paper and **rejected on the picture**: pushed
   down by the bar's height, the box lands ON the very shape it was opened on. Covering a sticky
   bar while a transient is open is ordinary popup behaviour and one press dismisses it; covering
   the unit whose numbers it is showing is a defect. The trade is written into `[C14.7]`.

Screenshots, four columns each: `d37-popup-*` (the box alone), `d37-clamped-*` (the refusal),
`d37-inplace-*` (the whole viewport), `d37-armed-*` (the lit roster with nothing open),
`d37-edge-leftmost-*` and `d37-edge-rightmost-*`.

---

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — Bug] The shut popup left a unit's words on the page**
- **Found during:** the first run of the turned row 104e, which requires `#fightbar`'s rendered
  text to be identical before a press and after the box is shut.
- **Issue:** `fguShut` hid the box and cleared its two attributes but left the rows built, so a
  shut popup kept the last unit's name, its type names and its bound sentences in the DOM — read
  by Layer C, counted by every floor over it, and describing a unit nobody had open.
- **Fix:** `fguShut` throws the rows away and clears the fingerprint with them (a stale
  fingerprint over an empty container would make the next open skip its own build).
- **Driven by:** checks 104e, 106g, 122 and 92c. **Probe D** put the rows back and three went red.

**2. [Rule 3 — Blocking] A comment in the artifact tripped the check it was explaining**
- **Issue:** check 57 counts every inline-style access by scanning the source, **comments
  included**. A new paragraph explaining that row wrote the accessor out in prose, and the first
  drive came back at **7** where 6 were expected, printing that sentence back as one of the sites.
- **Fix:** the comment DESCRIBES the accessor rather than spelling it — `[C14.4]`'s and
  `refCard`'s shipped rule, arriving from the other side. The row was right and the artifact was
  changed. Both the finding and the rule are written at the site and in the row.

**3. [Rule 1 — Bug] A drive wrote the build slice and read the fight slice**
- **Found during:** the first run of check 121.
- **Issue:** the drive set the shield to zero with `setUnitShield`, which writes the ALLOCATION;
  a fight already running reads its own copy, so the popup correctly showed 2 and the row was
  right to fail. FIGHT-10's division, in a test.
- **Fix:** `setFightShield`. The correction is written at the site.

### Nothing else deviated

Ops, codec, `DEFAULTS` and `WIRE_BOUNDS` untouched — this plan adds no op, no state key and no
`ui` key, which is why the in-file suites are unchanged at **1336** and why `[S09.3]`'s pinned
`ui` key set already covers the absence. No new hex, no `url(`, no namespaced markup or element
constructor, no `innerHTML`, no `data-act`. Nothing on either surface is disabled. No verdicts.

---

## Moves recorded, with D-37 cited

| what moved | from | to | why |
|---|---|---|---|
| `[S06.11]`'s `.bf-line` press target | four attributes and a key | none | D-37's own instruction, quoted at the site; the paragraph that argued the hit test is rewritten in place rather than deleted |
| `[C14.6]`'s reading-as-press-target rule | `.bf-line[data-fg="res"], .fg-res[data-fg="res"]` | `.fg-res[data-fg="res"]` | half of "two surfaces, one affordance" stopped existing |
| `pressRes`' armed delegation | a branch | deleted, and the rule moved to `pressBf` | it could only be dead code; `pressBf` enforces it over the whole shape, which is wider |
| check 57's inline-style allowlist | 4 accesses, `--topbar-` and `--fgn-` | **6**, plus `--fgu-` | an offset that places a popup beside the unit it edits is not "a FIGURE drawn with a length", which is the row's own test |
| checks 104e and 106g | "a battlefield press at rest moves nothing and opens nothing" | it opens that unit's popup and **commits nothing** — state byte-identical, page moved, box open on the unit pressed, Close puts the text back | strictly stronger: the old clause could not tell a popup that opened from one that did not |
| check 118 | every reading on every unit is a control | the battlefield's lines are counted and **none** is pressable; the team resources still are; **three** key spaces intersected pairwise | the supersession, measured rather than described |
| check 119 | four reading classes | the two D-37 leaves standing | the other two are asserted in 121 instead — nothing stopped being asserted |
| check 120 | reading-versus-shape, in space and in time | the shape's two jobs, in time | there is nothing nested left to separate |
| browser cells 26 / 26b / 26c / 26e / 26f | the battlefield's readings | the popup, and the team resources for what stays | 26d untouched |
| `KNOWN_IDS` + stub nodes | 153 shell ids | **157** | four static nodes, both directions, in the same change |
| gate rows | 207 checks | **210** | 92c, 121, 122 |
| browser cells | 286 | **294** | eight cells per column, four columns |

**Floors held, unmoved:** `DIALOG_FLOOR` 138, `FIGHT_FLOOR` 248. The base `#app` scan moved
186 → 187 (the popup's static "Close") and the fight harvest 692 → 693; the popup-open harvest
reads **715**.

---

## The gates

```
selftest 1336 passed, 0 failed          (was 1336/0 — no op, no state key, no codec change)
stub-drift gate: 157 shell ids          (was 153)
interaction gate: 210 of 210            (was 207/207)
browser checks: 294 passed, 0 failed    (was 286/0)  headless, chrome + msedge, 1920x1080 + 1366x768
```

Every reading in the browser table is **identical in all four columns**.

## Six mutation probes, each reverted from a scratchpad copy taken after the commit

| probe | what it broke | what went red |
|---|---|---|
| A | D-36's per-reading press target put back on a `.bf-line` | check 118 |
| B | the popup opens even while a change of target is half made | checks 104e, 104f, 120 |
| C | the popup hides a value sitting at zero (deferred 18's defect, restored) | checks 92c and 118, then the run **dies** at 121 pressing a `+` that is not drawn |
| D | a shut popup keeps its rows | checks 92c, 104e, 122 |
| E | the arrows stop nudging | check 122 |
| F | a ruling writes `alive:false` when health reaches zero (D-00d, broken on purpose) | check 121 |
| G | the popup's rows rebuilt on every frame (05-10's defect, restored) | browser cell 26b — **all four columns**, and only its node-identity clause |

No probe was left in the file: `cats-vs-mechs.html` is byte-identical (md5
`964999d0cc2ff7b3160817502b5c6aee`) to the copy taken immediately after the feature commit.

## Pictures, read back

Six per column, both viewports, both browsers. Read back: the box sits under Cat 1 without
covering it, the four rows read `Health − ▪ +`, `Shield − ▪▪ +`, `Chill − ▲▲ +` and
`Dead marker 0× ▬ / Mark dead` at both sizes, the refusal shot shows `Health − 0× ▪ +` with
*This board keeps this number between 0 and 4.* under it, the armed shot shows nine lit cats
saying **Pick** with **nothing** open, and both edge shots show the popup flipped above its unit
and wholly on screen. The survivor line still reads **9 of 9 still standing** with a cat on zero
health — D-00d, in a photograph, for the second plan running.

## Known Stubs

None. Every value the popup draws is wired to the live fight slice through `bfAmount` and every
control in it dispatches a shipped op.

## Threat Flags

None. No new network surface, no new auth path, no new file access, and no schema change at a
trust boundary. The two attributes and the token id that reach an op go through `requireSide`,
`requireTokenId` and `tallyType` — the boundaries `setTally` has run since Phase 2.1 — no caller
string is interpolated into a selector anywhere in this change (both anchor lookups walk and
compare), and the prototype is asserted intact after every hostile drive.

## Self-Check: PASSED

- `FOUND: cats-vs-mechs.html` — `[S06.15]`, `[C14.7]`, `#fg-unit`, `fgBoxAt`, `pressUnit`,
  `fgUnitArrow`, all present; `data-fg="res"` absent from `bfBuildUnit`
- `FOUND: tests/selftest-node.cjs` — checks 92c, 121, 122 present; 157 shell ids; 210/210
- `FOUND: tests/browser-checks.mjs` — cells 26g and 26h present; 294/0
- `FOUND: .planning/phases/05-fight-loop-playtest/deferred-items.md` — entries 17 and 18 closed
- `FOUND: 6b6dd99` feat(05-D37) — the popup, its handlers and the supersession
- `FOUND: 7dd5de0` test(05-D37) — the turned rows and cells, and the popup's own
- `FOUND: b423375` docs(05-D37) — deferred 17 and 18 closed
