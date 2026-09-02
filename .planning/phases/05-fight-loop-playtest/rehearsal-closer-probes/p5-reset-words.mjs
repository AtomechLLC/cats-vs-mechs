// PROBE 5 — 04-HUMAN-UAT check 3, the mechanical half.
//
// The check has two halves and they separate cleanly:
//   (a) MACHINE: the words exist, are on screen, are legible in the sense that
//       matters to an instrument — rendered, not clipped, not behind anything,
//       not an icon — and they NAME THE STAKES the confirmation exists for
//       (D-19: a reset's undo entry can age off the 30-deep stack). And: after
//       a confirmed reset, ONE Ctrl+Z restores the board, driven for real.
//   (b) HUMAN: whether the paragraph READS as communicating those stakes to a
//       student, and whether the recovery FEELS like recovery. No instrument.
//
// This closes (a) and quotes the words verbatim so (b) can be judged without
// operating the file. READ-ONLY.

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
const out = {};

for (const channel of ['chrome', 'msedge']) {
  const T = channel + ': ';
  const b = await chromium.launch({ channel, headless: true });
  const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e)));
  pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await pg.goto(URL_); await pg.waitForTimeout(500);

  // build something recognisably NOT the default, so "Ctrl+Z brought my board
  // back" is a measurement and not a vibe
  await pg.click('button[data-k="cats/c1/maxHp+"]'); await pg.waitForTimeout(200);
  await pg.click('button[data-k="cats/c2/maxHp+"]'); await pg.waitForTimeout(200);
  await pg.click('button[data-k="mechs/m1/shield+"]'); await pg.waitForTimeout(200);
  const mine = await pg.evaluate(() => ({
    c1: document.querySelector('input[data-k="cats/c1/maxHp"]').value,
    c2: document.querySelector('input[data-k="cats/c2/maxHp"]').value,
    m1s: document.querySelector('input[data-k="mechs/m1/shield"]').value
  }));

  await pg.click('[data-k="reset"], #reset-ask-open, button[data-act="openReset"]').catch(async () => {
    await pg.evaluate(() => { const b2 = Array.from(document.querySelectorAll('#topbar button'))
      .find(x => /^Reset$/.test(x.textContent.trim())); if (b2) b2.click(); });
  });
  await pg.waitForTimeout(350);

  const words = await pg.evaluate(() => {
    const d = document.getElementById('reset-ask');
    if (!d || !d.open) return { open: false };
    const p = document.getElementById('reset-ask-says');
    const cs = getComputedStyle(p); const r = p.getBoundingClientRect();
    const dr = d.getBoundingClientRect();
    return {
      open: true,
      title: document.getElementById('reset-ask-title').textContent,
      says: p.textContent,
      buttons: Array.from(d.querySelectorAll('button')).map(x => x.textContent.trim()),
      typography: { fontSize: cs.fontSize, lineHeight: cs.lineHeight, colour: cs.color,
        maxWidth: cs.maxWidth, box: Math.round(r.width) + 'x' + Math.round(r.height) },
      clipped: p.scrollHeight > p.clientHeight + 1 || p.scrollWidth > p.clientWidth + 1,
      insideWindow: dr.top >= -0.5 && dr.bottom <= innerHeight + 0.5
        && dr.left >= -0.5 && dr.right <= innerWidth + 0.5,
      dialogBox: Math.round(dr.width) + 'x' + Math.round(dr.height) + ' at '
        + Math.round(dr.left) + ',' + Math.round(dr.top) + ' of ' + innerWidth + 'x' + innerHeight
    };
  });
  ok(T + 'check 3 — the reset confirmation opens and its paragraph is on screen, whole, '
    + 'wholly inside the window', words.open && !words.clipped && words.insideWindow, words);
  ok(T + 'check 3 — the paragraph NAMES THE STAKES the confirmation exists for: it says '
    + 'a Ctrl+Z brings the board back AND that the entry ages off after thirty changes '
    + '(D-19)',
    /Ctrl\+Z/.test(words.says) && /thirty/i.test(words.says)
    && /(gone|lost|after which)/i.test(words.says), words.says);
  ok(T + 'check 3 — it is non-comparative: it names no other control and makes no claim '
    + 'about what token or action removal does (D-17)',
    !/(unlike|whereas|token removal|action removal|which is more|worse than)/i.test(words.says),
    words.says);
  out[channel] = { words, mine };

  // Cancel costs nothing
  await pg.click('#reset-ask-cancel'); await pg.waitForTimeout(300);
  const afterCancel = await pg.evaluate(() => ({
    open: document.getElementById('reset-ask').open,
    c1: document.querySelector('input[data-k="cats/c1/maxHp"]').value,
    c2: document.querySelector('input[data-k="cats/c2/maxHp"]').value,
    m1s: document.querySelector('input[data-k="mechs/m1/shield"]').value
  }));
  ok(T + 'check 3 — Cancel closes it and costs nothing',
    afterCancel.open === false && afterCancel.c1 === mine.c1
    && afterCancel.c2 === mine.c2 && afterCancel.m1s === mine.m1s, { mine, afterCancel });

  // Confirm, then ONE Ctrl+Z
  await pg.evaluate(() => { const b2 = Array.from(document.querySelectorAll('#topbar button'))
    .find(x => /^Reset$/.test(x.textContent.trim())); if (b2) b2.click(); });
  await pg.waitForTimeout(300);
  await pg.click('#reset-ask-confirm'); await pg.waitForTimeout(400);
  const afterReset = await pg.evaluate(() => ({
    open: document.getElementById('reset-ask').open,
    c1: document.querySelector('input[data-k="cats/c1/maxHp"]').value,
    c2: document.querySelector('input[data-k="cats/c2/maxHp"]').value,
    m1s: document.querySelector('input[data-k="mechs/m1/shield"]').value,
    cats: document.querySelectorAll('#col-cats article.unit-card').length
  }));
  ok(T + 'check 3 — confirming really does reset the board to the shipped defaults',
    // the shipped defaults, read off a fresh load rather than guessed at:
    // Cat health 3, Mech shield 3, nine Cats.
    afterReset.c1 === '3' && afterReset.c2 === '3' && afterReset.m1s === '3'
    && afterReset.cats === 9, afterReset);
  await pg.keyboard.press('Control+Z'); await pg.waitForTimeout(450);
  const afterUndo = await pg.evaluate(() => ({
    c1: document.querySelector('input[data-k="cats/c1/maxHp"]').value,
    c2: document.querySelector('input[data-k="cats/c2/maxHp"]').value,
    m1s: document.querySelector('input[data-k="mechs/m1/shield"]').value
  }));
  ok(T + 'check 3 — ONE Ctrl+Z after a confirmed reset restores the board exactly '
    + `(${JSON.stringify(mine)} -> reset -> ${JSON.stringify(afterUndo)})`,
    afterUndo.c1 === mine.c1 && afterUndo.c2 === mine.c2 && afterUndo.m1s === mine.m1s,
    { mine, afterReset, afterUndo });
  out[channel].afterReset = afterReset; out[channel].afterUndo = afterUndo;

  // the four refusal sentences, quoted for the "also unclosed, lower stakes" item
  ok(T + 'no page or console error', errs.length === 0, errs.slice(0, 3));
  await b.close();
}

writeFileSync(path.join(HERE, 'p5-result.json'), JSON.stringify({ when: new Date().toISOString(), pass, fail, out }, null, 1));
console.log('\nTHE WORDS, VERBATIM:\n  title: ' + JSON.stringify(out.chrome.words.title)
  + '\n  says:  ' + JSON.stringify(out.chrome.words.says)
  + '\n  buttons: ' + JSON.stringify(out.chrome.words.buttons)
  + '\n  typography: ' + JSON.stringify(out.chrome.words.typography)
  + '\n  dialog: ' + out.chrome.words.dialogBox);
console.log('\n' + pass + ' passed, ' + fail + ' failed');
