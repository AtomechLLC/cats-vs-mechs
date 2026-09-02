# One rehearsal session, four phases of debt

**Assembled 2026-08-29. Cut down by machine on 2026-08-29 and again on 2026-09-02.**

**READ THIS FIRST — THE LIST IS NOW FOUR ITEMS AND A DEVTOOLS CELL.**

The premise this document was written on — *"a check that no automated instrument in this repo can
reach"* — was true of the instruments the repo had and false of the browser it turned out to have.
Real Chrome and real Edge drive `cats-vs-mechs.html` from `file://` headless. Two passes have now
taken everything that was mechanical:

| pass | what it closed |
|---|---|
| **2026-08-29** | section **C** — the clipboard tiers (22 rows), all but the DevTools-focused cell |
| **2026-09-02** | **A2, A3, A4, A5, A8** (2.1 checks 2, 3, 4, 6, 9), **B1**, **B2**, **D1**, and A1 — which was already fixed and had never been confirmed from the page side |

**WHAT IS LEFT FOR A PERSON — four items and one cell.** Each one is here because a machine
*cannot* answer it, not because nobody has got round to it:

| | item | why no instrument closes it |
|---|---|---|
| **A6** | 2.1 check 7 — does a refusal read like a sentence? | wording judgement. The four sentences are quoted in the UAT file |
| **A7 / E1** | 2.1 check 5 + Phase 3 check 3 — the projector | viewing distance. No instrument has one |
| **B3** | the whole page above the live board, in a room | "does it read as structure or as repetition" |
| **D2** | the reset confirmation's words | wording judgement. Quoted verbatim in the UAT file |
| **C, cell 3/4** | Copy with **DevTools focused** | CDP attaches *as* the DevTools target; it cannot focus *into* the panel |
| *(9.7)* | Chrome's autoscroll circle over an armed ramp | browser chrome, drawn outside the page |

Results are recorded in the per-phase UAT files (linked per section) so `/gsd:progress` and
`/gsd:audit-uat` see them.

**Setup:** open `cats-vs-mechs.html` by **double-clicking it**. Do not serve it — `file://` is the
shipped condition and several of these checks are about `file://` specifically. Have Chrome and Edge
both available; two items need a second browser.

**Before you start**, confirm the gate is green so you're operating a known-good build:

```bash
node tests/selftest-node.cjs
```

Expect **`1336 passed, 0 failed`**, exit 0, interaction gate **`216 of 216`**, stub-drift
**160 shell ids**. *(This line read "1051 passed / 146 of 146" until 2026-09-02; those numbers were
already three phases stale and are corrected here rather than left to be read as a red gate.)*

**The optional browser harness**, if you want the machine half re-run before you start:

```bash
PLAYWRIGHT_DIR=<an install> node tests/browser-checks.mjs
```

It skips cleanly with exit 0 when Playwright is absent, which is the normal state of a fresh
checkout.

---

## A. Sitting at the laptop — was 8 items, **one left, and it is A6**

**CLOSED BY MACHINE 2026-09-02** — 104 rows, 0 failed, real Chrome and real Edge from `file://`.
Probe `.planning/phases/05-fight-loop-playtest/rehearsal-closer-probes/p4-token-authoring.mjs`, readings regenerated into `p4-result.json` on each run, results
written into `.planning/phases/02.1-token-authoring-inserted/02.1-HUMAN-UAT.md` per check.

### ~~A1. Raise a tally by hand~~ — **CLOSED. F-02.1-B works, and this is the confirmation.**
The item said: *"no human has confirmed the fix from the other side of the screen."* Nothing human
was needed. After `New type on each unit` → `Done`, **24 `nudgeTally` buttons and 12 tally fields
are on the board and ALL 36 ARE REACHABLE** — each with a real box at a real coordinate — and Cat 1
and Cat 2 were taken to a tally of 2 each **by four real mouse clicks**, in both browsers. F-02.1-A
is dead. **ALLOC-11's blocker is gone.**

### ~~A2. A zero tally collapses its line and takes no space~~ — **CLOSED.**
12 `.brd-line--opt` lines, **0 of them occupying any box**; the twelve card heights and `#board`
byte-identical to before the type existed. (The page grows 82px — that is `#roundrules` gaining the
new type as a round rule, D-35. Recorded so it is not re-investigated.)

### ~~A3. Escape inside the name field~~ — **CLOSED.**
Escape in the field reverts to `Health` **and leaves the dialog open**; Escape on a swatch closes it
and returns focus to **Tokens**. Phase 2's low-confidence `activeElement === BODY` nit is now a
high-confidence measurement — it is `BODY`, and it was not the test pane.

### ~~A4. `maxlength` behaves on a real input~~ — **CLOSED.**
30 typed characters → **24**. 30 pasted astral skulls through the system clipboard → **12 whole
emoji / 24 UTF-16 units / 0 lone surrogates**. Driven past `maxlength`, the op's code-point cap
lands on **24 whole emoji**. No error panel on any path.

### ~~A5. A rename reaches everywhere, and undo reaches back~~ — **CLOSED, with one finding.**
`Health` → `Vigor` reaches the list row, the heading and **all 16 board labels**; the **Damage**
rename reaches all 6 of its own. **The finding:** Ctrl+Z with the caret in the field does not run
the *app's* undo — but it does run the *browser's* native `<input>` undo, and the following blur
**commits the rewound text as a fresh rename**. The check's note says the keystroke "should do
nothing"; it does not. Raised as **G-02.1-D**. Not fixed — that pass was read-only.

### **A6. A refusal reads like a sentence *(2.1, check 7)* — STILL YOURS.**
The mechanics are closed: three spaces + Enter is refused and the field reverts; a blur reverts
**quietly, no panel**; `Remove this type` is `disabled` on all five built-ins. The words are read
off the screen and quoted so you can judge them without opening the file:

> **A token type needs a name. — the last good state is still on screen.**

**Does that read like a sentence to a student, or like a stack trace?** That is the whole of A6.
*(Recorded while there: raising that panel **closes the picker**. That is `[S08]`'s documented rule
— a modal `<dialog>` sits in the top layer and would paint the recovery panel behind its own
backdrop, and D-15 says recovery stays one click. Not a defect.)*

### ~~A7. The end-to-end story~~ — **CLOSED, end to end, with no console anywhere.**
Invent → name `Poison ☠` → shape, colour, emoji → **Done** → **raise Cat 1 and Cat 2 by hand** →
read the board → **Remove**, no confirmation dialog (D-17), no error panel → **one Ctrl+Z** brings
the type, its name, its appearance and both tallies back together (D-16).
*(The projector half of 2.1's check 5 is a different question and is folded into **E1**.)*

### ~~A8. Nothing regressed from Phase 2~~ — **CLOSED, 9.1 through 9.9**, including the three that
had no cover anywhere: a real **middle-click** on a stepper changes no value and arms no ramp; a
**physically held Enter** on Undo — 1 keydown plus **30 `autoRepeat: true` keydowns** through CDP —
fires **one** undo against three distinct history entries, and so does held Space and held Ctrl+Z;
and a **tally** stepper inherits 9.1 through 9.4 identically.
*(Learned on the way, and it changes how "one undo entry" reads: this artifact **coalesces every
nudge of the same control into one history entry**. Twenty clicks on one plus is one entry. Three
clicks on three different pluses is three.)*
*(Still open, and permanently machine-unreachable: whether **Chrome's autoscroll circle** appears
over the board. It is browser chrome drawn outside the page.)*

The full scripts remain in the 2.1 UAT file, each with its original NOT-RUN outcome kept verbatim
beside the 2026-09-02 measurement.

---

## B. Glyphs, wrapping and stickiness — was 3 items, **B1 and B2 are CLOSED; B3 is the room's**

### ~~B1. Glyph rendering and wrapping in the strip and reference band~~ — **CLOSED BY MACHINE 2026-09-02.**
128 rows, 0 failed, Chrome and Edge, 1920×1080 and 1366×768. Probe
`.planning/phases/05-fight-loop-playtest/rehearsal-closer-probes/p1-glyphs-and-wrap.mjs`.

Advance width alone cannot answer "is this tofu" — a font may give notdef the same advance as a real
glyph. So each character was **rasterised at 96px in the strip's own computed font and the ink read
back**, against **U+0378 and U+0380 — both permanently unassigned**, which therefore draw the notdef
box. The instrument check is that those two produce an identical signature (they do: 1573 ink px,
box 48×67).

| | ink px | ink box | advance @18px |
|---|---|---|---|
| `≈` | 1013 | 49×36 | 12.516 |
| `÷` | 630 | 47×50 | 12.498 |
| `–` en dash | 400 | **50×8** | **9.000** |
| `−` minus (the steppers') | 368 | 46×8 | 12.498 |
| `-` hyphen | 216 | **27×8** | **7.233** |
| notdef | 1573 | 48×67 | 11.619 |

**None of the three matches notdef.** The range on screen is `≈4–6 turns to wipe Cats` with U+2013 —
verified in the DOM, and no `\d-\d` anywhere in the strip — and the en dash draws **50px of ink
against the hyphen's 27**. Screenshot read back by eye as well, and committed:
`.planning/phases/05-fight-loop-playtest/rehearsal-closer-probes/shots/glyphs-chrome@1920x1080.png`.

**Wrapping:** `#strip` `scrollWidth 318 / clientWidth 318`; every line `282/282`; no `nowrap`, no
ellipsis; a deliberately over-long arithmetic line takes **2 line boxes** and still does not
overflow. `#refband` `1598/1598` and `1320/1320`. Every figure identical in both browsers.

### ~~B2. The strip stays sticky when the window is short~~ — **CLOSED BY MACHINE 2026-09-02.**
280 rows, 0 failed, Chrome and Edge, **ten window heights** (1080 / 900 / 768 / 700 / 600 / 575 /
574 / 573 / 500 / 400), five scroll offsets each, both views. Probe
`.planning/phases/05-fight-loop-playtest/rehearsal-closer-probes/p2-sticky-short-window.mjs`.

`#strip` is 510px tall and pins at the bar's foot — **64px, to the pixel** — at every mid-scroll
offset at every one of the ten heights, with every ancestor at `overflow: visible` and no
containing-block-maker anywhere. **All six projection figures stay wholly on screen while pinned,
down to a 400px window.** The named failure — content taller than the room — is a pure threshold and
it was bisected: it fits down to a **574px-tall window** and is 1px short at 573. No workshop laptop
is near it.

**Two readings worth keeping.** (1) At the document's *final* scroll position the sticky releases at
the end of its containing block `#board` — CSS spec, not a defect — and on a 768-tall window that
takes **2 of 6 figures** off the top (`Cats`, `≈9 turns to wipe Mechs`); 3 of 6 at 700; all 6 at 600
and below. Recorded as **G-03-A**. (2) In the fight view the projection is `position: fixed` with
`--topbar-foot` republished on scroll, so its **top rises and it grows** as the bar leaves while its
**bottom does not move** — measured 192 → 130 → 78 with the bottom pinned at 386. Designed, not
drifting; the first draft of the probe scored it as a failure and the CSS banner corrected the
probe.

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

---

**AND THEN D-27 DISSOLVED THE PROBLEM STRUCTURALLY. Re-measured by plan 05-16, 2026-08-29, in real
Chrome AND real Edge at both sizes, on the surface that ships.**

The fight is a **tab** now (plan 05-12), so the page no longer pays the fight regions' height and
the board's height at the same time. The board is not below anything.

| | Chrome 1920×1080 | Edge 1920×1080 | Chrome 1366×768 | Edge 1366×768 |
|---|---|---|---|---|
| `#board` top, before the tab | 844 | 844 | 730 | 730 |
| `#board` top, **after the tab** | **301** | **301** | **293** | **293** |
| `#views` / `.fg-band` / `#board` left | 152 / 152 / 152 | 152 / 152 / 152 | 14 / 14 / 14 | 14 / 14 / 14 |
| the same three, width | 1600 | 1600 | 1322 | 1322 |
| `#refband` box, both views | 1600×120 | 1600×120 | 1322×120 | 1322×120 |
| the grid's own box (`.fg-sides`) | 415→696 of 1080 | 415→696 of 1080 | 407→607 of 768 | 407→607 of 768 |

`#strip` still reports `position: sticky` with **every** ancestor at `overflow: visible` in both
views, and it never leaves the top of the window at any scroll offset the page can reach.

**WHAT THE TAB DID NOT FIX, and this is the whole of what B3 still is:**
- **The projection starts below the fold in the FIGHT view at 1366×768.** Measured: `#strip`'s top
  reads **787 of 768** in Chrome and **608** in Edge at that size — the two browsers land on
  different starting scroll positions, which is itself the finding, and in both it comes into view
  on any scroll. At 1920×1080 it reads 690. PROJ-05 asks for the projection to be readable during a
  fight; on a 768-tall screen that costs one scroll. **Is that acceptable in a room, or does the
  projection need to move above the fight?**
- **At 24 a side the battlefield clusters are tall** — measured 884px for the Cats and 1779px for
  the Mechs, inside a `.fg-sides` box that is 281px at 1080 and 200px at 768 and scrolls on itself.
  So a full-size board's battlefield is mostly *below* the scroll line. **Does that read as "there
  is more here" or as "half the battle is missing"?**
- **The grid at 24 a side is 72 buttons a side, 144 on the page.** The arithmetic holds and the box
  stays inside the viewport at both sizes. Whether a person can *find one row* in it from the back
  of a room is the question, and it is limitations entry 34.
- **The tab traded a scroll for a switch.** Anything you want to see at once that is now on two tabs
  — a hand ruling and the picker row for the same unit is the case to try — is 05-11's item 14.
- **The per-action reference cards are not on the fight tab at all.** They live inside the roster
  columns and the fight view hides those. `deferred-items.md` item 4, and 05-11's item 29.
- The two questions the side-by-side arrangement raised — the ledger in a narrower column, and the
  newest round scrolling at 768 — **still stand**, because the band's internal arrangement did not
  change. A past round is still taller and still scrolls at 768.

---

#### D-28 REPLACED THE BAND'S INTERNAL ARRANGEMENT, AND THESE FIGURES SUPERSEDE THE TABLE ABOVE

The developer, at the real artifact: *"this is way too compressed - let the fight take the whole
width. earlier rounds should be a full lane above showing the past state and acctions selected. The
predictor turn off, and make it toggled sidebar / pop over"*. Re-measured with **three rounds
resolved and twelve declarations a round**, real Chrome and real Edge, and **every number below is
byte-identical in the two browsers**:

| reading | @1920x1080 | @1366x768 |
|---|---|---|
| `#fightbar` width against the band's | 1600 / 1600 | 1322 / 1322 |
| `#ledger` width, and its bottom against the bar's top | 1600, 417 → 435 | 1322, 409 → 427 |
| the lane's box, and one card | 1174x242, card 340x238 | 968x149, card 340x115 |
| the lane with five rounds, scrollWidth/clientWidth, scrollLeft/max | 1752/1174, 578/578 | 1752/968, 784/784 |
| **Advance, from the top of the document** | **656 of 1080** | **556 of 768** |
| the grid's own box (`.fg-sides`), three rounds in the lane | 714→1060 of 1080 | 614→860 of 768 |
| battlefield / team resources / picker rows, tops | 326 / 555 / 603 | 225 / 455 / 503 |
| the projection sidebar when opened | 1531,121 360x779 `fixed` | 977,113 360x641 `fixed` |
| the Cats and Mechs battlefield clusters, lefts | 173 / 953 | 35 / 676 |

**WHAT ONLY THE ROOM CAN ANSWER, re-written for the tab as it now is:**

- **The lane is 22vh of card at 1080 and 15vh at 768, and it sits between the switch and the round
  being played.** Three rounds fit without scrolling at 1920; at 1366 the lane scrolls sideways and
  is left at its end, so the round that just resolved is the one on screen. **Does a horizontal
  history read as history, or does a room look for it underneath?** And **does a card that has to
  be scrolled to read the whole of a round get read at all?**
- **The grid's window is 346px at 1080 and 246px at 768, over a column whose content is 1171px and
  1603px.** That is the developer's own "way too compressed" complaint, and the dial moved once for
  it (26vh → 32vh) with the whole sweep at the rule. **Is a third of a column at a time enough, or
  does the picker want the lane's space?**
- **At 1366x768 the grid's box ends 92px below the fold.** It begins on screen and one page scroll
  brings the whole of it in. **Does a laptop user find the bottom of the column?**
- **The projection is now OFF until pressed for.** It opens as a 360px fixed sidebar against the
  right edge, under the control bar, and it carries the live figures. PROJ-05's "readable without
  navigating away" is being served by one press, on the developer's own call. **Does a room
  remember the projection is there? Does anybody press it during a fight?** — and the mirror
  question: **is a fight tab without the projection on it calmer, which is what the request was
  actually about?**
- **The reference cards are still not on the fight tab** (`deferred-items.md` item 4). The new
  toggled sidebar is now an obvious home for them and that option is recorded there.
- **FIGHT-10's notice (`#fight-said`) is now BELOW the two round controls rather than above them**,
  because the controls moved onto the round's own line. **Is it still read before an Advance?**
- The two questions the side-by-side arrangement raised are **retired**: there is no narrow ledger
  column any more, and a past round no longer scrolls the page — it scrolls its own card.

#### D-29 CHANGED WHAT IS *IN* THE LANE AND ON THE BUTTONS, AND NOT WHERE ANYTHING SITS

The developer, at the real artifact, with a screenshot of the lane attached: *"show this using the
symbols, rather than text"*; *"instead of showing cost in 1 Action Points, show it as - then the
symbol for the action points. Same with the cost of other skills."*; *"mouse over tooltip for the
text description"*. **Every geometry figure in the table above is unchanged** — nothing moved, and
the D-28 cells that measure it were re-run in both browsers at both sizes and are green. What
changed is the notation inside the boxes:

| reading | @1920x1080 | @1366x768 |
|---|---|---|
| a lane card, window over content | 238px over 1174px | **115px over 1174px** |
| a driven hover on a lane reading, and what it says | 42x12, 3 tokens 12x12 → *"Cat 1 — Health 3."* | same |
| a symbolic reading's tokens | 12x12 | 12x12 |
| a compacted count's font size | 18px | 18px |
| a picker cost: sign box / token box | 13x18 / 12x12 | 13x18 / 12x12 |
| readings in the lane at three rounds, none spilling its card | 240 / 0 | 240 / 0 |

**WHAT ONLY THE ROOM CAN ANSWER ABOUT IT:**

- **A card is read WITHOUT hovering, from a seat.** The words that named each quantity are on the
  hover now. **Does a green square read as health across a room? Does a student's own invented
  type read as theirs?** This is the trade the change makes and it is 05-11 item 50.
- **`Slash − ▲` against `Slash 1 Action Points`.** **Is the symbol faster, or a puzzle the first
  time?** And: **on a row of three buttons, can you tell at a glance which action is dear?**
  05-11 item 51. *(Amended by D-30: the `−` is drawn ON the triangle now rather than in front of
  it, and the tooltip reads "Removes: 1 Action Points". The question is unchanged; the reading it
  is about is one line down.)*
- **A card at 1366x768 is a 115px window over 1174px of content**, so not one symbolic reading in
  it is reachable without scrolling the card. That is D-28's bound rather than D-29's notation —
  the card has been a scroller since the lane turned sideways — but it is measured here for the
  first time and it is what 05-11 item 17 is asking about.
- **A native tooltip is drawn by the operating system and no automation can read it.** What was
  driven is that a real mouse, at the centre of a real reading's box, lands on that reading and
  that the browser has the sentence to show. **Whether a tooltip appears fast enough to be useful
  mid-demo is a room question**, and so is whether an instructor at a projector can hover at all.

#### D-30 MOVED THE MINUS ONTO THE SHAPE AND MADE IT RED

The developer, fourth round, verbatim: *"make the - for removing a resource red and make it appear
in the top-left corner (25% from the top, center aligned to the left edge) of the symbol/shape -
rather than a normal dash"*. **The geometry is followed to the letter and measured, so nothing
below is a question about whether it is where it was asked to be.**

| reading | @1920x1080 | @1366x768 |
|---|---|---|
| the mark's centre, x, from the shape's left edge | **0.00px** | 0.00px |
| the mark's centre, y, as a fraction of the shape's height | **0.2500** | 0.2500 |
| the mark's own box, on a 12x12 shape | 13x18 | 13x18 |
| marks drawn on a 3-round, 3-a-side fight (lane / picker) | **126 (90 / 36)** | 126 (90 / 36) |
| of those: off a shape / off the geometry / clipped by a scroller | **0 / 0 / 0** | 0 / 0 / 0 |
| closest any mark comes to the edge of the box that clips it | 27.6px | 27.6px |
| the mark's colour, on every one of the 126 | **rgb(255,109,120)** | rgb(255,109,120) |
| a lane card, window over content *(D-29's 1174 → 1172)* | 238px over 1172px | 115px over 1172px |

Real Chrome and real Edge agree to the digit on every figure above. The red is
`color-mix(in hsl, var(--accent-2), var(--coral))` — the two warm colours already in the palette,
mixed in a polar space so the hue walks the short arc through red rather than averaging into the
salmon between them. **No new hex was written**, and moving `--accent-2` at runtime moves the mark
with it, which is how that is checked rather than asserted.

**WHAT ONLY THE ROOM CAN ANSWER ABOUT IT:**

- **One mark on the first token, not one per token.** A cost of three action points is one red mark
  and three triangles. **Does that read as "three, being taken away", or as "one taken away, and
  three of them"?** This is the single arrangement decision inside the developer's sentence and it
  is 05-11 item 53.
- **The mark against a coral shape.** A student may style their own type any palette colour,
  including the coral the mark is mixed from. Half the mark hangs on the dark background by
  construction and that is what should carry it. **From a seat, is it still obviously a mark?**
- **The compact form.** A quantity of zero draws `0×` and one token, with the mark on the token —
  so at a glance the mark sits between the `×` and the square. **Does it read as belonging to the
  square, or as punctuation?** Recorded here because a screenshot at 4x looked fine and a room at
  eight metres is a different instrument.
- **A requirement line carries NO mark**, deliberately — nothing is subtracted by a requirement.
  **Is the absence legible as a distinction, or does it read as an inconsistency?**

#### D-31 CUT THE ROUND IN TWO, AND THE CUT COST SOMETHING AT 1366x768

The developer, fifth round, verbatim: *"separate the current round state from the action input
area"*. The round is two bordered, headed panels now — **Where the round stands** (the round
number, both survivor readings, both battlefields, both teams' resources) above **What you are
about to do** (the picker rows, both reading boxes, Advance and Reset on that panel's own heading
line). Cats left, Mechs right, inside both.

| reading | @1920x1080 | @1366x768 |
|---|---|---|
| the state panel's box | 494–819 | 547–803 |
| the input panel's box | 831–1265 | 815–1149 |
| the gap between the two, and their borders | 12px, 1px each | 12px, 1px each |
| the panels' background against `#fightbar`'s | `rgb(31,37,48)` vs `rgb(25,29,38)` | same |
| both panel headings, computed size | 18px | 18px |
| the state panel's window, over 364px of content | 238px | **169px** |
| the input panel's window, over 1010px of content | 346px | 246px |
| **Advance, bottom edge, 3 rounds in the lane** | **1057 of 1080** | **948 of 768** |
| Advance and the picker rows, together, at the offset a room declares from | 390–437 and 502–942 | 177–224 and 289–729 |

Real Chrome and real Edge agree to the digit on every figure. The spoken-for reading in the state
panel moves on a **real click** on an action button in the input panel and comes back on a second
click — driven in both browsers rather than argued for.

**THE ONE THING THAT GOT WORSE, STATED FIRST.** At 1366x768 the Advance control is **below the fold
when the round opens**, and that is measured rather than missed: with the state panel's window set
to ZERO the control still lands at 777 on a 768px screen, because the chrome alone — the region
heading, two panel borders, two paddings, two head lines and 47px of button — does not fit. No dial
reaches it. What holds at both sizes instead is that Advance sits at the **top** of the panel whose
rows a student declares in, so the scroll that brings the picker into view brings the button with
it, and it is above the rows rather than below them. Browser cell 18 was turned in the open and cell
18c is the new claim.

**WHAT ONLY THE ROOM CAN ANSWER ABOUT IT:**

- **Does reaching Advance on a laptop feel like scrolling to a control you lost, or like the button
  being where your hands already are?** 05-11 item 55. The alternative is measured and one line: a
  `min(22vh, calc(100vh - 710px))` clamp puts Advance at 757 of 768, at the price of a state panel
  58px tall — a faction name and half a reading.
- **Is the spoken-for reading in the right panel?** It is a reading of state, so it sits with the
  resources; it is also the reading a student consults *while declaring*, which happens in the other
  panel. 05-11 item 54.
- **Two headings, four columns, two faction names each.** The side's name is drawn at the head of
  both its columns, because a column with no name is a column a room cannot read. **From a seat,
  does that read as structure or as repetition?**

→ `.planning/phases/05-fight-loop-playtest/05-HUMAN-UAT.md`

### ~~C1. Clipboard tiers 1 and 2 actually fire~~ *(Phase 4)* — **CLOSED BY MACHINE 2026-08-29, except cell 3 and cell 4.**

**The two DevTools-focused cells are HUMAN-ONLY and permanently so.** Recorded here on 2026-09-02 so
nobody spends another pass trying: CDP attaches the automation client *as* a DevTools target;
`Input.dispatchKeyEvent` and every focus primitive address the inspected page's render frame.
Nothing in the protocol moves OS focus into a DevTools panel and holds it there while a click lands
on the page beneath, and headless has no DevTools window at all. Those two cells need a person, a
real window, F12, focus clicked into the panel, and a press on Copy.

<details><summary>the original C1, kept because the matrix is the script for the two cells that are left</summary>


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
**Answered `no` in the six cells the machine reached, on 2026-08-29.**

~~Also, while you're here: copy in Chrome, load in Edge…~~ — **closed by machine 2026-08-29: the
cross-browser round trip is byte-identical in both directions.**

</details>

→ `.planning/phases/04-share-reset/04-HUMAN-UAT.md`

---

## D. Two things to watch for, not press — **D1 is CLOSED; D2 is yours**

### ~~D1. No flash of the shipped board before a linked build renders~~ — **CLOSED BY MACHINE 2026-09-02.**
16 rows, 0 failed, Chrome and Edge, **8 fresh loads of a hash-carrying URL per browser**. Probe
`.planning/phases/05-fight-loop-playtest/rehearsal-closer-probes/p3-boot-flash.mjs`.

The item's premise — *"every automated reading is taken after the frame flushes"* — was true of
every instrument the repo had. Two new ones do better, and the **second bounds first paint
causally**:

**An init script at document-start** records the board's signature at **every MutationObserver
microtask checkpoint, every animation frame and every task boundary**, timestamped, beside every
`PerformanceObserver` paint entry. A frame can only paint a state that survived to a checkpoint or a
task boundary — anything built and replaced inside one task is never painted. In all 16 loads the
timeline reads **two entries**: empty, then the linked build.

```
chrome   0v0 @20.5ms   ->   1v1 @96.1ms      first-contentful-paint = 256ms
msedge   0v0 @32.6ms   ->   1v1 @409.1ms     first-contentful-paint = 452ms
```

The linked roster is in the DOM **160ms before first paint in Chrome and 43ms before it in Edge**.
The shipped 9-vs-3 roster is **never constructed at all**.

**CDP `Page.startScreencast` corroborates by pixels** — every captured frame classified against
references of both boards: the linked board recognised in **8/8 loads in both browsers, zero frames
showing the shipped board**. Its limit is stated rather than glossed: screencast frames come from
the compositor and can be coalesced, so it can *prove* a flash and cannot alone *disprove* one —
which is why the timeline carries the verdict. **Both instruments carry a positive control**: loaded
with no hash, the classifier must call a frame DEFAULT and the timeline must record 9-vs-3. Both do.

**Still held by a code comment: the ordering itself.** This is a measurement, not a regression
guard. Re-running the probe takes about ninety seconds.

### **D2. The reset confirmation's words *(Phase 4)* — STILL YOURS.**
The mechanism is now driven end to end rather than asserted: **Cancel costs nothing**; **Discard and
start over** really returns the shipped defaults; **one Ctrl+Z restores the board exactly**
(4/4/4 → reset → 4/4/4), both browsers. And the words have finally been read by something:

> **Reset to Workshop 16 defaults**
>
> This puts both rosters, both action lists and every token type back to the Workshop 16 defaults.
> One Ctrl+Z brings your board back — but only for the next thirty changes, after which it is gone.
> Copy your build code first if you want to keep it.
>
> `[ Cancel ]  [ Discard and start over ]`

18px / 26.1px line-height / `rgb(164,173,190)`, in a 470×130 box, not clipped. A regex can prove the
word "thirty" is there and that the paragraph is non-comparative. **It cannot prove the sentence
lands, and it cannot tell you whether the Ctrl+Z afterwards felt like recovery.** That is D2.

---

## E. The projector — 1 item, and it needs the actual room. **2.1's check 5 folds into it.**

### E1. Legibility from classroom distance *(Phase 3, Phase 2.1 check 5, and everything since)*
Put it on the actual workshop display and stand back. Can you read the `≈9 turns to wipe Mechs` /
`≈3 turns to wipe Cats` contrast — the phase's own worked teaching example — and the "What beats what"
band, without zooming or narrating the numbers aloud?

CLAUDE.md is blunt about this one: *"No amount of research substitutes for putting the artifact on the
actual workshop display before the session."*

**What was measured on 2026-09-02, so the room starts from numbers rather than from nothing** (real
Chrome, 1920×1080):

| reading | measured |
|---|---|
| the turns line | **24px / weight 700 / `rgb(232,235,242)`** on the strip's `rgb(25,29,38)`, line-height 38.4px |
| the "What beats what" band head | **20px / `rgb(164,173,190)`** |
| clipping, either panel | none |
| the token size `--tok` | **22px**, unchanged since Phase 2 |
| the eleven-row picker at the cap | dialog **660×860 inside a 1366×900 window**; the list **scrolls** (`overflow-y: auto`) rather than clipping |
| **the selected picker row, same row on and off** | **a `solid 2px rgb(92,200,255)` outline and a `✓` that switches `visibility`** — font weight and text colour are **identical** either way |

That last row is the one to take to the room: **selection is carried by a 2px outline and a tick,
and by nothing heavier.** Also bring 2.1's check 5 with you — put six invented types on the board so
the list is eleven rows — and **write down the display and the viewing distance**, because Phase 2's
G-02-B and Phase 2.1's G-02.1-B are both still open for want of exactly those two numbers.

---

## What is deliberately NOT on this list

- **The phase 5 deferred items.** `05-fight-loop-playtest/deferred-items.md` was re-read on
  2026-09-02 for anything newly machine-closable. **Nothing was.** Every item still open there (1,
  3, 4, 6, 7, 8, 9, 11–16) is already measured in numbers and what remains open in each is a design
  or a room judgement owned by the 05-11 playtest — *does a horizontal history read as history*,
  *is a third of a column at a time enough*, *does reaching Advance on a laptop feel like scrolling
  to a control you lost*. Item 12 is a test-harness matter and this pass was read-only on `tests/`.
- **Phase 2's UAT is complete** — 5 of 5 passed on 2026-08-27.
- **Phase 3.1's rehearsal was closed** by approval on 2026-08-29. Two of its acceptance criteria asked
  for prose and got a blanket answer; that is recorded in `03.1-08-SUMMARY.md` rather than re-opened
  here, since the checkpoint did run.
- **Phase 5's playtest** is not debt — it is a scheduled activity that hasn't happened yet, because
  Phase 5 hasn't been built.

---

## Honest note on how this list came to exist, and on what happened to it

Every item here was raised by an agent that could have marked it green and moved on. The pattern that
produced it is worth keeping: when a claim could only be supported by a run the harness cannot perform,
the phase recorded the gap instead of the guess. Four phases of that discipline is why this list was 14
items and not zero — and why the 14 were trustworthy as a list of what is genuinely unknown.

**And then most of them turned out to be reachable, which is the second half of the lesson.** The
list's founding sentence was *"no automated instrument in this repo can reach"*. That was a claim
about the instruments, not about the checks — and once a real browser was pointed at `file://`, ten
of the fourteen fell in two passes. The discipline that kept them honestly open is the same
discipline that made them cheap to close: each one stated its expected outcome precisely enough to
be driven.

**What survived is the residue that was never about instruments at all** — four items and two cells,
every one of them a question about a person: does a sentence read like a sentence, can a room read a
number, does a control feel like it is where your hands are. Those do not get closed by a better
harness, and the two passes that emptied the rest are the evidence that the remaining four are the
real ones.
