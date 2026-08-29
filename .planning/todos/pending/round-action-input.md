---
type: feature-request
source: developer, verbatim, 2026-08-29
resolves_phase: 5
status: pending
requirements_touched: [ACT-05, FIGHT-01, FIGHT-02]
---

# A round action input at the top of the page

## The request, in the developer's own words

> There should be a simple input at the top where you click actions to set the actions/moves for the
> current round

## Why this is Phase 5 and not a new phase

This is the second half of ACT-05, and it was deferred here on purpose.

Phase 3.1 built action authoring as **propose but never apply**: the proposal pane restates a
student's own rule, reports what it costs against the board's real numbers, lets the student edit any
number — and lands nothing. That was decision D-05b, settled 2026-08-28 and reconfirmed by the
developer at the 03.1-08 checkpoint. Two shipped checks assert that nothing lands, and PROJECT.md's
Out of Scope entry depends on it.

The reason given at the time: **a declared action lands on Advance, in Phase 5.** This request is
precisely that mechanism, described from the student's side.

## What it implies for Phase 5 planning

- The surface is a **declaration step**, not a resolution step. The tool records what a student says
  their side is doing this round; the students remain the rules engine. Do not let this become combat
  automation — that exclusion is the project's oldest and most load-bearing constraint.
- It sits **at the top** — the topbar already carries Tokens, the action editor, and (as of Phase 4)
  Share and Reset. Topbar space and the collapse behaviour from D-07 are a real constraint; check the
  id budget and the topbar collapse before adding controls.
- "Click actions to set them" implies picking from the side's authored action list — which is exactly
  what `[S06.5]`'s editor list already renders and what `bestPair` already walks. Reuse, do not
  re-derive.
- Affordability is already computed: `App.model.affordability` is ACT-06 as numbers and token ids,
  and carries a **never-disable** rule in its own comment. A declaration surface must respect that —
  it may report that a student cannot afford an action, but it must not prevent them declaring it.
- Landing a declaration must go through the named-op + `commit()` funnel so Ctrl+Z covers it.

## Open question for discuss-phase

Whether a declaration is per-side or per-unit. The request says "the current round," which suggests
per-side; but actions carry per-unit costs and requirements, which suggests per-unit. This changes
the data shape and should be settled before planning, not during.
