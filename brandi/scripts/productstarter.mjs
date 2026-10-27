/**
 * Brandi product layer: the starter a product is built from, and the bundle the canvas mounts.
 *
 * `brandi product starter` copies the kit (brandi/product/kit) into product/starter, then writes the
 * files the system owns: its tokens, its identity, globals.css, the market's locale, the product's
 * name and the brand's faces through next/font, and PRODUCT.md and DESIGN.md for Impeccable. A second
 * run rewrites only those generated files, so whatever a product has added survives; --kit copies the
 * kit's own folders again as well.
 *
 * `brandi product bundle` builds the canvas bundle from the starter's own components (one
 * implementation, built twice) and writes every component's Design System card and preview from its
 * one definition.
 */

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

import { toStarterGlobals } from './productglobals.mjs';
import { relativeLuminance } from './color.mjs';
import { hostedFontsUrl, loadDefinitions, checkDefinition, componentReadme, previewBoard, previewPage, typesFile } from './productdocs.mjs';
import { productMd, designMd, CONTEXT_MARKER } from './productcontext.mjs';
import { brandSources, brandConstant, brandModule, shrinkStill } from './productbrand.mjs';
import { toPreviewHtml, declaredFrame, SHIM } from './preview.mjs';
import { ensurePageReact } from './pagereact.mjs';

/**
 * The definitions' fingerprint, which a product repo's component checks compare against its rendered
 * previews: sha256 over each components/system/*.def.mjs in filename order, each "<name>\n<contents>\n".
 */
export function definitionsHash(systemDir) {
  const files = readdirSync(systemDir).filter((f) => f.endsWith('.def.mjs')).sort();
  const hash = createHash('sha256');
  for (const f of files) hash.update(`${f}\n${readFileSync(path.join(systemDir, f), 'utf8')}\n`, 'utf8');
  return { sha256: hash.digest('hex'), files: files.length };
}

const here = path.dirname(fileURLToPath(import.meta.url));
export const KIT = path.resolve(here, '..', 'product', 'kit');
export const GLOBALS_SOURCE = path.join(here, 'productglobals.mjs');
export const PLATFORM_SPECS = path.resolve(here, '..', 'product', 'platform');

// Files and folders a product makes for itself, never copied from the kit.
const NOT_FROM_KIT = new Set(['node_modules', '.next', 'system', 'next-env.d.ts', 'tsconfig.tsbuildinfo']);

// What the kit wrote into a starter last time, path -> sha256, so a refresh can take back a file the kit has
// since dropped, and only while nobody has changed it.
export const KIT_MANIFEST = '.brandi/kit-files.json';
// Files the kit dropped before it kept a manifest, with every version it ever shipped. The placeholder home
// page went when the worked example arrived, and left behind it shadowed the example's own "/".
const RETIRED = {
  'app/page.tsx': ['0dd47f4f00bde01e528ad93b27cfe55cfef70d611d933d3b5c61104e2aaf65fb'],
};

const sha = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

/** Every file the kit carries into a starter, relative, with its hash. */
function kitFiles(kit) {
  const out = {};
  const walk = (dir, rel = '') => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const r = rel ? `${rel}/${entry.name}` : entry.name;
      if (!rel && NOT_FROM_KIT.has(entry.name)) continue;
      if (entry.name === 'node_modules' || r === 'canvas/dist') continue;
      if (entry.isDirectory()) walk(path.join(dir, entry.name), r);
      else out[r] = sha(path.join(dir, entry.name));
    }
  };
  walk(kit);
  return out;
}

/**
 * Copy the kit into a starter and take back what the kit has dropped since it last wrote there: a file the
 * last manifest (or the retired list) names, the kit no longer has, and nobody has changed since. A changed
 * one stays, and is reported. Returns { removed, kept }.
 */
export function refreshKitFiles(out, kit = KIT) {
  const manifestFile = path.join(out, KIT_MANIFEST);
  let before = {};
  try { before = JSON.parse(readFileSync(manifestFile, 'utf8')); } catch { /* none yet: a starter older than the manifest */ }
  mkdirSync(out, { recursive: true });
  for (const entry of readdirSync(kit)) {
    if (NOT_FROM_KIT.has(entry)) continue;
    cpSync(path.join(kit, entry), path.join(out, entry), { recursive: true, force: true, filter: (src) => !src.includes(`${path.sep}node_modules`) && !src.includes(`${path.sep}canvas${path.sep}dist`) });
  }
  const now = kitFiles(kit);
  const removed = [];
  const kept = [];
  for (const rel of new Set([...Object.keys(before), ...Object.keys(RETIRED)])) {
    if (now[rel]) continue;
    const file = path.join(out, rel);
    if (!existsSync(file)) continue;
    const known = [before[rel], ...(RETIRED[rel] ?? [])].filter(Boolean);
    if (known.includes(sha(file))) { rmSync(file); removed.push(rel); } else kept.push(rel);
  }
  // A route gone leaves Next.js's generated route types pointing at it, and the type check fails until a build.
  if (removed.some((r) => r.startsWith('app/'))) rmSync(path.join(out, '.next', 'types'), { recursive: true, force: true });
  mkdirSync(path.dirname(manifestFile), { recursive: true });
  writeFileSync(manifestFile, `${JSON.stringify(now, null, 2)}\n`);
  return { removed, kept };
}
const GENERATED = ['system/tokens.json', 'system/system.json', 'app/globals.css', 'lib/format-locale.js', 'lib/product.ts', 'app/fonts.ts', 'tools/build-globals.mjs'];

const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);
const pascal = (s) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('').replace(/^(\d)/, 'S$1');

/**
 * Who the system is: its display name, the canvas folder (namespace), the bundle's global, the
 * market's locale and currency, the language its copy is in, and its version. product.json can set
 * any of them; the rest come from the brand's name.
 */
/** "dark" when the light theme's rail is darker than its strong text, as a navy rail is; "light" otherwise. */
export function railTone(tokens) {
  const all = new Map((tokens.color?.tokens ?? []).map((t) => [t.name, t]));
  const light = (name, seen = new Set()) => {
    const v = all.get(name)?.value;
    const raw = v && typeof v === 'object' ? v.light : v;
    const alias = typeof raw === 'string' && /^\{([a-z0-9-]+)\}$/.exec(raw);
    return alias && !seen.has(alias[1]) ? light(alias[1], new Set([...seen, name])) : raw;
  };
  const rail = light('rail');
  const text = light('rail-text-strong');
  if (!rail || !text) return 'light';
  return relativeLuminance(rail) < relativeLuminance(text) ? 'dark' : 'light';
}

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
    // How the product name is set in the lockup: "label" (the default) or "eyebrow" (small, bold, upper case).
    lockupName: config.lockup?.name === 'eyebrow' ? 'eyebrow' : 'label',
    // How the brand writes a time: "11am to 10.30pm" is { minutes: ".", onTheHour: "drop", space: false }.
    time: {
      minutes: config.time?.minutes === '.' ? '.' : ':',
      onTheHour: config.time?.onTheHour === 'drop' ? 'drop' : 'keep',
      space: config.time?.space !== false,
    },
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

/** lib/format-locale.js: the market's locale and currency, and how the brand writes a time. */
export function localeModule(identity) {
  const t = identity.time ?? { minutes: ':', onTheHour: 'keep', space: true };
  return [
    "// The market's locale and currency. `brandi product starter` writes this file from the system.",
    `export const LOCALE = ${JSON.stringify(identity.locale)}`,
    `export const CURRENCY = ${JSON.stringify(identity.currency)}`,
    '// How a time is written: minutes after a ":" or a ".", minutes on the hour kept or dropped, a space before am or pm or not.',
    `export const TIME = { minutes: ${JSON.stringify(t.minutes)}, onTheHour: ${JSON.stringify(t.onTheHour)}, space: ${t.space !== false} }`,
    '',
  ].join('\n');
}

/** Every file the system owns in a starter, as path -> content. */
export function generatedFiles(tokens, identity) {
  return new Map([
    ['system/tokens.json', `${JSON.stringify(tokens, null, 2)}\n`],
    ['system/system.json', `${JSON.stringify({ ...identity, fontsUrl: hostedFontsUrl(tokens) }, null, 2)}\n`],
    ['app/globals.css', toStarterGlobals(tokens)],
    ['lib/format-locale.js', localeModule(identity)],
    ['lib/product.ts', `// The product's name and language, set once, and two things read off the system. \`brandi product starter\` writes this file.\n// railTone: whether the rail is dark in the light theme, so the rail's lockup takes the mark drawn for dark grounds.\n// lockupName: how the product name is set beside the mark, a brand-to-product decision.\nexport const PRODUCT = { name: ${JSON.stringify(identity.name)}, lang: ${JSON.stringify(identity.lang)}, railTone: ${JSON.stringify(railTone(tokens))}, lockupName: ${JSON.stringify(identity.lockupName ?? 'label')} } as {\n  name: string\n  lang: string\n  railTone: "light" | "dark"\n  lockupName: "label" | "eyebrow"\n}\n`],
    ['app/fonts.ts', fontsModule(tokens)],
    ['tools/build-globals.mjs', readFileSync(GLOBALS_SOURCE, 'utf8')],
  ]);
}

/**
 * Write or refresh a starter. A fresh folder gets the whole kit; an existing one gets only the
 * generated files unless `refreshKit`. Font files the tokens ship are copied in from `fontsDir`.
 */
export async function writeStarter({ out, tokens, identity, kit = KIT, refreshKit = false, fontsDir = null, platformOut = null, product = {}, brandName = null, brand = null, brandRoot = null, productDir = null }) {
  const fresh = !existsSync(path.join(out, 'package.json'));
  const written = [];
  let retired = { removed: [], kept: [] };
  if (fresh || refreshKit) {
    retired = refreshKitFiles(out, kit);
    for (const entry of readdirSync(kit)) if (!NOT_FROM_KIT.has(entry)) written.push(entry);
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
  const kept = [];
  // The brand's marks and character, from its own files. Without any, the kit's placeholder stays.
  const src = brandSources({ product, brand, productDir, brandRoot });
  let brandMarks = null;
  if (src) {
    const file = path.join(out, 'lib', 'brand.ts');
    // Pose stills go into the bundle drawn down, so boards on the canvas show them too.
    const stills = new Map();
    for (const rel of [...Object.values(src.character?.poses ?? {}), ...Object.values(src.character?.flat ?? {})]) {
      const still = path.resolve(src.base, rel);
      if (/\.(png|jpe?g|webp)$/i.test(rel) && existsSync(still) && !stills.has(still)) {
        const uri = await shrinkStill(still);
        if (uri) stills.set(still, uri);
      }
    }
    const generated = brandConstant(src, { publicDir: path.join(out, 'public', 'brand'), stills });
    // A starter made before the kit had lib/brand.ts takes the types from the kit's copy.
    const current = readFileSync(existsSync(file) ? file : path.join(kit, 'lib', 'brand.ts'), 'utf8');
    const next = brandModule(current, generated.source);
    if (next) { writeFileSync(file, next); written.push('lib/brand.ts'); brandMarks = { ...generated, from: src.from }; } else kept.push('lib/brand.ts');
  }
  // Impeccable's context files. Rewritten while they carry the marker; once a person or Impeccable
  // has taken one over (the marker gone), it is theirs and left alone.
  const defs = await loadDefinitions(path.join(out, 'components', 'system'));
  for (const [rel, content] of [['PRODUCT.md', productMd({ product, identity, brandName })], ['DESIGN.md', designMd({ tokens, identity, defs, brandName })]]) {
    const file = path.join(out, rel);
    if (existsSync(file) && !readFileSync(file, 'utf8').includes(CONTEXT_MARKER)) { kept.push(rel); continue; }
    writeFileSync(file, content);
    written.push(rel);
  }
  return { fresh, written, kept, retired, brand: brandMarks, placeholder: !src };
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
  const js = readFileSync(path.join(dist, 'bundle.js'), 'utf8');
  if (/<\/script/i.test(js) || /<!--/.test(js)) throw new Error('bundle.js holds a literal </script or <!--, which the Design System refuses.');

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
    // Checked as a .ts copy: --skipLibCheck skips every .d.ts, so the file itself was only ever
    // parsed, and a type no definition declares passed.
    const copy = path.join(components, 'index.check.ts');
    writeFileSync(copy, readFileSync(path.join(components, 'index.d.ts'), 'utf8'));
    try {
      const check = spawnSync(tsc, ['--noEmit', '--strict', '--skipLibCheck', '--jsx', 'react-jsx', '--moduleResolution', 'bundler', '--module', 'esnext', '--target', 'es2020', '--types', 'react', '--typeRoots', path.join(starter, 'node_modules', '@types'), copy], { cwd: starter, encoding: 'utf8' });
      if (check.status !== 0) throw new Error(`components/index.d.ts does not compile under strict TypeScript:\n${(check.stdout || check.stderr).trim().split('\n').slice(0, 12).join('\n')}`);
    } finally {
      rmSync(copy, { force: true });
    }
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
  // The previews a product repo's CI runs the component checks on: rendered into the starter beside one
  // copy of the runtime and of the system, so they need neither Brandi nor the network. The checks
  // compare definitions.json with the definitions, so a stale set fails rather than passing.
  const starterPreviews = path.join(starter, 'canvas', 'previews');
  rmSync(starterPreviews, { recursive: true, force: true });
  mkdirSync(path.join(starterPreviews, 'runtime'), { recursive: true });
  let runtime = null;
  try {
    const page = await ensurePageReact();
    for (const [key, file] of Object.entries({ react: page.react, reactDom: page.reactDom, shim: SHIM })) copyFileSync(file, path.join(starterPreviews, 'runtime', path.basename(file)));
    runtime = { react: `runtime/${path.basename(page.react)}`, reactDom: `runtime/${path.basename(page.reactDom)}`, shim: `runtime/${path.basename(SHIM)}` };
  } catch { /* offline with nothing cached: previews still written, and the checks will say they cannot mount */ }
  for (const def of defs) {
    const board = previewBoard(def, system);
    const frame = declaredFrame(board) ?? { w: 960, h: 600 };
    writeFileSync(path.join(starterPreviews, `${def.name}Preview.preview.html`), toPreviewHtml(board, { width: frame.w, height: frame.h, label: `${def.name}Preview.dc.html`, runtime }));
  }
  writeFileSync(path.join(starterPreviews, 'definitions.json'), `${JSON.stringify(definitionsHash(path.join(starter, 'components', 'system')))}\n`);

  // The system installed beside the preview boards, the canvas boards and the starter's previews.
  for (const where of [previews, path.join(productDir, 'canvas'), starterPreviews]) {
    const ds = path.join(where, 'ds', system.namespace);
    mkdirSync(path.join(ds, 'components'), { recursive: true });
    for (const f of ['bundle.js', 'bundle.css']) copyFileSync(path.join(dist, f), path.join(ds, 'components', f));
    for (const f of ['tokens.json']) copyFileSync(path.join(starter, 'system', f), path.join(ds, f));
    const css = path.join(productDir, 'tokens.css');
    if (existsSync(css)) copyFileSync(css, path.join(ds, 'tokens.css'));
    // tokens.css names its faces as fonts/<file>, so the files go beside it, as a canvas holds them.
    const fonts = path.join(productDir, 'fonts');
    if (existsSync(fonts)) {
      mkdirSync(path.join(ds, 'fonts'), { recursive: true });
      for (const f of readdirSync(fonts).filter((x) => /\.(woff2?|otf|ttf)$/i.test(x))) copyFileSync(path.join(fonts, f), path.join(ds, 'fonts', f));
    }
  }
  return { system, manifest, components: defs.map((d) => ({ name: d.name, group: d.group, status: d.status, checks: d.checks?.length ?? 0 })), previews };
}

export { GENERATED, slug, pascal };
export default { systemIdentity, fontsModule, generatedFiles, writeStarter, buildBundle, KIT, GENERATED };
