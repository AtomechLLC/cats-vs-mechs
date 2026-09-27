/*
 * tests/stub-dom.cjs — DEV ONLY. Shared by the two terminal runners.
 *
 * This file is never shipped and is never referenced from cats-vs-mechs.html.
 * Node built-ins only (fs, path) — there is nothing to install.
 *
 * It holds the hand-written stub page: makeStubDom() builds, in plain objects,
 * every node the artifact asks for by id or by selector, plus the listener
 * plumbing the delegated handlers bind to. It moved here out of
 * tests/selftest-node.cjs, unchanged, for one reason: a SECOND runner needs the
 * same page.
 *
 * The reason there is a second runner at all: 63 places in the artifact are
 * bracketed `if (typeof document === 'undefined')`, and five whole suites —
 * render, interactions, the board rows of token authoring, projection and
 * reference material — take that branch and report `skipped — no DOM` when
 * selftest-node.cjs runs them in its bare sandbox. Those rows were reachable
 * from a terminal only by hand: at least five separate plans each rebuilt a
 * throwaway script that lifted this function out of selftest-node.cjs by
 * reading its source with fs and evaluating it, then threw the script away.
 * tests/selftest-dom.cjs is that script, kept, and this file is what makes it
 * a normal require instead of source extraction.
 *
 * Nothing here is a gate. Both runners own their own assertions, their own
 * counts and their own exit codes; this file only builds the page and the
 * sandbox they are driven in.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const HTML_PATH = path.join(__dirname, '..', 'cats-vs-mechs.html');

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(HTML_PATH)) {
  fail('MISSING: ' + HTML_PATH);
}

// makeStubDom() reads the shell out of this text — the how-to tab's words and
// the id list are harvested from the markup rather than restated here, so the
// page the stub builds cannot silently drift from the page that ships.
const html = fs.readFileSync(HTML_PATH, 'utf8');

// The artifact is one classic <script>. Both runners evaluate this body.
const SCRIPT_BODY_RE = /<script>([\s\S]*?)<\/script>/;

function scriptBody() {
  const m = html.match(SCRIPT_BODY_RE);
  if (!m) {
    fail('Could not find a classic script block in cats-vs-mechs.html');
  }
  return m[1];
}

function makeStubDom() {
  const doc = { _listeners: Object.create(null), activeElement: null };

  // Every id the artifact asks for. getElementById returns null for anything
  // else, and that USED TO BE the one honest weakness of this approach: every
  // consumer in the artifact guards on null, so a missing id degraded to a
  // silent skip rather than a loud failure. That is not a hypothetical — plan
  // 02-03 added the picker's ids, this list was not grown, and the entire
  // picker path went untested while its own gate checks reported green.
  //
  // So the list is no longer maintained by good intentions. Section 5b below
  // scans cats-vs-mechs.html for every id="..." in the shell and fails the run
  // if the two disagree in either direction. Adding an id here without building
  // the matching node below is now just as loud as forgetting it entirely.
  const KNOWN_IDS = [
    'app', 'board', 'board-empty', 'topbar', 'tokedit-label', 'col-cats',
    'strip', 'col-mechs',
    'err-panel', 'err-title', 'err-message', 'err-detail', 'err-dismiss',
    'err-reset', 'selftest-report', 'selftest-summary', 'selftest-rows',
    // [S06.2] / [S07.2] — the token-appearance picker.
    'tok-picker', 'tok-pick-title', 'tok-pick-preview', 'tok-pick-preview-label',
    'tok-pick-shapes', 'tok-pick-shapes-label',
    'tok-pick-colors', 'tok-pick-colors-label',
    'tok-pick-glyphs', 'tok-pick-glyphs-label',
    'tok-pick-done',
    // plan 02.1-04 — the picker as list-plus-editor (D-05). The list of every
    // type, the name field, and the make-one / take-one-away row.
    'tok-pick-list', 'tok-pick-list-label',
    'tok-pick-name', 'tok-pick-name-label',
    'tok-pick-new-unit', 'tok-pick-new-side', 'tok-pick-remove',
    // plan 05-D35b - D-35's authoring half on this dialog: the range a student
    // writes on a token type. FOUR ids and no more - the group's legend, the
    // two fields, and the line under them that says what the pair means.
    //
    // Both fields are STATIC in the shell and static here, which is the whole
    // point of them: [S06.2] skips a field while it holds focus rather than
    // rebuilding it, so a half-typed figure survives the per-frame repaint
    // (D-19). Their CLASS is not decoration either - [S07.2] tells a bound
    // field apart by .pk-bound-amt exactly as it tells the name field apart by
    // .pk-name, and without it every keystroke, Enter, Escape and blur handler
    // declines on its first line and a check driving them reads green over a
    // field nothing is listening to.
    //
    // Same three-part rule as every entry above: the id, this entry and the
    // stub node arrive together, and section 5b fails the run in BOTH
    // directions if one of the three is missing. No new <dialog>, so
    // DIALOG_ROOTS still walks four roots.
    'tok-pick-bounds-label', 'tok-pick-min', 'tok-pick-max',
    'tok-pick-bounds-said',
    // plan 05-D39b - D-39 P1-1's refusal line for this dialog, in the sticky
    // footer. It is a THIRD reserved line on this surface and none of the
    // three may be folded into another: #tok-pick-names and
    // #tok-pick-bounds-said are written FROM STATE by [S06.2] on every
    // repaint, and this one is written by [S07.2] on a refused Enter and by
    // nothing else. One node, one owner, three times.
    //
    // It is here because without it the whole of P1-1 is unreachable from
    // this page: [S07.2] finds the channel by id, a missing node makes
    // saySaidLine a no-op, and every row driving a refused bound would pass
    // over a dialog that still said nothing. Same three-part rule as every
    // entry above, in BOTH directions.
    'tok-pick-said',
    // plan 05-D41b — D-41's drag layer, a static empty sibling of #err-panel
    // OUTSIDE #app. [S06.16] finds it by id to hold the drag ghost; without the
    // node the ghost is never drawn and a row about it would pass over nothing.
    // Same three-part rule as every entry here: the id, this entry and the
    // stub node arrive together, and section 5b fails the run in BOTH
    // directions if one of the three is missing.
    'drag-layer',
    // plan 05-D42 — D-42's battle scene, the first child of the fight band.
    // FIVE ids: the section, its heading, the one line under it, the way back
    // to formation, and the field [S06.17] draws sprites into and [S07.9]
    // captures the pointer on. The field is static and never rebuilt, which is
    // the whole of why a held sprite survives a commit. The three words are
    // read out of the shell below rather than re-typed, #howto's method.
    // Same three-part rule as every entry here, in BOTH directions.
    'scene', 'scene-head', 'scene-hint', 'scene-reset', 'scene-field',
    // plan 03-05 — the reference band, full width below both columns. The
    // node is built a dozen lines below in the same change: this list and the
    // stub page disagreeing in EITHER direction fails the run at section 5b.
    'refband',
    // plan 03.1-04 — ACT-07's line beside Remove, saying which actions name
    // the open type before it is taken away. Same rule as every entry above:
    // the id, this entry and the stub node arrive together or the run fails in
    // one direction or the other.
    'tok-pick-names',
    // plan 03.1-05 — the action editor (ACT-01). One dialog with two panes:
    // the authoring pane below, and a proposal pane that is reserved, empty and
    // hidden until plan 03.1-07 fills it. The topbar label beside it is the
    // second PERMANENT, BOUNDED button on the bar, and the shell comment on it
    // says out loud that it is not the row Phase 2.1 collapsed.
    //
    // Every entry here obeys the rule the whole list obeys: the id, this entry
    // and the stub node arrive together, and — new since plan 03.1-01 — a
    // <dialog> also needs its DIALOG_ROOTS entry or the run fails at 47b.
    'actedit-label',
    'act-edit', 'act-edit-pane-author', 'act-edit-title',
    'act-edit-sides-label', 'act-edit-side-cats', 'act-edit-side-mechs',
    'act-edit-list-label', 'act-edit-list',
    'act-edit-new', 'act-edit-remove',
    'act-edit-name-label', 'act-edit-name',
    // The reserved term rows. They are static in the shell for the reason the
    // name field is static — plan 03.1-06 puts a number in each, and a number
    // half-typed is what a rebuilt row throws away — so they are static here
    // too. Their COUNT is asserted against App.data.MAX_ACTION_REQ and
    // App.data.MAX_ACTION_XF further down, because a hand-written row count and
    // a constant that can move are two places for one number to live.
    // D-32 raised all three caps to four and gave the cost list slotted row
    // ids of its own — #act-edit-cost became #act-edit-cost-0 — so all three
    // lists spell a row the same way. The STUB DRIFT guard is what caught the
    // shell change here: it named all sixteen new ids on the first run after
    // the markup moved, which is exactly the failure it exists for.
    'act-edit-terms',
    'act-edit-cost-0', 'act-edit-cost-0-amt',
    'act-edit-cost-1', 'act-edit-cost-1-amt',
    'act-edit-cost-2', 'act-edit-cost-2-amt',
    'act-edit-cost-3', 'act-edit-cost-3-amt',
    // D-40's pool preview. One id and no rows of its own: everything inside it
    // is built by [S06.5] on every repaint and found by class, because nothing
    // in it is focusable and there is therefore no node a repaint has to
    // preserve — which is the opposite of the four term rows above it.
    'act-edit-cost-pool',
    'act-edit-req-0', 'act-edit-req-0-amt',
    'act-edit-req-1', 'act-edit-req-1-amt',
    'act-edit-req-2', 'act-edit-req-2-amt',
    'act-edit-req-3', 'act-edit-req-3-amt',
    'act-edit-xf-0', 'act-edit-xf-0-amt',
    'act-edit-xf-1', 'act-edit-xf-1-amt',
    'act-edit-xf-2', 'act-edit-xf-2-amt',
    'act-edit-xf-3', 'act-edit-xf-3-amt',
    // D-34 — the way out of a set of edits, beside Done in the same footer.
    // Same rule as every entry above: the id, this entry and the stub node
    // arrive together, or the run fails at section 5b in one direction or the
    // other. It carries data-act and a real op name rather than data-ae,
    // because there IS an op behind it — the shell comment beside the button
    // gives the partition in full.
    'act-edit-cancel',
    'act-edit-done',
    // plan 05-D39b - D-39 P1-1's refusal line for this dialog, in the sticky
    // footer beside the three controls above. #tok-pick-said's twin, and it
    // is here for the same reason: [S07.3] finds the channel by id, so a
    // missing node makes every refusal row on this dialog pass over a surface
    // that says nothing.
    'act-edit-said',
    // plan 03.1-07 — the proposal pane, and the button on the authoring pane
    // that switches to it. Reserved empty by plan 03.1-05 and filled here.
    //
    // Every static row inside it is built below for the reason the term rows
    // are: they are static markup in the shell so a half-typed number survives
    // the per-frame repaint, so they are static here too, and their COUNT is
    // asserted against App.data.MAX_ACTION_XF rather than hand-written twice.
    // The amount fields carry .ae-prop-amt and NOT .ae-amt — one class name is
    // the whole distance between a field that proposes and a field that
    // dispatches an op, and a typo here would be a green run over a pane
    // nothing is listening to.
    'act-edit-propose', 'act-prop-open',
    'act-prop-title', 'act-prop-refuse', 'act-prop-says',
    'act-prop-caster-label', 'act-prop-target-label',
    'act-prop-cost', 'act-prop-reqs',
    'act-prop-rows', 'act-prop-close',
    // plan 04-05 — the share surface (SHARE-01, SHARE-04). One dialog with two
    // panes (D-21): the copy pane, whose code field is rewritten by [S06.6] on
    // every frame the build moves, and the load pane, whose paste field is the
    // one node on this surface [S06.6] is forbidden to touch. The two panes
    // take DIFFERENT id stems, share-* and sh-load-*, for the reason act-edit-*
    // and act-prop-* do: their controls then partition by attribute.
    //
    // The topbar labels beside them are the THIRD and FOURTH permanent bounded
    // buttons on the bar, both reserved by name in D-04 and both paid for in a
    // shell comment that states the bound.
    //
    // Same rule as every entry above: the id, this entry, the stub node AND —
    // since plan 03.1-01 — the DIALOG_ROOTS entry arrive together, or the run
    // fails in one direction or the other.
    'share-label', 'reset-label',
    'share', 'share-pane-copy', 'share-title', 'share-code',
    'share-length', 'share-over', 'share-said',
    'share-copy', 'share-to-load', 'share-done',
    'sh-load', 'sh-load-label', 'sh-load-field', 'sh-load-said',
    'sh-load-do', 'sh-load-back',
    // plan 04-05 — the reset confirmation (SHARE-06, D-19). Its OWN root rather
    // than a third pane, because it is a different act with a different opener.
    // It draws nothing from state, so it rides no SYNC_HOOKS entry — which is
    // why there is no repaint to stub anything for here, only markup.
    'reset-ask', 'reset-ask-title', 'reset-ask-says',
    'reset-ask-cancel', 'reset-ask-confirm',
    // plan 05-06 — phase 5's two page regions and the two topbar groups that
    // spend the last of D-04's reservation. NOTHING HERE IS A <dialog>, which
    // is the one thing that makes this group different from the two above it:
    // the fight surface is IN THE PAGE, so there is no DIALOG_ROOTS entry to
    // add and the dialog harvest stays at the four roots it already walks.
    // The benefit that bought is that the whole surface sits inside #app, so
    // the fight-mode Layer C harvest reads every word of it without a root of
    // its own.
    //
    // Same three-part rule as every entry above, and it is now the only rule
    // this group has to keep: the id, this entry and the stub node arrive
    // together, and section 5b fails the run in BOTH directions if one of the
    // three is missing.
    //
    // Every one of these is EMPTY on the shipped shell and a later plan in
    // this phase fills it — 05-07 the readout and the two declaration roots,
    // 05-08 the ledger list, 05-09 the notice. That is the same reservation
    // #share-said and #sh-load-said already ship under.
    'round-label', 'round-count', 'pool-cats', 'pool-mechs',
    'fight-label', 'fight-start',
    'fightbar', 'fight-head', 'fight-prompt',
    'decl-cats', 'decl-mechs', 'fight-said',
    // plan 05-D31 - the developer's fifth live-feedback round: "separate the
    // current round state from the action input area." SIX ids, and they are
    // the whole of what D-31 costs this list: two area roots, their two
    // headings, and the state area's own pair of column roots. The decl pair
    // above is the INPUT area's pair and did not move or change name, which is
    // what keeps [S07.5]'s FG_DECL_IDS table and every dispatch off it untouched
    // by a layout change.
    //
    // Same three-part rule as every group above and no exception for arriving
    // late in a phase: the id, this entry and the stub node arrive together, and
    // section 5b fails the run in BOTH directions if one of the three is
    // missing. Neither area is a <dialog>, so the harvest still walks four
    // roots.
    'fight-state', 'fight-state-head', 'state-cats', 'state-mechs',
    'fight-input', 'fight-input-head',
    // plan 05-D36 - the developer's tenth round: "add the ability to directly
    // click on a resource to directly modify the value of that resource in the
    // current round." EIGHT ids, and every one of them is a node the control
    // must never rebuild: plan 05-10 MEASURED that a pointer press on a control
    // whose own node is rebuilt drops the keyboard to <body>, and a nudge
    // repaints on every press by construction. So the pair of buttons, the
    // reading between them, the two halves of the heading and the bound
    // sentence are all STATIC SHELL, and [S06.14] only ever writes text into
    // them. A built-where-it-appears control would land one press of a rapid
    // three.
    //
    // Same three-part rule as every group above: the id, this entry and the
    // stub node arrive together, and section 5b fails the run in BOTH
    // directions if one of the three is missing. It is not a <dialog>, so the
    // harvest still walks four roots.
    'fg-nudge', 'fg-nudge-lbl', 'fg-nudge-who', 'fg-nudge-tok',
    'fg-nudge-less', 'fg-nudge-val', 'fg-nudge-more', 'fg-nudge-says',
    // plan 05-D37 - the developer's eleventh round: "click on a unit then
    // click on the popup window to modify the values associated with it."
    // FOUR ids and no more, and the number is small on purpose: the FRAME is
    // shell and the ROWS are built, because a unit carries a different number
    // of values on every board and static markup cannot hold a list whose
    // length is a student's decision.
    //
    // THE ROWS ARE STILL NEVER REBUILT UNDER A PRESSING FINGER, which is the
    // property plan 05-10's measurement demands and the reason #fg-nudge is
    // eight static nodes: [S06.15] carries a fingerprint of the side, the unit
    // and the token LIST, so a nudge — which changes a NUMBER — rebuilds
    // nothing and a rapid --- lands three presses on the same three nodes.
    //
    // Same three-part rule as every group above: the id, this entry and the
    // stub node arrive together, and section 5b fails the run in BOTH
    // directions if one of the three is missing. It is NOT a <dialog> and
    // takes no DIALOG_ROOTS entry - [C14.7]'s banner gives the three reasons
    // that were weighed and the harvest one is the one this file cares about:
    // the box is inside #fightbar, which is inside #app, so every word it
    // renders is read by the fight harvest. Row 92c DRIVES IT OPEN before
    // taking that harvest, because a surface the walk never reaches reports
    // clean forever.
    'fg-unit', 'fg-unit-head', 'fg-unit-close', 'fg-unit-rows',
    'ledger', 'ledger-head', 'ledger-list',
    // plan 05-12 - the view switch (D-27). THREE ids and no more: the switch
    // root and its two controls. Same three-part rule as every entry above and
    // it is the only rule this group has to keep either - the id, this entry
    // and the stub node arrive together, and section 5b fails the run in BOTH
    // directions if one of the three is missing. Nothing here is a <dialog>,
    // so the harvest still walks four roots.
    //
    // Each control carries data-vw and NOT data-act, and that spelling is
    // copied from the markup rather than typed from memory - the warning above
    // this builder is the whole of that boundary, and check 103 reads the
    // attribute back off the page it drives.
    'views', 'view-build', 'view-fight',
    // plan 05-D38 - D-38's third view and the region it reaches. THREE ids for
    // a whole tab, because the six cards inside #howto are plain <div>s under
    // one heading and none of them is ever queried for. #howto's own words are
    // built below, WITH THEIR TEXT, which is the decision the shell comment on
    // that region carries in full: static markup is empty on this hand-made
    // page, and a tab of prose about a fight that Layer C never reads is the
    // wave-1 lesson waiting to happen.
    'view-howto', 'howto', 'howto-head',
    // plan 05-D28 - D-28's projection toggle. ONE id and no more, and the
    // reason there is not a second is the decision the shell comment carries in
    // full: the sidebar this control opens IS #strip, the node that already
    // ships, rather than a second panel carrying a copy of the same figures.
    // So there is a control id here and no root id, which is the one shape this
    // group has that the group above it does not.
    //
    // Same three-part rule as every entry above - the id, this entry and the
    // stub node arrive together, and section 5b fails the run in BOTH
    // directions if one of the three is missing. It carries data-pv and NOT
    // data-vw and NOT data-act, and that spelling is copied from the markup
    // rather than typed from memory: check 103 counts the data-vw controls and
    // check 103d counts the data-pv ones, and the two counts are what assert
    // the partition off the page.
    'proj-toggle',
    // plan 05-D35b - D-35's authoring block for what happens each round. FOUR
    // ids and no more, and the fourth-from-none is the decision: the eight
    // static rows carry NO id at all. #act-edit's reserved term rows are
    // addressed by getElementById and cost sixteen entries in this list and
    // sixteen hand-built stub nodes; these are addressed by data-rr-slot off
    // their own list, which is the same lookup the board already makes for a
    // unit's token row, and sixteen ids would have bought nothing.
    //
    // The ROWS are still static markup, for #act-edit's stated reason: this
    // region repaints on every frame through SYNC_HOOKS and a number a student
    // is halfway through typing is what a rebuilt node throws away. Their COUNT
    // is asserted against App.data.MAX_ROUND_RULES by check 116, because a
    // hand-written row count and a constant that can move are two places for
    // one number to live.
    //
    // Nothing here is a <dialog>, so the harvest still walks four roots. Same
    // three-part rule as every entry above: the id, this entry and the stub
    // node arrive together, and section 5b fails the run in BOTH directions if
    // one of the three is missing.
    //
    // FOUR BECAME FIVE UNDER D-35c and the fifth is the ADD button. It is a
    // singleton exactly as #rr-said is — there is one of it and the code that
    // disables it says so in one lookup — which is the distinction the
    // paragraph above draws: eight of a kind are addressed by a data attribute,
    // one of a kind is addressed by its id.
    'roundrules', 'rr-head', 'rr-list', 'rr-said', 'rr-add',
    // FIVE BECAME SIX UNDER D-39 P1-1, and the sixth is a SECOND said line
    // rather than a second writer of #rr-said. That one carries the cap
    // sentence and is written from state by [S06.13] on every repaint; this
    // one is written by [S07.7] on a refused Enter. A node with two owners is
    // the defect D-39 P2-5 measured on the fight tab and it is not introduced
    // here to save an entry in this list.
    'rr-refuse'
  ];

  const byId = Object.create(null);

  function classesOf(node) {
    return String(node.className || '').split(/\s+/).filter((c) => c !== '');
  }

  function unescapeValue(v) {
    return String(v).replace(/\\(.)/g, '$1');
  }

  function datasetKey(attr) {
    return attr.slice(5).replace(/-([a-z])/g, (m, c) => c.toUpperCase());
  }

  // Supports exactly what the artifact asks for: a tag name, an #id, one or
  // more classes, and one or more [data-*] tests with or without a value.
  //
  // THE #id BRANCH ARRIVED WITH D-36 AND IS FIRST IN THE ALTERNATION ON
  // PURPOSE. [S07.5]'s dismissal handler asks whether a press landed inside the
  // nudge with closest('#fg-nudge') — the artifact's own idiom for "this one
  // node" — and without this branch the '#' matched nothing while `fg` and
  // `nudge` each matched the TAG alternative, so the test collapsed into
  // "tagName is FG and tagName is NUDGE" and the stub answered null for a press
  // that was plainly inside the box. That is the stub silently disagreeing with
  // every browser, and the alternative to fixing it here was writing the
  // ARTIFACT around the stub — which is precisely what the stub-drift gate
  // exists to refuse. Check 119 measured the divergence before this line
  // existed: the box shut on its own − button.
  const SEL_PART = /#([A-Za-z0-9_-]+)|\.([A-Za-z0-9_-]+)|\[([A-Za-z-]+)(?:="((?:[^"\\]|\\.)*)")?\]|([A-Za-z][A-Za-z0-9]*)/g;

  function matches(node, selector) {
    SEL_PART.lastIndex = 0;
    let m;
    let saw = false;
    let ok = true;
    while ((m = SEL_PART.exec(selector)) !== null) {
      saw = true;
      if (m[1] !== undefined) {
        ok = ok && String(node._attrs.id || '') === m[1];
      } else if (m[2] !== undefined) {
        ok = ok && classesOf(node).indexOf(m[2]) !== -1;
      } else if (m[3] !== undefined) {
        if (m[3].indexOf('data-') !== 0) { ok = false; }
        else {
          const key = datasetKey(m[3]);
          if (m[4] === undefined) { ok = ok && node.dataset[key] !== undefined; }
          else { ok = ok && String(node.dataset[key]) === unescapeValue(m[4]); }
        }
      } else if (m[5] !== undefined) {
        ok = ok && node.tagName === m[5].toUpperCase();
      }
    }
    return saw && ok;
  }

  function queryAll(root, selector) {
    const found = [];
    (function walk(n) {
      n.children.forEach((child) => {
        if (matches(child, selector)) { found.push(child); }
        walk(child);
      });
    })(root);
    return found;
  }

  function dispatch(target, evt) {
    evt.target = target;
    let n = target;
    while (n) {
      const list = n._listeners[evt.type];
      if (list) { list.slice().forEach((fn) => fn.call(n, evt)); }
      n = n.parentNode;
    }
    const onDoc = doc._listeners[evt.type];
    if (onDoc) { onDoc.slice().forEach((fn) => fn.call(doc, evt)); }
    return true;
  }

  function createElement(tagName) {
    const node = {
      tagName: String(tagName).toUpperCase(),
      className: '',
      dataset: Object.create(null),
      children: [],
      parentNode: null,
      textContent: '',
      value: '',
      hidden: false,
      disabled: false,
      type: '',
      scrollTop: 0,
      _attrs: Object.create(null),
      _listeners: Object.create(null)
    };

    node.classList = {
      add(c) {
        const list = classesOf(node);
        if (list.indexOf(c) === -1) { list.push(c); node.className = list.join(' '); }
      },
      remove(c) {
        node.className = classesOf(node).filter((x) => x !== c).join(' ');
      },
      contains(c) { return classesOf(node).indexOf(c) !== -1; }
    };

    node.setAttribute = (k, v) => { node._attrs[k] = String(v); };
    node.getAttribute = (k) => (k in node._attrs ? node._attrs[k] : null);

    node.appendChild = (child) => {
      if (child.parentNode) { child.parentNode.removeChild(child); }
      child.parentNode = node;
      node.children.push(child);
      return child;
    };
    node.removeChild = (child) => {
      const i = node.children.indexOf(child);
      if (i !== -1) { node.children.splice(i, 1); child.parentNode = null; }
      return child;
    };
    node.remove = () => { if (node.parentNode) { node.parentNode.removeChild(node); } };
    // ADDED BY PLAN 05-14, and it is a gap in this stub rather than a new
    // capability: insertBefore is ordinary DOM and this page simply never
    // needed it until [S06.7] had to put the round figure ABOVE .fg-sides
    // without touching the shell markup. A null reference appends, which is
    // what a browser does, so the artifact's fall-through arm is modelled too.
    node.insertBefore = (child, before) => {
      if (child.parentNode) { child.parentNode.removeChild(child); }
      const i = before === null || before === undefined
        ? -1 : node.children.indexOf(before);
      child.parentNode = node;
      if (i === -1) { node.children.push(child); } else { node.children.splice(i, 0, child); }
      return child;
    };
    node.replaceChildren = (...kids) => {
      node.children.forEach((c) => { c.parentNode = null; });
      node.children.length = 0;
      // Emptying a box clamps its scroll offset to zero, and that is modelled
      // rather than skipped because it is the whole of one defect: the artifact
      // rebuilds a scrolling list this way on every repaint, and a stub that
      // quietly kept the offset would report a fix that had not been made. This
      // is the only layout consequence in here and it needs no layout engine —
      // no content means nowhere to be scrolled to.
      node.scrollTop = 0;
      kids.forEach((k) => node.appendChild(k));
    };

    node.addEventListener = (type, fn) => {
      if (!node._listeners[type]) { node._listeners[type] = []; }
      node._listeners[type].push(fn);
    };
    node.dispatchEvent = (evt) => dispatch(node, evt);

    // Moving focus DISPATCHES, and that is the single most load-bearing line
    // in this stub. What was here assigned doc.activeElement and fired nothing,
    // so every path that moves focus programmatically — the dialog's focus
    // hand-back, the removed-row placement, withPreservedFocus's restore —
    // ran here with no focusin and no focusout behind it. Two defects of the
    // authoring surface lived in exactly that hole and the gate below reported
    // green over both of them, because the only way a focusout ever reached a
    // handler was a check dispatching one by hand, which no check did ACROSS a
    // change of selection. A programmatic focus() fires blur/focusout on the
    // previously focused element synchronously in every engine, so the stub
    // that stands in for one has to as well.
    //
    // Re-focusing the node that already holds focus dispatches nothing, which
    // is also what a browser does — and it is what keeps withPreservedFocus's
    // restore of an untouched field from looking like the student left it.
    node.focus = () => {
      const prev = doc.activeElement;
      if (prev === node) { return; }
      doc.activeElement = node;
      if (prev && typeof prev.dispatchEvent === 'function') {
        dispatch(prev, event('focusout', { relatedTarget: node }));
      }
      dispatch(node, event('focusin', { relatedTarget: prev || null }));
    };
    node.blur = () => {
      if (doc.activeElement !== node) { return; }
      doc.activeElement = doc.body;
      dispatch(node, event('focusout', { relatedTarget: doc.body }));
    };
    // The selection, which used to be two no-ops. It is modelled now because
    // plan 04-05 gave one field in this artifact the OPPOSITE of D-19's rule —
    // #share-code is rewritten while it holds focus and its selection is
    // re-applied afterwards — and a no-op setSelectionRange makes that contract
    // untestable in the direction that matters. selectionStart stays undefined
    // until something sets it, which is what [S06.1]'s withPreservedFocus
    // already reads it as, so nothing that passed before this reads differently
    // because of it.
    node.select = () => {
      node.selectionStart = 0;
      node.selectionEnd = String(node.value === undefined ? '' : node.value).length;
    };
    node.setSelectionRange = (from, to) => {
      node.selectionStart = from;
      node.selectionEnd = to;
    };
    node.setPointerCapture = () => {};
    node.releasePointerCapture = () => {};

    /* A <canvas> GETS A 2D CONTEXT THAT RECORDS WHAT IT PAINTS — plan 05-D42.
       [S06.17] paints each sprite pixel by pixel, and a stub canvas with no
       getContext would make the artifact either throw or grow a guard written
       for this page, which is the stub shaping the shipped code. So the two
       calls the artifact makes are modelled and nothing else: clearRect wipes,
       fillRect records one colour per pixel it covers. _pixels is readable, so
       a row can assert WHICH colour a sprite was painted in — which is how a
       node row tells a colour derived from a token from a typed one. Only
       '2d' is answered; any other kind is null, which is what a browser gives
       for a context it will not hand over. */
    if (node.tagName === 'CANVAS') {
      node.width = 300;
      node.height = 150;
      node._pixels = Object.create(null);
      const ctx = {
        fillStyle: '',
        clearRect() { node._pixels = Object.create(null); },
        fillRect(x, y, w, h) {
          for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) { node._pixels[(x + i) + ',' + (y + j)] = String(ctx.fillStyle); }
          }
        }
      };
      node.getContext = (kind) => (kind === '2d' ? ctx : null);
    }

    // No layout engine here, so a node reports whatever height the gate gave
    // it. _rectHeight defaults to 0, which is the "no layout at all" case
    // [S08]'s measurement is required to decline rather than publish.
    node._rectHeight = 0;
    node.getBoundingClientRect = () => ({
      width: 0, height: node._rectHeight, top: 0, left: 0, right: 0, bottom: node._rectHeight
    });

    /* A PER-NODE style WITH setProperty AND NOTHING ELSE — D-36. [S06.14]
       publishes the nudge's two offsets as custom properties on the box itself,
       which is the one place in the artifact that writes an inline style to a
       node that is not documentElement, and check 57 above reads every such
       access in context. Without this the stub throws the moment a row opens
       the control, and a `if (node.style)` guard in the ARTIFACT would be the
       stub shaping the shipped code — the failure the stub-drift gate exists to
       refuse. Only setProperty is modelled: nothing else is used, and a stub
       that answered for more would let a length written the forbidden way pass
       here and fail in a browser.
       _props is readable, so a row can assert WHAT was published rather than
       only that nothing threw. */
    node._props = Object.create(null);
    node.style = {
      setProperty(name, value) { node._props[name] = String(value); },
      getPropertyValue(name) {
        return Object.prototype.hasOwnProperty.call(node._props, name)
          ? node._props[name] : '';
      }
    };

    node.closest = (selector) => {
      let n = node;
      while (n) {
        if (matches(n, selector)) { return n; }
        n = n.parentNode;
      }
      return null;
    };
    node.querySelector = (selector) => queryAll(node, selector)[0] || null;
    node.querySelectorAll = (selector) => queryAll(node, selector);

    Object.defineProperty(node, 'firstElementChild', {
      get: () => node.children[0] || null
    });
    Object.defineProperty(node, 'lastElementChild', {
      get: () => node.children[node.children.length - 1] || null
    });

    return node;
  }

  function idNode(id, tag) {
    const node = createElement(tag || 'div');
    node._attrs.id = id;
    byId[id] = node;
    return node;
  }

  const body = createElement('body');
  doc.body = body;
  doc.activeElement = body;

  // <html>, for the one thing the artifact does with it: publishing the
  // measured chrome height as a custom property so #strip's sticky offset
  // stops guessing at --topbar-h.
  doc.documentElement = {
    _props: Object.create(null),
    style: {
      setProperty(name, value) { doc.documentElement._props[name] = String(value); },
      getPropertyValue(name) { return doc.documentElement._props[name] || ''; }
    }
  };

  const app = idNode('app', 'main');
  body.appendChild(app);

  const topbar = idNode('topbar');
  topbar._rectHeight = 88;   // one wrapped row taller than the shipped 64px floor
  app.appendChild(topbar);

  // plan 05-06's two page regions, built HERE rather than at the bottom of
  // this function because #app's child order is the appendChild order and the
  // shell puts both of them between the bar and the board. That order matters
  // to nothing this stub does today and matters to any future assertion that
  // reads #app's children — plan 03-05's band made the same call for the same
  // reason, and this is the cheaper moment to get it right.
  //
  // NEITHER IS A <dialog>, so neither takes a DIALOG_ROOTS entry and the
  // harvest below still walks four roots. Every class and every attribute here
  // is spelled from the markup, which is the warning the stub <dialog>s carry
  // and the one that costs the most when ignored.
  // plan 05-12's view switch, built BEFORE the fight region for the reason the
  // fight region is built before the board: #app's child order here is the
  // appendChild order, and the shell puts the switch between #topbar and the
  // band so a screen reader meets the control before either thing it switches
  // between. It is not a <dialog>, so it takes no DIALOG_ROOTS entry.
  //
  // NO TEXT ON EITHER LABEL AND NO TICK CHARACTER, which is this stub's
  // standing convention for STATIC markup rather than an omission: this page is
  // a hand-made stand-in and not a parser, so text written directly into the
  // shell is empty here and Layer A reads it in the document instead.
  // #round-label and #fight-head above ship exactly the same way. The aria-label
  // on the root IS copied, because Layer C reads accessible names as well as
  // leaf text and a name present in one page and absent from the other is the
  // drift section 5b exists to make impossible, arriving through an attribute.
  //
  // Every class and every dataset spelling below is copied from the markup.
  const views = idNode('views');
  views.className = 'vw-switch';
  views.setAttribute('role', 'group');
  // AMENDED BY PLAN 05-D28 IN THE SAME CHANGE THAT AMENDED THE MARKUP. The
  // group holds D-28's projection toggle as well as the two view controls now,
  // and an accessible name present in one page and different in the other is
  // exactly the drift section 5b exists to make impossible, arriving through an
  // attribute rather than through a typo.
  views.setAttribute('aria-label', 'Which screen, and the projection');
  app.appendChild(views);
  // AMENDED AGAIN BY PLAN 05-D38, WHICH ADDED THE THIRD VIEW. The order here is
  // the shell's order and that matters to more than the eye: [C15]'s P3-9
  // paragraph is an argument about which controls a cursor travels to, and it
  // is an argument about the LAST control in the row. A stub that built the
  // three in a different order would be a page every position claim reads the
  // wrong answer off.
  [['view-build', 'build', 'vw-btn vw-on', 'true'],
    ['view-fight', 'fight', 'vw-btn', 'false'],
    ['view-howto', 'howto', 'vw-btn', 'false']].forEach(([id, vw, cls, pressed]) => {
    const b = idNode(id, 'button');
    b.className = cls;
    b.type = 'button';
    b.dataset.k = 'vw/' + vw;
    b.dataset.vw = vw;
    b.setAttribute('aria-pressed', pressed);
    views.appendChild(b);
    const name = createElement('span');
    name.className = 'vw-name';
    b.appendChild(name);
    const tick = createElement('span');
    tick.className = 'vw-check';
    b.appendChild(tick);
  });
  // plan 05-D28's toggle, a SIBLING of the two above and inside the same root,
  // which is what lets [S07.6]'s one delegated pair reach all three. Built to
  // the same convention as they are: no text on the label and no tick
  // character, because text written directly into the shell is empty here and
  // Layer A reads it in the document. Every class and every dataset spelling is
  // copied from the markup, including aria-expanded, which this control carries
  // and the two above do not.
  const projToggle = idNode('proj-toggle', 'button');
  projToggle.className = 'pv-btn';
  projToggle.type = 'button';
  projToggle.dataset.k = 'pv/proj';
  projToggle.dataset.pv = 'strip';
  projToggle.setAttribute('aria-pressed', 'false');
  projToggle.setAttribute('aria-expanded', 'false');
  projToggle.setAttribute('aria-controls', 'strip');
  views.appendChild(projToggle);
  const projName = createElement('span');
  projName.className = 'pv-name';
  projToggle.appendChild(projName);
  const projTick = createElement('span');
  projTick.className = 'pv-check';
  projToggle.appendChild(projTick);

  // THE LEDGER IS BUILT AND APPENDED BEFORE #fightbar, AND THE ORDER IS THE
  // CLAIM RATHER THAN HOUSEKEEPING (plan 05-D28). D-28 made the ledger a
  // full-width LANE ABOVE the round being played, and the shell carries that in
  // the markup rather than with a CSS `order` — so #app's child order here has
  // to match, because this page's child order IS its appendChild order and
  // check 103e reads the pairing off both pages. The other property this page
  // can hold is the one plan 05-06 built it for: the ledger is a SIBLING of
  // #board and not a child, which is what keeps the first [data-k] match scoped
  // to #board a live node after a structural rebuild. Its rows carry no data-k
  // and no data-act at all, so there is nothing to stub inside the list —
  // [S06.8] appends into it.
  //
  // plan 05-D42 — D-42's scene is the band's FIRST child in the shell, above
  // the ledger, so it is built first here too: this page's child order is its
  // appendChild order. Its three words are STATIC MARKUP and are read out of
  // the shell by id, #howto's method, so the harvest reads what ships rather
  // than a copy that goes stale — and it fails LOUD if one is not found. The
  // field ships empty, carrying the shell's own resting row count.
  const scene = idNode('scene', 'section');
  scene.className = 'scn';
  scene.setAttribute('aria-labelledby', 'scene-head');
  app.appendChild(scene);
  const sceneTop = createElement('div');
  sceneTop.className = 'scn-top';
  scene.appendChild(sceneTop);
  const sceneWord = (id) => {
    const m = new RegExp('id="' + id + '"[^>]*>([^<]*)<').exec(html);
    if (!m || m[1].trim() === '') {
      fail('the scene\'s #' + id + ' words could not be read out of the shell.');
    }
    return m[1];
  };
  [['scene-head', 'h2', 'scn-head'], ['scene-hint', 'p', 'scn-hint'],
    ['scene-reset', 'button', 'brd-btn scn-reset']].forEach(([id, tag, cls]) => {
    const n = idNode(id, tag);
    n.className = cls;
    if (tag === 'button') { n.type = 'button'; }
    n.textContent = sceneWord(id);
    sceneTop.appendChild(n);
  });
  const sceneWin = createElement('div');
  sceneWin.className = 'scn-win';
  scene.appendChild(sceneWin);
  const sceneField = idNode('scene-field');
  sceneField.className = 'scn-field';
  sceneField.dataset.scnRows = '3';
  sceneWin.appendChild(sceneField);

  const ledger = idNode('ledger', 'section');
  ledger.hidden = true;
  app.appendChild(ledger);
  const ledgerHead = idNode('ledger-head', 'h2');
  ledgerHead.className = 'ld-head';
  ledger.appendChild(ledgerHead);
  const ledgerList = idNode('ledger-list');
  ledgerList.className = 'ld-list';
  ledger.appendChild(ledgerList);

  const fightbar = idNode('fightbar', 'section');
  app.appendChild(fightbar);
  const fightHead = idNode('fight-head', 'h2');
  fightHead.className = 'fg-head';
  fightbar.appendChild(fightHead);
  const fightPrompt = idNode('fight-prompt', 'p');
  fightPrompt.className = 'fg-prompt';
  fightbar.appendChild(fightPrompt);
  /* D-31's TWO AREAS, IN THE SHELL'S OWN ORDER: state first, input second. The
     order is the CLAIM here and not housekeeping, exactly as it is for #ledger
     twenty lines up — this page's child order IS its appendChild order, and row
     108 reads the separation off both this page and the artifact's markup. A
     stub that built them the other way round would make a passing row out of a
     surface where the student is asked to act before being shown what they are
     acting on.

     BOTH SHIP HIDDEN AND SO DO ALL FOUR COLUMN ROOTS, which is the shell
     verbatim and matters to more than tidiness: fgRest puts every one of them
     back behind [hidden], and a stub that started them visible would let a
     teardown check pass without the teardown having done anything. */
  const fightArea = (areaId, headId, sideIds) => {
    const area = idNode(areaId, 'section');
    area.className = 'fg-area';
    area.hidden = true;
    fightbar.appendChild(area);
    const areaHead = createElement('div');
    areaHead.className = 'fg-area-head';
    area.appendChild(areaHead);
    const areaName = idNode(headId, 'h3');
    areaName.className = 'fg-area-name';
    areaHead.appendChild(areaName);
    const sides = createElement('div');
    sides.className = 'fg-sides';
    area.appendChild(sides);
    sideIds.forEach((id) => {
      const side = idNode(id);
      side.className = 'fg-side';
      side.hidden = true;
      sides.appendChild(side);
    });
  };
  fightArea('fight-state', 'fight-state-head', ['state-cats', 'state-mechs']);
  fightArea('fight-input', 'fight-input-head', ['decl-cats', 'decl-mechs']);
  // FIGHT-10's line, reserved by plan 05-06 and filled by plan 05-09. Hidden
  // AND empty together, which is the admission line's own rule and the reason
  // there is no text on it here.
  const fightSaid = idNode('fight-said', 'p');
  fightSaid.className = 'fg-said';
  fightSaid.hidden = true;
  fightbar.appendChild(fightSaid);

  /* D-36's INLINE NUDGE, built here as the SHELL builds it — one control for
     the whole surface, held static so it is never rebuilt under a pressing
     finger. The two buttons carry the data-fg and the data-fg-step [S07.5]
     reads and the data-k check 94b walks; the three attributes that say what
     the box is OPEN ON are written by that region at the press and are absent
     here, which is exactly the shut state [S06.14] reads as "nothing is open".

     The two heading halves and the bound sentence are EMPTY here for the same
     reason #fight-said is: this page is a hand-made stand-in rather than a
     parser, and [S06.14] writes every one of them from state on every frame. */
  const fgNudge = idNode('fg-nudge');
  fgNudge.className = 'fgn';
  fgNudge.hidden = true;
  fightbar.appendChild(fgNudge);
  const fgNudgeLbl = idNode('fg-nudge-lbl', 'p');
  fgNudgeLbl.className = 'fgn-lbl';
  fgNudge.appendChild(fgNudgeLbl);
  const fgNudgeWho = idNode('fg-nudge-who', 'span');
  fgNudgeWho.className = 'fgn-who';
  fgNudgeLbl.appendChild(fgNudgeWho);
  const fgNudgeTok = idNode('fg-nudge-tok', 'span');
  fgNudgeTok.className = 'fgn-tok';
  fgNudgeLbl.appendChild(fgNudgeTok);
  const fgNudgeRow = createElement('div');
  fgNudgeRow.className = 'fgn-row';
  fgNudge.appendChild(fgNudgeRow);
  const fgNudgeBtn = (id, step, k) => {
    const b = idNode(id, 'button');
    b.className = 'stp-btn fgn-btn';
    b.dataset.fg = 'nudge';
    b.dataset.fgStep = step;
    b.dataset.k = k;
    return b;
  };
  fgNudgeRow.appendChild(fgNudgeBtn('fg-nudge-less', '-1', 'fg/nudge/less'));
  const fgNudgeVal = idNode('fg-nudge-val', 'span');
  fgNudgeVal.className = 'fgn-val';
  fgNudgeRow.appendChild(fgNudgeVal);
  fgNudgeRow.appendChild(fgNudgeBtn('fg-nudge-more', '1', 'fg/nudge/more'));
  const fgNudgeSays = idNode('fg-nudge-says', 'p');
  fgNudgeSays.className = 'fgn-says';
  fgNudgeSays.hidden = true;
  fgNudge.appendChild(fgNudgeSays);

  /* D-37's UNIT POPUP, built here as the SHELL builds it. The frame and the
     way out are static; #fg-unit-rows is EMPTY, exactly as it is in the shell,
     because [S06.15] builds one row per value the open unit holds and a unit
     carries a different number of them on every board. The two attributes that
     say WHICH unit is open are written by [S07.5] at the press and are absent
     here, which is the shut state [S06.15] reads as "nothing is open". */
  const fgUnit = idNode('fg-unit');
  fgUnit.className = 'fgu';
  fgUnit.hidden = true;
  fightbar.appendChild(fgUnit);
  const fgUnitTop = createElement('div');
  fgUnitTop.className = 'fgu-top';
  fgUnit.appendChild(fgUnitTop);
  const fgUnitHead = idNode('fg-unit-head', 'p');
  fgUnitHead.className = 'fgu-head';
  fgUnitTop.appendChild(fgUnitHead);
  const fgUnitClose = idNode('fg-unit-close', 'button');
  fgUnitClose.className = 'fgu-close';
  fgUnitClose.dataset.fg = 'uclose';
  fgUnitClose.dataset.k = 'fg/u/close';
  fgUnitClose.textContent = 'Close';
  fgUnitTop.appendChild(fgUnitClose);
  const fgUnitRows = idNode('fg-unit-rows');
  fgUnitRows.className = 'fgu-rows';
  fgUnit.appendChild(fgUnitRows);

  const board = idNode('board');
  app.appendChild(board);
  ['col-cats', 'strip', 'col-mechs'].forEach((id) => board.appendChild(idNode(id, 'section')));
  // plan 03-05's band, in the shell's own order: after both columns and before
  // #board-empty. The order matters to nothing the stub does today and matters
  // to any future assertion that reads #board's children, which is the cheaper
  // moment to get it right.
  board.appendChild(idNode('refband', 'section'));
  board.appendChild(idNode('board-empty', 'p'));

  const report = idNode('selftest-report', 'section');
  app.appendChild(report);
  report.appendChild(idNode('selftest-summary'));
  report.appendChild(idNode('selftest-rows'));

  const panel = idNode('err-panel');
  panel.hidden = true;
  body.appendChild(panel);
  panel.appendChild(idNode('err-title'));
  panel.appendChild(idNode('err-message'));
  panel.appendChild(idNode('err-detail', 'textarea'));
  panel.appendChild(idNode('err-dismiss', 'button'));
  panel.appendChild(idNode('err-reset', 'button'));

  // plan 05-D41b — the drag layer, in the shell's own place: after the panel,
  // outside #app, empty. Its one attribute is copied from the markup.
  const dragLayer = idNode('drag-layer');
  dragLayer.setAttribute('aria-hidden', 'true');
  body.appendChild(dragLayer);

  // A hand-made stand-in for the STATIC #topbar markup, which this stub cannot
  // produce because it has no HTML parser. These two controls ship in
  // cats-vs-mechs.html as literal markup and must be kept in step with it: the
  // Undo button, and the one token button beside it.
  //
  // There used to be a row of token buttons here, built from a hardcoded list
  // of the types the board ships with, and every selector below reached for the
  // one that named Health. D-05 collapsed that row to a single button carrying
  // no type at all, so the list is gone and the selectors are keyed on the act
  // alone. The alternative — keeping a type on the stub button so the old
  // selectors kept matching — would have made this page disagree with the
  // markup it stands in for, which is the exact drift the gate below exists to
  // make impossible.
  function topbarButton(k, act, extra) {
    const b = createElement('button');
    b.dataset.k = k;
    b.dataset.act = act;
    Object.keys(extra || {}).forEach((key) => { b.dataset[key] = extra[key]; });
    topbar.appendChild(b);
    return b;
  }
  // plan 05-06's second topbar group. The FIGHT group leads the tools here
  // because that is where the markup puts it; the round-and-pool READING now
  // comes last and on its own line, which is D-33 P2-2 and is mirrored at the
  // foot of this builder rather than here. Reset stays last among the tools and
  // apart, where SHARE-04's fourth criterion put it.
  //
  // It IS a control, and it takes an id where the four buttons below take none,
  // because [S06.7] has to reach it by id: it is D-33 P2-4's lifecycle toggle
  // and that region writes its LABEL and its ACT from whether a fight is
  // running. topbarButton() hands back no id, so the button is built by hand
  // here and its key is copied off the markup. Its data-act is seeded from the
  // markup's own resting value and then owned by the render, which is why the
  // setup harvest carries "Start the fight" from D-33 P2-4 onward and did not
  // before: the node used to be built empty and left empty.
  //
  // startFight and endFight are both state work, so both are dispatched and
  // neither is in UI_ACTS.
  const fightLabel = idNode('fight-label', 'span');
  fightLabel.className = 'brd-tokedit-label';
  topbar.appendChild(fightLabel);
  const fightStart = idNode('fight-start', 'button');
  fightStart.className = 'brd-btn';
  fightStart.dataset.k = 'fg';
  fightStart.dataset.act = 'startFight';
  topbar.appendChild(fightStart);

  topbarButton('undo', 'undo', null);
  topbar.appendChild(idNode('tokedit-label', 'span'));
  topbarButton('tok', 'openTokenPicker', null);
  // plan 03.1-05's one new topbar control. The shell comment beside it records
  // that this is a second PERMANENT, BOUNDED button rather than the row Phase
  // 2.1 collapsed; here it is one more entry, spelled from the markup.
  topbar.appendChild(idNode('actedit-label', 'span'));
  topbarButton('act', 'openActionEditor', null);
  // plan 04-05's two new topbar controls, the third and fourth permanent
  // buttons on the bar and both reserved by name in D-04. Spelled from the
  // markup, exactly as the two above are. Their acts are page work claimed by
  // [S07.4], which is plan 04-06's — so nothing in this file presses either of
  // them yet, and the DIALOG_ROOTS entries below open the two new dialogs
  // through showModal() rather than through an opener that does not exist.
  topbar.appendChild(idNode('share-label', 'span'));
  topbarButton('sh', 'openShare', null);
  topbar.appendChild(idNode('reset-label', 'span'));
  topbarButton('rs', 'openResetAsk', null);

  /* D-33 P2-2 — THE ROUND-AND-POOL READING, LAST AND ON ITS OWN LINE, which is
     where the markup moved it: it is the one thing in this cluster nobody
     presses, and the controls above it must not move when a fight starts. It
     ships HIDDEN and [S06.7] shows it, so a page with no fight running never
     draws the word "Round" over nothing.

     IT IS NOT A CONTROL, so topbarButton() is deliberately not used for it.
     That helper stamps a data-act onto whatever it makes, and a reading
     carrying an act would be an act on this page the shell does not carry —
     precisely the drift section 5b exists to make impossible, arriving through
     a convenience rather than through a typo. Three empty value nodes, no
     data-act, no data-k, spelled from the markup. */
  const fightRead = createElement('div');
  fightRead.className = 'brd-tokedit fg-read';
  fightRead.hidden = true;
  topbar.appendChild(fightRead);
  const roundLabel = idNode('round-label', 'span');
  roundLabel.className = 'brd-tokedit-label';
  fightRead.appendChild(roundLabel);
  [['round-count', 'fg-round'],
    ['pool-cats', 'fg-pool'],
    ['pool-mechs', 'fg-pool']].forEach(([id, cls]) => {
    const n = idNode(id, 'span');
    n.className = cls;
    fightRead.appendChild(n);
  });

  // The token-appearance <dialog>, likewise hand-made from the static markup.
  // Exactly three members beyond a plain element, because that is all [S06.2]
  // and [S07.2] touch: .open, showModal() and close(), the last dispatching the
  // `close` event the focus hand-back is bound to. pickerDialog() probes for a
  // close() FUNCTION before it will do anything, so a plain div here would keep
  // the whole picker path skipped — which is precisely the state this stub was
  // in before, with two gate checks reporting green over a handler that bailed
  // out on its second line.
  //
  // The three grids are built empty, exactly as they ship: their contents come
  // from App.data.SHAPES / COLORS / GLYPHS at render time.
  const picker = idNode('tok-picker', 'dialog');
  picker.open = false;
  picker.showModal = () => { picker.open = true; };
  picker.close = () => {
    if (!picker.open) { return; }
    picker.open = false;
    dispatch(picker, event('close'));
  };
  body.appendChild(picker);
  picker.appendChild(idNode('tok-pick-title', 'h2'));

  // The list of every token type (D-05), empty exactly as it ships: its rows
  // are built from the LIVE vocabulary at render time, which is what makes a
  // type a student invented appear in it without a second tier.
  const listGroup = createElement('div');
  picker.appendChild(listGroup);
  listGroup.appendChild(idNode('tok-pick-list-label', 'h3'));
  listGroup.appendChild(idNode('tok-pick-list'));

  // The make-one / take-one-away row. The dataset spellings are copied from
  // the static markup and must be kept in step with it, exactly as the topbar
  // buttons above are: plan 02.1-05 registers the handlers these names route
  // to, and a typo here would make that plan's gate checks green over nothing.
  const newRow = createElement('div');
  picker.appendChild(newRow);
  [
    ['tok-pick-new-unit', 'createTokenType', { scope: 'unit', k: 'pk/new-unit' }],
    ['tok-pick-new-side', 'createTokenType', { scope: 'side', k: 'pk/new-side' }],
    ['tok-pick-remove', 'removeTokenType', { k: 'pk/remove' }]
  ].forEach(([id, act, extra]) => {
    const b = idNode(id, 'button');
    b.dataset.act = act;
    Object.keys(extra).forEach((key) => { b.dataset[key] = extra[key]; });
    newRow.appendChild(b);
  });

  // ACT-07's line beside Remove. Empty and hidden in the shell and here, with
  // the action-name marker on it, because [S06.2] writes a student's words into
  // it and the rendered-page walk must skip its text for the same reason it
  // skips a token type's label. The class matters: [C07] hides it while it is
  // empty, and a check reading it selects on the class rather than on a
  // structure this stub does not reproduce.
  const namesLine = idNode('tok-pick-names', 'p');
  namesLine.className = 'pk-warn';
  namesLine.dataset.anm = '';
  namesLine.hidden = true;
  picker.appendChild(namesLine);

  // The name field is STATIC in the shell and static here, which is the whole
  // point of it: [S06.2] skips it while it holds focus rather than rebuilding
  // it, so a half-typed name survives the per-frame repaint (D-19).
  const nameGroup = createElement('div');
  picker.appendChild(nameGroup);
  nameGroup.appendChild(idNode('tok-pick-name-label', 'h3'));
  const nameField = idNode('tok-pick-name', 'input');
  nameField.type = 'text';
  // The class is NOT decoration here: [S07.2] tells the name field apart from
  // everything else in the dialog by it, exactly as [S07.1] tells a stepper
  // field apart by its own class. Without it every keystroke, Enter, Escape and
  // blur handler declines the event on its first line, and a gate check driving
  // them would read green over a field nothing is listening to.
  nameField.className = 'pk-name';
  nameField.dataset.k = 'pk/name';
  nameGroup.appendChild(nameField);

  // D-35's range pair, in the same shape and for the same reasons as the name
  // field above: static, classed, and carrying the dataset spellings the shell
  // carries. data-pk-bound is what [S07.2] reads to decide WHICH end a commit
  // is writing, so a typo here is a green run over a field that writes the
  // wrong half of the pair.
  const boundsGroup = createElement('div');
  picker.appendChild(boundsGroup);
  boundsGroup.appendChild(idNode('tok-pick-bounds-label', 'h3'));
  const boundsRow = createElement('div');
  boundsRow.className = 'pk-bounds';
  boundsGroup.appendChild(boundsRow);
  [['tok-pick-min', 'min'], ['tok-pick-max', 'max']].forEach(([id, end]) => {
    const wrap = createElement('span');
    wrap.className = 'pk-bound';
    const lbl = createElement('span');
    lbl.className = 'pk-bound-lbl';
    wrap.appendChild(lbl);
    const f = idNode(id, 'input');
    f.type = 'text';
    f.className = 'pk-bound-amt';
    f.dataset.pkBound = end;
    f.dataset.k = 'pk/' + end;
    wrap.appendChild(f);
    boundsRow.appendChild(wrap);
  });
  // The reading under the pair. Empty and hidden here exactly as it ships in
  // the shell, and [S06.2] writes it on every repaint - the same reservation
  // #tok-pick-names above already ships under.
  const boundsSaid = idNode('tok-pick-bounds-said', 'p');
  boundsSaid.className = 'pk-warn pk-bounds-said';
  boundsSaid.hidden = true;
  boundsGroup.appendChild(boundsSaid);

  const previewLine = createElement('div');
  picker.appendChild(previewLine);
  previewLine.appendChild(idNode('tok-pick-preview-label', 'span'));
  previewLine.appendChild(idNode('tok-pick-preview'));

  ['shapes', 'colors', 'glyphs'].forEach((kind) => {
    const group = createElement('div');
    picker.appendChild(group);
    group.appendChild(idNode('tok-pick-' + kind + '-label', 'h3'));
    group.appendChild(idNode('tok-pick-' + kind));
  });

  /* D-39 P1-1's refusal line, FIRST in the footer exactly as the shell has
     it — the sentence is read before the buttons in both sequences, which is
     checks 103e and 108's rule about never re-ordering a surface in CSS.
     Empty and hidden here exactly as it ships. */
  const pkSaid = idNode('tok-pick-said', 'p');
  pkSaid.className = 'pk-said';
  pkSaid.hidden = true;
  picker.appendChild(pkSaid);

  const doneBtn = idNode('tok-pick-done', 'button');
  doneBtn.dataset.pk = 'done';
  picker.appendChild(doneBtn);

  /* ---- plan 05-D35b's round-rules block. It lives INSIDE #app in the shell,
         after #board, so it is built here for the reason the fight region above
         is built where it is: #app's child order here is the appendChild order.

         IT IS NOT A <dialog> and takes no DIALOG_ROOTS entry.

         EVERY CLASS AND EVERY DATASET SPELLING IS COPIED FROM THE MARKUP, and
         that warning costs more here than almost anywhere else in this file:
         data-rr is what [S07.7]'s delegated listener resolves and what keeps
         [S07.1] from resolving these controls at all, and .rr-amt is what tells
         the amount field apart from the board's stepper fields. A typo in
         either is not a red run — it is a green one, over a surface nothing is
         listening to.

         THE ROWS CARRY NO id, exactly as they carry none in the shell, and are
         written out rather than looped over the artifact's cap for the reason
         the action editor's rows are: makeStubDom runs BEFORE the artifact is
         evaluated, so `A` does not exist here. Check 116 holds both counts to
         App.data.MAX_ROUND_RULES. ---- */
  const roundRules = idNode('roundrules', 'section');
  app.appendChild(roundRules);
  const rrHeadLine = createElement('div');
  rrHeadLine.className = 'rr-head-line';
  roundRules.appendChild(rrHeadLine);
  rrHeadLine.appendChild(idNode('rr-head', 'h2'));
  // .rr-note LEFT UNDER D-38 (site 1) AND SO DOES THE NODE THAT STOOD IN FOR IT.
  // The paragraph is on the how-to tab and the heading carries a one-line
  // tooltip in its place. A stub node for a class the shell no longer has is
  // the id gate's own failure direction arriving through a class name, where
  // nothing is checking: it would be this page testing markup that has already
  // shipped out.

  const rrList = idNode('rr-list');
  rrList.className = 'rr-list';
  rrList.setAttribute('role', 'group');
  roundRules.appendChild(rrList);
  /* D-35c's COLUMN HEADER. It is markup and not a class on the first row, so
     it is built here too — and it matters to the walk rather than only to the
     eye: the hairline between two rules is written `.rr-rule + .rr-rule`, and
     the header being a NON-.rr-rule sibling is what keeps the first rule from
     drawing one. Nothing in this page has a stylesheet, but a stub whose child
     order differs from the shell's is a stub the next structural check reads
     the wrong answer off. */
  const rrCols = createElement('div');
  rrCols.className = 'rr-cols';
  rrList.appendChild(rrCols);
  ['The rule', 'Who it reaches', 'Which token', 'How much', ''].forEach((word) => {
    const col = createElement('span');
    col.className = 'rr-cell rr-col';
    col.textContent = word;
    rrCols.appendChild(col);
  });

  [0, 1, 2, 3, 4, 5, 6, 7].forEach((slot) => {
    const row = createElement('div');
    row.className = 'rr-rule';
    row.dataset.rrSlot = String(slot);
    row.hidden = true;
    ['rr-read', 'rr-whos', 'rr-toks'].forEach((cls) => {
      const box = createElement('div');
      box.className = 'rr-cell ' + cls;
      row.appendChild(box);
    });
    // The amount and the remove each sit in a CELL of their own, which is the
    // shell's spelling and is load-bearing there: [C17] hangs the row's
    // hairline and its column gap off the cells, and a control that WAS the
    // grid item would carry both on its own box. Copied rather than flattened,
    // for this block's own stated warning about spellings.
    const amtCell = createElement('div');
    amtCell.className = 'rr-cell rr-amt-cell';
    const amt = createElement('input');
    amt.type = 'text';
    amt.className = 'rr-amt';
    amt.dataset.rrSlot = String(slot);
    amt.dataset.k = 'rr/amt/' + slot;
    amtCell.appendChild(amt);
    row.appendChild(amtCell);

    const rmCell = createElement('div');
    rmCell.className = 'rr-cell rr-rm-cell';
    const rm = createElement('button');
    rm.type = 'button';
    rm.className = 'rr-rm';
    rm.textContent = 'Remove';
    rm.dataset.rr = 'remove';
    rm.dataset.rrSlot = String(slot);
    rm.dataset.k = 'rr/rm/' + slot;
    rmCell.appendChild(rm);
    row.appendChild(rmCell);

    rrList.appendChild(row);
  });

  const rrFoot = createElement('div');
  rrFoot.className = 'rr-foot';
  roundRules.appendChild(rrFoot);

  const rrAdd = idNode('rr-add', 'button');
  rrAdd.type = 'button';
  rrAdd.className = 'rr-add';
  rrAdd.textContent = '+ Add a round rule';
  rrAdd.dataset.rr = 'add';
  rrAdd.dataset.k = 'rr/add';
  rrFoot.appendChild(rrAdd);

  const rrSaid = idNode('rr-said', 'p');
  rrSaid.className = 'rr-said';
  rrSaid.hidden = true;
  rrFoot.appendChild(rrSaid);

  /* D-39 P1-1's refusal line, a SECOND node beside the cap sentence exactly
     as the shell has it. [S07.7] writes this one and [S06.13] writes the one
     above, and neither may ever write the other's. */
  const rrRefuse = idNode('rr-refuse', 'p');
  rrRefuse.className = 'rr-said rr-refuse';
  rrRefuse.hidden = true;
  rrFoot.appendChild(rrRefuse);

  /* ---- plan 05-D38's how-to tab. It lives INSIDE #app in the shell, after
     #roundrules, so it is built here in that order for the reason the round
     rules above are: #app's child order here is the appendChild order.

     IT IS NOT A <dialog> and takes no DIALOG_ROOTS entry.

     THIS IS THE ONE REGION ON THIS PAGE WHOSE STATIC TEXT IS NOT EMPTY, AND
     THAT IS A DELIBERATE EXCEPTION TO A RULE THIS FILE STATES FOUR TIMES.
     DIALOG_FLOOR's note, SHARE_FLOOR's note and the picker's title all say the
     same thing: "this page is a hand-made stand-in rather than a parser, so
     static text is empty here", and Layer A reads those words in the document
     instead. That answer is right for a title and a legend. It is WRONG for a
     tab that is nothing BUT prose, and prose about a FIGHT — which is exactly
     where a comparative word writes itself. Layer A's list is eighteen words;
     the rendered list is forty-eight. Leaving this region to Layer A alone
     would put the artifact's largest single block of prose behind its smallest
     word list, and the wave-1 lesson is that a surface the walk never reaches
     reports clean forever.

     SO THE WORDS ARE EXTRACTED FROM THE SHELL RATHER THAN RE-TYPED HERE, and
     the alternative was measured before it was rejected: twenty paragraphs
     hand-copied into this builder is twenty strings that go stale silently the
     first time somebody edits one of them in the artifact, and a scanner
     reading last week's prose is a scanner reading nothing. The extraction is
     ONE region, by its own markers, for THREE tag names, and it is deliberately
     not a parser for anything else — it fails LOUD if the slice comes back
     empty, because a region that harvested nothing is the failure this whole
     exception exists to prevent.

     ONE LEAF PER STRING, WHICH IS WHAT THE WALK READS. The shell carries no
     inline element inside any paragraph in this region ([C18] states the rule
     and check 126 counts it), so every string here is one leaf in both pages. ---- */
  const howto = idNode('howto', 'section');
  howto.className = 'ht';
  howto.setAttribute('aria-labelledby', 'howto-head');
  app.appendChild(howto);
  const htAt = html.indexOf('<section class="ht" id="howto"');
  const htSlice = htAt === -1 ? '' : html.slice(htAt, html.indexOf('</section>', htAt));
  const htStrings = [];
  const htRe = /<(h2|h3|p|div)\b([^>]*)>([^<]*)<\/\1>/g;
  let htM;
  while ((htM = htRe.exec(htSlice)) !== null) {
    const text = htM[3]
      .replace(/&amp;/g, '&').replace(/&mdash;/g, '—')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'");
    if (text.trim() === '') { continue; }
    htStrings.push({ tag: htM[1], attrs: htM[2], text: text });
  }
  if (htStrings.length < 20) {
    fail('the how-to tab\'s words could not be read out of the shell: '
      + htStrings.length + ' string(s) found. Check 126 harvests this region,'
      + '\n       and a region that harvests nothing reports clean forever.');
  }
  htStrings.forEach((item) => {
    const isHead = item.attrs.indexOf('id="howto-head"') !== -1;
    const node = isHead ? idNode('howto-head', 'h2') : createElement(item.tag);
    node.textContent = item.text;
    howto.appendChild(node);
  });
  if (!byId['howto-head']) {
    fail('the how-to tab\'s heading id was not found in the shell slice.');
  }

  /* ---- plan 03.1-05's action editor, hand-made from the static markup ------
     Exactly the three members beyond a plain element the picker above has, and
     no more: .open, showModal() and close(), the last dispatching the `close`
     event the focus hand-back is bound to. [S07.3]'s editorDialog() probes for
     a close() FUNCTION before it will do anything, so a plain div here would
     keep the whole editor path skipped — the precise state the picker was in
     before this stub was written, with gate checks reporting green over a
     handler that bailed out on its second line.

     EVERY DATASET SPELLING BELOW IS COPIED FROM THE SHELL. A typo here is not
     a red run: it is a green one, over a control nothing is listening to. The
     same goes for the classes — [S07.3] tells the name field apart by .ae-name
     exactly as [S07.2] tells .pk-name apart, so without it every keystroke,
     Enter, Escape and blur handler declines on its first line. */
  const editor = idNode('act-edit', 'dialog');
  editor.open = false;
  editor.dataset.edPane = 'author';
  editor.showModal = () => { editor.open = true; };
  editor.close = () => {
    if (!editor.open) { return; }
    editor.open = false;
    dispatch(editor, event('close'));
  };
  body.appendChild(editor);

  const authorPane = idNode('act-edit-pane-author');
  editor.appendChild(authorPane);
  authorPane.appendChild(idNode('act-edit-title', 'h2'));

  // The side chooser. Two static buttons, each holding a name node [S06.5]
  // writes on every repaint and a tick the class hides until the side is live.
  //
  // D-38 PUT A RESTING WORD IN EACH NAME NODE AND THIS PAGE CARRIES IT, which
  // is the three-part rule applied to TEXT rather than to an id: the shell
  // ships "Cats" and "Mechs" in the markup, so a stub that shipped them empty
  // would be a page on which check 118 below could not tell a wordless pill
  // from a painted one. The word is written here in the same breath as the
  // class and the dataset, for the reason every builder in this function gives
  // about its own spellings — a stub that differs from the shell is a stub the
  // next check reads the wrong answer off.
  const sideGroup = createElement('div');
  authorPane.appendChild(sideGroup);
  sideGroup.appendChild(idNode('act-edit-sides-label', 'h3'));
  [['act-edit-side-cats', 'cats', 'Cats'], ['act-edit-side-mechs', 'mechs', 'Mechs']].forEach(([id, side, word]) => {
    const b = idNode(id, 'button');
    b.className = 'ae-side';
    b.dataset.act = 'selectActionSide';
    b.dataset.edSide = side;
    b.dataset.k = 'ae/side/' + side;
    const nameNode = createElement('span');
    nameNode.className = 'ae-side-name';
    nameNode.textContent = word;
    b.appendChild(nameNode);
    const tick = createElement('span');
    tick.className = 'ae-check';
    tick.textContent = '✓';
    b.appendChild(tick);
    sideGroup.appendChild(b);
  });

  // The list of every action on the chosen side, empty exactly as it ships:
  // its rows come from the LIVE build slice at render time, which is what makes
  // an action a student authored appear in it with no second tier (D-07).
  const aeListGroup = createElement('div');
  authorPane.appendChild(aeListGroup);
  aeListGroup.appendChild(idNode('act-edit-list-label', 'h3'));
  aeListGroup.appendChild(idNode('act-edit-list'));

  const aeNewRow = createElement('div');
  authorPane.appendChild(aeNewRow);
  [
    ['act-edit-new', 'createAction', 'ae/new'],
    ['act-edit-remove', 'removeAction', 'ae/remove']
  ].forEach(([id, act, k]) => {
    const b = idNode(id, 'button');
    b.dataset.act = act;
    b.dataset.k = k;
    aeNewRow.appendChild(b);
  });

  const aeNameGroup = createElement('div');
  authorPane.appendChild(aeNameGroup);
  aeNameGroup.appendChild(idNode('act-edit-name-label', 'h3'));
  const aeName = idNode('act-edit-name', 'input');
  aeName.type = 'text';
  aeName.className = 'ae-name';
  aeName.dataset.k = 'ae/name';
  aeNameGroup.appendChild(aeName);

  /* ---- plan 03.1-06's term rows (ACT-02, ACT-03, ACT-04) ------------------
     No longer hidden as a block: plan 03.1-05 reserved it and plan 03.1-06
     fills it. Every row is STATIC here exactly as it is in the shell, and so is
     the amount field inside it — a rebuilt field throws away a half-typed
     number, which is the whole reason [S06.5] writes into these rather than
     building them.

     EVERY CLASS AND EVERY DATASET SPELLING IS COPIED FROM THE SHELL, and the
     amount field's class is the load-bearing one: [S07.3] tells an amount field
     apart by .ae-amt exactly as it tells the name field apart by .ae-name, so
     without it every keystroke, Enter, Escape and blur handler declines on its
     first line and a gate check driving them reads green over a field nothing
     is listening to. The two chooser boxes are found by class from inside the
     row, so they are classed rather than given ids of their own — the id budget
     is a line in this file per entry, and five amount fields was the whole of
     what a term row genuinely needs to be reachable by. */
  const aeTerms = idNode('act-edit-terms');
  aeTerms.className = 'ae-terms';
  authorPane.appendChild(aeTerms);

  function aeTermRow(id, field, slot, withWho) {
    const row = idNode(id);
    row.className = 'ae-term';
    if (field !== 'cost') { row.hidden = true; }
    /* D-32 PART 2: EVERY ROW CARRIES A READING AND NO ROW CARRIES A LABEL.
       The span this replaces was `.ae-term-lbl` and it held the word "Spends"
       or "Needs" in the shell and nothing at all here — which is exactly why
       the swap is worth a note rather than a silent edit: a stub node with no
       text is invisible to the Layer C harvest, so the eight printings of two
       words that left the shell cost this gate nothing, while the twelve
       READINGS that arrived cost it two harvested attributes each. The row
       count moved by zero and the dialog harvest moved a long way up, and
       both of those are measured in the plan summary rather than assumed.

       It is built for the xf rows TOO, which the label never was: a change is
       a term like the other two and reads like one. */
    const read = createElement('div');
    read.className = 'ae-term-read';
    row.appendChild(read);
    if (withWho) {
      const who = createElement('div');
      who.className = 'ae-term-who';
      row.appendChild(who);
    }
    const toks = createElement('div');
    toks.className = 'ae-term-toks';
    row.appendChild(toks);
    const amt = idNode(id + '-amt', 'input');
    amt.type = 'text';
    amt.className = 'ae-amt';
    amt.dataset.aeField = field;
    amt.dataset.aeSlot = String(slot);
    amt.dataset.k = 'ae/amt/' + field + '/' + slot;
    row.appendChild(amt);
    aeTerms.appendChild(row);
    return row;
  }

  // WRITTEN OUT RATHER THAN LOOPED OVER THE ARTIFACT'S CAPS, and the reason is
  // mechanical: makeStubDom runs BEFORE the artifact is evaluated — it is what
  // the artifact is evaluated against — so `A` does not exist yet here. That
  // was measured, not assumed: the looped spelling threw "Cannot access 'A'
  // before initialization" on its first run. So these are hand-written twice,
  // once here and once in the shell, and check 65 is what holds both counts to
  // App.ops.MAX_ACTION_COST / App.data.MAX_ACTION_REQ / App.data.MAX_ACTION_XF
  // rather than to each other. D-32 moved all three from their old counts in
  // the same change the constants moved.
  /* D-38's THREE TERM LEGENDS, AND THIS PAGE NOW BUILDS THEM WITH THEIR
     TOOLTIPS. D-38 moved the three explainer sentences off the rows and onto
     the legends as title attributes, which is the idiom that decision names by
     example. Layer A reads a title in the document and always did; what it
     could NOT do is read one on a stub that never built the node, and D-29's
     recorded lesson is the wave-1 lesson in its attribute edition — a word that
     leaves textContent leaves a scanner that only reads textContent. So the
     heads are built here, with the word AND the sentence, and LABEL_ATTRS picks
     the title up exactly as it does on the fight surface. Four strings became
     six in the dialog harvest and DIALOG_FLOOR's note records the arithmetic.

     The Override head is NOT built: it belongs to the proposal pane, which this
     page builds separately and which has its own floor. Said out loud rather
     than left as an absence — that legend's tooltip is Layer A's alone, and it
     is the one site of the eleven where that is true. */
  function aeTermHead(word, say) {
    const head = createElement('div');
    head.className = 'ae-term-head';
    const legend = createElement('h3');
    legend.className = 'ae-legend';
    legend.textContent = word;
    legend.setAttribute('title', say);
    head.appendChild(legend);
    aeTerms.appendChild(head);
  }
  aeTermHead('Cost', 'Spent when the action is used.');
  aeTermRow('act-edit-cost-0', 'cost', 0, false);
  aeTermRow('act-edit-cost-1', 'cost', 1, false);
  aeTermRow('act-edit-cost-2', 'cost', 2, false);
  aeTermRow('act-edit-cost-3', 'cost', 3, false);
  /* D-40's pool preview, built EMPTY and HIDDEN exactly as the shell ships it.
     It is appended after the four cost rows and before the Needs head, which is
     where the shell has it — inside the Cost list rather than between two lists
     — and the order matters to nothing here except a reader comparing the two
     files side by side, which is the whole reason this page is hand-written. */
  const aePool = idNode('act-edit-cost-pool');
  aePool.className = 'ae-pool';
  aePool.hidden = true;
  aeTerms.appendChild(aePool);
  aeTermHead('Needs', 'Must be there for the action to be used. It is not spent.');
  aeTermRow('act-edit-req-0', 'req', 0, false);
  aeTermRow('act-edit-req-1', 'req', 1, false);
  aeTermRow('act-edit-req-2', 'req', 2, false);
  aeTermRow('act-edit-req-3', 'req', 3, false);
  aeTermHead('Changes', 'What the action changes, and by how much. Put a minus in front for a change downward.');
  aeTermRow('act-edit-xf-0', 'xf', 0, true);
  aeTermRow('act-edit-xf-1', 'xf', 1, true);
  aeTermRow('act-edit-xf-2', 'xf', 2, true);
  aeTermRow('act-edit-xf-3', 'xf', 3, true);

  const aeActions = createElement('div');
  authorPane.appendChild(aeActions);
  /* D-39 P1-1's refusal line, FIRST in the footer exactly as the shell has
     it. #tok-pick-said's twin. */
  const aeSaid = idNode('act-edit-said', 'p');
  aeSaid.className = 'ae-said';
  aeSaid.hidden = true;
  aeActions.appendChild(aeSaid);
  // plan 03.1-07's pane switch. data-ap and NOT data-act: it is page work with
  // no op behind it, and the proposal pane's own delegated listener is what
  // reads it.
  const aePropOpen = idNode('act-prop-open', 'button');
  aePropOpen.dataset.ap = 'open';
  aePropOpen.dataset.k = 'ap/open';
  aeActions.appendChild(aePropOpen);
  // D-34's cancel step, in the footer beside Done exactly as the shell has it.
  // data-act and a real App.ops name, NOT data-ae: a press on it dispatches,
  // which is the partition this dialog is read by and which check 68e reads
  // back off the live registration.
  const aeCancel = idNode('act-edit-cancel', 'button');
  aeCancel.dataset.act = 'restoreAction';
  aeCancel.dataset.k = 'ae/restore';
  aeActions.appendChild(aeCancel);
  const aeDone = idNode('act-edit-done', 'button');
  aeDone.dataset.ae = 'done';
  aeActions.appendChild(aeDone);

  /* ---- plan 03.1-07's proposal pane (ACT-05's first half, ACT-06, ACT-07) --
     Reserved empty by plan 03.1-05 and filled here, hand-made from the static
     markup exactly as every block above it is.

     EVERY CLASS IS COPIED FROM THE SHELL and two of them are load-bearing
     rather than decorative. [S06.5] selects the transformation rows by
     .ae-prop-row and the override row by .ae-prop-over, so the override row
     must NOT wear the first of those or it would be filled as a fourth
     transformation. And [S07.3]'s proposal block tells an amount field apart
     by .ae-prop-amt, which is deliberately NOT .ae-amt: a field in here
     wearing the authoring class would dispatch the very op this pane exists
     not to send, and the whole of the nothing-lands check would be green over
     a pane that writes. */
  const aePropose = idNode('act-edit-propose', 'section');
  aePropose.className = 'ae-pane';
  aePropose.hidden = true;
  editor.appendChild(aePropose);

  aePropose.appendChild(idNode('act-prop-title', 'h2'));

  const aePropRefuse = idNode('act-prop-refuse', 'p');
  aePropRefuse.className = 'ae-prop-refuse';
  aePropRefuse.hidden = true;
  aePropose.appendChild(aePropRefuse);

  const aePropSays = idNode('act-prop-says', 'p');
  aePropSays.className = 'ae-prop-says';
  aePropose.appendChild(aePropSays);

  [['caster', 'act-prop-caster-label'],
    ['target', 'act-prop-target-label']].forEach(([kind, labelId]) => {
    const group = createElement('div');
    aePropose.appendChild(group);
    group.appendChild(idNode(labelId, 'h3'));
    const box = createElement('div');
    box.className = 'ae-prop-picks ae-prop-' + kind;
    group.appendChild(box);
  });

  // A container under D-32, matching the shell: one report line per cost term.
  const aePropCost = idNode('act-prop-cost');
  aePropCost.className = 'ae-prop-reports';
  aePropose.appendChild(aePropCost);
  const aePropReqs = idNode('act-prop-reqs');
  aePropReqs.className = 'ae-prop-reports';
  aePropose.appendChild(aePropReqs);

  const aePropRows = idNode('act-prop-rows');
  aePropRows.className = 'ae-prop-rows';
  aePropose.appendChild(aePropRows);

  function aePropRow(slot) {
    const row = createElement('div');
    row.className = 'ae-prop-row';
    row.hidden = true;
    const lbl = createElement('span');
    lbl.className = 'ae-prop-lbl';
    row.appendChild(lbl);
    const amt = createElement('input');
    amt.type = 'text';
    amt.className = 'ae-prop-amt';
    amt.dataset.apSlot = String(slot);
    amt.dataset.k = 'ap/amt/' + slot;
    amt.setAttribute('aria-label', 'How much this change is');
    row.appendChild(amt);
    aePropRows.appendChild(row);
    return row;
  }
  // Four, with the cap, under D-32 — hand-written for makeStubDom's stated
  // reason (the artifact is not evaluated yet) and held to the constant by
  // check 65, which counts the SHELL's rows against App.data.MAX_ACTION_XF and
  // the stub's against the same number.
  aePropRow(0);
  aePropRow(1);
  aePropRow(2);
  aePropRow(3);

  const aePropOver = createElement('div');
  aePropOver.className = 'ae-prop-over';
  aePropRows.appendChild(aePropOver);
  ['ae-prop-who', 'ae-prop-toks'].forEach((cls) => {
    const box = createElement('div');
    box.className = cls;
    aePropOver.appendChild(box);
  });
  const aePropOverAmt = createElement('input');
  aePropOverAmt.type = 'text';
  aePropOverAmt.className = 'ae-prop-amt';
  aePropOverAmt.dataset.apSlot = 'over';
  aePropOverAmt.dataset.k = 'ap/amt/over';
  aePropOverAmt.setAttribute('aria-label', 'How much the added line is');
  aePropOver.appendChild(aePropOverAmt);

  const aePropClose = idNode('act-prop-close', 'button');
  aePropClose.dataset.ap = 'close';
  aePropClose.dataset.k = 'ap/close';
  aePropose.appendChild(aePropClose);

  /* ---- plan 04-05's share surface, hand-made from the static markup --------
     Exactly the three members beyond a plain element both dialogs above have,
     and no more: .open, showModal() and close(), the last dispatching the
     `close` event a focus hand-back binds to. A plain div here would keep the
     whole surface skipped, which is the state the picker was in before its stub
     was written — two gate checks green over a handler that bailed on its
     second line.

     EVERY CLASS AND EVERY DATASET SPELLING IS COPIED FROM THE SHELL, and two of
     the classes are load-bearing rather than decorative. [S06.6] tells the code
     field apart from the paste field by .sh-code against .sh-paste, and the
     whole of this plan's contract is which of those two it may write: it
     rewrites the first even while it holds focus and never touches the second.
     A typo in either is not a red run — it is a green one, over a field nothing
     is listening to.

     The two panes take different id stems, share-* and sh-load-*, so their
     controls partition by attribute exactly as act-edit-* and act-prop-* do. */
  const share = idNode('share', 'dialog');
  share.open = false;
  share.dataset.shPane = 'copy';
  share.showModal = () => { share.open = true; };
  share.close = () => {
    if (!share.open) { return; }
    share.open = false;
    dispatch(share, event('close'));
  };
  body.appendChild(share);

  const sharePane = idNode('share-pane-copy', 'section');
  sharePane.className = 'sh-pane';
  share.appendChild(sharePane);
  sharePane.appendChild(idNode('share-title', 'h2'));

  const shareCode = idNode('share-code', 'textarea');
  shareCode.className = 'sh-code';
  shareCode.dataset.k = 'sh/code';
  sharePane.appendChild(shareCode);

  const shareLen = idNode('share-length', 'p');
  shareLen.className = 'sh-len';
  sharePane.appendChild(shareLen);

  const shareOver = idNode('share-over', 'p');
  shareOver.className = 'sh-warn';
  shareOver.hidden = true;
  sharePane.appendChild(shareOver);

  const shareSaid = idNode('share-said', 'p');
  shareSaid.className = 'sh-said';
  shareSaid.hidden = true;
  sharePane.appendChild(shareSaid);

  [['share-copy', 'copy', 'sh/copy'],
    ['share-to-load', 'to-load', 'sh/to-load'],
    ['share-done', 'done', 'sh/done']].forEach(([id, sh, k]) => {
    const b = idNode(id, 'button');
    b.dataset.sh = sh;
    b.dataset.k = k;
    sharePane.appendChild(b);
  });

  const shLoad = idNode('sh-load', 'section');
  shLoad.className = 'sh-pane';
  shLoad.hidden = true;
  share.appendChild(shLoad);
  shLoad.appendChild(idNode('sh-load-label', 'h2'));

  const shPaste = idNode('sh-load-field', 'textarea');
  shPaste.className = 'sh-paste';
  shPaste.dataset.k = 'sh/paste';
  shLoad.appendChild(shPaste);

  const shLoadSaid = idNode('sh-load-said', 'p');
  shLoadSaid.className = 'sh-said';
  shLoadSaid.hidden = true;
  shLoad.appendChild(shLoadSaid);

  [['sh-load-do', 'load', 'sh/load'],
    ['sh-load-back', 'to-copy', 'sh/to-copy']].forEach(([id, sh, k]) => {
    const b = idNode(id, 'button');
    b.dataset.sh = sh;
    b.dataset.k = k;
    shLoad.appendChild(b);
  });

  /* ---- plan 04-05's reset confirmation (SHARE-06, D-19) -------------------
     Its own root, because it is a different act with a different opener. It
     draws NOTHING from state and rides no SYNC_HOOKS entry, so there is no
     repaint to exercise here — but it is still a <dialog>, so it still needs
     its three members, its ids and its DIALOG_ROOTS entry, and the harvest
     still walks it from the moment it exists. That is the whole point of the
     gate being bidirectional: this entry could not have been forgotten.

     The sentence on #reset-ask-says is STATIC MARKUP in the shell, so its text
     is empty here — this page is a hand-made stand-in rather than a parser, and
     Layer A reads that sentence in the document instead. */
  const resetAsk = idNode('reset-ask', 'dialog');
  resetAsk.open = false;
  resetAsk.showModal = () => { resetAsk.open = true; };
  resetAsk.close = () => {
    if (!resetAsk.open) { return; }
    resetAsk.open = false;
    dispatch(resetAsk, event('close'));
  };
  body.appendChild(resetAsk);
  resetAsk.appendChild(idNode('reset-ask-title', 'h2'));
  const resetSays = idNode('reset-ask-says', 'p');
  resetSays.className = 'rs-says';
  resetAsk.appendChild(resetSays);
  [['reset-ask-cancel', 'cancel', 'rs/cancel'],
    ['reset-ask-confirm', 'confirm', 'rs/confirm']].forEach(([id, rs, k]) => {
    const b = idNode(id, 'button');
    b.dataset.rs = rs;
    b.dataset.k = k;
    resetAsk.appendChild(b);
  });

  doc.createElement = createElement;
  doc.getElementById = (id) => (KNOWN_IDS.indexOf(id) === -1 ? null : (byId[id] || null));
  doc.querySelector = (selector) => queryAll(body, selector)[0] || null;
  doc.querySelectorAll = (selector) => queryAll(body, selector);
  doc.addEventListener = (type, fn) => {
    if (!doc._listeners[type]) { doc._listeners[type] = []; }
    doc._listeners[type].push(fn);
  };

  const win = { scrollX: 0, scrollY: 0, _listeners: Object.create(null) };
  win.addEventListener = (type, fn) => {
    if (!win._listeners[type]) { win._listeners[type] = []; }
    win._listeners[type].push(fn);
  };
  win.scrollTo = () => {};

  /* getComputedStyle, FOR THE ONE THING THE ARTIFACT ASKS OF IT — plan
     05-D42. [S06.17] reads the design tokens off the root's computed style to
     colour the sprites, so that moving a [C00] token moves them. This page has
     no cascade, so the tokens are READ OUT OF THE SHELL'S OWN :root BLOCK
     rather than re-typed here — a copy would go stale the day a token moved —
     and a property the root style has been given by a row (documentElement's
     setProperty, which the stub already models) wins over the sheet, which is
     what inline style does to a custom property in a browser. Only the root is
     answered, because nothing else is asked for. */
  const rootTokens = Object.create(null);
  (function readRoot() {
    const at = html.indexOf(':root{');
    const end = at === -1 ? -1 : html.indexOf('}', at);
    if (at === -1 || end === -1) { fail('the shell\'s :root token block could not be found.'); }
    const re = /(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g;
    const body = html.slice(at, end);
    let m;
    while ((m = re.exec(body)) !== null) { rootTokens[m[1]] = m[2]; }
    if (Object.keys(rootTokens).length < 10) {
      fail('the shell\'s :root token block gave ' + Object.keys(rootTokens).length + ' colour token(s).');
    }
  })();
  win.getComputedStyle = (node) => ({
    getPropertyValue(name) {
      if (node !== doc.documentElement) { return ''; }
      const own = doc.documentElement._props[name];
      if (own !== undefined) { return own; }
      return rootTokens[name] !== undefined ? rootTokens[name] : '';
    }
  });

  function event(type, props) {
    const evt = { type: type, target: null, detail: 0, bubbles: true, defaultPrevented: false };
    Object.keys(props || {}).forEach((k) => { evt[k] = props[k]; });
    evt.preventDefault = () => { evt.defaultPrevented = true; };
    evt.stopPropagation = () => {};
    return evt;
  }

  return {
    document: doc,
    window: win,
    byId: byId,
    KNOWN_IDS: KNOWN_IDS,
    event: event,
    CSS: { escape: (s) => String(s).replace(/([^A-Za-z0-9_-])/g, '\\$1') }
  };
}

module.exports = {
  HTML_PATH: HTML_PATH,
  html: html,
  SCRIPT_BODY_RE: SCRIPT_BODY_RE,
  scriptBody: scriptBody,
  fail: fail,
  makeStubDom: makeStubDom
};
