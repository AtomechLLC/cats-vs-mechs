# Requirements: Cats vs Mechs — Workshop 16 Interactive Sample

**Defined:** 2026-08-26
**Core Value:** A student builds two factions that look nothing alike and discovers they can still be balanced — and discovers it by playing, not by being told a number.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Allocation & Roster

- [x] **ALLOC-01**: Student can set each unit's health using +/− steppers
- [x] **ALLOC-02**: Student can set each faction's shared action point pool using +/− steppers
- [x] **ALLOC-03**: Student can type a delta into any numeric field (`-8`, `+5`) and adjust it with arrow keys
- [x] **ALLOC-04**: Allocation displays as token rows matching the board's vocabulary — green squares for health, yellow triangles for actions, blue squares for shield, red diamonds for damage. The vocabulary is data (shape, color, glyph) rather than fixed cases, so new token types are a data edit
- [x] **ALLOC-05**: Token rows compact above a readable count threshold instead of overflowing the row
- [x] **ALLOC-06**: Student can add and remove units on either side
- [x] **ALLOC-07**: Rapid stepper clicks and press-and-hold register every input without losing keyboard focus, scroll position, or restarting token animations
- [x] **ALLOC-08**: Cats and Mechs load prebuilt with the Workshop 16 board's actions, damage, keywords and starting allocation
- [x] **ALLOC-09**: Student can edit a token type's appearance — shape, color and emoji — from the UI, with the shape and color carrying the meaning independently of the emoji
- [x] **ALLOC-10**: Student can give a token type a name, shown wherever that token type is presented
- [ ] **ALLOC-11**: Student can create and remove their own token types, which count nothing on their own — a free annotation the student increments by hand to track a mechanic they invented — **code-complete and code-verified; awaiting one itemised browser rehearsal, see F-02.1-B**

### Action Authoring

- [x] **ACT-01**: Student can create, rename and remove their own actions on either faction, alongside the shipped ones
- [x] **ACT-02**: An action carries a cost — a token type and an amount that is **consumed** when it fires (default: one action point)
- [x] **ACT-03**: An action carries requirements — token types and amounts that must be present but are **not** consumed
- [x] **ACT-04**: An action carries transformations — each names the caster or the target, a token type, and the amount that token changes by
- [x] **ACT-05**: The tool proposes what an authored action would do and the student accepts, edits the numbers, or overrides it entirely before anything lands — the tool never applies a transformation on its own
- [x] **ACT-06**: The tool reports whether a cost is affordable and a requirement met, and never decides whether the action happens
- [x] **ACT-07**: An action whose cost, requirement or transformation names a token type that has since been removed is refused by name with a message, and never silently skipped

### Fight

- [x] **FIGHT-01**: Student can start a fight from the current build
- [x] **FIGHT-02**: Student can advance and rewind turn and round; the tool never advances on its own
- [x] **FIGHT-12**: Student declares the actions both sides will perform this round — and the performer and target where the action needs them — before anything resolves
- [x] **FIGHT-13**: One **Advance** control resolves the declared round for both sides at once; the tool never advances on its own
- [ ] **FIGHT-14**: On advancing, the previous state of the board moves up into a visible history, so earlier rounds stay on screen and readable rather than being replaced
- [ ] **FIGHT-15**: The current board shows what changed since the previous round, so a student can see the effect of what they just declared without reconstructing it
- [ ] **FIGHT-16**: Damage spends shield before it reaches health, and the tool shows that split rather than applying it silently
- [x] **FIGHT-03**: Student can spend a faction's action points during its turn, with spent points visibly distinct from available ones
- [x] **FIGHT-04**: Student can apply damage to an individual unit
- [x] **FIGHT-05**: A unit reaching zero health is marked dead but can be manually toggled alive or dead, so a student's Shield or Evade ruling is representable
- [x] **FIGHT-06**: Dead units stay visible in the roster rather than disappearing
- [x] **FIGHT-07**: Student can manually override any tracked value at any point, and the override is visibly marked as one
- [ ] **FIGHT-08**: Combat log records each turn's actions and every manual override
- [x] **FIGHT-09**: Whose turn it is and what remains to spend are unambiguous at a glance
- [ ] **FIGHT-10**: Student can edit the build mid-fight; edits apply to the build rather than retroactively to the fight in progress, and the tool says so
- [ ] **FIGHT-11**: The shipped 9-Cats-vs-3-Mechs default produces a genuinely contested fight — verified by playing it to completion, not by code review

### Projection

- [ ] **PROJ-01**: An effective-HP and time-to-wipe projection displays per side and updates as allocation changes
- [ ] **PROJ-02**: The projection is expressed as a range in the fight's own unit ("≈3–5 turns to wipe"), never as an abstract score
- [ ] **PROJ-03**: The arithmetic producing the projection is visible on screen
- [ ] **PROJ-04**: A permanent, always-visible list states what the projection ignores — counters, effects, focus fire, overkill, and the student's own rulings
- [ ] **PROJ-05**: The projection stays visible during the fight, so the student sees it at the moment the fight contradicts it
- [ ] **PROJ-06**: The projection never renders a verdict, traffic light, difficulty badge, or balance judgement

### Reference Material

- [ ] **REF-01**: The counter map (Slash < Fly, Hairball < Lasers, Fly < Recharge) displays as reference material
- [ ] **REF-02**: Effect keywords (Shield, Slowdown, Confuse, Evade, Range) display as cards on the actions that carry them
- [x] **REF-03**: Reference material is readable without leaving the fight view

### Share & Reset

- [x] **SHARE-01**: Student can copy a compact build code to the clipboard
- [x] **SHARE-02**: Student can paste a build code to load someone else's build
- [x] **SHARE-03**: A build code round-trips exactly; a malformed or wrong-version code fails with a clear message rather than silently loading garbage
- [x] **SHARE-04**: The build code stays well under Discord's 2000-character message limit at realistic roster sizes
- [x] **SHARE-05**: The current build mirrors to `location.hash` for the student's own reload and bookmark, without being presented as the sharing mechanism
- [x] **SHARE-06**: Student can reset to Workshop 16 board defaults, behind a confirmation
- [x] **SHARE-07**: Student can reset the fight without discarding their build
- [x] **SHARE-08**: Custom token appearance, names, student-created token types and authored actions all round-trip through the build code, so a shared build looks and behaves the same for the recipient

### Usability & Delivery

- [x] **UX-01**: Student can undo any change with Ctrl+Z, roughly 30 steps deep, with press-and-hold coalesced into single entries
- [x] **UX-02**: Every piece of information is legible on a projector, with nothing conveyed by hover alone — *the hover-only half is verified; the projector half was approved without a recorded display or distance, so Q-4 stays formally open (gap G-02-B)*
- [x] **UX-03**: A runtime error surfaces a styled error panel rather than a blank page
- [x] **UX-04**: Ships as one self-contained HTML file that opens offline by double-click with no build step, no runtime network calls, and no external dependencies
- [x] **UX-05**: Visual language matches the sibling course artifacts' palette and design tokens

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Teaching Instrumentation

- **TEACH-01**: Predict-then-play — student commits a prediction before the fight, revealed against the actual result afterward
- **TEACH-02**: Divergence callout naming why projection and reality parted (focus fire, Lanchester's square law, action economy)
- **TEACH-03**: Side-by-side normalized comparison bars showing two dissimilar builds as comparable
- **TEACH-04**: Overkill and wasted-damage tracking
- **TEACH-05**: Stacked contribution breakdown (offense / durability / action economy / count)

### Convenience

- **CONV-01**: Scenario presets ("swarm vs elite", "glass cannon", "deliberately broken")
- **CONV-02**: One-click projector "present" mode raising font size and contrast
- **CONV-03**: A/B build snapshot comparison
- **CONV-04**: Full keyboard-first operation
- **CONV-05**: Sensitivity / what-if readout

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Automated combat resolution | Students adjudicate effects and counters themselves — that adjudication *is* the exercise |
| Simulated counters | The counter map is reference material; students decide when a counter applies |
| Difficulty verdict badge (Trivial→Extreme, traffic light, balance meter) | Every tool in the reference class ships one, and it would undo the entire pedagogy in a single component. The most likely accidental scope violation in the project |
| AI opponent | Hot seat only; AI quality would color every balance read |
| Point budget / spend cap | Balance is proven by playing, not by hitting a limit |
| Batch simulation / win-rate statistics | Would make the projection authoritative — the exact framing this tool avoids |
| Dice / RNG | Variance would make a single played fight uninformative |
| Grid, range, or movement measurement | The stat model has no positional dimension |
| Per-unit initiative order | Conflicts with the shared faction AP pool |
| Committed attack resolution | Auto-resolution wearing a bookkeeping costume |
| Status effect timers with auto-expiry | Auto-adjudication by another name |
| Faction authoring from scratch | The instructor-led whiteboard step that precedes this tool |
| Charting library | Nothing here needs one; violates the zero-dependency constraint |
| Cross-session win/loss records | Requires persistence; encourages optimizing a score |
| Shareable `file://` URL | Leaks the student's real name via their home directory path, doesn't work for the recipient, and Discord won't linkify it. Replaced by SHARE-01/02 |
| Build tooling (React/Vite/npm) | Breaks the course's one-file convention and requires a served build |
| Persistence / accounts / backend | Sharing is a build code; nothing is stored server-side |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ALLOC-01 | Phase 2 | Complete |
| ALLOC-02 | Phase 2 | Complete |
| ALLOC-03 | Phase 2 | Complete |
| ALLOC-04 | Phase 2 | Complete |
| ALLOC-05 | Phase 2 | Complete |
| ALLOC-06 | Phase 2 | Complete |
| ALLOC-07 | Phase 2 | Complete — automated gate 14/14 (twenty `pointerdown` → twenty commits, one undo entry); the human hand-count was approved in aggregate but never recorded as a number (gap G-02-A) |
| ALLOC-08 | Phase 1 | Complete |
| ALLOC-09 | Phase 2 | Complete |
| ALLOC-10 | Phase 2.1 | Complete — every token record carries a `name`; rename commits through the op, and gate check 30 asserts the picker list row, the picker heading and the board label all repaint from the same rename. Confirmed by a human in aggregate ("token config works"), not itemised. |
| ALLOC-11 | Phase 2.1 | **Code-complete, awaiting human confirmation.** Create, remove (one undoable step) and the appearance surface are covered by gate checks 31, 33 and 35. The **"increments by hand"** half was blocked by F-02.1-A — a never-written tally could not be raised at all (24 nudge buttons and 12 tally fields built for a fresh unit-scope type, 0 of 36 reachable). **F-02.1-A's reveal-on-select did not close it**: the editor is modal, so its backdrop owned every pointer and the revealed line was visible but unpressable. **F-02.1-B closed it** by letting the reveal survive the editor closing (commit `ce6f61e`); reverting that one line turns 2 of the 430 rows red. Still unticked only because no one has raised a tally by hand in a real browser — the rehearsal never attempted it, because at the time it was impossible. |
| ACT-01 | Phase 3.1 | Complete |
| ACT-02 | Phase 3.1 | Complete |
| ACT-03 | Phase 3.1 | Complete |
| ACT-04 | Phase 3.1 | Complete |
| ACT-05 | Phase 3.1 | Complete |
| ACT-06 | Phase 3.1 | Complete |
| ACT-07 | Phase 3.1 | Complete |
| FIGHT-01 | Phase 5 | Complete |
| FIGHT-02 | Phase 5 | Complete |
| FIGHT-03 | Phase 5 | Complete |
| FIGHT-04 | Phase 5 | Complete |
| FIGHT-05 | Phase 5 | Complete |
| FIGHT-06 | Phase 5 | Complete |
| FIGHT-07 | Phase 5 | Complete |
| FIGHT-08 | Phase 5 | Pending |
| FIGHT-09 | Phase 5 | Complete |
| FIGHT-10 | Phase 5 | Pending |
| FIGHT-11 | Phase 5 | Pending |
| FIGHT-12 | Phase 5 | Complete |
| FIGHT-13 | Phase 5 | Complete |
| FIGHT-14 | Phase 5 | Pending |
| FIGHT-15 | Phase 5 | Pending |
| FIGHT-16 | Phase 5 | Pending |
| PROJ-01 | Phase 3 | Pending |
| PROJ-02 | Phase 3 | Pending |
| PROJ-03 | Phase 3 | Pending |
| PROJ-04 | Phase 3 | Pending |
| PROJ-05 | Phase 5 | Pending |
| PROJ-06 | Phase 3 | Pending |
| REF-01 | Phase 3 | Pending |
| REF-02 | Phase 3 | Pending |
| REF-03 | Phase 5 | Complete |
| SHARE-01 | Phase 4 | Complete |
| SHARE-02 | Phase 4 | Complete |
| SHARE-03 | Phase 4 | Complete |
| SHARE-04 | Phase 4 | Complete |
| SHARE-05 | Phase 4 | Complete |
| SHARE-06 | Phase 4 | Complete |
| SHARE-07 | Phase 5 | Complete |
| SHARE-08 | Phase 4 | Complete |
| UX-01 | Phase 1 | Complete |
| UX-02 | Phase 2 | Complete — the "nothing hover-only" half is delivered and keyboard-verified; the projector-legibility half was approved in aggregate, but no display or viewing distance was recorded, so Q-4 stays formally open (gap G-02-B). `--tok` remains `22px`. |
| UX-03 | Phase 1 | Complete |
| UX-04 | Phase 1 | Complete |
| UX-05 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 56 total
- Mapped to phases: 56 ✓
- Unmapped: 0

| Phase | Requirements | Count |
|-------|--------------|-------|
| 1. Foundation — Data, State Funnel & Undo | ALLOC-08, UX-01, UX-03, UX-04 | 4 |
| 2. Allocation Surface | ALLOC-01…07, ALLOC-09, UX-02, UX-05 | 10 |
| 2.1 Token Authoring (INSERTED) | ALLOC-10, ALLOC-11 | 2 |
| 3.1 Action Authoring (INSERTED) | ACT-01…07 | 7 |
| 3. Advisory Projection & Reference Material | PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-06, REF-01, REF-02 | 7 |
| 4. Share & Reset | SHARE-01…06, SHARE-08 | 7 |
| 5. Fight Loop & Playtest | FIGHT-01…16, PROJ-05, REF-03, SHARE-07 | 14 |

PROJ-05, REF-03 and SHARE-07 sit in Phase 5 rather than with their category, because each only
becomes observable once the fight view exists.

---
*Requirements defined: 2026-08-26*
*Last updated: 2026-08-28 after Phase 2.1 code review, fixes and verification — ALLOC-10 complete; ALLOC-11 left
unticked as partial, its "increments by hand" half blocked by F-02.1-A*
