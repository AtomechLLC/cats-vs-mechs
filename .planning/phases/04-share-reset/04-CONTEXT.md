---
phase: 04-share-reset
status: locked
source: developer decisions taken 2026-08-29 during /gsd-plan-phase 4
supersedes_questions_from: 04-RESEARCH.md § Open questions
---

## How this file came to exist

Phase 4 had no `discuss-phase` run. The researcher and pattern-mapper surfaced four decisions that
materially change the work; three were put to the developer directly and answered, and one was taken
by the orchestrator as a routine judgement call. All four are locked below.

A planner or executor reading this file should treat these as settled and NOT re-litigate them. If
implementation reveals one of them to be wrong, that is a deviation to raise explicitly, not a
choice to quietly re-make.

---

## D-18 — An over-budget build code warns; it does not offer a download

**Decision:** Show the live character count next to Copy (success criterion 2 already requires this)
and surface a plain warning past roughly 1,800 characters. Ship **no** tier-4 file download in this
phase.

**Why:** The measured numbers do not justify a second sharing story. A realistic student build
(12v5) encodes to 295 characters and a fully-authored 24v24 board to 675 — both comfortably inside
Discord's 2,000-character limit. Only adversarial names (24-character ASCII, or 23 emoji) reach
~3,200, and that is a board no workshop will produce by accident.

**What was rejected and why:**
- *Tier-4 Blob download* — CLAUDE.md verifies it works from `file://`, but it costs a plan's worth
  of work and forces students to be taught two ways to share, to serve a case the workshop will not
  hit.
- *Tightening `MAX_*` name caps so the ceiling is unreachable by construction* — this buys the
  budget by taking expressiveness away from students, which cuts directly against the thing Phases
  2.1 and 3.1 exist to give them.

**How to apply:** The character count is a rendered figure beside the copy control. The warning is
descriptive ("this code is longer than a Discord message allows"), never evaluative — the no-verdict
gate applies to this copy like all other copy.

---

## D-19 — Reset-to-defaults gets a confirmation, overruling D-17 on purpose

**Decision:** Ship the confirmation dialog SHARE-06 asks for, and record in the decision log that
this knowingly overrules D-17 for this one action.

**Why:** D-17 had `removeAction` and `removeTokenType` decline confirmations in writing, and the one
prior time that policy met a competing requirement the answer was a permanent warning line rather
than a modal. Reset is genuinely different, and the researcher measured why: `resetToDefaults` adds
exactly one undo entry, and one Ctrl+Z restores the build byte-for-byte — but that entry falls off
the 30-deep stack after `UNDO_LIMIT` further commits. Every other destructive action in this file is
recoverable for as long as the student keeps working. Reset is the only one whose escape hatch can
age out from under them. That makes the confirmation load-bearing rather than ceremonial, which is
exactly the distinction D-17 was drawing.

**What was rejected:** Honouring D-17 with a permanent warning line beside the reset button. It is
consistent with the file's own precedent, but leaves SHARE-06 unsatisfied as literally written, and
the phase verifier would correctly flag it.

**How to apply:** D-17 stays intact for token and action removal — do not use this as licence to add
confirmations elsewhere. The plan that ships the modal must write the reasoning above into the
decision record beside the code, not merely reference this file.

---

## D-20 — A boot-time hash load creates no undo entry

**Decision:** When the page boots and loads a build from `location.hash`, that is the starting state.
It does not push onto the undo stack.

**Why:** There is nothing to undo back to. Keeping boot-load out of the stack preserves a simple,
statable contract — the undo stack holds the student's own edits and nothing else.

**What was rejected:** Creating an entry so Ctrl+Z after opening a classmate's link returns to
shipped defaults. Friendlier for a student who opened a link by accident, but it puts a state the
student never authored into their history, and the contract is worth more than the convenience.

**How to apply:** The existing `scheduleUrlSync()` calls inside `commit()` and `undo()` are the
*write* path and are unaffected. This decision governs only the boot-time *read*.

---

## D-21 — One dialog, two panes (orchestrator judgement, not developer-answered)

**Decision:** Share and load live in a single `<dialog>` with two panes, matching the shipped action
editor rather than adding two separate dialogs.

**Why:** It matches the newest and cleanest dialog precedent in the file (`#act-edit`, Phase 3.1),
and it conserves the shell-id budget the pattern-mapper measured. This was taken as a routine call
so the developer was not asked to arbitrate a house-style question that already has a house answer.

**Status:** Lower-confidence than D-18/D-19/D-20 because no human confirmed it. If the two panes
fight each other during implementation, splitting them is a cheap deviation — say so and split.

---

## Standing constraints this phase inherits (not decisions — reminders)

- **`CompressionStream` is out**, and the reason is not size. It is async, which forfeits the
  Chrome-107 clipboard user gesture SHARE-01 depends on, and it is `undefined` in the Node gate's
  sandbox, so every assertion about it would be documentation rather than a gate. The synchronous
  name-table and split-unit-stream schema decisions replace it.
- **`App.hasFlag` splits the hash on `,`** (`cats-vs-mechs.html:1424`). This is the binding alphabet
  constraint and it is **not** in CLAUDE.md. Chrome itself round-trips every ASCII punctuation
  character except space verbatim, so the browser is not the constraint — this is.
- **`btoa` / `atob` / `TextEncoder` / `TextDecoder` are all `undefined`** in the harness sandbox.
  Hand-rolled UTF-8 + base64url (~35 lines) is testable with zero harness changes. `TextEncoder`
  also silently substitutes U+FFFD for a lone surrogate, and so does `location.hash`.
- **`dmg` and `keywords` are not student-writable** — no `[S05]` op writes either — so they need not
  be encoded. The researcher flagged this as a latent data-loss bug the day someone adds
  `setActionDmg`, and specified an `[S09.11]` tripwire for it. Build that tripwire.
- **`[S04] SERIALIZE` is a reserved section, not a new one** (`cats-vs-mechs.html:2564-2578`) — banner,
  `deps: App.data`, four claims and a frozen no-op already written.
- **`App.ops.resetToDefaults()` already exists** (`:3230`), is already dispatchable (`:4181`) and is
  already wired to a button (`:9391`). This phase writes a *surface* for reset, not the op.
- **A codec is state work**, so its `[S09.11]` suite can sit entirely above the
  `typeof document === 'undefined'` bracket and therefore actually runs in CI — unlike the DOM rows
  Phase 3.1 learned the hard way about.
- **Naming traps, measured against the live lists:** `/rating/i` is banned document-wide, killing
  `generating`, `operating` and `separating`; `counter` and `balance` are banned; Layer B kills
  `underscore`, `upgrade`, `degraded`, `lead`, `frank` and `wins` inside string literals; and the
  three characters `url(` are banned anywhere in the file, ruling out any CSS background-image on the
  new dialog.
