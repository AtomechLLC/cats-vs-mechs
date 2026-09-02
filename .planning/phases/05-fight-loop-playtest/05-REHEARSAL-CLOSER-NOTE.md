# Closing the rehearsal debt by machine — 2026-09-02

Read-only on `cats-vs-mechs.html`, `tests/*.cjs` and `tests/browser-checks.mjs`. Everything below
was driven headless in **real Chrome and real Edge** from `file://`, both browsers agreeing on every
figure. Probes: `.planning/phases/05-fight-loop-playtest/rehearsal-closer-probes/`, each writes a `p*-result.json` beside itself on every run (regenerated, not committed).

## Closed by machine — 10

| item | probe | headline |
|---|---|---|
| **REHEARSAL A1** / 2.1 F-02.1-A | `p4-token-authoring.mjs` | 36 of 36 tally controls **reachable**; Cat 1 and Cat 2 raised to 2 **by mouse**. G-02.1-A closed, ALLOC-11 unblocked |
| **A2** / 2.1 check 2 | `p4` | 12 zero lines, **0 occupying any box**; card heights and `#board` byte-identical |
| **A3** / 2.1 check 3 | `p4` | Escape in the field reverts and **leaves the dialog open**; Escape on a swatch closes it and returns focus to Tokens |
| **A4** / 2.1 check 4 | `p4` | 30 typed → 24; 30 pasted emoji → **12 whole, 0 lone surrogates**; op's cap → 24 whole |
| **A5** / 2.1 check 6 | `p4` | rename reaches 16 board labels + row + heading; Damage rename reaches all 6 |
| **A7** / 2.1 check 8 | `p4` | the whole story end to end, **no console anywhere**, one Ctrl+Z restores type + name + appearance + both tallies |
| **A8** / 2.1 check 9 | `p4` | 9.1–9.9 incl. **real middle-click** and a **held Enter** (30 `autoRepeat` keydowns → **one** undo) |
| **B1** / 3 check 1 | `p1-glyphs-and-wrap.mjs` | `≈ ÷ –` rasterised at 96px against **two permanently-unassigned codepoints**; none matches notdef; lines wrap, nothing scrolls |
| **B2** / 3 check 2 | `p2-sticky-short-window.mjs` | pins at **64px exactly** at ten window heights; every figure on screen while pinned down to 400px; threshold bisected to **574px** |
| **D1** / 4 check 2 | `p3-boot-flash.mjs` | linked roster in the DOM **160ms (Chrome) / 43ms (Edge) before first paint**; shipped roster never constructed; screencast agrees over 16 loads |

Partially closed: **2.1 check 5** and **4 check 3** — their geometry and mechanism are measured, their
legibility and wording are not.

## Left human — 4 items and 2 cells

- **A6** — does *"A token type needs a name."* read like a sentence? Wording judgement.
- **A7-projector / E1** — legibility at classroom distance. No instrument has a viewing distance.
- **B3** — the page above the live board, in a room. Owned by the 05-11 playtest.
- **D2** — the reset confirmation's words, and whether Ctrl+Z after it feels like recovery.
- **Clipboard cells 3 and 4 (DevTools focused)** — CDP attaches *as* the DevTools target; it cannot
  focus *into* the panel. Permanently human.
- **9.7's autoscroll circle** — browser chrome drawn outside the page. Permanently human.

Every one of the six is a question about a person, not about an instrument.

## Surprising

1. **G-02.1-D — the in-field Ctrl+Z is not inert.** 2.1 check 6's note says pressing Ctrl+Z with the
   caret in the Name field "should do nothing". The **app's** undo is correctly not run — but the
   **browser's native `<input>` undo is not suppressed**, and the following blur **commits the
   rewound text as a fresh rename**. It lands as a NEW history entry, so two Ctrl+Z presses are then
   needed to reach the old name. Nothing is lost; the file's description is simply not what ships.
   Raised, not fixed — this pass was read-only.
2. **Undo entries coalesce per control.** Twenty clicks on one plus is **one** history entry; a 1.5s
   ramp is one; three clicks on three *different* pluses is three. Not written down anywhere. It
   also means a naive 9.8 proves nothing: with one entry on the stack, "one undo" and "a burst of
   thirty" land on the same number. Driving it needed three distinct entries.
3. **Sticky releases at the foot of the document** (`#board` is its containing block). On a
   768-tall window that takes **2 of 6** projection figures off the top at the last scroll position.
   CSS spec, not a defect — recorded as **G-03-A** because a room would still see it.
4. **The fight-view projection is designed to move.** `--topbar-foot` is republished on scroll, so
   the fixed sidebar's top rises and it grows while its bottom stays put (192 → 130 → 78, bottom
   pinned at 386). The first draft of `p2` scored that as a failure; the CSS banner corrected the
   probe rather than the other way round.
5. **G-02.1-E — focus is on `BODY` when the picker opens.** Phase 2 suspected its own test pane. It
   was not the test pane.
6. **Two probe bugs worth recording because they are the shape of a false green.**
   `goto(URL)` → `goto(URL + '#hash')` is a **same-document** navigation, so the boot-flash probe's
   two "references" were the same screenshot (`refSep 0.00`) — caught only by its own instrument
   check. And `mouse.move()` takes **viewport** coordinates, so a `boundingBox()` of an off-screen
   control aims the mouse at nothing and the press "does nothing" indistinguishably from a broken
   ramp.
7. **The REHEARSAL header's gate premise was three phases stale** — it said `1051 passed / 146 of
   146`. Corrected to the measured **1336 passed, 0 failed, exit 0, interaction gate 216 of 216,
   stub-drift 160 shell ids**.

## Deferred items

`deferred-items.md` was re-read for anything newly machine-closable. **Nothing was.** Every open
entry is already measured in numbers, and what remains open in each is a design or room judgement
owned by the 05-11 playtest. Item 12 is a `tests/` matter and this pass was read-only there.

## Gate

`node tests/selftest-node.cjs` → **1336 passed, 0 failed, exit 0**, interaction gate **216 of 216**,
stub-drift **160 shell ids**. Unchanged — no artifact code was touched.
