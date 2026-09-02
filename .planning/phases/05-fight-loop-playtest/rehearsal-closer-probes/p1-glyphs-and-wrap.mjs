// PROBE 1 — REHEARSAL B1 / 03-HUMAN-UAT check 1.
// READ-ONLY on the artifact. Drives real Chrome and real Edge from file://.
//
// Two questions, measured rather than looked at:
//   (a) Do U+2248 (≈), U+00F7 (÷) and U+2013 (–) render as REAL GLYPHS in the
//       font the strip actually computes to — not as notdef/tofu, and the en
//       dash not as something indistinguishable from the steppers' own U+2212
//       MINUS SIGN sitting a few centimetres away?
//   (b) Do the arithmetic lines WRAP inside the narrow strip rather than
//       scroll it sideways?
//
// METHOD FOR (a) — RASTER, not advance-width alone. Advance width is a weak
// instrument: a font can give notdef the same advance as a real glyph. So each
// character is drawn into a canvas at 96px in the strip's own computed font,
// and the ink is read back with getImageData: pixel count, and a 12x12
// downsampled ink signature. A tofu box is a rectangle outline — its signature
// is dominated by its border and it is IDENTICAL for every unassigned
// codepoint, which is the property this exploits:
//   U+0378 and U+0380 are both PERMANENTLY UNASSIGNED. If a glyph's signature
//   matches either of them, it is being drawn by the same notdef box and it is
//   tofu. If ≈ / ÷ / – each differ from BOTH notdef references AND from each
//   other AND from U+2212 and U+002D, they are real, distinct glyphs.
// U+FFFD is also measured, because the brief named it — but note it is an
// ASSIGNED character (a real diamond-question-mark glyph in most fonts), so it
// is a weaker tofu reference than U+0378. Both are reported.
//
// METHOD FOR (b) — scrollWidth vs clientWidth on #strip and on every arithmetic
// line inside it, plus a line-count-vs-height reading that proves a long line
// occupies more than one line box (i.e. it actually wrapped) rather than merely
// fitting.

import { pathToFileURL } from 'url';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';

const HERE = import.meta.dirname;
const ARTIFACT = path.resolve(HERE, '..', '..', '..', '..', '..', '..', '..',
  'Projects', 'GameDesignSkills', 'GameFeelDirectionCourse', 'CatsVsMech', 'cats-vs-mechs.html');
const ART = existsSync(ARTIFACT) ? ARTIFACT
  : 'C:/Projects/GameDesignSkills/GameFeelDirectionCourse/CatsVsMech/cats-vs-mechs.html';
if (!existsSync(ART)) { console.error('cannot find artifact at ' + ART); process.exit(1); }
const URL_ = pathToFileURL(ART).href;

const pwDir = process.env.PLAYWRIGHT_DIR;
const mod = await import(pathToFileURL(path.join(pwDir, 'index.js')).href);
const { chromium } = mod.chromium ? mod : mod.default;

const SHOT = path.join(HERE, 'shots');
mkdirSync(SHOT, { recursive: true });

let pass = 0, fail = 0;
const out = [];
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log('PASS  ' + name); }
  else { fail++; console.log('FAIL  ' + name + '\n      ' + JSON.stringify(detail)); }
  out.push({ name, cond: !!cond, detail });
};

const CHARS = {
  approx: '\u2248',      // ≈ ALMOST EQUAL TO
  divide: '\u00f7',      // ÷ DIVISION SIGN
  endash: '\u2013',      // – EN DASH
  minus: '\u2212',       // − MINUS SIGN  (what the steppers draw)
  hyphen: '\u002d',      // - HYPHEN-MINUS
  notdefA: '\u0378',     // permanently unassigned -> notdef box
  notdefB: '\u0380',     // permanently unassigned -> notdef box
  replacement: '\ufffd', // U+FFFD (assigned; weaker reference)
  letterM: 'M'           // sanity: a glyph everybody has
};

async function run(channel, size) {
  const b = await chromium.launch({ channel, headless: process.env.HEADED !== '1' });
  const ctx = await b.newContext({ viewport: size, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e)));
  pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await pg.goto(URL_);
  await pg.waitForTimeout(600);

  const tag = channel + '@' + size.width + 'x' + size.height;

  // ---- 0. the strip is built and carries the worked lines -------------------
  const seed = await pg.evaluate(() => {
    App.state.invalidate(); App.state.flush();
    const strip = document.getElementById('strip');
    const grab = k => {
      const n = strip && strip.querySelector('[data-prj="' + k + '"]');
      return n ? n.textContent : null;
    };
    const all = strip ? Array.from(strip.querySelectorAll('[data-prj]'))
      .map(n => ({ k: n.dataset.prj, t: n.textContent })) : [];
    return { turnsCats: grab('turns'), lines: all.length, all };
  });
  ok(tag + ': #strip is built and carries data-prj lines', seed.lines > 0, seed.lines);

  // Collect every text the strip shows on the shipped board, then again with a
  // range forced, so the EN DASH is genuinely on screen and not just in source.
  const shipped = await pg.evaluate(() => {
    const s = document.getElementById('strip');
    return Array.from(s.querySelectorAll('[data-prj]')).map(n => n.textContent);
  });
  const ranged = await pg.evaluate(() => {
    App.state.get().build.cats.units.map(u => u.id)
      .forEach(id => App.ops.setUnitMaxHp('cats', id, 4));
    App.state.flush();
    const s = document.getElementById('strip');
    return Array.from(s.querySelectorAll('[data-prj]')).map(n => n.textContent);
  });
  const allText = shipped.concat(ranged).join(' | ');
  ok(tag + ': U+2248 ≈ is on screen in the strip', allText.includes('\u2248'), shipped.join(' | '));
  ok(tag + ': U+00F7 ÷ is on screen in the strip', allText.includes('\u00f7'), shipped.join(' | '));
  ok(tag + ': U+2013 – (EN DASH) is on screen once a range exists',
    ranged.join(' | ').includes('\u2013'), ranged.join(' | '));
  ok(tag + ': and the range is NOT drawn with U+002D hyphen-minus',
    !/\d-\d/.test(ranged.join(' | ')), ranged.join(' | '));

  // ---- 1. RASTER: every glyph against notdef ------------------------------
  const raster = await pg.evaluate((chars) => {
    const strip = document.getElementById('strip');
    const probeNode = strip.querySelector('[data-prj]') || strip;
    const cs = getComputedStyle(probeNode);
    const fontSpec = cs.fontStyle + ' ' + cs.fontWeight + ' 96px ' + cs.fontFamily;
    const measureSpec = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;

    const c = document.createElement('canvas');
    c.width = 160; c.height = 160;
    const g = c.getContext('2d', { willReadFrequently: true });

    const sig = (ch) => {
      g.clearRect(0, 0, 160, 160);
      g.fillStyle = '#000'; g.fillRect(0, 0, 160, 160);
      g.font = fontSpec;
      g.fillStyle = '#fff';
      g.textBaseline = 'alphabetic';
      g.fillText(ch, 20, 120);
      const d = g.getImageData(0, 0, 160, 160).data;
      let ink = 0;
      let minX = 999, maxX = -1, minY = 999, maxY = -1;
      const cell = new Array(144).fill(0);
      for (let y = 0; y < 160; y++) {
        for (let x = 0; x < 160; x++) {
          const v = d[(y * 160 + x) * 4]; // grayscale on black
          if (v > 40) {
            ink++;
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
            cell[Math.floor(y / 14) * 12 + Math.min(11, Math.floor(x / 14))]++;
          }
        }
      }
      g.font = measureSpec;
      const adv = g.measureText(ch).width;
      return {
        ink, adv: Math.round(adv * 1000) / 1000,
        box: maxX < 0 ? null : [minX, minY, maxX - minX + 1, maxY - minY + 1],
        sig: cell.map(v => (v > 0 ? (v > 30 ? 2 : 1) : 0)).join('')
      };
    };
    const res = {};
    for (const k in chars) res[k] = sig(chars[k]);
    return { font: fontSpec, measureFont: measureSpec, res };
  }, CHARS);

  const R = raster.res;
  const target = ['approx', 'divide', 'endash'];
  for (const k of target) {
    ok(tag + `: ${k} has ink (a glyph was actually drawn)`, R[k].ink > 0,
      { ink: R[k].ink, adv: R[k].adv });
    ok(tag + `: ${k} raster signature differs from notdef U+0378`,
      R[k].sig !== R.notdefA.sig, { glyph: R[k], notdef: R.notdefA });
    ok(tag + `: ${k} raster signature differs from notdef U+0380`,
      R[k].sig !== R.notdefB.sig, { glyph: R[k], notdef: R.notdefB });
    ok(tag + `: ${k} raster signature differs from U+FFFD`,
      R[k].sig !== R.replacement.sig, { glyph: R[k], repl: R.replacement });
  }
  // the two notdef references must agree with each other, or the instrument is
  // not measuring what it claims to measure.
  ok(tag + ': INSTRUMENT CHECK — the two unassigned codepoints render identically '
    + '(so "matches notdef" is a meaningful test)',
    R.notdefA.sig === R.notdefB.sig && R.notdefA.ink > 0,
    { a: R.notdefA, b: R.notdefB });

  // distinctness from each other and from the steppers' minus
  const pairs = [
    ['approx', 'divide'], ['approx', 'endash'], ['divide', 'endash'],
    ['endash', 'minus'], ['endash', 'hyphen'], ['minus', 'hyphen']
  ];
  for (const [a, bb] of pairs) {
    ok(tag + `: ${a} and ${bb} are visually distinct glyphs`,
      R[a].sig !== R[bb].sig || R[a].ink !== R[bb].ink,
      { [a]: R[a], [bb]: R[bb] });
  }

  // ---- 2. WRAPPING inside the strip --------------------------------------
  const wrap = await pg.evaluate(() => {
    const s = document.getElementById('strip');
    const cs = getComputedStyle(s);
    const rows = Array.from(s.querySelectorAll('[data-prj]')).map(n => {
      const c = getComputedStyle(n);
      const lh = parseFloat(c.lineHeight) || parseFloat(c.fontSize) * 1.2;
      const r = n.getBoundingClientRect();
      // Range-based line-box count: the number of client rects a Range over the
      // node's text yields is the number of line boxes it occupies.
      let boxes = 0;
      try {
        const rg = document.createRange();
        rg.selectNodeContents(n);
        boxes = rg.getClientRects().length;
      } catch (e) { boxes = -1; }
      return {
        k: n.dataset.prj, text: n.textContent,
        sw: n.scrollWidth, cw: n.clientWidth,
        h: Math.round(r.height), lh: Math.round(lh * 100) / 100,
        lineBoxes: boxes,
        whiteSpace: c.whiteSpace, overflowWrap: c.overflowWrap, wordBreak: c.wordBreak,
        overflowX: c.overflowX, textOverflow: c.textOverflow
      };
    });
    return {
      stripSW: s.scrollWidth, stripCW: s.clientWidth,
      stripOverflowX: cs.overflowX, stripW: Math.round(s.getBoundingClientRect().width),
      rows
    };
  });

  ok(tag + ': #strip does not scroll sideways (scrollWidth <= clientWidth)',
    wrap.stripSW <= wrap.stripCW, { sw: wrap.stripSW, cw: wrap.stripCW });
  const spillers = wrap.rows.filter(r => r.sw > r.cw + 1);
  ok(tag + ': no arithmetic/turns line overflows its own box horizontally',
    spillers.length === 0, spillers);
  const nowraps = wrap.rows.filter(r => /nowrap|pre$/.test(r.whiteSpace));
  ok(tag + ': no line is set white-space:nowrap (nothing is forbidden to wrap)',
    nowraps.length === 0, nowraps.map(r => [r.k, r.whiteSpace]));
  const ellipsis = wrap.rows.filter(r => r.textOverflow === 'ellipsis');
  ok(tag + ': no line is truncated with an ellipsis',
    ellipsis.length === 0, ellipsis.map(r => r.k));

  // Force a genuinely long line and prove it takes MORE THAN ONE line box.
  const forced = await pg.evaluate(() => {
    const s = document.getElementById('strip');
    const n = s.querySelector('[data-prj="work"]') || s.querySelector('[data-prj]');
    const before = n.textContent;
    n.textContent = '888888 health \u00f7 7 per turn with overkill and then some more words';
    const rg = document.createRange(); rg.selectNodeContents(n);
    const boxes = rg.getClientRects().length;
    const sw = n.scrollWidth, cw = n.clientWidth;
    n.textContent = before;
    return { boxes, sw, cw };
  });
  ok(tag + ': a deliberately over-long arithmetic line WRAPS (>1 line box) '
    + 'instead of overflowing',
    forced.boxes > 1 && forced.sw <= forced.cw + 1, forced);

  // ---- 3. the reference band, same two questions -------------------------
  const band = await pg.evaluate(() => {
    const b = document.getElementById('refband');
    if (!b) return null;
    const leaves = [];
    (function walk(n) {
      if (n.children.length === 0 && n.textContent.trim()) {
        const c = getComputedStyle(n);
        leaves.push({
          t: n.textContent.trim().slice(0, 60),
          sw: n.scrollWidth, cw: n.clientWidth, ws: c.whiteSpace, to: c.textOverflow
        });
      }
      Array.prototype.forEach.call(n.children, walk);
    })(b);
    return { sw: b.scrollWidth, cw: b.clientWidth, leaves };
  });
  if (band) {
    ok(tag + ': #refband does not scroll sideways', band.sw <= band.cw,
      { sw: band.sw, cw: band.cw });
    const bSpill = band.leaves.filter(l => l.sw > l.cw + 1);
    ok(tag + ': no reference-band leaf overflows its box', bSpill.length === 0, bSpill);
  }

  // ---- 4. screenshots, for the record ------------------------------------
  await pg.evaluate(() => { App.state.invalidate(); App.state.flush(); });
  await pg.waitForTimeout(200);
  const stripEl = await pg.$('#strip');
  if (stripEl) await stripEl.screenshot({ path: path.join(SHOT, 'strip-' + tag + '.png') });
  const bandEl = await pg.$('#refband');
  if (bandEl) await bandEl.screenshot({ path: path.join(SHOT, 'refband-' + tag + '.png') });
  // A 4x blow-up of the three glyphs side by side against notdef, so the raster
  // claim above is also visible to an eye.
  await pg.evaluate((chars) => {
    const strip = document.getElementById('strip');
    const cs = getComputedStyle(strip.querySelector('[data-prj]') || strip);
    const d = document.createElement('div');
    d.id = '__glyphprobe';
    d.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:#111;color:#fff;'
      + 'padding:14px;font-size:64px;letter-spacing:22px;font-family:' + cs.fontFamily;
    d.textContent = chars.approx + chars.divide + chars.endash + chars.minus
      + chars.hyphen + chars.notdefA + chars.replacement;
    document.body.appendChild(d);
  }, CHARS);
  await pg.waitForTimeout(120);
  const gp = await pg.$('#__glyphprobe');
  if (gp) await gp.screenshot({ path: path.join(SHOT, 'glyphs-' + tag + '.png') });
  await pg.evaluate(() => { const n = document.getElementById('__glyphprobe'); if (n) n.remove(); });

  ok(tag + ': zero page errors and zero console errors', errs.length === 0, errs.slice(0, 3));

  await b.close();
  return { tag, font: raster.font, raster: R, wrap, forced, band, shipped, ranged, errs };
}

const results = [];
for (const ch of ['chrome', 'msedge']) {
  for (const size of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }]) {
    results.push(await run(ch, size));
  }
}
writeFileSync(path.join(HERE, 'p1-result.json'),
  JSON.stringify({ when: new Date().toISOString(), pass, fail, results }, null, 1));
console.log('\n' + pass + ' passed, ' + fail + ' failed');
console.log('json: ' + path.join(HERE, 'p1-result.json'));
process.exit(fail === 0 ? 0 : 1);
