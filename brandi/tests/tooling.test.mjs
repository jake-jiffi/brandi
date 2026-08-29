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
