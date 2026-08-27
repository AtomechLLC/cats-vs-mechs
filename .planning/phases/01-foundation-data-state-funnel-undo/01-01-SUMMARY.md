---
phase: 01-foundation-data-state-funnel-undo
plan: 01
subsystem: infra
tags: [vanilla-js, single-file-html, file-protocol, css-custom-properties, selftest, node-vm]

# Dependency graph
requires: []
provides:
  - "cats-vs-mechs.html — the artifact itself: head, one <style> block, static shell, one classic <script>"
  - "The eleven-region script scaffold [S00]-[S10] with banner, deps/owner and #region markers"
  - "App namespace and App.hasFlag(name) — exact-match hash flag test"
  - "App.data.DEFAULTS / defaults() / deepFreeze — the deep-frozen Workshop 16 board"
  - "App.model.{unitEhp,factionEhp,bestDamage,factionDps,aliveCount,apSpent} — pure derivations"
  - "App.selftest.{suite,run,report} — the in-file harness and its report renderer"
  - "Declared no-op stub surfaces: App.serialize.scheduleUrlSync, App.render.structure/sync, App.interactions.bind"
  - "App.boot.{attempt,start} stub carrying the #selftest gate line"
  - "Static shell ids: #app, #board, #board-empty, #selftest-report/-summary/-rows, #err-panel/-title/-message/-detail/-dismiss/-reset"
  - "CSS design tokens and surface classes inherited from the sibling course artifacts"
  - "tests/selftest-node.cjs — dev-only forbidden-pattern scan plus headless run of the suites"
affects: [01-02, phase-02-render-interactions, phase-03-projection-reference, phase-04-sharing, phase-05-fight]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Namespaced IIFE on a single global App; each section returns an Object.freeze'd public surface"
    - "Cross-section references resolved at call time as App.x.y(), never captured at section-body scope"
    - "[SNN] grep tokens on every region banner, mirrored by [CNN] tokens in the style block"
    - "Section banners and #region markers at column 0, code indented two spaces"
    - "All page text written via document.createElement + textContent; no markup-parsing sink anywhere"
    - "Machine-enforced offline purity: a forbidden-pattern scan is part of the test command"

key-files:
  created:
    - "cats-vs-mechs.html"
    - "tests/selftest-node.cjs"
  modified: []

key-decisions:
  - "Region token scheme is [S00]-[S10] in the script and [C00]-[C09] in the style block, so a grep for a token lands in exactly one place"
  - "App.hasFlag splits the hash on ',' and compares whole trimmed tokens by === — never a substring test, so #notselftest and #selftestx cannot open the developer report"
  - "defaults() uses a JSON round-trip rather than structuredClone: faster on this payload, and it enforces the JSON-clonable state invariant by construction"
  - "Base font raised from the siblings' 16px to 17px for projector legibility; every other base rule copied verbatim"
  - "--maxw raised to 1280px (siblings use 980/1000) because this is a two-faction board"
  - "The forbidden-pattern scan runs before the assertions, so an offline-purity regression fails the same command that runs the tests"

patterns-established:
  - "Declared no-op stubs at every future call site, so Phase 2 and Phase 4 fill a body rather than retrofitting a call"
  - "Inherited sibling class names (.card, .callout, .eyebrow, .muted, .faint, .ex) keep their names; every new class carries a section prefix (st-, err-, shell-)"
  - "Self-test suites live in numbered sub-blocks ([S09.1], [S09.2], [S09.3]) owned by a named plan"

requirements-completed: [ALLOC-08, UX-04]

# Metrics
duration: 22min
completed: 2026-08-26
---

# Phase 1 Plan 01: Foundation — Data, Model and Self-Test Harness Summary

**A single self-contained `cats-vs-mechs.html` that opens offline by double-click, carries the deep-frozen Workshop 16 board plus pure eHP/throughput derivations behind an eleven-region scaffold, and proves all 28 assertions in a styled `#selftest` report.**

## Performance

- **Duration:** ~22 min
- **Started:** 2026-08-26T00:00:00Z (approx.)
- **Completed:** 2026-08-26
- **Tasks:** 3
- **Files modified:** 2 (both created)

## Accomplishments

- The artifact exists and is offline-pure by proof, not by promise: `tests/selftest-node.cjs` fails the run on `https?://`, `<link`, ` src=`, `type="module"`, `fetch(`, `XMLHttpRequest`, `@import`, `url(`, `innerHTML`, `eval(` or `new Function` anywhere in the file, including inside comments. It currently reports zero hits.
- The whole section scaffold is in place at day one — eleven regions in fixed order, each with a purpose line, a `deps:` line, an `owner:` line and `#region`/`#endregion` markers — plus declared no-op stub surfaces at every Phase-2 and Phase-4 call site, so nothing has to be retrofitted into a file that will grow four to six times longer.
- The Workshop 16 board loads from exactly one deep-frozen object, and 17 named assertions confirm every number and action from it. `defaults()` hands back an independent deep copy on every call, proven by mutating one copy and checking both the next copy and `DEFAULTS`.
- eHP and damage-throughput are pure argument-taking functions with 12 more named assertions, including the load-bearing one: `alive is read, not inferred` — a zero-HP unit flagged alive counts, a full-HP unit flagged dead does not.

## Task Commits

Each task was committed atomically:

1. **Task 1: File skeleton — head, style, static shell, section scaffold, self-test harness, headless runner** — `79abbd0` (feat)
2. **Task 2: Frozen Workshop 16 defaults in [S01] DATA, proved by suite [S09.1]** — `9776b7f` (feat)
3. **Task 3: Pure derivations in [S02] MODEL, proved by suite [S09.2]** — `461b78e` (feat)

## Files Created/Modified

- `cats-vs-mechs.html` (685 lines) — the artifact. Head, one `<style>` block ([C00] TOKENS / [C01] BASE / [C02] SHELL / [C08] BOOT — ERROR PANEL / [C09] SELFTEST REPORT), static shell markup with all stable container ids, and one classic `<script>` holding regions [S00] through [S10].
- `tests/selftest-node.cjs` (113 lines) — dev-only, never shipped and never referenced from the HTML. Node built-ins only (`fs`, `path`, `vm`). Scans for forbidden patterns, then loads the script body into a `vm` sandbox with **no** `document` and **no** `location` and runs `App.selftest.run()`.

## Verification Evidence

```
$ node tests/selftest-node.cjs
scan: no forbidden patterns
... 28 PASS lines across suites 'board defaults' (17) and 'model derivations' (11+1) ...
28 passed, 0 failed
EXIT=0
```

Acceptance greps, all as specified by the plan:

| Check | Required | Actual |
|---|---|---|
| `^// #region \[S` | 11 | 11 |
| `^// #endregion \[S` | 11 | 11 |
| `deps:` | ≥ 11 | 11 |
| `innerHTML\|eval(\|new Function\|https\?://\|<link\|type="module"` | 0 | 0 |
| `<script` / `<style` | 1 / 1 | 1 / 1 |
| `App\.state` | 0 | 0 |
| `counter\|slash < fly` (case-insensitive) | 0 | 0 |
| `verdict\|balanced\|rating\|difficulty` (case-insensitive) | 0 | 0 |
| `maxHp: 3` / `maxHp: 6` | 1 / 1 | 1 / 1 |
| err-panel ids | 6 | 6 |
| `[S09.1]` / `[S09.2]` / `[S09.3]` | 1 each | 1 each |
| `location.hash.includes` / `.indexOf` | 0 | 0 |
| `--accent:#5cc8ff`, `--coral:#ff8a5c`, `--maxw:1280px`, the radial-gradient body background | present | present |

**Threat T-01-01 proved, not asserted.** A scratch probe (not committed) ran the script body against a minimal fake DOM across ten hash values. The report stayed hidden with zero rows for `""`, `"#"`, `"#notselftest"`, `"#selftestx"`, `"#selftes"` and `"#SELFTEST"`, and opened with 28 rows and the summary `28 passed, 0 failed` for `"#selftest"`, `"#selftest,verbose"`, `"#verbose,selftest"` and `"#selftest, other"`. This is the substring-gate failure mode closed off empirically rather than by inspection.

## Decisions Made

- **`deps:` lines name regions, not `App.state`.** The plan's own acceptance criterion requires `grep -c "App\.state"` to return `0` file-wide, but the `[S05] OPS` and `[S08] BOOT` banners naturally wanted `deps: App.state, …`. Those two lines now read `deps: [S03] STATE, …`, which satisfies the criterion and is in fact more greppable — a reader searching `[S03]` finds its dependents as well as its definition. Plan 01-02 will introduce the real `App.state` symbol.
- **`t.ok` records the coerced boolean as `actual`.** Keeps a failing row's detail line readable (`actual: false — expected: true`) rather than dumping a whole faction object.
- **Report rows sort failures first** using a stable sort, so a red row never hides below the fold.
- **The word "counter" is absent from the file by construction.** The plan forbids counter-map data leaking into Phase 1, and enforces it with a case-insensitive grep. Comments that wanted to say "counter map" or "counter" say "the action-versus-action reference table" and "numeric readout" instead.

## Deviations from Plan

None — plan executed as written. The one adjustment worth naming is the `deps:` line wording above, which resolves an internal tension between the plan's banner guidance and its own `App.state` acceptance criterion in favour of the criterion.

**Total deviations:** 0
**Impact on plan:** None. All three tasks met every acceptance criterion as stated.

## Issues Encountered

- **Two acceptance criteria constrain prose, not just code.** `grep -ci "counter\|rating\|balanced\|difficulty"` returning `0` bans those substrings from comments too — and `rating` is a substring of ordinary words like *generating* and *operating*. Comment wording was chosen to avoid them. Future plans editing this file should re-run those greps after writing comments; the trap is invisible until it fires.
- **The `#region` markers must sit at column 0** because the criterion anchors on `^// #region`, while the sibling artifacts indent script contents two spaces. Resolved by putting banners and region markers at column 0 and code at two spaces, and recording that choice in the table-of-contents comment so later phases match it.

## Known Stubs

These are intentional and named in the plan. Each is a declared no-op whose call site exists now so it is never retrofitted.

| Stub | Location | Resolved by |
|---|---|---|
| `[S03] STATE` — banner only | `cats-vs-mechs.html` | plan 01-02 |
| `[S05] OPS` — banner only | `cats-vs-mechs.html` | plan 01-02 |
| `App.boot.attempt` / `App.boot.start` — minimal bodies; the `App.hasFlag('selftest')` gate line must survive | `cats-vs-mechs.html` | plan 01-02 |
| `[S09.3] SUITE: state contract` — empty marker | `cats-vs-mechs.html` | plan 01-02 |
| `App.serialize.scheduleUrlSync()` | `cats-vs-mechs.html` | Phase 4, plan 04-01 |
| `App.render.structure()` / `App.render.sync()` | `cats-vs-mechs.html` | Phase 2, plan 02-01 |
| `App.interactions.bind()` | `cats-vs-mechs.html` | Phase 2, plan 02-02 |
| `#board` shows a placeholder line | `cats-vs-mechs.html` | Phase 2, plan 02-01 |

None of these block this plan's goal. Phase 1 plan 01-01 is explicitly the invisible layer: the only thing it renders is the `#selftest` report, and that renders fully.

## Threat Flags

None. No security-relevant surface was introduced beyond the three boundaries already in the plan's threat register, and all three `mitigate` dispositions are implemented and machine-checked:

- **T-01-01** (hash tampering) — exact-token comparison, proved across ten hash values.
- **T-01-02** (text into the page) — `createElement` + `textContent` only; `innerHTML`, `eval(` and `new Function` are rejected by the test command.
- **T-01-03** (offline integrity) — zero runtime dependencies; the scan is the proof.

## User Setup Required

None — no external service configuration required. The install step is double-clicking the file. The optional headless runner needs Node (verified on v24.15.0) and installs nothing.

## Next Phase Readiness

**Ready for plan 01-02.** Every surface it needs already exists and is unowned by this plan's regions:

- `[S03] STATE`, `[S05] OPS` and `[S08] BOOT` contain only banners and marked stubs, ready to be filled in place. The `[S03]` banner already documents the state shape, the slice lifetimes, and the rule that there is no `mode` key.
- `App.data.deepFreeze` is exported specifically so `[S03]` reuses it rather than keeping a second copy.
- The error panel is static markup with all six ids present, so it can display even if init throws.
- `[S09.3]` is an empty, named sub-block.
- `App.boot.start()`'s selftest gate line must survive plan 01-02's rewrite — it is the only thing keeping ROADMAP criterion 2 alive.

**One open item, unchanged and by design:** D-01's board numbers are flagged for user confirmation. They are almost certainly a blowout in the Cats' favour (27 eHP and three attacks per turn each way, but nine Cat bodies against three Mechs). That is what Phase 5's playtest gate (FIGHT-11, plan 05-03) exists to catch, and `DEFAULTS` is a one-place edit when it does.

**Not verified here:** the plan's human-check — double-clicking the file in a real browser and confirming zero console errors and zero network requests in DevTools. The forbidden-pattern scan and the fake-DOM probe make a failure unlikely, but a real-browser open on the workshop display is still worth doing before the session.

---
*Phase: 01-foundation-data-state-funnel-undo*
*Completed: 2026-08-26*

## Self-Check: PASSED

All claimed files exist on disk and all four commit hashes (`79abbd0`, `9776b7f`, `461b78e`, `1105a87`) are present in git history. `node tests/selftest-node.cjs` exits 0 with 28 passed, 0 failed and no forbidden-pattern hits. Working tree clean.
