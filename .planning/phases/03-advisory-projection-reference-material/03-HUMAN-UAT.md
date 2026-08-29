---
status: partial
phase: 03-advisory-projection-reference-material
source: [03-VERIFICATION.md]
started: 2026-08-29
updated: 2026-08-29
note: >
  Created 2026-08-29 as a bookkeeping fix. Phase 3's verification returned human_needed on
  2026-08-28 with three items in its frontmatter, but no UAT file was written at the time, so the
  items never surfaced in /gsd:progress or /gsd:audit-uat. They are transcribed here verbatim from
  03-VERIFICATION.md. Nothing about the phase's status changed — this only makes the existing debt
  visible.
---

## Current Test

[awaiting human testing]

## Tests

### 1. Glyph rendering and wrapping in the strip and reference band
expected: The `≈`, `÷` and `–` (en dash) glyphs render as intended — not tofu boxes, and not a hyphen
that reads as a minus beside the stepper buttons' own minus sign. The arithmetic lines wrap rather
than scroll inside the narrow strip. Both panels are legible without hover, without a tooltip and
without opening dev tools (Success Criterion 2).
why_human: The stub DOM has no layout engine. Automated checks can prove the correct text reaches the
correct node and nothing more.
how: Open `cats-vs-mechs.html` in a desktop browser and read the strip's two panels and `#refband`
top to bottom on the shipped board.
result: [pending]

### 2. The strip stays sticky when the window is short
expected: `#strip` keeps sticking to the top of the viewport under the topbar. If its content is
taller than the space available it must not disappear entirely, nor overlap in a way that hides a
figure.
why_human: Named in 03-REVIEW.md as unreviewable without a layout engine: the strip's content sets its
own height, and a sticky box taller than the space between the bar and the bottom of the window
behaves as though it were not sticky for the part that does not fit. No CSS regression tooling exists
in this repo, by design.
how: Shrink the browser window height — or use a typical workshop laptop screen — and scroll the board.
result: [pending]

### 3. Projector legibility from classroom distance
expected: The `≈9 turns to wipe Mechs` / `≈3 turns to wipe Cats` contrast (the phase's own worked
teaching example, D-01) and the "What beats what" band are legible from a normal classroom viewing
distance, without the instructor zooming or narrating the numbers aloud.
why_human: Explicitly named as an empirical question with no programmatic substitute — in this phase's
own gate comments (check 47, closing note, item 4) and in CLAUDE.md's Gaps section: *"No amount of
research substitutes for putting the artifact on the actual workshop display before the session."*
how: Put the artifact on the actual projector or the largest shared screen available and stand back.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
