import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../scripts/logospec.mjs';
import { BANNED_FONTS, DEFAULT_FONTS } from '../scripts/canvas.mjs';

describe('the taxonomies are internally consistent', () => {
  test('every architecture rates every application context', () => {
    const ids = L.CONTEXTS.map((c) => c.id).sort();
    for (const a of L.ARCHITECTURES) {
      assert.deepEqual(Object.keys(a.contexts).sort(), ids, `${a.id} does not rate every context`);
    }
  });

  test('every context rating is a known verdict', () => {
    for (const a of L.ARCHITECTURES) {
      for (const [ctx, verdict] of Object.entries(a.contexts)) {
        assert.ok(['pass', 'cond', 'fallback'].includes(verdict), `${a.id}/${ctx} is ${verdict}`);
      }
    }
  });

  test('every architecture names fallbacks that exist', () => {
    const ids = L.ARCHITECTURES.map((a) => a.id);
    for (const a of L.ARCHITECTURES) {
      for (const f of a.needsFallback) assert.ok(ids.includes(f), `${a.id} falls back to unknown ${f}`);
    }
  });

  test('exactly one architecture is the default', () => {
    assert.equal(L.ARCHITECTURES.filter((a) => a.isDefault).length, 1);
  });

  test('no register offers a face the anti-slop contract refuses', () => {
    const refused = [...BANNED_FONTS, ...DEFAULT_FONTS].map((f) => f.toLowerCase());
    for (const r of L.REGISTERS) {
      for (const f of r.faces) {
        assert.ok(!refused.includes(f.toLowerCase()), `${r.id} offers ${f}, which the contract refuses`);
      }
    }
  });

  test('every face listed as refused really is refused by the contract', () => {
    for (const r of L.REGISTERS) {
      for (const f of r.refused) {
        assert.ok(L.isRefusedFace(f), `${r.id} lists ${f} as refused, but the contract permits it`);
      }
    }
  });

  test('every register offers at least three usable faces', () => {
    for (const r of L.REGISTERS) {
      assert.ok(r.faces.length >= 3, `${r.id} offers only ${r.faces.length}`);
    }
  });

  test('no face appears in two registers, which would blur the distinction', () => {
    const seen = new Map();
    for (const r of L.REGISTERS) {
      for (const f of r.faces) {
        assert.ok(!seen.has(f), `${f} is in both ${seen.get(f)} and ${r.id}`);
        seen.set(f, r.id);
      }
    }
  });

  test('every category default names a real register and a real approach', () => {
    const regs = L.REGISTERS.map((r) => r.id);
    const apps = L.SYMBOL_APPROACHES.map((a) => a.id);
    for (const [id, c] of Object.entries(L.CATEGORIES)) {
      assert.ok(regs.includes(c.register), `${id} defaults to unknown register ${c.register}`);
      assert.ok(regs.includes(c.break), `${id} breaks to unknown register ${c.break}`);
      assert.ok(apps.includes(c.approach), `${id} defaults to unknown approach ${c.approach}`);
      assert.notEqual(c.register, c.break, `${id} breaks to its own default, which is not a break`);
    }
  });

  test('every family names a real architecture and real approaches', () => {
    const archs = L.ARCHITECTURES.map((a) => a.id);
    const apps = L.SYMBOL_APPROACHES.map((a) => a.id);
    for (const f of L.FAMILIES) {
      for (const a of f.architecture ? [f.architecture] : f.architectures) {
        assert.ok(archs.includes(a), `${f.id} uses unknown architecture ${a}`);
      }
      for (const a of f.approaches) {
        if (a !== null) assert.ok(apps.includes(a), `${f.id} uses unknown approach ${a}`);
      }
    }
  });

  test('the binding constraints are the tightest ones', () => {
    const digital = L.CONTEXTS.filter((c) => c.minStrokeRatio && /px/.test(c.at)).map((c) => c.minStrokeRatio);
    assert.equal(L.CONSTRAINTS.minStrokeRatioDigital, Math.max(...digital), 'the favicon must be the binding digital constraint');
    const physical = L.CONTEXTS.filter((c) => c.minStrokeRatio && /mm/.test(c.at)).map((c) => c.minStrokeRatio);
    assert.equal(L.CONSTRAINTS.minStrokeRatioPhysical, Math.max(...physical), 'embroidery must be the binding physical constraint');
  });

  test('gradients fail enough contexts to be a refusal rather than a warning', () => {
    const fails = L.CONTEXTS.filter((c) => c.gradients === false).length;
    assert.ok(fails >= 5, `gradients fail only ${fails} of ${L.CONTEXTS.length}`);
    assert.equal(L.CONSTRAINTS.gradientsAllowed, false);
  });
});

describe('categories and cliches', () => {
  test('a known category resolves to itself', () => {
    assert.equal(L.categoryDefaults('legal').id, 'legal');
    assert.equal(L.categoryDefaults('LEGAL').id, 'legal');
  });

  test('free text is matched on a contained keyword', () => {
    assert.equal(L.categoryDefaults('structural engineering practice').id, 'engineering');
    assert.equal(L.categoryDefaults('dog grooming for pets').id, 'pets');
  });

  test('the words people actually use for their business resolve', () => {
    // Nobody says "pets". Matching only on the taxonomy key sent a dog groomer
    // to the generic bucket, so it was never told not to draw a paw print.
    const cases = {
      'dog grooming': 'pets',
      'mobile dog wash': 'pets',
      'a veterinary clinic': 'pets',
      'conveyancing lawyers': 'legal',
      'specialty coffee roaster': 'food',
      'a bookkeeping practice': 'finance',
      'cyber security consultancy': 'security',
      'a design studio': 'marketing',
      'plumbing and gasfitting': 'trades',
      'residential builder': 'construction',
      'pilates studio': 'fitness',
    };
    for (const [given, want] of Object.entries(cases)) {
      assert.equal(L.categoryDefaults(given).id, want, `${given} should resolve to ${want}`);
    }
  });

  test('a dog groomer is told not to draw a paw print', () => {
    assert.ok(L.clichesFor('dog grooming').includes('paw print'));
  });

  test('every alias points at a real category', () => {
    for (const [id, words] of Object.entries(L.CATEGORY_ALIASES)) {
      assert.ok(L.CATEGORIES[id], `${id} is not a category`);
      assert.ok(words.length > 0, `${id} has no aliases`);
      for (const w of words) assert.equal(w, w.toLowerCase(), `${w} must be lower case to match`);
    }
  });

  test('an unrecognised category falls back rather than throwing', () => {
    assert.equal(L.categoryDefaults('interpretive dance').id, 'general');
    assert.equal(L.categoryDefaults(null).id, 'general');
    assert.equal(L.categoryDefaults('').id, 'general');
  });

  test('universal cliches apply to every category', () => {
    for (const cat of ['legal', 'saas', 'general', 'outdoor']) {
      assert.ok(L.clichesFor(cat).includes('swoosh'), `${cat} should refuse a swoosh`);
    }
  });

  test('category cliches are added to the universal ones', () => {
    const legal = L.clichesFor('legal');
    assert.ok(legal.includes('gavel'));
    assert.ok(!L.clichesFor('saas').includes('gavel'), 'a gavel is only a legal cliche');
    assert.ok(L.clichesFor('saas').includes('hexagon'));
  });

  test('allowFor overrides a ban for the category that owns the motif', () => {
    assert.ok(L.clichesFor('wellness').includes('mountain as aspiration'));
    assert.ok(!L.clichesFor('outdoor').includes('mountain as aspiration'), 'an outdoor brand may draw a specific peak');
  });

  test('every cliche has at least one category it is banned for', () => {
    for (const c of L.CLICHES) assert.ok(c.banFor.length > 0, `${c.motif} bans nothing`);
  });
});

describe('name typing', () => {
  test('a two word descriptive name is descriptive', () => {
    assert.equal(L.nameType('Atlas Coffee'), 'descriptive');
  });

  test('a single concrete word is concrete', () => {
    assert.equal(L.nameType('Anchor'), 'concrete');
    assert.equal(L.nameType('Forge'), 'concrete');
  });

  test('three words or a long single word is long', () => {
    assert.equal(L.nameType('North Shore Structural Engineering'), 'long');
    assert.equal(L.nameType('Consolidations'), 'long');
  });

  test('an ampersand or a partnership word is a founder name', () => {
    assert.equal(L.nameType('Hale & Byrne'), 'founder');
    assert.equal(L.nameType('Ward Associates'), 'founder');
  });

  test('an empty name does not throw', () => {
    assert.equal(L.nameType(''), 'abstract');
    assert.equal(L.nameType(null), 'abstract');
    assert.equal(L.nameType(undefined), 'abstract');
  });
});

describe('the planner deals a hand that cannot converge', () => {
  const brief = { name: 'Muddy Paws', category: 'pets', oneLiner: 'A dog grooming shop.' };

  test('it deals the requested number of slots', () => {
    for (const n of [4, 6, 8, 12, 16, 24]) {
      assert.equal(L.planConcepts(brief, { count: n }).slots.length, n);
    }
  });

  test('a silly count is clamped rather than obeyed', () => {
    assert.equal(L.planConcepts(brief, { count: 1 }).slots.length, 4);
    assert.equal(L.planConcepts(brief, { count: 500 }).slots.length, 24);
    assert.equal(L.planConcepts(brief, { count: 0 }).slots.length, 4);
  });

  test('families are filled round robin, so none is starved', () => {
    const plan = L.planConcepts(brief, { count: 12 });
    const counts = {};
    for (const s of plan.slots) counts[s.family] = (counts[s.family] ?? 0) + 1;
    assert.deepEqual(Object.values(counts), [3, 3, 3, 3]);
    assert.equal(Object.keys(counts).length, L.FAMILIES.length);
  });

  test('no two slots share a register and symbol approach pair', () => {
    // The property that makes this a range rather than twelve of one idea.
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      for (const n of [8, 12, 16, 24]) {
        const plan = L.planConcepts(brief, { count: n, seed });
        const pairs = plan.slots.map((s) => `${s.register}|${s.symbolApproach}`);
        assert.equal(new Set(pairs).size, pairs.length, `seed ${seed} count ${n} repeated a pair: ${pairs.join(', ')}`);
      }
    }
  });

  test('a founder name at the largest count does not repeat a pair', () => {
    // The exact case the sweep above missed. `literal` does not suit a founder
    // name, so the symbolic family collapses to `letterform-derived` alone,
    // which the letterform family is also drawing from: seven registers cannot
    // cover twelve slots and the planner used to fall through to a duplicate
    // without saying anything.
    for (const seed of ['0', '1', '2', '3']) {
      for (const n of [20, 24]) {
        const plan = L.planConcepts({ name: 'Hale & Byrne', category: 'legal' }, { count: n, seed });
        const pairs = plan.slots.map((s) => `${s.register}|${s.symbolApproach}`);
        assert.equal(new Set(pairs).size, pairs.length, `seed ${seed} count ${n} repeated a pair`);
        assert.deepEqual(plan.repeatedPairs, []);
      }
    }
  });

  test('the guarantee holds across every name shape, category, count and seed', () => {
    // A property sweep rather than a handful of cases, because the last two
    // defects here were both invisible to a sample that happened to miss them.
    const names = ['', 'X', 'A'.repeat(200), 'Muddy Paws', 'Hale & Byrne', 'Ward Associates',
      'Consolidations', '\u{1F600}\u{1F680}', '!!!', '   ', 'O', 'Ridgeline'];
    const cats = [...Object.keys(L.CATEGORIES), 'dog grooming', 'interpretive dance', '', null];
    const registers = new Set(L.REGISTERS.map((r) => r.id));
    let checked = 0;
    for (const name of names) {
      for (const category of cats) {
        for (const seed of ['p', 'q', 'r']) {
          for (const count of [4, 12, 20, 24]) {
            const plan = L.planConcepts({ name, category }, { count, seed });
            checked++;
            const pairs = plan.slots.map((s) => `${s.register}|${s.symbolApproach}`);
            assert.equal(new Set(pairs).size, pairs.length,
              `${JSON.stringify({ name, category, count, seed })} repeated a pair`);
            assert.deepEqual(plan.repeatedPairs, [], `${JSON.stringify({ name, category, count, seed })} reported exhaustion`);
            for (const slot of plan.slots) {
              assert.ok(registers.has(slot.register), `${slot.id} has unknown register ${slot.register}`);
              assert.ok(slot.faces.length > 0, `${slot.id} has no face to set the name in`);
              for (const f of slot.faces) assert.ok(!L.isRefusedFace(f), `${slot.id} offers refused face ${f}`);
            }
          }
        }
      }
    }
    assert.ok(checked > 2000, `only ${checked} plans were checked`);
  });

  test('the same brief always deals the same hand', () => {
    const a = L.planConcepts(brief, { count: 12 });
    const b = L.planConcepts(brief, { count: 12 });
    assert.deepEqual(a.slots, b.slots);
  });

  test('a different seed deals a different hand', () => {
    const a = L.planConcepts(brief, { count: 12, seed: 'one' });
    const b = L.planConcepts(brief, { count: 12, seed: 'two' });
    assert.notDeepEqual(a.slots.map((s) => s.register), b.slots.map((s) => s.register));
  });

  test('a different brand deals a different hand', () => {
    const a = L.planConcepts({ name: 'Muddy Paws', category: 'pets' }, { count: 12 });
    const b = L.planConcepts({ name: 'Hale & Byrne', category: 'legal' }, { count: 12 });
    assert.notDeepEqual(a.slots.map((s) => s.register), b.slots.map((s) => s.register));
  });

  test('the category default register is used, but sparingly', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      const plan = L.planConcepts(brief, { count: 12, seed });
      const inCat = plan.slots.filter((s) => s.inCategory).length;
      assert.ok(inCat <= 2, `${inCat} slots sat in the category default, which is a round with no position`);
      assert.ok(inCat >= 1, 'a round entirely outside the category convention is a costume party');
    }
  });

  test('the cap still roughly holds at the largest round', () => {
    const inCat = L.planConcepts(brief, { count: 24 }).slots.filter((s) => s.inCategory).length;
    assert.ok(inCat <= 4, `${inCat} of 24 sat in the category default`);
  });

  test('most of the round is deliberately outside the category default', () => {
    for (const seed of ['a', 'b', 'c', 'd']) {
      const plan = L.planConcepts(brief, { count: 12, seed });
      const out = plan.slots.filter((s) => !s.inCategory).length;
      assert.ok(out >= 12 / 3, `only ${out} of 12 broke the category convention`);
    }
  });

  test('no slot offers a refused face', () => {
    for (const seed of ['a', 'b', 'c']) {
      for (const s of L.planConcepts(brief, { count: 24, seed }).slots) {
        for (const f of s.faces) assert.ok(!L.isRefusedFace(f), `${s.id} offers refused face ${f}`);
        assert.ok(s.faces.length > 0, `${s.id} has no face to set the name in`);
      }
    }
  });

  test('every slot carries the category cliche list', () => {
    const plan = L.planConcepts({ name: 'Ward Legal', category: 'legal' }, { count: 8 });
    for (const s of plan.slots) {
      assert.ok(s.mustNotBe.includes('gavel'));
      assert.ok(s.mustNotBe.includes('swoosh'));
    }
  });

  test('every slot names a small grade asset to build first', () => {
    for (const s of L.planConcepts(brief, { count: 12 }).slots) {
      assert.ok(s.smallGrade, `${s.id} has no small grade asset`);
    }
  });

  test('slot ids are unique and readable', () => {
    const ids = L.planConcepts(brief, { count: 12 }).slots.map((s) => s.id);
    assert.equal(new Set(ids).size, 12);
    assert.match(ids[0], /^[A-D]\d$/);
  });

  test('the wordmark family carries no symbol', () => {
    for (const s of L.planConcepts(brief, { count: 12 }).slots) {
      if (s.family === 'wordmark') assert.equal(s.symbolApproach, null);
      else assert.ok(s.symbolApproach, `${s.id} in ${s.family} has no approach`);
    }
  });

  test('a brief with nothing in it still plans', () => {
    const plan = L.planConcepts({}, { count: 8 });
    assert.equal(plan.slots.length, 8);
    assert.equal(plan.name, 'Brand');
    assert.equal(plan.category, 'general');
  });

  test('the round carries the rules that govern every slot', () => {
    const plan = L.planConcepts(brief, { count: 8 });
    assert.ok(plan.rules.some((r) => /small-grade|small grade/i.test(r)), 'the smallest-first rule must be stated');
    assert.ok(plan.rules.some((r) => /black on white/i.test(r)), 'the black-first rule must be stated');
  });
});

describe('the slot brief is self contained', () => {
  const brief = { name: 'Muddy Paws', category: 'pets', oneLiner: 'A dog grooming shop.', audience: 'Local dog owners.' };
  const plan = L.planConcepts(brief, { count: 12 });

  test('it names the brand, the architecture, the register and the faces', () => {
    const text = L.slotBrief(plan.slots[0], brief);
    assert.match(text, /Muddy Paws/);
    assert.match(text, /Architecture:/);
    assert.match(text, /Typographic register:/);
    for (const f of plan.slots[0].faces) assert.ok(text.includes(f), `the brief omits ${f}`);
  });

  test('it never mentions another slot', () => {
    // An agent that can see the rest of the round converges on it. This is the
    // other half of the anti-convergence mechanism, and it is easy to break by
    // helpfully adding context.
    for (const slot of plan.slots) {
      const text = L.slotBrief(slot, brief);
      for (const other of plan.slots) {
        if (other.id === slot.id) continue;
        assert.ok(!text.includes(`Concept ${other.id}`), `${slot.id} leaks ${other.id}`);
      }
    }
  });

  test('it lists the refused motifs', () => {
    const text = L.slotBrief(plan.slots[0], brief);
    assert.match(text, /Refused outright/);
    assert.match(text, /swoosh/);
    assert.match(text, /paw print/, 'a pet brand must be told not to draw a paw print');
  });

  test('it refuses gradients, live text and rasters every time', () => {
    for (const slot of plan.slots) {
      const text = L.slotBrief(slot, brief);
      assert.match(text, /gradient/i);
      assert.match(text, /live text/i);
      assert.match(text, /raster/i);
    }
  });

  test('it states the smallest-first rule', () => {
    for (const slot of plan.slots) {
      assert.match(L.slotBrief(slot, brief), /FIRST, at 16 pixels/);
    }
  });

  test('a brief with no optional fields still produces usable text', () => {
    const text = L.slotBrief(plan.slots[0], { name: 'X' });
    assert.ok(text.length > 200);
    assert.ok(!text.includes('undefined'));
    assert.ok(!text.includes('null'));
  });
});


describe('refinement is not a second concept round', () => {
  const candidate = {
    id: 'B2',
    file: 'brand/logo/concepts/round-01/B2.svg',
    family: 'letterform',
    architecture: 'monogram',
    architectureName: 'Monogram',
    register: 'display-drawn',
    registerName: 'Drawn display',
    symbolApproach: 'letterform-derived',
    signals: 'A wordmark nobody else has.',
    mustNotBe: ['swoosh', 'gear or cog'],
  };

  test('every task carries over to a slot, with a stable id', () => {
    const slots = L.refinementSlots(candidate);
    assert.equal(slots.length, L.REFINEMENT_TASKS.length);
    assert.deepEqual(slots.map((s) => s.id), L.REFINEMENT_TASKS.map((t) => `B2${t.suffix}`));
    assert.equal(new Set(slots.map((s) => s.id)).size, slots.length);
  });

  test('every slot records what it refines and where that file is', () => {
    for (const slot of L.refinementSlots(candidate)) {
      assert.equal(slot.refines, 'B2');
      assert.equal(slot.refinesFile, candidate.file);
    }
  });

  test('the small-grade redraw is dealt first, because it decides whether the direction survives at all', () => {
    assert.equal(L.REFINEMENT_TASKS[0].suffix, 'sm');
    assert.match(L.REFINEMENT_TASKS[0].task, /redraw/i);
    assert.match(L.REFINEMENT_TASKS[0].task, /not a scale-down/i);
  });

  test('every task states its gate', () => {
    for (const t of L.REFINEMENT_TASKS) {
      assert.ok(t.gate && t.gate.length > 20, `${t.suffix} has no usable gate`);
      assert.ok(t.name && t.task);
    }
  });

  test('the architecture, register and approach carry over unchanged', () => {
    for (const slot of L.refinementSlots(candidate)) {
      assert.equal(slot.architecture, 'monogram');
      assert.equal(slot.register, 'display-drawn');
      assert.equal(slot.symbolApproach, 'letterform-derived');
    }
  });

  test('the brief points at the file and says it is not the agent\'s own idea', () => {
    const text = L.refinementBrief(L.refinementSlots(candidate)[0], { name: 'Ridgeline' });
    assert.match(text, /brand\/logo\/concepts\/round-01\/B2\.svg/);
    assert.match(text, /not your idea/);
    assert.match(text, /recognise as the same mark/);
    assert.match(text, /Ridgeline/);
  });

  test('the brief still carries the refusal list', () => {
    const text = L.refinementBrief(L.refinementSlots(candidate)[0], { name: 'X' });
    assert.match(text, /Still refused/);
    assert.match(text, /gear or cog/);
  });

  test('the brief still forbids gradients, live text and rasters', () => {
    for (const slot of L.refinementSlots(candidate)) {
      const text = L.refinementBrief(slot, { name: 'X' });
      assert.match(text, /no gradient/);
      assert.match(text, /no live text/);
      assert.match(text, /no raster/);
    }
  });

  test('a candidate with almost nothing on it still produces usable briefs', () => {
    const text = L.refinementBrief(L.refinementSlots({ id: 'A1' })[0], {});
    assert.ok(text.length > 200);
    assert.ok(!text.includes('undefined'));
    assert.ok(!text.includes('null'));
  });
});
