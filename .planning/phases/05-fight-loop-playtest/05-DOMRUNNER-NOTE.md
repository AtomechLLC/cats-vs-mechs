# The DOM runner, kept

**What exists now**

- `tests/stub-dom.cjs` — `makeStubDom()`, moved verbatim out of
  `tests/selftest-node.cjs` (lines 687–2362), plus the artifact read and the
  `<script>` body extractor. Node built-ins only. Exports, nothing else.
- `tests/selftest-dom.cjs` — new. Builds that page, evaluates the artifact
  against it, runs `App.selftest.run()`, prints every row and the counts.
- `tests/selftest-node.cjs` — unchanged except the require and three comments.

**What it reports today**

```
node tests/selftest-dom.cjs    1460 passed, 0 failed (stub DOM)   exit 0
node tests/selftest-node.cjs   1336 passed, 0 failed              exit 0
                               216 of 216 gate checks, 160 shell ids
```

The 124 rows between the two numbers are the whole point: five suites —
render, interactions, the board rows of token authoring, projection, reference
material — are bracketed `if (typeof document === 'undefined')` and report one
`skipped — no DOM` row each in the bare sandbox. Removing `document` from the
new runner's sandbox and re-running names exactly those five, which is how the
count was confirmed rather than assumed.

**Why**

At least five plans (03.1-01..05, and others since) each rebuilt the same
~70-line scratchpad script: read `selftest-node.cjs` as text, cut
`makeStubDom()` out with a regex, `vm`-eval the slice, drive the artifact.
Then threw it away. The shared module makes that an ordinary `require`.

**Three things the runner had to be told, each with a reason**

1. `MouseEvent` and `Event` constructors in the sandbox. `[S09.5]` and
   `[S09.6]` build their own events; without the names both suites throw, and
   a suite that throws **skips its own state restore**, so the board stays
   dirty and four later projection rows go red for a reason that is not theirs.
   Before: 1407/8. After: 1458/2.
2. **No `location` and no `history`.** Not an omission — `[S09.11]` says in
   its own comment that it runs "in a sandbox with no location and no history
   at all" and then asserts it in two rows. What the hash mirror *writes* is
   already driven in `selftest-node.cjs`'s interaction gate, which boots a
   second stub page from a prepared hash. 1458/2 → 1460/0.
3. `PointerEvent` deliberately left undefined, so the artifact's
   `typeof PointerEvent === 'function'` fallback arm gets exercised.

**Two gates of its own**, both probed by breaking them on purpose:
a skip gate (any suite taking its no-DOM branch fails the run — probed, named
all five) and a suite floor of 1400 against the measured 1460. A forced red row
was injected and the run exited 1.

**Not a browser.** No layout, no computed styles, no real event loop. Measured
boxes and derived colours still belong in `tests/browser-checks.mjs`.

**Refactor safety.** `node tests/selftest-node.cjs` was captured before and
after and diffed in full: identical but for two timing lines (`100 commits took
7 ms` → `8 ms`, boot-from-hash `19 ms` → `21 ms`). stderr byte-identical.
1336/0, 216/216, 160 shell ids, exit 0 — unmoved.

`cats-vs-mechs.html` was not touched. CLAUDE.md was left alone: it has no
section naming the runners, so there was nowhere trivial to put this.
