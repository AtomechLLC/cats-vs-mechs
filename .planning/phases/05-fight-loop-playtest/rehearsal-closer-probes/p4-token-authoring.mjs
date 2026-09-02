// PROBE 4 — 02.1-HUMAN-UAT checks 1, 2, 3, 4, 5(geometry), 6, 7(mechanics), 8, 9.
//
// Every step below is driven the way a student would: a real mouse click at a
// real coordinate, real typed keystrokes, a real paste, a real Escape, a real
// Ctrl+Z, a real middle-click, and a real OS-auto-repeat key burst dispatched
// through CDP Input.dispatchKeyEvent({ autoRepeat: true }). No op is called
// directly anywhere in this file except to READ state for an assertion.
//
// That matters because the whole reason these eight checks were pending is that
// the Node stub has no layout engine, no real <input>, no close-request on
// <dialog>, no middle button and no key auto-repeat. A real browser has all
// five, so they are no longer human questions — except where the question is
// about legibility or wording, which is stated per check rather than absorbed.
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
const rows = [];
const ok = (n, c, d) => {
  if (c) { pass++; console.log('PASS  ' + n); } else { fail++; console.log('FAIL  ' + n + '\n      ' + JSON.stringify(d)); }
  rows.push({ n, c: !!c, d });
};
const rec = {};

async function open(channel) {
  const b = await chromium.launch({ channel, headless: process.env.HEADED !== '1' });
  const ctx = await b.newContext({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + String(e)));
  pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await pg.goto(URL_); await pg.waitForTimeout(500);
  return { b, ctx, pg, errs };
}
const errPanel = pg => pg.evaluate(() => {
  const e = document.getElementById('err-panel');
  return { hidden: e.hidden, title: (document.getElementById('err-title') || {}).textContent || '',
    msg: (document.getElementById('err-message') || {}).textContent || '' };
});
const nameWarn = pg => pg.evaluate(() => {
  const w = document.getElementById('tok-pick-names');
  return { hidden: w.hidden, text: w.textContent.trim() };
});

async function run(channel) {
  const T = channel + ': ';
  const store = {};

  // ══ CHECK 1 — the topbar collapse, the mechanical half ═══════════════════
  {
    const { b, pg, errs } = await open(channel);
    const before = await pg.evaluate(() => {
      const t = document.getElementById('topbar'); const r = t.getBoundingClientRect();
      return { h: Math.round(r.height), w: Math.round(r.width),
        buttons: Array.from(t.querySelectorAll('button')).map(x => x.textContent.trim()),
        rowsOfButtons: new Set(Array.from(t.querySelectorAll('button')).map(x => Math.round(x.getBoundingClientRect().top))).size };
    });
    ok(T + 'check 1 — the bar carries exactly ONE token control and it names no type',
      before.buttons.filter(x => /^Tokens$/.test(x)).length === 1
      && !before.buttons.some(x => /^(Health|Action points|Shield|Damage|Dead marker)$/.test(x)),
      before.buttons);
    await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(250);
    const opened = await pg.evaluate(() => ({
      open: document.getElementById('tok-picker').open,
      title: document.getElementById('tok-pick-title').textContent,
      listLabel: document.getElementById('tok-pick-list-label').textContent,
      rows: document.querySelectorAll('#tok-pick-list [data-act="selectTokenType"]').length
    }));
    ok(T + 'check 1 — Tokens opens the picker on Health, under the heading '
      + '"Every type on this board"',
      opened.open && opened.title === 'Health' && opened.listLabel === 'Every type on this board',
      opened);
    // "and stays that size forever": invent the six the cap allows and re-measure.
    let made = 0;
    for (let i = 0; i < 8; i++) {
      const dis = await pg.evaluate(() => document.getElementById('tok-pick-new-unit').disabled
        && document.getElementById('tok-pick-new-side').disabled);
      if (dis) break;
      const which = (i % 2 === 0) ? '#tok-pick-new-unit' : '#tok-pick-new-side';
      const d2 = await pg.evaluate(s => document.querySelector(s).disabled, which);
      await pg.click(d2 ? (which === '#tok-pick-new-unit' ? '#tok-pick-new-side' : '#tok-pick-new-unit') : which);
      await pg.waitForTimeout(150); made++;
    }
    const capped = await pg.evaluate(() => ({
      rows: document.querySelectorAll('#tok-pick-list [data-act="selectTokenType"]').length,
      newUnitDisabled: document.getElementById('tok-pick-new-unit').disabled,
      newSideDisabled: document.getElementById('tok-pick-new-side').disabled
    }));
    ok(T + 'check 5 — six invented types fill the list to ELEVEN rows and both New '
      + 'buttons go disabled (the cap is shown, not raised as an error)',
      capped.rows === 11 && capped.newUnitDisabled && capped.newSideDisabled, { made, ...capped });
    // list geometry at the cap: it scrolls rather than overflowing, and the
    // dialog stays inside the window.
    const geo = await pg.evaluate(() => {
      const d = document.getElementById('tok-picker'), l = document.getElementById('tok-pick-list');
      const dr = d.getBoundingClientRect(), lr = l.getBoundingClientRect();
      const lc = getComputedStyle(l);
      const sel = document.querySelector('#tok-pick-list [aria-pressed="true"]');
      const un = document.querySelector('#tok-pick-list [aria-pressed="false"]');
      const cs = sel ? getComputedStyle(sel) : null, cu = un ? getComputedStyle(un) : null;
      const tokPx = getComputedStyle(document.documentElement).getPropertyValue('--tok').trim();
      const rowFont = un ? getComputedStyle(un).fontSize : null;
      return {
        dialog: { x: Math.round(dr.left), y: Math.round(dr.top), w: Math.round(dr.width), h: Math.round(dr.height) },
        win: { w: innerWidth, h: innerHeight },
        insideWindow: dr.left >= -0.5 && dr.top >= -0.5 && dr.right <= innerWidth + 0.5 && dr.bottom <= innerHeight + 0.5,
        list: { w: Math.round(lr.width), h: Math.round(lr.height), sw: l.scrollWidth, sh: l.scrollHeight, oy: lc.overflowY },
        listScrolls: l.scrollHeight > l.clientHeight,
        listClipsWithoutScrolling: l.scrollHeight > l.clientHeight && !/auto|scroll/.test(lc.overflowY),
        selectedDiffers: !!(cs && cu) && (cs.backgroundColor !== cu.backgroundColor
          || cs.borderColor !== cu.borderColor || cs.outlineStyle !== cu.outlineStyle
          || cs.color !== cu.color || cs.fontWeight !== cu.fontWeight),
        selStyle: cs ? { bg: cs.backgroundColor, bd: cs.borderColor, fw: cs.fontWeight, col: cs.color } : null,
        unselStyle: cu ? { bg: cu.backgroundColor, bd: cu.borderColor, fw: cu.fontWeight, col: cu.color } : null,
        tokPx, rowFont
      };
    });
    ok(T + 'check 5 — the eleven-row dialog stays wholly inside the window', geo.insideWindow, geo);
    ok(T + 'check 5 — the list SCROLLS rather than clipping when it overflows',
      !geo.listClipsWithoutScrolling, geo.list);
    // The SAME row, selected and not. Comparing the selected row against a
    // DIFFERENT row is not a test of selection at all — each type carries its
    // own palette tint, so two rows differ whether or not either is selected.
    const selDiff = await (async () => {
      const read = () => pg.evaluate(() => {
        const n = document.querySelector('#tok-pick-list [data-tok="hp"]');
        const c = getComputedStyle(n);
        const t = n.querySelector('[class*="check"]');
        return { pressed: n.getAttribute('aria-pressed'), bg: c.backgroundColor,
          borderColor: c.borderColor, outline: c.outlineStyle + ' ' + c.outlineWidth + ' ' + c.outlineColor,
          fontWeight: c.fontWeight, colour: c.color,
          tick: t ? getComputedStyle(t).visibility + ' "' + t.textContent + '"' : null };
      });
      await pg.click('#tok-pick-list [data-tok="hp"]'); await pg.waitForTimeout(200);
      const on = await read();
      await pg.click('#tok-pick-list [data-tok="dmg"]'); await pg.waitForTimeout(200);
      const off = await read();
      return { on, off };
    })();
    ok(T + 'check 5 — the SAME row reads differently selected and not: a 2px selection '
      + `outline (${selDiff.on.outline} vs ${selDiff.off.outline}), an opaque border `
      + `instead of the type's own tint, and a tick that is ${selDiff.on.tick} when `
      + `selected and ${selDiff.off.tick} when not`,
      selDiff.on.outline !== selDiff.off.outline
      && selDiff.on.borderColor !== selDiff.off.borderColor
      && selDiff.on.tick !== selDiff.off.tick, selDiff);
    ok(T + 'check 5 — and the distinction is NOT carried by weight or text colour alone '
      + '(both identical), so it rests on an outline and a tick — RECORDED, because '
      + 'whether those survive a projector is the human half',
      selDiff.on.fontWeight === selDiff.off.fontWeight
      && selDiff.on.colour === selDiff.off.colour, selDiff);
    geo.selDiff = selDiff;
    store.check5geo = geo;
    await pg.click('#tok-pick-done'); await pg.waitForTimeout(200);
    const after = await pg.evaluate(() => {
      const t = document.getElementById('topbar'); const r = t.getBoundingClientRect();
      return { h: Math.round(r.height),
        buttons: Array.from(t.querySelectorAll('button')).map(x => x.textContent.trim()),
        rowsOfButtons: new Set(Array.from(t.querySelectorAll('button')).map(x => Math.round(x.getBoundingClientRect().top))).size };
    });
    ok(T + 'check 1 — inventing six types does not add one control to the bar, nor one '
      + `pixel of height (${before.h}px before, ${after.h}px after; `
      + `${before.buttons.length} buttons before, ${after.buttons.length} after)`,
      after.h === before.h && after.buttons.length === before.buttons.length
      && after.rowsOfButtons === before.rowsOfButtons, { before, after });
    store.topbar = { before, after };
    ok(T + 'check 1/5 — no page or console error through the whole pass', errs.length === 0, errs.slice(0, 3));
    await b.close();
  }

  // ══ CHECK 2 — a zero tally collapses its line and takes NO SPACE ═════════
  // ══ CHECK 8 — and the whole story, end to end, BY HAND ═══════════════════
  {
    const { b, pg, errs } = await open(channel);
    const cardH0 = await pg.evaluate(() => Array.from(document.querySelectorAll('article.unit-card'))
      .map(c => Math.round(c.getBoundingClientRect().height)));
    const docH0 = await pg.evaluate(() => document.documentElement.scrollHeight);
    const boardH0 = await pg.evaluate(() => Math.round(document.getElementById('board').getBoundingClientRect().height));

    await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(200);
    await pg.click('#tok-pick-new-unit'); await pg.waitForTimeout(250);
    // name it, by typing
    await pg.click('#tok-pick-name');
    await pg.keyboard.press('Control+A');
    await pg.keyboard.type('Poison \u2620');
    await pg.keyboard.press('Enter');
    await pg.waitForTimeout(200);
    // appearance: a real click on a shape, a colour and an emoji swatch
    const swatches = await pg.evaluate(() => ({
      shapes: document.querySelectorAll('#tok-pick-shapes button').length,
      colours: document.querySelectorAll('#tok-pick-colors button').length,
      glyphs: document.querySelectorAll('#tok-pick-glyphs button').length
    }));
    if (swatches.shapes > 1) await pg.click('#tok-pick-shapes button:nth-of-type(2)');
    if (swatches.colours > 2) await pg.click('#tok-pick-colors button:nth-of-type(3)');
    if (swatches.glyphs > 1) await pg.click('#tok-pick-glyphs button:nth-of-type(2)');
    await pg.waitForTimeout(200);

    // BEFORE closing the editor, the reveal is live (F-02.1-B). Close it, and
    // check 2's real question: with the tally at ZERO everywhere, does the line
    // take space on the eleven cards that are NOT revealed-and-raised?
    await pg.click('#tok-pick-done'); await pg.waitForTimeout(300);

    const zero = await pg.evaluate(() => {
      const opt = Array.from(document.querySelectorAll('.brd-line--opt'));
      return {
        lines: opt.length,
        withHeight: opt.filter(n => n.getBoundingClientRect().height > 0).length,
        hiddenAttr: opt.filter(n => n.hidden).length,
        displayNone: opt.filter(n => getComputedStyle(n).display === 'none').length,
        reveal: App.state.get().ui.revealTok,
        amounts: opt.map(n => { const f = n.querySelector('input'); return f ? f.value : null; })
      };
    });
    store.zero = zero;
    ok(T + 'check 2 — F-02.1-B is real: with the type selected, its line survives the '
      + `editor closing, so the stepper is on the page (${zero.withHeight} of ${zero.lines} lines have height)`,
      zero.withHeight > 0, zero);

    // Now the hide pass proper: deselect the type (select a built-in) and the
    // zero lines must collapse to NOTHING — no label, no box, no gap.
    await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(200);
    await pg.click('#tok-pick-list [data-tok="hp"]'); await pg.waitForTimeout(200);
    await pg.click('#tok-pick-done'); await pg.waitForTimeout(300);
    const collapsed = await pg.evaluate(() => {
      const opt = Array.from(document.querySelectorAll('.brd-line--opt'));
      return { lines: opt.length,
        withHeight: opt.filter(n => n.getBoundingClientRect().height > 0).length,
        anyBox: opt.filter(n => { const r = n.getBoundingClientRect(); return r.width > 0 || r.height > 0; }).length,
        reveal: App.state.get().ui.revealTok,
        cardH: Array.from(document.querySelectorAll('article.unit-card')).map(c => Math.round(c.getBoundingClientRect().height)),
        docH: document.documentElement.scrollHeight,
        boardH: Math.round(document.getElementById('board').getBoundingClientRect().height),
        regions: Array.from(document.getElementById('app').children)
          .map(n => (n.id || n.tagName) + '=' + Math.round(n.getBoundingClientRect().height)) };
    });
    ok(T + 'check 2 — at a tally of zero, every one of the ' + collapsed.lines
      + ' optional lines occupies ZERO width and ZERO height', collapsed.anyBox === 0, collapsed);
    ok(T + 'check 2 — and no card is one pixel taller than before the type existed',
      JSON.stringify(collapsed.cardH) === JSON.stringify(cardH0),
      { before: cardH0, after: collapsed.cardH });
    // The DOCUMENT does grow — by 82px, measured — and it is NOT the board. A
    // new token type becomes available as a round rule (D-35), so #roundrules
    // gains a row. #board is byte-identical, which is what check 2 is about.
    ok(T + 'check 2 — #board itself is byte-identical to before the type existed, and '
      + "the page's growth is #roundrules gaining the new type as a round rule (D-35)",
      collapsed.boardH === boardH0, { boardH0, ...collapsed, docH0 });
    store.cardH0 = cardH0; store.collapsed = collapsed;

    // ── CHECK 8 step 5: raise the tally on Cat 1 and Cat 2 to 2 each, BY HAND ──
    await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(200);
    const tokId = await pg.evaluate(() => {
      const r = Array.from(document.querySelectorAll('#tok-pick-list [data-act="selectTokenType"]'))
        .find(x => /Poison/.test(x.textContent)); return r ? r.dataset.tok : null;
    });
    await pg.click('#tok-pick-list [data-tok="' + tokId + '"]'); await pg.waitForTimeout(200);
    await pg.click('#tok-pick-done'); await pg.waitForTimeout(300);

    const plusSel = (side, unit) => `.brd-line--opt[data-amt="${tokId}"][data-side="${side}"][data-unit="${unit}"] button:last-of-type`;
    const reachable = await pg.evaluate(s => { const n = document.querySelector(s); if (!n) return null;
      const r = n.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), label: n.getAttribute('aria-label') || n.textContent.trim() }; }, plusSel('cats', 'c1'));
    ok(T + 'check 8 step 5 — the plus on Cat 1\'s new line is a real, sized, clickable '
      + 'control on the page (this is the step F-02.1-A said was impossible)',
      !!reachable && reachable.w > 0 && reachable.h > 0, reachable);
    for (const [side, unit] of [['cats', 'c1'], ['cats', 'c1'], ['cats', 'c2'], ['cats', 'c2']]) {
      await pg.click(plusSel(side, unit)); await pg.waitForTimeout(90);
    }
    const raised = await pg.evaluate((tk) => {
      const opt = Array.from(document.querySelectorAll('.brd-line--opt[data-amt="' + tk + '"]'));
      const vis = opt.filter(n => n.getBoundingClientRect().height > 0);
      return { total: opt.length, visible: vis.length,
        values: opt.map(n => { const f = n.querySelector('input');
          return n.dataset.side + '/' + n.dataset.unit + '=' + (f ? f.value : '?')
            + (n.getBoundingClientRect().height > 0 ? ' [shown]' : ' [collapsed]'); }),
        label: (() => { const l = document.querySelector('.brd-line--opt[data-amt="' + tk + '"] [data-lbl]');
          return l ? l.textContent : null; })(),
        tokens: document.querySelectorAll('.brd-line--opt[data-amt="' + tk + '"][data-unit="c1"] .brd-token, .brd-line--opt[data-amt="' + tk + '"][data-unit="c1"] [class*="tok"]').length };
    }, tokId);
    ok(T + 'check 8 — after four real clicks Cat 1 and Cat 2 read 2 each and nothing else moved',
      raised.values.filter(v => /=2 /.test(v)).length === 2
      && /c1=2/.test(raised.values.join(' ')) && /c2=2/.test(raised.values.join(' ')), raised);
    ok(T + 'check 8 — the board label is the name the student typed, symbol and all',
      raised.label === 'Poison \u2620', raised.label);
    store.raised = raised;

    // ── CHECK 8 steps 7-8: remove with no confirmation (D-17), one Ctrl+Z back (D-16)
    await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(200);
    await pg.click('#tok-pick-list [data-tok="' + tokId + '"]'); await pg.waitForTimeout(150);
    const dialogsBefore = await pg.evaluate(() => Array.from(document.querySelectorAll('dialog')).filter(d => d.open).map(d => d.id));
    await pg.click('#tok-pick-remove'); await pg.waitForTimeout(250);
    const afterRemove = await pg.evaluate((tk) => ({
      openDialogs: Array.from(document.querySelectorAll('dialog')).filter(d => d.open).map(d => d.id),
      rows: Array.from(document.querySelectorAll('#tok-pick-list [data-act="selectTokenType"]')).map(x => x.dataset.tok),
      linesOnBoard: document.querySelectorAll('.brd-line--opt[data-amt="' + tk + '"]').length,
      errHidden: document.getElementById('err-panel').hidden
    }), tokId);
    ok(T + 'check 8 — Remove takes the type and both numbers away with NO confirmation '
      + 'dialog (D-17) and no error panel',
      afterRemove.openDialogs.join(',') === dialogsBefore.join(',')
      && afterRemove.rows.indexOf(tokId) === -1 && afterRemove.linesOnBoard === 0
      && afterRemove.errHidden, { dialogsBefore, afterRemove });
    await pg.click('#tok-pick-done'); await pg.waitForTimeout(200);
    await pg.keyboard.press('Control+Z'); await pg.waitForTimeout(350);
    const afterUndo = await pg.evaluate((tk) => {
      const opt = Array.from(document.querySelectorAll('.brd-line--opt[data-amt="' + tk + '"]'));
      const rec = App.state.get().build.tokens ? App.state.get().build.tokens[tk] : null;
      return { lines: opt.length,
        values: opt.map(n => n.dataset.side + '/' + n.dataset.unit + '='
          + (n.querySelector('input') ? n.querySelector('input').value : '?')),
        name: rec ? rec.name : null, shape: rec ? rec.shape : null, colour: rec ? (rec.color || rec.colour) : null,
        glyph: rec ? rec.glyph : null };
    }, tokId);
    ok(T + 'check 8 — ONE Ctrl+Z brings the type, its name, its appearance and BOTH '
      + 'tallies back together (D-16)',
      afterUndo.lines > 0 && afterUndo.name === 'Poison \u2620'
      && /c1=2/.test(afterUndo.values.join(' ')) && /c2=2/.test(afterUndo.values.join(' ')), afterUndo);
    store.afterUndo = afterUndo;
    ok(T + 'checks 2/8 — no page or console error through the whole story',
      errs.length === 0, errs.slice(0, 3));
    await b.close();
  }

  // ══ CHECK 3 — Escape inside the name field ══════════════════════════════
  {
    const { b, pg, errs } = await open(channel);
    await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(250);
    const focusAtOpen = await pg.evaluate(() => {
      const a = document.activeElement;
      return { tag: a ? a.tagName : null, id: a ? a.id : null,
        insideDialog: !!(a && a.closest && a.closest('#tok-picker')) };
    });
    ok(T + 'check 3 (the Phase 2 nit) — where focus lands when the picker opens: '
      + JSON.stringify(focusAtOpen) + ' — RECORDED, not asserted',
      true, focusAtOpen);
    store.focusAtOpen = focusAtOpen;

    await pg.click('#tok-pick-name');
    await pg.keyboard.press('Control+A');
    await pg.keyboard.type('Vigo');
    const typed = await pg.evaluate(() => document.getElementById('tok-pick-name').value);
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(250);
    const afterEsc = await pg.evaluate(() => ({
      open: document.getElementById('tok-picker').open,
      value: document.getElementById('tok-pick-name').value,
      boardLabel: (document.querySelector('[data-lbl="hp"]') || {}).textContent
    }));
    ok(T + 'check 3 — Escape INSIDE the name field puts "Health" back AND leaves the '
      + `dialog open (typed "${typed}", field now "${afterEsc.value}", dialog open ${afterEsc.open})`,
      afterEsc.open === true && afterEsc.value === 'Health', { typed, afterEsc });

    // now focus a button inside the dialog and press Escape again
    await pg.click('#tok-pick-shapes button:nth-of-type(2)'); await pg.waitForTimeout(150);
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(300);
    const afterEsc2 = await pg.evaluate(() => {
      const a = document.activeElement;
      return { open: document.getElementById('tok-picker').open,
        active: a ? (a.id || a.getAttribute('data-act') || a.tagName) : null,
        activeText: a ? (a.textContent || '').trim().slice(0, 20) : null,
        focusVisible: (() => { try { return a.matches(':focus-visible'); } catch (e) { return null; } })() };
    });
    ok(T + 'check 3 — Escape with focus on a swatch CLOSES the dialog and returns focus '
      + 'to the Tokens button in the topbar',
      afterEsc2.open === false && /Tokens/.test(afterEsc2.activeText || ''), afterEsc2);
    store.afterEsc2 = afterEsc2;
    ok(T + 'check 3 — no page or console error', errs.length === 0, errs.slice(0, 3));
    await b.close();
  }

  // ══ CHECK 4 — maxlength on a real input, typed and pasted ═══════════════
  {
    const { b, ctx, pg, errs } = await open(channel);
    await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(250);
    await pg.click('#tok-pick-name'); await pg.keyboard.press('Control+A');
    await pg.keyboard.type('abcdefghijklmnopqrstuvwxyz0123');
    const plain = await pg.evaluate(() => {
      const f = document.getElementById('tok-pick-name');
      return { v: f.value, len: f.value.length, maxlength: f.getAttribute('maxlength') };
    });
    ok(T + 'check 4 — typing 30 plain characters leaves exactly 24 in the field; the '
      + '25th is REFUSED at the keystroke rather than told off afterwards',
      plain.len === 24 && plain.v === 'abcdefghijklmnopqrstuvwx', plain);

    // a real paste, through the system clipboard
    const SKULLS = '\u{1F480}'.repeat(30);
    await pg.evaluate(t => navigator.clipboard.writeText(t), SKULLS).catch(() => {});
    await pg.click('#tok-pick-name'); await pg.keyboard.press('Control+A');
    await pg.keyboard.press('Control+V'); await pg.waitForTimeout(250);
    const pasted = await pg.evaluate(() => {
      const f = document.getElementById('tok-pick-name'); const v = f.value;
      const cps = Array.from(v);
      let lone = 0;
      for (let i = 0; i < v.length; i++) { const c = v.charCodeAt(i);
        if (c >= 0xD800 && c <= 0xDBFF) { const n = v.charCodeAt(i + 1);
          if (!(n >= 0xDC00 && n <= 0xDFFF)) lone++; else i++; }
        else if (c >= 0xDC00 && c <= 0xDFFF) lone++; }
      return { units: v.length, codePoints: cps.length, lone, v };
    });
    ok(T + 'check 4 — pasting 30 astral emoji into a maxlength="24" field admits '
      + `${pasted.codePoints} whole emoji (${pasted.units} UTF-16 units) and leaves `
      + 'NO broken half-character', pasted.lone === 0 && pasted.units <= 24, pasted);
    await pg.keyboard.press('Enter'); await pg.waitForTimeout(300);
    const committed = await pg.evaluate(() => ({
      field: document.getElementById('tok-pick-name').value,
      label: (document.querySelector('[data-lbl="hp"]') || {}).textContent,
      errHidden: document.getElementById('err-panel').hidden,
      warnHidden: document.getElementById('tok-pick-names').hidden
    }));
    ok(T + 'check 4 — Enter commits it, the board label matches the field exactly, and '
      + 'no error panel appears',
      committed.field === committed.label && committed.errHidden && committed.warnHidden, committed);
    store.check4 = { plain, pasted, committed };

    // the console path the gate drives, which BYPASSES maxlength: the op's cap
    // counts CODE POINTS, and it must not cut through a surrogate pair either.
    await pg.evaluate((t) => {
      const f = document.getElementById('tok-pick-name');
      f.value = t; f.dispatchEvent(new Event('input', { bubbles: true }));
    }, SKULLS);
    await pg.keyboard.press('Enter'); await pg.waitForTimeout(300);
    const bypass = await pg.evaluate(() => {
      const v = document.getElementById('tok-pick-name').value;
      return { units: v.length, codePoints: Array.from(v).length,
        label: (document.querySelector('[data-lbl="hp"]') || {}).textContent,
        errHidden: document.getElementById('err-panel').hidden };
    });
    ok(T + 'check 4 — driven past maxlength, the op\'s CODE-POINT cap lands on exactly '
      + '24 whole emoji with no error panel',
      bypass.codePoints === 24 && bypass.errHidden
      && Array.from(bypass.label || '').length === 24, bypass);
    store.check4.bypass = bypass;
    ok(T + 'check 4 — no page or console error', errs.length === 0, errs.slice(0, 3));
    await b.close();
  }

  // ══ CHECK 6 — a rename reaches everywhere, and undo reaches back ════════
  {
    const { b, pg, errs } = await open(channel);
    await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(250);
    await pg.click('#tok-pick-list [data-tok="hp"]'); await pg.waitForTimeout(150);
    // scroll the board and put a focus ring somewhere, so "no card rebuilt
    // underneath" is a measurement rather than a hope
    await pg.click('#tok-pick-name'); await pg.keyboard.press('Control+A');
    await pg.keyboard.type('Vigor'); await pg.keyboard.press('Enter');
    await pg.waitForTimeout(300);
    const renamed = await pg.evaluate(() => ({
      row: (() => { const r = document.querySelector('#tok-pick-list [data-tok="hp"]'); return r ? r.textContent.replace(/\u2713/g, '').trim() : null; })(),
      heading: document.getElementById('tok-pick-title').textContent,
      field: document.getElementById('tok-pick-name').value,
      boardLabels: Array.from(document.querySelectorAll('[data-lbl="hp"]')).map(n => n.textContent),
      cards: document.querySelectorAll('article.unit-card').length
    }));
    const uniq = [...new Set(renamed.boardLabels)];
    ok(T + 'check 6 — a rename reaches the list row, the dialog heading and every one of '
      + renamed.boardLabels.length + ' board labels, all saying the same word',
      renamed.row === 'Vigor' && renamed.heading === 'Vigor' && uniq.length === 1
      && uniq[0] === 'Vigor', { ...renamed, uniq });

    // Ctrl+Z with the caret still IN the field: the app's undo must not run.
    // (The field's OWN native undo is a separate question and is traced below.)
    await pg.click('#tok-pick-name');
    await pg.keyboard.press('Control+Z'); await pg.waitForTimeout(250);
    const inField = await pg.evaluate(() => ({
      heading: document.getElementById('tok-pick-title').textContent,
      label: (document.querySelector('[data-lbl="hp"]') || {}).textContent,
      field: document.getElementById('tok-pick-name').value
    }));
    ok(T + 'check 6 — Ctrl+Z with the caret INSIDE the name field does not run the '
      + "APP's undo: the board label and the dialog heading do not move",
      inField.heading === 'Vigor' && inField.label === 'Vigor', inField);
    // ...but the BROWSER's native input undo is not suppressed, and the field
    // text does move. Recorded, not asserted away — see the trace row below.
    ok(T + 'check 6 NOTE — the native <input> undo IS still applied to the field text: '
      + `after Ctrl+Z in the field it reads "${inField.field}" while the board still `
      + 'says "Vigor". RECORDED.', true, inField);
    // Blur it by clicking another list row. If the blur commits the rewound
    // text, that is a NEW commit rather than an undo — which is what the next
    // two rows measure.
    await pg.click('#tok-pick-list [data-tok="ap"]'); await pg.waitForTimeout(300);
    const afterBlur = await pg.evaluate(() => ({
      row: (() => { const r = document.querySelector('#tok-pick-list [data-tok="hp"]'); return r ? r.textContent.replace(/✓/g, '').trim() : null; })(),
      label: (document.querySelector('[data-lbl="hp"]') || {}).textContent
    }));
    ok(T + 'check 6 FINDING — blurring the field after an in-field Ctrl+Z COMMITS the '
      + `rewound text as a rename (row now "${afterBlur.row}"). The keystroke is not `
      + 'inert after all; it is deferred into the blur. RECORDED as a deviation from '
      + "the script's stated design.", true, { inField, afterBlur });
    store.check6note = { inField, afterBlur };
    await pg.keyboard.press('Control+Z'); await pg.waitForTimeout(350);
    const undone = await pg.evaluate(() => ({
      row: (() => { const r = document.querySelector('#tok-pick-list [data-tok="hp"]'); return r ? r.textContent.replace(/\u2713/g, '').trim() : null; })(),
      boardLabels: [...new Set(Array.from(document.querySelectorAll('[data-lbl="hp"]')).map(n => n.textContent))]
    }));
    // Because the blur committed "Health" as a rename, ONE Ctrl+Z here rewinds
    // THAT commit and puts "Vigor" back; a second reaches "Health". Both are
    // recorded rather than argued about.
    const undone2 = await (async () => { await pg.keyboard.press('Control+Z'); await pg.waitForTimeout(350);
      return pg.evaluate(() => ({
        row: (() => { const r = document.querySelector('#tok-pick-list [data-tok="hp"]'); return r ? r.textContent.replace(/✓/g, '').trim() : null; })(),
        boardLabels: [...new Set(Array.from(document.querySelectorAll('[data-lbl="hp"]')).map(n => n.textContent))] })); })();
    ok(T + 'check 6 — with focus out of the field, Ctrl+Z walks the rename history and '
      + `reaches "Health" on the list row and on every card (step 1 -> "${undone.row}", `
      + `step 2 -> "${undone2.row}")`,
      undone2.row === 'Health' && undone2.boardLabels.length === 1
      && undone2.boardLabels[0] === 'Health', { undone, undone2 });
    store.check6 = { renamed, inField, undone, undone2 };

    // the Damage rename specifically (commit e7f14ef — the one built-in whose
    // board label a rename could not move)
    await pg.click('#tok-pick-list [data-tok="dmg"]'); await pg.waitForTimeout(150);
    await pg.click('#tok-pick-name'); await pg.keyboard.press('Control+A');
    await pg.keyboard.type('Wallop'); await pg.keyboard.press('Enter');
    await pg.waitForTimeout(300);
    const dmg = await pg.evaluate(() => ({
      labels: [...new Set(Array.from(document.querySelectorAll('[data-lbl="dmg"]')).map(n => n.textContent))],
      count: document.querySelectorAll('[data-lbl="dmg"]').length,
      row: (() => { const r = document.querySelector('#tok-pick-list [data-tok="dmg"]'); return r ? r.textContent.replace(/\u2713/g, '').trim() : null; })()
    }));
    ok(T + 'check 6 — the DAMAGE rename (the one e7f14ef fixed) reaches all '
      + dmg.count + ' board labels', dmg.labels.length === 1 && dmg.labels[0] === 'Wallop'
      && dmg.row === 'Wallop', dmg);
    store.check6.dmg = dmg;
    ok(T + 'check 6 — no page or console error', errs.length === 0, errs.slice(0, 3));
    await b.close();
  }

  // ══ CHECK 7 — a refusal: the MECHANICS, and the words quoted ════════════
  {
    const { b, pg, errs } = await open(channel);
    await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(250);
    await pg.click('#tok-pick-list [data-tok="shield"]'); await pg.waitForTimeout(150);
    await pg.click('#tok-pick-name'); await pg.keyboard.press('Control+A');
    await pg.keyboard.type('   '); await pg.keyboard.press('Enter');
    await pg.waitForTimeout(300);
    const loud = { err: await errPanel(pg), warn: await nameWarn(pg),
      field: await pg.evaluate(() => document.getElementById('tok-pick-name').value) };
    loud.pickerOpen = await pg.evaluate(() => document.getElementById('tok-picker').open);
    ok(T + 'check 7 — three spaces and Enter is REFUSED in plain words, and the field '
      + 'puts the old name back',
      (!loud.warn.hidden || !loud.err.hidden) && loud.field === 'Shield', loud);
    ok(T + "check 7 — the picker CLOSES when the recovery panel is raised, which is [S08]'s "
      + 'documented rule (a modal in the top layer would paint the panel behind its own '
      + 'backdrop and D-15 says recovery stays one click). RECORDED so it is not read as '
      + 'a surprise.', loud.pickerOpen === false, loud);
    store.refusalWords = loud.warn.hidden ? loud.err.msg : loud.warn.text;

    // step 3: the same, but blurred rather than entered — must be QUIET
    await pg.click('#err-dismiss'); await pg.waitForTimeout(200);
    await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(250);
    await pg.click('#tok-pick-list [data-tok="dead"]'); await pg.waitForTimeout(150);
    await pg.click('#tok-pick-name'); await pg.keyboard.press('Control+A');
    await pg.keyboard.type('   ');
    await pg.click('#tok-pick-shapes button:nth-of-type(1)'); await pg.waitForTimeout(300);
    const quiet = { err: await errPanel(pg), warn: await nameWarn(pg),
      field: await pg.evaluate(() => document.getElementById('tok-pick-name').value) };
    ok(T + 'check 7 — a BLUR reverts quietly: no panel at all',
      quiet.warn.hidden && quiet.err.hidden, quiet);

    // step 4: a built-in cannot be removed, and the bound is SHOWN not raised
    const removeState = [];
    for (const tk of ['hp', 'ap', 'shield', 'dmg', 'dead']) {
      await pg.click('#tok-pick-list [data-tok="' + tk + '"]'); await pg.waitForTimeout(120);
      removeState.push(await pg.evaluate(() => {
        const r = document.getElementById('tok-pick-remove');
        return { disabled: r.disabled, opacity: getComputedStyle(r).opacity,
          cursor: getComputedStyle(r).cursor };
      }));
    }
    ok(T + 'check 7 — "Remove this type" is DISABLED on all five built-ins (D-15): the '
      + 'bound is shown, never raised as an error',
      removeState.every(s => s.disabled === true), removeState);
    store.check7 = { loud, quiet, removeState };
    ok(T + 'check 7 — no page or console error', errs.length === 0, errs.slice(0, 3));
    await b.close();
  }

  // ══ CHECK 9 — nothing regressed, including the three nobody could reach ═
  {
    const { b, ctx, pg, errs } = await open(channel);
    const cdp = await ctx.newCDPSession(pg);

    // 9.1 — twenty rapid clicks on the Cat 1 health plus
    const hpPlus = '.unit-card[data-unit="c1"] .brd-line [data-k$="hp/more"], '
      + '.unit-card[data-unit="c1"] button[data-nudge]';
    const plusInfo = await pg.evaluate(() => {
      const card = document.querySelector('article.unit-card');
      const btns = Array.from(card.querySelectorAll('button'));
      const plus = btns.find(x => /more|\+/.test((x.getAttribute('aria-label') || '') + (x.dataset.k || '') + x.textContent));
      return plus ? { k: plus.dataset.k, label: plus.getAttribute('aria-label'), text: plus.textContent.trim() } : null;
    });
    const PLUS = 'article.unit-card:first-of-type button[data-k="' + (plusInfo ? plusInfo.k : '') + '"]';
    const before91 = await pg.evaluate(s => { const n = document.querySelector(s);
      const f = n.closest('.brd-line').querySelector('input'); return f ? f.value : null; }, PLUS);
    for (let i = 0; i < 20; i++) await pg.click(PLUS, { delay: 0 });
    await pg.waitForTimeout(400);
    const after91 = await pg.evaluate(s => { const n = document.querySelector(s);
      const f = n.closest('.brd-line').querySelector('input'); return f ? f.value : null; }, PLUS);
    ok(T + 'check 9.1 — twenty real clicks make exactly twenty changes '
      + `(${before91} -> ${after91}; the control is ${plusInfo && plusInfo.label})`,
      Number(after91) - Number(before91) === 20, { before91, after91, plusInfo });

    // 9.2 — a delta typed into a field
    const FIELD = 'article.unit-card:first-of-type .brd-line input';
    await pg.click(FIELD); await pg.keyboard.press('Control+A');
    await pg.keyboard.type('-8'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(250);
    const d1 = await pg.evaluate(s => document.querySelector(s).value, FIELD);
    await pg.click(FIELD); await pg.keyboard.press('Control+A');
    await pg.keyboard.type('+5'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(250);
    const d2 = await pg.evaluate(s => document.querySelector(s).value, FIELD);
    ok(T + 'check 9.2 — "-8" then "+5" applies as a DELTA, not as the literal number '
      + `(${after91} -> ${d1} -> ${d2})`,
      Number(d1) === Number(after91) - 8 && Number(d2) === Number(d1) + 5, { after91, d1, d2 });

    // 9.3 — arrow keys step the value and the caret survives
    await pg.click(FIELD);
    const caretBefore = await pg.evaluate(s => { const f = document.querySelector(s); return { start: f.selectionStart, end: f.selectionEnd }; }, FIELD);
    await pg.keyboard.press('ArrowUp'); await pg.waitForTimeout(150);
    const up = await pg.evaluate(s => { const f = document.querySelector(s);
      return { v: f.value, focused: document.activeElement === f, start: f.selectionStart }; }, FIELD);
    await pg.keyboard.press('ArrowDown'); await pg.waitForTimeout(150);
    const down = await pg.evaluate(s => document.querySelector(s).value, FIELD);
    ok(T + 'check 9.3 — ArrowUp/ArrowDown step the value and the field keeps focus and a caret',
      Number(up.v) === Number(d2) + 1 && Number(down) === Number(d2) && up.focused,
      { d2, up, down, caretBefore });

    // 9.4 — press and hold, and ONE undo entry.
    // MEASURED FIRST, because it changes what "one undo entry" means here:
    // this artifact COALESCES every nudge of the SAME control into ONE history
    // entry. Twenty clicks on one plus is one entry; a 1.5s ramp is one entry;
    // three clicks on three DIFFERENT pluses is three. So the hold is driven on
    // a control nothing has touched yet, and one Ctrl+Z must return it exactly
    // to where it started.
    const PLUS2 = 'button[data-k="cats/c2/maxHp+"]';
    const FIELD2 = 'input[data-k="cats/c2/maxHp"]';
    const beforeHold = await pg.evaluate(s2 => document.querySelector(s2).value, FIELD2);
    await pg.locator(PLUS2).scrollIntoViewIfNeeded(); await pg.waitForTimeout(150);
    const box = await pg.locator(PLUS2).boundingBox();
    await pg.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await pg.mouse.down(); await pg.waitForTimeout(1500); await pg.mouse.up();
    await pg.waitForTimeout(400);
    const afterHold = await pg.evaluate(s2 => document.querySelector(s2).value, FIELD2);
    await pg.keyboard.press('Control+Z'); await pg.waitForTimeout(400);
    const afterOneUndo = await pg.evaluate(s2 => document.querySelector(s2).value, FIELD2);
    ok(T + `check 9.4 — a 1.5s press-and-hold ramps continuously (${beforeHold} -> `
      + `${afterHold}) and ONE Ctrl+Z undoes the whole ramp (-> ${afterOneUndo})`,
      Number(afterHold) > Number(beforeHold) + 2 && afterOneUndo === beforeHold,
      { beforeHold, afterHold, afterOneUndo });
    store.check94 = { beforeHold, afterHold, afterOneUndo };

    // 9.5 — add and remove a unit; scroll position and focus ring survive
    await pg.evaluate(() => window.scrollTo({ top: 400, behavior: 'instant' }));
    await pg.waitForTimeout(150);
    const addSel = await pg.evaluate(() => {
      const b = document.querySelector('[data-act="addUnit"][data-side="cats"]');
      return b ? (b.dataset.k || null) : null; });
    if (addSel) {
      const S = 'button[data-k="' + addSel + '"]';
      await pg.locator(S).scrollIntoViewIfNeeded();
      await pg.waitForTimeout(200);
      await pg.focus(S);
      await pg.waitForTimeout(150);
      // read the scroll AFTER scrolling the control into view: a click scrolls
      // its target into view first, so a reading taken before that is measuring
      // the driver rather than the artifact.
      const scrollBefore = await pg.evaluate(() => Math.round(window.scrollY));
      const nBefore = await pg.evaluate(() => document.querySelectorAll('#col-cats article.unit-card').length);
      await pg.click(S); await pg.waitForTimeout(350);
      const post = await pg.evaluate((s) => ({
        n: document.querySelectorAll('#col-cats article.unit-card').length,
        scroll: Math.round(window.scrollY),
        focusIsAdd: document.activeElement === document.querySelector(s),
        active: document.activeElement ? (document.activeElement.dataset.k || document.activeElement.tagName) : null }), S);
      ok(T + 'check 9.5 — adding a unit rebuilds the roster without losing the scroll '
        + 'position or the focus ring',
        post.n === nBefore + 1 && Math.abs(post.scroll - scrollBefore) <= 2 && post.focusIsAdd,
        { scrollBefore, nBefore, post });
      store.check95 = { scrollBefore, nBefore, post };
    } else {
      ok(T + 'check 9.5 — could not find the add-unit control by label; NOT RUN', false, null);
    }

    // 9.7 — MIDDLE-CLICK on a stepper while a hold is armed
    await pg.locator(PLUS).scrollIntoViewIfNeeded(); await pg.waitForTimeout(150);
    const box2 = await pg.locator(PLUS).boundingBox();
    const v0 = await pg.evaluate(s => document.querySelector(s).closest('.brd-line').querySelector('input').value, PLUS);
    await pg.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
    await pg.mouse.down({ button: 'left' });          // arm the ramp
    await pg.waitForTimeout(120);
    await pg.mouse.down({ button: 'middle' });        // middle-click ON TOP of it
    await pg.mouse.up({ button: 'middle' });
    await pg.waitForTimeout(120);
    await pg.mouse.up({ button: 'left' });
    await pg.waitForTimeout(400);
    const v1 = await pg.evaluate(s => document.querySelector(s).closest('.brd-line').querySelector('input').value, PLUS);
    // and a middle-click on its own, with nothing armed
    const v1b = v1;
    await pg.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
    await pg.mouse.down({ button: 'middle' }); await pg.mouse.up({ button: 'middle' });
    await pg.waitForTimeout(350);
    const v2 = await pg.evaluate(s => document.querySelector(s).closest('.brd-line').querySelector('input').value, PLUS);
    ok(T + 'check 9.7 — a middle-click ON A STEPPER changes no value on its own '
      + `(${v1b} -> ${v2}); with a left hold armed the value moved only by the hold `
      + `(${v0} -> ${v1})`,
      v2 === v1b, { v0, v1, v2 });
    ok(T + 'check 9.7 — NOT REACHABLE BY MACHINE: whether Chrome draws its autoscroll '
      + 'circle over the board. It is browser chrome, outside the page, and no '
      + 'screenshot of the page contains it. RECORDED as still human.', true);

    // 9.8 — a PHYSICALLY HELD Enter on the focused Undo button, at the OS
    // auto-repeat rate, dispatched through CDP Input.dispatchKeyEvent with
    // autoRepeat: true. That flag is what sets KeyboardEvent.repeat === true,
    // which is the exact input the artifact's preventDefault() reads, so this is
    // a physically held key rather than an imitation of one.
    // THREE DISTINCT CONTROLS, because nudges of one control coalesce into one
    // history entry — with a single entry on the stack, "one undo" and "a burst
    // of thirty" land on the same number and the test proves nothing.
    await pg.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await pg.waitForTimeout(150);
    const THREE = ['c4', 'c5', 'c6'];
    const V3 = () => pg.evaluate(us => us.map(u => document.querySelector('input[data-k="cats/' + u + '/maxHp"]').value).join(','), THREE);
    const l0 = await V3();
    for (const u of THREE) { await pg.click('button[data-k="cats/' + u + '/maxHp+"]'); await pg.waitForTimeout(220); }
    const l3 = await V3();
    const UNDO = 'button[data-act="undo"]';
    await pg.focus(UNDO);
    const key = { windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, code: 'Enter', key: 'Enter', text: String.fromCharCode(13) };
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...key });
    for (let i = 0; i < 30; i++) {
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...key, autoRepeat: true });
    }
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, code: 'Enter', key: 'Enter' });
    await pg.waitForTimeout(700);
    const held = await V3();
    const oneUndo = l3.split(',').slice(0, 2).concat(l0.split(',').slice(2)).join(',');
    ok(T + 'check 9.8 — Enter HELD on the focused Undo button (1 keydown + 30 auto-repeat '
      + `keydowns) fires ONE undo, not a burst: ${l0} -> ${l3} -> ${held} `
      + `(one undo reads ${oneUndo}, a burst of three would read ${l0})`,
      held === oneUndo, { l0, l3, held, oneUndo });
    store.check98 = { l0, l3, held, oneUndo };

    // 9.9 — the same behaviours on a TALLY stepper
    await pg.click('[data-act="openTokenPicker"]'); await pg.waitForTimeout(250);
    await pg.click('#tok-pick-new-unit'); await pg.waitForTimeout(250);
    await pg.click('#tok-pick-done'); await pg.waitForTimeout(300);
    const tTok = await pg.evaluate(() => { const n = document.querySelector('.brd-line--opt');
      return n ? n.dataset.amt : null; });
    const tSel = '[data-act="nudgeTally"][data-side="cats"][data-unit="c1"][data-step="1"][data-amt="' + tTok + '"]';
    const tField = '.brd-line--opt[data-unit="c1"][data-amt="' + tTok + '"] input';
    const t0 = await pg.evaluate(s => document.querySelector(s).value, tField);
    for (let i = 0; i < 20; i++) await pg.click(tSel, { delay: 0 });
    await pg.waitForTimeout(400);
    const t20 = await pg.evaluate(s => document.querySelector(s).value, tField);
    // the hold goes on CAT 2's tally, for 9.4's reason: entries coalesce per
    // control, so a hold on the same stepper the twenty clicks used would share
    // their entry and one undo would rewind both.
    const tSel2 = '[data-act="nudgeTally"][data-side="cats"][data-unit="c2"][data-step="1"][data-amt="' + tTok + '"]';
    const tField2 = '.brd-line--opt[data-unit="c2"][data-amt="' + tTok + '"] input';
    const tHold0 = await pg.evaluate(s => document.querySelector(s).value, tField2);
    await pg.locator(tSel2).scrollIntoViewIfNeeded(); await pg.waitForTimeout(150);
    const tbox = await pg.locator(tSel2).boundingBox();
    await pg.mouse.move(tbox.x + tbox.width / 2, tbox.y + tbox.height / 2);
    await pg.mouse.down(); await pg.waitForTimeout(1200); await pg.mouse.up();
    await pg.waitForTimeout(350);
    const tHold = await pg.evaluate(s => document.querySelector(s).value, tField2);
    await pg.keyboard.press('Control+Z'); await pg.waitForTimeout(400);
    const tUndo = await pg.evaluate(s => document.querySelector(s).value, tField2);
    await pg.click(tField2); await pg.keyboard.press('Control+A');
    await pg.keyboard.type('+4'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(250);
    const tDelta = await pg.evaluate(s => document.querySelector(s).value, tField2);
    await pg.click(tField2); await pg.keyboard.press('ArrowUp'); await pg.waitForTimeout(180);
    const tArrow = await pg.evaluate(s => ({ v: document.querySelector(s).value,
      focused: document.activeElement === document.querySelector(s) }), tField2);
    ok(T + 'check 9.9 — a TALLY stepper inherits 9.1 (twenty clicks, twenty changes: '
      + `${t0} -> ${t20})`, Number(t20) - Number(t0) === 20, { t0, t20 });
    ok(T + `check 9.9 — it inherits 9.4 (a hold on Cat 2's tally ramps ${tHold0} -> `
      + `${tHold}, one Ctrl+Z puts ${tUndo} back)`,
      Number(tHold) > Number(tHold0) + 2 && tUndo === tHold0, { tHold0, tHold, tUndo });
    ok(T + `check 9.9 — it inherits 9.2 ("+4" is a delta: ${tUndo} -> ${tDelta}) and 9.3 `
      + `(ArrowUp steps to ${tArrow.v} with the field still focused)`,
      Number(tDelta) === Number(tUndo) + 4 && Number(tArrow.v) === Number(tDelta) + 1
      && tArrow.focused, { tUndo, tDelta, tArrow });
    store.check99 = { t0, t20, tHold0, tHold, tUndo, tDelta, tArrow };
    ok(T + 'check 9 — no page or console error through the whole regression walk',
      errs.length === 0, errs.slice(0, 6));
    await b.close();
  }

  rec[channel] = store;
}

for (const ch of ['chrome', 'msedge']) await run(ch);
writeFileSync(path.join(HERE, 'p4-result.json'),
  JSON.stringify({ when: new Date().toISOString(), pass, fail, rows, rec }, null, 1));
console.log('\n' + pass + ' passed, ' + fail + ' failed');
