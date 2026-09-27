---
phase: 05-fight-loop-playtest
plan: D44
subsystem: shell+style+render+interactions+selftest+gate+browser
tags: [d-44, redirect, battle-scene, ffv, 16-bit, sprites, backdrop, picker, localStorage, c19, s06-17, s07-9, s09-15, check-130c, check-130d, fight-floor]
requires:
  - phase: 05-fight-loop-playtest
    plan: D42
    provides: "the battle scene: canvas sprites from tokens, names as text, the keyed paint, the drag, the store idiom, cells 32-32j"
  - phase: 05-fight-loop-playtest
    plan: D43
    provides: "--scn-big, per-unit --scn-spr / --scn-h, the formation, gate check 130c, cells 32k-32n"
provides:
  - "[S06.17] SCENE_SPRITES_16 (a 24px tabby, a 48px walker), scenePalette16 (every shade a token mix), an SNES backdrop painted in one putImageData (sceneBackPalette, sceneRidges, sceneBackAt, SCENE_BACK), SCENE_GENS, and the generation as view state (sceneGen, sceneSetGen, sceneGenParse/Get/Put, SCENE_GEN_KEY cvm.v1.scene-art, SCENE_GEN_DEFAULT '16')"
  - "[C19] the picker (.scn-gen-*), the FFV window, the 16-bit field and backdrop rules; shell ids scene-gen, scene-gen-16, scene-gen-8, scene-back"
  - "[S07.9] the picker's two listeners (no data-act)"
  - "[S09.15] six rows; gate 130c over both generations, new 130d; browser 32o-32v"
key-files:
  created: [.planning/phases/05-fight-loop-playtest/05-D44-SUMMARY.md]
  modified: [cats-vs-mechs.html, tests/stub-dom.cjs, tests/selftest-node.cjs, tests/browser-checks.mjs, .planning/phases/05-fight-loop-playtest/deferred-items.md, .planning/STATE.md]
key-decisions:
  - "16-bit sprites are 2 screen pixels a sprite pixel at EVERY window size: a 24px cat drawn at 48, a 48px mech drawn at 96. On a projector-sized window that is smaller than the 8-bit pair's 64/128. 64 is not a whole multiple of 24, and 72/144 does not fit the formation (six 144px mechs = 864px against a 775px strip at 1920). Recorded, deferred item D-44.1."
  - "Shade ramps are token mixes, SNES-style: shadows mix toward a TINTED dark (--bg with --accent-2 for fur, with --accent for plate), highlights toward --gold / --ink. The tokens reach every colour needed, so there is no literal and nothing had to be justified."
  - "The dead pose is D-42's in both generations: [C19]'s quarter turn and greyscale, class written from the stored flag only."
  - "The backdrop fills the whole field (sky, clouds, a snowy range, hills, tufted ground), not only the top band: an SNES battle background is the ground the party stands on. Names keep their plates, and every one still hit-tests on top."
  - "FIGHT_FLOOR 257 -> 262: the picker costs exactly +5 harvested strings at all five roster shapes, all roster-independent."
metrics:
  duration: 80min
  completed: 2026-09-27
---

# Phase 5 D-44: 16-bit scene art by default, the 8-bit art kept, and a picker

**The battle scene now opens in a 16-bit generation at Final Fantasy V's level of detail. The cats
are a 24-pixel orange tabby: standing alert, tail up, facing the mechs, with four shades of fur, a
cream chest and muzzle, green eyes, a pink nose and tabby stripes. The mechs are a 48-pixel walker
facing the cats: plated, a glowing visor, a gold-trimmed chest, a pauldron with rivets, an arm
cannon with barrel rings, jointed legs and an antenna lamp. The far arm and leg are set back in
shade. The scene stands in front of an SNES battle background: a banded, dithered sky, clouds, a
snow-capped range, green hills, and grass ground with tufts. It is framed by a blue graded window
with a bevelled rim. D-42's art is the 8-bit generation, unchanged. A "16-bit" / "8-bit" pair of
buttons in the scene header switches between them. The choice is kept on this computer only, and
never in the state, the undo stack or the build code. Switching moves no sprite and keeps every
dragged place, even for a sprite being dragged at that moment.**

## What shipped

| where | what |
|---|---|
| shell | `#scene` carries `data-scn-gen="16"`. `#scene-gen` (role=group, "Sprite art") holds `#scene-gen-16` and `#scene-gen-8`, each a label and a real tick node in the file's pressed idiom. `#scene-back` is the backdrop canvas, in a clip box under the field |
| `[C19]` | the picker, `.fg-pill`'s family under its own prefix and added to [C16]'s ramp list and to its reduced-motion copy. The 16-bit window: a graded fill, a rim of `--ink` on top and left and `--ink-dim` on bottom and right, and an inset bevel. The 16-bit field: `--scn-px:48px`, no picture of its own. The backdrop box: `inset:6px`, clipped, `pointer-events:none`, the canvas drawn 2048x720 pixelated |
| `[S06.17]` | the sprites, the palette, the backdrop (`sceneBackAt` is pure; one `putImageData`, repainted only when its colour signature changes), `SCENE_GENS`, the generation's view state, and the picker's paint. A switch resizes each canvas IN PLACE and redraws it: the same node and the same place |
| `[S07.9]` | two click listeners, `App.render.sceneSetGen(dataset.scnPick)`. No `data-act`, so [S07.1] never routes them |

Ops, the codec and `DEFAULTS` are untouched: `[S01]`-`[S05]` and `[S08]` are byte-identical to
6551cb6, compared region by region. The artifact diff is 756 insertions and 16 deletions. No new
hex, `url(`, ` src=`, SVG, markup sink or `.style` access (107f, FORBIDDEN and check 57 are all
unmoved).

## Why 48 and 96 (the size decision)

Integer scaling at the two window classes the scene has (48/64px cats, 96/128px mechs) allows only
16-pixel sprites, because gcd(48, 64) = 16. A 16-bit set with more pixels therefore needs its own
drawn size. The candidates were measured against the formation and the field:

| 16-bit cat / mech | scale | small window | projector window | verdict |
|---|---|---|---|---|
| 24 / 48 px | 2x everywhere | 48 / 96 | 48 / 96 | **shipped**: fits every roster to 24v24 (130c) |
| 24 / 48 px | 2x / 3x | 48 / 96 | 72 / 144 | a cat row pitch is 88.8 against a 96 box, and six mechs need 864px against a 775px strip |
| 32 / 64 px | 1.5x / 2x | 48 / 96 | 64 / 128 | the small size is not whole: smoothed or uneven pixels |

The cost is stated plainly. From 1600x900 up, 16-bit sprites are 25% smaller than 8-bit ones. The
18px names are identical in both generations, and they are what tells units apart. There is a side
effect: D-43's known limit (six mechs 103px apart at about 1600x900, with neighbouring 128px
canvases overlapping by about 25px) does not occur in 16-bit, where the mechs are 96px. That
figure comes from arithmetic and was not measured. Deferred item D-44.1 records the ways out.

## The art, iterated by eye

The sprites were built in a scratch lab (`scratchpad/lab`). Plates and parts are laid out as
shapes, shaded by one rule (lit from the top left, a seam wherever a nearer plate overlaps) and
previewed as PNGs from the real tokens. Every preview was read back.

1. **First pass.** The mech read as a walker with a cannon at once. The cat's head was small, and
   the mech's hip was a black block.
2. **Shading rule fixed.** The run counts included the outline pixel, so no top highlight ever
   fired. The hip became a joint ramp. The cat got worse: the rule scattered yellow blotches over a
   small body.
3. **Cat simplified** (body and haunch as one part, head and ears as one, lit from above only, a
   softer highlight). It read as a cat, but the neck seam and leg stripes were muddy.
4. **Cat hand-finished**, pixel runs placed by coordinate. Clean silhouette, legible face; the
   stripes read as polka dots.
5. **Tabby stripes** lengthened to three rows, plus a forehead mark and a belly shadow. It read as a
   tabby.
6. **Hue-shifted ramps.** Shadows went cool on the plate and violet on the fur, the SNES way.
7. **Mech detail:** barrel rings, a jaw plate, pauldron rivets, split toe plates and a gold knee
   cap.

The backdrop went through three lab passes. The mountains striped vertically, because lit and
unlit flipped per column on 1px ridge noise: the slope is now read over six columns. The range was
raised and the horizon moved 27 -> 30. The cloud streaks read as a dashed line and became
flat-bottomed puffs. One band edge in the ground was dithered out.

In the real browser, one more defect showed. **The ground's single-pixel tufts read as a
starfield**, so they became three-row grass tufts, and the ground was lifted a shade.

## Colours

Every colour is a mix of tokens: `--coral`, `--ink-dim`, `--accent`, `--accent-2`, `--gold`,
`--green`, `--violet`, `--ink-faint`, `--bg` and `--ink`. The fur's middle shade IS `--coral`; the
plate's IS `--ink-dim`; the sensor IS `--accent`; the trim IS `--gold`; the eye IS `--green`.
Nothing is typed in the stylesheet or the script, so no colour needed a recorded exception. Two
checks prove the derivation. The in-file palette row moves `--coral` and `--ink-dim` and watches
exactly their ramps follow. Cell 32p moves three tokens on the live page and reads the sprite and
backdrop pixels follow.

## Measurements (real Chrome and Edge, headless; the two agreed)

| | 1920x1080 | 1366x768 |
|---|---|---|
| 16-bit sprite px, cat / mech | 48 / 96 (canvas 24 / 48) | 48 / 96 (canvas 24 / 48) |
| 8-bit sprite px, cat / mech (unchanged) | 64 / 128 | 48 / 96 |
| backdrop canvas / drawn | 1024x360 / 2048x720 | same |
| shipped scene, top-bottom of the document | 294-729 (unchanged) | 294-689 (was 294-669: the picker narrows the hint by one line; still whole on screen) |
| 16-bit Mech 1 past each side: gap px / kept share | left 0.1/0.0405, top 0/0.1667, right 0.1/0.9595, bottom 0/0.8333 | left 0/0.0491, top 0/0.2, right 0/0.9509, bottom 0/0.8 |

**Byte cost.** The 16-bit sprite rows take **3,789 bytes** in the file (72 rows, 2,880 pixel
characters, 1,364 of them painted); **5,256** with their banner. The whole artifact grew by
**37,163 bytes** LF (2,735,687 -> 2,772,850, +1.36%). That includes the backdrop code, the
palette, the picker, the stylesheet, six suite rows and every comment.

### FIGHT_FLOOR, re-derived in the open

The gate's own `harvestInto` was copied verbatim and booted the way `tests/selftest-dom.cjs`
boots, undressed, on a scratch copy of HEAD 6551cb6 and on the working tree. The HEAD column
reproduces D-42's own "after" column to the string.

| roster | setup before -> after | fight before -> after | from `#scene` |
|---|---|---|---|
| 2x2 | 175 -> 180 | 323 -> 328 | 16 |
| 3x3 | 194 -> 199 | 387 -> 392 | 20 |
| 5x3 | 212 -> 217 | 451 -> 456 | 24 |
| 9x3 | 248 -> 253 | 579 -> 584 | 32 |
| 24x24 | 572 -> 577 | 1731 -> 1736 | 104 |

The picker costs exactly **+5** at every shape: the group's name, two labels and two ticks, all
roster-independent. **FIGHT_FLOOR 257 -> 262.** Check 47's floor holds at 117, as under D-42. On
the shipped board the harvest is 254 -> 259 (setup) and 759 -> 764 (fight).

## Rows and cells turned in the open (D-44 cited at each)

| row / cell | RED recorded | now |
|---|---|---|
| gate 130c | on a scratch copy, the widened row with its loop still laying out the two 8-bit fields printed `laid 1152 first bad: none`, 228 of 229, only 130c red | every roster 1v1..24v24 laid out for both generations at both widths (2304), every drawn size a whole multiple of the sprite's own pixel count, and every `[data-scn-gen="16"]` rule declaring no size property but `--scn-px:48px` |
| FIGHT_FLOOR | n/a (the harvest only grew) | 257 -> 262, table above |
| cells 32-32n | none: they run untouched | 8-bit is selected before cell 32 by a real click on the picker; the choice holds through 32g's reload |

## New assertions

- **`[S09.15]`, six rows.** The two generations and their tables. The 16-bit palette is the
  tokens, and moving a token moves exactly its ramp. The backdrop is the tokens: its first pixel
  is `36,68,86`, and it follows `--accent` but not `--green`. The stored generation is read as
  foreign: only "8" and "16", with nothing, garbage, a padded "8", an unknown generation and an
  object all reading as 16. The generation lives in no slice. Behind the bracket, a switch redraws
  in place: same nodes, same places, canvases 24/48 -> 16 -> 24/48, and the pressed state follows.
- **Gate 130d.** The shell's default and pressed state, and this store-less page painting 16-bit.
  The colours are compared with the shell's own `:root`, mixed by the row itself. A click to 8-bit
  keeps every node and place, and Cat 2's pre-kept place survives. A sprite held while a click
  switches the art back stays held, the same node, at 0.4, 0.5, and keeps that place on release.
  No state, commit, undo or build-code change. "32", "" and the number 8 are refused. Every word the
  scene shows reaches Layer C from `#scene` exactly once.
- **Browser 32o-32v** (8 cells x 4 columns):
  - 32o: the default on an empty store and the look against the tokens.
  - 32p: tokens moved, and the picture follows.
  - 32q: the dead in 16-bit.
  - 32r: the picker by real clicks keeps every node and place and writes no state.
  - 32s: a reload keeps the choice, and an empty store is 16-bit.
  - 32t: a page whose `localStorage` getter throws a SecurityError still opens 16-bit and switches
    both ways, with no error.
  - 32u: 24 a side in 16-bit.
  - 32v: the clamp by the 16-bit mech's own 120px box.

## Probes: committed first (8b9f76a), run on scratchpad copies, working tree never touched

Each probe took the committed tree with `git show` and applied one exact-once, EOL-aware
replacement (the patcher refuses unless it finds its target exactly once). It then ran the node
gate and the DOM runner under a 180s timeout, and the scene cells (32-32v, sliced out of
`browser-checks.mjs` by marker, 118 cells) in all four columns. The unpatched control ran
1404/0, 229/229, 1530/0 and 118/0. **No row threw and nothing hung:** node 14-15s, DOM 4-5s,
browser 134-138s.

| probe | change | node gate / suite | DOM | browser (scene cells) |
|---|---|---|---|---|
| **PA** default flipped to 8-bit (required) | `SCENE_GEN_DEFAULT = '8'` | two `[S09.15]` rows, **130d** | the same two rows | **96/22**: 32o, 32p, 32s, 32t, 32u x4, and 32v at 1920 x2 |
| **PB** the choice written into App.state (required) | `commitUi` writes `ui.sceneArt` | `[S09.15]` no-slice row, **130d** | the no-slice row | **114/4**: 32r x4 |
| **PC** the choice written into the build slice (required) | `commit` writes `build.sceneArt` | the no-slice row, **130d** | the no-slice row | **114/4**: 32r x4 |
| **PD** a typed colour instead of a token ramp (required) | fur `3: 'rgb(255, 138, 92)'` | the 16-bit palette row (130d green by construction: the typed value IS the token's) | the palette row | **114/4**: 32p x4 |
| **PE** 16-bit mechs at cat size (required) | `--scn-big:1` in the 16-bit field rule | **130c** (the size-property clause) | green (no stylesheet here) | **106/12**: 32o, 32u, 32v x4 |
| **PF** switching resets positions (required) | `sceneSetGen` wipes every kept place | first run GREEN in the gate (see Deviation 3); after hardening, **130d** red, 228 of 229 | the switch-in-place row | **110/8**: 32r, 32s x4 |
| **PG** a typed backdrop colour | sky band 0 `[36, 68, 86]` | the backdrop row | the backdrop row | **114/4**: 32p x4 |

Every required probe is red in the node tier, which runs on a fresh checkout, and in the browser
tier in all four columns. PE and PF are green in the DOM tier by construction: the stub has no
stylesheet, and the DOM runner does not run the gate.

## Screenshots, read back

Read, every one:
- **The iteration sets.** `lab/out1`-`out7` (sprite zooms and a side by side with the 8-bit pair),
  `lab/outb1`-`outb3` (the backdrop with a formation), and `shots-i1`/`shots-i2` (the real scene,
  Chrome).
- **The final set, `shots-final`.** Both generations at 1920x1080 and 1366x768 in Chrome and Edge:
  the shipped 9v3, 24 a side, and a dead cat plus a dead mech with a zero-health mech standing.
  That is 24 shots, plus 3x crops (device scale 3) of Cat 1 and Mech 1 in each generation and
  browser, 8 more.
- **The browser cells' own shots.** `shots-b2`, `d44-{fresh,dead,switched-8,24}` in all four
  columns, beside D-42's and D-43's.

**It reads as SNES-era 16-bit, and it is clearly better than the 8-bit set:**
- The 3x crops show ramps of three to five shades, dark tinted outlines, highlights, a readable
  alert cat, and a plated walker with a glowing visor and a gold trim.
- Cat and mech are unmistakable at a glance: orange and small against grey and large.
- The backdrop reads as a battle background, not a band of colour.
- Every name is legible at both sizes in both browsers, including all 48 at 24 a side.
- The dead cat and the dead mech lie turned and grey above their dimmed names, and Mech 2 at zero
  health stands in colour.
- The 8-bit shots are D-42's picture exactly, apart from the picker in the header. With 8-bit
  selected, dragged places hold.

## Deviations from Plan

### 1. [Rule 1 — Bug of mine, found by measurement] The stub page lost three of the scene's words
- **Found during:** FIGHT_FLOOR's re-derivation. The working tree harvested +2 where +5 was
  expected, with every row green.
- **Issue:** my stub edit replaced `sceneTop.appendChild(n)` instead of adding after it. The
  heading, the hint and "Back to formation" were built and registered in `byId`, but never
  attached. 130b presses the reset through `byId`, so nothing noticed.
- **Fix:** restored the append. 130d now counts every static word of the scene in Layer C's
  harvest from `#scene`, exactly once, so the same slip is red next time.
- **Commit:** c2cf871 (fixed before the first commit).

### 2. [Rule 1 — Cell of mine] 32u's first run was red in all four columns
- **Issue:** 32u measured Cat 1 over Mech 7's name: `c1 over the name of m7` at 1920, and
  `sprites c1/m7` at 1366. 32r's drags had come back with 32s's reloads, so the cell measured its
  own leftover board rather than the formation. First full run: 514/4.
- **Fix:** Back to formation by a real click before laying out, which is 32i's arrangement before
  32j. After the fix: 518/0.
- **Commit:** 8b9f76a (before the cells were first committed).

### 3. [Rule 2 — Probe finding] 130d could not see a switch that wiped every place
- **Issue:** PROBE PF ran the gate green. 130d switched generation on a board where nobody had
  been placed, so formation compared equal to formation. The DOM-bracketed suite row and 32r/32s
  were red, but the tier a fresh checkout runs was not.
- **Fix:** Cat 2 is kept at (0.3, 0.6) before the press and must still be kept and drawn there
  after both presses. The PF rerun: 228 of 229, 130d red (`kept ["","[0.4,0.5]",null,"0.25,0.3533"]`).
- **Commit:** 7e6f016.

### 4. [Rule 2 — Found while preparing a probe] 130c could not see a 16-bit rule re-sizing the mechs
- **Issue:** 130c read the multiplier off the base `.scn-field` rule alone. A `--scn-big:1` written
  into the 16-bit field rule (PROBE PE) would have been invisible to it.
- **Fix:** 130c reads every `[data-scn-gen="16"]` rule for the size properties `--scn-px`,
  `--scn-big`, `--scn-spr`, `--scn-w` and `--scn-h`. Only `--scn-px:48px` may appear. PE is red in
  130c.
- **Commit:** c2cf871.

### 5. A wording correction, recorded
My first draft of 130c's history paragraph said "RED recorded first". The RED was run after the
row was written, on a scratch copy. The paragraph now says exactly that, before any commit.

## Instruments

| | baseline (6551cb6) | after (7e6f016; the artifact byte-identical since c2cf871) |
|---|---|---|
| `node tests/selftest-node.cjs` | 1399 / 0, exit 0 | **1404 / 0, exit 0** (+5, `[S09.15]`) |
| interaction gate | 228 of 228 | **229 of 229** (+130d; 130c turned 1152 -> 2304) |
| stub-drift | 170 shell ids | **174** (scene-gen, scene-gen-16, scene-gen-8, scene-back) |
| `node tests/selftest-dom.cjs` | 1524 / 0 | **1530 / 0** (tier delta 125 -> 126) |
| `tests/browser-checks.mjs` | 486 / 0 headless | **518 / 0 headless** (+8 cells x 4 columns) |
| live `#selftest`, real Chrome + Edge | 1524 / 0 both | **1530 / 0 both**, no page errors, both scene keys untouched |
| Layer C setup / fight harvest (shipped board) | 254 / 759 | 259 / 764 (floors 117 / 262) |

Layers A, B and C are green. No word in the scene names an outcome: cell 32 and 32o scan the
scene's text including the picker, and 130d proves the picker's words reach Layer C.

## Known Stubs

None.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: storage-read | cats-vs-mechs.html [S06.17] | A second `localStorage` key, `cvm.v1.scene-art`, read in a try like D-42's. The value is treated as foreign: exactly "8" or "16" is accepted, and anything else, or a store that is missing or throws, reads as the default. It only ever selects a table entry and is written back as the same two-character string. It never reaches the state, the DOM as text, or the build code. |

## Self-Check: PASSED

Files present: `05-D44-SUMMARY.md`, `cats-vs-mechs.html`, `tests/stub-dom.cjs`,
`tests/selftest-node.cjs`, `tests/browser-checks.mjs`, `deferred-items.md`, `STATE.md`. Commits
present: c2cf871, 8b9f76a, 7e6f016.
