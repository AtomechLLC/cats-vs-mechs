# Requirements: Cats vs Mechs — Workshop 16 Interactive Sample

**Defined:** 2026-08-26
**Core Value:** A student builds two factions that look nothing alike and discovers they can still be balanced — and discovers it by playing, not by being told a number.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Allocation & Roster

- [ ] **ALLOC-01**: Student can set each unit's health using +/− steppers
- [ ] **ALLOC-02**: Student can set each faction's shared action point pool using +/− steppers
- [ ] **ALLOC-03**: Student can type a delta into any numeric field (`-8`, `+5`) and adjust it with arrow keys
- [ ] **ALLOC-04**: Allocation displays as token rows matching the board's vocabulary — green squares for health, yellow triangles for actions, blue squares for shield, red diamonds for damage. The vocabulary is data (shape, color, glyph) rather than fixed cases, so new token types are a data edit
- [ ] **ALLOC-05**: Token rows compact above a readable count threshold instead of overflowing the row
- [ ] **ALLOC-06**: Student can add and remove units on either side
- [ ] **ALLOC-07**: Rapid stepper clicks and press-and-hold register every input without losing keyboard focus, scroll position, or restarting token animations
- [x] **ALLOC-08**: Cats and Mechs load prebuilt with the Workshop 16 board's actions, damage, keywords and starting allocation
- [ ] **ALLOC-09**: Student can edit a token type's appearance — shape, color and emoji — from the UI, with the shape and color carrying the meaning independently of the emoji

### Fight

- [ ] **FIGHT-01**: Student can start a fight from the current build
- [ ] **FIGHT-02**: Student can advance and rewind turn and round; the tool never advances on its own
- [ ] **FIGHT-03**: Student can spend a faction's action points during its turn, with spent points visibly distinct from available ones
- [ ] **FIGHT-04**: Student can apply damage to an individual unit
- [ ] **FIGHT-05**: A unit reaching zero health is marked dead but can be manually toggled alive or dead, so a student's Shield or Evade ruling is representable
- [ ] **FIGHT-06**: Dead units stay visible in the roster rather than disappearing
- [ ] **FIGHT-07**: Student can manually override any tracked value at any point, and the override is visibly marked as one
- [ ] **FIGHT-08**: Combat log records each turn's actions and every manual override
- [ ] **FIGHT-09**: Whose turn it is and what remains to spend are unambiguous at a glance
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
- [ ] **REF-03**: Reference material is readable without leaving the fight view

### Share & Reset

- [ ] **SHARE-01**: Student can copy a compact build code to the clipboard
- [ ] **SHARE-02**: Student can paste a build code to load someone else's build
- [ ] **SHARE-03**: A build code round-trips exactly; a malformed or wrong-version code fails with a clear message rather than silently loading garbage
- [ ] **SHARE-04**: The build code stays well under Discord's 2000-character message limit at realistic roster sizes
- [ ] **SHARE-05**: The current build mirrors to `location.hash` for the student's own reload and bookmark, without being presented as the sharing mechanism
- [ ] **SHARE-06**: Student can reset to Workshop 16 board defaults, behind a confirmation
- [ ] **SHARE-07**: Student can reset the fight without discarding their build
- [ ] **SHARE-08**: Custom token appearance round-trips through the build code, so a shared build looks the same for the recipient

### Usability & Delivery

- [x] **UX-01**: Student can undo any change with Ctrl+Z, roughly 30 steps deep, with press-and-hold coalesced into single entries
- [ ] **UX-02**: Every piece of information is legible on a projector, with nothing conveyed by hover alone
- [x] **UX-03**: A runtime error surfaces a styled error panel rather than a blank page
- [x] **UX-04**: Ships as one self-contained HTML file that opens offline by double-click with no build step, no runtime network calls, and no external dependencies
- [ ] **UX-05**: Visual language matches the sibling course artifacts' palette and design tokens

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
| ALLOC-01 | Phase 2 | Pending |
| ALLOC-02 | Phase 2 | Pending |
| ALLOC-03 | Phase 2 | Pending |
| ALLOC-04 | Phase 2 | Pending |
| ALLOC-05 | Phase 2 | Pending |
| ALLOC-06 | Phase 2 | Pending |
| ALLOC-07 | Phase 2 | Pending |
| ALLOC-08 | Phase 1 | Complete |
| ALLOC-09 | Phase 2 | Pending |
| FIGHT-01 | Phase 5 | Pending |
| FIGHT-02 | Phase 5 | Pending |
| FIGHT-03 | Phase 5 | Pending |
| FIGHT-04 | Phase 5 | Pending |
| FIGHT-05 | Phase 5 | Pending |
| FIGHT-06 | Phase 5 | Pending |
| FIGHT-07 | Phase 5 | Pending |
| FIGHT-08 | Phase 5 | Pending |
| FIGHT-09 | Phase 5 | Pending |
| FIGHT-10 | Phase 5 | Pending |
| FIGHT-11 | Phase 5 | Pending |
| PROJ-01 | Phase 3 | Pending |
| PROJ-02 | Phase 3 | Pending |
| PROJ-03 | Phase 3 | Pending |
| PROJ-04 | Phase 3 | Pending |
| PROJ-05 | Phase 5 | Pending |
| PROJ-06 | Phase 3 | Pending |
| REF-01 | Phase 3 | Pending |
| REF-02 | Phase 3 | Pending |
| REF-03 | Phase 5 | Pending |
| SHARE-01 | Phase 4 | Pending |
| SHARE-02 | Phase 4 | Pending |
| SHARE-03 | Phase 4 | Pending |
| SHARE-04 | Phase 4 | Pending |
| SHARE-05 | Phase 4 | Pending |
| SHARE-06 | Phase 4 | Pending |
| SHARE-07 | Phase 5 | Pending |
| SHARE-08 | Phase 4 | Pending |
| UX-01 | Phase 1 | Complete |
| UX-02 | Phase 2 | Pending |
| UX-03 | Phase 1 | Complete |
| UX-04 | Phase 1 | Complete |
| UX-05 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42 ✓
- Unmapped: 0

| Phase | Requirements | Count |
|-------|--------------|-------|
| 1. Foundation — Data, State Funnel & Undo | ALLOC-08, UX-01, UX-03, UX-04 | 4 |
| 2. Allocation Surface | ALLOC-01…07, ALLOC-09, UX-02, UX-05 | 10 |
| 3. Advisory Projection & Reference Material | PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-06, REF-01, REF-02 | 7 |
| 4. Share & Reset | SHARE-01…06, SHARE-08 | 7 |
| 5. Fight Loop & Playtest | FIGHT-01…11, PROJ-05, REF-03, SHARE-07 | 14 |

PROJ-05, REF-03 and SHARE-07 sit in Phase 5 rather than with their category, because each only
becomes observable once the fight view exists.

---
*Requirements defined: 2026-08-26*
*Last updated: 2026-08-26 after roadmap creation (traceability mapped)*
