# Phase 4: Share & Reset - Research

**Researched:** 2026-08-28
**Domain:** Build-code serialization for a single-file `file://` artifact — a versioned positional codec over student-authored Unicode data, `location.hash` mirroring, clipboard with graceful degradation, and a confirmed destructive reset
**Confidence:** HIGH on everything load-bearing. Every size figure in this document was produced by an encoder that also **decodes**, round-tripped against states driven through the shipped ops. Every browser claim was executed in Chrome 151 from `file://`.

---

## Summary

**The central question is answered, and the answer is not the one `[S01]`'s comment predicted.**
`cats-vs-mechs.html:1704-1714` predicts "180 + 300 = 480 against a 512-character design target."
Measured against a real encode/decode round trip over the shipped board: a **realistic** student
build is **295 characters** — the prediction is confirmed for the case it was written about, with
40% of the budget unspent. But the prediction was written before the *ceiling* existed. A board
that fully exercises what Phase 2.1 and Phase 3.1 shipped measures **675 characters**, and the
adversarial ceiling measures **2,984–3,186** — over Discord's 2,000-character hard limit.

**This phase should NOT ship `CompressionStream('deflate-raw')`, and the reason is not size.** It is
that `CompressionStream` is asynchronous, and CLAUDE.md's own HIGH-confidence finding is that
`navigator.clipboard.writeText()` must be called *synchronously inside the user gesture* from Chrome
107. An `await` between the click and the write forfeits the gesture. Compression also cannot be
reached from the Node gate at all — `CompressionStream`, `btoa`, `atob`, `TextEncoder` and
`TextDecoder` are **all `undefined`** in the harness sandbox (measured), so the escalation path would
be simultaneously untestable in CI and structurally hostile to the one requirement it exists to serve.

The two **synchronous** schema decisions below buy a 3× reduction at the ceiling for about fifteen
lines of codec, and they are what this phase should ship instead: a **name table** (each distinct
name encoded once, referenced by index) and **two independently run-length-encoded unit streams**
(health/shield separate from the tally bag). With those, a fully-authored 24v24 board is 675
characters and only a deliberately adversarial board — 288 hand-typed tallies, every one of 23
nameable things given a distinct 24-character name — exceeds 2,000.

**Primary recommendation:** Ship `v1~` as a synchronous, pure-ECMAScript positional codec with a name
table, split unit streams, an `!`-separated sub-field level, biased signed deltas, and a 4-character
FNV-1a checksum. Copy that string synchronously inside the gesture. Put the live character count next
to the copy button and let it tell the truth when a board is too large to post. Reserve `v2~` in the
version dispatch and ship nothing behind it.

---

## Project Constraints (from CLAUDE.md)

Treated with the same authority as locked decisions. Every one of these is already enforced
mechanically by `tests/selftest-node.cjs`, so a violation is a red run rather than a review note.

| Directive | Enforcement | Phase 4 consequence |
|---|---|---|
| Single self-contained HTML file, no build step, no dependencies | `FORBIDDEN` scan, `selftest-node.cjs:32-46` | No lz-string, no library of any kind |
| No network at runtime | `/https?:\/\//` scanned across the **whole document, comments included** | A comment may not write out an example URL |
| One classic `<script>`, no ES modules | `/type="module"/` | — |
| No `fetch` / `XMLHttpRequest` | `/fetch\(/`, `/XMLHttpRequest/` | — |
| No `eval` / `new Function` | `/\beval\s*\(/`, `/\bFunction\s*\(/` | A decoder may not build a parser dynamically |
| No markup-injection sink | `/innerHTML\|outerHTML\|insertAdjacentHTML\|document\s*\.\s*write/` | Decoded build-code text reaches the page through `textContent` or `.value` only |
| No `url(` anywhere, including CSS comments | `/url\(/` | `[C13]`'s styles must not contain the three characters `url(` |
| No verdict on a build (PROJ-06) | three-layer gate, Layers A/B/C | § Vocabulary Traps below |
| `navigator.clipboard.writeText` needs a user gesture (Chrome ≥107) | not mechanical — rehearsal only | The codec must be **synchronous** |
| Build state must round-trip through a URL | SHARE-05 | `location.hash`, mirrored, never presented as the share unit |

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SHARE-01 | Copy a compact build code to the clipboard | § Clipboard: the four tiers, measured; § The Synchronous Constraint |
| SHARE-02 | Paste a build code to load someone else's build | § The Codec, `decode` contract; § Ops |
| SHARE-03 | Round-trips exactly; malformed/wrong-version fails with a clear message | § Round-Trip Verification (6/6 exact); § Refusal Matrix (13/13 refused) |
| SHARE-04 | Stays well under Discord's 2,000 at realistic roster sizes | § The Measurement — 295 realistic, 675 fully authored, 2,984–3,186 adversarial |
| SHARE-05 | Mirrors to `location.hash` for reload/bookmark, not presented as sharing | § The Hash Mirror; § `App.hasFlag` and the comma |
| SHARE-06 | Reset to Workshop 16 defaults, behind a confirmation | § Reset and Undo — verified; § No Analog: the confirmation |
| SHARE-08 | Token appearance, names, student types and authored actions all round-trip | § The Build Slice, field by field; verified in scenarios B/E/H/I |

**SHARE-07 is Phase 5's** (`REQUIREMENTS.md:186`). Do not build a fight reset here.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| `encode(build) -> string`, `decode(string) -> result` | `[S04] SERIALIZE` | — | Banner at `:2564-2578` already binds it: `build` only, version prefix, checksum, `deps: App.data` |
| Version / alphabet / caps constants | `[S01] DATA` | — | Every `MAX_*` in the file is a named exported `[S01]` `var` with its arithmetic in the comment |
| Writing a decoded build into state | `[S05] OPS` | `[S03]` `commit` | A pasted code is a state transformation; `[S05]` is the only writer reachable from a student action |
| Resetting to defaults | `[S05] OPS` — **already exists** at `:3230` | — | No new op needed |
| `location.hash` mirror | `[S04]` `scheduleUrlSync` — **call sites already exist** at `:2416` and `:2453` | — | `[S03]`'s banner declares it a no-op "so that the commit() call site exists from the first day" |
| Reading a code at boot | `[S08] BOOT` | `[S05]` | `[S08]` owns the entry point and the error boundary |
| Share dialog paint | new `[S06.6]` on `SYNC_HOOKS` (`:5070`) | — | Every dialog in the file repaints through this seam |
| Share dialog presses | new `[S07.4]` via `UI_ACTS` / `UI_HANDLERS` / `LATE_BINDERS` (`:7271`, `:7304`) | — | The four seams exist precisely so `[S07.1]` needs no edit |
| Clipboard write and its fallbacks | `[S07.4]` | — | It is page work with a permission model; `[S05]` never touches the page |
| Styles | new `[C13]` | — | `.sh-` prefix, the fake scoping `[C07]` / `[C10]` / `[C12]` each explain |

---

## THE CENTRAL QUESTION, ANSWERED

### What was measured, and how

A complete reference codec — **`encode` and `decode`, both pure ECMAScript** — was written and
round-tripped against build slices produced by driving the *shipped* ops (`addUnit`, `setUnitMaxHp`,
`createTokenType`, `setTally`, `createAction`, `setActionCost/Req/Xf`, `renameAction`,
`renameTokenType`, `setTokenStyle`, `removeUnit`) inside the same bare `vm` sandbox
`tests/selftest-node.cjs` uses. No state was hand-written; every scenario is a board a student could
actually build.

Scratchpad: `C:\Users\alexy\AppData\Local\Temp\claude\C--Projects-GameDesignSkills-GameFeelDirectionCourse-CatsVsMech\6955a1c2-1679-4a99-be89-fd3975b5abb0\scratchpad\cm5.cjs`
(the round-tripping codec), `cm2.cjs` / `cm3.cjs` / `cm4.cjs` (the decomposition series),
`probe-hash.mjs` (the Chrome 151 `file://` probe).

### The numbers

| Scenario | Roster | **v1 code** | Round-trips exactly? | ≤512 target | <2,000 Discord |
|---|---|---|---|---|---|
| **A.** Shipped defaults, untouched | 9v3 | **45** | yes | ✅ | ✅ |
| **B.** Realistic student build — 12v5, one built-in renamed, one restyled, 2 authored token types (one unit-scope, one side-scope), 4 tallies, 3 authored actions with cost/req/xf, 1 shipped action renamed, 1 unit removed so ids are non-contiguous | 12v5 | **295** | yes | ✅ | ✅ |
| **D.** 24v24, every unit a distinct health/shield pair, nothing authored | 24v24 | **283** | yes | ✅ | ✅ |
| **E.** 24v24 + all 6 authored token types + a tally for every type on **every** unit + 6 authored actions, ordinary short names | 24v24 | **675** | yes | ❌ | ✅ |
| **H.** Ceiling — E, plus non-contiguous ids on both sides, two-digit values everywhere, and all 23 nameable things given **distinct 24-character ASCII** names | 24v24 | **2,984** | yes | ❌ | ❌ |
| **I.** Ceiling — H with **distinct 23-astral-emoji** names | 24v24 | **3,186** | yes | ❌ | ❌ |

`[VERIFIED: executed against cats-vs-mechs.html in a Node vm sandbox, encode+decode round trip asserted byte-for-byte on all six]`

**Scenario B, verbatim, 295 characters:**

```
v1~NVmlnb3Vy.RGFtYWdl.UG9pc29uIOKYoA.TW9tZW50dW0.UG91bmNl.TGljayB3b3VuZHM.QmVhbQ.T3ZlcmNsb2Nr~V0.0.0.0.0_3.3.3.8.1_C1.4.4.f.0.2_C2.5.1.7.1.3~Ac~5~6!2-6!0-a*3!0~5!2--5!1-9*~2!4~6!4~C1.4.1!2.0!2.1!0!2n-0!5!2s_C2.5.1!1..0!0!2t~B5~4~8!4-4*6!3~5!3-4*~~~4.6.1!1..1!0!2o_C1.7.1!1.2!1.0!2!2p-1!0!2m~w00g
```

### Where the characters go (measured decomposition)

| Cost centre | Scenario E | Scenario I (ceiling) | Note |
|---|---|---|---|
| Name table | 85 | 960 | 23 nameable things × up to 128 chars for a 23-emoji name |
| Vocabulary records | 77 | 127 | 11 token types, structure only |
| Unit health/shield stream | 248 | 252 | 48 units, run-length collapses nothing when every pair differs |
| Tally stream | 50 | 1,360 | **the single largest cost centre at the ceiling** |
| Unit id gaps | 0 | 86 | only paid when units have been removed |
| Action records | 184 | 418 | 12 actions × cost + 2 req + 2 xf |

### The two schema decisions that make this work, and what they are worth

These are not optimisations. Without them the same six scenarios measure 33 / 272 / 271 / 1,781 /
4,729 and the ceiling is 4,839 — which is 2.4× Discord's limit and beyond rescue without compression.

| Decision | What it does | Measured saving at the ceiling |
|---|---|---|
| **A name table.** Every distinct name is base64url-encoded **once** at the head of the code and referenced everywhere by a base36 index. | A student who names three actions the same thing pays for it once. | 4,729 → 3,186 for the emoji ceiling; **2,944 → 960** in the names column alone |
| **Split unit streams.** `(maxHp, shield)` and the tally bag are two *independently* run-length-encoded lists rather than one fused record. | 48 units with different health but the same six tallies collapse the tally stream to one run. Fusing them means one differing byte defeats both. | 1,104 → **50** in scenario E's tally column |

### The verdict

- **The ≤512 design target holds for the realistic build (295) and fails at the ceiling.** Restate
  the target honestly: 512 is a target for the board a student actually builds, not a guarantee.
- **Discord's 2,000-character hard limit holds for every plausible board** — including a full 24v24
  roster with all six authored token types, tallies on every unit, and six authored actions (675).
  It fails only for a board with 288 individually-typed tallies and 23 maximum-length distinct names.
- **`CompressionStream` should not ship in this phase.** Three independent reasons, in order of force:
  1. **It breaks SHARE-01.** `writeText` must be called synchronously in the gesture (CLAUDE.md,
     HIGH, MDN BCD Chrome 107). An `await` on a stream forfeits it. Every workaround —
     precompute-and-hope, background debounce — introduces a stale-code race on exactly the action
     the requirement is about.
  2. **It is invisible to CI.** `CompressionStream` is `undefined` in the harness sandbox
     (`[VERIFIED: vm.runInNewContext probe]`), so every assertion about it would sit below a
     `typeof` bracket — which `04-PATTERNS.md` § 13b establishes is documentation, not a gate.
  3. **It is not needed.** The synchronous fixes above already cover every plausible board.
- **Reserve the version dispatch anyway.** `decode` should read the prefix, compare against `'v1'`,
  and refuse anything else *by name* — so that `v2~` is a one-arm addition later rather than a
  schema break. Keep the prefix outside anything that could ever be compressed, as CLAUDE.md says.
- **Do not move `MAX_CUSTOM_TYPES`, `MAX_CUSTOM_ACTIONS`, `MAX_ACTION_REQ` or `MAX_ACTION_XF`.**
  `[S01]:1704-1714` invites the next plan to move a dial "against measured cost." The measurement
  says the dials are not the problem — the tally stream and the name lengths are, and both are
  addressed by schema rather than by taking a feature away from students.

**What to write back into `[S01]:1704-1714`.** That comment's arithmetic is now checkable and should
be replaced with the measured figures rather than left as a prediction nobody revisited. This is an
explicit obligation `04-PATTERNS.md` § No Analog Found escalated.

---

## The Build Slice, Field by Field

The codec encodes `state.build` and nothing else. `[S03]`'s banner (`:2325-2326`) is explicit:
*"`build` round-trips through the share code and the undo stack; `fight` is undo-only and never
shared; `ui` is in neither."*

**Six assertions already pin the build key set** as `['schema', 'cats', 'mechs', 'tokens']`. Adding a
key to `build` turns all six red. This is why the wire version belongs in the code string, not in
state.

```
build = {
  schema: 1,                                  // :1769 — the RECORD version
  cats:  { id, name, ap, units[], actions[], tally? },
  mechs: { id, name, ap, units[], actions[], tally? },
  tokens: { <tokenId>: { shape, color, glyph, name, scope? } }
}
```

| Path | Type | Student-writable? | Encode it? | Why |
|---|---|---|---|---|
| `build.schema` | int, always `1` | no | **no** | Static. The `v1~` prefix carries the wire version |
| `build[side].id` | `'cats'` / `'mechs'` | no | **no** | Positional — side A and side B |
| `build[side].name` | `'Cats'` / `'Mechs'` | **no** — there is no rename-faction op | **no** | Restore from `DEFAULTS` |
| `build[side].ap` | int 0..99 | yes (`setFactionAp`, `nudgeFactionAp`) | **yes** | |
| `build[side].units[].id` | `c1`..`c99` / `m1`..`m99` | indirectly, via add/remove | **yes**, as gaps only | `nextUnitId` (`:3104`) takes the largest suffix + 1, so ids are contiguous **until a removal**. Encode the position/suffix pairs that break the run |
| `build[side].units[].name` | `'Cat N'` / `'Mech N'` | **no** — there is no rename-unit op | **no** | Derived from the id suffix at `:3129` |
| `build[side].units[].maxHp` | int 0..99 | yes | **yes** | run-length stream 1 |
| `build[side].units[].shield` | int 0..99 | yes | **yes** | run-length stream 1 |
| `build[side].units[].tally` | sparse `{tokenId: int}`, **key absent when empty** | yes (`setTally`, `nudgeTally`) | **yes** | run-length stream 2. Sparse rules at `:4031-4036`: a tally of zero deletes its key, a bag with no keys deletes itself |
| `build[side].tally` | same, side-scope types | yes | **yes** | its own field |
| `build[side].actions[].id` | `slash`… or `x1`..`x99` | indirectly | **yes** | shipped = index into `ACTION_IDS` (`:1690`); authored = `C` + suffix |
| `build[side].actions[].name` | string, ≤24 code points | **yes**, shipped ones too (`renameAction`) | **yes**, name-table index; omit when unchanged | |
| `build[side].actions[].dmg` | int | **NO — no op writes it** | **no** | See the warning below |
| `build[side].actions[].keywords` | string[] | **NO — no op writes it** | **no** | See the warning below |
| `build[side].actions[].cost` | `[{tok, n}]`, cap 1 (`MAX_ACTION_COST = 1`, `:3831`) | yes | **yes** | |
| `build[side].actions[].req` | `[{tok, n}]`, cap 2 | yes | **yes** | |
| `build[side].actions[].xf` | `[{who, tok, d}]`, cap 2, `d` in ±99 and never 0 | yes | **yes** | bias `d` by `MAX_XF_DELTA` so no sign character is needed |
| `build.tokens[id].shape` | index into `SHAPES` (6) | yes | **yes** | |
| `build.tokens[id].color` | index into `COLORS` (7) | yes | **yes** | |
| `build.tokens[id].glyph` | index into `GLYPHS` (29) | yes | **yes** | |
| `build.tokens[id].name` | string, ≤24 code points | yes, built-ins too | **yes**, name-table index | |
| `build.tokens[id].scope` | `'unit'` / `'side'`, **custom types only** | at creation, never after (`:3474-3478`) | **yes** | Built-ins have no `scope` key |

> **⚠ `dmg` and `keywords` are not encoded, and that is a decision the plan must state out loud in
> the `[S04]` banner.** Grep confirms no op in `[S05]` writes either field — `dispatch` (`:4165`)
> has no arm for them and `createAction` (`:3651`) ships every authored action at `dmg: 0,
> keywords: []`. So they are reconstructible: shipped actions from `DEFAULTS`, authored ones from
> those constants. **The moment a later phase adds a `setActionDmg`, this becomes a silent data-loss
> bug in a codec nobody thought to revisit.** Two mitigations, both cheap, and the plan should take
> at least the first: (1) an `[S09.11]` row asserting that `dmg` and `keywords` on every action equal
> their reconstructed value for a board driven through every `[S05]` op, so a new writer turns the
> run red; (2) a `[S05] dispatch` must-not-grow grep in the idiom the file already uses for
> `openTokenPicker`.

---

## The Codec — a verified reference design

### Alphabet and separator budget

Measured in Chrome 151 from `file://`: **every ASCII punctuation character except space survives a
`location.hash` write/read verbatim**, including `~ - . _ @ , ! * ' ( ) $ + = : ; / ? % #`. Space
becomes `%20`; every non-ASCII code point is percent-encoded.
`[VERIFIED: Chrome 151, file://, Playwright 1.62.1]`

So the browser is **not** the constraint. Three other things are:

| Character | Status | Why |
|---|---|---|
| `,` | **FORBIDDEN** | `App.hasFlag` (`:1421-1428`) splits the hash on `,` and compares whole tokens. A comma in the code silently splits it into fragments. This is the single most important alphabet fact in the phase and it is not in CLAUDE.md |
| ` ` (space) | **FORBIDDEN** | becomes `%20` on write-back — the code would not survive its own mirror |
| `%` | **FORBIDDEN** | ambiguous against percent-encoding |
| `#` | avoid | legal inside a fragment but a second `#` in a pasted line is a paste hazard |
| `~ . _ - * !` | **the working set** | all verbatim, none in base64url except `-` and `_` |

**Recommended assignment** (used by the verified reference implementation):

| Level | Char | Used for |
|---|---|---|
| 0 | `~` | version, sections, side fields |
| 1 | `_` | record separator in a list of records (vocabulary, actions) |
| 2 | `.` | field separator inside a record; name-table separator |
| 3 | `-` | list separator inside a field; run separator |
| 4 | `!` | sub-field separator inside a list item |
| aux | `*` | run-length count marker |

> **Two grammar bugs were found and fixed during this research, and both are the same bug one level
> apart. State them in the plan so they are not rediscovered.** (1) An action record joined its
> fields with `.` while its term lists joined items with `.` too — splitting the record destroyed the
> terms. (2) The tally bag joined its items with `-`, and the tally bag lives *inside* a run-length
> stream whose runs are separated by `-` — so a bag defeated the run parser. **A separator may never
> appear in anything it delimits.** Both bugs decoded to a *wrong* build rather than an error, which
> is exactly the "loads garbage silently" failure SHARE-03 exists to prevent, and neither would have
> been caught by an encode-only size measurement.

### Grammar (verified)

```
code    = "v1" "~" body "~" ck4
body    = names "~" vocab "~" sideA "~" sideB
names   = "N" [ b64 *( "." b64 ) ]                     ; base64url of UTF-8, one per DISTINCT name
vocab   = "V" [ vrec *( "_" vrec ) ]
vrec    = builtinIx "." shapeIx "." colorIx "." glyphIx "." nameIx
        | "C" seq "." shapeIx "." colorIx "." glyphIx "." scopeIx "." nameIx
sideA   = "A" count "~" ap "~" stats "~" tallies "~" gaps "~" sideBag "~" actions
sideB   = "B" ... (identical)
stats   = rle( maxHp "!" shield )
tallies = rle( bag )                                   ; bag = "" | tokIx "!" n *( "." tokIx "!" n )
gaps    = [ index "!" suffix *( "-" index "!" suffix ) ]
sideBag = bag
actions = [ arec *( "_" arec ) ]
arec    = head "." [nameIx] "." costs "." reqs "." xfs
head    = shippedIx | "C" seq
costs   = [ tokIx "!" n ]
reqs    = [ tokIx "!" n *( "-" tokIx "!" n ) ]
xfs     = [ whoIx "!" tokIx "!" (d + 99) *( "-" ... ) ] ; BIASED — no sign character
rle(x)  = elem *( "-" elem ) ; elem = [ count "*" ] payload
ck4     = FNV-1a(body) -> base36, last 4 characters
```

All integers are **base36 lowercase**. Amounts are 0..99, so one or two characters.

**Only differences from `DEFAULTS` are written.** A token type identical to the shipped one emits
nothing; an action identical to its shipped record emits nothing. This is what makes the untouched
board 45 characters.

**Token ordinals must be built in a stable, derived order** — the five `TOKEN_IDS` first, then custom
ids sorted by numeric suffix. Do **not** use `Object.keys(build.tokens)` order: `[S01]:1516-1521`
explains that integer-like keys sort first, and the ids are `t1`..`t99` precisely so they cannot.
Deriving the order rather than trusting insertion order makes that reasoning load-bearing instead of
incidental.

**The three index-stability paragraphs become real in this phase.** `GLYPHS` (`:1596`),
`TOKEN_SCOPES` (`:1543`) and `XF_WHO` (`:1740`) each promise "entries may be APPENDED… never
reordered, never removed, without bumping the build code's schema version." `SHAPES` (`:1480`),
`COLORS` (`:1481`) and `ACTION_IDS` (`:1690`) are now encoded positionally too and **do not carry the
paragraph.** Add it to all three, and add an `[S09.11]` row asserting the first element of each — the
cheapest possible tripwire against a reorder that would silently load a different board from a link
shared last term.

### `decode` contract

`[S02]`'s banner (`:1939-1947`) forbids the model producing a string, and `[S04]` inherits the
posture through `deps: App.data`. So:

```js
decode(code) -> { ok: true,  build: {...} }
             |  { ok: false, why: 'shape' | 'version' | 'checksum' | 'content',
                  saw?: string, what?: string }
```

`why` is a **token, never a sentence.** The share dialog owns the words, exactly as `turnsText`
owns the projection's words while `turnsToWipe` returns a record. Four distinct refusals is the
minimum SHARE-03 needs — "corrupted", "truncated", "wrong version" and "not a build code" are four
different things a student can act on differently, and collapsing them into one message throws away
the only diagnosis the tool can give.

**`decode` must never throw into the void and must never touch state.** It is pure. The op that
consumes it decides whether to commit.

### Refusal matrix — measured, 13 of 13 refused

Each row below tampers the code body and then **recomputes the checksum**, so it reaches the content
guards rather than stopping at the digest. Every one was refused by the reference decoder.

| Tamper | Refused as |
|---|---|
| Wrong version prefix | `version` |
| Truncated (last 12 chars cut) | `checksum` |
| One character flipped | `checksum` |
| Empty string | `shape` |
| Arbitrary prose | `shape` |
| Glyph index past the end of `GLYPHS` | `content` — no such glyph |
| Shape index past the end of `SHAPES` | `content` — no such shape |
| A health value over `MAX_ALLOC` | `content` — out of bounds |
| A tally on a built-in token type | `content` — a built-in type carries no tally |
| A unit-scope type tallied on the side | `content` — that type is kept on each unit |
| A roster of zero units | `content` — roster out of bounds |
| A roster past `MAX_UNITS` | `content` — roster out of bounds |
| A run length that does not fill the roster | `content` — run length disagrees with the roster |
| Two units sharing an id | `content` — two units share an id |
| A name index naming nothing | `content` — no such name |
| A name over `MAX_TOKEN_NAME` | `content` — a name is out of bounds |
| A name carrying a control character | `content` — a name carries a character the board cannot show |

`[VERIFIED: executed]`

**The checksum is not a security boundary and the plan should say so in the banner.** A 4-character
FNV-1a digest catches truncation and transcription damage — the failures SHARE-03 names — and a
hostile author who recomputes it walks straight past. That is why every content guard above exists
*behind* the checksum rather than being replaced by it.

---

## Unicode — resolved concretely

CLAUDE.md flags a "Unicode caveat" and does not resolve it. Here is the resolution, measured.

### What can be in a name

`TOKEN_NAME_REFUSE = /[\p{Cc}\p{Cs}]/u` (`:1572`) refuses exactly two classes: control characters and
**lone surrogates**. Everything else is allowed — D-12 explicitly permits BMP symbols and emoji, and
`[S01]:1560-1566` says not to "fix" it back into an ASCII allowlist. The cap is
`MAX_TOKEN_NAME = 24` **code points**, counted with `Array.from` (`:2749`), and `clampTokenName`
(`:2775`) cuts on the code-point array so the keystroke path can never produce half a pair.

`requireName` (`:2738`) is shared by token types and actions, so both are held to the same rule.

### Measured encoding cost per name

| Name | Code points | UTF-16 units | UTF-8 bytes | **base64url** | `encodeURIComponent` |
|---|---|---|---|---|---|
| `Poison` | 6 | 6 | 6 | 8 | **6** |
| `Poison ☠` | 8 | 8 | 10 | **14** | 18 |
| `Vigueur élévée` | 14 | 14 | 17 | **23** | 31 |
| 24 × 💀 (the cap, all astral) | 24 | 48 | 96 | **128** | 288 |

`[VERIFIED: Chrome 151, file://]`

### The four traps, and what to do about each

1. **`encodeURIComponent` throws `URIError` on a lone surrogate.** Confirmed:
   `encodeURIComponent('A\uD83DB')` → `THROWS URIError`. `[S01]:1553-1558` predicted this exact
   failure. **Use base64url of UTF-8 instead** — it is 2.25× cheaper on emoji and cannot throw.
2. **`TextEncoder` silently substitutes U+FFFD** for a lone surrogate (measured:
   `65,239,191,189,66`), and so does `location.hash` (measured: `#A%EF%BF%BDB`). Both are *lossy
   without an error*, which is worse than throwing. A **hand-rolled UTF-8 encoder** encodes the lone
   surrogate reversibly (WTF-8) and round-trips it, which turns a silent corruption into a value the
   decoder's own `TOKEN_NAME_REFUSE` check can refuse by name.
3. **`btoa`, `atob`, `TextEncoder`, `TextDecoder`, `URL` and `CompressionStream` are all `undefined`
   in the Node gate's sandbox.** `[VERIFIED: vm.runInNewContext probe]` The section-3 sandbox is
   `{console, setTimeout, clearTimeout, queueMicrotask, requestAnimationFrame}` (`selftest-node.cjs:341-347`)
   and creates a fresh realm, so Node's own globals are absent. `encodeURIComponent` **is** present
   (it is an ECMAScript built-in, not a host global). **A codec built on `btoa` is untestable in CI
   without weakening the deliberately-bare sandbox. A hand-rolled UTF-8 + base64url pair is about 35
   lines and needs no harness change at all.** Take the 35 lines.
4. **`length` vs code points, in the decoder.** The decoded name must be re-checked with
   `Array.from(n).length > MAX_TOKEN_NAME`, not `n.length` — a 24-emoji name is 48 UTF-16 units and a
   naive check would reject a legal name. The reference decoder does this and scenario I round-trips.

### The rule the plan must adopt

**`decode` re-runs the name boundary on every decoded name.** `TOKEN_NAME_REFUSE`, the trim, the
non-empty test and the code-point cap. The write-path guards at `:2738` protect names a student
types; they do not protect names that arrive out of somebody else's pasted code. `[S01]`'s own
comment on the term-list shape says this in the general case — *"From Phase 4 a term arrives out of
somebody else's pasted build code, so this is the shape that has to hold under a hostile value"* —
and the same sentence applies to every name.

### Where hostile text can and cannot go

- **A name is never a key.** Token ids come from `nextTokenTypeId` (`:2793`), action ids from
  `nextActionId`, and both are `'t'/'x' + digits`. A decoded name of `__proto__` is a harmless
  display string. This is the whole reason D-13 says an id is never derived from student text, and
  the codec must preserve it: **rebuild ids from the encoded sequence number, never from anything
  name-shaped.**
- **A term is a record carrying `tok` as a field**, never an object keyed by a token id
  (`[S01]:1636-1650`). The decoder must build terms the same way — field by field, `Array.find` over
  `tok` — for the reason that comment gives at length.
- **Decoded text reaches the page through `textContent` or `.value` only.** `[S08]`'s panel comment
  (`:9399-9401`) already names this: *"from Phase 4 it carries decoded build-code content (threat
  T-01-02)."* The `FORBIDDEN` scan enforces it mechanically.

---

## The Hash Mirror (SHARE-05)

### What already exists

| Call site | Line | Calls `scheduleUrlSync`? |
|---|---|---|
| `commit(label, mutator)` | `:2416`, inside `try` with `invalidate()` in `finally` | **yes** |
| `undo()` | `:2453`, same shape | **yes** |
| `commitUi(label, mutator)` | `:2426` | **no, deliberately** — D-09 |
| `restore(snapshotJson)` | `:2534` | **no** — `[S09]`-only |

**A `scheduleUrlSync` that throws must be survivable.** The `finally` at `:2412-2420` exists so a
sync failure cannot cost the frame; its own comment says why. Debounce and wrap.

### What the browser does

- `history.replaceState(null, '', '#' + code)` round-trips a 3,203-character hash **identically**.
  `[VERIFIED: Chrome 151, file://]` CLAUDE.md's 500,000-character figure stands; the hash is not a
  constraint at any size this codec produces.
- Prefer `history.replaceState` over `location.hash =` for the mirror: no history entry per commit,
  no `hashchange` fired at your own listener.
- **But `history` does not exist in the Node stub.** `selftest-node.cjs:1211` supplies
  `location: { hash: '' }` and nothing else — no `history`, no `reload`. Two options, and the plan
  must choose one explicitly: grow the stub with a `history.replaceState` that writes
  `location.hash` (three lines, keeps the gate able to drive and read the mirror), or write through
  `location.hash` and accept a history entry per debounced commit. **Grow the stub** — the mirror is
  the one part of SHARE-05 the gate can actually assert, and `04-PATTERNS.md` § 13b's rule is that
  anything which must fail the build belongs in the interaction gate.

### The token format

`App.hasFlag` (`:1414-1431`) splits the hash on `,` and compares whole tokens by exact equality. So
the hash must remain a comma-separated token list and `#selftest` must keep working alongside a build
code. Two shapes are available:

- `#b=v1~...` — a named token, so `hasFlag('selftest')` is unaffected and `#selftest,b=v1~...` works.
- `#v1~...` — bare. Also works (the code contains no comma), but a bare token makes the reader in
  `[S08]` guess whether an unknown token is a code or a flag.

**Recommend the named token.** It costs two characters and makes the boot reader a prefix test rather
than a guess.

### `[S00]`'s banner becomes false and must be amended

`:1410-1411` asserts *"hasFlag() is the only place hash text is read anywhere in this file."* Phase 4
adds a second reader. `04-PATTERNS.md` flags this; it is worth repeating because a banner that
quietly lies is exactly what `[S03]`'s own banner warns against at `:2308-2310`.

### Reading a code at boot

`boot.start()` (`:9532`) has no hash-reading step today. It must gain one, and **before**
`App.state.invalidate({structural: true})` at `:9591`, inside the existing `try`.

**One decision the plan must take rather than inherit:** loading from the hash at boot through
`commit()` puts one undo entry on the stack, so Ctrl+Z on a freshly-opened shared link rewinds to the
shipped 9v3 board. That is arguably a feature ("undo takes me back to the workshop board") and
arguably a surprise. There is no third option that keeps the state contract — `restore()` is
`[S09]`-only and named as such in `[S03]`'s banner, and reaching for it here would break the
single-writer rule the whole file is built on. **Recommend committing, and saying so in a comment.**

### Never present the address bar as sharing

SHARE-05 and `REQUIREMENTS.md:127` are explicit: a `file://` URL *"leaks the student's real name via
their home directory path, doesn't work for the recipient, and Discord won't linkify it."* The share
dialog offers **the code**. The hash is a reload/bookmark convenience and nothing in the UI may point
at it.

---

## Clipboard (SHARE-01)

### The synchronous constraint — the design driver

CLAUDE.md, HIGH confidence, from MDN BCD: **from Chrome 107, `writeText` must be called inside a
user-gesture handler.** Confirmed again this session: `permissions.query({name:'clipboard-write'})`
returns `"granted"` on `file://` in Chrome 151. `[VERIFIED: Chrome 151, file://]`

**Therefore the code string must be producible synchronously.** This is the requirement that decides
against `CompressionStream`, not the size measurement. Encode, then write, with no `await` between
the click and the write.

### The four tiers

`grep -c "clipboard\|writeText\|execCommand\|navigator\." cats-vs-mechs.html` reads **0**. Nothing in
this artifact has ever called a platform API with a permission model. This is genuinely new ground.

| Tier | Mechanism | Availability | Toast must say |
|---|---|---|---|
| 1 | `navigator.clipboard.writeText(code)` inside the click handler | granted on `file://` in Chrome 151 / Edge 151 | "Copied" |
| 2 | `document.execCommand('copy')` over a selected field | deprecated, returns `true` everywhere measured | "Copied" |
| 3 | A visible, selectable field with the code **already selected**, plus a line saying to press Ctrl+C | always | "Select-all is done — press Ctrl+C" |
| 4 | Blob URL + `<a download>` | works on `file://`; only worth building if a board exceeds the message limit | "Saved as a file" |

**SHARE criterion 1 requires tier 3 to be a real surface, not a fallback that appears on failure** —
*"When the browser blocks the clipboard API, a selectable field appears with the code already
highlighted."* Build the field always and select into it; tiers 1 and 2 are then enhancements on top
of a surface that already works.

**Branch the toast on the tier that actually succeeded.** CLAUDE.md names the optimistic "Copied!"
toast as a specific anti-pattern: a silent clipboard failure makes a student paste stale content into
Discord and debug your tool instead of their build.

> ⚠ **Tier 4 and the `FORBIDDEN` scan.** `URL.createObjectURL(` does not match `/url\(/` (no `i`
> flag), so it is technically legal. That is a coincidence, not a design. If tier 4 ships, the plan
> should say in a comment that the spelling is load-bearing against a case-sensitive scan.

---

## Reset and Undo (SHARE-06, success criterion 4)

### Verified: the shipped machinery already satisfies criterion 4

Driven in a Node sandbox against the live artifact:

```
undo depth before reset : 4
undo depth after reset  : 5   (+1 — exactly one entry)
reset produced defaults : true
ONE Ctrl+Z restores the whole build byte-for-byte : true
fight slice after reset : null
```
`[VERIFIED: executed]`

`resetToDefaults` (`:3230`) is `commitStructural('reset to defaults', …)`, which is
`App.state.commit` plus a structural invalidate. Its comment at `:3218-3219` already promises this:
*"One commit, therefore one undo entry (D-12). The undo stack is never cleared here: a mis-clicked
reset has to be recoverable."* **No change to the op is needed.**

### Two measured facts the plan should know

1. **Two resets inside `COALESCE_MS` (500ms) produce one undo entry, not two.** Harmless — the state
   is identical either way — but if a plan ever adds a second, different commit beside the reset, the
   coalescing window is where it will go wrong.
2. **After `UNDO_LIMIT` (30) further commits, the reset entry falls off the stack and the pre-reset
   build is unrecoverable.** `[VERIFIED: executed]` This is what makes the confirmation dialog
   load-bearing rather than ceremonial, and it is the argument to put in the comment that overrules
   the file's own no-confirmation precedent.

### The precedent this phase knowingly overrules

Nothing in the repo asks a student to confirm anything, and two ops **decline** a confirmation *in
writing*: `removeTokenType` (`:3529-3534`) — *"There is no confirmation dialog here, on purpose
(D-17)… one Ctrl+Z brings the type and every number back together (D-16), and a modal would cost an
instructor a click mid-demo to guard against something undo already covers"* — and `removeAction`,
which follows it. `#err-reset` (`:9391`) fires `resetToDefaults()` on a single click today.

**SHARE-06 is the later, explicit requirement and it wins.** But the difference is real and should be
argued rather than asserted: removing one token type is one op away from recovery *and stays
recoverable*; a reset discards the entire board and its recovery expires after thirty commits. The
file's own precedent for overruling itself is `clampTokenName` (`:2769-2775`), which opens *"the one
technique in this phase with no precedent anywhere else in the file"* and then explains itself at
length. Do that.

**`#err-reset` should be left alone.** It fires from a state where memory may be untrustworthy and
D-15 promises one-click recovery. Putting a modal in front of it would make recovery two clicks in
the one situation where it must be one — and `fail()` already calls `closeModals()` (`:9426`)
precisely because a modal over the panel made recovery zero clicks.

---

## Dialogs — what a new one must register

Phase 2.1 and 3.1 shipped two dialogs and a bidirectional gate around them. A third must arrive with
**all five of these in the same change**, or the run fails in one direction or the other.

| # | Artefact | Where | Failure if omitted |
|---|---|---|---|
| 1 | `id="..."` on the `<dialog>` and every static child | `cats-vs-mechs.html` shell, sibling of `#app`, after `#act-edit` | — |
| 2 | Every one of those ids in `KNOWN_IDS` | `selftest-node.cjs:453+` | section 5b fails: *"shell ids not in KNOWN_IDS"* |
| 3 | A matching stub node built in `makeStubDom()` | same file, a few lines below | section 5b fails in the other direction |
| 4 | An entry in `DIALOG_ROOTS` with its opener act | `selftest-node.cjs:4408` | **check 47b fails** — bidirectional |
| 5 | The opener act in `UI_ACTS` **and** a handler in `UI_HANDLERS` | `cats-vs-mechs.html:7271`, `:7280` | `47b` opens it via `showModal()` instead of the real handler, so a dead opener passes |

Plus three more that are not gated but are established idiom:

| Artefact | Line | Why |
|---|---|---|
| `SYNC_HOOKS.push(syncShare)` | `:5070`, pushed at `:5662` / `:5974` / `:6127` / `:7187` | The dialog repaints on every frame while open |
| `LATE_BINDERS.push(bindShare)` | `:7304`, pushed at `:8333` | Its delegated root lives outside `#app` |
| A `cancel` listener through `App.boot.wrap` | `:8325`, `:9027`, `:9287` | Esc is a close *request*; both shipped dialogs handle it explicitly, and both note the stub cannot exercise it |

### Focus restoration

Both shipped dialogs restore focus to a **constant selector** on close (`:7988-8000`, `:8530`),
because `<dialog>` only restores the element that held focus when the modal opened — and a student
who reached the button with a pointer was never focused on it. Copy the pattern; a rehearsal already
signed it off once.

### Static markup for anything that holds typed text

The share dialog's paste field must be **static shell markup, not built by the renderer.** The reason
is written twice already (`:1012-1015`, `:7072`): the dialog repaints on every frame while open, and
a field rebuilt mid-typing loses half-typed text. A static node can simply be skipped while it holds
focus.

### One dialog or two?

`#act-edit` is one dialog with two panes and the shell comment at `:1099-1112` gives the three costs
that decided it: one button, one binder, one root, one fingerprint, and twenty shell ids instead of
forty. **All three transfer.** But a reset confirmation is not a pane of a share surface — it is a
different act with a different opener, and Phase 5 will want the reset control on the topbar beside
share. This is a scope call for `/gsd:discuss-phase`, not a research finding. The arithmetic:
73 shell ids today; a share dialog is roughly 10–12 more; a separate confirm dialog is 4–5 more.

### Current gate floors — every one of these must be re-measured

| Floor | Value | Where | Rule |
|---|---|---|---|
| `SUITE_FLOOR` | 760, actual **789** | `selftest-node.cjs:397` | Re-measure, move it, add a line to the history |
| `#app` harvest | floor 117, actual **127** | `:4536` | Only moves if the board grows |
| `DIALOG_FLOOR` | 134, actual **144** across 2 roots | `:4599` | **"one surface's worth below the new total"** — a third root moves this |
| `PICKER_FLOOR` | 84 | `:4607` | One-root arithmetic; unaffected |
| proposal-pane floor | 23, actual 60 | — | Unaffected |
| stub-drift | **73 shell ids** | `:1195` | Grows by every new id |
| interaction gate | **117 checks** | — | — |

`[VERIFIED: node tests/selftest-node.cjs, exit 0]`

---

## Vocabulary Traps (PROJ-06)

The three-layer no-verdict gate will fail the build for ordinary Phase-4 English. `04-PATTERNS.md`
§ 0.3 measured this against the live word lists; the results are reproduced here because they are the
single most likely way this phase turns red for a reason that has nothing to do with sharing.

**Layer A scans the whole document — comments and CSS included.** `/rating/i` and `/counter/i` are
unanchored substring matches.

| Ordinary word | Fails on | Layer |
|---|---|---|
| `generating`, `operating`, `separating`, `integrating` | `rating` | **A — whole document** |
| `counter`, `encounter` | `counter` | **A** |
| `balance`, `rebalance` | `balanc` | **A** |
| `underscore` | `score` | **B — string literals** |
| `upgrade`, `downgrade`, `degraded` | `grade` | **B** |
| `lead`, `frank`, `wins` | `\blead\b`, `rank`, `\bwins\b` | **B** |

**Measured clean:** `share`, `build code`, `copy`, `copied`, `paste`, `load`, `reset`, `confirm`,
`discard`, `start over`, `Workshop 16 defaults`, `clipboard`, `address bar`, `link`, `characters`,
`character count`, `counting`, `truncated`, `incomplete`, `version`, `schema`, `restore`,
`overwrite`, `replace`, `bookmark`, `reload`, `shorter`, `longer`, `fits`, `budget`, `limit`,
`window`.

Two concrete rules for this phase:

- Never write **"generating a build code."** Write *producing*, *writing*, *building*.
- Never label the character readout a **"character counter."** Write *"characters"* or
  *"length"*. `[S05]` already avoids the noun for its id sequences — `nextUnitId` (`:3104`) and
  `nextTokenTypeId` (`:2793`) both say *"scan every id already in use, take the largest suffix and
  add one"* and never name the thing a counter.

And one more this phase walks into that 3.1 did not: the character count must be a **fact**, never a
judgement. *"295 characters"* is bookkeeping. *"A good length for Discord"* is a verdict on a
student's build and would be a scope violation as well as a red run.

---

## Testing — what is Node-testable and what is irreducibly human

The roadmap demands a **2 browsers × 3 focus states × forced-Tier-3** matrix. The Node harness reaches
**none** of it. Here is the honest split.

### Node-testable, and therefore mandatory in `tests/selftest-node.cjs`

`04-PATTERNS.md` § 13b establishes the rule: an assertion behind `typeof document === 'undefined'`
does not run in CI. **A codec is state work**, so `[S09.11]` can sit entirely above any bracket and
every row runs. That makes this phase unusually lucky.

| Assertion | Where |
|---|---|
| `encode → decode` is exact on the shipped board | `[S09.11]`, above the bracket |
| …and on a board driven through **every** `[S05]` op (the six scenarios above are the template) | `[S09.11]` |
| The code contains no `,`, no space, no `%` — assert against a **character-class allowlist**, not a blocklist | `[S09.11]` |
| A wrong version prefix is refused as `version` | `[S09.11]` |
| A truncated code is refused as `checksum` | `[S09.11]` |
| A one-character flip is refused as `checksum` | `[S09.11]` |
| Every row of the § Refusal Matrix, with the checksum **recomputed** so it reaches the content guards | `[S09.11]` |
| A refused code leaves state **byte-identical** | `[S09.11]` |
| `GLYPHS[0] === ''`, `TOKEN_SCOPES[0] === 'unit'`, `XF_WHO[0] === 'caster'`, `SHAPES[0] === 'sq'`, `COLORS[0] === 'green'`, `TOKEN_IDS[0] === 'hp'`, `ACTION_IDS[0] === 'slash'` — the reorder tripwire | `[S09.11]` |
| A decoded name is re-checked against `TOKEN_NAME_REFUSE` and the code-point cap | `[S09.11]` |
| An emoji name and a name with a BMP symbol both round-trip | `[S09.11]` |
| The size budget: the shipped board encodes under N characters; a driven 24v24 fully-authored board encodes under M | `[S09.11]` — **write the measured numbers in, so a schema regression is loud** |
| `dmg` / `keywords` equal their reconstructed values after a round trip | `[S09.11]` — the data-loss tripwire |
| The hash mirror: drive a real op, read `location.hash` back | **interaction gate** — never grep `[S04]` for the assignment (Phase 3's WR-01) |
| Reset adds exactly one undo entry; one undo restores the build | `[S09.11]` |
| The share dialog opens, paints, and is harvested by Layer C | interaction gate, via `DIALOG_ROOTS` |
| The confirm dialog refuses nothing until confirmed — a cancel leaves state untouched | interaction gate |

### Irreducibly human — belongs in a blocking `checkpoint:human-verify` plan

Every prior phase ended in one (02-03, 02.1-06, 03-04, 03.1-08). Expect the same, and expect it to be
larger, because this is the first phase whose core mechanism has **no representation in the harness at
all** — the clipboard is not merely unrendered, it is absent from the runtime.

| # | Item | Why no automation can reach it |
|---|---|---|
| 1 | Tier 1 copy in Chrome, window focused | `navigator` does not exist in the sandbox |
| 2 | Tier 1 copy in a second browser (Firefox or Edge) | CLAUDE.md: Firefox clipboard on `file://` is **LOW confidence, designed around** |
| 3 | Copy with **DevTools focused** | Document focus is a browser state |
| 4 | Copy with the window **backgrounded** | Same |
| 5 | **Forced Tier 3** — block the clipboard API and confirm the selectable field appears with the code already selected | Requires deliberate API sabotage in a live page |
| 6 | The toast names the tier that actually succeeded | The failure is silent by construction |
| 7 | Paste a code produced in browser A into browser B, both directions, and diff the board | Cross-browser by definition |
| 8 | Paste a hand-truncated code and read the message | The *wording* is the thing under test |
| 9 | Reload and reopen a bookmark; the build comes back | Requires a real navigation |
| 10 | The reset confirmation on a projector: is the destructive control visually apart from the non-destructive ones? | UX-05, a legibility judgement |
| 11 | Ctrl+Z after a confirmed reset, performed by a person | The measured proof exists; the *felt* behaviour has not been rehearsed |
| 12 | The character readout is legible from the back of a room and reads as a fact | UX-02 |

**Items 1–7 are the roadmap's matrix.** Write them as numbered rehearsal steps naming which tier each
exercises, exactly as `03.1-08` numbered its items — and note that `03.1-08`'s summary flags "a
one-word blanket approval" as the record's weakest line. This checkpoint needs per-item answers.

> One honest caveat about the browser evidence in this document: everything marked
> `[VERIFIED: Chrome 151]` was executed through **Playwright with `channel: 'chrome'`** — a real
> installed Chrome, headed, from `file://`. It is not a Firefox or Safari claim, and CLAUDE.md's
> gaps section stands: the Firefox binary could not be launched in this environment.

---

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---|---|---|---|
| Modal semantics, backdrop, Esc, top layer | A focus trap | `<dialog>` + `showModal()` | Baseline widely available 2022-03; two are already shipped and both carry the idiom |
| The commit → undo → hash-sync → render chain | A second write path for a pasted build | `App.state.commit` via a new `[S05]` op | The `finally` at `:2412-2420` is the reason the page can never fall behind state |
| Undo after reset | A pre-reset snapshot of your own | Nothing — `resetToDefaults` already does it | Verified: one entry, one Ctrl+Z, byte-identical |
| Frame coalescing for the mirror | A `setTimeout` chain | `App.state.invalidate` / the existing debounce shape | rAF-coalesced already |
| Error surfacing on a decode failure | A `console.error` or a `throw` | `App.boot.wrap` + the styled panel, or a message the dialog owns | Every listener in the file goes through `wrap` |
| Structural rebuild after a load | Manual DOM patching | `commitStructural` | A loaded build changes `units.length`; a sync-only frame leaves orphan cards — the exact bug `:3221-3228` records |
| Value bounds on decoded numbers | A fresh clamp | `[S05]`'s `int()` and `App.data.MAX_ALLOC` | *"everything a pasted build code supplies — comes through here"* (`:2600`-ish) |

| Problem | **Do** hand-roll | Why |
|---|---|---|
| UTF-8 → bytes, bytes → base64url | ~35 lines of pure ECMAScript | `btoa` / `TextEncoder` are `undefined` in the gate's sandbox, and `TextEncoder` silently substitutes U+FFFD for a lone surrogate |
| Checksum | FNV-1a → base36, 6 lines, synchronous | `crypto.subtle.digest` is async and absent from the sandbox; CLAUDE.md already recommends FNV-1a |

---

## Common Pitfalls

### 1. A separator that appears inside what it delimits
**What goes wrong:** the code decodes to a *different valid build* rather than failing.
**Found this session, twice, one nesting level apart** — `.` used for both record fields and term
items; `-` used for both run-length runs and tally-bag items.
**Avoid:** assign one character per nesting level (§ Alphabet), and assert it — for every scenario,
`code.split(SEP_N)` must produce the expected arity.
**Warning sign:** an encode-only test passes while the round trip is never run.

### 2. Measuring encode without decode
**What goes wrong:** a size figure describes a string nothing can read back. Both grammar bugs above
were invisible to size measurement and immediately visible to a round trip.
**Avoid:** every size assertion in `[S09.11]` runs against a code that has just round-tripped.

### 3. `Object.keys` order as the wire order
**What goes wrong:** a build whose token vocabulary happens to enumerate differently encodes ordinals
that mean different types on the other side.
**Avoid:** derive the order — `TOKEN_IDS` then customs sorted by numeric suffix. `[S01]:1516-1521`
explains the integer-key hazard the `t`/`x` prefixes exist to close.

### 4. The comma
**What goes wrong:** `App.hasFlag` splits the hash on `,` (`:1424`). A comma anywhere in the code
silently fragments it, and `#selftest` stops working next to a shared build.
**Avoid:** an allowlist assertion on the produced alphabet, not a blocklist.

### 5. Percent-encoding round-trip loss
**What goes wrong:** a space or any non-ASCII character in the code becomes `%20` / `%F0%9F...` on
write-back, so the code read out of the hash is not the code written into it.
**Avoid:** the alphabet allowlist covers this too.

### 6. `encodeURIComponent` on a lone surrogate
**What goes wrong:** `URIError`, thrown at share time, a long way from the name that caused it.
`[S01]:1553-1558` predicted it; this session confirmed it.
**Avoid:** base64url over hand-rolled UTF-8. The write-path guard (`TOKEN_NAME_REFUSE`) makes it
unreachable from a typed name; the decoder's re-check makes it unreachable from a pasted one.

### 7. Trusting the write-path guards on decoded data
**What goes wrong:** every `[S05]` guard protects values a *handler* supplies. A pasted code
bypasses all of them.
**Avoid:** `decode` re-runs every bound — `MAX_ALLOC`, `MAX_UNITS`, `MIN_UNITS`, `MAX_CUSTOM_TYPES`,
`MAX_CUSTOM_ACTIONS`, `MAX_ACTION_COST/REQ/XF`, `MIN_XF_DELTA`/`MAX_XF_DELTA`, the name cap,
`TOKEN_NAME_REFUSE`, scope agreement, id uniqueness. All seventeen were exercised.

### 8. An optimistic "Copied!" toast
**What goes wrong:** a silent clipboard failure sends a student to Discord with stale content.
**Avoid:** branch the toast on the tier that succeeded. Named as an anti-pattern in CLAUDE.md.

### 9. A decode failure that mutates anything
**What goes wrong:** a half-applied build — the worst possible outcome for SHARE-03.
**Avoid:** `decode` is pure and returns a record; the op commits only on `ok === true`. Every guard
outside the commit, in the idiom `createTokenType` (`:3445-3447`) and `setActionCost` (`:3952`) both
state — with the one documented exception those two also carry, which needs the detached copy.

### 10. Growing `build` with a key
**What goes wrong:** six assertions go red at once.
**Avoid:** the wire version lives in the code string. `build.schema` is the record version and stays 1.

### 11. Assuming `dmg` and `keywords` stay unwritten
**What goes wrong:** the day a `setActionDmg` ships, every shared build silently loses it.
**Avoid:** the reconstruction assertion in `[S09.11]`. § The Build Slice.

### 12. `[S04]` reaching for `App.state`
**What goes wrong:** the banner's `deps: App.data` becomes a lie.
**Avoid:** `encode` takes the build slice as an argument. `[S02]`'s banner is the template.

---

## Environment Availability

| Dependency | Required by | Available | Version | Fallback |
|---|---|---|---|---|
| Node.js | the gate | ✓ | v24.15.0 | — |
| Chrome (real, headed) | the rehearsal, and this research | ✓ | 151 | — |
| Playwright | optional dev probe | ✓ (sibling scratchpad, not in repo) | 1.62.1 | — |
| Firefox | rehearsal item 2 | ✗ | — | **Use Edge as the second browser.** Edge 151 is measured working. CLAUDE.md's Firefox gap stands |
| `navigator.clipboard` in the gate | — | ✗ | — | Rehearsal only, by design |
| `btoa` / `TextEncoder` / `CompressionStream` in the gate sandbox | — | ✗ | — | **Hand-roll.** This is a recommendation, not a workaround |
| `history` in the Node stub | asserting the hash mirror | ✗ | — | Grow the stub, or write through `location.hash` |
| Runtime dependencies of the artifact | — | **none, and none may be added** | — | — |

---

## Open Questions

1. **One dialog with two panes, or two dialogs?**
   - Known: `#act-edit`'s comment (`:1099-1112`) gives three costs that all transfer; 73 shell ids
     today; share ≈ 10–12 more ids, a separate confirm ≈ 4–5.
   - Unclear: whether Phase 5's topbar wants reset as its own control beside share.
   - Recommendation: `/gsd:discuss-phase`. Research has no basis to decide it.

2. **Should the boot-time hash load create an undo entry?**
   - Known: committing creates one; `restore()` is `[S09]`-only and named as such in `[S03]`'s banner,
     so there is no third option that keeps the state contract.
   - Recommendation: commit, and write the consequence into the comment. Flag for the developer.

3. **Does the character readout need an explicit over-budget message, and what does it say?**
   - Known: the ceiling is 2,984–3,186 and Discord's limit is 2,000; criterion 2 already requires the
     count to be visible.
   - Unclear: whether a board that large is worth building tier 4 (file download) for.
   - Recommendation: ship the honest count and a factual line at the threshold; defer tier 4 unless
     the developer wants it. **Not a verdict** — see § Vocabulary Traps.

4. **Discord's 2,000-character limit is MEDIUM confidence.** CLAUDE.md sourced it from two mutually
   consistent secondary sources, not from Discord's own documentation. Nothing in this phase's design
   depends on the exact number — the realistic build is 295 — but the *threshold message* would.

5. **`[S00]`'s "only place hash text is read" banner** must be amended. Trivial, but it is the kind of
   sentence that survives three phases unnoticed.

---

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|---|---|---|
| A1 | Discord's free-tier message limit is 2,000 characters | The Measurement | Only affects the threshold copy; the realistic build is 295 either way. **MEDIUM** — CLAUDE.md's own confidence |
| A2 | Firefox and Safari behave like Chrome for `location.hash` verbatim round-tripping | The Hash Mirror | A percent-encoding difference would break the mirror in that browser. Mitigated: the alphabet is RFC-3986-legal throughout, and the mirror is not the share unit. **Rehearsal item 7 covers it** |
| A3 | No future phase adds a writer for `action.dmg` or `action.keywords` | The Build Slice | Silent data loss. **Mitigation specified** — a `[S09.11]` reconstruction row |
| A4 | A student will not hand-type 288 individual tallies | The Measurement | The ceiling (2,984+) exceeds Discord's limit. Mitigated by the on-screen character count telling the truth |
| A5 | `<dialog>` `cancel`-event behaviour matches the two shipped dialogs | Dialogs | Both shipped dialogs note the stub cannot exercise it; this is a rehearsal item there too |

Everything else in this document is tagged `[VERIFIED]` and was executed this session.

---

## Sources

### Primary (HIGH confidence — executed this session)
- `cats-vs-mechs.html` (14,564 lines), read at every line cited above.
- `tests/selftest-node.cjs` (5,891 lines) — `FORBIDDEN`, `VERDICT_WORDS`, `VERDICT_LITERAL_WORDS`,
  `KNOWN_IDS`, `makeStubDom`, `DIALOG_ROOTS`, the floors, both sandboxes. Run: **789 passed, 0 failed;
  117 of 117 interaction-gate checks; exit 0.**
- **Reference codec**, `scratchpad/cm5.cjs` — encode + decode, round-tripped exactly on six scenarios
  built by driving the shipped ops; 13 hostile decode probes with recomputed checksums, all refused.
- **Decomposition series**, `scratchpad/cm2.cjs` / `cm3.cjs` / `cm4.cjs` — per-cost-centre character
  attribution, and the before/after for the name table and split unit streams.
- **Undo probe**, `scratchpad/undo-probe.cjs` — reset produces exactly one undo entry; one Ctrl+Z
  restores byte-for-byte; the entry falls off after `UNDO_LIMIT` further commits.
- **Sandbox capability probe** — `btoa`, `atob`, `TextEncoder`, `TextDecoder`, `URL`,
  `CompressionStream` all `undefined`; `encodeURIComponent` present.
- **Chrome 151 `file://` probe**, `scratchpad/probe-hash.mjs`, Playwright 1.62.1,
  `channel: 'chrome'` — the 23-character hash round-trip matrix; `history.replaceState` at 3,203
  characters; four name-encoding cost measurements; lone-surrogate behaviour across
  `encodeURIComponent` / `TextEncoder` / hand-rolled UTF-8 / `location.hash`;
  `CompressionStream('deflate-raw')` output **byte-identical to Node's `zlib.deflateRawSync`** (53
  bytes both) — which is what makes the deflate figures in this document trustworthy;
  `permissions.query('clipboard-write') === "granted"`.
- `./CLAUDE.md` — the `file://` capability matrix, the clipboard gesture rule, the four-tier fallback,
  the encoding size comparison, the `v<N>~` prefix rule.
- `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`,
  `.planning/phases/04-share-reset/04-PATTERNS.md`,
  `.planning/phases/03.1-action-authoring-inserted/03.1-01-SUMMARY.md` and `03.1-06-SUMMARY.md`.

### Secondary (MEDIUM)
- Discord's 2,000-character message limit — inherited from CLAUDE.md, which sourced two mutually
  consistent secondary sources rather than Discord's own documentation.

### Not consulted
No web search or Context7 lookup was performed. The domain is entirely internal — the codec's inputs
are this file's own constants and its output is constrained by this file's own `hasFlag`. CLAUDE.md
already carries the external browser research at HIGH confidence, and this session re-executed the
parts Phase 4 depends on rather than citing them.

---

## Metadata

**Confidence breakdown:**
- Size measurements: **HIGH** — produced by an encoder whose output was decoded back to a byte-identical build on all six scenarios
- Build-slice inventory: **HIGH** — read field by field against `[S01]` `DEFAULTS` and every `[S05]` write path, cross-checked against `dispatch`
- Alphabet and separator constraints: **HIGH** — `hasFlag` read directly; hash behaviour executed in Chrome 151
- Unicode: **HIGH** — every claim executed, including the two silent-substitution paths
- Reset/undo: **HIGH** — driven against the live artifact
- Dialog registration requirements: **HIGH** — read from the gate that enforces them
- Node-vs-human test split: **HIGH** — sandbox capabilities measured, not assumed
- Firefox/Safari behaviour: **LOW, and designed around** — no binary available; every dependent path has a fallback and a rehearsal item

**Research date:** 2026-08-28
**Valid until:** 30 days for the browser findings. **Invalidated immediately** by any change to
`[S01]`'s allowlists, any new `[S05]` write path into `build`, or any change to `App.hasFlag`'s
separator.
