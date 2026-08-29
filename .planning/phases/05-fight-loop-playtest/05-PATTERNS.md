# Phase 5: Fight Loop & Playtest — Pattern Map

**Mapped:** 2026-08-29
**Work units analysed:** 16 (13 regions of `cats-vs-mechs.html`, 3 of `tests/selftest-node.cjs`)
**Analogs found:** 13 / 16 — two techniques have no precedent anywhere in the repo, and one of the
two is actively contradicted by a live gate check that walks the whole state object.

> **This project is two files.** "New file" has no meaning here; the unit of work is a **region**
> (`[S0N]` / `[S0N.M]` / `[C0N]`) inside `cats-vs-mechs.html` (**19,508 lines**), plus sections of
> `tests/selftest-node.cjs` (**7,618 lines**). Every analog is therefore in-file.
>
> **Phase 5 is the most heavily pre-provisioned phase in this project's history, and also the one
> with the most tripwires aimed at it.** `state.fight`'s shape is declared in `[S03]`'s banner at
> `:2869-2873`. `App.ops.startFight`, `endFight`, `setUnitHp` and `setAlive` **already ship, are
> already exported and are already dispatchable**. `App.model.aliveCount` and `App.model.apSpent`
> already exist. `turnsToWipe` already takes an `activeUnits` argument written for this phase.
> `buildColumn` already branches on `setup = (state.fight === null)`. The `dead` token type already
> ships in the vocabulary with no consumer. `fight.log: []` already exists with no writer.
> Interaction-gate checks 15 and 62 already drive `startFight()` and assert what it does.
>
> And: **check 73c walks the entire state object at any depth and reddens on any key named
> `caster`, `target`, `override`, `propos*` or `pending`.** That is § Rule 0.2 and it is the single
> highest-consequence fact in this document after the word lists.

---

## Rule 0 — the six things to read before writing any identifier, comment or line of copy

### 0.1 The verdict gate, run this session against a 366-item Phase-5 vocabulary

This is the biggest hazard the phase has. Fight copy is exactly where evaluative words appear
naturally. Three layers, each with `process.exit(1)` or a red check behind it:

| Layer | Reads | Words | Location | Effect on failure |
|---|---|---|---|---|
| **A** | the **whole document** — markup, CSS, comments, code | `VERDICT_WORDS`, **16** | `tests/selftest-node.cjs:167-185` | `process.exit(1)` before anything else runs |
| **B** | **every quoted string literal in the script block** (`'`, `"`, backtick, escape-aware) | `VERDICT_LITERAL_WORDS`, **23** | `:292-317` | `process.exit(1)`; floored at 2,000 literals (`:274`), measured **5,582** |
| **C** | the **rendered page** — leaf `textContent` under `#app`, plus every `DIALOG_ROOTS` surface, plus `aria-label` / `title` / `placeholder` | `VERDICT_WORDS.concat(VERDICT_LITERAL_WORDS)`, **39** | `:4708-4742` | a red `check` |

**Measured this session by extracting both live arrays out of `tests/selftest-node.cjs` and running
366 candidate strings through them.** The results below are facts, not guesses.

#### FAILS — do not write these anywhere the named layer reads

| Word / stem | Trips | Layer | Note for this phase |
|---|---|---|---|
| `winner` | `winner` | **A — whole document** | the obvious one |
| `loser` | `loser` | **A** | |
| `counter`, `counters`, `countered`, `counterattack`, `encounter`, `counter map` | `counter` | **A** | **`roundCounter` and `turnCounter` are unwritable identifiers.** `[S05]` already avoids the word for id sequences — `nextUnitId` `:5051` and `nextTokenTypeId` say *"scan every id already in use, take the largest suffix and add one"* and never name the thing a counter. Do the same for a round number: **`round`, `roundIndex`, `countRounds` and `round-count` all measure clean.** |
| `balance`, `balanced`, `imbalance` | `balanc` | **A** | also bans `text-wrap: balance` in `[C14]` |
| `difficulty` | `difficult` | **A** | but `harder` / `easier` pass — see the gap list |
| `rating`, `generating`, `operating`, `separating`, `integrating` | `rating` | **A** | **never write "generating a round"**; write *producing*, *writing*, *resolving* |
| `unfair`, `overpowered`, `underpowered`, `good build`, `bad build`, `should aim`, `traffic light`, `outmatch`, `outclass`, `verdict` | themselves | **A** | |
| `wins`, `win`, `who wins` | `\bwins\b` / `\bwin\b` | **B — string literals** | already a known trip. `wins` is called out in `04-PATTERNS.md` |
| `score`, `scored`, `underscore` | `score` | **B** | |
| `grade`, `upgrade`, `degraded` | `grade` | **B** | |
| `rank`, `ranking`, `outranked` | `rank` | **B** | |
| `ahead`, `ahead of` | `ahead` | **B** | |
| `lead` (bare) | `\blead\b` | **B** | |
| `edge`, `the edge`, `an edge` | `\bedge\b` | **B** | |
| `fair` | `\bfair\b` | **B** | |
| `weak`, `weakened`, `weakens`, `weakness` | `weak` | **B** | |
| `stronger`, `strongest` | themselves | **B** | but `strength` and `strengthen` pass |
| `advantage`, `disadvantage` | `advantage` | **B** | **"a large force advantage remaining" is the ROADMAP's own playtest wording and it is unwritable in a string literal.** Write *"force remaining"* or *"units still standing"*. |
| `favoured`, `favored` | `favou?red` | **B** | but `favour` passes |
| `superior`, `inferior`, `optimal`, `better`, `worse`, `judgement`, `judgment` | themselves | **B** | |
| `dominate`, `domination` | `dominat` | **B** | but `dominant` passes — a measured gap, see below |

#### MEASURED CLEAN — a pre-screened Phase-5 vocabulary

All of the following passed all three lists **and** `FORBIDDEN` this session. Two hundred single
words and phrases, plus 44 full candidate sentences (below). Use these freely:

**The loop.** `fight`, `start fight`, `end fight`, `reset fight`, `fight over`, `round`,
`this round`, `next round`, `last round`, `previous round`, `Round 1`, `turn`, `turns`,
`whose turn`, `declare`, `declaration`, `declared`, `undeclared`, `declaring`, `intent`,
`resolve`, `resolves`, `resolution`, `unresolved`, `Advance`, `advancing`, `advanced`, `apply`,
`applied`, `lands`, `landed`, `rewind`, `step back`, `back one round`, `replay`.

**The ledger.** `history`, `ledger`, `past rounds`, `earlier rounds`, `rounds so far`,
`what changed`, `changed since`, `since the previous round`, `delta`, `difference`, `log`,
`combat log`, `record`, `records`, `recorded`, `entry`, `entries`, `stack`, `stacks upward`,
`accumulate`, `snapshot`, `frame`, `board state`, `previous board`, `opening board`,
`starting board`, `current board`.

**Damage and the shield split.** `shield`, `shield first`, `soak`, `soaked`, `absorb`, `absorbed`,
`spill`, `spillover`, `overkill`, `split`, `the split`, `damage`, `damage taken`, `health`,
`remaining health`, `zero health`, `to shield`, `to health`.

**Death.** `dead`, `died`, `dying`, `death`, `alive`, `not alive`, `mark dead`, `toggle alive`,
`still standing`, `standing`, `knocked out`, `out of the fight`, `removed from play`, `wipe`,
`wiped`, `wiped out`, `survivor`, `survivors`, `survives`, `force remaining`, `force left`,
`intact`, `casualties`, `attrition`.

**Overrides and notices.** `override`, `overridden`, `manual override`, `set by hand`, `by hand`,
`changed by hand`, `marker`, `marked`, `mid-fight`, `mid-fight edit`, `edits the build`,
`applies to the build`, `not retroactive`, `takes effect next fight`.

**Action points and targeting.** `spent`, `unspent`, `available`, `action points`, `points spent`,
`points left`, `pool`, `performer`, `target`, `caster`, `who acts`, `who it hits`,
`select a target`, `no target`, `affordable`, `unaffordable`, `cannot afford`, `short by`,
`too few`, `enough`, `not enough`, `requirement met`, `requirement unmet`, `missing`, `disabled`.

> **`caster` and `target` are clean as RENDERED WORDS and are already on the page** — `WHO_SAID`
> at `:8708` and `WHO_NAMES` render both. They are **not** clean as **state key names**: see
> § Rule 0.2.

**Outcome and playtest.** `contested`, `one-sided`, `blowout`, `close`, `tie`, `draw`,
`stalemate`, `mutual`, `outcome`, `result`, `what happened`, `what it did`, `playtest`,
`rehearsal`, `trade`, `traded`, `exchange`.

**Identifiers measured clean.** `fightRound`, `roundIndex`, `nextRound`, `advanceRound`,
`resolveRound`, `declareAction`, `setDeclaration`, `clearDeclaration`, `fightLedger`, `ledgerRow`,
`historyRow`, `pastRounds`, `priorBoard`, `applyDamage`, `damageSplit`, `shieldSpent`,
`healthLost`, `toHealth`, `toShield`, `markDead`, `toggleAlive`, `setAlive`, `aliveFlag`,
`overrideValue`, `overrideMarker`, `manualEdit`, `byHandMarker`, `midFightNotice`,
`buildEditNotice`, `resetFight`, `startFight`, `endFight`, `inFight`, `fightMode`, `setupMode`,
`spentAp`, `apSpent`, `apLeft`, `remainingAp`, `performerId`, `targetId`, `casterId`, `declSide`,
`declActionId`, `countRounds`, `round-count`, `round-label`, `ledger-list`, `decl-cats`,
`decl-mechs`, `fight-bar`. Class prefixes `fg-`, `fl-`, `ld-`, `rd-`, `dc-` all clean.

#### 44 CANDIDATE SENTENCES, ALL MEASURED CLEAN

Every one of these passed Layers A, B, C and `FORBIDDEN`. They are offered as a starting copy deck
so the phase does not have to re-run the probe:

> `Round 3 of this fight` · `Declare what both sides do, then advance.` · `Nothing resolves until you
> advance.` · `Advance the round` · `Both sides resolve at once.` · `This is what the board looked
> like before you advanced.` · `Earlier rounds stay on screen.` · `What changed since the last round`
> · `Health 3 to 1` · `Shield took 2, health took 1.` · `Shield absorbed 2 of the 3. Health took 1.`
> · `Damage spends shield first, then health.` · `2 to shield, 1 to health` · `Cat 4 is at zero
> health. Mark it dead, or rule that it survived.` · `Marked dead. Toggle it back if your ruling says
> otherwise.` · `Still on the roster, ruled dead.` · `Set by hand` · `Changed by hand, not by the
> rule.` · `This number was set by hand.` · `You changed the build while a fight was running. The
> change applies to the build, not to this fight.` · `Edits to the build take effect the next time
> you start a fight.` · `Action points 1 of 3 spent` · `2 of 3 left to spend` · `Spent` ·
> `Available` · `Reset the fight. Your build is kept.` · `Start the fight` · `This puts both rosters
> back to full and clears the rounds so far. Your build is untouched.` · `The fight is over when you
> say it is.` · `Cats have 4 units standing. Mechs have 2.` · `4 of 9 still standing` · `Slash on
> Cat 1, target Mech 2` · `Cat 1 uses Slash on Mech 2.` · `Nobody declared for the Mechs this
> round.` · `Pick who acts and who it lands on.` · `Your rule says: target Health -3, caster Action
> points -1` · `Applied on advance.` · `Nothing here has been applied yet.` · `Rounds so far` ·
> `Round 2 board` · `Previous board` · `The board as it stood at the end of round 2.`

#### THE MEASURED GAPS — reported, and NOT to be exploited

The harness already carries this posture at `:4726-4732`: *"TWO GAPS IN THE WORD LIST, MEASURED THIS
SESSION AND REPORTED RATHER THAN WIDENED … neither is exploited: the copy this phase ships is
arithmetic, not evaluative."* **This session measured eleven more, and every one of them is a word a
fight phase would reach for first:**

`won` · `winning` · `loses` · `losing` · `lost the fight` · `defeat` · `defeated` · `beat` ·
`beats` · `beaten` · `victory` · `victorious` · `triumph` · `outlast` · `best` · `dominant` ·
`leads` · `harder` · `easier`

All nineteen pass all three layers today. **`beats` in particular is already on the page** —
`[S06.4]`'s band renders *"Fly beats Slash"* (`beatsLine` `:8281`), which is why the stem is not
banned. **Phase 5 must not exploit any of them.** The rule the file already keeps, stated at
`:4730-4732` and at `[S06.6]:9602-9605`: *the artifact reports what happened arithmetically and never
what it was like.* A ledger row that says `Health 3 to 1` is bookkeeping; one that says
`Mechs are winning` is a verdict that ships green.

**A plan that wants a widening must measure its false positives first**, which is the standing rule
at `:4726`. Widening `/\bwin\b/` to `/\bwin(s|ning)?\b/` is the obvious candidate and it is cheap;
`/beat/` is not, because it would redden `beatsLine` and the band's own approved copy.

#### `FORBIDDEN` — four traps a fight phase can still walk into

`tests/selftest-node.cjs:32-46`, aborts the run:

- `/url\(/` — **a CSS comment or any comment containing the three characters `url(` fails.** No
  `background-image`, no data-URI icon in `[C14]`.
- `/https?:\/\//`, `/javascript:/`, `/ src=|setAttribute\(\s*['"]src['"]/`, `/<link/`,
  `/type="module"/`, `/@import/`, `/fetch\(/`, `/XMLHttpRequest/`, `/DOMParser|srcdoc/`, `/<iframe/i`.
- `/innerHTML|outerHTML|insertAdjacentHTML|document\s*\.\s*write|createContextualFragment/` — the
  ledger is the one surface in this phase most likely to reach for a markup sink. It may not.
- `/\beval\s*\(/` and `/\bnew\s+Function\b|\bFunction\s*\(/` — **a comment writing `Function (`
  fails the run.**

### 0.2 CHECK 73c WALKS THE WHOLE STATE OBJECT AND BANS FIVE KEY NAMES AT ANY DEPTH

`tests/selftest-node.cjs:5921-5961`. This is the constraint that shapes Phase 5's state design and
nothing in RESEARCH or the ROADMAP will warn about it.

```js
const skState = A.state.get();
const skWords = [];
(function walkKeys(node, where) {
  if (!node || typeof node !== 'object') { return; }
  Object.keys(node).forEach((k) => {
    if (/propos|override|caster|target|pending/i.test(k)) {
      skWords.push(where + '.' + k);
    }
    walkKeys(node[k], where + '.' + k);
  });
})(skState, 'state');
```
and the assertion, `:5943-5956`:
```js
  Object.keys(skState).sort().join(',') === 'build,fight,ui'
    && Object.keys(skState.build).join(',') === 'schema,cats,mechs,tokens'
    && Object.keys(skState.build.cats).join(',') === 'id,name,ap,units,actions'
    && Object.keys(skState.build.mechs).join(',') === 'id,name,ap,units,actions'
    && skWords.length === 0,
```

**Three separate consequences, all of them binding:**

1. **`caster`, `target`, `pending` and `override` are banned as STATE KEY NAMES at any depth.**
   A declaration record spelled `{ actionId, caster, target }` inside `state.fight` reddens 73c the
   moment it is written. So does a per-value `override: true` marker on a unit. So does
   `fight.pending`. The words are fine on the page; they are refused in the object.
   **Clean alternatives measured this session:** `by` / `at`, `actor` / `hit`, `from` / `to`,
   `who` / `on`, `byHand`, `manual`, `edited`, `marked`, `hand`, `declSide`, `declActionId`.
2. **The top-level slice list and both faction key lists are pinned by string equality.** Phase 5
   may not add a fourth slice and may not add a sixth key to a faction in `build`. The `fight` slice
   is *not* key-pinned by this check — its shape is free — but it **is** walked by the name test.
3. **The check's own reason is a policy Phase 5 partly overturns and must therefore engage with.**
   Its comment says *"the proposal is the one piece of this phase that must not be in any slice at
   all … The proposal lives on the DOM, which is what makes it impossible for undo, for a build code
   or for the projection to read one."* Phase 5's **declaration** is a different object with a
   different lifetime — FIGHT-12 says it is declared, FIGHT-13 says Advance resolves it — but the
   next reader will not see the difference unless the plan writes it down. Whatever the plan chooses,
   **the change to 73c must be made deliberately and in writing**, in the register `clampTokenName`
   (`:2769`-region) and `#reset-ask`'s D-19 argument use.

Companion check **72b/74** at `:5963-6065` drives **every name in `Object.keys(App.ops)`** through
the live router with a fixed payload (`:6031-6038`) and reads `dmg`/`keywords` drift after each one.
**Every op Phase 5 exports will be driven blind, in whatever fight state the previous probe left
behind, with `side:'cats', unitId:'c1'`.** An op that throws is fine (an arm was driven). An op that
writes an action's `dmg` or `keywords` reddens — which is the tripwire `[S04]`'s banner
(`:3197-3220`) and `[S05]`'s DELIBERATELY ABSENT block (`:6417-6440`) both describe.
Current reading: **48 exported ops walked, 18 dispatch arms driven of 57 acts tried, 425 action
records read.**

### 0.3 THE FIGHT SLICE MUST NOT REACH THE BUILD CODE — and by construction it already does not

`[S03]`'s banner, `:2878-2880`:
```
 * Slice lifetimes: `build` round-trips through the share code and the undo
 * stack; `fight` is undo-only and never shared; `ui` is in neither.
```
`[S04]`'s banner, `:3177`: *"Knows about `build` only — never about `fight` or `ui`."*

**The mechanism, so the plan does not have to guess.** `[S04.2] encode(build)` at `:3616` takes the
build slice **as an argument**. The only unattended caller is `flushUrlSync` at `:4445-4453`:
```js
      writeHash(encode(App.state.get().build));
```
So SHARE-07's *"reset the fight without discarding the build"* is satisfied by **doing nothing**:
`s.fight` is invisible to the codec however it grows. **No change to `[S04.2]` is required, wanted,
or permitted**, and the plan should say so rather than leaving a reader to wonder whether it was
forgotten. `[S09.11]`'s round-trip rows already drive a real board and would redden if the codec
started reading state it does not take as an argument.

**Two costs the plan must name.**
1. `commit()` calls `App.serialize.scheduleUrlSync()` for **every** commit including a fight commit
   (`:3121-3125`), so every declaration, every Advance and every override pays one debounced
   `encode(build)` per frame that writes **the identical code**. Measured in plan 04-05 on a fully
   authored 24v24 board: `encode` is **0.483 ms**, `JSON.stringify(build)` is **0.030 ms**. At the
   shipped 9v3 board it is far below that, and the mirror is debounced to at most one per frame
   (`:4467-4476`). It is affordable; it is not free; it should be measured once and recorded.
2. `undo()` restores `build` **and** `fight` together (`:3002-3003`), so **undo crosses the
   setup/fight boundary and undoing past a started fight un-starts it (D-08)** — already asserted at
   `:13719-13722`. A "reset the fight" op must be a normal `commitStructural` for the same reason
   `resetToDefaults` is (`:5179-5183`): one commit, one Ctrl+Z, stack never cleared.

### 0.4 `commitInitial()` is the file's newest documented exception — and Phase 5 needs no third one

`[S03]`'s banner names exactly two writers outside `[S05]`, with the caller allowed to reach each,
`:2850-2866`:
```
 *   restore(snapshotJson)        — [S09] SELFTEST …  It CLEARS the undo stack.
 *   commitInitial(label, mutator) — [S08] BOOT, and only before anything has
 *                                  been committed …
 * Neither is dispatchable and neither is reachable from a press.
```
and the banner's own justification for listing them at all: *"a banner that quietly lies is worse
than no banner"* (`:2852-2854`).

**The four properties that made `commitInitial` legal, `:3096-3140`** — copy these if a third writer
is ever proposed, and expect not to need one:
- **A guard that makes the state unreachable from a press.** `if (commits > 0 || past.length > 0) { throw … }`.
  *"That state exists only inside `[S08]`'s start(), before anything has been driven, so no student
  press can reach it and no second caller can appear quietly."*
- **It THROWS rather than returning false**, *"so the refusal is assertable and a later caller
  arriving is a red run instead of a silent second entry point."*
- **No dispatch arm, and `[S05]`'s DELIBERATELY ABSENT block says so from the other end**
  (`:6401-6410`).
- **`invalidate` inside rather than owed by the caller**, and structural, because it replaces a slice
  wholesale.

**Phase 5's writers are ordinary ops.** Every one of them — advance, declare, damage, alive, reset
fight — is reachable from a student press by definition, so they belong in `[S05]` behind
`App.state.commit` / `commitStructural`, and a plan that reaches for a third named writer has taken
a wrong turn. Write that sentence into the banner rather than leaving the absence unexplained; that
is what `:6397-6412` already does for turn advance **by name**:
```js
  // DELIBERATELY ABSENT, do not "helpfully" add them here:
  //   - turn and round advance, action-point spending, damage application and
  //     the fight record — Phase 5, plan 05-01
```
**That comment must be deleted or rewritten by this phase.** It is the file's own promissory note
against Phase 5 and leaving it standing beside the ops it says do not exist is exactly the
"banner that quietly lies" the `[S03]` banner forbids.

### 0.5 The topbar's reservation is exactly two controls, and after this phase it is spent

`:1004-1006`:
```html
  <!-- D-04. The control cluster's slot is decided once, here: Phase 4 adds
       reset and share to it, Phase 5 adds turn state and start-fight, and
       neither of them has to re-lay-out the page to do it. -->
```
and the third/fourth buttons' own paragraph, `:1057-1085`, closes the ledger:
> **THE BOUND, RESTATED, BECAUSE THE COUNT WENT UP.** … *The cluster's remaining reservation is
> Phase 5's turn state and start-fight, and after those two the reservation is spent. A later phase
> wanting a control per action, per side or per round gets the answer D-05 already gave: put it in
> the surface, not on the bar, because the bar is the one place UX-02 says a projector may not grow
> a queue of controls.*

**Read literally: Phase 5 gets ONE start-fight control and ONE turn-state readout.** Everything else
this phase needs on screen — declaration, Advance, reset-fight, the ledger — is *"the surface, not
the bar."* Each addition costs a paragraph in this register beside it, and the paragraph must state
the bound. **`IT MUST NOT BECOME ONE-PER-ANYTHING`** is the file's phrase, at `:1041` and `:1071`.
Four `.brd-tokedit` groups ship today (`:1027`, `:1053`, `:1093`, `:1097`); the pattern is a label
span at the UX-02 18px floor (`.brd-tokedit-label`, `:120`-region) plus one `.brd-btn`.

`.brd-cluster` is `display:flex; flex-wrap:wrap; justify-content:flex-end; gap:14px` (`:117`), and
`.rs-apart` (`[C13]`, `:927`-region) is the shipped precedent for separating a control **inside** the
cluster with a hairline and a gap from `--line` rather than adding a second bar — *"a second bar
would re-lay-out the page, which is the one thing D-04's reserved slot exists to make unnecessary."*

### 0.6 The developer rejected calling a round a "Day"

ROADMAP, Phase 5, **THE ROUND LOOP** paragraph: *"The developer explicitly rejected calling a round a
'Day'."* `Day`, `Day 1`, `today`, `daily` and `per day` all measure **clean** against every gate word
list, so **nothing mechanical will stop a plan from reintroducing it.** Only this note will. Write
`round` everywhere: in copy, in ids, in classes, in state keys and in commit labels.

Two further facts from the same paragraph the planner must carry:
- **This is simultaneous declaration, not alternating turns.** One Advance resolves both sides. That
  supersedes FIGHT-02's original "advance and rewind turn and round" reading — and it means
  `[S03]`'s declared fight shape `{ round, turn, cats, mechs, log }` (`:2870`) carries a **`turn`
  key whose meaning the developer has since changed.** The plan must either repurpose it, drop it, or
  state why it stays; `startFight` currently seeds `turn: 'cats'` (`:5150`). Whichever way it goes,
  `[S03]`'s banner line has to move with it, because a banner naming a key that means something else
  now is the quiet lie that banner forbids.
- **The history is a ledger of board states that accumulates on screen, not a log panel.** The
  `fight.log: []` array shipped in `startFight` (`:5152`) is a *log*; FIGHT-14 asks for stacked past
  *boards*. They may be the same structure or two; the plan must decide and say which, because
  `[S03]`'s banner already names `log` as part of the shape.

---

## Work-unit Classification

| Work unit | Region | Role | Data flow | Closest analog | Match |
|---|---|---|---|---|---|
| 1. The `fight` slice grown past `{round,turn,log,cats,mechs}` | `[S03]` banner + `[S05]` `startFight` | model/config | — | `sideFromBuild` `:4917-4924`, `startFight` `:5144-5158` | **exact** |
| 2. Fight ops: advance, rewind, reset-fight | `[S05]` | controller (writer) | CRUD | `startFight`/`endFight` `:5144-5175`, `resetToDefaults` `:5179-5183` | **exact** |
| 3. Declaration as pending intent | shell + `[S06.7]` + `[S07.5]` | component (form) | staged form | `#act-edit-propose` `:1456-1514` + `[S06.5]`'s proposal block `:8660-9159` | **exact — and it is the only one** |
| 4. Resolving an action's `xf` terms onto units | `[S05]` | service (writer) | transform | `setTally`/`nudgeTally` `:6296`-region, `setUnitHp` `:5113`, `App.model.affordability` `:2699`, `bestPair` `:2604` | **role-match** |
| 5. Damage with a shown shield/health split | `[S02]` + `[S05]` | service (pure) + writer | transform | `soakTotal` `:2762-2774`, `turnsToWipe` `:2809-2827` | **role-match** |
| 6. A control cluster at the top | shell `:1004-1102` | component | — | the four `.brd-tokedit` groups; `.rs-apart` | **exact** |
| 7. An accumulating on-screen ledger | new shell root + `[S06.7]` | component | append-only | **none append-only.** Nearest: `syncRow`'s grow-by-delta `:7264-7292`; build-once-write-every-frame `syncReference` `:8334-8350` | **partial** |
| 8. Dead-unit presentation + alive toggle | `[S06.1]` + `[S05]` | component + writer | request-response | the zero-tally hide pass `:7386-7440`, `amountFor` `:7147-7180`, `labelFor` `:7201-7212`, `setAlive` `:5123-5128` | **exact** |
| 9. An override with a visible marker | `[S06.7]` + `[S05]` | component | request-response | the proposal override row `fillOverride` `:8989-9020` + `overPill` `:9006-9033` | **role-match** |
| 10. A notice on the page (mid-fight edit) | `[S06.7]` | component | — | `ignoredText` / the admission line `:8114-8135`, `#tok-pick-names` `:1186-1205` | **exact** |
| 11. Fight repaint sub-region | new `[S06.7]` | component | request-response | `[S06.6]` `:9414-9663` and `[S06.5]` `:8357-9412` | **exact** |
| 12. Fight interactions | new `[S07.5]` | controller | event-driven | `[S07.4]` `:11788-12653`, `[S07.3]` `:10855-11786` | **exact** |
| 13. Fight styles | new `[C14]` | config | — | `[C13]` `:888-990`, `[C12]` `:643-887`, `[C07]` `:351-476` | **exact** |
| 14. PROJ-05 / REF-03 during the fight | `[S06.3]`, `[S06.4]` | component | — | **already shipped** — `buildColumn` `:7089-7107`, check 62 `:3308-3324` | **pre-satisfied** |
| 15. New in-file suite `[S09.12]` | `[S09.12]` | test | — | `[S09.11]` `:17962-17985`; `[S09.3]`'s fight rows `:13663-13722` | **exact** |
| 16. The gates — ids, stubs, `DIALOG_ROOTS`, floors, Layer C in fight mode | `tests/selftest-node.cjs` | test | — | stub-drift `:1160`-region; `openDialogs` `:4655-4703`; check 15 `:1691-1708`; check 62 `:3308` | **exact** |

---

## Pattern Assignments

### Work unit 1 — the `fight` slice, grown

**Analog A — the shape is already declared and already seeded.** `[S03]` banner `:2869-2873`:
```
 * Shape — integers only, JSON-clonable, no DOM nodes, no functions:
 *   { build: { schema, cats, mechs },
 *     fight: null | { round, turn, cats, mechs, log },
 *     ui:    { kbdNav, revealTok } }
 *   fight side shape: { ap, units: [ { id, hp, shield, alive } ] }
```
`startFight` `:5144-5158` builds exactly that:
```js
      s.fight = {
        round: 1,
        turn: 'cats',
        log: [],
        cats: sideFromBuild(s.build.cats),
        mechs: sideFromBuild(s.build.mechs)
      };
```
`sideFromBuild` `:4917-4924`:
```js
    return {
      ap: faction.ap,
      units: faction.units.map(function (u) {
        return { id: u.id, hp: u.maxHp, shield: u.shield, alive: true };
      })
    };
```

**Analog B — the three things `sideFromBuild`'s comment (`:4893-4916`) already decided on this
phase's behalf, each of which is a plan decision now due:**
1. **`shield` is copied into the fight slice and still has no writer.** *"Like `log`, the field ships
   now and its writer arrives with the phase that has a surface to spend from — Phase 5, plan 05-01.
   Nothing here decides how a shield behaves; the table still rules that."* FIGHT-16 is that writer.
2. **A `tally` is deliberately NOT copied.** *"Whether a tally should be spendable DURING a fight is
   a fight-semantics ruling, and Phase 5 owns it."* If any authored action's `xf` names a
   student-made token, Phase 5 must rule on where that number lives during a fight. This is a
   decision, written down as one.
3. **`setUnitHp`'s clamp is deliberately `MAX_ALLOC` and not the unit's own `maxHp`**, `:5100-5112`:
   *"capping fight health at its allocation is a FIGHT-semantics ruling — whether a heal can
   overshoot, whether a shield reads as temporary health — and Phase 5, plan 05-01 owns fight health.
   Changing it here would silently alter behaviour in a phase that has no fight surface to test it
   on. Left consciously, not missed."*

**Analog C — the `shield` op's name is already chosen for this phase.** `setUnitShield`'s comment
`:4950-4958`: *"its op will need a distinct name — `setFightShield` — because spending a shield
during a fight and allocating one during setup are different acts on different numbers."*

**Constraint:** the whole slice must stay **integers only, JSON-clonable, no DOM nodes, no
functions** (`:2869`). `thaw()` is `JSON.parse(JSON.stringify(state))` (`:2924`), which is the
enforcement — anything else *"disappears here loudly instead of surviving into the next commit."*

---

### Work unit 2 — `[S05]`: the fight ops

**Analog:** `startFight` / `endFight` / `resetToDefaults`, `:5144-5183`, read end to end. Four
properties to copy verbatim:

**(a) `commitStructural` for anything that flips what `structure()` would build.** `:5040-5043`:
```js
  function commitStructural(label, mutator) {
    App.state.commit(label, mutator);
    App.state.invalidate({ structural: true });
  }
```
and the rule above it, `:5029-5035`: *"every op that can change units.length, or flip `s.fight`
between null and non-null (which decides whether the add/remove chrome exists at all), commits
through this rather than through `App.state.commit` directly."* `startFight`'s own paragraph
(`:5137-5143`) is the worked example. **An Advance that changes what a card renders — a dead marker,
a new ledger row — has to decide which tier it is on and say why.**

**(b) The refusal inside the mutator when it must read the detached copy.** `startFight` `:5127-5136`:
```js
  // Refuses to overwrite a fight that is already running. Without the guard, a
  // double-click on the Phase-2 start button returned both rosters to full
  // health and emptied the fight record … The check sits inside the mutator, which
  // runs on the detached copy before anything is recorded, so the throw leaves
  // no phantom undo step
```
Otherwise **every guard runs OUTSIDE the commit** — `requireSide`, `requireDelta`, `requireTokenId`
all do (`:5025-5027`, `:4960-4967`). `fightOf(s)` `:4890-4893` is the in-mutator guard for
"no fight in progress" and already throws.

**(c) One mutator is one snapshot is one Ctrl+Z, and the stack is never cleared.** `:5176-5178`:
```js
  // One commit, therefore one undo entry (D-12). The undo stack is never
  // cleared here: a mis-clicked reset has to be recoverable.
```
**A reset-fight (SHARE-07) is `resetToDefaults` with `s.build` left alone** — one commit,
`commitStructural` because it flips the setup chrome, and `s.fight` rebuilt from
`sideFromBuild(s.build[side])`. `endFight` (`:5162-5167`) is already half of it:
```js
  // build is left untouched, so "run it again" always restarts from the same
  // allocation the student spent the exercise arriving at.
```

**(d) The label is the coalescing key.** `commit()` `:3110-3113`: *"Same label inside the window
means one continuous edit — press-and-hold is one undo step, not forty (D-10). The window slides on
each repeat."* `COALESCE_MS` is **500** (`:2892`). **Advance must carry a label unique per round** —
`'advance round ' + n` in `'action new ' + side + '/' + made`'s shape — or two Advances 400 ms apart
collapse into one undo entry and a round becomes unrecoverable.

**(e) The dispatch arm, read key by key.** `:6383-6392`, and the arm style at `:6373-6375`:
```js
      case 'createAction': return createAction(p.side, p.name);
```
Each new arm is `case 'advanceRound': return advanceRound();` — one key, named. **No new `fire()`
payload key.** `fire()` `:9901-9909` carries four keys and `tokenId` is *"plan 02.1-03's one recorded
exception to the section banner"* (`:9894-9900`). `[S07.3]` declined to add a second and `[S07.4]`
declined again (`:11833-11840`), both for the same reason: **every control inside a dialog carries a
private `data-*` its own delegated listener reads.** Phase 5 should decline a third time.

**Export block to extend:** `:6442-6506`. **The DELIBERATELY ABSENT block above it (`:6397-6412`)
must be rewritten in the same change** — see § Rule 0.4.

---

### Work unit 3 — the declaration surface: `#act-edit-propose` is its only ancestor

**This is the single most important analog in the phase, and its own comment says it has no
precedent.** `[S06.5]`'s proposal banner, `:8660-8688`:
```
   * THIS IS THE ONE SURFACE IN THIS FILE WITH NO PRECEDENT. …
   * Nothing else in this document stages a change for approval, so there was
   * no shape here to copy. A swatch dispatches on the press. A field
   * commits on Enter or on blur. Remove commits with no confirmation at all,
   * and its comment says out loud that undo is the reason. There was no shape
   * here to copy, so the shape chosen is a FORM …
   *
   * AND IT WRITES NOTHING. There is no App.ops call anywhere in this block or
   * in the handlers that drive it. A declared action lands on Advance, in
   * Phase 5 (D-05b, the developer, 2026-08-28).
```
**That last sentence is addressed to this phase by name.** The proposal pane is the declaration
surface's direct ancestor and the plan should read `:8660-9159` and `:1410-1514` end to end.

**(a) A proposal is a FORM on the DOM, and all four homes were measured.** Shell comment
`:1423-1432`:
```
       THAT IS NOT A STORAGE CHOICE, IT IS THE MECHANICAL EXPRESSION OF THE
       RULE. All four homes were measured. A `ui` key reddens the row that
       asserts that slice's exact key set, and the ui writer refuses an object
       value by contract. A fourth top-level slice reddens the row that asserts
       there are three. Nesting under the build slice reddens nothing and is
       still the wrong home, because the build slice is the student's
       allocation … and a proposal HAS NOT HAPPENED. Keeping it on the DOM means
       there is no state in which a proposal exists and has not been accepted, so
       nothing downstream — undo, the build code, the projection — can ever read one.
```
**The Phase-5 declaration is the same question with two of the four answers changed.** `s.ui` still
refuses an object (`setUi` `:5439-5449` allows boolean, whole number or string **only**, and
`UI_KEYS` is `['kbdNav','revealTok']` at `:5437`). A fourth slice still reddens 73c. **But
`s.fight` is a legitimate home now** in a way it was not for a proposal, because a declaration
*belongs* to a round and FIGHT-14 wants earlier rounds' declarations on screen. The plan must state
which home it chose and which of these four arguments it is overturning.

**(b) The static-row rule, and it is `MAX_*`-many rows plus one.** `:1444-1450`:
```
       EVERY ROW HERE IS STATIC, and so is the amount field inside it, for the
       reason the name field and the term rows are static (D-19): this dialog
       repaints on every frame while it is open, and a number a student is
       halfway through typing is exactly the text a rebuilt node throws away.
       There are App.data.MAX_ACTION_XF transformation rows plus one override
       row, and the surplus is hidden rather than removed.
```
Interaction-gate check 65 reads the static row count **out of the real markup, not the stub**:
`const shellReqRows = (html.match(/id="act-edit-req-\d+"/g) || []).length;` — *"not out of the stub,
which is hand-written from the same source and would be asserting itself."* **Any `MAX_*` cap Phase 5
turns into static markup needs that row.**

**(c) The class-name distinction that is the whole safety boundary.** `:1451-1455`:
```
       THE AMOUNT FIELDS CARRY .ae-prop-amt AND NOT .ae-amt. One class name is
       the entire distance between this pane and the authoring pane: [S07.3]
       tells an authoring amount field apart by .ae-amt and dispatches an op
       off it, so a field in here wearing that class would send the very write
       this pane exists not to make.
```
**A declaration surface that sits beside a surface that writes needs exactly this discipline, and it
needs it in the stub too** (see work unit 16).

**(d) `showProposed` — the one place "nothing derived is stored" needs care.** `:8865-8876`:
```js
  function showProposed(field, value) {
    if (!field || field === document.activeElement) { return; }
    if (field.dataset.apEdit === '1') { return; }
    field.value = value;
    field.dataset.was = field.value;
  }
```
and its paragraph, `:8848-8864`: *"they typed -4 over the -3 their rule says, and no record anywhere
remembers it — writing one is precisely the thing this pane does not do. So the flag on the node
carries it, and the flag is cleared when the pane is OPENED."* **A declaration a student edits before
advancing is exactly this, and the plan must decide whether the edit survives a round or is cleared
by opening — the current answer is "cleared", stated as deliberate behaviour and not a lost edit.**

**(e) The choosers.** `unitPick` `:8801-8815`, `fillPicks` `:8818-8835`, `pickedUnit` `:8837-8863`.
The rule at `:8816-8825`:
```
  // THE TARGET CHOOSER LISTS EVERY UNIT ON THE BOARD, both factions, and the
  // caster chooser lists the acting side's. That asymmetry is a fact about the
  // record rather than a ruling: … who an action may be pointed at is exactly
  // the sort of question this tool does not answer.
```
and `pickedUnit`'s: *"A STARTING POSITION ON A FORM IS NOT A DECISION ABOUT WHO AN ACTION HITS."*
**Phase 5's declaration surface needs two of these per side and it must keep both properties.**
Note the pill idiom is **outline-and-tick, never colour alone** — `aria-pressed` plus a `✓` span
plus a `--on` class (`[C07]`'s rule, restated in `[C12]`).

**(f) `sayInto` / `sayOver` — one node per fragment, and it is a GATE concern.** `:8749-8774`, with
its reason at `:8730-8748`:
```
  // A line built as ONE string would have to be either wholly read — which
  // reddens CI the day a student names a token type after a comparative word,
  // the gate then asserting the opposite of what ALLOC-10 promises — or wholly
  // exempt, which would take every word the ARTIFACT chose out of the only
  // layer that can see copy assembled at render time.
```
```js
  function sayInto(box, parts) {
    parts.forEach(function (part) {
      if (part.said !== undefined) {
        box.appendChild(text('span', 'ae-prop-said', part.said));
        return;
      }
      var node = text('span', 'ae-prop-word', part.word);
      setData(node, (part.tok !== undefined) ? { lbl: part.tok } : { anm: part.act });
      box.appendChild(node);
    });
  }
```
**Every assembled sentence Phase 5 renders — a ledger row, a declaration restatement, a damage split
line — must be built this way**, because every one of them mixes the artifact's words with a
student's token names and action names. `signed(n)` at `:8729-8731` writes `+2` / `-3` in **ASCII**
deliberately, *"because the amount FIELD beside it is parsed by `[S07.3]`'s regex, which takes ASCII
+ and - only."* `[S07.1]`'s `FIELD` regex is `/^([+-]?)(\d{1,3})$/` (`:9925`).

**(g) The three exemption channels.** `data-lbl` (a token type's name, text only), `data-albl` (the
same in an `aria-label`), `data-anm` (an action's name; **empty value means "this node's whole text
is a sentence my own region assembles"**, `:7360-7375`). The gate's harvest skips these
(`harvestInto`, `:4372`-region equivalent at `tests/selftest-node.cjs`). **A ledger row naming units,
tokens and actions is student text and needs them, or a classmate who names an action `Winner`
reddens CI on a legitimate replay.**

**(h) It disables nothing.** `[S06.5]` proposal banner `:8683-8689`:
```
   * WHAT IT NEVER DOES, and this is the whole of ACT-06: it never disables a
   * control on the grounds that a cost is unaffordable or a requirement unmet.
   * The report is a statement about what the BOARD holds; it is not a ruling
   * on what the STUDENT may do … Not one line below writes .disabled, and a
   * numbered check in tests/selftest-node.cjs compares the pane's whole
   * disabled set across a board driven to zero action points and a roster
   * driven below every requirement.
```
That check is **71c**, and it compares **thirty-three controls keyed by `data-k`**. Probe V in
03.1-07 proved it fires. **An Advance control disabled because a side cannot afford its declaration
would redden the same class of row.** Contrast `setShareEnabled` (`[S06.6]:9624`) and the picker's
Remove, which **are** disabled — those bound what the *tool* may do to itself.

---

### Work unit 4 — resolving an action's `xf` terms onto units

**The record shape**, `[S01] DEFAULTS` `:2310-2318`:
```js
        { id: 'slash', name: 'Slash', dmg: 1, keywords: [],
          cost: [{ tok: 'ap', n: 1 }], req: [],
          xf: [{ who: 'target', tok: 'hp', d: -1 }] },
```
- `cost`: `[{ tok, n }]`, `n ≥ 1`, and `actionApCost` refuses anything that is not exactly one `ap`
  term (`:2559-2566`).
- `req`: `[{ tok, n }]`, **not consumed**, read **on the caster only** (`affordability` `:2688-2690`).
- `xf`: `[{ who, tok, d }]` — `who ∈ App.data.XF_WHO` (`['caster','target']`, `:2191`), `d` a
  **signed** whole number bounded by `MIN_XF_DELTA`/`MAX_XF_DELTA` = ∓99 (`:2180-2181`).
- Caps: `MAX_ACTION_REQ = 2`, `MAX_ACTION_XF = 2`, `MAX_CUSTOM_ACTIONS = 3` (`:2156-2158`).

**`termList(record, field)` at `:8529` is the one reader** — use it, do not re-walk the arrays.

**The write ops to copy, and they are the tally pair, not the health pair.** `setTally` `:6296`-region
and `nudgeTally`. Three properties:
- **`tallyOwner(build, side, unitId, rec)` `:6265-6284`** decides *which record carries the number*
  from the type's `scope`, and is *"Called once on the live board to rule on the arguments, and again
  on the detached copy inside the mutator, where it cannot throw because the first call already
  ruled."* **An `xf` term landing on a student-made token type needs exactly this two-call shape.**
- **`hasOwnProperty` on every step.** `dropTally`'s comment: *"A bare `owner.tally` test would read
  an inherited name as present, and from Phase 4 a bag can arrive from a pasted build code rather
  than from this file."*
- **The value boundary, five guards, each exported so the suite asserts the live one:**

| Guard | Line | Refuses |
|---|---|---|
| `int(value, min, max, what)` | `:4557` | non-number, non-integer; clamps out-of-range. *"Everything a handler supplies — and, from Phase 4, everything a pasted build code supplies — comes through here."* |
| `requireSide(value)` | `:4600` | any key not in `SIDES` — `__proto__` resolves to `Object.prototype`, which is not frozen |
| `requireDelta(delta, what)` | `:4882` | a signed change that is not a whole number |
| `requireTokenId` / `requireNewTokenId` | `:2660`-region | reserved keys **by name, before** the pattern test |
| `requireXfWho` | exported at `:6491` | a `who` not on `XF_WHO` |

**Reads that already exist and must be reused rather than rewritten:**
- `App.model.affordability(faction, action)` `:2699-2711` — ACT-06's report. Returns
  `{ apCost, apHave, met: [{tok, need, have}] }`. **Numbers, booleans and token ids only. No prose
  leaves `[S02]`** (`:2698`).
- `App.model.presentOnCaster(faction, tok)` `:2718-2729` — `ap`, `hp`, `shield` off the faction;
  anything else off the side-scope tally bag.
- `App.model.bestPair(faction, activeUnits)` `:2604-2621` — `{hit, perTurn}` off **one** action.
  Its comment: *"activeUnits is forwarded untouched so Phase 5 can project a fight in progress"*
  (`:2799-2801`).
- `App.model.aliveCount(fightSide)` `:2732-2734` — *"Reads the stored flag. Death is never inferred
  from hp === 0."*
- `App.model.apSpent(buildFaction, fightSide)` `:2743-2745` — **floored**, and the comment says why:
  *"nothing stops a student lowering the build pool while a fight is running. The raw subtraction
  then reads 'AP spent: -2' on a projector."* **This is FIGHT-03's derivation and FIGHT-10's hazard
  in one function that already ships.**

**`[S02]`'s banner is the boundary, `:2484-2492`:** *"nothing below produces a symbol or a string,
because the page owns how a range is written down."* A resolution that returns
`{ toShield, toHealth, spilled }` belongs in `[S02]`; the sentence that reads
`Shield took 2, health took 1.` belongs in `[S06.7]`.

---

### Work unit 5 — damage with a shown shield/health split (FIGHT-16)

**Analog:** `soakTotal` `:2762-2774` and `turnsToWipe` `:2809-2827`, which are the file's two worked
examples of *refuse above the arithmetic*.

```js
  function soakTotal(faction, hit) {
    if (!(hit > 0)) { return 0; }
    return faction.units.reduce(function (n, u) {
      return n + Math.ceil(unitEhp(u) / hit) * hit;
    }, 0);
  }
```
Written as *"not greater than zero"* so a `NaN` is refused by the same line (`:2755-2761`). And
`turnsToWipe`'s paragraph, `:2778-2794`:
> *"the refusal is taken on the DIVISOR, above both divisions, rather than on the result below them.
> Both can be written correctly; only one of them is hard to write incorrectly. … Refusing the
> divisor has no second case left to forget. … The refusal is null rather than a clamp. Substituting
> 1 for a throughput of 0 would print a confident number of turns for a side that cannot attack at
> all, which is untrue in a way a student cannot see."*

**Applied to the shield split:** a hit of `n` against `shield: s, hp: h` gives
`toShield = Math.min(n, s)` and `toHealth = n - toShield`, and **`hp` must be allowed to go
negative-clamped-at-zero without inferring death** — `setUnitHp` already clamps at 0 (`:5117`) and
`[S05]` already states *"zero health prompts a death ruling from the table, it never auto-kills
(D-00d)"* (`:5098-5099`).

**`unitEhp(unit)` is literally `maxHp + shield`** (`:2501`), which is why `sideFromBuild` copies
`shield` at all, and why the projection and the board can otherwise disagree (`:4896-4903`).

**`DAMAGE_KEYS = ['hp']`** (`:2542`) is frozen and pinned by `[S09.2]` at `:13517-13519`. A shield
strip is *"a transformation other than a negative target delta on a token in `DAMAGE_KEYS`"* and is
therefore **unmodelled by the projection and NAMED rather than dropped** (`actionModelled` `:2647`,
`unmodelled` `:2668`, `ignoredText` `:8127-8135`). **Phase 5 shipping a real shield rule does not
change what the projection models**, and if it did, `[S09.8]` and `[S09.2]` pin the shipped 1 and 3.

---

### Work unit 6 — the topbar

See § Rule 0.5 for the bound. The markup pattern, `:1092-1099`:
```html
      <div class="brd-tokedit" role="group" aria-labelledby="share-label">
        <span class="brd-tokedit-label" id="share-label">Build code</span>
        <button class="brd-btn" type="button" data-k="sh" data-act="openShare">Share</button>
      </div>
      <div class="brd-tokedit rs-apart" role="group" aria-labelledby="reset-label">
        <span class="brd-tokedit-label" id="reset-label">Start over</span>
        <button class="brd-btn brd-btn--danger" type="button" data-k="rs" data-act="openResetAsk">Reset</button>
      </div>
```
**The `data-k` uniqueness rule is load-bearing and is stated three times** (`:1017-1023`,
`:1049-1052`, `:1082-1085`): `withPreservedFocus` restores focus by taking the **first**
`[data-k="…"]` match inside `#board` (`keyed()` `:6562-6564`), so a key rendered inside a repeated
region silently breaks focus restore. **A ledger of past rounds is by definition a repeated region.**
Either it lives outside `#board`, or every control in it carries a key unique per round.

**`data-act` versus a private attribute.** The partition is read back off the page by check 90b and
is stated at `[S07.4]:11800-11821`:
- **topbar openers carry `data-act`** and their acts go into `UI_ACTS`;
- **every control INSIDE a dialog carries a private `data-sh` / `data-rs` / `data-ap` / `data-pk`**
  that the region's own delegated listener reads. `#act-prop-open` (`:1404`) is the idiom:
  `data-ap="open" data-k="ap/open"`.
- `data-k` is a **slash path naming the id**, never the student's text: `pk/name`, `ae/side/cats`,
  `ap/amt/0`, `ap/over-tok/t1`.

---

### Work unit 7 — the accumulating ledger

**THERE IS NO APPEND-ONLY LIST RENDER ANYWHERE IN THIS ARTIFACT.** Measured: every list surface in
the file is `replaceChildren()` + rebuild (`fillPicks` `:8828`, `fillOverride` `:8998`,
`buildRefBand` `:8306`, `report()` `:13166`, `buildColumn` `:7108`), or build-once-write-every-frame
(`syncProjection` `:8158-8163`, `syncReference` `:8340-8343`). The nearest three partials:

**(a) `syncRow` — grow and shrink by DELTA only, and it is the file's one node-identity contract.**
`:7264-7292`:
```js
  // RULE 2 -- grow and shrink by DELTA only. Node identity is the animation
  // contract: 10 to 11 keeps all ten original nodes and appends exactly one.
  //
  // RULE 3 -- never re-append, never reorder, never row.append(...allNodes),
  // never replaceChildren(...existingNodes). appendChild on a node that is
  // already a child is a MOVE, which is a remove plus an insert, and removal
  // from the document cancels that element's CSS animations so re-insertion
  // replays them from the beginning.
```
```js
    var animate = row.children.length > 0;
    while (row.children.length > n) { row.lastElementChild.remove(); }
    while (row.children.length < n) { row.appendChild(makeToken(style, animate)); }
```
**This is the closest thing in the file to what a ledger wants** — grow by exactly the new rows, keep
every existing node, never reorder — and its stated reason (animation replay) applies with full force
to a ledger that stacks upward on a **game-feel course artifact**: *"Every token replaying its pop on
a game-feel course artifact is a correctness bug, not a polish item."*

**(b) Build-once, write-every-frame, walked by POSITION.** `syncReference` `:8322-8350`:
```js
  // BUILD ONCE, WRITE EVERY FRAME — the division [S06.3] already keeps. …
  // Walked by position rather than by an index stored on each node: the list is
  // built from REFERENCE.beats in order in the very function above, one node per
  // record, so position IS the pairing, and a stored index would be a second copy
  // of that fact to keep in step.
  //
  // The length guard is what makes the position safe to trust rather than merely
  // likely: if the two ever disagree, this writes the pairs it can account for and
  // leaves the rest as built, instead of reading past the end of the record list
  // and printing the word `undefined` on a projector.
```
```js
    var n = Math.min(lines.length, recs.length);
```
**A ledger keyed by position off `state.fight`'s round array is this pattern.** Copy the length guard
verbatim in spirit.

**(c) THE PERFORMANCE CEILING, and it is the one place CLAUDE.md's table bears directly.** Measured
in Chrome 151, 60 iterations per configuration:

| Board size | DOM nodes | Full re-render |
|---|---|---|
| 12 units × 10 tokens | 192 | 0.79 ms |
| 24 units × 20 tokens | 624 | 1.82 ms |
| 60 units × 30 tokens | 2,160 | **5.54 ms** |
| 200 units × 40 tokens | 9,200 | **23.03 ms** |

A ledger of **board states** multiplies node count by the number of rounds. The shipped 9v3 board is
12 units; ten rounds of full board snapshots is 120 units' worth of nodes — past the 2,160-node
5.5 ms row and heading for the 23 ms one. CLAUDE.md's own escalation trigger names the fix:
*"Move from region-scoped `innerHTML` to keyed per-unit patching for the roster region only … because
measured full re-render crosses 5.5 ms at 2,160 nodes and 23 ms at 9,200 — the frame budget breaks
somewhere between."* **Three cheaper answers exist and the plan should choose one explicitly:**
a ledger row that is a **line of text** rather than a board; a ledger that is **append-only and never
re-rendered** (`structure()` builds a row once and `sync()` never touches it again); or a **capped**
ledger in the `MAX_*` idiom. `UNDO_LIMIT = 30` (`:2891`) is the shipped precedent for a cap with a
number and a reason.

**The `MAX_*` cap idiom to copy**, `:1926-1930`:
```js
  // How many token types of their own a student may keep (D-18). Ships at 6
  // and is a Phase 4 dial, exactly as --tok shipped as a rehearsal dial for
  // the projector: six definitions at roughly 30 characters each is ~180 of
  // SHARE-04's 512-character build code before a single tally is written.
  var MAX_CUSTOM_TYPES = 6;
```
Named `var`, exported, **with the arithmetic that chose it in the comment above it.**

**Where it goes.** `#board` is `#col-cats` / `#strip` / `#col-mechs` / `#refband` / `#board-empty`
(`:1117-1122`), and `structure()` replaces **only the two column interiors** (`:7118-7124`):
*"Never `#board` and never `#app`: plan 02-02 binds its delegated listeners to `#app`, and those have
to outlive every rebuild."* A ledger is a **sixth static sibling** built once and flagged, in
`#refband`'s and `#strip`'s exact shape (`:1116-1119`, `syncProjection` `:8153-8160`).
**`[C03]`'s STICKY GOTCHA (`:95-102`) binds it:** no ancestor of `#topbar` or `#strip` may ever be
given `overflow:hidden|scroll|auto`, so **a ledger that scrolls must scroll on itself, not on an
ancestor.** *"There is no error and no warning when it goes wrong. Sticky simply stops working."*

---

### Work unit 8 — dead-unit presentation and the alive toggle

**`setAlive` already ships and is already dispatch-arm-free.** `:5119-5128`:
```js
  // The other half of D-00d: a stored flag, settable independently of health,
  // so a unit ruled "survived via Shield" and a unit ruled dead at full health
  // are both representable.
  function setAlive(side, unitId, alive) {
    requireSide(side);
    App.state.commit('alive ' + side + '/' + unitId, function (s) {
      findUnit(side, unitId, fightOf(s)[side].units).alive = (alive === true);
    });
  }
```
It is exported (`:6455`) but **has no `case` in `dispatch`** — grep confirms only `startFight` and
`endFight` have arms (`:6360-6361`). Phase 5 adds `case 'setAlive':` and `case 'setUnitHp':`.

**The `dead` token type already ships as vocabulary with no consumer**, `:2348-2353`:
```
    // `dead` ships as vocabulary with NO renderer consumer, on the same
    // "lock the shape before the mechanic arrives" precedent [S05] already set
    // for `shield` and `log`. It is the concrete proof that this renderer can
    // already draw Phase 5's dead marker — a rectangle carrying a skull —
    // without any of Phase 5's mechanic being built. Nothing here rules on
    // what a dead unit does; the table still rules that.
```
`TOKEN_IDS = ['hp','ap','shield','dmg','dead']` (`:1871`).

**`amountFor`'s scope branches, `:7147-7180`** — the read Phase 5 extends. Three properties:
- **The student-made-type arm sits ABOVE the `if (!unit) return 0` early return**, and the comment
  says why in as many words: *"A type a student made with scope 'side' is asked for with a null unit
  id by construction, so anywhere under that early return it would be unreachable and a faction tally
  would draw as zero forever."* **A `dead` amount is a per-unit 0-or-1 and lands in the same
  function; the placement question is identical.**
- `TOKEN_IDS.indexOf(amt) === -1` keeps the five the board is built on out of the tally arm — *"their
  quantity is the health, shield or action points already on the card, and a second number beside it
  would be a purely mechanical reason for the two to disagree."*
- **Nothing derived is stored.** `:7141-7146`.

**`labelFor(state, tokenId)` `:7201-7212`** is `styleFor`'s twin, with `hasOwnProperty` **and** a
`typeof … === 'string'` test, falling back to the shipped health label. **The refusal in
`fillProposal` `:9124-9130` records why that fallback is a trap for a message:** *"the type's record
has gone, so `labelFor` falls back to the shipped health label for an id it cannot find — asking it
here would print a name that is actively wrong."* **A dead-unit line naming a departed token type has
the same hazard.**

**The zero-tally hide pass, `:7386-7440`, is FIGHT-06's exact analog** — *dead units stay visible in
the roster rather than disappearing.* Read its three dependencies, which the plan inherits verbatim:
```
    //   nothing animates when a line comes back. A hidden line holds zero
    //     children by construction, and syncRow reads `animate` off
    //     row.children.length BEFORE its loop, so 0 -> 1 appends without the
    //     entry class and no token pops for a line that was merely revealed;
    //   the line already exists, so a tally going 0 -> 1 is a plain commit and
    //     a sync-only frame reveals it. structure() is not involved, and no
    //     caret or token node is thrown away to show one number;
    //   a line the board is built on is never touched here … A unit at zero
    //     health is something a student meant, and it stays on screen.
```
**That last clause is FIGHT-06 already decided.** And the hide pass's *third input* (`:7422-7440`) is
the lesson a dead-marker must not repeat: *"the rule above took the control away on the last press of
the − that reached zero: the button under the student's finger went inside a `display:none` ancestor,
which drops keyboard focus to the body."* **A dead unit whose alive-toggle is inside the thing the
death hides is that bug again.**

`unitCard` `:6838-6877` is where the marker and the toggle go. Note `setup` already gates the remove
button (`:6843-6852`), so a fight-only control is the mirror branch.

---

### Work unit 9 — an override with a visible marker

**Analog:** `fillOverride` `:8989-9020` and `overPill` `:9006-9033` — *"a party, a token type and an
amount, all empty, so a student can add a line their rule did not state. That is 'overrides it
entirely', and it is a row on a FORM."*

```js
  function overPill(kind, dataKey, value, label, on, isToken) {
    var b = el('button', 'ae-prop-pill' + (on ? ' ae-prop-pill--on' : ''));
    b.type = 'button';
    var pairs = { ap: kind, k: 'ap/' + kind + '/' + value };
    pairs[dataKey] = value;
    setData(b, pairs);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    var nameNode = text('span', 'ae-prop-pill-name', label);
    // A token type's name is a word a student typed, so it takes the same
    // exemption the choosers on the authoring pane take. A party's word is
    // this file's own.
    if (isToken) { setData(nameNode, { lbl: value }); }
    b.appendChild(nameNode);
    b.appendChild(text('span', 'ae-check', '✓'));
    return b;
  }
```
**Three properties to lift:** state said **twice** — in the class **and** in `aria-pressed` — never
in colour alone; the tick is a real node, not a pseudo-element; and the exemption marker goes on the
**name span**, not the button.

**FIGHT-07 differs from the proposal override in one way that matters:** the proposal's override
lands nothing, and Phase 5's *must* land and *must stay marked afterwards*. **That marker is a
per-value fact that has to live in state**, which is where § Rule 0.2 bites: `override` is a banned
key name at any depth. **The `.ae-prop-over` versus `.ae-prop-row` class split (`:1498-1500`) is the
precedent for how a marked row is told apart from an ordinary one:**
```html
      <!-- The override row carries .ae-prop-over and NOT .ae-prop-row, which
           is load-bearing rather than tidy: [S06.5] selects the transformation
           rows by that one class and this row is not one of them. -->
```

---

### Work unit 10 — a notice on the page (FIGHT-10's mid-fight-edit line)

**Two shipped "the page tells you something" patterns, and they are different shapes for different
jobs.**

**(a) The projection strip's admission line — built once, hidden, written every frame.**
`projIgnores` `:8103-8120` and `ignoredText` `:8127-8135`:
```js
  function ignoredText(state) {
    var names = App.model.unmodelled(state.build.cats)
      .concat(App.model.unmodelled(state.build.mechs));
    if (names.length === 0) { return ''; }
    return 'Not shown in these figures: ' + names.join(', ') + '.';
  }
```
and the node, `:8115-8118`:
```js
    var admit = text('p', 'prj-note', '');
    setData(admit, { prj: 'ignored', anm: '' });
    admit.hidden = true;
```
**Four silent-failure rules its comment checks off one by one (`:8102-8109`), and a Phase-5 notice
must check off the same four:** no `data-k` (so `keyed()` cannot take its first document match
there); no `data-amt` and not a `.brd-value` (so the value pass cannot paint a confident zero over
it); not `.brd-line--opt` (whose hide pass would pin it shut for good); and built once.
**`hidden` and EMPTY together** — *"there is one decision about emptiness and it is made here"*
(`:8125-8126`), and the same idiom is used again for `#share-over` at `[S06.6]:9613-9619`.

**(b) The picker's line beside Remove — permanent markup, a LINE and not a dialog.**
`#tok-pick-names` `:1186-1205`:
```html
  <!-- ACT-07 and D-12: what a removal will break, said BEFORE it happens.
       … A LINE and not a dialog, which is D-12 and phase
       2.1's D-17 reconciled rather than one overruling the other: D-17 chose no
       confirmation because a modal costs an instructor a click mid-demo to
       guard against something undo already covers, and that is still true — a
       line costs no click, adds no surface and leaves removal one undoable
       commit, while saying the thing D-17 had nothing to say.

       IT REPORTS AND IT DISABLES NOTHING. -->
  <p class="pk-warn" id="tok-pick-names" data-anm="" hidden></p>
```
**FIGHT-10's notice is this shape, not a dialog.** *"Editing the build mid-fight applies to the build
rather than retroactively to the fight in progress, and the tool says so on screen"* — a line costs no
click and disables nothing, which is exactly the reconciliation `#tok-pick-names` records. The
one time this file overruled that policy was `#reset-ask`, and the four-move argument it had to write
to do it is in `[C13]`'s shell comment and in `04-05-SUMMARY.md`.

**A third, weaker precedent worth knowing:** `#share-said` / `#sh-load-said` — empty, hidden nodes
reserved by one plan for a later plan's message, with the reason written down (`04-05-SUMMARY.md`,
Known Stubs). **Reserving Phase 5's notice nodes in an earlier plan of the phase and filling them in a
later one is a shipped, documented practice here.**

---

### Work unit 11 — new `[S06.7]`: the fight repaint

**Analog:** `[S06.6]` `:9414-9663`, which is itself `[S06.5]` copied. Copy the newer one.

**(a) The sub-region banner and the criterion for being one.** `:9414-9421`:
```
   * The share surface (SHARE-01, SHARE-04), appended as its own sub-region for
   * the mechanical reason [S06.2], [S06.3] and [S06.5] all state: it reconciles
   * through SYNC_HOOKS, SYNC_HOOKS is a closure variable of this IIFE, and it
   * paints a different page region on a different trigger. It changes NOTHING
   * in [S06.1] through [S06.5].
   *
   * IT IS [S06.5] WITH ONE FIELD AND A DIFFERENT FINGERPRINT, and it reuses
   * [S06.1]'s helpers rather than writing a parallel builder …
```
`[S06.1]`'s helpers: `el` `:6544`, `text` `:6550`, `setData` `:6556`, `keyed` `:6562`,
`withPreservedFocus` `:6577`, `makeToken` `:7222`, `styleFor` `:7188`, `labelFor` `:7201`,
`safeShape` `:7213` / `safeColor` `:7217`.

**(b) The signature gate.** `editorSig` `:9159`-region, `shareSig`, and the gate line
`if (dlg.dataset.shSig === sig) { return; }`. Two rules inherited and one measured:
- **`JSON.stringify` of an ARRAY, never a joined string** — *"a name is text a student types, so any
  delimiter is a character they can enter, and a joined fingerprint can be made to report 'nothing
  changed' for a change"* (`:9159-9166`).
- **Widen the fingerprint BEFORE the code that draws the thing**, or the surface is born stale in
  every release before that change (03.1-05's recorded lesson).
- **Measured, plan 04-05, BOARD E (24v24, six authored types, six authored actions, 617-char code):**
  `JSON.stringify(build)` **0.030 ms**; `App.serialize.encode(build)` **0.483 ms**. A fight
  fingerprint over `state.fight` is the same order as the first.
- **PROBE S's finding is directly reusable:** a fingerprint narrowed to unit health passed every
  share row except **89**, whose driving op (a rename) *"changes the code while touching no number the
  board draws through a stepper."* **A Phase-5 fingerprint row must be driven by an op of that
  character** — one that moves what is drawn without moving a stepper — or a narrowing will ship green.

**(c) Attributes each answering exactly one question.** `[S06.6]:9633-9644`:
```
    //   data-sh-pane is WHICH pane is showing. …
    //   data-sh-sig  is WHETHER anything drawn here has moved since the last
    //                frame, and NOTHING EVER READS A VALUE OUT OF IT. …
    //                a signature parsed for its parts is a
    //                selector-bound value recovered out of text a student can type.
```

**(d) The hook and its cheap-exit.** `:9655-9660`:
```js
  function syncShare(state) {
    var dlg = document.getElementById('share');
    if (!dlg || dlg.open !== true) { return; }
    share(state);
  }
  SYNC_HOOKS.push(syncShare);
```
*"It returns immediately while the dialog is closed, which is what keeps the encode off the hot path
for every student who never opens the surface."* **A fight hook's equivalent cheap exit is
`if (state.fight === null) { return; }`** — and that is the whole cost of this phase for a student
who never starts a fight.

**(e) Nothing derived is stored.** `:9441-9448`, stated with extra force: *"a stored code would be a
second, MECHANICAL reason for the code on screen and the board to disagree, on top of the
pedagogical disagreement this whole project is built around. `[S09.3]` pins the `ui` key set anyway,
so there is nowhere legitimate for it to go."* **Every number the fight surface shows —
points spent, units standing, the damage split — must be computed at render time from `App.model`.**

**(f) D-19, and the file now carries BOTH answers with their reasons.** `#tok-pick-name`,
`#act-edit-name`, `#sh-load-field` and every `.ae-prop-amt` are **never** written while focused;
`#share-code` **is** rewritten even while focused and its selection re-applied over the whole of the
new string, because *"it holds text the artifact produced, and the failure runs the other way."*
**A declaration field holds the student's input and takes the first rule. A ledger row holds the
artifact's arithmetic and takes the second.**

**Register on `[S06]`'s return** beside `picker`, `editor`, `share`.

---

### Work unit 12 — new `[S07.5]`: fight interactions

**Analog:** `[S07.4]` `:11788-12653`. Its banner (`:11790-11840`) is the template for the whole
contract and the partition table is the part to copy literally:
```
     PAGE WORK — UI_ACTS, handled here, never dispatched: …
     STATE WORK — real ops, dispatched, and deliberately ABSENT from UI_ACTS: …
     NEITHER NAME IS IN UI_ACTS AND NEITHER EVER MAY BE: an entry there is a
     name this region handles itself instead of dispatching, which is exactly
     how a refusal is made to stop being raised. Check 90b reads the partition
     off the page and names both ops, so the move reddens rather than shipping.
```
**Applied to Phase 5:** opening a declaration surface, moving between panes, showing or hiding the
ledger → **`UI_ACTS`**. Advance, declare-if-it-writes, damage, alive, reset-fight →
**real ops, dispatched, never in `UI_ACTS`.**

**The four seams, `[S07.1]` `:9752-9785`.** `UI_ACTS`'s own comment names this phase:
```js
  // This array is the landing place for EVERY future UI-only act: Phase 3's
  // reference cards, Phase 4's share dialog, Phase 5's fight controls. Nothing
  // UI-only may be added to [S05] to serve a dialog.
```
Live registrations to extend **by pushing, never editing**: `UI_ACTS.push` `:11785`, `:12652`;
`LATE_BINDERS.push` `:10814`, `:11516`, `:11776`, `:12616`, `:12641`; `SYNC_HOOKS.push` `:7886`,
`:8198`, `:8351`, `:9411`, `:9661`. **`HOLD_ACTS` `:9779` is the fourth seam and Phase 5 is the first
phase since 02.1 with a plausible use for it** — an Advance must *not* be in it (a hold would advance
forty rounds), but a fight-health nudge would. The comment at `:9765-9778` states the rule: *"only the
nudge ops return a boolean; undo, addUnit and removeUnit return undefined, so the ramp would run
until release and then throw non-terminally on the first bound it met … flashing the error panel
mid-demo."*

**Every listener through `App.boot.wrap`.** `bindShare` / `bindResetAsk` `:12580-12641`:
```js
    dlg.addEventListener('pointerdown', App.boot.wrap('reset ask press', onResetPress));
    dlg.addEventListener('click', App.boot.wrap('reset ask key-press', onResetClick));
    dlg.addEventListener('close', App.boot.wrap('reset ask close', onResetClose));
    dlg.addEventListener('keydown', App.boot.wrap('reset ask keydown', onResetKeyDown));
```
Check **68c** reads the registrations back structurally: *"`App.boot.wrap` returns an ANONYMOUS
zero-arity function … so a raw binding is visible by name and by arity. Floored on the count, because
a root with no listeners at all passes a per-listener test spotlessly."*

**Dispatch first, page work after.** `onPickerPress` `:10222`-region: *"An op that refuses throws out
of here into `[S08]`'s listener boundary and the page work never runs."* `[S07.4]` inverted this
exactly once, for the clipboard, and **recorded the inversion in writing.** Phase 5 has no reason to
invert it.

**The keyboard double-fire guard.** `isPrimaryPress(e)` `:10104` is the shared front gate; the click
arm is `if (e.detail !== 0) { return; }`.

**`bindResetAsk`'s no-`cancel` paragraph (`:12618-12630`) is the model for declining a listener**:
*"A no-op listener bound to make the four roots look alike would be dead code inside the error
boundary, which is a worse thing to hand the next reader than this paragraph."*

**Export block to extend:** `:12655-12694`, especially `UI_HANDLED` (`:12679`), *"read off the live
registration at the moment the section closes."*

---

### Work unit 13 — new `[C14]`: the styles

**Analog:** `[C13]` `:888-990`, which is `[C12]` `:643-887` restated, which is `[C07]` `:351-476`
restated. `[C13]`'s banner is the instruction, `:889-897`:
```css
  /* … TWO NEW PREFIXES, .sh- and .rs-, and they are two
     rather than one for the reason [C12]'s banner gives about .ae- and [C07]
     gives about .pk-: a single stylesheet has no real scope, so .sh- means "the
     share surface" everywhere else in this file, and letting the confirmation
     borrow it would make every rule below a rule two dialogs depend on. A
     Phase 5 rule for .code or .said would otherwise reach both from four
     thousand lines away. */
```
**That sentence names this phase.** Phase 5 takes **its own prefixes** — one per surface, restated
rather than shared. Measured clean: `.fg-`, `.fl-`, `.ld-`, `.rd-`, `.dc-`.

**Three prohibitions, all already stated:**
- `url(` is refused document-wide — **no `background-image`, no data-URI icon, no CSS-loaded font**
  (`[C13]:919-921`).
- **No inline SVG and no `createElementNS`** — *"the namespaced element constructor takes a URI of the
  shape the dev gate refuses document-wide"* (`[C12]:663-666`). A shape is a `clip-path`, as `[C05]`
  already draws the board's triangles and hexagons.
- **No new hex.** Colours are derived with `color-mix()` from the existing tokens (`[C07]`'s banner).
  The danger colouring already ships twice: `.err-btn--danger` (`[C08]:490`) and `.brd-btn--danger`
  (`[C13]`), both from `--accent-2`.

**UX-02's 18px legend floor is stated in `[C07]`, `[C12]` and `[C13]` and binds a fourth time**:
*"a permanent visible label at the 18px minimum, never an icon and never a `title=` tooltip."*

**`[C03]`'s STICKY GOTCHA** (`:95-102`) binds any new scrolling region — see work unit 7.
`[C12]:681`-region already has a scrolling list (*"It SCROLLS rather than…"*) as the shipped
precedent for scrolling on the element itself.

---

### Work unit 14 — PROJ-05 and REF-03 are already satisfied, and asserted

**Do not build these. Assert them.**

`buildColumn` `:7089-7107`, the cross-plan edit's own paragraph:
```
           OUTSIDE the setup branch above, deliberately and not by oversight.
           The Add button is a roster CONTROL and belongs to setup; these cards
           are reference MATERIAL, and a student reading what Lasers does needs
           it at least as much mid-fight as mid-build — which is REF-03, in
           Phase 5. One branch placement now costs nothing and saves that phase
           a re-layout. It is asserted by starting a fight and reading the cards
           back, in [S09.9] and in the interaction gate, rather than left
           resting on this paragraph.
```
and check **62**, `tests/selftest-node.cjs:3308-3324`, already drives it:
```js
check(
  '62. starting a fight leaves every action card on the page while the '
    + 'setup-only Add button goes away — Phase 5\'s REF-03 is pre-satisfied by '
    + 'where the append sits, and this is the row that says so',
```

**PROJ-05 has a real question behind it and the plan must answer it.** `syncProjection` `:8143-8197`
reads `state.build` and only `state.build`, so the strip stays on screen during a fight **showing the
allocation, not the fight's current numbers.** `turnsToWipe(attacker, target, activeUnits)` already
takes the third argument *"so Phase 5 can project a fight in progress"* (`:2799-2801`) and every
Phase-3 caller leaves it undefined. **Whether the strip switches to live survivor counts mid-fight is
a Phase-5 decision, and D-13's prohibition (no figure about both sides) plus D-06 (whole numbers
only) bound it either way.** Note also that leaving it on the allocation is what makes the ROADMAP's
teaching moment land — *"you guessed 3–5, it took 8"* — so changing it is not obviously an
improvement.

---

### Work unit 15 — new in-file suite `[S09.12]`

**Register it in `[S09]`'s banner index, `:13035-13051`** — *"this list is the only index of them."*

**Analog:** `[S09.11]` `:17962-17985`, and specifically its opening declaration, which is the model
for how a Phase-5 suite should be split:
```
    /* THE WHOLE OF THIS SUITE SITS ABOVE ANY no-DOM BRACKET, AND THAT IS A
       DECISION RATHER THAN AN ACCIDENT. Five suites in this file stop at a
       "no document, so return" bracket, and every row below one of those is
       documentation until somebody opens the page with #selftest. A codec is
       state work: it reads no page, writes no page and needs none, so every
       row here runs in the terminal harness and can therefore fail a build.
       Nothing in [S09.12], in this plan or in any later one, may sit below a
       bracket — the day a codec row needs a page is the day that row belongs
       in the interaction gate instead.
```
*(The artifact writes `[S09.11]` there; the shape is what matters.)*

**Also copy:** the `savedAll = JSON.stringify(App.state.get())` / `App.state.restore(savedAll)`
bookend (`:17985`, `:17955-17959`), which `[S09.3]`, `[S09.6]`, `[S09.7]`, `[S09.10]` and `[S09.11]`
all keep; and the driven-board argument — *"a hand-written state literal agrees with whatever its
author believed the shape was, while a board driven through addUnit, setUnitMaxHp, createTokenType …
agrees with THIS FILE."*

**Rows that already exist and must not be duplicated** — `[S09.3]` already carries the fight half:
`:13611` three slices; `:13663-13668` startFight and the refused restart; `:13672-13681`
`aliveCount` reads the flags not the hit points; `:13719-13722` undo crosses the fight boundary;
`:13855-13863` *"shield is a BUILD write. Phase 5 owns the fight slice's own copy."* **That last row
is a tripwire aimed at this phase and it will need rewriting the day `setFightShield` exists.**

**The bad-input table idiom**, `[S09.7]`/`[S09.10]`'s form:
```js
    ['sparkle', 'T1', 't1 ', 't1\n', 't100', '', 5, null, {}].forEach(function (bad) {
```
A fight suite's table wants: advance with no fight; advance twice with the same label; a declaration
naming a unit that has been removed; a declaration naming an action that has been removed
(`missingTerm`'s ACT-07 case, `:8776-8799`); a damage larger than shield + health; `setAlive` with a
truthy non-`true`; a round number at `MAX_*`.

**The prototype-intact check after every path**, `[S09.10]:13320`-region equivalent:
```js
    function protoIntact() {
      return Object.getPrototypeOf({}) === Object.prototype
        && Object.prototype.polluted === undefined … ;
    }
```
*"checked after every path below rather than at the end. Both corruption shapes evaporate or hide,
so a single check at the bottom would read clean over a run that had already gone wrong."*

**`t.info` is the instrument for a measurement rather than a gate** (`:9705`-region equivalent:
*"A measurement, not a gate"*). Use it for the playtest-adjacent numbers plan 05-03 records.

---

### Work unit 16 — the gates

#### 16a. THE CI SPLIT — which of Phase 5's assertions can fail a build and which cannot

**`[S09.*]` rows behind `typeof document === 'undefined'` DO NOT RUN IN THE TERMINAL HARNESS.**

The mechanism, precisely:
1. `tests/selftest-node.cjs:339-347` loads the script into a sandbox with **no `document` and no
   `location`**, deliberately: *"[S10] LAUNCH stays inert and App.hasFlag takes its undefined-location
   path."*
2. `:356` runs `sandbox.App.selftest.run()`. Every suite executes; **every row behind the bracket is
   skipped.**
3. **The bracket appears at exactly six places today**, `cats-vs-mechs.html:13159`, `:13925`,
   `:13991`, `:15010`, `:15949`, `:16441`. The fullest statement, `[S09.9]:16436-16444`:
   ```js
       /* --- … tests/selftest-node.cjs runs these suites in a bare sandbox with no
              document at all, so the suite says so and stops rather than painting
              a terminal run red for something that is not a defect … The gate in
              that file mirrors the highest-value rows below against its own stub
              page, which is what keeps this behaviour reachable from CI at all. --- */
       if (typeof document === 'undefined') {
         t.info('reference material', 'skipped — no DOM');
         return;
       }
   ```
4. **The numbers today.** DOM-free total **1051 passed / 0 failed**, floored at `SUITE_FLOOR = 1019`
   (`tests/selftest-node.cjs:438`) — a margin of **32**. The full total with a DOM is measured only
   by a hand-built one-off runner that **is not in the repo**; 03.1-07's summary calls this an
   outstanding debt and notes it was the seventh plan in a row to rebuild it from a scratchpad.
5. **The rule for this phase's author.** *An assertion written below a no-DOM bracket is documentation
   until somebody opens the file with `#selftest`. Anything that must fail the build belongs in
   `tests/selftest-node.cjs`'s interaction gate.*

**WHICH HALF OF PHASE 5 CAN EXPLOIT PHASE 4's TRICK, DECIDED HERE:**

| Phase 5 work | Above the bracket (runs in CI)? | Why |
|---|---|---|
| Fight slice shape, `startFight`/`endFight`/reset-fight | **YES** | state work; `[S09.3]` already proves it there |
| Advance, round arithmetic, declaration→resolution as a pure transform | **YES** | state work if the resolution is a `[S02]` pure function taking a slice |
| Damage / shield-split arithmetic | **YES** | `[S02]` is pure by banner; `[S09.8]` is the precedent |
| `setAlive`, `setUnitHp`, override write path, refusals | **YES** | `[S05]` ops are state work |
| Bad-input tables, prototype-intact rows, refusal-by-name rows | **YES** | |
| **The declaration surface's presses and its nothing-lands guarantee** | **NO** | needs a page; goes in the interaction gate, as checks 72/73 did for the proposal |
| **The ledger rendering and its growth** | **NO** | needs a page |
| **The dead-unit presentation and the alive toggle's on-screen half** | **NO** | needs a page |
| **The mid-fight notice appearing** | **NO** | needs a page |
| **Layer C reading fight-mode copy** | **NO** | interaction gate only — and see 16c |

**So: write the arithmetic half of `[S09.12]` entirely above any bracket, exactly as `[S09.11]` did,
and put every surface assertion in the interaction gate.** That is the same split Phase 4 exploited
and the same one Phase 3.1 could not.

**The second half of the lesson, from Phase 3's WR-01** (`[S09.9]:13010`-region equivalent):
*a check written against source spelling cannot see behaviour expressed through a helper.*
**Assert the ledger by driving a real Advance and reading the rows off the page**, never by grepping
`[S06.7]` for an `appendChild`.

#### 16b. CURRENT GATE BASELINE — the floors Phase 5 must move

Measured this session with `node tests/selftest-node.cjs`, exit 0:

| Reading | Current | Floor | Margin |
|---|---|---|---|
| In-file suite (DOM-free) | **1051 passed / 0 failed** | `SUITE_FLOOR = 1019` (`:438`) | 32 |
| Interaction gate | **146 of 146** | — | next free check number is **92** |
| Stub-drift shell ids | **96** | bidirectional, exact | — |
| Layer A words | 16 | — | aborts on any hit |
| Layer B string literals | **5,582** | `2000` (`:274`) | — |
| Layer C `#app` | **127** | `117` (check 47, `:4775`) | 10 |
| Layer C dialogs | **145** across **4** roots | `DIALOG_FLOOR = 138` (`:4859`) | 7 |
| Layer C picker | — | `PICKER_FLOOR = 84` (`:4868`) | — |
| Layer C share surface | 1 | `SHARE_FLOOR = 0` (`:4893`) | — |
| Layer C proposal pane | **60** (24 of them chooser ticks) | `PROPOSE_FLOOR = 23` (`:5452`) | 37 |
| no-writer gate | **48** exported ops, **18** dispatch arms of **57** acts, **425** action records | — | — |
| perf | **7 ms** / 100 commits | 50 ms | — |
| Second stub page (boot from prepared hash) | **14 ms** | — | — |

**Floors carry their history — that is a house rule, not a courtesy.** `:4746-4776` (`#app`),
`:4780-4859` (`DIALOG_FLOOR`), `:381-438` (`SUITE_FLOOR`), `:4868` (`PICKER_FLOOR`), `:4893`
(`SHARE_FLOOR`), `:5452` (`PROPOSE_FLOOR`). `DIALOG_FLOOR`'s rule is written out:
```js
// THE RULE FOR THE NEXT PLAN THAT ADDS A DIALOG: re-measure, and move this
// number so it stays one surface's worth below the new total. A floor that is
// not moved when a root is added is a floor that quietly stops bounding
// anything …
```
**And `#app`'s floor carries the arithmetic Phase 5 needs:** *"each unit card is worth EXACTLY 7
strings, measured by adding three Mechs one at a time and watching 123 go 130, 137, 144; and an
authored action is worth 1."* A fight-mode board will move this number and the plan must re-measure
rather than guess.

**`SHARE_FLOOR = 0` against a harvest of 1 is the precedent for saying out loud that a small floor is
a fact about the surface rather than a weak gate** — 04-05 wrote that at the constant so *"the next
reader coming from `PICKER_FLOOR`'s 84 does not read it as a typo."*

#### 16c. `tests/selftest-node.cjs` — the interaction gate

**The three-part arrival rule, stated in both dialogs' shell comments** (`:1074`-region, `:1284-1289`):
> *Adding an id here without teaching `tests/selftest-node.cjs` about it fails the run in both
> directions — and, since plan 03.1-01, so does adding a `<dialog>` without an entry in
> `DIALOG_ROOTS`. The id, the `KNOWN_IDS` entry, the stub node and the `DIALOG_ROOTS` entry arrived
> together.*

Probe R in 04-05 proved all three directions abort or redden by name.

**`KNOWN_IDS` is grouped by owning plan with a comment per group**, `tests/selftest-node.cjs:494-604`.
The newest group (`:588-604`) is the template. **96 ids ship today.** The picker cost 19, the action
editor 21 for two panes, the share pair 23. **Budget accordingly, and read `#act-edit`'s id-budget
paragraph (`:1281-1284`) before deciding whether the declaration surface and the ledger are one root
or two:**
```
       3. The id budget. The picker cost 19 of the file's 37 shell ids; two
          dialogs would land this file near sixty, and every one of them is a
          line in tests/selftest-node.cjs that has to be built by hand.
```
All three of that comment's costs transfer, and cost 2 transfers with force: *"the Node stub has no
close-request behaviour at all."*

**The stub `<dialog>` is exactly three members beyond a plain element** (`:902`-region), and the
warning above it is the one that costs the most when ignored:
```
     EVERY DATASET SPELLING BELOW IS COPIED FROM THE SHELL. A typo here is not
     a red run: it is a green one, over a control nothing is listening to. The
     same goes for the classes …
```
**`idNode(id, tag)`** builds them. **Phase 5's declaration fields need their own class in the shell
AND in the stub**, or every handler declines on line one and the gate reads green over a field
nothing is listening to.

**`DIALOG_ROOTS`** `:4631-4649` — bidirectional check **47b**. `openDialogs()` `:4655-4703` **drives
the real opener** rather than calling `showModal()`, and 04-05's finding is written at the call site:
```js
    // ASK FOR A FRAME RATHER THAN HOPING ONE IS DUE. flush() runs a PENDING
    // frame and does nothing when none is pending … Plan 04-05's two roots have
    // no opener yet, showModal() asks for nothing, and their per-frame hooks
    // would therefore never have run: the walk would have read an empty surface
    // and called it clean …
    A.state.invalidate();
    A.state.flush();
```
**An `act: null` entry is legitimate for exactly one plan**, with the reason written down, when the
opener belongs to a later plan (`:4640-4648`).

**LIMITATIONS ENTRY 5 IS PHASE 5's TO CLOSE**, `:7484-7492`:
```
         5. Any words Layer C's page does not currently show. The walk reads
            #app as the stub page renders it in setup mode, so a string that
            appears only once the fight has started is outside its reach until
            that surface is built and the walk is pointed at it.
```
**Verified this session: `renderedText` is harvested with the board in setup mode**, well before
check 62 drives `startFight()` and restores. **So every word Phase 5's fight surface renders is
currently invisible to the only layer that can read copy assembled at render time.** Closing it means
a second harvest taken with a fight in progress, with its own floor, in `PROPOSE_FLOOR`'s shape —
which is the precedent for *"a floor derived from the roster-independent part of a measurement rather
than picked below it"* (03.1-07). **This is the highest-value single addition Phase 5 can make to the
gate, and it is what stops the nineteen measured word-list gaps from being exploited by accident.**

**Entries 12, 13 and 16 acquire more instances.** Entry 12 (close request declined) stands for four
roots and *"adding a dialog adds one."* Entry 13 (words a dialog paints only after something happens
inside it) is exactly a declaration surface's problem. **Extend the list rather than leaving the
reader to discover it — that is what the list is for.**

**Two check shapes to copy verbatim.**
- **68c**, the listener-boundary check, floored on the count: *"`App.boot.wrap` returns an ANONYMOUS
  zero-arity function … so a raw binding is visible by name and by arity."*
- **68d / 90b**, the act partition collected off the page: walk the surface for every `data-act`,
  split against `UI_ACTS` / `UI_HANDLED` / `App.ops`, assert both halves.
- **71c**, the whole-`disabled`-set comparison across thirty-three controls keyed by `data-k`, driven
  on a board at zero action points **and** a roster below every requirement.
- **72/73**, the nothing-lands pair, which asserts **state identity AND page movement in one row**:
  *"A row that compared only the state would be spotlessly green over a pane whose every press did
  nothing at all — and probe Y proved that is not hypothetical."*

**The selector engine is narrower than it looks.** `matches()` `:610`-region supports a tag name,
classes and `[data-*]` tests **only** — no `#id`, no descendant combinator, no `[hidden]`. Stub
`textContent` is a plain own property, **non-recursive**. Every probe selector must be a class or a
`[data-*]`, and any probe reasoning over a subtree's text must walk it.

**Test labels inside `cats-vs-mechs.html` are string literals and Layer B reads them.** A
`t.eq('the winner is recorded', …)` in `[S09.12]` aborts the run.

---

## Shared Patterns

### The four extension seams — the whole reason this phase needs no edit to `[S07.1]`
**Source:** `cats-vs-mechs.html:9752-9785`; `[S07.2]` `:10814`, `[S07.3]` `:11516`/`:11776`/`:11785`,
`[S07.4]` `:12616`/`:12641`/`:12652` as the worked users.
**Apply to:** work units 11, 12.
Push and assign; edit no line of `[S07.1]`. The one documented exception in the file's history is
`fire()`'s `tokenId` payload key (`:9894-9900`), and both 03.1 and 04 explicitly declined to add a
second.

### Guards outside the commit; the in-mutator guard only when it must read the detached copy
**Source:** `:5025-5027` (the delta siblings' three properties), `:5127-5136` (`startFight`'s
in-mutator refusal), `:3103-3107` (`commit`'s "mutator runs FIRST on a detached copy").
**Apply to:** every op in work units 2, 4, 5, 8, 9.
A refusal must leave **no phantom undo step**.

### One mutator is one snapshot is one Ctrl+Z, and the stack is never cleared
**Source:** `:5176-5178`, `:5162-5166`, `:3116-3119` (the 30-entry cap and the 500 ms coalescing
window).
**Apply to:** Advance, reset-fight, override. `UNDO_LIMIT = 30` is the number `#reset-ask`'s D-19
argument turns on, and it applies to a fight too: **thirty commits into a fight, the round before
last is gone.** If Advance must be recoverable further back than that, the ledger is the mechanism,
not undo — and the plan should say so.

### Nothing derived is stored
**Source:** `[S02]` banner `:2484-2492`; `amountFor` `:7141-7146`; `[S06.6]` `:9441-9448`;
CLAUDE.md's *"Storing derived eHP/DPS in state"* prohibition.
**Apply to:** points spent, units standing, the damage split, the "what changed" delta. Every one is
computable from the current fight slice plus the previous ledger row. **A stored delta is a second,
mechanical reason for the board and the ledger to disagree.**

### `[S05]` never touches the page; `[S02]` never produces a string
**Source:** `[S05]` banner `:4527-4538`; `[S02]` banner `:2484-2492`; `affordability`'s closing line
*"Numbers, booleans and token ids only. No prose leaves `[S02]`"* (`:2698`).
**Apply to:** the damage split, the affordability report, the refusal messages. `[S02]` returns
`{toShield, toHealth}`; `[S06.7]` writes `Shield took 2, health took 1.`

### Lookup is an `Array.find` over a record's own `id`, never a bare index
**Source:** `findUnit` `:4870-4877` and `:7136-7143`; `actionNameFor` `:6923-6947`; `effectRecord`;
`styleFor` / `labelFor`'s `hasOwnProperty` guards.
**Apply to:** every read a declaration or a ledger row makes. `actionNameFor`'s paragraph states the
one rule a fight surface will break first: **THE SIDE IS NOT OPTIONAL FOR A CARD** — `x1` on the Cats
and `x1` on the Mechs are two different actions with one id.

### Every listener goes through `App.boot.wrap`; every wiring step through `attempt`
**Source:** `wrap` `:12859`, `attempt` `:12847`, `bindEditor`/`bindShare`/`bindResetAsk`; check 68c
reads it back structurally.

### One node per fragment for every assembled sentence
**Source:** `sayInto` `:8749-8774` and its reason at `:8730-8748`; the three exemption channels
`data-lbl` / `data-albl` / `data-anm` and the per-frame passes at `:7327-7375`.
**Apply to:** the ledger, the declaration restatement, the damage split line, the mid-fight notice.

### Describe, never quote
**Source:** `refCard`'s prohibition block; `[C12]:663-666`; the whole of § Rule 0.1.
**Apply to:** every comment in this phase. Live gates scan the source for the very words and
attributes a comment might helpfully spell out — `url(`, `Function (`, `counter`, `rating`,
`generating` — so a comment promising not to use something is the thing that fails the scan.

### Floors carry their history
**Apply to:** every number this phase moves. Re-measure, move it, add a line to the history paragraph.

---

## No Analog Found

| Technique | Role | Data flow | Why there is no analog |
|---|---|---|---|
| **An append-only, accumulating on-screen list** | component | append-only | Every list surface in the artifact is `replaceChildren()` + rebuild or build-once-write-every-frame. `syncRow`'s grow-by-delta (`:7264-7292`) is the nearest and is about token nodes inside one row, not rows inside a region. The one structure in the file that only grows — the undo stack — is **capped at 30 and never rendered** (`:2891`, `:3116-3119`). So the ledger's growth policy, its cap and its render tier are all decisions with no precedent, and CLAUDE.md's re-render table (§ work unit 7) is the only quantitative input. |
| **A state key that records "this value was changed by hand"** | model | — | Nothing in this file marks a value's provenance. Every number in `build` and `fight` is just a number, and `[S03]`'s banner pins the slice to *"integers only, JSON-clonable."* A per-value marker is a shape the state has never carried — and check 73c bans the obvious name for it at any depth (§ Rule 0.2). The proposal's override row (`:8989-9020`) marks a **form control**, not a stored value; that is the nearest thing and it is not the same thing. |
| **Layer C reading a rendered page in fight mode** | test | — | Harness limitations entry 5 (`:7484-7492`) says so in as many words, and it was verified this session: the `#app` harvest is taken with the board in setup. **Nineteen evaluative words measured clean against the live lists**, and the surface most likely to use them is the one surface the gate cannot currently read. |

Two further items with facts but no pattern, escalated rather than answered:

- **Where the declaration lives.** `s.ui` refuses an object by contract (`setUi` `:5439-5449`); a
  fourth slice reddens 73c; `s.build` is the student's allocation and round-trips through a share
  code; the DOM is where the *proposal* lives and the shell comment at `:1423-1432` argues for it at
  length. `s.fight` is the fourth candidate and the only one that did not exist as a question when
  that paragraph was written. **It is a scope decision, and 73c's key-name ban is the part that is
  mechanical rather than judgement.**
- **Whether `[S03]`'s declared `fight.turn` key survives simultaneous declaration.** The banner
  (`:2870`) and `startFight` (`:5150`) both carry it; the developer's 2026-08-28 round loop
  supersedes the reading that produced it. **Either it is repurposed as the declaring side, or it
  goes and the banner goes with it.** A key named after a concept the file no longer has is the exact
  hazard `[S03]`'s banner calls *"a banner that quietly lies."*

---

## Metadata

**Analog search scope:** `cats-vs-mechs.html` (19,508 lines) — the static shell `:995-1520`, `[C03]`,
`[C07]`, `[C08]`, `[C12]`, `[C13]`, `[S01]`, `[S02]`, `[S03]`, `[S04]` (banner, `[S04.2]`, `[S04.4]`),
`[S05]`, `[S06.1]`, `[S06.3]`, `[S06.4]`, `[S06.5]`, `[S06.6]`, `[S07.1]`, `[S07.2]`, `[S07.4]`,
`[S08]`, `[S09]` banner, `[S09.3]`, `[S09.11]`. `tests/selftest-node.cjs` (7,618 lines) — the header
and `FORBIDDEN`, Layers A / B / C, `makeStubDom` and `KNOWN_IDS`, `matches`, `DIALOG_ROOTS` and
`openDialogs`, every floor, checks 14 / 15 / 47 / 47b / 62 / 73b / 73c / 74, and the limitations list.
**Files scanned:** 2 source files, 5 planning documents (ROADMAP, REQUIREMENTS, `04-PATTERNS.md`,
`04-05-SUMMARY.md`, `03.1-07-SUMMARY.md`), CLAUDE.md.
**Reads:** targeted, non-overlapping offset/limit ranges located by grep first; no range read twice.
**Measurements taken this session:**
- **366 candidate Phase-5 words, identifiers and sentences run against the LIVE `VERDICT_WORDS`,
  `VERDICT_LITERAL_WORDS` and `FORBIDDEN` arrays**, extracted programmatically from
  `tests/selftest-node.cjs` rather than re-typed. 65 fails and 301 clean, tabulated in § Rule 0.1,
  including **nineteen newly measured gaps in the word lists**.
- The full gate baseline (§ 16b), by running `node tests/selftest-node.cjs` to exit 0.
- Confirmation that `#app`'s Layer C harvest is taken in setup mode and that fight-mode copy is
  therefore unread.
- Confirmation that check 73c's key-name walk covers `state.fight` at every depth.
**Pattern extraction date:** 2026-08-29
