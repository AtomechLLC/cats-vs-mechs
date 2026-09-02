<!-- GSD:project-start source:PROJECT.md -->
## Project

**Cats vs Mechs — Workshop 16 Interactive Sample**

An interactive, single-file HTML teaching artifact for Workshop 16 of the Game Feel / Direction course. It turns the workshop's static whiteboard — two factions, their actions and keywords, a counter map, and a resource-token balance pass — into something students can actually operate: allocate health, damage, action points and effects across two rosters, then play a turn-based Cats vs Mechs fight hot-seat and watch what their allocation did.

It is not a game engine. The tool does bookkeeping and projection; **the students are the rules engine.**

**Core Value:** A student builds two factions that look nothing alike and discovers they can still be balanced — and discovers it by playing, not by being told a number.

### Constraints

- **Tech stack**: Single self-contained HTML file — no build step, no external dependencies, no network calls at runtime. Must open by double-click and work offline, matching the course's existing artifacts.
- **Compatibility**: Must work in a modern desktop browser opened from `file://`. This rules out anything requiring a server (module imports, fetch of local assets).
- **Visual language**: Reuse the sibling artifacts' dark palette and design tokens so it reads as part of the course set.
- **Sharing**: Build state must round-trip through a URL, since there is no backend.
- **Audience**: Students following a workshop, plus an instructor demoing live. Legibility on a shared screen matters as much as usability.
- **Scope discipline**: The temptation to automate combat resolution will recur at every phase. It is excluded by design, not by effort.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Headline: the four things that decide this build
## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Vanilla JS (ES2022)** | n/a — browser built-in | Entire application | Verified: a single classic `<script>` runs unrestricted from `file://`. Zero bytes, zero license surface, the file stays readable and hand-editable — which matters because the artifact *is* the deliverable and an instructor may open it in an editor during a workshop. |
| **One classic `<script>` block** | n/a | Code container | **Verified:** `<script type="module">` *executes* from `file://` but any `import` inside it fails CORS (`origin 'null'`). A classic `<script>` has no such restriction. Do not use modules. |
| **Modern CSS in one `<style>` block** | Baseline Widely Available set | All styling | `:has()`, container queries, nesting, `color-mix()`, custom properties are all Baseline **Widely Available** (see Version Compatibility). Verified computing correctly from `file://`. Zero reason to hold back for a desktop-only 2026 target. |
| **Compact positional string codec** | hand-written; ~60 lines as first scoped, far larger once its guards landed | Build sharing | **Re-measured 2026-09-01:** shipped board **45 chars**, a realistic authored board **344**, a 24v24 fully authored board **909**. The original "35 vs 1,554 for JSON→base64url" was measured pre-Phase-2.1 against a smaller schema; the *ratio* held, the absolute figure moved as authoring landed. Still inside Discord's 2,000-char limit at every scenario a workshop reaches. See § 3. |
| **`<dialog>` element** | Baseline high since 2024-09 | Share modal, confirm-reset, copy fallback | Native modal + backdrop + Esc handling for free. Verified `showModal` present on `file://`. **D-38 lesson (measured 2026-09-01): never put an author `display` on a dialog's own class.** An author `display:grid` on `.pk`/`.ae` beat the UA's `dialog:not([open]){display:none}` — cascade **origin**, not a specificity contest — so a *closed* dialog laid out in normal flow, 660×728 and 1040×716 at document y 3067, on every page this artifact had ever drawn. Ship the guard: `.pk,.ae,.sh,.rs:not([open]){display:none}`. |
| **Event delegation from one root listener** | n/a | All interaction | The only pattern that survives a region being rebuilt without listener bookkeeping. Shipped shape: routing by `data-act` off one root, every listener registered through `App.boot.wrap`. |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| *(none by default)* | — | — | — |
| Preact + hooks + htm (inlined UMD) | preact 10.29.8 (MIT) + htm 3.1.1 (Apache-2.0) | Component rendering | **Only if** the UI grows past ~10 independently-updating regions with nested list editing and hand-written render functions start duplicating diff logic. Verified working inlined from `file://`. Cost: 16.4 KB. Escape hatch, not a starting point. |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| **In-file self-test harness** (primary, ships) | The artifact's own assertions: codec round-trip, model math, damage/overkill, id gates | Gated behind `#selftest` in the hash. Runs by double-click, ships with the artifact, costs nothing, never needs npm. Scoped at ~50 lines; it is far past that now, and the growth is the point — it is the only tier that reaches a student's machine. |
| **`tests/selftest-node.cjs`** (dev, tier 2 — the gate) | Runs the in-file harness in a bare `vm` sandbox, plus the `FORBIDDEN` scan and the interaction gate | `node tests/selftest-node.cjs`. Node built-ins only, no npm. **Measured 2026-09-01: 1336 passed, 0 failed, exit 0; 216 of 216 gate checks; 160 shell ids.** This is the gate. It is what "green" means in this repo. |
| **`tests/selftest-dom.cjs`** (dev, tier 2 — stub DOM) | The same harness against `tests/stub-dom.cjs`, so the five DOM-bracketed suites actually run | `node tests/selftest-dom.cjs`. **Measured 2026-09-01: 1460 passed, 0 failed, exit 0.** The 124-row delta over tier 1 is five suites — render, interactions, the board rows of token authoring, projection, reference material — that report `skipped — no DOM` in the bare sandbox. Still Node built-ins only. |
| **`tests/browser-checks.mjs`** (dev, tier 3, optional) | The claims no stub can reach: layout, computed style, real clipboard, real focus, real `file://` | `node tests/browser-checks.mjs`. **Measured 2026-09-01: 314 passed, 0 failed**, headless, across four columns — real Chrome and real Edge (`channel: 'chrome'` / `'msedge'`) × 1920×1080 and 1366×768. `HEADED=1` to watch a run. Resolves Playwright from `PLAYWRIGHT_DIR` or `tests/node_modules`, and **skips cleanly with exit 0 when it is absent**, so a fresh checkout is not a broken checkout. |
| **Playwright 1.62.1** (optional, dev-only) | The driver under tier 3 | Kept in a sibling `tests/` folder that is **not** shipped, and is **not** a dependency of this project. Verified working: `chromium.launch({ channel: 'chrome' })` + `pathToFileURL()`. |
| Browser DevTools | Everything else | The debugging story for a single file is "open DevTools." No source maps needed because there is no transform. |
## Installation
# Runtime dependencies: none. The artifact is one .html file.
# Open it by double-clicking it. That is the install step.
# OPTIONAL, dev-only, in a sibling tests/ directory that is NOT shipped:
- Headless Chromium denies `clipboard-write` **when you do not grant it**. Measured originally: `NotAllowedError: Write permission denied` with `permissions.query('clipboard-write') === "prompt"`. **Amended 2026-08-29/2026-09-01:** the denial is conditional, not a property of headless. `browser.newContext({ permissions: ['clipboard-read','clipboard-write'] })` makes a **headless** run report `"granted"`, and every clipboard tier cell passes headless in both Chrome and Edge. The original warning stands in its useful form: if you don't grant the permission, your clipboard test fails for a reason that has nothing to do with your code.
- `channel: 'chrome'` / `channel: 'msedge'` — real installed browsers — are the higher-fidelity `file://` targets. Bundled Chromium is deliberately not used.
## 1. State Management Without a Framework

> **SUPERSEDED IN PRESCRIPTION, NOT IN MEASUREMENT — read this before the tables below.**
> This section originally prescribed *immediate-mode region re-render* with an `__lastHTML` memo, i.e. `innerHTML`.
> **`innerHTML` is now on the artifact's `FORBIDDEN` list and the gate fails the build if it appears**
> (`tests/selftest-node.cjs:38-51`, the `FORBIDDEN` array — 14 patterns; the markup-injection-sink row at `:48`
> catches `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write` and `createContextualFragment`, and the
> HTML-parser row at `:49` catches `DOMParser` and `srcdoc`).
> The artifact uses a **two-tier `structure()` / `sync()` keyed reconcile built entirely from `createElement` +
> `textContent`**. What changed is the *prescription*, not the *benchmark*: the 2026-08 numbers below were really
> measured and were a fair reading of `innerHTML` at this scale. They are simply **not applicable to this codebase**
> and must never be used to size a new region. Recorded in `.planning/phases/05-fight-loop-playtest/05-RESEARCH.md`
> § "CLAUDE.md correction, recorded rather than absorbed".

### Why, with numbers — the original `innerHTML` benchmark (HISTORICAL; the pattern it justified is now forbidden)
| Board size | DOM nodes | Full re-render | Targeted patch |
|---|---|---|---|
| 12 units × 10 tokens | 192 | **0.79 ms** | 0.03 ms |
| 24 units × 20 tokens | 624 | **1.82 ms** | 0.04 ms |
| 60 units × 30 tokens | 2,160 | **5.54 ms** | 0.06 ms |
| 200 units × 40 tokens | 9,200 | 23.03 ms | 0.14 ms |

### Why, with numbers — the shipped reconcile (CURRENT; use these)

Measured Chrome 151 via Playwright `channel: 'chrome'`, Windows 11, `file://`, 1920×1080. Source:
`.planning/phases/05-fight-loop-playtest/05-RESEARCH.md` § Measurements.

| Measurement | Value |
|---|---|
| `#board` nodes, shipped 9v3 (setup / fight running) | 442 / 427, of which **78 carry `data-k`** |
| `App.render.sync()` — the per-frame tier | **0.17 ms** |
| `App.render.structure()` — the rebuild tier | **2.24 ms** |
| 24v24 board: nodes / `sync()` / `structure()` | 1,558 / **0.535 ms** / **7.92 ms** |
| `sync()` with a 50-round full-board ledger on the page | **0.154 ms** — does not move |
| `sync()` with a 100-round compact ledger | **0.172 ms** — does not move |
| 24v24 + 30-round ledger: 29,846 nodes, `sync()` | **0.57 ms** (vs 0.535 without) — still flat |
| Marginal cost of one more full-board ledger row | **1.9–2.1 ms, flat from round 1 to round 60** |
| `commit()` vs fight-slice size, 0 / 10 / 30 / 50 ledger rounds | 0.063 / 0.150 / 0.315 / **0.485 ms** |

**The shape of the conclusion is unchanged and the reason is different.** Perf still is not the constraint — but now
because inert DOM outside the keyed reconcile is free (`sync()` does not move at all with a 50-round ledger on the
page), not because a full `innerHTML` rewrite was cheap. `structure()` is the real ceiling, and the thing that governs
a new region is **whether it lands inside the keyed walk**, not its node count.

**The hazard that replaced the perf hazard: `data-k` scope.** `withPreservedFocus` takes the **first** `[data-k]`
match scoped to `#board`. A ledger of cloned boards placed *above* the live one *inside* `#board` makes that first
match a dead ledger node — measured directly, `firstScopedMatchIsInLedger: true`. Keep accumulating history a
**sibling** of `#board`, and keep every `data-k` unique document-wide.
### The pattern (this is the code shape to build to)
### Why the alternatives lose
| Pattern | Verdict at this scale | Reason |
|---|---|---|
| **Immediate-mode region re-render** via `innerHTML` | ~~recommended~~ **FORBIDDEN — the gate fails the build** | The original reasoning (pure `state -> string` render functions, one function per region, an `__lastHTML` memo) is still good reasoning and is **why the shipped `structure()` / `sync()` split has the same shape**. What it cannot have is the sink: `innerHTML` is banned outright. Keep the immediate-mode *discipline*, emit `createElement` + `textContent`. |
| **Two-tier keyed reconcile** — `structure()` rebuilds, `sync()` patches text and classes in place (**shipped, recommended**) | **Holds up** | `sync()` is 0.17 ms and does not move with a 50-round ledger on the page; `structure()` is 2.24 ms and is the only tier that can add a region. A change that alters node *count* is structural; a change that alters text or class is a `sync()`. Nodes are keyed by `data-k`. |
| **Proxy-based reactivity** | Becomes spaghetti | The appeal is "just mutate and it updates." The cost in a single file is that *why* something re-rendered becomes invisible — there is no stack trace from a DOM update back to the mutation. Also silently breaks on nested-array mutation unless you deep-wrap, and deep-wrapping 12 unit objects is more code than the thing it replaces. Debugging a mysterious non-update at 11pm before a workshop is the failure mode. |
| **Pub/sub store** (`on('unit:hp', ...)`) | Becomes spaghetti fastest | Every feature adds an event name and 2+ subscribers. By feature 15 you have an untyped, undiscoverable event bus with no single place that describes what happens on a change. This is the classic single-file-app death spiral. |
| **Explicit DOM patching everywhere** | ~~Correct but expensive~~ **This is what shipped, and the cost was worth paying** | Originally scoped to "the specific exceptions below" on the grounds that 0.04 ms vs 1.82 ms is irrelevant. The `FORBIDDEN` list made it the whole strategy. The predicted cost was real — hand-written diff logic kept in step with the markup — and the keying discipline (`data-k`, unique document-wide) is what pays it back. |
### The three real constraints on rebuilding a region (perf is not one of them)

The original three — animated tokens, the append-only combat log, focused inputs — all survived the move off
`innerHTML` unchanged, because none of them was ever about the sink. A repaint still must never write a focused
field (D-19), history is still append-only, and a fourth has since been measured: **a paint that skips a focused
field must record no fingerprint**, or the signature check at the top of the region returns early over a surface
that really is stale.
### State shape rule
## 2. Can a Framework Be Embedded Inline?
### Measured inline cost (actual dist bytes, downloaded and weighed)
| Candidate | Version | License | Inline bytes | Inline mechanism | Verified working from `file://`? |
|---|---|---|---|---|---|
| **Preact + hooks + htm** | 10.29.8 / 3.1.1 | MIT / Apache-2.0 | 11,322 + 3,800 + 1,265 = **16,387** | UMD builds, three plain `<script>` blocks, globals `preact` / `preactHooks` / `htm` | **YES — verified rendering `<div class="x">units:7</div>`** |
| Alpine.js | 3.16.3 | MIT | **54,447** | `dist/cdn.min.js` inlined | Not tested — size disqualifies |
| petite-vue | 0.4.1 | MIT | **16,901** | IIFE build | Not tested — see maintenance note |
| lit-html | 3.3.3 | BSD-3-Clause | — | **ESM-only, no UMD/IIFE ship** | **NO — would require `import`, which is CORS-blocked on `file://`** |
### The verdict, per candidate
- **It costs the file its readability.** 16 KB of minified single-letter-variable code pasted into the middle of a document that instructors and students may open in an editor. The sibling artifacts are readable top-to-bottom; this would be the first one that isn't.
- **htm without a build gives you the syntax of JSX and none of the benefits.** No compile-time checking, no editor highlighting inside the tagged template, and a runtime parse cost on every render. You are paying JSX's ergonomic tax without collecting its tooling payout.
- **The measured problem it solves does not exist here.** 1.82 ms.
- **License hygiene becomes a maintenance chore.** Two license banners you must not accidentally delete while hand-editing the file.
## 3. URL State Round-Tripping
### The finding that changes the design
### Encoding scheme — measured comparison
| Approach | Output length | Extra bytes in the artifact | Verdict |
|---|---|---|---|
| Raw JSON | 1,165 chars | 0 | Too long, and every field name is paid for on every share |
| JSON → base64url | **1,554 chars** | 0 | **Worst of both.** base64 inflates by 33% and buys nothing here |
| JSON → `LZString.compressToEncodedURIComponent` | **709 chars** | **+4,814** (lz-string 1.5.0, MIT) | Works, round-trip verified — but pays 4.8 KB to fix a problem the schema created |
| Slim JSON → native `CompressionStream('deflate-raw')` → base64url | **167 chars** | **0** | Excellent fallback. Verified working on `file://` |
| **Compact positional schema** | **35 chars** *(as first measured, pre-Phase-2.1 schema)* | ~60 lines of codec | **Recommended — and shipped.** Re-measured against the schema that actually shipped: see the scenario table below. |
### Recommended scheme, concretely
- **Version prefix is mandatory** (`v1~`). The board *will* change between workshop runs. Without it, a stale Discord link silently loads garbage into a new schema and the student debugs your tool instead of their build.
- **Only encode what the student changed.** Actions, keywords, effect names, counter map and roster templates are static defaults compiled into the file. Encode HP values, AP, roster counts, alive flags, manual overrides, turn, active side. Nothing else.
- **Run-length the token rows.** Nine cats at 3 HP is `9x3`, not `3.3.3.3.3.3.3.3.3`. Typical builds are homogeneous; this is where the wins are.
- **Append a 4-char checksum** (FNV-1a → base36, truncated). Costs 5 chars and turns "the code was truncated on paste" from a silent wrong-board into an explicit "That build code looks incomplete."
- **On decode failure, never throw into the void.** Show "Couldn't read that build code" and leave the current board untouched.
### Measured build-code sizes — the shipped schema

Re-measured **2026-09-01** after phases 2.1 and 3.1 put token authoring, action authoring, token min/max bounds and
round rules on the wire. Source: `.planning/phases/05-fight-loop-playtest/05-D35a-SUMMARY.md` § Measurements.

| Scenario | Chars | Note |
|---|---|---|
| The shipped board, nothing authored | **45** | `v1~N~V~A9~3~9*3!0~9*~~~~B3~3~3*6!3~3*~~~~7tvo`. Writes no vocabulary record and no rules section, which is why it did not move when D-35 landed |
| A realistic 12v5, lightly authored | **344** | two bounded types and three round rules |
| 24v24, nothing authored | **283** | roster size alone is cheap — run-length encoding is doing its job |
| 24v24, fully authored | **909** | six types carrying bounds, the rule list populated |
| Adversarial ceiling | **3,542** | eleven distinct bound pairs, rule list at its cap |
| The same in astral emoji | **3,744** | +202 for text only; bounds and rules carry no text |

Marginal costs: a bounds pair is **~5 chars** per vocabulary record that is written at all; a round rule is **~4**.

### Size budget
| Threshold | Value | Basis |
|---|---|---|
| **Typical build** | ~~≤ 120 chars~~ **≤ 400 chars** | Amended. The 120 figure was extrapolated from the 35-char measurement; the realistic authored board measures **344**. The extrapolation was wrong because it predated authoring, not because the method was |
| **Design target (hard)** | **≤ 512 chars** | **Stands.** A 24v24 fully authored board at 909 exceeds it — that is a deliberate, recorded overrun for a board no workshop builds, not a moved goalpost |
| **Discord free-tier message limit** | **2,000 chars** | Verified current for 2026; Nitro raises to 4,000 but never assume Nitro. **The adversarial ceiling (3,542) exceeds this** — reachable only by a board built to break it |
| **Escalation trigger** | **> 800 chars** | Unchanged mechanism: `CompressionStream('deflate-raw')` + base64url (measured: 1,165-char JSON → 167 chars, zero library bytes). Keep the `v<N>~` prefix **outside** the compressed blob |
| Chrome `file://` hash capacity | **≥ 500,000 chars, verified** | Not a constraint. Discord is still the binding constraint |

**The method held; only the numbers moved.** The reason the budget survived four phases of schema growth is the
original rule — *only encode what the student changed* — enforced by writing a section **only when it differs from
the seed**. That is also why an **empty** section and an **absent** one must stay distinguishable: a student who
deletes every round rule has built a board they are allowed to share.

**What the codec grew that the original scoping did not anticipate:** `WIRE_BOUNDS` (every wire-level cap declared
beside the arithmetic that enforces it) and a **28-shape refusal matrix** — 23 content rows, 22 distinct guards,
each past a recomputed digest. The 4-char FNV-1a checksum was necessary and was never sufficient; a checksum catches
truncation, and a refusal matrix catches a code that is intact and lying.
### Unicode caveat
## 4. `file://` Constraints — Verified Capability Matrix
| Capability | Result | Prescription |
|---|---|---|
| `window.isSecureContext` | **`true`** | Confirmed against the spec: W3C Secure Contexts step 6 — *"If origin's scheme is `file`, return Potentially Trustworthy."* All secure-context-gated APIs are therefore available. |
| `location.origin` | `"file://"` | But CORS errors report `origin 'null'`. Both are true; the origin is opaque for network purposes. |
| **`navigator.clipboard.writeText()`** | **WORKS with a user gesture** | Chrome 151 and Edge 151 both report `permissions.query('clipboard-write') === "granted"` on `file://` and the write succeeds inside a click handler. **Must be called synchronously in the gesture** — MDN BCD: from Chrome 107, writeText must be inside a user-gesture handler. Encode the build code *before* the `await`, never after. **Now exercised automatically:** all four clipboard tiers are driven headless in both browsers by `tests/browser-checks.mjs`, with the OS clipboard seeded with a sentinel first, so a copy that did **not** happen is detectable rather than assumed. |
| `document.execCommand('copy')` | Returns `true` | Deprecated per MDN BCD, still functional everywhere. Keep as fallback tier 2. |
| `fetch('./file.txt')` | **BLOCKED** — `TypeError: Failed to fetch`, *"URL scheme 'file' is not supported"* | No workaround; not even `--allow-file-access-from-files` fixes `fetch`. **All data must be JS literals in the file.** |
| `XMLHttpRequest` to sibling file | **BLOCKED** (CORS, `origin 'null'`) | Works only with `--allow-file-access-from-files`, which students will never set. Same conclusion: inline everything. |
| `import './mod.js'` (static or dynamic) | **BLOCKED** (CORS, `origin 'null'`) | Use a classic `<script>`. |
| `<script type="module">` (inline, no imports) | **Runs fine** | It executes — it just can't import. Not worth the deferred-execution surprise; use classic. |
| `import(blobURL)` | **WORKS** | Escape hatch only. Not needed here. |
| `new Worker('worker.js')` | **BLOCKED** — `SecurityError: ... cannot be accessed from origin 'null'` | — |
| `new Worker(blobURL)` | **WORKS** | If a worker is ever needed (it isn't — see the perf numbers), build it from a Blob. |
| `crypto.subtle.digest()` | **WORKS** (returned 32 bytes) | Available, because `isSecureContext` is true. Not needed — use FNV-1a for the checksum, it's 6 lines and synchronous. |
| `crypto.randomUUID()` | Present | Fine for unit IDs. A monotonic counter is smaller in the build code. |
| `CompressionStream('deflate-raw')` | **WORKS** (500 B → 8 B) | Available for the >800-char escalation path. |
| `localStorage` / `sessionStorage` | **WORK in Chrome** | **But Chrome buckets ALL `file://` pages into one shared origin** — namespace every key (`cvm.v1.*`) or the two sibling course artifacts will collide. Firefox behaviour under `privacy.file_unique_origin` (default `true` since FF 68) is **contested across sources — LOW confidence**. **Never make persistence load-bearing.** Wrap in try/catch, treat total absence as normal. The URL hash + build code already satisfy the actual requirement. |
| `indexedDB` | Opens successfully | Unnecessary. Don't. |
| Blob URLs + `<a download>` | **Both work** (`blob:null/...`, `download` attribute present) | Gives you a free offline "Save build as file" escape hatch that needs no server and no clipboard. Worth having as tier 4. |
| `history.replaceState` with `#hash` | **WORKS**, round-trips at 500,000 chars | Use for local state persistence. |
| `history.replaceState` with `?query` | Works | Use the hash instead — no reload semantics, no ambiguity. |
| `structuredClone`, `Proxy`, `customElements`, `requestIdleCallback` | All present | — |
### Clipboard: the concrete four-tier fallback
## 5. Styling
| Feature | Baseline status | Since | Chrome / Edge / Firefox / Safari | Use it? |
|---|---|---|---|---|
| CSS custom properties | **Widely available** | 2017-04 | 49 / 15 / 31 / 9.1 | **Yes** — already the sibling artifacts' convention |
| `:has()` | **Widely available** | Newly 2023-12, **Widely 2026-06-19** | 105 / 105 / 121 / 15.4 | **Yes** |
| Container queries | **Widely available** | Newly 2023-02, **Widely 2025-08-14** | 105 / 105 / 110 / 16 | **Yes** |
| CSS nesting | **Widely available** | Newly 2023-12, **Widely 2026-06-11** | 120 / 120 / 117 / 17.2 | **Yes** — big readability win in a 1,500-line `<style>` block |
| `color-mix()` | **Widely available** | 2023-05 | 111 / 111 / 113 / 16.2 | **Yes** — derive faction tints from the shared tokens instead of hardcoding new hexes |
| `<dialog>` / `showModal` | **Widely available** | 2022-03 | 37 / 79 / 98 / 15.4 | **Yes** — with the D-38 guard: an author `display` on the dialog's own class repeals `dialog:not([open])` by cascade **origin**, so ship `…:not([open]){display:none}` explicitly |
| Subgrid | **Widely available** | 2023-09 | 117 / 117 / 71 / 16 | Yes if useful for aligning token rows across cards |
| `text-wrap: balance` | Newly available | 2024-05 | 114 / 114 / 121 / 17.5 | Yes — progressive enhancement, degrades to nothing |
| `light-dark()` | Newly available | 2024-05 | 123 / 123 / 120 / 17.5 | Not needed — this artifact is dark-only by design |
| Popover API | Newly available | 2025-01 | 116 / 116 / 125 / 17 | Optional. `<dialog>` covers the need with longer support |
| `field-sizing: content` | Newly available | **2026-06-16** | 123 / 123 / 152 / 26.2 | **Not yet** — Firefox support landed two months ago. Only enhancement-grade |
| Anchor positioning | **Not Baseline** | — | Chrome-only | **No** |
| Scroll-driven animations | **Not Baseline** | — | No Firefox | **No** |
### The two styling constraints that actually bite
## 6. Testing a Single-File HTML Artifact
### Tier 1 — in-file harness (build this)
- It runs by double-click, offline, with zero tooling — the same delivery constraint as the artifact itself.
- It tests **exactly the things that fail silently and expensively**: the codec (a wrong-decoded build wastes a student's whole exercise) and the balance math (a wrong eHP number teaches a wrong lesson, which is the worst possible failure for a *teaching* artifact).
- It is self-documenting. An instructor who forks the file can see what the invariants are.
- It ships. It cannot rot in a folder nobody opens.
**Amendment (2026-09-01): this tier was built and it ships. Below it are two more.**

### Tier 2 — the Node runners (dev, no npm, no build)

Two runners drive the tier-1 harness from `node`, and between them they are what "green" means in this repo:
`tests/selftest-node.cjs` (**1336 passed, 0 failed, exit 0**; 216 of 216 gate checks; 160 shell ids) in a bare
`vm` sandbox, and `tests/selftest-dom.cjs` (**1460 passed, 0 failed, exit 0**) against `tests/stub-dom.cjs`, so the
five DOM-bracketed suites — render, interactions, the board rows of token authoring, projection, reference
material — actually execute instead of reporting `skipped — no DOM`. That 124-row delta is the whole reason the
second runner exists.

`tests/selftest-node.cjs` also carries the `FORBIDDEN` array — **14 patterns**, read 2026-09-01 at
`tests/selftest-node.cjs:38-51`: `https?://`, `<link`, ` src=`, `type="module"`, `fetch(`, `XMLHttpRequest`,
`@import`, `url(`, the markup-injection sinks (`innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`,
`createContextualFragment`), the HTML parsers (`DOMParser`, `srcdoc`), `javascript:`, `<iframe`, `eval` and the
`Function` constructor. **That array is what makes § 1's original prescription unimplementable, and it is the
correct trade** — the constraint the artifact must never violate is mechanically
enforced rather than remembered.

### Tier 3 — Playwright browser checks (optional, dev-only) — **now built and passing**

`tests/browser-checks.mjs`: **314 passed, 0 failed**, headless, four columns — real Chrome and real Edge
(`channel: 'chrome'` / `'msedge'`) × 1920×1080 and 1366×768. `HEADED=1` to watch. Playwright resolves from
`PLAYWRIGHT_DIR` or `tests/node_modules` and the file **skips cleanly with exit 0** when it is absent.

**This closed a premise that was wrong for three phases.** The repo had been recording layout, computed-style and
clipboard claims as "no browser in this environment" and deferring them to a human rehearsal. CLAUDE.md had said
otherwise all along and nobody re-tested it. Measured 2026-08-29: both browsers load the artifact from `file://`,
report `isSecureContext === true`, and report `clipboard-write` **granted**.

**What tier 3 catches that neither Node tier structurally can:** a CSS rule silently dropped by the parser (a stray
comment terminator once killed an entire rule body — invisible to a text scanner *and* to a gate with no layout
engine); a colour that stopped deriving from a token; a closed dialog laid out in normal flow; anything about a real
rectangle. The two kinds of check do not subsume each other — the node gate catches a bad literal being *written*,
the browser cell catches a value that stopped deriving *for any reason at all*.

### What NOT to do
- **No Jest/Vitest.** They require a module system, which requires a build, which the constraint forbids. Extracting logic into a testable module and re-inlining it is a build step wearing a disguise.
- **No visual regression testing.** A hand-maintained teaching artifact does not have the change velocity to amortise screenshot baselines.
- **No test coverage targets.** Test the codec and the math. Everything else is a button that either visibly works during rehearsal or doesn't.
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|---|---|---|
| Vanilla + region re-render | Preact 10.29.8 + htm 3.1.1 inlined (16.4 KB) | If the UI passes ~10 independent regions with nested list editing and you're writing the same diff logic three times. Verified working from `file://`. |
| Vanilla + region re-render | Explicit DOM patching | For the three specific exceptions: animated tokens, append-only combat log, focused inputs. Use both — they compose. |
| Compact positional codec | `CompressionStream('deflate-raw')` + base64url | If the payload exceeds ~800 chars. Measured 1,165-char JSON → 167 chars. Zero library bytes. Baseline Widely Available. |
| Compact positional codec | lz-string 1.5.0 (MIT) | Essentially never — `CompressionStream` dominates it on every axis. Only if you must support a browser predating Firefox 113 / Safari 16.4, which for a 2026 desktop target you must not. |
| Build code as the share unit | Full `file://` URL with hash | Never for Discord. Do keep the hash mirrored for local reload/bookmark. |
| In-file self-test harness | Playwright 1.62.1 | Additive, for console-error and click-path smoke coverage. Never a prerequisite. |
| `<dialog>` | Popover API | If you want light-dismiss tooltips for effect cards. Baseline "newly available," so treat as enhancement. |
## What NOT to Use
| Avoid | Why | Use Instead |
|---|---|---|
| **`innerHTML` / `outerHTML` / `insertAdjacentHTML` / `document.write` / `createContextualFragment` / `DOMParser` / `srcdoc`** | On the artifact's `FORBIDDEN` list; `tests/selftest-node.cjs:38-51` fails the build on any of them. Supersedes § 1's original region-re-render prescription — see the banner there | `createElement` + `textContent`, inside the two-tier `structure()` / `sync()` reconcile |
| `<script type="module">` with any `import` | **Verified blocked** on `file://` — CORS, `origin 'null'`. The single most common way this class of project dies. | One classic `<script>` |
| `fetch()` / `XMLHttpRequest` for any local asset | **Verified blocked.** `fetch` fails even with `--allow-file-access-from-files` | Inline all data as JS literals; inline images as data URIs or SVG |
| `new Worker('file.js')` | **Verified `SecurityError`** | Not needed (1.82 ms). If ever needed: Blob-URL worker, verified working |
| lit-html | ESM-only, no UMD/IIFE build → requires `import` → blocked | Vanilla, or Preact+htm UMD if you must have components |
| Alpine.js | 54 KB inlined ≈ the size of the entire sibling artifact; logic lives in HTML attributes, which is unreadable and ungreppable at 3,000 lines | Vanilla |
| petite-vue | Last published 2022-01-18; self-described experiment. Do not embed abandoned code in a multi-year course asset | Vanilla |
| lz-string | 4.8 KB to compress a 35-char string | Compact schema; `CompressionStream` if it ever grows |
| Proxy-based reactivity | Makes "why did this re-render?" unanswerable; breaks on nested-array mutation without deep-wrapping | Explicit `commit()` after named actions |
| Pub/sub event bus | Untyped, undiscoverable, grows one event name per feature until nothing can be traced | Direct calls into `actions.*` |
| Load-bearing `localStorage` | Chrome shares one bucket across all `file://` pages (will collide with the sibling artifacts); Firefox behaviour under `privacy.file_unique_origin` is contested | Hash + build code. `localStorage` only as namespaced, try/catch-wrapped convenience |
| Optimistic "Copied!" toast | Silent clipboard failure → student pastes stale content into Discord | Branch the toast on the copy tier that actually succeeded |
| CDN `<script src="https://...">` | Fails offline; violates the hard constraint | Inline or omit |
| Anchor positioning, scroll-driven animations | Not Baseline; Chrome-only | Standard positioning; CSS transitions |
| Storing derived eHP/DPS in state | Creates a *second*, mechanical reason for the projection to disagree with the board, muddying the *pedagogical* disagreement the project is built around | Compute during render |
## Stack Patterns by Variant
- Inline Preact 10.29.8 UMD + hooks UMD + htm 3.1.1 UMD (16.4 KB, verified working from `file://`)
- Keep the MIT and Apache-2.0 banners intact in the inlined source
- Because at that point hand-written render functions start duplicating diff logic, and readability crosses over
- Switch to `CompressionStream('deflate-raw')` + base64url (verified: 1,165 → 167 chars)
- Keep the `v<N>~` prefix *outside* the compressed blob so a stale code is rejected before decompression, not after
- Because Discord's 2,000-char ceiling is the only real limit, and this buys ~7x under it for zero bytes
- Move from region-scoped `innerHTML` to keyed per-unit patching for the roster region only
- Because measured full re-render crosses 5.5 ms at 2,160 nodes and 23 ms at 9,200 — the frame budget breaks somewhere between
- Re-verify clipboard and `localStorage` on `file://` empirically before shipping; both were unverifiable in this environment
- The four-tier clipboard fallback already makes this a non-blocker; `localStorage` is already non-load-bearing
- Because Firefox's `privacy.file_unique_origin` (default `true` since FF 68) changes `file://` origin semantics in ways the sources contradict each other about
## Version Compatibility
| Item | Version / Status | Notes |
|---|---|---|
| Runtime dependencies | **none** | The entire compatibility surface is the browser |
| Target browser floor | Chrome/Edge 121+, Firefox 121+, Safari 17.2+ | Set by CSS nesting (Chrome 120 / FF 117 / Safari 17.2) and `:has()` (FF 121) — the last Baseline-high features to land |
| `:has()` | Baseline Widely Available **2026-06-19** | Chrome 105 / Edge 105 / FF 121 / Safari 15.4 |
| Container queries | Baseline Widely Available **2025-08-14** | Chrome 105 / Edge 105 / FF 110 / Safari 16 |
| CSS nesting | Baseline Widely Available **2026-06-11** | Chrome 120 / Edge 120 / FF 117 / Safari 17.2 |
| `CompressionStream` | Baseline Widely Available **2025-11-09** | Chrome 80 / Edge 80 / FF 113 / Safari 16.4 |
| `Clipboard.writeText` | Chrome 66 / Edge 79 / FF 63 / Safari 13.1 | **Chrome ≥107: must be inside a user-gesture handler** or hold `clipboard-write`. Verified granted on `file://` in Chrome 151 / Edge 151 |
| `document.execCommand` | **Deprecated**, universally functional | Fallback tier only. Verified returns `true` |
| `field-sizing` | Baseline newly available **2026-06-16** | Firefox 152 landed two months ago — enhancement only |
| Playwright (optional dev) | **1.62.1** | Verified current; `channel: 'chrome'` recommended for `file://` fidelity |
| Preact / htm (conditional) | **10.29.8** (MIT) / **3.1.1** (Apache-2.0) | UMD globals `preact`, `preactHooks`, `htm` — load in that order |
| lz-string (rejected) | 1.5.0 (MIT, last published 2023-03-04) | Listed for completeness |
| Alpine.js (rejected) | 3.16.3 (MIT) | 54,447 bytes minified |
| petite-vue (rejected) | 0.4.1 (MIT, last published 2022-01-18) | Unmaintained |
| Discord message limit | **2,000** free / 4,000 Nitro | The binding constraint on build-code size |
## Confidence Summary
| Claim | Confidence | Basis |
|---|---|---|
| `file://` capability matrix (fetch/import/Worker/crypto/storage/history) | **HIGH** | Executed in real Chrome 151, default flags, from `file://` |
| `navigator.clipboard.writeText()` works from `file://` in Chrome & Edge | **HIGH** | Executed in Chrome 151 and Edge 151, headed, with a real click; `permissions.query` returned `"granted"` |
| `file://` is a secure context | **HIGH** | Measured `isSecureContext === true`; confirmed against W3C Secure Contexts step 6 |
| Re-render performance numbers — the **original `innerHTML`** table | **HIGH as a measurement, SUPERSEDED as a prescription** | Benchmarked in Chrome 151, 60 iterations per configuration. The numbers are sound; the pattern they justified is now `FORBIDDEN`. Do not size a region with them |
| Re-render performance numbers — the **shipped `structure()` / `sync()`** table | **HIGH** | Measured 2026-08/09 in Chrome 151 via Playwright `channel: 'chrome'` from `file://`. `.planning/phases/05-fight-loop-playtest/05-RESEARCH.md` § Measurements |
| `innerHTML` is forbidden and mechanically enforced | **HIGH** | `tests/selftest-node.cjs:38-51`, the `FORBIDDEN` array, 14 patterns, read 2026-09-01; gate green at 1336/0 the same day |
| Encoding size comparison (35 / 167 / 709 / 1,554 chars) | **HIGH as of when taken, now STALE for the 35** | Measured on a representative state object predating token and action authoring |
| Build-code sizes on the shipped schema (45 / 344 / 283 / 909 / 3,542 / 3,744) | **HIGH** | Measured 2026-09-01 by driving the artifact; `.planning/phases/05-fight-loop-playtest/05-D35a-SUMMARY.md` § Measurements |
| The three-tier harness counts (1336/0, 1460/0, 314/0) | **HIGH** | Tier 1 re-run 2026-09-01, exit 0. Tiers 2 and 3 as recorded in `05-DOMRUNNER-NOTE.md` and `05-D38-SUMMARY.md` |
| Real Chrome **and** Edge drive the artifact from `file://` headless, clipboard granted | **HIGH** | ~314 cells in `tests/browser-checks.mjs`, four columns, measured 2026-08-29 and re-run through 2026-09-01 |
| An author `display` on a dialog class repeals `dialog:not([open])` | **HIGH** | D-38: both dialogs measured laid out at 660×728 and 1040×716 at document y 3067 on the shipped file |
| `file://` hash capacity ≥ 500,000 chars | **HIGH** | Measured, round-trip verified |
| Preact+htm inline-from-`file://` viability | **HIGH** | Rendered successfully from inlined UMD source |
| Library versions, licenses, dist byte sizes | **HIGH** | npm registry API + downloaded dist files, weighed |
| CSS Baseline statuses | **HIGH** | `web-features` package (the Baseline dataset), queried directly |
| Clipboard gesture requirement from Chrome 107 | **HIGH** | MDN browser-compat-data |
| Discord 2,000-char limit | **MEDIUM** | Multiple 2026-dated secondary sources agree; not verified against Discord's own docs |
| Discord does not linkify `file://` | **MEDIUM** | Consistent with Discord's markdown behaviour; not directly tested |
| Firefox clipboard on `file://` | **LOW — designed around, and now known to be unmeasurable HERE rather than merely unmeasured** | The Playwright Firefox binary **is present** — `ms-playwright/firefox-1538/firefox/firefox.exe`, 721,920 bytes, confirmed on disk 2026-09-01 — but the OS refuses to spawn it (`Permission denied`; policy / mark-of-the-web). So the gap is now *sharper*, not closed: it is a machine-policy block, not a missing install, and installing Playwright again will not fix it. The four-tier fallback makes it non-blocking |
| Firefox `localStorage` on `file://` under `privacy.file_unique_origin` | **LOW — sources contradict** | Prescription is to never depend on it, which makes the answer irrelevant |
| "Proxy/pub-sub become spaghetti" | **MEDIUM — engineering judgement** | Not an empirical claim. Stated as an opinionated recommendation with reasoning, per the brief |
## Gaps
- **Chromium-family coverage is no longer a gap.** ~314 cells in `tests/browser-checks.mjs` drive real Chrome and real Edge from `file://`, headless, at two viewports. Layout, computed style, focus and all four clipboard tiers are now measured rather than deferred.
- **Firefox is a SHARPER gap than it was, not a closed one.** The Playwright Firefox binary is on this machine — `ms-playwright/firefox-1538/firefox/firefox.exe`, 721,920 bytes, dated 2026-08-26, confirmed present 2026-09-01 — and **the OS refuses to spawn it** (`Permission denied`; policy / mark-of-the-web). This changes the recommendation: re-installing Playwright will not help, and a future attempt needs an environment change (a different machine, or an unblocked binary), not another `npm install`. Every Firefox-sensitive recommendation (clipboard, `localStorage`) still has a fallback that makes the answer moot — **keep the four-tier clipboard fallback** — but if Firefox becomes a stated support target this must be resolved first.
- **Safari remains entirely untested.** No Safari on Windows; nothing in this environment can close it.
- **Discord's rendering of a very long unbroken code string** (does it wrap, truncate the display, or offer a "copy" affordance?) was not tested. Mitigated by the ≤512-char design target and by instructing students to wrap the code in backticks. Note the measured 909-char fully-authored board and the 3,542-char adversarial ceiling make this **more** worth testing than when it was first written.
- **Projector legibility** is an empirical question that only a rehearsal answers. Tier 3 measures rectangles at 1366×768, which is a proxy and not the thing: whether a word reads from across a room, and whether a sentence reads as helpful, stay human items in `.planning/REHEARSAL.md`. No amount of automation substitutes for putting the artifact on the actual workshop display before the session.
## Sources
- **Direct execution** — Chrome 151.0.0.0 and Edge 151 on Windows 11, loaded from `file://`, driven by Playwright 1.62.1. Capability probe, clipboard permission probe, inline-Preact probe, encoding-size probe, re-render benchmark. **HIGH confidence.** Probe artifacts: `C:\Users\alexy\AppData\Local\Temp\claude\C--Projects-GameDesignSkills-GameFeelDirectionCourse-CatsVsMech\02bc3ee9-fc27-479d-974a-c0660ffd5dd2\scratchpad\`
- **`web-features` npm package** (the Baseline dataset) — Baseline status and low/high dates for `:has`, container queries, nesting, `color-mix`, `compression-streams`, `dialog`, `popover`, `field-sizing`, `text-wrap-balance`, `async-clipboard`, `subgrid`, `light-dark`, anchor positioning, scroll-driven animations. **HIGH.**
- **`@mdn/browser-compat-data` npm package** — `Clipboard.writeText` support and the Chrome 107 user-gesture note; `Document.execCommand` deprecation; `CompressionStream`; `SubtleCrypto`. **HIGH.**
- **npm registry API** (`registry.npmjs.org`) — latest versions, licenses, publish dates for preact, htm, alpinejs, lit-html, petite-vue, lz-string, @preact/signals-core. **HIGH.**
- **unpkg.com** — actual dist files downloaded and byte-measured for every candidate library. **HIGH.**
- [W3C Secure Contexts](https://w3c.github.io/webappsec-secure-contexts/) — "Is origin potentially trustworthy?" step 6 treats the `file` scheme as Potentially Trustworthy. **HIGH.**
- [Bugzilla 1500453 — Treating file: URIs as unique origins](https://bugzilla.mozilla.org/show_bug.cgi?id=1500453) — `privacy.file_unique_origin`, default `true` since Firefox 68. **MEDIUM.**
- [MDN — Secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) and [MDN — Clipboard: writeText()](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText). **HIGH.**
- Discord character limits — [Discord Character Limit 2026 (TypeCount)](https://typecount.com/blog/discord-character-limit), [Discord Text Tools](https://discordtexttools.com/blog/discord-character-limit-guide/). 2,000 free / 4,000 Nitro. **MEDIUM** (secondary sources, mutually consistent).
- URL length ceilings — [IEInternals: URL Length Limits](https://learn.microsoft.com/en-us/archive/blogs/ieinternals/url-length-limits), [Baeldung](https://www.baeldung.com/cs/max-url-length). Superseded for this project by the direct 500,000-char `file://` hash measurement. **MEDIUM**, and not load-bearing.
- `C:/Projects/GameDesignSkills/GameFeelDirectionCourse/game-feel-study-guide.html` — design tokens, single classic `<script>` convention, `tabular-nums` usage, 57 KB baseline file size. **HIGH** (read directly).

**Amending sources (added 2026-09-01, superseding the claims noted above):**

- `.planning/phases/05-fight-loop-playtest/05-RESEARCH.md` — § "CLAUDE.md correction, recorded rather than absorbed" and § Measurements. The `innerHTML` prescription vs the `FORBIDDEN` list; `sync()` / `structure()` baselines; ledger cost across three designs; the `data-k` focus-restore hazard in both DOM orders. **HIGH.**
- `.planning/phases/05-fight-loop-playtest/05-D35a-SUMMARY.md` — § Measurements and § "The refusal matrix: 20 → 28 shapes". Build-code sizes across six scenarios, marginal costs of bounds and rules, `WIRE_BOUNDS`, the 28-shape refusal matrix. **HIGH.**
- `tests/browser-checks.mjs` — 314 cells, real Chrome + real Edge from `file://`, headless, 1920×1080 and 1366×768; the clipboard-tier cells with a seeded sentinel. Its own header records the "no browser in this environment" premise being wrong. **HIGH.**
- `tests/selftest-node.cjs` (`FORBIDDEN` array at `:38-51`, read directly) and `tests/selftest-dom.cjs`, with `.planning/phases/05-fight-loop-playtest/05-DOMRUNNER-NOTE.md` — the two Node tiers and the 124-row delta between them. Tier 1 re-run 2026-09-01: 1336/0, exit 0. **HIGH.**
- `.planning/phases/05-fight-loop-playtest/05-D38-SUMMARY.md` — the closed-dialog cascade-origin finding and the browser-cell count at 314. **HIGH.**
- **Direct filesystem check, 2026-09-01** — `ms-playwright/firefox-1538/firefox/firefox.exe` present, 721,920 bytes. The spawn refusal (`Permission denied`) is recorded from the session that attempted it; this pass confirmed presence-on-disk only. **HIGH** on presence, **MEDIUM** on the cause being policy / mark-of-the-web.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
