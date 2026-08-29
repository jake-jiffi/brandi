import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as B from '../scripts/logoboard.mjs';
import { artboard, canvasManifest, validateArtboard, validateCanvas } from '../scripts/canvas.mjs';
import { planConcepts } from '../scripts/logospec.mjs';
import { findChrome } from '../scripts/preview.mjs';
import { parseXml, walk } from '../scripts/svg.mjs';

const CHROME = findChrome();
const needsChrome = { skip: CHROME ? false : 'no headless browser on this machine' };

const svg = (inner, attrs = 'viewBox="0 0 100 100"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${inner}</svg>`;

/** A mark with nothing wrong with it: two chunky shapes, well inside the box. */
const MARK = svg('<path d="M8 8 h84 v40 h-84 z" fill="#111111"/><circle cx="50" cy="74" r="22" fill="#111111"/>');

/**
 * A mark carrying every kind of internal reference a real drawing carries.
 *
 * The paints are deliberately all-numeric hex, so a search for surviving `#name`
 * references cannot mistake a colour for one.
 */
const WITH_IDS = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- drawn by a person, exported by an editor -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="64" height="64" viewBox="0 0 100 100">
  <defs>
    <clipPath id="a"><rect width="50" height="100"/></clipPath>
    <path id="p" d="M0 0 L10 10"/>
  </defs>
  <rect width="100" height="100" fill="#111111" clip-path="url(#a)"/>
  <use href="#p"/>
  <use xlink:href="#p"/>
  <path d="M0 0 L1 1" fill="none" stroke="#123456"/>
</svg>`;

/** Every `#name` reference in a document, ignoring hex colours. */
const references = (source) => [...source.matchAll(/#([A-Za-z_][\w.-]*)/g)].map((m) => m[1]);

/** Every id an element declares. */
const declaredIds = (source) => [...source.matchAll(/\bid\s*=\s*["']([^"']*)["']/g)].map((m) => m[1]);

/** How many elements a document has, so a rewrite can be shown not to have eaten any. */
function elementCount(source) {
  let n = 0;
  walk(parseXml(source), () => { n += 1; });
  return n;
}

/**
 * A round of `n` concepts built off a real plan, so the boards get the copy they
 * would actually get: real family names, registers, questions and signals.
 */
function round(n, { brandName = 'Acme Joinery' } = {}) {
  const plan = planConcepts({ name: brandName }, { count: Math.max(4, n) });
  const candidates = plan.slots.slice(0, n).map((slot) => ({ ...slot, svg: MARK }));
  return { plan, candidates, brandName };
}

const auditsFor = (candidates, verdict = 'contender') =>
  candidates.map((c) => ({ id: c.id, verdict, findings: [], contexts: [] }));

const SIZES = [1, 4, 12, 24];

describe('inlining a mark into a board', () => {
  test('every id is prefixed and so is every reference to it', () => {
    // The whole reason this function exists. Twelve marks on one board is twelve
    // chances that two of them both called a clip path "a", and the second one
    // silently wins for both. Prefixing the declaration and leaving the
    // reference behind is worse than not prefixing at all, because the mark then
    // points at nothing.
    const out = B.inlineSvg(WITH_IDS, { prefix: 'z' });

    assert.deepEqual(declaredIds(out).sort(), ['z-a', 'z-p']);
    assert.match(out, /clip-path="url\(#z-a\)"/);
    assert.match(out, /\shref="#z-p"/);
    assert.match(out, /xlink:href="#z-p"/);

    const refs = references(out);
    assert.equal(refs.length, 3, `expected three references, got ${refs.join(', ')}`);
    assert.ok(refs.every((r) => r.startsWith('z-')), `bare references survived: ${refs.join(', ')}`);
  });

  test('two marks that both name a clip path "a" do not collide on one board', () => {
    const one = B.inlineSvg(WITH_IDS, { prefix: 'r-A1' });
    const two = B.inlineSvg(WITH_IDS, { prefix: 'r-B2' });
    const ids = declaredIds(one + two);
    assert.equal(ids.length, 4);
    assert.equal(new Set(ids).size, 4, `ids collided: ${ids.join(', ')}`);
  });

  test("the source's own width and height are replaced, because they fight the container", () => {
    const out = B.inlineSvg(WITH_IDS, { prefix: 'z', width: 40, height: 30 });
    const openTag = /<svg\b[^>]*>/i.exec(out)[0];
    assert.match(openTag, /width="40"/);
    assert.match(openTag, /height="30"/);
    assert.ok(!/width="64"/.test(openTag), `the source width survived: ${openTag}`);
    assert.ok(!/height="64"/.test(openTag), `the source height survived: ${openTag}`);
    // Only the root is touched. A child's own geometry is the drawing.
    assert.match(out, /<rect width="50" height="100"\/>/);
  });

  test('an xml declaration, a doctype and comments are stripped, because they cannot be nested', () => {
    const out = B.inlineSvg(WITH_IDS, { prefix: 'z' });
    assert.ok(!/<\?xml/.test(out));
    assert.ok(!/<!DOCTYPE/i.test(out));
    assert.ok(!/<!--/.test(out));
    assert.match(out, /^<svg\b/);
  });

  test('a colour reaches every fill and stroke but leaves fill="none" alone', () => {
    // A shape that was deliberately unpainted becoming solid is how a mark fills
    // in, so `none` has to survive a recolour.
    const out = B.inlineSvg(WITH_IDS, { prefix: 'z', colour: '#FFFFFF' });
    assert.match(out, /fill="#FFFFFF"/);
    assert.match(out, /stroke="#FFFFFF"/);
    assert.match(out, /fill="none"/);
    assert.ok(!/#111111|#123456/.test(out), 'an original ink survived the recolour');
  });

  test('a labelled mark is an image to a screen reader and an unlabelled one is not there at all', () => {
    const labelled = B.inlineSvg(MARK, { prefix: 'z', label: 'Concept A1' });
    assert.match(labelled, /role="img"/);
    assert.match(labelled, /aria-label="Concept A1"/);
    assert.ok(!/aria-hidden/.test(labelled));

    const bare = B.inlineSvg(MARK, { prefix: 'z' });
    assert.match(bare, /role="presentation"/);
    assert.match(bare, /aria-hidden="true"/);
    assert.ok(!/aria-label/.test(bare));
  });

  test('a label containing markup is escaped rather than closing the attribute', () => {
    const out = B.inlineSvg(MARK, { prefix: 'z', label: 'Bea & Sons <Ltd> "Best"' });
    assert.match(out, /aria-label="Bea &amp; Sons &lt;Ltd&gt; &quot;Best&quot;"/);
  });

  test('nothing in gives an empty string out rather than a throw', () => {
    assert.equal(B.inlineSvg(''), '');
    assert.equal(B.inlineSvg(null), '');
    assert.equal(B.inlineSvg(undefined), '');
    assert.equal(B.inlineSvg(0), '');
  });

  test('an id full of regex metacharacters is prefixed rather than corrupting the document', () => {
    // The function builds a regex per id, so an id like `a.b(c)` is a live
    // hazard: unescaped, `.` matches anything and `(c)` opens a capture group,
    // and the replacement lands in the wrong place or not at all.
    const source = svg(
      '<defs><clipPath id="a.b(c)"><rect width="5" height="5"/></clipPath></defs>'
      + '<rect width="10" height="10" fill="#111111" clip-path="url(#a.b(c))"/>',
      'viewBox="0 0 10 10"',
    );
    const out = B.inlineSvg(source, { prefix: 'q' });

    assert.deepEqual(declaredIds(out), ['q-a.b(c)']);
    assert.match(out, /clip-path="url\(#q-a\.b\(c\)\)"/);
    assert.equal(elementCount(out), elementCount(source), 'the rewrite ate or invented an element');
  });

  test('an id that is a prefix of another id is not rewritten twice', () => {
    // `id="a"` and `id="ab"` both match a careless `#a` pattern, and the mark
    // then points at whichever definition the rewrite mangled last.
    const source = svg(
      '<defs><clipPath id="a"><rect width="5" height="5"/></clipPath>'
      + '<clipPath id="ab"><rect width="6" height="6"/></clipPath></defs>'
      + '<rect width="10" height="10" fill="#111111" clip-path="url(#ab)"/>',
      'viewBox="0 0 10 10"',
    );
    const out = B.inlineSvg(source, { prefix: 'q' });
    assert.deepEqual(declaredIds(out).sort(), ['q-a', 'q-ab']);
    assert.match(out, /clip-path="url\(#q-ab\)"/);
  });
});

describe('the boards', () => {
  test('every artboard passes the canvas validator with no errors, at one, four, twelve and twenty-four concepts', () => {
    // The most valuable test in the file. A board that fails the validator does
    // not fail loudly on the canvas: it renders with a hole in it, or with an
    // attribute silently dropped, and the round is judged on the wrong picture.
    for (const n of SIZES) {
      const boards = B.conceptRoundBoards(round(n));
      assert.equal(boards.length, 5, `${n} concepts should still give five boards`);
      for (const b of boards) {
        const result = validateArtboard(b.source, { name: `${b.file} at ${n}` });
        assert.deepEqual(result.errors, [], `${b.file} at ${n} concepts: ${result.errors.map((e) => e.message).join(' | ')}`);
      }
    }
  });

  test('the whole deck also validates as a canvas, frames and manifest together', () => {
    for (const n of SIZES) {
      const boards = B.conceptRoundBoards(round(n));
      const manifest = canvasManifest(boards);
      const result = validateCanvas({
        artboards: boards.map((b) => ({ file: b.file, source: b.source })),
        manifest,
      });
      assert.deepEqual(result.errors, [], `${n} concepts: ${result.errors.map((e) => `${e.file} ${e.message}`).join(' | ')}`);
    }
  });

  test('every artboard carries the phrase that stops brandi check auditing the tool\'s own output', () => {
    // Without it the generated sheets get held to the anti-slop rules that exist
    // for authored work, and a specimen gets faulted for containing specimens.
    for (const n of SIZES) {
      for (const b of B.conceptRoundBoards(round(n))) {
        assert.ok(
          b.source.includes('generated from the resolved system'),
          `${b.file} at ${n} concepts is missing the generated marker`,
        );
      }
    }
  });

  test('the marker sits in the first 4096 characters, which is all the check reads', () => {
    for (const b of B.conceptRoundBoards(round(12))) {
      assert.ok(b.source.slice(0, 4096).includes('generated from the resolved system'), `${b.file}`);
    }
  });

  test('artboard names are PascalCase, because artboard() refuses anything else', () => {
    for (const b of B.conceptRoundBoards(round(4))) {
      assert.match(b.file.replace(/\.dc\.html$/, ''), /^[A-Z][A-Za-z0-9]*$/, `${b.file} is not PascalCase`);
    }
    // Not decoration: the emitter throws, so a lower-case name would take the
    // whole round down rather than shipping a badly named file.
    assert.throws(() => artboard({ name: 'range', body: '<p>x</p>' }), TypeError);
    assert.throws(() => artboard({ name: 'Range.dc.html', body: '<p>x</p>' }), TypeError);
  });

  test('a round comes back in the shape canvasManifest wants', () => {
    for (const n of SIZES) {
      for (const b of B.conceptRoundBoards(round(n))) {
        assert.equal(typeof b.file, 'string');
        assert.match(b.file, /\.dc\.html$/);
        assert.equal(typeof b.source, 'string');
        assert.ok(b.source.length > 0);
        // No `page` field. The canvas shows one round, and an artboard naming a
        // page that `canvas.json` does not list is refused outright by the
        // design helper, which is how this was found.
        assert.equal(b.page, undefined);
        for (const k of ['w', 'h']) {
          assert.ok(Number.isFinite(b[k]) && b[k] > 0, `${b.file}: ${k} is ${b[k]}`);
        }
      }
    }
  });

  test('the manifest lays out one frame per board, at every round size', () => {
    for (const n of SIZES) {
      const boards = B.conceptRoundBoards(round(n));
      const manifest = canvasManifest(boards);
      assert.equal(manifest.artboards.length, boards.length);
      assert.deepEqual(manifest.artboards.map((a) => a.file), boards.map((b) => b.file));
    }
  });

  test('a round with no candidates is refused rather than emitting an empty deck', () => {
    const { plan } = round(4);
    assert.throws(() => B.conceptRoundBoards({ plan, candidates: [] }), TypeError);
    assert.throws(() => B.conceptRoundBoards({ plan, candidates: [] }), /at least one candidate/);
  });

  test("a concept's id, architecture and register all reach the range board", () => {
    // A board that renders but says nothing about what is on it is a board that
    // cannot be discussed, and the round is the discussion.
    const { candidates, brandName } = round(6);
    assert.equal(candidates.length, 6, 'the fixture lost its candidates, so the loop below proves nothing');
    const board = B.rangeBoard({ candidates, audits: auditsFor(candidates), brandName });
    for (const c of candidates) {
      assert.ok(board.source.includes(c.id), `${c.id} is not on the range board`);
      assert.ok(board.source.includes(c.architectureName), `${c.id}: ${c.architectureName} is missing`);
      assert.ok(board.source.includes(c.registerName), `${c.id}: ${c.registerName} is missing`);
    }
  });

  test('the verdict on each concept is stated in words, not left to a colour', () => {
    const { candidates, brandName } = round(4);
    const audits = candidates.map((c, i) => ({
      id: c.id,
      verdict: ['contender', 'contender-with-notes', 'not-a-primary', 'rejected'][i % 4],
      findings: [],
      contexts: [],
    }));
    const source = B.rangeBoard({ candidates, audits, brandName }).source;
    for (const phrase of ['clears every test', 'clears, with notes', 'not a primary mark', 'ruled out']) {
      assert.ok(source.includes(phrase), `${phrase} is missing`);
    }
  });

  test('a brand name with an ampersand, an angle bracket and a quote is escaped', () => {
    const brandName = 'Bea & Sons <Ltd> "Best"';
    const boards = B.conceptRoundBoards({ ...round(4), brandName });
    for (const b of boards) {
      assert.ok(b.source.includes('Bea &amp; Sons &lt;Ltd&gt; &quot;Best&quot;'), `${b.file} did not escape the name`);
      assert.ok(!b.source.includes('Bea & Sons'), `${b.file} leaked a raw ampersand`);
      assert.ok(!b.source.includes('<Ltd>'), `${b.file} leaked a raw angle bracket`);
      assert.deepEqual(validateArtboard(b.source, { name: b.file }).errors, []);
    }
  });

  test('the audit board says none and nothing, rather than undefined and null', () => {
    const { candidates, brandName } = round(3);
    const board = B.auditBoard({
      candidates,
      audits: [{ id: candidates[0].id, verdict: 'contender', findings: [], contexts: [] }],
      brandName,
    });
    assert.ok(!/undefined/.test(board.source), 'undefined reached the board');
    assert.ok(!/\bnull\b/.test(board.source), 'null reached the board');
    assert.match(board.source, />none</);
    assert.match(board.source, />nothing</);
  });

  test('an audit row names the failed context and the reason for it', () => {
    const { candidates, brandName } = round(2);
    const board = B.auditBoard({
      candidates,
      audits: [{
        id: candidates[0].id,
        verdict: 'not-a-primary',
        findings: [{ severity: 'warn', message: 'The thinnest stroke is under two pixels at 16px.' }],
        contexts: [
          { context: 'favicon-16', name: 'Browser tab, 16px', status: 'fail', reasons: ['the counters close'] },
          { context: 'patch-1.5in', name: 'Embroidered patch', status: 'deferred', reasons: [] },
        ],
      }],
      brandName,
    });
    assert.ok(board.source.includes('Browser tab, 16px'));
    assert.ok(board.source.includes('the counters close'));
    assert.ok(board.source.includes('The thinnest stroke is under two pixels at 16px.'));
    assert.ok(board.source.includes('Embroidered patch'));
  });

  test('no board prints undefined or NaN, at any round size', () => {
    // Both are what a missing field looks like once it has been through a
    // template, and both are visible to whoever is being asked to decide.
    for (const n of SIZES) {
      for (const b of B.conceptRoundBoards(round(n))) {
        assert.ok(!/undefined/.test(b.source), `${b.file} at ${n} concepts prints undefined`);
        assert.ok(!/NaN/.test(b.source), `${b.file} at ${n} concepts prints NaN`);
      }
    }
  });

  test('each board can be built on its own, and each one names itself', () => {
    const { plan, candidates, brandName } = round(5);
    const audits = auditsFor(candidates);
    const built = [
      ['Main', B.indexBoard({ plan, candidates, audits, brandName })],
      ['Range', B.rangeBoard({ candidates, audits, brandName })],
      ['Favicons', B.faviconBoard({ candidates, brandName })],
      ['Reversed', B.reverseBoard({ candidates, brandName })],
      ['Audit', B.auditBoard({ candidates, audits, brandName })],
    ];
    for (const [name, board] of built) {
      assert.ok(Number.isFinite(board.height) && board.height > 0, `${name}: height is ${board.height}`);
      assert.match(board.source, /<x-dc>/);
      assert.deepEqual(validateArtboard(board.source, { name }).errors, []);
    }
  });

  test('the favicon board draws the mark at the real pixel size, not a scaled picture of it', () => {
    // The point of the board. A 16 pixel mark shown at 64 pixels answers a
    // question nobody asked.
    const { candidates, brandName } = round(2);
    const source = B.faviconBoard({ candidates, brandName, sizes: [16, 32, 64] }).source;
    for (const px of [16, 32, 64]) {
      assert.ok(source.includes(`width:${px}px;height:${px}px`), `no ${px}px cell on the favicon board`);
    }
  });
});

describe('fitting the frames to the content', { concurrency: 1 }, () => {
  test('a measured frame is never shorter than the estimate it replaces', needsChrome, async () => {
    // A frame shorter than its artboard clips it, and clipping is the one canvas
    // failure that cannot be undone without re-seeding the whole thing. A probe
    // that measured short because a web font had not arrived must therefore lose
    // to the estimate, not win.
    const boards = B.conceptRoundBoards(round(6));
    const fitted = await B.fitFrames(boards);
    for (let i = 0; i < boards.length; i++) {
      assert.ok(
        fitted[i].h >= boards[i].h,
        `${boards[i].file} shrank from ${boards[i].h} to ${fitted[i].h}`,
      );
    }
  });

  test('the same boards come back, in the same order, with their files and widths untouched', needsChrome, async () => {
    const boards = B.conceptRoundBoards(round(6));
    const fitted = await B.fitFrames(boards);
    assert.equal(fitted.length, boards.length);
    assert.deepEqual(fitted.map((b) => b.file), boards.map((b) => b.file));
    assert.deepEqual(fitted.map((b) => b.w), boards.map((b) => b.w));
    assert.deepEqual(fitted.map((b) => b.source), boards.map((b) => b.source));
    for (const b of fitted) assert.ok(Number.isFinite(b.h) && b.h > 0, `${b.file}: h is ${b.h}`);
  });

  test('a fitted deck still lays out as a canvas', needsChrome, async () => {
    const boards = await B.fitFrames(B.conceptRoundBoards(round(12)));
    const manifest = canvasManifest(boards);
    const result = validateCanvas({
      artboards: boards.map((b) => ({ file: b.file, source: b.source })),
      manifest,
    });
    assert.deepEqual(result.errors, [], result.errors.map((e) => `${e.file} ${e.message}`).join(' | '));
  });

  test('without a browser the boards are handed back unchanged rather than guessed at', async () => {
    const boards = B.conceptRoundBoards(round(4));
    const fitted = await B.fitFrames(boards, { chrome: null });
    assert.equal(fitted.length, boards.length);
    assert.deepEqual(fitted, boards);
  });

  test('an empty deck is not a reason to launch a browser', async () => {
    assert.deepEqual(await B.fitFrames([]), []);
  });
});


describe('ids that fight regular expressions', () => {
  const svg = (inner, vb = '0 0 100 100') =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${inner}</svg>`;

  test('an id containing regex metacharacters is prefixed, and so is every reference to it', () => {
    // `inlineSvg` builds a regex out of every id it finds. An unescaped `.*`
    // would match most of the document and rewrite it.
    const src = svg(`<defs><linearGradient id="a.*b(c)[d]"><stop stop-color="#000"/></linearGradient></defs><rect width="9" height="9" fill="url('#a.*b(c)[d]')"/>`);
    const out = B.inlineSvg(src, { prefix: 'p1' });
    assert.ok(out.includes('id="p1-a.*b(c)[d]"'), 'the definition should be prefixed exactly once');
    assert.ok(out.includes("url(#p1-a.*b(c)[d])"), 'and the reference with it');
    assert.ok(!/id="p1-p1-/.test(out), 'and never twice');
  });

  test('a dotted id, which is what real exports produce, round trips', () => {
    const src = svg('<defs><linearGradient id="grad.1-a"><stop stop-color="#000"/></linearGradient></defs><rect width="9" height="9" fill="url(#grad.1-a)"/>');
    const out = B.inlineSvg(src, { prefix: 'q' });
    assert.ok(out.includes('id="q-grad.1-a"'));
    assert.ok(out.includes('url(#q-grad.1-a)'));
  });

  test('two marks that both define the same id do not collide', () => {
    const one = svg('<defs><linearGradient id="a"><stop stop-color="#111"/></linearGradient></defs><rect width="9" height="9" fill="url(#a)"/>');
    const a = B.inlineSvg(one, { prefix: 'A1' });
    const b = B.inlineSvg(one, { prefix: 'B2' });
    assert.ok(a.includes('id="A1-a"') && b.includes('id="B2-a"'));
    assert.ok(!a.includes('id="B2-a"'));
  });
});
