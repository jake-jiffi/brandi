/**
 * Type as artwork: a TrueType parser, and a converter from a string into one
 * SVG path.
 *
 * A wordmark set as an SVG `<text>` element is not a logo, it is a font
 * dependency. It renders in Georgia on the machine that lacks the face, in
 * something else again in the email client, and at the wrong width in both. A
 * real logo has its type converted to outlines before it leaves the studio,
 * which is why a logo file contains no font and no `<text>`. This module does
 * that conversion, so a typeset wordmark becomes artwork that travels.
 *
 * Everything is read straight out of the sfnt tables, with nothing installed:
 *   - the table directory, plus `head`, `maxp`, `hhea`, `hmtx`, `loca`, `name`
 *   - `cmap` formats 4 and 12, which between them cover every Unicode font
 *   - `glyf` outlines, simple and composite
 *   - `GPOS` lookup type 2 pair kerning, both formats, and the legacy `kern`
 *
 * `fetchGoogleFont` will not download a face Google serves under anything but
 * the public catalogue licence. Google answers HTTP 200 for the Monotype faces
 * it delivers to Workspace subscribers and for its own restricted faces, so the
 * tier has to be read out of the CSS rather than the status line. See the note
 * above `CSS_V2`.
 *
 * PostScript (CFF) outlines are deliberately not supported. An `OTTO` file
 * carries its curves in a `CFF ` table, which is a different format with its
 * own charstring interpreter, and half-reading one produces an empty wordmark
 * rather than an error. `parseFont` says so and stops.
 *
 * Font units are y-up with the baseline at 0. SVG is y-down. Everything from
 * `layoutText` outwards has been flipped; everything below it has not. The two
 * are kept apart deliberately, because a sign error here stays invisible until
 * a logo comes out upside down.
 */

import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ---------------------------------------------------------------------------
// Reading sfnt bytes
// ---------------------------------------------------------------------------

/** All sfnt integers are big-endian, which is what DataView does by default. */
function toBytes(buffer) {
  if (buffer instanceof Uint8Array) return buffer;
  if (buffer instanceof ArrayBuffer) return new Uint8Array(buffer);
  throw new TypeError('parseFont: expected a Buffer, Uint8Array or ArrayBuffer');
}

const tagAt = (dv, o) =>
  String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));

/** F2Dot14: a signed 16-bit fixed-point number with 14 fractional bits. */
const f2dot14 = (dv, o) => dv.getInt16(o) / 16384;

const popcount = (n) => {
  let c = 0;
  let v = n;
  while (v) {
    v &= v - 1;
    c++;
  }
  return c;
};

/**
 * The English family name, for error messages.
 *
 * "This font has no glyph for e-acute" is a bug report nobody can act on.
 * Naming the face turns it into a decision: pick another one, or subset
 * differently. Typographic family (nameID 16) beats the legacy family (nameID
 * 1) because on a large family the legacy name is "Bitter SemiBold", not
 * "Bitter".
 */
function readFamilyName(dv, tables) {
  const t = tables.name;
  if (!t) return null;
  const base = t.offset;
  const count = dv.getUint16(base + 2);
  const storage = base + dv.getUint16(base + 4);
  let legacy = null;
  for (let i = 0; i < count; i++) {
    const rec = base + 6 + i * 12;
    if (rec + 12 > dv.byteLength) break;
    const platformID = dv.getUint16(rec);
    const languageID = dv.getUint16(rec + 4);
    const nameID = dv.getUint16(rec + 6);
    if (nameID !== 1 && nameID !== 16) continue;
    // Mac English is language 0, Windows English (US) is 0x409. Anything else
    // is a translated name, which would put Japanese in an English error.
    if (languageID !== 0 && languageID !== 0x409) continue;
    const length = dv.getUint16(rec + 8);
    const off = storage + dv.getUint16(rec + 10);
    if (off + length > dv.byteLength) continue;
    let s = '';
    if (platformID === 3 || platformID === 0) {
      for (let j = 0; j + 1 < length; j += 2) s += String.fromCharCode(dv.getUint16(off + j));
    } else {
      for (let j = 0; j < length; j++) s += String.fromCharCode(dv.getUint8(off + j));
    }
    if (nameID === 16) return s;
    if (!legacy) legacy = s;
  }
  return legacy;
}

// ---------------------------------------------------------------------------
// cmap
// ---------------------------------------------------------------------------

/**
 * Character map, in preference order (3,10) then (3,1) then (0,x).
 *
 * (3,10) is Windows UCS-4 and reaches past the basic multilingual plane, so it
 * is taken first when a font ships both. (3,1) is Windows BMP, which is what
 * almost every Latin face has. (0,x) is the Unicode platform, and is the
 * fallback for faces that skip the Windows records entirely.
 */
function parseCmap(dv, tables) {
  const t = tables.cmap;
  if (!t) return null;
  const base = t.offset;
  const numTables = dv.getUint16(base + 2);
  const candidates = [];
  for (let i = 0; i < numTables; i++) {
    const rec = base + 4 + i * 8;
    candidates.push({
      platformID: dv.getUint16(rec),
      encodingID: dv.getUint16(rec + 2),
      offset: base + dv.getUint32(rec + 4),
    });
  }
  const rank = (c) => {
    if (c.platformID === 3 && c.encodingID === 10) return 0;
    if (c.platformID === 3 && c.encodingID === 1) return 1;
    if (c.platformID === 0) return 2;
    return 3;
  };
  candidates.sort((a, b) => rank(a) - rank(b));
  for (const c of candidates) {
    if (rank(c) === 3) break;
    if (c.offset + 4 > dv.byteLength) continue;
    const sub = parseCmapSubtable(dv, c.offset);
    if (sub) return { ...sub, platformID: c.platformID, encodingID: c.encodingID };
  }
  return null;
}

function parseCmapSubtable(dv, off) {
  const format = dv.getUint16(off);
  if (format === 4) {
    const segCount = dv.getUint16(off + 6) / 2;
    const endBase = off + 14;
    const startBase = endBase + segCount * 2 + 2; // the reserved pad sits between
    const deltaBase = startBase + segCount * 2;
    const rangeOffsetBase = deltaBase + segCount * 2;
    const end = new Uint16Array(segCount);
    const start = new Uint16Array(segCount);
    const delta = new Int16Array(segCount);
    const rangeOffset = new Uint16Array(segCount);
    for (let i = 0; i < segCount; i++) {
      end[i] = dv.getUint16(endBase + i * 2);
      start[i] = dv.getUint16(startBase + i * 2);
      delta[i] = dv.getInt16(deltaBase + i * 2);
      rangeOffset[i] = dv.getUint16(rangeOffsetBase + i * 2);
    }
    return { format: 4, segCount, end, start, delta, rangeOffset, rangeOffsetBase };
  }
  if (format === 12) {
    // The only 32-bit count in anything this module reads, so the only one that
    // can ask for an array sized from a number a corrupt file chose. Twelve
    // bytes a group is the floor, so the file itself is the ceiling.
    const numGroups = Math.min(dv.getUint32(off + 12), (dv.byteLength - off - 16) / 12);
    const groups = [];
    for (let i = 0; i < numGroups; i++) {
      const r = off + 16 + i * 12;
      groups.push({ start: dv.getUint32(r), end: dv.getUint32(r + 4), glyph: dv.getUint32(r + 8) });
    }
    return { format: 12, groups };
  }
  return null;
}

/**
 * Glyph id for a code point, or 0.
 *
 * Glyph 0 is `.notdef` by definition, so 0 doubles as "not in this font".
 * Callers here treat that as a failure rather than drawing the tofu box.
 */
export function glyphForCodePoint(font, codePoint) {
  const cmap = font.cmap;
  if (!cmap) return 0;
  if (cmap.format === 12) {
    let lo = 0;
    let hi = cmap.groups.length - 1;
    while (lo <= hi) {
      const m = (lo + hi) >> 1;
      const g = cmap.groups[m];
      if (codePoint < g.start) hi = m - 1;
      else if (codePoint > g.end) lo = m + 1;
      else return g.glyph + (codePoint - g.start);
    }
    return 0;
  }
  // Format 4 addresses the BMP only, so anything above it is simply absent.
  if (codePoint > 0xffff) return 0;
  let lo = 0;
  let hi = cmap.segCount - 1;
  let seg = -1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (cmap.end[m] < codePoint) lo = m + 1;
    else {
      seg = m;
      hi = m - 1;
    }
  }
  if (seg < 0 || cmap.start[seg] > codePoint) return 0;
  if (cmap.rangeOffset[seg] === 0) return (codePoint + cmap.delta[seg]) & 0xffff;
  // idRangeOffset is a byte offset measured from its own slot, which is what
  // makes glyphIdArray reachable without a separate offset for it.
  const addr =
    cmap.rangeOffsetBase + seg * 2 + cmap.rangeOffset[seg] + (codePoint - cmap.start[seg]) * 2;
  if (addr + 2 > font.dv.byteLength) return 0;
  const gid = font.dv.getUint16(addr);
  return gid === 0 ? 0 : (gid + cmap.delta[seg]) & 0xffff;
}

// ---------------------------------------------------------------------------
// GPOS and legacy kern
// ---------------------------------------------------------------------------

function parseCoverage(dv, off) {
  const format = dv.getUint16(off);
  if (format === 1) {
    const n = dv.getUint16(off + 2);
    const glyphs = new Uint16Array(n);
    for (let i = 0; i < n; i++) glyphs[i] = dv.getUint16(off + 4 + i * 2);
    return { format: 1, glyphs };
  }
  if (format === 2) {
    const n = dv.getUint16(off + 2);
    const ranges = [];
    for (let i = 0; i < n; i++) {
      const r = off + 4 + i * 6;
      ranges.push({ start: dv.getUint16(r), end: dv.getUint16(r + 2), index: dv.getUint16(r + 4) });
    }
    return { format: 2, ranges };
  }
  // Only 1 and 2 exist. A third value means these offsets are being misread,
  // and carrying on from there is how a kern table turns into invented numbers.
  throw new Error(`parseFont: unknown coverage table format ${format} in GPOS`);
}

function coverageIndex(cov, gid) {
  if (cov.format === 1) {
    let lo = 0;
    let hi = cov.glyphs.length - 1;
    while (lo <= hi) {
      const m = (lo + hi) >> 1;
      if (cov.glyphs[m] < gid) lo = m + 1;
      else if (cov.glyphs[m] > gid) hi = m - 1;
      else return m;
    }
    return -1;
  }
  let lo = 0;
  let hi = cov.ranges.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    const r = cov.ranges[m];
    if (gid < r.start) hi = m - 1;
    else if (gid > r.end) lo = m + 1;
    else return r.index + (gid - r.start);
  }
  return -1;
}

function parseClassDef(dv, off) {
  const format = dv.getUint16(off);
  if (format === 1) {
    const startGlyph = dv.getUint16(off + 2);
    const n = dv.getUint16(off + 4);
    const classes = new Uint16Array(n);
    for (let i = 0; i < n; i++) classes[i] = dv.getUint16(off + 6 + i * 2);
    return { format: 1, startGlyph, classes };
  }
  if (format === 2) {
    const n = dv.getUint16(off + 2);
    const ranges = [];
    for (let i = 0; i < n; i++) {
      const r = off + 4 + i * 6;
      ranges.push({ start: dv.getUint16(r), end: dv.getUint16(r + 2), value: dv.getUint16(r + 4) });
    }
    return { format: 2, ranges };
  }
  throw new Error(`parseFont: unknown class definition format ${format} in GPOS`);
}

/** Anything the table does not list is class 0, which is the spec's default. */
function classOf(cd, gid) {
  if (cd.format === 1) {
    const i = gid - cd.startGlyph;
    return i >= 0 && i < cd.classes.length ? cd.classes[i] : 0;
  }
  let lo = 0;
  let hi = cd.ranges.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    const r = cd.ranges[m];
    if (gid < r.start) hi = m - 1;
    else if (gid > r.end) lo = m + 1;
    else return r.value;
  }
  return 0;
}

const X_ADVANCE = 0x0004;
const valueRecordSize = (vf) => popcount(vf) * 2;
/** Byte offset of xAdvance inside a ValueRecord, or -1 when it carries none. */
const xAdvanceOffset = (vf) => (vf & X_ADVANCE ? 2 * popcount(vf & 0x0003) : -1);

function parsePairPos(dv, off) {
  const format = dv.getUint16(off);
  const coverage = parseCoverage(dv, off + dv.getUint16(off + 2));
  const vf1 = dv.getUint16(off + 4);
  const vf2 = dv.getUint16(off + 6);
  const size1 = valueRecordSize(vf1);
  const size2 = valueRecordSize(vf2);
  const xa = xAdvanceOffset(vf1);
  if (format === 1) {
    const pairSetCount = dv.getUint16(off + 8);
    const sets = [];
    for (let i = 0; i < pairSetCount; i++) {
      const setOff = off + dv.getUint16(off + 10 + i * 2);
      const count = dv.getUint16(setOff);
      const pairs = new Map();
      for (let j = 0; j < count; j++) {
        const rec = setOff + 2 + j * (2 + size1 + size2);
        pairs.set(dv.getUint16(rec), xa < 0 ? 0 : dv.getInt16(rec + 2 + xa));
      }
      sets.push(pairs);
    }
    return { format: 1, coverage, sets };
  }
  if (format === 2) {
    const class1 = parseClassDef(dv, off + dv.getUint16(off + 8));
    const class2 = parseClassDef(dv, off + dv.getUint16(off + 10));
    const class1Count = dv.getUint16(off + 12);
    const class2Count = dv.getUint16(off + 14);
    const recSize = size1 + size2;
    const values = new Int16Array(class1Count * class2Count);
    if (xa >= 0) {
      for (let i = 0; i < class1Count; i++) {
        for (let j = 0; j < class2Count; j++) {
          const k = i * class2Count + j;
          values[k] = dv.getInt16(off + 16 + k * recSize + xa);
        }
      }
    }
    return { format: 2, coverage, class1, class2, class1Count, class2Count, values };
  }
  return null;
}

/**
 * The kerning lookups belonging to the `kern` feature, grouped by lookup.
 *
 * The grouping is not decoration. Within one lookup, the first subtable that
 * covers a pair wins; across lookups, the adjustments add up. Flattening the
 * two levels into one list gets the arithmetic wrong for any font shipping more
 * than one kern lookup, which is most of the larger families.
 *
 * Contextual kerning (lookup types 7 and 8) is not applied. Those are rare in
 * Latin faces, and skipping one loses a refinement rather than inventing a
 * number, which is the trade this module makes everywhere.
 */
function parseGposKern(dv, tables) {
  const t = tables.GPOS;
  if (!t) return [];
  const base = t.offset;
  const scriptListOff = base + dv.getUint16(base + 4);
  const featureListOff = base + dv.getUint16(base + 6);
  const lookupListOff = base + dv.getUint16(base + 8);

  // Every feature any script or language system can reach. A `kern` feature
  // sitting in the list that nothing references is not active, and taking it
  // anyway would kern text the font itself says to leave alone.
  const featureIndices = new Set();
  const scriptCount = dv.getUint16(scriptListOff);
  for (let i = 0; i < scriptCount; i++) {
    const scriptOff = scriptListOff + dv.getUint16(scriptListOff + 2 + i * 6 + 4);
    const langSysOffsets = [];
    const def = dv.getUint16(scriptOff);
    if (def) langSysOffsets.push(scriptOff + def);
    const langSysCount = dv.getUint16(scriptOff + 2);
    for (let j = 0; j < langSysCount; j++) {
      langSysOffsets.push(scriptOff + dv.getUint16(scriptOff + 4 + j * 6 + 4));
    }
    for (const ls of langSysOffsets) {
      const required = dv.getUint16(ls + 2);
      if (required !== 0xffff) featureIndices.add(required);
      const n = dv.getUint16(ls + 4);
      for (let k = 0; k < n; k++) featureIndices.add(dv.getUint16(ls + 6 + k * 2));
    }
  }

  const featureCount = dv.getUint16(featureListOff);
  const lookupIndices = new Set();
  for (const fi of featureIndices) {
    if (fi >= featureCount) continue;
    const rec = featureListOff + 2 + fi * 6;
    if (tagAt(dv, rec) !== 'kern') continue;
    const featureOff = featureListOff + dv.getUint16(rec + 4);
    const n = dv.getUint16(featureOff + 2);
    for (let k = 0; k < n; k++) lookupIndices.add(dv.getUint16(featureOff + 4 + k * 2));
  }

  const lookupCount = dv.getUint16(lookupListOff);
  const lookups = [];
  for (const li of [...lookupIndices].sort((a, b) => a - b)) {
    if (li >= lookupCount) continue;
    const lookupOff = lookupListOff + dv.getUint16(lookupListOff + 2 + li * 2);
    const type = dv.getUint16(lookupOff);
    const subCount = dv.getUint16(lookupOff + 4);
    const subtables = [];
    for (let s = 0; s < subCount; s++) {
      let off = lookupOff + dv.getUint16(lookupOff + 6 + s * 2);
      let effective = type;
      // Type 9 is Extension Positioning: a 32-bit indirection that exists so a
      // large GPOS can escape the 16-bit offset limit. Bigger families put
      // their kerning behind it, so not following it loses kerning entirely.
      if (type === 9) {
        effective = dv.getUint16(off + 2);
        off += dv.getUint32(off + 4);
      }
      if (effective !== 2) continue;
      const parsed = parsePairPos(dv, off);
      if (parsed) subtables.push(parsed);
    }
    if (subtables.length) lookups.push(subtables);
  }
  return lookups;
}

/**
 * The legacy `kern` table, format 0 only.
 *
 * Apple's version of this table opens with a 32-bit version field and carries
 * different subtable formats; the OpenType one opens with 16 bits of zero. Only
 * the OpenType shape is read, because guessing between the two on a two-byte
 * disagreement is how a kern table gets read as garbage.
 */
function parseLegacyKern(dv, tables) {
  const pairs = new Map();
  const t = tables.kern;
  if (!t) return pairs;
  const base = t.offset;
  if (dv.getUint16(base) !== 0) return pairs;
  const nTables = dv.getUint16(base + 2);
  let p = base + 4;
  for (let i = 0; i < nTables; i++) {
    if (p + 14 > base + t.length) break;
    const length = dv.getUint16(p + 2);
    const coverage = dv.getUint16(p + 4);
    const format = coverage >> 8;
    const horizontal = (coverage & 0x0001) !== 0;
    const minimum = (coverage & 0x0002) !== 0;
    const crossStream = (coverage & 0x0004) !== 0;
    // Minimum and cross-stream subtables mean something else entirely: one sets
    // a floor rather than an adjustment, the other moves the pen off-axis.
    if (format === 0 && horizontal && !minimum && !crossStream) {
      const nPairs = dv.getUint16(p + 6);
      for (let j = 0; j < nPairs; j++) {
        const r = p + 14 + j * 6;
        pairs.set(dv.getUint16(r) * 65536 + dv.getUint16(r + 2), dv.getInt16(r + 4));
      }
    }
    if (length === 0) break; // a zero length would loop here forever
    p += length;
  }
  return pairs;
}

/**
 * Horizontal kerning between two glyphs, in font units. 0 when nothing applies.
 *
 * GPOS is read in full: the `kern` feature is followed through the script and
 * language system lists, and both pair adjustment formats are handled, format 1
 * for explicit pairs and format 2 for class pairs.
 *
 * The legacy `kern` table is read only when GPOS has no `kern` feature at all,
 * never as a per-pair fallback. That is what HarfBuzz does, so it is what a
 * browser does, and a wordmark that kerns differently from the same string set
 * in the same face on a web page is a wordmark somebody will file a bug about.
 * The two tables genuinely disagree: across the faces on one machine that ship
 * both, roughly a fifth of the pairs in the old table are ones GPOS has since
 * decided need no adjustment.
 */
export function kernPair(font, leftGlyphId, rightGlyphId) {
  if (font.kerning.gpos.length === 0) {
    return font.kerning.legacy.get(leftGlyphId * 65536 + rightGlyphId) ?? 0;
  }
  let total = 0;
  for (const lookup of font.kerning.gpos) {
    for (const st of lookup) {
      const ci = coverageIndex(st.coverage, leftGlyphId);
      if (ci < 0) continue;
      if (st.format === 1) {
        const set = st.sets[ci];
        if (!set) continue;
        const v = set.get(rightGlyphId);
        if (v === undefined) continue;
        total += v;
        break;
      }
      const c1 = classOf(st.class1, leftGlyphId);
      const c2 = classOf(st.class2, rightGlyphId);
      if (c1 >= st.class1Count || c2 >= st.class2Count) continue;
      total += st.values[c1 * st.class2Count + c2];
      break;
    }
  }
  return total;
}

// ---------------------------------------------------------------------------
// glyf outlines
// ---------------------------------------------------------------------------

const ON_CURVE = 0x01;
const X_SHORT = 0x02;
const Y_SHORT = 0x04;
const REPEAT_FLAG = 0x08;
const X_SAME_OR_POSITIVE = 0x10;
const Y_SAME_OR_POSITIVE = 0x20;

const ARG_1_AND_2_ARE_WORDS = 0x0001;
const ARGS_ARE_XY_VALUES = 0x0002;
const WE_HAVE_A_SCALE = 0x0008;
const MORE_COMPONENTS = 0x0020;
const WE_HAVE_AN_X_AND_Y_SCALE = 0x0040;
const WE_HAVE_A_TWO_BY_TWO = 0x0080;

function readSimpleContours(dv, g, numberOfContours) {
  let p = g + 10;
  const endPts = new Array(numberOfContours);
  for (let i = 0; i < numberOfContours; i++) {
    endPts[i] = dv.getUint16(p);
    p += 2;
  }
  const numPoints = numberOfContours > 0 ? endPts[numberOfContours - 1] + 1 : 0;
  p += 2 + dv.getUint16(p); // hinting instructions, which a static outline ignores

  const flags = new Uint8Array(numPoints);
  for (let i = 0; i < numPoints; ) {
    const f = dv.getUint8(p++);
    flags[i++] = f;
    // The repeat byte counts *additional* copies, so a run of nine identical
    // flags is one flag byte and a repeat count of eight.
    if (f & REPEAT_FLAG) {
      let r = dv.getUint8(p++);
      while (r-- > 0 && i < numPoints) flags[i++] = f;
    }
  }

  // Coordinates are stored as deltas, in three encodings chosen per point: one
  // signed byte, two signed bytes, or nothing at all when the value repeats.
  const xs = new Int32Array(numPoints);
  let x = 0;
  for (let i = 0; i < numPoints; i++) {
    const f = flags[i];
    if (f & X_SHORT) {
      const d = dv.getUint8(p++);
      x += f & X_SAME_OR_POSITIVE ? d : -d;
    } else if (!(f & X_SAME_OR_POSITIVE)) {
      x += dv.getInt16(p);
      p += 2;
    }
    xs[i] = x;
  }
  const ys = new Int32Array(numPoints);
  let y = 0;
  for (let i = 0; i < numPoints; i++) {
    const f = flags[i];
    if (f & Y_SHORT) {
      const d = dv.getUint8(p++);
      y += f & Y_SAME_OR_POSITIVE ? d : -d;
    } else if (!(f & Y_SAME_OR_POSITIVE)) {
      y += dv.getInt16(p);
      p += 2;
    }
    ys[i] = y;
  }

  const contours = [];
  let from = 0;
  for (let c = 0; c < numberOfContours; c++) {
    const to = endPts[c];
    const pts = [];
    for (let i = from; i <= to && i < numPoints; i++) {
      pts.push({ x: xs[i], y: ys[i], onCurve: (flags[i] & ON_CURVE) !== 0 });
    }
    if (pts.length) contours.push(pts);
    from = to + 1;
  }
  return contours;
}

function readComponents(dv, g) {
  let p = g + 10;
  const comps = [];
  for (;;) {
    const flags = dv.getUint16(p);
    const glyphIndex = dv.getUint16(p + 2);
    p += 4;
    let arg1;
    let arg2;
    if (flags & ARG_1_AND_2_ARE_WORDS) {
      arg1 = dv.getInt16(p);
      arg2 = dv.getInt16(p + 2);
      p += 4;
    } else {
      arg1 = dv.getInt8(p);
      arg2 = dv.getInt8(p + 1);
      p += 2;
    }
    let a = 1;
    let b = 0;
    let c = 0;
    let d = 1;
    if (flags & WE_HAVE_A_SCALE) {
      a = d = f2dot14(dv, p);
      p += 2;
    } else if (flags & WE_HAVE_AN_X_AND_Y_SCALE) {
      a = f2dot14(dv, p);
      d = f2dot14(dv, p + 2);
      p += 4;
    } else if (flags & WE_HAVE_A_TWO_BY_TWO) {
      a = f2dot14(dv, p);
      b = f2dot14(dv, p + 2);
      c = f2dot14(dv, p + 4);
      d = f2dot14(dv, p + 6);
      p += 8;
    }
    const xy = (flags & ARGS_ARE_XY_VALUES) !== 0;
    comps.push({
      glyphIndex,
      a,
      b,
      c,
      d,
      dx: xy ? arg1 : 0,
      dy: xy ? arg2 : 0,
      // Without ARGS_ARE_XY_VALUES the arguments are point numbers, and the
      // component is anchored by matching one of its points to one already
      // placed. Unsigned, because a point number is an index.
      match: xy ? null : [arg1 & 0xffff, arg2 & 0xffff],
    });
    if (!(flags & MORE_COMPONENTS)) break;
  }
  return comps;
}

const MAX_COMPONENT_DEPTH = 8;

/**
 * A glyph's outline points in font units, with composites resolved.
 *
 * Composites are not a curiosity: every accented character is one, so a font
 * that renders "e" but drops the accented forms has a composite bug rather than
 * a coverage gap. The offset is applied unscaled, which is the Microsoft
 * default and what every shipping rasteriser does when SCALED_COMPONENT_OFFSET
 * is absent, as it almost always is.
 */
function glyphContours(font, glyphId, depth = 0) {
  if (!Number.isInteger(glyphId) || glyphId < 0 || glyphId >= font.numGlyphs) {
    throw new RangeError(
      `glyphPath: glyph ${glyphId} is outside ${font.family}, which has ${font.numGlyphs} glyphs`,
    );
  }
  if (depth > MAX_COMPONENT_DEPTH) {
    throw new Error(
      `glyphPath: composite glyphs in ${font.family} nest more than ${MAX_COMPONENT_DEPTH} deep`,
    );
  }
  const start = font.loca[glyphId];
  const end = font.loca[glyphId + 1];
  if (end <= start) return []; // a space, or anything else with no ink
  const dv = font.dv;
  const g = font.tables.glyf.offset + start;
  const numberOfContours = dv.getInt16(g);
  if (numberOfContours >= 0) return readSimpleContours(dv, g, numberOfContours);

  const out = [];
  const placed = []; // every point placed so far, for point-matched anchoring
  for (const comp of readComponents(dv, g)) {
    const sub = glyphContours(font, comp.glyphIndex, depth + 1);
    const flat = [];
    const moved = sub.map((contour) =>
      contour.map((pt) => {
        const q = {
          x: comp.a * pt.x + comp.c * pt.y,
          y: comp.b * pt.x + comp.d * pt.y,
          onCurve: pt.onCurve,
        };
        flat.push(q);
        return q;
      }),
    );
    let { dx, dy } = comp;
    if (comp.match) {
      const anchor = placed[comp.match[0]];
      const target = flat[comp.match[1]];
      if (anchor && target) {
        dx = anchor.x - target.x;
        dy = anchor.y - target.y;
      } else {
        dx = 0;
        dy = 0;
      }
    }
    for (const q of flat) {
      q.x += dx;
      q.y += dy;
      placed.push(q);
    }
    out.push(...moved);
  }
  return out;
}

const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, onCurve: true });

/**
 * One TrueType contour as SVG path segments.
 *
 * Two things in the format have no SVG equivalent and have to be reconstructed:
 *
 * Consecutive off-curve points imply an on-curve point at their midpoint. The
 * format leaves it out because it is derivable, and a converter that does not
 * derive it draws a straight line through the middle of every curve.
 *
 * A contour may begin off-curve, because the point list is a ring with no
 * privileged first element. When it does, the drawing has to start somewhere on
 * the curve: the last point if that is on-curve, otherwise the midpoint between
 * the last point and the first. Starting at the off-curve point instead puts a
 * corner in the middle of a smooth curve, most visibly on an "o".
 */
function contourSegments(pts, out) {
  const n = pts.length;
  if (n === 0) return;
  const first = pts[0];
  const last = pts[n - 1];
  let start;
  let work;
  if (first.onCurve) {
    start = first;
    work = pts.slice(1);
  } else if (last.onCurve) {
    start = last;
    work = pts.slice(0, n - 1);
  } else {
    start = mid(last, first);
    work = pts.slice(0);
  }

  out.push(['M', start.x, start.y]);
  for (let i = 0; i < work.length; i++) {
    const pt = work[i];
    if (pt.onCurve) {
      out.push(['L', pt.x, pt.y]);
      continue;
    }
    // The curve ends at the next on-curve point, or at the implied midpoint
    // when the next point is another control point. `start` closes the ring and
    // is on-curve by construction, so the final segment always has an end.
    const next = i + 1 < work.length ? work[i + 1] : start;
    const endPt = next.onCurve ? next : mid(pt, next);
    out.push(['Q', pt.x, pt.y, endPt.x, endPt.y]);
    if (next.onCurve) i++;
  }
  out.push(['Z']);
}

/** Where a quadratic turns on one axis, or null when it does not turn inside. */
function quadExtremum(p0, p1, p2) {
  const den = p0 - 2 * p1 + p2;
  if (Math.abs(den) < 1e-12) return null;
  const t = (p0 - p1) / den;
  if (t <= 0 || t >= 1) return null;
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

/**
 * The tight bounding box of the drawn curve, not of its control points.
 *
 * The control box is easier, and is what a `glyf` header stores, but it is
 * loose by a few percent on round letters. A wordmark's viewBox is its bounding
 * box, so that slack turns into uneven padding a designer then has to take back
 * out by hand.
 */
function segmentsBounds(segs) {
  let xMin = Infinity;
  let yMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;
  const addX = (v) => {
    if (v < xMin) xMin = v;
    if (v > xMax) xMax = v;
  };
  const addY = (v) => {
    if (v < yMin) yMin = v;
    if (v > yMax) yMax = v;
  };
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  for (const s of segs) {
    if (s[0] === 'M') {
      cx = sx = s[1];
      cy = sy = s[2];
      addX(cx);
      addY(cy);
    } else if (s[0] === 'L') {
      cx = s[1];
      cy = s[2];
      addX(cx);
      addY(cy);
    } else if (s[0] === 'Q') {
      const ex = quadExtremum(cx, s[1], s[3]);
      const ey = quadExtremum(cy, s[2], s[4]);
      if (ex !== null) addX(ex);
      if (ey !== null) addY(ey);
      cx = s[3];
      cy = s[4];
      addX(cx);
      addY(cy);
    } else {
      cx = sx;
      cy = sy;
    }
  }
  if (xMin === Infinity) return { xMin: 0, yMin: 0, xMax: 0, yMax: 0, width: 0, height: 0 };
  return { xMin, yMin, xMax, yMax, width: xMax - xMin, height: yMax - yMin };
}

const PRECISION = 3;

/** Segments to a `d` string, in the same shape `svg.mjs` reads back. */
function pathString(segs, precision = PRECISION) {
  const f = (n) => {
    const r = Number(n.toFixed(precision));
    return Object.is(r, -0) ? '0' : String(r);
  };
  return segs
    .map((s) => (s[0] === 'Z' ? 'Z' : s[0] + s.slice(1).map(f).join(' ')))
    .join(' ')
    .trim();
}

/**
 * One glyph's outline in font units, y-up, exactly as the font stores it.
 *
 * Nothing here is scaled or flipped, so these numbers can be checked straight
 * against the font's own tables. `layoutText` is where the axis changes.
 */
export function glyphPath(font, glyphId) {
  const segs = [];
  for (const contour of glyphContours(font, glyphId)) contourSegments(contour, segs);
  return {
    d: pathString(segs),
    advance: font.advanceWidths[glyphId],
    bbox: segmentsBounds(segs),
  };
}

// ---------------------------------------------------------------------------
// Parsing a font
// ---------------------------------------------------------------------------

const REQUIRED = ['head', 'maxp', 'hhea', 'hmtx', 'loca', 'glyf', 'cmap'];

/**
 * Read an sfnt buffer into everything the rest of this module needs.
 *
 * The result holds a DataView over the original bytes, because outlines are
 * read on demand rather than up front: a text face carries thousands of glyphs
 * and a wordmark uses eight of them. That also makes the object unserialisable,
 * which is fine for something whose whole job is to be consumed in the process
 * that built it.
 */
export function parseFont(buffer) {
  const bytes = toBytes(buffer);
  if (bytes.byteLength < 12) throw new Error('parseFont: buffer is too short to be a font file');
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const versionTag = tagAt(dv, 0);
  const version = dv.getUint32(0);
  if (versionTag === 'ttcf') {
    throw new Error(
      'parseFont: this is a TrueType collection (ttcf), which packs several faces into one file. Extract the face you want first.',
    );
  }

  const numTables = dv.getUint16(4);
  const tables = {};
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16;
    if (rec + 16 > bytes.byteLength) break;
    const offset = dv.getUint32(rec + 8);
    const length = dv.getUint32(rec + 12);
    if (offset + length > bytes.byteLength) continue; // truncated, so unreadable
    tables[tagAt(dv, rec)] = { offset, length };
  }

  const family = readFamilyName(dv, tables) ?? 'this font';

  // CFF outlines live in a `CFF ` table with their own charstring interpreter.
  // Reading the sfnt shell, finding no `glyf` and carrying on would hand back a
  // wordmark with no ink in it, which reads as a layout bug for hours.
  if (versionTag === 'OTTO' || (!tables.glyf && tables['CFF '])) {
    throw new Error(
      `parseFont: ${family} uses PostScript (CFF) outlines, which this parser does not read. Pick a TrueType-flavoured face, or convert this one to TrueType outlines first.`,
    );
  }
  if (version !== 0x00010000 && versionTag !== 'true') {
    throw new Error(
      `parseFont: not a TrueType font (sfnt version ${JSON.stringify(versionTag)}, 0x${version.toString(16).padStart(8, '0')})`,
    );
  }
  for (const tag of REQUIRED) {
    if (!tables[tag]) {
      throw new Error(`parseFont: ${family} is missing the "${tag}" table, or it is truncated`);
    }
  }

  const h = tables.head.offset;
  const head = {
    unitsPerEm: dv.getUint16(h + 18),
    indexToLocFormat: dv.getInt16(h + 50),
    xMin: dv.getInt16(h + 36),
    yMin: dv.getInt16(h + 38),
    xMax: dv.getInt16(h + 40),
    yMax: dv.getInt16(h + 42),
  };
  if (head.unitsPerEm <= 0) {
    throw new Error(
      `parseFont: ${family} declares unitsPerEm ${head.unitsPerEm}, which cannot be scaled`,
    );
  }

  const numGlyphs = dv.getUint16(tables.maxp.offset + 4);

  const hh = tables.hhea.offset;
  const hhea = {
    ascender: dv.getInt16(hh + 4),
    descender: dv.getInt16(hh + 6),
    lineGap: dv.getInt16(hh + 8),
    numberOfHMetrics: Math.min(dv.getUint16(hh + 34), numGlyphs),
  };

  // The last `numberOfHMetrics` entry's advance repeats for every glyph after
  // it, which is how a monospaced tail or a CJK block is stored compactly.
  const advanceWidths = new Uint16Array(numGlyphs);
  const hm = tables.hmtx.offset;
  let lastAdvance = 0;
  for (let i = 0; i < numGlyphs; i++) {
    if (i < hhea.numberOfHMetrics) lastAdvance = dv.getUint16(hm + i * 4);
    advanceWidths[i] = lastAdvance;
  }

  // `loca` has to hold one offset per glyph plus a terminator, so a `maxp` that
  // claims more glyphs than the table can describe is a corrupt font, not a
  // large one. Checked here rather than left to run off the end: without it a
  // `numGlyphs` of 65535 in a 45KB file threw `Offset is outside the bounds of
  // the DataView`, which is safe and tells nobody anything, in a parser that is
  // otherwise careful to name what is wrong.
  const locaEntry = head.indexToLocFormat === 0 ? 2 : 4;
  const locaNeeded = (numGlyphs + 1) * locaEntry;
  if (tables.loca.length < locaNeeded) {
    throw new Error(
      `parseFont: maxp claims ${numGlyphs} glyphs, which needs a loca table of ${locaNeeded} bytes, and this font's is ${tables.loca.length}. The font is corrupt or truncated.`,
    );
  }

  const loca = new Uint32Array(numGlyphs + 1);
  const lo = tables.loca.offset;
  if (head.indexToLocFormat === 0) {
    // The short format stores halved offsets, which is why a font using it pads
    // every glyph to an even length.
    for (let i = 0; i <= numGlyphs; i++) loca[i] = dv.getUint16(lo + i * 2) * 2;
  } else {
    for (let i = 0; i <= numGlyphs; i++) loca[i] = dv.getUint32(lo + i * 4);
  }

  const font = {
    family,
    tables,
    bytes,
    dv,
    head,
    hhea,
    numGlyphs,
    unitsPerEm: head.unitsPerEm,
    // An `fvar` table means the outlines in `glyf` are one master of a variable
    // family, and `gvar` deltas, which are not applied here, are what move them
    // to any other instance. Measured against Chrome on macOS system faces, the
    // default master can differ from what a browser draws by most of the ink,
    // because the operating system picks an optical size instance by default.
    // Google Fonts CSS v1 serves static instances, so anything `fetchGoogleFont`
    // returns is unaffected; a variable font handed in from elsewhere is not.
    variable: Boolean(tables.fvar),
    advanceWidths,
    loca,
    cmap: parseCmap(dv, tables),
    kerning: { gpos: parseGposKern(dv, tables), legacy: parseLegacyKern(dv, tables) },
  };
  if (!font.cmap) {
    throw new Error(
      `parseFont: ${family} has no Unicode character map this parser can read (cmap formats 4 and 12 are supported)`,
    );
  }
  return font;
}

// ---------------------------------------------------------------------------
// Setting a string
// ---------------------------------------------------------------------------

const codePointLabel = (cp) => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;

/** Move a glyph's segments to the pen position and flip to SVG's y-down axis. */
function place(segs, originX, scale) {
  return segs.map((s) => {
    if (s[0] === 'Z') return ['Z'];
    const out = [s[0]];
    for (let i = 1; i < s.length; i += 2) out.push(originX + s[i] * scale, -s[i + 1] * scale);
    return out;
  });
}

/**
 * Set a string as one path, in SVG coordinates, with the baseline at y = 0.
 *
 * `tracking` is in thousandths of an em, which is how a designer states it and
 * how every type tool reports it: 20 tracking is 0.02em, so at size 100 it adds
 * 2 units to each gap. There are n - 1 gaps, not n, because tracking is space
 * between letters and a trailing one would push the mark off centre.
 *
 * `pairAdjust` is a map like `{ Av: -30 }` in the same thousandths, applied on
 * top of the font's own kerning. It exists because metric kerning is designed
 * for running text at reading sizes, while a wordmark is a single object at
 * display size where every gap gets looked at directly. The code does the
 * metric pass; a person supplies the optical corrections, and this is where
 * they go.
 *
 * A character with no glyph throws. A wordmark that has quietly lost its
 * diacritic is worse than one that failed to build, because it ships.
 *
 * Text is walked one code point at a time, so precomposed characters set
 * correctly and combining sequences do not: GPOS mark attachment is not
 * implemented, and a combining acute would be placed by its advance rather
 * than over the letter. Normalise to NFC before setting a wordmark.
 */
export function layoutText(font, text, options = {}) {
  const { size = 100, tracking = 0, kerning = true, pairAdjust = {} } = options;
  if (!(size > 0)) throw new TypeError(`layoutText: size must be positive, got ${size}`);
  const scale = size / font.unitsPerEm;
  const chars = [...String(text)];

  const segs = [];
  const glyphs = [];
  let pen = 0;
  let previous = null;

  for (const ch of chars) {
    const cp = ch.codePointAt(0);
    const glyphId = glyphForCodePoint(font, cp);
    if (glyphId === 0) {
      throw new Error(
        `layoutText: ${font.family} has no glyph for ${JSON.stringify(ch)} (${codePointLabel(cp)}). Pick a face that covers it rather than shipping a wordmark with a character missing.`,
      );
    }

    let kern = 0;
    let adjust = 0;
    if (previous !== null) {
      if (kerning) kern = kernPair(font, previous.glyphId, glyphId) * scale;
      // Multiply before dividing so a designer's round number stays round:
      // (100 * 30) / 1000 is exactly 3, while 30 / 1000 * 100 is not.
      const named = pairAdjust[previous.char + ch];
      if (named) adjust = (size * named) / 1000;
      pen += kern + adjust + (size * tracking) / 1000;
    }

    const glyphSegs = [];
    for (const contour of glyphContours(font, glyphId)) contourSegments(contour, glyphSegs);
    const placed = place(glyphSegs, pen, scale);
    segs.push(...placed);

    const entry = {
      char: ch,
      codePoint: cp,
      glyphId,
      x: pen,
      advance: font.advanceWidths[glyphId] * scale,
      kern,
      adjust,
      d: pathString(placed),
    };
    glyphs.push(entry);
    pen += entry.advance;
    previous = entry;
  }

  const bbox = segmentsBounds(segs);
  return { d: pathString(segs), width: pen, height: bbox.height, bbox, glyphs };
}

const XML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const escapeXml = (s) => String(s).replace(/[&<>"]/g, (c) => XML_ESCAPES[c]);

/**
 * A standalone SVG holding the string as outlines and nothing else.
 *
 * The viewBox is integral and tight to the ink, so the file's bounding box is
 * the mark's bounding box and clear space can be measured off it. Rounding
 * outwards rather than to nearest is what keeps the last hundredth of a curve
 * inside the frame.
 *
 * There is no `<text>` element and no font reference, which is the whole point.
 * `fill` is written explicitly, because a path with no fill inherits whatever
 * the host page decided; `currentColor` is a reasonable thing to pass when that
 * is genuinely what is wanted.
 */
export function textToSvg(font, text, options = {}) {
  const { fill = '#000000', ...layout } = options;
  const laid = layoutText(font, text, layout);
  const x0 = Math.floor(laid.bbox.xMin);
  const y0 = Math.floor(laid.bbox.yMin);
  // A string of spaces has no ink and would give a zero-sized frame, which most
  // renderers treat as "draw nothing" and some treat as an error.
  const w = Math.max(1, Math.ceil(laid.bbox.xMax) - x0);
  const h = Math.max(1, Math.ceil(laid.bbox.yMax) - y0);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" ` +
    `viewBox="${x0} ${y0} ${w} ${h}" role="img" aria-label="${escapeXml(text)}">` +
    `<path d="${laid.d}" fill="${fill}"/></svg>`
  );
}

// ---------------------------------------------------------------------------
// Getting a font
// ---------------------------------------------------------------------------

/**
 * Google Fonts serves different things to different browsers, and only the old
 * API hands back a file that can be parsed.
 *
 * CSS v2 answers a modern User-Agent with an opaque `/l/font?kit=` blob that is
 * not an sfnt at all. CSS v1, asked with a User-Agent old enough to predate
 * WOFF, answers with a direct `.ttf` URL. That is the entire reason for the
 * version and the header below. Neither is superstition.
 */
const CSS_V1 = 'https://fonts.googleapis.com/css';
const OLD_UA = 'Mozilla/4.0';

/**
 * Google Fonts serves three licence tiers and answers HTTP 200 to all of them.
 *
 *   public       the open catalogue, OFL or Apache. Inter, Bitter, Jost.
 *   commercial   Monotype faces delivered for Workspace subscribers. Gill Sans,
 *                Avenir, Helvetica. Served, renderable, and not licensed for a
 *                third party's brand.
 *   restricted   Google's own faces. Product Sans carries a banner pointing at
 *                fonts.google.com/license/googlerestricted.
 *
 * A status probe passes every one of them, so the tier has to be read off the
 * URL the CSS points at. That makes the request shape part of the answer, and
 * it is the opposite shape from the one the download uses:
 *
 *   licence check   css2, modern browser User-Agent
 *   download        css v1, `Mozilla/4.0`
 *
 * The two must not be merged. Ask css2 with an old User-Agent and the `/l/font`
 * path comes back for public faces too: measured today, css2 answers
 * `Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)` with `/l/font?kit=` for
 * Bitter, which is OFL. On that request `/l/` means "this client cannot take
 * woff2", not "this face is licensed". Classifying off the download request
 * would therefore condemn most of the open catalogue, and classifying off css2
 * with the download's User-Agent would do the same.
 */
const CSS_V2 = 'https://fonts.googleapis.com/css2';
const MODERN_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const googleCssV2Url = (name) =>
  `${CSS_V2}?family=${encodeURIComponent(name).replace(/%20/g, '+')}`;

/**
 * Which tier a css2 body describes. The order is the whole logic: Product Sans
 * is served from the public `/s/` path and is still Google-only, so the banner
 * has to be read before the path.
 */
export function googleFontTier(cssBody) {
  const css = String(cssBody ?? '');
  if (/googlerestricted/.test(css)) return 'restricted';
  if (/fonts\.gstatic\.com\/l\/font\?kit=/.test(css)) return 'commercial';
  if (/fonts\.gstatic\.com\/s\//.test(css)) return 'public';
  return 'missing';
}

/** Whether a css2 body describes a face that may go into somebody's logo. */
export function isUsableGoogleFont(cssBody) {
  return googleFontTier(cssBody) === 'public';
}

/**
 * The one family Google's own banner misses.
 *
 * Product Sans and Google Symbols carry the `googlerestricted` banner, so the
 * CSS classifies them. Google Sans does not: measured against the live service,
 * `Google Sans`, `Google Sans Text`, `Google Sans Display`, `Google Sans Flex`
 * and `Google Sans Code` are all served from the public `/s/` path with no
 * banner, which reads as open.
 *
 * Nothing in the public metadata separates them either. `fonts.google.com/
 * metadata/fonts` carries an `isBrandFont` flag, but it is true for Roboto and
 * for all two hundred-odd Noto families, which are Apache and OFL and entirely
 * usable, so gating on it would refuse most of the open catalogue. There is no
 * structural signal, so this is a list, and a list is a thing that rots.
 *
 * It stays because it is one company's corporate typeface, five names under one
 * prefix, and the alternative is a known hole in a gate whose whole job is to
 * keep somebody else's trademark out of a client's. `allowUnlicensed` is the
 * way past it for anyone who has checked and disagrees.
 */
const BRAND_ONLY = /^google sans\b/i;

const LICENCE_TIERS = new Set(['public', 'commercial', 'restricted', 'missing']);

const REFUSAL = {
  commercial: (n) =>
    `${n} is served by Google Fonts under a commercial licence (fonts.gstatic.com/l/font), not the public catalogue. It cannot be used for a logo. Pick a public-catalogue face.`,
  restricted: (n) =>
    `${n} is served under Google's restricted licence (https://fonts.google.com/license/googlerestricted), which keeps it for Google's own products. It cannot be used for a logo. Pick a public-catalogue face.`,
  missing: (n) =>
    `Google Fonts does not serve a family called "${n}". Check the spelling against the catalogue at https://fonts.google.com.`,
};

/**
 * What licence Google Fonts serves a family under.
 *
 * Asked as a modern browser against css2, which is the only request shape whose
 * answer means what it appears to mean. See the note above `CSS_V2`.
 */
export async function checkGoogleFontLicence(family) {
  const name = String(family ?? '').trim();
  if (!name) throw new TypeError('checkGoogleFontLicence: a family name is required');
  const cssUrl = googleCssV2Url(name);
  const res = await fetch(cssUrl, { headers: { 'User-Agent': MODERN_UA } });
  // An unserved family answers 400, which is the only status that carries
  // information here. Every tier that is served answers 200.
  if (!res.ok) return { usable: false, tier: 'missing', cssUrl };
  // The name is checked after the status, so a family Google does not serve is
  // reported as missing rather than as somebody's brand face.
  const tier = BRAND_ONLY.test(name) ? 'restricted' : googleFontTier(await res.text());
  return { usable: tier === 'public', tier, cssUrl };
}

/**
 * The gate `fetchGoogleFont` runs before it downloads anything.
 *
 * The verdict is cached beside the font because a licence is a fact about the
 * family, not about this run, and re-asking on every build would undo the point
 * of having a cache at all. "missing" is deliberately not cached: a typo and a
 * transient 400 look the same, and neither should be remembered as the truth
 * about a family that may be in the catalogue tomorrow.
 */
async function licenceGate(name, dir, licenceFile, allowUnlicensed) {
  let tier = null;
  if (existsSync(licenceFile)) tier = (await readFile(licenceFile, 'utf8')).trim();
  if (!LICENCE_TIERS.has(tier)) {
    tier = (await checkGoogleFontLicence(name)).tier;
    if (tier !== 'missing') {
      await mkdir(dir, { recursive: true });
      await writeFile(licenceFile, tier);
    }
  }
  const licence = { usable: tier === 'public', tier, cssUrl: googleCssV2Url(name) };
  if (licence.usable) return { licence, warning: null };
  const refusal = REFUSAL[tier](name);
  if (!allowUnlicensed) throw new Error(`fetchGoogleFont: ${refusal}`);
  return {
    licence,
    warning: `${refusal} Downloaded anyway because allowUnlicensed was set: measure with it, do not ship it.`,
  };
}

/** TrueType, Apple's variant tag, a collection, or CFF. Anything else is not a font. */
function looksLikeSfnt(buffer) {
  if (buffer.length < 4) return false;
  const n = (buffer[0] << 24) | (buffer[1] << 16) | (buffer[2] << 8) | buffer[3];
  if (n === 0x00010000) return true;
  const tag = String.fromCharCode(buffer[0], buffer[1], buffer[2], buffer[3]);
  return tag === 'true' || tag === 'ttcf' || tag === 'OTTO';
}

/**
 * Download one weight of a Google font, or read the copy already on disk.
 *
 * The licence is checked before anything is downloaded, and a family Google
 * does not serve under a public licence throws. A wordmark is artwork that ends
 * up on a building and in a trademark filing, and outlining a Monotype face
 * into one would put the client's mark on top of somebody else's property with
 * nothing on the record to show it happened. `allowUnlicensed` downgrades the
 * refusal to a returned warning, for the case where a face is being measured
 * rather than shipped.
 *
 * The cache is not an optimisation. A brand build regenerates its wordmark
 * every time anything upstream changes, and a test suite runs that repeatedly,
 * so without one this module would hammer Google for a file that never changes.
 * The download is written to a temporary name and renamed into place, because a
 * cache entry truncated by an interrupt would poison every run after it.
 */
export async function fetchGoogleFont(family, { weight = 400, cacheDir, allowUnlicensed = false } = {}) {
  const name = String(family ?? '').trim();
  if (!name) throw new TypeError('fetchGoogleFont: a family name is required');
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const dir = cacheDir ?? path.join(os.homedir(), '.cache', 'brandi', 'fonts');
  const file = path.join(dir, `${slug}-${weight}.ttf`);
  const urlFile = `${file}.url`;
  // Keyed on the family rather than the weight, because a licence covers the
  // family and a second weight should not have to ask again.
  const licenceFile = path.join(dir, `${slug}.licence`);

  // Before the cache, not after it. Bytes already on disk are still bytes that
  // must not be turned into somebody's logo.
  const { licence, warning } = await licenceGate(name, dir, licenceFile, allowUnlicensed);

  if (existsSync(file)) {
    const buffer = await readFile(file);
    const url = existsSync(urlFile) ? (await readFile(urlFile, 'utf8')).trim() : null;
    return { buffer, url, family: name, weight, cached: true, file, licence, warning };
  }

  const cssUrl = `${CSS_V1}?family=${encodeURIComponent(name).replace(/%20/g, '+')}:${weight}`;
  const cssRes = await fetch(cssUrl, { headers: { 'User-Agent': OLD_UA } });
  if (!cssRes.ok) {
    throw new Error(
      `fetchGoogleFont: Google Fonts does not serve "${name}" at weight ${weight} (HTTP ${cssRes.status}). Check the spelling, and the weights that family publishes.`,
    );
  }
  const css = await cssRes.text();
  const m = /url\((https:\/\/[^)'"]+\.ttf)\)/.exec(css);
  if (!m) {
    throw new Error(
      `fetchGoogleFont: the CSS for "${name}" at weight ${weight} carries no .ttf URL, so this family is served as a variable or CFF font. Pick a static TrueType weight.`,
    );
  }
  const url = m[1];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetchGoogleFont: ${url} returned HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (!looksLikeSfnt(buffer)) {
    throw new Error(`fetchGoogleFont: ${url} did not return a font file for "${name}"`);
  }

  await mkdir(dir, { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  await writeFile(tmp, buffer);
  await rename(tmp, file);
  // Kept beside the file so a cache hit can still say where the bytes came
  // from, which is what a brand book has to print for attribution.
  await writeFile(urlFile, url);

  return { buffer, url, family: name, weight, cached: false, file, licence, warning };
}

export default {
  parseFont,
  glyphPath,
  glyphForCodePoint,
  layoutText,
  kernPair,
  fetchGoogleFont,
  checkGoogleFontLicence,
  googleFontTier,
  isUsableGoogleFont,
  textToSvg,
};
