---
phase: 05-fight-loop-playtest
plan: 07
subsystem: ui
tags: [s06-7, c14-1, declaration, fight-03, fight-09, fight-12, exemption-channels, fight-floor]

requires:
  - phase: 05-fight-loop-playtest
    plan: 03
    provides: "state.fight.decl, the { side, act, by, at } spelling, and the paragraph that asked this plan to settle whether the three declaration ops become structural"
  - phase: 05-fight-loop-playtest
    plan: 04
    provides: "advanceRound, whose end-of-round pool refill is the reason the spent reading measures zero"
  - phase: 05-fight-loop-playtest
    plan: 06
    provides: "#fightbar, #fight-prompt, #decl-cats, #decl-mechs, #round-count, #pool-cats, #pool-mechs, #fight-start, [C14] and its three named sub-region owners"
  - phase: 03.1-action-authoring
    plan: 07
    provides: "the proposal pane — sayInto, the never-disable banner, missingTerm, the two choosers and their asymmetry, and the ruling that a starting position on a form is not a decision"
provides:
  - "[S06.7] — the fight bar: the round, both pools as two readings each, both survivor counts, the declaration form and every declaration made so far, all computed at render time"
  - "[C14.1] — the .fg- rules, with the two sides bounded so the live board stops travelling as the surface fills"
  - "the answer to [S05]'s open commitStructural question, written into [S05]'s own paragraph"
  - "FIGHT_FLOOR 41 -> 83, and the marginal cost of a unit card on the fight page re-measured from 5 to 11"
  - "two named requirements on plan 05-10, each with the measurement that makes it a requirement"
affects: [05-08, 05-09, 05-10, 05-11]

tech-stack:
  added: []
  patterns:
    - "a sub-region whose cheap exit is a test on a STATE SLICE rather than on dialog.open — the first in the file, because this is the first surface that is on the page rather than in a dialog"
    - "a teardown that EMPTIES rather than merely hides, because Layer C's walk reads leaf text without asking whether an ancestor is hidden"
    - "a render-time shim that spells one slice into the shape another tier's read takes — a translation, never a second derivation"
    - "a chooser whose resting position is NOBODY, because the surface writes a record and the op stores null"
    - "a region bounded on itself with a vh dial, where the dial is explicitly HALF of an arithmetic that another plan owns the other half of"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "THE DECLARATION SLOTS ARE NOT STATIC MARKUP, and the decision is written into the file with both halves of its reasoning. The static-row rule exists because 'a number a student is halfway through typing is exactly the text a rebuilt node throws away' — and NOT ONE NODE IN THIS REGION IS A FIELD. A declaration is four ids, every one chosen with a button, so the hazard cannot arise. The arithmetic is the second half: MAX_DECLARATIONS is 48, so static slots would be 48 rows and 48 ids in the shell, in KNOWN_IDS and in the stub, holding nothing a rebuild could lose"
  - "[S05]'s OPEN QUESTION IS ANSWERED NO, AND THE PARAGRAPH IS AMENDED RATHER THAN LEFT STANDING. Plan 05-03 wrote that the three declaration ops move to commitStructural 'the moment a declaration list is rendered as one NODE PER DECLARATION'. It now is, and they do not: structure() rebuilds #board's two column interiors and nothing else, #fightbar is a static sibling outside #board, so making them structural would throw away every token node and every caret in both columns for a declaration and do nothing at all for the region that changed"
  - "THE COST REPORT READS THE FIGHT POOL, THROUGH A SHIM, AND THE SHIM IS FORCED RATHER THAN CHOSEN. sideFromBuild carries allocated health across as `hp`; affordability reads `maxHp`, because on the build slice that IS the live value. Handing the fight side over unchanged makes presentOnCaster sum a field that is not there and hand a requirement line NaN, on a projector, silently. And the pool has to be the fight's: a report against the build pool is right on round one and wrong on every round after it"
  - "NEITHER CHOOSER PRE-SELECTS AND NOBODY IS A REAL ENTRY. 03.1-07's pane fell back to the first live unit because it wrote no record; this surface writes one and declareAction stores null on purpose, so a chooser standing on somebody by default would put a unit into a record the student never chose"
  - "THE TWO SIDES ARE BOUNDED AT 34vh AND SCROLL ON THEMSELVES. Measured unbounded in a real browser: the region was 776px tall and the live board's top sat at 1034 of a 1080px screen, before a single round had been declared. Bounded, the live board's top is 759px on the shipped board, at 24 units a side, and with twelve declarations — it does not move at all as the surface fills"
  - "THE SPENT READING IS SHIPPED AS SPECIFIED AND THE QUESTION IT RAISES IS HANDED TO 05-11 RATHER THAN ANSWERED HERE. Measured: advanceRound spends each cost and then refills both pools from the build in the SAME commit, so no frame is ever rendered between the two writes and apSpent reads 0 at every observable moment. The refill lives inside [S05]'s one applier, which a render tier is not the place to reopen"
  - "EVERY CONTROL TAKES A .fg- CLASS AND A PRIVATE data-fg, AND ZERO CARRY data-act. Driven on the live page: 0 data-act nodes inside #fightbar, 51 controls, none disabled on any board"

patterns-established:
  - "a probe that is expected to stay green is run anyway and its GREEN is the finding — used twice here, and both times the green named a gate hole with an owner"
  - "a rehearsal dial shipped as explicitly half of an arithmetic, with the other half's figure quoted and the plan that owns it named"

requirements-completed: []

duration: 115min
completed: 2026-08-29
---

# Phase 05 Plan 07: The Fight Bar Summary

**The round, both pools and the declaration step are on the page and computed
at render time — and driving the shipped region in a real browser found that
unbounded it pushed the live board off the bottom of a 1080px projector before
a single round had been declared, while two deliberate-failure probes found
that the suite is spotlessly green over an Advance control that adjudicates and
over a declaration line that would redden CI on a student's own word.**

## The gate, before and after

| | before (05-06) | after |
|---|---|---|
| suite | 1185 passed, 0 failed | **1185 passed, 0 failed** |
| `SUITE_FLOOR` | 1155 | 1155 (not moved — no row was added; 05-10 owns this region's rows) |
| interaction gate | 147 of 147 | **147 of 147** |
| stub-drift | 111 shell ids | **111** — no id added, and that is the shape (see below) |
| `#app` (setup) | 127 | **127** — unchanged, and correctly so |
| `#app` (fight) | 101, `FIGHT_FLOOR` 41 | **215**, `FIGHT_FLOOR` **83** |
| dialogs | 145 across 4 roots, floor 138 | **145 across 4 roots** — this plan adds no dialog |
| proposal pane | 60, floor 23 | 60, floor 23 |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 6829 literals | **7082 literals**, 0 hits |
| naming greps | 0 / 0 | **0 / 0** |
| `url(` / `createElementNS\|<svg` | 0 / 0 | **0 / 0** |
| hex pattern over `[C14]` + `[C14.1]` | 0 | **0** |

`node tests/selftest-node.cjs` exits 0.

**Two of those rows deserve a sentence rather than a tick.**

**`#app` (setup) stayed at 127, and the plan's acceptance expected it to move.**
The plan's premise was that this region's copy is rendered rather than static,
so Layer C's `#app` harvest would see it — which is true, and it is also why the
figure did not move: the setup page is the page with **no fight running**, and
the whole point of the cheap exit is that this region paints nothing at all in
that state. The harvest that moves is the fight-mode one, and it moved by 114.
This is recorded as a correction to the plan's premise rather than as a miss.

**Stub-drift stayed at 111 because this plan adds no shell id.** Every node the
region builds is `createElement`'d and carries no id at all — the same shape
plan 05-06 predicted when it explained why fifteen ids was under all three prior
surfaces' counts. The two roots and the three readout nodes it reserved were
enough.

## `FIGHT_FLOOR` — 41 → 56 → 83, re-measured twice, moved twice

Plan 05-01 named 05-07, 05-08 and 05-09 as owing this. This is the first payment,
and it was measured on one artifact before and after each change rather than
reasoned about.

### Task 1: 41 → 56

| board | before `[S06.7]` | after | delta |
|---|---|---|---|
| the suite's board at check 92 | 101 | **116** | **+15** |
| a reset-to-defaults 9-and-3 | 97 | 112 | +15 |
| one unit a side | 47 | 62 | +15 |

The same delta on every board is what makes it the roster-independent part, and
the fifteen are nameable one at a time: the round number (1); each side's faction
word, spent reading and remainder reading on the bar (3 × 2 = 6); and inside each
declaration root the faction word, the survivor reading, the list's legend and
the line a side with nothing declared says (4 × 2 = 8). The pool's **label** is a
sixteenth string and is deliberately not counted — it carries the token-name
exemption marker, so the walk skips it, which is the marker doing its job on a
word a student can rename.

`41 + 15 = 56`, and `116 − 12×5 = 56`. Two readings, one answer.

### Task 2: 56 → 83, and the marginal cost of a unit card moved

| board | task 1 | task 2 | delta |
|---|---|---|---|
| the suite's board at check 92 | 116 | **215** | **+99** |
| a reset-to-defaults 9-and-3 | 112 | 211 | +99 |

**The per-card cost went from 5 to 11**, and a plan reading only the totals would
have got the floor wrong. Measured by trimming both rosters to two a side and
then to one and watching the harvest go 123 → 101. The extra 6 are the three
chooser entries a unit now appears in — its own side's *who acts*, and **both**
sides' *what it lands on*, which is 03.1-07's asymmetry showing up in the
arithmetic — at two strings each, because a chooser entry is a name node and a
tick node.

`215 − 12×11 = 83`. On a reset-to-defaults board the same arithmetic gives 79,
and the four strings of difference are earlier checks' content rather than a
defect in the model, which reproduces both boards exactly. The floor is taken off
the board this row actually harvests.

**One axis is new and is named in the comment**: the action chooser draws one
entry per action, so the roster-independent part now also moves with the action
count. It only ever moves upward — the six shipped actions cannot be removed —
so 83 is measured at the floor of that axis too.

## The two probes, run after their task's commit, recorded verbatim, reverted

`git checkout -- cats-vs-mechs.html` was never used. Both reverts were `cp` from
a scratchpad snapshot and `git status --short` read clean after each.

### PROBE W — the Advance control disabled for an unaffordable declaration

The comparison was built like-for-like first: the same one declaration on both
boards, with only the declared action's **cost** moving (1 → 9 against a pool of
3), so the control set is identical and only the affordability differs. That is
check 71c's shape moved to this region.

Clean, before the injection:

```
W-comparison: controls compared = 51
W-comparison: affordable set === unaffordable set = true
W-comparison: any control disabled = false
W-comparison: advance entry, affordable   = [ 'fg/advance=false' ]
W-comparison: advance entry, unaffordable = [ 'fg/advance=false' ]
W-comparison: the report moved with the cost =
  ["Slash"," costs 9 ","Action points"," of 3. Not enough to spend. Short by 6."]
```

With the violation injected — Advance disabled when a side's declared cost
exceeds its pool:

```
W-comparison: controls compared = 51
W-comparison: affordable set === unaffordable set = false
W-comparison: any control disabled = true
W-comparison: advance entry, affordable   = [ 'fg/advance=false' ]
W-comparison: advance entry, unaffordable = [ 'fg/advance=true' ]
```

**RED on both clauses. AND THE SHIPPED SUITE STAYED SPOTLESSLY GREEN OVER IT:**

```
1185 passed, 0 failed
interaction gate: 147 of 147 checks passed
```

That green is the finding. **No numbered check in this repository watches the
never-disable rule on this region.** The comparison that does redden is recorded
in `[S06.7]`'s own banner, with its two clauses and its control count, as a
named requirement on plan 05-10 rather than a hope.

### PROBE X — one declaration line as a single string, with an action named `Winner`

Driven through the real rename op and the real declare op, on the artifact's own
harvest and with the artifact's own word list — never a planted string.

Clean, before the injection (an action really is named `Winner` and really is
declared):

```
X: harvest with NOTHING declared = 211  verdict hits = []
X: harvest WITH a declaration = 213  verdict hits = []
X: the declaration line, as the walk reads it = ["Cat 1 uses "," on Mech 1."]
X: nodes carrying data-anm in the region = ["Winner","Hairball","Screech","Winner","Fly","Lasers","Recharge"]
```

With the single-string spelling injected:

```
X: harvest with NOTHING declared = 211  verdict hits = []
X: harvest WITH a declaration = 212  verdict hits =
  ["[winner] in \"Cat 1 uses Winner on Mech 1.\" (read from #app)"]
X: the declaration line, as the walk reads it = ["Cat 1 uses Winner on Mech 1."]
```

**RED — but only on the harvest taken with a declaration on the page.** The
shipped suite stayed green again:

```
1185 passed, 0 failed
scan: 215 rendered strings read from #app WITH A FIGHT RUNNING (Layer C, floor 83)
interaction gate: 147 of 147 checks passed
```

**What was actually skipped: the entire declaration list.** Check 92 calls
`startFight()` and harvests immediately, so `state.fight.decl` is empty and not
one declaration line is ever painted for the walk to read. The exemption channels
on those lines are live and correct — the paired reading above proves it, because
the same board with the shipped spelling harvests 213 strings and stays clean,
the walk reading `"Cat 1 uses "` and `" on Mech 1."` as two of the artifact's own
fragments and skipping the marked one — but **the gate cannot see either
outcome**. The fix is one line and it is written into the harness beside check
92, where the next author will look. Plan 05-10 owns it.

## What the real browser found that no gate in this repo can

Real Chrome **and** real Edge, `channel: 'chrome'` / `'msedge'`, `file://`,
1920×1080, driven through a real click on `#fight-start` and real ops.
**Zero page errors and zero console errors in both, on every run.**

### The layout defect, found and fixed

Unbounded, the region was **776px tall and put the live board's top at 1034 of a
1080px screen** — off the bottom before a single round had been declared. The
Node harness computes no layout and reported the file spotlessly clean through
all of it, which is exactly the lesson plan 05-06 paid for and wrote down.

Bounded at 34vh with the scroll on the element itself:

| board | content | region | live board top |
|---|---|---|---|
| shipped 9-and-3, nothing declared | 646px | 367px | **759px** |
| 24 units a side, nothing declared | 1030px | 367px | **759px** |
| 24 a side, twelve declarations | 1655px | 367px | **759px** |

**The live board does not move at all as the surface fills**, which is the whole
of what the bound buys and is the property plan 05-06 bought for the ledger with
the same mechanism and the same precedent. Every ancestor of `#strip` still
reports `overflow: visible` and `#strip` is still `sticky` on all three boards in
both browsers — safe because `#strip` lives *inside* `#board` and this region is
`#board`'s sibling, so nothing in `[C14.1]` is an ancestor of the sticky element
at all.

`#fightbar` and `#board` both report `left: 160` and `width: 1600`, so the
shorthand-resets-longhand trap plan 05-06 closed stays closed.

### The focus defect, found in task 1 and closed in task 2

Task 1, real click on Start, measured: `focusAfterStart: "BODY"`. Disabling the
focused button drops the keyboard on `<body>`, and the hand-off found nothing to
hand to because the region carried no control on a fight's first frame.

Task 2, same drive: `focusAfterStart: "fg/act/cats/slash"`. The Advance control
and the action choosers give the hand-off somewhere to land, and it lands.

### The two claims this plan makes about appearance, driven rather than asserted

**`.fg-say` and `.fg-word` are computed-identical** across font size, weight,
family, colour, style, letter-spacing and text-decoration, in both browsers. That
is the point rather than an oversight to tidy away: the split exists for the gate,
and a student must not be able to tell which words the artifact chose.

**Spent versus available is said four ways and by colour in only one of them:**

| | words | weight | border | background |
|---|---|---|---|---|
| spent | `0 of 3 spent` | 400 | 0px | transparent |
| available | `3 left to spend` | **700** | **1px** | **tinted, from `--gold` via `color-mix`** |

Three of the four survive a projector with the colour washed out of it. The
readings are also different *positions*, which is the fourth.

### The rest of the live readings, identical in both browsers

```
round-count "1" at 24px          every legend and label at 18px
minimum control height 40px      maximum 47px
disabled controls in #fightbar   []          (none, on a board with a declaration)
data-act nodes in #fightbar      0
declaration line node structure  [["fg-say","Cat 1 uses "],["fg-word","Slash"],["fg-say"," on Mech 1."]]
```

The one figure below 18px inside the region is the chooser tick at 14px, which is
`.ae-check`'s shipped size for the same glyph. It is a decoration beside an 18px
name and never a label, so UX-02's floor is kept.

## The acceptance drives, recorded

### With no fight running, the hook returns before doing any work

```
rest: fightbar node count before/after a driven frame = 6 / 6
rest: fgUp = ""  fgSig = ""
rest: #fight-prompt hidden = false  #decl-cats hidden = true
      #round-count text = ""  #fight-start disabled = false
```

And the teardown, which is the arm that actually proves it, driven through a real
`startFight` and `endFight`:

```
teardown: fightbar node count rest/fight/rest = 6 / 18 / 6
teardown: leaf text identical to before the fight = true
teardown: bar readouts emptied = ["",[],[]]
teardown: prompt back = true  roots hidden = true  start re-enabled = true
teardown: a further idle frame costs nothing — fgUp before/after = "" / ""  node count = 6
```

### With a fight running and three declarations across both sides

```
run: #round-count = "1"
run: #pool-cats leaves  = ["Cats","Action points","0 of 3 spent","3 left to spend"]
run: #pool-mechs leaves = ["Mechs","Action points","0 of 3 spent","3 left to spend"]
run: #decl-cats leaves  = ["Cats","9 of 9 still standing","Declared so far",
                           "Cat 1 uses ","Slash"," on Mech 1.","Clear",
                           "Cat 2 uses ","Hairball"," on nobody.","Clear"]
run: #decl-mechs leaves = ["Mechs","3 of 3 still standing","Declared so far",
                           "Mech 1 uses ","Lasers"," on Cat 1.","Clear"]
run: declaration line count cats/mechs = 2 / 1
run: data-anm nodes in #fightbar = ["slash::Slash","hairball::Hairball","lasers::Lasers"]
run: data-lbl nodes on the bar   = ["ap::Action points","ap::Action points"]
```

Every action name node carries `data-anm`; every token label node carries
`data-lbl`; no unit name carries either, which is `unitPick`'s ruling.

### The choosers

```
chooser WHO ACTS (cats) = ["","c1","c2","c3","c4","c5","c6","c7","c8","c9"]
chooser LANDS ON (cats) = ["","c1","c2","c3","c4","c5","c6","c7","c8","c9","m1","m2","m3"]
chooser ACTIONS (cats)  = ["slash","hairball","screech"]
lands-on holds units from BOTH factions = true
who-acts holds ONLY this side = true
pre-selection: pressed pills = {"acts":[],"by":[""],"at":[""]}
nobody entry is first and is a real value = ["","Nobody","","Nobody"]
state said twice: class and aria-pressed agree on every pill = true
report with nothing chosen = ["Pick an action for this side."]
```

### The whole disabled set

```
disabled set control count = 51
sets identical funded/starved/thinned = true
any control disabled anywhere in the region = false
```

**And the drive had to be corrected before it asserted anything**, which is a
finding in its own right. Check 71c starves a side with `setFactionAp` and thins
it with `setUnitMaxHp`; **neither moves this region's report**, because both
write the *build* and this report reads what the *fight* holds. That is FIGHT-10
working rather than a broken report. Driven through the fight-slice equivalents
instead, the report moves and the disabled set does not:

```
reqs, build roster of 27 health : "Slash needs 99 Health of 27. Requirement not met."
reqs, fight roster thinned      : "Slash needs 99 Health of 9. Requirement not met."
report, cost 1                  : "Slash costs 1 Action points of 3. Enough to spend."
report, cost 9                  : "Slash costs 9 Action points of 3. Not enough to spend. Short by 6."
```

### The departed-token refusal, verbatim

```
before removal, decl line = ["Cat 1 uses ","Sting"," on Mech 1."]

declaration line: "Cannot fire Sting. It names t1, which is no longer a token
                   type on this board. Nothing has changed."
report line:      "Cannot fire Sting. It names t1, which is no longer a token
                   type on this board. Nothing has changed."

names the token id and NOT the shipped health label = true
```

It names the action by its **live** name (`Sting`, after a rename) and the term by
the **id** it still carries (`t1`), which is `fillProposal`'s recorded trap: the
type's record has gone, so `labelFor` would fall back to the shipped health label
and print a name that is actively wrong.

### The spent reading is floored

```
floored: build ap = 0  fight ap = 3
         spent reading = ["Cats","Action points","0 of 0 spent","3 left to spend"]
         apSpent = 0
```

Never negative, and the repair is not made at the call site. **And this is where
the finding below came from.**

### The fingerprint cost

`0.0100 ms` per call over 3,000 calls — `JSON.stringify` of the fight slice, the
build slice and the chooser bookkeeping together. `shareSig`'s measured build-slice
figure was 0.030 ms and `encode`'s 0.483 ms, so this is comfortably the cheap end
and there was no reason to narrow it.

## Deviations from Plan

### Auto-fixed

**1. [Rule 1 — bug] The region pushed the live board off the bottom of a projector, found by driving a real DOM**

- **Found during:** task 2's browser verification, after the task was committed.
- **Issue:** eight stacked groups a side made `#fightbar` 776px tall on the
  shipped 9-and-3 board, putting `#board`'s top at 1034 of a 1080px viewport.
  At the 24-a-side ceiling the content is 1030px and with declarations 1655px,
  so it grows along three axes with no bound at all. The Node harness computes
  no layout and reported clean throughout.
- **Fix:** `.fg-sides{max-height:34vh;overflow-y:auto;padding:2px}` in `[C14.1]`,
  with the measurement table, the sticky-safety argument and the dial's
  relationship to the ledger's 46vh all written at the site. The scroll is on the
  element itself, which is `[C12]`'s action list and `[C14]`'s ledger list for the
  third time.
- **Measured after:** live board top 759px on all three boards, in both browsers.
- **Commit:** `487e50d`

**2. [Rule 2 — missing critical functionality] Disabling the focused Start control dropped the keyboard on `<body>`**

- **Found during:** task 1, driven in a real browser (`focusAfterStart: "BODY"`).
- **Issue:** this region disables `#fight-start` while a fight runs, and a real
  click leaves that button focused. Disabling it drops focus to `<body>`, leaving
  a keyboard user at the top of the document with nothing but Tab. `[S06.1]`'s
  collapsing-optional-line paragraph records the same trap from the other end.
- **Fix:** `fgHandOff` — the keyboard is handed forward to the first control of
  the surface the press just opened, called after the surface is drawn so the
  control it hands to is this frame's. The reason it cannot use `[S06.1]`'s
  answer (keep the control on screen) is written beside it: the whole point of
  the disable is that this button must not be pressed twice.
- **Measured after:** `focusAfterStart: "fg/act/cats/slash"`, both browsers.
- **Commits:** `d4be9f3` (the hand-off), `487e50d` (the control it lands on)

**3. [Rule 2 — a banner that would otherwise quietly lie] `[S05]`'s commitStructural paragraph amended**

- **Issue:** plan 05-03 wrote a condition — *"the moment a declaration list is
  rendered as one NODE PER DECLARATION … these three move to commitStructural on
  the same day"* — and named this plan as the one to meet it. The antecedent is
  now true. Leaving the paragraph standing would have been the "banner that
  quietly lies" `[S03]` forbids.
- **Fix:** the paragraph is amended in place with the answer and its reasoning.
  No op line was touched; the change is comment-only.
- **Commit:** `487e50d`

**4. [Rule 2 — the same class of thing] `[S00]`'s stylesheet line stopped naming the last block**

- **Issue:** the table of contents read *"[C00] TOKENS through [C13] SHARE AND
  CONFIRM"* after plan 05-06 added `[C14]`. Search-a-token-and-land-in-one-place
  is what that paragraph promises.
- **Fix:** it now names `[C14]` and its three sub-blocks with their owning plans.
- **Commit:** `487e50d`

### Corrections to the plan's own premises

**5. [finding] Task 1's acceptance expected `#app` (setup) to move; it correctly did not**

Plan 05-06's summary recorded that its own static copy would not move the setup
harvest and predicted that 05-07's rendered copy would. Both halves are true and
the conclusion still does not follow: the setup page is by definition the page
with no fight running, and the cheap exit means this region paints nothing there.
The harvest that moved is the fight-mode one, from 101 to 215.

**6. [finding] Check 71c's driving ops do not move this region's report, and that is FIGHT-10 rather than a defect**

`setFactionAp` and `setUnitMaxHp` write the build slice. This report reads what
the fight holds. A plan copying 71c's drive verbatim would have got a green row
over a report that never moved. The fight-slice equivalents — `advanceRound` for
the pool and `setUnitHp` for the roster — are what move it, and the corrected
drive is recorded above.

### Handed on rather than answered

**7. [finding, and it is the phase's most consequential] The spent reading measures zero at every moment a frame can see**

`advanceRound` spends each declared cost out of the pool and then, **in the same
commit**, refills both pools from the build — its own step 5, and the table above
it lists the refill as a thing Advance does. No frame is rendered between those
two writes, so `fight.ap === build.ap` whenever this region runs and `apSpent`'s
subtraction is 0. Driven three rounds deep with a costing action declared each
time: the pool read 3 before and 3 after, every round.

The one thing that moves the figure is a mid-fight **build** edit, which is the
direction `apSpent`'s floor guards and FIGHT-10's own hazard.

**The reading is shipped as the plan specifies** — `apSpent` is the shipped
derivation of the word FIGHT-03 uses, and the plan was explicit that it must not
be repaired at the call site. **The question is handed to plan 05-11 with the
measurement**, because the refill sits inside `[S05]`'s one applier and a render
tier is not where the meaning of a fight's economy gets decided. The two
admissible answers are written into the file: move the refill to the start of a
round, or add a third reading for what this round's declarations have *spoken
for* and leave the refill alone.

### Declined by design

- **Nothing presses.** No listener, no `App.ops` call, no `data-act` anywhere in
  the region. Plan 05-10 attaches every one.
- **No `<dialog>`**, so no `DIALOG_ROOTS` entry; the harvest stays at four roots.
- **No shell id added**, so no `KNOWN_IDS` or stub change and no three-part rule
  to keep. Every node this region builds carries no id.
- **No numbered check added to `tests/selftest-node.cjs`.** Plan 05-10's
  section ownership claims the fight checks. The two edits made here are
  `FIGHT_FLOOR` (this plan's named obligation) and two comment blocks recording
  what the probes measured.
- **`DEFAULTS.cats.ap` untouched** (D-25). No `[S01]` line was modified.
- **No verdict, and none of the eight clean-but-unshippable words.** `contested`,
  `one-sided`, `blowout`, `lopsided`, `even`, `close`, `tight` and `behind` do not
  appear in any string this region renders. The one word the gate did catch was in
  a *comment* of mine, on the first run — `[verdict]` at line 11401 — and it is
  now described rather than spelled, which is `[C11]`'s and `refCard`'s own rule.

## What plan 05-10 owes, in writing and with the measurement behind each

1. **The never-disable row for this region.** 51 controls keyed by `data-k`, read
   on two boards differing only in the declared action's cost, compared whole,
   with a second clause refusing any `=true`. Probe W drives the violation and the
   whole suite is green over it today.
2. **The fight harvest must be taken with declarations on the page.** Probe X:
   the single-string spelling is invisible to check 92 as written, and visible the
   moment one declaration exists.
3. **The focus contract over a rebuilt list.** The declaration slots are not
   static markup and check 65's shape does not apply here; the row that replaces
   it presses a chooser, takes a frame and reads the keyboard back on the node it
   was on.
4. **A driving row of probe S's character** — an op that changes what is drawn
   *without moving a stepper*. Renaming an action or clearing a declaration will
   do it. A narrowed fingerprint would pass every other row.
5. **A press that has nothing to do must decline quietly.** Declare with no action
   named, Advance with nothing declared. `clearDeclarations` returning `false` over
   an empty list is the shipped precedent; an error panel in the middle of a
   workshop is what a disabled button would have been avoiding.
6. **`data-fg` is this region's private routing word and `data-act` appears
   nowhere in it.** Check 90b's partition extends here.

## What plans 05-08, 05-09 and 05-11 inherit

- **05-08:** the two dials are now an arithmetic. `.fg-sides` is 34vh and
  `.ld-list` is 46vh; both sit above `#board`; the live board's top is already at
  759px of 1080 with the ledger still hidden. Also: `FIGHT_FLOOR` is 83 and the
  marginal cost of a unit card on the fight page is **11**, not 5 — the ledger's
  own re-measure has to start from those two figures.
- **05-09:** `#fight-said` is still empty and hidden, exactly as 05-06 left it —
  this region hides `#fight-prompt` and touches nothing else in the shell. The
  two round controls are appended **below** `#fight-said`, deliberately, so
  FIGHT-10's line sits between the sides and the Advance a student is about to
  press. `[S06.9]`'s own `FIGHT_FLOOR` re-measure is still owing.
- **05-11:** four items, each with numbers rather than an opinion. The spent
  reading measuring zero and its two admissible fixes (finding 7 above, the first
  question after D-26). The two vh dials, to be turned together against a real
  projector — 34 + 46 = 80vh of a 100vh screen. Whether 759px leaves enough live
  board on a workshop display. And whether the cost report reads as a *fact about
  the board* rather than as the tool telling a student what they may do — which
  is the one thing in this plan that a measurement cannot settle.

## Known Stubs

| stub | file | why it is intentional | resolved by |
|---|---|---|---|
| every control in `#fightbar` reaches no handler | cats-vs-mechs.html | the plan's own output line: *"[S06.7], [C14.1], and not one press."* Each carries a `.fg-` class and a private `data-fg` and nothing dispatches on either yet | 05-10 |
| the spent reading is always `0 of N spent` | cats-vs-mechs.html | `apSpent` is the shipped derivation of FIGHT-03's own word, and the reason it does not move is `advanceRound`'s same-commit refill — a change to `[S05]`'s one applier, which is not a render tier's to make. Measured and written at the site | 05-11 (developer decision) |

Neither prevents this plan's goal, which was to put the round, both pools and
the declaration step on the page and compute every figure at render time.

## Threat Flags

None. No new network endpoint, auth path, file access pattern or schema change at
a trust boundary. The five mitigations the plan's threat register assigns:

| Threat | Mitigation, as shipped |
|---|---|
| T-05-27 a control wearing a class or attribute another region dispatches off | every control carries a `.fg-` class and a private `data-fg`; **0** `data-act` nodes inside `#fightbar`, driven on the live page in both browsers. The seven private words are `act`, `by`, `at`, `declare`, `clear`, `advance`, `reset` — none is an op name |
| T-05-28 a control disabled because a side cannot afford something | the whole disabled set of **51** controls compared across boards differing in cost and in roster health; **probe W drives the exact violation and reddens it**, and records that no shipped check does |
| T-05-29 a student's action name reddening CI on a legitimate replay | one node per fragment plus `data-anm` on the student's word; **probe X drives the single-string spelling**, and its control run proves the channel is load-bearing rather than decorative — the same board harvests clean with the shipped spelling and red with the injected one |
| T-05-30 a fingerprint narrowed until the surface holds a stale reading | the whole fight slice, the whole build slice and the chooser bookkeeping, measured at 0.0100 ms; the chooser slot was in the fingerprint a task before the code that draws it; probe S's finding carried forward as requirement 4 on plan 05-10 |
| T-05-31 a negative "points spent" reading after a mid-fight build edit | `apSpent`'s floor is left in the derivation and not repaired at the call site; driven on a build pool lowered below the fight's, the reading is `0 of 0 spent` and never negative |
| T-05-SC npm/pip/cargo installs | zero packages installed. Playwright was resolved from an existing scratchpad install through `PLAYWRIGHT_DIR`, exactly as `tests/browser-checks.mjs` documents, and nothing was added to the repository |

## Requirements

**None marked complete, and that is deliberate** — the same reading plans 05-04,
05-05 and 05-06 took. The plan names FIGHT-03, FIGHT-09 and FIGHT-12:

- **FIGHT-03** — the declaration form is on screen with three choosers and a cost
  report, and not one of its controls reaches a handler. Plan 05-10.
- **FIGHT-09** — the round and both pools are rendered, at 24px and 18px, with
  spent and available distinguished four ways. Whether that is *unambiguous from
  across the room* is a claim only a rehearsal settles. Plan 05-11.
- **FIGHT-12** — a declaration renders, is refused by name when its record has
  departed, and can be cleared. Nothing presses either control. Plan 05-10.

## Self-Check: PASSED

Files verified present: `cats-vs-mechs.html`, `tests/selftest-node.cjs`,
`.planning/phases/05-fight-loop-playtest/05-07-SUMMARY.md`.

Commits verified in the log: `d4be9f3`, `487e50d`, `b8d8336`.

Verified in the artifact: one `[S06.7] RENDER — THE FIGHT BAR` banner, one
`#region`/`#endregion` pair for it, one `SYNC_HOOKS.push(syncFight)`, one
`fightBar: fightBar` on `[S06]`'s return, one `[S00]` table-of-contents line for
`[S06.7]`, one `[C14.1] THE FIGHT BAR` banner, and zero `data-act` inside the
rendered region.

Final run: `node tests/selftest-node.cjs` → **1185 passed, 0 failed**, stub-drift
**111 shell ids**, interaction gate **147 of 147**, `#app` 127, dialogs 145 across
4 roots, fight-mode **215** against floor **83**, proposal 60, Layer A 18 words
clean, Layer B 7082 literals clean, exit 0. Both naming greps print **0**; `url(`
prints 0; `createElementNS|<svg` prints 0; the hex pattern over `[C14]` and
`[C14.1]` prints 0. Working tree clean after every probe revert;
`git checkout --` was never used on either file.
