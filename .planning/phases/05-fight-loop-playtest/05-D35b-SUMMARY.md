---
phase: 05-fight-loop-playtest
plan: D35b
subsystem: render+interactions+style+gate
tags: [d-35, redirect, part-2-of-2, token-bounds, round-rules, s06-2, s06-7, s06-8, s06-12, s06-13, s07-2, s07-7, c17, authoring-surface, fight-floor]

requires:
  - phase: 05-fight-loop-playtest
    plan: D35a
    provides: "setTokenBounds and tokenBounds, setRoundRule in setActionCost's idiom, rulesNaming exported for this plan's warning line, build.rules capped at 8, and a codec that already carries both"
  - phase: 05-fight-loop-playtest
    plan: D32b
    provides: "the dense-row language this plan copies onto a page region — .ae-term-read, .ae-term-head, the one-line row, and termReading's arrangement of symQty"
  - phase: 05-fight-loop-playtest
    plan: D31
    provides: "the state/input split that decided where the reading goes and where the editing does not"
  - phase: 05-fight-loop-playtest
    plan: D29
    provides: "[S06.12]'s symQty / symDelta / symBox / data-tsay, the notation this plan defines a fifth caller for"
  - phase: 05-fight-loop-playtest
    plan: D30
    provides: "SYM_TAKEN, symMinusOnto and [C14.5]'s geometry, reused unchanged on a fourth surface"
  - phase: 05-fight-loop-playtest
    plan: "12"
    provides: "the view switch's data-vw — the shipped precedent for a control inside #app that [S07.1] must not resolve"
provides:
  - "a range pair on the token editor — two static fields, the name field's own commit contract, and a sentence saying what the pair IS"
  - "[S06.13] and [S07.7] — the round rules as an editable list in the BUILD view, eight static id-less rows, data-rr and not data-act"
  - "[S06.12] symRoundParts / symRoundWho — a round rule's reading, defined once for the two surfaces that draw it"
  - "[S06.7]'s 'Each round' block inside the round-STATE area: the same rules, no control in them"
  - "[S06.8] ldTallyLines — the what-changed reading walks the tally bags, so a decay is visible on Advance"
  - "[S06.2] rulesNamingText — the line beside Remove names the round rules a removal breaks"
  - "[C17] THE ROUND RULES; gate checks 115, 116, 117; browser cells 25, 25b, 25c"
  - "FIGHT_FLOOR re-derived by measurement, 132 -> 248; deferred-items 15 and 16"
affects: [05-11]

tech-stack:
  added: []
  patterns:
    - "a control inside #app that the board's own delegated listener must not resolve, told apart by a private data attribute rather than by a guard"
    - "one notation function handing back FRAGMENTS rather than a node, so two surfaces each render it with their own say-er and their own classes"
    - "static rows carrying no id at all, addressed by a data attribute off their own list, because the surface never needs getElementById"
    - "a floor re-derived by driving the same sweep against the artifact before and after and taking the SMALLER of two deltas"
    - "a browser cell turned before it shipped because its own screenshot contradicted its own green"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D35b-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - tests/browser-checks.mjs
    - .planning/phases/05-fight-loop-playtest/deferred-items.md
    - .planning/STATE.md

key-decisions:
  - "THE READING IS IN THE FIGHT AND THE EDITING IS IN THE BUILD, AND THE ALTERNATIVE IS RECORDED RATHER THAN ARGUED AWAY. The dispatch offered two placements: edit the rules inline in the fight tab's round-state block, or draw the same block in both views and edit only in the build one. The second shipped. D-31 settled that the state area is a READING OF THE BOARD AS IT STANDS and the input area is what you are about to do; a list of eight editable rows is neither of those, it is authoring, and every other thing on this board a student writes is written beside the rosters. The second reason is a room: an instructor stands in front of a projector in the fight view, and eight editable rows in that region are eight more things to mis-click while a board is live. WHAT THE DECLINED OPTION WOULD HAVE BOUGHT is real and is written into deferred-items 15: a student three rounds into a fight who wants to change a decay rule has to switch tabs, and both readings are on screen with only one of them editable — which is exactly the shape that reads as a broken control if it reads wrong. That is a rehearsal question and it is flagged as one."
  - "NOTHING IN THE NEW REGION CARRIES data-act, AND THAT IS MECHANISM RATHER THAN STYLE. #roundrules lives INSIDE #app, so [S07.1]'s delegated listeners see every press in it. actTarget() resolves the nearest [data-act] and hands it to fire(), which builds a payload of side / unitId / delta / tokenId — none of which is what setRoundRule takes. A chooser here wearing a data-act would have dispatched a real op with the wrong payload and put the styled error panel in front of a student on their first press. The controls carry data-rr and the amount field carries .rr-amt rather than .stp-field, so both of [S07.1]'s doors decline on their first line, and [S07.7] binds its own delegated root. The shipped precedent is the view switch's data-vw and the projection toggle's data-pv, both inside #app, both bound by [S07.6]; this is the third. Check 116 reads the partition off the page rather than trusting the paragraph."
  - "THE ROWS ARE STATIC AND CARRY NO id, WHICH IS THE ONE PLACE THIS BLOCK DEPARTS FROM #act-edit's SHAPE. They are static for #act-edit's stated reason and it is not negotiable: the region repaints every frame through SYNC_HOOKS, and a number a student is halfway through typing is what a rebuilt node throws away. They carry no id because this surface never needs getElementById — it addresses them by data-rr-slot off its own list, which is the lookup #board already makes for a unit's token row. The action editor pays sixteen shell ids for the other spelling; this pays four for the whole region. Check 116 holds the row count to App.data.MAX_ROUND_RULES in BOTH pages, which is check 65's discipline applied to a region whose rows cannot be counted by id."
  - "THE NOTATION IS DEFINED ONCE AND HANDS BACK FRAGMENTS, NOT A NODE. symRoundParts lives in [S06.12] for that region's own stated reason — a notation implemented twice is two things to keep in step, and a student reads the same rule on both surfaces ten seconds apart. It returns the {said}/{node} part list that fgSay, ldSay and rrSay all understand, rather than a finished element, because a finished element would make one of the two surfaces put a foreign node inside its own line and give up the class its stylesheet is written against. Check 116 asserts the two readings EQUAL TO EACH OTHER rather than each to a typed string — row 111's technique on a third pair — and carries the accessible name as well as the text, because a symbolic reading's text is nearly empty by construction and two empty strings are equal to themselves."
  - "THE PARTY IS SAID IN THE STUDENT'S OWN WORD AND IS NEVER INFLECTED. `who` resolves to a side and a reach, and the side's NAME is a word the student typed — so \"each cat\" is not available without singularising a word this tool did not choose. It says the faction's name and adds \", each unit\" after it for the per-unit reach. The name carries no exemption marker, which is the shipped treatment of a faction name on [S06.7]'s .fg-side-head and [S06.8]'s .ld-now-side; adding a fourth channel for faction names is a decision no plan has taken and this one did not take it either."
  - "A REFUSED BOUND GOES THROUGH THE FILE'S ONE REFUSAL SURFACE AND THE PERMANENT SENTENCE IS A READING, NOT A WARNING. The dispatch asked that a refused bound read as a page-owned sentence the way other refusals do, and the way other refusals on this dialog do is commitName's: Enter is loud and earns a readable refusal through [S08]'s panel, blur is quiet and puts the recorded figure back. That contract is kept argument for argument, and setTokenBounds' own sentences are already page-quality — \"The least \\\"Chill\\\" a unit or a side may hold cannot be more than the most: 9 is above 3.\" ONE sentence is genuinely the page's and it is the one that never reaches an op: text that is not a number at all, which parseField's own wording is the model for. The permanent line under the pair is a READING re-derived from state on every repaint, not a refusal that would have to survive a frame nobody scheduled — a refused op does not commit, so a sentence written into that node on a refusal would sit there until an unrelated repaint wiped it."
  - "THE SHIPPED 0-TO-99 READS AS WHAT IT IS, AND THAT SENTENCE IS THE HALF OF THIS SURFACE THAT IS NOT OBVIOUS. Every board starts with every type bounded to the pair int() has enforced since Phase 1, which is why part one's schema change moved no number anywhere. Without a line under the fields, a student opening a type they have authored nothing on reads two boxes of digits with no way to tell an authored range from the one the artifact begins with. One branch says which; the other says the thing a student standing in front of a tightened range needs and cannot see — that bounds clamp at WRITE time and do not reach back over the numbers already on the board."
  - "THE TALLIES JOINED THE WHAT-CHANGED READING, AND THAT WAS A DEFECT RATHER THAN A FEATURE. ldNowSide walked the pool, health, shield and the standing flag and said nothing about a tally at all — so a student who invented Rage, wrote an action that adds two of it and advanced the round watched the number move on the card and read \"Nothing on this side changed in round 1\" directly above it. That was a gap before D-35 and a defect after it, because \"-1 of a status effect token each round\" is the developer's own second example of what a round rule is for. Fixed through the same symDelta every other line goes through, over the UNION of both bags — a tally of zero deletes its key, so walking only the live bag would make the last point of a decay, which is the point a student is watching for, the one point that draws nothing."
  - "WHAT THE READING DOES NOT SAY IS WHICH RULE MOVED THE NUMBER, and the alternative needed an ops change this dispatch was scoped out of. Attribution would mean advanceRound writing a per-rule record beside `did` and `hand`, and part one finished the ops and the codec. It is also not what this surface has ever done: it has never attributed a health change to an action either, because FIGHT-15's design is a diff derived at render time with no second structure claiming to be what happened. The \"Each round\" block says what the rules ARE; the number moving says what they DID. Deferred-items 16 carries the question and the shape of the fix if a room says it is owed."
  - "FIGHT_FLOOR MOVED 132 -> 248 BY MEASUREMENT AND DIALOG_FLOOR DID NOT MOVE AT ALL, AND THE DIFFERENCE BETWEEN THE TWO IS WHY BOTH NOTES ARE WORTH READING. FIGHT_FLOOR is a roster-INDEPENDENT constant, and both new regions draw the same number of strings on every board, so all of the change lands on it. Four roster shapes were driven against this artifact and against the one before the change, undressed and again dressed: the delta is 116 undressed and 119 dressed in every column, and the per-unit cost is unchanged at 30 and 32 — which is the check on the whole re-measurement, because a change that had touched a card would have moved it. The SMALLER delta is taken, because a move has to be a lower bound on what the change adds to any board a student can build. DIALOG_FLOOR stays at 138 against a measured 173, which is the third plan in a row making that call: it is a tripwire for a surface going dark, not a ratchet on a growing one."
  - "A COMMENT IN [S05] THAT SAID SOMETHING FALSE IS CORRECTED IN THE OPEN. applyRoundRules' paragraph read \"removeTokenType refuses to remove a type a round rule names\". It does not, deliberately — plan 05-D35a's own summary records the opposite decision, that the removal is allowed and the rule is not rewritten because a rewritten rule is a silently changed rule. The correction names all three places that actually close the case, one of which is the surface this plan built."

requirements-completed: []

metrics:
  duration: one session
  completed: 2026-09-01
---

# Phase 5 D-35b: the three authoring surfaces — Summary

**A student can now write a token type's range in the token editor, write what happens at the end
of every round in a block beside the rosters, and — on Advance — watch the rule they wrote take a
point off a type they invented, in the fight's own symbolic notation, on the surface that exists
to say what moved. Part one made both features data and rendered nothing; this renders all of it
and adds no op, no codec change and no default.**

---

## What shipped

### 1. The range, on the token editor

A `Range` group between `Name` and the appearance groups: a legend and its note on one line
(`.ae-term-head`'s measurement, reused), two static fields with permanent visible words at the
18px projector floor, and a sentence under them.

The two fields keep `#tok-pick-name`'s contract argument for argument — Enter commits loudly,
Escape puts the recorded figure back, blur commits quietly, and neither is written while it holds
focus (D-19). Two things differ and both are written at the site: it parses before it dispatches
(a `+5` on a bound would mean "raise the ceiling by five", which is an adjustment nobody asked
for), and the end being written is read off the field's own `data-pk-bound` rather than off the
dialog, for the reason `commitName` states at length about the TYPE.

**Nothing on the page clamps.** `setTokenBounds` refuses a bound outside `[0, MAX_ALLOC]` and
refuses a least above its most, and the page hands over what was typed so the refusal is heard.

The sentence has two branches and the second one is the point:

| the pair | what the line says |
|---|---|
| `0` and `99` | …keeps it between 0 and 99. **That is the range every board in this artifact starts from.** |
| anything else | …keeps it between 0 and 3. **A number already on the board stays where it is until something writes it again.** |

`pickerSig` carries the pair, or the dialog would never repaint on a bounds edit — which is
`syncPicker`'s own recorded defect about the selection marks and an undo, arriving on a second
property.

### 2. The round rules, in the build view

`#roundrules`, a section inside `#app` after `#board`, hidden by `[C15]` in the fight view. Eight
static rows — `App.data.MAX_ROUND_RULES` — each a reading, a party chooser, a token chooser and
an amount, all on one line:

```
Each round   What Advance does to the board after the declarations have landed, in the order it
             is written here. …Put a minus in front for a change downward.

Cats ▲▲▲              [None][Cats][Mechs][Cats, each unit][Mechs, each unit]  [Health][Action points]…   [ 3]
Mechs ▲▲▲             [None][Cats][Mechs]…                                                                [ 3]
Cats, each unit ▪̶     [None][Cats][Mechs][Cats, each unit]…                   …[Chill]                    [-1]
                                                                              [Health][Action points]…
```

The last row is the empty slot: no party chooser, because there is no rule for a party to name
yet (`fillWhoChoices`' ruling one surface over), and a token pressed on it starts a rule. The
emptying entry is the FIRST entry of the party chooser — the same word in the same position the
action editor's clearing entry occupies — because `setRoundRule` takes `CLEAR_TERM` in the `who`
position.

`[C17]` is `[C12]`'s dense language on a page region: 6px inside the list, a hairline from the
second row onward, `.rr-read` at the same 96px min-width and the same `--tok:16px`, `.rr-pill`
carrying `.ae-pill`'s values and D-32b's tick geometry. Not one new colour literal.

### 3. The fight says what the rules are, and then what they did

**What they ARE** — `[S06.7]` paints an `Each round` block into `#fight-state`, below both
columns, from the same `symRoundParts`. Zero controls in it. Measured in both browsers: three
lines, 148px, inside the state area and above the input area, with `#roundrules` reading
`display: none` in the same frame.

**What they DID** — `ldNowSide` walks the tally bags now, so the decay reads
`Cat 1 ▪▪ → ▪` with `Cat 1 — Chill 2 to 1.` on the hover, beside the pool's own
`▲▲▲▲▲▲ → ▲▲▲▲▲▲▲▲▲`.

### 4. The line beside Remove

`namedByText` gained a second sentence from `rulesNaming` — exported by part one for exactly
this:

> One round rule changes Chill. Removing it will leave that rule naming a type this board no
> longer holds, and the next Advance will say so and stop.

It names no rule, because a round rule has a slot and not a name, and "round rule 3" is a number
that means nothing on a surface where the rules are not numbered. It disables nothing.

---

## The end-to-end path, driven in both harnesses

Check 117 and browser cells 25/25b/25c walk the same story:

| step | node gate | browser |
|---|---|---|
| make a type, name it, give it a ceiling of 3 | real fields | real fields |
| a floor of 9 above that ceiling | refused, panel names Chill, field back to 0, board unmoved | same, all four columns |
| a health written afterwards | lands on 4, not 9 — the clamp is at write time | — |
| write `-1 Chill on each cat, every round` | real pills, real amount field | real clicks, real `fill` + Enter |
| two rounds, nothing declared | 3 → 2 → 1 | 3 → 2 → 1 |
| the decay in the what-changed reading | `Chill 3 to 2.` then `2 to 1.`, unit named | `Chill 2 to 1.`, screenshot read back |
| the pool's own +3 | two lines, one per side | two lines |
| reopen the editor, read the line beside Remove | names the round rule | — |
| remove the type, Advance | refused BY NAME, round exactly where it was | — |

---

## Deviations from plan

### Auto-fixed issues

**1. [Rule 1 — Bug] A paragraph in `[S05]` said something false about `removeTokenType`**

- **Found during:** reading `applyRoundRules` before building the removal warning.
- **Issue:** the comment read *"removeTokenType refuses to remove a type a round rule names"*. It
  does not, and plan 05-D35a's own summary records the opposite decision in as many words: the
  removal is allowed and the rule is not rewritten, because a rewritten rule is a silently
  changed rule.
- **Fix:** corrected in the open, quoting what stood there, and naming all three places that
  actually close the case — `ruleRoundRules` at fire time, `[S04.3]` on a pasted code, and
  `[S06.2]`'s line beside Remove, which is this plan's.
- **Commit:** `9dd2fca`

**2. [Rule 2 — Missing] The what-changed reading never said a tally moved**

- **Found during:** wiring the third surface.
- **Issue:** `ldNowSide` walked ap, health, shield and the standing flag. A decay — the
  developer's own second example of what a round rule is for — moved a number on the card while
  the reading directly above it said "Nothing on this side changed in round 1".
- **Fix:** `ldTallyLines`, over the union of both bags, through the same `symDelta`.
- **Commit:** `9dd2fca`

**3. [Rule 2 — Missing] The region index had stopped being complete**

- **Found during:** adding `[S06.13]` and `[S07.7]`.
- **Issue:** `[S06.12]` and `[C14.5]` (D-29's) and `[C16]` (D-33's) were never added, and the
  banner's own rule says a table of contents that has quietly stopped being complete is worse
  than none.
- **Fix:** all six entries added, including this plan's, in the register the paragraph has kept
  three times before.
- **Commit:** `a063d16`

### Nothing was asked

No architectural decision arose. The placement fork was an orchestrator call the dispatch handed
down with instructions to choose and record, and both halves of that are done here and in
deferred-items 15.

---

## What the probes found

Every probe was taken after the commit it tests and reverted from git.

| probe | what it broke | what reddened |
|---|---|---|
| CX | `symRoundParts` passes `false` for the removal flag | 116, on `marks=0` |
| CY | the fight's line gains a prefix `symRoundParts` did not write | 116, on `equal=false` |
| CZ | the unit tally diff removed from `ldNowSide` | 117, and nothing else |
| DA | the rules sentence removed from `namedByText` | 117, and nothing else |
| DB | `setTokenBounds` clamps instead of refusing | 115, and nothing else |

**And one probe found a defect in a check rather than in the artifact.** Check 116's reading
comparison read `node.textContent`, which on this stub is a plain PROPERTY and not an aggregating
getter — so a line assembled one node per fragment read as the empty string, both sides of the
equality were empty, and the pair was equal because neither carried the party word. It walks now,
which is what `harvestInto` does one layer up and for the same reason.

---

## The browser cell that was turned before it shipped

**Cell 25's first draft asserted the range group's viewport rectangle — `top >= 0 && bottom <=
innerHeight` — and it PASSED in both browsers at both sizes. Its own screenshot at 1366×768 showed
the two fields cut in half by the dialog's sticky foot with the sentence under them entirely
below the fold.**

That is D-33 P1-2's finding arriving on a new group, word for word: a box whose viewport-relative
rectangle is on screen can still be clipped by a SCROLLING ANCESTOR, and a cell that reads only
the rectangle is green over exactly the defect the audit photographed. The cell reads cell 6b's
clipped-by-any-scrolling-ancestor walk now, after driving the group into view, and additionally
requires the sentence to be on screen WITH the pair — because a reading that arrives one scroll
after the control it explains is a reading nobody reads.

**The placement is not claimed to be above the fold, and that is deliberate.** The dialog is
1466px against 726px of viewport at 1366; Shape, Colour and Emoji are below the fold too, which is
what D-33 P1-3 gave this dialog a scroller and a cue for. Range ships ABOVE all three, so it is
the first thing below the fold rather than the last.

A second cell was corrected before it shipped: 25b measured the removal mark's LEFT EDGE against
the shape and read −6px, where cell 23d measures the mark's CENTRE and reads 0. `[C14.5]`
translates the sign `-50%`, so the two readings differ by half a glyph over identical geometry.
25b uses 23d's measurement now, and both read 0px / 25% in all four columns.

---

## Measured, four ways

Real Chrome and real Edge, 1920×1080 and 1366×768, headless. All four columns agree exactly.

| reading | value |
|---|---|
| the range pair | 1 line, 43px, fields reading `0` / `3` |
| a refused bound | panel open, field back to `0`, floor still 0 |
| `#roundrules` | 328px, 4 rows shown, tallest row 48px |
| the decay mark | on a `.tok`, `color(srgb 1 0.427451 0.470936)`, 0px from the left, 25% down |
| the fight's reading | 3 lines, **0 controls**, 148px, inside the state area |
| the decay on Advance | round 3, tally 1, one decay line, two pool lines |

---

## Gate

| | before | after |
|---|---|---|
| in-file selftest | 1327 / 0 | **1327 / 0**, exit 0 — this plan adds no `[S09.*]` row |
| interaction gate | 201 of 201 | **204 of 204** (+115, 116, 117) |
| stub-drift | 136 shell ids | **144** (+8: four on the picker, four on the new region) |
| `#app` (setup) | 131 | **175** |
| dialogs | 172, floor 138 | **173, floor 138 — deliberately unmoved, third plan running** |
| `#app` (fight) | 592, `FIGHT_FLOOR` 132 | **646, `FIGHT_FLOOR` 248 — re-derived by measurement** |
| browser checks | 242 / 0 headless | **254 / 0 headless** (+12: cells 25, 25b, 25c × four columns) |

`counter|balanc|rating` **0**, whole document. `url(` **0**. `innerHTML` **0**.
`createElementNS|<svg` **0**. **Not one new hex literal.** `git diff 03987e0..HEAD` over
`cats-vs-mechs.html` touches no `DEFAULTS.`, no `WIRE_BOUNDS`, no cap and no line of `[S04]`: the
ops, the codec and the defaults are part one's and this plan did not go near them. The only
change inside `[S05]` is the corrected comment above.

### The floor, re-derived

Four roster shapes, driven against this artifact and against the one before the change:

| | before | after | delta | | before | after | delta |
|---|---|---|---|---|---|---|---|
| **undressed** 2×2 | 212 | 328 | **116** | **dressed** 2×2 | 220 | 339 | **119** |
| 3×3 | 272 | 388 | **116** | 3×3 | 284 | 403 | **119** |
| 4×3 | 302 | 418 | **116** | 4×3 | 316 | 435 | **119** |
| 5×3 | 332 | 448 | **116** | 5×3 | 348 | 467 | **119** |
| **per unit** | 30 | 30 | **0** | **per unit** | 32 | 32 | **0** |

The per-unit cost is unchanged in every column, which is the check on the whole re-measurement.
132 + 116 = **248**.

---

## Known stubs

None. Every surface this plan added is wired to live state and driven in both harnesses.

## Threat flags

None. No new network surface, no auth path, no file access and no schema change at a trust
boundary — the schema was part one's, and every string this plan renders is assembled from the
artifact's own words plus a student's, through the four exemption channels that already exist.

---

## What is carried forward

Two items, both for the 05-11 playtest and both written into `deferred-items.md`:

**15 — where a student expects to edit a round rule mid-fight.** The reading is in the fight and
the editor is in the build, and both are on screen with only one of them editable. Whether that
reads as a broken control is a room's answer. The cheap fix if it does is one line in the state
block saying where the rules are written.

**16 — the reading says a number moved and never which rule moved it.** Attribution needs
`advanceRound` to write a per-rule record, which is an ops change this dispatch was scoped out of.
If the "Each round" block above is enough context, nothing is owed.

## Self-Check: PASSED

- `.planning/phases/05-fight-loop-playtest/05-D35b-SUMMARY.md` — FOUND
- `cats-vs-mechs.html` — FOUND
- `tests/selftest-node.cjs` — FOUND
- `tests/browser-checks.mjs` — FOUND
- `.planning/phases/05-fight-loop-playtest/deferred-items.md` — FOUND
- commit `161bd75` — FOUND
- commit `c35e381` — FOUND
- commit `9dd2fca` — FOUND
- commit `57fb323` — FOUND
- commit `a063d16` — FOUND
- commit `fb08542` — FOUND
