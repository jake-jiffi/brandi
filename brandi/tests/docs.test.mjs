/**
 * Documentation that has drifted from the code is worse than none: it sends
 * someone confidently in the wrong direction. These tests hold the skill files,
 * the commands and the reference material against what the code actually does.
 */
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { SHAPE_STANCES, MOTION_STANCES } from '../scripts/system.mjs';
import { PHASES, PROVENANCE } from '../scripts/brandfile.mjs';
import { RATIOS } from '../scripts/type.mjs';
import { BANNED_FONTS, FRAMES } from '../scripts/canvas.mjs';

const ROOT = path.join(import.meta.dirname, '..');

let cliSource;
let commands;
let skillFiles = {};
let commandFiles = {};
let references = {};

before(async () => {
  cliSource = await readFile(path.join(ROOT, 'scripts', 'brandi.mjs'), 'utf8');
  const block = /const COMMANDS = \{([\s\S]*?)\};/.exec(cliSource)[1];
  commands = [...block.matchAll(/^\s*([a-z]+):/gm)].map((m) => m[1]);

  for (const name of ['brand-system', 'brand-guardian']) {
    skillFiles[name] = await readFile(path.join(ROOT, 'skills', name, 'SKILL.md'), 'utf8');
  }
  for (const f of await readdir(path.join(ROOT, 'commands'))) {
    commandFiles[f] = await readFile(path.join(ROOT, 'commands', f), 'utf8');
  }
  const refDir = path.join(ROOT, 'skills', 'brand-system', 'references');
  for (const f of await readdir(refDir)) {
    references[f] = await readFile(path.join(refDir, f), 'utf8');
  }
});

const allDocs = () => [
  ...Object.values(skillFiles),
  ...Object.values(commandFiles),
  ...Object.values(references),
];

describe('the commands the docs name all exist', () => {
  test('the CLI exposes the commands the harness depends on', () => {
    for (const needed of ['init', 'status', 'scan', 'set', 'evidence', 'decision', 'question', 'system', 'tokens', 'sheets', 'validate', 'canvas', 'book', 'guardian', 'check', 'complete']) {
      assert.ok(commands.includes(needed), `the CLI is missing ${needed}`);
    }
  });

  test('every `brandi <word>` in the docs is a real command', () => {
    const known = new Set([...commands, 'help']);
    for (const [where, text] of Object.entries({ ...skillFiles, ...commandFiles, ...references })) {
      // Same line only: a line break means the next word is prose or shell,
      // not an argument. And skip the shell that resolves the binary itself.
      for (const m of text.matchAll(/(?:\bbrandi|\$A)[ \t]+([a-z][a-z-]*)/g)) {
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

  test('the recipe and the skill agree on the artifact contract version', () => {
    const pinned = '0.1.31';
    assert.ok(references['05-canvas-recipes.md'].includes(pinned));
    assert.ok(skillFiles['brand-system'].includes(pinned));
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
