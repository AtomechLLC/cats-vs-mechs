---
phase: 05-fight-loop-playtest
status: assumed-not-confirmed
source: orchestrator decisions taken 2026-08-29 while the developer was away
confirm_at: the 05 playtest checkpoint
---

## Read this before treating anything below as settled

Phase 4's CONTEXT.md recorded four decisions, three of which the developer answered directly. **This
file is different: the developer was unavailable when these were taken.** Every decision here is an
orchestrator assumption, derived from constraints the project has already written down rather than
from a preference anyone stated.

They are written as decisions because the work cannot proceed without them, and a plan built on an
unstated assumption is worse than one built on a stated one. But they carry less authority than
D-18/D-19/D-20 do, and **each one is a question at the phase's playtest checkpoint.**

The one I am least able to derive — D-26, how a fight ends — is flagged explicitly and is the first
thing to put to the developer.

---

## D-22 — During a fight, the projection reads the fight, not the build

**Assumption:** `turnsToWipe` and the projection strip read live fight state while a fight is running.

**Derived from:** `turnsToWipe` already accepts an `activeUnits` parameter, and the shipped comment
says it exists "so Phase 5 can project a fight in progress." PROJ-05 requires the projection stay
visible during the fight; a projection that stayed visible while silently describing the *build*
would be worse than one that vanished, because it would be quietly wrong at exactly the moment a
student is reading it.

**Consequence:** the currently-unused `activeUnits` parameter gets used. If the developer prefers the
projection keep describing the build, that parameter should be **retired** rather than left unused —
an unused parameter that names this phase is a trap for the next reader either way.

---

## D-23 — A declared cost that exceeds the pool is reported, never prevented

**Assumption:** a student may declare an action they cannot afford. The surface says so plainly; it
does not disable the control, and it does not refuse the declaration.

**Derived from:** `App.model.affordability` is ACT-06 as numbers and token ids, and it carries a
**never-disable rule in its own comment** — already shipped, already asserted. Preventing a
declaration would be the tool adjudicating, which is PROJECT.md's oldest Out of Scope entry. The
students are the rules engine; if they want to declare something and argue about it, that is the
workshop working correctly.

**Consequence:** Advance must be able to resolve a round in which a side over-committed. What that
does to the pool is the student's ruling, not the tool's — the tool records what was declared and
what the pool reads, and shows the shortfall.

---

## D-24 — A student-invented tally is spendable mid-fight, on the same terms as a shipped one

**Assumption:** token types a student created in Phase 2.1 behave in a fight exactly like the shipped
ones. No second tier.

**Derived from:** Phase 2.1's whole purpose was that "the vocabulary stops being ours and starts being
theirs," and it shipped with a single list and explicitly no second tier. A student-made type that
worked everywhere except in the fight would reintroduce the tier 2.1 removed, at the one moment it
matters most.

**Consequence:** anything that walks token types during resolution walks all of them. This is mostly
a "do not special-case" instruction rather than work.

---

## D-25 — The shipped default is NOT retuned by any plan before the playtest

**Assumption:** `DEFAULTS.cats.ap` stays at 3 until a person has played the fight.

**Derived from:** ROADMAP success criterion 5 states the playtest is "a played fight, not a code
review," and that the default is retuned **and replayed** until it holds. Research has now measured,
analytically, that the shipped default fails the criterion badly — the Mechs finish 3 rounds with 67%
of their force intact against a ≤30% bar — and that `DEFAULTS.cats.ap: 3 → 9` is the single dial that
moves it, because a shared pool of 3 makes 3, 6 and 9 Cats produce byte-identical outcomes.

That measurement is a strong prediction. It is **not** a played fight, and the criterion asks for a
played fight on purpose: the number that matters is whether it feels contested to a person, not
whether it clears 30% in a simulation.

**Consequence:** plans build the loop against the *current* default. The retune is the playtest plan's
work, with the sweep already measured and waiting in 05-RESEARCH.md so the person playing has the
candidate dial in hand rather than guessing between rounds.

**Also:** `.planning/research/PITFALLS.md` § Pitfall 10 and `SUMMARY.md` predict the blowout in the
wrong direction and should be corrected — they say the swarm runs away with it; the measurement says
the swarm cannot get going at all.

---

## D-26 — How a fight ends — **WEAKEST ASSUMPTION, ASK FIRST**

**Assumption:** a fight does not "end." It stops when the student stops. The tool never announces an
outcome, never names a winner, and never renders a terminal state beyond what is already true on the
board — every unit on one side being marked dead is a thing a student can *read*, not a thing the
tool *says*.

**Derived from:** the no-verdict rule, which is the project's most heavily defended constraint — three
mechanical scan layers, a rendered-page walk, and a gate that fails the build on comparative language
inside test labels. The researcher flagged this question LOW and said precisely why: it is "exactly
where a helpful 'Cats win!' gets added."

**Why this one is weak:** no requirement covers it. FIGHT-01…16 do not describe an ending. I am
inferring from a prohibition rather than from a stated intent, and a prohibition tells you what not to
build, not what to build. It is entirely possible the developer wants *something* to mark the moment —
a neutral statement of fact, a prompt to reset, a ledger entry — and "nothing at all" may read as the
tool losing interest rather than as the tool declining to judge.

**Consequence if wrong:** small. Adding a neutral end-of-fight reading later is additive. Adding one
that judges would be caught by the gate. The risk is a workshop moment that falls flat, not a
rebuild.

**This is the first question to put to the developer at the checkpoint.**

---

## Standing constraints this phase inherits (reminders, not decisions)

- **Check 73c walks the whole state object at any depth and reddens on keys matching
  `/propos|override|caster|target|pending/i`.** A declaration naming `{ caster, target }` reddens the
  build; `{ by, at }` does not. These are banned as **object keys**, not as rendered words — `WHO_SAID`
  already renders both. Measured-clean alternatives are tabled in 05-PATTERNS.md.
- **`roundCounter` / `turnCounter` are unwritable identifiers** — `counter` is a Layer A whole-document
  ban that also catches comments. So is `rating`, which catches `iterating`.
- **Three shipped `[S09.10]` assertions are aimed at this phase and must be amended in the same change
  that invalidates them:** row 1 bans exports matching `/^(apply|resolve|advance|spend|fire|…)/i`,
  row 2 is check 73c above, row 3 *drives* `dispatch('advanceRound')` expecting a throw. Phase 3.1's
  plan 03.1-04 is the precedent for turning a shipped tripwire deliberately and in the open.
- **`[S05]:6397-6412` is a DELIBERATELY ABSENT block naming this phase's ops by number.** It must be
  rewritten in the same change that adds them, or it becomes the "banner that quietly lies" that
  `[S03]` forbids.
- **The ledger must not live inside `#board`.** `withPreservedFocus` takes the *first* `[data-k]` match
  scoped to `#board`, and past-board rows placed above the live one make that first match a dead clone.
  Measured in both DOM orders. Cost of the ledger itself is flat 1.9–2.1 ms to 60 rounds / 26,132
  nodes, and `sync()` does not move at all at 50 rounds — it is inert DOM outside the keyed reconcile.
- **Two same-label commits inside 500 ms fold into one undo entry.** Advance's commit label must carry
  the round number or two fast Advances become one undo step.
- **`endFight()` + `startFight()` naively costs TWO undo entries.** SHARE-07 wants reset-fight to keep
  the build; it is structurally pre-satisfied by the codec (the fight slice is invisible to `encode`
  by construction) but the undo cost needs handling.
- **The no-verdict gate has a measured 19-word hole.** `won`, `winning`, `loses`, `defeated`, `beats`,
  `victory`, `dominant`, `best`, `leads`, `harder` all pass all three layers today — `beats` is on the
  page already, in the reference band, which is why the stem was never banned. **This phase is the one
  that would walk into every one of them.** Closing the hole belongs in this phase, not after it.
- **Layer C harvests `#app` in setup mode only.** Every word the fight surface renders is currently
  invisible to the one layer that reads render-time copy. This is harness limitations entry 5 and it is
  Phase 5's to close — otherwise the gate above is scanning a page the fight never shows.
- **CLAUDE.md's re-render guidance does not apply to this codebase.** It prescribes `innerHTML` region
  re-render and quotes a 0.79–23 ms benchmark; `innerHTML` is on the artifact's own `FORBIDDEN` list
  and the file uses a two-tier `createElement`/`textContent` reconcile. Measured replacements are in
  05-RESEARCH.md. Do not plan to CLAUDE.md's numbers here.
- **The topbar reservation is exactly two more controls**, and the shell says so in a comment: after
  those two, the reservation is spent. Everything else goes in the surface.
- **The developer explicitly rejected calling a round a "Day"** — and nothing mechanical stops its
  return. `Day`, `today` and `daily` all measure clean. Only this note stops it.
- **Simultaneous declaration contradicts `[S03]`'s declared `fight.turn` key**, which `startFight`
  still seeds as `'cats'`. That key predates the round loop and needs reconciling.

---

## ADDENDUM 2026-08-29 — a browser IS available here, and three phases were wrong about it

Discovered while executing plan 05-06, whose executor drove a real browser to catch a CSS shorthand
bug the Node harness was structurally blind to, and said so in its closing note.

**Measured, not assumed.** Real Chrome *and* real Edge both:
- load `cats-vs-mechs.html` from `file://` with zero page errors,
- report `window.isSecureContext === true`,
- report `permissions.query('clipboard-write') === "granted"`,
- expose real computed layout geometry.

Playwright 1.62.1 drives both via `channel: 'chrome'` / `channel: 'msedge'`.

**CLAUDE.md said this all along** — its Development Tools table lists Playwright as "Verified
working: `chromium.launch({ channel: 'chrome' })` + `pathToFileURL()`". Phases 3.1, 4 and the early
part of 5 each independently recorded "there is no browser in the environment that built this phase"
and deferred browser-only claims to a human rehearsal. That premise was false, and it is what put 14
items into `.planning/REHEARSAL.md`.

**What has already been closed by machine:** `tests/browser-checks.mjs` (dev-only, skips cleanly
without Playwright) drives all three clipboard tiers in both browsers — 22 passed, 0 failed —
including the honesty check that no tier ever claims a copy that did not occur, verified against a
seeded clipboard sentinel. Cross-browser build-code round trip is byte-identical both directions.

### What this means for plans 05-07 through 05-11

1. **If you write CSS or shell markup, drive it in a real browser before claiming clean.** Plan
   05-06's shorthand-resets-longhand bug put a 1600px region 182px out of alignment and the whole
   suite stayed green. Follow its lead; the harness cannot see layout.
2. **Do NOT keep writing "no browser is available" into limitations lists.** It is not true. Write
   what is *actually* unreachable instead — and be specific, because the categories differ:
   - **Reachable by machine now:** computed layout and geometry, sticky behaviour under a real
     scroll, wrapping, element boxes, clipboard tiers, focus behaviour, cross-browser round trips,
     first-paint timing.
   - **Still genuinely human:** whether text is *legible from across a room*, whether wording reads
     as helpful rather than merely correct, whether a surface *feels* like recovery, and anything on
     an actual projector. CLAUDE.md's Gaps section is right that no research substitutes for putting
     the artifact on the real workshop display.
3. **Plan 05-11 specifically:** several of its ~38 items are machine-closable. Its playtest core —
   two played fights, adjudicated as a student would, judged on whether the default feels contested
   — is NOT, and remains the gate. Do not let the automatable items dilute it. The right move is to
   close what a browser can close *before* the rehearsal, so the person's time is spent only on what
   genuinely needs a person.
