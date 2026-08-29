# Phase 5: Fight Loop & Playtest — Research

**Researched:** 2026-08-29
**Domain:** Turn-structured state machine over an existing single-file vanilla-JS artifact; asymmetric-attrition balance verification
**Confidence:** HIGH on everything measured in this session (the shipped state shape, the codec boundary, the gate word lists, the ledger render cost, the blowout direction). MEDIUM on the retune recommendations. LOW on nothing that is presented as a recommendation — LOW items are quarantined in § Open Questions.

---

## Summary

There is no CONTEXT.md for this phase, so nothing is locked by a discussion; the constraints come from ROADMAP.md's **THE ROUND LOOP** block, PROJECT.md's Out of Scope list, and the artifact itself. The artifact is unusually cooperative here: Phase 1 reserved the `fight` slice by name and shape, Phase 2 built the setup/fight branch into `buildColumn`, Phase 3 gave `turnsToWipe` an unused `activeUnits` parameter "so Phase 5 can project a fight in progress", and Phase 3.1 shipped three boundary assertions that describe the Advance path as Phase 5's and refuse it until then. **Most of this phase is filling in reservations, not inventing structure.** The plan should read the reservations first and honour their spelling — several of them name the op (`setFightShield`), the plan (`05-01`) and the reason.

Three findings change what the planner should build.

**First, the shipped 9v3 default blows out in the opposite direction to the one the roadmap anticipates, and the reason is structural rather than tuning.** Played under the tool's own rules, the Mechs wipe all nine Cats in **three rounds with two of three Mechs still standing** — 67% of their force and 67% of their eHP intact, against a criterion of "no more than roughly 30%". Lanchester's square law does not fire, because the **shared faction AP pool of 3 caps the Cats' throughput at three attacks per round no matter how many cats there are**: 3 cats, 6 cats and 9 cats produce a byte-identical outcome. The pool converts the square law back into a linear law. The project's own prior research (`.planning/research/PITFALLS.md` § Pitfall 10) predicts the swarm stomping the elites; measured, it is the reverse. Both shipped relationship records — Fly beats Slash, Lasers beat Hairball — also point Mechs-over-Cats, so faithful student adjudication makes the gap **wider**, not narrower. Plan 05-03 must be planned as a retune of `App.data.DEFAULTS`, not as a hoped-for pass.

**Second, the ledger is free at any size a workshop will reach, and the real constraint on it is `data-k` uniqueness rather than render cost.** Measured in Chrome 151 from `file://`: appending one more past-board row costs a flat **1.9–2.1 ms all the way to 60 rounds and 26,132 nodes**, and — the number that actually matters — `App.render.sync()` does **not move at all** with a 50-round ledger on the page (0.17 ms → 0.154 ms). The ledger is inert DOM outside the keyed reconcile. What *does* break is focus restore: `withPreservedFocus` takes the **first** `[data-k]` match scoped to `#board`, and a ledger of cloned boards placed above the live one inside `#board` makes that first match a dead ledger node. Measured directly: `firstScopedMatchIsInLedger: true`.

**Third, the line between bookkeeping and combat automation has a precise place to sit, and the artifact has already drawn most of it.** Advance may spend a declared action's cost, apply that action's **own declared `xf` terms**, and split damage across shield-then-health — because every one of those is a number the student themselves wrote down, restated back. Advance may **not** choose an action, choose a target, decide whether a relationship applies, decide whether an effect fires, or decide whether a unit is dead. `setUnitHp`'s own comment already says zero health "prompts a death ruling from the table, it never auto-kills (D-00d)", and `setAlive` is a separate stored flag for exactly that reason.

**Primary recommendation:** Add `state.fight.past` (an append-only array of prior round records) and `state.fight.decl` (this round's pending declarations) to the existing `fight` slice — never to `build`, which is the only slice the codec reads. Ship **one** `advanceRound` op whose commit label carries the round number, resolving both sides in one commit; render the ledger as a static region **outside `#board`** carrying **no `data-k` at all**; and treat plan 05-03 as a scheduled retune of `DEFAULTS.cats.ap` (the measured single dial that moves the shipped board from 67% to ≤33%), replayed and recorded.

---

## Architectural Responsibility Map

This is a single-file artifact with a fixed section order, so the "tiers" are the file's own named regions. The order is `data → model → state → serialize → ops → render → interactions → boot → selftest`, and dependency arrows point **down only**.

| Capability | Primary section | Secondary | Rationale |
|---|---|---|---|
| The round/declaration/ledger data shape | `[S03]` STATE | — | The slice contract and its lifetimes are already written in `[S03]`'s banner (`:2846-2884`); a new key must be added there or the banner "quietly lies" |
| Advance, declare, clear, damage, alive, fight-reset | `[S05]` OPS | — | "the only writer of state reachable from a student action — no exceptions" (`:4529-4531`) |
| Shield-then-health split arithmetic | **`[S05]`, not `[S02]`** | — | `[S02]` is pure derivation and must not know a fight is running; the split is a **write**, and writes live in ops. See § Q3 |
| Per-round throughput / eHP figures shown during the fight | `[S02]` MODEL | `[S06.3]` | `turnsToWipe(attacker, target, activeUnits)` already takes the third argument (`:2809`) |
| Ledger and current-board rendering | new `[S06.7]` | `[S06.1]` | `[S06.1]` owns the two columns; a ledger is a new region and needs its own sub-region, exactly as `[S06.6]` did for share |
| Declaration surface presses, Advance press | new `[S07.5]` | — | `[S07]`'s banner reserves the four seams for "a plan adding … a fight control" (`:9721-9723`) |
| Fight styles | new `[C14]` | — | Every `[C0x]`/`[C1x]` block prefixes its classes; several existing blocks warn by name that "a Phase 5 rule for `.row` or `.item`" would reach them |
| Fight defaults (the retune) | `[S01]` DATA `DEFAULTS` | — | `:2285-2287` names plan 05-03 as "the mechanism that retunes these, and this object is the single place that edit happens" |

---

## Project Constraints (from CLAUDE.md)

These are binding and several are mechanically enforced by `tests/selftest-node.cjs`.

| Directive | Enforcement |
|---|---|
| Single self-contained HTML file, opens from `file://` by double-click | `FORBIDDEN` scan: `https?://`, `<link`, ` src=`, `@import`, `url(` |
| One classic `<script>`, one `<style>` | The gate locates exactly one `<script>` block; `type="module"` is banned |
| No ES modules, no `import`, no `fetch`, no `XMLHttpRequest` | `FORBIDDEN` scan |
| **No `innerHTML` / `outerHTML` / `insertAdjacentHTML` / `document.write` / `DOMParser`** | `FORBIDDEN` scan — every node is `createElement`, every string is `textContent` |
| No `eval`, no `new Function` | `FORBIDDEN` scan, plus in-file checks 70 and 70b |
| No `url(` **anywhere in the document, including comments** | `FORBIDDEN` scan |
| No verdict, badge, traffic light or balance judgement | The three-layer PROJ-06 gate — see § The Vocabulary Gate |
| Storing derived eHP/DPS in state is forbidden | CLAUDE.md § What NOT to Use; compute during render |
| `localStorage` may never be load-bearing | CLAUDE.md; not needed by this phase |
| Reuse the sibling artifacts' dark tokens | `[C00]` |

> **CLAUDE.md correction, recorded rather than absorbed.** CLAUDE.md § "State Management Without a Framework" prescribes *"immediate-mode region re-render"* with an `__lastHTML` memo and quotes a benchmark table for `innerHTML` full re-render (0.79 / 1.82 / 5.54 / 23.03 ms). **The artifact does not and cannot work that way** — `innerHTML` is on the `FORBIDDEN` list and the file uses a two-tier `structure()` / `sync()` reconcile built entirely from `createElement` + `textContent`. Those CLAUDE.md numbers are not applicable to this codebase and must not be used to size the ledger. The measured replacements are in § Measurements. `[VERIFIED: FORBIDDEN scan at tests/selftest-node.cjs:40, and measured this session]`

---

## Phase Requirements

| ID | Description | Research support |
|---|---|---|
| FIGHT-01 | Start a fight from the current build | `App.ops.startFight()` **already ships** (`:5144`), dispatch arm `'startFight'` (`:6361`). Needs only a control |
| FIGHT-02 | Advance and rewind turn and round; the tool never advances on its own | **Superseded in shape** by THE ROUND LOOP. Rewind = `undo()`, which already crosses the fight boundary (measured: 1 step un-starts the fight) |
| FIGHT-03 | Spend a faction's AP, spent points visibly distinct from available | `App.model.apSpent(buildFaction, fightSide)` ships (`:2742`), floored at 0. `fight[side].ap` is the live pool |
| FIGHT-04 | Apply damage to an individual unit | `setUnitHp` ships (`:5113`) but is a raw set, not a damage application. Needs the shield split — see § Q4 |
| FIGHT-05 | Zero health marks dead; manually toggleable | `setAlive` ships (`:5123`) as a **stored flag**, never inferred. `aliveCount` reads the flag (`:2733`) |
| FIGHT-06 | Dead units stay visible | `buildColumn` renders every unit regardless (`:7075`); the `dead` token vocabulary ships with **no renderer consumer yet** (`:2340-2368`) |
| FIGHT-07 | Override any tracked value; the override is visibly marked | **Key-naming hazard** — see § Q6 and the `[S09.10]` row-2 walk |
| FIGHT-08 | Combat log records each turn's actions and every override | `fight.log` ships as `[]` with no writer (`:5152`). See § Q2 on whether the ledger subsumes it |
| FIGHT-09 | Whose turn and what remains to spend, unambiguous at a glance | Simultaneous declaration removes "whose turn"; the readable fact is **the round number and both pools** |
| FIGHT-10 | Mid-fight build edits apply to the build, and the tool says so | See § Q5. `build` and `fight` are already independent slices |
| FIGHT-11 | The shipped 9v3 default is genuinely contested — verified by playing | **Measured to fail today at 67%.** See § Q7 |
| FIGHT-12 | Declare both sides' actions, with performer and target, before anything resolves | New `fight.decl`. Reuse `[S06.5]`'s action list and `App.model.affordability` |
| FIGHT-13 | One Advance resolves the declared round for both sides at once | One `advanceRound` op, one commit, label carrying the round number |
| FIGHT-14 | The previous board moves up into a visible accumulating history | New `fight.past` + a ledger region outside `#board` |
| FIGHT-15 | The current board shows what changed since the previous round | Derived at render time from `fight.past[last]` vs the live fight side. **Never stored** |
| FIGHT-16 | Damage spends shield before health, and the split is shown | See § Q4 |
| PROJ-05 | The projection stays visible during the fight | `#strip` is a static sibling inside `#board` and is never rebuilt; `turnsToWipe` takes `activeUnits`. The strip currently reads `state.build` only (`:8182`) — see § Open Questions |
| REF-03 | Reference material readable without leaving the fight view | **Already satisfied.** `refCard` appends run *outside* `buildColumn`'s setup branch, deliberately, and check at `:16621` says so |
| SHARE-07 | Reset the fight without discarding the build | One `resetFight` op. Measured: naive `endFight()` + `startFight()` costs **two undo entries** |

---

## Standard Stack

**No new dependencies. None are permitted and none are needed.** Every capability this phase requires is already present in the artifact or in the platform.

| Capability | What to use | Where it already lives |
|---|---|---|
| State transformation | `App.state.commit(label, mutator)` | `:2938` |
| Undo | `App.state.undo()`, 30 deep, 500 ms coalescing | `:2992`, `UNDO_LIMIT` / `COALESCE_MS` at `:2888`/`:2892` |
| Structural rebuild | `commitStructural(label, mutator)` in `[S05]` | `:5040` |
| Round arithmetic | `App.model.actionApCost` / `actionDamage` / `affordability` | `:2559`, `:2572`, `:2699` |
| Live survivor count | `App.model.aliveCount(fightSide)` | `:2733` |
| Spent-AP display | `App.model.apSpent(buildFaction, fightSide)` | `:2742` |
| Extension seams | `UI_ACTS` / `UI_HANDLERS` / `HOLD_ACTS` / `LATE_BINDERS` / `SYNC_HOOKS` | `:9752`, `:9764`, `:9779`, `:9785`, `:7294` |
| Dead marker | `DEFAULTS.tokens.dead` (`rect`, `ink-dim`, skull glyph) | `:2362-2368` — ships as vocabulary with no consumer, **for this phase** |

### Package Legitimacy Audit

**Not applicable.** This phase installs no packages into the artifact. The artifact has zero runtime dependencies by hard constraint and this phase does not change that.

One dev-only, never-shipped tool was installed **in a scratchpad outside the repository** to take this session's browser measurements:

| Package | Registry | Version | Disposition |
|---|---|---|---|
| `playwright` | npm | 1.62.1 | Used in the scratchpad only. Already named in CLAUDE.md § Development Tools as the optional dev-only smoke-test tool at exactly this version. **Not added to the repo, not added to `tests/`, no `package.json` created in the project.** |

`slopcheck` was not run: no package is being recommended for installation into this project, so there is nothing for it to rule on. If a later plan wants Playwright checked into `tests/`, that is a separate decision with its own gate.

---

## The Central Questions, Answered

### Q1 — Where does the fight live?

**Confirmed against the shipped state shape by driving the ops.** `[VERIFIED: probe, this session]`

```
state = { build: {...}, fight: null | {...}, ui: {...} }        // :2870-2874
fight = { round, turn, log, cats, mechs }                        // measured after startFight()
fight[side] = { ap, units: [ { id, hp, shield, alive } ] }       // measured
```

- `[S04] SERIALIZE`'s banner: *"Knows about `build` only — never about `fight` or `ui`."* (`:3178`)
- `encode` takes the build slice **as an argument** and never reaches `App.state` (`:3232-3252`). Measured: `encode(state.build)` on the shipped board produces `v1~N~V~A9~3~9*3!0~9*~~~~B3~3~3*6!3~3*~~~~7tvo`, 45 characters.
- `[S03]`: *"`build` round-trips through the share code and the undo stack; `fight` is undo-only and never shared; `ui` is in neither."* (`:2880-2882`)

So SHARE-07 is already structurally satisfied: resetting the fight cannot touch the build because the codec never reads the fight and `endFight()` explicitly leaves `build` untouched (`:5159-5161`, measured `buildUnchanged: true`).

**What the new fight slice holds:**

| Key | Holds | Why here |
|---|---|---|
| `round` | integer, 1-based | ships already |
| `cats` / `mechs` | `{ ap, units: [{id, hp, shield, alive}] }` | ships already |
| `decl` | this round's pending declarations, cleared by Advance | must be undoable and must repaint; the proposal's DOM-only home does not transfer — see below |
| `past` | append-only array of resolved round records | FIGHT-14's history has to survive undo and has to be the same thing the render reads |
| `log` | ships as `[]` with no writer | FIGHT-08. May be folded into `past` — see Q2 |

**What it must NOT hold:**

- **Nothing derived.** No eHP, no DPS, no turns-to-wipe, no "what changed since last round". CLAUDE.md forbids it (*"Storing derived eHP/DPS in state … creates a second, mechanical reason for the projection to disagree with the board, muddying the pedagogical disagreement"*), and FIGHT-15's diff is a pure function of `past[last]` and the live side — compute it in `[S06]`.
- **No key matching `/propos|override|caster|target|pending/i` at any depth.** `[S09.10]`'s row 2 (`:17913`) walks the entire state recursively for those five stems and asserts an empty result. Measured: a declaration record spelled `{ side, actionId, caster, target }` reddens it with `state.fight.decl.0.caster` and `state.fight.decl.0.target`; the same record spelled `{ side, actionId, by, at }` is clean.
- **No `mode` key.** `[S03]`: *"Mode is derived from `fight !== null`, so the two can never disagree."*
- **No `turn` semantics that contradict the round loop.** `turn: 'cats'` ships in the slice from Phase 1 and encodes alternating turns, which THE ROUND LOOP supersedes. It should be removed or repurposed deliberately, in the banner, not left as a field nobody writes.

**Where `decl` lives — and why the proposal's answer does not transfer.** Phase 3.1 put the proposal on the DOM specifically so *"there is no state in which a proposal exists and has not been accepted"* (03.1-07 key decision). A declaration is the opposite case: it is a state in which an intent exists and has not resolved, **by design** — that is what FIGHT-12's "before anything resolves" means. It must survive a repaint, survive `structure()`, be undoable, and be readable by Advance. So `decl` belongs in `state.fight`. The plan should say this explicitly, because the file's most recent precedent argues the other way for a different reason.

---

### Q2 — The declaration → Advance → ledger loop, concretely

**Data shapes.** All integers, strings and booleans; JSON-clonable, no functions, no DOM nodes (`[S03]`'s shape rule). Field names chosen to clear the `[S09.10]` row-2 walk — verified against the live regex.

```js
// One declaration. `by` and `at` are unit ids; both may be null, because the
// tool must be able to record a student saying "Hairball, no target".
// NOT `caster` / `target` — those two keys redden [S09.10] row 2. Measured.
decl = [ { side: 'cats', act: 'slash', by: 'c1', at: 'm1' }, ... ]

// One resolved round, appended to fight.past by Advance.
// `was` is the board BEFORE this round resolved — it is what FIGHT-14 puts on
// screen and what FIGHT-15 diffs the live board against.
past[i] = {
  round: 3,
  was:  { cats: { ap, units:[{id,hp,shield,alive}] }, mechs: {...} },
  did:  [ { side, act, by, at, apPaid, hit: { shield: 2, health: 1, spare: 0 } } ],
  hand: [ { side, unit, tok, from, to } ]      // FIGHT-07/08: rulings recorded by hand
}
```

`hit.shield` / `hit.health` / `hit.spare` is FIGHT-16's split carried as three numbers so the page can read it back without recomputing (see Q4). `spare` is what the hit had left over after the unit reached zero — the overkill figure PROJECT.md names as the thing a student should be able to see, without the tool commenting on it.

**Advance, as one commit.**

```
advanceRound():
  commitStructural('advance to round ' + n, s => {          // label carries the round — see below
    f = fightOf(s)
    f.past.push({ round: f.round, was: deepCopy({cats,mechs}), did: [], hand: drain(pendingHand) })
    for each declaration in f.decl (in a fixed, stated order):
        pay the action's cost out of f[side].ap        // clamped at 0, never below
        for each xf term the action itself declares:
            resolve who it lands on from `by` / `at`
            if the term is a NEGATIVE delta on 'hp' -> shield-then-health split
            else                                     -> plain signed delta, clamped
        record what happened into the past entry's `did`
    f.decl = []
    f.round += 1
  })
```

**The commit label must carry the round number.** Measured this session: two `commit()` calls with the **same** label inside `COALESCE_MS` (500) fold into **one** undo entry; with distinct labels they are two. Two fast Advance presses labelled `'advance'` would therefore be a single Ctrl+Z that rewinds two rounds. Labelled `'advance to round 4'` / `'advance to round 5'` they are two entries. This is the same trap plan 03.1-06 already recorded for the term-slot index ("the slot index inside the commit label, so one field burst is one Ctrl+Z step and two slots stay two").

**Structural, not sync-only.** `startFight` and `endFight` both use `commitStructural` because `buildColumn` derives `setup = (state.fight === null)` (`:7072`). Advance changes the ledger's node count, so it is structural for the same class of reason: `sync()` reconciles text and classes in place and has no path to append a region.

**How many ledger rounds the page can hold — measured, not estimated.**

Chrome 151 (`channel: 'chrome'`), Windows 11, `file://`, 1920×1080, the shipped 9v3 board with a fight running.

| Ledger design | Nodes per round | Marginal cost of one more row | `sync()` with the ledger present |
|---|---|---|---|
| **A** — full clone of `#board` | 300 | **1.9–2.1 ms, flat to 60 rounds / 26,132 nodes** | 0.154 ms at 50 rounds (baseline 0.17) |
| **B** — compact text row, one line per unit | 66 | 100 rounds built and appended in **7.9 ms total** | 0.172 ms at 100 rounds |
| **C** — token squares, one per point | 67 | 50 rounds in **2.7 ms total** | 0.154 ms at 50 rounds |

Baselines on the same board: `sync()` **0.17 ms**, `structure()` **2.24 ms**, `#board` = 427 nodes of which **78 carry `data-k`**.

**The answer: there is no crossover a workshop can reach.** The per-frame cost — the one that governs whether the board feels responsive — is **completely flat**, because the ledger is inert DOM that the keyed reconcile never walks. The one-time append is 2 ms at the worst design and stays 2 ms at 60 rounds. For scale: the shipped board resolves in **3 rounds**, and the slowest retune measured in this session took **9**. A 30-round cap is already three times the realistic worst case and costs 9,324 nodes and ~60 ms of accumulated append across a whole fight.

Sanity check at the ugly end: a **24v24** board (`#board` = 1,558 nodes) with a 30-round design-A ledger reaches 29,846 nodes, and `sync()` there is **0.57 ms** with the ledger versus 0.535 ms without — still flat. `structure()` on that board is 7.92 ms, which is the real ceiling, and it is unchanged by the ledger.

**Recommendation:** cap the ledger at **30 rounds** and drop the oldest, matching `UNDO_LIMIT`'s existing 30 and giving one number rather than two. Do it for the reason that actually applies — a page of past boards stops being readable long before it stops being fast — and say so, rather than implying a performance reason the measurement does not support.

---

### Q3 — What "resolve" means: the line, drawn precisely

This is the phase's load-bearing decision. The test that keeps it stable:

> **Advance may restate; it may never decide.** Every number Advance writes must be one the student put on the board themselves — an action's own declared cost, an action's own declared `xf` terms, the unit they named as performer, the unit they named as target. The moment Advance would have to *choose* between two admissible readings, it stops and the table rules.

| Act | Advance does it | Why |
|---|---|---|
| Subtract the declared action's `cost` from `fight[side].ap` | **YES** | ACT-02 says the cost is *"**consumed** when it fires"*, and 03.1-07-SUMMARY records the corollary verbatim: *"it is **spent on Advance**, in Phase 5, by the same D-05b ruling"* |
| Apply the action's own `xf` terms to `by` / `at` | **YES** | ACT-04 + ACT-05: the terms are the student's own rule, already restated to them by the proposal pane. Landing them is the "remaining half of ACT-05" that `[S09.10]` row 3 names as this phase's |
| Split a negative `hp` delta across shield then health | **YES** | FIGHT-16, and the developer specified it directly. It is arithmetic over two stored numbers, not a ruling |
| Clamp every write to `[0, MAX_ALLOC]` and refuse a non-integer | **YES** | `int()`'s existing contract (`:4545`) |
| Record what it did into `past[i].did` | **YES** | Bookkeeping, which is the tool's whole job |
| Advance the round number and clear `decl` | **YES** | FIGHT-13 |
| **Choose which action a side uses** | **NO** | The student declares it. Nothing in the tool picks |
| **Choose a target** | **NO** | 03.1-07 already ruled this: *"The target chooser lists EVERY unit on the board … Who an action may be pointed at is exactly the sort of question this tool does not answer."* |
| **Decide whether a relationship applies** (Fly beats Slash) | **NO** | PROJECT.md Out of Scope, "Simulated counters". `REFERENCE.beats` is reference material with no consumer in `[S05]` and must gain none |
| **Decide whether an effect fires** (Evade, Slowdown, Confuse) | **NO** | PROJECT.md Out of Scope. `keywords` has **no writer at all** and the codec does not carry it (`:3196-3216`) |
| **Decide whether a unit is dead** | **NO** | `setUnitHp`'s own comment: *"zero health prompts a death ruling from the table, it never auto-kills (D-00d)"* (`:5104-5106`). `alive` is stored, never inferred |
| **Refuse a declaration the side cannot afford** | **NO** | `App.model.affordability` carries a **never-disable rule in its own comment**, and check 71c asserts all 33 proposal controls stay enabled on a side driven to zero AP. Advance may take the pool to 0 and **report** the shortfall; it may not decline |
| **Decide the fight is over** | **NO** | Nothing may announce an outcome. See § The Vocabulary Gate |
| **Advance on its own** | **NO** | FIGHT-02 and FIGHT-13 both say so |

**The one genuinely new judgement the plan has to make and record: what happens when the pool cannot pay.** The options are (a) let `ap` go to 0 and stop paying, recording the shortfall in `did`; (b) let `ap` go negative and show it; (c) apply the `xf` terms anyway and record that the cost was unpaid. `int()`'s floor is 0 everywhere in this file and `apSpent` is *"[f]loored, because build and fight are independent slices by design"* (`:2737-2741`), which points at (a). Whatever is chosen, it is a **ruling** and belongs in a comment with its alternatives, in `resetToDefaults`' register — not in a plan file alone.

**The three `[S09.10]` boundary rows this phase must knowingly amend.** They are assertions **against** this phase, written on purpose so that Phase 5 has to change them deliberately (`:17878-17953`). Measured against the live regexes:

| Row | Line | What it forbids | Phase 5 collision |
|---|---|---|---|
| 1 | `:17893` | any export matching `/^(apply\|resolve\|advance\|spend\|fire\|perform\|execute\|enact\|land\|deal\|damage)/i` | `advanceRound`, `applyDamage`, `spendAp` all trip it; `declareAction`, `clearDeclaration`, `resetFight`, `setFightShield`, `nudgeFightHp`, `stepRound` do not |
| 2 | `:17913` | any state key matching `/propos\|override\|caster\|target\|pending/i`, **at any depth** | `caster`, `target`, `override`, `pending` all trip it. **FIGHT-07's "visibly marked as an override" cannot store a key called `override`** |
| 3 | `:17939` | any export matching `/^(advance\|nextRound\|endRound\|beginRound\|takeTurn)/i`, **and drives `dispatch('advanceRound')` expecting a throw** | This is exactly the op this phase adds |

The plan must **rewrite rows 1 and 3 into their positive form** — "the applier that exists is `advanceRound`, it is the only one, and here is what it does and does not touch" — rather than deleting them. Deleting the phase's own boundary assertion is how the Out of Scope entry stops being enforced. Row 2 should be **kept intact and honoured by naming**: `by` / `at` for the declaration, and something like `hand` / `byHand` for a ruling. That is cheaper than amending it and it keeps the assertion doing its job.

Also worth noting for honesty: check **72b** in `tests/selftest-node.cjs` (`:5631`) *drives* `dispatch('applyProposal', {side:'cats'})` and requires a refusal, and check **74** reads the live `App.ops` export list and reddens the moment a damage/keyword writer exists at all. Neither should be weakened — 74 in particular guards the codec, and it is unrelated to this phase's line.

---

### Q4 — Shield is shown, not applied silently

**The arithmetic**, applied only to a **negative delta on the `hp` token**. `DAMAGE_KEYS` is `['hp']` and it is already frozen and exported (`:2542`) with a comment recording the D-05c shield reading — reuse that constant rather than testing for `'hp'` inline.

```
applyHit(unit, amount):                  // amount is positive
  toShield = min(unit.shield, amount)
  unit.shield -= toShield
  toHealth = min(unit.hp, amount - toShield)
  unit.hp   -= toHealth
  spare     = amount - toShield - toHealth      // what the hit had nothing left to take
  // and NOTHING ELSE. unit.alive is not touched here.
  return { shield: toShield, health: toHealth, spare: spare }
```

Note what is deliberately absent: **`alive` is not written**. Zero health prompts a ruling; it does not cause one. That is D-00d and `setUnitHp`'s comment already states it.

**As data**, the triple goes into `past[i].did[j].hit`. **As a reading**, the split must be legible as three separate facts rather than one collapsed number, because "3 damage" and "2 off the shield, 1 off the health, none spare" teach different things. The register to copy is `[S06.3]`'s arithmetic-on-screen (PROJ-03) and 03.1-07's restatement pane — the existing approved line reads *"Pounce costs 1 Action points of 3"*, arithmetic with no adjective. Build the line **one node per fragment**, which is 03.1-07's established pattern and the thing that keeps Layer C reading the artifact's words while skipping the student's.

**Screened copy for the split** (all clean on all three gate layers, measured): `shield`, `health`, `through the shield`, `to health`, `split`, `absorbed`, `took`, `spare`, `remainder`, `thrown away`, `overkill`, `wasted`.

**Two decisions the plan owes a written answer to:**
1. **Does shield refill?** `Recharge` carries the `shield` keyword and its shield gain is **deliberately absent** from `DEFAULTS` (`:2329-2340`), with a whole paragraph and an `[S09.1]` row defending the absence. Advance must **not** restore shield on its own. A student who rules "Recharge gives 3 shield" records it by hand.
2. **Does the AP pool refill each round?** See § Q7 — this is not a free choice, because the projection already assumes it does.

---

### Q5 — Mid-fight build edits

**The mechanism already works and needs nothing.** `build` and `fight` are independent slices; `sideFromBuild` copies `maxHp` into `hp` and `shield` into `shield` **once, at `startFight`** (`:4917-4924`). Measured: with a fight running, `setUnitMaxHp` moves `build[side].units[i].maxHp` and leaves `fight[side].units[i].hp` untouched. There is no retroactive path, because there is no code that would take one.

Three consequences the plan must handle:

1. **Undo is shared and crosses the boundary.** `commit()` snapshots `{build, fight}` together (`:2939`), so one Ctrl+Z after a build edit made mid-fight rewinds the build edit and leaves the fight where it was — correct — but a Ctrl+Z chain **will eventually un-start the fight** (`:2999-3001`, D-08). Measured: from a mid-fight board, `undo()` reached `fight === null` in one step. That is existing, documented, intended behaviour; the notice should not contradict it.
2. **The notice is a permanent line, not a toast and not a modal.** D-17 declined confirmations twice by name, and the one time the policy met a competing requirement (ACT-07) *"the answer was a permanent LINE beside the button … explicitly not a dialog"* (`#tok-pick-names`, `:1185-1205`). Copy that. The reset confirmation at `:1690-1700` is the one exception in the file and its own comment states the narrow test that justified it — a fight-mode notice does not meet that test.
3. **Where it goes.** Beside the roster steppers that are still live during a fight, or in the fight region's own header. It must be visible **at the moment of the edit**, which a line in a collapsed panel is not.

**Screened copy** (clean on all three layers, measured): *"Edits here change your build. This fight keeps the numbers it started with."* Every word in it clears the gate. Avoid the tempting *"this fight is unaffected"* only because it reads as reassurance rather than as a fact; the gate does not object to it.

**Note the asymmetry, and say it once:** `commit()` mirrors the build to `location.hash` on **every** commit including fight commits (`:2916-2925`), because the mirror reads `App.state.get().build` inside the scheduled callback. So an Advance schedules a hash write that re-encodes the *unchanged* build. Harmless, already measured green by checks 75/75b/89, and worth a sentence so nobody "fixes" it.

---

### Q6 — FIGHT-07's override marker

FIGHT-07 requires the override to be **visibly marked as one**, which means something must be stored. The `[S09.10]` row-2 walk bans the key `override` at any depth. Options, in order of preference:

1. **Store it in `past[i].hand`, not on the unit.** A ruling is an event in a round, not a property of a number. This clears row 2 naturally (`hand`, `from`, `to`, `tok`, `unit` are all clean), gives FIGHT-08 its record for free, and means the marker on the board is *derived at render time* from "does the current round's `hand` list mention this unit and token?" — which also satisfies "nothing derived is stored".
2. If a per-value flag is genuinely needed, name it `byHand` (measured clean) and say in the comment why it is not called what it obviously is.

Do **not** amend row 2 to make `override` legal. Its job is to keep the proposal off the slices, and widening it for this phase costs that guarantee.

---

### Q7 — The playtest gate, and the Lanchester problem that is not the one that was predicted

**Everything in this section was measured by driving the shipped `App.model` functions in a `vm` sandbox loaded from the live artifact.** `[VERIFIED: simulation, this session]`

#### The shipped board, played

Simulation rules: simultaneous declaration; one Advance resolves both sides; the shared pool refills each round; each side takes `min(floor(ap / cost), aliveUnits)` uses of its best damage-per-AP action; focus fire onto one enemy until it reaches zero; shield-then-health; a unit at zero health stops acting from the next round. No counters and no effects, because those are the students' and the point is what the tool ships **before** anybody adjudicates.

```
factionEhp: cats 27, mechs 27          (identical — the board looks balanced on paper)
turnsToWipe(cats -> mechs): perTurn 3, hit 1, ehp 27, soak 27, fast 9, slow 9
turnsToWipe(mechs -> cats): perTurn 9, hit 3, ehp 27, soak 27, fast 3, slow 3

  r1   cats 6 alive (18 ehp)    mechs 3 alive (24 ehp)
  r2   cats 3 alive ( 9 ehp)    mechs 3 alive (21 ehp)
  r3   cats 0 alive ( 0 ehp)    mechs 2 alive (18 ehp)

RESULT: 3 rounds. Cats 0/9. Mechs 2/3 — 67% of force, 67% of eHP intact.
CRITERION: the side left standing keeps no more than roughly 30%.  ==> FAILS, by 2x.
```

**Resolution order inside one Advance does not change this.** Cats-first, Mechs-first and true-simultaneous all produce `0/9 vs 2/3 in 3 rounds`. So the simultaneity decision is a pedagogical and UX decision, not a balance one — at least on the shipped board. `[VERIFIED: measured, all three orders]`

#### Why the square law does not fire

`.planning/research/PITFALLS.md` § Pitfall 10 and `SUMMARY.md` both predict *"the swarm actually stomps the elites"*. Measured, the opposite happens, and the mechanism is the project's own stat-model divergence:

```
 3 cats vs 3 mechs, cats ap 3  ->  3 rounds, cats 0/3,  mechs 2/3
 6 cats vs 3 mechs, cats ap 3  ->  3 rounds, cats 0/6,  mechs 2/3
 9 cats vs 3 mechs, cats ap 3  ->  3 rounds, cats 0/9,  mechs 2/3
12 cats vs 3 mechs, cats ap 3  ->  5 rounds, cats 0/12, mechs 2/3
```

**Three cats and nine cats produce the identical outcome**, because throughput is `min(floor(ap / cost), aliveUnits)` and `min(floor(3/1), n) = 3` for every `n ≥ 3`. Lanchester's square law requires **every unit to contribute fire**; a shared faction pool of 3 means only three of nine cats act in any round. **The shared AP pool converts the square law back into a linear law.** PROJECT.md chose that pool deliberately ("a shared AP pool keeps 9-unit rosters tractable and teaches action economy as a team resource") without, apparently, noticing that it also cancels the effect the playtest gate was written to catch.

The square law reappears immediately once the pool scales with the roster:

```
 9 cats (ap  9) vs 3 mechs ->  5 rounds, cats  0/9,  mechs 1/3
12 cats (ap 12) vs 3 mechs ->  3 rounds, cats  6/12, mechs 0/3
18 cats (ap 18) vs 3 mechs ->  2 rounds, cats 14/18, mechs 0/3
```

#### The adjudication makes it worse, not better

`App.data.REFERENCE.beats` holds two records, and **both** point Mechs-over-Cats:

```
mechs/Fly     beats  cats/Slash        <- Slash is the Cats' only damaging action
mechs/Lasers  beat   cats/Hairball
```

A student playing the relationship table faithfully removes throughput from the side that is already losing. The third whiteboard relationship — Recharge over Fly, the one intra-Mechs pair — was dropped on the developer's instruction (`:2409-2418`). Restoring it would be the only shipped record that costs the Mechs anything. **That is an option for the retune and it is a `REFERENCE` edit, not a `DEFAULTS` edit** — the plan should note that `REFERENCE` sits deliberately outside `DEFAULTS` and outside the build code, so changing it does not touch the codec or the schema.

#### The grain problem

The Mechs are a **3-unit side**. Their force can only end at 0%, 33%, 67% or 100%. So *"no more than roughly 30% of its force intact"* against the Mechs means, exactly, **at most one Mech standing**. There is no finer grain available and the criterion should be read that way rather than argued about at the table. Against the Cats (9 units) the criterion means at most two cats standing.

#### The levers available in `data`, and what they measure

Every lever below is an edit to `App.data.DEFAULTS` at `:2303`, which the file itself names as *"the single place that edit happens"* for plan 05-03.

| Lever | Where | Effect measured |
|---|---|---|
| `DEFAULTS.cats.ap` | `:2307` | The dominant dial. 3→8 or 3→9 reaches `0v1` (33%, contested). 3→4,5,6,7 do **not** move the outcome |
| `DEFAULTS.mechs.ap` | `:2320` | Cats ap 9 × mechs ap 2 reaches `0v0` — mutual, the most contested cell in the sweep |
| `units[].maxHp`, either side | `:2308`, `:2321` | Cats hp 3→2 with ap 9 reaches `0v1`. Mechs hp 6→4 with cats ap 6 reaches `0v1` |
| `mechs.units[].shield` | `:2321` | Cats ap 9 + mechs shield 3→0 flips it to `3v0` (cats keep 33%) |
| An action's `xf` delta | `:2311`, `:2326` | Slash −1→−2 alone reaches `0v1` in 4 rounds. Lasers −3→−2 alone reaches `0v1` in 9 rounds |
| Unit counts | `:2308`, `:2321` | Confounded with the AP cap; changing them alone does nothing below ap 12 |
| `REFERENCE.beats` | `:2419` | Not a number, but the third relationship is the only lever that costs the Mechs |

**Full sweep, cats AP × mechs AP on otherwise-shipped stats** (cell = `catsAlive v mechsAlive / rounds`; contested cells in **bold**):

```
 cats\mechs      1          2          3          4          5          6
   1          0v2/9r     0v3/5r     0v3/3r     0v3/3r     0v3/3r     0v3/3r
   2          0v2/9r     0v2/5r     0v3/3r     0v3/3r     0v3/3r     0v3/3r
   3        **0v1/9r**   0v2/5r     0v2/3r  <- SHIPPED     0v2/3r     0v2/3r
   4        **2v0/7r**   0v2/5r     0v2/3r     0v2/3r     0v2/3r     0v2/3r
   5        **3v0/6r** **0v1/5r**   0v2/4r     0v2/4r     0v2/4r     0v2/4r
   6          4v0/5r   **0v1/5r**   0v2/4r     0v2/4r     0v2/4r     0v2/4r
   7          5v0/4r   **0v1/6r**   0v2/4r     0v2/4r     0v2/4r     0v2/4r
   8          5v0/4r   **0v1/6r** **0v1/4r** **0v1/4r** **0v1/4r** **0v1/4r**
   9          5v0/4r   **0v0/6r** **0v1/5r** **0v1/5r** **0v1/5r** **0v1/5r**
  12          5v0/4r   **0v0/6r** **0v1/5r** **0v1/5r** **0v1/5r** **0v1/5r**
```

**Recommended starting retune, to be confirmed by a person actually playing it:** `DEFAULTS.cats.ap: 3 → 9`, everything else unchanged. It is a **one-line, one-number edit** to the single object the file already nominates; it produces `0v1` in 5 rounds (33% force, at the criterion); it leaves the two eHP totals at 27 apiece so the projection still reads as an even matchup on paper and the fight still contradicts it; and it makes the "action points are a team resource" lesson **legible** rather than invisible, because nine cats with nine points is the first configuration in which having nine cats means anything.

Two honest caveats on that recommendation, both `[MEDIUM confidence]`:
- The simulation plays **optimally** — best damage-per-AP action, perfect focus fire, no wasted uses. A student playing hot-seat will not, and suboptimal play generally lengthens fights and widens variance. It does not rescue a 67%-intact blowout, but it does mean the retuned board could land at 0/9 vs 2/3 in a real session that the sim called 0/9 vs 1/3.
- The simulation applies **no counters and no effects**, which is the whole of the students' contribution. Since both shipped relationships favour the Mechs, real play should sit **worse for the Cats** than the sim, which argues for retuning slightly past the criterion rather than exactly to it — e.g. `cats.ap 9` **and** `mechs.ap 2`, which the sweep puts at `0v0`.

#### What plan 05-03 must record

It is a **scheduled human activity and a gate**, not a review step. The plan should require, as artifacts:

- Two complete played fights of the shipped default, hot-seat, adjudicating relationships and effects as a student would.
- Per fight: rounds elapsed; units standing per side; eHP standing per side; **the percentage figure the criterion is judged on**; and which rulings were made and how they were recorded.
- If it blows out: the `DEFAULTS` edit applied, as a diff of the numbers, and the replay result.
- The final numbers written back into `DEFAULTS`' own comment at `:2285-2287`, which currently reads *"A starting point, not a conclusion"* and should end the phase reading as a conclusion with a date.
- **A note that the pre-phase prediction was wrong and in which direction**, so `.planning/research/PITFALLS.md` § Pitfall 10 and `SUMMARY.md` can be corrected at the transition rather than continuing to warn about the opposite failure.

---

## The Vocabulary Gate — pre-screened copy for fight and ledger surfaces

This section is the Phase-5 equivalent of `04-PATTERNS.md` § Rule 0.3. **Every word below was run against the live word lists extracted from `tests/selftest-node.cjs` this session** — not against a transcription of them. `[VERIFIED: measured against the live regexes]`

The gate has three layers plus the sink scan:

| Layer | Reads | List | Size |
|---|---|---|---|
| **FORBIDDEN** | the whole document | 14 sink patterns | `:32-46` |
| **A** | the whole document — markup, CSS, **comments**, identifiers, class names, `[S09]` test labels | `VERDICT_WORDS` | 16 |
| **B** | every quoted or backticked **string literal** in the script block | `VERDICT_LITERAL_WORDS` | 23 |
| **C** | the **rendered** text, aria-label, title and placeholder of every leaf under `#app` and each dialog root | `A.concat(B)` | 39 |

> Note the reach of Layer A: it reads comments, CSS and identifiers. A JS variable named `counter`, a CSS class `.balance-row`, or a comment containing the word `generating` fails the build. `[S09]` suite labels are string literals inside the artifact and are therefore Layer A **and** Layer B material — the brief is right that test labels are in scope, for in-file labels. `tests/selftest-node.cjs`'s own check labels are **not** scanned (Layer A reads `cats-vs-mechs.html` only), but writing verdict language there would be a policy failure even where it is not a mechanical one.

### Banned in the WHOLE DOCUMENT (Layer A) — comments, CSS, identifiers, test labels included

| Spelling | Trips | Fight-loop temptation it kills |
|---|---|---|
| `winner`, `winnerOf` | `winner` | — |
| `loser`, `loserOf` | `loser` | — |
| `counter`, `counters`, `countered`, `counter map`, `roundCounter`, `turnCounter`, `apCounter`, `encounter` | `counter` | **The biggest one.** REF-01's own subject cannot be called what it is called, and a loop variable named `counter` fails the build |
| `balance`, `balanced`, `rebalance`, `imbalance`, `balanceRow` | `balanc` | The playtest's own vocabulary |
| `difficulty`, `difficultyOf` | `difficult` | — |
| `rating`, `generating`, `operating`, `separating`, `iterating`, `decorating`, `integrating`, `migrating`, `narrating` | `rating` | **`iterating`** is the new one for this phase — a comment about iterating the declarations fails |
| `outmatch`, `outclass`, `overpowered`, `underpowered`, `unfair`, `traffic light`, `good build`, `bad build`, `should aim` | own stems | — |

**Substitutions, all measured clean:** for the relationship table use **`what beats what`**, **`the relationship map`**, **`beats`** — the artifact already does exactly this and `REFERENCE.beats` is the shipped spelling. For a loop, **`scan every … and take the largest`** is the file's own established idiom (`nextUnitId`, `nextTokenTypeId`). For "iterating", write **`walking`** or **`reading each`**. For "generating", write **`producing`**, **`writing`** or **`building`** (04-PATTERNS' existing prescription).

### Banned in any STRING LITERAL and in rendered copy (Layer B + C)

`wins` · `win` · `better` · `worse` · `stronger` · `weak` (stem — catches `weaker`, `weakest`, `weaken`) · `advantage` · `edge` (whole word — catches `edge case`) · `lead` (whole word) · `ahead` · `dominat` (stem) · `score` (catches `underscore`, `scoreboard`) · `grade` (catches `upgrade`, `downgrade`, `degraded`) · `rank` (catches `frank`) · `judgement` · `judgment` · `favoured`/`favored` · `fair` (whole word) · `superior` · `inferior` · `optimal` · `strongest` · `weakest`

These **may** appear in comments. They may **never** appear in a string literal, which in this file means they may never appear in anything a student can read, and also never in an `[S09]` test label.

### Measured clean on all three layers — the safe fight and ledger vocabulary

**The loop:** `Advance` · `Advance the round` · `round` · `Round 1` · `this round` · `previous round` · `next round` · `declare` · `declaration` · `declared` · `undeclared` · `nothing declared yet` · `Declared actions` · `performer` · `the unit acting` · `acting unit` · `the unit acted on` · `points at` · `aimed at` · `resolve` · `resolved` · `resolution` · `lands` · `landed` · `applied` · `spent` · `spend` · `spending` · `simultaneously` · `at once` · `both sides` · `each side` · `together` · `hot seat`

**The ledger:** `history` · `ledger` · `the rounds so far` · `earlier rounds` · `past rounds` · `previous board` · `what changed` · `change` · `changed` · `moved` · `shifted` · `delta` · `difference` · `since the previous round` · `stack` · `stacks upward` · `earlier` · `later` · `order` · `sequence` · `chronological` · `log` · `record` · `recorded` · `entry` · `entries` · `line` · `readable order`

**The split (FIGHT-16):** `damage` · `took` · `takes` · `absorbed` · `soaked` · `shield first` · `through the shield` · `to health` · `split` · `health` · `shield` · `overkill` · `wasted` · `thrown away` · `excess` · `remainder` · `spare`

**The pool (FIGHT-03/09):** `action points` · `action point pool` · `remaining` · `left` · `available` · `used` · `unspent` · `refill` · `refilled` · `restored` · `pool` · `carry over` · `carried`

**Life and death (FIGHT-05/06):** `dead` · `died` · `at zero` · `zero health` · `marked dead` · `toggled alive` · `alive` · `standing` · `still standing` · `no longer standing` · `survived` · `survivor` · `survivors` · `active` · `inactive` · `no longer on the board` · `removed from play`

**Rulings (FIGHT-07/08):** `override` · `overridden` · `set by hand` · `adjusted by hand` · `by hand` · `manual` · `hand-set` · `a ruling` · `ruling` · `the table ruled` · `adjudicate` · `adjudication` · `you rule`
*(`override` is clean on the word lists but is a banned **state key** — see § Q6.)*

**Fight lifecycle (FIGHT-01, SHARE-07):** `start the fight` · `end the fight` · `reset the fight` · `start over` · `fight` · `the fight` · `in progress` · `the fight ended` · `final round` · `wipe` · `wiped` · `cleared` · `emptied` · `force` · `roster` · `remaining force` · `one side has no units left` · `both sides still have units` · `nothing left to act with`

**Build edits (FIGHT-10):** `build edit` · `edits the build` · `applies to the build` · `not to this fight` · `from the next fight`

### The dangerous middle — mechanically clean, but out of scope in spirit

These pass all three layers and **must still not ship**: `won` · `lose` · `defeat` · `defeated` · `beat` · `beaten` · `victory` · `victorious` · `contested` · `one-sided` · `blowout` · `lopsided` · `even` · `close` · `tight` · `behind` · `dominant`.

The gate is a floor, not a ceiling. `defeated` and `victory` are exactly the words PROJECT.md's "difficulty verdict badge" entry exists to keep off the page, and `contested`/`even`/`close` are balance judgements wearing a neutral coat. Two mechanical gaps were already recorded by the previous phase and re-confirmed here — `/\blead\b/` misses `leads`, `/dominat/` misses `dominant` — and two more were found this session: **camelCase evades every word-boundary rule**, so `winsBy`, `leadBy` and `edgeOf` all pass Layer B. **Reported, not exploited.** If the plan wants to close them, widening a word list is a change that must be measured for false positives against the existing 1.01 MB of prose first, and the file's own history paragraph on floors is the pattern for recording it.

### Also: the round is not a "Day"

The developer explicitly rejected it. `day` and `Day` are both mechanically clean, which is precisely why this needs to be a written rule rather than a gate.

---

## Architecture Patterns

### Where the ledger goes in the DOM

The shell, as it stands (`:1117-1122`):

```
<main id="app">
  <div id="topbar"> … </div>
  <div class="board" id="board">
    <section id="col-cats"></section>          <- structure() replaces this interior
    <aside  id="strip"></aside>                <- [S06.3], static, never rebuilt
    <section id="col-mechs"></section>         <- structure() replaces this interior
    <section id="refband"></section>           <- [S06.4], static, never rebuilt
    <p id="board-empty"></p>
  </div>
  <section id="selftest-report"></section>
</main>
```

`structure()` calls `withPreservedFocus(board, …)` (`:7123`), so **`#board` is the focus-restore scope**, and `keyed(container, k)` is `container.querySelector('[data-k="…"]')` — first match wins (`:6562`).

**Measured hazard.** Five cloned boards inserted **inside `#board`, above the columns**: the first `[data-k]` match scoped to `#board` is a **dead ledger node** (`firstScopedMatchIsInLedger: true`). Focus restore after any structural rebuild lands on a clone. The same five clones as a **sibling of `#board`**: `matchesScopedToBoard: 1`, first match is live — safe in implementation, though `matchesDocumentWide: 6` still violates the uniqueness contract `[S06.1]`'s own comments state three separate times.

**Prescription, belt and braces:**
1. Put the ledger **outside `#board`**, as a static sibling under `#app`, built once and flagged in the manner `#strip` and `#refband` already use.
2. Give ledger rows **no `data-k` and no `data-act` at all**. They are a reading, not a control. This is the same rule `refCard` already keeps, and check 63b already asserts it for reference cards — *"no reference card ON THE PAGE … carries an attribute the interaction layer dispatches on or the sync pass writes"*. A parallel check for ledger rows is the cheap version of this whole section.
3. The roadmap says past boards *stack upward*. Keep the live board where the student left it and put the newest ledger row directly above it — either by prepending into a region that sits before `#board`, or by CSS `order` / `column-reverse` on a region that appends. Prepending grows the page downward from the top and pushes the live board off screen, which is the failure this needs to avoid on a projector.

### The four extension seams — attach, do not edit

`[S07]`'s banner (`:9721-9723`): *"A plan adding a dialog, a reference card or a fight control writes into `UI_ACTS` / `UI_HANDLERS` / `HOLD_ACTS` / `LATE_BINDERS` from its own `[S07.N]` sub-region and edits no line of `[S07.1]`."* Plans 02-03, 03.1-05 and 04-06 each did exactly this and each recorded "changed NOT ONE LINE of `[S07.1]`".

The **partition** matters and is asserted by check 90b, which reads it off the page:

| Kind | Goes in | Phase 5 examples |
|---|---|---|
| Page work | `UI_ACTS` + `UI_HANDLERS`, handled here, **never dispatched** | picking which action a declaration names; showing/hiding a declaration row; scrolling the ledger |
| State work | a real `[S05]` op, dispatched, **deliberately absent from `UI_ACTS`** | `advanceRound`, `declareAction`, `clearDeclaration`, `resetFight`, `setFightShield` |

`UI_ACTS`' own comment names *"Phase 5's fight controls"* by name as an arrival it was built for (`:9745`). **No fight op may be parked in `UI_ACTS`** — that is, in the file's own words, "exactly how a refusal is made to stop being raised".

### The topbar reservation is nearly spent

`:1069-1073`: *"The cluster's remaining reservation is Phase 5's turn state and start-fight, and after those two the reservation is spent."* And D-05's rule, restated three times in that markup: **it must not become one-per-anything** — no control per action, per side or per round.

So: **Start fight** may be a topbar button, and a round/pool **readout** may be the second reservation. The **declaration surface and Advance do not fit there** and must not be forced in. The todo asks for "a simple input at the top where you click actions to set the actions/moves for the current round" — read that as *at the top of the page*, not *in the topbar cluster*, and give it its own static region between `#topbar` and the ledger. Note also that `[S08]` measures the bar's height into a published custom property precisely because *"the markup comment above it plans for Phase 4 and Phase 5 to add more controls"* and the sticky `#strip` offset would otherwise break (`:12869-12885`) — so adding to the bar has a measured second-order cost.

### Reuse, do not re-derive

- The declaration's action list is the same list `[S06.5]` already renders in the editor and the same one `bestPair` already walks. Read `state.build[side].actions`.
- Affordability is `App.model.affordability(faction, action)` — already ACT-06 as numbers and token ids, and already carrying its **never-disable** rule in its own comment.
- The unit choosers are 03.1-07's `unitPick` / `fillPicks` shape: target chooser lists **every** unit on the board, performer chooser lists the acting side's.
- Every rendered sentence is built **one node per fragment** so Layer C reads the artifact's words and skips the student's (`[data-anm]`, `[data-lbl]` exemption channels).

### Anti-patterns

- **A pub/sub or event-bus layer for round events.** CLAUDE.md rules it out and the file has no precedent for one. Advance calls into the ops layer directly.
- **A second source of truth for "what happened".** If both `fight.log` and `fight.past` exist and both are written, they will disagree. Pick one. The roadmap's language ("a ledger … not a log panel") is about presentation; FIGHT-08's requirement is about the record. **`past[i].did` + `past[i].hand` is a combat log** — it records each round's actions and every override, in readable order, and it is the same object the ledger renders. Folding `log` into `past` is the honest answer and it deletes a field with no writer rather than giving one to a field with no consumer.
- **Storing "what changed since last round".** Derive it in `[S06]` from `past[last].was` versus the live side.
- **Advance as two commits.** `commitStructural` already calls `commit` then `invalidate({structural:true})`; one call, one undo entry.
- **Reusing the reset confirmation for the fight reset.** D-17's test is narrow and written down: *"does undo stop being able to recover this while the student is still working?"* A fight reset leaves the build intact and one Ctrl+Z away; it does not meet the test.

---

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---|---|---|---|
| Clamping a fight value | a fresh `Math.max(0, Math.min(...))` | `int(value, 0, MAX_ALLOC, what)` (`:4545`) | It tests type **before** arithmetic, so `null`, `''`, `'7'` and `[5]` fail loudly instead of laundering into 0 mid-fight |
| Validating a side name | `state.fight[side]` directly | `requireSide(side)` (`:4600`) outside the commit | `fight['__proto__']` resolves on `Object.prototype`, which is not frozen |
| Finding a unit | `units[i]` or `.find()` inline | `findUnit(side, unitId, collection)` (`:4870`) | Throws in the file's own message style rather than reading undefined |
| "Is there a fight?" | `state.fight && state.fight.round` | `fightOf(s)` (`:4890`) | One spelling; mode is derived, never stored |
| Which tokens count as damage | testing `tok === 'hp'` | `App.model.DAMAGE_KEYS` (`:2542`) | Frozen, exported, and its comment carries the D-05c shield reading and both measured outcomes |
| A round or unit id sequence | a variable named `counter` | *"scan every id already in use, take the largest suffix and add one"* — `nextUnitId` (`:5053`) | `counter` fails Layer A **and** the collision bug is real: `prefix + (length+1)` duplicates after any removal |
| Deep-copying the board for a ledger row | a hand-written recursive clone | `JSON.parse(JSON.stringify(x))` — the file's own idiom in `thaw` (`:2923`) and `defaults()` (`:2436`) | Doubles as enforcement of the JSON-clonable rule |
| Structural invalidation | `App.state.commit` then hoping | `commitStructural(label, mutator)` (`:5040`) | The reason `resetToDefaults` needed it is written out at `:5170-5178` and it is the bug this phase is most likely to repeat |
| Affordability arithmetic | recomputing cost vs pool | `App.model.affordability` (`:2699`) | Already ACT-06, already carries the never-disable rule |
| Survivor and spent-AP figures | counting inline | `aliveCount` (`:2733`), `apSpent` (`:2742`) | `apSpent` is floored *in the derivation*, and its comment says why a caller repairing it afterwards would be a second definition |
| A dead-unit visual | inventing a marker | `DEFAULTS.tokens.dead` (`:2362-2368`) | It ships as vocabulary with no consumer, explicitly to prove the renderer can already draw this phase's marker |

**Key insight:** this artifact's helpers each carry a paragraph explaining a bug that was actually hit. Re-implementing one is re-hitting it.

---

## Common Pitfalls

### 1. Two Advance presses become one Ctrl+Z
**What goes wrong:** the student presses Advance twice quickly; one undo rewinds both rounds.
**Why:** `commit()` coalesces same-label commits inside `COALESCE_MS` (500 ms), and the window *slides* on each repeat (`:2952-2959`).
**Avoid:** put the round number in the label — `'advance to round ' + n`.
**Measured:** same label twice → 1 undo entry; distinct labels → 2.

### 2. The ledger steals focus restore
**What goes wrong:** after any structural rebuild, focus lands on a dead ledger node instead of the control the student was using.
**Why:** `keyed()` takes the first `[data-k]` match scoped to `#board`.
**Avoid:** ledger outside `#board`, and no `data-k` on ledger rows at all.
**Measured:** ledger inside `#board` above the columns → `firstScopedMatchIsInLedger: true`.

### 3. A declaration key reddens a boundary assertion nobody remembers writing
**What goes wrong:** the natural spelling `{ caster, target }` fails `[S09.10]` row 2, which walks the whole state at every depth.
**Avoid:** `by` / `at`. **Measured** both spellings.

### 4. Advance auto-kills at zero health
**What goes wrong:** the split arithmetic writes `alive = false` when `hp` hits 0, and a student's Shield ruling becomes unrepresentable.
**Why it happens:** it is the obvious next line.
**Avoid:** `applyHit` writes `shield` and `hp` and nothing else. `setUnitHp`'s comment (`:5104-5106`) and `aliveCount`'s (`:2731`) both state the rule; a self-test row driving a unit to zero and asserting `alive === true` is the cheap enforcement.

### 5. `resetFight` costs two undo entries
**What goes wrong:** `endFight()` then `startFight()` — two commits, two Ctrl+Z presses to get back.
**Also:** `startFight` **throws** if a fight is already running (`:5144-5152`), so the order is forced and a mis-ordered pair raises the error panel.
**Avoid:** one op, one commit, doing both. **Measured:** `undoEntriesConsumed: 2`.

### 6. The projection silently starts describing a different board
**What goes wrong:** `[S06.3]` calls `turnsToWipe(state.build[side], state.build[foe])` (`:8182`) with no third argument. Once a fight runs, the strip keeps describing the **allocation** while the board shows the **fight**. Whether that is a bug or the point is a real decision — see § Open Questions — but shipping it undecided means it is a bug.

### 7. Layer A eats an ordinary comment
**What goes wrong:** the build goes red on a sentence, not on code. `iterating the declarations` (→ `rating`), `a loop counter` (→ `counter`), `keeps the sides balanced` (→ `balanc`).
**Avoid:** the substitution list in § The Vocabulary Gate. **Warning sign:** the failure message talks about rendered copy for something that is not rendered copy — 04-PATTERNS records paying this toll once already.

### 8. A comment about the relationship table fails the relationship table's own gate
**What goes wrong:** writing "the counter map" in the comment that implements REF-03.
**Avoid:** the artifact's own spelling — `beats`, `what beats what`.

### 9. The ledger in state inflates every undo snapshot
**What goes wrong:** `commit()` snapshots `JSON.stringify({build, fight})` on **every** commit, so each of 30 undo entries carries the whole ledger.
**Measured:** fight slice 613 B at 0 ledger rounds → 21,243 B at 30 → 35,003 B at 50. Per-commit cost 0.063 ms → 0.315 ms → 0.485 ms. Thirty undo entries of a 30-round ledger is roughly **640 KB of snapshot strings**.
**Read honestly:** this is affordable and is **not** a reason to move the ledger out of state — undo has to be able to take an Advance back, and only state can do that. It *is* a reason to cap the ledger, and a reason to watch the dev-side perf gate (`PERF_BUDGET_MS = 50` for 100 commits, `:451`), which today reads 7 ms with no fight running.

### 10. The playtest is treated as a review step
**What goes wrong:** the phase is marked complete on a code review, and the shipped default teaches the inverse lesson.
**Why:** it is the only criterion in the project that no gate can assert.
**Avoid:** plan 05-03 is a gate with recorded artifacts. See § Q7.

### 11. Reading `DEFAULTS` and `REFERENCE` as one object
**What goes wrong:** the retune adds a key to `DEFAULTS` for a relationship, and `[S09.9]`'s row asserting `defaults()` never gained a key goes red — or worse, the key travels in every build code.
**Why:** `REFERENCE` sits **outside** `DEFAULTS` on purpose (`:2374-2418`), because `defaults()` is deep-copied into `state.build` and encoded.

---

## Code Examples

All patterns below are lifted from the artifact, not invented.

### The op shape — guards outside the commit, one commit per op

```js
// Source: cats-vs-mechs.html:4926-4933, the rule stated at :4927
// "requireSide runs OUTSIDE the commit call in every op below, so an unknown
//  side throws before the funnel is entered and leaves no phantom undo step."
function setFactionAp(side, ap) {
  requireSide(side);
  App.state.commit('ap ' + side, function (s) {
    s.build[side].ap = int(ap, 0, MAX_ALLOC, 'action points');
  });
}
```

### A guard that must run inside the mutator, because it reads state

```js
// Source: cats-vs-mechs.html:5144-5157
// "The check sits inside the mutator, which runs on the detached copy before
//  anything is recorded, so the throw leaves no phantom undo step."
function startFight() {
  commitStructural('start fight', function (s) {
    if (s.fight !== null) {
      throw new Error('A fight is already in progress — end it before starting a new one');
    }
    s.fight = { round: 1, turn: 'cats', log: [],
                cats: sideFromBuild(s.build.cats), mechs: sideFromBuild(s.build.mechs) };
  });
}
```

### The fight slice is derived from build once, and never again

```js
// Source: cats-vs-mechs.html:4917-4924
function sideFromBuild(faction) {
  return {
    ap: faction.ap,
    units: faction.units.map(function (u) {
      return { id: u.id, hp: u.maxHp, shield: u.shield, alive: true };
    })
  };
}
```

### Building nodes — no markup sink anywhere

```js
// Source: cats-vs-mechs.html:6544-6553
// "Every string reaches the page through textContent and every node through
//  createElement: there is no markup-parsing sink anywhere in this file,
//  and the dev gate enforces that document-wide."
function el(tag, cls) { var n = document.createElement(tag); if (cls) { n.className = cls; } return n; }
function text(tag, cls, s) { var n = el(tag, cls); n.textContent = s; return n; }
```

### Attaching to the seams without editing `[S07.1]`

```js
// Source: the shape plans 02-03, 03.1-05 and 04-06 each used; seams at
// cats-vs-mechs.html:9752 (UI_ACTS), :9764 (UI_HANDLERS), :9785 (LATE_BINDERS)
UI_ACTS.push('showDeclarationFor');            // page work only
UI_HANDLERS.showDeclarationFor = function (btn) { /* … */ };
LATE_BINDERS.push(function () { /* bind the region's delegated root here */ });
// advanceRound is NOT here. It is a real op and is dispatched.
```

### The permanent-line register FIGHT-10's notice should copy

```html
<!-- Source: cats-vs-mechs.html:1711-1718, the reset dialog's own line —
     "a plain statement of consequence with no colour and no alarm" -->
<p class="rs-says" id="reset-ask-says">This puts both rosters, both action lists
  and every token type back to the Workshop 16 defaults. One Ctrl+Z brings your
  board back — but only for the next thirty changes, after which it is gone.</p>
```

---

## State of the Art

| Old reading | Current reading | When it changed | What it means for this phase |
|---|---|---|---|
| FIGHT-02: "advance and rewind turn and round", alternating turns | **Simultaneous declaration for both sides, one Advance** | Developer, 2026-08-28, ROADMAP.md THE ROUND LOOP | `fight.turn` ships from Phase 1 and now encodes a superseded model. Remove or repurpose it deliberately |
| The history is a combat log panel | **A ledger of past board states accumulating on screen** | Same | `fight.log` (empty, no writer) should fold into `past` |
| ACT-05 is half-delivered and its other half is unspecified | **Its other half is the Advance path and it is FIGHT-12..16** | 03.1-07, and `[S09.10]` row 3 asserts it | Rows 1 and 3 must be rewritten, not deleted |
| Pitfall 10: the swarm blows out the elites (Lanchester square law) | **Measured: the elites blow out the swarm, because the shared AP pool caps swarm throughput** | Measured this session | Plan 05-03 retunes in the opposite direction from the one predicted; `.planning/research/PITFALLS.md` and `SUMMARY.md` need correcting at the transition |
| CLAUDE.md: region re-render with `innerHTML`, benchmarked 0.79–23 ms | **`innerHTML` is FORBIDDEN; the file uses two-tier `structure()` / `sync()`** | Phase 1 | Those benchmark numbers do not apply. The measured replacements are in § Measurements |

**Deprecated / superseded in the artifact:**
- `fight.turn` — no writer, encodes alternating turns.
- `fight.log` — ships as `[]` with no writer and no consumer.
- `fight[side].units[].shield` — has a copy and **still no writer**; `:4951` names the op it needs as `setFightShield` and the plan as 05-01.

---

## Measurements

All taken this session. Browser measurements: Chrome 151 via Playwright 1.62.1 `channel: 'chrome'`, Windows 11, `file://`, 1920×1080. Sandbox measurements: Node v24.15.0, `vm.runInNewContext` over the artifact's single script body, the same technique `tests/selftest-node.cjs` uses.

| Measurement | Value |
|---|---|
| `#board` nodes, shipped 9v3, setup | 442 |
| `#board` nodes, shipped 9v3, fight running | 427 |
| `[data-k]` nodes inside `#board` | 78 |
| `App.render.sync()` | **0.17 ms** |
| `App.render.structure()` | **2.24 ms** |
| `sync()` with a 50-round full-board ledger on the page | **0.154 ms** (does not move) |
| `sync()` with a 100-round compact ledger | **0.172 ms** (does not move) |
| Marginal cost of one more full-board ledger row | **1.9–2.1 ms, flat from round 1 to round 60** |
| Nodes at 60 ledger rounds | 26,132 |
| Nodes per ledger row: full clone / compact text / token squares | 300 / 66 / 67 |
| 24v24 board: `#board` nodes, `sync()`, `structure()` | 1,558 / 0.535 ms / 7.92 ms |
| 24v24 with a 30-round ledger: nodes, `sync()` | 29,846 / 0.57 ms |
| `commit()` cost vs fight-slice size, 0 / 10 / 30 / 50 ledger rounds | 0.063 / 0.150 / 0.315 / 0.485 ms |
| Fight slice bytes, 0 / 30 / 50 ledger rounds | 613 / 21,243 / 35,003 |
| Build slice bytes, shipped board | 1,780 |
| Build code, shipped board | 45 chars (`v1~N~V~A9~3~9*3!0~9*~~~~B3~3~3*6!3~3*~~~~7tvo`) |
| Undo entries for naive `endFight()` + `startFight()` | **2** |
| Undo steps from mid-fight to `fight === null` | 1 |
| Same-label commits inside 500 ms → undo entries | **1** |
| Distinct-label commits → undo entries | **2** |
| `data-k` first match, ledger inside `#board` above the columns | **a dead ledger node** |
| `data-k` first match, ledger as a sibling of `#board` | the live board |
| Shipped 9v3 played out | 3 rounds, cats 0/9, mechs 2/3 — **67% force intact** |
| Same, resolution order varied (cats-first / mechs-first / simultaneous) | identical in all three |
| 3 / 6 / 9 cats at ap 3 vs 3 mechs | identical in all three |
| Current gate readings | 1051 in-file assertions, 146 interaction checks, 5,582 string literals, 96 shell ids, 127 rendered strings from `#app`, 145 from 4 dialog roots, perf 7 ms / 50 ms budget |

Scratchpad (probe sources, not part of the repo):
`C:\Users\alexy\AppData\Local\Temp\claude\C--Projects-GameDesignSkills-GameFeelDirectionCourse-CatsVsMech\6955a1c2-1679-4a99-be89-fd3975b5abb0\scratchpad\` — `probe1.cjs`, `measure.cjs`, `measure2.cjs`, `measure3.cjs`, `measure4.cjs`, `sim.cjs`, `sim2.cjs`, `vocab.cjs`, `vocab2.cjs`.

---

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|---|---|---|
| A1 | The AP pool refills each round | Q4, Q7 | **High.** `App.model.bestPair` computes per-turn throughput from `faction.ap` and `turnsToWipe` multiplies it across turns, so the projection already assumes a refill. A non-refilling pool makes the projection mechanically wrong — measured: with no refill the shipped fight never resolves (60-round cap, cats 6/9, mechs 3/3). But no comment in the artifact states the refill, so it is inference from the derivation, not a written decision. **The plan must make it an explicit, commented ruling.** |
| A2 | Advance may apply an action's own `xf` terms | Q3 | Medium. Grounded in 03.1-07-SUMMARY's verbatim "it is spent on Advance, in Phase 5" and `[S09.10]` row 3's framing, but the developer's round-loop note does not say the word `xf`. If wrong, Advance spends cost only and every effect is hand-recorded |
| A3 | The ledger and the combat log are one object | Q2, Anti-patterns | Low. FIGHT-08 and FIGHT-14 could be read as two surfaces. Folding them is a recommendation, not a requirement |
| A4 | `min(floor(ap/cost), aliveUnits)` is the fight's throughput rule, not only the projection's | Q7 | **Medium-high.** It is `bestPair`'s rule and the projection's; whether Advance enforces it is a Phase 5 decision. If Advance lets a student declare more uses than the pool affords, the whole sweep in Q7 shifts. The AP pool caps throughput either way, so the direction of the finding holds |
| A5 | Optimal focus fire is a fair proxy for hot-seat play | Q7 | Medium. Suboptimal play lengthens fights; it does not close a 67%-intact gap. Named as a caveat on the retune |
| A6 | 30 rounds is a sensible ledger cap | Q2 | Low. Chosen for readability and to match `UNDO_LIMIT`; the measurement supports far more |
| A7 | `location.hash` mirroring on a fight commit is harmless | Q5 | Low. The mirror reads `state.build` and checks 75/75b/89 already cover it |

---

## Open Questions

1. **During a fight, does the projection describe the allocation or the fight?**
   - **Known:** `turnsToWipe(attacker, target, activeUnits)` takes a third argument that no caller passes, added *"so Phase 5 can project a fight in progress"* (`:2797-2799`). `[S06.3]` reads `state.build` only (`:8182`). `aliveCount` and `apSpent` both exist and both take a fight side.
   - **Unclear:** PROJ-05 says the projection stays *visible*; it does not say it recomputes.
   - **Recommendation:** keep the strip reading `build`, and add the live fight figures as a **separate, adjacent** reading. The projection is a statement about the *allocation the student made*, and the whole pedagogy is that the fight contradicts it — a strip that silently tracks the fight has nothing left to be contradicted. Whichever is chosen, it is a ruling and belongs in a comment. **The `activeUnits` parameter should be used or explicitly retired**; leaving it unused for a second phase is how a parameter becomes a lie.

2. **What happens when the declared cost exceeds the pool?**
   - Covered in Q3. Three admissible answers; `int()`'s floor and `apSpent`'s comment point at "clamp to 0 and report the shortfall". Must be decided and commented, not defaulted.

3. **Does a student-invented token type's tally become spendable during a fight?**
   - `sideFromBuild` deliberately does not copy `tally` and says so at length (`:4908-4916`): *"Whether a tally should be spendable DURING a fight is a fight-semantics ruling, and Phase 5 owns it."* This phase owes an answer. **Recommendation: no** — a tally is a free annotation the student increments by hand (ALLOC-11, D-00e), and making it spendable turns an annotation into a mechanic the tool would then have to interpret.

4. **Does the fight surface need its own `<dialog>`, or is it in-page?**
   - The roadmap and the todo both put it at the top of the page, in view, alongside the board — which argues in-page. But every prior surface in this file is a dialog, and the id budget, `DIALOG_ROOTS` and `KNOWN_IDS` all key on that pattern. An in-page region is a **new** shape for this file and the plan should say so in the register `clampTokenName` and the reset confirmation both use for a no-precedent technique.

5. **How does the fight end?** `[LOW confidence — no requirement covers it]`
   - No FIGHT requirement says what happens when one side has no living units. The tool must not announce an outcome (PROJECT.md, and the whole vocabulary section). The safest reading is that **nothing happens**: Advance keeps working, the ledger keeps accumulating, and the student stops when they decide the fight is over. Flagged as low-confidence because it is an absence in the requirements rather than a decision anyone recorded, and it is exactly the sort of gap where a helpful "Cats win!" gets added.

6. **Is `fight.turn` removed or repurposed?**
   - It ships in the slice from Phase 1 and encodes the superseded alternating-turn model. Removing a key from the slice touches `[S03]`'s banner, `[S09.3]`'s key-set rows and `startFight`. Cheap now, awkward later.

---

## Environment Availability

| Dependency | Required by | Available | Version | Fallback |
|---|---|---|---|---|
| Node.js | `tests/selftest-node.cjs` | ✓ | v24.15.0 | — |
| Google Chrome (real, not bundled) | browser rehearsal, `file://` fidelity | ✓ | 151, at `C:\Program Files\Google\Chrome\Application\chrome.exe` | — |
| Playwright | optional dev-only smoke test | ✓ (scratchpad only) | 1.62.1 | Manual double-click rehearsal |
| npm registry | installing Playwright | ✓ | — | — |
| Runtime dependencies for the artifact | — | **none, by hard constraint** | — | — |

**Missing with no fallback:** none.

**Notes for the plan:** the Node stub DOM's `location` is `{ hash: '' }` with no `history` and no `reload` (04-PATTERNS § 0.4), and `App.state.flush()` is the synchronous frame the gate drives. Any new shell id must be added to `KNOWN_IDS` **and** given a stub node, or the bidirectional stub-drift gate fails in one direction or the other (`:1369-1399`); it currently reads 96 shell ids. Any new dialog root must be added to `DIALOG_ROOTS`, also bidirectionally gated.

---

## Security Domain

`security_enforcement` is absent from `.planning/config.json`, so it is treated as enabled. The applicable surface is small and mostly already closed.

| ASVS category | Applies | Control in place |
|---|---|---|
| V1 Architecture | yes | Single file, no network, no server, no storage that is load-bearing |
| V2 Authentication | **no** | No accounts, no backend (PROJECT.md Out of Scope) |
| V3 Session Management | **no** | No sessions |
| V4 Access Control | **no** | No multi-user surface |
| V5 Input Validation | **yes** | Every value crosses `int()` (`:4545`) and every key crosses `requireSide` / `requireTokenId` / `requireActionId`. The prototype-pollution guards at `:4637-4700` are the file's stated security-sensitive boundary. **A declaration carries a side, an action id and two unit ids — all four are caller-supplied key/id positions and all four must pass an existing guard, not a new inline check** |
| V6 Cryptography | n/a | FNV-1a is a checksum, and `[S04]`'s banner states in as many words that it is **not** a security boundary |
| V7 Error Handling | yes | `App.boot.wrap` and the styled error boundary (UX-03) |
| V14 Configuration | yes | The `FORBIDDEN` scan is the mechanical control |

| Threat pattern | STRIDE | Mitigation already present |
|---|---|---|
| Prototype pollution via a caller-supplied key (`__proto__`, `constructor`) | Tampering | `requireTokenId` / `requireSide` allowlists; `[S09.7]` holds one row per key **per write shape** |
| Arbitrary code from a pasted build code | Elevation | No `eval`, no `Function`; checks 70 and 70b assert it by driving |
| Markup injection from a student-typed name | Tampering | No markup sink exists; `textContent` only, enforced document-wide |
| Silent data corruption from a truncated share code | Tampering | Version prefix + FNV-1a checksum + content guards behind it |

**One new consideration for this phase:** `fight` is never encoded, so a pasted build code cannot carry a fight. The plan must keep it that way — adding the fight to the codec would put attacker-controlled unit ids, action ids and round records one paste away from `advanceRound`'s write path. `[S04]`'s banner is the place that decision is recorded if anyone ever wants to revisit it.

---

## Sources

### Primary — HIGH confidence

- **Direct measurement, Chrome 151 from `file://` via Playwright 1.62.1 `channel: 'chrome'`** — ledger render cost across three designs, `sync()` / `structure()` baselines and with-ledger readings, node counts, the `data-k` direction hazard in both DOM orders, `commit()` cost against fight-slice size, undo-entry accounting for `resetFight`, coalescing behaviour.
- **Direct execution in a Node `vm` sandbox over the artifact's own script body** — the fight slice shape after `startFight`, the build code for the shipped board, the `[S09.10]` row-2 key walk against candidate declaration shapes, the row-1/row-3 op-name regexes against candidate op names, the played-out simulation and the retune sweep.
- **The live word lists, extracted from `tests/selftest-node.cjs` and evaluated** rather than transcribed — `FORBIDDEN` (14), `VERDICT_WORDS` (16), `VERDICT_LITERAL_WORDS` (23), and the Layer C concatenation (39).
- `cats-vs-mechs.html` (19,508 lines) — read directly: `[C00]`, `[C07]`, the shell `:997-1145`, the reset dialog `:1650-1712`, the table of contents `:1726-1773`, `[S01]` `:2160-2483`, `[S02]` `:2540-2846`, `[S03]` `:2846-3174`, `[S04]` banner `:3174-3300`, `[S05]` `:4527-4960` and `:5040-5200` and `:6330-6512`, `[S06]` `:6512-6660` and `:7060-7135`, `[S07]` `:9704-9760` and `:11790-11870`, `[S08]` `:12865-12885`, `[S09.10]` `:17860-17990`.
- `tests/selftest-node.cjs` (7,618 lines) — the header and `FORBIDDEN` `:32-88`, Layer A `:90-206`, Layer B `:214-335`, the sandbox `:336-352`, the perf gate `:440-462`, the stub-drift gate `:1369-1399`, Layer C `:4534-4760`.
- `.planning/ROADMAP.md` § Phase 5 including THE ROUND LOOP; `.planning/REQUIREMENTS.md`; `.planning/PROJECT.md`; `.planning/todos/pending/round-action-input.md`; `./CLAUDE.md`.
- `.planning/phases/03.1-action-authoring-inserted/03.1-02-SUMMARY.md`, `03.1-06-SUMMARY.md`, `03.1-07-SUMMARY.md`; `.planning/phases/04-share-reset/04-PATTERNS.md` § 0.2, § 0.3, § 0.4, § No Analog Found.
- A full clean run of `node tests/selftest-node.cjs` — exit 0, 1051 assertions, 146 interaction checks.

### Secondary — MEDIUM confidence

- `.planning/research/PITFALLS.md` § Pitfall 10 and `.planning/research/SUMMARY.md` — the Lanchester prediction. Cited **as the claim this research corrects**, not as support.
- Lanchester's square law as applied to game design — Adams, *The Designer's Notebook: Kicking Butt by the Numbers* (Game Developer), via the project's own prior research. The law itself is standard; its **applicability here is what this session measured and found to be blocked by the shared AP pool**.
- CLAUDE.md's `file://` capability matrix — inherited from Phase 0 research, independently consistent with everything observed this session.

### Tertiary — LOW confidence, flagged not used

- Nothing in this document rests on an unverified web source. Where a claim could not be settled it is in § Open Questions or § Assumptions Log rather than in a recommendation.

---

## Metadata

**Confidence breakdown:**

| Area | Level | Basis |
|---|---|---|
| Fight slice shape, codec boundary, SHARE-07 | **HIGH** | Driven in a sandbox; the banner and the measurement agree |
| Ledger render cost and the `data-k` hazard | **HIGH** | Measured in real Chrome from `file://`, both DOM orders, three designs, four board sizes |
| The vocabulary gate | **HIGH** | Screened against the live regexes extracted from the gate source |
| The `[S09.10]` boundary-row collisions | **HIGH** | Candidate names and keys run through the actual regexes |
| The shipped default blows out, and in which direction | **HIGH** | Simulated over the artifact's own `App.model` functions; order-invariant; the AP-cap mechanism is arithmetic, not inference |
| The specific retune to apply | **MEDIUM** | The sweep is exact; real hot-seat play with adjudication is not simulated, and both shipped relationships favour the Mechs |
| Where the resolve/adjudicate line sits | **MEDIUM–HIGH** | Grounded in five written decisions in the artifact and two summaries; the AP-shortfall case is genuinely undecided |
| Whether the AP pool refills | **MEDIUM** | Inferred from `bestPair`/`turnsToWipe`; never written down. Flagged A1 |
| How the fight ends | **LOW** | No requirement covers it. Flagged, not recommended |

**Research date:** 2026-08-29
**Valid until:** the artifact changes. Every line number in this document is against the working-tree `cats-vs-mechs.html` at 19,508 lines (commit `1c7b784` state, clean). Re-grep before trusting a citation after any edit. The gate word lists and floors move whenever a plan moves them — re-extract rather than re-reading this table.
