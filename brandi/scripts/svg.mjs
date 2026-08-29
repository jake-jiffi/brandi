/**
 * The geometry of a mark, read off the file rather than guessed at.
 *
 * Everything downstream of logo generation needs to know where the ink actually
 * is. Clear space is a ratio of a named element, so something has to measure
 * that element. A minimum size is derived from the thinnest stroke, so something
 * has to find it. A mark is optically centred or it is not, and "looks centred"
 * is not a specification. `assets.mjs` reads a `viewBox` and trusts it, which is
 * right for scaling artwork somebody else drew; this is for artwork we are
 * about to accept as a master, where the viewBox is frequently wrong and the
 * whole point is to find out.
 *
 * Two deliberate simplifications, both of which buy a lot:
 *
 * Arcs are converted to cubics at parse time. An `A` under a non-uniform
 * transform is genuinely hard and the conversion is exact to within a few parts
 * in ten thousand, so every later operation only has to understand four
 * commands: M, L, C and Q.
 *
 * The XML reader is a scanner, not a parser. It understands tags, attributes,
 * quoting, comments and CDATA, which is everything an SVG needs, and it does not
 * build a validating DOM. An SVG that would break it is an SVG we would refuse
 * anyway.
 */

// ---------------------------------------------------------------------------
// XML scanning
// ---------------------------------------------------------------------------

const VOID_TAGS = new Set(['path', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline', 'use', 'image', 'stop']);

/**
 * Read attributes out of a start tag's body.
 *
 * Both quote styles and bare unquoted values, because real SVG in the wild has
 * all three and refusing one of them would reject files we could have measured.
 */
function parseAttrs(body) {
  const attrs = {};
  const re = /([:A-Za-z_][-.:\w]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>`=]+))/g;
  let m;
  while ((m = re.exec(body))) {
    attrs[m[1]] = decodeEntities(m[3] ?? m[4] ?? m[5] ?? '');
  }
  return attrs;
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'", '#34': '"' };

function decodeEntities(s) {
  return s.replace(/&(#x?[0-9a-fA-F]+|\w+);/g, (whole, name) => {
    if (ENTITIES[name]) return ENTITIES[name];
    if (name[0] === '#') {
      const code = name[1] === 'x' || name[1] === 'X' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole;
    }
    return whole;
  });
}

/**
 * Turn SVG source into a tree of `{ tag, attrs, children, text }`.
 *
 * Unclosed and mismatched tags are tolerated rather than thrown on: the caller
 * is usually trying to find out whether a file is any good, and refusing to
 * read it at all makes that harder rather than safer. Malformed structure shows
 * up in the findings instead.
 */
export function parseXml(source) {
  const root = { tag: '#root', attrs: {}, children: [], text: '' };
  const stack = [root];
  let i = 0;

  while (i < source.length) {
    const lt = source.indexOf('<', i);
    if (lt === -1) break;

    if (lt > i) {
      const text = source.slice(i, lt);
      if (text.trim()) stack[stack.length - 1].text += text;
    }

    if (source.startsWith('<!--', lt)) {
      const end = source.indexOf('-->', lt + 4);
      i = end === -1 ? source.length : end + 3;
      continue;
    }
    if (source.startsWith('<![CDATA[', lt)) {
      const end = source.indexOf(']]>', lt + 9);
      const inner = source.slice(lt + 9, end === -1 ? source.length : end);
      stack[stack.length - 1].text += inner;
      i = end === -1 ? source.length : end + 3;
      continue;
    }
    if (source.startsWith('<!', lt) || source.startsWith('<?', lt)) {
      const end = source.indexOf('>', lt);
      i = end === -1 ? source.length : end + 1;
      continue;
    }

    // Find the end of this tag, respecting quoted attribute values so a `>`
    // inside an attribute (a data URI, a font stack) does not truncate it.
    let j = lt + 1;
    let quote = null;
    while (j < source.length) {
      const c = source[j];
      if (quote) {
        if (c === quote) quote = null;
      } else if (c === '"' || c === "'") {
        quote = c;
      } else if (c === '>') break;
      j++;
    }
    if (j >= source.length) break;

    const inner = source.slice(lt + 1, j);
    i = j + 1;

    if (inner[0] === '/') {
      const name = inner.slice(1).trim().toLowerCase();
      // Pop to the nearest matching open tag, so one stray close does not
      // unwind the whole document.
      for (let k = stack.length - 1; k > 0; k--) {
        if (stack[k].tag === name) {
          stack.length = k;
          break;
        }
      }
      continue;
    }

    const selfClosing = inner.endsWith('/');
    const body = selfClosing ? inner.slice(0, -1) : inner;
    const nameMatch = /^([:A-Za-z_][-.:\w]*)/.exec(body);
    if (!nameMatch) continue;
    const tag = nameMatch[1].toLowerCase();
    const node = { tag, attrs: parseAttrs(body.slice(nameMatch[1].length)), children: [], text: '' };
    stack[stack.length - 1].children.push(node);

    // `<style>` and `<script>` hold text that is not markup, so their content is
    // taken verbatim rather than scanned for tags.
    if (tag === 'style' || tag === 'script') {
      const close = source.toLowerCase().indexOf(`</${tag}`, i);
      node.text = source.slice(i, close === -1 ? source.length : close);
      i = close === -1 ? source.length : source.indexOf('>', close) + 1;
      continue;
    }

    if (!selfClosing && !VOID_TAGS.has(tag)) stack.push(node);
  }

  return root;
}

/**
 * Every node in the tree, depth first, root excluded.
 *
 * Iterative rather than recursive. A recursive walk blew the call stack at
 * around five thousand levels of nesting, and while nothing a person draws is
 * nested that deeply, a generated or hostile file can be, and `RangeError:
 * Maximum call stack size exceeded` is a useless thing to hand somebody who
 * asked whether their logo was any good.
 */
export function walk(node, visit) {
  const stack = [...node.children].reverse().map((c) => ({ node: c, depth: 0 }));
  while (stack.length) {
    const { node: current, depth } = stack.pop();
    visit(current, depth);
    for (let i = current.children.length - 1; i >= 0; i--) {
      stack.push({ node: current.children[i], depth: depth + 1 });
    }
  }
}

/** The first `<svg>` element, or null. */
export function svgRoot(source) {
  const doc = typeof source === 'string' ? parseXml(source) : source;
  let found = null;
  walk(doc, (n) => {
    if (!found && n.tag === 'svg') found = n;
  });
  return found;
}

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

const NUM = /[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g;

/** Every number in a string, in order. */
export function numbers(s) {
  if (!s) return [];
  return (String(s).match(NUM) ?? []).map(Number).filter((n) => Number.isFinite(n));
}

/**
 * A length attribute as a user-unit number.
 *
 * Percentages return null rather than 0: a width of "100%" is unknown, not
 * empty, and treating it as zero silently produces a mark with no size.
 */
export function length(value, fallback = null) {
  if (value == null || value === '') return fallback;
  const s = String(value).trim();
  if (s.endsWith('%')) return null;
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return fallback;
  // px, pt, mm and the rest are converted at the CSS reference of 96dpi. A logo
  // almost always uses bare user units, so this is a courtesy, not a load path.
  const unit = s.replace(/^[-+.\d eE]+/, '').toLowerCase();
  const per = { '': 1, px: 1, pt: 96 / 72, pc: 16, in: 96, cm: 96 / 2.54, mm: 96 / 25.4, q: 96 / 101.6 };
  return unit in per ? n * per[unit] : n;
}

// ---------------------------------------------------------------------------
// Matrices, as [a, b, c, d, e, f]
// ---------------------------------------------------------------------------

export const IDENTITY = Object.freeze([1, 0, 0, 1, 0, 0]);

export function multiply(m, n) {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}

export function applyToPoint(m, x, y) {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

/**
 * How much this matrix scales lengths.
 *
 * Stroke width scales by the geometric mean of the two axis scales under a
 * non-uniform transform, which is what a renderer does, so a minimum-stroke
 * check has to use the same number rather than picking one axis.
 */
export function matrixScale(m) {
  return Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 0;
}

const DEG = Math.PI / 180;

/** Parse an SVG `transform` list into one matrix. */
export function parseTransform(value) {
  if (!value) return [...IDENTITY];
  let m = [...IDENTITY];
  const re = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;
  let t;
  while ((t = re.exec(value))) {
    const a = numbers(t[2]);
    switch (t[1]) {
      case 'matrix':
        if (a.length >= 6) m = multiply(m, a.slice(0, 6));
        break;
      case 'translate':
        m = multiply(m, [1, 0, 0, 1, a[0] ?? 0, a[1] ?? 0]);
        break;
      case 'scale': {
        const sx = a[0] ?? 1;
        m = multiply(m, [sx, 0, 0, a.length > 1 ? a[1] : sx, 0, 0]);
        break;
      }
      case 'rotate': {
        const r = (a[0] ?? 0) * DEG;
        const cos = Math.cos(r);
        const sin = Math.sin(r);
        if (a.length >= 3) {
          m = multiply(m, [1, 0, 0, 1, a[1], a[2]]);
          m = multiply(m, [cos, sin, -sin, cos, 0, 0]);
          m = multiply(m, [1, 0, 0, 1, -a[1], -a[2]]);
        } else {
          m = multiply(m, [cos, sin, -sin, cos, 0, 0]);
        }
        break;
      }
      case 'skewX':
        m = multiply(m, [1, 0, Math.tan((a[0] ?? 0) * DEG), 1, 0, 0]);
        break;
      case 'skewY':
        m = multiply(m, [1, Math.tan((a[0] ?? 0) * DEG), 0, 1, 0, 0]);
        break;
    }
  }
  return m;
}

// ---------------------------------------------------------------------------
// Path data
// ---------------------------------------------------------------------------

/**
 * An elliptical arc as up to four cubics.
 *
 * Endpoint to centre parameterisation exactly as the SVG specification's
 * implementation notes give it (F.6.5), then one cubic per quarter turn or
 * less, where the standard 4/3*tan(theta/4) control-point distance is accurate
 * to about one part in ten thousand. Doing this at parse time means nothing
 * downstream, bounding boxes, transforms, rounding, has to understand arcs.
 */
function arcToCubics(x0, y0, rx, ry, angleDeg, largeArc, sweep, x, y) {
  if (x0 === x && y0 === y) return [];
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  // A zero radius is a straight line, per the specification.
  if (rx === 0 || ry === 0) return [['L', x, y]];

  const phi = angleDeg * DEG;
  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);

  const dx2 = (x0 - x) / 2;
  const dy2 = (y0 - y) / 2;
  const x1 = cosP * dx2 + sinP * dy2;
  const y1 = -sinP * dx2 + cosP * dy2;

  // Scale the radii up when they are too small to span the endpoints, which the
  // specification requires rather than treating as an error.
  const lambda = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry);
  if (lambda > 1) {
    const s = Math.sqrt(lambda);
    rx *= s;
    ry *= s;
  }

  const sign = largeArc === sweep ? -1 : 1;
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  const den = rx * rx * y1 * y1 + ry * ry * x1 * x1;
  const co = sign * Math.sqrt(Math.max(0, num / den));
  const cx1 = (co * rx * y1) / ry;
  const cy1 = (-co * ry * x1) / rx;

  const cx = cosP * cx1 - sinP * cy1 + (x0 + x) / 2;
  const cy = sinP * cx1 + cosP * cy1 + (y0 + y) / 2;

  const angle = (ux, uy, vx, vy) => {
    const dot = ux * vx + uy * vy;
    const len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
    let a = Math.acos(Math.min(1, Math.max(-1, dot / len)));
    if (ux * vy - uy * vx < 0) a = -a;
    return a;
  };

  const theta = angle(1, 0, (x1 - cx1) / rx, (y1 - cy1) / ry);
  let delta = angle((x1 - cx1) / rx, (y1 - cy1) / ry, (-x1 - cx1) / rx, (-y1 - cy1) / ry);
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  if (sweep && delta < 0) delta += 2 * Math.PI;

  const steps = Math.max(1, Math.ceil(Math.abs(delta) / (Math.PI / 2)));
  const step = delta / steps;
  const k = (4 / 3) * Math.tan(step / 4);

  const out = [];
  let t0 = theta;
  let px = x0;
  let py = y0;
  for (let i = 0; i < steps; i++) {
    const t1 = t0 + step;
    const cos0 = Math.cos(t0);
    const sin0 = Math.sin(t0);
    const cos1 = Math.cos(t1);
    const sin1 = Math.sin(t1);

    const e = (ct, st) => [cosP * rx * ct - sinP * ry * st + cx, sinP * rx * ct + cosP * ry * st + cy];
    const d = (ct, st) => [-cosP * rx * st - sinP * ry * ct, -sinP * rx * st + cosP * ry * ct];

    const [ex1, ey1] = e(cos1, sin1);
    const [dx0, dy0] = d(cos0, sin0);
    const [dx1, dy1] = d(cos1, sin1);

    out.push(['C', px + k * dx0, py + k * dy0, ex1 - k * dx1, ey1 - k * dy1, ex1, ey1]);
    px = ex1;
    py = ey1;
    t0 = t1;
  }
  // The last point is the requested endpoint exactly, not an accumulation of
  // trigonometry, so a closed shape closes.
  const last = out[out.length - 1];
  if (last) {
    last[5] = x;
    last[6] = y;
  }
  return out;
}

/**
 * Path data as absolute `M`, `L`, `C`, `Q` and `Z` segments.
 *
 * Every relative command, shorthand and arc is resolved here so that bounding
 * boxes, transforms and rounding each have one shape to handle instead of
 * twenty. Segments are arrays: `['M', x, y]`, `['L', x, y]`,
 * `['C', x1, y1, x2, y2, x, y]`, `['Q', x1, y1, x, y]`, `['Z']`.
 */
export function parsePath(d) {
  const out = [];
  if (!d) return out;

  // Any letter is a token, not just the twenty valid ones. Matching only the
  // valid set drops an unknown command on the floor and silently reinterprets
  // its arguments as coordinates for whatever came before, which turns a
  // corrupt path into a plausible wrong one. Better to see it and stop.
  const tokens = String(d).match(/[A-Za-z]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g) ?? [];
  let i = 0;
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  // The reflected control point for S and T, which is only defined when the
  // previous command was of the matching kind.
  let lastC = null;
  let lastQ = null;
  let cmd = null;

  const num = () => Number(tokens[i++]);
  const isCmd = (t) => typeof t === 'string' && /^[A-Za-z]$/.test(t);

  while (i < tokens.length) {
    if (isCmd(tokens[i])) {
      cmd = tokens[i++];
    } else if (cmd == null) {
      // Numbers before any command: nothing sensible to do, so stop rather than
      // invent a starting point.
      break;
    } else if (cmd === 'M') {
      cmd = 'L';
    } else if (cmd === 'm') {
      cmd = 'l';
    }

    const rel = cmd === cmd.toLowerCase();
    const ox = rel ? x : 0;
    const oy = rel ? y : 0;
    const before = out.length;

    switch (cmd.toUpperCase()) {
      case 'M': {
        x = num() + ox;
        y = num() + oy;
        startX = x;
        startY = y;
        out.push(['M', x, y]);
        lastC = lastQ = null;
        break;
      }
      case 'L': {
        x = num() + ox;
        y = num() + oy;
        out.push(['L', x, y]);
        lastC = lastQ = null;
        break;
      }
      case 'H': {
        x = num() + ox;
        out.push(['L', x, y]);
        lastC = lastQ = null;
        break;
      }
      case 'V': {
        y = num() + oy;
        out.push(['L', x, y]);
        lastC = lastQ = null;
        break;
      }
      case 'C': {
        const x1 = num() + ox;
        const y1 = num() + oy;
        const x2 = num() + ox;
        const y2 = num() + oy;
        x = num() + ox;
        y = num() + oy;
        out.push(['C', x1, y1, x2, y2, x, y]);
        lastC = [x2, y2];
        lastQ = null;
        break;
      }
      case 'S': {
        const [rx, ry] = lastC ? [2 * x - lastC[0], 2 * y - lastC[1]] : [x, y];
        const x2 = num() + ox;
        const y2 = num() + oy;
        x = num() + ox;
        y = num() + oy;
        out.push(['C', rx, ry, x2, y2, x, y]);
        lastC = [x2, y2];
        lastQ = null;
        break;
      }
      case 'Q': {
        const x1 = num() + ox;
        const y1 = num() + oy;
        x = num() + ox;
        y = num() + oy;
        out.push(['Q', x1, y1, x, y]);
        lastQ = [x1, y1];
        lastC = null;
        break;
      }
      case 'T': {
        const [rx, ry] = lastQ ? [2 * x - lastQ[0], 2 * y - lastQ[1]] : [x, y];
        x = num() + ox;
        y = num() + oy;
        out.push(['Q', rx, ry, x, y]);
        lastQ = [rx, ry];
        lastC = null;
        break;
      }
      case 'A': {
        const rx = num();
        const ry = num();
        const rot = num();
        // The flags are single digits and may be written unseparated, but the
        // tokeniser splits on digit boundaries only for signs and points, so a
        // run like "1 0 1" arrives as three tokens either way.
        const large = num();
        const sweep = num();
        const ex = num() + ox;
        const ey = num() + oy;
        for (const seg of arcToCubics(x, y, rx, ry, rot, Boolean(large), Boolean(sweep), ex, ey)) out.push(seg);
        x = ex;
        y = ey;
        lastC = lastQ = null;
        break;
      }
      case 'Z': {
        out.push(['Z']);
        x = startX;
        y = startY;
        lastC = lastQ = null;
        break;
      }
      default:
        // An unknown letter would otherwise loop forever consuming nothing.
        return out;
    }

    // Only what this command just pushed is checked. An earlier version
    // rescanned the whole accumulated path every time, which is quadratic: a
    // 16,000 segment path took 2.1 seconds and a 100,000 segment one took 108.
    // Nothing hand-drawn is that long, but an auto-traced raster is, and
    // hanging for two minutes before reporting "this looks auto-traced" is the
    // worst possible way to deliver that finding.
    let bad = false;
    for (let k = before; k < out.length; k++) {
      if (out[k].slice(1).some((n) => !Number.isFinite(n))) {
        bad = true;
        break;
      }
    }
    if (bad) {
      // A truncated command produced NaN. Drop what it pushed and stop: a
      // partial path is measurable, a path full of NaN turns every later number
      // into NaN.
      out.length = before;
      return out;
    }
  }

  return out;
}

/** Segments back to a `d` string, at a stated precision. */
export function pathToString(segments, precision = 3) {
  const f = (n) => {
    const r = Number(n.toFixed(precision));
    return Object.is(r, -0) ? '0' : String(r);
  };
  return segments
    .map((s) => (s[0] === 'Z' ? 'Z' : s[0] + s.slice(1).map(f).join(' ')))
    .join(' ')
    .trim();
}

function cubicExtrema(p0, p1, p2, p3) {
  // B'(t) = at^2 + bt + c, with the usual cubic Bezier derivative coefficients.
  const a = 3 * (-p0 + 3 * p1 - 3 * p2 + p3);
  const b = 6 * (p0 - 2 * p1 + p2);
  const c = 3 * (p1 - p0);
  const ts = [];
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) > 1e-12) ts.push(-c / b);
  } else {
    const disc = b * b - 4 * a * c;
    if (disc >= 0) {
      const s = Math.sqrt(disc);
      ts.push((-b + s) / (2 * a), (-b - s) / (2 * a));
    }
  }
  const at = (t) => {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  };
  return ts.filter((t) => t > 0 && t < 1).map(at);
}

function quadExtrema(p0, p1, p2) {
  const den = p0 - 2 * p1 + p2;
  if (Math.abs(den) < 1e-12) return [];
  const t = (p0 - p1) / den;
  if (!(t > 0 && t < 1)) return [];
  const u = 1 - t;
  return [u * u * p0 + 2 * u * t * p1 + t * t * p2];
}

/**
 * The exact bounding box of a set of segments.
 *
 * Curve extrema are solved analytically rather than sampled, because a sampled
 * bounding box is wrong by an amount nobody can predict, and this number ends up
 * being the clear space rule printed in a brand book.
 */
export function segmentsBBox(segments) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const add = (x, y) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };

  let x = 0;
  let y = 0;
  for (const s of segments) {
    switch (s[0]) {
      case 'M':
      case 'L':
        add(s[1], s[2]);
        x = s[1];
        y = s[2];
        break;
      case 'C':
        add(s[5], s[6]);
        for (const v of cubicExtrema(x, s[1], s[3], s[5])) add(v, y);
        for (const v of cubicExtrema(y, s[2], s[4], s[6])) add(x, v);
        x = s[5];
        y = s[6];
        break;
      case 'Q':
        add(s[3], s[4]);
        for (const v of quadExtrema(x, s[1], s[3])) add(v, y);
        for (const v of quadExtrema(y, s[2], s[4])) add(x, v);
        x = s[3];
        y = s[4];
        break;
      default:
        break;
    }
  }

  if (!Number.isFinite(minX)) return null;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** Apply a matrix to every point in a path. */
export function transformSegments(segments, m) {
  return segments.map((s) => {
    if (s[0] === 'Z') return ['Z'];
    const out = [s[0]];
    for (let i = 1; i < s.length; i += 2) {
      const [px, py] = applyToPoint(m, s[i], s[i + 1]);
      out.push(px, py);
    }
    return out;
  });
}

/** The union of two boxes, either of which may be null. */
export function unionBox(a, b) {
  if (!a) return b;
  if (!b) return a;
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, width: Math.max(a.x + a.width, b.x + b.width) - x, height: Math.max(a.y + a.height, b.y + b.height) - y };
}

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

/** Corner arcs for a rounded rectangle, as cubics. */
function roundedRect(x, y, w, h, rx, ry) {
  const k = 0.5522847498307936;
  const cx = rx * k;
  const cy = ry * k;
  return [
    ['M', x + rx, y],
    ['L', x + w - rx, y],
    ['C', x + w - rx + cx, y, x + w, y + ry - cy, x + w, y + ry],
    ['L', x + w, y + h - ry],
    ['C', x + w, y + h - ry + cy, x + w - rx + cx, y + h, x + w - rx, y + h],
    ['L', x + rx, y + h],
    ['C', x + rx - cx, y + h, x, y + h - ry + cy, x, y + h - ry],
    ['L', x, y + ry],
    ['C', x, y + ry - cy, x + rx - cx, y, x + rx, y],
    ['Z'],
  ];
}

/** An ellipse as four cubics. */
function ellipse(cx, cy, rx, ry) {
  const k = 0.5522847498307936;
  const ox = rx * k;
  const oy = ry * k;
  return [
    ['M', cx - rx, cy],
    ['C', cx - rx, cy - oy, cx - ox, cy - ry, cx, cy - ry],
    ['C', cx + ox, cy - ry, cx + rx, cy - oy, cx + rx, cy],
    ['C', cx + rx, cy + oy, cx + ox, cy + ry, cx, cy + ry],
    ['C', cx - ox, cy + ry, cx - rx, cy + oy, cx - rx, cy],
    ['Z'],
  ];
}

/**
 * Any basic shape as path segments.
 *
 * Returns null for anything that does not paint geometry, so a caller can treat
 * "not a shape" and "an empty shape" as the same thing.
 */
export function shapeToSegments(tag, attrs) {
  const n = (k, fallback = 0) => length(attrs[k], fallback) ?? fallback;
  switch (tag) {
    case 'path':
      return attrs.d ? parsePath(attrs.d) : null;
    case 'rect': {
      const w = n('width');
      const h = n('height');
      if (!(w > 0 && h > 0)) return null;
      const x = n('x');
      const y = n('y');
      // An `rx` with no `ry` means both, and vice versa, which is easy to miss
      // and produces square corners on a mark that was drawn with round ones.
      let rx = attrs.rx != null ? n('rx') : attrs.ry != null ? n('ry') : 0;
      let ry = attrs.ry != null ? n('ry') : attrs.rx != null ? n('rx') : 0;
      rx = Math.min(Math.max(rx, 0), w / 2);
      ry = Math.min(Math.max(ry, 0), h / 2);
      if (rx <= 0 || ry <= 0) {
        return [['M', x, y], ['L', x + w, y], ['L', x + w, y + h], ['L', x, y + h], ['Z']];
      }
      return roundedRect(x, y, w, h, rx, ry);
    }
    case 'circle': {
      const r = n('r');
      return r > 0 ? ellipse(n('cx'), n('cy'), r, r) : null;
    }
    case 'ellipse': {
      const rx = n('rx');
      const ry = n('ry');
      return rx > 0 && ry > 0 ? ellipse(n('cx'), n('cy'), rx, ry) : null;
    }
    case 'line':
      return [['M', n('x1'), n('y1')], ['L', n('x2'), n('y2')]];
    case 'polygon':
    case 'polyline': {
      const pts = numbers(attrs.points);
      if (pts.length < 4) return null;
      const segs = [['M', pts[0], pts[1]]];
      for (let i = 2; i + 1 < pts.length; i += 2) segs.push(['L', pts[i], pts[i + 1]]);
      if (tag === 'polygon') segs.push(['Z']);
      return segs;
    }
    default:
      return null;
  }
}

const PAINTED = new Set(['path', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline']);

/** Presentation attributes, with an inline `style` winning as CSS does. */
function styleOf(attrs) {
  const out = { ...attrs };
  if (attrs.style) {
    for (const decl of attrs.style.split(';')) {
      const c = decl.indexOf(':');
      if (c > 0) out[decl.slice(0, c).trim().toLowerCase()] = decl.slice(c + 1).trim();
    }
  }
  return out;
}

/**
 * Every painted shape in the document, flattened, with its inherited transform
 * and resolved paint already applied.
 *
 * Inheritance is handled for the attributes that actually decide whether ink
 * lands on the page (`fill`, `stroke`, `stroke-width`, `opacity`, `display`),
 * because a group carrying `fill="#000"` over unpainted children is the single
 * most common way a real logo is written.
 */
export function collectShapes(source) {
  const doc = typeof source === 'string' ? parseXml(source) : source;
  const out = [];

  // An explicit stack, for the same reason `walk` has one: a deeply nested file
  // must produce a report, not a stack overflow.
  const visit = (startNode, startInherited) => {
    const stack = [{ node: startNode, inherited: startInherited }];
    while (stack.length) {
      const { node, inherited } = stack.pop();
      step(node, inherited, stack);
    }
  };

  const step = (node, inherited, stack) => {
    const s = styleOf(node.attrs);
    const own = {
      matrix: multiply(inherited.matrix, parseTransform(s.transform)),
      fill: s.fill ?? inherited.fill,
      stroke: s.stroke ?? inherited.stroke,
      strokeWidth: s['stroke-width'] != null ? length(s['stroke-width'], 1) ?? 1 : inherited.strokeWidth,
      hidden: inherited.hidden || s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0,
    };

    if (PAINTED.has(node.tag)) {
      const segments = shapeToSegments(node.tag, s);
      if (segments && segments.length) {
        const placed = transformSegments(segments, own.matrix);
        // A shape with no explicit fill is filled black, which is the SVG
        // initial value and the reason an unpainted path still shows up.
        const fill = own.fill ?? '#000000';
        const strokes = own.stroke && own.stroke !== 'none';
        out.push({
          tag: node.tag,
          attrs: s,
          matrix: own.matrix,
          segments: placed,
          bbox: segmentsBBox(placed),
          fill,
          stroke: strokes ? own.stroke : null,
          strokeWidth: strokes ? own.strokeWidth * matrixScale(own.matrix) : 0,
          hidden: own.hidden,
          paints: fill !== 'none' || strokes,
        });
      }
    }

    // `defs`, `clipPath`, `mask`, `marker` and `symbol` hold geometry that is
    // not painted where it sits. Counting it puts the ink bounds somewhere the
    // ink is not.
    if (['defs', 'clippath', 'mask', 'marker', 'symbol', 'pattern'].includes(node.tag)) return;
    for (let i = node.children.length - 1; i >= 0; i--) {
      stack.push({ node: node.children[i], inherited: own });
    }
  };

  const root = svgRoot(doc) ?? doc;
  for (const child of root.children) {
    visit(child, { matrix: [...IDENTITY], fill: undefined, stroke: undefined, strokeWidth: 1, hidden: false });
  }
  return out;
}

/** The declared `viewBox`, or null. */
export function viewBox(source) {
  const root = svgRoot(source);
  if (!root) return null;
  const v = numbers(root.attrs.viewBox);
  if (v.length === 4 && v[2] > 0 && v[3] > 0) return { x: v[0], y: v[1], width: v[2], height: v[3] };
  const w = length(root.attrs.width);
  const h = length(root.attrs.height);
  if (w > 0 && h > 0) return { x: 0, y: 0, width: w, height: h };
  return null;
}

/**
 * Where the ink actually is, in user units.
 *
 * Strokes are expanded by half their width on every side. That over-states a
 * mitred corner slightly and under-states a long spike, and the docblock says so
 * rather than the code pretending to an accuracy it does not have. For deciding
 * clear space and whether a mark is centred, half the stroke is the right call.
 */
export function inkBounds(source, { includeStroke = true } = {}) {
  let box = null;
  for (const shape of collectShapes(source)) {
    if (shape.hidden || !shape.paints || !shape.bbox) continue;
    let b = shape.bbox;
    if (includeStroke && shape.strokeWidth > 0) {
      const half = shape.strokeWidth / 2;
      b = { x: b.x - half, y: b.y - half, width: b.width + shape.strokeWidth, height: b.height + shape.strokeWidth };
    }
    box = unionBox(box, b);
  }
  return box;
}

// ---------------------------------------------------------------------------
// Structural description, for the audit
// ---------------------------------------------------------------------------

const EXTERNAL = /^(https?:)?\/\//i;

/**
 * The facts an audit needs about a file, gathered in one pass.
 *
 * This is deliberately a report rather than a verdict. Deciding that a `<text>`
 * element is fatal belongs to the auditor, which knows whether this file is a
 * candidate sketch or a master about to be shipped.
 */
export function describeSvg(source) {
  const doc = parseXml(source);
  const root = svgRoot(doc);
  const counts = {};
  const externalRefs = [];
  const idsDefined = new Set();
  const idsUsed = new Set();
  const paints = new Set();
  let nodes = 0;
  let styleText = '';

  walk(doc, (n) => {
    nodes++;
    counts[n.tag] = (counts[n.tag] ?? 0) + 1;
    if (n.attrs.id) idsDefined.add(n.attrs.id);
    if (n.tag === 'style') styleText += n.text;

    for (const [k, v] of Object.entries(n.attrs)) {
      if (typeof v !== 'string') continue;
      const local = /^(href|xlink:href|src)$/i.test(k);
      if (local && (EXTERNAL.test(v) || /^(file|ftp):/i.test(v))) externalRefs.push(v);
      if (local && v.startsWith('#')) idsUsed.add(v.slice(1));
      for (const m of v.matchAll(/url\(\s*(['"]?)([^)'"]+)\1\s*\)/gi)) {
        if (m[2].startsWith('#')) idsUsed.add(m[2].slice(1));
        else if (EXTERNAL.test(m[2])) externalRefs.push(m[2]);
      }
      if (/^(fill|stroke|stop-color|flood-color)$/i.test(k) && v && !v.startsWith('url(')) paints.add(v.trim());
    }
    const s = styleOf(n.attrs);
    for (const key of ['fill', 'stroke', 'stop-color']) {
      if (s[key] && !s[key].startsWith('url(')) paints.add(s[key].trim());
    }
  });

  const shapes = collectShapes(doc);
  const painting = shapes.filter((s) => !s.hidden && s.paints);
  const segCount = painting.reduce((n, s) => n + s.segments.length, 0);
  const strokeWidths = painting.filter((s) => s.strokeWidth > 0).map((s) => s.strokeWidth);

  return {
    hasRoot: Boolean(root),
    viewBox: viewBox(doc),
    width: root ? length(root.attrs.width) : null,
    height: root ? length(root.attrs.height) : null,
    counts,
    nodes,
    shapes: painting.length,
    segments: segCount,
    ink: inkBounds(doc),
    inkNoStroke: inkBounds(doc, { includeStroke: false }),
    strokeWidths,
    minStrokeWidth: strokeWidths.length ? Math.min(...strokeWidths) : null,
    paints: [...paints],
    externalRefs: [...new Set(externalRefs)],
    danglingRefs: [...idsUsed].filter((id) => !idsDefined.has(id)),
    unusedIds: [...idsDefined].filter((id) => !idsUsed.has(id)),
    hasText: Boolean(counts.text || counts.tspan || counts.textpath),
    hasImage: Boolean(counts.image),
    hasScript: Boolean(counts.script),
    hasForeignObject: Boolean(counts.foreignobject),
    hasStyleBlock: Boolean(counts.style),
    styleText: styleText.trim(),
    usesCurrentColor: [...paints].some((p) => /currentcolor/i.test(p)),
    usesGradient: Boolean(counts.lineargradient || counts.radialgradient),
  };
}

export default {
  parseXml,
  walk,
  svgRoot,
  numbers,
  length,
  IDENTITY,
  multiply,
  applyToPoint,
  matrixScale,
  parseTransform,
  parsePath,
  pathToString,
  segmentsBBox,
  transformSegments,
  unionBox,
  shapeToSegments,
  collectShapes,
  viewBox,
  inkBounds,
  describeSvg,
};
