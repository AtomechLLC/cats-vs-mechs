---
phase: 05-fight-loop-playtest
plan: D39a
subsystem: style
tags: [d-39, audit-pass-a, p2-1, p2-2, p2-3, p2-4, p2-6, p2-7, p2-12, p2-13, p3-4, c00, c02, c03, c07, c12, c16, c17, c18, s09-11, selftest, no-new-hex]

requires:
  - phase: 05-fight-loop-playtest
    plan: D39
    provides: "the audit itself — Pass A's nine findings and its zero-gate-cost claim"
  - phase: 05-fight-loop-playtest
    plan: D33a
    provides: "[C00]'s state palette and [C16]'s ramp — the two things Pass A extends, and the recorded decision P2-6 reverses"
  - phase: 05-fight-loop-playtest
    plan: D33b
    provides: "the width breakout formula P2-1 copies character for character"
  - phase: 05-fight-loop-playtest
    plan: D35c
    provides: "[C17]'s round-rules grid — its cells, its hairline and its align-items decision"
provides:
  - "[C00] the accent outline means FOCUS and only focus on the --state-on-line channel, across eight consumers"
  - "[C16] the ramp reaches .fg-res[data-fg=res], .fgu-close, .fgu-alive and .pv-close"
  - "[C02]/[C18] #roundrules and #howto on the board measure — one left edge at both viewports"
  - "[C03] .brd-btn--rm, one convention for a control that deletes a student's work"
  - "[C17] .rr-check contained inside its own button; .rr-list start-aligned"
  - "[C07] .pk-sw at the 18px floor; the picker list's tick beside the name it marks"
  - "[S09.11] two mirror rows that assert the mirror's correctness in whichever environment they run in"
  - "the recorded trap: check 125 reads all six [C18] rule bodies BY NAME, so #howto{display:none} must stay byte-exact"
affects: [05-D39b, 05-D39c, 05-D39d, 05-D39e, 05-D39f, 05-D39g]

tech-stack:
  added: []
  patterns:
    - "a state said by a border, a fill and a TICK, with the outline spent entirely on focus"
    - "a demotion modifier over a base class, so the base keeps the ramp and the disabled treatment"
    - "an environment-branching self-test row whose subject is the code, not the sandbox"
    - "a pass whose deferrals are measured tables rather than sentences — three findings priced and moved"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D39a-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-dom.cjs
    - .planning/phases/05-fight-loop-playtest/deferred-items.md
    - .planning/phases/05-fight-loop-playtest/05-D39-AUDIT.md

decisions:
  - "P2-6 is taken on EIGHT consumers, not the three the audit named — a scan found nine on the channel, and stopping at three would have split the action editor's three chooser kinds across two vocabularies."
  - ".ae-prop-pill--on keeps its outline: it is the one consumer with no visible tick rule, so deleting it would leave colour alone. Named for pass G, which owns the proposal pane."
  - "This reverses D33a's decision 1 in the open. D33a kept the outline from a table; D-39 measured the rendered result and found declared and focused byte-identical."
  - "Three of the nine Pass A findings are DEFERRED with measurements rather than absorbed: the audit's 'zero gate cost' is false for P2-2's .ae-pill half (two browser cells), P2-3's .rr-pill half (cell 25a at 1366) and P2-13 (a decision D-38 already photographed and reverted)."
  - "P3-4 is deferred because the idiom the audit names cannot do what the finding needs: [C16]'s cue is a background and paints behind content, and no Baseline mechanism makes a self-gating overlay."
  - "[S09.11]'s two mirror rows branch on the environment rather than asserting one. The live branch is a STRONGER claim than what stood there, not a weaker one."

metrics:
  duration: ~3h
  completed: 2026-09-02
  tasks: 7
  commits: 8
---

# Phase 5 Plan D39a: D-39 Pass A — Free Wins, Priced Honestly Summary

**One-liner:** The accent outline stopped meaning two things on eight controls, two regions joined
the board's left edge, four controls joined the motion ramp, the two Remove buttons stopped
impersonating the Create buttons beside them — and three of the audit's nine "zero gate cost"
findings turned out to have a price, so they were measured, reverted and moved rather than absorbed.

---

## 1. The headline

D-39 Pass A is nine findings the audit grouped at **zero gate cost**. Six landed at zero gate cost.
**Three did not, and finding that out is most of what this pass did.** Every figure in the harness
is byte-identical to where it started, in all four runners, and the artifact's live self-test went
from **1458 passed / 2 failed** to **1460 / 0** in both engines.

| runner | before | after |
|---|---|---|
| `tests/selftest-node.cjs` | 1336 passed, 0 failed, exit 0 | **identical** |
| interaction gate | 216 of 216 | **identical** |
| stub-drift | 160 shell ids | **identical** |
| Layer C floors | 179 / 32 / 725 / 725 / 747 / 62 | **identical** |
| `tests/selftest-dom.cjs` | 1460 passed, 0 failed | **identical** |
| `tests/browser-checks.mjs` | 314 passed, 0 failed | **identical**, zero row-status differences on a diff |
| **live `#selftest`, real browser** | **1458 passed, 2 FAILED** | **1460 passed, 0 failed** (chrome and msedge) |

---

## 2. What landed

### P2-6 · The accent outline means focus, and only focus — `[C00]`

The finding the audit calls *"the cheapest win in the document"*, and the one that changed the most
on screen. Measured before, pointer parked off the surface:

```
.fg-act--on     (declared)  outline 2px solid rgb(92,200,255)  offset 2px
:focus-visible  (focused)   outline 2px solid rgb(92,200,255)  offset 3px
```

Byte-identical in width, style and colour — because `--state-on-line` and `--state-focus` are
**both** `var(--accent)` by definition twelve lines apart in `[C00]`. No care at the consumer end
was ever going to separate them.

**Eight consumers, not the three the audit named.** A scan for the whole declaration found **nine**
rules on the channel. Stopping at three would have left `.ae-item--on`, `.ae-side--on` and
`.ae-pill--on` — the action editor's three kinds of chooser, on one surface, which D33a had
deliberately made read alike — saying "this is the one" in two different ways. Taken on all eight
that carry a **visible tick**: `.pk-sw--on`, `.ae-item--on`, `.ae-side--on`, `.ae-pill--on`,
`.fg-act--on`, `.vw-on`, `.pv-on`, `.rr-pill--on`.

`.ae-prop-pill--on` is the ninth and **keeps its outline**. It builds an `.ae-check` node and there
is no rule anywhere in the sheet to show it — D-32's *"a rule written at three sites and
implemented at one"*, now four and three. Deleting its outline would leave it saying "on" in colour
alone, which `[C07]` forbids outright. Showing its tick is a change to the **proposal pane**, which
D-39 reserves for pass G behind a developer decision. Left standing, named in `[C00]`'s banner.

`.bf-unit--lit` keeps its outline, on the `--accent-2` channel, exactly as the audit says.

Read back off pixels, 1920, real Chrome, `zoom-declared-vs-focused`: before, "Slash" (declared) and
"Hairball" (focused) are the same object with one pixel of offset between them. After, Slash is
filled with a tick and no ring; Hairball wears the ring alone. Unmistakable.

### P2-7 · The four controls outside the motion ramp — `[C16]`

Measured live: `.fgu-close` computed `transition-duration: 0s, transition-property: all` while
`.fg-act` beside it computed `0.12s` on seven properties. Every control D-36 and D-37 added
hover-**snapped** while everything around it ramped. `.fg-res[data-fg="res"]`, `.fgu-close`,
`.fgu-alive` and `.pv-close` added to the ramp list **and** to the `prefers-reduced-motion` guard's
copy of it, per the audit's own two-place prescription. All four now read `0.12s` on the same seven
properties.

One specificity exception is recorded rather than left to be found: `.fg-res[data-fg="res"]` is
(0,2,0) where the rest of the list is (0,1,0), but its own `:hover` is nested and expands to
(0,3,0), so the banner's resting-value invariant holds.

### P2-1 · The board tab stops having three left edges — `[C02]`/`[C18]`

Measured at 1920: `.shell-head`, `#topbar`, `#views`, `#board` and `#refband` at x=160 w=1600;
`#roundrules` and `#howto` at x=342 w=1236. **182px of inset**, on the two regions added *after*
D-33b fixed exactly this for `.shell-head`, with `#roundrules` sitting directly under `#refband`.

Both regions given the breakout, copied character for character from `.shell-head`'s, shorthand
first and `margin-left` longhand after — `[C15]`'s recorded trap. After: **x=153 w=1600** at 1920
and **x=15 w=1322** at 1366, matching `#topbar` exactly at both.

### P2-2 (the `.rr-pill` half) · The tick comes back inside its own button — `[C17]`

Measured: `.rr-check`'s right edge at 534 against its button's at 530 — **4px outside**, with the
`--on` border drawn through the glyph. Photographed at 3x: it renders as a clipped **"⌄"**.

The tick is an in-flow flex item now rather than an absolute one — separation from the gap already
on the pill, containment from the padding already on the pill, `visibility:hidden` still reserving
its width so a press does not reflow the row. Measured after: **−9px**, i.e. inside. Read back on a
crop: "Cats ✓", whole.

### P2-2 (the picker half) · The tick travels with what it marks — `[C07]`

Measured: on a 293px row the tick sat **224px** from the word it marks, because `.pk-sw-label` takes
the slack and the tick was appended after it. Moved **before** the name, **in the markup** — not
with a CSS `order`, which checks 103e and 108 both forbid because it walks a screen reader out of
step with the room. The scannable-column property the old order was buying survives: second
position is also a fixed column, because every row opens with the same 24px token.

### P2-3 (the `.pk-sw` half) · The swatch labels reach the floor — `[C07]`

`.pk-sw` **13px → 18px**, with `min-width` 66 → 84 so "Square", "Triangle" and "Hexagon" still sit
on one line. `[C07]`'s own banner sets that floor eleven rules above the rule that was breaking it.
Zero cost at both viewports. `.rr-check` also went 13px → 14px, matching `.pk-check` and `.ae-check`.

### P2-4 (the align half) · A wrapped row still reads as one row — `[C17]`

`.rr-list` `align-items` **stretch → start**. Stretched, a row whose token strip has wrapped is a
*tall* row, and `.rr-cell`'s own `align-items:center` then floats the amount field and Remove to the
middle of it, off the reading's line. The hairline stays continuous, because every cell's top edge
is the row's top edge. `[C17]`'s recorded paragraph arguing against `center` is kept — it is still
true about `center`, which is a different value.

### P2-12 · One convention for a control that deletes work — `[C03]`

Measured: `#tok-pick-remove` and `#act-edit-remove` both carried class `brd-btn`, byte for byte the
same as the create buttons beside them, while `#reset-ask-confirm` carries `brd-btn--danger` and
`.unit-rm` has its own `--accent-2` channel. Three conventions, and the two dialogs where a student
actually destroys something had none of them.

`.brd-btn--rm` added: transparent ground, `--ink-dim` label, `.unit-rm`'s `--accent-2` on hover and
focus, opacity 1 at all times. `margin-inline-start:auto` puts it at the far end of both rows.
**Demotion plus separation, not reddening** — D-33 P1-6's call, applied. Measured at 1366: Remove at
x=974 with a transparent ground against New at x=183 on `--panel`.

### The live `#selftest` defect — `[S09.11]`

Opening the shipped artifact with `#selftest` in the hash of a real browser read **1458 passed, 2
failed**, in Chrome and in Edge, with zero page errors. Both failures were rows asserting *"no
location in this sandbox"* — true under node, true under the stub DOM, **false in the one place a
student ever runs this**.

The harness ships *with* the artifact; that is its whole reason for existing over Jest. The report
an instructor sees by double-clicking **is** the deliverable, and two red rows in it say the tool is
broken when the tool is fine.

Both rows now branch on whether `location` and `history` exist:

- **no-location branch** — unchanged assertions. Scheduling writes nothing, flushing reports nothing
  to flush, `codeInHash()` hands back `null`.
- **live branch** — the *stronger* claim. Scheduling arms a write, flushing runs it and reports so,
  nothing was swallowed, and the reader finds **that exact code** again in the real hash, compared
  against a fresh `encode()`. A round trip through the address bar rather than through a variable.

The live branch incidentally exercises `[S04.4]`'s decision 1 — the highest-consequence line in that
sub-region — for the first time in this suite: the run's own `#selftest` token **survives** the
mirror write. Verified in the hash: `#selftest,b=v1~N~V~A9~3~9*3!0~9*~~~~B3~3~3*6!3~3*~~~~7tvo`.

Row count unchanged: two `t.eq` before, two after.

---

## 3. Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 — bug] The audit's P2-6 name list is incomplete: nine consumers, not three**

- **Found during:** P2-6, scanning before editing
- **Issue:** the audit names `.fg-act--on`, `.ae-pill--on` and `.rr-pill--on` and claims the change
  makes the accent outline mean focus *"everywhere in the file"*. A scan for
  `outline:2px solid var(--state-on-line)` returns **nine** rules. Fixing three would have left six
  controls with the collision intact and split one dialog's three chooser kinds across two
  vocabularies — worse than either extreme. This is the failure mode the gate's own row 108 names:
  *"a name list cannot be completed by adding a fourth name."*
- **Fix:** taken on all eight consumers carrying a visible tick; the ninth held back for pass G with
  its reason written into `[C00]`
- **Commit:** `7e054b8`

**2. [Rule 1 — bug] Check 125 reads `#howto{display:none}` byte-exact**

- **Found during:** P2-1, first run after the edit
- **Issue:** folding the breakout into `#howto`'s existing rule turned the interaction gate to
  **215 of 216**. Check 125 reads all six `[C18]` rule bodies **by name** off the stylesheet,
  because with no layout engine "the board goes away on the how-to tab" is a CSS claim. `[C18]`'s
  banner warned about exactly this.
- **Fix:** the breakout arrives as a second rule on the same selector; the named body stays
  byte-identical. Back to 216 of 216. The trap is now written beside the rule.
- **Commit:** `0bac62a`

### Three findings priced and moved — the substance of this pass

The audit's Pass A table says **"GATE: None. No markup, no strings."** for all nine findings. It is
true for six. For three it is not, and each was **written, run, measured and reverted** rather than
argued about. All three are in `deferred-items.md` with their tables and their admissible answers.

**3. [Rule 4 — architectural] P2-2's `.ae-pill` half costs two browser cells**

- **Issue:** the in-flow tick was applied to `.ae-check` exactly as it was to `.rr-check`, and
  `browser-checks.mjs` reddened twice at 1920:
  ```
  FAIL 23.  the terms region is dense — twelve rows, every one ONE line
            rows [41,48,48,48,41,48,48,48,87,94,94,94]   <- the four CHANGES rows went to TWO lines
  FAIL 23c. ... the tick is SHOWN on the pressed pill    <- tickDx 0 -> -14
  ```
  The Changes rows carry the Caster/Target pair on top of seven pills, so ~20px of newly in-flow
  tick per pill pushed them over — D-32b's dense editor broken to fix a 4px mark. And **23c reads
  `tickDx` and asserts the overhang as the shipped geometry**, so the change turns a claim the
  harness makes on purpose.
- **Resolution:** reverted. This is D-30's notation on D-32's density, which D-39 itself reserves
  for pass G (*"This is D-30's spec — raise before implementing"*). Half of the finding landed for
  free regardless: P2-6 took the ring off `.ae-pill--on`, so the outline no longer draws *through*
  the glyph — which was what made it photograph as a clipped "⌄".
- **Commit:** `911fa76`

**4. [Rule 4 — architectural] P2-3's `.rr-pill` half costs cell 25a at 1366**

- **Issue:** the finding is right — the round-rules grid is the one authoring surface under
  `[C07]`'s 18px floor. The cost is not none. Driven in real Chrome and real Edge, `#rr-list` at
  **1366** with the five shipped types:

  | `.rr-pill` | list width | columns | slack | row heights |
  |---|---|---|---|---|
  | 15px | 1284 | 123 449 523 90 82 | **17** | 41, 48 — one line |
  | 18px | 1284 | 123 505 484 90 82 | **0** | 82, 89 — **two lines** |

  Cell **25a** asserts *"two rules, ONE LINE EACH"* in both engines, and its **binding clause is the
  slack** — its own banner says a track with no free space cannot be caught stretching. There were
  17px of room and "Who it reaches" alone wants 56 more. **And the width is not recoverable:**
  `.rr-cell` padding 14→8, `.rr-read` min-width 96→0 and `.rr-pill` padding 8→6, *all three driven
  together*, still left slack 0 and rows 82/89. The columns redistribute; the grid is already
  over-constrained.
- **Resolution:** reverted to 15px. It needs a column dropped, a party word shortened, or 1366
  accepting two lines with 25a turned to say so — decisions about what the surface *is*. The third
  is nearly free now that `align-items:start` has landed.
- **Commit:** `963b657`

**5. [Rule 4 — architectural] P2-13's layout half was already tried and reverted, with a picture**

- **Issue:** the audit asks for `align-items:start` on `.ht-grid` against a measured 1,095px of
  empty card. `[C18]`'s own banner records that D-38 *"changed it to `start` and back again with a
  picture of each"*. Both pictures were taken again this pass rather than trusting either party.
  Measured at 1366, per-card void: stretch **185/236/17/333/17/231**, start **17 ×6**. But the void
  does not go away under `start` — it **moves**, out of the panels where a border accounts for it
  and into the gaps between them where nothing does. Grid rows are still sized to their tallest
  item, so row 1 leaves 167px under "The board" and 218px under "Tokens", and the rack reads as
  three ragged pairs. D-38's sentence is exactly right.
- **Resolution:** not taken. The audit's own alternative (`column-count`) needs `break-inside:avoid`
  and changes how a card relates to its neighbours. And P2-13's *other* half — dropping the eyebrow,
  which is unambiguously right — moves `HOWTO_FLOOR` and `SUITE_FLOOR` anyway, so the finding cannot
  be free in any case. Deferred whole, to the pass that re-derives the floor.

**6. [Rule 4 — architectural] P3-4's prescription rests on a false premise**

- **Issue:** the defect is real and was photographed (`ae-scrolled.png`, 1366, maxed action): the
  name field's bottom curve sliced flat at the top, the word "Changes" cut through its letterforms
  by the sticky footer. But the audit says *"`[C16]`'s edge-fade idiom exists and is not applied to
  the two sticky edges"* — and `[C16]`'s idiom is the four-layer scroll shadow, which is a
  **background**. Backgrounds paint *behind* content; it cannot soften a cut through a glyph, and it
  is **already applied to both dialog bodies** (measured: `bgLayers: 4`,
  `background-attachment: local, local, scroll, scroll`). Applying the named idiom is a no-op.
- **Resolution:** deferred. What the finding needs is an *overlay*, and there is no Baseline way to
  make one self-gating: a permanent gradient dims the first 18px even when nothing is cut (the
  "permanent smudge" `[C16]`'s own banner warns against), and the mechanisms that would gate it are
  `animation-timeline: scroll()` — which `CLAUDE.md` lists under **What NOT to Use** — or a scroll
  listener this file has deliberately never had. The same call D33a made when it carried P3-6 out of
  its own Pass A. One measurement is recorded for whoever takes it: **`.ae-foot` overlaps `.ae-body`
  by 18px**, exactly the shade layer's height, so the bottom cue is painted underneath the footer
  and can never be seen.

### A stale claim in the audit, corrected

**7. [Rule 1 — bug] P2-4's "the round-rules grid has no rows" is wrong**

The audit reports *"`.rr-rule` computes `display: contents`, bounding box 0 × 0,
`border-top-width: 0px`"* and concludes there is no row separator. It measured the **row**, which is
`display:contents` and has no box **by design** — and the audit's own CHANGE says so (*"since the
row itself has no box"*). The separator is on the **cells** and has been since D-35c. Measured this
run: **35 separator cells at 1px**, on a live eight-rule list. Nothing to fix. Only the
`align-items` half of P2-4 was outstanding, and it landed.

---

## 4. Verification

**The gate, before and after, diffed.**

Every figure in §1 is byte-identical. `diff` over the full browser-check row list (`PASS`/`FAIL`
lines, both engines, both viewports) returns **no differences**. `node tests/selftest-node.cjs`
exits 0.

**Read back off rendered pixels**, real Chrome, headless, `file://`, 1920×1080 **and** 1366×768,
with `--hide-scrollbars` removed from the default args (D33a's recorded trap). Before/after pairs
for every visual change, all read back:

| shot | what it settles |
|---|---|
| `*-14z-declared-vs-focused.png` | before: two identical rings. after: Slash filled + tick + no ring, Hairball ringed. P2-6 |
| `*-03z-rr-pill.png` | before: the ring slices the tick into a "⌄". after: "Cats ✓", whole and inside |
| `*-06z-pk-list.png` | before: tick at the far edge. after: "▪ ✓ Health" |
| `*-05-tokpicker.png` | the 18px swatch labels all sit on one line at min-width 84 |
| `*-02-roundrules-live.png` | `#roundrules` sharing `#refband`'s left edge; hairlines; start-aligned rows |
| `*-10z-ae-foot.png` | "Remove this action" transparent and dim against a `--panel` "New action" |
| `*-12z-viewswitch.png` | `.vw-on` filled with a tick and no ring |
| `ht-stretch.png` / `ht-start.png` | why P2-13 is deferred — the void moves, it does not go |
| `ae-scrolled.png` / `ae-topedge.png` / `ae-botedge.png` | P3-4's cut, photographed, and the footer overlap |
| `ring-check.png` | all six `--on` pills identical, blurred, pointer off — no ring survives anywhere |

**Zero page errors and zero console errors** in every run, at both viewports, before and after.

**The live self-test, which is the third proof of the `[S09.11]` fix:**

```
chrome  1460 passed, 0 failed  | selftest token survived the mirror write: true
msedge  1460 passed, 0 failed  | selftest token survived the mirror write: true
```

Against **1458 passed, 2 failed** measured in the same harness before the change. The DOM runner is
unmoved at 1460/0 and **these two rows are not why** — `tests/selftest-dom.cjs` supplies neither
`location` nor `history` by design, so both rows take the inert branch and assert exactly what they
asserted before.

All measurements, drivers and screenshots:
`scratchpad/d39a/` — `shots-a.mjs`, `probe-ring.mjs`, `probe-p3p4.mjs`, `probe-slack.mjs`,
`live-both.mjs`, and `before-w1920-A.json` / `after-w1920-A.json` / `mid3-w1366-A.json`.

---

## 5. Hand-offs

- **Pass B** (`P1-1`, the typo-into-the-crash-panel finding) inherits `.brd-btn--rm`, which is the
  treatment its *"the panel should not offer 'Reset to Workshop 16 defaults' as its accented
  control"* sub-item wants. It exists now.
- **Pass C** should know `#roundrules` and `#howto` are on the board measure at both viewports, so
  any width it derives against them changes.
- **Pass D and E** inherit the state vocabulary this pass finished: the accent outline is focus and
  nothing else, so a new control may say "selected" with a border, a fill and a tick and will be
  consistent with all eight existing ones without further thought.
- **Pass G inherits three things, not one.** It already owned P2-15, P3-2 and P3-3. It now also owns
  (a) `.ae-prop-pill--on`'s outline and its missing tick rule, (b) P2-2's `.ae-pill` half with cell
  23 and 23c priced, and (c) P2-3's `.rr-pill` half with cell 25a priced. All five are D-30's
  notation or D-32's density on surfaces the developer has already been asked to rule on.
- **The cheapest open item in the document** is now P2-3 answer 3: let 1366 wrap to two lines and
  turn cell 25a to assert the wrapped shape. `align-items:start` landed this pass, so the wrapped
  row already reads correctly; the only thing between it and green is a cell written when one line
  was achievable.
- **A warning for the next author of `[C18]`:** check 125 reads all six of that block's rule bodies
  by name. `#howto{display:none}` must stay byte-exact. Add rules beside it, never into it.

---

## Known Stubs

None. Nothing in this pass renders a placeholder, and no data path was left unwired.

## Threat Flags

None. No new network surface, no auth path, no file access and no schema change. The whole pass is
CSS, two class-list additions, one DOM append reordered, and two self-test assertions.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND, modified
- `tests/selftest-dom.cjs` — FOUND, modified
- `.planning/phases/05-fight-loop-playtest/05-D39-AUDIT.md` — FOUND, committed
- `.planning/phases/05-fight-loop-playtest/deferred-items.md` — FOUND, three entries appended
- `.planning/phases/05-fight-loop-playtest/05-D39a-SUMMARY.md` — FOUND
- commit `e311422` (the audit) — FOUND in `git log`
- commit `7e054b8` (P2-6) — FOUND
- commit `99ba706` (P2-7) — FOUND
- commit `0bac62a` (P2-1) — FOUND
- commit `7e2aa8e` (P2-2/3/4) — FOUND
- commit `2385437` (P2-12) — FOUND
- commit `e700bd8` ([S09.11]) — FOUND
- commit `911fa76` (.ae-pill revert) — FOUND
- commit `963b657` (.rr-pill revert) — FOUND
