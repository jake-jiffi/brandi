import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../scripts/svg.mjs';

const close = (a, b, tol = 1e-6, msg) =>
  assert.ok(Math.abs(a - b) <= tol, msg ?? `expected ${a} within ${tol} of ${b}`);

const closeBox = (got, want, tol = 1e-6) => {
  assert.ok(got, 'expected a box');
  close(got.x, want.x, tol, `x: ${got.x} vs ${want.x}`);
  close(got.y, want.y, tol, `y: ${got.y} vs ${want.y}`);
  close(got.width, want.width, tol, `width: ${got.width} vs ${want.width}`);
  close(got.height, want.height, tol, `height: ${got.height} vs ${want.height}`);
};

const svg = (inner, attrs = 'viewBox="0 0 100 100"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${inner}</svg>`;

describe('xml scanning', () => {
  test('reads nested elements and attributes', () => {
    const doc = S.parseXml('<svg><g id="a"><path d="M0 0"/></g></svg>');
    assert.equal(doc.children[0].tag, 'svg');
    assert.equal(doc.children[0].children[0].attrs.id, 'a');
    assert.equal(doc.children[0].children[0].children[0].tag, 'path');
  });

  test('a > inside a quoted attribute does not end the tag', () => {
    const doc = S.parseXml(`<svg><path d="M0 0" data-note="a > b"/><rect width="5" height="5"/></svg>`);
    const kids = doc.children[0].children;
    assert.equal(kids.length, 2, 'both children should survive');
    assert.equal(kids[0].attrs['data-note'], 'a > b');
  });

  test('handles both quote styles and unquoted values', () => {
    const doc = S.parseXml(`<svg><rect x='1' y=2 width="3" height="4"/></svg>`);
    const a = doc.children[0].children[0].attrs;
    assert.deepEqual([a.x, a.y, a.width, a.height], ['1', '2', '3', '4']);
  });

  test('skips comments, doctypes and processing instructions', () => {
    const doc = S.parseXml('<?xml version="1.0"?><!DOCTYPE svg><!-- <rect/> --><svg><circle r="1"/></svg>');
    assert.equal(doc.children.length, 1);
    assert.equal(doc.children[0].children[0].tag, 'circle');
  });

  test('CDATA content is text, not markup', () => {
    const doc = S.parseXml('<svg><style><![CDATA[ .a { fill: red } ]]></style></svg>');
    const style = doc.children[0].children[0];
    assert.equal(style.tag, 'style');
    assert.match(style.text, /fill: red/);
  });

  test('style and script contents are taken verbatim', () => {
    const doc = S.parseXml('<svg><style>path { fill: url(#g) }</style><path d="M0 0"/></svg>');
    const kids = doc.children[0].children;
    assert.equal(kids[0].tag, 'style');
    assert.equal(kids[1].tag, 'path', 'the path after the style block is still found');
  });

  test('decodes entities in attribute values', () => {
    const doc = S.parseXml(`<svg><text font-family="A &amp; B">x</text></svg>`);
    assert.equal(doc.children[0].children[0].attrs['font-family'], 'A & B');
  });

  test('a stray close tag does not unwind the document', () => {
    const doc = S.parseXml('<svg><g></b><rect width="2" height="2"/></g></svg>');
    const g = doc.children[0].children[0];
    assert.equal(g.tag, 'g');
    assert.equal(g.children[0].tag, 'rect', 'the rect stays inside the g');
  });

  test('self closing and void tags do not swallow siblings', () => {
    const doc = S.parseXml('<svg><path d="M0 0"/><circle r="1"/><rect width="1" height="1"></svg>');
    assert.equal(doc.children[0].children.length, 3);
  });
});

describe('numbers and lengths', () => {
  test('pulls signed, decimal and exponent forms', () => {
    assert.deepEqual(S.numbers('1 -2.5 .5 3e2 -1.5e-1'), [1, -2.5, 0.5, 300, -0.15]);
  });

  test('converts absolute units at 96dpi', () => {
    close(S.length('1in'), 96);
    close(S.length('25.4mm'), 96);
    close(S.length('72pt'), 96);
    close(S.length('10'), 10);
  });

  test('a percentage is unknown, not zero', () => {
    assert.equal(S.length('100%'), null);
  });
});

describe('matrices', () => {
  test('translate then scale composes in the right order', () => {
    const m = S.parseTransform('translate(10 20) scale(2)');
    assert.deepEqual(S.applyToPoint(m, 1, 1), [12, 22]);
  });

  test('rotate about a point leaves that point fixed', () => {
    const m = S.parseTransform('rotate(90 50 50)');
    const [x, y] = S.applyToPoint(m, 50, 50);
    close(x, 50);
    close(y, 50);
    const [px, py] = S.applyToPoint(m, 60, 50);
    close(px, 50);
    close(py, 60);
  });

  test('matrixScale is the geometric mean of the axis scales', () => {
    close(S.matrixScale(S.parseTransform('scale(4 9)')), 6);
    close(S.matrixScale(S.parseTransform('rotate(37)')), 1);
  });

  test('an unparseable transform is the identity, not a throw', () => {
    assert.deepEqual(S.parseTransform('nonsense(1)'), [...S.IDENTITY]);
    assert.deepEqual(S.parseTransform(''), [...S.IDENTITY]);
    assert.deepEqual(S.parseTransform(null), [...S.IDENTITY]);
  });
});

describe('path parsing', () => {
  test('relative commands accumulate', () => {
    const segs = S.parsePath('m10 10 l5 0 l0 5 z');
    assert.deepEqual(segs, [['M', 10, 10], ['L', 15, 10], ['L', 15, 15], ['Z']]);
  });

  test('H and V become lines that keep the other axis', () => {
    assert.deepEqual(S.parsePath('M0 5 H10 V20'), [['M', 0, 5], ['L', 10, 5], ['L', 10, 20]]);
  });

  test('repeated coordinates after M are implicit linetos', () => {
    assert.deepEqual(S.parsePath('M0 0 10 0 10 10'), [['M', 0, 0], ['L', 10, 0], ['L', 10, 10]]);
  });

  test('repeated coordinates after m are relative linetos', () => {
    assert.deepEqual(S.parsePath('m0 0 10 0 0 10'), [['M', 0, 0], ['L', 10, 0], ['L', 10, 10]]);
  });

  test('S reflects the previous cubic control point', () => {
    const segs = S.parsePath('M0 0 C10 0 10 10 20 10 S30 20 40 20');
    assert.deepEqual(segs[2], ['C', 30, 10, 30, 20, 40, 20]);
  });

  test('S with no preceding curve reflects the current point', () => {
    const segs = S.parsePath('M5 5 S10 10 20 20');
    assert.deepEqual(segs[1], ['C', 5, 5, 10, 10, 20, 20]);
  });

  test('T reflects the previous quadratic control point', () => {
    const segs = S.parsePath('M0 0 Q10 10 20 0 T40 0');
    assert.deepEqual(segs[2], ['Q', 30, -10, 40, 0]);
  });

  test('Z returns the pen to the subpath start', () => {
    const segs = S.parsePath('M10 10 L20 20 Z l5 0');
    assert.deepEqual(segs[3], ['L', 15, 10], 'the relative line after Z starts from the subpath start');
  });

  test('exponent and no-separator forms parse', () => {
    assert.deepEqual(S.parsePath('M1e1 1E1L-.5-.5'), [['M', 10, 10], ['L', -0.5, -0.5]]);
  });

  test('a truncated command is dropped rather than producing NaN', () => {
    const segs = S.parsePath('M0 0 L10 10 C1 2 3');
    assert.deepEqual(segs, [['M', 0, 0], ['L', 10, 10]]);
    assert.ok(segs.every((s) => s.slice(1).every(Number.isFinite)));
  });

  test('numbers before any command produce nothing', () => {
    assert.deepEqual(S.parsePath('10 20 30'), []);
  });

  test('empty and null input give an empty path', () => {
    assert.deepEqual(S.parsePath(''), []);
    assert.deepEqual(S.parsePath(null), []);
  });

  test('an unknown command letter terminates instead of looping forever', () => {
    const segs = S.parsePath('M0 0 L5 5 X9 9 L1 1');
    assert.deepEqual(segs, [['M', 0, 0], ['L', 5, 5]]);
  });
});

describe('arcs become cubics', () => {
  test('a half circle arc lands on its endpoint', () => {
    const segs = S.parsePath('M0 0 A50 50 0 0 1 100 0');
    const last = segs[segs.length - 1];
    close(last[5], 100, 1e-9);
    close(last[6], 0, 1e-9);
  });

  // The expected boxes in this block were taken from Chrome's own
  // SVGGraphicsElement.getBBox() on the same path data, not from reasoning about
  // the specification. Every one of them agrees to within 0.004 user units.
  test('a half circle arc has the radius as its depth', () => {
    const box = S.segmentsBBox(S.parsePath('M0 0 A50 50 0 0 1 100 0'));
    closeBox(box, { x: 0, y: -50, width: 100, height: 50 }, 0.02);
  });

  test('the large arc flag picks the other side', () => {
    // The radius has to exceed half the chord for the flag to mean anything.
    const small = S.segmentsBBox(S.parsePath('M0 0 A60 60 0 0 1 100 0'));
    const large = S.segmentsBBox(S.parsePath('M0 0 A60 60 0 1 1 100 0'));
    assert.ok(large.height > small.height, 'the large arc is deeper');
    closeBox(large, { x: -10, y: -93.166, width: 120, height: 93.166 }, 0.02);
    closeBox(small, { x: 0, y: -26.834, width: 100, height: 26.834 }, 0.02);
  });

  test('at exactly the diameter both arc flags give the same semicircle', () => {
    const a = S.segmentsBBox(S.parsePath('M0 0 A50 50 0 0 1 100 0'));
    const b = S.segmentsBBox(S.parsePath('M0 0 A50 50 0 1 1 100 0'));
    closeBox(a, b, 0.02);
  });

  test('the sweep flag picks the other direction', () => {
    const a = S.segmentsBBox(S.parsePath('M0 0 A50 50 0 0 1 100 0'));
    const b = S.segmentsBBox(S.parsePath('M0 0 A50 50 0 0 0 100 0'));
    close(a.y, -50, 0.02, 'sweep 1 arcs above the chord in a y-down system');
    close(b.y, 0, 0.02);
  });

  test('radii too small for the endpoints are scaled up, not rejected', () => {
    const box = S.segmentsBBox(S.parsePath('M0 0 A10 10 0 0 1 100 0'));
    close(box.width, 100, 0.05, 'the endpoints are still reached');
  });

  test('a zero radius is a straight line', () => {
    assert.deepEqual(S.parsePath('M0 0 A0 0 0 0 1 10 10'), [['M', 0, 0], ['L', 10, 10]]);
  });

  test('an arc to the current point draws nothing', () => {
    assert.deepEqual(S.parsePath('M5 5 A10 10 0 0 1 5 5'), [['M', 5, 5]]);
  });

  test('a rotated ellipse arc is measured on the rotated axes', () => {
    // A quarter of an ellipse with rx 100, ry 50, rotated 90 degrees, so the
    // long axis is now vertical.
    const box = S.segmentsBBox(S.parsePath('M0 0 A100 50 90 0 1 50 100'));
    assert.ok(box.height > box.width, `expected a tall box, got ${box.width}x${box.height}`);
  });
});

describe('bounding boxes', () => {
  test('a cubic that overshoots its endpoints is measured at the extremum', () => {
    // Control points pull well past x=10, so the box is wider than the hull of
    // the endpoints and narrower than the hull of the control points.
    const box = S.segmentsBBox(S.parsePath('M0 0 C20 0 20 10 10 10'));
    assert.ok(box.width > 10, 'the curve overshoots the endpoint');
    assert.ok(box.width < 20, 'but does not reach the control point');
    // Chrome's getBBox on the same path reports 16.569 wide.
    close(box.width, 16.569, 0.001);
  });

  test('a quadratic extremum is exact', () => {
    // Vertex of M0 0 Q10 20 20 0 sits at t=0.5, y = 10.
    const box = S.segmentsBBox(S.parsePath('M0 0 Q10 20 20 0'));
    closeBox(box, { x: 0, y: 0, width: 20, height: 10 });
  });

  test('a circle path has exactly the circle box', () => {
    const box = S.segmentsBBox(S.shapeToSegments('circle', { cx: '50', cy: '50', r: '25' }));
    closeBox(box, { x: 25, y: 25, width: 50, height: 50 }, 1e-9);
  });

  test('a line segment box has the right corners', () => {
    closeBox(S.segmentsBBox(S.parsePath('M10 40 L30 20')), { x: 10, y: 20, width: 20, height: 20 });
  });

  test('an empty path has no box', () => {
    assert.equal(S.segmentsBBox([]), null);
    assert.equal(S.segmentsBBox([['Z']]), null);
  });

  test('unionBox tolerates a null side', () => {
    const b = { x: 0, y: 0, width: 1, height: 1 };
    assert.deepEqual(S.unionBox(null, b), b);
    assert.deepEqual(S.unionBox(b, null), b);
    assert.deepEqual(S.unionBox({ x: 0, y: 0, width: 1, height: 1 }, { x: 5, y: 5, width: 1, height: 1 }), {
      x: 0,
      y: 0,
      width: 6,
      height: 6,
    });
  });
});

describe('shapes', () => {
  test('rect with rx but no ry rounds both corners', () => {
    const square = S.shapeToSegments('rect', { width: '100', height: '100' });
    const rounded = S.shapeToSegments('rect', { width: '100', height: '100', rx: '20' });
    assert.equal(square.filter((s) => s[0] === 'C').length, 0);
    assert.equal(rounded.filter((s) => s[0] === 'C').length, 4, 'four corner curves');
    closeBox(S.segmentsBBox(rounded), { x: 0, y: 0, width: 100, height: 100 }, 1e-9);
  });

  test('a corner radius larger than half the side is clamped', () => {
    const segs = S.shapeToSegments('rect', { width: '10', height: '10', rx: '99' });
    closeBox(S.segmentsBBox(segs), { x: 0, y: 0, width: 10, height: 10 }, 1e-9);
  });

  test('zero sized shapes are nothing at all', () => {
    assert.equal(S.shapeToSegments('rect', { width: '0', height: '10' }), null);
    assert.equal(S.shapeToSegments('circle', { r: '0' }), null);
    assert.equal(S.shapeToSegments('ellipse', { rx: '5', ry: '0' }), null);
  });

  test('polygon closes and polyline does not', () => {
    const poly = S.shapeToSegments('polygon', { points: '0,0 10,0 10,10' });
    const line = S.shapeToSegments('polyline', { points: '0,0 10,0 10,10' });
    assert.equal(poly[poly.length - 1][0], 'Z');
    assert.notEqual(line[line.length - 1][0], 'Z');
  });

  test('a polygon with fewer than two points is nothing', () => {
    assert.equal(S.shapeToSegments('polygon', { points: '5' }), null);
  });

  test('an unknown tag is not a shape', () => {
    assert.equal(S.shapeToSegments('text', { x: '0' }), null);
  });
});

describe('collecting shapes', () => {
  test('a group transform reaches its children', () => {
    const shapes = S.collectShapes(svg('<g transform="translate(10 10)"><rect width="10" height="10"/></g>'));
    closeBox(shapes[0].bbox, { x: 10, y: 10, width: 10, height: 10 });
  });

  test('nested transforms compose outermost first', () => {
    const shapes = S.collectShapes(
      svg('<g transform="translate(100 0)"><g transform="scale(2)"><rect width="10" height="10"/></g></g>')
    );
    closeBox(shapes[0].bbox, { x: 100, y: 0, width: 20, height: 20 });
  });

  test('fill is inherited from a group', () => {
    const shapes = S.collectShapes(svg('<g fill="#1F6F4A"><path d="M0 0 L10 10"/></g>'));
    assert.equal(shapes[0].fill, '#1F6F4A');
  });

  test('a child overrides an inherited fill', () => {
    const shapes = S.collectShapes(svg('<g fill="#000"><rect width="1" height="1" fill="#FFF"/></g>'));
    assert.equal(shapes[0].fill, '#FFF');
  });

  test('an unpainted shape defaults to black, which is what a renderer does', () => {
    assert.equal(S.collectShapes(svg('<rect width="1" height="1"/>'))[0].fill, '#000000');
  });

  test('inline style beats the presentation attribute', () => {
    const shapes = S.collectShapes(svg('<rect width="1" height="1" fill="#000" style="fill:#FFF"/>'));
    assert.equal(shapes[0].fill, '#FFF');
  });

  test('display none is marked hidden and excluded from ink', () => {
    const src = svg('<rect width="10" height="10"/><rect x="50" width="10" height="10" display="none"/>');
    const shapes = S.collectShapes(src);
    assert.equal(shapes.length, 2);
    assert.equal(shapes[1].hidden, true);
    closeBox(S.inkBounds(src), { x: 0, y: 0, width: 10, height: 10 });
  });

  test('geometry inside defs and clipPath is not ink', () => {
    const src = svg('<defs><rect x="900" width="10" height="10"/></defs><clipPath id="c"><rect x="800" width="5" height="5"/></clipPath><rect width="10" height="10"/>');
    closeBox(S.inkBounds(src), { x: 0, y: 0, width: 10, height: 10 });
  });

  test('stroke width scales with the transform', () => {
    const shapes = S.collectShapes(svg('<g transform="scale(4)"><path d="M0 0 L10 0" stroke="#000" stroke-width="2"/></g>'));
    close(shapes[0].strokeWidth, 8);
  });

  test('stroke none means no stroke width', () => {
    const shapes = S.collectShapes(svg('<path d="M0 0 L1 1" stroke="none" stroke-width="10"/>'));
    assert.equal(shapes[0].strokeWidth, 0);
    assert.equal(shapes[0].stroke, null);
  });
});

describe('ink bounds', () => {
  test('half the stroke is added on every side', () => {
    const src = svg('<path d="M10 10 L90 10" stroke="#000" stroke-width="4" fill="none"/>');
    closeBox(S.inkBounds(src), { x: 8, y: 8, width: 84, height: 4 });
    closeBox(S.inkBounds(src, { includeStroke: false }), { x: 10, y: 10, width: 80, height: 0 });
  });

  test('ink bounds are the union across shapes', () => {
    const src = svg('<rect x="10" y="10" width="10" height="10"/><circle cx="80" cy="80" r="5"/>');
    closeBox(S.inkBounds(src), { x: 10, y: 10, width: 75, height: 75 });
  });

  test('a document with nothing painted has no ink', () => {
    assert.equal(S.inkBounds(svg('<g></g>')), null);
    assert.equal(S.inkBounds(svg('<path d="M0 0 L1 1" fill="none"/>')), null);
  });

  test('ink can sit outside the viewBox, and is reported where it is', () => {
    const box = S.inkBounds(svg('<rect x="-50" y="-50" width="10" height="10"/>'));
    closeBox(box, { x: -50, y: -50, width: 10, height: 10 });
  });
});

describe('viewBox', () => {
  test('reads the declared viewBox', () => {
    closeBox(S.viewBox(svg('<rect width="1" height="1"/>', 'viewBox="10 20 30 40"')), {
      x: 10,
      y: 20,
      width: 30,
      height: 40,
    });
  });

  test('falls back to width and height', () => {
    closeBox(S.viewBox(svg('<rect width="1" height="1"/>', 'width="64" height="32"')), {
      x: 0,
      y: 0,
      width: 64,
      height: 32,
    });
  });

  test('is null when there is neither', () => {
    assert.equal(S.viewBox(svg('<rect width="1" height="1"/>', '')), null);
  });

  test('a degenerate viewBox is refused rather than returned as zero', () => {
    assert.equal(S.viewBox(svg('<rect width="1" height="1"/>', 'viewBox="0 0 0 100"')), null);
  });
});

describe('structural description', () => {
  test('finds the things that disqualify a master', () => {
    const d = S.describeSvg(svg('<text x="0" y="0">Acme</text><image href="a.png"/><script>alert(1)</script><foreignObject/>'));
    assert.equal(d.hasText, true);
    assert.equal(d.hasImage, true);
    assert.equal(d.hasScript, true);
    assert.equal(d.hasForeignObject, true);
  });

  test('a clean mark reports none of them', () => {
    const d = S.describeSvg(svg('<path d="M0 0 L10 10 Z" fill="#000"/>'));
    assert.equal(d.hasText, false);
    assert.equal(d.hasImage, false);
    assert.equal(d.hasScript, false);
    assert.equal(d.hasForeignObject, false);
    assert.deepEqual(d.externalRefs, []);
    assert.deepEqual(d.danglingRefs, []);
  });

  test('external references are collected from href and from url()', () => {
    const d = S.describeSvg(svg('<image href="https://example.com/a.png"/><rect width="1" height="1" fill="url(https://example.com/p.svg#g)"/>'));
    assert.equal(d.externalRefs.length, 2);
  });

  test('a fill pointing at a missing gradient is a dangling reference', () => {
    const d = S.describeSvg(svg('<rect width="1" height="1" fill="url(#nope)"/>'));
    assert.deepEqual(d.danglingRefs, ['nope']);
  });

  test('a fill pointing at a defined gradient is not dangling', () => {
    const d = S.describeSvg(
      svg('<defs><linearGradient id="g"><stop stop-color="#000"/></linearGradient></defs><rect width="1" height="1" fill="url(#g)"/>')
    );
    assert.deepEqual(d.danglingRefs, []);
    assert.equal(d.usesGradient, true);
  });

  test('collects every distinct paint', () => {
    const d = S.describeSvg(svg('<rect width="1" height="1" fill="#111"/><rect width="1" height="1" fill="#222" stroke="#333"/>'));
    assert.deepEqual(d.paints.sort(), ['#111', '#222', '#333']);
  });

  test('currentColor is noticed, because it inherits from something we do not control', () => {
    assert.equal(S.describeSvg(svg('<path d="M0 0" fill="currentColor"/>')).usesCurrentColor, true);
  });

  test('reports the thinnest stroke, which sets the minimum size', () => {
    const d = S.describeSvg(svg('<path d="M0 0 L9 9" stroke="#000" stroke-width="6"/><path d="M0 9 L9 0" stroke="#000" stroke-width="1.5"/>'));
    close(d.minStrokeWidth, 1.5);
  });

  test('minStrokeWidth is null when nothing is stroked', () => {
    assert.equal(S.describeSvg(svg('<rect width="1" height="1" fill="#000"/>')).minStrokeWidth, null);
  });

  test('counts painting shapes and segments', () => {
    const d = S.describeSvg(svg('<rect width="1" height="1"/><path d="M0 0 L1 1 L2 2"/>'));
    assert.equal(d.shapes, 2);
    assert.equal(d.segments, 5 + 3);
  });

  test('a document that is not an svg at all is reported, not thrown on', () => {
    const d = S.describeSvg('<html><body>hello</body></html>');
    assert.equal(d.hasRoot, false);
    assert.equal(d.ink, null);
  });

  test('an empty string does not throw', () => {
    assert.doesNotThrow(() => S.describeSvg(''));
  });
});

describe('path round tripping', () => {
  test('rounding to three places keeps the box within a thousandth', () => {
    const segs = S.parsePath('M0.00001 0 C10.123456 0 10.987654 10 10 10');
    const reparsed = S.parsePath(S.pathToString(segs, 3));
    const a = S.segmentsBBox(segs);
    const b = S.segmentsBBox(reparsed);
    close(a.width, b.width, 0.002);
    close(a.height, b.height, 0.002);
  });

  test('negative zero is written as zero', () => {
    assert.equal(S.pathToString([['M', -0.0001, 0]], 2), 'M0 0');
  });

  test('a transformed path measures where it was moved to', () => {
    const segs = S.parsePath('M0 0 L10 0 L10 10 Z');
    const moved = S.transformSegments(segs, S.parseTransform('translate(5 5) scale(2)'));
    closeBox(S.segmentsBBox(moved), { x: 5, y: 5, width: 20, height: 20 });
  });

  test('Z survives a transform', () => {
    const moved = S.transformSegments(S.parsePath('M0 0 L1 1 Z'), S.parseTransform('scale(3)'));
    assert.deepEqual(moved[moved.length - 1], ['Z']);
  });
});


describe('hostile and machine-generated files', () => {
  test('path parsing stays linear, because an auto-traced mark is enormous', () => {
    // The NaN guard used to rescan the whole accumulated path on every command.
    // 16,000 segments took 2.1 seconds and 100,000 took 108. Nothing drawn by
    // hand is that long, but an auto-traced raster is, and hanging for two
    // minutes before reporting "this looks auto-traced" is the worst possible
    // way to deliver that finding.
    const build = (n) => 'M0 0 ' + Array.from({ length: n }, (_, i) => `L${i % 90} ${(i * 7) % 90}`).join(' ');
    const time = (n) => {
      const d = build(n);
      const t = Date.now();
      S.parsePath(d);
      return Date.now() - t;
    };
    time(4000);
    const small = Math.max(time(8000), 1);
    const large = time(64000);
    assert.ok(large < small * 40, `eight times the input took ${large}ms against ${small}ms, which is not linear`);
  });

  test('a deeply nested document is measured rather than overflowing the stack', () => {
    // Both tree walks were recursive and threw RangeError at about 5,000 deep,
    // which is a useless thing to hand somebody who asked whether their logo
    // was any good.
    const depth = 20000;
    const src = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">${'<g>'.repeat(depth)}<rect width="5" height="5" fill="#000"/>${'</g>'.repeat(depth)}</svg>`;
    closeBox(S.inkBounds(src), { x: 0, y: 0, width: 5, height: 5 });
    assert.equal(S.describeSvg(src).shapes, 1);
  });

  test('a deeply nested document does not overflow describeSvg either', () => {
    const depth = 20000;
    const src = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">${'<g>'.repeat(depth)}<rect width="5" height="5" fill="#000"/>${'</g>'.repeat(depth)}</svg>`;
    assert.equal(S.describeSvg(src).nodes, depth + 2);
  });

  test('a truncated command still drops only what it pushed', () => {
    assert.deepEqual(S.parsePath('M0 0 L10 10 C1 2 3'), [['M', 0, 0], ['L', 10, 10]]);
    assert.deepEqual(S.parsePath('M0 0 A50 50 0 0 1'), [['M', 0, 0]]);
  });

  test('a shape with a negative or absurd size is not ink', () => {
    assert.equal(S.inkBounds(svg('<rect width="-5" height="5" fill="#000"/>')), null);
    assert.equal(S.inkBounds(svg('<path d="M NaN NaN L 5 5" fill="#000"/>')), null);
  });

  test('an entity declaration is skipped rather than expanded', () => {
    // Nothing here resolves a DOCTYPE entity, which is the whole defence
    // against an expansion attack: the declaration is skipped as a directive.
    const bomb = `<?xml version="1.0"?><!DOCTYPE svg [<!ENTITY a "aaaa"><!ENTITY b "&a;&a;&a;&a;">]><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="5" height="5" fill="#000" data-x="&b;"/></svg>`;
    closeBox(S.inkBounds(bomb), { x: 0, y: 0, width: 5, height: 5 });
  });

  test('an id with dots and dashes resolves, which is what real exports produce', () => {
    const src = svg('<defs><linearGradient id="grad.1-a"><stop stop-color="#000"/></linearGradient></defs><rect width="9" height="9" fill="url(#grad.1-a)"/>');
    const d = S.describeSvg(src);
    assert.deepEqual(d.danglingRefs, [], 'a legitimate reference must not read as dangling');
    assert.deepEqual(d.unusedIds, [], 'and the definition must read as used');
  });

  test('an id full of regex metacharacters produces no false dangling reference', () => {
    // Two separate places build regexes out of ids, so a mark whose gradient is
    // called `a.*b(c)` could otherwise rewrite half the file or be reported as
    // broken when it is not. Note that an UNQUOTED url() may not contain
    // parentheses at all, so the quoted form is the only legal way to reference
    // this id; both quotings are checked.
    for (const fill of [`"url('#a.*b(c)[d]')"`, `'url("#a.*b(c)[d]")'`]) {
      const src = svg(`<defs><linearGradient id="a.*b(c)[d]"><stop stop-color="#000"/></linearGradient></defs><rect width="9" height="9" fill=${fill}/>`);
      assert.deepEqual(S.describeSvg(src).danglingRefs, [], `${fill} should not report a dangling reference`);
    }
  });
});
