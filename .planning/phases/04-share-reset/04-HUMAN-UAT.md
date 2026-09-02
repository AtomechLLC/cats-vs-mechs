---
status: partial
phase: 04-share-reset
source: [04-VERIFICATION.md]
started: 2026-08-29
updated: 2026-09-02
note: >
  2026-09-02: check 2 (the boot flash) CLOSED BY MACHINE. It was the item this file said was
  unreachable — "every automated reading is taken after the frame flushes" — and that was true of
  every instrument the repo had, but not of CDP screencast plus a document-start signature timeline.
  Check 3's mechanical half is closed and its words are quoted; the wording judgement stays human.
  Check 1's DevTools-focused cell stays human and always will: Playwright drives the page, and the
  DevTools panel is not the page.
---

## Current Test

[check 1's DevTools cell and check 3's wording — both awaiting a person]

## Why these three survived the rehearsal

Plan 04-08 ran a full 26-item browser rehearsal script and it was closed with the single word
"approved". That resolved every item the plan asked about — but the plan's own acceptance criteria
asked for *per-cell readings* on three of them, not a blanket answer, and a blanket answer cannot
supply what those three need. The executor recorded this honestly rather than fabricating readings,
and the verifier confirmed the disclosure was accurate and complete rather than an overclaim.

These are not code defects. Every one of them is a path the Node harness structurally cannot reach.

## Tests

### 1. Clipboard tiers 1 and 2 actually fire, in order, with the right fallback
**STATUS: CLOSED BY MACHINE 2026-08-29 — except the DevTools-focused cell.**
`tests/browser-checks.mjs` drives all three tiers in real Chrome and real Edge: 22 passed, 0 failed.
Tier 1 fires and the clipboard genuinely receives the code; tier 2 fires and genuinely receives it;
tier 3 fires, leaves the code under the selection, does NOT write the clipboard (verified against a
seeded sentinel) and does NOT claim to have copied. The honesty question is answered **no** in all
six cells. Cross-browser round trip is byte-identical both directions.
The premise this item rested on was false: `navigator` DOES exist in a real browser here, and
`permissions.query('clipboard-write')` reads `granted` from `file://`. Only the DevTools-focused
cell remains — Playwright cannot put focus inside the DevTools panel.

**2026-09-02, on that last cell: it is permanently out of machine reach and this is the reason,
stated once so nobody re-attempts it.** Playwright — and CDP generally — drives the *inspected
page*. The DevTools front end is a separate, privileged target that the automation client is
attached *as*, not attached *to*; `Input.dispatchKeyEvent` and every focus primitive address the
page's render frame. Nothing in the protocol can move the OS focus ring into the DevTools window
and leave it there while a click lands on the page beneath. Headless has no DevTools window at all.
So the DevTools-focused row is not "not yet done" — it is a **human-only cell**, and it needs a
person with a real window, F12 open, focus clicked into the panel, and a press on Copy.
result: passed by machine except the DevTools-focused cell, which is [pending — human only]

<details><summary>original item</summary>

expected: Tier 1 (`navigator.clipboard.writeText`) fires in a normal focused window. On failure it
falls through to tier 2 (`document.execCommand`), then tier 3 (select + Ctrl+C). `data-sh-tier` reads
`clipboard` / `command` / `select` correctly per cell. **No cell ever claims a copy that did not
occur.**
why_human: `navigator` does not exist in the Node runtime, so tiers 1 and 2 have **never executed
anywhere in this repository, in any browser, under any flag**. This is the weakest claim in the whole
phase and SHARE-01 rests on it.
how: Open `cats-vs-mechs.html` by double-click. Press Copy in each cell of the matrix — Chrome and
Edge, each with the window focused / DevTools focused / window backgrounded, plus one run with
`navigator.clipboard` set to `undefined` in the console. For each, read the `data-sh-tier` attribute
and record it beside what the on-screen line said.
result: [see above]
</details>

### 2. No flash of the shipped board before a linked build renders
expected: Opening a link carrying a build code shows the classmate's board. There is no visible flash
of the default 9-vs-3 board first.
why_human: PROBE Q reddened nothing when the boot step was moved below the first structural
invalidate — every automated reading is taken after the frame flushes, so a load landing after first
paint is indistinguishable from one landing before it. The ordering is held by a code comment and
nothing else.
how: Copy a build code, put it in the address bar, and open it in a fresh tab. Watch the first paint.
result: **PASSED — CLOSED BY MACHINE 2026-09-02.** 16 rows, 0 failed, real Chrome **and** real Edge,
`file://`, 1366×768, **8 fresh loads per browser** of a hash-carrying URL. Probe:
`.planning/phases/05-fight-loop-playtest/rehearsal-closer-probes/p3-boot-flash.mjs`; raw readings written to `p3-result.json` on each run (regenerated, not committed).
Linked build used: a 1-vs-1 board, hash
`#b=v1~N~V~A1~3~3!0~1*~~~~B1~3~6!3~1*~~~~3gb0`, against the shipped 9-vs-3.

**Why the old premise no longer holds, and what each instrument can and cannot see.**

**INSTRUMENT B is the decisive one, and it DOES bound first paint.** An init script installed at
document-start — before any artifact code runs — records the board's signature (cats card count,
mechs card count, both faction names) at **every MutationObserver microtask checkpoint, every
animation frame, and every task boundary**, timestamped, alongside every `PerformanceObserver`
`paint` entry. The argument is causal rather than observational: **a frame can only paint a state
that survived to a microtask checkpoint or a task boundary** — anything constructed and replaced
inside one task is never painted, because paint happens between tasks. So if the 9-vs-3 roster is
never in any recorded signature, no painted frame could have shown it.

It never is. In all 16 loads the signature timeline reads exactly two entries:

```
chrome   start:0v0 @20.5ms   mutation:1v1 @96.1ms      first-paint = first-contentful-paint = 256ms
msedge   start:0v0 @32.6ms   mutation:1v1 @409.1ms     first-paint = first-contentful-paint = 452ms
```

The linked roster is in the DOM **160ms before first paint in Chrome and 43ms before it in Edge**,
and the board goes straight from empty to the linked build. The shipped roster is never constructed.

**INSTRUMENT A is the pixel corroboration, and its limit is stated rather than glossed.** CDP
`Page.startScreencast({ everyNthFrame: 1 })` was run across each load and every captured frame was
pushed back into a scratch page, drawn to a canvas and classified by mean absolute luma difference
against two references (the shipped board and the linked board) at the same viewport. Result:
**9–10 frames per browser across 8 loads, the linked board recognised in 8/8 loads in both
browsers, and ZERO frames classified as the shipped board.** What it cannot do: a screencast frame
comes from the compositor and can be coalesced or dropped, so instrument A can *prove* a flash and
cannot, on its own, *disprove* one — which is exactly why instrument B carries the verdict.

**Both instruments carry a positive control, because a silent instrument and a clean result look
identical.** Loading the artifact with **no hash** is required to produce at least one frame the
classifier calls DEFAULT (it does) and a timeline that DOES record the 9-vs-3 roster (it does). The
reference-separation check is also a self-test, and it caught a real mistake in the first run of
this probe: `goto(URL)` then `goto(URL + '#hash')` is a **same-document** navigation, so the second
screenshot was the first one again and both references were the default board (`refSep 0.00`). Two
separate pages fixed it; the calibrated separation is 0.98 mean luma with an ink difference of
51591 vs 49331 px.

**What is still held by a code comment.** The ordering itself. This probe measures that the shipped
build is *currently* never in the DOM before first paint; it does not install a regression guard.
If the boot step is ever moved below the first structural invalidate again, this file will not
notice — but `p3-boot-flash.mjs` re-run will, in about ninety seconds.
closed_by: machine — `p3-boot-flash.mjs`

### 3. The reset confirmation's words, and whether Ctrl+Z after it feels like recovery
expected: The dialog's paragraph is legible, non-comparative, and communicates the actual stakes —
that the undo entry for a reset can age off the 30-deep stack, which is the whole reason this
confirmation exists (D-19) when token and action removal deliberately have none (D-17).
why_human: The Node stub is a hand-made stand-in, not a parser, so static markup text reads as empty
there. The *mechanism* is asserted (Cancel costs nothing at check 91d; confirm is exactly one undo
entry and Ctrl+Z fully restores at 91e) — but no automated row has ever read the words.
how: Open the reset confirmation and read it on screen. Then confirm a reset and press Ctrl+Z.
result: **STILL PENDING — but the half that could be measured is closed, and the words no longer
have to be operated for to be judged.** 14 rows, 0 failed, real Chrome and real Edge, `file://`,
1366×768, 2026-09-02. Probe: `.planning/phases/05-fight-loop-playtest/rehearsal-closer-probes/p5-reset-words.mjs`; raw readings
`p5-result.json`.

**THE WORDS, READ OFF THE SCREEN, VERBATIM.** They have now been read by something — which is the
one thing this item said had never happened.

> **Reset to Workshop 16 defaults**
>
> This puts both rosters, both action lists and every token type back to the Workshop 16 defaults.
> One Ctrl+Z brings your board back — but only for the next thirty changes, after which it is gone.
> Copy your build code first if you want to keep it.
>
> `[ Cancel ]  [ Discard and start over ]`

Rendered at **18px / line-height 26.1px / `rgb(164,173,190)` / max-width 543px**, in a 470×130 box,
inside a 520×296 dialog at 423,236 of a 1366×768 window. Not clipped
(`scrollHeight === clientHeight`), wholly inside the window.

**What the machine can assert about them, and did:**
- The paragraph **names the stakes the confirmation exists for** (D-19): it says a Ctrl+Z brings the
  board back AND that the entry ages off after thirty changes AND what happens then.
- It is **non-comparative**: it names no other control and makes no claim about what token or action
  removal does, which is the line D-17 draws.

**The mechanism, driven end to end rather than asserted:** a board built to Cat 1 = 4, Cat 2 = 4,
Mech 1 shield = 4; **Cancel** closes the dialog and costs nothing (all three unchanged); **Discard
and start over** really does return the shipped defaults (3 / 3 / 3, nine Cats); and **one Ctrl+Z
after the confirmed reset restores 4 / 4 / 4 exactly**. Both browsers, zero console errors.

**WHAT IS STILL HUMAN, and it is the whole of what the check was actually about:** whether that
paragraph *reads* as communicating those stakes to a student who is about to lose their build, and
whether the Ctrl+Z afterwards *feels* like recovery rather than like luck. A regex can prove the
word "thirty" is present. It cannot prove the sentence lands. The quotation above is here so that
judgement can be made from this file without operating the artifact.


## Also unclosed, lower stakes

Rehearsal item 8 asked whether the four refusal sentences read as *helpful* rather than merely
distinct. Check 91b proves distinctness (4 of 4); usefulness is a judgement and none was given. The
four sentences are quoted verbatim in `04-07-SUMMARY.md` if you want to judge them without operating
the file.

## Summary

total: 3
passed: 2
issues: 0
pending: 1
skipped: 0
blocked: 0

**Read the numbers this way.** Check 1 was closed by machine on 2026-08-29 except one cell; check 2
was closed by machine on 2026-09-02 and is fully closed; check 3 is counted **pending**, because
its mechanism is proved and its subject — the wording — is not the mechanism. Two human cells
remain on this page and they are of different kinds: check 1's DevTools cell is *unreachable* by
any automation, and check 3's wording is *unjudgeable* by any automation.

## Gaps

- **G-04-A (OPEN — human only, and permanently so).** The DevTools-focused clipboard cell in check
  1. CDP attaches the client *as* the DevTools target; it cannot put focus *into* a DevTools panel
  and press Copy on the page beneath. Needs a person, a real window and F12.
- **G-04-B (OPEN — human only).** Check 3's wording judgement, and whether Ctrl+Z after a reset
  feels like recovery. The words are quoted verbatim above so no one has to open the file to form
  a view.
- **G-04-C (CLOSED 2026-09-02).** The boot flash. Closed on a causal bound on first paint plus
  screencast corroboration in two browsers over sixteen loads — `p3-boot-flash.mjs`.
