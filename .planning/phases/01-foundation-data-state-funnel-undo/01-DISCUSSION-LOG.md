# Phase 1: Foundation — Data, State Funnel & Undo - Discussion Log

**Date:** 2026-08-26
**Mode:** Default (interactive)

> Human reference only. Downstream agents read `01-CONTEXT.md`, not this file.

## Outcome

The user declined the discussion round, selecting "Skip" when presented with the gray areas. No questions were answered.

All four gray areas were subsequently resolved at Claude's discretion and recorded in `01-CONTEXT.md` as D-01 through D-17, so that the researcher, planner and executor act consistently rather than each inventing an answer independently.

## Gray Areas Presented

### 1. Board default numbers
**Why it was raised:** ALLOC-08 requires the Workshop 16 defaults to load "exactly as the board specifies," but the board depicts token rows rather than numerals. The exact per-unit HP and faction action-point values are not recoverable from the image without a judgement call, and the user is the real authority on their own workshop.

**Selection:** Not answered — skipped.

**Resolved as:** Cats 9 units × 3 HP, 3 faction AP; Mechs 3 units × 6 HP + 3 shield, 3 faction AP; damage attached to actions (Slash 1, Lasers 3). Recorded as D-01 and **explicitly flagged for user confirmation** — the one discretionary decision in this phase where Claude is not the right authority. Phase 5's FIGHT-11 playtest gate exists to correct it regardless, and the numbers as read are likely a Lanchester blowout in the Cats' favour.

### 2. Self-test visibility
**Why it was raised:** The `#selftest` harness is the only way Phase 1 can prove itself with no UI, but the file it lives in is the same file students receive.

**Selection:** Not answered — skipped.

**Resolved as:** Ships in the released file (stripping it would require a build step, which UX-04 forbids), gated behind the `#selftest` hash, renders nothing on a normal open, and presents a readable pass/fail list rather than a console dump. D-04 through D-07.

### 3. Undo boundaries
**Why it was raised:** UX-01 fixes the depth at ~30 but not the reach. Whether undo crosses the setup/fight boundary is a genuine design choice with a live-workshop consequence.

**Selection:** Not answered — skipped.

**Resolved as:** Undo spans `build` and `fight` and crosses the boundary — undoing past "start fight" un-starts it, so an accidental fight start costs one keystroke rather than a new concept. `ui` changes never enter the stack. Coalescing by label within ~500ms. Reset-to-defaults lands as one entry. D-08 through D-12.

### 4. Failure behavior
**Why it was raised:** UX-03 requires a styled panel but says nothing about recovery, and the realistic failure moment is an instructor mid-demo with a room watching.

**Selection:** Not answered — skipped.

**Resolved as:** Handler failures keep the page alive with last-good state on screen; only init failure is terminal. The panel offers dismiss-and-continue or reset-to-defaults, and exposes the error text in a selectable field for pasting into Discord. D-13 through D-16.

## Deferred Ideas

- Visible undo/redo buttons — Phase 2
- Redo — not in v1 scope
- Retuning board defaults — Phase 5, plan 05-03
- localStorage persistence — out of scope; noted that `file://` localStorage would collide with the sibling course artifacts unless namespaced

## Claude's Discretion

Every decision in this phase's CONTEXT.md (D-01 through D-17) is Claude's discretion, following the user's skip. D-01 is the only one flagged as needing user confirmation.

---

*Phase: 1-Foundation — Data, State Funnel & Undo*
