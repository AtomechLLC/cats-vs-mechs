# Phase 3: Advisory Projection & Reference Material - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-28
**Phase:** 3-Advisory Projection & Reference Material
**Areas discussed:** none — the user declined the discussion round

---

## Area Selection

Four gray areas were offered. The user did not answer, having asked to move on from the Phase 2.1
verification loop immediately beforehand.

| Option | Description | Selected |
|--------|-------------|----------|
| What makes it a range | PROJ-02 wants "≈3–5 turns" but `factionDps` returns one number; something must produce the spread. | |
| How the arithmetic shows | PROJ-03 requires the maths on screen with no tooltip or hover, inside a narrow centre strip. | |
| Where the reference material lives | Phase 2 put both in a band, but REF-02 attaches effect cards to actions, which are per-faction. | |
| Making "no verdict" positive | PROJ-06 is written as a prohibition; the affirmative rule was undecided. | |

**Consequence:** all four resolved at Claude's discretion as D-01 through D-17 in CONTEXT.md.

---

## Claude's Discretion

- **The range (D-02–D-07)** — modelled on overkill waste and nothing else, because a decorative ±
  band would be dishonest. Fast bound is perfect focus fire; slow bound is maximal overkill. When
  they are equal the display shows a single number rather than a fake range — which is the case on
  the shipped board, so the range appears precisely when overkill exists.
- **The arithmetic (D-08–D-11)** — a worked line per side with both operands and the operator
  visible, each panel naming its own durability and its own offense with the direction stated.
- **Reference material (D-12)** — action cards inside each faction column with effect cards attached
  to them; the counter map in a full-width band below. A deliberate amendment to Phase 2's D-02,
  which is unsatisfiable as written alongside REF-02.
- **No verdict (D-13–D-17)** — separate panels with no shared axis; no comparative vocabulary; colour
  encodes identity only; the "what this ignores" list permanent and adjacent; and the machine grep
  widened to cover comparative words so PROJ-06 is enforced rather than promised.

## Measured input that shaped the decisions

Run against the artifact rather than estimated:

| | units | AP | eHP | best damage | damage/turn | turns to wipe the other |
|---|---|---|---|---|---|---|
| Cats | 9 | 3 | 27 | 1 | 3 | 9 |
| Mechs | 3 | 3 | 27 | 3 | 9 | 3 |

Identical effective HP, three-to-one difference in outcome, because AP is the binding constraint.
D-01 records this as the phase's best teaching artifact rather than something to tune away.

## Deferred Ideas

- A range that models focus-fire choice — would require the tool to assume a targeting strategy,
  which is the student's ruling to make.
- Per-action projection ("what if I lead with Hairball?") — a new capability, its own phase.
- The counter map as a 3×3 matrix — set aside for three plain lines, per projector legibility.
