/**
 * Documentation that has drifted from the code is worse than none: it sends
 * someone confidently in the wrong direction. These tests hold the skill files,
 * the commands and the reference material against what the code actually does.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, mkdtemp, mkdir, symlink, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { SHAPE_STANCES, MOTION_STANCES, buildSystem } from '../scripts/system.mjs';
import { PHASES, PROVENANCE, systemInputFromBrand } from '../scripts/brandfile.mjs';
import { RATIOS } from '../scripts/type.mjs';
import { BANNED_FONTS, FRAMES } from '../scripts/canvas.mjs';
import { loadContract } from '../scripts/slop.mjs';
import { emitGuardianSkill } from '../scripts/guardian.mjs';
import { RASTER_SIZES, MASKABLE_SAFE_RATIO } from '../scripts/assets.mjs';

const ROOT = path.join(import.meta.dirname, '..');
const run = promisify(execFile);

let cliSource;
let logoSource;
let commands;
let skillFiles = {};
let commandFiles = {};
let references = {};
let contract;
let companion;
let scratch;

before(async () => {
  cliSource = await readFile(path.join(ROOT, 'scripts', 'brandi.mjs'), 'utf8');
  logoSource = await readFile(path.join(ROOT, 'scripts', 'logo.mjs'), 'utf8');
  const block = /const COMMANDS = \{([\s\S]*?)\};/.exec(cliSource)[1];
  commands = [...block.matchAll(/^\s*([a-z]+):/gm)].map((m) => m[1]);

  for (const name of ['brand-system', 'brand-guardian', 'logo-forge']) {
    skillFiles[name] = await readFile(path.join(ROOT, 'skills', name, 'SKILL.md'), 'utf8');
  }
  for (const f of await readdir(path.join(ROOT, 'commands'))) {
    commandFiles[f] = await readFile(path.join(ROOT, 'commands', f), 'utf8');
  }
  // The numbered files are the references a model loads. The contract beside
  // them is machine-read, so it is held to the code's tests, not to these.
  const refDir = path.join(ROOT, 'skills', 'brand-system', 'references');
  for (const f of (await readdir(refDir)).filter((f) => /^\d\d-.*\.md$/.test(f))) {
    references[f] = await readFile(path.join(refDir, f), 'utf8');
  }
  contract = await loadContract();

  // The companion skill is a document too, and the one most likely to be read
  // on a machine where nothing else from the plugin is loaded.
  scratch = await mkdtemp(path.join(tmpdir(), 'brandi-docs-'));
  const brand = JSON.parse(await readFile(path.join(ROOT, 'tests', 'fixtures', 'muddy-paws.json'), 'utf8'));
  const system = buildSystem(systemInputFromBrand(brand));
  const files = await emitGuardianSkill({ brand, system, dir: path.join(scratch, 'companion'), brandFile: 'brand/brand.json' });
  companion = await readFile(files.find((f) => f.endsWith('SKILL.md')), 'utf8');
});

after(async () => {
  await rm(scratch, { recursive: true, force: true });
});

const allDocs = () => [
  ...Object.values(skillFiles),
  ...Object.values(commandFiles),
  ...Object.values(references),
];

const level = (severity) => ({ p0: 'error', p1: 'warn' }[severity] ?? 'info');

describe('the commands the docs name all exist', () => {
  test('the CLI exposes the commands the harness depends on', () => {
    for (const needed of ['init', 'status', 'scan', 'set', 'evidence', 'decision', 'question', 'system', 'tokens', 'sheets', 'validate', 'canvas', 'book', 'guardian', 'check', 'complete']) {
      assert.ok(commands.includes(needed), `the CLI is missing ${needed}`);
    }
  });

  test('every `brandi <word>` in the docs is a real command', () => {
    const known = new Set([...commands, 'help']);
    for (const [where, text] of Object.entries({ ...skillFiles, ...commandFiles, ...references, companion })) {
      // Same line only: a line break means the next word is prose or shell,
      // not an argument. And skip the shell that resolves the binary itself.
      // `"$A" check` is how the commands and the companion skill write it.
      for (const m of text.matchAll(/(?:\bbrandi|\$A"?)[ \t]+([a-z][a-z-]*)/g)) {
        const word = m[1];
        const line = text.slice(text.lastIndexOf('\n', m.index) + 1, text.indexOf('\n', m.index));
        // Shell comments and the snippet that resolves the binary are not invocations.
        if (line.trim().startsWith('#') || /command -v|then A=|else A=/.test(line)) continue;
        // Prose like "brandi can" is not a command invocation.
        if (['can', 'is', 'was', 'does', 'will', 'and', 'to', 'for', 'the', 'command', 'cannot', 'brand', 'plugin', 'run', 'itself', 'just'].includes(word)) continue;
        assert.ok(known.has(word), `${where} names "brandi ${word}", which is not a command (line: ${line.trim()})`);
      }
    }
  });

  test('the CLI help text lists every command it implements', () => {
    const header = cliSource.slice(0, cliSource.indexOf(' */'));
    for (const c of commands) {
      assert.ok(header.includes(`brandi ${c}`), `the help text does not mention "${c}"`);
    }
  });

  test('`brandi --help` prints every command, not a fixed number of header lines', async () => {
    // The header was complete and the printer cut it at line 26, so the three
    // commands added after that never reached anyone who typed --help.
    const { stdout } = await run(process.execPath, [path.join(ROOT, 'scripts', 'brandi.mjs'), '--help']);
    for (const c of commands) {
      assert.ok(stdout.includes(`brandi ${c}`), `--help does not print "${c}"`);
    }
    assert.match(stdout, /brandi guardian \[--out <dir>\]/, 'guardian takes --out, and the help should say so');
    // The printer once dropped the comment opener and printed `/**` first.
    const firstLine = stdout.split('\n').find((l) => l.trim());
    assert.match(firstLine, /^The Brandi command line/, `--help starts with ${JSON.stringify(firstLine)}`);
    assert.match(stdout, /brandi book \[--pdf\] \[--print\]/, 'the print flag is documented');
    assert.match(stdout, /brandi sheets \[--out <dir>\]/, 'sheets runs bare, so --out is optional');
  });

  test('`brandi logo --help` prints the forge usage, not the main help', async () => {
    const { stdout } = await run(process.execPath, [path.join(ROOT, 'scripts', 'brandi.mjs'), 'logo', '--help']);
    assert.match(stdout, /^brandi logo: generate, measure and choose a mark/);
    assert.equal(/The Brandi command line/.test(stdout), false);
  });

  test('the `brandi logo` line and the forge usage name every subcommand', () => {
    const dispatcher = /switch \(command\) \{([\s\S]*?)\n    default:/.exec(logoSource)[1];
    const subcommands = [...dispatcher.matchAll(/case '([a-z]+)':/g)].map((m) => m[1]);
    assert.ok(subcommands.length >= 10, `only ${subcommands.length} logo subcommands found`);
    const line = /brandi logo <([^>]+)>/.exec(cliSource)[1].split('|');
    const usage = /const USAGE = `([\s\S]*?)`;/.exec(logoSource)[1];
    for (const sub of subcommands) {
      assert.ok(line.includes(sub), `\`brandi --help\` does not list logo ${sub}`);
      assert.match(usage, new RegExp(`^  ${sub}\\b`, 'm'), `\`brandi logo --help\` does not list ${sub}`);
    }
  });

  test('the forge usage names every flag the dispatcher accepts', () => {
    const dispatcher = /switch \(command\) \{([\s\S]*?)\n    default:/.exec(logoSource)[1];
    const flags = new Set([
      ...[...dispatcher.matchAll(/flags\.(?:get|has)\('([\w-]+)'\)/g)].map((m) => m[1]),
      ...[...dispatcher.matchAll(/intFlag\(flags, '([\w-]+)'/g)].map((m) => m[1]),
      // `plan` reads these through a loop, so the literal never appears.
      'name', 'category', 'oneLiner', 'audience',
    ]);
    const usage = /const USAGE = `([\s\S]*?)`;/.exec(logoSource)[1];
    for (const flag of flags) {
      assert.ok(usage.includes(`--${flag}`), `logo usage does not mention --${flag}`);
    }
    assert.ok(usage.includes('--json') && usage.includes('--root'), 'the two global flags belong in the usage too');
  });
});

describe('the values the docs name all exist', () => {
  test('every shape and motion stance named in the docs is real', () => {
    const shapes = Object.keys(SHAPE_STANCES);
    const motions = Object.keys(MOTION_STANCES);
    const text = allDocs().join('\n');
    // At least one of each must be named somewhere, or the docs are not
    // describing this system.
    assert.ok(shapes.some((s) => text.includes(s)));
    assert.ok(motions.some((m) => text.includes(m)));
  });

  test('the phases named in the skill are the phases the code runs, in order', () => {
    const skill = skillFiles['brand-system'];
    const named = PHASES.map((p) => p.name);
    let cursor = -1;
    for (const name of named) {
      const at = skill.indexOf(`### ${PHASES.findIndex((p) => p.name === name) + 1}. ${name}`);
      assert.ok(at > -1, `the skill has no section for the ${name} phase`);
      assert.ok(at > cursor, `${name} appears out of order in the skill`);
      cursor = at;
    }
  });

  test('every phase id the skill passes to `complete` is real', () => {
    const ids = new Set(PHASES.map((p) => p.id));
    for (const m of skillFiles['brand-system'].matchAll(/\$A complete ([a-z]+)/g)) {
      assert.ok(ids.has(m[1]), `the skill completes a phase called "${m[1]}", which does not exist`);
    }
  });

  test('every provenance tier the skill names is real', () => {
    const tiers = Object.keys(PROVENANCE);
    const text = skillFiles['brand-system'];
    const claimed = /Every statement is ([^.]+)\./.exec(text);
    assert.ok(claimed, 'the skill should state the provenance tiers up front');
    for (const tier of tiers) {
      assert.ok(claimed[1].includes(tier), `the skill does not mention the "${tier}" tier`);
    }
  });

  test('every type ratio named in a reference is real', () => {
    const known = new Set(Object.keys(RATIOS));
    for (const [where, text] of Object.entries(references)) {
      for (const m of text.matchAll(/\b(minor-second|major-second|minor-third|major-third|perfect-fourth|augmented-fourth|perfect-fifth|diminished-\w+|minor-sixth|major-sixth)\b/g)) {
        assert.ok(known.has(m[1]), `${where} names the ratio "${m[1]}", which the code does not have`);
      }
    }
  });
});

describe('the anti-slop rules agree with the code that enforces them', () => {
  test('every font the docs ban is banned in code, and the reverse', () => {
    const text = references['04-anti-slop.md'] + skillFiles['brand-system'];
    for (const font of BANNED_FONTS) {
      assert.ok(text.includes(font), `${font} is banned in code but never named in the docs`);
    }
  });

  test('the skill names the banned fonts it tells Claude to avoid', () => {
    const skill = skillFiles['brand-system'];
    for (const font of ['Inter', 'Roboto', 'Arial', 'Poppins', 'Montserrat']) {
      assert.ok(skill.includes(font), `the skill should name ${font} explicitly`);
    }
  });
});

describe('the canvas recipe agrees with the canvas code', () => {
  test('every frame size in the recipe matches the code', () => {
    const recipe = references['05-canvas-recipes.md'];
    const checks = [
      [FRAMES.phone, '390 x 844'],
      [FRAMES.slide, '1920 x 1080'],
      [FRAMES.a4, '794 x 1123'],
      [FRAMES.letter, '816 x 1056'],
      [FRAMES.a5, '559 x 794'],
      [FRAMES.socialSquare, '1080 x 1080'],
      [FRAMES.socialWide, '1200 x 630'],
    ];
    for (const [frame, written] of checks) {
      assert.equal(`${frame.w} x ${frame.h}`, written, 'the code and the recipe disagree');
      assert.ok(recipe.includes(written), `the recipe does not list ${written}`);
    }
  });

  test('the recipe states the support line exactly as the code emits it', () => {
    assert.ok(references['05-canvas-recipes.md'].includes('<script src="./support.js"></script>'));
  });

  test('the publish sequence lives in the skills, pinned to one contract version, and the recipe points at it', () => {
    const pinned = '0.1.31';
    assert.ok(skillFiles['brand-system'].includes(pinned));
    assert.ok(skillFiles['logo-forge'].includes(pinned));
    assert.ok(references['05-canvas-recipes.md'].includes('Publishing a canvas'));
    assert.equal(references['05-canvas-recipes.md'].includes(pinned), false, 'a second copy of the sequence drifts');
  });

  test('the recipe lists exactly the sheets the generator writes', async () => {
    const { specificationSheets } = await import('../scripts/artboards.mjs');
    const brand = JSON.parse(await readFile(path.join(ROOT, 'tests', 'fixtures', 'muddy-paws.json'), 'utf8'));
    const system = buildSystem(systemInputFromBrand(brand));
    const recipe = references['05-canvas-recipes.md'];
    for (const s of specificationSheets(system, { brand })) {
      const stem = s.file.replace('.dc.html', '');
      assert.ok(recipe.includes('`' + stem + '`'), `the recipe does not list the generated ${stem} sheet`);
    }
  });

  test('every frame the skill mandates is in the recipe at the same size', () => {
    const skill = skillFiles['brand-system'];
    const recipe = references['05-canvas-recipes.md'];
    let seen = 0;
    for (const m of skill.matchAll(/\| `(\w+)\.dc\.html` \| (\d+)x(\d+) \|/g)) {
      seen++;
      assert.ok(recipe.includes(`${m[2]} x ${m[3]}`), `the recipe has no ${m[2]} x ${m[3]} frame for ${m[1]}`);
    }
    assert.ok(seen >= 10, `only ${seen} mandated frames found in the skill`);
  });
});

describe('the Codex path', () => {
  const resolver = (text) => {
    const lines = text.split('\n');
    const start = lines.findIndex((l) => l.startsWith('A="$(command -v brandi'));
    assert.ok(start > -1, 'no resolver snippet');
    const out = [lines[start]];
    for (let i = start + 1; i < lines.length && lines[i].startsWith('[ -z "$A" ]'); i++) out.push(lines[i]);
    return out.join('\n');
  };
  const carriers = () => ({
    'brand-system': skillFiles['brand-system'],
    'brand-guardian': skillFiles['brand-guardian'],
    'logo-forge': skillFiles['logo-forge'],
    'brand-status.md': commandFiles['brand-status.md'],
    'brand-canvas.md': commandFiles['brand-canvas.md'],
    'brand-check.md': commandFiles['brand-check.md'],
    companion,
  });

  test('every resolver snippet reaches the Codex plugin cache as well as the Claude one', () => {
    for (const [where, text] of Object.entries(carriers())) {
      const snippet = resolver(text);
      assert.ok(snippet.includes('"$HOME"/.claude/plugins/cache/*/brandi/*/bin/brandi'), `${where} lost the Claude cache glob`);
      // Codex reads CODEX_HOME before ~/.codex, so a glob nailed to $HOME
      // misses every user who has moved it.
      assert.ok(
        snippet.includes('"${CODEX_HOME:-$HOME/.codex}"/plugins/cache/*/brandi/*/bin/brandi'),
        `${where} has no Codex cache glob, or one that ignores CODEX_HOME`,
      );
      assert.equal(/"\$HOME"\/\.codex/.test(snippet), false, `${where} still nails the Codex cache to $HOME`);
    }
  });

  test('every resolver snippet resolves the binary under a HOME with only the Codex cache, and under one with only the Claude cache', async () => {
    for (const [agent, cacheDir] of [['codex', '.codex'], ['claude', '.claude']]) {
      const home = path.join(scratch, `home-${agent}`);
      const bin = path.join(home, cacheDir, 'plugins', 'cache', 'brandi', 'brandi', '1.16.0', 'bin');
      await mkdir(bin, { recursive: true });
      await symlink(path.join(ROOT, 'bin', 'brandi'), path.join(bin, 'brandi'));
      for (const [where, text] of Object.entries(carriers())) {
        // PATH without the plugin bin, so `command -v brandi` fails as it does
        // in the session the plugin was installed in.
        const { stdout } = await run('sh', ['-c', `${resolver(text)}\nprintf %s "$A"`], { env: { HOME: home, PATH: '/usr/bin:/bin' } });
        assert.equal(stdout, path.join(bin, 'brandi'), `${where} resolved "${stdout}" under a ${agent}-only HOME`);
      }
    }
  });

  test('every resolver snippet follows CODEX_HOME when the cache is not under $HOME', async () => {
    // A user who sets CODEX_HOME elsewhere has no ~/.codex at all, so the old
    // glob fell through to the last resort and the skill reported the plugin
    // missing on a machine where it was installed.
    const home = path.join(scratch, 'home-empty');
    const codexHome = path.join(scratch, 'codex-elsewhere');
    const bin = path.join(codexHome, 'plugins', 'cache', 'brandi', 'brandi', '1.16.0', 'bin');
    await mkdir(home, { recursive: true });
    await mkdir(bin, { recursive: true });
    await symlink(path.join(ROOT, 'bin', 'brandi'), path.join(bin, 'brandi'));
    for (const [where, text] of Object.entries(carriers())) {
      const { stdout } = await run('sh', ['-c', `${resolver(text)}\nprintf %s "$A"`], {
        env: { HOME: home, CODEX_HOME: codexHome, PATH: '/usr/bin:/bin' },
      });
      assert.equal(stdout, path.join(bin, 'brandi'), `${where} ignored CODEX_HOME and resolved "${stdout}"`);
    }
  });

  test('every Claude-only tool the skills name has its fallback beside it', () => {
    const bs = skillFiles['brand-system'];
    const lf = skillFiles['logo-forge'];
    assert.match(bs, /If there is no `AskUserQuestion` tool,\s+ask the four questions in one plain message/);
    assert.match(bs, /Without the\s+`brand-critic` agent, run `\$A check` and the seven questions/);
    assert.match(bs, /preview\.mjs --dir brand\/canvas --out <dir>/);
    assert.match(lf, /preview\.mjs --dir brand\/logo\/canvas --out <dir>/);
    assert.match(lf, /Without a subagent tool, draw the slots yourself one at a time/);
    assert.match(lf, /isolation was procedural/);
    assert.match(skillFiles['brand-guardian'], /\$brand-system/);
    assert.equal(/\$LOGO|logo\.mjs/.test(lf), false, 'the forge goes through `"$A" logo`, not a derived script path');
    assert.match(lf, /`<brandi>`, it means the plugin root/);
  });
});

describe('the references agree with the code they describe', () => {
  test('the evidence tiers carry the weights brandfile.mjs carries', () => {
    const doc = references['01-evidence-protocol.md'];
    for (const [key, tier] of Object.entries(PROVENANCE)) {
      const row = new RegExp(`\\*\\*${tier.label.toUpperCase()}\\*\\*[^\\n]*\\*\\*${tier.weight.toFixed(1)}\\*\\*`);
      assert.match(doc, row, `01 does not give ${key} the weight ${tier.weight}`);
    }
    assert.equal(/_provenance|_confidence|\bDL-\d|\bOQ-\d/.test(doc), false, '01 names structures the CLI never writes');
    assert.equal(/use `color`, not `colour`/.test(doc + references['06-brand-book-outline.md']), false);
  });

  test('the banned and default font lists in 04 are the contract lists, and nothing else lists a face the contract does not', () => {
    const doc = references['04-anti-slop.md'];
    const pick = (label) => {
      const m = new RegExp(`reported as ${label}: \\*\\*([^*]+)\\*\\*`).exec(doc);
      assert.ok(m, `04 has no "reported as ${label}" list`);
      return m[1].split(',').map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean).sort();
    };
    assert.deepEqual(pick('an error'), [...contract.banned_fonts.literals].sort());
    assert.deepEqual(pick('a warning'), [...contract.banned_fonts.soft_literals].sort());

    const known = new Set([...contract.banned_fonts.literals, ...contract.banned_fonts.soft_literals]);
    // Names that were on a prose list at some point and never in the contract.
    const drifted = ['Helvetica Neue', 'Raleway', 'Helvetica'];
    for (const [where, text] of Object.entries({ '05': references['05-canvas-recipes.md'], '10': references['10-implementation.md'], guardian: skillFiles['brand-guardian'], companion })) {
      for (const line of text.split('\n').filter((l) => /bann/i.test(l))) {
        for (const name of [...known, ...drifted]) {
          if (line.includes(name)) assert.ok(known.has(name), `${where} bans "${name}", which the contract does not: ${line.trim()}`);
        }
      }
    }
  });

  test('the guardian table gives every finding the level the code emits', async () => {
    const guardianSource = await readFile(path.join(ROOT, 'scripts', 'guardian.mjs'), 'utf8');
    const native = (rule) => {
      const block = new RegExp(`level: '\\w+',[^}]*?rule: '${rule}'`).exec(guardianSource);
      assert.ok(block, `guardian.mjs no longer emits ${rule}`);
      return /level: '(\w+)'/.exec(block[0])[1];
    };
    assert.match(guardianSource, /level: isDoc \? 'warn' : 'error',\s*file: rel, line: lineOf\(m\.index\), rule: 'off-palette'/);
    const expected = {
      'Off-palette colour': 'error',
      'Nearly-palette colour': native('near-palette'),
      'Off-brand typeface': native('off-brand-type'),
      'Banned typeface': level(contract.banned_fonts.severity),
      'Banned vocabulary': native('banned-vocabulary'),
      'Focus outline removed': level(contract.css_patterns.focus_outline_removed.severity),
      'Lorem ipsum': level(contract.banned_copy.filler.severity),
      'Purple or indigo gradient': level(contract.css_patterns.gradient_of_banned_hue.severity),
      'Gradient orb': level(contract.css_patterns.blur_orb.severity),
      'Card with a left accent stripe': level(contract.css_patterns.left_accent_card.severity),
      'Animation with no reduced-motion handling': level(contract.css_patterns.animation_without_reduced_motion.severity),
    };
    const table = skillFiles['brand-guardian'];
    for (const [finding, want] of Object.entries(expected)) {
      const row = new RegExp(`^\\| ${finding} \\| (\\w+) \\|`, 'm').exec(table);
      assert.ok(row, `the guardian table has no row for "${finding}"`);
      assert.equal(row[1], want, `"${finding}" is ${want} in code and ${row[1]} in the guardian table`);
    }
    assert.equal(/\| \*\*Banned typeface\*\* \|/.test(references['10-implementation.md']), false, '10 carries a second copy of the table');
  });

  test('the favicon pack in 08 is the pack assets.mjs writes', () => {
    const doc = references['08-logo-system.md'];
    for (const s of RASTER_SIZES) assert.ok(doc.includes(`${s.name}.png`), `08 does not list ${s.name}.png`);
    for (const f of ['avatar-400-reversed.png', 'favicon.ico', 'site.webmanifest', 'svg/primary.svg', 'svg/black.svg', 'svg/white.svg', 'svg/brand.svg', 'svg/on-brand.svg', '"purpose": "any maskable"', `${MASKABLE_SAFE_RATIO * 100}%`]) {
      assert.ok(doc.includes(f), `08 does not mention ${f}`);
    }
    for (const ghost of ['og.png', 'icon-maskable-512.png', 'manifest.webmanifest', 'icon.svg`']) {
      assert.equal(doc.includes(ghost), false, `08 names ${ghost}, which the pack never writes`);
    }
    assert.equal(/Brandi does not draw logos|never generate a logo/i.test(doc), false);
  });

  test('06 describes the deck the generator writes', async () => {
    const deck = await readFile(path.join(ROOT, 'scripts', 'branddeck.mjs'), 'utf8');
    const chapters = [...(/const CHAPTERS = \[([\s\S]*?)\];/.exec(deck)[1]).matchAll(/title: '([^']+)'/g)].map((m) => m[1]);
    assert.ok(chapters.length >= 6);
    const doc = references['06-brand-book-outline.md'];
    for (const title of chapters) assert.ok(doc.includes(`### ${title}`), `06 has no section for the "${title}" chapter`);
    assert.ok(doc.includes('--print') && doc.includes('--pdf'));
    assert.equal(/Twenty-three sections|§\d+ ·|All 23 headings/.test(doc), false, 'the 23-section book was never generated');
  });

  test('every brand-file path the references name resolves against the schema', async () => {
    // A reference that names a field the schema does not have sends somebody to
    // run a `set` the tool refuses. That is how `identity.mockups[].surfaces[]`
    // came to be documented with an `artwork` the schema had never carried.
    const schema = JSON.parse(await readFile(path.join(ROOT, 'schemas', 'brand.schema.json'), 'utf8'));
    const isArray = (n) => n.type === 'array' || (Array.isArray(n.type) && n.type.includes('array'));
    const resolves = (dotted) => {
      let node = schema;
      for (const raw of dotted.split('.')) {
        const seg = raw.replace(/\[\]$/, '');
        const wantsArray = raw.endsWith('[]');
        const index = /^\d+$/.test(seg);
        // A numeric segment, or a step through an array, lands on its items.
        if (isArray(node)) {
          if (!node.items) return false;
          node = node.items;
          if (index) continue;
        } else if (index) {
          return false;
        }
        const props = node.properties ?? {};
        if (!Object.prototype.hasOwnProperty.call(props, seg)) return false;
        node = props[seg];
        if (wantsArray && !isArray(node)) return false;
      }
      return true;
    };

    // The resolver has to be able to say no, or this test passes on anything.
    for (const bad of [
      'voice.nonsense', 'strategy.purpose.nope', 'identity.logo.filez', 'voice.statement[]',
      'governance.antiPatterns.deeper', 'identity.mockups.0.surfaces.0.nope', 'voice.attributes[].nope',
    ]) {
      assert.equal(resolves(bad), false, `the resolver accepted ${bad}, so it would accept anything`);
    }

    const roots = Object.keys(schema.properties);
    const unresolved = new Set();
    let checked = 0;
    for (const [where, text] of Object.entries(references)) {
      for (const m of text.matchAll(/`([a-z][A-Za-z0-9]*(?:\[\])?(?:\.[A-Za-z0-9]+(?:\[\])?)+)`/g)) {
        if (!roots.includes(m[1].split('.')[0].replace(/\[\]$/, ''))) continue;
        checked++;
        if (!resolves(m[1])) unresolved.add(`${where}: ${m[1]}`);
      }
    }
    assert.ok(checked >= 60, `only ${checked} brand-file paths found in the references`);
    assert.deepEqual([...unresolved], [], 'these reference paths are not in brand.schema.json');
  });

  test('the references describe the fields this round added, not the behaviour they replaced', () => {
    // voice.statement, per-trait examples and governance.antiPatterns changed
    // what the deck prints. A reference still describing the old behaviour is
    // worse than one that says nothing.
    const outline = references['06-brand-book-outline.md'];
    const voice = references['07-voice-framework.md'];
    assert.match(outline, /`voice\.statement`/, '06 does not mention the tone statement');
    assert.match(outline, /`governance\.antiPatterns\[\]`/, '06 still calls the anti-patterns fixed in the deck');
    assert.match(outline, /`identity\.mockups\[\]\.surfaces\[\]\.artwork`/, '06 does not say what a mockup composites');
    assert.match(voice, /`voice\.statement`/, '07 does not mention the tone statement');
    assert.match(voice, /`examples\[\]`/, '07 does not say where a trait’s example lines go');
    // The behaviour these replaced, described as current, is the defect.
    assert.equal(
      /`voice\.examples\[\]` for the example lines/.test(outline), false,
      '06 still says trait examples come from voice.examples',
    );
    assert.equal(
      /the house anti-patterns, fixed in the deck/.test(outline), false,
      '06 still says the anti-patterns cannot come from the brand',
    );
  });

  test('11 states the lockup gap in the unit logogen.mjs uses, and invents no length gate', () => {
    const doc = references['11-logo-craft.md'];
    assert.equal(/gap[^\n|]*x-height|x-?height\b[^\n|]*gap/i.test(doc), false, 'the gap is a multiple of cap height');
    assert.match(doc, /gap = k × capHeight/);
    assert.equal(/hard fail/.test(doc), false);
    assert.equal(doc.includes('fill="#000000"'), false, 'concepts are drawn in #111111, as the forge tells every agent');
  });
});

describe('house style', () => {
  test('nothing carries an em dash', () => {
    for (const [where, text] of Object.entries({ ...skillFiles, ...commandFiles, ...references })) {
      assert.equal(text.includes('—'), false, `${where} contains an em dash`);
    }
  });

  test('every skill and command has usable frontmatter', () => {
    for (const [where, text] of Object.entries({ ...skillFiles, ...commandFiles })) {
      const fm = /^---\n([\s\S]*?)\n---/.exec(text);
      assert.ok(fm, `${where} has no frontmatter`);
      if (where.endsWith('.md') && commandFiles[where]) {
        assert.match(fm[1], /description:/, `${where} needs a description`);
      } else {
        assert.match(fm[1], /^name: [a-z][a-z0-9-]*$/m, `${where} needs a name`);
        assert.match(fm[1], /description:/, `${where} needs a description`);
        const desc = /description: (.*)/.exec(fm[1])[1];
        assert.ok(desc.length > 120, `${where}'s description is too thin to trigger reliably`);
      }
    }
  });

  test('every reference the skill lists actually exists', async () => {
    const listed = [...skillFiles['brand-system'].matchAll(/references\/([\w-]+\.md)/g)].map((m) => m[1]);
    assert.ok(listed.length >= 10, `the skill only points at ${listed.length} references`);
    for (const f of new Set(listed)) {
      assert.ok(references[f], `the skill points at references/${f}, which does not exist`);
    }
  });

  test('every reference on disk is pointed at by the skill', () => {
    const listed = new Set([...skillFiles['brand-system'].matchAll(/references\/([\w-]+\.md)/g)].map((m) => m[1]));
    for (const f of Object.keys(references)) {
      assert.ok(listed.has(f), `references/${f} exists but nothing points at it`);
    }
  });

  test('no reference is a stub', () => {
    for (const [where, text] of Object.entries(references)) {
      assert.ok(text.split('\n').length > 80, `${where} is only ${text.split('\n').length} lines`);
      // A rule that says "no unresolved {{TODO}}" is not itself a stub, so
      // only unquoted, un-code-fenced occurrences count.
      const prose = text.replace(/`[^`]*`/g, '').replace(/```[\s\S]*?```/g, '');
      assert.equal(/\bTODO\b|\bTBD\b|coming soon/i.test(prose), false, `${where} contains a placeholder`);
    }
  });
});

/**
 * The README has now claimed the wrong numbers twice: a test count left behind
 * by a round of new tests, and a page count left behind by four new chapters.
 * Both are cheap to check and nobody checks them by hand, so they are asserted
 * here the way the font lists are.
 */
describe('the README states numbers that are true', () => {
  // There is no way to run the suite from inside the suite, so the total is
  // written down once and held against the README. On its own that catches
  // nothing: both numbers would sit here being wrong together, which is how the
  // README came to claim 1667 while the suite reported 1669.
  //
  // STATIC_TEST_CALLS is what makes it bite. Almost every added test is a new
  // `test(` call site, so adding one trips this and forces whoever added it to
  // re-run the suite and refresh all three numbers. A test added inside an
  // existing loop is the one case that slips through.
  const SUITE_TESTS = 1738;
  const STATIC_TEST_CALLS = 1444;
  // `brandi book` on tests/fixtures/muddy-paws.json, which is the brand the
  // README calls the worked example.
  const WORKED_EXAMPLE_PAGES = 53;
  let readme;

  before(async () => {
    readme = await readFile(path.join(ROOT, '..', 'README.md'), 'utf8');
  });

  test('the test count in the README is the count this suite reports', () => {
    const m = /^(\d[\d,]*) tests\./m.exec(readme);
    assert.ok(m, 'the README no longer states a test count');
    assert.equal(
      Number(m[1].replace(/,/g, '')), SUITE_TESTS,
      'the README and SUITE_TESTS disagree. Run `node --test "tests/*.test.mjs"`, put the reported '
      + 'total in both, and remember this test is one of them.',
    );
  });

  test('the suite has not changed size since those numbers were taken', async () => {
    const dir = path.join(ROOT, 'tests');
    let calls = 0;
    for (const f of (await readdir(dir)).filter((f) => f.endsWith('.test.mjs')).sort()) {
      calls += ((await readFile(path.join(dir, f), 'utf8')).match(/^\s*(?:await\s+)?test\(/gm) ?? []).length;
    }
    assert.equal(
      calls, STATIC_TEST_CALLS,
      'the suite gained or lost tests. Run `node --test "tests/*.test.mjs"`, then update three '
      + 'numbers: SUITE_TESTS and STATIC_TEST_CALLS here, and the "N tests." sentence in the README.',
    );
  });

  test('the deck page count in the README is the deck the fixture builds', () => {
    const m = /(\d+) pages for the worked example/.exec(readme);
    assert.ok(m, 'the README no longer states a page count for the worked example');
    assert.equal(Number(m[1]), WORKED_EXAMPLE_PAGES);
  });

  test('the README admits Codex without promising it the canvas', () => {
    // It said "You need Claude Code" three paragraphs above the Codex install
    // instructions, and claimed nothing about what Codex does not get.
    const install = readme.slice(readme.indexOf('## Install'), readme.indexOf('### Checking it worked'));
    assert.match(install, /Codex/, 'the install section never mentions Codex');
    assert.equal(
      /You need \[Claude Code\]\([^)]*\)\. /.test(install), false,
      'the opening still requires Claude Code in a README that documents the Codex install',
    );
    assert.match(install, /Codex gets the skills/);
    assert.match(install, /canvas/, 'the README must say what Codex does not get');
  });

  test('nothing in the README carries an em dash', () => {
    assert.equal(readme.includes('—'), false);
  });
});
