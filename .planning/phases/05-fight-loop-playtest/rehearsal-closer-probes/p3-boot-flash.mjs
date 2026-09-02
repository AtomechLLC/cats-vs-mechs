// PROBE 3 — 04-HUMAN-UAT check 2 / REHEARSAL D1: "No flash of the shipped board
// before a linked build renders."
//
// PROBE Q could not reach this because every reading it took was AFTER the frame
// flushed. Two instruments here, and the second is the decisive one.
//
// INSTRUMENT A — CDP Page.startScreencast, everyNthFrame: 1.
//   Chrome emits a screencast frame per PRESENTED frame. Each frame is pushed
//   back into a scratch browser page, drawn to a canvas, and compared by mean
//   absolute pixel difference against two references taken at the same viewport:
//     REF_DEFAULT — the shipped 9-vs-3 board
//     REF_LINKED  — the board the hash carries
//   A frame closer to REF_DEFAULT than to REF_LINKED is a flash.
//   WHAT IT CANNOT SEE, stated plainly: a screencast frame is produced by the
//   compositor and can be coalesced or dropped under load; a single flashed
//   frame is not guaranteed to be captured. So instrument A can PROVE a flash
//   and cannot, alone, disprove one. Each URL is loaded N times to widen it.
//
// INSTRUMENT B — the causal one, and it CAN bound first paint.
//   An init script (document-start, before any artifact code) records the board
//   signature — cats card count, mechs card count, both faction names — at
//   every MutationObserver microtask checkpoint and at every animation frame,
//   with performance.now() stamps, plus every PerformanceObserver 'paint' entry.
//   A frame can only paint a state that survived to a microtask checkpoint or a
//   rAF; anything constructed and replaced inside ONE task is never painted,
//   because paint happens between tasks. So:
//     if NO recorded signature is ever the shipped 9-vs-3 default, then no
//     painted frame could have shown it — regardless of what the screencast
//     happened to catch.
//   That is a bound on first paint, and it is what the check asked for.
//
// READ-ONLY on the artifact.

import { pathToFileURL } from 'url';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';

const ART = 'C:/Projects/GameDesignSkills/GameFeelDirectionCourse/CatsVsMech/cats-vs-mechs.html';
if (!existsSync(ART)) { console.error('no artifact'); process.exit(1); }
const URL_ = pathToFileURL(ART).href;
const HERE = import.meta.dirname;
const SHOT = path.join(HERE, 'shots'); mkdirSync(SHOT, { recursive: true });
const mod = await import(pathToFileURL(path.join(process.env.PLAYWRIGHT_DIR, 'index.js')).href);
const { chromium } = mod.chromium ? mod : mod.default;

let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('PASS  ' + n); } else { fail++; console.log('FAIL  ' + n + '\n      ' + JSON.stringify(d)); } };

const SIG = `(() => {
  const c = document.getElementById('col-cats');
  const m = document.getElementById('col-mechs');
  const names = Array.from(document.querySelectorAll('.brd-col h2, .brd-col .brd-name'))
    .map(n => n.textContent.trim()).join('/');
  return (c ? c.querySelectorAll('article.unit-card').length : -1) + 'v'
       + (m ? m.querySelectorAll('article.unit-card').length : -1) + '|' + names;
})()`;

const INIT = `(() => {
  window.__fl = { ev: [], paints: [], t0: performance.now() };
  const sig = () => { try { return ${SIG}; } catch (e) { return 'ERR'; } };
  const push = (how) => {
    const s = sig();
    const last = window.__fl.ev.length ? window.__fl.ev[window.__fl.ev.length - 1] : null;
    if (!last || last.s !== s) window.__fl.ev.push({ how, s, t: +performance.now().toFixed(2) });
    else last.n = (last.n || 1) + 1;
  };
  try {
    new PerformanceObserver(l => { for (const e of l.getEntries())
      window.__fl.paints.push({ name: e.name, t: +e.startTime.toFixed(2) }); })
      .observe({ type: 'paint', buffered: true });
  } catch (e) {}
  const start = () => {
    push('start');
    const mo = new MutationObserver(() => push('mutation'));
    mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true });
    const raf = () => { push('raf'); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    // a task-boundary sampler too: what survives to a macrotask is paintable
    let n = 0; const tick = () => { push('task'); if (++n < 400) setTimeout(tick, 4); };
    setTimeout(tick, 0);
  };
  if (document.documentElement) start();
  else new MutationObserver((m, o) => { if (document.documentElement) { o.disconnect(); start(); } })
    .observe(document, { childList: true });
})()`;

// ── build a visually unmistakable linked build and harvest its code ──────────
async function makeCode(channel) {
  const b = await chromium.launch({ channel, headless: true });
  const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } });
  const pg = await ctx.newPage();
  await pg.goto(URL_); await pg.waitForTimeout(500);
  const info = await pg.evaluate(() => {
    const s = App.state.get();
    // strip the Cats to ONE unit and the Mechs to ONE, and rename both sides,
    // so the linked board and the shipped board cannot be confused by a pixel
    // count, a card count or a word.
    const cats = s.build.cats.units.map(u => u.id);
    for (let i = 1; i < cats.length; i++) App.ops.removeUnit('cats', cats[i]);
    const mechs = App.state.get().build.mechs.units.map(u => u.id);
    for (let i = 1; i < mechs.length; i++) App.ops.removeUnit('mechs', mechs[i]);
    App.state.flush();
    App.serialize.flushUrlSync();
    return { hash: location.hash, sig: (() => {
      const c = document.getElementById('col-cats'), m = document.getElementById('col-mechs');
      return c.querySelectorAll('article.unit-card').length + 'v' + m.querySelectorAll('article.unit-card').length;
    })() };
  });
  await b.close();
  return info;
}

const built = await makeCode('chrome');
console.log('linked build: ' + built.sig + '   hash: ' + built.hash);
if (!/b=/.test(built.hash || '')) { console.error('could not harvest a build code from the hash'); process.exit(1); }
const LINKED_URL = URL_ + built.hash;

// ── references, and a scratch page that can read pixels out of a PNG ────────
async function references(channel, size) {
  // TWO SEPARATE PAGES, deliberately. goto()-ing from URL_ to URL_+#hash is a
  // SAME-DOCUMENT navigation — the page does not reload and the second
  // screenshot is the first one again. The first run of this probe made exactly
  // that mistake and it showed up as refSep === 0.00, which is why the
  // instrument check below exists at all.
  const b = await chromium.launch({ channel, headless: true });
  const ctx = await b.newContext({ viewport: size, deviceScaleFactor: 1 });
  const p1 = await ctx.newPage();
  await p1.goto(URL_); await p1.waitForTimeout(900);
  const def = (await p1.screenshot()).toString('base64');
  const defSig = await p1.evaluate(SIG);
  const p2 = await ctx.newPage();
  await p2.goto(LINKED_URL); await p2.waitForTimeout(900);
  const lnk = (await p2.screenshot()).toString('base64');
  const linkedSig = await p2.evaluate(SIG);
  await b.close();
  return { def, lnk, defSig, linkedSig };
}

async function run(channel) {
  const size = { width: 1366, height: 768 };
  const refs = await references(channel, size);

  // scratch page used only to decode PNGs and diff them
  const sb = await chromium.launch({ channel, headless: true });
  const sctx = await sb.newContext({ viewport: size });
  const spg = await sctx.newPage();
  await spg.goto('about:blank');
  await spg.evaluate(([w, h]) => {
    window.__c = document.createElement('canvas'); window.__c.width = w; window.__c.height = h;
    window.__g = window.__c.getContext('2d', { willReadFrequently: true });
    window.__load = (b64) => new Promise(res => {
      const im = new Image();
      im.onload = () => {
        window.__g.clearRect(0, 0, w, h); window.__g.drawImage(im, 0, 0, w, h);
        const d = window.__g.getImageData(0, 0, w, h).data;
        // downsample to a 64x36 luma grid — robust to compression, sensitive to layout
        const gw = 64, gh = 36, grid = new Float64Array(gw * gh), cnt = new Float64Array(gw * gh);
        let ink = 0;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
          const gi = Math.min(gh - 1, Math.floor(y / h * gh)) * gw + Math.min(gw - 1, Math.floor(x / w * gw));
          grid[gi] += lum; cnt[gi]++;
          if (lum > 60) ink++;
        }
        for (let i = 0; i < grid.length; i++) grid[i] = cnt[i] ? grid[i] / cnt[i] : 0;
        res({ ink, grid: Array.from(grid) });
      };
      im.onerror = () => res(null);
      im.src = 'data:image/png;base64,' + b64;
    });
  }, [size.width, size.height]);
  const decode = b64 => spg.evaluate(b => window.__load(b), b64);
  const mad = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / a.length; };

  const refDef = await decode(refs.def);
  const refLnk = await decode(refs.lnk);
  const refSep = mad(refDef.grid, refLnk.grid);
  ok(`${channel}: INSTRUMENT CHECK — the two reference boards are far apart `
    + `(mean |luma| difference ${refSep.toFixed(2)}; ink ${refDef.ink} vs ${refLnk.ink})`,
    // 0.5 is the calibrated floor, not a guess: the two boards differ only in
    // the two roster columns, so a whole-viewport 64x36 luma average separates
    // them by ~1.0 rather than by a lot. What makes that enough is the POSITIVE
    // CONTROL two rows below — the classifier is required to recognise a real
    // DEFAULT frame before its silence about DEFAULT frames counts for anything.
    refSep > 0.5 && Math.abs(refDef.ink - refLnk.ink) > 2000,
    { refSep, defInk: refDef.ink, lnkInk: refLnk.ink });

  const classify = async (frames) => {
    const cls = [];
    for (const f of frames) {
      const d = await decode(f.data);
      if (!d) { cls.push({ t: f.t, k: 'undecodable' }); continue; }
      const dd = mad(d.grid, refDef.grid), dl = mad(d.grid, refLnk.grid);
      cls.push({ t: f.t, ink: d.ink, dDef: +dd.toFixed(2), dLnk: +dl.toFixed(2),
        k: (dd < dl && dd < refSep * 0.4) ? 'DEFAULT' : (dl < dd && dl < refSep * 0.4) ? 'linked' : 'other' });
    }
    return cls;
  };

  const oneLoad = async (url) => {
    const b = await chromium.launch({ channel, headless: true });
    const ctx = await b.newContext({ viewport: size, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    await pg.addInitScript(INIT);
    const cdp = await ctx.newCDPSession(pg);
    const frames = [];
    cdp.on('Page.screencastFrame', async (p) => {
      frames.push({ t: p.metadata.timestamp, data: p.data });
      try { await cdp.send('Page.screencastFrameAck', { sessionId: p.sessionId }); } catch (e) {}
    });
    await cdp.send('Page.enable');
    await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, quality: 100 });
    await pg.goto(url, { waitUntil: 'load' });
    await pg.waitForTimeout(1400);
    try { await cdp.send('Page.stopScreencast'); } catch (e) {}
    const tl = await pg.evaluate(() => window.__fl);
    const endSig = await pg.evaluate(SIG);
    await b.close();
    return { frames, tl, endSig };
  };

  // POSITIVE CONTROL for instrument A. Load the artifact with NO hash — the
  // shipped 9-vs-3 board is genuinely what gets painted — and require the frame
  // classifier to say DEFAULT. Without this, "no DEFAULT frame was captured" is
  // indistinguishable from "the classifier cannot recognise a DEFAULT frame".
  const ctrl = await oneLoad(URL_);
  const ctrlCls = await classify(ctrl.frames);
  ok(`${channel}: INSTRUMENT A POSITIVE CONTROL — loading the artifact with no hash `
    + `produces at least one frame the classifier calls DEFAULT`,
    ctrlCls.some(c => c.k === 'DEFAULT'), ctrlCls);
  ok(`${channel}: INSTRUMENT B POSITIVE CONTROL — with no hash, the timeline DOES record `
    + `the shipped 9-vs-3 roster`,
    ctrl.tl.ev.some(e => /^9v3\|/.test(e.s)), ctrl.tl.ev);

  const runs = [];
  const RUNS = 8;
  for (let r = 0; r < RUNS; r++) {
    const { frames, tl, endSig } = await oneLoad(LINKED_URL);
    const cls = await classify(frames);
    runs.push({ r, endSig, frames: cls.length, cls, tl });
  }
  await sb.close();

  // ── INSTRUMENT A verdict ───────────────────────────────────────────────
  const flashFrames = runs.flatMap((r, i) => r.cls.filter(c => c.k === 'DEFAULT').map(c => ({ run: i, ...c })));
  const totalFrames = runs.reduce((a, r) => a + r.frames, 0);
  const sawLinked = runs.filter(r => r.cls.some(c => c.k === 'linked')).length;
  ok(`${channel}: INSTRUMENT A — the screencast captured frames at all (${totalFrames} over ${RUNS} loads) `
    + `and recognised the linked board in ${sawLinked}/${RUNS} loads`,
    totalFrames > 0 && sawLinked === RUNS, { totalFrames, sawLinked });
  ok(`${channel}: INSTRUMENT A — NO captured frame shows the shipped 9-vs-3 board`,
    flashFrames.length === 0, flashFrames.slice(0, 6));

  // ── INSTRUMENT B verdict ───────────────────────────────────────────────
  const DEFAULT_SIG = /^9v3\|/;
  const bad = [];
  for (const [i, r] of runs.entries()) {
    for (const e of r.tl.ev) if (DEFAULT_SIG.test(e.s)) bad.push({ run: i, ...e });
  }
  ok(`${channel}: INSTRUMENT B — the DOM never held the shipped 9-vs-3 roster at any microtask `
    + `checkpoint, animation frame or task boundary, in any of ${RUNS} loads`,
    bad.length === 0, bad.slice(0, 6));
  const seq = runs[0].tl.ev.map(e => e.how + ':' + e.s.split('|')[0] + '@' + e.t);
  const paints = runs.map(r => r.tl.paints);
  const fcp = paints.map(p => (p.find(x => x.name === 'first-contentful-paint') || {}).t);
  // the linked signature must be in place at or before first contentful paint
  const linkedAt = runs.map(r => { const e = r.tl.ev.find(x => /^1v1\|/.test(x.s)); return e ? e.t : null; });
  const beforeFCP = runs.map((r, i) => linkedAt[i] !== null && fcp[i] !== undefined && linkedAt[i] <= fcp[i]);
  ok(`${channel}: INSTRUMENT B — the linked roster is in the DOM at or before first-contentful-paint `
    + `in every load`, beforeFCP.every(Boolean),
    runs.map((r, i) => ({ run: i, linkedAt: linkedAt[i], fcp: fcp[i] })));
  ok(`${channel}: every load ended on the linked board`,
    runs.every(r => /^1v1\|/.test(r.endSig)), runs.map(r => r.endSig));

  console.log('    first load, signature timeline: ' + seq.slice(0, 12).join('  '));
  console.log('    paint entries, first load: ' + JSON.stringify(runs[0].tl.paints));
  console.log('    frames per load: ' + runs.map(r => r.frames).join(',')
    + '   linked/other/DEFAULT: '
    + runs.map(r => r.cls.filter(c => c.k === 'linked').length + '/'
      + r.cls.filter(c => c.k === 'other').length + '/'
      + r.cls.filter(c => c.k === 'DEFAULT').length).join(' '));

  return { channel, refSep, ctrlCls, ctrlEv: ctrl.tl.ev, defInk: refDef.ink, lnkInk: refLnk.ink, totalFrames, flashFrames, runs: runs.map(r => ({ endSig: r.endSig, frames: r.frames, cls: r.cls, ev: r.tl.ev, paints: r.tl.paints })) };
}

const all = [];
for (const ch of ['chrome', 'msedge']) all.push(await run(ch));
writeFileSync(path.join(HERE, 'p3-result.json'), JSON.stringify({ when: new Date().toISOString(), linkedHash: built.hash, pass, fail, all }, null, 1));
console.log('\n' + pass + ' passed, ' + fail + ' failed');
