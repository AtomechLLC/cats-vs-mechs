// diagnostics: how deep does one undo go, and does a HELD Enter on Undo fire a
// burst? Each block starts from a FRESH page so nothing earlier confounds it.
// READ-ONLY.
import { pathToFileURL } from 'url';
import path from 'path';
const URL_ = pathToFileURL('C:/Projects/GameDesignSkills/GameFeelDirectionCourse/CatsVsMech/cats-vs-mechs.html').href;
const mod = await import(pathToFileURL(path.join(process.env.PLAYWRIGHT_DIR, 'index.js')).href);
const { chromium } = mod.chromium ? mod : mod.default;
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } });

const PLUS = 'button[data-k="cats/c1/maxHp+"]';
const FIELD = 'input[data-k="cats/c1/maxHp"]';
const UNDO = 'button[data-act="undo"]';

async function fresh() {
  const pg = await ctx.newPage();
  pg.on('pageerror', e => console.log('PAGEERROR', String(e)));
  await pg.goto(URL_); await pg.waitForTimeout(500);
  return pg;
}
const V = pg => pg.evaluate(s => document.querySelector(s).value, FIELD);

console.log('=== 1. three separate clicks, then Ctrl+Z once');
{
  const pg = await fresh();
  console.log('  start', await V(pg));
  for (let i = 0; i < 3; i++) { await pg.click(PLUS); await pg.waitForTimeout(250); }
  console.log('  +3   ', await V(pg));
  await pg.keyboard.press('Control+Z'); await pg.waitForTimeout(350);
  console.log('  undo1', await V(pg));
  await pg.keyboard.press('Control+Z'); await pg.waitForTimeout(350);
  console.log('  undo2', await V(pg));
  await pg.close();
}

console.log('\n=== 2. a 1.5s press-and-hold, then Ctrl+Z once');
{
  const pg = await fresh();
  const v0 = await V(pg); console.log('  start', v0);
  const box = await pg.locator(PLUS).boundingBox();
  await pg.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await pg.mouse.down(); await pg.waitForTimeout(1500); await pg.mouse.up();
  await pg.waitForTimeout(400);
  console.log('  held ', await V(pg));
  await pg.keyboard.press('Control+Z'); await pg.waitForTimeout(400);
  console.log('  undo1', await V(pg), '(expect ' + v0 + ' if a hold is ONE entry)');
  await pg.close();
}

console.log('\n=== 3. twenty rapid clicks, then Ctrl+Z once');
{
  const pg = await fresh();
  const v0 = await V(pg); console.log('  start', v0);
  for (let i = 0; i < 20; i++) await pg.click(PLUS, { delay: 0 });
  await pg.waitForTimeout(400);
  const v20 = await V(pg); console.log('  x20  ', v20);
  await pg.keyboard.press('Control+Z'); await pg.waitForTimeout(400);
  console.log('  undo1', await V(pg), '(19 = twenty separate entries; ' + v0 + ' = one coalesced entry)');
  await pg.close();
}

console.log('\n=== 4. a HELD Enter on the focused Undo button vs a single Enter');
for (const mode of ['single', 'held']) {
  const pg = await fresh();
  const cdp = await ctx.newCDPSession(pg);
  const v0 = await V(pg);
  for (let i = 0; i < 3; i++) { await pg.click(PLUS); await pg.waitForTimeout(250); }
  const v3 = await V(pg);
  await pg.focus(UNDO);
  const k = { windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, code: 'Enter', key: 'Enter', text: String.fromCharCode(13) };
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...k });
  if (mode === 'held') {
    for (let i = 0; i < 30; i++) await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...k, autoRepeat: true });
  }
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, code: 'Enter', key: 'Enter' });
  await pg.waitForTimeout(600);
  console.log('  ' + mode.padEnd(7) + ' ' + v0 + ' -> ' + v3 + ' -> ' + (await V(pg)));
  await pg.close();
}

console.log('\n=== 5. the same, but a held SPACE (the other activation key)');
for (const mode of ['single', 'held']) {
  const pg = await fresh();
  const cdp = await ctx.newCDPSession(pg);
  const v0 = await V(pg);
  for (let i = 0; i < 3; i++) { await pg.click(PLUS); await pg.waitForTimeout(250); }
  const v3 = await V(pg);
  await pg.focus(UNDO);
  const k = { windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32, code: 'Space', key: ' ', text: ' ' };
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...k });
  if (mode === 'held') { for (let i = 0; i < 30; i++) await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...k, autoRepeat: true }); }
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32, code: 'Space', key: ' ' });
  await pg.waitForTimeout(600);
  console.log('  ' + mode.padEnd(7) + ' ' + v0 + ' -> ' + v3 + ' -> ' + (await V(pg)));
  await pg.close();
}

console.log('\n=== 6. held Ctrl+Z on the document (the other way to burst an undo)');
{
  const pg = await fresh();
  const cdp = await ctx.newCDPSession(pg);
  const v0 = await V(pg);
  for (let i = 0; i < 3; i++) { await pg.click(PLUS); await pg.waitForTimeout(250); }
  const v3 = await V(pg);
  const k = { windowsVirtualKeyCode: 90, nativeVirtualKeyCode: 90, code: 'KeyZ', key: 'z', modifiers: 2 };
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...k });
  for (let i = 0; i < 30; i++) await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...k, autoRepeat: true });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...k });
  await pg.waitForTimeout(600);
  console.log('  held ctrl+z ' + v0 + ' -> ' + v3 + ' -> ' + (await V(pg)));
  await pg.close();
}
await b.close();
