# Phase 1: Foundation — Data, State Funnel & Undo - Pattern Map

**Mapped:** 2026-08-26
**Files analyzed:** 1 file created (`cats-vs-mechs.html`), mapped as **7 sections** because the single file is the whole deliverable
**Analogs found:** 3 exact / 2 role-match / 4 no-analog (greenfield)

> **Read this first.** The project root is empty except `.planning/` and `CLAUDE.md`. There is
> no in-repo analog for anything. The only real analogs live **one directory up**, outside this
> repo, and they are the course's shared visual convention:
>
> - `C:\Projects\GameDesignSkills\GameFeelDirectionCourse\game-feel-study-guide.html` (709 lines)
> - `C:\Projects\GameDesignSkills\GameFeelDirectionCourse\game-feel-types-frameworks.html` (391 lines)
>
> Both were read in full. **They are documents; this artifact is an instrument.** They supply
> the document skeleton, the `:root` token block, the body treatment, and a small set of
> surface/callout patterns — and *nothing else*. Every piece of Phase 1's actual machinery
> (`commit()`, undo, `DEFAULTS`, `#selftest`, error boundary) has **no analog** and is an
> invention governed by the research documents. Those are listed explicitly in
> [No Analog Found](#no-analog-found) with a pointer to the prescribing research section.

## File Classification

Single file, mapped per-section. Section order is fixed by ROADMAP and D-00f:
`data → model → state → serialize → ops → render → interactions → boot → selftest`.
Phase 1 owns six of those plus the `<style>` skeleton.

| Section (in `cats-vs-mechs.html`) | Plan | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|---|
| Document skeleton (`<!DOCTYPE>` → `</html>`) | 01-01 | shell / config | n/a | both siblings, byte-identical | **exact** |
| `<style>` — `:root` tokens + base | 01-01 | config (design tokens) | n/a | `game-feel-study-guide.html:8-35` | **exact** |
| `<style>` — selftest report + error panel surfaces | 01-01 / 01-02 | component (styling) | n/a | `.callout` / `.pro`/`.con` / `.card` / `.ex` | role-match |
| TOC comment + section banners | 01-01 | organization | n/a | `game-feel-study-guide.html:185` HTML banner form only | partial |
| `data` — frozen `DEFAULTS` | 01-01 | model / config | n/a | **none — greenfield** | none |
| `model` — pure eHP/DPS derivations | 01-01 | utility (pure) | transform | **none — greenfield** | none |
| `state` — slices + `commit()` + undo + `invalidate()` | 01-02 | store | event-driven | **none — greenfield** | none |
| `ops` — stub transformer layer | 01-02 | service | command | **none — greenfield** | none |
| `boot` — wiring + try/catch error boundary | 01-02 | boot / middleware | request-response | `game-feel-study-guide.html:665-707` (wiring only) | partial |
| `selftest` — `#selftest`-gated harness | 01-01 | test | batch | **none — greenfield** | none |

---

## Pattern Assignments

### Document skeleton (shell) — **exact analog**

**Analog:** both siblings. `game-feel-study-guide.html:1-7` + `:178-182` + `:665` + `:707-709`,
identical in `game-feel-types-frameworks.html:1-7` / `:109-113` / `:378` / `:389-391`.

**Head block — copy verbatim, change only the `<title>`** (`game-feel-study-guide.html:1-7`):

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Game Feel — Study Guide (Module 8)</title>
<style>
```

Both siblings use **uppercase `<!DOCTYPE html>`**, `lang="en"`, exactly these two `<meta>` tags in
this order, then `<title>`, then `<style>` — with **no indentation on the `<head>` children**.
There is no `<meta name="description">`, no favicon, no `<link>` of any kind. Match this exactly.

**Style close / body open** (`game-feel-study-guide.html:178-182`):

```html
</style>
</head>
<body>

<button class="menubtn" id="menubtn" aria-label="Toggle menu">☰</button>
```

**Script placement — end of body, classic, bare** (`game-feel-study-guide.html:665` and `:707-709`):

```html
<script>
  // Mobile menu
  const sidebar = document.getElementById('sidebar');
  ...
</script>
</body>
</html>
```

Confirmed conventions to replicate:
- **One `<style>` in `<head>`, one classic `<script>` immediately before `</body>`.** No `defer`,
  no `type`, no `src`, no second block, in either file.
- `<style>`/`</style>` and `<script>`/`</script>` tags sit at **column 0**; their contents are
  indented **2 spaces**.
- Grep-verified absent from both files: `type="module"`, `src=`, any `<link>`, any network URL.
  This is the `file://` constraint already being honoured by the siblings.

---

### `<style>` — `:root` design tokens — **exact analog**

**Analog:** `game-feel-study-guide.html:8-24` (canonical, one-per-line) and
`game-feel-types-frameworks.html:8-14` (same set, compacted, plus four extensions).

**The authoritative token block, verbatim** (`game-feel-study-guide.html:8-24`):

```css
  :root{
    --bg:#0e1014;
    --bg-2:#15181f;
    --panel:#191d26;
    --panel-2:#1f2530;
    --ink:#e8ebf2;
    --ink-dim:#a4adbe;
    --ink-faint:#6c7689;
    --line:#2a3140;
    --accent:#5cc8ff;
    --accent-2:#ff7eb6;
    --gold:#ffd166;
    --green:#5bd99c;
    --violet:#b98cff;
    --radius:14px;
    --maxw:980px;
  }
```

**Correction to CONTEXT.md.** CONTEXT.md `## Canonical References` names eight tokens
(`--bg`, `--ink`, `--accent`, `--accent-2`, `--gold`, `--green`, `--violet`, `--radius`). All eight
are correct, but the set is **fifteen**. The seven CONTEXT omits are the structural ones the
instrument will need most: `--bg-2`, `--panel`, `--panel-2`, `--ink-dim`, `--ink-faint`, `--line`,
`--maxw`. Copy all fifteen.

**Precedent for extending the palette** (`game-feel-types-frameworks.html:9-13`):

```css
    --bg:#0e1014;--bg-2:#15181f;--panel:#191d26;--panel-2:#1f2530;
    --ink:#e8ebf2;--ink-dim:#a4adbe;--ink-faint:#6c7689;--line:#2a3140;
    --accent:#5cc8ff;--accent-2:#ff7eb6;--gold:#ffd166;--green:#5bd99c;--violet:#b98cff;
    --teal:#2ecf9e;--coral:#ff8a5c;--amber:#ffc14d;--blue:#6aa8ff;
    --radius:14px;--maxw:1000px;
```

The second sibling keeps the thirteen shared colours **byte-identical** and appends four of its
own on a separate line, and raises `--maxw`. That is the established convention: **inherited
tokens first, unchanged; artifact-specific tokens appended on their own line.** Phase 2's
`--cats` / `--mechs` / `--tok-*` additions belong there. Per STACK.md §5 constraint 2, `--maxw`
should **not** carry over at 980/1000 — a two-faction board needs the width.

**Base rules — copy verbatim** (`game-feel-study-guide.html:25-35`):

```css
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{
    margin:0;
    background:radial-gradient(1200px 700px at 80% -10%, #1a2030 0%, var(--bg) 55%) no-repeat fixed,var(--bg);
    color:var(--ink);
    font:16px/1.6 "Segoe UI",system-ui,-apple-system,Roboto,Helvetica,Arial,sans-serif;
    -webkit-font-smoothing:antialiased;
  }
  a{color:var(--accent);text-decoration:none}
  a:hover{text-decoration:underline}
```

The radial gradient, the `no-repeat fixed` + `var(--bg)` two-layer fallback, the font shorthand
and the antialiasing hint are **identical in both siblings** (cf. `game-feel-types-frameworks.html:17-19`).
This is the single most recognizable "part of the course set" signal. Do not paraphrase it.

**`tabular-nums` — the only occurrence in either sibling** (`game-feel-study-guide.html:63`):

```css
  nav .num{display:inline-block;width:22px;color:var(--ink-faint);font-variant-numeric:tabular-nums}
```

One usage, on a fixed-width numeric gutter. STACK.md §5 escalates this to a rule for this
artifact: every counter gets `font-variant-numeric:tabular-nums` so numbers don't jitter when
they change. Phase 1's only numbers are in the selftest report, but establish a `.num` /
`tabular-nums` utility in the `<style>` skeleton now so Phase 2 inherits it.

---

### `<style>` — selftest report + error boundary surfaces — **role-match analog**

Phase 1 renders exactly two visible things: the `#selftest` pass/fail report (D-06) and the error
panel (D-13…D-16). Both should **inherit** existing sibling surfaces rather than invent new ones.

**Panel container — use `.card`** (`game-feel-study-guide.html:88-90`):

```css
  .card{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);
    padding:20px 22px;margin:14px 0}
  .card.tight{padding:16px 18px}
```

**Pass/fail rows — the closest existing analog is `.pro` / `.con`** (`game-feel-types-frameworks.html:87-91`).
This is the only red/green paired treatment anywhere in the sibling set, and it is exactly the
shape a selftest row needs (coloured left rule + uppercase label + body text):

```css
  .prosbar{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px;font-size:13.5px}
  .pro,.con{flex:1;min-width:240px;border-radius:9px;padding:10px 14px;border:1px solid var(--line)}
  .pro{border-left:3px solid var(--green)}.con{border-left:3px solid var(--coral)}
  .pro b,.con b{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.6px;margin-bottom:3px}
  .pro b{color:var(--green)}.con b{color:var(--coral)}
```

**Caveat:** `--coral` is defined **only** in `game-feel-types-frameworks.html:12`, not in the
study guide. If the selftest report uses a fail colour, either add `--coral:#ff8a5c` to the
extension line (matching sibling 2 verbatim) or use `--accent-2:#ff7eb6`, which exists in both.
The study guide's own good/bad pair is a lower-contrast border-only treatment
(`game-feel-study-guide.html:117-118`) and is a weaker fit:

```css
  .eq .bad{border-color:#52323a}
  .eq .good{border-color:#2f5240}
```

**Status badge — use `.ex`** (`game-feel-study-guide.html:142-143`). A small green pill; directly
reusable as a `PASS` chip:

```css
  .ex{display:inline-block;font-size:12px;color:var(--green);background:rgba(91,217,156,.08);
    border:1px solid rgba(91,217,156,.25);padding:2px 9px;border-radius:6px;margin-top:6px}
```

**Error / notice panel — use `.callout` + a modifier** (`game-feel-study-guide.html:106-111`).
The modifier-suffix pattern (`.callout.accent` / `.gold` / `.green` / `.pink`) is the established
way this course set signals severity. `game-feel-types-frameworks.html:60-65` repeats it verbatim
with `.violet` instead of `.pink`, confirming it is a convention and not one file's choice:

```css
  .callout{border-radius:10px;padding:14px 18px;margin:16px 0;border:1px solid var(--line);background:var(--panel-2)}
  .callout.accent{border-left:3px solid var(--accent)}
  .callout.gold{border-left:3px solid var(--gold)}
  .callout.green{border-left:3px solid var(--green)}
  .callout.pink{border-left:3px solid var(--accent-2)}
  .callout b{color:#fff}
```

For the D-13 error panel, `.callout.pink` (i.e. `--accent-2`) is the correct inherited severity
colour — it exists in both siblings and is the only warm accent the study guide defines.

**Label above a panel — use `.eyebrow`** (`game-feel-study-guide.html:96`), identical in
`game-feel-types-frameworks.html:57`. This is how both siblings label a card's category, and it is
the right treatment for "DEVELOPER SELF-TEST" (D-05 requires the report be plainly labelled as a
developer report, not a broken page):

```css
  .eyebrow{color:var(--accent-2);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
```

**Text utilities available for free** (`game-feel-study-guide.html:99-100`):

```css
  .muted{color:var(--ink-dim)}
  .faint{color:var(--ink-faint)}
```

**The D-16 selectable error field has no analog.** Neither sibling contains a `<textarea>`, a
`<dialog>`, or any `user-select` rule (grep-verified: 0 occurrences of `user-select` and `dialog`
in both files). Style it from `.card` + `--panel-2` + `--line` and invent the rest.

---

### TOC comment + section banners — **partial analog**

**D-06 / `<specifics>` require** a table-of-contents comment plus banner comments in the order
`data → model → state → serialize → ops → render → interactions → boot → selftest`. PITFALLS.md
Pitfall 12 (lines 357-383) makes this a Phase 1 obligation: *"Phase 1 sets the skeleton — TOC
comment, section banners, section order, `DEFAULTS` freeze, self-check. Every subsequent phase
inherits it."*

**What the siblings actually have.** There is **no TOC comment and no JS section banner** in
either file. What exists is an HTML-comment banner form, used twice in the study guide
(`game-feel-study-guide.html:185` and `:219`):

```html
  <!-- ============ SIDEBAR ============ -->
  <!-- ============ CONTENT ============ -->
```

…and a lighter single-label form used for every content section
(`game-feel-study-guide.html:238`, `:272`, `:549`, `:618`; `game-feel-types-frameworks.html:146`, `:230`):

```html
    <!-- OVERVIEW -->
    <!-- PART 1 -->
    <!-- LEXICON -->
    <!-- FRAMEWORK 1 -->
```

CSS section comments are minimal and lowercase (`game-feel-study-guide.html:37`, `:65`, `:120`,
`:129`, `:145`; `game-feel-types-frameworks.html:77`):

```css
  /* Layout */
  /* Content */
  /* numbered principle list */
  /* stage flow */
  /* lexicon */
  /* framework header band */
```

JS uses bare single-line labels (`game-feel-study-guide.html:666`, `:671`, `:686`, `:702`):

```js
  // Mobile menu
  // Scrollspy
  // Lexicon filter
  // Back to top
```

**Prescription for the executor.** The `============` bar *shape* is a genuine course convention —
reuse it so the file rhymes visually — but the JS banner content is an invention. Follow
ARCHITECTURE.md lines 173-177, which gives the exact banner form to build to (section number,
purpose line, and an explicit `deps:` line so the dependency graph stays greppable):

```js
/* ===================== §1 MODEL =====================
 * PURE. Takes state as an argument. Never reads App.state.
 * deps: App.data
 * ==================================================== */
```

And PITFALLS.md line 370 for the grep-token discipline: *"listing sections in the order they
appear, with stable grep tokens: `// [S01] CONSTANTS  [S02] STATE  [S03] ENCODE  …`. Then banner
comments `/* ===== [S03] ENCODE ===== */`. Searching `[S03]` jumps you there in every editor."*

ARCHITECTURE.md lines 120-143 also prescribes `#region` markers so editors give a collapsible
outline, and mirrors the CSS sections to the JS sections. Both mechanisms are compatible — pick
one token scheme (`§N` or `[SNN]`) and use it in **both** the `<style>` and the `<script>`.

---

### `data` — frozen `DEFAULTS` — **no analog, greenfield**

Neither sibling contains a single JS data literal. All content is hardcoded in HTML.
Grep-verified: `Object.freeze` appears **0 times** in both files.

**Follow instead:**
- PITFALLS.md line 373 — *"One state object, frozen defaults. `const DEFAULTS = Object.freeze({...})`;
  all state derives from a deep clone of it. This kills the triplicated-defaults bug and gives
  reset and decode-fallback the same source of truth."* This is the direct source of D-02.
- ARCHITECTURE.md line 95 — the `data` contract: *"Frozen board defaults… A `defaults()` factory
  returning a fresh deep copy. Must never: depend on anything, be mutated."*
- CONTEXT.md D-01 for the board numbers, D-03 for the stat model (damage on actions, health on
  units, AP on the faction).

Note `Object.freeze` is shallow — D-02 says "deep-frozen at load", so a recursive freeze walk is
required, and `defaults()` must return a **deep copy** (`structuredClone` is verified present on
`file://` per ARCHITECTURE.md line 48), not the frozen object itself.

---

### `model` — pure eHP/DPS derivations — **no analog, greenfield**

**Follow instead:** ARCHITECTURE.md lines 173-197 gives the complete code shape including the IIFE
wrapper, the private/public split, and `Object.freeze` on the returned surface. STACK.md lines
177-186 gives the state-shape rule that governs it:

> Keep **derived values out of state**. eHP and DPS are functions of state, computed during render.
> ```js
> const effectiveHp = (f) => f.units.reduce((s, u) => s + (u.alive ? u.hp + u.shield : 0), 0);
> ```

Note that snippet reads `u.alive` as a stored flag — consistent with D-00d / D-04's requirement
that `alive` never be derived from `hp === 0` (PITFALLS.md line 286: *"Model death explicitly.
`alive: boolean` separate from `hp`. Zero HP prompts — it does not auto-kill."*).

---

### `state` — slices, `commit()`, snapshot undo, `invalidate()` — **no analog, greenfield**

The siblings have **no state at all**. The study guide's only mutable value is a DOM class
toggle. Grep-verified: `structuredClone` 0, `requestAnimationFrame` 0, `location.hash` 0.

**Follow instead — three research sources, in priority order:**

1. **ARCHITECTURE.md lines 604-615** — the `commit()` shape, which is the literal implementation
   target for D-00a / D-08 / D-10 / D-11:
   ```js
   function commit(label, mutator) {
     const prev = JSON.stringify({ build: cur.build, fight: cur.fight });   // ui excluded
     const coalesce = last && last.label === label && (now() - last.t) < 500;
     if (!coalesce) past.push({ label, snap: prev, t: now() });
     else last.t = now();
     if (past.length > 100) past.shift();
     future.length = 0;
     mutator(cur);
     scheduleUrlSync();
     invalidate();
   }
   ```
   Two Phase-1 deviations from this snippet, both from CONTEXT: D-11 caps the stack at **~30**,
   not 100; and `scheduleUrlSync()` is Phase 4's `serialize` section — Phase 1 leaves a named
   no-op stub so the call site exists and never has to be retrofitted.

2. **ARCHITECTURE.md lines 359-371** — the rAF-coalesced `invalidate()`, verified to collapse 50
   calls into 1 render (T13). Phase 1 builds the coalescing machinery; `App.render.*` is a stub
   until Phase 2.

3. **ARCHITECTURE.md lines 505-511** — the slice-lifetime table that makes D-00b, D-08 and D-09
   concrete (`build` in URL + undo; `fight` in undo only; `ui` in neither).

**The alternative shape in STACK.md lines 107-156 is a different design and must not be
copy-pasted.** It uses `queueMicrotask` + `actions.*` + region `innerHTML` re-render.
ARCHITECTURE.md supersedes it on all three points (rAF not microtask, `ops` not `actions`,
two-tier render not region re-render), and ROADMAP/D-00e lock the ARCHITECTURE version. Read
STACK.md §1 for the *reasoning* about why proxies and pub/sub lose, not for the code.

---

### `ops` — stub transformer layer — **no analog, greenfield**

**Follow instead:** ARCHITECTURE.md line 99 (the `ops` contract), lines 104-111 (why the layer
exists at all — it is called out as *"the highest-value addition to the proposed design"*), and
Anti-Pattern 5 at lines 746-753: *"Every mutation goes through `ops.*` → `state.commit()`. No
exceptions, including 'temporary' debug controls."*

D-11 constrains the surface: `ops.undo()` must be **callable from a button**, not wired only to a
key handler. That means `ops.undo` is a named exported function and the Ctrl+Z handler in `boot`
is a one-line caller.

---

### `boot` — wiring + try/catch error boundary — **partial analog (wiring only)**

**Analog for the wiring shape:** `game-feel-study-guide.html:665-707` — the whole script.

```js
<script>
  // Mobile menu
  const sidebar = document.getElementById('sidebar');
  document.getElementById('menubtn').addEventListener('click', ()=> sidebar.classList.toggle('open'));
  sidebar.addEventListener('click', e=>{ if(e.target.tagName==='A') sidebar.classList.remove('open'); });
```

JS conventions confirmed across both siblings:
- **Bare top-level script.** No IIFE wrapper, no `'use strict'` (grep-verified: 0 in both), no
  namespace object. Legal because it is the only script — but Phase 1 introduces the `App`
  namespace per ARCHITECTURE.md Pattern 1, which is a deliberate, justified divergence at
  3,000 lines. Note it in the TOC comment.
- `const` + arrow functions throughout; **zero occurrences of `function(`** in either file.
- `document.getElementById(...)` for singletons, `[...document.querySelectorAll(...)]` spread for
  collections (`game-feel-study-guide.html:672`, `:675`, `:688`).
- Two-space indent inside `<script>`; camelCase; terse but spaced.
- One weak delegation precedent (`game-feel-study-guide.html:669`): a single listener on
  `sidebar` testing `e.target.tagName`. Phase 2's delegated roots follow ARCHITECTURE.md
  Pattern 6 (`e.target.closest('[data-act]')`), not this.

**Style choice:** the study guide's script is spaced and commented; `game-feel-types-frameworks.html:378-388`
is the same code compressed to near-minified density. **Follow the study guide.** This file will
be 4-6× longer than either sibling (PITFALLS.md line 360) and readability is a stated constraint.

**The error boundary itself has NO analog.** Grep-verified: `try` and `catch` each appear **0
times** in both siblings. Neither has any error handling of any kind.

**Follow instead:** PITFALLS.md line 344 — *"Wrap init and every event handler in try/catch and
render a visible, styled error panel with a 'Reset to defaults' button. This is the cheapest
insurance in the entire project."* Combined with D-13 (wrap init **and** every handler), D-14
(handler failure is non-terminal, init failure is terminal), D-15 (one-click dismiss or reset)
and D-16 (selectable error text field). Style it from `.callout.pink` + `.card` above.

---

### `selftest` — `#selftest`-gated harness — **no analog, greenfield**

No test harness, no hash gating, no assertion helper exists in either sibling.

**Follow instead — two research sources that agree on shape:**

- **STACK.md lines 411-429** — the gate and the assertion helper, which is the closest thing to a
  spec for D-05 / D-07:
  ```js
  // Append #selftest to the file URL to run.
  if (location.hash.includes('selftest')) runSelfTests();

  function runSelfTests() {
    const t = [];
    const eq = (name, a, b) =>
      t.push({ name, pass: JSON.stringify(a) === JSON.stringify(b), a, b });
    ...
    renderResultsPanel(t);
  }
  ```
  Note this collects `{name, pass, a, b}` records and hands them to a **renderer** rather than
  logging — which is exactly what D-06 requires (a readable pass/fail list, not a console dump).
  Prefer this over ARCHITECTURE.md's variant at lines 404-413, which `console.error`s the failures
  and would not satisfy D-06 on its own.

- **PITFALLS.md line 374** — the assertions that substitute for a type checker: *"round-trip the
  encoder, assert every key in `state` exists in `DEFAULTS`, assert no `NaN` in the rendered
  projection."*

Phase 1's assertion list is fixed by **D-07** and ROADMAP success criteria 2 and 3; the codec
assertions in the STACK snippet are Phase 4's (plan 04-01) and must not be written now.

**Render target:** D-05 says it renders *nothing at all* on a normal open. `location.hash.includes('selftest')`
is the gate; the report mounts into an element that is absent or empty otherwise.

---

## Shared Patterns

### The design-token contract
**Source:** `C:\Projects\GameDesignSkills\GameFeelDirectionCourse\game-feel-study-guide.html:8-35`
**Apply to:** the entire `<style>` block, every phase.
Copy the fifteen `:root` tokens and the four base rules verbatim (excerpts above). Append
artifact-specific tokens on their own line, after the inherited set, following
`game-feel-types-frameworks.html:12`. Never hardcode a hex that could be `var(--…)` or a
`color-mix()` of one (STACK.md §5 constraint 2).

### The severity-modifier convention
**Source:** `game-feel-study-guide.html:106-111`, confirmed by `game-feel-types-frameworks.html:60-65`
**Apply to:** the selftest report, the error panel, and every later notice/warning surface.
Base class + colour modifier, expressed as a 3px `border-left` in a palette token over
`--panel-2`. Do not invent a second notice mechanism.

### Structural CSS idioms available for reuse
**Source:** `game-feel-study-guide.html:91-94`
```css
  .grid{display:grid;gap:14px}
  .g2{grid-template-columns:repeat(2,1fr)}
  .g3{grid-template-columns:repeat(3,1fr)}
  @media(max-width:760px){.g2,.g3{grid-template-columns:1fr}}
```
`game-feel-types-frameworks.html:54-55` repeats this with `.g4` and an 820px breakpoint —
i.e. the grid utility set is a convention, the specific columns and breakpoint are per-artifact.
The two-faction board should define its own but keep the `.gN` naming.

### Class-name scoping discipline
**Source:** PITFALLS.md line 372 (no sibling analog — the siblings are small enough not to need it)
**Apply to:** every class Phase 1 and later phases add.
*"Prefix every class with a section tag (`.alloc-row`, `.fight-row`) to fake scoping."* The
siblings use unprefixed generic names (`.card`, `.row`, `.grid`) because at 391-709 lines nothing
collides. At 2,500-4,500 lines it will. Inherited names (`.card`, `.callout`, `.eyebrow`, `.muted`,
`.faint`) keep their sibling names for recognizability; **everything new gets a section prefix.**

### Accessibility baseline
**Source:** `game-feel-study-guide.html:182`, `:194`, `:663`
```html
<button class="menubtn" id="menubtn" aria-label="Toggle menu">☰</button>
<input class="navsearch" id="navsearch" placeholder="Filter the lexicon…" aria-label="Search lexicon">
<a href="#top" class="toplink" id="toplink" aria-label="Back to top">↑</a>
```
Both siblings use `aria-label` on exactly the icon-only controls and nowhere else (3 occurrences
each, grep-verified). Match that bar: label icon-only controls, don't over-annotate.

---

## No Analog Found

Files/sections with no close match in the sibling artifacts. The planner should treat these as
**inventions governed by research**, not replications, and cite the research section in the plan
action rather than a sibling file.

| Section | Role | Data Flow | Reason | Prescribing source |
|---|---|---|---|---|
| `commit(label, mutator)` funnel | store | event-driven | Siblings hold no state whatsoever | ARCHITECTURE.md lines 604-615 (code) + 486-503 (diagram) |
| Snapshot undo stack | store | event-driven | No history, no undo, no `structuredClone` (0 hits) | ARCHITECTURE.md lines 584-631; PITFALLS.md Pitfall 8 lines 241-267 |
| rAF `invalidate()` coalescing | store | event-driven | `requestAnimationFrame` 0 hits in both siblings | ARCHITECTURE.md Pattern 5, lines 353-374 |
| Deep-frozen `DEFAULTS` | config | n/a | `Object.freeze` 0 hits; siblings hardcode content in HTML | PITFALLS.md line 373; ARCHITECTURE.md line 95; CONTEXT D-01/D-02/D-03 |
| Pure `model` derivations | utility | transform | No pure-function layer exists | ARCHITECTURE.md lines 173-197; STACK.md lines 177-186 |
| `ops` layer | service | command | No mutation layer exists | ARCHITECTURE.md line 99, 104-111, 746-753 |
| `#selftest` harness + report renderer | test | batch | No tests, no hash gating (`location.hash` 0 hits) | STACK.md lines 407-438; CONTEXT D-04…D-07 |
| try/catch error boundary + styled panel | middleware | request-response | `try`/`catch` 0 hits in both siblings | PITFALLS.md line 344; CONTEXT D-13…D-16 |
| JS TOC comment + `§N` section banners | organization | n/a | Siblings have HTML-comment banners only; no TOC, no JS banners | PITFALLS.md Pitfall 12 lines 370-375; ARCHITECTURE.md lines 120-157, 173-177 |
| `App` namespace / IIFE module pattern | architecture | n/a | Siblings use bare top-level `const` (0 `function(`, 0 `'use strict'`) | ARCHITECTURE.md Pattern 1, lines 162-221 |

**Two research documents disagree and the planner must pick.** STACK.md §1 (lines 107-156)
prescribes `queueMicrotask` + `actions.*` + region-scoped `innerHTML` re-render with a
`__lastHTML` memo. ARCHITECTURE.md prescribes `requestAnimationFrame` + `ops.*` + two-tier
render. **ARCHITECTURE.md wins** — ROADMAP's build-order note and CONTEXT D-00a/D-00e/D-00f are
written against it, and PITFALLS.md Pitfall 7 (lines 208-237) independently disqualifies
re-render-on-click for this artifact. Use STACK.md §1 for its *rejection arguments* (why Proxy
and pub/sub lose), not for its code.

---

## Metadata

**Analog search scope:**
- `C:\Projects\GameDesignSkills\GameFeelDirectionCourse\` — the only directory containing sibling
  course artifacts. Both `.html` files read in full (709 + 391 lines).
- `C:\Projects\GameDesignSkills\GameFeelDirectionCourse\CatsVsMech\` — confirmed to contain no
  source files (`.git`, `.planning`, `CLAUDE.md` only). No `.claude/skills` or `.agents/skills`.

**Files scanned:** 2 sibling artifacts read in full; 4 planning/research documents read
(CONTEXT.md, ROADMAP.md, ARCHITECTURE.md in full; PITFALLS.md lines 208-386; STACK.md lines
105-188 and 370-449).

**Negative findings verified by grep across both siblings** (`0 / 0` = absent from both):
`Object.freeze`, `try`, `catch`, `'use strict'`, `function(`, `structuredClone`,
`requestAnimationFrame`, `location.hash`, `user-select`, `dialog`, `prefers-reduced-motion`.
Present: `tabular-nums` (1 / 0), `aria-` (3 / 3).

**Pattern extraction date:** 2026-08-26
