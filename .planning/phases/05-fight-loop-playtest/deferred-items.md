# Deferred items — phase 05

Out-of-scope discoveries logged rather than fixed, per the executor's scope boundary.

## 1. A POINTER press on any control whose own node is rebuilt drops the keyboard to `<body>`

**Found:** plan 05-10, driving real Chrome and real Edge.
**Pre-existing, file-wide, and NOT introduced by this phase** — the control reading is what
makes that a measurement rather than a claim.

```
FOCUS A. fight chooser (plan 05-07), POINTER path  = BODY  data-k=undefined
FOCUS B. fight chooser, KEYBOARD path              = BUTTON.fg-pill  data-k="fg/by/cats/c2"
FOCUS C. token picker row (plan 02-03), POINTER    = BODY  data-k=undefined
FOCUS C. token picker row, KEYBOARD path           = BUTTON.pk-list-item  data-k="pk/list/shield"
FOCUS D. a board stepper (node NOT rebuilt), POINTER= BUTTON.stp-btn  data-k="cats/c1/maxHp+"
FOCUS E. the alive toggle, POINTER  = BUTTON.dc-alive  data-k="fg/alive/c1"
FOCUS E. the alive toggle, KEYBOARD = BUTTON.dc-alive  data-k="fg/alive/c2"
```

**The mechanism.** `withPreservedFocus` restores the keyboard onto the new node during
`pointerdown`. The browser's own default focus-on-mousedown then targets the node that was
under the pointer — which the rebuild has detached — and focus falls to `<body>`. A stepper
(D) keeps focus because its node survives; the alive toggle (E) keeps it because a `setAlive`
commit is not structural and the button is not replaced.

**Why it is deferred rather than fixed.** It reproduces identically on plan 02-03's token
picker, two phases older than this one, so it is neither this plan's regression nor this
plan's region: the fix belongs in `withPreservedFocus` ([S06.1], plan 02-01) and would be a
change to how every rebuilding surface in the file behaves. The KEYBOARD path — the one this
matters for — is correct on every surface measured.

**What it costs:** a student who clicks a chooser and then presses Tab starts tabbing from the
top of the document rather than from the control they just used. Nothing is lost and nothing
is mis-set.

## 2. `#board`'s top was below the fold of both a 1080 and a 768 screen — CLOSED

Re-measured by plan 05-10 in real Chrome, one round resolved through real presses:

```
board top @1920x1080 = 1203
board top @1366x768  = 1111
```

**FIXED, out of the plan sequence, by the orchestrator, before plan 05-11.** It was deferred here
because it needed a wrapper element in the static shell and a rewrite of `[C14]`'s
`#fightbar, #ledger` rule — plan 05-06's markup and plan 05-06's frame rule, which plan 05-10 did
not own and did not touch. It stopped being deferrable because plan 05-11 is a **blocking playtest**:
a person cannot play a board that is off the bottom of the screen, so the fix is a precondition for
the checkpoint being executable rather than a polish item inside it.

The two regions were laid side by side in a `.fg-band` wrapper. Driven with a round resolved in real
Chrome and real Edge at both sizes, agreeing to the pixel in all four:

```
board top @1920x1080 = 844 of 1080   (236px of headroom)
board top @1366x768  = 730 of  768   ( 38px of headroom)
```

Unchanged at thirty resolved rounds. `#strip` still pins (107 at 1080, 99 at 768). Both gates green:
`1188/0` with the interaction gate at `160/160`, and `browser-checks` at `22/0`.

**What was NOT fixed** — the newest round still does not fit whole at 1366x768, and below a 1180px
viewport the two regions stack again — is recorded with its measurements in the record file.

Full record: `.planning/phases/05-fight-loop-playtest/05-VIEWPORT-FIX.md`. It is also
`REHEARSAL.md` B3 and limitations entry 21, both rewritten.
