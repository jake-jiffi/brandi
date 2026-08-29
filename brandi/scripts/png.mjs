/**
 * Read a rendered PNG back and measure the mark in it.
 *
 * The most important question about a logo is whether it still reads at 16
 * pixels, and normally that question gets settled by somebody squinting. Chrome
 * already rasterises our SVGs for the asset pack, so the answer is sitting in
 * those files: how much ink is on the page, how many separate shapes survive,
 * how thin the thinnest stroke gets, where the mark actually sits in its frame,
 * and whether the 16px version still resembles the 64px one. This turns the
 * squinting into arithmetic.
 *
 * It is not a general PNG library and should not become one. It reads exactly
 * what headless Chrome emits (8 bits per sample, non-interlaced, no palette) and
 * refuses everything else by name, because a number computed from misread pixels
 * is worse than no number: it still looks like evidence. The one thing it passes
 * over quietly is a tRNS chunk, which Chrome never writes (it reaches for RGBA
 * instead) but which a PNG from somewhere else may use to declare transparency.
 *
 * The encoder is here so the decoder can be tested against bytes we control,
 * rather than against binary fixtures nobody can read in a diff. It writes the
 * dullest legal PNG it can and nothing more.
 *
 * Zero dependencies is a rule for this plugin, so the compression comes from
 * node:zlib and the rest is arithmetic.
 */

import { inflateSync, deflateSync } from 'node:zlib';
import { Buffer } from 'node:buffer';

/** The eight bytes every PNG starts with, chosen by the format to survive a text-mode transfer. */
const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/**
 * Samples per pixel for each colour type this reads.
 *
 * Type 3 is missing on purpose. A palette image stores indices, not colours, so
 * every number in this file would be measuring the wrong quantity.
 */
const CHANNELS_BY_COLOUR = { 0: 1, 2: 3, 4: 2, 6: 4 };
const COLOUR_BY_CHANNELS = { 1: 0, 2: 4, 3: 2, 4: 6 };

// ---------------------------------------------------------------------------
// CRC32, which is what makes a chunk legal
// ---------------------------------------------------------------------------

/**
 * The standard PNG CRC table, built once.
 *
 * The polynomial is reversed (0xEDB88320 rather than 0x04C11DB7) because PNG
 * feeds bits in least-significant first, which is the detail that silently
 * produces a file every viewer rejects if you get it backwards.
 */
const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  CRC_TABLE[n] = c;
}

function crc32(bytes) {
  let c = -1;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

/** Length, type, data, then a CRC over the type and the data but not the length. */
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  out.set(data, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

// ---------------------------------------------------------------------------
// Decoding
// ---------------------------------------------------------------------------

/**
 * The Paeth predictor from the PNG spec.
 *
 * It picks whichever of the left, above and above-left neighbours is closest to
 * their linear estimate. The comparison order is not a style choice: `a` takes
 * ties with both, `b` takes ties with `c`, and swapping those two lines produces
 * an image that is correct almost everywhere and wrong along a few edges, which
 * is the worst kind of wrong to debug.
 */
function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function asBuffer(input) {
  if (Buffer.isBuffer(input)) return input;
  if (ArrayBuffer.isView(input)) return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  throw new TypeError('decodePng needs the file as a Buffer or a Uint8Array.');
}

/**
 * Turn PNG bytes into raw samples.
 *
 * Chrome splits its pixel data across several IDAT chunks, and the deflate
 * stream runs straight through the joins, so every IDAT has to be collected
 * before anything is inflated. This is not an edge case to be defensive about:
 * even a 16 by 16 favicon comes back in two chunks, and a 1200px render in
 * thirteen, so a decoder that inflates them one at a time reads nothing at all.
 */
export function decodePng(buffer) {
  const b = asBuffer(buffer);

  if (b.length < 8 || !b.subarray(0, 8).equals(SIGNATURE)) {
    const found = b.length
      ? `starts with 0x${b.subarray(0, Math.min(8, b.length)).toString('hex')}`
      : 'is empty';
    throw new Error(`This is not a PNG: it ${found}, where every PNG starts with 0x${SIGNATURE.toString('hex')}.`);
  }

  let header = null;
  const idat = [];
  let o = 8;
  while (o + 8 <= b.length) {
    const len = b.readUInt32BE(o);
    const type = b.toString('ascii', o + 4, o + 8);
    if (o + 12 + len > b.length) {
      throw new Error(`This PNG is truncated: the ${type} chunk claims ${len} bytes but only ${b.length - o - 8} are left in the file.`);
    }
    const data = b.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        depth: data[8],
        colour: data[9],
        interlace: data[12],
      };
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    o += 12 + len;
  }

  if (!header) throw new Error('This PNG has no IHDR chunk, so nothing says how big it is.');
  if (header.depth !== 8) {
    throw new Error(`This PNG is ${header.depth} bits per sample. Only 8 is supported, which is what headless Chrome writes.`);
  }
  if (header.colour === 3) {
    throw new Error('This PNG is palette colour (colour type 3), which stores indices rather than colours. Supported types are 0 (grey), 2 (RGB), 4 (grey and alpha) and 6 (RGBA), so re-export it without a palette.');
  }
  const channels = CHANNELS_BY_COLOUR[header.colour];
  if (!channels) {
    throw new Error(`This PNG declares colour type ${header.colour}, which is not one this reads. Supported types are 0, 2, 4 and 6.`);
  }
  if (header.interlace !== 0) {
    throw new Error(`This PNG is interlaced (interlace method ${header.interlace}, which is Adam7). Only non-interlaced (0) is supported.`);
  }
  if (!idat.length) throw new Error('This PNG has no IDAT chunk, so it carries no pixels.');

  let raw;
  try {
    raw = inflateSync(Buffer.concat(idat));
  } catch (e) {
    throw new Error(`The IDAT data would not inflate (${e.message}), so the file is truncated or corrupt.`);
  }

  const { width, height } = header;
  const stride = width * channels;
  const expected = height * (1 + stride);
  if (raw.length !== expected) {
    throw new Error(`This PNG's pixel data is the wrong size: ${raw.length} bytes inflated, but ${width}x${height} at ${channels} channel(s) needs exactly ${expected}.`);
  }

  // Unfilter into the output, referring back to the row already reconstructed.
  const out = new Uint8Array(height * stride);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const row = y * stride;
    const up = row - stride;
    for (let i = 0; i < stride; i++) {
      const x = raw[pos + i];
      // `a` is the byte one whole pixel to the left, not one byte, which is the
      // difference between a correct RGB image and a smeared one.
      const a = i >= channels ? out[row + i - channels] : 0;
      const bb = y > 0 ? out[up + i] : 0;
      const c = (y > 0 && i >= channels) ? out[up + i - channels] : 0;
      let value;
      switch (filter) {
        case 0: value = x; break;
        case 1: value = x + a; break;
        case 2: value = x + bb; break;
        case 3: value = x + ((a + bb) >> 1); break;
        case 4: value = x + paeth(a, bb, c); break;
        default:
          throw new Error(`Scanline ${y} uses filter type ${filter}, and PNG only defines 0 to 4. The file is corrupt.`);
      }
      out[row + i] = value & 0xff;
    }
    pos += stride;
  }

  return { width, height, channels, data: out };
}

// ---------------------------------------------------------------------------
// Encoding
// ---------------------------------------------------------------------------

/**
 * Write the dullest legal PNG: filter type 0 on every row, one IDAT.
 *
 * This exists to test the decoder, not to produce small files, so it does not
 * try any of the filters. Anything cleverer here would share assumptions with
 * the decoder and a round trip would stop proving anything.
 */
export function encodePng({ width, height, channels, data }) {
  const colour = COLOUR_BY_CHANNELS[channels];
  if (colour === undefined) {
    throw new Error(`encodePng writes 1, 2, 3 or 4 channels, not ${channels}.`);
  }
  const samples = data instanceof Uint8Array ? data : Uint8Array.from(data);
  const stride = width * channels;
  if (samples.length !== height * stride) {
    throw new Error(`encodePng was given ${samples.length} samples for a ${width}x${height} image at ${channels} channel(s), which needs exactly ${height * stride}.`);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;       // bit depth
  ihdr[9] = colour;
  ihdr[10] = 0;      // compression, deflate, the only one defined
  ihdr[11] = 0;      // filter method, the only one defined
  ihdr[12] = 0;      // not interlaced

  const raw = Buffer.alloc(height * (1 + stride));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + stride)] = 0;
    raw.set(samples.subarray(y * stride, (y + 1) * stride), y * (1 + stride) + 1);
  }

  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Measuring
// ---------------------------------------------------------------------------

/** Rec.709 weights, applied to the encoded values because we want perceived ink, not physical light. */
const luma = (r, g, bl) => 0.2126 * r + 0.7152 * g + 0.0722 * bl;

/**
 * Flatten to one grey channel, 0 black and 255 white.
 *
 * Alpha is composited over WHITE rather than over black, which is the whole
 * point. A logo is judged on a white page, and a transparent pixel is not ink:
 * composite over black and every mark scores as a heavy solid block, and the
 * softest antialiased edge reads as the darkest thing in the frame.
 */
export function toGrey({ width, height, channels, data }) {
  if (COLOUR_BY_CHANNELS[channels] === undefined) {
    throw new Error(`toGrey reads 1, 2, 3 or 4 channels, not ${channels}.`);
  }
  if (data.length < width * height * channels) {
    throw new Error(`toGrey was given ${data.length} samples for a ${width}x${height} image at ${channels} channel(s), which needs ${width * height * channels}.`);
  }
  const out = new Uint8Array(width * height);
  for (let p = 0; p < out.length; p++) {
    const i = p * channels;
    const value = channels >= 3 ? luma(data[i], data[i + 1], data[i + 2]) : data[i];
    const alpha = channels === 2 ? data[i + 1] : channels === 4 ? data[i + 3] : 255;
    out[p] = alpha === 255 ? Math.round(value) : Math.round((value * alpha + 255 * (255 - alpha)) / 255);
  }
  return out;
}

/**
 * How much of the frame is ink.
 *
 * Darker than the threshold, not darker than or equal to it, so a pixel sitting
 * exactly on 128 counts as paper. The boundary has to fall somewhere and this
 * keeps a flat mid grey out of the count.
 */
export function inkCoverage(grey, { threshold = 128 } = {}) {
  let ink = 0;
  for (let i = 0; i < grey.length; i++) if (grey[i] < threshold) ink++;
  return grey.length ? ink / grey.length : 0;
}

/**
 * How many separate dark shapes there are, counting diagonal contact as joined.
 *
 * This is the mark-turns-into-a-blob test. A mark with three clear counters at
 * 64px that comes back as one region at 16px has failed, and the count says so
 * without anybody having to look.
 *
 * The fill is iterative with its own stack. A 1200px raster is 1.44 million
 * pixels and a recursive fill over one solid region blows the call stack long
 * before it finishes, so recursion is not a style preference here.
 */
export function countRegions(grey, width, height, { threshold = 128 } = {}) {
  const seen = new Uint8Array(width * height);
  const stack = [];
  let regions = 0;

  for (let start = 0; start < seen.length; start++) {
    if (seen[start] || grey[start] >= threshold) continue;
    regions++;
    seen[start] = 1;
    stack.push(start);
    while (stack.length) {
      const p = stack.pop();
      const px = p % width;
      const py = (p - px) / width;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = py + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = px + dx;
          if (nx < 0 || nx >= width) continue;
          const q = ny * width + nx;
          // Marked on the way in, not on the way out, so the stack stays bounded
          // by the size of the region rather than by its perimeter times its area.
          if (seen[q] || grey[q] >= threshold) continue;
          seen[q] = 1;
          stack.push(q);
        }
      }
    }
  }
  return regions;
}

/**
 * The thickness of the mark, measured by how many erosion rounds it survives.
 *
 * Each round strips one pixel from every side of every shape, so a stroke `t`
 * pixels wide is gone after `ceil(t / 2)` rounds and the width that implies is
 * `2 * rounds - 1`. Even widths therefore come back as the odd number below
 * them: a 2px bar reports 1 and a 4px bar reports 3. That is a real off-by-one
 * and it is left in rather than fudged, because the useful reading is "is any
 * of this too thin to survive" and rounding down is the safe direction.
 *
 * Two things worth knowing before trusting the number:
 *
 * The frame edge counts as background, so a mark bleeding off the canvas is
 * measured as if cropped. That is the honest answer for a favicon, where the
 * crop is real.
 *
 * The rounds run until the LAST ink disappears, so on a mark whose strokes vary
 * this reports the heaviest one, not the lightest. A hairline attached to a
 * heavy blob is invisible to it. Pair it with countRegions, which does notice
 * when a thin part has closed up.
 *
 * It is computed as a Chebyshev distance transform rather than by peeling the
 * image round by round. The two give identical answers (the round a pixel dies
 * in is exactly its chessboard distance to the nearest background pixel) but
 * peeling a 1200px raster with a solid area in it is hundreds of full passes,
 * which is minutes of work for the same integer.
 */
export function minFeatureWidth(grey, width, height, { threshold = 128 } = {}) {
  const n = width * height;
  const FAR = 0xffff;
  const d = new Uint16Array(n);
  let ink = false;
  for (let i = 0; i < n; i++) {
    if (grey[i] < threshold) { d[i] = FAR; ink = true; }
  }
  if (!ink) return 0;

  // Forward, then backward. Any neighbour off the edge of the frame is
  // background, which is why the edge rows and columns cap at one.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (d[i] === 0) continue;
      const outside = y === 0 || x === 0 || x === width - 1;
      const near = outside ? 0 : Math.min(d[i - width - 1], d[i - width], d[i - width + 1], d[i - 1]);
      if (near + 1 < d[i]) d[i] = near + 1;
    }
  }
  let rounds = 0;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const i = y * width + x;
      if (d[i] === 0) continue;
      const outside = y === height - 1 || x === 0 || x === width - 1;
      const near = outside ? 0 : Math.min(d[i + width - 1], d[i + width], d[i + width + 1], d[i + 1]);
      if (near + 1 < d[i]) d[i] = near + 1;
      if (d[i] > rounds) rounds = d[i];
    }
  }
  return 2 * rounds - 1;
}

/**
 * A 64 bit perceptual hash, for asking whether two renders are the same mark.
 *
 * The image goes to 9x8 and each pixel is compared with the one to its right,
 * which gives 64 bits describing where the image gets lighter and darker rather
 * than what colour it is. That is what makes it survive a rescale, a nudge and a
 * recompression while still separating two different marks.
 *
 * The downsample averages every source pixel falling in a cell instead of
 * picking one. Nearest-neighbour would decide a 1200px render, 1.44 million
 * pixels, from the 72 that happen to sit on the sample points, so one stray
 * antialiased pixel landing on a sample point flips a bit. Averaging gives every
 * pixel a say and a small shift moves a little weight instead of swapping a
 * value. It is not magic: a pattern whose period beats against the 9x8 grid
 * upsets either method, but marks are not that.
 *
 * It is coarse on purpose. Sixty four cells cannot see a notch in a thin stroke,
 * so a ring and the same ring cut into arcs hash the same. That is the hash
 * answering the question it is for, which is whether two renders are the same
 * mark. Whether the detail survived is countRegions and minFeatureWidth.
 *
 * Bits are laid down row by row, most significant first, so the value is stable
 * and comparable across runs.
 */
export function dHash(grey, width, height) {
  const cells = new Float64Array(9 * 8);
  for (let cy = 0; cy < 8; cy++) {
    const y0 = Math.floor(cy * height / 8);
    const y1 = Math.max(y0 + 1, Math.floor((cy + 1) * height / 8));
    for (let cx = 0; cx < 9; cx++) {
      const x0 = Math.floor(cx * width / 9);
      const x1 = Math.max(x0 + 1, Math.floor((cx + 1) * width / 9));
      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) { sum += grey[y * width + x]; count++; }
      }
      cells[cy * 9 + cx] = sum / count;
    }
  }

  let hash = 0n;
  for (let cy = 0; cy < 8; cy++) {
    for (let cx = 0; cx < 8; cx++) {
      hash = (hash << 1n) | (cells[cy * 9 + cx] > cells[cy * 9 + cx + 1] ? 1n : 0n);
    }
  }
  return hash;
}

/** How many of the 64 bits differ. Clearing the lowest set bit each time is the cheap popcount. */
export function hamming(a, b) {
  let v = a ^ b;
  let bits = 0;
  while (v > 0n) { v &= v - 1n; bits++; }
  return bits;
}

/**
 * The rectangle the ink actually occupies, or null when there is none.
 *
 * Two things need this. A mark that is not optically centred reads as an
 * accident at every size, and a mark swimming in dead space wastes the pixels it
 * has, which at 16px is all of them.
 */
export function boundingBox(grey, width, height, { threshold = 128 } = {}) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      if (grey[row + x] >= threshold) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

export default {
  decodePng, encodePng, toGrey, inkCoverage, countRegions,
  minFeatureWidth, dHash, hamming, boundingBox,
};
