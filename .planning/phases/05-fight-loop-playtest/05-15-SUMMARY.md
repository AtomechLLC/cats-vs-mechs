---
phase: 05-fight-loop-playtest
plan: 15
subsystem: render+layout
tags: [s06.11, c14.4, d-27, battlefield, tokens, syncRow, dead-marker, lit-target, fight-04, fight-06, fight-09, ux-02]

requires:
  - phase: 05-fight-loop-playtest
    plan: 14
    provides: "the empty flagged .fg-field container, the data-fg=\"bf\" press arm and its recorded key contract, and the 1216/0 + 170/170 + 114-id baseline"
  - phase: 05-fight-loop-playtest
    plan: 13
    provides: "App.model.defaultAt / needsAt / spokenFor and the replace-per-performer declare shape the retarget rides on"
  - phase: 05-fight-loop-playtest
    plan: 09
    provides: "[S06.9]'s DC_DEAD_SAID, dcClass and the dead marker's shipped wording, glyph and D-00d rule"
  - phase: 02-allocation-surface
    plan: 01
    provides: "[S06.1]'s styleFor / labelFor / safeShape / safeColor / makeToken / syncRow / COMPACT_AT / SYNC_HOOKS"
provides:
  - "[S06.11] THE BATTLEFIELD — one labelled shape per unit per side, painted inside the container plan 05-14 reserved"
  - "[C14.4] the .bf- rules: clip-path tokens at a local --tok, a dead treatment said three ways, a lit treatment said two ways, and no disabled rule at all"
  - "the sender for [S07.5]'s data-fg=\"bf\" arm, built to the key contract that banner fixed, plus the one-line repaint trigger that makes the lit half visible"
  - "a fix for a SHIPPED layout defect: the two declaration columns were stacked rather than side by side at every viewport in both browsers"
  - "eleven interaction-gate rows, 106-106j. Gate 170 -> 180"
affects: [05-16, 05-11]

tech-stack:
  added: []
  patterns:
    - "a render sub-region that CALLS another sub-region's helpers across the shared IIFE scope rather than re-deriving them, with the dependency list written into its own banner"
    - "a repaint gate that calls the neighbouring region's own fingerprint rather than defining a second, narrower one"
    - "a build-once flag that is a FINGERPRINT rather than a bit, because the thing it guards can move mid-fight"
    - "a private data-* spelling chosen to avoid a document-order-first querySelector collision with another region, with the hazard written at the site"
    - "a probe whose expected finding is a GREEN suite, measured in a real browser, and answered with the row it proved missing rather than with a note"
    - "a dial re-derivation that finds the ORIGINAL derivation incomplete rather than stale, and records the subtraction it missed"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "THE UNIT SHAPE IS THE CONTROL. The addendum makes the battlefield the click surface for the change-target flow, so the thing a student aims at IS the thing they press. A separate button beside each shape would be a second node to pair with a unit by reading, on a projector, mid-fight — which is dcStandingLine's own argument for keeping the alive toggle inside its card. It costs 12 Tab stops on a 9-and-3 board (122 buttons on the page, up from 110), and that is recorded as a playtest question rather than argued away"
  - "THE LIT STATE IS SAID BY AN OUTLINE AND A REAL TEXT NODE, AND aria-pressed IS DELIBERATELY NOT USED. The file's idiom for a two-state control is class + aria-pressed + a real node, but aria-pressed means PRESSED and a lit unit is not pressed — it is available. So the two channels are the outline (a change of shape, which survives a projector with the colour washed out) and a node reading \"Pick this one.\" that is empty and hidden at rest. Content is what a screen reader and the rendered-page walk both reach; an attribute is not"
  - "THE BATTLEFIELD'S TOKEN ROWS CARRY data-bf-amt AND NOT data-amt/data-unit, AND THAT IS MEASURED RATHER THAN STYLISTIC. [S06.1]'s per-frame passes are scoped to #board and would never reach these rows — but four rows of the gate and one row of [S09] take a document-wide `.tok-row[data-amt=…][data-unit=…]` or `[data-lbl=…]` lookup, querySelector returns the FIRST match in document order, and #fightbar sits AHEAD of #board. Rows spelled the board's way here would silently answer for the board's. It is [S06.3]'s data-k-in-#strip hazard arriving one attribute over"
  - "THE REPAINT GATE CALLS fgSig RATHER THAN DEFINING A SECOND ONE. fgSig already takes both slices whole plus both half-made-change attributes, which is exactly this region's dependency set. A narrower fingerprint here would be a second definition of \"has anything moved\", and 03.1-05's recorded pre-02.1-04 defect is what that costs. The second stringify is paid for and the price is written at the site"
  - "THE BUILD-ONCE FLAG IS A ROSTER FINGERPRINT AND THE ROSTER AXIS CANNOT BE DRIVEN MID-FIGHT, so the row that asserts it drives the OTHER axis the fingerprint watches. addUnit's mutator touches s.build alone, so a mid-fight addUnit cannot move the fight roster at all — but a unit-scoped token type created mid-fight adds a line to every shape, and that is the drive check 106 takes. The addUnit half is asserted in the direction it IS true: the cluster must NOT grow, and must grow on the next start"
  - "--tok IS OVERRIDDEN LOCALLY TO 12px WITH THE ARITHMETIC AT THE SITE. The developer's word is SMALLER shapes on the unit shape, so smaller is a requirement rather than a liberty: a nine-health row at the shipped 22px/6px is 246px against a 332px column and the cluster would be one unit per line. At 12px/3px it is 132px and two units sit along the line. [C00]'s dial is untouched, which is what .pk-sw's precedent is for"
  - "LINES ARE HIDDEN AT ZERO AND HEALTH IS EXEMPT. [S06.1]'s hide pass restated: building only the non-zero lines would make a tally going 0 -> 1 a STRUCTURAL change and throw away every token node in the cluster. Health is never hidden because a unit at zero health is the moment a student is deciding whether to rule it dead, and a health line that vanished exactly then would be the surface hiding the question"

patterns-established:
  - "a plan that owes a dial re-measure takes it and finds the ORIGINAL derivation incomplete rather than merely stale — and keeps the hand-off paragraph, amended to say what came back"
  - "a probe expected to leave the suite green leaves it 178 of 179, and the near-miss is itself the finding: the one row that caught it caught an animation CLASS by accident rather than the property"
  - "a coupling between two regions that cannot call each other is written down as a coupling at BOTH ends and given the gate row that watches it"

requirements-completed: [FIGHT-04, FIGHT-06, FIGHT-09, UX-02]

duration: 168min
completed: 2026-08-29
---

# Phase 05 Plan 15: THE BATTLEFIELD Summary

**D-27's addendum, built: the fight tab now shows the battle — Cats on the left
and Mechs on the right, matching the columns, one labelled shape per unit
carrying smaller shapes for its health, its shield and every tally it holds,
drawn from that token type's own shape, colour and glyph through the board's own
machinery, so a type a student invented and styled appears in the battle exactly
as they authored it. A unit they ruled dead is still there and still marked.
Press Change target and the other side lights up; one click moves it. Nothing on
it can be edited, nothing on it judges, and nothing on it replays an animation it
has already played.**

## The gate, before and after

| | before (post-05-14) | after |
|---|---|---|
| suite | 1216 passed, 0 failed | **1216 passed, 0 failed** |
| `SUITE_FLOOR` | 1186 | 1186 — **not moved**; this plan adds no `[S09.*]` row |
| interaction gate | 170 of 170 | **180 of 180** (+10) |
| stub-drift | 114 shell ids | **114 — unchanged, no id added** |
| `#app` (setup) | 128 | **128 — unchanged** |
| `#app` (fight) | 411, `FIGHT_FLOOR` 120 | **423**, floor 120 — **not moved** |
| dialogs | 145 across 4 roots | 145 across 4 roots — unchanged |
| proposal pane | 60, floor 23 | 60, floor 23 — unchanged |
| Layer A | 18 words, 0 hits | 18 words, **0 hits** |
| Layer B | 8016 literals, 0 hits | 8016 literals, **0 hits** |
| browser checks | 22 passed, 0 failed | **22 passed, 0 failed** |
| private fight controls | 51 | **50 on a fresh board** (38 grid + 12 battlefield), floor 45 |

`node tests/selftest-node.cjs` exits 0.

**`counter|balanc|rating` 0, whole document. `url(` 0. The namespaced
constructor and the namespaced opening tag 0 each. `innerHTML` 0. `text-wrap` 0.
Hex over `[C14.4]` 0. One classic `<script>`, one `<style>`.
`DEFAULTS.cats.ap` untouched — the whole of `[S01] DATA` diffs EMPTY (D-25).**

### The fight harvest, handed to plan 05-16 with a reading rather than a guess

411 → **423** (+12). The battlefield adds 4 unit names per side on row 92's
trimmed 2-a-side board, plus the artifact's two sentences where they apply. It is
only +12 because every token-type LABEL on it carries the rename exemption
marker and is skipped — the same marker doing its job that the 41 → 56, 83 → 108
and 108 → 120 entries each recorded. `FIGHT_FLOOR` is 120, is not breached, and
is **not moved**: plan 05-16 owns it.

## What was built

### `[S06.11] RENDER — THE BATTLEFIELD`

One sub-region, appended after `[S06.10]`, registering its own `SYNC_HOOKS`
entry. It paints **only** inside `.fg-field` and touches no other node.

Per unit, one `<button class="bf-unit">`:

```
Cat 1                       .bf-name      18px, permanent, no exemption marker
  Health  ●●●               .bf-line[data-bf-amt="hp"]     the FIGHT's hp
  Shield  ▬                 .bf-line[data-bf-amt="shield"]
  Zeal    ⬡⬡⬡⬡              .bf-line[data-bf-amt="<student's id>"]
  Dead marker  💀           .bf-line[data-bf-amt="dead"]
  Still on the roster, ruled dead.       .bf-said
  Pick this one.                         .bf-pick
```

Measured in real Chrome, a shipped Cat at 3 health: the shape is 150 × 65px,
carries 3 built lines of which 1 is visible (shield and the dead marker are
hidden at zero), and reads `Cat 1 / Health`.

**Everything token-shaped goes through the shipped machinery, CALLED:**
`styleFor`, `labelFor`, `safeShape`/`safeColor` (inside `makeToken`), `syncRow`
and `COMPACT_AT`. `[S06.7]`'s `fgUnitName`, `fgHalfMade` and `fgSig` and
`[S06.9]`'s `DC_DEAD_SAID` and `dcClass` are read across the shared `[S06]`
scope. Not one token node is built by this region.

**The two divisions written at the site:**

- **health is `unit.hp`, the FIGHT's** — never `maxHp`, which is the build's
  allocation and which the board's own row deliberately draws. Driven: a hand
  ruling took m1 from 6 to 4 and the battlefield's row went 6 → 4 while the
  board's stayed at 6.
- **the dead marker is the STORED `alive` flag** — never `hp === 0`, in either
  direction.

### `[C14.4] THE BATTLEFIELD`

`.bf-unit` overrides `--tok` to 12px and `--tok-gap` to 3px, with the
arithmetic beside it. No `:disabled` rule exists in the block, deliberately.
Three sayings for dead (a real marker token, the artifact's own sentence, and a
dim derived with `color-mix()` from `--ink-dim` — `.dc-card--dead`'s exact
arrangement, restated rather than borrowed). Two for lit (an outline and a real
word node). No overflow anywhere.

### The sender for `[S07.5]`'s arm

Every shape carries `data-fg="bf"`, `data-fg-side`, `data-fg-val` and
`data-k="fg/bf/{side}/{unit}"` — copied from the banner that fixed the spelling.
**`[S07.5]` gained exactly one call and its comment; every other line of every
`[S07.*]` region diffs EMPTY, and `.disabled` still prints 0 over `[S07.5]`.**
That call is a Rule 3 fix and is argued below.

## THE DEFECT THE BROWSER FOUND, AND IT WAS ALREADY SHIPPED

**The two declaration columns were not in columns.** They were stacked, one
under the other, inside a 200px scroller on a 1366x768 laptop — at every
viewport, in both browsers, on the commit before this plan as well as on it.
D-27's headline sentence is *"Show both sides at the same time in columns."*

Plan 05-14 recorded "both columns sit along the line at both viewports". That
reading was taken off the BAR's width rather than off the two columns'
positions, and 736 was never the wrong number. `.fg-side`'s **340px basis** was:

```
#fightbar content box    736 - 36 padding - 2 border   = 698
.fg-sides own padding                      - 4         = 694
the scroller's gutter, measured 15.33 in Chrome        = 679
```

679 < 696, so the pair wrapped. The derivation subtracted the bar's padding and
border and never subtracted the container `[C14.1]` then made into a scroller.

**The sweep, real Chrome and real Edge, 1920x1080 and 1366x768:**

| `.fg-side` basis | along the line? | width each column RENDERS at |
|---|---|---|
| 340 (shipped) | no | 679 — stacked, full width |
| 336 | no | 679 |
| 332 | no | 679 |
| 330 | **yes** | 332 |
| **320 — shipped** | **yes** | **332** |
| 300 | yes | 332 |

**The dial costs nothing, which is worth saying because a dial turned down
usually costs something.** `flex-grow` is 1, so the basis decides only whether
the pair fits on one line; once it does, both columns grow and land at 332px —
8px short of what 340 was reaching for, and those 8px are exactly the scrollbar.
320 rather than 330 because a scrollbar's width is a platform number this file
cannot measure at author time; 320 tolerates a gutter up to ~27px.
`scrollbar-gutter` would answer it exactly and is **not** used: its Safari
support lands after this artifact's stated floor.

**736 is not moved and neither is the 1180px breakpoint derived from it.** With
a 320 basis the pair needs 656 of content and has 679 — 23px of slack instead of
a 17px deficit. Moving the bar instead would have taken width off the ledger AND
moved the media query, which is two dials for a defect that is one number.

Verified after the fix, both browsers, both viewports, on the shipped 9-and-3
board **and at 24 a side**: `alongTheLine: true`, `catsW = mechsW = 332`,
`#fightbar` 736, `#strip` still `sticky`, every ancestor of `#strip` still
`visible`, page errors and console errors `[]`.

## The `[C14.1]` 26vh bound: re-measured, and it did not have to move

| | before the battlefield | after |
|---|---|---|
| Advance bottom @1920x1080 | 841 of 1080 | **841 of 1080** |
| Advance bottom @1366x768 | 752 of 768 | **752 of 768** |
| `.fg-sides` window @1080 / @768 | 281 / 200 | 281 / 200 |
| scrolled content, 9-and-3 | 1838 | **2221** |
| scrolled content, 24 a side | 5161 | **5484** |

`.fg-field` is a descendant of the bounded scroller, so the cluster grows INTO
the window rather than past it and the Advance control does not move by a pixel.
**What it costs is said out loud in `[C14.1]`:** a room now scrolls past roughly
214px of battlefield to reach the picker rows, and at 1366x768 the 200px window
holds the two side headings, the survivor readings and the first row of shapes
with the action buttons below the fold of the scroller. That ordering is the
addendum's own — `[SIDE]` → battlefield → resources → picker — so it is recorded
as a playtest question rather than settled by turning a dial.

## The eleven new rows

| row | what it holds |
|---|---|
| 106 | both clusters, one shape per unit counted against the FIGHT roster; a mid-fight `addUnit` moves the build and NOT the cluster, and the next start draws it; the roster-signature rebuild driven through a unit-scoped type created mid-fight |
| 106b | the shape draws the fight's `hp` while the board's row draws the build's `maxHp`, both read in ONE drive — check 102's clause from the other end |
| 106c | a type created, restyled and renamed through the REAL ops reads back with the authored shape suffix, colour suffix, glyph and name, and the label carries the exemption channel (0 harvest hits on the renamed word) |
| 106d | compaction is `App.render.COMPACT_AT` off the live export, read as a node count AND as rendered words |
| 106e | ruled dead stays drawn and is marked four ways; zero health nobody ruled draws as standing; ruled and ruled back returns |
| 106f | the lit set compared against the opposing ROSTER as a set, empty at every other moment, said in two non-colour channels, nothing lit disabled |
| 106g | 104d and 104e's claim on the REAL control instead of plan 05-14's stub |
| 106h | no key collides with the battlefield painted; the 12 battlefield keys counted against both rosters (148 keys on the page) |
| 106i | nothing on the battlefield is disabled — three boards, whole set compared both ways |
| 106j | **node identity under a delta** — probe BA's finding, added rather than deferred |

**They are numbered from 106 and 105 is deliberately left unused.** `[S06.7]`'s
banner says *"check 105 is the numbered row that holds it"* about the
disable-is-a-render-decision property, and that row shipped as **95b**. Taking
105 here would turn a dangling reference into an actively wrong one. The
correction is `[S06.7]`'s and plan 05-16 owns every other fight row's claim, so
it is handed on by name. **Plan 05-16 owes it.**

## The probes — three run, three recorded, three reverted

### PROBE AY — the battlefield drawn from `build[].units[].maxHp`

Reddened **three** rows. 106b named it exactly:

```
106b: the shape's health row 6 -> 6 | the board's health row 6 -> 6
      | the ALLOCATION 6 -> 6 | the fight's live health is now 4
106d: at 11 the row draws 3 tokens: "Health" | at 12 it draws 3 token: "Health"
      with the count node reading "(none)"
106e: c2 at zero health that nobody ruled={"drawn":true,"marked":false,
      "markerTokens":0,"says":[],"hp":3,"flag":true}
```

The fight's health moved to 4 and the surface kept printing 6, which is a
student's damage appearing not to land.

### PROBE AZ — the dead treatment drawn from `hp === 0`

Reddened **106e in both directions**, which is the shape the row was written
for:

```
c2 at zero health that nobody ruled={"drawn":true,"marked":true,"markerTokens":1,
  "says":["Still on the roster, ruled dead."],"hp":0,"flag":true}
| c1 at full health that a student ruled={"drawn":true,"marked":false,
  "markerTokens":0,"says":[],"hp":3,"flag":false,"disabled":false}
```

The tool ruling a unit dead nobody ruled, and ignoring a ruling a student made.

### PROBE BA — the unit shape's tokens built in a loop instead of through `syncRow`

Compaction was kept so that only RULES 2 and 3 were violated. Measured in real
Chrome, one hand ruling of one point:

| | shipped | the loop |
|---|---|---|
| nodes of 3 replaced on a −1 | **0** | **3** |
| nodes replaced on the +1 back | **0** | **2** |
| tokens playing the entry pop after +1 | **1** | **3** |
| the board's own row (control) | 0 | 0 |

**The suite went 178 of 179 and that near-green is the finding.** The one row
that reddened was 106c, and it reddened for the WRONG reason: it compares the
token's whole `className` and the loop's tokens carry the entry-pop class, so
what it caught was an animation flag rather than a replacement. Every row that
counts tokens was spotless, because a count cannot tell three surviving nodes
from three new ones.

**So the row was ADDED rather than deferred** (commit `8785739`). 106j tags every
token, drives the health down by one and requires every remaining node to be the
same object, then drives it back up and requires exactly one new node and exactly
one playing the entry pop. The re-probe named it:

```
106j: the row held 3 tokens for a unit at 3 health
      | after -1 it holds 2 of which 0 are the SAME objects (replaced=2)
      | after +1 it holds 3 of which 0 are the same objects and 3 are new
      | tokens playing the entry pop=3
```

What the loop costs, in the artifact's own terms: on a nine-health unit it plays
nine pops for one point of damage, and the one pop a student is meant to read is
lost among eight the tool invented.

**Every probe was applied after a commit, reverted from a scratchpad `cp`
snapshot rather than `git checkout --`, and `git status --short` printed empty
after each.**

## The browser, driven end to end

Real Chrome and real Edge, 1920x1080 and 1366x768. Page errors and console
errors `[]` in every run.

```
armed by a real click on Change target:
  litCats=0  litMechs=3  rosterMechs=3  pickWordsVisible=3
  pickWord="Pick this one."  outline="solid 2px"  anyDisabledOnField=0
completed by a real click on the last mechs shape:
  decl=[{"side":"cats","act":"slash","by":"c1","at":"m3"}]
  lands="Lands on Mech 3."  lit=0  pickWordsVisible=0
a unit ruled dead, by a real click on the board's alive toggle:
  class="bf-unit bf-unit--dead"  deadTokens=1  hpTokens=2  disabled=false
  text="Mech 1 / Health / Shield / Dead marker / 💀 /
        Still on the roster, ruled dead."
```

Identical in both browsers at both viewports.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 3 - Blocking] `[S07.5]`'s `pressAt` gained one call — the lit half
had no repaint trigger at all**

- **Found during:** Task 1, in a real browser. The suite was green and the
  battlefield never lit.
- **Issue:** `pressAt` is PAGE WORK and dispatches nothing, so no commit lands,
  no frame is scheduled and `SYNC_HOOKS` never runs. The shipped
  `App.render.fightBar(App.state.get())` line exists for exactly that reason and
  paints `[S06.7]` only. `[S06.11]` paints a different region from the same two
  attributes, so without a second call the opposing side's shapes stayed dark
  until some unrelated commit happened to schedule a frame — not a delay but a
  flow with no visible half: the student presses Change target and nothing they
  are meant to click lights up. Measured before the fix: `litMechs=0`.
- **Why it is this file and not another:** the plan forbids `[S07.*]` edits and
  `[S06.1]`–`[S06.10]` edits alike, and the trigger has to live in one of them.
  A handler asking each surface it moved to be painted is `[S07.3]`'s and
  `[S07.4]`'s shipped idiom; a render sub-region calling another render
  sub-region would be a repaint whose trigger is invisible from the press that
  caused it. Plan 05-14 shipped the arm and said in its own banner that the lit
  half was 05-15's, because the region did not exist yet.
- **Fix:** one call plus its paragraph. `git diff` over the rest of `[S07.5]` is
  empty and `.disabled` still prints 0 over the region (check 95b green).
- **Commit:** `ed91b46`

**2. [Rule 1 - Bug] `.fg-side`'s flex basis 340 → 320: the two columns were
stacked, on the shipped artifact**

- **Found during:** Task 1's owed `[C14]` re-measure, in a real browser.
- **Issue:** D-27's headline requirement was silently unmet at every viewport in
  both browsers, on HEAD as well as on this branch. Whole analysis and sweep
  above and at the rule.
- **Fix:** one number, plus the derivation rewritten in `[C14]` and `[C14.1]`.
- **Commit:** `ed91b46`

### Judgement calls the plan left open

**3. `[C14]`, `[C14.1]` and `[C14]`'s 736px paragraph were edited, and the
plan's `<verification>` asks `[C00]`–`[C14.3]` to diff EMPTY except the roster
sentence.** Task 1's own body asks for the opposite in as many words — "write
the table into `[C14.1]` and `[C14]` beside the ones already there" — and plan
05-14 handed the re-measure to this plan BY NAME at the `[C14.1]` site. The task
body was followed. **Every edit outside the roster sentence is a COMMENT except
the one `.fg-side` declaration**, and that declaration is deviation 2. Leaving
05-14's hand-off paragraph standing unamended after honouring it would have been
the banner-that-quietly-lies failure this plan's own objective warns about
twice.

**4. `FIGHT_FLOOR` not moved.** The harvest went 411 → 423 and is recorded; the
floor is 120, is not breached, and belongs to plan 05-16.

**5. Check 105 left unused, and the correction handed to 05-16.** `[S06.7]`'s
banner names a row number this file has never had. Written into 106's own
comment so the next reader meets the reason where the gap is.

## Diffs proved empty by line span

```
[S01] DATA                            705 lines    diff EMPTY  (D-25)
[S02] MODEL                           636 lines    diff EMPTY
[S03] STATE                           371 lines    diff EMPTY
[S04] SERIALIZE                      1353 lines    diff EMPTY
[S05] OPS                            3185 lines    diff EMPTY
[S06.1]-[S06.6]                      3205 lines    diff EMPTY
[S06.7]-[S06.10]                     2863 lines    diff EMPTY
[C00]-[C14] banner head               986 lines    diff EMPTY
[C14.2]                               226 lines    diff EMPTY
[C14.3]                               223 lines    diff EMPTY
[C15] + ALL shell markup             1233 lines    diff EMPTY
[S07.1]-[S07.4]                      2951 lines    diff EMPTY
[S07.6]-[S08]                         465 lines    diff EMPTY
[S07.5]                    615 -> 640 lines    ONE call + its comment
```

No shell markup, no shell id, no `[C15]` rule, no `[C14.2]`/`[C14.3]` rule.

## Threat register outcomes

| Threat | Outcome |
|---|---|
| T-05-73 a caller string interpolated raw into `className` | `makeToken` is CALLED and never re-implemented, so `safeShape`/`safeColor` stay on the path. 106c drives a real restyle to `dia`/`gold` and reads `tok tok--dia tok--gold` back |
| T-05-74 a renamed type reddening CI from this surface | every label node carries `data-lbl`; 106c drives the real rename and reads 0 harvest hits on the student's word |
| T-05-75 the battlefield drawing the BUILD's allocation | `unit.hp` with FIGHT-10 at the site; **probe AY drove it and reddened three rows** |
| T-05-76 the dead treatment from `hp === 0` | the stored flag only, D-00d at the site; **probe AZ drove it and reddened 106e in both directions** |
| T-05-77 a rebuild per frame replaying every token's pop | build-once with a roster fingerprint plus `syncRow`'s delta contract; **probe BA measured the cost, found nothing watched it, and 106j is the answer** |
| T-05-78 an overflow silently unsticking `#strip` | no overflow in `[C14.4]`; every ancestor of `#strip` reports `visible` and `#strip` reports `sticky` in both browsers at both viewports, on both boards |
| T-05-79 a second compaction threshold | `COMPACT_AT` in the render and read off the live export in 106d |
| T-05-80 this region writing the half-made retarget it only reads | stated in the banner; `fgHalfMade` is the only reader called and nothing here writes those attributes. 104c's byte-identical clause and its key walk are untouched and green |
| T-05-SC npm/pip/cargo installs | zero packages installed; Playwright resolved through `PLAYWRIGHT_DIR` |

## Questions for the playtest, recorded rather than settled

1. **Is 12 Tab stops per fight too many?** The unit shape is a control because
   the addendum gives it a job. A keyboard user Tabs through both rosters to
   reach the picker rows. 122 buttons on a 9-and-3 board, up from 110.
2. **Does the battlefield belong above the picker rows inside the scroller?**
   The addendum fixes that order, and it costs a laptop the action buttons
   below the fold of a 200px window.
3. **Do 12px tokens read from the back of a room?** The board's are 22px. This
   is the same rehearsal question `--tok` has carried since Phase 2, now asked
   about a second surface with its own number.
4. **Does "Pick this one." read as an instruction or as a suggestion?** It is
   the only sentence on this surface that tells a student what they may do.
5. **Should a unit shape show its shield and its tallies when they read zero?**
   They are hidden today, which is the board's own rule; on a battlefield an
   absent shield row and a shield of zero look the same.

## Known Stubs

**None.** Every node this plan builds is drawn from live state on every frame,
and the container it fills was the only stub plan 05-14 left.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND; contains `[S06.11]`, `[C14.4]`, `bf-unit`,
  `BF_PICK_SAID`, `bfRosterSig`, `App.render.battlefield`
- `tests/selftest-node.cjs` — FOUND; contains `fg/bf/`, checks `106.` through
  `106j.`
- `.planning/phases/05-fight-loop-playtest/05-15-SUMMARY.md` — FOUND
- commit `ed91b46` — FOUND
- commit `408ed52` — FOUND
- commit `8785739` — FOUND
- `node tests/selftest-node.cjs` exits 0: 1216 passed, 0 failed; 180 of 180
  interaction checks; `node tests/browser-checks.mjs` 22 passed, 0 failed;
  `git status --short` empty after every probe revert
