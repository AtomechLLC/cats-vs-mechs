---
phase: 05-fight-loop-playtest
plan: D41b
subsystem: render+interactions+selftest+gate+browser
tags: [d-41, redirect, part-2-of-2, pool, reserve, drag, pointer-events, lit-role, refusal-channel, s06-16, s07-8, s09-14, check-57, fight-floor]

requires:
  - phase: 05-fight-loop-playtest
    plan: D41a
    provides: "faction.reserve, App.ops.moveToken (one op, flat ends, null unit = the side's end), readReserve, MAX_RESERVE, refusals as plain Errors with sentences, a move label that cannot fold"
  - phase: 05-fight-loop-playtest
    plan: D39b
    provides: "isRefusal / refuseLoudly / saySaidLine / dropSaidLine: the refusal channel a drop reports through"
  - phase: 05-fight-loop-playtest
    plan: D33b
    provides: "the lit palette role (--state-lit-line / --state-lit-fill), spelled as .bf-unit--lit spells it"
  - phase: 05-fight-loop-playtest
    plan: D34
    provides: "the precedent that interaction state lives in a region's own scope, never in a slice"
provides:
  - "App.ops.moveCheck: moveToken's guards (moved unedited into moveRule) without the commit; no router arm"
  - "[S06.16] the pool: one box per column head, under the faction name, holding the Reserve line plus the side-kept stepper lines; reserve readings drawn by symQty(styleFor) at board token size; an empty reserve is a dashed drop slot"
  - "entity marks (data-drg-at / data-drg-unit) on every unit card and both pools, drag-source marks (data-drg-tok) on every token row inside one, one hidden said line per entity"
  - "static #drag-layer outside #app holding the ghost; ghost placed by --drg-x / --drg-y"
  - "[S07.8] the gesture: DRAG_PX 6 threshold, capture on #board, elementFromPoint to the entity, lights from moveCheck via isRefusal, ONE moveToken dispatch per drop, refusals via refuseLoudly on the drop's entity and scrolled into view, Escape / pointercancel / lostpointercapture / blur cancel, edge autoscroll while live"
  - "App.interactions.dragAnswers / dragInFlight / DRAG_PX"
  - "[S09.14] 'what a drag lights': nine records, all state work"
  - "gate checks 129, 129b, 129c; browser cells 31 and 31a-31l (13 cells x 4 columns)"
  - "a How-to paragraph: dragging is pointer-only, the steppers are the keyboard path, the Reserve is reached only by dragging"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "a surface lights targets by ASKING the op (a no-commit predicate sharing the op's guard function), never by restating its rules; a CI row holds the surface's answer list to the op's actual behaviour end by end, sentence by sentence"
    - "the drag ghost lives in a static layer outside every render tier's reach, and is pointer-events:none so the hit test sees through it; a node-tier row reads that property by rule name because only a browser can hit-test"
    - "a refusal said at the foot of the entity it was dropped on is scrolled into view with block 'nearest', because a correct sentence below the window is one a student never reads"
    - "browser cells that count undo entries start from an empty stack, because the stack is capped and a full suite arrives with it full"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D41b-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/stub-dom.cjs
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/deferred-items.md
    - .planning/STATE.md

key-decisions:
  - "THE POOL IS THE HEAD'S ALLOCATION GROUP, BOXED. The amendment says the side-kept tokens are in the pool 'since that is where they already live', and they already live in the column head, in the group factionHead's own comments separate from the two projections. So the pool is a box around that group (action points plus the side's student tallies), opened by the new Reserve line. Damage and Total health stay outside it. Nothing is removed or reordered: the same stat lines, built by the same calls, are appended into the box. The result is one picture of action points, not two."
  - "VALIDITY IS THE OP'S, BY CONSTRUCTION AND BY ROW. moveToken's guard block moved, unedited, into moveRule. moveToken and the new moveCheck both call it, so they cannot drift. [S07.8] reads moveCheck's answer the way every commit site reads one: true = lit, false = home, a refusal = refused, anything else = defect. [S09.14] then drives dragAnswers against moveToken over seven drags and every end, and moveCheck against moveToken over a 300-step walk. Probe P3, a surface that restated scope and forgot bounds, turned both rows red."
  - "EVERY TOKEN ROW IN AN ENTITY IS A SOURCE, INCLUDING THE DEAD MARKER'S. Which types move is the op's ruling, and pre-filtering sources would be a second copy of moveScope. Picking up an unallocatable type lights every target as refused, and the drop says the op's sentence."
  - "THE RESERVE READING IS DRAWN AT BOARD SIZE. symQty draws 12px notation tokens without glyphs, and the first real screenshot showed a parked health token as a 12px speck beside the 22px ones it came from. In the pool the token is the subject, which is [C14.5]'s own carve-out for the board, so .brd-pool-held .sym sets --tok:22px and keeps the glyph. The .ae-term-read precedent sets a reading's size per surface in the same way."
  - "NOTHING IN THE POOL IS FOCUSABLE, AND THE KEYBOARD GAP IS SAID PLAINLY. The steppers reach every number a drag changes. The reserve itself is reachable only by dragging. That is stated in the How-to, at [S07.8]'s banner, and as deferred item 1, not covered with focusable tokens that Enter could not operate."
  - "EDGE AUTOSCROLL IS IN (Rule 2). At 1366x768 a nine-cat column is far taller than the window, and a finger holding a token cannot wheel-scroll. A live drag within 56px of the window's foot, or of the sticky bar's foot, scrolls the page and re-reads the target on every step."
  - "check 57's allowlist turned 8 -> 10 (--drg-), in the open, with the RED recorded. FIGHT_FLOOR 248 -> 254 by its own method (roster-independent +6, measured at four roster shapes). Check 47's floor re-measured and held at 117, as a tripwire and not a ratchet."

requirements-completed: []

metrics:
  duration: 70min
  completed: 2026-09-25
---

# Phase 5 D-41b: the pool and the drag — Summary

**Each side's column now opens with a Pool: the side's Reserve of parked unit tokens, drawn through
the shipped symbolic reading at board size, boxed together with the action points and the side's
own tallies it already held. Any token on a unit card or in a pool can be dragged with a real
pointer onto any unit on either side or onto either pool. While it moves, every target the op would
accept lights in D-33's lit role, every target the op would refuse goes dashed and dim, and the end
it came from stays plain. All three answers come from `App.ops.moveCheck`, the op's own guards with
the commit left off. A drop is exactly one `moveToken` dispatch. A refusal is said on the card it
was dropped on, in the op's words, and brought on screen. Escape cancels. A press that does not
travel six pixels is still a click, and the stepper ramp is unchanged (9 steps and 1 undo entry per
1.1 s hold, on HEAD and after).**

---

## What shipped

| where | what |
|---|---|
| `[S05]` | `moveToken`'s guard block moved **unedited** into `moveRule`; `moveToken` = `moveRule` + the same commit; `moveCheck` = `moveRule(...).moves`, exported, **no router arm** |
| `[S06.1]` | `factionHead`: the pool box after the `<h2>`, action-point and side-tally lines appended into it (4th declared cross-plan append). `buildColumn`: `dragEntity` over the pool and every card (in both modes) |
| `[S06.16]` new | `poolBox`, `poolHeld` (fingerprinted over type, count, shape/colour/glyph and **name**), `syncPools` hook, `dragEntity`, `dragGhost`/`dragGhostAt`, `dragPaint`, `dragDone`, `dragQuiet`, `dragSaidOf`; words `POOL_WORD` "Pool", `RESERVE_WORD` "Reserve", `RESERVE_EMPTY` "Empty — drop a token from a unit here to hold it", `RESERVE_POST` " in reserve" |
| `[S07.8]` new | the gesture (see the banner). Exports `dragAnswers`, `dragInFlight`, `DRAG_PX` |
| `[C04]` | `.brd-pool*`, `.drg-*`, `#drag-layer`, `.drg-ghost`, with no new colour, no `url(`, no SVG |
| shell | `<div id="drag-layer" aria-hidden="true">` after `#err-panel`, outside `#app`; one How-to paragraph |
| `[S09.14]` new | 9 records (7 rows, 2 info), all state work, none behind a no-DOM bracket |

### The drag kinds, each a real `page.mouse` drag in Chrome and Edge at 1920x1080 and 1366x768

| cell | drag | read back |
|---|---|---|
| 31a | Cat 1 health → Cat 2 | 3→2 / 3→4, +1 commit, +1 undo; in flight 13 lit, 0 refused, Cat 1 home, source node identical and attached at the drop, 0 commits while live |
| 31b | Mech 1 shield → Cat 1 (across) | 3→2 / 0→1 |
| 31c | Cat 1 health → Cats pool | reserve `{"hp":1}`, drawn at the board's own token width |
| 31d | Cats reserve → Mech 1 (other side) | Mech 1 6→7, reserve key gone, empty sentence back |
| 31e | Cats action point → Mechs pool | 3→2 / 3→4; in flight all 12 units refused, Mechs pool the only lit target |
| 31f | action point → Cat 2 (**refused, scope**) | card marked refused before release; nothing moves; Cat 2 says the op's sentence, equal to the answer's; **on screen** |
| 31g | Cat health → Mech 1 under a ceiling of 4 (**refused, bound**) | `Mech 1 holds at most 4 "Health", so it cannot take another.`, **on screen** |
| 31h | Escape mid-drag, then release over a lit card | nothing written |
| 31i | 3px wobble on a token; the same wobble on a stepper + | click on the token = nothing; stepper = exactly one step |
| 31j | the same drag twice, **66 ms apart** (COALESCE_MS 500) | +2 undo entries, one Ctrl+Z takes one back; **control**: two + clicks on one stepper fold to 1 entry |
| 31k | 1.1 s hold on a stepper + | ramp runs (9 steps), 1 undo entry, no drag in flight, stops on release |
| 31l | Cat 9 → the pool while the pool is scrolled out of sight | edge autoscroll brings it in; reserve `{"hp":1}` |
| 31 | layout | pool under the name and above Damage, on screen at load at both sizes; dashed empty slot; words ≥18px; layer outside `#app`, `pointer-events:none`; sources `touch-action:none`, `cursor:grab` |

### Screenshots, read back

Eight shots per column (`d41-*` in `SHOT_DIR`). I read back: in-flight bound (Chrome 1920: cats
lit, mechs dashed and dim, Mech 1 carrying the heavier dashed outline, ghost dimmed over a refused
target); refused bound (Chrome 1920: the sentence under Mech 1); in-flight side-scope (Edge 1366:
only the Mechs pool lit, the picked triangle dimmed); after pool → other side (Edge 1366: Mech 1 at
7, both totals moved); after unit → pool (Chrome 1366: one board-size token in Reserve); in-flight
unit → unit (Edge 1920); refused scope (Chrome 1366, **before and after the fix below**); and the
edge-scroll smoke. **The picture-only-defect streak continued and one defect was found by a
screenshot alone**: see Deviation 2.

---

## Measurements

| | value |
|---|---|
| `[S09.14]` predicate walk: moved / same-end / refused at floor / at ceiling / on scope | 45 / 22 / 69 / 26 / 138, 0 disagreements, 0 defects |
| `[S09.14]` seven drags: lit / home / refused, each checked against a real `moveToken` | 45 / 6 / 47, 0 disagreements |
| moveCheck asked 1176 times (6 types x 14 x 14 ends) | 0 commits, 0 undo, state byte-identical |
| stepper hold 1.1 s, HEAD 2e80179 vs HEAD after, 3 holds x 4 columns each | **9/1 in all 24** |
| two drags release to release | 65–67 ms (COALESCE_MS 500) |
| Cats pool at load, 1920x1080 / 1366x768 | y 330–537 / 330–565 |

### The floors, re-derived in the open

The pool adds **3 strings per side**: "Pool", "Reserve", and the empty sentence. These were
measured on the stub page with the gate's own `harvestInto`, copied verbatim, undressed, at four
roster shapes, HEAD vs after:

| roster | setup before → after | fight before → after |
|---|---|---|
| 2x2 | 157 → 163 (+6) | 305 → 311 (+6) |
| 3x3 | 171 → 177 | 365 → 371 |
| 5x3 | 185 → 191 | 425 → 431 |
| 9x3 | 213 → 219 | 545 → 551 |

The per-unit cost is unchanged (30 a unit in the fight harvest), so the pool is roster-independent.
**FIGHT_FLOOR 248 → 254**, by its own method. A filled reserve swaps one sentence for a tooltip
plus an accessible name per type, so a dragged board draws more and never fewer, and +6 is the
lower bound. The How-to paragraph added one more string (+7 at close, 227 / 552 at 9x3). That
string belongs to `#howto`, which has its own floor (31 → 32 against 24), and D-38 left this base
unmoved for the whole tab. **Check 47's floor stays 117** (harvest 220 → 227): it is a tripwire
and not a ratchet, which is DIALOG_FLOOR's stated rule. Both notes are in `tests/selftest-node.cjs`.

---

## Which claims live where

- **Node tier (CI, a fresh checkout):** moveCheck ≡ moveToken; dragAnswers ≡ the drop, end by end;
  asking writes nothing; the drag is in no slice (`[S09.14]`). The pool's place, words, marks, no
  routing attributes, no tab stops, and the layer's and ghost's `pointer-events:none` read from the
  stylesheet (129). Reserve readings as authored, the fingerprint covering name and style, and node
  identity across an unrelated frame (129b). The threshold, the lights, the ghost in the layer at
  its published coordinates, source identity, Escape, pointercancel, and no commit while live
  (129c).
- **Browser tier only:** **the drop itself**, because it resolves the entity with `elementFromPoint`
  and the stub has no layout. That covers every one-move-per-drop claim, the refusal sentence
  arriving at the drop, the sentence being on screen, the stepper ramp's timing, edge autoscroll,
  real hit-testing through the ghost, and all layout and computed style. Probe P7 (a drop that
  commits twice) is **green in the node tier by construction** and red in 28 browser cells.

---

## Probes — committed first, run on scratchpad copies of HEAD, working tree never touched

Each probe copied the committed tree, applied one exact-once EOL-aware replacement (the patcher
refuses to run if its target is not found exactly once), and ran the node gate under a hard
timeout. The browser half ran the thirteen D-41 cells in all four columns. **No row threw and
nothing hung**: every node run finished in 16–17 s, and every browser run completed all 56 cells.

| probe | change | node tier | browser tier |
|---|---|---|---|
| **P1** ghost intercepts the hit test | `pointer-events:none` off layer and ghost | **GREEN (1391/0, 225/225)**, so the clause fired: the fix is **check 129** reading both rule bodies by name (commit 0b225fa), and a rerun under it is red | 52 of 56 red, all 13 cells |
| **P2** a refused drop lights as valid | refusal answers `'lit'` | [S09.14] ×2, 129c | 31e, 31f, 31g |
| **P3** surface restates the rules | a hand-written scope rule, no bounds | [S09.14] ×2 | 31f, 31g |
| **P4** source rebuilt under the pointer | structural frame at drag begin | 129c (source detached) | 31a (identity) |
| **P5** no threshold | `DRAG_PX = 0` | [S09.14] arm row, 129c | 31i |
| **P6** Escape ignored | handler no longer ends the drag | 129c | 31h |
| **P7** a drop commits twice | a second `moveToken` dispatch | green, **browser-only by construction** | 31a–e, 31j, 31l |

---

## Deviations from Plan

### 1. [Rule 2 — Missing critical functionality] Edge autoscroll while a drag is live
- **Found during:** the first real-browser smoke at 1366x768.
- **Issue:** once the page had scrolled to a lower cat, the pool was off screen, and a drag had no
  way to reach it. A finger cannot wheel-scroll while it holds a token.
- **Fix:** a live drag within `DRAG_EDGE_PX` (56) of the window's foot, or of the sticky bar's
  foot, scrolls the window by up to `DRAG_EDGE_STEP` (22) px per frame and re-reads the target on
  each step. Cell 31l drives it with the pool measured fully above the window.
- **Commit:** 293e171

### 2. [Rule 1 — Bug, found by a screenshot] A refused drop's sentence was written below the window
- **Found during:** reading back `d41-refused-scope` at 1366x768. Every row was green.
- **Issue:** the said line is the card's last child. Dropping on a card near the fold wrote the
  op's sentence at y 773–868 in a 768px window.
- **Fix:** after `refuseLoudly`, `scrollIntoView({block:'nearest'})`. 31f and 31g now require the
  line on screen. **RED recorded** on 293e171 (31f and 31g at 1366 in both browsers, 52/4), GREEN
  after.
- **Commit:** 1c8cd9e

### 3. [Rule 1 — Bug in cells of mine] Four cells passed alone and failed in the full suite
- **Issue:** by cell 31 the undo stack is full at `UNDO_LIMIT` 30, so a drag that pushed an entry
  left the depth at 30. 31a, 31b, 31j and 31k failed in all four columns (410/16).
- **Fix:** `d41Fresh` restores the reset board through `[S03]`'s writer, which empties the stack.
  Full suite 426/0.
- **Commit:** 401e9e5

### 4. [Rule 1 — Weak cell] 31j did not test what it claimed
- **Issue:** the first version's two drags were 911 ms apart, beyond COALESCE_MS, so it proved
  nothing about folding.
- **Fix:** two fast drags (66 ms apart, required under COALESCE_MS), plus a control in the same run
  (two stepper clicks fold to one entry). Done before the first commit of the cell.

### 5. Smaller, all before commit
- The first draft of `[S06.16]` named a field `verdict`, which Layer A bans document-wide. It was
  renamed to `answer`.
- A Python edit wrote the artifact with LF endings. CRLF was restored before any commit, and the
  blob is unaffected (git stores LF).
- `App.render.flush` does not exist. The cells use `App.state.flush()`.

## Rows turned in the open

| row | RED printed | now |
|---|---|---|
| check 57 | `occurrences: 10`, strays `.setProperty('--drg-x', …)` and `--drg-y` | `STYLE_OK` + `'--drg-'`, count 10, history paragraph added |
| FIGHT_FLOOR | n/a (harvest only grew) | 248 → 254, table above |

## Instruments

| | baseline (HEAD 2e80179, pristine copy) | after (HEAD 275bd3f) |
|---|---|---|
| `node tests/selftest-node.cjs` | 1382 / 0, exit 0 | **1391 / 0, exit 0** (+9, `[S09.14]`) |
| interaction gate | 222 of 222 | **225 of 225** (+129, 129b, 129c; 57 turned) |
| stub-drift | 164 shell ids | **165** (`drag-layer`, KNOWN_IDS + stub node) |
| `node tests/selftest-dom.cjs` | 1506 / 0 | **1515 / 0** (tier delta still 124) |
| `tests/browser-checks.mjs` | 374 / 0 headless | **426 / 0 headless** (+13 cells × 4 columns) |
| live `#selftest`, real Chrome + Edge | 1506 / 0 both | **1515 / 0 both**, no page errors |

The browser and live baselines were re-taken on a scratchpad copy of 2e80179, because the first
baseline run overlapped my first edits. Ops beyond the exported predicate, the codec and `DEFAULTS`
are untouched: the `[S05]` diff is the guard block moved and one export added. No new hex, `url(`,
SVG or markup sink. The FORBIDDEN scan and Layers A, B and C are green.

## Prior attempt

Lifted from `wip/d41-pre-amendment-drag-ui` (d081c3b), cited at the site: the 6px threshold,
pointer capture on `#board` rather than on the source, `elementFromPoint` resolved to the entity,
the ghost-in-a-layer idea and its `--drg-` placement, and the entity/said-line decorator shape. Not
used: its tray, its `addOneToken`/`moveOneToken`/`dropRefusal` ops, and its within-a-side rule. The
branch is untouched.

## Known Stubs

None.

## Self-Check: PASSED

Files present: `05-D41b-SUMMARY.md`, `cats-vs-mechs.html`, `tests/stub-dom.cjs`,
`tests/selftest-node.cjs`, `tests/browser-checks.mjs`, `deferred-items.md`. Commits present:
293e171, 1c8cd9e, d58d7f5, 0b225fa, 401e9e5, 275bd3f, plus d081c3b (the parked branch, cited).
Final instruments were measured on 275bd3f. The artifact is byte-identical to 1c8cd9e, on which the
live `#selftest` read 1515/0 in both browsers: node 1391/0 exit 0, 225 of 225, 165 shell ids, DOM
1515/0, browser 426/0 headless exit 0.
