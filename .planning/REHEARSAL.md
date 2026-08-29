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

## B. Glyphs, wrapping and stickiness — 3 items

### B1. Glyph rendering and wrapping in the strip and reference band *(Phase 3)*
Do `≈`, `÷` and `–` render as intended — not tofu, and not a hyphen that reads as a minus next to the
steppers' own minus? Do the arithmetic lines wrap rather than scroll inside the narrow strip?

### B2. The strip stays sticky when the window is short *(Phase 3)*
Shrink the window height and scroll. A sticky box taller than the space available behaves as though it
were not sticky for the part that doesn't fit — that's the specific failure to look for.

→ `.planning/phases/03-advisory-projection-reference-material/03-HUMAN-UAT.md`

### B3. The page above the live board — FIXED, and what is left for the room *(Phase 5, plans 05-08 and 05-09; fixed out of sequence before 05-11)*

> **THIS IS NO LONGER A DECISION ON YOUR LIST.** 05-08 handed it on as "three dials, turn one".
> 05-09 swept all three and the answer came back *no dial can*. The structural change 05-09
> measured and declined to ship on its last wave — laying `#fightbar` and `#ledger` side by side —
> **was taken by the orchestrator before this playtest**, because plan 05-11 asks you to play the
> shipped default end to end, twice, hot-seat — and you cannot play a board that is off the bottom
> of the screen. That is the only reason it was done outside the plan sequence.

**Before and after, driven in real Chrome AND real Edge, from `file://`, with a round resolved,
at both sizes. All four combinations agree to the pixel.**

| | Chrome 1920×1080 | Edge 1920×1080 | Chrome 1366×768 | Edge 1366×768 |
|---|---|---|---|---|
| `#board` top, before | 1257 | 1257 | 1048 | 1048 |
| `#board` top, after | **844** | **844** | **730** | **730** |
| viewport | 1080 | 1080 | 768 | 768 |
| the live board is reachable without scrolling | **yes** | **yes** | **yes** | **yes** |

236px of headroom at 1080 and 38px at 768, and **the board does not move at all as rounds pile
up** — measured again at thirty rounds: still 844 and 730.

**The three height dials were not turned down.** `.fg-sides` is still 34vh, `.ld-now-body` is
still 20vh. `.ld-list` went 34vh → **46vh**, which is the number plan 05-06 originally set it at:
side by side the ledger is no longer in the fight bar's budget, so every pixel it spends below the
bar's own height costs the board nothing.

**The property 05-08 chose 34vh for was checked, not assumed.** A ledger row wraps, so the
narrower column made the newest round taller — 353px at the old full width, 446px now. At 34vh
(367px) the whole round no longer fitted: **the property was lost by the rearrangement and
recovered by the dial.** At 1920×1080 the whole of the newest round is on screen at once, in both
browsers.

**What is still not true, and it was not true before either:** at **1366×768 the newest round does
not fit whole** — 46vh is 353px there and a round in that column is 740px, so it scrolls. Every row
of 05-09's dial sweep read *no* at 768, including the shipped one. It is a property of a 768-tall
screen, not of the arrangement.

**Machine-verified already, so do not spend the session re-checking any of it:** `#strip` is still
`position: sticky`, every ancestor of it reports `overflow: visible`, and it pins at 107px at
1920×1080 and 99px at 1366×768 through the whole scroll, at one round and at thirty, in both
browsers. The ledger still scrolls to its end on every append (distance-from-end 0 at every depth).
`#fightbar`, `#ledger` and `#board` share the board's left edge and the band shares its width at
1920 / 1600 / 1440 / 1366 / 1280 / 1179 / 1178 / 1177 / 1100 / 1024 / 900 / 760 / 700. Below
1180px the two regions stack full-width again, which is exactly the arrangement that shipped
before. Zero page errors and zero console errors on every run.

**One thing 05-09 found and fixed rather than handing on**, recorded so it is not re-litigated:
adding PROJ-05's live reading to `#strip` first took the strip to **984px against the 704px a
768-tall screen leaves under the top bar**, and a sticky element taller than the space it has
**stops pinning** — its top measured **-203** where it should have read 64. FIGHT-10's line moved
to the column heads and `.dc-live` took a 24vh bound.

**WHAT ONLY THE ROOM CAN ANSWER, and this is the whole of what B3 still is:**
- Does the fight bar and the ledger **side by side** read as one surface, or as two things
  competing for the same glance? The fight bar is 736px wide during a fight and the ledger takes
  whatever is left (846px at 1920, 568px at 1366) — the bar is now the *narrower* of the two on a
  projector, which is not the emphasis it had when it was full width.
- The ledger's rows are in a **narrower column** now, so each past round is taller and reads as
  more lines. Is a past round still legible at a glance, from the back of a room?
- At 1366×768 the newest round **scrolls**. Watch whether a student notices there is more of it.
- On the actual workshop projector, is 844px of page above the board still too much to ask
  somebody to look past?

→ `.planning/phases/05-fight-loop-playtest/05-HUMAN-UAT.md`

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
