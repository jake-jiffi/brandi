/**
 * Image dimensions from the file header, with no dependencies.
 *
 * Palate solves this with `sharp`, which is the right answer for a project that
 * already has a node_modules. Brandi has none and is not starting now: a brand
 * tool that cannot measure a photograph until somebody runs npm is a brand tool
 * that does not measure photographs.
 *
 * Every format here is read from its header rather than decoded, so a 12MB
 * photograph costs a few hundred bytes of reading. The formats are the ones a
 * client actually hands over: phone photos (JPEG and HEIC), screenshots (PNG),
 * exports (WebP, AVIF) and the occasional GIF.
 *
 * HEIC matters more than its share suggests. In a real engagement the newest and
 * most deliberate photographs, the ones somebody went out and shot on purpose,
 * arrive straight off an iPhone as HEIC, while the thousand-file social archive
 * is JPEG. A tool that reads JPEG and skips HEIC measures the client's history
 * and ignores their intent.
 */

import { open } from 'node:fs/promises';

/** Enough for every header here; HEIC's `ispe` can sit a little way in. */
const HEAD_BYTES = 65536;

async function head(file, bytes = HEAD_BYTES) {
  const fh = await open(file, 'r');
  try {
    const buf = Buffer.alloc(bytes);
    const { bytesRead } = await fh.read(buf, 0, bytes, 0);
    return buf.subarray(0, bytesRead);
  } finally {
    await fh.close();
  }
}

/**
 * A photograph taken on a phone is frequently stored one way and meant to be
 * seen another. Ignoring that is not a rounding error: a 5712x4284 file with a
 * 270-degree rotation is a PORTRAIT photograph, and calling it landscape sends
 * it to a vehicle panel it cannot fill.
 *
 * Found by converting a client's HEIC and looking at it: the van was on its
 * side. The measurement had been confidently wrong and nothing had noticed,
 * because nothing had looked.
 *
 * The two formats disagree about where to put it. JPEG uses EXIF tag 0x0112.
 * HEIC does not use EXIF for this at all: it carries an ISOBMFF `irot` box, so
 * a tool that only reads EXIF reports "no rotation" on a rotated HEIC, which is
 * exactly what `sips -g orientation` does.
 */
function applyRotation(size, quarterTurns) {
  if (!size || !quarterTurns) return size;
  const swap = quarterTurns % 2 === 1;
  return swap
    ? { ...size, width: size.height, height: size.width, rotated: quarterTurns * 90 }
    : { ...size, rotated: quarterTurns * 90 };
}

/**
 * EXIF orientation, as quarter turns. Values 5 to 8 also mirror, which does not
 * change the shape, so only the turn is taken.
 */
const EXIF_TURNS = { 1: 0, 2: 0, 3: 2, 4: 2, 5: 1, 6: 1, 7: 1, 8: 3 };

function exifOrientation(b) {
  // Find the APP1 Exif segment rather than scanning the whole file for "Exif",
  // which appears in plenty of unrelated bytes.
  let i = 2;
  while (i + 4 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const len = b.readUInt16BE(i + 2);
    if (marker === 0xe1 && b.toString('ascii', i + 4, i + 8) === 'Exif') {
      const tiff = i + 10;
      if (tiff + 8 > b.length) return 0;
      const le = b.toString('ascii', tiff, tiff + 2) === 'II';
      const u16 = (o) => (le ? b.readUInt16LE(o) : b.readUInt16BE(o));
      const u32 = (o) => (le ? b.readUInt32LE(o) : b.readUInt32BE(o));
      const ifd = tiff + u32(tiff + 4);
      if (ifd + 2 > b.length) return 0;
      const count = u16(ifd);
      for (let e = 0; e < count; e++) {
        const entry = ifd + 2 + e * 12;
        if (entry + 12 > b.length) break;
        if (u16(entry) === 0x0112) return EXIF_TURNS[u16(entry + 8)] ?? 0;
      }
      return 0;
    }
    if (len < 2) return 0;
    i += 2 + len;
  }
  return 0;
}

/** PNG: IHDR is always the first chunk, so width and height sit at a fixed offset. */
function png(b) {
  if (b.length < 24) return null;
  if (b.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), format: 'png' };
}

/**
 * JPEG: walk the marker chain to a start-of-frame.
 *
 * The size is not at a fixed offset because EXIF, ICC profiles and thumbnails
 * come first, and a phone photo carries all three. SOF0 through SOF15 all carry
 * the dimensions; DHT, DAC and RSTn share the numeric range and do not.
 */
function jpeg(b) {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const len = b.readUInt16BE(i + 2);
    const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      const size = { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7), format: 'jpeg' };
      return applyRotation(size, exifOrientation(b));
    }
    if (len < 2) return null;
    i += 2 + len;
  }
  return null;
}

/** GIF: fixed offset, little-endian, and unchanged since 1989. */
function gif(b) {
  if (b.length < 10 || b.toString('ascii', 0, 3) !== 'GIF') return null;
  return { width: b.readUInt16LE(6), height: b.readUInt16LE(8), format: 'gif' };
}

/** WebP has three sub-formats and they store the size three different ways. */
function webp(b) {
  if (b.length < 30) return null;
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const kind = b.toString('ascii', 12, 16);
  if (kind === 'VP8 ') {
    return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff, format: 'webp' };
  }
  if (kind === 'VP8L') {
    // 14 bits each, packed across four bytes, both stored one less than actual.
    const n = b.readUInt32LE(21);
    return { width: (n & 0x3fff) + 1, height: ((n >> 14) & 0x3fff) + 1, format: 'webp' };
  }
  if (kind === 'VP8X') {
    const w = b[24] | (b[25] << 8) | (b[26] << 16);
    const h = b[27] | (b[28] << 8) | (b[29] << 16);
    return { width: w + 1, height: h + 1, format: 'webp' };
  }
  return null;
}

/**
 * HEIC and AVIF: both are ISOBMFF, and both record the size in an `ispe` box.
 *
 * Walking the box tree properly means meta > iprp > ipco > ispe, and a file with
 * several images has several. Scanning for the fourcc instead is the pragmatic
 * read: it is a four-byte marker followed by a version, flags, width and height,
 * and taking the LARGEST one is what makes it correct rather than lucky, because
 * the first `ispe` in an iPhone HEIC is frequently the thumbnail.
 */
function isobmff(b) {
  if (b.length < 12) return null;
  if (b.toString('ascii', 4, 8) !== 'ftyp') return null;
  const brand = b.toString('ascii', 8, 12).toLowerCase();
  const format = brand.startsWith('avi') ? 'avif' : 'heic';

  // `irot` carries the rotation in quarter turns anticlockwise. A file can hold
  // several, one per image item, and the meaningful one belongs to the primary
  // image; taking the largest non-zero is the pragmatic read, because a
  // thumbnail that is rotated means the full image is too.
  let turns = 0;
  for (let i = 0; i + 5 <= b.length; i++) {
    if (b[i] === 0x69 && b[i + 1] === 0x72 && b[i + 2] === 0x6f && b[i + 3] === 0x74) {
      turns = Math.max(turns, b[i + 4] & 3);
    }
  }

  let best = null;
  // `i + 16 <= length`, not `i + 20 < length`: width and height end at i+16, and
  // the stricter bound silently dropped the LAST ispe in the buffer, which in a
  // real file is frequently the full-size one sitting after the thumbnail.
  for (let i = 0; i + 16 <= b.length; i++) {
    if (b[i] !== 0x69 || b[i + 1] !== 0x73 || b[i + 2] !== 0x70 || b[i + 3] !== 0x65) continue; // "ispe"
    const width = b.readUInt32BE(i + 8);
    const height = b.readUInt32BE(i + 12);
    // Reject implausible reads: a coincidental fourcc in compressed data.
    if (width < 1 || height < 1 || width > 100000 || height > 100000) continue;
    if (!best || width * height > best.width * best.height) best = { width, height, format };
  }
  return applyRotation(best, turns);
}

const READERS = [png, jpeg, gif, webp, isobmff];

/**
 * Dimensions, format and byte size, or a recorded reason it could not be read.
 *
 * Never throws and never returns silence. An unreadable image has to travel as
 * an unreadable image, because a set that quietly loses eleven photographs
 * measures as a clean set of the ones that happened to parse.
 */
export async function imageSize(file) {
  let b;
  try {
    b = await head(file);
  } catch (e) {
    return { error: `unreadable: ${e.code ?? e.message}` };
  }
  if (!b.length) return { error: 'empty file' };
  for (const reader of READERS) {
    try {
      const got = reader(b);
      if (got?.width && got?.height) return got;
    } catch { /* a truncated file is not a crash */ }
  }
  return { error: 'no dimensions in the header: truncated, or a format this cannot read' };
}

export default { imageSize };
