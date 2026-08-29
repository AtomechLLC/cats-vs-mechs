# The viewport fix — the live board is now reachable on both screens

**Taken by the ORCHESTRATOR, outside the plan sequence.** This is not one of phase 5's numbered
plans, it has no PLAN.md and it produces no numbered SUMMARY. This file is the record.

## Why it was done here rather than at the checkpoint

Plans 05-06, 05-07, 05-08 and 05-09 each set a height dial while measuring against a page the
**next** plan then changed. Re-measured by plan 05-10 in real Chrome with one round resolved,
`#board`'s top stood at **1203 of 1080** and **1111 of 768** through real presses, and at
**1257 / 1048** through the ops drive plan 05-09 used. Either reading says the same thing: the
live board — the thing a student plays on — was off the bottom of the screen.

**Plan 05-11 is a blocking playtest.** It asks a person to play the shipped 9-Cats-vs-3-Mechs
default end to end, twice, hot-seat. **They cannot do that while the board is off screen.** So this
is not a polish item to defer into that checkpoint; it is a precondition for the checkpoint being
executable at all. That is the only reason it was taken out of sequence.

## Before and after — all four browser/viewport combinations

Real Chrome and real Edge, both driven from `file://` by Playwright 1.62.1 resolved through
`PLAYWRIGHT_DIR`, with nothing added to the repository. **Every reading is taken with a round
RESOLVED** — start the fight, declare on both sides, Advance, declare again — which is plan 05-08's
check-92 drive. The fresh-fight reading is the one that hid this for three plans and it is not used
anywhere below.

| `#board` top, one round resolved | Chrome 1920x1080 | Edge 1920x1080 | Chrome 1366x768 | Edge 1366x768 |
|---|---|---|---|---|
| **before** | 1257 | 1257 | 1048 | 1048 |
| **after** | **844** | **844** | **730** | **730** |
| viewport height | 1080 | 1080 | 768 | 768 |
| **board reachable without scrolling** | **yes** | **yes** | **yes** | **yes** |
| headroom | 236px | 236px | 38px | 38px |

**Both screens clear.** The four combinations agree to the pixel — there is not one number in this
document that differs between Chrome and Edge.

**And it stays cleared as the fight goes on.** Re-driven at thirty resolved rounds, which is
`MAX_PAST_ROUNDS`:

| | 1 round | 30 rounds |
|---|---|---|
| board top @1920x1080 | 844 | **844** |
| board top @1366x768 | 730 | **730** |
| ledger height / fight bar height @1080 | 489 / 587 | 536 / 587 |
| ledger height / fight bar height @768 | 392 / 481 | 392 / 481 |
| ledger list scrolled to its end | distance-from-end 0 | distance-from-end 0 |

The board does not travel at all, because the ledger stays shorter than the fight bar beside it and
the page pays the taller of the two.

## What changed, and whose section each part belonged to

Three edits, all inside sections **plan 05-06 owns** — its shell markup and its `[C14]` frame rule
— which is exactly why plan 05-09 declined to make them on its own last wave.

1. **`.fg-band`, a new wrapper in the static shell** around `#fightbar` and `#ledger`.
   Class only, **no id**: nothing queries it, nothing dispatches off it, nothing paints into it, so
   the three-part rule (id + `KNOWN_IDS` + stub node) is a cost with nothing to buy. The stub-drift
   gate stays at **111 shell ids**. Document order is untouched — a screen reader still walks the
   fight bar and then the ledger.
2. **`[C14]`'s `#fightbar, #ledger` frame rule rewritten onto the band.** The width and the
   computed left margin now live on one element instead of two, and the two regions are flex items
   that take **no width and no margin at all**. The side-by-side split turns ON above 1180px rather
   than being turned OFF below it, so the narrow arrangement — two full-width regions, one under the
   other, exactly what shipped before — is the one that does not depend on a query matching.
3. **`.ld-list` 34vh to 46vh**, which is the number plan 05-06 originally set it at. See below.

**`[C14]`'s cautionary paragraph was read before the rule was touched, and it is the reason edit 2
is shaped the way it is.** That paragraph records a `margin` shorthand landing after a computed
`margin-left` longhand, silently zeroing it, and putting a 1600px region 182px out of alignment with
the board it describes — with no error and no warning. Two consequences were taken from it:

- the frame is written **once**, on the band, and nothing below writes `margin` again — and after
  this change there is nothing below that *would*, because flex items need neither;
- the two places this change does write a longhand after a shorthand (`flex-grow` over `flex`) are
  the **safe** direction, and both say so at the site.

Re-driven at every width the original defect was measured at, in both browsers:

```
width  1920 1600 1440 1366 1280 1179 1178 1177 1100 1024 900 760 700
       band left and width match #board's at every one; 13 of 13, both browsers
```

## Did the 34vh property survive?

**It was lost by the rearrangement and recovered by the dial, and both halves are measured.**

Plan 05-08 chose 34vh because it was the smallest setting in which the **whole of the newest round**
was on screen at once. A ledger row wraps, so a narrower column is a taller round:

| ledger column width | newest round height |
|---|---|
| 1600px (stacked, before) | 353px |
| 846px (side by side, 1920x1080) | 446px |
| 568px (side by side, 1366x768) | 740px |

At 34vh — 367px on a 1080-tall screen — a 446px round no longer fitted. **46vh restores it**: the
list measures 450px and the round is 446px, so the whole of the newest round is on screen at once at
1920x1080, in both browsers.

**46vh is free, and that is the structural point of the whole change.** Side by side, the ledger is
no longer in `#fightbar`'s budget — the page pays the taller of the two regions, so every pixel the
ledger spends below the bar's own height costs the live board nothing. Measured:

| `.ld-list` | ledger height / bar height | board top @1920x1080 | @1366x768 |
|---|---|---|---|
| 34vh | 406 / 587 | 844 | 730 |
| **46vh** | **489 / 587** | **844** | **730** |
| 52vh | 489 / 587 | 844 | 730 |
| 60vh | 489 / 587 | 943 | 748 |

46 and 52 measure identically because the list is content-sized at 450px and reaches neither
ceiling; 60vh crosses the fight bar's height and the board starts moving again. 46vh is the smallest
setting that holds a whole round with headroom.

**`.fg-sides` (34vh) and `.ld-now-body` (20vh) were NOT turned.** The instruction not to solve this
by turning the dials down was kept: nothing went down, one thing went back up.

## `#strip` still pins

Plan 05-09 measured that a sticky element taller than its space stops pinning — it read top **-203**
where it should have read 64. Re-checked after the rearrangement, at one round and at thirty, in
both browsers:

```
#strip position                       sticky        (every board, both browsers)
overflow of every ancestor of #strip  board:visible | app:visible | BODY:visible | HTML:visible
viewport top at page scroll 0/800/1600/2400
  @1920x1080                          844 -> 107 -> 107 -> 107
  @1366x768                           730 ->  99 ->  99 ->  99
```

It pins, at both sizes, at both depths, in both browsers. The band takes **no overflow of any kind**,
and the reason is written at the site rather than left to be inferred.

## Both gates, green

```
node tests/selftest-node.cjs      1188 passed, 0 failed          exit 0
  interaction gate                160 of 160
  stub-drift                      111 shell ids
  #app (setup)                    127
  #app (fight)                    420, FIGHT_FLOOR 120
  dialogs                         145 across 4 roots
  proposal pane                   60, floor 23
  Layer A                         18 words, 0 hits
  Layer B                         7522 literals, 0 hits
  perf                            10 ms of 50

node tests/browser-checks.mjs     22 passed, 0 failed
```

`url(` prints 0 document-wide; the three naming greps print 0; `createElementNS|<svg` prints 0;
`innerHTML` prints 0; `text-wrap` prints 0; the hex pattern over `[C14]` prints 0. One classic
`<script>`, one `<style>`.

## `FIGHT_FLOOR` was NOT re-measured, and that is the honest reading

The fight-mode harvest reads **420** rendered strings against a floor of **120** — byte-identical to
plan 05-09's figure. Layer C walks rendered text and accessible names; a class-only wrapper carries
neither, and no rule in this change adds, removes or rewords one string. **The harvest did not
change, so the floor does not move.** This is the same correction plan 05-09 recorded about its own
task 1: a floor moves when the surface it bounds gains something roster-independent, not because a
plan touched the file.

Layer B moved 7445 to 7522 literals, which is prose in the comments this change rewrote. Zero hits.

## What could NOT be fixed, stated plainly

**1. At 1366x768 the newest round does not fit whole.** 46vh is 353px on that screen and a round in
a 568px column is 740px, so the newest round scrolls inside `.ld-list`. **This is not a regression:**
every row of plan 05-09's dial sweep read *no* at 768, including the shipped 34/34/20 setting, and
the pre-change file measured `newest-round-whole = false` at 1366x768 in this exercise's own baseline
run. It is a property of a 768-tall screen rather than of an arrangement, and no setting of any dial
changes it without pushing the board back below the fold.

**2. Below a 1180px viewport the two regions stack again**, and the page pays their sum there. That
is the arrangement that shipped before this change, so nothing is worse; but a laptop narrower than
1366 does not get the fix. The breakpoint is not a preference — 736 + 380 + 18 = 1134 is what the two
regions need on one line, and the band is `min(--boardw, 100vw - 44px)` wide.

**3. Nothing in this repository will go red if any of it is undone.** No numbered check asserts that
the board is on screen, that `#strip` pins, or that the newest round fits. `tests/selftest-node.cjs`
computes no layout, and `tests/browser-checks.mjs` was deliberately left at its 22 checks. Every
number in this document came from a scratchpad driver that is not committed. **That is exactly how
four consecutive plans each set a height dial against a page the next plan then changed**, and it is
recorded as limitations entry 21 rather than papered over.

**4. Two readings only a room can take**, and they are on `REHEARSAL.md` B3: whether the bar and the
ledger side by side read as one surface or as two competing for the same glance — the bar is now the
*narrower* of the two on a projector, which is not the emphasis it had at full width — and whether a
past round in a narrower column is still legible at a glance from the back of the room.

## Where this is written down

- `cats-vs-mechs.html` — the band's own comment in the shell, `[C14]`'s rewritten frame paragraph
  with the full before/after table, the width-split paragraph with its arithmetic, the dial's whole
  history (46 to 34 to 46, and why the middle number was never wrong), and `[C14.1]`'s stale
  "two dials, one budget of 80vh" sentence amended in place rather than left standing.
- `tests/selftest-node.cjs` — limitations entry **21** rewritten from a decision into a fixed item
  with what the harness still cannot see; entry **22** given the reading it asked for.
- `.planning/REHEARSAL.md` **B3** — rewritten from a decision-with-numbers into a fixed item, with
  what is left for the room.
- `.planning/phases/05-fight-loop-playtest/deferred-items.md` item **2** — closed, pointing here.
