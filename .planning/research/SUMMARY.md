# Project Research Summary

**Project:** Cats vs Mechs — Workshop 16 Interactive Sample
**Domain:** Single-file, zero-build, offline `file://` interactive HTML teaching instrument (turn-based faction-balance sandbox with manual adjudication)
**Researched:** 2026-08-26
**Confidence:** HIGH

## Executive Summary

This is a manually-adjudicated combat bookkeeping tool wearing the shape of a balance calculator, built as a single ~3,000-line offline HTML file. All four researchers converged, independently and with unusual force, on the same architectural spine: a single mutation funnel (`ops` → `state.commit()`), an integers-only/JSON-clonable state shape split into `build`/`fight`/`ui` slices with different lifetimes, a two-tier render (rare structural rebuild + per-tick keyed reconcile), snapshot-based undo, and an explicit `alive` flag kept separate from `hp`. Every researcher flagged the same failure mode if these are skipped: they are cheap (tens of lines, sub-millisecond) if decided in the first implementation phase and expensive rewrites (auditing dozens of scattered mutation sites, or worse, redesigning the state shape) if deferred. There is no framework and no external dependency — vanilla JS in one classic `<script>` is not a purity stance, it's what the measured numbers and the verified `file://` capability matrix (fetch/import/Worker all CORS-blocked; clipboard, `history.replaceState`-on-hash, and `CompressionStream` all verified working) actually support.

The recommended approach: build the pure `data`+`model` layer and the state/undo funnel first (verifiable from a console with no UI), then the two-tier render together with roster add/remove (because doing steppers alone would let a single-tier render look adequate and only fail later), then the advisory projection, then share/reset, then the fight loop last (because it's the one layer nothing else can be retrofitted under). Two things need explicit attention before that roadmap can be trusted: PROJECT.md's "shareable link" requirement is contradicted by research findings and needs a decision (see below), and the fight-loop phase carries the project's central pedagogical risk, which code review alone cannot verify.

The two biggest risks are not technical, they're pedagogical, and both researchers (Features and Pitfalls) found them independently. First, the live eHP/DPS projection is a textbook Goodhart's Law trap: a number that updates on every stepper click becomes the thing students optimize instead of the fight itself, inverting the tool's entire purpose. Second, the board's own example matchup — 9 Cats vs 3 Mechs — sits squarely in Lanchester's Square Law territory (concentrated fire against individually-dying units gives the swarm a superlinear advantage a linear eHP×DPS projection will not predict), so the default board can produce a boring blowout that teaches students the opposite of the intended lesson unless it is play-tested and tuned, not just coded. Both risks have concrete, converged-upon mitigations detailed below.

## Key Findings

### Recommended Stack

Vanilla ES2022 in one classic `<script>` block, one `<style>` block using modern-but-Baseline CSS (`:has()`, container queries, nesting, `color-mix()`, `<dialog>`), and zero runtime dependencies. This isn't an aesthetic choice: a full `innerHTML` rebuild of the realistic board ceiling (24 units, 624 nodes) measured 1.82 ms unstyled in Chrome 151 — there is no performance problem large enough for a framework to solve, and `<script type="module">` with any `import` is verified CORS-blocked on `file://`. If the UI ever exceeds ~10 independently-updating regions with nested list editing, Preact+htm inlined as UMD (16.4 KB, MIT/Apache-2.0, verified working from `file://`) is a viable escape hatch — not a starting point.

**Core technologies:**
- Vanilla JS, one classic `<script>` — entire application; modules can't import each other in a single file and external imports are CORS-blocked on `file://`
- Modern CSS (Baseline Widely Available set) in one `<style>` block — `:has()`, nesting, container queries, `color-mix()`, `<dialog>` all verified computing correctly from `file://`
- Hand-written compact positional string codec (~60 lines) — a realistic 9v3 build state encodes to ~35-60 chars vs. 1,554 for JSON→base64url; no compression library needed
- `<dialog>` element — native modal/backdrop/Esc for the share and reset-confirm flows, Baseline since 2022
- In-file self-test harness (`#selftest` hash flag) as the primary testing mechanism, with an optional dev-only Playwright smoke script kept out of the shipped file

### Expected Features

The reference class (VTT combat trackers, encounter builders, explorable-explanation design patterns, Lanchester's Square Law) transfers HP/AP bookkeeping conventions cleanly but explicitly does **not** transfer the encounter-builder difficulty-verdict badge, dice/RNG, grids, or per-unit initiative — all of which would either undo the pedagogy or fight the shared-AP-pool stat model.

**Must have (table stakes):**
- Per-unit HP + faction AP steppers with fast math input (`-8`, `+5`, arrow keys ±1) — the primary interaction
- Token-row allocation display with a compaction rule for high counts
- Add/remove units per side; prebuilt Cats & Mechs data as the single source of truth
- Hot-seat, reversible turn/round advance; shared faction AP pool with spend/refill
- Per-unit death at 0 HP, auto-marked but manually toggleable both ways, corpses stay visible
- Universal manual override on every tracked value — not an escape hatch, the primary mechanism by which student rulings get recorded
- Counter map + effect cards visible without leaving the fight view
- Live eHP/DPS projection with visible arithmetic, strictly advisory (no verdict)
- Reset to Workshop 16 defaults, confirmed and undoable
- Build-code share (see Research Flags below re: the "link" wording)
- Undo, snapshot-based, ~30 deep, Ctrl+Z
- Projector legibility — no hover-only information anywhere

**Should have (differentiators):**
- Predict-then-play: capture a prediction before the fight, reveal projected-vs-actual after — the single highest-leverage addition, converts the projection/reality gap from a hope into a mechanic
- Divergence callout naming the cause (focus fire / Lanchester square law / action economy)
- Side-by-side normalized comparison bars (no strong prior art — original design, flag for validation)
- Combat log including manual overrides; overkill/waste tracking; scenario presets

**Defer (v2+):**
- Stacked contribution breakdown, A/B build snapshot comparison, sensitivity/what-if readout, full keyboard-first operation — all higher cost for marginal additional legibility once comparison bars and predict-then-play exist

### Architecture Approach

One `.html` file organized as strictly-downward-dependent sections (`data → model → state → serialize → ops → render → interactions → boot → selftest`), with `ops` as the single funnel every mutation passes through and `render` strictly read-only against state. State is three slices with different lifetimes — only `build` round-trips through the URL, `build`+`fight` are snapshotted for undo, `ui` is excluded from both. The render layer is two-tier: a rare `render.structure()` full rebuild (only on roster/mode changes, wrapped in focus/scroll preservation) and a `render.sync()` keyed reconcile that runs on every stepper tick and never destroys the node under the student's cursor — this is what makes press-and-hold, animation, and keyboard operation all work simultaneously, and it was independently justified by benchmarks showing full-rebuild-with-real-CSS costs 6-20ms (not the ~1ms an unstyled benchmark implies) and drops frames past ~20 units.

**Major components:**
1. `data`/`model` — frozen defaults + pure derivation functions (eHP, DPS), zero dependencies, console-testable in isolation
2. `state` + `ops` — the mutation funnel: every action goes through `commit(label, mutator)`, which snapshots for undo, schedules debounced URL sync, and calls `invalidate()`
3. `render` (two-tier) + `interactions` (delegated events on stable roots) — the token-row reconcile is called out by Architecture research as "the single most important function in the app"
4. `serialize` — versioned `build`-only encode/decode, built after the roster shape stabilizes, never mid-fight state

### Critical Pitfalls

1. **The projection becomes the verdict (Goodhart's Law)** — a live-updating number attached to a stepper is a target regardless of its label, and it's an order of magnitude cheaper to optimize the number than to play a fight. Mitigate by expressing the projection in the fight's own unit ("≈3-5 turns to wipe," never "eHP 27.5"), making the post-fight predicted-vs-actual comparison the loudest element on screen (louder than the live projection), never rendering a verdict/traffic-light/shared-midpoint meter, and shipping a permanent "this ignores: counters, effects, focus fire, overkill, your rulings" list next to the projection.
2. **The asymmetry lesson misfires (Lanchester's Square Law)** — the board's own 9v3 default is precisely the condition (individual death + focus fire) that activates the square law; a naive linear projection will call it even while the swarm actually stomps the elites, teaching students the opposite of the intended lesson. This cannot be verified by code review — it requires actually playing the shipped default twice end-to-end and confirming neither side wipes the other with >70% force loss. Flag the fight-loop phase for dedicated playtest verification, not just implementation.
3. **The state funnel is deferred** — undo, the combat log, share, reset, and live recompute are all cheap *if* every mutation passes through one `commit()` function decided in phase 1, and a moderate-to-hard retrofit across dozens of scattered call sites (manual override is explicitly a primary interaction available everywhere) if deferred.
4. **Full re-render on every interaction** — not primarily a performance problem (DOM node count is not the risk here) but a correctness one: it drops rapid stepper clicks (pointerdown/pointerup land on different, freshly-recreated nodes), destroys focus and the keyboard focus ring, and restarts every token's CSS animation on every click — for a game-feel course artifact, that last one is a curriculum bug, not a polish issue.
5. **Ambiguous bookkeeping state (`hp === 0` inferred as dead)** — collapses a student's Shield/Evade ruling into an unrepresentable state and breaks trust in the tool. `alive` must be a separate, manually-toggleable flag decided in the phase-1 state model, not derived.

## Implications for Roadmap

### The five decisions that must land in Phase 1 (converged upon by all four researchers, independently)

This is the single most important synthesis output. Each of the following was flagged by at least two researchers, several by all four, as "cheap now, expensive-to-rewrite later":

1. **Single mutation funnel** (`ops.*` → `state.commit()`, nothing mutates state outside it) — enables undo, URL sync, combat log, and coalesced render as free byproducts; without it, each gets reimplemented or forgotten at dozens of manual-override call sites.
2. **Integers-only, JSON-clonable state shape**, split into `build` / `fight` / `ui` slices with different lifetimes (only `build` in the URL; `build`+`fight` in undo; `ui` in neither) — this single constraint independently unlocks snapshot undo, URL serialization, and console debugging, and it's what makes `alive` (see #5) and the share-encoding pitfalls avoidable by construction rather than by discipline.
3. **Two-tier render**: rare structural rebuild (roster/mode changes only, wrapped in focus/scroll preservation) + per-tick keyed reconcile that never destroys the clicked node. Build this *with* roster add/remove in the same phase — steppers alone would let a single-tier design look adequate and only fail once structural changes are added.
4. **Snapshot-based undo**, not command-pattern inverses — measured at 0.014ms and ~1KB per snapshot; a 100-deep stack is ~105KB. Coalesce by mutation label within ~500ms so press-and-hold doesn't spam the stack. This is only cheap if state is already the JSON-clonable shape from #2.
5. **`alive` as an explicit boolean, separate from `hp`** — zero HP prompts a death marker, it does not auto-kill; a unit a student ruled "survived via Shield" must be representable. Decided as part of the phase-1 state model, consumed by the fight-loop phase.

A sixth, lower-drama but equally converged item: **wrap init and every handler in try/catch with a visible styled error panel** (not a black screen), because zero-build means no error boundary exists by default and this is the cheapest insurance in the project.

### A requirement research contradicts — needs a decision before roadmap phases are finalized

PROJECT.md requires: *"Student can copy a shareable link encoding the full build for the Discord thread."* Stack and Pitfalls research both independently found this cannot work as literally specified:

- A `file://` URL embeds the student's actual local file path — e.g. `file:///C:/Users/Jessica.Nguyen/Downloads/cats-vs-mechs.html#b=...` — which broadcasts the student's real name into a public course Discord. This is a privacy problem, not an aesthetic one.
- The link does not work for the recipient: their copy of the file lives at a different path, so opening it either 404s or silently opens *their* file with no state at all.
- Discord does not linkify `file://` URLs — they render as inert plain text, so the "clickable link" affordance being paid for doesn't exist.
- Separately, Discord's free-tier 2000-character message limit converts any over-length message into a downloadable `.txt` attachment rather than an error, so an unbudgeted JSON-based encoding fails silently and specifically on the largest, most interesting student builds.

**Recommendation (from both researchers, independently):** ship a short **build code** (a compact positional string, ~35-120 chars typical, well under the 2000-char limit) with a "copy build code" button and a "paste build code to load" field, rather than a URL. Keep `location.hash` synchronized as a *local-only* convenience (reload/bookmark/back on the student's own machine), verified working and round-tripping at up to 500,000 characters — just not as the sharing mechanism. This changes the wording and interaction shape of one Active requirement in PROJECT.md and should be confirmed with the user before the roadmap locks in a share-phase design.

### Disagreements between researchers, reconciled

- **Render performance verdict.** Stack's unstyled benchmark (1.82ms full rebuild at 624 nodes) reads as "no problem, do whatever." Architecture's benchmark *with real CSS* (inline-block layout + keyframe animation) measured 6.14ms at the same scale and 19.53ms (a dropped frame) at 20 units × 60 tokens — an 8x jump from adding styling. **Resolve toward the styled number**: this app's tokens will be styled and animated by design (it's a game-feel course artifact), so the unstyled benchmark understates real cost. This doesn't overturn the "no framework" conclusion (both researchers still land on vanilla + two-tier render), but it does overturn "full re-render is fine, don't bother with two-tier" — Architecture and Pitfalls are right that the two-tier reconcile must be built in phase 1, not deferred as an optimization.
- **DOM node count as a risk.** Pitfalls research explicitly states node count is *not* the real risk at this project's scale (~135 nodes for 9v3, ~1,000 for a 50-unit stress roster) — the risk is the *re-render strategy* (dropped clicks, focus loss, animation restart), not raw count. This is consistent with, not contradictory to, the styled-benchmark finding above: both agree the failure mode is qualitative (correctness) before it's a frame-budget problem.

### Phase 1: State & Model Foundation
**Rationale:** Zero-dependency and pure — verifiable from a browser console with no UI at all. Every one of the five converged Phase-1 decisions above lives here, and getting the state shape (per-unit HP, faction AP pool, `alive` flag, `build`/`fight`/`ui` split) wrong is the one mistake that forces a rewrite of everything downstream.
**Delivers:** Frozen `data` defaults, pure `model` (eHP/DPS derivations), `state`/`ops`/`commit()` funnel, snapshot undo stack, in-file self-test harness, error boundary, file skeleton (TOC comment + `#region` section banners).
**Addresses:** State funnel, undo, universal manual override plumbing (from FEATURES.md table stakes).
**Avoids:** Pitfalls #3 (deferred funnel), #5 (ambiguous `alive`), single-file entropy (Pitfall 12), full re-render architecture debt (Pitfall 7 — the render strategy is *chosen* here even if not fully built).

### Phase 2: Allocation UI (two-tier render + steppers + roster)
**Rationale:** Must be built together, not steppers-then-roster — doing steppers alone would let a single-tier render look adequate and only collapse once structural (roster) changes are added.
**Delivers:** `render.structure()` (rare, focus/scroll-preserving) + `render.sync()` (keyed token reconcile, never destroys the clicked node), delegated event interactions, press-and-hold, HP math input, add/remove units.
**Uses:** Compact token-row reconcile pattern from ARCHITECTURE.md Pattern 3; `data-k` keying vocabulary.
**Implements:** `render` and `interactions` layers per the architecture's component table.

### Phase 3: Projection Panel
**Rationale:** Trivial once `model` is pure (validates that purity) and must be laid out before fight chrome is added around it, since the projection panel needs to remain visible during the fight per PROJECT.md's core design tension.
**Delivers:** Live eHP/DPS projection with visible arithmetic, ranges not decimals, always-visible "this ignores:" list, no verdict/traffic-light state.
**Addresses:** FEATURES.md's advisory-framing requirement; directly implements Pitfall #1 and #2's mitigations (unit-matching decision must be made here, consumed by fight-loop's predicted-vs-actual in Phase 5).
**Avoids:** Pitfall 1 (Goodhart) and Pitfall 2 (false precision) — both explicitly scoped to this phase's acceptance criteria.

### Phase 4: Share & Reset
**Rationale:** Must come after roster editing (Phase 2) settles the `build` shape — encoding early guarantees schema churn and wasted migrations.
**Delivers:** Versioned positional build-code codec, three-tier clipboard fallback (async API → `execCommand` → visible selectable input), three distinct reset scopes (undo / reset fight / reset to defaults) spatially separated with the destructive one confirmed.
**Uses:** `CompressionStream` escalation path only if payload exceeds ~800 chars (unlikely); URL-safe unreserved alphabet only, no `%`/`+`/`=` in the payload.
**Implements:** `serialize` component; resolves the "shareable link" requirement decision flagged above.

### Phase 5: Fight Loop
**Rationale:** Additive on top of everything above — reuses the same token row with a different data binding (setup vs. fight mode), and is the one layer that can't be retrofitted under earlier decisions, so it comes last among interactive work.
**Delivers:** Turn/round advance (reversible, never auto-advances on AP exhaustion), shared AP pool spend/refill as dimmed tokens, per-unit death (`alive` flag, manually toggleable), universal manual override with visible marker, append-only combat log, predict-then-play capture, projection-vs-actual divergence callout.
**Addresses:** FEATURES.md's hot-seat fight requirements; Pitfall #9 (ambiguous bookkeeping state — turn indicator, spent-AP visibility, override markers).
**Needs dedicated verification, not code review:** the shipped 9v3 default must be played to completion twice, confirming neither side wipes the other with more than ~30% force intact. **Flag this phase explicitly for a playtest step in planning, separate from implementation review.**

### Phase 6: Reference Material & Polish (can run in parallel / as buffer)
**Rationale:** Counter map and effect cards are stateless static renders with no dependency on the interactive core — genuinely parallelizable, good buffer work if another phase blocks.
**Delivers:** Counter map + effect keyword cards visible without leaving the fight view; projector "present" toggle (bumps font size/contrast in one click); scenario presets sharing reset's machinery.
**Addresses:** FEATURES.md's reference-material and legibility requirements; Pitfall #11 (unusable live — projector legibility, click economy).

### Phase Ordering Rationale

- Dependency order follows Architecture's verified critical path: **1 → 2 → 4 → 5**, with Phase 3 (projection) and Phase 6 (reference) able to float or run in parallel once their prerequisites (`model`, `render`) exist.
- The two inversions all four researchers warn against: don't let serialization (Phase 4) precede roster editing (Phase 2) — the `build` shape isn't stable yet; don't let steppers (Phase 2) precede choosing the two-tier render strategy — both feel easy to build early and both cost a rework of the layer beneath if done first.
- Fight loop is deliberately last among interactive phases because it's the only one that can't invalidate earlier architectural decisions — everything it needs (state slices, render reconcile, projection, share) is already fixed by the time it's built.

### Research Flags

Phases likely needing deeper research or dedicated verification during planning:
- **Phase 5 (Fight Loop):** Pitfall 10 (Lanchester square-law blowout) cannot be verified by reading code — it requires actual play sessions of the shipped 9v3 default, tuned and re-tested until close. Budget an explicit playtest step, not just implementation + review.
- **Phase 3 (Projection):** Pitfall 1 (Goodhart) is PROJECT.md's own stated core design tension. Its resolution (choice of unit — turns-to-wipe vs. abstract eHP/DPS — and visual hierarchy vs. the post-fight comparison) is a design decision to settle before code, not an implementation detail to discover while coding.
- **Phase 4 (Share & Reset):** Pitfalls 3/4/5 (clipboard focus-loss, Discord's 2000-char limit, percent-encoding/base64 corruption across Chrome/Firefox) are all cross-browser and all fail *silently*. This phase needs a real test matrix (2 browsers × focused/unfocused/DevTools-open × forced-fallback), not a smoke test.

Phases with standard, well-documented patterns (skip dedicated research-phase):
- **Phase 1 (State & Model):** The state-funnel/two-tier/snapshot-undo pattern is unusually well-converged across all four research files with concrete measured numbers — treat ARCHITECTURE.md's Suggested Build Order and code samples as directly implementable.
- **Phase 6 (Reference Material):** Stateless static rendering against an already-established design token set — no open questions.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Most claims verified by direct execution in real Chrome 151/Edge 151 from `file://`, not inferred. Firefox/Safari are explicitly designed-around (LOW confidence, non-blocking fallbacks) rather than depended on. |
| Features | MEDIUM-HIGH | VTT bookkeeping and encounter-builder patterns verified against live product docs; explorable-explanation patterns verified against primary source (Nicky Case). Asymmetric-balance comparison-bars/breakdown are original design with no strong prior art — explicitly flagged LOW-MEDIUM by the researcher for validation in the first classroom run. |
| Architecture | HIGH | Core recommendations empirically tested (not inferred) via headless Chrome runs against real `file://` pages, with test IDs (T1-T21) cited per claim. Two explicit MEDIUM items: Firefox/Safari-specific behavior (no Firefox binary available to test), and the "two-modes-one-surface" product judgement (reasoned from PROJECT.md, to be validated by use). |
| Pitfalls | HIGH on technical claims (verified against Chromium/Gecko/WebKit source and the HTML/Secure-Contexts specs directly, correcting two widely-repeated false assumptions about `file://` clipboard and `history.replaceState`), MEDIUM on pedagogical claims (grounded in Goodhart's-law and model-epistemology literature, Lanchester's Laws, and uncertainty-visualization research — not validated against trials of this specific artifact). |

**Overall confidence:** HIGH

### Gaps to Address

- **Firefox and Safari were not empirically testable** in this research environment (no Firefox/Safari binary available). Every Firefox-sensitive recommendation (clipboard fallback tiers, `localStorage` non-reliance) already has a fallback that makes the platform question moot — but if either browser becomes a stated support target, re-run the capability probes before shipping.
- **The share-requirement wording change (link → build code) needs explicit user sign-off** before Phase 4 is planned in detail — this is a PROJECT.md requirement change, not purely an implementation detail, and both researchers who found it treat it as needing a decision rather than assuming the recommendation is automatically adopted.
- **The comparison-bars / stacked-breakdown visualizations have no strong prior art** (FEATURES.md, LOW-MEDIUM confidence) — treat as original design, plan to validate in the first classroom run rather than trusting it as a settled pattern.
- **Pitfall 10 (default 9v3 balance) is fundamentally a playtesting question**, not a research question — no amount of further desk research substitutes for actually playing the shipped defaults twice and confirming the fight is close. This must be scheduled as an activity in the Phase 5 plan, not treated as solved by this research.
- **Discord's exact rendering behavior for a long unbroken build-code string** (wrapping, truncation, whether it needs backticks) was not empirically tested by any researcher — mitigated by keeping the design target at ≤512 chars, but worth a real Discord post test before the workshop.

## Sources

### Primary (HIGH confidence)
- Direct execution — Chrome 151 / Edge 151 on Windows, loaded from `file://`: capability probes, clipboard/permission probes, inline-Preact probe, encoding-size probes, re-render benchmarks (STACK.md, ARCHITECTURE.md — test IDs T1-T21)
- `web-features` npm package (Baseline dataset) and `@mdn/browser-compat-data` — CSS/API Baseline statuses and version floors (STACK.md)
- Chromium/Gecko/WebKit browser source (`is_potentially_trustworthy_unittest.h`, `history_util.cc`, `navigation_rate_limiter.cc`, `clipboard_sanitized_write_permission_context.cc`, `url_constants.h`, Gecko `components.conf`/`Document.cpp`, WebKit `SecurityOrigin.cpp`) and W3C Secure Contexts / WHATWG HTML specs — corrected two widely-repeated false assumptions about `file://` clipboard and history APIs (PITFALLS.md)
- Owlbear Rodeo Battle Board / Game Master's Grimoire, Foundry VTT Combat Tracker, PF2e Encounter Builder / Kobold Fight Club product documentation (FEATURES.md)
- Nicky Case, "Explorable Explanations" (both primary posts) — predict-then-play / Place Your Bets pattern (FEATURES.md)

### Secondary (MEDIUM confidence)
- Discord character-limit secondary sources (TypeCount, Discord Text Tools) — 2,000/4,000-char limits, mutually consistent but not verified against Discord's own developer docs (STACK.md, PITFALLS.md)
- Lanchester's Square Law sourcing — Gamasutra/Game Developer "Kicking Butt by the Numbers," RTS design writeups (FEATURES.md, PITFALLS.md)
- Grosslight, Unger & Jay (1991) on naive-realist model epistemology; Hullman et al. on uncertainty visualization; The Carpentries instructor training on projector legibility (PITFALLS.md)
- Bugzilla reports on Firefox `location.hash` percent-decoding asymmetry and `privacy.file_unique_origin` (PITFALLS.md, STACK.md) — long-standing, not re-verified against current builds

### Tertiary (LOW confidence)
- Firefox/Safari-specific clipboard and `localStorage` behavior on `file://` — no binary available to test in this environment; all recommendations ship with fallbacks that make the answer non-blocking (STACK.md, ARCHITECTURE.md)
- Asymmetric-balance-visualization prior art — none found; comparison bars and stacked breakdown are original design (FEATURES.md)

---
*Research completed: 2026-08-26*
*Ready for roadmap: yes — pending user decision on the share-link → build-code requirement change*
