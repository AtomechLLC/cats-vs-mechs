# Phase 1: Foundation — Data, State Funnel & Undo - Context

**Gathered:** 2026-08-26
**Status:** Ready for planning

<domain>
## Phase Boundary

The invisible layer of the artifact. Delivers frozen Workshop 16 data, pure eHP/DPS derivations, the single `commit()` mutation funnel, snapshot undo, a styled error boundary, and an in-file self-test harness that proves all of it — with no UI at all.

Requirements: ALLOC-08, UX-01, UX-03, UX-04.

Explicitly NOT in this phase: any rendering of the board, steppers, roster editing, the projection panel, sharing, or the fight loop. The two-tier render strategy is *chosen and documented* here but *built* in Phase 2.

</domain>

<decisions>
## Implementation Decisions

The user opted to skip the discussion round for this phase. The four gray areas below were resolved at Claude's discretion and are recorded so downstream agents act consistently rather than each inventing an answer. **The board default numbers (D-01) should be sanity-checked by the user** — they are the one item where the user is the real authority and the board image is genuinely ambiguous.

### Locked upstream — do not re-litigate

These come from PROJECT.md, ROADMAP.md and the research SUMMARY, where all four researchers converged independently. They are inputs to this phase, not open questions.

- **D-00a:** Single mutation funnel. Every state change routes through `commit(label, mutator)`. Nothing mutates state outside it. This is what makes undo, the combat log, URL sync and coalesced render free byproducts later.
- **D-00b:** State is integers-only and JSON-clonable, split into three slices with different lifetimes: `build` (round-trips through the share code), `fight` (snapshotted for undo, never shared), `ui` (neither).
- **D-00c:** Undo is snapshot-based, not command-pattern inverses. Measured at ~0.014ms and ~1KB per snapshot.
- **D-00d:** `alive` is stored as its own boolean, never derived from `hp === 0`. A unit a student ruled "survived via Shield" must be representable.
- **D-00e:** Two-tier render strategy is chosen here and built in Phase 2 — a rare structural rebuild plus a per-tick keyed reconcile that never destroys the node under the cursor.
- **D-00f:** Vanilla JS in one classic `<script>`, zero dependencies, no build step. Section banner comments in the order `data → model → state → serialize → ops → render → interactions → boot → selftest`.

### Board default numbers

- **D-01:** ⚠️ **Needs user confirmation.** The board shows token rows rather than numerals, so exact starting values must be chosen. Proposed reading of the Workshop 16 board, to be treated as a starting point that Phase 5's playtest (FIGHT-11) will tune:
  - **Cats** — 9 units, 3 HP each, faction pool of 3 action points. Actions: Slash (1 damage), Hairball (Slowdown), Screech (Confuse).
  - **Mechs** — 3 units, 6 HP each, 3 shield each, faction pool of 3 action points. Actions: Fly (Evade), Lasers (3 damage, Range), Recharge (Shield).
  - These are the board's visible token counts read literally. They are almost certainly a Lanchester blowout in the Cats' favour (27 total Cat HP and 9 attacks/turn against 3 Mechs), which is exactly what FIGHT-11 exists to catch and correct.
- **D-02:** Defaults live in a single frozen `DEFAULTS` object in the `data` section, deep-frozen at load. Nothing mutates them; every reset reads from them. This makes the Phase 5 retune a one-place edit.
- **D-03:** Damage values attach to actions, not units — per the board and PROJECT.md's stat model. Health attaches to units; action points attach to the faction.

### Self-test visibility

- **D-04:** The self-test harness ships in the released file. Stripping it would require a build step, which UX-04 forbids.
- **D-05:** It is gated behind the `#selftest` hash and renders nothing at all on a normal open. A student who stumbles onto it sees a plainly-labelled developer report, not a broken page.
- **D-06:** The report is a readable pass/fail list, not a console dump — it must be legible to a person who opened the file by double-click with no DevTools.
- **D-07:** Assertions cover: the frozen defaults match the board spec; state is integers-only and survives a JSON clone round-trip; no mutation path bypasses `commit()`; `alive` is independent of `hp`; undo restores 30+ states in order; a rapid same-label burst coalesces into one entry.

### Undo boundaries

- **D-08:** Undo spans both `build` and `fight` slices, and crosses the setup/fight boundary. Undoing past "start fight" un-starts it. A student who started a fight by accident during a live demo needs one keystroke back, not a separate concept to learn.
- **D-09:** `ui` slice changes are never pushed onto the undo stack — collapsing a panel is not an edit.
- **D-10:** Coalescing is by mutation label within roughly 500ms, so press-and-hold produces one undo entry rather than forty.
- **D-11:** Stack depth ~30. Ctrl+Z is the keyboard path; a visible undo control is Phase 2's concern once there is a UI to put it in, but the underlying `ops.undo()` must be callable from a button, not wired only to a key handler.
- **D-12:** Reset-to-defaults lands on the undo stack as a single entry (ROADMAP Phase 4 criterion 4 depends on this).

### Failure behavior

- **D-13:** The error boundary wraps both init and every handler. A failure surfaces a styled panel naming what failed — never a blank page, never a silent no-op.
- **D-14:** A handler failure keeps the page alive and the last good state on screen. Only an init failure is terminal.
- **D-15:** The panel offers a one-click recovery path — dismiss and continue, or reset to defaults — because the realistic failure moment is an instructor mid-demo with a room watching.
- **D-16:** The panel includes the error text in a selectable field so it can be pasted into the Discord thread. No automatic reporting; there is no backend.

### File naming

- **D-17:** The artifact ships as `cats-vs-mechs.html` at the project root, matching the sibling course artifacts' flat kebab-case convention (`game-feel-study-guide.html`, `game-feel-types-frameworks.html`).

### Claude's Discretion

D-01 through D-17 above were all resolved at Claude's discretion after the user skipped the discussion round. Downstream agents should treat them as decided and build against them rather than re-opening them — with the single exception of **D-01**, which is flagged for user confirmation and which Phase 5's playtest gate (FIGHT-11) is designed to correct regardless.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and requirements
- `.planning/PROJECT.md` — What this is, core value, the full Out of Scope list, and the Key Decisions table. The "Design tension worth preserving" and "Manual override is a primary interaction" notes in `## Context` are load-bearing.
- `.planning/REQUIREMENTS.md` — ALLOC-08, UX-01, UX-03, UX-04 are this phase's requirements. The Out of Scope table names 16 exclusions.
- `.planning/ROADMAP.md` § Phase 1 — the four success criteria this phase is verified against, and the section-ownership split between plans 01-01 and 01-02.

### Architecture and implementation guidance
- `.planning/research/ARCHITECTURE.md` — component boundaries, the `ops` layer between interactions and state, the two-tier render argument, and the build-order dependency rules. Contains the measured benchmarks behind the snapshot-undo and render decisions.
- `.planning/research/STACK.md` — the verified `file://` capability matrix (what works, what is CORS-blocked), the no-framework justification with measurements, and the code-shape prescriptions that replace a module system.
- `.planning/research/PITFALLS.md` — phase-mapped failure modes. Pitfalls 3 (deferred funnel), 5 (ambiguous `alive`), 7 (full re-render) and 12 (single-file entropy) are all Phase 1 concerns.
- `.planning/research/SUMMARY.md` § "The five decisions that must land in Phase 1" — the converged list, treated as near-binding.

### Visual language (needed from Phase 2, read now for the `<style>` skeleton)
- `../game-feel-study-guide.html` — sibling course artifact. Its `:root` block is the source of the design tokens (`--bg:#0e1014`, `--ink:#e8ebf2`, `--accent:#5cc8ff`, `--accent-2:#ff7eb6`, `--gold:#ffd166`, `--green:#5bd99c`, `--violet:#b98cff`, `--radius:14px`, Segoe UI stack, radial-gradient body background).
- `../game-feel-types-frameworks.html` — second sibling; confirms the token set is a shared convention rather than one file's choice.

### Source material
- The Workshop 16 board image supplied in the initiating conversation — the origin of the faction actions, keywords, counter map and token allocation. Its content is transcribed into PROJECT.md `## Context` § "Source material"; agents without the image should rely on that transcription.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

None — this is a greenfield directory. The project root contains no source files.

### Established Patterns

The two sibling artifacts one directory up (`../game-feel-study-guide.html`, `../game-feel-types-frameworks.html`) establish the course convention this file must join: a single self-contained HTML file, one `<style>` block opening with a `:root` custom-property set, one dark radial-gradient body, Segoe UI system font stack, and a sidebar-navigated layout. Note that both siblings are *documents*; this artifact is an *instrument*, so the layout will diverge — the shared vocabulary is color, type and surface treatment, not structure.

### Integration Points

None. Nothing imports this file and it imports nothing. It is opened directly by a person.

</code_context>

<specifics>
## Specific Ideas

- The self-test report is the only thing visible in Phase 1. It should be styled with the course tokens rather than left unstyled — it is the first evidence that UX-05 is achievable, and it costs almost nothing to do at the same time.
- The file skeleton should open with a table-of-contents comment listing the section banners in order, so that a several-thousand-line single file stays navigable by grep. Research flags single-file entropy as a real Phase 1 concern (Pitfall 12).

</specifics>

<deferred>
## Deferred Ideas

- **Visible undo/redo buttons** — Phase 2, once there is a UI to place them in. `ops.undo()` must be button-callable from the start (D-11).
- **Redo** — not in v1 requirements. Undo-only is what UX-01 specifies.
- **Retuning the board defaults** — Phase 5, plan 05-03. FIGHT-11's playtest gate is the mechanism; D-01's proposed numbers are its input, not its conclusion.
- **Persisting state to localStorage** — out of scope per PROJECT.md. Worth noting that research found `file://` localStorage shares one bucket across all local files, so it would collide with the two sibling course artifacts unless namespaced. Recorded here in case it is ever reconsidered.

</deferred>

---

*Phase: 1-Foundation — Data, State Funnel & Undo*
*Context gathered: 2026-08-26*
