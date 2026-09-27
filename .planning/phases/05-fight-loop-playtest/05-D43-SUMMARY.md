---
phase: 05-fight-loop-playtest
plan: D43
subsystem: style+render+selftest+gate+browser
tags: [d-43, redirect, battle-scene, ff1, sprites, formation, clamp, c19, s06-17, s09-15]
requires:
  - phase: 05-fight-loop-playtest
    plan: D42
    provides: "the battle scene: sprites, formation, clamp, names above sprites, cells 32-32j"
provides:
  - "[C19] --scn-big: 2, one multiplier for a mech's sprite and box; --scn-spr / --scn-h per unit; field heights for 5 and 6 rows"
  - "[S06.17] sceneMechGrid, SCENE_MECH_COLS, SCENE_CATS / SCENE_MECHS strips, SCENE_BAND / SCENE_FOOT in rows"
  - "gate check 130c; browser cells 32k-32n (4 cells x 4 columns)"
key-files:
  created: [.planning/phases/05-fight-loop-playtest/05-D43-SUMMARY.md]
  modified: [cats-vs-mechs.html, tests/selftest-node.cjs, tests/browser-checks.mjs, .planning/STATE.md]
key-decisions:
  - "Mechs are exactly 2x a cat (96/128px against 48/64px): a whole number of screen pixels per sprite pixel, pixelated. Cats unchanged."
  - "Mechs stand in as few rows as six columns allow. The shipped three stand in ONE ROW, so the shipped scene is byte-for-byte D-42's height (294-729 / 294-669)."
  - "24 a side: the scene GROWS (field rows 4 -> 6, 480 -> 720 / 400 -> 600), decided by measurement. Four rows of 152px mechs cannot fit in less: the minimum is about 700 / 560, so tightening could save at most 20-40px. Advance stays reachable (cell 32k, 18c's sweep at 24 a side)."
  - "A dead mech turns in place (no 12px drop), so its turned square ends above its name. The cat keeps D-42's drop."
metrics:
  duration: 75min
  completed: 2026-09-27
---

# Phase 5 D-43: the mechs are much bigger than the cats — Summary

**Every mech in the battle scene is now drawn at twice a cat's size, so four times the area:
96px against 48, and 128px against 64 on a projector-sized window. The pixels stay crisp and the
cats are unchanged. The shipped three mechs stand side by side in one row, so the shipped scene
is exactly as tall as it was. At 24 a side the scene grows to hold four rows of big mechs.**

## What changed

- **[C19]:** `--scn-big:2` is the only place the ratio lives. The sprite size (`--scn-spr`) and
  the box height (`--scn-h` = sprite + 24px for the name line) are set per unit. That means both
  the stylesheet clamp and [S07.9]'s drag clamp (which already read the node's own rectangle) use
  each sprite's own size. The field has heights for 5 and 6 rows. A dead mech turns in place.
- **[S06.17]:** mechs are laid out in `sceneMechGrid`, up to 6 a row. The field is
  `max(3, cat rows, mech rows + 2)` rows. Cats keep the left strip (0.03 + 0.44) and mechs get a
  wider right strip (0.48 + 0.49). The scenery band and the foot are measured in field rows, which
  gives exactly D-42's 0.23 / 0.74 at three rows.

## Measured (real Chrome and Edge, headless; the two agreed)

| | 1920x1080 | 1366x768 |
|---|---|---|
| sprite px, cat / mech | 64 / 128 | 48 / 96 |
| shipped 9v3 scene (unchanged from D-42) | 294-729, field 1582x360, 3 rows | 294-669, 1304x300, 3 rows |
| 24v24 scene, D-42 -> D-43 | 294-849 -> **294-1089**, 1582x720, 6 rows | 294-769 -> **294-969**, 1304x600, 6 rows |
| mech row pitch at 24 vs mech box | 156.6 vs 152 | 130.5 vs 120 |
| Advance at 24 a side, offsets with picker rows | 986-1033 / 986-1033 / 725-772: wholly on screen | 674-721 / 674-721 / 406-452: wholly on screen |
| Mech 1 dragged past each side: gap to that side | 0-0.1px, kept share = half its own box | 0px, same |

**The cost of 24 a side:** the scene is no longer whole on screen at load, 9px over at 1080 and
201px over at 768 (D-42 was 1px over at 768). Advance is a sticky footer and its reachability is
what the rule protects, and that holds.

## Rows and cells turned in the open (D-43 cited at each)

| row / cell | RED recorded | now |
|---|---|---|
| `[S09.15]` formation row | actual `[3,6,3,3,3,3,1,6,4,…]` vs D-42's `[3,4,3,3,3,1,3,6,4,…]` | the new shape, plus mechs at 24 = 6 columns of 4 |
| browser 32j | `rows: "6"`, 466/4 (HEAD cells on the new artifact), all four columns | `rows === '6'` |

## New assertions

- **Gate 130c:** reads the ratio off [C19] (cat 48/64, `--scn-big` 2, mech 96/128, all multiples
  of 16, the three rules that apply it). It then lays out **every roster 1v1..24v24 in pixels at
  both driven field widths**: no sprite over a sprite, no sprite over another unit's name, no two
  names overlapping, and every box inside the field. 1152 layouts, first bad: none.
- **Browser 32k** (24 a side: 2x ratio, nothing over anything, Advance reachable), **32l** (the
  shipped board: 2x, one row, 3-row field, whole on screen), **32m** (a dead big mech: turned,
  grey, its turned rectangle ends above its name), **32n** (Mech 1 dragged past each of the four
  sides stops there, with the kept share equal to half its own box).

## Probes: committed first (126ff78), run on scratchpad copies, working tree untouched

| probe | change | node tier | DOM | browser (scene cells only) |
|---|---|---|---|---|
| **PA** mechs back at the cats' size (required) | `--scn-big:1` | **130c** (ratio `[1,48,64,48,64]`) | green | **74/12**: 32k, 32l, 32n x4 |
| PB box height from the cat's size | `--scn-h:calc(var(--scn-px) + 24px)` | **130c** (rule gone) | green | **70/16**: 32e, 32g, 32j, 32n x4 |
| PC field not grown (D-42's height formula) | `sceneFieldRows` as D-42 | **130c** (`small 1v7: m5 over the name of m1`), `[S09.15]` | `[S09.15]` | **78/8**: 32j, 32k x4 |
| PD a dead mech drops the cat's 12px | `translateY(12px) rotate(90deg)` | green (browser-only claim) | green | **82/4**: 32m x4 |

The unpatched control ran 86/0. No cell threw.

## Screenshots, read back (24 in `shots-d43`: fresh, dead, four sides x 4 columns; plus d42-24)

The mechs read as **much bigger** in every shot. On the shipped board three large grey mechs face
a 3x3 block of cats, and at 24 a side there is a 6x4 block of big mechs beside a 6x4 block of
small cats. **Every name is legible**, all 48 included, at both sizes in both browsers. The dead
Mech 3 lies on its side in grey above its dimmed name. Mech 1 dragged past each side sits pressed
against that side. At the top, its antenna overlaps the scenery band, as cats did under D-42.

## Instruments

| | before (09f5f75) | after (126ff78) |
|---|---|---|
| node | 1399/0 exit 0 | **1399/0** exit 0 |
| gate | 227/227 | **228/228** (+130c) |
| shell ids | 170 | **170** |
| DOM | 1524/0 | **1524/0** |
| browser headless | 470/0 | **486/0** (+4 cells x 4) |
| live `#selftest` Chrome / Edge | 1524/0 both | **1524/0 both**, no page errors, store untouched |

The artifact diff is confined to [C19], [S06.17] and [S09.15]. Ops, codec and `DEFAULTS` are
untouched. There is no new hex, `url(`, SVG, markup sink or `.style` access (check 57 unmoved).

## Deviations from Plan

None. There is one known limit, found by arithmetic and not measured: the formation is proved at
the two driven window sizes. On a window between them (for example 1600x900, where 128px mechs
switch on and the field would be about 1262px wide), a row of six mechs sits about 103px apart and
neighbouring canvases overlap by about 25px. Names still paint above sprites.

## Known Stubs

None.

## Self-Check: PASSED

Files present: `05-D43-SUMMARY.md`, `cats-vs-mechs.html`, `tests/selftest-node.cjs`,
`tests/browser-checks.mjs`. Commit present: 126ff78.
