import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as K from '../scripts/canvas.mjs';

const minimal = (extra = {}) =>
  K.artboard({ name: 'Main', body: '<div style="padding:32px"><h1 style="margin:0">Hi</h1></div>', ...extra });

describe('artboard()', () => {
  test('emits the support line character for character', () => {
    assert.ok(minimal().includes('<script src="./support.js"></script>'));
  });

  test('wraps content in x-dc with a helmet', () => {
    const a = minimal();
    assert.match(a, /<x-dc>[\s\S]*<\/x-dc>/);
    assert.match(a, /<helmet>[\s\S]*<\/helmet>/);
  });

  test('the floor sits in the base layer, so a mounted component\'s utilities beat it', () => {
    // Unlayered CSS beats every layer whatever its specificity. An unlayered link reset drew a
    // primary Button's href in the body colour, on the Button's own fill.
    const style = /<style>\n([\s\S]*?)<\/style>/.exec(minimal())[1];
    const layer = /@layer base \{\n([\s\S]*?)\n *\} *\n/.exec(style);
    assert.ok(layer, 'a base layer');
    assert.match(layer[1], /a \{ color: inherit;/);
    assert.equal(/(^|\n) *a \{/.test(style.replace(layer[0], '')), false, 'no link reset outside the layer');
  });

  test('a static artboard still carries a typed logic block, with an empty class', () => {
    // The Design canvas expects the block on every artboard and says nothing
    // when it is missing.
    const a = minimal();
    assert.match(a, /<script type="text\/x-dc" data-dc-script>\s*class Component extends DCLogic \{\s*\}\s*<\/script>/);
    assert.equal(K.validateArtboard(a).ok, true);
  });

  test('a props artboard carries a single-quoted data-props attribute', () => {
    const a = minimal({ props: { accent: { editor: 'color', default: '#1F6F4A' } } });
    assert.match(a, /<script type="text\/x-dc" data-dc-script data-props='/);
    assert.match(a, /class Component extends DCLogic/);
  });

  test('props survive an encode and decode round trip', () => {
    const props = { label: { editor: 'text', default: "Jane's dog & co \"quoted\"" } };
    assert.deepEqual(K.decodeProps(K.encodeProps(props)), props);
  });

  test('encoded props escape only what has to be escaped', () => {
    const enc = K.encodeProps({ t: 'a & b\'s "quoted"' });
    assert.ok(enc.includes('&amp;'), 'ampersand must be an entity');
    assert.ok(enc.includes('&#39;'), 'apostrophe must be an entity or it closes the attribute');
    assert.ok(enc.includes('\\"'), 'JSON double quotes stay escaped by JSON, not by an entity');
    assert.equal(enc.includes('&quot;'), false, 'double quotes must NOT become entities inside JSON');
  });

  test('raw UTF-8 passes through props untouched', () => {
    const props = { t: { editor: 'text', default: 'café · naïve · 日本語' } };
    assert.deepEqual(K.decodeProps(K.encodeProps(props)), props);
  });

  test('rejects a name that is not PascalCase or carries an extension', () => {
    for (const bad of ['main', 'Main.dc.html', 'my-board', '', null, '2Board']) {
      assert.throws(() => K.artboard({ name: bad, body: '<p>x</p>' }), TypeError, `should reject ${bad}`);
    }
  });

  test('rejects an empty body', () => {
    assert.throws(() => K.artboard({ name: 'Main', body: '   ' }), TypeError);
  });

  test('refuses a font from any host but Google Fonts', () => {
    assert.throws(() => minimal({ fonts: 'https://use.typekit.net/abc.css' }), RangeError);
    assert.doesNotThrow(() => minimal({ fonts: 'https://fonts.googleapis.com/css2?family=Bitter&display=swap' }));
  });

  test('defines link colours so a later-added link is not browser blue', () => {
    assert.match(minimal(), /a \{ color:/);
    assert.match(minimal(), /a:hover \{/);
  });

  test('a system note becomes a comment that cannot close itself early', () => {
    const a = minimal({ systemNote: 'Type: Bitter -- Karla\nColour: #1F6F4A' });
    assert.match(a, /<!--[\s\S]*Bitter - - Karla[\s\S]*-->/);
  });

  test('a preview size implies a logic block and survives into data-props', () => {
    const a = minimal({ preview: { width: 900, height: 1100 } });
    assert.match(a, /class Component extends DCLogic/);
    const attr = /data-props='([^']*)'/.exec(a);
    assert.ok(attr, 'a preview hint must reach data-props');
    assert.deepEqual(K.decodeProps(attr[1]).$preview, { width: 900, height: 1100 });
  });

  test('a preview hint sits alongside real props rather than replacing them', () => {
    const a = minimal({ props: { accent: { editor: 'color', default: '#1F6F4A' } }, preview: { width: 900, height: 1100 } });
    const decoded = K.decodeProps(/data-props='([^']*)'/.exec(a)[1]);
    assert.equal(decoded.accent.default, '#1F6F4A');
    assert.equal(decoded.$preview.width, 900);
  });

  test('a product board names its screen and language, and loads the installed system after the support line', () => {
    const src = minimal({ title: 'Rosters & leave', lang: 'en-AU', system: 'acme' });
    assert.match(src, /<html lang="en-AU">/);
    assert.match(src, /<title>Rosters &amp; leave<\/title>/);
    const head = src.slice(src.indexOf('<head>'), src.indexOf('</head>')).split('\n').map((l) => l.trim()).filter(Boolean);
    assert.deepEqual(head.slice(-4), [
      '<script src="./support.js"></script>',
      '<link rel="stylesheet" href="ds/acme/tokens.css">',
      '<link rel="stylesheet" href="ds/acme/components/bundle.css">',
      '<script src="ds/acme/components/bundle.js"></script>',
    ]);
    assert.ok(head.indexOf('<title>Rosters &amp; leave</title>') < head.indexOf('<script src="./support.js"></script>'));
    assert.equal(K.validateArtboard(src, { systems: ['acme'] }).ok, true);
  });

  test('refuses a namespace the Design type would skip, and a language that is not a tag', () => {
    for (const bad of ['Acme', '-acme', 'acme corp', 'a/b', '', 'x'.repeat(65)]) {
      assert.throws(() => minimal({ system: bad }), RangeError, JSON.stringify(bad));
    }
    assert.throws(() => minimal({ lang: 'English' }), RangeError);
    assert.doesNotThrow(() => minimal({ system: 'acme_2-x' }));
  });
});

describe('validateArtboard: the silent failures', () => {
  test('a word in example data is not a module statement; a real import or export is', () => {
    const count = (logic) => (K.validateArtboard(K.artboard({ name: 'Probe', title: 'Probe', body: '<div>x</div>', logic })).errors ?? [])
      .filter((e) => /classic script/.test(JSON.stringify(e))).length;
    assert.equal(count('rows = [{ note: "The export to [the bank] failed" }];'), 0, 'example data');
    assert.equal(count('// import nothing here\nconst a = 1;'), 0, 'a comment');
    assert.equal(count('import x from "y";'), 1);
    assert.equal(count('export default 1;'), 1);
  });

  const bad = (body, extra = {}) => K.validateArtboard(K.artboard({ name: 'X', body, ...extra }));

  test('catches an expression inside a hole', () => {
    const r = bad('<p>{{ a + b }}</p>');
    assert.equal(r.ok, false);
    assert.match(r.errors[0].message, /not a dotted lookup/);
  });

  test('allows a real dotted lookup and the loop index', () => {
    const r = bad('<p>{{ item.label }} {{ $index }} {{ true }}</p>');
    assert.equal(r.ok, true, JSON.stringify(r.errors));
  });

  test('catches a ternary written around a hole', () => {
    const r = bad(`<p style="color: {{x}} ? 'a' : 'b'">t</p>`);
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /ternary/.test(e.message)));
  });

  test('catches a single-quoted image src', () => {
    const r = bad(`<img src='logo.png' alt="">`);
    assert.ok(r.errors.some((e) => /double-quoted/.test(e.message)));
  });

  test('catches a data: prefixed image', () => {
    const r = bad('<img src="data:image/png;base64,AAAA" alt="">');
    assert.ok(r.errors.some((e) => /data: URI/.test(e.message)));
  });

  test('catches an image loaded over the network', () => {
    const r = bad('<img src="https://example.com/a.png" alt="">');
    assert.ok(r.errors.some((e) => /no network egress/.test(e.message)));
  });

  test('notes a missing alt attribute', () => {
    const r = bad('<img src="logo.png">');
    assert.ok(r.warnings.some((w) => /alt/.test(w.message)));
  });

  test('catches an external script', () => {
    const src = K.artboard({ name: 'X', body: '<p>x</p>' })
      .replace('</head>', '  <script src="https://cdn.example.com/x.js"></script>\n</head>');
    const r = K.validateArtboard(src);
    assert.ok(r.errors.some((e) => /external script/i.test(e.message)));
  });

  test('catches a missing or altered support line', () => {
    const src = K.artboard({ name: 'X', body: '<p>x</p>' }).replace('<script src="./support.js"></script>', '');
    assert.ok(K.validateArtboard(src).errors.some((e) => /support\.js/.test(e.message)));
  });

  test('catches a missing x-dc root', () => {
    const src = K.artboard({ name: 'X', body: '<p>x</p>' }).replace(/<\/?x-dc>/g, '');
    assert.ok(K.validateArtboard(src).errors.some((e) => /x-dc/.test(e.message)));
  });

  test('catches an empty logic block', () => {
    const src = K.artboard({ name: 'X', body: '<p>x</p>' })
      .replace('</body>', '<script data-dc-script></script>\n</body>');
    assert.ok(K.validateArtboard(src).errors.some((e) => /empty/i.test(e.message)));
  });

  test('catches a logic block that is not the required class', () => {
    const src = K.artboard({ name: 'X', body: '<p>x</p>' })
      .replace('</body>', '<script data-dc-script>class Foo {}</script>\n</body>');
    assert.ok(K.validateArtboard(src).errors.some((e) => /DCLogic/.test(e.message)));
  });

  test('catches import or export in the logic block', () => {
    const src = K.artboard({ name: 'X', body: '<p>x</p>', logic: 'renderVals() { return {}; }' })
      .replace('class Component extends DCLogic {', "import x from 'y';\nclass Component extends DCLogic {");
    assert.ok(K.validateArtboard(src).errors.some((e) => /classic script/.test(e.message)));
  });

  test('catches a double-quoted data-props attribute', () => {
    const src = K.artboard({ name: 'X', body: '<p>x</p>', props: { a: { editor: 'text', default: 'x' } } })
      .replace(/data-props='([^']*)'/, 'data-props="$1"');
    assert.ok(K.validateArtboard(src).errors.some((e) => /single-quoted/.test(e.message)));
  });

  test('catches data-props that will not parse', () => {
    const src = K.artboard({ name: 'X', body: '<p>x</p>', props: { a: { editor: 'text', default: 'x' } } })
      .replace(/data-props='[^']*'/, "data-props='{not json}'");
    assert.ok(K.validateArtboard(src).errors.some((e) => /valid JSON/.test(e.message)));
  });

  test('catches a stylesheet from anywhere but Google Fonts', () => {
    const src = K.artboard({ name: 'X', body: '<p>x</p>' })
      .replace('<helmet>', '<helmet>\n  <link rel="stylesheet" href="https://cdn.example.com/a.css">');
    assert.ok(K.validateArtboard(src).errors.some((e) => /blocks/.test(e.message)));
  });

  test('takes an installed system\'s files only when the index records that namespace', () => {
    const src = minimal({ system: 'acme' });
    assert.equal(K.validateArtboard(src, { systems: ['acme'] }).ok, true);
    const unrecorded = K.validateArtboard(src, { systems: ['other'] });
    assert.equal(unrecorded.ok, false);
    assert.equal(unrecorded.errors.filter((e) => /records no design system with the namespace acme/.test(e.message)).length, 3);
    // The same path one folder down is the same file, reached from a subfolder.
    const nested = src.replaceAll('"ds/acme/', '"../ds/acme/');
    assert.equal(K.validateArtboard(nested, { systems: ['acme'] }).ok, true);
  });

  test('a system path that climbs out of its folder is refused, recorded or not', () => {
    const src = minimal({ system: 'acme' }).replace('ds/acme/components/bundle.js', 'ds/acme/../../evil.js');
    const r = K.validateArtboard(src, { systems: ['acme'] });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /will not serve/.test(e.message)));
    // An outside script is still an outside script.
    const ext = minimal({ system: 'acme' }).replace('ds/acme/components/bundle.js', 'https://cdn.example.com/x.js');
    assert.ok(K.validateArtboard(ext, { systems: ['acme'] }).errors.some((e) => /external script/.test(e.message)));
  });

  test('validateCanvas reads the namespaces from the manifest it is given', () => {
    const manifest = K.canvasManifest([{ file: 'Main.dc.html', w: 100, h: 100 }], { designSystems: [{ namespace: 'acme', title: 'Acme' }] });
    const artboards = [{ file: 'Main.dc.html', source: minimal({ system: 'acme' }) }];
    assert.equal(K.validateCanvas({ artboards, manifest }).ok, true);
    assert.equal(K.validateCanvas({ artboards, manifest: K.canvasManifest([{ file: 'Main.dc.html', w: 100, h: 100 }]) }).ok, false);
  });

  test('catches lorem ipsum', () => {
    assert.ok(bad('<p>Lorem ipsum dolor sit amet</p>').errors.some((e) => /Lorem ipsum/i.test(e.message)));
  });
});

describe('validateArtboard: the house rules', () => {
  const check = (body) => K.validateArtboard(K.artboard({ name: 'X', body }));

  test('flags emoji used as content', () => {
    assert.ok(check('<p>Fast delivery 🚀</p>').warnings.some((w) => /emoji/i.test(w.message)));
  });

  test('does not flag emoji that only appear in a comment', () => {
    const src = K.artboard({ name: 'X', body: '<p>plain</p>', systemNote: 'mood: 🚀' });
    assert.equal(K.validateArtboard(src).warnings.some((w) => /emoji/i.test(w.message)), false);
  });

  test('flags every banned typeface', () => {
    for (const font of ['Inter', 'Roboto', 'Poppins', 'Montserrat']) {
      const r = check(`<p style="font-family: ${font}, sans-serif">x</p>`);
      // p0 in the contract, so a banned face is an error. Defaults (the
      // soft_literals list) stay warnings, which is the distinction the
      // contract draws and the old hand-maintained list flattened.
      assert.ok(
        [...r.errors, ...r.warnings].some((w) => w.message.includes(font)),
        `${font} should be flagged`,
      );
    }
  });

  test('does not flag a face with a point of view', () => {
    const r = check(`<p style="font-family: 'Bitter', Georgia, serif">x</p>`);
    assert.equal(r.warnings.some((w) => /machine-generated/.test(w.message)), false);
  });

  test('a banned face the brand itself records is a warning, never an error', () => {
    // One decision, one severity. `system` already warns about a recorded
    // banned face; the same face used to be an error here, so the brand's own
    // display face blocked the brand's own canvas.
    const src = K.artboard({ name: 'X', body: '<p style="font-family: Inter, sans-serif">x</p>' });
    const recorded = K.validateArtboard(src, { brandFonts: ['Inter', 'Karla'] });
    assert.equal(recorded.ok, true, JSON.stringify(recorded.errors));
    assert.ok(recorded.warnings.some((w) => w.rule === 'banned-font' && /recorded faces/.test(w.message)));
    const stray = K.validateArtboard(src, { brandFonts: ['Fraunces', 'Karla'] });
    assert.equal(stray.ok, false, 'Inter is still an error when it is not the brand face');
    assert.ok(stray.errors.some((e) => e.rule === 'banned-font'));
  });

  test('anti-slop errors carry a rule, structural errors do not', () => {
    const r = K.validateArtboard('<html><body><p style="font-family: Inter">x</p></body></html>');
    assert.ok(r.errors.some((e) => !e.rule && /support\.js/.test(e.message)), 'a missing support line is structural');
    assert.ok(r.errors.some((e) => e.rule === 'banned-font'), 'a banned face is an anti-slop finding');
  });

  test('flags a purple gradient', () => {
    const r = check('<div style="background: linear-gradient(135deg, #8b5cf6, #6366f1)">x</div>');
    assert.ok(r.warnings.some((w) => /purple or indigo/.test(w.message)));
  });

  test('flags filler headline copy', () => {
    assert.ok(check('<h1>Welcome to our website</h1>').warnings.some((w) => /Welcome to our website/.test(w.message)));
  });

  test('flags flex containers with no gap', () => {
    const r = check('<div style="display: flex"><span>a</span><span>b</span></div>');
    assert.ok(r.warnings.some((w) => /gap/.test(w.message)));
  });

  test('a well-built artboard is clean', () => {
    const r = K.validateArtboard(K.artboard({
      name: 'Main',
      fonts: 'https://fonts.googleapis.com/css2?family=Bitter:wght@400;700&display=swap',
      body: `<div style="display:flex; flex-direction:column; gap:24px; padding:64px; background:#F4EFE6">
        <h1 style="margin:0; font-family:'Bitter', Georgia, serif; font-size:64px">The good kind of wet dog</h1>
        <img src="hero.jpg" alt="A dog mid-shake in a wash bay">
      </div>`,
    }));
    assert.equal(r.ok, true, JSON.stringify(r.errors));
    assert.deepEqual(r.warnings, []);
  });
});

describe('canvasManifest', () => {
  const three = [
    { file: 'Main.dc.html', w: 1440, h: 1600 },
    { file: 'Mobile.dc.html', w: 390, h: 844 },
    { file: 'Print.dc.html', w: 794, h: 1123 },
  ];

  test('lays artboards out in a row with real gaps', () => {
    const m = K.canvasManifest(three, { columns: 3, gapX: 120 });
    assert.equal(m.artboards[0].x, 0);
    assert.equal(m.artboards[1].x, 1440 + 120);
    assert.equal(m.artboards[2].x, 1440 + 120 + 390 + 120);
  });

  test('wraps to a new row and clears the row below', () => {
    const m = K.canvasManifest(three, { columns: 2, gapY: 200 });
    assert.equal(m.artboards[2].x, 0);
    assert.equal(m.artboards[2].y, 1600 + 200);
  });

  test('nothing overlaps, chrome included', () => {
    for (const columns of [1, 2, 3, 4]) {
      const m = K.canvasManifest(three, { columns });
      assert.deepEqual(K.findOverlaps(m), [], `overlap at ${columns} columns`);
    }
  });

  test('detects an overlap when positions are forced', () => {
    const m = K.canvasManifest([
      { file: 'A.dc.html', w: 400, h: 400, x: 0, y: 0 },
      { file: 'B.dc.html', w: 400, h: 400, x: 100, y: 100 },
    ]);
    assert.equal(K.findOverlaps(m).length, 1);
  });

  test('catches the name strip colliding with the frame above', () => {
    const m = K.canvasManifest([
      { file: 'A.dc.html', w: 400, h: 400, x: 0, y: 0 },
      { file: 'B.dc.html', w: 400, h: 400, x: 0, y: 420 },
    ]);
    assert.equal(K.findOverlaps(m).length, 1, 'a 20px gap is not enough for the 56px chrome');
  });

  test('refuses duplicate stems, case insensitively', () => {
    assert.throws(() => K.canvasManifest([
      { file: 'Main.dc.html', w: 100, h: 100 },
      { file: 'main.dc.html', w: 100, h: 100 },
    ]), RangeError);
  });

  test('refuses a file that is not a .dc.html', () => {
    assert.throws(() => K.canvasManifest([{ file: 'Main.html', w: 100, h: 100 }]), RangeError);
  });

  test('refuses an empty canvas', () => {
    assert.throws(() => K.canvasManifest([]), TypeError);
  });

  test('carries pages and refuses an unlisted one', () => {
    const m = K.canvasManifest([{ file: 'Main.dc.html', w: 100, h: 100, page: 'work' }], {
      pages: [{ id: 'work', name: 'Design' }],
    });
    assert.deepEqual(m.pages, [{ id: 'work', name: 'Design' }]);
    assert.throws(() => K.canvasManifest([{ file: 'Main.dc.html', w: 100, h: 100, page: 'ghost' }], {
      pages: [{ id: 'work', name: 'Design' }],
    }), RangeError);
  });

  test('refuses a page with no name', () => {
    assert.throws(() => K.canvasManifest([{ file: 'M.dc.html', w: 10, h: 10 }], { pages: [{ id: 'p1' }] }), TypeError);
  });

  test('validates annotations', () => {
    const ok = K.canvasManifest([{ file: 'Main.dc.html', w: 100, h: 100 }], {
      annotations: [{ id: 'note-1', x: 0, y: -160, w: 300, text: 'a\nb' }],
    });
    assert.equal(ok.annotations[0].text, 'a\nb');
    assert.throws(() => K.canvasManifest([{ file: 'M.dc.html', w: 10, h: 10 }], {
      annotations: [{ id: 'bad id!', x: 0, y: 0, w: 300, text: 'x' }],
    }), RangeError);
    assert.throws(() => K.canvasManifest([{ file: 'M.dc.html', w: 10, h: 10 }], {
      annotations: [{ id: 'a', x: 0, y: 0, w: 300, text: ['not', 'a', 'string'] }],
    }), TypeError);
    assert.throws(() => K.canvasManifest([{ file: 'M.dc.html', w: 10, h: 10 }], {
      annotations: [{ id: 'a', x: 0, y: 0, w: 40, text: 'too narrow' }],
    }), RangeError);
  });

  test('a title note carries its kind and row width; a sticky still needs its own width', () => {
    const m = K.canvasManifest([{ file: 'Main.dc.html', w: 100, h: 100 }], {
      annotations: [{ id: 'console', x: 0, y: -300, text: 'Ops console', kind: 'title1', maxW: 9040 }],
    });
    assert.deepEqual(m.annotations[0], { id: 'console', x: 0, y: -300, text: 'Ops console', kind: 'title1', maxW: 9040 });
    assert.equal('w' in m.annotations[0], false, 'no width is invented for a title');
    assert.throws(() => K.canvasManifest([{ file: 'M.dc.html', w: 10, h: 10 }], {
      annotations: [{ id: 'sticky', x: 0, y: 0, text: 'no width' }],
    }), RangeError);
    assert.throws(() => K.canvasManifest([{ file: 'M.dc.html', w: 10, h: 10 }], {
      annotations: [{ id: 't', x: 0, y: 0, text: 'x', kind: 'title1', maxW: 0 }],
    }), RangeError);
    assert.throws(() => K.canvasManifest([{ file: 'M.dc.html', w: 10, h: 10 }], {
      annotations: [{ id: 't', x: 0, y: 0, text: 'x', kind: 'Title One' }],
    }), RangeError);
  });

  test('design system records keep to the hosts and paths the Design type accepts', () => {
    const ok = { namespace: 'acme', title: 'Acme', artifact: 'https://claude.ai/artifact/AbC123', files: ['tokens.json', 'components/bundle.js'] };
    assert.equal(K.canvasManifest([{ file: 'M.dc.html', w: 10, h: 10 }], { designSystems: [ok] }).designSystems[0].namespace, 'acme');
    for (const artifact of ['https://evil.example/artifact/AbC', 'https://claude.ai/artifact/AbC/edit', 'AbC123', 'https://claude.ai/artifact/AbC?x=1']) {
      assert.throws(() => K.checkSystemRecord({ ...ok, artifact }), RangeError, artifact);
    }
    assert.doesNotThrow(() => K.checkSystemRecord({ ...ok, artifact: 'https://preview.claude.com/code/artifact/0b1c-2d' }));
    for (const files of [['../x'], ['/abs'], ['a/../b'], ['ok', 3]]) {
      assert.throws(() => K.checkSystemRecord({ ...ok, files }), RangeError, JSON.stringify(files));
    }
    assert.throws(() => K.checkSystemRecord({ namespace: 'acme', files: ['tokens.json'] }), RangeError, 'files without an address');
  });

  test('FRAMES carries the 820 width a product canvas checks, beside the tablet device', () => {
    assert.deepEqual([K.FRAMES.tablet820.w, K.FRAMES.tablet820.h], [820, 1180]);
    assert.deepEqual([K.FRAMES.tablet.w, K.FRAMES.tablet.h], [834, 1112]);
  });

  test('validates launch', () => {
    assert.deepEqual(
      K.canvasManifest(three, { launch: { view: 'focused', file: 'Main.dc.html' } }).launch,
      { view: 'focused', file: 'Main.dc.html' },
    );
    assert.throws(() => K.canvasManifest(three, { launch: { view: 'focused', file: 'Ghost.dc.html' } }), RangeError);
    assert.throws(() => K.canvasManifest(three, { launch: { view: 'sideways' } }), RangeError);
    assert.throws(() => K.canvasManifest(three, { launch: { view: 'canvas', page: 'ghost' } }), RangeError);
  });

  test('serialises to JSON the seeder will accept', () => {
    const m = K.canvasManifest(three, { pages: [{ id: 'work', name: 'Design' }], launch: { view: 'canvas', page: 'work' } });
    const round = JSON.parse(JSON.stringify(m));
    assert.deepEqual(round, m);
    for (const b of round.artboards) {
      assert.equal(Number.isInteger(b.x), true);
      assert.equal(Number.isInteger(b.y), true);
    }
  });
});

describe('validateCanvas', () => {
  const src = K.artboard({ name: 'Main', body: '<div style="padding:32px">ok</div>' });

  test('flags a manifest entry with no file behind it', () => {
    const m = K.canvasManifest([{ file: 'Main.dc.html', w: 100, h: 100 }, { file: 'Ghost.dc.html', w: 100, h: 100 }]);
    const r = K.validateCanvas({ artboards: [{ file: 'Main.dc.html', source: src }], manifest: m });
    assert.ok(r.errors.some((e) => /not written to disk/.test(e.message)));
  });

  test('flags a file the manifest forgot', () => {
    const m = K.canvasManifest([{ file: 'Main.dc.html', w: 100, h: 100 }]);
    const r = K.validateCanvas({
      artboards: [{ file: 'Main.dc.html', source: src }, { file: 'Extra.dc.html', source: src }],
      manifest: m,
    });
    assert.ok(r.warnings.some((w) => /arbitrary slot/.test(w.message)));
  });

  test('flags a canvas with no Main artboard, with or without a manifest', () => {
    const m = K.canvasManifest([{ file: 'Other.dc.html', w: 100, h: 100 }]);
    const withManifest = K.validateCanvas({ artboards: [{ file: 'Other.dc.html', source: src }], manifest: m });
    assert.ok(withManifest.warnings.some((w) => /No Main artboard/.test(w.message)));
    // The direction round publishes a folder with no manifest yet, which is
    // exactly when a missing Main bites.
    const noManifest = K.validateCanvas({ artboards: [{ file: 'Other.dc.html', source: src }] });
    assert.ok(noManifest.warnings.some((w) => /No Main artboard/.test(w.message)));
  });

  test('a consistent canvas passes', () => {
    const m = K.canvasManifest([{ file: 'Main.dc.html', w: 900, h: 700 }]);
    const r = K.validateCanvas({ artboards: [{ file: 'Main.dc.html', source: src }], manifest: m });
    assert.equal(r.ok, true, JSON.stringify(r.errors));
  });
});

describe('the frame the Design canvas takes', () => {
  test('validate refuses a frame past 8000px, naming the limit and the board', () => {
    const src = K.artboard({ name: 'ComponentsData1440', body: '<p>x</p>', preview: { width: 1440, height: 20251 } });
    const art = K.validateArtboard(src, { name: 'ComponentsData1440.dc.html' });
    assert.equal(art.ok, false);
    assert.ok(art.errors.some((e) => /20251px/.test(e.message) && /8000px/.test(e.message) && /ComponentsData1440/.test(e.message)), JSON.stringify(art.errors));
    const m = K.canvasManifest([{ file: 'Main.dc.html', w: 1440, h: 900 }, { file: 'ComponentsData1440.dc.html', w: 1440, h: 20251 }]);
    const fits = K.artboard({ name: 'Main', body: '<p>x</p>' });
    const r = K.validateCanvas({ artboards: [{ file: 'Main.dc.html', source: fits }, { file: 'ComponentsData1440.dc.html', source: fits }], manifest: m });
    const e = r.errors.find((x) => x.file === 'ComponentsData1440.dc.html' && /8000px/.test(x.message));
    assert.ok(e, JSON.stringify(r.errors));
    assert.match(e.message, /20251px tall/);
    assert.equal(K.FRAME_LIMIT.max, 8000);
    assert.equal(K.validateCanvas({ artboards: [{ file: 'Main.dc.html', source: fits }], manifest: K.canvasManifest([{ file: 'Main.dc.html', w: 1440, h: 8000 }]) }).errors.length, 0, '8000 itself is fine');
  });
});

describe('a dialog drawn over its page', () => {
  test('validate warns about an inert page with no text-occlusion ignore, and is quiet with the documented wrapper', () => {
    const page = '<div style="display: flex; flex-direction: column; gap: 12px;"><h1>Pay run</h1><p>Every line of the page.</p></div>';
    const dialog = '<div role="dialog" aria-label="Approve" style="display: flex; gap: 8px;"><p>Approve the pay run?</p></div>';
    const bare = K.artboard({ name: 'PayRunApprove1440', body: `<div aria-hidden="true" inert="true" style="position: absolute; inset: 0; overflow: hidden;">${page}</div>${dialog}` });
    const r = K.validateArtboard(bare, { name: 'PayRunApprove1440.dc.html' });
    const w = r.warnings.find((x) => /inert/.test(x.message));
    assert.ok(w, JSON.stringify(r.warnings));
    assert.match(w.message, /PayRunApprove1440\.dc\.html/, 'names the board');
    assert.match(w.fix, /data-impeccable-ignore="text-occlusion"/, 'and gives the wrapper');
    const done = K.artboard({ name: 'PayRunApprove1440', body: `<div aria-hidden="true" inert="true" data-impeccable-ignore="text-occlusion" style="position: absolute; inset: 0; overflow: hidden;"><section inert>${page}</section></div>${dialog}` });
    assert.equal(K.validateArtboard(done, { name: 'PayRunApprove1440.dc.html' }).warnings.filter((x) => /inert/.test(x.message)).length, 0, 'the ignore covers the wrapper and everything in it');
    assert.deepEqual(K.inertWithoutIgnore('<div data-impeccable-ignore="nested-cards"><div inert>x</div></div>').length, 1, 'another rule\'s ignore is not this one');
    assert.deepEqual(K.inertWithoutIgnore('<p title="make it inert">x</p><script>const s = "<div inert>"</script>'), [], 'a word in a title or a script is not an inert element');
  });
});

describe('handlers in a case the canvas may not read', () => {
  test('validate fails a lowercase or kebab handler on an element, a camelCase one on an x-import, and novalidate, read from the source', () => {
    const board = (body) => K.validateArtboard(K.artboard({ name: 'BookingForm1440', body }), { name: 'BookingForm1440.dc.html' });
    const wrong = board([
      '<form onsubmit="{{ save }}" novalidate style="display: flex; gap: 12px;"><button ondblclick="{{ pick }}" on-click="{{ pick }}">Book</button></form>',
      '<x-import component-from-global-scope="Acme.DataTable" onRowClick="{{ open }}"></x-import>',
    ].join(''));
    const said = wrong.errors.filter((e) => /may not read/.test(e.message)).map((e) => `${e.message.match(/<[^>]+>/)[0]} ${e.fix.split(':')[0]}`);
    assert.deepEqual(said, [
      '<form onsubmit> Write onSubmit',
      '<form novalidate> Write noValidate',
      '<button ondblclick> Write onDoubleClick',
      '<button on-click> Write onClick',
      '<x-import onRowClick> Write on-row-click',
    ]);
    assert.match(wrong.errors.find((e) => /onsubmit/.test(e.message)).message, /BookingForm1440\.dc\.html/, 'names the board');
    const right = board([
      '<form onSubmit="{{ save }}" noValidate style="display: flex; gap: 12px;"><button onClick="{{ pick }}" title="onclick={{ pick }}">Book</button></form>',
      '<x-import component-from-global-scope="Acme.DataTable" on-row-click="{{ open }}" heading-level="{{ h3 }}"></x-import>',
      '<!-- <button onclick="{{ pick }}"> --><button onclick="alert(1)">A literal never runs</button>',
    ].join(''));
    assert.deepEqual(right.errors.filter((e) => /may not read/.test(e.message)), [], 'the documented forms, a comment and a literal pass');
    assert.deepEqual(K.miscasedAttributes('<script type="text/x-dc">const t = \'<a onclick="{{ x }}">\';</script>'), [], 'a script is not markup');
  });
});

describe('a board that walks window', () => {
  test('validate fails a script that walks window to find a bundle, and passes the namespace named outright', () => {
    // On the canvas a board runs in a frame whose parent is another origin: reading a property of that parent
    // throws, so the lookup breaks there and only there. A board drawn as the top page never shows it.
    const board = (logic) => K.validateArtboard(K.artboard({ name: 'Overlays1440', body: '<div style="display: flex; gap: 12px;"><p>Menus</p></div>', logic }), { name: 'Overlays1440.dc.html' });
    const walked = board('renderVals() { const A = Object.values(window).find((v) => v && v.ICON_NAMES); return { trigger: A.Button }; }');
    const e = walked.errors.find((x) => /walks window/.test(x.message));
    assert.ok(e, JSON.stringify(walked.errors));
    assert.match(e.message, /Overlays1440\.dc\.html/, 'names the board');
    assert.match(e.fix, /window\.<Ns>/, 'and says what to write instead');
    assert.ok(board('renderVals() { return { keys: Object.keys(window) }; }').errors.some((x) => /walks window/.test(x.message)), 'keys too');
    assert.deepEqual(board('renderVals() { return { trigger: window.Acme.Button, rows: Object.values(this.rows) }; }').errors.filter((x) => /walks window/.test(x.message)), [], 'the namespace named outright passes');
  });
});

describe('a class the installed system never built', () => {
  // The bundle's stylesheet holds only the Tailwind classes the kit's own components use. A board that wrote
  // @min-[900px]:grid-cols-3 got no rule for it, and its three columns fell to one with nothing said.
  const sheets = {
    'ds/acme/tokens.css': ':root{--canvas:#fff}.type-title{font-size:24px}.brand-texture{position:relative}',
    'ds/acme/components/bundle.css': '.flex{display:flex}.gap-3{gap:.75rem}.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.w-1\\/2{width:50%}.\\@container{container-type:inline-size}.group-hover\\:underline:is(:where(.group):hover *){text-decoration:underline}.grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}',
  };
  const board = (body, css = '') => K.artboard({ name: 'ConsoleHome1440', system: 'acme', css, body: `<x-import component-from-global-scope="Acme.Root">${body}</x-import>` });
  const check = (source, stylesheets = sheets) => K.validateArtboard(source, { name: 'ConsoleHome1440.dc.html', systems: ['acme'], stylesheets }).warnings.filter((w) => /match(es)? no rule/.test(w.message));

  test('validate names a class no stylesheet the board loads has a rule for, and the board', () => {
    const found = check(board('<div class="flex gap-3 @min-[900px]:grid-cols-3 md:grid-cols-3"><p class="type-title">Home</p></div>'));
    assert.equal(found.length, 1, 'one warning a board');
    assert.match(found[0].message, /ConsoleHome1440\.dc\.html/);
    assert.match(found[0].message, /@min-\[900px\]:grid-cols-3, md:grid-cols-3/);
    assert.match(found[0].fix, /inline style/);
  });

  test('a class the bundle, the tokens or the board\'s own style defines passes, escaped as Tailwind writes it', () => {
    const own = board('<div class="flex gap-3 md:grid-cols-2 w-1/2 @container group"><p class="type-title brand-texture group-hover:underline home-grid">Home</p></div>', '.home-grid { display: grid; }');
    assert.deepEqual(check(own), []);
    assert.deepEqual(check(board('<div class="{{layout}} flex">x</div>')), [], 'a class from a hole is not read');
    assert.deepEqual(check(board('<div class="{{ layout.cls }} flex">x</div>')), [], 'nor one from a hole written with spaces');
    assert.equal(check(board('<div class="gap">x</div>'), { ...sheets, 'ds/acme/components/bundle.css': '.gap-3{gap:1rem}' }).length, 1, 'gap-3 is not gap');
  });

  test('nothing is said when the board loads no system stylesheet, or one that could not be read', () => {
    assert.deepEqual(check(K.artboard({ name: 'Cover', body: '<div class="nowhere">Brand</div>' })), [], 'a brand board is its own CSS');
    const { ['ds/acme/components/bundle.css']: _, ...missing } = sheets;
    assert.deepEqual(check(board('<div class="nowhere">x</div>'), missing), []);
    assert.deepEqual(check(board('<div class="nowhere">x</div>'), null), [], 'and the check runs only when the caller read the sheets');
  });
});

describe('frames', () => {
  test('print frames are correct at 96 pixels per inch', () => {
    // A4 is 210 x 297 mm. 210mm = 8.268in x 96 = 794px. 297mm = 11.693in x 96 = 1123px.
    assert.equal(K.FRAMES.a4.w, 794);
    assert.equal(K.FRAMES.a4.h, 1123);
    assert.equal(K.FRAMES.letter.w, 816);
    assert.equal(K.FRAMES.letter.h, 1056);
  });

  test('the landscape A4 is the portrait one turned', () => {
    assert.equal(K.FRAMES.a4Landscape.w, K.FRAMES.a4.h);
    assert.equal(K.FRAMES.a4Landscape.h, K.FRAMES.a4.w);
  });

  test('the slide frame is 16 by 9', () => {
    assert.equal(K.FRAMES.slide.w / K.FRAMES.slide.h, 16 / 9);
  });
});

describe('validateArtboard: the default-structure heuristic', () => {
  const grid = (labels) => K.validateArtboard(K.artboard({
    name: 'X',
    body: `<div style="display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:32px">
      ${labels.map((l) => `<div style="display:flex; flex-direction:column; gap:8px"><span>${l}</span><h2>Heading</h2><p>Some copy.</p></div>`).join('')}
    </div>`,
  }));

  test('flags a three-column grid numbered like a sequence', () => {
    const r = grid(['01', '02', '03']);
    assert.ok(r.warnings.some((w) => /most-generated section/.test(w.message)), JSON.stringify(r.warnings));
  });

  test('leaves an unnumbered three-column grid alone', () => {
    const r = grid(['Warm water', 'No booking', 'We show you how']);
    assert.equal(r.warnings.some((w) => /most-generated section/.test(w.message)), false);
  });

  test('leaves numbering alone when it is not in a three-column grid', () => {
    const r = K.validateArtboard(K.artboard({
      name: 'X',
      body: `<ol style="display:flex; flex-direction:column; gap:24px">
        <li><span>01</span> Walk in</li><li><span>02</span> Wash</li><li><span>03</span> Dry</li>
      </ol>`,
    }));
    assert.equal(r.warnings.some((w) => /most-generated section/.test(w.message)), false);
  });
});

describe('canvasManifest: pages are laid out independently', () => {
  const mixed = [
    { file: 'Spec1.dc.html', w: 1200, h: 1750, page: 'spec' },
    { file: 'Main.dc.html', w: 1440, h: 1700, page: 'work' },
    { file: 'Spec2.dc.html', w: 1200, h: 1750, page: 'spec' },
    { file: 'Mobile.dc.html', w: 390, h: 844, page: 'work' },
    { file: 'Spec3.dc.html', w: 1200, h: 2000, page: 'spec' },
    { file: 'Print.dc.html', w: 794, h: 1123, page: 'work' },
  ];
  const pages = [{ id: 'work', name: 'Design' }, { id: 'spec', name: 'Specification' }];

  test('every page starts at the origin', () => {
    const m = K.canvasManifest(mixed, { columns: 2, pages });
    for (const p of pages) {
      const boards = m.artboards.filter((a) => a.page === p.id);
      assert.ok(boards.some((a) => a.x === 0 && a.y === 0), `${p.name} has nothing at the origin`);
    }
  });

  test('a page has no holes left by artboards belonging to another page', () => {
    // The bug: one cursor across all artboards meant page A took slots 1 and 2
    // and page B took 3 and 4, so each page rendered with the other's slots as
    // empty space. Two artboards on a page must sit in adjacent columns.
    const m = K.canvasManifest(mixed, { columns: 2, pages });
    for (const p of pages) {
      const boards = m.artboards.filter((a) => a.page === p.id).sort((a, b) => a.y - b.y || a.x - b.x);
      const firstRow = boards.filter((a) => a.y === boards[0].y);
      if (firstRow.length < 2) continue;
      const gap = firstRow[1].x - (firstRow[0].x + firstRow[0].w);
      assert.ok(gap >= 80 && gap <= 200, `${p.name}: first row gap is ${gap}px, which is a hole, not a gutter`);
    }
  });

  test('the laid-out area is no larger than the artboards need', () => {
    const m = K.canvasManifest(mixed, { columns: 2, pages });
    for (const p of pages) {
      const boards = m.artboards.filter((a) => a.page === p.id);
      const area = Math.max(...boards.map((a) => a.y + a.h)) - Math.min(...boards.map((a) => a.y));
      const tallest = boards.reduce((sum, a) => sum + a.h, 0);
      assert.ok(area <= tallest, `${p.name} spans ${area}px for ${tallest}px of content`);
    }
  });

  test('an explicitly positioned artboard stays put and does not shift the others', () => {
    const m = K.canvasManifest([
      { file: 'Pinned.dc.html', w: 400, h: 400, x: 5000, y: 5000 },
      { file: 'A.dc.html', w: 400, h: 400 },
      { file: 'B.dc.html', w: 400, h: 400 },
    ], { columns: 2 });
    const pinned = m.artboards.find((a) => a.file === 'Pinned.dc.html');
    assert.deepEqual([pinned.x, pinned.y], [5000, 5000]);
    assert.deepEqual([m.artboards.find((a) => a.file === 'A.dc.html').x, m.artboards.find((a) => a.file === 'A.dc.html').y], [0, 0]);
    assert.deepEqual(K.findOverlaps(m), []);
  });

  test('nothing overlaps on any page, at any column count', () => {
    for (const columns of [1, 2, 3, 4]) {
      assert.deepEqual(K.findOverlaps(K.canvasManifest(mixed, { columns, pages })), [], `overlap at ${columns} columns`);
    }
  });
});

describe('the Design canvas', () => {
  const legacy = [
    '<!doctype html>', '<html>', '<head>', '  <script src="./support.js"></script>', '</head>', '<body>',
    '<x-dc><div style="padding:32px">Hi</div></x-dc>',
  ];

  test('an artboard with no logic block gets an empty one before </body>', () => {
    const out = K.forDesignCanvas([...legacy, '</body>', '</html>'].join('\n'));
    assert.match(out, /<script type="text\/x-dc" data-dc-script>\nclass Component extends DCLogic \{\n\}\n<\/script>\n<\/body>/);
    assert.equal(K.validateArtboard(out).ok, true);
  });

  test('an untyped logic block is typed, with its props left exactly as they were', () => {
    const props = `data-props='{"a":{"editor":"color","default":"#111111"}}'`;
    const src = [...legacy, `<script data-dc-script ${props}>class Component extends DCLogic {}</script>`, '</body>', '</html>'].join('\n');
    const out = K.forDesignCanvas(src);
    assert.ok(out.includes(`<script type="text/x-dc" data-dc-script ${props}>`));
    assert.equal((out.match(/data-dc-script/g) ?? []).length, 1, 'no second block is added');
  });

  test('a typed block is left alone, so running it twice changes nothing', () => {
    const once = K.forDesignCanvas([...legacy, '</body>', '</html>'].join('\n'));
    assert.equal(K.forDesignCanvas(once), once);
  });

  test('the index is version 3: boards keyed by file, Main first in order, notes by id', () => {
    const manifest = K.canvasManifest([
      { file: 'Palette.dc.html', w: 1200, h: 900, page: 'spec' },
      { file: 'Main.dc.html', w: 1440, h: 1600, page: 'work', is_interactive: true },
    ], {
      pages: [{ id: 'work', name: 'Design' }, { id: 'spec', name: 'Specification' }],
      annotations: [{ id: 'why', x: 0, y: -300, w: 400, text: 'Why this direction', page: 'work' }],
      launch: { view: 'canvas', page: 'work' },
    });
    const index = K.designIndex({ manifest, title: 'Acme brand', now: new Date('2026-09-28T00:00:00Z') });
    assert.equal(index.v, 3);
    assert.deepEqual(index.createdOnFiles, { v: 1, at: '2026-09-28T00:00:00.000Z' });
    assert.equal(index.title, 'Acme brand');
    assert.deepEqual(index.order, ['Main.dc.html', 'Palette.dc.html']);
    assert.deepEqual(Object.keys(index.boards).sort(), ['Main.dc.html', 'Palette.dc.html']);
    assert.equal(index.boards['Main.dc.html'].is_interactive, true);
    assert.equal(index.boards['Palette.dc.html'].page, 'spec');
    assert.deepEqual(index.notes.why, { x: 0, y: -300, text: 'Why this direction', w: 400, page: 'work' });
    assert.deepEqual(index.launch, { view: 'canvas', page: 'work' });
    assert.deepEqual(index.designSystems, []);
  });

  test('an earlier creation record is kept rather than replaced', () => {
    const manifest = K.canvasManifest([{ file: 'Main.dc.html', w: 100, h: 100 }]);
    const createdOnFiles = { v: 1, at: '2026-01-01T00:00:00.000Z' };
    assert.deepEqual(K.designIndex({ manifest, title: 'T', createdOnFiles }).createdOnFiles, createdOnFiles);
  });

  test('a board that mounts a component or wires a handler in its DCLogic is marked interactive from its source, unless its entry says false', () => {
    const boards = {
      'Main.dc.html': '<x-dc><!-- the rows use <x-import> --><h1>Contents</h1></x-dc>',
      'Rosters1440.dc.html': '<x-dc><x-import component-from-global-scope="Acme.Button">Approve</x-import></x-dc>',
      'Picker1440.dc.html': '<x-dc><button onClick="{{ pick }}">Wash</button></x-dc>\n<script type="text/x-dc" data-dc-script>class Component extends DCLogic { renderVals() { return {}; } }</script>',
      'Poster1440.dc.html': '<x-dc><x-import component-from-global-scope="Acme.Avatar"></x-import></x-dc>',
      'Rail1440.dc.html': '<x-dc><div>{{ rail }}</div></x-dc>\n<script type="text/x-dc" data-dc-script>class Component extends DCLogic { renderVals() { const h = React.createElement; return { rail: h(window.Acme.Sidebar, null) }; } }</script>',
      'Specimen1440.dc.html': K.artboard({ name: 'Specimen1440', body: '<p>Every static board carries an empty DCLogic block.</p>' }),
    };
    const manifest = K.canvasManifest([
      { file: 'Main.dc.html', w: 1440, h: 900 },
      { file: 'Rosters1440.dc.html', w: 1440, h: 900 },
      { file: 'Picker1440.dc.html', w: 1440, h: 900 },
      { file: 'Poster1440.dc.html', w: 1440, h: 900, is_interactive: false },
      { file: 'Rail1440.dc.html', w: 1440, h: 900 },
      { file: 'Specimen1440.dc.html', w: 1440, h: 900 },
    ]);
    assert.equal(manifest.artboards.find((a) => a.file === 'Poster1440.dc.html').is_interactive, false, 'the manifest keeps an explicit false');
    const index = K.designIndex({ manifest, title: 'T', sources: new Map(Object.entries(boards)) });
    const marked = Object.entries(index.boards).filter(([, b]) => b.is_interactive === true).map(([f]) => f).sort();
    assert.deepEqual(marked, ['Picker1440.dc.html', 'Rail1440.dc.html', 'Rosters1440.dc.html'], 'an x-import, a handler, a component made in the logic; not a comment, an explicit false or the empty DCLogic every board has');
    assert.match(boards['Specimen1440.dc.html'], /class Component extends DCLogic/);
    assert.equal('is_interactive' in index.boards['Poster1440.dc.html'], false);
    assert.equal('is_interactive' in index.boards['Main.dc.html'], false);
  });

  test('refuses an index with no title or no artboards', () => {
    const manifest = K.canvasManifest([{ file: 'Main.dc.html', w: 100, h: 100 }]);
    assert.throws(() => K.designIndex({ manifest, title: '' }), TypeError);
    assert.throws(() => K.designIndex({ manifest: { artboards: [] }, title: 'T' }), TypeError);
  });

  const live = () => ({
    v: 3,
    createdOnFiles: { v: 1, at: '2026-10-01T00:00:00.000Z' },
    title: 'Acme product canvas',
    launch: { view: 'canvas' },
    pages: [{ id: 'mine', name: 'Their page' }],
    boards: {
      'Main.dc.html': { x: 0, y: 0, w: 1440, h: 900, frameless: true, guides: [{ kind: 'grid', size: 8 }] },
      'TheirSketch.dc.html': { x: 4000, y: 0, w: 600, h: 400 },
      'Old.dc.html': { x: 2000, y: 0, w: 600, h: 400 },
    },
    order: ['TheirSketch.dc.html', 'Main.dc.html', 'Old.dc.html'],
    notes: { sticky1: { x: 10, y: -200, text: 'Ask about rosters', w: 240, fill: 'yellow' } },
    designSystems: [{ title: 'Acme', namespace: 'acme', artifact: 'https://claude.ai/artifact/Sys1', version: 'v7', copiedAt: '2026-10-01T00:00:00.000Z' }],
    editorOnly: { keep: true },
  });

  test('merging into the live index keeps the person\'s boards, notes, editor keys and installed systems', () => {
    const manifest = K.canvasManifest([
      { file: 'Main.dc.html', w: 1440, h: 1200, title: 'Contents' },
      { file: 'ConsoleRosters1440.dc.html', w: 1440, h: 900 },
    ], { annotations: [{ id: 'console', x: 0, y: -300, text: 'Ops console', kind: 'title1', maxW: 3000 }] });
    const index = K.designIndex({ manifest, title: 'A new name', base: live(), removed: ['Old.dc.html'] });
    assert.equal(index.title, 'Acme product canvas', 'the canvas keeps its own title');
    assert.deepEqual(index.createdOnFiles, live().createdOnFiles);
    assert.deepEqual(index.editorOnly, { keep: true }, 'a key Brandi never heard of survives');
    assert.deepEqual(index.boards['TheirSketch.dc.html'], { x: 4000, y: 0, w: 600, h: 400 });
    assert.equal(index.boards['Old.dc.html'], undefined, 'a board this folder stopped sending is dropped');
    assert.equal(index.boards['Main.dc.html'].frameless, true);
    assert.deepEqual(index.boards['Main.dc.html'].guides, [{ kind: 'grid', size: 8 }]);
    assert.equal(index.boards['Main.dc.html'].h, 1200, 'its own keys come from the manifest');
    assert.equal(index.boards['Main.dc.html'].title, 'Contents');
    assert.deepEqual(index.order, ['Main.dc.html', 'TheirSketch.dc.html', 'ConsoleRosters1440.dc.html']);
    assert.deepEqual(index.notes.sticky1, live().notes.sticky1);
    assert.deepEqual(index.notes.console, { x: 0, y: -300, text: 'Ops console', kind: 'title1', maxW: 3000 });
    assert.deepEqual(index.designSystems, live().designSystems);
    assert.deepEqual(index.pages, [{ id: 'mine', name: 'Their page' }]);
  });

  test('a board or title a person moved stays where they put it, shifted only by what the layout itself moved', () => {
    const at = (y, extra = {}) => K.canvasManifest([
      { file: 'Main.dc.html', w: 1440, h: 1200 },
      { file: 'Shape1440.dc.html', w: 1440, h: 1400 },
      { file: 'Icons1440.dc.html', w: 1440, h: 600 },
    ], { annotations: [{ id: 'icons', x: 0, y: y - 300, text: 'Icons', kind: 'title1', maxW: 3000 }], ...extra });
    // The last publish from this folder, as the canvas held it, then a person's moves, then the shape board grows.
    const before = at(0);
    const previous = K.designIndex({ manifest: before, title: 'T' });
    const live = structuredClone(previous);
    live.boards['Icons1440.dc.html'].x += 2000;
    live.notes.icons.x += 2000;
    const grown = structuredClone(before);
    grown.artboards[1].h += 806;
    for (const a of grown.artboards.slice(2)) a.y += 806;
    for (const n of grown.annotations) n.y += 806;
    const index = K.designIndex({ manifest: grown, title: 'T', base: live, previous });
    assert.equal(index.boards['Icons1440.dc.html'].x, live.boards['Icons1440.dc.html'].x, 'the person\'s move stays');
    assert.equal(index.boards['Icons1440.dc.html'].y, live.boards['Icons1440.dc.html'].y + 806, 'and the board still clears the one that grew');
    assert.equal(index.boards['Shape1440.dc.html'].h, before.artboards[1].h + 806, 'sizes come from the boards');
    assert.equal(index.notes.icons.x, live.notes.icons.x);
    assert.equal(index.notes.icons.y, live.notes.icons.y + 806);
    assert.equal(K.designIndex({ manifest: grown, title: 'T', base: live }).boards['Icons1440.dc.html'].x, grown.artboards[2].x, 'without the last publish, the layout wins, as before');
  });

  test('a key Brandi used to write and no longer does is cleared from its own board', () => {
    const base = live();
    base.boards['Main.dc.html'].page = 'mine';
    base.boards['Main.dc.html'].is_interactive = true;
    const index = K.designIndex({ manifest: K.canvasManifest([{ file: 'Main.dc.html', w: 1440, h: 900 }]), title: 'T', base });
    assert.equal('page' in index.boards['Main.dc.html'], false);
    assert.equal('is_interactive' in index.boards['Main.dc.html'], false);
  });

  test('an install replaces its own record, keeps the rest, and never writes the files list', () => {
    const now = new Date('2026-10-27T09:00:00Z');
    const manifest = K.canvasManifest([{ file: 'Main.dc.html', w: 100, h: 100 }], {
      designSystems: [
        { title: 'Acme', namespace: 'acme', artifact: 'https://claude.ai/artifact/Sys1', version: 'v8', files: ['tokens.json'] },
        { title: 'Declared only', namespace: 'draft' },
      ],
    });
    const base = live();
    base.designSystems.push({ title: 'Other', namespace: 'other', artifact: 'https://claude.ai/artifact/Sys2', version: null, copiedAt: 'x' });
    base.designSystems.push({ title: 'Acme again', namespace: 'acme', artifact: 'https://claude.ai/artifact/Sys1', version: 'v1', copiedAt: 'y' });
    const index = K.designIndex({ manifest, title: 'T', base, now });
    assert.deepEqual(index.designSystems, [
      { title: 'Acme', namespace: 'acme', artifact: 'https://claude.ai/artifact/Sys1', version: 'v8', copiedAt: '2026-10-27T09:00:00.000Z' },
      { title: 'Other', namespace: 'other', artifact: 'https://claude.ai/artifact/Sys2', version: null, copiedAt: 'x' },
    ]);
  });

  test('a namespace another system already holds is refused, not overwritten', () => {
    const manifest = K.canvasManifest([{ file: 'Main.dc.html', w: 100, h: 100 }], {
      designSystems: [{ title: 'Impostor', namespace: 'acme', artifact: 'https://claude.ai/artifact/SomethingElse' }],
    });
    assert.throws(() => K.designIndex({ manifest, title: 'T', base: live() }), /already held by another design system/);
  });
});

describe('brandi canvas: the folder a Design canvas is published from', async () => {
  const { mkdtemp, mkdir, writeFile, readFile, rm, truncate } = await import('node:fs/promises');
  const { existsSync } = await import('node:fs');
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const os = await import('node:os');
  const path = (await import('node:path')).default;
  const { fileURLToPath } = await import('node:url');
  const run = promisify(execFile);
  const BRANDI = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'brandi.mjs');

  const board = (name, img = '') => K.artboard({
    name,
    body: `<div style="width:600px;height:400px;background:#FFFFFF;padding:24px;display:flex;flex-direction:column;gap:12px">${img ? `<img src="${img}" alt="">` : ''}<p style="margin:0">${name}</p></div>`,
    preview: { width: 600, height: 400 },
  });
  const canvas = async (cwd, args) => {
    try {
      const { stdout } = await run(process.execPath, [BRANDI, 'canvas', ...args, '--json'], { cwd });
      return { code: 0, out: JSON.parse(stdout) };
    } catch (e) {
      return { code: e.code, out: `${e.stdout}${e.stderr}` };
    }
  };
  const fresh = async (boards) => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-canvas-cmd-'));
    await mkdir(path.join(dir, 'brand', 'canvas'), { recursive: true });
    for (const [file, source] of Object.entries(boards)) await writeFile(path.join(dir, 'brand', 'canvas', file), source);
    return dir;
  };

  test('writes the index, the artboards and their images under brand/.publish, and prints the calls', async () => {
    const dir = await fresh({ 'Main.dc.html': board('Main', 'hero.png'), 'Other.dc.html': board('Other') });
    await writeFile(path.join(dir, 'brand', 'canvas', 'hero.png'), Buffer.alloc(64));
    const { code, out } = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme brand']);
    assert.equal(code, 0, String(out));
    const project = path.join(dir, 'brand', '.publish', 'acme-brand', 'project');
    const index = JSON.parse(await readFile(path.join(project, 'canvas.json'), 'utf8'));
    assert.equal(index.v, 3);
    assert.deepEqual(index.order, ['Main.dc.html', 'Other.dc.html']);
    assert.ok(existsSync(path.join(project, 'hero.png')));
    assert.match(await readFile(path.join(project, 'Main.dc.html'), 'utf8'), /type="text\/x-dc" data-dc-script/);
    assert.equal(out.calls.length, 1);
    // Compared by suffix: macOS reports the temporary directory through /private.
    assert.ok(out.calls[0].file_path.endsWith(path.join('brand', '.publish', 'acme-brand', 'project', 'canvas.json')));
    assert.deepEqual(Object.keys(out.calls[0].files).sort(), ['project/Main.dc.html', 'project/Other.dc.html', 'project/hero.png']);
    await rm(dir, { recursive: true, force: true });
  });

  test('an artboard gone since the last run is sent as null, and the creation record survives', async () => {
    const dir = await fresh({ 'Main.dc.html': board('Main'), 'Other.dc.html': board('Other') });
    const first = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme']);
    const created = JSON.parse(await readFile(path.join(dir, 'brand', '.publish', 'acme', 'project', 'canvas.json'), 'utf8')).createdOnFiles;
    await rm(path.join(dir, 'brand', 'canvas', 'Other.dc.html'));
    const second = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme']);
    assert.equal(first.code, 0);
    assert.equal(second.code, 0, String(second.out));
    assert.deepEqual(second.out.removed, ['Other.dc.html']);
    assert.equal(second.out.calls.at(-1).files['project/Other.dc.html'], null);
    const again = JSON.parse(await readFile(path.join(dir, 'brand', '.publish', 'acme', 'project', 'canvas.json'), 'utf8'));
    assert.deepEqual(again.createdOnFiles, created);
    await rm(dir, { recursive: true, force: true });
  });

  test('refuses an image over 15MB, before writing anything, and says how to shrink it', async () => {
    const dir = await fresh({ 'Main.dc.html': board('Main', 'scene.png') });
    const big = path.join(dir, 'brand', 'canvas', 'scene.png');
    await writeFile(big, '');
    await truncate(big, 16 * 1024 * 1024);
    const { code, out } = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme']);
    assert.notEqual(code, 0);
    assert.match(out, /Too large for the canvas/);
    assert.match(out, /scene\.png/);
    assert.equal(existsSync(path.join(dir, 'brand', '.publish')), false);
    await rm(dir, { recursive: true, force: true });
  });

  test('splits a heavy canvas into calls under the limit, index and Main first', async () => {
    const dir = await fresh({ 'Main.dc.html': board('Main', 'a.png'), 'Other.dc.html': board('Other', 'b.png') });
    for (const f of ['a.png', 'b.png']) {
      const p = path.join(dir, 'brand', 'canvas', f);
      await writeFile(p, '');
      await truncate(p, 8 * 1024 * 1024);
    }
    const { code, out } = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme']);
    assert.equal(code, 0, String(out));
    assert.equal(out.calls.length, 2);
    assert.match(out.calls[0].file_path, /canvas\.json$/);
    const first = Object.keys(out.calls[0].files);
    assert.ok(first.includes('project/Main.dc.html') && first.includes('project/a.png'), 'the entry and its image go first');
    // Every file goes exactly once, and the two 8MB images never share a call.
    const sentIn = out.calls.map((c) => [c.file_path.split('/project/')[1], ...Object.keys(c.files).map((k) => k.slice(8))].filter((f) => f !== 'canvas.json'));
    assert.deepEqual(sentIn.flat().sort(), ['Main.dc.html', 'Other.dc.html', 'a.png', 'b.png']);
    assert.ok(!sentIn.some((c) => c.includes('a.png') && c.includes('b.png')));
    await rm(dir, { recursive: true, force: true });
  });

  test('refuses an artboard that names an image the folder does not have', async () => {
    const dir = await fresh({ 'Main.dc.html': board('Main', './gone.jpg') });
    const { code, out } = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme']);
    assert.notEqual(code, 0);
    assert.match(out, /Main\.dc\.html names gone\.jpg/);
    await rm(dir, { recursive: true, force: true });
  });

  test('a fragment inside an inline SVG image, written %23 as a data URI writes #, is not a missing image', async () => {
    // A sample photo a component draws, carried as a prop the way a component board's logic carries it.
    const svg = "data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%3E%3Crect%20fill%3D'url(%23g)'%2F%3E%3C%2Fsvg%3E";
    const dir = await fresh({ 'Main.dc.html': board('Main').replace('<p style="margin:0">', `<p data-photo="${svg}" style="margin:0">`) });
    const { code, out } = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme']);
    assert.equal(code, 0, out);
    await rm(dir, { recursive: true, force: true });
  });

  test('refuses a file name the canvas cannot take', async () => {
    const dir = await fresh({ 'Main.dc.html': board('Main') });
    await writeFile(path.join(dir, 'brand', 'canvas', 'my photo.png'), Buffer.alloc(8));
    const { code, out } = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme']);
    assert.notEqual(code, 0);
    assert.match(out, /my photo\.png/);
    await rm(dir, { recursive: true, force: true });
  });

  const product = (name) => K.artboard({
    name, system: 'acme', title: name, lang: 'en',
    body: '<x-import component-from-global-scope="Acme.Root"><div style="width:600px;height:400px;display:flex;flex-direction:column;gap:12px"><p style="margin:0">Hi</p></div></x-import>',
    preview: { width: 600, height: 400 },
  });

  test('a product board publishes: its system files are not missing images, and the install rides with the index', async () => {
    const dir = await fresh({ 'Main.dc.html': product('Main') });
    const manifest = K.canvasManifest([{ file: 'Main.dc.html', w: 600, h: 400 }], {
      launch: { view: 'canvas' },
      designSystems: [{ title: 'Acme', namespace: 'acme', artifact: 'https://claude.ai/artifact/Sys1', version: 'v9', files: ['tokens.json', 'tokens.css', 'components/bundle.css', 'components/bundle.js'] }],
    });
    await writeFile(path.join(dir, 'brand', 'canvas', 'canvas.json'), JSON.stringify(manifest));
    const refused = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme product']);
    assert.notEqual(refused.code, 0, 'no tokens.css of its own to send');
    assert.match(String(refused.out.error ?? refused.out), /tokens\.css, which the Design System does not store/);
    await mkdir(path.join(dir, 'brand', 'canvas', 'ds', 'acme'), { recursive: true });
    await writeFile(path.join(dir, 'brand', 'canvas', 'ds', 'acme', 'tokens.css'), '@font-face { font-family: "Acme Sans"; src: url("fonts/acme.woff2"); }\n:root { --text: #222; }\n');
    const { code, out } = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme product']);
    assert.equal(code, 0, String(out));
    assert.deepEqual(out.calls[0].files['project/ds/acme/components/bundle.js'], { artifact: 'https://claude.ai/artifact/Sys1', path: 'project/components/bundle.js' });
    // The type never stores tokens.css, so the canvas folder's own copy goes, @font-face rules and all.
    assert.deepEqual(out.calls[0].files['project/ds/acme/tokens.css'], { from: 'project/ds/acme/tokens.css', contentType: 'text/css' });
    assert.match(await readFile(path.join(dir, 'brand', '.publish', 'acme-product', 'project', 'ds', 'acme', 'tokens.css'), 'utf8'), /@font-face/);
    assert.equal(Object.keys(out.calls[0].files).filter((k) => k.startsWith('project/ds/acme/')).length, 4);
    const index = JSON.parse(await readFile(path.join(dir, 'brand', '.publish', 'acme-product', 'project', 'canvas.json'), 'utf8'));
    assert.equal(index.designSystems.length, 1);
    assert.equal('files' in index.designSystems[0], false);
    await rm(dir, { recursive: true, force: true });
  });

  /** A product folder as `brandi product boards` and `bundle` leave it: product.json, the canvas, the system installed beside the boards. */
  const productFolder = async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'brandi-canvas-product-'));
    const canvasDir = path.join(dir, 'product', 'canvas');
    await mkdir(path.join(canvasDir, 'ds', 'acme', 'fonts'), { recursive: true });
    await writeFile(path.join(dir, 'product', 'product.json'), JSON.stringify({ name: 'Acme product system', namespace: 'acme' }));
    await writeFile(path.join(canvasDir, 'Main.dc.html'), product('Main'));
    await writeFile(path.join(canvasDir, 'canvas.json'), JSON.stringify(K.canvasManifest([{ file: 'Main.dc.html', w: 600, h: 400 }], { launch: { view: 'canvas' }, designSystems: [{ title: 'Acme product system', namespace: 'acme' }] })));
    await writeFile(path.join(canvasDir, 'ds', 'acme', 'tokens.css'), '@font-face { font-family: "Acme Sans"; src: url("fonts/AcmeSans.woff2"); }\n');
    await writeFile(path.join(canvasDir, 'ds', 'acme', 'tokens.json'), JSON.stringify({ type: { fonts: [{ family: 'Acme Sans', file: 'fonts/AcmeSans.woff2' }, { family: 'Acme Mono', file: 'fonts/AcmeMono.woff2' }] } }));
    await writeFile(path.join(canvasDir, 'ds', 'acme', 'fonts', 'AcmeSans.woff2'), Buffer.alloc(16));
    return dir;
  };

  test('a product canvas stages under product/.publish, and refuses to stage boards that load a system it does not install', async () => {
    const dir = await productFolder();
    const refused = await canvas(dir, ['--dir', 'product/canvas', '--title', 'Acme product canvas']);
    assert.notEqual(refused.code, 0);
    assert.match(String(refused.out), /load the design system from ds\/acme\/, and this publish installs no system there/);
    assert.match(String(refused.out), /--system <its url>/);
    assert.equal(existsSync(path.join(dir, 'product', '.publish')), false, 'nothing written');
    const { code, out } = await canvas(dir, ['--dir', 'product/canvas', '--title', 'Acme product canvas', '--system', 'https://claude.ai/artifact/Sys1', '--system-version', 'v7']);
    assert.equal(code, 0, String(out));
    assert.ok(out.root.endsWith(path.join('product', '.publish', 'acme-product-canvas')), out.root);
    assert.equal(existsSync(path.join(dir, 'brand')), false, 'nothing under brand/');
    await rm(dir, { recursive: true, force: true });
  });

  test("--system installs the brand's texture when tokens.css names one, so a board's .brand-texture finds its file", async () => {
    const dir = await productFolder();
    const ds = path.join(dir, 'product', 'canvas', 'ds', 'acme');
    const tokens = JSON.parse(await readFile(path.join(ds, 'tokens.json'), 'utf8'));
    await writeFile(path.join(ds, 'tokens.json'), JSON.stringify({ ...tokens, radius: { moves: [{ name: 'Paper grain', kind: 'texture', file: 'textures/grain.jpg', strength: 0.5 }] } }));
    await mkdir(path.join(ds, 'textures'));
    await writeFile(path.join(ds, 'textures', 'grain.jpg'), Buffer.alloc(16));
    const { code, out } = await canvas(dir, ['--dir', 'product/canvas', '--title', 'Acme product canvas', '--system', 'https://claude.ai/artifact/Sys1', '--system-version', 'v7']);
    assert.equal(code, 0, String(out));
    assert.deepEqual(out.calls[0].files['project/ds/acme/textures/grain.jpg'], { artifact: 'https://claude.ai/artifact/Sys1', path: 'project/textures/grain.jpg' });
    await rm(dir, { recursive: true, force: true });
  });

  test('--system fills the record and installs everything a board loads: tokens, the bundle and the fonts the system ships', async () => {
    const dir = await productFolder();
    const { code, out } = await canvas(dir, ['--dir', 'product/canvas', '--title', 'Acme product canvas', '--system', 'https://claude.ai/artifact/Sys1', '--system-version', 'v7']);
    assert.equal(code, 0, String(out));
    const files = out.calls[0].files;
    const from = (f) => ({ artifact: 'https://claude.ai/artifact/Sys1', path: `project/${f}` });
    assert.deepEqual(files['project/ds/acme/tokens.json'], from('tokens.json'));
    assert.deepEqual(files['project/ds/acme/tokens.css'], { from: 'project/ds/acme/tokens.css', contentType: 'text/css' });
    assert.deepEqual(files['project/ds/acme/components/bundle.css'], from('components/bundle.css'));
    assert.deepEqual(files['project/ds/acme/components/bundle.js'], from('components/bundle.js'));
    assert.deepEqual(files['project/ds/acme/fonts/AcmeSans.woff2'], from('fonts/AcmeSans.woff2'));
    assert.equal('project/ds/acme/fonts/AcmeMono.woff2' in files, false, 'a face with no file beside the boards is not in the system either');
    const index = JSON.parse(await readFile(path.join(out.root, 'project', 'canvas.json'), 'utf8'));
    assert.deepEqual(index.designSystems.map(({ copiedAt, ...r }) => r), [{ title: 'Acme product system', namespace: 'acme', artifact: 'https://claude.ai/artifact/Sys1', version: 'v7' }]);
    const local = JSON.parse(await readFile(path.join(dir, 'product', 'canvas', 'canvas.json'), 'utf8'));
    assert.equal(local.designSystems[0].artifact, undefined, 'the canvas folder\'s own canvas.json is left as it was');
    const bad = await canvas(dir, ['--dir', 'product/canvas', '--title', 'Acme product canvas', '--system', 'https://example.com/ds']);
    assert.notEqual(bad.code, 0);
    assert.match(String(bad.out), /artifact must be the system's address cut after its id/);
    await rm(dir, { recursive: true, force: true });
  });

  test('a republish to a canvas whose live index records the system needs no --system', async () => {
    const dir = await productFolder();
    const livePath = path.join(dir, 'live.json');
    await writeFile(livePath, JSON.stringify({ v: 3, title: 'Acme product canvas', boards: {}, order: [], notes: {}, designSystems: [{ title: 'Acme product system', namespace: 'acme', artifact: 'https://claude.ai/artifact/Sys1', version: 'v7', copiedAt: 'z' }] }));
    const { code, out } = await canvas(dir, ['--dir', 'product/canvas', '--title', 'Acme product canvas', '--live', livePath]);
    assert.equal(code, 0, String(out));
    assert.equal(Object.keys(out.calls[0].files).some((k) => k.startsWith('project/ds/')), false, 'nothing installed again');
    await rm(dir, { recursive: true, force: true });
  });

  test('with --live, a republish keeps what a person did on the canvas; without it, it says what it overwrote', async () => {
    const dir = await fresh({ 'Main.dc.html': product('Main') });
    const manifest = K.canvasManifest([{ file: 'Main.dc.html', w: 600, h: 400 }], { launch: { view: 'canvas' }, designSystems: [{ title: 'Acme', namespace: 'acme' }] });
    await writeFile(path.join(dir, 'brand', 'canvas', 'canvas.json'), JSON.stringify(manifest));
    await mkdir(path.join(dir, 'brand', 'canvas', 'ds', 'acme'), { recursive: true });
    await writeFile(path.join(dir, 'brand', 'canvas', 'ds', 'acme', 'tokens.css'), ':root { --text: #222; }\n');
    const system = ['--system', 'https://claude.ai/artifact/Sys1', '--system-version', 'v9'];
    const first = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme', ...system]);
    assert.equal(first.code, 0, String(first.out));
    const liveIndex = {
      v: 3, createdOnFiles: { v: 1, at: '2026-10-01T00:00:00.000Z' }, title: 'Acme', launch: { view: 'canvas' }, pages: [],
      boards: { 'Main.dc.html': { x: 0, y: 0, w: 600, h: 400 }, 'Theirs.dc.html': { x: 300, y: 100, w: 600, h: 400 } },
      order: ['Main.dc.html', 'Theirs.dc.html'], notes: { n1: { x: 0, y: -200, text: 'keep me', w: 200 } },
      designSystems: [{ title: 'Acme', namespace: 'acme', artifact: 'https://claude.ai/artifact/Sys1', version: 'v9', copiedAt: 'z' }],
    };
    const livePath = path.join(dir, 'live.json');
    await writeFile(livePath, JSON.stringify(liveIndex));
    const merged = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme', '--live', livePath]);
    assert.equal(merged.code, 0, String(merged.out));
    assert.equal(merged.out.merged, 'live');
    assert.deepEqual(merged.out.kept, ['Theirs.dc.html']);
    assert.equal(merged.out.overlaps.length, 1, 'a kept board sitting on one of ours is reported');
    const index = JSON.parse(await readFile(path.join(dir, 'brand', '.publish', 'acme', 'project', 'canvas.json'), 'utf8'));
    assert.deepEqual(index.notes.n1, liveIndex.notes.n1);
    assert.deepEqual(index.designSystems, liveIndex.designSystems);
    assert.equal(Object.keys(merged.out.calls[0].files).includes('project/Theirs.dc.html'), false, 'their board is never sent');
    const again = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme', ...system]);
    assert.equal(again.out.merged, 'last-publish');
    const bad = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme', '--live', path.join(dir, 'missing.json')]);
    assert.notEqual(bad.code, 0);
    await rm(dir, { recursive: true, force: true });
  });

  test('a republish with --live sends the index and only what changed since the last publish, unless --all', async () => {
    const dir = await fresh({ 'Main.dc.html': board('Main'), 'Second.dc.html': board('Second'), 'Third.dc.html': board('Third') });
    const first = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme']);
    assert.equal(first.code, 0, String(first.out));
    const livePath = path.join(dir, 'live.json');
    await writeFile(livePath, await readFile(path.join(dir, 'brand', '.publish', 'acme', 'project', 'canvas.json'), 'utf8'));
    const second = path.join(dir, 'brand', 'canvas', 'Second.dc.html');
    await writeFile(second, (await readFile(second, 'utf8')).replace('<p style="margin:0">', '<p style="margin:0" data-changed="1">'));
    const sentIn = (out) => out.calls.flatMap((c) => [path.basename(c.file_path), ...Object.keys(c.files).map((f) => f.replace(/^project\//, ''))]);
    const republish = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme', '--live', livePath]);
    assert.equal(republish.code, 0, String(republish.out));
    assert.deepEqual(sentIn(republish.out).sort(), ['Second.dc.html', 'canvas.json']);
    assert.deepEqual(republish.out.unchanged.sort(), ['Main.dc.html', 'Third.dc.html']);
    const all = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme', '--live', livePath, '--all']);
    assert.deepEqual(sentIn(all.out).sort(), ['Main.dc.html', 'Second.dc.html', 'Third.dc.html', 'canvas.json']);
    await rm(dir, { recursive: true, force: true });
  });
});
