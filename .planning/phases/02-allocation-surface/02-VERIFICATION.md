---
phase: 02-allocation-surface
verified: 2026-08-27T00:00:00Z
status: gaps_found
score: 3/5 roadmap truths verified, 2 partial/failed
overrides_applied: 0
gaps:
  - truth: "A student can set any unit's health and either faction's shared action-point pool with +/− steppers, by typing a delta, or with arrow keys — and the token rows reflect it immediately."
    status: partial
    reason: >
      Token rows and the underlying state DO update immediately on every arrow-key press
      (syncRow/syncTokens do not check document.activeElement, so the roadmap sentence's literal
      subject — "the token rows reflect it immediately" — holds). But the numeric field the
      student is actively editing is a load-bearing part of "adjust it with arrow keys" and it
      never displays the result of an arrow-key step while focused (CR-02, reproduced at code
      level, independent of the missing browser). setValue() skips the active element by design
      (D-19, correct for typed input) and nudgeField() dispatches the op but never writes
      el.value — no code path writes the focused field after an arrow-key commit. Verified by
      reading cats-vs-mechs.html:1924-1926 (setValue) and 2388-2395 (nudgeField) directly. Net
      effect: a student pressing ArrowUp five times sees the tokens move but the field stays
      frozen at the pre-press value, self-correcting only on blur — and two further consequences
      follow directly from the same root cause (stale-value edits get appended and misparsed;
      Escape reverts the field to the wrong baseline while state stays changed). This is a real,
      reproducible defect in the "adjust it with arrow keys" mechanism ALLOC-03 promises, not a
      cosmetic issue — the artifact's whole subject is that the number and the picture agree, and
      here they visibly do not for as long as the field holds focus.
    artifacts:
      - path: "cats-vs-mechs.html"
        issue: "nudgeField() (~line 2388) dispatches the nudge op but never writes the focused field's displayed value; setValue()'s activeElement guard (line 1924) then correctly refuses to fix it on the next frame."
    missing:
      - "A field-local write in the arrow-key path (e.g. the showFieldValue() fix CR-02 proposes), so the focused field always shows the value it currently holds, with dataset.was kept in step for commitField/revertField."
  - truth: "A structural rebuild leaves the page scroll position and the focused element unchanged, and the roster rebuilds without losing scroll position or the keyboard focus ring — for every operation that changes the roster's shape."
    status: partial
    reason: >
      Verified TRUE for the two roster-shaping ops the roadmap criterion actually names: addUnit
      and removeUnit both call App.state.invalidate({structural:true}) (cats-vs-mechs.html:1339,
      1359), and the interaction gate's checks 5-7 mechanically prove delta-only token growth and
      deterministic focus landing after removing the focused unit's remove button. However,
      resetToDefaults() (line 1421-1426) replaces s.build wholesale — changing units.length back
      to the 9/3 defaults — without requesting a structural frame (CR-01, reproduced at code
      level: grep confirms no invalidate call in the function body). This is reachable through the
      shipped, student-facing error panel's "Reset to Workshop 16 defaults" button with no
      developer flags, and produces ghost/ghosted-away unit cards (page and state roster counts
      disagree) that stay interactive and throw a second error on the next click. It is not the
      literal add/remove flow the roadmap sentence names, but it is the same rendering contract
      (structure/sync split) failing under the same class of shipped, reachable UI action, and it
      leaves the board in a state a student cannot recover from except by reloading.
    artifacts:
      - path: "cats-vs-mechs.html"
        issue: "resetToDefaults() (line 1421-1426) omits App.state.invalidate({structural:true}) despite changing units.length, unlike addUnit/removeUnit which both call it."
    missing:
      - "App.state.invalidate({ structural: true }); appended to resetToDefaults(), matching the spelling addUnit/removeUnit already use (per CR-01's proposed fix)."
deferred: []
human_verification:
  - test: "Twenty rapid clicks on a stepper produce exactly twenty value changes, hand-counted on a real screen (ROADMAP criterion 4 / ALLOC-07)."
    expected: "The value moves exactly twenty, no more, no fewer."
    why_human: "The automated interaction gate proves the mechanism (14/14, including 20 synthetic pointerdown -> 20 commits) but cannot see an input dropped by a real browser under a real finger. Task 3's own acceptance criterion required this be recorded as a number; per the acceptance_record in 02-03-PLAN.md, the user approved in aggregate but no number was ever reported (gap G-02-A, already tracked in REQUIREMENTS.md/02-03-SUMMARY.md)."
  - test: "Projector legibility at the back of a room — can a row of ~7 tokens be counted, can the 24px/700 numeric readouts be read, is the remove control visible-but-not-shouting at --tok:22px (ROADMAP criterion 5 / UX-02 / Q-4)."
    expected: "All three are legible from the back of the actual workshop room on the actual display."
    why_human: "No browser and no physical display exist in this environment. Per the acceptance_record in 02-03-PLAN.md, the user approved in aggregate but the display used and viewing distance were never recorded (gap G-02-B, already tracked in REQUIREMENTS.md). --tok remains at the shipped 22px, confirmed only by absence of a change request, not by a recorded observation."
  - test: "The appearance picker opens with no error panel from both pointer and keyboard, and a restyle updates every token of that type on screen (ROADMAP criterion 2 / ALLOC-09, check 9)."
    expected: "Picker opens cleanly from both input methods; board follows a restyle."
    why_human: "Code-level inspection (this verification) confirms UI_HANDLERS.openTokenPicker, App.render.picker, and the setTokenStyle dispatch case all exist and are correctly wired, and the code reviewer independently reproduced the same behavior by hand-extending the Node stub with a <dialog>. But the shipped Node test harness's own gate is inert for this path (WR-02 — KNOWN_IDS was never grown for the six picker ids, so pickerDialog() returns null and checks 10/13 pass vacuously), and the human check-9 observation ('no error panel appeared') was never itemized in the aggregate approval. Real-browser <dialog> top-layer/modal semantics are also unexecuted (no browser in this repo)."
---

# Phase 2: Allocation Surface Verification Report

**Phase Goal:** A student can build both rosters on screen — setting health and action points
with steppers, adding and removing units — and the display holds up under rapid live operation
**Verified:** 2026-08-27
**Status:** gaps_found
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | Steppers, delta typing and arrow keys set unit health/AP; token rows reflect it immediately | ⚠️ PARTIAL | Token rows and state genuinely update on every input path (verified in code: `syncRow`/`syncTokens` never check `activeElement`). But the focused numeric field itself never displays the result of an arrow-key step (CR-02, confirmed by direct code read of `setValue` line 1924 and `nudgeField` line 2388-2395). See gap above. |
| 2 | Board vocabulary (4 shapes/colours) on screen; rows compact instead of overflowing | ✓ VERIFIED | `App.data.DEFAULTS.tokens` has the 4 board entries + `dead`; `[C05] TOKENS-VIZ` draws all shapes from CSS (`clip-path:polygon`, no SVG); `COMPACT_AT = 12` exported and asserted; 142/0 automated suite includes vocabulary and compaction assertions; interaction gate check 5 proves delta-only row growth (10→11 keeps all ten nodes). |
| 3 | Add/remove on either side; roster rebuilds without losing scroll or focus ring | ⚠️ PARTIAL | `addUnit`/`removeUnit` (the literal roadmap subject) both correctly call `invalidate({structural:true})` — verified directly in code — and interaction gate checks 6-7 mechanically prove deterministic focus landing and card-count tracking. But `resetToDefaults()`, reachable from the shipped error panel's Reset button, omits the same call (CR-01, confirmed in code: no `invalidate` call in its body) and desyncs the page from state when reached. Outside the literal "add/remove" scope but inside the same rendering contract, reachable by ordinary student action. See gap above. |
| 4 | Twenty rapid clicks = twenty changes; hold ramps; no animation restart, no focus jump, no dropped input | ? HUMAN NEEDED | Automated: interaction gate 14/14, including 20 synthetic `pointerdown` → 20 commits → 1 undo entry (checks 1, 2), hold-ramp start/stop (check 12), no re-append/no animation restart on token growth (check 5, code-verified via Rule 2/3 in `syncRow`). The hand-counted human number this criterion is phrased around was never recorded (G-02-A, already tracked in `02-03-PLAN.md`'s acceptance_record and `REQUIREMENTS.md`). |
| 5 | Legible on a projector at the back of a room; nothing hover-only; reads as a sibling of `game-feel-study-guide.html` | ? HUMAN NEEDED | Hover-only half verified: `grep -ci "hover .unit-rm\|hover .brd-rm"` = 0, remove control is `opacity:1` always, `:focus-visible` + `body[data-kbd="1"] :focus` rules both present, interaction gate check 13 style assertions exist. Sibling-palette half verified: no new hex colours added (grep confirms), shared `:root` tokens reused. Projector-distance half is unrecorded (G-02-B, already tracked) — approved in aggregate with no display/distance recorded, and WR-09's sticky-offset/board-width mismatch (topbar `min-height` vs fixed `--topbar-h` sticky offset; `#topbar` narrower than the widened `#board`) is a real, code-confirmed layout risk that a rehearsal, not a grep, would surface. |

**Score:** 2/5 fully verified, 2/5 partial (real code-level defects), 1/5 blocked on human rehearsal that was approved only in aggregate.

### Ruling on the two review findings this verifier was asked to rule on

**CR-02 vs. Criterion 1.** CR-02 does **not** falsify the literal sentence "the token rows reflect
it immediately" — verified by reading `syncRow`, which never consults `document.activeElement`
and therefore repaints every token on every frame regardless of focus. It **does** falsify the
practical, pedagogical promise underneath that sentence: the number the student is looking at
while pressing arrow keys is wrong until they blur, which is a defect in the "adjust it with
arrow keys" half of ALLOC-03 and — per the two secondary symptoms CR-02 documents (stale-value
append-and-misparse, Escape reverting to the wrong baseline) — a defect that produces incorrect
data, not just a stale display. Ruled: sits beside criterion 1's literal wording but breaks a
real, load-bearing part of ALLOC-03. Reported as a **gap**, not swept in as a pass.

**CR-01 vs. Criterion 3.** CR-01 is outside criterion 3's literal subject (`addUnit`/`removeUnit`,
which are both correctly wired) — `resetToDefaults` is a different op, reachable through the error
panel rather than through the roster controls. But it breaks the identical structure/sync
invariant criterion 3 exists to protect, through a control that ships in this phase's own error
panel and is reachable with no developer flags (type `abc` into a health field → error panel
opens → click "Reset to Workshop 16 defaults" → 11 cards on screen, 9 in state). Ruled: out of
criterion 3's literal scope, but a real, HIGH-confidence, reproducible defect in the phase's
rendering contract that a student can reach during ordinary recovery from a typo. Reported as a
**gap** rather than filed as out-of-phase, because the trigger (the error panel) is itself Phase 2
`[S06]`/`[S05]` machinery, not a later phase's surface.

**WR-02 vs. ALLOC-09.** Code-level inspection (independent of the review) confirms the picker's
implementation is real and correctly structured: `<dialog id="tok-picker">` exists as static
markup (line 474); `UI_HANDLERS.openTokenPicker` is assigned and reads `btn.dataset.tok`, calls
`App.render.picker`, and calls `showModal()` (line 2667-2673); `App.render.picker` exists (line
2096); `App.ops.dispatch`'s `setTokenStyle` case exists (line 1524) and the op validates
`TOKEN_IDS`/`SHAPES`/`COLORS`/`GLYPHS` before ever indexing state (12 passing suite rows,
including `__proto__` and `constructor` refusal). The feature is not vaporware. But WR-02 is
correct that the **Node interaction gate's own picker checks (10, 13) are vacuous** —
`KNOWN_IDS` in `tests/selftest-node.cjs` (confirmed by direct read, lines 175-179) does not
include the six picker element ids, so `pickerDialog()` returns `null` and the entire
`[S06.2]`/`[S07.2]` path is skipped by the gate. ALLOC-09 being ticked `[x]` in REQUIREMENTS.md is
therefore accurate **as a code-existence-and-wiring claim**, backed by direct source inspection
here and by the reviewer's independent hand-extended-stub reproduction, but is **not** backed by
the automated regression gate the SUMMARY implies is exercising it, and the one human check that
could have caught an actual browser-rendered failure (check 9, "no error panel") was never
itemized in the aggregate "approved". Ruled: not a truth-level FAILED for ALLOC-09 (the capability
demonstrably exists and is wired), but a real **test-coverage gap** — flagged as WARNING /
human-verification item, not swept into the passing score as full regression coverage.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `cats-vs-mechs.html` — `App.render = (function () {...})()` | Two-tier IIFE renderer | ✓ VERIFIED | `grep -c "App.render = (function ()"` = 1; `structure()`/`sync()` both present with `typeof document === 'undefined'` guards. |
| `cats-vs-mechs.html` — `App.data.DEFAULTS.tokens` | Token vocabulary as data | ✓ VERIFIED | 5 entries (`hp`,`ap`,`shield`,`dmg`,`dead`); `SHAPES`/`COLORS`/`TOKEN_IDS` exported allowlists. |
| `cats-vs-mechs.html` — `App.interactions = (function () {...})()` | Delegated interaction layer | ✓ VERIFIED | `UI_ACTS`/`UI_HANDLERS`/`HOLD_ACTS`/`LATE_BINDERS` seams present and used by 02-03 without editing `[S07.1]`. |
| `cats-vs-mechs.html` — `function setTokenStyle` | Allowlisted token-appearance write path | ✓ VERIFIED | Validates key before indexing state; explicit field assignment (no `Object.assign`); commits via `App.state.commit` (undoable, per D-13); `grep -c "Object.assign"` = 0. |
| `cats-vs-mechs.html` — `id="tok-picker"` | Picker surface, static markup | ✓ VERIFIED (wiring), ⚠️ COVERAGE GAP | Exists at line 474; `[C07] PICKER` style block present; but `tests/selftest-node.cjs`'s own `KNOWN_IDS` gate does not exercise it (WR-02). |
| `tests/selftest-node.cjs` | Node self-test harness | ✓ VERIFIED (as far as it runs) | 142/142 assertions pass, 0 failed; interaction gate 14/14; both confirmed by direct re-run in this verification. Picker path is an acknowledged blind spot in the harness itself. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `[S03] state.frame()` | `App.render.structure/sync` | invalidate/frame path | ✓ WIRED | Confirmed by 142/0 gate and direct code read. |
| `addUnit`/`removeUnit` | structural frame | `invalidate({structural:true})` | ✓ WIRED | Confirmed at cats-vs-mechs.html:1339, 1359. |
| `resetToDefaults` | structural frame | `invalidate({structural:true})` | ✗ NOT WIRED | Confirmed absent at cats-vs-mechs.html:1421-1426 (CR-01). |
| Arrow-key path | focused field display | `setValue`/field-local write | ✗ NOT WIRED | `nudgeField` (2388) never writes `el.value`; `setValue` (1924) explicitly skips the active element (CR-02). |
| `UI_ACTS`/`routeUi` | `UI_HANDLERS.openTokenPicker` | UI-only act seam | ✓ WIRED | Confirmed; `case 'openTokenPicker'` count in `[S05]` dispatch = 0 (never reaches ops layer), matching the design intent. |
| `[S07.2]` picker handler | `App.ops.dispatch('setTokenStyle', …)` | delegated root | ✓ WIRED | Confirmed at line 1524 and the picker press handler. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| Token rows (`.tok-row`) | `state.build[side].units[i].maxHp/shield`, `state.build[side].ap` | `App.state.get()` read at render time in `sync()` | Yes — computed from live state every frame, nothing stored/derived-and-cached | ✓ FLOWING |
| Stepper numeric field (`.stp-field`) | same as above | `setValue()` in `sync()`, gated on `activeElement` | Yes when unfocused; **stale when focused during an arrow-key ramp** (CR-02) | ⚠️ STATIC (while focused) |
| Picker swatch grids | `App.data.SHAPES/COLORS/GLYPHS` + `state.build.tokens[tokenId]` | `App.render.picker()` | Yes — generated from allowlists, selection read from live state | ✓ FLOWING (per code inspection; Node gate does not exercise the read) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Self-test suite runs clean | `node tests/selftest-node.cjs` | `142 passed, 0 failed`; `interaction gate: 14 of 14 checks passed` | ✓ PASS |
| No debt markers in modified file | `grep -c "TBD\|FIXME\|XXX" cats-vs-mechs.html` | `0` | ✓ PASS |
| `resetToDefaults` omits structural invalidate | `grep -n "function resetToDefaults" -A 8 cats-vs-mechs.html` | no `invalidate` call in body | ✓ CONFIRMS CR-01 |
| `nudgeField` never writes the field | `sed -n` of lines 2388-2395 | dispatches op, returns; no `el.value` write | ✓ CONFIRMS CR-02 |
| Picker test gate coverage | `grep -n "KNOWN_IDS" -A 5 tests/selftest-node.cjs` | 10 ids listed, none of the 6 picker ids present | ✓ CONFIRMS WR-02 |
| `addUnit`/`removeUnit` request structural frame | `sed -n` of lines 1330-1359 | both call `invalidate({structural:true})` | ✓ PASS |

### Probe Execution

No `scripts/*/tests/probe-*.sh` files exist in this repo; `tests/selftest-node.cjs` is the
project's own equivalent and was run directly (see Behavioral Spot-Checks above) rather than
substituted with narration.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| ALLOC-01 | 02-02 | Set unit health with +/− steppers | ✓ SATISFIED | Stepper markup + `nudgeMaxHp` op + 142/0 gate. |
| ALLOC-02 | 02-02 | Set faction AP pool with +/− steppers | ✓ SATISFIED | `nudgeAp` op wired identically to ALLOC-01. |
| ALLOC-03 | 02-01/02-02 | Delta typing and arrow-key adjustment | ⚠️ PARTIAL | Delta typing (`commitField`/`parseField`) is solid and gate-covered. Arrow-key adjustment moves state/tokens correctly but the field display is broken while focused (CR-02, gap above). |
| ALLOC-04 | 02-01 | Token vocabulary as data, board's 4 shapes/colours | ✓ SATISFIED | `App.data.DEFAULTS.tokens`, `[C05] TOKENS-VIZ`, no SVG/`url(`, 142/0 gate. |
| ALLOC-05 | 02-01 | Compaction above readable threshold | ✓ SATISFIED | `COMPACT_AT=12`, no-animate-on-crossover verified in code (`syncRow`'s mode-change branch) and gate. |
| ALLOC-06 | 02-02 | Add/remove units either side | ✓ SATISFIED | `addUnit`/`removeUnit` both correctly request structural frames; interaction gate checks 6-7. |
| ALLOC-07 | 02-01/02-02 | Rapid clicks register exactly, no lost focus/scroll/animation restart | ⚠️ PARTIAL (mechanism verified, human count missing) | Gate 14/14 proves the mechanism synthetically. Human hand-count never recorded (G-02-A). |
| ALLOC-09 | 02-03 | Edit token appearance from UI | ⚠️ SATISFIED w/ coverage gap | Code-level wiring confirmed directly by this verifier (dialog, handler, dispatch case, allowlist validation all present and correct). Node gate's own picker checks are inert (WR-02); human check 9 not itemized. |
| UX-02 | 02-01/02-02/02-03 | Legible on projector, nothing hover-only | ⚠️ PARTIAL | Hover-only half fully verified in code. Projector-distance half unrecorded (G-02-B); WR-09's sticky-offset/board-width CSS mismatch is a real, code-confirmed risk untested without a browser. |
| UX-05 | 02-01 | Matches sibling artifacts' palette/tokens | ✓ SATISFIED | No new hex colours added; shared `:root` tokens reused; `--maxw` untouched, `--boardw` added separately per Q-3. |

No orphaned requirements found — all Phase 2 requirement IDs (ALLOC-01…07, ALLOC-09, UX-02, UX-05)
appear in at least one plan's `requirements:` frontmatter and are addressed above.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| `cats-vs-mechs.html` | 1421-1426 | `resetToDefaults` omits `invalidate({structural:true})` | 🛑 Blocker | Ghost/orphaned unit cards reachable via the shipped error-recovery button (CR-01). |
| `cats-vs-mechs.html` | 2388-2395 | `nudgeField` never writes the focused field's displayed value | 🛑 Blocker | Field shows a stale number during arrow-key adjustment, leading to misparsed commits and misleading Escape behavior (CR-02). |
| `tests/selftest-node.cjs` | 175-179 | `KNOWN_IDS` never grown for the 6 picker element ids | ⚠️ Warning | Interaction-gate checks 10/13 pass vacuously; picker path has no automated regression coverage (WR-02). |
| `cats-vs-mechs.html` | 1396-1419 | `startFight()`/`endFight()` have the same missing-structural-frame defect as CR-01 | ⚠️ Warning | Latent in Phase 2 (no page control calls them yet), but will surface in Phase 5 unless fixed now or there. |
| `cats-vs-mechs.html` | 31, 94-98, 114-123, 133-139 | `--topbar-h` fixed sticky offset vs. wrapping `min-height` topbar; `#topbar` narrower than widened `#board` | ⚠️ Warning | Untestable without a browser; a rehearsal-visible risk to UX-02/criterion 5 (WR-09). |
| `cats-vs-mechs.html` | 2462-2495, 2697-2721 | Non-primary mouse buttons (right/middle-click) trigger steppers and hold ramp | ⚠️ Warning | Not part of this phase's must-haves but affects ALLOC-07's "no dropped/extra input" spirit for an instructor demoing with DevTools (WR-03). |

No `TBD`/`FIXME`/`XXX` debt markers found in the modified file.

### Human Verification Required

### 1. Twenty rapid clicks, hand-counted

**Test:** Note a unit's health, click its `+` twenty times as fast as physically possible.
**Expected:** The value moves exactly twenty.
**Why human:** The automated gate proves the mechanism synthetically (14/14) but cannot see a
real browser drop or double-fire an input under a real finger. This was Task 3's own acceptance
criterion and was never itemized — the developer's "approved" covered the rehearsal in aggregate,
not this specific number (G-02-A, already tracked in `02-03-PLAN.md`'s acceptance_record).

### 2. Projector legibility from the back of the room

**Test:** Put the file on the actual workshop display; stand at the back; check token
countability, 24px/700 readout legibility, and remove-control visibility at `--tok:22px`.
**Expected:** All three read clearly at the intended viewing distance.
**Why human:** No display and no browser exist in this environment. Never recorded in the
existing acceptance record either — no display or distance was written down (G-02-B, already
tracked). WR-09's CSS mismatch (sticky offset vs. wrapping topbar; board wider than the bar
covering it) is a concrete, code-confirmed reason this check could genuinely fail on a real
screen, not just an abundance-of-caution item.

### 3. The appearance picker, both input methods, no error panel

**Test:** Click the Health token-appearance button; confirm the picker opens with no error
panel. Tab to it and press Enter; confirm it opens identically. Change shape/colour/emoji;
confirm every health token updates; press Ctrl+Z; confirm it reverts.
**Expected:** Clean open both ways, board follows the restyle, Ctrl+Z reverts it.
**Why human:** Code inspection here and the reviewer's hand-extended stub both indicate this
works, but the project's own automated gate for this exact path is inert (WR-02), and this
specific check (#9) was never itemized in the aggregate human approval. Real `<dialog>`
top-layer/modal semantics are also unexecuted anywhere in this repo.

### Gaps Summary

Two of the review's two CRITICAL findings are real, code-confirmed defects reachable through
shipped Phase 2 UI (not hypothetical, not future-phase, not test-artifact-only):

1. **CR-02** breaks the practical promise of ALLOC-03's arrow-key adjustment — the field a
   student is actively editing shows a wrong number until blur, and this produces two further
   correctness problems (stale-value append-and-misparse, Escape reverting to the wrong
   baseline). It does not break the literal roadmap sentence about token rows, but it is squarely
   inside what "adjust it with arrow keys" has to mean for the artifact's own stated purpose
   ("the numbers and the picture agree").
2. **CR-01** breaks the render contract's core invariant (structure/sync agreement) through the
   error panel's own recovery button, leaving ghost cards a student cannot dismiss without
   reloading. It is outside literal criterion 3's add/remove wording but inside the same
   machinery criterion 3 depends on, and reachable by an ordinary typo-then-recover flow.

Neither is a "future phase" concern and neither is a test-harness artifact — both were confirmed
by reading the shipped `cats-vs-mechs.html` source directly, independent of the review and
independent of the Node test stub.

Additionally, ALLOC-09's own regression coverage is inert (WR-02) even though the underlying
feature is real and correctly wired by direct code inspection — this is reported as a
human-verification item plus a warning-level anti-pattern rather than a truth-level FAILED, since
existence and correct wiring are demonstrated, just not by the harness the SUMMARY implies is
covering it.

The two roadmap criteria depending on unrecorded human rehearsal detail (twenty-click count,
projector distance) were already honestly flagged as gaps G-02-A / G-02-B in
`02-03-PLAN.md`'s acceptance_record and in `REQUIREMENTS.md` — this verification does not
discover them fresh, but confirms they remain open and routes them to human verification here
rather than accepting the aggregate "approved" as itemized evidence.

**Recommendation:** CR-01 and CR-02 should be closed with `/gsd:plan-phase 2 --gaps` before this
phase is considered fully done — both are small, well-specified fixes (append one `invalidate`
call; add one field-local write in the arrow path) with fixes already drafted in `02-REVIEW.md`.
WR-02 should be fixed alongside them so ALLOC-09 gets real regression coverage rather than
relying on manual code review each time. G-02-A and G-02-B should be closed at the next physical
rehearsal, ideally before the actual workshop session.

---

_Verified: 2026-08-27_
_Verifier: Claude (gsd-verifier)_
