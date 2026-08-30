/**
 * Measuring photographs before planning what to do with them.
 *
 * The arithmetic is tested against the failure it exists for: a 2:3 portrait
 * forced through a 3:1 letterbox shows 22% of the frame, and that number is the
 * difference between "this looks wrong" and "you are discarding 78% of the
 * photograph".
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { imageSize } from '../scripts/imagesize.mjs';
import {
  catalogueImages, summarise, assess, visibleFraction,
  orientationOf, kindOf, printableMm, printVerdict, SLOTS,
} from '../scripts/images.mjs';

describe('reading a header without a dependency', () => {
  let dir;
  const png = (w, h) => {
    const b = Buffer.alloc(24);
    b.writeUInt32BE(0x89504e47, 0); b.writeUInt32BE(0x0d0a1a0a, 4);
    b.writeUInt32BE(13, 8); b.write('IHDR', 12);
    b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20);
    return b;
  };
  const jpeg = (w, h) => Buffer.concat([
    Buffer.from([0xff, 0xd8]),
    // An APP0 that must be stepped over rather than misread as a frame.
    Buffer.from([0xff, 0xe0, 0x00, 0x10]), Buffer.alloc(14),
    Buffer.from([0xff, 0xc0, 0x00, 0x11, 0x08]),
    (() => { const b = Buffer.alloc(4); b.writeUInt16BE(h, 0); b.writeUInt16BE(w, 2); return b; })(),
    Buffer.alloc(10),
  ]);

  test('PNG, GIF and WebP', async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'brandi-img-'));
    await writeFile(path.join(dir, 'a.png'), png(1200, 630));
    assert.deepEqual(await imageSize(path.join(dir, 'a.png')), { width: 1200, height: 630, format: 'png' });

    const g = Buffer.alloc(10); g.write('GIF89a', 0); g.writeUInt16LE(64, 6); g.writeUInt16LE(48, 8);
    await writeFile(path.join(dir, 'a.gif'), g);
    assert.deepEqual(await imageSize(path.join(dir, 'a.gif')), { width: 64, height: 48, format: 'gif' });

    const w = Buffer.alloc(30); w.write('RIFF', 0); w.write('WEBP', 8); w.write('VP8X', 12);
    w[24] = 99; w[25] = 0; w[26] = 0; w[27] = 49; w[28] = 0; w[29] = 0;
    await writeFile(path.join(dir, 'a.webp'), w);
    assert.deepEqual(await imageSize(path.join(dir, 'a.webp')), { width: 100, height: 50, format: 'webp' });
    await rm(dir, { recursive: true, force: true });
  });

  test('JPEG, stepping over the segments a phone puts first', async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'brandi-img-'));
    await writeFile(path.join(dir, 'a.jpg'), jpeg(4032, 3024));
    assert.deepEqual(await imageSize(path.join(dir, 'a.jpg')), { width: 4032, height: 3024, format: 'jpeg' });
    await rm(dir, { recursive: true, force: true });
  });

  test('HEIC, which is where the client\'s deliberate photographs arrive', async () => {
    // ftyp, then an ispe carrying the real size. The thumbnail's ispe comes
    // first in a real iPhone file, so the largest must win, not the first.
    const box = (w, h) => {
      const b = Buffer.alloc(20);
      b.writeUInt32BE(20, 0); b.write('ispe', 4);
      b.writeUInt32BE(0, 8); b.writeUInt32BE(w, 12); b.writeUInt32BE(h, 16);
      return b;
    };
    const ftyp = Buffer.alloc(12);
    ftyp.writeUInt32BE(12, 0); ftyp.write('ftyp', 4); ftyp.write('heic', 8);
    dir = await mkdtemp(path.join(tmpdir(), 'brandi-img-'));
    await writeFile(path.join(dir, 'a.heic'), Buffer.concat([ftyp, box(320, 240), box(5712, 4284)]));
    assert.deepEqual(await imageSize(path.join(dir, 'a.heic')),
      { width: 5712, height: 4284, format: 'heic' }, 'the thumbnail must not win');
    await rm(dir, { recursive: true, force: true });
  });

  test('an unreadable file is recorded, never silently dropped', async () => {
    dir = await mkdtemp(path.join(tmpdir(), 'brandi-img-'));
    await writeFile(path.join(dir, 'a.jpg'), 'not an image at all');
    const r = await imageSize(path.join(dir, 'a.jpg'));
    assert.ok(r.error, 'a set that quietly loses photographs measures as a clean set of the rest');
    assert.equal((await imageSize(path.join(dir, 'nope.png'))).error.includes('ENOENT'), true);
    await rm(dir, { recursive: true, force: true });
  });
});

describe('the crop arithmetic', () => {
  test('a 2:3 portrait in a 3:1 band shows 22% of the frame', () => {
    // The exact failure this exists for.
    assert.equal(+visibleFraction(2 / 3, 3).toFixed(2), 0.22);
  });

  test('a matching ratio keeps everything, and the measure is symmetric', () => {
    assert.equal(visibleFraction(16 / 9, 16 / 9), 1);
    assert.equal(visibleFraction(3, 1), visibleFraction(1, 3));
  });

  test('nonsense in gives zero rather than NaN', () => {
    assert.equal(visibleFraction(0, 3), 0);
    assert.equal(visibleFraction(NaN, 3), 0);
  });

  test('orientation has a square band, because 1.05:1 is not landscape', () => {
    assert.equal(orientationOf(0.667), 'portrait');
    assert.equal(orientationOf(1), 'square');
    assert.equal(orientationOf(1.05), 'square');
    assert.equal(orientationOf(1.5), 'landscape');
    assert.equal(orientationOf(3), 'panoramic');
  });
});

describe('print, which is the question a website never asks', () => {
  test('300dpi in millimetres, and what that means', () => {
    assert.deepEqual(printableMm(3508, 2480), { widthMm: 297, heightMm: 210, dpi: 300 });
    assert.equal(printVerdict(297, 210), 'A4 or larger');
    assert.equal(printVerdict(210, 148), 'A5');
    assert.equal(printVerdict(120, 80), 'a card, no bigger');
    assert.equal(printVerdict(40, 30), 'too small to print at any useful size');
  });

  test('a 1080px social export is a business card on paper', () => {
    const mm = printableMm(1080, 1080);
    assert.equal(mm.widthMm, 91);
    assert.equal(printVerdict(mm.widthMm, mm.heightMm), 'too small to print at any useful size');
  });
});

describe('photograph or furniture', () => {
  test('a favicon is not judged on crop, because that answer is useless', () => {
    assert.equal(kindOf('brand/favicon-32.png', { format: 'png', width: 32, height: 32 }), 'furniture');
    assert.equal(kindOf('img/logo.svg', { format: 'svg', width: 400, height: 100 }), 'furniture');
    assert.equal(kindOf('shots/dog.jpg', { format: 'jpeg', width: 4032, height: 3024 }), 'photo');
  });

  test('furniture is measured but carries no crop verdict', () => {
    const a = assess({ width: 32, height: 32, format: 'png' }, { kind: 'furniture' });
    assert.deepEqual(a.fits, []);
    assert.equal(a.print, null);
    assert.equal(a.reviewed, true, 'nobody needs to look at a favicon to place it');
  });
});

describe('what a measurement can say on its own, and what it must not', () => {
  const portrait = assess({ width: 1080, height: 1620, format: 'jpeg' });

  test('it names the destructive slots rather than only scoring them', () => {
    const band = portrait.fits.find((f) => f.slot === 'shopfront band');
    assert.equal(band.verdict, 'destructive');
    assert.ok(portrait.notes.some((n) => /Destroys the frame in/.test(n)));
    assert.ok(portrait.notes.some((n) => /Portrait\. Never letterbox/.test(n)));
  });

  test('subject is null and reviewed is false, always', () => {
    // The one thing pixels cannot answer. A crop that keeps two faces and one
    // that slices them measure identically.
    assert.equal(portrait.subject, null);
    assert.equal(portrait.treatment, null);
    assert.equal(portrait.reviewed, false);
  });

  test('every slot is a real brand surface, not a website section', () => {
    const names = SLOTS.map((s) => s.name);
    for (const expected of ['shopfront band', 'vehicle panel', 'A4 flyer', 'avatar circle']) {
      assert.ok(names.includes(expected), `${expected} is a surface a brand actually lands on`);
    }
  });
});

describe('cataloguing a folder', () => {
  test('it reports the shape of the set, which is what decides the plan', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'brandi-cat-'));
    const png = (w, h) => {
      const b = Buffer.alloc(24);
      b.writeUInt32BE(0x89504e47, 0); b.writeUInt32BE(13, 8); b.write('IHDR', 12);
      b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20);
      return b;
    };
    await mkdir(path.join(dir, 'photos'), { recursive: true });
    for (let i = 0; i < 8; i++) await writeFile(path.join(dir, 'photos', `p${i}.png`), png(1080, 1620));
    await writeFile(path.join(dir, 'photos', 'wide.png'), png(4000, 1300));
    await writeFile(path.join(dir, 'photos', 'clip.mp4'), 'not measured');

    const doc = await catalogueImages(dir);
    assert.equal(doc.counts.photos, 9);
    assert.equal(doc.counts.byOrientation.portrait, 8);
    assert.equal(doc.counts.video, 1, 'video is counted and named, not ignored');

    const text = summarise(doc);
    assert.match(text, /89% of this set is portrait/, 'the headline fact leads');
    assert.match(text, /never been looked at/);
    assert.match(text, /video files/);

    // The set suits a portrait slot and not a band, and the summary says so.
    assert.equal(doc.slotFit[0].slot === 'shopfront band', false);
    const band = doc.slotFit.find((s) => s.slot === 'shopfront band');
    assert.ok(band.destroys >= 8);
    await rm(dir, { recursive: true, force: true });
  });

  test('a recorded review survives a re-measure', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'brandi-cat-'));
    const b = Buffer.alloc(24);
    b.writeUInt32BE(0x89504e47, 0); b.writeUInt32BE(13, 8); b.write('IHDR', 12);
    b.writeUInt32BE(2000, 16); b.writeUInt32BE(3000, 20);
    await writeFile(path.join(dir, 'a.png'), b);
    const prior = { 'a.png': { reviewed: true, subject: 'two faces, upper third', treatment: 'A4 flyer, object-position top' } };
    const doc = await catalogueImages(dir, { prior });
    assert.equal(doc.assets['a.png'].reviewed, true);
    assert.equal(doc.assets['a.png'].subject, 'two faces, upper third');
    assert.equal(doc.counts.reviewed, 1);
    await rm(dir, { recursive: true, force: true });
  });
});
