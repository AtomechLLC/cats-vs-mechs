// PROBE 2 — REHEARSAL B2 / 03-HUMAN-UAT check 2: "#strip stays sticky when the
// window is short."
//
// The named failure is specific: a sticky box TALLER than the space between the
// top bar and the bottom of the window behaves as though it were not sticky for
// the part that does not fit, and a figure goes missing. So this probe does not
// ask "is it sticky" (already known); it drives the failure condition:
//
//   for each browser x seven window heights x both views the strip appears in,
//   scroll to 0 / 25% / 50% / 75% / max and record, at EVERY sample:
//     - #strip's computed position, top, bottom, height
//     - #topbar's bottom edge (the "foot" the offset is written against)
//     - the room under the bar
//     - AND per-line: is every [data-prj] reading wholly inside the viewport?
//
// TWO BEHAVIOURS ARE CORRECT AND ARE MEASURED RATHER THAN ASSERTED AGAINST:
//   * In the BUILD view the strip is position:sticky inside #board. A sticky
//     box stops sticking at the END of its containing block — so at the very
//     bottom of the document it is carried up with the board. That is the spec,
//     not a bug. What matters is whether a FIGURE is lost when it happens, and
//     that is what the per-line reading answers.
//   * In the FIGHT view [C14.9] makes it position:fixed with
//     top: calc(--topbar-foot + 14px) and a matching max-height, and [S08]
//     republishes --topbar-foot on scroll. So the panel's TOP RISES and its
//     HEIGHT GROWS as the bar scrolls away, while its BOTTOM stays put. It is
//     designed to move. The assertion is therefore on the bottom edge and on
//     containment, never on the top being constant.
//
// READ-ONLY on the artifact.

import { pathToFileURL } from 'url';
import { existsSync, writeFileSync } from 'fs';
import path from 'path';

const ART = 'C:/Projects/GameDesignSkills/GameFeelDirectionCourse/CatsVsMech/cats-vs-mechs.html';
if (!existsSync(ART)) { console.error('no artifact'); process.exit(1); }
const URL_ = pathToFileURL(ART).href;
const HERE = import.meta.dirname;
const mod = await import(pathToFileURL(path.join(process.env.PLAYWRIGHT_DIR, 'index.js')).href);
const { chromium } = mod.chromium ? mod : mod.default;

let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('PASS  ' + n); } else { fail++; console.log('FAIL  ' + n + '\n      ' + JSON.stringify(d)); } };

const HEIGHTS = [1080, 900, 768, 700, 600, 575, 574, 573, 500, 400];
const results = [];

const READ = `(() => {
  const s = document.getElementById('strip');
  if (!s) return null;
  const cs = getComputedStyle(s); const r = s.getBoundingClientRect();
  const bar = document.getElementById('topbar');
  const br = bar ? bar.getBoundingClientRect() : null;
  const anc = []; let p = s.parentElement;
  while (p) { const c = getComputedStyle(p);
    anc.push({ who: p.tagName.toLowerCase() + (p.id ? '#' + p.id : ''), ox: c.overflowX, oy: c.overflowY,
      tr: c.transform, fl: c.filter, bf: c.backdropFilter, wc: c.willChange, ct: c.contain, pv: c.perspective });
    p = p.parentElement; }
  const lines = Array.from(s.querySelectorAll('[data-prj]'))
    .filter(n => n.textContent.trim() && n.getBoundingClientRect().height > 0)
    .map(n => { const b = n.getBoundingClientRect();
      return { k: n.dataset.prj, t: n.textContent.trim().slice(0, 40),
        top: Math.round(b.top), bottom: Math.round(b.bottom),
        inView: b.top >= -0.5 && b.bottom <= window.innerHeight + 0.5 }; });
  return {
    pos: cs.position, cssTop: cs.top, top: Math.round(r.top), bottom: Math.round(r.bottom),
    h: Math.round(r.height), w: Math.round(r.width), maxH: cs.maxHeight, oy: cs.overflowY,
    contentH: s.scrollHeight, clientH: s.clientHeight,
    barTop: br ? Math.round(br.top) : null, barBottom: br ? Math.round(br.bottom) : null,
    room: br ? window.innerHeight - Math.round(br.bottom) : window.innerHeight,
    innerH: window.innerHeight, scrollY: Math.round(window.scrollY),
    docH: document.documentElement.scrollHeight,
    lines, linesOut: lines.filter(l => !l.inView).map(l => l.k + ':' + l.t),
    ancestors: anc
  };
})()`;

async function run(channel, height) {
  const b = await chromium.launch({ channel, headless: process.env.HEADED !== '1' });
  const ctx = await b.newContext({ viewport: { width: 1366, height }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e)));
  pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await pg.goto(URL_); await pg.waitForTimeout(500);

  const tag = channel + '@1366x' + height;
  const views = [];

  for (const vw of ['build', 'fight']) {
    await pg.click('#view-' + vw); await pg.waitForTimeout(250);
    let shown = await pg.evaluate(() => { const s = document.getElementById('strip'); return !!s && !s.hidden && s.getBoundingClientRect().height > 0; });
    if (!shown) { const t = await pg.$('#proj-toggle'); if (t) { await t.click(); await pg.waitForTimeout(300); } }
    shown = await pg.evaluate(() => { const s = document.getElementById('strip'); return !!s && !s.hidden && s.getBoundingClientRect().height > 0; });
    ok(`${tag} [${vw}]: the projection can be brought on screen`, shown);
    if (!shown) { views.push({ vw, shown: false }); continue; }

    const maxScroll = await pg.evaluate(() => Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
    const offs = [...new Set([0, Math.round(maxScroll * .25), Math.round(maxScroll * .5), Math.round(maxScroll * .75), maxScroll])];
    const samples = [];
    for (const y of offs) {
      await pg.evaluate(yy => window.scrollTo({ top: yy, behavior: 'instant' }), y);
      await pg.waitForTimeout(200);
      samples.push(await pg.evaluate(READ));
    }
    await pg.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    views.push({ vw, shown: true, maxScroll, samples });

    const s0 = samples[0];
    const badAnc = s0.ancestors.filter(a => a.ox !== 'visible' || a.oy !== 'visible'
      || (a.tr && a.tr !== 'none') || (a.fl && a.fl !== 'none') || (a.bf && a.bf !== 'none')
      || (a.ct && a.ct !== 'none') || (a.pv && a.pv !== 'none'));
    ok(`${tag} [${vw}]: no ancestor clips the strip or creates a containing block for it`,
      badAnc.length === 0, badAnc);

    if (vw === 'build') {
      ok(`${tag} [build]: #strip is position:sticky`, s0.pos === 'sticky', s0.pos);
      // it pins under the bar for the whole of the scroll EXCEPT where its own
      // containing block ends, which is the spec.
      const mid = samples.slice(1, -1);
      const pinned = mid.filter(s => Math.abs(s.top - s.barBottom) <= 2);
      ok(`${tag} [build]: it is pinned to the bar's foot at every mid-scroll offset`,
        mid.length === 0 || pinned.length === mid.length,
        mid.map(s => ({ scrollY: s.scrollY, top: s.top, barFoot: s.barBottom })));
      // THE NAMED CONDITION, measured while PINNED rather than at page load —
      // the strip's height is fixed at 510px and the room under the pinned bar
      // is innerHeight - 64, so this is a pure threshold in window height and
      // it is reported as a reading, not scored as a defect.
      const pinnedRoom = samples.length > 1 ? samples[1].innerH - samples[1].barBottom : s0.room;
      const fits = s0.h <= pinnedRoom + 1;
      console.log(`READ  ${tag} [build]: strip ${s0.h}px against ${pinnedRoom}px of pinned room `
        + `-> ${fits ? 'FITS' : 'DOES NOT FIT'}`);
      // Does any FIGURE go missing WHILE PINNED? This is the assertion.
      const terminal = samples[samples.length - 1];
      const midLost = samples.slice(0, -1).filter(s => s.linesOut.length && s.scrollY > 0);
      ok(`${tag} [build]: every projection figure stays wholly in the window at every scroll `
        + `offset the strip is pinned at`, midLost.length === 0,
        midLost.map(s => ({ scrollY: s.scrollY, out: s.linesOut })));
      // AT THE DOCUMENT'S LAST SCROLL POSITION the sticky releases, because a
      // sticky box stops sticking at the end of its containing block (#board).
      // That is the CSS spec, not a defect — but it costs figures off the top of
      // the window on a short screen, so it is measured and reported.
      console.log(`READ  ${tag} [build]: at the terminal scroll offset (${terminal.scrollY} of `
        + `${terminal.scrollY}) the sticky releases: top ${terminal.top}, `
        + `${terminal.linesOut.length} of ${terminal.lines.length} figures off the top`
        + (terminal.linesOut.length ? ' -> ' + JSON.stringify(terminal.linesOut) : ''));
      views[views.length - 1].reading = { stripH: s0.h, pinnedRoom, fits,
        terminalTop: terminal.top, terminalLost: terminal.linesOut,
        figures: terminal.lines.length };
    } else {
      ok(`${tag} [fight]: #strip is position:fixed (the D-33 sidebar)`, s0.pos === 'fixed', s0.pos);
      const outOfWindow = samples.filter(s => s.top < -0.5 || s.bottom > s.innerH + 0.5);
      ok(`${tag} [fight]: the panel is wholly inside the window at every scroll offset`,
        outOfWindow.length === 0, outOfWindow.map(s => ({ scrollY: s.scrollY, top: s.top, bottom: s.bottom, innerH: s.innerH })));
      const bottoms = samples.map(s => s.bottom);
      ok(`${tag} [fight]: its BOTTOM edge does not move as the page scrolls (the top rises `
        + `by design as --topbar-foot falls)`,
        Math.max(...bottoms) - Math.min(...bottoms) <= 2, samples.map(s => [s.scrollY, s.top, s.bottom]));
      const under = samples.filter(s => s.top < s.barBottom - 1 && s.barBottom > 0);
      ok(`${tag} [fight]: it never rides up over the control bar`, under.length === 0,
        under.map(s => ({ scrollY: s.scrollY, top: s.top, barFoot: s.barBottom })));
      const overflow = samples.filter(s => s.h > s.room + 1);
      ok(`${tag} [fight]: max-height keeps it inside the room under the bar at every offset`,
        overflow.length === 0, overflow.map(s => ({ h: s.h, room: s.room })));
      const scrolls = s0.contentH > s0.clientH;
      ok(`${tag} [fight]: when the content does not fit it SCROLLS ITSELF rather than being clipped `
        + `(overflow-y: ${s0.oy}; content ${s0.contentH} in ${s0.clientH})`,
        !scrolls || s0.oy === 'auto' || s0.oy === 'scroll', { oy: s0.oy, contentH: s0.contentH, clientH: s0.clientH });
    }
  }
  ok(`${tag}: zero page/console errors`, errs.length === 0, errs.slice(0, 3));
  results.push({ tag, channel, height, views, errs });
  await b.close();
}

for (const ch of ['chrome', 'msedge']) for (const h of HEIGHTS) await run(ch, h);
writeFileSync(path.join(HERE, 'p2-result.json'), JSON.stringify({ when: new Date().toISOString(), pass, fail, results }, null, 1));
console.log('\n' + pass + ' passed, ' + fail + ' failed');
