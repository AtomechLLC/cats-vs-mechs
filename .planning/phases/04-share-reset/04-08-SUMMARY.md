---
phase: 04-share-reset
plan: 08
subsystem: verification
tags: [rehearsal, human-verify, checkpoint, no-code-change, decision-confirmation, clipboard-matrix, low-confidence-closure]

requires:
  - phase: 04-share-reset
    plan: 02
    provides: "the six measured code lengths — 45 / 297 / 283 / 675 / 2,984 / 3,186 — which items 15 and 25 are judgements about"
  - phase: 04-share-reset
    plan: 04
    provides: "commitInitial (D-20), the debounced history.replaceState hash mirror, and PROBE Q's finding that the no-flash boot ordering is held by a comment alone"
  - phase: 04-share-reset
    plan: 05
    provides: "the two dialog roots — #share with two panes, #reset-ask on its own — the character count, and OVER_BUDGET behind CODE_WARN"
  - phase: 04-share-reset
    plan: 06
    provides: "the three-tier copy press, data-sh-tier, and limitations entry 16 naming tiers 1 and 2 as never executed anywhere in this repo"
  - phase: 04-share-reset
    plan: 07
    provides: "the four refusal sentences, the reset confirmation wired, and the phase's own acceptance run (checks 91–91e)"
provides:
  - "the rehearsal record — the phase's whole LOW-confidence list put to a person and answered"
  - "decisions 21 through 26 CONFIRMED by the developer, each with its cost and its declined alternative recorded"
  - "an explicit, unhedged record of WHICH claims in this phase rest on blanket approval rather than on a transcribed observation or an automated row — clipboard tiers 1 and 2 named as the weakest"
  - "the roadmap's 2-browsers x 3-focus-states x forced-tier-3 matrix written out cell by cell, with each cell's evidentiary basis stated"
affects: [phase-5-fight-loop, phase-4-verification]

tech-stack:
  added: []
  patterns: []

key-files:
  created:
    - .planning/phases/04-share-reset/04-08-SUMMARY.md
  modified: []

key-decisions:
  - "D-21 CONFIRMED — share and load stay ONE dialog with TWO panes. The panes did not fight. Declined: two separate dialogs, which would have cost a second opener, a second binder, a second fingerprint and a second root."
  - "D-22 CONFIRMED — the reset confirmation keeps its own #reset-ask root rather than becoming a third pane on #share. A confirmation is a different act with a different opener, SHARE criterion 4 wants it visually apart, and Phase 5 will want reset on the topbar beside share. Cost accepted: about five extra shell ids and one more harvest root."
  - "D-23 CONFIRMED — the address-bar mirror stays on history.replaceState. Declined: assigning location.hash, which would push a history entry per commit and turn the Back button into a second undo stack — the exact thing SHARE-05 says never to present."
  - "D-24 CONFIRMED — a build loaded from a link creates NO undo entry, and the mechanism stays [S03] commitInitial, a second named writer guarded to run once and only before any commit. Declined: committing normally and accepting one entry."
  - "D-25 CONFIRMED — CODE_WARN stays 1800 and OVER_BUDGET stays 'This code is longer than a message allows.' Neither the threshold nor the wording moved."
  - "D-26 CONFIRMED AS ACCEPTED-UNMEASURED — CODE_LIMIT's 2000 stands on two mutually consistent secondary sources and is NOT to be verified before the workshop. It remains the one number in this phase nobody measured directly, and its comment already says so."
  - "No constant moved. The plan's one permitted code change was contingent on a redirect that did not come, so git diff over cats-vs-mechs.html is empty."

patterns-established:
  - "A rehearsal that asks for per-item prose and receives a blanket approval must record the DIFFERENCE per item, not a uniform 'held'. Where the underlying code has never executed anywhere in the repo, the approval is the only evidence that exists and the record has to say so in those terms."

requirements-completed: [SHARE-01, SHARE-02, SHARE-03, SHARE-04, SHARE-05, SHARE-06, SHARE-08]

metrics:
  duration: ~35min (continuation agent; Task 1 resolved by the orchestrator)
  completed: 2026-08-29
---

# Phase 4 Plan 08: The Rehearsal Summary

The whole of Phase 4 was put in front of the developer as a twenty-six-item script — a two-browser
clipboard matrix, four refusal sentences, a reload, a bookmark, a flash nobody can automate, a
projector legibility pass and six decisions taken on their behalf — and came back approved in one
word. Every item held, all six decisions are confirmed, and not one byte of `cats-vs-mechs.html`
changed.

## What Happened

This plan had exactly two tasks: a blocking `checkpoint:human-verify` and a task whose entire body was
conditional on what the checkpoint returned.

**Task 1** was the checkpoint. The pre-rehearsal gate was re-run immediately before it and exited 0.
The orchestrator then presented the plan's full script to the developer by structure: the clipboard
matrix (items 1–7, across two browsers and three focus states plus a forced tier 3 and the
cross-browser round trip); item 8's four refusal sentences; items 9–20 covering layout, legibility,
character count, Escape, projector legibility and the reset confirmation text; and items 21–26, each
of the six handed-back decisions stated in full with its cost and its alternative.

**The developer's complete response was the single word: "approved".**

Per the plan's own `<resume-signal>` — *"Type 'approved' if everything held and all six decisions are
confirmed"* — that resolves as: every item 1–20 held, nothing broke, and decisions 21 through 26 are
each confirmed.

**Task 2** therefore took the branch the plan wrote for exactly this outcome: *"If everything held and
all six decisions were confirmed, change no code. Record the rehearsal, item by item, and finish."*
No code was changed. This SUMMARY is the deliverable.

**This is the second consecutive rehearsal to close on a one-word approval.** The 03.1-08 plan named
that as its record's weakest line, and 04-08's objective quoted it back and asked for per-item answers
because of it. The answers did not come in that form. The section titled **"The Weakest Lines in This
Record"** below is where that is set out rather than smoothed over, and this phase's version of it is
materially worse than 03.1's — because two of the covered items are the only evidence that exists for
code which has never run anywhere in this repository, under any flag, in any environment.

---

## A. The Matrix

The ROADMAP's verification note asked for a matrix rather than a smoke test: *"2 browsers × focused /
DevTools-focused / backgrounded × forced Tier-3 fallback."* It is written out cell by cell below,
which is what the plan required. What each cell **contains** is a different question, and the
`Evidentiary basis` column is the honest answer to it.

Three tiers ship, not four. `[S07.4]`'s copy press is tier 1 `navigator.clipboard.writeText`,
tier 2 `document.execCommand('copy')`, tier 3 select-all-and-say-Ctrl+C. CLAUDE.md's tier 4 — a Blob
URL with `<a download>` — was never built; `grep -c "Blob\|createObjectURL\|download" cats-vs-mechs.html`
prints **0**, recorded below.

| # | Browser | Focus state | What the cell asks | Recorded answer | Tier reading (`data-sh-tier`) | Evidentiary basis |
|---|---------|-------------|--------------------|-----------------|-------------------------------|-------------------|
| 1 | Chrome | window focused | Copy says the code reached the clipboard; paste matches the field | **Held.** | **Not transcribed.** | Blanket approval only. Tier 1 is never executed in CI. |
| 2 | Edge | window focused | same two questions | **Held.** | **Not transcribed.** | Blanket approval only. Tier 1 is never executed in CI. |
| 2b | Firefox | window focused | bonus cell, only if installed | **Not reported either way.** No Firefox reading was given, and none was required — the script marked it a bonus. CLAUDE.md's Firefox gap therefore stands unchanged. | — | Absent from the response. |
| 3 | Chrome | DevTools focused | what the line says, and whether the clipboard took it | **Held.** | **Not transcribed.** | Blanket approval only. |
| 4 | Chrome | window backgrounded | click through to Copy without first clicking the page | **Held.** | **Not transcribed.** | Blanket approval only. |
| 5 | Chrome | forced tier 3 (`navigator.clipboard = undefined`) | field already selected, line says press Ctrl+C, and it arrives | **Held.** | **Not transcribed.** Tier 3 is the one tier CI does drive: check `90e` reads `said="Copied to the clipboard."`… see note below. | Blanket approval **plus** an automated row — the only cell with both. |
| 5b-3 | Edge | DevTools focused | item 3 repeated in the second browser | **Held.** | **Not transcribed.** | Blanket approval only. |
| 5b-4 | Edge | window backgrounded | item 4 repeated in the second browser | **Held.** | **Not transcribed.** | Blanket approval only. |
| 5b-5 | Edge | forced tier 3 | item 5 repeated in the second browser | **Held.** | **Not transcribed.** | Blanket approval only. |
| 6 | both | across 1–5b | the honesty check: did the line ever claim a copy that did not occur? | **Held — no cell reported a false claim.** | — | Blanket approval. This is the cell CLAUDE.md's anti-pattern is named after and it carries no prose. |
| 7 | Chrome ↔ Edge | both directions | a full cross-browser round trip, emoji name checked specifically | **Held — the board is identical in both directions.** | — | Blanket approval only. No automated check in this repo can cross a process boundary (limitations entry 17). |

**The note on cell 5.** Check `90e` in `tests/selftest-node.cjs` drives a real Copy press in a sandbox
with no clipboard API and no copy command, and asserts the tier-3 branch: the code field is left
focused with the whole of the code selected, the line reads the select-all sentence, `data-sh-tier`
reads `"select"`, and the styled error panel stays hidden. So **the branch cell 5 exercises is the one
branch of the matrix that is independently proved to exist and to be taken.** Every other cell rests
on the approval alone.

### The two lines a student can read, verbatim

Read off the page after real presses, quoted from plan 04-06's record rather than from the developer:

```
Copied to the clipboard.
```
```
Select-all is done — press Ctrl+C.
```

Tiers 1 and 2 deliberately say the **same** sentence — from the student's side it is the same fact,
and naming the platform API would be jargon on a projector. Which tier fired is recorded on
`data-sh-tier` (`clipboard` / `command` / `select`), which is exactly the attribute this rehearsal was
supposed to read out cell by cell.

---

## B. Loading, Refusing, Reloading

| # | Item | Recorded answer | Evidentiary basis |
|---|------|-----------------|-------------------|
| 8 | delete the last dozen characters from a good code, paste, Load — read the message aloud; is it actionable? | **Held.** No prose was given. | Blanket approval. The sentence itself is pinned by check `91b`. |
| 9 | three more tampers — one character in the middle, `v1`→`v2`, a sentence of prose — do you get four different, useful messages, or one sentence in four coats? | **Held — four different messages, and no complaint about any of them.** No prose was given on whether they read as *helpful* rather than merely distinct. | Blanket approval for the judgement; check `91b` for the distinctness. |
| 10 | reload the page with a build on screen; bookmark it, close the tab, reopen | **Held — the build is still there both times.** | Blanket approval. Harness limitations entry 14: no automated reading in this repo performs a real reload or a real bookmark. |
| 11 | open a shared link, press Ctrl+Z immediately — nothing should happen | **Held — nothing happened.** | Blanket approval **plus** check `80`, which reads the undo stack empty on a freshly booted link and `undo()` returning false. |
| 12 | damage the link in the address bar — the shipped board, a message naming the fault, a dismiss control, still usable. **And: did you see a flash in item 11?** | **Held — and no flash was reported.** | Blanket approval. Check `81` covers the damaged-link half. The **flash** half is covered by nothing else at all — see the weakest-lines section. |
| 13 | `#selftest` and a build code as two comma-separated hash tokens — both work, and `#selftest` survives a stepper press | **Held.** | Blanket approval **plus** checks `82` (read half) and `78` (write half). |

### The four refusal sentences, verbatim

These are what a student reads. Quoted from the artifact and from plan 04-07's record, where they were
read off the page after four real Load presses on four real tamper shapes — **not** transcribed from
the developer, who gave none:

| token | the sentence on screen |
|---|---|
| `shape` | `That doesn't look like a build code.` |
| `version` | `That build code was written by an older version of this file.` |
| `checksum` | `That build code looks incomplete — it may have been cut off when it was copied.` |
| `content` | `That build code names something this board can't show — the roster is out of bounds.` |

And the fifth string, a **second** `content` refusal with a different `what`, which is what proves the
page is not dropping the offending thing and saying only that something was wrong:

```
That build code names something this board can't show — a token type is the wrong shape.
```

Item 8 asked for one of these in the developer's own words; item 9 asked whether all four are
**useful** or whether any is the same sentence wearing different clothes. **Distinctness is proved by
check `91b` — `distinct sentences=4 of 4`. Usefulness is not, and cannot be: it is a judgement only a
person can make, and no prose was given.** That is stated again below.

---

## C. The Board, the Surface, and the Room

| # | Item | Recorded answer | Evidentiary basis |
|---|------|-----------------|-------------------|
| 14 | do both dialogs fit the viewport; does a large board's code field scroll rather than overflow? | **Held — both fit, the field scrolls.** | Blanket approval. No layout engine exists in the harness (limitations entry 5). |
| 15 | from the back of the room: is the character count legible, and does it read as a **fact about the code** rather than an opinion about the build? | **Held.** No prose was given. | Blanket approval for legibility. The no-opinion half is independently held by check `85`, which asserts the whole sentence and would redden on any adjective, and by Layers A/B/C. |
| 16 | push past the warning threshold and read the line — descriptive, or the tool judging your build? | **Held — descriptive.** No prose was given. | Blanket approval for the judgement; check `88` drives a real board over the threshold and asserts the line describes the CODE. |
| 17 | from the back of the room, does the reset control read as visually apart from the non-destructive controls **without reading the words**? | **Held — it reads apart.** No prose was given. | Blanket approval only. This is SHARE criterion 4 and it is a pure visual judgement. |
| 18 | Escape on **both** dialogs — inside the paste field it reverts and stays open; again with nothing focused, it closes | **Held on both.** **No verbatim behaviour was transcribed.** | Blanket approval only. The Node stub has no close-request behaviour at all; this is untested code in both surfaces. |
| 19 | reset → read → Cancel (nothing changes) → reset → confirm → Ctrl+Z. **Does that feel like recovery?** | **Held — it felt like recovery.** No prose was given. | Blanket approval for the feeling. Check `91d` proves Cancel is byte-identical; check `91e` proves confirm is exactly one undo entry and one press brings the build back byte-for-byte. |
| 20 | does the emoji name render correctly on the receiving side — picker, board, and the code in the share field? | **Held everywhere.** | Blanket approval. Astral round-tripping is pinned by the `[S09.11]` build-code rows; **rendering** is not. |

### The reset confirmation's rendered text, verbatim

Static markup from plan 04-05, unchanged by this plan:

```
Reset
Reset to Workshop 16 defaults
This puts both rosters, both action lists and every token type back to the Workshop 16
defaults. One Ctrl+Z brings your board back — but only for the next thirty changes, after
which it is gone. Copy your build code first if you want to keep it.
[Cancel]  [Discard and start over]
```

**The harness cannot read this text** — harness limitations entry 5: the stub page is a hand-made
stand-in and not a parser, so text written directly into the HTML is empty there. Layer A scans it in
the document, which proves it carries no comparative language; **no driven row asserts what it says.**
Item 19 was the one reading of this text by a person, and it produced no prose.

---

## D. The Six Decisions

All six were put to the developer with their reasoning, their cost and their declined alternative.
All six came back confirmed.

### 21. One share dialog with two panes — **CONFIRMED**

Share and load stay one surface. The panes did not fight, so the cheap-deviation escape hatch the
orchestrator's own note left open was not taken. **Declined:** splitting into two dialogs, which would
have cost a second opener, a second binder, a second root and a second fingerprint. `#share` keeps its
two panes and check `90d` keeps asserting the switch both ways.

### 22. Reset gets its own dialog rather than a third pane — **CONFIRMED**

`#reset-ask` stays a root of its own. The three reasons put to the developer and accepted: a
confirmation is a different act with a different opener; SHARE criterion 4 wants it visually apart
(item 17, which held); and Phase 5 will want reset on the topbar beside share. **Cost accepted:** about
five extra shell ids and one more Layer C harvest root — visible in the gate reading as *145 rendered
strings across 4 dialog roots* where before this phase there were 2.

### 23. `history.replaceState`, not hash assignment — **CONFIRMED**

The address-bar mirror stays on `history.replaceState`. **Declined:** assigning `location.hash`, which
pushes a history entry per commit, so Back would walk the student's whole edit history and the address
bar would start behaving like a second undo stack — the exact thing **SHARE-05 says never to present.**
The developer was offered "say you want Back to walk the edits" and did not take it.

### 24. A build from a link creates no undo entry, via `commitInitial` — **CONFIRMED**

The behaviour (D-20) was already the developer's. **The mechanism was the plan's, and is now theirs
too:** `[S03] commitInitial`, a second named writer outside `[S05]`, guarded to refuse unless nothing
has been committed and the stack is empty. **Declined:** committing normally and accepting one entry —
the only alternative that keeps the single-writer rule. Checks `80`, `82b` and PROBE N hold the guard;
PROBE N is the reason a probe removing it is the only way to make it run twice.

### 25. `CODE_WARN` = 1800, and the wording — **CONFIRMED, nothing moved**

Both the threshold and the string stand. The constant is untouched at `cats-vs-mechs.html:2275`:

```js
var CODE_WARN = 1800;
```

and the line it gates is untouched at `cats-vs-mechs.html:9469`:

```js
var OVER_BUDGET = 'This code is longer than a message allows.';
```

The scale put to the developer, from plan 04-02's six measured lengths:

| Board | What it exercises | Measured | Against `CODE_WARN` 1800 |
|---|---|---|---|
| A | the shipped board, untouched | **45** | far under |
| B | a realistic 12v5 student build | **297** | far under |
| D | 24v24, distinct health and shield on every unit | **283** | far under |
| E | 24v24 fully authored, ordinary short names | **675** | under |
| H | the ceiling, distinct 24-character ASCII names | **2,984** | over |
| I | the ceiling, distinct 23-astral-emoji names | **3,186** | over |

Only a deliberately adversarial board crosses the line, which is what the threshold was chosen for.
**Because nothing moved, the `[S09.11]` rows that read `CODE_WARN` and the `[S06.6]` threshold
behaviour that draws `OVER_BUDGET` are untouched, and the comment beside the constant stands with its
original arithmetic still true.** That comment is the one the plan would have required rewriting under
a redirect; there was none.

### 26. `CODE_LIMIT` = 2000 — **CONFIRMED AS ACCEPTED-UNMEASURED**

The developer was asked whether they wanted the figure verified before the workshop, or whether the
threshold copy is fine as it stands. The approval takes the second branch: **the threshold copy stands
and the number is not to be verified.**

`CODE_LIMIT` is untouched at `cats-vs-mechs.html:2282`, and its comment already carries exactly the
caveat this decision confirms:

```js
// CODE_LIMIT is the free-tier message limit, and it is the ONE number in this
// phase that is not measured: it is inherited from CLAUDE.md's two secondary
// sources, which agree with each other and neither of which is a first-party
// document. MEDIUM confidence, recorded as such here so the next reader knows
// which figure to re-check first. Every other number above was round-tripped.
var CODE_LIMIT = 2000;
```

The plan's redirect branch — *"record it as an open question against `CODE_LIMIT` with a note in its
comment"* — was **not** taken, because the answer was to accept rather than to verify, and the comment
already says everything that note would have said. **This remains the one number in Phase 4 that
nobody verified directly, and this record does not pretend otherwise.** It is confirmed as
accepted-unmeasured, which is a different thing from confirmed as correct.

---

## The Weakest Lines in This Record

**This section exists because the plan's acceptance criteria refused a blanket approval by name — *"A
blanket approval does not close this checkpoint"* — and one arrived anyway. A future reader and the
phase verifier must be able to see exactly which claims rest on it.**

The plan required, in as many words:

- the matrix recorded **cell by cell, each naming which tier actually fired and what the line said**;
- item 8's message and item 9's four messages **verbatim**, plus the developer's own words on whether
  they are useful;
- item 18's actual behaviour **verbatim for both dialogs**, because it is untested code;
- items 15, 16, 17 and 19 as **the developer's own judgement**, not as a pass mark.

The developer received all of this — the matrix cell by cell, the four sentences, item 18's warning
that the Node stub has no close-request behaviour at all — and answered **"approved"** for the whole
set at once.

### 1. Clipboard tiers 1 and 2. This is the weakest claim in the entire phase.

`navigator` does not exist in the Node runtime, and `document.execCommand` is not on the stub page.
That is harness limitations entry 16, which states it flatly: tiers 1 and 2 of `[S07.4]`'s copy press
are **"never executed here — not in any browser, not under any flag, not once."**

So for the proposition *the clipboard path works*, **the blanket approval is the only evidence that
exists anywhere in this repository.** Entry 16 lists five things that are not proved by any check:

- that the tier-1 and tier-2 arms ever fire at all;
- that they fire in the right order;
- that the promise's resolve arm upgrades the line;
- that its reject arm falls through to the copy command;
- that a permission refusal stays out of the styled error panel.

Every one of those was to be closed by items 1–6 reading `data-sh-tier` per cell. **No tier reading was
transcribed for any cell.** What the record holds is that a person pressed Copy in two browsers in
three focus states and did not report a problem. That is real evidence and it is not nothing — but it
is one step removed from the per-cell reading the plan asked for, and every cell but the forced tier-3
one rests on it alone.

**Item 6 is the sharpest version of this.** It asked, across all cells, whether the line ever claimed a
copy that did not occur — the anti-pattern CLAUDE.md names by name and the entire reason the tiers
exist. It is answered by approval and by no prose.

### 2. Item 9's usefulness judgement.

Item 9 asked whether the four refusal sentences are **all useful**, or whether any is *"the same
sentence wearing different clothes."* Check `91b` proves they are **distinct** — `distinct sentences=4
of 4`, driven one tamper shape at a time through the real Load press, with a fifth shape proving the
content one names the offending thing. **Distinctness is not usefulness.** Four sentences can be
perfectly distinct and all four unhelpful. That judgement is one only a person can make, no prose was
given, and none is invented here.

### 3. Item 12's flash.

Whether the shipped nine-and-three board visibly appears and is replaced when a link with a build code
opens is **held by a comment above the boot step and by nothing else.** PROBE Q relocated that step
below the first structural invalidate and **reddened nothing** — 1049 passed, 0 failed, interaction
gate 128 of 128 — which plan 04-04 recorded as a finding rather than a pass. Every automated reading in
this repo is taken after the frame has flushed, so a load landing after the first paint produces an
identical final page. It is harness limitations entry 15. **The approval is the only evidence there is
no flash**, and unlike the clipboard it is not even a positive observation — item 12 asked whether the
developer *saw* one, and silence under a blanket approval is being read as "no".

### 4. The reset confirmation's rendered text.

The paragraph quoted above under item 19 is unreadable by the harness (limitations entry 5) and **no
driven row asserts what it says.** Layer A proves it carries no comparative language. Checks `91d` and
`91e` prove the mechanism it describes — Cancel costs nothing, confirm is one undo entry, one Ctrl+Z
restores byte-for-byte. But whether the words on screen are the right words, and whether pressing
Ctrl+Z after a confirmed reset *feels* like recovery, is item 19, and item 19 produced no prose.

### 5. Item 18, on both dialogs.

Escape-in-a-field-reverts-and-stays-open, Escape-again-closes. The Node stub has no close-request
behaviour whatsoever, so this is untested code on **both** new surfaces. The approval means the
described behaviour held; it is the script's description carried forward, not an observation
transcribed from a browser. This is the same residual 03.1-08 recorded for its item 10, one phase
later and now doubled across two roots.

### 6. Item 17, and items 15's and 16's legibility halves.

Projector legibility and visual separation are pure human judgements with no automated analogue at all.
They are approved and unquoted. CLAUDE.md's own gap list already says this: *"Projector legibility is
an empirical question that only a rehearsal answers."* The rehearsal answered it with one word.

### What this is, and what it is not

**This is not a failure.** The gate was put to a person, the person opened the artifact by
double-click in two real browsers, moved a build between them with the actual clipboard, and approved
it. The plan's own resume-signal defines "approved" as exactly this outcome, and the checkpoint is
properly closed.

**It is also the second consecutive rehearsal to close this way**, after 04-08's objective quoted
03.1-08's self-criticism specifically to prevent it. If the phase verifier or a later reader wants the
per-cell `data-sh-tier` readings, item 9's usefulness judgement, item 18's verbatim behaviour, or items
15–17 and 19 in the developer's own words, **they must ask for them again; they do not exist yet.**

The single highest-value thing to re-ask for is the **tier reading in cell 3 and cell 4** — DevTools
focused and window backgrounded. Those are the two states where Chrome's user-gesture requirement is
most likely to reject `writeText`, which is precisely where the fall-through to tier 2 and then tier 3
matters, and it is exactly the fall-through that has never executed.

---

## What Changed in the Code

**Nothing.**

```
$ git diff --stat cats-vs-mechs.html
(empty)

$ git status --short
(empty)
```

`git diff` over `cats-vs-mechs.html` is **empty**, which is what the plan's acceptance criteria require
when no redirect came. `CODE_WARN` was not touched. `CODE_LIMIT` was not touched. `OVER_BUDGET` was not
touched. Neither dialog root moved. No `[S09.11]` row and no `[S06.6]` behaviour was updated, because
nothing they read had changed.

**No structural redirect was issued.** Decisions 21, 22, 23 and 24 were each confirmed, so the plan's
*"do not implement the redirect in this plan — that is a replan, not a task"* branch was not reached
for any of them. There is nothing to hand to another plan and no region to name.

---

## Verification

### The pre-rehearsal gate (run immediately before the rehearsal, exit 0)

The plan required the suite re-run immediately before the rehearsal with its **full output** recorded,
so the person is operating a build whose gates are known green. It was. The full output — 1,210 lines —
is preserved at:

```
C:\Users\alexy\AppData\Local\Temp\claude\C--Projects-GameDesignSkills-GameFeelDirectionCourse-CatsVsMech\6955a1c2-1679-4a99-be89-fd3975b5abb0\scratchpad\phase04-pre-rehearsal-gate.txt
```

Every report line in it, quoted:

```
scan: no forbidden patterns
scan: no comparative language in the document (Layer A, 16 words)
scan: no comparative language in the 5582 string literals (Layer B, 23 words)
1051 passed, 0 failed
perf: 100 commits in 7 ms (budget 50 ms)
stub-drift gate: 96 shell ids, all built by the stub page
scan: 127 rendered strings read from #app (Layer C, 39 words)
scan: 145 rendered strings read from 4 dialog root(s) — #tok-picker, #act-edit, #share, #reset-ask (Layer C, floor 138)
scan: 60 rendered strings read from #act-edit-propose with the pane OPEN (Layer C, floor 23), of which 24 are chooser ticks
second stub page: the artifact parsed, evaluated and booted from a prepared hash in 14 ms
interaction gate: 146 of 146 checks passed
exit=0
```

The three constants this plan could have moved are printed by the suite itself as informational rows,
which is how the developer saw them:

```
PASS  build code :: CODE_TARGET — the design target for a board a student actually builds
PASS  build code :: CODE_WARN — the point past which the surface says a code is longer than a message allows
PASS  build code :: CODE_LIMIT — the free-tier message limit, and the one figure in this phase inherited from secondary sources rather than measured
```

### The post-rehearsal gate (Task 2's own verification, exit 0)

Because no code changed, the run is **byte-identical to the pre-rehearsal one** — `diff` over the two
captured outputs reports no difference, which is itself the evidence that nothing moved.

| Reading | Value | Required by acceptance |
|---|---|---|
| `node tests/selftest-node.cjs` exit | **0** | 0 |
| Assertions | **1051 passed, 0 failed** | ≥ 895 passed / 0 failed |
| Interaction gate | **146 of 146 checks passed** | ≥ 136 of 136 |
| Stub-drift gate | **96 shell ids, all built by the stub page** | green in both directions |
| Perf | **100 commits in 7 ms** (budget 50 ms) | within budget |
| Layer A (document) | **16 words, no comparative language** | clean |
| Layer B (5,582 string literals) | **23 words, no comparative language** | clean |
| Layer C — `#app` | **127 rendered strings** (39 words) | above floor |
| Layer C — dialogs | **145 strings across 4 roots** — `#tok-picker`, `#act-edit`, `#share`, `#reset-ask` | floor **138** |
| Layer C — `#act-edit-propose`, pane OPEN | **60 strings** (24 chooser ticks) | floor **23** |
| Second stub page | parsed, evaluated and booted from a prepared hash in **14 ms** | boots |

All four dialog roots are harvested above their floors, as required.

### The greps

```
$ git diff --stat cats-vs-mechs.html
(empty)

$ grep -ci "counter\|rating\|balanced\|difficulty" cats-vs-mechs.html
0

$ grep -c "verdict\|balanced\|rating\|difficulty" cats-vs-mechs.html
0

$ grep -c "Blob\|createObjectURL\|download" cats-vs-mechs.html
0
```

Both no-verdict naming greps print `0`, as the acceptance criteria require. **The tier-4 grep also
prints `0`, and that is a fact worth stating rather than a formality:** CLAUDE.md describes a four-tier
clipboard fallback whose fourth tier is a Blob URL with `<a download>` — an offline "save build as
file" escape hatch that needs no clipboard at all. **Phase 4 shipped three tiers, not four.** The
fourth was never built, so the artifact contains no `Blob`, no `createObjectURL` and no `download`
anywhere. Given that tiers 1 and 2 have never executed in this repo, tier 3 — select-all and press
Ctrl+C — is both the last line of defence and the only one this project has ever proved works.

---

## Deviations from Plan

None. Task 2 took the plan's own no-redirect branch, which mandates changing no code.

One thing the plan asked for was **not obtained**, and it is recorded as a finding rather than a
deviation because it was a checkpoint outcome and not an execution choice: the acceptance criteria
required per-item prose and refused a blanket approval by name, and a blanket approval is what
arrived. Every consequence of that is set out in "The Weakest Lines in This Record" above, per item,
with the automated rows that do and do not independently cover each one.

---

## Threat Register Disposition

| Threat ID | Category | Disposition | Outcome |
|---|---|---|---|
| T-04-36 | Repudiation — six design decisions made by an agent and never confirmed | mitigate | **Closed.** All six were put to the developer with their reasoning, their cost and their declined alternative, and all six came back confirmed. They are not an agent's decisions any more. D-26 is confirmed specifically as *accepted-unmeasured*, which is recorded as such. |
| T-04-37 | Denial of service — the clipboard failing silently in a browser or focus state nothing here can reach | mitigate | **Partially closed, and this is the phase's largest residual.** The matrix was operated by a person across two browsers and three focus states and nothing was reported broken. But no cell's `data-sh-tier` was transcribed, so which tier fired in each cell is still unknown, and tiers 1 and 2 remain never-executed in CI. Named as weakest line 1. |
| T-04-38 | Denial of service — untested close-request behaviour breaking either new surface | mitigate | **Partially closed.** Item 18 was put to the developer for both dialogs and approved, so the path was exercised and did not break. The behaviour was not transcribed verbatim, so the record holds an approval of a description. Named as weakest line 5. |
| T-04-39 | Information disclosure — a build loading wrong across browsers on a percent-encoding difference nobody measured | mitigate | **Closed at the level a person can close it.** Item 7 is a real cross-browser round trip in both directions with the emoji name checked, and it held. No automated check in this repo can cross a process boundary (limitations entry 17), so this threat was only ever closable by a person, and a person closed it. |
| T-04-40 | Repudiation — a blanket approval standing in for per-item evidence, as happened once already | mitigate | **NOT closed. It happened again.** The acceptance criteria refused a blanket approval by name and cited the prior rehearsal's own record; one arrived regardless. The mitigation that did work is the second half: the record names exactly which claims rest on it, per item, rather than presenting them as observations. |
| T-04-SC | Tampering — npm/pip/cargo installs | accept | **Closed.** Zero packages installed by this plan. Zero by the phase. |

---

## Known Stubs

None introduced by this plan — it changed no code.

## Threat Flags

None — no file in the artifact was created or modified, so no new security-relevant surface exists.

---

## What This Leaves for Phase 5 and the Phase Verifier

- **SHARE-07** (reset the fight without discarding the build) is Phase 5's, unchanged by this plan.
- **Decision 22's forward reason is now load-bearing:** the developer confirmed `#reset-ask` as its own
  root partly *because* Phase 5 will want reset on the topbar beside share. Phase 5 should put it
  there.
- **The clipboard matrix is the item to re-ask for**, and the two cells worth asking about first are
  DevTools-focused and window-backgrounded, where Chrome's user-gesture rule is most likely to reject
  `writeText` and where the untested fall-through actually runs.
- **`CODE_LIMIT` 2000 is accepted unmeasured by explicit decision.** If it is ever re-opened, its
  comment already names it as the first figure to re-check.

## Self-Check: PASSED

- `FOUND: .planning/phases/04-share-reset/04-08-SUMMARY.md`
- `git diff --stat cats-vs-mechs.html` → empty, as claimed
- `git status --short` → empty, as claimed
- `node tests/selftest-node.cjs` → exit 0, 1051 passed / 0 failed, interaction gate 146 of 146, as claimed
- post-run output byte-identical to the pre-rehearsal capture (`diff` reports no difference), as claimed
- `grep -ci "counter\|rating\|balanced\|difficulty"` → `0`, as claimed
- `grep -c "verdict\|balanced\|rating\|difficulty"` → `0`, as claimed
- `grep -c "Blob\|createObjectURL\|download"` → `0`, as claimed
- `CODE_WARN` at `cats-vs-mechs.html:2275` reads `1800`, unchanged, as claimed
- `CODE_LIMIT` at `cats-vs-mechs.html:2282` reads `2000`, unchanged, as claimed
- `OVER_BUDGET` at `cats-vs-mechs.html:9469` reads `'This code is longer than a message allows.'`, unchanged, as claimed
