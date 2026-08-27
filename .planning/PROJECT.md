# Cats vs Mechs — Workshop 16 Interactive Sample

## What This Is

An interactive, single-file HTML teaching artifact for Workshop 16 of the Game Feel / Direction course. It turns the workshop's static whiteboard — two factions, their actions and keywords, a counter map, and a resource-token balance pass — into something students can actually operate: allocate health, damage, action points and effects across two rosters, then play a turn-based Cats vs Mechs fight hot-seat and watch what their allocation did.

It is not a game engine. The tool does bookkeeping and projection; **the students are the rules engine.**

## Core Value

A student builds two factions that look nothing alike and discovers they can still be balanced — and discovers it by playing, not by being told a number.

## Requirements

### Validated

- [x] Ships as one self-contained HTML file that opens offline by double-click — *Validated in Phase 1: Foundation — Data, State Funnel & Undo*
- [x] Cats and Mechs ship prebuilt with their board actions (Slash / Hairball / Screech, Fly / Lasers / Recharge) and attached damage and keywords — *Validated in Phase 1: Foundation — Data, State Funnel & Undo* (data layer frozen and self-tested; on-screen display arrives in Phase 3)

### Active

- [ ] Student can allocate per-unit health and faction-level action points across both factions using +/− steppers
- [ ] Allocation displays as token rows (green squares, yellow triangles, red diamonds) mirroring the workshop board
- [ ] Student can add and remove units per side, so 9 Cats vs 3 Mechs is a starting point rather than a fixed roster
- [ ] Student can play a turn-based fight hot-seat, controlling both sides
- [ ] Units die individually, so focus fire and overkill waste are visible
- [ ] Action points are a shared faction pool spent across the whole team each turn
- [ ] An effective-HP vs DPS projection displays per side and updates as allocation changes
- [ ] The projection is advisory only — the tool never declares a build "balanced"
- [ ] Counter map (Slash < Fly, Hairball < Lasers, Fly < Recharge) displays as reference material
- [ ] Effects (Shield, Slowdown, Confuse, Evade, Range) display as reference cards on their actions
- [ ] Student can manually adjust any tracked value at any time, to record rulings they made at the table
- [ ] Student can copy a compact build code for the Discord thread, and paste one to load a classmate's build
- [ ] Student can reset to the Workshop 16 board defaults at any point

### Out of Scope

- **Automated combat resolution** — Students adjudicate effects and counters themselves; that adjudication *is* the exercise. An engine that resolved them would remove the learning.
- **Simulated counters** — The counter map is reference material. Students decide when a counter applies and adjust the outcome accordingly.
- **AI opponent** — Hot seat only. When the lesson is balance rather than skill, the student needs to see both sides' options, and AI quality would color every balance read.
- **Point budget / cost cap** — Deliberately absent. Balance is judged by playing the fight, not by hitting a spend limit. A cap would teach "stay under budget" instead of "make asymmetry work."
- **Batch simulation / win-rate statistics** — Would make the projection authoritative, which is exactly the framing this tool avoids.
- **Faction authoring from scratch** — Students tune the prebuilt Cats vs Mechs. Inventing new factions is the instructor-led whiteboard step that precedes this tool.
- **Build tooling (React/Vite/npm)** — Breaks the course's one-file convention and requires a served build.
- **Persistence / accounts / backend** — Sharing is a copyable build code. Nothing is stored server-side.
- **Shareable `file://` URL** — Research found it embeds the student's home directory path (leaking their real name into a public course Discord), doesn't work for the recipient whose copy lives elsewhere, and isn't linkified by Discord at all. Replaced by a build code.
- **Difficulty verdict badge** — Every tool in the reference class (Kobold Fight Club, PF2e Encounter Builder) centers a color-coded Trivial→Extreme readout. It is a verdict, and it would undo the entire pedagogy in one component. Research flags it as the most likely accidental scope violation in the project.

## Context

**Course setting.** This sits in `GameFeelDirectionCourse/` alongside `game-feel-study-guide.html` (57KB) and `game-feel-types-frameworks.html` (29KB). Both are single-file, dark-themed, sidebar-navigated HTML artifacts sharing a design token set (`--bg:#0e1014`, `--ink:#e8ebf2`, `--accent:#5cc8ff`, `--accent-2:#ff7eb6`, `--gold:#ffd166`, `--green:#5bd99c`, `--violet:#b98cff`, `--radius:14px`, Segoe UI stack, radial-gradient background). The new artifact should read as part of that set. Note that those siblings are *documents*; this one is an *instrument*, so its layout will diverge — the shared vocabulary is color, type and surface treatment, not structure.

**Source material.** The workshop board ("Workshop 16 - Cats vs Mechs") lays out an instructor-led sequence: create two unique factions → brainstorm actions and keywords each side could use → map which abilities counter which using keywords → experiment with an initial balance using resources → post ideas in the Discord thread. The board shows Cats with Slash (1 damage), Hairball (Slowdown), Screech (Confuse); Mechs with Fly (Evade), Lasers (3 damage, Range), Recharge (Shield). Resources are drawn as token rows: Health as green squares, Actions as yellow triangles, Shield as blue squares, Damage as red diamonds. Expected counters: Slash < Fly, Hairball < Lasers, Fly < Recharge. The board's example matchup is 9 Cats vs 3 Mechs — swarm against elite.

**Stat model divergence from the board.** The board groups Health *and* Actions under a faction-level "Resources" heading. The project deliberately splits these: health is per-unit (so units die individually and focus fire matters), while action points stay a shared faction pool. This hybrid was chosen over both the literal board reading and a conventional per-unit model.

**Design tension worth preserving.** The tool shows an effective-HP vs DPS projection, but balance is judged by playing. These are intentionally allowed to disagree. When a student's fight contradicts the projection, that gap is the most valuable moment the tool produces — it demonstrates that a designer's cost model is a guess. The UI should not paper over this by presenting the projection as a verdict.

**Manual override is a primary interaction, not an escape hatch.** Because effects and counters are student-adjudicated, the ability to nudge any tracked value mid-fight is how those rules get applied at all. It needs to be fast and available everywhere, not buried behind a debug toggle.

## Constraints

- **Tech stack**: Single self-contained HTML file — no build step, no external dependencies, no network calls at runtime. Must open by double-click and work offline, matching the course's existing artifacts.
- **Compatibility**: Must work in a modern desktop browser opened from `file://`. This rules out anything requiring a server (module imports, fetch of local assets).
- **Visual language**: Reuse the sibling artifacts' dark palette and design tokens so it reads as part of the course set.
- **Sharing**: Build state must round-trip through a URL, since there is no backend.
- **Audience**: Students following a workshop, plus an instructor demoing live. Legibility on a shared screen matters as much as usability.
- **Scope discipline**: The temptation to automate combat resolution will recur at every phase. It is excluded by design, not by effort.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Students adjudicate effects and counters; tool does bookkeeping only | The adjudication is the learning. Automating it would produce a game instead of a teaching instrument. | — Pending |
| No point budget or spend cap | Balance is proven by playing, not by hitting a limit. A cap would teach budget compliance rather than asymmetric design. | — Pending |
| Per-unit health, faction-level action points | Units dying individually makes focus fire and overkill legible; a shared AP pool keeps 9-unit rosters tractable and teaches action economy as a team resource. | — Pending |
| eHP/DPS projection is advisory, never authoritative | The projection being wrong is a teaching moment. Declaring balance would destroy it. | — Pending |
| Hot seat, no AI opponent | When the lesson is balance rather than skill, students need visibility into both sides. AI quality would contaminate every balance read. | — Pending |
| Steppers with token-row display, not drag-and-drop | Keeps the board's visual vocabulary while being faster to operate during a live workshop. | — Pending |
| Editable roster counts rather than fixed 9 v 3 | Real asymmetry means changing the *shape* of a side, not only its numbers. | — Pending |
| Single-file HTML, no build tooling | Matches the two existing course artifacts; students can open it offline with no setup. | — Pending |
| Prebuilt Cats vs Mechs rather than blank-slate authoring | Faction invention is the instructor-led whiteboard step. The tool picks up after it. | — Pending |
| Share via copyable build code, not a URL | A `file://` link leaks the student's name via their home directory path, is useless to the recipient, and Discord won't linkify it. A ~35–60 char code is private, portable, and well under Discord's 2000-char limit. Changed after research. | — Pending |
| Projection expressed in turns-to-wipe, not an abstract score | Matching the projection's unit to the fight's outcome unit makes the post-fight comparison land as "you guessed 3–5, it took 8" — and resists students optimizing the number instead of playing. | — Pending |
| Board defaults get playtested and tuned, not shipped as-is | Lanchester's square law means 9v3 with focus fire and individual deaths can be a blowout that teaches "more bodies wins" — the inverse of the intended lesson. Verification is a played fight, not a code review. | — Pending |
| Predict-then-play deferred to v2 | Adds a step between the student and playing. Ship the instrument first. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-27 after Phase 1 completion*

**Current state:** Phase 1 complete — `cats-vs-mechs.html` opens offline as a self-proving skeleton. Workshop 16 data is deep-frozen, every mutation routes through one `commit()` funnel, 30-deep coalescing undo works, and a styled error boundary replaces the blank-page failure mode. 57 in-file assertions pass. No UI yet; Phase 2 puts the board on screen.
