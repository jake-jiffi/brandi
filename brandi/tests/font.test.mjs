import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as F from '../scripts/font.mjs';

const close = (a, b, tol = 1e-9, msg) =>
  assert.ok(Math.abs(a - b) <= tol, msg ?? `expected ${a} within ${tol} of ${b}`);

// ---------------------------------------------------------------------------
// A font, built byte by byte
//
// Almost everything here can be proved against a font whose every number is
// known in advance, which is the only way to assert an exact path string or an
// exact kern value. Downloading a real face proves the parser survives contact
// with a real one; it cannot prove the arithmetic, because nobody knows what
// the answer should be until the parser says so.
// ---------------------------------------------------------------------------

const u8 = (v) => [v & 0xff];
const u16 = (v) => [(v >>> 8) & 0xff, v & 0xff];
const i16 = (v) => u16(v < 0 ? v + 0x10000 : v);
const u32 = (v) => [(v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff];
const tag = (s) => [...s].map((c) => c.charCodeAt(0));
const pad4 = (a) => (a.length % 4 === 0 ? a : [...a, ...new Array(4 - (a.length % 4)).fill(0)]);

/** A simple glyph, with every delta written long so the encoder stays readable. */
function simpleGlyph(contours) {
  const pts = contours.flat();
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const out = [
    ...i16(contours.length),
    // The header box is the box of the points, control points included, which
    // is what every font compiler writes here.
    ...i16(Math.min(...xs)),
    ...i16(Math.min(...ys)),
    ...i16(Math.max(...xs)),
    ...i16(Math.max(...ys)),
  ];
  let end = -1;
  for (const c of contours) {
    end += c.length;
    out.push(...u16(end));
  }
  out.push(...u16(0)); // no hinting instructions
  for (const p of pts) out.push(...u8(p.on ? 0x01 : 0x00));
  let px = 0;
  for (const p of pts) {
    out.push(...i16(p.x - px));
    px = p.x;
  }
  let py = 0;
  for (const p of pts) {
    out.push(...i16(p.y - py));
    py = p.y;
  }
  return out;
}

function compositeGlyph(components, bbox) {
  const out = [...i16(-1), ...i16(bbox[0]), ...i16(bbox[1]), ...i16(bbox[2]), ...i16(bbox[3])];
  components.forEach((c, i) => {
    let flags = 0x0001 | 0x0002; // args are words, and they are x/y values
    if (i < components.length - 1) flags |= 0x0020; // MORE_COMPONENTS
    if (c.scale !== undefined) flags |= 0x0008; // WE_HAVE_A_SCALE
    out.push(...u16(flags), ...u16(c.glyphIndex), ...i16(c.dx), ...i16(c.dy));
    if (c.scale !== undefined) out.push(...i16(Math.round(c.scale * 16384)));
  });
  return out;
}

/**
 * cmap format 4, using idDelta where the glyph ids run on and a glyphIdArray
 * where they do not, which is what a real font does and what exercises both
 * halves of the lookup.
 */
function cmapTable(map) {
  const cps = [...map.keys()].sort((a, b) => a - b);
  const segs = [];
  for (let i = 0; i < cps.length; ) {
    let j = i;
    while (j + 1 < cps.length && cps[j + 1] === cps[j] + 1) j++;
    segs.push({ start: cps[i], end: cps[j], gids: cps.slice(i, j + 1).map((c) => map.get(c)) });
    i = j + 1;
  }
  segs.push({ start: 0xffff, end: 0xffff, gids: [0] });

  const segCount = segs.length;
  const glyphIdArray = [];
  const deltas = [];
  const rangeOffsets = [];
  segs.forEach((s, i) => {
    const contiguous = s.gids.every((g, k) => g === s.gids[0] + k);
    if (contiguous) {
      deltas.push((s.gids[0] - s.start) & 0xffff);
      rangeOffsets.push(0);
    } else {
      const k = glyphIdArray.length;
      glyphIdArray.push(...s.gids);
      deltas.push(0);
      // Measured from this slot to the segment's first glyph id.
      rangeOffsets.push(2 * (segCount + k - i));
    }
  });

  const sub = [
    ...u16(4),
    ...u16(16 + segCount * 8 + glyphIdArray.length * 2),
    ...u16(0),
    ...u16(segCount * 2),
    ...u16(0),
    ...u16(0),
    ...u16(0),
    ...segs.flatMap((s) => u16(s.end)),
    ...u16(0), // reservedPad
    ...segs.flatMap((s) => u16(s.start)),
    ...deltas.flatMap(u16),
    ...rangeOffsets.flatMap(u16),
    ...glyphIdArray.flatMap(u16),
  ];
  return [...u16(0), ...u16(1), ...u16(3), ...u16(1), ...u32(12), ...sub];
}

function nameTable(family) {
  const utf16 = [...family].flatMap((c) => u16(c.charCodeAt(0)));
  const records = [...u16(3), ...u16(1), ...u16(0x409), ...u16(1), ...u16(utf16.length), ...u16(0)];
  return [...u16(0), ...u16(1), ...u16(6 + 12), ...records, ...utf16];
}

/** The OpenType `kern` table, one horizontal format 0 subtable. */
function kernTable(pairs) {
  const sorted = [...pairs].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const body = sorted.flatMap(([l, r, v]) => [...u16(l), ...u16(r), ...i16(v)]);
  return [
    ...u16(0),
    ...u16(1),
    ...u16(0),
    ...u16(14 + body.length),
    ...u16(0x0001), // format 0, horizontal
    ...u16(sorted.length),
    ...u16(0),
    ...u16(0),
    ...u16(0),
    ...body,
  ];
}

function pairPos1(pairs) {
  const byLeft = new Map();
  for (const [l, r, v] of pairs) {
    if (!byLeft.has(l)) byLeft.set(l, []);
    byLeft.get(l).push([r, v]);
  }
  const lefts = [...byLeft.keys()].sort((a, b) => a - b);
  const coverage = [...u16(1), ...u16(lefts.length), ...lefts.flatMap(u16)];
  const sets = lefts.map((l) => {
    const rs = byLeft.get(l).sort((a, b) => a[0] - b[0]);
    return [...u16(rs.length), ...rs.flatMap(([r, v]) => [...u16(r), ...i16(v)])];
  });
  const covOff = 10 + lefts.length * 2;
  let o = covOff + coverage.length;
  const setOffsets = [];
  for (const s of sets) {
    setOffsets.push(...u16(o));
    o += s.length;
  }
  return [
    ...u16(1),
    ...u16(covOff),
    ...u16(0x0004), // valueFormat1: xAdvance only
    ...u16(0),
    ...u16(lefts.length),
    ...setOffsets,
    ...coverage,
    ...sets.flat(),
  ];
}

function pairPos2({ coverageGlyphs, class1Ranges, class2Ranges, class1Count, class2Count, values }) {
  const coverage = [...u16(1), ...u16(coverageGlyphs.length), ...coverageGlyphs.flatMap(u16)];
  const classDef = (ranges) => [
    ...u16(2),
    ...u16(ranges.length),
    ...ranges.flatMap(([s, e, c]) => [...u16(s), ...u16(e), ...u16(c)]),
  ];
  const cd1 = classDef(class1Ranges);
  const cd2 = classDef(class2Ranges);
  const records = [];
  for (let i = 0; i < class1Count; i++) {
    for (let j = 0; j < class2Count; j++) records.push(...i16(values[i]?.[j] ?? 0));
  }
  const covOff = 16 + records.length;
  const cd1Off = covOff + coverage.length;
  const cd2Off = cd1Off + cd1.length;
  return [
    ...u16(2),
    ...u16(covOff),
    ...u16(0x0004),
    ...u16(0),
    ...u16(cd1Off),
    ...u16(cd2Off),
    ...u16(class1Count),
    ...u16(class2Count),
    ...records,
    ...coverage,
    ...cd1,
    ...cd2,
  ];
}

/** Wrap a subtable in an Extension Positioning record, as larger fonts do. */
const extension = (inner) => [...u16(1), ...u16(2), ...u32(8), ...inner];

/** lookups: [{ type, subtables: [bytes] }], all reached by one `kern` feature. */
function gposTable(lookups) {
  const blocks = lookups.map(({ type = 2, subtables }) => {
    let o = 6 + subtables.length * 2;
    const offsets = [];
    for (const s of subtables) {
      offsets.push(...u16(o));
      o += s.length;
    }
    return [...u16(type), ...u16(0), ...u16(subtables.length), ...offsets, ...subtables.flat()];
  });
  let o = 2 + blocks.length * 2;
  const lookupOffsets = [];
  for (const b of blocks) {
    lookupOffsets.push(...u16(o));
    o += b.length;
  }
  const lookupList = [...u16(blocks.length), ...lookupOffsets, ...blocks.flat()];

  const feature = [...u16(0), ...u16(lookups.length), ...lookups.flatMap((_, i) => u16(i))];
  const featureList = [...u16(1), ...tag('kern'), ...u16(8), ...feature];

  const langSys = [...u16(0), ...u16(0xffff), ...u16(1), ...u16(0)];
  const script = [...u16(4), ...u16(0), ...langSys];
  const scriptList = [...u16(1), ...tag('DFLT'), ...u16(8), ...script];

  const scriptOff = 10;
  const featureOff = scriptOff + scriptList.length;
  const lookupOff = featureOff + featureList.length;
  return [
    ...u16(1),
    ...u16(0),
    ...u16(scriptOff),
    ...u16(featureOff),
    ...u16(lookupOff),
    ...scriptList,
    ...featureList,
    ...lookupList,
  ];
}

/**
 * Assemble a whole sfnt. Only the tables this parser reads are written, which
 * is exactly the point: a font missing everything else must still set type.
 */
function buildFont({
  unitsPerEm = 1000,
  glyphs,
  cmap = new Map(),
  family = 'Synthetic Sans',
  locaFormat = 1,
  kern = null,
  gpos = null,
  sfntVersion = 0x00010000,
  numberOfHMetrics = null,
} = {}) {
  const numGlyphs = glyphs.length;
  const metrics = numberOfHMetrics ?? numGlyphs;

  const glyf = [];
  const offsets = [0];
  for (const g of glyphs) {
    glyf.push(...pad4(g.data ?? []));
    offsets.push(glyf.length);
  }
  const loca =
    locaFormat === 0 ? offsets.flatMap((o) => u16(o / 2)) : offsets.flatMap((o) => u32(o));

  const head = [
    ...u32(0x00010000),
    ...u32(0x00010000),
    ...u32(0),
    ...u32(0x5f0f3cf5),
    ...u16(0),
    ...u16(unitsPerEm),
    ...new Array(16).fill(0),
    ...i16(0),
    ...i16(0),
    ...i16(unitsPerEm),
    ...i16(unitsPerEm),
    ...u16(0),
    ...u16(8),
    ...i16(2),
    ...i16(locaFormat),
    ...i16(0),
  ];
  const maxp = [...u32(0x00010000), ...u16(numGlyphs), ...new Array(26).fill(0)];
  // 24 bytes of metrics nothing here reads sit between lineGap and
  // numberOfHMetrics, which has to land at offset 34 for a 36-byte table.
  const hhea = [
    ...u32(0x00010000),
    ...i16(800),
    ...i16(-200),
    ...i16(0),
    ...new Array(24).fill(0),
    ...u16(metrics),
  ];
  // Glyphs past numberOfHMetrics store only a left side bearing, and inherit
  // the last full record's advance.
  const hmtx = [
    ...glyphs.slice(0, metrics).flatMap((g) => [...u16(g.advance ?? 0), ...i16(0)]),
    ...glyphs.slice(metrics).flatMap(() => i16(0)),
  ];

  const built = {
    head,
    maxp,
    hhea,
    hmtx,
    loca,
    glyf,
    cmap: cmapTable(cmap),
    name: nameTable(family),
  };
  if (kern) built.kern = kernTable(kern);
  if (gpos) built.GPOS = gposTable(gpos);

  const tags = Object.keys(built).sort();
  let offset = 12 + tags.length * 16;
  const directory = [];
  const body = [];
  for (const t of tags) {
    const data = pad4(built[t]);
    directory.push(...tag(t.padEnd(4, ' ')), ...u32(0), ...u32(offset), ...u32(built[t].length));
    body.push(...data);
    offset += data.length;
  }
  const entrySelector = Math.floor(Math.log2(tags.length));
  const searchRange = 16 * 2 ** entrySelector;
  return Buffer.from([
    ...(typeof sfntVersion === 'string' ? tag(sfntVersion) : u32(sfntVersion)),
    ...u16(tags.length),
    ...u16(searchRange),
    ...u16(entrySelector),
    ...u16(tags.length * 16 - searchRange),
    ...directory,
    ...body,
  ]);
}

// A square, a triangle and an empty glyph, mapped to A, B and space.
const SQUARE = [
  [
    { x: 100, y: 100, on: true },
    { x: 600, y: 100, on: true },
    { x: 600, y: 700, on: true },
    { x: 100, y: 700, on: true },
  ],
];
const TRIANGLE = [
  [
    { x: 0, y: 0, on: true },
    { x: 500, y: 0, on: true },
    { x: 250, y: 600, on: true },
  ],
];

const basicFont = () =>
  F.parseFont(
    buildFont({
      glyphs: [
        { advance: 500, data: [] }, // .notdef
        { advance: 700, data: simpleGlyph(SQUARE) },
        { advance: 550, data: simpleGlyph(TRIANGLE) },
        { advance: 250, data: [] }, // space
      ],
      cmap: new Map([
        [0x41, 1],
        [0x42, 2],
        [0x20, 3],
      ]),
    }),
  );

// ---------------------------------------------------------------------------
// A real font, when the network allows it
// ---------------------------------------------------------------------------

let bitter = null;
let bitterWhy = '';

/**
 * The licence tiers Google serves today, read once.
 *
 * Every live licence assertion is made against this map rather than against a
 * call inside the test. Asking Google from inside a test made the suite fail on
 * a transient ETIMEDOUT under load, and a suite that goes red because a network
 * hiccup is a suite people learn to ignore. One pass, one failure point, and a
 * skip if it does not come back.
 */
const LIVE_TIERS = [
  // Breadth across the open catalogue, because a gate that refuses open faces
  // is worse than no gate: the person it stops will simply switch it off.
  ['Inter', 'public'],
  ['Bitter', 'public'],
  ['Roboto', 'public'],
  ['Noto Sans', 'public'],
  ['Open Sans', 'public'],
  ['Playfair Display', 'public'],
  ['EB Garamond', 'public'],
  ['Jost', 'public'],
  // Monotype, delivered to Workspace subscribers and answering HTTP 200.
  ['Gill Sans', 'commercial'],
  ['Avenir', 'commercial'],
  // Google's own, one caught by the banner and two only by name.
  ['Product Sans', 'restricted'],
  ['Google Sans', 'restricted'],
  ['Google Sans Text', 'restricted'],
  ['Notafont Grotesk', 'missing'],
];

let liveTiers = null;
let liveWhy = '';
let licenceRequest = null;
let googleSansCss = '';

before(async () => {
  try {
    const cacheDir = path.join(os.tmpdir(), 'brandi-font-test-cache');
    const got = await F.fetchGoogleFont('Bitter', { weight: 700, cacheDir });
    bitter = F.parseFont(got.buffer);
  } catch (e) {
    bitterWhy = e.message;
  }

  const real = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    if (!licenceRequest) licenceRequest = { url: String(url), init };
    return real(url, init);
  };
  try {
    const tiers = new Map();
    for (const [family] of LIVE_TIERS) tiers.set(family, await F.checkGoogleFontLicence(family));
    googleSansCss = await (await real('https://fonts.googleapis.com/css2?family=Google+Sans', {
      headers: { 'User-Agent': MODERN_UA },
    })).text();
    liveTiers = tiers;
  } catch (e) {
    liveWhy = e.message;
  } finally {
    globalThis.fetch = real;
  }
});

const needsBitter = (t) => {
  if (bitter) return false;
  t.skip(`needs Bitter from Google Fonts, which did not arrive: ${bitterWhy}`);
  return true;
};

const needsCatalogue = (t) => {
  if (liveTiers) return false;
  t.skip(`needs the live Google Fonts catalogue, which did not answer: ${liveWhy}`);
  return true;
};

/** Every coordinate in a `d` string, paired up. Commands all take x/y pairs. */
function pathPoints(d) {
  const nums = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const pts = [];
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  return pts;
}

/** The box of the path's own numbers, which is what a `glyf` header stores. */
function controlBox(d) {
  const pts = pathPoints(d);
  return {
    xMin: Math.min(...pts.map((p) => p[0])),
    yMin: Math.min(...pts.map((p) => p[1])),
    xMax: Math.max(...pts.map((p) => p[0])),
    yMax: Math.max(...pts.map((p) => p[1])),
  };
}

const declaredBox = (font, gid) => {
  const g = font.tables.glyf.offset + font.loca[gid];
  return {
    xMin: font.dv.getInt16(g + 2),
    yMin: font.dv.getInt16(g + 4),
    xMax: font.dv.getInt16(g + 6),
    yMax: font.dv.getInt16(g + 8),
  };
};

// ---------------------------------------------------------------------------

describe('parseFont', () => {
  test('reads head, maxp, hhea and hmtx', () => {
    const font = basicFont();
    assert.equal(font.unitsPerEm, 1000);
    assert.equal(font.head.unitsPerEm, 1000);
    assert.equal(font.head.indexToLocFormat, 1);
    assert.equal(font.numGlyphs, 4);
    assert.equal(font.hhea.ascender, 800);
    assert.equal(font.hhea.descender, -200);
    assert.deepEqual([...font.advanceWidths], [500, 700, 550, 250]);
  });

  test('reads the family name for its error messages', () => {
    assert.equal(basicFont().family, 'Synthetic Sans');
  });

  test('reads short and long loca to the same offsets', () => {
    const glyphs = [
      { advance: 500, data: [] },
      { advance: 700, data: simpleGlyph(SQUARE) },
    ];
    const cmap = new Map([[0x41, 1]]);
    const long = F.parseFont(buildFont({ glyphs, cmap, locaFormat: 1 }));
    const short = F.parseFont(buildFont({ glyphs, cmap, locaFormat: 0 }));
    assert.deepEqual([...long.loca], [...short.loca]);
    assert.equal(F.glyphPath(long, 1).d, F.glyphPath(short, 1).d);
  });

  test('repeats the last advance for every glyph past numberOfHMetrics', () => {
    // A face with a monospaced tail stores two full records and nothing but
    // side bearings after them. Reading the tail as advances would give zeroes.
    const font = F.parseFont(
      buildFont({
        glyphs: [
          { advance: 500, data: [] },
          { advance: 640, data: simpleGlyph(SQUARE) },
          { advance: 0, data: simpleGlyph(TRIANGLE) },
          { advance: 0, data: [] },
        ],
        cmap: new Map([
          [0x41, 1],
          [0x42, 2],
        ]),
        numberOfHMetrics: 2,
      }),
    );
    assert.equal(font.hhea.numberOfHMetrics, 2);
    assert.deepEqual([...font.advanceWidths], [500, 640, 640, 640]);
  });

  test('says whether the outlines are one master of a variable family', () => {
    // A static face is what it draws. A variable one is not, and a caller that
    // does not know cannot tell why the wordmark came out in the wrong weight.
    assert.equal(basicFont().variable, false);
  });

  test('rejects a buffer that is not a font', () => {
    assert.throws(() => F.parseFont(Buffer.from('not a font at all, sorry')), /not a TrueType/);
    assert.throws(() => F.parseFont(Buffer.alloc(4)), /too short/);
    assert.throws(() => F.parseFont('a string'), TypeError);
  });

  test('names the font and PostScript outlines when handed a CFF face', () => {
    const otto = buildFont({
      glyphs: [{ advance: 500, data: [] }],
      cmap: new Map([[0x41, 0]]),
      family: 'Ottoman Display',
      sfntVersion: 'OTTO',
    });
    assert.throws(
      () => F.parseFont(otto),
      (e) => {
        assert.match(e.message, /PostScript/);
        assert.match(e.message, /CFF/);
        assert.match(e.message, /Ottoman Display/);
        return true;
      },
    );
  });

  test('refuses a TrueType collection rather than reading the first face', () => {
    const ttc = buildFont({ glyphs: [{ advance: 0, data: [] }], sfntVersion: 'ttcf' });
    assert.throws(() => F.parseFont(ttc), /collection/);
  });

  test('names the table that is missing', () => {
    const font = buildFont({
      glyphs: [{ advance: 500, data: [] }],
      cmap: new Map([[0x41, 0]]),
    });
    // Blank the `hmtx` tag in the directory so the table cannot be found.
    const i = font.indexOf(Buffer.from('hmtx'));
    assert.ok(i > 0);
    font.write('zzzz', i, 'latin1');
    assert.throws(() => F.parseFont(font), /missing the "hmtx" table/);
  });
});

describe('cmap', () => {
  test('maps known code points to non-zero glyphs', () => {
    const font = basicFont();
    assert.equal(F.glyphForCodePoint(font, 0x41), 1);
    assert.equal(F.glyphForCodePoint(font, 0x42), 2);
    assert.equal(F.glyphForCodePoint(font, 0x20), 3);
  });

  test('maps an unmapped code point to 0', () => {
    const font = basicFont();
    assert.equal(F.glyphForCodePoint(font, 0x5a), 0); // Z
    assert.equal(F.glyphForCodePoint(font, 0x4e00), 0); // outside every segment
    assert.equal(F.glyphForCodePoint(font, 0x1f600), 0); // above the BMP
  });

  test('follows idRangeOffset into the glyphIdArray', () => {
    // Two adjacent code points whose glyph ids run backwards cannot be
    // expressed with idDelta, so the builder falls back to a glyphIdArray.
    const font = F.parseFont(
      buildFont({
        glyphs: [
          { advance: 0, data: [] },
          { advance: 700, data: simpleGlyph(SQUARE) },
          { advance: 550, data: simpleGlyph(TRIANGLE) },
        ],
        cmap: new Map([
          [0x41, 2],
          [0x42, 1],
        ]),
      }),
    );
    assert.equal(F.glyphForCodePoint(font, 0x41), 2);
    assert.equal(F.glyphForCodePoint(font, 0x42), 1);
    assert.equal(F.glyphForCodePoint(font, 0x43), 0);
  });

  test('resolves real code points in a real face', (t) => {
    if (needsBitter(t)) return;
    for (const ch of 'ABCdefgz0189.,!?') {
      assert.ok(
        F.glyphForCodePoint(bitter, ch.codePointAt(0)) > 0,
        `${bitter.family} should carry ${JSON.stringify(ch)}`,
      );
    }
    assert.equal(F.glyphForCodePoint(bitter, 0x4e00), 0, 'a Han ideograph is not in a Latin face');
  });
});

describe('glyph outlines', () => {
  test('a square becomes four points and a close', () => {
    const font = basicFont();
    const p = F.glyphPath(font, 1);
    assert.equal(p.d, 'M100 100 L600 100 L600 700 L100 700 Z');
    assert.equal(p.advance, 700);
    assert.deepEqual(p.bbox, {
      xMin: 100,
      yMin: 100,
      xMax: 600,
      yMax: 700,
      width: 500,
      height: 600,
    });
  });

  test('an empty glyph has no path and a zero box', () => {
    const p = F.glyphPath(basicFont(), 3);
    assert.equal(p.d, '');
    assert.equal(p.advance, 250);
    assert.deepEqual(p.bbox, { xMin: 0, yMin: 0, xMax: 0, yMax: 0, width: 0, height: 0 });
  });

  test('rejects a glyph id the font does not have', () => {
    const font = basicFont();
    assert.throws(() => F.glyphPath(font, 99), /outside Synthetic Sans/);
    assert.throws(() => F.glyphPath(font, -1), RangeError);
  });

  test('consecutive off-curve points imply an on-curve point at their midpoint', () => {
    const contour = [
      { x: 0, y: 0, on: true },
      { x: 100, y: 100, on: false },
      { x: 300, y: 100, on: false },
      { x: 400, y: 0, on: true },
    ];
    const font = F.parseFont(
      buildFont({
        glyphs: [
          { advance: 0, data: [] },
          { advance: 400, data: simpleGlyph([contour]) },
        ],
        cmap: new Map([[0x41, 1]]),
      }),
    );
    // The midpoint of (100,100) and (300,100) is (200,100), and it is on the
    // curve. Without it the two control points would collapse into one segment.
    assert.equal(F.glyphPath(font, 1).d, 'M0 0 Q100 100 200 100 Q300 100 400 0 Z');
  });

  test('a contour starting off-curve begins at the last point when that is on-curve', () => {
    const contour = [
      { x: 100, y: 0, on: false },
      { x: 200, y: 0, on: true },
      { x: 200, y: 100, on: true },
    ];
    const font = F.parseFont(
      buildFont({
        glyphs: [
          { advance: 0, data: [] },
          { advance: 300, data: simpleGlyph([contour]) },
        ],
        cmap: new Map([[0x41, 1]]),
      }),
    );
    assert.equal(F.glyphPath(font, 1).d, 'M200 100 Q100 0 200 0 Z');
  });

  test('a contour with off-curve points at both ends begins at their midpoint', () => {
    const contour = [
      { x: -100, y: 0, on: false },
      { x: 0, y: 100, on: true },
      { x: 100, y: 0, on: false },
    ];
    const font = F.parseFont(
      buildFont({
        glyphs: [
          { advance: 0, data: [] },
          { advance: 300, data: simpleGlyph([contour]) },
        ],
        cmap: new Map([[0x41, 1]]),
      }),
    );
    // Midpoint of the last point (100,0) and the first (-100,0), which is (0,0).
    const d = F.glyphPath(font, 1).d;
    assert.ok(d.startsWith('M0 0 '), `path should start at the implied midpoint, got ${d}`);
    assert.equal(d, 'M0 0 Q-100 0 0 100 Q100 0 0 0 Z');
  });

  test('reads short deltas, repeated flags and unchanged coordinates', () => {
    // Hand-encoded: flags 0x31, then 0x33 repeated three times, then 0x35.
    // 0x31 = on-curve, x unchanged, y unchanged
    // 0x3B = on-curve, x short positive, y unchanged, repeat
    // 0x35 = on-curve, x unchanged, y short positive
    const raw = [
      ...i16(1),
      ...i16(0),
      ...i16(0),
      ...i16(300),
      ...i16(100), // header box
      ...u16(4), // endPtsOfContours
      ...u16(0), // no instructions
      0x31,
      0x3b,
      0x02,
      0x35, // flags, with a run of three compressed into two bytes
      100,
      100,
      100, // x deltas, one byte each
      100, // y delta
    ];
    const font = F.parseFont(
      buildFont({
        glyphs: [
          { advance: 0, data: [] },
          { advance: 400, data: raw },
        ],
        cmap: new Map([[0x41, 1]]),
      }),
    );
    assert.equal(F.glyphPath(font, 1).d, 'M0 0 L100 0 L200 0 L300 0 L300 100 Z');
  });

  test('places a composite component at its offset', () => {
    const font = F.parseFont(
      buildFont({
        glyphs: [
          { advance: 0, data: [] },
          { advance: 700, data: simpleGlyph(SQUARE) },
          { advance: 700, data: compositeGlyph([{ glyphIndex: 1, dx: 50, dy: -25 }], [150, 75, 650, 675]) },
        ],
        cmap: new Map([
          [0x41, 1],
          [0x42, 2],
        ]),
      }),
    );
    assert.equal(F.glyphPath(font, 2).d, 'M150 75 L650 75 L650 675 L150 675 Z');
  });

  test('applies a component scale before its offset', () => {
    const font = F.parseFont(
      buildFont({
        glyphs: [
          { advance: 0, data: [] },
          { advance: 700, data: simpleGlyph(SQUARE) },
          { advance: 700, data: compositeGlyph([{ glyphIndex: 1, dx: 0, dy: 0, scale: 0.5 }], [50, 50, 300, 350]) },
        ],
        cmap: new Map([
          [0x41, 1],
          [0x42, 2],
        ]),
      }),
    );
    assert.equal(F.glyphPath(font, 2).d, 'M50 50 L300 50 L300 350 L50 350 Z');
  });

  test('draws every component of a multi-part composite', () => {
    const font = F.parseFont(
      buildFont({
        glyphs: [
          { advance: 0, data: [] },
          { advance: 700, data: simpleGlyph(SQUARE) },
          { advance: 550, data: simpleGlyph(TRIANGLE) },
          {
            advance: 700,
            data: compositeGlyph(
              [
                { glyphIndex: 1, dx: 0, dy: 0 },
                { glyphIndex: 2, dx: 0, dy: 800 },
              ],
              [0, 100, 600, 1400],
            ),
          },
        ],
        cmap: new Map([
          [0x41, 1],
          [0x42, 2],
          [0x43, 3],
        ]),
      }),
    );
    const composite = F.glyphPath(font, 3);
    assert.equal((composite.d.match(/M/g) ?? []).length, 2, 'both components should be drawn');
    assert.equal(composite.bbox.yMax, 1400, 'the offset component sets the top of the box');
  });

  test('the tight box never exceeds the control box', () => {
    // A quadratic sits inside the hull of its control points, so an implementation
    // that reported the control box would pass this and the next test would catch it.
    const contour = [
      { x: 0, y: 0, on: true },
      { x: 200, y: 400, on: false },
      { x: 400, y: 0, on: true },
    ];
    const font = F.parseFont(
      buildFont({
        glyphs: [
          { advance: 0, data: [] },
          { advance: 400, data: simpleGlyph([contour]) },
        ],
        cmap: new Map([[0x41, 1]]),
      }),
    );
    const p = F.glyphPath(font, 1);
    // The curve peaks at t = 0.5, which is half the control point's height.
    assert.equal(p.bbox.yMax, 200);
    assert.equal(controlBox(p.d).yMax, 400);
  });
});

describe('outlines against a real face', () => {
  test('every computed control box matches the font\'s own declared box', (t) => {
    if (needsBitter(t)) return;
    let checked = 0;
    let worst = 0;
    for (let gid = 0; gid < bitter.numGlyphs; gid++) {
      if (bitter.loca[gid + 1] <= bitter.loca[gid]) continue;
      const p = F.glyphPath(bitter, gid);
      if (!p.d) continue;
      const declared = declaredBox(bitter, gid);
      const computed = controlBox(p.d);
      for (const k of ['xMin', 'yMin', 'xMax', 'yMax']) {
        const delta = Math.abs(computed[k] - declared[k]);
        worst = Math.max(worst, delta);
        assert.ok(
          delta <= 1,
          `glyph ${gid} ${k}: computed ${computed[k]}, font declares ${declared[k]}`,
        );
      }
      checked++;
    }
    assert.ok(checked >= 40, `only ${checked} glyphs had outlines to check`);
    assert.ok(worst <= 1);
  });

  test('the tight box sits inside the declared control box', (t) => {
    if (needsBitter(t)) return;
    let checked = 0;
    for (let gid = 0; gid < bitter.numGlyphs && checked < 60; gid++) {
      if (bitter.loca[gid + 1] <= bitter.loca[gid]) continue;
      const p = F.glyphPath(bitter, gid);
      if (!p.d) continue;
      const declared = declaredBox(bitter, gid);
      assert.ok(p.bbox.xMin >= declared.xMin - 1, `glyph ${gid} xMin`);
      assert.ok(p.bbox.yMin >= declared.yMin - 1, `glyph ${gid} yMin`);
      assert.ok(p.bbox.xMax <= declared.xMax + 1, `glyph ${gid} xMax`);
      assert.ok(p.bbox.yMax <= declared.yMax + 1, `glyph ${gid} yMax`);
      checked++;
    }
    assert.ok(checked >= 40);
  });

  test('an accented letter is a composite of its base plus a mark', (t) => {
    if (needsBitter(t)) return;
    let found = null;
    for (let cp = 0xc0; cp <= 0x17f && !found; cp++) {
      const ch = String.fromCodePoint(cp);
      const decomposed = ch.normalize('NFD');
      if (decomposed.length < 2) continue;
      const gid = F.glyphForCodePoint(bitter, cp);
      const baseGid = F.glyphForCodePoint(bitter, decomposed.codePointAt(0));
      if (!gid || !baseGid) continue;
      // A negative contour count is what marks a glyph as composite.
      if (bitter.dv.getInt16(bitter.tables.glyf.offset + bitter.loca[gid]) >= 0) continue;
      found = { ch, gid, baseGid, base: decomposed[0] };
    }
    assert.ok(found, `${bitter.family} should carry at least one composite accented letter`);

    const accented = F.glyphPath(bitter, found.gid);
    const base = F.glyphPath(bitter, found.baseGid);
    const contours = (d) => (d.match(/M/g) ?? []).length;
    assert.ok(
      contours(accented.d) > contours(base.d),
      `${found.ch} should have more contours than ${found.base}`,
    );
    assert.ok(accented.bbox.xMin <= base.bbox.xMin + 1, 'the composite box should contain the base');
    assert.ok(accented.bbox.xMax >= base.bbox.xMax - 1);
    assert.ok(accented.bbox.yMin <= base.bbox.yMin + 1);
    assert.ok(accented.bbox.yMax > base.bbox.yMax, 'the mark should sit above the base');
  });
});

describe('kernPair', () => {
  const kerningFont = (opts) =>
    F.parseFont(
      buildFont({
        glyphs: [
          { advance: 0, data: [] },
          { advance: 700, data: simpleGlyph(SQUARE) },
          { advance: 550, data: simpleGlyph(TRIANGLE) },
          { advance: 700, data: simpleGlyph(SQUARE) },
        ],
        cmap: new Map([
          [0x41, 1],
          [0x42, 2],
          [0x43, 3],
        ]),
        ...opts,
      }),
    );

  test('reads GPOS pair adjustment format 1', () => {
    const font = kerningFont({
      gpos: [{ subtables: [pairPos1([[1, 2, -80], [1, 3, 25], [2, 1, -15]])] }],
    });
    assert.equal(F.kernPair(font, 1, 2), -80);
    assert.equal(F.kernPair(font, 1, 3), 25);
    assert.equal(F.kernPair(font, 2, 1), -15);
    assert.equal(F.kernPair(font, 3, 1), 0, 'an uncovered left glyph kerns by nothing');
    assert.equal(F.kernPair(font, 1, 1), 0, 'an uncovered pair kerns by nothing');
  });

  test('reads GPOS pair adjustment format 2, by class', () => {
    const font = kerningFont({
      gpos: [
        {
          subtables: [
            pairPos2({
              coverageGlyphs: [1, 2, 3],
              class1Ranges: [[1, 1, 1], [2, 3, 2]],
              class2Ranges: [[2, 2, 1]],
              class1Count: 3,
              class2Count: 2,
              // class 1 against class 1 is -60, class 2 against class 1 is 40.
              values: [
                [0, 0],
                [0, -60],
                [0, 40],
              ],
            }),
          ],
        },
      ],
    });
    assert.equal(F.kernPair(font, 1, 2), -60);
    assert.equal(F.kernPair(font, 2, 2), 40);
    assert.equal(F.kernPair(font, 3, 2), 40, 'glyph 3 shares a class with glyph 2');
    assert.equal(F.kernPair(font, 1, 3), 0, 'glyph 3 falls in class 0 on the right');
  });

  test('follows an Extension Positioning lookup through to the pairs behind it', () => {
    const font = kerningFont({
      gpos: [{ type: 9, subtables: [extension(pairPos1([[1, 2, -95]]))] }],
    });
    assert.equal(F.kernPair(font, 1, 2), -95);
  });

  test('adds the adjustments from separate lookups', () => {
    const font = kerningFont({
      gpos: [
        { subtables: [pairPos1([[1, 2, -50]])] },
        { subtables: [pairPos1([[1, 2, -10]])] },
      ],
    });
    assert.equal(F.kernPair(font, 1, 2), -60);
  });

  test('takes the first matching subtable within one lookup', () => {
    const font = kerningFont({
      gpos: [{ subtables: [pairPos1([[1, 2, -50]]), pairPos1([[1, 2, -999]])] }],
    });
    assert.equal(F.kernPair(font, 1, 2), -50);
  });

  test('reads the legacy kern table when there is no GPOS', () => {
    const font = kerningFont({ kern: [[1, 2, -120], [2, 3, 30]] });
    assert.equal(F.kernPair(font, 1, 2), -120);
    assert.equal(F.kernPair(font, 2, 3), 30);
    assert.equal(F.kernPair(font, 3, 1), 0);
  });

  test('ignores the legacy kern table entirely once GPOS carries a kern feature', () => {
    const font = kerningFont({
      gpos: [{ subtables: [pairPos1([[1, 2, -80]])] }],
      kern: [[1, 2, -400], [2, 3, -250]],
    });
    assert.equal(F.kernPair(font, 1, 2), -80, 'GPOS wins where both have an opinion');
    // 2/3 is only in the old table. A per-pair fallback would return -250 here,
    // and would then kern differently from every browser, which uses GPOS alone
    // as soon as a font has a kern feature.
    assert.equal(F.kernPair(font, 2, 3), 0);
    assert.equal(font.kerning.legacy.size, 2, 'the old table is still parsed, just not consulted');
  });

  test('returns 0 for a font with no kerning at all', () => {
    const font = basicFont();
    assert.equal(F.kernPair(font, 1, 2), 0);
    assert.equal(font.kerning.gpos.length, 0);
    assert.equal(font.kerning.legacy.size, 0);
  });

  test('finds real kerning in a real face', (t) => {
    if (needsBitter(t)) return;
    const gid = (ch) => F.glyphForCodePoint(bitter, ch.codePointAt(0));
    const av = F.kernPair(bitter, gid('A'), gid('V'));
    assert.ok(av < 0, `A/V should tighten, got ${av}`);
    assert.ok(Math.abs(av) < bitter.unitsPerEm / 4, `A/V of ${av} is not a plausible kern`);
    assert.ok(
      F.kernPair(bitter, gid('T'), gid('o')) < 0,
      'T/o should tighten in any text face',
    );
    assert.equal(F.kernPair(bitter, gid('n'), gid('n')), 0, 'n/n needs no adjustment');
  });
});

describe('layoutText', () => {
  test('accumulates advances, kerning and tracking exactly', () => {
    const font = F.parseFont(
      buildFont({
        glyphs: [
          { advance: 0, data: [] },
          { advance: 700, data: simpleGlyph(SQUARE) },
          { advance: 550, data: simpleGlyph(TRIANGLE) },
        ],
        cmap: new Map([
          [0x41, 1],
          [0x42, 2],
        ]),
        kern: [[1, 2, -60], [2, 1, 20]],
      }),
    );
    const size = 100;
    const scale = size / font.unitsPerEm;
    const text = 'ABA';
    const laid = F.layoutText(font, text, { size, tracking: 25 });

    // Computed from the tables directly, not from anything the layout returned.
    const gids = [...text].map((c) => F.glyphForCodePoint(font, c.codePointAt(0)));
    let expected = 0;
    for (let i = 0; i < gids.length; i++) {
      if (i > 0) expected += F.kernPair(font, gids[i - 1], gids[i]) * scale + (size * 25) / 1000;
      expected += font.advanceWidths[gids[i]] * scale;
    }
    close(laid.width, expected, 1e-9);
    close(laid.width, (700 + 550 + 700) * scale + (-60 + 20) * scale + 2 * 2.5, 1e-9);
    assert.deepEqual(
      laid.glyphs.map((g) => g.glyphId),
      gids,
    );
    assert.deepEqual(
      laid.glyphs.map((g) => g.kern),
      [0, -6, 2],
    );
  });

  test('kerning can be turned off, and the width changes by exactly the kern', () => {
    const font = F.parseFont(
      buildFont({
        glyphs: [
          { advance: 0, data: [] },
          { advance: 700, data: simpleGlyph(SQUARE) },
          { advance: 550, data: simpleGlyph(TRIANGLE) },
        ],
        cmap: new Map([
          [0x41, 1],
          [0x42, 2],
        ]),
        kern: [[1, 2, -60]],
      }),
    );
    const on = F.layoutText(font, 'AB', { size: 1000, kerning: true });
    const off = F.layoutText(font, 'AB', { size: 1000, kerning: false });
    close(off.width - on.width, 60, 1e-9);
  });

  test('tracking is in thousandths of an em, over n - 1 gaps', () => {
    const font = basicFont();
    const plain = F.layoutText(font, 'ABA', { size: 100, tracking: 0 });
    const tracked = F.layoutText(font, 'ABA', { size: 100, tracking: 100 });
    // 100 thousandths of a 100-unit em is 10 units, and "ABA" has two gaps.
    close(tracked.width - plain.width, 20, 1e-9);
    assert.notEqual(Math.round(tracked.width - plain.width), 30, 'there is no trailing gap');
    // One glyph has no gaps at all, so tracking cannot touch it.
    close(
      F.layoutText(font, 'A', { size: 100, tracking: 500 }).width,
      F.layoutText(font, 'A', { size: 100, tracking: 0 }).width,
      1e-9,
    );
  });

  test('pairAdjust is applied on top of kerning, in the same thousandths', () => {
    const font = F.parseFont(
      buildFont({
        glyphs: [
          { advance: 0, data: [] },
          { advance: 700, data: simpleGlyph(SQUARE) },
          { advance: 550, data: simpleGlyph(TRIANGLE) },
        ],
        cmap: new Map([
          [0x41, 1],
          [0x42, 2],
        ]),
        kern: [[1, 2, -60]],
      }),
    );
    const metric = F.layoutText(font, 'AB', { size: 100 });
    const optical = F.layoutText(font, 'AB', { size: 100, pairAdjust: { AB: -30 } });
    close(metric.width - optical.width, 3, 1e-9);
    close(optical.glyphs[1].kern, -6, 1e-9, 'the metric kern is reported separately');
    close(optical.glyphs[1].adjust, -3, 1e-9);
    // A pair that is not named is left alone.
    close(F.layoutText(font, 'AB', { size: 100, pairAdjust: { BA: -30 } }).width, metric.width);
  });

  test('flips the y axis, so ink above the baseline lands below y = 0', () => {
    const font = basicFont();
    const glyph = F.glyphPath(font, 1);
    assert.ok(glyph.bbox.yMin > 0, 'in font units the square sits above the baseline');
    assert.ok(glyph.bbox.yMax > 0);

    const laid = F.layoutText(font, 'A', { size: 1000 });
    assert.ok(laid.bbox.yMax < 0, 'in SVG units the same ink sits below y = 0');
    assert.ok(laid.bbox.yMin < 0);
    // Top and bottom swap places, and the height survives the flip.
    close(laid.bbox.yMin, -glyph.bbox.yMax, 1e-9);
    close(laid.bbox.yMax, -glyph.bbox.yMin, 1e-9);
    close(laid.height, glyph.bbox.height, 1e-9);
  });

  test('writes zero as zero, never as negative zero', () => {
    // The triangle sits on the baseline, and flipping y turns those 0s into -0.
    // "-0" in a path is legal but it is noise in a file a designer opens.
    const laid = F.layoutText(basicFont(), 'B', { size: 1000 });
    assert.ok(laid.d.includes(' 0 '), 'the baseline points should still be there');
    assert.doesNotMatch(laid.d, /-0(?![.\d])/, `negative zero in ${laid.d}`);
  });

  test('scales by size over unitsPerEm', () => {
    const font = basicFont();
    const half = F.layoutText(font, 'AB', { size: 500 });
    const full = F.layoutText(font, 'AB', { size: 1000 });
    close(full.width, half.width * 2, 1e-9);
    close(full.bbox.height, half.bbox.height * 2, 1e-9);
  });

  test('per-glyph paths concatenate into the combined path', () => {
    const laid = F.layoutText(basicFont(), 'ABA', { size: 120 });
    assert.equal(laid.glyphs.map((g) => g.d).filter(Boolean).join(' '), laid.d);
    let pen = 0;
    for (const g of laid.glyphs) {
      close(g.x, pen, 1e-9);
      pen += g.advance;
    }
  });

  test('names the character it cannot set', () => {
    const font = basicFont();
    assert.throws(
      () => F.layoutText(font, 'AZB'),
      (e) => {
        assert.match(e.message, /Z/);
        assert.match(e.message, /U\+005A/);
        assert.match(e.message, /Synthetic Sans/);
        return true;
      },
    );
  });

  test('names a missing accented character rather than dropping it', (t) => {
    if (needsBitter(t)) return;
    assert.throws(() => F.layoutText(bitter, 'Bra一di'), /一/);
    // The accented form the face does carry must still set.
    assert.doesNotThrow(() => F.layoutText(bitter, 'Brandé'));
  });

  test('rejects a size that cannot be scaled', () => {
    const font = basicFont();
    for (const bad of [0, -10, NaN]) assert.throws(() => F.layoutText(font, 'A', { size: bad }), TypeError);
  });

  test('sets an empty string to nothing without complaining', () => {
    const laid = F.layoutText(basicFont(), '');
    assert.equal(laid.d, '');
    assert.equal(laid.width, 0);
    assert.deepEqual(laid.glyphs, []);
  });

  /**
   * Advance widths measured in Chrome, which shapes with HarfBuzz, for Bitter
   * at font-size 1000px with kerning on and ligatures off. Bitter's em is 1000
   * units, so these are font units.
   *
   * This is the only assertion in the file that comes from outside the parser.
   * Everything else checks the module against itself or against numbers the
   * font declares about itself, and both of those survive a consistent
   * misreading. These do not: if the cmap picked the wrong glyph, or the class
   * kerning were read off by a row, or an advance came from the wrong hmtx
   * record, the totals would move and no amount of internal consistency would
   * hide it. Recheck them by setting the same string in a browser.
   */
  const HARFBUZZ = {
    A: 713, V: 709, T: 612, o: 577, a: 561, v: 544, r: 470, k: 594, W: 1021, '.': 233,
    AV: 1337, av: 1080, To: 1149, rk: 1047, Ta: 1135, Wo: 1531, 'r.': 630,
    AVATAR: 3781, Handgloves: 5597, Brande: 3432, Wordmark: 5150, Typography: 5689,
  };

  test('matches what a browser measures for the same string', (t) => {
    if (needsBitter(t)) return;
    for (const [text, expected] of Object.entries(HARFBUZZ)) {
      close(
        F.layoutText(bitter, text, { size: bitter.unitsPerEm }).width,
        expected,
        1e-9,
        `${JSON.stringify(text)} should set to ${expected} units, the width Chrome reports`,
      );
    }
    // And the pairs above are kerned, not merely summed, so the check has teeth.
    const gid = (ch) => F.glyphForCodePoint(bitter, ch.codePointAt(0));
    assert.equal(
      HARFBUZZ.AV,
      bitter.advanceWidths[gid('A')] + bitter.advanceWidths[gid('V')] + F.kernPair(bitter, gid('A'), gid('V')),
    );
    assert.ok(F.kernPair(bitter, gid('A'), gid('V')) !== 0);
  });

  test('a real string accumulates to the sum of its own tables', (t) => {
    if (needsBitter(t)) return;
    const size = 144;
    const scale = size / bitter.unitsPerEm;
    const text = 'Wordmark';
    const laid = F.layoutText(bitter, text, { size, tracking: -15 });
    const gids = [...text].map((c) => F.glyphForCodePoint(bitter, c.codePointAt(0)));
    let expected = 0;
    for (let i = 0; i < gids.length; i++) {
      if (i > 0) expected += F.kernPair(bitter, gids[i - 1], gids[i]) * scale + (size * -15) / 1000;
      expected += bitter.advanceWidths[gids[i]] * scale;
    }
    close(laid.width, expected, 1e-9);
    assert.ok(laid.width > 0);
    // The baseline is y = 0, so the ink is above it apart from the overshoot
    // that round letters carry below the line.
    assert.ok(laid.bbox.yMin < -size * 0.5, 'the cap height should be well above the baseline');
    assert.ok(laid.bbox.yMax < size * 0.05, 'nothing here descends');
  });
});

describe('textToSvg', () => {
  test('carries outlines and no font dependency', () => {
    const svg = F.textToSvg(basicFont(), 'AB', { size: 120 });
    assert.doesNotMatch(svg, /<text/);
    assert.doesNotMatch(svg, /font-family/);
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.match(svg, /<path d="M/);
  });

  test('gives every path an explicit fill', () => {
    const font = basicFont();
    for (const m of F.textToSvg(font, 'AB').matchAll(/<path\b[^>]*>/g)) {
      assert.match(m[0], /\bfill="[^"]+"/, `path has no explicit fill: ${m[0]}`);
    }
    assert.match(F.textToSvg(font, 'A', { fill: 'currentColor' }), /fill="currentColor"/);
  });

  test('has an integer viewBox tight to the ink', () => {
    const font = basicFont();
    const svg = F.textToSvg(font, 'AB', { size: 137 });
    const vb = /viewBox="([^"]+)"/.exec(svg)[1];
    assert.match(vb, /^-?\d+ -?\d+ \d+ \d+$/, `viewBox is not integral: ${vb}`);
    const [x, y, w, h] = vb.split(' ').map(Number);
    const laid = F.layoutText(font, 'AB', { size: 137 });
    assert.ok(x <= laid.bbox.xMin && x > laid.bbox.xMin - 1, 'the frame is tight on the left');
    assert.ok(y <= laid.bbox.yMin && y > laid.bbox.yMin - 1, 'the frame is tight on the top');
    assert.ok(x + w >= laid.bbox.xMax && x + w < laid.bbox.xMax + 1);
    assert.ok(y + h >= laid.bbox.yMax && y + h < laid.bbox.yMax + 1);
    assert.match(svg, new RegExp(`width="${w}" height="${h}"`));
  });

  test('escapes the label rather than breaking the document', () => {
    const font = F.parseFont(
      buildFont({
        glyphs: [
          { advance: 0, data: [] },
          { advance: 700, data: simpleGlyph(SQUARE) },
        ],
        cmap: new Map([[0x26, 1]]),
      }),
    );
    const svg = F.textToSvg(font, '&');
    assert.match(svg, /aria-label="&amp;"/);
  });

  test('a string with no ink still gives a usable frame', () => {
    const svg = F.textToSvg(basicFont(), ' ');
    const [, , w, h] = /viewBox="([^"]+)"/.exec(svg)[1].split(' ').map(Number);
    assert.ok(w >= 1 && h >= 1, 'a zero-sized viewBox renders nothing anywhere');
  });

  test('sets a real wordmark from a real face', (t) => {
    if (needsBitter(t)) return;
    const svg = F.textToSvg(bitter, 'Brandé', { size: 120, tracking: -10 });
    assert.doesNotMatch(svg, /<text/);
    assert.match(/viewBox="([^"]+)"/.exec(svg)[1], /^-?\d+ -?\d+ \d+ \d+$/);
    assert.ok(svg.length > 500, 'a six-letter wordmark is more than a few curves');
  });
});

// ---------------------------------------------------------------------------
// Licence tiers
//
// Real bodies, trimmed. Google answers HTTP 200 to all three, so these strings
// are the entire difference between a face that may carry a client's trademark
// and one that may not.
// ---------------------------------------------------------------------------

/** Modern enough that Google Fonts answers with its current CSS. */
const MODERN_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const CSS_PUBLIC =
  "/* latin */\n@font-face {\n  font-family: 'Inter';\n  font-style: normal;\n  font-weight: 400;\n" +
  "  src: url(https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2) format('woff2');\n}";

const CSS_COMMERCIAL =
  "/* cyrillic */\n@font-face {\n  font-family: 'Gill Sans';\n  font-style: normal;\n  font-weight: 400;\n" +
  "  src: url(https://fonts.gstatic.com/l/font?kit=VEMzRo11tZHs8hG7tPa9zxTghvmCuA&skey=b796ffb12c919a00&v=v16) format('woff2');\n}";

const CSS_RESTRICTED =
  '/*\n * See: https://fonts.google.com/license/googlerestricted\n */\n/* cyrillic */\n' +
  "@font-face {\n  font-family: 'Product Sans';\n  font-style: normal;\n  font-weight: 400;\n" +
  "  src: url(https://fonts.gstatic.com/s/productsans/v10/abc.woff2) format('woff2');\n}";

describe('Google Fonts licence tiers', () => {
  test('classifies the three CSS shapes Google actually serves', () => {
    assert.equal(F.googleFontTier(CSS_PUBLIC), 'public');
    assert.equal(F.googleFontTier(CSS_COMMERCIAL), 'commercial');
    assert.equal(F.googleFontTier(CSS_RESTRICTED), 'restricted');
    assert.equal(F.googleFontTier(''), 'missing');
    assert.equal(F.googleFontTier(undefined), 'missing');
  });

  test('only the public catalogue is usable', () => {
    assert.equal(F.isUsableGoogleFont(CSS_PUBLIC), true);
    assert.equal(F.isUsableGoogleFont(CSS_COMMERCIAL), false);
    assert.equal(F.isUsableGoogleFont(CSS_RESTRICTED), false);
    assert.equal(F.isUsableGoogleFont(''), false);
  });

  test('the restricted banner beats the public path it sits above', () => {
    // Product Sans is delivered from /s/ like any open face. Reading the path
    // first would wave Google's own trademark face straight through.
    assert.match(CSS_RESTRICTED, /fonts\.gstatic\.com\/s\//);
    assert.equal(F.googleFontTier(CSS_RESTRICTED), 'restricted');
  });

  test('asks css2 as a modern browser, because no other request shape answers this', (t) => {
    if (needsCatalogue(t)) return;
    assert.match(licenceRequest.url, /^https:\/\/fonts\.googleapis\.com\/css2\?family=Inter$/);
    assert.match(licenceRequest.init.headers['User-Agent'], /Chrome\/\d+/);
    assert.notEqual(licenceRequest.init.headers['User-Agent'], 'Mozilla/4.0');
    assert.deepEqual(liveTiers.get('Inter'), {
      usable: true,
      tier: 'public',
      cssUrl: 'https://fonts.googleapis.com/css2?family=Inter',
    });
  });

  test('reads the real tiers off the live catalogue', (t) => {
    if (needsCatalogue(t)) return;
    for (const [family, tier] of LIVE_TIERS) {
      const got = liveTiers.get(family);
      assert.equal(got.tier, tier, `${family} should be ${tier}, Google says ${got.tier}`);
      assert.equal(got.usable, tier === 'public');
    }
  });

  test('catches Google Sans, which carries no restricted banner', (t) => {
    if (needsCatalogue(t)) return;
    // Google serves its own corporate face from the public /s/ path with no
    // banner on it, so the CSS alone reads as open. Nothing in the metadata
    // separates it either: `isBrandFont` is true for Roboto and for all of Noto,
    // which are Apache and OFL. Only the name is left.
    assert.equal(F.googleFontTier(googleSansCss), 'public', 'the CSS on its own still says public');
    assert.equal(liveTiers.get('Google Sans').tier, 'restricted');
    assert.equal(liveTiers.get('Google Sans Text').tier, 'restricted');
    // And the prefix must not reach past that one family. Roboto is Google's
    // too, and Apache licensed, and refusing it would be a serious mistake.
    assert.equal(liveTiers.get('Roboto').tier, 'public');
  });

  test('needs a family name', async () => {
    await assert.rejects(() => F.checkGoogleFontLicence('   '), TypeError);
  });
});

describe('fetchGoogleFont', () => {
  /**
   * The two requests are deliberately different shapes, so the stub answers
   * them differently: css2 carries the licence, css v1 carries the .ttf URL.
   */
  const stub = (bytes, { licenceCss = CSS_PUBLIC } = {}) => {
    const calls = [];
    globalThis.fetch = async (url, init) => {
      calls.push({ url: String(url), init });
      if (String(url).includes('/css2?')) {
        return { ok: true, status: 200, text: async () => licenceCss };
      }
      if (String(url).includes('fonts.googleapis.com')) {
        return {
          ok: true,
          status: 200,
          text: async () =>
            "@font-face{font-family:'Stub';src: url(https://fonts.gstatic.com/s/stub/v1/abc.ttf) format('truetype');}",
        };
      }
      return { ok: true, status: 200, arrayBuffer: async () => new Uint8Array(bytes).buffer };
    };
    return calls;
  };

  const stubFont = () => buildFont({ glyphs: [{ advance: 0, data: [] }], cmap: new Map([[0x41, 0]]) });

  test('checks the licence on css2 and downloads from CSS v1, with different agents', async () => {
    const real = globalThis.fetch;
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-font-'));
    const calls = stub(stubFont());
    try {
      const first = await F.fetchGoogleFont('Stub Face', { weight: 700, cacheDir: dir });
      assert.equal(calls.length, 3, 'licence, then CSS, then the font itself');

      const [licenceCall, cssCall] = calls;
      assert.match(licenceCall.url, /^https:\/\/fonts\.googleapis\.com\/css2\?family=Stub\+Face$/);
      assert.match(licenceCall.init.headers['User-Agent'], /Chrome\/\d+/);

      assert.match(cssCall.url, /^https:\/\/fonts\.googleapis\.com\/css\?family=Stub\+Face:700$/);
      assert.equal(cssCall.init.headers['User-Agent'], 'Mozilla/4.0');
      assert.doesNotMatch(cssCall.url, /css2/, 'CSS v2 returns a blob that is not an sfnt');

      // The trap: asked with the download's own User-Agent, css2 hands back the
      // /l/font path for open faces too, so merging the two requests would read
      // most of the catalogue as commercially licensed.
      assert.notEqual(licenceCall.init.headers['User-Agent'], cssCall.init.headers['User-Agent']);

      assert.equal(first.url, 'https://fonts.gstatic.com/s/stub/v1/abc.ttf');
      assert.equal(first.cached, false);
      assert.deepEqual(first.licence, {
        usable: true,
        tier: 'public',
        cssUrl: 'https://fonts.googleapis.com/css2?family=Stub+Face',
      });
      assert.equal(first.warning, null);
      assert.ok(existsSync(first.file));

      const second = await F.fetchGoogleFont('Stub Face', { weight: 700, cacheDir: dir });
      assert.equal(calls.length, 3, 'the second call must not touch the network');
      assert.equal(second.cached, true);
      assert.deepEqual(second.buffer, first.buffer);
      assert.equal(second.url, first.url, 'a cache hit still reports where the bytes came from');
      assert.equal(second.licence.tier, 'public', 'and still reports the licence it was cleared under');
    } finally {
      globalThis.fetch = real;
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('refuses a commercially licensed face, naming the family and the path', async () => {
    const real = globalThis.fetch;
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-font-'));
    const calls = stub(stubFont(), { licenceCss: CSS_COMMERCIAL });
    try {
      await assert.rejects(
        () => F.fetchGoogleFont('Gill Sans', { cacheDir: dir }),
        (e) => {
          assert.match(e.message, /Gill Sans/);
          assert.match(e.message, /commercial licence/);
          assert.match(e.message, /fonts\.gstatic\.com\/l\/font/);
          assert.match(e.message, /cannot be used for a logo/);
          return true;
        },
      );
      assert.equal(calls.length, 1, 'nothing is downloaded once the licence fails');
      assert.ok(!existsSync(path.join(dir, 'gill-sans-400.ttf')), 'and nothing is cached');
    } finally {
      globalThis.fetch = real;
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('refuses a Google-restricted face', async () => {
    const real = globalThis.fetch;
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-font-'));
    stub(stubFont(), { licenceCss: CSS_RESTRICTED });
    try {
      await assert.rejects(() => F.fetchGoogleFont('Product Sans', { cacheDir: dir }), (e) => {
        assert.match(e.message, /Product Sans/);
        assert.match(e.message, /googlerestricted/);
        return true;
      });
    } finally {
      globalThis.fetch = real;
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('allowUnlicensed downgrades the refusal to a warning that travels with the bytes', async () => {
    const real = globalThis.fetch;
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-font-'));
    stub(stubFont(), { licenceCss: CSS_COMMERCIAL });
    try {
      const got = await F.fetchGoogleFont('Gill Sans', { cacheDir: dir, allowUnlicensed: true });
      assert.equal(got.licence.tier, 'commercial');
      assert.equal(got.licence.usable, false);
      assert.match(got.warning, /Gill Sans/);
      assert.match(got.warning, /do not ship it/);
      assert.ok(got.buffer.length > 0, 'the bytes still arrive, for measuring');
      assert.doesNotThrow(() => F.parseFont(got.buffer));
    } finally {
      globalThis.fetch = real;
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('a face cached under allowUnlicensed is still refused to the next caller', async () => {
    const real = globalThis.fetch;
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-font-'));
    stub(stubFont(), { licenceCss: CSS_COMMERCIAL });
    try {
      const measured = await F.fetchGoogleFont('Gill Sans', { cacheDir: dir, allowUnlicensed: true });
      assert.ok(existsSync(measured.file), 'the bytes are on disk now');
      // The gate has to run before the cache is read, or one measuring run
      // would quietly clear the face for every build after it.
      await assert.rejects(
        () => F.fetchGoogleFont('Gill Sans', { cacheDir: dir }),
        /commercial licence/,
      );
    } finally {
      globalThis.fetch = real;
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('re-asks when the remembered verdict is not a verdict', async () => {
    const real = globalThis.fetch;
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-font-'));
    const calls = stub(stubFont());
    try {
      await F.fetchGoogleFont('Stub Face', { cacheDir: dir });
      const licenceFile = path.join(dir, 'stub-face.licence');
      await writeFile(licenceFile, 'probably fine');
      const n = calls.length;
      const again = await F.fetchGoogleFont('Stub Face', { cacheDir: dir });
      assert.ok(calls.length > n, 'a sidecar it cannot read is not a licence');
      assert.equal(again.licence.tier, 'public');
      assert.equal((await readFile(licenceFile, 'utf8')).trim(), 'public');
    } finally {
      globalThis.fetch = real;
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('remembers a licence verdict, but never remembers a missing one', async () => {
    const real = globalThis.fetch;
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-font-'));
    const calls = stub(stubFont(), { licenceCss: CSS_COMMERCIAL });
    try {
      // A settled tier is a fact about the family, so it is written down once.
      await assert.rejects(() => F.fetchGoogleFont('Gill Sans', { cacheDir: dir }));
      assert.equal(calls.length, 1);
      await assert.rejects(() => F.fetchGoogleFont('Gill Sans', { cacheDir: dir }));
      assert.equal(calls.length, 1, 'the refusal is remembered without asking again');
      assert.ok(existsSync(path.join(dir, 'gill-sans.licence')));

      // "missing" is a typo or a bad afternoon, not a fact, so it is re-asked.
      globalThis.fetch = async () => ({ ok: false, status: 400 });
      await assert.rejects(() => F.fetchGoogleFont('Notafont', { cacheDir: dir }), /does not serve/);
      assert.ok(!existsSync(path.join(dir, 'notafont.licence')));
    } finally {
      globalThis.fetch = real;
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('licences the family, so a second weight does not ask again', async () => {
    const real = globalThis.fetch;
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-font-'));
    const calls = stub(stubFont());
    try {
      await F.fetchGoogleFont('Stub Face', { weight: 400, cacheDir: dir });
      assert.equal(calls.length, 3, 'licence, CSS, font');
      await F.fetchGoogleFont('Stub Face', { weight: 700, cacheDir: dir });
      assert.equal(calls.length, 5, 'the second weight needs CSS and the font, not the licence');
    } finally {
      globalThis.fetch = real;
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('keys the cache by weight, so two weights are two files', async () => {
    const real = globalThis.fetch;
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-font-'));
    const calls = stub(stubFont());
    try {
      await F.fetchGoogleFont('Stub Face', { weight: 400, cacheDir: dir });
      await F.fetchGoogleFont('Stub Face', { weight: 700, cacheDir: dir });
      const n = calls.length;
      await F.fetchGoogleFont('Stub Face', { weight: 400, cacheDir: dir });
      assert.equal(calls.length, n, 'both weights are on disk now');
      assert.ok(existsSync(path.join(dir, 'stub-face-400.ttf')));
      assert.ok(existsSync(path.join(dir, 'stub-face-700.ttf')));
    } finally {
      globalThis.fetch = real;
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('names the family Google would not serve', async () => {
    const real = globalThis.fetch;
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-font-'));
    globalThis.fetch = async () => ({ ok: false, status: 400 });
    try {
      await assert.rejects(
        () => F.fetchGoogleFont('Notafont Grotesk', { cacheDir: dir }),
        (e) => {
          assert.match(e.message, /Notafont Grotesk/);
          assert.match(e.message, /does not serve/);
          return true;
        },
      );
    } finally {
      globalThis.fetch = real;
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('refuses to cache something that is not a font', async () => {
    const real = globalThis.fetch;
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-font-'));
    stub([...Buffer.from('<html>404</html>')]);
    try {
      await assert.rejects(() => F.fetchGoogleFont('Stub Face', { cacheDir: dir }), /did not return a font/);
      assert.ok(!existsSync(path.join(dir, 'stub-face-400.ttf')), 'nothing should be cached');
    } finally {
      globalThis.fetch = real;
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('says so when the CSS carries no .ttf URL', async () => {
    const real = globalThis.fetch;
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-font-'));
    // Openly licensed, and still served as a blob to CSS v1, which is what a
    // variable-only family looks like from here. The licence is not the problem.
    globalThis.fetch = async (url) => ({
      ok: true,
      status: 200,
      text: async () =>
        String(url).includes('/css2?')
          ? CSS_PUBLIC
          : "src: url(https://fonts.gstatic.com/l/font?kit=abc) format('truetype');",
    });
    try {
      await assert.rejects(() => F.fetchGoogleFont('Blobby', { cacheDir: dir }), /no \.ttf URL/);
    } finally {
      globalThis.fetch = real;
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('needs a family name', async () => {
    await assert.rejects(() => F.fetchGoogleFont('  '), TypeError);
  });

  test('the real download parses and sets type', async (t) => {
    if (needsBitter(t)) return;
    assert.match(bitter.family, /Bitter/);
    assert.ok(bitter.numGlyphs > 100);
    assert.equal(bitter.unitsPerEm, 1000);
  });
});

describe('the module surface', () => {
  test('the default export carries every named export', async () => {
    const mod = await import('../scripts/font.mjs');
    for (const name of Object.keys(mod.default)) {
      assert.equal(mod.default[name], mod[name], `${name} should be the same function`);
    }
    for (const name of ['parseFont', 'glyphPath', 'layoutText', 'kernPair', 'fetchGoogleFont', 'textToSvg']) {
      assert.equal(typeof mod.default[name], 'function', `${name} is missing from the default export`);
    }
  });

  test('the module has no npm dependencies', async () => {
    const source = await readFile(new URL('../scripts/font.mjs', import.meta.url), 'utf8');
    for (const m of source.matchAll(/^import .*? from '([^']+)';$/gm)) {
      assert.ok(m[1].startsWith('node:'), `${m[1]} is not a Node built-in`);
    }
  });
});


describe('a corrupt glyph count is named rather than run off the end', () => {
  test('a maxp that claims more glyphs than loca can hold throws a message that says so', async () => {
    // It used to throw `Offset is outside the bounds of the DataView`, which is
    // safe and tells nobody anything, in a parser that is otherwise careful to
    // name exactly what is wrong.
    let real;
    try {
      real = (await F.fetchGoogleFont('Bitter', { weight: 700 })).buffer;
    } catch {
      return; // no network
    }
    const bad = Buffer.from(real);
    for (let i = 0; i < bad.readUInt16BE(4); i++) {
      const o = 12 + i * 16;
      if (bad.toString('ascii', o, o + 4) === 'maxp') {
        bad.writeUInt16BE(65535, bad.readUInt32BE(o + 8) + 4);
        break;
      }
    }
    assert.throws(() => F.parseFont(bad), /maxp claims 65535 glyphs/);
    assert.throws(() => F.parseFont(bad), /corrupt or truncated/);
    // And the untouched font is unaffected.
    assert.equal(F.parseFont(real).numGlyphs, 313);
  });
});
