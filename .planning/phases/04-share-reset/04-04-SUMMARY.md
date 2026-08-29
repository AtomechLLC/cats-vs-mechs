---
phase: 04-share-reset
plan: 04
subsystem: serialization
tags: [hash-mirror, boot-load, undo-contract, replaceState, single-file-html, selftest]

# Dependency graph
requires:
  - phase: 04-share-reset
    plan: 03
    provides: "[S04.3] decode and its four refusal tokens, proved over 17 tamper shapes; the record-not-an-exception contract"
  - phase: 04-share-reset
    plan: 02
    provides: "[S04.2] encode — the build slice to a code string"
  - phase: 04-share-reset
    plan: 01
    provides: "[S04.1] primitives, [S01] CODE_HASH_KEY and the comma-free alphabet"
provides:
  - "[S04.4] scheduleUrlSync — debounced, token-preserving, survivable, and its swallowed-failure tally"
  - "[S04.4] codeInHash — the file's SECOND hash reader, called by [S08] at boot and nowhere else"
  - "[S04.4] flushUrlSync — the manual flush that lets a gate drive the mirror without becoming asynchronous"
  - "[S03] commitInitial — the second documented writer outside [S05], guarded to run once and only before any commit (D-20)"
  - "[S05] loadBuildCode — the student's paste, one undoable commit, returning the four-token record rather than throwing"
  - "[S05] loadBuildCodeAtBoot — the same rebuild through the boot writer, deliberately not dispatchable"
  - "[S05] buildFromDecoded — one rebuild both ops run, field by field and key by key all the way down"
  - "[S08] start()'s hash step and linkRefusal, non-terminal on a refused link"
  - "tests/selftest-node.cjs — a history stub, a SECOND stub page booted from a prepared hash, checks 75-82b"
affects: [04-05 the share surface, 04-06 the reset surface, 04-07 the refusal message, 04-08 the rehearsal]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "the mirror is DRIVEN and read back off location.hash, never grepped for — a row that searched [S04.4] for an assignment would be asserting a spelling, not a behaviour"
    - "a manual flush beside a debounce, the shape [S03].flush() already uses, so a synchronous gate can read an asynchronous convenience"
    - "a swallow that TALLIES: the tally is exported and a row asserts it is zero, which is the difference between failing quietly and failing invisibly"
    - "a second stub page and a second script evaluation, because boot happens once per load and the thing under test is what start() does on the way UP"
    - "a guard whose refusal is a THROW rather than a false, so a caller arriving too late is a red run rather than a silent second entry point"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "the mirror reads App.state.get().build INSIDE the scheduled callback rather than taking it as an argument, because the debounce shape the plan prescribes means the build that must be written is the one live when the frame arrives — [S04]'s banner claim 3 is amended to name the exception rather than let it happen quietly"
  - "an unencodable build DROPS the hash token rather than leaving the last good code behind, so a reload can never bring back a stale board"
  - "PROBE Q reddened NOTHING: the boot step's placement above the first paint is held by a comment and by nothing else, which is now limitations entry 15 and a rehearsal item"
  - "the boot step sits above ensurePanelButtons' successors and therefore above anything that commits, which is what makes commitInitial's guard satisfiable at exactly one call site"

patterns-established:
  - "the coexistence row is asserted from BOTH ends — probe L kills the flag half and probe M kills the code half, so neither half can carry the row alone"
  - "a rendered reading has to know the render's own thresholds: a health of 12 draws as a COMPACT count and one token, so the row reads 8 and the reason is written beside it"

requirements-completed: [SHARE-02, SHARE-05]

# Metrics
duration: 105min
completed: 2026-08-28
---

# Phase 4 Plan 04: The Loop Between the Board and the Address Bar — Summary

**Every commit and every undo now reaches the address bar through one debounced, token-preserving `history.replaceState`, and a link carrying a build code opens on that board with an empty undo stack — the second of which took a second named writer in `[S03]`, guarded so tightly that a probe removing the guard is the only way to make it run twice.**

## Performance

- **Duration:** ~105 min
- **Tasks:** 3 planned, 4 commits (the fourth is the suite floor)
- **Files modified:** 2

## Task Commits

| # | Task | Commit | Type |
|---|---|---|---|
| 1 | `[S04.4]` the mirror — debounced, token-preserving, survivable | `2f355aa` | feat |
| 2 | the one write path a pasted code takes, and the writer that leaves no undo entry | `61e4730` | feat |
| 3 | `[S08]` reads a shared link at boot, and a second stub page proves it | `c25e332` | feat |
| 3+ | `SUITE_FLOOR` raised to 1019 against a measured 1049 | `9ae44dd` | chore |

## Measurements Recorded

| Reading | Before | After |
|---|---|---|
| Suite total | 941 → **1032** (plan 04-03) | **1049 passed / 0 failed** (delta **+17**) |
| `SUITE_FLOOR` | 1002 | **1019** (margin 30, the same margin the four plans before it kept) |
| `[S09.11]` rows, terminal harness | 243 | **260** |
| Interaction gate | **118 of 118** | **128 of 128** (delta **+10**) |
| Check 74 — exported ops walked | 46 | **48** |
| Check 74 — dispatch arms driven | 17 of 55 | **18 of 57** |
| Check 74 — action records read | 409 | **425** |
| Stub-drift shell ids | 73 | **73** — unchanged, this plan renders no new id |
| Layer C `#app` | 127 | **127** — unchanged |
| Layer C dialogs | 144 across 2 roots | **144** — unchanged |
| Layer C proposal pane | 60 | **60** — unchanged |
| Layer B string literals scanned | 5,240 | **5,439** |
| Second stub page — parse, evaluate and boot | — | **13-15 ms** per boot, four boots in the run |
| perf gate | 8 ms / 100 commits | **8 ms** — the mirror coalesces to one pending write |
| `grep -ci "counter\|rating\|balanced\|difficulty"` | 0 | **0** |
| `grep -c "verdict\|balanced\|rating\|difficulty"` | 0 | **0** |
| `grep -c "https\?://\|url("` | 0 | **0** |
| `grep -c "eval(\|new Function\|innerHTML\|insertAdjacentHTML\|document.write"` | 0 | **0** |

Section 3 of the harness — no `document`, no `location`, no `history` — still loads the script cleanly and runs all 1,049 rows. `[S09.11]` gained five rows asserting the mirror is **inert rather than broken** in that sandbox: scheduling writes nothing, flushing reports there was nothing to flush, the tally is zero and the reader hands back `null`.

## The Amended Banner Sentences, Verbatim

### `[S00]` — the file's second hash reader, named rather than denied

```
 * The single global. Every section hangs off it.
 * hasFlag() compares whole tokens by exact equality: a link ending
 * #notselftest or #selftestx must not open the developer report.
 *
 * IT IS ONE OF EXACTLY TWO PLACES HASH TEXT IS READ IN THIS FILE. This
 * sentence used to say "the only place", and plan 04-04 amended it in the
 * same change that made it false rather than leaving a banner that quietly
 * lies. The second reader is [S04.4]'s codeInHash(), which takes the token
 * carrying a build code, is called from [S08] at boot, and is called from
 * nowhere else. hasFlag answers "is this exact token present" and cannot
 * answer "what follows this prefix", which is why there are two rather than
 * one; both split the hash on the comma the same way.
 *
 * WHAT STILL HOLDS FOR BOTH OF THEM, and it is the part worth repeating: hash
 * text never reaches a page sink and never reaches a dynamic code path.
 * [S04.4] hands its token to decode, which hands back a record or a refusal
 * and writes nothing anywhere at all.
```

### `[S03]` — one documented exception became an inventory of two

```
 * There are TWO documented exceptions and this is the inventory of them, each
 * named with the one caller allowed to reach it. They are listed here rather
 * than left for a reader to discover, because a banner that quietly lies is
 * worse than no banner:
 *   restore(snapshotJson)        — [S09] SELFTEST, so opening the developer
 *                                  report can hand the live board back
 *                                  untouched instead of being a destructive
 *                                  act. It CLEARS the undo stack.
 *   commitInitial(label, mutator) — [S08] BOOT, and only before anything has
 *                                  been committed, so a build carried in on a
 *                                  link is the STARTING state (D-20). It
 *                                  pushes NOTHING onto the undo stack and it
 *                                  refuses to run at all once the board has
 *                                  moved, which is a boundary no student press
 *                                  can reach.
 * Neither is dispatchable and neither is reachable from a press.
```

`[S05]`'s banner was amended in the same change so the two inventories agree:

```
 * (App.state.restore() and App.state.commitInitial() are the two non-op
 * writers in the file. restore() is reachable only from [S09] SELFTEST;
 * commitInitial() is reachable only from [S08] BOOT and only before anything
 * has been committed. Both are named in the [S03] banner with their callers.)
```

## The Measured Undo Depths

| Event | Undo depth | Where it is asserted |
|---|---|---|
| Boot from a link carrying a valid code | **0** | gate check 80, on the second stub page |
| Ctrl+Z immediately after that boot | **0** — `undo()` returns `false` at the bottom of the stack | gate check 80 |
| Boot from a link carrying a damaged code | **0** | gate check 81 |
| A student's paste of a valid code | **+1**, and one Ctrl+Z restores the previous board byte-for-byte | `[S09.11]` |
| A paste refused for `shape`, `version`, `checksum` or `content` | **+0**, state byte-identical, no `build` key on the record | `[S09.11]`, four rows |
| Two valid pastes inside `COALESCE_MS` (500 ms) | **+2**, not +1 | `[S09.11]` |

## The Panel Message a Damaged Link Produces, Verbatim

Title:

```
Build code in the link
```

Message:

```
The build code in that link did not arrive intact: it looks cut short or mistyped, and nothing was loaded from it — the last good state is still on screen.
```

The trailing clause is the error boundary's own and is what marks the failure as **non-terminal**: `Dismiss and continue` stays visible (`dismiss.hidden === false`) and the shipped nine-and-three board is on the page behind the panel. A terminal failure would hide Dismiss and tell the student to reload, which for a bad link means reloading the same bad link.

## Deliberate-Failure Probes

All six were run against committed state, their readings recorded, and every one reverted **from a file snapshot** — never by `git checkout`. Working tree verified clean after each.

### PROBE L — the mirror writes the whole hash instead of replacing only its own token

`writeHash` reduced to `kept = [HASH_MARK + code]`. Run: **1037 passed, 0 failed; interaction gate 122 of 123.**

```
FAIL  interaction gate :: 78. #selftest SURVIVES A STEPPER PRESS. …
      hash="#b=v1~NTmV3IHR5cGU~VC2.3.6.0.1.0~A9~3~4!0-8*3!0~9*~~~~B3~5~3*6!3~3*~~~~5r5f"
      hasFlag(selftest)=false decoded=ok
```

**Exactly one row moved, and the detail line is the reason it is not vacuous.** `decoded=ok` — the build code half was perfect. Only `hasFlag(selftest)=false` moved. A student's first stepper press had wiped the developer report out of the hash while writing a completely correct code beside nothing.

### PROBE M — the scheduled sync body throws

`writeHash(encode(...))` replaced with `throw new Error('PROBE M: …')`. Run: **1037 passed, 0 failed; interaction gate 119 of 123.**

```
FAIL  interaction gate :: 75b. and nothing was swallowed getting it there. …
      swallowed failures: 1
```
```
FAIL  interaction gate :: 75. a real op reaches the address bar. …
      flushed=true hash="" decoded=the hash carries no build-code token same board=false
```

Three readings worth keeping:

1. **The in-file suite stayed at 1037 passed / 0 failed and every rendering scan was unchanged** — `#app` 127, dialogs 144, stub-drift 73. The frame still landed and no error panel appeared over an ordinary edit, which is what decision 3 of `[S04.4]` promises.
2. **The exported tally moved off zero.** The swallow is quiet and not invisible.
3. Check 77 — the `commitUi` row — stayed **green**, correctly: nothing was scheduled for it, so there was nothing to throw. And check 78 read `hasFlag(selftest)=true` with `decoded=the hash carries no build-code token`, which is the mirror image of probe L. **Between the two probes, both halves of the coexistence row have been blanked independently**, so neither half can carry that row on its own.

### PROBE N — the boot writer's single-use guard removed

`if (commits > 0 || past.length > 0)` replaced with `if (false)`. Run: **1048 passed, 1 failed.**

```
FAIL  build code :: THE BOOT WRITER REFUSES ON ANY BOARD A STUDENT PRESS CAN PRODUCE,
and refuses the same way a second time. …
      actual:   ["it ran","it ran",1... no: 0,true]
      expected: ["refused by its own single-use guard","refused by its own single-use guard",0,true]
```

The exact `actual` was `["it ran","it ran",0,true]`. **Read the last two columns.** The undo depth did not move and the state was byte-identical, because the code being loaded happened to describe the board already on screen — so a row asserting only the state would have been **spotlessly green over a writer that had just run twice**. The `it ran` reading is what carries the claim, which is why the row asserts four things as one equality rather than one thing four times.

### PROBE O — `loadBuildCode` given the same fixed label on every call

`'build code loaded ' + codesLoaded` replaced with `'build code loaded'`. Run: **1048 passed, 1 failed.**

```
FAIL  build code :: TWO VALID PASTES INSIDE THE COALESCING WINDOW ARE TWO UNDO ENTRIES,
not one. The label IS the key commit() coalesces on … The window is 500ms and these two
are well inside it
      actual:   1
      expected: 2
```

One row, by name. Two pastes folded into one undo entry, so one Ctrl+Z would have stepped back past both boards.

### PROBE P — the boot load routed through the ordinary structural commit

`App.state.commitInitial(...)` replaced with `commitStructural(...)`. Run: **1048 passed, 1 failed; interaction gate 126 of 128.**

```
FAIL  interaction gate :: 80. AND THE UNDO STACK AT THAT MOMENT IS EMPTY. This is D-20
asserted rather than asserted ABOUT …
      undo depth after boot=1
```
```
FAIL  build code :: THE BOOT WRITER REFUSES ON ANY BOARD A STUDENT PRESS CAN PRODUCE …
      actual:   ["it ran","it ran",1,true]
      expected: ["refused by its own single-use guard", …, 0, true]
```
```
FAIL  interaction gate :: 82b. AND THE BOOT WRITER CANNOT RUN TWICE …
```

**D-20 reddened by name, on the rendered page, with the depth printed.** Three rows moved and all three are about the same decision from three angles: the depth after a real boot, the guard on a driven board, and the guard on the one page that has legitimately run it.

### PROBE Q — the boot step moved BELOW the first structural invalidate

The whole `attempt('Build code in the link', …)` step relocated to sit after `App.state.invalidate({ structural: true })`. Run: **1049 passed, 0 failed; interaction gate 128 of 128.**

**PROBE Q REDDENED NOTHING. That is recorded as a finding, not as a pass.**

The ordering is held by a comment and by nothing else. Every automated reading in this repo is taken after the frame has flushed, so a load that lands after the first paint produces an identical final page — the difference is entirely in what a person *watches*: the shipped nine-and-three board appearing and then being replaced. No check here can see a flash. It is now **limitations entry 15** in the harness and **rehearsal item** for plan 04-08, and it is why the comment above the step says what it says.

## Deviations from Plan

### 1. [Rule 3 — a section contract that had to be amended rather than broken] The mirror reads `App.state` at one deferred call site

**Found during:** Task 1.

**Issue:** `scheduleUrlSync()` is called from `[S03]` with **no argument**, from two call sites that predate the sub-region having any content, and the plan prescribes the debounce shape `invalidate()` uses — "a pending flag plus one scheduled callback, with later calls while pending doing nothing." Under that shape the build that must be written is the one live when the *frame* arrives, not the one live when the first of three coalesced commits landed. So the write has to read state at flush time. But `[S04]`'s banner claim 3 said, flatly, **"THE SECTION READS App.data AND NOTHING ELSE."**

**Two options were weighed.** Passing the build as an argument from `[S03]` would keep claim 3 literally true, but it changes two call sites the plan treats as given, and it forces every later call to overwrite a captured value — which is a different debounce from the one the plan named and from the one `invalidate()` uses.

**Resolution:** read `App.state.get().build` inside the scheduled callback, and **amend claim 3 to name the exception**, which is what the claim's own last sentence demands ("would have to say so in this banner rather than quietly"). The amendment records the two properties that make it legal rather than a contract quietly edited: it is a **call-site** reference and never a capture during body evaluation — the rule the table of contents states and the rule `[S03]`'s own `cur` comment turns on — and **no other function in the section acquired one**, so `encode`, `decode` and every primitive still take what they need as an argument and are still reachable from a sandbox holding nothing at all. `[S04]`'s `deps:` line now reads `App.data, and App.state at ONE deferred call site — see claim 3`.

### 2. [Rule 2 — a convenience the gate could not otherwise reach] `flushUrlSync` and `syncFailures` are exported

The plan asked for the failure count to be exported. It did not ask for a manual flush, but without one the mirror is unreachable from a synchronous Node gate: the scheduled callback goes through `requestAnimationFrame`, which the stub maps to `setTimeout(fn, 0)`, and the gate runs to `process.exit` without ever turning the event loop. `[S03].flush()` is the shipped precedent and states the reason in as many words; `flushUrlSync` copies both the shape and the idempotence, so the scheduled callback arriving after a manual flush finds nothing due and does nothing.

### 3. [Rule 2 — key boundaries the plan named for one bag and that apply to three] Tally bags go through `requireTokenId` too

The plan named `tokens` as the keyed bag needing `RESERVED_KEYS` before `TOKEN_ID_PATTERN`. A unit's `tally` and a side's `tally` are keyed bags by exactly the same argument — a token id becomes an object key — so `bagFromDecoded` runs every one of their keys through the same gate. Three call sites, one guard.

### 4. [scope — an extra row and an extra check beyond the plan's list] `82b` and the export-list row

The plan asked `[S09.11]` to assert "the boot writer refuses when called a second time". On a board that any suite row has driven, the writer refuses on the **first** call, so `[S09.11]` can only assert refusal-in-general. The genuine second-call case exists on exactly one page in this repo — the second stub page, which has legitimately run it once — so **check 82b** asserts it there. `[S09.11]` also gained a row pinning `App.state`'s export list at **twelve** names, which is the plan's "gained exactly one key" acceptance criterion stated as an equality.

### 5. [measurement — a render threshold the check had to know about] The health row reads 8, not 12

The first draft of check 79 set c1 to twelve health and asserted a twelve-token row. It read **2**. `COMPACT_AT` is 12: at or above it `syncRow` draws a count and a single token instead of one token per point, so twelve is correct and the check was reading the wrong render path. The board on the link now carries **eight**, which is a workshop-plausible figure drawn through the path a workshop board takes, and the reason is written beside it so the next author does not raise it back.

### 6. [Rule 2 — a floor left with forty-seven rows of slack] `SUITE_FLOOR` raised to 1019

Not asked for by the plan. The floor exists to catch rows going **missing** rather than red; at 1002 against a measured 1049 an entire group could vanish silently. Raised to 1019, the same margin of 30 the four plans before it kept.

## Threat Register

| Threat | Mitigation as built | Proved by |
|---|---|---|
| T-04-15 a hostile link loading a board silently at boot | the boot path runs the same `decode` plan 04-03 proved refuses seventeen shapes, plus a **second independent walk** in `buildFromDecoded`; a refusal leaves the shipped board and says so non-terminally | gate check 81 — shipped 9/3 board on screen, panel visible, Dismiss offered, message naming the diagnosis |
| T-04-16 a decoded build assigned wholesale, carrying keys nobody meant to send | field by field, key by key, all the way down; `requireTokenId` (RESERVED_KEYS by name, then the pattern) on every key of all three keyed bags; `requireActionId`, `requireName`, `requireXfWho` and `int()` on the values; one rebuild shared by both ops | `[S09.11]`'s pinned-key-set rows and the paste round-trip rows; the rebuild is the only path either op can take |
| T-04-17 a throw inside the mirror costing the frame or raising the panel | the scheduled body swallows and **counts**; the tally is exported and a row asserts it is zero | **PROBE M** — 1037/0 with every rendering scan unchanged, and the tally moved to 1 |
| T-04-18 the mirror wiping `#selftest` | the write replaces only its own comma-separated token | **PROBE L** — check 78 reddened with `decoded=ok`, so only the flag half died |
| T-04-19 the boot writer becoming a general second `commit` reachable from a press | it refuses unless nothing has been committed and the stack is empty, it has no dispatch arm, and both are driven rows | **PROBE N** (guard) and the `no arm` / `the paste arm loads` row driven through the live router |
| T-04-20 the address bar presented as the way to share | nothing in the UI points at it; `[S04.4]`'s own comment states the prohibition and names the reasons — a home-directory path, a link that opens nothing for the recipient, a chat client that will not linkify it | `grep -c "https\?://\|url("` reads **0**; the share surface is plan 04-05's and offers the code |
| T-04-SC npm/pip/cargo installs | accept | zero packages installed by this phase |

## Known Stubs

None. `App.serialize.scheduleUrlSync` was the last declared no-op in `[S04]` and this plan filled it.

## Threat Flags

None. No new network endpoint, no auth path, no file access pattern. One genuinely new surface exists and is registered above as T-04-15: **a build code arriving from the address bar at boot, before any UI exists.** It is the same trust boundary a pasted code crosses, it runs the same `decode` and the same rebuild, and its refusal path is the non-terminal one.

## For the Next Plans

- **04-05 (the share surface).** `App.serialize.encode(App.state.get().build)` is synchronous and is what the copy control must call **before** any `await`, per the Chrome-107 gesture rule. Nothing in the surface may present the address bar as the way to share; `[S04.4]`'s comment states that prohibition and this plan's greps enforce the letter of it.
- **04-06 (the reset surface).** `resetToDefaults` commits structurally through the funnel, so the mirror already follows it — a reset writes a fresh code into the hash on the next frame with no extra wiring. There is nothing to clear by hand.
- **04-07 (the refusal message).** `App.ops.loadBuildCode(code)` is the one write path and it **returns** `{ ok, why, saw?, what? }` rather than throwing. `[S08].linkRefusal` is the boot surface's wording and is deliberately **not** shared — the dialog has a different thing to say next. The four tokens are proved; the words are still plan 04-07's and rehearsal item 8's.
- **04-08 (the rehearsal).** Three items land here from this plan, each LOW confidence and each named in the harness's own limitations list: a real reload and a real bookmark (entry 14, rehearsal item 9); whether `history.replaceState` and this alphabet behave on `file://` outside Chrome 151 (entry 14); and **whether the boot load lands with no visible flash of the shipped board (entry 15) — which PROBE Q proved no automated check in this repo can see.**
- `SUITE_FLOOR` is **1019** against a measured **1049**; the interaction gate is **128**; the next free check number is **83**.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND
- `tests/selftest-node.cjs` — FOUND
- `.planning/phases/04-share-reset/04-04-SUMMARY.md` — FOUND
- commit `2f355aa` — FOUND
- commit `61e4730` — FOUND
- commit `c25e332` — FOUND
- commit `9ae44dd` — FOUND
- `node tests/selftest-node.cjs` exits 0 at 1049 passed / 0 failed — VERIFIED
- interaction gate 128 of 128 — VERIFIED
- stub-drift 73, `#app` 127, dialogs 144, proposal 60 — VERIFIED unchanged
- all four greps print 0 — VERIFIED
- working tree clean after every probe revert — VERIFIED
</content>
</invoke>
