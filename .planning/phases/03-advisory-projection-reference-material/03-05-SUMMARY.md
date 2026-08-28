---
phase: 03-advisory-projection-reference-material
plan: 05
subsystem: render
tags: [reference-band, action-cards, effect-cards, ref-01, ref-02, proj-06, stub-drift, interaction-gate]

# Dependency graph
requires:
  - phase: 03-advisory-projection-reference-material
    plan: 04
    provides: "App.data.REFERENCE — the developer-approved effect names and the two matchup pairs this plan renders"
  - phase: 03-advisory-projection-reference-material
    plan: 03
    provides: "the SYNC_HOOKS sub-region template, the build-once dataset flag, the [S09.8] DOM-half shape, and the Layer C floor this plan re-measures"
  - phase: 02-allocation-surface
    provides: "[S06.1]'s helpers and buildColumn, the function this plan makes its one declared cross-plan edit into"
provides:
  - "#refband — a full-width shell node below both columns, known to the stub page in both directions"
  - "[S06.4] RENDER — REFERENCE: the band builder, third hook on SYNC_HOOKS"
  - "action and effect cards inside each faction column, appended OUTSIDE buildColumn's setup branch so Phase 5's REF-03 is pre-satisfied"
  - "[C11] REFERENCE styles, .ref- prefixed"
  - "[S09.9]'s DOM half — 19 rows reading the rendered page"
  - "interaction-gate checks 58-63, the CI-reachable half, including a comment-stripped source scan"
  - "check 47's floor raised 105 -> 125 against four fresh measurements"
affects: [phase-04-share, phase-05-fight]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "a rendered sentence is asserted TWICE — once against strings assembled from the data, once against the approved wording written out — because those two rows fail for different reasons"
    - "a source-level rule whose comment must state it by name is scanned with the comments STRIPPED, so the check is about the code rather than about the prose"
    - "an assertion about a BUILD-time behaviour must drive a STRUCTURAL commit, not a plain one, or it proves nothing"
key-files:
  created: []
  modified:
    - cats-vs-mechs.html
    - tests/selftest-node.cjs

key-decisions:
  - "the cards read actions from frozen DEFAULTS, not state.build, so a pasted Phase 4 build code can never paint reference copy outside Layer C's student-name exemption"
  - "zero damage prints as words for all four zero-damage actions, because a 0 beside a keyword reads as 'does nothing' when the keyword is the point"
  - "the band and the card builder DESCRIBE the identifiers their own acceptance greps search for, rather than spelling them — [S06.1] and [S06.3] resolve the same conflict the same way"
  - "the rename rows in both halves read the card again after a structural rebuild, because a probe proved the single-read version vacuous"
  - "check 47's floor is 125, chosen against four measurements rather than picked"

requirements-completed: [REF-01, REF-02, PROJ-06]

# Metrics
duration: 70min
completed: 2026-08-28
---

# Phase 3 Plan 05: The Reference Band On Screen Summary

**A student now reads their faction's three actions with damage and effect cards in their own column — in setup and in a started fight alike — and reads `Fly beats Slash` and `Lasers beat Hairball` under the heading `What beats what` in a band below both columns; every string comes from data the developer approved, a token rename provably cannot reach a keyword, and the row that was supposed to prove that last point was found vacuous by its own probe and rewritten until it bit.**

## Performance

- **Duration:** ~70 min
- **Tasks:** 3 of 3
- **Files modified:** 2

## Measured Results

| Gate | Baseline (03-04) | After this plan |
|---|---|---|
| `node tests/selftest-node.cjs` exit | 0 | **0** |
| assertions (Node, no DOM) | 410 passed, 0 failed | **411 passed, 0 failed** |
| **full suite WITH a DOM (stub)** | not measured at 03-04 | **516 passed, 0 failed** |
| `reference material` rows (with a DOM) | 15 | **35** |
| suites reading `suite threw` | 0 | **0** |
| interaction gate | 57 of 57 | **63 of 63** |
| stub-drift gate | 35 shell ids | **36 shell ids** |
| Layer A | clean, 29 words | **clean, 29 words** |
| Layer B literal count | 2,293 | **2,333, clean** |
| **Layer C harvest** | **115** | **135** |
| check 47's floor | `> 105` (margin 10) | **`> 125` (margin 10)** |
| perf gate | 5 ms / 50 ms | **under budget** |
| `grep -ci "counter\|rating\|balanced\|difficulty"` | 0 | **0** |
| `grep -c "verdict\|balanced\|rating\|difficulty"` | 0 | **0** |
| `grep -c "\.style"` | 1 | **1** |
| `grep -c "createElementNS"` | 0 | **0** |
| `grep -c "SYNC_HOOKS.push"` | 2 | **3** |
| `grep -c "SYNC_HOOKS.push(syncReference)"` | 0 | **1** |
| `grep -c 'id="refband"'` | 0 | **1** |
| CRLF lines / total (`cats-vs-mechs.html`) | 8,043 / 8,043 | **8,597 / 8,597** |
| CRLF lines / total (`tests/selftest-node.cjs`) | 2,420 / 2,420 | **2,694 / 2,694** |

**The floors for later plans are 411 without a DOM and 516 with one, gate 63 of 63, stub-drift 36 shell ids, Layer C 135.**

The `411` is `410` plus one `t.info` — the `skipped — no DOM` notice `[S09.9]`'s new half prints when there is no page. The nineteen real rows it guards run only where a document exists.

### The browser number, stated honestly

**No browser was available in this environment.** The 516 was measured against the STUB DOM, using research §9.3's runner: `makeStubDom()` lifted out of `tests/selftest-node.cjs` at run time by brace-matching it out of the source, the artifact loaded into a `vm` with that page attached, `App.selftest.run()` called directly. All 35 reference-material rows executed and passed there. **A real-browser total is still owed to the phase's rehearsal, and it should be 516 or higher.**

### The trap the brief named, met head-on and measured

The first stub-DOM run of the full suite reported **495 passed / 5 failed with two suites reading `suite threw`**. The sandbox was missing `Event`, `MouseEvent` and `KeyboardEvent`. Adding them took the same file, unchanged, to **516 passed / 0 failed with 0 suites threw**.

The five failures were not in the two suites that threw. **A thrown suite skips its own state-restore, and the corrupted board then failed rows in three later suites** — which is exactly why `failed === 0` is not a safe thing to assert on its own. Every total in this document was read off a run with 0 suites threw, and the constructors are commented as load-bearing in the probe runner.

## The Rendered Page, Verbatim

Printed by a probe loading the artifact into the same stub page the harness builds, driving real ops, and reading the nodes back.

**The band, on the shipped board**

```
#refband  dataset.built = "1"
  "What beats what"
  "Fly beats Slash"
  "Lasers beat Hairball"
  .ref-beats lines: 2
```

Two lines, not three, exactly as approved. `Recharge beats Fly` is absent.

**The band after `App.ops.addUnit('cats')` — a STRUCTURAL commit**

```
#refband  dataset.built = "1"
  "What beats what"
  "Fly beats Slash"
  "Lasers beat Hairball"
  .ref-beats lines: 2
```

`structure()` replaced both column interiors and left the band standing.

**Both columns, in setup**

```
#col-cats   (3 cards, add button: present)
  "Slash     |  1 damage"
  "Hairball  |  no damage  |  Slowdown"
  "Screech   |  no damage  |  Confuse"
#col-mechs  (3 cards, add button: present)
  "Fly       |  no damage  |  Evade"
  "Lasers    |  3 damage   |  Range"
  "Recharge  |  no damage  |  Shield"
```

**Both columns after `App.ops.startFight()`**

```
#col-cats   (3 cards, add button: gone)
  "Slash     |  1 damage"
  "Hairball  |  no damage  |  Slowdown"
  "Screech   |  no damage  |  Confuse"
#col-mechs  (3 cards, add button: gone)
  "Fly       |  no damage  |  Evade"
  "Lasers    |  3 damage   |  Range"
  "Recharge  |  no damage  |  Shield"
```

**Every card still there while the Add button is gone.** This is REF-03 pre-satisfied, measured rather than assumed, and probe 3 below proves the row that asserts it actually bites.

**The rename probe**

```
App.ops.renameTokenType('shield', 'Barrier')
  Recharge card effect chip  : "Shield"
  board shield token row lbl : "Barrier"   (3 nodes)
```

A student renaming the Shield *token* has not renamed the Recharge *keyword*, and the rename demonstrably reached the board — so the first line is not true for the wrong reason.

## Task Commits

1. **Task 1 — `#refband`, `KNOWN_IDS`, the stub node, `[C03]`, `[C11]` and `[S06.4]`** — `a380ead` (feat). 410 passed, gate 57 of 57, stub-drift 35 → 36, Layer C 115 → 118.
2. **Task 2 — the card builder and the declared `buildColumn` edit** — `ede7fe4` (feat). 410 passed, gate 57 of 57, Layer C 118 → 135.
3. **Task 3 — `[S09.9]`'s DOM half, gate checks 58-63, the floor raise** — `18c17c6` (test). 411 passed, gate 63 of 63.

## Deliberate-Failure Probes

Seven run, all recorded, all reverted. `node tests/selftest-node.cjs` returned to exit 0 / 411 / 63 of 63 after each, and `git status --short` is empty.

**Drift probe A — `'refband'` removed from `KNOWN_IDS`.**
Result: **exit 1**, before any suite ran:
`STUB DRIFT: cats-vs-mechs.html carries id(s) the stub page does not know: refband`. Reverted.

**Drift probe B — the shell node removed, `KNOWN_IDS` intact.**
Result: **exit 1**, the other direction:
`STUB DRIFT: the stub page builds id(s) the shell no longer carries: refband`. Reverted.
Both directions bite, which is what makes the id, the list entry and the stub node one change rather than three.

**Probe 1 — an effect card's name built from a literal.** `effectChip` was made to return `'Dodge'` for `evade` instead of reading `REFERENCE.effects`.
Result: **exit 1**, gate **62 of 63**. Check 60 FAIL with
`cards painted=5 (floor 5) missing from the page=["fly/evade"] painted but not in the data=["fly/Dodge"]` — **both directions fired on one mutation**, which is right: a literal both loses the data's card and adds one the data never described. The stub-DOM suite failed the matching `DIRECTION ONE` and `DIRECTION TWO` rows. Reverted.

**Probe 2 — an effect card's name routed through the label reader.**
Result the FIRST time: **exit 1**, gate **61 of 63**. Check 63 FAILED with `found: ["labelFor"]` and check 60 failed. **CHECK 61, THE RENAME ROW, PASSED.**

That is the finding this plan is proudest of and it is written up in its own section below. After the row was rewritten, the same mutation gives: **exit 1, gate 60 of 63**, check 61 FAIL with
`card after sync="Shield" card after structural rebuild="Barrier" board shield row="Barrier"`,
plus checks 60 and 63 — the three the plan predicted. The artifact's own `[S09.9]` half fails the matching three rows under the stub DOM, and its plain rename row still passes, so the added read is demonstrably the one doing the work in both halves. Reverted.

**Probe 3 — the `buildColumn` card append moved INSIDE the `if (setup)` branch.**
Result: **exit 1**, gate **62 of 63**. Check 62 FAIL with `cats cards=0 mechs cards=0 add buttons=0`, and **no other check moved**. REF-03's pre-satisfaction is asserted by a row written for it, not inherited from a row about something else. Reverted.

**Probe 4a — an action renamed in the DATA only** (`Fly` → `Glide` in `DEFAULTS`).
Result: **exit 1**. Check 58 FAIL with
`lines=["Glide beats Slash",...] assembled=["Glide beats Slash",...]` — the assembled half PASSED and the approved-wording half caught it. Reverted.

**Probe 4b — the band's sentences hand-typed into the renderer, with the same data rename.**
Result: **exit 1**. Check 58 FAIL with
`lines=["Fly beats Slash",...] assembled=["Glide beats Slash",...]` — this time the **assembled half caught it and the approved-wording half passed**, the exact mirror of 4a. Reverted.

Probes 4a and 4b were not in the plan. They were run because check 58 asserts the same two sentences twice, and two assertions about one string are either disjoint coverage or dead weight. They are disjoint: each half catches the defect the other misses, and neither alone would do.

## THE VACUOUS ROW, AND WHY IT WAS VACUOUS

**Check 61 and its `[S09.9]` twin were written to prove that renaming the Shield token cannot rename the Recharge keyword. As first written they proved nothing.** Probe 2 routed an effect card's name straight through `labelFor` — the exact bug the row exists for — and the row passed.

The reason is a fact about the two-tier renderer:

- a rename is a **plain** commit, so it runs `sync()` and never `structure()`;
- the cards are built by `buildColumn`, which only `structure()` calls;
- the cards carry no `data-lbl`, so the sync pass has nothing to rewrite on them.

**So a rename alone cannot repaint a card whatever the builder does.** The row was asserting that a node nothing had touched still said what it said when it was built. It would have caught a *sync-time* label lookup — an attribute-driven one — and was structurally incapable of catching a *build-time* one, which is the shape the mutation actually takes and the shape a future author would most naturally introduce.

Both rows now rename, read, then drive `App.ops.addUnit('mechs')` — a structural commit — and read again under the rename still in force. The failure detail prints both reads, so the next person to see it red can tell instantly which tier drifted. The reasoning is written at each row under a `READ THIS BEFORE SIMPLIFYING IT` heading, because the second read looks redundant and is not.

This is the third consecutive wave to find one of its own probes proving the wrong thing, and the fourth to be improved by it.

## Decisions Made

- **The cards read from frozen `DEFAULTS`, not from `state.build[side].actions`** — even though `buildColumn` already has the latter in hand. Reference material is static and outside the slice a student edits, and from Phase 4 an actions array can arrive from a pasted build code. Layer C exempts `[data-lbl]` and `[data-albl]` so a student's own token names cannot redden CI; a *pasted* action name would reach the page through neither channel. Reading the frozen board closes that before it opens. The day actions become student-editable, this is the line that has to change on purpose, and the comment says so.
- **Zero damage prints as words, and the same words for all four zero-damage actions.** `Hairball`, `Screech`, `Fly` and `Recharge` all read `no damage`. A `0` beside an effect chip reads as "this action does nothing", when what it in fact does is the thing the chip names and what that is worth is the table's ruling. The register matches `[S06.3]`'s `no damage to spend`, which is the same refusal on the same grounds.
- **Two acceptance greps were satisfied by describing rather than quoting; one was not, deliberately.** `[C11]`'s comment names the colour custom properties and the clipping box it forbids without spelling them, and the card builder does the same for the two dispatch attributes and the namespaced element constructor — so those region greps return 0 honestly. **`labelFor` IS spelled, six times, and that region grep returns 6.** The plan requires the label rule to be stated in the comment in both directions, and a rule about a named function that never names it is not findable by the person who needs it. Check 63 therefore scans the region **with the comments stripped**, which is a check about the code rather than about the prose — and probe 2 proves it bites. This is the same finding shape as 03-03's probes 2 and 2b: the source count and the walk catch different things, and only running both tells you which.
- **The band is styled by id, its children by class.** `#refband` in `[C11]` carries the chrome, `.ref-` carries the contents — exactly the `#strip` / `.prj-` arrangement `[C03]` and `[C10]` already establish. The plan's suggested `.brd-band` class was dropped: it would have been a class with no rule, which is a lie in a stylesheet with no scoping.
- **The card builder is wrapped in `#region` markers and they are load-bearing.** Check 63 slices between them. The comment says so, and the check floors the sliced length at 400 characters so a renamed marker scans an empty string and fails rather than passing on nothing.
- **Check 47's floor is 125, chosen against four measurements.** The shipped board harvests **135** in the gate and **131** with no gate drives behind it; a board shrunk to one unit a side harvests **61**; each unit card is worth **7** strings, measured by adding three Mechs and watching 131 become 152. The band and cards contribute **20** roster-independent strings — 3 in the band, 17 across the six cards — and every one is separately pinned by checks 58-60. 125 keeps 03-03's margin rule (more than one unit card of headroom) and all four numbers plus the full floor history are written into the comment.
- **No column heading above the cards.** "Actions" would be legible and helpful and it is not in the approved copy. Adding words the developer did not approve is the exact failure this phase's checkpoint existed to prevent, so it is on the rehearsal list below instead of in the file.

## Deviations from Plan

**1. TWO matchup lines everywhere the plan says three.** The plan predates the checkpoint decision; `03-04-SUMMARY.md`'s `## THE APPROVED COPY` is binding and says two. Every assertion pins the count at 2 explicitly, so restoring the third is a decision somebody makes rather than a diff nobody notices.

**2. Effect cards carry no `text`, because none exists.** The plan's Task 2 says each effect card "carries its approved `text`". The approved copy is names only. The cards render the name and nothing else, and `[S09.9]` asserts the record shape so a definition cannot be added quietly.

**3. The source-level scan lives in the interaction gate, not in `[S09.9]`.** The plan places it in the artifact's suite. **The artifact cannot read its own source**: `fetch` is blocked on `file://` by the project's hard constraint, and the builders are closure-local so `Function.prototype.toString` is not reachable either without adding export surface purely for a test. The gate already holds the document as `html` and is the half CI runs. Written there, and the reason is recorded at the check.

**4. Check 63 scans the region with comments stripped rather than raw.** The plan asks for a raw region grep AND for the rule to be written into the comment by name; those cannot both hold. See the decision above.

**5. Probes 4a and 4b were added beyond the three the plan names.** Check 58 asserts the same two sentences twice; running only the plan's probes would have left it unknown whether that pair is disjoint coverage or dead weight. It is disjoint, and the two probes are the evidence.

**6. Six gate checks rather than the four the plan floors at**, and the source-level row is one of them. The plan's ≥59 floor is met at 63.

## Threat Register Outcomes

| Threat ID | Disposition | Evidence |
|---|---|---|
| T-03-20 | mitigated | `labelFor` absent from the builder's stripped code (check 63, probe 2); the rename driven for real and read after BOTH a sync and a structural rebuild (check 61 and `[S09.9]`, probe 2 after the rewrite) |
| T-03-21 | mitigated | `Array.find` over `REFERENCE.effects` by `id` equality in the card builder, and an id-equality scan over `DEFAULTS` in `[S06.4]`; no bare index anywhere in either |
| T-03-22 | mitigated | `KNOWN_IDS`, the stub node and the shell node in one change; drift probed in both directions and failing with `refband` named each time |
| T-03-23 | mitigated | Both-directions DOM coverage (check 60, `[S09.9]`'s two rendered rows); probe 1 fires both halves; check 58's assembled/literal pair probed disjoint by 4a and 4b |
| T-03-24 | mitigated | Region-scoped greps over `[C11]` return 0 for the clipping property and for every token-identity colour; both halves of a matchup line take one class, one size and one weight; Layer C walks the band's copy (harvest 115 → 135) |
| T-03-25 | mitigated | Every string through `text(...)` → `textContent`; `createElementNS` 0 document-wide; the FORBIDDEN scan clean |
| T-03-SC | n/a | No packages. Zero runtime dependencies; the harness is Node built-ins only |

## Known Stubs

None. Every string on both new surfaces is read from `App.data.REFERENCE` or `App.data.DEFAULTS` on the frame it is built. Nothing is hardcoded, placeholder, or awaiting a later plan. The one thing deliberately *absent* — descriptive text on the effect cards — is the developer's recorded decision, asserted by a suite row, and is not a stub.

## Threat Flags

None. No network endpoint, auth path, file access or trust-boundary schema change. The plan adds two read paths from frozen data to rendered text.

## Issues Encountered

**A build-time behaviour cannot be asserted with a plain commit, and the two-tier renderer makes that easy to get wrong.** The whole of the vacuous-row section above. The general rule this leaves for later plans: if the thing being asserted happens in `structure()`, the drive has to be a structural op, and reading the node after a `sync()`-only commit proves only that nothing touched it.

**Three separate acceptance greps in this plan were defeated by the comment that satisfies the same plan's documentation requirement.** This is now the third region to hit it (`[S06.1]`, `[S06.3]`, and this plan's `[C11]` and card builder). The resolution is settled and should be treated as the file's convention: describe rather than spell where the name buys nothing, spell and scan the code where the name is load-bearing.

**A real browser has still not run this suite in this phase.** 516 is a stub number.

## Rehearsal List — the phase's open remainder

Nothing below is answerable without a browser, a projector, and the actual workshop display. This is the phase's honest remainder and it is carried forward whole.

1. **Strip stickiness at the new content height.** The columns grew by three cards each this phase. `#strip` is sticky and taller than it was; a sticky box taller than the space between the bar and the bottom of the window behaves as though it were not sticky for the part that does not fit. Named as gate entry 11.
2. **`≈`, `÷` and `–` as glyphs rather than replacement boxes** in the shipped font stack. The code points are asserted; only a display asserts the glyphs. Gate entry 7.
3. **Four-digit figure legibility** from the back of a room at 24px. Gate entry 8.
4. **Column height with eight cards** — a faction head, up to twenty-four unit cards, an Add button and three action cards — and whether the band underneath is reachable without a scroll that leaves it unseen. Gate entry 9.
5. **Whether the band's two sentences read from the back of the room** at 24px. Gate entry 10.
6. **Whether the card block reads as "these are the actions" with no heading over it.** Deliberately unlabelled, because a heading would be unapproved copy. If a rehearsal says it needs one, that is a one-word decision for the developer and a two-line change.
7. **G-02-B, still open from Phase 2.** This phase raises the stakes on it and does not close it.

## Next Phase Readiness

Phase 4 and Phase 5 inherit:

- **Floors: 411 without a DOM, 516 with one, gate 63 of 63, stub-drift 36, Layer C 135, check 47's floor 125.** Next free gate check number is **64**.
- **`SYNC_HOOKS` carries three hooks.** A later plan painting a region outside `#board` registers a fourth; appending from outside `[S06]` is still impossible, because the seam is a closure variable and `App.render` is frozen.
- **`REFERENCE` is outside the build slice and `[S09.9]` holds it there.** Phase 4's codec encodes `state.build` and will not encounter reference copy. The `beats` records carry ids, so a Phase 4 schema change touching action ids has one place to look.
- **The cards already render in fight mode.** Phase 5's REF-03 is pre-satisfied and asserted by check 62, not merely believed.
- **The keyword/token `shield` collision is live and proven harmless.** Any Phase 5 code naming a keyword must read `REFERENCE.effects`, never `labelFor`. Check 63 will catch it in the card region; a new region needs its own marker pair and its own row.

No blockers. STATE.md and ROADMAP.md deliberately untouched — the orchestrator owns those.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND, modified
- `tests/selftest-node.cjs` — FOUND, modified
- `.planning/phases/03-advisory-projection-reference-material/03-05-SUMMARY.md` — FOUND
- commit `a380ead` — FOUND
- commit `ede7fe4` — FOUND
- commit `18c17c6` — FOUND
- `node tests/selftest-node.cjs` — exit 0, 411 passed / 0 failed, gate 63 of 63, stub-drift 36 shell ids, Layer C 135
- full suite with a stub DOM — 516 passed / 0 failed, 0 suites threw, 35 reference-material rows
- both acceptance greps — 0 and 0
- `git status --short` — empty after every probe reverted

---
*Phase: 03-advisory-projection-reference-material*
*Completed: 2026-08-28*
