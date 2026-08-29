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
  const b = await chromium.launch({ channel, headless: false });
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
      ok(`${tag}: 6b. ${label} — the grid's own box is inside the viewport`,
        g.sidesBox.top >= 0 && g.sidesBox.bottom <= g.viewportH, g);
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
    for (const view of ['build', 'fight']) {
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

    // ── 11. A FULL ROUND BY REAL CLICKS. One untargeted declaration, one target-directed
    // one, each in a SINGLE press; the team resources read before and after each; Advance;
    // the round and the ledger read back.
    await pg.click('#view-fight'); await pg.waitForTimeout(200);
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

    // ── 14. THE SAME READINGS AT 24 A SIDE, which is MAX_UNITS and the top of the product.
    await pg.evaluate(() => { App.ops.dispatch('setAlive', { side: 'cats', unitId: 'c2', alive: true }); });
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
