---
phase: 05-fight-loop-playtest
plan: D32a
subsystem: data-model+ops+model+render+codec+gate
tags: [d-32, redirect, part-1-of-2, caps, multi-term, s01, s02, s04, s05, s06-5, s06-7, s06-9, wire-bounds, refusal-matrix]

requires:
  - phase: 05-fight-loop-playtest
    plan: D31
    provides: "the two-panel round surface and its rows, kept working at the new caps with no redesign"
  - phase: 05-fight-loop-playtest
    plan: "13"
    provides: "spokenFor and defaultAt — spokenFor is now a reading of the pool map this plan added, not a second walk"
  - phase: 04-share-reset
    plan: "02"
    provides: "the count-driven grammar, which is why the wire version did not have to move"
  - phase: 04-share-reset
    plan: "03"
    provides: "the seventeen-shape refusal matrix and its recomputed-digest mechanism, extended here to twenty"
provides:
  - "MAX_ACTION_COST 1 -> 4, MAX_ACTION_REQ 2 -> 4, MAX_ACTION_XF 2 -> 4, and WIRE_BOUNDS.maxActionCost moved in the SAME change"
  - "setActionCost(side, actionId, index, tokenId, n) — the argument order its two siblings already had"
  - "four cost rows, four requirement rows, four transformation rows and four proposal rows in the shell; #act-edit-cost became #act-edit-cost-0"
  - "App.model.actionCostTerms — the file's ONE reader of a cost list; costIsApOnly; isPoolToken; spokenForPools; pooledAt"
  - "affordability grows `pays`: one row per cost term, with need, have and whether that holding is a POOL"
  - "condition (b) of the disable contract asked once per named pool, with the row's own pledge given back per pool"
  - "advanceRound spends every term a cost names and records `spent` — every term, want beside paid"
  - "gate rows 109 and 110; three over-cap shapes in the refusal matrix (17 -> 20)"
  - "deferred-items 10 — the density half of D-32, which part 2 owns"
affects: [05-11, "the second D-32 dispatch"]

tech-stack:
  added: []
  patterns:
    - "a derivation split in two so the meaning survives the list getting longer — one reader of the whole cost, one projection of the action-point half over it"
    - "a report that grows a per-term array rather than picking one term to be THE figure, because two token types cannot be added up"
    - "a pool defined by SCOPE rather than by a list of ids, so a student's own type qualifies by the same test a shipped one does"
    - "a vocabulary passed DOWN as an argument, with the no-vocabulary answer chosen so every pre-existing reading is unchanged"
    - "a comment that a change falsifies ANSWERED in place, quoted verbatim, rather than deleted"
    - "probes run against a SNAPSHOT after the commit, one per seam, to prove each new row can actually redden"

key-files:
  created:
    - .planning/phases/05-fight-loop-playtest/05-D32a-SUMMARY.md
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - .planning/phases/05-fight-loop-playtest/deferred-items.md

key-decisions:
  - "A POOL IS ACTION POINTS OR A TYPE KEPT AT SIDE SCOPE, AND NOTHING ELSE — this is the one genuinely new ruling D-32 needed, and the EXCLUSIONS are the argument. D-24 says a student's type works on the same terms as a shipped one, so a side-scope tally is a pool: the fight slice holds one bag per side and the applier already writes it. Health and shield are NOT pools and cannot be: they live on units, a side of nine cats at 3 health has 27 health and no number called 'the side's health', so spending 2 of it means choosing WHICH cat pays — and choosing that is adjudication, the line this artifact is built on. A unit-scope type a student invented is excluded by the identical test. presentOnCaster still SUMS health and shield for a REQUIREMENT, because reading is not spending. A cost naming a non-pool is drawn, reported, disables nothing and spends nothing; the student wrote a rule the tool has no economy for and the table has one."
  - "actionApCost KEEPS ITS MEANING BY BEING SPLIT RATHER THAN WIDENED. actionCostTerms is the file's one reader of a cost list; actionApCost is the action-point projection over it. That preserved every existing caller on every board that could exist before D-32 — no cost field still costs the shipped one point, an emptied list still refuses, a cost in another token still refuses — and it made ONE entry of the pinned refusal table change answer on purpose: a cost of one action point AND one health now prices its AP half at 1 where it used to refuse. THE LINE THAT MAKES THAT SAFE IS costIsApOnly IN actionModelled. bestPair divides the pool by the AP price, so without it a partly-priced action would be afforded exactly as often as a plain one-point action and the projection would overstate the side's throughput, in silence, on a projector. It is NAMED as not covered instead, which is D-16's stance arriving at the case D-32 created."
  - "THE VERSION STAYED v1 AND THAT IS A FINDING, VERIFIED, NOT AN ASSUMPTION. [S04.2] writes a term list as join(SEP.item) and [S04.3] reads it as split(SEP.item) and walks whatever comes back — the grammar is count-driven at every level, so a four-term record is the same SHAPE as a one-term record and nothing hardcoded the old caps. A code carrying four terms pasted into a copy of the file from before D-32 therefore PARSES and is then refused AT THE CAP, by name, rather than loading garbage. That is the codec doing its job across a version skew; D-32 says note it, not fix it. The round trip is asserted as an equality of CODES and not only of boards, because a decoder that reordered a term list hands back a board that compares equal under key sorting and re-encodes differently — and a cost is an ORDERED list, drawn in the order the student wrote it on every surface that draws one."
  - "THE COMMENT THAT SAID TALLIES DELIBERATELY DO NOT DEPLETE IS ANSWERED, QUOTED VERBATIM, RATHER THAN DELETED. It said affordability had a pool figure for action points and nothing else, so a tally shown draining would be the surface inventing an economy the applier does not run. Every clause of that was true and the first has stopped being true: the applier moves side bags now. The ASYMMETRY did not disappear, it moved down a level — a type kept per unit still does not deplete and cannot. Keeping the old paragraph in view is what stops the next reader concluding the rule was never thought about. The same treatment went to the cost chooser's 'no emptying entry' decision, which D-32 reverses because with four rows there is no amount-of-nothing to write and MIN_ACTION_COST is one."
  - "THE SIZE ROWS WERE RE-MEASURED AND NOT SCALED. Board E went 675 -> 879 and its gate moved 800 -> 1000; the adversarial ceiling went 2984 -> 3434 and its emoji twin 3186 -> 3636. None of those was derived from the old figure by arithmetic, because the code is not linear in the term count — the name table pays for each distinct name once and the ordinals are shared — and a scaled number would be a guess wearing a measurement's clothes. The ceiling moved 15% for a doubling-and-then-some of the term counts, which is exactly what [S01]'s own paragraph predicted: the tally stream and the name table did not move at all and the action records carry the whole difference. So the standing instruction is unchanged and now names the third constant too: do not move these caps to buy build-code characters."
  - "THE REFUSAL MATRIX GAINED THREE SHAPES AND NOT ONE, because [S04.3] runs three SEPARATE cap tests over three separate fields. One over-cap row would leave two of them unreached, and PROBE CA measured exactly that: collapsing the requirement and transformation messages into the cost one left the whole interaction gate at 194 of 194 and only the two new build-code rows red. Each shape reaches its own guard past a RECOMPUTED digest, and the distinct-`what` count is the row that says three readings rather than one repeated."
  - "ROW 110 EXISTS BECAUSE 69g AND 109 EACH READ ONE SURFACE. 69g reads the editor over a record the ops planted; 109 reads the picker and the disable over a two-term cost. Neither carries a term from a KEYSTROKE to a resolved round, and the seams between them are exactly where a slot argument gets dropped. PROBE BW (the chooser writes every pill into slot 0) and PROBE BX (the amount field sends no index) each left the whole suite at 1253/0 and reddened row 110 alone."

requirements-completed: []

duration: 240min
completed: 2026-08-30
---

# Phase 05 D-32 part 1: The Multi-Term Data Model Summary

**An action can carry four cost terms, four requirements and four changes now, and a
cost spends what it names all the way down: the preview depletes every pool it names,
the disable checks every one of them against what is left, Advance spends each of them
out of the pool it names and records what each one actually paid, and the codec carries
all of it on the same v1 wire because the grammar was already count-driven. Health and
shield are deliberately NOT pools — they live on units, and picking which unit pays
would be the tool adjudicating — so a cost naming them is drawn, reported, and spends
nothing. The other half of D-32, the density pass on the terms region, is NOT here and
is deferred on purpose: a plan that redesigned the editor while it was also moving three
caps, a codec bound, an op signature and the whole disable arithmetic would have had no
way to say which of those two things broke a row.**

## The gate, before and after

| | before (post-05-D31) | after |
|---|---|---|
| suite | 1216 passed, 0 failed | **1253 passed, 0 failed** (+37) |
| interaction gate | 192 of 192 | **194 of 194** (+2: 109, 110) |
| stub-drift | 121 shell ids | **135** (+14, all with KNOWN_IDS entries and stub nodes) |
| `#app` (setup) | 128, floor 117 | **128 — unchanged.** No setup surface touched |
| `#app` (fight) | 592, `FIGHT_FLOOR` 132 | **592, `FIGHT_FLOOR` 132 — neither moved** |
| `#app` (fight, sidebar open) | 592 | **592** |
| dialogs | 145 across 4 roots, floor 138 | **166** (+21: eight new term rows' choosers) |
| proposal pane | 60, floor 23 | **62** (+2: two more proposal rows) |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 8167 literals, 0 hits | **8586 literals**, 0 hits |
| perf | 100 commits in 6 ms (budget 50) | 100 commits in **7 ms** |
| **browser checks** | 206 passed, 0 failed | **206 passed, 0 failed** |

`FIGHT_FLOOR` did not move and that is worth one line rather than silence: the caps
change what a student CAN author and nothing about what the shipped board renders, so
the fight page paints the same 592 strings it painted before.

## The caps, and everything that had to move with them

| what | was | now | where |
|---|---|---|---|
| `MAX_ACTION_COST` | 1 | **4** | `[S05]`, beside the op that enforces it |
| `MAX_ACTION_REQ` | 2 | **4** | `[S01]` |
| `MAX_ACTION_XF` | 2 | **4** | `[S01]` |
| `WIRE_BOUNDS.maxActionCost` | 1 | **4** | `[S04]`, re-typed, held to the op by `[S09.11]` |
| shell cost rows | 1 | **4** | `#act-edit-cost` became `#act-edit-cost-0` |
| shell requirement rows | 2 | **4** | |
| shell transformation rows | 2 | **4** | |
| shell proposal rows | 2 | **4** | |

**The drift row did its job and that is recorded at both ends.** Raising
`MAX_ACTION_COST` reddened `[S09.11]`'s "the decoder re-runs the SAME cost cap the term
writer enforces" before anything downstream could go green over an op that admitted four
terms and a wire that refused them. Both numbers moved in the same commit. The
requirement and transformation caps get no drift row because `[S04.3]` does not re-type
them — it reads `App.data`'s own constants, since `[S01]` sits above it — and a new row
now asserts that the wire record holds exactly three bounds, so the absence reads as a
decision rather than an oversight.

## Every row turned in the open

Each recorded RED first, on the commit that moved the thing it pinned.

| row | was | now |
|---|---|---|
| `[S09.1]` requirement cap | asserted 2 | asserts 4, beside a new cost-cap row and a row that the three caps are one number |
| `[S09.1]` transformation cap | asserted 2 | asserts 4 |
| `[S09.10]` cost cap | "holds at most one term", 1 | "at most MAX_ACTION_COST terms", 4 |
| `[S09.10]` three-op arg table | cost arm had no slot | all three take the slot in the same position |
| `[S09.11]` `actionApCost` refusal table | listed "two terms at once" as unpriceable | that entry CHANGED ANSWER on purpose; two new entries added for the ways a longer list can be wrong |
| `[S09.11]` `affordability` key list | `apCost, apHave, met` | `apCost, apHave, pays, met` — same claim, more readings |
| `[S09.11]` board E size | "fits in 800, measures 675" | "fits in 1000, measures 879", re-measured |
| `[S09.11]` board H / I | 2984 / 3186 | **3434 / 3636**, re-measured |
| `[S09.11]` content-row count | 12 | **15** |
| `[S09.11]` distinct-guard count | 11 | **14** |
| `[S09.11]` hostile sweep totals | 37 in, 35 refused | **40 in, 38 refused** |
| `[S09.12]` round-record key list | no `spent` | `spent` added; `apPaid` / `apShort` kept, with the reason |
| gate 65 | counted 2/2/2 | counts against the three constants at 4/4/4 |
| gate 69g | five rows, five amounts | **twelve rows, twelve amounts**, counts read off the exported caps |
| gate `fgExpectedOff` | one-pool condition (b) | per-pool, vocabulary handed in |

## What a cost means now, in four functions

`App.model.actionCostTerms` is the file's **one** reader of a cost list. It makes the
shipped default explicit — a record with no `cost` field costs the one action point the
board always implied — and refuses the WHOLE list rather than half-reading it, because a
half-read cost is exactly the shape that lets a surface charge for two terms of a
three-term rule. An EMPTIED list still refuses, so clearing the last slot does not
quietly start charging the default.

`App.model.actionApCost` is the action-point projection over that list: the sum of its
`ap` terms, `null` when there are none. Two `ap` terms SUM, because the editor gives
every slot its own chooser and dropping one of two identical lines would be the tool
deciding which of them the student meant.

`App.model.costIsApOnly` is what `actionModelled` asks, and it is the whole of what
stands between a partly-priced cost and a projection that overstates itself.

`App.model.isPoolToken(tok, vocab)` rules what a pool is. With no vocabulary handed in,
`ap` is the only pool — which is deliberate, and is what makes every reading taken before
D-32 answer exactly what it answered then.

## What runs where

| surface | before | now |
|---|---|---|
| spoken-for preview | `spokenFor` — one number | `spokenForPools` — a map; `spokenFor` is a LOOKUP into it, so the two cannot disagree |
| team resources | one depleting reading for action points, a bare count for every tally | one depleting reading per POOL, drawn by one function |
| disable (b) | `apCost > ap - spoke + ownPledge` | asked per cost term against that term's own pool, own pledge given back per pool |
| picker cost badge | one `symQty`, ap or the first term | one `symQty` per term, through the same D-29 machinery |
| proposal cost report | one line about `cost[0]` | one line per term, same three sentences, chosen by `pool` rather than by `apCost` |
| Advance | `pool.ap -= min(apCost, pool.ap)` | every term out of the pool it names, `spent` recorded per term |
| ledger shortfall | one action-point line | one line per short term; `apShort` still drives the action-point one, so an older record prints as it always did |

## Deviations from plan

### Auto-fixed issues

**1. [Rule 1 — Bug] `#act-prop-cost` was a `<p>` and became a container**
- **Found during:** rewriting the proposal cost report to one line per term.
- **Issue:** the block now appends one `<p class="ae-prop-report">` per cost term into
  `#act-prop-cost`, which was itself a `<p>`. A `<p>` inside a `<p>` is markup a browser
  silently rewrites into siblings — which would have left `emptyProposal`'s
  replaceChildren reaching a node the page had moved out from under it, on a pane whose
  whole contract is that it holds nothing when it is not showing.
- **Fix:** the shell node is a `<div class="ae-prop-reports">`, matching `#act-prop-reqs`
  beside it, which is a container for the same reason. Stub updated in the same change.
- **Commit:** `1155a5a`

**2. [Rule 2 — Missing critical functionality] `.fg-act-cost` could not lay out four readings**
- **Found during:** the picker render change.
- **Issue:** four readings butted together in one inline run read as one long number at
  projector distance, which is the legibility constraint this artifact is built around.
- **Fix:** a wrapping flex row with a gap; `nowrap` moved onto the individual reading so
  a figure can never break from its shape. No new colour — `--ink-faint` is the one the
  box already used. This is the minimum that keeps the surface working at the new caps,
  not a design for four terms; part 2 owns that.
- **Commit:** `b047a23`

**3. [Rule 1 — Bug] `fgActBtn` kept an argument nothing read**
- `report` was in its signature for the cost figure, which now comes off the action.
  Dropped rather than kept and ignored, because an argument no line touches is one the
  next reader assumes decides something.
- **Commit:** `1155a5a`

### Findings recorded at the row rather than worked around

- **FIGHT-10 caught row 109's first draft.** Editing the build pool and reading the grid
  without restarting reads LAST round's pool: every clause read 0 buttons disabled with
  the fight still holding 9 action points. The row re-seeds the fight after every build
  edit and says why.
- **Requirements are read at SIDE scope, and row 110's first draft proved it.** Asking
  for one of the student's PER-UNIT type as a requirement disabled the button, correctly
  — a unit-scope tally is not at side scope and reads zero. The drive asks for four
  things the side holds; the unit-scope type stays in the COST list, where it is the term
  that must spend nothing.
- **The side pool lands at 8 and not 7 in row 110**, and that number is the whole loop:
  the cost took 2 and the rule's OWN caster-side change gave 1 back, on the same Advance,
  in the same commit, out of the same bag.
- **The `[S09.12]` spend block clears the undo stack when it finishes**, because it drives
  twenty-odd commits, the stack is capped at `UNDO_LIMIT`, and the lifecycle row further
  down measures a depth DELTA of one. Left to run on it saturates the cap and that row
  reads 0 where it expects 1 — a red row about a defect this block invented.

## Probes — six, each against a committed snapshot

| probe | the regression | what caught it |
|---|---|---|
| **BR** | `[S06.7]` walks only the `ap` term of a multi-token cost — the single-pool arithmetic D-32 replaced | **row 109 alone.** Suite 1253/0, gate 193 of 194. Exactly the claim the row's own paragraph makes |
| **BS** | the picker draws only the FIRST cost term | row 109 alone |
| **BT** | the preview depletes only action points | row 109 and the `[S09.12]` two-pool row |
| **BU** | the shell keeps two rows per list while the caps say four | the **stub-drift gate**, by name, before a single row ran |
| **BV** | `setActionCost` ignores its slot and always writes slot 0 | four suites plus row 110 |
| **BW / BX** | the chooser press, then the amount field, each dropping its slot | **row 110 alone**, both times. Suite 1253/0, gate 193 of 194 |
| **BY** | Advance spends only the action-point terms | four `[S09.12]` rows plus row 110 |
| **BZ** | the wire cost bound left at 1 while the op admits 4 | the `[S09.11]` drift row plus five round-trip rows |
| **CA** | the decoder's three cap messages collapsed into one | the two new refusal rows; **the whole interaction gate stayed at 194 of 194**, which is why the matrix needed three shapes and not one |

Every probe was applied AFTER the commit it tests and reverted from a snapshot; the
working tree was verified clean against `git status` afterwards.

## What is NOT in this plan, on purpose

**The density pass.** D-32's first sentence — "make the action configuration more dense"
— is untouched. The authoring pane can now show twelve full-height term rows at once, and
it works: gate 69g drives all twelve populated and row 110 authors a maxed action by
pressing pills and typing amounts. It is not dense. `deferred-items.md` item 10 carries
what part 2 owns and why the split was made this way.

**`DEFAULTS.cats.ap` was not retuned**, no surface was restyled beyond the one
minimum-legibility rule above, and no verdict word reached a rendered string.

## Threat Flags

None. No new network surface, no auth path, no file access, and no schema change at a
trust boundary — the wire version did not move, and the three new decode guards are
tightenings of existing cap tests rather than new surface. The one new keyed structure
(`spokenForPools`' map) is built with a null prototype and read only through
`App.model.pooledAt`, which uses `hasOwnProperty` — asserted by a row.

## Self-Check: PASSED

Every file this summary claims exists, exists; every commit hash it names is in
`git log`. Re-verified after writing: `node tests/selftest-node.cjs` prints
1253 passed, 0 failed and 194 of 194 interaction rows at exit 0, and
`tests/browser-checks.mjs` prints 206 passed, 0 failed headless.
