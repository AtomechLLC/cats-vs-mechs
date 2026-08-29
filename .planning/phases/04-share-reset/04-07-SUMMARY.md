---
phase: 04-share-reset
plan: 07
subsystem: ui-interaction
tags: [dialog, load, refusal-copy, reset-confirmation, undo, acceptance-run, single-file-html, selftest, D-17, D-19, SHARE-02, SHARE-03, SHARE-06]

# Dependency graph
requires:
  - phase: 04-share-reset
    plan: 06
    provides: "[S07.4]'s two delegated listeners, the four seams, dropSaid, and the two stub arms reserved for this plan"
  - phase: 04-share-reset
    plan: 05
    provides: "<dialog id='share'>'s load pane, #sh-load-field, #sh-load-said, <dialog id='reset-ask'> and the first half of the D-19 record"
  - phase: 04-share-reset
    plan: 04
    provides: "App.ops.loadBuildCode — the whole write path a pasted code takes, returning a refusal rather than throwing one"
  - phase: 04-share-reset
    plan: 03
    provides: "[S04.3]'s four refusal tokens and its `what`, proved against seventeen tamper shapes"
provides:
  - "[S07.4]'s load press — the paste field trimmed and read, App.ops.dispatch('loadBuildCode'), and the returned token turned into one of four page-owned sentences"
  - "the four refusal sentences, and data-sh-why on #sh-load-said recording which token produced the one on screen"
  - "[S07.4]'s confirm arm — dispatch('reset') then close, in front of an App.ops.resetToDefaults that is byte-identical"
  - "the second half of the D-19 record: the MECHANISM, beside the code, agreeing with 04-05's ARGUMENT beside the markup"
  - "tests/selftest-node.cjs — checks 91 to 91e, the phase's own acceptance run, and limitations entry 17"
  - "cats-vs-mechs.html [S09.11] — encode -> loadBuildCode -> encode is the same string, twice"
affects: [04-08 the rehearsal, 05 SHARE-07's fight reset]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "the SECOND press shape, named in the code as a shape rather than left to be inferred: dispatch first as always, then READ THE RECORD BACK, because this one op returns a refusal instead of throwing it and a bad paste is an expected outcome of the feature"
    - "a four-entry table of COMPLETE sentences with the one that grows doing its own punctuation, so a later reader cannot 'fix' a half-punctuated entry"
    - "a fall-through to the broadest sentence for a token this file does not know about — an empty line is worse than the wrong sentence, because it cannot be told from a dead button"
    - "a confirmation held ENTIRELY in the page layer because [S05]'s banner forbids the op reading the page; not a flag, not a parameter, not a second entry point"
    - "a per-refusal comparison taken against ONE reading from before the sequence as well as pairwise, because a pairwise chain goes green for every step after the one that broke it"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "the four refusal sentences shipped verbatim as the plan approved them, and the content one appends [S04.3]'s own `what` rather than re-spelling it here: a decoder that learns to refuse something new says so on this surface with no edit in [S07.4]"
  - "a successful load CLEARS the message line and KEEPS the pasted text: blanking the field would blank the evidence of what the student just did, and it is the same D-19 answer [S06.6] already gives that field for the same reason"
  - "the load line is dropped on every press, pane move, keydown and close — the keydown one is the load-specific reason, because a keystroke in the paste field is the one way the text a sentence was about can change without anything being pressed"
  - "the confirm arm dispatches ONCE and does nothing beside it: a second commit in the same frame would fold into the reset under commit()'s 500ms coalescing window and one Ctrl+Z would step back past both"
  - "check 91's board is built through OPS as setup and only the share flow is driven through controls — check 73 already drives the authoring surface, and what this phase is accountable for starts at the topbar Share control"
  - "91b scores DISTINCTNESS over the four sentences and adds a SECOND content refusal with a different `what`, because two content refusals reading the same sentence is the only way to see the `what` being dropped"

patterns-established:
  - "a probe that reddens the right row for the wrong reason is still a finding: PROBE W reddened 91c on the FIRST refusal only, which exposed that the pairwise comparison restarts from whatever the last iteration left behind"

requirements-completed: [SHARE-02, SHARE-03, SHARE-06]

# Metrics
duration: 105min
completed: 2026-08-29
---

# Phase 4 Plan 07: A Classmate's Board, and a Question Before Discarding One — Summary

**A pasted code loads a classmate's board through the op plan 04-04 shipped — leading space, trailing newline and all — each of the four ways a code can be wrong now produces its own sentence with the board left exactly where it was, and Reset asks first in front of an `App.ops.resetToDefaults` that is byte-identical to what it was before this plan.**

## Performance

- **Duration:** ~105 min
- **Tasks:** 3 planned, 4 commits (the fourth hardens a row PROBE W caught passing for three of its five iterations)
- **Files modified:** 2

## Task Commits

| # | Task | Commit | Type |
|---|---|---|---|
| 1 | the load press, and four problems told apart | `b13c2aa` | feat |
| 2 | the confirmation, entirely in front of an op that does not change | `e6e8e98` | feat |
| 3 | the phase's own acceptance run, and four rows that hold it | `bbbf949` | test |
| 3+ | 91c compares each refusal against the board before the sequence (PROBE W) | `35e8249` | test |

## The Four Refusal Sentences, Verbatim

These are what a student reads. All four measured clean against Layer A (16 words, document-wide)
and Layer B (23 words, over 5,582 string literals), and all four read off the page after a **real
Load press** on a real tamper shape, not quoted from the source:

| token | the sentence on screen |
|---|---|
| `shape` | `That doesn't look like a build code.` |
| `version` | `That build code was written by an older version of this file.` |
| `checksum` | `That build code looks incomplete — it may have been cut off when it was copied.` |
| `content` | `That build code names something this board can't show — the roster is out of bounds.` |

**The content one names the offending thing**, and that is proved rather than asserted: a **second**
content refusal with a different `what` reads

```
That build code names something this board can't show — a token type is the wrong shape.
```

Two content refusals reading the *same* sentence would mean the page had dropped the `what` and was
saying only that something was wrong — which is the sentence the other three already cover between
them. That is the clause, and it is why there is a fifth tamper shape in row 91b.

**None of the four says anything about the build.** A code being unreadable is a fact about a string;
the board it describes is a classmate's, is not on screen, and was never read.

**The table in `[S07.4]` holds four COMPLETE sentences** so all four read side by side in one place,
and the content one moves its own full stop to the end of what it grew. Written as a `replace` rather
than by storing that entry half-punctuated, because a table where three entries end in a stop and the
fourth does not is a table a later reader will "fix".

**A fifth token would fall to the shape sentence**, deliberately: an empty line is the one outcome
worse than the wrong sentence, because a student pressing Load and seeing nothing at all cannot tell
a refusal from a dead button.

## The Confirmation Dialog's Rendered Text, Verbatim

Static markup from plan 04-05, unchanged by this plan and now reachable:

```
Reset
Reset to Workshop 16 defaults
This puts both rosters, both action lists and every token type back to the Workshop 16
defaults. One Ctrl+Z brings your board back — but only for the next thirty changes, after
which it is gone. Copy your build code first if you want to keep it.
[Cancel]  [Discard and start over]
```

It says **both** halves — what is discarded and what survives — and the undo sentence says both that
Ctrl+Z brings the board back **and** that it stops being able to. A confirmation that oversold the
escape hatch would be worse than none.

**The harness cannot read this text**, and that is limitations entry 5 rather than a gap this plan
opened: the stub page is a hand-made stand-in and not a parser, so text written directly into the
HTML is empty there. Layer A reads it in the document, which is where it is scanned.

## Measurements Recorded

| Reading | Before | After |
|---|---|---|
| In-file suite | 1049 passed / 0 failed | **1051 passed / 0 failed** (delta **+2**: the two `[S09.11]` round-trip rows) |
| Interaction gate | **141 of 141** | **146 of 146** (delta **+5**: checks 91, 91b, 91c, 91d, 91e) |
| `SUITE_FLOOR` | 1019 | **1019** — unchanged; margin 30 -> **32** |
| Stub-drift shell ids | 96 | **96** — unchanged in both directions; this plan renders no new id |
| Dialog harvest | 145 across 4 roots | **145** across **4** roots — unchanged |
| `DIALOG_FLOOR` | 138 | **138** — unchanged |
| Layer C `#app` | 127 | **127** — unchanged |
| Layer C proposal pane | 60 | **60** — unchanged |
| Layer A words | 16 | **16** |
| Layer B string literals | 5,530 | **5,582** |
| perf gate | 7 ms / 100 commits | **7 ms** (budget 50 ms) |
| no-writer gate | — | 48 exported ops walked, 18 dispatch arms driven of 57 acts tried |
| `grep -ci "counter\|rating\|balanced\|difficulty"` | 0 | **0** |
| `grep -c "verdict\|balanced\|rating\|difficulty"` | 0 | **0** |
| `grep -c "https\?://\|url("` | 0 | **0** |
| `grep -c "eval(\|new Function\|innerHTML\|insertAdjacentHTML\|document.write"` | 0 | **0** |
| `grep -c "<svg\|createElementNS"` | 0 | **0** |
| `grep -c 'style="'` | 0 | **0** |

### The diff, checked rather than promised

`git diff b13c2aa^ -U0 -- cats-vs-mechs.html` is **17 hunks**, and every one of them falls in exactly
two places:

- **11791 to 12560** — inside `[S07.4]`, which ran 11788-12372 before this plan and runs 11788-**12653** after it.
- **19331** — one insertion inside `[S09.11]`.

Region boundaries as the file now stands: `[S04]` 3253-4525, `[S05]` 4540-6510, `[S07]` 9728-,
`[S07.2]` 10323-10815, `[S07.3]` 10855-11786, `[S07.4]` 11788-12653, `[S09]` 13053-.

**Not one line inside `[S04]`, `[S05]`, `[S06.6]`, `[S07.1]`, `[S07.2]` or `[S07.3]` changed.**

### `resetToDefaults` and `#err-reset`, diffed rather than promised

Both readings taken by extracting the function bodies from `b13c2aa^` and from the working tree and
running `diff` over them:

```
resetToDefaults BYTE-IDENTICAL
err-reset HANDLER BYTE-IDENTICAL
```

The only lines in the plan's whole diff that contain either name are **five comment lines** in
`[S07.4]`'s new banner, which name them in order to say they did not change.

## The Acceptance Run's Page-Side Reading

Check 91's detail line, taken from a passing run:

```
page-side values compared=8
| before the copy=[10,4,8,4,3,"Vigor","Momentum","Pounce"]
| after the confirmed reset=[9,"Health","MISSING"]
| after the paste=[10,4,8,4,3,"Vigor","Momentum","Pounce"] identical=true
| code length=122
| said on success="" hidden=true pasted text kept=true
| one undo -> the shipped board=true two undos -> the student's board=true
| error panel hidden=true
```

**Eight values, all off the page:** both faction columns' `.unit-card` counts, `c1`'s health row
length, `c1`'s shield row length, `c1`'s tally row length for a type the student invented, the
renamed built-in's label (`Vigor`, not `Health`), the invented type's label (`Momentum`), and the
authored action's card in the faction column (`Pounce`).

**The middle reading is what makes the third one mean anything.** After the confirmed reset the page
shows nine cards, `Health` and no `Pounce` card — so the board really was discarded, and the paste is
not loading a board that never left.

**The paste carries a leading space and a trailing newline**, which is how a code arrives out of a
chat message. `decode` trims and so does the press; plan 04-03 pinned two rows of its bad-input table
that deliberately ADMIT such a code, and the trim in `[S07.4]` is written down as a *courtesy on top
of a decoder that does not need it* — with an explicit instruction not to remove the decoder's own
handling on the grounds that the page already trims, because the decoder is also reached from
`[S08]`'s boot read and from every suite row, neither of which goes through this field.

The other four rows' passing readings:

```
91b  distinct sentences=4 of 4 | ... | names a different thing=true
     | tokens read off data-sh-why=["shape","version","checksum","content","content"]
91c  board moved on any of the four=[false,false,false,false,false]
     drifted from the board before the sequence=[false,false,false,false,false]
     undo depth moved=[false,false,false,false,false] | rendered board length=674 characters
91d  opened=true closed=true | state before=1ed93g after=1ed93g identical=true
     | undo depth 1 -> 1 | focus back on the opener=true
91e  build === the shipped defaults after confirming=true | undo depth 1 -> 2 delta=1 (cap 30)
     | one undo restores byte for byte=true | state before=1ed93g after the undo=1ed93g
```

**Success criterion 4 — Ctrl+Z after a confirmed reset — is asserted twice**, in two different
registers: 91e reads the depth delta and the byte-identity through the topbar undo control, and 91's
own sequence walks two undos back through the load and the reset in that order.

**The depth readings are only exact because of a `restore()`.** This gate has driven several hundred
commits by the time these rows run, and `App.state`'s stack is hard-capped at `UNDO_LIMIT` (30) — a
delta taken on the saturated live stack reads **0 for a commit that really happened**. That was
measured during task 2 and is written into the harness beside the restore.

## Deliberate-Failure Probes

All four run against **committed** state, readings recorded verbatim, and every probe reverted **from
a file snapshot** — never by `git checkout`. Working tree verified clean after each.

### PROBE W — the load handler writes the board on a refusal

`App.ops.dispatch('reset');` added to the refusal branch of `pressLoad`. Run: **1051 passed / 0
failed; interaction gate 145 of 146.** One row moved, and its reading is the finding:

```
FAIL  interaction gate :: 91c. AND NOT ONE OF THEM MOVED THE BOARD. …
      board moved on any of the four=[true,false,false,false,false] undo depth moved=[true,false,false,false,false] | rendered board length=488 characters | error panel hidden=true
```

**Read the reading.** `[true,false,false,false,false]` — the row reddened, but only on the **first**
refusal, and it was spotlessly green for the four after it over a handler that was wrecking the board
on every single one. The pairwise comparison restarts each iteration from whatever the last one left
behind, so once the board has been moved to the shipped defaults it stays there and every subsequent
comparison is between two identical boards. The undo-depth clause has the same hole for the same
reason: `commit()` coalesces a repeated label inside 500 ms, so resets two through five made no
second entry.

Commit `35e8249` adds one reading taken **before the whole sequence** and compares every refusal
against it as well. Re-run with the hardening in place:

```
FAIL  interaction gate :: 91c. … Each refusal is compared BOTH against the frame before it and
against one reading taken before the whole sequence — PROBE W measured that the pairwise clause alone
goes green for every refusal after the first one that wrecked the board
      board moved on any of the four=[true,false,false,false,false] drifted from the board before the sequence=[true,true,true,true,true] undo depth moved=[true,false,false,false,false] | rendered board length=488 characters | error panel hidden=true
```

**The pairwise clause names WHICH refusal moved it; the new clause is what makes the row red for all
of them.** Both are kept, because the two say different things.

### PROBE X — the cancel control wired to the reset act

`App.ops.dispatch('reset');` added in front of `closeConfirm()` on the `data-rs="cancel"` arm. Run:
**1051 passed / 0 failed; interaction gate 144 of 146.** The intended row reddened, and a second one
went with it:

```
FAIL  interaction gate :: 91d. CANCELLING COSTS NOTHING, and "nothing" is the literal claim … 
      opened=true closed=true | state before=1ed93g after=1jdpo4s identical=false | undo depth 1 -> 2 | focus back on the opener=true
```
```
FAIL  interaction gate :: 91e. CONFIRMING IS EXACTLY ONE UNDO ENTRY … 
      build === the shipped defaults after confirming=true | undo depth 2 -> 2 delta=0 (cap 30) | one undo restores byte for byte=false | state before=1jdpo4s after the undo=1ed93g
```

The second is a knock-on and is worth recording because it shows the coalescing window working from
the other side: the cancel had already reset the board, so the confirm's commit folded into it under
the same label and 91e read `delta=0`. That is precisely the failure the confirm arm's own comment
says it exists to avoid — one Ctrl+Z stepping back past two acts.

### PROBE Y — all four tokens collapsed onto one sentence

`loadWords` made to return `LOAD_SAID.shape` unconditionally, with the `what` clause deleted. Run:
**1051 passed / 0 failed; interaction gate 145 of 146.**

**PROBE Y STAYED RED. Nothing had to be fixed and nothing was wrong with the row.** It asserts
distinctness and not non-emptiness, which is exactly what the plan required it to be checked for:

```
FAIL  interaction gate :: 91b. the four ways a build code can be wrong produce FOUR DIFFERENT
SENTENCES on the page … 
      distinct sentences=1 of 4 | shape="That doesn't look like a build code." | version="That doesn't look like a build code." | checksum="That doesn't look like a build code." | content="That doesn't look like a build code." | a second content refusal="That doesn't look like a build code." names a different thing=false | tokens read off data-sh-why=["shape","version","checksum","content","content"]
```

Note the last two clauses: `data-sh-why` still reads all four tokens correctly. **A row that had
asserted on the token rather than on the sentence would have been green over this.** That is the
reason `data-sh-why` is documented in the code as a diagnosis aid and explicitly not the thing 91b
scores.

### PROBE Z — one authored token type dropped from what the encoder emits

`order.slice(App.data.TOKEN_IDS.length).forEach(function (id, zProbe) { if (zProbe === 0) { return; }`
in `[S04.2]`. Run: **1023 passed, 28 failed; interaction gate 142 of 146.** The acceptance run
reddened **on a page-side value**, which is what the probe was for:

```
FAIL  interaction gate :: 91. PHASE 4'S OWN ACCEPTANCE RUN. …
      page-side values compared=8 | before the copy=[10,4,8,4,3,"Vigor","Momentum","Pounce"] | after the confirmed reset=[9,"Health","MISSING"] | after the paste=[9,3,3,0,-1,"Health","(no label node)","MISSING"] identical=false | code length=97 | said on success="That build code names something this board can't show — no such token type." hidden=false pasted text kept=true | one undo -> the shipped board=false two undos -> the student's board=false | error panel hidden=true
```

Every one of the eight page-side values is wrong, `(no label node)` is the invented type's label
missing from the board entirely, and the code shrank from 122 characters to 97. **The run reads the
board, not the state it was built from.** Twenty-eight `[S09]` rows reddened alongside it, including
the new round-trip pair.

## The `[S09.11]` Rows This Plan Added

```
A CODE LOADED THROUGH THE OP RE-ENCODES TO THE SAME CODE, and so does the code that
produced. encode -> loadBuildCode -> encode is a different claim from encode -> decode: it
runs through buildFromDecoded, which is the step between the record the decoder hands back
and the build the op actually writes, and the only place a field can be lost without either
half of the codec disagreeing with itself. Twice, because a lossy step that settled after
one pass would be a fixed point and would pass a single round
```

Two rows (the claim and a prototype check), **DOM-free**, so they run in the terminal harness and in
the in-file report alike. It is compared as a **string** rather than as a stable writing of the
record on purpose: the code IS the shared unit, and two codes that differ by a byte are two different
things in a course thread however equal the boards behind them may be.

## The New Limitations Entry, Verbatim

```
17. A BUILD CODE GENUINELY CROSSING BETWEEN TWO BROWSERS. Check 91 is
    this phase's acceptance run and it drives the whole feature —
    Copy, a confirmed reset, Load — through real controls, then reads
    eight values back off the page. What it CANNOT do is what entry 16
    explains: there is no clipboard in this runtime, so the code it
    "copies" is read out of #share-code by the test rather than off a
    clipboard, and the code it pastes is written straight onto
    #sh-load-field rather than by a person pressing Ctrl+V.
    WHAT THAT LEAVES UNPROVED, stated plainly. The producing side and
    the consuming side of that trip are the SAME PROCESS, the same
    evaluation of the same file and the same App. So the run proves the
    codec, the ops, the handlers and the rendering all agree with each
    other; it proves nothing about a code surviving a clipboard, a chat
    client's line wrapping, or a second browser's reading of this
    alphabet. That crossing is plan 04-08's rehearsal, item 7, and it
    is the only place in this project it ever happens. Entry 14 makes
    the same distinction for a real reload and a real bookmark.
    One thing the run DOES prove about the crossing, and it is worth
    naming because it is the failure a chat client actually causes: the
    paste it drives carries a leading space and a trailing newline, and
    the board still arrives.
```

## The Two Press Shapes, Named in the File

`[S07.4]` now states, under its own heading, which of two shapes the load press is — because a reader
arriving at a handler that reads a record back will otherwise read it as the file's ordering rule
having been forgotten:

- **The ordinary shape**, which every press in `[S07.1]`, `[S07.2]` and `[S07.3]` takes: dispatch
  first, page work after, so an op that refuses **throws** into `[S08]`'s boundary and the page work
  never runs.
- **This shape**: dispatch first — *still first, the rule is honoured rather than inverted* — and then
  read the record back, because `App.ops.loadBuildCode` is the one op in `[S05]` that returns a
  refusal instead of throwing one, and a bad paste is an expected outcome of the feature rather than a
  defect.

The file's **one genuine ordering inversion** is still the copy press, and it still says so where it
lives.

## Deviations from Plan

### 1. [Rule 2 — a row that went green for four of its five iterations] Check 91c hardened

See **PROBE W** above. One clause added and the reason written beside it. Commit `35e8249`. Not asked
for by the plan; caught by the probe the plan did ask for.

### 2. [judgement — a clause the plan's wording implied but no export supported] 91b's fifth tamper shape

The plan's acceptance asked that "a content refusal's sentence names the offending thing from the
record". The natural clause — compare the rendered sentence against `LOAD_SAID.content` — would have
needed a new export out of `App.interactions` for a check to reach the table. **A second content
refusal with a different `what` proves the same thing with no new export and proves it more
strongly**: a page that dropped the `what` would say the same sentence twice, which is exactly the
state where a student is told a code is wrong and nothing about how.

### 3. [Rule 3 — two identifier collisions in a 7,000-line harness] `accShipped` and `accBackCards`

Check 73 already holds both names at file scope. Renamed to `accDefaults` and `accWalkedCards`.
Recorded only because it is the shape of failure a single-file harness produces — a `SyntaxError` at
load with no run at all — and the next plan adding rows to the tail of this file will meet it again.

### 4. [judgement — the `what` clause's punctuation] The content sentence's full stop moves

The plan's approved string ends in a full stop and the record's `what` is appended after an em dash,
which produced `…can't show. — the roster is out of bounds.` on the first driven run. The table entry
is kept as a complete sentence and `loadWords` moves the stop, with the reason written down: a table
where three entries end in a stop and the fourth does not is a table a later reader will "fix".

## Threat Register

| Threat | Mitigation as built | Proved by |
|---|---|---|
| T-04-31 a refused paste that writes anything at all | the op commits nothing on a refusal (04-04) and the handler writes only the message; 91c compares the rendered board and the undo depth per refusal, pairwise **and** against one reading from before the sequence | **PROBE W** — and the probe is also what showed the pairwise half alone was not enough |
| T-04-32 a mis-pressed reset discarding a board with no way back | the confirmation in front of an unchanged op; the op's single-commit shape means one Ctrl+Z restores it, and the dialog says so **and** says when it stops being true | 91e — `delta=1`, `one undo restores byte for byte=true`; and 91's own two-undo walk |
| T-04-33 a cancel that quietly resets anyway | the cancel arm closes the dialog and does nothing else; 91d compares state byte-for-byte and the undo depth | **PROBE X** — `identical=false | undo depth 1 -> 2` |
| T-04-34 four problems collapsed into one message | 91b scores DISTINCTNESS over the four sentences, plus a fifth shape for the `what` | **PROBE Y** — `distinct sentences=1 of 4`, stayed red, nothing to fix |
| T-04-35 decoded build text reaching a markup sink | `textContent` and `.value` only; the `what` reaches `#sh-load-said` through `textContent` | `grep -c "eval(\|new Function\|innerHTML\|insertAdjacentHTML\|document.write"` reads **0** |
| T-04-SC npm/pip/cargo installs | accept | zero packages installed by this phase |

## Known Stubs

**None.** Both of the stubs plan 04-06 reserved for this plan — `data-sh="load"` and
`data-rs="confirm"` — are wired, and `#sh-load-said` now carries the refusal wording 04-05 reserved
it for. `[S07.4]`'s banner is updated in both places so it no longer describes either as a
"claimed and ignored" window.

## Threat Flags

None. No new network endpoint, no auth path, no file access pattern, no schema change. The one new
trust boundary this plan operates — a classmate's pasted string becoming this student's whole build —
was built and proved by plan 04-04, and this plan adds no guard to it and removes none.

## For the Next Plan

- **04-08 (the rehearsal).** Four items land here from this plan and are LOW confidence rather than
  unproven: whether a code produced in one browser pastes and loads identically in another **in both
  directions** (harness limitations entry 17, rehearsal item 7 — the acceptance run reads its code
  out of a field and both browsers are one process); whether the four refusal sentences read as
  **helpful to a person** rather than merely as distinct strings (item 8, and the wording is the thing
  under test); whether the reset control reads as visually apart from the non-destructive controls on
  the actual workshop display; and whether Ctrl+Z after a confirmed reset **feels** like recovery —
  the measured proof exists, the felt behaviour has never been rehearsed.
- **Phase 5 (SHARE-07).** A fight reset that does **not** discard the build. Nothing here builds it
  or reserves a control for it, and `[S07.4]`'s confirm banner says so in as many words so the
  absence is not read as an omission.
- The interaction gate is **146**; the in-file suite is **1051** against `SUITE_FLOOR` **1019**; the
  next free gate check number is **92**; shell ids are **96**; `DIALOG_FLOOR` is **138** against
  **145**.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND
- `tests/selftest-node.cjs` — FOUND
- `.planning/phases/04-share-reset/04-07-SUMMARY.md` — FOUND
- commit `b13c2aa` — FOUND
- commit `e6e8e98` — FOUND
- commit `bbbf949` — FOUND
- commit `35e8249` — FOUND
- `node tests/selftest-node.cjs` exits 0 at 1051 passed / 0 failed — VERIFIED
- interaction gate 146 of 146 — VERIFIED
- stub-drift 96 in both directions; `#app` 127, dialogs 145 across 4 roots, proposal 60 — VERIFIED
- all six greps print 0 — VERIFIED
- `git diff b13c2aa^` over `cats-vs-mechs.html`: 17 hunks, all inside `[S07.4]` or `[S09.11]`; zero
  changed lines inside `[S04]`, `[S05]`, `[S06.6]`, `[S07.1]`, `[S07.2]`, `[S07.3]` — VERIFIED
- `resetToDefaults` and `#err-reset`'s handler byte-identical by `diff` — VERIFIED
- working tree clean after every probe revert — VERIFIED
