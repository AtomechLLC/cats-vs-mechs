# CLAUDE.md refreshed — what was wrong and what it says now

**2026-09-01. Docs only. No code touched; `node tests/selftest-node.cjs` re-run to prove it:
1336 passed, 0 failed, exit 0, 216 of 216 gate checks, 160 shell ids.**

Three claims in the first document every session reads were actively misleading. All three are
**amended, not erased** — each says what was measured then, what is measured now, and what changed.

---

## 1. It prescribed the pattern the gate forbids

§ 1 told every future session to build with `innerHTML` region re-render and an `__lastHTML` memo,
backed by a 0.79 / 1.82 / 5.54 / 23.03 ms benchmark. The artifact **bans `innerHTML`** — it is in
the `FORBIDDEN` array and the gate fails the build on it — and uses a two-tier
`structure()` / `sync()` keyed reconcile of `createElement` + `textContent`.

**The benchmark was real; only the prescription predates the ban.** So the original table is kept
and relabelled HISTORICAL, under a banner saying exactly that, and the measured replacements from
05-RESEARCH.md § Measurements sit beside it as CURRENT: `sync()` 0.17 ms, `structure()` 2.24 ms,
24v24 at 0.535 / 7.92 ms, and the finding that `sync()` **does not move at all** with a 50-round
ledger on the page. The conclusion "perf is not the constraint" survives with a different reason —
inert DOM outside the keyed walk is free. The hazard that replaced it is recorded: `data-k` scope,
because `withPreservedFocus` takes the *first* `[data-k]` match inside `#board`.

Also turned: the "Immediate-mode region re-render (recommended) — Holds up" verdict row, the
"Explicit DOM patching — correct but expensive" row (it is what shipped, and the cost was worth
paying), and a new `What NOT to Use` row for the sinks.

## 2. Its codec sizes were four phases stale

It quoted **35 chars**, measured before phases 2.1 / 3.1 put token authoring, action authoring,
bounds and round rules on the wire. Replaced with the six measured scenarios from
05-D35a-SUMMARY.md § Measurements — shipped **45**, realistic **344**, 24v24 wide **283**, fully
authored **909**, adversarial **3,542 / 3,744** — plus marginal costs (~5 chars a bounds pair,
~4 a rule), `WIRE_BOUNDS` and the 28-shape refusal matrix.

**The method held and is said to have held.** "Only encode what the student changed" is why the
budget survived the growth. The ≤512 design target **stands**; the ≤120 "typical build" figure was
an extrapolation off the 35 and is amended to ≤400. The Discord analysis is untouched.

## 3. Its "no browser here" era is over — and the Firefox gap got sharper

Real Chrome **and** Edge drive the artifact from `file://` headless via
`channel: 'chrome'`/`'msedge'` — ~**314 cells, 0 failed**, four columns (two browsers × 1920×1080
and 1366×768), clipboard-write **granted** with context permissions. The old "headless denies
clipboard-write" warning is amended to its true, conditional form: the denial only happens if you
do not grant it.

**Firefox is now a sharper gap, not a closed one.** The binary *exists* —
`ms-playwright/firefox-1538/firefox/firefox.exe`, 721,920 bytes, confirmed on disk this session —
and the OS refuses to spawn it (`Permission denied`; policy / MotW). That changes the advice:
another `npm install` will not fix it; it needs an environment change. **The four-tier clipboard
fallback conclusion is kept.** Safari is called out as still entirely untested.

## 4. Swept while in there

- **Development Tools** now names the three-tier harness that exists: `selftest-node.cjs` (the
  gate, 1336/0), `selftest-dom.cjs` (1460/0, the 124-row delta is five DOM-bracketed suites),
  `browser-checks.mjs` (314/0, `HEADED=1`, `PLAYWRIGHT_DIR`, skips clean at exit 0 when Playwright
  is absent). The "~50 lines" in-file-harness claim is corrected in place.
- **§ 6** restructured to Tier 1 (ships) / Tier 2 (Node runners) / Tier 3 (browser), with what
  tier 3 catches that no stub structurally can.
- **`<dialog>` guidance stands**, plus the D-38 lesson: an author `display` on a dialog's class
  repeals the UA's closed-state rule by **cascade origin**, not specificity. Ship
  `…:not([open]){display:none}`.
- **`localStorage` guidance stands** unchanged.
- **Confidence Summary and Gaps** updated coherently, and the measuring documents cited by path in
  a new "Amending sources" block.

## One correction made to the corrections

05-RESEARCH.md cites the `FORBIDDEN` scan at `tests/selftest-node.cjs:40`. That line reference has
drifted since `stub-dom.cjs` was extracted — the array is now at **`:38-51`**, 14 patterns. Read
directly and cited at the current line numbers rather than transcribed.
