import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile, readFile, readdir, symlink, lstat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

import * as L from '../scripts/logo.mjs';
import { findChrome } from '../scripts/preview.mjs';

const run = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const LOGO = path.join(here, '..', 'scripts', 'logo.mjs');
const BRANDI = path.join(here, '..', 'scripts', 'brandi.mjs');

const CHROME = findChrome();
const needsChrome = { skip: CHROME ? false : 'no headless browser on this machine' };

const svg = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="#111111">${inner}</g></svg>`;

const MARKS = [
  svg('<path d="M14 30 h72 v14 h-72 z"/><path d="M14 56 h48 v14 h-48 z"/>'),
  svg('<path d="M50 12 C74 12 88 30 88 50 C88 74 70 88 50 88 C30 88 12 74 12 50 C12 30 26 12 50 12 Z M50 34 C40 34 34 42 34 50 C34 60 40 66 50 66 C60 66 66 60 66 50 C66 42 60 34 50 34 Z"/>'),
  svg('<path d="M50 10 L90 82 H10 Z M50 40 L70 74 H30 Z"/>'),
  svg('<path d="M18 18 h64 v18 h-23 v46 h-18 v-46 h-23 z"/>'),
];

let root;
before(async () => {
  root = await mkdtemp(path.join(os.tmpdir(), 'brandi-logo-test-'));
});
after(async () => {
  if (root) await rm(root, { recursive: true, force: true });
});

/** A fresh project directory inside the sandbox. */
async function project(name) {
  const dir = path.join(root, name);
  await mkdir(dir, { recursive: true });
  return dir;
}

/** Draw a mark into every slot of the current round. */
async function drawAll(dir, roundNo = 1) {
  const state = await L.loadState(dir);
  const entry = state.rounds.find((r) => r.round === roundNo);
  const into = path.join(dir, 'brand', 'logo', 'concepts', `round-${String(roundNo).padStart(2, '0')}`);
  await mkdir(into, { recursive: true });
  for (const [i, slot] of entry.slots.entries()) {
    await writeFile(path.join(into, `${slot.id}.svg`), MARKS[i % MARKS.length]);
  }
  return into;
}

describe('paths are not allowed to leave the project', () => {
  test('a traversal is refused', () => {
    assert.throws(() => L.within('/tmp/proj', '../../etc/passwd'), /refusing a path outside/);
    assert.throws(() => L.within('/tmp/proj', '../sibling/x.svg'), /refusing a path outside/);
  });

  test('an absolute path outside the project is refused', () => {
    assert.throws(() => L.within('/tmp/proj', '/etc/passwd'), /refusing a path outside/);
  });

  test('a sibling directory whose name starts with the project name is refused', () => {
    // `/tmp/proj-evil` starts with `/tmp/proj` as a string but is not inside it.
    assert.throws(() => L.within('/tmp/proj', '../proj-evil/x.svg'), /refusing a path outside/);
  });

  test('an ordinary path inside is resolved', () => {
    assert.equal(L.within('/tmp/proj', 'brand/logo/logo.json'), path.resolve('/tmp/proj/brand/logo/logo.json'));
  });

  test('the project root itself is allowed', () => {
    assert.equal(L.within('/tmp/proj', '.'), path.resolve('/tmp/proj'));
  });
});

describe('state', () => {
  test('an empty state carries the brief and says nothing has been searched', () => {
    const s = L.emptyState({ name: 'Acme', category: 'legal' });
    assert.equal(s.brand.name, 'Acme');
    assert.equal(s.master, null);
    assert.match(s.rights.note, /No similarity or trade mark search/);
  });

  test('a missing state file is null, not a throw', async () => {
    assert.equal(await L.loadState(await project('empty')), null);
  });

  test('a state from a future version is refused loudly rather than half read', async () => {
    const dir = await project('future');
    await mkdir(path.join(dir, 'brand', 'logo'), { recursive: true });
    await writeFile(path.join(dir, 'brand', 'logo', 'logo.json'), JSON.stringify({ version: 99 }));
    await assert.rejects(() => L.loadState(dir), /version 99/);
  });

  test('a state file that is not JSON throws rather than returning nothing', async () => {
    const dir = await project('corrupt');
    await mkdir(path.join(dir, 'brand', 'logo'), { recursive: true });
    await writeFile(path.join(dir, 'brand', 'logo', 'logo.json'), '{ not json');
    await assert.rejects(() => L.loadState(dir));
  });
});

describe('the brief comes off the brand file', () => {
  test('nothing is read when there is no brand file', async () => {
    assert.deepEqual(await L.briefFromBrand(await project('nobrand')), {});
  });

  test('the name is read from meta.name, which is where it actually lives', async () => {
    // An earlier version guessed at `brand.brand.name`, found nothing, and
    // planned a whole round for a business called "Brand" without saying so.
    const dir = await project('withbrand');
    await mkdir(path.join(dir, 'brand'), { recursive: true });
    await writeFile(path.join(dir, 'brand', 'brand.json'), JSON.stringify({
      brandi: { version: '1.0.0', phase: 'recon', completed: [] },
      meta: { name: 'Muddy Paws', categories: ['grooming'] },
      strategy: { category: 'dog grooming', positioning: 'The gentle one.', audiences: [{ name: 'Local dog owners' }] },
    }));
    const brief = await L.briefFromBrand(dir);
    assert.equal(brief.name, 'Muddy Paws');
    assert.equal(brief.category, 'dog grooming');
    assert.equal(brief.oneLiner, 'The gentle one.');
    assert.equal(brief.audience, 'Local dog owners');
  });

  test('an audience given as a bare string is read too', async () => {
    const dir = await project('strAudience');
    await mkdir(path.join(dir, 'brand'), { recursive: true });
    await writeFile(path.join(dir, 'brand', 'brand.json'), JSON.stringify({
      brandi: { version: '1.0.0', phase: 'recon', completed: [] },
      meta: { name: 'X' },
      strategy: { audiences: ['Builders'] },
    }));
    assert.equal((await L.briefFromBrand(dir)).audience, 'Builders');
  });

  test('a brand file that will not parse does not stop the forge', async () => {
    const dir = await project('badbrand');
    await mkdir(path.join(dir, 'brand'), { recursive: true });
    await writeFile(path.join(dir, 'brand', 'brand.json'), '{ broken');
    assert.deepEqual(await L.briefFromBrand(dir), {});
  });
});

describe('planning a round', () => {
  test('it writes one brief per slot and a place to draw into', async () => {
    const dir = await project('plan1');
    const res = await L.planRound(dir, { count: 8, brief: { name: 'Ridgeline', category: 'structural engineering' } });
    assert.equal(res.plan.slots.length, 8);
    assert.equal(res.slotFiles.length, 8);
    for (const f of res.slotFiles) assert.ok(existsSync(f));
    assert.ok(existsSync(res.conceptDir), 'the directory to draw into must exist before anybody is asked to draw');
  });

  test('a slot brief never names another slot', async () => {
    const dir = await project('plan2');
    const res = await L.planRound(dir, { count: 12, brief: { name: 'Ridgeline', category: 'engineering' } });
    for (const f of res.slotFiles) {
      const text = await readFile(f, 'utf8');
      const mine = path.basename(f, '.md');
      for (const slot of res.plan.slots) {
        if (slot.id === mine) continue;
        assert.ok(!text.includes(`Concept ${slot.id}`), `${mine} leaks ${slot.id}`);
      }
    }
  });

  test('a second plan adds a round rather than replacing the first', async () => {
    const dir = await project('plan3');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.planRound(dir, { count: 4 });
    const state = await L.loadState(dir);
    assert.deepEqual(state.rounds.map((r) => r.round), [1, 2]);
  });

  test('replanning the same round replaces it rather than duplicating it', async () => {
    const dir = await project('plan4');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.planRound(dir, { count: 8, round: 1 });
    const state = await L.loadState(dir);
    assert.equal(state.rounds.length, 1);
    assert.equal(state.rounds[0].slots.length, 8);
  });

  test('the brand carried in the brief survives into the state', async () => {
    const dir = await project('plan5');
    await L.planRound(dir, { count: 4, brief: { name: 'Ridgeline', category: 'engineering', oneLiner: 'Hard jobs.' } });
    const state = await L.loadState(dir);
    assert.equal(state.brand.name, 'Ridgeline');
    assert.equal(state.brand.oneLiner, 'Hard jobs.');
  });
});

describe('importing drawn concepts', () => {
  test('a file is matched to its slot by name', async () => {
    const dir = await project('imp1');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    const into = await drawAll(dir);
    const res = await L.importConcepts(dir, [into], { model: 'test-model' });
    assert.equal(res.imported.length, 4);
    assert.deepEqual(res.unmatched, []);
    for (const c of res.imported) assert.ok(existsSync(path.join(dir, c.file)));
  });

  test('a file matching no slot is reported, not quietly kept', async () => {
    // An unmatched file is nearly always a slot drawn under the wrong name, and
    // it would otherwise vanish from the round with nothing said.
    const dir = await project('imp2');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    const into = await drawAll(dir);
    await writeFile(path.join(into, 'ZZ9.svg'), MARKS[0]);
    const res = await L.importConcepts(dir, [into]);
    assert.deepEqual(res.unmatched, ['ZZ9.svg']);
    assert.equal(res.imported.length, 4);
  });

  test('every import carries a provenance record naming its slot brief', async () => {
    const dir = await project('imp3');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.importConcepts(dir, [await drawAll(dir)], { model: 'claude-opus-5' });
    const state = await L.loadState(dir);
    const c = state.rounds[0].candidates[0];
    assert.equal(c.provenance.generatedBy, 'claude-opus-5');
    assert.match(c.provenance.prompt, /brief\/slots\/round-01/);
    assert.equal(c.provenance.status, 'candidate, not approved');
    assert.match(c.provenance.generatedOn, /^\d{4}-\d{2}-\d{2}$/);
  });

  test('imported artwork is normalised on the way in', async () => {
    const dir = await project('imp4');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    const into = await drawAll(dir);
    const state0 = await L.loadState(dir);
    const id = state0.rounds[0].slots[0].id;
    await writeFile(path.join(into, `${id}.svg`), `<?xml version="1.0"?><!-- drawn by hand -->${MARKS[0]}`);
    await L.importConcepts(dir, [into]);
    const saved = await readFile(path.join(into, `${id}.svg`), 'utf8');
    assert.ok(!saved.includes('<?xml'), 'the declaration should be gone');
    assert.ok(!saved.includes('drawn by hand'), 'the comment should be gone');
    assert.match(saved, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  });

  test('importing before planning says what to do instead of throwing something cryptic', async () => {
    const dir = await project('imp5');
    await assert.rejects(() => L.importConcepts(dir, ['.']), /logo plan/);
  });

  test('a file that does not exist is named', async () => {
    const dir = await project('imp6');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await assert.rejects(() => L.importConcepts(dir, ['nope.svg']), /no such file/);
  });

  test('a path outside the project is refused', async () => {
    const dir = await project('imp7');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await assert.rejects(() => L.importConcepts(dir, ['../../../etc']), /refusing a path outside/);
  });

  test('a symlink out of the project is refused, not followed', async () => {
    // Resolving the path STRING is not enough. A symlink sitting inside the
    // project and pointing outside it passes a string test and is then read.
    // Verified before the guard existed: a file containing "PRIVATE KEY
    // MATERIAL" was copied into the round under a slot's name and would have
    // gone on into a published canvas.
    const outside = await project('sym-outside');
    await writeFile(path.join(outside, 'secret.svg'), MARKS[0]);
    await writeFile(path.join(outside, 'id_rsa'), 'PRIVATE KEY MATERIAL');

    const dir = await project('sym-proj');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    const state = await L.loadState(dir);
    const [a, b, c] = state.rounds[0].slots.map((s2) => s2.id);
    const into = path.join(dir, 'brand', 'logo', 'concepts', 'round-01');
    await mkdir(into, { recursive: true });
    await symlink(path.join(outside, 'secret.svg'), path.join(into, `${a}.svg`));
    await symlink(path.join(outside, 'id_rsa'), path.join(into, `${b}.svg`));
    await writeFile(path.join(into, `${c}.svg`), MARKS[1]);

    const res = await L.importConcepts(dir, [into]);
    assert.deepEqual(res.escaped.sort(), [`${a}.svg`, `${b}.svg`].sort());
    assert.equal(res.imported.length, 1, 'only the real file inside the project should arrive');
    assert.equal(res.imported[0].id, c);

    // The refused links are left exactly as they were: still symlinks, never
    // replaced by real files carrying the outside content. Reading them still
    // follows the link, which is why this checks what was WRITTEN.
    for (const name of [`${a}.svg`, `${b}.svg`]) {
      assert.ok((await lstat(path.join(into, name))).isSymbolicLink(), `${name} should still be an untouched symlink`);
    }
    for (const c2 of res.imported) {
      const written = await readFile(path.join(dir, c2.file), 'utf8');
      assert.ok(!written.includes('PRIVATE KEY'), `${c2.file} carries content from outside the project`);
    }
  });

  test('a symlink out of the project is refused when named directly too', async () => {
    const outside = await project('sym2-outside');
    await writeFile(path.join(outside, 'secret.svg'), MARKS[0]);
    const dir = await project('sym2-proj');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    const state = await L.loadState(dir);
    const id = state.rounds[0].slots[0].id;
    const into = path.join(dir, 'brand', 'logo', 'concepts', 'round-01');
    await mkdir(into, { recursive: true });
    await symlink(path.join(outside, 'secret.svg'), path.join(into, `${id}.svg`));
    await assert.rejects(
      () => L.importConcepts(dir, [`brand/logo/concepts/round-01/${id}.svg`]),
      /leaves the project through a symlink/,
    );
  });

  test('a file named .svg that is not one is refused rather than copied in', async () => {
    const dir = await project('notsvg');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    const into = await drawAll(dir);
    const state = await L.loadState(dir);
    const id = state.rounds[0].slots[0].id;
    await writeFile(path.join(into, `${id}.svg`), 'not an svg at all');
    const res = await L.importConcepts(dir, [into]);
    assert.deepEqual(res.notSvg, [`${id}.svg`]);
    assert.equal(res.imported.length, 3);
  });
});

describe('picking', () => {
  test('a shortlist is recorded', async () => {
    const dir = await project('pick1');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.importConcepts(dir, [await drawAll(dir)]);
    const state = await L.loadState(dir);
    const ids = state.rounds[0].candidates.slice(0, 2).map((c) => c.id);
    const res = await L.pickDirections(dir, ids);
    assert.deepEqual(res.shortlist, ids);
    assert.equal(res.single, false);
  });

  test('picking one is allowed but flagged, because one from a first round is the safest thing in the set', async () => {
    const dir = await project('pick2');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.importConcepts(dir, [await drawAll(dir)]);
    const state = await L.loadState(dir);
    assert.equal((await L.pickDirections(dir, [state.rounds[0].candidates[0].id])).single, true);
  });

  test('picking something that was never drawn is refused by name', async () => {
    const dir = await project('pick3');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.importConcepts(dir, [await drawAll(dir)]);
    await assert.rejects(() => L.pickDirections(dir, ['ZZ9']), /no concept called ZZ9/);
  });
});

describe('promoting to a master', () => {
  test('it writes the master and both monochrome renditions', needsChrome, async () => {
    const dir = await project('master1');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.importConcepts(dir, [await drawAll(dir)]);
    const state = await L.loadState(dir);
    const id = state.rounds[0].candidates[1].id;
    const res = await L.promoteToMaster(dir, id, { approvedBy: 'Jake' });
    for (const f of Object.values(res.files)) assert.ok(existsSync(path.join(dir, f)), `${f} should exist`);
    assert.ok(res.clearSpace.sentence.includes('clear space'));
  });

  test('with nobody approving it, the record says so plainly', async () => {
    // The one thing this product must never do is imply somebody signed off on
    // a mark they never saw.
    const dir = await project('master2');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.importConcepts(dir, [await drawAll(dir)]);
    const state = await L.loadState(dir);
    await L.promoteToMaster(dir, state.rounds[0].candidates[0].id, { chrome: null });
    const after = await L.loadState(dir);
    assert.equal(after.master.approvedBy, null);
    assert.equal(after.master.approvedOn, null);
    assert.equal(after.master.provenance.status, 'candidate, not approved');
    const manifest = await readFile(path.join(dir, 'brand', 'logo', 'rights', 'generation-manifest.md'), 'utf8');
    assert.match(manifest, /NOBODY YET/);
  });

  test('an empty or whitespace approver is nobody, loudly', async () => {
    // Left as-is it stored "" and the manifest rendered the approval row as a
    // blank, which reads like a field somebody forgot rather than the refusal
    // it has to be.
    for (const given of ['', '   ', '\t\n']) {
      const dir = await project(`approver-${given.length}-${Math.random().toString(36).slice(2, 6)}`);
      await L.planRound(dir, { count: 4, brief: { name: 'A' } });
      await L.importConcepts(dir, [await drawAll(dir)]);
      const state = await L.loadState(dir);
      await L.promoteToMaster(dir, state.rounds[0].candidates[0].id, { approvedBy: given, chrome: null });
      const after = await L.loadState(dir);
      assert.equal(after.master.approvedBy, null, `${JSON.stringify(given)} must not count as an approval`);
      assert.equal(after.master.provenance.status, 'candidate, not approved');
      const manifest = await readFile(path.join(dir, 'brand', 'logo', 'rights', 'generation-manifest.md'), 'utf8');
      assert.match(manifest, /NOBODY YET/);
    }
  });

  test('a padded name is trimmed rather than stored with its whitespace', async () => {
    const dir = await project('approver-pad');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.importConcepts(dir, [await drawAll(dir)]);
    const state = await L.loadState(dir);
    await L.promoteToMaster(dir, state.rounds[0].candidates[0].id, { approvedBy: '  Jake Shelley  ', chrome: null });
    assert.equal((await L.loadState(dir)).master.approvedBy, 'Jake Shelley');
  });

  test('re-promoting without an approval clears the old one rather than keeping it', async () => {
    // Discarding an approval is the safe direction. Carrying one forward would
    // let a later run inherit a sign-off nobody gave for it.
    const dir = await project('approver-reset');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.importConcepts(dir, [await drawAll(dir)]);
    const state = await L.loadState(dir);
    const id = state.rounds[0].candidates[0].id;
    await L.promoteToMaster(dir, id, { approvedBy: 'Jake', chrome: null });
    assert.equal((await L.loadState(dir)).master.approvedBy, 'Jake');
    await L.promoteToMaster(dir, id, { chrome: null });
    assert.equal((await L.loadState(dir)).master.approvedBy, null);
  });

  test('an approval is recorded with a local date, not a UTC one', async () => {
    const dir = await project('master3');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.importConcepts(dir, [await drawAll(dir)]);
    const state = await L.loadState(dir);
    await L.promoteToMaster(dir, state.rounds[0].candidates[0].id, { approvedBy: 'Jake Shelley', chrome: null });
    const after = await L.loadState(dir);
    const now = new Date();
    const local = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    assert.equal(after.master.approvedOn, local);
  });

  test('the search record is a checklist and states that nothing has been run', async () => {
    const dir = await project('master4');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.importConcepts(dir, [await drawAll(dir)]);
    const state = await L.loadState(dir);
    await L.promoteToMaster(dir, state.rounds[0].candidates[0].id, { approvedBy: 'Jake', chrome: null });
    const record = await readFile(path.join(dir, 'brand', 'logo', 'rights', 'similarity-search-record.md'), 'utf8');
    assert.match(record, /Nothing below has been done/);
    assert.match(record, /search\.ipaustralia\.gov\.au/);
    assert.match(record, /wipo\.int/);
  });

  test('a search record somebody has filled in is never overwritten', async () => {
    const dir = await project('master5');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.importConcepts(dir, [await drawAll(dir)]);
    const state = await L.loadState(dir);
    const id = state.rounds[0].candidates[0].id;
    await L.promoteToMaster(dir, id, { approvedBy: 'Jake', chrome: null });
    const file = path.join(dir, 'brand', 'logo', 'rights', 'similarity-search-record.md');
    await writeFile(file, '# I did the searches\n\nAll clear, 30 August, by the trade marks attorney.\n');
    await L.promoteToMaster(dir, id, { approvedBy: 'Jake', chrome: null });
    assert.match(await readFile(file, 'utf8'), /I did the searches/);
  });

  test('promoting something that was never drawn is refused by name', async () => {
    const dir = await project('master6');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.importConcepts(dir, [await drawAll(dir)]);
    await assert.rejects(() => L.promoteToMaster(dir, 'ZZ9'), /no concept called ZZ9/);
  });

  test('every variant written into brand.json has a file behind it', async () => {
    // `brandi validate` reports a declared variant with no file as an error, and
    // producing that from the tool meant to prevent it would be the worst
    // possible source.
    const dir = await project('master7');
    await mkdir(path.join(dir, 'brand'), { recursive: true });
    await writeFile(path.join(dir, 'brand', 'brand.json'), JSON.stringify({
      brandi: { version: '1.0.0', created: new Date().toISOString(), updated: new Date().toISOString(), phase: 'identity', completed: [] },
      meta: { name: 'Ridgeline', slug: 'ridgeline', version: '0.1.0' },
      evidence: [], strategy: {}, identity: {}, voice: {}, applications: {}, governance: {},
    }));
    await L.planRound(dir, { count: 4 });
    await L.importConcepts(dir, [await drawAll(dir)]);
    const state = await L.loadState(dir);
    const res = await L.promoteToMaster(dir, state.rounds[0].candidates[0].id, { approvedBy: 'Jake', chrome: null });
    assert.equal(res.brandWritten, true);
    const brand = JSON.parse(await readFile(path.join(dir, 'brand', 'brand.json'), 'utf8'));
    assert.ok(brand.identity.logo.variants.length >= 3);
    for (const v of brand.identity.logo.variants) {
      assert.ok(existsSync(path.join(dir, v.file)), `${v.name} is declared but ${v.file} is not on disk`);
    }
    for (const f of brand.identity.logo.files) {
      assert.ok(existsSync(path.join(dir, f.path)), `${f.role} is declared but ${f.path} is not on disk`);
      assert.ok(f.role, 'every recorded file needs a role, which is what the asset pack keys off');
    }
  });

  test('the decision written into brand.json says it was generated and who approved it', async () => {
    const dir = await project('master8');
    await mkdir(path.join(dir, 'brand'), { recursive: true });
    await writeFile(path.join(dir, 'brand', 'brand.json'), JSON.stringify({
      brandi: { version: '1.0.0', created: new Date().toISOString(), updated: new Date().toISOString(), phase: 'identity', completed: [] },
      meta: { name: 'Ridgeline', slug: 'ridgeline', version: '0.1.0' },
      evidence: [], strategy: {}, identity: {}, voice: {}, applications: {}, governance: {},
    }));
    await L.planRound(dir, { count: 4 });
    await L.importConcepts(dir, [await drawAll(dir)]);
    const state = await L.loadState(dir);
    await L.promoteToMaster(dir, state.rounds[0].candidates[0].id, { approvedBy: 'Jake Shelley', chrome: null });
    const brand = JSON.parse(await readFile(path.join(dir, 'brand', 'brand.json'), 'utf8'));
    const d = brand.governance?.decisions ?? brand.decisions ?? [];
    const found = JSON.stringify(d);
    assert.match(found, /Jake Shelley/);
    assert.match(found, /not been cleared for registration/);
  });
});

describe('status is the cursor', () => {
  test('an untouched project says where to start', async () => {
    const s = await L.forgeStatus(await project('st1'));
    assert.equal(s.started, false);
    assert.equal(s.next, 'logo plan');
  });

  test('it names the next step at every stage', async () => {
    const dir = await project('st2');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    assert.match((await L.forgeStatus(dir)).next, /logo import/);

    await L.importConcepts(dir, [await drawAll(dir)]);
    assert.equal((await L.forgeStatus(dir)).next, 'logo audit');

    const state = await L.loadState(dir);
    for (const c of state.rounds[0].candidates) c.audit = { verdict: 'contender', findings: [], contexts: [] };
    await L.saveState(dir, state);
    assert.equal((await L.forgeStatus(dir)).next, 'logo board');
  });

  test('it counts the verdicts', async () => {
    const dir = await project('st3');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.importConcepts(dir, [await drawAll(dir)]);
    const state = await L.loadState(dir);
    state.rounds[0].candidates[0].audit = { verdict: 'rejected', findings: [], contexts: [] };
    state.rounds[0].candidates[1].audit = { verdict: 'contender', findings: [], contexts: [] };
    await L.saveState(dir, state);
    const s = await L.forgeStatus(dir);
    assert.equal(s.verdicts.rejected, 1);
    assert.equal(s.verdicts.contender, 1);
    assert.equal(s.verdicts['not audited'], 2);
  });
});

describe('argument parsing', () => {
  test('a boolean flag does not swallow the next positional', () => {
    // `--stacked A1` used to make A1 the value of --stacked, and the command
    // then ran against nothing.
    const { flags, positional } = L.parseArgs(['import', '--stacked', 'A1']);
    assert.equal(flags.get('stacked'), true);
    assert.deepEqual(positional, ['import', 'A1']);
  });

  test('a flag with a value takes it', () => {
    const { flags } = L.parseArgs(['--font', 'Bitter', '--weight', '700']);
    assert.equal(flags.get('font'), 'Bitter');
    assert.equal(flags.get('weight'), '700');
  });

  test('a trailing flag with nothing after it is a boolean', () => {
    assert.equal(L.parseArgs(['audit', '--json']).flags.get('json'), true);
  });

  test('several positionals survive in order', () => {
    assert.deepEqual(L.parseArgs(['pick', 'A1', 'B2', 'C3']).positional, ['pick', 'A1', 'B2', 'C3']);
  });
});

describe('the command line, run as a command line', () => {
  test('with no arguments it prints the usage', async () => {
    const { stdout } = await run(process.execPath, [LOGO]);
    assert.match(stdout, /plan/);
    assert.match(stdout, /wordmark/);
    assert.match(stdout, /master/);
  });

  test('an unknown command exits non zero', async () => {
    await assert.rejects(() => run(process.execPath, [LOGO, 'nonsense']));
  });

  test('--json returns data rather than prose', async () => {
    const dir = await project('cli1');
    await run(process.execPath, [LOGO, 'plan', '--name', 'Acme', '--count', '4'], { cwd: dir });
    const { stdout } = await run(process.execPath, [LOGO, 'status', '--json'], { cwd: dir });
    const parsed = JSON.parse(stdout);
    assert.equal(parsed.brand.name, 'Acme');
  });

  test('--count with junk is refused loudly rather than becoming NaN', async () => {
    const dir = await project('cli2');
    await assert.rejects(() => run(process.execPath, [LOGO, 'plan', '--count', 'abc'], { cwd: dir }), /needs a number/);
  });

  test('planning with nothing supplied says what it did not find', async () => {
    const dir = await project('cli3');
    const { stdout } = await run(process.execPath, [LOGO, 'plan', '--count', '4'], { cwd: dir });
    assert.match(stdout, /planned generically/);
  });

  test('with nothing supplied it offers the directory name without assuming it', async () => {
    // A folder name is a strong hint and a poor brand name: capitalisation,
    // spacing and ampersands are exactly what a wordmark is set in, and taking
    // them from a slug means getting them wrong.
    const dir = path.join(root, 'thornbury-cellar-door');
    await mkdir(dir, { recursive: true });
    const { stdout } = await run(process.execPath, [LOGO, 'plan', '--count', '4'], { cwd: dir });
    assert.match(stdout, /This directory is called "Thornbury Cellar Door"/);
    assert.match(stdout, /not assumed/);
    const state = await L.loadState(dir);
    assert.equal(state.brand.name, 'Brand', 'the guess must not silently become the name');
  });

  test('a package.json name beats the directory name', async () => {
    const dir = await project('pkgname');
    await writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: '@acme/muddy-paws' }));
    assert.equal(await L.guessName(dir), 'Muddy Paws');
  });

  test('a package.json that will not parse falls back to the directory', async () => {
    const dir = path.join(root, 'broken-pkg-here');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'package.json'), '{ not json');
    assert.equal(await L.guessName(dir), 'Broken Pkg Here');
  });
});

describe('the brandi delegation', () => {
  // `brandi logo` was handed the PARSED positionals, so every flag had already
  // been stripped: `brandi logo plan --count 12 --name "X"` planned twelve
  // concepts for a business called "Brand" and said nothing about it. It looked
  // correct because the two commands anybody tries first take no flags at all.
  test('flags survive the trip through brandi', async () => {
    const dir = await project('deleg1');
    const { stdout } = await run(process.execPath, [BRANDI, 'logo', 'plan', '--name', 'Hale & Byrne', '--category', 'conveyancing lawyers', '--count', '4'], { cwd: dir });
    assert.match(stdout, /Planned 4 concepts for Hale & Byrne/);
  });

  test('the category reaches the slot briefs, which is what refuses the cliches', async () => {
    const dir = await project('deleg2');
    await run(process.execPath, [BRANDI, 'logo', 'plan', '--name', 'Ward', '--category', 'conveyancing lawyers', '--count', '4'], { cwd: dir });
    const slotDir = path.join(dir, 'brand', 'logo', 'brief', 'slots', 'round-01');
    const first = await readFile(path.join(slotDir, (await readdir(slotDir))[0]), 'utf8');
    assert.match(first, /gavel/, 'a legal brand must be told not to draw a gavel');
  });

  test('--json survives the trip too', async () => {
    const dir = await project('deleg3');
    await run(process.execPath, [BRANDI, 'logo', 'plan', '--name', 'Acme', '--count', '4'], { cwd: dir });
    const { stdout } = await run(process.execPath, [BRANDI, 'logo', 'status', '--json'], { cwd: dir });
    assert.equal(JSON.parse(stdout).brand.name, 'Acme');
  });

  test('--json works before the subcommand as well as after it', async () => {
    // One spelling that works and one that quietly does something else is the
    // same species of bug as the one this suite already guards against.
    const dir = await project('deleg4');
    await run(process.execPath, [BRANDI, 'logo', 'plan', '--name', 'Acme', '--count', '4'], { cwd: dir });
    const before = await run(process.execPath, [BRANDI, '--json', 'logo', 'status'], { cwd: dir });
    const after = await run(process.execPath, [BRANDI, 'logo', 'status', '--json'], { cwd: dir });
    assert.equal(JSON.parse(before.stdout).brand.name, 'Acme');
    assert.deepEqual(JSON.parse(before.stdout), JSON.parse(after.stdout));
  });

  test('bare `brandi logo` prints the forge usage, not the brandi usage', async () => {
    const { stdout } = await run(process.execPath, [BRANDI, 'logo']);
    assert.match(stdout, /generate, measure and choose a mark/);
  });
});

describe('the whole round, end to end', () => {
  test('plan, draw, import, audit, board, pick, master', needsChrome, async () => {
    const dir = await project('e2e');
    await L.planRound(dir, { count: 8, brief: { name: 'Ridgeline', category: 'structural engineering' } });
    await L.importConcepts(dir, [await drawAll(dir)], { model: 'test' });

    const audit = await L.auditRound(dir);
    assert.equal(audit.candidates.length, 8);
    assert.ok(audit.rendered, 'the browser pass should have run');
    // Four distinct marks repeated twice, so every one has exactly one twin.
    assert.equal(audit.duplicates.length, 4, `expected four duplicate pairs, got ${JSON.stringify(audit.duplicates)}`);

    const boards = await L.buildBoards(dir);
    assert.equal(boards.boards.length, 5);
    for (const b of boards.boards) {
      assert.ok(existsSync(path.join(boards.dir, b.file)));
      assert.ok(b.w > 0 && b.h > 0, `${b.file} has no frame`);
    }
    assert.ok(existsSync(path.join(boards.dir, 'canvas.json')));

    const state = await L.loadState(dir);
    const keep = state.rounds[0].candidates.slice(0, 3).map((c) => c.id);
    await L.pickDirections(dir, keep);

    const res = await L.promoteToMaster(dir, keep[0], { approvedBy: 'Jake' });
    assert.ok(res.minimumSizes.isFloor, 'the minimum must be reported as a floor, not an answer');
    assert.ok(res.minimumSizes.screenPx % 10 === 0);

    const final = await L.forgeStatus(dir);
    assert.equal(final.next, 'done');
    assert.equal(final.master.approvedBy, 'Jake');
  });

  test('every artboard the round produces passes the canvas validator', needsChrome, async () => {
    const { validateArtboard } = await import('../scripts/canvas.mjs');
    const dir = await project('e2e-validate');
    await L.planRound(dir, { count: 8, brief: { name: 'Ridgeline', category: 'engineering' } });
    await L.importConcepts(dir, [await drawAll(dir)]);
    await L.auditRound(dir);
    const boards = await L.buildBoards(dir);
    for (const b of boards.boards) {
      const source = await readFile(path.join(boards.dir, b.file), 'utf8');
      const v = validateArtboard(source, { name: b.file });
      assert.deepEqual(v.errors, [], `${b.file}: ${v.errors.map((e) => e.message).join('; ')}`);
    }
  });

  test('auditing a round with nothing drawn says what to do', async () => {
    const dir = await project('e2e-empty');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await assert.rejects(() => L.auditRound(dir), /logo import/);
  });
});


describe('the refinement round', () => {
  async function upToShortlist(name, keep = 2) {
    const dir = await project(name);
    await L.planRound(dir, { count: 8, brief: { name: 'Ridgeline', category: 'engineering' } });
    await L.importConcepts(dir, [await drawAll(dir)]);
    const state = await L.loadState(dir);
    const ids = state.rounds[0].candidates.slice(0, keep).map((c) => c.id);
    await L.pickDirections(dir, ids);
    return { dir, ids };
  }

  test('it deals four tasks for every shortlisted direction', async () => {
    const { dir, ids } = await upToShortlist('ref1', 3);
    const res = await L.planRefinement(dir);
    assert.equal(res.round, 2);
    assert.equal(res.refines, 1);
    assert.deepEqual(res.chosen, ids);
    assert.equal(res.slots.length, ids.length * 4);
    for (const f of res.slotFiles) assert.ok(existsSync(f));
  });

  test('it takes the shortlist without being told it', async () => {
    const { dir, ids } = await upToShortlist('ref2');
    assert.deepEqual((await L.planRefinement(dir)).chosen, ids);
  });

  test('it can be told which concepts to refine instead', async () => {
    const { dir } = await upToShortlist('ref3');
    const state = await L.loadState(dir);
    const other = state.rounds[0].candidates[3].id;
    assert.deepEqual((await L.planRefinement(dir, { ids: [other] })).chosen, [other]);
  });

  test('with no shortlist it says to pick first rather than guessing', async () => {
    const dir = await project('ref4');
    await L.planRound(dir, { count: 4, brief: { name: 'A' } });
    await L.importConcepts(dir, [await drawAll(dir)]);
    await assert.rejects(() => L.planRefinement(dir), /logo pick/);
  });

  test('refining something that was never drawn is refused by name', async () => {
    const { dir } = await upToShortlist('ref5');
    await assert.rejects(() => L.planRefinement(dir, { ids: ['ZZ9'] }), /no concept called ZZ9/);
  });

  test('the round records that it is a refinement and what it refines', async () => {
    const { dir } = await upToShortlist('ref6');
    await L.planRefinement(dir);
    const state = await L.loadState(dir);
    const r2 = state.rounds.find((r) => r.round === 2);
    assert.equal(r2.kind, 'refinement');
    assert.equal(r2.refines, 1);
  });

  test('every refinement brief names the file it is refining', async () => {
    const { dir } = await upToShortlist('ref7');
    const res = await L.planRefinement(dir);
    for (const f of res.slotFiles) {
      const text = await readFile(f, 'utf8');
      assert.match(text, /round-01\/[A-D]\d\.svg/, `${path.basename(f)} does not point at a parent file`);
    }
  });

  test('refinements of one parent that never changed are reported as undone work, not as duplicates', needsChrome, async () => {
    // Two refinements of the same mark are SUPPOSED to look alike, so calling
    // them the same idea buries the finding that actually matters: that the
    // task was not done.
    const { dir } = await upToShortlist('ref8', 1);
    const res = await L.planRefinement(dir);
    const into = path.join(dir, 'brand', 'logo', 'concepts', 'round-02');
    const state = await L.loadState(dir);
    const parent = await readFile(path.join(dir, state.rounds[0].candidates[0].file), 'utf8');
    for (const slot of res.slots) await writeFile(path.join(into, `${slot.id}.svg`), parent);

    await L.importConcepts(dir, [into]);
    const audit = await L.auditRound(dir);
    assert.ok(audit.duplicates.length > 0);
    assert.ok(audit.duplicates.every((d) => d.kind === 'unchanged'), 'siblings must report as unchanged, not converged');
    const finding = audit.candidates[0].findings.find((f) => f.id === 'unchanged');
    assert.match(finding.message, /refinement it was asked for has not been done/);
  });

  test('a refinement round boards and validates like any other', needsChrome, async () => {
    const { validateArtboard } = await import('../scripts/canvas.mjs');
    const { dir } = await upToShortlist('ref9', 2);
    const res = await L.planRefinement(dir);
    const into = path.join(dir, 'brand', 'logo', 'concepts', 'round-02');
    for (const [i, slot] of res.slots.entries()) {
      await writeFile(path.join(into, `${slot.id}.svg`), MARKS[i % MARKS.length]);
    }
    await L.importConcepts(dir, [into]);
    await L.auditRound(dir);
    const boards = await L.buildBoards(dir);
    assert.equal(boards.boards.length, 5);
    for (const b of boards.boards) {
      const source = await readFile(path.join(boards.dir, b.file), 'utf8');
      assert.deepEqual(validateArtboard(source, { name: b.file }).errors, []);
    }
  });

  test('no artboard names a page the manifest does not list', needsChrome, async () => {
    // The design helper refuses the whole seed for this, which is how it was
    // found: "names page Round but canvas.json has no pages list".
    const { dir } = await upToShortlist('ref10', 2);
    const res = await L.planRefinement(dir);
    const into = path.join(dir, 'brand', 'logo', 'concepts', 'round-02');
    for (const [i, slot] of res.slots.entries()) {
      await writeFile(path.join(into, `${slot.id}.svg`), MARKS[i % MARKS.length]);
    }
    await L.importConcepts(dir, [into]);
    await L.auditRound(dir);
    const boards = await L.buildBoards(dir);
    const manifest = JSON.parse(await readFile(path.join(boards.dir, 'canvas.json'), 'utf8'));
    const pages = new Set((manifest.pages ?? []).map((p) => p.id));
    for (const a of manifest.artboards) {
      if (a.page !== undefined) assert.ok(pages.has(a.page), `${a.file} names page ${a.page}, which is not listed`);
    }
    for (const n of manifest.annotations ?? []) {
      if (n.page !== undefined) assert.ok(pages.has(n.page));
    }
    assert.deepEqual(manifest.launch, { view: 'canvas' }, 'a round opens on the range, not on one mark');
  });
});


describe('findings from the adversarial review', () => {
  const MARK = svg('<rect x="20" y="20" width="60" height="60" fill="#000"/>');

  async function withThree(name) {
    const dir = await project(name);
    await L.planRound(dir, { count: 4, brief: { name: 'Edgeco' } });
    const state = await L.loadState(dir);
    const into = path.join(dir, 'brand', 'logo', 'concepts', 'round-01');
    await mkdir(into, { recursive: true });
    const ids = state.rounds[0].slots.slice(0, 3).map((s2) => s2.id);
    for (const id of ids) await writeFile(path.join(into, `${id}.svg`), MARK);
    await L.importConcepts(dir, [into]);
    return { dir, into, ids };
  }

  test('the boards refuse to be built from a round that was never measured', async () => {
    // The boards say "measured before anybody said what they like" in their own
    // copy and the audit board is titled "What the arithmetic found". Building
    // them from an unmeasured round printed a passing verdict for every mark as
    // fact, on the one artefact a person decides from.
    const { dir } = await withThree('rev-board');
    await assert.rejects(() => L.buildBoards(dir), /has not been audited/);
    await assert.rejects(() => L.buildBoards(dir), /logo audit/);
  });

  test('the boards refuse when only some concepts were measured', async () => {
    const { dir } = await withThree('rev-board-partial');
    const state = await L.loadState(dir);
    state.rounds[0].candidates[0].audit = { verdict: 'contender', findings: [], contexts: [] };
    state.rounds[0].candidates[1].audit = { verdict: 'contender', findings: [], contexts: [] };
    await L.saveState(dir, state);
    await assert.rejects(() => L.buildBoards(dir), /unaudited concepts/);
  });

  test('re-importing one file keeps the rest of the round', async () => {
    // Replacing the candidate list meant "one mark came back wrong, re-import
    // the corrected file" wiped every other candidate. The SVGs stayed on disk
    // but audit, board and pick all read this list, so the round silently lost
    // them and "Imported 1 concepts" read like a successful add.
    const { dir, into, ids } = await withThree('rev-merge');
    const res = await L.importConcepts(dir, [path.join(into, `${ids[0]}.svg`)]);
    assert.deepEqual(res.replaced, [ids[0]]);
    assert.equal(res.kept, 2);
    const state = await L.loadState(dir);
    assert.deepEqual(state.rounds[0].candidates.map((c) => c.id).sort(), [...ids].sort());
  });

  test('a replaced concept loses its audit, because the audit was of different artwork', async () => {
    const { dir, into, ids } = await withThree('rev-stale-audit');
    const state = await L.loadState(dir);
    for (const c of state.rounds[0].candidates) c.audit = { verdict: 'contender', findings: [], contexts: [] };
    state.rounds[0].auditedOn = '2026-08-30';
    await L.saveState(dir, state);

    await L.importConcepts(dir, [path.join(into, `${ids[0]}.svg`)]);
    const after = await L.loadState(dir);
    assert.equal(after.rounds[0].candidates.find((c) => c.id === ids[0]).audit, undefined);
    assert.ok(after.rounds[0].candidates.find((c) => c.id === ids[1]).audit, 'the untouched ones keep theirs');
    assert.equal(after.rounds[0].auditedOn, null);
    await assert.rejects(() => L.buildBoards(dir), /unaudited/);
  });

  test('a repeated id in the shortlist is recorded once', async () => {
    const { dir, ids } = await withThree('rev-dedupe');
    const res = await L.pickDirections(dir, [ids[0], ids[0], ids[1]]);
    assert.deepEqual(res.shortlist, [ids[0], ids[1]]);
    assert.equal(res.single, false);
  });

  test('a repeated id does not deal duplicate refinement slots', async () => {
    const { dir, ids } = await withThree('rev-dedupe-refine');
    await L.pickDirections(dir, [ids[0], ids[0]]);
    const res = await L.planRefinement(dir);
    const slotIds = res.slots.map((s2) => s2.id);
    assert.equal(new Set(slotIds).size, slotIds.length, `duplicate slot ids: ${slotIds.join(', ')}`);
  });

  test('a concept is found in whichever round holds it, once a refinement round exists', async () => {
    // After `refine`, the latest round is round two, and mastering a round-one
    // id failed with "round 2 has no concept called A1". True, unhelpful, and
    // the exact command somebody types next.
    const { dir, ids } = await withThree('rev-crossround');
    const state = await L.loadState(dir);
    for (const c of state.rounds[0].candidates) c.audit = { verdict: 'contender', findings: [], contexts: [] };
    await L.saveState(dir, state);
    await L.pickDirections(dir, [ids[0]]);
    await L.planRefinement(dir);
    const res = await L.promoteToMaster(dir, ids[0], { approvedBy: 'Jake', chrome: null });
    assert.equal(res.round, 1, 'it should have found the concept in round one');
  });

  test('an unknown concept id lists what the project actually has', async () => {
    const { dir } = await withThree('rev-unknown');
    await assert.rejects(() => L.promoteToMaster(dir, 'ZZ9'), /This project has:/);
  });
});
