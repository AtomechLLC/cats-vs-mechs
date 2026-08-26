# Pitfalls Research

**Domain:** Single-file, zero-build `file://` HTML teaching instrument for game-balance workshops (bookkeeping + advisory projection; students are the rules engine)
**Researched:** 2026-08-26
**Confidence:** HIGH on technical (verified against Chromium/Gecko/WebKit source and the HTML/Secure-Contexts specs), MEDIUM on pedagogical (grounded in teaching-tool literature and design writing, not in trials of this specific artifact)

---

## Headline corrections to common assumptions

Two widely-repeated claims that would have shaped this project badly are **wrong**. Both were checked against browser source, not blog posts.

| Common belief | Reality | Evidence |
|---|---|---|
| "`navigator.clipboard` is undefined on `file://` because file URLs aren't secure contexts" | **False.** All three engines treat the `file:` scheme as *potentially trustworthy*, so `isSecureContext === true` and `navigator.clipboard` exists. | Secure Contexts spec §3.1 step: *"If origin's scheme is `file`, return Potentially Trustworthy."* Chromium unit tests assert `IsUrlPotentiallyTrustworthy("file:///test/fun.html") == true`. Gecko registers the `file` protocol handler with the `URI_IS_POTENTIALLY_TRUSTWORTHY` flag (`netwerk/build/components.conf`). WebKit's `shouldTreatAsPotentiallyTrustworthy` returns true via `shouldTreatURLSchemeAsLocal("file")`. |
| "`history.replaceState` throws SecurityError on `file://`" | **False for hash-only changes.** The HTML spec's *"can have its URL rewritten"* algorithm says: for scheme `file`, only a **path** difference is refused — *"Differences in query and fragment are allowed for file: URLs."* Blink implements this verbatim in `CanChangeToUrlForHistoryApi`; Gecko's `Document::CanRewriteURL` routes file URLs through `CheckMayLoadWithReporting`, which permits the same file. | `third_party/blink/renderer/core/frame/history_util.cc`; `dom/base/Document.cpp:13365`; WHATWG HTML nav-history-apis §"can have its URL rewritten". |

The old Stack Overflow / crbug lore about both of these predates ~2019 and is stale. **Neither the "copy shareable link" nor the "state in the URL" requirement is blocked.** The real risks are different and are documented below (Pitfalls 3, 4, 5, 6).

---

## Critical Pitfalls

### Pitfall 1: The projection becomes the verdict (Goodhart's Law inside the tool)

**What goes wrong:**
The eHP/DPS readout is the only number on screen that moves when you touch a stepper. Students discover the feedback loop within thirty seconds and start playing *the readout* instead of the fight — nudging health up and down to make the two sides' numbers converge, declaring victory when they match, and then either skipping the fight or treating a contradicting fight result as "the sim being wrong." The workshop's actual lesson (a cost model is a guess; play proves balance) inverts into "balance is when the bar is centred."

**Why it happens:**
This is Goodhart's Law operating at UI scale: *when a measure becomes a target, it ceases to be a good measure*. A live-updating number attached to a stepper **is** a target, regardless of what the label says. It is also cheaper than playing a fight — a stepper click costs one second, a fight costs ten minutes — so the optimization pressure is enormous. Educational-modelling research names the same failure on the epistemic side: Grosslight, Unger & Jay (1991) found secondary students hold a *naïve realist* view of models, treating them as replicas of reality rather than as constructed, testable, revisable tools. A number rendered in the same visual weight as the game board reads as reality.

**How to avoid:**
Not by adding a disclaimer. Disclaimers lose to layout. Concrete measures:

1. **Make the projection's unit identical to the fight's unit.** Do not display abstract "eHP 27 / DPS 4.5". Display *"≈3–5 turns to wipe Mechs"*. The fight produces turns-to-wipe as its natural output, so after every fight you can render the comparison directly — **"You guessed 3–5. It took 8."** That sentence is the entire lesson and it only exists if the units match. This single decision does more anti-Goodhart work than every other item on this list.
2. **Make the post-fight comparison the loudest element in the app**, louder than the live projection. The projection is small, low-contrast, and lives with the counter map in the reference column. The gap readout is large and lives in the fight area.
3. **Never render a verdict state.** No green/red, no traffic light, no "Balanced ✓", no centred-bar-with-midpoint. Two independent side-by-side readings, never one shared meter with a middle. A shared bar with a midpoint *is* a verdict widget no matter what the tooltip says.
4. **Ship a permanently-visible "this ignores:" list adjacent to the projection** — counters, effects, focus fire, overkill waste, action-economy sequencing, your table rulings. Five bullets, always on, not behind an info icon. This also solves Pitfall 2 (false precision).
5. **First-person framing.** *"Your cost model predicts…"* not *"Projected balance:"*. The number is the student's hypothesis, not the tool's judgement.
6. **Track and surface divergence.** Once a fight has been played, keep the "predicted vs actual" pair visible while the student re-allocates. A student who has seen their own guess be wrong twice stops chasing the needle.

**Warning signs:**
- Anyone (including you, while building) describes a build as "balanced according to the tool."
- During dogfood, you find yourself adjusting steppers while watching the number rather than watching the token rows.
- The projection is the largest or most colourful thing on screen.
- The design conversation drifts toward "should we add a confidence percentage / win probability" — that is the same pathology wearing a lab coat.
- A student asks "what number should I aim for?"

**Phase to address:**
The **projection phase**, but the decision must be made *before* it — the choice of unit (turns-to-wipe vs eHP/DPS) and the "predicted vs actual" pairing are dependencies of the fight loop. Put "projection unit = fight unit" in the fight-loop phase's success criteria so the fight records the data the comparison needs. Do not build the projection before the fight loop; if you do, you will pick abstract units and the comparison becomes impossible to retrofit.

---

### Pitfall 2: False precision — a derived number that implies rigour it does not have

**What goes wrong:**
`eHP = 27.5`, `DPS = 4.33` looks like physics. It is arithmetic over a model that ignores turn order, counters, keywords, overkill, and every ruling the students made at the table. Two decimal places is a claim about the model's resolution, and it is a false claim. Students then argue about a 3% difference that the model cannot resolve, which is a worse use of workshop time than arguing about nothing.

**Why it happens:**
Floating-point division produces decimals by default and nobody deletes them. Also, precision *feels* like quality while you're building — a number that reads `4.33` looks more finished than one that reads `≈4`.

**How to avoid:**
- **Round hard and show a band, not a point.** Uncertainty-visualization research (Hullman et al.) is blunt about this: *"When uncertainty is withheld, visualizations imply unrealistic precision."* Their design practice explicitly rejects point predictions outside an uncertainty context because it "would give users a false sense of precision." Render `≈3–5 turns`, never `4.33`.
- **Derive the band from something honest.** The simplest defensible band: best case (every attack applies its counter) to worst case (no counter ever applies). That band is wide, and its width *is* the message — a wide band visibly says "your keywords matter more than your health allocation."
- **Never show more significant figures than the inputs.** Inputs are small integers from steppers; outputs should be small integers too.
- **Prefer "≈" and ranges in the DOM text itself**, not in a tooltip. Tooltips do not survive a projector.

**Warning signs:**
- Any decimal point in the projection area.
- The band collapses to a single value for the default build (means the band isn't modelling anything).
- Someone proposes a percentage.

**Phase to address:** Projection phase. Add "no decimals anywhere in the projection; range not point" as an explicit acceptance criterion.

---

### Pitfall 3: The copy-link button fails *at the moment it matters* — not because of `file://`

**What goes wrong:**
The clipboard API is available (see headline corrections), so the naive implementation appears to work on your machine and then fails in the room. The three real failure modes:

1. **`NotAllowedError: Document is not focused`.** Chromium rejects clipboard writes when the document isn't focused. An instructor demoing with DevTools open, or clicking the button right after alt-tabbing, hits this every time. This is *the* most likely live-workshop clipboard failure.
2. **Transient user activation lost across an `await`.** If you compute/compress/serialize asynchronously before calling `writeText`, the user-activation window can expire — WebKit is strictest here. The fix is to build the string synchronously in the click handler and call `writeText` immediately, or to pass a `Promise` to `ClipboardItem` rather than awaiting first.
3. **The rejection is unhandled**, so the promise fails silently and the button shows "Copied!" anyway because the success toast was fired optimistically outside the `.then()`.

**Why it happens:**
`navigator.clipboard.writeText()` returns a Promise. Developers write `navigator.clipboard.writeText(url); showToast('Copied!')` and never see the rejection. On a dev machine with a focused window it works 100% of the time.

**How to avoid — the three-tier ladder, all three tiers required:**

```
Tier 1: navigator.clipboard.writeText(url)   — built synchronously in the click handler,
        with a real .catch() that falls through to Tier 2.
Tier 2: document.execCommand('copy') on a temporary textarea.
        The textarea must be IN THE LAYOUT (position:fixed; opacity:0; NOT display:none),
        .focus() then .select() before the call. Wrap in try/catch.
Tier 3: reveal a readonly <input> containing the URL, pre-selected, with the visible
        hint "Press Ctrl/Cmd+C". This tier cannot fail and must always be reachable.
```

On `document.execCommand('copy')` in 2026: MDN marks it deprecated, but **no engine has scheduled removal**, and the practical consensus (including on the MDN content tracker issue for `execCommand`) is that vendors cannot drop it because too much of the web depends on it. Treat it as a working-but-unsupported fallback: keep it, but do not let it be the only fallback, because "deprecated with no removal date" is not a guarantee you can make to a classroom.

**Additionally:** Chromium auto-grants the clipboard-write permission — `ClipboardSanitizedWritePermissionContext::GetContentSettingStatusInternal` unconditionally returns `CONTENT_SETTING_ALLOW` — so plain-text writes will never prompt. There is no permission UI to design around. Good news, but it also means you get no signal when the write is refused for focus reasons.

**Warning signs:**
- The success toast is not inside the promise's `.then()`.
- No `.catch()` on the `writeText` call.
- You have never tested the button with DevTools focused.
- Tier 3 doesn't exist ("we'll add it if tier 1 fails").

**Phase to address:** The **share/reset phase**. Test matrix for that phase's verification: Chrome + Firefox, `file://`, window focused / DevTools focused / window backgrounded, and one run with `navigator.clipboard` deliberately deleted in the console to force the ladder down to Tier 3.

---

### Pitfall 4: The share URL exceeds Discord's message limit and becomes an attachment

**What goes wrong:**
Browsers are not the binding constraint — Discord is. A Discord message caps at **2000 characters** (4000 with Nitro), and Discord's stated behaviour is that **messages over the limit are converted into a text file attachment**. Your carefully-designed shareable link stops being a clickable link in the thread and becomes a `.txt` a classmate must download and open. The workshop step "post your build in the Discord thread" quietly stops working, and it fails for the *most interesting* builds — the ones with big rosters and lots of manual adjustments.

Browser limits, for completeness, are far higher and only matter as a distant backstop:

| Limit | Value | Failure mode | Confidence |
|---|---|---|---|
| **Discord message content** | **2000 chars** (4000 Nitro) | Converted to a file attachment | MEDIUM (Discord support docs) |
| Chromium `url::kMaxURLChars` | 2 MB | **Silent** — "the Mojo serialization code will replace any very long URL with an invalid GURL" (`url/gurl.h` comment). Not an exception you can catch. | HIGH (source) |
| Firefox address bar | ~65,536 chars for display; longer URLs still function | Cosmetic | LOW |
| Safari | ~80,000 chars | Error page | LOW |

**Why it happens:**
Nobody measures the encoded payload until someone tries to share a 40-unit roster. JSON-plus-base64 is roughly 1.4× the JSON size, and verbose JSON keys (`{"health": 5, "actionPoints": 3, ...}` per unit) blow up fast.

**How to avoid:**
- **Budget: keep the entire URL under ~1,000 characters for a plausible worst-case build.** That leaves room for the `file:///C:/Users/…/CatsVsMechs.html` prefix (which is itself 60–120 chars and varies per student) plus surrounding message text. Note that the *file path is part of the shared URL*, so your payload budget is not the whole 2000.
- **Encode positionally, not as JSON.** A compact scheme — version char, then per-side counts, then a run of small integers in a fixed order — turns ~1.5 KB of JSON into ~100 characters. Fixed field order also makes the format self-documenting against the state object.
- **Show the length.** Put the character count next to the copy button, and turn it amber past ~1,500 and red past ~1,900. This is three lines of code and it converts a silent catastrophe into a visible one.
- **Do not compress with `CompressionStream`** to buy headroom — it's async (Pitfall 3 activation problem) and it makes the payload opaque to debugging. Fix the encoding instead.
- **Consider a "share the fight setup, not the fight state"** split: the *build* (allocations, roster, actions) is what belongs in Discord; mid-fight HP and spent AP do not need to round-trip. This can halve the payload. Decide this deliberately rather than by accident.

**Warning signs:**
- No character count anywhere in the UI.
- The encoder emits JSON.
- Field names appear in the encoded string.
- Nobody has tested with the maximum roster size the roster-editing phase allows.

**Phase to address:** The **share phase** owns the budget and the counter, but the **state-shape decision belongs to the very first phase** — if the state object is designed without a serialization plan, the encoder becomes a translation layer that drifts. Define the canonical state shape and its positional encoding order together, in phase 1.

---

### Pitfall 5: Round-trip corruption — `btoa`, `+`, and Firefox's `location.hash`

**What goes wrong:**
Three independent, well-documented encoding bugs, each of which silently produces a *different* build on the receiving end rather than an error:

1. **`btoa()` throws `InvalidCharacterError` on any code point above 255.** If faction or unit names are ever editable (or if you ship an emoji, a curly apostrophe, or an en-dash in a default label), the copy button explodes. MDN's prescribed fix: `new TextEncoder().encode(str)` → bytes → binary string → `btoa`.
2. **`+` corruption.** Standard base64 emits `+`, `/`, `=`. `encodeURIComponent` never *produces* `+`, but `URLSearchParams.toString()` encodes spaces as `+` and `new URLSearchParams(...)` decodes `+` back to a space. Mix the two APIs anywhere in the round trip and every `+` in your base64 becomes a space, which decodes to a corrupt-but-parseable state.
3. **Firefox percent-decodes `location.hash`; Chromium does not.** This is long-standing and documented on Bugzilla (bugs 378962, 1213870, 1093611). A payload containing `%` sequences round-trips differently depending on which browser opens the link — and in a workshop, the sender and receiver are usually on *different* browsers, so this bug is invisible until exactly the moment it matters.

**Why it happens:**
Every one of these works fine when you test by pasting a link into the same browser you generated it in, with ASCII-only default data.

**How to avoid — one rule solves all three:**
**Emit only characters from the URL-safe unreserved set `[A-Za-z0-9._~-]` into the fragment.** Use base64url (`+`→`-`, `/`→`_`, strip `=` padding) or, better, a custom base-62/base-64url integer packing. If the payload contains no `%`, no `+`, and no reserved characters, then percent-encoding and percent-decoding are both no-ops and every browser difference above evaporates. No `encodeURIComponent`, no `URLSearchParams`, anywhere in the pipeline.

Supporting measures:
- **Version-prefix the payload** (a single leading character). When you change the encoding mid-project — you will — old links must fail loudly and legibly ("this link was made with an older version") rather than decode into nonsense.
- **Validate on decode.** Length check, range-check every integer, and on failure show a visible banner and fall back to defaults. Never silently accept a partial parse.
- **Read the fragment from `location.href.split('#')[1]`**, not `location.hash`, if you ever need bytes that could be percent-encoded. (With the unreserved-set rule this is belt-and-braces, but it costs nothing.)
- **Round-trip test as a build ritual:** encode → decode → deep-equal against the original state object. This is a ten-line self-check that can run on load in a dev flag.

**Warning signs:**
- `btoa` appears in the code without a `TextEncoder` in front of it.
- `URLSearchParams` appears anywhere.
- The encoded string contains `+`, `/`, `=`, or `%`.
- No version byte.

**Phase to address:** Share phase for the encoder; **phase 1 for the "state is integers only, names are indices not strings"** decision that makes the encoder trivially safe.

---

### Pitfall 6: Writing the hash on every stepper click — throttling, history spam, and address-bar noise

**What goes wrong:**
The obvious design is "keep the URL always in sync with state," so you call `history.replaceState` in the render function. Three consequences:

1. **Blink's navigation rate limiter caps same-document navigations at 200 per 10 seconds** (`NavigationRateLimiter::CanProceed`, `kStateUpdateLimit = 200`). Beyond that, calls are dropped with a console warning — *"Throttling navigation to prevent the browser from hanging"* — and under Chromium's newer `ThrottledHistoryAPIThrowsSecurityError` runtime flag, throttled calls **throw a SecurityError** instead. A student rapid-clicking a stepper to set health to 40 will hit this. If the copy-link button reads the URL rather than re-serializing state, they then copy a *stale* link.
2. If you use `pushState` instead of `replaceState`, every click becomes a history entry and the browser Back button becomes useless — which also destroys the most natural "undo" affordance a student will reach for (Pitfall 8).
3. On `file://` the address bar shows a long path plus a long hash; a constantly-mutating URL bar is visual noise during a projected demo.

**Why it happens:**
"Sync the URL with state" is a good habit from SPA work where state changes are coarse. Here state changes are one-per-click and clicks come in bursts.

**How to avoid:**
- **Do not mirror state into the URL continuously.** The requirement is *"copy a shareable link"*, not *"the address bar always reflects the build."* Serialize on demand, inside the copy handler. This eliminates the throttle risk entirely and is strictly less code.
- If you do want URL sync (e.g. so browser-refresh preserves work), **debounce `replaceState` to ~500 ms trailing** and always use `replaceState`, never `pushState`.
- **Always regenerate the share string from state at copy time**, never read it back out of `location.hash`. This makes staleness structurally impossible.
- Read the hash exactly once, on load.

**Warning signs:**
- `replaceState` inside `render()`.
- The copy handler reads `location.hash`.
- Console shows "Throttling navigation…" during rapid clicking.
- Back button does something surprising.

**Phase to address:** Phase 1 (establish "URL is written only by the copy action"), verified in the share phase.

---

### Pitfall 7: Full re-render on every click — dropped stepper clicks, focus loss, and token flicker

**What goes wrong:**
The honest finding first: **DOM node count is not your problem.** 9 units × ~15 health tokens ≈ 135 nodes; even a 50-unit stress roster is ~1,000 nodes. Browsers do not care at that scale. What actually degrades is the *re-render strategy*:

1. **Dropped clicks.** A `click` event only fires if `pointerdown` and `pointerup` land on the *same* element. If the stepper's `+` button is destroyed and recreated by `innerHTML =` on every click, a fast second click can go down on the old node and up on the new one — and the click is silently dropped. The student presses `+` eight times and health goes up six. This is the single most damaging performance bug possible in a stepper-driven tool, because it is intermittent and it destroys trust in the instrument.
2. **Focus loss.** Replacing the subtree moves focus to `<body>`, so keyboard operation and the focus ring disappear after every press. This is a documented, cross-framework class of bug (Preact #540, React and Vue equivalents).
3. **Animation restart / token flicker.** If health tokens have CSS transitions, wholesale replacement restarts every animation on every click, so the entire token row flashes each press. On a projector this reads as the tool being broken.
4. **Scroll and selection reset** in any scrollable panel, and loss of any text selection.
5. **Accidental text selection** from rapid clicking (fix: `user-select: none` on stepper controls).
6. **Layout thrash** if the render function reads `offsetWidth`/`getBoundingClientRect` between writes — this is the only thing that will actually cost you frames, and it only appears once you add "fit the token row to the panel width" logic.

**Why it happens:**
`container.innerHTML = buildHTML(state)` is the natural zero-build pattern and it is genuinely fine for the *documents* this project sits beside (`game-feel-study-guide.html` renders once). It is not fine for an instrument that re-renders 50 times a minute.

**How to avoid:**
- **Split render into "structure" and "values."** Create unit rows and stepper buttons once, when the roster changes. On a value change, mutate only the token strip and the number — and even then, prefer adding/removing individual token nodes over replacing the strip.
- **Never destroy the element that was clicked, inside its own handler.** If you must re-render broadly, do it in a `requestAnimationFrame` after the handler returns, and keep stepper buttons outside the replaced subtree.
- **Use event delegation** — one listener on the container, `data-` attributes for identity. Handlers then survive any re-render and you cannot leak listeners.
- **Test by clicking as fast as you can** and confirming the count matches. Add this to the phase verification as a literal instruction, not an aspiration.
- Add `user-select: none` to all steppers and token rows.
- If you ever animate tokens, animate on *enter/exit* only and key nodes by index so unchanged tokens are untouched.

**Warning signs:**
- `innerHTML =` appears in a click handler.
- Any listener attached inside a render function.
- Token rows visibly flash when you press `+`.
- Rapid clicking undercounts.

**Phase to address:** **Phase 1 (allocation UI).** This is architectural — the render strategy chosen for the first token row will be copied into the fight loop and the roster editor. Retrofitting targeted updates across a finished app is expensive; choosing them on day one is free. Make "rapid-click count is exact" a phase-1 acceptance criterion.

---

### Pitfall 8: No undo, no way back — the classroom recovery problem

**What goes wrong:**
A student clicks something mid-fight, the board is now wrong, and there is no path back except starting over. In a workshop this is not an inconvenience; it is the end of that student's participation for the segment, because rebuilding a tuned roster takes longer than the remaining time. The same failure hits the instructor demoing live, in front of everyone.

This is sharpened by the project's own design: **manual override is a primary interaction**, which means the app deliberately offers a large number of easy, unvalidated, destructive edits. High edit affordance without an undo path is the worst combination.

**Why it happens:**
Undo looks expensive, so it gets deferred, and then the state model has grown mutable helpers everywhere and undo becomes genuinely expensive. Also, "Reset to defaults" gets built early and *feels* like it covers recovery — it does not, because it is maximally destructive.

**How to avoid:**
- **Undo is cheap here if you decide it in phase 1.** State is a small plain object of integers. Push a structured-clone (or your own compact encoding — you already have one for the URL) onto a bounded stack (say 50 deep) before every mutation. `Ctrl+Z` plus a visible Undo button. Doing this later means auditing every mutation site.
- **Three distinct recovery scopes, clearly separated in the UI:**
  - *Undo* — last action.
  - *Reset fight* — restore all HP/AP to the allocated build, keep the build.
  - *Reset to Workshop 16 defaults* — nuke everything.
  The third must be visually and spatially separated from the other two and must confirm. A single "Reset" button that silently destroys a student's tuning is a guaranteed workshop incident.
- **Never place a destructive control adjacent to a frequently-used one.** The reset control does not belong near the steppers or near the end-turn button.
- **Autosave is not a substitute for undo** and comes with its own trap: on `file://`, Chromium gives *every local file the same `file://` origin*, so **all your course artifacts share one `localStorage` bucket** — namespace every key (`cvm.v1.*`) or you will collide with the sibling HTML files. Safari refuses `localStorage` on `file://` entirely (`SecurityError: The operation is insecure`), so any use must be inside `try/catch` and the app must work fully without it. Given "no persistence" is already out of scope, the safest answer is: **don't use localStorage at all**, and let undo + the share link carry recovery.

**Warning signs:**
- No undo in the plan.
- One button labelled "Reset".
- `localStorage` used without try/catch or without a namespace prefix.
- During dogfood you catch yourself reloading the page to fix a mistake.

**Phase to address:** **Phase 1** for the undo stack (state-shape dependency); the **fight-loop phase** for reset-fight; the **share/reset phase** for reset-to-defaults and its confirmation.

---

### Pitfall 9: Ambiguous bookkeeping state — the manual-adjudication surface that annoys

**What goes wrong:**
Manual-adjudication tools fail on ambiguity, not on missing features. The recurring complaints, from tabletop/VTT combat trackers and from paper-and-token workshop boards alike:

- **"Whose turn is it?"** — With a *shared faction AP pool* (this project's chosen model), there is no per-unit turn cursor to anchor on. Students lose track of which side is acting and how much of the pool is gone. This is the highest-frequency confusion in a shared-pool design.
- **"Is that unit dead or on zero?"** — A unit at 0 HP that a student ruled survived (Shield absorbed it) is *not* the same as a dead unit. If the tool conflates `hp === 0` with dead, the student's ruling is unrepresentable and they stop trusting the board.
- **"Did I already spend that?"** — AP shown as a bare number ("3") does not communicate consumption. AP shown as three yellow triangles, of which one is now dimmed, does.
- **"Why is this number different?"** — After a manual override, the tracked value no longer follows from the fight. Without a marker, nobody can reconstruct what happened, including the student who did it thirty seconds ago.
- **"What happened last turn?"** — With no log, the post-fight discussion (the actual pedagogical payload) has nothing to reference. Students argue from memory and the instructor cannot referee.

**Why it happens:**
Each of these is invisible to the builder, who knows the state model. They only appear when a second person operates the tool without narration.

**How to avoid:**
- **Model death explicitly.** `alive: boolean` separate from `hp`. Zero HP prompts — it does not auto-kill. A one-click "mark dead / revive" makes the students' ruling authoritative, which is the whole design thesis.
- **Render every consumable as tokens, including AP**, with spent tokens dimmed/struck rather than removed. Consumption should be visible as a *change in the same row*, matching the workshop board's vocabulary.
- **One unmissable turn indicator.** Whose turn, AP remaining as tokens, and an explicit "End turn" that is the only way the turn advances. Never advance automatically on AP exhaustion — students frequently rule that an action cost something different.
- **Mark manual overrides.** A small dot or different border on any value that was hand-adjusted this turn, cleared at turn end. Cheap, and it makes the projection-vs-reality conversation concrete ("we overrode four times — that's four rules the model doesn't have").
- **Keep a plain-text turn log.** Append-only, scrollable, one line per action, including manual adjustments. It costs almost nothing, it is the artifact students screenshot into Discord, and it is the reason the post-fight discussion works.
- **Every tracked value adjustable in place**, with the same stepper vocabulary as allocation — no modal, no separate "edit mode." The PROJECT explicitly calls this a primary interaction; the design consequence is that overrides must be reachable in one click from wherever the value is displayed.

**Warning signs:**
- A single `hp` field with death inferred from it.
- AP rendered as a number.
- No log.
- Watching someone else operate the tool, you have to say "no, click the other one."

**Phase to address:** **Fight-loop phase**, with the `alive` flag and log shape decided in phase 1's state model.

---

### Pitfall 10: The asymmetry lesson misfires — Lanchester's square law hands the swarm a free win

**What goes wrong:**
This is the specific, mathematical way this project's central lesson can break. The workshop board's example matchup is **9 Cats vs 3 Mechs**. In aimed-fire attrition with focus fire and no mitigating mechanics, **Lanchester's Square Law** applies: a force's effective strength scales with the *square* of unit count times individual power. A 3× numerical advantage is a 9× combat advantage; compensating for an N-fold quantity deficit requires an N²-fold quality advantage.

The tool makes this worse in two ways it is otherwise right to do:
- **Units die individually and focus fire is possible** (an explicit requirement) — this is precisely the condition that activates the square law.
- **Overkill waste is visible** — and overkill penalizes the side with *high per-hit damage attacking low-HP targets*, i.e. the Mechs shooting Cats. It compounds the swarm's advantage rather than offsetting it.

If the shipped defaults allocate roughly-equal *totals* across both sides, the Cats will crush the Mechs, repeatedly and boringly. Students then learn the exact opposite of the intended lesson: **"asymmetry is fake; more bodies just wins."** And because the eHP/DPS projection is linear, it will have said the sides were even — so the tool's most important moment (projection vs reality) fires, but delivers the wrong conclusion.

Two secondary misfires:
- **"Asymmetry is just worse."** If the only asymmetry students can touch quickly is a scalar trade (fewer, bigger units), they conclude asymmetric design is a handicap. Asymmetry that *works* lives in the shape of the side — action economy, keywords, counter coverage — not in the health sliders.
- **Hot-seat self-confirmation.** One student playing both sides will unconsciously play their favoured build better and conclude it is balanced. They have proven they can pilot it, not that it is fair.

**How to avoid:**
- **Tune the shipped defaults by playing them, before shipping.** The Workshop 16 board already contains the square-law counterweights — Lasers (3 damage, **Range**), **Shield** from Recharge, **Evade** from Fly. These exist to give the elites the super-linear quality edge the math demands. The defaults must be set so that a straight, competently-played default fight is *close*, not a blowout. Verification for the fight-loop phase: **play the shipped default 9v3 twice end-to-end and confirm neither side wipes the other with more than ~30% of its own force intact.** If it's a blowout, the defaults are wrong, not the students.
- **Make the counter map impossible to ignore** during the fight, not just during allocation. If counters are the mechanism that breaks the square law, they must be on screen while attacks are being declared — reference material parked in an allocation panel will not be consulted mid-fight.
- **Show each side's projection in its own terms**, side by side, never as one shared meter. A shared meter with a midpoint teaches "balance = equality of a scalar," which is the exact misconception.
- **Make shape-level asymmetry the first thing students touch.** Roster count and AP pool are more interesting levers than per-unit health; order the allocation UI so that action economy and roster shape are prominent rather than buried under health steppers.
- **Prompt a seat swap.** One line in the UI or the post-fight summary: *"Play it again with the sides swapped."* Costs nothing, defuses the hot-seat confirmation bias, and the turn log makes the two runs comparable.
- **Say the quiet part in the "this ignores" list**: include *"more units is worth more than the math says (focus fire)"*. Naming the square law turns a bug in students' intuition into content.

**Warning signs:**
- The default fight ends in a wipe with most of one side untouched.
- Playtesters describe a dominant strategy within two fights.
- Students' first and only adjustment lever is health.
- Post-fight discussion converges on "just take more units."

**Phase to address:** **Fight-loop phase** owns the default tuning and its verification; **content/defaults phase** owns the counter map's placement; the **projection phase** owns per-side-in-own-terms display. Flag the fight-loop phase as **needing its own playtest research/verification step** — this is the one phase whose success cannot be verified by reading the code.

---

### Pitfall 11: It cannot be operated live — the classroom instrument failures

**What goes wrong:**
The tool is correct and unusable in the room. Specific, recurring failures for workshop instruments:

- **Illegible on a projector.** The Carpentries' instructor training is direct about this: *"Use a big font, and maximise the window. A black font on a white background works better than a light font on a dark background."* This project's constraints mandate the course's **dark palette** (`--bg:#0e1014`, `--ink:#e8ebf2`). That is a real, sourced tension, not a hypothetical — low-contrast projectors in bright rooms crush dark themes. It is not a reason to abandon the visual language; it is a reason to (a) push contrast well past web-typical (the tokens are the readable element — make them large and saturated), (b) size base type larger than a document would (the siblings are documents; this is a wall display), and (c) **build a "present" toggle** that bumps root font size and boosts contrast in one click. One toggle solves the whole class of problem.
- **Too many clicks per meaningful action.** Setting a unit to 12 health via twelve `+` presses is twelve clicks and twelve chances for Pitfall 7's dropped-click bug. Add click-and-hold repeat, `Shift+click` for ±5, and direct number entry.
- **Nothing survives a mistake** — covered in Pitfall 8, but the classroom framing is sharper: the instructor cannot pause to debug. Recovery must be one click and obvious.
- **A blank page.** Zero-build means no bundler, no type checking, and no error boundary. A single top-level `throw` — a typo'd state key, a bad decode from a pasted link — produces a black screen mid-demo with the answer only in a DevTools console nobody wants to open on a projector. **Wrap init and every event handler in try/catch and render a visible, styled error panel with a "Reset to defaults" button.** This is the cheapest insurance in the entire project.
- **Setup friction.** Anything that requires "and now open the console" or "you need to serve it" defeats the double-click requirement. Verify by actually double-clicking the file from a file manager on a machine that has never run it, in at least Chrome and Firefox.

**Warning signs:**
- You have never viewed it from three metres away, or on a second monitor at 1280×720.
- Base font is under 16px anywhere that matters.
- No error boundary.
- A common action takes more than two clicks.

**Phase to address:** Legibility and the present toggle in the **UI/shell phase**; error boundary in **phase 1** (it must exist before there is anything that can throw); click-economy in the **allocation phase**.

---

### Pitfall 12: Single-file entropy

**What goes wrong:**
The sibling artifacts are **709 and 391 lines**. An instrument with allocation, roster editing, a fight loop, a projection, encoding, and undo will land somewhere around **2,500–4,500 lines** — roughly 4–6× the largest existing course file. What breaks at that size is not the length; it is:

- **Silent drift between duplicated logic.** The default roster is defined in three places (initial render, reset, decode fallback) and they diverge. This is the #1 concrete failure of large single files.
- **CSS collisions.** There is no scoping. A class named `.row` written in the fight section restyles the allocation section.
- **Typo'd state keys fail silently.** No build, no linter, no types. `state.actionPoints` vs `state.actionpoints` is `undefined`, which renders as `NaN` or nothing, with no error.
- **Losing which function owns which DOM subtree**, which is how Pitfall 7 gets reintroduced late in the project.

The community consensus (e.g. the "single-file app architecture" discussions, HN threads on very large single files) is honest about the trade: single-file is *liberating for a tool you build once and maintain lightly* — "everything is in one place, you can Ctrl+F your way to anything" — and it is genuinely bad for team production code. This project is squarely in the first category, so the constraint is right; it just needs discipline.

**How to avoid — mitigations that actually work in practice:**
- **A table-of-contents comment at the top of the `<script>`**, listing sections in the order they appear, with stable grep tokens: `// [S01] CONSTANTS  [S02] STATE  [S03] ENCODE  …`. Then banner comments `/* ===== [S03] ENCODE ===== */`. Searching `[S03]` jumps you there in every editor. Cheap, and it is the mitigation people who do this repeatedly actually keep.
- **A fixed section order, enforced by habit:** constants → default state → state → encode/decode → derived/projection → render → event handlers → init. Never insert a helper next to its caller; put it in its section.
- **One `<style>`, one `<script>`, no exceptions.** Prefix every class with a section tag (`.alloc-row`, `.fight-row`) to fake scoping.
- **One state object, frozen defaults.** `const DEFAULTS = Object.freeze({...})`; all state derives from a deep clone of it. This kills the triplicated-defaults bug and gives reset and decode-fallback the same source of truth.
- **A dev self-check on load** (behind a flag or a `#dev` hash): round-trip the encoder, assert every key in `state` exists in `DEFAULTS`, assert no `NaN` in the rendered projection. Twenty lines that substitute for the type checker you gave up.
- **Section-per-phase discipline.** Each roadmap phase adds to its own sections rather than threading changes through the file. If a phase needs to edit three unrelated sections, that is a signal the state model was wrong.

**Warning signs:**
- The same magic number appears twice.
- A class name has no section prefix.
- You scroll to find something instead of searching.
- A phase's diff touches five separate regions of the file.

**Phase to address:** **Phase 1 sets the skeleton** — TOC comment, section banners, section order, `DEFAULTS` freeze, self-check. Every subsequent phase inherits it. Retrofitting structure into a 3,000-line file is the kind of task that never happens.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|---|---|---|---|
| `container.innerHTML = render(state)` on every change | Trivially simple; one code path | Dropped rapid clicks, focus loss, token flicker, animation restart — and it propagates into every later phase | **Never** for interactive regions. Fine for one-shot static regions (counter map, effect cards) that never re-render. |
| JSON + base64 for the share payload | Ten minutes to write; debuggable | Blows the Discord 2000-char limit on large rosters; failure is a file attachment, not an error | Only as a scaffold in phase 1, with a tracked task to replace it before the share phase completes |
| Skip undo, rely on "Reset to defaults" | Saves a day | Every student mistake in the workshop is unrecoverable; retrofitting undo means auditing every mutation site | Never — the undo stack is ~20 lines if the state object is decided first |
| Infer death from `hp === 0` | One less field | Makes students' Shield/Evade rulings unrepresentable, which contradicts the project's core thesis | Never |
| Mirror state into `location.hash` on every render | "URL always correct" | Blink throttles at 200 nav/10s; stale-link and history-spam bugs | Only with a ≥500 ms debounce, and only if browser-refresh persistence is actually wanted |
| Only Tier-1 clipboard (`navigator.clipboard`) | Works on the dev machine | Fails on unfocused document / DevTools open — i.e. exactly during the live demo — and fails silently | Never ship without Tier 3 (selectable pre-filled input) |
| `localStorage` autosave | Free persistence | Shared `file://` origin collides with sibling course artifacts; Safari throws; out of scope anyway | Only namespaced + `try/catch` + fully optional. Preferred answer: don't. |
| Decimal-precision projection | "More informative" | Manufactures false precision and feeds metric-gaming | Never |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|---|---|---|
| **Discord (paste the link)** | Assume browser URL limits are the constraint | Budget the whole URL under ~1,000 chars; remember the `file:///C:/Users/<name>/…` prefix is part of it and varies per student. Over 2000 chars, Discord converts the message to a `.txt` attachment. |
| **Discord (link rendering)** | Assume the raw URL renders clean | Discord's markdown/linkifier can swallow trailing punctuation and auto-embed. Restricting the payload to `[A-Za-z0-9._~-]` avoids the mangling classes; advise wrapping in `<…>` in the copy output if embeds are noisy. |
| **`file://` clipboard** | Assume it's blocked (it isn't) *or* assume it always works (it doesn't) | It's a secure context in all three engines and Chromium auto-grants the permission. Guard against unfocused-document rejection and lost user activation, and always ship Tier 3. |
| **`file://` History API** | Assume `replaceState` throws (it doesn't for hash-only) | Fragment/query changes are permitted on `file:` per spec and in Blink/Gecko; **path** changes are refused. Just don't call it 200×/10s. |
| **`file://` localStorage** | Assume per-file isolation | Chromium: all local files share the `file://` origin — namespace keys. Safari: throws `SecurityError`. Firefox: unique origins per `privacy.file_unique_origin`. Don't depend on it. |
| **`file://` module scripts / fetch** | `<script type="module">` or `fetch('./data.json')` | Both are blocked by CORS on `file://`. Classic `<script>`, everything inline. (This is already a stated constraint — the pitfall is a phase re-introducing it by habit.) |
| **Sibling course artifacts** | Copying their render pattern wholesale | They are *documents* (render once, 400–700 lines). This is an *instrument*. Share the design tokens, not the rendering architecture. |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|---|---|---|---|
| Full `innerHTML` re-render on interaction | Rapid stepper clicks undercount; focus ring vanishes; token rows flash | Structure/value render split; event delegation; never destroy the clicked node in its own handler | Immediately — at 9 units, not at 900 |
| `replaceState` in the render path | Console: "Throttling navigation…"; stale share links; SecurityError under newer Chromium flags | Serialize the URL only in the copy handler | 200 same-document navigations per 10 s (`kStateUpdateLimit`) |
| Layout thrash (read `offsetWidth` between DOM writes) | Visible stutter when resizing token rows | Batch reads before writes, or size tokens purely with CSS (flex-wrap) | Appears only once "fit tokens to panel width" logic is added |
| CSS transitions on wholesale-replaced token nodes | Every stepper press flashes the whole row; looks broken on a projector | Animate on enter/exit only; keep unchanged token nodes in place | Immediately, and it is a *legibility* bug more than a perf bug |
| Raw DOM node count | — | — | **Not a real risk here.** ~135 nodes for 9v3; ~1,000 for a 50-unit stress roster. Do not optimize for this. |
| Over-long URL | Copy "works", link is broken/invalid on paste | Character counter in the UI; positional encoding | Discord: 2,000 chars (hard). Chromium: 2 MB, and the failure is **silent** — Mojo replaces the URL with an invalid GURL. |

---

## Security Mistakes

Low surface area (no backend, no network, no accounts), but three domain-specific items:

| Mistake | Risk | Prevention |
|---|---|---|
| Rendering decoded URL state with `innerHTML` | A crafted link posted in the Discord thread injects script into a classmate's page. The payload is *untrusted input from a chat channel* — that is a genuine, if low-stakes, XSS vector. | Decode to integers only (indices into a fixed table of names/actions), never strings. Render text with `textContent`. If free-text names are ever added, escape them. |
| Trusting decoded values without range checks | `NaN`/negative/huge values produce a corrupt board or a hang (e.g. a loop rendering 2³¹ tokens) | Clamp every decoded integer to a declared min/max; hard-cap roster size; reject and show a banner on failure |
| `eval`/`Function` or `JSON.parse` on raw hash content | Same as above, worse | Never. Positional integer decode with explicit validation. |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---|---|---|
| Live-updating projection is the visual hero | Students optimize the number, skip the fight; the lesson inverts | Projection small and subordinate; **predicted-vs-actual** is the hero, post-fight |
| One shared balance meter with a midpoint | Teaches "balance = scalar equality," the exact misconception | Two independent per-side readings, in each side's own terms |
| Point estimate with decimals | False precision; students argue about noise | Range with `≈`, integers only, plus a permanent "this ignores:" list |
| Twelve clicks to set twelve health | Slow, error-prone, triggers dropped-click bug | Click-and-hold repeat, `Shift+click` = ±5, direct number entry |
| AP shown as a bare number | Spending is invisible; students lose track of the shared pool | Yellow triangle tokens that dim as spent, matching the board's vocabulary |
| Death inferred from `hp === 0` | Students' Shield/Evade rulings can't be recorded; they stop trusting the tool | Explicit `alive` flag; zero HP *prompts*, never auto-kills |
| No manual-override marker | Nobody can reconstruct the fight; the projection-vs-reality conversation has no evidence | Mark overridden values; keep an append-only turn log |
| Single "Reset" button | One misclick destroys a student's whole build mid-workshop | Three scopes (undo / reset fight / reset defaults), spatially separated, confirm on the destructive one |
| Auto-advancing the turn on AP exhaustion | Contradicts student adjudication (they may rule a different cost) | Explicit "End turn" is the only advance |
| Dark theme at document-sized type on a projector | Back rows can't read it; instructor narrates instead of demonstrating | Oversized base type; high-saturation tokens; one-click "present" toggle |
| Uncaught throw → black screen | Demo dies in front of the room | try/catch around init and handlers; visible error panel with a reset button |

---

## "Looks Done But Isn't" Checklist

- [ ] **Copy link:** works with the window *unfocused* and with *DevTools focused*; success toast fires only inside `.then()`; Tier 3 (pre-selected input + "Ctrl+C") reachable when `navigator.clipboard` is deleted.
- [ ] **Share URL:** character count visible; a maximum-size roster stays under ~1,000 chars; payload contains no `%`, `+`, `/`, `=`; version-prefixed; decode is range-checked and fails with a visible banner.
- [ ] **Round trip:** encode → decode → deep-equals original, tested with a *non-ASCII* character somewhere in the data, and tested **Chrome → Firefox and Firefox → Chrome** (the `location.hash` decoding asymmetry only shows up cross-browser).
- [ ] **Steppers:** clicking as fast as physically possible produces an exact count; focus ring survives; no text gets selected; token row does not flash.
- [ ] **Undo:** exists, bound to `Ctrl+Z`, has a visible button, and survives a fight turn.
- [ ] **Death:** a unit at 0 HP that the student ruled alive can be represented; revive works.
- [ ] **AP:** spent AP visible as tokens, not a number; turn does not auto-advance.
- [ ] **Defaults:** the shipped 9v3 board has been played to completion **twice** and is close, not a blowout.
- [ ] **Projection:** no decimals; shows a range; "this ignores:" list is always visible; no green/red verdict state anywhere; post-fight predicted-vs-actual is larger than the live projection.
- [ ] **Error boundary:** deliberately throw inside a handler → visible styled error panel with a reset, not a black screen.
- [ ] **Cold open:** double-clicked from a file manager on a machine that has never opened it, in Chrome *and* Firefox, offline, with no console open.
- [ ] **Projector check:** read at three metres, and at 1280×720; "present" toggle works.
- [ ] **File hygiene:** TOC comment present; every section banner has its grep token; `DEFAULTS` is frozen and is the only source of default state.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---|---|---|
| Projection became the verdict (discovered in workshop) | **HIGH** | Cannot be fixed with copy. Requires re-unitizing the projection to match the fight's output, adding the predicted-vs-actual pair, and demoting the live number. Prevent in the projection phase's design, not after. |
| Default 9v3 is a blowout | MEDIUM | Retune defaults and re-verify by playing. Cheap *if* defaults live in one frozen object; expensive if duplicated across init/reset/decode. |
| Share URL too long | MEDIUM | Replace JSON encoding with positional integer encoding; bump the version prefix so old links fail loudly. Contained if the encoder is one section. |
| Round-trip corruption found late | MEDIUM | Restrict alphabet to `[A-Za-z0-9._~-]`, bump version, add the round-trip self-check. Old shared links break — acceptable if versioned, disastrous if not. |
| Clipboard fails in the room | LOW *if* Tier 3 exists | Fall back to the selectable input; instructor says "select and Ctrl+C". Without Tier 3, cost is HIGH — the sharing step of the workshop simply doesn't happen. |
| Dropped stepper clicks | MEDIUM→HIGH | Convert to structure/value render split and event delegation. Cheap in phase 1, expensive across a finished app. |
| No undo, student destroys their build | HIGH (in the moment: unrecoverable) | Only mitigation without undo is "paste your last shared link" — which requires the student to have shared one. Another argument for making the copy-link action frequent and prominent. |
| Illegible on projector | LOW | Ship the "present" toggle; if absent, browser zoom is a workable emergency fallback (say so in a comment). |
| Single-file entropy | HIGH | Retro-structuring a 3,000-line file is a multi-day task nobody does. Set the skeleton in phase 1. |

---

## Pitfall-to-Phase Mapping

Phase names are descriptive placeholders for the roadmap to map onto.

| Pitfall | Prevention Phase | Verification |
|---|---|---|
| 1. Projection becomes the verdict | Projection phase (design decided during fight-loop phase) | No verdict/traffic-light state exists in the DOM; projection unit == fight output unit; predicted-vs-actual renders larger than the live number |
| 2. False precision | Projection phase | Zero decimals in projection markup; a range is always shown; "this ignores:" list is in the static DOM |
| 3. Clipboard fails live | Share/reset phase | Test matrix: 2 browsers × (focused / DevTools-focused / backgrounded) × Tier-3 forced |
| 4. URL exceeds Discord limit | State shape in phase 1; encoder + counter in share phase | Max-roster build measured; counter visible; stays under ~1,000 chars |
| 5. Round-trip corruption | Share phase (enabled by phase-1 "integers only" state) | Cross-browser round trip both directions; alphabet assertion in the self-check |
| 6. `replaceState` throttling / stale links | Phase 1 convention; verified in share phase | `replaceState` appears zero times inside render; copy handler re-serializes from state |
| 7. Full re-render / dropped clicks | **Phase 1 (allocation UI)** — architectural | Rapid-click count is exact; focus ring persists; no token flicker |
| 8. No undo / no way back | Phase 1 (undo stack) + fight phase (reset fight) + share phase (reset defaults) | `Ctrl+Z` works across allocation and fight; three reset scopes distinct; destructive one confirms |
| 9. Ambiguous bookkeeping state | Fight-loop phase (state model in phase 1) | Second person operates a full fight unnarrated without asking a question; log is readable afterwards |
| 10. Asymmetry lesson misfires (square law) | Fight-loop phase — **flag for dedicated playtest verification** | Default 9v3 played twice, both close; counter map visible during attack declaration; per-side projections independent |
| 11. Unusable live | Shell/UI phase (legibility, present toggle); phase 1 (error boundary) | Read at 3 m and at 1280×720; deliberate throw shows the error panel; cold double-click on a fresh machine |
| 12. Single-file entropy | **Phase 1 skeleton**, inherited by all | TOC + section tokens present; `DEFAULTS` frozen; no magic number appears twice; each phase's diff is section-local |

**Phases that need deeper research or dedicated verification:**
- **Fight-loop phase** — Pitfall 10 cannot be verified by code review. It needs actual play sessions of the shipped defaults. Budget for it explicitly.
- **Projection phase** — Pitfall 1 is the project's stated core risk ("Design tension worth preserving"). Its resolution is a *design* decision (choice of unit, choice of hierarchy), not an implementation detail, and it should be settled before code.
- **Share phase** — Pitfalls 3, 4, 5 are all cross-browser and all fail silently. This phase needs a real test matrix, not a smoke test.

**Phases unlikely to need research:** roster add/remove, counter-map and effect-card reference rendering, visual-token styling. These are standard patterns against a known design token set.

---

## Confidence Notes

| Claim | Confidence | Basis |
|---|---|---|
| `file:` is a potentially-trustworthy origin in Chromium, Gecko, WebKit | **HIGH** | Secure Contexts spec §3.1; Chromium `is_potentially_trustworthy_unittest.h`; Gecko `netwerk/build/components.conf`; WebKit `SecurityOrigin.cpp` |
| Chromium auto-allows sanitized clipboard write for any origin | **HIGH** | `clipboard_sanitized_write_permission_context.cc` returns `CONTENT_SETTING_ALLOW` |
| `replaceState` with hash-only change works on `file://` | **HIGH** | WHATWG HTML "can have its URL rewritten"; Blink `history_util.cc`; Gecko `Document::CanRewriteURL` |
| Blink throttles at 200 same-document navigations / 10 s | **HIGH** | `navigation_rate_limiter.cc`, `kStateUpdateLimit = 200` |
| Chromium max URL 2 MB; over-long URLs become invalid GURLs silently | **HIGH** | `url/url_constants.h`, `url/gurl.h` |
| `btoa` throws `InvalidCharacterError` above Latin-1 | **HIGH** | MDN `Window.btoa` |
| Discord: 2000 chars, over-limit becomes a file attachment | **MEDIUM** | Discord support docs (not the developer API reference, which omits the content limit) |
| Firefox percent-decodes `location.hash`, Chromium doesn't | **MEDIUM** | Bugzilla 378962 / 1213870 / 1093611; long-standing community reports. Behaviour may have narrowed since; treat as "must not depend on either behaviour." |
| Safari refuses `localStorage` on `file://` | **MEDIUM** | Apple Developer Forums, community reports; not verified in WebKit source |
| `document.execCommand('copy')` still functional, no removal scheduled | **MEDIUM** | MDN deprecation notice + mdn/content#40245 discussion of unreplaceable use cases; no engine removal intent found |
| Firefox ~65k / Safari ~80k URL limits | **LOW** | Secondary aggregator sites only; not load-bearing given the Discord constraint |
| Single-file maintainability thresholds | **LOW** | Community experience reports; inherently subjective. The *mitigations* are well-attested; the line-count numbers are estimates. |
| Pedagogical pitfalls (1, 2, 10, 11) | **MEDIUM** | Grounded in Goodhart's-law literature, Grosslight et al. 1991 on model epistemology, Hullman et al. on uncertainty visualization, Carpentries instructor training, Schreiber & Romero on cost curves and intransitivity, and Lanchester's laws as applied to game design. Not validated against trials of this specific artifact. |

---

## Sources

**Specifications**
- W3C Secure Contexts — "Is origin potentially trustworthy?" §3.1 — https://w3c.github.io/webappsec-secure-contexts/
- WHATWG HTML — Navigation and history APIs, "can have its URL rewritten" — https://html.spec.whatwg.org/multipage/nav-history-apis.html

**Browser source (verified directly)**
- Chromium `services/network/public/cpp/is_potentially_trustworthy_unittest.h` — `file:` URLs assert trustworthy
- Chromium `third_party/blink/renderer/core/frame/history_util.cc` — `CanChangeToUrlForHistoryApi`
- Chromium `third_party/blink/renderer/core/frame/navigation_rate_limiter.cc` — `kStateUpdateLimit = 200 / 10 s`
- Chromium `components/permissions/contexts/clipboard_sanitized_write_permission_context.cc`
- Chromium `url/url_constants.h`, `url/gurl.h` — `kMaxURLChars`, silent invalid-GURL note
- Gecko `netwerk/build/components.conf` — `file` handler with `URI_IS_POTENTIALLY_TRUSTWORTHY`
- Gecko `dom/base/Document.cpp` — `Document::CanRewriteURL`
- WebKit `Source/WebCore/page/SecurityOrigin.cpp` — `shouldTreatAsPotentiallyTrustworthy`

**Documentation**
- MDN — Clipboard API security considerations; `Clipboard.writeText()`; `Document.execCommand()`; `Window.btoa()`; Secure contexts
- Bugzilla 378962, 1213870, 1093611 — `location.hash` percent-decoding inconsistency
- Bugzilla 1500453 — file URIs as unique origins (`privacy.file_unique_origin`, Firefox 68+)
- mdn/content#40245 — `execCommand` has valid use cases without viable alternatives
- Discord Support — Sending Messages / character limits

**Pedagogy and design**
- Grosslight, Unger & Jay (1991), *Understanding models and their use in science*, J. Research in Science Teaching 28(9) — naïve-realist model epistemology
- Hullman et al. — uncertainty visualization; "when uncertainty is withheld, visualizations imply unrealistic precision"; hypothetical outcome plots
- The Carpentries, *Instructor Training: Live Coding is a Skill* — projector legibility, pace, recovery from mistakes
- Schreiber & Romero, *Game Balance* (Routledge) — ch. 8 Transitivity and Cost Curves; Schreiber, GDC 2016 *A Course About Game Balance*
- Adams, *The Designer's Notebook: Kicking Butt by the Numbers — Lanchester's Laws* (Game Developer); Lanchester's laws (Wikipedia) — square law, N² quality requirement
- Game Developer / Game-Wisdom, *The Never-ending Challenge of Asymmetrical Design*
- Goodhart's Law in education — metric substitution literature

---
*Pitfalls research for: single-file `file://` HTML game-balance teaching instrument*
*Researched: 2026-08-26*
