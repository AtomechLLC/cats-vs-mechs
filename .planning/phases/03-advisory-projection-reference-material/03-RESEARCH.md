# Phase 3: Advisory Projection & Reference Material — Research

**Researched:** 2026-08-28
**Domain:** In-file derived arithmetic, sync-tier rendering into a reserved sticky region, and a
machine-enforced prohibition on comparative language
**Confidence:** HIGH on everything executed against the artifact; LOW on real-browser layout, which
has no browser in this environment.

**Method note.** Every numeric claim, DOM claim and grep count in this document was produced by
running code against `cats-vs-mechs.html` in this session, not recalled. Where a claim is judgement
rather than measurement it is marked `[ASSUMED]`. Probe scripts are in
`C:\Users\alexy\AppData\Local\Temp\claude\C--Projects-GameDesignSkills-GameFeelDirectionCourse-CatsVsMech\27c9d857-854a-4385-92a0-4748890aa59e\scratchpad\`
(`proj-math.cjs`, `proj-edge.cjs`, `fullsuite.cjs`, `strip.cjs`, `strip2.cjs`, `copygate.cjs`,
`vocab.cjs`, `patch.cjs`, `probe-scratch.cjs`).

---

<user_constraints>
## User Constraints (from 03-CONTEXT.md)

### Locked Decisions

Copied verbatim in substance from `03-CONTEXT.md`. **D-13 through D-17 are locked and are the reason
this phase exists.** D-01 through D-12 were resolved at Claude's discretion and the planner may
revisit them only where research below contradicts them (one such contradiction is flagged: see
*Open Question 1*).

- **D-00a:** The sticky centre strip (`#strip`, Phase 2 D-02) is the projection's home.
- **D-00b:** Derived values are computed during render and never stored in state.
- **D-00c:** `factionEhp`, `bestDamage`, `factionDps`, `unitEhp`, `aliveCount` and `apSpent` are
  shipped pure derivations in `[S02] MODEL`. Phase 3 consumes them; it should not add a parallel set.
- **D-00d:** UX-02 forbids conveying anything by hover alone.
- **D-01:** The 27-eHP / 9-turns-vs-3-turns asymmetry is the phase's best teaching artifact. Do not
  tune it away; FIGHT-11 owns any retune.
- **D-02:** The range comes from overkill waste, and from nothing else.
- **D-03:** Fast bound = perfect focus fire, zero waste: `ceil(targetEhp / dps)`.
- **D-04:** Slow bound = maximal overkill. Each unit absorbs `ceil(unitEhp / damagePerHit) *
  damagePerHit` before dying. The slow bound divides the target's total absorbed damage rather than
  its eHP.
- **D-05:** When the two bounds are equal, show ONE number, not a fake range.
- **D-06:** Integers only, everywhere. No decimals. Round the fast bound up.
- **D-07:** The leading "≈" stays even on an exact single number.
- **D-08:** A worked line per side, in the strip, with both operands and the operator visible.
  Shape: `27 eHP ÷ 3 per turn → ≈9 turns`. Not a tooltip, not a hover, not a disclosure.
- **D-09:** Each side's panel states its own durability and its own offense, naming the direction
  explicitly ("turns to wipe Mechs", not a bare "3 turns").
- **D-10:** The strip is narrow, so the arithmetic wraps rather than scrolls. Shorten the label,
  never the numbers; never a horizontal scroll inside the strip.
- **D-11:** `tabular-nums` on every figure, matching the file's existing `.num` convention.
- **D-12:** Action cards render inside each faction's column, below its roster; effect cards are
  part of the action card. The counter map goes in a full-width band below both columns. This
  amends Phase 2's D-02.
- **D-13:** Each side's projection lives in its own panel with its own numbers. No shared axis, no
  paired bars, no midpoint marker, no common scale.
- **D-14:** No comparative language anywhere in the rendered page.
- **D-15:** Colour encodes faction and token identity only — never quality.
- **D-16:** The "what this ignores" list (PROJ-04) is permanent and adjacent to the numbers.
- **D-17:** Extend the machine-enforced grep to comparative vocabulary. Check any new word against
  the existing traps before adding it.

### Claude's Discretion

All of D-01 through D-17 were resolved at Claude's discretion after the user declined the discussion
round. D-13..D-17 should nonetheless be treated as locked.

### Deferred Ideas (OUT OF SCOPE)

- A range that models focus-fire choice rather than only overkill.
- Per-action projection ("what if I lead with Hairball?").
- Showing the counter map as a matrix.

### Out of Scope, permanently (PROJECT.md)

- Difficulty verdict badge (Trivial→Extreme, traffic light, balance meter).
- Batch simulation / win-rate statistics.
- Automated combat resolution; simulated counters.
- Charting library.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROJ-01 | eHP and time-to-wipe projection per side, updates as allocation changes | §3 proves `#strip` is inside `#board` and repaints on every frame through `SYNC_HOOKS`; §2 proves the derivations exist and are pure |
| PROJ-02 | Range in the fight's own unit, never an abstract score, no decimals | §1 gives the worked arithmetic for both bounds with all edges executed; §1.4 gives the exact formatter |
| PROJ-03 | The arithmetic producing the projection is visible on screen | §3.4 gives the node shape for the worked line; §5.3 the CSS constraints at 220–320 px |
| PROJ-04 | Permanent always-visible list of what the projection ignores | §6.2 — **"counters" is a banned substring; the list's first noun must be "Matchups"** |
| PROJ-06 | Never renders a verdict, traffic light, difficulty badge or balance judgement | §4 — three-layer gate, word lists measured, plus four structural checks |
| REF-01 | Counter map displays as reference material | §5.1 data shape, §5.2 the three lines, §6 the naming |
| REF-02 | Effect keywords display as cards on the actions that carry them | §5.1 — all five keyword ids already in `DATA`; **no copy text exists anywhere in the repo and must be authored** |
</phase_requirements>

---

## Summary

The phase's arithmetic is small and completely determined by D-02..D-07, but it has exactly two ways
to reach a projector as garbage, and both were reproduced in this session. `Math.ceil(ehp / dps)`
with `dps === 0` returns `Infinity`, and `String(Infinity)` is the literal word `"Infinity"`; the
slow bound's `Math.ceil(e / hit) * hit` with `hit === 0` is `Infinity * 0 === NaN`. **`dps === 0` is
reachable today through the shipped action-point stepper** — `App.ops.setFactionAp('mechs', 0)` was
executed and the fast bound came back `Infinity`. The prescription is a single guard that returns
`null` and a copy branch, not a clamp.

The strip needs almost no new machinery, because of a fact that is easy to miss from the markup:
**`#strip` is a child of `#board`, not a sibling of it.** `App.render.sync()` scopes every one of its
passes to `board.querySelectorAll(...)`, so a node placed in the strip is already inside the
per-frame reconcile — and `App.render.structure()` only replaces the interiors of `#col-cats` and
`#col-mechs`, so strip content survives a rebuild. Both facts were executed. The consequence for
plan 03-01 is that the projection is a *build-once, sync-every-frame* sub-region, `[S06.3]`,
attached to `SYNC_HOOKS` exactly the way `[S06.2]`'s picker is. It cannot be a top-level section:
`SYNC_HOOKS` is not on `App.render`'s frozen surface (measured: `structure, sync, picker, amountFor,
labelFor, COMPACT_AT, MAX_UNITS`), so the only way to reach the seam is from inside the `[S06]` IIFE.

PROJ-06 is the phase's real work, and D-17's widened grep is buildable but not free. Measured against
the current file: `stronger`, `advantage`, `outmatch`, `favou?red`, `winner`, `loser` are all at
**0** and can be added today; `weaker` is at **1** (a comment on line 4736) and needs a one-word
reword first; and `best` (11), `worse` (11), `tier` (13), `wins`, `score`, `grade`, `judgement`,
`rank`, `ahead`, `lead` and `edge` are all non-zero and would make the gate unsatisfiable. The
sharpest finding here: **the artifact's own anti-verdict comment on line 2666 — "never a score, a
grade or a judgement" — is written in three of the words a naively widened grep would ban.** The
answer is a three-layer gate, described in §4, whose middle layer scans only string literals (2,027
of them today, 0 hits) so comments stay free to discuss the concepts the page must not use.

**Primary recommendation:** add `soakTotal(faction, hit)` and `turnsToWipe(attacker, target,
activeUnits)` to `[S02] MODEL` returning `null` rather than a non-finite number; render them from a
new `[S06.3]` sub-region pushed onto `SYNC_HOOKS`; put the reference band in a new
`<section id="refband">` inside `#board` at `grid-column:1/-1` and remember to grow `KNOWN_IDS` in
`tests/selftest-node.cjs` in the same commit; and replace the word "counters" with **"Matchups"**
everywhere it would otherwise reach the page.

---

## Architectural Responsibility Map

Single-file, single-tier artifact. The tiers here are the file's own sections, and section ownership
is binding because everything is one file.

| Capability | Primary section | Secondary | Rationale |
|------------|-----------------|-----------|-----------|
| Overkill soak and turns-to-wipe bounds | `[S02] MODEL` (plan 03-01) | — | The banner already says "PURE derivations… Turns-to-wipe ranges, formatting and the projection panel are Phase 3 (plan 03-01)". The file names its own home. |
| Number → sentence formatting | `[S06.3] RENDER — PROJECTION` (plan 03-01) | — | `[S02]`'s banner explicitly excludes formatting. A "≈" belongs to the page, not to the model. |
| Projection DOM in `#strip` | `[S06.3]` on `SYNC_HOOKS` (plan 03-01) | — | `SYNC_HOOKS` is reachable only from inside the `[S06]` IIFE (measured). |
| Effect-card and matchup copy | `[S01] DATA` → `data.reference` (plan 03-02) | — | `[S01]`'s own comment reserves it: *"their card copy and the action-versus-action reference table are data.reference, owned by Phase 3 plan 03-02."* |
| Action + effect cards in each column | `[S06.1] buildColumn` (plan 03-02) | — | D-12 puts them under the roster; `buildColumn` is the only builder for a column's interior. This is a **cross-plan edit into 02-01's function** — call it out in the plan. |
| Matchup band | new `#refband` shell node + `[S06.3]` or `[S06.4]` (plan 03-02) | — | Static shell sibling, like `#strip`; contents built from `data.reference`. |
| The no-verdict gate | `tests/selftest-node.cjs` FORBIDDEN + a new `[S09]` suite | — | The greps are currently **documentation only**; nothing mechanises them (verified). |
| Combat resolution | **nowhere, ever** | — | Out of scope by design. |

---

## Section 1 — The overkill range, worked and edge-checked

### 1.1 The model, stated exactly

```
perTurn(A)          = App.model.factionDps(A)        = min(A.ap, A.units.length) * bestDamage(A)
hit(A)              = App.model.bestDamage(A)        = max over A.actions of a.dmg
targetEhp(T)        = App.model.factionEhp(T)        = Σ (u.maxHp + u.shield)
soakTotal(T, hit)   = Σ ceil(unitEhp(u) / hit) * hit          -- maximal overkill (D-04)
fast(A,T)           = ceil(targetEhp(T) / perTurn(A))         -- perfect focus fire (D-03)
slow(A,T)           = ceil(soakTotal(T, hit(A)) / perTurn(A))
```

`slow >= fast` always, because `soakTotal >= targetEhp` term by term. **Executed:** an exhaustive
sweep over hp 1–12 × shield 0–6 × hit 1–6 × ap 1–6 × units 1–6 (18,144 combinations) produced
**0 cases where `slow < fast`**. `[VERIFIED: executed, proj-math.cjs §L]`

### 1.2 The shipped board, measured

`[VERIFIED: executed against App.data.defaults()]`

| | units | AP | eHP | best damage | per turn | soak of the *other* side | fast | slow | renders |
|---|---|---|---|---|---|---|---|---|---|
| Cats → Mechs | 9 | 3 | 27 | 1 | 3 | 27 | 9 | 9 | `≈9 turns` |
| Mechs → Cats | 3 | 3 | 27 | 3 | 9 | 27 | 3 | 3 | `≈3 turns` |

D-01's table is confirmed exactly. Both bounds collapse on the default board, so the default reads as
two single numbers — which is D-05's intent.

**A consequence D-05 does not state and the planner should know: the Cats side can never show a range
at all while its best damage is 1.** A 1-damage attacker wastes nothing by construction, so
`soakTotal === targetEhp` for every possible Mech allocation. Executed: Mechs re-allocated to
4 hp + 3 shield still gave Cats `≈7 turns`, not a range. The range is, in practice, a *Mechs-side*
phenomenon on this board. That is honest and teaches the right thing (overkill is a property of big
hits), but "why does only one side ever show a range?" is a question an instructor will be asked, and
the "what this ignores" copy is the place to have already answered it. `[VERIFIED: executed]`

### 1.3 Every edge, executed

`[VERIFIED: executed, proj-edge.cjs + probe-scratch.cjs]`

| Case | How it is reached | Raw arithmetic | Prescription |
|---|---|---|---|
| **`dps === 0` via AP** | `App.ops.setFactionAp(side, 0)` — the shipped stepper, floor is 0 | `fast = ceil(27/0) = Infinity` → renders **"≈Infinity turns"** | `turnsToWipe` returns `null`. Copy branch. |
| **`dps === 0` via damage** | `bestDamage === 0`. Not reachable in v1 — **no op anywhere writes `faction.actions`** (verified: `actions` is read only by `bestDamage` and the selftest) | same `Infinity` | same `null` branch. Guard anyway; Phase 5/onwards may open action editing. |
| **`hit === 0` in the soak** | same as above | `ceil(9/0) * 0 = Infinity * 0 = NaN` → renders **"≈NaN turns"** | `soakTotal` refuses `hit <= 0` **before** the loop and returns 0. |
| **`dmg > unitEhp`** | Lasers 3 vs 1-hp Cats | eHP 9, soak 27, `1–3 turns` | Correct and is the headline demo of overkill. |
| **`dmg` not dividing eHP** | Lasers 3 vs 4-hp Cats | eHP 36, soak 54, `4–6 turns` | Correct. |
| | Lasers 3 vs 5-hp Cats | eHP 45, soak 54, `5–6 turns` | Correct. |
| **Mixed health across a roster** | Cats at 1/2/3 hp repeated | eHP 18, soak 27 (each unit absorbs 3), `2–3 turns` | The per-unit ceiling is what makes mixed rosters work. Do **not** compute soak from the faction total. |
| **Shield** | shipped Mechs, 6 hp + 3 shield | `unitEhp = 9`, `factionEhp = 27` | Shield **is** in eHP. `[S05]`'s comment confirms this was already a fixed bug. |
| **Zero alive units** | not reachable — `MIN_UNITS = 1`, `removeUnit` throws *"That side needs at least one unit"* | — | No branch needed; the guard is upstream. |
| **Target eHP = 0** | reachable — set every unit to 0 hp / 0 shield (`MAX_ALLOC` floor is 0) | `fast = slow = 0` → `≈0 turns` | Honest, but a distinct string reads better. See §1.4. |
| **eHP 0 AND dps 0** | both of the above | `ceil(0/0) = NaN` | The `perTurn <= 0` guard fires first, so `null`. Order matters. |
| **AP above unit count** | `ap = 10`, 3 units | `min(10,3)*3 = 9` — capped by units | Already handled by `factionDps`. Nothing to add. |
| **Widest number** | 24 units × (99 hp + 99 shield) vs 1 AP × 3 dmg | `≈1584 turns` — **four digits** | Size the strip's figure for 4 digits + "turns". |

### 1.4 The prescription, as code

Add to `[S02] MODEL` (plan 03-01). This exact shape was pasted into a scratch copy and the artifact's
**full 430-row suite stayed green** — no existing assertion pins `Object.keys(App.model)`.
`[VERIFIED: executed, patch.cjs + probe-scratch.cjs]`

```js
  // Total damage a side ABSORBS when every hit lands on a fresh unit -- maximal
  // overkill (D-04). The per-UNIT ceiling is the whole point: a mixed roster
  // wastes a different amount on each unit, and a faction-total ceiling would
  // silently under-report it.
  // hit <= 0 is refused BEFORE the loop, not inside it. Math.ceil(e / 0) is
  // Infinity, Infinity * 0 is NaN, and String(NaN) reaches a projector as the
  // word NaN. There is no arithmetic answer to "how much does a zero-damage
  // action waste", so this does not invent one.
  function soakTotal(faction, hit) {
    if (!(hit > 0)) { return 0; }
    return faction.units.reduce(function (n, u) {
      return n + Math.ceil(unitEhp(u) / hit) * hit;
    }, 0);
  }

  // null means "this side has nothing to spend", and it is a null rather than a
  // large number or a clamp because those are both claims. A side at zero action
  // points is not slow, it is stopped, and the page says so in words.
  // The perTurn guard runs FIRST: a target at zero health and an attacker at
  // zero throughput together produce ceil(0/0) === NaN, and only this ordering
  // catches it.
  function turnsToWipe(attacker, target, activeUnits) {
    var perTurn = factionDps(attacker, activeUnits);
    if (perTurn <= 0) { return null; }
    var hit = bestDamage(attacker);
    var ehp = factionEhp(target);
    var soak = soakTotal(target, hit);
    return {
      perTurn: perTurn,
      hit: hit,
      ehp: ehp,
      soak: soak,
      fast: Math.ceil(ehp / perTurn),
      slow: Math.ceil(soak / perTurn)
    };
  }
```

Formatting lives in `[S06.3]`, never in `[S02]`:

```js
  //  D-05  equal bounds -> one number, not a fake range
  //  D-07  the tilde stays even then
  //  D-06  integers only; every input is an integer and ceil keeps it one
  function turnsText(r) {
    if (r === null) { return 'no damage to spend'; }
    if (r.ehp === 0)  { return 'nothing left to wipe'; }
    if (r.fast === r.slow) { return '\u2248' + r.fast + ' turns'; }
    return '\u2248' + r.fast + '\u2013' + r.slow + ' turns';   // EN DASH
  }
```

Characters: `\u2248` ≈, `\u2013` –, `\u00F7` ÷. All render in this file's stack; the file already
ships `\u2212` (−) and `\u00D7` (×) and the probe printed ÷ correctly. Do **not** use a hyphen for
the range — it reads as a minus beside `−` steppers. `[VERIFIED: executed]`

### 1.5 The worked line (D-08, PROJ-03)

```
Mechs
27 health ÷ 9 per turn   →   ≈3 turns to wipe Cats
```

Rendered live in the scratch build as `27 health ÷ 9 per turn`. Note the label is **"health"**, not
"eHP": there is no `eHP` string anywhere on the current page, `factionEhp`'s existing on-screen label
is literally `Total health`, and an abbreviation the board never defines is a legibility cost on a
projector for no gain. `[VERIFIED: executed — grep of rendered strings]` `[ASSUMED: that "health"
beats "eHP" for the audience — a judgement, not a measurement]`

When a range exists, the worked line has to carry the soak too or the second number is unexplained:

```
36 health ÷ 9 per turn   →   ≈4 turns
54 soaked ÷ 9 per turn   →   ≈6 turns with overkill
```

`[ASSUMED]` — this two-line form is a proposal. It is the only shape found that satisfies PROJ-03
for *both* bounds without a disclosure widget, but it doubles the strip's height when a range exists.

---

## Section 2 — Where the numbers come from

### 2.1 `activeUnits` during setup

`factionDps(faction, activeUnits)` defaults `activeUnits` to `faction.units.length` when the argument
is `undefined`. During setup there is no fight slice (`state.fight === null`, and `[S05] fightOf`
throws on it), so **plan 03-01 must call `factionDps(faction)` with one argument and let the default
stand.** Passing anything else in Phase 3 would require inventing an alive-count that does not exist
yet. Phase 5 owns the two-argument call. `[VERIFIED: source read + executed]`

### 2.2 eHP includes shield — confirmed

`unitEhp(u) = u.maxHp + u.shield`. Executed: a shipped Mech is `6 + 3 = 9`; `factionEhp(mechs) = 27`.
`[S05]`'s own comment records that omitting shield once projected 27 against a board showing 18.
`[VERIFIED: executed]`

### 2.3 Student-authored token types do not enter eHP — confirmed by construction

Custom tallies are stored sparsely at `unit.tally[typeId]` / `faction.tally[typeId]`. `unitEhp` reads
only `maxHp` and `shield`, so a tally cannot reach it. **Executed:** a unit given `tally.t1 = 99` and
a faction given `tally.t1 = 50` still measured `unitEhp = 9` and `factionEhp = 27`.
`[VERIFIED: executed, proj-math.cjs §I]`

This is the correct behaviour and it matches ALLOC-11 ("which count nothing on their own"). **The
projection must not acquire a tally-aware branch.** If a future request asks for one, it is a new
requirement, not a fix.

### 2.4 `labelFor` and the projection

`labelFor(state, tokenId)` is the only correct way to name a token type, and it works from inside the
strip: a node carrying `data-lbl="hp"` placed in `#strip` was rewritten to `Health` by `sync()`, and
then to `Vigor` after `App.ops.renameTokenType('hp','Vigor')`. `[VERIFIED: executed, strip.cjs §8]`

**But do not reflexively route the projection's labels through it.** The projection's "health" is the
*sum of two token types* (`hp` + `shield`). A student who renames `hp` to "Vigor" has not renamed the
sum. `[ASSUMED]` The recommendation is: the worked line says the neutral word `health`, carries no
`data-lbl`, and the two token types keep their own renameable labels on the cards where they are
allocated. Record this as a decision in the plan so a later reviewer does not "fix" it.

---

## Section 3 — Rendering into `#strip`

### 3.1 The fact that changes the design

**`#strip` is a child of `#board`.** The shell is:

```html
<div class="board" id="board">
  <section class="brd-col" id="col-cats"></section>
  <aside class="brd-strip" id="strip">Projection lands here in Phase 3</aside>
  <section class="brd-col" id="col-mechs"></section>
  <p class="muted" id="board-empty">…</p>
</div>
```

Executed consequences `[VERIFIED: executed, strip.cjs]`:

| Probe | Result |
|---|---|
| `board.querySelectorAll('.brd-value')` reaches a node appended to `#strip` | **yes** (count went 4 → 5, probe node found) |
| `App.render.sync()` writes that node from state | **yes** — a `.brd-value` with `data-amt="ehp" data-side="cats"` came back `27` |
| an *unknown* `data-amt` on a `.brd-value` in the strip | **silently renders `0`** — `amountFor` falls through |
| `App.render.structure()` destroys strip children | **no** — it only replaces the interiors of `#col-cats` / `#col-mechs` |
| `.brd-line--opt` hide pass reaches the strip | **yes** — a strip node with that class and an unknown `data-amt` was set `hidden` |
| `[data-lbl]` relabel pass reaches the strip | **yes** |
| a `data-k` in the strip duplicating a `col-mechs` key | **steals the focus restore** — `board.querySelector('[data-k="mechs/ap"]')` returned the strip node, because `#strip` precedes `#col-mechs` in document order and `keyed()` takes the first match |

### 3.2 The four rules that follow

1. **Do not reuse `.brd-value` + `data-amt` for a projection figure.** `amountFor` knows only
   `ap | dmg | ehp | hp | shield | <studentTypeId>`; anything else renders `0` with no error. Use a
   dedicated attribute — `data-prj="turns"` / `data-prj="work"` — and a dedicated class `.prj-*`.
2. **Never put `data-k` on a strip node**, and never put a `data-act` + `data-side` pair on one.
   `data-k` collides with focus restore (proved above); `data-act`+`data-side` collides with
   `peerOrdinal`'s fallback list. The projection is read-only, so this costs nothing.
3. **Never use `.brd-line--opt` in the strip.** That class means "hide when the tally is zero" and
   the hide pass reads `amountFor`, which will return `0` for any projection key.
4. **Build once, sync every frame.** `structure()` never touches the strip, so a `dataset.built`
   flag is sufficient and correct; the projection's *figures* then update through the hook.

### 3.3 The seam, and why it forces the section layout

`SYNC_HOOKS` is a closure variable inside the `[S06]` IIFE. Measured surface of `App.render`:
`structure, sync, picker, amountFor, labelFor, COMPACT_AT, MAX_UNITS` — and `App.render` is
`Object.freeze`d. **There is no way to push a hook from outside `[S06]`.**
`[VERIFIED: executed, strip.cjs §6]`

Therefore the projection renderer is a sub-region **`[S06.3] RENDER — PROJECTION`**, written in the
same shape as `[S06.2] RENDER — PICKER`, ending in `SYNC_HOOKS.push(syncProjection);`. It reuses
`[S06.1]`'s `el`, `text`, `setData` directly (same closure) and reaches `[S02]` at call time as
`App.model.turnsToWipe(...)` — which worked in the scratch build.

`sync()` runs `SYNC_HOOKS` as its **last** act, after the field, value, label, aria, token-row and
hide passes. One caveat: `sync()` early-returns on `if (!board) { return; }` *before* the hooks, so
in a document with no `#board` the projection never paints. Not reachable in the shipped page.

### 3.4 The node shape, verified end to end

This was pasted into a scratch copy and driven through boot, ops, `structure()` and a bare `sync()`.
`[VERIFIED: executed, patch.cjs + probe-scratch.cjs]`

```js
  /* --- [S06.3] RENDER — PROJECTION — owner plan 03-01 --- */

  // D-13. One panel per side, built by ONE function called twice with the side
  // as an argument. That is not a code-size decision: a builder that names both
  // sides in one body is the shape a shared axis, a paired bar or a midpoint
  // marker takes, and this is the only structural place the prohibition can be
  // held. [S09] asserts the shape rather than trusting this note.
  function projPanel(state, side) {
    var panel = el('section', 'prj-panel');
    setData(panel, { side: side });                    // NO data-k, NO data-act
    panel.appendChild(text('h3', 'prj-owner', state.build[side].name));
    var fig = text('div', 'prj-turns num', '');        // .num == tabular-nums (D-11)
    setData(fig, { prj: 'turns', side: side });
    panel.appendChild(fig);
    var work = text('div', 'prj-work num', '');
    setData(work, { prj: 'work', side: side });
    panel.appendChild(work);
    return panel;
  }

  function syncProjection(state) {
    if (typeof document === 'undefined') { return; }
    var strip = document.getElementById('strip');
    if (!strip) { return; }
    if (strip.dataset.built !== '1') { /* build both panels + the ignores list */ }
    var nodes = strip.querySelectorAll('[data-prj]');
    /* per node: side -> foe -> App.model.turnsToWipe(build[side], build[foe]) */
  }
  SYNC_HOOKS.push(syncProjection);
```

Observed output from the scratch build, driven through real ops:

| Action | Strip contents |
|---|---|
| boot | `Cats / ≈9 turns / 27 health ÷ 3 per turn` · `Mechs / ≈3 turns / 27 health ÷ 9 per turn` |
| `setFactionAp('cats', 0)` | `Cats / no damage to spend` · `Mechs / ≈3 turns / …` |
| Mechs → 4 hp | `Cats / ≈7 turns / 21 health ÷ 3 per turn` |
| `addUnit('cats')` (**structural**) | strip survived; `strip.dataset.built` still `1`; Mechs line updated to `≈4 turns / 30 health ÷ 9 per turn` |
| bare `App.render.sync()` | identical — the hook is not dependent on a structural frame |

### 3.5 The whole existing suite still passes

The scratch copy carrying `soakTotal`, `turnsToWipe`, `[S06.3]` and a new `#refband` shell node ran
**430 passed, 0 failed** on the full suite, and the FORBIDDEN scan stayed clean.
`[VERIFIED: executed, probe-scratch.cjs]`

---

## Section 4 — PROJ-06 as a mechanical gate (D-17)

### 4.1 The gate does not exist yet

The two greps live in `01-01-PLAN.md`, `01-01-SUMMARY.md` and their successors as hand-run acceptance
criteria. **Nothing in `tests/selftest-node.cjs`, in `[S09]`, or in
`.github/workflows/pages.yml` runs them.** `[VERIFIED: grepped the repo]` The workflow does run
`node tests/selftest-node.cjs` and gates the deploy on it, so the harness's `FORBIDDEN` array is the
correct home and it becomes CI-enforced for free.

Current state: both greps return **0**. `[VERIFIED: executed]`

### 4.2 Measured word list — this is the table the planner needs

Whole-file counts are case-insensitive over `cats-vs-mechs.html`. "Literals" counts occurrences inside
the 2,027 single- and double-quoted string literals in the `<script>` block.
`[VERIFIED: executed, vocab.cjs]`

| Word / stem | whole-file | literals | Verdict |
|---|---|---|---|
| `verdict` | 0 | 0 | keep — Layer A |
| `balanc` (widens `balanced`) | 0 | 0 | **widen to the stem** — catches balance / balanced / balancing / imbalance |
| `rating` | 0 | 0 | keep — Layer A |
| `difficult` (widens `difficulty`) | 0 | 0 | **widen to the stem** |
| `counter` | 0 | 0 | keep — Layer A (also blocks `encounter`, measured 0) |
| `stronger` | 0 | 0 | **add — Layer A** |
| `strongest` | 0 | 0 | **add — Layer A** |
| `weakest` | 0 | 0 | **add — Layer A** |
| **`weaker`** | **1** | 0 | **BLOCKED.** Line 4736: *"which is the weaker half of the same guarantee."* One-word reword ("the lesser half", "the narrower half") unblocks it. The stem `weak` costs the same single edit and buys weaker/weakest/weakness. |
| `advantage` | 0 | 0 | **add — Layer A** (also catches `disadvantage`) |
| `outmatch` | 0 | 0 | **add — Layer A** |
| `outclass` | 0 | 0 | add — Layer A |
| `favou?red` | 0 | 0 | **add — Layer A** |
| `winner` | 0 | 0 | **add — Layer A** |
| `loser` | 0 | 0 | **add — Layer A.** `closer` is currently 0, so no trap today; anchor it as `\bloser` if you want insurance against a future `closer`. |
| `traffic light` | 0 | 0 | add — Layer A |
| `overpowered` / `underpowered` | 0 / 0 | 0 / 0 | add — Layer A |
| `unfair` | 0 | 0 | add — Layer A |
| `superior` / `inferior` | 0 / 0 | 0 / 0 | add — Layer A |
| `dominat` | 0 | 0 | add — Layer A |
| `optimal` | 0 | 0 | add — Layer A (catches `suboptimal`) |
| `better` | 0 | 0 | add — Layer A |
| `judgment` | 0 | 0 | add — Layer A |
| `good build` / `bad build` / `should aim` | 0 | 0 | add — Layer A (phrases, no substring risk) |
| `score` | **1** | 0 | **Layer B only** — line 2666 |
| `grade` | **2** | 0 | **Layer B only** — line 2666, and `degrades` at 4716 |
| `judgement` | **1** | 0 | **Layer B only** — line 2666 |
| `rank` | **1** | 0 | **Layer B only** — `outranks` at 810 |
| `ahead` | **2** | 0 | **Layer B only** |
| `wins` / `win\b` | 1 / 2 | 0 / 0 | **Layer B only** — CSS specificity comment at 180 |
| `edge` | **1** | 0 | **Layer B only** |
| `lead` | **4** | 0 | **Layer B only** |
| `worse` | **11** | 0 | **Layer B only** — the file argues in this word constantly |
| `best` | **11** | **2** | **NEITHER LAYER.** `App.model.bestDamage` plus `'cats best damage'` / `'mechs best damage'` suite names. |
| `tier` | **13** | **1** | **NEITHER LAYER.** The two-tier render argument. |
| `fair` | 0 | 0 | add as `\bfair\b\|unfair` — the bare stem would ban "fairly" |

**The headline trap, stated plainly:** line 2666's comment reads *"The label is the plain word, never
a score, a grade or a judgement."* That is the artifact's own anti-verdict note, and it is written in
three words a widened whole-file grep would ban. Do not rewrite it — put those words in Layer B.

### 4.3 The three-layer gate

`[VERIFIED: executed — all three layers were built and run against the current file]`

| Layer | What it scans | Today's count | Today's hits | Home |
|---|---|---|---|---|
| **A** | the whole file, case-insensitive, comments included | 357 KB | 0 | `FORBIDDEN` in `tests/selftest-node.cjs` (CI-gated) |
| **B** | only the 2,027 quoted string literals in the `<script>` block | 2,027 literals | 0 | same file, a second scan beside `FORBIDDEN` |
| **C** | the **rendered** page — walk `#app` and harvest `textContent` of leaf nodes plus `aria-label` / `title` / `placeholder` | 204 strings | 0 | a new `[S09]` row, DOM-gated |

Layer C is the one that actually matches ROADMAP criterion 4's wording ("Reading the *rendered* page
top to bottom"). It also catches a sentence assembled from fragments that no single literal contains.
Layer C must **exclude `[data-lbl]` nodes and any node whose text came from `labelFor`** — a student
is allowed to name their own token "Winner", and failing the suite for that would be absurd.
`[ASSUMED: that exclusion is required — no student has done it, but ALLOC-10 permits it]`

Also verified: the static HTML body outside `<script>`/`<style>` carries no banned word (the one
apparent hit in a naive probe was line 4736's `weaker`, which is inside the script block).

### 4.4 Structural checks — can PROJ-06 be enforced by shape, not only by words?

Four are proposed. Confidence differs and is stated per check.

1. **One side per panel, no orphan numbers.** `HIGH`, executed-feasible.
   Assert `#strip` holds exactly two `[data-side]` panels, one `cats` and one `mechs`; and that
   **every `.num` node inside `#strip` has a `[data-side]` ancestor**. A figure with no side is, by
   construction, a figure about both sides — which is the comparison D-13 forbids. The stub DOM
   supports the traversal (proved).
2. **No inline style in the projection region.** `HIGH`, measured.
   The entire artifact makes **exactly one** `.style` access — `document.documentElement.style
   .setProperty('--topbar-now', …)` at line 4724. A proportional bar, a shared scale or a midpoint
   marker cannot be drawn without either an inline width or a per-frame custom property, and both are
   `.style`. So: assert `document.querySelectorAll('#strip [style]').length === 0`, and add a
   source-level rule that `.style` appears exactly once in the file. Both are exact today.
3. **The panel builder never names both sides.** `MEDIUM` — a heuristic, and it should be described as
   one. Slice the `[S06.3]` region out of the script body (the harness already slices the block) and
   assert that no function body inside it holds both the literal `'cats'` and the literal `'mechs'`,
   except the one-line driver `['cats','mechs'].forEach(...)` and the `foe` flip. This catches the
   accidental reintroduction, not a deliberate bypass — which is exactly how the existing FORBIDDEN
   scan already describes its own limits, so the framing is consistent with the file's culture.
4. **No shared scale in CSS.** `MEDIUM`. Assert that no `.prj-*` rule in the `<style>` block contains
   `width:` with a `%`, `calc()` or `var()` term, and that no CSS custom property is declared on a
   `.prj-*` selector. A shared axis needs a shared length; forbidding computed lengths in the
   projection's own rules forbids the axis. Fragile against a determined author, honest against a
   drifting one.

**Not recommended:** asserting the two panels have no common ancestor. They necessarily share
`#strip`, and D-13 is about a shared *scale*, not a shared *box*.

---

## Section 5 — REF-01 and REF-02

### 5.1 The data, and what is missing

`[VERIFIED: executed against App.data.DEFAULTS]`

```
cats  : slash    dmg 1  keywords []
        hairball dmg 0  keywords ['slowdown']
        screech  dmg 0  keywords ['confuse']
mechs : fly      dmg 0  keywords ['evade']
        lasers   dmg 3  keywords ['range']
        recharge dmg 0  keywords ['shield']
```

All five REF-02 keyword ids are present. **No descriptive copy for any of them exists anywhere in the
repository** — not in the artifact, not in `.planning/`, not in either sibling course artifact. The
board supplies names only. `[VERIFIED: grepped the whole repo]`

`App.data.reference` does not exist. `[S01]`'s own comment already reserves it:

> *Effect keyword ids live here; their card copy and the action-versus-action reference table are
> `data.reference`, owned by Phase 3 plan 03-02.*

Proposed shape — note it sits **outside** `DEFAULTS`, because `DEFAULTS` is copied into `build` and
round-trips through Phase 4's build code. Reference copy is static and must not be encoded:

```js
  // Static reference material. Deliberately NOT inside DEFAULTS: defaults() is
  // deep-copied into state.build and Phase 4 encodes that slice, and copy a
  // student cannot edit has no business in a share code. Deep-frozen for the
  // same reason the allowlists are.
  var REFERENCE = deepFreeze({
    // REF-02. Keyed by the keyword id already carried on each action record.
    // These ids collide by NAME with token ids (both have a 'shield') and that
    // is not a bug: a keyword is a rule, a token is a resource, and they live
    // in different objects. A student renaming the Shield TOKEN does not rename
    // the Recharge KEYWORD, and must not -- labelFor is never called here.
    effects: [
      { id: 'shield',   name: 'Shield',   text: '…' },
      { id: 'slowdown', name: 'Slowdown', text: '…' },
      { id: 'confuse',  name: 'Confuse',  text: '…' },
      { id: 'evade',    name: 'Evade',    text: '…' },
      { id: 'range',    name: 'Range',    text: '…' }
    ],
    // REF-01, as three ordered pairs. `over` wins the exchange, `under` loses
    // it. Named this way because the obvious words are refused by the
    // acceptance gate -- see the naming note in this plan.
    beats: [
      { over: 'fly',      under: 'slash'    },
      { over: 'lasers',   under: 'hairball' },
      { over: 'recharge', under: 'fly'      }
    ]
  });
```

Lookup of an action's keyword must use `hasOwnProperty` or an array `find`, following the file's
established convention — a bare index for `'constructor'` resolves on the prototype.

**Effect copy must be authored, and it is the one thing here that research cannot supply.**
`[ASSUMED]` The copy must describe the keyword without ruling on it, because adjudication is the
exercise. Suggested register, for the planner to put in front of the user:
*"Shield — soaks damage before health. Your table decides what gets through."* One line each, ≤ 90
characters, so five cards fit a column. **Flag this to `discuss-phase` or as a plan checkpoint; do
not let an implementing agent invent workshop rules.**

### 5.2 The three lines, and one oddity

Rendered as three sentences, not a matrix (D-12, and the specifics note). Reading the pairs:

```
Fly beats Slash
Lasers beat Hairball
Recharge beats Fly
```

**Two things the planner should know.** First, `Recharge` and `Fly` are **both Mechs actions**, so one
of the three relationships is intra-faction. That is a faithful transcription of the whiteboard
(`PROJECT.md` § Source material records "Expected counters: Slash < Fly, Hairball < Lasers, Fly <
Recharge"), and it should be rendered as given, not silently "fixed". It also makes the full-width
band the right home rather than a per-faction one, since the relationships are not cleanly
cross-faction. Second, `Fly` appears on both sides of the chain — it beats Slash and loses to
Recharge — which is a short rock-paper-scissors chain and is exactly why three lines beat a 3×3 grid.

Verb agreement wart: "Lasers **beat**", "Fly **beats**". `[ASSUMED]` Either author the sentence per
pair in the data, or use a plural-safe form — `Slash → Fly` with a legend, or "Fly · over · Slash".
The prescription is to render the action names verbatim from `DEFAULTS[side].actions[].name` and put
the connective in the data, so no code has to guess at grammar.

### 5.3 Layout

- **Action + effect cards** go in each faction column below the roster, appended by `buildColumn` in
  `[S06.1]` after the unit cards and after the setup-only Add button. Because the Add button is
  setup-only and the cards are not, the cards remain in fight mode for free — REF-03 (Phase 5) is
  pre-satisfied. **This is plan 03-02 editing a function plan 02-01 owns; name it in the plan.**
- **The matchup band** is a new static shell node inside `#board`:
  `<section class="brd-band" id="refband"></section>` placed before `#board-empty`, styled
  `grid-column:1 / -1` — the precedent `#board-empty` already sets.
- **`#strip` is `minmax(220px, 320px)`** with `padding:22px 18px` — so 184–284 px of content width,
  `display:grid; place-items:center`. Two panels plus a five-noun list will need
  `grid-auto-flow:row; gap:…; place-items:start stretch`. The longest measured figure is
  `≈1584 turns`; the longest worked line is `27 health ÷ 9 per turn` (22 characters at 18 px).
  D-10 says wrap, never scroll — so no `white-space:nowrap` on the worked line, and no `overflow` of
  any kind on the strip or any ancestor (`[C03]`'s sticky gotcha: any `overflow` other than `visible`
  on `html`, `body`, `.shell` or `#board` silently kills the sticking, with no error).
- **`#strip` is sticky at `top:var(--topbar-now, var(--topbar-h))` with `align-self:start`.** If the
  strip's content grows taller than the viewport minus the topbar, sticky behaves as if disabled for
  the overflowing part. Current `min-height` is 180 px; two panels + a worked line each + five nouns
  is realistically 400–550 px. `[ASSUMED — unmeasurable without a browser]` On a 1080p projector with
  a 64 px bar that fits; on a laptop at 768 px it may not. **Put this on the rehearsal list.**
- **Typography floor:** `[C04]` states the rule — every value ≥ 24 px / weight 700, every label
  ≥ 18 px, nothing at or below 14 px may carry information. **`.eyebrow` is 12 px and `.ex` is 12 px**
  — neither may carry projection or reference information. Reuse `.card`, `.callout`, `.muted`,
  `.num`, and `.brd-label` / `.brd-value` sizing instead.
- **D-15, colour:** `--ink`, `--ink-dim`, `--line`, `--panel`. Faction tint only if it matches the
  column's existing treatment. **No `--green` / `--gold` / `--coral` near a projection figure** —
  those are token-identity colours and would read as quality.

---

## Section 6 — The naming trap

### 6.1 The rule

`counter` is a banned substring (case-insensitive, whole file) and REF-01 *is* the counter map. The
feature cannot be named after itself. `encounter` is out for the same reason. `rating` hides inside
`generating`, `operating`, `iterating`, `separating`, `enumerating`, `decorating`, `narrating`.

### 6.2 The word PROJ-04 and D-16 both use is banned

**PROJ-04 says the list names "counters".** D-16 repeats it. That word cannot reach the page.
Measured substitutions, all at 0 whole-file hits `[VERIFIED: executed]`:

| PROJ-04 noun | Banned? | Render as |
|---|---|---|
| counters | **yes** | **Matchups** |
| effects | no | Effects |
| focus fire | no | Focus fire |
| overkill | no | Overkill |
| the student's own rulings | no | Your rulings |

REF-01's heading likewise: not "Counter map" but **"What beats what"** or **"Matchups"**. `beats` = 0,
`matchup` = 1 (in a planning doc, not the artifact) `[VERIFIED: executed]`.

### 6.3 Proposed identifiers, all checked against both greps

`[VERIFIED: executed, vocab.cjs — whole-file hit counts in the current artifact]`

| Identifier | hits | Banned substring? |
|---|---|---|
| `soakTotal`, `soak` | 0 | no |
| `turnsToWipe`, `toWipe` | 0 / 0 | no |
| `perTurn` | 0 | no |
| `fastBound` / `slowBound` | 0 / 0 | no |
| `overkill` | 0 | no |
| `prj` (class prefix), `.prj-panel`, `.prj-turns`, `.prj-work`, `.prj-ignores` | 0 | no |
| `projection` | 12 (all existing comments) | no |
| `band`, `.brd-band`, `#refband` | 0 | no |
| `beats`, `over`, `under` | 0 | no |
| `matchup` | 0 in artifact | no |
| `reference`, `data.reference` | 11 (existing comments) | no |
| `ignores`, `blindspot`, `caveat` | 0 | no |
| `wasted`, `spill`, `absorb` | 0 / 0 / 1 | no |
| **`winner` / `loser` as field names** | 0 / 0 | **do not use** — D-17 puts them on the Layer A ban list, so using them as keys makes the gate unsatisfiable |
| **`bestDamage`** | 11 | already shipped — this is why `best` can never be a gate word |

Comment-writing rules for this phase, so the widened gate stays satisfiable:
- write "generated", never "generating"; "operated", never "operating"
- say "the matchup map" or "what beats what", never "the counter map"
- say "the fight", never "the encounter"
- **before adding `weaker` to Layer A, reword line 4736.**

---

## Section 7 — Don't hand-roll

| Problem | Don't build | Use instead | Why |
|---|---|---|---|
| Getting the strip repainted when allocation changes | a listener, an observer, a second frame scheduler | `SYNC_HOOKS.push(...)` inside `[S06]` | `[S06.2]`'s picker already drifted once for exactly this reason; the seam exists because of that bug |
| A number that changes without shifting layout | a monospace font stack, a fixed width | the shipped `.num` class | `font-variant-numeric: tabular-nums`, already the file's convention (D-11) |
| Naming a token type on screen | a literal, a lookup table | `App.render.labelFor(state, id)` | the Damage bug (`e7f14ef`) was exactly a literal |
| eHP / damage / throughput | a new derivation | `App.model.factionEhp` / `bestDamage` / `factionDps` | D-00c; a parallel set is a second source of truth |
| Guarding division by zero | clamping `dps` to 1, or `|| 1` | return `null` and branch the copy | a clamp is a claim. "≈27 turns" for a side that cannot attack is a lie; "no damage to spend" is not |
| A shape in the reference cards | inline SVG | CSS `clip-path: polygon()` | `createElementNS` needs `http://www.w3.org/2000/svg`, and `https?://` is a FORBIDDEN pattern. `[C05]` already draws triangles and hexagons this way |
| A range bar / meter | any proportional element | two independent text figures | D-13; and a proportional length needs an inline style, which §4.4 check 2 forbids |
| Reference copy in `DEFAULTS` | adding a `reference` key to `DEFAULTS` | a sibling `REFERENCE` constant | `DEFAULTS` is deep-copied into `build` and encoded by Phase 4's build code |

**Key insight:** almost every "new" capability this phase needs is already a shipped, unused seam.
`bestDamage` had no consumer until Phase 2; `SYNC_HOOKS` was built for exactly this; `data.reference`
is named in a comment written before this phase started. The failure mode for Phase 3 is not missing
infrastructure — it is building a parallel copy of infrastructure that is already there.

---

## Section 8 — Common pitfalls, mapped to the two plans

### Plan 03-01 (projection)

**P1 — "≈Infinity turns" on a projector.** `dps === 0` is reachable through the shipped AP stepper
(executed). `String(Infinity)` is `"Infinity"`. **Avoid:** `turnsToWipe` returns `null` when
`perTurn <= 0`, guard first, before any division. **Warning sign:** any `Math.ceil` in the projection
path with an unguarded denominator.

**P2 — "≈NaN turns".** `Math.ceil(e / 0) * 0` is `NaN`. **Avoid:** `soakTotal` refuses `hit <= 0`
before the loop. **Warning sign:** an `Infinity * 0` anywhere; a `Number.isFinite` check added
downstream instead of a guard upstream.

**P3 — the strip figure silently reads `0`.** A `.brd-value` with a `data-amt` `amountFor` does not
know renders `0` with no error (executed). **Avoid:** dedicated `data-prj` attribute and `.prj-*`
classes; never `.brd-value` for a projection figure.

**P4 — the strip steals keyboard focus after a rebuild.** A `data-k` in `#strip` duplicating a
`col-mechs` key wins `keyed()`'s first-match lookup (executed). **Avoid:** no `data-k`, no
`data-act`+`data-side` pair, in the strip.

**P5 — the range never appears, so nobody believes it exists.** On the shipped board both bounds are
equal for both sides, and the Cats side can never produce a range while its best damage is 1
(executed). D-05 calls this a feature; PITFALLS.md Pitfall 2 calls it a warning sign. See
*Open Question 1*.

**P6 — storing a derived value.** D-00b. **Warning sign:** any write to `state` from `[S06.3]`, or a
memo keyed on anything but the DOM.

**P7 — the projection becomes the loudest thing on screen.** PITFALLS Pitfall 1. `#strip` is sticky
and centred, which is the most prominent position on the board. **Avoid:** `--ink-dim` for the worked
line, no accent colour on the figure, and the "what this ignores" list at the same visual weight as
the number it qualifies (D-16).

### Plan 03-02 (reference material)

**P8 — the stub-drift gate fails.** Executed: adding `<section id="refband">` made
`tests/selftest-node.cjs` report `STUB DRIFT: cats-vs-mechs.html carries id(s) the stub page does not
know: refband`. Shell ids go 35 → 36. **Avoid:** grow `KNOWN_IDS` in `makeStubDom()` **and** build the
matching node, in the same commit. The gate is bidirectional, so a stub id with no shell node fails
too.

**P9 — the file is CRLF.** All 7,083 lines. `[VERIFIED: executed]` Any scripted edit must preserve it.

**P10 — banned words in the reference material's own vocabulary.** "counter map" cannot be written in
code, in a comment, or on screen. See §6.

**P11 — renaming the wrong thing.** The keyword id `shield` collides by name with the token id
`shield`. `labelFor` must **not** be called for a keyword card: a student renaming the Shield token
has not renamed the Recharge keyword.

**P12 — 12 px text carrying information.** `.eyebrow` and `.ex` are both 12 px, below `[C04]`'s stated
floor of 14 px for information-bearing text.

**P13 — cross-plan edit into `buildColumn`.** Plan 02-01 owns it. Name the edit explicitly in 03-02's
plan so the section-ownership contract is not silently broken.

**P14 — inventing workshop rules.** The five effect keywords have no definition anywhere in the repo.
An implementing agent will fill the blank if the plan leaves it blank.

---

## Section 9 — Validation Architecture

`workflow.nyquist_validation` was not found as `false`; treating as enabled.

### Test Framework

| Property | Value |
|---|---|
| Framework | in-file `[S09] SELFTEST` harness + `tests/selftest-node.cjs` (Node built-ins only, nothing to install) |
| Config file | none — by design |
| Quick run command | `node tests/selftest-node.cjs` |
| Full suite command | see §9.3 — **the quick command is not the full suite** |
| CI | `.github/workflows/pages.yml` runs `node tests/selftest-node.cjs`; deploy is gated on it |

### 9.1 Measured baseline (before Phase 3)

`[VERIFIED: executed]`

| Gate | Value |
|---|---|
| forbidden-pattern scan | clean |
| `node tests/selftest-node.cjs` assertions | **363 passed, 0 failed** |
| perf gate | 100 commits in 5 ms (budget 50) |
| stub-drift gate | **35 shell ids**, all built |
| interaction gate | **46 of 46** |
| **full suite with a DOM** | **430 passed, 0 failed** |
| grep 1 `counter\|rating\|balanced\|difficulty` (`-ci`) | **0** |
| grep 2 `verdict\|balanced\|rating\|difficulty` (`-c`) | **0** |

Suite breakdown of the 430: assertion harness 3, board defaults 24, model derivations 12, state
contract 82, render contract 8, interaction contract 9, token appearance 24, token authoring 268.

### 9.2 The 67-row gap, confirmed and explained

363 vs 430. The gap is **not** only the `typeof document === 'undefined'` guards. **Executed:** with a
stub DOM but *without* `Event` / `MouseEvent` / `KeyboardEvent` in the sandbox, the run reported
**415 passed, 0 failed** with two rows reading `suite threw` — `interaction contract` and
`token authoring`. Adding the three constructors took it to **430 passed, 0 failed**.

**A suite that throws mid-way silently shortens the total and skips its own state restore.** In one
probe this left `build.cats.ap` at 4, and the projection then read `≈7 turns` instead of `≈9` — which
looked like a projection bug and was not. If a Phase 3 run reports anything other than 430, check the
total before chasing the number.

### 9.3 The full-suite runner (working, and reusable)

Written and executed this session; `scratchpad/fullsuite.cjs`. It takes an optional target path so a
scratch copy can be tested without touching the artifact.

1. Read `tests/selftest-node.cjs`, find `function makeStubDom()`, brace-match to its close, and
   `vm.runInNewContext('(' + src + ')')` it. **Lift it, never re-type it.**
2. Build a sandbox with `document`, `window`, `location:{hash:''}`, `CSS` (all from the lifted stub),
   `ResizeObserver` (a stub — `[S08]` observes the topbar), `requestAnimationFrame`, **and `Event`,
   `MouseEvent`, `KeyboardEvent`**.
3. Run the `<script>` body in it, `App.state.flush()`, then `App.selftest.run()`.
4. Assert `passed + failed === 430` (→ 430 + N after Phase 3), not just `failed === 0`.

`App.render` and every section surface are `Object.freeze`d, so runtime monkey-patching silently
no-ops. Prove behaviour by patching a **scratch copy** — `scratchpad/patch.cjs` does this and the
patched copy ran 430/430.

### 9.4 Requirements → test map

| Req | Behaviour | Type | Command | Exists? |
|---|---|---|---|---|
| PROJ-01 | strip figures change after `setFactionAp` / `setUnitMaxHp` + `flush()` | integration (DOM) | new `[S09.8]` rows via `node tests/selftest-node.cjs` (DOM path) | ❌ Wave 0 |
| PROJ-02 | `turnsToWipe` bounds for the shipped board = 9/9 and 3/3; the eight edge cases in §1.3 | unit (no DOM) | new `[S09.8]` rows, run in the terminal harness too | ❌ Wave 0 |
| PROJ-02 | **never `Infinity`, never `NaN`, never a decimal** — sweep assertion | unit | one row asserting `Number.isFinite` + `Number.isInteger` over a generated sweep | ❌ Wave 0 |
| PROJ-03 | the worked line's text holds both operands and the operator | DOM | `[S09.8]` reads `[data-prj="work"]`.textContent | ❌ Wave 0 |
| PROJ-04 | the ignores list is present, not `hidden`, and holds five items | DOM | `[S09.8]` | ❌ Wave 0 |
| PROJ-06 | Layer A word scan | source | extend `FORBIDDEN` in `tests/selftest-node.cjs` | ❌ Wave 0 |
| PROJ-06 | Layer B literal scan | source | new scan beside `FORBIDDEN` | ❌ Wave 0 |
| PROJ-06 | Layer C rendered-copy walk | DOM | new `[S09.8]` row | ❌ Wave 0 |
| PROJ-06 | structural checks 1 and 2 (§4.4) | DOM + source | `[S09.8]` + harness | ❌ Wave 0 |
| REF-01 | three matchup lines render, naming the six actions by their data names | DOM | new `[S09.9]` rows | ❌ Wave 0 |
| REF-02 | every keyword on every action has a card; every card id is in `REFERENCE.effects` | DOM + unit | `[S09.9]` — assert **both directions**, so a keyword added to `DEFAULTS` with no copy fails loudly | ❌ Wave 0 |
| REF-02 | `labelFor` is never called for a keyword | source | scoped scan of the `[S09.9]`-owned region | ❌ Wave 0 |
| — | `#refband` in `KNOWN_IDS` | gate | existing stub-drift gate (will fail until updated) | ✅ exists |
| — | totals moved deliberately | gate | assert the new absolute totals: 363 → 363+N, 430 → 430+M | ✅ pattern exists |

### 9.5 Sampling rate

- **Per task commit:** `node tests/selftest-node.cjs` — must stay green and the count must equal the
  number the plan declares.
- **Per wave merge:** the full-suite runner from §9.3, asserting the DOM-gated total too.
- **Phase gate:** both, plus both greps at 0, plus the widened Layer A list at 0, before
  `/gsd:verify-work`.

### 9.6 Wave 0 gaps

- [ ] `tests/selftest-node.cjs` — grow `KNOWN_IDS` for `#refband` (and any other new shell id)
- [ ] `tests/selftest-node.cjs` — Layer A word list added to `FORBIDDEN`
- [ ] `tests/selftest-node.cjs` — Layer B literal scan added
- [ ] `cats-vs-mechs.html` line 4736 — reword "weaker" before Layer A includes it
- [ ] `[S09.8] SUITE: projection` — new region, owner plan 03-01
- [ ] `[S09.9] SUITE: reference material` — new region, owner plan 03-02
- [ ] the `[S09]` table of contents at line ~4840 gains two rows
- [ ] the section table of contents at line ~631 gains `[S06.3]` (and `[S06.4]` if the band is separate)

---

## Section 10 — Environment Availability

| Dependency | Required by | Available | Version | Fallback |
|---|---|---|---|---|
| Node (built-ins only: `fs`, `path`, `vm`) | the whole test gate | ✓ | v24.15.0 | — |
| A real browser | UX-02 projector legibility, sticky behaviour, `≈`/`÷`/`–` rendering, the strip's height against the viewport | ✗ | — | **none** — must be a human rehearsal |
| Playwright | optional smoke test | ✗ | — | the in-file harness covers the logic |
| npm registry / any package | — | not needed | — | the artifact has zero runtime dependencies by constraint |

**Missing with no fallback:** real-browser verification. Everything in §5.3 marked `[ASSUMED]` —
strip height, wrap behaviour, projector legibility of a four-digit figure — is unverifiable here and
belongs on the rehearsal list, alongside the already-open gap G-02-B.

## Package Legitimacy Audit

**Not applicable.** This phase installs no packages, in any ecosystem. The artifact has zero runtime
dependencies by hard constraint (UX-04), and the dev harness uses Node built-ins only. No `slopcheck`
run was required and none is recorded, because there is nothing to check.

## Security Domain

The relevant ASVS category is **V5 Input Validation**, and the file's existing posture already covers
this phase's surface:

| Concern | Applies to Phase 3 | Existing control |
|---|---|---|
| V5 — markup injection | yes | no `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`DOMParser`/`document.write` anywhere; every string reaches the page via `textContent`; mechanically gated by `FORBIDDEN` in `tests/selftest-node.cjs` |
| V5 — prototype pollution via a keyword lookup | yes | use `hasOwnProperty` or `Array.find` for `REFERENCE.effects`, matching `styleFor` / `labelFor` / `amountFor`. Keywords come from frozen `DATA` in v1, but Phase 4 opens a decode path |
| V5 — unvalidated string into `className` | low | reference cards use fixed class names; if a shape chip is drawn, route through `safeShape` / `safeColor` like `makeToken` does |
| V2/V3/V4/V6 | no | no auth, no session, no network, no crypto |

Threat model note: the only attacker-controlled input in the whole artifact is a pasted build code
(Phase 4) and a typed token name (Phase 2.1). Phase 3 renders neither. The realistic failure here is
a correctness bug reaching a classroom, not a compromise.

## Project Constraints (from CLAUDE.md)

| Directive | Bearing on this phase |
|---|---|
| ONE self-contained HTML file, ONE classic `<script>`, ONE `<style>` | `[S06.3]` is a region inside the existing script, not a new file |
| No `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`document.write`/`srcdoc`/`DOMParser`/`eval`/`new Function` | all projection and reference nodes via `createElement` + `textContent` |
| No `https?://` anywhere → **no inline SVG** | shapes are CSS `clip-path: polygon()`, as `[C05]` already does |
| No fetch/XHR/CDN/`url()`/`@import` | reference copy is a JS literal in `[S01]` |
| Derived values computed during render, never stored | D-00b; `[S02]` returns fresh objects, `[S06.3]` formats them |
| Readability is deliberate; the file is the deliverable | no minification, no extraction, comments explain *why* |
| Combat resolution deliberately not automated | the projection is advisory arithmetic. **No batch simulation, no win-rate statistics** — both named in PROJECT.md Out of Scope |
| Modern CSS is fine (`:has()`, nesting, container queries, `color-mix()`) | all Baseline Widely Available; the file already uses nesting |
| GSD workflow enforcement | edits go through `/gsd:execute-phase` |

---

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|---|---|---|
| A1 | Effect keyword copy (Shield / Slowdown / Confuse / Evade / Range) does not exist and must be authored; the suggested register is a proposal | §5.1 | An agent invents workshop rules that contradict what the instructor teaches. **Highest-risk item in this document.** Escalate to the user. |
| A2 | "health" reads better than "eHP" on the worked line | §1.5 | Cosmetic |
| A3 | The two-line worked form for a range (health line + soak line) | §1.5 | Doubles strip height when a range exists; may force a shorter form |
| A4 | The projection must not route its "health" label through `labelFor` | §2.4 | A student renaming Health sees the projection keep the old word. Defensible, but record it |
| A5 | Strip content at 400–550 px still sticks acceptably on a workshop display | §5.3 | Sticky degrades on a short viewport. Rehearsal-only |
| A6 | Layer C must exclude `[data-lbl]` nodes so a student-named token cannot fail the suite | §4.3 | A student naming a token "Winner" reddens CI |
| A7 | Structural checks 3 and 4 are heuristics, not proofs | §4.4 | They catch drift, not a determined author. Say so in the code comment |
| A8 | "Fly beats Slash / Lasers beat Hairball / Recharge beats Fly" is the right rendering of `X < Y` | §5.2 | Reverses the meaning if misread. Verify against the whiteboard image |
| A9 | `\bloser` needs no `closer` guard (currently 0 hits) | §4.2 | A future `closer(` would redden the gate |

---

## Open Questions (RESOLVED)

**All five were resolved during planning.** Dispositions below; the original text is left as
written so the reasoning that produced each answer stays readable. Question 5 is legitimately
*deferred* rather than answered — it needs a browser this repo does not have.


1. **D-05 versus PITFALLS.md Pitfall 2 — a real, documented contradiction.** — **RESOLVED: D-05 wins, and the plans prove the range rather than asserting it.** 03-02 drives an artificial overkill state and asserts a real spread in the model; 03-03 does the same through the DOM and additionally reverts `turnsText`'s equal-bounds branch to prove the single-number path is asserted, not assumed. The reconciliation is recorded in 03-02 and echoed in ROADMAP so a verifier reading PITFALLS does not file the shipped default as a defect.
   D-05 says: when the bounds are equal, show one number, and *"This is a feature."*
   PITFALLS.md Pitfall 2's warning-sign list says: *"The band collapses to a single value for the
   default build (means the band isn't modelling anything)."*
   Both cannot be acted on. **D-05 is later and is locked, so it wins** — but a verifier reading
   PITFALLS.md will flag the shipped default as a defect. Measured aggravating factor: the Cats side
   can *never* show a range while Slash does 1 damage, so on the shipped board the range feature is
   invisible in both directions. **Recommendation:** the plan records this explicitly, the "what this
   ignores" copy or an adjacent note says in one sentence why a single number appears (*"the numbers
   agree because nothing is wasted at this damage"*), and the phase's verification does not treat the
   collapse as a bug.

2. **Effect card copy (A1).** — **RESOLVED: gated behind a blocking checkpoint in plan 03-04 Task 1** (not 03-02 as recommended here — the plan set grew to five and the reference unit moved). Task 1's acceptance includes `git diff --quiet cats-vs-mechs.html`, and Task 2 reads the approved text from `03-04-SUMMARY.md` rather than the plan's draft, so no agent can write a workshop rule. Not derivable from any source in this repository. Needs the user or the
   Workshop 16 board. **Recommend a `checkpoint:human-verify` in plan 03-02 before the copy is
   written.**

3. **`Recharge` beats `Fly` is intra-Mechs.** — **RESOLVED: transcribed as given and flagged, not fixed**, in plan 03-04. It is folded into that plan's blocking checkpoint so the user sees it at the same moment they approve the effect copy. Faithful to `PROJECT.md`'s transcription of the board.
   Render as given; flag rather than fix. Worth one question to the user, since it changes whether the
   band reads as cross-faction.

4. **Does the widened Layer A list belong in `FORBIDDEN` or beside it?** — **RESOLVED: beside it.** Plan 03-01 adds a sibling `VERDICT_WORDS` array with its own failure message, because a verdict word is not a sink and conflating the two would make the failure text lie about what went wrong. `FORBIDDEN` currently means
   "unsafe sink". A verdict word is not a sink. **Recommendation:** a second named array in the same
   file — `VERDICT_WORDS` — with its own message, so a failure says *"PROJ-06: comparative language
   reached the artifact"* rather than *"forbidden pattern"*. Same file, same CI gate, honest labels.

5. **`--tok` and the projector rehearsal (gap G-02-B) are still open from Phase 2.** Phase 3 adds the
   densest text on the board to the narrowest column. It does not close G-02-B and should not claim
   to; it does raise the stakes on it.

---

## Sources

### Primary — HIGH confidence, executed in this session

- `cats-vs-mechs.html` — read `[S01] DATA`, `[S02] MODEL`, `[S03] STATE`, `[S05] OPS` bounds,
  `[S06] RENDER` in full, `[S09]` suite layout, `[C00]`–`[C05]` and `[C07]`, and the shell markup.
- **Executed:** `node tests/selftest-node.cjs` → 363/363, stub-drift 35 ids, interaction gate 46/46,
  perf 5 ms.
- **Executed:** full-suite runner (`scratchpad/fullsuite.cjs`) → **430/430**; and the 415-row
  failure mode without `Event`/`MouseEvent`/`KeyboardEvent`.
- **Executed:** `scratchpad/proj-math.cjs`, `proj-edge.cjs` — the bounds, all edges, and an
  18,144-combination monotonicity sweep.
- **Executed:** `scratchpad/strip.cjs`, `strip2.cjs` — nine DOM probes against the stub page
  (ancestry, sync reach, structure survival, hide pass, label pass, `data-k` collision, `SYNC_HOOKS`
  visibility, `data.reference` absence, keyword inventory).
- **Executed:** `scratchpad/patch.cjs` + `probe-scratch.cjs` — a scratch artifact carrying the
  proposed `[S02]` derivations, `[S06.3]` region and `#refband` node: **430/430**, forbidden scan
  clean, stub-drift correctly failed on `refband`.
- **Executed:** `scratchpad/vocab.cjs`, `copygate.cjs` — 46 candidate words counted whole-file and
  literal-only; three-layer gate feasibility (2,027 literals, 204 rendered strings, 0 hits each).
- `tests/selftest-node.cjs` — FORBIDDEN list, stub-drift gate, `makeStubDom`, sandbox composition.
- `.github/workflows/pages.yml` — confirms `node tests/selftest-node.cjs` gates the deploy.

### Secondary — MEDIUM confidence, read not executed

- `.planning/PROJECT.md` (Out of Scope; "Design tension worth preserving"; § Source material's
  transcription of the whiteboard), `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md` § Phase 3,
  `.planning/research/PITFALLS.md` Pitfalls 1, 2, 10, 12, `.planning/research/ARCHITECTURE.md`,
  `.planning/phases/02*/` contexts.
- `../game-feel-study-guide.html` — class vocabulary (`card`, `eyebrow`, `callout`, `muted`, `num`,
  `pill`, `tag`), confirming the shared design language already mirrored in `[C02]`.

### Not consulted

No Context7, no WebSearch, no WebFetch. This phase adds no library, no API and no external
dependency; every question it raises is answerable against the artifact, and was.

---

## Metadata

**Confidence breakdown:**

| Area | Level | Basis |
|---|---|---|
| The two bounds and every edge case | **HIGH** | executed against the shipped derivations, plus an 18,144-case sweep |
| `Infinity` / `NaN` reachability | **HIGH** | reproduced through the shipped op, not reasoned about |
| `#strip` is inside `#board`; sync reaches it; structure spares it | **HIGH** | nine executed DOM probes |
| `SYNC_HOOKS` unreachable from outside `[S06]` | **HIGH** | measured `App.render`'s frozen surface |
| The proposed code passes the existing 430 | **HIGH** | scratch copy executed |
| Word-list counts and the three-layer gate | **HIGH** | every count executed; both existing greps confirmed at 0 |
| Structural PROJ-06 checks 1 and 2 | **HIGH** | based on measured facts (`.style` appears exactly once) |
| Structural PROJ-06 checks 3 and 4 | **MEDIUM** | heuristics; stated as such |
| Layout, strip height, projector legibility, `≈`/`÷`/`–` glyph rendering | **LOW** | no browser in this environment; rehearsal is the only answer |
| Effect card copy | **NONE — does not exist** | not present anywhere in the repository |

**Research date:** 2026-08-28
**Valid until:** stable — the artifact is the only moving part, and this document names the exact
line numbers and counts it depends on (line 4736 `weaker`, line 2666 the three Layer-B words,
line 4724 the single `.style` call, 35 shell ids, 363 / 430 assertion totals). Re-measure those seven
numbers if the file changes before planning.
