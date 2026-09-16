/**
 * The anti-slop contract, and the parser that makes it the source of truth.
 *
 * The failure mode of a parser is silence: a rule that stops parsing does not
 * throw, it simply stops firing, and a linter that quietly enforces nothing
 * looks exactly like a codebase with no problems. Most of what follows exists
 * to make silence impossible.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
  loadContract, loadContractSync, parseContractYaml, extractContract,
  assertContract, slopFindings, slopRuleSummary,
  REQUIRED_GROUPS, SEVERITIES, CONTRACT_PATH,
} from '../scripts/slop.mjs';
import { BANNED_FONTS, DEFAULT_FONTS, validateArtboard } from '../scripts/canvas.mjs';

const contract = await loadContract();

describe('the YAML subset', () => {
  test('a # inside a quoted string is a colour, not a comment', () => {
    // This is the one that matters. A naive comment strip deletes every hex in
    // the contract and leaves a linter that bans nothing while reporting clean.
    const doc = parseContractYaml("values: ['#6366f1', '#4f46e5']  # rule 2\nother: 1");
    assert.deepEqual(doc.values, ['#6366f1', '#4f46e5']);
    assert.equal(doc.other, 1);
  });

  test('a flow sequence may run over several lines', () => {
    const doc = parseContractYaml("values: ['#a', '#b',\n         '#c', '#d']");
    assert.deepEqual(doc.values, ['#a', '#b', '#c', '#d']);
  });

  test('folded scalars join into one line', () => {
    const doc = parseContractYaml('rule: >\n  first part\n  second part\nnext: 2');
    assert.equal(doc.rule, 'first part second part');
    assert.equal(doc.next, 2);
  });

  test('nested maps, block sequences, numbers and booleans', () => {
    const doc = parseContractYaml('a:\n  b:\n    severity: p1\n    max: 12\n    on: false\n  list:\n    - one\n    - two');
    assert.deepEqual(doc, { a: { b: { severity: 'p1', max: 12, on: false }, list: ['one', 'two'] } });
  });

  test("a single-quoted regex keeps its escapes and its '' quotes", () => {
    const doc = parseContractYaml(`regex: '\\[data-theme=["'']?dark["'']?\\]'`);
    assert.ok(doc.regex.includes("\\[data-theme"));
    assert.ok(doc.regex.includes("'"), 'the doubled quote is one literal quote');
    new RegExp(doc.regex); // must compile
  });

  test('a document it cannot parse throws rather than returning half of one', () => {
    assert.throws(() => parseContractYaml('a: 1\n    b: 2'), SyntaxError);
    assert.throws(() => extractContract('# no yaml block here'), /no longer contains/);
  });
});

describe('the shipped contract', () => {
  test('parses, and carries every group the linter reads', () => {
    for (const g of REQUIRED_GROUPS) assert.ok(contract[g], `${g} is missing`);
    assert.equal(contract.version, 1);
    assert.ok(contract.waiver_pattern);
  });

  test('every regex in it compiles, and every severity is one the linter knows', () => {
    const rules = slopRuleSummary(contract);
    assert.ok(rules.length >= 30, `only ${rules.length} rules; the document specifies far more`);
    for (const r of rules) assert.ok(SEVERITIES.includes(r.severity), `${r.rule}: ${r.severity}`);
    // assertContract does the compiling; this proves it is actually reached.
    assert.doesNotThrow(() => assertContract(contract));
  });

  test('a contract that loses a group is refused, loudly', () => {
    const broken = { ...contract, banned_emoji: { values: [] } };
    assert.throws(() => assertContract(broken), /banned_emoji\.values is empty/);
    assert.throws(() => assertContract({ ...contract, version: 2 }), /version is 2/);
    assert.throws(() => assertContract({ ...contract, waiver_pattern: '' }), /waiver_pattern is missing/);
  });

  test('a rule with a regex that does not compile fails the load, not the run', () => {
    const broken = { ...contract, css_patterns: { bad: { severity: 'p1', regex: '([unclosed' } } };
    assert.throws(() => assertContract(broken), /does not compile/);
  });

  test('the sync and async loaders agree', async () => {
    assert.deepEqual(loadContractSync(), await loadContract());
  });

  test('the document still says it is the machine source of truth', async () => {
    const md = await readFile(CONTRACT_PATH, 'utf8');
    assert.match(md, /linter contract/i);
    assert.match(md, /```yaml/);
  });
});

describe('running the rules', () => {
  const rules = (text) => slopFindings(contract, text).map((f) => f.rule);

  test('the tells it exists to catch', () => {
    const page = `<style>
      h1{font-family:Inter;background:linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7);-webkit-background-clip:text}
      .c{border-left:4px solid red;border-radius:8px} .g{backdrop-filter:blur(9px)} .o{filter:blur(90px)}
      a:focus{outline:none} p{text-align:center} .u{text-transform:uppercase}
    </style>
    <h1>✨ Welcome to our website</h1>
    <p>Lorem ipsum. Trusted by 10,000+ teams with 99.9% uptime. We seamlessly integrate cutting-edge solutions.</p>
    <img src="https://picsum.photos/8">`;
    const found = new Set(rules(page));
    for (const expected of [
      'banned-font', 'gradient-text', 'left-accent-card', 'glassmorphism', 'blur-orb',
      'focus-outline-removed', 'centred-body', 'uppercase-no-tracking', 'emoji-as-icon',
      'filler', 'invented-metric', 'generic-marketing', 'placeholder-host',
    ]) assert.ok(found.has(expected), `${expected} did not fire`);
  });

  test('only the first family in a stack is a choice; the rest are fallbacks', () => {
    // `'Karla', system-ui, sans-serif` is correct practice. Reading it as a
    // violation flagged the tool's own sheets sixteen times over.
    assert.deepEqual(rules("a{font-family:'Karla', system-ui, sans-serif}"), []);
    assert.deepEqual(rules('a{font-family:system-ui, sans-serif}'), ['banned-font']);
    assert.deepEqual(rules("a{font-family:'Inter', Karla}"), ['banned-font']);
  });

  test('a ban and a default are different claims', () => {
    assert.deepEqual(rules('a{font-family:Poppins}'), ['banned-font']);
    assert.deepEqual(rules('a{font-family:"Instrument Serif"}'), ['default-font']);
    assert.ok(BANNED_FONTS.includes('Inter'));
    assert.ok(DEFAULT_FONTS.includes('Instrument Serif'));
    assert.equal(BANNED_FONTS.some((f) => DEFAULT_FONTS.includes(f)), false, 'the two lists must not overlap');
  });

  test('`unless` stands a rule down when the file answered it', () => {
    assert.deepEqual(rules('a:focus{outline:none}'), ['focus-outline-removed']);
    assert.deepEqual(rules('a:focus{outline:none} a:focus-visible{outline:2px solid}'), []);
  });

  test('mentioning :focus-visible is not a replacement; drawing one is', () => {
    // `unless: ':focus-visible'` stood the rule down whenever the file so much
    // as mentioned the pseudo-class, so removing the outline INSIDE a
    // :focus-visible block was never reported.
    assert.deepEqual(rules('button:focus-visible { outline: 0; }'), ['focus-outline-removed']);
    assert.deepEqual(rules('button:focus-visible { outline: none; }'), ['focus-outline-removed']);
    assert.deepEqual(rules('a:focus { outline: none }\n.btn:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }'), []);
    assert.deepEqual(rules('a:focus { outline: none }\n.btn:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--focus-ring); }'), []);
    assert.deepEqual(rules('a:focus { outline: none }\n.btn:focus-visible { outline-offset: 2px; }'), ['focus-outline-removed'],
      'outline-offset without an outline draws nothing');
    // `outline: 0 !important` is still no outline, and it is not a replacement.
    // Two removed outlines, two findings: the :focus-visible one is no longer taken as a replacement.
    assert.deepEqual(rules('a:focus { outline: none; }\nbutton:focus-visible { outline: 0 !important; }'), ['focus-outline-removed', 'focus-outline-removed']);
    assert.deepEqual(rules('button:focus-visible { outline: none !important }'), ['focus-outline-removed']);
    assert.deepEqual(rules('a:focus { outline: none }\n.btn:focus-visible { outline: 2px solid red !important; }'), []);
    assert.deepEqual(rules('@keyframes spin{}'), ['animation-without-reduced-motion']);
    assert.deepEqual(rules('@keyframes spin{} @media (prefers-reduced-motion: reduce){}'), []);
  });

  test('a purple gradient is caught in the two-stop form, which is how it is written', () => {
    assert.ok(rules('.h{background:linear-gradient(135deg,#8b5cf6,#6366f1)}').includes('gradient-of-banned-hue'));
    assert.ok(rules('.h{background:linear-gradient(90deg, purple, indigo)}').includes('gradient-keyword'));
  });

  test('a left accent card is caught whichever order the declarations come in', () => {
    assert.ok(rules('.c{border-radius:8px;border-left:4px solid #333}').includes('left-accent-card'));
    assert.ok(rules('.c{border-left:4px solid #333;border-radius:8px}').includes('left-accent-card'));
    assert.deepEqual(rules('.c{border-left:1px solid #333;border-radius:8px}'), [], 'a hairline rule is not a stripe');
  });

  test('a ground rule fires on grounds, not on swatches', () => {
    assert.ok(rules('body{background:#0a0a0a}').includes('hex-ai-default-grounds'));
    assert.deepEqual(rules('<td>#0a0a0a</td>'), [], 'a hex printed in a table is the table doing its job');
  });

  test('documentation may quote what it forbids', () => {
    assert.deepEqual(rules('<!-- never write Lorem ipsum -->'), []);
    assert.deepEqual(rules('<script>const bad = "Welcome to our website";</script>'), []);
  });

  test('a conforming placeholder is honest, so it waives the copy rule it would trip', () => {
    assert.deepEqual(rules('<p>[COMPANY NAME] does the thing.</p>'), []);
    assert.ok(rules('<p>Company name does the thing.</p>').includes('filler'));
  });

  test('one position reports once, at the worst severity that claimed it', () => {
    // #8b5cf6 is in ai_default_indigo (p0) and purple_violet_family (p1).
    const found = slopFindings(contract, 'a{color:#8b5cf6}');
    assert.equal(found.length, 1);
    assert.equal(found[0].severity, 'p0');
  });

  test('a rule that fires 100 times says so once and stops', () => {
    const many = Array.from({ length: 100 }, (_, i) => `.c${i}{border-left:4px solid #333;border-radius:8px}`).join('\n');
    const found = slopFindings(contract, many).filter((f) => f.rule === 'left-accent-card');
    assert.equal(found.length, 3, 'capped at three');
    assert.match(found[0].message, /100 times in this file/);
  });

  test('a watch is one note per file, because one file needs one justification', () => {
    const many = Array.from({ length: 40 }, () => 'body{background:#0a0a0a}').join('\n');
    assert.equal(slopFindings(contract, many).filter((f) => f.severity === 'watch').length, 1);
  });
});

describe('the punctuation tell', () => {
  const rules = (text) => slopFindings(contract, text).map((f) => f.rule);

  test('a dash used as a sentence break is caught, in generated copy and authored alike', () => {
    // The house rule used to live only in a test over Brandi's own documents,
    // so nothing stopped an authored artboard or a client's page carrying them.
    assert.ok(rules('<p>The system is honest \u2014 and it says so.</p>').includes('ai-punctuation'));
    assert.ok(rules('<p>It ran fast \u2013 faster than before.</p>').includes('ai-punctuation'));
  });

  test('a numeric range is what an en dash is for, and is left alone', () => {
    assert.deepEqual(rules('<p>Open 9\u201317 weekdays.</p>'), []);
    assert.deepEqual(rules('<p>Open 9am\u20135pm.</p>'), []);
    assert.deepEqual(rules('<p>A well-made thing, and it says so.</p>'), []);
  });

  test('the contract states the rule without carrying the character', async () => {
    const md = await readFile(CONTRACT_PATH, 'utf8');
    assert.equal(md.includes('\u2014'), false, 'the document must not trip its own rule');
  });
});

describe('the waiver', () => {
  const rules = (text) => slopFindings(contract, text).map((f) => f.rule);

  test('a reason stands the rule down', () => {
    assert.deepEqual(rules('h1{font-family:Inter} /* anti-slop-waiver: the client licences it corporately */'), []);
    assert.deepEqual(rules('/* anti-slop-waiver: their real face */\nh1{font-family:Poppins}'), []);
  });

  test('a waiver with no reason waives nothing, and is itself reported', () => {
    // A waiver with no argument is how a rule set quietly stops meaning anything.
    const bare = rules('h1{font-family:Inter}\n/* anti-slop-waiver: */');
    assert.ok(bare.includes('banned-font'), 'the finding stands');
    assert.ok(bare.includes('empty-waiver'), 'and the empty waiver is called out');
    assert.ok(rules('h1{font-family:Inter}\n<!-- anti-slop-waiver: -->').includes('empty-waiver'));
  });

  test('it does not reach two lines away, so one waiver cannot cover a file', () => {
    const far = 'h1{font-family:Inter}\n\n\n\n/* anti-slop-waiver: unrelated */';
    assert.ok(rules(far).includes('banned-font'));
  });
});

describe('the tool does not fault its own output', () => {
  test('a generated artboard is exempt, an authored one is not', async () => {
    const { specificationSheets } = await import('../scripts/artboards.mjs');
    const { buildSystem } = await import('../scripts/system.mjs');
    const system = buildSystem({ primary: '#1F6F4A', type: { display: 'Bitter', body: 'Karla', mono: 'JetBrains Mono' } });
    for (const sheet of specificationSheets(system, { brandName: 'Acme' })) {
      const r = validateArtboard(sheet.source, { name: sheet.file });
      assert.deepEqual(r.errors, [], `${sheet.file}: ${JSON.stringify(r.errors)}`);
      assert.deepEqual(r.warnings, [], `${sheet.file}: ${JSON.stringify(r.warnings)}`);
    }
    // The exemption is the marker, not the directory: an authored artboard in
    // the same folder is held to every rule.
    const { artboard } = await import('../scripts/canvas.mjs');
    const authored = artboard({ name: 'Hero', systemNote: 'Authored by hand.', body: '<h1 style="font-family:Inter">Hi</h1>' });
    assert.ok(validateArtboard(authored, { name: 'Hero.dc.html' }).errors.some((e) => /Inter/.test(e.message)));
  });
});

describe('the rule summary a brand carries away', () => {
  test('every rule reaches it, thresholds included', () => {
    const summary = slopRuleSummary(contract);
    const threshold = summary.find((r) => r.rule === 'thresholds.raw_hex_outside_root');
    assert.ok(threshold, 'a threshold is a rule');
    assert.equal(threshold.max, 12);
    assert.ok(threshold.note, 'and it says what it counts');
    for (const r of summary) assert.ok(r.patterns > 0 || r.note, `${r.rule} has nothing behind it`);
  });
});

/**
 * The contract is read while `canvas.mjs` is still being evaluated, to build
 * BANNED_FONTS, which is long before any command has started. An install with
 * `skills/` missing therefore reported a raw ENOENT and six frames of node
 * internals: a path inside the plugin, and nothing anybody can act on.
 */
describe('an install with the contract file missing', () => {
  test('says which file is gone and what to reinstall, rather than throwing a trace', async () => {
    const { mkdtemp, mkdir, cp, rm } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const path = (await import('node:path')).default;
    const run = promisify(execFile);
    const root = path.join(import.meta.dirname, '..');

    const scratch = await mkdtemp(path.join(tmpdir(), 'brandi-noskills-'));
    try {
      // Everything an install has except the skills the references live in.
      for (const d of ['scripts', 'schemas']) {
        await cp(path.join(root, d), path.join(scratch, d), { recursive: true });
      }
      const project = path.join(scratch, 'project');
      await mkdir(project);
      const e = await run(process.execPath, [path.join(scratch, 'scripts', 'brandi.mjs'), 'status'], { cwd: project, timeout: 90000 })
        .then(() => null, (err) => err);
      assert.ok(e, 'a broken install must not report success');
      assert.equal(e.code, 1, 'the same exit code every other failure in this tool uses');
      assert.match(e.stderr, /The anti-slop contract is missing/);
      assert.match(e.stderr, /anti-slop\.contract\.md/, 'it has to name the file');
      assert.match(e.stderr, /Reinstall the plugin/, 'and what to do about it');
      assert.equal(/ENOENT|at loadContract|node:internal|Node\.js v/.test(e.stderr), false, `a stack trace is not a message:\n${e.stderr}`);
      assert.equal(e.stdout, '', 'nothing half-done on stdout');
    } finally {
      await rm(scratch, { recursive: true, force: true });
    }
  });

  test('a caller that named its own missing file gets the error to handle', async () => {
    const path = (await import('node:path')).default;
    const { tmpdir } = await import('node:os');
    const absent = path.join(tmpdir(), 'brandi-no-such-contract.md');
    await assert.rejects(() => loadContract(absent), /The anti-slop contract is missing/);
    assert.throws(() => loadContractSync(absent), /The anti-slop contract is missing/);
    // And the process is still here to run the rest of the suite.
    assert.equal(typeof (await loadContract()).version, 'number');
  });
});
