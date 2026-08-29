import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as A from '../scripts/logoaudit.mjs';
import { findChrome } from '../scripts/preview.mjs';
import { viewBox, inkBounds } from '../scripts/svg.mjs';

const CHROME = findChrome();
const needsChrome = { skip: CHROME ? false : 'no headless browser on this machine' };

const svg = (inner, attrs = 'viewBox="0 0 100 100"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${inner}</svg>`;

/** A mark that should pass everything: two chunky shapes, well inside the box. */
const CLEAN = svg('<path d="M8 8 h84 v40 h-84 z" fill="#111111"/><circle cx="50" cy="74" r="22" fill="#111111"/>');

const ids = (findings) => findings.map((f) => f.id);

describe('structure', () => {
  test('a clean mark reports nothing', () => {
    assert.deepEqual(A.auditStructure(CLEAN), []);
  });

  test('an empty file is reported once, not many times', () => {
    assert.deepEqual(ids(A.auditStructure('')), ['empty']);
    assert.deepEqual(ids(A.auditStructure('   ')), ['empty']);
    assert.deepEqual(ids(A.auditStructure(null)), ['empty']);
  });

  test('something that is not an svg stops there', () => {
    assert.deepEqual(ids(A.auditStructure('<html><body>hi</body></html>')), ['not-svg']);
  });

  test('a missing namespace is an error', () => {
    assert.ok(ids(A.auditStructure('<svg viewBox="0 0 10 10"><rect width="5" height="5"/></svg>')).includes('no-xmlns'));
  });

  test('an unquoted attribute is an error, because strict XML refuses the file', () => {
    const f = A.auditStructure(svg('<circle cx=50 cy="50" r="20" fill="#000"/>'));
    assert.ok(ids(f).includes('unquoted-attribute'));
  });

  test('a quoted document does not trip the unquoted check', () => {
    assert.ok(!ids(A.auditStructure(CLEAN)).includes('unquoted-attribute'));
    assert.ok(!ids(A.auditStructure(svg('<path d="M0 0 L1 1" fill=\'#000\'/>'))).includes('unquoted-attribute'));
  });

  test('a missing viewBox is an error', () => {
    assert.ok(ids(A.auditStructure('<svg xmlns="http://www.w3.org/2000/svg"><rect width="5" height="5" fill="#000"/></svg>')).includes('no-viewbox'));
  });

  test('a file that paints nothing is an error and stops there', () => {
    const f = ids(A.auditStructure(svg('<g></g>')));
    assert.ok(f.includes('no-ink'));
  });

  test('live text is a note on a candidate and an error on a master', () => {
    const src = svg('<text x="10" y="50" font-family="Bitter">Acme</text><rect width="90" height="90" fill="#000"/>');
    assert.equal(A.auditStructure(src, { role: 'candidate' }).find((f) => f.id === 'live-text').severity, 'note');
    assert.equal(A.auditStructure(src, { role: 'master' }).find((f) => f.id === 'live-text').severity, 'error');
  });

  test('a raster, a script and a foreignObject are each errors', () => {
    const f = ids(A.auditStructure(svg('<image href="a.png"/><script>x</script><foreignObject/><rect width="90" height="90" fill="#000"/>')));
    assert.ok(f.includes('raster'));
    assert.ok(f.includes('script'));
    assert.ok(f.includes('foreign-object'));
  });

  test('an external reference is an error', () => {
    assert.ok(ids(A.auditStructure(svg('<image href="https://example.com/a.png"/><rect width="90" height="90" fill="#000"/>'))).includes('external-ref'));
  });

  test('a paint pointing at a definition that is not there is an error', () => {
    assert.ok(ids(A.auditStructure(svg('<rect width="90" height="90" fill="url(#missing)"/>'))).includes('dangling-ref'));
  });

  test('a gradient is an error rather than a warning', () => {
    const src = svg('<defs><linearGradient id="g"><stop stop-color="#639"/></linearGradient></defs><rect width="90" height="90" fill="url(#g)"/>');
    const f = A.auditStructure(src).find((x) => x.id === 'gradient');
    assert.equal(f.severity, 'error');
    assert.match(f.message, /five of the ten/);
  });

  test('currentColor is flagged, harder on a master', () => {
    const src = svg('<rect width="90" height="90" fill="currentColor"/>');
    assert.equal(A.auditStructure(src, { role: 'candidate' }).find((f) => f.id === 'current-color').severity, 'warn');
    assert.equal(A.auditStructure(src, { role: 'master' }).find((f) => f.id === 'current-color').severity, 'error');
  });

  test('paint applied through CSS classes is flagged', () => {
    const src = svg('<style>.a { fill: #000 }</style><rect class="a" width="90" height="90"/>');
    assert.ok(ids(A.auditStructure(src)).includes('css-classes'));
  });

  test('ink outside the viewBox is reported as clipped', () => {
    const f = A.auditStructure(svg('<rect x="-40" y="10" width="60" height="60" fill="#000"/>')).find((x) => x.id === 'clipped');
    assert.ok(f, 'clipping should be caught');
    assert.match(f.fix, /viewBox of/);
  });

  test('a mark swimming in dead space is warned about, in terms of the consequence', () => {
    const f = A.auditStructure(svg('<rect x="42" y="42" width="16" height="16" fill="#000"/>')).find((x) => x.id === 'viewbox-slack');
    assert.ok(f);
    assert.match(f.message, /16 per cent/);
    assert.match(f.fix, /smaller than it has to be/);
  });

  test('a degenerate mark is not also reported as filling zero per cent', () => {
    // A zero-height line already reports as having no usable ink. Adding
    // "fills 0 per cent of its viewBox" on top helps nobody.
    const f = ids(A.auditStructure(svg('<path d="M5 50 H95" stroke="#000" stroke-width="0" fill="none"/>')));
    assert.ok(!f.includes('viewbox-slack'), `got ${f.join(', ')}`);
  });

  test('a file over the size ceiling is an error', () => {
    const huge = svg(`<rect width="90" height="90" fill="#000"/><!--${'x'.repeat(600 * 1024)}-->`);
    assert.ok(ids(A.auditStructure(huge)).includes('too-big'));
  });

  test('a traced mark with hundreds of segments is warned about', () => {
    const d = 'M0 0 ' + Array.from({ length: 500 }, (_, i) => `L${i % 90} ${(i * 7) % 90}`).join(' ');
    assert.ok(ids(A.auditStructure(svg(`<path d="${d}" fill="#000"/>`))).includes('node-count'));
  });
});

describe('geometry', () => {
  test('strokeRatio is the thinnest stroke over the mark span', () => {
    const src = svg('<path d="M10 10 H90" stroke="#000" stroke-width="10" fill="none"/><path d="M10 80 H90" stroke="#000" stroke-width="4" fill="none"/>');
    // The span includes half a stroke on each side, so the widest shape runs
    // 5 to 95 and the mark is 90 wide. The thinnest stroke is 4.
    const r = A.strokeRatio(src);
    assert.ok(Math.abs(r - 4 / 90) < 1e-6, `got ${r}`);
  });

  test('strokeRatio is null when nothing is stroked', () => {
    assert.equal(A.strokeRatio(CLEAN), null);
  });

  test('paintCount counts distinct inks, not shapes', () => {
    assert.equal(A.paintCount(CLEAN), 1);
    assert.equal(A.paintCount(svg('<rect width="9" height="9" fill="#111"/><rect width="9" height="9" fill="#222" stroke="#333"/>')), 3);
  });

  test('paintCount ignores none', () => {
    assert.equal(A.paintCount(svg('<path d="M0 0 L9 9" fill="none" stroke="#000"/>')), 1);
  });

  test('centreOffset is zero for a centred mark and grows as it moves', () => {
    assert.ok(A.centreOffset(svg('<circle cx="50" cy="50" r="20" fill="#000"/>')).distance < 1e-9);
    assert.ok(A.centreOffset(svg('<circle cx="70" cy="50" r="20" fill="#000"/>')).distance > 0.15);
  });

  test('centreOffset is null without a viewBox', () => {
    assert.equal(A.centreOffset('<svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1"/></svg>'), null);
  });
});

describe('application contexts', () => {
  test('a lockup failing the favicon is deferred, not failed', () => {
    // The single most important behaviour here. A lockup fails favicon, app
    // icon, patch and square avatar and is still the correct primary mark,
    // because the small grade asset covers all four. Counting those as
    // failures rejects the default architecture.
    const rows = A.auditContexts(CLEAN, { architecture: 'lockup' });
    const fav = rows.find((r) => r.context === 'favicon-16');
    assert.equal(fav.status, 'deferred');
    assert.equal(fav.expectation, 'fallback');
  });

  test('the same file as a symbol-only mark is judged on the favicon', () => {
    const rows = A.auditContexts(CLEAN, { architecture: 'symbol-only' });
    assert.notEqual(rows.find((r) => r.context === 'favicon-16').status, 'deferred');
  });

  test('a gradient fails the contexts that refuse gradients', () => {
    const src = svg('<defs><linearGradient id="g"><stop stop-color="#639"/></linearGradient></defs><rect x="5" y="5" width="90" height="90" fill="url(#g)"/>');
    const rows = A.auditContexts(src, { architecture: 'symbol-only' });
    for (const id of ['favicon-16', 'patch-1.5in', 'single-colour', 'apparel-embroidery', 'foil-stamp']) {
      const row = rows.find((r) => r.context === id);
      assert.equal(row.status, 'fail', `${id} should refuse a gradient`);
      assert.ok(row.reasons.some((x) => /gradient/.test(x)));
    }
  });

  test('too many inks fails the one-colour and foil contexts', () => {
    const src = svg('<rect x="5" y="5" width="40" height="40" fill="#111"/><rect x="50" y="5" width="40" height="40" fill="#222"/>');
    const rows = A.auditContexts(src, { architecture: 'symbol-only' });
    assert.equal(rows.find((r) => r.context === 'single-colour').status, 'fail');
    assert.equal(rows.find((r) => r.context === 'foil-stamp').status, 'fail');
  });

  test('a thin stroke fails the small digital contexts', () => {
    const src = svg('<circle cx="50" cy="50" r="40" stroke="#000" stroke-width="0.5" fill="none"/>');
    const rows = A.auditContexts(src, { architecture: 'symbol-only' });
    assert.equal(rows.find((r) => r.context === 'favicon-16').status, 'fail');
  });

  test('rendered measurements close the filled-hairline blind spot', () => {
    // A hairline drawn as a filled rectangle has NO stroke width, so the
    // geometry pass sees nothing wrong. Only the render catches it.
    const src = svg('<rect x="5" y="49.7" width="90" height="0.6" fill="#000"/>');
    const without = A.auditContexts(src, { architecture: 'symbol-only' });
    assert.equal(without.find((r) => r.context === 'favicon-16').status, 'pass', 'geometry alone cannot see this');

    const metrics = { 16: { minFeature: 1, coverage: 0.05, regions: 1 }, 256: { minFeature: 2, coverage: 0.05, regions: 1 } };
    const withRender = A.auditContexts(src, { architecture: 'symbol-only', metrics });
    assert.equal(withRender.find((r) => r.context === 'favicon-16').status, 'fail');
  });

  test('every row names the context and says whether it is mechanical', () => {
    for (const row of A.auditContexts(CLEAN, { architecture: 'lockup' })) {
      assert.ok(row.name);
      assert.ok(['pass', 'fail', 'deferred'].includes(row.status));
      assert.ok(row.mechanical !== undefined);
    }
  });

  test('an unknown architecture judges every context rather than deferring any', () => {
    const rows = A.auditContexts(CLEAN, { architecture: 'nonsense' });
    assert.ok(rows.every((r) => r.status !== 'deferred'));
  });
});

describe('render metrics turned into findings', () => {
  const at = (o) => ({ 16: o.small, 32: o.small, 64: o.small, 256: o.big });

  test('geometry with ink and a blank render is called what it is', () => {
    const f = A.auditRenderMetrics(at({ big: { coverage: 0, regions: 0, minFeature: 0 }, small: { coverage: 0, regions: 0, minFeature: 0 } }));
    assert.deepEqual(f.map((x) => x.id), ['renders-empty']);
    assert.match(f[0].fix, /well-formed XML/);
  });

  test('an almost empty render is an error', () => {
    const f = A.auditRenderMetrics(at({ big: { coverage: 0.005, regions: 1, minFeature: 1 }, small: { coverage: 0.001, regions: 1, minFeature: 1 } }));
    assert.ok(f.some((x) => x.id === 'too-light'));
  });

  test('a solid block is a warning about the silhouette', () => {
    const f = A.auditRenderMetrics(at({ big: { coverage: 0.98, regions: 1, minFeature: 200 }, small: { coverage: 0.98, regions: 1, minFeature: 12 } }));
    assert.ok(f.some((x) => x.id === 'too-heavy'));
  });

  test('counters closing at 16px is an error for a mark that must carry there', () => {
    const m = at({ big: { coverage: 0.3, regions: 4, minFeature: 20 }, small: { coverage: 0.3, regions: 1, minFeature: 4 } });
    const f = A.auditRenderMetrics(m, { architecture: 'symbol-only' });
    const found = f.find((x) => x.id === 'regions-collapse');
    assert.equal(found.severity, 'error');
    assert.match(found.fix, /Open them/);
  });

  test('the same collapse is only a note for a lockup, which never carries at 16px', () => {
    const m = at({ big: { coverage: 0.3, regions: 4, minFeature: 20 }, small: { coverage: 0.3, regions: 1, minFeature: 4 } });
    const found = A.auditRenderMetrics(m, { architecture: 'lockup' }).find((x) => x.id === 'regions-collapse');
    assert.equal(found.severity, 'note');
    assert.match(found.fix, /Expected for this architecture/);
  });

  test('a sub two pixel feature at favicon size is reported', () => {
    const m = at({ big: { coverage: 0.2, regions: 2, minFeature: 30 }, small: { coverage: 0.1, regions: 2, minFeature: 1 } });
    assert.ok(A.auditRenderMetrics(m, { architecture: 'symbol-only' }).some((x) => x.id === 'thin-at-16'));
  });

  test('too many shapes at 16px is a warning', () => {
    const m = at({ big: { coverage: 0.3, regions: 9, minFeature: 20 }, small: { coverage: 0.3, regions: 9, minFeature: 3 } });
    assert.ok(A.auditRenderMetrics(m, { architecture: 'symbol-only' }).some((x) => x.id === 'busy-at-16'));
  });

  test('no metrics produces no findings rather than a throw', () => {
    assert.deepEqual(A.auditRenderMetrics(null), []);
    assert.deepEqual(A.auditRenderMetrics({}), []);
  });
});

describe('the sprite sheet', () => {
  test('cells never overlap', () => {
    const { cells } = A.spriteLayout(6);
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        const a = cells[i];
        const b = cells[j];
        const apart = a.x + a.px <= b.x || b.x + b.px <= a.x || a.y + a.px <= b.y || b.y + b.px <= a.y;
        assert.ok(apart, `cells ${i} and ${j} overlap`);
      }
    }
  });

  test('every cell fits inside the sheet', () => {
    const { cells, width, height } = A.spriteLayout(4);
    for (const c of cells) {
      assert.ok(c.x + c.px <= width, `cell runs past the right edge`);
      assert.ok(c.y + c.px <= height, `cell runs past the bottom edge`);
    }
  });

  test('there is one cell per candidate per size', () => {
    const { cells } = A.spriteLayout(5);
    assert.equal(cells.length, 5 * A.AUDIT_SIZES.length);
  });

  test('a sheet for nothing has no cells', () => {
    assert.equal(A.spriteLayout(0).cells.length, 0);
  });
});

describe('tightening', () => {
  test('the viewBox becomes the artwork', () => {
    const t = A.tighten(svg('<rect x="30" y="40" width="20" height="10" fill="#000"/>'));
    const vb = viewBox(t);
    assert.deepEqual([vb.x, vb.y, vb.width, vb.height], [30, 40, 20, 10]);
  });

  test('the drawing itself is unchanged', () => {
    const t = A.tighten(svg('<rect x="30" y="40" width="20" height="10" fill="#0F0"/>'));
    assert.match(t, /fill="#0F0"/);
    assert.deepEqual(inkBounds(t), { x: 30, y: 40, width: 20, height: 10 });
  });

  test('padding is a fraction of the larger side', () => {
    const t = A.tighten(svg('<rect x="0" y="0" width="100" height="50" fill="#000"/>'), { padding: 0.1 });
    const vb = viewBox(t);
    assert.equal(vb.x, -10);
    assert.equal(vb.width, 120);
  });

  test('a file with no ink is handed back untouched rather than given a broken box', () => {
    const src = svg('<g></g>');
    assert.equal(A.tighten(src), src);
  });

  test('the result still declares a namespace', () => {
    assert.match(A.tighten(CLEAN), /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  });
});

describe('near duplicates', () => {
  // The function compared perceptual hashes until a real twelve-concept round
  // showed why that does not work: dHash records horizontal gradient, a black
  // shape on white has almost none, and five unrelated pairs landed inside the
  // threshold. It now compares the downsampled silhouettes directly.
  const grid = (fn) => {
    const g = new Uint8Array(16 * 16);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) g[y * 16 + x] = fn(x, y);
    return g;
  };
  const withSil = (sil) => ({ 64: { silhouette: sil } });
  const blank = grid(() => 255);
  const solid = grid(() => 0);
  const leftHalf = grid((x) => (x < 8 ? 0 : 255));
  const topHalf = grid((x, y) => (y < 8 ? 0 : 255));

  test('a silhouette is box sampled, not nearest neighbour', () => {
    // A high contrast mark aliases badly under nearest neighbour, and the
    // aliasing is then what gets compared.
    const src = new Uint8Array(32 * 32);
    for (let i = 0; i < src.length; i++) src[i] = i % 2 ? 0 : 255;
    const out = A.silhouette(src, 32, 32, { grid: 16 });
    assert.equal(out.length, 256);
    assert.ok(out.every((v) => v > 60 && v < 200), 'a fine checker should average to mid grey, not snap to black or white');
  });

  test('a silhouette of the requested grid comes back at that size', () => {
    assert.equal(A.silhouette(new Uint8Array(64 * 64), 64, 64, { grid: 8 }).length, 64);
  });

  test('identical silhouettes are zero apart', () => {
    assert.equal(A.silhouetteDistance(leftHalf, leftHalf), 0);
  });

  test('opposite silhouettes are as far apart as it gets', () => {
    assert.equal(A.silhouetteDistance(blank, solid), 1);
  });

  test('a missing or mismatched silhouette is maximally distant rather than a throw', () => {
    assert.equal(A.silhouetteDistance(null, leftHalf), 1);
    assert.equal(A.silhouetteDistance(leftHalf, new Uint8Array(4)), 1);
  });

  test('two copies of one mark are found', () => {
    const pairs = A.findNearDuplicates([withSil(leftHalf), withSil(leftHalf)], { ids: ['A', 'B'] });
    assert.deepEqual(pairs, [{ a: 'A', b: 'B', distance: 0, kind: 'converged' }]);
  });

  test('two refinements of one parent are held to a much tighter bar', () => {
    // Marks that share a parent are SUPPOSED to look alike, so the only thing
    // worth reporting between them is that nothing changed at all.
    const nudged = grid((x, y) => (x < 8 ? (y < 2 ? 255 : 0) : 255));
    const groups = ['B2', 'B2'];
    assert.deepEqual(A.findNearDuplicates([withSil(leftHalf), withSil(nudged)], { ids: ['a', 'b'], groups }), []);
    const same = A.findNearDuplicates([withSil(leftHalf), withSil(leftHalf)], { ids: ['a', 'b'], groups });
    assert.equal(same.length, 1);
    assert.equal(same[0].kind, 'unchanged');
  });

  test('marks with different parents are still compared normally', () => {
    const nudged = grid((x, y) => (x < 8 ? (y < 2 ? 255 : 0) : 255));
    const pairs = A.findNearDuplicates([withSil(leftHalf), withSil(nudged)], { ids: ['a', 'b'], groups: ['B2', 'C1'] });
    assert.equal(pairs.length, 1);
    assert.equal(pairs[0].kind, 'converged');
  });

  test('two genuinely different marks are not', () => {
    assert.deepEqual(A.findNearDuplicates([withSil(leftHalf), withSil(topHalf)], { ids: ['A', 'B'] }), []);
  });

  test('pairs come back closest first', () => {
    const nudged = grid((x, y) => (x < 8 ? (y === 0 ? 255 : 0) : 255));
    const pairs = A.findNearDuplicates(
      [withSil(leftHalf), withSil(nudged), withSil(leftHalf)],
      { ids: ['A', 'B', 'C'], threshold: 1 }
    );
    assert.equal(pairs[0].distance, 0);
    assert.ok(pairs.every((p, i) => i === 0 || p.distance >= pairs[i - 1].distance));
  });

  test('a missing silhouette is skipped rather than treated as blank', () => {
    assert.deepEqual(A.findNearDuplicates([{ 64: {} }, withSil(leftHalf)], { ids: ['A', 'B'] }), []);
  });

  test('the threshold sits well below the closest real pair measured', () => {
    // Measured over a real twelve-concept round: identical marks scored 0 and
    // the closest pair of genuinely different marks scored 0.2238.
    assert.ok(A.DERIVED.nearDuplicate < 0.2238 / 2, `${A.DERIVED.nearDuplicate} leaves too little headroom`);
  });
});

describe('verdicts', () => {
  test('any error rejects', () => {
    assert.equal(A.verdictOf([{ severity: 'error' }], []), 'rejected');
  });

  test('more failed contexts than the budget is not a primary mark', () => {
    const rows = Array.from({ length: 3 }, () => ({ status: 'fail' }));
    assert.equal(A.verdictOf([], rows), 'not-a-primary');
  });

  test('the budget itself is survivable', () => {
    const rows = Array.from({ length: 2 }, () => ({ status: 'fail' }));
    assert.equal(A.verdictOf([], rows), 'contender-with-notes');
  });

  test('deferred contexts do not count against the budget', () => {
    const rows = Array.from({ length: 6 }, () => ({ status: 'deferred' }));
    assert.equal(A.verdictOf([], rows), 'contender');
  });

  test('a clean sheet is a contender', () => {
    assert.equal(A.verdictOf([], [{ status: 'pass' }]), 'contender');
  });

  test('a note alone does not demote a contender', () => {
    assert.equal(A.verdictOf([{ severity: 'note' }], [{ status: 'pass' }]), 'contender');
  });
});

describe('the whole pass, against a real browser', { concurrency: 1 }, () => {
  test('a clean mark renders and is measured', needsChrome, async () => {
    const batch = await A.renderBatch([CLEAN]);
    assert.equal(batch.available, true);
    const m = batch.results[0][256];
    assert.ok(m.coverage > 0.1 && m.coverage < 0.9, `coverage was ${m.coverage}`);
    assert.equal(m.regions, 2, 'a bar and a disc are two shapes');
    assert.ok(m.minFeature > 10);
  });

  test('nine discs read as nine shapes at 256 and fail the favicon', needsChrome, async () => {
    const busy = svg(Array.from({ length: 9 }, (_, i) =>
      `<circle cx="${12 + (i % 3) * 38}" cy="${12 + Math.floor(i / 3) * 38}" r="9" fill="#000"/>`).join(''));
    const res = await A.auditCandidates([{ id: 'busy', svg: busy, architecture: 'symbol-only' }]);
    const c = res.candidates[0];
    assert.equal(c.metrics['256'].regions, 9);
    assert.ok(c.contexts.find((r) => r.context === 'favicon-16').status === 'fail');
  });

  test('a malformed file is reported as unrenderable, not as a thin mark', needsChrome, async () => {
    const broken = svg('<circle cx=50 cy=50 r=30 fill="#000"/>');
    const res = await A.auditCandidates([{ id: 'broken', svg: broken, architecture: 'symbol-only' }]);
    const found = ids(res.candidates[0].findings);
    assert.ok(found.includes('unquoted-attribute'));
    assert.ok(found.includes('renders-empty'));
    assert.ok(!found.includes('too-light'), 'reporting this as a thin mark sends somebody the wrong way');
  });

  test('two copies of one mark are found as duplicates, and two different marks are not', needsChrome, async () => {
    const other = svg('<path d="M50 8 L92 84 L8 84 Z" fill="#000"/>');
    const res = await A.auditCandidates([
      { id: 'A', svg: CLEAN, architecture: 'symbol-only' },
      { id: 'B', svg: CLEAN, architecture: 'symbol-only' },
      { id: 'C', svg: other, architecture: 'symbol-only' },
    ]);
    assert.equal(res.duplicates.length, 1);
    assert.deepEqual([res.duplicates[0].a, res.duplicates[0].b], ['A', 'B']);
    assert.equal(res.duplicates[0].distance, 0);
  });

  test('rejected candidates are not compared for duplication', needsChrome, async () => {
    // Two near-empty renders hash almost identically and would otherwise pair
    // with each other and with everything else, filling the report with noise
    // about marks that are already out.
    const hairA = svg('<path d="M5 50 H95" stroke="#000" stroke-width="0.3" fill="none"/>');
    const hairB = svg('<path d="M50 5 V95" stroke="#000" stroke-width="0.3" fill="none"/>');
    const res = await A.auditCandidates([
      { id: 'A', svg: hairA, architecture: 'symbol-only' },
      { id: 'B', svg: hairB, architecture: 'symbol-only' },
      { id: 'C', svg: CLEAN, architecture: 'symbol-only' },
    ]);
    assert.equal(res.candidates[0].verdict, 'rejected');
    assert.deepEqual(res.duplicates, []);
  });

  test('the one colour test catches areas separated only by hue', needsChrome, async () => {
    // Two touching squares in different colours. In black they become one.
    const src = svg('<rect x="10" y="10" width="40" height="80" fill="#1F6F4A"/><rect x="50" y="10" width="40" height="80" fill="#C7452E"/>');
    const res = await A.auditOneColour(src);
    assert.equal(res.available, true);
    assert.equal(res.colourRegions, 2);
    assert.equal(res.blackRegions, 1);
    assert.ok(res.findings.some((f) => f.id === 'colour-carries'));
  });

  test('a mark whose shapes are separated by a gap survives the one colour test', needsChrome, async () => {
    const src = svg('<rect x="10" y="10" width="35" height="80" fill="#1F6F4A"/><rect x="55" y="10" width="35" height="80" fill="#C7452E"/>');
    const res = await A.auditOneColour(src);
    assert.equal(res.blackRegions, 2);
    assert.deepEqual(res.findings, []);
  });

  test('metrics survive a round trip through JSON', needsChrome, async () => {
    const res = await A.auditCandidates([{ id: 'A', svg: CLEAN, architecture: 'symbol-only' }]);
    const round = JSON.parse(JSON.stringify(res.candidates[0]));
    assert.equal(round.metrics['256'].regions, 2);
    assert.equal(typeof round.metrics['256'].hash, 'string');
  });
});

describe('without a browser', () => {
  test('a batch reports that it could not render rather than pretending', async () => {
    const batch = await A.renderBatch([CLEAN], { chrome: null });
    assert.equal(batch.available, false);
    assert.deepEqual(batch.results, [null]);
  });

  test('candidates are still audited structurally, but the verdict admits nothing was rendered', async () => {
    const res = await A.auditCandidates([{ id: 'A', svg: CLEAN, architecture: 'lockup' }], { chrome: null });
    assert.equal(res.rendered, false);
    assert.equal(res.candidates[0].metrics, null);
    assert.equal(res.candidates[0].verdict, 'unverified', 'a clean geometry pass is not a pass');
    assert.ok(res.candidates[0].contexts.length > 0, 'the geometric pass still runs');
  });

  test('a structural error still rejects with no browser', async () => {
    const res = await A.auditCandidates([{ id: 'A', svg: svg('<rect width="90" height="90" fill="url(#g)"/>'), architecture: 'lockup' }], { chrome: null });
    assert.equal(res.candidates[0].verdict, 'rejected');
  });
});


describe('findings from the adversarial review', () => {
  const svg = (inner, attrs = 'viewBox="0 0 100 100"') =>
    `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${inner}</svg>`;
  const CHROME2 = findChrome();
  const needs = { skip: CHROME2 ? false : 'no headless browser on this machine' };

  test('a file over the ceiling stops there rather than being fully parsed anyway', () => {
    // The ceiling used to be cosmetic: the file was reported as too big and
    // then parsed regardless, so a 56MB traced raster exhausted the heap inside
    // the check that existed to prevent exactly that, and in a batch it took the
    // whole round's audit with it.
    const huge = svg('<rect width="1" height="1" fill="#000"/>'.repeat(180000), 'viewBox="0 0 10 10"');
    const t = Date.now();
    const found = A.auditStructure(huge);
    assert.deepEqual(found.map((f) => f.id), ['too-big'], 'nothing else should have been measured');
    assert.ok(Date.now() - t < 400, `took ${Date.now() - t}ms, which means it parsed the file anyway`);
    assert.match(found[0].fix, /Nothing further was measured/);
  });

  test('an unrendered candidate is unverified, never a pass', () => {
    // Without a browser the geometry pass runs alone, and it only sees DECLARED
    // stroke widths: a hairline drawn as a thin filled rectangle is invisible to
    // it. Calling that "clears every test" told somebody on a machine with no
    // Chrome that a mark which vanishes at 16px was fine.
    assert.equal(A.verdictOf([], [{ status: 'pass' }], { rendered: false }), 'unverified');
    assert.equal(A.verdictOf([], [{ status: 'pass' }], { rendered: true }), 'contender');
    assert.equal(A.verdictOf([], [{ status: 'pass' }]), 'contender', 'rendered defaults to true');
  });

  test('an error still rejects even when nothing was rendered', () => {
    assert.equal(A.verdictOf([{ severity: 'error' }], [], { rendered: false }), 'rejected');
  });

  test('a hairline drawn as a filled shape is unverified without a browser, not a contender', async () => {
    const hairline = svg('<rect x="0" y="49.8" width="100" height="0.4" fill="#000"/>');
    const res = await A.auditCandidates([{ id: 'H1', svg: hairline, architecture: 'symbol-only' }], { chrome: null });
    assert.equal(res.candidates[0].verdict, 'unverified');
  });

  test('a single-ink mark with curves does not trip the colour test', needs, async () => {
    // Wiring the dead check in was not enough: the check itself was broken.
    // Every curved edge is antialiased into a ramp of intermediate colours, and
    // counting each shade as its own area found 1,103 regions in a single-ink
    // ring, so it fired on almost every mark it was meant to clear.
    const curved = [
      svg('<g fill="#111111"><path d="M50 12 C74 12 88 30 88 50 C88 74 70 88 50 88 C30 88 12 74 12 50 C12 30 26 12 50 12 Z M50 34 C40 34 34 42 34 50 C34 60 40 66 50 66 C60 66 66 60 66 50 C66 42 60 34 50 34 Z"/></g>'),
      svg('<g fill="#111111"><path d="M50 10 L90 82 H10 Z M50 40 L70 74 H30 Z"/></g>'),
      svg('<g fill="#111111"><circle cx="20" cy="50" r="16"/><circle cx="55" cy="50" r="16"/><circle cx="88" cy="50" r="9"/></g>'),
    ].map((s2, i) => ({ id: `C${i}`, svg: s2, architecture: 'symbol-only' }));
    const res = await A.auditCandidates(curved);
    for (const c of res.candidates) {
      assert.ok(!c.findings.some((f) => f.id === 'colour-carries'), `${c.id} falsely reported colour doing structural work`);
    }
  });

  test('the single-colour test actually fires in the pipeline', needs, async () => {
    // It was written, tested, documented in three places, and never wired in:
    // `auditOneColour` had no caller outside its own test. That is the same
    // failure it was written to catch, a check that passes because of how it was
    // built rather than because of what it measures.
    const touching = svg('<rect x="10" y="10" width="40" height="80" fill="#1F6F4A"/><rect x="50" y="10" width="40" height="80" fill="#C7452E"/>');
    const res = await A.auditCandidates([{ id: 'T', svg: touching, architecture: 'symbol-only' }]);
    const found = res.candidates[0].findings.find((f) => f.id === 'colour-carries');
    assert.ok(found, 'colour-carries must be reachable from auditCandidates');
    assert.equal(found.severity, 'error');
    assert.match(found.message, /2 shapes in colour and 1 in black/);
  });

  test('a mark whose shapes are separated by a gap does not trip it', needs, async () => {
    const apart = svg('<rect x="10" y="10" width="35" height="80" fill="#1F6F4A"/><rect x="55" y="10" width="35" height="80" fill="#C7452E"/>');
    const res = await A.auditCandidates([{ id: 'G', svg: apart, architecture: 'symbol-only' }]);
    assert.ok(!res.candidates[0].findings.some((f) => f.id === 'colour-carries'));
  });

  test('auditOneColour and the pipeline reach the same verdict, because they share the rule', needs, async () => {
    const touching = svg('<rect x="10" y="10" width="40" height="80" fill="#1F6F4A"/><rect x="50" y="10" width="40" height="80" fill="#C7452E"/>');
    const standalone = await A.auditOneColour(touching);
    const pipeline = await A.auditCandidates([{ id: 'T', svg: touching, architecture: 'symbol-only' }]);
    assert.equal(
      standalone.findings.some((f) => f.id === 'colour-carries'),
      pipeline.candidates[0].findings.some((f) => f.id === 'colour-carries'),
    );
  });
});


describe('the reference documents exactly what the code produces', () => {
  // Documentation drift here is not cosmetic: the reference is what Claude reads
  // before drawing, and a finding it does not know about is a finding nobody
  // designs against. The last review found three separate drifts in this file,
  // so it is checked rather than remembered.
  const read = async (f) => (await import('node:fs/promises')).readFile(new URL(f, import.meta.url), 'utf8');

  test('every finding the audit can produce is in the reference table', async () => {
    const code = await read('../scripts/logoaudit.mjs');
    const doc = await read('../skills/brand-system/references/11-logo-craft.md');
    const produced = [...new Set([...code.matchAll(/finding\(\s*[^,]+,\s*'([\w-]+)'/g)].map((m) => m[1]))];
    const documented = new Set([...doc.matchAll(/^\| `([a-z][\w-]+)` \| (?:error|warn|note|any)/gm)].map((m) => m[1]));
    const missing = produced.filter((id) => !documented.has(id));
    assert.deepEqual(missing, [], `these findings exist in code and not in the reference: ${missing.join(', ')}`);
    assert.ok(produced.length > 20, `only found ${produced.length} findings, so the regex has probably stopped matching`);
  });

  test('the reference does not document a finding the audit cannot produce', async () => {
    const code = await read('../scripts/logoaudit.mjs');
    const spec = await read('../scripts/logospec.mjs');
    const doc = await read('../skills/brand-system/references/11-logo-craft.md');
    const produced = new Set([...code.matchAll(/finding\(\s*[^,]+,\s*'([\w-]+)'/g)].map((m) => m[1]));
    const contexts = new Set([...spec.matchAll(/^\s*id: '([\w.-]+)',$/gm)].map((m) => m[1]));
    const documented = [...doc.matchAll(/^\| `([a-z][\w-]+)` \| (?:error|warn|note|any)/gm)].map((m) => m[1]);
    const ghosts = documented.filter((id) => !produced.has(id) && !contexts.has(id));
    assert.deepEqual(ghosts, [], `the reference documents findings nothing can produce: ${ghosts.join(', ')}`);
  });

  test('every threshold the reference names matches the constant behind it', async () => {
    const doc = await read('../skills/brand-system/references/11-logo-craft.md');
    // Each of these drifted at least once during the build.
    assert.match(doc, new RegExp(`${Math.round(A.DERIVED.maxCoverage * 100)} per cent coverage`), 'too-heavy threshold');
    assert.match(doc, new RegExp(String(A.DERIVED.maxSegments)), 'node-count threshold');
    assert.match(doc, new RegExp(String(A.DERIVED.nearDuplicate).replace('.', '\\.')), 'near-duplicate threshold');
    assert.match(doc, new RegExp(String(A.DERIVED.identical).replace('.', '\\.')), 'identical threshold');
    // The reference is allowed, and encouraged, to SAY that a perceptual hash
    // was tried and abandoned. What it must not do is state the current method
    // in the units of the abandoned one, which is the drift the review found:
    // "two 64-bit perceptual hashes within 12 bits".
    assert.ok(!/within \d+ bits/i.test(doc), 'the reference states the near-duplicate threshold in bits, which is the method the code abandoned');
  });
});
