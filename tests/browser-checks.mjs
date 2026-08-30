// Browser checks — DEV ONLY. Not shipped. Not required by any other test.
//
// WHY THIS EXISTS
// ---------------
// tests/selftest-node.cjs runs the artifact's assertions against a hand-made stub DOM with no
// layout engine, no `navigator`, and no clipboard. That is the right shape for the gate: it is
// fast, dependency-free, and runs by `node` alone. But it leaves a class of claim it structurally
// cannot reach, and for three phases running this repo recorded those claims as "no browser in
// this environment" and deferred them to a human rehearsal.
//
// That premise was wrong. CLAUDE.md said so all along ("Playwright 1.62.1 ... Verified working:
// chromium.launch({ channel: 'chrome' }) + pathToFileURL()") and nobody re-tested it. Measured
// 2026-08-29: real Chrome AND real Edge both load the artifact from file://, report
// isSecureContext === true, and report permissions.query('clipboard-write') === "granted".
//
// So the tiers that had "never executed anywhere in this repository, in any browser, under any
// flag" — the phrase 04-06-SUMMARY.md used — can in fact be executed. This file executes them.
//
// WHAT THIS DOES *NOT* REPLACE
// ----------------------------
// Legibility from across a room, whether wording reads as helpful, whether a layout "feels"
// right, and anything on an actual projector. Those remain human items in .planning/REHEARSAL.md
// and no amount of automation substitutes for them. See CLAUDE.md § Gaps.
//
// RUNNING IT
//   cd tests && npm install playwright     # one time, dev-only, NEVER committed
//   node tests/browser-checks.mjs
//
// Playwright is NOT a dependency of this project and never should be — the artifact ships with
// zero, and `tests/` is not shipped at all. If Playwright cannot be resolved this file SKIPS
// CLEANLY with exit 0, so a fresh checkout is not a broken checkout and CI does not care.
// Set PLAYWRIGHT_DIR to point at an install somewhere else if you have one.
//
// Requires real Chrome and real Edge on the machine (channel: 'chrome' / 'msedge'). Bundled
// Chromium is a lower-fidelity target for file:// behaviour and is deliberately not used.

import { pathToFileURL } from 'url';
import { existsSync } from 'fs';
import path from 'path';

const ARTIFACT = path.resolve(import.meta.dirname, '..', 'cats-vs-mechs.html');
if (!existsSync(ARTIFACT)) { console.error('cannot find cats-vs-mechs.html'); process.exit(1); }
const URL_ = pathToFileURL(ARTIFACT).href;

async function loadPlaywright() {
  const tried = [];
  const candidates = ['playwright'];
  if (process.env.PLAYWRIGHT_DIR) candidates.push(pathToFileURL(path.join(process.env.PLAYWRIGHT_DIR, 'index.js')).href);
  candidates.push(pathToFileURL(path.join(import.meta.dirname, 'node_modules', 'playwright', 'index.js')).href);
  for (const c of candidates) {
    try {
      const mod = await import(c);
      // playwright's entry is CommonJS: a bare specifier gives named exports, but a file:// URL
      // import hands the whole module.exports back under .default. Accept either.
      const resolved = mod && mod.chromium ? mod : (mod && mod.default) || null;
      if (resolved && resolved.chromium) return resolved;
      tried.push(c + ' (no chromium export)');
    } catch (e) { tried.push(c); }
  }
  console.log('SKIP — playwright not resolvable. These checks are OPTIONAL; the gate is tests/selftest-node.cjs.');
  console.log('      To enable:  cd tests && npm install playwright');
  console.log('      Or set PLAYWRIGHT_DIR to an existing install.');
  console.log('      Looked in: ' + tried.join(', '));
  process.exit(0);
}
const { chromium } = await loadPlaywright();

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; console.log(`FAIL  ${name}\n      ${detail === undefined ? '' : JSON.stringify(detail)}`); }
};

async function open(channel, size) {
  // Headless by default (2026-08-29, developer request): headed runs pop real windows and
  // steal focus from whoever is working. Real Chrome/Edge support new headless, and the
  // clipboard cells still pass because the context grants clipboard-read/write explicitly —
  // CLAUDE.md's warning about headless clipboard denial applies only when permissions are NOT
  // granted. Set HEADED=1 to watch a run.
  const b = await chromium.launch({ channel, headless: process.env.HEADED !== '1' });
  const ctx = await b.newContext({
    viewport: size || { width: 1440, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write']
  });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e)));
  pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await pg.goto(URL_);
  await pg.waitForTimeout(500);
  return { b, pg, errs };
}

// openDialogs' recorded lesson, learned four separate times in this project: showModal()
// SCHEDULES NOTHING, so a fingerprint-keyed repaint never runs and every field reads empty or
// stale. invalidate THEN flush before harvesting anything from a surface opened this way.
async function openShare(pg) {
  await pg.evaluate(() => {
    const d = document.querySelector('#share');
    if (d && !d.open) d.showModal();
    App.state.invalidate();
    if (App.render.flush) App.render.flush();
  });
  await pg.waitForTimeout(350);
}
const shareCode = pg => pg.evaluate(() => {
  const c = document.querySelector('#share-code');
  return c ? (c.value !== undefined ? c.value : c.textContent) : '';
});

// ── 1. The page loads clean from file:// in both browsers ───────────────────────────────────
for (const ch of ['chrome', 'msedge']) {
  const { b, pg, errs } = await open(ch);
  const st = await pg.evaluate(() => ({
    app: typeof window.App !== 'undefined',
    secure: window.isSecureContext,
    clip: !!(navigator.clipboard && navigator.clipboard.writeText)
  }));
  ok(`${ch}: loads from file:// with no page error`, errs.length === 0, errs.slice(0, 2));
  ok(`${ch}: App present, secure context, clipboard API present`, st.app && st.secure && st.clip, st);
  await b.close();
}

// ── 2. The clipboard tiers, each in isolation, and the HONESTY of the line each one prints ──
// This is the check the whole exercise exists for. CLAUDE.md names the optimistic "Copied!"
// toast as an anti-pattern BY NAME: a silent clipboard failure means a student pastes stale
// content into Discord and only finds out when a classmate loads the wrong board.
//
// The OS clipboard is seeded with a sentinel first, so a copy that does NOT happen is
// detectable rather than invisible — without that, tier 3 "passes" by reading whatever the
// previous cell left behind.
for (const ch of ['chrome', 'msedge']) {
  for (const mode of ['tier1', 'tier2', 'tier3']) {
    const { b, pg } = await open(ch);
    await pg.evaluate(async () => { try { await navigator.clipboard.writeText('SENTINEL-NOT-OVERWRITTEN'); } catch {} });
    await openShare(pg);
    await pg.evaluate(m => {
      window.__realClip = navigator.clipboard;
      if (m === 'tier2' || m === 'tier3') { try { Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }); } catch {} }
      if (m === 'tier3') document.execCommand = () => false;
    }, mode);

    await pg.click('#share-copy', { timeout: 3000 }).catch(() => {});
    await pg.waitForTimeout(400);

    const said = await pg.evaluate(() => {
      const s = document.querySelector('#share-said');
      return { tier: s ? s.getAttribute('data-sh-tier') : null, line: s ? s.textContent.trim() : null };
    });
    const got = await pg.evaluate(async () => {
      try { Object.defineProperty(navigator, 'clipboard', { value: window.__realClip, configurable: true }); } catch {}
      try { return await navigator.clipboard.readText(); } catch (e) { return 'READ_FAILED:' + e.name; }
    });

    const expectTier = { tier1: 'clipboard', tier2: 'command', tier3: 'select' }[mode];
    const reallyCopied = String(got).startsWith('v1~');
    const claimedCopy = /copied/i.test(said.line || '');

    ok(`${ch} ${mode}: fires tier "${expectTier}"`, said.tier === expectTier, said);
    ok(`${ch} ${mode}: the line matches what actually happened`, claimedCopy === reallyCopied,
       { line: said.line, claimedCopy, reallyCopied, clipboard: String(got).slice(0, 24) });
    if (mode === 'tier3') {
      const sel = await pg.evaluate(() => String(window.getSelection() || ''));
      ok(`${ch} tier3: the code is left under the selection to press Ctrl+C on`, sel.startsWith('v1~'), sel.slice(0, 16));
      ok(`${ch} tier3: the clipboard was NOT silently written`, String(got) === 'SENTINEL-NOT-OVERWRITTEN', String(got).slice(0, 30));
    }
    await b.close();
  }
}

// ── 3. Cross-browser round trip, both directions, carrying a student-made token type ────────
// No check in tests/selftest-node.cjs can cross a process boundary, let alone a browser one.
async function trip(fromCh, toCh) {
  const A = await open(fromCh);
  await A.pg.evaluate(() => {
    const D = App.data;
    App.ops.dispatch('addUnit', { side: 'cats' });
    App.ops.dispatch('ap', { side: 'cats', value: 7 });
    App.ops.dispatch('createTokenType', { name: 'Grit', scope: D.TOKEN_SCOPES[0], shape: D.SHAPES[0], color: D.COLORS[0], glyph: D.GLYPHS[0] });
  });
  await A.pg.waitForTimeout(300);
  await openShare(A.pg);
  const code = await shareCode(A.pg);
  const buildA = await A.pg.evaluate(() => JSON.stringify(App.state.get().build));

  const B = await open(toCh);
  await B.pg.evaluate(c => App.ops.dispatch('loadBuildCode', { code: c }), code);
  await B.pg.waitForTimeout(300);
  const buildB = await B.pg.evaluate(() => JSON.stringify(App.state.get().build));
  await A.b.close(); await B.b.close();
  return { code, identical: buildA === buildB, buildA, buildB };
}
for (const [f, t] of [['chrome', 'msedge'], ['msedge', 'chrome']]) {
  const r = await trip(f, t);
  ok(`round trip ${f} -> ${t}: a non-default board with a student-made type is identical`,
     r.identical && r.code.length > 0, { codeLen: r.code.length, a: r.buildA.slice(0, 70), b: r.buildB.slice(0, 70) });
}


// ═══════════════════════════════════════════════════════════════════════════════════════════
// PLAN 05-16 — D-27's SURFACE, MEASURED IN TWO REAL BROWSERS AT TWO REAL SIZES
// ═══════════════════════════════════════════════════════════════════════════════════════════
//
// Four combinations, every reading taken in all four: Chrome and Edge, 1920x1080 and 1366x768.
// The block above this one is about the clipboard and the codec; this one is about LAYOUT and
// about presses, which is the class of claim tests/selftest-node.cjs structurally cannot reach
// — it has no layout engine, so a control below the fold and a control on screen read the same
// to it, and four consecutive plans in this phase each set a height dial against a page the
// next plan then changed.
//
// WHERE THE TWO BROWSERS DISAGREE, THAT DISAGREEMENT IS THE FINDING and is printed rather than
// averaged. Where a number has never been measured before it is RECORDED rather than asserted
// against a threshold nobody chose — the viewport fix's manner, and its own closing line's
// warning about undoing something nothing goes red over.

const SIZES = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1366x768', width: 1366, height: 768 }
];
const rec = [];               // every measured number, printed as a table at the end
const note = (browser, size, key, value) => {
  rec.push({ browser, size, key, value });
};

// The board ops, driven through the artifact's own exported ops rather than by clicking twenty
// Add buttons: this file is about LAYOUT and PRESSES, and building a 24-a-side roster by hand
// would be forty-two clicks of a control check 7 in the node gate already drives.
const toRoster = (pg, n) => pg.evaluate((want) => {
  ['cats', 'mechs'].forEach((side) => {
    let have = App.state.get().build[side].units.length;
    while (have > want) { App.ops.dispatch('removeUnit', { side, unitId: App.state.get().build[side].units[have - 1].id }); have--; }
    while (have < want) { App.ops.dispatch('addUnit', { side }); have++; }
  });
  App.state.invalidate();
  if (App.render.flush) App.render.flush();
}, n);

const startFight = async (pg) => { await pg.click('#fight-start'); await pg.waitForTimeout(250); };
// END the fight before re-rostering, and it is endFight rather than resetFight for a reason
// this file measured the hard way: resetFight puts the ROSTERS back and LEAVES THE FIGHT
// RUNNING, so #fight-start stays disabled and the next click waits thirty seconds for a
// control that is doing exactly what it should. A mid-fight addUnit also cannot move the fight
// roster at all — plan 05-15 recorded that — so the roster has to change with no fight on.
const endFight = async (pg) => {
  await pg.evaluate(() => {
    App.ops.endFight();
    App.state.invalidate();
    if (App.render.flush) App.render.flush();
  });
  await pg.waitForTimeout(200);
};
const box = (pg, sel) => pg.evaluate((s) => {
  const n = document.querySelector(s);
  if (!n) return null;
  const r = n.getBoundingClientRect();
  return { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height), bottom: Math.round(r.bottom) };
}, sel);

for (const ch of ['chrome', 'msedge']) {
  for (const size of SIZES) {
    const tag = `${ch} ${size.name}`;
    const { b, pg, errs } = await open(ch, { width: size.width, height: size.height });

    // ── 4. THE TAB. Two controls, both pressable, and the view follows each of them. ────────
    // Then the three regions the switch moves between are read for their LEFT and WIDTH: the
    // switch, the fight band and the board must occupy the same column, because a tab whose
    // panel is a different width from its sibling is a tab that looks like a different page.
    const tabAtRest = await pg.evaluate(() => document.querySelector('#app').dataset.view);
    await pg.click('#view-fight'); await pg.waitForTimeout(200);
    const tabOnFight = await pg.evaluate(() => document.querySelector('#app').dataset.view);
    await pg.click('#view-build'); await pg.waitForTimeout(200);
    const tabOnBuild = await pg.evaluate(() => document.querySelector('#app').dataset.view);
    ok(`${tag}: 4. the tab switches the view both ways`,
      tabAtRest === 'build' && tabOnFight === 'fight' && tabOnBuild === 'build',
      { tabAtRest, tabOnFight, tabOnBuild });

    await startFight(pg);
    const bViews = await box(pg, '#views');
    const bBand = await box(pg, '.fg-band');
    const bBoard = await box(pg, '#board');
    note(ch, size.name, '#views left/width', `${bViews.left}/${bViews.width}`);
    note(ch, size.name, '.fg-band left/width', `${bBand.left}/${bBand.width}`);
    note(ch, size.name, '#board left/width', `${bBoard.left}/${bBoard.width}`);
    ok(`${tag}: 4b. #views, .fg-band and #board share one column`,
      bViews.left === bBand.left && bBand.left === bBoard.left
      && bViews.width === bBand.width && bBand.width === bBoard.width,
      { bViews, bBand, bBoard });

    /* ── 4c. D-28's FIRST SENTENCE, MEASURED: "let the fight take the whole width".
       ==================================================================
       THIS CELL'S CLAIM WAS TURNED BY D-28 AND THE OLD ONE IS WRITTEN OUT.
       ==================================================================
       Plan 05-16's check 4b asserted that the switch, the band and the board share
       one column, and it still does and still passes — the band is the frame and the
       frame did not move. What NOBODY was asserting was the split INSIDE the band,
       and that is the thing D-28 changed: #fightbar was 736px of a 1600px band with
       #ledger beside it, so the fight was 46% of the width it had.

       So this cell asserts the new claim rather than the old one: #fightbar and
       #ledger are each the FULL width of the band, and the ledger's box is ABOVE the
       bar's. Both are read as measured geometry, not as DOM order — the whole reason
       a check like this exists is that `order:-1` and `flex-direction:column-reverse`
       both satisfy every DOM-order assertion in this repository while putting the
       page on screen the other way up. */
    const bBar = await box(pg, '#fightbar');
    const bLedger = await box(pg, '#ledger');
    note(ch, size.name, '#fightbar left/width', `${bBar.left}/${bBar.width}`);
    note(ch, size.name, '#ledger left/width', `${bLedger.left}/${bLedger.width}`);
    note(ch, size.name, '#ledger bottom vs #fightbar top', `${bLedger.bottom} / ${bBar.top}`);
    ok(`${tag}: 4c. the fight takes the WHOLE width of the band and the ledger is a full-width lane ABOVE it`,
      bBar.width === bBand.width && bLedger.width === bBand.width
      && bBar.left === bBand.left && bLedger.left === bBand.left
      && bLedger.bottom <= bBar.top,
      { bBand, bBar, bLedger });

    // ── 5. THE GRID LAYS OUT IN THE ADDENDUM'S ORDER, verified by comparing each child's
    // measured TOP rather than by reading the DOM order — the DOM order is [S06.7]'s five
    // appends and a check that read it would be asserting the code against itself. What a
    // room sees is the layout, and flex, order and grid-row can all put a correct DOM order
    // on screen upside down.
    const order = await pg.evaluate(() => {
      const out = {};
      ['cats', 'mechs'].forEach((side) => {
        const root = document.querySelector('#decl-' + side);
        const t = (sel) => {
          const n = root.querySelector(sel);
          return n ? Math.round(n.getBoundingClientRect().top) : null;
        };
        out[side] = { head: t('.fg-side-head'), field: t('.fg-field'), team: t('.fg-team'), rows: t('.fg-rows') };
      });
      const rh = document.querySelector('.fg-round-head');
      out.round = rh ? Math.round(rh.getBoundingClientRect().top) : null;
      out.colTops = ['cats', 'mechs'].map((s) => Math.round(document.querySelector('#decl-' + s).getBoundingClientRect().top));
      out.colLefts = ['cats', 'mechs'].map((s) => Math.round(document.querySelector('#decl-' + s).getBoundingClientRect().left));
      return out;
    });
    const inOrder = (o) => o.head <= o.field && o.field <= o.team && o.team <= o.rows;
    note(ch, size.name, 'cats column tops head/field/team/rows',
      `${order.cats.head}/${order.cats.field}/${order.cats.team}/${order.cats.rows}`);
    note(ch, size.name, 'mechs column tops head/field/team/rows',
      `${order.mechs.head}/${order.mechs.field}/${order.mechs.team}/${order.mechs.rows}`);
    ok(`${tag}: 5. each column reads SIDE -> battlefield -> team resources -> picker rows, measured`,
      inOrder(order.cats) && inOrder(order.mechs), order);
    ok(`${tag}: 5b. [ROUND] spans ABOVE both columns and the two columns are SIDE BY SIDE`,
      order.round !== null && order.round < order.colTops[0] && order.round < order.colTops[1]
      && order.colTops[0] === order.colTops[1] && order.colLefts[0] < order.colLefts[1],
      order);

    // ── 6. ONE PICKER ROW PER UNIT, units x actions BUTTONS, AND THE GRID'S BOX. Counted on
    // the shipped 9-and-3 board and again at 24 a side, because a grid is a PRODUCT and the
    // question a projector asks is what it does at the top of that product.
    const gridOn = async (label) => {
      const g = await pg.evaluate(() => {
        const st = App.state.get();
        const per = (side) => {
          const root = document.querySelector('#decl-' + side);
          return {
            rows: root.querySelectorAll('.fg-row').length,
            units: st.fight[side].units.length,
            actions: st.build[side].actions.length,
            buttons: root.querySelectorAll('[data-fg="act"]').length
          };
        };
        const sides = document.querySelector('.fg-sides').getBoundingClientRect();
        return {
          cats: per('cats'), mechs: per('mechs'),
          sidesBox: { top: Math.round(sides.top), bottom: Math.round(sides.bottom), height: Math.round(sides.height) },
          viewportH: window.innerHeight
        };
      });
      note(ch, size.name, `grid ${label} rows cats/mechs`, `${g.cats.rows}/${g.mechs.rows}`);
      note(ch, size.name, `grid ${label} buttons cats/mechs`, `${g.cats.buttons}/${g.mechs.buttons}`);
      note(ch, size.name, `grid ${label} .fg-sides top/height/bottom vs viewport`,
        `${g.sidesBox.top}/${g.sidesBox.height}/${g.sidesBox.bottom} of ${g.viewportH}`);
      ok(`${tag}: 6. ${label} — one picker row per unit and units x actions buttons`,
        g.cats.rows === g.cats.units && g.mechs.rows === g.mechs.units
        && g.cats.buttons === g.cats.units * g.cats.actions
        && g.mechs.buttons === g.mechs.units * g.mechs.actions, g);
      /* ==================================================================
         6b's CLAIM WAS TURNED BY D-28 AND THE OLD ONE IS WRITTEN OUT.
         ==================================================================
         WHAT IT ASSERTED (plan 05-16): the grid's own box is INSIDE the viewport,
         top >= 0 and bottom <= viewport height. True at both sizes when the ledger
         sat beside the fight bar and cost the page no height at all.

         WHAT D-28 SAYS: "earlier rounds should be a full lane above". A lane above
         costs height where a column beside cost none, and the measurement is the
         claim rather than an argument about it — three rounds resolved, twelve
         declarations a round, identical in Chrome and Edge:

           .fg-sides box        @1920x1080      @1366x768
             before D-28          415/281/696     407/200/607
             after  D-28          714/346/1060    614/246/860

         So at 1080 the box still ends inside the fold, and at 768 it does not: it
         BEGINS at 614 of 768 and its last 92px are one page scroll away. Shrinking
         the bound until 768 fitted would need 20vh — LESS than the 26vh plan 05-16
         measured as the minimum useful window — on the tab whose developer's own
         complaint is that it is too compressed.

         WHAT IT ASSERTS NOW, in three clauses that hold at every size and are each
         a different failure: the box BEGINS on screen (a grid whose top is below
         the fold is a grid a room does not know is there); it has a real box; and
         it can be brought WHOLLY into view by scrolling the page, which is driven
         rather than reasoned about — the page is scrolled and the box re-read. The
         numbers themselves are RECORDED rather than thresholded, which is check 9's
         rule in this same file and the viewport fix's before it.

         AND THE CONTROL THAT ENDS THE ROUND IS NOT PART OF THIS TRADE. It is above
         the fold at both sizes with three rounds in the lane, it is check 18's
         claim, and it is asserted rather than recorded — which is the whole
         difference between a region a room scrolls and a button a room cannot find. */
      /* THE SCROLL IS AWAITED AND NOT ASSUMED, and it took a red run to write that
         down. [C01] sets html{scroll-behavior:smooth}, so window.scrollTo STARTS an
         animation and returns; a synchronous getBoundingClientRect immediately after
         it reads the box where it was BEFORE the scroll. Measured: asked for 28,
         window.scrollY read back 0 and the box had not moved a pixel, on a document
         1058px tall with 290px of scroll available. It is openDialogs' recorded
         lesson — do the thing, then ASK for the frame, then wait, then read —
         arriving through a sixth door, and check 10's own stops already wait 80ms
         each for exactly this reason. `behavior: 'instant'` would also work and is
         deliberately not used: waiting is what a room does. */
      const reach = await pg.evaluate(async () => {
        const n = document.querySelector('.fg-sides');
        const before = Math.round(n.getBoundingClientRect().bottom);
        const want = Math.max(0, window.scrollY + before - window.innerHeight + 8);
        window.scrollTo(0, want);
        await new Promise((r) => setTimeout(r, 400));
        const r = n.getBoundingClientRect();
        const out = { asked: Math.round(want), got: Math.round(window.scrollY),
          top: Math.round(r.top), bottom: Math.round(r.bottom), vh: window.innerHeight,
          maxScroll: Math.round(document.scrollingElement.scrollHeight - window.innerHeight) };
        window.scrollTo(0, 0);
        await new Promise((r2) => setTimeout(r2, 400));
        return out;
      });
      note(ch, size.name, `grid ${label} .fg-sides whole in view after a page scroll`,
        `top ${reach.top} bottom ${reach.bottom} of ${reach.vh} at scrollY ${reach.got}`);
      ok(`${tag}: 6b. ${label} — the grid's box BEGINS on screen and can be brought wholly into view by scrolling the page`,
        g.sidesBox.top >= 0 && g.sidesBox.top < g.viewportH && g.sidesBox.height > 0
        && reach.top >= 0 && reach.bottom <= reach.vh, { g, reach });
      return g;
    };
    await gridOn('9-and-3');

    // ── 7. THE BATTLEFIELD'S GEOMETRY. Two clusters, one per column, and "left" is MEASURED
    // rather than assumed — the addendum says Cats on the left and Mechs on the right, and a
    // flex-direction:row-reverse anywhere above would satisfy every DOM-order check in this
    // repository while putting them the other way round on screen.
    const bfOn = async (label) => {
      const f = await pg.evaluate(() => {
        const st = App.state.get();
        const per = (side) => {
          const field = document.querySelector('#decl-' + side + ' .fg-field');
          const fr = field.getBoundingClientRect();
          const shapes = Array.from(field.querySelectorAll('.bf-unit'));
          const named = shapes.filter((s) => {
            const n = s.querySelector('.bf-name');
            return n && n.textContent.trim() !== '';
          }).length;
          const zero = shapes.filter((s) => {
            const r = s.getBoundingClientRect();
            return r.width === 0 || r.height === 0;
          }).length;
          return {
            left: Math.round(fr.left), top: Math.round(fr.top), height: Math.round(fr.height),
            shapes: shapes.length, named, zeroBoxes: zero, roster: st.fight[side].units.length
          };
        };
        // The token mini-shapes: a real box, and a real clip-path for a shape that is not a
        // plain square. That last is what says they are CSS SHAPES rather than divs with a
        // colour on them, which is the claim the addendum actually makes.
        const toks = Array.from(document.querySelectorAll('#decl-cats .fg-field .tok'));
        const withS = toks.map((t) => {
          const s = t.querySelector('.tok-s');
          if (!s) return null;
          const r = s.getBoundingClientRect();
          return { cls: t.className, w: Math.round(r.width), h: Math.round(r.height), clip: getComputedStyle(s).clipPath };
        }).filter(Boolean);
        return { cats: per('cats'), mechs: per('mechs'), toks: withS };
      });
      note(ch, size.name, `battlefield ${label} cluster heights cats/mechs`, `${f.cats.height}/${f.mechs.height}`);
      note(ch, size.name, `battlefield ${label} cluster lefts cats/mechs`, `${f.cats.left}/${f.mechs.left}`);
      note(ch, size.name, `battlefield ${label} shapes cats/mechs`, `${f.cats.shapes}/${f.mechs.shapes}`);
      ok(`${tag}: 7. ${label} — one labelled shape per unit, per side, every box non-zero`,
        f.cats.shapes === f.cats.roster && f.mechs.shapes === f.mechs.roster
        && f.cats.named === f.cats.shapes && f.mechs.named === f.mechs.shapes
        && f.cats.zeroBoxes === 0 && f.mechs.zeroBoxes === 0, f);
      ok(`${tag}: 7b. ${label} — the Cats cluster is LEFT of the Mechs cluster, measured`,
        f.cats.left < f.mechs.left, { catsLeft: f.cats.left, mechsLeft: f.mechs.left });
      const nonSquare = f.toks.filter((t) => !/tok--sq\b/.test(t.cls));
      const clipped = nonSquare.filter((t) => t.clip && t.clip !== 'none');
      const sized = f.toks.filter((t) => t.w > 0 && t.h > 0);
      note(ch, size.name, `battlefield ${label} token nodes / non-square / clipped`,
        `${f.toks.length}/${nonSquare.length}/${clipped.length}`);
      // THE SHIPPED BOARD DRAWS EVERY TYPE AS A SQUARE, WHICH IS WHY THIS CLAUSE IS SPLIT.
      // Measured here on the first run: all four health tokens read `tok tok--sq tok--green`
      // with clip-path `none`, and a square legitimately needs no clip-path. So the box claim
      // is unconditional and the clip-path claim is asserted over whatever non-square tokens
      // the board happens to carry — which is none on the shipped one. Check 7d RESTYLES a
      // shipped type to a hexagon through the real op so the claim is exercised rather than
      // vacuous, and check 15 takes it again on a type a student invented.
      ok(`${tag}: 7c. ${label} — every token mini-shape has a real box, and every non-square one a real clip-path`,
        f.toks.length > 0 && sized.length === f.toks.length
        && clipped.length === nonSquare.length,
        { toks: f.toks.slice(0, 4), nonSquare: nonSquare.length, clipped: clipped.length });
      return f;
    };
    await bfOn('9-and-3');

    // ── 7d. AND THEY REALLY ARE CSS SHAPES, driven through the real restyle op rather than
    // asserted about. The shipped board draws every type as a square, so nothing above can
    // tell a clip-path from a border-radius; this restyles Health to a hexagon, reads the
    // computed clip-path off the battlefield's own token node, and puts it back.
    // THE REPAINT IS AWAITED BETWEEN THE OP AND THE READING, and it took a red run to write
    // that down: doing the restyle, the invalidate, the flush and the read inside ONE
    // synchronous evaluate read the node as it stood BEFORE the frame landed — `tok--sq`
    // with clip-path `none`, on a board that had just been told to draw a hexagon. It is
    // openDialogs' recorded lesson arriving through a fifth door: drive the real op, then
    // ASK for the frame, then wait for it, then read.
    const readTok = () => pg.evaluate(() => {
      const t = document.querySelector('#decl-cats .fg-field .tok');
      const s = t ? t.querySelector('.tok-s') : null;
      return {
        cls: t ? t.className : null,
        clip: s ? getComputedStyle(s).clipPath : null,
        w: s ? Math.round(s.getBoundingClientRect().width) : 0
      };
    });
    const restyle = async (shape) => {
      await pg.evaluate((sh) => {
        App.ops.setTokenStyle('hp', { shape: sh });
        App.state.invalidate();
        if (App.state.flush) App.state.flush();
      }, shape);
      await pg.waitForTimeout(250);
    };
    await restyle('hex');
    const shapedHex = await readTok();
    await restyle('sq');
    const shapedBack = await readTok();
    const shaped = {
      cls: shapedHex.cls, clip: shapedHex.clip, w: shapedHex.w,
      backCls: shapedBack.cls, backClip: shapedBack.clip
    };
    note(ch, size.name, 'battlefield token as a hexagon', String(shaped.clip).slice(0, 40));
    ok(`${tag}: 7d. a restyled token on the battlefield really is a CSS clip-path, and it goes back`,
      /tok--hex/.test(shaped.cls || '') && /polygon\(/.test(shaped.clip || '')
      && shaped.w > 0 && /tok--sq/.test(shaped.backCls || '') && shaped.backClip === 'none',
      shaped);

    // ── 8. A UNIT RULED DEAD STAYS DRAWN. FIGHT-06 measured rather than asserted: rule it
    // through the board tab's own toggle, switch back, and read the battlefield.
    await pg.click('#view-build'); await pg.waitForTimeout(150);
    await pg.click('[data-dc="alive"][data-dc-side="cats"][data-dc-unit="c1"]');
    await pg.waitForTimeout(200);
    await pg.click('#view-fight'); await pg.waitForTimeout(250);
    const dead = await pg.evaluate(() => {
      const s = document.querySelector('#decl-cats [data-fg="bf"][data-fg-val="c1"]');
      if (!s) return { drawn: false };
      const r = s.getBoundingClientRect();
      const said = s.querySelector('.bf-said');
      const marker = s.querySelector('.bf-line[data-bf-amt="dead"]');
      return {
        drawn: true, w: Math.round(r.width), h: Math.round(r.height),
        cls: s.className,
        markerShown: !!marker && !marker.hidden,
        saidShown: !!said && !said.hidden, says: said ? said.textContent : null,
        alive: App.state.get().fight.cats.units[0].alive
      };
    });
    note(ch, size.name, 'dead shape box', `${dead.w}x${dead.h}`);
    ok(`${tag}: 8. a unit ruled dead is STILL DRAWN on the battlefield, marked, with its box intact`,
      dead.drawn === true && dead.w > 0 && dead.h > 0 && dead.alive === false
      && /bf-unit--dead/.test(dead.cls) && dead.markerShown === true
      && dead.saidShown === true && (dead.says || '').trim() !== '', dead);
    await pg.click('#view-build'); await pg.waitForTimeout(150);
    await pg.click('[data-dc="alive"][data-dc-side="cats"][data-dc-unit="c1"]');
    await pg.waitForTimeout(200);
    await pg.click('#view-fight'); await pg.waitForTimeout(200);

    // ── 9. THE LIVE BOARD IS REACHABLE MID-FIGHT. The number is RECORDED rather than
    // compared against a threshold nobody chose — that is the viewport fix's own rule, and
    // the whole reason entry 21 was rewritten instead of ticked.
    await pg.click('#view-build'); await pg.waitForTimeout(200);
    const boardMid = await box(pg, '#board');
    note(ch, size.name, '#board top mid-fight (board view)', `${boardMid.top} of ${size.height}`);
    ok(`${tag}: 9. #board is on the page mid-fight and has a real box`,
      boardMid.height > 0 && boardMid.width > 0, boardMid);

    /* ── 10. #strip STILL PINS, IN BOTH VIEWS. Entry 20's exact shape: position, every
       ancestor's overflow, and the viewport top at four page-scroll offsets. An overflow on an
       ancestor takes sticking away SILENTLY — no error, no warning — which is the one failure
       in this file that arrives with nothing on screen to say so, and probe V and probe AA
       both left the whole node gate spotlessly green over it.

       THE SETTLING CLAUSE IS WRITTEN AGAINST THE SCROLL THAT ACTUALLY HAPPENED, and that is a
       correction this check needed on its first run. Asking for scrollTop 2400 on a page whose
       whole scrollable height is a few hundred pixels does not scroll to 2400; it clamps, and
       four readings taken at four requested offsets that were all the same CLAMPED offset look
       like a strip that never settles. So scrollY is read back at each stop and printed beside
       the top. What is ASSERTED is the pair of claims that hold at any page length: the strip
       is sticky with every ancestor's overflow visible, and it is never pushed off the top of
       the window at any offset the page can actually reach. The four numbers themselves are
       RECORDED rather than compared against a threshold nobody chose — which is the viewport
       fix's own rule, and the reason limitations entry 21 was rewritten instead of ticked. */
    /* ==================================================================
       10's SCOPE WAS TURNED BY D-28 AND THE OLD CLAIM IS WRITTEN OUT.
       ==================================================================
       WHAT IT ASSERTED: #strip is sticky with every ancestor's overflow visible
       and never leaves the top of the window, IN BOTH VIEWS.

       WHAT D-28 SAYS: "The predictor turn off, and make it toggled sidebar /
       pop over". In the fight view the projection is NOT DISPLAYED at all until
       a student presses for it, so "it is sticky in the fight view" is a claim
       about a box that has no layout — and it is exactly the shape of claim
       that stays GREEN over the change, which is why it is turned rather than
       left running. getComputedStyle on a display:none element still reports
       position `sticky` and getBoundingClientRect still reports zeros, and
       zeros satisfy `top >= 0`. This cell would have passed, in both browsers,
       at both sizes, over a projection that had left the page.

       SO THE LOOP RUNS OVER THE BUILD VIEW ONLY, where the claim is unchanged
       and still exactly what PROJ-05 and [C03]'s sticky gotcha need. The fight
       view's projection is check 10c's, below, which asserts the state D-28
       actually shipped: undisplayed by default, a real fixed box after ONE
       real click, and undisplayed again after a second. */
    for (const view of ['build']) {
      await pg.click('#view-' + view); await pg.waitForTimeout(200);
      const pin = await pg.evaluate(async () => {
        const strip = document.querySelector('#strip');
        const pos = getComputedStyle(strip).position;
        const bad = [];
        for (let n = strip.parentElement; n; n = n.parentElement) {
          const o = getComputedStyle(n);
          if (o.overflow !== 'visible' || o.overflowX !== 'visible' || o.overflowY !== 'visible') {
            bad.push((n.id || n.className || n.tagName) + ':' + o.overflow);
          }
        }
        const stops = [];
        for (const y of [0, 800, 1600, 2400]) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 80));
          stops.push({
            asked: y, got: Math.round(window.scrollY),
            top: Math.round(document.querySelector('#strip').getBoundingClientRect().top)
          });
        }
        const maxScroll = Math.round(document.scrollingElement.scrollHeight - window.innerHeight);
        window.scrollTo(0, 0);
        const rb = document.querySelector('#refband').getBoundingClientRect();
        return { pos, bad, stops, maxScroll, refband: { w: Math.round(rb.width), h: Math.round(rb.height) } };
      });
      note(ch, size.name, `#strip top @scroll 0/800/1600/2400 (${view})`,
        pin.stops.map((s) => s.top).join(' / '));
      note(ch, size.name, `scrollY actually reached (${view})`,
        pin.stops.map((s) => s.got).join(' / ') + ' max ' + pin.maxScroll);
      note(ch, size.name, `#refband box (${view} view)`, `${pin.refband.w}x${pin.refband.h}`);
      // The settling claim, written against the scroll that happened: any two stops that
      // reached the SAME scroll offset must report the same top.
      const inconsistent = pin.stops.filter((a) =>
        pin.stops.some((b) => a.got === b.got && a.top !== b.top));
      ok(`${tag}: 10. #strip is sticky, every ancestor overflow is visible, and it never leaves the top of the window (${view} view)`,
        pin.pos === 'sticky' && pin.bad.length === 0
        && pin.stops.every((s) => s.top >= 0)
        && inconsistent.length === 0, pin);
      ok(`${tag}: 10b. #refband has a real box in the ${view} view`,
        pin.refband.w > 0 && pin.refband.h > 0, pin.refband);
    }

    /* ── 10c. D-28's PROJECTION SIDEBAR, OPENED AND CLOSED BY REAL CLICKS. This is
       PROJ-05's new reading and the cell that replaces 10's fight-view half.

       FOUR THINGS ARE READ AND NOT ONE OF THEM IS A CLASS NAME. Whether the panel
       is DISPLAYED, whether its box is real and inside the window, what it SAYS,
       and whether what it says is CURRENT — the last is driven by moving the pool
       the projection is derived from through a real op and reading the panel again.
       A sidebar built as a second panel carrying a copy of the figures would pass
       every other clause here and stand still on that one, and [C15]'s own rule is
       that this must be "the same projection, not a second one that happens to
       carry the same words".

       AND #refband IS READ IN THE FIGHT VIEW BESIDE IT, because REF-03 is NOT part
       of D-28 and a change that quietly took the reference band with the projection
       would be a requirement lost to a rearrangement. */
    await pg.click('#view-fight'); await pg.waitForTimeout(200);
    const projClosed = await pg.evaluate(() => {
      const s = document.querySelector('#strip');
      const rb = document.querySelector('#refband').getBoundingClientRect();
      return {
        proj: document.querySelector('#app').dataset.proj || '',
        display: getComputedStyle(s).display,
        expanded: document.querySelector('#proj-toggle').getAttribute('aria-expanded'),
        toggleBox: (() => { const r = document.querySelector('#proj-toggle').getBoundingClientRect();
          return { top: Math.round(r.top), h: Math.round(r.height), w: Math.round(r.width) }; })(),
        refband: { w: Math.round(rb.width), h: Math.round(rb.height) }
      };
    });
    await pg.click('#proj-toggle'); await pg.waitForTimeout(250);
    const projOpen = await pg.evaluate(() => {
      const s = document.querySelector('#strip');
      const cs = getComputedStyle(s);
      const r = s.getBoundingClientRect();
      const leaves = [];
      (function w(n) { if (!n) return; if (n.children.length === 0 && n.textContent) leaves.push(n.textContent); Array.from(n.children).forEach(w); })(s);
      return {
        proj: document.querySelector('#app').dataset.proj || '',
        display: cs.display, position: cs.position, z: cs.zIndex,
        box: { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom) },
        inWindow: r.top >= 0 && r.left >= 0 && r.right <= window.innerWidth + 1 && r.bottom <= window.innerHeight + 1,
        leaves: leaves.length, says: leaves.join(' | '),
        expanded: document.querySelector('#proj-toggle').getAttribute('aria-expanded'),
        pressed: document.querySelector('#proj-toggle').getAttribute('aria-pressed'),
        tick: getComputedStyle(document.querySelector('#proj-toggle .pv-check')).visibility
      };
    });
    // The figures moved through a real op, then the panel read again.
    await pg.evaluate(() => {
      App.ops.setFactionAp('cats', 9);
      App.state.invalidate();
      if (App.render.flush) App.render.flush();
    });
    await pg.waitForTimeout(250);
    const projMoved = await pg.evaluate(() => {
      const leaves = [];
      (function w(n) { if (!n) return; if (n.children.length === 0 && n.textContent) leaves.push(n.textContent); Array.from(n.children).forEach(w); })(document.querySelector('#strip'));
      return leaves.join(' | ');
    });
    await pg.evaluate(() => { App.ops.setFactionAp('cats', 3); App.state.invalidate(); if (App.render.flush) App.render.flush(); });
    await pg.waitForTimeout(200);
    await pg.click('#proj-toggle'); await pg.waitForTimeout(250);
    const projShut = await pg.evaluate(() => ({
      proj: document.querySelector('#app').dataset.proj || '',
      display: getComputedStyle(document.querySelector('#strip')).display,
      expanded: document.querySelector('#proj-toggle').getAttribute('aria-expanded'),
      tick: getComputedStyle(document.querySelector('#proj-toggle .pv-check')).visibility
    }));
    note(ch, size.name, '#strip display, fight view closed -> open -> closed',
      `${projClosed.display} -> ${projOpen.display} -> ${projShut.display}`);
    note(ch, size.name, 'the sidebar box when open',
      `${projOpen.box.left},${projOpen.box.top} ${projOpen.box.w}x${projOpen.box.h} ${projOpen.position} z${projOpen.z}`);
    note(ch, size.name, 'the sidebar reads', String(projOpen.says).slice(0, 46));
    ok(`${tag}: 10c. the projection is OFF in the fight view and comes back as a real fixed sidebar on ONE click, and goes away on a second`,
      projClosed.display === 'none' && projClosed.proj === '' && projClosed.expanded === 'false'
      && projClosed.toggleBox.h > 0 && projClosed.toggleBox.w > 0
      && projOpen.display !== 'none' && projOpen.proj === '1'
      && projOpen.position === 'fixed' && projOpen.box.w > 0 && projOpen.box.h > 0
      && projOpen.inWindow === true && projOpen.leaves > 0
      && projOpen.expanded === 'true' && projOpen.pressed === 'true'
      && projOpen.tick === 'visible'
      && projShut.display === 'none' && projShut.proj === '' && projShut.expanded === 'false'
      && projShut.tick === 'hidden',
      { projClosed, projOpen, projShut });
    ok(`${tag}: 10d. what the sidebar says is CURRENT — it moves when a real op moves the pool it is derived from`,
      projOpen.says.length > 0 && projMoved.length > 0 && projMoved !== projOpen.says,
      { was: projOpen.says.slice(0, 80), now: projMoved.slice(0, 80) });
    ok(`${tag}: 10e. #refband still has a real box in the fight view — REF-03 did not go with the projection`,
      projClosed.refband.w > 0 && projClosed.refband.h > 0, projClosed.refband);

    // ── 11. A FULL ROUND BY REAL CLICKS. One untargeted declaration, one target-directed
    // one, each in a SINGLE press; the team resources read before and after each; Advance;
    // the round and the ledger read back.
    await pg.click('#view-fight'); await pg.waitForTimeout(200);
    /* THE PAGE IS SETTLED BEFORE THE FIRST REAL CLICK ON A CONTROL INSIDE A
       SCROLLER, and this line is here because of a MEASURED red run rather than
       out of caution. [C01] sets html{scroll-behavior:smooth}; Playwright's click
       scrolls its target into view first, that scroll ANIMATES, and Playwright
       then waits for the element to be "stable" — the same box across two
       animation frames — which a smoothly moving element never is. Measured:
       Edge at 1366x768, after the checks above had scrolled the page, timed out
       after 58 stability retries on a button that was on the screen the whole
       time. Chrome at either size and Edge at 1920x1080 never reproduced it, so
       this is one browser at one size and it is exactly the kind of flake that
       gets "fixed" by deleting a check. Put the page back at the top, wait for
       the animation to finish, then click. */
    await pg.evaluate(() => window.scrollTo(0, 0));
    await pg.waitForTimeout(700);
    const teamOf = (side) => pg.evaluate((s) => {
      const t = document.querySelector('#decl-' + s + ' .fg-team');
      return t ? t.textContent.replace(/\s+/g, ' ').trim() : null;
    }, side);
    const pickIds = await pg.evaluate(() => {
      const st = App.state.get();
      const untargeted = st.build.cats.actions.filter((a) => !App.model.needsAt(a))[0];
      const targeted = st.build.mechs.actions.filter((a) => App.model.needsAt(a))[0];
      return {
        catsAct: untargeted ? untargeted.id : st.build.cats.actions[0].id,
        mechsAct: targeted ? targeted.id : st.build.mechs.actions[0].id,
        hasUntargeted: !!untargeted
      };
    });
    const teamCatsIdle = await teamOf('cats');
    await pg.click(`#decl-cats [data-fg="act"][data-fg-by="c1"][data-fg-val="${pickIds.catsAct}"]`);
    await pg.waitForTimeout(200);
    const teamCatsDecl = await teamOf('cats');
    const teamMechsIdle = await teamOf('mechs');
    await pg.click(`#decl-mechs [data-fg="act"][data-fg-by="m1"][data-fg-val="${pickIds.mechsAct}"]`);
    await pg.waitForTimeout(200);
    const teamMechsDecl = await teamOf('mechs');
    const landsMechs = await pg.evaluate(() => {
      const n = document.querySelector('#decl-mechs .fg-row .fg-lands');
      return n ? n.textContent.trim() : null;
    });
    note(ch, size.name, 'cats team reading idle -> declared', `${teamCatsIdle} -> ${teamCatsDecl}`);
    note(ch, size.name, 'mechs row landing reading', String(landsMechs));
    const roundWas = await pg.evaluate(() => document.querySelector('#round-count').textContent);
    await pg.click('#fightbar [data-fg="advance"]'); await pg.waitForTimeout(300);
    const after = await pg.evaluate(() => ({
      round: document.querySelector('#round-count').textContent,
      rows: document.querySelectorAll('#ledger .ld-row').length,
      ledgerText: (document.querySelector('#ledger .ld-row') || { textContent: '' }).textContent.replace(/\s+/g, ' ').trim().slice(0, 90)
    }));
    note(ch, size.name, 'round by real clicks', `${roundWas} -> ${after.round}`);
    note(ch, size.name, 'ledger row after the Advance', after.ledgerText);
    ok(`${tag}: 11. a whole round is declared and advanced BY REAL CLICKS, and both readings move`,
      teamCatsDecl !== teamCatsIdle && teamMechsDecl !== teamMechsIdle
      && landsMechs !== null && landsMechs !== ''
      && roundWas === '1' && after.round === '2' && after.rows === 1,
      { teamCatsIdle, teamCatsDecl, teamMechsIdle, teamMechsDecl, landsMechs, roundWas, after });

    // ── 12. THE CHANGE-TARGET FLOW, END TO END, EVERY PRESS A REAL CLICK ON A REAL ELEMENT.
    // The lit state is read from the COMPUTED STYLE and from the accessible name rather than
    // from the class alone — a class is what the code wrote, an outline is what the room sees.
    await pg.click(`#decl-mechs [data-fg="act"][data-fg-by="m1"][data-fg-val="${pickIds.mechsAct}"]`);
    await pg.waitForTimeout(250);
    const ctDefault = await pg.evaluate(() => {
      const row = document.querySelector('#decl-mechs .fg-row .fg-lands');
      const rec2 = App.state.get().fight.decl.filter((d) => d.side === 'mechs' && d.by === 'm1')[0];
      return { says: row ? row.textContent.trim() : null, at: rec2 ? rec2.at : null };
    });
    await pg.click('#decl-mechs [data-fg="at"][data-fg-by="m1"]');
    await pg.waitForTimeout(250);
    const lit = await pg.evaluate(() => {
      const shapes = Array.from(document.querySelectorAll('#decl-cats [data-fg="bf"]'));
      const on = shapes.filter((s) => /bf-unit--lit/.test(s.className));
      const styled = on.filter((s) => {
        const cs = getComputedStyle(s);
        return cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
      });
      const spoken = on.filter((s) => {
        const p = s.querySelector('.bf-pick');
        return p && !p.hidden && p.textContent.trim() !== '';
      });
      return {
        roster: App.state.get().fight.cats.units.length,
        shapes: shapes.length, lit: on.length, styled: styled.length, spoken: spoken.length,
        otherSideLit: document.querySelectorAll('#decl-mechs .bf-unit--lit').length
      };
    });
    note(ch, size.name, 'lit shapes / roster', `${lit.lit}/${lit.roster}`);
    ok(`${tag}: 12. pressing Change target lights EVERY shape of the opposing roster and none of its own`,
      lit.lit === lit.roster && lit.lit === lit.shapes && lit.otherSideLit === 0
      && lit.styled === lit.lit && lit.spoken === lit.lit, lit);
    const pickId = await pg.evaluate(() => App.state.get().fight.cats.units[App.state.get().fight.cats.units.length - 1].id);
    await pg.click(`#decl-cats [data-fg="bf"][data-fg-val="${pickId}"]`);
    await pg.waitForTimeout(250);
    const ctMoved = await pg.evaluate(() => {
      const row = document.querySelector('#decl-mechs .fg-row .fg-lands');
      const rec2 = App.state.get().fight.decl.filter((d) => d.side === 'mechs' && d.by === 'm1')[0];
      return {
        says: row ? row.textContent.trim() : null, at: rec2 ? rec2.at : null,
        stillLit: document.querySelectorAll('#decl-cats .bf-unit--lit').length
      };
    });
    note(ch, size.name, 'change-target reading', `${ctDefault.says} -> ${ctMoved.says}`);
    ok(`${tag}: 12b. a real click on a lit shape moves the target, and the lights go out`,
      ctMoved.at === pickId && ctMoved.at !== ctDefault.at
      && (ctMoved.says || '').indexOf(pickId.toUpperCase()) !== 0
      && ctMoved.says !== ctDefault.says && ctMoved.stillLit === 0,
      { ctDefault, ctMoved, pickId });
    // Pressing the control TWICE cancels the change and leaves the declaration alone.
    await pg.click('#decl-mechs [data-fg="at"][data-fg-by="m1"]'); await pg.waitForTimeout(200);
    await pg.click('#decl-mechs [data-fg="at"][data-fg-by="m1"]'); await pg.waitForTimeout(200);
    const ctCancelled = await pg.evaluate(() => {
      const rec2 = App.state.get().fight.decl.filter((d) => d.side === 'mechs' && d.by === 'm1')[0];
      return { at: rec2 ? rec2.at : null, lit: document.querySelectorAll('#decl-cats .bf-unit--lit').length };
    });
    ok(`${tag}: 12c. pressing Change target twice cancels the change and leaves the declaration standing`,
      ctCancelled.at === ctMoved.at && ctCancelled.lit === 0, ctCancelled);
    // And re-pressing the declared action takes the declaration AND its target away.
    await pg.click(`#decl-mechs [data-fg="act"][data-fg-by="m1"][data-fg-val="${pickIds.mechsAct}"]`);
    await pg.waitForTimeout(250);
    const ctGone = await pg.evaluate(() => ({
      rec: App.state.get().fight.decl.filter((d) => d.side === 'mechs' && d.by === 'm1').length,
      lands: document.querySelectorAll('#decl-mechs .fg-row .fg-lands').length
    }));
    ok(`${tag}: 12d. re-pressing the declared action takes the declaration and its target away`,
      ctGone.rec === 0 && ctGone.lands === 0, ctGone);

    // ── 13. THE DISABLED STATE IS DISTINGUISHABLE WITHOUT COLOUR. Drive a board where the
    // conditions bite, then read the two controls back: opacity, border style, border width
    // and the disabled property. At least TWO channels that are not hue must differ — [C07]'s
    // standing rule, measured on the one surface in this file that is allowed to disable.
    await pg.evaluate(() => {
      App.ops.dispatch('setAlive', { side: 'cats', unitId: 'c2', alive: false });
      App.state.invalidate();
      if (App.render.flush) App.render.flush();
    });
    await pg.waitForTimeout(250);
    const chans = await pg.evaluate(() => {
      const read = (n) => {
        const cs = getComputedStyle(n);
        return {
          disabled: n.disabled, opacity: cs.opacity,
          borderStyle: cs.borderTopStyle, borderWidth: cs.borderTopWidth,
          cursor: cs.cursor, filter: cs.filter
        };
      };
      const off = document.querySelector('#decl-cats [data-fg="act"][data-fg-by="c2"]');
      const on = document.querySelector('#decl-cats [data-fg="act"][data-fg-by="c1"]');
      return { off: off ? read(off) : null, on: on ? read(on) : null };
    });
    const diffs = ['opacity', 'borderStyle', 'borderWidth', 'cursor', 'filter']
      .filter((k) => chans.off && chans.on && chans.off[k] !== chans.on[k]);
    note(ch, size.name, 'disabled vs enabled, channels that differ', diffs.join(', ') || '(none)');
    note(ch, size.name, 'disabled opacity / enabled opacity',
      `${chans.off ? chans.off.opacity : '?'} / ${chans.on ? chans.on.opacity : '?'}`);
    ok(`${tag}: 13. a disabled action differs from an enabled one in the property AND in at least two non-hue channels`,
      chans.off !== null && chans.on !== null
      && chans.off.disabled === true && chans.on.disabled === false
      && diffs.length >= 2, { chans, diffs });

    /* ── 17. D-28's LANE, WITH THREE ROUNDS RESOLVED AND TWELVE DECLARATIONS A ROUND.
       Everything below this line is plan 05-D28's and it is the block the node gate
       structurally cannot reach: a lane is a layout, and tests/selftest-node.cjs has
       no layout engine at all — a card off the end of the lane and a card on screen
       read the same to it.

       WHY THE TWELVE DECLARATIONS ARE DISPATCHED RATHER THAN CLICKED, said out loud
       because the two cells below this one DO click: thirty-six OS clicks on buttons
       inside a scroller, four combinations over, is four minutes of auto-scrolling
       for a board this file already drives through the artifact's own path. The
       pointerdown goes to the SAME delegated listener on the same node — [S07.5]'s
       press idiom is what receives it either way — and the controls actually under
       test here, Advance and the projection toggle, are real pg.click()s. That is
       the same split the header of this block makes about App.ops: drive the boring
       bulk, click the thing being asserted. */
    await pg.evaluate(() => { App.ops.dispatch('setAlive', { side: 'cats', unitId: 'c2', alive: true }); });
    await endFight(pg);
    await startFight(pg);
    await pg.waitForTimeout(250);
    const declareAll = () => pg.evaluate(() => {
      let n = 0;
      ['cats', 'mechs'].forEach((side) => {
        document.querySelectorAll('#decl-' + side + ' .fg-row').forEach((row) => {
          const btn = row.querySelector('[data-fg="act"]:not([disabled])');
          if (btn) { btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 0 })); n++; }
        });
      });
      App.state.invalidate();
      if (App.render.flush) App.render.flush();
      return n;
    });
    const declaredPerRound = [];
    for (let r = 0; r < 3; r++) {
      declaredPerRound.push(await declareAll());
      await pg.waitForTimeout(120);
      await pg.click('#fightbar [data-fg="advance"]');
      await pg.waitForTimeout(200);
    }
    const lane = await pg.evaluate(() => {
      const list = document.querySelector('#ledger-list');
      const cs = getComputedStyle(list);
      const lr = list.getBoundingClientRect();
      const cards = Array.from(list.querySelectorAll('.ld-row'));
      const last = cards[cards.length - 1];
      const rr = last.getBoundingClientRect();
      const leavesOf = (n) => { const out = []; (function w(x) { if (!x) return; if (x.children.length === 0 && x.textContent) out.push(x.textContent); Array.from(x.children).forEach(w); })(n); return out; };
      const hpWord = App.render.labelFor(App.state.get(), 'hp');
      const shWord = App.render.labelFor(App.state.get(), 'shield');
      const saidOf = (n) => { const out = []; (function w(x) { if (!x) return; ['title', 'aria-label'].forEach((a) => { const v = x.getAttribute(a); if (v) out.push(v); }); Array.from(x.children).forEach(w); })(n); return out; };
      const perCard = cards.map((c) => {
        const bx = c.querySelector('.ld-board');
        const boardText = leavesOf(bx).join(' ');
        const boardSaid = saidOf(bx).join(' ');
        return {
          round: c.dataset.ldRound,
          board: leavesOf(bx).length,
          acts: leavesOf(c.querySelector('.ld-acts')).length,
          says: leavesOf(c.querySelector('.ld-acts')).join(' ').slice(0, 70),
          // D-29: what the board half of a card is MADE OF now.
          syms: bx.querySelectorAll('.sym').length,
          toks: bx.querySelectorAll('.tok').length,
          saidCount: saidOf(bx).length,
          textNamesType: boardText.indexOf(hpWord) !== -1 || boardText.indexOf(shWord) !== -1,
          saidNamesType: boardSaid.indexOf(hpWord) !== -1 && boardSaid.indexOf(shWord) !== -1,
          boardReads: boardText.slice(0, 70),
          saidReads: (saidOf(bx)[0] || ''),
          left: Math.round(c.getBoundingClientRect().left)
        };
      });
      return {
        cards: cards.length, rounds: cards.map((c) => c.dataset.ldRound),
        overflowX: cs.overflowX, overflowY: cs.overflowY, direction: cs.flexDirection,
        order: cards.map((c) => getComputedStyle(c).order).join(','),
        laneBox: { top: Math.round(lr.top), left: Math.round(lr.left), w: Math.round(lr.width), h: Math.round(lr.height) },
        scrollW: Math.round(list.scrollWidth), clientW: Math.round(list.clientWidth),
        scrollH: Math.round(list.scrollHeight), clientH: Math.round(list.clientHeight),
        scrollLeft: Math.round(list.scrollLeft),
        newestBox: { left: Math.round(rr.left), right: Math.round(rr.right), w: Math.round(rr.width), h: Math.round(rr.height) },
        newestWholeInLane: rr.left >= lr.left - 1 && rr.right <= lr.right + 1,
        newestIsRightmost: perCard.every((c) => c.left <= perCard[perCard.length - 1].left),
        perCard, viewportH: window.innerHeight
      };
    });
    note(ch, size.name, 'lane cards / rounds', `${lane.cards} / ${lane.rounds.join(',')}`);
    note(ch, size.name, 'lane box and card', `${lane.laneBox.w}x${lane.laneBox.h}, card ${lane.newestBox.w}x${lane.newestBox.h}`);
    note(ch, size.name, 'lane scrollW/clientW, scrollLeft', `${lane.scrollW}/${lane.clientW}, ${lane.scrollLeft}`);
    ok(`${tag}: 17. three rounds resolved with ${JSON.stringify(declaredPerRound)} declarations a round, and the lane holds one card per resolved round`,
      declaredPerRound.every((n) => n === 12) && lane.cards === 3
      && lane.rounds.join(',') === '1,2,3', { declaredPerRound, rounds: lane.rounds });
    /* 17b's CLAIM IS TURNED IN THE OPEN UNDER D-29. It counted LEAVES on both
       halves of a card and required each to be non-zero, which was the right
       instrument for D-28's question ("did the actions survive a 340px card?")
       and is the wrong one for D-29's: a card printing "Cat 1 — Health 3,
       Shield 0" and a card drawing three health tokens with the words on the
       hover both have leaves, and this cell would have gone on passing over the
       first one for ever. It now reads the board half for what it is MADE of —
       token nodes drawn, symbolic readings present, the two durability types
       named in the TOOLTIPS and in NEITHER leaf of the text — and the two type
       names are taken off the LIVE vocabulary rather than typed here, so a
       renamed board is read by its own words. The ACTION half is untouched and
       still asserted non-empty, because D-29 keeps that a sentence by name. */
    ok(`${tag}: 17b. EVERY card shows the board as it stood AND the actions that were selected — and under D-29 the board half is SYMBOLS with the prose on the hover`,
      lane.perCard.length === 3
      && lane.perCard.every((c) => c.board > 0 && c.acts > 0)
      && lane.perCard.every((c) => c.syms > 0 && c.toks > 0 && c.saidCount > 0)
      && lane.perCard.every((c) => c.textNamesType === false && c.saidNamesType === true),
      lane.perCard);
    /* THE NEWEST CARD IS THE RIGHTMOST AND IT IS WHOLE INSIDE THE LANE WITHOUT
       ANYBODY SCROLLING. [S06.8] scrolls the lane to its end on append and the
       measurement is what says the assignment reached the right axis — the line it
       replaced wrote scrollTop, which on a flex ROW moves nothing at all and would
       have left round one on screen and the round that just resolved off the end.
       `order` is read off computed style on every card as well: a reversed lane
       would put the newest at the LEFT and satisfy a "newest is visible" clause by
       accident. */
    ok(`${tag}: 17c. the lane is a horizontal row, the newest card is the RIGHTMOST, and it is whole inside the lane without scrolling`,
      lane.direction === 'row' && lane.overflowX === 'auto' && lane.overflowY === 'hidden'
      && /^(0,)*0$/.test(lane.order)
      && lane.newestIsRightmost === true && lane.newestWholeInLane === true
      && lane.scrollH === lane.clientH, lane);

    /* ── 18. AND THE ROUND BEING PLAYED IS STILL REACHABLE UNDER THAT LANE, which is
       the arithmetic D-28 changed and the defect this plan measured and fixed. With
       the round controls appended below .fg-sides the Advance control read 1094 of a
       1080 viewport and 951 of a 768 one; it is on the round's own line now.

       ADVANCE IS ASSERTED ABOVE THE FOLD AND THE FOUR REGIONS ARE ASSERTED REACHABLE,
       and the difference between the two words is deliberate. Above the fold means at
       page scroll ZERO, with no scrolling of any kind, which is what a control that
       ends a round has to be. Reachable means it has a real box on the page — the
       grid and the battlefield live inside a scroller bounded on itself, so a room
       scrolls to the bottom of a column exactly as it scrolls [C12]'s action list. */
    const under = await pg.evaluate(async () => {
      const R = (s) => { const n = document.querySelector(s); if (!n) return null; const r = n.getBoundingClientRect();
        return { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom) }; };
      // AWAITED, for [C01]'s smooth scrolling — and READ BACK, because the two
      // browsers do not agree about how far a scroll to the top gets before the
      // next frame. Plan 05-16 recorded the same disagreement from the other
      // direction (scrollTo(0,0) reaching scrollY 179 in Edge and 0 in Chrome),
      // and the answer there is the answer here: assert what holds at any offset
      // the page can reach, and add the offset back to make the claim absolute.
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 500));
      return {
        scrollY: Math.round(window.scrollY), vh: window.innerHeight,
        advance: R('#fightbar [data-fg="advance"]'),
        roundHead: R('.fg-round-head'), roundN: document.querySelector('.fg-round-n').textContent,
        sides: R('.fg-sides'), field: R('#decl-cats .fg-field'),
        team: R('#decl-cats .fg-team'), rows: R('#decl-cats .fg-rows'),
        lane: R('#ledger-list'),
        advanceEnabled: document.querySelector('#fightbar [data-fg="advance"]').disabled === false
      };
    });
    note(ch, size.name, 'Advance top/bottom vs viewport, 3 rounds in the lane',
      `${under.advance.top}/${under.advance.bottom} of ${under.vh}`);
    note(ch, size.name, '.fg-sides top/height/bottom, 3 rounds in the lane',
      `${under.sides.top}/${under.sides.h}/${under.sides.bottom} of ${under.vh}`);
    note(ch, size.name, 'battlefield / team / rows tops, 3 rounds in the lane',
      `${under.field.top} / ${under.team.top} / ${under.rows.top}`);
    // THE CLAIM IS MADE ABSOLUTE BY ADDING THE OFFSET BACK. `advance.top + scrollY`
    // is the control's distance from the top of the DOCUMENT, so the assertion is
    // "above the fold at a page scroll of zero" whatever offset the browser had
    // actually settled at when the reading was taken.
    note(ch, size.name, 'Advance from the top of the DOCUMENT, 3 rounds in the lane',
      `${under.advance.top + under.scrollY} of ${under.vh} (read at scrollY ${under.scrollY})`);
    ok(`${tag}: 18. with three rounds in the lane the Advance control is ABOVE THE FOLD at page scroll zero, and enabled`,
      under.advance.top + under.scrollY >= 0
      && under.advance.bottom + under.scrollY <= under.vh
      && under.advance.top >= 0 && under.advance.bottom <= under.vh
      && under.advanceEnabled === true, under);
    ok(`${tag}: 18b. the round, the lane, the battlefield, the team resources and the picker rows all have a real box`,
      [under.roundHead, under.lane, under.field, under.team, under.rows]
        .every((b) => b !== null && b.w > 0 && b.h > 0)
      && under.roundN !== '', under);

    /* ── 19. AND THE LANE REALLY DOES SCROLL SIDEWAYS, driven past the width it fits
       in rather than asserted about. Three cards fit inside a 1920 lane, so a check
       that stopped at three would be asserting an overflow that never happened —
       which is this file's own "a scan of a page that was never painted" failure
       arriving on a scrollbar. Two more rounds are resolved to force it at BOTH
       sizes, and what is read back is that the content is wider than the box, that
       the offset is at its MAXIMUM, and that the newest card is whole in view there. */
    for (let r = 0; r < 2; r++) {
      await declareAll();
      await pg.waitForTimeout(100);
      await pg.click('#fightbar [data-fg="advance"]');
      await pg.waitForTimeout(200);
    }
    const laneFull = await pg.evaluate(() => {
      const list = document.querySelector('#ledger-list');
      const lr = list.getBoundingClientRect();
      const cards = Array.from(list.querySelectorAll('.ld-row'));
      const rr = cards[cards.length - 1].getBoundingClientRect();
      return {
        cards: cards.length,
        scrollW: Math.round(list.scrollWidth), clientW: Math.round(list.clientWidth),
        scrollLeft: Math.round(list.scrollLeft),
        maxScrollLeft: Math.round(list.scrollWidth - list.clientWidth),
        newestWholeInLane: rr.left >= lr.left - 1 && rr.right <= lr.right + 1,
        laneH: Math.round(lr.height)
      };
    });
    note(ch, size.name, 'lane with five rounds: scrollW/clientW, scrollLeft/max',
      `${laneFull.scrollW}/${laneFull.clientW}, ${laneFull.scrollLeft}/${laneFull.maxScrollLeft}`);
    ok(`${tag}: 19. with five rounds the lane OVERFLOWS SIDEWAYS, is scrolled to its end, and the newest card is whole in view there`,
      laneFull.cards === 5 && laneFull.scrollW > laneFull.clientW
      && laneFull.maxScrollLeft > 0
      && Math.abs(laneFull.scrollLeft - laneFull.maxScrollLeft) <= 1
      && laneFull.newestWholeInLane === true, laneFull);

    /* ── 20. D-29's HOVER, DRIVEN WITH A REAL MOUSE. The developer's third
       sentence is "mouse over tooltip for the text description", and the node
       gate can assert an attribute exists but CANNOT assert that a mouse ever
       reaches the node carrying it. That gap is not theoretical: a reading with
       a perfect title and a zero-height box, or one covered by a sibling, is a
       tooltip nobody in a workshop will ever see, and every row in
       tests/selftest-node.cjs would be green over it.

       WHAT IS AND IS NOT ASSERTED, said plainly. A native `title` tooltip is
       painted by the OPERATING SYSTEM and is not in the DOM, so no automation
       in any browser can read the yellow box itself. What IS driven is the half
       that can fail: the pointer is moved to the CENTRE OF THE RENDERED BOX of
       a real reading in the lane, and what the page reports under that point
       must be that reading or something inside it, it must match :hover, and
       the title the browser would show is read back off the element the hit
       test actually returned — not off a selector this file chose. A covered
       node fails the hit test; a collapsed one has no centre to aim at.

       AND THE ACCESSIBLE NAME IS READ IN THE SAME BREATH, because the tooltip
       is the half a keyboard cannot reach: role="img" plus an aria-label equal
       to the title is what makes the reading available to a screen reader, and
       a browser is where "equal" can be checked against what was actually
       parsed rather than against what a renderer intended to write. */
    /* THE READING IS CHOSEN BY WHERE IT ACTUALLY IS, AND THE FIRST DRAFT OF
       THIS CELL WAS RED BECAUSE IT WAS NOT. It took `#ledger .sym` and aimed at
       its centre, which measured x = -344: with five rounds resolved the lane is
       scrolled to its END, so the FIRST reading in the DOM is off the left edge
       of its own scroller. The mouse was moved to a point outside the window,
       elementFromPoint returned null, and the cell reddened in all four
       combinations. That is the cell working — a tooltip on a node nobody can
       reach is exactly what this is for — but the node it should be asking about
       is one a student can see. So the target is the first reading whose centre
       is inside the LANE's own box and inside the window, which is the same
       question a person in the room is answering when they point at it. */
    // THE PAGE IS PUT BACK AT THE TOP AND THE ANIMATION AWAITED FIRST, which is
    // D-28's own recorded harness lesson arriving through a seventh door: [C01]
    // sets html{scroll-behavior:smooth}, cell 6b drives a real page scroll at
    // 1366x768, and a hover aimed at a lane that is 28px off the top of the
    // window lands on nothing. Measured before this line went in: the target
    // search returned null in BOTH browsers at 768 and in neither at 1080.
    await pg.evaluate(async () => {
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 500));
    });
    /* AND THE NEWEST CARD IS SCROLLED TO ITS FIRST READING, WHICH IS THE THIRD
       THING THIS CELL LEARNED BY GOING RED AND THE ONLY ONE THAT IS A FINDING
       ABOUT THE ARTIFACT RATHER THAN ABOUT THE HARNESS. Measured at 1366x768
       with five rounds in the lane: each card is 340x115 with a scrollHeight of
       1174 — a 115px window over 1174px of content — so NOT ONE symbolic
       reading in ANY card is inside the lane's own box without somebody
       scrolling the card. 234 of the 240 readings were outside the lane
       entirely and the remaining 6 were clipped by their card.

       THAT PROPERTY IS NOT D-29's. .ld-row has been bounded at 22vh (15vh below
       820px of viewport height) since plan 05-D28 turned the lane on its side,
       and a 9-and-3 board has always put twelve unit readings plus five action
       lines into it. What D-29 changed is what those readings are MADE of, not
       how many there are. So this cell scrolls the card — which is what a
       student does, on a scroller the artifact deliberately gave them — and
       then hovers. The measurement is recorded as a note at both sizes and
       carried to the playtest rather than silently absorbed. */
    const cardWindow = await pg.evaluate(async () => {
      const cards = Array.from(document.querySelectorAll('.ld-row'));
      const card = cards[cards.length - 1];
      if (!card) return null;
      const sym = card.querySelector('.sym');
      const before = { h: Math.round(card.getBoundingClientRect().height), content: Math.round(card.scrollHeight) };
      if (sym) {
        const cr = card.getBoundingClientRect();
        const sr = sym.getBoundingClientRect();
        card.scrollTop = Math.max(0, card.scrollTop + (sr.top - cr.top) - 4);
      }
      await new Promise((r) => setTimeout(r, 300));
      return { ...before, scrolled: Math.round(card.scrollTop) };
    });
    note(ch, size.name, 'a lane card: window / content / scrolled to the first reading',
      cardWindow === null ? 'NOT FOUND' : `${cardWindow.h}px over ${cardWindow.content}px, scrollTop ${cardWindow.scrolled}`);
    const hoverTarget = await pg.evaluate(() => {
      const lane = document.querySelector('#ledger-list');
      if (!lane) return null;
      const lr = lane.getBoundingClientRect();
      const cards = Array.from(document.querySelectorAll('.ld-row'));
      const newest = cards[cards.length - 1];
      const all = newest ? Array.from(newest.querySelectorAll('.sym')) : [];
      for (const n of all) {
        const r = n.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) continue;
        const x = Math.round(r.left + r.width / 2);
        const y = Math.round(r.top + r.height / 2);
        if (x < lr.left || x > lr.right || y < lr.top || y > lr.bottom) continue;
        if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) continue;
        // AND INSIDE ITS OWN CARD, WHICH IS THE SECOND THING THIS CELL LEARNED
        // BY GOING RED. .ld-row is bounded at 22vh (15vh below 820px of viewport
        // height) and scrolls ON ITSELF, so at 1366x768 most readings in a card
        // are clipped by the card while their rects still fall inside the LANE.
        // Aiming at one of those measured a hit on `.ld-list` — the scroller,
        // not the reading. A point a mouse can reach has to be inside the box
        // that clips it as well as inside the one that positions it.
        const card = n.closest('.ld-row');
        if (card) {
          const cr = card.getBoundingClientRect();
          if (x < cr.left || x > cr.right || y < cr.top || y > cr.bottom) continue;
        }
        return { x: x, y: y, w: Math.round(r.width), h: Math.round(r.height),
          offScreenFirst: all.indexOf(n) };
      }
      const why = { zero: 0, outLane: 0, outWin: 0, outCard: 0 };
      all.forEach((n) => {
        const r = n.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) { why.zero++; return; }
        const x = Math.round(r.left + r.width / 2); const y = Math.round(r.top + r.height / 2);
        if (x < lr.left || x > lr.right || y < lr.top || y > lr.bottom) { why.outLane++; return; }
        if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) { why.outWin++; return; }
        const c = n.closest('.ld-row');
        if (c) { const cr = c.getBoundingClientRect();
          if (x < cr.left || x > cr.right || y < cr.top || y > cr.bottom) { why.outCard++; return; } }
      });
      return { x: -1, y: -1, w: 0, h: 0, why: JSON.stringify({
        lane: { t: Math.round(lr.top), l: Math.round(lr.left), r: Math.round(lr.right), b: Math.round(lr.bottom) },
        total: all.length, rejected: why, scrollY: Math.round(window.scrollY),
        win: { w: window.innerWidth, h: window.innerHeight },
        cards: Array.from(document.querySelectorAll('.ld-row')).map((c) => { const r = c.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height), Math.round(c.scrollTop), Math.round(c.scrollHeight)]; })
      }) };
    });
    let hover = { found: false };
    if (hoverTarget && hoverTarget.w > 0 && hoverTarget.h > 0) {
      await pg.mouse.move(hoverTarget.x, hoverTarget.y);
      await pg.waitForTimeout(150);
      hover = await pg.evaluate((pt) => {
        const hit = document.elementFromPoint(pt.x, pt.y);
        let box = hit;
        while (box && !box.classList.contains('sym')) { box = box.parentElement; }
        if (!box) return { found: false, hitTag: hit ? hit.className : null };
        return {
          found: true,
          hitInside: box.contains(hit) || box === hit,
          hovered: box.matches(':hover'),
          title: box.getAttribute('title'),
          label: box.getAttribute('aria-label'),
          role: box.getAttribute('role'),
          toks: box.querySelectorAll('.tok').length,
          tokBox: (() => { const t = box.querySelector('.tok'); if (!t) return null; const r = t.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })(),
          boxW: Math.round(box.getBoundingClientRect().width),
          boxH: Math.round(box.getBoundingClientRect().height)
        };
      }, hoverTarget);
    }
    note(ch, size.name, 'a driven hover on a lane reading', hover.found
      ? `${hover.boxW}x${hover.boxH}, ${hover.toks} tokens ${hover.tokBox ? hover.tokBox.w + 'x' + hover.tokBox.h : '-'} -> ${JSON.stringify(hover.title)}`
      : 'NOT FOUND');
    ok(`${tag}: 20. a REAL MOUSE lands on a symbolic reading in the lane and the node under the pointer carries the prose on BOTH channels`,
      hover.found === true && hover.hitInside === true && hover.hovered === true
      && typeof hover.title === 'string' && hover.title.length > 0
      && hover.label === hover.title && hover.role === 'img'
      && hover.toks > 0 && hover.tokBox !== null
      && hover.tokBox.w > 0 && hover.tokBox.h > 0
      && hover.boxW > 0 && hover.boxH > 0
      && hoverTarget !== null, { hoverTarget, hover });

    /* ── 20b. AND THE LANE IS READABLE RATHER THAN MERELY PRESENT. Every
       symbolic reading in the lane is measured: a real box, real tokens inside
       it, and — the clause that matters on a projector — a compacted count
       drawn at UX-02's 18px floor or above, read off COMPUTED STYLE rather than
       off the stylesheet. [C05] sets .tok-count at 24px because on the board
       every value is 24px; a ledger card is an 18px surface, so [C14.5] turns
       it down, and 18 is a FLOOR that a later tidy must not go under. Nothing
       may spill out of its own card either: a reading wider than the 340px card
       it sits in is a reading the room reads half of. */
    const laneRead = await pg.evaluate(() => {
      const out = { syms: 0, zeroBox: 0, zeroTok: 0, counts: 0, smallCount: 0, overflow: 0, minCount: 999, sample: null };
      document.querySelectorAll('#ledger .sym').forEach((n) => {
        out.syms++;
        const r = n.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) out.zeroBox++;
        const t = n.querySelector('.tok');
        if (!t) { out.zeroTok++; } else {
          const tr = t.getBoundingClientRect();
          if (tr.width <= 0 || tr.height <= 0) out.zeroTok++;
        }
        n.querySelectorAll('.tok-count').forEach((c) => {
          out.counts++;
          const fs = parseFloat(getComputedStyle(c).fontSize);
          if (fs < out.minCount) out.minCount = fs;
          if (fs < 18) out.smallCount++;
        });
        const card = n.closest('.ld-row');
        if (card) {
          const cr = card.getBoundingClientRect();
          if (r.right > cr.right + 1 || r.left < cr.left - 1) out.overflow++;
        }
        if (out.sample === null) out.sample = { title: n.getAttribute('title'), w: Math.round(r.width), h: Math.round(r.height) };
      });
      return out;
    });
    note(ch, size.name, 'lane readings: boxes / tokens / counts',
      `${laneRead.syms} readings, ${laneRead.zeroBox} with no box, ${laneRead.zeroTok} with no token, ${laneRead.counts} counts at >= ${laneRead.minCount}px, ${laneRead.overflow} spilling their card`);
    ok(`${tag}: 20b. every symbolic reading in the lane has a real box, real tokens, a compacted count at 18px or above, and none spills out of its card`,
      laneRead.syms > 0 && laneRead.zeroBox === 0 && laneRead.zeroTok === 0
      && laneRead.counts > 0 && laneRead.smallCount === 0 && laneRead.overflow === 0,
      laneRead);

    /* ── 21. D-29's SECOND SENTENCE, ON THE PICKER, IN A REAL BROWSER.
       "instead of showing cost in 1 Action Points, show it as - then the symbol
       for the action points." The node gate asserts the notation; what it
       cannot see is whether the minus sign and the tokens beside it actually
       have boxes on a button 44px tall, and whether the words left the button's
       face. Both are read off computed geometry here. THE SIGN IS ASSERTED TO
       BE U+2212 off the rendered text node, not off the source, because the two
       characters are indistinguishable in a diff and distinguishable on a
       projector. */
    const cost = await pg.evaluate(() => {
      const box = document.querySelector('#decl-cats .fg-act-cost');
      if (!box) return null;
      const sym = box.querySelector('.sym');
      const sign = box.querySelector('.sym-sign');
      const tok = box.querySelector('.tok');
      const leaves = []; (function w(x) { if (!x) return; if (x.children.length === 0 && x.textContent) leaves.push(x.textContent); Array.from(x.children).forEach(w); })(box);
      const r = (n) => { if (!n) return null; const b = n.getBoundingClientRect(); return { w: Math.round(b.width), h: Math.round(b.height) }; };
      const btn = box.closest('[data-fg="act"]');
      return {
        signText: sign ? sign.textContent : null,
        signIsMinus: sign ? sign.textContent === '\u2212' : false,
        signBox: r(sign), tokBox: r(tok), symBox: r(sym),
        title: sym ? sym.getAttribute('title') : null,
        label: sym ? sym.getAttribute('aria-label') : null,
        apWord: App.render.labelFor(App.state.get(), 'ap'),
        text: leaves.join(' '),
        btnBox: r(btn),
        signSize: sign ? parseFloat(getComputedStyle(sign).fontSize) : 0
      };
    });
    note(ch, size.name, 'a picker cost', cost === null ? 'NOT FOUND'
      : `${JSON.stringify(cost.text)} sign ${JSON.stringify(cost.signText)} ${cost.signBox ? cost.signBox.w + 'x' + cost.signBox.h : '-'} token ${cost.tokBox ? cost.tokBox.w + 'x' + cost.tokBox.h : '-'} -> ${JSON.stringify(cost.title)}`);
    ok(`${tag}: 21. a cost on the picker renders as U+2212 plus the type's own token, both with real boxes, with the prose on the hover and the type named nowhere in the button's own text`,
      cost !== null && cost.signIsMinus === true
      && cost.signBox !== null && cost.signBox.w > 0 && cost.signBox.h > 0
      && cost.tokBox !== null && cost.tokBox.w > 0 && cost.tokBox.h > 0
      && cost.signSize >= 18
      && typeof cost.title === 'string' && cost.title.length > 0
      && cost.label === cost.title
      && cost.text.indexOf(cost.apWord) === -1, cost);

    // ── 14. THE SAME READINGS AT 24 A SIDE, which is MAX_UNITS and the top of the product.
    await endFight(pg);
    await toRoster(pg, 24);
    await pg.waitForTimeout(200);
    await startFight(pg);
    await pg.waitForTimeout(400);
    await gridOn('24-a-side');
    await bfOn('24-a-side');

    // ── 15. AN AUTHORED TOKEN TYPE, WITH AN AUTHORED GLYPH, DRAWN ON THE BATTLEFIELD as the
    // student styled it. D-24's no-second-tier rule read off a real browser's computed style
    // rather than off a class name.
    await endFight(pg);
    await toRoster(pg, 3);
    // GLYPHS[0] IS THE EMPTY STRING — "none, the shipped board, and the honest default" — so a
    // type authored with it draws no glyph node at all and a check asserting one reads null.
    // That was this check's first red run and it is recorded rather than quietly indexed past:
    // an authored glyph has to be an authored glyph for the claim to mean anything.
    const made = await pg.evaluate(() => {
      const D = App.data;
      const glyph = D.GLYPHS.filter((g) => g !== '')[0];
      const id = App.ops.createTokenType({ name: 'Zeal', scope: 'unit', shape: 'hex', color: 'violet', glyph });
      App.ops.setTally('cats', 'c1', id, 4);
      App.state.invalidate();
      if (App.state.flush) App.state.flush();
      return { id, glyph };
    });
    await startFight(pg);
    await pg.waitForTimeout(300);
    const authored = await pg.evaluate((m) => {
      const line = document.querySelector(`#decl-cats [data-fg="bf"][data-fg-val="c1"] .bf-line[data-bf-amt="${m.id}"]`);
      if (!line) return { found: false };
      const tok = line.querySelector('.tok');
      const shp = tok ? tok.querySelector('.tok-s') : null;
      const g = tok ? tok.querySelector('.tok-g') : null;
      const r = shp ? shp.getBoundingClientRect() : null;
      return {
        found: true, cls: tok ? tok.className : null,
        clip: shp ? getComputedStyle(shp).clipPath : null,
        w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0,
        glyph: g ? g.textContent : null,
        label: (line.querySelector('.bf-lbl') || {}).textContent || null,
        count: line.querySelectorAll('.tok').length
      };
    }, made);
    note(ch, size.name, 'authored type on the battlefield',
      `${authored.label} / ${authored.cls} / ${authored.w}x${authored.h} / clip ${String(authored.clip).slice(0, 24)}`);
    ok(`${tag}: 15. a type the student invented is drawn on the battlefield exactly as authored`,
      authored.found === true && /tok--hex/.test(authored.cls || '') && /tok--violet/.test(authored.cls || '')
      && authored.clip !== 'none' && authored.w > 0 && authored.h > 0
      && authored.label === 'Zeal' && authored.glyph === made.glyph && authored.count === 4,
      authored);

    // ── 16. NO PAGE ERROR AND NO CONSOLE ERROR over the whole of the above.
    ok(`${tag}: 16. no page error and no console error across every press above`,
      errs.length === 0, errs.slice(0, 3));

    await b.close();
  }
}

// ── THE TABLE. Four columns, in the viewport fix's manner: where the two browsers or the two
// sizes disagree, the disagreement is the finding and is visible without re-running anything.
const keys = [];
rec.forEach((r) => { if (keys.indexOf(r.key) === -1) keys.push(r.key); });
const cols = [];
for (const b of ['chrome', 'msedge']) for (const s of SIZES) cols.push(b + ' ' + s.name);
const cell = (k, c) => {
  const [b, s] = [c.split(' ')[0], c.split(' ')[1]];
  const hit = rec.filter((r) => r.key === k && r.browser === b && r.size === s);
  return hit.length === 0 ? '—' : String(hit[hit.length - 1].value);
};
console.log('\nMEASURED — every reading, four ways\n');
const w0 = Math.max(...keys.map((k) => k.length), 8);
console.log('  ' + 'reading'.padEnd(w0) + ' | ' + cols.map((c) => c.padEnd(30)).join(' | '));
console.log('  ' + '-'.repeat(w0) + '-+-' + cols.map(() => '-'.repeat(30)).join('-+-'));
keys.forEach((k) => {
  console.log('  ' + k.padEnd(w0) + ' | ' + cols.map((c) => cell(k, c).padEnd(30)).join(' | '));
});

console.log(`\nbrowser checks: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
