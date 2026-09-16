/**
 * The two modules that touch the outside world: finding the ephemeral /design
 * helper, and rendering an artboard to something a person can look at.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import * as D from '../scripts/design-locate.mjs';
import * as P from '../scripts/preview.mjs';
import { artboard } from '../scripts/canvas.mjs';

describe('design-locate', () => {
  test('finds every copy of the design skill on this machine, newest first', async () => {
    const found = await D.findDesignSkills();
    // The helper only exists once /design has run in a session. Both outcomes
    // are legitimate, so assert on the shape rather than on presence.
    assert.ok(Array.isArray(found));
    for (const f of found) {
      assert.ok(existsSync(f.helper), `${f.helper} was reported but does not exist`);
      assert.ok(existsSync(f.template), `${f.template} was reported but does not exist`);
      assert.match(f.helper, /seed-canvas\.mjs$/);
      assert.ok(typeof f.version === 'string' && f.version.length > 0);
    }
    for (let i = 1; i < found.length; i++) {
      assert.ok(found[i - 1].mtime >= found[i].mtime, 'results must be newest first');
    }
  });

  test('locate returns the newest, or null, and never throws', async () => {
    const one = await D.locateDesignHelper();
    const all = await D.findDesignSkills();
    if (all.length === 0) assert.equal(one, null);
    else assert.equal(one.helper, all[0].helper);
  });

  test('says what to do when it finds nothing, rather than failing silently', () => {
    assert.match(D.NOT_FOUND_MESSAGE, /\/design/);
    assert.match(D.NOT_FOUND_MESSAGE, /temporary directory/);
    assert.ok(D.NOT_FOUND_MESSAGE.split('\n').length > 3, 'the message should actually explain itself');
  });

  test('never reports the same directory twice', async () => {
    const found = await D.findDesignSkills();
    assert.equal(new Set(found.map((f) => f.dir)).size, found.length);
  });
});

describe('preview', () => {
  const src = artboard({
    name: 'Main',
    fonts: 'https://fonts.googleapis.com/css2?family=Bitter:wght@400&display=swap',
    body: '<div style="padding:48px;background:#F4EFE6"><h1 style="margin:0">Hello</h1></div>',
    props: { accent: { editor: 'color', default: '#1F6F4A' } },
    logic: 'renderVals() { return { accent: this.props.accent }; }',
  });

  test('drops the support line, which would 404 outside the runtime', () => {
    const out = P.toPreviewHtml(src);
    assert.equal(out.includes('src="./support.js"'), false);
  });

  test('gives the custom elements a display, so the artboard is visible at all', () => {
    const out = P.toPreviewHtml(src);
    assert.match(out, /x-dc \{ display: block; \}/);
    assert.match(out, /helmet \{ display: none; \}/);
  });

  test('removes the logic block, which references a class the runtime defines', () => {
    const out = P.toPreviewHtml(src);
    assert.equal(/data-dc-script/.test(out), false);
    assert.equal(/DCLogic/.test(out), false);
  });

  test('keeps the content and the stylesheet link', () => {
    const out = P.toPreviewHtml(src);
    assert.match(out, /Hello/);
    assert.match(out, /fonts\.googleapis\.com/);
    assert.match(out, /background:#F4EFE6/);
  });

  test('honours a frame size when one is given', () => {
    const out = P.toPreviewHtml(src, { width: 1440, height: 900 });
    assert.match(out, /body > x-dc \{ width: 1440px; min-height: 900px;/);
  });

  test('omits the frame rule when no size is given', () => {
    assert.equal(/body > x-dc \{ width/.test(P.toPreviewHtml(src)), false);
  });

  test('findChrome returns a real path or null, never a guess', () => {
    const chrome = P.findChrome();
    if (chrome !== null) assert.ok(existsSync(chrome), `${chrome} was reported but does not exist`);
  });

  describe('on disk', () => {
    let dir;
    before(async () => {
      dir = await mkdtemp(path.join(tmpdir(), 'brandi-preview-'));
      await writeFile(path.join(dir, 'Main.dc.html'), src);
    });
    after(async () => {
      await rm(dir, { recursive: true, force: true });
    });

    test('writes a previewable html file next to the artboard', async () => {
      const res = await P.previewArtboard(path.join(dir, 'Main.dc.html'), { outDir: dir, png: false, width: 900 });
      assert.ok(existsSync(res.html));
      assert.match(path.basename(res.html), /^Main\.preview\.html$/);
      const html = await readFile(res.html, 'utf8');
      assert.match(html, /preview of Main\.dc\.html/);
      assert.match(html, /Hello/);
    });

    test('reports honestly whether a browser was available', async () => {
      const res = await P.previewArtboard(path.join(dir, 'Main.dc.html'), { outDir: dir, png: false });
      assert.equal(typeof res.chrome, 'boolean');
      assert.equal(res.png, null, 'png: false must mean no png');
    });

    test('creates the output directory rather than failing on a missing one', async () => {
      const nested = path.join(dir, 'a', 'b', 'c');
      const res = await P.previewArtboard(path.join(dir, 'Main.dc.html'), { outDir: nested, png: false });
      assert.ok(existsSync(res.html));
    });
  });
});

describe('paths with spaces in them', () => {
  let spaced;
  before(async () => {
    spaced = await mkdtemp(path.join(tmpdir(), 'brandi tooling '));
  });
  after(async () => {
    await rm(spaced, { recursive: true, force: true });
  });

  test('the preview writes into a directory whose name contains a space', async () => {
    const src = artboard({ name: 'Main', body: '<div style="padding:32px;background:#F4EFE6">Hi</div>' });
    const file = path.join(spaced, 'Main.dc.html');
    await writeFile(file, src);
    const res = await P.previewArtboard(file, { outDir: path.join(spaced, 'out dir'), png: false });
    assert.ok(existsSync(res.html));
    assert.ok(res.html.includes(' '), 'the test is only meaningful with a space in the path');
  });

  test('the CLI runs end to end from a directory whose name contains a space', async () => {
    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const run = promisify(execFile);
    const cli = path.join(import.meta.dirname, '..', 'scripts', 'brandi.mjs');
    const project = path.join(spaced, 'a project');
    await mkdir(project, { recursive: true });
    const call = (args) => run(process.execPath, [cli, ...args, '--json'], { cwd: project, timeout: 60000 });

    await call(['init', '--name', 'Spaced Out']);
    for (const [k, v] of [
      ['identity.colour.primary', '#1F6F4A'],
      ['identity.school', 'craft-heritage'],
      ['identity.type.display', 'Bitter'],
      ['identity.type.body', 'Karla'],
    ]) await call(['set', k, v]);

    const sys = JSON.parse((await call(['system'])).stdout);
    assert.equal(sys.ok, true, JSON.stringify(sys));
    await call(['tokens']);
    await call(['sheets']);
    await call(['book']);
    for (const f of ['brand/brand.json', 'brand/tokens/tokens.css', 'brand/brand-book.html']) {
      assert.ok(existsSync(path.join(project, f)), `${f} should exist`);
    }
  });
});

/**
 * `preview.mjs --dir` is the one fallback both skills name for a session with
 * no /design canvas and no Artifact tool. It stood in for the canvas while
 * rendering every artboard at a hardcoded 1200x2400 and dropping every
 * relatively-referenced image, so a 390x844 phone came back 1200 wide with half
 * the frame blank and a mockup came back as a broken-image icon.
 */
describe('the canvas fallback renders each artboard as it is', () => {
  const CHROME = P.findChrome();
  const needsChrome = { skip: CHROME ? false : 'no headless browser on this machine' };

  describe('frame resolution', () => {
    test('manifestFrames reads the per-file sizes canvas.json records', async () => {
      const dir = await mkdtemp(path.join(tmpdir(), 'brandi-frames-'));
      try {
        await writeFile(path.join(dir, 'canvas.json'), JSON.stringify({
          artboards: [
            { file: 'Mobile.dc.html', w: 390, h: 844 },
            { file: 'Print.dc.html', w: 794, h: 1123 },
          ],
        }));
        const frames = await P.manifestFrames(dir);
        assert.deepEqual(frames.get('Mobile.dc.html'), { w: 390, h: 844 });
        assert.deepEqual(frames.get('Print.dc.html'), { w: 794, h: 1123 });
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });

    test('a missing or unreadable canvas.json is an empty map, not a crash', async () => {
      const dir = await mkdtemp(path.join(tmpdir(), 'brandi-frames-'));
      try {
        assert.equal((await P.manifestFrames(dir)).size, 0);
        await writeFile(path.join(dir, 'canvas.json'), '{ not json');
        assert.equal((await P.manifestFrames(dir)).size, 0);
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });

    test('an entry with no usable size is skipped rather than rendered at NaN', async () => {
      const dir = await mkdtemp(path.join(tmpdir(), 'brandi-frames-'));
      try {
        await writeFile(path.join(dir, 'canvas.json'), JSON.stringify({
          artboards: [
            { file: 'A.dc.html', w: 0, h: 900 },
            { file: 'B.dc.html', w: 1440 },
            { file: 'C.dc.html', w: 1440, h: 900 },
          ],
        }));
        const frames = await P.manifestFrames(dir);
        assert.equal(frames.has('A.dc.html'), false);
        assert.equal(frames.has('B.dc.html'), false);
        assert.deepEqual(frames.get('C.dc.html'), { w: 1440, h: 900 });
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    });

    test('declaredFrame reads the artboard’s own $preview hint', () => {
      const src = artboard({ name: 'Poster', body: '<p>x</p>', preview: { width: 794, height: 1123 } });
      assert.deepEqual(P.declaredFrame(src), { w: 794, h: 1123 });
    });

    test('an artboard with no hint declares nothing, rather than guessing', () => {
      assert.equal(P.declaredFrame(artboard({ name: 'Plain', body: '<p>x</p>' })), null);
    });
  });

  describe('on disk', () => {
    let src, out;
    const magenta = { r: 255, g: 0, b: 255 };

    before(async () => {
      const { encodePng } = await import('../scripts/png.mjs');
      src = await mkdtemp(path.join(tmpdir(), 'brandi-fallback-'));
      out = path.join(src, '..', `${path.basename(src)}-out`);
      // A solid magenta square, referenced the way a mockup references its
      // photograph: relative, and resolved against the artboard's directory.
      const w = 64;
      const data = new Uint8Array(w * w * 3);
      for (let i = 0; i < w * w; i++) {
        data[i * 3] = magenta.r; data[i * 3 + 1] = magenta.g; data[i * 3 + 2] = magenta.b;
      }
      await writeFile(path.join(src, 'photo.png'), encodePng({ width: w, height: w, channels: 3, data }));
      await writeFile(path.join(src, 'Mobile.dc.html'), artboard({
        name: 'Mobile', body: '<div style="padding:24px;background:#F4EFE6"><p>phone</p></div>',
      }));
      await writeFile(path.join(src, 'Photo.dc.html'), artboard({
        name: 'Photo',
        body: '<div style="margin:0"><img src="photo.png" alt="a magenta square" width="300" height="300"></div>',
      }));
      await writeFile(path.join(src, 'Hinted.dc.html'), artboard({
        name: 'Hinted', body: '<p>hinted</p>', preview: { width: 816, height: 1056 },
      }));
      await writeFile(path.join(src, 'Unknown.dc.html'), artboard({ name: 'Unknown', body: '<p>unknown</p>' }));
      await writeFile(path.join(src, 'canvas.json'), JSON.stringify({
        artboards: [
          { file: 'Mobile.dc.html', x: 0, y: 0, w: 390, h: 844 },
          { file: 'Photo.dc.html', x: 500, y: 0, w: 600, h: 400 },
        ],
      }));
    });
    after(async () => {
      await rm(src, { recursive: true, force: true });
      await rm(out, { recursive: true, force: true });
    });

    const runDir = async (extra = []) => {
      const { execFile } = await import('node:child_process');
      const { promisify } = await import('node:util');
      const run = promisify(execFile);
      const cli = path.join(import.meta.dirname, '..', 'scripts', 'preview.mjs');
      return run(process.execPath, [cli, '--dir', src, '--out', out, ...extra], { timeout: 300000 });
    };

    test('each artboard is framed by canvas.json, then its own hint, then the default', async () => {
      await runDir(['--png', 'false']);
      const frame = async (stem) => {
        const html = await readFile(path.join(out, `${stem}.preview.html`), 'utf8');
        const m = /body > x-dc \{ width: (\d+)px; min-height: (\d+)px;/.exec(html);
        return m ? { w: Number(m[1]), h: Number(m[2]) } : null;
      };
      // canvas.json wins.
      assert.deepEqual(await frame('Mobile'), { w: 390, h: 844 }, 'the phone must not come back 1200 wide');
      assert.deepEqual(await frame('Photo'), { w: 600, h: 400 });
      // No manifest entry, so the artboard's own $preview hint decides.
      assert.deepEqual(await frame('Hinted'), { w: 816, h: 1056 });
      // Neither, so the documented default is the last resort.
      assert.deepEqual(await frame('Unknown'), { w: 1200, h: 2400 });
    });

    test('a frame given on the command line overrides every recorded one', async () => {
      const spare = path.join(out, 'override');
      const { execFile } = await import('node:child_process');
      const { promisify } = await import('node:util');
      const run = promisify(execFile);
      const cli = path.join(import.meta.dirname, '..', 'scripts', 'preview.mjs');
      await run(process.execPath, [cli, '--dir', src, '--out', spare, '--width', '500', '--height', '700', '--png', 'false'], { timeout: 300000 });
      const html = await readFile(path.join(spare, 'Mobile.preview.html'), 'utf8');
      assert.match(html, /body > x-dc \{ width: 500px; min-height: 700px;/);
    });

    test('a preview written elsewhere still resolves the artboard’s relative images', async () => {
      const html = await readFile(path.join(out, 'Photo.preview.html'), 'utf8');
      const m = /<base href="([^"]+)">/.exec(html);
      assert.ok(m, 'a preview in another directory needs a <base> or its images 404');
      assert.equal(m[1], pathToFileURL(path.resolve(src) + path.sep).href);
      assert.equal(m[1].endsWith('/'), true, 'a base without a trailing slash drops the last segment');
    });

    test('the run leaves an index page that shows the set as a set', async () => {
      const index = await readFile(path.join(out, 'index.html'), 'utf8');
      for (const f of ['Mobile.dc.html', 'Photo.dc.html', 'Hinted.dc.html', 'Unknown.dc.html']) {
        assert.match(index, new RegExp(f.replace('.', '\\.')));
      }
      assert.match(index, /390&times;844/);
      assert.match(index, /4 artboards/);
    });

    test('the printed list names every artboard with the frame it was rendered at', async () => {
      const { stdout } = await runDir(['--png', 'false']);
      assert.match(stdout, /Mobile\.dc\.html\s+390x844\s+\S+Mobile/);
      assert.match(stdout, /Unknown\.dc\.html\s+1200x2400\s/);
      assert.match(stdout, /index\.html/);
    });

    // One render, two assertions: the frames are the recorded ones, and the
    // photograph is in the pixels. Rendering twice doubles the cost of the
    // slowest thing in this file for no extra coverage.
    test('the PNGs are the recorded frames and carry the relative image', needsChrome, async () => {
      await runDir();
      const { decodePng } = await import('../scripts/png.mjs');
      const phone = decodePng(await readFile(path.join(out, 'Mobile.png')));
      assert.equal(phone.width, 390, 'the phone must not come back 1200 wide');
      assert.equal(phone.height, 844);
      const unknown = decodePng(await readFile(path.join(out, 'Unknown.png')));
      assert.equal(unknown.width, 1200, 'nothing recorded, so the default still applies');

      const png = decodePng(await readFile(path.join(out, 'Photo.png')));
      let hits = 0;
      for (let i = 0; i < png.width * png.height; i++) {
        const o = i * png.channels;
        if (png.data[o] > 200 && png.data[o + 1] < 60 && png.data[o + 2] > 200) hits++;
      }
      // 300x300 of magenta is 90,000 pixels. A broken-image icon is none.
      assert.ok(hits > 50000, `expected the photograph in the render, found ${hits} of its pixels`);
    });
  });
});

/**
 * The attacks on the fallback, rather than the path already known to work.
 * Frames now come from files people hand-edit and directories people name, so
 * the interesting failures are a space in a path, an artboard that sets its own
 * base, a flag with nothing after it, and a typo in canvas.json.
 */
describe('the canvas fallback under attack', () => {
  const CHROME = P.findChrome();
  const needsChrome = { skip: CHROME ? false : 'no headless browser on this machine' };
  let root;

  before(async () => {
    root = await mkdtemp(path.join(tmpdir(), 'brandi attack '));
  });
  after(async () => {
    await rm(root, { recursive: true, force: true });
  });

  const runDir = async (dir, out, extra = []) => {
    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const run = promisify(execFile);
    const cli = path.join(import.meta.dirname, '..', 'scripts', 'preview.mjs');
    return run(process.execPath, [cli, '--dir', dir, '--out', out, ...extra], { timeout: 300000 });
  };

  test('an image resolves through a source directory whose name contains a space', needsChrome, async () => {
    // pathToFileURL percent-encodes the space. String-building the URL does
    // not, and Chrome then resolves half a path and renders nothing.
    const { encodePng, decodePng } = await import('../scripts/png.mjs');
    const dir = path.join(root, 'a canvas dir');
    const out = path.join(root, 'out one');
    await mkdir(dir, { recursive: true });
    const w = 64;
    const data = new Uint8Array(w * w * 3);
    for (let i = 0; i < w * w; i++) { data[i * 3] = 255; data[i * 3 + 1] = 0; data[i * 3 + 2] = 255; }
    await writeFile(path.join(dir, 'photo.png'), encodePng({ width: w, height: w, channels: 3, data }));
    await writeFile(path.join(dir, 'Photo.dc.html'), artboard({
      name: 'Photo', body: '<div><img src="photo.png" alt="magenta" width="300" height="300"></div>',
    }));
    await writeFile(path.join(dir, 'canvas.json'), JSON.stringify({
      artboards: [{ file: 'Photo.dc.html', w: 400, h: 400 }],
    }));
    await runDir(dir, out);
    const png = decodePng(await readFile(path.join(out, 'Photo.png')));
    let hits = 0;
    for (let i = 0; i < png.width * png.height; i++) {
      const o = i * png.channels;
      if (png.data[o] > 200 && png.data[o + 1] < 60 && png.data[o + 2] > 200) hits++;
    }
    assert.ok(hits > 50000, `a space in the path lost the image: ${hits} magenta pixels`);
  });

  test('an artboard that sets its own base keeps it', () => {
    // The first base with an href wins, so injecting ours ahead of the
    // artboard's would silently redirect every relative URL it owns.
    const src = artboard({ name: 'Own', body: '<p>x</p>' })
      .replace('<head>', '<head>\n  <base href="https://example.test/assets/">');
    const out = P.toPreviewHtml(src, { base: 'file:///somewhere/else/' });
    assert.equal(out.includes('file:///somewhere/else/'), false, 'ours overrode the artboard’s own base');
    assert.match(out, /https:\/\/example\.test\/assets\//);
  });

  test('a flag with nothing after it does not become a one-pixel frame', async () => {
    // `--width --out x` parses the next flag as the value, so width was `true`
    // and Number(true) is 1: every artboard rendered 1px wide, in silence.
    const dir = path.join(root, 'stray');
    const out = path.join(root, 'out stray');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'Main.dc.html'), artboard({ name: 'Main', body: '<p>x</p>' }));
    await writeFile(path.join(dir, 'canvas.json'), JSON.stringify({
      artboards: [{ file: 'Main.dc.html', w: 390, h: 844 }],
    }));
    const { stdout } = await runDir(dir, out, ['--width', '--png', 'false']);
    assert.match(stdout, /Main\.dc\.html\s+390x844/, 'a valueless --width must not override the recorded frame');
  });

  test('a frame typed an order of magnitude too large is clamped, and says so', async () => {
    const dir = path.join(root, 'huge');
    const out = path.join(root, 'out huge');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'Main.dc.html'), artboard({ name: 'Main', body: '<p>x</p>' }));
    await writeFile(path.join(dir, 'canvas.json'), JSON.stringify({
      artboards: [{ file: 'Main.dc.html', w: 144000, h: 900 }],
    }));
    const { stdout, stderr } = await runDir(dir, out, ['--png', 'false']);
    assert.match(stdout, new RegExp(`Main\\.dc\\.html\\s+${P.MAX_FRAME}x900`));
    assert.match(stderr, /asks for 144000x900/);
    assert.match(stderr, /canvas\.json, or the size you passed/);
  });

  test('clampFrame leaves every real frame alone', () => {
    for (const f of [{ w: 390, h: 844 }, { w: 1440, h: 1600 }, { w: 1200, h: 4198 }, { w: 1920, h: 1080 }]) {
      assert.deepEqual(P.clampFrame(f, 'X.dc.html'), f);
    }
  });

  test('one artboard that cannot be read does not take the rest of the set down', async () => {
    // Every frame now comes from a file someone can edit, so the chance of one
    // artboard failing went up. Losing eleven good previews to it would make
    // the fallback worse than what it replaced, not better.
    const dir = path.join(root, 'partial');
    const out = path.join(root, 'out partial');
    await mkdir(path.join(dir, 'Broken.dc.html'), { recursive: true });
    await writeFile(path.join(dir, 'Good.dc.html'), artboard({ name: 'Good', body: '<p>good</p>' }));
    await writeFile(path.join(dir, 'canvas.json'), JSON.stringify({
      artboards: [{ file: 'Good.dc.html', w: 300, h: 200 }],
    }));
    // A directory named like an artboard cannot be read, so it stands in for
    // anything unreadable without depending on permissions.
    let err = null;
    try {
      await runDir(dir, out, ['--png', 'false']);
    } catch (e) {
      err = e;
    }
    assert.ok(err, 'a set with a failure must not report a clean run');
    assert.equal(err.code, 1);
    assert.match(err.stdout, /Good\.dc\.html\s+300x200/, 'the good artboard must still be rendered');
    assert.match(err.stdout, /Broken\.dc\.html\s+\S+\s+FAILED/);
    assert.match(err.stderr, /1 of 2 did not render: Broken\.dc\.html/);
    assert.ok(existsSync(path.join(out, 'Good.preview.html')));
    const index = await readFile(path.join(out, 'index.html'), 'utf8');
    assert.match(index, /did not render/);
    assert.match(index, /Good\.dc\.html/);
  });

  test('a file name with a quote in it cannot break out of the index page markup', () => {
    const sheet = P.contactSheet(
      [{ file: 'A".dc.html', w: 10, h: 10, png: 'A".png', html: 'A".preview.html' }],
      '/tmp/<script>',
    );
    assert.equal(sheet.includes('"A".png"'), false);
    assert.equal(sheet.includes('<script>'), false);
    assert.match(sheet, /&quot;/);
  });
});
