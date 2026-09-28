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
import { tmpdir } from 'os';
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
    // D-45, plan 05-D45: every default unit name a cell below asserts is read off the page's
    // own generator, keyed like an id — born.c1, born.m3 — and never re-typed here, so a cell
    // cannot agree with a stale copy of the naming rule (the D-40 lesson). The cell labels
    // still say "Cat 1" and "Mech 3": they are prose naming a unit by its slot, not expectations.
    const born = await pg.evaluate(() => {
      const out = {};
      ['cats', 'mechs'].forEach((s) => { for (let n = 1; n <= 24; n++) { out[s.charAt(0) + n] = App.data.unitName(s, n); } });
      return out;
    });

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

    /* ── 27. D-38's FIRST DEFECT, REPRODUCED AND THEN REFUSED. ────────────────────────────
       The developer's screenshot of the Actions editor shows the Side chooser as TWO EMPTY
       PILLS — an outline, a tick, and no faction word in either. Probe F reproduced it on
       the shipped file: the words lived in ONE place, [S06.5]'s per-frame write, and that
       write sits under four early returns, so the spans ship EMPTY and stay empty until a
       frame clears all four. Forcing the dialog visible without a completed paint drew the
       screenshot exactly, at every viewport tried.

       THE CELL DRIVES THAT EXACT STATE rather than a state near it. The editor has not been
       opened on this page, so nothing has painted it; showModal() is called directly, which
       is the one way to make the box VISIBLE with the paint skipped — this file's own
       recorded lesson, four times over, is that showModal SCHEDULES NOTHING. If the words
       were still only in the paint this reads two empty strings, which is what the fix
       makes impossible.

       AND THEN THE ORDINARY PATH IS DRIVEN TOO, because a fix that put words in the markup
       and broke the live read would pass the first half and ship a pill that stops following
       the build slice. Both halves, one cell, in the order a defect and its fix belong. */
    const coldPills = await pg.evaluate(() => {
      const g = s => (document.querySelector(s) || { textContent: null }).textContent;
      return {
        before: {
          cats: g('#act-edit-side-cats .ae-side-name'),
          mechs: g('#act-edit-side-mechs .ae-side-name')
        },
        everPainted: (document.querySelector('#act-edit').dataset.edSig || '').length > 0
      };
    });
    await pg.evaluate(() => { const d = document.querySelector('#act-edit'); if (!d.open) d.showModal(); });
    await pg.waitForTimeout(250);
    const coldVisible = await pg.evaluate(() => {
      const g = s => (document.querySelector(s) || { textContent: null }).textContent;
      const w = s => { const n = document.querySelector(s); return n ? Math.round(n.getBoundingClientRect().width) : -1; };
      return {
        open: document.querySelector('#act-edit').open,
        cats: g('#act-edit-side-cats .ae-side-name'),
        mechs: g('#act-edit-side-mechs .ae-side-name'),
        catsW: w('#act-edit-side-cats .ae-side-name'),
        mechsW: w('#act-edit-side-mechs .ae-side-name')
      };
    });
    await pg.locator('#act-edit-pane-author').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d38-cold-pills-${ch}-${size.name}.png`)
    });
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    await pg.click('[data-k="act"]'); await pg.waitForTimeout(300);
    const paintedPills = await pg.evaluate(() => {
      const g = s => (document.querySelector(s) || { textContent: null }).textContent;
      return {
        open: document.querySelector('#act-edit').open,
        cats: g('#act-edit-side-cats .ae-side-name'),
        mechs: g('#act-edit-side-mechs .ae-side-name'),
        live: App.state.get().build.cats.name + '/' + App.state.get().build.mechs.name
      };
    });
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    note(ch, size.name, 'D-38 side pills cold / painted',
      `${JSON.stringify(coldVisible.cats)}+${JSON.stringify(coldVisible.mechs)} / ${JSON.stringify(paintedPills.cats)}+${JSON.stringify(paintedPills.mechs)}`);
    ok(`${tag}: 27. D-38's FIRST DEFECT — THE SIDE CHOOSER IS NEVER A PAIR OF WORDLESS PILLS. The developer photographed this control empty and it was reproduced on the shipped file: the two words existed only in [S06.5]'s per-frame write, under four early returns, so the shell shipped two empty spans and any frame that made the dialog VISIBLE before a paint completed drew a labelled empty box. This drives that state on purpose — the editor has never been opened on this page and showModal() SCHEDULES NOTHING, which is this file's own lesson learned four times — and requires the words anyway, with a non-zero drawn width so a rule that hid them would be caught too. Then the ORDINARY path is driven and the words are compared against the LIVE faction names, because a fix that put them in the markup and dropped the build-slice read would be a pill that quietly stops following state`,
      coldPills.everPainted === false
      && coldPills.before.cats === 'Cats' && coldPills.before.mechs === 'Mechs'
      && coldVisible.open === true
      && coldVisible.cats === 'Cats' && coldVisible.mechs === 'Mechs'
      && coldVisible.catsW > 0 && coldVisible.mechsW > 0
      && paintedPills.open === true
      && paintedPills.cats === 'Cats' && paintedPills.mechs === 'Mechs'
      && paintedPills.live === 'Cats/Mechs',
      { coldPills, coldVisible, paintedPills });

    /* ── 27b. D-38's SECOND DEFECT — TWO DIALOGS AT ONCE, MEASURED BOTH WAYS. ─────────────
       The developer's screenshot shows the token picker's foot ("Emoji", "Done") visible
       UNDERNEATH the Actions dialog. Two stacked modals read exactly like that through
       #act-edit's 76%-opaque backdrop.

       THE FIRST HALF IS THE MEASUREMENT AND IT IS THE HONEST ONE: all twelve ordered pairs
       of the four openers are driven as REAL CLICKS, and every second press is expected to
       be BLOCKED — a modal makes the rest of the document inert, the top bar is outside the
       dialog, so the click never reaches the button. That is what makes the photographed
       state unreachable through the shipped controls, and it is asserted rather than
       assumed, because the day it stops being true is the day the guard below is the only
       thing left.

       THE SECOND HALF IS THE GUARD. A press is DISPATCHED on the second opener instead of
       clicked — which stands in for every route that is not an inert-blocked click: a
       keyboard shortcut, an opener moved inside a dialog, a future surface opened with
       show(). Before soleDialog() that left two dialogs open; it must now leave one, and it
       must be the SECOND one, because the last press wins is what a press means everywhere
       else on this page. */
    const OPENERS = [
      ['tok-picker', '[data-k="tok"]'],
      ['act-edit', '[data-k="act"]'],
      ['share', '[data-k="sh"]'],
      ['reset-ask', '[data-k="rs"]']
    ];
    const openIds = () => pg.evaluate(() =>
      [...document.querySelectorAll('dialog')].filter(d => d.open).map(d => d.id));
    const shutAll = () => pg.evaluate(() =>
      [...document.querySelectorAll('dialog')].forEach(d => { if (d.open) d.close(); }));
    const clickPairs = [];
    const sendPairs = [];
    for (const [firstId, firstSel] of OPENERS) {
      for (const [secondId, secondSel] of OPENERS) {
        if (firstId === secondId) continue;
        await shutAll(); await pg.waitForTimeout(80);
        await pg.click(firstSel); await pg.waitForTimeout(150);
        let blocked = false;
        try { await pg.click(secondSel, { timeout: 800 }); } catch { blocked = true; }
        await pg.waitForTimeout(120);
        const afterClick = await openIds();
        clickPairs.push(`${firstId}->${secondId}:${blocked ? 'blocked' : 'LANDED'}=${afterClick.join('+') || 'none'}`);
        // The dispatched press: the same delegated pointerdown the button routes through,
        // reaching the handler by a path inertness does not close.
        await pg.evaluate((s) => {
          const n = document.querySelector(s);
          n.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
        }, secondSel);
        await pg.waitForTimeout(200);
        const afterSend = await openIds();
        sendPairs.push(`${firstId}->${secondId}=${afterSend.join('+') || 'none'}`);
      }
    }
    await shutAll(); await pg.waitForTimeout(120);
    const clickAllBlocked = clickPairs.every((s) => s.indexOf(':blocked=') !== -1);
    const clickAlwaysOne = clickPairs.every((s) => s.split('=')[1].indexOf('+') === -1
      && s.split('=')[1] !== 'none');
    const sendAlwaysSecond = sendPairs.every((s) => {
      const want = s.split('->')[1].split('=')[0];
      return s.split('=')[1] === want;
    });
    note(ch, size.name, 'D-38 dialog pairs — clicked / dispatched',
      `${clickPairs.filter(s => s.indexOf(':blocked') !== -1).length}/12 blocked, ${sendPairs.filter((s) => s.split('=')[1].indexOf('+') === -1).length}/12 single`);
    ok(`${tag}: 27b. D-38's SECOND DEFECT — ONE DIALOG AT A TIME, MEASURED BOTH WAYS. The developer photographed the token picker's foot visible UNDER the Actions dialog, which is what two stacked modals look like through a 76% backdrop. All twelve ordered pairs of the four openers are driven as REAL CLICKS and every second press is BLOCKED, because a modal makes the top bar inert — that is what made the photographed state unreachable through the shipped controls, and it is asserted rather than assumed, since the day it stops holding is the day the guard is all that is left. Then a press is DISPATCHED on the second opener, standing in for every route inertness does not close — a keyboard shortcut, an opener moved inside a dialog, a surface opened with show() — and exactly one dialog is open afterwards and it is the SECOND, because the last press wins is what a press means everywhere else on this page`,
      clickPairs.length === 12 && sendPairs.length === 12
      && clickAllBlocked && clickAlwaysOne && sendAlwaysSecond,
      { clickPairs, sendPairs });

    /* ── 27d. G-02.1-E — THE KEYBOARD GOES IN WITH THE DIALOG. ───────────────────────────
       Measured on the shipped file in real Chrome and real Edge: document.activeElement is
       BODY after either authoring dialog opens through its own topbar control. Phase 2 saw
       this and wrote it down as probably an artefact of its own test pane. It was not the
       test pane.

       WHY THE BROWSER DOES NOT DO IT: showModal() runs the dialog focusing steps, which
       want an `autofocus` element and otherwise focus the dialog itself — except that they
       skip a dialog with no tabindex, which none of these four has. So the keyboard stays
       where the press left it, and the press was on a topbar button showModal() has just
       made inert.

       WHAT IS ASSERTED IS THE FIRST FOCUSABLE AND NOT A NAMED CONTROL, because that is what
       the fix derives rather than chooses: it takes the control a Tab from the body would
       have reached, so the keyboard order is unchanged and the only difference is the
       number of presses. Four surfaces, all four driven. The confirmation's row carries the
       clause that makes this safe to apply everywhere — its first focusable is Cancel and
       NOT the accented control beside it, so a placement rule is never one stray Enter from
       discarding a session.

       AND ONE TAB MUST MOVE ON. A placement that landed on the dialog itself, or on a
       control the first Tab would also have reached, would satisfy an "inside the dialog"
       clause and still cost the student the press this is meant to save. */
    const d39FocusOnOpen = [];
    for (const [dlgId, sel] of OPENERS) {
      await shutAll(); await pg.waitForTimeout(100);
      await pg.click(sel); await pg.waitForTimeout(250);
      const read = await pg.evaluate((id) => {
        const d = document.getElementById(id);
        const SEL = 'button:not([disabled]), input:not([disabled]), '
          + 'textarea:not([disabled]), select:not([disabled]), '
          + '[tabindex]:not([tabindex="-1"])';
        const all = [...d.querySelectorAll(SEL)]
          .filter((n) => !n.closest('[hidden]') && n.offsetParent !== null);
        const a = document.activeElement;
        return {
          id,
          open: d.open === true,
          inDialog: !!(a && d.contains(a)),
          isFirst: !!(a && a === all[0]),
          onBody: a === document.body,
          accented: !!(a && a.className.indexOf('--danger') !== -1),
          k: a ? (a.dataset.k || a.id || a.tagName) : 'NONE',
          firstK: all[0] ? (all[0].dataset.k || all[0].id || all[0].tagName) : 'NONE',
          secondK: all[1] ? (all[1].dataset.k || all[1].id || all[1].tagName) : 'NONE'
        };
      }, dlgId);
      await pg.keyboard.press('Tab'); await pg.waitForTimeout(120);
      read.afterTab = await pg.evaluate(() => {
        const a = document.activeElement;
        return a ? (a.dataset.k || a.id || a.tagName) : 'NONE';
      });
      d39FocusOnOpen.push(read);
    }
    await shutAll(); await pg.waitForTimeout(120);
    note(ch, size.name, 'G-02.1-E the keyboard lands on',
      d39FocusOnOpen.map((r) => r.id + ':' + r.k).join(' '));
    ok(`${tag}: 27d. G-02.1-E — ALL FOUR DIALOGS OPEN WITH THE KEYBOARD INSIDE THEM, ON THE CONTROL A TAB WOULD HAVE REACHED. Measured on the shipped file in both browsers: document.activeElement is BODY after either authoring dialog opens through its own topbar control, so the first Tab a student presses is spent getting into a surface they have already opened and a screen reader is told nothing about what appeared. Phase 2 saw it and recorded it as probably its own test pane; it was not the test pane. showModal() will not do it either — the dialog focusing steps skip a dialog with no tabindex and none of these four has one. THE PLACEMENT IS DERIVED AND NOT CHOSEN: it is the FIRST FOCUSABLE, which is where a Tab from the body was going anyway, so nothing about the keyboard order changes and only the number of presses does. That is asserted per dialog rather than by naming a control. THE CONFIRMATION'S ROW IS WHY THIS IS SAFE ON ALL FOUR: its markup puts Cancel first, so the first focusable and the control that keeps the build are the same node, and the accented one is never what a stray Enter would reach. AND ONE TAB MUST MOVE ON to the second control — a placement that landed on the dialog itself, or on the node the first Tab would have reached anyway, satisfies an "inside the dialog" clause and still costs the press this exists to save`,
      d39FocusOnOpen.length === 4
      && d39FocusOnOpen.every((r) => r.open === true && r.inDialog === true
        && r.onBody === false && r.isFirst === true && r.accented === false
        && r.afterTab === r.secondK && r.secondK !== 'NONE'),
      d39FocusOnOpen);

    /* ── 27e. G-02.1-D — Ctrl+Z IN A FIELD REACHES THE BOARD'S UNDO, ONCE. ───────────────
       The rehearsal note drove this on the shipped file and recorded what happens: the
       app's undo is correctly not run, but the browser's native <input> undo is NOT
       suppressed, and the blur that follows COMMITS the rewound text as a fresh rename.

         rename Slash -> Pounce through the field, committed with a real Enter
         Ctrl+Z          -> field reads "Slash", record still "Pounce"
         click away      -> record "Slash", A FRESH RENAME from text nobody typed
         Ctrl+Z, Ctrl+Z  -> two presses to reach the name they had

       Nothing is lost, which is exactly what makes it quiet. THE EXACT SEQUENCE IS DRIVEN
       HERE, with real keystrokes, and one press must be enough. Then the three free-text
       boxes are driven the other way: the paste field is where a student edits a build code
       and the browser must keep undo there, which is the half a suppression written as a
       blanket preventDefault would take away without saying so. */
    await pg.evaluate(() => {
      const d = document.getElementById('act-edit');
      if (d && d.open) { d.close(); }
    });
    const d39ZSaved = await pg.evaluate(() => JSON.stringify(App.state.get()));
    await pg.click('[data-k="act"]'); await pg.waitForTimeout(300);
    const d39ZRec = () => pg.evaluate(() => {
      const d = document.getElementById('act-edit');
      const a = App.state.get().build[d.dataset.edSide].actions
        .find((x) => x.id === d.dataset.edPick);
      const f = document.getElementById('act-edit-name');
      const act = document.activeElement;
      return { name: a ? a.name : null, field: f.value,
        depth: App.state.undoDepth(),
        active: act ? (act.id || act.tagName) : 'NONE',
        onBody: act === document.body };
    });
    const d39ZStart = await d39ZRec();
    // Real keystrokes, never .value =, because the property under test is what
    // Enter and Ctrl+Z do to text a student typed. Local rather than shared
    // with cell 25d's helper, which is declared 3000 lines below this one.
    const d39ZType = async (sel, text, key) => {
      await pg.click(sel);
      await pg.keyboard.press('Control+A');
      await pg.keyboard.type(text);
      if (key) { await pg.keyboard.press(key); }
      await pg.waitForTimeout(180);
    };
    await d39ZType('#act-edit-name', 'Pounce', 'Enter');
    const d39ZRenamed = await d39ZRec();
    await pg.keyboard.press('Control+z'); await pg.waitForTimeout(320);
    const d39ZUndone = await d39ZRec();
    // The blur the note's step 3 takes, through a shipped control.
    await pg.click('#act-edit-side-cats'); await pg.waitForTimeout(250);
    const d39ZBlurred = await d39ZRec();
    await pg.evaluate(() => {
      const d = document.getElementById('act-edit');
      if (d && d.open) { d.close(); }
    });
    await pg.waitForTimeout(150);
    // THE OTHER HALF: the paste field keeps the browser's own undo.
    await pg.click('[data-k="sh"]'); await pg.waitForTimeout(250);
    await pg.click('#share-to-load'); await pg.waitForTimeout(250);
    await pg.click('#sh-load-field');
    await pg.keyboard.type('v1~abc');
    await pg.waitForTimeout(150);
    const d39ZPasteTyped = await pg.$eval('#sh-load-field', (n) => n.value);
    await pg.keyboard.press('Control+z'); await pg.waitForTimeout(250);
    const d39ZPasteUndone = await pg.evaluate(() => ({
      value: document.getElementById('sh-load-field').value,
      depth: App.state.undoDepth(),
      dialogOpen: document.getElementById('share').open === true
    }));
    await pg.evaluate((saved) => {
      [...document.querySelectorAll('dialog')].forEach((d) => { if (d.open) d.close(); });
      App.state.restore(saved);
      App.state.invalidate({ structural: true });
      if (App.render.flush) App.render.flush();
    }, d39ZSaved);
    await pg.waitForTimeout(250);
    const d39ZPutBack = await pg.evaluate(() => JSON.stringify(App.state.get()));
    note(ch, size.name, 'G-02.1-D one press, field and record',
      d39ZUndone.field + ' / ' + d39ZUndone.name);
    ok(`${tag}: 27e. G-02.1-D — Ctrl+Z WITH THE CARET IN A FIELD REACHES THE BOARD'S UNDO, IN ONE PRESS, AND THE THREE FREE-TEXT BOXES KEEP THE BROWSER'S. The rehearsal note drove the shipped file and found the third behaviour neither of this file's two written ones describes: the app's undo was correctly not run, the browser's native input undo was NOT suppressed, and the blur that followed COMMITTED the rewound text as a fresh rename — a new history entry, so two presses were then needed to reach the name the student had. Nothing was lost, which is what made it quiet. The exact sequence is driven here with real keystrokes: rename through the real field committed with a real Enter, then ONE Ctrl+Z, and BOTH the record and the box on screen must be back. THE BOX ON SCREEN IS THE CLAUSE THAT COST A REWRITE — the first fix put the caret back synchronously, and D-19 declines to repaint a focused field, so the record read Slash while the field read Pounce and the next blur was one dispatch away from committing it. The caret goes back on the frame AFTER the repaint now, and the blur that follows is asserted to move nothing. AND THE CARET IS NEVER LEFT ON <body>, which is 113c's rule one surface wider. THE OTHER HALF IS THE EXCLUSION: a student types into the build-code paste box and Ctrl+Z must rewind their TEXT and touch no board, because that box is free text they compose and the artifact never reads it keystroke by keystroke. A suppression written as a blanket preventDefault would take that away with nothing on screen to say so`,
      d39ZStart.name !== 'Pounce'
      && d39ZRenamed.name === 'Pounce' && d39ZRenamed.field === 'Pounce'
      && d39ZRenamed.depth === d39ZStart.depth + 1
      && d39ZUndone.name === d39ZStart.name
      && d39ZUndone.field === d39ZStart.name
      && d39ZUndone.depth === d39ZStart.depth
      && d39ZUndone.onBody === false
      && d39ZUndone.active === 'act-edit-name'
      && d39ZBlurred.name === d39ZStart.name
      && d39ZBlurred.depth === d39ZStart.depth
      && d39ZPasteTyped === 'v1~abc'
      && d39ZPasteUndone.value !== 'v1~abc'
      && d39ZPasteUndone.depth === d39ZStart.depth
      && d39ZPasteUndone.dialogOpen === true
      && d39ZPutBack === d39ZSaved,
      { d39ZStart, d39ZRenamed, d39ZUndone, d39ZBlurred,
        paste: { typed: d39ZPasteTyped, undone: d39ZPasteUndone },
        putBack: d39ZPutBack === d39ZSaved });

    /* -- 27f. D-39 P3-1 -- THE TICK IS IN THE ACCESSIBLE NAME OF THE
       SELECTED CONTROL AND OF NO OTHER, AND THAT IS THE SHIPPED
       BEHAVIOUR RATHER THAN A FIX. Plan 05-D39d.
       ==================================================================
       D-33 P3-7 raised this, D-39 P3-1 re-raised it and widened it -- "the
       hidden tick is still in every unselected control's accessible name,
       and now on three more components" -- and its prescription is to
       reserve the width with padding and write the character only onto the
       selected control.

       BOTH READINGS ARE OF textContent, AND textContent IS NOT THE
       ACCESSIBLE NAME. A node that is not rendered is excluded from the
       name computation, and visibility:hidden is not rendered. So the
       character is in the string a script reads and is not in the string a
       screen reader speaks, and the two audits measured the first while
       writing about the second.

       MEASURED WITH THE INSTRUMENT THAT SETTLES IT -- Chrome's own
       accessibility tree, through CDP, which is the tree the platform hands
       an assistive technology rather than anything this file computes:

         #view-build   (selected)   textContent "The board\u2713"
                                    ACCESSIBLE NAME "The board \u2713"
         #view-fight   (unselected) textContent "The fight\u2713"
                                    ACCESSIBLE NAME "The fight"
         .rr-pill--on               textContent "Cats\u2713"
                                    ACCESSIBLE NAME "Cats \u2713"
         .rr-pill (not --on)        textContent "Mechs\u2713"
                                    ACCESSIBLE NAME "Mechs"

       WHICH IS EXACTLY WHAT [C07]'s THREE-TIMES RULE WANTS. The selected
       control says so in a border, a fill and a tick, and the tick reaches
       the accessible name as a THIRD channel a screen reader gets for free;
       the unselected one says none of it. Taking the prescription would
       have removed the width reservation, put a reflow on every press, and
       traded a channel that works for one that already did.

       SO THIS CELL EXISTS TO KEEP THE CLAIM FROM BEING RAISED A THIRD TIME
       FROM A textContent READ. It asserts both halves -- the tick is in the
       selected name and absent from the unselected one -- on two components
       that D-39 P3-1 names, and it prints both strings beside each other so
       a reader can see the distinction rather than take it on trust. CDP is
       available in both channels here because both are Chromium; a runner
       that could not open a session would REPORT that rather than pass, so
       the session is required. */
    const axName = await (async () => {
      let cdp = null;
      try {
        cdp = await pg.context().newCDPSession(pg);
        await cdp.send('Accessibility.enable');
        await cdp.send('DOM.enable');
      } catch (e) { return null; }
      const doc = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
      return async (sel) => {
        const found = await cdp.send('DOM.querySelector',
          { nodeId: doc.root.nodeId, selector: sel });
        if (!found.nodeId) { return null; }
        const tree = await cdp.send('Accessibility.getPartialAXTree',
          { nodeId: found.nodeId, fetchRelatives: false });
        const named = tree.nodes.find((n) => n.name);
        return named ? named.name.value : null;
      };
    })();
    const TICK = '\u2713';
    const axPairs = [];
    if (axName) {
      for (const sel of ['#view-build', '#view-fight',
        '.rr-pill--on', '.rr-pill:not(.rr-pill--on)']) {
        axPairs.push({
          sel,
          text: await pg.evaluate((q) => {
            const n = document.querySelector(q);
            return n ? n.textContent : null;
          }, sel),
          name: await axName(sel)
        });
      }
    }
    /* THE TWO GROUPS ARE NAMED AND NOT MATCHED, and a first draft is why:
       it split them with indexOf('--on'), and the UNSELECTED pill's own
       selector is `.rr-pill:not(.rr-pill--on)` — which contains that
       substring. Three selected, one unselected, and the cell reddened on
       a board that was correct. A substring test over a selector is a
       parser written by accident. */
    const AX_SELECTED = ['#view-build', '.rr-pill--on'];
    const axOn = axPairs.filter((r) => AX_SELECTED.indexOf(r.sel) !== -1);
    const axOff = axPairs.filter((r) => AX_SELECTED.indexOf(r.sel) === -1);
    note(ch, size.name, 'D-39 P3-1 textContent vs the ACCESSIBLE NAME, selected',
      axOn.map((r) => `${r.sel} ${JSON.stringify(r.text)} -> ${JSON.stringify(r.name)}`)
        .join(' | '));
    note(ch, size.name, 'D-39 P3-1 the same pair, UNSELECTED',
      axOff.map((r) => `${r.sel} ${JSON.stringify(r.text)} -> ${JSON.stringify(r.name)}`)
        .join(' | '));
    ok(`${tag}: 27f. D-39 P3-1 -- THE TICK IS IN THE ACCESSIBLE NAME OF THE SELECTED CONTROL AND OF NO OTHER, AND THAT IS THE SHIPPED BEHAVIOUR RATHER THAN A FIX. D-33 P3-7 raised it and D-39 P3-1 re-raised it and widened it to three more components: "the hidden tick is still in every unselected control's accessible name". BOTH READINGS ARE OF textContent, AND textContent IS NOT THE ACCESSIBLE NAME -- a node that is not rendered is excluded from the name computation and visibility:hidden is not rendered, so the character is in the string a script reads and not in the string a screen reader speaks. Measured here with the instrument that settles it, Chrome's own accessibility tree through CDP, which is the tree the platform hands an assistive technology rather than anything this file computes: the SELECTED view button is named "The board tick" and the unselected one "The fight"; the selected round-rules pill is named "Cats tick" and the unselected one "Mechs". Which is exactly what [C07]'s three-times rule wants -- a border, a fill and a tick, with the tick reaching the accessible name as a third channel a screen reader gets for free. Taking the audit's prescription would have removed the width reservation the hidden span provides, put a reflow on every press, and traded a channel that works for one that already did. THIS CELL EXISTS SO THE CLAIM CANNOT BE RAISED A THIRD TIME FROM A textContent READ, and it prints both strings beside each other so a reader sees the distinction instead of taking it on trust`,
      axName !== null && axPairs.length === 4
      && axOn.length === 2 && axOff.length === 2
      && axOn.every((r) => typeof r.name === 'string' && r.name.indexOf(TICK) !== -1)
      && axOff.every((r) => typeof r.name === 'string' && r.name.indexOf(TICK) === -1)
      && axPairs.every((r) => typeof r.text === 'string' && r.text.indexOf(TICK) !== -1),
      axPairs);

    /* ── 27c. D-38's SECOND DEFECT, THE REAL ONE: A CLOSED <dialog> WAS ON THE PAGE. ──────
       ==================================================================================
       THIS IS THE CELL THE DEVELOPER'S SCREENSHOT ASKED FOR, and it is not the one 27b
       makes. Measured on the shipped file before the rule existed (plan 05-D38, probe
       DLG-FLOW), board tab, nothing pressed:

         #tok-picker  display grid  660 x 728  at document y 3067
         #act-edit    display grid 1040 x 716  at document y 3067
         #share       display none    0 x 0
         #reset-ask   display none    0 x 0

       Two of the four dialogs sat in NORMAL DOCUMENT FLOW at the foot of every page,
       adding 728px of dead height. Open the Actions dialog, scroll down, and the token
       picker's sticky foot — "Emoji" and "Done" — is on screen underneath it through that
       dialog's own 76% backdrop. That is the photograph. `dialog:not([open])` is a
       USER-AGENT rule and an author declaration beats one at every specificity, so D-33
       P1-3's three-block frame switched the closed state off for both in the change that
       gave them their grid.

       NOTHING WITHOUT A LAYOUT ENGINE COULD SEE IT, which is why it survived twenty-two
       rendered changes: the node gate has no stylesheet, both Layer scans read TEXT, and
       the text was correct the whole time. Check 127 asserts the rule; this asserts the
       pixels, and it drives the photographed sequence rather than a state near it. */
    const closedBoxes = () => pg.evaluate(() => [...document.querySelectorAll('dialog')].map((d) => {
      const r = d.getBoundingClientRect();
      return { id: d.id, open: d.open, display: getComputedStyle(d).display,
        w: Math.round(r.width), h: Math.round(r.height) };
    }));
    await shutAll(); await pg.waitForTimeout(120);
    await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(120);
    const allShut = await closedBoxes();
    const docShut = await pg.evaluate(() => document.documentElement.scrollHeight);
    // Each dialog opened in turn: the one open has a box, the other three have none.
    const oneAtATime = [];
    for (const [id, sel] of OPENERS) {
      await shutAll(); await pg.waitForTimeout(80);
      await pg.click(sel); await pg.waitForTimeout(200);
      const boxes = await closedBoxes();
      oneAtATime.push({
        opened: id,
        openBox: boxes.filter((d) => d.id === id)[0],
        othersDrawn: boxes.filter((d) => d.id !== id && (d.h > 0 || d.display !== 'none')).map((d) => d.id)
      });
    }
    // THE PHOTOGRAPHED SEQUENCE: Actions open, scrolled to the foot of the page.
    await shutAll(); await pg.waitForTimeout(80);
    await pg.click('[data-k="act"]'); await pg.waitForTimeout(250);
    await pg.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await pg.waitForTimeout(250);
    const shot = await pg.evaluate(() => {
      const seen = (s) => { const n = document.querySelector(s); const r = n.getBoundingClientRect();
        return { h: Math.round(r.height), onScreen: r.height > 0 && r.bottom > 0 && r.top < window.innerHeight }; };
      return { done: seen('#tok-pick-done'), emoji: seen('#tok-pick-glyphs-label'),
        picker: seen('#tok-picker'), actOpen: document.querySelector('#act-edit').open };
    });
    await pg.screenshot({ path: path.join(process.env.SHOT_DIR || tmpdir(), `d38-closed-dialog-${ch}-${size.name}.png`) });
    await shutAll();
    await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(150);
    const docBack = await pg.evaluate(() => document.documentElement.scrollHeight);
    note(ch, size.name, 'D-38 closed dialogs — drawn / page height',
      `${allShut.filter((d) => d.h > 0).length} of 4 drawn, ${docShut}px`);
    ok(`${tag}: 27c. D-38's SECOND DEFECT, THE REAL ONE — A CLOSED <dialog> OCCUPIES NO SPACE AND PAINTS NOTHING. This is what the developer photographed: on the shipped file #tok-picker was display:grid at 660x728 and #act-edit at 1040x716, BOTH IN NORMAL DOCUMENT FLOW at the foot of every page, and opening the Actions dialog and scrolling down put the token picker's sticky foot — "Emoji" and "Done" — on screen underneath it through that dialog's own 76% backdrop. dialog:not([open]) is a USER-AGENT rule and an author declaration beats one at every specificity, so D-33 P1-3's three-block frame switched the closed state off in the change that gave those two their grid. NOTHING WITHOUT A LAYOUT ENGINE COULD SEE IT — the node gate has no stylesheet and both Layer scans read TEXT, and the text was right the whole time. So: all four closed and none of them drawn; each opened in turn with the other three still not drawn; and THE PHOTOGRAPHED SEQUENCE DRIVEN, Actions open and scrolled to the foot, with the picker's Done and Emoji laid out at zero height and off screen. The page height is read before and after as the same number, because 728px of dead scroll is the half of this a student feels without seeing`,
      allShut.length === 4
      && allShut.every((d) => d.open === false && d.display === 'none' && d.h === 0 && d.w === 0)
      && oneAtATime.length === 4
      && oneAtATime.every((r) => r.openBox.open === true && r.openBox.h > 0 && r.othersDrawn.length === 0)
      && shot.actOpen === true
      && shot.picker.h === 0 && shot.done.h === 0 && shot.emoji.h === 0
      && shot.done.onScreen === false && shot.emoji.onScreen === false
      && docShut === docBack,
      { allShut, oneAtATime, shot, docShut, docBack });

    /* ── 28. D-38's THIRD TAB, IN A REAL BROWSER. ────────────────────────────────────────
       "if you want a how-to-tab, do it separately from the simualtor" — so this is the
       claim no gate without a layout engine can make: pressing the third control puts the
       board, the fight band, the round rules and the projection toggle AWAY and brings a
       rack of prose cards up in their place, and pressing the board control brings all four
       back. Check 125 reads the six [C18] rules by name; this is whether they apply.

       AND IT IS READ FOR BEING READABLE, not only for being present. The region is entirely
       information, so [C10] and [C11]'s standing rule — nothing at or below 14px may carry
       information — binds every line of it; the cards must not spill past the viewport at
       either size; and the measure is capped so a card is a column rather than one wide
       slab. The picture is taken because twenty-two consecutive rendered changes in this
       phase had a defect only a picture showed. */
    await pg.click('#view-howto'); await pg.waitForTimeout(300);
    const ht = await pg.evaluate(() => {
      const seen = (s) => { const n = document.querySelector(s); return n ? getComputedStyle(n).display : 'absent'; };
      const n = document.querySelector('#howto');
      const r = n.getBoundingClientRect();
      const cards = [...document.querySelectorAll('#howto .ht-card')];
      const paras = [...document.querySelectorAll('#howto .ht-card p')];
      return {
        view: document.querySelector('#app').dataset.view,
        pressed: document.querySelector('#view-howto').getAttribute('aria-pressed'),
        on: document.querySelector('#view-howto').className.indexOf('vw-on') !== -1,
        buildOn: document.querySelector('#view-build').className.indexOf('vw-on') !== -1,
        display: getComputedStyle(n).display,
        top: Math.round(r.top), left: Math.round(r.left),
        width: Math.round(r.width), height: Math.round(r.height),
        right: Math.round(r.right), vw: window.innerWidth,
        board: seen('#board'), band: seen('.fg-band'),
        rules: seen('#roundrules'), toggle: seen('#proj-toggle'),
        cards: cards.length,
        narrowest: cards.length ? Math.min(...cards.map(c => Math.round(c.getBoundingClientRect().width))) : 0,
        widestCard: cards.length ? Math.max(...cards.map(c => Math.round(c.getBoundingClientRect().width))) : 0,
        spill: cards.some(c => Math.round(c.getBoundingClientRect().right) > window.innerWidth),
        paras: paras.length,
        smallest: paras.length ? Math.min(...paras.map(p => parseFloat(getComputedStyle(p).fontSize))) : 0,
        widestLine: paras.length ? Math.max(...paras.map(p => Math.round(p.getBoundingClientRect().width))) : 0,
        heads: [...document.querySelectorAll('#howto .ht-card-head')].map(h => h.textContent),
        emptyLeaves: [...document.querySelectorAll('#howto p, #howto h2, #howto h3')]
          .filter(p => p.textContent.trim() === '').length,
        nested: [...document.querySelectorAll('#howto p')].filter(p => p.children.length > 0).length
      };
    });
    await pg.locator('#howto').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d38-howto-${ch}-${size.name}.png`)
    });
    await pg.click('#view-build'); await pg.waitForTimeout(300);
    const htBack = await pg.evaluate(() => {
      const seen = (s) => { const n = document.querySelector(s); return n ? getComputedStyle(n).display : 'absent'; };
      return {
        view: document.querySelector('#app').dataset.view,
        howto: seen('#howto'), board: seen('#board'), rules: seen('#roundrules'),
        pressed: document.querySelector('#view-howto').getAttribute('aria-pressed')
      };
    });
    note(ch, size.name, 'D-38 how-to — cards / narrowest / smallest type',
      `${ht.cards} cards, ${ht.narrowest}px, ${ht.smallest}px`);
    note(ch, size.name, 'D-38 how-to — widest line', `${ht.widestLine}px`);
    ok(`${tag}: 28. D-38's HOW-TO TAB IS A REAL THIRD VIEW AND IT IS READABLE. Pressing the third control writes the view, lights that control and puts the other two out, and the four working surfaces — the board, the fight band, the round rules and the projection toggle — are all display:none WITH A LAYOUT ENGINE PRESENT, which is the claim check 125 can only make by reading the rules by name. Six cards come up in their place with a head and prose in each, and every one of them is asserted for being READABLE rather than merely present: nothing at or below 14px, because [C10] and [C11] both state that rule about themselves and this region is entirely information; no card spilling past the viewport at either size; the measure capped so a card is a column and not a slab; and NO EMPTY LEAF and NO PARAGRAPH NESTING AN ELEMENT, which is [C18]'s content-model rule read from the browser end — a nested paragraph loses its sentence from the Layer C walk. Then the board control brings all four surfaces back and puts the tab away, because a view that can be entered and not left is a page a student is stuck on`,
      ht.view === 'howto' && ht.pressed === 'true' && ht.on === true && ht.buildOn === false
      && ht.display !== 'none' && ht.height > 200 && ht.width > 400
      && ht.right <= ht.vw
      && ht.board === 'none' && ht.band === 'none'
      && ht.rules === 'none' && ht.toggle === 'none'
      && ht.cards === 6 && ht.paras >= 18
      && ht.narrowest >= 300 && ht.spill === false
      && ht.smallest > 14 && ht.widestLine <= 900
      && ht.emptyLeaves === 0 && ht.nested === 0
      && ht.heads.join('|') === 'The board|Tokens|Actions|Sharing|The fight|The round rules'
      && htBack.view === 'build' && htBack.howto === 'none'
      && htBack.board !== 'none' && htBack.rules !== 'none'
      && htBack.pressed === 'false',
      { ht, htBack });

    /* ── 29. D-38's DISPLACEMENT, ON THE SURFACE THE DEVELOPER WAS LOOKING AT. ───────────
       "this part a the bottom looks cluttery" — said about the Actions editor, with a
       screenshot. This is that surface after the displacement, driven open the way a
       student does it and read for three things a node gate cannot see:

         NOT ONE EXPLAINER PARAGRAPH on the author pane. The four-line opening note and
         the three term sentences are on the how-to tab; the proposal pane keeps exactly
         one .ae-note, and it is the READING "Nothing here is applied."

         THE THREE HINTS ARE ON THEIR HEADINGS AND ARE REACHABLE. A tooltip that is not
         on the node a hand travels to is a tooltip nobody finds, so the title is read off
         the legend itself and its text is compared against the sentence that left.

         THE BOX GOT SHORTER. D-33 P1-3 measured this pane at scrollHeight 1087 against
         clientHeight 726 and called it the severe half. The prose leaving is worth real
         pixels and the number is recorded rather than assumed. */
    await pg.click('[data-k="act"]'); await pg.waitForTimeout(350);
    const ae = await pg.evaluate(() => {
      const dlg = document.querySelector('#act-edit');
      const author = document.querySelector('#act-edit-pane-author');
      const body = author.querySelector('.ae-body');
      const legends = [...author.querySelectorAll('.ae-legend')]
        .map((h) => ({ word: h.textContent, say: h.getAttribute('title') || '' }));
      return {
        open: dlg.open,
        authorNotes: author.querySelectorAll('.ae-note').length,
        termNotes: dlg.querySelectorAll('.ae-term-note').length,
        proposeNotes: document.querySelectorAll('#act-edit-propose .ae-note').length,
        proposeSaid: (document.querySelector('#act-edit-propose .ae-note') || {}).textContent,
        legends: legends,
        sides: [...document.querySelectorAll('.ae-side .ae-side-name')].map((n) => n.textContent),
        bodyScroll: body.scrollHeight, bodyClient: body.clientHeight,
        over: body.scrollHeight - body.clientHeight,
        dlgH: Math.round(dlg.getBoundingClientRect().height),
        vh: window.innerHeight
      };
    });
    await pg.locator('#act-edit-pane-author').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d38-actions-${ch}-${size.name}.png`)
    });
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    const wantSay = {
      Cost: 'Spent when the action is used.',
      Needs: 'Must be there for the action to be used. It is not spent.',
      Changes: 'What the action changes, and by how much. Put a minus in front for a change downward.'
    };
    const legendsRight = ['Cost', 'Needs', 'Changes'].every((w) =>
      ae.legends.some((l) => l.word === w && l.say === wantSay[w]));
    note(ch, size.name, 'D-38 the Actions editor — notes / body over',
      `${ae.authorNotes} explainer paragraph(s), body ${ae.bodyScroll} over ${ae.bodyClient} (${ae.over}px hidden)`);
    ok(`${tag}: 29. D-38's DISPLACEMENT ON THE SURFACE THE DEVELOPER WAS LOOKING AT. "this part a the bottom looks cluttery", said about this pane with a screenshot: the author pane now carries NOT ONE explainer paragraph, the three term sentences are tooltips ON THEIR OWN HEADINGS with the exact text that left, and the proposal pane keeps exactly one .ae-note — the READING "Nothing here is applied", which is a fact about what that pane does to the board and stays where a student reads it. The tooltip is read off the LEGEND rather than off the group, because a hint on a node no hand travels to is a hint nobody finds. And the box is measured: D-33 P1-3 recorded this pane at scrollHeight 1087 against clientHeight 726 and called it the severe half of that finding, so the prose leaving is worth real pixels and the number is printed rather than assumed`,
      ae.open === true
      && ae.authorNotes === 0 && ae.termNotes === 0
      && ae.proposeNotes === 1 && ae.proposeSaid === 'Nothing here is applied.'
      && legendsRight === true
      && ae.sides.join('/') === 'Cats/Mechs'
      && ae.over >= 0,
      ae);

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

    /* ── 5. THE ROUND LAYS OUT IN THE ADDENDUM'S ORDER, verified by comparing each
       child's measured TOP rather than by reading the DOM order — the DOM order is
       [S06.7]'s appends and a check that read it would be asserting the code against
       itself. What a room sees is the layout, and flex, order and grid-row can all put
       a correct DOM order on screen upside down.

       ==================================================================
       THIS CELL'S CLAIM WAS TURNED BY D-31 AND THE OLD ONE IS WRITTEN OUT.
       ==================================================================
       WHAT IT ASSERTED (plan 05-15, D-27's addendum): inside ONE column per side,
       top to bottom, side name -> battlefield -> team resources -> picker rows.
       That was one root per side and one continuous run of tops.

       WHAT D-31 SAYS: "separate the current round state from the action input area."
       The run is cut in two and each half gets a panel of its own, so the old
       assertion cannot be made at all — there is no node that is both the battlefield's
       column and the picker's. Read as written it would have gone red on `field: null`,
       which is exactly what the recorded RED run reported before this cell was turned:
       {"cats":{"head":906,"field":null,"team":null,"rows":958}, ...}.

       WHAT IT ASSERTS NOW is the SAME sentence across the new boundary, which is the
       claim D-31 actually makes about it — "the order either side of the cut is
       unchanged". Four things, each a different failure:
         the STATE column reads name -> battlefield -> team resources;
         the INPUT column reads name -> picker rows;
         the whole STATE AREA sits above the whole INPUT AREA, measured as boxes and
           not as DOM order, because that is the half a CSS `order` would invert while
           every containment row in the node gate stayed green;
         and the two areas do not OVERLAP, which is what says they are two panels
           rather than one panel drawn twice.
       The round figure and the column pairing move to 5b. */
    const order = await pg.evaluate(() => {
      const out = {};
      const T = (sel) => {
        const n = document.querySelector(sel);
        return n ? Math.round(n.getBoundingClientRect().top) : null;
      };
      const B = (sel) => {
        const n = document.querySelector(sel);
        if (!n) return null;
        const r = n.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left) };
      };
      ['cats', 'mechs'].forEach((side) => {
        out[side] = {
          head: T('#state-' + side + ' .fg-side-head'),
          field: T('#state-' + side + ' .fg-field'),
          team: T('#state-' + side + ' .fg-team'),
          inHead: T('#decl-' + side + ' .fg-side-head'),
          rows: T('#decl-' + side + ' .fg-rows')
        };
      });
      const rh = document.querySelector('.fg-round-head');
      out.round = rh ? Math.round(rh.getBoundingClientRect().top) : null;
      out.stateArea = B('#fight-state');
      out.inputArea = B('#fight-input');
      out.stateCols = ['cats', 'mechs'].map((s) => B('#state-' + s));
      out.inputCols = ['cats', 'mechs'].map((s) => B('#decl-' + s));
      return out;
    });
    const stateInOrder = (o) => o.head <= o.field && o.field <= o.team;
    const inputInOrder = (o) => o.inHead <= o.rows;
    note(ch, size.name, 'cats STATE column tops name/field/team',
      `${order.cats.head}/${order.cats.field}/${order.cats.team}`);
    note(ch, size.name, 'cats INPUT column tops name/rows',
      `${order.cats.inHead}/${order.cats.rows}`);
    note(ch, size.name, 'D-31 areas, state box vs input box',
      `${order.stateArea.top}-${order.stateArea.bottom} then ${order.inputArea.top}-${order.inputArea.bottom}`);
    ok(`${tag}: 5. D-31 — the STATE column reads name -> battlefield -> team resources, the INPUT column reads name -> picker rows, and the state AREA sits wholly above the input AREA`,
      stateInOrder(order.cats) && stateInOrder(order.mechs)
      && inputInOrder(order.cats) && inputInOrder(order.mechs)
      && order.stateArea !== null && order.inputArea !== null
      && order.stateArea.bottom <= order.inputArea.top, order);
    ok(`${tag}: 5b. [ROUND] is in the STATE area above both of its columns, and the Cats-left / Mechs-right pairing survives INSIDE EACH of the two areas`,
      order.round !== null
      && order.round >= order.stateArea.top && order.round <= order.stateArea.bottom
      && order.round < order.stateCols[0].top && order.round < order.stateCols[1].top
      && order.stateCols[0].top === order.stateCols[1].top
      && order.stateCols[0].left < order.stateCols[1].left
      && order.inputCols[0].top === order.inputCols[1].top
      && order.inputCols[0].left < order.inputCols[1].left,
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
        // D-31: THE GRID'S BOX IS THE INPUT AREA'S SCROLLER NOW, and the selector is
        // qualified rather than left bare — a bare .fg-sides took the FIRST match, which
        // after D-31 is the STATE area's, and this cell would have gone on measuring a
        // box that holds no picker row at all while every clause in it stayed green.
        const sides = document.querySelector('#fight-input .fg-sides').getBoundingClientRect();
        return {
          cats: per('cats'), mechs: per('mechs'),
          sidesBox: { top: Math.round(sides.top), bottom: Math.round(sides.bottom), height: Math.round(sides.height) },
          viewportH: window.innerHeight
        };
      });
      note(ch, size.name, `grid ${label} rows cats/mechs`, `${g.cats.rows}/${g.mechs.rows}`);
      note(ch, size.name, `grid ${label} buttons cats/mechs`, `${g.cats.buttons}/${g.mechs.buttons}`);
      note(ch, size.name, `grid ${label} #fight-input .fg-sides top/height/bottom vs viewport`,
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
        const rows = () => Array.from(document.querySelectorAll('#decl-cats .fg-row'));
        // D-33 P1-2's OWN PROPERTY, MEASURED THE WAY THE AUDIT MEASURED IT: is any
        // row cut by ANY scrolling ancestor? This walks each row's ancestors and
        // compares boxes, so a row hidden inside a bounded container is a FAILURE
        // however far the page is scrolled. It is taken before any scrolling,
        // because clipping by an ancestor is not a function of the page offset.
        const cutBy = (node) => {
          const r = node.getBoundingClientRect();
          let p = node.parentElement;
          while (p && p !== document.body) {
            const cs = getComputedStyle(p);
            if (/auto|scroll|hidden/.test(cs.overflowY) || /auto|scroll|hidden/.test(cs.overflowX)) {
              const pr = p.getBoundingClientRect();
              if (r.top < pr.top - 0.6 || r.bottom > pr.bottom + 0.6
                || r.left < pr.left - 0.6 || r.right > pr.right + 0.6) { return true; }
            }
            p = p.parentElement;
          }
          return false;
        };
        const all = rows();
        const clipped = all.filter(cutBy).length;
        // AND THE LAST ROW IS DRIVEN INTO VIEW, which is what "reachable" means on a
        // box that is no longer a window: the region may be taller than the screen,
        // and every ROW in it must still be readable and pressable.
        const last = all[all.length - 1];
        const before = Math.round(last.getBoundingClientRect().bottom);
        const want = Math.max(0, window.scrollY + before - window.innerHeight + 70);
        window.scrollTo(0, want);
        /* WAITED UNTIL THE SCROLL SETTLES, NOT FOR A FIXED 500ms — TURNED IN THE OPEN
           UNDER D-42. D-42 put the battle scene at the top of the fight tab, 435px
           above this grid at 1920x1080, so the smooth scroll to the last row became
           2156px long and was still moving when the fixed wait ran out: RED recorded
           in both browsers at 1920, asked 2156 and got 1993, the last row at
           1133-1173 of 1080. The property was never in doubt — the row IS reachable
           — so the wait now polls until scrollY reaches the ask or stops moving, for
           at most 3s. Still a smooth scroll, for this banner's own reason. */
        for (let i = 0, prevY = -1; i < 30; i++) {
          await new Promise((r) => setTimeout(r, 100));
          if (Math.abs(window.scrollY - want) < 1 || (i >= 4 && window.scrollY === prevY)) { break; }
          prevY = window.scrollY;
        }
        const lr = last.getBoundingClientRect();
        const n = document.querySelector('#fight-input .fg-sides');
        const r = n.getBoundingClientRect();
        const out = { asked: Math.round(want), got: Math.round(window.scrollY),
          top: Math.round(r.top), bottom: Math.round(r.bottom), vh: window.innerHeight,
          rows: all.length, clipped,
          lastRow: { top: Math.round(lr.top), bottom: Math.round(lr.bottom) },
          lastRowWhole: lr.top >= 0 && lr.bottom <= window.innerHeight,
          maxScroll: Math.round(document.scrollingElement.scrollHeight - window.innerHeight) };
        window.scrollTo(0, 0);
        await new Promise((r2) => setTimeout(r2, 400));
        return out;
      });
      note(ch, size.name, `grid ${label} picker rows clipped by ANY scrolling ancestor`,
        `${reach.clipped} of ${reach.rows}`);
      note(ch, size.name, `grid ${label} the LAST picker row, driven into view`,
        `${reach.lastRow.top}-${reach.lastRow.bottom} of ${reach.vh} at scrollY ${reach.got}`);
      /* ==================================================================
         AND 6b's FIRST CLAUSE IS TURNED A SECOND TIME, BY D-31.
         ==================================================================
         D-28 turned "the box is INSIDE the viewport" into "the box BEGINS on screen".
         D-31 puts a whole second panel above the picker's scroller, and the first
         clause goes the same way the fold clause in cell 18 does — measured, in both
         browsers, with no lane on the page at all:

           #fight-input .fg-sides   @1920x1080        @1366x768
             9-and-3                  904/346/1250      889/246/1134 of 768
             24-a-side                904/346/1250      889/246/1134 of 768

         At 1080 it still begins on screen. At 768 it does not, and no dial reaches
         it: the state area's window is 22vh there and the chrome above the picker is
         the region's heading plus two panels. THE SECOND CLAUSE IS UNTOUCHED AND IS
         DRIVEN AT BOTH SIZES — the page is scrolled and the box re-read, and it comes
         wholly into view at 515/760 of 768 and 726/1072 of 1080. So what was asserted
         at 768 is that the box has a real height and is REACHABLE.

         ==================================================================
         AND D-33 P1-2 TURNS BOTH CLAUSES, BECAUSE THIS CELL WAS GREEN OVER
         THE DEFECT THAT CLOSED THE WHOLE FINDING. Plan 05-D33b.
         ==================================================================
         THE MEASUREMENT THAT SHOULD HAVE BEEN HERE ALL ALONG. Every reading in the
         entries above is of the BOX. Not one of them is of what is INSIDE it, and the
         audit measured what was inside it: #decl-cats held NINE .fg-row and the box
         showed SIX. Three of nine cats were absent from the picker, five of nine from
         the battlefield, with "9 of 9 still standing" printed above both — and with
         one declaration standing the picker hid seven of the nine. Every clause of
         this cell was green throughout. A box that "comes wholly into view" while a
         third of its contents cannot is precisely the reading a bounded scroller
         gives you for free, and it is the reading that let this ship.

         SO THE CLAUSE ABOUT THE BOX IS REPLACED BY TWO CLAUSES ABOUT THE ROWS:
           NO PICKER ROW IS CLIPPED BY ANY SCROLLING ANCESTOR, walked per row and
             compared box against box — the audit's own measurement, and one no page
             offset can satisfy or break, because clipping by an ancestor is not a
             function of the page scroll;
           and THE LAST ROW IS DRIVEN WHOLLY INTO VIEW, which is what "reachable"
             means once the region is no longer a window. P1-2 took the bound off
             .fg-sides, so at 24 a side the region is 1267px tall and CANNOT be
             brought wholly into view at either size — correctly. The old clause
             (reach.bottom <= reach.vh) asserted the opposite and reddened on the
             24-a-side board the moment the bound came off, which is this cell asking
             for a property the fix deliberately gave up.

         THE BOX'S OWN NUMBERS ARE RECORDED RATHER THAN THRESHOLDED, which is check
         9's rule in this same file. Cell 18c carries the other half: the control that
         ends the round is on screen WITH these rows at every offset a room reads them
         from. */
      ok(`${tag}: 6b. ${label} — the grid has a real box and NOT ONE picker row is clipped by any scrolling ancestor, and the LAST row can be driven wholly into view — D-33 P1-2 turned this cell and the banner says why`,
        g.sidesBox.height > 0
        && reach.rows === g.cats.units
        && reach.clipped === 0
        && reach.lastRowWhole === true, { g, reach });
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
          const field = document.querySelector('#state-' + side + ' .fg-field');
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
        const toks = Array.from(document.querySelectorAll('#state-cats .fg-field .tok'));
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
      const t = document.querySelector('#state-cats .fg-field .tok');
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
      const s = document.querySelector('#state-cats [data-fg="bf"][data-fg-val="c1"]');
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

    /* ── 9b. D-39 P2-14 AND P3-5 — THE TOP BAR HAS ONE LEFT EDGE IN BOTH
       VIEWS, AND UNDO IS SET APART FROM THE GROUP IT IS NOT IN. Plan
       05-D39d.
       ==================================================================
       P2-14, measured on the shipped file, both engines, both viewports:
       the control cluster opens at x=159 on the board and at x=487 in a
       fight, under an h1 at 153 and a view switch at 153 that do not
       move. 328px of void arriving on one press. The mechanism is one
       declaration: this cluster is CONTENT-SIZED on the board so its
       justify-content has no slack to spend, and .fg-read's flex:0 0 100%
       makes it FULL-WIDTH in a fight, at which point flex-end pushes
       1278px of tools to the end of 1600. This is the third site of D-33
       P2-1's finding — #roundrules and #howto were the second, in Pass A.

       P3-5's stated mechanism is wrong and its observation is right, and
       both halves are asserted here. Undo is NOT inside the fight group:
       it is a sibling, outside role="group" and outside
       aria-labelledby, which this cell reads off the page rather than
       taking the audit's word for. What was true is that nothing on
       screen said so — 13px to its left against 14px to its right — so
       [C14]'s own .fg-apart hairline moved off the cluster's FIRST child,
       where D-33 P2-1's deletion of .brd-brand had left it drawing
       against nothing, and onto Undo, where there is something to divide.

       THE HEIGHT HALF OF P2-14 IS NOT ASSERTED BECAUSE IT WAS NOT TAKEN.
       The bar still goes 64 -> 101 when a fight starts and the number is
       PRINTED here rather than judged, in cell 9's own manner, so a later
       pass that reserves the row can read what it cost and what it saved.
       deferred-items.md carries the pricing. */
    const barGeom = () => pg.evaluate(() => {
      const x = (n) => (n ? Math.round(n.getBoundingClientRect().x) : null);
      const bar = document.querySelector('#topbar');
      const cluster = bar.querySelector('.brd-cluster');
      const read = bar.querySelector('.fg-read');
      const undo = bar.querySelector('[data-act="undo"]');
      const group = bar.querySelector('[aria-labelledby="fight-label"]');
      return {
        h1: x(document.querySelector('.shell-head h1')),
        views: x(document.querySelector('#views')),
        bar: x(bar), barH: Math.round(bar.getBoundingClientRect().height),
        tools: x(cluster.children[0]),
        readShown: !!read && !read.hidden,
        readFirst: (read && !read.hidden) ? x(read.children[0]) : null,
        undoInGroup: !!(undo && group && group.contains(undo)),
        // THE LINE IS READ OFF THE WRAPPER AND NOT OFF THE BUTTON, which is
        // itself a correction this cell needed. .brd-btn carries a full border
        // and a 999px radius, so a border-left put on the button re-colours the
        // pill's own edge instead of drawing a divider — photographed at 3x
        // before the wrapper went in. So this reads the box the hairline is on,
        // and asserts the BUTTON has none of its own beyond .brd-btn's.
        undoLine: undo ? getComputedStyle(undo.parentElement).borderLeftWidth : null,
        undoWrap: undo ? undo.parentElement.className : null,
        groupLine: group ? getComputedStyle(group).borderLeftWidth : null
      };
    });
    const barBuild = await barGeom();
    await pg.click('#view-fight'); await pg.waitForTimeout(250);
    const barFight = await barGeom();
    await pg.click('#view-build'); await pg.waitForTimeout(250);
    note(ch, size.name, 'D-39 P2-14 first control x, board tab / fight tab',
      `${barBuild.tools} / ${barFight.tools} (bar ${barBuild.bar}, h1 ${barBuild.h1})`);
    // BOTH READINGS ARE TAKEN MID-FIGHT, because cell 9 above already started
    // one and this cell is a guest on that board. So the bar is 101 on both
    // tabs here and the 64 it measures on a page with no fight is NOT what is
    // printed — the growth half of P2-14 was priced and declined, and the
    // number that matters to whoever revisits it is in deferred-items.md.
    note(ch, size.name, 'D-39 P2-14 the reading row x / bar height, both mid-fight',
      `${barFight.readFirst} / ${barBuild.barH} & ${barFight.barH}`);
    note(ch, size.name, 'D-39 P3-5 Undo inside the fight group / its hairline',
      `${barBuild.undoInGroup} / wrap:${barBuild.undoWrap} line:${barBuild.undoLine}`
      + ` group:${barBuild.groupLine}`);
    ok(`${tag}: 9b. D-39 P2-14 AND P3-5 — THE TOP BAR OPENS AT THE SAME x IN BOTH VIEWS, AND UNDO CARRIES THE HAIRLINE THAT SAYS IT IS NOT PART OF THE FIGHT GROUP. The audit measured the control cluster jumping from x=160 on the board to x=495 in a fight, under an h1 and a view switch that stay at 160 — three left edges on one sticky bar, which is D-33 P2-1's finding at its third site. One declaration did it: the cluster is content-sized on the board so flex-end has no slack to spend, and .fg-read's flex:0 0 100% makes it full-width in a fight, where flex-end pushes 1278px of tools to the end of 1600. Both rows open at the bar's own edge now, EXACTLY on it: the 6px the tools used to sit off by was .fg-apart's own margin, and P3-5 moved that hairline away from this group, so the first control is flush with the h1 and the view switch above it. P3-5's HALVES ARE SPLIT HERE ON PURPOSE: its claim that "Undo sits inside the same .brd-tokedit group as the eyebrow" is FALSE and this cell reads containment off the page to say so — Undo is a sibling, outside the role="group" and outside its aria-labelledby, so no screen reader was ever told the caption covered it. What was true is that nothing on screen said so, at 13px against 14px. So [C14]'s hairline moved off the cluster's first child — where D-33 P2-1's deletion of .brd-brand had left it drawing against nothing at all — and onto Undo, which is a separation this bar already spells twice and needs no sixth caption to say. The bar's 64-to-101 growth is PRINTED and not judged: that half was priced and declined`,
      barBuild.tools === barFight.tools
      && barBuild.tools !== null && barBuild.bar !== null
      && barBuild.tools === barBuild.bar
      && barFight.readShown === true && barFight.readFirst === barFight.bar
      && barBuild.h1 === barBuild.bar && barBuild.views === barBuild.bar
      && barBuild.undoInGroup === false
      && barBuild.undoWrap === 'brd-tokedit fg-apart'
      && barBuild.undoLine === '1px' && barBuild.groupLine === '0px',
      { barBuild, barFight });

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

    /* ── 10f. D-33 P2-12 AND P3-8, AND THIS IS THE PIXEL HALF OF ROW 101.
       Plan 05-D33c. Row 101 asserts the ARRANGEMENT — six cards in the panel,
       six in the columns, the same six actions — off a stub with no stylesheet,
       so it cannot tell "in the panel" from "on the screen". This cell is the
       other half, and it is four claims that only a browser can make.

       FIRST, THE PANEL COVERS NOTHING. The audit's P2-12 measured it over the
       control bar's Share and Reset, over .ld-now and over the Mechs column,
       and the cause was arithmetic: --topbar-now is the bar's HEIGHT, which is
       its bottom edge only once it has stuck, and a fixed box is placed against
       the viewport whether it has or not. So every control and reading the
       audit named is read for INTERSECTION with the panel's box, at page scroll
       zero AND scrolled — because the defect existed at one of those and not at
       the other, which is exactly how it survived D-28.

       SECOND, PROJ-05 AND REF-03 ARE BOTH SERVED WITHOUT LEAVING THE VIEW: with
       the panel open, a projection figure and a per-action reference card are
       BOTH on screen with real boxes, in the fight view, with the columns still
       display:none.

       THIRD, THE WAY OUT IS ON THE SURFACE. The panel's own Close is clicked —
       not the toggle a thousand pixels away — and the panel goes; then ONE
       press of the toggle brings it back with its cards. That pair is PROJ-05's
       "one press away" said in both directions.

       FOURTH, NOTHING IS DRAWN TWICE. In the build view during a fight the
       panel's reference section is display:none while the columns carry their
       own six cards, so no student ever sees the same six cards on one screen. */
    await pg.click('#proj-toggle'); await pg.waitForTimeout(300);
    const projCovers = () => pg.evaluate(() => {
      const s = document.querySelector('#strip').getBoundingClientRect();
      const hits = [];
      document.querySelectorAll(
        '#topbar button, #views button, .ld-now, #state-mechs, #decl-mechs, .fg-round-acts button'
      ).forEach((n) => {
        const r = n.getBoundingClientRect();
        if (r.width && r.left < s.right && r.right > s.left
          && r.top < s.bottom && r.bottom > s.top) {
          hits.push((n.id || String(n.className).split(' ')[0]) + ':' + (n.textContent || '').slice(0, 14));
        }
      });
      const bar = document.querySelector('#topbar').getBoundingClientRect();
      return { hits, panelTop: Math.round(s.top), barBottom: Math.round(bar.bottom) };
    });
    const coversTop = await projCovers();
    await pg.evaluate(() => window.scrollTo(0, 600)); await pg.waitForTimeout(300);
    const coversScrolled = await projCovers();
    await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(300);
    const bothServed = await pg.evaluate(() => {
      const fig = document.querySelector('#strip [data-prj="turns"]');
      const card = document.querySelector('#strip .ref-card');
      const box = (n) => { if (!n) return null; const r = n.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
      /* ==============================================================
         D-39 P1-3 — "HAS A BOX" IS TURNED INTO "IS ON THE SCREEN".
         Plan 05-D39b.
         ==============================================================
         WHAT THIS CELL REQUIRED: `card.w > 0 && card.h > 0` — a
         rectangle in the DOM. It was green in four columns for three
         rounds while EVERY ONE of the six cards sat below the fold of
         this panel at BOTH viewports, always:

           1920x1080  panel shows 836, first card at 955
           1366x768   panel shows 524, first card at 880

         The panel is named "Projection and reference" and had never
         once shown the reference. That is the green-over-defect shape
         this project keeps finding, and it is what a box measurement
         buys you when the box is inside a scroller.

         SO THE CLAUSE IS REACHABILITY AT THE RESTING SCROLL OFFSET —
         scrollTop 0, which is the only offset a student who has not
         scrolled will ever be at — read against the PANEL's own box and
         against the viewport. Both readings the panel's name promises
         are asserted the same way, because P1-3's fix must not buy the
         reference at the projection's expense: the audit's own
         prescription was to reorder, and its own second item admits
         that would put the projection below the fold instead. */
      const inPanel = (n) => {
        if (!n) { return false; }
        const s = document.querySelector('#strip').getBoundingClientRect();
        const r = n.getBoundingClientRect();
        return r.width > 0 && r.height > 0
          && r.top >= s.top - 1 && r.bottom <= s.bottom + 1
          && r.top >= 0 && r.bottom <= innerHeight + 1;
      };
      const ref = document.querySelector('#strip .ref-sb');
      const refCS = ref ? getComputedStyle(ref) : null;
      return {
        view: document.querySelector('#app').dataset.view,
        colsHidden: getComputedStyle(document.querySelector('.brd-col')).display === 'none',
        figure: box(fig), figureSays: fig ? fig.textContent : null,
        cards: document.querySelectorAll('#strip .ref-card').length,
        card: box(card), cardSays: card ? card.textContent : null,
        // D-39 P1-3's clauses.
        panelScrollTop: document.querySelector('#strip').scrollTop,
        cardReachable: inPanel(card),
        figureReachable: inPanel(fig),
        refHeadReachable: inPanel(document.querySelector('.ref-sb-head')),
        refPinned: refCS ? refCS.position : null,
        refScrolls: ref ? (refCS.overflowY === 'auto' && ref.scrollHeight > ref.clientHeight) : false,
        // [C16]'s four-layer edge cue survived the sidebar rule's own
        // background declaration — the longhand-not-shorthand trap that
        // block's banner is written about.
        // COUNTED BY THE FUNCTION NAME AND NOT BY SPLITTING ON COMMAS: the
        // cue's stops are color-mix(in srgb, ...) values, so a comma split
        // reads 10 where there are 4. Measured, on the first run of this
        // clause.
        refCueLayers: refCS
          ? (refCS.backgroundImage.match(/linear-gradient\(/g) || []).length : 0,
        head: (document.querySelector('.pv-head .pv-title') || {}).textContent || null,
        close: (document.querySelector('.pv-close') || {}).textContent || null,
        headSticky: document.querySelector('.pv-head')
          ? getComputedStyle(document.querySelector('.pv-head')).position : null
      };
    });
    await pg.click('.pv-close'); await pg.waitForTimeout(300);
    const afterClose = await pg.evaluate(() => ({
      display: getComputedStyle(document.querySelector('#strip')).display,
      proj: document.querySelector('#app').dataset.proj || '',
      expanded: document.querySelector('#proj-toggle').getAttribute('aria-expanded')
    }));
    await pg.click('#proj-toggle'); await pg.waitForTimeout(300);
    const afterReopen = await pg.evaluate(() => ({
      display: getComputedStyle(document.querySelector('#strip')).display,
      cards: document.querySelectorAll('#strip .ref-card').length
    }));
    await pg.click('#view-build'); await pg.waitForTimeout(300);
    const inBuild = await pg.evaluate(() => ({
      panelRef: document.querySelector('.ref-sb')
        ? getComputedStyle(document.querySelector('.ref-sb')).display : null,
      head: document.querySelector('.pv-head')
        ? getComputedStyle(document.querySelector('.pv-head')).display : null,
      colCards: document.querySelectorAll('#col-cats .ref-card, #col-mechs .ref-card').length,
      onScreen: Array.from(document.querySelectorAll('.ref-card'))
        .filter((n) => n.getBoundingClientRect().width > 0).length
    }));
    await pg.click('#view-fight'); await pg.waitForTimeout(250);
    await pg.click('#proj-toggle'); await pg.waitForTimeout(250);
    note(ch, size.name, 'D-33 what the open panel covers, scroll 0 / 600',
      `${coversTop.hits.length ? coversTop.hits.join(',') : 'nothing'} / ${coversScrolled.hits.length ? coversScrolled.hits.join(',') : 'nothing'}`);
    note(ch, size.name, 'D-33 panel top vs bar bottom, scroll 0 / 600',
      `${coversTop.panelTop} vs ${coversTop.barBottom} / ${coversScrolled.panelTop} vs ${coversScrolled.barBottom}`);
    note(ch, size.name, 'D-33 REF-03 in the panel: cards / a card reads',
      `${bothServed.cards} / ${String(bothServed.cardSays).slice(0, 24)}`);
    note(ch, size.name, 'D-39 P1-3 reachable at rest — card / figure / ref head',
      `${bothServed.cardReachable} / ${bothServed.figureReachable} / ${bothServed.refHeadReachable}`);
    ok(`${tag}: 10f. the open panel COVERS NOTHING at either scroll offset, and PROJ-05 and REF-03 are both served without leaving the fight view: a projection figure and a per-action reference card are both ON THE SCREEN inside it AT THE PANEL'S RESTING SCROLL OFFSET while the roster columns are display:none, its header names both readings, its own Close dismisses it and ONE press of the toggle brings it back with its cards — and in the BUILD view the panel's copy is display:none so the six cards are never on one screen twice. THE REACHABILITY CLAUSE IS D-39 P1-3 AND IT IS A TURN: this cell used to require the card to have a non-zero BOX, which it always did, while every one of the six sat below the fold of this panel at both viewports — 955 into an 836px box at 1920, 880 into a 524px box at 1366 — so a panel named "Projection and reference" had never once shown the reference and four columns of real browser were green over it. Now the reference is a sticky, bounded, independently scrolling section pinned to the panel's foot with [C16]'s four-layer cue on it, and BOTH readings are asserted reachable at scrollTop 0, because the fix must not buy one at the other's expense`,
      coversTop.hits.length === 0 && coversScrolled.hits.length === 0
      && coversTop.panelTop >= coversTop.barBottom
      && coversScrolled.panelTop >= coversScrolled.barBottom
      && bothServed.view === 'fight' && bothServed.colsHidden === true
      && bothServed.figure !== null && bothServed.figure.w > 0 && bothServed.figure.h > 0
      && bothServed.cards === 6
      && bothServed.card !== null && bothServed.card.w > 0 && bothServed.card.h > 0
      && String(bothServed.cardSays).length > 0
      && bothServed.panelScrollTop === 0
      && bothServed.cardReachable === true
      && bothServed.figureReachable === true
      && bothServed.refHeadReachable === true
      && bothServed.refPinned === 'sticky' && bothServed.refScrolls === true
      && bothServed.refCueLayers === 4
      && bothServed.head === 'Projection and reference'
      && bothServed.close === 'Close' && bothServed.headSticky === 'sticky'
      && afterClose.display === 'none' && afterClose.proj === ''
      && afterClose.expanded === 'false'
      && afterReopen.display !== 'none' && afterReopen.cards === 6
      && inBuild.panelRef === 'none' && inBuild.head === 'none'
      && inBuild.colCards === 6 && inBuild.onScreen === 6,
      { coversTop, coversScrolled, bothServed, afterClose, afterReopen, inBuild });

    /* ── 10g. D-39 P1-2 — THREE READINGS OF ONE POOL, ON ONE SCREEN, AND
       THEY ARE ONE READING. Plan 05-D39b. This is the pixel half of node
       row 102b.
       ==================================================================
       The audit's measurement, at 1920, three Cats declared, this panel
       open — all three visible at the same instant:

         #pool-cats  (topbar,     y=197) 3 of 3 spoken for · 0 left to spend
         .fg-res     (state card, y=939) 3 of 3 spoken for · 0 left to spend
         #strip      (sidebar)          Action points: 0 of 3 spent so far.

       Row 102b asserts the three agree; it cannot assert they are on
       screen TOGETHER, and being on screen together is the whole of the
       finding — a student who has to scroll between two readings never
       compares them. So this cell reads each one's box and requires all
       three to have a real rectangle at the same moment, and THEN
       requires the figures and the words to match.

       THE DECLARATION IS UNDONE AGAIN before cell 11 runs, by pressing
       the same button a second time, which is the re-press-to-undo path
       [S07.5] already owns. Cell 11 reads an IDLE team reading as its
       baseline and a declaration left standing here would move it. */
    /* THE PANEL IS OPENED IF IT IS NOT ALREADY, rather than pressed
       blind. 10f above ends by pressing the toggle after a trip through
       the build view, and whether that press opens or closes depends on
       what the trip left behind — a first draft pressed it unconditionally
       and read three 0x0 boxes off a panel it had just shut. */
    await pg.evaluate(() => {
      if (document.querySelector('#app').dataset.proj !== '1') {
        document.querySelector('#proj-toggle').click();
      }
    });
    await pg.waitForTimeout(300);
    const d39Pool = () => pg.evaluate(() => {
      const box = (n) => {
        if (!n) { return null; }
        const r = n.getBoundingClientRect();
        return {
          w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.top),
          inView: r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight + 1
        };
      };
      const flat = (n) => n ? n.textContent.replace(/\s+/g, ' ').trim() : null;
      const bar = document.querySelector('#pool-cats');
      const res = document.querySelector('#state-cats .fg-res');
      const spoke = res ? res.querySelector('.fg-res-spoke') : null;
      const left = res ? res.querySelector('.fg-res-left') : null;
      const stripLine = Array.from(
        document.querySelectorAll('#strip [data-dc-live="cats"] .dc-live-read')
      ).filter((n) => /spoken for/.test(n.textContent))[0] || null;
      return {
        barSays: flat(bar), cardSays: flat(res), stripSays: flat(stripLine),
        spoke: spoke ? spoke.textContent : '', left: left ? left.textContent : '',
        boxes: { bar: box(bar), card: box(res), strip: box(stripLine) }
      };
    });
    const poolIdle = await d39Pool();
    await pg.click('#decl-cats [data-fg="act"][data-fg-by="c1"]:not([disabled])');
    await pg.waitForTimeout(300);
    const poolOne = await d39Pool();
    await pg.click('#decl-cats [data-fg="act"][data-fg-by="c2"]:not([disabled])');
    await pg.waitForTimeout(300);
    const poolTwo = await d39Pool();
    const poolAgrees = (p) => p.spoke !== '' && p.left !== ''
      && p.barSays !== null && p.stripSays !== null
      && p.barSays.indexOf(p.spoke) !== -1 && p.barSays.indexOf(p.left) !== -1
      && p.stripSays.indexOf(p.spoke) !== -1 && p.stripSays.indexOf(p.left) !== -1;
    const poolAllBoxed = (p) => ['bar', 'card', 'strip']
      .every((k) => p.boxes[k] !== null && p.boxes[k].w > 0 && p.boxes[k].h > 0);
    // put the board back the way cell 11 expects to find it
    await pg.click('#decl-cats [data-fg="act"][data-fg-by="c2"][aria-pressed="true"]');
    await pg.waitForTimeout(250);
    await pg.click('#decl-cats [data-fg="act"][data-fg-by="c1"][aria-pressed="true"]');
    await pg.waitForTimeout(250);
    const poolBack = await d39Pool();
    /* AND THE PANEL GOES BACK THE WAY 10f LEFT IT, which is CLOSED. This is
       not tidiness either: with it open, .fg-band takes 374px of
       padding-right ([C15]), the lane loses ~330px of width and the picker
       rows wrap — and cell 6b's 24-a-side last row went from 40px to 77px
       and 12px past the fold. Measured, both engines, at 1366 only. A cell
       that changes a layout-wide flag owns putting it back. */
    await pg.evaluate(() => {
      if (document.querySelector('#app').dataset.proj === '1') {
        document.querySelector('#proj-toggle').click();
      }
    });
    await pg.waitForTimeout(250);
    const poolPanelBack = await pg.evaluate(() =>
      document.querySelector('#app').dataset.proj || '');
    note(ch, size.name, 'D-39 P1-2 the three readings, one declared',
      `${poolOne.barSays} || ${poolOne.cardSays} || ${poolOne.stripSays}`);
    note(ch, size.name, 'D-39 P1-2 all three boxed at once / figure moved',
      `${poolAllBoxed(poolOne)} / ${poolIdle.spoke} -> ${poolOne.spoke} -> ${poolTwo.spoke}`);
    note(ch, size.name, 'D-39 P1-2 the three boxes, bar / card / strip',
      ['bar', 'card', 'strip'].map((k) => {
        const b = poolOne.boxes[k];
        return b ? `${k}:${b.w}x${b.h}@${b.y}${b.inView ? '' : ' (off)'}` : `${k}:none`;
      }).join(' '));
    ok(`${tag}: 10g. D-39 P1-2 — THE ACTION-POINT POOL IS ONE READING ON THREE SURFACES AND ALL THREE HAVE A REAL BOX AT THE SAME MOMENT. The audit photographed the topbar and the state card printing "3 of 3 spoken for · 0 left to spend" byte-identically 742px apart while the sidebar 400px away printed "0 of 3 spent so far" about the same pool — two words, two numbers, one glance, on the tab whose instructor line is "watch the pool". Both figures were true of different questions, which is exactly why a student cannot read them side by side. All three go through [S06.7]'s fgPoolWords now, and this cell asserts what node row 102b cannot: that the three are SIMULTANEOUSLY VISIBLE, so the comparison a student makes is a comparison this gate has made. Read at three moments — idle, one declared, two declared — because a surface that agrees at rest and freezes while the others move is the shape D-33 P1-1 was written about; and the declarations are undone again by re-pressing, so cell 11 finds the board it expects`,
      poolAgrees(poolIdle) && poolAgrees(poolOne) && poolAgrees(poolTwo)
      && poolAllBoxed(poolIdle) && poolAllBoxed(poolOne) && poolAllBoxed(poolTwo)
      && poolIdle.spoke !== poolOne.spoke && poolOne.spoke !== poolTwo.spoke
      && poolBack.spoke === poolIdle.spoke
      && poolPanelBack === ''
      && poolOne.stripSays.indexOf('spent so far') === -1,
      { poolIdle, poolOne, poolTwo, poolBack, poolPanelBack });

    /* ── 10i. D-39 P2-10 AND P2-11 — THE TWO SIDES' ROWS SIT ON ONE
       LINE, AND THE RETARGET READING KEEPS ITS OWN CONTROL. Plan
       05-D39d.
       ==================================================================
       P2-10, measured on the shipped file at BOTH viewports: the Cats
       team-resource line at y=953 and the Mechs one at y=878, 75px apart,
       because each column packs under its own battlefield and the Cats
       field is three rows of nine shapes to the Mechs' one row of three.
       D-27's instruction is "show both sides at the same time in
       columns"; the columns were there and the rows were not.

       ITS SECOND SENTENCE IS FALSE AND THIS CELL SAYS SO. The audit adds
       "the same happens to the picker rows below". It does not: both
       .fg-rows in the INPUT area open at y=1256 on the shipped file,
       because that area's two columns carry one heading each and nothing
       that differs. Only the state area drifted, and both areas are read
       here so the correction is a measurement rather than a sentence.

       P2-11's SCROLL HALF IS ALREADY SHIPPED and this is the third audit
       claim of that shape. It says scrollIntoView on the first lit node
       "did not" land; it landed under D-33 P1-7, plan 05-D33b, guarded
       three ways with its own paragraph. Not asserted here — cell 12
       already drives the arming — and recorded so it is not raised again.

       WHAT P2-11 DID LEAVE is the row: 95px against its eight neighbours'
       40, with "Lands on Mech 1." on the first line and "Change target"
       on the second, 496px apart at 1920 with eight other controls
       between them. .fg-row is a wrapping flex line and the two were
       independent items, so the break fell between them. They are one
       item now — the audit's own second option — so the line breaks in
       front of both or behind both and never between.

       THE HEIGHT IS PRINTED AND NOT ASSERTED DOWN. The row is two lines
       at this width either way; what is asserted is that the sentence and
       its button share a line and sit within a gap of each other. */
    const d39Pair = async () => {
      await pg.evaluate(() => {
        const a = document.querySelector('#decl-cats [data-fg="act"]:not([disabled])');
        if (a) { a.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); }
      });
      await pg.waitForTimeout(300);
      return pg.evaluate(() => {
        const box = (n) => {
          if (!n) { return null; }
          const r = n.getBoundingClientRect();
          return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) };
        };
        const at = document.querySelector('#decl-cats [data-fg="at"]');
        const lands = document.querySelector('#decl-cats .fg-lands');
        const row = at ? at.closest('.fg-row') : null;
        const sameLine = (a, b2) => {
          if (!a || !b2) { return false; }
          const ra = a.getBoundingClientRect();
          const rb = b2.getBoundingClientRect();
          return ra.top < rb.bottom && rb.top < ra.bottom;
        };
        return {
          landsBox: box(lands), atBox: box(at),
          onOneLine: sameLine(lands, at),
          gap: (lands && at)
            ? Math.round(at.getBoundingClientRect().left
              - lands.getBoundingClientRect().right) : null,
          paired: !!(lands && at && lands.parentElement === at.parentElement
            && lands.parentElement.className.indexOf('fg-lands-pair') !== -1),
          rowH: row ? Math.round(row.getBoundingClientRect().height) : null
        };
      });
    };
    const d39Rows = () => pg.evaluate(() => {
      const ytop = (n) => Math.round(n.getBoundingClientRect().top);
      const areas = Array.from(document.querySelectorAll('.fg-sides'));
      return areas.map((a) => Array.from(a.children).map((side) => {
        const res = side.querySelector('.fg-res');
        const rows = side.querySelector('.fg-rows');
        const mark = res || rows;
        return mark ? ytop(mark) : null;
      }));
    });
    const pairRead = await d39Pair();
    const rowTops = await d39Rows();
    // put the declaration back, so cell 10h and cell 11 find the board they expect
    await pg.evaluate(() => {
      const a = document.querySelector('#decl-cats [data-fg="act"][aria-pressed="true"]');
      if (a) { a.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); }
    });
    await pg.waitForTimeout(250);
    const areaAligned = rowTops.map((pairY) => pairY.length === 2
      && pairY[0] !== null && pairY[1] !== null
      && Math.abs(pairY[0] - pairY[1]) <= 1);
    note(ch, size.name, 'D-39 P2-10 the two sides, state area / input area',
      rowTops.map((pairY) => pairY.join(' vs ')).join('  |  '));
    note(ch, size.name, 'D-39 P2-11 the reading and its control',
      `${JSON.stringify(pairRead.landsBox)} ${JSON.stringify(pairRead.atBox)}`
      + ` one line=${pairRead.onOneLine} gap=${pairRead.gap} row=${pairRead.rowH}px`);
    ok(`${tag}: 10i. D-39 P2-10 AND P2-11 — THE TWO SIDES' ROWS OPEN ON ONE LINE, AND THE RETARGET READING KEEPS ITS OWN CONTROL BESIDE IT. P2-10 measured the Cats team-resource line at y=953 and the Mechs one at y=878 at both viewports, 75px apart, because each column packs under its own battlefield and the Cats field is three rows of nine shapes to the Mechs' one row of three — the columns D-27 asked for, with the rows not lining up inside them. Fixed by stretching the two columns and letting the FIELD take the slack, which is the half the alignment alone does not do: driven with align-items changed and nothing else, the columns came out equal and the resource lines stayed 953 and 878, because the field kept sizing to its content. Subgrid was declined and the reason is in the stylesheet — it needs this to be a grid, and .fg-side's basis is the number [C14.1]'s own sweep derived against a measured 679px and a 1180px breakpoint. THE AUDIT'S SECOND SENTENCE IS FALSE AND THIS CELL MEASURES IT: "the same happens to the picker rows below" — it does not, both .fg-rows in the INPUT area open at the same y on the shipped file, and both areas are read here so the correction is a measurement. P2-11's SCROLL HALF WAS ALREADY SHIPPED, under D-33 P1-7 in plan 05-D33b, guarded three ways with its own paragraph — the third audit claim of that shape this pass has found. What P2-11 did leave is the row: 95px against its eight neighbours' 40, with the sentence on the first line and its button on the second, 496px apart at 1920 with eight controls between them. They are ONE flex item now, so the wrapping line breaks in front of both or behind both and never between, and the height is PRINTED rather than asserted down because the row is two lines at this width either way`,
      pairRead.paired === true && pairRead.onOneLine === true
      && pairRead.gap !== null && pairRead.gap >= 0 && pairRead.gap <= 24
      && pairRead.landsBox !== null && pairRead.atBox !== null
      && rowTops.length === 2 && areaAligned.every((v) => v === true),
      { pairRead, rowTops, areaAligned });

    /* ── 10h. D-39 P2-5 — THE MID-FIGHT BUILD NOTICE IS PRINTED ONCE,
       ON WHICHEVER TAB THE STEPPERS IT DESCRIBES ARE ON. Plan 05-D39d.
       ==================================================================
       The audit measured, at 1920 with a fight running: #fight-said at
       y=1992 and .dc-said--board at y=2103, both visible, 111px apart,
       carrying the same 51 words. D-33 P2-13 de-duplicated this sentence
       on the BOARD and left a paragraph in the artifact saying the two
       surviving instances "are never on one screen" because #fightbar is
       undisplayed in the build view. That was true when it was written.
       D-38's third tab expired it without touching it: the fight view
       undisplays the roster COLUMNS and leaves #board itself displayed,
       and .dc-said--board spans it at grid-column 1 / -1 precisely so it
       sits above both columns rather than in one of them.

       WHY THIS IS A BROWSER CELL AND NOT A NODE ROW. The stub has no
       stylesheet, so "both are on one screen" is a layout claim — the
       same reason row 92b gives about the projection panel. A node row
       can see two filled nodes; only a browser can see that the fight
       view leaves both of them with a real box.

       AND IT DRIVES ALL THREE TABS, because the fix is a VIEW decision
       and a fix that only handled the tab the fight opens on would be
       exactly as broken for a student who presses "The board" mid-fight
       to reach the steppers the sentence is about. That press runs no
       sync — [S07.6] dispatches no op — so a fill made in [S06.9]'s own
       hook would be stale there. Measured on the first draft of this fix:
       #fightbar's copy stayed filled and #board's stayed empty on the
       board tab, so the notice about the steppers was absent from the one
       tab the steppers are on. It is [S06.10] that fills them now.

       THE COUNT IS OVER NODES THAT ACTUALLY SAY IT, not over nodes that
       exist: dcSaidFill's rule is that hidden and empty are one decision,
       so a silent instance is an EMPTY instance and a Layer C harvest of
       either page finds one sentence and not two. Both are asserted —
       the count of sayers, and that the sayer has a real box on the tab
       that owns it. */
    const d39Notice = () => pg.evaluate(() => {
      const box = (n) => {
        const r = n.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height) };
      };
      const all = Array.from(document.querySelectorAll('#fight-said, .dc-said'));
      const says = (n) => n.textContent.indexOf('steppers on the board') !== -1;
      const sayers = all.filter(says);
      return {
        view: document.querySelector('#app').dataset.view || '',
        count: sayers.length,
        who: sayers.map((n) => n.id || n.className).join(' '),
        boxed: sayers.filter((n) => box(n).w > 0 && box(n).h > 0).length,
        empties: all.filter((n) => !says(n)).length
      };
    });
    const goTab = async (want) => {
      await pg.evaluate((w) => {
        const b = document.querySelector(`.vw-btn[data-vw="${w}"]`);
        if (b) { b.click(); }
      }, want);
      await pg.waitForTimeout(300);
    };
    const noteFight = await d39Notice();
    await goTab('build');
    const noteBoard = await d39Notice();
    await goTab('howto');
    const noteHowto = await d39Notice();
    // AND THE VIEW GOES BACK TO THE FIGHT, which is where cell 10g left it
    // and where cell 11's declarations have to be pressed. A cell that
    // changes a page-wide flag owns putting it back — 10g's own closing
    // paragraph, at a second flag.
    await goTab('fight');
    const noteBack = await d39Notice();
    note(ch, size.name, 'D-39 P2-5 sayers per tab, fight / board / howto',
      `${noteFight.count}:${noteFight.who} | ${noteBoard.count}:${noteBoard.who}`
      + ` | ${noteHowto.count}:${noteHowto.who}`);
    note(ch, size.name, 'D-39 P2-5 the fight tab sayer is boxed / view came back',
      `${noteFight.boxed} of ${noteFight.count} / ${noteBack.view}`);
    ok(`${tag}: 10h. D-39 P2-5 — THE MID-FIGHT BUILD NOTICE IS SAID ONCE, BY THE SURFACE WHOSE TAB IS ON. The audit measured the same 51 words at y=1992 and again at y=2103 with a fight running, both visible, 111px apart — D-33 P2-13's defect re-created one tab over, because that fix left a paragraph in the artifact reasoning that #fightbar and #board are never on one screen and D-38's third tab expired the reasoning without touching it. THE FIGHT VIEW LEAVES #board DISPLAYED: it undisplays the roster COLUMNS, and this note spans the grid at 1 / -1 on purpose so it sits above both of them. So the owner is chosen by the VIEW and all three tabs are driven here, because the sentence is ABOUT the steppers and the fight tab is the one tab none of them is on. The board tab is the clause that matters most and is the one a first draft got wrong: a view press runs no sync, so a fill made in [S06.9]'s own hook is correct on every commit and stale across every tab press. Counted over nodes that SAY it rather than nodes that exist, because hidden and empty are one decision here and a silent instance is an empty one — which is also what keeps the Layer C harvest of either page down to one`,
      noteFight.count === 1 && noteBoard.count === 1 && noteHowto.count === 1
      && noteBack.count === 1
      && noteFight.who === 'fight-said'
      && noteBoard.who.indexOf('dc-said--board') !== -1
      && noteHowto.who.indexOf('dc-said--board') !== -1
      && noteFight.boxed === 1 && noteBoard.boxed === 1
      && noteBack.view === 'fight' && noteBack.who === 'fight-said',
      { noteFight, noteBoard, noteHowto, noteBack });

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
      const t = document.querySelector('#state-' + s + ' .fg-team');
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
      const shapes = Array.from(document.querySelectorAll('#state-cats [data-fg="bf"]'));
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
        otherSideLit: document.querySelectorAll('#state-mechs .bf-unit--lit').length
      };
    });
    note(ch, size.name, 'lit shapes / roster', `${lit.lit}/${lit.roster}`);
    ok(`${tag}: 12. pressing Change target lights EVERY shape of the opposing roster and none of its own`,
      lit.lit === lit.roster && lit.lit === lit.shapes && lit.otherSideLit === 0
      && lit.styled === lit.lit && lit.spoken === lit.lit, lit);
    const pickId = await pg.evaluate(() => App.state.get().fight.cats.units[App.state.get().fight.cats.units.length - 1].id);
    await pg.click(`#state-cats [data-fg="bf"][data-fg-val="${pickId}"]`);
    await pg.waitForTimeout(250);
    const ctMoved = await pg.evaluate(() => {
      const row = document.querySelector('#decl-mechs .fg-row .fg-lands');
      const rec2 = App.state.get().fight.decl.filter((d) => d.side === 'mechs' && d.by === 'm1')[0];
      return {
        says: row ? row.textContent.trim() : null, at: rec2 ? rec2.at : null,
        stillLit: document.querySelectorAll('#state-cats .bf-unit--lit').length
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
      return { at: rec2 ? rec2.at : null, lit: document.querySelectorAll('#state-cats .bf-unit--lit').length };
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
        // D-39 P1-5. Not "is there an action box" — the box was always there
        // and always had leaves — but "is an action LINE inside the card's own
        // box at the card's resting scroll offset". The audit measured 66% and
        // 76% of a card hidden with every action line in the hidden part, and
        // this cell was green over it in four columns for three plans, because
        // a leaf count cannot see a fold.
        const cr = c.getBoundingClientRect();
        const insideCard = (n) => {
          const r = n.getBoundingClientRect();
          return r.top >= cr.top - 1 && r.bottom <= cr.bottom + 1;
        };
        const actLines = Array.from(c.querySelectorAll('.ld-act-line'));
        return {
          round: c.dataset.ldRound,
          board: leavesOf(bx).length,
          acts: leavesOf(c.querySelector('.ld-acts')).length,
          says: leavesOf(c.querySelector('.ld-acts')).join(' ').slice(0, 70),
          childOrder: Array.from(c.children).map((n) => n.className),
          actLines: actLines.length,
          actLinesInside: actLines.filter(insideCard).length,
          firstActInside: actLines.length > 0 && insideCard(actLines[0]),
          firstActReads: actLines.length > 0
            ? actLines[0].textContent.replace(/\s+/g, ' ').trim() : '',
          cardBox: Math.round(cr.height), cardContent: c.scrollHeight,
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
    note(ch, size.name, 'D-39 P1-5 action lines inside a card',
      lane.perCard.map((c) => c.actLinesInside + '/' + c.actLines).join(' '));
    note(ch, size.name, 'D-39 P1-5 card box / content',
      lane.perCard[0].cardBox + ' of ' + lane.perCard[0].cardContent);
    ok(`${tag}: 17b. EVERY card shows the board as it stood AND the actions that were selected — and under D-29 the board half is SYMBOLS with the prose on the hover. TURNED IN THE OPEN UNDER D-39 P1-5, AND THIS CELL IS WHY THAT FINDING SURVIVED THREE PLANS: it counted LEAVES in the action box and required the count to be non-zero, which was true of a card that showed the actions and equally true of a card that had them 500px below its own fold. The audit photographed exactly that — 66% of a card hidden at 1920 and 76% at 1366, with the whole Mechs block AND EVERY ACTION LINE in the hidden part — and four columns of real browser were green over it, because a leaf count cannot see a fold. So the clause is now GEOMETRIC: at least one .ld-act-line is wholly inside the card's own box at the card's resting scroll offset, on EVERY card, and the first one is the one asserted so a card showing its last line and hiding its first would fail. AND THE CHILD ORDER IS READ WITH IT — round number, then the actions, then the board — because that reordering is the fix and a dial is not: re-measured at 1366x768 with twelve declarations a round, the board-first card showed 0 of 12 action lines at every setting from 15vh to 34vh and 1 of 12 at 40vh, which is 305px of a 768px window. The note beside this cell prints how many action lines each card actually holds inside itself in this column`,
      lane.perCard.length === 3
      && lane.perCard.every((c) => c.board > 0 && c.acts > 0)
      && lane.perCard.every((c) => c.syms > 0 && c.toks > 0 && c.saidCount > 0)
      && lane.perCard.every((c) => c.textNamesType === false && c.saidNamesType === true)
      && lane.perCard.every((c) => c.childOrder[0] === 'ld-round'
        && c.childOrder.indexOf('ld-acts') === 1
        && c.childOrder.indexOf('ld-board') === 2)
      && lane.perCard.every((c) => c.actLines > 0 && c.firstActInside === true),
      lane.perCard);

    /* ── 17c. D-39 P3-7 — .ld-now IS DRAWN AS A CARD, AND THE REASON IT
       WAS NOT IS A COMMENT THAT CLOSED IN THE MIDDLE OF ITSELF. Plan
       05-D39d.
       ==================================================================
       The audit: ".ld-now is still not a card. Measured border-width:
       0px, background-color: rgba(0,0,0,0), beside three .ld-rows at
       border-width: 1px. D-33 P1-5's second half did not land."

       ITS MEASUREMENT IS EXACT AND ITS CONCLUSION IS WRONG. The second
       half DID land — the rule is in [C14.2], it has been since D-33c,
       and it carries a border, a radius and an accent-derived fill. What
       nobody could see is that the parser never got it: a comment CLOSE
       sat in the middle of the paragraph above the rule, the prose after
       it became CSS, and error recovery on an invalid selector skips to
       the next brace and DISCARDS THE BLOCK. Six declarations, deleted in
       silence, for three plans, with the source looking perfectly right
       to every reader who opened it.

       SO THE COMPARISON IS THE AUDIT'S OWN AND IT IS MADE HERE. The card
       and the rows beside it are read for the same three properties at
       the same instant, and the card is required to have a border and a
       fill of its own rather than to match the rows' — it is deliberately
       tinted from --accent where they are neutral, which is [C14.2]'s
       own paragraph about where the past stops and the present starts.
       Node row 125b holds the general claim about the source; this holds
       the one about the pixels, because a rule can also be lost to a
       specificity fight that no source scan would ever see. */
    const ldNowCard = await pg.evaluate(() => {
      const three = (n) => {
        if (!n) { return null; }
        const cs = getComputedStyle(n);
        const r = n.getBoundingClientRect();
        return {
          bw: cs.borderTopWidth, bg: cs.backgroundColor, disp: cs.display,
          radius: cs.borderTopLeftRadius,
          w: Math.round(r.width), h: Math.round(r.height)
        };
      };
      const rows = Array.from(document.querySelectorAll('.ld-row')).map(three);
      return { now: three(document.querySelector('.ld-now')), rows };
    });
    const clear = (c) => c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
    note(ch, size.name, 'D-39 P3-7 .ld-now border / fill / display',
      ldNowCard.now
        ? `${ldNowCard.now.bw} ${ldNowCard.now.bg} ${ldNowCard.now.disp}`
        : 'no .ld-now');
    note(ch, size.name, 'D-39 P3-7 the .ld-row borders beside it',
      ldNowCard.rows.map((r) => r.bw).join(' '));
    ok(`${tag}: 17c. D-39 P3-7 — THE NEWEST ROUND IS DRAWN AS A CARD, LIKE THE THREE PAST ROUNDS BESIDE IT. The audit measured .ld-now at border-width 0px and background rgba(0,0,0,0) against three .ld-rows at 1px and concluded D-33 P1-5's second half "did not land". The measurement is exact and the conclusion is wrong, and the difference matters: the rule landed in D-33c and the PARSER threw it away. A comment close sat in the middle of the paragraph above it, the prose after that close stood in the stylesheet as CSS, and recovery from an invalid selector skips to the next brace and DISCARDS the block after it — which was this one. Six declarations deleted in silence, for three plans, with source that read correctly to everyone who opened it. This cell makes the audit's own comparison: the card and the rows are read for border, fill and display at the same instant. The card must have a border and a fill OF ITS OWN rather than the rows' — it is tinted from --accent where they are neutral, which is [C14.2]'s paragraph about where the past stops and the present starts. Node row 125b holds the claim about the source; this one holds the claim about the pixels, because a rule can also be lost to a specificity fight no source scan would see`,
      ldNowCard.now !== null && ldNowCard.rows.length === 3
      && ldNowCard.now.bw === '1px' && clear(ldNowCard.now.bg) === false
      && ldNowCard.now.disp === 'flex' && ldNowCard.now.radius !== '0px'
      && ldNowCard.now.w > 0 && ldNowCard.now.h > 0
      && ldNowCard.rows.every((r) => r.bw === '1px')
      && ldNowCard.rows.every((r) => r.bg !== ldNowCard.now.bg),
      ldNowCard);
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

    /* -- 18. AND THE ROUND BEING PLAYED IS STILL REACHABLE UNDER THAT LANE, which is
       the arithmetic D-28 changed and the defect this phase has now measured and fixed
       four times.

       ==================================================================
       THIS CELL'S CLAIM WAS TURNED BY D-31 AND THE OLD ONE IS WRITTEN OUT.
       ==================================================================
       WHAT IT ASSERTED (plan 05-D28): the Advance control is ABOVE THE FOLD at page
       scroll zero, at BOTH sizes, with three rounds in the lane. True while the two
       round controls sat on the round's own line at the top of the region.

       WHAT D-31 SAYS: the two controls belong with the ACTION INPUT, because Advance
       is what commits what the input declared. That puts them below a whole second
       panel, and the sweep in [C14.1] is what settles whether they can still clear a
       fold - measured in real Chrome, three rounds resolved, twelve declarations
       standing, the state area's window swept from 12vh to 32vh:

         state window   @1920x1080 Advance      @1366x768 Advance
           12vh            949 of 1080            869 of 768   BELOW
           22vh           1057 of 1080  shipped   947 of 768   BELOW
           26vh           1100 of 1080  BELOW     973 of 768   BELOW

       AT 1366x768 NO SETTING CLEARS IT, INCLUDING ZERO. Read the 869 against its 92px
       window: the chrome alone - the fight region's heading, two panels' borders,
       padding, gaps and head lines, and the 47px of button itself - is 777px on a
       768px screen. There is no free term in that arithmetic and no dial that reaches
       it, which is why this cell is TURNED rather than the number being tuned until it
       passed.

       WHAT IT ASSERTED UNTIL D-33 P1-6, in three clauses. At 1920x1080 the old claim
       stood unchanged and unweakened: above the fold at page scroll zero. At 1366x768
       the reading was asserted to be what the sweep says it is - the control has a
       real box, it is ENABLED, and it is within ONE page scroll of the fold rather
       than somewhere off the end of a document. And at BOTH sizes cell 18c drove the
       property the fold was standing in for.

       ==================================================================
       AND D-33 P1-6 TURNS IT AGAIN, THIS TIME BY MAKING THE FOLD CLAIM
       IRRELEVANT RATHER THAN BY WEAKENING IT. Plan 05-D33b.
       ==================================================================
       The audit: "the destructive control outranks the commit control, and both sit
       above what they act on." The two controls move to the FOOT of #fight-input and
       become a STICKY FOOTER - `position:sticky; bottom:0` - so the control is pinned
       to the bottom of the window for as long as any part of the area it commits is
       on screen, and settles onto the true foot only at that area's end.

       SO "ABOVE THE FOLD AT PAGE SCROLL ZERO" IS NOT THE PROPERTY ANY MORE AND IS NOT
       ASSERTED. Measured after the change, three rounds in the lane, at page scroll
       zero: 1158-1204 of 1080 at 1920x1080 and 1121-1167 of 768 at 1366x768 - both
       BELOW, both correct, because at page scroll zero the picker rows are below the
       fold too and a control pinned to a region nobody has scrolled to has nothing to
       pin against. A cell asserting the old clause here would be asserting that the
       commit sits above the rows, which is the arrangement D-33 removed.

       WHAT IT ASSERTS NOW is the MECHANISM, because the pixels moved to 18c and a
       mechanism this cell can read is the half a screenshot cannot: the control has a
       real box and is ENABLED; the row that carries it computes to `position: sticky`
       with a real `bottom` inset; and EVERY ANCESTOR of that row reports a visible
       overflow. That last clause is [C03]'s sticky gotcha asserted rather than
       trusted - one `overflow:hidden` on any ancestor silently turns the sticky footer
       back into a static one, no error anywhere, and the control goes back under the
       fold exactly as PROBE BO measured it. It is cell 10's shape, held for the second
       sticky element on the page. */
    const under = await pg.evaluate(async () => {
      const R = (s) => { const n = document.querySelector(s); if (!n) return null; const r = n.getBoundingClientRect();
        return { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom) }; };
      // AWAITED, for [C01]'s smooth scrolling - and READ BACK, because the two
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
        stateSides: R('#fight-state .fg-sides'), inputSides: R('#fight-input .fg-sides'),
        field: R('#state-cats .fg-field'),
        team: R('#state-cats .fg-team'), rows: R('#decl-cats .fg-rows'),
        lane: R('#ledger-list'),
        advanceEnabled: document.querySelector('#fightbar [data-fg="advance"]').disabled === false,
        // D-33 P1-6's mechanism, read off the computed style and off every
        // ancestor - see this cell's banner for why the gotcha is asserted.
        acts: (() => {
          const n = document.querySelector('#fight-input .fg-round-acts');
          if (!n) return null;
          const cs = getComputedStyle(n);
          const bad = [];
          let p = n.parentElement;
          while (p) {
            const c = getComputedStyle(p);
            if (c.overflowX !== 'visible' || c.overflowY !== 'visible') {
              bad.push((p.id ? '#' + p.id : p.tagName.toLowerCase())
                + ' ' + c.overflowX + '/' + c.overflowY);
            }
            p = p.parentElement;
          }
          const kids = n.parentElement.children;
          return {
            position: cs.position, bottom: cs.bottom,
            last: kids[kids.length - 1] === n,
            clippedAncestors: bad
          };
        })()
      };
    });
    const foldSize = size.height >= 1000;
    note(ch, size.name, 'Advance top/bottom vs viewport, 3 rounds in the lane',
      `${under.advance.top}/${under.advance.bottom} of ${under.vh}`);
    note(ch, size.name, 'D-31 state / input scroller top/height/bottom, 3 rounds in the lane',
      `${under.stateSides.top}/${under.stateSides.h}/${under.stateSides.bottom}`
      + ` then ${under.inputSides.top}/${under.inputSides.h}/${under.inputSides.bottom} of ${under.vh}`);
    note(ch, size.name, 'battlefield / team / rows tops, 3 rounds in the lane',
      `${under.field.top} / ${under.team.top} / ${under.rows.top}`);
    // THE CLAIM IS MADE ABSOLUTE BY ADDING THE OFFSET BACK. `advance.top + scrollY`
    // is the control's distance from the top of the DOCUMENT, so the assertion is
    // "above the fold at a page scroll of zero" whatever offset the browser had
    // actually settled at when the reading was taken.
    note(ch, size.name, 'Advance from the top of the DOCUMENT, 3 rounds in the lane',
      `${under.advance.top + under.scrollY} of ${under.vh} (read at scrollY ${under.scrollY})`);
    note(ch, size.name, 'D-33 the commit row: position / bottom / last child / clipped ancestors',
      under.acts === null ? 'MISSING'
        : `${under.acts.position} ${under.acts.bottom} last=${under.acts.last}`
          + ` clipped=${under.acts.clippedAncestors.length}`);
    ok(`${tag}: 18. with three rounds in the lane the Advance control is enabled, has a real box, and the row that carries it is a STICKY FOOTER at the foot of the area it commits with NO clipping ancestor - D-33 P1-6 turned this cell's fold clause and the banner says why`,
      under.advance.top + under.scrollY >= 0
      && under.advanceEnabled === true
      && under.advance.h > 0 && under.advance.w > 0
      && under.acts !== null
      && under.acts.position === 'sticky'
      && /^-?\d/.test(under.acts.bottom) && under.acts.bottom !== 'auto'
      && under.acts.last === true
      && under.acts.clippedAncestors.length === 0,
      { foldSize, under });
    ok(`${tag}: 18b. the round, the lane, the battlefield, the team resources and the picker rows all have a real box`,
      [under.roundHead, under.lane, under.field, under.team, under.rows]
        .every((b) => b !== null && b.w > 0 && b.h > 0)
      && under.roundN !== '', under);

    /* -- 18c. THE PROPERTY THE FOLD WAS STANDING IN FOR, DRIVEN - new with D-31 and the
       cell that replaces what 18 gave up at 768.

       "A student who has to scroll to advance is the same failure as a board below the
       fold, arriving one region along" - [C14.1]'s own sentence, and what it is really
       about is that the control must be THERE when a student reaches for it. Under
       D-31 Advance sits at the TOP of the area whose rows a student declares in, so
       the page scroll that brings the picker into view brings the control with it.

       THIS IS DRIVEN AND NOT REASONED ABOUT. The page is scrolled until the picker
       rows are in view - awaited, for [C01]'s smooth scrolling, in cell 6b's recorded
       manner - and then BOTH boxes are read at that offset. Advance must be WHOLLY on
       screen, and the rows must be on screen with it, at the same instant. A version
       of this layout that put the controls at the FOOT of the input area would pass
       every containment row in the node gate and fail here, which is exactly the
       defect class this cell inherits.

       AND THE LAST CLAUSE WAS ADDED BY PROBE BO RATHER THAN WRITTEN WITH THE CELL,
       which is recorded because the first draft was GREEN over the exact defect it
       exists for. The probe moved the two controls to the FOOT of the input area:
       Advance read 1408 of a 1080 viewport, cell 18 caught it at 1080, this cell did
       NOT — at the offset a room declares from, the control was at 747-794 and the
       rows at 443-883, so both were on screen and every clause was satisfied by a
       control BELOW the thing it commits. So the ORDER was asserted too: Advance
       ABOVE the picker rows.

       ==================================================================
       D-33 P1-6 MAKES THE ORDER CLAUSE FALSE ON PURPOSE, AND REPLACES IT
       WITH A SWEEP THAT IS STRICTLY STRONGER THAN IT WAS. Plan 05-D33b.
       ==================================================================
       The audit's finding is that the commit sitting ABOVE the nine rows it commits
       is the defect, not the fix — "the commit follows what it commits" — alongside
       the destructive control being the brightest object in the region. So the pair
       is at the FOOT now, and PROBE BO's arrangement is the shipped one.

       WHAT MAKES THAT SAFE IS `position:sticky; bottom:0`, WHICH THE PROBE DID NOT
       HAVE. Cell 18 asserts the mechanism. This cell asserts the CONSEQUENCE, and it
       does it as a SWEEP rather than at one offset, because one offset is exactly
       what PROBE BO slipped through: the page is scrolled to five fractions of its
       own scrollable height, and at EVERY offset where any picker row is on screen
       the Advance control must be WHOLLY on screen at that same instant. A static
       footer fails that at the first offset where the rows begin; the pre-D-33 head
       placement would have passed it, which is correct — both arrangements hold the
       property, and this cell is about the property rather than about a position.

       THE ORDER CLAUSE IS INVERTED RATHER THAN DROPPED, AND IT IS TAKEN AT THE ONE
       OFFSET WHERE IT MEANS ANYTHING — the one where the input area's own BOTTOM EDGE
       is on screen, which is where a sticky footer stops floating and SETTLES onto the
       foot it belongs to. There the control must sit at or below the last row's top,
       which is "after the rows" measured in pixels rather than in child order.

       ASKING FOR IT AT EVERY OFFSET WAS THE FIRST DRAFT AND IT WENT RED CORRECTLY:
       at y=1098 of a 2196 span, nine rows in view, the footer was pinned at 674 while
       the last row sat below it. THAT IS WHAT A STICKY ACTION BAR DOES and it is the
       cost of the idiom said out loud rather than asserted around — while the region
       is taller than the window the bar floats OVER its last ~90px, and scrolling
       further clears it. What must never happen is the bar being unreachable, which is
       the clause above, or the bar settling anywhere but after the rows, which is this
       one. A regression that put the pair back on the head line fails both, and node
       check 108's last-child clause is the third reading of the same fact.

       MEASURED WHEN IT WENT IN, three rounds in the lane, real Chrome:
         1920x1080  four offsets with rows in view, Advance wholly on screen at all
                    four (986-1033, 986-1033, 967-1014, 714-761 of 1080)
         1366x768   three offsets with rows in view, all three (674-721, 674-721,
                    403-449 of 768) — which is the fold claim D-31 wrote down as
                    unreachable at this size, held at every one of them. */
    const together = await pg.evaluate(async () => {
      const R = (s) => { const n = document.querySelector(s); const r = n.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) }; };
      const span = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const out = { vh: window.innerHeight, span, samples: [] };
      for (const frac of [0, 0.25, 0.5, 0.75, 1]) {
        window.scrollTo(0, Math.round(span * frac));
        await new Promise((r) => setTimeout(r, 420));
        const a = R('#fightbar [data-fg="advance"]');
        const rows = Array.from(document.querySelectorAll('#decl-cats .fg-row'))
          .map((n) => n.getBoundingClientRect());
        const inView = rows.filter((r) => r.bottom > 0 && r.top < window.innerHeight);
        const last = rows[rows.length - 1];
        const area = document.querySelector('#fight-input').getBoundingClientRect();
        out.samples.push({
          y: Math.round(window.scrollY),
          advance: a,
          rowsInView: inView.length,
          advWhole: a.top >= 0 && a.bottom <= window.innerHeight && a.h > 0,
          // THE FOOTER HAS SETTLED when the area's own foot is on screen. Until
          // then it is pinned to the window and floats over the rows, by design.
          settled: area.bottom <= window.innerHeight + 1 && area.bottom > 0,
          lastRowInView: last.bottom > 0 && last.top < window.innerHeight,
          advBelowLastRow: a.top >= Math.round(last.top)
        });
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 420));
      return out;
    });
    const withRows = together.samples.filter((s) => s.rowsInView > 0);
    const atLastRow = together.samples.filter((s) => s.settled && s.lastRowInView);
    note(ch, size.name, 'D-33 Advance against the picker rows, swept over five page offsets',
      together.samples.map((s) => `y${s.y}:${s.advance.top}-${s.advance.bottom}/${s.rowsInView}rows${s.settled ? '/settled' : ''}`).join('  '));
    ok(`${tag}: 18c. at EVERY page offset where a picker row is on screen the Advance control that commits them is WHOLLY on screen with it, and where the footer has SETTLED onto the foot of the area it sits AFTER the last row - D-33 P1-6 inverted the order clause and the banner says why`,
      withRows.length > 0 && withRows.every((s) => s.advWhole === true)
      && atLastRow.length > 0 && atLastRow.every((s) => s.advBelowLastRow === true),
      together);

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
    /* THE LANE IS BROUGHT ON SCREEN FIRST — TURNED IN THE OPEN UNDER D-42. This cell
       found its reading at page scroll zero, which was a property of the page rather
       than of the claim: D-42 put the battle scene above the lane, and at 1366x768
       the lane then began at 759 of a 768 window, so every reading was rejected as
       off-screen (RED recorded in both browsers at 1366: 29 outside the lane's box,
       9 outside the window, none found). What the cell asserts — a real mouse on a
       reading finds the prose on both channels — says nothing about where the page
       is scrolled, so the page is scrolled to the lane, the way a student reaches it. */
    await pg.evaluate(async () => {
      const lane = document.querySelector('#ledger-list');
      if (lane) { lane.scrollIntoView({ block: 'center', behavior: 'instant' }); }
      await new Promise((r) => setTimeout(r, 200));
    });
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
       projector.

       AND D-30's GEOMETRY IS MEASURED HERE, WHICH IS THE ONLY PLACE IT CAN BE.
       "make the - for removing a resource red and make it appear in the
       top-left corner (25% from the top, center aligned to the left edge) of
       the symbol/shape". The node gate can read the sign's PARENT and nothing
       else — it has no layout engine, so `left:0` and `top:25%` are strings to
       it. Here they are numbers: the mark's CENTRE against the shape's own
       rect, as an absolute offset in x and as a FRACTION of the shape's height
       in y. The fraction rather than a pixel count is deliberate — 3px is the
       right answer only while --tok is 12px, and [C00]'s rehearsal dial exists
       to be turned. Measured chrome and msedge, 1920x1080 and 1366x768: dx 0.00
       and dy 0.2500 in all four. */
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
        signSize: sign ? parseFloat(getComputedStyle(sign).fontSize) : 0,
        // D-30. The mark's CENTRE against the shape it is parented to.
        signOnShape: !!(sign && sign.parentElement
          && sign.parentElement.classList.contains('tok')),
        geom: (() => {
          if (!sign || !sign.parentElement) return null;
          const sr = sign.getBoundingClientRect();
          const pr = sign.parentElement.getBoundingClientRect();
          if (!(pr.height > 0)) return null;
          return {
            dx: +((sr.left + sr.width / 2) - pr.left).toFixed(2),
            dy: +(((sr.top + sr.height / 2) - pr.top) / pr.height).toFixed(4),
            shape: [Math.round(pr.width), Math.round(pr.height)]
          };
        })(),
        signColor: sign ? getComputedStyle(sign).color : null,
        // The colour the reading around it inherits, so "the mark is red" is a
        // claim about a DIFFERENCE rather than about a string.
        boxColor: sym ? getComputedStyle(sym).color : null,
        taken: App.render.SYM_TAKEN
      };
    });
    note(ch, size.name, 'a picker cost', cost === null ? 'NOT FOUND'
      : `${JSON.stringify(cost.text)} sign ${JSON.stringify(cost.signText)} ${cost.signBox ? cost.signBox.w + 'x' + cost.signBox.h : '-'} token ${cost.tokBox ? cost.tokBox.w + 'x' + cost.tokBox.h : '-'} -> ${JSON.stringify(cost.title)}`);
    note(ch, size.name, 'D-30: the mark on a picker cost — dx / dy-fraction / colour',
      cost === null || cost.geom === null ? 'NOT FOUND'
        : `centre ${cost.geom.dx}px from the shape's left edge, ${cost.geom.dy} down a ${cost.geom.shape.join('x')} shape, ${cost.signColor}`);
    ok(`${tag}: 21. a cost on the picker renders as U+2212 plus the type's own token, both with real boxes, with the prose on the hover and the type named nowhere in the button's own text`,
      cost !== null && cost.signIsMinus === true
      && cost.signBox !== null && cost.signBox.w > 0 && cost.signBox.h > 0
      && cost.tokBox !== null && cost.tokBox.w > 0 && cost.tokBox.h > 0
      && cost.signSize >= 18
      && typeof cost.title === 'string' && cost.title.length > 0
      && cost.label === cost.title
      && cost.title.indexOf(cost.taken) === 0
      && cost.text.indexOf(cost.apWord) === -1, cost);
    ok(`${tag}: 21b. D-30's GEOMETRY, IN PIXELS: the mark's centre sits ON the shape's left edge, a quarter of the way down the shape's own height, in a colour that is not the one the reading inherits`,
      cost !== null && cost.signOnShape === true && cost.geom !== null
      && Math.abs(cost.geom.dx) <= 0.5
      && Math.abs(cost.geom.dy - 0.25) <= 0.01
      && typeof cost.signColor === 'string'
      && cost.signColor !== cost.boxColor, cost);

    /* ── 21c. EVERY MARK ON THE PAGE, NOT THE ONE THE SELECTOR HAPPENED TO
       RETURN. 21b reads the first cost on the cats picker; this walks the whole
       document and counts FAILURES, which is 71c's shape and 107's — a cell
       that measured one mark would be green over a lane where every other one
       had slipped. The lane's marks are the interesting half here because the
       lane is where the two forms differ: a split fact of zero draws D-21's
       compact form, so its shape is the SECOND child of the row with the count
       first, and a mark anchored to the reading rather than to the shape lands
       on the left edge of "0x" there and nowhere near a symbol.

       AND THE CLIPPING IS MEASURED RATHER THAN ASSUMED, because half the mark
       hangs outside the shape by construction and .ld-row carries
       overflow-y:auto — which computes overflow-x to auto as well, so the lane
       card is a real clipping box on the one surface where a reading sits hard
       against its left edge. [C14.5] pads .sym for exactly this and the number
       that says the padding is enough is here rather than in the comment.

       ==================================================================
       TURNED IN THE OPEN BY PLAN 05-D38, AND THE OLD READING WAS ONLY
       POSSIBLE BECAUSE OF A DEFECT.
       ==================================================================
       This walk measured geometry on EVERY .sym-sign in the document, and 128
       of them answered: 90 in the lane, 36 in the picker, and TWO with no
       surface open that could be showing them. Those two are the action
       editor's term readings, and they had real rects because a closed <dialog>
       was sitting in normal document flow — which is D-38's second defect and
       is check 127's subject. With the closed state restored they have no boxes
       at all, and the recorded RED is the run on the commit that restored it:
       this cell, 8 of 8 combinations, on badGeom and nothing else.

       SO THE WALK NOW SKIPS A MARK WITH NO BOX AND SAYS WHY IT IS ALLOWED TO.
       A mark that is not drawn has no geometry to be right or wrong about, so
       asserting D-30's anchor on one is asserting arithmetic on zeroes. But
       "skip what has no box" is exactly the shape of a cell going quietly
       blind, so the skipped ones are COUNTED and every one of them must be
       inside a CLOSED dialog. A mark that lost its box for any other reason
       reddens this cell instead of leaving it. */
    const marks = await pg.evaluate(() => {
      const out = { total: 0, offShape: 0, badGeom: 0, colours: {}, clipped: 0,
        lane: 0, picker: 0, worstLeft: 999, undrawn: 0, undrawnLoose: 0 };
      document.querySelectorAll('.sym-sign').forEach((s) => {
        out.total++;
        if (s.closest('#ledger')) out.lane++;
        if (s.closest('#fightbar')) out.picker++;
        const p = s.parentElement;
        if (!p || !p.classList.contains('tok')) { out.offShape++; return; }
        const sr = s.getBoundingClientRect();
        const pr = p.getBoundingClientRect();
        // Not drawn: no geometry to judge. Allowed ONLY inside a closed dialog.
        if (pr.width === 0 && pr.height === 0) {
          out.undrawn++;
          const d = s.closest('dialog');
          if (!d || d.open === true) { out.undrawnLoose++; }
          return;
        }
        const dx = (sr.left + sr.width / 2) - pr.left;
        const dy = pr.height > 0 ? ((sr.top + sr.height / 2) - pr.top) / pr.height : -1;
        if (Math.abs(dx) > 0.5 || Math.abs(dy - 0.25) > 0.01) out.badGeom++;
        const c = getComputedStyle(s).color;
        out.colours[c] = (out.colours[c] || 0) + 1;
        // the nearest ancestor that clips, and how far inside it the mark sits
        let a = p, box = null;
        while (a && a !== document.body) {
          const o = getComputedStyle(a);
          if (o.overflowX !== 'visible' || o.overflowY !== 'visible') { box = a.getBoundingClientRect(); break; }
          a = a.parentElement;
        }
        if (box) {
          const left = sr.left - box.left;
          if (left < out.worstLeft) out.worstLeft = Math.round(left * 10) / 10;
          if (left < 0) out.clipped++;
        }
      });
      return out;
    });
    note(ch, size.name, 'D-30: every mark on the page',
      `${marks.total} marks (${marks.lane} lane, ${marks.picker} picker, ${marks.undrawn} undrawn), ${marks.offShape} off a shape, ${marks.badGeom} off the geometry, ${marks.clipped} clipped, closest to a clipping edge ${marks.worstLeft}px, colours ${JSON.stringify(marks.colours)}`);
    ok(`${tag}: 21c. every removal mark that is DRAWN — lane and picker alike — sits on a shape at D-30's exact anchor, in ONE colour, and none of them is clipped by the box that scrolls it; and every mark that is NOT drawn is inside a closed dialog. TURNED IN THE OPEN BY D-38: this walk used to measure geometry on all 128 marks in the document, and the two it found outside the lane and the picker had rects only because a closed <dialog> was sitting in normal document flow — check 127's defect. A mark with no box has no geometry to be right or wrong about, so it is skipped; and because "skip what has no box" is the shape of a cell going quietly blind, the skipped ones are COUNTED and each must be inside a dialog that is shut. A mark that lost its box for any other reason reddens this cell rather than leaving it`,
      marks.total > 0 && marks.lane > 0 && marks.picker > 0
      && marks.offShape === 0 && marks.badGeom === 0 && marks.clipped === 0
      && marks.undrawnLoose === 0
      && Object.keys(marks.colours).length === 1, marks);

    /* ── 21d. THE RED COMES OUT OF [C00] AND IS NOT A HEX SOMEBODY TYPED, and
       this is the only way to prove it from outside the file. Reading the
       computed colour and comparing it against a number would assert that this
       cell agrees with itself; grepping the source for a hex would pass over
       any of the six palette tokens spelled out by hand. So the TOKEN IS MOVED
       and the mark is watched: --accent-2 is overridden on :root, the mark's
       computed colour must CHANGE, and it must change BACK when the override is
       removed. A hard-coded colour does not move. This is 47d's rule — drive
       the path rather than plant a string — arriving on a stylesheet. */
    const derived = await pg.evaluate(async () => {
      const s = document.querySelector('.sym-sign');
      if (!s) return null;
      const before = getComputedStyle(s).color;
      document.documentElement.style.setProperty('--accent-2', '#00ff00');
      await new Promise((r) => requestAnimationFrame(r));
      const moved = getComputedStyle(s).color;
      document.documentElement.style.removeProperty('--accent-2');
      await new Promise((r) => requestAnimationFrame(r));
      const back = getComputedStyle(s).color;
      // and the mark is a RED: the red channel leads the other two by a real gap
      const ch = before.match(/[\d.]+/g) || [];
      const toByte = (v, i) => (before.indexOf('color(') === 0 && i < 3 ? Math.round(parseFloat(v) * 255) : Math.round(parseFloat(v)));
      const rgb = ch.slice(0, 3).map(toByte);
      return { before, moved, back, rgb };
    });
    note(ch, size.name, 'D-30: the mark\'s colour, and what happens when --accent-2 moves',
      derived === null ? 'NOT FOUND'
        : `${derived.before} = rgb(${derived.rgb.join(',')}); with --accent-2 forced to green it becomes ${derived.moved}; removed, ${derived.back}`);
    ok(`${tag}: 21d. the mark's red is DERIVED from [C00]'s tokens rather than typed: moving --accent-2 moves it and putting the token back puts it back, and the colour it lands on leads on the red channel`,
      derived !== null && derived.before !== derived.moved
      && derived.back === derived.before
      && derived.rgb.length === 3
      && derived.rgb[0] > derived.rgb[1] + 40
      && derived.rgb[0] > derived.rgb[2] + 40, derived);

    /* ── 22. D-31's SEPARATION IS A BOX AND NOT A GAP, and this is the claim NO node
       gate in this repository can make. The node gate reads containment and DOM order;
       the developer asked for the two areas to be SEPARATE, and the orchestrator's own
       reading of that is "a clear visual boundary (distinct panels/cards with their own
       headings), not merely spacing". Both of those are computed style and geometry.

       FIVE THINGS, EACH A DIFFERENT WAY OF SHIPPING THE SPACING AND CALLING IT A
       SEPARATION: each area has a REAL border, more than zero pixels wide and not
       `none`; each has a background that DIFFERS from the region it sits in, because
       two boxes the same colour as their parent are one box with a hairline; there is
       a real gap between the two boxes and they do not overlap; each carries a visible
       heading with a non-empty accessible name; and every one of those headings is at
       or above UX-02's 18px floor, which [C14]'s banner states four times and which
       binds hardest on this surface because it is on the page the whole time.

       THE COLOURS ARE COMPARED AND NEVER TYPED. A cell that read `rgb(31, 37, 48)` off
       the page and compared it to `rgb(31, 37, 48)` written here would assert that
       this file agrees with itself — 21d's recorded lesson, arriving on a background.
       What is asserted is a DIFFERENCE between two computed values, so a palette
       change moves both and this cell stays true. */
    const sep = await pg.evaluate(() => {
      const S = (sel) => {
        const n = document.querySelector(sel);
        if (!n) return null;
        const cs = getComputedStyle(n);
        const r = n.getBoundingClientRect();
        return {
          borderStyle: cs.borderTopStyle, borderWidth: Math.round(parseFloat(cs.borderTopWidth) * 100) / 100,
          bg: cs.backgroundColor, radius: cs.borderTopLeftRadius,
          top: Math.round(r.top), bottom: Math.round(r.bottom),
          left: Math.round(r.left), width: Math.round(r.width)
        };
      };
      const H = (sel) => {
        const n = document.querySelector(sel);
        if (!n) return null;
        const cs = getComputedStyle(n);
        const r = n.getBoundingClientRect();
        return {
          text: n.textContent.trim(), size: Math.round(parseFloat(cs.fontSize) * 100) / 100,
          display: cs.display, visibility: cs.visibility,
          w: Math.round(r.width), h: Math.round(r.height)
        };
      };
      return {
        bar: S('#fightbar'), state: S('#fight-state'), input: S('#fight-input'),
        stateHead: H('#fight-state-head'), inputHead: H('#fight-input-head')
      };
    });
    note(ch, size.name, 'D-31 panels: border / background against the region they sit in',
      `state ${sep.state.borderWidth}px ${sep.state.bg} | input ${sep.input.borderWidth}px ${sep.input.bg}`
      + ` | #fightbar ${sep.bar.bg}`);
    note(ch, size.name, 'D-31 panel headings, text and computed size',
      `${JSON.stringify(sep.stateHead.text)} ${sep.stateHead.size}px`
      + ` | ${JSON.stringify(sep.inputHead.text)} ${sep.inputHead.size}px`);
    note(ch, size.name, 'D-31 the boundary between the two panels',
      `state ends ${sep.state.bottom}, input starts ${sep.input.top}, gap ${sep.input.top - sep.state.bottom}px`);
    ok(`${tag}: 22. the two areas are two PANELS and not two paragraphs — real borders, a background distinct from the region they sit in, a real gap between them, and a visible heading each at the 18px floor`,
      sep.state.borderWidth > 0 && sep.input.borderWidth > 0
      && sep.state.borderStyle !== 'none' && sep.input.borderStyle !== 'none'
      && sep.state.bg !== sep.bar.bg && sep.input.bg !== sep.bar.bg
      && sep.state.bg === sep.input.bg
      && sep.input.top > sep.state.bottom
      && sep.state.left === sep.input.left && sep.state.width === sep.input.width
      && sep.stateHead.text !== '' && sep.inputHead.text !== ''
      && sep.stateHead.size >= 18 && sep.inputHead.size >= 18
      && sep.stateHead.display !== 'none' && sep.inputHead.display !== 'none'
      && sep.stateHead.visibility === 'visible' && sep.inputHead.visibility === 'visible'
      && sep.stateHead.h > 0 && sep.inputHead.h > 0, sep);

    /* ── 22b. AND THE SPOKEN-FOR PREVIEW STILL CROSSES THE BOUNDARY, DRIVEN BY A REAL
       CLICK. D-31 names this one behaviour by name: "The spoken-for resource preview
       stays with the resources in the state area ... but continues to react live as
       declarations are made in the input area."

       THIS IS THE ONE THING A LAYOUT CHANGE COULD BREAK SILENTLY. Before D-31 the
       reading and the button that moves it were siblings inside one root; they are now
       in two panels, and a version of this change that repainted only the panel the
       press landed in would leave the resources one press stale — on a projector, with
       every geometry cell above green.

       IT IS A REAL pg.click AND NOT A DISPATCHED PointerEvent, which is this file's own
       split stated at check 17's drive: drive the boring bulk through the artifact's
       ops, CLICK the thing being asserted. Three readings, taken verbatim off the STATE
       panel: idle, declared, and undone by a second click on the same button — the
       reading must MOVE and COME BACK, because a cell asserting only that it moved is
       green over one that never returns. The declaration count is read beside it off
       the live state, so a reading that moved for some other reason cannot satisfy
       this. */
    await endFight(pg);
    await toRoster(pg, 3);
    await startFight(pg);
    await pg.waitForTimeout(300);
    const crossRead = () => pg.evaluate(() =>
      document.querySelector('#state-cats .fg-team').textContent.replace(/\s+/g, ' ').trim());
    const crossCount = () => pg.evaluate(() => App.state.get().fight.decl.length);
    const crossBtn = await pg.evaluate(() => {
      const b = document.querySelector('#decl-cats [data-fg="act"][data-fg-by="c1"]:not([disabled])');
      return b ? b.dataset.fgVal : null;
    });
    const crossIdle = await crossRead();
    await pg.click(`#decl-cats [data-fg="act"][data-fg-by="c1"][data-fg-val="${crossBtn}"]`);
    await pg.waitForTimeout(250);
    const crossDeclared = await crossRead();
    const crossStanding = await crossCount();
    await pg.click(`#decl-cats [data-fg="act"][data-fg-by="c1"][data-fg-val="${crossBtn}"]`);
    await pg.waitForTimeout(250);
    const crossUndone = await crossRead();
    const crossBack = await crossCount();
    note(ch, size.name, 'D-31 the state panel’s team reading across a click in the input panel',
      `${JSON.stringify(crossIdle)} -> ${JSON.stringify(crossDeclared)} -> ${JSON.stringify(crossUndone)}`);
    ok(`${tag}: 22b. a REAL click on an action button in the INPUT panel moves the spoken-for reading in the STATE panel, and a second click puts it back`,
      crossBtn !== null && crossIdle !== '' && crossDeclared !== '' && crossUndone !== ''
      && crossIdle !== crossDeclared && crossUndone === crossIdle
      && crossStanding === 1 && crossBack === 0,
      { crossBtn, crossIdle, crossDeclared, crossUndone, crossStanding, crossBack });

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
      const line = document.querySelector(`#state-cats [data-fg="bf"][data-fg-val="c1"] .bf-line[data-bf-amt="${m.id}"]`);
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

    /* ── 23. D-32 PART 2: THE TERMS REGION, MEASURED — the claim this whole plan
       exists to make, and the only harness in the repository that can make it.
       The developer, at the real artifact with part 1 on screen: "make the
       action configuration more dense".

       WHAT IT MEASURED BEFORE THE CHANGE, on this exact drive — a board with
       seven token types, an action at the cap on all three lists, real Chrome,
       both viewports:

         #act-edit-terms       2507px
         every cost/req row     169px      (a label line, a chooser line
         every xf row           181px       that wrapped to two, and an
                                            amount line, stacked)
         the author pane       3243px      against 1038px of dialog at
                                            1920x1080 and 726px at 1366x768

       The row was three lines because .ae-term-toks measured 821px inside
       610px of content, so the strip claimed the whole line and pushed the
       label above it and the amount below it onto lines of their own. Twelve
       times.

       THE BUDGET IS 900 AND THE MEASUREMENT IS 707, and the slack is
       deliberate: a budget set at the measurement is a budget that reddens on
       a font, and this cell is about a REGIME — one line per row — not about a
       pixel. The per-row assertion is what actually pins that: 48px admits the
       41px row and its 40px floor and refuses a second line, which cannot be
       reached at any type size without the strip wrapping again. */
    await endFight(pg);
    const aeMade = await pg.evaluate(() => {
      App.ops.resetToDefaults();
      const unitTok = App.ops.createTokenType({ name: 'Zeal', scope: 'unit', shape: 'hex', color: 'violet', glyph: '' });
      const sideTok = App.ops.createTokenType({ name: 'Momentum', scope: 'side', shape: 'circ', color: 'gold', glyph: '' });
      const act = App.ops.createAction('mechs', 'Unfair');
      [0, 1, 2, 3].forEach((s) => {
        App.ops.setActionCost('mechs', act, s, s === 0 ? 'ap' : (s === 1 ? sideTok : unitTok), s + 1);
        App.ops.setActionReq('mechs', act, s, s === 0 ? 'hp' : (s === 1 ? 'shield' : unitTok), s + 1);
        App.ops.setActionXf('mechs', act, s, App.data.XF_WHO[s % 2], s === 0 ? 'hp' : unitTok, s === 0 ? -3 : (s + 1));
      });
      App.state.invalidate();
      if (App.render.flush) App.render.flush();
      return { act, unitTok, sideTok, vocab: Object.keys(App.state.get().build.tokens).length };
    });
    // Opened the way a student opens it, and moved onto the authored action by
    // pressing its own row: showModal() schedules nothing, which is this
    // file's four-times-learned lesson, and the side chooser is a real press.
    await pg.click('[data-act="openActionEditor"]'); await pg.waitForTimeout(300);
    await pg.click('#act-edit-side-mechs'); await pg.waitForTimeout(250);
    await pg.click(`[data-k="ae/list/mechs/${aeMade.act}"]`); await pg.waitForTimeout(300);

    const dense = await pg.evaluate(() => {
      const terms = document.querySelector('#act-edit-terms');
      const rows = [...document.querySelectorAll('#act-edit-terms .ae-term')].filter((n) => !n.hidden);
      const h = (n) => Math.round(n.getBoundingClientRect().height);
      return {
        terms: h(terms),
        rows: rows.map(h),
        strips: rows.map((r) => h(r.querySelector('.ae-term-toks'))),
        shown: rows.length,
        pane: h(document.querySelector('#act-edit-pane-author')),
        pills: document.querySelectorAll('#act-edit-terms .ae-pill').length
      };
    });
    const tallest = Math.max(...dense.rows);
    note(ch, size.name, 'D-32 terms region height (was 2507)', `${dense.terms}px over ${dense.shown} rows, ${dense.pills} pills`);
    note(ch, size.name, 'D-32 tallest term row (was 181)', `${tallest}px, strips ${Math.max(...dense.strips)}px`);
    note(ch, size.name, 'D-32 author pane height (was 3243)', `${dense.pane}px`);
    ok(`${tag}: 23. the terms region is dense — twelve rows, every one of them ONE line`,
      dense.shown === 12 && dense.terms > 0 && dense.terms <= 900 && tallest <= 48
      && dense.pills === 104 && aeMade.vocab === 7,
      dense);

    /* ── 23b. A MAXED ACTION AUTHORED THROUGH THE DENSE EDITOR BY REAL CLICKS.
       Node row 110 drives the same twelve terms against a stub with no layout
       engine; what it cannot know is whether a student can actually HIT the
       controls after they were made smaller. Every press below is a real
       pointer press on a real box, and the pill it lands on is found by the
       data-k the artifact wrote — so a pill that moved under another pill, or
       under the amount field, or off the dialog, fails here by timing out on a
       press rather than by measuring a number nobody would have questioned. */
    const aeAuthored = await (async () => {
      await pg.click('#act-edit-new'); await pg.waitForTimeout(250);
      const act = await pg.evaluate(() => document.querySelector('#act-edit').dataset.edPick);
      // THE TOKEN PILL FIRST AND THE PARTY PILL SECOND, and the order is not a
      // preference: an empty transformation slot draws NO party chooser at all
      // — fillWhoChoices returns early on a slot with no term, deliberately,
      // because two dead buttons naming nobody is worse than none — so a drive
      // that pressed the party first would wait thirty seconds for a control
      // the surface is correct not to have drawn yet.
      const write = async (field, slot, tok, who, amount) => {
        const op = field === 'cost' ? 'setActionCost' : (field === 'req' ? 'setActionReq' : 'setActionXf');
        await pg.click(`[data-k="ae/${op}/${slot}/tok/${tok}"]`); await pg.waitForTimeout(140);
        if (who) { await pg.click(`[data-k="ae/setActionXf/${slot}/who/${who}"]`); await pg.waitForTimeout(140); }
        const f = `#act-edit-${field}-${slot}-amt`;
        await pg.fill(f, String(amount));
        await pg.press(f, 'Enter');
        await pg.waitForTimeout(140);
      };
      const toks = ['ap', 'hp', 'shield', aeMade.sideTok];
      for (let s = 0; s < 4; s++) { await write('cost', s, toks[s], null, s + 1); }
      for (let s = 0; s < 4; s++) { await write('req', s, toks[s], null, 1); }
      for (let s = 0; s < 4; s++) {
        await write('xf', s, s === 0 ? 'hp' : aeMade.unitTok, s % 2 === 0 ? 'target' : 'caster', s === 0 ? -2 : s + 1);
      }
      return pg.evaluate((id) => {
        const rec = App.state.get().build.mechs.actions.filter((a) => a.id === id)[0];
        return {
          lens: [rec.cost.length, rec.req.length, rec.xf.length].join('/'),
          cost: rec.cost.map((c) => c.tok + ':' + c.n).join(','),
          xf: rec.xf.map((x) => x.who + ':' + x.tok + ':' + x.d).join(','),
          reads: document.querySelectorAll('#act-edit-terms .ae-term-read .sym').length
        };
      }, act);
    })();
    const wantCost = ['ap:1', 'hp:2', 'shield:3', aeMade.sideTok + ':4'].join(',');
    note(ch, size.name, 'D-32 maxed action authored by clicks', `${aeAuthored.lens} lens, ${aeAuthored.reads} readings`);
    ok(`${tag}: 23b. a 4/4/4 action is authorable by real clicks through the dense editor`,
      aeAuthored.lens === '4/4/4' && aeAuthored.cost === wantCost
      && aeAuthored.xf.split(',').length === 4 && aeAuthored.reads === 12,
      { aeAuthored, wantCost });

    /* ── 23c. THE DIALOG FITS BOTH VIEWPORTS AND DONE IS REACHABLE. "Fits" is
       two different claims and both are made: the BOX is inside the viewport
       on all four edges, which is what a modal must be; and the CONTENT is
       reachable, which for a surface taller than any laptop is a scroll rather
       than a fit. The second half is driven — the dialog is scrolled to its
       end and Done must then be wholly on screen — because a box that fits
       over content nothing can reach is the failure this cell exists for.

       AND THE TICK IS READ, on the pressed pill and on an unpressed one. It
       was invisible on every pill and every side button before this plan and
       nothing anywhere noticed, because a tick that is `visibility:hidden`
       still contributes its text to every harvest in the node gate. Only a
       browser can tell the difference between built and shown.

       ==================================================================
       D-33 P1-3 TURNS THE REACHABILITY CLAUSE, AND THE TURN IS THE WHOLE
       FINDING. Plan 05-D33b.
       ==================================================================
       WHAT THIS CELL ASSERTED: the dialog's own overflowY is `auto`, and after
       `d.scrollTop = d.scrollHeight` — a scroll to the END of the dialog — Done
       is wholly on screen. Both were true and the audit measured what they were
       green over: at 1366x768 this dialog hid 361px, at 1920x1080 Done itself
       sat at 1039-1086 of a 1080 viewport, and the whole visible height went on
       a four-line explainer, a Side toggle, a four-row list, two buttons and a
       Name field. NONE of the twelve dense rows cell 23 measures were on screen.
       "A student who cannot see Done does not know the dialog is finishable" —
       and a cell that scrolls to the end before looking cannot see that.

       SO THE SCROLL IS TAKEN AWAY FROM THE ASSERTION RATHER THAN ADDED TO IT.
       P1-3 makes the pane a grid of header / scrolling body / sticky footer, so:
         THE DIALOG DOES NOT SCROLL AT ALL — asserted as scrollHeight ===
           clientHeight and as an overflowY that is not `auto`, which is the
           direct inverse of the old clause and reddens the moment the grid is
           undone;
         THE BODY IS THE SCROLLER and really does overflow on this board, so a
           layout that quietly stopped scrolling anywhere fails too;
         AND DONE IS WHOLLY ON SCREEN AT BOTH ENDS OF THAT SCROLL — read at the
           body's TOP as well as at its END. The old cell only ever looked after
           scrolling to the end, which is the one position where a NON-sticky
           footer is also visible. Reading both ends is what makes this a claim
           about a sticky footer rather than about a scroll offset.
         THE HEADER IS PINNED TOO, read as the title's box not moving across
           that same scroll. */
    const fit = await pg.evaluate(() => {
      const d = document.querySelector('#act-edit');
      const bd = d.querySelector('.ae-body');
      const r = d.getBoundingClientRect();
      const title = document.querySelector('#act-edit-title');
      const doneAt = () => document.querySelector('#act-edit-done').getBoundingClientRect();
      const titleAt = () => Math.round(title.getBoundingClientRect().top);
      bd.scrollTop = 0;
      const doneTop = doneAt(), headTop = titleAt();
      bd.scrollTop = bd.scrollHeight;
      const doneEnd = doneAt(), headEnd = titleAt();
      const on = document.querySelector('#act-edit-terms .ae-pill--on');
      const off = document.querySelector('#act-edit-terms .ae-pill:not(.ae-pill--on)');
      const tick = on ? on.querySelector('.ae-check') : null;
      const tr = tick ? tick.getBoundingClientRect() : null;
      const pr = on ? on.getBoundingClientRect() : null;
      const whole = (b) => b.top >= 0 && b.bottom <= innerHeight + 1 && b.width > 0;
      return {
        boxIn: r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight + 1 && r.right <= innerWidth + 1,
        w: Math.round(r.width), h: Math.round(r.height),
        overflow: getComputedStyle(d).overflowY,
        dialogScroll: d.scrollHeight - d.clientHeight,
        bodyOverflow: getComputedStyle(bd).overflowY,
        bodyScroll: bd.scrollHeight - bd.clientHeight,
        doneInAtTop: whole(doneTop), doneInAtEnd: whole(doneEnd),
        doneBottom: Math.round(doneEnd.bottom),
        headPinned: headTop === headEnd,
        onTick: tick ? getComputedStyle(tick).visibility : null,
        offTick: off ? getComputedStyle(off.querySelector('.ae-check')).visibility : null,
        tickDx: (tr && pr) ? Math.round((tr.left + tr.width / 2) - pr.right) : null,
        vp: `${innerWidth}x${innerHeight}`
      };
    });
    await pg.click('#act-edit-done'); await pg.waitForTimeout(200);
    const closed = await pg.evaluate(() => document.querySelector('#act-edit').open);
    note(ch, size.name, 'D-33 dialog box / dialog scroll / body scroll',
      `${fit.w}x${fit.h} in ${fit.vp}, dialog ${fit.dialogScroll}px, body ${fit.bodyScroll}px`);
    note(ch, size.name, 'D-33 Done wholly on screen at the body top / at its end / head pinned',
      `${fit.doneInAtTop} / ${fit.doneInAtEnd} / ${fit.headPinned}, Done bottom ${fit.doneBottom}`);
    note(ch, size.name, 'D-32 the tick on a pill, pressed / unpressed', `${fit.onTick} / ${fit.offTick}, centre ${fit.tickDx}px from the right edge`);
    ok(`${tag}: 23c. the editor fits the viewport, the DIALOG does not scroll and its BODY does, Done is wholly on screen at BOTH ends of that scroll and the header is pinned, and the tick is SHOWN on the pressed pill - D-33 P1-3 turned the reachability clause and the banner says why`,
      fit.boxIn === true
      && fit.dialogScroll === 0 && fit.overflow !== 'auto'
      && fit.bodyOverflow === 'auto' && fit.bodyScroll > 0
      && fit.doneInAtTop === true && fit.doneInAtEnd === true
      && fit.headPinned === true
      && fit.onTick === 'visible' && fit.offTick === 'hidden'
      && Math.abs(fit.tickDx) <= 2 && closed === false,
      { fit, closed });

    /* ── 23d. D-30's MARK, ON THE EDITOR'S OWN READING, WITH THE GEOMETRY
       UNMOVED. Cells 21b/21c/21d make this claim about the fight surface in
       this same run and are untouched; this is the same three readings taken
       on the surface D-32 part 2 added, because a notation that agreed with
       the fight in its WORDS and disagreed in its GEOMETRY would read as two
       artifacts at the exact distance the mark is meant to be seen from.
       0px from the shape's left edge, a quarter of the way down it, in the
       colour the fight's marks are — and NOT ONE MARK on a requirement. */
    await pg.click('[data-act="openActionEditor"]'); await pg.waitForTimeout(300);
    await pg.click('#act-edit-side-mechs'); await pg.waitForTimeout(250);
    await pg.click(`[data-k="ae/list/mechs/${aeMade.act}"]`); await pg.waitForTimeout(300);
    const aeMarks = await pg.evaluate(() => {
      const at = (sel) => {
        const sym = document.querySelector(sel + ' .sym');
        if (!sym) return null;
        const sign = sym.querySelector('.sym-sign');
        if (!sign) return { mark: false, said: sym.getAttribute('title') };
        const shape = sign.parentElement;
        const sr = shape.getBoundingClientRect();
        const gr = sign.getBoundingClientRect();
        return {
          mark: true, said: sym.getAttribute('title'),
          onTok: shape.classList.contains('tok'),
          dx: Math.round(((gr.left + gr.width / 2) - sr.left) * 100) / 100,
          dy: Math.round(((gr.top + gr.height / 2) - sr.top) / sr.height * 10000) / 10000,
          color: getComputedStyle(sign).color
        };
      };
      return {
        cost: at('#act-edit-cost-0 .ae-term-read'),
        req: at('#act-edit-req-0 .ae-term-read'),
        down: at('#act-edit-xf-0 .ae-term-read'),
        up: at('#act-edit-xf-1 .ae-term-read'),
        /* TURNED IN THE OPEN UNDER D-40. This read `#act-edit-terms .sym-sign`
           and expected 5 — every mark in the region — which was the same set as
           "every mark on a TERM READING" for as long as the term readings were
           the only readings in the region. D-40 puts a pool preview inside the
           Cost list, and its taken figure wears the same mark for the same
           reason, so the region count went 5 to 7 and this cell reddened on a
           change it is not about. The two are counted separately now rather
           than the number being raised: this cell's subject is the TERM
           readings and a preview mark appearing among them would be invisible
           to a single total, which is exactly the kind of merge that lets one
           surface cover another's regression. */
        all: document.querySelectorAll('#act-edit-terms .ae-term-read .sym-sign').length,
        inPool: document.querySelectorAll('#act-edit-cost-pool .sym-sign').length
      };
    });
    note(ch, size.name, 'D-32 the mark on an editor cost — dx / dy / colour',
      aeMarks.cost && aeMarks.cost.mark ? `${aeMarks.cost.dx}px, ${aeMarks.cost.dy} down, ${aeMarks.cost.color}` : 'no mark');
    note(ch, size.name, 'D-32 marks on the term readings', `${aeMarks.all} (+${aeMarks.inPool} in D-40's preview), requirement carries ${aeMarks.req && aeMarks.req.mark ? 'one' : 'none'}`);
    ok(`${tag}: 23d. the editor's removal mark is D-30's geometry exactly, and a requirement carries none — counted over the TERM READINGS, with D-40's pool preview counted apart from them rather than folded into one total`,
      aeMarks.cost !== null && aeMarks.cost.mark === true && aeMarks.cost.onTok === true
      && aeMarks.cost.dx === 0 && aeMarks.cost.dy === 0.25
      && aeMarks.req !== null && aeMarks.req.mark === false
      && aeMarks.down !== null && aeMarks.down.mark === true
      && aeMarks.up !== null && aeMarks.up.mark === false
      && aeMarks.all === 5 && aeMarks.inPool === 2,
      aeMarks);

    /* ── 23e. A SHIPPED RULE IS ACTUALLY APPLYING, READ OFF COMPUTED STYLE.
       D-33 Pass C, and this cell exists because of what it found.

       .ae-list carried a 610px cap, a 236px bound, a scroll and a padding from
       D-32 onward and NONE of them had ever applied: the comment above the rule
       ended with a stray terminator, the paragraph after it ran as bare text,
       and the CSS parser dropped everything from there to the next recoverable
       block — which was the rule itself. Measured before the fix, real Chrome,
       editor open: display block, max-width none, width 986 against a 610 cap.

       NOTHING IN EITHER GATE COULD SEE IT AND THAT IS THE POINT. The node gate
       has no layout engine, so a dropped rule is invisible to it by
       construction; the browser cells above read the DIALOG's box and the terms
       region, which is what D-32 was about; and the audit measured the symptom
       and wrote it up as a design choice — P2-9's own words are that these rows
       run "971px carrying one word and nothing else", which IS a 610px cap not
       being applied.

       SO THE CELL READS THE DECLARATIONS BY NAME rather than the outcome. An
       outcome check ("the list is 610 wide") would pass the day somebody caps
       it somewhere else; these four are the rule's own contract, and a rule
       that stops being parsed drops all four at once. It also reads the ONE
       thing P2-9 changed — the grid — so a later author who reverts the list to
       a column of full-width bars does it in the open.

       TAKEN WITH THE DIALOG STILL OPEN from 23d above rather than re-opening
       it: a modal <dialog> intercepts pointer events for the whole page, so a
       click on the topbar opener from here times out against the dialog's own
       backdrop. Measured the direct way, once. */
    const aeListCss = await pg.evaluate(() => {
      const n = document.querySelector('.ae-list');
      if (!n) return null;
      const cs = getComputedStyle(n);
      return {
        display: cs.display, maxW: cs.maxWidth, maxH: cs.maxHeight,
        overflowY: cs.overflowY,
        tracks: cs.gridTemplateColumns.split(' ').filter(Boolean).length,
        w: Math.round(n.getBoundingClientRect().width)
      };
    });
    note(ch, size.name, 'D-33 .ae-list, off computed style', aeListCss
      ? `${aeListCss.display} ${aeListCss.w}/${aeListCss.maxW} ${aeListCss.tracks} tracks` : 'no node');
    ok(`${tag}: 23e. the action list's OWN rule is applying — display, the 610px cap, the height bound and the scroll all read back off computed style, and the list is the wrapping grid D-33 P2-9 made it. From D-32 until D-33 Pass C a stray comment terminator dropped this whole rule and neither gate could see it, because a rule that never applies is invisible without a layout engine`,
      aeListCss !== null && aeListCss.display === 'grid'
      && aeListCss.maxW === '610px' && aeListCss.maxH === '236px'
      && aeListCss.overflowY === 'auto' && aeListCss.tracks >= 2
      && aeListCss.w <= 610,
      aeListCss);

    /* ══ 24-24c. D-34 — THE CANCEL STEP, IN A REAL BROWSER ═══════════════════
       "there should be a cancel step on modifying actions" — the developer,
       2026-08-30. Node rows 113 to 113d drive the loop against a stub with no
       layout engine and an emulated focus model. Three things they structurally
       cannot reach are here.

       24 IS GEOMETRY AND IT IS WHY THIS CELL EXISTS AT ALL. The footer is
       STICKY since D-33 P1-3 and it is a `justify-content:flex-end` flex row
       with NO wrap — so a third control in it either fits on the line or pushes
       Done sideways out of the box, and neither gate can see that. Seventeen
       consecutive rendered changes in this phase had a defect only pictures
       showed, so the footer is also SCREENSHOTTED at both sizes.

       24b IS THE LOOP THROUGH REAL PRESSES with a real event order — the node
       harness dispatches pointerdown by hand, and what it cannot prove is that
       a browser's own press ordering, focus moves and click defaults leave the
       same board.

       24c IS THE FOCUSED FIELD, which is the case the ordering makes a trap:
       here the focus really is in the field when the press lands, and the
       browser really does move it afterwards. */
    const cancelBox = await pg.evaluate(() => {
      const foot = document.querySelector('#act-edit-pane-author .ae-foot');
      const btns = [...foot.querySelectorAll('button')];
      const r = (n) => n.getBoundingClientRect();
      const fr = r(foot);
      const tops = btns.map((b) => Math.round(r(b).top));
      const done = document.querySelector('#act-edit-done');
      const back = document.querySelector('#act-edit-cancel');
      const dr = r(done), br = r(back);
      return {
        count: btns.length,
        order: btns.map((b) => b.id).join(','),
        // ONE LINE is read as one distinct top, not as a height: a wrapped row
        // whose second line happens to be the same height as the first passes
        // any height budget and fails this.
        lines: [...new Set(tops)].length,
        footH: Math.round(fr.height),
        wholeFoot: fr.left >= 0 && fr.right <= innerWidth + 1
          && fr.top >= 0 && fr.bottom <= innerHeight + 1,
        doneIn: dr.left >= 0 && dr.right <= innerWidth + 1
          && dr.top >= 0 && dr.bottom <= innerHeight + 1 && dr.width > 0,
        backIn: br.left >= 0 && br.right <= innerWidth + 1
          && br.top >= 0 && br.bottom <= innerHeight + 1 && br.width > 0,
        // Done is LAST on the line as well as last in the markup — it ends the
        // visit, so nothing may sit to the right of it.
        doneLast: Math.round(dr.right) >= Math.round(br.right),
        backW: Math.round(br.width), doneW: Math.round(dr.width),
        said: back.textContent.trim(),
        disabled: back.disabled,
        sticky: getComputedStyle(document.querySelector('#act-edit-pane-author .ae-foot')).position,
        vp: `${innerWidth}x${innerHeight}`
      };
    });
    // The picture, because seventeen consecutive rendered changes in this phase
    // had a defect only a picture showed. It goes to a directory OUTSIDE the
    // repository by default — this file is dev-only and must not start
    // producing committed binaries — and SHOT_DIR points it somewhere readable
    // when somebody wants to look.
    await pg.locator('#act-edit-pane-author .ae-foot').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d34-foot-${ch}-${size.name}.png`)
    });
    note(ch, size.name, 'D-34 footer — controls / lines / height',
      `${cancelBox.count} on ${cancelBox.lines} line(s), ${cancelBox.footH}px, ${cancelBox.order}`);
    note(ch, size.name, 'D-34 the control — width / label',
      `${cancelBox.backW}px, ${JSON.stringify(cancelBox.said)}`);
    ok(`${tag}: 24. D-34's control sits on ONE line with Proposal and Done, wholly inside the viewport, with Done still last and still reachable — the footer is a no-wrap flex row and it is STICKY since D-33 P1-3, so a third control in it either fits or pushes Done sideways out of the box, and neither gate has a layout engine to see that. Read as distinct TOPS rather than as a height, because a wrapped row whose second line matches the first passes any height budget. The label is permanent, visible and says what the press does (UX-02), and the control is NOT disabled`,
      cancelBox.count === 3 && cancelBox.lines === 1
      && cancelBox.order === 'act-prop-open,act-edit-cancel,act-edit-done'
      && cancelBox.wholeFoot === true && cancelBox.doneIn === true
      && cancelBox.backIn === true && cancelBox.doneLast === true
      && cancelBox.said.length > 0 && cancelBox.disabled === false
      && cancelBox.sticky === 'sticky',
      cancelBox);

    /* ── 24b. THE LOOP. The action on screen is the 4/4/4 one cell 23b just
       authored by hand, so what is put back is a rule with every slot full. */
    const backLoop = await (async () => {
      const id = await pg.evaluate(() => document.querySelector('#act-edit').dataset.edPick);
      const recOf = () => pg.evaluate((a) => JSON.stringify(
        App.state.get().build.mechs.actions.filter((x) => x.id === a)[0]), id);
      // Re-selected by a real press on its own row, which is what takes the
      // snapshot — showAction is the one place that says which action is open.
      await pg.click(`[data-k="ae/list/mechs/${id}"]`); await pg.waitForTimeout(250);
      const was = await recOf();
      // Three edits across three of the four facets: the name, an amount, and a
      // chooser press that retargets a cost term onto another type.
      await pg.fill('#act-edit-name', 'Prowl');
      await pg.press('#act-edit-name', 'Enter'); await pg.waitForTimeout(150);
      await pg.fill('#act-edit-cost-0-amt', '4');
      await pg.press('#act-edit-cost-0-amt', 'Enter'); await pg.waitForTimeout(150);
      await pg.click('[data-k="ae/setActionCost/3/tok/hp"]'); await pg.waitForTimeout(150);
      const moved = await recOf();
      // THE STACK IS EMPTIED FIRST, and this cell measured why rather than
      // inheriting the warning: by here the run has made well over thirty
      // commits, so the stack is at UNDO_LIMIT and commit() shifts the oldest
      // entry away for every new one — a delta of one reads as ZERO and this
      // cell passed over a cancel that committed nothing. Measured: fromCancel
      // 0 in all four columns with every other clause green. App.state.restore
      // is the only thing that clears the stack; it is [S09]'s by name and this
      // file is dev-only, which is the same standing the node gate uses it on.
      await pg.evaluate(() => {
        App.state.restore(JSON.stringify(App.state.get()));
        App.state.flush();
      });
      await pg.waitForTimeout(200);
      // The depth is read HERE, immediately before the press, so the reading is
      // a delta over one press rather than arithmetic over the edits above it.
      const depth0 = await pg.evaluate(() => App.state.undoDepth());
      await pg.click('#act-edit-cancel'); await pg.waitForTimeout(250);
      const back = await recOf();
      const shown = await pg.evaluate(() => document.querySelector('#act-edit-name').value);
      const depth1 = await pg.evaluate(() => App.state.undoDepth());
      // Inert: a second press with nothing in between.
      await pg.click('#act-edit-cancel'); await pg.waitForTimeout(250);
      const inert = await recOf();
      const depth2 = await pg.evaluate(() => App.state.undoDepth());
      // And the mis-press is recoverable.
      await pg.evaluate(() => { App.ops.undo(); App.state.invalidate(); if (App.render.flush) App.render.flush(); });
      await pg.waitForTimeout(250);
      const undone = await recOf();
      return { was, moved, back, inert, undone, shown,
        fromCancel: depth1 - depth0, fromInert: depth2 - depth1 };
    })();
    note(ch, size.name, 'D-34 the loop — restored / inert / undone',
      `${backLoop.back === backLoop.was} / ${backLoop.fromInert} entries / ${backLoop.undone === backLoop.moved}`);
    ok(`${tag}: 24b. D-34's loop through real presses on a 4/4/4 rule: three edits land, ONE press puts every one of them back byte-identically in ONE undo entry, a second press with nothing in between does nothing at all, and one Ctrl+Z brings the three edits back. The name field on screen agrees with the restored record, which is the half a state check cannot make`,
      backLoop.moved !== backLoop.was && backLoop.back === backLoop.was
      && backLoop.fromCancel === 1 && backLoop.fromInert === 0
      && backLoop.inert === backLoop.was
      && backLoop.undone === backLoop.moved
      && backLoop.shown === JSON.parse(backLoop.was).name,
      backLoop);

    /* ── 24c. THE FOCUSED FIELD, with the browser's own ordering. The press
       lands on pointerdown, ahead of the focus change, so the field is still
       focused and still holding uncommitted text — and the blur the browser
       raises afterwards would dispatch that text as a fresh edit if the press
       had not thrown it away first. BOTH halves are read: the record, and the
       FIELD, which the repaint may not write while it holds focus (D-19). */
    const backFocus = await (async () => {
      const id = await pg.evaluate(() => document.querySelector('#act-edit').dataset.edPick);
      await pg.click(`[data-k="ae/list/mechs/${id}"]`); await pg.waitForTimeout(250);
      const was = await pg.evaluate((a) => JSON.stringify(
        App.state.get().build.mechs.actions.filter((x) => x.id === a)[0]), id);
      await pg.fill('#act-edit-cost-0-amt', '9');
      await pg.press('#act-edit-cost-0-amt', 'Enter'); await pg.waitForTimeout(200);
      const committed = await pg.evaluate((a) => App.state.get().build.mechs.actions
        .filter((x) => x.id === a)[0].cost[0].n, id);
      // Typed and NOT committed, with the field still holding focus.
      await pg.focus('#act-edit-cost-0-amt');
      await pg.fill('#act-edit-cost-0-amt', '7');
      const focusedBefore = await pg.evaluate(() =>
        document.activeElement && document.activeElement.id);
      await pg.click('#act-edit-cancel'); await pg.waitForTimeout(300);
      // The blur has happened by now in a real browser; nothing else is needed
      // to raise it, which is the point of taking this reading here.
      const after = await pg.evaluate((a) => ({
        rec: JSON.stringify(App.state.get().build.mechs.actions.filter((x) => x.id === a)[0]),
        field: document.querySelector('#act-edit-cost-0-amt').value,
        active: document.activeElement && document.activeElement.id,
        inDialog: document.querySelector('#act-edit').contains(document.activeElement)
      }), id);
      await pg.waitForTimeout(250);
      const settled = await pg.evaluate((a) => JSON.stringify(
        App.state.get().build.mechs.actions.filter((x) => x.id === a)[0]), id);
      return { was, committed, focusedBefore, ...after, settled };
    })();
    note(ch, size.name, 'D-34 cancel with a field focused — field / active',
      `${JSON.stringify(backFocus.field)} / ${backFocus.active}`);
    ok(`${tag}: 24c. a cancel taken with an amount field FOCUSED and holding uncommitted text puts the record back, REPAINTS that field to the restored value, and the blur the browser raises afterwards adds nothing — without the pending text being thrown away first that blur would dispatch it as a fresh edit and silently undo the cancel one event later. Focus stays inside the dialog, never on the body: a modal whose active element is the body has lost the keyboard`,
      backFocus.committed === 9
      && backFocus.focusedBefore === 'act-edit-cost-0-amt'
      && backFocus.rec === backFocus.was
      && backFocus.settled === backFocus.was
      && backFocus.field === String(JSON.parse(backFocus.was).cost[0].n)
      && backFocus.inDialog === true,
      backFocus);

    await pg.click('#act-edit-done'); await pg.waitForTimeout(150);

    /* ══════════════════════════════════════════════════════════════════
       25, 25b, 25c — D-35 PART TWO'S THREE SURFACES, IN A REAL BROWSER.
       Plan 05-D35b.
       ══════════════════════════════════════════════════════════════════
       Eighteen consecutive rendered changes in this phase had a defect only a
       picture showed, so every one of these three takes one — and every one of
       them also asserts a REGIME rather than a pixel, which is cell 23's own
       lesson: a budget set at the measurement reddens on a font.

       THE BOARD IS PUT BACK FIRST. Everything above this point has authored
       actions, renamed things and left a dialog closed on a selection, and a
       measurement taken on a board four cells have been editing is a
       measurement of nothing in particular. */
    await pg.evaluate(() => {
      App.ops.resetToDefaults();
      App.state.invalidate({ structural: true });
      if (App.render.flush) App.render.flush();
    });
    await pg.click('#view-build'); await pg.waitForTimeout(200);

    /* ── 25a. THE ROUND-RULES BLOCK AS A STUDENT FIRST OPENS IT, AND IT IS
       MEASURED HERE RATHER THAN IN 25b BECAUSE OF PROBE DC.

       The board has just been put back to defaults, so this is the shipped
       vocabulary of five token types and the shipped two rules - and it is the
       ONLY moment in this run with SLACK left over in the row. That slack is
       the whole point. Cell 25b takes its measurements after a sixth type has
       been invented, at which point the row is over-constrained: PROBE DC set
       the token track back to `1fr` - the exact stretch that stranded the
       amount 160px right of its pills on the block this plan replaces - and
       25b measured 0px and passed in all four columns, because a track with no
       free space to claim cannot claim any. A cell that only ever measures a
       full row is green over the defect by construction.

       So the binding is read WHERE A GROW WOULD SHOW - and re-running PROBE DC
       against this cell taught the second half, which is worth writing down
       because it turns which clause is load-bearing. `amtGap` NEVER catches a
       stretched track in a grid: the amount is the NEXT COLUMN, so a track
       that claims the spare space carries the amount along with it and the two
       stay flush at 0px while the pair drifts 80px right together. What
       actually catches it is `slack` - the row no longer ends short of the
       list - and under the probe that read 0 where it reads 80. So amtGap is
       kept because it is the number that names the original defect and would
       catch a spacer or a margin put back between the two, and `slack > 0` is
       the clause that guards the track. Neither subsumes the other and only
       one of them is a floor on this measurement being a measurement at all.

       AND EVERY ROW IS ONE LINE HERE, which is the claim 25b cannot make: the
       token strip is the one track a student grows, and past the shipped
       vocabulary it wraps INSIDE its own column with nothing else moving. One
       line on the board a student opens; a wrapped chooser and a bound amount
       on the board they build. Both are measured, in that order, and neither
       is claimed of the other.

       ==================================================================
       TURNED IN THE OPEN UNDER D-39 P2-3. Plan 05-D39d. THE ONE-LINE
       CLAUSE IS GONE AT 1366 AND THE PROBE-DC CLAUSE MOVED TO 1920.
       ==================================================================
       .rr-pill went 15px to 18px, which is [C07]'s own floor arriving on
       the one authoring surface that was under it. At 1366 that costs the
       one-line row on the FRESH board, and the measurement that decided it
       is the one Pass A did not take: what one line at 1366 costs in TOKEN
       TYPES rather than in font size. Driven four times, both engines,
       every figure identical in the two engines to the pixel:

         board                    15px                18px
         five shipped types       slack 17, ONE line  slack 0, two lines
         + ONE student type       slack 0, TWO lines  slack 0, two lines
         + a second               slack 0, two lines  --

       The 18px board and the six-type board are the SAME BOARD -- card
       535, page 3289, the Add at 3169, in both engines at both sizes. So
       the property this cell asserted was never a property of the surface;
       it was a property of the surface before the workshop starts, and one
       press of "New type on each unit" ended it at 15px too.

       SO WHAT THIS CELL ASSERTS NOW DEPENDS ON THE COLUMN, AND THAT IS THE
       HONEST SHAPE RATHER THAN THE WEAK ONE. PROBE DC's whole finding is
       that slack is the reading that catches a stretched token track and
       that a row with no free space cannot be caught. At 18px the 1366 row
       has no free space FOR LEGITIMATE REASONS, so the probe's
       discriminator is not weakened there -- it is ABSENT, and a cell that
       kept the clause anyway would be asserting something the geometry
       cannot answer. At 1920 there are 177px of slack at 18px with five
       types and 96px with six, so the probe's binding lives there and is
       asserted there in full. PROBE DC was re-run against this turn.

       AT 1366 WHAT IS ASSERTED IS THE WRAPPED SHAPE, and it is not
       nothing: the four column words still stand over the four cells they
       name to within a pixel, the amount still sits against the pills
       rather than being carried to the far right, one Remove per row, and
       the band is bounded so a row that grew a THIRD line still fails.
       That bound is re-derived rather than kept -- 56px was the one-line
       band and 96 is the two-line one, measured at 89 plus [C17]'s own
       separator padding.

       ANSWER 2 IS STILL OPEN. Shortening "Cats, each unit" recovers about
       120px and buys the one-line row back at 1366 on the fresh board. It
       is a rendered string on four controls and it is the developer's
       vocabulary. deferred-items.md carries it. */
    const rrFirst = await pg.evaluate(() => {
      const root = document.querySelector('#roundrules');
      if (!root) return null;
      const list = root.querySelector('.rr-list');
      const lr = list.getBoundingClientRect();
      const rows = Array.from(root.querySelectorAll('.rr-rule'))
        .filter((n) => getComputedStyle(n).display !== 'none');
      const cellsOf = (n) => Array.from(n.querySelectorAll(':scope > .rr-cell'));
      // A row is display:contents and has no box of its own, so the band a
      // student reads as "one rule" is the union of its cells.
      const bandH = (n) => {
        const bs = cellsOf(n).map((c) => c.getBoundingClientRect());
        return Math.round(Math.max(...bs.map((b) => b.bottom))
          - Math.min(...bs.map((b) => b.top)));
      };
      const row0 = rows[0];
      const cells0 = cellsOf(row0);
      const toks = row0.querySelector('.rr-toks').getBoundingClientRect();
      const amt = row0.querySelector('.rr-amt').getBoundingClientRect();
      const cols = Array.from(root.querySelectorAll('.rr-cols > .rr-cell'));
      const colLefts = cols.map((c) => Math.round(c.getBoundingClientRect().left));
      const cellLefts = cells0.map((c) => Math.round(c.getBoundingClientRect().left));
      const add = document.querySelector('#rr-add');
      const rm = row0.querySelector('.rr-rm');
      return {
        rows: rows.length,
        ruleCount: App.state.get().build.rules.length,
        types: Object.keys(App.state.get().build.tokens).length,
        tallest: Math.max(...rows.map(bandH)),
        // The row does not fill the list: there is room for a stretched track
        // to stretch into, which is what makes the next reading a reading.
        slack: Math.round(lr.right
          - cells0[cells0.length - 1].getBoundingClientRect().right),
        amtGap: Math.round(amt.left - toks.right),
        colsAligned: colLefts.length === cellLefts.length
          && colLefts.every((x, i) => Math.abs(x - cellLefts[i]) <= 1),
        colWords: cols.map((c) => c.textContent),
        addWord: add.textContent, addOff: add.disabled,
        rmWord: rm.textContent,
        rmPerRow: rows.every((n) => n.querySelectorAll('.rr-rm').length === 1),
        // [C07]'s floor, read off the control rather than off the stylesheet,
        // because that number is what D-39 P2-3 is about.
        pillFont: getComputedStyle(row0.querySelector('.rr-pill')).fontSize
      };
    });
    await pg.locator('#roundrules').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d35c-shipped-${ch}-${size.name}.png`)
    });
    note(ch, size.name, 'D-35c the shipped board - rows / tallest / slack / amount gap',
      rrFirst ? `${rrFirst.rows} rows, ${rrFirst.tallest}px, slack ${rrFirst.slack}px, gap ${rrFirst.amtGap}px` : 'no node');
    note(ch, size.name, 'D-39 P2-3 the pill at the floor / where PROBE DC binds',
      `${rrFirst ? rrFirst.pillFont : '?'} / `
      + `${size.width >= 1600 ? 'this column, on slack' : 'the 1920 column'}`);
    ok(`${tag}: 25a. THE ROUND-RULES BLOCK AS A STUDENT FIRST OPENS IT: two rules, ONE LINE EACH, four column words standing over the four groups they name, and the amount sitting against the pills it belongs to. THIS IS THE CELL THAT CAN SEE THE DEFECT AND 25b IS NOT - PROBE DC. The block this replaces let the token strip take every spare pixel of the row and pushed the amount to the far right; put that stretch back and cell 25b, which measures after a sixth type has been invented and the row is over-constrained, passes in all four columns, because a track with no free space cannot claim any. So the binding is measured HERE, on the shipped vocabulary, where there is spare room for a stretched track to stretch into - and the spare room is ASSERTED rather than assumed, because it is the clause doing the work: in a grid the amount is the next COLUMN, so a stretched track carries it along and the gap between them stays 0px while the pair drifts right together. The gap is kept because it names the original defect and catches a spacer put back between the two; the SLACK is what catches the track, and under PROBE DC it read 0 where it reads 80. TURNED IN THE OPEN UNDER D-39 P2-3: this cell required ONE LINE at both widths, and .rr-pill went 15px to 18px, which is [C07]'s own floor arriving on the one authoring surface that was under it. The measurement that decided it is the one Pass A did not take -- what one line at 1366 costs in TOKEN TYPES rather than in font size. It costs ONE. Driven four times in both engines, every figure identical to the pixel: the five shipped types give slack 17 and one line at 15px and slack 0 with two lines at 18px; ONE student type gives slack 0 and TWO LINES AT 15px TOO, and from there the two font sizes are the same board to the pixel -- card 535, page 3289, the Add at 3169. So the property this cell asserted was never a property of the surface. It was a property of the surface before the workshop starts, and one press of "New type on each unit" ended it at either size. WHAT THIS CELL ASSERTS NOW DEPENDS ON THE COLUMN, and that is the honest shape rather than the weak one: PROBE DC's finding is that slack is the reading that catches a stretched token track and that a row with no free space cannot be caught, so at 1366 and 18px the discriminator is not weakened but ABSENT, and it is asserted at 1920 where 177px of slack remain. At 1366 what is asserted is the wrapped shape and it is not nothing -- the column words still stand over their cells to within a pixel, the amount still sits against its pills instead of being carried right, one Remove per row, and the band is bounded at 96 so a row that grew a THIRD line still fails`,
      rrFirst !== null
      && rrFirst.rows === 2 && rrFirst.ruleCount === 2 && rrFirst.types === 5
      // PROBE DC's binding clause, at the width that still has slack for a
      // stretched track to be caught stretching into. See the turn above.
      && (size.width >= 1600 ? rrFirst.slack > 0 : rrFirst.slack === 0)
      && rrFirst.amtGap >= 0 && rrFirst.amtGap <= 24
      && rrFirst.tallest > 0
      && rrFirst.tallest <= (size.width >= 1600 ? 56 : 96)
      && rrFirst.colsAligned === true
      && rrFirst.colWords[1].indexOf('Who') === 0
      && rrFirst.colWords[2].indexOf('Which') === 0
      && rrFirst.colWords[3].indexOf('How') === 0
      && rrFirst.addWord.indexOf('Add') !== -1 && rrFirst.addOff === false
      && rrFirst.rmWord === 'Remove' && rrFirst.rmPerRow === true
      && rrFirst.pillFont === '18px',
      rrFirst);

    /* ── 25. THE RANGE PAIR ON THE TOKEN EDITOR. Two fields and their words on
       ONE line, wholly inside the dialog and wholly inside the viewport, with
       the sentence under them saying what the pair IS — and a refused bound
       heard through the file's one refusal surface with the field put back.

       THE ORDER IS DELIBERATE AND WAS MEASURED THE HARD WAY: the loud refusal
       goes LAST, because an error raised while a modal is open CLOSES that
       modal first (the node gate's check 24 states it), so a screenshot taken
       after the refusal would be a picture of the board. */
    await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(250);
    await pg.click('#tok-pick-new-unit'); await pg.waitForTimeout(200);
    await pg.fill('#tok-pick-name', 'Chill');
    await pg.press('#tok-pick-name', 'Enter'); await pg.waitForTimeout(200);
    await pg.fill('#tok-pick-max', '3');
    await pg.press('#tok-pick-max', 'Enter'); await pg.waitForTimeout(250);

    /* THE GROUP IS DRIVEN INTO VIEW FIRST, AND THAT IS A FINDING RATHER THAN
       A SETUP STEP. The first draft of this cell measured the row where it
       landed and asserted `top >= 0 && bottom <= innerHeight`, which PASSED at
       both sizes — and the screenshot it took at 1366x768 showed the two
       fields cut in half by the dialog's sticky foot with the sentence under
       them entirely below the fold. That is D-33 P1-2's lesson arriving on a
       new group, word for word: a box whose viewport-relative rectangle is on
       screen can still be clipped by a SCROLLING ANCESTOR, and a cell that
       reads only the rectangle is green over exactly the defect the audit
       photographed.

       So the claim is the one cell 6b makes about the picker rows and NOT a
       claim that the group ships above the fold — the dialog is 1466px against
       726px of viewport at 1366 and Shape, Colour and Emoji are below the fold
       too, which is the arrangement D-33 P1-3 gave this dialog a scroller and
       a cue for. What is asserted is REACHABLE AND THEN WHOLE: scrolled to, the
       row is cut by no ancestor, both fields are inside the viewport, and the
       sentence that says what the pair means is on screen WITH them — because
       a reading that arrives one scroll after the control it explains is a
       reading nobody reads. */
    const bounds = await pg.evaluate(async () => {
      const group = document.querySelector('#tok-pick-bounds-label').parentElement.parentElement;
      group.scrollIntoView({ block: 'center' });
      await new Promise((r) => setTimeout(r, 400));
      // cell 6b's own walk, copied rather than shared because the two cells are
      // in different scopes: is this node cut by ANY scrolling ancestor?
      const cutBy = (node) => {
        const r = node.getBoundingClientRect();
        let q = node.parentElement;
        while (q && q !== document.body) {
          const cs = getComputedStyle(q);
          if (/auto|scroll|hidden/.test(cs.overflowY) || /auto|scroll|hidden/.test(cs.overflowX)) {
            const pr = q.getBoundingClientRect();
            if (r.top < pr.top - 0.6 || r.bottom > pr.bottom + 0.6
              || r.left < pr.left - 0.6 || r.right > pr.right + 0.6) { return true; }
          }
          q = q.parentElement;
        }
        return false;
      };
      const row = document.querySelector('.pk-bounds');
      const min = document.querySelector('#tok-pick-min');
      const max = document.querySelector('#tok-pick-max');
      const said = document.querySelector('#tok-pick-bounds-said');
      const dlg = document.querySelector('#tok-picker');
      if (!row || !min || !max || !said) return null;
      const r = row.getBoundingClientRect();
      const dr = dlg.getBoundingClientRect();
      const tops = Array.from(row.querySelectorAll('.pk-bound'))
        .map((n) => Math.round(n.getBoundingClientRect().top));
      const lbl = row.querySelector('.pk-bound-lbl');
      const sr = said.getBoundingClientRect();
      return {
        lines: new Set(tops).size,
        h: Math.round(r.height),
        inDialog: Math.round(r.left) >= Math.round(dr.left) - 1
          && Math.round(r.right) <= Math.round(dr.right) + 1,
        inView: r.top >= 0 && r.bottom <= innerHeight + 1 && r.width > 0,
        clipped: cutBy(row) || cutBy(min) || cutBy(max) || cutBy(said),
        // The sentence is on screen WITH the pair, not one scroll behind it.
        saidWithPair: sr.top >= 0 && sr.bottom <= innerHeight + 1
          && sr.top >= r.bottom - 1,
        minV: min.value, maxV: max.value,
        wordPx: Math.round(parseFloat(getComputedStyle(lbl).fontSize)),
        wordShown: getComputedStyle(lbl).visibility !== 'hidden'
          && lbl.textContent.trim().length > 0,
        saidShown: said.hidden === false && said.textContent.length > 0,
        said: said.textContent,
        state: JSON.stringify([App.ops.tokenBounds(App.state.get().build.tokens,
          document.querySelector('#tok-picker').dataset.tok)])
      };
    });
    await pg.locator('#tok-picker').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d35b-bounds-${ch}-${size.name}.png`)
    });
    note(ch, size.name, 'D-35 range pair — lines / height / fields',
      bounds ? `${bounds.lines} line(s), ${bounds.h}px, ${bounds.minV}/${bounds.maxV}` : 'no node');
    note(ch, size.name, 'D-35 range reading',
      bounds ? JSON.stringify(bounds.said).slice(0, 90) : 'no node');

    /* The refusal, last, for the reason the block comment gives.
       ==================================================================
       TURNED IN THE OPEN UNDER D-39 P1-1, AND THIS IS THE PIXEL HALF OF
       NODE ROWS 38, 115 AND 117. Plan 05-D39b.
       ==================================================================
       WHAT THIS CELL REQUIRED, verbatim from the clause that is gone:

           boundRefusal.panel === true

       — where `panel` is `#err-panel.hidden === false`. A floor typed
       above a ceiling, in a real field, by a real keypress, in real
       Chrome, was REQUIRED to open the global crash panel. It did, and
       the four columns of this harness went green over it for four
       plans, because the artifact's own word for the Enter path is
       "loud" and nobody asked what channel loud came out on.

       THE HALF NO NODE ROW COULD SEE IS THE ONE THIS CELL NOW CARRIES.
       [S08]'s fail() calls closeModals(), so the panel took the DIALOG
       with it — the stub models .open and close() and no close-request
       behaviour at all, which is why every node row was blind to it and
       why the drive below reads `dialogOpen` off a real browser.

       Typed with real keystrokes rather than pg.fill, because fill sets
       .value and dispatches input, and the property under test is what
       ENTER does after a student has typed. */
    await pg.click('#tok-pick-min');
    await pg.keyboard.press('Control+A');
    await pg.keyboard.type('9');
    await pg.keyboard.press('Enter'); await pg.waitForTimeout(300);
    const boundRefusal = await pg.evaluate(() => {
      const said = document.querySelector('#tok-pick-said');
      return {
        panel: document.querySelector('#err-panel').hidden === false,
        dialogOpen: document.querySelector('#tok-picker').open === true,
        said: said.hidden === false ? said.textContent : '',
        saidBox: (function () {
          const r = said.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) };
        })(),
        saidOnScreen: (function () {
          const r = said.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight + 1;
        })(),
        field: document.querySelector('#tok-pick-min').value,
        floor: App.ops.tokenBounds(App.state.get().build.tokens,
          document.querySelector('#tok-picker').dataset.tok).min
      };
    });
    // And it LEAVES when the student goes back into the field to try again,
    // which is the half of a said line that goes stale in silence.
    await pg.click('#tok-pick-max');
    await pg.click('#tok-pick-min'); await pg.waitForTimeout(200);
    const boundRefusalGone = await pg.evaluate(() => {
      const said = document.querySelector('#tok-pick-said');
      return said.hidden === true && said.textContent === '';
    });
    note(ch, size.name, 'D-39 a refused bound — panel / dialog / field / floor',
      `${boundRefusal.panel} / open=${boundRefusal.dialogOpen} / ${JSON.stringify(boundRefusal.field)} / ${boundRefusal.floor}`);
    note(ch, size.name, 'D-39 the refusal on the surface / dropped on return',
      `${JSON.stringify(boundRefusal.said).slice(0, 80)} / ${boundRefusalGone}`);
    ok(`${tag}: 25. D-35's range pair sits on ONE line inside the token editor and, once the group is scrolled to, is cut by NO scrolling ancestor and sits wholly inside the viewport with its own sentence beside it — the first draft of this cell read the rectangle alone, passed at both sizes, and photographed two fields cut in half by the dialog's sticky foot, both fields carry a permanent visible word at the projector floor, and the sentence under them says what the pair IS — the shipped 0-to-99 reads as the range every board starts from, which two boxes of digits cannot say on their own. A ceiling typed into the real field lands on the type; a FLOOR ABOVE THAT CEILING is refused rather than cut, the field goes back and the board does not move. TURNED UNDER D-39 P1-1: this cell used to REQUIRE #err-panel to be open on that refusal, so it asserted in four columns of real browser that a student who typed one number the wrong way round got "SOMETHING WENT WRONG", a stack trace, an accented "Reset to Workshop 16 defaults" — and, because fail() closes every open modal, LOST THIS DIALOG. That last half is the one no node row could ever have caught, because the stub models no close-request behaviour, and it is why dialogOpen is read here. Now the guard's own sentence naming the type is ON #tok-pick-said with a real box wholly on screen, the panel stays shut, the dialog stays open, and the sentence LEAVES when the student returns to the field. Read as a REGIME and not a pixel — one line, both words shown, not a height budget that reddens on a font`,
      bounds !== null && bounds.lines === 1 && bounds.inDialog === true
      && bounds.inView === true && bounds.clipped === false
      && bounds.saidWithPair === true
      && bounds.minV === '0' && bounds.maxV === '3'
      && bounds.wordPx >= 18 && bounds.wordShown === true
      && bounds.saidShown === true
      && bounds.said.indexOf('between 0 and 3') !== -1
      && boundRefusal.panel === false
      && boundRefusal.dialogOpen === true
      && boundRefusal.said.indexOf('Chill') !== -1
      && boundRefusal.saidOnScreen === true
      && boundRefusalGone === true
      && boundRefusal.field === '0' && boundRefusal.floor === 0,
      { bounds, boundRefusal, boundRefusalGone });

    await pg.evaluate(() => {
      const d = document.querySelector('#tok-picker');
      if (d && d.open === true) { d.close(); }
    });
    await pg.waitForTimeout(200);

    /* -- 25d. D-39 P1-1 — ALL SIX TYPED-VALUE PATHS, ON ENTER AND ON BLUR,
       AND ONE GENUINE DEFECT TO PROVE THE PANEL STILL WORKS. Plan 05-D39b.
       ==================================================================
       THE ASSERTION THIS AUDIT HAD TO DISCOVER BY HAND. D-33 never typed
       into a field, so nothing in this repository knew that every
       typed-value field in the artifact routed a typo into the global
       crash panel on Enter — and, in the two authoring dialogs, closed the
       dialog and threw the session away. Six commit paths carried it:

         commitField        [S07.1]   the board's steppers
         commitName         [S07.2]   #tok-pick-name
         commitBound        [S07.2]   #tok-pick-min / #tok-pick-max
         commitActionName   [S07.3]   #act-edit-name
         commitAmount       [S07.3]   #act-edit-*-amt
         commitRuleAmount   [S07.7]   .rr-amt

       ALL SIX ARE DRIVEN HERE AND ALL SIX ARE DRIVEN TWICE — once on
       ENTER, which is the path that was broken, and once on BLUR, which
       is the path that already worked and is the measurement the fix was
       written against. Both must now end in the same place: the field
       back, the board unmoved, the panel shut, and the dialog (where
       there is one) still open. Enter differs from blur in exactly one
       way and it is the one [S07.2]'s own comment always promised: it
       leaves a SENTENCE behind.

       EVERY VALUE IS TYPED WITH REAL KEYSTROKES. pg.fill sets .value and
       dispatches input; what is under test is what ENTER does to text a
       student typed, so the sequence is click, select-all, type, press.
       An emptied field is Delete rather than an empty type(), because
       type('') types nothing at all and leaves the old text standing —
       measured, and it is how a first draft of this cell read green over
       a name field it had never actually emptied.

       THE SEVENTH DRIVE IS THE LOAD-BEARING ONE. A blanket catch would
       pass every clause above and would be strictly worse than the defect
       it replaced: a swallowed TypeError is a board that quietly stops
       agreeing with itself for the rest of a workshop. So a listener
       registered through App.boot.wrap — the same boundary every listener
       in this file goes through — throws a TypeError, and #err-panel MUST
       open on it. [S07.1]'s isRefusal is what draws that line and this is
       where the line is read. */
    const d39Paths = [];
    const d39TypeInto = async (sel, text, key) => {
      await pg.click(sel);
      await pg.keyboard.press('Control+A');
      if (text === '') { await pg.keyboard.press('Delete'); }
      else { await pg.keyboard.type(text); }
      if (key) { await pg.keyboard.press(key); }
      await pg.waitForTimeout(150);
    };
    const d39Snap = () => pg.evaluate(() => JSON.stringify(App.state.get().build));
    const d39Read = (name, saidSel, dlgSel) => pg.evaluate(([nm, ss, ds]) => {
      const said = ss.charAt(0) === '#'
        ? document.querySelector(ss)
        : document.querySelector(ss).closest('.brd-line').querySelector('.brd-said');
      const box = said ? said.getBoundingClientRect() : null;
      return {
        name: nm,
        panelShut: document.querySelector('#err-panel').hidden === true,
        dialogOpen: ds === '' ? true : document.querySelector(ds).open === true,
        said: (said && said.hidden === false) ? said.textContent : '',
        onScreen: !!(box && box.width > 0 && box.height > 0),
        build: JSON.stringify(App.state.get().build)
      };
    }, [name, saidSel, dlgSel]);

    /* -- the picker's three fields. Opened through the SHIPPED control.
       THE SETUP WRITES COME FIRST AND THE SNAPSHOT COMES AFTER THEM, and
       that ordering was measured rather than chosen: a Most of 1 is only
       a REFUSAL if the Least above it actually landed, and the first draft
       of this cell drove min=9 (refused, so min stayed 0) and then max=1
       — which 0 is happily below, so the op ACCEPTED it and the cell read
       an empty said line as a defect. The board must be moved into the
       state that makes each refusal a refusal, and only then frozen. */
    await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(300);
    await d39TypeInto('#tok-pick-max', '4', 'Enter');
    await d39TypeInto('#tok-pick-min', '2', 'Enter');
    const d39BuildBefore = await d39Snap();
    await d39TypeInto('#tok-pick-min', '9', 'Enter');
    d39Paths.push(await d39Read('tok-pick-min/enter', '#tok-pick-said', '#tok-picker'));
    await d39TypeInto('#tok-pick-max', '1', 'Enter');
    d39Paths.push(await d39Read('tok-pick-max/enter', '#tok-pick-said', '#tok-picker'));
    await d39TypeInto('#tok-pick-name', '', 'Enter');
    d39Paths.push(await d39Read('tok-pick-name/enter', '#tok-pick-said', '#tok-picker'));
    const d39PickerUnmoved = d39Paths.every((p) => p.build === d39BuildBefore);
    // the blur half, on the same field with the same value
    await d39TypeInto('#tok-pick-min', '9', null);
    await pg.click('#tok-pick-name'); await pg.waitForTimeout(200);
    const d39PickerBlur = await d39Read('tok-pick-min/blur', '#tok-pick-said', '#tok-picker');
    await pg.evaluate(() => {
      const d = document.querySelector('#tok-picker');
      if (d && d.open === true) { d.close(); }
    });
    await pg.waitForTimeout(200);

    // -- the editor's two field kinds. Opened through the SHIPPED control.
    await pg.click('[data-act="openActionEditor"]'); await pg.waitForTimeout(300);
    const d39EditorBefore = await d39Snap();
    await d39TypeInto('#act-edit-cost-0-amt', 'abc', 'Enter');
    d39Paths.push(await d39Read('act-edit-cost-0-amt/enter', '#act-edit-said', '#act-edit'));
    await d39TypeInto('#act-edit-name', '', 'Enter');
    d39Paths.push(await d39Read('act-edit-name/enter', '#act-edit-said', '#act-edit'));
    const d39EditorUnmoved = d39Paths.slice(3, 5)
      .every((p) => p.build === d39EditorBefore);
    /* AND THE FIELD AND THE RECORD AGREE AFTERWARDS — P1-1's second
       repair. 999 into a cost clamps the record to MAX_ALLOC and used to
       leave 999 standing in the field until the next structural render,
       because [S06.5]'s showAmount declines to write a FOCUSED field
       (D-19) and after Enter the field is focused. */
    await d39TypeInto('#act-edit-cost-0-amt', '999', 'Enter');
    const d39Clamp = await pg.evaluate(() => ({
      field: document.querySelector('#act-edit-cost-0-amt').value,
      record: String(App.state.get().build.cats.actions[0].cost[0].n),
      panelShut: document.querySelector('#err-panel').hidden === true,
      dialogOpen: document.querySelector('#act-edit').open === true
    }));
    await d39TypeInto('#act-edit-cost-0-amt', 'abc', null);
    await pg.click('#act-edit-name'); await pg.waitForTimeout(200);
    const d39EditorBlur = await d39Read('act-edit-cost-0-amt/blur', '#act-edit-said', '#act-edit');
    await pg.evaluate(() => {
      const d = document.querySelector('#act-edit');
      if (d && d.open === true) { d.close(); }
    });
    await pg.waitForTimeout(200);

    /* -- the round rules and the board, both of which are in the page itself.
       NOTHING IS LEFT BEHIND FOR 25b, and that is not tidiness: this cell
       runs before it, 25b counts the rules in the list against the rules
       in state, and a first run of this cell left the rule it added
       standing and reddened 25b at four rows against three. So the rule
       is added, driven and taken away again through the row's OWN Remove,
       and the count is read back. */
    const d39RulesBefore = await pg.evaluate(() => App.state.get().build.rules.length);
    await pg.click('#rr-add'); await pg.waitForTimeout(250);
    const d39RuleSlot = await pg.evaluate(() => App.state.get().build.rules.length - 1);
    const d39BoardBefore = await d39Snap();
    await d39TypeInto(`.rr-rule[data-rr-slot="${d39RuleSlot}"] .rr-amt`, 'abc', 'Enter');
    d39Paths.push(await d39Read('rr-amt/enter', '#rr-refuse', ''));
    await d39TypeInto('[data-k="cats/c1/maxHp"]', 'abc', 'Enter');
    d39Paths.push(await d39Read('board-stepper/enter', '[data-k="cats/c1/maxHp"]', ''));
    const d39PageUnmoved = d39Paths.slice(5, 7)
      .every((p) => p.build === d39BoardBefore);
    // the board's blur half, and then the sentence LEAVING on return
    await d39TypeInto('[data-k="cats/c1/maxHp"]', 'abc', null);
    await pg.click('[data-k="cats/c1/shield"]'); await pg.waitForTimeout(200);
    const d39BoardBlur = await d39Read('board-stepper/blur', '[data-k="cats/c1/maxHp"]', '');
    await pg.click('[data-k="cats/c1/maxHp"]'); await pg.waitForTimeout(200);
    const d39BoardGone = await d39Read('board-stepper/return', '[data-k="cats/c1/maxHp"]', '');
    await pg.click(`.rr-rule[data-rr-slot="${d39RuleSlot}"] .rr-rm`);
    await pg.waitForTimeout(250);
    const d39RulesAfter = await pg.evaluate(() => App.state.get().build.rules.length);

    /* -- THE GENUINE-DEFECT DRIVE, AND IT GOES THROUGH A COMMIT SITE.
       ==================================================================
       THE FIRST VERSION OF THIS DRIVE WAS WORTHLESS AND A PROBE SAID SO.
       It registered a listener through App.boot.wrap and threw from it,
       which proves the panel is alive and proves nothing about the line
       P1-1 draws — the throw never reached a commit site, so isRefusal
       was never consulted. PROBE DL replaced isRefusal's body with
       `return true`, which is a BLANKET CATCH and is the one thing this
       fix must never become, and the whole gate stayed green: 322 passed,
       0 failed. Recorded here because a check that cannot fail is worse
       than no check.

       SO THE DEFECT IS RAISED WHERE A REAL ONE WOULD BE. #act-edit-*-amt
       reads data-ae-field to decide which op to send, and [S07.3] checks
       it against an allowlist — the guard that exists because that
       attribute is markup and markup drifts. The attribute is drifted
       here, deliberately, and then a perfectly good number is typed and
       committed with Enter. That is the ONE thing the allowlist exists to
       catch, it throws a TypeError from inside the commit's own try, and
       the panel MUST open with the said line still EMPTY. Under a blanket
       catch that message lands on #act-edit-said and the panel stays
       shut, and this cell reddens — which is what PROBE DL now does. */
    await pg.click('[data-act="openActionEditor"]'); await pg.waitForTimeout(300);
    const d39DriftedBefore = await pg.evaluate(() => {
      const f = document.querySelector('#act-edit-cost-0-amt');
      const was = f.dataset.aeField;
      f.dataset.aeField = 'not-an-amount-op';
      return was;
    });
    await d39TypeInto('#act-edit-cost-0-amt', '2', 'Enter');
    const d39Drifted = await pg.evaluate(() => {
      const said = document.querySelector('#act-edit-said');
      return {
        panelOpen: document.querySelector('#err-panel').hidden === false,
        title: document.querySelector('#err-title').textContent,
        says: document.querySelector('#err-message').textContent,
        detail: document.querySelector('#err-detail').value.slice(0, 40),
        saidStayedEmpty: said.hidden === true && said.textContent === ''
      };
    });
    /* DISMISSED THROUGH A CONDITION AND NEVER THROUGH pg.click, AND A PROBE
       IS WHY. PROBE DL's second run put a blanket catch back in place; the
       panel then never opened, Playwright waited 30s for a button that is
       display:none and the whole run DIED with a TimeoutError instead of
       reporting a red cell. A check must FAIL, never throw and never hang —
       so a cleanup step that assumes the state the cell is testing for is a
       cleanup step that can take the report down with it. */
    await pg.evaluate(() => {
      const e = document.querySelector('#err-panel');
      if (e && e.hidden === false) { document.querySelector('#err-dismiss').click(); }
    });
    await pg.waitForTimeout(200);
    await pg.evaluate((was) => {
      const f = document.querySelector('#act-edit-cost-0-amt');
      if (f) { f.dataset.aeField = was; }
      const d = document.querySelector('#act-edit');
      if (d && d.open === true) { d.close(); }
    }, d39DriftedBefore);
    await pg.waitForTimeout(200);

    /* -- and the panel's own WEIGHT, read on a defect raised the ordinary
       way: a listener registered through App.boot.wrap, which is the
       boundary every listener in this file goes through. This half is
       about which control the panel offers first, not about the line
       isRefusal draws. */
    await pg.evaluate(() => {
      const btn = document.createElement('button');
      btn.id = 'd39-defect-probe';
      btn.addEventListener('click', App.boot.wrap('d39 defect probe', function () {
        // The message is long on purpose: .err-detail's scrollbar is read on
        // this same panel below, and a box that does not overflow draws no bar.
        throw new TypeError('a genuine defect, not a typed value. '
          + Array.from({ length: 40 }, (unused, i) => 'frame ' + i).join(' / '));
      }));
      document.body.appendChild(btn);
    });
    await pg.click('#d39-defect-probe'); await pg.waitForTimeout(300);
    const d39Defect = await pg.evaluate(() => ({
      panelOpen: document.querySelector('#err-panel').hidden === false,
      title: document.querySelector('#err-title').textContent,
      says: document.querySelector('#err-message').textContent,
      detail: document.querySelector('#err-detail').value.slice(0, 40),
      // P1-1's third repair, read on the panel it is about: the accented
      // control is the one that KEEPS the build, and the reset is demoted
      // rather than reddened — .brd-btn--rm's treatment, one surface across.
      dismissAccented: getComputedStyle(document.querySelector('#err-dismiss'))
        .backgroundColor,
      resetGround: getComputedStyle(document.querySelector('#err-reset'))
        .backgroundColor,
      dismissLabel: document.querySelector('#err-dismiss').textContent,
      resetLabel: document.querySelector('#err-reset').textContent,
      resetDisabled: document.querySelector('#err-reset').disabled,
      /* AND THE STACK-TRACE BOX'S SCROLLBAR, WHICH IS D-39 P3-7 AND WAS
         D-39 Pass B's own deferred item. .err-detail was the last box in
         this file outside [C16]'s scroller list, so Chrome drew it in the
         light default — a white bar down the right of a dark panel, byte
         for byte the defect D-33 Pass C fixed on .pk-body one region over.
         Pass B found it on a screenshot taken with --hide-scrollbars
         removed and logged it rather than fixing it, because it predated
         that task; this cell is where the fix is read back.

         WHAT THIS RUNNER CANNOT SEE IS SAID HERE RATHER THAN ASSUMED, and
         a first draft of this clause got it exactly backwards. It asserted
         the GUTTER — offsetWidth minus clientWidth — on the argument that
         a gutter is the only thing that proves a bar is drawn. That is
         P1-3's correction and it is true of a runner that drops
         --hide-scrollbars. THIS RUNNER DOES NOT DROP IT: line 81 launches
         with Playwright's defaults, so headless Chrome hides every bar in
         every cell in this file, and the gutter here read 2px — which is
         .err-detail's own two 1px borders and is EXACTLY the "no scrollbar
         takes any width" figure the D-39 audit reported and Pass B
         explained. A clause asserting `> 0` on that number would have been
         green on a box with no styling at all.

         SO WHAT IS ASSERTED IS WHAT THE STYLE SAYS AND WHAT THE BOX DOES:
         scrollbar-width is thin, scrollbar-color names [C00]'s thumb token
         rather than the initial `auto`, the four-layer edge cue is on it,
         and the box genuinely overflows so there is something to scroll.
         The stack is made long on purpose for that last clause. THE PIXEL
         HALF WAS TAKEN OUT OF BAND: driven at 1400x900 in real Chrome with
         --hide-scrollbars removed, the gutter is 12px and the bar is dark.
         Photographed. If a later pass drops the flag from line 81, the
         gutter clause belongs back here and this paragraph is why. */
      detailGutter: document.querySelector('#err-detail').offsetWidth
        - document.querySelector('#err-detail').clientWidth,
      detailBar: getComputedStyle(document.querySelector('#err-detail'))
        .scrollbarWidth,
      detailThumb: getComputedStyle(document.querySelector('#err-detail'))
        .scrollbarColor,
      detailCue: (getComputedStyle(document.querySelector('#err-detail'))
        .backgroundImage.match(/linear-gradient/g) || []).length,
      detailOverflows: document.querySelector('#err-detail').scrollHeight
        > document.querySelector('#err-detail').clientHeight
    }));
    // Conditional, for the reason the cleanup above states in full.
    await pg.evaluate(() => {
      const e = document.querySelector('#err-panel');
      if (e && e.hidden === false) { document.querySelector('#err-dismiss').click(); }
      const n = document.querySelector('#d39-defect-probe');
      if (n) { n.remove(); }
    });
    await pg.waitForTimeout(200);
    const d39EnterOk = d39Paths.every((p) => p.panelShut === true
      && p.dialogOpen === true && p.said !== '' && p.onScreen === true);
    const d39BlurOk = [d39PickerBlur, d39EditorBlur, d39BoardBlur]
      .every((p) => p.panelShut === true && p.dialogOpen === true);
    /* SIX COMMIT PATHS, SEVEN FIELDS — commitBound owns two ends and both
       are driven, because a Least above its Most and a Most below its Least
       are two different guards inside one op and only one of them was ever
       photographed. Every name is distinct, so no channel is silently
       answering for a surface that never ran. */
    const d39Distinct = new Set(d39Paths.map((p) => p.name)).size === 7;
    note(ch, size.name, 'D-39 P1-1 six Enter paths — panel shut / dialog open / said',
      d39Paths.map((p) => `${p.name}:${p.panelShut ? 'shut' : 'PANEL'}/${p.dialogOpen ? 'open' : 'CLOSED'}/${p.said === '' ? 'SILENT' : 'said'}`).join(' '));
    note(ch, size.name, 'D-39 P1-1 the clamp — field / record',
      `${d39Clamp.field} / ${d39Clamp.record}`);
    note(ch, size.name, 'D-39 P1-1 a genuine defect still reaches the panel',
      `${d39Defect.panelOpen} "${d39Defect.title}"`);
    // The gutter is PRINTED and not judged, for the reason written at the read:
    // this runner keeps --hide-scrollbars, so 2px here is the box's own borders.
    note(ch, size.name, 'D-39 P3-7 .err-detail bar / thumb / cue / overflows',
      `${d39Defect.detailBar} ${d39Defect.detailThumb} ${d39Defect.detailCue}`
      + ` ${d39Defect.detailOverflows} (gutter ${d39Defect.detailGutter}px, bars hidden)`);
    note(ch, size.name, 'D-39 P1-1 a DRIFTED routing attribute, through the commit site',
      `panel=${d39Drifted.panelOpen} said stayed empty=${d39Drifted.saidStayedEmpty} says="${String(d39Drifted.says).slice(0, 34)}"`);
    ok(`${tag}: 25d. D-39 P1-1 — ALL SIX TYPED-VALUE COMMIT PATHS, ACROSS SEVEN FIELDS, TAKE THE REFUSAL PATH ON ENTER AND THE PANEL STAYS SHUT, THE TWO DIALOGS STAY OPEN, AND A GENUINE DEFECT STILL OPENS THE PANEL. Every field in this artifact routed a refusal-worthy typo into the global crash panel on Enter — measured, six commit paths, "SOMETHING WENT WRONG" with a raw stack trace, and in both authoring dialogs the dialog CLOSED and the session went with it. Each of the six is driven here with real keystrokes through the shipped openers: the guard's own sentence lands on that surface's own said line with a real box, the panel stays hidden, the dialog stays open, and the board is byte-identical to what it was before the first keystroke. The SAME value on the SAME field by BLUR is driven beside each, because that path already worked and is what the fix was written against — both must end in the same place, and Enter differs only by leaving a sentence. The field and the record agree after a clamped commit, which is P1-1's second repair. The panel's accented control is now the one that KEEPS the build and the reset is demoted rather than reddened, which is P1-1's third. AND THE LAST TWO DRIVES ARE WHY THIS IS NOT A BLANKET CATCH. The first version of that clause threw from a listener registered through App.boot.wrap, which never reaches a commit site at all — PROBE DL replaced isRefusal's body with a bare return-true and the whole gate stayed green over it, 322 passed and 0 failed. So the defect is now raised where a real one would be: #act-edit-cost-0-amt's routing attribute is drifted, a perfectly good number is typed and committed with Enter, [S07.3]'s allowlist throws the TypeError it exists to throw, and #err-panel MUST open with the said line still EMPTY. A blanket catch puts that message on the surface instead and reddens here. AND WHILE THE PANEL IS OPEN, ITS STACK-TRACE BOX IS READ FOR ITS SCROLLBAR — D-39 P3-7, and Pass B's own deferred item. .err-detail was the last box in this file outside [C16]'s scroller list, so Chrome drew it in the light default: a white bar down the right of a dark panel, byte for byte the defect D-33 Pass C fixed on .pk-body one region over. WHAT THIS RUNNER CANNOT SEE IS SAID AT THE READ RATHER THAN ASSUMED, and a first draft of this clause got it backwards: it asserted the gutter, on P1-3's argument that a gutter is the only proof a bar exists — which is true of a runner that drops --hide-scrollbars, and THIS RUNNER DOES NOT DROP IT. The gutter read 2px, which is the textarea's own two borders and is exactly the "no scrollbar takes any width" figure the audit reported and Pass B explained. So what is asserted is what the style says and what the box does: thin, a thumb colour that is not the initial auto, the four-layer cue, and a box that genuinely overflows — the thrown message is made long on purpose for that last one. The pixel half was taken out of band at 1400x900 with the flag removed: 12px of gutter and a dark bar, photographed`,
      d39Paths.length === 7 && d39Distinct === true
      && d39EnterOk === true && d39BlurOk === true
      && d39BoardGone.said === ''
      && d39Clamp.field === d39Clamp.record && d39Clamp.field === '99'
      && d39Clamp.panelShut === true && d39Clamp.dialogOpen === true
      && d39Drifted.panelOpen === true
      && d39Drifted.says.indexOf('No amount op for') !== -1
      && d39Drifted.detail.indexOf('TypeError') !== -1
      && d39Drifted.saidStayedEmpty === true
      && d39Defect.panelOpen === true
      && d39Defect.says.indexOf('a genuine defect, not a typed value') !== -1
      && d39Defect.detail.indexOf('TypeError') !== -1
      && d39Defect.dismissAccented !== d39Defect.resetGround
      && d39Defect.resetGround === 'rgba(0, 0, 0, 0)'
      && d39Defect.dismissLabel === 'Dismiss and continue'
      && d39Defect.resetLabel === 'Reset to Workshop 16 defaults'
      && d39Defect.resetDisabled === false
      && d39Defect.detailOverflows === true
      && d39Defect.detailBar === 'thin'
      && d39Defect.detailThumb !== 'auto' && d39Defect.detailCue === 4
      && d39PickerUnmoved === true && d39EditorUnmoved === true
      && d39PageUnmoved === true
      && d39RulesAfter === d39RulesBefore,
      { d39Paths, d39PickerBlur, d39EditorBlur, d39BoardBlur, d39BoardGone,
        d39Clamp, d39Drifted, d39Defect,
        unmoved: { picker: d39PickerUnmoved, editor: d39EditorUnmoved,
          page: d39PageUnmoved, rules: d39RulesBefore + '->' + d39RulesAfter } });

    /* -- 25e. D-39 P1-6 — "PUT THIS ACTION BACK HOW IT WAS" LEAVES A RECEIPT.
       The audit's own journey, and it is driven here rather than described: a
       new action, a name typed into the real field, terms authored through the
       real pills, and then the press. Measured before this pass:

         before:  name "Pounce EDITED", cost 3 terms, +4 req, +4 xf
         after:   name "New action",    cost 1 term,   req [],  xf []

       "All twelve terms gone. No confirmation, no preview of what will be lost,
       and NO SAID LINE AFTERWARDS stating what came back."

       THE BEHAVIOUR IS D-34'S AND STAYS. The snapshot is taken when the action
       is SELECTED and creating one selects it, so a whole session's authoring
       is what "the way it was" means, and D-17 is why there is no modal in
       front of it: the test is whether a mis-press is recoverable, and one
       Ctrl+Z is the answer. Node row 113 asserts that and asserts the sentence
       string. WHAT ONLY A BROWSER CAN SAY is that the sentence has a REAL BOX
       in the sticky foot and takes a ROW OF ITS OWN rather than sharing one
       with Done — which is exactly what Pass B's first draft of .ae-said got
       wrong, because a flex item breaks the line on its hypothetical main size
       and a 100% basis clamped at 60ch is a 480px item that fits beside a
       button. So the receipt's box is read against the footer's, and the
       control's box is read beside it. */
    /* BRACKETED, AND THE FIRST DRAFT OF THIS CELL IS WHY. It opened with
       App.ops.resetToDefaults() to get a known board, which threw away the
       token vocabulary cells 25a and 25b had authored — and the round-rules
       cell 200 lines below then died with a page error rather than reddening,
       because it went on pressing a type that no longer existed. PROBE DL's
       rule, arriving from the other end: a cell that changes state owns putting
       it back, and a cell that assumes a board it did not build owns saying so.
       So the whole state is recorded and handed back, and nothing here is
       compared against a name typed into this file. */
    const d39RcSaved = await pg.evaluate(() => JSON.stringify(App.state.get()));
    await pg.click('[data-act="openActionEditor"]'); await pg.waitForTimeout(300);
    const d39Receipt = async () => pg.evaluate(() => {
      const said = document.getElementById('act-edit-said');
      const cancel = document.getElementById('act-edit-cancel');
      const foot = cancel.parentElement;
      const sr = said.getBoundingClientRect(), cr = cancel.getBoundingClientRect();
      const fr = foot.getBoundingClientRect();
      const dlg = document.getElementById('act-edit');
      const rec = App.state.get().build[dlg.dataset.edSide].actions
        .find((a) => a.id === dlg.dataset.edPick);
      return {
        hidden: said.hidden,
        text: said.hidden ? '' : said.textContent,
        onScreen: sr.width > 0 && sr.height > 0
          && sr.top >= 0 && sr.bottom <= innerHeight
          && sr.left >= 0 && sr.right <= innerWidth,
        // A ROW OF ITS OWN: the sentence's vertical band and the control's do
        // not overlap. Read as boxes rather than as a wrap count, because a
        // sentence that shares a line is exactly what a wrap count cannot see.
        ownRow: sr.height === 0 || (sr.top >= cr.bottom - 1 || sr.bottom <= cr.top + 1),
        insideFoot: sr.height === 0
          || (sr.top >= fr.top - 1 && sr.bottom <= fr.bottom + 1),
        dialogOpen: dlg.open === true,
        panelShut: document.getElementById('err-panel').hidden === true,
        name: rec ? rec.name : null,
        terms: rec ? (rec.cost.length + rec.req.length + rec.xf.length) : null
      };
    });
    const d39RcAtRest = await d39Receipt();
    const d39RcName = d39RcAtRest.name;
    // THE INERT PRESS FIRST, because nothing has been edited yet and the two
    // answers must not be the same sentence.
    await pg.click('#act-edit-cancel'); await pg.waitForTimeout(250);
    const d39RcInert = await d39Receipt();
    // Then a real edit through the real field, committed with a real Enter.
    await d39TypeInto('#act-edit-name', 'Pounce EDITED', 'Enter');
    await pg.click('#act-edit-cancel'); await pg.waitForTimeout(300);
    const d39RcBack = await d39Receipt();
    // AND Ctrl+Z IS STILL THE RECOVERY, which is what makes D-17's ruling
    // apply to this press rather than merely be convenient. The keyboard is
    // taken off the field first, because the undo shortcut declines while a
    // free-text surface holds it.
    await pg.click('#act-edit-side-cats'); await pg.waitForTimeout(150);
    await pg.keyboard.press('Control+z'); await pg.waitForTimeout(300);
    const d39RcUndone = await d39Receipt();
    // And the line LEAVES when the student goes back into a field.
    await pg.click('#act-edit-name'); await pg.waitForTimeout(200);
    const d39RcDropped = await d39Receipt();
    await pg.evaluate((saved) => {
      const d = document.getElementById('act-edit');
      if (d && d.open) { d.close(); }
      App.state.restore(saved);
      App.state.invalidate({ structural: true });
      if (App.render.flush) App.render.flush();
    }, d39RcSaved);
    await pg.waitForTimeout(250);
    const d39RcPutBack = await pg.evaluate(() => JSON.stringify(App.state.get()));
    note(ch, size.name, 'D-39 P1-6 the receipt', d39RcBack.text);
    ok(`${tag}: 25e. D-39 P1-6 — THE CANCEL STEP LEAVES A RECEIPT, IN ITS OWN ROW OF THE STICKY FOOT, AND IT SAYS SOMETHING DIFFERENT WHEN THERE WAS NOTHING TO PUT BACK. The audit authored twelve terms through this dialog, pressed the 278px control between Proposal and Done, and watched all twelve go with "no confirmation, no preview of what will be lost, and no said line afterwards stating what came back". The behaviour is D-34's recorded semantic and is correct — the snapshot is taken when an action is SELECTED and creating one selects it — so the fix is a RECEIPT and not a gate: D-17's test is whether a mis-press is recoverable, one Ctrl+Z is the answer, and that is driven here rather than asserted. WHAT ONLY A BROWSER CAN SAY is the half node row 113 cannot reach: the sentence has a real box, it is wholly on screen, it sits INSIDE the sticky foot, and it takes A ROW OF ITS OWN rather than sharing one with Done. That last clause is not a style preference — Pass B's first draft of this line carried the 60ch measure every said line in the document has, and a flex item breaks on its hypothetical main size, so a 100% basis clamped at 60ch is a 480px item that fits comfortably beside a button and the sentence silently stopped being a line. AND THE TWO ANSWERS ARE COMPARED TO EACH OTHER: a press with nothing to put back must not print the sentence a press that put twelve terms back prints, because "nothing happened" and "everything came back" are the same picture from a chair. Then the line LEAVES on the next focusin, which is dropLoadSaid's rule — a sentence about a press stops being true once the student moves past it. THE WHOLE STATE IS RECORDED AND HANDED BACK and the handing back is read here too, because the first draft of this cell called resetToDefaults to get a known board and killed a cell 200 lines below it with a page error instead of a red — the round-rules block went on pressing a type this cell had just thrown away. Nothing here is compared against a name typed into this file either: the action's own name is read at rest and asserted to come back`,
      d39RcAtRest.hidden === true && d39RcAtRest.text === ''
      && d39RcInert.hidden === false && d39RcInert.onScreen === true
      && d39RcInert.ownRow === true && d39RcInert.insideFoot === true
      && d39RcInert.text.indexOf('Nothing was put back') !== -1
      && d39RcBack.hidden === false && d39RcBack.onScreen === true
      && d39RcBack.ownRow === true && d39RcBack.insideFoot === true
      && d39RcBack.text.indexOf('back to the name and the') !== -1
      && d39RcBack.text.indexOf('Ctrl+Z') !== -1
      && d39RcBack.text !== d39RcInert.text
      && typeof d39RcName === 'string' && d39RcName !== ''
      && d39RcName !== 'Pounce EDITED'
      && d39RcBack.name === d39RcName
      && d39RcUndone.name === 'Pounce EDITED'
      && d39RcDropped.hidden === true && d39RcDropped.text === ''
      && d39RcBack.dialogOpen === true && d39RcBack.panelShut === true
      && d39RcPutBack === d39RcSaved,
      { d39RcAtRest, d39RcInert, d39RcBack, d39RcUndone, d39RcDropped,
        putBack: d39RcPutBack === d39RcSaved });

    /* -- 25b. THE ROUND-RULES BLOCK, AUTHORED FROM END TO END THROUGH THE
       CONTROLS D-35c GAVE IT, AND MEASURED FOR THE FIVE THINGS A PICTURE
       CAUGHT AND THIS CELL DID NOT.

       WHAT THIS CELL USED TO DO AND WHY THAT WAS NOT ENOUGH. It clicked a
       token pill on the empty slot, filled the amount, clicked a party, and
       asserted the block was in the viewport with four rows of at most 56px
       each. Every one of those passed on the shipped block, and the shipped
       block: stranded the amount ~1200px right of the pills it belongs to,
       carried a dangling half-row with no party chooser under the last rule,
       offered no visible add and no visible remove at all, and put ten pills
       of two different kinds in one undifferentiated strip. A ROW HEIGHT AND A
       VIEWPORT RECTANGLE CANNOT SEE ANY OF THAT. Four measurements are added
       and they are the four the eye made:

         amtGap   - the amount's left edge against the token strip's right, so
                    "the amount belongs to this rule" is a NUMBER. It read 160
                    on the shipped block with the pills ending at 1327; the
                    same reading is what D-33 P2-7 took on .ae-term-toks.
                    IT IS KEPT HERE AND IT IS NOT THE ROW THAT GUARDS IT -
                    cell 25a is. PROBE DC put the stretch back and this cell
                    passed at 0px in all four columns, because by the time this
                    runs a sixth type has been invented and the row has no
                    spare pixel for a stretched track to claim. 25a takes the
                    same reading on the shipped vocabulary, where the slack
                    exists and is asserted to exist.
         colsAligned - every header cell's left edge against the same column's
                    left edge on a rule row. This is the whole of the grouping
                    claim: a word written once stands over the group it labels
                    only if the group is a COLUMN, and a header that has
                    drifted off its column is a label for the wrong pills.
         rowsVsRules - visible rows against rules in state. A dangling half-row
                    is exactly this number being one too many.
         addAndRemove - both controls FOUND, VISIBLE and wearing a WORD, which
                    is D-33 P3-1's ruling and the thing whose absence sent the
                    developer looking for this UI a second time.

       THE CAP IS DRIVEN RATHER THAN DESCRIBED: add until the button greys, and
       the sentence beside it must be on screen IN THE SAME FRAME - a disabled
       control with its reason one scroll away is a control that reads broken.
       Then five removes take the board back to the three rules cell 25c reads.

       AND THE REMOVAL MARK IS READ WHERE D-30 PUT IT: on the shape, not beside
       it. That is the one thing neither node gate can see. */
    const rrTok = await pg.evaluate(() => {
      const ids = Object.keys(App.state.get().build.tokens);
      const made = ids[ids.length - 1];
      // Three points of it on the first cat, so the decay below has something
      // to take away. The stepper path is the node gate's check 102 and
      // re-driving it here would be that row's claim borrowed rather than this
      // one's made.
      App.ops.setTally('cats', 'c1', made, 3);
      App.state.invalidate();
      if (App.render.flush) App.render.flush();
      return made;
    });
    await pg.waitForTimeout(200);

    // The rule is STARTED by the add button and not by a pill on a half-drawn
    // row, because that row is gone and this is the door a student has.
    await pg.click('#rr-add'); await pg.waitForTimeout(250);
    const rrFresh = await pg.evaluate(() =>
      JSON.stringify(App.state.get().build.rules[2]));
    await pg.click(`[data-k="rr/2/tok/${rrTok}"]`); await pg.waitForTimeout(250);
    await pg.fill('.rr-rule[data-rr-slot="2"] .rr-amt', '-1');
    await pg.press('.rr-rule[data-rr-slot="2"] .rr-amt', 'Enter');
    await pg.waitForTimeout(250);
    await pg.click('[data-k="rr/2/who/catsEach"]'); await pg.waitForTimeout(250);

    /* THE SCROLL IS MADE DETERMINISTIC BEFORE THE READING, AND D-38 IS WHY.
       `addShown` below asks whether the add control is wholly inside the
       viewport, and until this line it asked that at whatever scroll the last
       pg.click happened to leave the page at — which is a reading of the
       previous press, not of this surface. It survived because the page had a
       fixed height. D-38 restored the closed state on two <dialog>s that had
       been sitting in normal flow (check 127), the document got 728px shorter,
       every inherited scroll position moved, and this cell went red in all
       eight combinations on `addShown` alone. The claim it is making — the
       control can be brought wholly into view, which is cell 6b's idiom on a
       different control — is the one worth making and the one that does not
       depend on what a cell above did. */
    await pg.evaluate(() => document.querySelector('#rr-add')
      .scrollIntoView({ block: 'center' }));
    await pg.waitForTimeout(200);

    const rrBox = await pg.evaluate(() => {
      const root = document.querySelector('#roundrules');
      if (!root) return null;
      const r = root.getBoundingClientRect();
      const rows = Array.from(root.querySelectorAll('.rr-rule'))
        .filter((n) => getComputedStyle(n).display !== 'none');
      const cellsOf = (n) => Array.from(n.querySelectorAll(':scope > .rr-cell'));
      // A row is display:contents, so it HAS no box of its own - the band a
      // student reads as "one rule" is the union of its cells. Measured that
      // way rather than off the row, which reports 0 in every browser.
      const bandOf = (n) => {
        const bs = cellsOf(n).map((c) => c.getBoundingClientRect());
        return {
          top: Math.min(...bs.map((b) => b.top)),
          bottom: Math.max(...bs.map((b) => b.bottom)),
          h: Math.round(Math.max(...bs.map((b) => b.bottom))
            - Math.min(...bs.map((b) => b.top)))
        };
      };
      const heights = rows.map((n) => bandOf(n).h);
      const row0 = rows[0];
      const cols = Array.from(root.querySelectorAll('.rr-cols > .rr-cell'));
      const colLefts = cols.map((c) => Math.round(c.getBoundingClientRect().left));
      const cellLefts = cellsOf(row0)
        .map((c) => Math.round(c.getBoundingClientRect().left));
      const toks = row0.querySelector('.rr-toks').getBoundingClientRect();
      const amt = row0.querySelector('.rr-amt').getBoundingClientRect();
      const rm = row0.querySelector('.rr-rm');
      const add = document.querySelector('#rr-add');
      const addR = add.getBoundingClientRect();
      const rmR = rm.getBoundingClientRect();
      const read = document.querySelector('.rr-rule[data-rr-slot="2"] .rr-read');
      const sign = read ? read.querySelector('.sym-sign') : null;
      const shape = sign ? sign.parentNode : null;
      const sr = sign ? sign.getBoundingClientRect() : null;
      const shr = shape ? shape.getBoundingClientRect() : null;
      return {
        h: Math.round(r.height), w: Math.round(r.width),
        inView: r.left >= 0 && r.right <= innerWidth + 1 && r.width > 0,
        rows: rows.length,
        ruleCount: App.state.get().build.rules.length,
        tallest: heights.length ? Math.max(...heights) : -1,
        // THE FIVE DEFECTS, AS NUMBERS.
        amtGap: Math.round(amt.left - toks.right),
        colLefts: colLefts,
        cellLefts: cellLefts,
        colsAligned: colLefts.length === cellLefts.length
          && colLefts.every((x, i) => Math.abs(x - cellLefts[i]) <= 1),
        colWords: cols.map((c) => c.textContent),
        rmWord: rm.textContent,
        rmNamed: (rm.getAttribute('aria-label') || ''),
        rmPerRow: rows.every((n) => n.querySelectorAll('.rr-rm').length === 1),
        rmShown: rmR.width > 0 && rmR.height > 0
          && getComputedStyle(rm).visibility !== 'hidden',
        addWord: add.textContent,
        addShown: addR.width > 0 && addR.top >= 0 && addR.bottom <= innerHeight + 1,
        addOff: add.disabled,
        // The removal mark, D-30's geometry, on the live layout. The CENTRE of
        // the sign against the shape's left, which is cell 23d's own
        // measurement and not a second one: [C14.5] gives the sign
        // translate(-50%,-50%), so its LEFT edge sits half its width outside
        // the shape and a cell reading that would disagree with 23d about the
        // same geometry by exactly half a glyph.
        signOnShape: !!shape && String(shape.className || '').split(' ').indexOf('tok') !== -1,
        signColor: sign ? getComputedStyle(sign).color : '(none)',
        signOffLeft: sr && shr
          ? Math.round((sr.left + sr.width / 2) - shr.left) : -999,
        signOffTop: sr && shr
          ? Math.round(((sr.top + sr.height / 2) - shr.top) / shr.height * 100) : -999,
        pillsOnRow2: root.querySelectorAll('.rr-rule[data-rr-slot="2"] .rr-pill').length,
        tickShown: (() => {
          const on = root.querySelector('.rr-pill--on .rr-check');
          const off = root.querySelector('.rr-pill:not(.rr-pill--on) .rr-check');
          return [on ? getComputedStyle(on).visibility : 'none',
            off ? getComputedStyle(off).visibility : 'none'].join('/');
        })(),
        rule: JSON.stringify(App.state.get().build.rules[2])
      };
    });
    await pg.locator('#roundrules').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d35c-rules-${ch}-${size.name}.png`)
    });
    note(ch, size.name, 'D-35c round rules - height / rows / tallest band',
      rrBox ? `${rrBox.h}px, ${rrBox.rows} rows, tallest ${rrBox.tallest}px` : 'no node');
    note(ch, size.name, 'D-35c the amount against the pills it belongs to',
      rrBox ? `${rrBox.amtGap}px` : 'no node');
    note(ch, size.name, 'D-35c the column words over their columns',
      rrBox ? `${rrBox.colsAligned} ${JSON.stringify(rrBox.colWords)}` : 'no node');
    note(ch, size.name, 'D-35c the two controls - add / remove',
      rrBox ? `${JSON.stringify(rrBox.addWord)} / ${JSON.stringify(rrBox.rmWord)}` : 'no node');
    note(ch, size.name, 'D-35 the decay mark - parent / colour / offset',
      rrBox ? `${rrBox.signOnShape} ${rrBox.signColor} ${rrBox.signOffLeft}px/${rrBox.signOffTop}%` : 'no node');
    note(ch, size.name, 'D-35 the rule, authored by clicks',
      rrBox ? rrBox.rule : 'no node');
    ok(`${tag}: 25b. D-35's round-rules block is authored BY REAL CLICKS THROUGH D-35c's OWN CONTROLS - the ADD button starts a COMPLETE rule, a token pill points it at a type the student invented, "-1" typed into the real amount field turns it into a decay, and a party pressed afterwards keeps the token and the amount already written. THE FOUR THINGS A ROW HEIGHT COULD NOT SEE ARE NUMBERS NOW. The amount sits BESIDE the pills it belongs to - measured as the gap between the token strip's right edge and the field's left, which read 160px on the block this replaces with the pills ending at 1327 - which is D-33 P2-7's own measurement arriving on the surface that inherited D-32's un-fixed spelling. Every column word sits over its own column, to the pixel, which is what makes ONE label in the header stand for a group on eight rows instead of eight labels on eight rows. The visible row count equals the RULE count, so there is no half-drawn row under the list pretending to be a broken rule. And both controls are FOUND, VISIBLE and wearing a WORD rather than a glyph - D-33 P3-1's ruling on .unit-rm, made on the one other control in this file that deletes a student's work. THE REMOVAL MARK IS ON THE SHAPE and not beside it - D-30's geometry, read off the live layout: the sign's parent is a .tok, its centre is flush with the shape's left and sits a quarter of the way down. The live chooser is said by an outline AND a tick, and the tick on an unpressed pill is hidden`,
      rrBox !== null && rrBox.inView === true
      && rrBox.rows === 3 && rrBox.ruleCount === 3
      && rrBox.tallest > 0 && rrBox.tallest <= 96
      && rrBox.amtGap >= 0 && rrBox.amtGap <= 24
      && rrBox.colsAligned === true
      && rrBox.colWords[1].indexOf('Who') === 0
      && rrBox.rmWord === 'Remove' && rrBox.rmPerRow === true
      && rrBox.rmShown === true
      && rrBox.rmNamed.indexOf('Remove the round rule:') === 0
      && rrBox.addWord.indexOf('Add') !== -1
      && rrBox.addShown === true && rrBox.addOff === false
      && rrFresh === JSON.stringify({ who: 'cats', tok: 'hp', d: 1 })
      && rrBox.signOnShape === true
      && rrBox.signOffLeft === 0 && rrBox.signOffTop === 25
      && rrBox.pillsOnRow2 > 5
      && rrBox.tickShown === 'visible/hidden'
      && rrBox.rule === JSON.stringify({ who: 'catsEach', tok: rrTok, d: -1 }),
      { rrBox, rrFresh });

    /* -- 25b2. THE CAP, DRIVEN TO AND THEN BACK OFF, THROUGH THE SAME TWO
       CONTROLS. Five presses of the add take the list to App.data.MAX_ROUND_RULES
       and the button greys; the sentence that says why must be on screen IN
       THE SAME FRAME and beside it rather than a scroll away, which is the
       whole reason D-35c moved that line out from under the list. A sixth
       press writes nothing. Then five presses of the rows' own Remove take the
       board back to the three rules cell 25c reads, which is also this cell's
       proof that the remove is a control and not a decoration. */
    for (let i = 0; i < 5; i++) {
      await pg.click('#rr-add'); await pg.waitForTimeout(120);
    }
    /* DRIVEN INTO VIEW BEFORE IT IS MEASURED, which is cell 25's own idiom and
       is here for a measured reason: each add appends a row ABOVE the foot, so
       the foot ends the drive ~47px lower than wherever the last click's scroll
       left it. Measured at 1920x1080 as the sentence's bottom sitting just past
       innerHeight with the add still on screen - the claim being made is that a
       student LOOKING AT THE ADD sees the sentence, not that the block never
       leaves a 1080px window.

       TURNED IN THE OPEN BY PLAN 05-D38, AND THE OLD SPELLING WAS PROPPED UP BY
       A DEFECT. This read `#rr-add` with scrollIntoViewIfNeeded(), which does
       NOTHING when the add is already inside the window — and it was, with the
       sentence's last 4px hanging over the fold. It passed anyway because the
       page had 728px of phantom scroll under it: two <dialog>s parked in normal
       document flow while closed, which is check 127's defect. Restoring their
       closed state took that scroll away and this cell went red in all four
       combinations on `saidAt` alone. So the FOOT is scrolled to the end of the
       window instead — both controls are in it, and the browser clamps at the
       document's own bottom, which is where the foot is. Same claim, no longer
       resting on a defect two regions away. */
    await pg.evaluate(() => document.querySelector('.rr-foot')
      .scrollIntoView({ block: 'end' }));
    await pg.waitForTimeout(200);
    const rrCap = await pg.evaluate(() => {
      const add = document.querySelector('#rr-add');
      const said = document.querySelector('#rr-said');
      const ar = add.getBoundingClientRect();
      const sr = said.getBoundingClientRect();
      return {
        addAt: [Math.round(ar.left), Math.round(ar.top), Math.round(ar.height)],
        saidAt: [Math.round(sr.left), Math.round(sr.top), Math.round(sr.height)],
        vh: innerHeight,
        rules: App.state.get().build.rules.length,
        rows: Array.from(document.querySelectorAll('#roundrules .rr-rule'))
          .filter((n) => getComputedStyle(n).display !== 'none').length,
        addOff: add.disabled,
        saidShown: said.hidden === false && sr.width > 0
          && getComputedStyle(said).display !== 'none',
        said: said.textContent,
        // Beside the control it explains, on screen with it, not under a list
        // the student has to scroll past.
        besideAdd: Math.abs(sr.top - ar.top) < ar.height + 8
          && sr.top >= 0 && sr.bottom <= innerHeight + 1
      };
    });
    await pg.locator('#roundrules').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d35c-cap-${ch}-${size.name}.png`)
    });
    // A press on the greyed control writes nothing. force:true because
    // Playwright refuses to click a disabled button, and refusing to click it
    // would be this cell asserting Playwright's own guard rather than the
    // artifact's - and the artifact's is real, because this listener is bound
    // to pointerdown, which a disabled button still receives.
    await pg.click('#rr-add', { force: true }); await pg.waitForTimeout(200);
    const rrPastCap = await pg.evaluate(() => App.state.get().build.rules.length);
    for (let i = 7; i >= 3; i--) {
      await pg.click(`[data-k="rr/rm/${i}"]`); await pg.waitForTimeout(120);
    }
    await pg.waitForTimeout(200);
    const rrBack = await pg.evaluate(() => ({
      rules: App.state.get().build.rules.length,
      rows: Array.from(document.querySelectorAll('#roundrules .rr-rule'))
        .filter((n) => getComputedStyle(n).display !== 'none').length,
      addOff: document.querySelector('#rr-add').disabled,
      saidHidden: document.querySelector('#rr-said').hidden,
      rule2: JSON.stringify(App.state.get().build.rules[2])
    }));
    note(ch, size.name, 'D-35c the cap - rules / add off / sentence',
      `${rrCap.rules} / ${rrCap.addOff} / ${JSON.stringify(rrCap.said).slice(0, 70)}`);
    note(ch, size.name, 'D-35c back off the cap - rules / add off',
      `${rrBack.rules} / ${rrBack.addOff}`);
    ok(`${tag}: 25b2. THE CAP OF EIGHT IS REACHED THROUGH THE ADD BUTTON AND READ WHERE THE STUDENT IS LOOKING. At App.data.MAX_ROUND_RULES the control greys out and the sentence that says why is on screen BESIDE IT in the same frame - which is the pairing every disabled control in this file ships and the reason D-35c moved that line out from under the list, where it appeared as a thing arriving to explain a different thing vanishing. A forced press on the greyed control writes NOTHING, and that is the ARTIFACT's guard rather than Playwright's: this listener is bound to pointerdown, which a disabled button still receives. Then five presses of the rows' own Remove take the list back down, the add comes back on, the sentence goes away, and the rule the student authored is untouched - which is the removal proved as a control rather than as a decoration`,
      rrCap.rules === 8 && rrCap.rows === 8 && rrCap.addOff === true
      && rrCap.saidShown === true && rrCap.said.indexOf('all 8') !== -1
      && rrCap.besideAdd === true
      && rrPastCap === 8
      && rrBack.rules === 3 && rrBack.rows === 3
      && rrBack.addOff === false && rrBack.saidHidden === true
      && rrBack.rule2 === JSON.stringify({ who: 'catsEach', tok: rrTok, d: -1 }),
      { rrCap, rrPastCap, rrBack });

    /* ── 25c. THE FIGHT SAYS WHAT THE RULES ARE, AND THEN WHAT THEY DID.
       D-31's line, read off the live page: the "Each round" block is inside the
       round-STATE area and carries NO control at all, and the whole authoring
       block is display:none in this view. Then two rounds are advanced with
       nothing declared, so the only thing that can move a number is a rule, and
       the decay is read back off the what-changed reading BY THE TYPE'S OWN
       NAME. */
    await pg.click('#fight-start'); await pg.waitForTimeout(350);
    const eachRound = await pg.evaluate(() => {
      const box = document.querySelector('#fight-state .fg-eachround');
      const rules = document.querySelector('#roundrules');
      if (!box) return null;
      const r = box.getBoundingClientRect();
      const state = document.querySelector('#fight-state').getBoundingClientRect();
      const input = document.querySelector('#fight-input').getBoundingClientRect();
      return {
        lines: box.querySelectorAll('.fg-rr-line').length,
        controls: box.querySelectorAll('button, input, [data-rr]').length,
        symbols: box.querySelectorAll('.sym .tok').length,
        named: Array.from(box.querySelectorAll('.sym'))
          .every((n) => (n.getAttribute('title') || '') !== ''
            && n.getAttribute('title') === n.getAttribute('aria-label')),
        h: Math.round(r.height),
        inState: r.top >= state.top - 1 && r.bottom <= state.bottom + 1,
        aboveInput: r.bottom <= input.top + 1,
        editorAway: rules ? getComputedStyle(rules).display : '(no node)',
        head: (box.querySelector('.fg-rr-head') || {}).textContent
      };
    });
    await pg.locator('#fight-state .fg-eachround').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d35b-eachround-${ch}-${size.name}.png`)
    });
    note(ch, size.name, 'D-35 the fight reading — lines / controls / height',
      eachRound ? `${eachRound.lines} / ${eachRound.controls} / ${eachRound.h}px` : 'no node');

    await pg.click('[data-k="fg/advance"]'); await pg.waitForTimeout(350);
    await pg.click('[data-k="fg/advance"]'); await pg.waitForTimeout(350);
    const decaySeen = await pg.evaluate((tok) => {
      const body = document.querySelector('.ld-now-body');
      if (!body) return null;
      const name = App.render.labelFor(App.state.get(), tok);
      const said = Array.from(body.querySelectorAll('.ld-now-line'))
        .map((n) => {
          const sym = n.querySelector('.sym');
          return sym ? sym.getAttribute('title') : n.textContent;
        });
      return {
        said: said,
        decay: said.filter((t) => t.indexOf(name + ' 2 to 1.') !== -1).length,
        pool: said.filter((t) => t.indexOf('3 to 6.') !== -1
          || t.indexOf('6 to 9.') !== -1).length,
        live: App.state.get().fight.cats.units[0].tally[tok],
        round: App.state.get().fight.round
      };
    }, rrTok);
    await pg.locator('.ld-now').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d35b-whatchanged-${ch}-${size.name}.png`)
    });
    note(ch, size.name, 'D-35 the decay, seen on Advance',
      decaySeen ? `round ${decaySeen.round}, tally ${decaySeen.live}, decay lines ${decaySeen.decay}` : 'no node');
    ok(`${tag}: 25c. THE FIGHT SAYS WHAT THE RULES ARE AND THEN WHAT THEY DID. The "Each round" block sits inside the round-STATE area, ABOVE the input area, and carries ZERO controls — D-31's line held for a second feature, read off the live layout rather than asserted in a comment — while the whole authoring block is display:none in this view. Every reading in it draws a real token and carries a title equal to its aria-label, which is D-29's admissibility argument on a fourth surface. Then two rounds are advanced with NOTHING DECLARED, so the only thing that can move a number is a rule: the student's own decay is read back off the what-changed reading by the type's own name at both ends, and the pool's +3 rides along as a second, independent witness in the same reading`,
      eachRound !== null && eachRound.lines === 3 && eachRound.controls === 0
      && eachRound.symbols > 0 && eachRound.named === true
      && eachRound.inState === true && eachRound.aboveInput === true
      && eachRound.editorAway === 'none'
      && String(eachRound.head).indexOf('Each round') === 0
      && decaySeen !== null && decaySeen.round === 3 && decaySeen.live === 1
      && decaySeen.decay === 1 && decaySeen.pool === 2,
      { eachRound, decaySeen });

    await endFight(pg);
    await pg.evaluate(() => {
      App.ops.resetToDefaults();
      App.state.invalidate({ structural: true });
      if (App.render.flush) App.render.flush();
    });
    await pg.waitForTimeout(200);

    // ═════════════════════════════════════════════════════════════════════════════════════
    // 26. D-36's NUDGE, AND D-37's UNIT POPUP THAT SUPERSEDES HALF OF IT.
    // ═════════════════════════════════════════════════════════════════════════════════════
    // D-36: "add the ability to directly click on a resource to directly modify the value of
    // that resource in the current round." D-37, one round later: "click on a unit then click
    // on the popup window to modify the values associated with it."
    //
    // THE SECOND SENTENCE TAKES HALF OF THE FIRST BACK, AND THESE CELLS RECORD THE TURN.
    // D-37's interpretation: "This supersedes D-36's per-reading nudge ON THE BATTLEFIELD —
    // the readings there return to being readings, the unit shape's click opens the popup, and
    // the nudge lives inside it. The team-resource direct click stays as D-36 built it." So
    // 26, 26b, 26c, 26e and 26f are TURNED — each was written about a claim that has changed,
    // each went RED against the artifact before it was rewritten, and each now asserts the new
    // contract. 26d is untouched: it drives the team-resource keyboard route, which D-37
    // leaves alone. 26g and 26h are the popup's own.
    //
    // THE RECORDED RED, on the commit that removed data-fg from .bf-line and before any cell
    // here was rewritten: every `resSel(..., 'c1', 'hp')` click timed out, because the selector
    // names a node the artifact no longer builds. That timeout IS the reading.
    //
    // THIS BLOCK IS HERE AND NOT IN THE NODE GATE FOR FOUR REASONS THAT ARE EACH A CLASS OF
    // CLAIM THE STUB DOM STRUCTURALLY CANNOT REACH:
    //   - THE FOCUS CASE. Plan 05-10 MEASURED that a pointer press on a control whose node is
    //     rebuilt drops the keyboard to <body>. A nudge repaints on every press, so a rapid
    //     −−− is the exact shape that failure takes — and only a real browser, with a real
    //     default focus-on-mousedown, can tell three presses landing from one landing. Under
    //     D-37 the case moves INSIDE the popup, whose rows are built rather than shell.
    //   - THE HIT TEST. Playwright clicks the CENTRE of an element, which is how D-36's
    //     nesting collision was found in the first place. D-37 removes the nesting, and the
    //     centre click is what says the shape now answers for its whole area.
    //   - THE PLACEMENT. Both boxes are position:fixed with their offsets measured off an
    //     anchor's rect, and the stub has no layout at all. D-37 adds the edge case: a popup
    //     opened on the LEFTMOST cat and on the RIGHTMOST mech must still be wholly on screen.
    //   - THE KEYBOARD. Tab order and a real default focus are browser behaviour.
    const d36 = await pg.evaluate(() => {
      const tok = App.ops.createTokenType({
        name: 'Chill', shape: 'tri', color: 'violet', glyph: '', scope: 'unit'
      });
      const side = App.ops.createTokenType({
        name: 'Rage', shape: 'hex', color: 'coral', glyph: '', scope: 'side'
      });
      App.ops.setTokenBounds(tok, { min: 0, max: 3 });
      App.ops.setTokenBounds(side, { min: 0, max: 3 });
      App.ops.setTokenBounds('hp', { min: 0, max: 4 });
      // Four health on the one cat the block drives, so three presses of the −
      // have somewhere to go before the floor and two more have nowhere.
      App.ops.setUnitMaxHp('cats', 'c1', 4);
      App.ops.setTally('cats', 'c1', tok, 2);
      App.ops.setTally('cats', null, side, 2);
      App.ops.setUnitShield('cats', 'c1', 2);
      App.state.invalidate({ structural: true });
      if (App.render.flush) App.render.flush();
      return { tok, side };
    });
    await pg.click('#view-fight'); await pg.waitForTimeout(200);
    await startFight(pg);

    // What D-36's box says about itself, read whole, so one helper serves every cell below.
    const nudge = () => pg.evaluate(() => {
      const box = document.querySelector('#fg-nudge');
      if (!box) return null;
      const r = box.hidden ? null : box.getBoundingClientRect();
      const says = document.querySelector('#fg-nudge-says');
      const less = document.querySelector('#fg-nudge-less');
      return {
        shut: box.hidden === true,
        side: box.dataset.fgSide || '', unit: box.dataset.fgUnit || '',
        tok: box.dataset.fgTok || '',
        who: (document.querySelector('#fg-nudge-who') || {}).textContent,
        type: (document.querySelector('#fg-nudge-tok') || {}).textContent,
        val: (document.querySelector('#fg-nudge-val') || {}).textContent,
        says: says ? (says.hidden ? '' : says.textContent) : null,
        // The accessible name a screen reader gets, and the channel that keeps the student's
        // own word out of the copy harvest — both read, because one without the other is a
        // name that is right and a gate that is blind, or the reverse.
        aria: less ? less.getAttribute('aria-label') : null,
        exempt: less ? (less.dataset.albl || '') : null,
        onScreen: r === null ? null
          : (r.left >= 0 && r.top >= 0 && r.right <= window.innerWidth && r.bottom <= window.innerHeight),
        // Nothing may be painted over the box: it sits at z-index 40, above #strip's sidebar
        // and below the error panel, and elementFromPoint is the only reading that proves it.
        topmost: r === null ? null
          : String((document.elementFromPoint(Math.round((r.left + r.right) / 2),
            Math.round(r.top + 8)) || {}).className || ''),
        focus: document.activeElement ? document.activeElement.id : null
      };
    });
    const resSel = (side, unit, tok) => '#state-' + side + ' [data-fg="res"]'
      + '[data-fg-unit="' + unit + '"][data-fg-tok="' + tok + '"]';
    // D-37's shape, and its popup. The shape is the control now — there is nothing inside it
    // to aim at — so a plain selector on the shape is what a student's click is.
    const bfSel = (side, unit) => '#state-' + side + ' [data-fg="bf"][data-fg-val="' + unit + '"]';
    const popup = () => pg.evaluate(() => {
      const box = document.querySelector('#fg-unit');
      if (!box) return null;
      const r = box.hidden ? null : box.getBoundingClientRect();
      const rows = Array.from(box.querySelectorAll('.fgu-row'));
      return {
        shut: box.hidden === true,
        side: box.dataset.fgSide || '', unit: box.dataset.fgUnit || '',
        head: (document.querySelector('#fg-unit-head') || {}).textContent,
        // Every row read whole: which value it is, the word beside it, the SYMBOLIC reading's
        // tooltip (D-29 puts the prose there), the bound sentence when there is one, and
        // whether it really drew a token rather than an empty box.
        rows: rows.map((row) => {
          const sym = row.querySelector('.sym');
          const says = row.querySelector('.fgu-says');
          return {
            tok: row.dataset.fguTok || '',
            lbl: (row.querySelector('.fgu-lbl') || {}).textContent,
            said: sym ? sym.getAttribute('title') : null,
            aria: sym ? sym.getAttribute('aria-label') : null,
            tsay: sym ? (sym.dataset.tsay || '') : null,
            toks: row.querySelectorAll('.tok').length,
            says: says ? (says.hidden ? '' : says.textContent) : null,
            steps: row.querySelectorAll('[data-fg="unudge"]').length,
            alive: !!row.querySelector('[data-fg="ualive"]')
          };
        }),
        onScreen: r === null ? null
          : (r.left >= 0 && r.top >= 0 && r.right <= window.innerWidth && r.bottom <= window.innerHeight),
        topmost: r === null ? null
          : String((document.elementFromPoint(Math.round((r.left + r.right) / 2),
            Math.round(r.top + 8)) || {}).className || ''),
        disabled: Array.from(box.querySelectorAll('button')).filter((b) => b.disabled).length,
        focus: document.activeElement ? (document.activeElement.dataset.k || '') : ''
      };
    });
    const stepSel = (side, unit, tok, tail) =>
      '#fg-unit [data-k="fg/u/' + side + '/' + unit + '/' + tok + '/' + tail + '"]';

    // ── 26. THE TWO READING CLASSES D-37 LEAVES AS CONTROLS, EACH AT ITS OWN SPOT. ────────
    // TURNED: this cell drove five readings in four classes and drives the two that are still
    // readings-as-controls. The other three moved into the popup and 26g drives them there, so
    // nothing this cell used to assert has stopped being asserted anywhere.
    const opened = {};
    for (const [label, sel] of [
      ['pool', resSel('cats', '', 'ap')],
      ['side tally', resSel('cats', '', d36.side)]
    ]) {
      await pg.click(sel); await pg.waitForTimeout(220);
      const n = await nudge();
      const anchored = await pg.evaluate((s) => {
        const a = document.querySelector(s).getBoundingClientRect();
        const b = document.querySelector('#fg-nudge').getBoundingClientRect();
        // "AT THAT SPOT" — the developer's own words — measured: the box sits within a
        // hand's width of the reading it edits, on both axes, rather than in a corner of
        // the page. 24px is the 6px gap plus room for the anchor's own line height.
        //
        // BELOW THE READING **OR** ABOVE IT, because a reading near the bottom of the
        // viewport has no room underneath and [S06.14] flips the box rather than opening it
        // half off screen.
        return Math.abs(b.left - a.left) <= 24
          && (Math.abs(b.top - a.bottom) <= 24 || Math.abs(a.top - b.bottom) <= 24);
      }, sel);
      opened[label] = Object.assign({ anchored }, n);
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
    }
    // AND THE BATTLEFIELD'S READINGS ARE READINGS AGAIN, counted on the live page. This is the
    // supersession itself, measured rather than described: the lines are still drawn, and not
    // one of them carries a routing attribute.
    const bfLines = await pg.evaluate(() => {
      const all = Array.from(document.querySelectorAll('#state-cats .bf-line, #state-mechs .bf-line'));
      return { n: all.length, pressable: all.filter((n) => n.dataset.fg !== undefined).length };
    });
    note(ch, size.name, 'D-37 battlefield lines / pressable', `${bfLines.n} / ${bfLines.pressable}`);
    ok(`${tag}: 26. D-37 — THE TEAM RESOURCES ARE STILL DIRECT CONTROLS AND THE BATTLEFIELD'S READINGS ARE READINGS AGAIN. This cell is D-36's, turned: it drove five readings in four classes, and D-37 moves three of them into the popup — "the readings there return to being readings, the unit shape's click opens the popup, and the nudge lives inside it. The team-resource direct click stays as D-36 built it." So the side's POOL and a side-scope tally of a type the STUDENT invented each open the nudge at their own spot, name the faction and the type, show the number that is really on the board, sit within a hand's width of the reading rather than in a corner, are fully on screen and are the topmost thing at their own coordinates — and the battlefield's lines are COUNTED on the live page with NONE of them carrying a routing attribute, which is the supersession measured rather than described. THE ACCESSIBLE NAME IS READ TOO, and so is the exemption channel beside it: a name that says the student's word and a gate that cannot see it are the two halves of the wave-1 lesson`,
      ['pool', 'side tally'].every((k) => {
        const n = opened[k];
        return n && n.shut === false && n.anchored === true && n.onScreen === true
          && /fgn/.test(n.topmost) && String(n.val) !== '' && String(n.who) !== ''
          && String(n.type) !== '' && String(n.aria).indexOf('Decrease ') === 0
          && String(n.aria).indexOf(n.type) !== -1 && n.exempt === n.tok;
      })
      && opened.pool.val === '3' && opened['side tally'].val === '2'
      && opened.pool.unit === '' && opened.pool.who === 'Cats'
      && opened['side tally'].type === 'Rage'
      && bfLines.n > 0 && bfLines.pressable === 0,
      { opened, bfLines });

    // ── 26b. THE FOCUS CASE, DRIVEN — NOW INSIDE THE POPUP. ──────────────────────────────
    // TURNED, and the turn makes the cell HARDER rather than easier. D-36 answered plan
    // 05-10's measured defect by making its two buttons static shell; the popup CANNOT do
    // that, because a unit carries a different number of values on every board. It answers it
    // with a fingerprint instead — the rows are keyed on the side, the unit and the token LIST
    // and never on a number — so this cell is the only thing in the repository that can say
    // whether that answer works under a real pointer.
    await pg.click(bfSel('cats', 'c1')); await pg.waitForTimeout(250);
    const hpWas = await pg.evaluate(() => App.state.get().fight.cats.units[0].hp);
    // The node identity is taken BEFORE the run and compared after it, which is the direct
    // reading of "nothing was rebuilt" rather than an inference from the count.
    await pg.evaluate((s) => { window.__d37btn = document.querySelector(s); },
      stepSel('cats', 'c1', 'hp', 'less'));
    await pg.click(stepSel('cats', 'c1', 'hp', 'less')); await pg.waitForTimeout(110);
    await pg.click(stepSel('cats', 'c1', 'hp', 'less')); await pg.waitForTimeout(110);
    await pg.click(stepSel('cats', 'c1', 'hp', 'less')); await pg.waitForTimeout(220);
    const rapid = await pg.evaluate((s) => ({
      hp: App.state.get().fight.cats.units[0].hp,
      alive: App.state.get().fight.cats.units[0].alive,
      standing: App.state.get().fight.cats.units.filter((u) => u.alive).length,
      hand: (App.state.get().fight.hand || []).filter((h) => h.tok === 'hp').length,
      focus: document.activeElement ? (document.activeElement.dataset.k || '') : '',
      same: window.__d37btn === document.querySelector(s),
      said: (document.querySelector('#fg-unit .fgu-row[data-fgu-tok="hp"] .sym') || {})
        .getAttribute ? document.querySelector('#fg-unit .fgu-row[data-fgu-tok="hp"] .sym').getAttribute('title') : null
    }), stepSel('cats', 'c1', 'hp', 'less'));
    await pg.locator('#fg-unit').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d37-popup-${ch}-${size.name}.png`)
    });
    note(ch, size.name, 'D-37 three rapid presses', `${hpWas} -> ${rapid.hp}, ${rapid.hand} rulings`);
    ok(`${tag}: 26b. THREE RAPID PRESSES OF A VALUE'S MINUS LAND THREE RULINGS, AND THE SECOND AND THIRD ARE THE ONES THAT MATTER. Plan 05-10 measured that a pointer press on a control whose own node is REBUILT drops the keyboard to <body> — and this control repaints on every press by construction, so presses two and three would land on nothing. D-36 answered that by making its pair static shell; a popup CANNOT, because a unit carries a different number of values on every board, so [S06.15] answers it with a fingerprint of the side, the unit and the token LIST — never a number — and this cell is the only thing in the repository that can say whether that works under a real pointer. Read four ways because fewer would not settle it: the health falls by exactly three, the round's by-hand list holds exactly three health rulings, the keyboard is still on the button rather than on the body, AND THE BUTTON IS THE SAME NODE OBJECT it was before the run. AND EVERY UNIT IS STILL STANDING, which is where D-00d starts: nothing a student presses here writes the flag, and 26c takes the same cat all the way to zero and reads it again`,
      hpWas === 4 && rapid.hp === 1 && rapid.hand === 3
      && rapid.focus === 'fg/u/cats/c1/hp/less' && rapid.same === true
      && rapid.alive === true && rapid.standing === 9
      && rapid.said === born.c1 + ' Health, 1.',
      { hpWas, rapid });

    // ── 26c. THE BOUND CLAMPS, THE READING SAYS SO, AND UNDO KEEPS ITS SHIPPED SHAPE. ────
    await pg.click(stepSel('cats', 'c1', 'hp', 'less')); await pg.waitForTimeout(180);
    const clamped = await pg.evaluate(() => {
      const row = document.querySelector('#fg-unit .fgu-row[data-fgu-tok="hp"]');
      const says = row.querySelector('.fgu-says');
      return {
        hp: App.state.get().fight.cats.units[0].hp,
        alive: App.state.get().fight.cats.units[0].alive,
        standing: App.state.get().fight.cats.units.filter((u) => u.alive).length,
        hand: (App.state.get().fight.hand || []).filter((h) => h.tok === 'hp').length,
        says: says.textContent,
        shown: says.hidden === false,
        said: row.querySelector('.sym').getAttribute('title'),
        panel: document.querySelector('#err-panel').hidden
      };
    });
    /* AND THE PRESS THE BOUND ACTUALLY REFUSES, WHICH THIS CELL HAS ALWAYS
       DESCRIBED AND NEVER MADE — D-39 P2-9. Plan 05-D39d.

       Its own sentence below reads "the FOURTH press of the − has nowhere
       to go: the number stops at the floor, NO further ruling is recorded".
       The drive above stops one press short of that: health runs 4-3-2-1
       and this last press takes it 1 to 0, which MOVES the number and
       records the fourth ruling — hand === 4 is the count of presses that
       worked, not evidence of one that did not. So the promised press is
       made here, and the clause the prose promised is asserted for the
       first time: the record does not grow.

       IT IS ALSO THE HALF D-39 P2-9 TURNS. The bound line used to go up
       the moment a value SAT on a bound, so `clamped` above found it after
       a press that had arrived rather than been refused — and on open,
       before anything at all. Arriving at a bound and being refused by one
       are two facts about the same number and only the second is an answer
       to anything. Both are read now, in that order. */
    await pg.click(stepSel('cats', 'c1', 'hp', 'less')); await pg.waitForTimeout(200);
    const refusedByBound = await pg.evaluate(() => {
      const row = document.querySelector('#fg-unit .fgu-row[data-fgu-tok="hp"]');
      const says = row.querySelector('.fgu-says');
      return {
        hp: App.state.get().fight.cats.units[0].hp,
        hand: (App.state.get().fight.hand || []).filter((h) => h.tok === 'hp').length,
        says: says.textContent,
        shown: says.hidden === false,
        // NULL-GUARDED, AND PROBE EA IS WHY. Its first spelling read
        // .textContent off the lookup directly, so a probe that DELETED
        // the figure — which is exactly the regression this clause exists
        // to catch — made this cell THROW a TypeError and took the whole
        // run down with it instead of reddening one row. A cell must FAIL,
        // never throw and never hang: Pass B's recorded rule, at a cell I
        // wrote two commits after reading it.
        figure: (function () {
          const numNode = row.querySelector('.fgu-num');
          return numNode ? numNode.textContent : null;
        }()),
        panel: document.querySelector('#err-panel').hidden
      };
    });
    // THE PICTURE OF THE REFUSAL, taken in the state a student is actually in when they press
    // a − and nothing moves. "Twenty-one consecutive rendered changes had a defect only
    // pictures showed" is this phase's own lesson about which frame is worth photographing.
    await pg.locator('#fg-unit').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d37-clamped-${ch}-${size.name}.png`)
    });
    // AND THE WHOLE VIEWPORT AROUND IT, because a box that reads perfectly on its own and
    // covers the unit it was opened on is a defect only a wider frame can show.
    await pg.screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d37-inplace-${ch}-${size.name}.png`)
    });
    // THE SCROLL, DRIVEN. The popup is measured against its shape on a rendered frame, and a
    // scroll commits nothing and schedules no frame — so without the capture-phase listener
    // [S07.5] gained under D-36 it would stay at coordinates the page had moved out from
    // under. RE-PLACED RATHER THAN DISMISSED, for D-36's recorded reason: these shapes sit in
    // a column a student scrolls through while reading the board.
    const followed = await pg.evaluate(async () => {
      const read = () => {
        const a = document.querySelector('#state-cats [data-fg="bf"][data-fg-val="c1"]')
          .getBoundingClientRect();
        const b = document.querySelector('#fg-unit').getBoundingClientRect();
        return { gap: Math.round(Math.min(Math.abs(b.top - a.bottom), Math.abs(a.top - b.bottom))), top: Math.round(b.top) };
      };
      const before = read();
      window.scrollBy(0, 120);
      await new Promise((r) => setTimeout(r, 250));
      const after = read();
      window.scrollBy(0, -120);
      await new Promise((r) => setTimeout(r, 250));
      return { before, after };
    });
    await pg.waitForTimeout(200);
    // UNDO, AND THE SHIPPED COALESCING RULE IS WHAT IS ASSERTED rather than "one press, one
    // Ctrl+Z". nudgeFightHp's label carries the side and the unit and is IDENTICAL to
    // setUnitHp's, deliberately, so a run of presses inside COALESCE_MS (500 ms) is ONE undo
    // entry — UX-01 and D-10, and the ops' own reason: forty Ctrl+Z for one held button is not
    // a recovery, it is a chore.
    const undone = await pg.evaluate(() => {
      const before = App.state.get().fight.cats.units[0].hp;
      App.ops.undo();
      App.state.invalidate(); if (App.render.flush) App.render.flush();
      return { before, afterRun: App.state.get().fight.cats.units[0].hp };
    });
    await pg.waitForTimeout(700);   // past COALESCE_MS, so the next press is its own entry
    await pg.click(stepSel('cats', 'c1', 'hp', 'less')); await pg.waitForTimeout(250);
    const alone = await pg.evaluate(() => {
      const before = App.state.get().fight.cats.units[0].hp;
      App.ops.undo();
      App.state.invalidate(); if (App.render.flush) App.render.flush();
      return { before, after: App.state.get().fight.cats.units[0].hp };
    });
    await pg.waitForTimeout(200);
    note(ch, size.name, 'D-37 the bound, said', refusedByBound.says);
    note(ch, size.name, 'D-39 P2-9 arrived at the bound / refused by it',
      `says "${clamped.says}" hand ${clamped.hand}`
      + ` -> says "${String(refusedByBound.says).slice(0, 22)}" hand ${refusedByBound.hand}`
      + ` figure ${refusedByBound.figure}`);
    ok(`${tag}: 26c. PRESSING PAST A D-35 BOUND INSIDE THE POPUP CLAMPS, SAYS WHY, AND RAISES NOTHING. The health type is bounded to 0-4 on this board, so the fourth press of the − has nowhere to go: the number stops at the floor, NO further ruling is recorded — "a number went from one value to another" is false of a press that moved nothing — and the ROW's own line states what the board keeps this number between. IT IS THE SAME SENTENCE THE TEAM-RESOURCE NUDGE SAYS, from the same function, so a student who met it on a pool meets it unchanged here. IT IS ARITHMETIC AND FACTUAL AND IT NAMES NO TYPE: never "you cannot", never "too low", never a judgement about a number a student chose. THE ERROR PANEL STAYS SHUT, which is the clause that matters most in a room. TURNED IN THE OPEN UNDER D-39 P2-9, AND THE TURN IS THAT THIS CELL NOW MAKES THE PRESS IT ALWAYS DESCRIBED: the drive stopped one short, so what it measured was the press that ARRIVED at the floor — health 1 to 0, a real ruling, hand going to 4 — while its own sentence claimed a press with nowhere to go and no ruling recorded. Both are read now, in order: the arriving press moves the number and says NOTHING, because arriving at a bound is not being refused by one and the audit photographed that sentence standing on a box before anything had been pressed at all; the next press moves nothing, records nothing — the clause this prose promised and never tested — and IS the one that answers. AND THE UNIT IS STILL STANDING AT ZERO — D-00d again, at the other end of the same press, with the survivor count unmoved. THE BOX THEN FOLLOWS A REAL SCROLL, which a screenshot found under D-36 and which this box inherits: the placement is measured off the shape's rect on a rendered frame, and a scroll commits nothing and schedules no frame. THEN UNDO IN ITS SHIPPED SHAPE, both halves: the rapid run is ONE Ctrl+Z because these ops share setUnitHp's label inside COALESCE_MS, and a press made after the window comes back on its own`,
      clamped.hp === 0 && clamped.alive === true && clamped.standing === 9
      && clamped.hand === 4
      // ARRIVED AT, NOT REFUSED BY. Turned under D-39 P2-9 — see the block
      // above the second press for why this reads the opposite of what it did.
      && clamped.shown === false && clamped.says === ''
      && clamped.said === born.c1 + ' Health, 0.' && clamped.panel === true
      && refusedByBound.hp === 0 && refusedByBound.hand === 4
      && refusedByBound.figure === '0'
      && refusedByBound.shown === true
      && refusedByBound.says === 'This board keeps this number between 0 and 4.'
      && refusedByBound.panel === true
      && followed.before.gap <= 24 && followed.after.gap <= 24
      && followed.before.top !== followed.after.top
      && undone.before === 0 && undone.afterRun === 4
      && alone.before === 3 && alone.after === 4,
      { clamped, refusedByBound, followed, undone, alone });

    // ── 26d. DISMISSAL, BOTH WAYS, AND THE TEAM-RESOURCE KEYBOARD ROUND TRIP. ────────────
    // UNTOUCHED BY D-37. This is D-36's own path and D-37 leaves it exactly as it was.
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    await pg.click(resSel('cats', '', 'ap')); await pg.waitForTimeout(220);
    const byOpen = await nudge();
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    const byEsc = await nudge();
    await pg.click(resSel('cats', '', 'ap')); await pg.waitForTimeout(200);
    await pg.click('#fight-head'); await pg.waitForTimeout(220);
    const byElsewhere = await nudge();
    // The keyboard route: Tab is not driven — focus is placed on the row the way a Tab would
    // leave it — and then the whole trip is real key presses.
    await pg.evaluate((s) => document.querySelector(s).focus(), resSel('cats', '', 'ap'));
    await pg.keyboard.press('Enter'); await pg.waitForTimeout(250);
    const kbdOpen = await nudge();
    await pg.keyboard.press('Enter'); await pg.waitForTimeout(250);
    const kbdRuled = await pg.evaluate(() => ({
      ap: App.state.get().fight.cats.ap,
      hand: (App.state.get().fight.hand || []).filter((h) => h.tok === 'ap' && h.unit === null).length
    }));
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(250);
    const kbdBack = await pg.evaluate(() => ({
      shut: document.querySelector('#fg-nudge').hidden,
      focusK: document.activeElement ? (document.activeElement.dataset.k || '') : ''
    }));
    ok(`${tag}: 26d. THE TEAM-RESOURCE NUDGE DISMISSES ON A PRESS ELSEWHERE AND ON ESCAPE, AND THE KEYBOARD MAKES A ROUND TRIP. Both of D-36's two conditions, driven on the half of that feature D-37 leaves standing: Escape shuts it, and a press on a heading that is neither the box nor a reading shuts it — the second needs a listener on the DOCUMENT, because "elsewhere" includes the top bar and both dialogs. Then the keyboard route end to end: focus lands on the team-resource row as a Tab would leave it, Enter opens the control AND PUTS THE KEYBOARD INTO IT rather than three hundred nodes back in document order, Enter on the − writes a real ruling with a null unit because a pool belongs to the side, and Escape shuts the box AND HANDS THE FOCUS BACK to the row it came from. A control the keyboard can enter and not leave is a trap; this cell is what says it is not one`,
      byOpen.shut === false && byEsc.shut === true && byElsewhere.shut === true
      && kbdOpen.shut === false && kbdOpen.focus === 'fg-nudge-less'
      && kbdOpen.tok === 'ap' && kbdOpen.unit === ''
      && kbdRuled.ap === 2 && kbdRuled.hand === 1
      && kbdBack.shut === true && kbdBack.focusK === 'fg/res/cats/side/ap',
      { byOpen, byEsc, byElsewhere, kbdOpen, kbdRuled, kbdBack });

    // ── 26e. THE SHAPE'S TWO JOBS, SEPARATED IN TIME. ────────────────────────────────────
    // TURNED. D-36 separated a reading from the shape it sat inside by nesting, and a real
    // centre click found the flaw — the centre of a lit shape IS a reading. D-37 removes the
    // nesting, so a centre click on a shape is unambiguous, and what is left is the half that
    // was always load-bearing: a half-made retarget owns the whole battlefield.
    const atRest = await pg.evaluate(() => ({
      at: App.state.get().fight.decl.length,
      lit: document.querySelectorAll('.bf-unit--lit').length
    }));
    await pg.click(bfSel('cats', 'c2')); await pg.waitForTimeout(250);
    const restShape = await popup();
    // The box's own text-labelled way out, pressed — UX-02: Escape and a press elsewhere are
    // both invisible, and a student who knows neither still needs one.
    await pg.click('#fg-unit-close'); await pg.waitForTimeout(200);
    const d37AfterClose = await popup();
    // Then ARMED. Every press anywhere on a shape is the retarget flow's, and the click lands
    // at the shape's CENTRE, which is exactly the pixel that caught D-36's collision.
    const mechAct = await pg.evaluate(() => {
      const a = App.state.get().build.mechs.actions[0];
      App.ops.dispatch('declare', { side: 'mechs', actionId: a.id, by: 'm1', at: 'c1' });
      App.state.invalidate(); if (App.render.flush) App.render.flush();
      return a.id;
    });
    await pg.waitForTimeout(200);
    await pg.click('#decl-mechs [data-fg="at"][data-fg-by="m1"]'); await pg.waitForTimeout(250);
    const armedLit = await pg.evaluate(() => document.querySelectorAll('#state-cats .bf-unit--lit').length);
    await pg.locator('#fight-state').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d37-armed-${ch}-${size.name}.png`)
    });
    await pg.click(bfSel('cats', 'c3')); await pg.waitForTimeout(250);
    const armedPress = await pg.evaluate(() => ({
      at: (App.state.get().fight.decl.filter((d) => d.by === 'm1')[0] || {}).at,
      popupShut: document.querySelector('#fg-unit').hidden,
      lit: document.querySelectorAll('#state-cats .bf-unit--lit').length
    }));
    ok(`${tag}: 26e. AT REST A CENTRE CLICK ON A UNIT OPENS ITS POPUP; ARMED, THE WHOLE BATTLEFIELD IS STILL THE RETARGET FLOW'S — D-37's own parenthesis, driven from both sides. "Clicking a unit on the battlefield (AT REST — a half-made retarget still owns the battlefield) opens a popup for THAT unit." So at rest the shape opens the popup on ITSELF and declares nothing, and the box's own text-labelled Close shuts it. ARMED, the opposing roster lights and the press below lands at the CENTRE of a lit shape — the exact pixel Playwright's click found under D-36 and the exact pixel a student aims at — and it MOVES THE TARGET, puts the lights out, and DOES NOT OPEN THE POPUP. D-36 needed the separation to be in time AND in space because a reading was nested inside the control; D-37 deletes the nesting, so time is all that is left and this cell is what says it is enough`,
      atRest.lit === 0 && restShape.shut === false && restShape.unit === 'c2'
      && restShape.side === 'cats' && d37AfterClose.shut === true
      && armedLit === 9 && armedPress.at === 'c3' && armedPress.popupShut === true
      && armedPress.lit === 0,
      { atRest, restShape, d37AfterClose, armedLit, armedPress, mechAct });

    // ── 26f. THE RULING REACHES THE LEDGER, AND A SIDE-SCOPE ONE NAMES THE FACTION. ───────
    // TURNED only in HOW the three rulings are made: two of them now go through the popup,
    // because that is where a unit's numbers live. What is asserted about the ledger is
    // unchanged, which is the point — D-37 moved a control and not a record.
    for (const [openSel, pressSel] of [
      [bfSel('cats', 'c1'), stepSel('cats', 'c1', 'hp', 'less')],
      [bfSel('cats', 'c1'), stepSel('cats', 'c1', d36.tok, 'less')]
    ]) {
      await pg.click(openSel); await pg.waitForTimeout(220);
      await pg.click(pressSel); await pg.waitForTimeout(200);
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
    }
    await pg.click(resSel('cats', '', 'ap')); await pg.waitForTimeout(200);
    await pg.click('#fg-nudge-less'); await pg.waitForTimeout(200);
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
    const beforeAdvance = await pg.evaluate(() => (App.state.get().fight.hand || []).length);
    await pg.click('[data-k="fg/advance"]');
    await pg.waitForTimeout(400);
    const ledger = await pg.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#ledger .ld-fact'));
      return {
        n: rows.length,
        // The reading is SYMBOLIC under D-29, so the words live on the tooltip that [S06.12]
        // writes from the same call — read there rather than off a nearly-empty text node.
        said: rows.map((r) => {
          const sym = r.querySelector('.sym');
          return (r.textContent || '').trim() + '|' + (sym ? sym.getAttribute('title') : '');
        }),
        sub: Array.from(document.querySelectorAll('#ledger .ld-sub')).map((n) => n.textContent),
      };
    });
    // The board tab's by-hand marker, on a TALLY row — the widening D-36 made to a list whose
    // own comment said a tally could never carry one. Read on the BOARD, through the real view
    // control, and read on a ruling made in the CURRENT round: advanceRound moved the round's
    // list into `past` above, so a fresh ruling is made here for the marker to answer about —
    // and it is made THROUGH THE POPUP, which is D-37's path to the same record.
    await pg.click(bfSel('cats', 'c1')); await pg.waitForTimeout(220);
    await pg.click(stepSel('cats', 'c1', d36.tok, 'less')); await pg.waitForTimeout(250);
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
    await pg.click('#view-build'); await pg.waitForTimeout(300);
    const d36Marks = await pg.evaluate(() =>
      Array.from(document.querySelectorAll('#board .dc-hand'))
        .filter((n) => n.hidden === false)
        .map((n) => n.dataset.dcUnit + '/' + n.dataset.dcHand));
    await pg.click('#view-fight'); await pg.waitForTimeout(200);
    note(ch, size.name, 'D-37 by-hand lines in the ledger', String(ledger.n));
    ok(`${tag}: 26f. EVERY RULING MADE THROUGH EITHER CONTROL IS IN THE ROUND'S OWN RECORD AND THE LEDGER READS IT BACK — FIGHT-07 and FIGHT-08's machinery, which plan 05-10 listed as controls-missing. D-37 MOVED A CONTROL AND NOT A RECORD, which is what this cell is for: two of the three rulings below are now made in the popup and one on a team resource, and the reading the ledger gives is unchanged. The advanced round's "Set by hand this round" list holds one line per press, drawn in D-29's symbols with the words on the tooltip, and the POOL's line names the FACTION where the others name a unit — a pool belongs to the column it is drawn in and to no unit, so the record carries a null there and [S06.8] has the arm that says so rather than printing the word "null" at a student. AND THE BOARD TAB'S BY-HAND MARKER COVERS A TALLY RULED FROM THE POPUP: the marker set is asserted WHOLE and not searched, so exactly ONE mark is showing on the whole board, on the tally ruled in the CURRENT round — the health ruled in the round that just resolved is correctly NOT marked`,
      beforeAdvance === 4 && ledger.n === 4
      && ledger.sub.filter((s) => String(s).indexOf('Set by hand') === 0).length === 1
      && ledger.said.filter((s) => s.indexOf('Cats ') === 0).length === 2
      && ledger.said.filter((s) => s.indexOf(born.c1 + ' ') === 0).length === 2
      && ledger.said.some((s) => s.indexOf('Action points set by hand, 3 to 2.') !== -1)
      && ledger.said.some((s) => s.indexOf('Health set by hand, 4 to 3.') !== -1)
      && ledger.said.some((s) => s.indexOf('Chill set by hand, 2 to 1.') !== -1)
      && d36Marks.length === 1 && d36Marks[0] === 'c1/' + d36.tok,
      { beforeAdvance, ledger, d36Marks });

    // ── 26g. WHAT THE POPUP HOLDS, AND WHERE IT SITS — INCLUDING AT THE EDGES. ───────────
    // D-37: the popup shows "every value associated with it: health, shield, every status
    // tally INCLUDING THE ZERO-HIDDEN ONES, and the dead marker". The zero case is deferred
    // item 18, and it is the reason this cell drives the shield to nothing FIRST: at zero,
    // [S06.11]'s hide pass takes the shield's line off the battlefield entirely, and under
    // D-36 that value stopped being reachable at all.
    await pg.evaluate(() => {
      App.ops.dispatch('setFightShield', { side: 'cats', unitId: 'c1', value: 0 });
      App.state.invalidate(); if (App.render.flush) App.render.flush();
    });
    await pg.waitForTimeout(200);
    const bfHidden = await pg.evaluate(() => {
      const line = document.querySelector('#state-cats [data-fg="bf"][data-fg-val="c1"] .bf-line[data-bf-amt="shield"]');
      return line === null ? null : { hidden: line.hidden, box: line.getBoundingClientRect().height };
    });
    await pg.click(bfSel('cats', 'c1')); await pg.waitForTimeout(250);
    const held = await popup();
    await pg.click(stepSel('cats', 'c1', 'shield', 'more')); await pg.waitForTimeout(250);
    const zeroRuled = await pg.evaluate(() => ({
      shield: App.state.get().fight.cats.units[0].shield,
      said: document.querySelector('#fg-unit .fgu-row[data-fgu-tok="shield"] .sym').getAttribute('title'),
      rec: (App.state.get().fight.hand || []).slice(-1)[0]
    }));
    // THE DEAD MARKER, AND ITS THREE CHANNELS — [S06.9]'s own two words, read off the page
    // rather than spelled here so a cell that agreed with a hard-coded copy while the artifact
    // said something else cannot exist.
    const deadRead = () => pg.evaluate(() => {
      const b = document.querySelector('#fg-unit [data-fg="ualive"]');
      return {
        pressed: b.getAttribute('aria-pressed'),
        on: b.className.indexOf('fgu-alive--on') !== -1,
        word: b.querySelector('.fgu-alive-t').textContent,
        tick: getComputedStyle(b.querySelector('.dc-check')).visibility,
        said: document.querySelector('#fg-unit .fgu-row[data-fgu-tok="dead"] .sym').getAttribute('title'),
        alive: App.state.get().fight.cats.units[0].alive,
        standing: App.state.get().fight.cats.units.filter((u) => u.alive).length
      };
    });
    const standing = await deadRead();
    await pg.click('#fg-unit [data-fg="ualive"]'); await pg.waitForTimeout(250);
    const marked = await deadRead();
    await pg.click('#fg-unit [data-fg="ualive"]'); await pg.waitForTimeout(250);
    const unmarked = await deadRead();
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
    // THE EDGES. The leftmost cat and the rightmost mech, which are the two shapes whose
    // popup has the least room beside it — a box that opened half off screen would be a
    // control a student cannot finish using, and there is no stylesheet answer to it.
    const edges = {};
    for (const [label, sel] of [
      ['leftmost cat', bfSel('cats', 'c1')],
      ['rightmost mech', bfSel('mechs', 'm3')]
    ]) {
      await pg.click(sel); await pg.waitForTimeout(250);
      const p = await popup();
      const near = await pg.evaluate((s) => {
        const a = document.querySelector(s).getBoundingClientRect();
        const b = document.querySelector('#fg-unit').getBoundingClientRect();
        // "positioning near the unit" — measured. Vertically it is below the shape or above
        // it, within the 6px gap plus a little; horizontally it is clamped into the viewport,
        // so at an edge it may not line up with the shape's left at all AND THAT IS THE
        // REQUIREMENT: on screen wins over aligned.
        return {
          gap: Math.round(Math.min(Math.abs(b.top - a.bottom), Math.abs(a.top - b.bottom))),
          dx: Math.round(b.left - a.left)
        };
      }, sel);
      edges[label] = Object.assign({ near }, p);
      await pg.screenshot({
        path: path.join(process.env.SHOT_DIR || tmpdir(),
          `d37-edge-${label.split(' ')[0]}-${ch}-${size.name}.png`)
      });
      await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
    }
    note(ch, size.name, 'D-37 the popup rows', held.rows.map((r) => r.tok + ':' + r.toks).join(' '));
    ok(`${tag}: 26g. THE POPUP HOLDS EVERY VALUE THE UNIT HAS — INCLUDING ONE AT ZERO THE BATTLEFIELD NO LONGER DRAWS — AND IT STAYS ON SCREEN AT BOTH EDGES. DEFERRED ITEM 18 IS CLOSED HERE AND THE MEASUREMENT IS BOTH HALVES: the shield is driven to ZERO, its line on the battlefield is confirmed HIDDEN WITH ZERO HEIGHT by real layout — which is exactly why it stopped being reachable under D-36 — and the popup still draws it, still says zero in D-21's own count form, and its + still writes a real ruling into the round's record. EVERY ROW IS A REAL D-29 SYMBOL with the prose on a tooltip equal to its accessible name and the student's fragment declared on data-tsay, and the type the STUDENT invented appears with the name they gave it. THE DEAD TOGGLE STATES WHAT IS AND WHAT IT DOES — D-33 P3-2's ruling: the ACT when unpressed, the STATE when pressed, with aria-pressed, the class, the word and a REAL TICK whose computed visibility is read, all moving together, and the marker's own symbol with them. NOTHING IN THE BOX IS EVER DISABLED. AND THE PLACEMENT AT THE EDGES: the leftmost cat and the rightmost mech both open a popup that is WHOLLY ON SCREEN and beside its own unit — on screen wins over aligned, which is what the clamp is for and what a stylesheet cannot answer`,
      held.shut === false && held.head === born.c1
      && held.rows.map((r) => r.tok).join(',') === ['hp', 'shield', d36.tok, 'dead'].join(',')
      && held.rows.every((r) => r.said !== null && r.said === r.aria && r.tsay !== ''
        && r.toks > 0)
      && held.rows.filter((r) => r.steps === 2).length === 3
      && held.rows.filter((r) => r.alive).length === 1
      && held.disabled === 0 && held.onScreen === true && /fgu/.test(held.topmost)
      && bfHidden !== null && bfHidden.hidden === true && bfHidden.box === 0
      && held.rows[1].said === born.c1 + ' Shield, 0.'
      && held.rows[2].lbl === 'Chill'
      && zeroRuled.shield === 1 && zeroRuled.said === born.c1 + ' Shield, 1.'
      && zeroRuled.rec.tok === 'shield' && zeroRuled.rec.unit === 'c1'
      && standing.pressed === 'false' && standing.word === 'Mark dead'
      && standing.tick === 'hidden' && standing.alive === true
      && standing.said === born.c1 + ' Dead marker, 0.'
      && marked.pressed === 'true' && marked.on === true
      && marked.word === 'Marked dead' && marked.tick === 'visible'
      && marked.alive === false && marked.said === born.c1 + ' Dead marker, 1.'
      && marked.standing === 8
      && unmarked.pressed === 'false' && unmarked.word === 'Mark dead'
      && unmarked.alive === true && unmarked.standing === 9
      && ['leftmost cat', 'rightmost mech'].every((k) => edges[k].shut === false
        && edges[k].onScreen === true && edges[k].near.gap <= 24),
      { held, bfHidden, zeroRuled, standing, marked, unmarked, edges });

    // ── 26h. THE POPUP'S KEYBOARD ROUND TRIP, END TO END, WITH A REAL TAB. ───────────────
    // DEFERRED ITEM 17 IS CLOSED BY THIS CELL. D-36 wrote down that a unit's numbers had no
    // keyboard route from the fight tab at all, because a battlefield reading is a div inside
    // the shape's own <button> and that content model allows neither an interactive descendant
    // nor a tabindex one. The popup's rows are real buttons in a plain container, so the trip
    // is ordinary focus — and unlike 26d, THE TAB IS DRIVEN rather than stood in for, because
    // the claim being made is about tab ORDER and not only about focus placement.
    await pg.evaluate(() => document.querySelector('#state-cats [data-fg="bf"][data-fg-val="c4"]').focus());
    await pg.waitForTimeout(120);
    const onShape = await pg.evaluate(() => ({
      k: document.activeElement.dataset.k || '',
      tag: document.activeElement.tagName
    }));
    await pg.keyboard.press('Enter'); await pg.waitForTimeout(280);
    const kbOpen = await popup();
    const hpBefore = await pg.evaluate(() => App.state.get().fight.cats.units[3].hp);
    await pg.keyboard.press('Enter'); await pg.waitForTimeout(250);
    const afterEnter = await pg.evaluate(() => App.state.get().fight.cats.units[3].hp);
    // THE ARROWS, on the same button: the KEY decides the sign and the button does not.
    await pg.keyboard.press('ArrowUp'); await pg.waitForTimeout(250);
    const afterUp = await pg.evaluate(() => App.state.get().fight.cats.units[3].hp);
    await pg.keyboard.press('ArrowDown'); await pg.waitForTimeout(250);
    const afterDown = await pg.evaluate(() => App.state.get().fight.cats.units[3].hp);
    // A REAL TAB THROUGH THE VALUES. Three presses walk +, then the next row's − and +, which
    // is what says the rows are in the tab order in the order they are drawn.
    const walk = [];
    for (let i = 0; i < 3; i++) {
      await pg.keyboard.press('Tab'); await pg.waitForTimeout(120);
      walk.push(await pg.evaluate(() => document.activeElement.dataset.k || document.activeElement.id || ''));
    }
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(280);
    const kbBack = await pg.evaluate(() => ({
      shut: document.querySelector('#fg-unit').hidden,
      rows: document.querySelectorAll('#fg-unit .fgu-row').length,
      focusK: document.activeElement ? (document.activeElement.dataset.k || '') : ''
    }));
    note(ch, size.name, 'D-37 the tab walk', walk.join(' '));
    ok(`${tag}: 26h. THE POPUP IS A TRUE KEYBOARD SURFACE, AND THE TAB IS DRIVEN RATHER THAN STOOD IN FOR. DEFERRED ITEM 17 IS CLOSED HERE: D-36 recorded that a unit's numbers had NO keyboard route from the fight tab at all, and the reason was a content model rather than a choice — a battlefield reading is a div inside the shape's own <button>. D-37's rows are real buttons in a plain container. So the whole trip is ordinary focus and every step is a real key press: the keyboard is on the SHAPE and the shape is a BUTTON, Enter opens the popup AND PUTS THE KEYBOARD INTO IT rather than at the end of #fightbar, Enter on the − writes a real ruling, ArrowUp raises and ArrowDown lowers ON THE SAME BUTTON because the KEY decides the sign, three real Tabs walk the values in the order they are drawn, and Escape shuts the box, EMPTIES IT and HANDS THE FOCUS BACK TO THE SHAPE. A control the keyboard can enter and not leave is a trap, and the last clause is what says this is not one`,
      onShape.k === 'fg/bf/cats/c4' && onShape.tag === 'BUTTON'
      && kbOpen.shut === false && kbOpen.unit === 'c4'
      && kbOpen.focus === 'fg/u/cats/c4/hp/less'
      && hpBefore === 3 && afterEnter === 2 && afterUp === 3 && afterDown === 2
      && walk[0] === 'fg/u/cats/c4/hp/more'
      && walk[1] === 'fg/u/cats/c4/shield/less'
      && walk[2] === 'fg/u/cats/c4/shield/more'
      && kbBack.shut === true && kbBack.rows === 0
      && kbBack.focusK === 'fg/bf/cats/c4',
      { onShape, kbOpen, hpBefore, afterEnter, afterUp, afterDown, walk, kbBack });

    // ── 26i. D-39 P1-4. WHERE THE BOX LANDS, ON EVERY UNIT, AND ON THE SCROLL POSITION
    //        THE AUDIT'S OWN MEASUREMENT WAS TAKEN AT. ──────────────────────────────────
    // The audit read the placement of all twelve and reported "never placed below a unit,
    // never flipped, never clamped". Two of those three are wrong and the measurement that
    // corrects them is in this cell: the box IS placed below when there is room (the mechs at
    // 1920 take that arm on the shipped board) and it IS clamped. What the audit found and
    // did not name is what the CLAMP did when neither side had room — Math.max(8, ...) pulled
    // the box back down ONTO the shape whose numbers it was showing, which is the one thing
    // [C14.7]'s own banner says this must never do.
    //
    // TWO PASSES, AND THE SECOND IS THE ONE THAT USED TO FAIL. The first walks every shape at
    // the resting scroll position. The second scrolls the PAGE so one shape sits 300px and
    // then 400px down the viewport — a student's own scroll, and the exact positions at which
    // the shipped arithmetic measured 8→475 over a shape at 300→365. Nothing here presses a
    // control that is off screen: each shape is brought into view first, which is what a
    // student's own scroll does before their finger arrives.
    const d39Geom = async (side, unit) => pg.evaluate(([s, u]) => {
      const a = document.querySelector('[data-fg="bf"][data-fg-side="' + s + '"][data-fg-val="' + u + '"]');
      const box = document.getElementById('fg-unit');
      if (!a || !box || box.hidden) { return null; }
      const br = box.getBoundingClientRect(), ar = a.getBoundingClientRect();
      const hits = (r) => !(br.right <= r.left || br.left >= r.right
        || br.bottom <= r.top || br.top >= r.bottom);
      const alive = box.querySelector('.fgu-alive');
      const arr = alive ? alive.getBoundingClientRect() : null;
      const shapes = Array.from(document.querySelectorAll('[data-fg="bf"]'));
      return {
        head: (document.getElementById('fg-unit-head').textContent || '').trim(),
        inView: br.top >= 0 && br.left >= 0
          && br.bottom <= innerHeight && br.right <= innerWidth,
        coversAnchor: hits(ar),
        below: br.top >= ar.bottom - 1,
        // THE AUDIT'S OWN DISTINCTION, ASSERTED RATHER THAN ASSUMED. It measured
        // the "Mark dead" row 81px below the fold and said why that was fatal:
        // "#fg-unit-rows does not scroll to compensate because its own
        // clientHeight === scrollHeight — the overflow is the PAGE's, not the
        // container's." A page-overflowing fixed box has nothing that can bring
        // the row back. So the clause is not "the control is on screen at rest"
        // — the bound makes the list scroll on purpose, which is what [C14.7]
        // built it for — it is that the overflow BELONGS TO A CONTAINER THAT
        // SCROLLS and one scroll of it brings the control wholly into view,
        // inside the list's own box and inside the window.
        markAtRest: arr !== null && arr.top >= 0 && arr.bottom <= innerHeight,
        markReachable: (function () {
          if (alive === null) { return false; }
          const rr = document.getElementById('fg-unit-rows');
          const was = rr.scrollTop;
          rr.scrollTop = rr.scrollHeight;
          const r2 = alive.getBoundingClientRect();
          const lr = rr.getBoundingClientRect();
          const ok = r2.top >= 0 && r2.bottom <= innerHeight
            && r2.top >= lr.top - 1 && r2.bottom <= lr.bottom + 1;
          rr.scrollTop = was;
          return ok;
        })(),
        bounded: box.style.getPropertyValue('--fgu-h') !== '',
        rowsScroll: (function () {
          const rr = document.getElementById('fg-unit-rows');
          return rr.scrollHeight > rr.clientHeight;
        })(),
        marked: shapes.filter((n) => n.classList.contains('bf-unit--open'))
          .map((n) => n.dataset.fgSide + '/' + n.dataset.fgVal),
        expanded: shapes.filter((n) => n.getAttribute('aria-expanded') === 'true')
          .map((n) => n.dataset.fgSide + '/' + n.dataset.fgVal),
        unset: shapes.filter((n) => n.getAttribute('aria-expanded') === null).length
      };
    }, [side, unit]);

    const d39Shapes = await pg.evaluate(() => Array.from(
      document.querySelectorAll('[data-fg="bf"]')
    ).map((n) => [n.dataset.fgSide, n.dataset.fgVal]));
    const d39Walk = [];
    for (const [side, unit] of d39Shapes) {
      const sel = `[data-fg="bf"][data-fg-side="${side}"][data-fg-val="${unit}"]`;
      const node = await pg.$(sel);
      if (node === null) { d39Walk.push({ side, unit, missing: true }); continue; }
      await node.scrollIntoViewIfNeeded();
      await pg.waitForTimeout(120);
      await node.click();
      await pg.waitForTimeout(220);
      const g = await d39Geom(side, unit);
      d39Walk.push(Object.assign({ side, unit }, g || { missing: true }));
      // Conditional, for the reason PROBE DL wrote down: a cleanup step that assumes the
      // state the cell is testing for can take the whole run down with a TimeoutError
      // instead of reporting a red cell.
      const close = await pg.$('#fg-unit .fgu-close');
      if (close !== null) { await close.click(); await pg.waitForTimeout(140); }
    }

    // THE SCROLL POSITIONS, AND THEY ARE FRACTIONS OF THE WINDOW RATHER THAN PIXELS so the
    // same three drives exercise the same three cases in a 768-tall column and a 1080-tall
    // one. High in the window there is room BELOW and the box takes it; low in the window
    // there is not and it flips ABOVE; the middle is where the shipped arithmetic had neither
    // and resolved it by covering the shape. Driven on the first cat, which is the shape the
    // D-39c measurement was taken on.
    const d39Scrolled = [];
    for (const frac of [0.28, 0.45, 0.80]) {
      const put = await pg.evaluate((f) => {
        const n = document.querySelector('[data-fg="bf"][data-fg-side="cats"][data-fg-val="c1"]');
        if (!n) { return false; }
        scrollBy(0, Math.round(n.getBoundingClientRect().top - Math.round(innerHeight * f)));
        return true;
      }, frac);
      const want = frac;
      if (!put) { d39Scrolled.push({ want, missing: true }); continue; }
      await pg.waitForTimeout(200);
      const vis = await pg.evaluate(() => {
        const r = document.querySelector('[data-fg="bf"][data-fg-side="cats"][data-fg-val="c1"]')
          .getBoundingClientRect();
        return { top: Math.round(r.top), on: r.top >= 0 && r.bottom <= innerHeight };
      });
      if (!vis.on) { d39Scrolled.push({ want, offScreen: vis }); continue; }
      await pg.evaluate(() => {
        const n = document.querySelector('[data-fg="bf"][data-fg-side="cats"][data-fg-val="c1"]');
        const r = n.getBoundingClientRect();
        n.dispatchEvent(new MouseEvent('click', { bubbles: true,
          clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }));
      });
      await pg.waitForTimeout(240);
      d39Scrolled.push(Object.assign({ want, shapeTop: vis.top },
        await d39Geom('cats', 'c1') || { missing: true }));
      const close2 = await pg.$('#fg-unit .fgu-close');
      if (close2 !== null) { await close2.click(); await pg.waitForTimeout(140); }
    }
    await pg.evaluate(() => scrollTo(0, 0));
    await pg.waitForTimeout(200);

    const d39All = d39Walk.concat(d39Scrolled);
    const d39ScrolledBelow = d39Scrolled.filter((g) => g.below === true).length;
    const d39ScrolledAbove = d39Scrolled.filter((g) => g.below === false).length;
    const d39Bad = d39All.filter((g) => g.missing === true || g.offScreen
      || g.inView !== true || g.coversAnchor !== false || g.markReachable !== true
      || g.marked.length !== 1 || g.expanded.length !== 1
      || g.marked[0] !== (g.side || 'cats') + '/' + (g.unit || 'c1')
      || g.expanded[0] !== g.marked[0] || g.unset !== 0);
    const d39Below = d39Walk.filter((g) => g.below === true).length;
    note(ch, size.name, 'D-39 P1-4 popups placed below', String(d39Below)
      + ' of ' + d39Walk.length + ' at rest, ' + d39ScrolledBelow + ' of '
      + d39Scrolled.length + ' scrolled');
    ok(`${tag}: 26i. D-39 P1-4 — THE POPUP IS WHOLLY ON SCREEN AND NEVER ON THE SHAPE IT IS ABOUT, FOR EVERY UNIT AND AT THE SCROLL POSITION WHERE THAT USED TO BE FALSE. The audit read all twelve and reported "never placed below a unit, never flipped, never clamped". All three are wrong and this cell is the correction: it IS clamped, it IS flipped, and it IS placed below when there is room. The resting battlefield sits low enough at both sizes that the below arm is taken 0 of 12 times there — which is what the audit saw and read as an absence of the rule rather than as the rule choosing — so BOTH ARMS ARE DRIVEN DIRECTLY at three scroll positions expressed as fractions of the window, and each must be reached at least once. What the audit measured and did not name is what the clamp DID when neither side of a shape had room for a 467-tall box: Math.max(8, r.top - h - 6) pulled it back down ONTO the shape whose numbers it was showing. Reproduced before the fix at 1366x768 with one student-authored unit type, the page scrolled so Cat 1 sat 300px down: shape 300-365, popup 8-475, covering its own shape and eight others. [C14.7]'s own banner calls that the one thing this must never do. So the room is measured first and the box is BOUNDED to it, and the row list — which already scrolls on itself — is what gives. FOUR CLAUSES PER UNIT, and none of them is a pixel budget: the box is wholly inside the viewport, it does not intersect its own shape, the "Mark dead" row at the foot of the box is REACHABLE — and that clause is the audit's own distinction rather than a softening of it: the audit measured that row 81px below the fold and said why it was fatal, "#fg-unit-rows does not scroll to compensate because its own clientHeight === scrollHeight, the overflow is the PAGE's, not the container's". A fixed box overflowing the page has nothing that can bring it back. The bound moves that overflow into the list [C14.7] gave a scroll for, so what is asserted is that one scroll of THAT container puts the control wholly inside both its own box and the window, and the mark says which shape it is about on both channels with EXACTLY ONE shape wearing it. THE TWO SCROLLED DRIVES ARE THE CELL: they are the positions at which the shipped arithmetic failed, and they are pressed at the shape's real centre after a real page scroll. AND D-37'S ONE DELIBERATE TRADE IS KEPT — a box hard against the top of the viewport may still cover #topbar, which is z-index 20 and drawn under it; [C14.7] reasoned that on a picture and this cell does not re-decide it`,
      d39Bad.length === 0 && d39Walk.length === 12 && d39Scrolled.length === 3
      && d39ScrolledBelow >= 1 && d39ScrolledAbove >= 1,
      { bad: d39Bad.slice(0, 3), below: d39Below,
        scrolledBelow: d39ScrolledBelow, scrolledAbove: d39ScrolledAbove,
        walked: d39Walk.length,
        scrolled: d39Scrolled.map((s) => ({ want: s.want, shapeTop: s.shapeTop,
          coversAnchor: s.coversAnchor, inView: s.inView, bounded: s.bounded,
          rowsScroll: s.rowsScroll })) });

    /* -- 26j. D-39 P2-8 AND P2-9 -- THE POPUP'S ROWS SHOW A FIGURE, ALL
       FOUR READ DOWN AS ONE SHAPE, AND THE BOUND IS AN ANSWER TO A PRESS.
       Plan 05-D39d.
       ==================================================================
       P2-8: "#fg-unit's rows render label - [tokens] + with NO numeral,
       while #fg-nudge -- D-36's control, same tab, same nudge idiom, 200px
       away -- renders - 3 +, and the board's .stp-field renders 3. Three
       stepper presentations in one artifact, and the newest is the only
       one without a figure." And its second half: the dead row had a
       different grammar from the three above it, 92px against 46, because
       its toggle spanned every column those rows use for their pair.

       P2-9: measured ON OPEN, before anything was pressed, the Shield row
       already read the bound sentence -- about a default pair the student
       never authored -- and after two presses at the floor it read under
       TWO rows at once, 120px of a 440px box.

       WHAT IS DRIVEN HERE, in this order, through shipped controls only:
       the box is opened on a shape; every value row must carry a figure
       that EQUALS the model's own number for that value, so a decorative
       digit cannot pass; the four rows' + column must read straight down,
       which is the dead row's grammar clause and is asserted as a single x
       for all of them; the box must not overflow its own width, which is
       the clause a first draft of the fix failed -- the fifth column
       pushed the row past the shipped 320px box, a horizontal scrollbar
       appeared and the + was cut off its right edge, at both viewports,
       and .fgu-val's minimum came 96 to 64 to answer it; the bound line
       must be silent at rest EVEN ON A ROW SITTING ON A BOUND; a press
       that MOVES the number must leave it silent, because arriving at a
       bound is not being refused by one; and only the press the bound
       actually refuses may say anything.

       THE FIGURE IS COMPARED TO THE MODEL AND NOT TO A NUMBER TYPED HERE,
       which is this file's standing rule about readings. */
    await pg.evaluate(() => {
      const shape = document.querySelector('#fightbar [data-fg="bf"]');
      if (shape) { shape.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); }
    });
    await pg.waitForTimeout(300);
    const popRead = () => pg.evaluate(() => {
      const box = document.querySelector('#fg-unit');
      const rows = document.querySelector('#fg-unit-rows');
      if (!box || box.hidden || !rows) { return null; }
      const side = box.dataset.fgSide || '';
      const unitId = box.dataset.fgUnit || '';
      const st = App.state.get();
      const unit = (st.fight && st.fight[side])
        ? st.fight[side].units.filter((u) => u.id === unitId)[0] : null;
      const modelOf = (tok) => {
        if (!unit) { return null; }
        if (tok === 'hp') { return unit.hp; }
        if (tok === 'shield') { return unit.shield; }
        if (tok === 'dead') { return unit.alive ? 0 : 1; }
        return (unit.tally && unit.tally[tok]) ? unit.tally[tok] : 0;
      };
      const all = Array.from(rows.querySelectorAll('.fgu-row'));
      return {
        unit: unitId,
        rows: all.map((r) => {
          const tok = r.dataset.fguTok || '';
          const num = r.querySelector('.fgu-num');
          const plus = Array.from(r.querySelectorAll('.fgu-btn'))
            .filter((btVal) => btVal.dataset.fgStep === '1')[0];
          const alive = r.querySelector('.fgu-alive');
          const last = plus || alive;
          const says = r.querySelector('.fgu-says');
          return {
            tok,
            figure: num ? num.textContent : null,
            model: String(modelOf(tok)),
            lastX: last ? Math.round(last.getBoundingClientRect().right) : null,
            says: says ? (says.hidden ? '' : says.textContent) : ''
          };
        }),
        overflows: rows.scrollWidth > rows.clientWidth + 1,
        boxH: Math.round(box.getBoundingClientRect().height)
      };
    });
    const popStep = (tok, dir) => pg.evaluate((arg) => {
      const r = document.querySelector('#fg-unit .fgu-row[data-fgu-tok="' + arg.tok + '"]');
      if (!r) { return; }
      const btn = Array.from(r.querySelectorAll('.fgu-btn'))
        .filter((b2) => b2.dataset.fgStep === arg.dir)[0];
      if (btn) { btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); }
    }, { tok, dir });
    const popRest = await popRead();
    // Health down to its floor, one press at a time. Every one of these MOVES
    // the number, so every one must leave the bound line silent.
    let popMoved = null;
    if (popRest) {
      for (let i = 0; i < 6; i++) {
        const before = await popRead();
        const hpRow = before.rows.filter((r) => r.tok === 'hp')[0];
        if (!hpRow || hpRow.figure === '0') { break; }
        await popStep('hp', '-1');
        await pg.waitForTimeout(160);
        popMoved = await popRead();
      }
    }
    // And the press the bound refuses.
    await popStep('hp', '-1');
    await pg.waitForTimeout(200);
    const popRefused = await popRead();
    const saysOf = (snap, tok) => {
      if (!snap) { return null; }
      const r = snap.rows.filter((x) => x.tok === tok)[0];
      return r ? r.says : null;
    };
    const popValueRows = popRest ? popRest.rows.filter((r) => r.tok !== 'dead') : [];
    const popLastXs = popRest
      ? popRest.rows.map((r) => r.lastX).filter((x) => x !== null) : [];
    note(ch, size.name, 'D-39 P2-8 every row: figure / model',
      popValueRows.map((r) => `${r.tok} ${r.figure}/${r.model}`).join(' '));
    note(ch, size.name, 'D-39 P2-8 the last column reads down / no overflow / box',
      `${JSON.stringify(Array.from(new Set(popLastXs)))} / `
      + `${popRest ? !popRest.overflows : '?'} / ${popRest ? popRest.boxH : '?'}px`);
    note(ch, size.name, 'D-39 P2-9 the bound line: at rest / moved to it / refused by it',
      `"${popRest ? popRest.rows.map((r) => r.says).join('') : '?'}"`
      + ` / "${saysOf(popMoved, 'hp')}" / "${String(saysOf(popRefused, 'hp')).slice(0, 30)}"`);
    ok(`${tag}: 26j. D-39 P2-8 AND P2-9 -- EVERY POPUP ROW SHOWS THE FIGURE, ALL FOUR ROWS END IN ONE COLUMN, AND THE BOUND IS AN ANSWER TO A PRESS RATHER THAN A STANDING NOTICE. P2-8 measured three stepper presentations in one artifact and this box as the only one without a number: it drew label - [tokens] + while D-36's nudge 200px away on the same tab drew - 3 + and the board's own field drew 3, so a student ruling health from 3 to 2 here watched a token disappear and never saw a figure. The figure is between the minus and the plus now, where the nudge puts its own, with the tokens beside it rather than instead of it -- and it is COMPARED TO THE MODEL row by row, so a decorative digit cannot pass. P2-8's second half is the dead row, which spanned every column the pairs use and took a line of its own at 92px against 46; it sits in the last column now, which is asserted as ONE x shared by all four rows. THE OVERFLOW CLAUSE IS THE ONE A FIRST DRAFT FAILED: the fifth column pushed the row past the shipped 320px box, a horizontal scrollbar came up under it and the + was cut off its right edge at both viewports, so .fgu-val's minimum came 96 to 64 and the box came down from 286px to 271px. P2-9 IS DRIVEN AS THE DISTINCTION IT IS: at rest, on a box whose shield is sitting exactly on its floor, every row is SILENT -- the audit photographed that sentence up before anything was pressed, about a default pair the student never authored; each press that MOVES health toward its floor leaves it silent, because arriving at a bound is not being refused by one; and only the press the bound actually refuses says anything. The end that refused is named by the row rather than by a second sentence, which is what the figure in the same commit paid for: "between 0 and 4" standing beside a visible 0`,
      popRest !== null && popRefused !== null
      && popValueRows.length >= 2
      && popValueRows.every((r) => r.figure !== null && r.figure === r.model)
      && popRest.rows.filter((r) => r.tok === 'dead').length === 1
      && popRest.rows.filter((r) => r.tok === 'dead')[0].figure === null
      && Array.from(new Set(popLastXs)).length === 1
      && popRest.overflows === false
      && popRest.rows.every((r) => r.says === '')
      && (popMoved === null || saysOf(popMoved, 'hp') === '')
      && String(saysOf(popRefused, 'hp')).indexOf('keeps this number between') !== -1,
      { popRest, popMoved, popRefused });

    await endFight(pg);
    await pg.evaluate(() => {
      App.ops.resetToDefaults();
      App.state.invalidate({ structural: true });
      if (App.render.flush) App.render.flush();
    });
    await pg.waitForTimeout(200);

    /* ── 30 / 30b / 30c. D-40 — THE POOL DEPLETION PREVIEW, DRIVEN BY REAL CLICKS.
       ==================================================================
       "Make it so you can preview the depletion of action points while setting up
       actions." Node rows 123 and 123b drive the same surface against a stub with no
       layout engine and no computed style, so what they CANNOT see is the whole of why
       these cells exist: whether a three-part reading plus a sentence fits on a line at
       1366, whether the removal mark lands on the shape rather than beside it, and
       whether the short sentence's colour is DERIVED from the palette or was typed.
       That last one is PROBE BM's finding on a third surface — a typed colour is
       pixel-identical to a derived one, and only moving the token can tell them apart. */
    const d40Board = await pg.evaluate(() => {
      App.ops.resetToDefaults();
      const sideTok = App.ops.createTokenType({ name: 'Momentum', scope: 'side', shape: 'circ', color: 'gold', glyph: '' });
      App.ops.setTally('cats', null, sideTok, 5);
      App.state.invalidate({ structural: true });
      if (App.render.flush) App.render.flush();
      return { sideTok, ap: App.state.get().build.cats.ap };
    });
    await pg.waitForTimeout(200);

    // The reader. Everything below is taken through it, so the four columns and the
    // three cells all describe the same nodes in the same words.
    const d40Read = () => pg.evaluate(() => {
      const box = document.querySelector('#act-edit-cost-pool');
      if (!box) { return null; }
      const cs = getComputedStyle(box);
      const rows = [...box.querySelectorAll('.ae-pool-row')].map((r) => {
        const syms = [...r.querySelectorAll('.sym')];
        const say = r.querySelector('.ae-pool-say');
        const sign = r.querySelector('.sym-sign');
        let mark = null;
        if (sign) {
          const shape = sign.parentElement;
          const sr = shape.getBoundingClientRect();
          const gr = sign.getBoundingClientRect();
          mark = {
            onTok: shape.classList.contains('tok'),
            dx: Math.round(((gr.left + gr.width / 2) - sr.left) * 100) / 100,
            dy: Math.round(((gr.top + gr.height / 2) - sr.top) / sr.height * 10000) / 10000,
            color: getComputedStyle(sign).color,
            which: syms.indexOf(sign.closest('.sym'))
          };
        }
        return {
          says: syms.map((s) => s.getAttribute('title')),
          named: syms.every((s) => s.getAttribute('title') === s.getAttribute('aria-label')),
          marks: syms.map((s) => s.querySelectorAll('.sym-sign').length),
          tok: syms.length ? Math.round(parseFloat(getComputedStyle(syms[0]).getPropertyValue('--tok'))) : null,
          arrow: [...r.querySelectorAll('.ae-pool-to')].map((n) => n.textContent).join(''),
          say: say ? say.textContent : '(no sentence)',
          short: say ? say.className.indexOf('ae-pool-say--short') !== -1 : false,
          sayColor: say ? getComputedStyle(say).color : null,
          /* NOT the .ae-pool-row's rectangle. That element is display:contents
             under D-40's alignment fix, so it has no box at all and every
             measurement of it reads zero — which a cell asserting `h > 0`
             would report as a defect and a cell asserting nothing would let
             through. The two things that HAVE boxes are read instead, and
             their left edges are what the fix is about. */
          sayLeft: say ? Math.round(say.getBoundingClientRect().left) : null,
          sayH: say ? Math.round(say.getBoundingClientRect().height) : null,
          readLeft: Math.round(r.querySelector('.ae-pool-read').getBoundingClientRect().left),
          readH: Math.round(r.querySelector('.ae-pool-read').getBoundingClientRect().height)
        };
      });
      return {
        hidden: box.hidden,
        drawn: cs.display !== 'none',
        boxH: Math.round(box.getBoundingClientRect().height),
        overflowsX: box.scrollWidth > box.clientWidth + 1,
        rows,
        // Every switched-off control in the dialog, by name — the never-disable claim.
        off: [...document.querySelectorAll('#act-edit button, #act-edit input')]
          .filter((n) => n.disabled).map((n) => n.dataset.k || n.id).sort().join(',')
      };
    });

    await pg.click('[data-act="openActionEditor"]'); await pg.waitForTimeout(300);
    await pg.click('#act-edit-new'); await pg.waitForTimeout(300);
    const d40Act = await pg.evaluate(() => document.querySelector('#act-edit').dataset.edPick);
    /* A CLAIM CORRECTED BY THE MEASUREMENT RATHER THAN A DRIVE BENT TO FIT IT.
       The first draft of this cell asserted that a brand-new action names no
       pool and the box is not drawn. It measured one row reading three held,
       one taken, two left — and the measurement is RIGHT: a record with no
       `cost` field costs the one action point the board always implied, which
       is actionCostTerms' own shipped default and is written down at that
       function. So a new action DOES name a pool from its first frame, which is
       better behaviour than the draft expected, and the not-drawn state is
       reached the way a student reaches it: by EMPTYING the cost. That is also
       the more interesting arm — an emptied `pays` means "this report has no
       figures for that cost" and never "this costs nothing", so the honest
       drawing of it is nothing at all rather than a row of zeroes. */
    const d40Fresh = await d40Read();
    await pg.click('[data-k="ae/setActionCost/0/tok/"]'); await pg.waitForTimeout(200);
    const d40Empty = await d40Read();

    // Term by term, every one of them a real pointer press on a real box and a real
    // keystroke into a real field. The preview is read after EACH, because "live as
    // cost terms are added" is a claim about the frames in between and not only about
    // the end state.
    const d40Write = async (slot, tok, amount) => {
      await pg.click(`[data-k="ae/setActionCost/${slot}/tok/${tok}"]`); await pg.waitForTimeout(150);
      await pg.fill(`#act-edit-cost-${slot}-amt`, String(amount));
      await pg.press(`#act-edit-cost-${slot}-amt`, 'Enter');
      await pg.waitForTimeout(200);
      return d40Read();
    };
    const d40OneAp = await d40Write(0, 'ap', 2);
    const d40TwoPools = await d40Write(1, d40Board.sideTok, 3);
    const d40Short = await d40Write(2, 'ap', 2);
    const d40WithHp = await d40Write(3, 'hp', 1);

    await pg.locator('#act-edit-pane-author').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d40-cost-pools-${ch}-${size.name}.png`)
    });

    note(ch, size.name, 'D-40 the preview, four terms in',
      d40WithHp.rows.map((r) => `[${r.says.join(' / ')}] ${r.say}`).join('  ||  '));
    const d40SayLefts = [...new Set(d40WithHp.rows.map((r) => r.sayLeft))];
    const d40ReadLefts = [...new Set(d40WithHp.rows.map((r) => r.readLeft))];
    note(ch, size.name, 'D-40 box / reading+sentence heights / overflow',
      `${d40WithHp.boxH}px, readings ${d40WithHp.rows.map((r) => r.readH).join('/')}px,`
      + ` sentences ${d40WithHp.rows.map((r) => r.sayH).join('/')}px, overflow ${d40WithHp.overflowsX}`);
    note(ch, size.name, 'D-40 one column for the answers (was 232 and 252)',
      `readings at ${JSON.stringify(d40ReadLefts)}, sentences at ${JSON.stringify(d40SayLefts)}`);
    note(ch, size.name, 'D-40 marks per reading / --tok / rows as terms land',
      `${d40WithHp.rows.map((r) => r.marks.join('')).join(' ')} / ${d40WithHp.rows[0].tok}px`
      + ` / ${[d40Fresh, d40Empty, d40OneAp, d40TwoPools, d40Short, d40WithHp].map((s) => s.rows.length).join('->')}`);

    ok(`${tag}: 30. D-40 — THE COST REGION PREVIEWS THE DEPLETION, PER POOL, AS THE COST IS TYPED, AND IT IS BUILT TERM BY TERM THROUGH REAL PRESSES. A BRAND-NEW ACTION ALREADY NAMES A POOL and the preview says so from its first frame — a record with no cost field costs the one action point the board always implied, which is actionCostTerms' shipped default; this cell's first draft claimed the opposite and the measurement corrected it. EMPTYING THE COST THROUGH THE CHOOSER'S OWN ENTRY IS WHAT LEAVES THE BOX NOT DRAWN, and nothing is the honest drawing of it: an emptied \`pays\` means "this report has no figures for that cost" and never "this costs nothing", so a row of zeroes would be the surface answering a question it was not asked, and an empty bordered panel under the Cost list would be it claiming a reading it does not have. The first action-point term brings ONE row; a term naming a type the student invented at side scope brings a SECOND, which is D-24 as pixels; a second action-point term brings NO third row and instead SUMS into the first, because a pool has one number and is drawn down once; and a fourth term naming health brings none at all, because health lives on units and picking which one pays would be adjudication. THE READING IS THREE PARTS AND THE MIDDLE ONE WEARS THE MARK: what the side holds, what this action takes, what would be left — and neither of the outer two is a subtraction. Every reading's tooltip EQUALS its accessible name, which is symQty's contract on a fifth surface. AND EVERY POOL ROW'S SENTENCE STARTS AT ONE x, WHICH IS A SCREENSHOT'S FINDING: the first draft of this block was a flex column, it measured 66px over rows of 29 and 22 with no overflow in all four columns, and the picture showed the two answers beginning at 232px and 252px, because each row's sentence started wherever its own run of tokens happened to end. That is D-39 P2-8's "all four rows end in one column" arriving a third time, and no number this repository takes could see it. The reading column is max-content so a single-pool cost pays nothing for the alignment. AND THE ROW DOES NOT OVERFLOW ITS BOX at either viewport, which is the other half of this that a stub with no layout engine cannot see at all`,
      d40Fresh !== null && d40Fresh.rows.length === 1
      && d40Fresh.rows[0].says[1] === 'Removes: 1 Action points when this action is used'
      && d40Empty !== null && d40Empty.drawn === false && d40Empty.rows.length === 0
      && d40OneAp.rows.length === 1 && d40TwoPools.rows.length === 2
      && d40Short.rows.length === 2 && d40WithHp.rows.length === 2
      && d40WithHp.drawn === true
      && d40WithHp.rows[0].says.join(' | ')
        === '3 Action points this side holds | Removes: 4 Action points when this action is used | 0 Action points left to spend'
      && d40WithHp.rows[1].says.join(' | ')
        === '5 Momentum this side holds | Removes: 3 Momentum when this action is used | 2 Momentum left to spend'
      && d40WithHp.rows.every((r) => r.named === true)
      && d40WithHp.rows.every((r) => r.marks.join(',') === '0,1,0')
      && d40WithHp.rows.every((r) => r.arrow === '→')
      && d40WithHp.rows.every((r) => r.tok === 16)
      && d40SayLefts.length === 1 && d40ReadLefts.length === 1
      && d40WithHp.rows.every((r) => r.readH > 0 && r.sayH > 0)
      && d40WithHp.overflowsX === false,
      { d40Fresh, d40Empty, d40OneAp, d40TwoPools, d40Short, d40WithHp });

    /* ── 30b. THE EXCEEDED POOL, THE MARK'S GEOMETRY, AND THE COLOUR THAT HAS TO
       DERIVE. Two action-point terms of two against a pool of three is FOUR out of
       THREE, and the sentence is the affordability machinery's own — the same words
       the proposal pane two panes over writes for the same cost, because both call
       one function. The remainder FLOORS AT NONE rather than drawing minus one,
       because a pool cannot hold less than none of it and advanceRound already takes
       Math.min(want, held); how far past the end the cost reaches is the sentence's
       job and not the picture's. THE TINT IS MOVED AND MUST FOLLOW: --accent-2 is
       re-declared on :root and the sentence's computed colour must change with it,
       which is cell 21d's technique on a third surface and the only way to tell a
       derived colour from a typed one. AND NOTHING IS DISABLED — the never-disable
       rule is in full force on an authoring surface, so the switched-off controls
       are collected by NAME with the cost past the pool. */
    const d40Tinted = await pg.evaluate(() => {
      const el = document.createElement('style');
      el.id = 'd40-tint-probe';
      el.textContent = ':root{--accent-2:#00ff00;--coral:#00ff00}';
      document.head.appendChild(el);
      const say = document.querySelector('.ae-pool-say--short');
      const sign = document.querySelector('#act-edit-cost-pool .sym-sign');
      const out = {
        say: say ? getComputedStyle(say).color : null,
        sign: sign ? getComputedStyle(sign).color : null
      };
      el.remove();
      return out;
    });
    await pg.waitForTimeout(150);
    const d40Geo = await pg.evaluate(() => {
      const sign = document.querySelector('#act-edit-cost-pool .sym-sign');
      if (!sign) { return null; }
      const shape = sign.parentElement;
      const sr = shape.getBoundingClientRect();
      const gr = sign.getBoundingClientRect();
      return {
        onTok: shape.classList.contains('tok'),
        dx: Math.round(((gr.left + gr.width / 2) - sr.left) * 100) / 100,
        dy: Math.round(((gr.top + gr.height / 2) - sr.top) / sr.height * 10000) / 10000,
        color: getComputedStyle(sign).color,
        inPool: document.querySelectorAll('#act-edit-cost-pool .sym-sign').length
      };
    });
    note(ch, size.name, 'D-40 the exceeded pool says',
      `"${d40WithHp.rows[0].say}" tinted ${d40WithHp.rows[0].sayColor}`);
    note(ch, size.name, 'D-40 the tint follows --accent-2',
      `${d40WithHp.rows[0].sayColor} -> ${d40Tinted.say}`);
    note(ch, size.name, 'D-40 the preview mark — dx / dy / colour',
      d40Geo ? `${d40Geo.dx}px, ${d40Geo.dy} down, ${d40Geo.color}` : 'no mark');
    ok(`${tag}: 30b. D-40 — A COST PAST THE POOL SAYS SO IN THE AFFORDABILITY MACHINERY'S OWN WORDS, THE REMAINDER FLOORS AT NONE, THE MARK IS D-30's GEOMETRY EXACTLY, AND THE TINT DERIVES. Four action points out of three: the sentence is "Not enough to spend. Short by 1." — the same string the proposal pane writes for the same cost, because costShortSaid is one function and both panes call it — and the picture floors at no remainder rather than drawing a negative one, because a board cannot hold less than none of a thing and Advance already takes the minimum. The mark sits ON THE SHAPE at 0px from its left edge and a quarter of the way down it, which is D-30's sentence literally and is the same three numbers cells 21b and 23d read on two other surfaces. AND THE COLOUR IS MOVED TO PROVE IT DERIVES: --accent-2 and --coral are re-declared on :root and BOTH the sentence's tint and the mark's colour must follow. PROBE BM measured that a typed colour is pixel-identical to a derived one and passes every scan and every geometry cell, so this is the only check in the repository that can tell them apart on this surface. AND NOT ONE CONTROL IN THE DIALOG IS DISABLED BY A COST THE SIDE CANNOT PAY — the never-disable rule, in full force on an authoring surface`,
      d40WithHp.rows[0].say === 'Not enough to spend. Short by 1.'
      && d40WithHp.rows[0].short === true
      && d40WithHp.rows[0].says[2] === '0 Action points left to spend'
      && d40WithHp.rows[1].short === false
      && d40WithHp.rows[1].say === 'Enough to spend.'
      && d40Geo !== null && d40Geo.onTok === true
      && d40Geo.dx === 0 && d40Geo.dy === 0.25
      && d40Geo.inPool === 2
      && d40Tinted.say !== null && d40Tinted.say !== d40WithHp.rows[0].sayColor
      && d40Tinted.sign !== null && d40Tinted.sign !== d40Geo.color
      && d40WithHp.off === d40Empty.off,
      { d40Geo, d40Tinted, say: d40WithHp.rows[0], off: [d40Empty.off, d40WithHp.off] });

    /* ── 30c. THE FOUR MOVEMENTS THAT ARE NOT AUTHORING: a term taken back off, D-34's
       cancel, the side chooser and the action list. Each is a real press and each is a
       different way the preview can be left describing a board that has moved on. The
       side switch is the one worth naming: it changes NO record at all, so a preview
       that read a pool captured when the dialog opened would go on reporting the Cats'
       three while the student stood on the Mechs. */
    await pg.click(`[data-k="ae/setActionCost/2/tok/"]`); await pg.waitForTimeout(250);
    const d40Removed = await d40Read();
    await pg.click('#act-edit-cancel'); await pg.waitForTimeout(300);
    const d40Cancelled = await d40Read();
    await pg.click('#act-edit-side-mechs'); await pg.waitForTimeout(300);
    const d40Mechs = await d40Read();
    await pg.click('#act-edit-side-cats'); await pg.waitForTimeout(300);
    await pg.click('[data-k="ae/list/cats/slash"]'); await pg.waitForTimeout(300);
    const d40Slash = await d40Read();
    await pg.locator('#act-edit-pane-author').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d40-after-restore-${ch}-${size.name}.png`)
    });
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    note(ch, size.name, 'D-40 removed / cancelled / mechs / slash',
      `${d40Removed.rows.map((r) => r.says[1]).join(' + ')} | drawn after cancel ${d40Cancelled.drawn}`
      + ` | mechs "${d40Mechs.rows.map((r) => r.says[0]).join(' + ')}"`
      + ` | slash "${d40Slash.rows.map((r) => r.says[0]).join(' + ')}"`);
    ok(`${tag}: 30c. D-40 — THE PREVIEW FOLLOWS EVERY MOVEMENT THAT IS NOT A KEYSTROKE: a term REMOVED through the chooser's own emptying entry takes its amount back out of the pool row, so the action-point row goes from four back to two and stops being short; D-34's CANCEL puts the record back and the preview goes with it, which is the one press that can land on exactly the fingerprint an earlier paint recorded — a restore puts a record BACK, so a surface memoised on that fingerprint would return early over a preview that had stopped being true; the SIDE chooser moves the reading onto the OTHER faction's pool while changing no record at all, which is the movement a preview built from a pool captured at open would fail silently; and the ACTION list moves it onto another rule's cost. Every one of the four is a real press on a real control`,
      d40Removed.rows.length === 2
      && d40Removed.rows[0].says[1] === 'Removes: 2 Action points when this action is used'
      && d40Removed.rows[0].short === false
      /* The cancel restores the record the editor was SHOWN with, which for an
         action created and then opened is one with no `cost` field at all — so
         the preview comes back to the implied single action point, not to the
         four-term cost that was authored over it and not to the emptied list
         that was authored first. One row, one point, and the short sentence
         gone with the terms that caused it. */
      && d40Cancelled !== null && d40Cancelled.rows.length === 1
      && d40Cancelled.rows[0].says[1] === 'Removes: 1 Action points when this action is used'
      && d40Cancelled.rows[0].short === false
      && d40Mechs !== null && d40Mechs.rows.length === 1
      && d40Slash !== null
      && d40Slash.rows.length === 1
      && d40Slash.rows[0].says[0] === '3 Action points this side holds'
      && d40Slash.rows[0].says[1] === 'Removes: 1 Action points when this action is used',
      { d40Removed, d40Cancelled, d40Mechs, d40Slash, d40Act });

    await pg.evaluate(() => {
      App.ops.resetToDefaults();
      App.state.invalidate({ structural: true });
      if (App.render.flush) App.render.flush();
    });
    await pg.waitForTimeout(200);

    // ═════════════════════════════════════════════════════════════════════════════════════
    // ── 31. D-41 PART TWO — THE POOL AND THE DRAG, BY REAL POINTERS. Plan 05-D41b.
    // ═════════════════════════════════════════════════════════════════════════════════════
    // Every drag below is page.mouse: down on a real token, several moves past the threshold,
    // across to the target, up. Nothing is dispatched by hand and no op is called for the
    // gesture — the ops below only BUILD a board to drag on. The node gate reaches the
    // gesture up to the drop (129c); the drop resolves the entity under the pointer with
    // elementFromPoint, which only a layout engine answers, so every drop kind lives HERE.
    const d41Fresh = async () => {
      await pg.evaluate(() => {
        if (App.state.get().fight !== null) { App.ops.endFight(); }
        App.ops.resetToDefaults();
        // AN EMPTY UNDO STACK, measured necessary: the stack is capped at UNDO_LIMIT
        // (30) and by cell 31 the earlier cells have filled it, so a drag that pushed an
        // entry left the depth at 30 and "one undo entry" read as none. restore() is
        // [S03]'s own writer and empties the stack; the board is the reset one.
        App.state.restore(JSON.stringify(App.state.get()));
        App.state.invalidate({ structural: true });
        App.state.flush();
      });
      if (await pg.evaluate(() => document.querySelector('#app').dataset.view) !== 'build') {
        await pg.click('#view-build'); await pg.waitForTimeout(200);
      }
      await pg.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
      await pg.waitForTimeout(120);
    };
    // Places the page so the source and the target are both on screen (a real student
    // scrolls first too), then returns their centres.
    const d41Aim = (srcSel, tgtSel) => pg.evaluate(([s, t]) => {
      const src = document.querySelector(s);
      const tgt = document.querySelector(t);
      if (!src || !tgt) return { missing: !src ? s : t };
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      const bar = document.getElementById('topbar').getBoundingClientRect().bottom;
      let a = src.getBoundingClientRect();
      let b = tgt.getBoundingClientRect();
      const lo = Math.min(a.top, b.top);
      const hi = Math.max(a.bottom, b.bottom);
      if (hi > window.innerHeight - 70) {
        window.scrollBy({ top: Math.min(lo - bar - 70, hi - window.innerHeight + 70), left: 0, behavior: 'instant' });
      }
      a = src.getBoundingClientRect();
      b = tgt.getBoundingClientRect();
      window.__d41src = src.classList.contains('tok') ? src : src.querySelector('.tok');
      return { sx: a.left + a.width / 2, sy: a.top + a.height / 2,
        tx: b.left + Math.min(b.width / 2, 60), ty: b.top + Math.min(b.height / 2, 14),
        onScreen: a.top >= bar && b.top >= bar && a.bottom <= window.innerHeight && b.bottom <= window.innerHeight };
    }, [srcSel, tgtSel]);
    // What the board is showing mid-flight: every lit, refused and home entity, the ghost,
    // and whether the node picked up is still the node the press landed on.
    const d41Flight = () => pg.evaluate(() => {
      const key = (n) => n.dataset.drgAt + '/' + (n.dataset.drgUnit || 'pool');
      const all = Array.from(document.querySelectorAll('[data-drg-at]'));
      const ghost = document.querySelector('#drag-layer .drg-ghost');
      const gs = ghost ? getComputedStyle(ghost) : null;
      return {
        inFlight: App.interactions.dragInFlight(),
        lit: all.filter((n) => n.classList.contains('drg-lit')).map(key),
        no: all.filter((n) => n.classList.contains('drg-no')).map(key),
        home: all.filter((n) => n.classList.contains('drg-home')).map(key),
        over: all.filter((n) => n.classList.contains('drg-over')).map(key),
        ghost: !!ghost, ghostPE: gs ? gs.pointerEvents : null,
        layerPE: getComputedStyle(document.getElementById('drag-layer')).pointerEvents,
        srcSame: !!window.__d41src && window.__d41src.isConnected
          && window.__d41src.classList.contains('drg-taking'),
        commits: App.state.stats().commits
      };
    });
    const d41Read = () => pg.evaluate(() => {
      const b = App.state.get().build;
      const said = Array.from(document.querySelectorAll('[data-drg-at] > .drg-said'))
        .filter((p) => !p.hidden).map((p) => (p.parentNode.dataset.drgUnit || p.parentNode.dataset.drgAt + ' pool') + ': ' + p.textContent);
      return {
        c1: b.cats.units[0].maxHp, c2: b.cats.units[1].maxHp, c3: b.cats.units[2].maxHp,
        c4: b.cats.units[3].maxHp, c1s: b.cats.units[0].shield, m1: b.mechs.units[0].maxHp,
        m1s: b.mechs.units[0].shield, capAp: b.cats.ap, mapAp: b.mechs.ap,
        catsRes: JSON.stringify(b.cats.reserve || {}), mechsRes: JSON.stringify(b.mechs.reserve || {}),
        depth: App.state.undoDepth(), commits: App.state.stats().commits,
        inFlight: App.interactions.dragInFlight(),
        ghosts: document.querySelectorAll('#drag-layer > *').length,
        lights: document.querySelectorAll('.drg-lit, .drg-no, .drg-home, .drg-over, .drg-taking').length,
        said, panel: document.getElementById('err-panel').hidden
      };
    });
    // One real drag. `mid` runs while the token is over the target, before the release.
    const d41Drag = async (srcSel, tgtSel, mid) => {
      const aim = await d41Aim(srcSel, tgtSel);
      if (aim.missing) return { aim, flight: null };
      await pg.mouse.move(aim.sx, aim.sy);
      await pg.mouse.down();
      for (let i = 1; i <= 4; i++) { await pg.mouse.move(aim.sx + i * 3, aim.sy + i * 2); }
      await pg.mouse.move(aim.tx, aim.ty, { steps: 8 });
      await pg.waitForTimeout(80);
      const flight = await d41Flight();
      if (mid) await mid();
      await pg.mouse.up();
      await pg.waitForTimeout(160);
      return { aim, flight };
    };
    // Where the one showing said line is, after the page's smooth scroll has settled.
    const d41SaidBox = async () => {
      await pg.waitForTimeout(700);
      return pg.evaluate(() => {
        const p = Array.from(document.querySelectorAll('[data-drg-at] > .drg-said')).find((n) => !n.hidden);
        if (!p) return null;
        const r = p.getBoundingClientRect();
        const bar = document.getElementById('topbar').getBoundingClientRect().bottom;
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), onScreen: r.top >= bar && r.bottom <= window.innerHeight };
      });
    };
    const d41Shot = (name) => pg.screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d41-${name}-${ch}-${size.name}.png`)
    });
    const CAT = (u) => `#col-cats [data-drg-at="cats"][data-drg-unit="${u}"]`;
    const MECH = (u) => `#col-mechs [data-drg-at="mechs"][data-drg-unit="${u}"]`;
    const POOL = (side) => `#col-${side} .brd-pool`;

    // ── 31. THE POOL, ON SCREEN, AT THE TOP OF EACH COLUMN, AT THE FLOOR, AND THE LAYER. ──
    await d41Fresh();
    const d41Layout = await pg.evaluate(() => ['cats', 'mechs'].map((side) => {
      const col = document.getElementById('col-' + side);
      const h2 = col.querySelector('.brd-faction').getBoundingClientRect();
      const pool = col.querySelector('.brd-pool').getBoundingClientRect();
      const dmg = col.querySelector('.brd-value[data-amt="dmg"]').getBoundingClientRect();
      const empty = col.querySelector('.brd-pool-empty');
      const words = [col.querySelector('.brd-pool-head'), col.querySelector('.brd-pool-line .brd-label'), empty];
      const layer = document.getElementById('drag-layer');
      return {
        order: h2.bottom <= pool.top && pool.bottom <= dmg.top,
        onScreen: pool.top >= 0 && pool.bottom <= window.innerHeight,
        emptyDashed: getComputedStyle(empty).borderTopStyle === 'dashed' && empty.getBoundingClientRect().height > 0,
        emptyText: empty.textContent,
        minFont: Math.min(...words.map((w) => parseFloat(getComputedStyle(w).fontSize))),
        layerOutsideApp: !document.getElementById('app').contains(layer),
        layerPE: getComputedStyle(layer).pointerEvents,
        srcTouch: getComputedStyle(col.querySelector('.tok-row.drg-src')).touchAction,
        srcCursor: getComputedStyle(col.querySelector('.tok-row.drg-src')).cursor
      };
    }));
    note(ch, size.name, 'D-41 pool top / bottom (cats)', await pg.evaluate(() => {
      const r = document.querySelector('#col-cats .brd-pool').getBoundingClientRect();
      return Math.round(r.top) + ' / ' + Math.round(r.bottom);
    }));
    ok(`${tag}: 31. D-41 — THE POOL SITS AT THE TOP OF EACH SIDE'S COLUMN, ON SCREEN AT LOAD, UNDER THE FACTION'S NAME AND ABOVE THE DAMAGE LINE, and an EMPTY reserve reads as a DROP SLOT — a dashed box holding the sentence that says what goes there — rather than as a blank. Every word the pool adds is at UX-02's 18px floor. The drag layer is OUTSIDE #app, where neither render tier reaches, and pointer-events:none, so the pointer's hit test sees through it; the drag sources are touch-action:none so a finger drags a token instead of panning the page, and wear the grab cursor`,
      d41Layout.every((s) => s.order && s.onScreen && s.emptyDashed && s.minFont >= 18
        && s.layerOutsideApp && s.layerPE === 'none' && s.srcTouch === 'none' && s.srcCursor === 'grab')
      && d41Layout[0].emptyText === await pg.evaluate(() => App.render.RESERVE_EMPTY),
      d41Layout);

    // ── 31a. UNIT → UNIT, SAME SIDE: lights, identity, ONE move, and the picture. ──
    await d41Fresh();
    const a0 = await d41Read();
    const d41A = await d41Drag(`${CAT('c1')} .tok-row[data-drg-tok="hp"] .tok`, `${CAT('c2')} .unit-name`,
      () => d41Shot('inflight-unit-to-unit'));
    const a1 = await d41Read();
    await d41Shot('after-unit-to-unit');
    ok(`${tag}: 31a. D-41 — A REAL DRAG FROM ONE CAT TO ANOTHER MOVES ONE HEALTH, AS ONE COMMIT AND ONE UNDO ENTRY. In flight: the drag is live carrying health from Cat 1, one ghost is in the layer and is pointer-events:none, Cat 1 is HOME, every other card and both pools are LIT because health moves anywhere on the shipped board, nothing is refused, and the target under the pointer is the one marked OVER. THE TOKEN PICKED UP IS STILL THE NODE THE PRESS LANDED ON, and still in the document, at the moment of the drop — the node-identity clause plan 05-10 and D-37 probe G say nothing else catches — and NOT ONE COMMIT landed while the drag was live. After the release: Cat 1 3 -> 2, Cat 2 3 -> 4, exactly one commit and one undo entry, the ghost gone and every light off`,
      d41A.aim.onScreen && d41A.flight
      && JSON.parse(d41A.flight.inFlight || '{}').live === true
      && d41A.flight.ghost && d41A.flight.ghostPE === 'none' && d41A.flight.layerPE === 'none'
      && d41A.flight.home.join() === 'cats/c1' && d41A.flight.no.length === 0
      && d41A.flight.lit.length === 2 + 9 + 3 - 1 && d41A.flight.over.join() === 'cats/c2'
      && d41A.flight.srcSame === true && d41A.flight.commits === a0.commits
      && a1.c1 === 2 && a1.c2 === 4 && a1.commits === a0.commits + 1 && a1.depth === a0.depth + 1
      && a1.inFlight === '' && a1.ghosts === 0 && a1.lights === 0 && a1.panel === true,
      { aim: d41A.aim, flight: d41A.flight, before: a0, after: a1 });

    // ── 31b. UNIT → UNIT, ACROSS SIDES. ──
    await d41Fresh();
    const b0 = await d41Read();
    const d41B = await d41Drag(`${MECH('m1')} .tok-row[data-drg-tok="shield"] .tok`, `${CAT('c1')} .unit-name`);
    const b1 = await d41Read();
    ok(`${tag}: 31b. D-41 — ACROSS SIDES: A MECH'S SHIELD DRAGGED ONTO A CAT MOVES ONE — Mech 1 3 -> 2, Cat 1 0 -> 1 — the amendment's "any unit to any other unit", one commit, one undo entry`,
      d41B.aim.onScreen && d41B.flight && d41B.flight.over.join() === 'cats/c1'
      && d41B.flight.lit.indexOf('cats/c1') !== -1
      && b1.m1s === 2 && b1.c1s === 1 && b1.commits === b0.commits + 1 && b1.depth === b0.depth + 1,
      { flight: d41B.flight, before: b0, after: b1 });

    // ── 31c / 31d. UNIT → ITS OWN POOL, THEN POOL → A UNIT ON THE OTHER SIDE. ──
    await d41Fresh();
    const c0 = await d41Read();
    const d41C = await d41Drag(`${CAT('c1')} .tok-row[data-drg-tok="hp"] .tok`, `${POOL('cats')} .brd-pool-head`);
    const c1r = await d41Read();
    const d41Held = await pg.evaluate(() => {
      const box = document.querySelector('#col-cats .brd-pool-held .sym');
      return box ? { tok: box.dataset.drgTok, title: box.getAttribute('title'), n: box.querySelectorAll('.tok').length,
        size: Math.round(box.querySelector('.tok').getBoundingClientRect().width),
        board: Math.round(document.querySelector('#col-cats .unit-card .tok-row[data-drg-tok="hp"] .tok').getBoundingClientRect().width) } : null;
    });
    await d41Shot('after-unit-to-pool');
    ok(`${tag}: 31c. D-41 — UNIT → ITS OWN POOL: Cat 1's health dragged onto the Cats' pool goes into the RESERVE — Cat 1 3 -> 2, the reserve holds one — and the pool draws it as a reading of the type's own token AT THE BOARD'S TOKEN SIZE, with the empty sentence gone`,
      d41C.aim.onScreen && d41C.flight && d41C.flight.over.join() === 'cats/pool'
      && c1r.c1 === 2 && c1r.catsRes === '{"hp":1}' && c1r.commits === c0.commits + 1
      && d41Held && d41Held.tok === 'hp' && d41Held.n === 1 && d41Held.size === d41Held.board
      && /^1 .* in reserve$/.test(d41Held.title),
      { flight: d41C.flight, before: c0, after: c1r, held: d41Held });
    const d41D = await d41Drag(`#col-cats .brd-pool-held .sym[data-drg-tok="hp"] .tok`, `${MECH('m1')} .unit-name`);
    const d1 = await d41Read();
    await d41Shot('after-pool-to-other-side');
    ok(`${tag}: 31d. D-41 — POOL → A UNIT ON THE OTHER SIDE: the health parked in the Cats' reserve dragged onto Mech 1 leaves the reserve empty (the key gone and the empty sentence back) and Mech 1 goes 6 -> 7 — any-to-any, one commit`,
      d41D.aim.onScreen && d41D.flight && d41D.flight.home.join() === 'cats/pool'
      && d41D.flight.over.join() === 'mechs/m1'
      && d1.m1 === 7 && d1.catsRes === '{}' && d1.commits === c1r.commits + 1
      && await pg.evaluate(() => document.querySelector('#col-cats .brd-pool-empty') !== null),
      { flight: d41D.flight, after: d1 });

    // ── 31e. SIDE-KEPT, POOL → POOL. ──
    await d41Fresh();
    const e0 = await d41Read();
    const d41E = await d41Drag(`${POOL('cats')} .tok-row[data-drg-tok="ap"] .tok`, `${POOL('mechs')} .brd-pool-head`,
      () => d41Shot('inflight-side-scope'));
    const e1 = await d41Read();
    ok(`${tag}: 31e. D-41 — A SIDE-KEPT TOKEN MOVES POOL TO POOL: one of the Cats' action points dragged onto the Mechs' pool — Cats 3 -> 2, Mechs 3 -> 4. In flight the Cats' pool is HOME, the Mechs' pool is LIT, and EVERY UNIT ON BOTH SIDES reads REFUSED, which is the op's scope rule arriving as a picture`,
      d41E.aim.onScreen && d41E.flight && d41E.flight.home.join() === 'cats/pool'
      && d41E.flight.lit.join() === 'mechs/pool' && d41E.flight.no.length === 9 + 3
      && e1.capAp === 2 && e1.mapAp === 4 && e1.commits === e0.commits + 1,
      { flight: d41E.flight, before: e0, after: e1 });

    // ── 31f. A REFUSED DROP: SIDE-KEPT ONTO A UNIT, AND ITS SENTENCE READ BACK. ──
    await d41Fresh();
    const f0 = await d41Read();
    let d41FWasNo = null;
    const d41F = await d41Drag(`${POOL('cats')} .tok-row[data-drg-tok="ap"] .tok`, `${CAT('c2')} .unit-name`,
      async () => { d41FWasNo = await pg.evaluate((s) => document.querySelector(s).classList.contains('drg-no'), CAT('c2')); });
    const f1 = await d41Read();
    const fBox = await d41SaidBox();
    const d41FSaid = await pg.evaluate(() => App.interactions.dragAnswers('ap', { side: 'cats', unitId: null })
      .find((a) => a.unitId === 'c2').said);
    await d41Shot('refused-scope');
    ok(`${tag}: 31f. D-41 — A REFUSED DROP IS REFUSED BEFORE AND AFTER THE RELEASE, AND SAYS WHY AT THE DROP. An action point dragged onto Cat 2: while it is over the card the card is marked REFUSED, not lit; on release NOTHING MOVES and nothing commits, and Cat 2's own said line carries the op's sentence — "kept on the whole side, so it cannot be moved onto or off a single unit" — which is the very sentence the drag's answer carried, so the picture and the refusal come from one ruling. AND THE SENTENCE IS ON SCREEN once the page settles, between the sticky bar and the foot of the window — a screenshot of this very drop at 1366x768 found it written below the fold. The error panel stays shut`,
      d41F.aim.onScreen && d41FWasNo === true && d41F.flight.lit.indexOf('cats/c2') === -1
      && f1.commits === f0.commits && f1.capAp === 3
      && f1.said.length === 1 && f1.said[0] === 'c2: ' + d41FSaid
      && /kept on the whole side, so it cannot be moved onto or off a single unit/.test(d41FSaid)
      && fBox !== null && fBox.onScreen === true
      && f1.panel === true,
      { flight: d41F.flight, wasNo: d41FWasNo, after: f1, said: d41FSaid, box: fBox });

    // ── 31g. A REFUSED BOUND BREACH. ──
    await d41Fresh();
    await pg.evaluate(() => { App.ops.setTokenBounds('hp', { min: 0, max: 4 }); App.state.flush(); });
    const g0 = await d41Read();
    const d41G = await d41Drag(`${CAT('c1')} .tok-row[data-drg-tok="hp"] .tok`, `${MECH('m1')} .unit-name`,
      () => d41Shot('inflight-bound'));
    const g1 = await d41Read();
    const gBox = await d41SaidBox();
    await d41Shot('refused-bound');
    ok(`${tag}: 31g. D-41 — A DROP PAST A D-35 CEILING IS REFUSED WHOLE. Health bounded to 0-4 while every mech holds six: in flight every CAT is lit and every MECH reads refused — the bound test is the op's, asked of each end — and dropping on Mech 1 moves nothing, commits nothing, and Mech 1's said line reads the op's ceiling sentence, "Mech 1 holds at most 4 "Health", so it cannot take another.", on screen`,
      d41G.aim.onScreen && d41G.flight
      && ['mechs/m1', 'mechs/m2', 'mechs/m3'].every((k) => d41G.flight.no.indexOf(k) !== -1)
      && d41G.flight.lit.indexOf('cats/c2') !== -1
      && g1.commits === g0.commits && g1.c1 === 3 && g1.m1 === 6
      && g1.said.join() === 'm1: ' + born.m1 + ' holds at most 4 "Health", so it cannot take another.'
      && gBox !== null && gBox.onScreen === true
      && g1.panel === true,
      { flight: d41G.flight, after: g1, box: gBox });

    // ── 31h. ESCAPE MID-DRAG, THEN A RELEASE OVER A LIT TARGET. ──
    await d41Fresh();
    const h0 = await d41Read();
    const hAim = await d41Aim(`${CAT('c1')} .tok-row[data-drg-tok="hp"] .tok`, `${CAT('c2')} .unit-name`);
    await pg.mouse.move(hAim.sx, hAim.sy);
    await pg.mouse.down();
    for (let i = 1; i <= 4; i++) { await pg.mouse.move(hAim.sx + i * 3, hAim.sy + i * 2); }
    await pg.mouse.move(hAim.tx, hAim.ty, { steps: 6 });
    const hLive = await d41Flight();
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(80);
    const hEsc = await d41Read();
    await pg.mouse.up();
    await pg.waitForTimeout(150);
    const h1 = await d41Read();
    ok(`${tag}: 31h. D-41 — ESCAPE CANCELS A DRAG IN FLIGHT. Live and over a LIT card, Escape ends it: nothing in flight, no ghost, every light off — and the release that follows over that lit card writes NOTHING`,
      JSON.parse(hLive.inFlight || '{}').live === true && hLive.over.join() === 'cats/c2'
      && hEsc.inFlight === '' && hEsc.ghosts === 0 && hEsc.lights === 0
      && h1.commits === h0.commits && h1.c1 === 3 && h1.c2 === 3,
      { live: hLive, esc: hEsc, after: h1 });

    // ── 31i. A SUB-THRESHOLD PRESS IS STILL A CLICK, ON A TOKEN AND ON A STEPPER. ──
    await d41Fresh();
    const i0 = await d41Read();
    const iAim = await d41Aim(`${CAT('c1')} .tok-row[data-drg-tok="hp"] .tok`, `${CAT('c1')} .unit-name`);
    await pg.mouse.move(iAim.sx, iAim.sy);
    await pg.mouse.down();
    await pg.mouse.move(iAim.sx + 3, iAim.sy + 1);
    const iMid = await pg.evaluate(() => [App.interactions.dragInFlight(), document.querySelectorAll('#drag-layer > *').length]);
    await pg.mouse.up();
    await pg.waitForTimeout(120);
    const i1 = await d41Read();
    const plus = await pg.evaluate(() => {
      const b = document.querySelector('[data-k="cats/c1/maxHp+"]');
      b.scrollIntoView({ block: 'center', behavior: 'instant' });
      const r = b.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await pg.mouse.move(plus.x, plus.y);
    await pg.mouse.down();
    await pg.mouse.move(plus.x + 3, plus.y + 2);
    await pg.mouse.up();
    await pg.waitForTimeout(150);
    const i2 = await d41Read();
    ok(`${tag}: 31i. D-41 — A PRESS THAT DOES NOT TRAVEL DRAG_PX IS STILL A CLICK. On a token: a 3px wobble leaves the press pending and never live, draws no ghost, and the release commits nothing. On the + beside the same health: a press with the same wobble is ONE step, exactly as before this plan — the stepper is not a drag source and the drag never sees it`,
      iMid[0] !== '' && JSON.parse(iMid[0]).live === false && iMid[1] === 0
      && i1.commits === i0.commits && i1.c1 === 3 && i1.inFlight === ''
      && i2.c1 === 4 && i2.commits === i1.commits + 1,
      { mid: iMid, after: i1, afterPlus: i2 });

    // ── 31j. TWO DRAGS ARE TWO UNDO ENTRIES, EVEN INSIDE COALESCE_MS. ──
    // Two FAST drags, so the second release lands inside COALESCE_MS of the first — the
    // window in which two stepper presses on one number fold into one entry. A drag paced
    // like the ones above takes ~450 ms each and would prove nothing about folding.
    await d41Fresh();
    const j0 = await d41Read();
    const jAim = await d41Aim(`${CAT('c3')} .tok-row[data-drg-tok="hp"] .tok`, `${CAT('c4')} .unit-name`);
    const jCoalesce = await pg.evaluate(() => App.state.COALESCE_MS);
    const jFast = async () => {
      const at = await pg.evaluate(() => {
        const n = document.querySelector('#col-cats [data-drg-unit="c3"] .tok-row[data-drg-tok="hp"] .tok');
        const r = n.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      await pg.mouse.move(at.x, at.y);
      await pg.mouse.down();
      await pg.mouse.move(at.x + 8, at.y + 6);
      await pg.mouse.move(jAim.tx, jAim.ty, { steps: 2 });
      await pg.mouse.up();
      return Date.now();
    };
    const jUp1 = await jFast();
    const jUp2 = await jFast();
    const jMs = jUp2 - jUp1;
    await pg.waitForTimeout(150);
    const j1 = await d41Read();
    await pg.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); });
    await pg.keyboard.press('Control+z');
    await pg.waitForTimeout(150);
    const j2 = await d41Read();
    // THE CONTROL, in the same run: two presses on one stepper, the same distance apart,
    // DO fold — so the window really was open when the two drags did not.
    const jPlus = await pg.evaluate(() => {
      const bt = document.querySelector('[data-k="cats/c5/maxHp+"]');
      bt.scrollIntoView({ block: 'center', behavior: 'instant' });
      const r = bt.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await pg.waitForTimeout(600);
    const jc0 = await d41Read();
    await pg.mouse.click(jPlus.x, jPlus.y);
    await pg.mouse.click(jPlus.x, jPlus.y);
    await pg.waitForTimeout(150);
    const jc1 = await d41Read();
    note(ch, size.name, 'D-41 two drags, release to release (ms)', jMs + ' of ' + jCoalesce);
    ok(`${tag}: 31j. D-41 — TWO DRAGS ARE TWO UNDO ENTRIES, EVEN INSIDE COALESCE_MS. The same type between the same two cards, twice, with the second release landing inside the window in which two presses on one stepper fold into one entry (measured, and required): Cat 3 3 -> 1, Cat 4 3 -> 5, and the undo depth rises by TWO; one Ctrl+Z takes back exactly ONE of them (Cat 3 back to 2, Cat 4 to 4), because the move's label carries the commit count and cannot fold into its neighbour. THE CONTROL IN THE SAME RUN: two clicks on one stepper's + DO fold — two commits, one entry — so the window was open`,
      jAim.onScreen && typeof jCoalesce === 'number' && jMs < jCoalesce
      && j1.c3 === 1 && j1.c4 === 5 && j1.depth === j0.depth + 2
      && j2.c3 === 2 && j2.c4 === 4 && j2.depth === j0.depth + 1
      && jc1.commits === jc0.commits + 2 && jc1.depth === jc0.depth + 1,
      { before: j0, twice: j1, afterUndo: j2, ms: jMs, coalesce: jCoalesce, control: [jc0.depth, jc1.depth, jc0.commits, jc1.commits] });

    // ── 31k. THE STEPPER'S PRESS-AND-HOLD RAMP IS UNCHANGED. ──
    await d41Fresh();
    const k0 = await d41Read();
    const kBtn = await pg.evaluate(() => {
      const b = document.querySelector('[data-k="cats/c1/maxHp+"]');
      b.scrollIntoView({ block: 'center', behavior: 'instant' });
      const r = b.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await pg.mouse.move(kBtn.x, kBtn.y);
    await pg.mouse.down();
    await pg.waitForTimeout(250);
    const kEarly = await pg.evaluate(() => [App.state.get().build.cats.units[0].maxHp, App.interactions.holdSource(), App.interactions.dragInFlight()]);
    await pg.waitForTimeout(850);
    await pg.mouse.up();
    await pg.waitForTimeout(250);
    const k1 = await d41Read();
    const kSteps = k1.c1 - k0.c1;
    const kSrc = await pg.evaluate(() => App.interactions.holdSource());
    note(ch, size.name, 'D-41 stepper hold 1100ms: steps / undo entries', kSteps + ' / ' + (k1.depth - k0.depth));
    ok(`${tag}: 31k. D-41 — THE STEPPER'S PRESS-AND-HOLD RAMP IS UNCHANGED BY THE DRAG. Held for 1.1 s on Cat 1's health +: one step lands on the press, the ramp starts after HOLD_FIRST_MS and repeats — the count is recorded for all four columns — the whole hold is ONE undo entry, NO drag ever goes in flight, and releasing stops the ramp`,
      kEarly[0] === 4 && kEarly[1] === 'pointer' && kEarly[2] === ''
      && kSteps >= 5 && kSteps <= 14 && k1.depth === k0.depth + 1 && kSrc === null,
      { early: kEarly, steps: kSteps, before: k0, after: k1 });

    // ── 31l. A DRAG REACHES THE POOL FROM A CARD THE POOL IS NOT ON SCREEN WITH. ──
    await d41Fresh();
    const l0 = await d41Read();
    const lSrc = await pg.evaluate(() => {
      const n = document.querySelector('#col-cats [data-drg-unit="c9"] .tok-row[data-drg-tok="hp"] .tok');
      n.scrollIntoView({ block: 'end', behavior: 'instant' });
      window.scrollBy({ top: 60, left: 0, behavior: 'instant' });
      const r = n.getBoundingClientRect();
      const pool = document.querySelector('#col-cats .brd-pool').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, poolBottom: pool.bottom,
        bar: document.getElementById('topbar').getBoundingClientRect().bottom };
    });
    await pg.mouse.move(lSrc.x, lSrc.y);
    await pg.mouse.down();
    for (let i = 1; i <= 4; i++) { await pg.mouse.move(lSrc.x + i * 3, lSrc.y - i * 2); }
    await pg.mouse.move(lSrc.x, lSrc.bar + 6, { steps: 10 });
    let lPool = null;
    for (let i = 0; i < 80; i++) {
      await pg.waitForTimeout(50);
      lPool = await pg.evaluate(() => {
        const r = document.querySelector('#col-cats .brd-pool-head').getBoundingClientRect();
        return { top: r.top, x: r.left + 40, y: r.top + r.height / 2 };
      });
      if (lPool.top > lSrc.bar + 70) break;
    }
    // Out of the edge zone first, so the page stops scrolling, THEN read where the pool
    // is and aim at it — a point read while the page is still moving is a stale one.
    await pg.mouse.move(lPool.x, lSrc.bar + 200, { steps: 2 });
    await pg.waitForTimeout(120);
    lPool = await pg.evaluate(() => {
      const r = document.querySelector('#col-cats .brd-pool-head').getBoundingClientRect();
      return { top: r.top, x: r.left + 40, y: r.top + r.height / 2 };
    });
    await pg.mouse.move(lPool.x, lPool.y, { steps: 5 });
    await pg.waitForTimeout(80);
    const lOver = await d41Flight();
    await pg.mouse.up();
    await pg.waitForTimeout(160);
    const l1 = await d41Read();
    const l9 = await pg.evaluate(() => App.state.get().build.cats.units[8].maxHp);
    ok(`${tag}: 31l. D-41 — A DRAG REACHES THE POOL FROM A CARD THE POOL IS NOT ON SCREEN WITH. Cat 9's health is picked up with the pool scrolled out of sight (its bottom edge above the window, measured), held at the sticky bar's edge until the page scrolls the pool into view, and dropped on it: Cat 9 3 -> 2 and the Cats' reserve holds one. Added because a real drag at 1366x768 measured the pool unreachable from Cat 6 down`,
      lSrc.poolBottom < lSrc.bar && lOver.over.join() === 'cats/pool'
      && l9 === 2 && l1.catsRes === '{"hp":1}' && l1.commits === l0.commits + 1,
      { src: lSrc, over: lOver, after: l1 });

    await d41Fresh();

    // ═════════════════════════════════════════════════════════════════════════════════════
    // ── 32. D-42 — THE BATTLE SCENE, BY REAL POINTERS AND BY THE PICTURE. Plan 05-D42.
    // ═════════════════════════════════════════════════════════════════════════════════════
    // What only a browser can say: where the scene sits on the tab, that every sprite and
    // every name is inside the frame and legible, that the pixels on the canvas are the
    // tokens' colours, what a dead unit looks like, and the whole gesture — every drag
    // below is page.mouse on a real sprite. The node gate (130, 130b) holds the paint and
    // the gesture's bookkeeping; the drop point, the clamp against a real rectangle, the
    // store surviving a RELOAD and the look live here. Every screenshot is read back.
    const d42Shot = (name) => pg.locator('#scene').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d42-${name}-${ch}-${size.name}.png`)
    });
    const d42Fresh = async () => {
      await pg.evaluate(() => {
        if (App.state.get().fight !== null) { App.ops.endFight(); }
        App.ops.resetToDefaults();
        App.state.restore(JSON.stringify(App.state.get()));
        App.render.sceneHome();
        App.state.invalidate({ structural: true });
        App.state.flush();
      });
      await pg.click('#fight-start'); await pg.waitForTimeout(250);
      await pg.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
      await pg.waitForTimeout(150);
    };
    const d42Read = () => pg.evaluate(() => {
      const f = document.getElementById('scene-field').getBoundingClientRect();
      const sprites = Array.from(document.querySelectorAll('#scene-field > .scn-unit')).map((n) => {
        const r = n.getBoundingClientRect();
        const nm = n.querySelector('.scn-name') || n;
        const q = nm.getBoundingClientRect();
        // THE NAME IS WHAT A HIT TEST FINDS AT ITS CENTRE AND AT ALL FOUR INNER CORNERS —
        // nothing painted over it. Added after the first screenshots showed a long name
        // under the next row's sprite and a dropped sprite over a neighbour's name, with
        // every row green: comparing names with names cannot see a name under a picture.
        const pts = [[(q.left + q.right) / 2, (q.top + q.bottom) / 2], [q.left + 3, q.top + 3],
          [q.right - 3, q.top + 3], [q.left + 3, q.bottom - 3], [q.right - 3, q.bottom - 3]];
        const onTop = pts.every(([x, y]) => {
          if (x < 0 || y < 0 || x >= window.innerWidth || y >= window.innerHeight) { return true; }
          const hit = document.elementFromPoint(x, y);
          return hit === nm || (hit !== null && nm.contains(hit));
        });
        // D-43: the canvas's own rectangle, TRANSFORM INCLUDED (a dead unit's is turned), its
        // backing size and how it is scaled — what "twice the cat" is measured on.
        const cv = n.querySelector('canvas');
        const c = cv ? cv.getBoundingClientRect() : { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
        return { id: n.dataset.scnUnit, at: n.dataset.scnAt, name: nm.textContent, onTop,
          aria: n.getAttribute('aria-label'), down: n.classList.contains('scn-unit--down'),
          l: r.left, t: r.top, r: r.right, b: r.bottom, cx: r.left + r.width / 2, cy: r.top + r.height / 2,
          w: r.width, h: r.height,
          cl: c.left, ct: c.top, cr: c.right, cb: c.bottom, cw: c.width, chh: c.height,
          cbw: cv ? cv.width : 0, ir: cv ? getComputedStyle(cv).imageRendering : '',
          cf: cv ? getComputedStyle(cv).filter : '', ctf: cv ? getComputedStyle(cv).transform : '',
          nl: q.left, nt: q.top, nr: q.right, nb: q.bottom,
          font: parseFloat(getComputedStyle(nm).fontSize), family: getComputedStyle(nm).fontFamily,
          clipped: nm.scrollWidth > nm.clientWidth + 1 };
      });
      let stored = null;
      try { stored = localStorage.getItem('cvm.v1.scene'); } catch (e) { stored = 'BLOCKED'; }
      return { field: { l: f.left, t: f.top, r: f.right, b: f.bottom, w: f.width, h: f.height },
        rows: document.getElementById('scene-field').dataset.scnRows,
        sprites, saved: App.render.sceneSaid(), stored,
        commits: App.state.stats().commits, depth: App.state.undoDepth(),
        state: JSON.stringify(App.state.get()), held: App.interactions.sceneHeld(),
        panel: document.getElementById('err-panel').hidden };
    });
    // A missing sprite reads as an EMPTY record, so a clause about it is false rather than a
    // TypeError that ends the run: under PROBE P2 cell 32g threw on a place that was never kept,
    // and a row may FAIL but may not throw.
    const d42Sprite = (rd, id) => rd.sprites.filter((s) => s.id === id)[0] || {};
    const d42J = (t) => { try { const v = JSON.parse(t); return (v && typeof v === 'object') ? v : {}; } catch (e) { return {}; } };
    const d42Inside = (rd) => rd.sprites.every((s) => s.l >= rd.field.l - 1 && s.t >= rd.field.t - 1
      && s.r <= rd.field.r + 1 && s.b <= rd.field.b + 1);
    const d42NamesApart = (rd) => {
      const n = rd.sprites;
      for (let i = 0; i < n.length; i++) {
        for (let j = i + 1; j < n.length; j++) {
          const a = n[i]; const b = n[j];
          if (a.nl < b.nr - 1 && b.nl < a.nr - 1 && a.nt < b.nb - 1 && b.nt < a.nb - 1) { return a.id + '/' + b.id; }
        }
      }
      return '';
    };
    // A token's computed colour, through a probe element, so a sprite pixel is compared with
    // what the stylesheet says the token IS rather than with a typed value.
    const d42Tok = (css) => pg.evaluate((c) => {
      const p = document.createElement('div');
      p.style.color = c;
      document.body.appendChild(p);
      const v = getComputedStyle(p).color;
      p.remove();
      return v;
    }, css);
    const d42Pixel = (id, x, y) => pg.evaluate(([u, px, py]) => {
      const c = document.querySelector(`#scene-field > [data-scn-unit="${u}"] canvas`);
      if (!c) { return 'MISSING'; }
      const d = c.getContext('2d').getImageData(px, py, 1, 1).data;
      return `rgb(${d[0]}, ${d[1]}, ${d[2]})`;
    }, [id, x, y]);
    // One real drag of one sprite, taken at its centre. `mid` runs half-way, while held.
    const d42Drag = async (id, tx, ty, mid) => {
      const s = await pg.evaluate((u) => {
        const n = document.querySelector(`#scene-field > [data-scn-unit="${u}"]`);
        window.__d42node = n;
        if (!n) { return null; }
        const r = n.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }, id);
      if (s === null) { return { from: null, flight: { held: '', same: false }, mid: {} }; }
      await pg.mouse.move(s.x, s.y);
      await pg.mouse.down();
      for (let i = 1; i <= 3; i++) { await pg.mouse.move(s.x + i * 3, s.y + i * 2); }
      await pg.mouse.move((s.x + tx) / 2, (s.y + ty) / 2, { steps: 6 });
      const midOut = mid ? await mid() : {};
      await pg.mouse.move(tx, ty, { steps: 6 });
      await pg.waitForTimeout(60);
      const flight = await pg.evaluate(() => ({ held: App.interactions.sceneHeld(),
        same: !!window.__d42node && window.__d42node.isConnected
          && window.__d42node.classList.contains('scn-unit--held') }));
      await pg.mouse.up();
      await pg.waitForTimeout(150);
      return { from: s, flight, mid: midOut };
    };

    // ── 32. WHERE IT SITS, WHAT IT LOOKS LIKE, AND THAT EVERY NAME IS LEGIBLE. ──
    await pg.evaluate(() => { try { localStorage.removeItem('cvm.v1.scene'); } catch (e) { /* none */ } });
    await d42Fresh();
    // D-44, plan 05-D44: THE 8-BIT GENERATION IS SELECTED HERE, BY A REAL CLICK ON THE PICKER,
    // and every cell from 32 to 32n below is D-42's and D-43's own, untouched. That they pass with
    // 8-bit selected is the claim "keep the original art". The choice is kept in the store, so it
    // holds across 32g's reload as well. The 16-bit cells, and the picker's, are 32o onwards.
    await pg.click('#scene-gen-8'); await pg.waitForTimeout(150);
    const d42Look = await pg.evaluate(() => {
      const band = document.querySelector('.fg-band');
      const scene = document.getElementById('scene');
      const r = scene.getBoundingClientRect();
      const win = getComputedStyle(document.querySelector('.scn-win'));
      const cv = getComputedStyle(document.querySelector('#scene-field canvas') || document.getElementById('scene-field'));
      const reset = document.getElementById('scene-reset');
      // TURNED IN THE OPEN UNDER D-47: this read three shell words, the middle one #scene-hint,
      // and on the first run after the hint left the shell getComputedStyle(null) THREW and
      // stopped the whole column at this line (TypeError, "parameter 1 is not of type
      // 'Element'"). Two words now, read null-safe so a missing one is a 0 and a FAILED clause
      // rather than a stopped run; and the move itself is asserted below — the paragraph is
      // gone and the heading carries its sentence as a title, which is where Layer C reads it.
      const words = ['scene-head', 'scene-reset'].map((id) => { const n = document.getElementById(id); return n ? parseFloat(getComputedStyle(n).fontSize) : 0; });
      const headTitle = (document.getElementById('scene-head') || { title: '' }).title;
      const hintGone = document.getElementById('scene-hint') === null && document.querySelector('#scene .scn-hint') === null;
      const text = document.getElementById('scene').innerText;
      return {
        first: band.firstElementChild === scene,
        aboveLedger: !!(scene.compareDocumentPosition(document.getElementById('ledger')) & Node.DOCUMENT_POSITION_FOLLOWING),
        outsideBoard: !document.getElementById('board').contains(scene),
        top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY), vh: window.innerHeight,
        rim: win.borderTopColor, rimWidth: win.borderTopWidth, fill: win.backgroundColor,
        pixelated: cv.imageRendering, canvasPx: Math.round(parseFloat(cv.width)),
        resetText: reset.textContent.trim(), resetShown: reset.getBoundingClientRect().width > 0,
        minWord: Math.min(...words), text, headTitle, hintGone,
        dataK: document.querySelectorAll('#scene [data-k], #scene [data-act], #scene [data-fg]').length
      };
    });
    const d42Fill = await d42Tok('color-mix(in srgb, var(--accent) 26%, var(--bg))');
    // The fill is a BACKGROUND and the probe a colour; both are the same mix, read the
    // same way, so a probe for the background is taken through its own property.
    const d42FillProbe = await pg.evaluate(() => {
      const p = document.createElement('div');
      p.style.backgroundColor = 'color-mix(in srgb, var(--accent) 26%, var(--bg))';
      document.body.appendChild(p);
      const v = getComputedStyle(p).backgroundColor;
      p.remove();
      return v;
    });
    const d42r0 = await d42Read();
    const d42Ink = await d42Tok('var(--ink)');
    const d42Coral = await d42Tok('var(--coral)');
    const d42Steel = await d42Tok('var(--ink-dim)');
    const d42Accent = await d42Tok('var(--accent)');
    const d42Px = [await d42Pixel('c1', 9, 4), await d42Pixel('m1', 7, 3), await d42Pixel('m1', 6, 4)];
    // Words the scene shows are the three in the shell plus one name per unit, and NOT ONE
    // of them names an outcome: FF1's end-of-battle banner is exactly what D-26 forbids.
    const d42Verdict = /victor|triumph|winner|loser|\bwin(s|ning)?\b|\bwon\b|defeat|\blost\b|\bbest\b|score|rank/i
      .test(d42Look.text);
    note(ch, size.name, 'D-42 scene top/bottom from the top of the document, at load', `${d42Look.top}/${d42Look.bottom} of ${d42Look.vh}`);
    note(ch, size.name, 'D-42 field w x h, rows, sprite px', `${Math.round(d42r0.field.w)}x${Math.round(d42r0.field.h)} rows ${d42r0.rows} px ${d42Look.canvasPx}`);
    await d42Shot('fresh');
    ok(`${tag}: 32. D-42 — THE BATTLE SCENE IS THE FIGHT TAB'S FIRST PANEL, WHOLE ON SCREEN AT LOAD, FRAMED IN TOKENS, AND EVERY NAME IN IT IS LEGIBLE. It is the band's first child and above the lane of earlier rounds (so the lane still leads into the round), outside #board, and nothing in it carries data-k, data-act or data-fg. The window's rim is --ink and its fill is --accent mixed into --bg, each compared with what the stylesheet computes for that token rather than with a typed value. Twelve sprites, all inside the field, one per fight unit; the canvas is drawn pixelated; the fur pixel IS --coral, the mech's plate IS --ink-dim and its visor IS --accent, read off the canvas. Every name is monospace, at UX-02's 18px floor or above, unclipped, no two names overlap, and a HIT TEST at every name's centre and four inner corners finds that name — nothing is painted over any of them. The shell words are at the floor too and the way back to formation is a visible text control. TURNED UNDER D-47: there are two shell words now, the heading and the way back; the sentence that stood under the heading as #scene-hint is gone from the scene and is the heading's title, where Layer C reads it. And not one word in the scene names an outcome — FF1's end-of-battle banner is the verdict D-26 forbids`,
      d42Look.first && d42Look.aboveLedger && d42Look.outsideBoard && d42Look.dataK === 0
      && d42Look.bottom <= d42Look.vh
      && d42Look.rim === d42Ink && d42Look.fill === d42FillProbe
      && d42r0.sprites.length === 12 && d42Inside(d42r0)
      && d42Look.pixelated === 'pixelated'
      && d42Px[0] === d42Coral && d42Px[1] === d42Steel && d42Px[2] === d42Accent
      && d42r0.sprites.every((s) => s.font >= 18 && /mono/i.test(s.family) && !s.clipped && s.name !== '')
      && d42NamesApart(d42r0) === '' && d42r0.sprites.every((s) => s.onTop)
      && d42Look.minWord >= 18 && d42Look.resetText === 'Back to formation' && d42Look.resetShown
      && d42Look.hintGone === true && /^Drag anyone anywhere./.test(d42Look.headTitle)
      && d42Verdict === false && d42r0.panel === true,
      { look: d42Look, fill: [d42Fill, d42FillProbe], px: d42Px, want: [d42Coral, d42Steel, d42Accent],
        apart: d42NamesApart(d42r0), inside: d42Inside(d42r0) });

    // ── 32a. MOVE A TOKEN AND THE SPRITES FOLLOW. ──
    await pg.evaluate(() => {
      document.documentElement.style.setProperty('--coral', '#123456');
      document.documentElement.style.setProperty('--accent', '#654321');
      App.state.invalidate(); App.state.flush();
    });
    const d42Moved = [await d42Pixel('c1', 9, 4), await d42Pixel('m1', 6, 4)];
    await pg.evaluate(() => {
      document.documentElement.style.removeProperty('--coral');
      document.documentElement.style.removeProperty('--accent');
      App.state.invalidate(); App.state.flush();
    });
    const d42Back = [await d42Pixel('c1', 9, 4), await d42Pixel('m1', 6, 4)];
    ok(`${tag}: 32a. D-42 — THE SPRITES' COLOURS ARE DERIVED, NOT TYPED: --coral and --accent are moved on the root, one frame is painted, and the fur pixel and the visor pixel read the new tokens; put back, they read the old ones. 107f catches a literal being written into the stylesheet; this catches a colour that stopped deriving for any reason at all, including one painted by script`,
      d42Moved[0] === 'rgb(18, 52, 86)' && d42Moved[1] === 'rgb(101, 67, 33)'
      && d42Back[0] === d42Coral && d42Back[1] === d42Accent,
      { moved: d42Moved, back: d42Back });

    // ── 32b. A RENAMED UNIT. No op renames one; the state is written through [S03]'s
    // restore with a long name, which is what the day a rename op lands will look like.
    const d42c3Before = await pg.evaluate(() => {
      window.__d42c3 = document.querySelector('#scene-field > [data-scn-unit="c3"]');
      const s = JSON.parse(JSON.stringify(App.state.get()));
      s.build.cats.units[2].name = 'Whiskerton the Brave';
      App.state.restore(JSON.stringify(s));
      App.state.flush();
      return true;
    });
    const d42rn = await d42Read();
    const d42c3 = d42Sprite(d42rn, 'c3');
    const d42c3Same = await pg.evaluate(() => window.__d42c3 === document.querySelector('#scene-field > [data-scn-unit="c3"]'));
    await d42Shot('renamed');
    ok(`${tag}: 32b. D-42 — A RENAMED UNIT IS DRAWN RENAMED ON ITS FRAME, IN THE SAME NODE: Cat 3 renamed "Whiskerton the Brave" through [S03]'s writer shows that name as its label and its accessible name, the sprite node is the one that was there before (a rename rebuilds nothing), the long name wraps inside the sprite's own width rather than running out of it, and every sprite is still inside the field with no two names overlapping. AND NO NAME IS UNDER A PICTURE: the first screenshot of this cell showed "Whiskerton the Brave" broken mid-word into three lines running down under Cat 6's sprite while this cell was green, so every name is now hit-tested at its centre and four inner corners and must be what the hit finds`,
      d42c3Before && d42c3.name === 'Whiskerton the Brave' && d42c3.aria === 'Whiskerton the Brave'
      && d42c3Same && d42c3.nl >= d42c3.l - 1 && d42c3.nr <= d42c3.r + 1 && !d42c3.clipped
      && d42Inside(d42rn) && d42NamesApart(d42rn) === '' && d42rn.sprites.every((s) => s.onTop),
      { c3: d42c3, same: d42c3Same, apart: d42NamesApart(d42rn) });

    // ── 32c. A UNIT RULED DEAD LIES DOWN; A UNIT AT ZERO HEALTH STANDS. ──
    await d42Fresh();
    await pg.evaluate(() => {
      App.ops.dispatch('setAlive', { side: 'cats', unitId: 'c2', value: false });
      App.ops.dispatch('setUnitHp', { side: 'mechs', unitId: 'm2', value: 0 });
      App.state.flush();
    });
    await pg.waitForTimeout(250);
    const d42Dead = await pg.evaluate(() => {
      const read = (u) => {
        const n = document.querySelector(`#scene-field > [data-scn-unit="${u}"]`);
        if (!n || !n.querySelector('canvas')) { return {}; }
        const cs = getComputedStyle(n.querySelector('canvas'));
        return { down: n.classList.contains('scn-unit--down'), aria: n.getAttribute('aria-label'),
          transform: cs.transform, filter: cs.filter };
      };
      return { c2: read('c2'), m2: read('m2'), c1: read('c1'),
        m2hp: App.state.get().fight.mechs.units[1].hp, m2alive: App.state.get().fight.mechs.units[1].alive };
    });
    const d42rd = await d42Read();
    await d42Shot('dead');
    ok(`${tag}: 32c. D-42 — A UNIT RULED DEAD LIES DOWN AND GOES GREY, AND A UNIT AT ZERO HEALTH NOBODY RULED ON STANDS IN FULL COLOUR: Cat 2, ruled dead through setAlive, has the down class, a turned canvas (a real transform, not "none") and a grayscale filter, and its accessible name says it is ruled dead; Mech 2 at zero health is still alive in the fight slice and its canvas is untransformed and unfiltered, exactly like Cat 1's. Read from the stored flag and never from the health (D-00d)`,
      d42Dead.c2.down && d42Dead.c2.transform !== 'none' && /grayscale/.test(d42Dead.c2.filter)
      && d42Dead.c2.aria === born.c2 + ', ruled dead'
      && d42Dead.m2hp === 0 && d42Dead.m2alive === true
      && !d42Dead.m2.down && d42Dead.m2.transform === 'none' && d42Dead.m2.filter === 'none'
      && d42Dead.m2.aria === born.m2
      && d42Dead.c1.transform === 'none' && d42Inside(d42rd) && d42rd.sprites.every((s) => s.onTop),
      d42Dead);

    // ── 32d. A REAL DRAG INSIDE THE SCENE. ──
    await d42Fresh();
    const d42p0 = await d42Read();
    const d42T = { x: Math.round(d42p0.field.l + d42p0.field.w * 0.5), y: Math.round(d42p0.field.t + d42p0.field.h * 0.62) };
    const d42g1 = await d42Drag('c1', d42T.x, d42T.y);
    const d42p1 = await d42Read();
    const d42c1 = d42Sprite(d42p1, 'c1');
    const d42c1Same = await pg.evaluate(() => window.__d42node === document.querySelector('#scene-field > [data-scn-unit="c1"]'));
    ok(`${tag}: 32d. D-42 — A REAL DRAG MOVES ONE SPRITE TO WHERE IT WAS LET GO AND WRITES NOTHING ELSE. Cat 1 is taken at its centre with page.mouse and let go in the middle of the field: its centre lands within two pixels of the release point, the node under the pointer is the node that was pressed, and it was HELD in flight. The place is kept in the scene and in localStorage under cvm.v1.scene. The state is byte-identical, and neither the commit count nor the undo depth moved — no op, no commit, no undo entry, no build code`,
      d42g1.flight.same === true && JSON.parse(d42g1.flight.held || '{}').live === true
      && Math.abs(d42c1.cx - d42T.x) <= 2 && Math.abs(d42c1.cy - d42T.y) <= 2 && d42c1Same
      && d42J(d42p1.saved).c1 !== undefined && d42p1.stored !== null
      && d42J(d42p1.stored).c1 !== undefined
      && JSON.stringify(d42J(d42p1.stored).c1) === JSON.stringify(d42J(d42p1.saved).c1)
      && d42p1.state === d42p0.state && d42p1.commits === d42p0.commits && d42p1.depth === d42p0.depth
      && d42p1.held === '' && d42p1.panel === true,
      { target: d42T, c1: d42c1, flight: d42g1.flight, saved: d42p1.saved, stored: d42p1.stored,
        commits: [d42p0.commits, d42p1.commits], depth: [d42p0.depth, d42p1.depth] });

    // ── 32e. OFF THE EDGE: CLAMPED. ──
    const d42Off = await pg.evaluate(() => {
      const f = document.getElementById('scene-field').getBoundingClientRect();
      return { x: window.innerWidth - 3, y: Math.min(window.innerHeight - 3, Math.round(f.bottom + 140)), fr: f.right, fb: f.bottom };
    });
    await d42Drag('m1', d42Off.x, d42Off.y);
    const d42p2 = await d42Read();
    const d42m1 = d42Sprite(d42p2, 'm1');
    ok(`${tag}: 32e. D-42 — A DRAG OFF THE EDGE IS CLAMPED: Mech 1 dragged past the field's right side and below its foot, to a point outside the frame, comes to rest wholly inside the field, pressed into its bottom-right corner (within two pixels of both sides), and the saved share is the clamped one — what is saved is what is drawn`,
      d42Off.x > d42Off.fr && d42Off.y > d42Off.fb
      && d42Inside(d42p2) && Math.abs(d42m1.r - d42p2.field.r) <= 2 && Math.abs(d42m1.b - d42p2.field.b) <= 2
      && JSON.stringify(d42J(d42p2.saved).m1) === JSON.stringify(String(d42m1.at).split(',').map(Number)),
      { off: d42Off, m1: d42m1, field: d42p2.field, saved: d42p2.saved });

    // ── 32f. A DRAG WHILE AN ADVANCE COMMITS. ──
    const d42Round0 = await pg.evaluate(() => App.state.get().fight.round);
    const d42c4From = d42Sprite(d42p2, 'c4');
    const d42T4 = { x: Math.round(d42p2.field.l + d42p2.field.w * 0.35), y: Math.round(d42p2.field.t + d42p2.field.h * 0.45) };
    const d42g4 = await d42Drag('c4', d42T4.x, d42T4.y, async () => {
      await pg.evaluate(() => App.ops.dispatch('advanceRound', {}));
      await pg.waitForTimeout(120);
      return pg.evaluate(() => ({
        round: App.state.get().fight.round,
        same: window.__d42node === document.querySelector('#scene-field > [data-scn-unit="c4"]'),
        attached: !!window.__d42node && window.__d42node.isConnected,
        held: !!window.__d42node && window.__d42node.classList.contains('scn-unit--held'),
        commits: App.state.stats().commits
      }));
    });
    const d42p3 = await d42Read();
    const d42c4 = d42Sprite(d42p3, 'c4');
    ok(`${tag}: 32f. D-42 — A DRAG SURVIVES AN ADVANCE COMMITTING UNDER IT: Cat 4 is held half-way across the field when a real Advance is dispatched and its frame paints. The round moves, and the sprite under the pointer is STILL THE SAME NODE, still attached, still held — the keyed repaint rebuilt nothing (plan 05-10's measured defect and D-37 probe G's, answered by node identity). The drag then carries on to its release point, where Cat 4's centre lands within two pixels; the Advance's commit is the only one across the whole gesture. Cat 4 lands overlapping Cat 3, which is where this cell drops it on purpose, and every name on the field — Cat 3's included — is still what a hit test finds at its centre and inner corners: the first screenshot had Cat 4's sprite painted over Cat 3's name`,
      d42g4.mid.round === d42Round0 + 1 && d42g4.mid.same && d42g4.mid.attached && d42g4.mid.held
      && d42g4.flight.same === true
      && Math.abs(d42c4.cx - d42T4.x) <= 2 && Math.abs(d42c4.cy - d42T4.y) <= 2
      && d42p3.commits === d42p2.commits + 1 && d42g4.mid.commits === d42p3.commits
      && d42J(d42p3.saved).c4 !== undefined && d42p3.panel === true
      && d42p3.sprites.every((s) => s.onTop),
      { from: d42c4From, target: d42T4, mid: d42g4.mid, c4: d42c4, commits: [d42p2.commits, d42p3.commits] });
    await pg.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
    await pg.waitForTimeout(120);
    await d42Shot('dragged');

    // ── 32g. A RELOAD BRINGS THE PLACES BACK. ──
    const d42SavedBefore = d42p3.saved;
    await pg.reload();
    await pg.waitForTimeout(600);
    if (await pg.evaluate(() => document.querySelector('#app').dataset.view) !== 'fight') {
      await pg.click('#view-fight'); await pg.waitForTimeout(250);
    }
    await pg.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
    await pg.waitForTimeout(150);
    const d42p4 = await d42Read();
    const d42Kept = d42J(d42SavedBefore);
    const d42Restored = ['c1', 'm1', 'c4'].map((u) => {
      const sp = d42Sprite(d42p4, u);
      return Array.isArray(d42Kept[u]) && sp.at === d42Kept[u].join(',')
        && Math.abs(sp.cx - (d42p4.field.l + d42Kept[u][0] * d42p4.field.w)) <= 2;
    });
    await d42Shot('reloaded');
    ok(`${tag}: 32g. D-42 — A RELOAD BRINGS EVERY PLACE BACK: after three real drags the page is reloaded, and Cat 1, Mech 1 and Cat 4 each stand at the share they were left at (read off the sprite and off its drawn centre), while the rest stand in formation — the store is best-effort and on this machine it held`,
      d42Restored.every(Boolean) && d42p4.saved === d42SavedBefore && d42Inside(d42p4),
      { restored: d42Restored, before: d42SavedBefore, after: d42p4.saved });

    // ── 32h. A REMOVED UNIT'S SAVED PLACE IS DROPPED. ──
    const d42T9 = { x: Math.round(d42p4.field.l + d42p4.field.w * 0.42), y: Math.round(d42p4.field.t + d42p4.field.h * 0.3) };
    await d42Drag('c9', d42T9.x, d42T9.y);
    const d42With9 = await d42Read();
    await pg.evaluate(() => {
      if (App.state.get().fight !== null) { App.ops.endFight(); }
      App.ops.dispatch('removeUnit', { side: 'cats', unitId: 'c9' });
      App.state.flush();
    });
    const d42Without9 = await d42Read();
    await pg.evaluate(() => { App.ops.dispatch('addUnit', { side: 'cats' }); App.state.flush(); });
    const d42New9 = await d42Read();
    const d42n9 = d42Sprite(d42New9, 'c9');
    const d42Slot9 = await pg.evaluate(() => App.render.sceneSlot('cats', 8, 9, 3).join(','));
    ok(`${tag}: 32h. D-42 — A REMOVED UNIT'S SAVED PLACE IS DROPPED, FROM THE SCENE AND FROM THE STORE: Cat 9 is dragged (its place kept in both), then removed — and its place is gone from both on that frame. The cat addUnit next names c9 stands in its formation slot, not where the old Cat 9 was left`,
      d42J(d42With9.saved).c9 !== undefined && d42J(d42With9.stored).c9 !== undefined
      && d42J(d42Without9.saved).c9 === undefined && d42J(d42Without9.stored).c9 === undefined
      && d42Without9.sprites.filter((s) => s.id === 'c9').length === 0
      && d42n9 !== undefined && d42n9.at === d42Slot9,
      { with9: d42With9.saved, without9: [d42Without9.saved, d42Without9.stored], new9: d42n9 && d42n9.at, slot: d42Slot9 });

    // ── 32i. BACK TO FORMATION — by a real click, and from the keyboard. ──
    await d42Fresh();
    const d42q0 = await d42Read();
    await d42Drag('c1', Math.round(d42q0.field.l + d42q0.field.w * 0.5), Math.round(d42q0.field.t + d42q0.field.h * 0.5));
    await d42Drag('m3', Math.round(d42q0.field.l + d42q0.field.w * 0.6), Math.round(d42q0.field.t + d42q0.field.h * 0.4));
    const d42q1 = await d42Read();
    await pg.click('#scene-reset'); await pg.waitForTimeout(200);
    const d42q2 = await d42Read();
    await d42Drag('c5', Math.round(d42q0.field.l + d42q0.field.w * 0.55), Math.round(d42q0.field.t + d42q0.field.h * 0.8));
    const d42q3 = await d42Read();
    await pg.focus('#scene-reset');
    await pg.keyboard.press('Enter');
    await pg.waitForTimeout(200);
    const d42q4 = await d42Read();
    const d42Home = (rd) => rd.sprites.every((s) => s.at === (d42q0.sprites.filter((z) => z.id === s.id)[0] || {}).at);
    // Enter is one of [S07.1]'s NAV_KEYS, so the keyboard press turns ui.kbdNav on — the
    // shipped focus-ring writer, one commitUi, never undoable. That is the ONLY thing
    // allowed to move across it, and it is compared key by key rather than excused.
    const d42Slices = (rd) => { const s = JSON.parse(rd.state); return JSON.stringify([s.build, s.fight]); };
    const d42UiMoved = (a, b) => {
      const x = JSON.parse(a.state).ui; const y = JSON.parse(b.state).ui;
      return Object.keys(Object.assign({}, x, y)).filter((k) => JSON.stringify(x[k]) !== JSON.stringify(y[k]));
    };
    await d42Shot('formation');
    ok(`${tag}: 32i. D-42 — BACK TO FORMATION PUTS EVERYONE BACK, BY MOUSE AND BY KEYBOARD: two sprites dragged away, the control clicked, and every sprite is in its formation slot, nothing is kept in the scene and the store holds an empty layout — and the click committed NOTHING. Dragged again and the control reached from the keyboard (focus, Enter): everyone home again, the build, the fight and the undo depth unmoved, and the only thing that changed anywhere in the state is ui.kbdNav, which Enter turns on everywhere on this page ([S07.1]'s focus-ring writer), read key by key`,
      !d42Home(d42q1) && d42Home(d42q2) && d42q2.saved === '{}' && d42q2.stored === '{}'
      && d42q2.commits === d42q1.commits && d42q2.state === d42q1.state
      && !d42Home(d42q3) && d42Home(d42q4) && d42q4.saved === '{}'
      && d42Slices(d42q4) === d42Slices(d42q3) && d42q4.depth === d42q3.depth
      && JSON.stringify(d42UiMoved(d42q3, d42q4)) === JSON.stringify(
        JSON.parse(d42q3.state).ui.kbdNav === true ? [] : ['kbdNav']),
      { moved: d42q1.saved, afterClick: [d42q2.saved, d42q2.stored, d42q1.commits, d42q2.commits],
        afterKey: d42q4.saved, uiMoved: d42UiMoved(d42q3, d42q4), depth: [d42q3.depth, d42q4.depth] });

    // ── 32j. TWENTY-FOUR A SIDE: every sprite inside, every name legible. ──
    await pg.evaluate(() => { if (App.state.get().fight !== null) { App.ops.endFight(); } App.state.flush(); });
    await toRoster(pg, 24);
    await pg.click('#fight-start'); await pg.waitForTimeout(300);
    await pg.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
    await pg.waitForTimeout(150);
    const d42big = await d42Read();
    const d42bigLook = await pg.evaluate(() => {
      const r = document.getElementById('scene').getBoundingClientRect();
      return { top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY), vh: window.innerHeight };
    });
    note(ch, size.name, 'D-42 scene at 24 a side: top/bottom, field, rows', `${d42bigLook.top}/${d42bigLook.bottom} of ${d42bigLook.vh}, ${Math.round(d42big.field.w)}x${Math.round(d42big.field.h)}, rows ${d42big.rows}`);
    await d42Shot('24');
    /* TURNED IN THE OPEN UNDER D-43, plan 05-D43. This cell asked for a FOUR-row field at 24
       a side. With the mechs drawn at twice the cats' size, four rows of them need the height
       of six cat rows, so the field is six rows: RED recorded first, `rows: "6"` in all four
       columns with every other clause green. The claim itself did not move. */
    ok(`${tag}: 32j. D-42 — TWENTY-FOUR A SIDE, EVERY SPRITE INSIDE THE FRAME AND EVERY NAME LEGIBLE: 48 sprites in a six-row field (four rows under D-42; D-43's big mechs take six), all inside it, every name at the 18px floor or above, monospace, unclipped, and no two names overlapping anywhere`,
      d42big.sprites.length === 48 && d42big.rows === '6' && d42Inside(d42big)
      && d42big.sprites.every((s) => s.font >= 18 && /mono/i.test(s.family) && !s.clipped)
      && d42NamesApart(d42big) === '' && d42big.sprites.every((s) => s.onTop),
      { n: d42big.sprites.length, rows: d42big.rows, inside: d42Inside(d42big), apart: d42NamesApart(d42big),
        field: d42big.field, look: d42bigLook });

    // ── 32k-32n. D-43 — THE MECHS ARE MUCH BIGGER THAN THE CATS. Plan 05-D43.
    // ═════════════════════════════════════════════════════════════════════════════════════
    // "make the mechs much bigger than the cats", read as twice the cats' linear size. Node
    // check 130c reads the ratio off the stylesheet and lays every roster out in pixels; these
    // cells measure the real rectangles: the ratio, a whole number of screen pixels per sprite
    // pixel, no sprite over another sprite or another unit's name, a big mech lying down clear
    // of its own name, a big mech stopping at every side of the frame by its OWN size, and
    // Advance still reachable with 24 big mechs on the tab.
    const d43Hit = (a, b) => a.l < b.r - 1 && b.l < a.r - 1 && a.t < b.b - 1 && b.t < a.b - 1;
    const d43Art = (s) => ({ l: s.cl, r: s.cr, t: s.ct, b: s.cb });
    const d43Nm = (s) => ({ l: s.nl, r: s.nr, t: s.nt, b: s.nb });
    // The first sprite over a sprite, or over ANOTHER unit's name; '' when there is none.
    const d43Clear = (rd) => {
      const n = rd.sprites;
      for (let i = 0; i < n.length; i++) {
        for (let j = 0; j < n.length; j++) {
          if (i === j) { continue; }
          if (j > i && d43Hit(d43Art(n[i]), d43Art(n[j]))) { return 'sprites ' + n[i].id + '/' + n[j].id; }
          if (d43Hit(d43Art(n[i]), d43Nm(n[j]))) { return n[i].id + ' over the name of ' + n[j].id; }
        }
      }
      return '';
    };
    // Every mech's canvas twice every cat's on both axes, every canvas a whole number of screen
    // pixels per sprite pixel, and drawn pixelated. Standing units only: a turned canvas's box
    // is the same square, but only a standing one is asked.
    const d43Ratio = (rd) => {
      const up = rd.sprites.filter((s) => !s.down);
      const cats = up.filter((s) => s.id.charAt(0) === 'c');
      const mechs = up.filter((s) => s.id.charAt(0) === 'm');
      const cw = cats.length ? cats[0].cw : 0;
      return { cat: cw, mech: mechs.length ? mechs[0].cw : 0,
        ok: cats.length > 0 && mechs.length > 0 && cw > 0
          && cats.every((s) => Math.abs(s.cw - cw) < 0.5 && Math.abs(s.chh - cw) < 0.5)
          && mechs.every((s) => Math.abs(s.cw - 2 * cw) < 0.5 && Math.abs(s.chh - 2 * cw) < 0.5)
          && up.every((s) => s.cbw === 16 && Math.abs(s.cw / 16 - Math.round(s.cw / 16)) < 0.01
            && s.ir === 'pixelated') };
    };

    // ── 32k. TWENTY-FOUR A SIDE WITH BIG MECHS: nothing over anything, and Advance reachable.
    const d43bigRatio = d43Ratio(d42big);
    const d43Adv = await pg.evaluate(async () => {
      const span = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const out = [];
      for (const frac of [0, 0.25, 0.5, 0.75, 1]) {
        window.scrollTo(0, Math.round(span * frac));
        await new Promise((r) => setTimeout(r, 420));
        const a = document.querySelector('#fightbar [data-fg="advance"]');
        const ar = a ? a.getBoundingClientRect() : null;
        const rows = Array.from(document.querySelectorAll('#decl-cats .fg-row'))
          .map((n) => n.getBoundingClientRect()).filter((r) => r.bottom > 0 && r.top < window.innerHeight);
        out.push({ y: Math.round(window.scrollY), rowsInView: rows.length,
          adv: ar ? Math.round(ar.top) + '-' + Math.round(ar.bottom) : 'MISSING',
          whole: !!ar && ar.top >= 0 && ar.bottom <= window.innerHeight && ar.height > 0 });
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 420));
      return out;
    });
    const d43AdvRows = d43Adv.filter((s) => s.rowsInView > 0);
    note(ch, size.name, 'D-43 sprite px cat / mech (9v3 and 24v24 alike)', `${d43bigRatio.cat} / ${d43bigRatio.mech}`);
    note(ch, size.name, 'D-43 Advance at 24 a side over five offsets', d43Adv.map((s) => `y${s.y}:${s.adv}/${s.rowsInView}rows`).join('  '));
    ok(`${tag}: 32k. D-43 — TWENTY-FOUR A SIDE WITH MECHS TWICE THE CATS' SIZE: every mech's canvas is twice every cat's on both axes, every canvas is a whole number of screen pixels per sprite pixel and drawn pixelated, NO SPRITE OVERLAPS ANOTHER SPRITE OR ANOTHER UNIT'S NAME anywhere among the 48, and the field grew to six rows to hold them. And ADVANCE IS STILL REACHABLE — the rule D-31 and D-33 set, driven the way cell 18c drives it: at every page offset where a picker row is on screen, the Advance control is wholly on screen with it`,
      d43bigRatio.ok && d43Clear(d42big) === '' && d42big.rows === '6'
      && d43AdvRows.length > 0 && d43AdvRows.every((s) => s.whole),
      { ratio: d43bigRatio, clear: d43Clear(d42big), rows: d42big.rows, advance: d43Adv });

    // ── 32l. THE SHIPPED 9v3: three big mechs in one row, and the scene no taller. ──
    await d42Fresh();
    const d43s0 = await d42Read();
    const d43sRatio = d43Ratio(d43s0);
    const d43Mechs = ['m1', 'm2', 'm3'].map((u) => d42Sprite(d43s0, u));
    const d43sLook = await pg.evaluate(() => {
      const r = document.getElementById('scene').getBoundingClientRect();
      return { top: Math.round(r.top + window.scrollY), bottom: Math.round(r.bottom + window.scrollY), vh: window.innerHeight };
    });
    note(ch, size.name, 'D-43 shipped scene top/bottom, field', `${d43sLook.top}/${d43sLook.bottom} of ${d43sLook.vh}, ${Math.round(d43s0.field.w)}x${Math.round(d43s0.field.h)} rows ${d43s0.rows}`);
    await pg.locator('#scene').screenshot({ path: path.join(process.env.SHOT_DIR || tmpdir(), `d43-fresh-${ch}-${size.name}.png`) });
    ok(`${tag}: 32l. D-43 — THE SHIPPED BOARD: each of the three mechs is drawn at TWICE a cat's size on both axes (96px against 48, 128px against 64 on a projector-sized window — four times the area), a whole number of screen pixels per sprite pixel and pixelated; the three stand in ONE ROW, so the field keeps D-42's three rows and the scene is still whole on screen at load; no sprite overlaps another sprite or another unit's name, and every name is still what a hit test finds at its centre and four inner corners`,
      d43sRatio.ok && d43s0.rows === '3' && d43sLook.bottom <= d43sLook.vh
      && d43Mechs.every((m) => m.cy !== undefined && Math.abs(m.cy - d43Mechs[0].cy) < 1)
      && d43Clear(d43s0) === '' && d42Inside(d43s0) && d43s0.sprites.every((s) => s.onTop)
      && d42NamesApart(d43s0) === '',
      { ratio: d43sRatio, rows: d43s0.rows, look: d43sLook, mechs: d43Mechs.map((m) => [m.cx, m.cy]),
        clear: d43Clear(d43s0) });

    // ── 32m. A BIG MECH RULED DEAD lies down grey and clears its own name. ──
    await pg.evaluate(() => {
      App.ops.dispatch('setAlive', { side: 'mechs', unitId: 'm3', value: false });
      App.state.flush();
    });
    await pg.waitForTimeout(400);
    const d43d = await d42Read();
    const d43m3 = d42Sprite(d43d, 'm3');
    await pg.locator('#scene').screenshot({ path: path.join(process.env.SHOT_DIR || tmpdir(), `d43-dead-${ch}-${size.name}.png`) });
    ok(`${tag}: 32m. D-43 — A BIG MECH RULED DEAD LIES DOWN GREY AND CLEARS ITS OWN NAME: Mech 3, ruled dead through setAlive, has the down class, a turned canvas and a grayscale filter, and the turned canvas's own rectangle ends ABOVE the top of its name — nothing of the lying mech is over the words that say who it is, and the name is what a hit test finds. No sprite overlaps another unit's name either`,
      d43m3.down === true && d43m3.ctf !== 'none' && d43m3.ctf !== '' && /grayscale/.test(d43m3.cf)
      && d43m3.cb <= d43m3.nt + 0.5 && d43m3.onTop === true && d43Clear(d43d) === ''
      && d43m3.aria === born.m3 + ', ruled dead',
      { m3: d43m3, clear: d43Clear(d43d) });

    // ── 32n. A BIG MECH DRAGGED TO EVERY SIDE STOPS THERE BY ITS OWN SIZE. ──
    const d43Edges = [];
    for (const side of ['left', 'top', 'right', 'bottom']) {
      const f = (await d42Read()).field;
      const vw = await pg.evaluate(() => [window.innerWidth, window.innerHeight]);
      const tgt = {
        left: { x: Math.max(3, Math.round(f.l - 40)), y: Math.round(f.t + f.h * 0.5) },
        top: { x: Math.round(f.l + f.w * 0.5), y: Math.max(3, Math.round(f.t - 40)) },
        right: { x: Math.min(vw[0] - 3, Math.round(f.r + 40)), y: Math.round(f.t + f.h * 0.5) },
        bottom: { x: Math.round(f.l + f.w * 0.5), y: Math.min(vw[1] - 3, Math.round(f.b + 60)) }
      }[side];
      await d42Drag('m1', tgt.x, tgt.y);
      const rd = await d42Read();
      const m1 = d42Sprite(rd, 'm1');
      const cat = d42Sprite(rd, 'c1');
      const kept = d42J(rd.saved).m1 || [];
      const gap = { left: m1.l - rd.field.l, top: m1.t - rd.field.t, right: rd.field.r - m1.r, bottom: rd.field.b - m1.b }[side];
      // The share the clamp kept is half THIS sprite's own box in from that side — a mech's
      // box, not a cat's, which is what "the clamp uses each sprite's own size" means.
      const want = { left: (m1.w / 2) / rd.field.w, top: (m1.h / 2) / rd.field.h,
        right: 1 - (m1.w / 2) / rd.field.w, bottom: 1 - (m1.h / 2) / rd.field.h }[side];
      const got = (side === 'left' || side === 'right') ? kept[0] : kept[1];
      const beyond = { left: tgt.x < f.l, top: tgt.y < f.t, right: tgt.x > f.r, bottom: tgt.y > f.b }[side];
      await pg.locator('#scene').screenshot({ path: path.join(process.env.SHOT_DIR || tmpdir(), `d43-edge-${side}-${ch}-${size.name}.png`) });
      d43Edges.push({ side, beyond, gap: Math.round(gap * 10) / 10, want: Math.round(want * 10000) / 10000, got,
        mechH: m1.h, catH: cat.h, inside: d42Inside(rd), onTop: rd.sprites.every((s) => s.onTop),
        ok: beyond && Math.abs(gap) <= 2 && typeof got === 'number' && Math.abs(got - want) <= 0.0015
          && d42Inside(rd) && rd.sprites.every((s) => s.onTop) && m1.h > cat.h });
    }
    note(ch, size.name, 'D-43 Mech 1 at each side: gap px / kept share', d43Edges.map((e) => `${e.side} ${e.gap}/${e.got}`).join('  '));
    ok(`${tag}: 32n. D-43 — A BIG MECH DRAGGED PAST EVERY SIDE OF THE FRAME STOPS AT THAT SIDE BY ITS OWN SIZE: Mech 1, taken with page.mouse and let go beyond the left, the top, the right and the bottom in turn, rests within two pixels of that side, wholly inside the field, and the share kept for it is half the MECH's own box in from that side (its box is taller than a cat's, so a clamp that used a cat's size would leave it hanging over the frame or short of it). Every name on the field is still what a hit test finds after each drop`,
      d43Edges.length === 4 && d43Edges.every((e) => e.ok),
      d43Edges);

    await pg.evaluate(() => {
      App.render.sceneHome();
      try { localStorage.removeItem('cvm.v1.scene'); } catch (e) { /* none */ }
    });

    // ── 32o-32v. D-44 — 16-BIT ART BY DEFAULT, THE 8-BIT ART KEPT, AND A PICKER. Plan 05-D44.
    // ═════════════════════════════════════════════════════════════════════════════════════
    // "change the bar to FFV level art and redraw, keep the original art and let users pick the
    // generation, use the new one as default". 32-32n above ran with 8-bit selected by a real
    // click and are D-42's and D-43's own cells. These are the 16-bit generation's and the
    // picker's: the default with an empty store, the look against the tokens, the dead, the
    // switch keeping every place, a reload keeping the choice, a store that refuses, 24 a side,
    // and the clamp by the 16-bit mech's own size. Every screenshot is read back.
    const d44Shot = (name) => pg.locator('#scene').screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d44-${name}-${ch}-${size.name}.png`)
    });
    const d44Gen = (p) => (p || pg).evaluate(() => {
      let stored = null;
      try { stored = localStorage.getItem('cvm.v1.scene-art'); } catch (e) { stored = 'BLOCKED'; }
      const btn = (g) => {
        const b0 = document.getElementById('scene-gen-' + g);
        if (!b0) { return {}; }
        const tick = b0.querySelector('.scn-gen-check');
        const nm = b0.querySelector('.scn-gen-name');
        return { pressed: b0.getAttribute('aria-pressed'), on: b0.classList.contains('scn-gen-on'),
          tick: tick ? getComputedStyle(tick).visibility : '', label: nm ? nm.textContent : '',
          font: parseFloat(getComputedStyle(b0).fontSize), shown: b0.getBoundingClientRect().width > 0 };
      };
      return { gen: document.getElementById('scene').dataset.scnGen, now: App.render.sceneGen(), stored,
        b16: btn('16'), b8: btn('8'),
        sizes: Array.from(document.querySelectorAll('#scene-field > .scn-unit canvas')).map((c) => c.width).join(),
        state: JSON.stringify(App.state.get()), commits: App.state.stats().commits, depth: App.state.undoDepth() };
    });
    const d44Rgb = async (css) => ((await d42Tok(css)).match(/\d+/g) || [0, 0, 0]).slice(0, 3).map(Number);
    const d44Mix = (a, b0, t) => 'rgb(' + [0, 1, 2].map((i) => Math.round(a[i] * (1 - t) + b0[i] * t)).join(', ') + ')';
    const d44BackPx = (x, y) => pg.evaluate(([px, py]) => {
      const c = document.getElementById('scene-back');
      if (!c) { return 'MISSING'; }
      const d = c.getContext('2d').getImageData(px, py, 1, 1).data;
      return `rgb(${d[0]}, ${d[1]}, ${d[2]})`;
    }, [x, y]);
    // Where a letter first occurs in a 16-bit sprite, read off the artifact's own map.
    const d44At = (side, letter) => pg.evaluate(([s, c]) => {
      const rows = (App.render.SCENE_SPRITES_16 || {})[s] || [];
      for (let y = 0; y < rows.length; y++) { const x = rows[y].indexOf(c); if (x !== -1) { return [x, y]; } }
      return [0, 0];
    }, [side, letter]);
    // Every cat canvas 24 sprite pixels drawn at 48, every mech 48 drawn at 96 — two screen pixels a
    // sprite pixel exactly, at BOTH window sizes — pixelated, and a mech twice a cat.
    const d44Ratio = (rd) => {
      const up = rd.sprites.filter((s) => !s.down);
      const cats = up.filter((s) => s.id.charAt(0) === 'c');
      const mechs = up.filter((s) => s.id.charAt(0) === 'm');
      return { cat: cats.length ? cats[0].cw : 0, mech: mechs.length ? mechs[0].cw : 0,
        ok: cats.length > 0 && mechs.length > 0
          && cats.every((s) => s.cbw === 24 && Math.abs(s.cw - 48) < 0.5 && Math.abs(s.chh - 48) < 0.5)
          && mechs.every((s) => s.cbw === 48 && Math.abs(s.cw - 96) < 0.5 && Math.abs(s.chh - 96) < 0.5)
          && up.every((s) => s.ir === 'pixelated') };
    };
    const D44_S24 = '24,24,24,24,24,24,24,24,24,48,48,48';
    const D44_S16 = '16,16,16,16,16,16,16,16,16,16,16,16';

    // ── 32o. THE DEFAULT WITH AN EMPTY STORE, AND WHAT 16-BIT LOOKS LIKE. ──
    await pg.evaluate(() => {
      try { localStorage.removeItem('cvm.v1.scene-art'); localStorage.removeItem('cvm.v1.scene'); } catch (e) { /* none */ }
    });
    await pg.reload(); await pg.waitForTimeout(600);
    await d42Fresh();
    const d44g0 = await d44Gen();
    const d44r0 = await d42Read();
    const d44Look = await pg.evaluate(() => {
      const win = getComputedStyle(document.querySelector('.scn-win'));
      const back = document.getElementById('scene-back');
      const wrap = back ? back.parentElement : null;
      const wr = wrap ? wrap.getBoundingClientRect() : null;
      const fr = document.getElementById('scene-field').getBoundingClientRect();
      const bs = back ? getComputedStyle(back) : null;
      const r = document.getElementById('scene').getBoundingClientRect();
      return { rim: [win.borderTopColor, win.borderLeftColor, win.borderBottomColor, win.borderRightColor],
        graded: /linear-gradient/.test(win.backgroundImage),
        fieldPicture: getComputedStyle(document.getElementById('scene-field')).backgroundImage,
        wrapShown: !!wr && wr.width > 0,
        wrapOnField: !!wr && Math.abs(wr.left - fr.left) <= 1 && Math.abs(wr.top - fr.top) <= 1
          && Math.abs(wr.right - fr.right) <= 1 && Math.abs(wr.bottom - fr.bottom) <= 1,
        back: back ? [back.width, back.height, parseFloat(bs.width), parseFloat(bs.height)] : [],
        backIr: bs ? bs.imageRendering : '', wrapPe: wrap ? getComputedStyle(wrap).pointerEvents : '',
        bottom: Math.round(r.bottom + window.scrollY), vh: window.innerHeight,
        text: document.getElementById('scene').innerText };
    });
    const d44Tok = { coral: await d42Tok('var(--coral)'), steel: await d42Tok('var(--ink-dim)'),
      accent: await d42Tok('var(--accent)'), gold: await d42Tok('var(--gold)'),
      ink: await d42Tok('var(--ink)') };
    const d44BgRgb = await d44Rgb('var(--bg)');
    const d44AccRgb = await d44Rgb('var(--accent)');
    const d44FurAt = await d44At('cats', '3');
    const d44PlateAt = await d44At('mechs', '4');
    const d44SensorAt = await d44At('mechs', 's');
    const d44TrimAt = await d44At('mechs', 't');
    const d44Px0 = [await d42Pixel('c1', ...d44FurAt), await d42Pixel('m1', ...d44PlateAt),
      await d42Pixel('m1', ...d44SensorAt), await d42Pixel('m1', ...d44TrimAt), await d44BackPx(0, 0)];
    const d44Want0 = [d44Tok.coral, d44Tok.steel, d44Tok.accent, d44Tok.gold, d44Mix(d44AccRgb, d44BgRgb, 0.72)];
    const d44Verdict = /victor|triumph|winner|loser|\bwin(s|ning)?\b|\bwon\b|defeat|\blost\b|\bbest\b|score|rank/i.test(d44Look.text);
    const d44r0Ratio = d44Ratio(d44r0);
    await d44Shot('fresh');
    note(ch, size.name, 'D-44 16-bit sprite px cat / mech, backdrop css', `${d44r0Ratio.cat} / ${d44r0Ratio.mech}, ${d44Look.back.join('x')}`);
    ok(`${tag}: 32o. D-44 — 16-BIT IS THE DEFAULT AND LOOKS IT: with an empty store and a reload the section says "16", the 16-bit control is pressed with its tick showing and the 8-bit one is not, both labels at UX-02's 18px floor, and nothing is written to the store until somebody presses. Twelve sprites, each cat 24 sprite pixels drawn at 48px and each mech 48 drawn at 96 — two screen pixels a sprite pixel exactly, pixelated, a mech twice a cat — all inside the field, no sprite over a sprite or another unit's name, every name what a hit test finds. THE PIXELS ARE THE TOKENS, read off the canvas: the fur is --coral, the plate --ink-dim, the sensor --accent, the trim --gold, and the backdrop's first pixel is --accent mixed 72% into --bg, mixed by this cell. The window's rim is lit --ink on its top and left and --ink-dim on its bottom and right over a graded fill; the field draws no picture of its own; the backdrop lies exactly on the field, 1024 by 360 drawn at 2048 by 720, pixelated, taking no pointer. The scene is whole on screen at load and names no outcome`,
      d44g0.gen === '16' && d44g0.now === '16' && d44g0.stored === null
      && d44g0.b16.pressed === 'true' && d44g0.b16.on && d44g0.b16.tick === 'visible'
      && d44g0.b8.pressed === 'false' && !d44g0.b8.on && d44g0.b8.tick === 'hidden'
      && d44g0.b16.label === '16-bit' && d44g0.b8.label === '8-bit' && d44g0.b16.font >= 18 && d44g0.b8.font >= 18
      && d44g0.b16.shown && d44g0.b8.shown && d44g0.sizes === D44_S24
      && d44r0.sprites.length === 12 && d44r0Ratio.ok && d42Inside(d44r0) && d43Clear(d44r0) === ''
      && d42NamesApart(d44r0) === '' && d44r0.sprites.every((s) => s.onTop)
      && JSON.stringify(d44Px0) === JSON.stringify(d44Want0)
      && d44Look.rim[0] === d44Tok.ink && d44Look.rim[1] === d44Tok.ink
      && d44Look.rim[2] === d44Tok.steel && d44Look.rim[3] === d44Tok.steel && d44Look.graded
      && d44Look.fieldPicture === 'none' && d44Look.wrapShown && d44Look.wrapOnField
      && JSON.stringify(d44Look.back) === JSON.stringify([1024, 360, 2048, 720]) && d44Look.backIr === 'pixelated'
      && d44Look.wrapPe === 'none' && d44Look.bottom <= d44Look.vh && d44Verdict === false && d44r0.panel === true,
      { gen: d44g0, ratio: d44r0Ratio, px: d44Px0, want: d44Want0, look: Object.assign({}, d44Look, { text: undefined }),
        clear: d43Clear(d44r0), apart: d42NamesApart(d44r0) });

    // ── 32p. MOVE THE TOKENS AND THE 16-BIT PICTURE FOLLOWS, SPRITES AND BACKDROP ALIKE. ──
    await pg.evaluate(() => {
      document.documentElement.style.setProperty('--coral', '#123456');
      document.documentElement.style.setProperty('--ink-dim', '#654321');
      document.documentElement.style.setProperty('--accent', '#224466');
      App.state.invalidate(); App.state.flush();
    });
    const d44Moved = [await d42Pixel('c1', ...d44FurAt), await d42Pixel('m1', ...d44PlateAt), await d44BackPx(0, 0)];
    await pg.evaluate(() => {
      ['--coral', '--ink-dim', '--accent'].forEach((t) => document.documentElement.style.removeProperty(t));
      App.state.invalidate(); App.state.flush();
    });
    const d44Back = [await d42Pixel('c1', ...d44FurAt), await d42Pixel('m1', ...d44PlateAt), await d44BackPx(0, 0)];
    ok(`${tag}: 32p. D-44 — THE 16-BIT COLOURS ARE DERIVED, NOT TYPED: --coral, --ink-dim and --accent are moved on the root and one frame is painted, and the fur pixel, the plate pixel and the backdrop's sky follow them (the sky as the moved --accent mixed into --bg); put back, all three read the tokens again. 107f catches a literal written into the stylesheet; this catches a colour that stopped deriving for any reason, including one painted by script`,
      d44Moved[0] === 'rgb(18, 52, 86)' && d44Moved[1] === 'rgb(101, 67, 33)'
      && d44Moved[2] === d44Mix([34, 68, 102], d44BgRgb, 0.72)
      && d44Back[0] === d44Want0[0] && d44Back[1] === d44Want0[1] && d44Back[2] === d44Want0[4],
      { moved: d44Moved, back: d44Back, want: [d44Want0[0], d44Want0[1], d44Want0[4]] });

    // ── 32q. THE DEAD, IN 16-BIT. ──
    await d42Fresh();
    await pg.evaluate(() => {
      App.ops.dispatch('setAlive', { side: 'cats', unitId: 'c2', value: false });
      App.ops.dispatch('setAlive', { side: 'mechs', unitId: 'm3', value: false });
      App.ops.dispatch('setUnitHp', { side: 'mechs', unitId: 'm2', value: 0 });
      App.state.flush();
    });
    await pg.waitForTimeout(400);
    const d44d = await d42Read();
    const d44c2 = d42Sprite(d44d, 'c2');
    const d44m3 = d42Sprite(d44d, 'm3');
    const d44m2 = d42Sprite(d44d, 'm2');
    const d44m2Fight = await pg.evaluate(() => App.state.get().fight.mechs.units[1]);
    await d44Shot('dead');
    ok(`${tag}: 32q. D-44 — THE DEAD LIE DOWN GREY IN 16-BIT TOO, READ FROM THE STORED FLAG: Cat 2 and Mech 3, ruled dead through setAlive, each wear the down class, a turned canvas and a grayscale filter, and each accessible name says it is ruled dead; the lying mech's turned canvas ends above its own name. Mech 2 at zero health that nobody ruled on is still alive in the fight slice and stands untransformed and in colour. Every name is still what a hit test finds and no sprite is over another unit's name`,
      d44c2.down === true && d44c2.ctf !== 'none' && d44c2.ctf !== '' && /grayscale/.test(d44c2.cf)
      && d44c2.aria === born.c2 + ', ruled dead'
      && d44m3.down === true && d44m3.ctf !== 'none' && /grayscale/.test(d44m3.cf) && d44m3.cb <= d44m3.nt + 0.5
      && d44m3.aria === born.m3 + ', ruled dead'
      && d44m2Fight.hp === 0 && d44m2Fight.alive === true && d44m2.down === false && d44m2.ctf === 'none'
      && d44m2.cf === 'none' && d44m2.aria === born.m2
      && d44d.sprites.every((s) => s.onTop) && d43Clear(d44d) === '',
      { c2: d44c2, m3: d44m3, m2: d44m2, m2fight: d44m2Fight, clear: d43Clear(d44d) });

    // ── 32r. THE PICKER, BY REAL CLICKS, MOVES THE ART AND NOTHING ELSE. ──
    await d42Fresh();
    const d44q0 = await d42Read();
    await d42Drag('c1', Math.round(d44q0.field.l + d44q0.field.w * 0.5), Math.round(d44q0.field.t + d44q0.field.h * 0.55));
    await d42Drag('m1', Math.round(d44q0.field.l + d44q0.field.w * 0.72), Math.round(d44q0.field.t + d44q0.field.h * 0.3));
    const d44q1 = await d42Read();
    const d44gq1 = await d44Gen();
    await pg.evaluate(() => { window.__d44n = Array.from(document.querySelectorAll('#scene-field > .scn-unit')); });
    const d44SameNodes = () => pg.evaluate(() => {
      const now = Array.from(document.querySelectorAll('#scene-field > .scn-unit'));
      return !!window.__d44n && now.length === window.__d44n.length && now.every((n, i) => n === window.__d44n[i]);
    });
    const d44Kept = (a, b0) => a.sprites.length === b0.sprites.length && a.sprites.every((s) => {
      const t = d42Sprite(b0, s.id);
      return t.at === s.at && Math.abs(t.cx - s.cx) <= 1 && Math.abs(t.cy - s.cy) <= 1;
    });
    await pg.click('#scene-gen-8'); await pg.waitForTimeout(200);
    const d44q2 = await d42Read();
    const d44gq2 = await d44Gen();
    const d44same2 = await d44SameNodes();
    await d44Shot('switched-8');
    await pg.click('#scene-gen-16'); await pg.waitForTimeout(200);
    const d44q3 = await d42Read();
    const d44gq3 = await d44Gen();
    const d44same3 = await d44SameNodes();
    ok(`${tag}: 32r. D-44 — THE PICKER, BY REAL CLICKS, MOVES THE ART AND NOTHING ELSE: Cat 1 and Mech 1 are dragged somewhere of their own, then 8-bit is clicked — every sprite is the same node, at the same saved share, its centre within a pixel of where it stood, now drawn at 16; the section says "8", the 8-bit control is pressed and the store holds "8". Then 16-bit is clicked and the same again at 24 and 48, the store holding "16". The saved layout never moved, and across both clicks the state is byte-identical, no commit and no undo entry`,
      !d42Home(d44q1) && d44Kept(d44q1, d44q2) && d44Kept(d44q1, d44q3) && d44same2 && d44same3
      && d44gq2.gen === '8' && d44gq2.sizes === D44_S16 && d44gq2.b8.pressed === 'true' && d44gq2.b16.pressed === 'false'
      && d44gq2.stored === '8'
      && d44gq3.gen === '16' && d44gq3.sizes === D44_S24 && d44gq3.b16.pressed === 'true' && d44gq3.stored === '16'
      && d44q2.saved === d44q1.saved && d44q3.saved === d44q1.saved && d44q3.stored === d44q1.stored
      && d44gq2.state === d44gq1.state && d44gq3.state === d44gq1.state
      && d44gq3.commits === d44gq1.commits && d44gq3.depth === d44gq1.depth && d44q3.panel === true,
      { saved: [d44q1.saved, d44q2.saved, d44q3.saved], gens: [d44gq2.gen, d44gq3.gen], sizes: [d44gq2.sizes, d44gq3.sizes],
        stored: [d44gq2.stored, d44gq3.stored], same: [d44same2, d44same3], kept: [d44Kept(d44q1, d44q2), d44Kept(d44q1, d44q3)],
        commits: [d44gq1.commits, d44gq3.commits], depth: [d44gq1.depth, d44gq3.depth] });

    // ── 32s. A RELOAD KEEPS THE CHOICE, AND AN EMPTY STORE IS 16-BIT. ──
    const d44ToFight = async () => {
      await pg.waitForTimeout(600);
      if (await pg.evaluate(() => document.querySelector('#app').dataset.view) !== 'fight') {
        await pg.click('#view-fight'); await pg.waitForTimeout(250);
      }
      await pg.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
      await pg.waitForTimeout(150);
    };
    await pg.click('#scene-gen-8'); await pg.waitForTimeout(150);
    await pg.reload(); await d44ToFight();
    const d44s1 = await d44Gen();
    const d44s1r = await d42Read();
    await pg.click('#scene-gen-16'); await pg.waitForTimeout(150);
    await pg.reload(); await d44ToFight();
    const d44s2 = await d44Gen();
    await pg.evaluate(() => { try { localStorage.removeItem('cvm.v1.scene-art'); } catch (e) { /* none */ } });
    await pg.reload(); await d44ToFight();
    const d44s3 = await d44Gen();
    ok(`${tag}: 32s. D-44 — THE CHOICE SURVIVES A RELOAD, AND AN EMPTY STORE IS 16-BIT: 8-bit clicked and the page reloaded comes back 8-bit (section, pressed control, canvases of 16) with Cat 1 and Mech 1 still where they were dragged; 16-bit clicked and reloaded comes back 16-bit; and with the key taken out of the store a reload is 16-bit again with nothing written. The store is best-effort, and on this machine it held`,
      d44s1.gen === '8' && d44s1.stored === '8' && d44s1.b8.pressed === 'true' && d44s1.sizes === D44_S16
      && ['c1', 'm1'].every((u) => d42Sprite(d44s1r, u).at === d42Sprite(d44q1, u).at)
      && d44s2.gen === '16' && d44s2.stored === '16' && d44s2.b16.pressed === 'true' && d44s2.sizes === D44_S24
      && d44s3.gen === '16' && d44s3.stored === null && d44s3.b16.pressed === 'true' && d44s3.sizes === D44_S24,
      { s1: [d44s1.gen, d44s1.stored, d44s1.sizes], places: ['c1', 'm1'].map((u) => [d42Sprite(d44s1r, u).at, d42Sprite(d44q1, u).at]),
        s2: [d44s2.gen, d44s2.stored], s3: [d44s3.gen, d44s3.stored, d44s3.b16.pressed] });

    // ── 32t. A STORE THAT REFUSES: the picker still works, and nothing breaks. ──
    // A second page whose localStorage getter throws a SecurityError, the way a browser that
    // blocks storage for file:// answers. Its own errors are collected apart from this column's.
    const d44bctx = await b.newContext({ viewport: { width: size.width, height: size.height } });
    await d44bctx.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() { throw new DOMException('The operation is insecure.', 'SecurityError'); }
      });
    });
    const d44bp = await d44bctx.newPage();
    const d44bErrs = [];
    d44bp.on('pageerror', (e) => d44bErrs.push(String(e)));
    d44bp.on('console', (m) => { if (m.type() === 'error') { d44bErrs.push('console: ' + m.text()); } });
    await d44bp.goto(URL_); await d44bp.waitForTimeout(500);
    await d44bp.click('#fight-start'); await d44bp.waitForTimeout(300);
    const d44t0 = await d44Gen(d44bp);
    await d44bp.click('#scene-gen-8'); await d44bp.waitForTimeout(200);
    const d44t1 = await d44Gen(d44bp);
    await d44bp.click('#scene-gen-16'); await d44bp.waitForTimeout(200);
    const d44t2 = await d44Gen(d44bp);
    const d44tPanel = await d44bp.evaluate(() => document.getElementById('err-panel').hidden);
    await d44bctx.close();
    ok(`${tag}: 32t. D-44 — A STORE THAT REFUSES IS THE ORDINARY CASE: on a page whose localStorage throws a SecurityError on every read, the scene opens 16-bit, a click on 8-bit draws 8-bit (canvases of 16, the control pressed) and a click on 16-bit draws 16-bit again, with no page error, no console error and the panel shut. The choice lasts until the page closes, which is what best-effort means`,
      d44t0.stored === 'BLOCKED' && d44t0.gen === '16' && d44t0.sizes === D44_S24
      && d44t1.gen === '8' && d44t1.sizes === D44_S16 && d44t1.b8.pressed === 'true'
      && d44t2.gen === '16' && d44t2.sizes === D44_S24 && d44t2.b16.pressed === 'true'
      && d44bErrs.length === 0 && d44tPanel === true,
      { t0: [d44t0.stored, d44t0.gen, d44t0.sizes], t1: [d44t1.gen, d44t1.sizes], t2: [d44t2.gen, d44t2.sizes],
        errs: d44bErrs.slice(0, 3), panel: d44tPanel });

    // ── 32u. TWENTY-FOUR A SIDE, IN 16-BIT. ──
    await pg.evaluate(() => { if (App.state.get().fight !== null) { App.ops.endFight(); } App.state.flush(); });
    await toRoster(pg, 24);
    await pg.click('#fight-start'); await pg.waitForTimeout(300);
    await pg.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
    await pg.waitForTimeout(150);
    // Everyone back in formation first, by a real click: 32r's two drags came back with 32s's
    // reloads, and the first run of this cell measured Cat 1 standing over Mech 7's name because
    // of them — the cell's board, not the formation's. 32j is preceded by 32i's reset for the same
    // reason.
    await pg.click('#scene-reset'); await pg.waitForTimeout(200);
    const d44big = await d42Read();
    const d44bigRatio = d44Ratio(d44big);
    await d44Shot('24');
    ok(`${tag}: 32u. D-44 — TWENTY-FOUR A SIDE IN 16-BIT: 48 sprites in the same six-row field, every cat 24 pixels drawn at 48 and every mech 48 drawn at 96, all inside, no sprite over another sprite or another unit's name, every name at the 18px floor, monospace, unclipped, apart, and what a hit test finds`,
      d44big.sprites.length === 48 && d44big.rows === '6' && d44bigRatio.ok && d42Inside(d44big)
      && d43Clear(d44big) === '' && d42NamesApart(d44big) === ''
      && d44big.sprites.every((s) => s.font >= 18 && /mono/i.test(s.family) && !s.clipped && s.onTop),
      { n: d44big.sprites.length, rows: d44big.rows, ratio: d44bigRatio, clear: d43Clear(d44big), apart: d42NamesApart(d44big) });

    // ── 32v. A 16-BIT MECH DRAGGED PAST EVERY SIDE STOPS THERE BY ITS OWN SIZE. ──
    await d42Fresh();
    const d44Edges = [];
    for (const side of ['left', 'top', 'right', 'bottom']) {
      const f = (await d42Read()).field;
      const vw = await pg.evaluate(() => [window.innerWidth, window.innerHeight]);
      const tgt = {
        left: { x: Math.max(3, Math.round(f.l - 40)), y: Math.round(f.t + f.h * 0.5) },
        top: { x: Math.round(f.l + f.w * 0.5), y: Math.max(3, Math.round(f.t - 40)) },
        right: { x: Math.min(vw[0] - 3, Math.round(f.r + 40)), y: Math.round(f.t + f.h * 0.5) },
        bottom: { x: Math.round(f.l + f.w * 0.5), y: Math.min(vw[1] - 3, Math.round(f.b + 60)) }
      }[side];
      await d42Drag('m1', tgt.x, tgt.y);
      const rd = await d42Read();
      const m1 = d42Sprite(rd, 'm1');
      const kept = d42J(rd.saved).m1 || [];
      const gap = { left: m1.l - rd.field.l, top: m1.t - rd.field.t, right: rd.field.r - m1.r, bottom: rd.field.b - m1.b }[side];
      const want = { left: (m1.w / 2) / rd.field.w, top: (m1.h / 2) / rd.field.h,
        right: 1 - (m1.w / 2) / rd.field.w, bottom: 1 - (m1.h / 2) / rd.field.h }[side];
      const got = (side === 'left' || side === 'right') ? kept[0] : kept[1];
      d44Edges.push({ side, gap: Math.round(gap * 10) / 10, want: Math.round(want * 10000) / 10000, got, h: m1.h,
        ok: Math.abs(gap) <= 2 && typeof got === 'number' && Math.abs(got - want) <= 0.0015
          && Math.abs(m1.h - 120) <= 1 && d42Inside(rd) && rd.sprites.every((s) => s.onTop) });
    }
    note(ch, size.name, 'D-44 16-bit Mech 1 at each side: gap px / kept share', d44Edges.map((e) => `${e.side} ${e.gap}/${e.got}`).join('  '));
    ok(`${tag}: 32v. D-44 — A 16-BIT MECH DRAGGED PAST EVERY SIDE OF THE FRAME STOPS AT THAT SIDE BY ITS OWN SIZE: Mech 1, whose 16-bit box is 96px of sprite and 24 of name at both window sizes, taken with page.mouse and let go beyond each side in turn, rests within two pixels of it, and the share kept is half its own box in from that side. Every name is still what a hit test finds after each drop`,
      d44Edges.length === 4 && d44Edges.every((e) => e.ok), d44Edges);

    await pg.evaluate(() => {
      App.render.sceneHome();
      App.render.sceneSetGen('16');
      try { localStorage.removeItem('cvm.v1.scene'); localStorage.removeItem('cvm.v1.scene-art'); } catch (e) { /* none */ }
    });
    await d41Fresh();

    // ═════════════════════════════════════════════════════════════════════════════════════
    // ── 33. D-46 — RESOURCE DRAGS ON THE FIGHT TAB, BY REAL POINTERS. Plan 05-D46.
    // ═════════════════════════════════════════════════════════════════════════════════════
    // The developer, from real use: "I can't drag resources around the battle screen." Every
    // drag below is page.mouse on a real token on the fight tab — a reading on a battlefield
    // shape, a row in a side's pool, a reading in a fight reserve — moved past the threshold,
    // across to a target, and let go. The ops below only BUILD a board to drag on; no op is
    // called for any gesture. What lives ONLY here: every drop (it resolves the entity with
    // elementFromPoint), the popup and the nudge opening on a still release, the retarget's
    // ownership of a press, the scene and the drag not capturing each other's pointer, the
    // sentence on screen, the ledger's reading after a real Advance, and all layout.
    const d46Fresh = async (setup) => {
      await pg.evaluate((s) => {
        // The end is PAINTED before the next start: fgRest runs only on a frame with no fight,
        // and it is what clears a half-made retarget. Without this flush an arm left by one
        // cell carried into the next — measured under probe P9, where 33l's popup never opened.
        if (App.state.get().fight !== null) { App.ops.endFight(); App.state.flush(); }
        App.ops.resetToDefaults();
        if (s === 'hp4') { App.ops.setTokenBounds('hp', { min: 0, max: 4 }); }
        App.ops.startFight();
        // An EMPTY undo stack, for d41Fresh's measured reason: the stack is capped.
        App.state.restore(JSON.stringify(App.state.get()));
        App.state.invalidate({ structural: true });
        App.state.flush();
        try { App.render.sceneHome(); } catch (e) { /* the scene's own reset */ }
      }, setup || '');
      if (await pg.evaluate(() => document.querySelector('#app').dataset.view) !== 'fight') {
        await pg.click('#view-fight'); await pg.waitForTimeout(200);
      }
      await pg.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }));
      await pg.waitForTimeout(120);
    };
    const BF = (side, u) => `#state-${side} .bf-unit[data-drg-unit="${u}"]`;
    const FPOOL = (side) => `#state-${side} .fg-team`;
    const d46Line = (side, u, tok) => `${BF(side, u)} .bf-line[data-drg-tok="${tok}"] .tok`;
    const d46Row = (side, tok) => `${FPOOL(side)} .fg-res[data-drg-tok="${tok}"] .tok`;
    const d46Held = (side, tok) => `${FPOOL(side)} .fg-team-held .sym[data-drg-tok="${tok}"] .tok`;
    // Scrolls the page so the source and the target are both on screen, as a student would,
    // and remembers the token, its reading and its entity for the identity clauses.
    const d46Aim = (srcSel, tgtSel) => pg.evaluate(([s, t]) => {
      const src = document.querySelector(s);
      const tgt = document.querySelector(t);
      if (!src || !tgt) return { missing: !src ? s : t };
      const bar = document.getElementById('topbar').getBoundingClientRect().bottom;
      let a = src.getBoundingClientRect();
      let b = tgt.getBoundingClientRect();
      const lo = Math.min(a.top, b.top);
      window.scrollBy({ top: lo - bar - 40, left: 0, behavior: 'instant' });
      a = src.getBoundingClientRect();
      b = tgt.getBoundingClientRect();
      window.__d46src = src;
      window.__d46line = src.closest('[data-drg-tok]');
      window.__d46ent = src.closest('[data-drg-at]');
      return { sx: a.left + a.width / 2, sy: a.top + a.height / 2,
        tx: b.left + Math.min(b.width / 2, 60), ty: b.top + Math.min(b.height / 2, 14),
        onScreen: a.top >= bar && b.top >= bar && a.bottom <= window.innerHeight && b.bottom <= window.innerHeight };
    }, [srcSel, tgtSel]);
    const d46Flight = () => pg.evaluate(() => {
      const key = (n) => n.dataset.drgAt + '/' + (n.dataset.drgUnit || 'pool');
      const all = Array.from(document.querySelectorAll('#fight-state [data-drg-at]'));
      const board = Array.from(document.querySelectorAll('#board [data-drg-at]'));
      const ghost = document.querySelector('#drag-layer .drg-ghost');
      return {
        inFlight: App.interactions.dragInFlight(),
        lit: all.filter((n) => n.classList.contains('drg-lit')).map(key),
        no: all.filter((n) => n.classList.contains('drg-no')).map(key),
        home: all.filter((n) => n.classList.contains('drg-home')).map(key),
        over: all.filter((n) => n.classList.contains('drg-over')).map(key),
        boardLights: board.filter((n) => /drg-(lit|no|home|over)/.test(n.className)).length,
        ghost: !!ghost, ghostPE: ghost ? getComputedStyle(ghost).pointerEvents : null,
        srcSame: !!window.__d46src && window.__d46src.isConnected && window.__d46src.classList.contains('drg-taking'),
        lineSame: !!window.__d46line && window.__d46line.isConnected,
        entSame: !!window.__d46ent && window.__d46ent.isConnected,
        popupShut: document.getElementById('fg-unit').hidden, nudgeShut: document.getElementById('fg-nudge').hidden,
        commits: App.state.stats().commits, depth: App.state.undoDepth(), round: App.state.get().fight.round
      };
    });
    const d46Read = () => pg.evaluate(() => {
      const s = App.state.get();
      const f = s.fight;
      const u = (side, i) => f[side].units[i];
      // Every showing said line on the fight tab: a pool's own, or a column's line under its
      // battlefield (where a shape's refusal is said — no shape carries one).
      const said = Array.from(document.querySelectorAll('#fight-state .drg-said'))
        .filter((p) => !p.hidden).map((p) => (p.classList.contains('fg-field-said')
          ? p.parentNode.id.replace('state-', '') + ' field' : p.parentNode.dataset.drgAt + ' pool') + ': ' + p.textContent);
      const shapes = Array.from(document.querySelectorAll('#fight-state .bf-unit')).map((n) => {
        const r = n.getBoundingClientRect();
        return n.dataset.drgUnit + ':' + Math.round(r.left + window.scrollX) + ',' + Math.round(r.top + window.scrollY) + ',' + Math.round(r.width) + 'x' + Math.round(r.height);
      }).join(' ');
      return {
        round: f.round, shapes, c1: u('cats', 0).hp, c2: u('cats', 1).hp, c3: u('cats', 2).hp, c4: u('cats', 3).hp,
        c5: u('cats', 4).hp, c1s: u('cats', 0).shield, m1: u('mechs', 0).hp, m2: u('mechs', 1).hp,
        m1s: u('mechs', 0).shield, catsAp: f.cats.ap, mechsAp: f.mechs.ap,
        catsRes: JSON.stringify(f.cats.reserve || {}), mechsRes: JSON.stringify(f.mechs.reserve || {}),
        hand: JSON.stringify(f.hand || []), alive: f.cats.units.concat(f.mechs.units).every((x) => x.alive === true),
        code: App.serialize.encode(s.build), depth: App.state.undoDepth(), commits: App.state.stats().commits,
        inFlight: App.interactions.dragInFlight(),
        ghosts: document.querySelectorAll('#drag-layer > *').length,
        lights: document.querySelectorAll('.drg-lit, .drg-no, .drg-home, .drg-over, .drg-taking').length,
        said, panel: document.getElementById('err-panel').hidden,
        popup: document.getElementById('fg-unit').hidden ? '' : document.getElementById('fg-unit').dataset.fgUnit,
        nudge: document.getElementById('fg-nudge').hidden ? '' : document.getElementById('fg-nudge').dataset.fgTok,
        focus: document.activeElement ? (document.activeElement.dataset.k || document.activeElement.tagName) : ''
      };
    });
    const d46Drag = async (srcSel, tgtSel, mid) => {
      const aim = await d46Aim(srcSel, tgtSel);
      if (aim.missing) return { aim, flight: null };
      await pg.mouse.move(aim.sx, aim.sy);
      await pg.mouse.down();
      for (let i = 1; i <= 4; i++) { await pg.mouse.move(aim.sx + i * 3, aim.sy + i * 2); }
      await pg.mouse.move(aim.tx, aim.ty, { steps: 8 });
      await pg.waitForTimeout(80);
      const flight = await d46Flight();
      if (mid) await mid();
      await pg.mouse.up();
      await pg.waitForTimeout(160);
      return { aim, flight };
    };
    const d46SaidBox = async () => {
      await pg.waitForTimeout(700);
      return pg.evaluate(() => {
        const p = Array.from(document.querySelectorAll('#fight-state .drg-said')).find((n) => !n.hidden);
        if (!p) return null;
        const r = p.getBoundingClientRect();
        const bar = document.getElementById('topbar').getBoundingClientRect().bottom;
        return { top: Math.round(r.top), bottom: Math.round(r.bottom), onScreen: r.top >= bar && r.bottom <= window.innerHeight };
      });
    };
    const d46Shot = (name) => pg.screenshot({
      path: path.join(process.env.SHOT_DIR || tmpdir(), `d46-${name}-${ch}-${size.name}.png`)
    });
    const d46Name = (side, u) => `${BF(side, u)} .bf-name`;
    const d46Head = (side) => `${FPOOL(side)} .fg-team-head`;

    // ── 33. THE POOL ON THE FIGHT TAB, AND THE MARKS. ──
    await d46Fresh();
    const d46Layout = await pg.evaluate(() => ['cats', 'mechs'].map((side) => {
      const col = document.getElementById('state-' + side);
      const field = col.querySelector('.fg-field').getBoundingClientRect();
      const pool = col.querySelector('.fg-team');
      const pr = pool.getBoundingClientRect();
      const empty = pool.querySelector('.fg-team-empty');
      const words = [pool.querySelector('.fg-team-head'), pool.querySelector('.fg-team-lbl'), empty];
      const line = col.querySelector('.bf-line.drg-src');
      const row = pool.querySelector('.fg-res.drg-src');
      return {
        below: field.bottom <= pr.top, border: getComputedStyle(pool).borderTopStyle,
        emptyDashed: getComputedStyle(empty).borderTopStyle === 'dashed' && empty.getBoundingClientRect().height > 0,
        emptyText: empty.textContent,
        minFont: Math.min(...words.map((w) => parseFloat(getComputedStyle(w).fontSize))),
        lineTouch: getComputedStyle(line).touchAction, lineCursor: getComputedStyle(line).cursor,
        rowTouch: getComputedStyle(row).touchAction, rowCursor: getComputedStyle(row).cursor,
        rowTokCursor: getComputedStyle(row.querySelector('.fg-res-toks')).cursor,
        apTokens: row.querySelectorAll('.tok').length,
        shapes: col.querySelectorAll('.bf-unit[data-drg-at]').length,
        top: Math.round(pr.top + window.scrollY), bottom: Math.round(pr.bottom + window.scrollY)
      };
    }));
    note(ch, size.name, 'D-46 fight pool top / bottom (cats, document y)', d46Layout[0].top + ' / ' + d46Layout[0].bottom);
    ok(`${tag}: 33. D-46 — THE TEAM RESOURCES ARE EACH SIDE'S POOL ON THE FIGHT TAB: a bordered box under that side's battlefield, opened by the fight RESERVE — empty on a fresh fight and drawn as a dashed drop slot holding the sentence that says what goes there — with the side's action points drawn as TOKENS as well as words (three triangles), so there is something to pick up. Every word the pool adds is at the 18px floor. Every battlefield shape is an entity; every reading on a shape and every pool row is a drag source with touch-action:none; a reading wears the grab cursor, and a pool row — a button a click still opens D-36's nudge from — keeps the pointer cursor with the grab cursor on its tokens`,
      d46Layout.every((s) => s.below && s.border === 'solid' && s.emptyDashed && s.minFont >= 18
        && s.lineTouch === 'none' && s.lineCursor === 'grab' && s.rowTouch === 'none' && s.rowCursor === 'pointer'
        && s.rowTokCursor === 'grab'
        && s.apTokens === 3)
      && d46Layout[0].shapes === 9 && d46Layout[1].shapes === 3
      && d46Layout[0].emptyText === await pg.evaluate(() => App.render.RESERVE_EMPTY),
      d46Layout);

    // ── 33a. UNIT → UNIT ACROSS SIDES: lights, identity, ONE hand ruling, and the picture. ──
    await d46Fresh();
    const a46 = await d46Read();
    const d46A = await d46Drag(d46Line('cats', 'c1', 'hp'), d46Name('mechs', 'm1'), () => d46Shot('inflight-unit-to-unit'));
    const a46b = await d46Read();
    await d46Shot('after-unit-to-unit');
    ok(`${tag}: 33a. D-46 — A REAL DRAG ON THE FIGHT TAB FROM A CAT'S HEALTH ONTO A MECH MOVES ONE, AS ONE HAND RULING. In flight: a FIGHT drag is live carrying health from Cat 1, one ghost in the layer (pointer-events:none), Cat 1 HOME, every other shape and both pools LIT (13), nothing refused, Mech 1 OVER — and NOT ONE LIGHT on the hidden board's cards, because the two tabs' entities share keys. The token, its reading and its shape are the nodes the press landed on, still in the document; no commit landed while live; and the D-37 POPUP NEVER OPENED, because a press that travels is a drag. After the release: Cat 1 3 -> 2 and Mech 1 6 -> 7 on the FIGHT slice, one commit, one undo entry, two hand records, the build code unchanged by one character, nobody marked dead`,
      d46A.aim.onScreen && d46A.flight
      && JSON.parse(d46A.flight.inFlight || '{}').live === true && JSON.parse(d46A.flight.inFlight || '{}').surf === 'fight'
      && d46A.flight.ghost && d46A.flight.ghostPE === 'none'
      && d46A.flight.home.join() === 'cats/c1' && d46A.flight.no.length === 0
      && d46A.flight.lit.length === 2 + 9 + 3 - 1 && d46A.flight.over.join() === 'mechs/m1'
      && d46A.flight.boardLights === 0
      && d46A.flight.srcSame && d46A.flight.lineSame && d46A.flight.entSame
      && d46A.flight.commits === a46.commits && d46A.flight.popupShut === true
      && a46b.c1 === 2 && a46b.m1 === 7 && a46b.commits === a46.commits + 1 && a46b.depth === a46.depth + 1
      && JSON.parse(a46b.hand).length === 2 && a46b.code === a46.code && a46b.alive
      && a46b.inFlight === '' && a46b.ghosts === 0 && a46b.lights === 0 && a46b.panel === true && a46b.popup === '',
      { aim: d46A.aim, flight: d46A.flight, before: a46, after: a46b });

    // ── 33b / 33c. UNIT → ITS OWN POOL, THEN THE RESERVE → A UNIT ON THE OTHER SIDE. ──
    await d46Fresh();
    const b46 = await d46Read();
    const d46B = await d46Drag(d46Line('cats', 'c1', 'hp'), d46Head('cats'));
    const b46b = await d46Read();
    const d46HeldRead = await pg.evaluate(() => {
      const box = document.querySelector('#state-cats .fg-team-held .sym');
      return box ? { tok: box.dataset.drgTok, title: box.getAttribute('title'), n: box.querySelectorAll('.tok').length,
        empty: document.querySelector('#state-cats .fg-team-empty') === null } : null;
    });
    await d46Shot('after-unit-to-pool');
    ok(`${tag}: 33b. D-46 — UNIT → ITS OWN POOL: Cat 1's health dragged onto the Cats' pool on the fight tab goes into the FIGHT reserve — Cat 1 3 -> 2, the reserve holds one — drawn as the type's own token with "1 Health in reserve" on it, the empty sentence gone; the build code has not moved`,
      d46B.aim.onScreen && d46B.flight && d46B.flight.over.join() === 'cats/pool'
      && b46b.c1 === 2 && b46b.catsRes === '{"hp":1}' && b46b.commits === b46.commits + 1 && b46b.code === b46.code
      && d46HeldRead && d46HeldRead.tok === 'hp' && d46HeldRead.n === 1 && d46HeldRead.empty
      && /^1 .* in reserve$/.test(d46HeldRead.title),
      { flight: d46B.flight, before: b46, after: b46b, held: d46HeldRead });
    const d46C = await d46Drag(d46Held('cats', 'hp'), d46Name('mechs', 'm2'));
    const c46 = await d46Read();
    await d46Shot('after-pool-to-other-side');
    ok(`${tag}: 33c. D-46 — THE RESERVE → A UNIT ON THE OTHER SIDE: the health parked in the Cats' fight reserve dragged onto Mech 2 empties the reserve (the key gone, the empty sentence back) and Mech 2 goes 6 -> 7 — any-to-any, one commit`,
      d46C.aim.onScreen && d46C.flight && d46C.flight.home.join() === 'cats/pool' && d46C.flight.over.join() === 'mechs/m2'
      && c46.m2 === 7 && c46.catsRes === '{}' && c46.commits === b46b.commits + 1
      && await pg.evaluate(() => document.querySelector('#state-cats .fg-team-empty') !== null),
      { flight: d46C.flight, after: c46 });

    // ── 33d. SIDE-SCOPE, POOL → POOL. ──
    await d46Fresh();
    const d46d0 = await d46Read();
    const d46D = await d46Drag(d46Row('cats', 'ap'), d46Head('mechs'), () => d46Shot('inflight-side-scope'));
    const d46d1 = await d46Read();
    ok(`${tag}: 33d. D-46 — A SIDE-SCOPE TOKEN MOVES POOL TO POOL ON THE FIGHT TAB: one of the Cats' action points dragged off the pool's own row onto the Mechs' pool — Cats 3 -> 2, Mechs 3 -> 4 on the fight slice. In flight the Cats' pool is HOME, the Mechs' pool the ONLY lit target, and EVERY UNIT ON BOTH SIDES refused — the op's scope rule as a picture. D-36's NUDGE never opened: the press travelled`,
      d46D.aim.onScreen && d46D.flight && d46D.flight.home.join() === 'cats/pool'
      && d46D.flight.lit.join() === 'mechs/pool' && d46D.flight.no.length === 9 + 3 && d46D.flight.nudgeShut === true
      && d46d1.catsAp === 2 && d46d1.mechsAp === 4 && d46d1.commits === d46d0.commits + 1 && d46d1.nudge === '',
      { flight: d46D.flight, before: d46d0, after: d46d1 });

    // ── 33e. A REFUSED DROP, AND ITS SENTENCE READ BACK AT THE DROP. ──
    await d46Fresh();
    const e46 = await d46Read();
    let e46No = null;
    const d46E = await d46Drag(d46Row('cats', 'ap'), d46Name('cats', 'c2'),
      async () => { e46No = await pg.evaluate((s) => document.querySelector(s).classList.contains('drg-no'), BF('cats', 'c2')); });
    const e46b = await d46Read();
    const e46Box = await d46SaidBox();
    const e46Said = await pg.evaluate(() => App.interactions.fightDragAnswers('ap', { side: 'cats', unitId: null })
      .find((a) => a.unitId === 'c2').said);
    await d46Shot('refused-scope');
    ok(`${tag}: 33e. D-46 — A REFUSED DROP ON THE FIGHT TAB SAYS WHY, AT THE DROP. An action point dragged onto Cat 2's shape: over it, the shape reads REFUSED; on release nothing moves and nothing commits, and the Cats' battlefield says the op's sentence on its own line under the cluster — "kept on the whole side, so it cannot be moved onto or off a single unit" — the very sentence the drag's answer carried, ON SCREEN once the page settles, with the error panel shut. AND NOT ONE SHAPE MOVED OR CHANGED SIZE: every shape's rectangle is what it was before the drop — the first build said the sentence INSIDE the shape and the screenshot showed six cats pushed out of sight`,
      d46E.aim.onScreen && e46No === true && e46b.commits === e46.commits && e46b.catsAp === 3
      && e46b.said.length === 1 && e46b.said[0] === 'cats field: ' + e46Said && e46b.shapes === e46.shapes
      && /kept on the whole side, so it cannot be moved onto or off a single unit/.test(e46Said)
      && e46Box !== null && e46Box.onScreen === true && e46b.panel === true,
      { wasNo: e46No, after: e46b, said: e46Said, box: e46Box });

    // ── 33f. A REFUSED BOUND BREACH. ──
    await d46Fresh('hp4');
    const f46 = await d46Read();
    const d46F = await d46Drag(d46Line('cats', 'c1', 'hp'), d46Name('mechs', 'm1'), () => d46Shot('inflight-bound'));
    const f46b = await d46Read();
    const f46Box = await d46SaidBox();
    await d46Shot('refused-bound');
    ok(`${tag}: 33f. D-46 — A DROP PAST A D-35 CEILING IS REFUSED WHOLE ON THE FIGHT TAB. Health bounded to 0-4 while every mech holds six: in flight every mech reads refused and the cats lit; dropping on Mech 1 moves nothing, commits nothing, and the Mechs' battlefield line reads the op's ceiling sentence, naming Mech 1, on screen, with every shape where it was — never a clamp`,
      d46F.aim.onScreen && d46F.flight
      && ['mechs/m1', 'mechs/m2', 'mechs/m3'].every((k) => d46F.flight.no.indexOf(k) !== -1)
      && d46F.flight.lit.indexOf('cats/c2') !== -1
      && f46b.commits === f46.commits && f46b.c1 === 3 && f46b.m1 === 6
      && f46b.said.join() === 'mechs field: ' + born.m1 + ' holds at most 4 "Health", so it cannot take another.'
      && f46b.shapes === f46.shapes
      && f46Box !== null && f46Box.onScreen === true && f46b.panel === true,
      { flight: d46F.flight, after: f46b, box: f46Box });

    // ── 33g. ESCAPE MID-DRAG, THEN A RELEASE OVER A LIT TARGET. ──
    await d46Fresh();
    const g46 = await d46Read();
    const g46Aim = await d46Aim(d46Line('cats', 'c1', 'hp'), d46Name('cats', 'c2'));
    await pg.mouse.move(g46Aim.sx, g46Aim.sy);
    await pg.mouse.down();
    for (let i = 1; i <= 4; i++) { await pg.mouse.move(g46Aim.sx + i * 3, g46Aim.sy + i * 2); }
    await pg.mouse.move(g46Aim.tx, g46Aim.ty, { steps: 6 });
    const g46Live = await d46Flight();
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(80);
    const g46Esc = await d46Read();
    await pg.mouse.up();
    await pg.waitForTimeout(150);
    const g46b = await d46Read();
    ok(`${tag}: 33g. D-46 — ESCAPE CANCELS A FIGHT DRAG IN FLIGHT. Live over a LIT shape, Escape ends it — nothing in flight, no ghost, every light off — and the release over that lit shape writes NOTHING and opens nothing`,
      JSON.parse(g46Live.inFlight || '{}').live === true && g46Live.over.join() === 'cats/c2'
      && g46Esc.inFlight === '' && g46Esc.ghosts === 0 && g46Esc.lights === 0
      && g46b.commits === g46.commits && g46b.c1 === 3 && g46b.c2 === 3 && g46b.popup === '' && g46b.hand === '[]',
      { live: g46Live, esc: g46Esc, after: g46b });

    // ── 33h. A STILL PRESS IS A CLICK: THE POPUP ON A UNIT, THE NUDGE ON A POOL ROW. ──
    await d46Fresh();
    const h46 = await d46Read();
    const h46Aim = await d46Aim(d46Line('cats', 'c1', 'hp'), d46Name('cats', 'c1'));
    await pg.mouse.move(h46Aim.sx, h46Aim.sy);
    await pg.mouse.down();
    await pg.mouse.move(h46Aim.sx + 3, h46Aim.sy + 1);
    const h46Mid = await pg.evaluate(() => [App.interactions.dragInFlight(), document.querySelectorAll('#drag-layer > *').length,
      document.getElementById('fg-unit').hidden]);
    await pg.mouse.up();
    await pg.waitForTimeout(200);
    const h46b = await d46Read();
    // Shut with Escape and not a click on Close: a click WAITS for its target, so under a
    // probe that stops the popup opening it would throw instead of letting this cell fail.
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
    // The shape's NAME is not a reading: a press there opens the popup on the way down, as
    // D-37 built it, with no drag to wait for.
    const h46Name = await pg.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + 8, y: r.top + r.height / 2 }; }, d46Name('cats', 'c3'));
    await pg.mouse.move(h46Name.x, h46Name.y);
    await pg.mouse.down();
    const h46NameDown = await pg.evaluate(() => document.getElementById('fg-unit').dataset.fgUnit || '');
    await pg.mouse.up();
    await pg.waitForTimeout(150);
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
    // A still click on the Cats' action-point row opens D-36's nudge on that row.
    await pg.click(`${FPOOL('cats')} .fg-res[data-drg-tok="ap"]`); await pg.waitForTimeout(200);
    const h46c = await d46Read();
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
    ok(`${tag}: 33h. D-46 — A STILL PRESS IS STILL A CLICK, AND THE CLICK STILL DOES WHAT IT DID. On a reading on Cat 1's shape: down and a 3px wobble leaves a pending press that is never live, draws no ghost and opens NOTHING yet — and the release opens D-37's popup on Cat 1, commits nothing, and leaves the keyboard on the shape, where a mouse open always left it. On a shape's NAME, which is not a reading, the popup opens on the way DOWN exactly as before. And a click on the Cats' action-point row opens D-36's nudge on that row, commits nothing`,
      h46Mid[0] !== '' && JSON.parse(h46Mid[0]).live === false && h46Mid[1] === 0 && h46Mid[2] === true
      && h46b.popup === 'c1' && h46b.commits === h46.commits && h46b.inFlight === '' && h46b.focus === 'fg/bf/cats/c1'
      && h46NameDown === 'c3'
      && h46c.nudge === 'ap' && h46c.commits === h46.commits && h46c.popup === '',
      { mid: h46Mid, afterStill: h46b, nameDown: h46NameDown, afterRow: h46c });

    // ── 33i. NO DRAG WHILE A RETARGET IS HALF MADE. ──
    await d46Fresh();
    await pg.evaluate(() => {
      const a = App.state.get().build.mechs.actions[0];
      App.ops.dispatch('declare', { side: 'mechs', actionId: a.id, by: 'm1', at: 'c1' });
      App.state.invalidate(); App.state.flush();
    });
    await pg.waitForTimeout(150);
    await pg.click('#decl-mechs [data-fg="at"][data-fg-by="m1"]'); await pg.waitForTimeout(250);
    const i46 = await d46Read();
    const i46Armed = await pg.evaluate(() => document.querySelectorAll('#state-cats .bf-unit--lit').length);
    const i46Aim = await d46Aim(d46Line('cats', 'c3', 'hp'), d46Name('cats', 'c4'));
    await pg.mouse.move(i46Aim.sx, i46Aim.sy);
    await pg.mouse.down();
    for (let i = 1; i <= 4; i++) { await pg.mouse.move(i46Aim.sx + i * 3, i46Aim.sy + i * 2); }
    await pg.mouse.move(i46Aim.tx, i46Aim.ty, { steps: 6 });
    const i46Mid = await pg.evaluate(() => [App.interactions.dragInFlight(), document.querySelectorAll('#drag-layer > *').length]);
    await pg.mouse.up();
    await pg.waitForTimeout(200);
    const i46b = await d46Read();
    const i46At = await pg.evaluate(() => (App.state.get().fight.decl.filter((d) => d.by === 'm1')[0] || {}).at);
    ok(`${tag}: 33i. D-46 — WHILE A RETARGET IS HALF MADE, NO DRAG STARTS: the battlefield belongs to the retarget flow. Armed (nine cats lit), a press on Cat 3's health that then travels well past the threshold onto Cat 4 is the RETARGET'S press — the mech's declaration now points at Cat 3 — and nothing goes in flight, no ghost is drawn, no hand ruling is made and Cat 3 still holds three`,
      i46Armed === 9 && i46Mid[0] === '' && i46Mid[1] === 0 && i46At === 'c3'
      && i46b.c3 === 3 && i46b.c4 === 3 && i46b.hand === '[]' && i46b.popup === '',
      { armed: i46Armed, mid: i46Mid, at: i46At, before: i46, after: i46b });

    // ── 33j. A SCENE SPRITE DRAG NEVER MOVES A RESOURCE, AND A RESOURCE DRAG NEVER MOVES A SPRITE. ──
    await d46Fresh();
    const j46 = await d46Read();
    const j46Scene0 = await pg.evaluate(() => App.render.sceneSaid());
    // A sprite: taken from the scene and dragged DOWN past the frame's foot toward the
    // battlefield. Its gesture is the scene's: the sprite is clamped inside the frame, no fight
    // drag is ever in flight, nothing commits.
    const j46Sprite = await pg.evaluate(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      const s = document.querySelector('#scene-field .scn-unit[data-scn-unit="c2"]');
      const r = s.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    });
    await pg.mouse.move(j46Sprite.x, j46Sprite.y);
    await pg.mouse.down();
    for (let i = 1; i <= 4; i++) { await pg.mouse.move(j46Sprite.x + i * 4, j46Sprite.y + i * 3); }
    await pg.mouse.move(j46Sprite.x + 60, j46Sprite.y + 500, { steps: 10 });
    const j46SpriteMid = await pg.evaluate(() => [App.interactions.sceneHeld(), App.interactions.dragInFlight(),
      document.querySelectorAll('#drag-layer > *').length]);
    await pg.mouse.up();
    await pg.waitForTimeout(200);
    const j46b = await d46Read();
    const j46Scene1 = await pg.evaluate(() => App.render.sceneSaid());
    // Then a resource: Cat 1's health, dragged UP onto a scene sprite and let go there. The
    // scene is not an entity, so it is a release over nothing — no move, no refusal, and the
    // sprite under it is not picked up.
    const j46Res = await pg.evaluate(() => {
      const src = document.querySelector('#state-cats .bf-unit[data-drg-unit="c1"] .bf-line[data-drg-tok="hp"] .tok');
      const scene = document.getElementById('scene-field');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      window.scrollBy({ top: src.getBoundingClientRect().bottom - window.innerHeight + 30, left: 0, behavior: 'instant' });
      // The bar is read AFTER the scroll, measured necessary: at the top of the page it is
      // 214px tall at 1366x768 and once scrolled it is 101, so an edge aimed off the first
      // reading sits outside the scroll zone and the page never moves.
      const bar = document.getElementById('topbar').getBoundingClientRect().bottom;
      const a = src.getBoundingClientRect();
      return { sx: a.left + a.width / 2, sy: a.top + a.height / 2, bar, sceneTop: Math.round(scene.getBoundingClientRect().top) };
    });
    await pg.mouse.move(j46Res.sx, j46Res.sy);
    await pg.mouse.down();
    for (let i = 1; i <= 4; i++) { await pg.mouse.move(j46Res.sx + i * 3, j46Res.sy - i * 2); }
    // Up to the sticky bar's edge until the page has scrolled the scene's field into view.
    await pg.mouse.move(j46Res.sx, j46Res.bar + 6, { steps: 10 });
    let j46Field = null;
    for (let i = 0; i < 120; i++) {
      await pg.waitForTimeout(50);
      j46Field = await pg.evaluate(() => {
        const r = document.getElementById('scene-field').getBoundingClientRect();
        return { top: r.top, bottom: r.bottom };
      });
      if (j46Field.bottom > j46Res.bar + 200) break;
    }
    await pg.mouse.move(j46Res.sx, j46Res.bar + 150, { steps: 2 });
    await pg.waitForTimeout(150);
    const j46Over = await pg.evaluate(() => {
      const s = document.querySelector('#scene-field .scn-unit[data-scn-unit="m1"]');
      const r = s.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, onScreen: r.top > 0 && r.bottom < window.innerHeight };
    });
    await pg.mouse.move(j46Over.x, j46Over.y, { steps: 4 });
    await pg.waitForTimeout(80);
    const j46ResMid = await pg.evaluate(() => [App.interactions.dragInFlight(), App.interactions.sceneHeld()]);
    const j46Hit = await pg.evaluate(([x, y]) => { const h = document.elementFromPoint(x, y); return h ? (h.closest('.scn-unit') ? 'sprite' : h.tagName) : null; }, [j46Over.x, j46Over.y]);
    await pg.mouse.up();
    await pg.waitForTimeout(200);
    const j46c = await d46Read();
    const j46Scene2 = await pg.evaluate(() => App.render.sceneSaid());
    ok(`${tag}: 33j. D-46 — THE SCENE AND THE RESOURCE DRAG NEVER CAPTURE EACH OTHER'S POINTER. A SPRITE taken in the scene and dragged down toward the battlefield is the SCENE'S gesture from press to release: it is held, no fight drag goes in flight, no ghost is drawn, and nothing commits — no number on either slice moves. A RESOURCE taken off Cat 1 and carried up, the page scrolling under it at the bar's edge until the scene is in view, and let go ON A SPRITE is the DRAG'S gesture: live the whole way, no sprite is ever held, and the release over the scene — which is not an entity — moves nothing, refuses nothing and says nothing, and the scene's places are exactly where the sprite drag left them`,
      j46SpriteMid[0] !== '' && JSON.parse(j46SpriteMid[0]).live === true && j46SpriteMid[1] === '' && j46SpriteMid[2] === 0
      && j46b.commits === j46.commits && j46b.c1 === 3 && j46b.hand === '[]' && j46Scene1 !== j46Scene0
      && JSON.parse(j46ResMid[0] || '{}').live === true && j46ResMid[1] === '' && j46Hit === 'sprite'
      && j46c.commits === j46.commits && j46c.c1 === 3 && j46c.said.length === 0 && j46c.inFlight === ''
      && j46Scene2 === j46Scene1 && j46c.panel === true,
      { spriteMid: j46SpriteMid, sceneMoved: j46Scene1 !== j46Scene0, resMid: j46ResMid, hit: j46Hit, over: j46Over, field: j46Field, after: j46c });

    // ── 33k. THE LEDGER READS THE MOVE AFTER A REAL ADVANCE — BOTH ENDS, AND THE RESERVE BY NAME. ──
    await d46Fresh();
    await d46Drag(d46Line('cats', 'c1', 'hp'), d46Name('mechs', 'm1'));
    await d46Drag(d46Line('mechs', 'm2', 'shield'), d46Head('mechs'));
    const k46 = await d46Read();
    await pg.click('[data-k="fg/advance"]');
    await pg.waitForTimeout(450);
    const k46Ledger = await pg.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#ledger .ld-row')).slice(-1)[0];
      const facts = rows ? Array.from(rows.querySelectorAll('.ld-fact')) : [];
      return {
        sub: rows ? Array.from(rows.querySelectorAll('.ld-sub')).map((n) => n.textContent) : [],
        said: facts.map((r) => {
          const sym = r.querySelector('.sym');
          return (r.textContent || '').trim() + '|' + (sym ? sym.getAttribute('title') : '');
        })
      };
    });
    const k46b = await d46Read();
    await pg.locator('#ledger').screenshot({ path: path.join(process.env.SHOT_DIR || tmpdir(), `d46-ledger-${ch}-${size.name}.png`) });
    ok(`${tag}: 33k. D-46 — AFTER A REAL ADVANCE THE LEDGER READS BOTH DRAGS AS THE FOUR NUMBERS THEY MOVED, under "Set by hand this round": Cat 1's health 3 to 2 and Mech 1's 6 to 7; Mech 2's shield 3 to 2 and THE MECHS RESERVE 0 to 1 — the reserve named as the op names it in a refusal, never as "Mechs" alone and never as "null". The live list is empty after the Advance`,
      JSON.parse(k46.hand).length === 4 && k46b.round === 2 && k46b.hand === '[]'
      && k46Ledger.sub.some((s) => String(s).indexOf('Set by hand') === 0)
      && k46Ledger.said.length === 4
      && k46Ledger.said[0].indexOf(born.c1 + ' ') === 0 && k46Ledger.said[0].indexOf('Health set by hand, 3 to 2.') !== -1
      && k46Ledger.said[1].indexOf(born.m1 + ' ') === 0 && k46Ledger.said[1].indexOf('Health set by hand, 6 to 7.') !== -1
      && k46Ledger.said[2].indexOf(born.m2 + ' ') === 0 && k46Ledger.said[2].indexOf('Shield set by hand, 3 to 2.') !== -1
      && k46Ledger.said[3].indexOf('The Mechs reserve ') === 0 && k46Ledger.said[3].indexOf('Shield set by hand, 0 to 1.') !== -1
      && k46Ledger.said.every((s) => s.indexOf('null') === -1),
      { before: k46.hand, ledger: k46Ledger, after: [k46b.round, k46b.hand] });

    // ── 33l. TWO DRAGS ARE TWO UNDO ENTRIES, EVEN INSIDE COALESCE_MS; THE CONTROL FOLDS. ──
    await d46Fresh();
    const l46 = await d46Read();
    const l46Aim = await d46Aim(d46Line('cats', 'c3', 'hp'), d46Name('cats', 'c4'));
    const l46Coalesce = await pg.evaluate(() => App.state.COALESCE_MS);
    const l46Fast = async () => {
      const at = await pg.evaluate(() => {
        const n = document.querySelector('#state-cats .bf-unit[data-drg-unit="c3"] .bf-line[data-drg-tok="hp"] .tok');
        const r = n.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      await pg.mouse.move(at.x, at.y);
      await pg.mouse.down();
      await pg.mouse.move(at.x + 8, at.y + 6);
      await pg.mouse.move(l46Aim.tx, l46Aim.ty, { steps: 2 });
      await pg.mouse.up();
      return Date.now();
    };
    const l46Up1 = await l46Fast();
    const l46Up2 = await l46Fast();
    const l46Ms = l46Up2 - l46Up1;
    await pg.waitForTimeout(150);
    const l46b = await d46Read();
    await pg.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); });
    await pg.keyboard.press('Control+z');
    await pg.waitForTimeout(150);
    const l46c = await d46Read();
    // THE CONTROL: the popup's + on Cat 5's health, clicked twice the same distance apart, DOES
    // fold — two commits, one entry — so the window really was open.
    await pg.waitForTimeout(600);
    await pg.click(d46Name('cats', 'c5')); await pg.waitForTimeout(200);
    const lc0 = await d46Read();
    const l46Plus = await pg.evaluate(() => { const b = document.querySelector('#fg-unit-rows [data-fg="unudge"][data-fg-tok="hp"][data-fg-step="1"]'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    // Guarded: a popup that did not open is this cell FAILING, never the run throwing.
    if (l46Plus) {
      await pg.mouse.click(l46Plus.x, l46Plus.y);
      await pg.mouse.click(l46Plus.x, l46Plus.y);
    }
    await pg.waitForTimeout(150);
    const lc1 = await d46Read();
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(120);
    note(ch, size.name, 'D-46 two fight drags, release to release (ms)', l46Ms + ' of ' + l46Coalesce);
    ok(`${tag}: 33l. D-46 — TWO FIGHT DRAGS ARE TWO UNDO ENTRIES, EVEN INSIDE COALESCE_MS. The same health between the same two cats, twice, the second release inside the window (measured, and required): Cat 3 3 -> 1, Cat 4 3 -> 5, the undo depth up by TWO and four hand records; one Ctrl+Z takes back exactly ONE move and its two records. THE CONTROL IN THE SAME RUN: two clicks on the popup's + for Cat 5 DO fold — two commits, one entry`,
      l46Aim.onScreen && l46Ms < l46Coalesce
      && l46b.c3 === 1 && l46b.c4 === 5 && l46b.depth === l46.depth + 2 && JSON.parse(l46b.hand).length === 4
      && l46c.c3 === 2 && l46c.c4 === 4 && l46c.depth === l46.depth + 1 && JSON.parse(l46c.hand).length === 2
      && lc1.commits === lc0.commits + 2 && lc1.depth === lc0.depth + 1 && lc1.c5 === lc0.c5 + 2,
      { before: l46, twice: l46b, afterUndo: l46c, ms: l46Ms, coalesce: l46Coalesce, control: [lc0.depth, lc1.depth, lc0.commits, lc1.commits] });

    // ── 33m. AN ADVANCE LANDS WHILE A DRAG IS HELD. ──
    await d46Fresh();
    const m46 = await d46Read();
    const m46Aim = await d46Aim(d46Line('cats', 'c1', 'hp'), d46Name('cats', 'c2'));
    await pg.mouse.move(m46Aim.sx, m46Aim.sy);
    await pg.mouse.down();
    for (let i = 1; i <= 4; i++) { await pg.mouse.move(m46Aim.sx + i * 3, m46Aim.sy + i * 2); }
    await pg.mouse.move(m46Aim.tx, m46Aim.ty, { steps: 6 });
    const m46Before = await d46Flight();
    // The pointer is held; the keyboard presses Advance — the one way a student can resolve a
    // round with a token in their hand.
    await pg.evaluate(() => document.querySelector('[data-k="fg/advance"]').focus({ preventScroll: true }));
    await pg.keyboard.press('Enter');
    await pg.waitForTimeout(250);
    await pg.mouse.move(m46Aim.tx + 2, m46Aim.ty + 1);
    await pg.waitForTimeout(80);
    const m46After = await d46Flight();
    const m46Mid = await d46Read();
    await pg.mouse.up();
    await pg.waitForTimeout(160);
    const m46b = await d46Read();
    ok(`${tag}: 33m. D-46 — AN ADVANCE THAT LANDS WHILE A DRAG IS HELD REBUILDS NOTHING UNDER THE POINTER. Live over Cat 2, the round is Advanced from the keyboard: the round moves to 2, and the token held, its reading and its shape are THE SAME NODES, still attached; the drag is still live, still lit (re-asked of the op on the new board) and still over Cat 2. While it was held the only undo entry added was the Advance's (the page's first key press also flips the ui slice's keyboard-navigation flag, which is a ui commit and no undo entry, measured the same on HEAD). Let go, the move lands as ONE entry on the new round: Cat 1 3 -> 2, Cat 2 3 -> 4, and round 2's hand list holds the two records while round 1 carried none`,
      JSON.parse(m46Before.inFlight || '{}').live === true && m46Mid.round === 2
      && JSON.parse(m46After.inFlight || '{}').live === true && m46After.srcSame && m46After.lineSame && m46After.entSame
      && m46After.over.join() === 'cats/c2' && m46After.lit.length === 2 + 9 + 3 - 1
      && m46Before.depth === m46.depth && m46After.depth === m46.depth + 1 && m46After.round === 2
      && m46b.c1 === 2 && m46b.c2 === 4 && m46b.depth === m46.depth + 2 && JSON.parse(m46b.hand).length === 2
      && m46b.panel === true,
      { before: m46Before, after: m46After, mid: [m46Mid.round, m46Mid.commits], end: m46b });

    // ── 33n. A DRAG REACHES THE OTHER SIDE'S POOL WHEN IT IS BELOW THE WINDOW. ──
    await d46Fresh();
    const n46 = await d46Read();
    // FIRST THE NATURAL CASE, RECORDED: Cat 1's shape just under the sticky bar, the way a
    // student lands on the round state. Where the other side's pool then sits is noted for
    // all four columns — measured at 439px, on screen at both sizes, so no scroll is needed.
    const n46Natural = await pg.evaluate(() => {
      const n = document.querySelector('#state-cats .bf-unit[data-drg-unit="c1"] .bf-line[data-drg-tok="hp"] .tok');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      window.scrollBy({ top: n.getBoundingClientRect().top - 140, left: 0, behavior: 'instant' });
      const bar = document.getElementById('topbar').getBoundingClientRect().bottom;
      window.scrollBy({ top: n.getBoundingClientRect().top - bar - 20, left: 0, behavior: 'instant' });
      const pool = document.querySelector('#state-mechs .fg-team-head').getBoundingClientRect();
      return { poolTop: Math.round(pool.top), onScreen: pool.bottom <= window.innerHeight };
    });
    note(ch, size.name, 'D-46 Mechs pool top with Cat 1 under the bar (px / on screen)', n46Natural.poolTop + ' / ' + n46Natural.onScreen);
    // THEN THE CASE THAT NEEDS IT, DRIVEN: the page left where a student who has just been
    // looking at the battle scene leaves it — Cat 1's shape near the window's FOOT — so the
    // Mechs' pool is below the window and a finger holding a token cannot wheel-scroll to it.
    const n46Src = await pg.evaluate(() => {
      const n = document.querySelector('#state-cats .bf-unit[data-drg-unit="c1"] .bf-line[data-drg-tok="hp"] .tok');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      window.scrollBy({ top: n.getBoundingClientRect().bottom - window.innerHeight + 90, left: 0, behavior: 'instant' });
      const r = n.getBoundingClientRect();
      const pool = document.querySelector('#state-mechs .fg-team-head').getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, poolTop: pool.top, h: window.innerHeight };
    });
    await pg.mouse.move(n46Src.x, n46Src.y);
    await pg.mouse.down();
    for (let i = 1; i <= 4; i++) { await pg.mouse.move(n46Src.x + i * 3, n46Src.y + i * 2); }
    let n46Pool = await pg.evaluate(() => { const r = document.querySelector('#state-mechs .fg-team-head').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, x: r.left + 40, y: r.top + r.height / 2 }; });
    let n46Scrolled = false;
    if (n46Pool.bottom > n46Src.h - 60) {
      n46Scrolled = true;
      await pg.mouse.move(n46Src.x + 200, n46Src.h - 6, { steps: 10 });
      for (let i = 0; i < 80; i++) {
        await pg.waitForTimeout(50);
        n46Pool = await pg.evaluate(() => { const r = document.querySelector('#state-mechs .fg-team-head').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, x: r.left + 40, y: r.top + r.height / 2 }; });
        if (n46Pool.bottom < n46Src.h - 120) break;
      }
      await pg.mouse.move(n46Pool.x, n46Src.h - 200, { steps: 2 });
      await pg.waitForTimeout(120);
      n46Pool = await pg.evaluate(() => { const r = document.querySelector('#state-mechs .fg-team-head').getBoundingClientRect(); return { top: r.top, bottom: r.bottom, x: r.left + 40, y: r.top + r.height / 2 }; });
    }
    await pg.mouse.move(n46Pool.x, n46Pool.y, { steps: 5 });
    await pg.waitForTimeout(80);
    const n46Over = await d46Flight();
    await pg.mouse.up();
    await pg.waitForTimeout(160);
    const n46b = await d46Read();
    note(ch, size.name, 'D-46 edge scroll needed to reach the Mechs pool', String(n46Scrolled));
    ok(`${tag}: 33n. D-46 — THE OTHER SIDE'S POOL IS REACHABLE WHEN IT IS BELOW THE WINDOW. The fight tab is tall — the scene sits above the round — so with Cat 1's shape near the window's foot the Mechs' pool is below the window (measured, and required). The drag is held at the foot, D-41b's edge scroll brings the pool in, and the token dropped on it lands: Cat 1 3 -> 2 and the Mechs' FIGHT reserve holds one. (Landing on the round state with Cat 1 under the bar, the pool is already on screen at both sizes — recorded, not assumed)`,
      n46Src.poolTop > n46Src.h && n46Scrolled === true && n46Over.over.join() === 'mechs/pool' && n46b.c1 === 2 && n46b.mechsRes === '{"hp":1}'
      && n46b.commits === n46.commits + 1,
      { src: n46Src, scrolled: n46Scrolled, over: n46Over, after: n46b });

    await pg.evaluate(() => {
      if (App.state.get().fight !== null) { App.ops.endFight(); }
      App.ops.resetToDefaults();
      App.state.invalidate({ structural: true });
      App.state.flush();
      try { App.render.sceneHome(); localStorage.removeItem('cvm.v1.scene'); } catch (e) { /* none */ }
    });
    await pg.click('#view-build'); await pg.waitForTimeout(150);

    /* ── 34. D-47 — THE DENSITY CAME FROM SPACE AND NOT FROM TYPE. ─────────────────────────
       "Can you make the pages denser." The orchestrator's binding call: reclaim padding, gaps,
       margins and stacked panels, and hold READING TEXT at or above UX-02's 18px floor, with
       secondary labels kept at whatever floor the file already gave them. A density pass is
       the one change most likely to reach for a smaller font, so the floor gets a cell of its
       own rather than a promise in a commit message.

       THE WALK: every rendered TEXT LEAF and every visible text FIELD (an input's value is not
       a text node, so a leaf walk alone never sees the field a student types into — measured,
       it missed four), on the board, How this works, the fight fresh, the fight after a real
       Advance, the fight with the projection panel open and with D-37's unit popup open, and
       the token picker, the action editor, its Proposal pane, share and reset. A leaf counts
       when its box is non-empty and its parent is visibility:visible, so a tick built and not
       shown is not a leaf, and a dialog that is shut is not walked.

       THE FLOOR IS 18 FOR EVERYTHING EXCEPT A NAMED STANDING LIST, and each entry on the list
       is pinned at the size it measured on the file D-47 started from. So the cell says two
       things: nothing new goes under 18, and nothing already under it goes lower. The list is
       the honest inventory of where this file sits under its own floor today — the ticks, the
       eyebrow, the uppercase group labels, the round rules' column heads and the dialogs'
       chooser names, which are SECONDARY; and a set of readings in the action editor, its
       Proposal pane and the share dialog, which are NOT secondary and are recorded as a
       finding rather than waived: D-47 did not put them there and did not move them. The six
       reading sizes D-47 did touch (the subtitle, How this works, the round rules' reading,
       amount and Remove) went UP to 18 and are therefore not on the list. A token's glyph is
       excluded by reason: it is decoration drawn at a fraction of --tok, and How this works
       says in as many words that the shape and colour carry the meaning without it.

       FAILS RATHER THAN THROWS: every drive step is guarded, and a surface that could not be
       reached is a failed clause with its reason, never a stopped run. */
    const STANDING34 = [
      ['.vw-check', 14], ['.pv-check', 14], ['.scn-gen-check', 14], ['.fg-check', 14], ['.pk-check', 14],
      ['.rr-check', 14], ['.ae-check', 14], ['.ae-pill .ae-check', 13],
      ['.eyebrow', 12], ['.ex', 12],
      ['.brd-tokedit-label', 15], ['.pv-title', 15], ['.ref-sb-head', 15],
      ['.rr-col', 16],
      ['.ae-pill', 15], ['.ae-prop-pill', 15], ['.ae-item', 16], ['.pk-list-item', 16],
      ['.ae-note', 16], ['.ae-pool-say', 16], ['.ae-amt', 17], ['.ae-prop-report', 17], ['.ae-prop-refuse', 17],
      ['.ae-prop-lbl', 16], ['.ae-prop-amt', 17], ['.ae-prop-nothing', 16], ['.sh-note', 16], ['.sh-code', 13], ['.sh-paste', 13],
      ['.tok-g', 0]
    ];
    const scan34 = async (surface, rootSel) => {
      try {
        return await pg.evaluate(({ surface, rootSel, table }) => {
          const root = document.querySelector(rootSel);
          const out = { surface, leaves: 0, fields: 0, minReading: 999, under: [] };
          if (!root) { out.under.push('no root ' + rootSel); return out; }
          const floorOf = (el) => {
            let f = 18;
            table.forEach(([sel, pin]) => { if (el.closest(sel) && pin < f) { f = pin; } });
            return f;
          };
          const judge = (el, fs, sample) => {
            const f = floorOf(el);
            if (f === 18 && fs < out.minReading) { out.minReading = fs; }
            if (fs < f) { out.under.push((el.className || el.tagName) + ' ' + fs + 'px < ' + f + ' "' + sample.slice(0, 30) + '"'); }
          };
          const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          let n;
          while ((n = w.nextNode())) {
            if (!n.nodeValue.trim()) { continue; }
            const p = n.parentElement;
            if (!p || p.closest('[hidden],#selftest-report,#err-panel')) { continue; }
            if (rootSel === '#app' && p.closest('dialog')) { continue; }
            const cs = getComputedStyle(p);
            if (cs.visibility !== 'visible') { continue; }
            const r = document.createRange(); r.selectNodeContents(n);
            const rb = r.getBoundingClientRect();
            if (rb.width === 0 || rb.height === 0) { continue; }
            out.leaves++;
            judge(p, parseFloat(cs.fontSize), n.nodeValue.trim());
          }
          root.querySelectorAll('input:not([type]), input[type="text"], textarea').forEach((f) => {
            if (f.closest('[hidden]')) { return; }
            const rb = f.getBoundingClientRect();
            if (rb.width === 0 || rb.height === 0) { return; }
            out.fields++;
            judge(f, parseFloat(getComputedStyle(f).fontSize), f.value || f.getAttribute('aria-label') || '');
          });
          return out;
        }, { surface, rootSel, table: STANDING34 });
      } catch (e) { return { surface, leaves: 0, fields: 0, minReading: 999, under: ['threw: ' + String(e).slice(0, 120)] }; }
    };
    const step34 = async (fn) => { try { await fn(); return true; } catch (e) { return false; } };
    const s34 = [];
    const reached34 = {};
    s34.push(await scan34('board', '#app'));
    reached34.howto = await step34(async () => { await pg.click('#view-howto', { timeout: 3000 }); await pg.waitForTimeout(200); });
    s34.push(await scan34('howto', '#app'));
    reached34.fight = await step34(async () => {
      await pg.click('#view-build', { timeout: 3000 }); await pg.waitForTimeout(100);
      await pg.evaluate(() => window.scrollTo(0, 0));
      await pg.click('#fight-start', { timeout: 3000 }); await pg.waitForTimeout(400);
    });
    s34.push(await scan34('fight', '#app'));
    reached34.advanced = await step34(async () => {
      await pg.evaluate(() => {
        const a = document.querySelector('.fg-row .fg-act:not([disabled])');
        if (a) { a.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); }
      });
      await pg.waitForTimeout(150);
      await pg.evaluate(() => document.querySelector('.fg-advance').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
      await pg.waitForTimeout(250);
      const round = await pg.evaluate(() => (App.state.get().fight || {}).round);
      if (round !== 2) { throw new Error('round ' + round); }
    });
    s34.push(await scan34('fight after an Advance', '#app'));
    reached34.proj = await step34(async () => { await pg.click('#proj-toggle', { timeout: 3000 }); await pg.waitForTimeout(250); });
    s34.push(await scan34('fight, projection open', '#app'));
    await step34(async () => { await pg.click('#proj-toggle', { timeout: 3000 }); await pg.waitForTimeout(200); });
    reached34.popup = await step34(async () => {
      await pg.evaluate(() => window.scrollTo(0, 0));
      await pg.locator('#state-cats .bf-unit').first().click({ timeout: 3000 }); await pg.waitForTimeout(250);
      const open = await pg.evaluate(() => !document.getElementById('fg-unit').hidden);
      if (!open) { throw new Error('popup shut'); }
    });
    s34.push(await scan34('fight, unit popup open', '#app'));
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
    const dlg34 = async (name, act, id) => {
      reached34[name] = await step34(async () => {
        await pg.evaluate(() => window.scrollTo(0, 0));
        await pg.click(`#topbar [data-act="${act}"]`, { timeout: 3000 }); await pg.waitForTimeout(300);
        const open = await pg.evaluate((i) => document.getElementById(i).open, id);
        if (!open) { throw new Error(id + ' shut'); }
      });
      s34.push(await scan34(name, '#' + id));
    };
    await dlg34('token picker', 'openTokenPicker', 'tok-picker');
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    await dlg34('action editor', 'openActionEditor', 'act-edit');
    reached34.proposal = await step34(async () => { await pg.click('#act-prop-open', { timeout: 3000 }); await pg.waitForTimeout(300); });
    s34.push(await scan34('proposal pane', '#act-edit'));
    // Back to the authoring pane before the dialog shuts, so the editor is left as it was found:
    // it reopens on the pane it was shut on, and cell 34b's first draft read four empty rects
    // off an editor that had reopened on the Proposal pane.
    await step34(async () => { await pg.click('#act-prop-close', { timeout: 3000 }); await pg.waitForTimeout(200); });
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    await dlg34('share', 'openShare', 'share');
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    await dlg34('reset', 'openResetAsk', 'reset-ask');
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    await pg.evaluate(() => {
      if (App.state.get().fight !== null) { App.ops.endFight(); App.state.flush(); }
      App.ops.resetToDefaults();
      App.state.invalidate({ structural: true });
      App.state.flush();
    });
    await pg.click('#view-build').catch(() => {}); await pg.waitForTimeout(150);
    const under34 = s34.filter((s) => s.under.length > 0).map((s) => s.surface + ': ' + s.under.slice(0, 4).join(' | '));
    const minRead34 = Math.min(...s34.map((s) => s.minReading));
    note(ch, size.name, 'D-47 smallest reading text on any surface (px)', String(minRead34));
    ok(`${tag}: 34. D-47 — THE DENSITY CAME FROM SPACE AND NOT FROM TYPE. Every rendered text leaf and every visible text field on eleven surfaces — the board, How this works, the fight fresh, after a real Advance, with the projection panel open and with the unit popup open, the token picker, the action editor, its Proposal pane, share and reset — is at UX-02's 18px floor, or at the size a NAMED standing entry measured on the file D-47 started from and no lower. Every surface was reached, and every one carried text, so a walk that met nothing cannot pass`,
      under34.length === 0 && s34.length === 11 && s34.every((s) => s.leaves > 0)
        && Object.keys(reached34).length === 10 && Object.values(reached34).every(Boolean) && minRead34 >= 18,
      { under: under34, reached: reached34, minReading: minRead34, walked: s34.map((s) => s.surface + ' ' + s.leaves + '/' + s.fields) });

    /* ── 34b. D-47 — THE DENSITY ITSELF, AS REGIMES. ───────────────────────────────────────
       Cell 34 holds the TYPE; nothing held the SPACE, and D-32b's PROBE CF is the reason that
       matters: a density pass undone leaves every node row green, because a padding is a
       browser's claim. So the density is asserted here, and as REGIMES — a thing on one line,
       a thing on the first screen, no empty panel — never as a pixel budget that reddens on a
       font. Each clause is one D-47 change, and each was FALSE on the file D-47 started from:
       two whole unit cards on the board's first screen at 1920 and none at 1366; a 660px picker
       whose three create buttons broke onto two lines, with Name above Range and 623px of it
       out of sight at 1920; the editor's Side, action list, New/Remove and Name one per row; a
       side's name above its survivor count and "Each round" above its two readings; and How
       this works laid out in rows, one of which carried ~500px of empty panel. */
    const r34b = { board: null, picker: null, editor: null, fight: null, howto: null };
    const geo34b = async (fn, arg) => { try { return await pg.evaluate(fn, arg); } catch (e) { return { threw: String(e).slice(0, 120) }; } };
    await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(100);
    r34b.board = await geo34b(() => {
      let whole = 0;
      // The CATS column: it is the long one, the one that sets the board's height, and the
      // first draft counting both columns read 4 on the file D-47 started from (two a column).
      document.querySelectorAll('#col-cats .unit-card').forEach((c) => {
        const r = c.getBoundingClientRect(); if (r.top >= 0 && r.bottom <= innerHeight) { whole++; }
      });
      // AND THE CARD IS ON THE SCALE, read as COMPUTED values against the root's own tokens.
      // PROBE P6 is why: D-47's card padding and row gap put back (14/16/10) left the card
      // count above GREEN in all four columns — the chrome's compaction bought the third card
      // on its own, and the fourth sits 16px from the fold at 1920, too close to hold as a
      // regime. What D-47 changed about the card is that its room comes off the scale.
      const sp = (n) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sp-' + n));
      const card = document.querySelector('#col-cats .unit-card');
      const cs = card ? getComputedStyle(card) : null;
      const onScale = !!cs && parseFloat(cs.paddingTop) === sp(3) && parseFloat(cs.paddingBottom) === sp(3)
        && parseFloat(cs.rowGap) === sp(2) && sp(2) > 0 && sp(3) > 0;
      return { whole, onScale, pad: cs ? cs.paddingTop + '/' + cs.rowGap : null };
    });
    const oneLine34 = (a, b) => a && b && Math.abs(a.top - b.top) <= 12;
    await step34(async () => { await pg.click('#topbar [data-act="openTokenPicker"]', { timeout: 3000 }); await pg.waitForTimeout(300); });
    r34b.picker = await geo34b(() => {
      const r = (s) => { const n = document.querySelector(s); if (!n) { return null; } const b = n.getBoundingClientRect(); return { top: b.top, left: b.left, right: b.right, bottom: b.bottom }; };
      const body = document.querySelector('#tok-picker .pk-body');
      return { open: document.getElementById('tok-picker').open, hidden: body ? body.scrollHeight - body.clientHeight : -1,
        n1: r('#tok-pick-new-unit'), n2: r('#tok-pick-new-side'), rm: r('#tok-pick-remove'),
        name: r('#tok-pick-name-label'), range: r('#tok-pick-bounds-label') };
    });
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    await step34(async () => { await pg.click('#topbar [data-act="openActionEditor"]', { timeout: 3000 }); await pg.waitForTimeout(300); });
    r34b.editor = await geo34b(() => {
      const r = (s) => { const n = document.querySelector(s); if (!n) { return null; } const b = n.getBoundingClientRect(); return { top: b.top, left: b.left, right: b.right, bottom: b.bottom }; };
      return { open: document.getElementById('act-edit').open, side: r('#act-edit-sides-label'), list: r('#act-edit-list-label'),
        fresh: r('#act-edit-new'), name: r('#act-edit-name') };
    });
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    await step34(async () => { await pg.evaluate(() => window.scrollTo(0, 0)); await pg.click('#fight-start', { timeout: 3000 }); await pg.waitForTimeout(400); });
    r34b.fight = await geo34b(() => {
      const r = (n) => { if (!n) { return null; } const b = n.getBoundingClientRect(); return { top: b.top, left: b.left, right: b.right, bottom: b.bottom }; };
      const side = document.getElementById('state-cats');
      const rr = document.querySelector('#fight-state .fg-eachround');
      return { head: r(side && side.querySelector('.fg-side-head')), standing: r(side && side.querySelector('.fg-standing')),
        rrHead: r(rr && rr.querySelector('.fg-rr-head')), rrLine: r(rr && rr.querySelector('.fg-rr-line')) };
    });
    await pg.evaluate(() => { if (App.state.get().fight !== null) { App.ops.endFight(); App.state.flush(); } App.ops.resetToDefaults(); App.state.invalidate({ structural: true }); App.state.flush(); });
    await step34(async () => { await pg.click('#view-howto', { timeout: 3000 }); await pg.waitForTimeout(200); });
    r34b.howto = await geo34b(() => {
      const cards = Array.from(document.querySelectorAll('#howto .ht-card')).map((c) => { const b = c.getBoundingClientRect(); return { left: Math.round(b.left), top: b.top, bottom: b.bottom }; });
      const gap = parseFloat(getComputedStyle(document.querySelector('#howto .ht-card')).marginBottom) || 0;
      let worst = 0;
      cards.forEach((c) => {
        const above = cards.filter((o) => o !== c && Math.abs(o.left - c.left) <= 2 && o.bottom <= c.top + 1);
        const floor = above.length ? Math.max(...above.map((o) => o.bottom)) : null;
        if (floor !== null) { worst = Math.max(worst, c.top - floor - gap); }
      });
      return { cards: cards.length, columns: new Set(cards.map((c) => c.left)).size, worst: Math.round(worst) };
    });
    await pg.click('#view-build').catch(() => {}); await pg.waitForTimeout(150);
    const wide34b = size.width >= 1920;
    const p34 = r34b.picker || {};
    const e34 = r34b.editor || {};
    const f34 = r34b.fight || {};
    const h34 = r34b.howto || {};
    ok(`${tag}: 34b. D-47 — THE DENSITY ITSELF, AS REGIMES: whole unit cards in the Cats column on the board's first screen (at least 3 at 1920, at least 1 at 1366 — 2 and 0 before D-47) and each card's room read off the spacing scale by computed value; the token picker's three create buttons on ONE line and Name BESIDE Range, and at 1920 the whole picker in view with nothing to scroll; the action editor's Side BESIDE its list of actions and the name to the RIGHT of New action; in the fight's state area a side's name and its survivor count on ONE line and "Each round" on ONE line with its readings; and How this works in columns with no card carrying more than one gap of empty space above it`,
      (r34b.board && r34b.board.whole >= (wide34b ? 3 : 1) && r34b.board.onScale === true)
        && p34.open === true && oneLine34(p34.n1, p34.n2) && oneLine34(p34.n1, p34.rm) && oneLine34(p34.name, p34.range)
        && p34.range && p34.name && p34.range.left > p34.name.right
        && (!wide34b || p34.hidden <= 1)
        && e34.open === true && oneLine34(e34.side, e34.list) && e34.list && e34.side && e34.list.left > e34.side.right
        && e34.name && e34.fresh && e34.name.left > e34.fresh.right
        && oneLine34(f34.head, f34.standing) && f34.standing && f34.head && f34.standing.left > f34.head.right
        && oneLine34(f34.rrHead, f34.rrLine) && f34.rrLine && f34.rrHead && f34.rrLine.left > f34.rrHead.right
        && h34.cards === 6 && h34.columns >= 2 && h34.worst <= 1,
      r34b);

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
