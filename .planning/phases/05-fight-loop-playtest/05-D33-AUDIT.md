# D-33 — Design audit, with eyes on the real artifact

**Date:** 2026-08-30. **Authority of the request:** the developer, verbatim — *"Better. Dramatically
improve the usability, presentation and polish."* **What this document is:** the audit half of
D-33's two-step. It changes nothing in `cats-vs-mechs.html`.

**How it was taken.** Real Chrome (`channel: 'chrome'`), headless, driven by Playwright 1.62.1
against `file://`, at **1920×1080** and **1366×768**, both viewports, every surface. Every state was
reached by pressing shipped controls or dispatching shipped ops. One student token type (**Rage** —
violet hexagon, 🔥, per-unit scope) and one student action (**Pounce** — a maxed 4-cost / 4-need /
4-change action) were authored so student content appears in every shot. Three rounds were declared
and advanced. Zero page errors, zero console errors, in every run.

**Screenshots** (referenced by filename throughout) live in
`C:\Users\alexy\AppData\Local\Temp\claude\C--Projects-GameDesignSkills-GameFeelDirectionCourse-CatsVsMech\6955a1c2-1679-4a99-be89-fd3975b5abb0\scratchpad\d33\`.
`w1920-*` and `w1366-*` are full viewports; `zoom-*` are 3× device-scale crops of single elements.
Driver scripts (`shots.mjs`, `measure.mjs`, `probe2.mjs`, `zoom.mjs`, `hov.mjs`) are beside them and
are re-runnable.

---

## 1. Verdict

This is a carefully-reasoned artifact whose reasoning has outrun its layout. The vocabulary is
right — the token system, the symbol notation, the state/input split, the refusal to adjudicate —
and each region, read alone, is defensible and documented to a standard most shipped software never
reaches. Read together on a screen, the seams show: the artifact currently has **five internal
scrollers that clip load-bearing content with no visible affordance of any kind** (measured: zero
scrollbar-styling rules in the file, and the default overlay scrollbars never appear in a
screenshot), and what they clip is not decoration — at 1920×1080 the spoken-for resource preview
that D-27 built the entire round loop around is 92px below the fold of a 238px-tall container while
the topbar 700px above it simultaneously displays a *contradictory* figure for the same pool; three
of nine cats are absent from both the battlefield and the action picker; at 1366×768 a past-round
card shows its title, a filler sentence, and nothing else. Beyond the clipping, the surface has one
colour doing four jobs — `--accent` is hover, focus, "declared", and "lit as a target", byte-for-byte
the same 2px outline — and **not one `transition` declaration exists anywhere in the stylesheet**, so
every state change in the artifact snaps. None of this is a design that was got wrong; it is
sixteen plans and seven redirects of correct local decisions that were never once looked at
together at 1366×768. The good news is that the fixes are almost all subtractive or token-level, the
design language needed to make them already exists in the file, and the single highest-value change
(move one element out of one scroller) is about four lines.

---

## 2. Findings

Each finding: **WHERE** (screenshot + element) · **WHAT** (as measured) · **CHANGE** (concrete, with
the section marker that owns it) · **WHY** (for a room) · **GATE** (what it costs the harness).

Gate vocabulary: the six harvest floors are `SUITE_FLOOR = 1186`, `DIALOG_FLOOR = 138`,
`PICKER_FLOOR = 84`, `SHARE_FLOOR = 0`, `FIGHT_FLOOR = 132`, `PROPOSE_FLOOR = 23`
(`tests/selftest-node.cjs`). **Any change to a rendered string — including a `title` tooltip, per
D-29 — moves a floor.** Geometry cells are the checks that read positions, containment and the vh
dials.

> **A standing warning for every implementer of this spec:** the no-verdict gate bans
> `counter` / `balanc` / `rating` as *substrings, whole-document*, and forbids `won` / `winning` /
> `best` / `defeated` outright. That kills `encounter`, `counterpart`, `countermeasure` and
> `balanced` in prose, comments and tooltips alike. Every new string proposed below has been checked
> against that list.

---

### P1 — dramatic usability / presentation wins

---

#### P1-1 · The reading the whole round loop is built on is hidden, and the topbar contradicts it

**WHERE** `w1920-11-fight-declared.png` (three cats declared; topbar at y=124 reads *"Cats · Action
points · 0 of 3 spent · 3 left to spend"*) versus `zoom-state-scrolled.png` (the real reading, found
only after scrolling an unmarked container). Elements: `.fg-team` / `.fg-res` inside `.fg-sides`
(owned by **[S06.7]**, laid out by **[C14.1]**) and `#pool-cats` / `#pool-mechs` in `#topbar`
(**[C03]**).

**WHAT** With three Cats declared at 1 AP each, `.fg-res` reads **"Action points · 3 of 3 spoken for
· 0 left to spend"** and sits at **y=896**, inside a `.fg-sides` scroller whose visible box is
y=566–804 (`clientHeight` 238, `scrollHeight` 364). It is **92px below the bottom edge**. At the
same instant, 770px higher up the screen, the topbar says **"0 of 3 spent · 3 left to spend"** — the
same pool, the same "…left to spend" sentence ending, a different number, and it is the wrong one
for what the student just did. The correct reading is invisible; the incorrect-looking one is the
only one on screen. D-27 item 3 — *"resources deplete as a live preview while declaring"* — is
implemented and then hidden by a container.

**CHANGE** Two moves, in **[S06.7]** / **[C14.1]**:
1. Take `.fg-team` **out of** `.fg-sides` and make it a sibling of the scroller, pinned above it
   (D-27 addendum 1: *"team resources ABOVE the action picker"* — it is above it in DOM order today
   but only reachable by scrolling past nine unit cards). The scroller then contains only the
   battlefield cluster, which is the thing that can honestly be scrolled.
2. Resolve the two readings into one. Either make the topbar's `.fg-pool` render the *same*
   spoken-for figures the state card renders, or strip the topbar's pool figures down to the round
   number alone and let the state card own the pool outright. The second is cheaper, removes the
   topbar reflow in P2-2 as a side effect, and is the recommendation.

**WHY** This is the interaction the developer redesigned the fight around. In a workshop the
instructor clicks an action and says "watch the pool" — and today the pool the room is watching does
not move, while the one that does move is off-screen inside a box nothing suggests can scroll.

**GATE** Moving `.fg-team` out of `.fg-sides` will break any geometry cell asserting containment.
Changing the topbar's pool strings moves `FIGHT_FLOOR` (132) and likely `SUITE_FLOOR`. Budget a
floor re-derivation in the same turn.

---

#### P1-2 · Nine units, six shown — `.fg-sides` clips a third of the roster with no affordance

**WHERE** `w1920-10b-fight-fresh-bottom.png` and `w1920-16-hover-advance.png`: the battlefield shows
Cat 1–6, the action picker shows rows Cat 1–6, and the heading above both says **"9 of 9 still
standing"**. `zoom-state-scrolled.png`: scrolling the container cuts the *top* row's name plates off
instead, leaving orphaned "Health ▪▪▪ Rage ●●" lines belonging to nobody.

**WHAT** Measured in the DOM: `#decl-cats` contains **9** `.fg-row` and `#state-cats` contains **9**
`[data-fg="bf"]`. Measured on screen:

| viewport | region | clientHeight | scrollHeight | hidden |
|---|---|---|---|---|
| 1920×1080 | state `.fg-sides` | 238 | 364 | **126px** |
| 1920×1080 | input `.fg-sides` | 346 | 517 | **171px** |
| 1366×768 | state `.fg-sides` | 169 | 364 | **195px** |
| 1366×768 | input `.fg-sides` | 246 | 517 | **271px** |

The caps are `.fg-sides{max-height:32vh}` and `.fg-area--state .fg-sides{max-height:22vh}`
(**[C14.1]**, ~line 2227 / 2297). There is **no scrollbar styling anywhere in the file** — a
recursive scan of every CSS rule, nested rules included, returns **zero** `::-webkit-scrollbar` and
**zero** `scrollbar-color` declarations — so Chrome's overlay scrollbar is the only signal, and it
does not render until a pointer is already inside the box. Nothing on screen says there is more.
Compounding it: the side name ("Cats") and "9 of 9 still standing" are *inside* the scroller, so
scrolling to find Cat 9 loses the label that says which side you are looking at.

**CHANGE** In **[C14.1]**:
1. Add a shared scroll affordance (see also P3-3): `scrollbar-width: thin` +
   `scrollbar-color: color-mix(in srgb, var(--ink-faint) 60%, transparent) transparent`, and a
   bottom edge fade using a `linear-gradient` background (no `url()`, no SVG).
2. Move `.fg-side-head` and `.fg-standing` **out** of the scroller so the label is permanent.
3. Re-derive the two vh dials against the real content: nine 3-tally cats at 1080 need ~360px, not
   238. `22vh` was measured against a different card height. The dials are already documented as
   REHEARSAL DIALS — this audit is that rehearsal, and the measurement is in the table above.

**WHY** Three cats that cannot be seen cannot be declared for, and the student has no way to know
they exist. An instructor demonstrating on a projector will simply never scroll an unmarked inner
container.

**GATE** Geometry cells reading the vh dials and the containment of `.fg-side-head`. No floors —
nothing here changes a string.

---

#### P1-3 · Both authoring dialogs run past the fold and the way out is below it

**WHERE** `w1366-03b-tokpicker-student.png` (clipped mid-"Name"; Shape, Colour, Emoji and **Done**
all below the edge) · `w1366-05-actedit-maxed.png` (clipped through the **first cost row** — every
one of D-32b's dense terms is below the fold) · `w1920-03b` / `w1920-05` (same defect, less severe).

**WHAT**

| dialog | width | scrollHeight | clientHeight @1080 | @768 | placement |
|---|---|---|---|---|---|
| `#tok-picker` | 660 | 1466 | 1038 (**428 hidden**) | 726 (**740 hidden**) | top-pinned, `margin-top: 20px` |
| `#act-edit` | 1040 | 1087 | 1038 (49 hidden) | 726 (**361 hidden**) | top-pinned, `margin-top: 20px` |
| `#share` | 660 | 432 | fits | fits | centred, `margin-top: 323px` |
| `#reset-ask` | 520 | 294 | fits | fits | centred, `margin-top: 392px` |

At 1366×768 — an extremely common projector resolution — the action editor spends its whole visible
height on a four-line explainer, a Side toggle, a four-row list, two buttons and a Name field, and
shows **none** of the thing the developer spent D-32 asking for. The `Done` and `Proposal` buttons
are unreachable-looking. Both dialogs `overflow-y: auto` at `max-height: calc(100% - 40px)`, so they
do scroll — invisibly, per P1-2's measurement.

**CHANGE** In **[C07]** (picker) and **[C12]** (editor): make the dialog a
`display: grid; grid-template-rows: auto 1fr auto` — a fixed header block, one scrolling body, and a
**sticky footer** carrying the action row with a `border-top: 1px solid var(--line)`. The scroll then
lives on the body only and `Done` is always on screen. Apply the P3-3 scroll affordance to the body.
Then pick **one** vertical placement convention for all four dialogs; `#reset-ask` is the reference —
it is the best-composed surface in the file (`w1920-09-reset-ask.png`) and everything else should
converge on it.

**WHY** A student who cannot see `Done` does not know the dialog is finishable. An instructor
demoing action authoring at 1366 cannot show the feature at all without discovering an invisible
scroll live, on stage.

**GATE** No strings move — `DIALOG_FLOOR`, `PICKER_FLOOR` unaffected. Geometry cells that read the
dialogs' child order or the position of the button row will move.

---

#### P1-4 · At 1366 a past-round card shows a title, a filler sentence, and nothing else

**WHERE** `w1366-13-fight-3rounds.png`. Compare `w1920-13-fight-3rounds.png`, where the same cards
manage eight unit lines.

**WHAT** `.ld-row{max-height: 22vh}` with `@media(max-height:820px){.ld-row{max-height:15vh}}`
(**[C14.2]**, ~line 2481/2512) → a **115px** card at 768. Inside it: the round number (~26px), a
two-line note *"The board as it stood when round N began."* (~48px), and then the word "Cats", cut
through its cap-height. **Zero board readings survive.** The block's own banner states the
acceptance criterion — *"A card at 15vh still shows its round number, its note and the first
readings of its board"* — and measured at 768 with three rounds resolved, it does not. Separately,
the leftmost card bleeds off the left edge of the lane with no padding and no gradient (visible in
the same shot: the text reads *"rd as it stood when round 1"* starting at x=22), because `.ld-list`
auto-scrolls to the newest and nothing marks the scrolled-past end.

**CHANGE** In **[S06.8]** / **[C14.2]**, in this order:
1. **Print the note once, not per card.** It is byte-identical on every card; three cards spend
   ~144px of a 345px lane saying the same sentence three times. Move it under `#ledger`'s `h2` as a
   single lane caption. That returns ~48px of a 115px card — from zero readings to roughly four —
   without touching the dial.
2. Pair it with **P2-10** (drop the `0×` zero-tallies), which roughly halves each remaining line.
3. Only then re-derive the 15vh dial, against the new content, and record the new number.
4. Add a left/right scroll-edge fade on `.ld-list` in the same `linear-gradient` idiom as P1-2.

**WHY** D-28's whole instruction was *"earlier rounds should be a full lane above showing the past
state and actions selected."* At the resolution most workshop laptops run, the lane currently shows
neither.

**GATE** Moving the note changes per-card word counts → `FIGHT_FLOOR` (132) and the Layer-C fight
harvest both move. Budget the re-derivation. Removing the `0×` lines (P2-10) moves them again — do
both in one turn and re-derive once.

---

#### P1-5 · The ledger's empty state is a heading over 1,180px of nothing

**WHERE** `w1920-10-fight-fresh.png`, y=302–418.

**WHAT** At round 1 `#ledger-list` is an **empty `div`** (confirmed in the DOM: `innerHTML` is the
`h2`, an empty `.ld-list`, and a `.ld-now`). The heading "Earlier rounds" sits at x=160; the
"What changed since the previous round" panel floats at x=1344; between them is 1,180px of empty
page. The `.ld-now` panel has no border and no background while its sibling `#fightbar` below it is
a full card — two adjacent regions of equal rank framed two different ways.

**CHANGE** In **[S06.8]**: render **one placeholder card** into `#ledger-list` at round 1 — same
`.ld-row` geometry, `border-style: dashed`, one line: *"Round 1 will appear here once you advance."*
And give `.ld-now` the `.ld-row` card treatment so the lane reads as one row of cards rather than a
card row plus a floating paragraph.

**WHY** Empty states are where a teaching artifact teaches. A student who starts a fight should be
able to read, from the screen alone, that this strip is where history will accumulate. Right now
round 1 shows a label with nothing under it, which reads as a rendering failure.

**GATE** Adds one rendered string → `FIGHT_FLOOR` moves. Adding a border/background to `.ld-now`
costs nothing.

---

#### P1-6 · The destructive control outranks the commit control, and both sit above what they act on

**WHERE** `w1920-16-hover-advance.png` / `w1920-10b`, the `#fight-input` header row.

**WHAT** *"Advance the round"* and *"Reset this fight"* share a row at the **top-right** of
`#fight-input`, **above** the nine picker rows they act on. Both are 18px `.brd-btn`. *"Reset this
fight"* carries the pink danger treatment, making the **destructive** control the most saturated
object in the card; *"Advance the round"* — the one action the entire round loop exists to reach —
is a plain outline pill indistinguishable from "Undo" or "Share". A third element, the dim note
*"Nothing resolves until you advance."*, competes for the same row.

**CHANGE** In **[S06.7]** / **[C14.1]**:
- Move the pair to the **bottom** of `#fight-input`, after the rows, so the commit follows what it
  commits.
- Give Advance a filled primary treatment derived from existing tokens —
  `background: color-mix(in srgb, var(--accent) 22%, var(--panel)); border-color: var(--accent)` —
  so it is the one filled control on the surface. **No new hex.**
- Demote "Reset this fight" to the standard outline weight, separated by a `gap` and set apart at
  the far end. It stays fully labelled — UX-02 is untouched.
- Fold *"Nothing resolves until you advance."* directly under the Advance button as its caption
  rather than beside it.

**WHY** In a live demo the instructor's mouse travels to the brightest thing in the region. Today
that is the button that throws the fight away.

**GATE** Geometry cells asserting Advance's position within `#fight-input`. No strings move if the
note is repositioned rather than rewritten.

---

#### P1-7 · Retarget feedback lands 300px above the press, and one valid target is clipped in half

**WHERE** `w1920-12-fight-retarget-lit.png`.

**WHAT** *"Change target"* is pressed at **y=1029**, in the input area. The three lit target cards
render at **y=660–800**, in the state area — above the press and 300px away. Worse: the third target,
**Mech 3, is cut in half** by the state `.fg-sides` clip (P1-2), so the retarget flow can hide a
legal choice. Each lit unit carries the full sentence *"Pick this one."* — three repetitions of an
instruction that belongs in one place. The "Change target" button itself does not change: nothing
about it says it is now armed, and nothing says pressing it again cancels.

**CHANGE** In **[S06.7]** / **[S07.5]**:
1. **Mark the armed row in place.** The declaration line that owns the retarget gets an `--accent-2`
   tint and the button relabels to *"Choose a target"* while armed. Feedback at the press.
2. On arming, `scrollIntoView({ block: 'nearest' })` the first lit node so the lit set is never
   clipped.
3. Replace the three *"Pick this one."* repetitions with a single instruction on the armed row and a
   compact lit treatment (accent-2 border + fill) on the units themselves.

**WHY** This is the flow D-27's addendum specifically designed, and it is the one the room will be
watching. If the response to a press appears outside the eye's landing zone, the instructor has to
narrate it — which is the tool failing to teach.

**GATE** Removing three strings and adding one moves `FIGHT_FLOOR`. Geometry cells if the lit
treatment changes class names.

---

#### P1-8 · One colour carries four meanings, and nothing in the file animates

**WHERE** `zoom-row1.png` (a focused Slash and a declared Slash are the same object) ·
`w1920-03b-tokpicker-student.png` (the merely-*focused* "New type on each unit" reads as selected) ·
`w1920-12` (lit targets, declared actions and hovered buttons all in accent).

**WHAT** Measured by recursive scan of every CSS rule, nested rules included:
- **17 `:hover` rules**, and every single one of them does the same thing:
  `border-color: var(--accent)` (six also swap `color`). Hover is one gesture, everywhere.
- `:focus-visible` = `outline: 2px solid var(--accent); outline-offset: 2px`.
- `.fg-act--on` (an action **declared**) = `outline: 2px solid var(--accent); outline-offset: 2px` —
  **byte-identical to the focus ring**.
- Lit retarget targets also render in accent.
- **`transition` declarations found in the entire stylesheet: 0.** Computed `transition-duration` on
  `.brd-btn`, `.fg-act`, `.vw-btn`, `.bf-unit` and `dialog` is `0s`. The only motion in the artifact
  is two entry keyframes (`ld-in` on `.ld-row--in`, and `.tok--in`). Every hover, every selection,
  every disable, every dialog open, snaps.

**CHANGE** In **[C00]** / **[C01]**, all derived from existing tokens with `color-mix()` — **no new
hex**:

| meaning | treatment |
|---|---|
| hover | background lift + `border-color: color-mix(in srgb, var(--accent) 45%, var(--line))` |
| selected / declared | `border-color: var(--accent)` + `background: color-mix(in srgb, var(--accent) 18%, var(--panel))` — a **fill**, not an outline |
| focus | `outline: 2px solid var(--accent); outline-offset: 3px` plus a 1px inner `--bg` ring so the ring survives over any fill |
| lit as a target | `--accent-2`, matching the removal-badge channel |

Then one shared transition on the control classes:
`transition: border-color 120ms ease, background-color 120ms ease, color 120ms ease, outline-color 120ms ease`,
inside the `@media (prefers-reduced-motion: reduce)` guard the file already uses for `.ld-row--in`.

**WHY** This is the cheapest large perceived-quality gain available, it is the literal definition of
"polish", and it fixes a real comprehension failure: a keyboard user today cannot tell *"my focus is
here"* from *"this action is declared"*, because on screen they are the same pixels.

**GATE** **None.** Colour and motion only; no markup, no strings, no geometry. This is the safest
finding in the document and should be done first.

---

### P2 — consistency and hierarchy

---

#### P2-1 · The page title is misaligned with every control below it, and the product name is printed twice

**WHERE** `w1920-01-board-fresh.png` / `w1366-01-board-fresh.png`, the top 200px.

**WHAT** Measured: `h1` sits at **x=342** (1920) and **x=65** (1366). `#topbar`, `#views` and
`#board` sit at **x=160** and **x=22**. The difference is 182px and 43px respectively, and the cause
is documented: `.shell` is capped at `--maxw` (1280px) while `#topbar` and `#board` deliberately
break out to 1600px — a breakout `.shell-head` never received. Separately, **"Cats vs Mechs" is
rendered twice within 130px vertically**: once as `.shell-head h1` (32px) and once as `.brd-brand`
(18px, in the sticky bar).

**CHANGE** In **[C02]**: give `.shell-head` the same width breakout `#topbar` and `#board` carry, and
delete one of the two brand renderings. Deleting `.brd-brand` and keeping the `h1` is the cleaner
read; deleting the `h1` block entirely recovers ~90px of above-the-fold height, which the fight tab
badly wants. Either way the page stops having two left edges.

**WHY** A misaligned title is the first thing a designer's eye lands on and the first thing an
audience registers as "unfinished". It costs four lines to fix.

**GATE** Deleting `.brd-brand` removes a rendered string → `SUITE_FLOOR` and the board harvest move.
The alignment fix alone costs nothing but may move geometry cells reading `h1`'s box.

---

#### P2-2 · The topbar reflows into two and three ragged rows, and grows when a fight starts

**WHERE** `w1366-01-board-fresh.png` (two rows; brand orphaned mid-left, "Start over / Reset"
orphaned on row 3 at far right) · `zoom-topbar.png` (fight mode, 1920, two rows with a large void on
the left of row 2) · `w1366-13-fight-3rounds.png` (three rows).

**WHAT** `#topbar` height: **64px → 109px** at 1920 and **109px → 161px** at 1366 the moment a fight
starts, because the round/pool readout is inserted inline into the same flex cluster. `[S08]`
republishes `--topbar-now` so nothing structurally breaks — but the bar visibly re-lays itself out
mid-demo, and at 1366 the brand and the Reset button both end up orphaned on their own lines with
large voids beside them.

**CHANGE** In **[C03]**: give `.brd-cluster` an explicit two-group layout (lifecycle group | tools
group) that holds its row count at both widths. And **reserve the round/pool slot permanently** so
the bar does not change height on `startFight`. Note that adopting P1-1's recommendation — moving
the pool figures out of the bar entirely — removes the growth at the source and is the cheaper path.

**WHY** A control bar that reorganises itself when the demo starts is the least reassuring thing a
teaching tool can do in front of a room.

**GATE** Geometry cells reading `#topbar` height and `--topbar-now`. No strings if only layout
changes.

---

#### P2-3 · Five label-plus-button pairs read as ten controls

**WHERE** `zoom-topbar.png`.

**WHAT** The bar renders *"Token appearance | Tokens"*, *"Action rules | Actions"*,
*"Build code | Share"*, *"Start over | Reset"*, *"The fight | Start the fight"*. Every label is the
**same 18px** as the button beside it, differing only in colour (`--ink-dim` vs `--ink`). Ten pieces
of text to scan to find five buttons.

**CHANGE** In **[C03]**: restyle `.brd-tokedit-label` with the `.eyebrow` treatment **[C02]** already
defines and the dialogs already use (12px, uppercase, `--accent-2`, `letter-spacing: 1px`), so the
label reads as a caption over its control rather than as a peer of it. The buttons keep their
permanent visible text labels — **UX-02 untouched**, and no string changes at all.

**WHY** Projector legibility is about how few things the eye must reject before it finds the one it
wants.

**GATE** **None** if the labels are restyled rather than removed. If any label is deleted,
`SUITE_FLOOR` moves.

---

#### P2-4 · "Start the fight" is a dead cell for the whole fight, and there is no visible way to end one

**WHERE** `w1920-10-fight-fresh.png` onward — the button stays greyed for every subsequent shot.

**WHAT** `#fight-start` is `disabled` for the entire duration of a fight while occupying prime bar
space, and the `endFight` op exists in the dispatch and is reachable. The only exits a student can
see are "Reset this fight" (buried inside `#fight-input`) and reloading the page.

**CHANGE** In **[S06.7]** / **[S07.5]**: make the one control a lifecycle toggle — *"Start the
fight"* / *"End the fight"* — instead of a permanently disabled button. This moves *toward* the
standing never-disable rule rather than away from it: D-27's disable overrule is explicitly scoped
to fight **declaration**, and this control is not a declaration.

**WHY** A disabled control with no visible alternative teaches a student the tool is stuck.

**GATE** Adds/changes a string → `SUITE_FLOOR` + `FIGHT_FLOOR`. Also touches check 95's never-disable
control list, which must be turned in the open per the 03.1-04 precedent.

---

#### P2-5 · Four dialogs, two placement conventions, four widths, two textarea treatments

**WHERE** `w1920-03b` · `w1920-05` · `w1920-07-share-copy.png` · `w1920-08-share-load.png` ·
`w1920-09-reset-ask.png`.

**WHAT** Measured (full table under P1-3): two dialogs top-pin at `margin-top: 20px`, two centre at
`margin-top: 323px` / `392px`. Widths are 660 / 1040 / 660 / 520. Within the *same* dialog,
`#share-code` renders with a 2px accent border and `#sh-load-field` with a 1px `--line` border plus a
visible native resize grabber. Switching panes resizes and re-centres `#share` (y 323→371, height
434→332) instantly, which reads as a flicker. The copy pane's buttons are split across two rows with
two different alignments — `Copy` alone on the left, `Paste a build code` + `Done` right-aligned
below — leaving the dialog's primary action as its least prominent element.

**CHANGE** In **[C07]** / **[C12]** / **[C13]**: one dialog frame — identical padding, identical
eyebrow+title+lede header block, identical footer row (P1-3's sticky footer), identical field
styling, one placement rule. `#reset-ask` is the reference implementation. Give the dialog a
`transition` on `opacity`/`translate` (P1-8's ramp) so pane switches settle instead of jumping. Put
`Copy` in the footer row with the others and give it P1-6's primary fill.

**WHY** Four surfaces that solve the same problem four ways is exactly the "eleven plans' worth of
accreted regions" the developer asked to be resolved into one designed tool.

**GATE** **None** — no strings move.

---

#### P2-6 · The proposal pane is prose where the rest of the artifact is symbols

**WHERE** `w1920-06-proposal.png`.

**WHAT** Eight consecutive sentences, each opening with the same word:

```
Pounce costs 2 Action points of 3. Enough to spend.
Pounce costs 1 Rage. This report has no figure for that pool.
Pounce costs 1 Shield. This report has no figure for that pool.
Pounce costs 1 Health. This report has no figure for that pool.
Pounce needs 1 Rage of 0. Requirement not met.
Pounce needs 2 Health of 27. Requirement met.
Pounce needs 2 Action points of 3. Requirement met.
Pounce needs 1 Shield of 0. Requirement not met.
```

The distinguishing token is buried mid-sentence in every line; the same refusal sentence is printed
verbatim three times; and the Changes rows render *"target Health · [-2]"* with a hyphen-minus, 40px
away from a terms pane that renders the identical fact as D-30's red badge on the token's own shape.
The Target chip row also runs Cat 1…Cat 9, Mech 1, Mech 2, Mech 3 as one flat wrap with "Mech 3"
orphaned on a second line and no marker at the side boundary.

**CHANGE** In **[S06.5]**: render cost and requirement reports through the **same `[S06.12]` symbol
machinery** the fight picker already calls — `−`badge + the token's own shape + the shortfall — and
move the sentence into the `title`, which is D-29's own pattern. Collapse the three identical
"no figure for that pool" lines into one that names all three tokens. Drop the repeated action name
to a single heading. Group the Target chips by side with a label each, matching the Caster row.

**WHY** A student who has just learned to read `−▲▲` in the picker should not have to re-learn
"costs 2 Action points" one dialog over. One notation, one artifact.

**GATE** `PROPOSE_FLOOR` (23) certainly moves, and per D-29 the harvest must read the new `title`
text, so both the pane's floor and the tooltip harvest need re-deriving. **Flag to the developer
first:** D-29's letter scopes symbol notation to *"everywhere the fight surface prices something"*.
This proposes extending it to the authoring surface. That is an extension of their decision, not a
relitigation of it, but it is theirs to confirm.

---

#### P2-7 · Every dense term row has a 270px void through its middle

**WHERE** `w1920-05-actedit-maxed.png`, the twelve `.ae-term` rows.

**WHAT** Per row: the symbol reading sits at x≈466–500, the token chip group runs x=568–1110, and the
amount input sits at x=1382–1455. That is a **~270px gap between the chips and the amount they
belong to**, repeated on twelve rows, plus a ~68px gutter between the reading and the chips. The
symbol reading — the row's actual answer — is the smallest, dimmest cell in the row. Nothing
separates term 1 from term 2 from term 3, so a four-term list reads as an undifferentiated stack of
identical chip rows. `None`, the first chip, is the only way to clear a term and nothing marks it as
such.

**CHANGE** In **[C12]**: make `.ae-term` a grid — `grid-template-columns: 110px 1fr 84px` — so the
amount sits immediately after the chips and the reading gets a real column. Add a 1px `--line` rule
between rows (or a `color-mix` zebra) so the four terms are countable. Lift the symbol reading to
the same 18px scale as the chips. Set `None` slightly apart from the token chips with a gap, since
it is a different kind of choice.

**WHY** D-32b's whole request was density. A row that is 40% empty is not dense; it is a table that
lost its middle column.

**GATE** Geometry cells reading the terms pane. **[C12]**'s own 610px cap comment (~line 714,
recorded under D-32) must be re-derived if the row's internal widths change.

---

#### P2-8 · Selection ticks are jammed against their labels, or 940px away from them

**WHERE** `w1920-05` (`Cats✓`, `Action points✓`, `Rage✓`) · `zoom-row1.png` (`Slash−✓`) ·
DOM (`Marked dead✓`) · `w1920-05` again, where `.ae-item`'s tick renders at x=1438 against a name at
x=477.

**WHAT** Two opposite failures of the same convention: on chips and side buttons the tick has **no
separator at all** and collides with the last letter; on full-width list rows it is pushed 940px away
from the word it modifies, which at projector distance reads as an unrelated mark.

**CHANGE** In **[C07]** / **[C12]** / **[C14.1]**: give `.fg-check` and its siblings a
`margin-inline-start`, and on list rows move the tick to the **left** of the label so it travels with
what it marks. `textContent` is unchanged in both cases.

**WHY** Small, but it is the kind of thing that reads as care or its absence from twenty feet.

**GATE** **None** — spacing and order only, no string change.

---

#### P2-9 · Two list designs, both spending a full dialog width on a single word

**WHERE** `w1920-03b-tokpicker-student.png` (picker: 600px-wide bars carrying a 20px swatch and one
word; the "Dead marker" row is clipped mid-height with a hard edge) · `w1920-05-actedit-maxed.png`
(editor: 990px-wide bars carrying one word and nothing else).

**WHAT** Two list components solving the same problem — "pick one of N named things" — with different
markup, different row content, different selection markers, and both consuming so much height that
neither list plus its editor fits a viewport (P1-3). The picker's list additionally clips its last
row through the middle of the row's box, which reads as a rendering fault rather than as an
invitation to scroll.

**CHANGE** In **[C07]** / **[C12]**: one list component — a wrapping grid of ~200px cells, each
carrying `[tick] [swatch or symbol] [name]`. Both lists then fit above the fold, both read as the
same control, and P1-3's height problem is halved before the sticky footer is even added.

**WHY** Consistency between surfaces is the developer's stated goal, and this is the clearest case
of two surfaces answering one question differently.

**GATE** Geometry cells if any check reads list row height or the list's scroll state. No strings.

---

#### P2-10 · Every past-round line spends half its ink saying "zero"

**WHERE** `w1920-13-fight-3rounds.png` — every unit line in every ledger card reads
`Cat 1 ▪▪▪ 0×▪`.

**WHAT** With no shield allocated, each unit line still renders a `0×` plus the shield token. Eight
lines per card, three cards, on the region that P1-4 shows has no height to spare.

**CHANGE** In **[S06.8]** (using **[S06.12]**'s notation as-is): omit a tally that is zero from a
past-round reading. A `0×` against an empty pool is not a reading a student needs, and it is the
single change that buys the lane its board content back at 768.

**WHY** It is the difference between a history card that shows history and one that shows the word
"zero" nine times.

**GATE** `FIGHT_FLOOR` and the Layer-C fight harvest both move. Do it in the **same turn** as P1-4
and re-derive once.

---

#### P2-11 · A labelled empty box on the battlefield

**WHERE** `w1920-13-fight-3rounds.png` / `w1920-16-hover-advance.png`, the Mech 1 card: it reads
**"Mech 1 / Health"** with nothing after the word.

**WHAT** At zero health and zero shield the unit renders its `Health` label with no tokens beside it.
`[S06.7]`'s own banner argues at length against showing a student a labelled empty box; the rule is
simply not applied one region over, in `[S06.11]`.

**CHANGE** In **[S06.11]**: when a tally is zero the label goes with it; when a unit is at zero of
everything, draw the zero explicitly (or surface the dead-marker affordance) rather than leaving a
naked label.

**WHY** "Health" followed by nothing is the exact ambiguity the fight tab exists to remove — is that
zero health, or is the tool broken?

**GATE** `FIGHT_FLOOR`.

---

#### P2-12 · The projection sidebar occludes live controls, with no scrim, no title and no way out

**WHERE** `w1920-14-fight-projection.png` · `w1366-14-fight-projection.png`.

**WHAT** The panel is a plain overlay. At 1920 it covers `#topbar`'s Share and Reset and the whole of
`.ld-now`; at 1366 it covers Actions, Share, Reset, `.ld-now` **and** the Mechs column of the round
state — 27% of the viewport width. It has **no header of its own** (it begins abruptly with the word
"Cats"), **no close control** (the only dismissal is the toggle 1,000px away at top-left), no
shadow, and no scrim, so page text bleeds against its edges. Its content clips at the bottom edge
mid-line (*"Action points: 0 spent, 3 left"* cut through at y=918) — the fifth invisible scroller.

**CHANGE** In **[C15]** (`.pv-` block): give the panel a header row carrying its own name and a
**text-labelled** "Close" button (UX-02: never an icon), a `box-shadow` and a
`color-mix`-derived scrim behind it, a top offset that clears `--topbar-now`, and the P3-3 scroll
affordance. At ≤1366, make it push the fight region rather than overlay it, or narrow it.

**WHY** PROJ-05 is satisfied by "one press away". It is not satisfied by a panel that hides the
controls a student needs to press next.

**GATE** Adds a "Close" string → `SUITE_FLOOR`. The `#strip` fight-placement geometry cells (103b and
kin) move if the offset changes — turn them in the open, as D-28 did.

---

#### P2-13 · The build-mode note is printed twice, above the fold

**WHERE** `w1920-20-board-in-fight.png`, both faction cards.

**WHAT** *"The steppers on the board still edit the build. A change made now applies to the build and
not to this fight, and it takes effect the next time you start a fight."* — rendered **in full, in
both** the Cats card and the Mechs card. Three lines each, ~180px of duplicated prose in the top
third of the board view during a fight.

**CHANGE** In **[S06.9]**: print it once, under `#views` or at the head of `#board`. It is a fact
about the page, not about a side.

**WHY** The same sentence twice reads as a bug and costs the board its first screen.

**GATE** Removes a rendered string instance → `SUITE_FLOOR` / board harvest move.

---

### P3 — fine polish

---

#### P3-1 · The one control that breaks the project's own UX-02 rule is the destructive one

**WHERE** `w1920-01-board-fresh.png`, the `×` at the top-right of every unit card.
**WHAT** `[S06.1]` (~line 11818) sets `rm.textContent = '×'` with an `aria-label` and nothing else.
**[C07]**'s banner states the rule this breaks in as many words: *"a real, permanently visible text
label at the 18px minimum, never an icon."*
**CHANGE** Give it the word — `Remove`, or the full `Remove Cat 1` if the row has space.
**WHY** It is the file's own rule, and it is unapplied on the only control that deletes a student's
work.
**GATE** Adds rendered words → `SUITE_FLOOR` + board harvest.

---

#### P3-2 · The dead-marker toggle states a falsehood while unpressed

**WHERE** `w1920-20-board-in-fight.png`, every unit card: *"Dead marker · [Marked dead]"* on a cat at
full health.
**WHAT** Measured in the DOM: `<button class="dc-alive" aria-pressed="false">Marked dead✓</button>`.
The label is a past-tense **status claim** that is false, on a button whose `aria-pressed` correctly
says `false`. The visible text and the accessible state disagree.
**CHANGE** In **[S06.9]**: label the **act** when unpressed (`Mark dead`) and the **state** when
pressed (`Marked dead`), tracking `aria-pressed`. No banned word is involved — `dead` is already the
shipped vocabulary of the dead-marker token.
**GATE** `SUITE_FLOOR` + fight harvest.

---

#### P3-3 · No scrollbar styling exists anywhere, on six scrolling regions

**WHAT** Measured: **zero** `::-webkit-scrollbar` rules and **zero** `scrollbar-color` declarations
in the file. Regions that scroll: `.fg-sides` ×2, `.ld-row`, `.ld-list`, `.ld-now-body`, both
authoring dialogs, and `#strip` in its sidebar form. Every clipping finding above (P1-1, P1-2, P1-3,
P1-4, P2-12) is made invisible by this one absence.
**CHANGE** In **[C01]**, one shared rule on a `.scroller` utility class:
`scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--ink-faint) 60%, transparent) transparent;`
plus the edge-fade `linear-gradient` background idiom. Both Baseline Widely Available, both derived
from existing tokens, no `url()`.
**WHY** It is one rule and it converts five silent content-losses into five visible ones.
**GATE** **None.**

---

#### P3-4 · Cost glyphs are ~11px and each repeated glyph carries its own removal badge

**WHERE** `zoom-row1.png` at 3×.
**WHAT** A 2-AP cost draws two triangles, each with its own D-30 red minus badge. Pounce's four-term
cost draws up to seven separately-badged glyphs inside one 240px button; at 1× each glyph is about
11px and the badge about 2px.
**CHANGE** Consider one badge per **term group** rather than one per repeated glyph, and lift
`--tok` for the fight picker context specifically — **[C00]** (~line 46) already names `--tok` and
`--tok-gap` as the two projector rehearsal dials and says explicitly that no JavaScript hardcodes
either.
**WHY** Legibility from the back of a room is this artifact's stated bar.
**GATE** Geometry cells reading token box size. **Flag to the developer:** D-30 is their spec and the
per-glyph badge may be exactly what they meant.

---

#### P3-5 · Student emoji are illegible inside a small shape

**WHERE** `w1920-02-board-authored.png` and `zoom-row1.png` — 🔥 inside a 22px violet hexagon is a
smudge at 1×.
**CHANGE** In **[C05]**: scale the glyph to the shape's inner box, and in the fight picker's smaller
token context let shape and colour carry the meaning alone. The picker dialog's own copy already
tells the student the emoji is decoration on top of shape and colour.
**GATE** **None.**

---

#### P3-6 · The fight row has no `focus-within` counterpart to the board's

**WHAT** `.unit-card{ &:focus-within{ border-color: var(--accent) } }` exists on the board; nothing
equivalent exists on `.fg-row`. Two surfaces, same question ("which row am I in"), one answer.
**CHANGE** In **[C14.1]**: add it, using P1-8's separated palette so it does not collide with
"declared".
**GATE** **None.**

---

#### P3-7 · The hidden tick is in every action button's accessible name

**WHAT** Measured: an **undeclared** `.fg-act` has `textContent === 'Slash−✓'`. The `.fg-check` span
is `visibility: hidden`, which hides it visually but leaves it in the accessible name and in any
harvest that reads `textContent`.
**CHANGE** Keep the width reservation (it is why buttons do not jump on declaration) but remove the
character from the tree when unset — e.g. write the tick only onto the declared button and reserve
the space with padding.
**GATE** Verify against the fight harvest **before and after** — this may or may not currently be
counted, and that answer determines whether `FIGHT_FLOOR` moves.

---

#### P3-8 · REF-03: six reference cards sit inside `display:none` columns during every fight *(known deferred item 4 — resolution proposed)*

**WHAT** Re-measured this run, with a view: in `#app[data-view="fight"]`, `#refband` contains exactly
three strings (*"What beats what"*, *"Fly beats Slash"*, *"Lasers beat Hairball"* — visible in
`w1920-10b-fight-fresh-bottom.png`) and **zero** reference cards, while `.brd-col .ref-card` counts
**6**. Unchanged from the deferred item's finding.

**RECOMMENDED RESOLUTION — candidate 3, the toggled sidebar.** The deferred item lists three
candidates and flags this one as cheapest. This polish pass makes it cheaper still: P2-12 is already
giving that panel a header row, a labelled close control, a scrim and a scroll affordance, so the
cards land in a container that has just been built to hold them. It costs `#refband` and the columns
nothing in *either* view, which is the height risk candidates 1 and 2 both carry. The panel then
needs either a name covering both readings or two labelled sections inside it; the view-switch
button relabels accordingly.

**GATE** This is the deferred item's own row 101 (*"all six in a column, none in the band"*), which
reddens **by design** the day the cards move. Turn it in the open, per the 95 precedent, and rewrite
it to assert the new arrangement. Adds the panel-section strings → `SUITE_FLOOR`.

---

#### P3-9 · Miscellaneous fine items

- **Cross-column row rhythm breaks as soon as tallies differ.** `w1920-02-board-authored.png`: with
  Rage on the cats, "Cat 2" heads at y=777 while "Mech 2" heads at y=723. The two rosters read as
  paired rows and then drift. If pairing is intended, a `subgrid` on the two columns aligns them;
  if it is not, the eye should not be invited to pair them in the first place. (**[C03]**; Baseline
  Widely Available.)
- **The load pane's textarea shows a native resize grabber** and a different border from the copy
  pane's (`w1920-08`). Normalise in **[C13]**.
- **The view switch changes its member count between views** — "The projection" appears only in
  fight view (`w1920-01` vs `w1920-10`). Reserving the slot stops the group from resizing under the
  cursor. (**[C15]**.)
- **`#strip` is a fixed 320px** at both viewports (`w1366-01`): at 1366 the advisory projection takes
  24% of the width while each roster column — the surface the task is on — gets 36%. Consider a
  fractional basis at ≤1366. (**[C10]** / **[C03]**.)

---

## 3. Recommended implementation grouping

Eight passes. Ordered so the largest perceived gain arrives first at the lowest gate cost, and so
every pass that moves a floor moves it **once**.

| # | Pass | Findings | Owns | Gate cost |
|---|---|---|---|---|
| **A** | **One vocabulary of state** — separate hover / selected / focus / lit; add the 120ms ramp with the reduced-motion guard; scrollbar + edge-fade utility | P1-8, P3-3, P3-6 | **[C00]**, **[C01]** | **None.** No markup, no strings, no geometry. |
| **B** | **The round loop can be seen** — `.fg-team` out of the scroller; one pool reading; re-derive the vh dials; heading out of the scroller; Advance to the bottom with primary weight; retarget feedback at the press | P1-1, P1-2, P1-6, P1-7 | **[S06.7]**, **[C14.1]**, **[S07.5]** | `FIGHT_FLOOR` + geometry cells. One re-derivation. |
| **C** | **The lane earns its height** — note once above the lane; drop zero tallies; placeholder card; card the `.ld-now`; edge fades; re-derive 15vh | P1-4, P1-5, P2-10, P2-11 | **[S06.8]**, **[C14.2]**, **[S06.11]** | `FIGHT_FLOOR` + the height dial. One re-derivation. |
| **D** | **One dialog frame** — grid + sticky footer + one placement; one list component; fix the term-row grid; fix the ticks | P1-3, P2-5, P2-7, P2-8, P2-9 | **[C07]**, **[C12]**, **[C13]** | Geometry cells only; **no strings**. |
| **E** | **The bar and the head** — align `.shell-head`, drop the duplicate brand, stabilise the cluster, eyebrow the labels, lifecycle toggle, de-duplicate the build note | P2-1, P2-2, P2-3, P2-4, P2-13 | **[C02]**, **[C03]**, **[S06.7]**, **[S06.9]** | `SUITE_FLOOR` + check 95's control list. One re-derivation. |
| **F** | **The sidebar becomes a panel, and REF-03 lands in it** | P2-12, P3-8 | **[C15]**, **[S06.4]**, **[S06.1]** | `SUITE_FLOOR`; row 101 and the `#strip` placement cells turned in the open. |
| **G** | **Labels that tell the truth** — `Remove`, `Mark dead`, the hidden tick, glyph scale | P3-1, P3-2, P3-4, P3-5, P3-7 | **[S06.1]**, **[S06.9]**, **[C05]**, **[C00]** | `SUITE_FLOOR` + board/fight harvests. One re-derivation. |
| **H** | **Symbols in the proposal** *(needs a developer decision first)* | P2-6, P3-9 target grouping | **[S06.5]**, **[S06.12]** | `PROPOSE_FLOOR` + the tooltip harvest. |

**Sequencing notes.**

- **Run A first.** It is the only pass with zero gate cost, it touches no markup, and it delivers the
  largest ratio of perceived quality to risk in the document. It also establishes the palette that
  B, C, D and F all consume, so running it later means restyling the same elements twice.
- **B before C.** Both re-derive a viewport dial; B's changes to `#fight-input`'s height alter the
  space available to C's lane.
- **D is independent** of B/C and can run in parallel with either — it touches no fight section.
- **H last, and only after the developer confirms.** It extends D-29's symbol rule from the fight
  surface to the authoring surface. That is theirs to say, not this audit's.
- P3-4 (per-glyph removal badges) similarly touches D-30's own spec and should be raised as a
  question before it is implemented.

**What this audit did not change.** Nothing in `cats-vs-mechs.html`. D-31's state/input separation
and D-32b's density are treated throughout as the developer's settled choices — every finding above
either polishes them or removes something that was defeating them, and none relitigates them. The
no-verdict gate, UX-02's labelling floor, the token system, the single-file offline contract and the
no-`innerHTML`/no-SVG/no-`url()` rules constrain every change proposed here, and every proposed
colour is derived from an existing token by `color-mix()`.
