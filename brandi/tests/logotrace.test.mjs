/**
 * Tracing a picked reference into a clean vector mark.
 *
 * Every reference here is drawn in the test, anti-aliased by supersampling, so
 * the expected answer is known exactly and nothing depends on a client's files.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { encodePng } from '../scripts/png.mjs';
import * as T from '../scripts/logotrace.mjs';

/** A grey PNG of whatever `inside` says is ink, anti-aliased by 4x4 supersampling. */
function draw(w, h, inside, { ink = 0, paper = 255 } = {}) {
  const data = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let c = 0;
      for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) if (inside(x + (sx + 0.5) / 4, y + (sy + 0.5) / 4)) c++;
      data[y * w + x] = Math.round(paper + (ink - paper) * (c / 16));
    }
  }
  return encodePng({ width: w, height: h, channels: 1, data });
}

/** Distance from a point to a segment: a stroke with round caps is everything within r of it. */
function nearSegment(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

const square = draw(200, 200, (x, y) => x > 40 && x < 160 && y > 40 && y < 160);
const circle = draw(200, 200, (x, y) => (x - 100) ** 2 + (y - 100) ** 2 < 70 ** 2);
const ring = draw(200, 200, (x, y) => { const r = (x - 100) ** 2 + (y - 100) ** 2; return r < 70 ** 2 && r > 40 ** 2; });

describe('traceImage', () => {
  test('a square comes back as four straight lines, exactly', () => {
    const r = T.traceImage(square);
    assert.equal(r.curves, 0);
    assert.equal(r.lines, 4);
    assert.ok(r.overlap > 0.995, `overlap ${r.overlap}`);
    assert.match(r.svg, /d="M10 10L90 10L90 90L10 90L10 10Z"/);
  });

  test('a tilted rectangle keeps straight edges at an angle', () => {
    const tilted = draw(300, 300, (x, y) => {
      const u = (x - 150) * Math.cos(0.3) + (y - 150) * Math.sin(0.3);
      const v = -(x - 150) * Math.sin(0.3) + (y - 150) * Math.cos(0.3);
      return Math.abs(u) < 80 && Math.abs(v) < 50;
    });
    const r = T.traceImage(tilted);
    assert.ok(r.lines >= 4, `${r.lines} lines`);
    assert.ok(r.overlap > 0.99, `overlap ${r.overlap}`);
  });

  test('a circle is a few curves and no lines', () => {
    const r = T.traceImage(circle);
    assert.equal(r.lines, 0);
    assert.ok(r.curves <= 8, `${r.curves} curves for a circle`);
    assert.ok(r.overlap > 0.99, `overlap ${r.overlap}`);
  });

  test('a counter stays a counter: two outlines, wound in opposite directions', () => {
    const r = T.traceImage(ring);
    assert.equal(r.outlines, 2);
    assert.ok(r.overlap > 0.98, `overlap ${r.overlap}`);
    // Filled with the nonzero rule, the centre is paper. If the hole were
    // wound the same way as the outside, the ring would render as a disc.
    const d = /d="([^"]+)"/.exec(r.svg)[1];
    assert.equal((d.match(/M/g) ?? []).length, 2);
  });

  test('a white mark reversed out of black traces the same as black on white', () => {
    const reversed = draw(200, 200, (x, y) => (x - 100) ** 2 + (y - 100) ** 2 < 70 ** 2, { ink: 255, paper: 0 });
    const a = T.traceImage(circle);
    const b = T.traceImage(reversed);
    assert.equal(b.outlines, 1);
    assert.ok(Math.abs(a.overlap - b.overlap) < 0.005);
  });

  test('a stroked letter with round ends keeps its curves and scores high', () => {
    // A K-like mark: a stem, an arm and a free-standing leg, all round-capped.
    const k = draw(300, 360, (x, y) => nearSegment(x, y, [90, 40], [90, 320]) < 22
      || nearSegment(x, y, [100, 190], [220, 50]) < 18
      || nearSegment(x, y, [140, 220], [230, 320]) < 18);
    const r = T.traceImage(k);
    assert.ok(r.overlap > 0.985, `overlap ${r.overlap}`);
    assert.ok(r.curves + r.lines < 60, `${r.curves + r.lines} segments`);
  });

  test('a small dot is kept: specks are judged against the ink, not the frame', () => {
    // An i set small on a big sketch: the dot is under 0.02% of the frame.
    const i = draw(1024, 1024, (x, y) => (x > 500 && x < 516 && y > 520 && y < 580) || (x - 508) ** 2 + (y - 505) ** 2 < 7 ** 2);
    assert.equal(T.traceImage(i).outlines, 2);
  });

  test('a crop that cuts through the mark says which edge', () => {
    const cut = T.traceImage(circle, { crop: { x: 0, y: 0, w: 120, h: 200 } });
    assert.deepEqual(cut.clipped, ['right']);
    assert.deepEqual(T.traceImage(circle).clipped, []);
  });

  test('the same file and crop always give the same path', () => {
    assert.equal(T.traceImage(ring).svg, T.traceImage(ring).svg);
  });

  test('an empty crop is refused rather than traced as nothing', () => {
    assert.throws(() => T.traceImage(square, { crop: { x: 0, y: 0, w: 20, h: 20 } }), /no ink/);
  });

  test('the overlay is a PNG the size of the crop', () => {
    const r = T.traceImage(square, { crop: { x: 10, y: 10, w: 180, h: 170 } });
    assert.equal(r.overlay.subarray(1, 4).toString(), 'PNG');
    assert.deepEqual(r.size, { width: 180, height: 170 });
  });
});

describe('the pieces', () => {
  test('the edge is drawn halfway between paper and ink, even on a perfectly clean image', () => {
    // Otsu's own threshold on a clean image is the first grey level, which put
    // the outline a pixel or two outside the real edge all the way round.
    const field = new Float32Array(1000);
    for (let i = 0; i < 400; i++) field[i] = 1;
    assert.ok(Math.abs(T.otsu(field) - 0.5) < 0.01);
  });

  test('parseCrop reads pixels, fractions, and refuses anything else', () => {
    assert.deepEqual(T.parseCrop('10,20,30,40', 100, 200), { x: 10, y: 20, w: 30, h: 40 });
    assert.deepEqual(T.parseCrop('0.5,0.25,0.5,0.5', 100, 200), { x: 50, y: 50, w: 50, h: 100 });
    assert.equal(T.parseCrop(null, 10, 10), null);
    assert.throws(() => T.parseCrop('1,2,3', 10, 10), /x,y,w,h/);
    assert.throws(() => T.parseCrop('a,b,c,d', 10, 10), /x,y,w,h/);
  });

  test('a gentle curve is not mistaken for a straight edge', () => {
    // An arc of radius 400 over 120 pixels sags about 4.5 pixels.
    const loop = [];
    for (let i = 0; i <= 120; i++) loop.push([i, 400 - Math.sqrt(400 ** 2 - (i - 60) ** 2)]);
    for (let i = 120; i >= 0; i--) loop.push([i, 60]);
    const runs = T.straightRuns(loop, { tolerance: 1.5, minLength: 40, span: 2 });
    const arcRun = runs.find(([a, b]) => a < 110 && b < 121 && b > a && b - a > 30);
    assert.equal(arcRun, undefined, `the arc was taken for a line: ${JSON.stringify(runs)}`);
  });
});
