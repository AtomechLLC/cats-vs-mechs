# One rehearsal session, four phases of debt

**Assembled 2026-08-29.** Everything below is a check that no automated instrument in this repo can
reach. They accumulated across phases 2.1, 3 and 4 because each phase honestly declined to mark a
browser-only claim as verified from a terminal run. Nothing here is a known defect — it is the set of
things nobody has looked at.

**Read this first:** there were 14 items; **section C was closed by machine on 2026-08-29**, leaving **~6 plus one DevTools cell**. They are ordered so one pass through the artifact
answers all of them, rather than by the phase that raised them. Record results in the per-phase UAT
files (linked per section) so `/gsd:progress` and `/gsd:audit-uat` see them, or mark them here and
I'll transcribe.

**Setup:** open `cats-vs-mechs.html` by **double-clicking it**. Do not serve it — `file://` is the
shipped condition and several of these checks are about `file://` specifically. Have Chrome and Edge
both available; two items need a second browser.

**Before you start**, confirm the gate is green so you're operating a known-good build:

```bash
node tests/selftest-node.cjs
```

Expect `1051 passed, 0 failed`, exit 0, interaction gate `146 of 146`.

---

## A. Sitting at the laptop — 8 items

### A1. Raise a tally by hand *(Phase 2.1 — the one that was impossible)*
This is the highest-value item in the list. ALLOC-11 is still unticked *only* because nobody has ever
done this in a real browser — and at the time of the 2.1 rehearsal it was genuinely impossible
(F-02.1-A: 36 controls built for a fresh unit-scope type, 0 of them reachable, because the modal
editor's backdrop owned every pointer). F-02.1-B fixed it by letting the reveal survive the editor
closing. **Reverting that one line turns 2 of 430 rows red — but no human has confirmed the fix from
the other side of the screen.**

Create a new unit-scope token type, close the editor, and raise its tally by hand.
→ `.planning/phases/02.1-token-authoring-inserted/02.1-HUMAN-UAT.md`

### A2. A zero tally collapses its line and takes no space *(2.1, check 2)*
### A3. Escape inside the name field *(2.1, check 3)* — does it revert and leave the dialog open?
### A4. `maxlength` behaves on a real input *(2.1, check 4)*
### A5. A rename reaches everywhere, and undo reaches back *(2.1, check 6)*
### A6. A refusal reads like a sentence *(2.1, check 7)*
### A7. The end-to-end story *(2.1, check 8)*
### A8. Nothing regressed from Phase 2 *(2.1, check 9)*

Items A2–A8 are scripted in full in the 2.1 UAT file. **Note its own warning:** that script predates
four fixes and says so at the top — read the preamble before running it.

---

## B. Glyphs, wrapping and stickiness — 2 items

### B1. Glyph rendering and wrapping in the strip and reference band *(Phase 3)*
Do `≈`, `÷` and `–` render as intended — not tofu, and not a hyphen that reads as a minus next to the
steppers' own minus? Do the arithmetic lines wrap rather than scroll inside the narrow strip?

### B2. The strip stays sticky when the window is short *(Phase 3)*
Shrink the window height and scroll. A sticky box taller than the space available behaves as though it
were not sticky for the part that doesn't fit — that's the specific failure to look for.

→ `.planning/phases/03-advisory-projection-reference-material/03-HUMAN-UAT.md`

---

## C. The clipboard matrix — ~~1 item, 8 cells~~ **CLOSED BY MACHINE, 2026-08-29**

> **This section no longer needs you.** It was written on a false premise that three phases
> repeated: that no browser was available here. CLAUDE.md said otherwise all along, and nobody
> re-tested it. Measured 2026-08-29: real Chrome **and** real Edge both load the artifact from
> `file://`, report `isSecureContext === true`, and report `permissions.query('clipboard-write')
> === "granted"`.
>
> `tests/browser-checks.mjs` now drives all three tiers in both browsers and reports
> **22 passed / 0 failed**:
>
> | Tier | fires as | line said | clipboard actually got | honest? |
> |---|---|---|---|---|
> | 1 `writeText` | `clipboard` | "Copied to the clipboard." | the code | yes |
> | 2 `execCommand` | `command` | "Copied to the clipboard." | the code | yes |
> | 3 select | `select` | "Select-all is done — press Ctrl+C." | **sentinel untouched** | yes |
>
> The honesty question — *did the line ever claim a copy that did not occur?* — is **no**, in all
> six cells. Tier 3 leaves the code under the selection and does not claim to have copied. The OS
> clipboard was seeded with a sentinel first so a no-op copy was detectable rather than invisible.
>
> The **cross-browser round trip** is also closed: a non-default board carrying a student-made
> token type round-trips byte-identically Chrome→Edge and Edge→Chrome (63-char code).
>
> **What is still yours:** the DevTools-focused cell. Playwright cannot put focus inside the
> DevTools panel, so that one row of the matrix remains genuinely unreached. It is the only part
> of section C left.

<details><summary>The original hand script, kept for the DevTools cell</summary>


### C1. Clipboard tiers 1 and 2 actually fire *(Phase 4)*

**Why this one matters more than it looks.** `navigator` does not exist in the Node runtime, so
`navigator.clipboard.writeText` and `document.execCommand('copy')` have **never executed anywhere in
this repository, in any browser, under any flag.** Tier 3 (select + Ctrl+C) is the only tier this
project has ever proved works — and it is also the last line of defence, because D-18 deliberately
ships no tier 4. SHARE-01 rests entirely on this.

For each cell, press Copy, then read the `data-sh-tier` attribute and record it *beside what the
on-screen line said*. The attribute reads `clipboard` / `command` / `select`.

| # | Browser | Condition | `data-sh-tier` | Line said | Clipboard actually took it? |
|---|---------|-----------|----------------|-----------|------------------------------|
| 1 | Chrome | window focused | | | |
| 2 | Edge | window focused | | | |
| 3 | Chrome | DevTools focused | | | |
| 4 | Edge | DevTools focused | | | |
| 5 | Chrome | window backgrounded | | | |
| 6 | Edge | window backgrounded | | | |
| 7 | Chrome | `navigator.clipboard = undefined` | | | |
| 8 | Edge | `navigator.clipboard = undefined` | | | |

**The question that matters across all eight:** did the line *ever claim a copy that did not occur?*
CLAUDE.md names the optimistic "Copied!" toast as an anti-pattern by name — a silent failure means a
student pastes stale content into Discord and doesn't find out until a classmate loads the wrong board.

Also, while you're here: **copy in Chrome, load in Edge. Then build something different in Edge, copy,
and load it in Chrome.** Both directions, board identical — units, health, shield, action points, token
names and appearance, tallies, authored actions. No automated check in this repo can cross a process
boundary.

</details>

→ `.planning/phases/04-share-reset/04-HUMAN-UAT.md`

---

## D. Two things to watch for, not press — 2 items

### D1. No flash of the shipped board before a linked build renders *(Phase 4)*
Copy a build code, put it in the address bar, open it in a fresh tab, and **watch the first paint.**

Probe Q found that moving the boot step below the first structural invalidate reddened *nothing* —
every automated reading is taken after the frame flushes, so a load landing after first paint is
indistinguishable from one landing before it. The ordering that prevents the flash is held by **a code
comment and nothing else.**

### D2. The reset confirmation's words *(Phase 4)*
Open the reset confirmation and read it. Does it communicate the actual stakes — that a reset's undo
entry can age off the 30-deep stack, which is the entire reason this confirmation exists (D-19) when
token and action removal deliberately have none (D-17)? Then confirm a reset and press Ctrl+Z: does it
feel like recovery?

The Node stub is a hand-made stand-in, not a parser, so static markup text reads as empty there. The
*mechanism* is asserted (checks 91d/91e); the *words* have never been read by anything.

---

## E. The projector — 1 item, and it needs the actual room

### E1. Legibility from classroom distance *(Phase 3, and everything since)*
Put it on the actual workshop display and stand back. Can you read the `≈9 turns to wipe Mechs` /
`≈3 turns to wipe Cats` contrast — the phase's own worked teaching example — and the "What beats what"
band, without zooming or narrating the numbers aloud?

CLAUDE.md is blunt about this one: *"No amount of research substitutes for putting the artifact on the
actual workshop display before the session."*

---

## What is deliberately NOT on this list

- **Phase 2's UAT is complete** — 5 of 5 passed on 2026-08-27.
- **Phase 3.1's rehearsal was closed** by approval on 2026-08-29. Two of its acceptance criteria asked
  for prose and got a blanket answer; that is recorded in `03.1-08-SUMMARY.md` rather than re-opened
  here, since the checkpoint did run.
- **Phase 5's playtest** is not debt — it is a scheduled activity that hasn't happened yet, because
  Phase 5 hasn't been built.

---

## Honest note on how this list came to exist

Every item here was raised by an agent that could have marked it green and moved on. The pattern that
produced it is worth keeping: when a claim could only be supported by a run the harness cannot perform,
the phase recorded the gap instead of the guess. Four phases of that discipline is why this list is 14
items and not zero — and why the 14 are trustworthy as a list of what is genuinely unknown.
