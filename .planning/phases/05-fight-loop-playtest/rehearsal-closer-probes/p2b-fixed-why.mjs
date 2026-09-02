// PROBE 2b — why does a position:fixed #strip move 1:1 with scroll at short
// window heights in the FIGHT view? Either an ancestor creates a containing
// block for fixed descendants (transform / filter / backdrop-filter /
// will-change / contain / perspective / container-type), or the element is not
// really fixed. This isolates which. READ-ONLY.
import { pathToFileURL } from 'url';
import path from 'path';
const URL_ = pathToFileURL('C:/Projects/GameDesignSkills/GameFeelDirectionCourse/CatsVsMech/cats-vs-mechs.html').href;
const mod = await import(pathToFileURL(path.join(process.env.PLAYWRIGHT_DIR, 'index.js')).href);
const { chromium } = mod.chromium ? mod : mod.default;

const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 1366, height: 400 } });
const pg = await ctx.newPage();
await pg.goto(URL_); await pg.waitForTimeout(500);
await pg.click('#view-fight'); await pg.waitForTimeout(200);
let shown = await pg.evaluate(() => { const s = document.getElementById('strip'); return !!s && !s.hidden && s.getBoundingClientRect().height > 0; });
if (!shown) { await pg.click('#proj-toggle'); await pg.waitForTimeout(250); }

const r = await pg.evaluate(() => {
  const s = document.getElementById('strip');
  const props = ['position', 'top', 'bottom', 'left', 'right', 'height', 'maxHeight', 'transform',
    'filter', 'backdropFilter', 'willChange', 'contain', 'perspective', 'containerType', 'zIndex'];
  const dump = n => { const c = getComputedStyle(n); const o = {}; props.forEach(p => o[p] = c[p]); return o; };
  const anc = []; let p = s.parentElement;
  while (p) { anc.push({ who: p.tagName + (p.id ? '#' + p.id : ''), css: dump(p) }); p = p.parentElement; }
  const before = s.getBoundingClientRect().top;
  window.scrollTo(0, 100);
  const after = s.getBoundingClientRect().top;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:4px;height:4px';
  document.body.appendChild(probe);
  const ctrl = probe.getBoundingClientRect().top;
  const probe2 = document.createElement('div');
  probe2.style.cssText = 'position:fixed;top:0;left:0;width:4px;height:4px';
  s.parentElement.appendChild(probe2);
  const ctrlInBoard = probe2.getBoundingClientRect().top;
  probe.remove(); probe2.remove();
  const out = { strip: dump(s), anc, before, after, scrollY: window.scrollY,
    controlFixedInBody: ctrl, controlFixedInBoard: ctrlInBoard,
    docScrollTop: document.documentElement.scrollTop, bodyScrollTop: document.body.scrollTop };
  window.scrollTo(0, 0);
  return out;
});
console.log(JSON.stringify(r, null, 1));
await b.close();
