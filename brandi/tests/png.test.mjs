/**
 * Raster metrics.
 *
 * The decoder is the part worth being paranoid about, so it is tested against
 * bytes written by hand rather than against its own encoder. A round trip only
 * proves the two halves agree, and two halves that share a filter bug agree
 * perfectly, so every filter is fed scanlines assembled here and checked against
 * pixel values worked out on paper.
 *
 * The measurements are tested on synthetic images where the right answer is
 * known by construction, and minFeatureWidth is additionally checked against a
 * literal round-by-round erosion, because the shipped version computes the same
 * number a much faster way and that equivalence is the whole bet.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { deflateSync } from 'node:zlib';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

import {
  decodePng, encodePng, toGrey, inkCoverage, countRegions,
  minFeatureWidth, dHash, hamming, boundingBox,
} from '../scripts/png.mjs';
import { findChrome } from '../scripts/preview.mjs';

// ---------------------------------------------------------------------------
// Building PNGs by hand, so the decoder is never tested against its own output
// ---------------------------------------------------------------------------

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// A second CRC implementation on purpose. If this one and the module's disagree,
// the known-answer test on the IEND chunk below says which is wrong.
const TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  TABLE[n] = c;
}
const crc32 = (bytes) => {
  let c = -1;
  for (let i = 0; i < bytes.length; i++) c = TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  out.set(data, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

/**
 * A PNG with whatever header fields and whatever pre-inflate bytes are asked
 * for, valid or not, which is what makes the refusal paths testable.
 */
function makePng({ width, height, depth = 8, colour = 0, interlace = 0, raw = [], idatParts = null }) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = depth;
  ihdr[9] = colour;
  ihdr[12] = interlace;
  const parts = idatParts ?? [deflateSync(Buffer.from(raw))];
  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', ihdr),
    ...parts.map((p) => chunk('IDAT', p)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const px = (decoded) => Array.from(decoded.data);

// ---------------------------------------------------------------------------

describe('round trip', () => {
  const cases = [
    ['greyscale', 1, [0, 64, 128, 255, 1, 2, 3, 4]],
    ['greyscale with alpha', 2, [0, 255, 128, 0, 200, 100, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]],
    ['RGB', 3, [255, 0, 0, 0, 255, 0, 0, 0, 255, 10, 20, 30, 40, 50, 60, 70, 80, 90, 1, 2, 3, 4, 5, 6]],
    ['RGBA', 4, Array.from({ length: 32 }, (_, i) => (i * 7) % 256)],
  ];

  for (const [name, channels, data] of cases) {
    test(`${name} survives encode and decode byte for byte`, () => {
      const width = 4;
      const height = data.length / channels / width;
      const decoded = decodePng(encodePng({ width, height, channels, data }));
      assert.equal(decoded.width, width);
      assert.equal(decoded.height, height);
      assert.equal(decoded.channels, channels, 'the colour type has to come back as the same channel count');
      assert.deepEqual(px(decoded), data);
    });
  }

  test('a single pixel and a single column both work, since strides of one catch off-by-ones', () => {
    assert.deepEqual(px(decodePng(encodePng({ width: 1, height: 1, channels: 1, data: [42] }))), [42]);
    assert.deepEqual(px(decodePng(encodePng({ width: 1, height: 4, channels: 3, data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }))),
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test('the encoder writes the bytes a real PNG reader looks for', () => {
    const png = encodePng({ width: 2, height: 2, channels: 1, data: [1, 2, 3, 4] });
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    // Every PNG ever written ends with these twelve bytes, and 0xAE426082 is the
    // CRC of the four characters "IEND". If our CRC were wrong this would not
    // match, and no round trip of ours would ever notice.
    assert.equal(png.subarray(png.length - 12).toString('hex'), '0000000049454e44ae426082');
    const ihdr = png.subarray(8, 8 + 25);
    assert.equal(ihdr.readUInt32BE(8), 2, 'width');
    assert.equal(ihdr[16], 8, 'bit depth');
    assert.equal(ihdr[17], 0, 'colour type 0 for one channel');
    assert.equal(ihdr[20], 0, 'not interlaced');
  });

  test('the encoder refuses what it cannot write rather than writing a wrong header', () => {
    assert.throws(() => encodePng({ width: 1, height: 1, channels: 5, data: [1, 2, 3, 4, 5] }), /1, 2, 3 or 4 channels, not 5/);
    assert.throws(() => encodePng({ width: 4, height: 4, channels: 1, data: [1, 2, 3] }), /3 samples .* needs exactly 16/);
  });
});

describe('scanline filters', () => {
  // A 4x5 greyscale image, one filter per row. The filtered bytes below were
  // worked out from the spec by hand; the expected pixels likewise. Neither came
  // from running the decoder.
  test('all five, one per row, decode to the values the spec implies', () => {
    const png = makePng({
      width: 4,
      height: 5,
      colour: 0,
      raw: [
        0, 10, 20, 30, 40,          // None:    the bytes as they are
        1, 50, 10, 10, 10,          // Sub:     50, then +10 each step
        2, 40, 40, 40, 40,          // Up:      40 above every value in row 1
        3, 85, 25, 25, 25,          // Average: floor((left + above) / 2)
        4, 70, 156, 206, 231,       // Paeth
      ],
    });
    assert.deepEqual(px(decodePng(png)), [
      10, 20, 30, 40,
      50, 60, 70, 80,
      90, 100, 110, 120,
      130, 140, 150, 160,
      200, 100, 50, 25,
    ]);
  });

  test('Average floors the sum rather than rounding it', () => {
    // left 0 and above 45 give floor(22.5) = 22, so 100 encodes as 78. Rounding
    // up would give 77 and the whole row after it would drift.
    const png = makePng({ width: 2, height: 2, colour: 0, raw: [0, 45, 45, 3, 78, 0] });
    const out = px(decodePng(png));
    assert.equal(out[2], 100, 'floor(0 + 45 / 2) is 22, not 23');
    assert.equal(out[3], 72, 'floor(100 + 45 / 2) is 72');
  });

  test('a filter type PNG does not define is refused, not ignored', () => {
    const png = makePng({ width: 2, height: 2, colour: 0, raw: [0, 1, 2, 5, 3, 4] });
    assert.throws(() => decodePng(png), /Scanline 1 uses filter type 5/);
  });
});

describe('Paeth', () => {
  test('reaches all three predictors and breaks a tie the way the spec says', () => {
    // Row 0 is literal, row 1 is Paeth, and each pixel was chosen so a different
    // neighbour wins:
    //   x=0  a=0   b=100 c=0    ->  pa 100, pb 0,   pc 100  -> b
    //   x=1  a=10  b=200 c=100  ->  pa 100, pb 90,  pc 10   -> c
    //   x=2  a=250 b=100 c=200  ->  pa 100, pb 50,  pc 50   -> b wins the tie
    //   x=3  a=200 b=140 c=100  ->  pa 40,  pb 100, pc 140  -> a
    const png = makePng({
      width: 4,
      height: 2,
      colour: 0,
      raw: [0, 100, 200, 100, 140, 4, 166, 150, 100, 20],
    });
    assert.deepEqual(px(decodePng(png)), [100, 200, 100, 140, 10, 250, 200, 220]);
  });

  test('a tie between the above and the above-left goes to the above', () => {
    // Swapping the last two comparisons in the predictor would return 200 here
    // instead of 100, and would still decode most images correctly.
    const png = makePng({ width: 4, height: 2, colour: 0, raw: [0, 100, 200, 100, 140, 4, 166, 150, 100, 20] });
    assert.equal(px(decodePng(png))[6], 200, 'x=2 reconstructs to 200 only if b wins pb == pc');
  });
});

describe('bytes per pixel', () => {
  test('Sub, Paeth and Average step back a whole pixel, not a byte', () => {
    // A 2x3 RGB image. If the decoder used a one byte offset, every value after
    // the first pixel would be wrong, so this is the discriminator.
    const png = makePng({
      width: 2,
      height: 3,
      colour: 2,
      raw: [
        1, 10, 20, 30, 30, 30, 30,        // Sub
        4, 60, 60, 60, 30, 30, 30,        // Paeth
        3, 95, 100, 105, 45, 45, 45,      // Average
      ],
    });
    const decoded = decodePng(png);
    assert.equal(decoded.channels, 3);
    assert.deepEqual(px(decoded), [
      10, 20, 30, 40, 50, 60,
      70, 80, 90, 100, 110, 120,
      130, 140, 150, 160, 170, 180,
    ]);
  });
});

describe('IDAT chunks', () => {
  test('several chunks are joined before anything is inflated', () => {
    // Chrome writes the pixel data across a handful of chunks and the deflate
    // stream runs straight through the join, so inflating each one on its own
    // does not work. The split point here is deliberately mid-stream.
    const raw = Buffer.from([0, 10, 20, 30, 40, 0, 50, 60, 70, 80]);
    const z = deflateSync(raw);
    const cut = Math.floor(z.length / 2);
    assert.ok(cut > 0 && cut < z.length, 'the stream has to actually be split for this to test anything');
    const png = makePng({ width: 4, height: 2, colour: 0, idatParts: [z.subarray(0, cut), z.subarray(cut)] });
    assert.deepEqual(px(decodePng(png)), [10, 20, 30, 40, 50, 60, 70, 80]);
  });

  test('three chunks work too, including a zero length one', () => {
    const z = deflateSync(Buffer.from([0, 1, 2, 0, 3, 4]));
    const png = makePng({
      width: 2, height: 2, colour: 0,
      idatParts: [z.subarray(0, 2), Buffer.alloc(0), z.subarray(2)],
    });
    assert.deepEqual(px(decodePng(png)), [1, 2, 3, 4]);
  });
});

describe('refusing what it cannot read', () => {
  test('something that is not a PNG says so and shows what it found', () => {
    assert.throws(() => decodePng(Buffer.from('GIF89a and then some')), /not a PNG/);
    assert.throws(() => decodePng(Buffer.from('GIF89a and then some')), /47494638/);
    assert.throws(() => decodePng(Buffer.alloc(0)), /not a PNG/);
  });

  test('16 bits per sample names the depth it found and the one it wants', () => {
    const png = makePng({ width: 2, height: 2, depth: 16, colour: 0, raw: [0, 1, 2, 3, 4, 0, 5, 6, 7, 8] });
    assert.throws(() => decodePng(png), /16 bits per sample/);
    assert.throws(() => decodePng(png), /Only 8 is supported/);
  });

  test('a palette image is named as a palette image, not as an unknown type', () => {
    const png = makePng({ width: 2, height: 2, depth: 8, colour: 3, raw: [0, 0, 1, 0, 1, 0] });
    assert.throws(() => decodePng(png), /palette colour \(colour type 3\)/);
    assert.throws(() => decodePng(png), /indices rather than colours/);
  });

  test('an interlaced image says Adam7 so the fix is obvious', () => {
    const png = makePng({ width: 2, height: 2, colour: 0, interlace: 1, raw: [0, 1, 2, 0, 3, 4] });
    assert.throws(() => decodePng(png), /interlaced/);
    assert.throws(() => decodePng(png), /Adam7/);
  });

  test('a colour type that is not a colour type at all is refused', () => {
    const png = makePng({ width: 2, height: 2, colour: 7, raw: [0, 1, 2, 0, 3, 4] });
    assert.throws(() => decodePng(png), /colour type 7/);
  });

  test('pixel data that inflates to the wrong length names both numbers', () => {
    // Three rows of data claiming to be four. It inflates perfectly, which is
    // exactly why the length has to be checked rather than trusted.
    const png = makePng({ width: 4, height: 4, colour: 0, raw: new Array(3 * 5).fill(0) });
    assert.throws(() => decodePng(png), /15 bytes inflated/);
    assert.throws(() => decodePng(png), /needs exactly 20/);
  });

  test('a corrupt deflate stream is reported as corrupt, not as a zlib mystery', () => {
    const png = makePng({ width: 2, height: 2, colour: 0, idatParts: [Buffer.from([1, 2, 3, 4, 5])] });
    assert.throws(() => decodePng(png), /would not inflate/);
    assert.throws(() => decodePng(png), /truncated or corrupt/);
  });

  test('a chunk claiming more bytes than the file holds is caught before it reads past the end', () => {
    const png = makePng({ width: 2, height: 2, colour: 0, raw: [0, 1, 2, 0, 3, 4] });
    assert.throws(() => decodePng(png.subarray(0, png.length - 20)), /truncated/);
  });

  test('a header-less stream and a pixel-less one both say which piece is missing', () => {
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(2, 0);
    ihdr.writeUInt32BE(2, 4);
    ihdr[8] = 8;
    assert.throws(
      () => decodePng(Buffer.concat([SIGNATURE, chunk('IDAT', deflateSync(Buffer.from([0, 1, 2]))), chunk('IEND', Buffer.alloc(0))])),
      /no IHDR chunk/,
    );
    assert.throws(
      () => decodePng(Buffer.concat([SIGNATURE, chunk('IHDR', ihdr), chunk('IEND', Buffer.alloc(0))])),
      /no IDAT chunk/,
    );
  });

  test('a Uint8Array is read as happily as a Buffer, and nothing else is', () => {
    const png = encodePng({ width: 2, height: 1, channels: 1, data: [7, 9] });
    assert.deepEqual(px(decodePng(new Uint8Array(png))), [7, 9]);
    assert.throws(() => decodePng('a path, probably'), /Buffer or a Uint8Array/);
  });
});

describe('flattening to grey', () => {
  test('alpha composites over white, because a transparent pixel is not ink', () => {
    // The bug this exists to catch composites over black, which turns every mark
    // into a heavy solid and every soft edge into the darkest thing in the frame.
    const half = toGrey({ width: 1, height: 1, channels: 4, data: [0, 0, 0, 128] })[0];
    assert.equal(half, 127, 'black at half alpha is mid grey');
    assert.ok(half > 100, 'over black this would be near 0');
    assert.equal(toGrey({ width: 1, height: 1, channels: 4, data: [0, 0, 0, 0] })[0], 255, 'fully transparent is paper');
    assert.equal(toGrey({ width: 1, height: 1, channels: 4, data: [0, 0, 0, 255] })[0], 0, 'fully opaque black is ink');
    assert.equal(toGrey({ width: 1, height: 1, channels: 2, data: [0, 128] })[0], 127, 'grey with alpha composites the same way');
  });

  test('uses Rec.709 weights, so green carries most of the brightness', () => {
    const one = (data) => toGrey({ width: 1, height: 1, channels: 3, data })[0];
    assert.equal(one([255, 0, 0]), Math.round(0.2126 * 255));
    assert.equal(one([0, 255, 0]), Math.round(0.7152 * 255));
    assert.equal(one([0, 0, 255]), Math.round(0.0722 * 255));
    assert.ok(one([0, 255, 0]) > one([255, 0, 0]), 'a flat average would call these equal');
    assert.equal(one([255, 255, 255]), 255);
    assert.equal(one([0, 0, 0]), 0);
  });

  test('a greyscale image passes straight through, and the length is one per pixel', () => {
    const grey = toGrey({ width: 3, height: 2, channels: 1, data: [0, 10, 20, 30, 40, 50] });
    assert.equal(grey.length, 6);
    assert.deepEqual(Array.from(grey), [0, 10, 20, 30, 40, 50]);
  });

  test('a channel count it cannot read is refused', () => {
    assert.throws(() => toGrey({ width: 1, height: 1, channels: 5, data: [0, 0, 0, 0, 0] }), /1, 2, 3 or 4 channels/);
  });

  test('data too short to describe the image is refused rather than read as zeros', () => {
    // Reading past the end gives undefined, which lands in a Uint8Array as 0, so
    // a short buffer would come back as a frame of solid ink.
    assert.throws(() => toGrey({ width: 4, height: 4, channels: 3, data: new Uint8Array(20) }), /20 samples .* needs 48/);
  });
});

describe('ink coverage', () => {
  const grey = (values) => Uint8Array.from(values);

  test('counts the dark fraction', () => {
    assert.equal(inkCoverage(grey([0, 0, 255, 255])), 0.5);
    assert.equal(inkCoverage(grey([0, 0, 0, 0])), 1);
    assert.equal(inkCoverage(grey([255, 255, 255, 255])), 0);
    assert.equal(inkCoverage(grey([])), 0, 'no pixels is no ink, not a NaN');
  });

  test('the threshold is strict, so a pixel sitting exactly on it is paper', () => {
    assert.equal(inkCoverage(grey([128])), 0);
    assert.equal(inkCoverage(grey([127])), 1);
    assert.equal(inkCoverage(grey([100, 200]), { threshold: 201 }), 1);
  });
});

describe('counting regions', () => {
  function canvas(width, height, pixels) {
    const g = new Uint8Array(width * height).fill(255);
    for (const [x, y] of pixels) g[y * width + x] = 0;
    return g;
  }

  test('three separated squares are three regions', () => {
    const g = canvas(12, 12, [
      [1, 1], [2, 1], [1, 2], [2, 2],
      [6, 1], [7, 1], [6, 2], [7, 2],
      [3, 8], [4, 8], [3, 9], [4, 9],
    ]);
    assert.equal(countRegions(g, 12, 12), 3);
  });

  test('touching only at a corner still counts as joined, which is what 8-connected means', () => {
    // Two 2x2 squares meeting diagonally. Four-connected counting would say two,
    // and would then let a mark that has visually closed up pass as open.
    const joined = canvas(12, 12, [
      [1, 1], [2, 1], [1, 2], [2, 2],
      [3, 3], [4, 3], [3, 4], [4, 4],
    ]);
    assert.equal(countRegions(joined, 12, 12), 1);

    const apart = canvas(12, 12, [
      [1, 1], [2, 1], [1, 2], [2, 2],
      [4, 4], [5, 4], [4, 5], [5, 5],
    ]);
    assert.equal(countRegions(apart, 12, 12), 2, 'one pixel further and they are separate again');
  });

  test('blank is nothing and solid is one', () => {
    assert.equal(countRegions(new Uint8Array(64).fill(255), 8, 8), 0);
    assert.equal(countRegions(new Uint8Array(64).fill(0), 8, 8), 1);
  });

  test('a ring counts as one region and its hole is not counted at all', () => {
    const g = new Uint8Array(49).fill(255);
    for (let y = 1; y < 6; y++) for (let x = 1; x < 6; x++) {
      if (x === 1 || x === 5 || y === 1 || y === 5) g[y * 7 + x] = 0;
    }
    assert.equal(countRegions(g, 7, 7), 1);
  });

  test('the threshold decides what joins up', () => {
    // Two dark squares bridged by a mid grey pixel: ink at a loose threshold,
    // paper at a tight one, so the same image is one region or two.
    const g = new Uint8Array(64).fill(255);
    g[2 * 8 + 1] = 0;
    g[2 * 8 + 3] = 0;
    g[2 * 8 + 2] = 160;
    assert.equal(countRegions(g, 8, 8), 2);
    assert.equal(countRegions(g, 8, 8, { threshold: 200 }), 1);
  });

  test('a 1200px image does not blow the call stack', () => {
    // One flood fill over 1.44 million connected pixels. A recursive fill dies
    // here at a few thousand deep, which is the entire reason for the explicit
    // stack.
    const n = 1200;
    assert.equal(countRegions(new Uint8Array(n * n).fill(0), n, n), 1);

    // And ninety thousand separate regions, so the outer scan is exercised too.
    const dots = new Uint8Array(n * n).fill(255);
    for (let y = 0; y < n; y += 4) for (let x = 0; x < n; x += 4) dots[y * n + x] = 0;
    assert.equal(countRegions(dots, n, n), 300 * 300);
  });
});

describe('minimum feature width', () => {
  function bar(size, x0, thickness) {
    const g = new Uint8Array(size * size).fill(255);
    for (let y = 0; y < size; y++) for (let x = x0; x < x0 + thickness; x++) g[y * size + x] = 0;
    return g;
  }

  test('a one pixel line measures one', () => {
    assert.equal(minFeatureWidth(bar(21, 8, 1), 21, 21), 1);
  });

  test('a five pixel bar measures five, and three measures three', () => {
    assert.equal(minFeatureWidth(bar(21, 8, 5), 21, 21), 5);
    assert.equal(minFeatureWidth(bar(21, 8, 3), 21, 21), 3);
    assert.equal(minFeatureWidth(bar(21, 8, 7), 21, 21), 7);
  });

  test('even widths report the odd number below, which is the documented off-by-one', () => {
    // Each round takes a pixel off both sides, so an even bar and the odd bar
    // under it die on the same round and cannot be told apart. It rounds down,
    // which is the safe direction for a question about whether a stroke survives.
    assert.equal(minFeatureWidth(bar(21, 8, 2), 21, 21), 1);
    assert.equal(minFeatureWidth(bar(21, 8, 4), 21, 21), 3);
    assert.equal(minFeatureWidth(bar(21, 8, 6), 21, 21), 5);
  });

  test('no ink is zero, not one', () => {
    assert.equal(minFeatureWidth(new Uint8Array(100).fill(255), 10, 10), 0);
  });

  test('a diagonal hairline is a hairline, not a staircase of blobs', () => {
    const g = new Uint8Array(400).fill(255);
    for (let i = 2; i < 18; i++) g[i * 20 + i] = 0;
    assert.equal(minFeatureWidth(g, 20, 20), 1);
  });

  test('it reports the heaviest stroke, not the lightest, which is the limit worth knowing', () => {
    // A 1px hairline attached to a 7px blob. The rounds run until the last ink
    // is gone, so the blob is what gets measured. Documented in the docblock and
    // pinned here so nobody discovers it in production.
    const g = new Uint8Array(441).fill(255);
    for (let y = 5; y < 12; y++) for (let x = 5; x < 12; x++) g[y * 21 + x] = 0;
    for (let x = 12; x < 20; x++) g[8 * 21 + x] = 0;
    assert.equal(minFeatureWidth(g, 21, 21), 7, 'the hairline is invisible to this measure');
  });

  test('the frame edge counts as background, which is what makes a full bleed mark measurable', () => {
    // Outside the frame is paper. A bar hard against an edge therefore measures
    // the same as one floating in the middle, and an image that is ink corner to
    // corner measures the frame instead of eroding forever.
    assert.equal(minFeatureWidth(bar(21, 0, 5), 21, 21), 5, 'against the left edge');
    assert.equal(minFeatureWidth(bar(21, 16, 5), 21, 21), 5, 'against the right edge');
    assert.equal(minFeatureWidth(new Uint8Array(441).fill(0), 21, 21), 21, 'ink corner to corner is the frame');
  });

  test('the threshold decides what counts as a stroke', () => {
    const g = new Uint8Array(21 * 21).fill(255);
    for (let y = 0; y < 21; y++) for (let x = 8; x < 13; x++) g[y * 21 + x] = 170;
    assert.equal(minFeatureWidth(g, 21, 21), 0, 'a pale stroke is not ink by default');
    assert.equal(minFeatureWidth(g, 21, 21, { threshold: 200 }), 5);
  });

  test('agrees with a literal round by round erosion on random images', () => {
    // The shipped version is a distance transform, which is the same number
    // computed without hundreds of passes over the pixels. This is the test that
    // holds that claim up.
    function erosionRounds(grey, width, height, threshold = 128) {
      let ink = Array.from(grey, (v) => (v < threshold ? 1 : 0));
      let rounds = 0;
      const solid = (x, y) => x >= 0 && y >= 0 && x < width && y < height && ink[y * width + x] === 1;
      while (ink.some((v) => v === 1)) {
        const next = new Array(ink.length).fill(0);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (!solid(x, y)) continue;
            let keep = 1;
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
              if (!solid(x + dx, y + dy)) keep = 0;
            }
            next[y * width + x] = keep;
          }
        }
        ink = next;
        rounds++;
      }
      return rounds === 0 ? 0 : 2 * rounds - 1;
    }

    let seed = 20260830;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    for (let trial = 0; trial < 200; trial++) {
      const width = 2 + Math.floor(rnd() * 14);
      const height = 2 + Math.floor(rnd() * 14);
      const g = new Uint8Array(width * height);
      for (let i = 0; i < g.length; i++) g[i] = rnd() < 0.55 ? 0 : 255;
      assert.equal(
        minFeatureWidth(g, width, height),
        erosionRounds(g, width, height),
        `disagreed on a ${width}x${height} image: ${Array.from(g).map((v) => (v ? '.' : '#')).join('')}`,
      );
    }
  });

  test('a solid 1200px frame is answered in one pass, not six hundred', () => {
    // The centre of a 1200px square is 600 erosions from the edge. Peeling it
    // round by round is minutes of work for this one integer.
    const n = 1200;
    assert.equal(minFeatureWidth(new Uint8Array(n * n).fill(0), n, n), 1199);
  });
});

describe('perceptual hash', () => {
  // A mark shaped scene: solid shapes over a smooth wash, so cells never tie and
  // nothing beats against the sample grid.
  function mark(w, h, { dx = 0, dy = 0, invert = false } = {}) {
    const g = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const sx = x - dx;
      const sy = y - dy;
      let v = 210 - sx * 0.9 - sy * 1.6;
      const r = Math.hypot(sx - 20, sy - 22);
      if (r < 15) v = 30 + r * 2;
      if (r < 7) v = 200 - r;
      if (sx >= 36 && sx < 41 && sy >= 8 && sy < 54) v = 60 + sy * 0.5;
      if (sy >= 46 && sy < 50 && sx >= 6 && sx < 58) v = 95 + sx * 0.4;
      g[y * w + x] = Math.max(0, Math.min(255, Math.round(v)));
    }
    if (invert) for (let i = 0; i < g.length; i++) g[i] = 255 - g[i];
    return g;
  }

  test('is 64 bits and is stable for the same pixels', () => {
    const g = mark(64, 64);
    const h = dHash(g, 64, 64);
    assert.equal(typeof h, 'bigint');
    assert.ok(h < (1n << 64n), 'the hash has to fit in 64 bits');
    assert.equal(dHash(g, 64, 64), h, 'the same image twice is the same hash');
    assert.equal(hamming(h, h), 0);
  });

  test('a one pixel shift moves only a few bits', () => {
    // This is the property the whole thing exists for. The same mark rendered a
    // pixel off should still be recognisably the same mark.
    const base = dHash(mark(64, 64), 64, 64);
    assert.ok(hamming(base, dHash(mark(64, 64, { dx: 1 }), 64, 64)) <= 8, 'shifted across');
    assert.ok(hamming(base, dHash(mark(64, 64, { dy: 1 }), 64, 64)) <= 8, 'shifted down');
    assert.ok(hamming(base, dHash(mark(64, 64, { dx: 1, dy: 1 }), 64, 64)) <= 8, 'shifted both ways');
  });

  test('an inverted image differs in almost every bit', () => {
    // Inverting flips the direction of every comparison, so the two hashes should
    // be near opposites. Anything close here would mean the hash is not reading
    // the image at all.
    const h = hamming(dHash(mark(64, 64), 64, 64), dHash(mark(64, 64, { invert: true }), 64, 64));
    assert.ok(h >= 48, `expected an inverted image to differ in most of the 64 bits, got ${h}`);
  });

  test('a different mark is far away, a shifted one is near', () => {
    function other(w, h) {
      const g = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let v = 40 + x * 1.5 + y * 0.7;
        if (x > 32 && y > 32) v = 230 - x * 0.5;
        if (Math.abs(x - y) < 6) v = 150 + x * 0.3;
        g[y * w + x] = Math.max(0, Math.min(255, Math.round(v)));
      }
      return g;
    }
    const base = dHash(mark(64, 64), 64, 64);
    const near = hamming(base, dHash(mark(64, 64, { dx: 1 }), 64, 64));
    const far = hamming(base, dHash(other(64, 64), 64, 64));
    assert.ok(far > near * 3, `a different mark (${far} bits) should sit well beyond a shifted one (${near} bits)`);
  });

  test('an image with fewer pixels than sample cells still hashes', () => {
    // 9x8 cells over a 3x3 image means several cells share a pixel. It should
    // produce a hash rather than divide by an empty box.
    const tiny = Uint8Array.from([0, 255, 0, 255, 0, 255, 0, 255, 0]);
    const h = dHash(tiny, 3, 3);
    assert.equal(typeof h, 'bigint');
    assert.ok(h > 0n, 'a checkerboard is not a flat field');
    assert.equal(dHash(Uint8Array.from([12]), 1, 1), 0n, 'one pixel has nothing to compare against');
  });

  test('hamming counts differing bits and nothing else', () => {
    assert.equal(hamming(0n, 0n), 0);
    assert.equal(hamming(0n, 0xffffffffffffffffn), 64);
    assert.equal(hamming(1n, 2n), 2);
    assert.equal(hamming(0b1011n, 0b1110n), 2);
    assert.equal(hamming(0xffffffffffffffffn, 0xfffffffffffffffen), 1);
  });
});

describe('bounding box', () => {
  test('returns exactly the rectangle the ink occupies', () => {
    const g = new Uint8Array(100).fill(255);
    for (let y = 3; y <= 6; y++) for (let x = 2; x <= 5; x++) g[y * 10 + x] = 0;
    assert.deepEqual(boundingBox(g, 10, 10), { x: 2, y: 3, width: 4, height: 4 });
  });

  test('a blank frame has no box at all rather than a zero sized one', () => {
    assert.equal(boundingBox(new Uint8Array(100).fill(255), 10, 10), null);
  });

  test('one pixel is a one by one box', () => {
    const g = new Uint8Array(100).fill(255);
    g[7 * 10 + 4] = 0;
    assert.deepEqual(boundingBox(g, 10, 10), { x: 4, y: 7, width: 1, height: 1 });
  });

  test('ink running to the edges reports the whole frame', () => {
    assert.deepEqual(boundingBox(new Uint8Array(48).fill(0), 8, 6), { x: 0, y: 0, width: 8, height: 6 });
  });

  test('two scattered marks give the box around both, which is how off-centre shows up', () => {
    const g = new Uint8Array(100).fill(255);
    g[1 * 10 + 1] = 0;
    g[8 * 10 + 3] = 0;
    assert.deepEqual(boundingBox(g, 10, 10), { x: 1, y: 1, width: 3, height: 8 });
  });

  test('the threshold decides what counts as ink', () => {
    const g = new Uint8Array(16).fill(255);
    g[5] = 200;
    assert.equal(boundingBox(g, 4, 4), null, 'a light grey is not ink at the default threshold');
    assert.deepEqual(boundingBox(g, 4, 4, { threshold: 210 }), { x: 1, y: 1, width: 1, height: 1 });
  });
});

describe('end to end on a rendered mark', () => {
  test('an RGBA render measures the way the drawing says it should', () => {
    // A 40x40 transparent frame with a 4px ring in it, which is what a mark
    // rasterised for a favicon looks like: a shape, some holes, and a lot of
    // nothing. Every number below is known from the drawing.
    const size = 40;
    const data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const r = Math.hypot(x - 19.5, y - 19.5);
        if (r <= 14 && r >= 10) {
          const i = (y * size + x) * 4;
          data[i + 3] = 255;
        }
      }
    }
    const png = encodePng({ width: size, height: size, channels: 4, data });
    const decoded = decodePng(png);
    const grey = toGrey(decoded);

    assert.equal(grey.length, size * size);
    assert.equal(countRegions(grey, size, size), 1, 'a ring is one shape');

    const box = boundingBox(grey, size, size);
    assert.equal(box.width, box.height, 'a circle is as wide as it is tall');
    assert.ok(Math.abs((box.x + box.width / 2) - size / 2) <= 0.5, 'and it is centred');

    const width = minFeatureWidth(grey, size, size);
    assert.ok(width >= 3 && width <= 5, `a 4px ring should measure about 4, got ${width}`);

    const coverage = inkCoverage(grey);
    assert.ok(coverage > 0.15 && coverage < 0.35, `a ring of this size covers about a quarter of the frame, got ${coverage}`);
  });

  const ring = (size, { holes = false, filled = false } = {}) => {
    const g = new Uint8Array(size * size).fill(255);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = x - (size - 1) / 2;
      const dy = y - (size - 1) / 2;
      const r = Math.hypot(dx, dy) / size;
      const angle = Math.atan2(dy, dx);
      if (r > 0.36) continue;
      if (!filled && r < 0.26) continue;
      if (holes && Math.abs(Math.sin(angle * 3)) <= 0.25) continue;
      g[y * size + x] = 0;
    }
    return g;
  };

  test('the same mark at two sizes hashes close, a different one does not', () => {
    const big = dHash(ring(96), 96, 96);
    const small = dHash(ring(48), 48, 48);
    const disc = dHash(ring(96, { filled: true }), 96, 96);
    assert.ok(hamming(big, small) <= 8, `the same ring at half the size should hash close, got ${hamming(big, small)}`);
    assert.ok(hamming(big, disc) >= 8, `a filled disc is not a ring, got ${hamming(big, disc)}`);
    assert.ok(hamming(big, disc) > hamming(big, small), 'and it should be the further of the two');
  });

  test('it is deliberately coarse, so a lost counter is countRegions job and not this one', () => {
    // The same ring cut into three arcs hashes identically. At 9x8 cells the
    // notches are below the sampling, which is the hash doing its job: it answers
    // "is this the same mark", not "did the detail survive". Measured at zero
    // bits, and pinned so nobody builds a detail check on top of it.
    const whole = dHash(ring(96), 96, 96);
    const arcs = dHash(ring(96, { holes: true }), 96, 96);
    assert.ok(hamming(whole, arcs) <= 2, `expected the notches to be invisible, got ${hamming(whole, arcs)}`);
    assert.ok(
      hamming(whole, arcs) < hamming(whole, dHash(ring(96, { filled: true }), 96, 96)),
      'a change to the gross shape has to move more bits than a change to the detail',
    );
    // The detail loss the hash cannot see is exactly what this does see.
    assert.equal(countRegions(ring(96), 96, 96), 1);
    assert.equal(countRegions(ring(96, { holes: true }), 96, 96), 6);
  });
});

/**
 * Against a real browser, because everything above is bytes we wrote ourselves.
 *
 * Chrome is the only producer this decoder has to read, and it does two things
 * no fixture here does: it splits the pixel data across several IDAT chunks, and
 * it picks the colour type from the page rather than from us, so the same mark
 * comes back RGBA on a transparent page and RGB on a white one.
 *
 * Two renders, because each one costs about six seconds of browser startup.
 * Following the house rule from the asset pack tests, they are skipped out loud
 * when there is no browser, because a test that silently passes on a machine
 * with no Chrome is a test that lies.
 */
describe('real headless Chrome output', () => {
  const chrome = findChrome();
  const skip = chrome ? false : 'no headless browser on this machine';
  const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="none" stroke="#1F6F4A" stroke-width="8"/>
    <circle cx="50" cy="50" r="10" fill="#D4823A"/>
  </svg>`;

  let dir;
  const shots = new Map();

  before(async () => {
    if (!chrome) return;
    dir = await mkdtemp(path.join(tmpdir(), 'brandi-png-'));
    const run = promisify(execFile);
    for (const [stem, size, background] of [['big', 64, 'transparent'], ['small', 16, '#ffffff']]) {
      const html = path.join(dir, `${stem}.html`);
      await writeFile(html, `<!doctype html><meta charset="utf-8">
<style>html,body{margin:0;padding:0;width:${size}px;height:${size}px;background:${background}}
svg{display:block;width:${size}px;height:${size}px}</style>${MARK}`);
      const png = path.join(dir, `${stem}.png`);
      await run(chrome, [
        '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
        '--no-default-browser-check', '--force-device-scale-factor=1',
        '--default-background-color=00000000', '--virtual-time-budget=1000',
        `--window-size=${size},${size}`, `--screenshot=${png}`,
        pathToFileURL(html).href,
      ], { timeout: 45000 });
      shots.set(stem, await readFile(png));
    }
  });

  after(async () => { if (dir) await rm(dir, { recursive: true, force: true }); });

  const idatCount = (buf) => {
    let o = 8;
    let n = 0;
    while (o + 8 <= buf.length) {
      const type = buf.toString('ascii', o + 4, o + 8);
      if (type === 'IDAT') n++;
      if (type === 'IEND') break;
      o += 12 + buf.readUInt32BE(o);
    }
    return n;
  };

  test('the pixel data arrives in several IDAT chunks, so joining them is not optional', { skip }, () => {
    assert.ok(idatCount(shots.get('big')) > 1, `Chrome wrote ${idatCount(shots.get('big'))} IDAT chunks`);
    assert.ok(idatCount(shots.get('small')) > 1);
  });

  test('a transparent page comes back RGBA and a white one comes back RGB', { skip }, () => {
    const big = decodePng(shots.get('big'));
    assert.equal(big.channels, 4, 'transparent needs an alpha channel');
    assert.equal(big.width, 64);
    assert.equal(big.data.length, 64 * 64 * 4);

    const small = decodePng(shots.get('small'));
    assert.equal(small.channels, 3, 'a page with a background has no alpha to keep, so Chrome drops it');
    assert.equal(small.width, 16);
  });

  test('the mark that holds together at 64px falls apart at 16px, and the numbers say so', { skip }, () => {
    const big = toGrey(decodePng(shots.get('big')));
    const small = toGrey(decodePng(shots.get('small')));

    assert.equal(countRegions(big, 64, 64), 1, 'at 64px the ring and its centre read as one shape');
    assert.ok(countRegions(small, 16, 16) > 3, `at 16px the stroke breaks into crumbs, counted ${countRegions(small, 16, 16)}`);
    assert.ok(minFeatureWidth(big, 64, 64) >= 4, 'the stroke is about 5px at 64');
    assert.equal(minFeatureWidth(small, 16, 16), 1, 'and one pixel at 16, which is the whole problem');
  });

  test('the two renders still hash as the same mark, across a rescale and two colour types', { skip }, () => {
    // One is RGBA over nothing and the other is RGB on white. They only land
    // this close because the alpha is composited over white rather than black,
    // so this is the compositing rule proved on real pixels.
    const big = toGrey(decodePng(shots.get('big')));
    const small = toGrey(decodePng(shots.get('small')));
    assert.ok(hamming(dHash(big, 64, 64), dHash(small, 16, 16)) <= 12, 'a mark falling over is still the same mark');
  });

  test('the mark is drawn where it should be and uses the frame it was given', { skip }, () => {
    const big = toGrey(decodePng(shots.get('big')));
    const box = boundingBox(big, 64, 64);
    assert.ok(Math.abs(box.x - (64 - box.x - box.width)) <= 1, 'even margins left and right');
    assert.ok(Math.abs(box.y - (64 - box.y - box.height)) <= 1, 'and top and bottom');
    assert.ok(box.width / 64 > 0.7, 'not swimming in dead space');
    assert.ok(inkCoverage(big) > 0.05, 'and there is actually ink on the page');
  });
});
