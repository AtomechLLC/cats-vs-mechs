---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 04-04-PLAN.md
last_updated: "2026-08-29T06:22:09.052Z"
last_activity: 2026-08-29
progress:
  total_phases: 7
  completed_phases: 5
  total_plans: 32
  completed_plans: 29
  percent: 71
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-26)

**Core value:** A student builds two factions that look nothing alike and discovers they can still be balanced — and discovers it by playing, not by being told a number.
**Current focus:** Phase 04 — share reset

## Current Position

Phase: 04
Plan: 5 of 8
Status: Ready to execute
Last activity: 2026-08-29

Progress: [█████████░] 91%

## Performance Metrics

**Velocity:**

- Total plans completed: 10
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2 | - | - |
| 03.1 | 8 | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 03.1 P01 | 78 | 3 tasks | 2 files |
| Phase 03.1 P02 | 62min | 3 tasks | 1 files |
| Phase 03.1 P03 | 95min | 3 tasks | 1 files |
| Phase 03.1 P04 | 105min | 3 tasks | 2 files |
| Phase 03.1 P05 | 118min | 3 tasks | 2 files |
| Phase 03.1 P06 | 132min | 3 tasks | 2 files |
| Phase 03.1 P07 | 148min | 3 tasks | 2 files |
| Phase 03.1 P08 | 25min | 2 tasks | 1 files |
| Phase 04 P01 | 95min | 3 tasks tasks | 2 files files |
| Phase 04 P02 | 70min | 3 tasks | 2 files |
| Phase 04-share-reset P03 | 95min | 3 tasks | 2 files |
| Phase 04-share-reset P04 | 105min | 3 tasks | 2 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Roadmap]: Five converged Phase-1 architecture decisions are treated as near-binding — single `commit()` mutation funnel, integers-only JSON-clonable state split into `build`/`fight`/`ui`, two-tier render, snapshot undo, `alive` as a flag separate from `hp`.
- [Roadmap]: Two ordering rules honored — steppers ship in the same phase as roster add/remove (Phase 2); serialization comes after roster editing settles the build shape (Phase 4).
- [Roadmap]: PROJ-05, REF-03 and SHARE-07 pulled into Phase 5 because their observable behaviour requires the fight view to exist.
- [Roadmap]: FIGHT-11 is a scheduled playtest activity (plan 05-03), gating Phase 5 — not a code-review item.
- [Research]: Sharing is a compact build code, not a `file://` URL (leaks the student's home directory path, useless to recipients, not linkified by Discord).
- [Phase 03.1]: Dialog strings feed the same PROJ-06 word list and the same check 48 as #app; DIALOG_ROOTS is gated in both directions against the stub page — A second word list is a second thing to keep in step; a dialog that escapes the harvest must fail the run rather than pass silently
- [Phase 03.1]: MAX_ALLOC's literal moved from [S05] to [S01] so MIN_XF_DELTA and MAX_XF_DELTA derive from it once; [S05] still exports it — [S01] runs before [S05], so deriving the signed bound in App.data required the magnitude to live there; re-typing 99 was the one thing the plan forbade
- [Phase 03.1]: cost, req and xf are arrays of records carrying tok as a FIELD, never objects keyed by token id — A keyed bag re-opens the key position requireTokenId exists to close, and Object.create(null) does not survive the JSON round trip
- [Phase 3.1]: DAMAGE_KEYS ships health-only: a bounded shield pool read as unbounded throughput would overstate, the one direction PROJ-06 forbids
- [Phase 3.1]: turnsToWipe reads ONE bestPair call, so the hit and the per-turn always describe the same swing
- [Phase 3.1]: CONTEXT D-14a corrected by measurement: the shipped board does not move under either shield reading, because no shipped action carries a shield transformation
- [Phase ?]: 03.1-03: a shipped action can be renamed and re-costed but not removed — the reference band names the six by id
- [Phase ?]: 03.1-03: renameAction is a plain commit; createAction and removeAction are structural
- [Phase ?]: 03.1-03: guard placement inside a commit is caught by refusal ORDER, never by undo depth — commit() runs its mutator before it records
- [Phase 3.1]: 03.1-04: the cards, the band, the admission line and the picker line all read the BUILD SLICE through one exemption channel (data-anm) — an id means the shared sync pass owns the text, an empty value means the region that built the node does
- [Phase 3.1]: 03.1-04: ACT-07's line beside Remove stays silent for a type the board is built on — a consequence stated for a removal the surface does not offer is noise
- [Phase 3.1]: 03.1-04: a build-once rule is held by NODE COUNT, not by the built flag — probe M measured the flag vacuous for a per-node create/destroy
- [Phase 3.1]: 03.1-05: ONE dialog with two panes, not two — one button, one binder, one root, one fingerprint, and 20 shell ids rather than near forty
- [Phase 3.1]: 03.1-05: no second fire() payload-key exception was needed — the editor's own delegated listener builds each patch field by field from the pressed control
- [Phase 3.1]: 03.1-05: the editor fingerprint carries cost/req/xf BEFORE plan 03.1-06 draws them, so the surface cannot be born stale
- [Phase 3.1]: 03.1-05: DIALOG_FLOOR 84 -> 91 — a floor over the total of two roots, left at 84, would have stopped bounding either of them
- [Phase 03.1]: int() alone bounds a signed transformation amount — requireDelta applies no bound, and int() compares rather than coerces, so a signed floor needs no new machinery
- [Phase 03.1]: Emptying a term slot is a write with nothing in it (CLEAR_TERM) through the same op, so the slot bound lives in one place rather than two
- [Phase 03.1]: The slot index is part of the commit label: a key held in one amount field is one Ctrl+Z step, and two slots stay two
- [Phase 03.1]: The empty slot is the affordance — the action editor carries no Add control anywhere, and the emptying entry at the head of a chooser is the one named path for removing a term
- [Phase ?]: 03.1-07: the proposal is a FORM on the dialog, never a slice — there is then no state in which a proposal exists and has not been accepted, so undo, the build code and the projection can never read one
- [Phase ?]: 03.1-07: ACT-05 is half-delivered on purpose (D-05b) — confirm writes on Advance in Phase 5, and the absence of an applier is asserted by two numbered checks rather than left as an intention
- [Phase ?]: 03.1-07: every assembled proposal line is built one node per fragment, so Layer C reads the artifact's words and skips the student's inside a single sentence
- [Phase 3.1]: Decision 14 CONFIRMED by the developer at the 03.1-08 rehearsal — DAMAGE_KEYS stays health-only; a shield strip is named in the admission line rather than counted, because counting a bounded pool as unbounded throughput reads about 5 turns where the board delivers about 9
- [Phase 3.1]: Decision 15 CONFIRMED by the developer at the 03.1-08 rehearsal — the proposal pane applies nothing; a declared action lands on Advance in Phase 5, and PROJECT.md's Out of Scope entry stands unchanged
- [Phase 3.1]: The 03.1-08 rehearsal closed on a one-word blanket approval, so item 5's tone judgement and item 10's close-request behaviour are approvals of a description rather than recorded prose — named as the record's two weakest lines rather than fabricated
- [Phase 04]: CODE_ALPHABET is an allowlist regular expression, never a blocklist — a blocklist reads green about every character nobody thought of
- [Phase 04]: the comma is excluded from the build-code alphabet by construction because App.hasFlag splits location.hash on it; this is the binding alphabet constraint of Phase 4 and is in no other project document
- [Phase 04]: no MAX_* cap moves for build-code budget reasons — the measured cost centres are the tally stream and the name lengths, not the dials
- [Phase 04]: a round-trip assertion over a symmetric writer/reader pair proves only that the two halves agree; the byte shape and the measured cost are asserted separately
- [Phase ?]: 04-02: encode refuses a build whose side id, side name, unit label or record schema does not match what it reconstructs — a future rename-unit or rename-faction op becomes a refusal rather than silent data loss
- [Phase ?]: 04-02: the three [S05] bounds the decoder re-types are exported as WIRE_BOUNDS and held to App.ops by suite rows, because [S04] may not reach upward across a dependency arrow
- [Phase ?]: 04-02: the round trip is asserted over a stable writing of the record, since a tally bag's key order is the order a student set them in and carries no meaning
- [Phase ?]: 04-02: no round trip over a DRIVEN board can see a derived-versus-enumerated ordinal order, so three rows hand encode a vocabulary written down in another order and require the identical code
- [Phase ?]: 04-03: the matrix is seventeen tamper shapes of which TWELVE are content rows, not the eleven the plan says in three places — research's own table lists twelve and a suite row now pins the figure
- [Phase ?]: 04-03: two rows of the bad-input table ADMIT the code — decode trims, so a good code with a trailing newline is a good code, and demanding a refusal there would be demanding a defect
- [Phase ?]: 04-03: the reconstruction tripwire compares what came BACK against what went IN, never against the reconstruction — probe K proved the second comparison is a tautology that stayed green over the exact data loss it exists to catch
- [Phase ?]: 04-03: [S04.3]'s unbag refuses rather than dereferencing tokens[id] on a function invariant — probe J broke the lockstep by one line and threw a TypeError out of a function whose banner says it never throws
- [Phase ?]: 04-04: D-20 implemented as commitInitial, a SECOND named writer in [S03] guarded to refuse unless nothing has been committed and the stack is empty; probe N proved the guard
- [Phase ?]: 04-04: the hash mirror reads App.state at ONE deferred call site; [S04]'s banner claim 3 names the exception rather than letting it happen quietly
- [Phase ?]: 04-04: an unencodable build DROPS the hash token rather than leaving a stale code a reload would load back

### Pending Todos

None yet.

### Blockers/Concerns

- **The no-verdict constraint (PROJ-06) is the most likely accidental scope violation in the project.** Every phase that touches the projection carries an explicit no-verdict success criterion. Watch for it re-entering as a colour, a bar, or a word.
- **Single file, parallel plans.** All code lands in one HTML file. Plans inside a phase must own disjoint named sections (`data / model / state / serialize / ops / render / interactions / boot / selftest`) or run sequentially.
- **Phase 4 needs a cross-browser test matrix**, not a smoke test — clipboard, encoding and hash failures are all silent.
- 04-04 probe Q reddened nothing: a boot load landing before the first paint is held by a comment alone. A flash is only visible to a person — rehearsal item for plan 04-08, harness limitations entry 15

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-08-29T06:22:09.039Z
Stopped at: Completed 04-04-PLAN.md
Resume file: None
