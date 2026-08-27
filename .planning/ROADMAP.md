# Roadmap: Cats vs Mechs — Workshop 16 Interactive Sample

## Overview

The journey runs from an invisible foundation to a played fight. Phase 1 builds the parts that
have no UI at all — frozen Workshop 16 data, pure eHP/DPS derivations, the single mutation funnel,
snapshot undo, the error boundary, and an in-file self-test that proves them — because every one of
those decisions is cheap now and a rewrite later. Phase 2 puts the board on screen: the two-tier
render and the roster editor together, so the render strategy is proven against structural change
rather than only against stepper ticks. Phase 3 adds the advisory projection and the reference
material — the two things that must be on screen while a fight happens, and the place where the
project's central pedagogical risk (a number becoming a verdict) is either avoided or built in.
Phase 4 encodes the now-stable build shape into a shareable code and settles the reset scopes.
Phase 5 adds the fight loop last, because it is the only layer that cannot invalidate anything
beneath it — and it does not finish until a person has actually played the shipped 9v3 default to
completion and confirmed it was contested.

**Build-order note (from research, converged on independently by all four researchers):** two
inversions are forbidden. Steppers must not precede the two-tier render decision, and serialization
must not precede roster editing. Both are tempting, and both cost a rework of the layer beneath.

**Single-file collision note:** everything ships in one HTML file, so parallel plans inside a phase
must each own a distinct, named section of that file. The section order established in Phase 1 is
`data → model → state → serialize → ops → render → interactions → boot → selftest`, marked with
banner comments. Every phase's plan split below assigns section ownership explicitly; planning must
preserve that or run the plans sequentially instead.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation — Data, State Funnel & Undo** - The file opens offline and proves its own data model, mutation funnel and undo before any UI exists
- [ ] **Phase 2: Allocation Surface** - Steppers, token rows and roster editing that survive live-workshop hammering
- [ ] **Phase 3: Advisory Projection & Reference Material** - What the allocation implies, and what the tool refuses to decide for the student
- [ ] **Phase 4: Share & Reset** - A build code a classmate can actually use, and three unmistakably distinct ways back
- [ ] **Phase 5: Fight Loop & Playtest** - Hot-seat bookkeeping for a played fight, verified by playing it

## Phase Details

### Phase 1: Foundation — Data, State Funnel & Undo
**Goal**: The artifact opens offline as a self-proving skeleton — Workshop 16 data frozen, every mutation routed through one commit path, undo working, errors visible — with no UI yet
**Depends on**: Nothing (first phase)
**Requirements**: ALLOC-08, UX-01, UX-03, UX-04
**Success Criteria** (what must be TRUE):
  1. Double-clicking the file on a machine with no network open and no build step produces a styled page in a modern desktop browser, with no console errors and no outbound requests.
  2. Opening the file with `#selftest` shows a readable pass/fail report confirming the Workshop 16 defaults load exactly as the board specifies — Cats with Slash (1 damage) / Hairball (Slowdown) / Screech (Confuse), Mechs with Fly (Evade) / Lasers (3 damage, Range) / Recharge (Shield), and the 9-Cats-vs-3-Mechs starting allocation.
  3. The same report confirms the state contract: state is integers-only and JSON-clonable, split into `build` / `fight` / `ui` slices; nothing mutates it outside `commit()`; `alive` is stored as its own flag so a unit at zero health is not auto-dead; undo restores at least 30 prior states in order and a burst of rapid same-label changes collapses into one entry.
  4. Deliberately throwing inside init and inside a handler each surface a styled error panel naming what failed, instead of a blank page.
**Plans**: 2 plans

Plans:
- [ ] 01-01: File skeleton (TOC + section banners), frozen `data` defaults, pure `model` derivations, `selftest` harness — owns sections `data` / `model` / `selftest`
- [ ] 01-02: `state` slices + `commit()` funnel + snapshot undo + rAF invalidate, `ops` stub layer, `boot` with try/catch error panel — owns sections `state` / `ops` / `boot`

### Phase 2: Allocation Surface
**Goal**: A student can build both rosters on screen — setting health and action points with steppers, adding and removing units — and the display holds up under rapid live operation
**Depends on**: Phase 1
**Requirements**: ALLOC-01, ALLOC-02, ALLOC-03, ALLOC-04, ALLOC-05, ALLOC-06, ALLOC-07, UX-02, UX-05
**Success Criteria** (what must be TRUE):
  1. A student can set any unit's health and either faction's shared action-point pool with +/− steppers, by typing a delta (`-8`, `+5`) into the field, or with arrow keys — and the token rows reflect it immediately.
  2. Allocation reads as the board's own vocabulary — green squares for health, yellow triangles for actions, blue squares for shield, red diamonds for damage — and rows compact to a count above a readable threshold instead of overflowing the row.
  3. A student can add and remove units on either side, and the roster rebuilds without losing scroll position or the keyboard focus ring.
  4. Clicking a stepper twenty times as fast as possible produces exactly twenty changes, and press-and-hold ramps continuously — with no token animation restarting, no focus jumping, and no dropped input.
  5. Every value and label is legible on a projector at the back of a room, nothing is conveyed by hover alone, and the page reads as a sibling of `game-feel-study-guide.html` (same dark palette and design tokens).
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [ ] 02-01: `render.structure()` (rare, focus/scroll-preserving) + `render.sync()` keyed token reconcile + `<style>` block on the course design tokens — owns sections `render` / `style`
- [ ] 02-02: Delegated `interactions` (steppers, press-and-hold, delta math input, arrow keys) + roster add/remove `ops` — owns sections `interactions` and the `ops` additions

### Phase 3: Advisory Projection & Reference Material
**Goal**: A student can see what their allocation implies, stated in the fight's own unit with its arithmetic exposed and its blind spots named — and can read the counter map and effect cards without leaving the build
**Depends on**: Phase 2 (may run in parallel with Phase 4)
**Requirements**: PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-06, REF-01, REF-02
**Success Criteria** (what must be TRUE):
  1. Each side shows an effective-HP and time-to-wipe projection that updates as allocation changes, stated as a range in the fight's own unit ("≈3–5 turns to wipe") — never as an abstract score and never with a decimal.
  2. The arithmetic producing each range is on screen and readable without a tooltip, a hover, or a console.
  3. A permanent, always-visible list sits next to the projection naming what it ignores: counters, effects, focus fire, overkill, and the student's own rulings.
  4. **No verdict exists anywhere on screen.** No traffic light, no difficulty badge, no balance meter, no colour-coded rating, no "balanced / unbalanced / fair" wording, and no shared midpoint bar comparing the two sides against a threshold. Reading the rendered page top to bottom, a student cannot find a place where the tool tells them whether their build is good.
  5. The counter map (Slash < Fly, Hairball < Lasers, Fly < Recharge) and the effect cards (Shield, Slowdown, Confuse, Evade, Range) are visible attached to the actions that carry them, without navigating away from the build.
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [ ] 03-01: Projection panel — eHP/turns-to-wipe range derivations, visible arithmetic, permanent "this ignores:" list, no-verdict assertion in `selftest` — owns the `model` derivations and the `render.projection` block
- [ ] 03-02: Reference material — counter-map and effect-keyword card data + stateless render, laid out mode-agnostically so it survives into fight mode — owns the `data.reference` and `render.reference` blocks

**Design decision to settle before code** (flagged by research): the projection's unit and its visual weight relative to the fight's own output. Turns-to-wipe is chosen so the post-fight comparison lands as "you guessed 3–5, it took 8". The live number must never be the loudest element on screen.

### Phase 4: Share & Reset
**Goal**: A student can copy a build code short enough to post in the Discord thread, load a classmate's, and get back to Workshop 16 defaults without ever loading garbage silently
**Depends on**: Phase 2 (build shape must be stable; may run in parallel with Phase 3)
**Requirements**: SHARE-01, SHARE-02, SHARE-03, SHARE-04, SHARE-05, SHARE-06
**Success Criteria** (what must be TRUE):
  1. A student clicks copy and gets a build code on the clipboard; pasting that code into the load field reproduces the build exactly, unit for unit and point for point. When the browser blocks the clipboard API, a selectable field appears with the code already highlighted so the copy still happens.
  2. The code for a deliberately large roster is short enough to post as an ordinary Discord message rather than becoming an attachment, and its character count is visible next to the copy button.
  3. A corrupted, truncated, or wrong-version code produces a clear on-screen message and leaves the current build untouched — nothing loads silently wrong. A round trip through both a Chromium browser and a second browser produces an identical build in both directions.
  4. Reset to Workshop 16 defaults asks for confirmation first and sits apart from the non-destructive controls; after confirming, Ctrl+Z still brings the build back.
  5. Reloading the page or reopening a bookmark restores the student's own current build from the address bar — and nothing in the UI presents the address bar as the way to share.
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [ ] 04-01: Versioned positional codec (encode/decode of the `build` slice only), URL-safe alphabet, debounced `location.hash` mirror, round-trip + alphabet assertions in `selftest` — owns section `serialize`
- [ ] 04-02: Share dialog and reset controls — three-tier clipboard fallback, paste-to-load with error messaging, `<dialog>` confirmation on reset-to-defaults — owns the `ops.share` / `ops.reset` and `render.dialogs` blocks

**Verification note** (flagged by research): the failure modes here are cross-browser and silent. This phase needs a real test matrix — 2 browsers × focused / DevTools-focused / backgrounded × forced Tier-3 fallback — not a smoke test.

### Phase 5: Fight Loop & Playtest
**Goal**: A student can play the fight hot-seat with the tool doing bookkeeping and the student doing adjudication — and the shipped default is confirmed contested by actually playing it
**Depends on**: Phase 1, Phase 2, Phase 3, Phase 4
**Requirements**: FIGHT-01, FIGHT-02, FIGHT-03, FIGHT-04, FIGHT-05, FIGHT-06, FIGHT-07, FIGHT-08, FIGHT-09, FIGHT-10, FIGHT-11, PROJ-05, REF-03, SHARE-07
**Success Criteria** (what must be TRUE):
  1. A student can start a fight from the current build, advance and rewind turn and round by hand — the tool never advances on its own, not even when a side's action points hit zero — and can reset the fight to turn one without discarding the build. Whose turn it is and what remains to spend are unambiguous from across the room, with spent action points visibly distinct from available ones.
  2. A student can apply damage to an individual unit; a unit reaching zero health is marked dead, stays visible in the roster rather than disappearing, and can be toggled back alive by hand so a Shield or Evade ruling is representable.
  3. Any tracked value can be overridden at any point from wherever it is displayed, the override is visibly marked as one, and the combat log records each turn's actions and every override in readable order.
  4. Editing the build mid-fight applies to the build rather than retroactively to the fight in progress, and the tool says so on screen. Throughout the fight the per-side projection and the counter map / effect cards stay readable without navigating away — and still render no verdict, badge, traffic light, or balance judgement of any kind.
  5. **Playtest gate — this is a played fight, not a code review.** A person plays the shipped 9-Cats-vs-3-Mechs default end to end at least twice, hot-seat, adjudicating counters and effects as a student would. The phase is not complete until neither side wipes the other with a large force advantage remaining (target: the winner finishes with no more than roughly 30% of its starting force intact). If the default blows out — the expected Lanchester square-law outcome for a swarm with focus fire and individual deaths — the default allocation is retuned in `data` and replayed until it doesn't. The playtest result and the tuning applied are recorded.
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 05-01: Fight state slice + turn/round advance and rewind + shared AP pool spend/refill + reset-fight — owns the `state.fight` and `ops.fight` blocks
- [ ] 05-02: Fight render and interactions — damage application, `alive` toggle and dead-unit presentation, universal override with marker, append-only combat log, mid-fight-edit notice, projection/reference persistence into fight mode — owns the `render.fight` and `interactions.fight` blocks
- [ ] 05-03: Playtest the shipped 9v3 default twice end to end, tune `data` defaults if it blows out, replay, record the result

**Verification note** (flagged by research): Pitfall 10 (Lanchester's square law) cannot be verified by reading code. Plan 05-03 is a scheduled activity, not a review step, and it is a gate on the phase — not optional polish.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

Phases 3 and 4 both depend only on Phase 2 and touch disjoint file sections, so they may run in
parallel if desired.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation — Data, State Funnel & Undo | 0/2 | Not started | - |
| 2. Allocation Surface | 0/2 | Not started | - |
| 3. Advisory Projection & Reference Material | 0/2 | Not started | - |
| 4. Share & Reset | 0/2 | Not started | - |
| 5. Fight Loop & Playtest | 0/3 | Not started | - |

## Coverage

All 40 v1 requirements are mapped to exactly one phase. See REQUIREMENTS.md Traceability.

| Phase | Requirements | Count |
|-------|--------------|-------|
| 1 | ALLOC-08, UX-01, UX-03, UX-04 | 4 |
| 2 | ALLOC-01…07, UX-02, UX-05 | 9 |
| 3 | PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-06, REF-01, REF-02 | 7 |
| 4 | SHARE-01…06 | 6 |
| 5 | FIGHT-01…11, PROJ-05, REF-03, SHARE-07 | 14 |
| | **Total** | **40** |

**Three requirements were deliberately pulled forward into Phase 5** rather than staying with their
category, because their observable behaviour only exists once the fight view does: PROJ-05 (the
projection stays visible during the fight), REF-03 (reference material readable without leaving the
fight view), and SHARE-07 (reset the fight without discarding the build). Phases 3 and 4 must build
their panels and reset machinery mode-agnostically so Phase 5 can satisfy these without rework.

---
*Roadmap created: 2026-08-26*
