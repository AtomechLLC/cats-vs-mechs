# Feature Research

**Domain:** Interactive game-balance teaching sandbox / manually-adjudicated turn-based combat bookkeeping tool for a game design classroom
**Researched:** 2026-08-26
**Confidence:** MEDIUM-HIGH (VTT bookkeeping features verified against live product docs; explorable-explanation patterns verified against primary source; asymmetric-balance visualization is the weakest area — no strong prior art found, treat as original design)

---

## Reference Classes Surveyed

| Class | Named tools examined | What transfers | What does NOT transfer |
|-------|---------------------|----------------|------------------------|
| VTT combat bookkeeping | Owlbear Rodeo **Battle Board**, Owlbear **Game Master's Grimoire (HP Tracker)**, **Foundry VTT** core Combat Tracker + Monk's Combat Details, Roll20 Turn Tracker | HP math input, inline stat editing, round counter, defeated state, active-turn highlight, HP ratio color bands, group/minion handling | Grids, range overlays, initiative order, dice, condition auto-expiry |
| Encounter builders / balance calculators | **Kobold Fight Club**, **PF2e Encounter Builder** (Foundry), **pf2calc**, **Pathbuilder 2e Encounters** | Live readout that recomputes as you build; both sides visible at once; elite/weak ±1 toggles | The color-coded difficulty verdict badge (Trivial→Extreme) — this is the exact anti-pattern here |
| Balance simulation for education | **Machinations.io** (used in 150+ university curricula) | Live charts driven by a live model; educators-first framing | Monte Carlo batch prediction, AI-Balancer — both explicitly out of scope |
| Explorable explanations | **Nicky Case** design patterns (2 primary posts), Parable of the Polygons | *Place Your Bets*, *Sandbox Mode last*, *Start Small Build Big*, *See/Model/Apply*, *Do & Show & Tell* | Cognitive gates / content locks (wrong for a live workshop instrument) |
| Perfect-information tactics | **Into the Breach**, **Slay the Spire** | Show the model's expectation up front so play can test it | Nothing else — these resolve combat |
| Attrition math | Lanchester's Square Law (Gamasutra/Game Developer "Kicking Butt by the Numbers"; RTS design writeups) | The *reason* a naive eHP×DPS ratio mispredicts 9v3 — this is the tool's central teaching moment | Implementing Lanchester as a second projection |

---

## Feature Landscape

### Table Stakes (Users Expect These)

Missing any of these and the tool fails as a classroom instrument.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Per-unit HP + faction AP steppers** | The allocation *is* the exercise. Every encounter builder and every character builder surveyed uses discrete +/− adjustment on integer stats. | LOW | Delegated click handler on a container, `data-` attributes for target path. Hold-to-repeat is a nice-to-have, not required. |
| **Token-row display of allocation** (green squares / yellow triangles / red diamonds) | Mirrors the physical workshop board; students must recognize the digital tool as the same artifact. | LOW–MED | Inline SVG or CSS shapes in a flex-wrap row. **Needs a compaction rule**: 9 Cats × 20 HP = 180 tokens will wrap into an unreadable wall on a projector. Decide a threshold (e.g. >12 tokens → render `10 ▣ ▣ ▣` grouped-by-five, or `×N` numeral suffix). |
| **Add / remove units per side** | PROJECT.md: 9v3 is a starting point, not a fixture. Asymmetry means changing the *shape* of a side. | LOW–MED | State is an array per faction. Must decide what a newly added unit inherits (last unit's stats vs faction template) — pick "clone the faction template" and let steppers do the rest. Removing a unit mid-fight needs a rule (remove the rightmost? the one you clicked?). |
| **Prebuilt Cats & Mechs with actions, damage, keywords** | PROJECT.md excludes authoring from scratch. Tool picks up after the whiteboard step. | LOW | Static data literal at the top of the script. Keep it as the single source of truth for both display and reset. |
| **Hot-seat turn/round advance with active-side indicator** | Universal across every combat tracker surveyed. Foundry auto-increments the round counter on wrap; Battle Board does the same. | MED | Round counter + active faction. Must be **manually reversible** (step back a turn) because students will advance by accident mid-discussion. |
| **Shared faction AP pool with spend and per-turn refill** | PROJECT.md's stat-model divergence. Teaches action economy as a team resource. | MED | Refill amount should itself be an allocatable stat. Spending must be nudgeable both directions (students will rule that an effect refunds AP). |
| **Fast HP nudging with math input** | *The* verified bookkeeping affordance. Battle Board accepts `-8`/`+5` typed into the HP field; Grimoire supports +/− arithmetic and arrow-key ±1. This is how manual adjudication actually gets entered. | MED | Parse `-8`, `+5`, and bare `12` (set-to) in one input. Arrow keys ±1 while focused. This is PROJECT.md's "manual override is a primary interaction" requirement made concrete — do not bury it. |
| **Per-unit death at 0 HP, individually** | PROJECT.md: focus fire and overkill must be visible. Foundry/Monk's auto-marks defeated at 0 HP; Battle Board uses green/yellow/red bands. | LOW–MED | Auto-mark at 0, but **manually toggleable both ways** — a student may rule that Shield prevented the kill. Dead units stay on screen (greyed), they do not disappear; the corpse count is the lesson. |
| **Manual override on *every* tracked value** | Because effects and counters are student-adjudicated, override is how rules get applied at all. Not an escape hatch. | MED | The discipline is *uniformity*: HP, AP, round number, damage values, alive/dead all editable by the same interaction. Any value that is read-only becomes a place where the students' ruling can't be recorded. |
| **Counter map + effect keyword reference cards** | PROJECT.md requirement; it is the material students adjudicate *from*. | LOW | Must be visible **without leaving the fight view** — a modal that covers the board fails during live play. Sidebar or collapsible strip. |
| **eHP vs DPS projection per side, live** | Every encounter builder surveyed recomputes on every edit. A projection that requires a "Calculate" click will not be watched. | MED | Recompute in the same render pass as everything else. See Differentiators for how to present it. |
| **Advisory framing — never a verdict** | PROJECT.md's core design tension. | LOW (code) / HIGH (discipline) | This is copy and visual-hierarchy work, not engineering. See Anti-Features — the temptation is to import the encounter-builder difficulty badge. |
| **Reset to Workshop 16 defaults** | Instructor demos repeatedly; students need a floor to return to. Explorable-explanation staple. | LOW | Requires defaults be kept separate from live state (deep-clone on reset, never mutate the literal). **Needs confirmation** if a fight is in progress — an accidental reset mid-demo is the worst possible failure on a shared screen. |
| **Share via URL-encoded build** | PROJECT.md; delivers the board's "post in the Discord thread" step with no backend. | MED | Two verified `file://` gotchas — see Implementation Notes below. Budget real time for this; it is not a one-liner. |
| **Projector legibility** | PROJECT.md constraint: instructor demoing live. | LOW–MED | No hover-only information anywhere (a projected screen has no hover for the room). Minimum ~16px body, larger for live numbers. Active turn must be identifiable from the back row. |
| **Undo (coarse, last-N)** | See the Undo section below — this is a *gap* in the reference class, not a copied feature, and it matters more here than in a VTT. | MED | Snapshot-based, ~30 deep, one keystroke (Ctrl+Z). Cheap **if** all mutations funnel through one commit function; expensive to retrofit. |

### Differentiators (What Makes It Teach Rather Than Just Track)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Predict-then-play** (capture a prediction before the fight; reveal the comparison after) | Nicky Case's *Place Your Bets* pattern verbatim: "give them the answer, but only after they've wrestled with the question." Creates the cognitive investment that makes the projection-vs-reality gap land. **This is the highest-leverage feature in the list** — it converts PROJECT.md's "design tension worth preserving" from a hope into a mechanic. | MED | One control before combat starts: "Who wins, and in how many rounds?" Store in state (rides in the share link). Reveal only after the fight ends. |
| **Projection vs. actual, side by side, at fight end** | The projection being wrong is the teaching moment. Making the divergence *explicit and numeric* is what turns it from a shrug into a lesson. | MED | Compare: projected rounds vs actual rounds; projected survivors vs actual survivors. Fight-end detection ("all units on one side at 0 HP") is bookkeeping, not adjudication — it observes a value the students set. Safe. Also allow the student to declare the fight over manually. |
| **Divergence callout with a named cause** | Don't just show the gap — give students the vocabulary. Lanchester's Square Law explains exactly why 9v3 diverges from a naive eHP×DPS ratio: concentrated fire makes effectiveness scale with the *square* of unit count, so a swarm's advantage is superlinear and a linear projection systematically underrates it. Elite sides need roughly an order-of-magnitude lethality edge before an outnumbered fight is close. | LOW–MED | Mostly copy. A short "why did this happen?" panel naming focus fire, overkill waste, and action-economy compounding. This is the single strongest *content* differentiator and costs almost nothing to build. |
| **Side-by-side normalized comparison bars** | The asymmetry-legibility feature. Two sides that look nothing alike become comparable when reduced to the same four bars. **No good prior art found** — encounter builders collapse both sides into one number; this is original design. | MED | Suggested axes: total eHP, total DPS-per-turn, total AP, and damage-per-AP (the efficiency axis that makes Lasers-3 vs Slash-1 legible). Normalize each pair to the larger of the two so the bars are directly readable. Hand-rolled div widths — no chart library (no external deps allowed). |
| **Stacked contribution breakdown** | Answers "*which* unit / *which* action is carrying this number?" A projection is a black box unless you can see its terms. Legibility is the whole point. | MED–HIGH | Per-side stacked bar segmented by unit or by action, with the arithmetic shown on hover *and* in a static list (no hover-only, per projector constraint). Depends on the projection existing first. |
| **Visible projection arithmetic** | The difference between a teaching tool and a calculator: show `9 cats × 12 HP = 108 eHP` and `3 AP × 1 dmg = 3 DPS`, not just `108 / 3`. | LOW–MED | Literally render the expression string. Cheapest legibility win available. |
| **Combat log / event history** | Foundry's chat log is the closest analog and is heavily relied on by GMs. In a classroom it does double duty: the instructor can walk back through the fight during discussion, and it makes undo's target obvious. | MED | Human-readable lines ("Cat 4 → 5 HP (−3)", "Mechs spent 2 AP"). Falls out nearly free if mutations funnel through one commit function. Include manual overrides in the log — those *are* the students' rulings and are the most interesting entries. |
| **Overkill / waste tracking** | Directly renders PROJECT.md's "focus fire and overkill waste are visible" requirement as a number. Feeds straight into the Lanchester lesson. | MED | Requires damage to be applied through an action affordance (which knows the intended amount) rather than only through raw HP nudge — see dependency notes. Track damage dealt beyond a unit's remaining HP, per side, per fight. |
| **Presets / scenario buttons** | Explorable-explanation staple. "Board default 9v3", "3v3 mirror", "swarm extreme 15v2" as one-click states lets an instructor pivot the demo in a second. | LOW | Same machinery as reset, different payloads. Nearly free once reset exists. |
| **Build annotation field** | "What I changed and why" carried in the share link. Serves the board's Discord-thread step and makes shared builds legible to classmates. | LOW | One textarea in state. Watch URL length. |
| **Sensitivity hint / what-if readout** | "+1 HP per Cat → projected rounds 4 → 5." Gives the *shape* of the model without running a batch sim. Stays inside the no-batch-sim boundary because it is a single recomputation of a deterministic formula, not a statistical claim. | MED | Compute the projection at stat±1 on hover/focus of a stepper. Careful with framing so it doesn't read as optimization advice. |
| **A/B build snapshot comparison** | Lets a student see their tuned build against the board default, or against a classmate's shared link. | MED–HIGH | Needs a second serialized state held alongside the live one. Defer past v1 — high value, but the comparison-bars feature delivers most of the insight at a third of the cost. |
| **Keyboard-first operation** | Live demo speed. Grimoire's arrow-key ±1 on HP is the precedent. | MED | Tab order that follows the board layout; arrows to nudge; Enter to advance turn; Ctrl+Z undo. |

### Anti-Features (Do Not Build)

**From PROJECT.md — already excluded, restated so they are visible at requirements time:**

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Automated combat resolution | "It's a fight, it should fight" | The adjudication *is* the exercise; automating it produces a game instead of a teaching instrument | Bookkeeping + fast manual override everywhere |
| Simulated counters | Counter map is right there in data | Students deciding when a counter applies is the reasoning being taught | Counter map as always-visible reference material |
| AI opponent | Solo practice | AI quality colors every balance read; students need visibility into both sides | Hot seat only |
| Point budget / cost cap | Feels like "real" balance | Teaches budget compliance instead of making asymmetry work | Balance is judged by playing the fight |
| Batch simulation / win-rate stats | "Just run it 1000 times" (this is exactly what Machinations does) | Makes the projection authoritative — destroys the framing the tool exists to create | One fight, played, with a prediction attached to it |
| Faction authoring from scratch | Generality | Faction invention is the instructor-led whiteboard step that precedes the tool | Tune the prebuilt Cats vs Mechs |
| Build tooling (React/Vite/npm) | DX | Breaks the one-file convention; requires a served build | Vanilla, single file |
| Persistence / accounts / backend | Save my work | No backend by constraint | URL-encoded build |

**Surfaced by this research — new exclusions to add:**

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Color-coded difficulty verdict badge** (Kobold Fight Club / PF2e "Trivial → Extreme" progress bar) | It is *the* standard readout in every encounter builder surveyed, and it will feel like the obvious thing to build | It is a verdict. PROJECT.md's central rule is that the tool never declares a build balanced. A green "BALANCED" pill would undo the entire pedagogy in one component. **This is the most likely accidental scope violation in the project.** | Neutral side-by-side bars with no threshold coloring and no summary label. Show the two numbers; let the student form the judgment. |
| **Dice / RNG of any kind** | Every VTT has it; combat feels like it needs randomness | Randomness makes a single fight non-diagnostic and pushes students toward "run it again," which is the batch-sim door | Students use physical dice at the table if their ruling calls for it, and record the result via manual override |
| **Grid, map, positioning, range measurement** (Battle Board's range overlays and edge-to-edge distance) | "Range" is literally one of the effect keywords | Range here is a *card* the students reason about, not a spatial system. A grid imports movement rules the workshop never defined and multiplies scope | Range stays a reference card; students rule on it |
| **Initiative order / per-unit turn queue** (Foundry, Roll20, Battle Board all center this) | It is the defining feature of the closest reference class | Fights the stat model: AP is a *shared faction pool*, so the side acts as a side. Per-unit initiative would impose a turn structure the workshop doesn't specify and make the shared pool incoherent | Side-level turn advance with a round counter |
| **Committed attack resolution flow** (select attacker → select target → damage auto-applies) | Looks like pure bookkeeping | It silently encodes rules: that damage always lands in full, that no counter fired, that no effect modified it. That is auto-resolution wearing a bookkeeping costume | An "apply" affordance that **prefills an editable number** into the target's HP input. The student confirms or edits it. The default is a suggestion, never a commit. |
| **Status/condition timers with auto-expiry** (Foundry effect durations) | Shield/Slowdown/Confuse look like tracked conditions | A timer decides duration on the students' behalf — that's adjudication | Manual status markers with no duration semantics, or no markers at all in v1 |
| **Charting library for the breakdown** | Stacked bars look like a chart problem | No external dependencies; must work offline from `file://` | Hand-rolled `div` widths and inline SVG |
| **Win/loss record across sessions** | "Track my playtests" | Requires persistence (excluded) and drifts toward win-rate statistics (excluded) | The single fight plus its prediction is the unit of learning |
| **Auto-advance turn when AP hits zero** | Convenience | Removes the student's ability to rule that something granted extra AP, and steals a decision point | Manual advance; show remaining AP prominently |

---

## Undo: Specific Findings

**The reference class does not solve this.** Documentation for Owlbear Battle Board, Owlbear Game Master's Grimoire, and Foundry's combat tracker contains no undo feature; searches for undo in Roll20 combat tracking surfaced only user complaints and workarounds. (Confidence: MEDIUM — absence of documentation is weaker than a stated absence, but it is consistent across three products.)

**Why VTTs get away without it:** every value is directly editable, so a GM who mis-clicks simply retypes the number. Direct editability is a *substitute* for fine-grained undo — and this tool already has direct editability as a table-stakes requirement.

**Why this tool still needs it:** two conditions the VTTs don't share.
1. **A stepper misfire is not obviously recoverable.** Retyping works when you remember the prior value. During an allocation pass with a dozen steppers, students won't.
2. **The shared screen.** An instructor who wipes a state mid-demo in front of a room has no graceful recovery. Reset-to-defaults is not a recovery — it's a second destruction.

**Recommended granularity:** one undo step per *committed mutation*, where a mutation is one stepper click, one HP input commit, one turn advance, one add/remove unit, or one reset. Not per keystroke. Depth ~30. Snapshot the whole state object (it is small — well under a few KB serialized) rather than implementing inverse operations; command-pattern inverses are strictly more code for no benefit at this scale.

**Reset must be undoable.** It is the highest-consequence action in the tool and the one most likely to be hit by accident.

---

## Feature Dependencies

```
[Single serializable state object + commit(mutation, label) funnel]
    ├──enables──> [Undo / redo]
    ├──enables──> [Combat log]
    ├──enables──> [Share link]
    ├──enables──> [Reset & presets]
    └──enables──> [Live projection recompute]

[Per-unit HP] + [Per-action damage] + [Faction AP pool]
    └──required by──> [eHP / DPS projection]
                          ├──required by──> [Side-by-side comparison bars]
                          ├──required by──> [Stacked contribution breakdown]
                          └──required by──> [Sensitivity / what-if readout]

[Round counter] + [Per-unit death] + [Fight-end detection]
    └──required by──> [Projection vs. actual comparison]
                          └──required by──> [Divergence callout]

[Predict-then-play capture] ──enhances──> [Projection vs. actual comparison]
    (the comparison works without it; it lands twice as hard with it)

[Action-based damage application] ──required by──> [Overkill / waste tracking]
    (raw HP nudge alone loses the intended-damage figure that overkill is measured against)

[Reset] ──shares machinery with──> [Presets / scenarios]

[Committed attack resolution] ──conflicts with──> [Student adjudication]
[Initiative order] ──conflicts with──> [Shared faction AP pool]
[Difficulty verdict badge] ──conflicts with──> [Advisory-only projection]
[Dice / RNG] ──conflicts with──> [No batch simulation]
```

### Dependency Notes

- **Everything hangs off the state funnel.** Undo, the combat log, the share link, reset, presets, and live recompute are four cheap features and two moderate ones *if* every mutation goes through one function that snapshots and re-renders. Retrofitted onto scattered direct-DOM mutation, each becomes a moderate-to-hard rewrite. **This is the single most important ordering constraint for the roadmap: build the state funnel in the first implementation phase, before any feature that consumes it.**
- **Overkill tracking has a hidden prerequisite.** To know that 5 damage hit a unit with 2 HP left, the tool must have seen "5 damage intended." A raw HP nudge from 2 to 0 is indistinguishable from a 2-damage hit. This forces the prefilled-suggestion attack affordance (which is in scope) rather than nudge-only (which loses the data). If the prefilled affordance is cut, overkill tracking must be cut with it — or degraded to "damage entered beyond remaining HP is logged as waste" and accepted as lossy.
- **Projection-vs-actual needs a fight end.** Detecting "one side is entirely at 0 HP" is bookkeeping (it reads values students set) and stays in scope. Also provide a manual "call the fight" button — students will stop early when the outcome is obvious, and that's a legitimate playtest ending.
- **Predict-then-play must gate on combat start**, which means the tool needs a soft mode boundary between allocation and fight. Not a hard lock (students will re-allocate mid-fight, and should be able to) — just a "start the fight" moment that the prediction attaches to.

---

## MVP Definition

### Launch With (v1)

- [ ] **State funnel** (single serializable object, one commit path, full re-render) — everything else is priced off this
- [ ] **Allocation steppers** for per-unit HP, faction AP, per-action damage — the exercise
- [ ] **Token-row display** with a compaction rule — the board's visual vocabulary
- [ ] **Add / remove units per side** — asymmetry means changing shape, not just numbers
- [ ] **Prebuilt Cats & Mechs data** with actions and keywords — tool picks up after the whiteboard
- [ ] **Hot-seat turn/round advance**, reversible — the fight
- [ ] **Shared AP pool** with spend and refill — the action-economy lesson
- [ ] **Fast HP nudge with math input** (`-8`, `+5`, `12`) plus arrow keys — how adjudication is entered
- [ ] **Per-unit death at 0 HP**, manually toggleable, corpses visible — focus fire and overkill made visible
- [ ] **Manual override on every tracked value** — how student rulings get recorded at all
- [ ] **Counter map + effect cards** visible without leaving the fight — the adjudication reference
- [ ] **Live eHP/DPS projection with visible arithmetic**, per side — the model
- [ ] **Advisory framing** — no verdict, no badge, no threshold colors
- [ ] **Reset to Workshop 16 defaults**, confirmed and undoable
- [ ] **Share link** (hash-encoded, with clipboard fallback) — the Discord step
- [ ] **Undo, ~30 deep, Ctrl+Z** — the shared-screen safety net
- [ ] **Projector legibility** — no hover-only information anywhere

### Add After Validation (v1.x)

- [ ] **Predict-then-play** — trigger: first classroom run confirms students engage with the projection at all. Highest-value addition on this list.
- [ ] **Projection vs. actual comparison + divergence callout** — trigger: fights actually reach a conclusion in workshop time
- [ ] **Side-by-side normalized comparison bars** — trigger: students struggle to articulate *why* two builds are comparable
- [ ] **Combat log** — trigger: instructor wants to review a fight during discussion
- [ ] **Presets / scenarios** — trigger: instructor pivots the demo more than once
- [ ] **Overkill / waste tracking** — trigger: the swarm-vs-elite lesson isn't landing from corpse count alone
- [ ] **Build annotation field** — trigger: shared links arrive in Discord without context

### Future Consideration (v2+)

- [ ] **Stacked contribution breakdown** — defer: the comparison bars deliver most of the legibility for a third of the cost; add only if students ask "which unit is carrying this?"
- [ ] **A/B build snapshot comparison** — defer: doubles state management complexity; the share link already lets two students compare by swapping URLs
- [ ] **Sensitivity / what-if readout** — defer: needs careful framing to avoid reading as optimization advice, which drifts toward "solve the balance"
- [ ] **Full keyboard-first operation** — defer: partial coverage (arrows on steppers, Ctrl+Z) ships in v1; complete tab-order design is polish

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| State funnel | HIGH (enabling) | MEDIUM | P1 |
| Allocation steppers | HIGH | LOW | P1 |
| Token-row display + compaction | HIGH | LOW | P1 |
| Add / remove units | HIGH | LOW | P1 |
| Prebuilt faction data | HIGH | LOW | P1 |
| Turn / round advance (reversible) | HIGH | MEDIUM | P1 |
| Shared AP pool | HIGH | MEDIUM | P1 |
| HP math input | HIGH | MEDIUM | P1 |
| Per-unit death, corpses visible | HIGH | LOW | P1 |
| Universal manual override | HIGH | MEDIUM | P1 |
| Reference cards in-view | HIGH | LOW | P1 |
| Live eHP/DPS projection with arithmetic | HIGH | MEDIUM | P1 |
| Reset (confirmed, undoable) | HIGH | LOW | P1 |
| Share link | HIGH | MEDIUM | P1 |
| Undo (~30, Ctrl+Z) | HIGH | MEDIUM | P1 |
| Projector legibility | HIGH | LOW | P1 |
| Predict-then-play | HIGH | MEDIUM | P2 |
| Projection vs. actual + divergence callout | HIGH | MEDIUM | P2 |
| Side-by-side comparison bars | HIGH | MEDIUM | P2 |
| Combat log | MEDIUM | MEDIUM | P2 |
| Presets / scenarios | MEDIUM | LOW | P2 |
| Overkill / waste tracking | MEDIUM | MEDIUM | P2 |
| Build annotation | MEDIUM | LOW | P2 |
| Prefilled attack suggestion | MEDIUM | MEDIUM | P2 |
| Stacked contribution breakdown | MEDIUM | HIGH | P3 |
| A/B snapshot comparison | MEDIUM | HIGH | P3 |
| Sensitivity readout | LOW | MEDIUM | P3 |
| Full keyboard-first | LOW | MEDIUM | P3 |

---

## Competitor Feature Analysis

| Feature | Owlbear Battle Board / Grimoire | Foundry Combat Tracker | Kobold FC / PF2e Builders | Machinations.io | **Our Approach** |
|---------|--------------------------------|------------------------|---------------------------|-----------------|------------------|
| HP entry | Math input (`-8`), arrow keys ±1, inline edit | Direct edit on token/sheet | n/a | n/a | **Adopt directly** — math input + arrows |
| Health visualization | Bar with green/yellow/red ratio bands | Bar + defeated overlay | n/a | n/a | **Token rows** (board vocabulary) + a numeric readout; avoid threshold *colors* on the projection itself |
| Defeated handling | Red band at 0 | Auto-mark defeated, optionally hide, skip in turn order | n/a | n/a | Auto-mark at 0, **manually toggleable, never hidden** — corpses are the lesson |
| Turn structure | Initiative order, decimal tie-break, minion grouping | Per-combatant initiative, round auto-increment | n/a | n/a | **Reject initiative.** Side-level turn + round counter; AP is a faction pool |
| Balance readout | n/a | n/a | Live color-coded difficulty badge + progress bar, tiers shown at once, recomputes on every edit | Live charts, Monte Carlo, AI-Balancer | **Live recompute: adopt. Verdict badge: reject.** Neutral numbers with visible arithmetic |
| Prediction / simulation | n/a | n/a | XP-budget formula (deterministic) | Monte Carlo batch | **Deterministic single projection, explicitly advisory**, tested by one played fight |
| Undo | Not documented | Not documented | n/a | Diagram-level undo | **Build it** — unmet need in the reference class, and the shared screen raises the stakes |
| History | Roll history, Discord webhook | Combat chat log | n/a | Simulation charts | **Combat log** as discussion material, includes manual overrides |
| Spatial | Range overlays, edge-to-edge distance, elevation | Grid, measurement, templates | n/a | n/a | **Reject entirely** — Range is a reference card, not a system |
| Randomness | Integrated dice roller (dddice, 3D) | Full dice engine | n/a | Stochastic nodes | **Reject** — one fight must be diagnostic |
| Presets | Staging system for encounter waves | Scene/encounter save | Saved encounters | Template diagrams | **Presets as one-click scenario states** (9v3, 3v3, swarm extreme) |

---

## Implementation Notes for a Single-File `file://` Artifact

Two verified constraints that directly affect table-stakes features:

**1. Share link — `history.pushState`/`replaceState` throws on `file://`.** The document origin is `null`, so a full-URL state push raises `SecurityError`. **Hash-only changes are accepted** (`pushState(null, '', '#' + data)`), and setting `location.hash` directly always works. Encode the build into the fragment, not a query string. Confidence: MEDIUM-HIGH (Chromium issue tracker + MDN + multiple corroborating reports).

**2. Copy-to-clipboard — `navigator.clipboard` may be undefined.** The Clipboard API requires a secure context. Whether Chrome treats `file://` as potentially-trustworthy has changed across versions and the sources conflict, so **do not rely on either answer**. Ship the defensive pattern: feature-detect `navigator.clipboard?.writeText`, and on absence or rejection fall back to a visible, pre-selected read-only input the user can copy manually (more reliable than `document.execCommand('copy')`, which is deprecated and not guaranteed on any browser). Confidence: MEDIUM — the fallback is correct regardless of how the secure-context question resolves; verify actual behavior during implementation.

**3. No external dependencies.** All visualization (token rows, comparison bars, contribution breakdowns) must be hand-rolled CSS/inline SVG. This is why the stacked contribution breakdown is rated HIGH complexity while the comparison bars are MEDIUM — segmented bars with legible per-segment labels are meaningfully harder than paired proportional bars.

**4. State size.** A 12-unit build with stats, actions, prediction, and annotation compacts to a few hundred bytes of JSON; base64 in a fragment is comfortable. Annotation text is the only field that can blow the budget — cap it (~280 chars) or drop it from the URL.

---

## Open Questions for Requirements

- **Token compaction threshold.** At what token count does the row switch from literal tokens to grouped/numeric display? Affects whether high-HP allocations are usable at all.
- **Does the prefilled attack suggestion ship in v1?** It is the prerequisite for overkill tracking and the safest way to make damage application fast — but it is also the feature closest to the auto-resolution line. Recommendation: ship it, with the prefilled value landing in an *editable, uncommitted* field.
- **What does a newly added unit inherit?** Faction template (recommended) vs. clone-last-unit vs. blank.
- **How is the fight declared over?** Auto-detect all-dead, manual "call it", or both (recommended: both).

---

## Sources

**Verified product documentation:**
- Owlbear Rodeo Battle Board — https://extensions.owlbear.rodeo/battle-board (HP math input, status color bands, minion grouping, round auto-increment, inline stat editing, range overlays)
- Owlbear Rodeo Game Master's Grimoire / HP Tracker — https://extensions.owlbear.rodeo/hp-tracker (HP +/− arithmetic, arrow-key ±1, dynamic HP-ratio color, groups, dice/roll logging; no documented undo or condition markers)
- Owlbear Rodeo Initiative Tracker docs — https://docs.owlbear.rodeo/extensions/examples/initiative-tracker/
- Foundry VTT Combat Encounters — https://foundryvtt.com/article/combat/
- Monk's Combat Details (Foundry) — https://foundryvtt.com/packages/monks-combat-details (auto-defeated at 0 HP, skip defeated in turn order, hide defeated)
- PF2e Encounter Builder (Foundry) — https://foundryvtt.com/packages/pf2e-encounter-builder (live color-coded difficulty badge + progress bar, all tiers shown, elite/weak ±1 toggles)
- pf2calc — https://pf2calc.com/
- Machinations.io educators — https://machinations.io/educators (150+ university curricula, Monte Carlo prediction, AI-Balancer)

**Primary-source design patterns:**
- Nicky Case, "Explorable Explanations" — https://blog.ncase.me/explorable-explanations/ (Do & Show & Tell; Interest Curves; Start Small, Build Big; See, Model, Apply; Cognitive Gates; Procedural Rhetoric)
- Nicky Case, "Explorable Explanations: 4 More Design Patterns" — https://blog.ncase.me/explorable-explanations-4-more-design-patterns/ (Puzzle It Out; **Place Your Bets**; Role Play; Sandbox Mode)

**Balance theory:**
- "The Designer's Notebook: Kicking Butt by the Numbers: Lanchester's Laws" — https://www.gamedeveloper.com/design/the-designer-s-notebook-kicking-butt-by-the-numbers-lanchester-s-laws
- "Lanchester's Laws and RTS Design" — http://www.thatsaterribleidea.com/2010/08/lanchesters-laws-and-rts-design.html
- Kobold Fight Club usage guides (action-economy adjustment) — https://www.dungeonsolvers.com/how-to-use-kobold-fight-club-for-encounter-planning/
- "Perfect Information: The Killer Feature of Slay the Spire and Into the Breach" — https://jeremiahgames.com/2019/03/04/perfect-information-the-killer-feature-of-slay-the-spire-and-into-the-breach/

**Platform constraints:**
- Chromium issue: pushState/replaceState on `file:///` URLs — https://issues.chromium.org/issues/41060861
- MDN, History.replaceState() — https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
- Clipboard API secure-context requirement and fallback pattern — https://www.sitelint.com/blog/javascript-clipboard-api-with-fallback

**Confidence caveats:**
- Absence of undo in VTT combat trackers is inferred from absence in documentation across three products, not from a stated limitation. MEDIUM.
- No strong prior art was found for visualizing asymmetric-composition comparability. The comparison-bars and contribution-breakdown recommendations are original design informed by encounter-builder readouts, not copied patterns. LOW-MEDIUM — flag for validation in the first classroom run.
- Generic SEO "DPS calculator" tools surfaced heavily in search and were discarded as non-evidence; they are content farms, not designed artifacts.

---
*Feature research for: interactive game-balance teaching sandbox with manual adjudication*
*Researched: 2026-08-26*
