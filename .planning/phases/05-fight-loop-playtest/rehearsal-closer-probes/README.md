# The probes that closed ten rehearsal items — 2026-09-02

These are **dev-only, read-only, and NOT shipped**. They live under `.planning/` rather than under
`tests/` deliberately: `tests/browser-checks.mjs` is the repo's browser harness and is owned by the
gate, whereas these are the working instruments of one audit pass. They assert nothing about the
artifact that the UAT files do not already record in prose and numbers, and nothing in the build
depends on them.

Each one is **read-only on `cats-vs-mechs.html`**. None modifies the artifact. Each writes a
`p*-result.json` beside itself when it runs — those are regenerated intermediates and are **not
committed**; add them to your ignore list or delete them after a run.

## Running them

Playwright is not a dependency of this project and never should be. Point `PLAYWRIGHT_DIR` at any
install:

```bash
PLAYWRIGHT_DIR=/path/to/node_modules/playwright \
  node .planning/phases/05-fight-loop-playtest/rehearsal-closer-probes/p1-glyphs-and-wrap.mjs
```

They launch **real Chrome (`channel: 'chrome'`) and real Edge (`channel: 'msedge'`)**, headless, and
load the artifact from `file://` — which is the shipped condition and the point. `HEADED=1` opens
real windows if you want to watch one.

The artifact path is absolute inside each file. If the repo moves, that line moves with it.

## What each one measured, and what it closed

| probe | rows | closes | headline |
|---|---|---|---|
| `p1-glyphs-and-wrap.mjs` | 128 / 0 | REHEARSAL **B1**, 03-UAT check 1 | `≈ ÷ –` rasterised at 96px in the strip's own font against **two permanently-unassigned codepoints** (U+0378, U+0380) — none matches notdef. Lines wrap; nothing scrolls sideways. 1920×1080 and 1366×768 |
| `p2-sticky-short-window.mjs` | 280 / 0 | REHEARSAL **B2**, 03-UAT check 2 | `#strip` pins at **64px exactly** at ten window heights (1080 → 400), five scroll offsets each, both views. Threshold bisected: fits down to a **574px** window |
| `p2b-fixed-why.mjs`, `p2c-fixed-trace.mjs` | diagnosis | — | why the fight-view sidebar's top moves: `--topbar-foot` is republished on scroll, so it **grows upward** while its bottom stays pinned. Kept because the first draft of `p2` scored that as a failure |
| `p3-boot-flash.mjs` | 16 / 0 | REHEARSAL **D1**, 04-UAT check 2 | a document-start signature timeline (MutationObserver + rAF + task boundaries) vs `PerformanceObserver` paint entries, plus CDP `Page.startScreencast` frame classification, over **8 loads per browser**. Both instruments carry positive controls |
| `p4-token-authoring.mjs` | 104 / 0 | REHEARSAL **A1–A5, A7, A8**; 02.1-UAT checks 1–9 | the whole 2.1 rehearsal driven with real clicks, real keystrokes, a real system-clipboard paste, a real middle-click, and a real OS auto-repeat burst via CDP `Input.dispatchKeyEvent({ autoRepeat: true })` |
| `p5-reset-words.mjs` | 14 / 0 | 04-UAT check 3, mechanical half | the reset confirmation's words read off the screen and quoted; Cancel / confirm / one-Ctrl+Z driven end to end |
| `p0c-diag.mjs` | trace | — | the keystroke-by-keystroke trace behind **G-02.1-D** (in-field Ctrl+Z, and the blur that commits it) |
| `p0d-undo-diag.mjs` | trace | — | that **undo entries coalesce per control** — twenty clicks on one plus is ONE entry. Without this, check 9.8 proves nothing |

## Two instrument traps these probes fell into, recorded so the next pass does not

1. **`goto(URL)` then `goto(URL + '#hash')` is a same-document navigation.** The page does not
   reload, so the second screenshot is the first one again. `p3`'s first run produced two identical
   "references" (`refSep 0.00`) and was caught only by its own instrument check. **Use two pages.**
2. **`mouse.move()` takes viewport coordinates.** `locator.boundingBox()` on an off-screen control
   hands back coordinates the mouse cannot reach, so a press-and-hold "does nothing" — which is
   indistinguishable from a broken ramp. **`scrollIntoViewIfNeeded()` before every `mouse.move`.**
   `page.click()` does this for you; `page.mouse` does not.

## What is committed beside them

`shots/` holds **three** of the twelve screenshots `p1` writes on each run — the two glyph strips
(Chrome and Edge at 1920x1080, all seven characters side by side at 64px, the tofu box and U+FFFD
included as references) and one full `#strip` capture. They are the evidence for "screenshot and
read back" in 03-UAT check 1. The other nine are regenerated on any run and are not committed.

No `p*-result.json` is committed. Every figure that mattered is transcribed into the UAT files in
prose; the JSON is a re-derivable intermediate.

## What they deliberately do not do

They install no regression guard. They are measurements taken on one commit, and their value is in
the numbers transcribed into the UAT files. If the artifact changes, re-run them — each takes
between ninety seconds and five minutes.
