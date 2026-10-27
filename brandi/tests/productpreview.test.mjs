import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { artboard } from '../scripts/canvas.mjs';
import * as P from '../scripts/preview.mjs';
import { ensurePageReact, PAGE_REACT, sha256, cacheDir } from '../scripts/pagereact.mjs';

const run = promisify(execFile);

describe('a board that needs a runtime is previewed with one', () => {
  const mounted = artboard({
    name: 'Bookings1440',
    system: 'acme',
    body: '<x-import component-from-global-scope="Acme.Root"><p style="margin:0">Hi</p></x-import>',
  });
  const plain = artboard({ name: 'Plain', body: '<p style="margin:0">Hello</p>' });

  test('it knows which boards need one: holes, mounts, imports, loops, branches and installed files', () => {
    assert.equal(P.needsRuntime(mounted), true);
    assert.equal(P.needsRuntime(plain), false);
    for (const src of ['<p>{{x}}</p>', '<dc-import name="A"></dc-import>', '<sc-for list="{{a}}" as="b"></sc-for>', '<sc-if value="{{a}}"></sc-if>', '<link rel="stylesheet" href="ds/acme/tokens.css">', '<script src="../ds/acme/components/bundle.js"></script>']) {
      assert.equal(P.needsRuntime(src), true, src);
    }
  });

  test('with a runtime, the logic block stays and the page React and the shim replace the support line', () => {
    const out = P.toPreviewHtml(mounted, { runtime: { react: '/c/react.js', reactDom: '/c/react-dom.js', shim: '/c/dc-shim.js' }, width: 900, height: 400 });
    assert.equal(out.includes('src="./support.js"'), false);
    assert.match(out, /data-dc-script/, 'the runtime needs the logic block');
    const order = ['react.js', 'react-dom.js', 'dc-shim.js', 'ds/acme/tokens.css', 'ds/acme/components/bundle.js'].map((f) => out.indexOf(f));
    assert.deepEqual([...order].sort((a, b) => a - b), order, 'React, then the shim, then the system');
    assert.match(out, /body > \[data-dc-root\] \{ width: 900px;/);
  });

  test('a React file that does not match its pinned hash is never used', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-react-'));
    let calls = 0;
    const bad = async () => { calls++; return { ok: true, arrayBuffer: async () => new TextEncoder().encode('not react').buffer }; };
    await assert.rejects(ensurePageReact({ dir, fetchImpl: bad }), /does not match its pinned hash/);
    assert.equal(calls, 1);
    assert.equal(existsSync(path.join(dir, PAGE_REACT.files[0].name)), false, 'nothing unverified is left in the cache');
    await rm(dir, { recursive: true, force: true });
  });

  test('a cached file with the right hash is used without fetching anything', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-react-'));
    const cached = path.join(cacheDir(), `react-${PAGE_REACT.version}`);
    const have = PAGE_REACT.files.every((f) => existsSync(path.join(cached, f.name)));
    if (!have) { await rm(dir, { recursive: true, force: true }); return; }
    for (const f of PAGE_REACT.files) await writeFile(path.join(dir, f.name), await readFile(path.join(cached, f.name)));
    const never = async () => { throw new Error('fetched'); };
    const paths = await ensurePageReact({ dir, fetchImpl: never });
    assert.equal(sha256(await readFile(paths.react)), PAGE_REACT.files[0].sha256);
    await rm(dir, { recursive: true, force: true });
  });
});

describe('the shim renders a mounted board in a real browser', async () => {
  const chrome = P.findChrome();
  let react = null;
  try { react = await ensurePageReact(); } catch { /* offline: the render tests below say so and pass */ }

  test('holes, x-import, sc-for, sc-if, state and a dark twin through dc-import', { skip: !chrome || !react ? 'needs Chrome and React 18 (cached or reachable)' : false }, async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-shim-'));
    await mkdir(path.join(dir, 'ds', 'fake', 'components'), { recursive: true });
    // A stand-in system: one provider that sets the page theme, one component, both on the page's React.
    await writeFile(path.join(dir, 'ds', 'fake', 'components', 'bundle.js'), `window.Fake = {
      Root: function (p) { React.useLayoutEffect(function () { document.documentElement.dataset.theme = p.theme || 'light'; }, [p.theme]); return React.createElement('div', { 'data-root': p.theme }, p.children); },
      Hello: function (p) { return React.createElement('b', { 'data-hello': '' }, 'Hi ' + p.name + (p.loud ? '!' : '')); }
    };`);
    await writeFile(path.join(dir, 'ds', 'fake', 'tokens.css'), '');
    await writeFile(path.join(dir, 'ds', 'fake', 'components', 'bundle.css'), '');
    await writeFile(path.join(dir, 'Board.dc.html'), artboard({
      name: 'Board', system: 'fake',
      body: '<x-import component-from-global-scope="Fake.Root" theme="{{theme}}"><p style="margin:0">{{count}} waiting</p><x-import component-from-global-scope="Fake.Hello" name="Ada" loud="{{yes}}"></x-import><sc-for list="{{rows}}" as="r"><i>{{r.label}}</i></sc-for><sc-if value="{{no}}"><u>hidden</u></sc-if></x-import>',
      logic: 'state = { n: 3 };\nrenderVals() { return { theme: this.props.dark ? "dark" : "light", count: this.state.n, yes: true, no: false, rows: [{ label: "one" }, { label: "two" }] }; }',
    }));
    await writeFile(path.join(dir, 'BoardDark.dc.html'), artboard({ name: 'BoardDark', system: 'fake', body: '<dc-import name="Board" dark="{{yes}}" hint-size="100%,200px"></dc-import>', logic: 'renderVals() { return { yes: true }; }' }));
    const dump = async (file) => {
      const res = await P.previewArtboard(path.join(dir, file), { outDir: path.join(dir, 'out'), png: false });
      assert.equal(res.runtime, true);
      // No --allow-file-access-from-files: the detector's browser runs without it, so a placed board has
      // to arrive inside the preview rather than be read from beside it.
      const { stdout } = await run(chrome, ['--headless=new', '--disable-gpu', '--virtual-time-budget=4000', '--dump-dom', pathToFileURL(res.html).href], { timeout: 60000 });
      return stdout;
    };
    const light = await dump('Board.dc.html');
    assert.match(light, /data-dc-ready="1"/);
    assert.match(light, /3 waiting/);
    assert.match(light, /<b data-hello="">Hi Ada!<\/b>/);
    assert.match(light, /<i>one<\/i><i>two<\/i>/);
    assert.equal(light.includes('hidden'), false);
    assert.equal(light.includes('{{'), false, 'no hole is left as text');
    assert.match(light, /data-theme="light"/);
    const dark = await dump('BoardDark.dc.html');
    assert.match(dark, /data-dc-ready="1"/);
    assert.match(dark, /data-theme="dark"/, 'the twin flips the page through the imported board');
    assert.equal(/data-dc-(error|missing)/.test(dark), false);
    await rm(dir, { recursive: true, force: true });
  });

  test('a board naming a component the system lacks says so on the page', { skip: !chrome || !react ? 'needs Chrome and React 18' : false }, async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-shim-'));
    await writeFile(path.join(dir, 'Main.dc.html'), artboard({ name: 'Main', body: '<x-import component-from-global-scope="Nobody.Here"></x-import>' }));
    const res = await P.previewArtboard(path.join(dir, 'Main.dc.html'), { outDir: dir, png: false });
    const { stdout } = await run(chrome, ['--headless=new', '--disable-gpu', '--virtual-time-budget=3000', '--dump-dom', pathToFileURL(res.html).href], { timeout: 60000 });
    assert.match(stdout, /data-dc-missing="Nobody\.Here"/);
    assert.match(stdout, /No component at Nobody\.Here/);
    await rm(dir, { recursive: true, force: true });
  });
});
