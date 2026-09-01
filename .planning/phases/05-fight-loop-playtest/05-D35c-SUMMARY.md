---
phase: 05-fight-loop-playtest
plan: D35c
subsystem: render+interactions+style+gate
tags: [d-35, redirect, surface-rework, round-rules, s06-12, s06-13, s07-7, c17, discoverability, grid, browser-cells]

requires:
  - phase: 05-fight-loop-playtest
    plan: D35b
    provides: "#roundrules, symRoundParts, [S07.7]'s delegated root and the amount field's commit contract, check 116 and browser cells 25/25b/25c — the surface this plan reworks"
  - phase: 05-fight-loop-playtest
    plan: D33c
    provides: "D-33 P2-7 — 'the amount sits beside the chips it belongs to', the one-word fix on .ae-term-toks that [C17] was written without"
  - phase: 05-fight-loop-playtest
    plan: D33b
    provides: "D-33 P3-1 — .unit-rm's ruling that a control which deletes a student's work wears a WORD and not a glyph"
  - phase: 05-fight-loop-playtest
    plan: D32b
    provides: "[C12]'s dense-row language, the hairline between rows, and the measured rule that the gap inside a group and the gap between two groups must differ"
  - phase: 05-fight-loop-playtest
    plan: D29
    provides: "[S06.12]'s symQty / symSaid / symBox / data-tsay, which symRoundBits and symRoundSaid now split one level up"
provides:
  - "[C17] as a five-column grid with a header — the amount bound to its rule, the pills grouped, and the column words written ONCE"
  - "an Add and a per-row Remove on the round rules, in .brd-add's and .unit-rm's idioms under this region's own classes"
  - "[S06.12] symRoundBits and symRoundSaid — the notation's pieces taken apart once so the picture and the sentence cannot drift"
  - "a hidden round-rule row that holds nothing, and a row count derived from the RULE rather than from a count"
  - "browser cells 25a and 25b2; checks 116 and 117 re-driven through the new controls"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "a list drawn as a grid with display:contents rows, so a label written once in a header stands over the group it names on every row"
    - "column-gap zero and the gap carried as cell padding, so a per-row hairline drawn on the cells is continuous rather than four segments"
    - "align-items:stretch on the grid with the centring done INSIDE each cell, because centred cells put a row's five border-tops at five different heights"
    - "a browser cell placed where the defect it guards CAN appear, with the precondition for that asserted as a floor"
    - "a probe that finds a variable already inert, and the variable deleted rather than kept"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D35c-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/STATE.md

key-decisions:
  - "THE DEFECT WAS NOT THAT THE CONTROLS WERE HIDDEN, IT WAS THAT THEY WERE DISGUISED AS SOMETHING ELSE, AND THAT IS WHY THE FIX IS TWO NEW CONTROLS RATHER THAN A LABEL. Both doors existed and both were driven green by check 116 for a whole plan: a rule was ADDED by pressing a token pill on a half-drawn extra row that had no party chooser, no amount and no reading, and REMOVED by pressing an entry called \"None\" sitting first in the party strip in the same shape, the same size and the same colour as the four party words beside it. Neither is a missing feature; both are a feature wearing the costume of a different one. The argument that put them there was real and is kept in view at both sites: setRoundRule takes CLEAR_TERM in the `who` position, so the control that clears was made the control that names who, and an empty slot is #act-edit's shipped affordance for starting a term. What settles it against that argument is not taste, it is the developer looking at the shipped block and asking for the round-rules UI again. ONE OP is a claim about who writes the list and it is untouched — setRoundRule still covers append, replace and remove and is still the only writer. A CONTROL PER DOOR is a claim about what a student can find, and it does not follow from the first: the roster has shipped Add Cat, the steppers and Remove since Phase 2, three separate controls over one list."
  - "THE LIST IS A GRID AND THE COLUMN WORDS ARE WHAT THE GRID IS FOR. Left-packed flex rows already align with one another here, because every row draws the same four party pills and the same token vocabulary — so the grid buys nothing for the ROWS. What flex cannot do is put a word OVER a group: \"Who it reaches\" has to stand above the party strip on eight rows at once, and the only arrangement in which a label written once does that is one where the group is a column. The alternative was a label per row, which is [C12]'s own .ae-term-lbl defect — the span that printed \"Spends\" four times under a legend that already said Cost — re-made on a surface that had just avoided it. The rows are display:contents so their five cells ARE the grid items; the cap is still the ROW COUNT of static markup and is still asserted against the constant in both pages."
  - "THE STRANDED AMOUNT WAS A ONE-WORD INHERITANCE AND THE FIX IS D-33 P2-7's OWN, TAKEN A SECOND TIME. `.rr-toks{flex:1 1 auto}` — [C17] was written from D-32's spelling of the token strip rather than from the FIXED one, and D-33 P2-7 had already turned that exact word on `.ae-term-toks` after photographing \"a ~270px gap between the chips and the amount they belong to, repeated on twelve rows\". Here it measured worse: the strip grew to 576px over 425px of pills and put the field at x=1487 with the pills ending at 1327. The grid states the same rule in grid's own vocabulary — max-content tracks and justify-content:start, because an `auto` track is STRETCHED by the default `normal` justification, which is the same void the flex-grow opened. Only the token track may shrink, because it is the only one whose width a student changes."
  - "THE ROW IS ONE LINE ON THE BOARD A STUDENT OPENS AND THE TOKEN COLUMN WRAPS ON THE BOARD THEY BUILD, AND BOTH ARE MEASURED RATHER THAN ONE BEING CLAIMED OF THE OTHER. At the shipped five types a rule is one 41px line with 80px of slack left in the 1198px list. At six types the row needs 1226 and the token column — the one track allowed to shrink — wraps its last pill to a second line at 89px, with the reading, the party strip, the amount and the Remove all staying exactly where they are. THE ALTERNATIVE WAS TO BUY THE 28 MISSING PIXELS and it was declined with the arithmetic written down: trimming the column gap from 14 to 8 gives 24 and takes it out of the one distance that makes the grouping read, and shrinking the amount field or the pill padding gives the rest by fighting the projector floor — all of it tuned to exactly six types with exactly these names, and a seventh type wraps anyway. What scales is which track gives, not how much slack is hoarded. Cell 25a asserts the one-line regime where it is true; cell 25b asserts the binding where it is not."
  - "align-items:center ON THE GRID DREW THE ROW'S HAIRLINE AS FOUR DISCONNECTED SEGMENTS AND ONLY A PICTURE SAID SO. Centred, each cell is only as tall as its own contents and floats to the middle of the row — so on a row whose token strip has wrapped, the five cells' top edges sit at three different heights and the border-top this block draws on them comes out in pieces at three different y positions. Every number in the cell was green: the row count, the band height, the amount gap and the column alignment all read correctly, because none of them is about where a border starts. Photographed at 1920x1080 with six token types. Stretched, with the centring done INSIDE each cell by .rr-cell's own align-items, it is one line. This is the nineteenth consecutive rendered change in this phase whose defect only a picture showed."
  - "PROBE DC PROVED THE CELL THAT NAMES THE DEFECT CANNOT SEE THE DEFECT, AND THE ANSWER WAS A CELL IN A DIFFERENT PLACE RATHER THAN A STRONGER CLAUSE. Putting the token track back to `1fr` — the exact stretch this plan removed — left cell 25b passing at 0px in all four columns, because by the time 25b runs a sixth type has been invented and the row is over-constrained: a track with no free space cannot claim any, and the two layouts are pixel-identical. A cell that only ever measures a FULL row is green over this by construction. Cell 25a takes the reading on the shipped board, immediately after the reset that already precedes cell 25, where there are 80px of slack — and asserts `slack > 0` as a floor on the measurement being a measurement at all. IT ALSO TURNED WHICH CLAUSE IS LOAD-BEARING: `amtGap` can never catch a stretched track in a GRID, because the amount is the next COLUMN and a track that claims the spare space carries it along, so the two stay flush at 0px while the pair drifts right together. The slack is what catches it; the gap is kept because it names the original defect and would catch a spacer put back between the two."
  - "A HIDDEN ROW WAS HOLDING LIVE BUTTONS AND CHECK 117 WAS PRESSING ONE OF THEM. PROBE DI found nothing, which is how the defect surfaced. The surplus rows are static markup, so hiding one left it holding the reading and the chooser pills of whatever rule last stood in it — invisible on screen, absent from the accessibility tree, and therefore clean to every reading in this repository. It was not harmless: check 117 authored its decay rule by pressing a token pill on row 2 of a two-rule board, a row that was hidden the entire time, and it passed because this stub's querySelector does not honour `hidden` and the press happened to reach an op that appends. That is this repository's own recurring failure — a drive through a control a student cannot reach. The rows are emptied on the paint that hides them, 117 goes through the Add button, and 116 reads a hidden row back for zero pills and an empty reading."
  - "PROBE DE FOUND A VARIABLE THAT WAS ALREADY INERT AND IT WAS DELETED RATHER THAN KEPT. `shown = Math.min(list.length, cap)` set back to `list.length + 1` changed nothing at all, because slot === list.length reads undefined out of the list and the next line hides the row whatever the count says. A variable that cannot change the answer is a variable the next reader has to prove cannot change the answer, so the rule decides whether the row is there and there is no count in between — which is what makes the dangling extra row unreachable rather than merely not asked for. The probe was then re-aimed at the property itself, and 116 reddens on `shown at rest=3`."
  - "symRoundSaid IS A THIRD CONSUMER OF THE NOTATION AND NOTHING HELD IT TO THE OTHER TWO UNTIL A ROW WAS WRITTEN THAT DOES. The Remove button's accessible name has to say WHICH rule it takes away — eight buttons reading \"Remove\" are eight identical announcements otherwise — and the name it says is the row's own reading, not \"round rule 3\", because a number means nothing on a surface where the rules are not numbered ([S06.2]'s ruling on the line beside Remove, held here). symRoundBits hands the prefix, the suffix, the magnitude and the removal flag to BOTH the picture and the sentence, and check 116 asserts the name CONTAINS the reading's own tooltip rather than matching a string typed into the gate — row 111's technique a fourth time. PROBE DG types a different suffix into symRoundSaid and 116 reddens on exactly that clause."
  - "THE TWO NEW CONTROLS WEAR THIS REGION'S OWN CLASSES AND NOT THE SHIPPED ONES, FOR A REASON SHARPER THAN [C17]'s USUAL. .rr-pill re-declares .ae-pill's values because .ae-pill is scoped to a dialog; .brd-add and .unit-rm are not scoped at all and could have been reused directly. They are not, because [S09.11] asserts `.brd-add` counts ZERO on the page during a fight — the roster's Add is setup-only and that row is what says so — and this region is put AWAY by [C15] in the fight view rather than removed from the document. An add button wearing .brd-add would be a node that row counts and a claim about the roster that had quietly stopped being about the roster. Both new classes are named into [C16]'s two motion lists, because that list is a list the next reader audits."

requirements-completed: []

metrics:
  duration: one session
  completed: 2026-09-01
---

# Phase 5 D-35c: the round rules, made operable — Summary

**The developer looked for this block and asked for it again, which is the only reading that
settles whether a surface is discoverable. Every rule is now one line of one grammar — the
reading, then who it reaches, then which token, then how much — under four words written once
in a header, with an Add under the list and a Remove on every row. The op did not move.**

---

## The five defects, and the number each one is now

| # | the defect, as photographed | what it is now |
|---|---|---|
| 1 | the amount stranded ~1,200px right of its pills: the token strip grew to **576px** over 425px of content and put the field at **x=1487** with the pills ending at 1327 | **0px** between the token strip and the amount, in all four browser columns, with **80px** of slack left in the row on the shipped board |
| 2 | a dangling half-row: `list.length + 1` rows, the extra one holding a token strip with no party chooser, no amount and no reading | visible rows **=== rule count**, asserted in both harnesses; the extra row is unreachable rather than not asked for |
| 3 | no add and no remove a student could see | **`+ Add a round rule`** under the list, **`Remove`** on every row, both found, visible and wearing a word |
| 4 | ten pills in one undifferentiated strip | five grid **columns** under four words written ONCE, every header cell aligned with its column **to the pixel**, 6px inside a group against 14px between two |
| 5 | "no symbolic reading" | **it was there** — see the honest note below — and it now has a column of its own, a header word, and a second consumer that cannot drift from it |

### The honest note on defect 5

**The symbolic reading was already being drawn and the dispatch's fifth item is the one thing in
it that was not literally true.** `symRoundParts` shipped in D-35b and the before-screenshot
shows `Cats ▲▲▲` and `Mechs ▲▲▲` — D-29's notation, the type's own shape at the board's own
scale. Check 116 was asserting it against the fight's twin reading the whole time.

**Reporting that as "already done" would miss what the observation was actually about.** The
reading was a 96px cell at the far left of a 1198px row, ahead of ten chooser pills, with the
number it reads out sitting 1,200px away in a field that said `3` about the same rule. Three
things said one fact in three places and nothing tied them together, so the reading did not
read as the row's answer — it read as a row label. It has a column and the word `The rule` over
it now, and the two things that repeat it are adjacent to it.

---

## What shipped

### 1. `[C17]` — the list is a grid

```
The rule          Who it reaches                                Which token                                    How much
Cats ▲▲▲          [Cats✓][Mechs][Cats, each unit][Mechs, …]     [Health][Action points✓][Shield][Damage][…]    [  3 ]  [Remove]
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
Mechs ▲▲▲         [Cats][Mechs✓][Cats, each unit][Mechs, …]     [Health][Action points✓][Shield][Damage][…]    [  3 ]  [Remove]

  [ + Add a round rule ]
```

Five `max-content` tracks with `justify-content:start`, rows as `display:contents`, `column-gap`
of **zero** with the gap carried as `padding-inline-end` on the cells so the per-row hairline is
one continuous line, and `align-items:stretch` with the centring done inside each cell.

Only the token track may shrink — `minmax(0, max-content)` — because it is the only one whose
width a student changes. Not one new colour literal; `url(` **0**, `innerHTML` **0**,
`createElementNS|<svg` **0** across the whole document.

### 2. The two controls

`+ Add a round rule` in `.brd-add`'s idiom, disabled at `MAX_ROUND_RULES` with the cap sentence
beside it in the same frame. `Remove` on every row in `.unit-rm`'s, wearing the word per
D-33 P3-1, with an accessible name of `Remove the round rule: Cats, each unit — Removes: 1
Chill each round` built from `symRoundSaid`.

Both under this region's own classes, both named into `[C16]`'s motion lists.

`None` is gone from the party chooser, so that strip answers one question and every entry in it
is an answer to that question — which is what makes a column of them labellable by one word.

### 3. `[S06.12]` — `symRoundBits` and `symRoundSaid`

The prefix, the suffix, the magnitude and the removal flag are taken apart once. `symRoundParts`
draws the picture from them; `symRoundSaid` writes the sentence from them. Check 116's
two-readings-equal contract is untouched and a third clause now holds the sentence to the
picture.

### 4. The op

Untouched. `git diff` over `[S05]`, `DEFAULTS.`, `WIRE_BOUNDS` and every cap: **no change**.
`setRoundRule` still covers append, replace and remove and is still the only writer.

---

## What the probes found

Every probe was taken after the commit it tests and reverted from git. **Two of the eight found
nothing, and both of those are why two of the four commits exist.**

| probe | what it broke | what reddened |
|---|---|---|
| **DC** | the token track back to `1fr` | **NOTHING at first** — cell 25b passed at 0px in all four columns. Cell 25a was written for it and now reddens on `slack` (0 against 80), four columns |
| DD | a sixth header cell, drifting the column words off their columns | 25b on `colsAligned`, four columns |
| DE | a row drawn for a slot no rule backs | 116 on `shown at rest=3` |
| DF | the Remove button stops naming which rule it removes | 116 on the name and on `carries the row reading` |
| DG | `symRoundSaid` types its own suffix instead of taking `symRoundBits`' | 116 on `carries the row reading=false` |
| DH | the disabled Add dispatches anyway | 116 on **`panel quiet=false`** — and the count is the clause that CANNOT: the list still reads 8, because `setRoundRule` refuses slot 8 by name. What a student gets is the styled error panel raised by a control that looks switched off |
| **DI** | hidden rows keep their stale pills | **NOTHING** — a clause was added to 116 and it now reddens on `pills in it` |
| DJ | the emptying entry back at the head of the party strip | 116 on `party pills=5 of 4` |

**DE's first aim found a variable that was already inert.** `shown = list.length + 1` changed
nothing, because `slot === list.length` reads `undefined` out of the list and the row is hidden
on the next line whatever the count says. The variable is deleted; the probe was re-aimed at the
property and reddens.

---

## Measured, four ways

Real Chrome and real Edge, 1920×1080 and 1366×768, headless. All four columns agree exactly.
`#app` is capped at 1280px, so the block measures 1198px of list at both viewports.

| reading | before | after |
|---|---|---|
| the amount against its pills | **160px** (strip 576 over 425 of content) | **0px** |
| slack left in the row (shipped board) | 0 — the strip ate it | **80px** |
| the column words over their columns | no header | **aligned, ±1px** |
| a rule at the shipped vocabulary | 41px, 1 line | **48px band, 1 line** |
| a rule at six types | 41px, 1 line, amount at the far right | **89px band** — the token column wraps, nothing else moves |
| visible rows at rest | **3** for 2 rules | **2** for 2 rules |
| the block, shipped board | 274px | **313px** |
| at the cap | add: none | **add disabled, sentence beside it, `besideAdd` true** |

---

## Deviations from plan

### Auto-fixed issues

**1. [Rule 1 — Bug] A hidden round-rule row kept live chooser pills, and a gate check was
pressing one**

- **Found during:** PROBE DI, which found nothing and thereby found this.
- **Issue:** the surplus rows are static markup, so hiding one left it holding the reading and
  the pills of whatever rule last stood in it. `hidden` removes a node from the picture and from
  the accessibility tree, so no reading in this repository could see it. Check 117 was authoring
  its decay rule by pressing a token pill on row 2 of a two-rule board — hidden the whole time —
  and passing, because this stub's `querySelector` does not honour `hidden`.
- **Fix:** the row is emptied on the paint that hides it; 117 goes through the Add button; 116
  reads a hidden row back for zero pills and an empty reading.
- **Commit:** `fd39f90`

**2. [Rule 1 — Bug] `align-items:center` drew the row hairline as four disconnected segments**

- **Found during:** reading the first after-screenshot at 1920×1080.
- **Issue:** centred grid items are only as tall as their contents, so on a row whose token strip
  had wrapped, the five cells' top edges sat at three different heights and the border-top came
  out in pieces. Every number in the cell was green, because none of them is about where a
  border starts.
- **Fix:** `align-items:stretch` on the grid with the centring inside `.rr-cell`.
- **Commit:** `b03e201` (found and fixed before the first commit landed)

**3. [Rule 2 — Missing] Nothing held `symRoundSaid` to the reading it paraphrases**

- **Found during:** designing PROBE DG.
- **Issue:** the Remove button's name is a third consumer of `[S06.12]`'s notation, and a row
  matching it against a prefix would pass while the sentence and the picture drifted apart —
  which is the failure `symSaid` exists one layer down to prevent.
- **Fix:** `symRoundBits` hands both consumers the same four pieces; 116 asserts the name
  contains the reading's own tooltip.
- **Commit:** `8ecb7fd`

**4. [Rule 1 — Bug] A two-part selector in the gate matched nothing, silently**

- **Found during:** adding the clause above, which read `false` over a page where both strings
  were correct.
- **Issue:** this stub's `querySelector` reads ONE simple selector; `'.rr-read .sym'` matches
  nothing and returns null with no complaint.
- **Fix:** chained, with the measurement written at the site.
- **Commit:** `8ecb7fd`

### Nothing was asked

No architectural decision arose. The ops, the codec, the caps and the defaults were part one's
and this plan did not go near them.

---

## Gate

| | before | after |
|---|---|---|
| in-file selftest | 1327 / 0, exit 0 | **1327 / 0, exit 0** — this plan adds no `[S09.*]` row |
| interaction gate | 204 of 204 | **204 of 204** — 116 and 117 re-driven, no row added |
| stub-drift | 144 shell ids | **145** (+1: `#rr-add`, a singleton, in KNOWN_IDS and in the stub) |
| `#app` (setup) | 175 | **186** (+11) |
| dialogs | 173, floor 138 | **173, floor 138 — unmoved, fourth plan running** |
| `#app` (fight) | 646, `FIGHT_FLOOR` 248 | **656, `FIGHT_FLOOR` 248 — deliberately unmoved, see below** |
| browser checks | 254 / 0 headless | **262 / 0 headless** (+8: cells 25a and 25b2 × four columns) |

`counter|balanc|rating` **0**, whole document. `url(` **0**. `innerHTML` **0**.
`createElementNS|<svg` **0**. Not one new hex literal in the diff.

### Why `FIGHT_FLOOR` does not move, and why that is not the D-35b answer repeated

D-35b re-derived it by measurement because the region it added drew the same strings on every
board. **This change makes the region's MINIMUM contribution smaller, not larger.** A board with
no round rules used to draw one empty row carrying a token pill per type — ten strings on the
shipped vocabulary — and now draws no rows at all. So the +10 measured on the shipped board is
not a lower bound over the boards a student can build, and raising the floor to 258 on that
measurement would be a ratchet rather than a floor. 248 stands, against a measured 656.

`DIALOG_FLOOR` is untouched for the fourth plan running: it is a tripwire for a surface going
dark, not a ratchet on a growing one.

---

## Known stubs

None. Every control this plan added is wired to the shipped op and driven in both harnesses.

## Threat flags

None. No new network surface, no auth path, no file access and no schema change at a trust
boundary. Every new string is the artifact's own; the two that carry a student's word — the
Remove button's accessible name and the reading's tooltip — go through `data-tsay`, the
exemption channel `symBox` already owns, with the faction name unmarked exactly as
`.fg-side-head`, `.ld-now-side` and `.unit-rm`'s own `aria-label` leave it.

---

## What is carried forward

**The token strip wraps past the shipped vocabulary, and that is a rehearsal question rather
than a defect.** At six token types a rule is a two-line band: the chooser wraps inside its own
column and the reading, the party strip, the amount and the Remove do not move. The arithmetic
for buying it back is in the decision record above and it comes to 28px of gap and type — tuned
to exactly six types with exactly these names, and a seventh wraps anyway. Whether a two-line
band reads as one rule on a projector is a room's answer, and cells 25a and 25b measure both
regimes so the answer has numbers under it either way.

`deferred-items.md` 15 and 16 are unchanged and still belong to 05-11.

## Self-Check: PASSED

- `.planning/phases/05-fight-loop-playtest/05-D35c-SUMMARY.md` — FOUND
- `cats-vs-mechs.html` — FOUND
- `tests/selftest-node.cjs` — FOUND
- `tests/browser-checks.mjs` — FOUND
- commit `b03e201` — FOUND
- commit `8ecb7fd` — FOUND
- commit `fd39f90` — FOUND
- commit `98782cb` — FOUND
- commit `916a3e4` — FOUND
