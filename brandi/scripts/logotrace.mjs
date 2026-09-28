/**
 * Trace a raster reference into a clean vector mark.
 *
 * The forge used to refuse this outright ("redraw its idea, do not trace it"),
 * and on a real engagement that cost five rounds: the person picked a generated
 * sketch, said they wanted THAT, and got six new marks, then six marks "in the
 * style of" it, before anybody traced the thing they had pointed at. A person
 * who picks a drawing and says "this one" is asking for the drawing.
 *
 * What made tracing a bad idea was never the tracing, it was the output: a
 * bitmap tracer gives hundreds of nodes that wobble at large sizes. So this one
 * fits curves rather than following pixels:
 *
 *   1. the anti-aliased edge is read at sub-pixel precision (marching squares
 *      on the grey values, after a light blur), not from a hard threshold;
 *   2. corners are found and kept sharp, everything between them is fitted
 *      with as few cubic curves as the tolerance allows (Schneider's method);
 *   3. a curve that is a straight line to within the tolerance becomes one;
 *   4. the result is rasterised again and compared with the reference, so the
 *      claim "this is the drawing you picked" arrives with a number.
 *
 * Pure JavaScript and deterministic, like everything else here: the same file
 * and crop always give the same path.
 */

import { decodePng, encodePng, toGrey } from './png.mjs';

// ---------------------------------------------------------------------------
// The field
// ---------------------------------------------------------------------------

/**
 * A crop of the reference as ink density: 0 is paper, 1 is ink, whichever way
 * round the reference was drawn. The ground is read from the border, so a white
 * mark reversed out of black traces the same as a black mark on white.
 */
export function inkField(grey, width, height, crop = null) {
  const c = crop ?? { x: 0, y: 0, w: width, h: height };
  const x0 = Math.max(0, Math.round(c.x));
  const y0 = Math.max(0, Math.round(c.y));
  const w = Math.min(width - x0, Math.round(c.w));
  const h = Math.min(height - y0, Math.round(c.h));
  if (!(w > 2 && h > 2)) throw new RangeError(`the crop ${JSON.stringify(c)} leaves nothing to trace`);

  const field = new Float32Array(w * h);
  let border = 0;
  let borderCount = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = grey[(y0 + y) * width + (x0 + x)];
      field[y * w + x] = v;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) { border += v; borderCount++; }
    }
  }
  const darkGround = border / borderCount < 128;
  for (let i = 0; i < field.length; i++) field[i] = darkGround ? field[i] / 255 : 1 - field[i] / 255;
  return { field, w, h, x0, y0 };
}

/**
 * The level the edge sits at: halfway between the paper and the ink, with
 * Otsu's method deciding which pixels are which.
 *
 * Otsu's own threshold is the wrong level to draw the outline at. On a clean
 * image every split in the empty band between paper and ink scores the same,
 * the first one wins, and the outline was traced at 0.2% ink, a pixel or two
 * outside the real edge all the way round. An anti-aliased edge is where the
 * pixel is half covered, which is the midpoint of the two classes.
 */
export function otsu(field) {
  const bins = new Float64Array(256);
  for (const v of field) bins[Math.min(255, Math.max(0, Math.round(v * 255)))]++;
  const total = field.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * bins[i];
  let sumB = 0;
  let wB = 0;
  let best = 0;
  let level = 128;
  for (let i = 0; i < 256; i++) {
    wB += bins[i];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += i * bins[i];
    const between = wB * wF * ((sumB / wB) - ((sum - sumB) / wF)) ** 2;
    if (between > best) { best = between; level = i; }
  }
  let paper = 0; let paperN = 0; let ink = 0; let inkN = 0;
  for (let i = 0; i < 256; i++) {
    if (i <= level) { paper += i * bins[i]; paperN += bins[i]; } else { ink += i * bins[i]; inkN += bins[i]; }
  }
  if (!paperN || !inkN) return 0.5;
  return (paper / paperN + ink / inkN) / 2 / 255;
}

/** A separable Gaussian blur. Smooths the stair steps a hard edge leaves. */
export function blur(field, w, h, sigma) {
  if (!(sigma > 0)) return field;
  const r = Math.ceil(sigma * 3);
  const k = [];
  let norm = 0;
  for (let i = -r; i <= r; i++) { const v = Math.exp(-(i * i) / (2 * sigma * sigma)); k.push(v); norm += v; }
  for (let i = 0; i < k.length; i++) k[i] /= norm;
  const tmp = new Float32Array(field.length);
  const out = new Float32Array(field.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let i = -r; i <= r; i++) s += field[y * w + Math.min(w - 1, Math.max(0, x + i))] * k[i + r];
      tmp[y * w + x] = s;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let i = -r; i <= r; i++) s += tmp[Math.min(h - 1, Math.max(0, y + i)) * w + x] * k[i + r];
      out[y * w + x] = s;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Contours
// ---------------------------------------------------------------------------

/**
 * Closed outlines of the ink at `level`, as polygons in pixel coordinates.
 *
 * Marching squares on a field padded with one pixel of paper, so every outline
 * closes, even one touching the edge of the crop. Edge crossings are placed by
 * linear interpolation between the two samples, which is where the sub-pixel
 * precision comes from.
 */
export function contours(field, w, h, level) {
  const W = w + 2;
  const H = h + 2;
  const at = (x, y) => (x <= 0 || y <= 0 || x >= W - 1 || y >= H - 1 ? 0 : field[(y - 1) * w + (x - 1)]);
  const inside = (x, y) => at(x, y) > level;

  // Edge ids: a horizontal edge from (x,y) to (x+1,y), a vertical one from (x,y) to (x,y+1).
  const pointOf = new Map();
  const cross = (id, ax, ay, bx, by) => {
    if (!pointOf.has(id)) {
      const va = at(ax, ay);
      const vb = at(bx, by);
      const t = vb === va ? 0.5 : (level - va) / (vb - va);
      // Less the one pixel of padding, plus half a pixel: sample i is the centre
      // of pixel i, which sits at i + 0.5 on the page.
      pointOf.set(id, [ax + (bx - ax) * t - 0.5, ay + (by - ay) * t - 0.5]);
    }
    return id;
  };
  const top = (x, y) => cross(`h${x},${y}`, x, y, x + 1, y);
  const bottom = (x, y) => cross(`h${x},${y + 1}`, x, y + 1, x + 1, y + 1);
  const left = (x, y) => cross(`v${x},${y}`, x, y, x, y + 1);
  const right = (x, y) => cross(`v${x + 1},${y}`, x + 1, y, x + 1, y + 1);

  const links = new Map();
  const link = (a, b) => {
    if (!links.has(a)) links.set(a, []);
    if (!links.has(b)) links.set(b, []);
    links.get(a).push(b);
    links.get(b).push(a);
  };

  for (let y = 0; y < H - 1; y++) {
    for (let x = 0; x < W - 1; x++) {
      const tl = inside(x, y);
      const tr = inside(x + 1, y);
      const br = inside(x + 1, y + 1);
      const bl = inside(x, y + 1);
      const code = (tl ? 8 : 0) | (tr ? 4 : 0) | (br ? 2 : 0) | (bl ? 1 : 0);
      if (code === 0 || code === 15) continue;
      if (code === 5 || code === 10) {
        // A saddle: the centre decides which diagonal the ink joins across.
        // Code 10 is ink at top left and bottom right. Joined across the centre,
        // the paper corners (top right, bottom left) are the ones cut off; apart,
        // the ink corners are. Code 5 is the mirror image.
        const centre = (at(x, y) + at(x + 1, y) + at(x + 1, y + 1) + at(x, y + 1)) / 4 > level;
        if ((code === 10) === centre) {
          link(top(x, y), right(x, y));
          link(bottom(x, y), left(x, y));
        } else {
          link(top(x, y), left(x, y));
          link(right(x, y), bottom(x, y));
        }
        continue;
      }
      const edges = [];
      if (tl !== tr) edges.push(top(x, y));
      if (tr !== br) edges.push(right(x, y));
      if (bl !== br) edges.push(bottom(x, y));
      if (tl !== bl) edges.push(left(x, y));
      link(edges[0], edges[1]);
    }
  }

  const loops = [];
  const used = new Set();
  for (const start of links.keys()) {
    if (used.has(start)) continue;
    const loop = [];
    let prev = null;
    let cur = start;
    while (cur && !used.has(cur)) {
      used.add(cur);
      loop.push(pointOf.get(cur));
      const next = links.get(cur).find((n) => n !== prev && !used.has(n));
      prev = cur;
      cur = next;
    }
    if (loop.length >= 3) loops.push(loop);
  }
  return loops;
}

/** Signed area, positive when the loop runs clockwise on a y-down page. */
export function signedArea(loop) {
  let a = 0;
  for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) a += (loop[j][0] * loop[i][1]) - (loop[i][0] * loop[j][1]);
  return a / 2;
}

function pointInLoop([px, py], loop) {
  let inside = false;
  for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
    const [xi, yi] = loop[i];
    const [xj, yj] = loop[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Outer outlines clockwise, holes counter-clockwise, by how deeply each one is
 * nested. With that done the default nonzero fill rule draws the counters as
 * counters, which every renderer the pack goes through agrees on.
 */
export function orient(loops) {
  return loops.map((loop, i) => {
    const depth = loops.reduce((n, other, j) => n + (j !== i && pointInLoop(loop[0], other) ? 1 : 0), 0);
    const clockwise = signedArea(loop) > 0;
    const wantClockwise = depth % 2 === 0;
    return clockwise === wantClockwise ? loop : [...loop].reverse();
  });
}

// ---------------------------------------------------------------------------
// Curve fitting
// ---------------------------------------------------------------------------

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, s) => [a[0] * s, a[1] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const len = (a) => Math.hypot(a[0], a[1]);
const unit = (a) => { const l = len(a); return l ? [a[0] / l, a[1] / l] : [0, 0]; };
const distSq = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

function bezierAt(b, t) {
  const u = 1 - t;
  return [
    u * u * u * b[0][0] + 3 * u * u * t * b[1][0] + 3 * u * t * t * b[2][0] + t * t * t * b[3][0],
    u * u * u * b[0][1] + 3 * u * u * t * b[1][1] + 3 * u * t * t * b[2][1] + t * t * t * b[3][1],
  ];
}

function newtonStep(b, p, t) {
  const d1 = [mul(sub(b[1], b[0]), 3), mul(sub(b[2], b[1]), 3), mul(sub(b[3], b[2]), 3)];
  const d2 = [mul(sub(d1[1], d1[0]), 2), mul(sub(d1[2], d1[1]), 2)];
  const q = bezierAt(b, t);
  const u = 1 - t;
  const q1 = add(add(mul(d1[0], u * u), mul(d1[1], 2 * u * t)), mul(d1[2], t * t));
  const q2 = add(mul(d2[0], u), mul(d2[1], t));
  const num = dot(sub(q, p), q1);
  const den = dot(q1, q1) + dot(sub(q, p), q2);
  return den === 0 ? t : t - num / den;
}

function chordParams(points) {
  const u = [0];
  for (let i = 1; i < points.length; i++) u.push(u[i - 1] + len(sub(points[i], points[i - 1])));
  const total = u[u.length - 1] || 1;
  return u.map((v) => v / total);
}

function generateBezier(points, u, t1, t2) {
  const first = points[0];
  const last = points[points.length - 1];
  let c00 = 0; let c01 = 0; let c11 = 0; let x0 = 0; let x1 = 0;
  for (let i = 0; i < points.length; i++) {
    const t = u[i];
    const s = 1 - t;
    const a1 = mul(t1, 3 * s * s * t);
    const a2 = mul(t2, 3 * s * t * t);
    c00 += dot(a1, a1);
    c01 += dot(a1, a2);
    c11 += dot(a2, a2);
    const tmp = sub(points[i], bezierAt([first, first, last, last], t));
    x0 += dot(a1, tmp);
    x1 += dot(a2, tmp);
  }
  const det = c00 * c11 - c01 * c01;
  let alpha1 = det === 0 ? 0 : (x0 * c11 - x1 * c01) / det;
  let alpha2 = det === 0 ? 0 : (c00 * x1 - c01 * x0) / det;
  const seg = len(sub(last, first));
  const eps = 1e-6 * seg;
  if (alpha1 < eps || alpha2 < eps) { alpha1 = seg / 3; alpha2 = seg / 3; }
  return [first, add(first, mul(t1, alpha1)), add(last, mul(t2, alpha2)), last];
}

function maxError(points, b, u) {
  let worst = 0;
  let at = Math.floor(points.length / 2);
  for (let i = 1; i < points.length - 1; i++) {
    const d = distSq(bezierAt(b, u[i]), points[i]);
    if (d > worst) { worst = d; at = i; }
  }
  return { worst, at };
}

function fitCubic(points, t1, t2, tolSq, out) {
  if (points.length === 2) {
    const d = len(sub(points[1], points[0])) / 3;
    out.push([points[0], add(points[0], mul(t1, d)), add(points[1], mul(t2, d)), points[1]]);
    return;
  }
  let u = chordParams(points);
  let b = generateBezier(points, u, t1, t2);
  let { worst, at } = maxError(points, b, u);
  if (worst < tolSq) { out.push(b); return; }
  if (worst < tolSq * 16) {
    for (let k = 0; k < 20; k++) {
      u = u.map((t, i) => newtonStep(b, points[i], t));
      b = generateBezier(points, u, t1, t2);
      ({ worst, at } = maxError(points, b, u));
      if (worst < tolSq) { out.push(b); return; }
    }
  }
  const split = Math.min(points.length - 2, Math.max(1, at));
  const span = Math.min(3, split, points.length - 1 - split);
  const centre = unit(sub(points[split - span], points[split + span]));
  fitCubic(points.slice(0, split + 1), t1, centre, tolSq, out);
  fitCubic(points.slice(split), mul(centre, -1), t2, tolSq, out);
}

/** Where a closed outline turns sharply: the points the fit must not round off. */
export function corners(loop, { span = 3, angle = 50 } = {}) {
  const n = loop.length;
  if (n < span * 4) return [];
  const turn = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = unit(sub(loop[i], loop[(i - span + n) % n]));
    const b = unit(sub(loop[(i + span) % n], loop[i]));
    turn[i] = Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * (180 / Math.PI);
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    if (turn[i] < angle) continue;
    let peak = true;
    for (let k = 1; k <= span && peak; k++) {
      if (turn[(i + k) % n] > turn[i] || turn[(i - k + n) % n] >= turn[i]) peak = false;
    }
    if (peak) out.push(i);
  }
  return out;
}

/** How far a point is from the infinite line through a and b. */
function lineDistance(p, a, b) {
  const d = sub(b, a);
  const l = len(d);
  if (!l) return len(sub(p, a));
  return Math.abs(d[0] * (a[1] - p[1]) - d[1] * (a[0] - p[0])) / l;
}

/**
 * Stretches of an outline that are straight to within `tolerance` and at least
 * `minLength` long, as [from, to] indices into the loop.
 *
 * An image model draws a stem with a tremor no designer would keep, and a fit
 * that follows it faithfully leaves a ripple you can see at poster size. The
 * scan starts from the most sharply turning point, which is never inside a
 * straight stretch, so no stretch is broken where the loop happens to begin.
 */
export function straightRuns(loop, { tolerance = 1, minLength = 20, span = 3, ratio = 0.01, bend = 30 } = {}) {
  const n = loop.length;
  if (n < 8) return [];
  let start = 0;
  let sharpest = -1;
  for (let i = 0; i < n; i++) {
    const a = unit(sub(loop[i], loop[(i - span + n) % n]));
    const b = unit(sub(loop[(i + span) % n], loop[i]));
    const t = 1 - dot(a, b);
    if (t > sharpest) { sharpest = t; start = i; }
  }
  const at = (k) => loop[(start + k) % n];
  // A gentle curve sags more the longer the chord across it; a straight edge
  // with a tremor does not. So the allowance shrinks with the stretch, and a
  // long arc that a fixed tolerance would accept is left to the curve fit.
  //
  // Size alone cannot tell them apart, so the shape of the deviation decides:
  // pixel ripple along a straight edge falls either side of the line and
  // cancels out, while a curve bows to one side all the way along.
  const straight = (i, j) => {
    const a = at(i);
    const d = unit(sub(at(j), a));
    const limit = Math.min(tolerance, ratio * len(sub(at(j), a)));
    let worst = 0;
    let signed = 0;
    for (let k = i + 1; k < j; k++) {
      const q = sub(at(k), a);
      const off = d[0] * q[1] - d[1] * q[0];
      if (Math.abs(off) > limit) return false;
      worst = Math.max(worst, Math.abs(off));
      signed += off;
    }
    const bow = j - i > 1 ? Math.abs(signed / (j - i - 1)) : 0;
    return worst <= 0.35 || bow < 0.4 * worst;
  };
  const runs = [];
  let i = 0;
  while (i < n - 1) {
    let good = i + 1;
    let step = 2;
    while (i + step < n && straight(i, i + step)) { good = i + step; step *= 2; }
    let bad = Math.min(i + step, n);
    while (bad - good > 1) {
      const mid = (good + bad) >> 1;
      if (mid < n && straight(i, mid)) good = mid; else bad = mid;
    }
    if (len(sub(at(good), at(i))) >= minLength) {
      runs.push([i, good]);
      i = good;
    } else {
      i++;
    }
  }
  // The scan can split one edge in two where it started just inside a rounded
  // corner. Neighbours that are still straight taken together are one edge.
  for (let r = 0; r < runs.length - 1;) {
    if (runs[r][1] === runs[r + 1][0] && straight(runs[r][0], runs[r + 1][1])) {
      runs.splice(r, 2, [runs[r][0], runs[r + 1][1]]);
    } else {
      r++;
    }
  }
  // What is left meeting at a shallow angle is one curve seen as two lines, and
  // drawn as lines it leaves a kink. Only a real corner joins two lines.
  const direction = ([a, b]) => unit(sub(at(b), at(a)));
  const kinked = new Set();
  for (let r = 0; r < runs.length; r++) {
    const next = runs[(r + 1) % runs.length];
    if (runs.length < 2 || runs[r][1] % n !== next[0] % n) continue;
    const angle = Math.acos(Math.max(-1, Math.min(1, dot(direction(runs[r]), direction(next))))) * (180 / Math.PI);
    if (angle < bend) { kinked.add(r); kinked.add((r + 1) % runs.length); }
  }
  // The scan stops a point or two into the turn at each end. A curve leaving a
  // line is made to leave along it, and made to leave from a point where the
  // outline has already turned it overshoots into a spike. So each end comes
  // back onto the straight part.
  return runs.filter((_, r) => !kinked.has(r)).map(([a, b]) => {
    const t = b - a > span * 4 ? span : 0;
    return [(start + a + t) % n, (start + b - t) % n];
  });
}

/**
 * One closed outline as segments: `['C', p0, c1, c2, p3]` or `['L', p0, p3]`.
 *
 * Corners and the ends of straight stretches split the outline into runs. A
 * straight stretch is one line; every other run is fitted with as few curves as
 * the tolerance allows, leaving a corner sharp and meeting a line along its own
 * direction, so the join is smooth. An outline with neither is split into four
 * runs sharing their tangents, so it closes smoothly.
 */
export function fitLoop(loop, { tolerance = 1, span = 3, angle = 50, straight = 0, minLine = Infinity, cornerGap = 4 } = {}) {
  const n = loop.length;
  // Each line is fitted to every point along it, not drawn between its two end
  // points: those sit where the edge has started turning into a corner, and a
  // line between them leans. A stretch the fitted line misses by more than the
  // tolerance anywhere was a gentle curve after all, and goes to the curve fit:
  // drawn as a line it leaves a step where the next curve has to find the edge.
  const lines = (straight > 0 ? straightRuns(loop, { tolerance: straight, minLength: minLine, span }) : []).map(([a, b]) => {
    const pts = [];
    for (let i = a; ; i = (i + 1) % n) { pts.push(loop[i]); if (i === b) break; }
    const trim = pts.length > span * 4 ? pts.slice(span, pts.length - span) : pts;
    const c = mul(trim.reduce(add, [0, 0]), 1 / trim.length);
    let xx = 0; let xy = 0; let yy = 0;
    for (const p of trim) { const d = sub(p, c); xx += d[0] * d[0]; xy += d[0] * d[1]; yy += d[1] * d[1]; }
    const theta = 0.5 * Math.atan2(2 * xy, xx - yy);
    let dir = [Math.cos(theta), Math.sin(theta)];
    if (dot(dir, sub(loop[b], loop[a])) < 0) dir = mul(dir, -1);
    const off = (p) => Math.abs(dir[0] * (p[1] - c[1]) - dir[1] * (p[0] - c[0]));
    if (pts.some((p) => off(p) > tolerance * 0.75)) return null;
    const onto = (p) => add(c, mul(dir, dot(sub(p, c), dir)));
    return { a, b, c, dir, p0: onto(loop[a]), p1: onto(loop[b]) };
  }).filter(Boolean);

  // A line's ends are already cuts. A corner found a few points from one (the
  // line gave back `span` points at each end) would split the line or stand
  // between two lines that should meet.
  const margin = span * 3;
  const nearLine = (c) => lines.some(({ a, b }) => {
    const d = (c - a + n) % n;
    return d <= ((b - a + n) % n) + margin || d >= n - margin;
  });
  const sharp = new Set(corners(loop, { span, angle }).filter((c) => !nearLine(c)));

  const byStart = new Map(lines.map((l) => [l.a, l]));
  const byEnd = new Map(lines.map((l) => [l.b, l]));
  const meet = (l1, l2) => {
    const cross = l1.dir[0] * l2.dir[1] - l1.dir[1] * l2.dir[0];
    if (Math.abs(cross) < Math.sin((35 * Math.PI) / 180)) return null;
    const q = sub(l2.c, l1.c);
    return add(l1.c, mul(l1.dir, (q[0] * l2.dir[1] - q[1] * l2.dir[0]) / cross));
  };

  let cuts = [...new Set([...sharp, ...lines.flatMap((l) => [l.a, l.b])])].sort((a, b) => a - b);
  if (cuts.length === 0) cuts = [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor((3 * n) / 4)];
  const runOf = (from, to) => {
    const run = [];
    for (let i = from; ; i = (i + 1) % n) { run.push(loop[i]); if (i === to && run.length > 1) break; }
    return run;
  };
  const arc = (run) => run.reduce((s, p, k) => s + (k ? len(sub(p, run[k - 1])) : 0), 0);

  // Where two lines meet, directly or across a sliver of curve the blur left
  // at a sharp corner, both are extended to their intersection.
  const bridged = new Set();
  for (let k = 0; k < cuts.length; k++) {
    const l1 = byEnd.get(cuts[k]);
    if (!l1) continue;
    const next = cuts[(k + 1) % cuts.length];
    const l2 = byStart.get(cuts[k]) ?? byStart.get(next);
    if (!l2 || l2 === l1) continue;
    const x = meet(l1, l2);
    if (!x) continue;
    const direct = l2.a === cuts[k];
    // The allowance covers the rounding plus the points each line gave back at its end.
    if (!direct && (arc(runOf(cuts[k], next)) > cornerGap * 2 + span * 4 || len(sub(x, l1.p1)) > cornerGap * 4)) continue;
    l1.p1 = x;
    l2.p0 = x;
    if (!direct) bridged.add(cuts[k]);
  }

  const tangentAt = (i) => unit(sub(loop[(i + span) % n], loop[(i - span + n) % n]));
  const segments = [];
  for (let k = 0; k < cuts.length; k++) {
    const from = cuts[k];
    const to = cuts[(k + 1) % cuts.length];
    const line = byStart.get(from);
    if (line && line.b === to) { segments.push(['L', line.p0, line.p1]); continue; }
    if (bridged.has(from)) continue;
    const run = runOf(from, to);
    if (run.length < 2) continue;
    const into = byEnd.get(from);
    const onto = byStart.get(to);
    if (into) run[0] = into.p1;
    if (onto) run[run.length - 1] = onto.p0;
    const reach = Math.min(span, run.length - 1);
    // Leaving a line: carry on along it. At a corner: the run's own direction.
    // At a plain split: the direction the outline has through that point.
    const t1 = into ? into.dir : sharp.has(from) ? unit(sub(run[reach], run[0])) : tangentAt(from);
    const t2 = onto ? mul(onto.dir, -1)
      : sharp.has(to) ? unit(sub(run[run.length - 1 - reach], run[run.length - 1]))
        : mul(tangentAt(to), -1);
    const out = [];
    fitCubic(run, t1, t2, tolerance * tolerance, out);
    // A long curve that is flat to within half the tolerance is a line. A short
    // one stays a curve: made a line, it keeps its length and loses the smooth
    // join at each end, and that is a visible kink where it meets the next.
    for (const b of out) {
      const flat = len(sub(b[3], b[0])) >= minLine / 2
        && lineDistance(b[1], b[0], b[3]) < tolerance / 2 && lineDistance(b[2], b[0], b[3]) < tolerance / 2;
      segments.push(flat ? ['L', b[0], b[3]] : ['C', ...b]);
    }
  }
  // Runs of lines along one direction become one line.
  const merged = [];
  for (const s of segments) {
    const prev = merged[merged.length - 1];
    if (s[0] === 'L' && prev?.[0] === 'L' && lineDistance(prev[2], prev[1], s[2]) < tolerance / 4) {
      prev[2] = s[2];
    } else {
      merged.push(s);
    }
  }
  return merged;
}

// ---------------------------------------------------------------------------
// Measuring the fit
// ---------------------------------------------------------------------------

/** Every outline flattened to a polygon, for filling. */
function flatten(paths, steps = 16) {
  return paths.map((segs) => {
    const pts = [];
    for (const s of segs) {
      if (s[0] === 'L') { pts.push(s[1]); continue; }
      for (let i = 0; i < steps; i++) pts.push(bezierAt(s.slice(1), i / steps));
    }
    return pts;
  });
}

/** The traced outlines filled with the nonzero rule, one byte a pixel. */
export function rasterise(paths, w, h) {
  const polys = flatten(paths);
  const mask = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const sy = y + 0.5;
    const hits = [];
    for (const poly of polys) {
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [x1, y1] = poly[j];
        const [x2, y2] = poly[i];
        if ((y1 <= sy) === (y2 <= sy)) continue;
        hits.push([x1 + ((sy - y1) * (x2 - x1)) / (y2 - y1), y2 > y1 ? 1 : -1]);
      }
    }
    hits.sort((a, b) => a[0] - b[0]);
    let winding = 0;
    for (let k = 0; k < hits.length - 1; k++) {
      winding += hits[k][1];
      if (!winding) continue;
      const from = Math.max(0, Math.ceil(hits[k][0] - 0.5));
      const to = Math.min(w - 1, Math.floor(hits[k + 1][0] - 0.5));
      for (let x = from; x <= to; x++) mask[y * w + x] = 1;
    }
  }
  return mask;
}

/**
 * How much of the reference the trace covers, as intersection over union, and
 * an overlay a person can look at: black where both have ink, red where only
 * the reference does, blue where only the trace does.
 */
export function compare(reference, traced, w, h) {
  let both = 0;
  let either = 0;
  const rgb = new Uint8Array(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    const a = reference[i];
    const b = traced[i];
    if (a || b) either++;
    if (a && b) both++;
    const [r, g, bl] = a && b ? [17, 17, 17] : a ? [224, 48, 30] : b ? [30, 111, 224] : [255, 255, 255];
    rgb[i * 3] = r; rgb[i * 3 + 1] = g; rgb[i * 3 + 2] = bl;
  }
  return { overlap: either ? both / either : 1, overlay: encodePng({ width: w, height: h, channels: 3, data: rgb }) };
}

// ---------------------------------------------------------------------------
// The whole trace
// ---------------------------------------------------------------------------

const fmt = (v) => String(Math.round(v * 100) / 100);

/** Segments as an SVG path, through a transform from pixels to the viewBox. */
export function pathData(paths, map = (p) => p) {
  return paths.map((segs) => {
    const first = map(segs[0][1]);
    let d = `M${fmt(first[0])} ${fmt(first[1])}`;
    for (const s of segs) {
      if (s[0] === 'L') {
        const p = map(s[2]);
        d += `L${fmt(p[0])} ${fmt(p[1])}`;
      } else {
        const [c1, c2, p] = [map(s[2]), map(s[3]), map(s[4])];
        d += `C${fmt(c1[0])} ${fmt(c1[1])} ${fmt(c2[0])} ${fmt(c2[1])} ${fmt(p[0])} ${fmt(p[1])}`;
      }
    }
    return `${d}Z`;
  }).join('');
}

/**
 * Trace PNG bytes. Returns the SVG (black on white, in a 0 0 100 100 box with
 * the ink centred), how closely it matches the reference, the node count and
 * the overlay PNG.
 *
 * `crop` is in pixels of the reference. `tolerance` is how far, in pixels at
 * the crop's own size, a curve may stray from the edge it follows; the default
 * scales with the crop so a 2048px sketch and a 512px one come out alike.
 */
export function traceImage(png, { crop = null, tolerance = null, minArea = null } = {}) {
  const img = decodePng(png);
  const grey = toGrey(img);
  const { field, w, h } = inkField(grey, img.width, img.height, crop);
  const size = Math.max(w, h);
  const level = otsu(field);
  const hard = new Uint8Array(w * h);
  for (let i = 0; i < field.length; i++) hard[i] = field[i] > level ? 1 : 0;
  // Ink on the edge of the crop means the crop cut through the mark. The trace
  // would copy the cut faithfully and still score well against the crop, so it
  // is reported rather than left for somebody to notice on a board.
  const inkOn = (xs, ys) => xs.some((x) => ys.some((y) => hard[y * w + x]));
  const all = (k) => Array.from({ length: k }, (_, i) => i);
  const clipped = [
    inkOn(all(w), [0]) && 'top', inkOn([w - 1], all(h)) && 'right',
    inkOn(all(w), [h - 1]) && 'bottom', inkOn([0], all(h)) && 'left',
  ].filter(Boolean);

  const smooth = blur(field, w, h, Math.max(0.8, size / 700));
  // Specks are measured against the ink, not the frame. Measured against the
  // frame, the dot of an i in a wordmark set small on a large sketch fell under
  // the floor and the trace read "Kınbox".
  const found = contours(smooth, w, h, level);
  const ink = found.reduce((s, l) => s + Math.abs(signedArea(l)), 0);
  const floor = minArea ?? Math.max(12, ink * 0.001);
  const loops = orient(found.filter((l) => Math.abs(signedArea(l)) >= floor));
  if (!loops.length) throw new Error('found no ink to trace. Check the crop: it should hold the mark and a margin of paper around it.');

  const tol = tolerance ?? Math.max(0.6, size / 400);
  const span = Math.max(2, Math.round(size / 250));
  const paths = loops.map((l) => fitLoop(l, {
    tolerance: tol, span, straight: tol * 1.5, minLine: size * 0.2, cornerGap: Math.max(4, size * 0.012),
  }));
  const { overlap, overlay } = compare(hard, rasterise(paths, w, h), w, h);

  let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
  for (const l of loops) for (const [x, y] of l) {
    minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
  const scale = 80 / Math.max(maxX - minX, maxY - minY);
  const ox = 50 - ((minX + maxX) / 2) * scale;
  const oy = 50 - ((minY + maxY) / 2) * scale;
  const d = pathData(paths, ([x, y]) => [x * scale + ox, y * scale + oy]);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#111111" d="${d}"/></svg>`;

  const segments = paths.flat();
  return {
    svg,
    overlap,
    overlay,
    outlines: paths.length,
    curves: segments.filter((s) => s[0] === 'C').length,
    lines: segments.filter((s) => s[0] === 'L').length,
    size: { width: w, height: h },
    clipped,
  };
}

/**
 * A crop given as `x,y,w,h`. All four at 1 or below are read as fractions of
 * the image, which is easier to say about a picture you are looking at.
 */
export function parseCrop(value, width, height) {
  if (value === undefined || value === null || value === true) return null;
  const n = String(value).split(',').map((v) => Number(v.trim()));
  if (n.length !== 4 || n.some((v) => !Number.isFinite(v) || v < 0)) {
    throw new Error(`--crop takes x,y,w,h in pixels, or as fractions of the image, not "${value}"`);
  }
  const fractional = n.every((v) => v <= 1);
  const [x, y, w, h] = fractional ? [n[0] * width, n[1] * height, n[2] * width, n[3] * height] : n;
  return { x, y, w, h };
}

export default { traceImage, parseCrop, inkField, otsu, blur, contours, orient, signedArea, corners, straightRuns, fitLoop, rasterise, compare, pathData };
