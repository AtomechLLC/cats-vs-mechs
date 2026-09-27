---
phase: 05-fight-loop-playtest
plan: D45
subsystem: data+codec+ops+selftest+gate+browser
tags: [d-45, redirect, unit-names, name-generator, deterministic, codec-v1, proj-06, s01, s04, s05, s09-16, check-130c, check-131]
requires:
  - phase: 05-fight-loop-playtest
    plan: D42
    provides: "the battle scene, which reads a unit's name every frame; cell 32b's rename through [S03]'s writer"
  - phase: 05-fight-loop-playtest
    plan: D43
    provides: "the formation and gate check 130c, whose name-width model is what decided the list lengths"
provides:
  - "[S01] unitName(side, n), CAT_NAMES (52, <= 7 letters), MECH_NAMES (30, <= 8 chars), exported on App.data"
  - "makeUnits, [S05] addUnit and [S04] decode mint names through unitName; encode's guard asks it"
  - "[S09.16] suite 'unit names' (16 rows + a DOM-bracketed page row)"
  - "gate check 131 (the lists against the live PROJ-06 arrays); 130c reads the generator"
  - "bornName() in the node gate and born.* in the browser tier: no default name is typed in a test"
key-files:
  created: [.planning/phases/05-fight-loop-playtest/05-D45-SUMMARY.md]
  modified: [cats-vs-mechs.html, tests/selftest-node.cjs, tests/browser-checks.mjs, .planning/phases/05-fight-loop-playtest/deferred-items.md, .planning/STATE.md]
key-decisions:
  - "Names stay STORED on the unit record, minted once from (side, id number) and never re-derived. No op writes a unit's name, so the stored name always equals the generator's. Keeping it stored left every render site, the fight slice and buildFromDecoded untouched. It is also what makes a rename win: nothing re-derives over the record."
  - "Keyed to the NUMBER IN THE ID, which nextUnitId hands out once and a removal never reassigns. It is not keyed to the slot. Removing c3 renames nobody (driven by a real click in both browsers)."
  - "The codec wire is unchanged. WIRE_UNIT_LABEL is gone and unitName takes its place on both ends. The shipped code is byte-identical (45 characters), and three codes written by the pre-D-45 file load showing the new names and write back the same code."
  - "The battle scene decided the lengths, not the brief's 12. Neighbouring names clear each other at 24 a side on 1366 only if a cat's is <= 7 and a mech's <= 8. The first draft used the brief's 'Warden MK-2' style and 130c measured names overlapping in a row of six mechs. Cells 32j/32u also went red in real browsers. So models are <= 5 letters as 'Model-nn', and 'Mod MK-n' is kept for three-letter models."
  - "Past the end of a list: a cat takes the round number ('Biscuit 2'), and a mech moves its mark on by one ('Anvil-07' -> 'Anvil-08'). Unique per side at any id, disjoint across sides by construction (every mech name has a hyphen, no cat name does)."
  - "No rename-unit op was added. D-45 asked for default names, not renaming. The rename drives go through [S03]'s writer, the path cell 32b already takes."
metrics:
  duration: 170min
  completed: 2026-09-27
---

# Phase 5 D-45: generated, themed default names for units

**Units are no longer born "Cat 3" or "Mech 1". A cat is born with a cat's name and a mech with a
designation. The shipped board is Biscuit, Mittens, Pepper, Nimbus, Tofu, Juniper, Waffles, Clover
and Ginger against Anvil-07, Cog MK-2 and Rivet-12. Each name is a pure function of the unit's side
and the number in its id, so the same board shows the same names on every machine, after every
reload and in a classmate's copy, and removing a unit renames nobody. The names appear everywhere a
unit's name already appeared (cards, the battlefield, the declaration rows, the battle scene, the
popup and the ledger), because every one of those surfaces reads the unit record. The build code
did not move by one character.**

## The investigation, and what it decided

- **How names were held:** stored, as `unit.name` on every unit record, but always equal to
  `"Cat " + n` / `"Mech " + n`. No op writes a unit's name: there is no rename-unit op, and the
  D-42 mention is hypothetical ("no op renames one today"). `[S04]` never wrote a name. It restored
  one from the id number via `WIRE_UNIT_LABEL` and refused a board whose unit wore any other.
- **The decision: keep them stored, and change the one function that mints them.** Migrating to
  derived-at-render would have touched roughly twenty read sites, the fight slice's snapshots and
  `buildFromDecoded`, and it would have bought nothing. A name no op writes is already derived, just
  once. So `makeUnits`, `addUnit` and the decoder all mint through `App.data.unitName(side, n)`, and
  encode's guard compares against it. No other code changed.
- **The stable key:** the id number. `nextUnitId` takes the largest suffix and adds one, and a
  removal never renumbers, so the id survives exactly the events a name must survive.
- **Literal names in tests:** four gate checks (41, 120b, 121, 130c), two in-file rows and fifteen
  browser expectations. All of them now read the generator (details below).

## The generator

| | cats | mechs |
|---|---|---|
| list | 52 single words, <= 7 letters | 30 designations, <= 8 characters |
| shape | `Biscuit` | `Anvil-07` (model <= 5 letters, 2-digit mark) or `Cog MK-2` (3-letter model) |
| id n, first round | `CAT_NAMES[n-1]` | `MECH_NAMES[n-1]` |
| past the list | name + round number: c53 `Biscuit 2` | model, mark + round: m31 `Anvil-08` |
| first name longer than the scene clears | c53 (9 chars) | m164 `Elk MK-10` (9) |
| longest name at any safe integer | 20 (`Miso 173215370283481`) | 21 (`Anvil-300239975158040`) |

Past `Number.MAX_SAFE_INTEGER`, or for a side that isn't one, the generator returns **null**
rather than throwing, because encode asks it and encode never throws. Encode refuses on null, and
decode refuses as `'a unit id is the wrong shape'`. The null is reachable only by a code whose run
steps one past a gap already sitting at the largest safe integer.

**Uniqueness:** a name spells back its list entry and its round, and the two together are the id.
So no two units on a side share a name at any id. `[S09.16]` walks 2,000 ids a side, and my scratch
walk went to 20,000. Cat and mech names never coincide, because every mech name has a hyphen.

**Why 7 and 8, measured.** The 24-a-side formation at 1366 stands cats 95.5px apart and mechs
106.5px apart in a row of six. A name is an 18px monospace plate that 130c models at 11px a
character plus 8. Two neighbours clear each other only if a cat's name is at most 7 characters and
a mech's at most 8. The first draft followed D-45's own example, "Warden MK-2" (11). 130c reported
`8-bit small 1v6 rows 3: names m1/m2`, and cells 32j/32u went red in real browsers on that draft.
The lists were shortened. Nothing in the scene's layout was touched.

**Screening.** Every entry, and every name made for ids 1-104 on both sides (the 82 entries plus
208 made names, 290 in all), was
walked programmatically against `VERDICT_WORDS` (18), `VERDICT_LITERAL_WORDS` (27),
`VERDICT_RENDERED_WORDS` (3), the eight clean-but-unshippable words, and 25 rank words ("ace",
"prime", "alpha", "titan", "champion", …). Zero hits. That walk is now gate check 131. Also
excluded by hand: "Fudge" (reads as "fudge the numbers"), "Button" (a screen reader would announce
"Remove Button"), and "Brace" (a substring check sees "ace"). `[S09.16]` also asserts that no list
word is the word for a shipped action, effect, token type or faction, so a ledger line never reads
"Slash uses Slash".

## Tests turned in the open (RED recorded, then rewritten to read the generator)

| row | red on | rewritten to |
|---|---|---|
| in-file "what a drag lights" :: THE ANSWERS A ROOM WILL SEE | `"Rivet MK-2 holds at most 4…"` vs `"Mech 1…"` (node + DOM) | `App.data.unitName('mechs', 1) + …` |
| in-file "the battle scene" :: THE SPRITES FOLLOW THE ROSTER | `"Biscuit"`, `"Servo MK-4"`, `"Mittens, ruled dead"` (DOM) | four `unitName` reads |
| gate 41 (rename moves the accessible name) | `"Decrease Cat 1 Health"` | `stepperAria(bornName('cats', 1), …)` |
| gate 120b (D-39 popup mark) | `head === 'Cat 1' / 'Cat 5'` | `bornName('cats', 1 / 5)` |
| gate 121 (D-37 popup values) | six `"Cat 1 …"` literals | `bornName('cats', 1) + …` |
| gate 130c (scene layout model) | **stayed GREEN** over `(word + (i+1))`, a second copy of the naming rule | `bornName(side, i + 1)`, plus a new clause that the widest modelled name fits the 128px box. It then went red on the first-draft lists, which is what shortened them |
| browser 26b, 26c, 26f, 26g, 31g, 32c, 32m, 32q | recorded red in real Edge on the new names (see below) | `born.c1`, `born.m1`, … read once per column from the page's own `App.data.unitName` |

The browser RED was recorded by accident rather than by design. My first "baseline" browser run was
still going when the artifact changed, and its later cells loaded the new names: 496/22, with those
literal cells red plus 32j/32u on the first-draft list. The true baseline was then re-run from a
scratch copy byte-identical to 19f32e4 (modulo CRLF): **518/0**.

Cell labels in the browser tier still say "Cat 1" and "Mech 3". They are prose naming a unit by
its slot, not expectations, and the file says so at the `born` map.

## Drives (real Chrome and real Edge, 1920x1080 and 1366x768, headless, `file://`) — 44/44

`scratchpad/d45-drive.mjs`. All ten steps pass in all four columns, plus four recorded readings:

1. The shipped board's code is byte-identical to the pre-D-45 45 characters. Every card head and
   every "Remove …" label is the generator's name for its id.
2. **c3 removed by a real click.** Eight cats remain, and c4, now third in the roster, is still
   **Nimbus** (the fourth name) and not Pepper.
3. **Real clicks up to 24 a side.** 48 cards, no repeat on a side, each its id's name, and every
   card head one line and unclipped.
4. **The 24-a-side fight, 16-bit scene.** 48 name labels, each one line (22px), no two overlapping,
   and each what `elementFromPoint` finds at its centre and four corners once scrolled into view.
   The first run reported misses at 1366: those names were below the fold, where `elementFromPoint`
   answers null. That was a drive bug.
5. **The ledger** after a real Advance reads "Biscuit uses Slash on Anvil-07." and "Cog MK-2 uses
   Lasers on Mittens.", with no "Cat N"/"Mech N" and no name split across lines.
6. The unit popup is headed **Anvil-07**, on one line.
7. **A rename:** c3 renamed "Whiskerton" through `[S03]`'s writer. The card, the remove label, the
   sprite label and the sprite's accessible name all show it, and the code **refuses** that board
   (null) rather than carrying it off under a generated name. Two real Ctrl+Z presses back to the
   earlier undo depth, and everything shows **Pepper** again, with the shipped code back.
8. A pre-D-45 code with c3 and m2 removed, opened as a link: ids `c1,c2,c4..c9` / `m1,m3,m4`,
   each wearing its own id's generated name.
9. **Round trip:** a pre-D-45 24-a-side code with gaps on both sides, copied out of the share
   dialog and opened in a second tab. Same ids, same names, and the same code the old file wrote.
10. No page error and no console error.

**Recorded, not asserted (step 7b, all four columns):** on a plain commit, before any structural
frame, the board card still read **"Pepper"**. The scene reads a unit's name every frame (D-42
wrote it that way), but the card's name, and the unit's name inside each stepper's accessible
name, are written by `structure()` only, because no op renames a unit. No student can reach this
today. It is the render half of a future rename-unit op (deferred D-45.1). The in-file page row
reads on a structural frame and says why.

## Screenshots, read back

`scratchpad/d45-drive-out/`: the board at 9v3 and at 24 a side, the fight tab at 9v3 and 24, the
16-bit scene at 9v3, at 24 and renamed, the ledger and the popup. Each at both sizes in both
browsers (36 images). Read back: the 1366 scene at 24 a side, the 1366 scene at 9v3 (Edge), the
Edge 1366 board at 24 (full page), the Chrome 1366 ledger, the Edge 1366 popup, and the Chrome
1920 fight tab at 24 (full page). Every name reads, on one line, with daylight between neighbours
in the scene's densest rows ("Juniper" / "Waffles", "Ram MK-4" beside "Flint-21"). The
designations read as designations. The one thing in any image that isn't a name is the sticky
round bar appearing inside element and full-page captures, which is how the capture handles a
sticky element, not a layout defect.

## Instruments

| | before (19f32e4) | after (e2374de) |
|---|---|---|
| node suites | 1404/0 exit 0 | **1421/0** exit 0 (+16 rows, +1 skip-info row) |
| interaction gate | 229/229 | **230/230** (+131) |
| shell ids | 174 | 174 |
| DOM runner | 1530/0 | **1548/0** (+16, +page row, +hand-back row) |
| browser tier | 518/0 (re-run on a pristine copy) | **518/0** headless, on HEAD |
| live `#selftest` | 1530/0 Chrome and Edge | **1548/0** Chrome and Edge, 0 page errors, store untouched |
| shipped build code | `v1~N~V~A9~3~9*3!0~9*~~~~B3~3~3*6!3~3*~~~~7tvo` (45) | byte-identical |
| Layer C harvests | #app 259, dialogs 188, #howto 32, fight 764 / 764 / 788, propose 62 | **identical**: a name replaced a name, one string for one string, so FIGHT_FLOOR (262) and every other floor hold as they stand |
| Layer B literals | 12,354 | 12,555 |
| artifact bytes | 2,772,850 | 2,799,130 (+26,280, mostly the banner and the suite) |

## Probes (committed first; each one an exact-once text swap, restored byte-identical from a scratchpad copy)

| probe | what | red |
|---|---|---|
| P1 | "Mango" (c41, never painted on a driven page) -> "Best", a Layer-C-only word | **gate 131 only**. Layers A and B cannot see "best", and no driven page paints c41. This is the case the list gate exists for |
| P2 | "Pebble" -> "Mittens", a duplicate on the cat side | 3 `[S09.16]` rows, node and DOM (no word twice; 2,000-id walk; 24 a side) |
| P3a | removeUnit renames every unit by POSITION after the splice | "REMOVING THE THIRD CAT RENAMES NOBODY" (actual c4 = Pepper); gate 82; 9 build-code rows |
| P3b | addUnit names by roster LENGTH, not id number | the same row (actual c10 = Ginger, a duplicate of c9); gate 82; 9 build-code rows |
| P4a | the card head asks the generator instead of the record | the page row in the DOM runner. Node stays green: its suites have no page, and it has no rename check |
| P4b | the scene label asks the generator instead of the record | the page row in the DOM runner (and browser cell 32b by construction). Node green, as P4a |

No probe hung, and no D-45 row threw. **One pre-D-45 suite did throw under P3a/P3b:** `build
code`'s tamper matrix is built off the hostile board's code, and encode rightly refused that board.
The harness recorded one "suite threw" FAIL and lost the rest of the suite's rows (1421 -> 1268).
That is logged as deferred D-45.3 rather than reworked here.

**If-it-stays-green clause, applied:** the first version of the rename row checked the record and
the code only, so a render site that asked the generator instead of the record would have gone
unseen. I noticed this before running P4, and added the DOM page row for it. P4a/P4b then reddened
it.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] The brief's example mech names overlapped in the battle scene**
- **Found during:** task: gate 130c after turning its model to the generator
- **Issue:** 10- and 11-character designations ("Warden MK-2", "Bastion-09") put neighbouring names over each other in a row of six mechs at 1366 (130c `names m1/m2`; real-browser 32j/32u red).
- **Fix:** lists re-cut to cats <= 7, mechs <= 8, with the measured spacing recorded in `[S01]`'s banner.
- **Commit:** 2cb338b

**2. [Rule 2 — Missing coverage] The rename row could not see a render-level override**
- **Found during:** probe design
- **Fix:** the DOM-bracketed page row in `[S09.16]` (card head, remove label, sprite label, sprite aria), read on a structural frame with the reason written at the row.
- **Commit:** 2cb338b

**3. [Rule 1 — own text] Layer B reddened on my row label "A RENAME WINS"** (`win/wins/winning`), and Layer A would have reddened on "no-verdict" in two of my comments. Reworded before commit ("A RENAME IS WHAT SHOWS", "PROJ-06").

### Declined by design
- **No rename-unit op** (not asked for). Its render half is recorded as D-45.1.
- **The scene layout was not changed** to fit longer names; the lists were fitted to it.

## Known Stubs

None.

## Threat Flags

None. There are no new inputs. The generator's output is a closed set of artifact words, reaching
the page through `textContent` only.

## Self-Check: PASSED

- FOUND: cats-vs-mechs.html, tests/selftest-node.cjs, tests/browser-checks.mjs, this file
- FOUND: 2cb338b feat(05-D45), e2374de test(05-D45)
