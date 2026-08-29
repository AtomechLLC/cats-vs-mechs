# D-27 — The declaration surface, redesigned by the developer at the 05-11 checkpoint

**Date:** 2026-08-29. **Authority:** the developer, directly, in their own words. This supersedes
the declaration form plans 05-07/05-10 built, and it OVERRULES two recorded rules — knowingly, see
below.

## The spec, verbatim

> I don't like the pop up presentation for actions.
> I would prefer having a full tab on the main screen.
> I want a much simpler UI for 'fights'
> Show something like
>
> [ROUND]
>
> [CATS]
>
> [C1] [ACTION] [ACTION] [ACTION] <-- buttons to pick one
> [C2] [ACTION] [ACTION] [ACTION] <-- buttons to pick one
>
> etc
>
> same thing on the other side.
>
> As actions are selected, deplete the resources. Re clicking an action should undo that preview.
> picking another action should undo any changes and apply the new one. Disable any actions whose
> requirements are not met
>
> Show both sides at the same time in columns.

## What this settles

1. **The fight is a full TAB on the main screen**, not a band stacked above the board. This also
   dissolves the viewport-budget problem structurally — the fight no longer competes with the build
   board for one viewport.
2. **Declaration is per-unit, radio semantics.** One action per unit. Click to declare; re-click the
   same action to undo; click a different action to replace. Both sides visible simultaneously, in
   columns.
3. **Resources deplete as a live preview while declaring.** This IS the resolution of the
   apSpent-reads-zero finding (05-07's blocker): of the two admissible fixes written into the file,
   the developer has effectively chosen "a reading for what this round's declarations have spoken
   for" — and promoted it from a bar figure to the core interaction. FIGHT-09's "spent visibly
   distinct from available" is served by the same mechanism.
4. **Actions whose requirements are not met are DISABLED.**

## The two rules this overrules — deliberately, on the developer's word

- **D-23** ("a declared cost that exceeds the pool is reported, never prevented") — an orchestrator
  assumption, now overruled by the person it was standing in for. The fight declaration surface
  disables what cannot be declared.
- **The never-disable rule on the fight region** — gate check 95 asserts 147 controls across three
  boards are never disabled; wave 10 asserts `grep -c "\.disabled"` over `[S07.5]` prints 0. Both
  must be TURNED IN THE OPEN (the 03.1-04 precedent): recorded red, rewritten to assert the NEW
  contract (disabled if and only if requirements are unmet or the previewed pool cannot pay),
  recorded green. The never-disable rule REMAINS in force on the build/proposal surfaces — ACT-06's
  comment and checks there are untouched. The overrule is scoped to fight declaration.

## Orchestrator interpretation calls (flagged to the developer, proceeding under them)

- **Targets:** the sketch has no target step, but actions carry target-directed terms. Call: clicking
  an action that needs a target lights up the opposing column's unit buttons to pick one; the
  declaration completes on that second click. Untargeted actions declare in one click. Re-click of
  the declared action cancels, target and all.
- **"Pop up presentation for actions"** is read as the fight declaration flow. The action EDITOR
  dialog (#act-edit, authoring) is left as-is; if the developer meant that too, it is a separate
  change to ask for.
- **Tabs and PROJ-05/REF-03:** the tab switches the board-vs-fight region only. `#strip` (projection)
  and `#refband` (reference) stay outside the tabbed region so both remain readable without
  navigating away, which those requirements demand.
- **Dead units:** a unit the student has ruled dead has its action buttons disabled. This is driven
  by the student's own ruling, so it is bookkeeping, not adjudication.
- **What Advance does is UNCHANGED.** The preview depletes a *reading*; nothing resolves until
  Advance. The bookkeeping/adjudication line from wave 4's DOES/does-NOT table is untouched.

## What stays true

- The students are the rules engine. Advance still only spends AP, applies declared xf terms, and
  splits damage shield-then-health. No verdicts anywhere on the new tab.
- The no-verdict gate applies to every rendered word of the new surface.
- The 05-11 playtest still gates the phase — on the NEW surface once it ships.
