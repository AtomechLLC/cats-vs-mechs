---
phase: 05-fight-loop-playtest
plan: D33b
subsystem: fight-surface
tags: [d-33, audit-pass-b, p1-1, p1-2, p1-3, p1-4, p1-5, p1-6, p1-7, p2-1, p2-10, p3-1, p3-2, p3-6, sticky-footer, one-source-of-truth, dial-re-derivation, rows-turned-in-the-open]

requires:
  - phase: 05-fight-loop-playtest
    plan: D33
    provides: "the audit — the P1 tier's eight findings, their measurements, and the section marker that owns each"
  - phase: 05-fight-loop-playtest
    plan: D33a
    provides: "the state palette (--state-on-solid is Advance's fill, --state-lit-* is the retarget channel), the 120ms ramp, and the scroll affordance this pass repointed from .fg-sides to .fg-field"
  - phase: 05-fight-loop-playtest
    plan: D31
    provides: "the state/input split whose two areas this pass re-bounds, and check 108, which this pass turns"
provides:
  - "[S06.7] fgPoolWords — the ONE function that turns held-and-spoken-for into words, called by both the state card and the topbar"
  - "[C14.1] .fg-round-acts as a sticky footer at the foot of #fight-input; .fg-advance's primary fill; .fg-commit"
  - "[C14.1] .fg-row--arming / .fg-arming — the retarget flow's feedback at the press, in the --accent-2 channel"
  - "[C14.1] .fg-row's focus-within wash (P3-6, carried from Pass A)"
  - "[C07]/[C12] .pk-head/.pk-body/.pk-foot and .ae-head/.ae-body/.ae-foot — the three-block dialog frame"
  - "[S06.8] LD_LANE_SAID and ldWait — one lane caption, one placeholder card"
  - "[S06.9] DC_ALIVE_WORDS — the act/state pair for the dead-marker toggle"
affects: [05-D33c, 05-D33d, 05-D33e, 05-D33f, 05-D33g]

tech-stack:
  added: []
  patterns:
    - "a sticky footer as the structural replacement for four generations of viewport dial — it holds the property at every viewport, roster and setting, including the 768 case D-31 recorded as unreachable"
    - "one derivation rendered twice rather than two arithmetics over one slice: the SENTENCE is what is shared, not the input"
    - "moving a scroll boundary inward (.fg-sides -> .fg-field) instead of moving nodes out of a scroller — the audit's outcome at a fraction of the churn"
    - "a bounded region's checks must read what is INSIDE the box, not the box: browser cell 6b was green while a third of the picker was invisible"
    - "grid-template-rows: auto minmax(0,1fr) auto on a dialog, with the scroll on the body and the way out sticky"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs

decisions:
  - "P1-1 took the audit's FIRST option (make the topbar render the card's spoken-for figures) rather than its recommended second (delete the bar's figures), because [S06.7] documents those spans as the one pool reading present in BOTH views. One derivation, two renderings — and the figure a room is told to watch is now the one that moves."
  - "P1-2's scroll boundary moved INWARD to .fg-field rather than the nodes moving out of .fg-sides. Same outcome — headings, survivor reading and live resources all outside a scroller — with no DOM move, no new shell id and no stub-drift."
  - "The picker's bound was removed entirely rather than re-derived. What paid for it is P1-6's sticky footer; the two changes do not make sense apart."
  - "The ledger's @media(max-height:820px) height query is DELETED rather than retuned: it existed to buy back 74px that a repeated note and a column of zeroes were spending."
  - "P1-5's `.ld-now` re-framing was NOT done: the audit reports it has no border and no background, and [C14.2] gives it both. Measured on screen — it is already a card."
  - "The lit shape keeps a REAL text node, shortened from 'Pick this one.' to 'Pick', rather than losing it — [C14.4] requires the lit state in two channels and colour is neither."
  - "The projection's third pool reading ([S06.9] dcFillLive, apSpent) is NOT touched. It answers a different question in different words, it is off by default in the fight view, and [C15] belongs to Pass F."

metrics:
  duration: ~5h
  completed: 2026-08-30
  tasks: 7
  commits: 7
---

# Phase 5 Plan D33b: D-33 Pass B — The P1 Structural Tier Summary

**One-liner:** Nine of nine cats are on screen where six were, the two figures for one pool are
one function, the commit control is the brightest thing on the surface instead of the second
brightest and it can no longer leave the window, both authoring dialogs finish where a student can
see them, and a past-round card shows nine board lines where it showed none — with five harness
rows turned in the open, each because it had been green over the defect it was written to catch.

## What was built

### P1-1 · One pool reading, one function — `[S06.7]`, `[C14.1]`

The audit photographed it: three Cats declared at 1 AP each, and 770px apart on one screen the
state card read **"3 of 3 spoken for · 0 left to spend"** while `#pool-cats` read **"0 of 3 spent ·
3 left to spend"**. Same pool, same sentence ending, different number, and the wrong one was the
only one a room could see — the right one sat 92px below the fold of an unmarked 238px scroller.

`fgFillPool`'s own banner had asked exactly the right question and answered it wrong:

> "The bar's figures and the grid's figures are computed from the same slices in the same frame,
> **so they cannot disagree**."

True of the inputs, false of the sentences — two arithmetics ran over those slices
(`apSpent(build, live)` here, `spokenForPools()` on the card). So the **sentence** is what is
shared now: `fgPoolWords(held, spoke)` is the only place in the file that turns those two numbers
into words, `fgResRow` calls it and so does `fgFillPool`, over the one `spokenForPools` walk
`fightBar` already takes.

| | before | after |
|---|---|---|
| `#pool-cats`, three declared | `Cats · Action points · 0 of 3 spent · 3 left to spend` | `Cats · Action points · 3 of 3 spoken for · 0 left to spend` |
| `#state-cats .fg-team` | `Action points · 3 of 3 spoken for · 0 left to spend` | identical |

The audit **recommended the cheaper option** — strip the bar's figures to the round number alone —
and this plan declined it, with the reasoning recorded at the site. Those three spans are the one
pool reading present in **both** views; deleting them takes the pool away from a student who has
stepped back to the board tab. Making them live keeps the property and fixes the defect in one
move. `.fg-pool-spent` was renamed `.fg-pool-spoke` with the sentence it carries.

**Zero diff over the ops.** `apSpent` is untouched and still floored; the build-against-fight
reading it answers survives in the projection, flagged to Pass F below.

### P1-2 · Nine units, nine shown — `[C14.1]`, `[C16]`

Measured on the shipped 9-and-3 board:

| viewport | region | clientHeight | scrollHeight | hidden | cats clipped |
|---|---|---|---|---|---|
| 1920×1080 | state `.fg-sides` | 238 | 364 | 126px | 5 of 9 |
| 1920×1080 | input `.fg-sides` | 346 | 517 | 171px | 3 of 9 (7 with a declaration standing) |
| 1366×768 | state `.fg-sides` | 169 | 364 | 195px | 6 of 9 |
| 1366×768 | input `.fg-sides` | 246 | 517 | 271px | 5 of 9 (8 with a declaration standing) |

…under a heading reading "9 of 9 still standing".

`.fg-sides` loses `max-height` and `overflow-y` at both areas. **The bound moves onto `.fg-field`**
— the battlefield cluster, which is the only thing in a column that can honestly be windowed — at
34vh, against a shipped cluster that measures 216px at both viewports. The two headings, the
survivor reading and the live team resources are outside a scroller *by construction* now, which is
what the audit asked for; **the scroll boundary moved inward instead of the nodes moving out**, so
no DOM node moved, no shell id was added and the stub-drift gate reads the same 135 either side.

`[C16]`'s Pass-A scrollbar and edge-shade rules were **repointed** from `.fg-sides` to `.fg-field`
in the same commit — a cue on a box that no longer scrolls is a rule for nothing.

**After, every state, both viewports: 0 of 9 picker rows and 0 of 9 battlefield shapes clipped by
any scrolling ancestor.**

### P1-6 · The commit follows what it commits, and outranks the thing that throws it away — `[C14.1]`, `[S06.7]`

Both round controls move from the **top-right head line** of `#fight-input` to its **foot**, as a
`position: sticky; bottom: 0` footer. Advance takes the one **fill** on the surface
(`--state-on-solid` + `--accent`, no new hex); "Reset this fight" drops `brd-btn--danger` for the
standard outline and keeps every word of its label; FIGHT-10's notice becomes Advance's caption
inside `.fg-commit` rather than a third element competing for the row. **No string moved.**

The foot placement is the exact arrangement **PROBE BO** drove and found broken — Advance at 1408
of a 1080 viewport with the whole node gate green over it. What makes it safe is the sticky, and
it is **strictly stronger than every dial four plans have spent on this**:

```
1920x1080  four page offsets with picker rows in view, Advance wholly on screen at all four
1366x768   three offsets with rows in view, all three — which is the fold claim D-31 measured
           as unreachable at this size ("the arithmetic has no free term in it")
```

Every ancestor of the row reports `overflow: visible` in both browsers at both sizes — `[C03]`'s
sticky gotcha, re-checked rather than assumed, in cell 10's shape.

### P1-7 · Feedback at the press — `[S06.7]`, `[S07.5]`, `[C14.1]`, `[C14.4]`

"Change target" was pressed at y=1029; the three lit shapes rendered at y=660–800 — above the
press, 300px away, in another panel, with the third cut in half by a scroller.

- the armed **row** is marked in place: `.fg-row--arming`, in the `--accent-2` channel — the channel
  the lit shapes are drawn in, so the press and its response are one colour across two panels;
- `.fg-at--on` moves from the *declared* channel to the *lit* one for the same reason: arming is not
  declaring, and a blue button lighting pink shapes was the same defect arriving in hue;
- the button relabels to **"Choose a target"** while armed, tracking `aria-pressed` and the class —
  three channels, and the new one is the only one that reads at twenty feet;
- **one** instruction on the armed row replaces the per-shape repetition, and it says the second
  press leaves the target alone (the audit's "nothing says pressing it again cancels");
- `BF_PICK_SAID` shrinks from a sentence to **"Pick"** — still a real text node on every lit shape,
  because `[C14.4]`'s two channels are an outline **and** a node a screen reader reaches;
- `[S07.5]` calls `scrollIntoView({ block: 'nearest' })` on the first lit node, **on arming only**,
  guarded three ways.

`.bf-unit` gained `scroll-margin-top: calc(var(--topbar-now) + 14px)`, and it was **measured into
existence**: `'nearest'` puts a node's edge on the scrollport's edge, and `#topbar` is sticky over
that edge — the first two lit shapes came to rest at **0–91 of a 768 viewport, wholly behind a
161px bar**. They now rest at 176–267.

**Lit shapes clipped by a scroller: 1 of 3 at 1920 and 3 of 3 at 1366 before; 0 of 3 at both after.**

### P1-3 · One dialog frame, and a way out that is always on screen — `[C07]`, `[C12]`

| dialog | scrollHeight | client @1080 | @768 | Done |
|---|---|---|---|---|
| `#tok-picker` before | 1466 | 1038 (428 hidden) | 726 (740 hidden) | off screen at both |
| `#act-edit` before | 1087 | 1038 (49 hidden) | 726 (361 hidden) | off screen at both |
| both, after | = client | **0 hidden** | **0 hidden** | **on screen at both** |

The dialog (and for the editor the **pane**, because that dialog holds two) becomes
`display: grid; grid-template-rows: auto minmax(0, 1fr) auto` with an explicit `max-height` and
`overflow: hidden`: a fixed header, one scrolling body, and a sticky footer with a `--line` rule
and negative margins out to the padding edges. `.pk-head`/`.pk-body`/`.pk-foot` and
`.ae-head`/`.ae-body`/`.ae-foot` are **wrappers only** — no id moved, none was added, not one
rendered string changed, and `DIALOG_FLOOR` and the 135 shell ids are byte-unmoved.

The `minmax(0, 1fr)` on `.ae` is load-bearing and was **measured**: with a plain `1fr`, Done was on
screen (the pane's own grid put it there) while the dialog still clipped **382px of terms
unreachably**, because `max-height: 100%` on a child of an auto-height block is no constraint at
all.

### P1-4 / P2-10 / P1-5 · The lane earns its height — `[S06.8]`, `[C14.2]`

At 1366×768 with three rounds resolved a card was **115px holding 667px of content**, and of its
twelve unit lines **zero** were visible — against `[C14.2]`'s own shipped acceptance criterion,
which is quoted in the block and replaced. At round one `#ledger-list` was an empty div under a
heading with 1,180px of empty page beside it.

1. **The note is printed once for the lane** (`LD_LANE_SAID`), not once per card. It was
   byte-identical on all three; three cards spent ~144px of a 345px lane saying it three times.
2. **A tally that is zero is not drawn** in a past-round reading: `Cat 1 ▪▪▪ 0×▪` → `Cat 1 ▪▪▪`.
   Health is always drawn. This is `[S06.11]`'s battlefield rule, shipped since 05-15 — the artifact
   answered one question twice, differently, on two surfaces read in one glance. The overturned
   decision is quoted at the site.
3. Card content **667px → 552px**, and 74px of every card's top came back.
4. **The 15vh height query is deleted, not retuned.** Re-driven after both fixes, counting unit
   lines rather than leaves:

   | `.ld-row` | card @1080 / lines of 12 | @768 / lines of 12 |
   |---|---|---|
   | 15vh | 162 / 9 | 115 / **3** |
   | 22vh | 238 / 10 | 169 / **9** ← both shipped |
   | 26vh | 281 / 12 | 200 / 9 |
   | 34vh | 367 / 12 | 261 / 11 |

   The base bound was already 22vh, so the breakpoint goes. Cost at 768: the lane 152 → 173px and
   the round state's top 726 → 748 — 21px for six more lines a card, affordable only because P1-6
   made Advance independent of everything above it.
5. **P1-5:** one dashed placeholder card at round one, naming the round it waits for, removed the
   moment history exists and **back after a fight reset**.

`.ld-now`'s re-framing was **not** done: the audit reports it has no border and no background;
`[C14.2]` gives it both and the screen agrees.

### P2-1 · One left edge, one product name — `[C02]`, `[C03]`

The `h1` sat at x=342 (1920) and x=65 (1366) while `#topbar`, `#views` and `#board` all sat at
x=160 and x=22. `.shell-head` now carries the same breakout formula, **shorthand first and computed
longhand after** — which is the order `[C15]`'s banner records a 182px misalignment coming from
getting wrong, the same 182px this closes. `.brd-brand` is deleted from the markup and its rule
kept as a comment; the `h1` stays because it is the document's only level-one heading.

**After: h1 / topbar / views / board all at x=160 and x=22.** Side effect worth recording — the bar
stops wrapping at 1366 and its height drops **161px → 109px**, which is part of P2-2 arriving free.

### P3-1 / P3-2 · Labels that tell the truth — `[S06.1]`, `[S06.9]`, `[C04]`

`rm.textContent = '×'` — the one control on the page that deletes a student's roster was the one
breaking this project's own UX-02 floor, which six regions of the file state. It reads **"Remove"**
now, with the accessible name staying the more specific "Remove Cat 1" — the right way round for a
column of twelve identical buttons.

`<button class="dc-alive" aria-pressed="false">Marked dead✓</button>` on a cat at full health: a
past-tense status claim that is false while unpressed, beside an attribute correctly saying so.
`DC_ALIVE_WORDS` holds the pair and `dcFillStanding` writes it from the **same `dead` reading** the
class and the attribute come from. Driven both ways at both viewports:
`false/"Mark dead" → true/"Marked dead" → false/"Mark dead"`.

### P3-6 · The fight row's focus-within — `[C14.1]`

Carried from Pass A, which left it and said why. It is a left rule and a wash, both `color-mix`
from `--accent`, on a border `.fg-row` already reserves and a negative margin that pays for it, so
neither a focused nor an arming row jumps. Deliberately weaker than *declared* (a fill **and** an
outline **and** a tick, on a button) and than the focus ring itself. Joins `[C16]`'s ramp.

## Verification

**Both gates, before and after this pass:**

| figure | baseline | after |
|---|---|---|
| node suite | 1253 passed, 0 failed, exit 0 | **1253 passed, 0 failed, exit 0** |
| interaction gate | 196 of 196 | **196 of 196** |
| stub-drift | 135 shell ids | **135** |
| `DIALOG_FLOOR` / scan | 138 / 172 | **138 / 172** |
| `FIGHT_FLOOR` / scan | 132 / 592 (592 with the sidebar) | **132 / 569 (569)** |
| `PROPOSE_FLOOR` / scan | 23 / 62 | **23 / 62** |
| setup scan | 128 | **128** |
| browser checks, headless, Chrome + Edge, 1920×1080 and 1366×768 | 222 passed, 0 failed | **222 passed, 0 failed** |

**No floor moved.** The fight scan fell by 23 strings (three per-card notes and the zero-shield
readings, less the one armed-row line) and stays 437 above its floor.

**Read back off rendered pixels**, real Chrome, headless, `file://`, both viewports, every state
reached by pressing shipped controls. Zero page errors and zero console errors in every run.

| finding | measurement, before → after |
|---|---|
| P1-1 | topbar `0 of 3 spent / 3 left` vs card `3 of 3 spoken for / 0 left` → **byte-identical on both surfaces**, driven mid-declaration |
| P1-2 | picker rows clipped 3/9 and 5/9, shapes 5/9 and 6/9 → **0/9 and 0/9**, in all three states at both sizes |
| P1-3 | `#tok-picker` 428px / 740px hidden, `#act-edit` 49px / 361px, Done off screen → **0 hidden, Done on screen**, dialog scroll 0, body scroll >0, header pinned |
| P1-4 | card 115px / 667px of content / **0** of 12 unit lines at 768 → 169px / 552px / **9** of 12 |
| P1-5 | `#ledger-list` an empty div at round one → **one dashed card**, "Round 1 will appear here once you advance." |
| P1-6 | Advance a plain pill above the rows, Reset the most saturated object → **filled, at the foot, sticky**; wholly on screen at every offset where a row is |
| P1-7 | lit shapes 1/3 and 3/3 clipped, at 0–91 behind a 161px bar → **0/3 clipped, 176–267**, button reads "Choose a target", one instruction at the press |
| P2-1 | h1 at 342 / 65 against 160 / 22 → **160 / 22**; brand rendered twice → once |
| P3-1 | `×` → **"Remove"**, 86×32px at 18px |
| P3-2 | `aria-pressed="false">Marked dead` → **`false`/"Mark dead"**, driven both ways |

Shots and re-runnable drivers: `…/scratchpad/d33b/` — `drive.mjs` (per-finding readback + shots),
`sticky.mjs` (the sticky sweep), `retarget.mjs`, `dlg.mjs`, `lanesweep2.mjs` (the dial sweep),
`words.mjs`, `lanefade.mjs`. `w1366-sticky-midrows.png` is the one frame that carries most of the
pass: nine cats, the topbar and the card agreeing, and a filled Advance pinned at the foot.

## Rows and floors moved, every one in the open

Nothing was narrowed to make it pass. Each turned row asserts **more** than it did.

| row | what it asserted | why it had to turn | what it asserts now |
|---|---|---|---|
| node **102** | the topbar was "still reading zero", asserted only as non-empty | it was green over the contradiction for two plans | the bar carries the **card's own line** at five moments, on **both** sides |
| node **108** | the two controls on `#fight-input`'s **head line** — PROBE BO's clause | P1-6 makes the foot placement the shipped one | **last child** of the area **and** `.fg-round-acts` carries a sticky bottom, read out of the rule body (103b's idiom) |
| node **96**, **102** | counted `.ld-row` | P1-5's placeholder carries that class | both kinds counted; the placeholder's **whole contract** is a claim — one card and no history at round one, none after an Advance, **back after a reset** |
| browser **6b** | the picker's **box** begins on screen and fits after a scroll | it only ever measured the box, and was green while a third of the rows were invisible | **no row clipped by any scrolling ancestor**, and the **last row** driven wholly into view. The old fit clause reddened correctly on the 24-a-side board, which is 1267px tall and cannot fit — a property the fix deliberately gave up |
| browser **18** | Advance above the fold at page scroll zero | with a sticky footer that is neither true nor the property | the **mechanism**: sticky, a real bottom inset, last child, and **every ancestor's overflow visible** |
| browser **18c** | Advance **above** the rows, at one offset — PROBE BO's added clause | P1-6 inverts it on purpose | a **five-offset sweep**: wherever a row is on screen Advance is too; and where the footer has **settled**, it sits after the last row |
| browser **23c** | the **dialog's** overflow is `auto`, Done read after scrolling to the end | that is the one offset where a non-sticky footer is also visible | the dialog does **not** scroll, the body does, the header is pinned, and Done is wholly on screen at **both** ends |

## Deviations from Plan

**1. [Rule 1 — bug] The lane caption took a grid cell and displaced the whole lane**

- **Found during:** reading back the 1366 lane screenshot after P1-4
- **Issue:** `#ledger` is a two-column grid above 1100px. The new `.ld-lede` took a cell, the lane
  was pushed into the 300px reading column beside it and `.ld-now` dropped to a full-width row with
  its frame stretched across the page. **1253/0, 196/196 and 222/0 over it, at both viewports** —
  nothing in the harness reads which cell a box lands in.
- **Fix:** `.ld-head, .ld-lede{grid-column:1 / -1}`, with the rule written into `[C14.2]` that any
  child added to this region needs a line there.
- **Commit:** 8867b40

**2. [Rule 1 — bug] The lane caption survived the teardown onto the setup page's scan**

- **Found during:** the gate run immediately after P1-4
- **Issue:** `ldBuild` added `.ld-lede` and `ldRest` did not remove it, so it stood under a hidden
  `#ledger` after `endFight` and the **setup** page's Layer C scan went 128 → 129. That is the exact
  failure `ldRest`'s own banner describes: "Layer C's walk reads the text of every leaf under `#app`
  WITHOUT asking whether an ancestor is hidden."
- **Fix:** the teardown removes it, and the entry says the harness found this rather than the
  comment predicting it.
- **Commit:** 8867b40

**3. [Rule 3 — blocking] `max-height: 100%` on a pane inside an auto-height dialog is no constraint**

- **Found during:** measuring `#act-edit` after the first P1-3 draft
- **Issue:** Done was on screen and the dialog still reported 382px of terms clipped and
  unreachable, because the pane never got a height to be shorter than.
- **Fix:** `.ae` becomes `display:grid; grid-template-rows: minmax(0, 1fr)` too, and both dialogs use
  `minmax(0, 1fr)` rather than `1fr`. The measurement is written beside the rule.
- **Commit:** cdc40ac

**4. [Rule 2 — correctness] `scroll-margin-top` on `.bf-unit`, which the audit does not name**

- **Found during:** driving P1-7's `scrollIntoView`
- **Issue:** `block: 'nearest'` puts a node's edge on the scrollport's edge and `#topbar` is sticky
  over that edge. The first two lit shapes came to rest at 0–91 of a 768 viewport, wholly behind a
  161px bar — "brought into view" and invisible.
- **Fix:** `scroll-margin-top: calc(var(--topbar-now, var(--topbar-h)) + 14px)`, spelled exactly as
  `#strip`'s and `[C15]`'s sticky offsets are, so a bar that wraps moves all three together.
- **Commit:** 05fe1c9

**5. [Rule 4-adjacent — recorded, not asked] P1-1 took the audit's non-recommended option**

- The audit offers two resolutions and recommends the cheaper. This pass took the other one and the
  reasoning is written into `[S06.7]` at the site. The prompt's instruction was "prefer one source of
  truth", and one derivation rendered twice is that; deleting the bar's figures would have removed a
  reading rather than reconciled it.

**6. [Recorded] Two audit claims that the code does not support**

- **P1-5, `.ld-now`:** "The `.ld-now` panel has no border and no background". `[C14.2]` gives it a
  `--accent` border, an `--accent` tint and the region's radius, and every screenshot from this pass
  shows it framed. The placeholder half of P1-5 was implemented; the re-framing was not, because
  there is nothing to re-frame.
- **P1-4, the `.ld-list` edge fade:** already shipped by Pass A under P3-3 and verified in this pass
  at 3× (`w1366-lane-leftedge.png` — the left shade and the horizontal scrollbar, with the lane
  auto-scrolled to its newest card).

**7. [Recorded] The picker's bound was removed, not re-derived**

The audit asks for the two vh dials to be "re-derived against the real content". The input area's
was **removed**: the surface the task is on is the one region in this artifact that should be in the
page's own scroll, and P1-6's sticky footer is what makes that safe. Browser cell 6b's fit clause
reddened correctly on the 24-a-side board as a result and was turned to measure rows instead.

## Known Stubs

None.

## Hand-offs

- **Pass C** (the audit's grouping) is now largely spent: P1-4, P1-5 and P2-10 were done here in one
  turn because P1-4's own instruction requires it. **P2-11** (`Mech 1 / Health` with nothing after
  the word, on the battlefield) is **not** done and is still open under `[S06.11]`.
- **Pass D** inherits a dialog frame that already has the grid, the scrolling body and the sticky
  footer. P2-5's remaining halves — one placement convention across all four dialogs, one field
  treatment, `Copy` in the footer — are untouched, and `#reset-ask` is still the reference. P2-7,
  P2-8 and P2-9 are untouched.
- **Pass E** gets P2-1 done, and gets a bar that no longer wraps at 1366 (161px → 109px) because the
  duplicate brand left. P2-2's remaining half is the round/pool slot's reservation; note that the
  bar's pool figures are **live** now, so a reserved slot has something that moves in it.
- **Pass F** owns `[C15]` and inherits **one flagged reading**: `[S06.9]`'s `dcFillLive` still prints
  `Action points: N spent, M left` from `apSpent` inside `#strip`. It is a different question in
  different words and the panel is off by default in the fight view, so it is not a contradiction on
  screen — but it is the last place in the file that renders the build-against-fight pool, and Pass F
  should decide whether it survives P2-12's rebuild.
- **A property of the sticky footer, recorded rather than left to be found:** while `#fight-input` is
  taller than the window the footer floats over the last ~90px of it, so a picker row — including an
  armed row's instruction line — can be transiently covered. Scrolling clears it, browser cell 18c
  asserts the settled position rather than the floating one, and the row's own tint (which spans its
  full height) rather than the line is the primary at-the-press cue. This is the standard cost of the
  idiom and it is on the rehearsal list as a room question.
- **P3-7** (the hidden tick in every action button's accessible name) and **P3-4/P3-5** are Pass G's
  and are untouched.

## Threat Flags

None. No new network surface, no auth path, no file access and no schema change. The whole change is
layout, colour, four rendered strings and one `scrollIntoView`; the ops diff is zero.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND, modified
- `tests/selftest-node.cjs` — FOUND, modified
- `tests/browser-checks.mjs` — FOUND, modified
- `.planning/phases/05-fight-loop-playtest/05-D33b-SUMMARY.md` — FOUND
- commits `db5480c`, `ab3ed06`, `05fe1c9`, `cdc40ac`, `8867b40`, `183f51c`, `0895697` — all FOUND in
  `git log`
- node gate exit 0 (1253/0, 196/196, 135 ids) and browser gate 222/0 re-run on the committed tree
