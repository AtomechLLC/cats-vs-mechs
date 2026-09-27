---
phase: 05-fight-loop-playtest
plan: D46
subsystem: ops+render+interactions+selftest+gate+browser
tags: [d-46, redirect, fight-tab, drag, hand-rulings, reserve, conservation, pointer-ownership, s05, s06-7, s06-11, s06-16, s07-5, s07-8, s09-17, fight-floor]

requires:
  - phase: 05-fight-loop-playtest
    plan: D41a
    provides: "moveRule / moveEnd / moveToken: one op for every drag, flat ends, a null unit is the side's end, bounds refused whole and directionally, a label carrying the commit count, the reserve's sparse storage"
  - phase: 05-fight-loop-playtest
    plan: D41b
    provides: "the pointer machine ([S07.8]): threshold, capture on a static root, elementFromPoint resolved to the entity, lights asked of the op's predicate, one dispatch per drop, refusals through D-39b's channel, Escape and every other stop, edge autoscroll; the ghost layer; the pool's words and reading"
  - phase: 05-fight-loop-playtest
    plan: "05"
    provides: "the hand record { side, unit, tok, from, to } written by ruled() and carried into past by Advance"
  - phase: 05-fight-loop-playtest
    plan: D36
    provides: "the team-resource rows as D-36 nudge buttons, fgAnyHalfMade, the null-unit side-scope record and ldHandWho"
  - phase: 05-fight-loop-playtest
    plan: D37
    provides: "the unit popup opened by a press on a battlefield shape at rest, the shape's two jobs separated in time, and the node-identity lesson (probe G)"
  - phase: 05-fight-loop-playtest
    plan: D42
    provides: "the battle scene's own gesture on #scene-field, whose listeners answer only to its own record"
provides:
  - "App.ops.moveFightToken / moveFightCheck: D-41's move on the FIGHT slice as a hand ruling; moveRule gains the slice as a sixth argument and is still the one guard block; moveEnd is one function for both slices"
  - "a sparse per-side FIGHT reserve (`fight[side].reserve`), started empty by every fight, read by nothing in the fight's arithmetic"
  - "both ends of every fight move in the round's `hand` record; [S06.8]'s ldHandWho says 'The Cats reserve' for a null-unit record of a unit-kept type (App.ops.moveScope exported for it)"
  - "the fight tab's team-resources area as each side's pool: head, reserve line (reserveHeld, shared with the board pool), the side's rows drawn as tokens too, built once per list"
  - "battlefield shapes as entities and every reading as a source; a shape's refusal said on its column's line under the cluster"
  - "[S07.8] as one machine for two surfaces (DRAG_SURFACES), fightDragOffer ranking the fight tab's press, App.interactions.fightDragAnswers"
  - "[S09.17] 'the fight move', 15 records; gate checks 132, 132b, 132c; browser cells 33 and 33a-33n (15 cells x 4 columns)"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "one end resolver for two slices: the holder of the numbers and the name of the health field are the only variables; names, vocabulary and bounds always come from the build"
    - "a press that two consumers want is held back on the way down and answered on the release: the drag if it travelled, the old click if it did not"
    - "a refusal said beside a cluster of small entities rather than inside one, so no entity changes size because of a sentence about it"
    - "a surface built once per LIST and written per frame, so a commit landing mid-gesture rebuilds nothing under the pointer"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D46-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/deferred-items.md
    - .planning/STATE.md

key-decisions:
  - "SHARED, NOT COPIED, AND THE ONE DIFFERENCE IN THE GUARDS IS NAMED. moveRule is the only guard block for both slices; the fight adds exactly one guard, fightOf's own refusal ('No fight in progress'), taken after the id and the two sides and before any end is read. moveEnd is one function: the holder (build faction or fight side) and the health field (maxHp or hp) are the only variables. Names, the vocabulary and the D-35 bounds come from the build on both slices, as every hand op already bounds through s.build.tokens. MAX_RESERVE caps a fight reserve too, for [S01]'s reason (steppers create tokens, moves conserve them)."
  - "A FIGHT MOVE IS TWO HAND RECORDS, SOURCE FIRST, IN THE RECORD'S ONE SHAPE. A reserve end is `unit: null`, D-36's side-scope shape, and the TYPE tells a reserve from a pool (a null unit beside a unit-kept type can only be the reserve), asked of App.ops.moveScope rather than restated. No key was added to the record."
  - "THE LABEL IS 'fight move <count>', so two fight moves never fold and a board move and a fight move in one COALESCE_MS window are two entries on two slices."
  - "A UNIT RULED DEAD IS NOT REFUSED. Every hand op rules on a dead unit's numbers; whether a fallen unit can give or be given is the table's call. A move never writes `alive` (D-00d), driven both ways."
  - "THE FIGHT IS BLIND TO ITS RESERVE, AND THE ONE PLACE A RESERVE APPEARS IN ADVANCE'S OUTPUT IS SAID: `was` snapshots each side verbatim, reserve included, because it is a copy of the board as it stood. [S09.17] plays two fights that differ only in their reserves through three real Advances; once that bag is set aside wherever it sits, the fight slices are byte-identical, every reading is identical, and the reserve is untouched."
  - "WHO OWNS A PRESS ON THE FIGHT TAB, IN ORDER: (1) a half-made retarget owns it, and no drag starts (D-36's nudge still opens on a pool row, as D-36 built it); (2) at rest a press on a SOURCE is held and nothing happens on the way down; if it travels DRAG_PX it is a drag and the popup/nudge never open, if it does not, the popup (shape) or nudge (pool row) opens on the release; (3) anything else (a shape's name or padding) opens the popup on the way down, as before. Keyboard activation never reaches the offer. The scene cannot be a claimant: its press listener is on #scene-field, outside #fightbar, and each gesture's document listeners answer only to their own record."
  - "A POINTER OPEN ON THE RELEASE LEAVES FOCUS WHERE A MOUSE ALWAYS LEFT IT. pressUnit / pressRes take `onRelease`; by the release the browser has focused the shape or row, and moving focus into the box would be a new pointer behaviour. Measured: focus ends on fg/bf/cats/c1 after a still click, exactly as before."
  - "A LIVE FIGHT DRAG SHUTS THE POPUP AND THE NUDGE: both are fixed boxes at z-index 40 and would sit over the very targets a drag aims at."
  - "THE POOL ROWS ARE BUILT ONCE PER LIST AND WRITTEN EVERY FRAME. Before D-46 fgFillTeam rebuilt every row on every repaint. Under a drag that is D-37 probe G's defect, so the list of types is the fingerprint and a count is a write (syncRow, the board's own row writer). The key, tag and every attribute D-36 gave a row are unchanged."
  - "A SHAPE'S REFUSAL IS SAID UNDER ITS CLUSTER, NOT INSIDE IT, AND THE CLUSTER PACKS ITS ROWS AT THE TOP. Both decided by screenshots. See Deviations 1 and 2."
  - "FIGHT_FLOOR 262 -> 268 by its own method (+6 at five roster shapes, all roster-independent). Check 47 held at 117. No new shell id, so KNOWN_IDS and the stub are unchanged at 174. No new inline style, so check 57 is unchanged."

requirements-completed: []

metrics:
  duration: 80min
  completed: 2026-09-27
---

# Phase 5 D-46: drag resources on the fight tab, as hand rulings — Summary

**On the fight tab, a student can now take a token off any unit's reading on the battlefield,
off a side's action-point row, or out of a side's fight reserve, and drop it on any unit on either
side or on either side's pool. Each drop is one hand ruling on the fight slice: −1 at one end, +1
at the other, both recorded in the round's by-hand list (the ledger reads them after Advance), one
commit and one undo entry that never folds. Scope binds as on the board, bound breaches are
refused whole with the op's own sentence, a unit dragged to zero stays standing, the build code
does not move by one character, and nothing in the fight's arithmetic reads the reserve. The
lights come from the op's own predicate. A still click still opens D-37's popup on a unit and
D-36's control on a pool row. While a retarget is half made, nothing drags. The battle scene's
sprite drag and the resource drag never capture each other's pointer.**

The developer's words were "I can't drag resources around the battle screen." The pictures below
show it done: real mouse drags in real Chrome and real Edge at both sizes.

---

## What shipped

| where | what |
|---|---|
| `[S05]` | `moveEnd(build, side, unitId, tokenId, scope, fight)`: one resolver, holder and health field are the only variables. `moveRule(..., onFight)`: the one guard block, plus `fightOf` for the fight. `moveFightToken` (commit `'fight move ' + count`, two `ruled()` records, source first) and `moveFightCheck` (no arm). Router arm `moveFightToken`. Exports: both, plus `moveScope`. The absence block records the fight move as a hand ruling and not an applier. |
| `[S06.7]` | `fgBuildTeam`: the pool box, an entity (`data-drg-at`, no unit), head "Pool", "Reserve" line, rows container, said line last. A hidden `.fg-field-said` between the battlefield and the pool. `fgResRow` + `fgResWrite`: rows built once per list, written per frame, with `.fg-res-toks` drawn by `syncRow`, and each row a source (`data-drg-tok`). |
| `[S06.11]` | Every `.bf-unit` carries `data-drg-at` / `data-drg-unit`, and every `.bf-line` is a source. No said line inside a shape. |
| `[S06.16]` | `poolHeld` → `reserveHeld(state, held, faction, emptyCls)`, shared by both pools. `dragEntities / dragPaint / dragDone / dragQuiet` take optional column roots (the board's are the default). `dragSaidOf` finds a shape's column line. `FIGHT_DRAG_COLS` exported. |
| `[S06.8]` | `ldHandWho` says "The Cats reserve" for a null-unit record of a unit-kept type. |
| `[S07.8]` | `DRAG_SURFACES` (root, predicate, op). `dragEnds / dragAnswer / dragAnswers / dragTargetAt` take the surface, and the target must lie inside that surface's root. `fightDragOffer` ranks the fight press. A live fight drag shuts the popup and nudge and captures to `#fightbar` (lostpointercapture bound there too). A still release runs `still`. `dragInFlight` reports `surf`. `fightDragAnswers` exported. |
| `[S07.5]` | `onFightPress`: `bf` and `res` offer the press to the drag first; a press with no `data-fg` (a reserve reading) is offered with no click behind it. `pressUnit` / `pressRes` take `onRelease`. |
| `[C04]` | The D-46 block: `.fg-team` as a box at `--tok:18px`, `.fg-team-*`, the pool row's tokens carry the grab cursor, and `.bf-unit` / `.fg-team` wear D-41b's lit / no / home / over states. No new colour. The old `.fg-team` rule is retired with a note. |
| `[C14.1]` | `.fg-field{align-content:flex-start}` (Deviation 2). |
| How-to | One paragraph on the fight card: what a drag does, that a still click still opens, that nothing drags while a target is being picked, and that the fight Reserve is pointer-only. |
| `[S09.17]` | New suite "the fight move": 15 records (13 rows, 2 info), all state work, above any no-DOM bracket. |

---

## The model, driven ([S09.17], CI)

| row | reads |
|---|---|
| schema | no fight → refused `No fight in progress`, nothing written; a fresh fight's sides are exactly `ap,units`; exports present; `moveFightCheck` has no arm |
| every drag | 11 spellings (unit→unit same side and across, a student's unit type across, unit→own/other reserve, reserve→own/other unit, reserve→reserve, AP side→side, a student's side type side→side): each moved exactly one, the fight total held, the **build byte-identical and the build code unchanged** |
| hand record | two moves → four records, source first, each `side,unit,tok,from,to`, the reserve end's unit `null`; a real Advance carries all four into `past` and removes the live list; nobody's flag moved |
| refusals | 12 shapes, same sentences as the board's move; state byte-identical, undo depth and commit count unmoved |
| refused whole | a mech on 6 under ceiling 2 gives one and reads **5** (not a clamped 2); the same token onto the other mech on 6 is refused and it stays 6; same-end is nothing |
| D-00d | a cat dragged to 0 is standing, 9 of 9; a mech ruled dead gives and takes and stays marked |
| conservation | 400 fixed-seed moves over every end and six types: **68 moved / 11 same-end / 95 floor / 38 ceiling / 188 scope**, 0 drift, 0 defects, build unmoved |
| predicate ≡ op | 300-step walk: `moveFightCheck` and `moveFightToken` agree sentence for sentence; asking wrote nothing 300 times |
| lights ≡ drop | `fightDragAnswers` over six drags, each answer checked by a real `moveFightToken` on a restored fight: **35 lit / 5 home / 44 refused**, 0 disagreements, every end named once |
| undo | control: two fight nudges fold to 1; two fight moves back to back are 2; one Ctrl+Z takes back one move and its two records (hand list 2, 6, 4, 2); a board move and a fight move are 2 |
| blindness | fights X (reserve on both sides: health, shield, a student's type) and Y (none), identical otherwise by construction; three real Advances; fight slices byte-identical with the reserve set aside; affordability against a caster **carrying** the reserve, spoken-for, survivors and spent all identical before every Advance and after the last; X's reserve untouched |

## The surface, driven

### Node gate (stub page)

- **132**: each state column has one pool after its battlefield, then the column's refusal line. The pool carries the entity marks, the exported words, the empty slot, and rows that are sources drawing their counts (cats `ap 3`, `Zeal 2`; mechs `ap 3`). Every shape is an entity, and none carries a said line. Every reading is a source. Nothing added is routed or focusable. The board's entities are unchanged.
- **132b**: the fight reserve is drawn through `reserveHeld` ("1 Health in reserve", "1 Grit in reserve"). Identity holds across a nudge (same row, 4 tokens, "0 of 4 spoken for") and across a real Advance (same row, same reading, same first shape, reserve untouched). A new side tally is a new row. Drained, the key is gone.
- **132c**: a still press is pending with the popup shut, and the release opens the popup on c1. A drag is live on `surf:"fight"` with 13 lit, 1 home, 0 board lights, a ghost, the source taken, 0 commits and the popup shut. An Advance lands mid-drag: the drag is still live, the source is the same node and still attached, and the next move re-lights 13. Escape ends it, and the only commit was the Advance's. A still press on a pool row opens the nudge. Armed, the press retargets to c3 and nothing goes in flight. A scene press holds a sprite and starts no drag.

### Real browsers — cells 33–33n, Chrome and Edge × 1920x1080 and 1366x768, `page.mouse` only

| cell | drag | read back (all four columns) |
|---|---|---|
| 33 | layout | pool below the battlefield, solid border, dashed empty slot, words ≥ 18px, three AP tokens per row, readings `touch-action:none` + grab, pool rows pointer with grab tokens |
| 33a | Cat 1 health → Mech 1 | in flight: live on the fight surface, 13 lit, Cat 1 home, Mech 1 over, **0 board lights**, source/reading/shape identical, 0 commits, **popup never opened**; after: 3→2 / 6→7, +1 commit, +1 undo, 2 hand records, **build code unchanged**, nobody dead |
| 33b | Cat 1 → Cats pool | fight reserve `{"hp":1}`, reading "1 … in reserve", empty sentence gone, code unchanged |
| 33c | reserve → Mech 2 | 6→7, reserve key gone, sentence back |
| 33d | Cats AP row → Mechs pool | 3→2 / 3→4; in flight Mechs pool the only lit, all 12 units refused; **nudge never opened** |
| 33e | AP → Cat 2 (**refused, scope**) | shape refused before release; nothing moves; the Cats' field line says the answer's sentence, **on screen**, **no shape moved** |
| 33f | Cat 1 health → Mech 1 under hp ≤ 4 (**refused, bound**) | `Anvil-07 holds at most 4 "Health", so it cannot take another.` on the Mechs' line, on screen, no shape moved |
| 33g | Escape mid-drag, release over a lit shape | nothing written, nothing opened |
| 33h | still clicks | 3px wobble on a reading: pending, no ghost, popup shut; release opens the popup on c1, 0 commits, **focus stays on the shape**; a press on a name opens the popup on the way down; a click on the AP row opens the nudge |
| 33i | drag while a retarget is armed | 9 lit; the press retargets to Cat 3; nothing in flight, no ghost, no hand record |
| 33j | scene ↔ drag | a sprite dragged toward the battlefield is the scene's (held, no fight drag, nothing commits); a resource carried up — edge-scrolling — and let go **on a sprite** is the drag's (live throughout, no sprite held), moves nothing, says nothing, leaves the scene's places alone |
| 33k | two drags, then a real Advance | the round's "Set by hand this round" lines, in order, begin `Biscuit`, `Anvil-07`, `Cog MK-2`, `The Mechs reserve` and carry `Health set by hand, 3 to 2.`, `Health set by hand, 6 to 7.`, `Shield set by hand, 3 to 2.`, `Shield set by hand, 0 to 1.`; no "null" anywhere |
| 33l | two drags 65–85 ms apart (COALESCE_MS 500) | +2 undo, 4 records; Ctrl+Z takes back one move and its two records; **control**: two popup + clicks fold to 1 |
| 33m | Advance (keyboard) while a drag is held | round 2; source/reading/shape the same nodes; still live, 13 lit, over Cat 2; only the Advance's undo entry while held; the drop lands on round 2 as one entry |
| 33n | Cat 1 near the window's foot → Mechs pool | pool below the window (required); edge scroll brings it in; reserve `{"hp":1}` |

### Measured, four columns

| reading | Chrome 1920 | Chrome 1366 | Edge 1920 | Edge 1366 |
|---|---|---|---|---|
| Cats fight pool, document y | 1405–1539 | 1418–1552 | 1405–1539 | 1418–1552 |
| two fight drags, release to release (final run) | 66 ms | 85 ms | 68 ms | 65 ms |
| Mechs pool top with Cat 1 under the bar (on screen?) | 325 / yes | 325 / yes | 325 / yes | 325 / yes |
| edge scroll needed from Cat 1 at the window's foot | yes | yes | yes | yes |

The natural landing (Cat 1 under the sticky bar) already has the other side's pool on screen at both sizes. The edge scroll is needed when the page is left where the scene sits above, and 33n drives exactly that.

### Screenshots, read back

`d46-*` in `SHOT_DIR`, eight per column. I read back: in-flight unit→unit (Chrome 1920): Biscuit plain as home with its first token dimmed, every other shape and both pools in the lit outline, Anvil-07 carrying the heavier outline, and the ghost over its name. After-drop (Edge 1366): Biscuit 2 health, Anvil-07 7, lights off. Refused scope (Chrome 1366), **before and after Deviation 1**. Refused bound (Chrome 1920 before, Edge 1920 after). In-flight side-scope (Edge 1366): all units dashed and dim, only the Mechs pool lit, the picked triangle dimmed. After unit→pool (Chrome 1366): one health token in the Cats' Reserve. In-flight bound (Edge 1920): cats lit, mechs dashed, Anvil-07's heavy dashed outline. Ledger after Advance (Chrome 1920): "Set by hand this round" with Biscuit ▪▪▪→▪▪, Anvil-07 six→seven, Cog MK-2's shield three→two, and "The Mechs reserve 0×→▪". **Two defects were found by screenshot alone**, with every row green (Deviations 1 and 2).

---

## Which claims live where

- **CI (in-file `[S09.17]`, node and DOM tiers):** the op, every spelling, conservation, refused-whole and directional bounds, the refusals and their sentences, the hand record and its trip through Advance, undo, D-00d, the fight's blindness to the reserve, predicate ≡ op, and lights ≡ drop.
- **Node gate (stub page), 132–132c:** the pool's structure and words, every mark, the reserve reading, row identity across a nudge and an Advance, and the gesture up to the drop: a still release opens popup or nudge, the live lights, no board lights, the layer, identity across an Advance, Escape, retarget ownership, and a scene press never starting a drag.
- **Browser tier only:** **every drop** (it resolves the entity with `elementFromPoint`), so every "one move per drop", the sentence arriving at the drop and on screen, no shape moving when a sentence appears, the ledger read after a real Advance click, real Ctrl+Z, two real drags inside COALESCE_MS, the Advance-while-held drop, edge autoscroll, the scene/drag pairing under real pointer capture, and all layout and computed style.

---

## Probes — committed first (df00847), run on scratchpad copies, working tree never touched

Each probe is a `git archive` of the commit, one to three exact-once, EOL-aware replacements (the harness refuses a probe whose target is not found exactly once), then the node gate under a hard timeout and the fifteen D-46 cells in all four columns. **None stayed green, so the if-it-stays-green clause was not triggered. No row threw and nothing hung:** node runs took 16–22 s and browser runs 66–68 s, and every run reached its summary line. That became true after Deviation 4. The first probe run found two cells and a gate block that threw.

| probe | change | node tier | browser tier (x4 columns) |
|---|---|---|---|
| **P1** writes the build | `moveFightToken` resolves both ends with no fight slice | `[S09.17]` every-drag, refused-whole, D-00d, sweep, predicate, undo; gate 132b, 132c | 33a–d, 33l–n |
| **P2** missing from the hand record | both `ruled()` calls removed | `[S09.17]` hand record, undo | 33a, 33k, 33l, 33m |
| **P3a** Advance reads the reserve | adds reserved health to a unit after the round rules | `[S09.17]` blindness | green (by design, node-only claim) |
| **P3b** requirements read the reserve | `presentOnCaster` counts reserved health | `[S09.13]` and `[S09.17]` blindness | green (by design) |
| **P4** clamp instead of refusal | ceiling refusal removed, target written `min(got+1, hi)` | 9 rows across `[S09.13]`, `[S09.14]`, `[S09.17]` | 33f |
| **P5** scene drag moves a resource | letting go of a sprite moves its unit's health to the reserve | gate 130b, 130d | 33j |
| **P6** a still press starts a drag | `DRAG_PX = 0` (the popup never opens) | `[S09.14]` arm row; gate 129c, 132c | 33h |
| **P7** popup opens on the press | `pressBf` on the way down beside the offer | gate 132c | 33h |
| **P8** source rebuilt by Advance | roster signature includes the round | gate 132b, 132c | 33m |
| **P9** retarget loses the press | `fightDragOffer` ignores `fgAnyHalfMade` | gate 132c | 33i |
| **P10** pool rows rebuilt per frame | the list fingerprint always misses | gate 132b | green (row identity is a node-tier claim here) |

---

## Deviations from Plan

### 1. [Rule 1 — Bug, found by a screenshot] A refusal said inside a shape rearranged the battlefield
- **Found during:** reading back `d46-refused-scope-chrome-1366x768` and `d46-refused-bound-chrome-1920x1080` on the first cell run. Every row was green.
- **Issue:** the first build put the drop's said line inside the shape, D-41b's card arrangement. In a 150px shape the sentence widened Mittens to a whole row at 1366, pushing six cats out of the cluster's scroller. At 1920 a ceiling refusal on Anvil-07 moved Cog MK-2 onto the next row. The battlefield rearranged itself under the student because of a sentence about it.
- **Fix:** no shape carries a said line. `fgBuildStateSide` builds one `.fg-field-said` per column between the battlefield and the pool, outside the scroller, and `dragSaidOf` finds it from a shape. 33e and 33f now require every shape's document rectangle unchanged across the refused drop.
- **Commit:** 489eef9

### 2. [Rule 1 — Bug, found by measurement] The other column's shapes moved 54px when a sentence appeared
- **Found during:** the rectangles compared for Deviation 1. Rivet-12 sat at different heights with and without a sentence under the Cats.
- **Issue:** `.fg-sides` stretches both columns to one height and `.fg-field` takes the slack (D-39 P2-10). With no `align-content`, a stretched cluster **spread** its wrapped rows, so anything that made one column taller moved the other column's second row.
- **Fix:** `.fg-field{align-content:flex-start}`. The slack is still taken (the pools still line up), but it goes under the shapes. At rest the Mechs' second row now lines up with the Cats' second row instead of floating between rows. All 518 pre-existing browser cells pass with it.
- **Commit:** 489eef9

### 3. [Rule 1 — Bugs in cells of mine] Four first-run cell failures
- **33 (cursor):** a pool row is a D-36 `<button>` whose `cursor:pointer` out-ranks `.drg-src`'s grab. It keeps pointer (a click still opens the nudge) and its tokens wear grab. The cell asserts both.
- **33j at 1366 (no edge scroll):** the cell read the sticky bar's bottom at the top of the page, where it is 214px, not after scrolling, where it is 101px, so the pointer never entered the edge zone. It now reads the bar after the scroll.
- **33m (two commits):** a keyboard Advance counts **two** commits on HEAD too (measured on `acea578`): the first key press flips `ui.kbdNav`, a UI commit with no undo entry. Not a defect. 33m counts undo depth instead.
- **33n (edge scroll never needed):** with Cat 1 under the bar the other pool is already on screen at both sizes (recorded). The cell now drives the case that needs it (Cat 1 near the window's foot).
- **Commits:** 489eef9 / b79bf2f (before either landed)

### 4. [Rule 1 — Rows that threw under a probe] Gate 132b and cells 33h / 33l
- **Found during:** the first probe run on b79bf2f. Under P1 a drain move's refusal escaped a bare op call in 132b and the gate stopped before its summary line. Under P6, 33h's `pg.click('#fg-unit-close')` waited for a popup that never opened and threw a TimeoutError. Under P9, 33l read a null `+`.
- **Fix:** every op 132b/132c drives goes through `d46Do`, which records. 33h shuts with Escape. 33l guards the `+`. And `d46Fresh` now paints the end of a fight before the next start: `fgRest` only runs on a frame with no fight, so under P9 a half-made retarget from 33i had leaked into later cells.
- **Commit:** df00847

### 5. [Rule 2 — Missing critical functionality] The pool rows were rebuilt on every repaint
- **Issue:** `fgFillTeam` threw away and rebuilt every team-resource row on every commit. Harmless for D-36's click, but a drag source rebuilt under the pointer is D-37 probe G's defect.
- **Fix:** built once per list of types, written per frame. 132b holds identity across a nudge and a real Advance, and probe P10 turns it red.
- **Commit:** 489eef9

### 6. Smaller, all before commit
- `sed -i` rewrote the artifact with LF endings (D-41b's pitfall again). CRLF was restored before any commit, and the blob is unaffected.
- `[S09.16]` is D-45's suite, so the new one is `[S09.17]` (the two forward references were fixed).
- Two in-file rows had wrong expectations in the first draft: the schema row compared against a state `endFight` had moved, and the undo row forgot that each control nudge records its own ruling. Both were fixed before the rows were committed.
- A second end resolver was written first, then folded into `moveEnd`, because D-46 says "reuse, don't fork".

---

## Moves recorded, with D-46 cited

| what moved | from | to | why |
|---|---|---|---|
| `FIGHT_FLOOR` | 262 | **268** | the pool's "Pool", "Reserve" and empty sentence, once per side: +6 at 2x2, 3x3, 5x3, 9x3 and 24x24, all roster-independent (table at the constant; HEAD column reproduces D-44's fight column to the string) |
| How-to harvest | 32 | 33 (floor 24) | the fight card's drag paragraph; +1 on both `#app` pages at close, not FIGHT_FLOOR's (D-38's rule, as D-41b recorded) |
| check 47 | 117 | **117** | setup harvest unmoved by the pool (+1 from the How-to only) |
| `KNOWN_IDS` / stub | 174 | **174** | no shell id added: everything D-46 draws is built |
| check 57 | — | unchanged | no new inline style access |
| `[S06.16]` drag render | board columns only | optional column roots | the fight surface lights its own two columns, and the tabs' entities share keys |
| `[S07.8]` | one surface | `DRAG_SURFACES` | shared machine, four named differences |
| `pressUnit` / `pressRes` | one argument | `onRelease` | keeps the pointer path's focus outcome |
| `.fg-team` rule | `[C14.1]` block | the D-46 block | one rule for one box |
| `.fg-field` | no align-content | `flex-start` | Deviation 2 |
| gate rows | 230 | **233** | 132, 132b, 132c |
| in-file rows | 1421 | **1436** | `[S09.17]`, 15 records |
| browser cells | 518 | **578** | 15 cells x 4 columns |

## Instruments

| | baseline (HEAD acea578) | after (df00847) |
|---|---|---|
| `node tests/selftest-node.cjs` | 1421 / 0, exit 0 | **1436 / 0, exit 0** |
| interaction gate | 230 of 230 | **233 of 233** |
| stub-drift | 174 shell ids | **174** |
| `node tests/selftest-dom.cjs` | 1548 / 0 | **1563 / 0** (tier delta 127, unchanged: every new row runs in the bare sandbox) |
| `tests/browser-checks.mjs` | 518 / 0 headless | **578 / 0 headless, exit 0** |
| live `#selftest`, real Chrome + Edge | 1548 / 0 both | **1563 / 0 both**, no page errors, store untouched |

The codec, `DEFAULTS`, `WIRE_BOUNDS` and the build code are untouched: the shipped code is still `v1~N~V~A9~3~9*3!0~9*~~~~B3~3~3*6!3~3*~~~~7tvo`, read back in cell 33a before and after a fight drag. No banned state key: the new key is `reserve` on a fight side. No new hex, `url(`, SVG or markup sink. FORBIDDEN and Layers A, B and C are green.

## Known Stubs

None. Every reading the fight pool draws is wired to the fight slice, and every drop dispatches the shipped op.

## Threat Flags

None. No new network surface, auth path, file access or schema change at a trust boundary. The fight slice is not on the wire. The five payload keys reach `moveFightToken` through `requireTokenId` and `requireSide`, and a unit through `findUnit`. No caller string is interpolated into a selector (the fight's entity lookups walk and compare).

## Self-Check: PASSED

Files: `05-D46-SUMMARY.md`, `cats-vs-mechs.html`, `tests/selftest-node.cjs`, `tests/browser-checks.mjs`, `deferred-items.md`, `STATE.md`. Commits ff782c1, b8cd581, 489eef9, b79bf2f, df00847 present. Final instruments measured on a `git archive` of df00847.
