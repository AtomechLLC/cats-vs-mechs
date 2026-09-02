# The eight-hour run — 2026-09-01/02, autonomous, nothing pushed

The developer asked for "8 hours of improvements" and left. This is the account. Everything is
committed locally on `main` — **53 commits ahead of the deployed site** — and nothing was pushed,
so the whole run is reviewable before it goes public.

## The scoreboard

| instrument | at the start | at the end |
|---|---|---|
| `tests/selftest-node.cjs` | 1336/0, gate 216/216, 160 ids | **1336/0, gate 220/220, 163 ids** |
| `tests/selftest-dom.cjs` | did not exist | **1460/0** — 124 formerly-unrun rows now run every time |
| `tests/browser-checks.mjs` | 314/0 | **362/0** |
| live `#selftest` in a real browser | **1458/2 — red since Phase 4** | **1460/0**, Chrome and Edge |
| open rehearsal/UAT items | 17 pending across three phases | **10 closed by machine**, 7 genuinely human |

## What happened, in order

1. **Second full design audit** (05-D39-AUDIT.md) — 115 screenshots, every one read back. Verdict:
   D-33's fixes held (20 of 28 confirmed), but six redirect rounds re-grew the same defect shapes
   in new places. 6 P1s, 15 P2s, 9 P3s.
2. **The DOM runner finally exists** (tests/selftest-dom.cjs) — the debt five phase-3.1 executors
   each paid in a scratchpad, paid once, permanently, sharing `makeStubDom` by require.
3. **Firefox diagnosed, not fixed**: the Playwright binary exists on disk and the OS refuses to
   spawn it (`Permission denied` — policy/MotW). Unblocking security-flagged binaries was not
   something to do unattended. Sharper than CLAUDE.md's old "could not launch"; recorded there.
4. **CLAUDE.md corrected** where it actively misled: its re-render section prescribed `innerHTML`
   — which this artifact's own gate FORBIDS — with the real reconcile's measured numbers now
   beside the historical benchmark; codec sizes brought current; the browser story told true.
5. **Ten rehearsal/UAT items closed by machine** — including A1 (raise a tally by hand: the
   fix nobody had confirmed from the front of the screen; 36/36 controls reachable, ALLOC-11
   unblocked), the glyph-tofu question (settled by rasterising against permanently-unassigned
   codepoints), and the boot flash (the shipped roster is never even constructed on a linked
   load — 160ms/43ms margins measured).
6. **All four D-39 implementation passes** (05-D39a/b/c/d-SUMMARY.md). Highlights:
   - **A typo is a refusal again.** Six typed-value paths routed a bad keystroke into the crash
     panel — stack trace, dialog closed, authoring session gone. Now: a page-owned sentence at
     the control, dialog stays open, and genuinely unexpected throws stay loud (probe DL proved a
     blanket catch would have passed every gate — the discriminator is itself now tested).
   - The live `#selftest` defect fixed (two [S09.11] rows asserted "no location" — true only in
     Node; every human who ever ran the self-test saw 1458/2).
   - One pool reading everywhere; the reference sidebar actually reachable (its cards had sat
     955px into an 836px box since D-33c); the unit popup fits itself into the room with four
     arms; the ledger finally shows a whole round including its action lines; the cancel step
     leaves a receipt; the native-input-undo phantom rename and the focus-on-BODY picker fixed.
   - **A second CSS-parser silent deletion found** (.ld-now's card treatment — a comment typo fed
     prose to the parser and it discarded the block, for three plans, against source that read
     correctly). Gate row 125b now walks the stylesheet the way the parser does, so this class of
     defect cannot ship silently a third time.

## What was promised but folded rather than run standalone

The dedicated accessibility sweep. The audit's keyboard-only traversal, Pass C's focus fixes, and
Pass D's CDP accessibility-tree measurements (P3-1) covered the highest-value ground; a standalone
sweep remains worth doing and is honestly listed as NOT done as its own pass.

## Parked for the developer — decisions, not defects

- The audit's three D-29/D-30-adjacent calls: proposal-pane symbols, badge scale, +/− sign parity.
- P2-15, P3-2, P3-3, P3-6 (each with its reason in 05-D39d-SUMMARY.md).
- Everything already on the 05-11 playtest sheet, unchanged — **the playtest itself remains the
  phase's only gate, and it needs a person.**

## The honest caveats

- 53 commits are local-only. The deployed site still serves the pre-D-36 build. Push when ready.
- Twenty-plus consecutive rendered changes have now each had at least one defect only a picture
  showed. The pattern has not once broken. Whatever ships next, look at it.
