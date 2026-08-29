import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, mkdir, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import * as G from '../scripts/guardian.mjs';
import { buildSystem } from '../scripts/system.mjs';
import { systemInputFromBrand } from '../scripts/brandfile.mjs';

const FIXTURE = path.join(import.meta.dirname, 'fixtures', 'muddy-paws.json');

let brand;
let system;
let dir;

before(async () => {
  brand = JSON.parse(await readFile(FIXTURE, 'utf8'));
  system = buildSystem(systemInputFromBrand(brand));
  dir = await mkdtemp(path.join(tmpdir(), 'brandi-guardian-'));
});

after(async () => {
  await rm(dir, { recursive: true, force: true });
});

const write = async (name, content) => {
  const full = path.join(dir, name);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, content);
  return full;
};

const check = (targets) => G.checkFiles({ brand, system, targets, root: dir });

describe('paletteOf', () => {
  test('covers every step of every family in both themes', () => {
    const p = G.paletteOf(system);
    for (const family of Object.keys({ ...system.palettes, ...system.status })) {
      for (const mode of ['light', 'dark']) {
        for (const s of system.palettes[family]?.[mode].steps ?? system.status[family][mode].steps) {
          assert.ok(p.has(s.hex.toUpperCase()), `${family}.${s.step} ${mode} missing`);
        }
      }
    }
  });

  test('includes plain black and white, which are always allowed', () => {
    const p = G.paletteOf(system);
    assert.ok(p.has('#FFFFFF') && p.has('#000000'));
  });
});

describe('colour checking', () => {
  test('accepts a colour that is on the palette', async () => {
    await write('good.css', `.a { color: ${system.palettes.brand.light.steps[8].hex}; }`);
    const r = await check(['good.css']);
    assert.deepEqual(r.findings.filter((f) => f.rule?.includes('palette')), []);
  });

  test('flags a colour that is nowhere near the palette as an error', async () => {
    await write('bad.css', '.a { color: #FF00FF; }');
    const r = await check(['bad.css']);
    const f = r.findings.find((x) => x.rule === 'off-palette');
    assert.ok(f, 'magenta is not in a green brand');
    assert.equal(f.level, 'error');
    assert.match(f.message, /nearest is/);
  });

  test('flags a colour that is ALMOST right as a warning, because that is drift', async () => {
    const real = system.palettes.brand.light.steps[8].hex;
    const drifted = `#${(parseInt(real.slice(1), 16) + 0x010101).toString(16).padStart(6, '0').toUpperCase()}`;
    await write('drift.css', `.a { color: ${drifted}; }`);
    const r = await check(['drift.css']);
    const f = r.findings.find((x) => x.rule === 'near-palette');
    assert.ok(f, `${drifted} should read as drift from ${real}`);
    assert.equal(f.level, 'warn');
  });

  test('expands three-digit hex before judging it', async () => {
    await write('short.css', '.a { color: #FFF; }');
    const r = await check(['short.css']);
    assert.deepEqual(r.findings.filter((f) => f.rule?.includes('palette')), [], 'white is allowed');
  });

  test('reports each distinct colour once, not once per use', async () => {
    await write('repeat.css', '.a{color:#FF00FF}.b{color:#FF00FF}.c{color:#FF00FF}');
    const r = await check(['repeat.css']);
    assert.equal(r.findings.filter((f) => f.rule === 'off-palette').length, 1);
  });

  test('reports a line number that points at the problem', async () => {
    await write('lines.css', '/* one */\n/* two */\n.a { color: #FF00FF; }\n');
    const r = await check(['lines.css']);
    assert.equal(r.findings.find((f) => f.rule === 'off-palette').line, 3);
  });
});

describe('typeface checking', () => {
  test('accepts the brand faces', async () => {
    await write('type-ok.css', `body { font-family: '${system.type.fonts.body}', system-ui, sans-serif; }`);
    const r = await check(['type-ok.css']);
    assert.deepEqual(r.findings.filter((f) => f.rule === 'off-brand-type'), []);
  });

  test('a slop face is the contract\'s to judge, a merely-wrong face is this loop\'s', async () => {
    // One problem, one finding. These used to be two: the contract reported a
    // waivable `banned-font` and this loop reported an unwaivable
    // `off-brand-type` with the same message, so a correct, reasoned waiver
    // silenced one and the run still failed on the other.
    await write('type-banned.css', 'body { font-family: Inter, sans-serif; }');
    await write('type-other.css', 'body { font-family: "Cormorant Garamond", serif; }');

    const banned = (await check(['type-banned.css'])).findings;
    assert.deepEqual(banned.filter((f) => f.rule === 'off-brand-type'), [],
      'the contract already spoke about this face');
    assert.equal(banned.find((f) => f.rule === 'banned-font').level, 'error');

    const other = (await check(['type-other.css'])).findings;
    assert.deepEqual(other.filter((f) => f.rule === 'banned-font'), [],
      'a real face is not slop, it is just not this brand');
    assert.equal(other.find((f) => f.rule === 'off-brand-type').level, 'warn');
  });

  test('a reasoned waiver silences the face entirely, from every code path', async () => {
    await write('waived.css', 'body { font-family: Inter, sans-serif; } /* anti-slop-waiver: their corporate licence */');
    const r = await check(['waived.css']);
    assert.deepEqual(r.findings, [], JSON.stringify(r.findings));
    assert.equal(r.ok, true, 'a waiver that does not clear the run is not a waiver');
  });

  test('ignores generic families and custom properties', async () => {
    await write('type-generic.css', 'a { font-family: var(--font-body); } b { font-family: system-ui; } i { font-family: inherit; }');
    const r = await check(['type-generic.css']);
    assert.deepEqual(r.findings.filter((f) => f.rule === 'off-brand-type'), []);
  });
});

describe('vocabulary checking', () => {
  test('flags a word the voice guide bans', async () => {
    await write('copy.md', 'Come in for a spa experience your fur baby will love.');
    const r = await check(['copy.md']);
    const words = r.findings.filter((f) => f.rule === 'banned-vocabulary').map((f) => f.message);
    assert.ok(words.some((m) => /fur baby/i.test(m)));
    assert.ok(words.some((m) => /spa experience/i.test(m)));
  });

  test('matches whole words only', async () => {
    await write('premiums.md', 'We compared insurance premiums for the shop.');
    const r = await check(['premiums.md']);
    assert.equal(
      r.findings.some((f) => f.rule === 'banned-vocabulary' && /"premium"/.test(f.message)),
      false,
      '"premiums" inside a different word is not the banned term',
    );
  });
});

describe('the house floor', () => {
  test('catches lorem ipsum as an error', async () => {
    await write('lorem.html', '<p>Lorem ipsum dolor sit amet</p>');
    assert.equal((await check(['lorem.html'])).findings.find((f) => f.rule === 'filler').level, 'error');
  });

  test('catches a removed focus outline, unless focus-visible is handled', async () => {
    await write('no-focus.css', '.btn:focus { outline: none; }');
    assert.ok((await check(['no-focus.css'])).findings.some((f) => f.rule === 'focus-outline-removed'));

    await write('has-focus.css', '.btn:focus { outline: none; }\n.btn:focus-visible { outline: 2px solid var(--focus-ring); }');
    assert.equal(
      (await check(['has-focus.css'])).findings.some((f) => f.rule === 'focus-outline-removed'),
      false,
      'removing the default outline is fine when focus-visible replaces it',
    );
  });

  test('catches a purple gradient', async () => {
    await write('grad.css', '.h { background: linear-gradient(135deg, #8b5cf6, #6366f1); }');
    assert.ok((await check(['grad.css'])).findings.some((f) => f.rule === 'gradient-of-banned-hue'),
      'the two-stop form is how a purple gradient is usually written');
  });

  test('catches a card with a left accent stripe', async () => {
    await write('card.css', '.card { border-radius: 12px; padding: 16px; border-left: 4px solid #333333; }');
    assert.ok((await check(['card.css'])).findings.some((f) => f.rule === 'left-accent-card'));
  });

  test('notes animation with no reduced-motion handling, and stays quiet when it is handled', async () => {
    await write('anim.css', '@keyframes spin { to { transform: rotate(360deg); } }');
    assert.ok((await check(['anim.css'])).findings.some((f) => f.rule === 'animation-without-reduced-motion'));

    await write('anim-ok.css', '@keyframes spin { to { transform: rotate(360deg); } }\n@media (prefers-reduced-motion: reduce) { * { animation: none; } }');
    assert.equal((await check(['anim-ok.css'])).findings.some((f) => f.rule === 'animation-without-reduced-motion'), false);
  });

  test('every rule in the contract is well formed, because the contract is now the code', async () => {
    const { loadContract, slopRuleSummary, SEVERITIES } = await import('../scripts/slop.mjs');
    const rules = slopRuleSummary(await loadContract());
    assert.ok(rules.length >= 30, `only ${rules.length} rules parsed; the document specifies far more`);
    for (const r of rules) {
      assert.ok(SEVERITIES.includes(r.severity), `${r.rule} has severity ${r.severity}`);
      assert.ok(r.patterns > 0 || r.note, `${r.rule} has neither a pattern nor a stated rule`);
    }
  });

  test('every finding carries a fix, not just a complaint', async () => {
    const { loadContract, slopFindings } = await import('../scripts/slop.mjs');
    const c = await loadContract();
    const sample = `<style>h1{font-family:Inter;background:linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7)}
      .c{border-left:4px solid red;border-radius:8px}.g{backdrop-filter:blur(9px)}a:focus{outline:none}</style>
      <h1>✨ Welcome to our website</h1><p>Lorem ipsum. Trusted by 10,000+ teams.</p>
      <img src="https://picsum.photos/8">`;
    const found = slopFindings(c, sample);
    assert.ok(found.length >= 8, `only ${found.length} rules fired on a page built to trip them`);
    for (const f of found) {
      assert.ok(f.message.length > 20, `${f.rule} needs a real message`);
      assert.ok(f.fix.length > 20, `${f.rule} needs a real fix`);
      assert.ok(['error', 'warn', 'info'].includes(f.level));
    }
  });
});

describe('checkFiles behaviour', () => {
  test('walks a directory and skips the folders nobody wants checked', async () => {
    await write('src/a.css', '.a { color: #FF00FF; }');
    await write('node_modules/pkg/b.css', '.b { color: #00FF00; }');
    await write('dist/c.css', '.c { color: #00FF00; }');
    const r = await check(['.']);
    assert.ok(r.findings.some((f) => f.file === 'src/a.css'));
    assert.equal(r.findings.some((f) => f.file.includes('node_modules')), false);
    assert.equal(r.findings.some((f) => f.file.includes('dist')), false);
  });

  test('sorts the worst first', async () => {
    await write('mixed.css', '.a { color: #FF00FF; }\n.b { background: linear-gradient(1deg, #8b5cf6, #6366f1); }');
    const r = await check(['mixed.css']);
    const levels = r.findings.map((f) => f.level);
    assert.deepEqual(levels, [...levels].sort((a, b) => ({ error: 0, warn: 1, info: 2 })[a] - ({ error: 0, warn: 1, info: 2 })[b]));
  });

  test('ok is false only when something is genuinely broken', async () => {
    await write('warn-only.md', 'Book a spa experience for your dog.');
    const warnOnly = await G.checkFiles({ brand, system, targets: ['warn-only.md'], root: dir });
    assert.ok(warnOnly.findings.length > 0, 'banned vocabulary should be found');
    assert.equal(warnOnly.findings.every((f) => f.level !== 'error'), true);
    assert.equal(warnOnly.ok, true, 'warnings alone do not fail the check');

    await write('error-too.css', '.a { color: #FF00FF; }');
    const withError = await G.checkFiles({ brand, system, targets: ['error-too.css'], root: dir });
    assert.equal(withError.ok, false);
  });

  test('a target that does not exist is skipped rather than thrown', async () => {
    const r = await check(['nowhere-at-all']);
    assert.equal(r.filesChecked, 0);
    assert.deepEqual(r.findings, []);
  });
});

describe('the emitted companion skill', () => {
  let files;
  let skill;

  before(async () => {
    const out = path.join(dir, 'emitted');
    files = await G.emitGuardianSkill({ brand, system, dir: out, brandFile: path.join(dir, 'brand', 'brand.json') });
    skill = await readFile(path.join(out, 'SKILL.md'), 'utf8');
  });

  test('writes a skill and a machine-readable rules file', () => {
    assert.equal(files.length, 2);
    assert.ok(files.some((f) => f.endsWith('SKILL.md')));
    assert.ok(files.some((f) => f.endsWith('rules.json')));
  });

  test('has valid frontmatter naming the brand', () => {
    assert.match(skill, /^---\nname: muddy-paws-brand\ndescription: "/);
    const fm = /^---\n([\s\S]*?)\n---/.exec(skill)[1];
    assert.ok(fm.includes('Muddy Paws'), 'the description must name the brand so it triggers');
    assert.equal(fm.split('\n').filter((l) => l.startsWith('name:')).length, 1);
  });

  test('the description is one quoted scalar with every inner quote escaped', () => {
    const desc = /^description: (.*)$/m.exec(skill)[1];
    assert.ok(desc.startsWith('"') && desc.endsWith('"'), 'must be one quoted scalar on one line');
    // Walk the body: a bare double quote would end the scalar early and break
    // the frontmatter for every consumer.
    const bodyText = desc.slice(1, -1);
    for (let i = 0; i < bodyText.length; i++) {
      if (bodyText[i] === '\\') { i++; continue; }
      assert.notEqual(bodyText[i], '"', `unescaped quote at ${i} would truncate the description`);
    }
    assert.ok(bodyText.includes('\\"'), 'the trigger phrases are quoted, so escapes must be present');
  });

  test('carries the real values, not placeholders', () => {
    assert.ok(skill.includes(system.palettes.brand.light.steps[8].hex));
    assert.ok(skill.includes(system.type.fonts.display));
    assert.ok(skill.includes(system.palettes.brand.light.solidStrong.hex));
  });

  test('states the rules that are not negotiable', () => {
    assert.match(skill, /never carried by colour alone|colour alone/i);
    assert.match(skill, /accent-solid-strong/);
    assert.match(skill, /4\.5:1|AA/);
  });

  test('the rules file is complete and machine readable', async () => {
    const rules = JSON.parse(await readFile(files.find((f) => f.endsWith('rules.json')), 'utf8'));
    assert.equal(rules.brand, 'Muddy Paws');
    assert.ok(Object.keys(rules.palette).length > 50);
    assert.ok(rules.bannedWords.includes('fur baby'));
    assert.ok(rules.bannedFonts.includes('Inter'));
    assert.equal(rules.contrastFloors.bodyText, 4.5);
    for (const p of rules.slopRules) {
      assert.doesNotThrow(() => new RegExp(p.pattern), `${p.id} must be a usable regex`);
    }
  });

  test('carries no em dashes', () => {
    assert.equal(skill.includes('—'), false);
  });
});
