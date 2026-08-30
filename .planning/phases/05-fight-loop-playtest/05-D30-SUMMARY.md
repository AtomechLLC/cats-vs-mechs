---
phase: 05-fight-loop-playtest
plan: D30
subsystem: render+gate
tags: [d-30, redirect, c14-5, s06-12, sym-sign, color-mix, no-new-hex, accessible-name, browser-checks, headless]

requires:
  - phase: 05-fight-loop-playtest
    plan: D29
    provides: "[S06.12]'s symQty/symMark/symBox, [C14.5]'s .sym- rules, SYM_MINUS, rows 107-107d and the 182-cell browser suite this plan turns and extends"
  - phase: 02-allocation-surface
    plan: 01
    provides: "[C05]'s .tok — position:relative on the shape and the clip-path on its .tok-s child, which is what makes a mark parented to .tok positionable and unclipped"
provides:
  - "[C14.5]'s .sym-sign as a positioned mark: left:0 / top:25% / translate(-50%,-50%), resolved against .tok"
  - "the first color-mix() in a POLAR space in this file, and the reason a straight sRGB average could not reach the developer's word"
  - "[S06.12]'s symMinusOnto and SYM_TAKEN — the removal in a third channel, on the accessible name, exported so no gate row types it"
  - "rows 107, 107b and 107c TURNED IN THE OPEN; 107e and 107f added. Interaction gate 188 -> 190"
  - "browser cells 21b, 21c and 21d — the geometry in pixels, every mark on the page, and a colour proved DERIVED by moving the token it derives from. 182 -> 194"
  - "deferred-items 8: the no-new-hex rule is checked over [C14] and nowhere else, with PROBE BM's measurement of what that was worth"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "a decorative mark parented to the node whose BOX defines its geometry, so a percentage in the stylesheet means what the sentence that asked for it meant"
    - "a colour mixed in a polar space because the two source tokens sit either side of the target hue and a straight-line average cannot pass through it"
    - "a state that became visual said in a third channel by the function that KNOWS it is a removal, rather than by each caller that happens to render one"
    - "a stylesheet scanned as DECLARATIONS rather than as text, because every id selector begins with the character a hex literal does"
    - "a colour proved derived by MOVING the token it derives from, which is the only claim about derivation a browser can make without agreeing with itself"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D30-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/05-11-PLAN.md
    - .planning/phases/05-fight-loop-playtest/deferred-items.md
    - .planning/REHEARSAL.md

key-decisions:
  - "THE MARK IS PARENTED TO .tok AND THAT ONE CHOICE IS THE WHOLE OF THE GEOMETRY. The developer asked for `left:0; top:25%` in words — 'the top-left corner (25% from the top, center aligned to the left edge) of the symbol/shape' — and a percentage in CSS means nothing until you say what it is a percentage OF. Parented to the READING it is 25% of the reading's height and 0 from the reading's left edge, which is correct in the repetition form and lands on the left edge of '0x' in the compact one, because syncRow puts the count FIRST there. Parented to .tok it is 25% of the shape and the shape's own edge in BOTH forms and on every shape. [C05] gave .tok position:relative in Phase 2 for its own reasons and put the clip-path on the .tok-s CHILD, so the shape is already a containing block and a mark inside it is not cut by a triangle's polygon. Measured 0.00px and 0.2500 on all 126 marks, both browsers, both viewports"
  - "THE RED IS MIXED IN A POLAR SPACE, AND THAT IS THE DIFFERENCE BETWEEN OBEYING THE INSTRUCTION AND ALMOST OBEYING IT. The rule is [C07]'s: no new hex, derive from [C00] through color-mix(). The two warm tokens are --accent-2 (#ff7eb6, the shipped danger colouring) and --coral (#ff8a5c). Their hues are about 334deg and 17deg — EITHER SIDE OF RED — so a straight sRGB average lands at #ff838e, a salmon that is neither of them and is not red. Interpolating in hsl walks the SHORT hue arc through 360 and lands at 355deg: rgb(255,109,120). Same two tokens, same rule, no new colour, and the developer's actual word. Every other route to a real red from this palette requires typing one"
  - "THE REMOVAL IS NOW SAID IN WORDS, AND IT IS SAID BY symQty RATHER THAN BY THE CALLERS. D-30 takes the minus out of the text RUN and makes it colour plus position — two channels, both visual, and both pruned out of the accessibility tree by the role='img' every [S06.12] reading carries. [C07]'s rule is that no state is said in colour alone; without a third channel this change would have broken it. It is prefixed centrally because WHETHER SOMETHING IS BEING TAKEN AWAY is the argument symQty already takes, so the one place that knows it is the one place that says it — a prefix written at the two callers is a prefix the third caller forgets. The cost is that D-29's promise about the tooltip being the byte-exact pre-D-29 string is amended, in the open, at its own site"
  - "THE TWO ROWS THAT READ THE DASH WERE GREEN BY ACCIDENT AND THE PROOF IS THE PRE-CHANGE RUN ITSELF. 107 counted minus signs and 107c compared the character; both passed identically before and after D-30, because the character never left the DOM — it left the text RUN. The pre-change snapshot running 188 of 188 over a page with no mark on any shape IS the recorded red, and both rows now read the sign's PARENT. This is the counting-versus-contract failure 107b was already corrected for once this phase"
  - "D-30's BRIEF NAMES FOUR SURFACES AND THE FILE RENDERS THE NOTATION ON TWO, AND THE OTHER TWO MUST NOT GROW ONE. Costs (picker) and split facts (lane) are removals and carry the mark; a REQUIREMENT subtracts nothing and [S06.7]'s comment already ruled on it, and a lane DELTA draws both ends and never a difference, which is [S06.8]'s 'two numbers and no adjective'. Adding a mark to either would be this plan overruling two shipped rulings under cover of a fourth-round instruction about where a mark goes. Row 107b asserts the requirement line carries NO prefix, so the distinction is now checked rather than merely written down"
  - "NOTHING IN THIS REPOSITORY HAS EVER CHECKED THE NO-NEW-HEX RULE, AND ROW 107f CLOSES A QUARTER OF THAT. PROBE BM replaced the color-mix with the byte-identical literal and the whole node gate ran green, as did both browser cells that read the mark's POSITION — a typed colour is pixel-identical to a derived one. Exactly one cell caught it, and a claim only a browser can make is unchecked in every fresh checkout. The source-side half now scans [C14] to the close of the style block; [C00] through [C13] is deferred with its owner named, because a row reddening on a Phase 2 colour would be this plan asking for a change D-30 did not ask for"

requirements-completed: []

duration: 150min
completed: 2026-08-29
---

# Phase 05 D-30: The Removal Minus Becomes a Red Mark on the Shape Summary

**The minus that marks a resource being taken away is no longer a dash beside
the symbol. It is a red mark whose centre sits exactly on the shape's left edge,
exactly a quarter of the way down its height — measured 0.00px and 0.2500 on all
126 marks a fight draws, in real Chrome and real Edge at both viewport sizes,
headless. The red is mixed from two colours already in the palette and no new hex
was written, which is proved by MOVING one of those tokens and watching the mark
follow. And because a mark is colour and position, and both are pruned by the
`role="img"` every reading carries, the removal is now said in words on the
accessible name too — which is the one thing this change ADDS rather than moves.**

## The gate, before and after

| | before (post-05-D29) | after |
|---|---|---|
| suite | 1216 passed, 0 failed | **1216 passed, 0 failed** |
| `SUITE_FLOOR` | 1186 | 1186 — **not moved**; no `[S09.*]` row added |
| interaction gate | 188 of 188 | **190 of 190** (+2: 107e, 107f) |
| stub-drift | 115 shell ids | **115 — unchanged, no id added** |
| `#app` (setup) | 128, floor 117 | **128 — unchanged.** No setup surface touched |
| `#app` (fight) | 590, `FIGHT_FLOOR` 130 | **590, `FIGHT_FLOOR` 130 — NOT MOVED** |
| `#app` (fight, sidebar open) | 590 | **590** |
| dialogs | 145 across 4 roots, floor 138 | **145 — unchanged** |
| proposal pane | 60, floor 23 | **60** |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 8139 literals, 0 hits | **8156 literals**, 0 hits |
| no-writer gate | 58 ops, 26 arms, 497 records | unchanged |
| perf | 100 commits in 6 ms (budget 50) | 100 commits in **6 ms** |
| **browser checks** | 182 passed, 0 failed | **194 passed, 0 failed** |

`node tests/selftest-node.cjs` exits 0.
`PLAYWRIGHT_DIR=... node tests/browser-checks.mjs` reports **194 passed, 0
failed**, exit 0, **headless in both browsers** — the default since commit
`54f862a`, and it stayed the default here. Run with Playwright unresolvable it
prints the SKIP line and exits **0** — re-verified.

**`counter|balanc|rating` prints 0, whole document. `url(` 0. `innerHTML` 0.
`createElementNS|<svg` 0. `text-wrap` 0. One classic `<script>`, one `<style>`.
`DEFAULTS.cats.ap` untouched (D-25) — `git diff 347f607..HEAD` over
`cats-vs-mechs.html` touches no `[S01]` line.**

**`FIGHT_FLOOR` did not move, and that is a checked claim rather than an
omission.** Plan 05-D29's own instruction was that a plan moving prose ONTO or
OFF an attribute re-measures the constant. This plan moves prose onto neither:
it prefixes an attribute that was already harvested, which changes the CONTENT
of a string and not the COUNT of them. Measured 590 closed and 590 open, before
and after, on the same drive.

**Layer B went 8139 → 8156 and the seventeen are comments, not strings.** That
layer matches quoted spans with a regex over the whole script block, comments
included, which is how it has always worked and is documented at its own site as
an over-count that only ever costs false positives. This plan added about eighty
lines of comment containing quoted phrases. Zero hits either way.

## What D-30 asked for, and what it became

> make the - for removing a resource red and make it appear in the top-left
> corner (25% from the top, center aligned to the left edge) of the symbol/shape
> - rather than a normal dash

```
before        Slash  − ▲▲▲            a dash, then three triangles
after         Slash   ▲▲▲             a red mark on the first triangle's
                     ¯                 top-left corner, centred on its edge
```

`.sym-sign` is `position:absolute; left:0; top:25%; transform:translate(-50%,-50%)`
and is a **child of the `.tok` it marks**. That parent is the whole of the
geometry and the key decisions above argue it at length: a percentage means
nothing until you say what it is a percentage of, and `.tok` is the only node in
the reading whose box IS the shape. `[C05]` gave `.tok` `position:relative` in
Phase 2 and put the clip-path on its `.tok-s` child, so the shape was already a
containing block and a mark inside it is not cut by a triangle's own polygon.

**Where the mark appears, and where it deliberately does not.** D-30's brief
names four surfaces; this file renders the removal notation on two, and the
other two refuse it on rulings older than this plan:

| surface | mark? | why |
|---|---|---|
| picker costs — `fgCostParts`, both arms | **yes** | a cost is a removal |
| lane split facts — `ldSplitInto`, shield and health | **yes** | a hit taken is a removal |
| requirement lines — `symMark` | **no** | nothing is subtracted by a requirement; `[S06.7]`'s own comment rules on it |
| lane deltas and hand rulings — `symDelta` | **no** | both ends are drawn and never a difference — `[S06.8]`'s "two numbers and no adjective" |
| transformation readings | **n/a** | there is no `xf` reading on the fight surface; 05-D29 recorded this and it is still true. The editor's are a BUILD surface |

Row 107b now asserts the requirement line carries **no** removal prefix while
the cost on the same button does, so the distinction is checked rather than
written down.

## The colour, and why it is mixed in a polar space

`[C07]` states the rule and `[C13]` sharpens it — *"the danger colouring ... is
not to be invented a third time"*. The palette's two warm tokens are
`--accent-2` (`#ff7eb6`, what `.err-btn--danger` and `.brd-btn--danger` already
wear) and `--coral` (`#ff8a5c`). **Their hues sit either side of red**, at about
334° and 17°:

| mix | lands on | reads as |
|---|---|---|
| `color-mix(in srgb, --accent-2, --coral)` | `#ff838e` | a salmon between the two |
| **`color-mix(in hsl, --accent-2, --coral)`** | **`rgb(255,109,120)`** | **red** |

A straight-line average of two colours either side of red cannot pass through
red; a hue interpolation walks the **short arc through 360°** and lands at 355°.
Same two tokens, same rule, no new colour, and the word the developer actually
used. Every other route from this palette to a real red requires typing one.

## The third channel, which is the one thing this change adds

Before D-30 the minus was a character in the text run. After it, the meaning
"this is being taken away" is carried by **colour and position** — and every
reading `[S06.12]` builds has `role="img"`, which prunes the sign out of the
accessibility tree along with the tokens. So a screen reader would have been
told a quantity and never told it was a removal.

`SYM_TAKEN` is the answer and it lives in `symQty`, not at the callers, because
*whether something is being taken away* is the argument `symQty` already takes.
A cost's tooltip reads **"Removes: 1 Action Points"** where it read "1 Action
Points"; a split fact reads **"Removes: Shield took 1 of the 1."**. The
character itself is untouched and still in every leaf walk and in the Layer C
harvest, which row 107e counts by name — so the three channels are the mark, its
place, and the sentence.

**D-29's promise that the tooltip is the byte-exact pre-D-29 string is amended
at its own site rather than left to rot**, in `[S06.7]`'s comment and in rows
107b and 107c.

## The gate rows, old claim and new claim

| row | what it asserted | what it asserts NOW | its reading |
|---|---|---|---|
| **107** | the lane reads in symbols; the split's sentence off the tooltip; **minus signs COUNTED** | **two clauses TURNED.** The split's sentence is matched with the removal prefix (read off the live export); and every sign in the lane must be a **child of a `.tok`**. The count alone passed identically before and after D-30 | 53 readings, 0 failing; 4 marks in the lane, 0 off a shape |
| **107b** | an authored type arrives as authored on both surfaces and through both of `[S06.12]`'s shapes | **claim EXTENDED.** The two expected tooltips now differ **by the prefix** — a cost says "Removes:", a requirement does not — so a prefix applied to every reading rather than to every removal fails it | cost tooltip `"Removes: 3 Zeal"`; requirement tooltip `"Zeal"` |
| **107c** | a cost is U+2212 plus the type's tokens, compacting at `COMPACT_AT`, tooltip the exact pre-D-29 string | **two clauses TURNED.** The tooltip carries the prefix, and **the sign's parent is asserted to be the shape in BOTH of syncRow's forms** — which is the clause that catches a mark that looks right below the threshold and sits on `12×` above it | at 11: parent=shape, `"Removes: 11 Action points"`; at 12: parent=shape, `"Removes: 12 Action points"` |
| **107e** NEW | — | **every mark in `#app`, on both surfaces, in three channels, with the converse read too**: a reading whose NAME says a removal must DRAW one. Failures counted, not sampled. Floored on a mark being found on the lane AND on a picker | 40 marks (4 lane, 36 picker), 0 failing, 0 saying-without-drawing |
| **107f** NEW | — | **not one colour literal in the fight stylesheet**, scanned as DECLARATIONS: comments stripped, values cut at `:` and `;`, because every id selector starts with `#` too | 517 declarations, 110 reading a `[C00]` token, 19 deriving through `color-mix()`, **0 literals** |
| 92, 92b, 100, 103f, 107d and the rest | 05-12 to 05-D29's | **re-read, unchanged** | all green |

## The browser readings — real Chrome and real Edge, 1920x1080 and 1366x768, headless

| reading | @1920x1080 | @1366x768 |
|---|---|---|
| the mark's centre, x, from the shape's left edge | **0.00px** | 0.00px |
| the mark's centre, y, as a fraction of the shape's height | **0.2500** | 0.2500 |
| the mark's own box, on a 12x12 shape | 13x18 | 13x18 |
| its computed font size | 18px | 18px |
| marks on a 3-round, 3-a-side fight (lane / picker) | **126 (90 / 36)** | 126 (90 / 36) |
| of those: off a shape / off the geometry / clipped | **0 / 0 / 0** | 0 / 0 / 0 |
| closest any mark comes to a clipping edge | 27.6px | 27.6px |
| the computed colour, on every one of the 126 | **rgb(255,109,120)** | rgb(255,109,120) |
| with `--accent-2` forced to `#00ff00` | rgb(226,255,46) | rgb(226,255,46) |
| with the override removed | rgb(255,109,120) | rgb(255,109,120) |
| a lane card, window over content *(D-29: 1174)* | 238px over **1172px** | 115px over **1172px** |

**Chrome and Edge agree to the digit on every figure.** Every D-29 and D-28
geometry reading is otherwise byte-identical — Advance at 658/619, `.fg-sides`
at 717/346/1063 and 677/246/923, the sidebar, the 24-a-side grid. Only the lane
card's content height moved, by 2px, which is `[C14.5]`'s 7px of lead on a
reading that carries a mark.

### The browser cells added

| cell | what it does |
|---|---|
| **21b** NEW | the mark's **centre** against the shape's own rect: `dx` in pixels, `dy` as a **fraction** of the shape's height. The fraction rather than a pixel count because 3px is the right answer only while `--tok` is 12px, and `[C00]`'s rehearsal dial exists to be turned |
| **21c** NEW | **every mark in the document**, failures counted. The lane is the half that matters: a split fact of zero draws the compact form, so its shape is the row's SECOND child. Clipping measured too, because half the mark hangs outside the shape by construction and `.ld-row` is a real clipping box |
| **21d** NEW | the red is **DERIVED and not typed**, proved by MOVING `--accent-2` and watching the mark move, then putting the token back. Reading the colour and comparing it to a number would assert that the cell agrees with itself |
| 21 | gains the removal prefix on the tooltip |
| 1–20b and the rest | **re-read, unchanged, green** |

## The probes

**Every probe was run AFTER the commit it tests, recorded verbatim, and reverted
by `cp` from a scratchpad snapshot. `git checkout --` was never used, `git clean`
was never run, and `git status --short` read clean after each.**

### PROBE BK — the mark anchored to the READING instead of to the shape

**Applied:** `symMinusOnto`'s `row.querySelector('.tok')` forced to `null`, so
the sign falls through to the arm that prepends it to the reading — which is
exactly the pre-D-30 arrangement.

```
FAIL  interaction gate :: 107.   4 minus signs are drawn in the lane, of which 4
                                 are not parented to a shape
FAIL  interaction gate :: 107c.  the sign is parented to the shape below the
                                 threshold=false and at it=false
FAIL  interaction gate :: 107e.  40 removal marks ... of which 40 fail one of the
                                 three channels
interaction gate: 186 of 189                                    EXIT=1

browser: 21b and 21c red in both browsers at both sizes — 126 marks, 126 off a shape
browser checks: 186 passed, 8 failed
21d STAYED GREEN, correctly: BK moved the parent and not the colour
```

**And the recorded RED for the turn is the pre-change run itself.** The same
arrangement — no mark on any shape anywhere — ran **1216 passed, 188 of 188,
exit 0** against rows 107 and 107c as D-29 wrote them, because counting a
character cannot tell you where the character is.

### PROBE BL — the anchor moved from 25% to 50%, which is the whole developer sentence

**Applied:** `top:25%` → `top:50%` in `[C14.5]`. One character pair.

```
node tests/selftest-node.cjs    1216 passed, 0 failed
                                interaction gate: 189 of 189            EXIT=0

browser: 21b and 21c red, both browsers, both sizes
         "126 marks, 0 off a shape, 126 off the geometry"
browser checks: 186 passed, 8 failed
```

**The node gate is spotless over a mark at the wrong height, and that is the
division of labour rather than a hole in it** — it has no layout engine, so
`top:25%` is a string to it. It reads the PARENT, which is the strongest claim
available without pixels, and rows 107, 107c and 107e all make it. The pixels
are cells 21b and 21c, and this probe is why they count failures across every
mark rather than sampling one.

### PROBE BM — the red hard-coded as the byte-identical literal

**Applied:** `color:color-mix(in hsl, var(--accent-2), var(--coral))` →
`color:#ff6d78`, which is the same colour to the byte.

```
node tests/selftest-node.cjs    1216 passed, 0 failed
                                interaction gate: 189 of 189            EXIT=0
browser: 21b GREEN, 21c GREEN (a typed colour is pixel-identical to a derived one)
FAIL  21d ... with --accent-2 forced to green it becomes rgb(255, 109, 120)
browser checks: 190 passed, 4 failed
```

**One cell in the whole repository caught a new hex, and it was one that only
runs where Playwright is installed** — which is not a fresh checkout, by design.
`[C07]` states the no-new-hex rule, `[C13]` and `[C14]` each restate it, and
nothing had ever checked it. Row `107f` is that probe's finding turned into a
source-side check over `[C14]` to the close of the `<style>` block. Re-run
against it:

```
FAIL  interaction gate :: 107f.
      the fight stylesheet slice is 14203 characters and holds 517 declarations,
      of which 110 read a [C00] token and 19 derive one through color-mix()
      | declarations bearing a colour literal=1 | the first few: [":#ff6d78;"]
interaction gate: 189 of 190                                    EXIT=1
```

The remaining three quarters of the stylesheet is deferred-items 8, with its
owner named.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 2 — missing critical functionality] The removal reached no
non-visual channel at all**

- **Found during:** writing `[C14.5]`, before the first run.
- **Issue:** D-30 replaces a character in a text run with **colour plus
  position**. Both are visual, and every `[S06.12]` reading carries
  `role="img"`, which prunes the sign out of the accessibility tree along with
  the tokens it sits on. `[C07]`'s rule — no state said in colour alone — would
  have been broken by this change, silently, with every gate green: the
  character stays in `textContent`, so every scan and every leaf walk still sees
  it, and none of them asks whether anything can HEAR it.
- **Fix:** `SYM_TAKEN`, prefixed in `symQty` and exported. Rows 107, 107b, 107c
  and 107e assert it; 107e asserts the converse too.
- **Files modified:** `cats-vs-mechs.html` (`[S06.12]`, `[S06.7]`'s comment).
- **Commit:** `9ef3619`.

**2. [Rule 2 — missing critical functionality] The mark overhangs its box and
`.ld-row` is a clipping box**

- **Found during:** reading `[C14.2]`'s rule bodies before the first browser run.
- **Issue:** the mark's centre sits ON the shape's left edge, so about half of
  it — 6.5px — hangs outside the reading. `.ld-row` carries `overflow-y:auto`,
  and a box with one non-visible overflow axis computes the other to `auto` too,
  so the lane card clips horizontally. On the one surface where a reading sits
  hard against the card's left edge the mark would have been cut in half.
- **Fix:** `.sym:has(.sym-sign){padding-left:7px}` — on the READING so it
  travels to every surface, and on the `:has()` so a reading with no mark keeps
  sitting exactly where D-29 measured it. Cell 21c measures the result: the
  closest any of 126 marks comes to a clipping edge is **27.6px**.
- **Files modified:** `cats-vs-mechs.html` (`[C14.5]`).
- **Commit:** `9ef3619`.

### Corrections to the orchestrator's own premises, recorded rather than worked around

1. **"The gate asserts no new hex over the fight styles" — it did not, and
   nothing anywhere did.** PROBE BM measured what that was worth: the whole node
   gate green over a typed literal. Row `107f` now makes the premise true for
   `[C14]` onward; deferred-items 8 names what is still open and who owns it.
2. **The brief names four removal surfaces; the file renders the notation on
   two.** Requirement lines and lane deltas carry no minus, on rulings written
   into `[S06.7]` and `[S06.8]` before this plan. Growing marks there would have
   been this plan overruling two shipped decisions under cover of an instruction
   about where a mark goes. Row 107b now asserts the requirement line's
   abstention, so the distinction is checked.
3. **"Any row reading the old inline dash textually" — there were two, and
   neither would have gone red on its own.** The dash never left the DOM; it
   left the text RUN. Both are turned to read the sign's PARENT, and the
   recorded red is the pre-change run passing 188 of 188 over a page with no
   mark anywhere.
4. **The node gate cannot see this change at all beyond the parent**, which
   PROBE BL demonstrates rather than assumes: `top:50%` runs 189 of 189, exit 0.
   Three browser cells carry the half that can only be measured in pixels.

## Known Stubs

None. Every mark is built on the same frame the reading it sits on is painted,
by the function that already decided the reading was a subtraction. Nothing is
placeholdered, no branch renders an empty mark, and the one arm that could
(`symMinusOnto`'s no-shape fallback) is unreachable today, documented as
unreachable, and given a positioned ancestor so that if a future compaction form
ever reaches it the mark lands at the reading's corner rather than escaping to
the page.

## Threat Flags

None. No network endpoint, no auth path, no file access, no schema change. This
change moves one existing node to a different parent, adds one CSS rule and one
exported string constant, and stores nothing anywhere. No caller string is
interpolated into a className — the mark's class is a literal, and the shape it
is parented to is still built by `makeToken` through the shipped
`safeShape`/`safeColor` allowlists, which is T-02-01's mitigation reused rather
than restated. **Zero packages installed**: Playwright was resolved from the
existing dev-only install through `PLAYWRIGHT_DIR`, and every ad-hoc measurement
driver lives in the scratchpad and is not committed.

## Commits

| # | Commit | What |
|---|---|---|
| 1 | `9ef3619` | `[C14.5]`'s positioned mark and its polar colour mix; `[S06.12]`'s `symMinusOnto` and `SYM_TAKEN`; rows 107/107b/107c turned, 107e added |
| 2 | `2224b40` | browser checks 182 → 194: cells 21b, 21c and 21d |
| 3 | `0082818` | row 107f — no colour literal in the fight stylesheet, PROBE BM's finding |
| 4 | `a40c140` | 05-11 section I and item 53 (register 1-52 → 1-53), `REHEARSAL.md`'s D-30 block, deferred-items 8 |

## Self-Check: PASSED

Files:
- FOUND: `cats-vs-mechs.html`
- FOUND: `tests/selftest-node.cjs`
- FOUND: `tests/browser-checks.mjs`
- FOUND: `.planning/phases/05-fight-loop-playtest/05-11-PLAN.md`
- FOUND: `.planning/phases/05-fight-loop-playtest/deferred-items.md`
- FOUND: `.planning/REHEARSAL.md`
- FOUND: `.planning/phases/05-fight-loop-playtest/05-D30-SUMMARY.md`

Commits:
- FOUND: `9ef3619`, `2224b40`, `0082818`, `a40c140`

Gates:
- `node tests/selftest-node.cjs` — **1216 passed, 0 failed**, interaction gate
  **190 of 190**, stub-drift **115 shell ids**, `FIGHT_FLOOR` **130** with the
  fight harvest at **590** closed and **590** open, Layer A 0 hits, Layer B 8156
  literals 0 hits, perf 100 commits in 6 ms, exit **0**
- `node tests/browser-checks.mjs` — **194 passed, 0 failed** with
  `PLAYWRIGHT_DIR` set, real Chrome and real Edge at 1920x1080 and 1366x768,
  **headless**; exit **0** with the SKIP line without it
- `counter|balanc|rating` 0; `url(` 0; `innerHTML` 0; `createElementNS|<svg` 0;
  `text-wrap` 0; one `<script>`; one `<style>`
- `DEFAULTS.cats.ap` untouched — `git diff 347f607..HEAD` touches no `[S01]` line
- `git status --short` clean after every probe revert
