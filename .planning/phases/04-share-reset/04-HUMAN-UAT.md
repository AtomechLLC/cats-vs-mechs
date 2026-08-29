---
status: partial
phase: 04-share-reset
source: [04-VERIFICATION.md]
started: 2026-08-29
updated: 2026-08-29
---

## Current Test

[awaiting human testing]

## Why these three survived the rehearsal

Plan 04-08 ran a full 26-item browser rehearsal script and it was closed with the single word
"approved". That resolved every item the plan asked about — but the plan's own acceptance criteria
asked for *per-cell readings* on three of them, not a blanket answer, and a blanket answer cannot
supply what those three need. The executor recorded this honestly rather than fabricating readings,
and the verifier confirmed the disclosure was accurate and complete rather than an overclaim.

These are not code defects. Every one of them is a path the Node harness structurally cannot reach.

## Tests

### 1. Clipboard tiers 1 and 2 actually fire, in order, with the right fallback
expected: Tier 1 (`navigator.clipboard.writeText`) fires in a normal focused window. On failure it
falls through to tier 2 (`document.execCommand`), then tier 3 (select + Ctrl+C). `data-sh-tier` reads
`clipboard` / `command` / `select` correctly per cell. **No cell ever claims a copy that did not
occur.**
why_human: `navigator` does not exist in the Node runtime, so tiers 1 and 2 have **never executed
anywhere in this repository, in any browser, under any flag**. This is the weakest claim in the whole
phase and SHARE-01 rests on it.
how: Open `cats-vs-mechs.html` by double-click. Press Copy in each cell of the matrix — Chrome and
Edge, each with the window focused / DevTools focused / window backgrounded, plus one run with
`navigator.clipboard` set to `undefined` in the console. For each, read the `data-sh-tier` attribute
and record it beside what the on-screen line said.
result: [pending]

### 2. No flash of the shipped board before a linked build renders
expected: Opening a link carrying a build code shows the classmate's board. There is no visible flash
of the default 9-vs-3 board first.
why_human: PROBE Q reddened nothing when the boot step was moved below the first structural
invalidate — every automated reading is taken after the frame flushes, so a load landing after first
paint is indistinguishable from one landing before it. The ordering is held by a code comment and
nothing else.
how: Copy a build code, put it in the address bar, and open it in a fresh tab. Watch the first paint.
result: [pending]

### 3. The reset confirmation's words, and whether Ctrl+Z after it feels like recovery
expected: The dialog's paragraph is legible, non-comparative, and communicates the actual stakes —
that the undo entry for a reset can age off the 30-deep stack, which is the whole reason this
confirmation exists (D-19) when token and action removal deliberately have none (D-17).
why_human: The Node stub is a hand-made stand-in, not a parser, so static markup text reads as empty
there. The *mechanism* is asserted (Cancel costs nothing at check 91d; confirm is exactly one undo
entry and Ctrl+Z fully restores at 91e) — but no automated row has ever read the words.
how: Open the reset confirmation and read it on screen. Then confirm a reset and press Ctrl+Z.
result: [pending]

## Also unclosed, lower stakes

Rehearsal item 8 asked whether the four refusal sentences read as *helpful* rather than merely
distinct. Check 91b proves distinctness (4 of 4); usefulness is a judgement and none was given. The
four sentences are quoted verbatim in `04-07-SUMMARY.md` if you want to judge them without operating
the file.

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
