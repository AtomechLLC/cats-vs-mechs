---
phase: 05-fight-loop-playtest
plan: D38
subsystem: shell-and-authoring-surfaces
tags: [d-38, how-to-tab, s06-10, s07-6, c18, displacement, d-29-tooltip-channel, closed-dialog, cascade-origin, layer-c, rows-turned-in-the-open]

requires:
  - phase: 05-fight-loop-playtest
    plan: 12
    provides: "[S06.10] the view switch, [S07.6] its presses, [C15]'s data-view rules — the two-view machinery this plan makes three"
  - phase: 05-fight-loop-playtest
    plan: D29
    provides: "the tooltip channel and the recorded lesson that a word leaving textContent leaves a scanner that only reads textContent"
  - phase: 05-fight-loop-playtest
    plan: D33b
    provides: "the three-block dialog frame — .pk/.ae getting display:grid, which is the declaration that switched the closed state off"
  - phase: 05-fight-loop-playtest
    plan: D33c
    provides: "the recorded trap: a CSS rule that never applies is invisible to BOTH gates, and only a computed-style read finds it"
provides:
  - "[C18] + #howto — the third view, six cards of displaced prose, and the six rules that put the working surfaces away"
  - "[S06.10] VIEW_HOWTO and a three-word normalisation; [S07.6] a three-word allowlist on the press"
  - "the closed-dialog guard: .pk/.ae/.sh/.rs:not([open]){display:none}, and the cascade-origin argument for why it has to carry the class"
  - "[S07.1] soleDialog(keep) — one dialog at a time as a rule of this file"
  - "the resting words in the Side chooser, so a dialog that becomes visible before a paint is never wordless"
  - "the eleven displacement rulings, one per site, recorded in the markup at each site"
  - "the recorded finding: a defect can be invisible to every text scanner and every no-layout gate at once, and only a picture at the right scroll position shows it"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "an author declaration beats a user-agent one at every specificity — cascade ORIGIN, not a specificity contest — so `display:grid` on a dialog silently repeals `dialog:not([open])`"
    - "a word that exists only in a per-frame paint is a word the surface does not have: four early returns above the write are four ways to render the control wordless"
    - "a paragraph that nests an inline element is not a leaf, so a leaf-walking scanner reads the emphasis and loses the sentence"
    - "extracting a region's words out of the shell rather than re-typing them into the stub, when the alternative is twenty strings that go stale in silence"
    - "a cell whose scroll position is inherited from the previous press is a cell measuring the previous press"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs

decisions:
  - "Defect (a) — the empty Side pills — was reproduced on the shipped file and fixed by putting the two words in the DOCUMENT. The per-frame live read is untouched and additive, so a rename op would still move the pill on the frame it lands."
  - "Defect (b) — the second panel under the Actions dialog — is NOT two open modals. It is a CLOSED <dialog> in normal document flow: .pk and .ae carried display:grid, which beats the user-agent's dialog:not([open]) at every specificity. Both were 660x728 and 1040x716 at document y 3067 on every page this artifact has ever drawn."
  - "soleDialog() ships anyway, and the honest measurement ships with it: all twelve ordered pairs of the four openers were BLOCKED by inertness in real Chrome. The guard exists because inertness was the only thing holding a property this file never stated."
  - "The how-to tab is a third VIEW and not a dialog: no DIALOG_ROOTS entry, no opener, no close-request answer, no focus trap — and a student reading how the fight works is not made to cover the fight with the thing explaining it."
  - "The gate's stub BUILDS #howto with its words, extracted from the shell rather than re-typed. This is a deliberate exception to a rule this file states four times ('static text is empty here'), because the alternative leaves the artifact's largest block of prose — prose about a fight — behind its smallest word list."
  - "No paragraph in #howto nests an inline element, and [C18] states the rule: the Layer C walk reads leaves, so a <p> holding a <b> would keep the emphasis and lose the sentence. The three term lines are three paragraphs instead."
  - "Eleven displacement sites, each ruled and recorded AT the site: five moved whole, six became tooltips on their headings (D-38's own named allowance, per the D-29 channel), two were split so the reading stays at its control."
  - "DIALOG_FLOOR stays at 138 against a measured 179. It was expected to move DOWN and went UP by six, and the whole arithmetic is written into its note: the paragraphs that left were static markup and were already worth zero on the stub, and the tooltips that arrived are worth six because the stub now builds the heads that carry them."
  - "Cells 21c and 25b2 were both PROPPED UP BY DEFECT (b) and are turned in the open with their recorded reds — one was measuring D-30's anchor on two marks inside a closed dialog, the other was relying on 728px of phantom scroll."

metrics:
  duration: ~5h
  completed: 2026-09-01
  tasks: 4
  commits: 4
---

# Phase 5 Plan D38: The How-To Leaves the Simulator Summary

**One-liner:** The instructional prose moves off eleven working-surface sites into a third
"How this works" tab that Layer C reads under its own floor; the developer's two apparent
defects are both reproduced on the shipped file and both fixed — the Side chooser's words
now ship in the document, and two `<dialog>`s stop sitting in normal document flow while
closed, which is what the second panel in their screenshot actually was.

## The two defects, reproduced first

D-38 says: *"Reproduce this exact state first."* Both were, before anything moved.

### (a) The Side chooser's two empty pills — REPRODUCED, and it is a real defect

**What was found.** `#act-edit-side-cats .ae-side-name` and its sibling ship EMPTY in the
markup. The only thing that has ever put a word in them is `[S06.5]`'s per-frame write, and
that write sits under **four early returns**: no `#act-edit`, a side that is neither
`cats` nor `mechs`, an action id that names nothing on that side, and the fingerprint gate.
Any frame in which the dialog is VISIBLE before one of those four is cleared draws exactly
the screenshot.

**Measured** (probe F, real Chrome, `file://`, 1366x768), on a cold page with the editor
never opened:

```
#act-edit-side-cats  .ae-side-name  textContent = ""
#act-edit-side-mechs .ae-side-name  textContent = ""
```

and forcing the dialog visible without a completed paint rendered the picture: two outlined
pills with a tick and no word, above the four-line explainer the developer called cluttery.

**Why nothing caught it.** Twenty-two consecutive rendered changes went past. Read after a
boot — which is when every row in the file reads it — the pills say "Cats" and "Mechs" on
the *broken* file too, because by then the editor has been opened once. The reading that
tells the two files apart can only be taken **before the artifact has run**.

**The fix is additive.** The shell now ships `<span class="ae-side-name">Cats</span>` and
`Mechs` as the RESTING value; `[S06.5]`'s live read still writes over the top on every
repaint, so the day a rename op exists the pill still follows it on the frame it lands.

**What would have caught it:** row **123** reads the resting text at `makeStubDom()` time,
before the artifact has run, plus the shell source, plus the live write still live. Cell
**27** drives the cold page to the exact photographed state in both browsers at both sizes.
Both were probed red by taking the words back out.

### (b) The second panel under the Actions dialog — REPRODUCED, and it is not what it looked like

The obvious reading was two stacked modals. It is not. Measured on the shipped file (probe
DLG-FLOW, real Chrome, `file://`), board tab, **nothing pressed**:

| dialog | open | display | box | document y |
|---|---|---|---|---|
| `#tok-picker` | false | **grid** | **660 x 728** | 3067 |
| `#act-edit` | false | **grid** | **1040 x 716** | 3067 |
| `#share` | false | none | 0 x 0 | — |
| `#reset-ask` | false | none | 0 x 0 | — |

Two of the four dialogs were **parked in normal document flow at the foot of every page
this artifact has ever drawn**, adding 728px of dead height (document 3795px against a real
3067px). Open the Actions dialog, scroll to the foot, and the token picker's sticky foot —
**"Emoji"** and **"Done"** — is on screen underneath it, dimmed to 24% by `#act-edit`'s own
backdrop. That is the screenshot. It was reproduced at 1440x1180 with a picture before the
rule was written, and photographed again after.

**The mechanism is cascade ORIGIN, not specificity.** `dialog:not([open]){display:none}` is
a **user-agent** rule, and an author declaration beats a user-agent one at every
specificity. The moment D-33 P1-3 gave `.pk` and `.ae` `display:grid` for their three-block
frame, the closed state stopped applying to both. `[C04]` writes the identical trap down
about a different attribute — *"[hidden]{display:none} is a user-agent rule, and an author
rule beats it"* — and this is that paragraph arriving on the attribute a dialog IS.

**`.sh` and `.rs` were clean BY ACCIDENT**, because neither block happened to declare a
display. So the guard names all four:

```css
.pk:not([open]), .ae:not([open]), .sh:not([open]), .rs:not([open]){display:none}
```

The class is on the selector as well as the attribute for a reason worth stating: a bare
`dialog:not([open])` is (0,0,1) and `.pk` is (0,1,0), so the bare form loses to the very
declaration it is written to undo.

**Why nothing caught it.** The node gate has no stylesheet and no layout engine. Layer A,
Layer B and Layer C all read TEXT, and the text was correct the whole time. The only thing
that could see it was a picture taken at the right scroll position with the right dialog
open — which is the phase's own recorded lesson arriving for the twenty-third time.

**What would have caught it:** row **127** derives the dialog class list from the shell's
own `<dialog>` tags and requires a guard for every one, needed or not. Cell **27c** drives
the photographed sequence and reads the picker's `Done` and `Emoji` at zero height and off
screen, plus each dialog opened in turn with the other three undrawn, plus the page height
unchanged across the run.

### And the honest bound on the reading that looked right

Before (b)'s real cause was found, all **twelve ordered pairs** of the four openers were
driven as real clicks in real Chrome (probe D, 1366x768). **Every second press was
BLOCKED** — a modal makes the rest of the document inert, the top bar is outside the
dialog, the click never lands. Two open modals were not reachable through the shipped
controls, and that measurement is recorded rather than quietly fixed away.

`soleDialog(keep)` in `[S07.1]` ships anyway, and the reason is not belt-and-braces:
**inertness was the only thing holding the property.** Not one line of `[S07]` said "one at
a time"; each of the four openers tested its OWN dialog's `.open` and knew nothing about
the other three. A property held by a browser behaviour and stated nowhere in this file is
a property this file cannot keep through a keyboard route, an opener moved inside a dialog,
or a future surface opened with `show()`. It CLOSES rather than refusing, which is D-17's
register: the last press wins.

Row **124** drives all twelve pairs on the stub — which models `.open` and `close()` and
**no inertness at all**, so every second press lands there and before the guard every one
left two dialogs open. That page is the one place that state is reproducible. Cell **27b**
asserts both halves in both browsers: twelve clicked and blocked, twelve dispatched and
single.

## The "How this works" tab

A third entry in `#views`, `#howto` inside `#app` after `#roundrules`, and `[C18]`'s six
rules. Six cards, organised by surface exactly as D-38 asks: **The board, Tokens, Actions,
Sharing, The fight, The round rules.**

**It is a view and not a dialog**, for the fight region's own two reasons: a dialog would
need a `DIALOG_ROOTS` entry, an opener, a close-request answer and a focus trap; and a
student reading how the fight works while the fight is covered by the thing explaining it
is the arrangement D-27 threw out.

**How the harvest reaches it — decided consciously, and recorded.** This is the wave-1
lesson in the one place it would cost most: D-38 moves the artifact's largest single block
of prose onto a new surface, and it is prose about a FIGHT, which is exactly where "wins",
"beats" and "better" write themselves.

- `#howto` is inside `#app`, so check 48's walk reads it today. The `#app` harvest went
  **187 → 219** in the commit that added the tab, and all 32 new strings are scanned by the
  48-word rendered list.
- But *"it is inside `#app`"* is a fact about the child order and not a promise. Row **126**
  reads the region **by name**, walks its containment rather than assuming it, and floors
  its own leaves at **24 against a measured 32** — DIALOG_FLOOR's arithmetic, a tripwire for
  the tab going dark and not a ratchet on a growing one.
- The gate's stub **builds `#howto` with its words**, extracted from the shell rather than
  re-typed. This is a deliberate exception to a rule this file states four times. The
  alternative was measured before it was rejected: twenty paragraphs hand-copied into the
  builder is twenty strings that go stale in silence the first time somebody edits one in
  the artifact, and a scanner reading last week's prose is a scanner reading nothing.
- **No paragraph in the region nests an inline element**, and `[C18]` states the rule. The
  Layer C walk harvests LEAF nodes, so a `<p>` holding a `<b>` keeps the emphasised words in
  the scan and drops the sentence around them — a hole shaped exactly like a pass. The three
  term lines are three paragraphs with a rule-and-indent instead, and row 126 counts the
  shell's fragments against the harvest to hold it. Probed red by nesting one `<b>`.

**Measured, both browsers, both viewports:** 6 cards, narrowest 401px, smallest type 17px,
widest line 363px, no card spilling the viewport, no empty leaf, no nested paragraph, and
the four working surfaces all `display:none` with a layout engine present (cell **28**).

**Rows turned in the open.** Check **103** floored the switch at `vwPrivate === 2` and drove
two controls. Recorded RED: **211 of 212**, on the count and nothing else, which is the
count doing the job it was written for. It now drives three, in the order fight → how-to →
board so the middle press is read arriving from one view and leaving to another, and it
gained a clause the two-view spelling did not need: exactly one control is on at any moment.

**[C15] is byte-identical after this plan.** Every `#app[data-view="..."]` rule that shipped
before is untouched, and that is a decision: several rows read those rule bodies BY NAME off
the stylesheet, and rewriting the pair into a tidier `:not()` form would have turned green
rows red for a change none of them is about. The third view states what IT puts away, in its
own block, and row **125** reads [C15]'s two rules for being still present from the other end.

## The displacement — eleven sites, each ruled and recorded

D-38's test: a READING states a fact about the board in front of the student and stays;
text that explains HOW TO USE a surface or WHAT A CONCEPT IS is true of every board and
moves. Every decision is written AT its site in the markup.

| # | site | text | ruling |
|---|---|---|---|
| 1 | `.rr-note`, round rules | "What Advance does to the board after the declarations have landed…" | **MOVED** + a one-line tooltip on `#rr-head` — this block's name says *when*, not *what* |
| 2 | `.pk-note`, picker | "The shape and the colour carry the meaning on their own…" | **MOVED** whole; the three grids carry their own legends |
| 3 | `.pk-bounds-note` | "The least and the most of this type any one number on the board may hold." | **TOOLTIP** on the Range legend — "Range" does not say whose or of what |
| 4 | `.ae-note`, author pane | "Every action on a side lives in one list…" | **MOVED** whole — this is the paragraph in the screenshot |
| 5 | `.ae-term-note`, Cost | "Spent when the action is used." | **TOOLTIP** — D-38 names this one by example |
| 6 | `.ae-term-note`, Needs | "Must be there for the action to be used. It is not spent." | **TOOLTIP** — the difference from Cost is the whole of the sentence |
| 7 | `.ae-term-note`, Changes | "What the action changes, and by how much…" | **TOOLTIP** |
| 8 | `.ae-note`, proposal pane | "What your rule says would happen… Nothing here is applied." | **SPLIT** — the how-to moves, **"Nothing here is applied."** stays |
| 9 | `.ae-term-note`, Override | "Add a line your rule did not state." | **TOOLTIP** — a heading that reads as a warning without saying what it overrides is worse than no heading |
| 10 | `.sh-note`, copy pane | "Copy this and paste it into the course thread…" | **MOVED** whole; the tab's version also names the round rules, which this sentence never did |
| 11 | `.sh-note`, load pane | "Paste a classmate's code and press Load. It replaces the board…" | **SPLIT** — the how-to moves, **"It replaces the board, and one Ctrl+Z brings yours back."** stays where the press is |

**Untouched, all readings:** every `-said` node, `#fight-prompt`, `#board-empty`,
`#reset-ask-says`, `.ae-prop-nothing`, the cap sentences, the refusal lines.

**Row 128 asserts all three outcomes together**, because each alone is green over the
mistake beside it: a MOVED sentence must be gone from the working surfaces (a displacement
that copied leaves the clutter and adds a tab); a TOOLTIP sentence must be on a `title` AND
not element text (D-38 allows the hint to survive, not to be said twice); and a READING must
still be element text where its control is. It reads the markup **with the HTML comments cut
out**, and that is not a detail: every site decision is recorded at its site and several
QUOTE the sentence they moved, so a search over the raw file would find all eleven still
present and report a displacement that never happened. Probed red both ways.

**Dead rules removed with their reason.** `.pk-note`, `.pk-bounds-note`, `.ae-term-note`,
`.rr-note`, the two descendant rules that positioned them, and the 18px-floor paragraph that
named two of them by example. D-33c's recorded trap read the other way round: a rule that
never applies is invisible to BOTH gates, so the only safe number of them is zero. The stub's
`rrNote` node went with them.

**The Actions editor, measured after** (cell 29): **zero** explainer paragraphs on the author
pane, exactly one `.ae-note` on the whole dialog and it is the reading "Nothing here is
applied.", the three tooltips read off the LEGENDS themselves with the exact text that left,
and the body no longer scrolls at 1920 at all — **825 over 779 before, 803 over 803 after**;
at 1366 the hidden overflow went **358px → 243px**.

## Floors re-derived, openly

| floor | before | after | moved? |
|---|---|---|---|
| `DIALOG_FLOOR` | 138 (measured 173) | 138 (**measured 179**) | **no — and the arithmetic is written into its note** |
| `HOWTO_FLOOR` | — | **24** (measured 32) | new |
| `FIGHT_FLOOR` | 248 (measured 693) | 248 (measured 725) | no |
| `PICKER_FLOOR` / `PROPOSE_FLOOR` / `SHARE_FLOOR` | 84 / 23 / 0 | unchanged | no |
| shell ids | 157 | **160** | `view-howto`, `howto`, `howto-head` |

`DIALOG_FLOOR` was expected to move DOWN and the measurement went the other way, which is
the whole lesson of that constant and is now in its history note. The six paragraphs that
LEFT were static markup, and the stub is a hand-made stand-in rather than a parser, so every
one of them was **already worth zero** there — Layer A read them in the document and still
reads them, on the tab. The four sentences that became TOOLTIPS could have been worth zero
too, which is D-29's own note calling it the wave-1 lesson in its attribute edition; so the
stub now BUILDS the three term heads with the word AND the title, `LABEL_ATTRS` picks each
title up, and the total goes **+6**. The floor stays at 138 because it is a tripwire and not
a ratchet: 179 − 138 is more headroom than its arithmetic asks for, and the alternative
reddens the next plan that legitimately takes a sentence off a dialog.

## Two cells that were propped up by defect (b)

Both turned in the open with their recorded reds, because a cell that only passed because of
a defect is a cell that was asserting nothing.

- **21c** walked every `.sym-sign` in the document and measured D-30's anchor on all 128 of
  them. 90 in the lane, 36 in the picker, and **two with no surface open that could be
  showing them** — the action editor's term readings, which had rects only because a closed
  dialog was in flow. Recorded RED: 8 of 8 combinations, on `badGeom` and nothing else. The
  walk now skips a mark with no box — and because "skip what has no box" is the shape of a
  cell going quietly blind, the skipped ones are COUNTED and every one must be inside a
  dialog that is shut.
- **25b2** read `#rr-add` with `scrollIntoViewIfNeeded()`, which does nothing when the
  control is already inside the window — and it was, with its sentence's last 4px hanging
  over the fold. It passed because the page had **728px of phantom scroll** underneath it.
  Recorded RED: 4 of 4 combinations on `saidAt` alone. The FOOT is scrolled to the end of the
  window now; same claim, no longer resting on a defect two regions away. **25b** was turned
  in the same change for the same class of reason: its `addShown` was a reading of whatever
  scroll the previous press left behind.

## Gate

| | before | after |
|---|---|---|
| selftest | 1336 / 0, exit 0 | **1336 / 0, exit 0** |
| interaction gate | 210 of 210 | **216 of 216** (+123, 124, 125, 126, 127, 128) |
| stub-drift | 157 shell ids | **160 shell ids** |
| `DIALOG_FLOOR` | 138 | 138 |
| `FIGHT_FLOOR` | 248 | 248 |
| browser checks (HEADLESS, chrome + msedge, 1920x1080 + 1366x768) | 294 / 0 | **314 / 0** (+27, 27b, 27c, 28, 29) |

Layer A clean over 18 words, Layer B clean over 10,475 literals and 27 words, Layer C clean
over `#app` (219), the four dialog roots (179), `#howto` (32), the fight page (725), the
fight page with the sidebar (725), the fight page with the unit popup (747) and the
proposal pane (62). No verdict anywhere, including every word of the new tab.

## Every new row and cell was probed

Each was driven red by removing exactly the thing it exists to hold, with the artifact
restored from a scratchpad copy afterwards — never `git checkout --`, never `git stash`.

| row / cell | probe | result |
|---|---|---|
| 123 | took the two words back out of the shell | RED, 211 of 212 |
| 124 | removed the four `soleDialog(dlg)` calls | RED, 211 of 212, detail shows two dialogs open on all twelve pairs |
| 125 | removed one `[C18]` rule | RED, 211 of 212 |
| 126 | nested a `<b>` inside one how-to paragraph | RED, 211 of 212 |
| 127 | removed the `:not([open])` guard | RED, 211 of 212 |
| 128 | put a moved sentence back AND took a tooltip off | RED, both named in the detail |

## Deviations from plan

**1. [Rule 1 — Bug] Defect (b) was not what the plan described, and the real cause is worse**

- **Found during:** task 3, while photographing the how-to tab. The full-page screenshot
  showed the Actions dialog rendered inline at the foot of the page.
- **Issue:** the plan's framing — "two modal dialogs visible together suggests a non-modal
  show path, a z-index/backdrop gap, or one dialog left open when the other opens" — names
  three candidates and the answer is a fourth: a CLOSED dialog in normal document flow.
- **Fix:** the four-class `:not([open])` guard, row 127, cell 27c. The `soleDialog()` work
  done under the plan's framing is KEPT, with its honest measurement (all twelve pairs
  blocked) recorded in its own row, because the property it states was held by nothing.
- **Files:** `cats-vs-mechs.html`, `tests/selftest-node.cjs`, `tests/browser-checks.mjs`
- **Commit:** `cd440a3`

**2. [Rule 1 — Bug] Two browser cells were passing because of that defect**

- **Found during:** task 3, on the run immediately after the guard shipped.
- **Issue:** cell 21c was measuring D-30's geometry on two marks inside a closed dialog;
  cell 25b2's scroll relied on 728px of phantom page height. 25b was fragile for the same
  class of reason.
- **Fix:** all three turned in the open, with their recorded reds in their own banners.
- **Commit:** `cd440a3`

**3. [Rule 2 — Missing] `[C18]`'s content-model rule, and the stub building `#howto`**

- **Found during:** task 3, writing row 126.
- **Issue:** the first draft of the tab used `<b>` inside three paragraphs. A `<p>` holding
  an inline element is not a leaf, so the Layer C walk would have read the emphasised words
  and dropped the sentences around them — on the one surface where the whole point is that
  the words are scanned.
- **Fix:** no inline element inside any paragraph in the region, `[C18]` states it, row 126
  counts the shell's fragments against the harvest. And the stub builds `#howto` with its
  words at all, which the file's standing "static text is empty here" rule would not have.
- **Commit:** `cd440a3`

## Known stubs

None. Every surface this plan touched is wired to the state it reads, and the how-to tab is
static by design with the decision and its cost recorded at the site.

## Threat flags

None. No network surface, no auth path, no file access, no schema change at a trust
boundary. The one new attribute channel (`title` on five headings) carries artifact-authored
literals only and is read by Layer A in the document and by Layer C on three of the five.

## Self-Check

- `cats-vs-mechs.html` — FOUND
- `tests/selftest-node.cjs` — FOUND
- `tests/browser-checks.mjs` — FOUND
- `.planning/phases/05-fight-loop-playtest/05-D38-SUMMARY.md` — FOUND
- commit `4806c97` — FOUND
- commit `e6c4fce` — FOUND
- commit `cd440a3` — FOUND
- commit `0028971` — FOUND

## Self-Check: PASSED
