---
phase: 02-allocation-surface
verified: 2026-08-27T18:03:07Z
status: passed
score: 5/5 roadmap truths code-verified; 2 rest on unrecorded human observation
overrides_applied: 0
re_verification:
  previous_status: gaps_found
  previous_score: "3/5 roadmap truths verified, 2 partial/failed"
  gaps_closed:
    - "A student can set any unit's health/AP with steppers, delta typing, or arrow keys — and the token rows AND the focused field reflect it immediately (CR-02: showFieldValue() now writes the focused field after every arrow-key step; setValue()'s D-19 activeElement guard is unchanged)."
    - "A structural rebuild (add/remove/reset/start-fight/end-fight) leaves the page in sync with state (CR-01/WR-01: all five shape-changing ops now route through commitStructural(), confirmed at cats-vs-mechs.html:1335-1338 and its five call sites)."
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Twenty rapid clicks on a stepper produce exactly twenty value changes, hand-counted on a real screen (ROADMAP criterion 4 / ALLOC-07)."
    expected: "The value moves exactly twenty, no more, no fewer."
    why_human: "The automated gate now proves the mechanism at 27/27, including the new non-primary-button guard (check 20) and Enter key-repeat suppression (check 22), but still cannot see an input dropped by a real browser under a real finger. Never recorded as a number — the developer approved Task 3 in aggregate (02-03-PLAN.md's acceptance_record); gap G-02-A, tracked in REQUIREMENTS.md."
  - test: "Projector legibility at the back of a room, including the widened sticky topbar/strip from WR-09 (criterion 5 / UX-02 / Q-4)."
    expected: "Tokens are countable, 24px/700 readouts are legible, remove control is visible-but-not-shouting at --tok:22px, and the sticky strip no longer collides with a wrapped or widened topbar."
    why_human: "No browser and no physical display exist in this environment. --tok remains at the shipped 22px, unrecorded (gap G-02-B, tracked in REQUIREMENTS.md). WR-09's fix (dynamic --topbar-now measurement + matched topbar/board width) resolves the code-level mismatch the prior verification flagged as a concrete risk, but the fix itself is explicitly flagged 'requires human verification' in 02-REVIEW-FIX.md — the CSS consequences are unexecuted without a layout engine."
  - test: "Non-primary mouse buttons (right-click, middle-click) on a stepper or picker swatch produce no context-menu/ramp interaction glitch in a real browser (WR-03, feeds ALLOC-07's 'no dropped/extra input' spirit)."
    expected: "Right-click opens the context menu with no value change and no ramp start; middle-click does not trigger browser autoscroll while a ramp is armed."
    why_human: "isPrimaryPress() now rejects button!==0 at both delegated roots (gate checks 20-21 confirm the guard fires), but what a real browser does with pointerup under an open context menu, and Chrome's middle-click autoscroll, are unexecuted — no browser in this repo. Flagged 'requires human verification' in 02-REVIEW-FIX.md."
  - test: "Holding Enter on a focused button (especially Undo) does not repeat at the OS key-repeat rate in a real browser (WR-04, feeds ALLOC-07)."
    expected: "A held Enter on Undo/Add/Remove/a stepper fires once, not at the OS auto-repeat rate."
    why_human: "The keydown-level e.repeat guard is proven by gate check 22 (ten repeated keydowns move undoDepth by zero), but that Chrome actually synthesizes click per repeated Enter keydown, and that preventDefault() on that keydown withholds the click, are spec-documented and unexecuted here — the stub does not synthesize clicks from keydowns. Flagged 'requires human verification' in 02-REVIEW-FIX.md."
  - test: "The recovery panel is reachable while a modal <dialog> (e.g. the token picker) would otherwise be open, in a real browser (WR-07, protects D-15's one-click recovery)."
    expected: "An error raised while the picker is open closes the picker and shows a clickable, focusable recovery panel — not one rendered inert underneath the dialog's top layer."
    why_human: "closeModals() now runs at the top of fail() and gate check 24 confirms the dialog closes and the panel is reachable in the stub DOM, but the top-layer/inert semantics that made this a defect in the first place are real-<dialog> browser behavior, unexecuted without a browser. Flagged 'requires human verification' in 02-REVIEW-FIX.md."
---

# Phase 2: Allocation Surface Verification Report

**Phase Goal:** A student can build both rosters on screen — setting health and action points
with steppers, adding and removing units — and the display holds up under rapid live operation
**Verified:** 2026-08-27
**Status:** passed
**Re-verification:** Yes — after code-review fix pass (10 atomic commits closing 11 findings)

## Human Verification Outcome (recorded 2026-08-27)

All five outstanding human-observation items were subsequently exercised and are recorded in
`02-HUMAN-UAT.md` (status: complete, 5 passed / 0 issues / 0 pending).

Four were closed with real-browser evidence rather than stub proofs:

- **G-02-A** — twenty real browser clicks moved the value **exactly 20**, with a `commits` delta of
  exactly 20. The hand-count criterion 4 is phrased around now exists as a number.
- **WR-03** — a real right-click produced zero commits, no armed ramp and no error panel.
- **WR-04** — a `repeat: false` keydown left `defaultPrevented` false while `repeat: true` keydowns
  came back true, which is the documented mechanism that withholds the synthesised click. Measured
  in Chrome rather than reasoned from spec.
- **WR-07** — the picker opened as a true `:modal`; an error through the real `wrap()` boundary
  closed it, and `elementFromPoint` proved the recovery panel was the topmost hittable element
  rather than inert beneath the dialog's top layer. Dismiss recovered and the page kept committing.

**G-02-B (projector legibility) was closed by the developer's aggregate observation** — they viewed
the artifact on a real display and approved it — **without an itemised display, viewing distance or
re-confirmed `--tok` value.** `--tok` remains the shipped `22px`; no change was requested. This is
recorded as a human pass, not a measurement, and the distinction only matters if the artifact is
later shown in a materially larger room, where `--tok` and `--tok-gap` in `[C00]` are the two
numbers to turn.

Two sub-items rode along inside that same aggregate approval rather than being reported separately:
Chrome's middle-click autoscroll, and a physically held Enter at the OS repeat rate.

## Goal Achievement

This is a re-verification. The prior run (2026-08-27, stale, superseded) returned `gaps_found` on
two partial truths driven by CR-01 and CR-02. A code-review fix pass has since landed. This
verification re-derives every truth from the current codebase — it does not trust
02-REVIEW-FIX.md's narrative, and does not treat the prior VERIFICATION.md's gaps as current.

### Regression check: did the fix pass touch anything it shouldn't have?

`node tests/selftest-node.cjs` was re-run directly in this session (not narrated from
SUMMARY/REVIEW-FIX): **145 passed, 0 failed** (baseline claimed: 145/0 — confirmed exact match),
**stub-drift gate: 28 shell ids, all built by the stub page** (a new hard, bidirectional gate that
did not exist at prior verification), **interaction gate: 27 of 27** (baseline claimed: 27/27 —
confirmed exact match). All ten fix commits (`cad9c9d`, `2386376`, `df791ba`, `bbc963e`, `2937d49`,
`870f06e`, `ae75d0c`, `a145846`, `399ef0d`, `b6c7119`) exist in `git log`, matching 02-REVIEW-FIX.md's
claims. No regressions found.

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | Steppers, delta typing and arrow keys set unit health/AP; token rows AND the focused field reflect it immediately | ✓ VERIFIED (was PARTIAL) | CR-02 closed. `showFieldValue()` (cats-vs-mechs.html:2555-2567) writes `el.value` and `dataset.was` after every arrow-key nudge, reading back through the newly exported `App.render.amountFor` (confirmed present at line 2277 and called at line 2559) rather than duplicating the clamp math. `setValue`'s D-19 activeElement guard is unchanged at line 2000-2002, confirmed by direct read, as instructed — it still refuses to overwrite a field mid-type. New gate check 16 exercises exactly this path and passes; it is documented to fail against the pre-fix source. |
| 2 | Board vocabulary (4 shapes/colours) on screen; rows compact instead of overflowing | ✓ VERIFIED (unchanged) | Untouched by the fix pass. `App.data.DEFAULTS.tokens` (5 entries incl. `dead`), `COMPACT_AT` export, and gate check 5 (delta-only row growth) all still present and passing. |
| 3 | Add/remove on either side, AND every structural rebuild (reset, start/end fight), leaves the roster in sync with state without losing scroll position or the keyboard focus ring | ✓ VERIFIED (was PARTIAL) | CR-01/WR-01 closed. All five shape-changing ops (`addUnit`, `removeUnit`, `resetToDefaults`, `startFight`, `endFight`) now route through one `commitStructural(label, mutator)` helper (cats-vs-mechs.html:1335-1338) that always follows the commit with `invalidate({structural:true})` — confirmed by reading all five call sites directly (lines 1361-1363, 1383-1385, 1439-1440, 1457-1458, 1474-1479). New gate checks 14 (resetToDefaults card count) and 15 (startFight/endFight roster chrome) both pass and are documented to fail against the pre-fix source. The ghost-card reproduction path the prior verification walked by hand is now closed at its root cause, not patched around it. |
| 4 | Twenty rapid clicks = twenty changes; hold ramps; no animation restart, no focus jump, no dropped input | ✓ MECHANISM VERIFIED / ? HUMAN COUNT OUTSTANDING | Automated coverage grew substantially: 27/27 gate checks now include the original 20-pointerdown-to-20-commits proof (checks 1-2) plus new guards this fix pass added — non-primary-button rejection (checks 20-21, WR-03) and Enter key-repeat suppression (check 22, WR-04), both of which close code-level gaps the prior verification's mechanism proof did not cover. The hand-counted number the roadmap sentence is phrased around (G-02-A) was never recorded — the developer approved Task 3 in aggregate, not itemized (see `02-03-PLAN.md`'s `<acceptance_record>`). Unchanged from the prior verification; not something a code-review fix pass can close. |
| 5 | Legible on a projector at the back of a room; nothing hover-only; reads as a sibling of `game-feel-study-guide.html` | ✓ CODE HALVES VERIFIED / ? PROJECTOR-DISTANCE OUTSTANDING | Hover-only and sibling-palette halves unchanged and still verified in code (`grep -ci "hover .unit-rm\|hover .brd-rm"` = 0; no new hex colours; shared `:root` tokens reused). WR-09 additionally closed a concrete layout risk the prior verification flagged: `#topbar`'s sticky offset is no longer a hardcoded `--topbar-h` fighting a wrapping cluster — `[S08]` now measures the bar via `ResizeObserver` and publishes `--topbar-now` (cats-vs-mechs.html:3151-3171), which `#strip` reads with a fallback (line 151); `#topbar` now carries the same width/margin treatment as `#board` (per 02-REVIEW-FIX.md, confirmed the custom property exists and is wired). New gate check 26 exercises the publish-and-republish path and passes. The projector-distance observation itself (G-02-B) was never recorded — `--tok` remains the shipped 22px, confirmed only by absence of a change request. WR-09's own fix report explicitly flags itself "requires human verification" since there is no layout engine in this repo. |

**Score:** 5/5 roadmap truths hold at the code level (both previously-partial truths are now fully
closed by the fix pass, confirmed by direct source reading, not by trusting the fix report). 2 of
5 truths (criteria 4 and 5) additionally depend on a human observation that has never been
recorded, unrelated to and unmoved by this fix pass — carried forward, not newly discovered here.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `cats-vs-mechs.html` — `commitStructural(label, mutator)` | Single spelling of the structural-frame rule | ✓ VERIFIED | Defined once (line 1335-1338), five consumers confirmed by direct grep of all five call sites. |
| `cats-vs-mechs.html` — `showFieldValue(el)` | Field-local write for the arrow-key path | ✓ VERIFIED | Defined at line 2555-2567; called from `nudgeField` (line 2575); reads via `App.render.amountFor`, confirmed exported at line 2277. |
| `cats-vs-mechs.html` — `App.render.amountFor` | New public surface enabling the field-local write without duplicating clamp math | ✓ VERIFIED | Exported at line 2277; single external caller (`showFieldValue`), confirmed by grep. |
| `cats-vs-mechs.html` — `setValue()` D-19 guard | Must remain unchanged (explicit instruction) | ✓ VERIFIED UNCHANGED | `if (node !== document.activeElement) { node.value = String(n); }` at line 2000-2002, byte-identical in intent to the prior verification's citation. |
| `tests/selftest-node.cjs` — `KNOWN_IDS` / stub-drift gate | Hard, bidirectional id-coverage gate closing WR-02 | ✓ VERIFIED | `KNOWN_IDS` grew to 28 entries including all six picker ids (lines 182-193); a separate stub-drift gate (line ~491-521) fails the run in either direction; confirmed passing in this session's direct re-run ("stub-drift gate: 28 shell ids, all built by the stub page"). |
| `cats-vs-mechs.html` — `isPrimaryPress(e)` | Non-primary pointer guard (WR-03) | ✓ VERIFIED | Defined line 2654-2656; used at both delegated roots, `onPointerDown` (line 2663) and `onPickerPress` (line 2926). |
| `cats-vs-mechs.html` — Enter/Space repeat guard (WR-04) | Drop OS key-repeat before it becomes a click | ✓ VERIFIED | `if (e.repeat === true && (e.key === 'Enter' || e.key === ' '))` at line 2737, scoped by `actTarget(e)` returning null for INPUT/TEXTAREA per 02-REVIEW-FIX.md's description; confirmed present. |
| `cats-vs-mechs.html` — `closeModals()` (WR-07) | Close any open dialog before raising the recovery panel | ✓ VERIFIED | Defined line 3070-3082 (queries all `dialog` elements generically, not `tok-picker` by name); called first inside `fail()` at line 3087. |
| `cats-vs-mechs.html` — `FIELD_OPS` / `fieldOp()` (WR-08) | One table for both the absolute and delta field directions | ✓ VERIFIED | Defined line 2522-2534; both `applyField`'s absolute path and `nudgeField`'s delta path now read through `fieldOp()`. |
| `cats-vs-mechs.html` — `setTokenStyle` no-op guard (WR-06) | Same-value swatch press commits nothing | ✓ VERIFIED | Comparison logic present at line ~1539-1551 per direct read; three new suite rows confirmed in the 145-assertion run. |
| `cats-vs-mechs.html` — `--topbar-now` / `ResizeObserver` (WR-09) | Measured sticky offset instead of a hardcoded one | ✓ VERIFIED | `publishTopbarHeight` sets the custom property (line 3159); `ResizeObserver` wired at line 3166-3167; `#strip` reads `top:var(--topbar-now, var(--topbar-h))` at line 151; new gate check 26 passes. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `addUnit`/`removeUnit`/`resetToDefaults`/`startFight`/`endFight` | structural frame | `commitStructural()` | ✓ WIRED | All five call sites confirmed directly; previously only 2 of 5 were wired (CR-01). |
| Arrow-key path (`nudgeField`) | focused field display | `showFieldValue()` | ✓ WIRED | Previously not wired at all (CR-02); confirmed at line 2569-2577. |
| Both delegated pointer roots | non-primary press rejection | `isPrimaryPress()` | ✓ WIRED | Confirmed at both `onPointerDown` and `onPickerPress`. |
| `onKeyDown` | key-repeat suppression | `e.repeat` check scoped to actionable buttons | ✓ WIRED | Confirmed line 2737; field inputs excluded via `actTarget` returning null. |
| `fail()` | recovery-panel reachability | `closeModals()` | ✓ WIRED | Confirmed called first inside `fail()`. |
| `applyField`/`nudgeField` | dispatched op | `fieldOp()` via `FIELD_OPS` | ✓ WIRED | Both directions now share one table; previously only the delta direction was allowlisted (WR-08). |
| `[S08]` boot | `#strip`'s sticky offset | `ResizeObserver` → `--topbar-now` | ✓ WIRED | Confirmed publish-and-observe chain; gate check 26 exercises republish on resize. |
| `UI_ACTS`/`routeUi` | `UI_HANDLERS.openTokenPicker` | UI-only act seam | ✓ WIRED (unchanged) | Confirmed; `case 'openTokenPicker'` count in `[S05]` dispatch remains 0. |
| Node stub's `KNOWN_IDS` | real `[S06.2]`/`[S07.2]` picker code paths | stub now builds a `<dialog>` stand-in | ✓ WIRED (was NOT WIRED) | Previously the entire picker path was skipped by the gate (WR-02); now checks 17-19 execute it for real, plus the stub-drift gate makes future silent-skip regressions a hard failure. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| Token rows (`.tok-row`) | `state.build[side].units[i].maxHp/shield`, `state.build[side].ap` | `App.state.get()` read at render time in `sync()` | Yes — live every frame | ✓ FLOWING (unchanged) |
| Stepper numeric field (`.stp-field`) | same as above, plus arrow-key deltas | `setValue()` when unfocused; `showFieldValue()` when focused after an arrow-key nudge | Yes in both branches now — the focused-field gap is closed | ✓ FLOWING (was ⚠️ STATIC while focused) |
| Picker swatch grids | `App.data.SHAPES/COLORS/GLYPHS` + `state.build.tokens[tokenId]` | `App.render.picker()`, now exercised end-to-end by the stub | Yes — confirmed by executing gate checks 17-18, not just by code inspection | ✓ FLOWING (was "per code inspection only; gate did not exercise the read") |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Self-test suite runs clean | `node tests/selftest-node.cjs` (re-run live in this session) | `145 passed, 0 failed`; `interaction gate: 27 of 27 checks passed`; `stub-drift gate: 28 shell ids, all built by the stub page` | ✓ PASS |
| `commitStructural` is the single spelling, five consumers | `grep -n "function commitStructural" -A 3` + grep of all five ops | one definition, five confirmed call sites | ✓ CONFIRMS CR-01/WR-01 fix |
| `showFieldValue` writes the focused field | `sed -n` of lines 2555-2577 | writes `el.value` and `dataset.was`, reads via `App.render.amountFor` | ✓ CONFIRMS CR-02 fix |
| D-19 guard in `setValue` untouched | `sed -n` of lines 2000-2002 | `if (node !== document.activeElement)` still present | ✓ CONFIRMS instruction honored |
| Stub-drift gate is a hard, bidirectional gate | `grep -n "STUB DRIFT"` | two fail() branches, one per direction | ✓ CONFIRMS WR-02 fix |
| No CLAUDE.md-forbidden patterns introduced | `grep -n 'type="module"\|fetch(\|XMLHttpRequest\|new Function\|eval(\|import('` | zero matches | ✓ PASS |
| No debt markers | `grep -n "TBD\|FIXME\|XXX"` | zero matches | ✓ PASS |
| Acceptance greps still at zero | `counter\|rating\|balanced\|difficulty`, `https?://`, `case 'openTokenPicker'` | all zero | ✓ PASS |
| Single script/style block maintained | `grep -c "<script"` / `grep -c "<style"` | 1 / 1 | ✓ PASS |
| All ten fix commits present in history | `git log --oneline` | `cad9c9d 2386376 df791ba bbc963e 2937d49 870f06e ae75d0c a145846 399ef0d b6c7119` all present | ✓ PASS |

### Probe Execution

No `scripts/*/tests/probe-*.sh` files exist in this repo. `tests/selftest-node.cjs` is the
project's own equivalent and was re-run directly in this session (not substituted with narration
from SUMMARY.md or 02-REVIEW-FIX.md) — see Behavioral Spot-Checks above for the exact output.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| ALLOC-01 | 02-02 | Set unit health with +/− steppers | ✓ SATISFIED | Unchanged; stepper markup + `nudgeMaxHp` op + suite. |
| ALLOC-02 | 02-02 | Set faction AP pool with +/− steppers | ✓ SATISFIED | Unchanged; `nudgeAp` op wired identically. |
| ALLOC-03 | 02-01/02-02 | Delta typing and arrow-key adjustment | ✓ SATISFIED (was PARTIAL) | CR-02 closed — the focused field now shows the result of every arrow-key step. |
| ALLOC-04 | 02-01 | Token vocabulary as data, board's 4 shapes/colours | ✓ SATISFIED | Unchanged. |
| ALLOC-05 | 02-01 | Compaction above readable threshold | ✓ SATISFIED | Unchanged. |
| ALLOC-06 | 02-02 | Add/remove units either side | ✓ SATISFIED | Unchanged (was already satisfied); now additionally protected by `commitStructural`. |
| ALLOC-07 | 02-01/02-02 | Rapid clicks register exactly, no lost focus/scroll/animation restart | ⚠️ MECHANISM SATISFIED, human count still missing | Gate now 27/27, including two new guards (WR-03, WR-04) that harden this requirement's "no dropped/extra input" half. Human hand-count (G-02-A) still never recorded — unchanged by this fix pass. |
| ALLOC-09 | 02-03 | Edit token appearance from UI | ✓ SATISFIED (was "satisfied w/ coverage gap") | WR-02 closed — the picker path is now genuinely exercised by the gate (checks 17-19), not vacuously passing. Growing the coverage surfaced no new failures; the underlying feature was already correctly wired. |
| UX-02 | 02-01/02-02/02-03 | Legible on projector, nothing hover-only | ⚠️ CODE HALVES SATISFIED, projector-distance still missing | Hover-only half fully verified in code (unchanged). WR-09 closed the concrete layout risk (sticky-offset/board-width mismatch) the prior verification flagged, but the projector-distance observation itself (G-02-B) was never recorded and this fix pass does not and cannot close that. |
| UX-05 | 02-01 | Matches sibling artifacts' palette/tokens | ✓ SATISFIED | Unchanged. |

No orphaned requirements found — all Phase 2 requirement IDs (ALLOC-01…07, ALLOC-09, UX-02, UX-05)
appear in at least one plan's `requirements:` frontmatter and are addressed above.

### Anti-Patterns Found

None reachable through shipped UI. The two prior blockers (CR-01, CR-02) are closed. The one prior
warning that materially affected phase-goal confidence (WR-02's inert gate) is closed. Five
warning-level findings closed with the fixer's own honest caveat "requires human verification"
(WR-03, WR-04, WR-07, WR-09 — four of these; WR-05, WR-06, WR-08 closed clean) — these do not rise
to blocker or warning severity here because the *guard* each protects is executed and passing; only
the *platform behaviour it responds to* (real browser context-menu interaction, OS key-repeat
click synthesis, `<dialog>` top-layer semantics, CSS layout) is unexecuted, which is a property of
this environment (no browser, no Playwright installed) rather than a defect in the fix. They are
carried forward as human-verification items, not anti-patterns.

No `TBD`/`FIXME`/`XXX` debt markers found in the modified file.

### Human Verification Required

### 1. Twenty rapid clicks, hand-counted

**Test:** Note a unit's health, click its `+` twenty times as fast as physically possible.
**Expected:** The value moves exactly twenty.
**Why human:** The automated gate proves the mechanism at 27/27 (up from 14/14; new checks close
the non-primary-button and Enter-repeat gaps this fix pass targeted) but still cannot see a real
browser drop or double-fire an input under a real finger. Never itemized — the developer approved
Task 3 in aggregate (G-02-A, tracked in `02-03-PLAN.md`'s acceptance_record and `REQUIREMENTS.md`).
Unmoved by this fix pass.

### 2. Projector legibility from the back of the room

**Test:** Put the file on the actual workshop display; stand at the back; check token
countability, 24px/700 readout legibility, remove-control visibility at `--tok:22px`, and that the
sticky strip does not collide with the topbar after WR-09's dynamic-offset change.
**Expected:** All read clearly at the intended viewing distance; the sticky strip tracks the
topbar's actual height with no gap or overlap.
**Why human:** No display and no browser exist in this environment. Never recorded (G-02-B,
tracked). WR-09 closed the concrete CSS mismatch the prior verification flagged as a specific risk
to this check, but the fixer's own report flags the fix itself as "requires human verification" —
there is no layout engine in this repo to execute the CSS consequences.

### 3. Non-primary mouse buttons in a real browser

**Test:** Right-click a stepper's `+`/`−`; confirm no value change and no ramp starts, and the
context menu opens cleanly. Middle-click the same; confirm no autoscroll interaction with an armed
ramp. Repeat on a picker swatch.
**Expected:** Only left-click/primary-touch/pen contact ever changes a value or opens a menu.
**Why human:** `isPrimaryPress()` is proven by gate checks 20-21 (right-button press commits
nothing, starts no ramp), but real browser `pointerup`-under-open-context-menu timing and Chrome's
middle-click autoscroll are unexecuted — no browser in this repo. New since the prior verification;
introduced as a fix for WR-03, self-flagged "requires human verification" in `02-REVIEW-FIX.md`.

### 4. Held Enter on a button, especially Undo, in a real browser

**Test:** Focus the Undo button (or a stepper) and hold Enter down for several seconds.
**Expected:** Exactly one action fires, not a stream at the OS key-repeat rate.
**Why human:** Gate check 22 proves the `keydown`-level guard mechanically (ten repeated
`keydown{repeat:true}` events move `undoDepth()` by zero), but that a real browser actually
synthesizes `click` on each repeated Enter `keydown` — the platform behavior the guard exists to
suppress — is spec-documented and unexecuted; the stub does not synthesize clicks from keydowns.
New since the prior verification; self-flagged "requires human verification" in
`02-REVIEW-FIX.md`.

### 5. Error panel reachable while a modal dialog is open, in a real browser

**Test:** Open the token-appearance picker, then trigger an error (e.g. via DevTools or a crafted
state). Confirm the recovery panel is visible, focusable and clickable, not rendered inert behind
the dialog's top layer.
**Expected:** The picker closes automatically and the recovery panel is immediately usable.
**Why human:** `closeModals()` is confirmed to run first inside `fail()` and gate check 24 proves it
in the stub DOM, but the `<dialog>` top-layer/inert semantics that made this a defect in the first
place are real-browser behavior, unexecuted here. New since the prior verification; self-flagged
"requires human verification" in `02-REVIEW-FIX.md`.

### Gaps Summary

Both truth-level gaps from the prior verification are closed, confirmed by direct source reading
in this session (not by trusting 02-REVIEW-FIX.md's narrative):

1. **CR-02** (arrow-key field never showed the stepped value) is closed. `showFieldValue()` now
   writes the focused field after every arrow-key nudge, reading through the newly exported
   `App.render.amountFor`, and the D-19 activeElement guard in `setValue` is confirmed unchanged as
   instructed. New gate check 16 exercises exactly this and is documented to fail pre-fix.
2. **CR-01** (resetToDefaults/startFight/endFight omitted the structural frame) is closed by
   generalizing the rule into one `commitStructural()` helper with five confirmed call sites, not
   by patching `resetToDefaults` alone — this closes WR-01's latent Phase-5 risk in the same
   commit. New gate checks 14-15 exercise this and are documented to fail pre-fix.

WR-02 (the picker's own gate was inert) is also closed: `KNOWN_IDS` grew from 16 to 28 (all shell
ids, not just the six named in the review), a new bidirectional stub-drift gate makes future
silent-skip regressions a hard failure, and the picker path is now genuinely exercised (gate checks
17-19). Growing the coverage surfaced no new correctness failures in the underlying feature — it
was already correctly wired, just untested.

**What remains open is exactly what was already tracked before this fix pass and is unrelated to
it:** G-02-A (the twenty-click hand count) and G-02-B (projector legibility at the actual viewing
distance). Neither can be closed by a code-review fix pass — both require a physical rehearsal on
the actual workshop display, which is explicitly outside what this environment (no browser, no
physical display) can execute. This verification also surfaces four additional human-verification
items introduced by the fix pass itself (WR-03, WR-04, WR-07, WR-09) — each one's *guard* is
proven executing correctly by the automated gate, but each fixer's own report honestly flags that
the *real-browser platform behaviour* the guard responds to remains unexecuted. None of these five
items is a code defect; all are the same category of gap — this repository has no browser and no
physical display, and the fix pass has done everything a code-review cycle can do to reduce risk
in that gap without being able to close it.

**If the only things left open are human-observation items — which they are** — the next action is
a physical rehearsal on the actual workshop display, not another code plan. Recommend: run the
twenty-click count and record the number (G-02-A); put the file on the actual projector, stand at
the back, and record the display and distance (G-02-B); while at the rehearsal, also spot-check the
five items in this report's "Human Verification Required" section, since all five are already
mechanically proven and only need a real-browser confirmation, not new code.

---

_Verified: 2026-08-27T18:03:07Z_
_Verifier: Claude (gsd-verifier)_
