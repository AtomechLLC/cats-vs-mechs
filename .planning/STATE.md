---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: verifying
stopped_at: Completed D-33 PASS C — the P2/P3 tiers and REF-03 (05-D33c)
last_updated: "2026-08-30T05:20:00.000Z"
last_activity: 2026-08-30
progress:
  total_phases: 7
  completed_phases: 6
  total_plans: 48
  completed_plans: 48
  percent: 86
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-26)

**Core value:** A student builds two factions that look nothing alike and discovers they can still be balanced — and discovers it by playing, not by being told a number.
**Current focus:** Phase 05 — fight loop & playtest

## Current Position

Phase: 05
Plan: 16 of 16 complete, plus the D-27, D-28, D-29, D-30, D-31 and D-32 redirect work;
every autonomous plan in the phase is done
Status: Blocked on 05-11 — the playtest. It is a `checkpoint:human-verify` gate and it is
still plan 11.
**D-32 IS TWO DISPATCHES AND BOTH ARE DONE.** The developer asked for two things:
"allow multiple input for all cost/needs/changes" and "make the action configuration more
dense".

**Part 1 (05-D32a) — multiple.** All three term lists cap at **4** (`MAX_ACTION_COST`
1→4, `MAX_ACTION_REQ` and `MAX_ACTION_XF` 2→4) with `WIRE_BOUNDS.maxActionCost` moved in
the same change, `setActionCost` taking a slot like its two siblings, and a cost that
**spends what it names** — the preview depletes every pool, the disable checks every pool
against the previewed remainder, Advance spends every term and records what each paid. A
pool is action points or a type a student keeps at SIDE scope (D-24); health and shield
are deliberately not pools, because spending them means choosing which unit pays and that
is adjudication. The codec stayed at **v1** — verified, not assumed. Refusal matrix
**17 → 20 shapes**.

**Part 2 (05-D32b) — dense.** The terms region measures **707px where it measured 2507**,
and every one of its twelve rows is **one line of 41px** where they were three lines of
169 and 181 — measured in real Chrome and real Edge at 1920x1080 and 1366x768, headless,
on the drive that took the before numbers. The word "Spends", printed four times under a
legend that already said Cost, is replaced by the TERM drawn in the fight's own notation:
`[S06.5]`'s `termReading` calls `[S06.12]`'s `symQty` with the arguments `fgCostParts`
calls it with, so the editor's tooltip and the picker's tooltip are asserted **equal to
each other** rather than each to a typed string. The chooser pills KEEP THEIR WORDS —
they are controls, and UX-02's "nothing conveyed by hover alone" is answered rather than
waived — so the width came from `.ae` going 660 → 1040 with `.ae-list` and `.ae-name`
capped at 610 so the width buys height and nothing else.
Gate: node **1253/0** with **196 of 196** interaction rows (+111, +112), stub-drift
**135 shell ids — unmoved, and that is the point**, `FIGHT_FLOOR` **132 — unmoved**,
dialogs 172 (floor 138, not moved), browser checks **222/0 HEADLESS** (+cells 23–23d).
Seven probes against committed snapshots.
`deferred-items.md` item 10 is CLOSED with its measurements; item 11 is new — the dialog
still scrolls, and what is left of its height is the list, the notes and the name field
rather than the terms.
`.planning/phases/05-fight-loop-playtest/05-D32a-SUMMARY.md` and
`.planning/phases/05-fight-loop-playtest/05-D32b-SUMMARY.md`.

**D-33 IS AN AUDIT AND EIGHT PASSES, AND PASS A IS DONE.** `05-D33-AUDIT.md` looked at the
real artifact in two browsers at two viewports and found, among much else, that the file
had **one colour doing four jobs** — 17 `:hover` rules all writing
`border-color:var(--accent)`, `:focus-visible` and `.fg-act--on` byte-identical — **zero
`transition` declarations anywhere**, and **five internal scrollers clipping load-bearing
content with no affordance of any kind**. Eight passes are proposed; A is the one with
zero gate cost and it establishes the palette B, C, D and F all consume.

**Pass A (05-D33a).** Four states, four treatments, every colour derived by `color-mix()`
from the six shipped tokens — hover a muted accent border plus a gradient wash, declared
an accent border and a **fill** with the outline kept as [C07]'s non-hue channel, focus
the same ring at **offset 3** with a 1px `--bg` ring inside it, lit as a target in
`--accent-2`. A **120ms ramp** on 24 control classes plus three panels, a 160ms
opacity-only dialog entrance, and a **scroll affordance on all seven** scrolling regions:
`scrollbar-width`/`scrollbar-color` with matching `::-webkit-` rules, and the four-layer
scroll shadow that self-gates on overflow with no JS. `prefers-reduced-motion` takes the
ramp, the entrance and `scroll-behavior:smooth` to nothing and leaves the affordance
standing. New block `[C16] MOTION AND SCROLL`; palette tokens in `[C00]`.
Gate — and the gate NOT moving IS this pass: node **1253/0 exit 0**, **196 of 196**,
stub-drift **135 shell ids**, `DIALOG_FLOOR` 138/172, `FIGHT_FLOOR` **132**/592,
`PROPOSE_FLOOR` 23/62, browser checks **222/0 HEADLESS**. Both harness outputs were
`diff`ed against a pre-change run: two timing lines in the node output, one smooth-scroll
landing note in the browser output, and **D-30's badge geometry and every D-32b density
note byte-identical**.
Read back off pixels at 3x with `--hide-scrollbars` removed from Playwright's headless
defaults — which is why the audit never saw a scrollbar in a screenshot.
`.planning/phases/05-fight-loop-playtest/05-D33a-SUMMARY.md`.
**Pass B (05-D33b) — the P1 structural tier, ten findings, seven commits.** The dramatic
half of the audit: content that was hidden, figures that contradicted each other,
hierarchy that was inverted.

- **P1-1, one pool reading.** The topbar read `0 of 3 spent / 3 left to spend` while the
  state card 770px below read `3 of 3 spoken for / 0 left to spend` about the same pool in
  the same frame. `fgFillPool`'s own banner said they "cannot disagree" — true of the
  inputs, false of the sentences, because two arithmetics ran over one slice. `fgPoolWords`
  is now the ONE place that turns held-and-spoken-for into words and both surfaces call it.
  The audit's cheaper option (delete the bar's figures) was **declined**: they are the one
  pool reading present in both views. **Zero diff over the ops.**
- **P1-2, nine units, nine shown.** Three of nine cats were absent from the picker (seven
  with a declaration standing) and five of nine from the battlefield, under "9 of 9 still
  standing". `.fg-sides` loses its bound at both areas; the bound moves **onto
  `.fg-field`** at 34vh. Headings, survivor reading and live resources are outside a
  scroller by construction. **0 of 9 clipped, both regions, both viewports, every state.**
- **P1-6, the commit follows what it commits.** Both round controls move to the FOOT of
  `#fight-input` as a `position:sticky; bottom:0` footer; Advance takes the one fill on the
  surface, Reset drops the danger colouring and keeps every word. This is the arrangement
  PROBE BO drove and found broken — the sticky is what makes it safe, and it holds the
  property four dials were bought for **including at 768, which D-31 recorded as
  unreachable**.
- **P1-7, feedback at the press.** The armed ROW is tinted in `--accent-2` (the channel the
  lit shapes use), the button relabels to "Choose a target", ONE instruction replaces the
  per-shape repetition and says the second press cancels, and `scrollIntoView` brings the
  lit set in — with `scroll-margin-top` from `--topbar-now`, because 'nearest' had been
  parking shapes at 0–91 behind a 161px sticky bar. **0 of 3 lit shapes clipped.**
- **P1-3, one dialog frame.** Both authoring dialogs become
  `grid-template-rows: auto minmax(0,1fr) auto` — fixed header, scrolling body, sticky
  footer. `#tok-picker` hid 428px/740px and `#act-edit` 49px/361px with Done off screen at
  both sizes; **both now hide 0 and Done is on screen at both.**
- **P1-4 / P2-10 / P1-5, the lane earns its height.** A card was 115px holding 667px with
  **zero** of twelve unit lines visible at 768. The note is printed once for the lane, a
  zero tally is no longer drawn (which is `[S06.11]`'s battlefield rule, so the two
  surfaces stop disagreeing), and the `@media(max-height:820px)` query is **deleted** — at
  22vh a card now shows **9 of 12**. One dashed placeholder card at round one.
- **P2-1, one left edge.** The h1 sat 182px out of alignment with everything under it and
  the product name was rendered twice. `.shell-head` takes the breakout; `.brd-brand` goes.
  Side effect: the bar stops wrapping at 1366, 161px → 109px.
- **P3-1 / P3-2, labels that tell the truth.** `×` → "Remove" (UX-02 held on the one
  control that deletes a student's work); `aria-pressed="false">Marked dead` → "Mark dead"
  when unpressed, written from the same reading as the class and the attribute.
- **P3-6** carried from Pass A: `.fg-row` gains a focus-within wash, weaker than declared
  and than the focus ring.

Gate — **no floor moved**: node **1253/0 exit 0**, **196 of 196**, stub-drift **135 shell
ids**, `DIALOG_FLOOR` **138**/172, `FIGHT_FLOOR` **132**/569 (was 592 — three per-card
notes and the zero-shield readings left, one armed-row line arrived), `PROPOSE_FLOOR`
**23**/62, browser checks **222/0 HEADLESS**.
**Seven harness rows turned in the open, every one asserting MORE than it did:** node 102
(the topbar clause was green over the contradiction for two plans), node 108 (PROBE BO's
head-line clause), node 96 and 102 (the placeholder card), browser 6b (it only ever
measured the BOX, and was green while a third of the rows were invisible), browser 18 and
18c (the fold clause and PROBE BO's order clause), browser 23c (it read Done only after
scrolling to the end — the one offset where a non-sticky footer is also visible).
**Two rendered defects the whole harness was green over, both found by looking at the
picture:** the lane caption took a grid CELL and displaced the lane, and it survived the
teardown onto the setup page's scan.
`.planning/phases/05-fight-loop-playtest/05-D33b-SUMMARY.md`.
**Pass C (05-D33c) — everything left of the audit: the P2 tier, the P3 tier and REF-03.**
Eight commits. The audit is now fully spent apart from the two findings it explicitly
refused to decide.

- **P2-11, the labelled empty box.** A shape at zero fight health read `Health` and
  nothing. The one line that STAYS at zero now SAYS its zero, in `[S06.12]`'s own count
  form (`0×` and one token) — the notation the lane, the picker and the editor already use.
- **P2-2 / P2-3 / P2-4, the bar.** The round-and-pool reading moves to the END of the
  cluster on its own line, so the **tools row is byte-identical before and during a fight
  at both sizes** (the bar goes 64 → 101 where it went 64 → 109/161, and nothing a hand
  travels to moves). It ships hidden, because it used to print "Round" over nothing. The
  five captions take `.eyebrow`'s SHAPE at **15px** — not its 12px, because [C10] and [C11]
  both say nothing at or below 14px may carry information. And `#fight-start` is a
  **lifecycle toggle** — "Start the fight" / "End the fight", never disabled — which
  **overturns a refusal the shell wrote down**; the refusal is quoted at the site and it was
  written about Start-against-RESET, while `endFight` is one commit and `resetFight`'s own
  D-17 answer covers it word for word.
- **P2-5 / P2-7 / P2-8 / P2-9, the dialogs.** One list component: both lists become a
  wrapping grid of ~200px cells, which also puts every tick within a cell of its own label
  with no CSS `order`. The term row's **270px void measures 8px** — `.ae-term-toks` drops
  flex-GROW only, and the shrink that actually keeps the amount on the line is untouched.
  A hairline between terms, the reading's tokens lifted 12 → 16px, `None` set apart. `Copy`
  joins the footer row, first and filled.
- **P3-5 / P3-7.** The glyph is scaled to the SILHOUETTE (`--tok-glyph` per shape) rather
  than to the square the shapes clip; and the symbolic readings drop it entirely — measured
  at **8.16px of emoji inside a 12px hexagon** before. P3-7 was read off the
  **accessibility tree** and the audit had named the wrong control: `visibility:hidden`
  removes a node from an accessible name, so five of six ticks were already correct, and
  the one that was not is `.dc-check`'s `opacity:0` — an unpressed dead marker was named
  "Mark dead ✓" while its own `aria-pressed` said false.
- **P2-12, the panel.** The offset was ARITHMETIC: `--topbar-now` is the bar's HEIGHT,
  which is its bottom edge only once it has stuck, and a fixed box is placed against the
  viewport whether it has or not. `[S08]` publishes `--topbar-foot` (passive scroll,
  rAF-coalesced, written only when it moves). The panel gains a sticky header with its own
  name and a text-labelled **Close**, and it **pushes the fight band** rather than sitting
  on it. Measured: it covered Share, Reset, `.ld-now`, the Mechs column and — scrolled —
  "Reset this fight"; it now **covers NOTHING**, at both viewports at two scroll offsets.
  A scrim was refused with its reasoning: PROJ-05 asks for the page behind it to stay
  readable.
- **P3-8 / REF-03 — deferred item 4 is CLOSED**, by its own third candidate. The six
  per-action cards are built into D-28's sidebar while a fight runs and removed at rest,
  through the same `refCard()` the columns use. Twelve on the board: six in the columns for
  the build view, six in the panel, **the same six actions compared by name**, none in the
  band, and none on screen twice. The toggle and the header both read "Projection and
  reference".
- **P3-9's four bullets are ANSWERED WITH MEASUREMENTS at their sites and not
  implemented** — the fractional middle track (320 is the projection's 24px headline on one
  line; the first setting that buys a column anything breaks it in two), subgrid row
  pairing (reproduced: 54px of drift; refused, because 9 and 3 independent rosters cannot
  be paired), the two share textareas (measured IDENTICAL — the audit's "different border"
  is a focus ring), and the reserved switch slot (the toggle is last, so nothing moves).

Gate — **no floor moved**: node **1253/0 exit 0**, **196 of 196**, stub-drift **135 shell
ids**, `DIALOG_FLOOR` **138**/172, `FIGHT_FLOOR` **132**/586, `PROPOSE_FLOOR` **23**/62,
`#app` 131, browser checks **230/0 HEADLESS** (+cells 10f and 23e).
**Six harness rows turned in the open:** node 106e (its zero clause ASSERTED the labelled
empty box), node 93 (a seventh act, and the lifecycle control read both ways by name),
node 95 and 104f (they required exactly ONE disabled control outside the grid and now
require none — the never-disable rule arriving whole), node 57 (`.style` went 1 → 2 and
every occurrence is now read IN CONTEXT), and **node 101, which reddened exactly as it was
designed to** — it asserted REF-03's defect in the direction it was true so that the day
somebody moved the cards it would go red, and D-33 P3-8 moved them.
**Two shipped rules were found to have NEVER APPLIED**, both invisible to both gates:
`.ae-list`'s whole rule (a stray comment terminator from D-32 dropped it — the audit
measured the symptom and wrote it up as a design choice), and the two dialog BODIES' scroll
cue (Pass B moved the scroll onto boxes that did not exist when Pass A wrote the list, and
Chrome drew its light default: a white bar down a dark dialog). New browser cell 23e reads
a rule's own DECLARATIONS off computed style, because that is the only thing that finds
this class of defect.
`.planning/phases/05-fight-loop-playtest/05-D33c-SUMMARY.md`.
Next: **nothing autonomous is left in the phase.** 05-11's playtest is the gate, and its
register is now **1–57**: section K holds P2-6 (symbols in the proposal pane, which extends
D-29's own scope) and P3-4 (one removal mark per term group rather than per glyph, which
touches D-30's own spec) — the two findings D-33's audit refused to implement without the
developer.
Last activity: 2026-08-30

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**

- Total plans completed: 10
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2 | - | - |
| 03.1 | 8 | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 03.1 P01 | 78 | 3 tasks | 2 files |
| Phase 03.1 P02 | 62min | 3 tasks | 1 files |
| Phase 03.1 P03 | 95min | 3 tasks | 1 files |
| Phase 03.1 P04 | 105min | 3 tasks | 2 files |
| Phase 03.1 P05 | 118min | 3 tasks | 2 files |
| Phase 03.1 P06 | 132min | 3 tasks | 2 files |
| Phase 03.1 P07 | 148min | 3 tasks | 2 files |
| Phase 03.1 P08 | 25min | 2 tasks | 1 files |
| Phase 04 P01 | 95min | 3 tasks tasks | 2 files files |
| Phase 04 P02 | 70min | 3 tasks | 2 files |
| Phase 04-share-reset P03 | 95min | 3 tasks | 2 files |
| Phase 04-share-reset P04 | 105min | 3 tasks | 2 files |
| Phase 04 P05 | 95min | 2 tasks | 2 files |
| Phase 04 P06 | 80min | 3 tasks | 2 files |
| Phase 04 P07 | 105min | 3 tasks tasks | 2 files files |
| Phase 04 P08 | 35min | 2 tasks tasks | 0 files files |
| Phase 05 P01 | 95min | 2 tasks tasks | 1 file files |
| Phase 05 P02 | 105min | 3 tasks | 2 files |
| Phase 05 P03 | 95min | 3 tasks | 2 files |
| Phase 05 P04 | 150min | 3 tasks tasks | 2 files files |
| Phase 05 P05 | 135min | 2 tasks | 2 files |
| Phase 05 P06 | 95min | 2 tasks | 2 files |
| Phase 05 P07 | 115min | 2 tasks | 2 files |
| Phase 05 P08 | 150min | 2 tasks | 3 files |
| Phase 05 P09 | 110min | 2 tasks | 3 files |
| Phase 05 P10 | 125min | 2 tasks tasks | 3 files files |
| Phase 05 P12 | 105min | 2 tasks tasks | 2 files files |
| Phase 05 P13 | 82 | 2 tasks | 2 files |
| Phase 05 P14 | 191min | 3 tasks | 2 files |
| Phase 05 P15 | 168min | 2 tasks | 2 files |
| Phase 05 P16 | 214min | 3 tasks tasks | 5 files files |
| Phase 05 D28 | 195min | 6 tasks | 6 files |
| Phase 05 D29 | 210min | 8 tasks | 6 files |
| Phase 05 D32a | 240min | 7 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Five converged Phase-1 architecture decisions are treated as near-binding — single `commit()` mutation funnel, integers-only JSON-clonable state split into `build`/`fight`/`ui`, two-tier render, snapshot undo, `alive` as a flag separate from `hp`.
- [Roadmap]: Two ordering rules honored — steppers ship in the same phase as roster add/remove (Phase 2); serialization comes after roster editing settles the build shape (Phase 4).
- [Roadmap]: PROJ-05, REF-03 and SHARE-07 pulled into Phase 5 because their observable behaviour requires the fight view to exist.
- [Roadmap]: FIGHT-11 is a scheduled playtest activity (plan 05-03), gating Phase 5 — not a code-review item.
- [D-28]: The fight tab takes the whole width; earlier rounds are a full-width HORIZONTAL lane above the round being played, scrolled to its end so the newest is what you see; the projection is off by default in the fight view and comes back as a fixed sidebar on one press of `#proj-toggle`. The sidebar IS `#strip` — the same node moved out of flow, never a second panel carrying a copy — which is what keeps PROJ-05 about THE reading rather than about a surface that agrees with it.
- [D-28, orchestrator]: the lane is horizontal because a full-width vertical stack pushes the round being played off the bottom, the defect class this phase has fixed three times; and the ledger moved in the MARKUP rather than with a CSS `order`, because an order property puts the sequence a screen reader walks out of step with the sequence the room sees while every DOM-order check stays green.
- [D-29]: The fight surface reads in SYMBOLS with the prose on hover. The ledger lane's board states, deltas and resolution readings, and every cost and requirement on the picker, draw the token type's OWN shape, colour and glyph through the shipped `styleFor` / `labelFor` / `makeToken` / `syncRow` — called, never re-derived — so a student-authored type appears there exactly as they authored it and compaction is `COMPACT_AT` and nothing else. A cost is `−` plus the token. Sentences stay only where a symbol cannot carry the meaning.
- [D-33 Pass B]: The two figures for one pool are ONE FUNCTION, not two arithmetics over one slice — `fgPoolWords` is the only place held-and-spoken-for becomes words and both the topbar and the state card call it. The audit's cheaper option, deleting the bar's figures, was declined because those spans are the one pool reading present in BOTH views; making them live keeps the property and fixes the defect in one move. Nothing about what Advance DOES moved.
- [D-33 Pass B]: A STICKY FOOTER replaces four generations of viewport dial. Advance sits at the foot of the area whose rows it commits and cannot leave the window while any of them is in it — at every viewport, on every roster, at every setting of every number in the file, including the 768 case D-31 measured as unreachable and wrote down as unreachable. That is what paid for the picker's height bound coming off, and the two changes do not make sense apart.
- [D-33 Pass C]: A CSS RULE THAT NEVER APPLIES IS INVISIBLE TO BOTH GATES. `.ae-list`'s whole rule — its display, its 610px cap, its 236px bound, its scroll — had been dropped by the CSS parser since D-32, because a stray comment terminator left five lines running as bare text. The node gate has no layout engine so it cannot see a dropped rule at all; the browser cells read OUTCOMES rather than declarations; and the D-33 audit measured the symptom (rows "971px carrying one word and nothing else") and wrote it up as a design choice. New browser cell 23e reads a rule's four declarations off computed style, which is the only shape of check that finds this.
- [D-33 Pass C]: A POSITION:FIXED OVERLAY IS PLACED AGAINST THE VIEWPORT, so it needs its anchor's LIVE EDGE and not its height. `--topbar-now` is the bar's height, which is its bottom edge only once the bar has stuck — so D-28's sidebar sat 99px over the control bar at page scroll zero at both viewports, and every gate was green over it. `--topbar-foot` is published beside it, on a passive rAF-coalesced scroll listener that writes only when the rounded value moves. Two properties, each answering exactly one question.
- [D-33 Pass C]: AN ACCESSIBLE NAME IS READ OFF THE TREE, NEVER REASONED ABOUT. The audit reported the hidden tick left in every action button's accessible name; driven in real Chrome, an undeclared button is named "Slash Removes: 1 Action points" — `visibility:hidden` removes a node from an accessible name and five of the file's six ticks use it. The one that really had the defect is the dead marker's, which used `opacity:0` and was named "Mark dead ✓" while its own `aria-pressed` said false. The audit named the wrong control and the measurement found the right one.
- [D-33 Pass C]: A ROW THAT ASSERTS A DEFECT IN THE DIRECTION IT IS TRUE WORKS. Row 101 was written by plan 05-16 to redden the day somebody moved the reference cards, precisely because that plan could not move them. D-33 P3-8 moved them and it went red, and whoever read the failure read the paragraph — which is the whole design. It now asserts the arrangement that replaced the defect.
- [D-33 Pass B]: A BOUNDED REGION'S CHECKS MUST READ WHAT IS INSIDE THE BOX. Browser cell 6b measured the picker's box at every viewport for three plans and was green while three of nine cats were invisible inside it. It now walks each row's ancestors and compares boxes. The same lesson in CSS: a new child of `#ledger` takes a GRID CELL, and the whole harness — 1253/0, 196/196, 222/0 at both viewports — was green over a lane displaced into the reading column, because nothing in it reads which cell a box lands in.
- [D-32]: All three term lists cap at FOUR, and a multi-token cost SPENDS WHAT IT NAMES. A pool is action points or a type a student keeps at SIDE scope — D-24's rule as arithmetic. Health and shield are deliberately NOT pools: they live on units, and spending them would mean the tool choosing which unit pays, which is adjudication. A cost naming one is drawn, reported, disables nothing and spends nothing.
- [D-32, orchestrator]: `actionApCost` keeps its meaning by being SPLIT rather than widened — `actionCostTerms` reads the whole cost, `actionApCost` projects the action-point half over it — and `costIsApOnly` in `actionModelled` is what stops a partly-priced cost from being afforded as often as a plain one-point action and overstating the projection in silence.
- [D-32, verified]: the build code stayed at **v1** because the grammar was already count-driven at every level. A code carrying four terms pasted into a copy of the file from before D-32 parses and is then refused AT THE CAP, by name — the codec working across a version skew, noted rather than fixed.
- [D-29, orchestrator]: The tooltip is written to `title` AND `aria-label` from one variable on a `role="img"` node, so nothing is conveyed by hover alone and UX-02 is answered rather than waived — its nine "never a title= tooltip" paragraphs were about a CONTROL'S LABEL and not one control grew one. And the words are still SCANNED: `data-tsay` is a fourth exemption channel that SUBTRACTS the student's fragment from those two attributes instead of skipping them, because a tooltip cannot be split across nodes and skipping it would take the artifact's own sentences out of the only layer that can see them.
- [D-30]: The `−` that marks a resource being removed is a RED MARK ON THE SHAPE — its centre on the symbol's left edge, a quarter of the way down its height — and not a dash beside it. It appears wherever a REMOVAL is rendered, which is the picker's costs and the lane's split facts; a requirement line and a hand-ruling delta carry none, because a requirement subtracts nothing and a delta draws both ends.
- [D-30, orchestrator]: The mark is parented to `.tok` and not to the reading, because a CSS percentage means nothing until you say what it is a percentage of — anchored to the reading it lands on the left edge of `12×` in the compact form. The red is `color-mix(in hsl, var(--accent-2), var(--coral))`: the two shipped warm tokens sit either side of red at ~334° and ~17°, so an sRGB average lands on a salmon between them and a POLAR mix walks the short arc through 360° onto red — no new hex, which is now checked by row 107f rather than merely stated. And the removal is said in WORDS on the accessible name (`SYM_TAKEN`), because colour plus position is two visual channels and `role="img"` prunes both.
- [D-31]: The round being played is TWO regions — round state (the round number, both survivor readings, both battlefields, both teams' resources) above action input (the picker rows, both reading boxes, and Advance and Reset). Each is a bordered panel with its own heading, because the word was *separate* and a wider gap is not a separation. Cats left and Mechs right inside BOTH. The spoken-for preview stays with the resources and still moves live on a press in the input panel.
- [D-31, orchestrator]: The split is two `<section>`s in the MARKUP for D-28's reason, and PROBE BQ proved the reason still bites — one `.fg-area--input{order:-1}` lifts the picker above the state on screen with the whole node gate at 192 of 192, exit 0. Advance travels with the input, which costs the fold at 1366x768: with the state panel's window at ZERO the control still lands at 777 on a 768px screen, so no dial reaches it. The fold claim was TURNED at that size rather than tuned around, and replaced at both sizes by the property it stood in for — Advance is on screen with the rows it commits, and above them. The one-line clamp that buys the fold back costs a 58px state panel and is written at the dial for the rehearsal to choose.
- [Research]: Sharing is a compact build code, not a `file://` URL (leaks the student's home directory path, useless to recipients, not linkified by Discord).
- [Phase 03.1]: Dialog strings feed the same PROJ-06 word list and the same check 48 as #app; DIALOG_ROOTS is gated in both directions against the stub page — A second word list is a second thing to keep in step; a dialog that escapes the harvest must fail the run rather than pass silently
- [Phase 03.1]: MAX_ALLOC's literal moved from [S05] to [S01] so MIN_XF_DELTA and MAX_XF_DELTA derive from it once; [S05] still exports it — [S01] runs before [S05], so deriving the signed bound in App.data required the magnitude to live there; re-typing 99 was the one thing the plan forbade
- [Phase 03.1]: cost, req and xf are arrays of records carrying tok as a FIELD, never objects keyed by token id — A keyed bag re-opens the key position requireTokenId exists to close, and Object.create(null) does not survive the JSON round trip
- [Phase 3.1]: DAMAGE_KEYS ships health-only: a bounded shield pool read as unbounded throughput would overstate, the one direction PROJ-06 forbids
- [Phase 3.1]: turnsToWipe reads ONE bestPair call, so the hit and the per-turn always describe the same swing
- [Phase 3.1]: CONTEXT D-14a corrected by measurement: the shipped board does not move under either shield reading, because no shipped action carries a shield transformation
- [Phase ?]: 03.1-03: a shipped action can be renamed and re-costed but not removed — the reference band names the six by id
- [Phase ?]: 03.1-03: renameAction is a plain commit; createAction and removeAction are structural
- [Phase ?]: 03.1-03: guard placement inside a commit is caught by refusal ORDER, never by undo depth — commit() runs its mutator before it records
- [Phase 3.1]: 03.1-04: the cards, the band, the admission line and the picker line all read the BUILD SLICE through one exemption channel (data-anm) — an id means the shared sync pass owns the text, an empty value means the region that built the node does
- [Phase 3.1]: 03.1-04: ACT-07's line beside Remove stays silent for a type the board is built on — a consequence stated for a removal the surface does not offer is noise
- [Phase 3.1]: 03.1-04: a build-once rule is held by NODE COUNT, not by the built flag — probe M measured the flag vacuous for a per-node create/destroy
- [Phase 3.1]: 03.1-05: ONE dialog with two panes, not two — one button, one binder, one root, one fingerprint, and 20 shell ids rather than near forty
- [Phase 3.1]: 03.1-05: no second fire() payload-key exception was needed — the editor's own delegated listener builds each patch field by field from the pressed control
- [Phase 3.1]: 03.1-05: the editor fingerprint carries cost/req/xf BEFORE plan 03.1-06 draws them, so the surface cannot be born stale
- [Phase 3.1]: 03.1-05: DIALOG_FLOOR 84 -> 91 — a floor over the total of two roots, left at 84, would have stopped bounding either of them
- [Phase 03.1]: int() alone bounds a signed transformation amount — requireDelta applies no bound, and int() compares rather than coerces, so a signed floor needs no new machinery
- [Phase 03.1]: Emptying a term slot is a write with nothing in it (CLEAR_TERM) through the same op, so the slot bound lives in one place rather than two
- [Phase 03.1]: The slot index is part of the commit label: a key held in one amount field is one Ctrl+Z step, and two slots stay two
- [Phase 03.1]: The empty slot is the affordance — the action editor carries no Add control anywhere, and the emptying entry at the head of a chooser is the one named path for removing a term
- [Phase ?]: 03.1-07: the proposal is a FORM on the dialog, never a slice — there is then no state in which a proposal exists and has not been accepted, so undo, the build code and the projection can never read one
- [Phase ?]: 03.1-07: ACT-05 is half-delivered on purpose (D-05b) — confirm writes on Advance in Phase 5, and the absence of an applier is asserted by two numbered checks rather than left as an intention
- [Phase ?]: 03.1-07: every assembled proposal line is built one node per fragment, so Layer C reads the artifact's words and skips the student's inside a single sentence
- [Phase 3.1]: Decision 14 CONFIRMED by the developer at the 03.1-08 rehearsal — DAMAGE_KEYS stays health-only; a shield strip is named in the admission line rather than counted, because counting a bounded pool as unbounded throughput reads about 5 turns where the board delivers about 9
- [Phase 3.1]: Decision 15 CONFIRMED by the developer at the 03.1-08 rehearsal — the proposal pane applies nothing; a declared action lands on Advance in Phase 5, and PROJECT.md's Out of Scope entry stands unchanged
- [Phase 3.1]: The 03.1-08 rehearsal closed on a one-word blanket approval, so item 5's tone judgement and item 10's close-request behaviour are approvals of a description rather than recorded prose — named as the record's two weakest lines rather than fabricated
- [Phase 04]: CODE_ALPHABET is an allowlist regular expression, never a blocklist — a blocklist reads green about every character nobody thought of
- [Phase 04]: the comma is excluded from the build-code alphabet by construction because App.hasFlag splits location.hash on it; this is the binding alphabet constraint of Phase 4 and is in no other project document
- [Phase 04]: no MAX_* cap moves for build-code budget reasons — the measured cost centres are the tally stream and the name lengths, not the dials
- [Phase 04]: a round-trip assertion over a symmetric writer/reader pair proves only that the two halves agree; the byte shape and the measured cost are asserted separately
- [Phase ?]: 04-02: encode refuses a build whose side id, side name, unit label or record schema does not match what it reconstructs — a future rename-unit or rename-faction op becomes a refusal rather than silent data loss
- [Phase ?]: 04-02: the three [S05] bounds the decoder re-types are exported as WIRE_BOUNDS and held to App.ops by suite rows, because [S04] may not reach upward across a dependency arrow
- [Phase ?]: 04-02: the round trip is asserted over a stable writing of the record, since a tally bag's key order is the order a student set them in and carries no meaning
- [Phase ?]: 04-02: no round trip over a DRIVEN board can see a derived-versus-enumerated ordinal order, so three rows hand encode a vocabulary written down in another order and require the identical code
- [Phase ?]: 04-03: the matrix is seventeen tamper shapes of which TWELVE are content rows, not the eleven the plan says in three places — research's own table lists twelve and a suite row now pins the figure
- [Phase ?]: 04-03: two rows of the bad-input table ADMIT the code — decode trims, so a good code with a trailing newline is a good code, and demanding a refusal there would be demanding a defect
- [Phase ?]: 04-03: the reconstruction tripwire compares what came BACK against what went IN, never against the reconstruction — probe K proved the second comparison is a tautology that stayed green over the exact data loss it exists to catch
- [Phase ?]: 04-03: [S04.3]'s unbag refuses rather than dereferencing tokens[id] on a function invariant — probe J broke the lockstep by one line and threw a TypeError out of a function whose banner says it never throws
- [Phase ?]: 04-04: D-20 implemented as commitInitial, a SECOND named writer in [S03] guarded to refuse unless nothing has been committed and the stack is empty; probe N proved the guard
- [Phase ?]: 04-04: the hash mirror reads App.state at ONE deferred call site; [S04]'s banner claim 3 names the exception rather than letting it happen quietly
- [Phase ?]: 04-04: an unencodable build DROPS the hash token rather than leaving a stale code a reload would load back
- [Phase ?]: 04-05: two dialogs — D-21's share+load stays one dialog with two panes; the reset confirmation takes its own root because it is a different act with a different opener
- [Phase ?]: 04-05: the share code field is rewritten even while focused and its selection re-applied; the paste field is never written — opposite answers to D-19 on one surface
- [Phase ?]: 04-05: [S06.6] fingerprints the whole build slice (0.030 ms) rather than the produced code (0.483 ms) — the cheap one's failure mode is a wasted encode, the narrow one's is a stale code in a message
- [Phase ?]: 04-06: the copy press asks [S06.6] for a repaint rather than calling encode a second time — one producer, so the string reaching the clipboard is the string on screen
- [Phase ?]: 04-06: tiers 1 and 2 say the same sentence; which tier fired is recorded on data-sh-tier, where a check and a rehearsal can read it and no student has to
- [Phase ?]: 04-06: no cancel listener on #reset-ask — it has no field, Escape there means Cancel, and a no-op listener bound for symmetry would be dead code inside the error boundary
- [Phase ?]: 05-01: a word goes in the HIGHEST verdict layer whose measured hit count over cats-vs-mechs.html is zero — Layer A, then B, then the new Layer-C-only list
- [Phase ?]: 05-01: beat/beats/beaten is closed by READ-SITE scope (#refband), never by stem or text allowlist, so the shipped 'Fly beats Slash' survives
- [Phase ?]: 05-01: FIGHT_FLOOR is set AT the roster-independent part of the measurement (41 of 101), not below the total — 05-07/05-08/05-09 own the re-measure
- [Phase ?]: 05-01: the eight clean-but-unshippable words are harness limitation 18 and 05-11's item 31, not a silent widening
- [Phase ?]: 05-02: fight.turn retired and fight.log folded into past — the round loop is simultaneous, and did+hand is the record
- [Phase ?]: 05-02: D-24 widened — a student-made tally crosses into the fight at BOTH scopes, mirroring the build, because a unit-scoped type would otherwise have nowhere in the fight slice to live
- [Phase ?]: 05-02: setUnitHp's clamp stays MAX_ALLOC — whether a heal may overshoot is a ruling, and rulings belong to the table
- [Phase ?]: 05-02: check 73c is NOT widened to reach the fight slice; the reach is added inside [S09.12] instead, because widening 73c costs the guarantee it exists for
- [Phase ?]: 05-02: probes E and F measured that EVERY state-shape rule in the repo reads a null fight slice — a row that cannot fail is a row asserting nothing
- [Phase ?]: 05-03: the split returns three numbers and refuses above the arithmetic — three zeroes rather than null, so the shape every caller reads survives a hit that did not happen
- [Phase ?]: 05-03: a declared cost exceeding the pool is reported and never prevented (D-23) — asserted at zero action points, and probe J fails the plan if the row goes vacuous
- [Phase ?]: 05-03: the declaration lives in state.fight.decl spelled { side, act, by, at } — the proposal's DOM-only argument does not transfer, because a declaration is an intent that has not resolved BY DESIGN
- [Phase ?]: 05-03: termDamage is now THE one reading of a term against DAMAGE_KEYS; actionDamage and actionModelled both read it, and the projection's shipped 1 and 3 verified the extraction moved nothing
- [Phase ?]: 05-03: probe I proved a suite row standing in for an op that does not exist yet goes on agreeing with its author once the op ships — the key-name row now drives declareAction, and the same repair is owed to the round record when advanceRound lands
- [Phase ?]: 05-05: a by-hand ruling is stored as an EVENT IN THE ROUND ({side,unit,tok,from,to} on fight.hand, carried into past by Advance), never as a flag on the value — it clears check 73c's key-name ban naturally, makes FIGHT-07's marker derivable at render time, and IS FIGHT-08's log alongside did[]
- [Phase ?]: 05-05: the router arms 'hp' and 'alive' renamed to setUnitHp and setAlive (the decision plan 05-04 handed forward) — they were one-key names shaped like FIELD_OPS keys that were never in FIELD_OPS, so no control could reach them; no aliases kept
- [Phase ?]: 05-05: no nudgeFightShield — plan 05-09 draws no shield pair and 05-10's control table lists four ops, so the asymmetry is written into the artifact rather than left as an omission
- [Phase ?]: 05-06: the fight surface is IN THE PAGE and not a dialog — the trade buys the whole surface sitting inside #app, so the fight-mode Layer C harvest reads it without a root of its own
- [Phase ?]: 05-06: the topbar reservation is SPENT — two groups, one of them a readout carrying no act; SHARE-07's fight reset lives in the surface, not as a second meaning on the start control
- [Phase ?]: 05-06: the ledger is a sibling of #board with no data-k and no data-act on its rows, newest nearest the board by document order alone, bounded and scrolling on itself
- [Phase ?]: 05-07: the declaration slots are NOT static markup — not one node in [S06.7] is a field, so the static-row rule's hazard cannot arise; the focus contract is kept by withPreservedFocus scoped to #fightbar instead
- [Phase ?]: 05-07: [S05]'s open commitStructural question answered NO and the paragraph amended in place — structure() rebuilds only #board's columns and #fightbar is its sibling
- [Phase ?]: 05-07: the cost report reads the FIGHT pool through a render-time shim, because a report against the build pool is right on round one and wrong on every round after it
- [Phase ?]: 05-07: the two sides are bounded at 34vh and scroll on themselves — unbounded, measured in a real browser, the region put the live board's top at 1034 of a 1080px screen
- [Phase ?]: 05-08: the ledger row is the compact text design (66 nodes, against a 300-node full clone and 67-node token squares) and READABILITY decided it, not cost
- [Phase ?]: 05-08: the ledger grows by DELTA only, front-trimmed against the oldest surviving record's round number — a row-count exit freezes it at MAX_PAST_ROUNDS
- [Phase ?]: 05-08: FIGHT-15's reading is derived at render time and stored nowhere; probe Z's gap is closed by three [S09.12] rows asserting the fight slice's shape after a round has resolved
- [Phase ?]: 05-08: check 92's fight harvest now PLAYS a round; FIGHT_FLOOR 83 -> 108, per-card 11 -> 14, SUITE_FLOOR 1155 -> 1158
- [Phase ?]: 05-09: PROJ-05 reconciled rather than chosen — [S06.3] keeps reading state.build, the fight's own figures sit beside it labelled, and turnsToWipe's third argument is finally used. First PROJ-05 question at 05-11; one comment collapses it either way
- [Phase ?]: 05-09: the viewport budget is not a dial question — no setting of the three dials clears a 768px screen, and laying #fightbar and #ledger side by side is measured at 844 @1080 and 788 @768. Handed to the checkpoint with numbers (REHEARSAL B3)
- [Phase ?]: 05-09: death is drawn from the stored flag and never inferred; the alive toggle is a sibling of everything the marking hides; the by-hand marker is derived from the round's ruling list with nothing stored on a unit
- [Phase ?]: 05-09: a sticky element taller than its space stops pinning — measured -203 at 1366x768 — so PROJ-05's live reading is bounded at 24vh and FIGHT-10's line moved to the faction heads
- [Phase 05]: 05-10 — [S07.5] pushes NOTHING into UI_ACTS — every fight control carries a private data-fg or data-dc, and the one carrying a data-act carries the name of a real op
- [Phase 05]: 05-10 — HOLD_ACTS untouched — an Advance is never held, and nudgeFightHp has no control on the page to hold
- [Phase 05]: 05-10 — the board's health row draws the BUILD allocation during a fight, not the fight's live health (FIGHT-10's division), now asserted so a later plan reddens rather than shipping a second answer
- [Phase 05-12]: D-27's fight tab is a page-level VIEW driven by one attribute on #app and an attribute selector in [C15] — never the hidden property, because an author display beats the user agent's [hidden]{display:none}.
- [Phase 05-12]: #strip and #refband stay outside BOTH sides of the switch because #board stands in both views. PROJ-05 and REF-03 are kept structurally rather than by a rule, and check 103b reads it off the DOM and off the markup.
- [Phase 05-12]: A view is not state: the switch carries data-vw and no data-act, writes no slice, and check 103 requires the whole state byte-identical across both presses. Probe AJ drives the violation and the row reddens.
- [Phase 05-12]: The view follows a fight across its two edges and across nothing between them, via a derived page-side flag — so a student who switches to the board mid-fight is not thrown back, and an undo of startFight moves the view for free.
- [Phase 05-12]: No height dial was turned by plan 05-12. The viewport budget is dissolved structurally; [C14]'s 736px basis, [C14.1]'s 34vh and .ld-list's 46vh are all left for 05-14 and 05-15 to re-measure.
- [Phase 05-13]: apSpent is AMENDED not retired: it keeps two live readers in [S06.7]/[S06.9] and answers a different question (a mid-fight build edit) than spokenFor does
- [Phase 05-13]: The default target is a DERIVATION and never an op behaviour: declareAction stores exactly what it is handed, so a defaulted declaration is byte-identical to a hand-picked one
- [Phase 05-13]: One performer holds one action because the RECORD says so: declareAction replaces in place, a null performer always appends, and the MAX_DECLARATIONS refusal sits on the append path only
- [Phase 05-13]: The commit label carries the PERFORMER rather than the slot index, so a declare-then-retarget costs one Ctrl+Z and two units in a burst still cost two
- [Phase 05]: 05-14: D-27's grid replaces the declaration form: the unit is a LABEL, one button per action, one press declares / undoes / replaces. Whether the unit should be pressable is a playtest question.
- [Phase 05]: 05-14: the fight grid's disable is a RENDER decision under exactly three conditions; D-23 and check 95's never-disable walk are both turned in the open — red recorded verbatim, rewritten to the new contract in both directions, green recorded. The rule remains in force on the build and proposal surfaces.
- [Phase 05]: 05-14: the change-target flow narrows 03.1-07 to the opposing side behind fgMayPoint — one line, widened by one line, with the heal-shaped case named at the site. declareAction and unitAnywhere are untouched.
- [Phase 05]: 05-14: [C14.1]'s .fg-sides went 34vh to 26vh, because D-27's round line pushed the Advance control to 814 of a 768px viewport. [C14]'s 736px basis still holds and its re-measure is handed to plan 05-15.
- [Phase 05]: 05-15: the unit shape IS the control — the addendum makes the battlefield the click surface for the change-target flow, so the thing a student aims at is the thing they press. Costs 12 Tab stops; recorded as a playtest question
- [Phase 05]: 05-15: the lit state is an outline plus a real text node, never aria-pressed — a lit unit is available rather than pressed, and content is what a screen reader and the rendered-page walk both reach
- [Phase 05]: 05-15: .fg-side flex basis 340 -> 320. The two declaration columns were STACKED at every viewport in both browsers on the SHIPPED artifact — the 736px derivation never subtracted .fg-sides' own padding or its scrollbar gutter. flex-grow fills, so the columns render at 332px and the dial costs nothing
- [Phase ?]: FIGHT_FLOOR 120 -> 116 and the per-card cost is now a figure PER SIDE (29 a cat, 30 a mech) — D-27 moved strings out of the roster-independent constant and into the coefficient; the one string of difference is the lit retarget
- [Phase 05]: Check 92 asserts its own dressing: probe AS measured the old drive spotlessly green (1216/0, 180 of 180, exit 0) on a board where nothing was declared, ruled, lit or authored
- [Phase 05]: REF-03 is half unserved on the fight tab — the six per-action reference cards sit inside the roster columns the fight view hides. Row 101 asserts the defect in the direction it is TRUE; deferred-items item 4
- [Phase 05]: The spoken-for reading is printed VERBATIM, never asserted against a string: probe AU measured hard-coding it invisible today, red on a two-press board, and silently no longer asserting the UNDO

### Pending Todos

None yet.

### Blockers/Concerns

- **The no-verdict constraint (PROJ-06) is the most likely accidental scope violation in the project.** Every phase that touches the projection carries an explicit no-verdict success criterion. Watch for it re-entering as a colour, a bar, or a word.
- **Single file, parallel plans.** All code lands in one HTML file. Plans inside a phase must own disjoint named sections (`data / model / state / serialize / ops / render / interactions / boot / selftest`) or run sequentially.
- **Phase 4 needs a cross-browser test matrix**, not a smoke test — clipboard, encoding and hash failures are all silent.
- 04-04 probe Q reddened nothing: a boot load landing before the first paint is held by a comment alone. A flash is only visible to a person — rehearsal item for plan 04-08, harness limitations entry 15
- 04-08: the clipboard matrix carries NO transcribed per-cell tier reading. Tiers 1 and 2 of the copy press have never executed anywhere in this repo (limitations entry 16), so the one-word approval is the only evidence they work. Re-ask for the DevTools-focused and window-backgrounded cells first — that is where Chrome's user-gesture rule is most likely to reject writeText and where the untested fall-through actually runs.
- 05-07 finding for 05-11: the spent reading measures zero at every observable moment because advanceRound refills both pools in the same commit that spends them. Two admissible fixes are written into the file; the choice is the developer's
- 05-08: with a fight running and one round resolved, #board's top sits at 1183px of a 1080px screen. Three dials are one budget (.fg-sides 34vh, .ld-list 34vh, .ld-now-body 20vh). REHEARSAL.md B3, plan 05-11
- REF-03 is only HALF served on the fight tab: the six per-action reference cards are inside the roster columns, which the fight view hides. Measured by row 101, the first row in the repo to read them WITH A VIEW. deferred-items item 4 carries the mechanism and THREE candidate fixes now — D-28's toggled sidebar is the third and the only one that costs no height dial in either view; the developer settles it at 05-11 item 29.
- 05-D28: at 1366x768 the picker grid's box ends 92px below the fold with three rounds in the lane. It BEGINS on screen and one page scroll brings the whole of it in, and every setting of `.fg-sides` overshoots at that height including the 26vh that shipped before. Browser check 6b's claim was turned to match; REHEARSAL.md B3 and 05-11 item 47 carry the room question.
- 05-D28: FIGHT-10's notice (`#fight-said`) now sits BELOW the two round controls rather than above them, because the controls moved onto the round's own line to keep Advance above the fold. Plan 05-14's stated reason for the old order was that the moment a student most needs to have read it is the moment before they press Advance. 05-11 item 49.

- 05-D29: at 1366x768 a lane card is a **115px window over 1174px of content**, so not one symbolic reading in it is reachable by a mouse without scrolling the card — which puts the tooltip D-29 asked for two interactions away rather than one. It is D-28's 22vh bound rather than D-29's notation, measured here for the first time because until D-29 nothing had reason to ask whether a specific reading could be POINTED AT. `deferred-items.md` item 6; 05-11 items 17 and 50.
- 05-D29: the BATTLEFIELD still names its token types in text (`Health ●●●`) while the lane beside it does not (`●●●`, with the word on the hover). Left standing deliberately: it is the last place on the fight tab where a type is named in text at all, and 05-11 item 50 asks whether a room can read a square as health without ever being told. `deferred-items.md` item 7.

- 05-D30: NOTHING IN THIS REPOSITORY HAD EVER CHECKED THE NO-NEW-HEX RULE. PROBE BM replaced D-30's `color-mix` with the byte-identical literal `#ff6d78` and the whole node gate ran 1216/0, 189 of 189, exit 0 — as did both browser cells that read the mark's POSITION, because a typed colour is pixel-identical to a derived one. One cell caught it, and only where Playwright is installed. Row 107f now scans `[C14]` to the close of the `<style>` block as DECLARATIONS; `[C00]` through `[C13]` — three quarters of the stylesheet — is still unscanned. `deferred-items.md` item 8.
- 05-D31: at 1366x768 the ADVANCE CONTROL OPENS BELOW THE FOLD and no setting of the state panel's window reaches it — swept 12vh to 32vh, and with a 92px window the control reads 869, so the chrome alone is 777px on a 768px screen. Browser cell 18 keeps the old claim unweakened at 1920x1080 (1057 of 1080) and asserts at 768 that the control is real, enabled and within one page scroll; cell 18c is new and asserts at both sizes that Advance is on screen with the picker rows AND above them. `deferred-items.md` item 9; 05-11 items 54 and 55.
- 05-D31: THE FIRST DRAFT OF ROW 108 WAS GREEN OVER TWO DEFECTS AND BOTH PROBES ARE RECORDED. PROBE BO moved the two round controls to the FOOT of the input area — Advance at 1408 of a 1080 viewport — and the gate ran 192 of 192, exit 0, because the row counted them anywhere inside the area; cell 18c was green too, because both were on screen in the wrong order. PROBE BQ added `.fg-area--input{order:-1}` and the gate ran 192 of 192 again, because the row read three rules BY NAME and a modifier class is not one of three names. Both are closed; both took a browser to find.
- 05-D31: A TEMPORAL-DEAD-ZONE THROW HID BEHIND "1216 passed, 0 failed" FOR TWO COMMITS. Row 108 read two head lookups one statement above the `const` that binds them, so the gate threw at load with every in-file row already printed green above it and the interaction-gate summary line never printed at all. Found by reading the EXIT CODE of a probe run, not by a failing row. The lesson is the grep: `passed,` is not a pass.
- 05-D32b: **THE DENSITY IS A CLAIM ONLY A BROWSER CAN MAKE, AND PROBE CF PROVED IT.** Reverting `.ae` to its old 660px width puts the terms region back to 2131px and every row back to 177px — and the node gate runs **1253 passed, 0 failed, 196 of 196, exit 0**. Four browser cells caught it, one per browser and viewport. Same shape as D-30's PROBE BM, arriving on a layout claim. Cell 23 therefore asserts a REGIME (one line per row, 48px) rather than a pixel.
- 05-D32b: **THE TICK WAS BUILT, PAID FOR IN WIDTH, AND NEVER SHOWN** on any chooser pill or either side button, since plan 03.1-05. `[C12]`, `[S06.5]` and `[C07]` all state the outline-AND-tick idiom; only `.ae-item--on .ae-check` was ever written. Nothing caught it because a `visibility:hidden` node still contributes its text to every harvest in the repo — the proposal scan counts "24 chooser ticks" by name. Built and shown are the same thing to a DOM with no layout engine. Fixed in `cc4e1a6`; browser cell 23c is what holds it now.
- 05-D32b: **THE STUB-DRIFT GATE CANNOT SEE A CLASS.** PROBE CD put `.ae-term-lbl` back in the stub and removed `.ae-term-read`: 135 shell ids, all built, that gate green — and every editor drive in the file quietly drawing nothing. Rows 111 and 112 caught it, and 112 is the class-level drift row this change needed because it moved no id.
- 05-D32b: an apostrophe and a backtick on ONE line of a comment in the script block take **Layer B from 8,586 literals to 1,878** — the single-quote arm swallows the opening backtick and the closing one opens a 46,510-character span. The extractor's own floor named it in one line, which is what that floor is for. Recorded at the site that tripped it.

- 05-D30: the node gate cannot see this change beyond the sign's PARENT, demonstrated rather than assumed — PROBE BL moved the anchor from 25% to 50% and the gate ran 189 of 189, exit 0. Three browser cells (21b, 21c, 21d) carry the half that only exists in pixels, and they run only where Playwright does.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-08-30T23:55:00.000Z
Stopped at: Completed D-33 PASS C (05-D33c) — the P2/P3 tiers and REF-03. The D-33 audit is fully spent apart from its two developer-decision items, which are now 05-11 sheet items 56 and 57. 05-11's playtest is the only thing left in the phase
Resume file: None
