---
phase: 05-fight-loop-playtest
plan: 08
subsystem: ui
tags: [s06-8, c14-2, ledger, fight-08, fight-14, fight-15, fight-16, append-only, fight-floor, suite-floor]

requires:
  - phase: 05-fight-loop-playtest
    plan: 04
    provides: "advanceRound and the round record { round, was, did[] } — `was` is the board BEFORE the round resolved, and `did` carries the split as three numbers, the shortfall and the unlanded terms"
  - phase: 05-fight-loop-playtest
    plan: 05
    provides: "the by-hand ruling record { side, unit, tok, from, to } on past[i].hand, present ONLY when the round held one (D-04)"
  - phase: 05-fight-loop-playtest
    plan: 06
    provides: "#ledger as a sibling of #board, #ledger-list as the element that scrolls, the measured focus hazard, [C14.2]'s reservation and the 46vh dial"
  - phase: 05-fight-loop-playtest
    plan: 07
    provides: "[S06.7]'s shape, FIGHT_FLOOR 83, the marginal cost of a unit card at 11, and .fg-sides' 34vh — half of an arithmetic this plan owned the other half of"
provides:
  - "[S06.8] — the ledger of resolved rounds, grown by DELTA only, plus FIGHT-15's what-changed reading derived at render time"
  - "[C14.2] — the .ld- rules, the side-by-side arrangement, and the entry animation on the row and nothing inside it"
  - "check 92's fight harvest now PLAYS a round instead of only starting a fight — which closes plan 05-07's requirement 2 on plan 05-10 as well as this plan's own"
  - "FIGHT_FLOOR 83 -> 108, and the marginal cost of a unit card on the fight page re-measured from 11 to 14"
  - "three [S09.12] rows asserting the fight slice's shape AFTER a round has resolved — the gap probe Z found, closed here"
  - "SUITE_FLOOR 1155 -> 1158, suite 1185 -> 1188"
  - "harness limitations entry 20, and the correction of that list's opening claim that there is no browser in this repo"
  - "REHEARSAL.md B3 — the three-dial layout budget, with numbers rather than an opinion"
affects: [05-09, 05-10, 05-11]

tech-stack:
  added: []
  patterns:
    - "the file's FIRST append-only list surface — grown by delta, never reordered, never re-appended, with the front trimmed against the oldest surviving RECORD'S OWN round number rather than by a row count"
    - "a repaint gate SPLIT IN THREE because it was answering three questions — which rows exist, whether a name a row draws has moved, and what the reading is drawn from — measured at 0.079 ms against 8.2 ms unsplit"
    - "an entry animation placed on the one node whose identity the renderer preserves, and deliberately on nothing inside it, because the interior is rewritten"
    - "a gate's DRIVE moved rather than only its floor, because a floor over a page the region does not paint on bounds nothing"
    - "two regions above the board laid SIDE BY SIDE so the page costs the taller of them instead of their sum"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs
    - .planning/REHEARSAL.md

key-decisions:
  - "THE ROW IS THE COMPACT TEXT DESIGN, AND READABILITY DECIDED IT RATHER THAN COST. Three were measured in nodes per round — full clone 300, compact text 66, token squares 67 — and all three are affordable at any size a workshop reaches, so cost decided nothing. A full clone reproduces the live board directly above the live board at the same size and makes the past compete with the present for the same eye; token squares ask a student to COUNT a board that is no longer live. The shipped row measures 82 nodes on a round with no declarations and 103 with an action and two rulings"
  - "THE OBVIOUS CHEAP EXIT IS WRONG AFTER ROUND THIRTY AND THE PLAN ASKED FOR IT BY NAME. `as many rows as records, so there is nothing to do` is correct for the first thirty rounds and WRONG FOR EVERY ROUND AFTER: at MAX_PAST_ROUNDS the list stops growing and starts SHIFTING, so past.length stays at thirty while its contents move by one. A row-count exit freezes the ledger on round thirty for the rest of the fight and nothing says so. The front is trimmed against the oldest surviving record's round number instead, and position pairs the rest"
  - "THE REPAINT GATE IS THREE FINGERPRINTS RATHER THAN ONE, and the second is what makes the first cheap. A past record is immutable once advanceRound has pushed it, so a row's interior can go stale for exactly ONE reason — a name it draws moved. Rewriting every row whenever anything moved measured 7.46 ms at the cap ON EVERY ADVANCE; split, an Advance-shaped repaint is 0.079-0.191 ms and the 7.8 ms is paid only by a mid-fight rename, which is the thing that actually needs it"
  - "THE REGION IS SHOWN FOR A RUNNING FIGHT AND NOT FOR A PAST ROUND, which extends plan 05-06's ruling rather than contradicting it. Its stated reason was that there are no past rounds on a board NOBODY HAS FOUGHT ON. A running fight is a board somebody is fighting on, and on round one the region is not an empty labelled box: it carries the reading, which says in a sentence that there is no earlier round yet"
  - "FIGHT-15'S READING LIVES AT THE FOOT OF #ledger, WHICH IS #board's IMMEDIATE PREVIOUS SIBLING. It cannot go inside #board — structure() rebuilds both column interiors and owns every node in them, and keyed() takes the first [data-k] match scoped there. Measured in both browsers: it sits 18px above the live board's top edge and travels with it"
  - "CHECK 92's DRIVE MOVED AS WELL AS ITS FLOOR, because a floor taken off a page where startFight() has just been called bounds this region at exactly nothing — `past` is empty, so the ledger paints a heading and one sentence and stops. The plan's own threat register assigns T-05-35's mitigation to that harvest; a mitigation that reads an empty region is not one. The drive now declares, advances and declares again, which also closes plan 05-07's requirement 2 on plan 05-10"
  - "PROBE Z's GAP IS CLOSED HERE RATHER THAN RECORDED. Three [S09.12] rows assert the fight slice's shape AFTER a round has resolved, at all three depths a cache could hide at — the slice, the side and the unit — plus the round record's own key set. The five-key row that already existed is taken on a FRESH fight, which is the one state in which nothing has had a chance to store anything"

patterns-established:
  - "a deliberate-failure probe whose first clause is EXPECTED to stay green: probe Y's row count passed while its node-identity clause went red, which is the plan's own point that a rebuild passes a count"
  - "a probe run TWICE against the same shipped gate — once to record its silence and once, after the gap is closed, to record it reddening by name"
  - "a limitations entry that names WHICH machine can see the thing, rather than declaring it unreachable"

requirements-completed: []

duration: 150min
completed: 2026-08-29
---

# Phase 05 Plan 08: The Ledger Summary

**Past rounds now accumulate above the live board by appending exactly the new
row and touching none of the existing ones, the live board says what changed
since the round before it in two numbers with no adjective — and driving the
shipped region in a real browser found that, stacked, it put the live board's
top at 1500px of a 1080px screen with a single round in it, while two
deliberate-failure probes found one gate hole worth closing on the spot and one
that no instrument in this harness can ever see.**

## The gate, before and after

| | before (05-07) | after |
|---|---|---|
| suite | 1185 passed, 0 failed | **1188 passed, 0 failed** (+3) |
| `SUITE_FLOOR` | 1155 | **1158** |
| interaction gate | 147 of 147 | **147 of 147** |
| stub-drift | 111 shell ids | **111** — this plan adds no id |
| `#app` (setup) | 127 | **127** — unchanged, and correctly so |
| `#app` (fight) | 215, `FIGHT_FLOOR` 83 | **276**, `FIGHT_FLOOR` **108** |
| dialogs | 145 across 4 roots | **145 across 4 roots** — no dialog added |
| proposal pane | 60, floor 23 | 60, floor 23 |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 7082 literals | **7279 literals**, 0 hits |
| perf gate | 7 ms of 50 | **7 ms of 50** |
| naming greps | 0 / 0 | **0 / 0** |
| `url(` / `createElementNS\|<svg` | 0 / 0 | **0 / 0** |
| `text-wrap` anywhere | 0 | **0** |
| new hex in `[C14.2]` | — | **0** |

`node tests/selftest-node.cjs` exits 0.

## The row design, chosen with its three measurements

Three shapes were measured by 05-RESEARCH.md in Chrome 151 from `file://`, in
nodes per round:

| design | nodes per round | marginal append | `sync()` with it on the page |
|---|---|---|---|
| A — full clone of `#board` | **300** | 1.9–2.1 ms, flat to 60 rounds | 0.154 ms (baseline 0.17) |
| B — compact text row | **66** | 100 rounds appended in 7.9 ms | 0.172 ms at 100 rounds |
| C — token squares | **67** | 50 rounds in 2.7 ms | 0.154 ms |

**All three are affordable at any size a workshop reaches**, so cost decided
nothing — the shipped board resolves in three rounds and the slowest retune
measured took nine. **B is taken and readability is the constraint that
decided it**, written into the region's own banner:

- a full clone reproduces, directly above the live board and at the same size,
  the exact thing a room is already reading — the past would compete with the
  present for the same eye;
- token squares ask a student to *count* a board that is no longer live, which
  is work with no reading at the end of it;
- the compact row *states* each unit's numbers, so a past round is read rather
  than counted, and it survives being scrolled past at a glance.

**No performance reason is implied and the file says so.** `MAX_PAST_ROUNDS` is
thirty for the same readability reason its own comment already gave. The shipped
row measures **82 nodes** on a round with no declarations and **103** on a round
with one action and two by-hand rulings; the whole region is **2,472 nodes** at
the thirty-round cap.

## Node identity across an append, asserted as identity

```
after 3 advances: rows = 3  rounds = ["1","2","3"]
after 4th:        rows = 4  rounds = ["1","2","3","4"]
NODE IDENTITY across the append (=== on the node objects) = [true,true,true]
  and the appended row is a NEW object = true
```

And across a rename, which rewrites every row's interior:

```
rename lands on row 1 = ["Round 1","The board as it stood when round 1 began.",
                         "Cats","Cat 1 — ","Vitality"," 3, ","Shield"," 0."]
row 1 is the SAME node object after the rename = true
```

## The cap, driven two past it

```
CAP: MAX_PAST_ROUNDS = 30   rows on screen = 30
     oldest row round = 3   newest row round = 32   past[0].round = 3
```

Thirty-two Advances, thirty rows, and the **oldest** two are the ones gone —
which is the direction `MAX_PAST_ROUNDS`' own comment asks for, because a
history whose newest entry silently vanished would still be the right length.

**And this is where the plan's suggested cheap exit turned out to be a bug.**
The plan asked for a second exit — *"if the number of rows already on the page
equals `past.length`, return before doing any work"*. That is correct for the
first thirty rounds and **wrong for every round after**: at the cap the list
stops growing and starts **shifting**, so `past.length` stays at thirty while
its contents move by one, and a row-count exit would freeze the ledger on round
thirty for the rest of the fight with nothing anywhere to say so. The front is
trimmed against the **oldest surviving record's own round number** instead, and
only then does position pair the rest — syncReference's rule with the one
question a position cannot answer asked first.

## The four attribute counts inside the ledger, all zero

Walked over the whole region at the thirty-round cap, in the sandbox:

```
STRUCTURAL: nodes walked = 2472  data-k = 0  data-act = 0  data-amt = 0
            .brd-value = 0  .brd-line--opt = 0
```

And read off the live page in **both** real browsers, three rounds deep:

```
data-k=0  data-act=0  data-amt=0  .brd-value=0  .brd-line--opt=0
```

## The five readings over the what-changed nodes

```
Z4 what-changed nodes = 9  data-k = 0  data-act = 0  data-amt = 0
   .brd-value = 0  .brd-line--opt = 0
Z4 BUILT ONCE: head is the same node = true   body is the same node = true
```

Built once means built once **across two further Advances and a by-hand ruling**
— the head and the body are the same node objects afterwards, and only the body's
contents are rewritten. At rest the whole thing is emptied and removed, not
merely hidden, which is `[S06.7]`'s ruling and its mechanical half:

```
teardown: ledger hidden = true  rows = 0  .ld-now present = false
          leaves under #ledger = []
```

## The split, verbatim, as three separate facts

Lasers (3 damage) against a unit holding 2 shield and 1 health:

```
record hit  = {"shield":2,"health":1,"spare":0}
three facts = ["Shield took 2 of the 3.", "Health took 1.", "Nothing was spare."]
```

The same hit against 0 shield and 1 health, which is the overkill case
PROJECT.md names as a thing a student should be able to see:

```
record hit  = {"shield":0,"health":1,"spare":2}
three facts = ["Shield took 0 of the 3.", "Health took 1.", "Spare: 2."]
```

**Three facts of a fixed shape, always all three when a hit landed**, because a
fact that appears only sometimes is one a student has to notice the absence of.
Nothing is said at all when no damage landed — a split of zeroes for a swing
nobody took is `damageSplit`'s own objection to clamping.

## The by-hand ruling, verbatim

```
record = [{"side":"cats","unit":"c1","tok":"hp","from":3,"to":1},
          {"side":"mechs","unit":"m1","tok":"dead","from":0,"to":1}]
rendered = ["Set by hand this round",
            "Cat 1 — ","Health"," set by hand, 3 to 1.",
            "Mech 1 — ","Dead marker"," set by hand, 0 to 1."]
```

`hand` is read through `hasOwnProperty` before anything touches it, which is
plan 05-05's message to this plan verbatim — it is present **only** when the
round held a ruling (D-04), and a round nobody ruled in renders nothing at all.

## Round one, and the two surfaces reading one record

```
round-1 reading = ["Round 1 has not resolved yet. There is no earlier round to
                   set this board against."]
is it a row of zeroes? = false
```

An Advance that took a unit from 3 health to 1, with the reading and the ledger
row set side by side:

```
reading                     = ["Cat 1 — Health 3 to 1.", "Cat 1 — Shield 1 to 0.",
                               "Nothing on this side changed in round 2."]
the ledger's row for that round = ["Cat 1 — Health 3, Shield 1.", ...]
record was.c1 = {"id":"c1","hp":3,"shield":1,"alive":true}
live c1       = {"id":"c1","hp":1,"shield":0,"alive":true}
```

**Both `3`s and both `1`s come out of the same record** — `past[last].was` — and
neither is stored. And a side that nothing touched says so rather than rendering
empty:

```
["Cats","Nothing on this side changed in round 1.",
 "Mechs","Mech 1 — ","Shield"," 3 to 2."]
```

## `FIGHT_FLOOR` — 83 → 108, and the DRIVE moved with it

Plan 05-01 named 05-07, 05-08 and 05-09 as owing this re-measure. **This
payment is the one where the number and the board it is taken off both had to
change**, and the reason is the same hole probe X measured one plan ago.

On the drive as it stood — `startFight()` and nothing else — `state.fight.past`
is empty, so the region paints its heading and the one sentence that says round
1 has not resolved yet, **and stops**. Measured on three roster sizes:

| cards on the board | 12 | 4 | 2 | per card | roster-independent |
|---|---|---|---|---|---|
| old drive | 217 | 129 | 107 | 11 (unchanged) | **85** |

**+2 is the whole of what a floor over that page can ever see of this region.**
Every row it draws needs a round that has resolved, and the plan's own threat
register assigns T-05-35's mitigation — *the fight-mode harvest now reads this
exact region* — to that harvest. A mitigation that reads an empty region is not
one, so the drive now **plays** a round: one declaration a side, a real Advance,
one declaration a side again.

| cards on the board | 12 | 4 | 2 | per card | roster-independent |
|---|---|---|---|---|---|
| new drive | **276** | 164 | 136 | **14** | **108** |

**The marginal cost of a unit card moved again, 11 → 14**, which is the part a
plan reading only the totals would get wrong for the third time running. The
extra 3 are the ledger row's own line for that unit: the walk reads its
name-and-dash fragment, the fragment between its two numbers and the fragment
after the second, and **skips the two token-name nodes between them** because
those carry the rename exemption marker. `276 − 12×14 = 108`, and 108 is the
reading off the board this row actually harvests.

**Two axes now move the roster-independent part and both only ever move it
upward**: the action count (recorded by 05-07) and now the number of rounds
already resolved. The drive resolves exactly one round, so 108 is measured at
the floor of that axis too.

**The second pair of declarations is deliberate and it closes plan 05-07's
requirement 2 on plan 05-10.** `advanceRound` empties the declaration list, so a
harvest taken straight after an Advance would have closed the ledger's hole and
left probe X's open. Three surfaces are now on the page the walk reads: the
declaration list, one resolved round in the ledger, and the what-changed reading.

## What the real browser found that no gate in this repo can

Real Chrome **and** real Edge, `channel: 'chrome'` / `'msedge'`, `file://`,
1920×1080, every op driven through `App.ops`. **Zero page errors and zero
console errors in both, on every run.**

### The layout defect, found and fixed

**Stacked, the region was 723px tall with ONE round in it and put `#board`'s top
at 1500 of a 1080px screen.** The Node harness computes no layout and reported
the file spotlessly clean through all of it — which is the lesson plan 05-06 paid
for and plan 05-07 paid for again, arriving a third time from a third direction.

Three fixes, each measured:

1. **The rounds and the reading sit side by side** above a 1100px breakpoint, so
   the region costs the **taller** of its two halves instead of their sum.
   Document order is untouched — a screen reader still walks heading, rounds,
   reading — because the column arrangement is a two-dimensional placement of
   that same order and never a reordering of it. **1500 → 1313.**
2. **The unit readings and the split's three facts wrap along the line** instead
   of stacking. One line per unit made a single row of the shipped board 497px
   tall — taller than the region is allowed to be — so the newest round could not
   be seen whole. Wrapped, the same twelve readings occupy four lines a side and
   the three facts take an action from four lines to two. **A round went 462px →
   353px.** The split is still three separate nodes, which is what FIGHT-16 asks
   for; what changed is the direction they run in.
3. **`.ld-now-body` is bounded at 20vh and scrolls on itself**, because the
   reading draws one line per unit that moved — at 24 units a side that is 72
   lines directly above the live board with nothing to stop it. It was the third
   region in this phase with an unbounded growth axis.

### The dial, re-turned from 46vh to 34vh with the measurement

`.ld-list`'s 46vh was measured honestly by plan 05-06 **against a page that no
longer exists**: when it was set, `#fightbar` held six nodes and cost almost
nothing. Plan 05-07 then filled that region and bounded it at 34vh, and the two
bounds became one budget neither plan could see whole. Re-measured across four
settings, thirty rounds deep, in both browsers:

| `.ld-list` | board top @1920×1080 | board top @1440×900 | newest round fits whole |
|---|---|---|---|
| 46vh | 1313 | 1169 | yes |
| **34vh** | **1183** | **1061** | **yes** ← shipped |
| 28vh | 1118 | 1007 | no |
| 24vh | 1075 | 980 | no |

34vh is the smallest setting in which the **whole** of the newest round is on
screen at once, and it is the **same number** `.fg-sides` already carries, so the
page above the board is one dial repeated rather than two to keep in step.
`[C14]`'s paragraph is amended in place rather than left standing.

### And the honest figure, which is not good

**1183 is still below the fold of a 1080px screen.** With a fight running and one
round resolved, the page above `#board` is taller than the viewport and the live
board is reached by scrolling. That is not this region's doing alone — with the
ledger hidden entirely the board's top already sits at **759**, which plan 05-07
measured and handed on — but it is now the phase's largest layout question and it
has **three** dials in it rather than two: `.fg-sides` 34vh, `.ld-list` 34vh,
`.ld-now-body` 20vh. It is written into `[C14]` with every figure and it is
`REHEARSAL.md` item **B3**.

### The rest of the live readings, identical in both browsers

```
rows / region / list, at 1 / 3 / 10 / 30 rounds:   1,3,10,30 rows; 396,406,406,406; 357,367,367,367
board top                                          1173 at 1 round, 1183 at 3, 10 and 30
#ledger left / width vs #board left / width        160 / 1600  ==  160 / 1600
list scrolled to its end on append                 distance-from-end = 0 at EVERY depth
newest row's bottom above the live board's top     20px at 1 round, 24px at 3, 10 and 30
the reading's bottom above the live board's top    18px at every depth
#strip position                                    sticky, on every board
overflow of every ancestor of #strip               visible, on every board
#strip's viewport top at page scroll 0/1200/1600/2200   1116 -> 64 -> 64 -> 64
.ld-say and .ld-word computed-identical            true (8 properties)
round label                                        18px
smallest label anywhere in the region              18px
```

Plan 05-06 predicted the newest row's bottom would sit **20px** above the live
board once the list was scrolled to its end. It measures 20px at one round and
24px once the list is at its bound.

## The costs, measured at the cap

| | ms |
|---|---|
| `ledger()` on a frame where nothing moved, 30 rounds | **0.073** |
| `ledger()` on an Advance-shaped repaint, 30 rounds | **0.079 – 0.191** |
| `ledger()` on a rename-shaped repaint (every row rewritten) | **7.8 – 8.2** |
| one Advance and one whole frame, 0 / 10 / 30 rounds behind | **4.1 / 3.1 / 3.8** |
| `ldRowsSig` (the whole of `past`, 18 KB) | 0.071 |
| `ldNamesSig` / `ldNowSig` | 0.012 |

`sync()`'s own baseline on this board is 0.17 ms, so the **resting** cost of this
region is under half a sync, and **the cost of an Advance does not grow with the
depth of the ledger** — which is the browser measurement from 05-RESEARCH.md said
again from the other end.

**The three-fingerprint split is what bought that.** The first draft rewrote every
row's interior whenever anything moved and measured **7.46 ms at the cap on every
Advance**. A past record is immutable once `advanceRound` has pushed it, so a
row's interior can go stale for exactly one reason — a name it draws moved — and
that is what the second fingerprint answers. Split, the 7.8 ms is paid only by a
mid-fight rename, which is the thing that actually needs it.

## The three probes, run after their task's commit, recorded verbatim, reverted

`git checkout -- cats-vs-mechs.html` was never used. Every revert was `cp` from a
scratchpad snapshot and `git status --short` read clean after each.

### PROBE Y — the ledger rebuilt with `replaceChildren` on every frame

Clean, before the injection:

```
Y: rows after 3 advances = 3  rounds = ["1","2","3"]
Y: rows after the 4th    = 4  rounds = ["1","2","3","4"]
Y: ROW COUNT clause      = true
Y: NODE IDENTITY clause  = [true,true,true]
Y: entry-animation class on each row = [false,true,true,true]
```

With `list.replaceChildren()` at the top of the grow pass:

```
Y: rows after the 4th    = 4  rounds = ["1","2","3","4"]
Y: ROW COUNT clause      = true          <-- STILL GREEN
Y: NODE IDENTITY clause  = [false,false,false]     <-- RED
Y: entry-animation class on each row = [false,false,false,false]
```

**Exactly the outcome the plan predicted: the count passes a rebuild and the
identity does not.** The third line is a finding the plan did not ask for — the
entry-animation class is lost too, because `animate` is computed from a list that
the rebuild has just emptied, so on a rebuilt ledger the newest round stops
announcing itself as well as replaying every older one.

**AND THE SHIPPED SUITE STAYED SPOTLESSLY GREEN OVER IT:** 1185 passed, 0 failed,
147 of 147, exit 0. No numbered check in this repository compares ledger rows as
nodes. **Plan 05-10 owes that row**, and it is written into `[S06.8]`'s own banner
with the reason rather than left as a hope.

### PROBE Z — the delta stored on the fight slice and rendered from there

Clean, derived at render time:

```
Z: after the Advance, the reading = ["Cat 1 — Health 3 to 0.", ...]
Z: after a by-hand ruling with NO Advance:
Z:   the reading = ["Cat 1 — Health 3 to 2.", ...]   state says 2
Z:   DOES THE READING AGREE WITH THE BOARD? = true
```

With the delta computed inside `advanceRound` and stored on `state.fight`:

```
Z: after a by-hand ruling with NO Advance:
Z:   the reading = ["Cat 1 — Health 3 to 0.", ...]   state says 2
Z:   DOES THE READING AGREE WITH THE BOARD? = false
```

**And nothing in the repository caught it:** 1185 passed, 0 failed, 147 of 147,
every scan clean, exit 0.

**That is the finding, and the plan says to close it here rather than leave it.**
The five-key shape row that already existed in `[S09.12]` is taken on a **fresh**
fight — the one state in which nothing has had a chance to store anything — so a
key written inside `advanceRound`'s mutator sails past it. Three rows are added
on the other side of a resolved round, at all three depths a cache could hide at:

```
FAIL  the fight loop :: AND THE SLICE IS STILL EXACTLY THOSE FIVE KEYS ONCE A
      ROUND HAS RESOLVED. Advance leaves nothing behind …
      actual:   cats,decl,mechs,moved,past,round
      expected: cats,decl,mechs,past,round
1187 passed, 1 failed
exit=1
```

Re-injected against the closed gap, probe Z reddens **by name**. The unit depth is
plan 05-05's row restated on a resolved board for its own reason: a per-value flag
beside `hp` measures clean as a key name and is exactly what a well-meaning author
reaches for.

### PROBE AA — a non-visible overflow on an ancestor. **EXPECTED SILENT, AND IT WAS SILENT.**

`#app` — an ancestor of `#topbar`, `#strip`, `#fightbar` and `#ledger` — given
`max-height:120vh;overflow-y:auto`, which is the plainest form of the mistake
`[C03]` was written to prevent.

```
scan: no forbidden patterns
scan: no comparative language in the document (Layer A, 18 words)
scan: no comparative language in the 7279 string literals (Layer B, 27 words)
1188 passed, 0 failed
perf: 100 commits in 7 ms (budget 50 ms)
stub-drift gate: 111 shell ids, all built by the stub page
scan: 127 rendered strings read from #app (Layer C, 48 words)
scan: 145 rendered strings read from 4 dialog root(s) …
scan: 276 rendered strings read from #app WITH A FIGHT RUNNING (Layer C, floor 108)
interaction gate: 147 of 147 checks passed
exit=0
```

**Nothing said anything.** This is plan 05-06's probe V driven a second time from
the other region and reaching the same silence. It is harness limitations entry
**20**.

**AND THIS IS WHERE THE CONTEXT ADDENDUM CHANGES THE ANSWER.** A real browser
sees it immediately, so the silence belongs to *this harness* and not to *this
environment*. Chrome, 1920×1080, one round resolved, page scrolled to
0 / 1200 / 1600 / 2200 and `#strip`'s viewport top read at each:

```
clean      1116 -> 64 -> 64 -> 64      (it pins, as intended)
probe AA   1116 -> 900 -> 900 -> 900   (it never pins)
document scrollHeight                   3490 clean, 1296 injected
```

So entry 20 is written as *which machine can see it* rather than as *unreachable*,
with both readings and the shape of the row that belongs in
`tests/browser-checks.mjs`. **And the limitations list's opening sentence — "there
is no browser and no layout engine in this repo" — is corrected rather than left
standing**, because it is the sentence that put layout items on a human's list for
three phases. Entries 2, 6, 9, 11 and 20 are now named as machine-closable;
entries 4, 8, 10 and 18 are named as closable by no machine at all.

## Deviations from Plan

### Auto-fixed

**1. [Rule 1 — bug] The region put the live board 420px off the bottom of a projector, found by driving a real DOM**

- **Found during:** task 2's browser verification, after the task's code was committed.
- **Issue:** stacked, `#ledger` was 723px tall with one round in it and `#board`'s
  top sat at 1500 of a 1080px viewport. The Node harness computes no layout and
  reported the file spotlessly clean throughout.
- **Fix:** three, each measured — the side-by-side arrangement above 1100px
  (1500 → 1313), wrapped unit readings and wrapped split facts (a round 462 → 353px),
  and a bound with its own scroll on `.ld-now-body`, whose growth axis is the
  roster.
- **Commit:** `765e997`

**2. [Rule 1 — bug] The plan's suggested cheap exit freezes the ledger at round thirty**

- **Issue:** *"if the number of rows already on the page equals `past.length`,
  return before doing any work"* is correct until the cap and wrong afterwards:
  `past.length` stays at thirty while the contents shift by one.
- **Fix:** the front is trimmed against the oldest surviving record's own round
  number, and only then does position pair the rest. Driven two rounds past the
  cap: 30 rows, oldest round 3, newest 32, `past[0].round` 3.
- **Commit:** `b055e42`

**3. [Rule 2 — missing critical functionality] `.ld-now-body` had no bound**

- **Issue:** the reading draws one line per unit that moved; at 24 units a side
  that is 72 lines directly above the live board with nothing to stop it.
- **Fix:** `max-height:20vh;overflow-y:auto` **on the element itself**, with
  `[C03]`'s sentence at the site because `.ld-now-body` had to be checked against
  it before the rule was written.
- **Commit:** `765e997`

**4. [Rule 2 — a gate that cannot see the region it is required to bound] check 92's drive**

- **Issue:** the plan's threat register assigns T-05-35's mitigation to the
  fight-mode harvest. That harvest calls `startFight()` and reads immediately, so
  `state.fight.past` is empty and not one ledger row is ever painted for the walk
  to read. A floor over that page bounds this region at exactly nothing.
- **Fix:** the drive plays a round — declare, Advance, declare — which puts the
  ledger's rows, its split and the declaration list on the page at once. It also
  closes plan 05-07's requirement 2 on plan 05-10.
- **Commit:** `b055e42`

**5. [Rule 2 — a banner that would otherwise quietly lie] `[C14]`'s 46vh paragraph amended**

- **Issue:** the paragraph justified 46vh with figures measured when `#fightbar`
  held six nodes. It now holds 367px of surface, and the paragraph's arithmetic
  no longer described the page.
- **Fix:** amended in place with the four-setting re-measurement, the reason the
  original figure was honest and is now wrong, and the three-dial budget stated
  as a budget. `.ld-list` 46vh → 34vh.
- **Commit:** `765e997`

**6. [Rule 2 — the same class of thing] the limitations list's opening claim**

- **Issue:** *"There is no browser and no layout engine in this repo"* is false and
  is the sentence that put layout items on a human's list for three phases.
- **Fix:** corrected, with the entries sorted into machine-closable and
  human-only, and entry 20 added with both browser readings.
- **Commit:** `f8c09dd`

### Corrections to the plan's own premises

**7. [finding] Task 2's work could not be a separate commit from task 1's**

The plan splits the ledger (task 1) from the what-changed reading (task 2), but
`[S06.8]` is one sub-region with one hook, one build-once flag and one teardown.
Shipping the ledger without the reading would have left a region whose teardown
removed a node its builder had not created. The reading's **code** therefore
landed in task 1's commit; task 2's commit carries `[C14.2]`, the layout fixes
the browser found and the bound on the reading. Both tasks' acceptance criteria
are driven and recorded above.

**8. [finding] The plan's `#app` (setup) acceptance is satisfied by the cheap exit**

Task 1 and task 2 both ask for `#app` to be re-measured. It stayed at 127 and
correctly so: the setup page is the page with no fight running, and the whole
point of the cheap exit is that this region paints nothing there. This is the
same correction plan 05-07 recorded, and it is now true of two regions.

### Handed on rather than answered

**9. [finding, and it is the phase's largest layout question] The page above the live board no longer fits a 1080px screen**

`#board`'s top is at **1183 of 1080** with a fight running and one round
resolved, and at **759** with the ledger hidden entirely. Three dials are in that
budget and no two of them were set by the same plan. `#strip` is sticky and every
ancestor of it reports `overflow: visible` on every board driven, so the
projection stays on screen through the scroll — but whether a student can operate
the page that way is a rehearsal question. `REHEARSAL.md` **B3**, with every
figure.

### Declined by design

- **Nothing presses.** No listener, no `App.ops` call, no `data-act`, no `data-k`
  anywhere in the region. A ledger row is a reading and not a control.
- **No `<dialog>`**, so no `DIALOG_ROOTS` entry; the harvest stays at four roots.
- **No shell id added**, so no `KNOWN_IDS` or stub change and no three-part rule
  to keep. Every node this region builds is `createElement`'d and carries no id.
- **No `[S05]` op, no `[S07]` handler and no line of `[S06.1]` through `[S06.7]`
  was touched.** The `[S09.12]` rows and the `[C14]` paragraph are the two edits
  outside `[S06.8]` and `[C14.2]`, and each has its reason at its site.
- **No verdict, and none of the eight clean-but-unshippable words.** `contested`,
  `one-sided`, `blowout`, `lopsided`, `even`, `close`, `tight` and `behind` appear
  in no string this region renders. The round is never a "Day".
- **No delta is rendered.** `Health 3 to 1` is two numbers; a signed difference
  beside them would be a third number saying the same thing, and `signed()`'s
  ASCII rule is named in the region for the day one is wanted.

## What plan 05-10 owes, with the measurement behind each

1. **The node-identity row for the ledger.** Probe Y drives the rebuild, its row
   count stays green and its identity clause reddens. No check in this repository
   compares ledger rows as nodes today.
2. **Check 63b's parallel** — no node inside `#ledger` carries an attribute the
   interaction layer dispatches on or the sync pass writes. Four counts, all zero,
   driven above in the sandbox and in both browsers. `App.render.ledger` is
   exported so that row can paint the region onto a state it just wrote.
3. **A driving row of probe S's character on this region**, which is now cheap to
   name precisely: renaming a token type must move an ALREADY-DRAWN row. The
   fingerprint that answers it is `data-ld-names` and it is separate from
   `data-ld-rows` for a measured reason.
4. Requirements 1, 3, 4, 5 and 6 from plan 05-07's list are unchanged and still
   owing. Requirement **2 is closed by this plan** — check 92 now harvests with
   declarations on the page.

## What plans 05-09 and 05-11 inherit

- **05-09:** `FIGHT_FLOOR` is **108** and the marginal cost of a unit card on the
  fight page is **14**, not 11 — the board-in-fight-mode re-measure starts from
  those two. Check 92's drive now **plays a round**, so anything `[S06.9]` paints
  on a resolved board is inside the harvest. `#fight-said` is still empty and
  hidden and this plan touched nothing in `#fightbar`. `[C14.3]` is still free.
  And the layout budget is now three dials rather than two — a fourth region
  above the board would need its own bound and its own measurement.
- **05-11:** one new item with numbers, `REHEARSAL.md` **B3**, and it is the
  phase's largest: the page above the live board is taller than a 1080px screen.
  The three dials — 34vh, 34vh, 20vh — are one budget to be turned together
  against the real display. Also, and it is a judgement no measurement settles:
  whether past rounds read as *past* rather than as *disabled*, whether "stacks
  upward" is what a person actually sees, whether the three-fact split is clearer
  than one number or merely longer, and whether overkill reported without comment
  reads as neutral or as the tool being pointed.
- **Everyone:** **a real browser is available and it has now found a layout defect
  in three consecutive plans** — a shorthand resetting a longhand (05-06), a
  region 776px tall (05-07), and a region that put the board 420px off the bottom
  of the screen (05-08). All three ran through a spotlessly green suite. If a plan
  writes CSS or shell markup, drive it before claiming it clean.

## Known Stubs

| stub | file | why it is intentional | resolved by |
|---|---|---|---|
| `App.render.ledger` is exported with no caller | cats-vs-mechs.html | a ledger row is a reading and not a control, so nothing presses into this region and none ever will. It is exported so plan 05-10's check-63b parallel can paint the region onto a state it just wrote, and because an entry point reachable only through `SYNC_HOOKS` is one no reader can find from the outside. The reason is written at the export | 05-10 |
| no numbered check watches ledger row identity | cats-vs-mechs.html | plan 05-10's section ownership claims the fight checks. Probe Y is recorded verbatim and the comparison that reddens is written into `[S06.8]`'s banner | 05-10 |

Neither prevents this plan's goal, which was to put the past on screen and make
the present readable against it.

## Threat Flags

None. No new network endpoint, auth path, file access pattern or schema change at
a trust boundary. The six mitigations the plan's threat register assigns:

| Threat | Mitigation, as shipped |
|---|---|
| T-05-32 the ledger rebuilding every frame and replaying every past round's animation | grown by delta only; node identity asserted as identity across an append and across a rename; **probe Y drives the rebuild and reddens the identity clause while the row count stays green**, which is the plan's own point |
| T-05-33 a ledger row carrying `data-k` and stealing focus restore | zero `data-k`, `data-act`, `data-amt`, `.brd-value` and `.brd-line--opt` over 2,472 nodes in the sandbox and over the live page in both browsers; the region is outside `#board` by 05-06's design and the measured hazard is written into the banner |
| T-05-34 a stored delta letting the board and the reading disagree | derived at render time only; **probe Z drove the stored version, the whole repository was green over it, and the gap is CLOSED here** with three `[S09.12]` rows that redden it by name |
| T-05-35 a ledger row that comments instead of reporting | plan 05-01's widened lists **now actually read this region** — check 92's drive was moved so a resolved round is on the page it harvests, taking the fight-mode reading from 215 to 276 with zero hits. The eight clean-but-unshippable words are named in the region's own comment |
| T-05-36 an overflow on an ancestor silently stopping `#strip` sticking | the ledger scrolls on `.ld-list` and the reading on `.ld-now-body`, both on themselves; `[C03]`'s own sentence written into `[C14.2]`; **probe AA records that nothing in this harness can see it and that a real browser sees it at once**, with both readings in limitations entry 20 |
| T-05-SC npm/pip/cargo installs | zero packages installed. Playwright was resolved from an existing scratchpad install through `PLAYWRIGHT_DIR`, exactly as `tests/browser-checks.mjs` documents, and nothing was added to the repository |

## Requirements

**None marked complete, and that is deliberate** — the reading plans 05-04
through 05-07 all took. The plan names FIGHT-08, FIGHT-14, FIGHT-15 and FIGHT-16:

- **FIGHT-08** — `did` plus `hand` is rendered in readable order, with the split
  as three facts and every by-hand ruling named. Whether it reads as a *log a
  student can follow at a table* is plan 05-11's.
- **FIGHT-14** — past rounds accumulate above the live board and stay there.
  Whether "stacks upward" is what a person sees, and whether the live board is
  usable with its top at 1183 of 1080, is `REHEARSAL.md` B3.
- **FIGHT-15** — the live board says what changed since the previous round, in two
  numbers, derived at render time. Whether a student *reads the effect of their
  own declaration without reconstructing it* is the claim only a playtest settles.
- **FIGHT-16** — the split is shown as three facts and never collapsed. Whether
  three facts are clearer than one number or merely longer is plan 05-11's.

Marking any of them here would be the same defect this phase keeps finding.

## Self-Check: PASSED

Files verified present: `cats-vs-mechs.html`, `tests/selftest-node.cjs`,
`.planning/REHEARSAL.md`,
`.planning/phases/05-fight-loop-playtest/05-08-SUMMARY.md`.

Commits verified in the log: `b055e42`, `765e997`, `f8c09dd`.

Verified in the artifact: one `[S06.8] RENDER — THE LEDGER` banner, one
`#region`/`#endregion` pair for it, one `SYNC_HOOKS.push(syncLedger)`, one
`ledger: ledger` on `[S06]`'s return, one `[S00]` table-of-contents line for
`[S06.8]`, one `[C14.2] THE LEDGER` banner, and zero `data-k` and zero `data-act`
inside the rendered region.

Final run: `node tests/selftest-node.cjs` → **1188 passed, 0 failed**, stub-drift
**111 shell ids**, interaction gate **147 of 147**, `#app` 127, dialogs 145 across
4 roots, fight-mode **276** against floor **108**, proposal 60, Layer A 18 words
clean, Layer B 7279 literals clean, perf 7 ms of 50, exit 0. Both naming greps
print **0**; `url(` prints 0; `createElementNS|<svg` prints 0; `text-wrap` prints
0; the hex pattern over `[C14.2]` prints 0. Working tree clean after every probe
revert; `git checkout --` was never used on either file.
</content>
</invoke>
