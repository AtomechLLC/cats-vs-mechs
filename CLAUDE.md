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
| **Compact positional string codec** | hand-written, ~60 lines | Build sharing | Measured 35 chars vs 1554 for JSON→base64url. Fits Discord's 2000-char message limit ~50x over. |
| **`<dialog>` element** | Baseline high since 2024-09 | Share modal, confirm-reset, copy fallback | Native modal + backdrop + Esc handling for free. Verified `showModal` present on `file://`. |
| **Event delegation from one root listener** | n/a | All interaction | The only pattern that survives region re-rendering without listener bookkeeping. |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| *(none by default)* | — | — | — |
| Preact + hooks + htm (inlined UMD) | preact 10.29.8 (MIT) + htm 3.1.1 (Apache-2.0) | Component rendering | **Only if** the UI grows past ~10 independently-updating regions with nested list editing and hand-written render functions start duplicating diff logic. Verified working inlined from `file://`. Cost: 16.4 KB. Escape hatch, not a starting point. |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| **In-file self-test harness** (primary) | Assert codec round-trip, eHP/DPS math, damage/overkill application | ~50 lines, gated behind `#selftest` in the hash. Runs by double-click, ships with the artifact, costs nothing, never needs npm. This is the proportionate answer for a teaching artifact. |
| **Playwright 1.62.1** (optional, dev-only) | Headless smoke test against `file://` | Keep in a sibling `tests/` folder that is **not** shipped. Verified working: `chromium.launch({ channel: 'chrome' })` + `pathToFileURL()`. |
| Browser DevTools | Everything else | The debugging story for a single file is "open DevTools." No source maps needed because there is no transform. |
## Installation
# Runtime dependencies: none. The artifact is one .html file.
# Open it by double-clicking it. That is the install step.
# OPTIONAL, dev-only, in a sibling tests/ directory that is NOT shipped:
- Headless Chromium **denies** `clipboard-write` by default even with a trusted click. Measured: `NotAllowedError: Write permission denied` with `permissions.query('clipboard-write') === "prompt"`. Real headed Chrome reports `"granted"`. If you don't call `grantPermissions`, your clipboard test will fail for a reason that has nothing to do with your code.
- `channel: 'chrome'` (the real installed browser) is the higher-fidelity target for `file://` behaviour than bundled Chromium.
## 1. State Management Without a Framework
### Why, with numbers
| Board size | DOM nodes | Full re-render | Targeted patch |
|---|---|---|---|
| 12 units × 10 tokens | 192 | **0.79 ms** | 0.03 ms |
| 24 units × 20 tokens | 624 | **1.82 ms** | 0.04 ms |
| 60 units × 30 tokens | 2,160 | **5.54 ms** | 0.06 ms |
| 200 units × 40 tokens | 9,200 | 23.03 ms | 0.14 ms |
### The pattern (this is the code shape to build to)
### Why the alternatives lose
| Pattern | Verdict at this scale | Reason |
|---|---|---|
| **Immediate-mode region re-render** (recommended) | **Holds up** | Render functions are pure `state -> string`. You can read any region's output by reading one function. The `__lastHTML` memo makes untouched regions free. |
| **Proxy-based reactivity** | Becomes spaghetti | The appeal is "just mutate and it updates." The cost in a single file is that *why* something re-rendered becomes invisible — there is no stack trace from a DOM update back to the mutation. Also silently breaks on nested-array mutation unless you deep-wrap, and deep-wrapping 12 unit objects is more code than the thing it replaces. Debugging a mysterious non-update at 11pm before a workshop is the failure mode. |
| **Pub/sub store** (`on('unit:hp', ...)`) | Becomes spaghetti fastest | Every feature adds an event name and 2+ subscribers. By feature 15 you have an untyped, undiscoverable event bus with no single place that describes what happens on a change. This is the classic single-file-app death spiral. |
| **Explicit DOM patching everywhere** | Correct but expensive | 0.04 ms instead of 1.82 ms — irrelevant. You pay in hand-written diff code that must be kept in sync with the markup in two places. Use it *only* for the specific exceptions below. |
### The three real constraints on `innerHTML` re-render (perf is not one of them)
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
| **Compact positional schema** | **35 chars** | ~60 lines of codec | **Recommended** |
### Recommended scheme, concretely
- **Version prefix is mandatory** (`v1~`). The board *will* change between workshop runs. Without it, a stale Discord link silently loads garbage into a new schema and the student debugs your tool instead of their build.
- **Only encode what the student changed.** Actions, keywords, effect names, counter map and roster templates are static defaults compiled into the file. Encode HP values, AP, roster counts, alive flags, manual overrides, turn, active side. Nothing else.
- **Run-length the token rows.** Nine cats at 3 HP is `9x3`, not `3.3.3.3.3.3.3.3.3`. Typical builds are homogeneous; this is where the wins are.
- **Append a 4-char checksum** (FNV-1a → base36, truncated). Costs 5 chars and turns "the code was truncated on paste" from a silent wrong-board into an explicit "That build code looks incomplete."
- **On decode failure, never throw into the void.** Show "Couldn't read that build code" and leave the current board untouched.
### Size budget
| Threshold | Value | Basis |
|---|---|---|
| **Typical build** | **≤ 120 chars** | Extrapolated from the 35-char measurement plus overrides and a mid-fight snapshot |
| **Design target (hard)** | **≤ 512 chars** | Comfortable in a Discord message alongside prose; 4x headroom |
| **Discord free-tier message limit** | **2,000 chars** | Verified current for 2026; Nitro raises to 4,000 but never assume Nitro |
| **Escalation trigger** | **> 800 chars** | Switch to `CompressionStream('deflate-raw')` + base64url (measured: 1,165-char JSON → 167 chars, zero library bytes) |
| Chrome `file://` hash capacity | **≥ 500,000 chars, verified** | Not a constraint. Discord is the binding constraint, by ~4,000x |
### Unicode caveat
## 4. `file://` Constraints — Verified Capability Matrix
| Capability | Result | Prescription |
|---|---|---|
| `window.isSecureContext` | **`true`** | Confirmed against the spec: W3C Secure Contexts step 6 — *"If origin's scheme is `file`, return Potentially Trustworthy."* All secure-context-gated APIs are therefore available. |
| `location.origin` | `"file://"` | But CORS errors report `origin 'null'`. Both are true; the origin is opaque for network purposes. |
| **`navigator.clipboard.writeText()`** | **WORKS with a user gesture** | Chrome 151 and Edge 151 both report `permissions.query('clipboard-write') === "granted"` on `file://` and the write succeeds inside a click handler. **Must be called synchronously in the gesture** — MDN BCD: from Chrome 107, writeText must be inside a user-gesture handler. Encode the build code *before* the `await`, never after. |
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
| `<dialog>` / `showModal` | **Widely available** | 2022-03 | 37 / 79 / 98 / 15.4 | **Yes** |
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
### Tier 2 — Playwright smoke test (optional, dev-only)
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
| Re-render performance numbers | **HIGH** | Benchmarked in Chrome 151, 60 iterations per configuration |
| Encoding size comparison (35 / 167 / 709 / 1,554 chars) | **HIGH** | Measured on an actual representative state object |
| `file://` hash capacity ≥ 500,000 chars | **HIGH** | Measured, round-trip verified |
| Preact+htm inline-from-`file://` viability | **HIGH** | Rendered successfully from inlined UMD source |
| Library versions, licenses, dist byte sizes | **HIGH** | npm registry API + downloaded dist files, weighed |
| CSS Baseline statuses | **HIGH** | `web-features` package (the Baseline dataset), queried directly |
| Clipboard gesture requirement from Chrome 107 | **HIGH** | MDN browser-compat-data |
| Discord 2,000-char limit | **MEDIUM** | Multiple 2026-dated secondary sources agree; not verified against Discord's own docs |
| Discord does not linkify `file://` | **MEDIUM** | Consistent with Discord's markdown behaviour; not directly tested |
| Firefox clipboard on `file://` | **LOW — designed around** | Firefox binary unavailable in this environment. The four-tier fallback makes it non-blocking |
| Firefox `localStorage` on `file://` under `privacy.file_unique_origin` | **LOW — sources contradict** | Prescription is to never depend on it, which makes the answer irrelevant |
| "Proxy/pub-sub become spaghetti" | **MEDIUM — engineering judgement** | Not an empirical claim. Stated as an opinionated recommendation with reasoning, per the brief |
## Gaps
- **Firefox and Safari were not empirically testable.** The Playwright Firefox binary could not launch in this environment and no system Firefox is installed. Every Firefox-sensitive recommendation (clipboard, `localStorage`) has a fallback that makes the answer moot, but if either becomes a stated support target, re-run the probe before shipping.
- **Discord's rendering of a very long unbroken code string** (does it wrap, truncate the display, or offer a "copy" affordance?) was not tested. Mitigated by the ≤512-char budget and by instructing students to wrap the code in backticks.
- **Projector legibility** is an empirical question that only a rehearsal answers. No amount of research substitutes for putting the artifact on the actual workshop display before the session.
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
