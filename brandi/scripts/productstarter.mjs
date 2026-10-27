/**
 * Brandi product layer: the starter a product is built from, and the bundle the canvas mounts.
 *
 * `brandi product starter` copies the kit (brandi/product/kit) into product/starter, then writes the
 * files the system owns: its tokens, its identity, globals.css, the market's locale, the product's
 * name and the brand's faces through next/font. A second run rewrites only those generated files, so
 * whatever a product has added survives; --kit copies the kit's own folders again as well.
 *
 * `brandi product bundle` builds the canvas bundle from the starter's own components (one
 * implementation, built twice) and writes every component's Design System card and preview from its
 * one definition.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { spawnSync } from 'node:child_process';

import { toStarterGlobals } from './productglobals.mjs';
import { hostedFontsUrl, loadDefinitions, checkDefinition, componentReadme, previewBoard, previewPage, typesFile } from './productdocs.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
export const KIT = path.resolve(here, '..', 'product', 'kit');
export const GLOBALS_SOURCE = path.join(here, 'productglobals.mjs');
export const PLATFORM_SPECS = path.resolve(here, '..', 'product', 'platform');

// Files and folders a product makes for itself, never copied from the kit.
const NOT_FROM_KIT = new Set(['node_modules', '.next', 'system', 'next-env.d.ts', 'tsconfig.tsbuildinfo']);
const GENERATED = ['system/tokens.json', 'system/system.json', 'app/globals.css', 'lib/format-locale.js', 'lib/product.ts', 'app/fonts.ts', 'tools/build-globals.mjs'];

const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);
const pascal = (s) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('').replace(/^(\d)/, 'S$1');

/**
 * Who the system is: its display name, the canvas folder (namespace), the bundle's global, the
 * market's locale and currency, the language its copy is in, and its version. product.json can set
 * any of them; the rest come from the brand's name.
 */
export function systemIdentity(config = {}, { brandName } = {}) {
  const name = config.productName ?? brandName ?? config.name ?? 'Product';
  const namespace = config.namespace ?? (slug(brandName ?? name) || 'product');
  const global = config.global ?? (pascal(brandName ?? name) || 'Product');
  if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(namespace)) throw new RangeError(`namespace ${JSON.stringify(namespace)} must be lower case letters, digits, _ and -`);
  if (!/^[A-Z][A-Za-z0-9]*$/.test(global)) throw new RangeError(`global ${JSON.stringify(global)} must be PascalCase, such as Acme`);
  const locale = config.locale ?? 'en-AU';
  return {
    name,
    namespace,
    global,
    version: config.version ?? '0.1.0',
    locale,
    currency: config.currency ?? 'AUD',
    lang: config.lang ?? locale,
  };
}

const GENERIC = /^(ui-[a-z-]+|system-ui|-apple-system|serif|sans-serif|monospace|Georgia|"Times New Roman"|Arial|"Segoe UI"|Menlo|Consolas|"SF Mono")$/i;
const ROLE_VAR = { sans: '--font-brand-sans', display: '--font-brand-display', mono: '--font-brand-mono' };

/** The weights the type styles ask of each family role, so next/font loads what is used and nothing else. */
function weightsFor(tokens, role) {
  const out = new Set();
  for (const g of tokens.type?.groups ?? []) {
    for (const s of g.styles) if ((s.family ?? g.family) === role) out.add(String(s.fontWeight ?? 400));
  }
  if (!out.size) out.add('400');
  return [...out].sort();
}

/**
 * app/fonts.ts: the brand's faces through next/font, each setting the variable the generated theme
 * reads. A face the system ships as a file loads through next/font/local; a hosted face through
 * next/font/google. A role whose stack starts with a system face sets nothing.
 */
export function fontsModule(tokens) {
  const families = tokens.type?.families ?? {};
  const shipped = tokens.type?.fonts ?? [];
  const imports = new Set();
  const decls = [];
  const vars = [];
  for (const role of ['sans', 'display', 'mono']) {
    const first = String(families[role] ?? '').split(',')[0].trim();
    if (!first || GENERIC.test(first)) continue;
    const face = first.replace(/^["']|["']$/g, '');
    const id = `${role}Face`;
    const files = shipped.filter((f) => f.family === face);
    if (files.length) {
      imports.add('import localFont from "next/font/local"');
      const src = files.map((f) => `{ path: "./fonts/${path.basename(f.file)}", weight: "${f.weight ?? 400}", style: "${f.style ?? 'normal'}" }`).join(', ');
      decls.push(`const ${id} = localFont({ src: [${src}], variable: "${ROLE_VAR[role]}", display: "swap" })`);
    } else {
      const loader = face.replace(/[^A-Za-z0-9]+/g, '_');
      imports.add(`import { ${loader} } from "next/font/google"`);
      decls.push(`const ${id} = ${loader}({ subsets: ["latin"], weight: ${JSON.stringify(weightsFor(tokens, role))}, variable: "${ROLE_VAR[role]}", display: "swap" })`);
    }
    vars.push(`${id}.variable`);
  }
  return [
    '// The brand\'s faces through next/font, generated by `brandi product starter`. Each sets the variable the generated theme',
    '// reads (--font-brand-sans, --font-brand-display, --font-brand-mono). Regenerate rather than edit.',
    ...[...imports].sort(),
    '',
    ...decls,
    '',
    `export const fontVariables = [${vars.join(', ')}].join(" ")`,
    '',
  ].join('\n');
}

/** Every file the system owns in a starter, as path -> content. */
export function generatedFiles(tokens, identity) {
  return new Map([
    ['system/tokens.json', `${JSON.stringify(tokens, null, 2)}\n`],
    ['system/system.json', `${JSON.stringify({ ...identity, fontsUrl: hostedFontsUrl(tokens) }, null, 2)}\n`],
    ['app/globals.css', toStarterGlobals(tokens)],
    ['lib/format-locale.js', `// The market's locale and currency. \`brandi product starter\` writes this file from the system.\nexport const LOCALE = ${JSON.stringify(identity.locale)}\nexport const CURRENCY = ${JSON.stringify(identity.currency)}\n`],
    ['lib/product.ts', `// The product's name and language, set once. \`brandi product starter\` writes this file.\nexport const PRODUCT = { name: ${JSON.stringify(identity.name)}, lang: ${JSON.stringify(identity.lang)} } as const\n`],
    ['app/fonts.ts', fontsModule(tokens)],
    ['tools/build-globals.mjs', readFileSync(GLOBALS_SOURCE, 'utf8')],
  ]);
}

/**
 * Write or refresh a starter. A fresh folder gets the whole kit; an existing one gets only the
 * generated files unless `refreshKit`. Font files the tokens ship are copied in from `fontsDir`.
 */
export async function writeStarter({ out, tokens, identity, kit = KIT, refreshKit = false, fontsDir = null, platformOut = null }) {
  const fresh = !existsSync(path.join(out, 'package.json'));
  const written = [];
  if (fresh || refreshKit) {
    mkdirSync(out, { recursive: true });
    for (const entry of readdirSync(kit)) {
      if (NOT_FROM_KIT.has(entry)) continue;
      cpSync(path.join(kit, entry), path.join(out, entry), { recursive: true, force: true, filter: (src) => !src.includes(`${path.sep}node_modules`) && !src.includes(`${path.sep}canvas${path.sep}dist`) });
      written.push(entry);
    }
  }
  for (const [rel, content] of generatedFiles(tokens, identity)) {
    const file = path.join(out, rel);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, content);
    written.push(rel);
  }
  for (const f of tokens.type?.fonts ?? []) {
    const from = fontsDir ? path.join(fontsDir, path.basename(f.file)) : null;
    if (from && existsSync(from)) {
      mkdirSync(path.join(out, 'app', 'fonts'), { recursive: true });
      copyFileSync(from, path.join(out, 'app', 'fonts', path.basename(f.file)));
      written.push(`app/fonts/${path.basename(f.file)}`);
    }
  }
  // The platform specs travel with the kit: a product starts from the kit's and owns its copies,
  // because each product's stamps move on their own schedule.
  if (platformOut && existsSync(PLATFORM_SPECS) && !existsSync(platformOut)) {
    cpSync(PLATFORM_SPECS, platformOut, { recursive: true });
    written.push(path.relative(path.dirname(out), platformOut) || 'platform');
  }
  const { writeIndex } = await import(pathToFileURL(path.join(out, 'tools', 'build-index.mjs')).href);
  writeIndex(out);
  written.push('components/system/index.ts');
  return { fresh, written };
}

/**
 * Build the canvas bundle in the starter, then write every component's card and preview from its
 * definition, and install the built system beside the canvas boards so local previews and the gates
 * render what a canvas will. Throws, with what to do, when the starter is not installed.
 */
export async function buildBundle({ starter, productDir }) {
  if (!existsSync(path.join(starter, 'node_modules', 'esbuild'))) {
    throw new Error(`${starter} has no node_modules. Run npm install there first: the bundle is built with the starter's own esbuild and Tailwind.`);
  }
  const system = JSON.parse(readFileSync(path.join(starter, 'system', 'system.json'), 'utf8'));
  const run = spawnSync(process.execPath, ['tools/build-canvas.mjs'], { cwd: starter, encoding: 'utf8' });
  if (run.status !== 0) throw new Error(`The canvas bundle did not build:\n${(run.stderr || run.stdout).trim()}`);
  const dist = path.join(starter, 'canvas', 'dist');
  const components = path.join(productDir, 'components');
  mkdirSync(components, { recursive: true });
  for (const f of ['bundle.js', 'bundle.css', 'manifest.json']) copyFileSync(path.join(dist, f), path.join(components, f));
  const manifest = JSON.parse(readFileSync(path.join(dist, 'manifest.json'), 'utf8'));
  if (readFileSync(path.join(dist, 'bundle.js'), 'utf8').match(/<\/script/i)) throw new Error('bundle.js holds a literal </script, which the Design System refuses.');

  const defs = await loadDefinitions(path.join(starter, 'components', 'system'));
  const problems = defs.flatMap(checkDefinition);
  const exported = new Set(manifest.exports);
  for (const d of defs) if (!exported.has(d.name)) problems.push(`${d.file}: ${d.name} has a definition but the bundle exports no ${d.name}`);
  if (problems.length) throw new Error(`Definitions are not ready:\n  ${problems.join('\n  ')}`);

  // The type file, from the same definitions, compiled on its own under strict TypeScript.
  const icons = [...readFileSync(path.join(starter, 'lib', 'icons.ts'), 'utf8').matchAll(/^  ([A-Z][A-Za-z0-9]*),$/gm)].map((m) => m[1]);
  const uniqueIcons = [...new Set(icons)].sort();
  const { NUMBER_STYLES } = await import(pathToFileURL(path.join(starter, 'lib', 'format.js')).href);
  writeFileSync(path.join(components, 'index.d.ts'), typesFile(defs, system, { icons: uniqueIcons, numberStyles: [...NUMBER_STYLES] }));
  const tsc = path.join(starter, 'node_modules', '.bin', 'tsc');
  if (existsSync(tsc)) {
    const check = spawnSync(tsc, ['--noEmit', '--strict', '--skipLibCheck', '--jsx', 'react-jsx', '--moduleResolution', 'bundler', '--module', 'esnext', '--target', 'es2020', '--types', 'react', '--typeRoots', path.join(starter, 'node_modules', '@types'), path.join(components, 'index.d.ts')], { cwd: starter, encoding: 'utf8' });
    if (check.status !== 0) throw new Error(`components/index.d.ts does not compile under strict TypeScript:\n${(check.stdout || check.stderr).trim().split('\n').slice(0, 12).join('\n')}`);
  }

  const previews = path.join(components, 'previews');
  rmSync(previews, { recursive: true, force: true });
  mkdirSync(previews, { recursive: true });
  for (const def of defs) {
    const dir = path.join(components, def.name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'README.md'), componentReadme(def, system));
    writeFileSync(path.join(dir, 'preview.html'), previewPage(def, system));
    writeFileSync(path.join(previews, `${def.name}Preview.dc.html`), previewBoard(def, system));
  }
  // The system installed beside the preview boards and the canvas boards, as a canvas holds it.
  for (const where of [previews, path.join(productDir, 'canvas')]) {
    const ds = path.join(where, 'ds', system.namespace);
    mkdirSync(path.join(ds, 'components'), { recursive: true });
    for (const f of ['bundle.js', 'bundle.css']) copyFileSync(path.join(dist, f), path.join(ds, 'components', f));
    for (const f of ['tokens.json']) copyFileSync(path.join(starter, 'system', f), path.join(ds, f));
    const css = path.join(productDir, 'tokens.css');
    if (existsSync(css)) copyFileSync(css, path.join(ds, 'tokens.css'));
  }
  return { system, manifest, components: defs.map((d) => ({ name: d.name, group: d.group, status: d.status, checks: d.checks?.length ?? 0 })), previews };
}

export { GENERATED, slug, pascal };
export default { systemIdentity, fontsModule, generatedFiles, writeStarter, buildBundle, KIT, GENERATED };
