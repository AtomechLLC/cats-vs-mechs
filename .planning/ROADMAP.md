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
- [ ] **Phase 2.1: Token Authoring (INSERTED)** - Students name their tokens and invent new ones, so the vocabulary stops being ours and starts being theirs
- [ ] **Phase 3: Advisory Projection & Reference Material** - What the allocation implies, and what the tool refuses to decide for the student
- [ ] **Phase 3.1: Action Authoring (INSERTED)** - Students program their own actions — a cost, a requirement, and what changes — and the tool proposes rather than decides
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
- [x] 01-01-PLAN.md — File skeleton (TOC + `[S00]`–`[S10]` section banners), `<style>` on the course design tokens, static shell markup, frozen `DEFAULTS`, pure `model` derivations, `#selftest` harness and report — owns `data` / `model` / `selftest` plus the whole scaffold (wave 1)
- [x] 01-02-PLAN.md — `state` slices + `commit()` funnel + snapshot undo + rAF `invalidate`, `ops` transformer layer, `boot` with try/catch error panel and Ctrl+Z — owns `state` / `ops` / `boot` and the `[S09.3]` state-contract suite (wave 2, blocking human-verify checkpoint)

### Phase 2: Allocation Surface
**Goal**: A student can build both rosters on screen — setting health and action points with steppers, adding and removing units — and the display holds up under rapid live operation
**Depends on**: Phase 1
**Requirements**: ALLOC-01, ALLOC-02, ALLOC-03, ALLOC-04, ALLOC-05, ALLOC-06, ALLOC-07, ALLOC-09, UX-02, UX-05
**Success Criteria** (what must be TRUE):
  1. A student can set any unit's health and either faction's shared action-point pool with +/− steppers, by typing a delta (`-8`, `+5`) into the field, or with arrow keys — and the token rows reflect it immediately.
  2. Allocation reads as the board's own vocabulary — green squares for health, yellow triangles for actions, blue squares for shield, red diamonds for damage — and rows compact to a count above a readable threshold instead of overflowing the row.
  3. A student can add and remove units on either side, and the roster rebuilds without losing scroll position or the keyboard focus ring.
  4. Clicking a stepper twenty times as fast as possible produces exactly twenty changes, and press-and-hold ramps continuously — with no token animation restarting, no focus jumping, and no dropped input.
  5. Every value and label is legible on a projector at the back of a room, nothing is conveyed by hover alone, and the page reads as a sibling of `game-feel-study-guide.html` (same dark palette and design tokens).
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [ ] 02-01-PLAN.md — Static shell roots, the `<style>` board surface (`[C03]`–`[C06]`), the token vocabulary as data, and both tiers of `[S06] RENDER` — owns `[S06]`, the `<style>` block and the `[S01]` `tokens` map (wave 1)
- [ ] 02-02-PLAN.md — `[S05]` nudge/shield/roster transformers + `[S07] INTERACTIONS` (pointerdown steppers, press-and-hold ramp, delta typing, arrow keys) + the stub-DOM ALLOC-07 gate in `tests/selftest-node.cjs` — owns `[S07]`, the `[S05]` additions and the harness (wave 2)
- [ ] 02-03-PLAN.md — Curated glyph set, the allowlisted `setTokenStyle` write path and the appearance picker (ALLOC-09), then the blocking projector rehearsal — owns `[S01]` `GLYPHS`, `[S05].setTokenStyle`, `[C07]`, `[S06.2]`, `[S07.2]` (wave 3, blocking human-verify checkpoint)

**Plan-split note (set during planning):** all three plans modify the same single HTML file, so
they run in strictly sequential waves rather than in parallel. Two ROADMAP assignments moved:
the `[S01]` token-vocabulary map and `[C05] TOKENS-VIZ` went from 02-03 to 02-01, because 02-01
must render the board's four token types in wave 1 and cannot render them from data that does
not exist yet. Recorded in both plans' frontmatter.

### Phase 2.1: Token Authoring (INSERTED)
**Goal**: A student can name any token type and invent new ones of their own, so the board's vocabulary becomes something they authored rather than something the tool handed them
**Depends on**: Phase 2 (the picker, the data-driven renderer and the token vocabulary all ship there)
**Requirements**: ALLOC-10, ALLOC-11
**Success Criteria** (what must be TRUE):
  1. A student can give any token type a name, and that name appears wherever the token type is presented — in the picker, and anywhere the board labels a row.
  2. A student can create a new token type, choosing its name, shape, colour and emoji from the same allowlists the built-in types use, and it renders on the board exactly like a built-in one.
  3. A student-created token counts nothing on its own. It carries a per-unit or per-faction tally the student increments by hand — the tool tracks the number and never infers what it means.
  4. A student can remove a token type they created. The five built-in types (health, actions, shield, damage, dead) cannot be removed, because the rest of the board is bound to them.
  5. Creating a token type cannot corrupt the board: an id that collides with a built-in, or with a JavaScript object-prototype key, is refused by name with a message rather than silently accepted.
**Plans**: 6 plans
**UI hint**: yes

Plans:
- [ ] 02.1-01-PLAN.md — `[S01]` vocabulary (`name` on every record, `TOKEN_ID_PATTERN`, `RESERVED_KEYS`, `MAX_CUSTOM_TYPES`, `TOKEN_SCOPES`, the name cap) + the `[S05]` id and name guards + `setTokenStyle` rewired onto them + the `[S09.7]` suite frame (wave 1)
- [ ] 02.1-02-PLAN.md — the five `[S05]` authoring ops: create, remove, rename, set and nudge a tally, with sparse nested tally storage and a row per reserved key per write shape (wave 2)
- [ ] 02.1-03-PLAN.md — the board draws a student-made type: `labelFor` + the `[data-lbl]` sync pass, the `amountFor` scope branch, the builder loops, the zero-tally hide pass, `[C03]`, and the one deliberate `[S07.1]` edit (wave 3)
- [ ] 02.1-04-PLAN.md — the picker becomes a list plus an editor: new `<dialog>` nodes and `[C07]` styles, the whole-vocabulary fingerprint replacing the four-field signature, `TOKEN_NAMES` deleted, `KNOWN_IDS` grown to match (wave 4)
- [ ] 02.1-05-PLAN.md — one Tokens button and the flows behind it: the topbar collapse, `[S07.2]` select / create / remove / rename handlers, the dialog `cancel` listener, and the harness selectors and gate checks D-07's collapse invalidates (wave 5)
- [ ] 02.1-06-PLAN.md — the closing rehearsal: the topbar collapse as its own numbered check per D-06, plus the four behaviours no Node stub can reach (wave 6, blocking human-verify checkpoint)

**Plan-split note (set during planning):** ROADMAP originally named two work units and assigned
section ownership between them. That ownership is preserved exactly — plans 02.1-01 and 02.1-02 are
the `[S01]` + `[S05]` unit; plans 02.1-03 through 02.1-05 are the authoring-surface unit; 02.1-06 is
the checkpoint split out on its own. The unit count grew from 2 to 6 because everything lands in one
HTML file, so plans cannot run in parallel and each is instead capped at 2–3 tasks to stay inside a
single context window. Waves are strictly sequential for the same reason: every plan modifies
`cats-vs-mechs.html`, so no two share a wave.

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
**Plans**: 5 plans
**UI hint**: yes

Plans:
- [ ] 03-01-PLAN.md — The no-verdict gate made mechanical: `VERDICT_WORDS` whole-file scan, a string-literal-only scan, and a rendered-page walk in the interaction gate — owns `tests/selftest-node.cjs` plus one comment reword (wave 1)
- [ ] 03-02-PLAN.md — `soakTotal` + `turnsToWipe` in `[S02] MODEL`, guarded against Infinity and NaN, and `[S09.8]`'s DOM-free half including the proof that a range actually appears — owns `[S02]` and `[S09.8]` (wave 2)
- [ ] 03-03-PLAN.md — `[S06.3] RENDER — PROJECTION` on `SYNC_HOOKS`, `[C10]` styles plus the one `[C03]` `#strip` edit, the permanent "this projection ignores" list, and the DOM assertions — owns `[S06.3]`, `[C10]`, `[S09.8]`'s DOM half (wave 3)
- [ ] 03-04-PLAN.md — Human-approved effect-card copy, then the frozen `REFERENCE` constant in `[S01]` and `[S09.9]`'s DOM-free half — owns `[S01].REFERENCE` and `[S09.9]` (wave 4, blocking decision checkpoint)
- [ ] 03-05-PLAN.md — `#refband` + `[S06.4] RENDER — REFERENCE`, action and effect cards appended by `buildColumn`, `[C11]` styles, and `[S09.9]`'s DOM half — owns `[S06.4]`, `[C11]`, the shell band and `KNOWN_IDS` (wave 5)

**Plan-split note (set during planning):** ROADMAP named two work units and assigned section
ownership between them. That ownership is preserved — 03-02 and 03-03 are the projection unit,
03-04 and 03-05 are the reference-material unit, and 03-01 is the PROJ-06 gate split out in front of
both so every later plan is policed the moment it writes a word. The unit count grew from 2 to 5
because everything lands in one HTML file: plans cannot run in parallel, waves are strictly
sequential, and each is capped at 2–3 tasks to stay inside a single context window. One cross-plan
edit is declared rather than hidden — plan 03-05 appends to `[S06.1] buildColumn`, which plan 02-01
owns; wave ordering, not overlapping ownership, is what makes it safe.

**Two naming facts settled during planning:** PROJ-04's own noun ("counters") and REF-01's own name
("counter map") are both unwritable — `counter` is a zero-hit acceptance grep and the feature cannot
be named after itself. The list renders **Matchups**; the band heading renders **What beats what**.

**D-05 versus PITFALLS.md Pitfall 2, resolved:** D-05 is later and locked, so a collapsed single
number is a feature, not a defect. The bounds are two independently derived quantities rather than a
decorative ±, and they agree on the shipped board because nothing is wasted at 1 and 3 damage. Plans
03-02 and 03-03 each carry an assertion that drives a real overkill allocation and reads a real
range back, so the feature is demonstrated rather than argued.

**Design decision to settle before code** (flagged by research): the projection's unit and its visual weight relative to the fight's own output. Turns-to-wipe is chosen so the post-fight comparison lands as "you guessed 3–5, it took 8". The live number must never be the loudest element on screen.

### Phase 3.1: Action Authoring (INSERTED)
**Goal**: A student can program an action of their own — what it costs, what it needs, and what it changes — and the tool shows what their rule would do while leaving every ruling to them
**Depends on**: Phase 2.1 (the token vocabulary an action's cost, requirement and transformations all name) and Phase 3 (the projection an authored action changes the meaning of)
**Requirements**: ACT-01, ACT-02, ACT-03, ACT-04, ACT-05, ACT-06, ACT-07
**Success Criteria** (what must be TRUE):
  1. A student can create an action on either faction, name it, and give it a cost — a token type and an amount — which defaults to one action point and is consumed when the action fires.
  2. A student can give an action requirements: token types and amounts that must be present for it to be available, and that are **not** consumed by it.
  3. A student can give an action transformations: each naming the caster or the target, a token type, and the amount that token changes by. An action may carry more than one.
  4. **The tool proposes and the student disposes.** Firing an authored action shows what that student's own rule says would happen — which tokens move, on whom, by how much — and the student accepts it, edits any number in it, or overrides it entirely. **Nothing lands until they say so, and the tool never decides whether an action happens or what it is worth.**
  5. An action naming a token type that has since been removed is refused by name with a message that says which action and which token, rather than being silently skipped or firing with a missing term.
**Plans**: TBD
**UI hint**: yes

**Why this is not automated combat.** PROJECT.md excludes an engine that resolves combat, on the
grounds that adjudication *is* the exercise. This phase does not resolve anything: the student
authors the rule, and the tool reads their own rule back to them and waits. That is bookkeeping of
a student's design, not a judgement about it — the same line the projection already walks. The
developer chose this explicitly over auto-apply on 2026-08-28; auto-apply would have needed the
Out of Scope entry rewritten and was declined.

**What this changes downstream.** Phase 4's build code must carry authored actions (SHARE-08,
widened a third time). Phase 5's fight loop consumes them rather than taking raw manual entry —
FIGHT-12 adds the per-side action sequence, and FIGHT-03/FIGHT-04 become the propose-confirm path
rather than bare numeric input. Phase 5 has no plans yet, so nothing is rebuilt.

**A note for the planner on the projection.** `bestDamage` is `max(action.dmg)` — one scalar per
faction — and Phase 3's whole projection rests on it. An action that costs two points, heals its
caster, or moves a student-made token does not reduce to that. Deciding what the projection means
once actions are programmable is part of this phase, not an afterthought.

### Phase 4: Share & Reset
**Goal**: A student can copy a build code short enough to post in the Discord thread, load a classmate's, and get back to Workshop 16 defaults without ever loading garbage silently
**Depends on**: Phase 2, Phase 2.1 and Phase 3.1 (build shape must be stable — 2.1 opens the token id space and 3.1 adds authored actions, so SHARE-08 carries type definitions and action definitions, not just restyles)
**Requirements**: SHARE-01, SHARE-02, SHARE-03, SHARE-04, SHARE-05, SHARE-06, SHARE-08
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
**Goal**: A student declares what both sides do, advances the round, and reads what changed — with the tool doing bookkeeping and the student doing adjudication — and the shipped default is confirmed contested by actually playing it
**Depends on**: Phase 1, Phase 2, Phase 3, Phase 3.1, Phase 4
**Requirements**: FIGHT-01 … FIGHT-16, PROJ-05, REF-03, SHARE-07
**Success Criteria** (what must be TRUE):
  1. A student can start a fight from the current build, advance and rewind turn and round by hand — the tool never advances on its own, not even when a side's action points hit zero — and can reset the fight to turn one without discarding the build. Whose turn it is and what remains to spend are unambiguous from across the room, with spent action points visibly distinct from available ones.
  2. A student can apply damage to an individual unit; a unit reaching zero health is marked dead, stays visible in the roster rather than disappearing, and can be toggled back alive by hand so a Shield or Evade ruling is representable.
  3. Any tracked value can be overridden at any point from wherever it is displayed, the override is visibly marked as one, and the combat log records each turn's actions and every override in readable order.
  4. Editing the build mid-fight applies to the build rather than retroactively to the fight in progress, and the tool says so on screen. Throughout the fight the per-side projection and the counter map / effect cards stay readable without navigating away — and still render no verdict, badge, traffic light, or balance judgement of any kind.
  5. **Playtest gate — this is a played fight, not a code review.** A person plays the shipped 9-Cats-vs-3-Mechs default end to end at least twice, hot-seat, adjudicating counters and effects as a student would. The phase is not complete until neither side wipes the other with a large force advantage remaining (target: the winner finishes with no more than roughly 30% of its starting force intact). If the default blows out — the expected Lanchester square-law outcome for a swarm with focus fire and individual deaths — the default allocation is retuned in `data` and replayed until it doesn't. The playtest result and the tuning applied are recorded.

**THE ROUND LOOP — the developer's own description, 2026-08-28.** This supersedes the
turn-by-turn reading the earlier criteria implied, and it is the shape to build:

  1. The student declares the actions **both sides** will perform this round — and the performer and
     target where the action needs them. Nothing resolves while declaring.
  2. They press **Advance**. The round resolves for both sides at once.
  3. **The previous state of the board moves up into a history**, so earlier rounds stay on screen.
  4. The new state shows **what changed since the previous round** — the student reads the effect of
     their own declaration without reconstructing it.
  5. They declare again and advance to the next round.

Two consequences worth stating. **This is simultaneous declaration, not alternating turns** — one
Advance resolves both sides, which is a different shape from FIGHT-02's original "advance and rewind
turn and round". And the history is a **ledger that accumulates on screen**, not a log panel: the
board's own past states stack upward. The developer explicitly rejected calling a round a "Day".

**Shield.** Damage spends shield before it reaches health (FIGHT-16), and the split is shown rather
than applied silently — which is the propose-not-decide line Phase 3.1 draws, applied to the one
resolution rule the developer specified directly.

**Where Phase 3.1 stops and this starts.** Phase 3.1 makes an action *authorable* and shows what a
student's own rule would do. This phase is where a declared action *lands*, on Advance. That split
is why Phase 3.1 ships a preview rather than an apply.

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
| 2. Allocation Surface | 0/3 | Not started | - |
| 3. Advisory Projection & Reference Material | 0/5 | Not started | - |
| 4. Share & Reset | 0/2 | Not started | - |
| 5. Fight Loop & Playtest | 0/3 | Not started | - |

## Coverage

All 40 v1 requirements are mapped to exactly one phase. See REQUIREMENTS.md Traceability.

| Phase | Requirements | Count |
|-------|--------------|-------|
| 1 | ALLOC-08, UX-01, UX-03, UX-04 | 4 |
| 2 | ALLOC-01…07, ALLOC-09, UX-02, UX-05 | 10 |
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
