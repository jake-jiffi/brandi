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
});

describe('validateArtboard: the silent failures', () => {
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

  test('refuses an index with no title or no artboards', () => {
    const manifest = K.canvasManifest([{ file: 'Main.dc.html', w: 100, h: 100 }]);
    assert.throws(() => K.designIndex({ manifest, title: '' }), TypeError);
    assert.throws(() => K.designIndex({ manifest: { artboards: [] }, title: 'T' }), TypeError);
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

  test('refuses a file name the canvas cannot take', async () => {
    const dir = await fresh({ 'Main.dc.html': board('Main') });
    await writeFile(path.join(dir, 'brand', 'canvas', 'my photo.png'), Buffer.alloc(8));
    const { code, out } = await canvas(dir, ['--dir', 'brand/canvas', '--title', 'Acme']);
    assert.notEqual(code, 0);
    assert.match(out, /my photo\.png/);
    await rm(dir, { recursive: true, force: true });
  });
});
