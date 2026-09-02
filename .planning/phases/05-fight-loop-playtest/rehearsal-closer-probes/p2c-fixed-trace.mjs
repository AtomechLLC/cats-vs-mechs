// PROBE 2c — trace #strip in the FIGHT view at a 400px window, reading
// position/top/height AT EVERY SAMPLE rather than once. READ-ONLY.
import { pathToFileURL } from 'url';
import path from 'path';
const URL_ = pathToFileURL('C:/Projects/GameDesignSkills/GameFeelDirectionCourse/CatsVsMech/cats-vs-mechs.html').href;
const mod = await import(pathToFileURL(path.join(process.env.PLAYWRIGHT_DIR, 'index.js')).href);
const { chromium } = mod.chromium ? mod : mod.default;

for (const h of [400, 500]) {
  const b = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await b.newContext({ viewport: { width: 1366, height: h } });
  const pg = await ctx.newPage();
  await pg.goto(URL_); await pg.waitForTimeout(500);
  await pg.click('#view-fight'); await pg.waitForTimeout(250);
  let shown = await pg.evaluate(() => { const s = document.getElementById('strip'); return !!s && !s.hidden && s.getBoundingClientRect().height > 0; });
  if (!shown) { await pg.click('#proj-toggle'); await pg.waitForTimeout(300); }
  const sb = await pg.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
  const rows = [];
  const max = await pg.evaluate(() => Math.max(0, document.documentElement.scrollHeight - window.innerHeight));
  for (const y of [0, Math.round(max / 2), max, 0]) {
    await pg.evaluate(yy => window.scrollTo({ top: yy, behavior: 'instant' }), y);
    await pg.waitForTimeout(250);
    rows.push(await pg.evaluate(() => {
      const s = document.getElementById('strip');
      const c = getComputedStyle(s); const r = s.getBoundingClientRect();
      return { want: window.scrollY, pos: c.position, cssTop: c.top, cssBottom: c.bottom,
        rectTop: Math.round(r.top), rectBottom: Math.round(r.bottom), h: Math.round(r.height),
        innerH: window.innerHeight, docH: document.documentElement.scrollHeight,
        se: document.scrollingElement === document.documentElement ? 'html' : 'other' };
    }));
  }
  console.log('h=' + h, 'scroll-behavior=' + sb, 'max=' + max);
  rows.forEach(r => console.log('   ', JSON.stringify(r)));
  await b.close();
}
