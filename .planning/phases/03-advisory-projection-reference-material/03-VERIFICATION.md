---
phase: 03-advisory-projection-reference-material
verified: 2026-08-28T00:00:00Z
status: human_needed
score: 5/5 must-haves verified (2 by override)
overrides_applied: 2
overrides:
  - must_have: "REF-01 / Roadmap SC5: the counter map shows three relationships (Slash < Fly, Hairball < Lasers, Fly < Recharge)"
    reason: "Developer instruction at the 03-04 checkpoint (recorded in 03-04-SUMMARY.md '## THE APPROVED COPY'): 'Recharge beats Fly' is dropped because it is intra-Mechs, and dropping it also removes the short loop where Fly sat on both sides of the chain. Left out rather than corrected; PROJECT.md's transcription is unchanged and still records all three. Shipped band states two cross-faction relationships ('Fly beats Slash', 'Lasers beat Hairball')."
    accepted_by: "developer (checkpoint:decision, 03-04 Task 1)"
    accepted_at: "2026-08-28"
  - must_have: "REF-02 effect cards carry descriptive text for Shield/Slowdown/Confuse/Evade/Range"
    reason: "Not actually required by Roadmap SC5's literal wording ('effect cards ... visible attached to the actions that carry them' — no text requirement), but flagged here because 03-05-PLAN.md's own draft anticipated definitions. Developer chose NAMES ONLY at the 03-04 checkpoint: the five keywords are what students adjudicate with, and a shipped definition would be the tool doing the adjudicating. Mechanically enforced — a suite row (probe 3 in 03-04-SUMMARY.md) turns red if a 'text' field is ever added to an effect record."
    accepted_by: "developer (checkpoint:decision, 03-04 Task 1)"
    accepted_at: "2026-08-28"
gaps: []
human_verification:
  - test: "Open cats-vs-mechs.html in a real desktop browser (Chrome/Edge/Firefox) and read the strip's two panels and #refband top to bottom on the shipped board."
    expected: "The ≈, ÷ and – (en dash) glyphs render as intended (not tofu boxes or a hyphen that reads as a minus beside the stepper buttons' own minus sign), the arithmetic lines wrap rather than scroll inside the narrow strip, and both panels are legible without hover, without a tooltip and without opening dev tools — matching Success Criterion 2."
    why_human: "No browser and no Playwright are available in this environment (documented gap in 03-REVIEW.md's closing note and in this phase's coverage facts). The stub DOM used for automated testing has no layout engine, so line-wrapping, glyph rendering and actual on-screen legibility cannot be checked programmatically — only that the correct text reaches the right DOM node."
  - test: "Shrink the browser window height (or view on a typical workshop laptop screen) and scroll the board."
    expected: "#strip keeps sticking to the top of the viewport under the topbar; if its content is taller than the available space, it should not disappear entirely or overlap in a way that hides a figure."
    why_human: "REVIEW.md's closing note names this as unreviewable without a layout engine: '#strip's content sets its own height now, and a sticky box taller than the space between the bar and the bottom of the window behaves as though it were not sticky for the part that does not fit.' No CSS regression tooling exists in this repo by design (single-file, no build step)."
  - test: "With the artifact open on an actual projector or a large shared screen, read the strip and #refband from a normal classroom viewing distance."
    expected: "The '≈9 turns to wipe Mechs' / '≈3 turns to wipe Cats' contrast (the phase's own worked teaching example, D-01) and the 'What beats what' band are legible without the instructor needing to zoom or narrate the numbers aloud."
    why_human: "Projector legibility is explicitly named as an empirical question with no programmatic substitute, both in this phase's own gate comments (check 47's closing note, item 4) and in the project's CLAUDE.md Gaps section ('No amount of research substitutes for putting the artifact on the actual workshop display before the session')."
---

# Phase 3: Advisory Projection & Reference Material Verification Report

**Phase Goal:** A student can see what their allocation implies, stated in the fight's own unit with
its arithmetic exposed and its blind spots named — and can read the counter map and effect cards
without leaving the build.
**Verified:** 2026-08-28
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (Roadmap Success Criteria 1-5)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Each side shows an eHP / time-to-wipe projection, updating live, stated as a range in the fight's own unit, never a decimal | ✓ VERIFIED | `turnsToWipe` ([S02], `cats-vs-mechs.html:1315`) derives `fast`/`slow` bounds with `Math.ceil` only — no `toFixed`/`Math.round`/`parseFloat` exist anywhere in the file (`grep` returned 0 hits). `turnsText` (`:3920`) renders `≈9 turns to wipe Mechs` / `≈3 turns to wipe Cats` on the shipped board (test row `interaction gate :: 49`, independently reproduced: `prjText('turns','cats') === '≈9 turns to wipe Mechs'`). `syncProjection` (`:4034`) recomputes on every frame from `state.build` (D-00b — no cached/stored derivation), confirmed live-updating by test row 51 (raising Cat HP to 4 flips the figure to `≈4–6 turns to wipe Cats`, independently re-run and passing). |
| 2 | The arithmetic behind each range is on screen as text, readable with no tooltip/hover/console | ✓ VERIFIED (glyph rendering/legibility needs human — see below) | `workLines()` (`:3953`) builds `'27 health ÷ 3 per turn'` style lines, appended as plain `.textContent`, next to the figure, `data-prj="work"`/`"soak"` — no `title`, `[data-tip]`, `<details>`, `:hover` CSS rule, or disclosure element anywhere in `[C10]`/`[S06.3]`. Confirmed no unauthorized `.style` access exists file-wide (count = 1, the topbar height measurement — checked directly). |
| 3 | A permanent, always-visible "what this ignores" list sits next to the projection, naming counters/effects/focus fire/overkill/rulings | ✓ VERIFIED | `PRJ_IGNORES = ['Matchups', 'Effects', 'Focus fire', 'Overkill', 'Your rulings']` (`:3878`), rendered unconditionally by `projIgnores()` (`:4008`) inside `#strip`, never behind a `hidden`/collapsed/disclosure element. "Matchups" stands in for "counters" because `counter` is itself a banned substring under the project's own acceptance grep (documented, not an oversight — see `03-CONTEXT.md` D-17 and `code_context`). |
| 4 | **No verdict anywhere on screen** — no traffic light/badge/meter/colour rating/"balanced" wording/shared midpoint bar | ✓ VERIFIED (see judgement below) | Both acceptance greps at 0 (`grep -ci "counter\|rating\|balanced\|difficulty"` = 0, `grep -c "verdict\|balanced\|rating\|difficulty"` = 0). `.style` appears exactly once file-wide (topbar only) — the cheapest available proof no proportional bar/shared scale/midpoint marker exists anywhere, confirmed by direct grep. Three-layer PROJ-06 gate (Layer A 16 words / Layer B 23 words / Layer C 39 words over 135 rendered strings) all green, independently re-run: `412 passed, 0 failed`, `interaction gate: 66 of 66`. `[C11]`'s own banner states colour is restricted to the four neutrals and "on NONE of the token-identity custom properties" for the matchup band — confirmed by reading `#refband`'s CSS block directly (`:590-600`), no conditional/comparative colour rule present. |
| 5 | The counter map and effect cards are visible attached to the actions that carry them, without navigating away from the build | ✓ VERIFIED (counter map ships 2 of 3 relationships — developer-approved, see override) | `#refband` (`cats-vs-mechs.html:682`) sits as a direct sibling of `#col-cats`/`#strip`/`#col-mechs` inside the single `#board` grid (`:678-683`) — no route change, no modal, no separate view. `refCard()` (`:3121`) is appended by `buildColumn()` (`:3185-3187`) inside each faction's own column, effect chips attached per-action from `action.keywords` (REF-02, both directions — gate check 60, independently confirmed passing). The band states `Fly beats Slash` / `Lasers beat Hairball` — two of the three whiteboard relationships; `Recharge beats Fly` was dropped on explicit developer instruction at the 03-04 checkpoint (see `overrides` above). |

**Score:** 5/5 truths verified (3 verified outright, 2 verified via recorded developer override, all 5 with independently reproduced evidence — nothing taken from SUMMARY.md claims alone).

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `cats-vs-mechs.html` `[S02]` `turnsToWipe`/`soakTotal` | Pure derivation, two bounds, refusal on divisor | ✓ VERIFIED | Read directly at `:1274-1329`. Refusal is on `perTurn`/`hit` (the divisor), not the result — matches D-02/D-03/D-04's documented reasoning and REVIEW.md's own deliberate-breakage proof. |
| `cats-vs-mechs.html` `[S06.3]` `syncProjection`/`projPanel`/`turnsText`/`workLines` | Strip rendering, CR-01's singular-noun fix | ✓ VERIFIED | Read directly at `:3920-4070`. Singular branch (`r.fast === r.slow && r.fast === 1`) present exactly as REVIEW-FIX.md describes for `fc89c7b`. |
| `cats-vs-mechs.html` `[S01]` `REFERENCE` constant | `{ effects, beats }`, frozen, names-only, two beats pairs | ✓ VERIFIED | Read directly at `:1165-1177`. Matches `03-04-SUMMARY.md`'s `## THE APPROVED COPY` byte for byte: 5 `{id,name}` effect records, 2 `{over,verb,under}` beats records. |
| `cats-vs-mechs.html` `[S06.4]` `#refband` / `buildRefBand` | Full-width band, "What beats what" heading | ✓ VERIFIED | Read directly at `:4131-4167`; heading string `'What beats what'` confirmed. |
| `cats-vs-mechs.html` `[S06.1]` `refCard`/`refActions`/`effectChip` | Action cards in-column with attached effect chips | ✓ VERIFIED | Read directly at `:3048-3142`; wired into `buildColumn` at `:3185-3187`. |
| `tests/selftest-node.cjs` three-layer PROJ-06 gate + checks 47-63b | Mechanical no-verdict enforcement | ✓ VERIFIED (with a judged, accepted trade — see below) | Read directly at `:87-340` (Layers A/B) and `:2742-2833` (Layer C). Counts match REVIEW-FIX.md exactly: Layer A 16, Layer B 23, Layer C 39/135. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `projPanel` figures | `App.model.turnsToWipe` | called live inside `syncProjection` on every render frame | ✓ WIRED | No stored/cached value (D-00b) — confirmed by reading the call site at `:4059`, resolved via `App.model.*` at call time. |
| `refCard` effect chips | `App.data.REFERENCE.effects` | `effectRecord()` `Array.find` by id | ✓ WIRED | Both directions asserted (gate check 60) and independently reproduced passing. |
| `#refband` lines | `App.data.REFERENCE.beats` + `App.data.DEFAULTS[side].actions[].name` | `beatsLine()` / `actionNameById()` | ✓ WIRED | Read directly at `:4131-4149`; action names read live from `DEFAULTS`, not duplicated into `REFERENCE`, so a rename travels automatically. |
| Reference cards (`refCard`) | interaction/dispatch layer | **must NOT be wired** — cards must carry no `data-act`/`data-k` | ✓ CONFIRMED NOT WIRED | Gate check 63b walks the **rendered DOM** (not source text) for `act`/`k`/`amt`/`lbl`/`albl` on every card and descendant. **Independently reproduced**: planted `setData(card, {act:'nudgeMaxHp', ..., k:'mechs/m1/maxHp'})` in a scratch copy of `refCard` — 63b failed and named exactly the injected keys (`ref-card/act`, `ref-card/k`, `ref-card/amt`) while all 412 Node rows and checks 1-63 stayed green, proving 63b is the check that actually catches this class of regression (WR-01's fix, verified by mutation rather than trusted from the report). |
| `#strip` / `#refband` regions | sync()/keyed() silent-failure attributes (`data-k`, `data-amt`, `.brd-value`, `.brd-line--opt`) | **must NOT be present** | ✓ CONFIRMED NOT WIRED | Gate check 56b walks both regions' `.dataset` for the four forbidden markers. **Independently reproduced**: added `k: 'mechs/m1/maxHp'` to the turns figure's `setData` call in a scratch copy — 56b failed and reported it, while all other checks (including the narrower check 63) stayed green, confirming WR-02's fix actually closes the hole the review found. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| `#strip` figures (`prj-turns`, `prj-work`, `prj-soak`) | `r` (`turnsToWipe` result) | `App.model.turnsToWipe(state.build[side], state.build[foe])`, called fresh every `syncProjection` pass | Yes — driven by live `state.build`, not a static/default fallback; test rows 51 and 52b prove the figure actually changes when the allocation changes | ✓ FLOWING |
| `#refband` lines | `App.data.REFERENCE.beats` | Frozen module-level constant, read directly, no fetch/derivation | Yes — static by design (D-00b/D-12 apply to reference material, not build state) | ✓ FLOWING (static-by-design, not a stub — REF-01/REF-02 do not require this to be dynamic) |
| Reference action cards | `App.data.DEFAULTS[side].actions` | Frozen board data, **not** `state.build[side].actions` | Yes today; WR-05 (fixed, `783b044`) added the tripwire for the day Phase 4 lets a build code diverge the two | ✓ FLOWING, with a documented future tripwire rather than a live gap |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Node assertion suite (no DOM) | `node tests/selftest-node.cjs` | `412 passed, 0 failed`; `interaction gate: 66 of 66 checks passed` | ✓ PASS (independently run, matches REVIEW-FIX.md's claimed 412/66) |
| Full in-file suite with a lifted stub DOM (`Event`/`MouseEvent`/`KeyboardEvent` supplied, `App.selftest.run()` called directly) | Custom `vm`-based runner built for this verification, lifting `makeStubDom()` at run time per the phase's own coverage instructions | `TOTAL 520, passed 520, failed 0`; by-suite breakdown `projection: 54, reference material: 36` (others unchanged) | ✓ PASS (independently run — the total was asserted, not just `failed===0`, per this phase's own stated discipline) |
| PROJ-06 acceptance greps | `grep -ci "counter\|rating\|balanced\|difficulty"` / `grep -c "verdict\|balanced\|rating\|difficulty"` | `0` / `0` | ✓ PASS |
| Single-script / single-style / no-absolute-URL invariants | `grep -c "<script"`, `grep -c "<style"`, `grep -ci "https\?://"` | `1` / `1` / `0` | ✓ PASS |
| WR-01 mutation (live-stepper reference card) | Planted `setData(card,{act,step,side,unit,amt,k})` in `refCard` on a scratch copy, re-ran `node tests/selftest-node.cjs` | `65 of 66` — only 63b fails, naming the injected keys | ✓ PASS (proves the fix, not just the claim) |
| WR-02 mutation (`data-k` on `#strip` figure) | Added `k:'mechs/m1/maxHp'` to the turns figure's `setData` on a scratch copy, re-ran the harness | `65 of 66` — only 56b fails | ✓ PASS (proves the fix, not just the claim) |
| Git working tree after all scratch mutations | `git status --short` | empty | ✓ PASS — no verification side effects leaked into the repo |

### Probe Execution

Step 7c: SKIPPED — no `scripts/*/tests/probe-*.sh` files exist in this repository (`find . -path '*/tests/probe-*.sh'` returned nothing), and this is not a migration/tooling phase in the sense the probe convention targets. `tests/selftest-node.cjs` is this project's equivalent runnable gate and was executed directly (see Behavioral Spot-Checks above).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|--------------|------------|--------------|--------|----------|
| PROJ-01 | 03-02 | eHP / time-to-wipe projection, updates with allocation | ✓ SATISFIED | Truth 1 above |
| PROJ-02 | 03-02 | Range in fight's own unit, never abstract, never decimal | ✓ SATISFIED | Truth 1 above; `soakTotal`/`turnsToWipe` integer-only, `Math.ceil` throughout |
| PROJ-03 | 03-03 | Arithmetic visible on screen | ✓ SATISFIED | Truth 2 above |
| PROJ-04 | 03-03 | Permanent list of what's ignored | ✓ SATISFIED | Truth 3 above |
| PROJ-06 | 03-01 (+ fix WR-03) | No verdict anywhere on the rendered page | ✓ SATISFIED, with a documented residual gap in the source-level gate — see judgement below | Truth 4 above |
| REF-01 | 03-04, 03-05 | Counter map visible as reference material | ✓ SATISFIED (2 of 3 relationships, developer-approved override) | Truth 5 above, `overrides` entry 1 |
| REF-02 | 03-04, 03-05 | Effect cards on the actions that carry them | ✓ SATISFIED | Truth 5 above; both-directions coverage at gate check 60 |

No orphaned requirements: REQUIREMENTS.md maps exactly PROJ-01/02/03/04/06 and REF-01/02 to Phase 3, matching the phase's declared requirement IDs. PROJ-05 and REF-03 are correctly deferred to Phase 5 (both `state.md`/roadmap and REQUIREMENTS.md agree) and are out of this phase's scope by design.

### Anti-Patterns Found

None. `grep -inE "TBD|FIXME|XXX|HACK|PLACEHOLDER"` over `cats-vs-mechs.html` returns only three benign hits, all legitimate prose (`// placeholder line on the first frame`, a comment about a student-facing placeholder *name*, and one more of the same kind) — none is a debt marker referencing incomplete work. No `console.log`-only handlers, no `return null`/`return {}` stubs in any Phase 3 code path, no hardcoded-empty props feeding the projection or reference regions.

### Judgement Called Out: PROJ-06's Layer A/B/C Trade (WR-03)

This is the project's stated central risk, so it gets the most scrutiny here rather than the least.

**What changed:** WR-03 narrowed Layer A (the whole-document scan, covering CSS and comments) from 29 words to 16, moving 13 comparative adjectives (`stronger`, `weak`, `better`, `advantage`, `favoured`, `superior`, `inferior`, `dominat`, `optimal`, `fair`, plus a few more) into `VERDICT_LITERAL_WORDS`, which Layer B checks only against **string literals** in the script block, and which Layer C (the rendered-page walk) still concatenates and checks against **every string that actually reaches `#app`**.

**Independently confirmed against source** (not taken from the fix report): `VERDICT_WORDS` at `tests/selftest-node.cjs:122-152` has exactly 16 entries; `VERDICT_LITERAL_WORDS` at `:283-306` has exactly 23; Layer C's `RENDERED_VERDICT_WORDS = VERDICT_WORDS.concat(VERDICT_LITERAL_WORDS)` (`:2779`) is 39, matching the printed `scan: 135 rendered strings read from #app (Layer C, 39 words)` in this session's own run.

**What the trade actually gives up:** the CSS block and static markup outside the script block (`#err-panel`, `<dialog>`) are no longer scanned for the 13 moved words. **What it does not give up:** any of those 13 words reaching an actual rendered string on the page (Layer C still catches that), or reaching a JS string literal anywhere in the script (Layer B still catches that). A verdict feature that communicates to a student has to put a word or a colour where a student can see it; a colour-only verdict would evade all three layers regardless of this trade (word-based gates cannot see colour), and a text-only verdict is still caught by Layer C. The narrowed hole is specifically: a CSS class *name* like `.stronger-side` with no matching literal and no rendered word, sitting purely in the stylesheet or in a comment. That is a source-hygiene gap, not a rendered-verdict gap, and D-15's separate discipline (colour restricted to the four neutrals in `[C11]`, checked directly against the stylesheet in this session) is the actual backstop against a colour-coded verdict, independent of the word gate.

**Verdict on the trade:** reasonable and adequately defended for the criterion as written ("reading the rendered page top to bottom, a student cannot find..."), because Layer C is unweakened and is the layer that speaks directly to that criterion's wording. It is a real, explicitly-documented narrowing of the *earliest possible warning* (a CI failure on a comment or CSS class before any copy exists), not a narrowing of what a student can actually see. The fix's own header offers a one-commit revert (`8bb40f1`) if the developer wants the stricter, noisier version back — this verifier does not recommend reverting it, but flags it below as worth a conscious developer decision rather than a silent acceptance.

## Human Verification Required

See YAML frontmatter `human_verification` for the structured form. Three items, all converging on Success Criterion 2's "readable" clause and the projector-legibility concern this project's own CLAUDE.md names as an unresolved gap:

### 1. Glyph rendering and line-wrap in a real browser

**Test:** Open `cats-vs-mechs.html` by double-click in Chrome/Edge/Firefox and read the strip's arithmetic lines and the "What beats what" band.
**Expected:** `≈`, `÷` and `–` (en dash, not a hyphen) render as intended; a long work line wraps rather than overflowing or scrolling inside the narrow strip (D-10).
**Why human:** No browser or layout engine exists in this environment; the automated harness only proves the correct characters reach the correct DOM node, not how they paint.

### 2. Sticky strip on a short viewport

**Test:** Resize the browser window shorter (or use a small laptop screen) and scroll the board.
**Expected:** `#strip` continues to stick under the topbar; content taller than the available space does not silently stop sticking.
**Why human:** Named explicitly as unreviewable in `03-REVIEW.md`'s closing note — no layout engine is available to measure this.

### 3. Projector legibility of the shipped teaching example

**Test:** View the artifact on an actual projector or a large shared screen from normal classroom distance, focusing on the `≈9 turns to wipe Mechs` / `≈3 turns to wipe Cats` contrast and the reference band.
**Expected:** Both are legible without an instructor needing to narrate the numbers.
**Why human:** Explicitly named as an empirical, rehearsal-only question in both this phase's own gate comments and in the project's `CLAUDE.md` Gaps section.

## Gaps Summary

No blocking gaps. Both deviations from the roadmap's literal wording (three counter-map relationships; effect-card descriptive text) are developer-approved, checkpoint-recorded decisions from the 03-04 blocking checkpoint, not oversights — they are carried as `overrides` above rather than as `gaps`, per this phase's explicit developer decisions. The one judgement call worth a developer's conscious sign-off (rather than silent inheritance) is the WR-03 Layer A narrowing, discussed above — it is not a gap, but it is a real trade and the fix's own commit message says as much.

Three items need a human with a real browser and, ideally, a projector: glyph/line-wrap rendering, sticky behaviour on a short viewport, and projector legibility of the shipped teaching example. None of these were fabricated for this report — all three are named as gaps in the phase's own review, its own gate comments, or the project's CLAUDE.md.

---

_Verified: 2026-08-28_
_Verifier: Claude (gsd-verifier)_
