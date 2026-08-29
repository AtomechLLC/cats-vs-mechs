---
phase: 05-fight-loop-playtest
plan: 01
subsystem: testing
tags: [proj-06, verdict-gate, layer-c, harvest, regex, floors, selftest]

requires:
  - phase: 03.1-action-authoring
    provides: "the bidirectional DIALOG_ROOTS harvest, openDialogs' invalidate+flush lesson, and the [data-anm] exemption the band's lines carry"
  - phase: 04-share-reset
    provides: "SHARE_FLOOR's precedent for saying out loud that a small floor is a fact about a surface, and PROPOSE_FLOOR's roster-independent derivation"
provides:
  - "eleven measured word-list gaps closed, each carrying its false-positive count in a comment beside it"
  - "a third word list, VERDICT_RENDERED_WORDS, read by Layer C alone"
  - "the relationship verb beat/beats/beaten closed by read-site scope rather than by stem"
  - "SCOPE_IDS, so a Layer C record names the region it came off rather than only the root"
  - "a second Layer C harvest of #app taken with a fight running, and FIGHT_FLOOR derived roster-independently"
  - "harness limitations entry 5's fight-mode clause closed; entries 12 and 13 updated; entries 18 and 19 added"
affects: [05-02, 05-03, 05-04, 05-05, 05-06, 05-07, 05-08, 05-09, 05-10, 05-11]

tech-stack:
  added: []
  patterns:
    - "three-layer word placement: try Layer A, then B, then C, and place a word in the highest layer whose measured hit count over the artifact is zero"
    - "a guard scoped by WHERE a string was read, never by what it says"
    - "a floor set at the roster-independent part of a measurement rather than below the total"

key-files:
  created: []
  modified:
    - tests/selftest-node.cjs

key-decisions:
  - "lose/lost/best go in a THIRD list read by Layer C alone, because their only false positives are in-file selftest check labels — the artifact was not reworded to make a pattern fit"
  - "victor and triumph are the only two words added to Layer A, because they name an outcome the way winner and loser do; the other eleven are comparatives and follow better/weak/dominat into Layer B"
  - "the relationship verb rides in check 48 rather than a row of its own, so this task added no check number"
  - "check 92 carries the fight harvest's floor, its verdict scan and the board-identity reading in one row, because a scan of an unpainted page is a clean scan of nothing"
  - "FIGHT_FLOOR is 41 — the roster-independent part of a 101-string measurement — not a number picked below the total"
  - "the eight mechanically-clean-but-unshippable words are documented as limitation 18 rather than silently widened into the lists"

patterns-established:
  - "SCOPE_IDS: a harvested record names the region that painted it, so a check can assert on the read-site"
  - "a probe that stays green means the row asserts nothing — probe B2 and probe C's second half were both run for exactly that reason"

requirements-completed: []

duration: 95min
completed: 2026-08-29
---

# Phase 05 Plan 01: Point the Gate at the Fight Summary

**The verdict gate learned to read a page with a fight running, and eleven of the nineteen words a fight phase would reach for first stopped being shippable — before a single line of this phase's copy exists.**

## Performance

- **Duration:** ~95 min
- **Tasks:** 2 of 2
- **Files modified:** 1 (`tests/selftest-node.cjs`). `cats-vs-mechs.html` is untouched — no artifact comment had to be reworded.

## The gate, before and after

| | before | after |
|---|---|---|
| suite | 1051 passed, 0 failed | **1051 passed, 0 failed** |
| interaction gate | 146 of 146 | **147 of 147** (check 92) |
| stub-drift | 96 shell ids | 96 shell ids |
| Layer A | 16 words | **18 words** |
| Layer B | 5582 literals, 23 words | 5582 literals, **27 words** |
| Layer C word list | 39 words | **48 words** |
| `#app` (setup) | 127, floor 117 | 127, floor 117 |
| `#app` (fight) | *did not exist* | **101, floor 41** |
| dialogs | 145 across 4 roots, floor 138 | 145 across 4 roots, floor 138 |
| proposal pane | 60, floor 23 | 60, floor 23 |

Every number the plan required to be unchanged is unchanged.

## Task 1 — the candidate-pattern hit-count table

Measured 2026-08-29 over the whole of `cats-vs-mechs.html` (**doc**) and over the 5582 string
literals Layer B extracts from its script block (**lit**), using the gate's own `STRING_LITERAL`
extractor. Zeroes included, as required.

| candidate | spelling | doc | lit | placed | why |
|---|---|---|---|---|---|
| won | `\bwon\b` | 0 | 0 | Layer B | whole word, not a stem: `wonder` is ordinary English |
| win / wins / winning | `\bwin(s\|ning)?\b` | 2 | 0 | Layer B | widened from two entries, `\bwins\b` + `\bwin\b` |
| lose / loses / losing | `\blos(e\|es\|ing)\b` | 13 | **2** | Layer C only | the 2 are in-file check labels — see below |
| lost | `\blost\b` | 5 | **1** | Layer C only | the 1 is an in-file check label |
| defeat | `/defeat/` | 4 | 0 | Layer B | doc hits at 3440, 3591, 6645, 8008, all prose |
| victor | `/victor/` | 0 | 0 | **Layer A** | names an outcome the way `winner` does |
| triumph | `/triumph/` | 0 | 0 | **Layer A** | same |
| outlast | `/outlast/` | 0 | 0 | Layer B | |
| dominant | `/domina[nt]/` | 0 | 0 | Layer B | widened from `/dominat/`, which missed `dominan-t` |
| best | `\bbest\b` | 4 | **2** | Layer C only | the 2 are in-file check labels |
| leads | `\bleads?\b` | 3 | 0 | Layer B | widened from `\blead\b`; doc hits 982, 987, 1604 |
| harder | `\bharder\b` | 1 | 0 | Layer B | doc hit at 571 |
| easier | `\beasier\b` | 0 | 0 | Layer B | |
| beat / beats / beaten | `\bbeat(s\|en)?\b` | **44** | **21** | **neither — scoped** | the artifact's own reference material |

### Candidates declined in the spelling they were asked for, with their hit lists

| spelling | doc | lit | declined because |
|---|---|---|---|
| `/los/` | 221 | 23 | catches `close`, `closest`, `lossless` |
| `/best/` | 29 | 2 | catches `bestPair` and `bestDamage`, shipped `[S02]` identifiers |
| `/beat/` | 44 | 21 | the band's own approved copy |

### The three that could not go in Layer B, and why the artifact was not reworded

The plan's rule was: narrow, or decline and record — *"do not reword the artifact to make a pattern
fit unless the wording is itself wrong."* All five blocking literals turned out to be **in-file
selftest check-label prose**, and none of them is wrong:

- `'and the columns rebuilt their cards rather than losing them'` — `cats-vs-mechs.html:16608`
- `'THAT GOES RED, instead of every shared build quietly losing the value inside a '` — `:19275`
- `'writes, and the only place a field can be lost without either half of the '` — `:19358`
- `'cats best damage'` — `:13454`
- `'mechs best damage'` — `:13455` (both naming `App.model.bestDamage`)

Narrowing costs `losing`, which is the single likeliest spelling a fight surface would reach for,
and there is **no narrowing available at all** for `best` or `lost` — they are already whole words.
Declining outright leaves *"Cats lost"*, *"Mechs are losing"* and *"the best build"* shippable.

So a **third list**, `VERDICT_RENDERED_WORDS`, read by Layer C and by nothing else. This is not a
new idea: it is the same split the file already invented when it moved `score`, `grade` and
`better` out of Layer A, taken one notch further. Layer A's rule is *a comment may not*; Layer B's
is *a comment may, a literal may not*; this one is *a dev-only check label may, the rendered page
may not*. What it gives up is stated in the comment beside it, and the placement rule for the next
plan is written there too: **try A, then B, then C, and take the highest layer that measures zero.**

**No line of `cats-vs-mechs.html` was changed by this plan.**

### The relationship verb, closed by scope

`beat` / `beats` / `beaten` cannot go on any list: `[S06.4]` renders *"Fly beats Slash"* and
*"Lasers beat Hairball"* under a heading reading *"What beats what"*. A stem ban reddens the shipped
board (44 doc hits, 21 literal hits).

The guard scans the Layer C harvest for a whole-word `beat`/`beats`/`beaten` and requires every hit
to have been **read from `#refband`**. The allowed set is derived from the read-site, never from the
text — a text allowlist would be a list of the sentences somebody thought of, and it would go green
the moment a student renamed an action, which they have been able to do since phase 3.1.

It rides in **check 48** rather than a row of its own, so Task 1 added no check number.

Making that work needed `SCOPE_IDS`: before this plan every string under `#app` was recorded as
`'#app'`, so the harvest's claim that *"a hit names the surface it came off"* was true only at
dialog granularity. A node whose id is in `SCOPE_IDS` now switches the label for its subtree.
`['refband', 'strip']`. This changes no floor — the harvest's length is untouched by which label a
record carries.

## Task 2 — Layer C reads a fight

`check 92` takes a **second** harvest of `#app` after driving the real `A.ops.startFight()`, then
`A.state.invalidate(); A.state.flush();` — openDialogs' recorded lesson, asking for a frame rather
than hoping one is due. It scans through the same `verdictHitsIn` and `relationshipHitsIn` and the
same 48-word list. `A.ops.endFight()` follows, and the board-identity reading is taken **before** the
`restore()`, because `endFight()` is the op that owes it.

### `FIGHT_FLOOR` = 41, and the arithmetic that chose it

Four readings, all taken this session:

| reading | value |
|---|---|
| shipped 9-and-3 board, fight running | **101** |
| shipped 9-and-3 board, setup | 127 |
| adding three Mechs one at a time, in fight | 101 → 106 → 111 → 116 |
| one unit a side, fight running | **51** |
| one unit a side, setup | 57 |

- A unit card is worth **exactly 5** in fight mode (7 in setup — the 2 that leave are the Remove button).
- 12 cards therefore carry 60 of the 101, and **41 move with no roster at all**.
- Checked rather than assumed: 41 + 2×5 = **51**, and 51 is what the shrunk board measured.
- The same arithmetic reproduces setup exactly: 127 − 12×7 = 43, and 43 + 2×7 = **57**, measured.
  The 41 and the 43 differ by the two Add buttons and nothing else.
- 127 − 101 = 26 = 12 Remove buttons at 2 strings each, plus one Add button per side.

The floor is set **at** 41, in `PROPOSE_FLOOR`'s manner, not below the total. The comparison is
strictly greater than, so 41 is the exact reading of a fight page whose two columns went dark —
that trips it — while the smallest board the file can produce clears it by two whole unit cards.

It is small **today** because none of this phase's fight surface exists yet, and that is said out
loud in the comment in `SHARE_FLOOR`'s register. **05-07, 05-08 and 05-09 are named in the comment
as owing a re-measure**, moved by the roster-independent part alone.

## Probes: run, recorded verbatim, reverted

Every probe was run **after** its task was committed, and reverted from a file snapshot in the
scratchpad. `git checkout -- cats-vs-mechs.html` was never used.

### PROBE A — three verdict strings into `[S06.4]`'s band

All three aborted the run at Layer B, before anything else executed:

```
PROJ-06 VIOLATION: a comparative word reached a rendered string, not a comment (1):
  These words are allowed in prose about the rule and nowhere else.
  [won]: 'Cats won this round'
```
```
  [dominant/dominate stem]: 'the Mechs are dominant'
```
```
  [lead/leads]: 'Cats lead by two'
```

### PROBE A2 — the three Layer-C-only words (added, because their placement is this plan's own deviation)

A pattern that sits in a weaker layer has to be shown to still fire. All three reddened check 48,
`node` exit 1:

- `'Cats lost the fight'` → FAIL 48
- `'the best build so far'` → FAIL 48
- `'Mechs are losing'` → FAIL 48

### PROBE B — `'Cats beat Mechs'` into `#strip`

First run reddened correctly but reported the hit as `(read from #app)` — true of a third of the
page and useless as a diagnosis. **That is a real defect the probe found**, and `#strip` was added
to `SCOPE_IDS` for it. Re-run:

```
FAIL  interaction gate :: 48. PROJ-06 — nothing on the rendered page judges a build ...
      [relationship verb outside #refband] in "Cats beat Mechs" (read from #strip)
```

Exactly **one** hit in the run. The shipped band survived untouched in the same run — so the guard
is scoped, not a stem ban with extra steps.

### PROBE B2 — is the `#refband` allowance load-bearing?

Emptied `SCOPE_IDS` and re-ran the clean artifact. The row went red with exactly one hit:

```
      [relationship verb outside #refband] in "What beats what" (read from #app)
```

**And the hit is not the one a reader expects.** It is the band's *heading*. The band's relationship
lines — *"Fly beats Slash"*, *"Lasers beat Hairball"* — carry `[data-anm]` and are skipped for text
by the walk, because they are sentences assembled out of names a student can rename. So Layer C has
**never once read** the string this guard is popularly understood to be protecting. The allowance is
exercised today by the heading alone. That is now written into the comment beside the guard so
nobody reads it as protecting a string the gate cannot see.

### PROBE C — a fight-only verdict

`'Mechs are ' + 'winn' + 'ing'` rendered into `buildColumn`'s `!setup` branch (concatenated so it
reaches Layer C rather than aborting at Layer B, which is the point of the probe):

```
FAIL  interaction gate :: 92. Layer C reads the page a SECOND time, with a fight actually running ...
      [win/wins/winning] in "Mechs are winning" (read from #app) | ... | harvested 103 strings from
      #app with a fight running (floor 41); board after endFight is byte-identical to the board
      before startFight
```

Check 48 stayed **PASS** in the same run, which proves the string was genuinely fight-only and that
the second harvest is reading something the first cannot.

### PROBE C, second half — the flush removed

`A.state.flush()` deleted from the new harvest, same probe still in place:

```
PASS  interaction gate :: 92. Layer C reads the page a SECOND time ...
scan: 127 rendered strings read from #app WITH A FIGHT RUNNING (Layer C, floor 41)
```

**Green, with a verdict on screen, reading 127 — the setup count.** The walk read the setup page and
called it a fight page. This is the failure `openDialogs`' call-site comment describes, reproduced
exactly, and it is the reading that proves the `invalidate; flush` pair is load-bearing rather than
ceremonial. Both restored.

(Row 62 also failed in this run, because probe C's injected node carries `.brd-add` in fight mode.
Probe noise, and confirmation the injection was real.)

### PROBE D — `FIGHT_FLOOR` one above the measured count

Set to 102 against the measured 101:

```
FAIL  interaction gate :: 92. ...
      harvested 101 strings from #app with a fight running (floor 102); board after endFight is
      byte-identical to the board before startFight
```

The floor reddens and names the shortfall. It asserts something.

## Harness limitations entry 5 — old and new

**Old:**

> 5. Any words Layer C's page does not currently show. The walk reads `#app` as the stub page renders
> it in setup mode, so a string that appears only once the fight has started is outside its reach
> until that surface is built and the walk is pointed at it. The dialog half of this entry was closed
> by plan 03.1-01 — see 12 and 13 below for what remains of it. The same goes for the static markup
> of the shell: the stub is a hand-made stand-in and not a parser, so text written directly into the
> HTML is empty here and only the text the artifact renders is read. Layers A and B still read all of
> those in the source; it is only the assembled-at-render case that waits.

**New:** the fight-mode clause is closed and the closure is legible rather than merely absent — the
old sentence is quoted inside the entry, followed by *"The walk is now pointed at it."* naming row
92, the real `startFight()` drive, and 05-07/05-08/05-09 as the plans whose copy is now inside the
gate's reach before it exists. The static-markup half is kept and marked as what still stands, with
a pointer to entry 13 for copy that is never painted in any driven state.

**Entry 12** records that plan 05-01 adds no dialog and phase 5 adds none — a fact rather than an
omission; the entry still stands for four roots, and the phase's surfaces are regions inside `#app`,
which is why what it needed was a second page state and not a fifth root.

**Entry 13** gains the fight page as its second and more consequential instance: row 92 reads every
word the fight page paints **on arrival** and nothing a student must act to reveal — a declaration
row nobody opened paints nothing, a ledger with no rounds has no rows, a shield split that appears
only once damage lands is not there to read. **05-10 is named as owing the rest.**

**Entry 18 (new)** — the eight mechanically-clean-but-unshippable words: `contested`, `one-sided`,
`blowout`, `lopsided`, `even`, `close`, `tight`, `behind`. Measured and deliberately not added
(`\bclose\b` 77 doc / 16 lit; `\bbehind\b` 50 / 13; `\beven\b` 15 / 4). Named as a **fifth kind of
unreachable** — a thing no mechanism in the file can decide — and handed to 05-11 as item 31.

**Entry 19 (new)** — camelCase evades every word-boundary rule in all three layers. `winsBy`,
`leadBy`, `edgeOf` pass. Reported, not exploited, not widened.

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 2 — missing critical functionality] Three candidates had no zero-false-positive home in Layer B**

- **Found during:** Task 1, at the measurement step
- **Issue:** `lose/loses/losing`, `lost` and `best` measured 2, 1 and 2 literal hits. The plan's method offers narrow-or-decline; narrowing removes `losing` and is impossible for the other two, and declining leaves the phase's three likeliest verdicts shippable.
- **Fix:** a third list, `VERDICT_RENDERED_WORDS`, read by Layer C alone — the same split the file already made twice, with its give-up clause and a placement rule written beside it. Probe A2 was added to prove the weaker placement still fires.
- **Files modified:** `tests/selftest-node.cjs`
- **Commit:** `783e40d`

**2. [Rule 1 — bug] A relationship-verb hit named `#app`, not the region that painted it**

- **Found during:** probe B
- **Issue:** the harvest's own comment claims a hit "names the surface it came off". It named the root. The plan's acceptance required `#strip` to be named and it was not.
- **Fix:** `SCOPE_IDS`, and `strip` added to it. Probe B re-run confirms.
- **Files modified:** `tests/selftest-node.cjs`
- **Commit:** `09bd561`

**3. [Rule 1 — bug] `FIGHT_FLOOR`'s arithmetic was drafted before it was measured**

- **Found during:** Task 2
- **Issue:** the first draft of the comment carried a guessed 111/6-per-card model. The measurement is 101/5-per-card.
- **Fix:** measured four readings, checked the model against a shrunk board, rewrote the comment with the real arithmetic, and set the floor at the roster-independent 41.
- **Commit:** `7f64850`

### Declined by design

The **eight** clean-but-unshippable words were **not** silently widened into the lists. They are
documented as limitation 18 with the measurements that say what a widening would cost, and handed
to 05-11 as item 31. The **camelCase** hole was reported as limitation 19, not closed.

### Documentation corrections

Two forward references written during Task 1 pointed at limitations entries 14 and 15, which were
already taken. Corrected to 18 and 19 in Task 2's commit. One reference to the proposal pane's row
was corrected from "72" to "71e" against the live label.

## Verification

- `node tests/selftest-node.cjs` exits **0**: 1051 passed, 0 failed, interaction gate **147 of 147**.
- `grep -ci "counter\|rating\|balanced\|difficulty" cats-vs-mechs.html` → **0**
- `grep -c "verdict\|balanced\|rating\|difficulty" cats-vs-mechs.html` → **0**
- `git diff` over `cats-vs-mechs.html` is **empty**. No comment reword was needed.
- Probes A, A2, B, B2, C, C-second-half and D each run, recorded above, and reverted from snapshot.

## Known Stubs

None. This plan renders nothing and ships no page surface.

## For the plans that follow

- **05-07, 05-08, 05-09:** you are the named owners of `FIGHT_FLOOR`. Re-measure and move it by the
  roster-independent part alone. A floor left at 41 when the fight surface arrives has quietly
  stopped bounding anything.
- **05-10:** limitation 13 names you as owing the driven-round half — the copy a fight page paints
  only after a student has acted inside it.
- **05-11:** limitation 18 is item 31 on your list. Eight words that no regular expression will ever
  settle.
- **Everyone:** the placement rule is written beside the three lists. Try Layer A, then B, then C,
  and take the highest layer that measures **zero** over `cats-vs-mechs.html`. A word placed lower
  than it had to be is coverage given away for nothing.

## Self-Check: PASSED
