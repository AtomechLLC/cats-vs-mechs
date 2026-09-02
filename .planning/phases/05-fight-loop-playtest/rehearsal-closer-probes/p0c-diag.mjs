// diagnostics round 2. READ-ONLY.
import { pathToFileURL } from 'url';
import path from 'path';
const URL_ = pathToFileURL('C:/Projects/GameDesignSkills/GameFeelDirectionCourse/CatsVsMech/cats-vs-mechs.html').href;
const mod = await import(pathToFileURL(path.join(process.env.PLAYWRIGHT_DIR, 'index.js')).href);
const { chromium } = mod.chromium ? mod : mod.default;
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } });
const pg = await ctx.newPage();
pg.on('pageerror', e => console.log('PAGEERROR', String(e)));
const P = (l, o) => console.log(l, JSON.stringify(o));

await pg.goto(URL_); await pg.waitForTimeout(500);
const kids = () => pg.evaluate(() => Array.from(document.getElementById('app').children)
  .map(n => (n.id || n.tagName + '.' + (n.className || '').split(' ')[0]) + '=' + Math.round(n.getBoundingClientRect().height)
    + (n.hidden ? '[hidden]' : '')));
console.log('=== A. #app children');
P('  fresh      ', await kids());
await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(200);
await pg.click('#tok-pick-new-unit'); await pg.waitForTimeout(250);
await pg.click('#tok-pick-done'); await pg.waitForTimeout(300);
await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(200);
await pg.click('#tok-pick-list [data-tok="hp"]'); await pg.waitForTimeout(200);
await pg.click('#tok-pick-done'); await pg.waitForTimeout(300);
P('  deselected ', await kids());

console.log('\n=== B. Ctrl+Z with the caret in the name field: what actually happens');
await pg.goto(URL_); await pg.waitForTimeout(500);
await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(200);
await pg.click('#tok-pick-list [data-tok="hp"]'); await pg.waitForTimeout(150);
await pg.click('#tok-pick-name'); await pg.keyboard.press('Control+A');
await pg.keyboard.type('Vigor'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(300);
const rd = () => pg.evaluate(() => ({
  row: (document.querySelector('#tok-pick-list [data-tok="hp"]') || {}).textContent,
  label: (document.querySelector('[data-lbl="hp"]') || {}).textContent,
  field: document.getElementById('tok-pick-name').value,
  active: document.activeElement ? (document.activeElement.id || document.activeElement.dataset.k || document.activeElement.tagName) : null
}));
P('  renamed          ', await rd());
await pg.click('#tok-pick-name'); await pg.waitForTimeout(120);
P('  caret in field   ', await rd());
await pg.keyboard.press('Control+Z'); await pg.waitForTimeout(250);
P('  ctrl+z IN field  ', await rd());
await pg.click('#tok-pick-list [data-tok="ap"]'); await pg.waitForTimeout(300);
P('  then clicked ap  ', await rd());
await pg.keyboard.press('Control+Z'); await pg.waitForTimeout(300);
P('  ctrl+z out       ', await rd());
await pg.keyboard.press('Control+Z'); await pg.waitForTimeout(300);
P('  ctrl+z out x2    ', await rd());

console.log('\n=== C. picker state after a refused (whitespace) rename');
await pg.goto(URL_); await pg.waitForTimeout(500);
await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(200);
await pg.click('#tok-pick-list [data-tok="shield"]'); await pg.waitForTimeout(150);
await pg.click('#tok-pick-name'); await pg.keyboard.press('Control+A');
await pg.keyboard.type('   '); await pg.keyboard.press('Enter'); await pg.waitForTimeout(400);
const c = await pg.evaluate(() => ({
  open: document.getElementById('tok-picker').open,
  field: document.getElementById('tok-pick-name').value,
  warnHidden: document.getElementById('tok-pick-names').hidden,
  warnText: document.getElementById('tok-pick-names').textContent.trim(),
  errHidden: document.getElementById('err-panel').hidden,
  errMsg: (document.getElementById('err-message') || {}).textContent,
  listRows: Array.from(document.querySelectorAll('#tok-pick-list [data-act="selectTokenType"]')).map(n => {
    const r = n.getBoundingClientRect();
    return n.dataset.tok + ':' + Math.round(r.width) + 'x' + Math.round(r.height) + '@' + Math.round(r.top); }),
  list: (() => { const l = document.getElementById('tok-pick-list'); const r = l.getBoundingClientRect();
    return { h: Math.round(r.height), top: Math.round(r.top), sh: l.scrollHeight, ch: l.clientHeight,
      oy: getComputedStyle(l).overflowY }; })(),
  dialog: (() => { const d = document.getElementById('tok-picker'); const r = d.getBoundingClientRect();
    return { top: Math.round(r.top), h: Math.round(r.height), win: innerHeight }; })()
}));
console.log(JSON.stringify(c, null, 1));
await b.close();
