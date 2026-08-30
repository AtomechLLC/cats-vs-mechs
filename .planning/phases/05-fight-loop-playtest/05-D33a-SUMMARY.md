---
phase: 05-fight-loop-playtest
plan: D33a
subsystem: style
tags: [d-33, audit-pass-a, p1-8, p3-3, p3-6, c00, c16, state-palette, motion, scroll-affordance, prefers-reduced-motion, no-new-hex]

requires:
  - phase: 05-fight-loop-playtest
    plan: D33
    provides: "the audit itself — Pass A's finding list (P1-8, P3-3, P3-6) and its zero-gate-cost claim"
  - phase: 05-fight-loop-playtest
    plan: D30
    provides: "--accent-2 as the removal-badge channel, which is where 'lit as a target' now lives"
  - phase: 05-fight-loop-playtest
    plan: D31
    provides: "the state/input split whose two .fg-sides scrollers are two of the seven regions this pass gave a cue"
provides:
  - "[C00] the state palette: --state-hover-line/-wash, --state-hover-line-2/-wash-2, --state-on-line/-fill/-solid, --state-focus, --state-lit-line/-fill"
  - "[C00] --state-scroll-thumb, --state-scroll-shade, --ramp (120ms), --ramp-in (160ms)"
  - "[C16] MOTION AND SCROLL — the ramp list, the dialog entrance, the scrollbar rules, the four-layer edge cue, the reduced-motion guard"
  - "hover / declared / focus / lit as four visually distinct treatments on every surface that carries them"
  - "the background-image hover-wash idiom, which lets a hover compose with a selected fill instead of out-specifying it"
  - "the recorded trap: `[C14] ` written above line 1246 moves checks 107f and 103e's slices"
affects: [05-D33b, 05-D33c, 05-D33d, 05-D33e, 05-D33f, 05-D33g]

tech-stack:
  added: []
  patterns:
    - "a state palette derived entirely by color-mix() from six shipped tokens — no new hex, checked by 107f on every run"
    - "hover on background-image, state on background-color: two properties instead of one specificity fight"
    - "the four-layer scroll shadow (two local covers over two scroll shades) — self-gating on overflow with no JS and no class"
    - "a motion layer that is one named selector list rather than a universal selector, so the three regions with their own animation rules keep them"
    - "a pass defined by the gate NOT moving, verified by diffing the whole harness output against a pre-change run"

key-files:
  created: []
  modified:
    - cats-vs-mechs.html

decisions:
  - "The declared state KEEPS its outline and GAINS the fill, rather than trading the outline for the fill as the audit's table proposed — [C07]'s 'never by colour alone' rule makes the outline the non-hue channel, and the four states separate without spending it."
  - "Focus moves to outline-offset 3 plus a 1px --bg ring; the offset change is what makes a focus ring unmistakable next to a declared ring at the same width and hue."
  - "No transform anywhere. The audit does not name one for Pass A and every browser cell that reads a box would read it mid-flight."
  - "The dialog entrance is opacity ONLY, for the same reason."
  - "[C16] is a new block at the END of the stylesheet rather than rules added to [C01], because background is a shorthand in #strip and .ld-row and a shorthand resets background-image."

metrics:
  duration: ~2h
  completed: 2026-08-30
  tasks: 3
  commits: 2
---

# Phase 5 Plan D33a: D-33 Pass A — One Vocabulary of State Summary

**One-liner:** Four interaction states that were one colour are now four treatments derived by
`color-mix()` from six shipped tokens; a 120ms ramp replaces a stylesheet with zero transitions;
and seven scrolling regions that clipped content silently now carry a styled scrollbar and a
self-gating edge shade — with every gate figure byte-unmoved, which is this pass's definition.

## What was built

### 1. The state palette — [C00], and 36 rules across [C03]–[C15]

The audit measured one colour doing four jobs: 17 `:hover` rules all writing
`border-color:var(--accent)`, `:focus-visible` at `outline:2px solid var(--accent);outline-offset:2px`,
and `.fg-act--on` — an action a student has **declared** — at the *byte-identical* string. Four
treatments now, each derived from an existing token:

| meaning | treatment | measured |
|---|---|---|
| hover | `--state-hover-line` (accent 45% into `--line`) + a gradient wash at accent 12% | border `srgb(.253 .459 .588)`, bg-image `accent/0.12` |
| declared | accent border **and** accent fill **and** the outline it always had | bg `srgb(.361 .784 1 / .18)`, outline `2px solid accent off:2px` |
| focus | the same ring at **offset 3** with a 1px `--bg` ring inside it | outline `off:3px`, shadow `rgb(14,16,20) 0 0 0 1px` |
| lit as a target | `--accent-2` border, fill and outline | bg `srgb(1 .494 .714 / .16)`, outline `2px solid rgb(255,126,182)` |

**The hover wash is a `background-image` and not a `background-color`, and that is the one piece of
cleverness in the change.** Every `:hover` in this file is nested and therefore carries (0,2,0);
every `--on` rule is a bare class at (0,1,0) — so a hover that set `background-color` would win over
a declared state's fill and a hovered declaration would stop reading as declared. Putting the hover
on a different property makes the two compose. It also transitions, which `background-image` going
from `none` does not — hence the transparent gradient every control now rests on.

**Two fills per meaning, because the file has two kinds of control.** `.fg-act`, `.ae-pill`,
`.pk-sw` and `.bf-unit` sit on a translucent tint, so their fill mixes toward `transparent`;
`.brd-btn`, `.vw-btn`, `.pv-btn` and `.dc-alive` sit on an opaque `--panel`, so theirs mixes toward
`--panel` — mixing toward transparent there punches the panel out and reads as a hole.

`.unit-rm` keeps `--accent-2` as its own hover channel ([C04]'s decision) and gets the same *shape*
of treatment in that channel. `.dc-alive--on` keeps its `--ink` border and gains an `--ink` fill,
not an accent one, because "marked dead" is not the same kind of state as "declared".

### 2. The motion layer — [C16]

`transition` declarations in the stylesheet before this pass: **0**. Computed `transition-duration`
on `.brd-btn`, `.fg-act`, `.vw-btn`, `.bf-unit` and `dialog`: **0s**. Now `0.12s` on 24 named
control classes plus `border-color`/`background-color` on `.unit-card`, `.fg-area` and `.ld-now`.

Driven and sampled rather than asserted — the fill of a declared button, from a settled base:

```
base                srgb(0.4235 0.4627 0.5372 / 0.08)
+30ms   oklab(0.71548  -0.0508 -0.0781 / 0.1269)
+60ms   oklab(0.775235 -0.0694 -0.0964 / 0.1653)
+90ms   oklab(0.785031 -0.0724 -0.0995 / 0.1739)
+390ms              srgb(0.3608 0.7843 1 / 0.18)
```

Dialogs get a 160ms `dlg-in` opacity keyframe (and the backdrop rides with it), matching the file's
two shipped entrance animations rather than inventing a third kind of thing.

### 3. The scroll affordance — [C16], seven regions

`.fg-sides` ×2, `.ld-list`, `.ld-row`, `.ld-now-body`, `#strip` in its sidebar form, `.pk-list` and
`.ae-list` now carry `scrollbar-width:thin` + `scrollbar-color`, with matching `::-webkit-scrollbar`
rules, and the standard four-layer scroll shadow: two `background-attachment:local` cover layers
painted over two `scroll`-attached shade layers. At rest the covers sit exactly on the shades and
nothing shows; scroll and the shade appears at precisely the edge that now has content behind it. A
region that does not overflow shows nothing at all, because its content box and its scroll box are
the same box. No JavaScript, no scroll listener, no class to keep in sync. `--fade-cover` is set per
region to that region's actual backdrop.

## Verification

**Gate, before and after, byte-compared.**

| figure | before | after |
|---|---|---|
| node suite | 1253 passed, 0 failed, exit 0 | **identical** |
| interaction gate | 196 of 196 | **identical** |
| stub-drift | 135 shell ids | **identical** |
| DIALOG_FLOOR / scan | 138 / 172 | **identical** |
| FIGHT_FLOOR / scan | 132 / 592 (and 592 with the sidebar open) | **identical** |
| PROPOSE_FLOOR / scan | 23 / 62 | **identical** |
| browser checks, headless | 222 passed, 0 failed | **identical** |

`diff` over the full node output shows two lines: `100 commits in 7 ms` → `8 ms` and a boot time
`16 ms` → `17 ms`. `diff` over the full browser output shows two lines, both the `#strip top @scroll`
smooth-scroll landing note, whose chrome and edge columns swapped values — non-deterministic in the
baseline run too. **D-30's badge geometry (`0px, 0.25 down, color(srgb 1 0.427451 0.470936)`) and
every D-32b density note are byte-identical.**

**Read back off rendered pixels**, real Chrome, headless, `file://`, 1920×1080 and 1366×768, with
`--hide-scrollbars` removed from the default args so the scrollbars this pass styles are actually in
the image (Playwright hides them in headless by default — which is why the audit's screenshots never
showed one):

- `zoom-four-states.png` (3×) — declared, focused and hovered on three adjacent picker buttons in one
  frame. Declared: filled, accent border, ring hugging at offset 2, tick. Focused: no fill, ring
  standing off the box with a dark gap. Hovered: muted border, faint wash, no ring. Focus was armed
  by a **real Tab** (`:focus-visible` returned `true`) — a programmatic `.focus()` does not arm it,
  and the first attempt at this shot was green in the numbers and empty in the picture.
- `zoom-lit.png` (3×) — pink outline and pink fill, unmistakably not the blue.
- `zoom-fgsides-edge.png`, `zoom-pklist-edge.png` (3×) — a real thumb on a transparent track, at a
  position that reports where in the run you are.
- `zoom-fgsides-topcue.png` vs `-rest.png` — the top shade present when scrolled, absent at rest.
- `w1366-08c-lane-mid.png` — the lane's horizontal scrollbar, each card's own vertical one, and both
  end shades.
- `w1920-09b-card-mid.png` — a ledger card mid-scroll: thumb plus both edge shades, no cover smudge.
- `w1366-12-actedit.png` — the editor's three chooser kinds (side button, list row, pill) all reading
  as *filled* rather than as a bare ring, consistently.
- Zero page errors and zero console errors in every run, at both viewports.

**Reduced motion**, driven with `reducedMotion: 'reduce'`:

```
matches true | html scroll-behavior auto | transitions 0s | #share animation none/0s
scrollbar-width still thin | scrollbar-color still set | 4 gradient layers still painted
```

The ramp, the entrance and smooth scrolling go; the affordance stays, because it is colour and not
movement.

## Deviations from Plan

**1. [Rule 2 — correctness] The declared state keeps its outline instead of trading it for the fill**

- **Found during:** applying the audit's palette table
- **Issue:** the table reads *"selected / declared: border-color accent + background mix — a **fill**,
  not an outline"*. Taken literally that removes the outline, and [C07]'s standing rule — restated in
  [C12], [C14] and [C14.4] — is that a state is said in an outline (a change of shape, which survives
  a projector with the colour washed out) **and** a tick, never by colour alone. Dropping the outline
  would have left "declared" saying itself in two colours and a tick.
- **Fix:** the fill was **added** and the outline **kept**; focus was separated by moving to
  `outline-offset:3px` plus a 1px `--bg` ring instead. The requirement that `.fg-act--on` and
  `:focus-visible` stop being byte-identical is met (offset 2 vs 3, fill vs none, no shadow vs a
  shadow), and the shape channel is not spent.
- **Files modified:** `cats-vs-mechs.html`
- **Commit:** 115b882

**2. [Rule 3 — blocking] `[C16]` is a new block at the end, not rules added to `[C01]`**

- **Found during:** placing P3-3's shared scroller rule
- **Issue:** P3-3 proposes "one shared rule on a `.scroller` utility class" in [C01]. There is no
  `.scroller` class and adding one is a markup change, which this pass forbids — so the rule has to
  name the seven existing selectors. Worse, `background` is a **shorthand** in `#strip` ([C03]) and
  `.ld-row` ([C14.2]), and a shorthand resets `background-image`: a cue written in [C01] is silently
  deleted by both at equal specificity and later source order, with nothing on screen or in the gate
  to say so.
- **Fix:** the cross-cutting rules live in a new `[C16] MOTION AND SCROLL` block immediately before
  `</style>`. The tokens stay in [C00] because they are consumed 3,000 lines earlier.
- **Commit:** 115b882

**3. [Rule 1 — bug] Writing `[C14] ` in a comment above line 1246 reddened 107f**

- **Found during:** the first gate run after the [C00] banner went in
- **Issue:** checks **107f** and **103e** both slice this stylesheet with
  `html.indexOf('[C14] ')` — the marker *followed by a space* — and take the first hit. The new [C00]
  banner referred to the fight band by name, so both slices moved up to line 50 and 107f reddened on
  `[C01]`'s page `radial-gradient(... #1a2030 ...)` and `[C02]`'s `.callout b{color:#fff}` — two
  colours shipped three phases ago that this pass never touched. `1253 passed, 0 failed` and
  `195 of 196`, with the two literals named in the detail.
- **Fix:** the banner names the band without the marker, and **the trap is written into the banner**
  so the next author does not rediscover it. Any comment above [C14] that wants to name it must write
  it without the trailing space.
- **Files modified:** `cats-vs-mechs.html`
- **Commit:** 115b882

## Hand-offs

- **Pass B** inherits the palette, so `.fg-team`, the Advance control's primary weight and the
  retarget flow can be styled in it rather than restyled after it. `--state-on-solid` is the fill
  P1-6 asks for on Advance; it exists now.
- **Pass C** should know that `.ld-list`'s horizontal scrollbar is now *thin* (10–11px) where real
  headed Chrome was already spending 15–17px on a default one. The 15vh re-derivation gains a few
  pixels rather than losing them — but it must be re-measured in a browser without
  `--hide-scrollbars`, which is what hid this from the audit in the first place.
- **Pass D** gets the dialog entrance already in place; P2-5's "pane switches settle instead of
  jumping" needs the transition on the pane, not the dialog, and is still open.
- **P3-6** (`:focus-within` on `.fg-row`) is listed under Pass A in the audit's grouping table and is
  **not** done here: `.fg-row` is a bare flex row with no border or background to change, so a
  `focus-within` treatment on it is a new visual decision rather than a token swap. The focus ring
  itself now separates cleanly from "declared", which was the reason P3-6 was grouped with P1-8.
  Carried to Pass B, which owns [C14.1].

## Known Stubs

None.

## Threat Flags

None. No new network surface, no auth path, no file access, no schema change; the whole change is
CSS.

## Self-Check: PASSED

- `cats-vs-mechs.html` — FOUND, modified
- `.planning/phases/05-fight-loop-playtest/05-D33a-SUMMARY.md` — FOUND
- commit `115b882` — FOUND in `git log`
