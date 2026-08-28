---
phase: 03-advisory-projection-reference-material
fixed_at: 2026-08-28T00:00:00Z
review_path: .planning/phases/03-advisory-projection-reference-material/03-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 6
skipped: 0
status: all_fixed
reconstructed: true
---

# Phase 3: Code Review Fix Report

> **This document was reconstructed by the orchestrator from the six fix commits and the fixer's
> own account of its work.** The original was written inside the executor's worktree and left
> uncommitted, on an orchestrator instruction ("do not commit the fix report") that is correct in
> normal mode and **wrong in worktree mode** — the worktree is force-removed after the agent
> returns, so an uncommitted file there is destroyed (#2070, the same failure the SUMMARY rule
> exists to prevent). The instruction was the orchestrator's mistake, not the fixer's.
>
> **The six code commits are unaffected and were merged intact.** What follows is faithful to their
> messages, which carry the measurements verbatim; nothing here is invented. Where the original
> report may have held more detail than the commits do, that detail is gone.

## Summary

| | Before | After |
|---|---|---|
| Node rows (`node tests/selftest-node.cjs`) | 411 / 0 failed | **412 / 0 failed** |
| Interaction gate | 63 of 63 | **66 of 66** |
| Full suite with a stub DOM | TOTAL 516 / 516 | **TOTAL 520 / 520** |
| Verdict gate Layer A / B / C word counts | 29 / 10 / 39 | **16 / 23 / 39** |

Invariants unchanged throughout: both PROJ-06 acceptance greps at 0, `https?://` at 0, `.style` at
1, `createElementNS` at 0, one `<script>`, one `<style>`, CRLF intact.

Every fix carries a regression row proven red against the pre-fix code, and every mutation was
reverted with `git diff --quiet` confirming a clean return.

## CR-01 — `fc89c7b` the projected noun agrees with the figure

`turnsText` hard-coded the plural, so a board driven to a single bound of one — reachable through
**Remove Cat**, one Cat against nine points of throughput — rendered `≈1 turns to wipe Cats`, a
grammatical error at 24px on the one surface the phase exists to make trustworthy.

Why no row saw it: every figure pinned anywhere in the repo was 3, 4–6, 9 or 12, and one noun
spelled once agrees with all of them.

Fixed with a branch rather than a data field, and the comment records why the file's existing
`beats`/`beat` precedent does *not* apply: that connective agrees with an action **name**, which is
authored data and can carry its own word, whereas this noun agrees with a quantity derived at render
time, so there is no record for it to live on. The fixer also had to adapt the review's suggested
snippet, which used literal `≈`/`–` glyphs where the file deliberately uses `≈`/`–`
escapes.

Added to `[S09.8]` and mirrored as gate check 52b; both proved red against the pre-fix renderer,
reading the exact defect string.

Orchestrator verification after merge: `≈1 turn to wipe Cats` at one Cat, with `≈9 turns`,
`≈4–6 turns` and `no damage to spend` all unchanged.

## WR-01 — `f5f168d` assert the built page, not the source spelling

Check 63 banned `data-act` and `data-k` from the `[S06.1]` region. **Neither literal is ever written
in this file's JavaScript** — attributes go through `setData(node, { act: …, k: … })` — so those two
halves could not fail.

The reviewer's mutation reproduced: one `setData` line in `refCard` turns a reference card into a
live stepper. Pressing the Slash card moved `maxHp 3 → 4` while **411 node rows, 64 gate checks and
517 in-file assertions all stayed green.**

Added check 63b, a `dataset` walk over every rendered card and descendant covering
`act`/`k`/`amt`/`lbl`/`albl`, and dropped the two dead entries from 63. 63b goes red on that exact
mutation and names the attributes it found, and also on a `data-lbl` planted on a nested effect chip
— so the walk is proven to reach past the card node. The narrowed 63 still fires on `labelFor`.

## WR-02 — `7fc1696` assert the four rules the banners call silent failures

Both `[S06.3]` and `[S06.4]` banners state at length that a `data-k` in `#strip` steals `keyed()`'s
first match, that a `data-amt` or `.brd-value` paints a confident zero, and that a `.brd-line--opt`
is pinned shut for good. All three held — and **none was asserted anywhere**, one paragraph from the
note where `[S09.8]` says it asserts the shape rather than trusting a comment.

Both mutations reproduced:
- `k:'mechs/m1/maxHp'` on the turns figure kept 411 rows, 65 gate checks and 517 assertions green,
  while focus after a Mechs rebuild moved from `stp-field num` to `prj-turns num` — the student's
  health field traded for an unfocusable projection figure.
- `.brd-value` + `data-amt` on a refband line let `sync()` paint `"0"` over both matchup lines.

Added a `dataset` walk over `#strip` and `#refband` covering `k`/`amt`/`lbl`/`albl` and the two
classes, as `[S09.8]` rows and as gate check 56b, floored on both regions being built (strip 3
children, refband 2). Both mutations now go red and name what they found.

## WR-03 — `8bb40f1` move 13 comparatives from Layer A to the literal layer

**This is the judgment call of the pass, and the trade is recorded in the source beside the list.**

Layer A read the whole document — comments and CSS included — for 29 words. Thirteen are ordinary
engineering prose, so the gate reddened on *sentences* rather than on copy, telling its reader the
artifact was judging a build when it was not. This phase already paid that toll: a comment saying
"the weaker half of the guarantee" was reworded to "the narrower half" for no reason but the list.

The decisive argument was internal inconsistency rather than convenience: the file had already
invented this split for `score`, `grade`, `judgement` and `worse` — keeping `judgment` in A while
`judgement` sat in B, and `better` in A while `worse` sat in B, was an inconsistency, not a policy.

Layer A keeps the **16 words that name the banned feature**: the four mandated stems, `verdict`,
traffic light, over/underpowered, good/bad build, `winner`, `loser`, `outmatch`, `outclass`,
`unfair`, "should aim" — each still reading the whole document.

**What is given up, for the 13 moved words only:** the CSS block, and static markup outside the
script block that Layer C does not walk (`#err-panel` and the `<dialog>`; Layer C harvests `#app`).
A verdict feature wearing a `.better-build` CSS class with no literal and no rendered word would now
pass. **Retained in full:** every string literal (Layer B) and all rendered output (Layer C, which
scans both lists concatenated and is unchanged at 39).

**If the developer disagrees, reverting `8bb40f1` alone restores Layer A without disturbing
anything else.**

## WR-04 — `10c0903` Layer B reads template literals

The extractor took single and double quotes only. Layer B is the **only** layer that scans code for
`score`, `grade`, `judgement`, `rank`, `ahead`, `wins`, `win`, `edge`, `lead` and `worse` — Layer A
excludes them so the file can discuss its own rule — so a backtick string carrying one passed Layer A
because it is not on that list, and passed Layer B because it was never extracted.

Proved: a literal reading `You win this matchup` in backticks ran fully green against the pre-fix
harness — 2466 literals scanned, 66 of 66 gate checks, no violation. With the backtick arm it is
caught by name. Layer C did not save it, because the string was never rendered.

The arm was measured before shipping, since an extractor that swallows *too much* is the same
silent-shrink class the floor guards against: all 192 backticks sit in comments, paired, none
spanning a line; the count goes 2466 → 2555, of which 94 are backtick-delimited. Five single-quoted
literals stop being separately extracted, and each was verified individually to be a duplicate
inside a comment's backtick span that is itself scanned. No word coverage is given up. Floor moved
1500 → 2000.

## WR-05 — `783b044` pin the build-slice actions to the frozen board

The cards read `App.data.DEFAULTS[side].actions` through `refActions`; the projection reads the deep
copy in `state.build[side]`, because `bestDamage` is handed the build slice. Two reads of one fact, a
column apart on the same screen, with nothing holding them together. `refActions` is explicit that
the boundary is deliberate and names the day it has to change — the decision is sound, the tripwire
was missing. `[S09.1]` asserts `defaults()`'s actions, but `defaults()` is a JSON round trip of
`DEFAULTS`, so that row agrees with itself by construction and says nothing about `state.build`.

Placed in `[S09.9]`'s DOM-free half so CI gets it: node rows 411 → 412.

Proved with the exact Phase 4 shape — only the build slice diverges, as a pasted build code would
make it, with `DEFAULTS` untouched. **In the terminal run this row is the only thing in the repo
that catches it**: 411 passed, 1 failed, all 66 gate checks still green. With a DOM the pinned
projection figures also move, but they report a *changed number* rather than the fact that two reads
of one fact disagree — and after Phase 4 pastes a build the board legitimately differs, so those
rows no longer apply while this invariant still does.

## One probe was wrong, and the fixer said so

Its first Layer C test mutated `turnsText`'s `null` branch, which the restored default board never
takes, so nothing rendered and the probe passed. **The probe was wrong, not the gate.** Re-run
against a rendered branch it went red: `[better] in "≈9 the better build"`.

This is the fifth time in this phase that an agent found one of its own probes vacuous. The running
rule, now stated in three places in the repo: *if a probe passes when you expect red, the probe is
wrong until proven otherwise.*
