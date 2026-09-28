---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: verifying
stopped_at: Completed D-47 — denser pages, from space and not from type (05-D47)
last_updated: "2026-09-28T07:15:00.000Z"
last_activity: 2026-09-28
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
Plan: 16 of 16 complete, plus the D-27 through D-35 redirect work;
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
**D-34 — "there should be a cancel step on modifying actions".** CANCEL IS A REVERT AND
NOT A DRAFT MODE, which is what makes it an op rather than a flag: this file commits every
edit live through one funnel, so a draft would have needed a second uncommitted copy of a
rule the board was not drawing. The editor snapshots the record when an action is
SELECTED and `restoreAction` puts it back as **ONE commit**, itself one Ctrl+Z — so a
mis-pressed cancel is recoverable, which is what lets it ship with no confirmation
(D-17). Inert when nothing changed, **never disabled**. The control is
`#act-edit-cancel`, beside Done, reading **"Put this action back how it was"** — not
"Cancel", which names a MODE, while this file names a control by its effect.
- **The op** takes the one payload shape the router cannot protect by naming keys, so the
  protection moved one layer down: the record is rebuilt FIELD BY FIELD through
  `requireActionName` / `requireTokenId` / `requireXfWho` / `int()` at the same named
  bounds, every guard outside the commit. The standard is **equality with the write
  path** — two values came out of the refusal table MEASURED as clamps, because a restore
  stricter than a keystroke would refuse records the keystroke had produced.
- **The snapshot is a held reference to a deep-frozen record**, in `[S07.3]`'s own scope.
  All four homes weighed against the proposal pane's own four sentences; **no key set
  moved in either direction**, and PROBE C proved it from the failing side (the build
  slice reddened 73c, 113d and three codec-and-mirror rows). Taken in `showAction`, so it
  follows the selection.
- **A defect FOUND, not introduced:** a paint that skipped a focused field recorded a
  fingerprint saying the surface matched state. `[S06.5]` now records none, and
  `App.render.editorStale` is the same statement from a press that discards a field's
  text. A restore is the one press that lands on that fingerprint every time.
Gate: node **1253 → 1261 / 0, exit 0**, **196 → 200** interaction rows (+113, +113b,
+113c, +113d), stub-drift **135 → 136 shell ids** (`act-edit-cancel`, with its KNOWN_IDS
entry and stub node in the same change), **no floor moved** — `DIALOG_FLOOR` **138**/172
either way, because a static label is Layer A's and never Layer C's — browser checks
**230 → 242 / 0 HEADLESS** (+cells 24, 24b, 24c). Eight probes against copied snapshots;
footer screenshotted in both browsers at both viewports (three controls, one line, 82px,
Done last). `deferred-items.md` item 12 is new — the browser cells throw on a timeout
rather than failing a row, which PROBE G found by making the footer too wide and watching
the run die in cell 23b over a node gate that was 1261/0 and 200 of 200.
`.planning/phases/05-fight-loop-playtest/05-D34-SUMMARY.md`.
Next: **nothing autonomous is left in the phase.** 05-11's playtest is the gate, and its
register is now **1–57**: section K holds P2-6 (symbols in the proposal pane, which extends
D-29's own scope) and P3-4 (one removal mark per term group rather than per glyph, which
touches D-30's own spec) — the two findings D-33's audit refused to implement without the
developer.

**D-35 IS TWO DISPATCHES AND BOTH ARE DONE.** The developer asked for two things: "add a
feature to configure what happens each round (default +3 action points, but also things like
-1 of a status effect token)" and "Add a property for min and max of a token on a unit or
side". **Part 1 (05-D35a) is everything below the surface** — the schema, the ops, the clamp,
the applier and the codec. **It renders nothing new**; part 2 builds the authoring surfaces.

**Bounds.** A token type carries `min` and `max`, authored, and they SHIP AT `[0, MAX_ALLOC]`
— exactly the pair `int()` has enforced since Phase 1, which is why the board did not move by
a number or by a character of build code. `bounded(vocab, tok, value, what)` replaced the
literal pair at **eleven** write paths plus every arm of `applyTerm` and both arms of the cost
spend. `setTokenBounds` is the one writer, with the house three-layer gate, and it **refuses**
a bound out of range or a min above its max rather than clamping one — writing a different
rule from the one the student typed is the failure the file is built to avoid. THE CLAMP IS AT
WRITE TIME ONLY: a tightened bound leaves standing numbers alone, which is what lets a board
whose ceiling dropped after the fact still round-trip.

**Round rules.** `build.rules` is a list of `{ who, tok, d }` capped at 8, seeded with the
developer's own default of **+3 action points to each side**. `who` indexes four frozen
records — a side, or each of a side's units. `setRoundRule` is the one writer, in
`setActionCost`'s idiom (append / replace / remove). `advanceRound` applies the list where the
hardcoded refill stood; a rule naming a scope with no such number lands NOWHERE, a rule naming
a departed type is refused BY NAME outside the commit, and **nothing ever writes `alive`** — a
`-99` health rule floors every unit and kills none, driven at a floor of 0 and at a floor the
student raised. The shield's no-refill stopped being a ruling of Advance's and became an
ABSENCE OF A RULE a student may fill. The DOES/does-NOT table was amended on both sides.

**THE +3 FORK IS REAL, PRESERVED, AND WIDER THAN D-35 RECORDED.** `+3` ADDS; the refill
REPLACED. They agree only in a round that spends the pool to nothing. The shipped 9v3 fight,
driven three rounds, is **BYTE-IDENTICAL** to commit `fe67194`'s — asserted as a whole-slice
equality against a 5,429-character literal captured from the old file, not a recomputation.
Leave a point unspent and they diverge AT THREE: a hand-ruling round now leaves the pools at
`[4, 5]` where it left `[3, 3]`. At nine, `+3` reads **11 / 13 / 15** over three rounds and the
refill — expressible as a rule of `+99` clamped at a max of 9 — reads **9 / 9 / 9**. Both are
driven side by side in `[S09.12]`. **Neither is asserted to be right**; `deferred-items` 13 is
the playtest question, and answering it is a one-line edit to `DEFAULTS.rules`.

**The wire stayed v1, and a literal earns it.** Both extensions are ON THE END — two fields on
a vocabulary record, one section on the body, written only when the rules differ from the seed
— so a five-field record means the shipped bounds and a sixteen-section body means the shipped
rules. The row that makes that a MEASUREMENT rather than an argument is a **real pre-D-35
code**, produced at `fe67194` and pasted as a literal: it loads the classmate's board with
`[0, 99]` on every type and the shipped rule list. The shipped board still writes its old **45
characters exactly**. An EMPTY rules section and an ABSENT one mean different things, so a
student who deletes every rule can still share that. Refusal matrix **20 → 28 shapes** (two for
bounds, six for rules), each reaching its OWN guard past a recomputed digest.
Sizes re-measured: **45 / 344 / 283 / 909 / 3542 / 3744**. Bounds cost 5 characters per written
vocabulary record, a rule about 4; the ceiling moved 3%.
Gate: node **1261 → 1327 / 0, exit 0**, **200 → 201** interaction rows (+114), stub-drift
**136 — unmoved, and that is the point: this change moved no id**, `DIALOG_FLOOR` **138**/172
unmoved, `FIGHT_FLOOR` **132**/592, browser checks **242 / 0 HEADLESS** unmoved.
`deferred-items.md` items **13** (the fork, for 05-11) and **14** (D-35's "shield gets a max of
its starting value" is not a type property, and the two readings that would satisfy it are both
changes of kind).
`.planning/phases/05-fight-loop-playtest/05-D35a-SUMMARY.md`.

**Part 2 (05-D35b) — the three authoring surfaces.** A student can now write a token type's
RANGE in the token editor, write WHAT HAPPENS AT THE END OF EVERY ROUND in a block beside the
rosters, and — on Advance — watch the rule they wrote take a point off a type they invented, in
the fight's own symbolic notation, on the surface that exists to say what moved. No op, no codec
change and no default was touched.

**The range** is two static fields on the token editor in `#tok-pick-name`'s own contract —
Enter loud, Escape back, blur quiet, never written while focused (D-19) — and a sentence under
them that says what the pair IS. **The shipped 0-to-99 reads as what it is**, because two boxes
of digits cannot tell an authored range apart from the one the artifact begins with. Nothing on
the page clamps: `setTokenBounds` refuses and the refusal is heard.

**PLACEMENT, THE ORCHESTRATOR CALL, TAKEN AND RECORDED: the reading is in the fight and the
editing is in the build.** D-31 makes the round-state area a reading of the board as it stands,
so `[S06.7]` draws an "Each round" block there with **zero controls in it**, and `[S06.13]`
draws the same rules with choosers in the build view beside the rosters. Both come out of ONE
function — `[S06.12]`'s `symRoundParts` — and check 116 asserts the two readings **equal to each
other** rather than each to a typed string. The declined alternative (editing inline in the state
panel) is written into deferred-items **15** with the rehearsal question it leaves open.

**Nothing in the new region carries `data-act`, and that is mechanism.** `#roundrules` is inside
`#app`, so `[S07.1]`'s `actTarget` would resolve a `data-act` and hand it to `fire()`, which
builds a payload `setRoundRule` does not take — the error panel on a student's first press. The
controls carry `data-rr` and the amount field carries `.rr-amt` rather than `.stp-field`, and
`[S07.7]` binds its own root, which is the view switch's `data-vw` precedent for the third time.

**THE WHAT-CHANGED READING NEVER SAID A TALLY MOVED, and that was a defect rather than a gap.**
A student who invented Rage and advanced a round watched the number move on the card and read
"Nothing on this side changed" directly above it. `ldTallyLines` walks the UNION of both bags now
— a tally of zero deletes its key, so the last point of a decay is the point that would otherwise
draw nothing.

`FIGHT_FLOOR` **132 → 248, re-derived by measurement**: four roster shapes driven against this
artifact and the one before it, undressed and dressed, delta **116 / 119** in every column with
the per-unit cost **unchanged** — and the smaller delta taken, because a move must be a lower
bound on any board a student can build. `DIALOG_FLOOR` **stays at 138** against a measured 173,
the third plan running to make that call: a tripwire for a surface going dark, not a ratchet.
Gate: node **1327 / 0, exit 0**, **201 → 204** interaction rows (+115, +116, +117), stub-drift
**136 → 144**, browser checks **242 → 254 / 0 HEADLESS** (+cells 25, 25b, 25c).
Five probes red the right rows; one of them found a defect in a CHECK — the stub's `textContent`
is a plain property, so 116's reading comparison was equal because both sides were empty.
**One browser cell was turned before it shipped**: cell 25's first draft read the viewport
rectangle alone, passed at both sizes, and photographed two fields cut in half by the dialog's
sticky foot.
`deferred-items.md` items **15** (where a student expects to edit a rule mid-fight) and **16**
(the reading says a number moved and never which rule moved it).
`.planning/phases/05-fight-loop-playtest/05-D35b-SUMMARY.md`.

**D-35c — THE ROUND RULES MADE OPERABLE.** The developer looked for the round-rules UI and
asked for it again, which is the only reading that settles whether a surface is discoverable.
Five defects, each now a number: the amount was stranded **160px** right of its pills
(`.rr-toks{flex:1 1 auto}` — [C17] was written from D-32's spelling of the token strip rather
than from the one D-33 P2-7 had already fixed) and measures **0px** with **80px** of slack left
in the row; the dangling half-row is gone and visible rows **=== rule count**; there is an
**`+ Add a round rule`** under the list and a **`Remove`** on every row, both wearing the word
per D-33 P3-1; the ten pills are five grid **columns** under four words written ONCE in a header,
each aligned with its column to the pixel; and the symbolic reading — which WAS already being
drawn, the dispatch's fifth item being the one thing in it not literally true — now has a column,
a header word, and a second consumer (`symRoundSaid`, off `symRoundBits`) that check 116 holds
to it. **The op did not move**: `setRoundRule` still covers append, replace and remove and is
still the only writer; "None" left the party chooser so that strip answers one question.
Gate: node **1327 / 0, exit 0**, **204 of 204** (no row added — 116 and 117 re-driven), stub-drift
**144 → 145** (`#rr-add`), browser checks **254 → 262 / 0 HEADLESS** (+cells 25a, 25b2).
`FIGHT_FLOOR` stays **248** and the reason is not D-35b's repeated: this change makes the
region's MINIMUM contribution SMALLER (a board with no rules used to draw one empty row of token
pills and now draws none), so the +10 measured on the shipped board is not a lower bound.
`.planning/phases/05-fight-loop-playtest/05-D35c-SUMMARY.md`.

**D-36 — CLICK A RESOURCE TO RULE ON IT.** "add the ability to directly click on a resource to
directly modify the value of that resource in the current round." Every resource reading on the
fight tab is now a press target that opens one static `− value +` AT THAT SPOT, and every press
through it is a hand ruling: through the shipped ops, into the round's `hand` record, one
undoable commit, clamped by the type's own D-35 bounds, with no verdict anywhere.
**Five ops were missing and were written** in plan 05-05's own group and under its banner —
`nudgeFightShield` (the sibling `setFightShield`'s comment reserved BY NAME two phases ago, and
this was the day it named), `setFightAp` / `nudgeFightAp`, and `setFightTally` /
`nudgeFightTally`, the last pair reusing `tallyOwner` so "which record carries this number" is
answered in ONE place for both slices. **The ruling record gained a side-scope shape** — `unit`
is null for a pool or a side-scope tally — and `[S06.8]` gained `ldHandWho`, which says the
faction's name where the others say a unit's rather than printing "null" at a student.
`[S06.9]`'s by-hand marker covers a unit's tally rows now, reading the ids off the page's own
`data-amt`; its paragraph saying a tally could never carry one is quoted and turned.
**The control is STATIC SHELL and that is plan 05-10's measured finding, not tidiness**: a
pointer press on a rebuilt node drops the keyboard to `<body>`, and a nudge repaints on every
press — probe D put the rebuild back and three browser cells went red in all four columns.
**Two defects were found by driving rather than by reading.** A real centre click on a LIT shape
lands on a reading, so nesting alone kept "must not collide" and broke "the retarget flow's claim
is unchanged" — cells 12b and 12c went red, and the separation is now in TIME as well as in
space: while a change of target is half made the whole battlefield belongs to the flow. And a
screenshot showed the fixed box not following a scroll, because a scroll commits nothing and
schedules no frame; it is re-placed rather than dismissed.
Gate: node **1327 → 1336 / 0, exit 0**, **204 → 207 of 207** (+118, +119, +120), stub-drift
**145 → 153** (eight static nodes, both directions), browser checks **262 → 286 / 0 HEADLESS**
(+cells 26 through 26f, four columns). `DIALOG_FLOOR` **138** and `FIGHT_FLOOR` **248** both
unmoved. Check 57's inline-style allowlist turned **in the open, 2 → 4 accesses** (`--fgn-x` /
`--fgn-y` beside the topbar pair), with the boundary re-argued from the row's own words.
**Five mutation probes, every one of them red**, and the artifact byte-identical to the copy
taken before the first.
`deferred-items.md` items **17** (the battlefield's readings are a pointer affordance, not a
keyboard one — the structural fix priced at ~20 assertions and a design question) and **18** (a
reading hidden at zero cannot be clicked back up).
`.planning/phases/05-fight-loop-playtest/05-D36-SUMMARY.md`.

**D-37 — THE UNIT POPUP, AND HALF OF D-36 TAKEN BACK IN THE OPEN.** "click on a unit then click
on the popup window to modify the values associated with it." Clicking a unit on the battlefield
at rest opens `#fg-unit` for that unit, holding **every value it has** — health, shield, every
unit-scope tally the student authored **including the ones sitting at zero**, and the dead marker
— each drawn by `[S06.12]`'s `symQty` with the prose on a scanned tooltip, each editable through
the shipped ruling ops into the round's `hand` record, one undoable commit per press, clamped by
the type's own D-35 bounds with the same readable refusal the team-resource nudge says.
**D-36's per-reading nudge ON THE BATTLEFIELD is REMOVED**, on D-37's own instruction and with
every paragraph that argued it rewritten in place rather than deleted: `bfBuildUnit` writes no
routing attribute on a `.bf-line`, `[C14.6]`'s selector loses its `.bf-line` half, and
`pressRes`' armed delegation goes — the rule it enforced moved one function up into `pressBf`,
where it covers the whole shape. **The team-resource direct click is untouched.**
**It is a fixed box in the shell and NOT a `<dialog>`, decided rather than defaulted**: a modal
is centred and has no *elsewhere*, and a sibling of `#app` is outside Layer C's fight harvest. It
lives inside `#fightbar`, and row **92c** DRIVES IT OPEN before harvesting so its strings are
scanned rather than reported clean forever.
**The rows are BUILT, not shell — a unit's value count is a student's decision — so the focus
contract is a FINGERPRINT** of the side, the unit and the token LIST, never a number. Probe G put
the rebuild back: four browser cells red, and **only the node-identity clause caught it** — the
number, the record and the focus all stayed green over a control being destroyed under the
pointer, because `withPreservedFocus` restores by key.
**The shape now has TWO JOBS separated in time**: at rest it opens the popup, while a change of
target is half made the whole battlefield still belongs to the retarget flow. D-37's own
parenthesis, driven with a real centre click in both browsers.
**D-00d held and was driven**: health taken to zero through the popup leaves the unit standing at
`9 of 9`; probe F made a ruling write the flag and check 121 went red.
Gate: node **1336 / 0, exit 0 — unmoved, because this plan adds no op, no state key and no codec
change**, **207 → 210 of 210** (+92c, +121, +122), stub-drift **153 → 157**, browser checks
**286 → 294 / 0 HEADLESS** (+cells 26g, 26h; 26/26b/26c/26e/26f turned; 26d untouched).
`DIALOG_FLOOR` **138** and `FIGHT_FLOOR` **248** both unmoved. Check 57's allowlist turned **in
the open a third time, 4 → 6** (`--fgu-x` / `--fgu-y`) — and its first drive read SEVEN because a
comment in the artifact spelled the accessor the row scans for, so the comment was rewritten to
describe it. **Six mutation probes, every one red**, artifact byte-identical afterwards.
**Three defects only pictures showed**: the value cell was left-aligned so the ± pair did not read
as a pair (centred); an edge unit's popup flips above its shape and stays on screen (asserted);
and at 1366x768 the rightmost mech's popup reaches over `#topbar` — the clamp-to-the-bar fix was
rejected on the picture, because it lands the box on the very unit it is showing.
`deferred-items.md` items **17 and 18 are CLOSED**, each with the resolution NAMED: 17 by a
*different* control than the one it priced (the restructure of `.bf-unit` was not taken and the
retarget flow keeps its whole plate), 18 by its own answer 3 (answers 1 and 2 explicitly not
taken — the battlefield's hide pass is untouched).
`.planning/phases/05-fight-loop-playtest/05-D37-SUMMARY.md`.

**D-38 — THE HOW-TO LEAVES THE SIMULATOR, AND THE TWO DEFECTS IN THE SCREENSHOT ARE BOTH
REAL.** "this part a the bottom looks cluttery - if you want a how-to-tab, do it separately
from the simualtor."

**A THIRD TAB.** `#howto` is a view beside The board and The fight, holding six cards of
displaced prose organised by surface — the board, tokens, actions, sharing, the fight, the
round rules. Not a dialog: no `DIALOG_ROOTS` entry, no opener, no close-request answer, no
focus trap, and a student reading how the fight works is not made to cover the fight with
the thing explaining it. `[C18]` carries six rules and **`[C15]` is byte-identical**, because
several rows read those rule bodies by name and a tidier `:not()` rewrite would have turned
green rows red for a change none of them is about.

**HOW THE HARVEST REACHES IT WAS DECIDED CONSCIOUSLY.** The gate stub BUILDS `#howto` with
its words, extracted from the shell rather than re-typed — a deliberate exception to the
"static text is empty here" rule this file states four times, because the alternative leaves
the artifact's largest block of prose, about a FIGHT, behind its smallest word list. The
`#app` harvest went **187 → 219**; row 126 reads the region by name under **HOWTO_FLOOR 24**
against a measured 32. And **no paragraph in the region nests an inline element** — the walk
reads LEAVES, so a `<p>` holding a `<b>` keeps the emphasis and loses the sentence. `[C18]`
states it and row 126 counts the shell's fragments against the harvest.

**ELEVEN DISPLACEMENT SITES, EACH RULED AND RECORDED AT THE SITE.** Five moved whole (the
round-rules explainer, the picker's shape-and-colour paragraph, the action editor's opening
note, the share pane's copy note, "Paste a classmate's code and press Load"); six became
tooltips on their own headings, which is D-38's named allowance on D-29's channel (Cost,
Needs, Changes, Override, Range, and a one-liner on `#rr-head`); two were SPLIT so the
reading stays at its control — "Nothing here is applied." and "It replaces the board, and
one Ctrl+Z brings yours back." Four dead CSS rules removed with their reason, D-33c's trap
read the other way round. The Actions editor now carries **zero** explainer paragraphs and
its body no longer scrolls at 1920 at all: **825 over 779 before, 803 over 803 after**.

**DEFECT (a) — THE EMPTY SIDE PILLS — REPRODUCED AND FIXED.** On a cold page both
`.ae-side-name` spans read `""`: the words existed only in `[S06.5]`'s per-frame write, and
that write has **four early returns** above it, so any frame in which the dialog is VISIBLE
before one is cleared draws a labelled empty box. Twenty-two rendered changes went past
because a reading taken after boot says "Cats" on the broken file too. The words now ship in
the DOCUMENT as the resting value and the live read is untouched. Row 123 takes the resting
reading at `makeStubDom()` time, before the artifact has run.

**DEFECT (b) — THE SECOND PANEL — REPRODUCED, AND IT IS NOT TWO OPEN MODALS.** It is a
CLOSED `<dialog>` in normal document flow. Measured on the shipped file, board tab, nothing
pressed: `#tok-picker` **display:grid, 660x728** and `#act-edit` **display:grid, 1040x716**,
both at document y 3067, 728px of dead page height. Open the Actions dialog, scroll to the
foot, and the picker's sticky foot — "Emoji" and "Done" — is on screen underneath it through
that dialog's own 76% backdrop. **The mechanism is cascade ORIGIN, not specificity:**
`dialog:not([open]){display:none}` is a user-agent rule and an author declaration beats one
at every specificity, so D-33 P1-3's three-block frame repealed the closed state in the
change that gave those two their grid. `.sh` and `.rs` were clean BY ACCIDENT, so the guard
names all four and row 127 derives the class list from the shell's own `<dialog>` tags.

**AND THE READING THAT LOOKED RIGHT IS BOUNDED HONESTLY.** All twelve ordered pairs of the
four openers were driven as real clicks: **every second press BLOCKED** by inertness, so two
open modals were never reachable through the shipped controls. `soleDialog()` ships anyway,
because inertness was the ONLY thing holding a property not one line of `[S07]` stated.

**TWO BROWSER CELLS WERE PROPPED UP BY DEFECT (b)** and are turned in the open with recorded
reds: 21c was measuring D-30's anchor on two marks inside a closed dialog (8 of 8 red on
`badGeom`), and 25b2's scroll relied on the 728px of phantom page (4 of 4 red on `saidAt`).
25b was turned in the same change for the same class of reason.

**Row 103 turned in the open**: it floored the switch at two `data-vw` controls and drove
two. Recorded RED **211 of 212**, on the count and nothing else.

Gate: node **1336/0 exit 0** (unmoved — no op, no state key, no codec change), **216 of 216**
(+123, 124, 125, 126, 127, 128), **160 shell ids** (+`view-howto`, `howto`, `howto-head`),
`DIALOG_FLOOR` **138 — measured 179, and the arithmetic of why it did not move is written
into its note**, `HOWTO_FLOOR` **24 new**, `FIGHT_FLOOR` **248 unmoved**; browser checks
**314/0 HEADLESS** (+27, 27b, 27c, 28, 29) in chrome and msedge at 1920x1080 and 1366x768.
Six mutation probes, every one of them red, artifact restored from scratchpad copies.
`.planning/phases/05-fight-loop-playtest/05-D38-SUMMARY.md`.

Next: **05-11, the playtest** — the last thing in the phase, and it now carries five questions
rather than seven: the AP sweep, the +3-versus-refill fork (item 13), the round-rules placement
(item 15), whether a decay needs attributing (item 16), and whether a two-line rule band reads as
one rule on a projector once a student has invented a sixth token type. Items 17 and 18 came off
that list under D-37.

**D-40 — PREVIEW THE POOL WHILE SETTING UP AN ACTION.** The developer, verbatim: "Make it
so you can preview the depletion of action points while setting up actions." The fight tab
already depletes live while DECLARING, so the instruction is read as the AUTHORING surface,
and the action editor's Cost region now says — live, per pool the cost names — what the side
holds, what this cost takes wearing D-30's red mark on the shape, and what would be left,
in D-29's notation with the prose on scanned tooltips. Per POOL and not per term, because a
pool has one number and is drawn down once: two action-point terms of two SUM to four out of
a pool of three, and the sentence is the affordability machinery's own — "Not enough to
spend. Short by 1." A cost naming health, shield or a unit-scope type draws no row, which is
`isPoolToken`'s ruling arriving at a reading; the proposal pane still says that term out
loud, in the same dialog, off the same report. **It disables nothing** — the never-disable
rule is in full force on an authoring surface, and the row collects every switched-off
control by name before and after the cost goes past the pool.

**IT DECLINED `fgPoolReading` ON PURPOSE.** That function is D-39 P1-2's one-pool-truth and
reaching for it would have looked like the obedient move, but it reads the FIGHT slice
against this round's DECLARATIONS and an action being authored has not been declared. What
is shared is the SENTENCE: `costShortSaid` is lifted out of `fillReport`, both panes of the
dialog call it, and row 123 compares the two to EACH OTHER rather than each to a typed
string — row 111's technique on a fifth pair.

**TWO FINGERPRINT SLOTS THAT WERE ALREADY MISSING.** `editorSig` never carried the side's
own tally bag (the units' bags were in it, one slot along) nor each type's scope — and both
have been drawn by the proposal pane since plan 03.1-07 as the "of 5" in "costs 3 Momentum
of 5" and as the choice between its two sentences. The preview made the first one visible;
it did not make it true. PROBE ED removed the scope slot and measured the preview reading
1 pool row and then 1 where it must read 1 and 0.

**AND ONE FIX CAME OUT OF A PICTURE.** The first draft of `[C12]`'s block measured green on
every number this repository takes — 66px, rows of 29 and 22, no overflow, four browser
columns agreeing, gate 222 of 222 — and the screenshot showed the two pool rows' sentences
beginning at 232px and 252px. `.ae-pool` is a two-column grid now with `.ae-pool-row` at
`display:contents`. PROBE EG reverted it: node **1341/0, 222 of 222**, DOM **1465/0**, and
the browser **370/0 → 370 passed, 4 failed**, cell 30 in all four columns.

Gate: node **1341/0** exit 0, **222 of 222** (+123, +123b), **164 shell ids**, DOM runner
**1465/0**, browser **374/0 headless**, live `#selftest` **1465/0** in real Chrome and real
Edge with **0 page and console errors**. `DIALOG_FLOOR` 138 not moved (179 → 188, the
arithmetic in its note); every other floor untouched. Ops, codec and `DEFAULTS` not gone
near. Seven mutation probes, six red and one — PROBE EF, a byte-identical re-typing of the
shared sentence — **green, and recorded as the limit of the claim**.
`.planning/phases/05-fight-loop-playtest/05-D40-SUMMARY.md`.

**D-41 PART 1 OF 2 — THE RESERVE AND THE MOVE, BELOW THE SURFACE.** The developer: "make it
so manual allocation of resources can be done via dragging token elements onto the relevant
entity or dragging from one to another", amended before any of it was built: "allow any unit
to any other unit, with a pool at the top of each side", the pool a REAL reserve. Each side
now carries `reserve`, a sparse bag of unit-scope token counts absent when empty, and ONE op,
`moveToken(tokenId, fromSide, fromUnitId, toSide, toUnitId)`, sends every drag: unit to unit
across sides, unit to either reserve, reserve to any unit, side to side. Scope binds (a
side-scope type never lands on a unit; Damage and the dead marker are nobody's to move), every
refusal is a plain Error with a sentence, and a same-end drop is nothing. **Conservation is the
invariant**: a 400-move fixed-seed sweep holds every type's whole-build total exactly, meeting
floor, ceiling and scope refusals along the way. **Bounds REFUSE WHOLE instead of clamping**,
because a clamped transfer destroys a token, and the test is directional (source against floor,
target against ceiling), so a unit above a tightened ceiling can still give its excess away.
**The reserve is not held to the type's authored pair** (measured: at Health max 3 it would
refuse the fourth cat on a side of 27) **but is capped at MAX_RESERVE = 99**, because steppers
create tokens and step-then-pool is otherwise unbounded. Two moves back to back are two undo
entries, driven against a stepper control that does fold. The fight slice and every projection
figure are byte-identical over a full reserve and an empty one. The wire stays v1: a trailing
`P` section written only when non-empty, the tail read by letter, a real pre-D-41 code decoding
with an empty reserve and re-encoding byte for byte, and the matrix at 39 shapes (nine reserve
guards, two tail shapes). Sizes: A 45, B 344 → 346, H 3542 → 3623, I 3744 → 3825.

**FOUND UNCOMMITTED AND PARKED, NOT BUILT ON:** a pre-amendment attempt at part two's SURFACE
sat in the main tree (DOM 1479/1, the withdrawn within-a-side rule). It is on the local branch
`wip/d41-pre-amendment-drag-ui` at `d081c3b` for part two to mine. Probe E also found a D-32
row that THREW rather than failed under a refusal, hiding the refusal matrix; it is guarded.

Gate: node **1382/0** exit 0 (+41), **222 of 222**, **164 shell ids**, DOM **1506/0**, browser
**374/0 headless**, live `#selftest` **1506/0** in real Chrome and real Edge with no page errors. Six probes (half-transfer, clamp, fight
reads the reserve, projection reads it, moves fold, empty reserve on the wire), **all red**, and
under all six rows failed without throwing or hanging.
`.planning/phases/05-fight-loop-playtest/05-D41a-SUMMARY.md`.

**D-41 PART 2 OF 2 — THE POOL AND THE DRAG.** Each column head now opens with a **Pool**: a
box around the numbers a student allocates to the whole side (the action-point stepper and
the side's own tallies, moved in, not duplicated), opened by a **Reserve** line. The reserve's
parked tokens are drawn with `symQty(styleFor)` at board size, and an empty reserve is a dashed
drop slot that says what goes there. Any token on a unit card or in a pool drags, by a real
pointer, onto any unit on either side or onto either pool. **Lit / refused / home are the OP's
answers.** `moveToken`'s guard block moved unedited into `moveRule`, exported as
`App.ops.moveCheck` (no router arm), and `[S09.14]` holds the surface's answer list to what
`moveToken` actually does, end by end and sentence by sentence. A drop is ONE `moveToken`
dispatch. A refusal is said on the card it was dropped on, through D-39b's channel, **and brought
on screen**: a screenshot found it written below the fold at 1366x768 with every row green.
There is a 6px threshold (a sub-threshold press stays a click). Escape, pointercancel and blur
cancel a drag, and nothing commits while it is live. **Edge autoscroll** was added (Rule 2)
because at 1366x768 the pool is off screen from Cat 6 down. Two drags 66 ms apart are two undo
entries, against a stepper control that folds. The stepper ramp is unchanged: 9 steps / 1 entry
per 1.1 s hold on HEAD and after, 24 of 24. **The reserve has no keyboard path**, and that is
said plainly (How-to, the `[S07.8]` banner, deferred item 1). The steppers reach every number a
drag changes.

Gate: node **1391/0** exit 0 (+9), **225 of 225** (+129, 129b, 129c; **check 57 turned 8 → 10
in the open**, `--drg-`), **165 shell ids** (`#drag-layer`), DOM **1515/0**, browser **426/0
headless** (+13 cells x 4 columns: every drag kind by `page.mouse` in Chrome and Edge at
1920x1080 and 1366x768), live `#selftest` **1515/0** in both browsers. **FIGHT_FLOOR 248 → 254**,
re-derived at four roster shapes (+6 roster-independent). Check 47's floor re-measured and held.
Seven probes, all red in at least one tier. **P1** (the ghost intercepting the hit test) was
green in the node tier and got a stylesheet clause in check 129. **P7** (a drop committing twice)
is browser-only by construction. The parked branch `wip/d41-pre-amendment-drag-ui` was mined
(threshold, capture on `#board`, `elementFromPoint`) and left untouched.
`.planning/phases/05-fight-loop-playtest/05-D41b-SUMMARY.md`.

**D-42 — AN FF1-STYLE BATTLE SCENE, FOR TELLING UNITS APART.** The fight tab now opens on a
battle window: a white rim around the old menu blue, a sky-and-grass band, orange pixel cats sitting
on the left facing grey pixel mechs on the right, each unit's name under it in a monospace system
font. Every sprite drags anywhere in the frame by a real pointer. It stops at the edges, stays
where it was let go, comes back after a reload (best-effort `localStorage`, key `cvm.v1.scene`, a
missing or refusing store is normal), and returns to formation from **Back to formation** (mouse
or keyboard). A unit **ruled dead** lies down grey. A unit at zero health nobody ruled on stands. A
drag writes **no state, no undo entry and no build code**, and a sprite under the pointer is the
**same node** across an Advance landing mid-drag. Colours are read off the computed tokens every
frame and are asserted pixel by pixel against them. Names are real text, counted in Layer C by
name (check 130). **Placement was measured** at three positions in both browsers at both sizes.
Advance's reachability held at every one. The scene went first, above the lane, which costs the
round-state panel its place on the first screen (727 -> 1180 of 1080). The one-line alternative is
in deferred items. **Three picture-only defects** (a long name under the next sprite, a dropped
sprite over a neighbour's name, a dead cat's canvas over its own name) were found by reading
screenshots back with every row green. They were fixed, and the cells now hit-test every name.

Gate: node **1399/0** exit 0 (+8), **227 of 227** (+130, +130b; **check 57 turned 10 -> 12 in the
open**, `--scn-`), **170 shell ids** (+5), DOM **1524/0**, browser **470/0 headless** (+11 cells x 4
columns; cells 6b and 20 turned in the open because the scene moved the page under them), live
`#selftest` **1524/0** in both browsers with the store untouched. **FIGHT_FLOOR 254 -> 257**: the
scene costs exactly 3 + 2n at five roster shapes. Eight probes, every one red in at least two
tiers; P2 first made a browser cell THROW, and the cells were hardened to fail instead.
Ops, codec and `DEFAULTS` are byte-identical.
`.planning/phases/05-fight-loop-playtest/05-D42-SUMMARY.md`.

**D-43 — THE MECHS ARE MUCH BIGGER THAN THE CATS.** Every mech in the battle scene is drawn at
**twice a cat's size** (96px against 48, 128px against 64 on a projector-sized window). That is
four times the area and a whole number of screen pixels per sprite pixel. The cats are unchanged.
One multiplier, `--scn-big: 2`, in [C19] sizes a mech's sprite and its box, so both clamps use
each sprite's own size. The shipped three mechs stand in **one row**, so the shipped scene keeps
D-42's exact height. **At 24 a side the scene grows**, by measurement: six field rows, 294-1089 of
1080 and 294-969 of 768. Four rows of 152px mechs cannot fit in less, and Advance stays wholly on
screen wherever the picker rows are (cell 32k). A dead mech turns in place and ends above its name.
Gate: node **1399/0** exit 0, **228 of 228** (+130c: the ratio read off [C19] and every roster to
24v24 laid out in pixels at both sizes), **170 shell ids**, DOM **1524/0**, browser **486/0
headless** (+32k-32n x 4; 32j turned in the open 4 -> 6 rows), live `#selftest` **1524/0** in both
browsers. The `[S09.15]` formation row turned in the open. Four probes, all red; the required one
(mechs back at the cats' size) reddens 130c and 32k/32l/32n in all four columns.
`.planning/phases/05-fight-loop-playtest/05-D43-SUMMARY.md`.

**D-44 — 16-BIT ART BY DEFAULT, THE 8-BIT ART KEPT, AND A PICKER.** The battle scene opens in a
16-bit generation at Final Fantasy V's level of detail. Cats are a 24-pixel shaded tabby and mechs
a 48-pixel plated walker with a glowing visor, gold trim and an arm cannon. They stand in front of
an SNES backdrop (a banded, dithered sky, clouds, a snowy range, hills, tufted ground) in an FFV
window with a graded fill and a bevelled rim. Every shade is a mix of tokens, with shadows toward
a tinted dark. D-42's art is the 8-bit generation, unchanged. D-42's and D-43's cells run untouched
with it selected by a real click. A "16-bit" / "8-bit" button pair in the scene header switches
between them. The choice is best-effort under `cvm.v1.scene-art`, never in the state, undo or the
build code. A switch keeps every node and every place, even for a sprite being held. 16-bit
sprites are two screen pixels a sprite pixel at every size (48 / 96). On a projector-sized window
that is smaller than the 8-bit 64 / 128, because 72 / 144 does not fit the formation (deferred
D-44.1). Gate: node **1404/0** exit 0, **229 of 229** (130c over both generations 1152 -> 2304,
RED recorded; new 130d), **174 shell ids**, DOM **1530/0**, browser **518/0 headless** (+32o-32v
x 4), live `#selftest` **1530/0** in both browsers. FIGHT_FLOOR 257 -> 262 (+5 at five shapes).
Seven probes, every required one red in the node tier and in all four browser columns. PF first
ran the gate green, and 130d was hardened for it. The sprite data costs 3,789 bytes; the artifact
grew 37,163 bytes. `.planning/phases/05-fight-loop-playtest/05-D44-SUMMARY.md`.

**D-45 — GENERATED, THEMED DEFAULT UNIT NAMES.** Units are born with names instead of "Cat 3" and
"Mech 1". The shipped board is Biscuit, Mittens, Pepper, Nimbus, Tofu, Juniper, Waffles, Clover
and Ginger against Anvil-07, Cog MK-2 and Rivet-12. `[S01]`'s `unitName(side, n)` is a pure
function of the side and the NUMBER IN THE ID: 52 cat names (<= 7 letters) and 30 mech
designations ("Model-nn", or "Mod MK-n" for a 3-letter model; <= 8). Past a list's end a cat takes
a round number and a mech moves its mark on. It is unique per side at any id and disjoint across
sides. Names stay STORED, minted once by makeUnits, addUnit and the decoder and never re-derived.
No op writes one, so nothing changed at any render site, and a rename wins by construction. The
codec wire is unchanged (`WIRE_UNIT_LABEL` replaced by `unitName` on both ends): the shipped code
is byte-identical at 45 characters, and three codes written by the pre-D-45 file load showing the
new names and write back the same code. THE SCENE DECIDED THE LENGTHS: at 24 a side on 1366,
neighbours clear only at <= 7 / <= 8. The first draft (the brief's "Warden MK-2" style) went red in
130c and in real-browser 32j/32u. Gate: node **1421/0** exit 0, **230 of 230** (new 131 walks both
lists and 208 made names against the three live PROJ-06 arrays, the eight words and 25 rank words;
41, 120b, 121 and 130c turned in the open), **174 shell ids**, DOM **1548/0**, browser **518/0
headless** (15 expectations now read `born.*` off the page), live `#selftest` **1548/0** in both
browsers. Every Layer C harvest count is unchanged, so every floor holds. A real-browser drive,
44/44 in four columns, covered: a middle removal by click, 24 a side by clicks, a rename plus real
Ctrl+Z, a pre-D-45 link, a share round trip, and the ledger reading "Biscuit uses Slash on
Anvil-07." Six probes, all red; P1 (a Layer-C-only word on an unpainted entry) is caught by 131
alone. Deferred D-45.1: the board card repaints a unit's name only on a structural frame, which is
the render half of a rename op nobody asked for. D-45.3: the pre-D-45 `build code` suite throws
rather than failing row by row when encode refuses its hostile board.
`.planning/phases/05-fight-loop-playtest/05-D45-SUMMARY.md`.

**D-46 — DRAG RESOURCES ON THE FIGHT TAB, AS HAND RULINGS.** "I can't drag resources around the
battle screen." D-41's model on the FIGHT slice: `moveFightToken` / `moveFightCheck` share
D-41's one guard block (`moveRule` takes the slice; the fight adds only fightOf's "No fight in
progress") and one end resolver (`moveEnd`: holder and health field are the only variables).
A conserved per-side fight reserve; unit->unit either side, unit<->reserve, pool->pool; bounds
refused whole; both ends in the round's `hand` record (source first; a reserve end is `unit:
null` and the ledger says "The Mechs reserve"); label `fight move <count>`, so two moves are two
undo entries; never writes `alive`; the build code does not move. Two fights differing only in
their reserves play three real Advances identically. The team-resources area is each side's
pool (reserveHeld shared with the board pool; rows built once per list). Every battlefield
shape is an entity and every reading a source; the lights are moveFightCheck's. `[S07.8]` is one
machine for two surfaces. `[S07.5]` ranks a press: a half-made retarget owns it; at rest a press
on a source is held and the D-37 popup / D-36 nudge open on a still release; a shape's name opens
on the way down as before. Two picture-only defects fixed: a refusal said inside a 150px shape
reflowed the cluster and hid six cats (it is now said under the cluster), and a stretched cluster
spread its rows so a sentence moved the other column's units (`.fg-field` packs to the top).
Gate: node **1436/0** exit 0, **233 of 233** (new 132, 132b, 132c), **174 shell ids**, DOM
**1563/0**, browser **578/0 headless** (+33, 33a-33n x 4: every drop kind by real `page.mouse` in
Chrome and Edge at both sizes, the scene and the drag never capturing each other, Advance while a
drag is held, the ledger after a real Advance, edge scroll), live `#selftest` **1563/0** in both
browsers. FIGHT_FLOOR 262 -> 268 (+6 at five shapes). Eleven probes, all red in at least one
tier, none threw or hung (after the rows that threw under the first probe run were hardened).
Deferred D-46.1: the fight Reserve has no keyboard path. `.planning/phases/05-fight-loop-playtest/05-D46-SUMMARY.md`.

**D-47 — DENSER PAGES.** "Can you make the pages denser." A whole-artifact pass that took the
space from padding, gaps, stacked lines and a too-narrow picker, and NOT from type: no font got
smaller, six readings went 17 -> 18. `[C00]` gains one spacing scale, `--sp-1..5` (4/6/8/12/16):
before it, 363 spacing declarations over 30 pixel values and none on a token; 95 are on it now,
in every rule D-47 redrew. Measured in real Chrome and Edge at both sizes, identical to the pixel:
board 3224 -> 2533 at 1920 (whole Cats cards on the first screen 2 -> 4, and 0 -> 1 at 1366), How
this works 2499 -> 1811 (a column flow, 0px of empty panel), the fight 16-18% shorter with the
lane whole on the first screen, the token picker at the editor's 1040 and wholly visible at
1920 (623px hidden before), the editor's head in two rows. The scene's explainer is
`#scene-head`'s scanned title and a paragraph on How this works (174 -> 173 shell ids). Two
regressions surfaced only in the browser tier and were fixed in the artifact: a 16-bit field
height that broke D-44's picker rule (given back; deferred D-47.2), and the lane as Chrome's
scroll anchor, which slid the round out from under a held token after an Advance
(`#ledger{overflow-anchor:none}`). Gate: node **1436/0** exit 0, **233 of 233** (130d turned),
**173 shell ids**, DOM **1563/0**, browser **586/0 headless** (+34: the reading floor walked on
eleven surfaces with fields included, standing exceptions pinned at their measured sizes; +34b:
the density as regimes; 32 turned), live `#selftest` **1563/0** in both browsers. Nine probes:
eight red, and P6 green on 34b's first draft, which is why 34b now reads the card's room off the
scale. Deferred D-47.1-4 (readings already under the floor in the editor, Proposal pane and share
field; the 16-bit field; the unscaled rest of the sheet; the lane's lede).
`.planning/phases/05-fight-loop-playtest/05-D47-SUMMARY.md`.

Last activity: 2026-09-28

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
| Phase 05 D37 | one session | 4 tasks | 4 files |
| Phase 05 D42 | 86min | 5 tasks | 6 files |

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
- [Phase 05]: 05-D42: the battle scene is the fight tab's FIRST panel, chosen by measurement: the only place it is whole on screen at load at both sizes, with the lane still directly above the round; Advance reachability held at all three places measured. The round-state panel leaves the first screen and the one-line alternative is recorded.
- [Phase 05]: 05-D42: sprite positions are view state in [S06.17]'s closure and best-effort localStorage (cvm.v1.scene), never a slice; parsed as foreign, pruned when a unit leaves because ids are reused, and never touched on a #selftest page.
- [Phase 05]: 05-D42: dead in the scene is the stored alive flag only; names are real text (canvas holds pixels only) so Layer C reads them, and legibility is asserted by hit test because name-vs-name comparisons could not see a name under a sprite.

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

- 05-D35c: **A CELL CAN NAME A DEFECT AND STILL BE UNABLE TO SEE IT, AND THE ANSWER WAS A CELL IN A DIFFERENT PLACE.** PROBE DC put the stranded amount back — the token track to `1fr` — and cell 25b, the cell whose whole sentence is about that defect, passed at 0px in all four columns. By the time it runs a sixth token type has been invented and the row is over-constrained: a track with no free space cannot claim any and the two layouts are pixel-identical. New cell 25a takes the reading on the shipped board where 80px of slack exists, and asserts `slack > 0` as a floor on the measurement being a measurement. It also turned which clause is load-bearing: `amtGap` can NEVER catch a stretched track in a GRID, because the amount is the next COLUMN and rides along with it at 0px while the pair drifts right together.
- 05-D35c: **A HIDDEN ROW WAS HOLDING TEN LIVE BUTTONS AND A GATE CHECK WAS PRESSING ONE.** PROBE DI found nothing, which is how it surfaced. The surplus round-rule rows are static markup, so hiding one left it holding the pills of whatever rule last stood in it — invisible on screen, absent from the accessibility tree, clean to every reading in this repository. Check 117 authored its decay rule by pressing a token pill on a row that was hidden the entire time, and passed, because this stub's `querySelector` does not honour `hidden`. Rows are emptied on the paint that hides them; 116 reads a hidden row back for zero pills.
- 05-D35c: **`align-items:center` ON A GRID DRAWS A PER-ROW HAIRLINE AS FOUR DISCONNECTED SEGMENTS,** because centred cells are only as tall as their contents and a wrapped chooser puts five border-tops at three different heights. Every number in the cell was green — row count, band height, amount gap, column alignment — because none of them is about where a border starts. The nineteenth consecutive rendered change in this phase whose defect only a picture showed.
- 05-D35c: **A PROBE FOUND A VARIABLE THAT WAS ALREADY INERT.** Setting `shown` back to `list.length + 1` changed nothing, because `slot === list.length` reads `undefined` out of the list and the row is hidden on the next line whatever the count says. Deleted rather than kept: a variable that cannot change the answer is a variable the next reader has to prove cannot change the answer.
- 05-D35c: **A TWO-PART SELECTOR IN THE NODE GATE MATCHES NOTHING, SILENTLY.** This stub's `querySelector` reads ONE simple selector, so `'.rr-read .sym'` returned null and a new clause read `false` over a page where both strings were correct. Chain, or the clause is green-over-nothing in the other direction.

- 05-D42: **THE BATTLE SCENE PUSHES THE ROUND OFF THE FIRST SCREEN.** With three rounds resolved the round-state panel starts at 1180 of 1080 and 1046 of 768 (727 and 653 before). Advance is untouched (cells 18 and 18c). Moving `#scene` after `#fightbar` is one line and costs the round nothing. `deferred-items.md` D-42 item 1; the developer's call at 05-11.

- 05-D30: the node gate cannot see this change beyond the sign's PARENT, demonstrated rather than assumed — PROBE BL moved the anchor from 25% to 50% and the gate ran 189 of 189, exit 0. Three browser cells (21b, 21c, 21d) carry the half that only exists in pixels, and they run only where Playwright does.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-09-28T07:15:00.000Z
Stopped at: Completed D-47 (05-D47) — denser pages: one spacing scale in [C00]; every tab and dialog measurably denser in real Chrome and Edge at both sizes with no font made smaller and six readings raised to 18; the scene's explainer a scanned title and a How this works paragraph; the picker at 1040, the editor's head in two rows, How this works in columns; two browser-only regressions fixed in the artifact (the 16-bit field height given back for D-44, the lane out of scroll anchoring). Node 1436/0, 233 of 233, 173 shell ids, DOM 1563/0, browser 586/0 headless (+34 reading floor, +34b density regimes), live #selftest 1563/0 in both browsers; nine probes, eight red and one strengthened. Next: 05-11, the playtest. Previously: Completed D-46 (05-D46) — resource drags on the fight tab as hand rulings: moveFightToken on the fight slice sharing D-41's one guard block and one end resolver, a conserved fight reserve blind to the fight, both ends in the round's hand record, one undo entry per drop; the team-resources area as each side's pool; a still press still opens the popup or the nudge, a half-made retarget owns the press, the scene never shares a pointer. Node 1436/0, 233 of 233, 174 shell ids, DOM 1563/0, browser 578/0 headless, live #selftest 1563/0 in both browsers; FIGHT_FLOOR 262 -> 268; eleven probes all red. Next: 05-11, the playtest. Previously: Completed D-45 (05-D45) — generated, themed default unit names from (side, id number): 52 cat names <= 7 letters, 30 mech designations <= 8 characters, lengths set by the battle scene at 24 a side on 1366; stored as born and never re-derived, so a rename wins and the build code is byte-identical (45) with pre-D-45 codes loading the new names. Node 1421/0, 230 of 230, 174 shell ids, DOM 1548/0, browser 518/0 headless, live #selftest 1548/0 in both browsers; new gate 131 walks the lists against the live PROJ-06 arrays; six probes all red. Next: 05-11, the playtest. Previously: Completed D-44 (05-D44) — 16-bit battle-scene art at FFV's level of detail by default (a 24px shaded tabby, a 48px plated walker, an SNES backdrop, an FFV window, every shade a token mix), D-42's art kept as the 8-bit generation, and a 16-bit / 8-bit picker in the scene header whose choice is best-effort under cvm.v1.scene-art and never in state, undo or the build code; a switch keeps every node and place, mid-drag included. 16-bit sprites are 48 / 96 at every size (deferred D-44.1). Node 1404/0, 229 of 229, 174 shell ids, DOM 1530/0, browser 518/0 headless, live #selftest 1530/0 in both browsers; FIGHT_FLOOR 257 -> 262; seven probes, the required five all red in the node tier and all four browser columns. Next: 05-11, the playtest. Previously: Completed D-43 (05-D43) — mechs drawn at twice the cats' size in the battle scene (96/128px against 48/64px, one --scn-big multiplier, pixelated); the shipped three mechs in one row so the shipped scene keeps D-42's height; 24 a side grows the field to six rows, Advance still reachable; a dead mech turns in place clear of its name; the clamp uses each sprite's own box. Node 1399/0, 228 of 228, 170 shell ids, DOM 1524/0, browser 486/0 headless, live #selftest 1524/0 in both browsers; four probes all red. Next: 05-11, the playtest. Previously: Completed D-42 (05-D42) — an FF1-style battle scene as the fight tab's first panel: pixel cats and mechs painted on canvas from the computed tokens, every name real text, dead read from the stored flag, free clamped drags that write nothing and survive a commit mid-drag, places kept best-effort in localStorage under cvm.v1.scene and pruned when a unit leaves, Back to formation by mouse or keyboard. Placement measured at three positions; three picture-only defects fixed; cells hit-test every name. Node 1399/0, 227 of 227, 170 shell ids, DOM 1524/0, browser 470/0 headless, live #selftest 1524/0 in both browsers; check 57 10 -> 12, FIGHT_FLOOR 254 -> 257; eight probes, all red in at least two tiers. Next: 05-11, the playtest. Previously: Completed D-41 part 2 of 2 (05-D41b) — the pool at the top of each side (the reserve drawn through symQty at board size, boxed with the side-kept stepper lines it already held) and pointer drags that call moveToken once per drop. Targets light from App.ops.moveCheck, the op’s own guards with no commit and no router arm, and [S09.14] holds the surface’s answers to moveToken end by end. Refusals are said at the drop through D-39b’s channel and scrolled on screen (a screenshot-only defect). Also: a 6px threshold, Escape cancels, edge autoscroll, and two drags are two undo entries. The reserve has no keyboard path (deferred item 1). Node 1391/0, 225 of 225, 165 shell ids, DOM 1515/0, browser 426/0 headless, live #selftest 1515/0 in both browsers; check 57 8 -> 10, FIGHT_FLOOR 248 -> 254; seven probes, all red in at least one tier. Next: 05-11, the playtest. Previously: Completed D-41 part 1 of 2 (05-D41a) — the conserved per-side reserve and moveToken, one op for every drag the part-two surface will send, below the surface and drawing nothing. Conservation held as a whole-build equality over a 400-move sweep; bounds refuse whole, directionally; the reserve is capped at MAX_RESERVE = 99 and not at the type's authored pair (measured); two moves are two undo entries; the fight and the projection are byte-identical over a full and an empty reserve; the wire stays v1 with a P section, proved by a real pre-D-41 code, and the matrix is at 39 shapes. A pre-amendment surface attempt found uncommitted in main is parked on wip/d41-pre-amendment-drag-ui (d081c3b). Node 1382/0, 222 of 222, 164 shell ids, DOM 1506/0; six probes all red. Next: the second D-41 dispatch (the pool UI and the pointer drag). Previously: Completed D-40 (05-D40) — the pool depletion preview in the action editor: the Cost region now says, live and per pool the cost names, what the side holds, what this cost takes wearing D-30's red mark on the shape, and what would be left, in D-29's notation with the prose on scanned tooltips whose text equals its own accessible name. Per POOL and not per term — [S02] costPools is a projection over an affordability report and not a second walk, so two action-point terms of two SUM to four out of a pool of three; a term naming health, shield or a unit-scope type draws nothing, which is isPoolToken's ruling arriving at a reading. The exceeds-pool sentence is the affordability machinery's own, lifted into costShortSaid so both panes of the dialog call ONE function and row 123 compares them to each other. fgPoolReading was declined on purpose and the reason is at the function: it reads the FIGHT slice against this round's declarations, and an action being authored has not been declared. editorSig gained the side's own tally bag and each type's scope — BOTH already missing, both already drawn by the proposal pane since plan 03.1-07. One fix came out of a screenshot after every number went green: the two pool rows' sentences began at 232px and 252px, so .ae-pool is a two-column grid with .ae-pool-row at display:contents. Node 1341/0 exit 0, 222 of 222, 164 shell ids, DOM 1465/0, browser 374/0 headless, live #selftest 1465/0 in both real browsers with zero errors; DIALOG_FLOOR 138 not moved. Seven probes: six red, and PROBE EF — the sentence re-typed byte-identically — GREEN, recorded as the limit of the shared-sentence claim. Previously: Completed D-38 (05-D38) — the how-to leaves the simulator: a third "How this works" tab beside The board and The fight, holding six cards of displaced prose organised by surface, built into the gate stub WITH ITS WORDS so Layer C reads it under HOWTO_FLOOR 24 (measured 32) rather than being left to Layer A alone. Eleven displacement sites ruled and recorded at the site: five moved whole, six became tooltips on their headings per D-38's named allowance on D-29's channel, two split so the reading stays at its control. BOTH SCREENSHOT DEFECTS REPRODUCED ON THE SHIPPED FILE AND FIXED: the Side chooser's pills were EMPTY because the words lived only in a per-frame write with four early returns above it (they ship in the document now, the live read untouched); and the second panel was a CLOSED <dialog> in normal document flow — .pk and .ae carried display:grid, which beats the user-agent dialog:not([open]) at every specificity, so both sat 660x728 and 1040x716 at document y 3067 on every page, 728px of dead height, with the picker's "Emoji"/"Done" foot showing through the Actions dialog's backdrop. Twelve opener pairs driven as real clicks: every second press blocked by inertness, so two open modals were never reachable — soleDialog() ships anyway because inertness was the only thing holding it. Cells 21c and 25b2 were propped up by that defect and are turned in the open with recorded reds; row 103 turned 2 -> 3 data-vw controls. Node 1336/0 exit 0, 216 of 216, 160 shell ids, DIALOG_FLOOR 138 (measured 179, arithmetic in its note), FIGHT_FLOOR 248 unmoved; browser 314/0 headless. Six mutation probes, all red. Previously: Completed D-37 (05-D37) — the unit popup: clicking a unit on the battlefield at rest opens [S06.15]'s #fg-unit for that unit, holding every value it has (health, shield, every unit-scope tally INCLUDING the ones at zero, and the dead marker) in D-29 symbols with scanned tooltips, each ruled through the shipped ops into the round's hand record. D-36's per-reading nudge ON THE BATTLEFIELD is removed on D-37's own instruction, with every paragraph that argued it rewritten in place; the team-resource click is untouched. A fixed box in the shell and NOT a <dialog> (a modal is centred and has no elsewhere; a sibling of #app is outside the fight harvest) — so row 92c drives it open before harvesting. The rows are BUILT, so the focus contract is a fingerprint of the side, the unit and the token LIST; probe G restored the rebuild and four browser cells went red on the node-identity clause alone. The shape has two jobs separated in TIME: at rest it opens the popup, armed it retargets. D-00d driven: hp to zero leaves the unit standing. Deferred items 17 and 18 CLOSED with the resolution named. Node 1336/0 exit 0 (unmoved — no op, no state key, no codec change), 210 of 210, 157 shell ids, DIALOG_FLOOR 138 and FIGHT_FLOOR 248 unmoved; browser 294/0 headless. Check 57's allowlist turned in the open 4 -> 6. Six mutation probes, all red, artifact byte-identical after. Previously: D-36 (05-D36) — click a resource on the fight tab to rule on it: five hand-ruling writers added in [S05]'s own group (the shield nudge setFightShield reserved by name, the pool pair, the tally pair reusing tallyOwner), the ruling record given a side-scope shape with a null unit and [S06.8] the arm that names the faction for it, [S06.9]'s marker widened to a unit's tallies, [S06.14] a new render sub-region moving ONE STATIC control to whatever reading was pressed (05-10's focus finding, driven), [S07.5] the open/rule/dismiss arms plus three document listeners, [C14.6] the .fgn- rules at position:fixed with the offsets published as --fgn-x/--fgn-y. Two defects found by driving: a real centre click on a lit shape lands on a reading (cells 12b/12c red — the separation is now in time as well as in space) and the fixed box did not follow a scroll (found in a screenshot). Node 1336/0 exit 0, 207 of 207, 153 shell ids, DIALOG_FLOOR 138 and FIGHT_FLOOR 248 unmoved; browser 286/0 headless (+26 through 26f). Check 57's style allowlist turned in the open 2 -> 4. Five mutation probes, all red, artifact byte-identical after. Previously: D-35c (05-D35c) — the round rules made operable: the amount bound to its rule (160px -> 0px), the dangling half-row gone, an Add under the list and a Remove on every row, ten pills grouped into five columns under four words written once, and the symbolic reading given a column of its own. The op did not move. Node 1327/0 exit 0, 204 of 204, 145 shell ids; browser 262/0 headless (+25a, +25b2). Two probes found nothing and both became commits. Previously: D-35 PART 2 of 2 (05-D35b) — the range on the token editor, the round rules as an editable list in the build view, the fight's "Each round" reading with no control in it, and the what-changed reading walking the tally bags so a decay is visible on Advance. FIGHT_FLOOR re-derived 132 -> 248. Both D-35 dispatches are done; the phase's remaining work is 05-11, the playtest
Resume file: None
