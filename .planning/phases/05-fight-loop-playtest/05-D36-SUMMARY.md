---
phase: 05-fight-loop-playtest
plan: D36
subsystem: fight-surface
tags: [d-36, s05-ops, s06-14, s07-5, c14-6, fight-07, fight-08, d-00d, d-35, hand-rulings]

requires:
  - phase: 05-fight-loop-playtest
    plan: 05
    provides: "the hand-ruling group and its banner, `ruled()` and the round's `hand` list, setUnitHp / nudgeFightHp / setFightShield / setAlive, MAX_HAND_RULINGS — and setFightShield's own paragraph, which reserved nudgeFightShield by name and named the condition under which it would be written"
  - phase: 05-fight-loop-playtest
    plan: 10
    provides: "the MEASURED focus finding — a pointer press on a control whose own node is REBUILT drops the keyboard to <body> — which is the whole reason this control is static shell; and the controls-missing list this plan closes"
  - phase: 05-fight-loop-playtest
    plan: 15
    provides: "[S06.11] the battlefield, its per-unit shapes, bfAmount, and the fg/bf key contract [S07.5] fixed in writing"
  - phase: 05-fight-loop-playtest
    plan: D31
    provides: "the round-STATE panel the readings live in, and the two column roots FIGHT_STATE_IDS names"
  - phase: 05-fight-loop-playtest
    plan: D35a
    provides: "bounded() / tokenBounds() and the clamp-at-write-time discipline every write path in this file keeps"
provides:
  - "[S05] five new hand-ruling writers: nudgeFightShield, setFightAp, nudgeFightAp, setFightTally, nudgeFightTally — with dispatch arms and exports"
  - "the ruling record's SIDE-SCOPE shape: `unit: null` for a pool or a side-scope tally, and [S06.8]'s ldHandWho arm that says the faction's name for it"
  - "[S06.14] RENDER — THE RESOURCE NUDGE: one static control moved to whatever reading was pressed, value / names / bound sentence / position written from state every frame"
  - "[S06.7]'s team-resource row as a real <button>, and [S06.11]'s battlefield lines as data-fg=\"res\" press targets, on one key spelling (fgnKey)"
  - "[S07.5] pressRes / pressNudge / fgAnyHalfMade / the three document-level handlers (elsewhere, Escape, scroll-follow)"
  - "[C14.6] the .fgn- rules, position:fixed with --fgn-x / --fgn-y"
  - "[S06.9]'s by-hand marker widened to a unit's tally rows"
  - "checks 118/119/120 in the gate, cells 26-26f in the browser suite, and stub fidelity for #id selectors and per-node style"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "a transient form selection held on ATTRIBUTES of the node it belongs to, written by [S07] and read by [S06] — fgSettle's arrangement, taken for a fourth surface"
    - "static shell + write-every-frame as the ANIMATION-and-FOCUS contract rather than a performance one"
    - "position:fixed with the offsets published as custom properties, so the stylesheet keeps the rule and the script supplies only the measurement"

key-files:
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/deferred-items.md

decisions:
  - "The ruling record gains a null `unit` for side-scope numbers rather than a sentinel string or a second list"
  - "While a change of target is half made, the WHOLE battlefield belongs to the retarget flow — the separation is in time as well as in space"
  - "MAX_HAND_RULINGS does not move; its arithmetic becomes a floor and the paragraph says so"
  - "The battlefield's readings are a pointer affordance; the keyboard route exists on the team resources and the structural fix is deferred with a price on it"

metrics:
  duration: one session
  completed: 2026-09-01
---

# Phase 5 Plan D-36: Click a resource to rule on it — Summary

Clicking a resource reading on the fight tab — a unit's health, shield or tally on the
battlefield, or a number the side holds — opens a small inline `− value +` at that spot, and every
press through it is a hand ruling: one commit, one entry in the round's by-hand record, clamped by
the type's own D-35 bounds, with no verdict anywhere.

## What the developer asked for

> add the ability to directly click on a resource to directly modify the value of that resource in
> the current round

Four things fell out of that sentence and all four are in the artifact now.

---

## 1. The ops: five writers, and one of them had been promised by name

The interpretation names "setUnitHp / nudgeFightHp / setFightShield / **the fight tally
writers**". The first three shipped in plan 05-05. **The fight tally writers did not exist** —
`setTally` and `nudgeTally` write the BUILD slice, and there was no fight-slice writer for a
tally at either scope, nor for the pool. So five were added, inside plan 05-05's own hand-ruling
group and under its banner:

| op | what it writes | record |
|---|---|---|
| `nudgeFightShield(side, unitId, delta)` | the fight shield, ± | `{ side, unit, 'shield', from, to }` |
| `setFightAp(side, value)` | the side's pool | `{ side, **unit: null**, 'ap', from, to }` |
| `nudgeFightAp(side, delta)` | the side's pool, ± | as above |
| `setFightTally(side, unitId, tokenId, n)` | a tally at either scope | `{ side, unit-or-null, tokenId, from, to }` |
| `nudgeFightTally(side, unitId, tokenId, delta)` | as above, ± | as above |

**`nudgeFightShield` is the sibling `setFightShield`'s own paragraph reserved two phases ago** —
"the day a surface carries the pair, the sibling is eight lines in nudgeFightHp's exact shape and
this paragraph is what tells the next author it was considered." That paragraph is quoted rather
than deleted, in the 03.1-04 register: it named the condition under which it would stop being
true, and the condition arrived.

**The tally pair reuses `tallyOwner`, `tallyType`, `readTally` and `writeTally` rather than
copying them.** `tallyOwner` is written against a container with a `[side]` holding `units`, which
is true of the build slice and true of the fight slice alike — so "which record carries this
number" is answered in one place for both, and rules 1 and 2 (a tally of zero deletes its key; a
bag with no keys deletes itself) hold on the fight slice exactly as on the build one. The
alternative was a second copy that could decide a side-scope type lives somewhere else on one of
the two slices.

### Two paragraphs in the ops turned in the open

- **"No hand op takes a token id."** True of the four that shipped; false the moment a student can
  rule on a tally. The property is narrowed rather than dropped: the five ops that write a number
  the board is built on still write `tok` themselves from a fixed set, and the two tally ops take
  an id that goes through `requireTokenId` and `tallyType` before it reaches the record — the same
  boundary `setTally` has run since Phase 2.1. **[S09.12]'s claim was replaced too**: every `tok`
  in the record must name a type the live vocabulary holds, which is the wider assertion in place
  of the count of three.
- **`MAX_HAND_RULINGS`' arithmetic.** "One ruling for every rulable number on every unit" is no
  longer 144. **The constant deliberately does not move**, and the reason is written at the site: it
  is a bound on a RECORD, sized by what thirty stringified snapshots cost (8529 bytes, measured by
  05-05), not a ruling on what a student may do. Nothing refuses a 145th ruling; the oldest leaves.
  Raising it is one number and a measurement, and the paragraph says so.

---

## 2. The record grew a side-scope shape, and one region gained an arm for it

A pool belongs to the column it is drawn in and to no unit, so `unit` is **null**. That is a real
answer, not a missing one — but `ldUnitName(state, null)` returns the string `"null"`, and the
ledger would have printed that at a student in the one panel they are told to read.

`[S06.8]` gained **`ldHandWho`**: a unit's name where there is a unit, and `state.build[side].name`
where there is not — `ldNowSide`'s own read, so the ledger names a side the same way in both of its
lists. Read live, so a faction renamed on round nine lands on round one's row.

`[S06.9]`'s **by-hand marker** was widened the same way and for the same reason. `DC_RULABLE`'s own
paragraph said a tally row is not decorated "and that is correct rather than an omission — no hand
op can write one." A hand op can write one now, so `dcMarkCard` decorates the unit's tally rows as
well — **reading the ids off the page's own `data-amt` rather than out of the vocabulary**, which
keeps that comment's actual rule (no student text anywhere near a selector string) exactly intact.
What is still **not** marked, said out loud in the comment: the SIDE's numbers, because there is no
side-scope row on a unit card to hang a marker on. Those two are shown on the fight tab's own
reading and in the ledger's by-hand list.

---

## 3. The control: [S06.14], and why it is static shell

`#fg-nudge` is eight nodes of static markup inside `#fightbar`. `[S06.14]` moves it, fills it and
hides it; it creates and destroys nothing, on any frame.

**That is not tidiness, it is plan 05-10's measured finding.** "A POINTER press on any control
whose own node is REBUILT drops the keyboard to `<body>`" — `withPreservedFocus` restores focus
during `pointerdown`, and the browser's own default focus-on-mousedown then targets a node the
rebuild has detached. A nudge repaints on **every** press by construction, so a
built-where-it-appears control would lose the button under the student's finger on the first press
and a rapid `−−−` would land one of three. **Probe D put the rebuild back and three browser cells
went red in all four columns.**

What lives on the box: three attributes saying which reading is open (`data-fg-side`,
`data-fg-unit`, `data-fg-tok`), written by `[S07.5]` and read by `[S06.14]` — `fgSettle`'s
arrangement, one writer and one reader, taken for a fourth surface. `[S09.3]` pins the `ui` key set
exactly, so there is nowhere legitimate for a fourth key there.

What is written every frame: the owner's name, the type's name (on its own node carrying `data-lbl`,
because that is where a student's word reaches this page), the number read straight out of the
slice, both accessible names with `data-albl` beside them, the bound sentence, and the position.

**The position is two custom properties and not an inline length.** `--fgn-x` / `--fgn-y`, published
on the box, read by one rule in `[C14.6]`. Check 57's allowlist was widened **in the open** from 2
accesses to 4, and its own words are the test it passes: what that row forbids is "a FIGURE drawn
with a length", and an offset that places a control beside the thing it edits is not a figure. The
row still reads every occurrence in context and still prints the strays.

`position:fixed` rather than `absolute`, for `#strip`'s measured reason: the readings sit inside
`.fg-sides`, which `[C14.1]` bounds with a scroller, so an absolute box would be clipped by the very
container the reading lives in. z-index 40 — above `#strip`'s sidebar at 30, below the error panel
at 50, so a refusal can never be covered by the control that caused it.

### The bound, said

`fgnBoundSaid` returns `'This board keeps this number between {min} and {max}.'` **only when the
number is sitting on one of the two ends**, and the caller hides the node on the empty string.
`boundsText` is deliberately not called: that sentence is written for a dialog editing the pair
itself. This one is arithmetic and factual, it names no type (the heading two nodes up already
says which reading is open), and it never says "you cannot", "too low", or anything about the
number the student chose.

---

## 4. The hit test, and the thing a real click found

`.bf-line` gained `data-fg="res"`. `[S07.5]`'s delegated listener resolves a press with
`node.closest('[data-fg]')`, which returns the **nearest** ancestor carrying one — so a press
inside a reading resolves to `res` and a press on the shape's name, padding or sentences walks past
it to the shape's own `bf`. Disjoint by construction rather than by an ordering rule.

**That satisfies "must not collide" and fails "the retarget flow's claim on unit-shape clicks is
unchanged", and the browser checks said so on the first run.** Playwright clicks the CENTRE of an
element — and the centre of a lit shape *is* a reading. Cells 12b and 12c, shipped two plans ago,
went red.

So the separation is **in time as well as in space**:

| | a press on a reading | a press elsewhere on the shape |
|---|---|---|
| **at rest** | opens the nudge | declines quietly (no flow open) |
| **armed** | retargets, lights out, nothing opens | retargets, lights out |

The team resources are deliberately outside this: they are not on the battlefield, the retarget
flow has no claim on them, and a student who armed a change should not have to cancel it to fix a
pool reading.

**Probe C removed the armed delegation and check 120 went red.**

---

## 5. Dismissal, and the keyboard round trip

D-36's two conditions — a press elsewhere, and Escape — need a listener on the **document**,
because "elsewhere" includes the top bar and both dialogs, which are outside `[S07.5]`'s two roots.
A third binder was added rather than editing `[S07.1]`, which this region's banner promises not to
do. Both handlers decline entirely while the box is shut, so the cost to a student who never opens
one is one hidden-property read per press. Escape's shipped field-revert semantics are untouched:
there is no field anywhere in this control, and `[C14.6]` says why the value between the buttons is
a reading rather than an `<input>`.

**A third document listener followed, and a screenshot is what found it.** The box is
`position:fixed` and its offsets are measured on a rendered frame — and **a scroll commits nothing
and schedules no frame**, so it stayed at coordinates the page had moved out from under. It is
**re-placed rather than dismissed**: these readings sit in a column a student scrolls through while
reading the board, and a control that vanished because they looked at the next unit is one they
learn not to trust. Capture phase, because a scroll event does not bubble and `.fg-sides` is a
scroller. Passive, because it never calls `preventDefault`. **Probe E removed it and cell 26c went
red in all four columns.**

**The keyboard makes a round trip on the surface that has one.** Opening focuses the `−` — this box
is the last child of `#fightbar`, so a student who opened it from a team-resource row three hundred
nodes earlier would otherwise Tab past everything between — and shutting hands the focus back to
the row, found by comparing the three attributes rather than by rebuilding the key in a second
IIFE. Cell 26d drives Tab-position → Enter → Enter → Escape end to end.

---

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — Bug] The armed retarget flow lost its click target to the readings**
- **Found during:** the first browser run after wiring the readings.
- **Issue:** nesting alone separated the two claims spatially, but Playwright's centre click — and
  a student's aim — lands in the middle of a lit shape, which is a reading. Cells 12b and 12c went
  red.
- **Fix:** `fgAnyHalfMade()` in `[S07.5]`; while a change of target is half made, `pressRes`
  delegates the whole battlefield to `pressBf`. Documented at the site with the finding that
  produced it.
- **Files:** `cats-vs-mechs.html` `[S07.5]`.
- **Driven by:** check 120 and cell 26e; probe C.

**2. [Rule 1 — Bug] The box did not follow a scroll**
- **Found during:** reading back a locator screenshot of `#fight-state`.
- **Issue:** a scroll commits nothing, so no frame is scheduled and the fixed box stays put. The
  screenshot was itself misleading (a locator shot scrolls its region into view first) — but it was
  right about a real defect one step away.
- **Fix:** a capture-phase, passive `scroll` listener on the document that re-places the box while
  it is open.
- **Files:** `cats-vs-mechs.html` `[S07.5]`.
- **Driven by:** cell 26c's `followed` clause; probe E.

**3. [Rule 2 — Missing critical functionality] The five ops D-36's interpretation named**
- **Issue:** "the fight tally writers" did not exist at either scope, and neither did a fight-slice
  pool writer. Without them, two of the four reading classes had nothing to dispatch to.
- **Fix:** the five ops above, in the group's own idiom, with arms and exports.

**4. [Rule 2 — Missing critical functionality] `ldUnitName(state, null)` would have printed "null"**
- **Fix:** `ldHandWho` in `[S06.8]`.

**5. [Rule 2 — Missing critical functionality] The by-hand marker's own paragraph became false**
- **Fix:** `dcMarkCard` widened to the unit's tally rows, ids read off the page.

**6. [Rule 3 — Blocking] Two stub-fidelity gaps**
- **Issue:** the stub node had no `.style`, so `[S06.14]` threw the moment a row opened the control;
  and the stub's selector matcher had no `#id` branch, so `closest('#fg-nudge')` collapsed into
  "tagName is FG **and** tagName is NUDGE" and the box shut on its own `−` button.
- **Fix:** both added to the stub, with the reasoning at the site. **Neither was worked around in
  the artifact** — writing the shipped code to fit the stub is exactly what the stub-drift gate
  exists to refuse.

### Nothing else deviated

`DEFAULTS` untouched. No new hex, no `url(`, no namespaced markup or element constructor, no
`innerHTML`. Nothing outside the declaration grid is disabled. No verdicts.

---

## Moves recorded, with D-36 cited

| what moved | from | to | why |
|---|---|---|---|
| check 57's inline-style allowlist | 2 accesses, `--topbar-` only | **4 accesses**, `--topbar-` and `--fgn-` | an offset placing a control beside the thing it edits is not "a FIGURE drawn with a length", which is the row's own test. The row still reads every occurrence in context. |
| `KNOWN_IDS` + stub nodes | 145 shell ids | **153** | eight static nodes, both directions, in the same change |
| `[S05]`'s "no hand op takes a token id" | a property | a **narrower** property, quoted and replaced | the tally pair takes one, through `requireTokenId` + `tallyType` |
| `[S09.12]`'s `tok` claim | "one of a fixed set of three" | "a type the live vocabulary holds" | the wider assertion in place of the count |
| `MAX_HAND_RULINGS`' arithmetic paragraph | an exact count | a **floor**, with the constant unmoved and the reason written | a bound on a record, not a ruling on a student |
| `[S06.9]`'s `DC_RULABLE` paragraph | "a marker on a tally would be a marker for a ruling that cannot be made" | quoted, and the condition it named met | a hand op can write one now |
| `setFightShield`'s "there is no nudgeFightShield" | a decision | quoted, and the sibling written | it named the day; the day arrived |
| gate rows | 204 checks / 1327 in-file | **207 / 1336** | three numbered checks, nine in-file rows |
| browser cells | 262 | **286** | six cells per column, four columns |

**Floors held, unmoved:** `DIALOG_FLOOR` 138, `FIGHT_FLOOR` 248.

---

## The gates

```
selftest 1336 passed, 0 failed          (was 1327/0)
stub-drift gate: 153 shell ids          (was 145)
interaction gate: 207 of 207            (was 204/204)
browser checks: 286 passed, 0 failed    (was 262/0)  headless, chrome + msedge, 1920x1080 + 1366x768
```

Every reading in the browser table is **identical in all four columns**.

## Five mutation probes, each reverted from a scratchpad copy

| probe | what it broke | what went red |
|---|---|---|
| A | dropped `setFightAp`'s `ruled()` call | 2 in-file `[S09.12]` rows |
| B | battlefield readings not pressable | check 118 |
| C | armed press no longer delegates to the shape | check 120 |
| D | nudge buttons rebuilt every frame (05-10's defect, restored) | cells 26b, 26d, 26f — all four columns |
| E | no scroll-follow listener | cell 26c — all four columns |

No probe was left in the file: the artifact is byte-identical to the scratchpad copy taken before
the first one.

## Pictures, read back

Four screenshots per column, at both viewports in both browsers:
`d36-nudge-*` (the control alone), `d36-clamped-*` (the refusal reading), `d36-inplace-*` (the whole
viewport with the box open), `d36-armed-*` (the lit roster). Read back: the box sits under the
reading it edits without covering it, the plate, the tokens and the two sentences are legible at
both sizes, `Cat 1` reads `Health 0× ▪ Shield ▪▪ Chill ▲▲` with the count form at zero, and the
survivor line still says **9 of 9 still standing** with a cat on zero health — D-00d, in a
photograph.

## Known limitations, logged rather than papered over

Both are in `deferred-items.md` (entries 17 and 18) with the fix priced:

- **The battlefield's readings are a pointer affordance, not a keyboard one.** They are `<div>`s
  inside `.bf-unit`, which is the retarget flow's `<button>`, and `<button>`'s content model allows
  neither an interactive descendant nor a `tabindex` one. The team-resource rows ARE real buttons
  and the keyboard route through them is driven end to end. The structural fix — lift `.bf-lines`
  out of the shape button — is valid and complete, costs about twenty assertions across both
  suites, and shrinks the retarget click target, which is a **design** question for the developer.
- **A reading hidden at zero cannot be clicked back up.** `[S06.11]`'s hide pass takes a line away
  at zero for every type but health, so a shield ruled to nothing stops being a press target.
  `[S06.14]` handles it correctly (the box closes on the frame its anchor stops being drawn) rather
  than floating over the page. The three admissible answers are written out; each is a design
  decision.

## Threat Flags

None. No new network surface, no new auth path, no new file access, and no schema change at a trust
boundary: the two attributes-plus-token-id that reach a new op go through `requireSide`,
`requireTokenId` and `tallyType`, which are the boundaries `setTally` has run on since Phase 2.1,
and the prototype is asserted intact after every hostile drive.

## Self-Check: PASSED

- `FOUND: cats-vs-mechs.html` — `[S06.14]`, `[C14.6]`, `#fg-nudge`, the five ops, all present
- `FOUND: tests/selftest-node.cjs` — checks 118/119/120 present, 153 shell ids
- `FOUND: tests/browser-checks.mjs` — cells 26 through 26f present
- `FOUND: .planning/phases/05-fight-loop-playtest/deferred-items.md` — entries 17 and 18
- `FOUND: 459cf1e` feat(05-D36) — the control and its ops
- `FOUND: bf5b4e6` test(05-D36) — the gate rows, the browser cells and the probes
- `FOUND: 3e8fe04` feat(05-D36) — the keyboard round trip, the scroll follow and [S09.12]'s rows
