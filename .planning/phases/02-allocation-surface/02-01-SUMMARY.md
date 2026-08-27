---
phase: 02-allocation-surface
plan: 01
subsystem: ui
tags: [vanilla-js, css-grid, position-sticky, clip-path, dom-reconcile, focus-management, wcag]

# Dependency graph
requires:
  - phase: 01-foundation-data-state-funnel-undo
    provides: "App.state commit/undo/invalidate funnel, App.data.DEFAULTS deep freeze, App.model pure derivations, App.boot error boundary, [S06]/[S07] declared stubs, ui.kbdNav with a writer and no reader"
provides:
  - "[S06] RENDER as a namespaced IIFE with both tiers implemented: structure() and sync()"
  - "withPreservedFocus — window scroll, container scroll, focused data-k, caret, and a deterministic fallback when the focused node was the one removed"
  - "Keyed token reconcile that grows and shrinks by delta and never re-appends"
  - "Compaction at App.render.COMPACT_AT = 12, animating nothing on either crossing"
  - "App.data.DEFAULTS.tokens — the token vocabulary as data, plus SHAPES / COLORS / TOKEN_IDS frozen allowlists"
  - "Static shell roots #topbar, #col-cats, #strip, #col-mechs that outlive every rebuild"
  - "The data-k / data-act attribute contract that plan 02-02 reads"
  - "[C03] BOARD, [C04] UNIT, [C05] TOKENS-VIZ, [C06] STEPPER style blocks"
  - "[S09.4] SUITE: render contract, DOM-gated"
affects: [02-02-interactions, 02-03-token-picker, 03-projection-reference, 04-serialization, 05-fight-loop]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Two-tier render: rare structural rebuild wrapped in withPreservedFocus, per-frame keyed reconcile that never destroys the node under the cursor"
    - "data-amt names the quantity a node shows, so sync() reads state from the page's own keys instead of a second walk of the roster"
    - "CSS-only token shapes (clip-path:polygon, transform:rotate, border-radius) because the SVG namespace is gate-blocked"
    - "Three-layer token node: box carries size, .tok-s carries the shape, .tok-g is out of flow so emoji metrics cannot move anything"
    - "Enum ids checked against exported allowlists before they reach className"
    - "CSS nesting at depth 2 with region class prefixes (.brd-, .unit-, .tok-, .stp-)"

key-files:
  created: []
  modified:
    - "cats-vs-mechs.html — <body> shell, [C00] additions, [C03]/[C04]/[C05]/[C06], [S01] DATA, [S06] RENDER, [S09.1], [S09.3], [S09.4]"

key-decisions:
  - "Q-2 resolved: the red damage diamonds are a read-only per-faction row driven by App.model.bestDamage, which until now had no consumer at all. No new state, no new op, no new derivation, and none of Phase 3's action cards."
  - "Q-3 resolved: --maxw stays at 1280px for .shell; a separate --boardw:1600px applies to #board only."
  - "Q-4 resolved: --tok:22px and --tok-gap:6px ship as the named projector-rehearsal dial. No JavaScript hardcodes either number."
  - "The remove control departs from 02-CONTEXT's 'quiet outline' wording: --line is 1.29:1 against --panel and would fail UX-02. It uses --ink-faint (3.69:1) border with --ink-dim (7.47:1) glyph, --accent-2 on hover and focus."
  - "The four token-appearance buttons are static markup in #topbar, not rendered, because a rendered one would produce a duplicate data-k per unit and silently break focus restore."
  - "syncRow treats a vocabulary change exactly like a mode change: empty the row first, so a restyle animates nothing either."

patterns-established:
  - "Pattern: structure() builds every .tok-row empty and sync() fills it — the rule that makes 'a rebuild animates nothing' true by construction rather than by care"
  - "Pattern: the entry-pop flag is read once, before the grow/shrink loops, so it describes the row as it arrived"
  - "Pattern: exported frozen allowlists (SHAPES/COLORS/TOKEN_IDS) so [S05] and [S09] assert against constants, matching [S03]'s UNDO_LIMIT precedent"

requirements-completed: [ALLOC-04, ALLOC-05, ALLOC-07, UX-02, UX-05]

# Metrics
duration: 42min
completed: 2026-08-27
---

# Phase 2 Plan 01: Allocation Board Render Surface Summary

**The board is on screen: two faction columns drawn entirely from `state.build`, in the workshop's own token vocabulary, behind a two-tier renderer that preserves focus, caret, scroll and animation identity through a structural rebuild.**

## Performance

- **Duration:** ~42 min
- **Tasks:** 3 of 3
- **Files modified:** 1 (`cats-vs-mechs.html`, 1,568 → 2,402 lines)
- **Assertions:** 81 → **91** in the Node harness, 0 failed. In a browser the DOM-gated
  `[S09.4]` rows replace the single skip row, so `#selftest` reports **96**.

## Accomplishments

### Task 1 — shell roots and the legibility spec (`403becb`)

`<body>` gained `#topbar` (sticky, holding Undo and the four token-appearance buttons) and
four static children of `#board`: `#col-cats`, `#strip`, `#col-mechs`, and the existing
`#board-empty`, which was kept rather than deleted because `[S08] boot.start()`'s
`#throwhandler` rehearsal reads it by id.

`[C00]` gained `--boardw`, `--topbar-h`, `--tok`, `--tok-gap`. **No new hex colour was
introduced** — research §5 measured that all four board token colours already clear 7:1 on
`--panel`.

`[C03] BOARD`, `[C04] UNIT` and `[C06] STEPPER` were added, carrying the research §5 sizes
(values ≥ 24px/700, labels ≥ 18px, stepper targets 44×44, remove target ≥ 32×32) and both
halves of the focus ring. The two sticky gotchas that fail silently — an `overflow` on any
ancestor, and a stretched grid item having nowhere to move — are written as comments directly
above the rules they would break.

### Task 2 — the vocabulary as data (`8d58cf2`)

`[S01]` gained frozen `SHAPES` / `COLORS` / `TOKEN_IDS` allowlists (exported) and
`DEFAULTS.tokens` as the last `build` key, so it inherits the deep freeze. The four board types
read literally; `dead` ships as vocabulary with no renderer consumer, proving D-09 without
building any of Phase 5.

The shipped assertion that this breaks — `cats-vs-mechs.html:1392`, `'the board has its three
build keys'` — was fixed **in the same commit that broke it**, and its label no longer encodes
a number that will move again in Phase 4.

`[C05] TOKENS-VIZ` draws all six shapes from CSS. A comment above the shape rules records why
inline SVG is unavailable, so the next reader does not spend an afternoon rediscovering it.

### Task 3 — both render tiers (`ebbe25b`)

`[S06]` became a namespaced IIFE. Both entry points open with
`if (typeof document === 'undefined') { return; }` — the single line that keeps the Node gate
green now that render is no longer a no-op.

## The `data-k` / `data-act` contract, as actually written

Plan 02-02 depends on this table. Every node listed is created by `[S06]`; `data-amt` is an
addition to the planned contract (see Deviations).

| Node | `data-k` | `data-act` | `data-amt` | other dataset |
|---|---|---|---|---|
| Unit health input | `{side}/{unitId}/maxHp` | `maxHp` | `hp` | `side`, `unit` |
| Unit health − | `{side}/{unitId}/maxHp-` | `nudgeMaxHp` | — | `side`, `unit`, `step="-1"` |
| Unit health + | `{side}/{unitId}/maxHp+` | `nudgeMaxHp` | — | `side`, `unit`, `step="1"` |
| Unit shield input | `{side}/{unitId}/shield` | `shield` | `shield` | `side`, `unit` |
| Unit shield − | `{side}/{unitId}/shield-` | `nudgeShield` | — | `side`, `unit`, `step="-1"` |
| Unit shield + | `{side}/{unitId}/shield+` | `nudgeShield` | — | `side`, `unit`, `step="1"` |
| Unit remove | `{side}/{unitId}/rm` | `removeUnit` | — | `side`, `unit` |
| Faction AP input | `{side}/ap` | `ap` | `ap` | `side` |
| Faction AP − | `{side}/ap-` | `nudgeAp` | — | `side`, `step="-1"` |
| Faction AP + | `{side}/ap+` | `nudgeAp` | — | `side`, `step="1"` |
| Add unit | `{side}/add` | `addUnit` | — | `side` |
| Undo (static, `#topbar`) | `undo` | `undo` | — | — |
| Token appearance × 4 (static, `#topbar`) | `tok/{tokenId}` | `openTokenPicker` | — | `tok` |

Non-interactive nodes `sync()` drives, for completeness:

| Node | class | `data-amt` | other |
|---|---|---|---|
| Token row | `.tok-row` | `hp` / `shield` / `ap` / `dmg` | `side`, `unit`; `mode` and `sig` written by `sync` |
| Faction readout | `.brd-value` | `dmg` / `ehp` | `side` |

`openTokenPicker` has **no** case in `[S05] dispatch` and must never get one — verified at 0.

## Style blocks added

| Marker | Contents |
|---|---|
| `[C00]` (additions) | `--boardw`, `--topbar-h`, `--tok`, `--tok-gap` |
| `[C03] BOARD` | sticky top bar, board grid and width escape, faction columns, reserved strip, `.brd-btn` |
| `[C04] UNIT` | faction header, stat lines, unit card with `:focus-within`, remove control, add button |
| `[C05] TOKENS-VIZ` | three-layer token, six shapes, seven colours, `.tok-row`, `.tok-count`, `.tok--in` + reduced-motion |
| `[C06] STEPPER` | 44×44 buttons, fixed-width numeric field, both halves of the focus ring |

## Deviations from Plan

### 1. `data-amt` added to the interface contract (Rule 2 — missing critical functionality)

**Found during:** Task 3.
**Issue:** The planned contract gives the health input `data-act="maxHp"` while the health
token row and the vocabulary key are both `hp`. `sync()` needs one vocabulary to look up "what
number does this node show" for fields, readouts and token rows alike, and reusing `data-act`
would have forced a `maxHp`→`hp` alias inside `amountFor` — a mapping that silently rots the
first time an act is renamed.
**Fix:** Added `data-amt` naming the *quantity* (`hp`, `shield`, `ap`, `dmg`, `ehp`), separate
from `data-act` naming the *operation*. `sync()` drives the whole reconcile off it, so there is
no second walk of the roster that can drift away from `structure()`'s.
**Impact on 02-02:** none — every `data-k` and `data-act` in the planned table is unchanged.
`data-amt` is additive and `[S07]` can ignore it.
**Files:** `cats-vs-mechs.html` `[S06]`. **Commit:** `ebbe25b`.

### 2. Token colour applied through a custom property, not `background` on `.tok`

**Found during:** Task 2.
**Issue:** The plan (following research §4) puts `background` on `.tok` and `clip-path` on
`.tok-s`. Those two cannot both be true and produce a triangle: `.tok`'s own painted background
would show through as a full square behind the clipped shape layer.
**Fix:** The colour classes set `--tok-fill` on `.tok`; `.tok-s` is the only painted layer
(`background:var(--tok-fill)`). The plan's actual intent is preserved exactly — one rule per
`COLORS` id, and the fill stays at the pure token value so the measured 7:1–11:1 ratios hold.
**Files:** `cats-vs-mechs.html` `[C05]`. **Commit:** `8d58cf2`.

### 3. A vocabulary change is treated exactly like a mode change (Rule 2)

**Found during:** Task 3.
**Issue:** The plan specifies the empty-and-rebuild only for the compaction mode swap. But plan
02-03's picker restyles a token type without changing any count, so both `while` loops would do
nothing and the existing nodes would keep the old shape and colour classes forever.
**Fix:** `syncRow` stores a style signature in `row.dataset.sig` and empties the row when
*either* the mode or the signature changes. A restyle therefore repopulates from empty and,
like a threshold crossing, animates nothing — which is also the correct behaviour, since
recolouring health should not pop nine tokens at once.
**Files:** `cats-vs-mechs.html` `[S06] syncRow`. **Commit:** `ebbe25b`.

### 4. `SHAPES` / `COLORS` / `TOKEN_IDS` are deep-frozen (Rule 2)

The plan asks for them to be exported. An exported array a caller can `push` onto is not an
allowlist, so all three go through the existing `deepFreeze`. **Commit:** `8d58cf2`.

### 5. One acceptance criterion in the plan was unsatisfiable as written

Task 3's criterion `grep -c "requestAnimationFrame" cats-vs-mechs.html` **prints 1** was
written against an incorrect baseline. The shipped file has **2** occurrences, both inside
`[S03] schedule()` (`cats-vs-mechs.html:831–832`) — the `typeof` test and the call — and has
had them since Phase 1. The criterion's stated intent, *"still only `[S03]`'s"*, is met: the
count is unchanged at 2 and this plan added none. No code change was made for this; recording
it so a verifier does not read it as a regression.

### 6. Comment prose caught by the acceptance greps, and corrected

P-11 fired three times during Task 1, all in comments, all found by re-running the greps:
`:has()`, `field-sizing:content` and a second literal `body[data-kbd="1"]` in prose. All three
were rephrased. This is the pitfall behaving exactly as documented — the trap is on prose, not
on code.

## Verification

| Check | Result |
|---|---|
| `node tests/selftest-node.cjs` | exit 0, **91 passed, 0 failed** (from 81) |
| `grep -ci "counter\|rating\|balanced\|difficulty"` | **0** |
| `grep -c "verdict\|balanced\|rating\|difficulty"` | **0** |
| `grep -cE "innerHTML\|outerHTML\|insertAdjacentHTML\|eval(\|new Function\|https?://\|<link\|type=module\|url(\|createElementNS\|DOMParser\|srcdoc"` | **0** |
| `grep -c "<style>"` / `grep -c "<script>"` | **1** / **1** |
| `grep -c 'data-act="openTokenPicker"'` | **4** |
| `grep -c "case 'openTokenPicker'"` | **0** |
| `grep -c ":has(\|container-type\|field-sizing"` | **0** |
| `grep -ci "hover .unit-rm\|hover .brd-rm"` | **0** |

### Renderer behaviour, exercised

No browser and no Playwright were available in this environment, so a throwaway DOM shim was
built in the scratchpad (**not committed, not shipped**) and used to drive the real
`App.render.*` inside the same `vm` sandbox the shipped harness uses. **45 of 45 checks pass**,
covering the parts the Node gate cannot reach:

- 9 cat cards and 3 mech cards; `#board-empty` hidden
- health → green squares, shield → blue squares, AP → gold triangles, damage → coral diamonds,
  all read from `state.build.tokens`
- eHP reads 27 per side; mech damage reads 3
- **grow 3 → 4 appends exactly one node, keeps all three original node objects, and applies
  `tok--in` to the new tail only**
- shrink removes from the tail only
- the focused field keeps `+5` through a `sync()`; an unfocused field is written
- **12 → `data-mode="c"`, two children, `"12×"`, nothing animated; 11 → back to 11 tokens,
  nothing animated**
- a structural rebuild restores window scroll (640px), the focused `data-k`, and the caret,
  onto the *new* node
- removing the unit whose remove button had focus lands on `cats/c3/rm`; emptying the roster
  lands on `cats/add`
- add/remove controls disappear while `fight !== null` and return on `endFight`
- `body[data-kbd]` follows `ui.kbdNav`
- a glyph entry builds the third layer; an unvetted shape string never reaches `className`

### Not yet confirmed by a human

Per the plan, browser confirmation is 02-03's checkpoint. Two things a rehearsal has to settle
and no amount of code can:

1. **Projector legibility of `--tok: 22px` / `--tok-gap: 6px`** (Q-4, LOW confidence in
   research). Both are named in `[C00]` as the dial, and no JavaScript hardcodes either.
2. **Whether `--boardw: 1600px` is right on the actual workshop display** (Q-3).

## Known Stubs

None that block this plan's goal. Two deliberate no-consumer surfaces ship as designed:

| Surface | Why | Resolved by |
|---|---|---|
| `DEFAULTS.tokens.dead` | D-09's proof that the renderer can already draw Phase 5's dead marker; building the mechanic here would be scope creep | Phase 5, plan 05-01 |
| The four `openTokenPicker` buttons | This plan's stated obligation is to render them with the right attributes; the routing is 02-02's and the handler is 02-03's | 02-02 (`UI_ACTS`) then 02-03 (handler) |

## Notes for plan 02-02

1. **`openTokenPicker` must not reach `App.ops.dispatch`.** Its `default:` arm throws, `boot.wrap`
   catches, and the student sees the styled error panel on their first click. Route it through
   the `UI_ACTS` allowlist.
2. **The structural trigger is yours.** `sync()` deliberately does not detect a shape mismatch and
   escalate. Any op that changes the number of units must follow its `commit()` with
   `App.state.invalidate({ structural: true })`. `[S09.4]` asserts the card count matches the
   roster, so a missed one shows up as a red row rather than as a stale board.
3. **`ui.kbdNav`'s reader now exists.** Guard the write on the current value — an unguarded
   `setUi` call commits once per keystroke.
4. `App.render.MAX_UNITS` is exported (24) so `[S05]`'s throwing backstop asserts against the
   same constant the disabled button uses.
5. Both `structure()` and `sync()` are safe to call with no `document`; `[S07]` should keep the
   same guard so the Node gate stays green when it lands.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND
- `.planning/phases/02-allocation-surface/02-01-SUMMARY.md` — FOUND
- `403becb` — FOUND
- `8d58cf2` — FOUND
- `ebbe25b` — FOUND
- `STATE.md` / `ROADMAP.md` — untouched, as required in worktree mode
