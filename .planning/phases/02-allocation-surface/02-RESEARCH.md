# Phase 2: Allocation Surface — Research

**Researched:** 2026-08-27
**Domain:** Zero-dependency DOM rendering, pointer/keyboard input economy, CSS shape vocabulary, projector legibility
**Confidence:** HIGH on everything executable in Node against the real artifact; MEDIUM on real-browser DOM behaviour (no browser automation exists in this repo — see `## What Remains Unverified`)

---

<user_constraints>
## User Constraints (from 02-CONTEXT.md)

### Locked Decisions — research HOW, never WHETHER

**Screen layout**
- **D-01:** Side-by-side columns. Cats left, Mechs right, both fully visible at once. Each column gets roughly half the available width on a projector.
- **D-02:** A center strip between the columns is reserved for Phase 3's projection. Phase 2 builds the strip as an empty reserved region so Phase 3 fills it without a re-layout.
- **D-03:** The page scrolls as one; the center strip is sticky. Rejected: independent per-column scroll containers.
- **D-04:** A sticky top bar holds persistent controls — artifact title left, control cluster right. Undo ships into that cluster in Phase 2.

**Roster editing**
- **D-05:** Add/remove is setup-only. The controls are present while building and go away once a fight starts.
- **D-06:** Per-unit remove plus one add button per side. Because UX-02 forbids conveying anything by hover alone, the remove control must be **persistently visible**, not hover-revealed.
- **D-07:** Removal is real removal, not a dead-marker.

**Token vocabulary**
- **D-08:** Tokens are data, not hardcoded glyphs. The renderer takes `(shape, color, glyph)` per token type rather than branching on four fixed cases.
- **D-09:** The vocabulary supports simple shapes, colors and emoji, for every token type including health and damage.
- **D-10:** Every emoji token must be paired with a shape and color that carry the meaning on their own.
- **D-11:** Students can edit token appearance in the UI. Phase 2 ships the picker.
- **D-12:** Editing lands in Phase 2; persistence lands in Phase 4.
- **D-13:** Token appearance belongs in the `build` slice, not `ui`.

**Numeric input behaviour (Claude's discretion, resolved)**
- **D-14:** The field displays the current **absolute** value at rest (`3`), not an empty box.
- **D-15:** A leading sign means delta; no sign means absolute. `-8` subtracts eight, `+5` adds five, `12` sets twelve.
- **D-16:** Enter commits, blur commits, Escape reverts to the value at focus-in.
- **D-17:** Arrow keys step by 1; Shift+arrow steps by 5. Held arrows use the same ramp as press-and-hold.
- **D-18:** Press-and-hold ramp: roughly 400 ms before the first repeat, then one step per ~120 ms, accelerating to one per ~40 ms after about a second. Every repeat is one `App.ops.*` call. *(Quoted verbatim. Note that the word used here trips the acceptance grep — see Pitfall P-11. It may appear in planning documents; it may not appear in `cats-vs-mechs.html`.)*
- **D-19:** The focused input element must never be destroyed by `render.sync()`.

**Token row compaction**
- **D-20:** Threshold is 12 tokens. Below it, render individual tokens. At or above it, compact.
- **D-21:** Compacted form is a count, a multiplication sign, then one glyph at the same size as a normal token.
- **D-22:** The transition between modes must not animate.

### Claude's Discretion (open to the planner)
D-14 through D-22 were resolved at Claude's discretion and are "open to revision by the planner if research surfaces a reason." This research surfaces **no reason to revise any of them.** Two carry newly-measured constraints attached — see `## Pitfall P-05` (D-18's 400 ms initial delay has only 100 ms of margin against the undo-coalescing window) and `## Pitfall P-09` (D-20/D-22 mode switching must not go through `display:none`).

### Deferred Ideas — OUT OF SCOPE for Phase 2
- Independent per-column scroll (rejected in D-03).
- Collapsible faction columns.
- Whole-side count stepper for roster size (fallback only if per-unit controls crowd the projector).
- **Curated vs free-entry emoji picker** — explicitly left open by the user. This research **recommends curated** with measured evidence; see `## 4. Token Vocabulary`.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research support in this document |
|----|-------------|-----------------------------------|
| ALLOC-01 | Set each unit's health with +/− steppers | §2 stepper engine; §3 input; `ops.nudgeUnitMaxHp` prescription |
| ALLOC-02 | Set each faction's shared AP pool with +/− steppers | Same engine, `data-act="ap"`; existing `ops.setFactionAp` |
| ALLOC-03 | Type a delta (`-8`, `+5`) and adjust with arrow keys | §3 — `type="text"` + verified regex parser + arrow/ramp routing |
| ALLOC-04 | Token rows in the board's vocabulary; vocabulary is data | §4 — `DEFAULTS.tokens`, CSS shape classes, no SVG |
| ALLOC-05 | Rows compact above a readable threshold | §4 compaction; P-09 |
| ALLOC-06 | Add and remove units on either side | §1 `render.structure` + `withPreservedFocus`; new `addUnit`/`removeUnit` ops |
| ALLOC-07 | Rapid clicks and press-and-hold register every input, no focus loss, no scroll loss, no animation restart | §2 in full — this is the measurable criterion; P-01…P-06 |
| ALLOC-09 | Student edits a token type's shape/color/emoji from the UI | §4 picker; allowlisted `ops.setTokenStyle` |
| UX-02 | Legible on a projector; nothing by hover alone | §5 — measured contrast table, WCAG anchors, `ui.kbdNav` |
| UX-05 | Visual language matches the sibling artifacts | §5, §6 — zero new hexes needed; all four token colours already exist |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

Every recommendation below was checked against these. A recommendation that violates one is not in this document.

| Constraint | How Phase 2 stays compliant |
|---|---|
| One self-contained HTML file, no build step, no runtime network | Nothing new is installed. Zero dependencies added. |
| One classic `<script>`, never `type="module"` | Phase 2 adds only to `[S06]` / `[S07]` / `[S05]` / `[S01]` inside the existing script. |
| No `innerHTML`/`outerHTML`/`insertAdjacentHTML`/`document.write`/`srcdoc`/`DOMParser`/`eval`/`new Function` | All node creation via `createElement` + `textContent`; row clearing via `replaceChildren()` (verified permitted by the gate). |
| No CDN, no `fetch`/XHR | N/A. |
| **No `url(` anywhere** (the gate forbids it) | Rules out `clip-path:url(#id)`, `mask-image`, `cursor:url()`. CSS shapes use `clip-path:polygon()` and `transform:rotate()` instead. |
| **No `http://` or `https://` literal anywhere** (the gate forbids it) | **Rules out inline SVG entirely** — `createElementNS` needs the literal `http://www.w3.org/2000/svg`. Verified below. |
| Combat resolution is deliberately not automated | Nothing in this document touches damage application, turn advance, or adjudication. |
| Derived values computed during render, never stored | `App.model.bestDamage()` is called from `render`, never written to state. |
| Readability is a feature; the file is the deliverable | Every prescription is hand-editable plain code. No minification, no extraction, no clever abstraction. |

---

## Summary

Phase 2 is not a research-hungry phase in the usual sense — the hard architectural calls were made in Phase 1 (`D-00e` two-tier render) and validated by prior research with real Chrome measurements (`ARCHITECTURE.md` T1–T21). What this phase actually needs from research is **precision on five mechanisms** that will each fail silently if built by intuition: the reconcile's node-identity contract, the pointer-event choice that makes "exactly twenty clicks" true, the input element that can accept a leading `+`, the shape vocabulary given that the repo's own forbidden-pattern gate blocks SVG, and a legibility spec expressed in numbers rather than adjectives.

Three findings change what the planner would otherwise have written. **First: inline SVG is unavailable.** The SVG namespace is the literal string `http://www.w3.org/2000/svg`, and `tests/selftest-node.cjs` fails the build on any `https?://` match. Verified by running the gate's own regexes. Shapes must come from CSS (`clip-path:polygon()`, `transform:rotate(45deg)`, `border-radius`) — which is also less code and crisper at projector scale, so this is a constraint that happens to point the right way. **Second: `<input type="number">` cannot express D-15.** The HTML spec's "valid floating-point number" production does not admit a leading `+`, and the number state's value sanitisation algorithm sets the value to the empty string when it isn't valid — so `+5` reads back as `""`. The element is `type="text"` with `inputmode="numeric"`, and the parser is a regex, not `Number()`. **Third: ALLOC-07 is already instrumented.** `App.state.stats().commits` exists and is exported. Twenty synthetic `pointerdown` events dispatched at a delegated root produced exactly twenty commits, one undo entry and one render frame, executed against the real artifact in this session. "Exactly twenty" is an automatable assertion in `tests/selftest-node.cjs` behind a ~60-line DOM stub — no browser needed. A working stub was built and run to prove it.

The two things most likely to break ALLOC-07 in practice are not performance. They are **binding both `pointerdown` and `click` to the same stepper** (measured: one physical click → two commits) and **re-appending an existing token node during the reconcile** (a move is a remove-plus-insert, which cancels and restarts the CSS animation on every token that moved). Both are named as pitfalls with the exact rule that prevents them.

**Primary recommendation:** build `render.structure()` as a `withPreservedFocus`-wrapped rebuild of the two column interiors only, `render.sync()` as a keyed grow/shrink reconcile that never re-appends and never writes to the focused input, drive steppers from `pointerdown` alone (with `click` handled only when `e.detail === 0`, i.e. keyboard), route every value change through new `ops.nudge*` transformers so `[S07]` does no arithmetic, and draw every token as a fixed-size CSS box whose optional emoji is an absolutely-positioned child that cannot influence row metrics.

---

## Architectural Responsibility Map

This is a single-file browser artifact with no server tier. "Tier" here means the file's own section layers, whose boundaries `[S00]`–`[S10]` already enforce.

| Capability | Primary tier | Secondary tier | Rationale |
|------------|--------------|----------------|-----------|
| Token vocabulary defaults (shape/color/glyph) | `[S01] DATA` | — | Round-trips through the share code (D-12/D-13), so it must live in the frozen `DEFAULTS` that `defaults()` and reset both read. |
| Shape/color allowlists | `[S01] DATA` | `[S05] OPS` (validation) | Same allowlist precedent as `UI_KEYS` / `SIDES` (fixes WR-02, CR-02). |
| Damage-token count | `[S02] MODEL` (`bestDamage`) | `[S06] RENDER` | Already a pure derivation with no consumer yet. Never stored. |
| Roster shape change (add/remove unit) | `[S05] OPS` | `[S03]` via `invalidate({structural:true})` | Ops own every mutation; only ops know the shape changed. |
| Value change (health, AP) | `[S05] OPS` (`nudge*` / `set*`) | — | The read-then-add must happen **inside** the commit mutator, atomically. |
| Token appearance edit | `[S05] OPS` (`setTokenStyle`) | `[S06]` picker UI | Writes `build`, therefore undoable and shareable (D-13). |
| Page structure from state | `[S06] RENDER.structure` | — | Rare. Wrapped in focus/scroll preservation. |
| Per-tick value reconcile | `[S06] RENDER.sync` | — | Never creates or destroys a node except the exact tokens that changed. |
| Event → op translation | `[S07] INTERACTIONS` | — | One event → exactly one `ops.*` call. **No arithmetic.** |
| Press-and-hold repeat scheduling | `[S07] INTERACTIONS` | — | Timer state is transient interaction state, never app state. |
| Keyboard-navigation flag | `[S07]` writes via `ops.setUi('kbdNav')` | `[S06]` reads it onto `body` | The `ui.kbdNav` key already ships with no reader. Phase 2 is its consumer. |
| Error containment | `[S08] BOOT.wrap` | — | Every Phase 2 listener goes through it. Do not invent a second boundary. |
| Automated ALLOC-07 proof | `tests/selftest-node.cjs` (DOM stub) | `[S09] SELFTEST` (DOM-gated suite) | The Node harness has no `document`; a browser-only suite must self-skip. |

---

## Standard Stack

**No packages are added. No packages exist.** The stack is the browser platform, constrained by the forbidden-pattern gate.

### Core — platform APIs this phase depends on

| API | Purpose | Status | Verified |
|---|---|---|---|
| `document.createElement` + `textContent` | All node/text creation | Universal | Already the file's only sink |
| `Element.replaceChildren()` | Emptying a token row without a markup sink | Baseline Widely Available | Gate-checked: permitted [VERIFIED: gate regex run] |
| `Element.closest(sel)` | Delegated dispatch from one root | Baseline Widely Available | [ASSUMED] |
| `PointerEvent` (`pointerdown`/`up`/`cancel`), `setPointerCapture` | Stepper press engine | Baseline Widely Available | [ASSUMED] |
| `MouseEvent.detail` | Distinguish keyboard-activated `click` (`0`) from pointer `click` (`≥1`) | UI Events | [CITED: css-tricks.com/when-a-click-is-not-just-a-click] — MEDIUM |
| `HTMLElement.focus({preventScroll:true})` | Focus restore without a scroll jump | Baseline Widely Available | [VERIFIED: ARCHITECTURE.md T18, real Chrome] |
| `HTMLInputElement.setSelectionRange` | Caret restore across a rebuild | Works on `type=text`, **not** on `type=number` | [CITED: html.spec.whatwg.org] |
| `CSS.escape` | Safe `[data-k="…"]` lookups | Baseline Widely Available | [ASSUMED] |
| `requestAnimationFrame` | Already wired inside `App.state.invalidate` | — | [VERIFIED: executed, 20 ops → 1 frame] |
| `clip-path: polygon()` | Triangle / hexagon token shapes | Baseline Widely Available | Gate-checked: permitted [VERIFIED] |
| `transform: rotate(45deg)` | Diamond token shape | Universal | Gate-checked: permitted [VERIFIED] |
| `color-mix()` | Deriving tints/borders from the four existing colour tokens | Baseline Widely Available 2023-05 | [CITED: STACK.md / web-features] |
| CSS Nesting | Readability of a growing `<style>` block | Baseline Widely Available 2026-06-11 | [CITED: STACK.md / web-features] |
| `@media (prefers-reduced-motion: reduce)` | Suppress the token entry animation | Universal | [ASSUMED] |

### Blocked by the repo's own gate — do not plan around these

| Technique | Blocked by | Verified |
|---|---|---|
| `document.createElementNS('http://www.w3.org/2000/svg', …)` | `{ label:'absolute URL', re:/https?:\/\// }` | **[VERIFIED: ran the gate's regexes]** |
| Hoisting the SVG namespace to a `const` | Same rule, same literal | **[VERIFIED]** |
| `clip-path: url(#tri)`, `mask-image: url(…)`, `cursor: url(…)` | `{ label:'CSS url() reference', re:/url\(/ }` | **[VERIFIED]** |
| `<link>`, `@import`, any `src=` attribute | Dedicated rules | [VERIFIED: existing gate] |

> Working around the SVG block by concatenating the namespace string is exactly the deliberate
> bypass `tests/selftest-node.cjs` documents itself as not catching. **Do not.** CSS shapes are
> smaller and sharper anyway.

### Alternatives considered

| Instead of | Could use | Tradeoff |
|---|---|---|
| Hand-written 5-line reconcile | **idiomorph** (3.3 KB, zero deps, has `restoreFocus` + `ignoreActiveValue`) | Genuinely viable under `file://`, but a generic morph cannot know that "adding one token should animate only the new token" — it matches by index and can reuse the wrong node. Also 3.3 KB of minified code in a file whose readability is a stated feature. Keep in the back pocket only if a faction-authoring surface ever appears. [CITED: ARCHITECTURE.md Pattern 3] |
| `pointerdown`-driven first step | `click`-only steppers | `click` fires only when `pointerdown` and `pointerup` land on the **same** element. Under rapid clicking on a node that any rebuild might touch, clicks are silently dropped — Pitfall 7's exact failure. `pointerdown` cannot be dropped this way. |
| `type="text"` + regex | `type="number"` | Spec-blocked for D-15. Also: `setSelectionRange` throws on `type=number`, spinner styling is inconsistent, and scroll-wheel-over-focused-field silently changes the value. |
| CSS shapes | Inline SVG | Gate-blocked (above). |
| `@media` breakpoints | Container queries | Desktop-projector target with a known viewport; containment's containing-block semantics changed in Chrome 129 and interact murkily with the two sticky elements D-03/D-04 require. Cost > payoff. |

**Installation:** none. The install step is double-clicking the file.

---

## Package Legitimacy Audit

**Not applicable — this phase installs zero packages.** `UX-04` forbids runtime dependencies and
`tests/selftest-node.cjs` uses Node built-ins only (`fs`, `path`, `vm`). No registry was consulted
because no package is recommended. If any future plan proposes one, the Package Legitimacy Gate
applies and the answer is almost certainly still "no" — CLAUDE.md's `## What NOT to Use` table
already rejects every candidate by name.

---

## 1. Two-Tier Render Mechanics (plan 02-01)

### The split, concretely

| | `render.structure(state)` | `render.sync(state)` |
|---|---|---|
| **Runs when** | Unit added/removed, undo, `state.restore()`, Phase 4 build-code load, setup↔fight switch | Every frame |
| **Builds** | Column interiors: unit cards, stepper buttons, inputs, remove buttons, **empty** token-row containers, add button, faction header | Nothing structural |
| **Never builds** | Token nodes | — |
| **Writes** | Whole subtree, replaced | `textContent`, `className`, `dataset`, token delta only |
| **Wrapper** | `withPreservedFocus(root, fn)` | none needed |
| **Cost** | ~6–20 ms with real CSS at this size [VERIFIED: ARCHITECTURE T12] | 0.042 ms/row [VERIFIED: T16] |

### What Phase 2 must add to the **static shell**, not to `structure()`

Delegated listeners bind once to roots that outlive every rebuild. `#app` and `#board` already
exist. Phase 2 adds, as static markup in `<body>`:

```
#app
├── #topbar        position:sticky; top:0            ← D-04 control cluster (undo now, reset/share P4, turn P5)
└── #board         display:grid                      ← the ONE delegation root
    ├── #col-cats      (structure() replaces its interior)
    ├── #strip         position:sticky; align-self:start   ← D-02 reserved, visibly empty in Phase 2
    └── #col-mechs     (structure() replaces its interior)
```

`#board-empty` (the current placeholder paragraph) is removed by the first `structure()` call, or
better, replaced by the columns. Bind **one listener per event type on `#app`** — the top bar's
undo button then needs no separate binding.

### `render.structure()` — the focus/scroll contract

The verified helper from `ARCHITECTURE.md` Pattern 4, unchanged, with two Phase-2 additions:

```js
// [S06] — Tier 1 wrapper. Both re-set steps are load-bearing:
//   scrollTop clamps to 0 when content shrinks, i.e. exactly when a unit is removed (T9)
//   focus() scrolls the page to the element unless preventScroll is passed (T18)
function withPreservedFocus(container, fn) {
  var a  = document.activeElement;
  var k  = (a && a.dataset) ? a.dataset.k : null;
  var ss = (a && a.selectionStart != null) ? a.selectionStart : null;
  var st = container.scrollTop;
  var wy = window.scrollY;

  fn();

  container.scrollTop = st;          // AFTER content exists
  window.scrollTo(0, wy);
  if (!k) { return; }
  var el = container.querySelector('[data-k="' + CSS.escape(k) + '"]');
  if (!el) { el = fallbackFocusTarget(k); }   // ADDITION 1 — see below
  if (!el) { return; }
  el.focus({ preventScroll: true });
  if (ss != null && el.setSelectionRange) { el.setSelectionRange(ss, ss); }
}
```

**Addition 1 — the removed-unit case.** The published helper returns silently when the keyed node
is gone. But the single most common Tier-1 trigger in this phase is *removing the unit whose remove
button currently has focus* — so the keyed node is gone **by construction**, and focus lands on
`<body>`. A student removing three units with the keyboard has to re-Tab from the top each time.
Prescribe a deterministic fallback: focus the **next** unit's remove button on that side, or if the
removed unit was last, that side's Add button. This is not covered by prior research and it is a
guaranteed failure without it. *(Confidence: HIGH that the gap exists — it follows from the helper's
own `if (!el) return`. MEDIUM on the exact fallback target being the right UX; it is a judgement.)*

**Addition 2 — the focus ring.** Programmatic `focus()` does **not** re-arm `:focus-visible`
([VERIFIED: ARCHITECTURE T19, real Chrome]), so the ring vanishes after a rebuild even though focus
is correct — which fails ROADMAP criterion 3 ("without losing … the keyboard focus ring") *literally*.
The mitigation is already half-shipped: `ui.kbdNav` exists in state with `ops.setUi('kbdNav', …)`
allowlisted and **no reader**. Phase 2 wires it:

- `[S07]`: on the first `keydown` that is Tab/arrow/Enter/Space, if `ui.kbdNav !== true`, call
  `ops.setUi('kbdNav', true)`. On `pointerdown`, if `ui.kbdNav !== false`, set it false.
  **Guard on the current value** — an unguarded call commits once per keystroke.
- `[S06] render.sync`: `document.body.dataset.kbd = state.ui.kbdNav ? '1' : '';`
- `[C0x]` CSS: `body[data-kbd="1"] :focus { outline:2px solid var(--accent); outline-offset:2px }`
  in addition to (not instead of) `:focus-visible`.

### `render.sync()` — the three rules that make D-19 true

```js
// RULE 1 — never write over the input the student is typing into.
//          This is the whole of D-19 in one line. (idiomorph calls it ignoreActiveValue.)
function setValue(el, n) {
  if (el !== document.activeElement) { el.value = String(n); }
}

// RULE 2 — grow and shrink by delta only. Node identity is the animation contract.
//          Verified: 10 -> 11 keeps all 10 original nodes and appends exactly 1.
function syncTokens(row, n, cls) {
  while (row.children.length > n) { row.lastElementChild.remove(); }
  while (row.children.length < n) { row.appendChild(makeToken(cls)); }
}

// RULE 3 — NEVER re-append or reorder an existing child. See Pitfall P-04.
```

### Keying: the `data-k` and `data-act` vocabularies

`render` owns `data-k` (identity, used by focus restore). `render` also writes `data-act` /
`data-side` / `data-unit` / `data-step`, which `[S07]` reads. Recommended, stable across Phases 3–5:

| Node | `data-k` | `data-act` | other |
|---|---|---|---|
| Unit health input | `cats/c1/maxHp` | `maxHp` | `data-side`, `data-unit` |
| Unit health − / + | `cats/c1/maxHp-` / `+` | `nudgeMaxHp` | `data-step="-1"` / `"1"` |
| Unit remove | `cats/c1/rm` | `removeUnit` | `data-side`, `data-unit` |
| Faction AP input | `cats/ap` | `ap` | `data-side` |
| Faction AP − / + | `cats/ap-` / `cats/ap+` | `nudgeAp` | `data-step` |
| Add unit | `cats/add` | `addUnit` | `data-side` |
| Undo (top bar) | `undo` | `undo` | — |
| Token-style picker open | `tok/hp` | `openTokenPicker` | `data-tok="hp"` |

### Who requests a structural frame

`commit()` calls `invalidate()` with no options — non-structural. `undo()` and `restore()` already
pass `{structural:true}`. Phase 2's rule, one line, in `[S05]` (owned by 02-02, so 02-01 does not
need to touch it):

> **Any op that changes the number of units, or replaces the `build` slice wholesale, must follow
> its `commit()` with `App.state.invalidate({ structural: true });`**

Do **not** make `render.sync` detect shape mismatch and escalate to `structure` — that inverts the
tier ownership and hides the trigger. Instead put the detection in `[S09] SELFTEST` as a DOM-gated
assertion: *after `addUnit`, the rendered card count equals `state.build[side].units.length`.*

---

## 2. ALLOC-07 — "Exactly Twenty" (plan 02-02)

This is the phase's only *measurable* criterion, and it is measurable because Phase 1 shipped the
instrument. Everything in this section was executed against the real artifact in this session.

### The instrument

`App.state.stats()` returns `{ commits, frames, undoDepth }` and is exported. Executed results:

| Probe | Result | Interpretation |
|---|---|---|
| 20 × `ops.setUnitMaxHp` | `commits` delta = **20** | Every input landed |
| — same run | `undoDepth` delta = **1** | D-10 coalescing works; the burst is one Ctrl+Z |
| — same run | final `maxHp` = **23** | No value lost or double-applied |
| 20 × `ops.setFactionAp` then `flush()` | `frames` delta = **1** | rAF coalescing does **not** swallow state, only paint |
| — same run | final `ap` = **20** | Confirmed |
| **20 synthetic `pointerdown` at a delegated root** | `commits` delta = **20**, `undoDepth` delta = **1** | End-to-end through `boot.wrap` → `ops.dispatch` |
| **One physical click, `pointerdown` AND `click` both bound** | **2 commits** | The double-fire, measured |

[VERIFIED: executed in Node against `cats-vs-mechs.html`, this session]

### The failure modes, ranked by likelihood

**F-1 — Double-firing (measured, 2× overcount).** If you bind `pointerdown` *and* `click` to the
same stepper you get two ops per press. This is the most likely way ALLOC-07 fails, and it fails
*upward* (20 clicks → 40 changes), which is just as wrong.

**The rule:** `pointerdown` drives the stepper. The `click` handler runs **only** when
`e.detail === 0` — which is how a keyboard-activated `click` (Enter/Space on a focused button)
presents, since `detail` is the click count and there was no click. Mouse clicks carry
`detail >= 1` and are ignored because `pointerdown` already handled them.
[CITED: css-tricks.com/when-a-click-is-not-just-a-click, MDN MouseEvent] — MEDIUM confidence, not
executed in a browser here. **Fallback if `detail` proves unreliable:** set a transient flag in the
`pointerdown` handler and clear it on the next macrotask; ignore `click` while the flag is up.
Prefer `detail` — it is stateless.

**F-2 — Dropped clicks from node destruction.** A `click` only fires when `pointerdown` and
`pointerup` land on the same element. Any rebuild between them silently eats the click.
`pointerdown` is immune. This is a second, independent reason to drive from `pointerdown`.
[CITED: PITFALLS.md Pitfall 7]

**F-3 — The ~300 ms double-tap delay. Already eliminated.** The delay applies only to touch on
pages without a viewport meta. `cats-vs-mechs.html` line 5 carries
`<meta name="viewport" content="width=device-width, initial-scale=1.0">`. No action needed.
[VERIFIED: read the file]

**F-4 — Event coalescing. Does not apply.** Coalescing is a `pointermove` mechanism
(`getCoalescedEvents`). Discrete events — `pointerdown`, `pointerup`, `keydown` — are never
coalesced. [ASSUMED, from the Pointer Events spec's scope]

**F-5 — rAF batching. Measured, and it is not a problem.** 20 commits produced 1 frame and the
final value was exactly right. `invalidate()` coalesces *paint*, not *state*. The only visible
consequence is that 20 tokens appear in one frame and all 20 play their entry animation together —
which is correct, they are all new.

**F-6 — Text selection from rapid clicking.** Drag-selecting labels while hammering `+`.
`user-select: none` on `.stepper`, `.tok-row` and the unit card chrome. [CITED: PITFALLS.md]

### The press-and-hold engine

```js
// [S07] — transient interaction state. Never touches App.state.
var hold = { id: 0, timer: null, t0: 0 };

// D-18: ~400 ms, then ~120 ms, speeding up to ~40 ms after about a second.
function holdDelay(elapsed) {
  if (elapsed < 400)  { return 400; }
  if (elapsed < 1000) { return 120; }
  return 40;
}
```

Use a **self-rescheduling `setTimeout`**, not `setInterval` — the period changes, and `setInterval`
would need a clear+set on every change anyway.

**Stop the ramp on all five of:** `pointerup`, `pointercancel`, `lostpointercapture`,
`window blur`, and `document visibilitychange`. Missing `pointercancel`/`lostpointercapture` is
the classic press-and-hold bug: a hold that leaves the window keeps incrementing forever, and the
first thing the student sees is health at 99. Call `setPointerCapture(e.pointerId)` on
`pointerdown` so the up/cancel is guaranteed to reach the same element.

**Sixth stop condition — the clamp.** `int()` clamps to `0..99`. At 40 ms/step a hold saturates in
about four seconds and then issues ~25 no-op commits per second, each doing a full JSON deep-clone
of state. Prescribe: `ops.nudge*` **returns `true` if the value changed, `false` if it did not**,
and `[S07]` stops the ramp on `false`. This keeps `[S07]` free of arithmetic (it never computes the
bound) while giving it the stop signal.

### Ramp ↔ undo-coalescing interaction (D-18 ↔ Phase 1 D-10)

Computed from D-18's own numbers against the shipped `COALESCE_MS = 500`:

| | |
|---|---|
| Largest gap between successive steps in a hold | **400 ms** |
| `COALESCE_MS` | 500 ms |
| Whole hold collapses to one undo entry | **Yes** |
| **Margin** | **100 ms** |
| Steps in the first second of a hold | 7 |
| Steps in the first three seconds | 47 |
| Human rapid clicking at ~8/s | 125 ms gaps — comfortably inside |

**Constraint for the planner:** D-18's 400 ms initial delay may not be raised above 500 ms without
also raising `COALESCE_MS` in `[S03]`, which plan 02-02 does not own. Write the 400 ms as a named
constant next to a comment saying so. [VERIFIED: arithmetic executed]

### How "exactly twenty" is verified with no browser

**It already works.** A ~60-line DOM stub (`createElement`, `getElementById`, `addEventListener`,
bubbling `dispatchEvent`, `children`/`classList`/`dataset`/`textContent`/`appendChild`/`remove`/
`lastElementChild`/`closest`/`querySelector`) was written and run in this session. Driving 20
synthetic `pointerdown` events at a delegated root through `App.boot.wrap` → `App.ops.dispatch`
produced exactly 20 commits and 1 undo entry.

**Prescription — extend `tests/selftest-node.cjs` with a `--- 5. interaction gate ---` section:**

1. Build the stub DOM (a new `tests/dom-stub.cjs`, or inline — inline keeps the "Node built-ins
   only, nothing to install" property that the harness header advertises).
2. Call `App.interactions.bind()` against it.
3. Assert: 20 `pointerdown` → `commits` delta exactly 20; `undoDepth` delta exactly 1.
4. Assert: one `pointerdown` + one `click{detail:1}` → **1** commit (the anti-double-fire gate).
   This is the assertion that would have caught the measured 2× bug.
5. Assert: one `click{detail:0}` alone → 1 commit (keyboard path still works).
6. Assert: `syncTokens(row, 10)` then `(row, 11)` preserves the first 10 node identities.
7. Assert: after `removeUnit`, `document.activeElement` is not `body`.

The in-file `#selftest` report should carry a **DOM-gated** mirror of 3–5 (`if (typeof document ===
'undefined') { t.info('interactions', 'skipped — no DOM'); return; }`) so the Node run stays green at
its current 81/81 baseline and the browser run gains real coverage. This is the pattern `01-REVIEW-FIX`
already used for its boot-path smoke probe, so it is not a new technique in this repo.

**Also keep the literal manual step** from PITFALLS.md: *click as fast as you can twenty times and
confirm the number moved twenty.* The automated gate proves the wiring; only a human proves the
browser agrees.

---

## 3. Delta-Typing Input (D-15, ALLOC-03) (plan 02-02)

### The element: `type="text"`, not `type="number"`

The HTML spec's **valid floating-point number** production is: *"optionally a U+002D HYPHEN-MINUS
character (-), one or both of … a series of one or more ASCII digits …"* — **no leading `+`**. The
spec explicitly notes that while the *parsing* algorithm skips a `+`, *"it is not conforming."*
The number state's value sanitisation algorithm is *"if the value of the element is not a valid
floating-point number, then set it to the empty string instead."*

So `+5` in a `type="number"` field reads back through `.value` as `""`. D-15 is unimplementable on
that element. [CITED: html.spec.whatwg.org, common-microsyntaxes + input] — HIGH confidence on the
spec text, MEDIUM on exact per-browser keystroke filtering (which varies and does not matter once
the element is `text`).

Three further reasons the same way: `setSelectionRange` throws on `type=number` (so caret restore
across a Tier-1 rebuild is impossible), the spinner is unstyleable and inconsistent, and a
scroll-wheel over a focused number field silently changes the value — which on a projector, during
a demo, looks like the tool inventing numbers.

**Prescribed markup:**

```html
<input class="num fld" type="text" inputmode="numeric" autocomplete="off"
       spellcheck="false" enterkeyhint="done"
       data-k="cats/c1/maxHp" data-act="maxHp" data-side="cats" data-unit="c1"
       aria-label="Cat 1 health">
```

`inputmode="numeric"` gets a numeric soft keyboard without any of the number state's semantics.
`.num` already exists in `[C01]` and gives `font-variant-numeric: tabular-nums` — essential, so the
field does not reflow while the ramp runs.

### The parser

`Number()`, `parseInt()` and `Math.trunc()` all fail here, and they fail *silently*. Measured:

| Input | `Number()` | `parseInt(s,10)` | Correct behaviour |
|---|---|---|---|
| `''` (student cleared the field) | **0** | `NaN` | **refuse** |
| `'  '` | **0** | `NaN` | **refuse** |
| `'1e3'` | **1000** | `1` | **refuse** |
| `'0x5'` | **5** | `0` | **refuse** |
| `'Infinity'` | **Infinity** | `NaN` | **refuse** |
| `'5.5'` | 5.5 | 5 | **refuse** (D-00b: integers only) |
| `'١٢'` (Arabic-Indic) | `NaN` | `NaN` | refuse |

The empty-string case is the dangerous one: a student who selects-all and hits Delete, then clicks
away, would commit **0 health** with `Number()`. `[S05]`'s `int()` already refuses `''` and `NaN`
(CR-01), but it refuses with `Expected a whole number for health, got null` — because
`JSON.stringify(NaN)` is `null`. That message reaches the error panel on a projector and means
nothing to a student. **The parser must reject at the boundary with its own message; `int()` is the
backstop, not the front line.** [VERIFIED: executed both]

**Prescribed parser — verified against 22 cases including all of the above:**

```js
// [S07] — D-15. A leading sign means delta; no sign means absolute.
// A regex, because Number() accepts '', '1e3', '0x5' and 'Infinity' as numbers.
// \d without the u flag is ASCII-only, which is what we want here.
// {1,3} caps at 999; [S05] int() then clamps to 0..99. Parse and clamp stay separate:
// '-12' from a current 3 legitimately yields -9, and clamping is not this function's job.
var FIELD = /^([+-]?)(\d{1,3})$/;

function parseField(raw) {
  var text = String(raw).trim();
  if (text === '') { return { ok: false, why: 'that field was empty' }; }
  var m = FIELD.exec(text);
  if (m === null) { return { ok: false, why: 'type a whole number, or +5 / -8 to adjust' }; }
  return { ok: true, kind: m[1] === '' ? 'absolute' : 'delta',
           n: (m[1] === '-' ? -1 : 1) * Number(m[2]) };
}
```

`[S07]` then routes — this is dispatch, not arithmetic:
`kind === 'absolute'` → `ops.setUnitMaxHp(side, id, n)`; `kind === 'delta'` → `ops.nudgeUnitMaxHp(side, id, n)`.

### Commit / revert semantics (D-14, D-16)

| Event | Behaviour |
|---|---|
| `focus` | Record `el.dataset.was = el.value`. Select all (so typing replaces, which is what a student expects from a value field). |
| `input` | **Nothing.** Do not commit per keystroke — `12` would pass through `1` and set health to 1. |
| `keydown` Enter | Parse + commit. Keep focus. |
| `keydown` Escape | `el.value = el.dataset.was`; do **not** commit; `preventDefault()`. |
| `keydown` ArrowUp/Down | `nudge` ±1, or ±5 with Shift (D-17). `preventDefault()` so the page does not scroll. Held arrows reuse the same ramp via `keydown`'s own repeat — **but the OS key-repeat rate is not D-18's ramp.** See below. |
| `blur` | Parse + commit. On a refusal, restore `dataset.was` silently rather than opening the error panel — a student clicking away from a half-typed value is not an error. |
| `render.sync` | `if (el !== document.activeElement) el.value = String(n)` — Rule 1 above. |

**Arrow-key repeat (D-17 + D-18).** OS key-repeat delivers `keydown` with `e.repeat === true` at
the platform's own rate, which is neither 400 ms nor 40 ms and differs per machine. Two options:

- **(a) Accept the OS rate.** Handle every `keydown` including repeats. Simplest; the rate is
  whatever the student's OS says. D-17 says "held arrows use the same ramp as press-and-hold", which
  this does not honour.
- **(b) Honour D-17 literally.** On `keydown` with `e.repeat === false`, fire one step and start the
  same ramp engine; on `keyup`, stop it; **ignore every `e.repeat === true` event**. One engine, one
  rate, consistent with the mouse. Slightly more code, matches the locked decision.

**Recommend (b)** — D-17 is locked and (b) is the only reading that satisfies it. Flag: the ramp
engine must therefore be keyed by *source* (`'pointer'` / `'key'`) so a stuck key and a stuck
pointer cannot both be running.

### Ctrl+Z inside a field — already correct, and Phase 2 is the first chance to confirm it

`[S08]` has a target guard (WR-04) that returns early for `INPUT`/`TEXTAREA`/`isContentEditable`, so
the browser's own text undo wins inside a field. It was verified only against a stub DOM because
Phase 1 had no editable field. **Phase 2 creates the first one — put "type into a health field, then
Ctrl+Z, and confirm only the text reverts" on the manual checklist.** [CITED: 01-REVIEW-FIX WR-04 note 2]

---

## 4. Token Vocabulary, Shapes and the Picker (plan 02-03)

### Shapes come from CSS. Inline SVG is unavailable.

Verified by running the gate's own regexes: `createElementNS('http://www.w3.org/2000/svg', …)` is
`BLOCKED  <- absolute URL`, and hoisting the namespace to a constant is blocked by the same rule.
`clip-path:url(#id)` and `mask-image:url(…)` are blocked by the `url(` rule. `clip-path:polygon()`,
`transform:rotate()`, `conic-gradient()`, `setAttribute('viewBox', …)` and `border-radius` all pass.

This is a constraint pointing the right way: CSS shapes are fewer nodes, resolution-independent,
and restyle from a single custom property.

| Shape id | CSS |
|---|---|
| `sq` (square) | *(nothing — the box itself)* |
| `rect` | `width: calc(var(--tok) * 1.7)` |
| `tri` | `clip-path: polygon(50% 0, 100% 100%, 0 100%)` |
| `dia` | `transform: rotate(45deg)` (glyph child counter-rotated `-45deg`) |
| `circ` | `border-radius: 50%` |
| `hex` | `clip-path: polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)` |

### Node shape — why the glyph is an absolutely-positioned child

D-10 warns that emoji metrics vary by OS and *"fight row compaction."* The fix removes the question
rather than measuring it: **give the glyph zero influence on layout.**

```
.tok            fixed --tok × --tok box, position:relative, background = the colour token
  └ .tok-s      the shape layer: clip-path / rotate applied HERE, not to .tok
  └ .tok-g      position:absolute; inset:0; display:grid; place-items:center
                font-size: calc(var(--tok) * .68); line-height:1;
                font-family:"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif
```

Because `.tok-g` is out of flow inside a fixed-size box, no emoji can change the box, the row width,
or the compaction threshold — on any OS, without measuring any of them. And because the shape layer
is a *separate* child, `clip-path` on a triangle does not clip the glyph, and `rotate(45deg)` on a
diamond is cancelled by `rotate(-45deg)` on the glyph.

**Only create `.tok-g` when the vocabulary entry actually has a glyph.** The shipped board has none,
so the default board is one node per token — the cheap path stays cheap. *(Confidence on the
zero-influence claim: HIGH — it follows from absolute positioning removing the element from flow.
Confidence that `.68 × --tok` is the right glyph size: LOW, a rehearsal question.)*

### The vocabulary as data (D-08, D-13)

Lives in `[S01] DATA` inside `DEFAULTS`, because D-13 puts it in `build` and `build` is
`App.data.defaults()`. This means `build` gains a `tokens` key — which **changes the `build` shape**,
so: Phase 4's codec must carry it (already scoped by D-12/SHARE-08), and `[S09]`'s existing
`build`-shape assertion needs updating.

```js
// [S01] — the token vocabulary. Shapes and colours are enumerated, not free strings:
// they become CSS class suffixes, and Phase 4 encodes them as one character each.
var SHAPES = ['sq', 'rect', 'tri', 'dia', 'circ', 'hex'];
var COLORS = ['green', 'gold', 'accent', 'coral', 'violet', 'accent-2', 'ink-dim'];

tokens: {
  hp:     { shape:'sq',   color:'green',   glyph:'' },   // board: green squares
  ap:     { shape:'tri',  color:'gold',    glyph:'' },   // board: yellow triangles
  shield: { shape:'sq',   color:'accent',  glyph:'' },   // board: blue squares
  dmg:    { shape:'dia',  color:'coral',   glyph:'' },   // board: red diamonds
  dead:   { shape:'rect', color:'ink-dim', glyph:'\u{1F480}' }  // D-09; Phase 5 uses it
}
```

`dead` ships now as vocabulary data with no renderer consumer — the same "lock the shape before the
mechanic arrives" pattern `[S03]` already used for `log: []` and `shield`. It is the concrete proof
that D-09 is satisfied without building anything of Phase 5's.

### The `setTokenStyle` op — allowlist on the key *and* the value

`s.build.tokens[key]` has exactly the prototype-pollution shape that CR-02 and WR-02 fixed twice
already. Follow the established precedent verbatim:

```js
function setTokenStyle(tokenId, patch) {
  if (TOKEN_IDS.indexOf(tokenId) === -1) { throw new Error('Unknown token type "' + String(tokenId) + '"'); }
  if (patch.shape !== undefined && SHAPES.indexOf(patch.shape) === -1) { throw new Error(...); }
  if (patch.color !== undefined && COLORS.indexOf(patch.color) === -1) { throw new Error(...); }
  if (patch.glyph !== undefined && !isAllowedGlyph(patch.glyph)) { throw new Error(...); }
  App.state.commit('token ' + tokenId, function (s) { /* assign the three fields explicitly */ });
}
```

Assign the three fields **explicitly**, never `Object.assign(target, patch)` — that is how a
`__proto__` key gets through an allowlist that only checked the values.

### Curated glyph set vs free text — recommend **curated**

The user left this open. Three measured reasons for curated:

1. **Phase 4 codec cost.** Measured `encodeURIComponent` lengths: a single emoji is **12 chars**,
   a variation-selector emoji (🛡️) is **21**, a ZWJ sequence is **30**. Five token types with
   free-text emoji is 60–150 chars against a 512-char design budget — 12–29% of the whole build code
   spent on decoration. A curated set of ≤32 glyphs indexes to **1 char** each.
2. **`build` stays integers-and-short-enums**, which is what `[S03]`'s banner promises and what
   `int()`/`requireSide`/`UI_KEYS` all assume. An arbitrary user string in `build` is a new class of
   value in the state contract.
3. **D-10 is enforceable.** With a curated set you can guarantee every offered glyph is a single
   code point that renders on Windows, macOS and Linux. With free text a student pastes a
   just-released emoji and it renders as a tofu box on the projector.

Recommend ~24–32 glyphs relevant to the workshop (❤ ⚡ 🛡 ⚔ 💀 🐱 🤖 🔥 …) plus an explicit "none".
[VERIFIED: encoding lengths measured this session] — the *recommendation* is a judgement (MEDIUM);
the *numbers* are HIGH.

### Compaction (D-20, D-21, D-22)

Threshold **12**. Below: `n` token nodes. At or above: exactly two children — a `.tok-count` span
whose `textContent` is `n + '×'`, and one `.tok` at normal size.

```js
function syncRow(row, n, tok) {
  var mode = (n >= 12) ? 'c' : 't';
  if (row.dataset.mode !== mode) {
    row.replaceChildren();          // permitted by the gate; not a markup sink
    row.dataset.mode = mode;        // D-22: crossing the threshold NEVER animates
  }
  if (mode === 'c') { /* count text + ensure exactly one .tok */ return; }
  var grew = n > row.children.length;
  while (row.children.length > n) { row.lastElementChild.remove(); }
  while (row.children.length < n) { row.appendChild(makeToken(tok, grew && row.children.length > 0)); }
}
```

The second argument to `makeToken` is the **animate** flag. A token gets the `tok--in` entry class
only when it is being appended to a row that already had tokens **in the same mode**. Consequences,
all of which ALLOC-07 and D-22 require:

- A Tier-1 rebuild repopulates from an empty row → nothing animates.
- Crossing the threshold in either direction → nothing animates, so a value oscillating at 11/12
  cannot strobe.
- Adding one health point → exactly one token animates.

Pair with `@media (prefers-reduced-motion: reduce) { .tok--in { animation: none } }`.

### Where the damage diamonds go — an open scope question, with a recommendation

ROADMAP success criterion 2 requires **red diamonds for damage** on screen in Phase 2, but damage
attaches to *actions* (`build[side].actions[].dmg`) and the action/effect cards are Phase 3's
REF-02. There is a real gap here.

**Recommendation:** render a single per-faction damage row in the faction header from
`App.model.bestDamage(faction)` — a pure derivation that exists today and has **no consumer at all**.
It satisfies the vocabulary requirement, needs no new op and no new state, and does not build any of
Phase 3's reference cards. Similarly, **blue shield squares** come from `unit.shield`, already in
`build`. Both are read-only in Phase 2 (`shield` has no writer until Phase 5 by WR-07's deliberate
scoping). See `## Open Questions` Q-2.

---

## 5. Projector Legibility as a Concrete Spec (UX-02, UX-05) (plan 02-01)

### Measured contrast — the course tokens, computed this session

WCAG relative-luminance ratios against the three surface colours already in `:root`:

| Token | on `--bg` #0e1014 | on `--panel` #191d26 | on `--panel-2` #1f2530 | Verdict |
|---|---|---|---|---|
| `--ink` #e8ebf2 | 15.96 | 14.13 | 12.89 | Text, anywhere |
| `--ink-dim` #a4adbe | 8.43 | 7.47 | 6.81 | Text, anywhere |
| **`--ink-faint` #6c7689** | **4.16** | **3.69** | **3.36** | **Passes 3:1 UI/large only. FAILS 4.5:1 normal text.** |
| `--green` #5bd99c (health) | 10.74 | 9.52 | 8.68 | Excellent |
| `--gold` #ffd166 (actions) | 13.21 | 11.70 | 10.67 | Excellent |
| `--accent` #5cc8ff (shield) | 10.12 | 8.96 | 8.17 | Excellent |
| `--coral` #ff8a5c (damage) | 8.20 | 7.26 | 6.62 | Excellent |
| **`--line` #2a3140** | **1.46** | **1.29** | **1.18** | **Invisible at distance. Decoration only.** |

[VERIFIED: computed from the actual `:root` hex values in `cats-vs-mechs.html`]

**Three consequences the planner must act on:**

1. **Zero new colours are needed.** All four board token colours already exist in `:root` and all
   four clear 7:1 on `--panel`. UX-05 is satisfiable without inventing a single hex.
   `--coral` is the artifact-specific token and is the closest thing to the board's red.
2. **`--ink-faint` may never carry a value or a label a student needs to read.** At 3.69:1 it is
   legal for large text and UI borders and illegal for anything smaller. Confine it to separators
   and decorative chrome.
3. **`--line` cannot be the sole indicator of anything.** This directly corrects the CONTEXT.md
   `<specifics>` suggestion that the remove control be *"a quiet outline rather than a filled
   destructive button."* A `--line` outline is at 1.29:1 — functionally invisible on a projector, so
   UX-02 would fail. Keep the *intent* (quiet, not inviting) and implement it with an `--ink-faint`
   border (3.69:1, clears SC 1.4.11's 3:1) plus `--ink-dim` glyph/text (7.47:1), reserving
   `--accent-2` for the hover/focus state. That is quiet and legible at once.

### Sizes

| Element | Spec | Basis |
|---|---|---|
| Numeric readouts (health, AP, counts) | **≥ 24px**, weight 600–700, `.num` for tabular figures | The values are what students read from the back; 24px is also WCAG's "large text" boundary, so 3:1 suffices for any colour used |
| Unit and faction labels | ≥ 18px | — |
| Anything ≤ 14px | Decoration only, never information | Pairs with the `--ink-faint` rule |
| Body base | Already 17px (siblings are 16) — keep or raise | The siblings are documents; this is a wall display [CITED: PITFALLS.md Pitfall 11] |
| **Token box `--tok`** | **22px**, gap 6px | Two anchors: SC 1.4.11 requires 3:1 for graphical objects that carry meaning (all four colours clear it 2–3×), and the row must be *countable* below the 12-token threshold. The exact px is a rehearsal question — see Open Questions Q-4 |
| **Stepper `+`/`−` hit target** | **44 × 44 CSS px** | WCAG 2.5.5 Target Size (Enhanced), AAA. The AA floor is 24×24 (SC 2.5.8). At 44 the ALLOC-07 stress test stops being a test of the student's aim [CITED: w3.org/WAI/WCAG22] |
| Per-unit remove target | ≥ 32 × 32, never below 24 | SC 2.5.8 minimum, sized up for D-06's persistent visibility without inviting a misclick |
| Focus ring | 2px solid `--accent` (8.96:1) + 2px offset | SC 1.4.11 covers focus indicators explicitly [CITED: w3.org/WAI/WCAG22 Understanding 1.4.11] |
| Column max width | `--maxw` is currently **1280px** | On a 1920-wide projector this wastes a third of the screen. See Open Questions Q-3 |

### "Nothing conveyed by hover alone" — the operational checklist

- The per-unit remove control is `opacity: 1` **always** (D-06). No `.unit:hover .rm { opacity: 1 }`
  rule may exist. Grep for it in review.
- `title=` tooltips are hover-only. They may repeat information, never carry it. Anything a student
  must know is on screen as text.
- Do not rely on `:focus-visible` alone — programmatic focus does not re-arm it (T19). Use the
  `body[data-kbd]` pairing from §1.
- Do not encode state in colour alone where a colour-blind student would lose it. The four token
  colours are already paired with four distinct shapes, which is exactly why D-10 insists the shape
  carries the meaning.
- The center strip (D-02) must be *visibly reserved*, not zero-width — a dashed `--ink-faint` border
  and a `--ink-dim` label at ≥18px reads as "something lands here" without pretending to be content.

### Explicitly **not** in Phase 2

The one-click "present mode" that PITFALLS.md Pitfall 11 recommends is **CONV-02, a v2 requirement**.
Do not build it. Size the defaults as though it will never exist.

---

## 6. CSS Techniques — What Actually Earns Its Place

| Technique | Verdict | Reasoning |
|---|---|---|
| **CSS Nesting** | **Yes — use it** | The `<style>` block goes from ~100 lines to several hundred this phase. Nesting keeps `.unit { & .tok-row { … } }` readable in a file whose readability is a stated deliverable. Baseline Widely Available 2026-06-11. Keep nesting ≤ 2 deep — deeper is the same specificity trap Sass taught everyone. |
| **`color-mix()`** | **Yes — narrowly** | Derives the *entire* token palette (border, dim/spent state, hover tint) from the four existing colour variables, so UX-05 holds without new hexes. **Constraint:** keep the token **fill** at the pure value so the measured 7–11:1 ratios hold; use `color-mix` for borders, tints and dimmed states only, and re-check contrast on any mixed value that carries meaning. |
| **`:focus-within`** | **Yes** | Highlighting the unit card containing the focused field. Does the job `:has()` would be reached for. |
| **`:has()`** | **No** | Every plausible use (`.unit:has(:focus)`, `#board:has(.fight)`) is expressible with a class the renderer already writes from state. The file's whole design is "render writes explicit classes from state"; a `:has()` rule creates a second, invisible source of truth in a file with no scoping and no linter. `:focus-within` covers the one genuine case. |
| **Container queries** | **No** | Desktop-projector target with a known viewport. `@media(max-width:760px)` is already in the file. `container-type` applies layout+style containment whose containing-block behaviour **changed in Chrome 129**, and the layout depends on two `position:sticky` elements (D-03, D-04) — the interaction is exactly the kind of thing that works in dev and breaks on the workshop machine. [CITED: MDN container-type; dev.to Chrome 129 change] Avoided rather than resolved. |
| **Subgrid** | **No** | Token rows live inside a unit card; there is no cross-card alignment requirement. |
| **`text-wrap: balance`** | Optional | Headings only. Pure progressive enhancement; degrades to nothing. |
| **`field-sizing: content`** | **No** | Firefox support is ~2 months old (2026-06-16), and the numeric field should have a *fixed* width anyway so the layout does not reflow while the ramp runs. |
| **CSS Grid for D-01** | **Yes** | `grid-template-columns: 1fr minmax(220px, 320px) 1fr` on `#board`. |

### The two sticky gotchas that will silently break D-03 and D-04

**G-1 — no ancestor may have `overflow` other than `visible`.** MDN: *"a sticky element sticks to
its nearest ancestor that has a scrolling mechanism (created when `overflow` is `hidden`, `scroll`,
`auto`, or `overlay`), even if that ancestor isn't the nearest actually scrolling ancestor."* The
realistic way this bites: someone adds `overflow:hidden` to `.card` or `#board` to clip a long token
row, and the center strip stops sticking with no error anywhere. **Write it as a comment above the
sticky rule.** [CITED: MDN CSS position] — HIGH.

**G-2 — a sticky grid item needs `align-self: start`.** Grid items stretch to the row height by
default, so `#strip` would already span the whole track and have nowhere to move — sticky appears to
do nothing. `align-self: start` gives it room. *(Confidence MEDIUM-HIGH: derived from the sticky
containing-block rules plus grid's default `stretch`; not executed in a browser here. It is a
well-known symptom and costs one declaration to be safe.)*

Also: **at least one inset property must be non-`auto`** or sticky degrades to `relative` (MDN,
verbatim). And the top bar's height must be a custom property so the strip stays in sync:

```css
:root { --topbar-h: 64px }
#topbar { position:sticky; top:0; z-index:20; height:var(--topbar-h) }
#strip  { position:sticky; top:var(--topbar-h); align-self:start }
```

### New `[CNN]` markers

`[C00]`, `[C01]`, `[C02]`, `[C08]`, `[C09]` are taken. **`[C03]`–`[C07]` are free** and match the
region names ARCHITECTURE.md already proposed. Suggested Phase 2 allocation:

| Marker | Region | Owner |
|---|---|---|
| `[C03]` | BOARD — top bar, columns, center strip, sticky rules | 02-01 |
| `[C04]` | UNIT — unit card, faction header, add/remove chrome | 02-01 |
| `[C05]` | TOKENS-VIZ — `.tok`, shapes, colours, compaction, entry animation | 02-03 |
| `[C06]` | STEPPER — buttons, press state, numeric field, focus ring | 02-01 (styles) / 02-02 (behaviour) |
| `[C07]` | PICKER — the token appearance picker | 02-03 |

Prefix every class with its region (`.brd-`, `.unit-`, `.tok-`, `.stp-`, `.pk-`) — Pitfall 12's
fake-scoping rule, and the only defence against a `.row` in the fight section restyling the
allocation section in Phase 5.

---

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---|---|---|---|
| Keeping the DOM in step with state | A diff/morph algorithm | The 5-line `syncTokens` grow/shrink | Verified to preserve node identity; a generic morph cannot know that only the *new* token should animate [CITED: ARCHITECTURE Pattern 3] |
| Restoring focus after a rebuild | Ad-hoc `el.focus()` | `withPreservedFocus` + `{preventScroll:true}` + `scrollTop` re-set **after** | Both gotchas measured in real Chrome (T9, T18); a bare `focus()` jumped the page 1,278 px |
| Parsing a numeric field | `Number()` / `parseInt()` / `Math.trunc()` | The `FIELD` regex | Measured: `''`→0, `'1e3'`→1000, `'0x5'`→5, `'Infinity'`→Infinity all pass silently |
| Repeating a stepper | `setInterval` | Self-rescheduling `setTimeout` + `setPointerCapture` + five stop conditions | The period changes; and `pointercancel`/`lostpointercapture` are the difference between a hold and a runaway |
| Icons and shapes | Inline SVG | CSS `clip-path:polygon()` / `rotate()` / `border-radius` | SVG is **gate-blocked** in this repo (verified). CSS is also less code and resolution-independent |
| Error containment | A second try/catch scheme | `App.boot.wrap(label, fn)` on every listener | One boundary, one panel, already shipped and tested |
| Render scheduling | A second rAF | `App.state.invalidate({structural?})` | Already coalescing; verified 20 ops → 1 frame |
| Reading a value then writing it | Arithmetic in `[S07]` | `ops.nudge*(side, id, delta)` | Atomic inside the commit mutator, so a 40 ms ramp cannot double-apply a stale read; and `[S07]`'s stated contract is "no arithmetic" |
| Counting whether inputs landed | A bespoke counter | `App.state.stats().commits` | Already exported; measured exact |
| Emptying a node | `innerHTML = ''` | `el.replaceChildren()` | `innerHTML` is gate-blocked; `replaceChildren` is not a markup sink and the gate permits it (verified) |

**Key insight:** almost every "don't hand-roll" here is *"the thing you need already shipped in
Phase 1 and has no consumer yet."* `stats()`, `boot.wrap`, `invalidate({structural})`,
`ui.kbdNav`, `model.bestDamage`, the `.num` class, `state.restore()` — Phase 2's job is largely to
be the first caller of surfaces that were deliberately built ahead of it. If a plan introduces a
parallel mechanism for any of these, that is the review flag.

---

## Common Pitfalls, Mapped to Plans

### P-01 — Binding both `pointerdown` and `click` (**02-02**)
**Measured: one physical click → two commits.** Fails ALLOC-07 upward.
**Rule:** `pointerdown` drives everything; the `click` handler body runs only when `e.detail === 0`.
**Gate:** the `pointerdown + click{detail:1}` → 1 commit assertion in the Node harness.

### P-02 — Driving steppers from `click` (**02-02**)
`click` requires `pointerdown` and `pointerup` on the same node; any rebuild between them eats it
silently. Undercounts, intermittently, which is the trust-destroying kind.
**Rule:** `pointerdown`. **Warning sign:** the count is off by one or two and only under speed.

### P-03 — Press-and-hold with no `pointercancel` / `lostpointercapture` stop (**02-02**)
A hold that leaves the window never stops. First symptom is health pinned at 99.
**Rule:** five stop conditions (`pointerup`, `pointercancel`, `lostpointercapture`, window blur,
visibilitychange) plus the sixth: stop when `ops.nudge*` returns `false` (clamped, no change).

### P-04 — Re-appending an existing token node (**02-01**)
`appendChild` on a node that is already a child is a **move** — remove plus insert. Removal from the
document cancels the element's CSS animations, and re-insertion starts them from the beginning.
Verified in this session's stub that the operation reorders (i.e. is a genuine remove+insert);
the animation-cancel semantics are spec-level [CITED: CSS Animations L1, animationcancel].
**Result:** every moved token replays its pop animation — the exact "token flicker" ALLOC-07 forbids,
and on a *game-feel course artifact* a correctness bug rather than polish.
**Rule:** the reconcile appends only nodes it created in the same call, and removes only from the
tail. Never reorder, never `row.append(...all)`, never `replaceChildren(...existingNodes)`.

### P-05 — Widening the hold ramp past the coalescing window (**02-02**)
The largest inter-step gap in D-18's ramp is 400 ms against `COALESCE_MS = 500` — **100 ms of
margin**. Raise the initial delay and a single hold becomes many undo entries, blowing the 30-deep
stack. `COALESCE_MS` lives in `[S03]`, which no Phase 2 plan owns.
**Rule:** name the 400 ms as a constant with a comment pointing at `App.state.COALESCE_MS`
(exported — assert the relationship in `[S09]`).

### P-06 — `render.sync` overwriting the field being typed into (**02-01**)
Any commit anywhere schedules a frame; that frame writes every input's value. A student half-way
through typing `+5` gets `3` back.
**Rule:** `if (el !== document.activeElement) el.value = String(n);` — this *is* D-19.

### P-07 — Focus lost when the focused unit is the one removed (**02-01 + 02-02**)
`withPreservedFocus` returns silently when the keyed node is gone, which is guaranteed for the
commonest Tier-1 trigger. Focus lands on `<body>`; keyboard removal of three units means three
re-Tabs from the top.
**Rule:** deterministic fallback target (next unit's remove button, else that side's Add button).
**Gate:** assert `document.activeElement !== body` after `removeUnit` in the stub harness.

### P-08 — Trusting `:focus-visible` after a programmatic focus (**02-01**)
It does not re-arm (T19), so the ring vanishes after a rebuild and ROADMAP criterion 3 fails
literally.
**Rule:** pair with `body[data-kbd="1"] :focus { … }`, driven by the already-shipped `ui.kbdNav`.

### P-09 — Animating the compaction threshold (**02-03**)
A value oscillating at 11↔12 strobes. Worse, using `display:none` to swap modes cancels animations
on every descendant [CITED: CSS Animations L1] and restarts them on the way back.
**Rule:** mode swap goes through `replaceChildren()` + a `data-mode` flag, and the entry class is
applied **only** on same-mode growth from a non-empty row.

### P-10 — An `overflow` on any ancestor of a sticky element (**02-01**)
Silent. No error, no warning, sticky just stops. The realistic cause is clipping a long token row.
**Rule:** comment above the sticky rule; keep clipping on `.tok-row` itself, never on an ancestor of
`#strip` or `#topbar`.

### P-11 — The acceptance-grep trap on comment prose (**all three plans**)
Two greps must stay at **zero** over `cats-vs-mechs.html`:
`grep -ci "counter\|slash < fly"` and `grep -ci "verdict\|balanced\|rating\|difficulty"`.
Both are currently 0 [VERIFIED: run this session]. Measured list of ordinary words that trip them:

| Trips | Because of | Safe alternative |
|---|---|---|
| **accelerating** ← *D-18's own wording* | `rating` | *accelerates*, *acceleration*, *speeds up* |
| generating, operating, iterating, integrating, separating, decorating, illustrating, demonstrating, migrating | `rating` | rephrase |
| **a counter** (as in a loop variable) | `counter` | *tally*, *index*, *n* |
| counterpart, encounter, encountered | `counter` | rephrase |
| unbalanced, rebalanced | `balanced` | *lopsided*, *retuned* |

`count`, `counting`, `recount`, `acceleration` and `accelerates` are **safe** [VERIFIED: substring
test run]. Phase 2 writes a lot of ramp-related comments, so `accelerating` is a live hazard in
exactly the section where it is most tempting. **Re-run both greps after writing any comment.**

### P-12 — Adding a second mutation entry point (**02-02, 02-03**)
`[S05]`'s banner says ops are "the only writer of state reachable from a student action — no
exceptions." The token picker is the tempting exception (it feels like a view preference). D-13 says
it is not. Route it through `ops.setTokenStyle` → `commit()`, not `commitUi()`.

### P-13 — `int()`'s NaN message reaching a projector (**02-02**)
`int(NaN, …)` reports `got null` (because `JSON.stringify(NaN) === 'null'`), which means nothing to a
student. Phase 2 is the first phase that can produce NaN, from a text field.
**Rule:** `parseField` refuses first with its own readable message; `int()` stays the backstop.

### P-14 — Section-ownership collision in one file (**all three plans**)
02-01 owns `[S06]` + the `<style>` block; 02-02 owns `[S07]` + additions to `[S05]`; 02-03 owns the
`[S01]` token-vocabulary additions + the picker. **Three plans, and the `<style>` block is shared
between 02-01 and 02-03** (`[C05]` TOKENS-VIZ and `[C07]` PICKER). Assign the `[CNN]` sub-regions
explicitly in the plans, or run 02-03 after 02-01. This is the single-file collision note from
ROADMAP.md and it now has a third plan in it.

---

## Code Examples

### The stepper handler, end to end

```js
// [S07] — ONE listener per event type, on the stable #app root.
// Every listener goes through App.boot.wrap, never bound raw.
function bind() {
  var root = document.getElementById('app');

  root.addEventListener('pointerdown', App.boot.wrap('stepper press', function (e) {
    var btn = e.target.closest('[data-act]');
    if (!btn) { return; }
    if (App.state.get().ui.kbdNav) { App.ops.setUi('kbdNav', false); }
    if (btn.setPointerCapture) { btn.setPointerCapture(e.pointerId); }
    fire(btn);                       // step 1 lands immediately
    startHold(btn);                  // D-18 ramp takes over after ~400 ms
  }));

  // Keyboard activation only. A mouse click carries detail >= 1 and was already
  // served by pointerdown above; running here too would double every press.
  root.addEventListener('click', App.boot.wrap('stepper key-press', function (e) {
    if (e.detail !== 0) { return; }
    var btn = e.target.closest('[data-act]');
    if (btn) { fire(btn); }
  }));

  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) {
    root.addEventListener(t, App.boot.wrap('stepper release', stopHold));
  });
  window.addEventListener('blur', App.boot.wrap('stepper release', stopHold));
  document.addEventListener('visibilitychange', App.boot.wrap('stepper release', stopHold));
}

// Dispatch only. No arithmetic — the read-then-add happens inside the op's mutator.
function fire(btn) {
  var d = btn.dataset;
  return App.ops.dispatch(d.act, {
    side: d.side, unitId: d.unit, delta: Number(d.step), value: Number(d.value)
  });
}
```

### The `nudge` op — arithmetic inside the commit, and a stop signal out

```js
// [S05] — atomic: the read and the write are the same mutator, so a 40 ms ramp
// can never double-apply a stale read. Returns whether anything moved, which is
// how [S07] knows to stop the ramp at the clamp bound instead of issuing 25
// no-op commits a second.
function nudgeUnitMaxHp(side, unitId, delta) {
  requireSide(side);
  if (!Number.isInteger(delta)) { throw new TypeError('nudge delta must be a whole number'); }
  var moved = false;
  App.state.commit('maxHp ' + side + '/' + unitId, function (s) {
    var u = findUnit(side, unitId, s.build[side].units);
    var next = int(u.maxHp + delta, 0, 99, 'max health');
    moved = (next !== u.maxHp);
    u.maxHp = next;
  });
  return moved;
}
```

### Roster add/remove, and the structural frame

```js
// [S05] — a shape change, so the frame must be structural. commit() alone
// schedules a sync-only frame and the new card would never be built.
function addUnit(side) {
  requireSide(side);
  App.state.commit('add unit ' + side, function (s) {
    var units = s.build[side].units;
    if (units.length >= 24) { throw new Error('That side is full'); }
    var last = units[units.length - 1];
    units.push({
      id: side.charAt(0) + nextUnitNumber(units, side),
      name: (side === 'cats' ? 'Cat ' : 'Mech ') + (units.length + 1),
      maxHp: last ? last.maxHp : 3,
      shield: last ? last.shield : 0
    });
  });
  App.state.invalidate({ structural: true });
}
```

> **Id allocation matters.** `data-k` and the fight slice both key on `id`. `'c' + (len+1)` collides
> after any remove — remove `c2` from `c1,c2,c3` and the next add produces a second `c3`. Use a
> max-suffix-plus-one scan, or a monotonic counter stored in `build`. A duplicate id makes
> `findUnit` return the wrong unit and `withPreservedFocus` refocus the wrong node, both silently.
> *(Confidence HIGH — it follows from `findUnit`'s first-match loop, which is in the shipped file.)*

---

## State of the Art

| Old approach | Current approach | When changed | Impact here |
|---|---|---|---|
| `innerHTML =` a container on every update | Two-tier render with a keyed reconcile | Long-settled; forbidden outright in this repo | The whole of §1 |
| `<input type="number">` for numeric entry | `type="text"` + `inputmode="numeric"` + explicit parse | Community consensus for years; spec-forced here by D-15 | §3 |
| `mousedown`/`mouseup`/`touchstart` triads | Unified `PointerEvent` + `setPointerCapture` | Pointer Events Baseline for years | §2 |
| Inline SVG icons | CSS shapes (`clip-path`, `rotate`) | Both current; **forced** here by the repo's own gate | §4 |
| `:focus` everywhere / no ring at all | `:focus-visible`, **plus** an explicit kbd flag for programmatic focus | `:focus-visible` Baseline; the re-arm gap is a known wart | §1 Addition 2, P-08 |
| `@media` breakpoints only | Container queries available | 2025-08-14 Widely Available | Deliberately **not** adopted — §6 |

**Deprecated / avoided:**
- `document.execCommand` — irrelevant until Phase 4's clipboard fallback.
- `field-sizing: content` — too new (2026-06-16) and the wrong behaviour for a stable layout.
- Anchor positioning and scroll-driven animations — not Baseline, Chrome-only.

---

## Environment Availability

| Dependency | Required by | Available | Version | Fallback |
|---|---|---|---|---|
| Node (dev-only test harness) | `tests/selftest-node.cjs` | ✓ | v24.15.0 | — |
| `node:vm`, `node:fs`, `node:path` | Same | ✓ | built-in | — |
| A real desktop browser | Manual rehearsal, `#selftest` report | ✗ (not automatable here) | — | **None.** Stub-DOM probes substitute for wiring, not for rendering |
| Playwright / any browser automation | Real-browser verification | ✗ | — | Node `vm` + hand-written DOM stub (proven this session) |
| Firefox / Safari | Cross-browser check | ✗ | — | Deferred; Phase 4 is where cross-browser becomes load-bearing |
| Any npm package | — | N/A | — | Forbidden by UX-04 |

**Missing with no fallback:** real-browser rendering behaviour. This is the phase's known gap and it
is structural, not fixable by this research. Every DOM-behaviour claim in this document is either
(a) executed against the real artifact in Node, (b) carried forward from `ARCHITECTURE.md`'s real
Chrome measurements (T1–T21), or (c) spec-cited and marked as such. Nothing is asserted from
intuition without a tag.

**Missing with fallback:** browser automation. The DOM stub is sufficient for the ALLOC-07 count
gate, the reconcile identity gate, the double-fire gate and the focus-fallback gate — proven by
building and running one.

---

## Security Domain

This is an offline, single-file, no-network, no-auth, no-storage artifact. Most ASVS categories do
not apply. The two that do, apply sharply because Phase 2 is the first phase to take **student
input**.

| ASVS category | Applies | Control in Phase 2 |
|---|---|---|
| V2 Authentication | No | No accounts, no backend |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | Single local user |
| **V5 Input Validation** | **Yes** | The `FIELD` regex at the `[S07]` boundary; `int()` / `requireSide` / `UI_KEYS` allowlists at the `[S05]` boundary; new `SHAPES` / `COLORS` / `TOKEN_IDS` allowlists for ALLOC-09 |
| V6 Cryptography | No | Nothing secret. FNV-1a checksum is Phase 4 and is not a security control |
| **V14 Configuration** | **Yes** | The forbidden-pattern gate in `tests/selftest-node.cjs` is the enforcement; keep it green and do not weaken a rule to admit a technique |

| Threat pattern | STRIDE | Mitigation |
|---|---|---|
| Prototype pollution via a caller-supplied key (`s.build.tokens['__proto__']`) | Tampering | Allowlist the **key** before indexing, exactly as CR-02/WR-02 did. Assign fields explicitly; never `Object.assign(target, patch)` |
| DOM XSS via a student-supplied glyph reaching a markup sink | Tampering | There is no markup sink; all text goes through `textContent`. The gate enforces it document-wide |
| Unbounded string into `build` via a free-text emoji field | DoS / Tampering | A curated glyph set (recommended in §4); if free text is chosen anyway, cap length and reject control characters and lone surrogates |
| An arbitrary string reaching `className` | Tampering | Shape/colour are enum ids mapped to a fixed class suffix, never interpolated raw |
| A student-supplied value reaching an error panel | Info disclosure | Already handled — the panel writes through `textContent` / `textarea.value` (Phase 1, threat T-01-02) |

---

## Plan Mapping

| | 02-01 render + style | 02-02 interactions + ops | 02-03 token vocabulary + picker |
|---|---|---|---|
| **Owns** | `[S06]`, `<style>` `[C03]`/`[C04]`/`[C06]`, static shell markup | `[S07]`, additions to `[S05]`, `tests/selftest-node.cjs` interaction gate | `[S01]` token additions, `[C05]`, `[C07]`, `[S05].setTokenStyle` |
| **Research sections** | §1, §5, §6 | §2, §3 | §4 |
| **Pitfalls** | P-04, P-06, P-07, P-08, P-10, P-11, P-14 | P-01, P-02, P-03, P-05, P-11, P-12, P-13, P-14 | P-09, P-11, P-12, P-14 |
| **Requirements** | ALLOC-04/05/06 (display), ALLOC-07 (focus/scroll/animation), UX-02, UX-05 | ALLOC-01/02/03/06 (behaviour), ALLOC-07 (count) | ALLOC-04 (vocabulary-as-data), ALLOC-09 |
| **Depends on** | Nothing new | 02-01's `data-act`/`data-k` vocabulary | 02-01's `.tok` CSS contract |
| **New gates** | Stub-DOM: focus not on `body` after `removeUnit`; card count matches state | Stub-DOM: 20 pointerdown → 20 commits; pointerdown+click{detail:1} → 1 commit; click{detail:0} → 1 commit | `[S09]`: every `DEFAULTS.tokens` entry has an allowlisted shape and colour; `setTokenStyle` refuses `__proto__` |

**Sequencing.** 02-01 and 02-02 can run in parallel *only* if the `data-act` / `data-k` vocabulary is
fixed in the plans first (§1's table is offered as that contract). 02-03 touches the same `<style>`
block as 02-01 — run it after 02-01, or partition `[CNN]` markers explicitly.

---

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|---|---|---|
| A1 | `MouseEvent.detail === 0` reliably identifies keyboard-activated clicks in the target browsers | §2 F-1 | Steppers double-fire on mouse clicks — the exact ALLOC-07 failure. **Mitigated:** the stub-DOM gate catches it; a transient-flag fallback is named |
| A2 | `Element.closest()`, `CSS.escape`, `setPointerCapture` behave as documented | §1, §2 | Delegation or focus restore silently misses. Low risk — all are long-Baseline |
| A3 | Discrete pointer events are never coalesced | §2 F-4 | Inputs dropped under speed. Low risk — coalescing is a `pointermove` mechanism |
| A4 | `align-self: start` is required for a sticky grid item | §6 G-2 | The center strip does not stick (D-03). Costs one declaration to be safe regardless |
| A5 | `.68 × --tok` is a readable glyph size, and `--tok: 22px` is countable at projector distance | §4, §5 | Illegible from the back row. **Only a rehearsal answers this** |
| A6 | A curated glyph set is the right call for ALLOC-09 | §4 | Free-text was explicitly left open by the user; the codec-cost numbers are measured but the choice is theirs |
| A7 | Rendering `bestDamage` as per-faction red diamonds satisfies ROADMAP criterion 2 without trespassing on Phase 3 | §4 | Either the criterion is missed, or Phase 3 finds its work half-done. See Q-2 |
| A8 | `@media (prefers-reduced-motion: reduce)` is worth wiring for a workshop artifact | §4 | Trivial either way |

---

## Open Questions

> **Status: all resolved during planning.** Every question below carries a `RESOLVED` marker
> naming the plan that decided it and the decision taken. The full reasoning lives in that
> plan's `<open_questions_resolved>` block; the one-line summary here exists so a reader
> consulting this document alone does not mistake a settled question for an open one.

**Q-1 — Does `shield` get a stepper in Phase 2?**
*What we know:* `unit.shield` is in `build`, is rendered as blue squares by ALLOC-04, and has **no
writer** — WR-07 deliberately scoped `setUnitShield` to Phase 5. ALLOC-01 names health only.
*What's unclear:* a student building an asymmetric faction may reasonably expect to allocate shield,
and "3 shield per Mech" is a board number they might want to change.
*Recommendation:* render read-only in Phase 2. If the planner disagrees, the op is a five-line clone
of `setUnitMaxHp` and belongs to 02-02 — but note that WR-07's fix report explicitly flagged this
split for a human decision and it has not been made.

**RESOLVED — plan 02-02 (Task 1).** Against the recommendation: `shield` **does** get a stepper,
on the `build` slice only. `setUnitShield` / `nudgeUnitShield` write
`state.build[side].units[].shield`; the `fight` slice's own `shield` copy still has no writer and
Phase 5 (plan 05-01) still owns it under the future name `setFightShield`. Reasoning: `unitEhp`
is literally `maxHp + shield`, so an allocation surface that edits only half of a unit's
durability cannot express the asymmetry the artifact exists to teach, and a stat that is visible
but uneditable is a workshop trap.

**Q-2 — Where do the red damage diamonds live? (blocks 02-01's faction header)**
*What we know:* ROADMAP criterion 2 requires them on screen in Phase 2; damage attaches to actions;
the action/effect cards are Phase 3's REF-02; `App.model.bestDamage()` exists with no consumer.
*What's unclear:* whether "the faction's best damage as diamonds in the header" reads as the board's
vocabulary, or whether the criterion wants per-action rows (which is Phase 3's surface).
*Recommendation:* per-faction, from `bestDamage`. Cheapest thing that satisfies the criterion and
leaves Phase 3's work untouched.

**RESOLVED — plan 02-01 (Task 3).** As recommended: a read-only per-faction damage row in the
faction header, rendered from `App.model.bestDamage(state.build[side])`. No new state, no new op,
no new derivation; `bestDamage` was already shipped with no consumer. Read-only in Phase 2 (no
stepper), labelled with the plain word `damage` — never a score, a grade or a judgement, per
PROJ-06 and the comment-prose grep gate. Phase 3's per-action cards stay entirely unbuilt.

**Q-3 — Should `--maxw` rise for the board?**
*What we know:* it is 1280px; the siblings are documents at 980px; a workshop projector is typically
1920 wide; D-01 wants both columns fully visible.
*What's unclear:* whether raising it breaks the "reads as a sibling artifact" test (UX-05).
*Recommendation:* keep `--maxw` for the shell and the self-test report; give `#board` its own wider
bound (`--boardw: 1600px`). Two variables, no conflict with UX-05.

**RESOLVED — plan 02-01 (Task 1).** As recommended. `--maxw` stays at 1280px for `.shell`;
`#board` gets `--boardw: 1600px` and escapes the shell measure with
`width:min(var(--boardw), calc(100vw - 44px))` plus a matching negative-free margin — never a
`transform`, which would break the sticky `#topbar` and `#strip`.

**Q-4 — Is `--tok: 22px` countable at the back of a room?**
*What we know:* all four colours clear WCAG 1.4.11 at 7–11:1; below the 12-token threshold a student
must be able to *count* the row, not merely see it.
*What's unclear:* the actual angular size at 4–6 m.
*Recommendation:* ship 22px as a custom property so a rehearsal can change one number. Put "view it
from the back of the room" on the phase's manual checklist — PITFALLS.md Pitfall 11 says no amount
of research substitutes for it, and that is correct.

**RESOLVED — plan 02-01 (Task 1) ships the dial; plan 02-03 (Task 3) turns it.** `--tok: 22px`
and `--tok-gap: 6px` live in `[C00]` with a comment naming them as the projector-rehearsal dial,
and no JavaScript may hardcode either number. Check 11 of 02-03's blocking human-verify
checkpoint is the rehearsal: it records the display used, the viewing distance, whether a row of
seven was countable, and the final `--tok` value. Raising `--tok` is the one change that
checkpoint is permitted to make.

**Q-5 — IN-01 from the Phase 1 review is now live.**
*What we know:* `99` is a magic number in three places, and fight HP is clamped to `99` rather than
to the unit's own `maxHp`. The fix report called it *"a real render-correctness issue for Phase 2,
not just tidiness"* and left it out of scope.
*What's unclear:* whether Phase 2 fixes it (it touches `[S05]`, which 02-02 owns) or Phase 5 does.
*Recommendation:* 02-02 hoists `99` to a named constant while it is already editing `[S05]`. Leave
the `maxHp`-vs-`99` fight clamp to Phase 5, which owns fight HP.

**RESOLVED — plan 02-02 (Task 1).** As recommended, in both halves. `[S05]` gains
`MAX_ALLOC = 99`, `MIN_UNITS = 1` and `MAX_UNITS = 24` as exported module constants and every
`int(..., 0, 99, ...)` call site uses `MAX_ALLOC` — a pure rename, no behaviour change. The
`setUnitHp` fight clamp stays at `MAX_ALLOC` rather than the unit's own `maxHp`, deliberately and
with a comment saying so: it is a fight-semantics decision, Phase 5 owns fight HP, and Phase 2
has no fight surface to test a change on. 02-02's SUMMARY records the deferral so it does not
evaporate.

**Q-6 — Arrow-key repeat versus the OS key-repeat rate (raised in §3, not numbered there).**
*What we know:* D-17 says held arrows use the same ramp as press-and-hold; the OS repeat rate is
neither 400ms nor 40ms and differs per machine.
**RESOLVED — plan 02-02 (Task 2).** Option (b) from §3: honour D-17 literally. On `keydown` with
`e.repeat === false`, fire one step and start the same ramp engine the pointer uses; on `keyup`,
stop it; ignore every `e.repeat === true` event. The ramp is keyed by source (`'pointer'` /
`'key'`) so a stuck key and a stuck pointer cannot both be running.

**Q-7 — Curated glyph set versus free-text emoji entry (left open by 02-CONTEXT.md's
`<deferred>` list).**
*What we know:* `encodeURIComponent` lengths measured in §4 — a plain emoji is 12 characters, a
variation-selector emoji 21, a ZWJ sequence 30, against SHARE-04's 512-character budget.
**RESOLVED — plan 02-03 (Task 1): curated.** `App.data.GLYPHS` is an ordered, index-stable set of
`''` plus 24–32 single-code-point emoji, and Phase 4's codec will encode a glyph as its index in
that array — one character each. Free text would also put an unbounded student string into a
`build` contract that `int()`, `requireSide` and `UI_KEYS` all assume is integers and short
enums, and would make D-10's cross-platform rendering guarantee unenforceable. If free text is
ever wanted it belongs behind a Phase 4 decision about codec cost.

---

## What Remains Unverified

Stated plainly, because a research document that hides its gaps is worse than one that has none.

1. **No browser ran in this session.** There is no Playwright and no headless browser in this repo.
   Everything DOM-behavioural is either executed against a hand-written stub (which proves *wiring*,
   never *rendering*), carried from `ARCHITECTURE.md`'s real-Chrome T1–T21 measurements, or
   spec-cited.
2. **CSS animation cancel-on-removal was not observed here.** The stub confirmed that re-appending
   an existing child is a genuine remove-plus-insert; that this cancels and restarts a CSS animation
   is spec-cited (CSS Animations L1 `animationcancel`, and the `display:none` termination clause) and
   corroborated by ARCHITECTURE T10. Confidence HIGH, basis CITED not VERIFIED.
3. **`MouseEvent.detail === 0` for keyboard clicks** rests on MDN and CSS-Tricks, not on execution.
   It is the load-bearing detail of the anti-double-fire rule, so a fallback is named.
4. **Emoji metrics were never measured in px.** They cannot be, without a browser. The prescription
   sidesteps measurement entirely by putting the glyph out of flow — which is why that design was
   chosen over "pick a size that fits."
5. **`position: sticky` with `align-self: start` in a grid** — derived, not observed.
6. **Container-query containing-block behaviour after Chrome 129** — read about, not resolved.
   Container queries are avoided rather than understood.
7. **Projector legibility.** The contrast numbers are exact arithmetic on the real hex values. The
   *sizes* are anchored to WCAG target-size and large-text boundaries, which are accessibility floors,
   not projector guarantees. Only a rehearsal on the actual display answers this.
8. **Firefox and Safari** were not considered beyond Baseline status, consistent with the project's
   stated modern-desktop target.

---

## Sources

### Primary (HIGH confidence — executed or measured in this session)
- **`cats-vs-mechs.html` loaded into `node:vm`** — 20 ops → 20 commits / 1 undo entry / 1 frame;
  double-fire measured at 2 commits; `int()` refusals and clamp bounds; `NaN` reported as `null`.
- **Hand-written DOM stub + delegated root** — 20 synthetic `pointerdown` → 20 commits;
  `syncTokens` node-identity preservation on grow and shrink; re-append is a move.
- **`tests/selftest-node.cjs` forbidden-pattern regexes, run against 19 candidate techniques** —
  SVG `createElementNS` and every `url()` form BLOCKED; `clip-path:polygon`, `rotate`,
  `replaceChildren`, `:has()`, nesting, container queries, `color-mix`, emoji literals all permitted.
- **WCAG relative-luminance computation** over the actual `:root` tokens — full table in §5.
- **D-18 ramp arithmetic** vs the shipped `COALESCE_MS = 500` — 400 ms max gap, 100 ms margin.
- **Emoji encoding cost** — 12 / 21 / 30 `encodeURIComponent` chars for plain / VS16 / ZWJ.
- **Acceptance-grep substring test** — `accelerating`, `a counter`, `unbalanced` and 8 others trip;
  `count`, `counting`, `acceleration`, `accelerates` are safe.
- **Baseline gate re-run** — `node tests/selftest-node.cjs` exits 0 at **81/81**, both zero-hit greps
  at 0.

### Primary (HIGH confidence — inherited from prior real-browser measurement)
- `.planning/research/ARCHITECTURE.md` Patterns 3–5 and tests T1, T2, T4, T7, T9, T10, T12, T13,
  T15, T16, T17, T18, T19 — Chrome 151, from `file://`.
- `.planning/research/PITFALLS.md` Pitfalls 7, 11, 12 and the UX Pitfalls table.
- `.planning/research/STACK.md` / CLAUDE.md — the `file://` capability matrix and the CSS Baseline
  table.

### Secondary (MEDIUM–HIGH — official specification text)
- [HTML Standard — valid floating-point number](https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-floating-point-number) — no leading `+`; a `+` is explicitly "not conforming".
- [HTML Standard — input type=number](https://html.spec.whatwg.org/multipage/input.html#number-state-(type=number)) — value sanitisation sets a non-conforming value to the empty string.
- [MDN — CSS `position`](https://developer.mozilla.org/en-US/docs/Web/CSS/position) — sticky sticks to the nearest ancestor with a scrolling mechanism; at least one inset must be non-`auto`.
- [CSS Animations Level 1 — events](https://drafts.csswg.org/css-animations-1/#events) — `animationcancel` on removal / `display:none`; re-display starts animations anew.
- [W3C — Understanding SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) — 3:1 for UI components, graphical objects and focus indicators.
- [W3C — Understanding SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) — 24×24 CSS px, AA, with the spacing exception.
- [MDN — `container-type`](https://developer.mozilla.org/en-US/docs/Web/CSS/container-type) and [Chrome 129 container-query containing-block change](https://dev.to/michaelcharles/chrome-129s-container-query-change-2i77).

### Tertiary (MEDIUM — community, corroborated but not executed)
- [CSS-Tricks — When a Click is Not Just a Click](https://css-tricks.com/when-a-click-is-not-just-a-click/) — `detail === 0` for keyboard-activated clicks.
- [MDN — MouseEvent](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent) — `detail` is the click count.
- [CSS-Tricks — Restart CSS Animation](https://css-tricks.com/restart-css-animation/) — removal + re-insertion as the canonical *deliberate* restart technique, i.e. confirmation that it restarts.
- [idiomorph](https://github.com/bigskysoftware/idiomorph) — `restoreFocus` / `ignoreActiveValue` as prior art for the two focus rules in §1.

---

## Metadata

**Confidence breakdown:**
- Two-tier render mechanics — **HIGH.** Prior real-Chrome measurement plus reconcile identity re-executed here. The removed-unit focus gap (P-07) is a HIGH-confidence gap with a MEDIUM-confidence remedy.
- ALLOC-07 mechanics and verification path — **HIGH.** Every number executed against the shipped artifact; the anti-double-fire rule rests on one MEDIUM citation with a named fallback.
- Delta-typing input — **HIGH.** Spec-cited for the element choice; parser executed against 22 cases.
- Token vocabulary and shapes — **HIGH** on the SVG block and the CSS shape set (gate executed); **MEDIUM** on the glyph-as-absolute-child layout (derived, not rendered); **HIGH** on the codec-cost numbers.
- Projector legibility — **HIGH** on contrast (exact arithmetic on real values) and on the WCAG anchors; **LOW** on the specific px sizes, which only a rehearsal settles.
- CSS technique verdicts — **MEDIUM.** Baseline statuses are HIGH; the "does this earn its place" judgements are reasoned opinion, stated as such.
- Pitfalls — **HIGH.** P-01, P-04, P-05, P-11 and P-13 were each reproduced or computed here.

**Research date:** 2026-08-27
**Valid until:** ~2026-09-26 (30 days). Nothing here depends on a fast-moving dependency; the only
time-sensitive item is the browser Baseline table, which moves in one direction.
