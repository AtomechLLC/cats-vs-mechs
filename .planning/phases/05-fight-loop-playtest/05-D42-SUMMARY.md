---
phase: 05-fight-loop-playtest
plan: D42
subsystem: shell+style+render+interactions+selftest+gate+browser
tags: [d-42, redirect, battle-scene, ff1, sprites, canvas, pointer-events, localStorage, s06-17, s07-9, s09-15, c19, check-57, fight-floor]

requires:
  - phase: 05-fight-loop-playtest
    plan: D41b
    provides: "the pointer-drag ideas reused (threshold, capture on a static node, Escape as cancel) and check 57's custom-property idiom; none of its state"
  - phase: 05-fight-loop-playtest
    plan: D37
    provides: "the node-identity lesson (probe G): a control rebuilt under the pointer is only caught by comparing nodes"
  - phase: 05-fight-loop-playtest
    plan: D31
    provides: "Advance as a sticky footer, whose reachability is cells 18 and 18c"
provides:
  - "#scene: the fight band's first child, five shell ids (scene, scene-head, scene-hint, scene-reset, scene-field)"
  - "[C19]: an FF1 battle window (--ink rim, --accent-into---bg fill, a scenery band of --accent and --green mixes), sprites placed by two unitless shares clamped by the stylesheet, 64px sprites on projector-sized windows"
  - "[S06.17]: pixel cat and mech painted on <canvas> from computed tokens, names as real text, dead read from the stored alive flag only, keyed on data-scn-unit (no data-k), sprites never rebuilt while their unit stays; places in the region's scope, best-effort in localStorage under cvm.v1.scene, pruned when a unit leaves"
  - "[S07.9]: the gesture: 4px threshold, capture on the static field, clamp, Escape / pointercancel / lostpointercapture / blur put back, Back to formation by click or keyboard; writes no state, no undo, no build code"
  - "App.render.scene / scenePlace / sceneKeep / sceneHome / sceneSaid and the pure pieces (sceneSlot, sceneFieldRows, sceneClampFrac, sceneParse, scenePrune, sceneGet, scenePut, scenePalette, sceneRgb, SCENE_KEY, SCENE_SPRITES, SCENE_DOWN_SAID); App.interactions.sceneHeld / SCENE_DRAG_PX"
  - "[S09.15] 'the battle scene': 7 rows above the no-DOM bracket, 1 sprite row behind it"
  - "gate checks 130 and 130b; browser cells 32 and 32a-32j (11 cells x 4 columns)"
  - "stub: the five ids, a recording 2D context on <canvas>, and getComputedStyle reading the shell's own :root tokens"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "a picture positioned by unitless shares that the stylesheet clamps, so a place saved at one window size lands inside the frame at any other and a hidden field needs no measurement"
    - "a region whose words must be read by Layer C keeps them as real text leaves; a canvas holds pixels only, and a row counts each name in the harvest by region"
    - "legibility asserted by hit test: elementFromPoint at a label's centre and inner corners must find the label, because comparing labels with labels cannot see a label under a picture"
    - "view state that no slice may hold lives in the region's closure and in a namespaced, try-wrapped store that a self-test page never touches"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D42-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/stub-dom.cjs
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/deferred-items.md
    - .planning/STATE.md

key-decisions:
  - "THE SCENE IS THE FIGHT TAB'S FIRST PANEL, ABOVE THE LANE, CHOSEN BY MEASUREMENT. Three places were measured in real Chrome and Edge at both sizes with three rounds resolved. Advance's reachability (cell 18c's sweep) held at all of them in all 16 runs, so it did not decide. What decided: top is the only place where the scene is whole on screen at load (294-729 of 1080, 294-669 of 768), it keeps the lane directly above the round it leads into (D-28), and it is FF1's own composition (the picture above, the menus below). The cost is stated, not hidden: the round-state panel moves off the first screen (727 -> 1180 at 1080, 653 -> 1046 at 768). The one-line alternative (after #fightbar) costs the round nothing and is in deferred items."
  - "WHICH ROSTER: the fight's while a fight runs (the battlefield's units, in its order) and the build's otherwise, so a room can arrange everyone before pressing Start. Names are fgUnitName's, read every frame. No op renames a unit; the rename cell writes one through [S03]'s writer, which is what the day a rename op exists will look like."
  - "DEAD IS THE STORED FLAG. A fight unit is drawn lying down (a quarter turn toward its own side, greyscale) when and only when alive === false. A mech at zero health that nobody ruled on stands, which check 130, [S09.15] and cell 32c each read on the same board."
  - "POSITIONS ARE CENTRE SHARES, CLAMPED TWICE. [S07.9] clamps against the real rectangles; [C19] clamps left and top with clamp() against the field's own percentage. So what is saved is what is drawn, and a place saved on a 1920 window lands inside a 1366 one."
  - "THE STORE IS BEST-EFFORT AND FOREIGN. Key cvm.v1.scene (Chrome shares one bucket across file:// pages). Every access is in a try. What comes back is parsed as foreign: unit-shaped keys only, pairs of finite numbers only, clamped, at most two rosters. A saved place for a unit that left is DROPPED on the frame it leaves, because nextUnitId reuses ids. A page opened with #selftest never touches the store, because the suites trim rosters and each prune would throw a student's layout away (measured: the live #selftest leaves the key absent)."
  - "COLOURS ARE READ OFF THE COMPUTED STYLE EVERY FRAME, not on build. A fingerprint that forgot the tokens would paint stale (probe CI's lesson), and the read costs the whole scene paint 0.02-0.08 ms."
  - "check 57 turned 10 -> 12 in the open (--scn-, RED recorded). FIGHT_FLOOR 254 -> 257 by its own method: the scene costs exactly 3 + 2n at five roster shapes, and only the 3 is roster-independent. Check 47's floor held at 117 (harvest 227 -> 254)."

requirements-completed: []

metrics:
  duration: 86min
  completed: 2026-09-26
---

# Phase 5 D-42: an FF1-style battle scene — Summary

**The fight tab now opens on a battle window in the style of Final Fantasy 1. It has a white rim
around a panel of the old menu blue, a band of sky and grass along the top, and every unit as a
16x16 pixel sprite: orange cats sitting on the left facing grey mechs on the right, each with its
name under it in a monospace system font. A student can drag any sprite anywhere inside the frame.
It stops at the edges, stays where it was let go, comes back after a reload, and returns to
formation with one control. A unit ruled dead lies down and goes grey. A unit at zero health that
nobody ruled on still stands. Nothing in the scene is a control over the fight: a drag writes no
state, no undo entry and no build code.**

---

## Placement, measured

Real Chrome and real Edge, three rounds resolved (cell 18's board), page scroll 0. All figures are
from the top of the document. The two browsers agreed to the pixel.

| place | 1920x1080: scene / round-state top / whole at load | 1366x768: scene / round-state top / whole at load | 18c sweep |
|---|---|---|---|
| no scene (HEAD before) | — / 727 | — / 653 | holds |
| **first child of the band (shipped)** | **294-729 / 1180 / yes** | **294-669 / 1046 / yes** | **holds** |
| between the lane and the round | 669-1104 / 1180 / no | 596-970 / 1046 / no | holds |
| after the round | 2146-2580 / 727 / no | 2072-2447 / 653 / no | holds |

At 24 a side the scene is 294-849 of 1080 and 294-769 of 768, one pixel over at the smaller size.

## What shipped

| where | what |
|---|---|
| shell | `<section id="scene">` as `.fg-band`'s first child: `#scene-head` "Who is who", `#scene-hint`, `#scene-reset` "Back to formation" (a `brd-btn`, UX-02 text), `.scn-win` > `#scene-field` |
| `[C19]` new | the window, the scenery band (two gradient layers from four `color-mix` custom properties), `.scn-unit` positioned by `--scn-x`/`--scn-y` inside `clamp()`, `.scn-unit--down`, `.scn-name` above every canvas, the 64px media rule |
| `[S06.17]` new | sprites, formation, clamp, store, palette, paint (`SYNC_HOOKS`), keep, home |
| `[S07.9]` new | the gesture, bound through `LATE_BINDERS` |
| `[S09.15]` new | formation, clamp, store parsing, pruning, store absence, palette from tokens, no slice; one sprite row behind the bracket |

### The formation

FF1's arrangement. A side of up to 4 stands in one column; up to 9 stand in three rows; above that,
four rows. So 9 cats are a 3x3 block, 3 mechs one column, and 24 a side is 6 columns by 4. Rows
fill left to right, so Cat 1 is top left. Field height is 300 (3 rows) or 400 (4 rows), and 360 or
480 on a window of at least 1600x900. The row spacing is set by arithmetic so it never falls below
a sprite plus its name.

## Measurements

| | value |
|---|---|
| field, 9v3, 1920 / 1366 | 1582x360 (64px sprites) / 1304x300 (48px) |
| field, 24v24, 1920 / 1366 | 1582x480 / 1304x400, rows 4 |
| `App.render.scene()` alone, 9v3 / 24v24, Chrome | 0.033 / 0.077 ms |
| `sync()` 9v3, before -> after, Chrome / Edge | 0.403 -> 0.467 / 0.338 -> 0.403 ms |
| `sync()` 24v24, before -> after, Chrome / Edge | 0.983 -> 1.077 / 0.882 -> 0.903 ms |
| `structure()` 24v24, before -> after, Chrome / Edge | 4.195 -> 4.530 / 3.520 -> 3.430 ms (noise) |
| nodes the scene adds, 9v3 / 24v24 | 42 / 150 |
| harvest cost | exactly 3 + 2n strings at every roster shape |

### The floors, re-derived in the open

Harvested by the gate's own `harvestInto`, copied verbatim, booted as `tests/selftest-dom.cjs` boots,
undressed, on a scratch copy of HEAD 07f795e and on the working tree:

| roster | setup before -> after | fight before -> after | from `#scene` |
|---|---|---|---|
| 2x2 | 164 -> 175 | 312 -> 323 | 11 |
| 3x3 | 178 -> 193 | 372 -> 387 | 15 |
| 5x3 | 192 -> 211 | 432 -> 451 | 19 |
| 9x3 | 220 -> 247 | 552 -> 579 | 27 |
| 24x24 | 472 -> 571 | 1632 -> 1731 | 99 |

**FIGHT_FLOOR 254 -> 257.** The +3 is roster-independent (heading, hint, reset). The +2n is
per-unit (visible name, accessible name) and is not this constant's to carry. Check 47 held at 117.
**The floor cannot catch names painted into the canvas**: that drops n strings from a page still
far above 257. Check 130 therefore counts every name in `#scene` by name, and PROBE P3 is what
that row is for.

## Which claims live where

- **Node tier (a fresh checkout):** the formation, the clamp, the store read as foreign, pruning,
  a missing or refusing store, the palette derived from tokens (and moving with them), the place in
  no slice (`[S09.15]`). On check 92's own dressed page (130): one sprite per fight unit, names as
  text leaves reaching the harvest twice each, dead from the flag, zero-health standing, no routing
  attribute, outside `#board`. The gesture as far as a page with no layout goes (130b): threshold,
  the shares, **node identity across an Advance landing mid-drag**, the clamp, nothing written,
  Escape, reset, pruning. The stub has no store, so every write in 130b went to a missing one.
- **DOM tier:** the sprite row of `[S09.15]` (the tier delta is now 125).
- **Browser tier only:** where the scene sits and that it is whole on screen; the frame's colours
  equal the tokens; **the canvas pixels equal the tokens and follow them when moved**; every name at
  18px or above, monospace, unclipped, **not covered by anything (hit test)**; the dead unit's real
  transform and filter; the drop landing where the pointer let go; the clamp against a real
  rectangle; **a reload restoring places from localStorage**; the store pruned on removal; the
  keyboard reaching the reset; 24 a side. Every screenshot was read back.

## Screenshots, read back

Seven shots per column, 28 in all (`d42-{fresh,renamed,dead,dragged,reloaded,formation,24}` in
`SHOT_DIR`), every one read. **It reads as FF1**: a white-rimmed window with a sky-and-grass band,
a 3x3 block of cats facing a column of mechs, and at 24 a side two 6x4 formations facing each other
across the middle. **Every name is legible** at both sizes in both browsers, including all 48 at 24
a side. The dead cat lies on its back in grey with its name still readable. Mech 1 dragged off the
corner sits pressed into the corner. The reloaded shot is pixel-identical in layout to the dragged
one. The keyboard-reset shot shows the focus ring on "Back to formation".

**The picture-only-defect streak continued.** The first read-back found three defects with every
row green. See Deviation 1.

---

## Probes — committed first (9f452a5, cells hardened at 886dcf6), run on scratchpad copies, working tree never touched

Each probe copied the committed tree with `git show`, applied one exact-once EOL-aware replacement
(the patcher refuses if the target is not found exactly once), and ran the node gate and the DOM
runner under a 180 s timeout, then the D-42 browser cells in all four columns. **No row threw and
nothing hung**: every node run finished in 13-18 s and every DOM run in 4-6 s.

| probe | change | node tier | DOM tier | browser tier |
|---|---|---|---|---|
| **P1** a drop writes state and undo | `sceneKeep` also commits | `[S09.15]` no-slice row, **130b** (commits +1, undo +1) | `[S09.15]` | **40/8**: 32d, 32f in all four columns |
| **P2** the repaint rebuilds sprites mid-drag | the keyed keep made `false` | **130b** (node detached at the Advance; the drop kept nothing) | green (by construction: no gesture here) | **36/12**: 32b (a rename rebuilt the node), 32f (identity), 32g in all four columns. The FIRST run of this probe THREW in 32g, reading a place that was never kept; the cells were hardened to fail instead (886dcf6), and this is the rerun |
| **P3** names only in the canvas | the name text never written | **130** (empty names; each name once in the harvest, not twice) | `[S09.15]` sprite row | **20/28**: 32, 32b, 32c, 32d, 32e, 32f, 32j in all four columns |
| **P4** dead inferred from health | `alive === false \|\| hp <= 0` | **130** (the zero-health mech lies down) | `[S09.15]` sprite row | **44/4**: 32c in all four columns |
| **P5** a typed fur colour | `f: 'rgb(255, 138, 92)'` | `[S09.15]` palette row (moving `--coral` moves nothing) | `[S09.15]` | **44/4**: 32a in all four columns |
| **P6** no clamp | `sceneClampFrac` returns the share | `[S09.15]` clamp row, **130b** (0 / 1) | `[S09.15]` | **44/4**: 32g. **32e stays GREEN**, because [C19] clamps the picture too, so the sprite still sits inside the frame. The second clamp doing its job is why the first is caught in the node tier |
| **P7** no pruning | the prune write skipped | **130b** (c9's place kept; the new c9 stands in it) | green (the suite's prune row tests the function, not the call) | **44/4**: 32h in all four columns |
| **P8** an un-namespaced key | `SCENE_KEY = 'scene'` | `[S09.15]` store row | `[S09.15]` | **36/12**: 32d, 32h, 32i in all four columns |

The four probes the brief required (P1-P4) are each red in the node tier, which runs on every fresh
checkout, and in the browser tier in all four columns. P2 and P7 are green in the DOM tier by
construction, and both are red in the gate. Every probe is red in at least two tiers.

---

## Deviations from Plan

### 1. [Rule 1 — Bug, found by screenshots] A name could be under a sprite
- **Found during:** the first read-back of the D-42 screenshots. Every row and cell was green.
- **Issue:** three shapes of one defect. (a) Cat 3 renamed "Whiskerton the Brave" broke mid-word
  into three lines ("Whiskerto / n the / Brave") running down under Cat 6's sprite. (b) Cat 4,
  dropped where cell 32f drops it, painted its sprite over Cat 3's name. (c) The dead cat's turned
  canvas covered part of its own name. Cell 32b compared names with names and could not see any of
  these.
- **Fix:** every `.scn-name` is positioned and lifted over every canvas (the units form no stacking
  context, so one z-index orders all names above all sprites), on a plate of `--bg`, and breaks only
  at a space unless one word is too wide. The box went 104 -> 128px, eleven characters. It is
  `pointer-events:none`, and only the canvas and the name take the pointer, so empty box space does
  not pick a sprite up. The cells now hit-test every name at its centre and four inner corners.
  **RED recorded** on db041bf: 32b, 32c and 32f in all four columns, 36/48. GREEN after: 48/48.
- **Commits:** ed9014e (fix), 9f452a5 (cells).

### 2. [Rule 1 — Cells of mine made stale by the scene] Cells 6b and 20 turned in the open
- **Issue:** both assumed things about the page offset that the scene changed. Cell 6b's fixed 500
  ms wait for a smooth scroll ran out on a scroll now 2156px long (asked 2156, got 1993, last row
  1133-1173 of 1080), at 1920 in both browsers. Cell 20 looked for a lane reading at page scroll 0,
  and at 1366 the lane now begins at 759 of 768 (every reading rejected as off-screen), in both
  browsers. **RED recorded:** 422/4 on the full run.
- **Fix:** 6b polls until the scroll settles (up to 3 s, still a smooth scroll). 20 scrolls the lane
  into view first, the way a student reaches it. Neither claim moved, and each cell's banner
  records the turn. **470/0 after.**
- **Commit:** 9f452a5.

### 3. [Rule 1 — Cell of mine] 32i's first draft was too strict about the keyboard
- **Issue:** Enter is one of `[S07.1]`'s `NAV_KEYS` and turns `ui.kbdNav` on (one `commitUi`, never
  undoable), so "no commit" failed across the keyboard press, in every column.
- **Fix:** the click must commit nothing. Across the keyboard press, the build, the fight and the
  undo depth must not move, and the only `ui` key that may change is `kbdNav`, read key by key.
  Done before the cell was first committed.

### 4. [Rule 1 — Cells of mine] Under PROBE P2 a browser cell THREW instead of failing
- **Found during:** the browser half of the probes. P2 rebuilds every sprite on every frame, so no
  drop is ever kept, and cell 32g read `d42Kept[u].join` on a place that did not exist. The
  TypeError ended the run, and every cell after it went unrun. The brief's rule is that rows FAIL,
  never THROW.
- **Fix:** a missing sprite reads as an empty record, saved and stored layouts go through a safe
  parser, and the drag, pixel and dead-state reads report a missing node instead of dereferencing
  it. 48/48 on HEAD after. The P2 rerun is 36/12, with no throw.
- **Commit:** 886dcf6.

### 5. A process slip, recorded (nothing committed was affected)
- An inline `node -e` inside a double-quoted shell string carried markdown backticks, and the shell
  ran them as command substitutions. The STATE.md draft lost six words. The shell also tried to
  execute the unwritten summary as a script; it failed on the first line and modified nothing. The
  six spots were restored with plain edits before the docs commit, and the diff was read line by
  line. File edits since then use no shell interpolation.

### 6. Smaller, all before commit
- A `[S09.15]` label said "edge", which Layer B bans in string literals. Reworded.
- One expected palette value was mistyped (241/198/185 is what 0.38·fur + 0.62·ink gives).
- Check 130's name count first read 1 for the dead cat, whose accessible name is "Cat 2, ruled
  dead". The count now accepts the name or the name plus `SCENE_DOWN_SAID`.

## Rows turned in the open

| row | RED printed | now |
|---|---|---|
| check 57 | `occurrences: 12`, strays `.setProperty('--scn-x', …)` / `'--scn-y'` | `STYLE_OK` + `'--scn-'`, count 12, history paragraph |
| FIGHT_FLOOR | n/a (the harvest only grew) | 254 -> 257, table above |
| browser 6b | asked 2156 got 1993, at 1920, both browsers | polls to settle |
| browser 20 | lane at 759 of 768, none found, at 1366, both browsers | lane scrolled into view |

## Instruments

| | baseline (HEAD 07f795e) | after (HEAD 886dcf6; the artifact is byte-identical to ed9014e) |
|---|---|---|
| `node tests/selftest-node.cjs` | 1391 / 0, exit 0 | **1399 / 0, exit 0** (+8, `[S09.15]`) |
| interaction gate | 225 of 225 | **227 of 227** (+130, +130b; 57 turned) |
| stub-drift | 165 shell ids | **170** (the five scene ids, KNOWN_IDS + stub nodes) |
| `node tests/selftest-dom.cjs` | 1515 / 0 | **1524 / 0** (tier delta 124 -> 125) |
| `tests/browser-checks.mjs` | 426 / 0 headless | **470 / 0 headless** (+11 cells x 4 columns) |
| live `#selftest`, real Chrome + Edge | 1515 / 0 both | **1524 / 0 both**, no page errors, the store untouched |
| Layer C setup / fight harvest (shipped board) | 227 / 732 | 254 / 759 (floors 117 / 257) |

Ops, the codec and `DEFAULTS` are untouched. `[S01]` through `[S05]` and `[S08]` are
byte-identical to 07f795e (compared region by region, EOL-normalised), and the artifact's whole
diff is 1102 insertions and 0 deletions. No new hex (107f green), no `url(`, no ` src=`, no SVG, no markup sink (FORBIDDEN scan green).
Layers A, B and C are green, and not one word in the scene names an outcome (cell 32 scans the
scene's own text as well).

## Known Stubs

None.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: storage-read | cats-vs-mechs.html [S06.17] | First read of `localStorage` in the artifact. The value is treated as foreign: JSON parsed in a try, unit-shaped keys only (`/^[cm]\d{1,6}$/`), pairs of finite numbers clamped to [0,1], at most 48 entries. It is written only as two CSS custom-property numbers and never reaches the state, the DOM as text, or the build code. |

## Self-Check: PASSED

Files present: `05-D42-SUMMARY.md`, `cats-vs-mechs.html`, `tests/stub-dom.cjs`,
`tests/selftest-node.cjs`, `tests/browser-checks.mjs`, `deferred-items.md`, `STATE.md`. Commits
present: db041bf, ed9014e, 9f452a5, 886dcf6. Final instruments: node 1399/0 exit 0, 227 of 227,
170 shell ids, DOM 1524/0 (on the tree committed at 9f452a5, whose artifact and gate files are
unchanged since). Browser 470/0 headless exit 0, run on 886dcf6 after the hardening. Live
`#selftest` 1524/0 in real Chrome and real Edge on the ed9014e artifact, which is the shipped one.
