import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import * as G from '../scripts/logogen.mjs';
import { inkBounds, viewBox, describeSvg } from '../scripts/svg.mjs';
import { auditStructure, paintCount } from '../scripts/logoaudit.mjs';
import { fetchGoogleFont, parseFont } from '../scripts/font.mjs';
import { findChrome } from '../scripts/preview.mjs';

const CHROME = findChrome();
const needsChrome = { skip: CHROME ? false : 'no headless browser on this machine' };

const svg = (inner, attrs = 'viewBox="0 0 100 100"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${inner}</svg>`;

const close = (a, b, tol, msg) =>
  assert.ok(Math.abs(a - b) <= tol, msg ?? `expected ${a} within ${tol} of ${b}`);

const NO_INK = svg('<g></g>', 'viewBox="0 0 10 10"');

/** A square symbol, so its placed width and its placed height are the same number. */
const SYMBOL = svg('<rect x="0" y="0" width="40" height="40" fill="#111111"/>', 'viewBox="0 0 40 40"');
/** A 6:1 slab standing in for a wordmark, and the same slab ten times the size. */
const WORD = svg('<rect x="0" y="0" width="120" height="20" fill="#111111"/>', 'viewBox="0 0 120 20"');
const WORD_10X = svg('<rect x="0" y="0" width="1200" height="200" fill="#111111"/>', 'viewBox="0 0 1200 200"');

// ---------------------------------------------------------------------------
// A real font, when the network allows it
// ---------------------------------------------------------------------------

let bitter = null;
let bitterWhy = '';

before(async () => {
  try {
    const cacheDir = path.join(os.tmpdir(), 'brandi-font-test-cache');
    bitter = parseFont((await fetchGoogleFont('Bitter', { weight: 700, cacheDir })).buffer);
  } catch (e) {
    bitterWhy = e.message;
  }
});

const needsBitter = (t) => {
  if (bitter) return false;
  t.skip(`needs Bitter from Google Fonts, which did not arrive: ${bitterWhy}`);
  return true;
};

const errorsOf = (findings) => findings.filter((f) => f.severity === 'error');

describe('normalising a master', () => {
  test('the viewBox becomes the artwork and nothing else', () => {
    const out = G.normaliseMaster(svg('<rect x="30" y="40" width="20" height="10" fill="#111111"/>', 'viewBox="0 0 500 500"'));
    const vb = viewBox(out);
    const ink = inkBounds(out);
    assert.deepEqual([vb.x, vb.y, vb.width, vb.height], [30, 40, 20, 10]);
    for (const k of ['x', 'y', 'width', 'height']) close(vb[k], ink[k], 1e-9, `${k}: ${vb[k]} vs ${ink[k]}`);
  });

  test('coordinates are rounded to the stated precision and the box barely moves', () => {
    const source = svg('<path d="M20.123456 30.987654 L170.55555 30.987654 L170.55555 160.4444 Z" fill="#111111"/>', 'viewBox="0 0 200 200"');
    const before2 = inkBounds(source);

    const out = G.normaliseMaster(source, { precision: 2 });
    const d = /\bd="([^"]*)"/.exec(out)[1];
    for (const n of d.match(/-?\d+(?:\.\d+)?/g)) {
      assert.ok(/^-?\d+(\.\d{1,2})?$/.test(n), `${n} is not rounded to two places`);
    }

    // Each edge can move by at most half a unit in the last place, so a side can
    // move by at most one whole unit in the last place.
    const after = inkBounds(out);
    close(after.width, before2.width, 0.01 + 1e-9);
    close(after.height, before2.height, 0.01 + 1e-9);
  });

  test('a coarser precision is honoured', () => {
    const out = G.normaliseMaster(svg('<path d="M10.123456 10.987654 L90.555 90.444 Z" fill="#111111"/>'), { precision: 1 });
    for (const n of /\bd="([^"]*)"/.exec(out)[1].match(/-?\d+(?:\.\d+)?/g)) {
      assert.ok(/^-?\d+(\.\d)?$/.test(n), `${n} is not rounded to one place`);
    }
  });

  test('the shape is the shape it was, because a clean master that is a different mark is the worst bug here', () => {
    // Rounding, arc-to-cubic conversion and a retargeted viewBox all have to
    // leave the drawing alone. The proof is the ink box: normalise a mark and it
    // must still be exactly as wide and as tall as it was.
    const marks = {
      straight: svg('<path d="M20.123456 30.987654 L170.55555 30.987654 L170.55555 160.4444 Z" fill="#111111"/>', 'viewBox="0 0 200 200"'),
      arcs: svg('<path d="M20 100 A80 80 0 0 1 180 100 A80 80 0 0 1 20 100 Z" fill="#111111"/>', 'viewBox="0 0 200 200"'),
      curves: svg('<path d="M10 10 C60.123456 0.987654 140.55 20.11 190 100 S100 190 10 10 Z" fill="#111111"/>', 'viewBox="0 0 200 200"'),
      shapes: svg('<circle cx="50" cy="50" r="30" fill="#111111"/><path d="M10 90 Q50 10 90 90 Z" fill="#111111"/>'),
    };
    for (const precision of [1, 2, 3]) {
      const tol = 10 ** -precision + 1e-9;
      for (const [name, source] of Object.entries(marks)) {
        const a = inkBounds(source);
        const b = inkBounds(G.normaliseMaster(source, { precision }));
        close(b.width, a.width, tol, `${name} at precision ${precision}: width went ${a.width} to ${b.width}`);
        close(b.height, a.height, tol, `${name} at precision ${precision}: height went ${a.height} to ${b.height}`);
      }
    }
  });

  test('editor leavings are removed: the declaration, the doctype, comments, metadata and inkscape attributes', () => {
    const dirty = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Created with Inkscape -->
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" inkscape:version="1.1" sodipodi:docname="mark.svg">
  <metadata id="metadata7">a pile of RDF</metadata>
  <path d="M30 40 L170 40 L170 160 Z" fill="#111111" inkscape:label="Layer 1" sodipodi:nodetypes="ccc"/>
</svg>`;
    const out = G.normaliseMaster(dirty);
    assert.ok(!/<\?xml/.test(out), 'the xml declaration survived');
    assert.ok(!/<!DOCTYPE/i.test(out), 'the doctype survived');
    assert.ok(!/<!--/.test(out), 'a comment survived');
    assert.ok(!/<metadata/i.test(out), 'the metadata block survived');
    assert.ok(!/RDF/i.test(out), 'the metadata content survived');
    assert.ok(!/inkscape:|sodipodi:/i.test(out), 'an editor attribute survived');
    assert.match(out, /<path d="[^"]*" fill="#111111"\/>/, 'the drawing itself should be untouched');
  });

  test('the output declares a namespace, even when the source did not', () => {
    // A file with no namespace renders as nothing in some contexts and as XML
    // source in others, and a master is the file everybody else copies.
    const out = G.normaliseMaster('<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="#111111"/></svg>');
    assert.match(out, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.match(G.normaliseMaster(svg('<rect x="1" y="1" width="8" height="8" fill="#111111"/>')), /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  });

  test('padding is a fraction of the larger side, applied on all four sides', () => {
    const out = G.normaliseMaster(svg('<rect x="10" y="10" width="100" height="50" fill="#111111"/>', 'viewBox="0 0 300 300"'), { padding: 0.1 });
    const vb = viewBox(out);
    // The larger side is 100, so the pad is 10 everywhere, not 10 across and 5 down.
    assert.deepEqual([vb.x, vb.y, vb.width, vb.height], [0, 0, 120, 70]);
  });

  test('no padding means the box is tight', () => {
    const vb = viewBox(G.normaliseMaster(svg('<rect x="10" y="10" width="100" height="50" fill="#111111"/>', 'viewBox="0 0 300 300"')));
    assert.deepEqual([vb.x, vb.y, vb.width, vb.height], [10, 10, 100, 50]);
  });

  test('a file with no ink is handed back rather than given a zero-sized or NaN viewBox', () => {
    const out = G.normaliseMaster(NO_INK);
    assert.equal(out, NO_INK);
    assert.ok(!/NaN/.test(out));
    const vb = viewBox(out);
    assert.ok(vb.width > 0 && vb.height > 0, 'the original box is still a usable box');
  });

  test('null and non-string input are refused rather than coerced', () => {
    for (const bad of [null, undefined, '', 42, {}, ['<svg/>']]) {
      assert.throws(() => G.normaliseMaster(bad), TypeError, `${JSON.stringify(bad)} should be refused`);
    }
  });
});

describe('the mono variants', () => {
  const twoInks = svg(
    '<rect x="0" y="0" width="5" height="5" fill="#1F6F4A"/>'
    + '<rect x="5" y="0" width="5" height="5" fill="#C7452E"/>'
    + '<path d="M0 9 L9 9" fill="none" stroke="#333333"/>',
    'viewBox="0 0 10 10"',
  );

  test('each variant paints in exactly one ink, which is what one-colour reproduction means', () => {
    const { black, white } = G.monoVariants(twoInks);
    assert.equal(paintCount(black), 1, 'the black variant is not one colour');
    assert.equal(paintCount(white), 1, 'the white variant is not one colour');
    assert.match(black, /#000000/);
    assert.match(white, /#FFFFFF/);
  });

  test('fill="none" survives both variants, because a shape that was deliberately unpainted must not fill in', () => {
    const { black, white } = G.monoVariants(twoInks);
    assert.match(black, /fill="none"/);
    assert.match(white, /fill="none"/);
  });
});

describe('the typeset wordmark', () => {
  test('what ships is artwork, with no text element and no font reference in it', (t) => {
    if (needsBitter(t)) return;
    const { svg: out } = G.typesetWordmark(bitter, 'Acme', { family: 'Bitter', weight: 700 });
    assert.ok(!/<text\b/i.test(out), 'a live text element survived');
    assert.ok(!/font-family/i.test(out), 'a font reference survived');
    assert.match(out, /<path d="/);
  });

  test('the result is a file the master audit has nothing to say about', (t) => {
    if (needsBitter(t)) return;
    const { svg: out } = G.typesetWordmark(bitter, 'Acme');
    const findings = auditStructure(out, { role: 'master' });
    assert.deepEqual(errorsOf(findings), [], findings.map((f) => `${f.id}: ${f.message}`).join(' | '));
  });

  test('the case is applied to the artwork, and as-given leaves the name alone', (t) => {
    if (needsBitter(t)) return;
    const upper = G.typesetWordmark(bitter, 'Acme', { letterCase: 'upper' });
    const lower = G.typesetWordmark(bitter, 'Acme', { letterCase: 'lower' });
    const given = G.typesetWordmark(bitter, 'Acme', { letterCase: 'as-given' });

    assert.equal(upper.recipe.text, 'ACME');
    assert.equal(lower.recipe.text, 'acme');
    assert.equal(given.recipe.text, 'Acme');

    const box = (w) => inkBounds(w.svg);
    assert.notDeepEqual(box(upper), box(given), 'setting the name in capitals changed nothing');
    assert.notDeepEqual(box(lower), box(given), 'setting the name in lower case changed nothing');
    // All capitals is the wider of the two, and lower case is the shorter.
    assert.ok(box(upper).width > box(lower).width);
    assert.ok(box(lower).height < box(upper).height);
  });

  test('the recipe records everything the wordmark cannot be rebuilt without', (t) => {
    if (needsBitter(t)) return;
    // Two years later somebody has to set a sub-brand name to match. Without the
    // face, the weight, the size and the tracking that is guesswork with a ruler.
    const { recipe } = G.typesetWordmark(bitter, 'Acme', { family: 'Bitter', weight: 700, size: 240, tracking: 20 });
    assert.equal(recipe.family, 'Bitter');
    assert.equal(recipe.weight, 700);
    assert.equal(recipe.setAt, 240);
    assert.equal(recipe.tracking, 20);
    assert.equal(recipe.unitsPerEm, bitter.unitsPerEm);
    assert.ok(recipe.unitsPerEm > 0);
    assert.ok(recipe.capHeight > 0);
    assert.equal(recipe.outlined, true);
    assert.equal(recipe.letterCase, 'as-given');
  });

  test('tracking widens the mark and negative tracking narrows it', (t) => {
    if (needsBitter(t)) return;
    const at = (tracking) => inkBounds(G.typesetWordmark(bitter, 'Acme', { tracking }).svg).width;
    const none = at(0);
    assert.ok(at(100) > none, `100/1000 em of tracking did not widen ${none}`);
    assert.ok(at(-50) < none, `negative tracking did not narrow ${none}`);
  });

  test('a name that is empty or only whitespace is refused, rather than setting nothing', (t) => {
    if (needsBitter(t)) return;
    for (const bad of ['', '   ', '\n\t ', null, undefined]) {
      assert.throws(() => G.typesetWordmark(bitter, bad), TypeError, `${JSON.stringify(bad)} should be refused`);
      assert.throws(() => G.typesetWordmark(bitter, bad), /needs a name to set/);
    }
  });

  test('a missing font is refused before anything is drawn', () => {
    // Needs no network: the guard runs first.
    for (const bad of [null, undefined, 0, '']) {
      assert.throws(() => G.typesetWordmark(bad, 'Acme'), TypeError);
      assert.throws(() => G.typesetWordmark(bad, 'Acme'), /needs a parsed font/);
    }
  });
});

describe('cap height', () => {
  test('a real face sits in the band every text face sits in, and scales with the size', (t) => {
    if (needsBitter(t)) return;
    const em = 1000;
    const cap = G.capHeightOf(bitter, em);
    assert.ok(cap / em > 0.6 && cap / em < 0.78, `cap height was ${cap / em} of the em`);
    // Linear in the size argument, because the lockup arithmetic multiplies it.
    close(G.capHeightOf(bitter, 500), cap / 2, 0.01);
    close(G.capHeightOf(bitter, 200), cap / 5, 0.01);
  });

  test('the cap height on the wordmark matches the one taken off the face', (t) => {
    if (needsBitter(t)) return;
    const w = G.typesetWordmark(bitter, 'Acme', { size: 200 });
    assert.equal(w.capHeight, G.capHeightOf(bitter, 200));
    assert.equal(w.recipe.capHeight, w.capHeight);
  });

  test('something that is not a usable font is null, not a throw', () => {
    // A face with no H is not a reason to fail the whole wordmark: the caller
    // falls back to the ink height and says which basis it used.
    for (const bad of [null, undefined, {}, 'Bitter', 42, { unitsPerEm: 1000 }]) {
      assert.equal(G.capHeightOf(bad, 100), null, `${JSON.stringify(bad)} should be null`);
    }
  });
});

describe('lockups', () => {
  const symbolWidthOf = (symbol, symbolHeight) => {
    const ink = inkBounds(symbol);
    return ink.width * (symbolHeight / ink.height);
  };

  test('a horizontal lockup is exactly symbol, gap, wordmark, measured both ways', () => {
    const { svg: out, construction } = G.composeLockup({ symbol: SYMBOL, wordmark: WORD });
    const expected = symbolWidthOf(SYMBOL, construction.symbolHeight) + construction.gap + inkBounds(WORD).width;
    close(construction.width, expected, 0.02, `construction says ${construction.width}, arithmetic says ${expected}`);
    close(inkBounds(out).width, expected, 0.02, 'the drawn width disagrees with the stated one');
    close(viewBox(out).width, construction.width, 0.005);
  });

  test('a stacked lockup is exactly symbol, gap, wordmark, down the page', () => {
    const { svg: out, construction } = G.composeLockup({ symbol: SYMBOL, wordmark: WORD, orientation: 'stacked' });
    const expected = construction.symbolHeight + construction.gap + inkBounds(WORD).height;
    close(construction.height, expected, 0.02);
    close(inkBounds(out).height, expected, 0.02);
    assert.equal(construction.orientation, 'stacked');
  });

  test('the lockup is scale free: the same two marks ten times larger give the identical proportions', () => {
    // The construction defect this function exists to prevent. A gap set in
    // absolute units is airy on a billboard and cramped on a business card, and
    // the horizontal and stacked versions then drift apart as well.
    const small = G.composeLockup({ symbol: SYMBOL, wordmark: WORD }).construction;
    const large = G.composeLockup({ symbol: SYMBOL, wordmark: WORD_10X }).construction;

    close(small.gap / small.height, large.gap / large.height, 1e-9, 'the gap is not a ratio of the mark');
    close(small.width / small.height, large.width / large.height, 1e-9, 'the whole lockup changed proportion');
    close(small.symbolHeight / small.height, large.symbolHeight / large.height, 1e-9);
    // And the drawing agrees with the arithmetic at both sizes.
    const boxRatio = (w) => {
      const b = inkBounds(G.composeLockup({ symbol: SYMBOL, wordmark: w }).svg);
      return b.width / b.height;
    };
    close(boxRatio(WORD), boxRatio(WORD_10X), 1e-6);
  });

  test('gapRatio and symbolRatio move the geometry in the direction they claim', () => {
    const tight = G.composeLockup({ symbol: SYMBOL, wordmark: WORD, gapRatio: 0.25 }).construction;
    const loose = G.composeLockup({ symbol: SYMBOL, wordmark: WORD, gapRatio: 1.5 }).construction;
    assert.ok(loose.gap > tight.gap, 'a larger gapRatio did not open the gap');
    assert.ok(loose.width > tight.width, 'a larger gapRatio did not widen the lockup');
    assert.equal(tight.symbolHeight, loose.symbolHeight, 'the gap should not move the symbol size');

    const small = G.composeLockup({ symbol: SYMBOL, wordmark: WORD, symbolRatio: 0.8 }).construction;
    const big = G.composeLockup({ symbol: SYMBOL, wordmark: WORD, symbolRatio: 2 }).construction;
    assert.ok(big.symbolHeight > small.symbolHeight, 'a larger symbolRatio did not grow the symbol');
    assert.ok(big.width > small.width, 'a larger symbol did not widen the lockup');
    assert.equal(small.gap, big.gap, 'the symbol size should not move the gap');
  });

  test('a cap height, when the caller knows it, is the unit, and the record says so', () => {
    // The wordmark ink height runs ascender to descender for mixed case, which
    // makes every default-built lockup a little too airy. Saying which basis was
    // used is what lets the next designer tell those two lockups apart.
    const guessed = G.composeLockup({ symbol: SYMBOL, wordmark: WORD });
    const known = G.composeLockup({ symbol: SYMBOL, wordmark: WORD, capHeight: 10 });

    assert.equal(guessed.construction.unit, inkBounds(WORD).height);
    assert.match(guessed.construction.unitIs, /ink height/);
    assert.equal(known.construction.unit, 10);
    assert.match(known.construction.unitIs, /cap height/);
    assert.match(known.construction.gapRule, /cap height/);
    assert.match(known.construction.symbolRule, /cap height/);
    assert.ok(known.construction.gap < guessed.construction.gap, 'a smaller unit should give a smaller gap');
  });

  test('a symbol and a wordmark that both name an id "a" do not collide once composed', () => {
    // Two marks in one document is two chances they both called a clip path "a",
    // and the second one silently wins for both.
    const withId = (attrs, w, h) => svg(
      `<defs><clipPath id="a"><rect width="${w / 2}" height="${h}"/></clipPath></defs>`
      + `<rect width="${w}" height="${h}" fill="#111111" clip-path="url(#a)"/>`,
      attrs,
    );
    const out = G.composeLockup({
      symbol: withId('viewBox="0 0 40 40"', 40, 40),
      wordmark: withId('viewBox="0 0 120 20"', 120, 20),
    }).svg;

    const ids = [...out.matchAll(/\bid="([^"]*)"/g)].map((m) => m[1]);
    assert.equal(ids.length, 2);
    assert.equal(new Set(ids).size, 2, `ids collided: ${ids.join(', ')}`);
    assert.deepEqual(describeSvg(out).danglingRefs, [], 'a reference lost its definition');
  });

  test('the composed file is well formed enough for the audit to accept it', () => {
    const out = G.composeLockup({ symbol: SYMBOL, wordmark: WORD }).svg;
    const ids = auditStructure(out, { role: 'master' }).map((f) => f.id);
    for (const bad of ['dangling-ref', 'no-xmlns', 'unquoted-attribute']) {
      assert.ok(!ids.includes(bad), `the lockup reports ${bad}: ${ids.join(', ')}`);
    }
  });

  test('a lockup with only half of itself is refused', () => {
    for (const args of [undefined, {}, { symbol: SYMBOL }, { wordmark: WORD }, { symbol: SYMBOL, wordmark: null }]) {
      assert.throws(() => G.composeLockup(args), TypeError);
      assert.throws(() => G.composeLockup(args), /needs both a symbol and a wordmark/);
    }
  });

  test('a mark with no ink is refused rather than turned into NaN geometry', () => {
    // Dividing by a zero ink height is how a lockup ends up with a viewBox of
    // NaN, which renders as an empty box and reports no error anywhere.
    assert.throws(() => G.composeLockup({ symbol: NO_INK, wordmark: WORD }), /both marks to contain ink/);
    assert.throws(() => G.composeLockup({ symbol: SYMBOL, wordmark: NO_INK }), /both marks to contain ink/);
    assert.throws(() => G.composeLockup({ symbol: NO_INK, wordmark: NO_INK }), TypeError);
  });

  test('nothing in the composed file is NaN', () => {
    for (const orientation of ['horizontal', 'stacked']) {
      const { svg: out, construction } = G.composeLockup({ symbol: SYMBOL, wordmark: WORD, orientation });
      assert.ok(!/NaN/.test(out), `${orientation} lockup carries NaN`);
      for (const [k, v] of Object.entries(construction)) {
        if (typeof v === 'number') assert.ok(Number.isFinite(v), `${orientation}: ${k} is ${v}`);
      }
    }
  });
});

describe('clear space', () => {
  const MARK = svg('<rect x="0" y="0" width="10" height="8" fill="#111111"/>', 'viewBox="0 0 10 10"');

  test('the rule is a ratio of a named element, and the sentence names it', () => {
    // A clear-space rule in millimetres is wrong at every size except the one it
    // was written at, and a rule nobody can measure is a rule nobody follows.
    const rule = G.clearSpaceRule(MARK);
    assert.equal(rule.element, 'the height of the mark');
    assert.equal(rule.ratio, 0.5);
    assert.ok(rule.sentence.includes(rule.element), 'the sentence does not name the element');
    assert.match(rule.sentence, /^Leave clear space on every side equal to half the height of the mark\./);
  });

  test('units is the ratio times the ink height, not the viewBox height', () => {
    assert.equal(G.clearSpaceRule(MARK).inkHeight, 8);
    assert.equal(G.clearSpaceRule(MARK).units, 4);
    assert.equal(G.clearSpaceRule(MARK, { ratio: 0.25 }).units, 2);
    assert.equal(G.clearSpaceRule(MARK, { ratio: 1 }).units, 8);
  });

  test('a named basis replaces the default and is what the sentence says', () => {
    const rule = G.clearSpaceRule(MARK, { basis: 'the height of the letter A', ratio: 0.25 });
    assert.equal(rule.element, 'the height of the letter A');
    assert.ok(rule.sentence.includes('0.25 the height of the letter A'));
  });

  test('a mark with no ink has no clear-space rule to state', () => {
    assert.equal(G.clearSpaceRule(NO_INK), null);
  });
});

describe('minimum sizes', { concurrency: 1 }, () => {
  /** The same mark twice, once with a hairline outline and once with a fat one. */
  const ring = (strokeWidth) => svg(
    `<rect x="10" y="10" width="80" height="80" fill="none" stroke="#111111" stroke-width="${strokeWidth}"/>`,
  );

  // Each measurement launches a browser twice, so the answer for a given stroke
  // width is taken once and shared. It is a pure function of the mark.
  const measured = new Map();
  const minimumFor = (strokeWidth) => {
    if (!measured.has(strokeWidth)) measured.set(strokeWidth, G.minimumSizes(ring(strokeWidth)));
    return measured.get(strokeWidth);
  };

  test('the answer is a floor, in round screen pixels and real millimetres, and it says what set it', needsChrome, async () => {
    const result = await minimumFor(1);
    assert.ok(result, 'expected a measurement');
    assert.equal(result.screenPx % 10, 0, `screenPx was ${result.screenPx}, which is not a round ten`);
    assert.ok(result.screenPx > 0);
    assert.ok(result.printMm > 0, `printMm was ${result.printMm}`);
    assert.equal(typeof result.basis, 'string');
    assert.ok(result.basis.length > 0, 'the number means nothing without the feature that set it');
    assert.equal(result.isFloor, true);
    assert.equal(result.measured, true);
  });

  test('a thinner feature forces a larger minimum, which is the direction that is easy to get backwards', needsChrome, async () => {
    const thin = await minimumFor(1);
    const thick = await minimumFor(12);
    assert.ok(
      thin.screenPx > thick.screenPx,
      `a 1 unit stroke gave ${thin.screenPx}px and a 12 unit stroke gave ${thick.screenPx}px`,
    );
    assert.ok(thin.printMm > thick.printMm, `${thin.printMm}mm vs ${thick.printMm}mm`);
  });

  test('a mark with no ink has no minimum size, browser or not', needsChrome, async () => {
    assert.equal(await G.minimumSizes(NO_INK), null);
  });

  test('without a browser it never claims to have measured', async () => {
    // The geometric fallback can only see stroke widths on the path data. It
    // cannot see a gap closing or a counter filling in, and saying so is the
    // difference between a floor and a guess dressed as one.
    const stroked = await G.minimumSizes(ring(1), { chrome: null });
    assert.ok(stroked === null || stroked.measured === false, JSON.stringify(stroked));
    if (stroked) {
      assert.equal(stroked.screenPx % 10, 0);
      assert.ok(stroked.printMm > 0);
      assert.ok(!stroked.isFloor, 'an unmeasured estimate must not be published as the floor');
      assert.match(stroked.note, /No browser/);
    }

    const filled = await G.minimumSizes(svg('<rect x="10" y="10" width="80" height="80" fill="#111111"/>'), { chrome: null });
    assert.ok(filled === null || filled.measured === false, JSON.stringify(filled));

    assert.equal(await G.minimumSizes(NO_INK, { chrome: null }), null);
  });
});

describe('the generation record', () => {
  const SLOT = { id: 'A1', family: 'letterform', architecture: 'monogram', register: 'grotesque', symbolApproach: 'initial' };

  test('it records who drew it, when, and against which brief', () => {
    const record = G.generationRecord({
      id: 'A1',
      slot: SLOT,
      model: 'a named model',
      prompt: 'the slot brief, verbatim',
      date: new Date(2026, 2, 4, 12, 0, 0),
    });
    assert.equal(record.id, 'A1');
    assert.equal(record.generatedBy, 'a named model');
    assert.equal(record.generatedOn, '2026-03-04');
    assert.match(record.generatedOn, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(record.prompt, 'the slot brief, verbatim');
    assert.deepEqual(record.slot, SLOT);
    assert.ok(record.caveat.length > 0);
    assert.match(record.caveat, /trade mark/);
  });

  test('a date given as a string is read the same way', () => {
    assert.equal(G.generationRecord({ date: '2026-03-04T12:00:00' }).generatedOn, '2026-03-04');
  });

  test('an unrecorded model says it is unrecorded rather than leaving the field empty', () => {
    const record = G.generationRecord({});
    assert.equal(record.generatedBy, 'unrecorded');
    assert.equal(record.slot, null);
    assert.equal(record.prompt, null);
    assert.deepEqual(record.edits, []);
  });

  test('an unapproved mark says so, and an approved one names the person', () => {
    // The product must never imply a generated mark was approved when nobody
    // approved it. A blank field reads as approval to whoever inherits the file.
    const nobody = G.generationRecord({ id: 'A1', slot: SLOT });
    assert.equal(nobody.approvedBy, null);
    assert.equal(nobody.status, 'candidate, not approved');
    assert.ok(!/^approved/.test(nobody.status));

    const approved = G.generationRecord({ id: 'A1', slot: SLOT, approvedBy: 'Bea Shelley' });
    assert.equal(approved.approvedBy, 'Bea Shelley');
    assert.equal(approved.status, 'approved by a person');
  });

  test('the record survives a round trip through JSON, because that is how it is stored', () => {
    const record = G.generationRecord({ id: 'A1', slot: SLOT, model: 'm', date: new Date(2026, 2, 4) });
    assert.deepEqual(JSON.parse(JSON.stringify(record)), record);
  });
});


describe('the error names what was asked for', () => {
  test('a missing glyph names the requested family and weight, not the font name table', async () => {
    // A Google static instance cut from a variable font carries the DEFAULT
    // instance's name, so asking for Bitter 700 and being told "Bitter Thin has
    // no glyph" sends somebody looking in entirely the wrong place.
    const F = await import('../scripts/font.mjs');
    const G = await import('../scripts/logogen.mjs');
    let font;
    try {
      const { buffer } = await F.fetchGoogleFont('Bitter', { weight: 700 });
      font = F.parseFont(buffer);
    } catch {
      return; // no network, nothing to test
    }
    assert.throws(
      () => G.typesetWordmark(font, 'Acme \u{1F600}', { family: 'Bitter', weight: 700 }),
      /Bitter 700 has no glyph/,
    );
    // Without a stated family it falls back to whatever the font calls itself,
    // which is better than nothing.
    assert.throws(() => G.typesetWordmark(font, 'Acme \u{1F600}', {}), /has no glyph/);
  });
});
