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
        await new Promise((r) => setTimeout(r, 500));
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
        all: document.querySelectorAll('#act-edit-terms .sym-sign').length
      };
    });
    note(ch, size.name, 'D-32 the mark on an editor cost — dx / dy / colour',
      aeMarks.cost && aeMarks.cost.mark ? `${aeMarks.cost.dx}px, ${aeMarks.cost.dy} down, ${aeMarks.cost.color}` : 'no mark');
    note(ch, size.name, 'D-32 marks in the terms region', `${aeMarks.all}, requirement carries ${aeMarks.req && aeMarks.req.mark ? 'one' : 'none'}`);
    ok(`${tag}: 23d. the editor's removal mark is D-30's geometry exactly, and a requirement carries none`,
      aeMarks.cost !== null && aeMarks.cost.mark === true && aeMarks.cost.onTok === true
      && aeMarks.cost.dx === 0 && aeMarks.cost.dy === 0.25
      && aeMarks.req !== null && aeMarks.req.mark === false
      && aeMarks.down !== null && aeMarks.down.mark === true
      && aeMarks.up !== null && aeMarks.up.mark === false
      && aeMarks.all === 5,
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
      && rapid.said === 'Cat 1 Health, 1.',
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
        figure: row.querySelector('.fgu-num').textContent,
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
      && clamped.said === 'Cat 1 Health, 0.' && clamped.panel === true
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
      && ledger.said.filter((s) => s.indexOf('Cat 1 ') === 0).length === 2
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
      held.shut === false && held.head === 'Cat 1'
      && held.rows.map((r) => r.tok).join(',') === ['hp', 'shield', d36.tok, 'dead'].join(',')
      && held.rows.every((r) => r.said !== null && r.said === r.aria && r.tsay !== ''
        && r.toks > 0)
      && held.rows.filter((r) => r.steps === 2).length === 3
      && held.rows.filter((r) => r.alive).length === 1
      && held.disabled === 0 && held.onScreen === true && /fgu/.test(held.topmost)
      && bfHidden !== null && bfHidden.hidden === true && bfHidden.box === 0
      && held.rows[1].said === 'Cat 1 Shield, 0.'
      && held.rows[2].lbl === 'Chill'
      && zeroRuled.shield === 1 && zeroRuled.said === 'Cat 1 Shield, 1.'
      && zeroRuled.rec.tok === 'shield' && zeroRuled.rec.unit === 'c1'
      && standing.pressed === 'false' && standing.word === 'Mark dead'
      && standing.tick === 'hidden' && standing.alive === true
      && standing.said === 'Cat 1 Dead marker, 0.'
      && marked.pressed === 'true' && marked.on === true
      && marked.word === 'Marked dead' && marked.tick === 'visible'
      && marked.alive === false && marked.said === 'Cat 1 Dead marker, 1.'
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
