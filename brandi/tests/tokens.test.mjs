import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../scripts/tokens.mjs';
import { buildSystem, resolveToken } from '../scripts/system.mjs';

const sys = buildSystem({
  primary: '#2563EB',
  accentCount: 2,
  type: { display: 'Fraunces', body: 'Source Sans 3', mono: 'JetBrains Mono' },
});

describe('DTCG output', () => {
  const dtcg = T.toDtcg(sys);

  test('declares the format it claims to follow', () => {
    assert.equal(dtcg.$schema, 'https://tr.designtokens.org/format/');
  });

  test('every leaf token has a $value', () => {
    let leaves = 0;
    const walk = (node, path) => {
      if (node && typeof node === 'object' && '$value' in node) {
        leaves++;
        assert.notEqual(node.$value, undefined, `${path} has no value`);
        return;
      }
      for (const [k, v] of Object.entries(node ?? {})) {
        if (k.startsWith('$')) continue;
        assert.equal(typeof v, 'object', `${path}.${k} should be a group or a token`);
        walk(v, `${path}.${k}`);
      }
    };
    walk({ color: dtcg.color, space: dtcg.space, radius: dtcg.radius, typography: dtcg.typography }, '');
    assert.ok(leaves > 100, `expected a real token set, found ${leaves} leaves`);
  });

  test('types are declared at the group level and inherited', () => {
    assert.equal(dtcg.color.$type, 'color');
    assert.equal(dtcg.space.$type, 'dimension');
    assert.equal(dtcg.duration.$type, 'duration');
    assert.equal(dtcg.easing.$type, 'cubicBezier');
    assert.equal(dtcg.typography.$type, 'typography');
    assert.equal(dtcg.color.brand['9'].$type, undefined, 'a leaf should inherit its group type');
  });

  test('dimensions follow the current spec by default', () => {
    assert.deepEqual(dtcg.space['16'].$value, { value: 16, unit: 'px' });
  });

  test('dimensions can be emitted as strings for older pipelines', () => {
    const legacy = T.toDtcg(sys, { dimensionStyle: 'string' });
    assert.equal(legacy.space['16'].$value, '16px');
    assert.equal(legacy.duration.base.$value, '200ms');
  });

  test('cubic beziers are four numbers, as the spec requires', () => {
    const v = dtcg.easing.standard.$value;
    assert.ok(Array.isArray(v) && v.length === 4, `got ${JSON.stringify(v)}`);
    assert.ok(v.every((n) => typeof n === 'number'));
  });

  test('composite typography tokens reference rather than duplicate', () => {
    const t = dtcg.typography.base.$value;
    assert.equal(t.fontSize, '{font.size.base}');
    assert.equal(t.lineHeight, '{font.lineHeight.base}');
    assert.equal(t.fontFamily, '{font.family.body}');
  });

  test('font families are arrays, as the spec requires', () => {
    assert.ok(Array.isArray(dtcg.font.family.body.$value));
  });

  test('the semantic tier is aliases, and dark aliases point at dark ramps', () => {
    assert.equal(dtcg.semantic.surface.page.$value, '{color.neutral.1}');
    assert.equal(dtcg['semantic-dark'].surface.page.$value, '{color.neutral-dark.1}');
  });

  test('every alias in the file resolves to a token that exists', () => {
    const get = (path) => path.split('.').reduce((o, k) => o?.[k], dtcg);
    const walk = (node, path) => {
      if (node && typeof node === 'object' && '$value' in node) {
        const vals = typeof node.$value === 'object' && !Array.isArray(node.$value)
          ? Object.values(node.$value)
          : [node.$value];
        for (const v of vals) {
          if (typeof v === 'string' && v.startsWith('{')) {
            const target = v.slice(1, -1);
            assert.ok(get(target), `${path} points at ${target}, which does not exist`);
          }
        }
        return;
      }
      for (const [k, v] of Object.entries(node ?? {})) {
        if (k.startsWith('$')) continue;
        walk(v, path ? `${path}.${k}` : k);
      }
    };
    walk(dtcg, '');
  });

  test('serialises to valid JSON', () => {
    assert.doesNotThrow(() => JSON.parse(JSON.stringify(dtcg)));
  });

  test('can omit dark entirely', () => {
    const lightOnly = T.toDtcg(sys, { includeDark: false });
    assert.equal(lightOnly['semantic-dark'], undefined);
    assert.equal(lightOnly.color['brand-dark'], undefined);
  });
});

describe('CSS output', () => {
  const css = T.toCss(sys);
  // Slice past the header comment so the selectors named in it are not mistaken
  // for the blocks themselves.
  const body = css.slice(css.indexOf('*/') + 2);
  const light = body.slice(body.indexOf(':root {'), body.indexOf('[data-theme="dark"]'));
  const dark = body.slice(body.indexOf('[data-theme="dark"]'), body.indexOf('@media (prefers-color-scheme'));

  test('declares both themes plus a system-preference fallback', () => {
    assert.match(css, /^:root \{/m);
    assert.match(css, /\[data-theme="dark"\] \{/);
    assert.match(css, /@media \(prefers-color-scheme: dark\)/);
    assert.match(css, /:root:not\(\[data-theme="light"\]\)/);
  });

  test('sets color-scheme in both themes so form controls follow', () => {
    assert.match(css, /color-scheme: light/);
    assert.match(css, /color-scheme: dark/);
  });

  test('semantic tokens point at primitives through var(), in both themes', () => {
    for (const block of [light, dark]) {
      assert.match(block, /--surface-page: var\(--color-neutral-1\);/);
      assert.match(block, /--text-primary: var\(--color-neutral-12\);/);
    }
  });

  test('each theme re-declares the primitive ramps with its own values', () => {
    const lightPage = /--color-neutral-1: (#[0-9A-F]{6})/.exec(light)[1];
    const darkPage = /--color-neutral-1: (#[0-9A-F]{6})/.exec(dark)[1];
    assert.notEqual(lightPage, darkPage);
    assert.equal(lightPage, sys.palettes.neutral.light.steps[0].hex);
    assert.equal(darkPage, sys.palettes.neutral.dark.steps[0].hex);
  });

  test('ships the accessibility defaults rather than assuming someone adds them', () => {
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
    assert.match(css, /:focus-visible \{/);
    assert.match(css, /outline: var\(--focus-ring-width\) solid var\(--focus-ring\)/);
    assert.match(css, /--focus-ring-width: 2px;/);
    assert.match(css, /--focus-ring-offset: 2px;/);
  });

  test('emits a measure so columns do not run to the window edge', () => {
    assert.match(css, /--measure: \d+ch;/);
  });

  test('honours a prefix', () => {
    const prefixed = T.toCss(sys, { prefix: 'acme' });
    assert.match(prefixed, /--acme-color-brand-9:/);
    assert.match(prefixed, /--acme-surface-page: var\(--acme-color-neutral-1\)/);
  });

  test('can emit oklch instead of hex', () => {
    const ok = T.toCss(sys, { colorFormat: 'oklch' });
    assert.match(ok, /--color-brand-9: oklch\(/);
  });

  test('has balanced braces', () => {
    const open = (css.match(/\{/g) ?? []).length;
    const close = (css.match(/\}/g) ?? []).length;
    assert.equal(open, close, 'unbalanced braces would break the whole stylesheet');
  });

  test('never emits an unresolved alias', () => {
    assert.equal(/\{color\./.test(css), false, 'a raw alias leaked into the CSS');
  });

  test('every var() reference has a matching declaration', () => {
    const declared = new Set([...css.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1]));
    const used = new Set([...css.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]));
    for (const u of used) assert.ok(declared.has(u), `${u} is used but never declared`);
  });
});

describe('Tailwind output', () => {
  const tw = T.toTailwind(sys);

  test('emits a v4 theme block, not a v3 JS config', () => {
    assert.match(tw, /@theme \{/);
    assert.match(tw, /@import "tailwindcss";/);
  });

  test('exposes semantic colours first', () => {
    assert.match(tw, /--color-surface-page: var\(--surface-page\);/);
    assert.match(tw, /--color-text-primary: var\(--text-primary\);/);
  });

  test('exposes the scales a utility class needs', () => {
    // Where Tailwind's namespace differs from the stylesheet's, this is a real
    // alias. Where they match, the value is carried literally: a token defined
    // as itself resolves only by accident of import order.
    assert.match(tw, /--spacing-16: var\(--space-16\);/);
    assert.match(tw, /--radius-md: \d+px;/);
    assert.match(tw, /--text-base: /);
    assert.match(tw, /--shadow-md: /);
  });

  test('no declaration is defined as itself', () => {
    const selfRef = [...tw.matchAll(/^\s*(--[\w-]+):\s*var\((--[\w-]+)\)\s*;/gm)].filter((m) => m[1] === m[2]);
    assert.deepEqual(selfRef.map((m) => m[1]), []);
  });

  test('its comments balance, so it is parseable CSS', () => {
    assert.equal((tw.match(/\/\*/g) ?? []).length, (tw.match(/\*\//g) ?? []).length);
  });

  test('has balanced braces', () => {
    assert.equal((tw.match(/\{/g) ?? []).length, (tw.match(/\}/g) ?? []).length);
  });
});

describe('TypeScript output', () => {
  const ts = T.toTypeScript(sys);

  test('is a const assertion with types', () => {
    assert.match(ts, /export const tokens = \{/);
    assert.match(ts, /\} as const;/);
    assert.match(ts, /export type SemanticToken/);
  });

  test('resolves semantic aliases to real values, since JS cannot follow var()', () => {
    const body = JSON.parse(ts.slice(ts.indexOf('{'), ts.lastIndexOf('} as const;') + 1));
    assert.match(body.semantic.light['surface.page'], /^#[0-9A-F]{6}$/i);
    assert.match(body.semantic.dark['surface.page'], /^#[0-9A-F]{6}$/i);
    assert.notEqual(body.semantic.light['surface.page'], body.semantic.dark['surface.page']);
  });

  test('carries both themes for every colour family', () => {
    const body = JSON.parse(ts.slice(ts.indexOf('{'), ts.lastIndexOf('} as const;') + 1));
    for (const family of Object.keys(sys.palettes)) {
      assert.ok(body.color[family].light['9']);
      assert.ok(body.color[family].dark['9']);
    }
  });
});

describe('cross-format agreement', () => {
  test('the same token has the same value in every format', () => {
    const dtcg = T.toDtcg(sys);
    const css = T.toCss(sys);
    const ts = JSON.parse(T.toTypeScript(sys).slice(T.toTypeScript(sys).indexOf('{'), T.toTypeScript(sys).lastIndexOf('} as const;') + 1));
    const brand9 = sys.palettes.brand.light.steps[8].hex;
    assert.equal(dtcg.color.brand['9'].$value, brand9);
    assert.match(css, new RegExp(`--color-brand-9: ${brand9};`));
    assert.equal(ts.color.brand.light['9'], brand9);
    assert.equal(resolveToken(sys.semantic.light['accent.solid'], sys, 'light'), brand9);
  });
});

describe('generated output stays readable', () => {
  test('carries no em dashes, which do not belong in generated code', () => {
    for (const [name, out] of [
      ['css', T.toCss(sys)],
      ['tailwind', T.toTailwind(sys)],
      ['ts', T.toTypeScript(sys)],
      ['dtcg', JSON.stringify(T.toDtcg(sys))],
    ]) {
      assert.equal(out.includes('—'), false, `${name} contains an em dash`);
    }
  });

  test('explains the tier rule in the stylesheet itself', () => {
    assert.match(T.toCss(sys), /semantic/i);
    assert.match(T.toCss(sys), /Generated by Brandi/);
  });
});

describe('letter spacing units', () => {
  test('defaults to em, which is the right typographic unit even though the spec forbids it', () => {
    const d = T.toDtcg(sys);
    assert.deepEqual(d.font.letterSpacing.base.$value, {
      value: Number(sys.type.scale.byName.base.letterSpacing.replace('em', '')),
      unit: 'em',
    });
  });

  test('can emit spec-conformant rem, converted at the step size, and says so', () => {
    const d = T.toDtcg(sys, { letterSpacingUnit: 'rem' });
    const step = sys.type.scale.byName.base;
    const em = Number(step.letterSpacing.replace('em', ''));
    assert.equal(d.font.letterSpacing.base.$value.unit, 'rem');
    assert.ok(Math.abs(d.font.letterSpacing.base.$value.value - (em * step.px) / 16) < 1e-5);
    assert.match(d.font.letterSpacing.base.$description, /Exact at that size only/);
  });

  test('every dimension unit is one the spec permits when rem is chosen', () => {
    const d = T.toDtcg(sys, { letterSpacingUnit: 'rem' });
    const units = new Set();
    const walk = (node) => {
      if (node && typeof node === 'object' && '$value' in node) {
        if (node.$value?.unit) units.add(node.$value.unit);
        return;
      }
      for (const [k, v] of Object.entries(node ?? {})) {
        if (!k.startsWith('$')) walk(v);
      }
    };
    walk({ space: d.space, radius: d.radius, font: d.font });
    for (const u of units) assert.ok(['px', 'rem'].includes(u), `${u} is not a permitted dimension unit`);
  });

  test('rejects a unit that is neither', () => {
    assert.throws(() => T.toDtcg(sys, { letterSpacingUnit: 'pt' }), TypeError);
  });
});
