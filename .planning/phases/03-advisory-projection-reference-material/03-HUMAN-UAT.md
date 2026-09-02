---
status: partial
phase: 03-advisory-projection-reference-material
source: [03-VERIFICATION.md]
started: 2026-08-29
updated: 2026-09-02
note: >
  Created 2026-08-29 as a bookkeeping fix. Phase 3's verification returned human_needed on
  2026-08-28 with three items in its frontmatter, but no UAT file was written at the time, so the
  items never surfaced in /gsd:progress or /gsd:audit-uat. They are transcribed here verbatim from
  03-VERIFICATION.md. Nothing about the phase's status changed — this only makes the existing debt
  visible.

  2026-09-02: checks 1 and 2 CLOSED BY MACHINE. Both were pending only because "the stub DOM has
  no layout engine" — and headless real Chrome and real Edge, driven from file://, have one. The
  probes and their raw readings are named per check. Check 3 stays human: it is the one item on
  this page that a layout engine cannot answer.
---

## Current Test

[check 3 only — awaiting a projector and a room]

## Tests

### 1. Glyph rendering and wrapping in the strip and reference band
expected: The `≈`, `÷` and `–` (en dash) glyphs render as intended — not tofu boxes, and not a hyphen
that reads as a minus beside the stepper buttons' own minus sign. The arithmetic lines wrap rather
than scroll inside the narrow strip. Both panels are legible without hover, without a tooltip and
without opening dev tools (Success Criterion 2).
why_human: The stub DOM has no layout engine. Automated checks can prove the correct text reaches the
correct node and nothing more.
how: Open `cats-vs-mechs.html` in a desktop browser and read the strip's two panels and `#refband`
top to bottom on the shipped board.
result: **PASSED — CLOSED BY MACHINE 2026-09-02.** 128 rows, 0 failed, real Chrome **and** real
Edge, from `file://`, at 1920×1080 and 1366×768. Probe:
`.planning/phases/05-fight-loop-playtest/rehearsal-closer-probes/p1-glyphs-and-wrap.mjs`; raw readings written to `p1-result.json` on each run (regenerated, not committed); three
screenshots kept beside it in `.planning/phases/05-fight-loop-playtest/rehearsal-closer-probes/shots/` (the probe writes twelve on
each run; the three evidential ones are committed).

**How the tofu question was settled, because advance width alone cannot settle it.** A font may
give notdef the same advance as a real glyph. So each character was drawn at 96px into a canvas in
the strip's own computed font — `normal 600 96px "Segoe UI", system-ui, …` — and the ink was read
back with `getImageData`: pixel count, ink bounding box, and a 12×12 downsampled signature. The
references are **U+0378 and U+0380, both permanently unassigned**, which therefore render as the
notdef box. The instrument check is that those two produce an *identical* signature (they do:
1573 ink px, box 48×67), which is what makes "matches notdef" a meaningful test at all.

| glyph | ink px | ink box | advance @18px | matches notdef? |
|---|---|---|---|---|
| `≈` U+2248 | 1013 | 49×36 | 12.516 | **no** |
| `÷` U+00F7 | 630 | 47×50 | 12.498 | **no** |
| `–` U+2013 EN DASH | 400 | **50×8** | **9.000** | **no** |
| `−` U+2212 MINUS (the steppers') | 368 | 46×8 | 12.498 | no |
| `-` U+002D HYPHEN | 216 | **27×8** | **7.233** | no |
| U+0378 / U+0380 (notdef) | 1573 | 48×67 | 11.619 | — |
| U+FFFD | 3416 | 79×93 | 16.699 | — |
| `M` (sanity) | 2867 | 73×67 | 16.638 | — |

Every figure is **byte-identical in Chrome and Edge and at both viewports**.

**On the specific worry — "a hyphen that reads as a minus".** It is not a hyphen: the range on
screen is `≈4–6 turns to wipe Cats` with U+2013, verified in the DOM, and no `\d-\d` anywhere in
the strip's text. Rendered, the en dash is **50px of ink against the hyphen's 27px** — 1.85×. It is
within 4px of the *minus sign*'s width, which is expected of two horizontal bars, and the two never
appear in the same context (the range is between two digits inside the strip; the minus is a
stepper's own button glyph). Screenshot of all seven side by side at 64px, committed:
`.planning/phases/05-fight-loop-playtest/rehearsal-closer-probes/shots/glyphs-chrome@1920x1080.png`
(and the Edge one beside it) — read back and confirmed by eye as well as by pixel.

**Wrapping.** `#strip` is 320px wide with `scrollWidth 318 / clientWidth 318` — it does not scroll
sideways at either viewport in either browser. Every `[data-prj]` line reads `282/282`: no line
overflows its own box. No line is `white-space: nowrap`; no line carries `text-overflow: ellipsis`.
Driven proof rather than a fitting accident: a deliberately over-long line
(`888888 health ÷ 7 per turn with overkill and then some more words`) forced into the `work` node
occupies **2 line boxes** with `scrollWidth 282 / clientWidth 282` — it WRAPS. `#refband` likewise:
`1598/1598` at 1920 and `1320/1320` at 1366, no leaf overflowing.

**Lines on screen, verbatim, shipped board:** `Cats`, `≈9 turns to wipe Mechs`,
`27 health ÷ 3 per turn`, `Mechs`, `≈3 turns to wipe Cats`, `27 health ÷ 9 per turn`. With a range
forced: `≈4–6 turns to wipe Cats`, `54 soaked ÷ 9 per turn with overkill`.

Zero page errors and zero console errors on all four runs.
closed_by: machine — `p1-glyphs-and-wrap.mjs`

### 2. The strip stays sticky when the window is short
expected: `#strip` keeps sticking to the top of the viewport under the topbar. If its content is
taller than the space available it must not disappear entirely, nor overlap in a way that hides a
figure.
why_human: Named in 03-REVIEW.md as unreviewable without a layout engine: the strip's content sets its
own height, and a sticky box taller than the space between the bar and the bottom of the window
behaves as though it were not sticky for the part that does not fit. No CSS regression tooling exists
in this repo, by design.
how: Shrink the browser window height — or use a typical workshop laptop screen — and scroll the board.
result: **PASSED — CLOSED BY MACHINE 2026-09-02**, with two readings recorded that the check did not
ask for and that are worth having. 280 rows, 0 failed. Real Chrome and real Edge, 1366px wide, at
**ten window heights: 1080, 900, 768, 700, 600, 575, 574, 573, 500, 400**, scrolled to 0 / 25% /
50% / 75% / max at each, in **both** views the strip appears in. Probe:
`.planning/phases/05-fight-loop-playtest/rehearsal-closer-probes/p2-sticky-short-window.mjs`; raw readings written to `p2-result.json` on each run (regenerated, not committed).

**BUILD VIEW.** `#strip` computes `position: sticky` with `top: 64px` and a fixed content height of
**510px** at every height tested. Every ancestor (`#board`, `#app`, `body`, `html`) reports
`overflow: visible` with no `transform`, `filter`, `backdrop-filter`, `contain`, `will-change` or
`perspective` — nothing that could break sticky. At every mid-scroll offset at every one of the ten
heights it is pinned to the bar's foot at **64px, to the pixel**, and **all six projection figures
stay wholly inside the window** — including at a 400px-tall window, because the figures occupy the
top ~270px of the 510px box and the rest is the "This projection ignores:" list.

The named failure condition — content taller than the room under the pinned bar — is a pure
threshold in window height, and it was bisected:

| window height | pinned room (`innerHeight − 64`) | strip | verdict |
|---|---|---|---|
| 1080 / 900 / 768 / 700 / 600 | 1016 / 836 / 704 / 636 / 536 | 510 | fits |
| 575 / **574** / 573 | 511 / **510** / 509 | 510 | fits at 574, **1px short at 573** |
| 500 / 400 | 436 / 336 | 510 | does not fit |

So the condition is **not reached at any window height a workshop laptop has** — it needs a window
under ~574px tall — and even where it is reached, no figure is hidden while pinned and the strip
never disappears (at 400px its bottom edge still reads 85 of 400).

**THE ONE READING WORTH CARRYING FORWARD, and it is CSS spec rather than defect.** A sticky box
stops sticking at the end of its **containing block**, which here is `#board`. At the document's
*final* scroll position the strip is therefore carried up with the board:

| window height | `#strip` top at max scroll | figures off the top |
|---|---|---|
| 1080 / 900 | 64 | 0 of 6 |
| **768** | **−57** | **2 of 6** — `Cats`, `≈9 turns to wipe Mechs` |
| 700 | −125 | 3 of 6 |
| ≤600 | −225 to −425 | 6 of 6 |

Identical in Chrome and Edge. It happens only at the very bottom of the page and one scroll back up
restores it. It is recorded here rather than filed as a defect because nothing in the phase's
criteria says the projection must survive the end of its own container — but on a 768-tall laptop,
scrolling to the foot of the board does take the top two readings off screen, and a room would see
that.

**FIGHT VIEW.** D-33 P2-12 replaced the sticky with `position: fixed` when the projection is toggled
on: `top: calc(var(--topbar-foot,…) + 14px)`, `max-height: calc(100vh − --topbar-foot − 28px)`,
`overflow-y: auto`. `--topbar-foot` is republished on scroll, so the panel's **top rises and its
height grows** as the bar scrolls away while its **bottom edge does not move** — measured at 400px
tall: top 192 → 130 → 78 with the bottom pinned at 386 throughout. It is wholly inside the window at
every offset and every height, never rides up over the control bar, and scrolls itself when its
content does not fit. (The first draft of this probe scored that growth as a failure; the CSS and
its banner explain it, and the assertion was rewritten to test the bottom edge, which is the thing
that is actually held.)

Zero page errors and zero console errors on all twenty runs.
closed_by: machine — `p2-sticky-short-window.mjs`

### 3. Projector legibility from classroom distance
expected: The `≈9 turns to wipe Mechs` / `≈3 turns to wipe Cats` contrast (the phase's own worked
teaching example, D-01) and the "What beats what" band are legible from a normal classroom viewing
distance, without the instructor zooming or narrating the numbers aloud.
why_human: Explicitly named as an empirical question with no programmatic substitute — in this phase's
own gate comments (check 47, closing note, item 4) and in CLAUDE.md's Gaps section: *"No amount of
research substitutes for putting the artifact on the actual workshop display before the session."*
**Still human after the 2026-09-02 pass, and this is the one where that is not a formality.** What a
probe CAN say was measured on the day, real Chrome at 1920×1080, and is recorded here so the room
starts from numbers rather than from nothing: the turns line computes to **24px / weight 700 /
`rgb(232,235,242)` on the strip's `rgb(25,29,38)`**, line-height 38.4px, reading
`≈9 turns to wipe Mechs`; the "What beats what" band head is **20px / `rgb(164,173,190)`**; nothing
clips either. None of that answers whether a person at the back of a room can read them. There is no
instrument for viewing distance, and this check is the reason that sentence is in CLAUDE.md.
how: Put the artifact on the actual projector or the largest shared screen available and stand back.
result: [pending]

## Summary

total: 3
passed: 2
issues: 0
pending: 1
skipped: 0
blocked: 0

**Read the numbers this way.** Two of the three were pending only for want of a layout engine, and
a real browser driven headless is one — so they are closed on measurements, in two browsers, at
between two and ten viewport sizes each, with the raw readings kept beside the probe that took
them. The third is pending because it is about a room, and nothing in this repository will ever
close it.

## Gaps

- **G-03-A (RECORDED 2026-09-02, not a defect).** In the build view, at the document's final scroll
  position, `#strip`'s sticky releases at the end of `#board` and figures leave the top of the
  window: 2 of 6 at a 768-tall window, 3 of 6 at 700, all 6 at 600 and below. Standard sticky
  semantics; recoverable by scrolling back. Whether it is worth a `min-height` on the board or a
  bottom-of-container stop is a design question nobody has been asked. Measured in Chrome and Edge
  at ten heights — `p2-result.json`.
- **G-03-B (OPEN).** Projector legibility, check 3. Inherited from Phase 2's G-02-B and Phase 2.1's
  G-02.1-B, and this file adds the strip's own 24px turns line to what has never been read from the
  back of a room.
