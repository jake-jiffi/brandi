/**
 * Putting the brand on a real photograph.
 *
 * The maths is exact and is tested as such: four corners define a projective
 * transform uniquely, so the transform must land ON the corners to floating
 * point. The rest of the file exists because the first attempt at this placed
 * artwork on estimated percentages and it landed on grass.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  homography, project, toMatrix3d, validateCorners, gridPage, mockupBody,
} from '../scripts/mockup.mjs';

const QUAD = [[120, 90], [660, 150], [610, 470], [170, 400]];

describe('the transform', () => {
  test('lands exactly on the corners it was given', () => {
    const h = homography(QUAD);
    const src = [[0, 0], [1, 0], [1, 1], [0, 1]];
    for (let i = 0; i < 4; i++) {
      const [x, y] = project(h, src[i]);
      assert.ok(Math.hypot(x - QUAD[i][0], y - QUAD[i][1]) < 1e-9,
        `corner ${i} landed at ${x},${y} instead of ${QUAD[i]}`);
    }
  });

  test('a horizontal top edge solves, which is where naive elimination divides by zero', () => {
    // Most shopfronts. Partial pivoting is what makes this work.
    const h = homography([[0, 0], [100, 0], [100, 50], [0, 50]]);
    assert.ok(h);
    assert.deepEqual(project(h, [1, 1]).map(Math.round), [100, 50]);
  });

  test('the unit square onto itself is the identity', () => {
    assert.equal(toMatrix3d(homography([[0, 0], [1, 0], [1, 1], [0, 1]])),
      'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)');
  });

  test('a genuine perspective has non-zero terms in the fourth column', () => {
    // If these were dropped the transform would be affine, which cannot express
    // a panel photographed from an angle: the far edge would not foreshorten.
    // Parse the ARGUMENTS, not the whole string: `/[\d.]+/` on the raw text
    // captures the "3" out of "matrix3d" and shifts every index by one.
    const m = /matrix3d\(([^)]*)\)/.exec(toMatrix3d(homography(QUAD)))[1].split(',').map(Number);
    assert.equal(m.length, 16);
    assert.notEqual(m[3], 0, 'the g term');
    assert.notEqual(m[7], 0, 'the h term');
  });

  test('the midpoint moves, because a projective transform is not a scale', () => {
    const h = homography(QUAD);
    const [mx, my] = project(h, [0.5, 0.5]);
    const naive = [
      (QUAD[0][0] + QUAD[1][0] + QUAD[2][0] + QUAD[3][0]) / 4,
      (QUAD[0][1] + QUAD[1][1] + QUAD[2][1] + QUAD[3][1]) / 4,
    ];
    assert.ok(Math.hypot(mx - naive[0], my - naive[1]) > 0.5,
      'the centre of a projected square is not the average of its corners');
  });
});

describe('corners that cannot be trusted are refused', () => {
  const cases = [
    ['three points', [[0, 0], [1, 0], [1, 1]]],
    ['one point four times', [[5, 5], [5, 5], [5, 5], [5, 5]]],
    ['collinear', [[0, 0], [10, 10], [20, 20], [30, 30]]],
    ['not numbers', [[0, 0], [1, 0], [1, 'x'], [0, 1]]],
    ['NaN', [[0, 0], [1, 0], [NaN, 1], [0, 1]]],
    ['not an array', null],
  ];
  for (const [label, q] of cases) {
    test(`${label} is refused`, () => {
      const r = validateCorners(q);
      assert.equal(r.ok, false);
      assert.ok(r.reason.length > 20, 'and it says why');
    });
  }

  test('a bow tie is refused by name, because it is a real thing to type', () => {
    const r = validateCorners([[0, 0], [100, 0], [0, 100], [100, 100]]);
    assert.equal(r.ok, false);
    assert.match(r.reason, /cross over/);
    assert.match(r.reason, /clockwise from the top left/, 'and it says what the right order is');
  });

  test('a legitimate quad passes and carries its matrix', () => {
    const r = validateCorners(QUAD);
    assert.equal(r.ok, true);
    assert.match(r.matrix3d, /^matrix3d\(/);
  });
});

describe('the grid, which is how corners get read rather than guessed', () => {
  test('it frames the photograph exactly as the mockup will', () => {
    // A corner read on one and used on the other has to mean the same thing.
    const g = gridPage({ photo: 'van.jpg', width: 4000, height: 3000, frameWidth: 1400 });
    const m = mockupBody({ photo: 'van.jpg', width: 4000, height: 3000, frameWidth: 1400, surfaces: [] });
    assert.match(g, /width:1400px;height:1050px/);
    assert.match(m, /width:1400px;height:1050px/);
  });

  test('rotation swaps the frame, so corners are read from the picture as composited', () => {
    const g = gridPage({ photo: 'a.jpg', width: 4000, height: 3000, rotate: 90, frameWidth: 1400 });
    assert.match(g, /width:1400px;height:1867px/);
  });

  test('it says what to do with it', () => {
    const g = gridPage({ photo: 'a.jpg', width: 100, height: 100 });
    assert.match(g, /FOUR CORNERS/);
    assert.match(g, /clockwise from its top left/);
  });
});

describe('the composited body', () => {
  const surface = { name: 'panel', corners: [[30, 40], [60, 35], [61, 55], [30, 58]], aspect: 0.4, artwork: '<i>art</i>' };

  test('artwork is shrunk to the unit square BEFORE the homography maps it', () => {
    // CSS applies transforms right to left. Written the other way round it
    // scaled a 1000px box and then projected it, which put one corner of the
    // artwork across the whole frame.
    const html = mockupBody({ photo: 'p.jpg', width: 1000, height: 750, surfaces: [surface] });
    const m = /transform:(matrix3d\([^)]*\)) (scale\([^)]*\))/.exec(html);
    assert.ok(m, 'both transforms present, in this order');
    assert.match(m[2], /scale\(0\.001/, 'the scale to unit width comes last, so it applies first');
  });

  test('corners are percentages of the frame, not pixels of the source', () => {
    // Both above the frame cap, so both frame to the same size. That is the
    // property: swapping in a higher-resolution copy must not move the artwork.
    const small = mockupBody({ photo: 'p.jpg', width: 2000, height: 1500, surfaces: [surface] });
    const large = mockupBody({ photo: 'p.jpg', width: 4000, height: 3000, surfaces: [surface] });
    // Same framed size after the cap, so the same matrix: the placement does not
    // move when somebody swaps in a higher-resolution copy of the photograph.
    const mx = (h) => /matrix3d\([^)]*\)/.exec(h)[0];
    assert.equal(mx(small), mx(large));
  });

  test('a wrap multiplies by default, so it takes the surface shading', () => {
    const html = mockupBody({ photo: 'p.jpg', width: 100, height: 100, surfaces: [surface] });
    assert.match(html, /mix-blend-mode:multiply/);
    const sticker = mockupBody({ photo: 'p.jpg', width: 100, height: 100, surfaces: [{ ...surface, blend: 'normal' }] });
    assert.match(sticker, /mix-blend-mode:normal/);
  });

  test('a bad surface renders its reason instead of drawing something plausible', () => {
    const html = mockupBody({ photo: 'p.jpg', width: 100, height: 100, surfaces: [{ ...surface, corners: [[0, 0], [1, 1]] }] });
    assert.match(html, /Not four usable corners/);
    assert.equal(/matrix3d/.test(html), false, 'nothing is drawn from corners that were refused');
  });

  test('no photograph shows a holding pattern, not a broken image', () => {
    const html = mockupBody({ photo: '', width: 100, height: 100, surfaces: [] });
    assert.equal(/<img/.test(html), false);
    assert.match(html, /repeating-linear-gradient/);
  });

  test('the photograph is contained rather than forced, so a disagreement is visible', () => {
    // A header reader and a browser can disagree about orientation. Explicit
    // dimensions would distort silently; containing it letterboxes visibly.
    const html = mockupBody({ photo: 'p.jpg', width: 4000, height: 3000, surfaces: [] });
    assert.match(html, /object-fit:contain/);
  });
});
