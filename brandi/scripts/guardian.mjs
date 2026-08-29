/**
 * The guardian: what keeps a brand alive after the brand book is delivered.
 *
 * Two halves.
 *
 * `checkFiles` holds real work against the real system. It reads source files
 * and flags colours that are not on the palette, typefaces that are not the
 * brand's, words the voice guide bans, and the handful of patterns that make
 * output look machine-generated. It reports; it never edits.
 *
 * `emitGuardianSkill` writes a small Claude Code skill named after the brand,
 * so any future session in any project can load the brand and check itself
 * before shipping. That is the difference between a brand book and a brand: one
 * is a document somebody read once, the other is a rule that keeps applying.
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { toOklch, oklchToOklab, contrastRatio, extractColors } from './color.mjs';
import { BANNED_FONTS, DEFAULT_FONTS } from './canvas.mjs';
import { resolveToken } from './system.mjs';
import { loadContract, slopFindings, slopRuleSummary } from './slop.mjs';

const SOURCE_EXT = /\.(css|scss|less|html?|jsx?|tsx?|mjs|cjs|vue|svelte|astro|md|mdx)$/i;
/**
 * Brandi's own products are generated FROM the brand, so checking them is
 * circular, and worse than circular: the brand book's misuse pages and the
 * palette sheet's colour-blindness simulations exist precisely to show what is
 * wrong, so the book documenting a banned word gets reported for using it. A
 * clean brand walked out of `sheets` and `book` and straight into 27 errors
 * against itself, which teaches a new user to ignore the tool on day one.
 *
 * Authored artboards in the same directory carry no marker and are still
 * checked, because those are real design work.
 */
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const GENERATED_MARKER = 'generated from the resolved system';

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', 'vendor', '.venv', '__pycache__', 'tokens']);

/**
 * Patterns that read as machine-generated regardless of brand. Kept here rather
 * than in the brand file because they are not brand decisions, they are the
 * house floor.
 */

/** Perceptual distance between two colours, in OKLab. */
function distance(a, b) {
  const A = oklchToOklab(toOklch(a));
  const B = oklchToOklab(toOklch(b));
  return Math.hypot(A.L - B.L, A.a - B.a, A.b - B.b);
}

/** Every colour the system actually sanctions. */
export function paletteOf(system) {
  const out = new Map();
  for (const [family, pal] of Object.entries({ ...system.palettes, ...system.status })) {
    for (const mode of ['light', 'dark']) {
      for (const s of pal[mode].steps) out.set(s.hex.toUpperCase(), `${family}.${s.step} (${mode})`);
    }
  }
  for (const mode of ['light', 'dark']) {
    for (const [key, value] of Object.entries(system.semantic[mode])) {
      const hex = resolveToken(value, system, mode);
      if (/^#/.test(hex)) out.set(hex.toUpperCase(), key);
    }
  }
  out.set('#FFFFFF', 'white');
  out.set('#000000', 'black');
  return out;
}

async function collect(root, targets) {
  const files = [];
  const visit = async (p, depth = 0) => {
    let s;
    try { s = await readdir(p, { withFileTypes: true }); } catch { files.push(p); return; }
    for (const e of s) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(p, e.name);
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name) || depth > 6) continue;
        await visit(full, depth + 1);
      } else if (SOURCE_EXT.test(e.name)) files.push(full);
    }
  };
  for (const t of targets) {
    const full = path.resolve(root, t);
    if (!existsSync(full)) continue;
    await visit(full);
  }
  return files;
}

/**
 * Hold real work against the brand.
 *
 * @param {object} opts
 * @param {object} opts.brand
 * @param {object} opts.system
 * @param {string[]} opts.targets  files or directories
 * @param {number} [opts.tolerance] how far off-palette a colour may drift before
 *   it is flagged, in OKLab distance. 0.02 is about a just-noticeable
 *   difference, so 0.03 flags anything a person would see as a different colour.
 */
export async function checkFiles({ brand, system, targets, root = process.cwd(), tolerance = 0.03 }) {
  const files = await collect(root, targets);
  const contract = await loadContract();
  const palette = paletteOf(system);
  const paletteHexes = [...palette.keys()];
  const findings = [];

  const brandFonts = [system.type.fonts.display, system.type.fonts.body, system.type.fonts.mono]
    .filter(Boolean)
    .map((f) => String(f).toLowerCase());
  const banned = (brand.voice?.vocabulary?.avoid ?? []).map((w) => (typeof w === 'string' ? w : w.word)).filter(Boolean);

  const skipped = [];
  for (const file of files) {
    let text;
    try { text = await readFile(file, 'utf8'); } catch { continue; }
    const rel = path.relative(root, file);
    // Only the head, so a file that merely quotes the marker in its body is
    // still checked. Everything Brandi generates declares it up front.
    if (text.slice(0, 4096).includes(GENERATED_MARKER)) { skipped.push(rel); continue; }
    const lineOf = (index) => text.slice(0, index).split('\n').length;

    // --- Colour ----------------------------------------------------------
    // Every notation, not just hex: an off-palette colour written as
    // `rgb(31 111 74)` is exactly as off-palette, and a check that only reads
    // hex is a check anyone can walk around by changing how they type.
    const isDoc = /\.mdx?$/i.test(file);
    const seen = new Set();
    for (const found of extractColors(text)) {
      const hex = found.hex.toUpperCase();
      if (seen.has(hex)) continue;
      seen.add(hex);
      if (palette.has(hex)) continue;
      const m = { index: found.index };
      let nearest = null;
      for (const p of paletteHexes) {
        const d = distance(hex, p);
        if (!nearest || d < nearest.d) nearest = { hex: p, d, name: palette.get(p) };
      }
      if (nearest && nearest.d <= tolerance) {
        findings.push({
          level: 'warn', file: rel, line: lineOf(m.index), rule: 'near-palette',
          message: `${found.raw} is almost, but not exactly, ${nearest.hex} (${nearest.name}).`,
          fix: `Use var(--${nearest.name.split(' ')[0].replace(/\./g, '-')}) so it stays right when the palette moves.`,
        });
      } else {
        findings.push({
          // A hex quoted in documentation (a competitor's colour, an example)
          // is not shipped styling, so it is worth noting and not worth failing.
          level: isDoc ? 'warn' : 'error',
          file: rel, line: lineOf(m.index), rule: 'off-palette',
          message: `${found.raw}${found.notation === 'hex' ? '' : ` (${hex})`} is not in the ${brand.meta?.name ?? 'brand'} palette${nearest ? ` (nearest is ${nearest.hex}, ${nearest.name})` : ''}.`,
          fix: isDoc
            ? 'In prose this is usually fine. If it is meant to be a brand colour, use the token name instead of a literal.'
            : 'Use a semantic token, or add the colour to the palette deliberately and record why.',
        });
      }
    }

    // --- Typefaces -------------------------------------------------------
    // This reports only what the contract does not: a face that is off-brand
    // but is not on any slop list. The "machine-generated" judgement belongs to
    // the contract, where it is waivable, and it used to be made here as well.
    // The result was that one `font-family: Inter` produced two findings from
    // two code paths, and a correct, reasoned waiver silenced one of them while
    // the other still failed the run. A waiver that does not waive is worse
    // than no waiver: it teaches people the mechanism does not work.
    const claimedByContract = new Set([...BANNED_FONTS, ...DEFAULT_FONTS].map((f) => f.toLowerCase()));
    for (const m of text.matchAll(/font-family:\s*([^;}\n]+)/gi)) {
      const first = m[1].split(',')[0].replace(/['"]/g, '').trim();
      const lower = first.toLowerCase();
      if (!first || /^(var\(|inherit|initial|unset|system-ui|sans-serif|serif|monospace|ui-)/i.test(first)) continue;
      if (brandFonts.includes(lower)) continue;
      if (claimedByContract.has(lower)) continue;
      findings.push({
        level: 'warn',
        file: rel, line: lineOf(m.index), rule: 'off-brand-type',
        message: `${first} is not one of the brand typefaces (${brandFonts.join(', ') || 'none set'}).`,
        fix: `Use var(--font-body) or var(--font-display).`,
      });
    }

    // --- Voice -----------------------------------------------------------
    for (const word of banned) {
      const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const hit = re.exec(text);
      if (hit) {
        findings.push({
          level: 'warn', file: rel, line: lineOf(hit.index), rule: 'banned-vocabulary',
          message: `"${word}" is on the do-not-use list.`,
          fix: 'See the vocabulary section of the brand voice guide for what to say instead.',
        });
      }
    }

    // --- House floor -----------------------------------------------------
    // From references/04-anti-slop.md, which is the contract rather than a copy
    // of it. Seven hand-maintained patterns used to live here and forty were
    // specified in the document; the two drifted, as two copies of anything do.
    for (const f of slopFindings(contract, text, { file: rel })) findings.push(f);
  }

  const order = { error: 0, warn: 1, info: 2 };
  findings.sort((a, b) => order[a.level] - order[b.level] || a.file.localeCompare(b.file) || (a.line ?? 0) - (b.line ?? 0));

  return {
    ok: !findings.some((f) => f.level === 'error'),
    filesChecked: files.length - skipped.length,
    generatedSkipped: skipped,
    findings,
    counts: {
      error: findings.filter((f) => f.level === 'error').length,
      warn: findings.filter((f) => f.level === 'warn').length,
      info: findings.filter((f) => f.level === 'info').length,
    },
  };
}

/**
 * The promises a brand file makes that the deliverable has to keep.
 *
 * `checkFiles` holds work against the SYSTEM: colour, type, vocabulary. This
 * holds it against the BRIEF. A brand book that documents four logo variants
 * when one exists, or names photography as the signature and then ships no
 * image, is not a small oversight: it is the contradiction a client finds
 * while you are still presenting. Every check here compares two things the
 * brand file already contains, so none of it is a matter of taste.
 */
export async function checkPromises({ brand, root = process.cwd(), canvasDir = null }) {
  const findings = [];
  const id = brand.identity ?? {};
  const add = (level, rule, message, fix) => findings.push({ level, rule, message, fix });

  // Where logo files actually live, from whatever the brand file recorded.
  const declaredPaths = (id.logo?.files ?? []).map((f) => (typeof f === 'string' ? f : f.path)).filter(Boolean);
  const roots = new Set(['.', 'brand', 'assets', 'brand/assets']);
  for (const p of declaredPaths) roots.add(path.dirname(p));
  const findAsset = (name) => {
    if (!name) return null;
    for (const dir of roots) {
      for (const base of [root, path.join(root, 'brand')]) {
        const full = path.resolve(base, dir, name);
        if (existsSync(full)) return path.relative(root, full);
      }
    }
    return null;
  };

  for (const p of declaredPaths) {
    if (!findAsset(path.basename(p))) {
      add('error', 'missing-logo-file', `identity.logo.files names ${p}, which is not on disk.`,
        'Produce the file, or remove it from brand.json. A path that resolves to nothing is worse than no path.');
    }
  }

  const variants = id.logo?.variants ?? [];
  const missingVariants = variants.filter((v) => v.file && !findAsset(v.file));
  for (const v of missingVariants) {
    add('error', 'missing-logo-variant', `The "${v.name ?? v.file}" variant is documented but ${v.file} is not on disk.`,
      'The logo sheet specifies clear space and minimum sizes for a file nobody can use. Draw it, or cut the variant from brand.json.');
  }
  if (id.logo?.favicon && !findAsset(path.basename(String(id.logo.favicon)))) {
    add('error', 'missing-favicon', `identity.logo.favicon points at ${id.logo.favicon}, which is not on disk.`,
      'A favicon that does not exist is the first broken thing a visitor sees.');
  }

  // A signature described in terms of imagery has to appear as imagery, even if
  // only as a bracketed placeholder. Substituting a graphic for it silently is
  // how a brand ends up with no signature at all.
  // A brand that has written an art direction has committed to photography,
  // whether or not the word appears in the signature: "Real dogs, mid-action,
  // in the actual bays" is a shot list. Read both, because the signature is
  // usually the shortest sentence in the file.
  const signature = String(id.signature ?? '');
  const imagery = [id.imagery?.direction, id.imagery?.treatment, ...(id.imagery?.dos ?? [])].filter(Boolean).join(' ');
  const photographic = /\b(photo|photos|photograph\w*|image\w*|portrait|shot|shoot|shooting|footage|film|lens|camera|natural light)\b/i;
  const wantsImage = photographic.test(signature) || photographic.test(imagery);
  if (wantsImage && canvasDir && existsSync(canvasDir)) {
    // Authored artboards only. The generated logo sheet draws a [PHOTOGRAPH]
    // swatch to illustrate a misuse, and counting that as the signature being
    // shown would let the check pass on a canvas with no design work in it.
    const boards = [];
    for (const f of (await readdir(canvasDir)).filter((f) => f.endsWith('.dc.html'))) {
      const text = await readFile(path.join(canvasDir, f), 'utf8');
      if (text.slice(0, 4096).includes(GENERATED_MARKER)) continue;
      boards.push({ file: f, text });
    }
    const withImage = boards
      .filter((b) => /<img\b|<picture\b|\[(PHOTO|PHOTOGRAPH|IMAGE)[^\]]*\]/i.test(b.text))
      .map((b) => b.file);
    if (!boards.length) {
      // Nothing authored yet. The proof round has not happened, and `status`
      // is the command that says so.
    } else if (!withImage.length) {
      add('error', 'signature-not-shown', `${signature ? `The signature is "${signature}", and n` : 'N'}o artboard carries an image or an image placeholder, but the brand has written an art direction.`,
        'Put a captioned [PHOTOGRAPH: ...] slot where it belongs, at the scale the signature describes. A signature that is never shown is a sentence, not an asset.');
    } else if (withImage.length < Math.max(2, Math.ceil(boards.length / 3))) {
      add('warn', 'signature-shown-once', `The signature appears on ${plural(withImage.length, 'authored artboard')} of ${boards.length}: ${withImage.join(', ')}.`,
        'A distinctive asset earns its name by repetition. If it belongs on one surface only, say so in brand.json rather than calling it the signature.');
    }
  }

  // An application named in the brief and never drawn is a gap in the proof,
  // not a gap in the brand, but it is the gap that gets discovered in a meeting.
  if (canvasDir && existsSync(canvasDir)) {
    // A generated sheet standing at an application's path has not drawn it. The
    // contents page lives at Main.dc.html, which is exactly where a home page
    // usually goes, so file existence alone would pass a promise nobody kept.
    const boards = new Set();
    for (const f of (await readdir(canvasDir)).filter((f) => f.endsWith('.dc.html'))) {
      const head = (await readFile(path.join(canvasDir, f), 'utf8')).slice(0, 4096);
      if (!head.includes(GENERATED_MARKER)) boards.add(f);
    }
    // Both halves of this matter, and only the first was checked. An
    // application with no file is not exempt from the promise, it has not even
    // been assigned a surface to keep it on, and in the worked example the two
    // that slipped through were the shopfront and the bay instructions: the
    // physical work, which is the part a client believes they bought.
    for (const app of brand.applications ?? []) {
      const name = app.name ?? app.file ?? 'an unnamed application';
      if (!app.file) {
        add('warn', 'application-not-assigned', `applications names "${name}", and no artboard is named for it.`,
          'Give it a file and draw it, or take it off the list. Described is not designed, and a physical surface is the one a client checks first.');
      } else if (!boards.has(app.file)) {
        add('warn', 'application-not-drawn', `applications names "${name}" as ${app.file}, which is not in the canvas.`,
          'Draw it, or take it out of the application list. The list is a promise about what has been proven.');
      }
    }
  }

  const order = { error: 0, warn: 1, info: 2 };
  findings.sort((a, b) => order[a.level] - order[b.level]);
  return { ok: !findings.some((f) => f.level === 'error'), findings };
}

// ---------------------------------------------------------------------------
// The companion skill
// ---------------------------------------------------------------------------

const yamlString = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

function guardianSkillMd({ brand, system, brandFile, cliPath }) {
  const name = brand.meta?.name ?? 'the brand';
  const slug = brand.meta?.slug ?? 'brand';
  const sem = system.semantic.light;
  const r = (k) => resolveToken(sem[k], system, 'light');
  const fonts = system.type.fonts;

  const attributes = (brand.voice?.attributes ?? [])
    .map((a) => `- **${a.name}**, not ${a.notThis ?? '[the opposite nobody would claim]'}. ${a.doThis ?? ''}`.trim())
    .join('\n');

  const avoid = (brand.voice?.vocabulary?.avoid ?? [])
    .map((w) => (typeof w === 'string' ? w : w.word))
    .filter(Boolean);

  return `---
name: ${slug}-brand
description: ${yamlString(
    `Apply and enforce the ${name} brand: colour, typography, spacing, voice and logo rules. ` +
    `Use whenever writing, designing or reviewing anything that carries the ${name} name: web pages, ` +
    `product UI, decks, documents, social posts, email or ads. Trigger on "${name}", "on brand", ` +
    `"brand guidelines", "${slug} style", or when the work is clearly for ${name} even without being told.`,
  )}
---

# ${name} brand

The full system lives at \`${path.basename(path.dirname(brandFile))}/brand.json\`. This file is the
short version: enough to get the work right, and enough to know when to go and read the long one.

## Before you make anything

Load the tokens rather than retyping values. \`brand/tokens/tokens.css\` defines every colour,
size, radius and duration below as a custom property, in both themes. Reaching past a semantic
token into a raw ramp step is how a design system stops being one.

## Colour

| Role | Token | Light | Dark |
| --- | --- | --- | --- |
| Page | \`--surface-page\` | ${r('surface.page')} | ${resolveToken(system.semantic.dark['surface.page'], system, 'dark')} |
| Body text | \`--text-primary\` | ${r('text.primary')} | ${resolveToken(system.semantic.dark['text.primary'], system, 'dark')} |
| Secondary text | \`--text-secondary\` | ${r('text.secondary')} | ${resolveToken(system.semantic.dark['text.secondary'], system, 'dark')} |
| Brand solid | \`--accent-solid\` | ${r('accent.solid')} | ${resolveToken(system.semantic.dark['accent.solid'], system, 'dark')} |
| Button fill | \`--accent-solid-strong\` | ${sem['accent.solid-strong']} | ${system.semantic.dark['accent.solid-strong']} |
| Focus ring | \`--focus-ring\` | ${r('focus.ring')} | ${resolveToken(system.semantic.dark['focus.ring'], system, 'dark')} |

Rules that are not negotiable:

- Filled controls use \`--accent-solid-strong\`, not \`--accent-solid\`. The raw brand colour gives a
  label only Lc ${system.palettes.brand.light.onSolid.apca}, which is short of what a button needs.
- Status is never carried by colour alone. Every success, warning and error state needs an icon and
  a word as well, because success and danger are close together for the most common colour vision
  deficiencies.
- Body text clears WCAG 2.2 AA (4.5:1) in both themes. Measured, not assumed: see the contrast table in the brand book, and re-measure anything you add.

## Typography

- Display: **${fonts.display ?? '[not set]'}**
- Body: **${fonts.body ?? '[not set]'}**
- Mono: **${fonts.mono ?? '[not set]'}**

A ${system.type.scale.ratioName ?? system.type.scale.ratio} scale from ${system.type.scale.basePx}px.
Use the named steps (\`--text-sm\` through \`--text-4xl\`), never an arbitrary size. Body copy sits at
${system.type.measure.css} so lines stay in the comfortable range.

Do not reach for ${BANNED_FONTS.slice(0, 5).join(', ')} or any other default stack. If one is
genuinely right here, say why next to it: \`/* anti-slop-waiver: the reason */\`. A waiver with no
reason is reported as its own finding. If a face is missing, say so rather than substituting one.

## Shape, space and motion

- Radius stance: **${system.meta.shape}**. ${system.meta.shapeNote}
- Spacing: ${system.meta.spaceBase}px base. Use \`--space-*\` tokens, named by pixel value.
- Motion: **${system.meta.motion}**. ${system.meta.motionNote} Honour \`prefers-reduced-motion\`.

## Voice

${attributes || '- [Voice attributes have not been recorded yet. Read brand.json.]'}

${avoid.length ? `Never write: ${avoid.map((w) => `"${w}"`).join(', ')}.` : ''}

Copy is design material, not decoration. Name things by what a person controls, not by how the
system is built. Errors say what happened and what to do next; they do not apologise and they are
never vague. An empty state is an invitation to act.

## Checking your own work

Run this before you call anything done:

\`\`\`bash
brandi check <paths>
\`\`\`

(\`brandi\` is on PATH wherever the Brandi plugin is enabled. This skill also runs in sessions where
it is not, so the absolute fallback below is the copy of the command line that generated this file.
If it has moved, install the plugin or update this line.)

\`\`\`bash
node ${cliPath ?? '<path to>/brandi/scripts/brandi.mjs'} check <paths>
\`\`\`

It reports off-palette colours, off-brand typefaces, banned vocabulary and the patterns that make
output look machine-generated. It reports; it does not edit. Fix what it finds, or record a
deliberate exception in the decision log rather than letting the system quietly drift.

It skips what Brandi generated from the brand (the sheets, the book, the token files), because
holding those against the brand is only checking its own arithmetic, and the misuse pages are
deliberately wrong. Anything you or Claude authored is checked.

It groups by rule first and prints the worst forty findings; \`--limit N\` shows more. If a run
returns thousands, the target is almost certainly wider than the brand: vendored code, generated
files and third-party templates are not yours to hold to it. Point it at the files that carry the
brand, and work rule by rule rather than line by line.

## Before it goes out

\`\`\`bash
brandi validate --dir brand/canvas
\`\`\`

That checks the artboards will render, and separately whether the brief and the deliverable agree:
a logo variant documented but never drawn, a favicon pointing at nothing, an art direction written
and no image anywhere, an application named in the brief and never shown. Those are the
contradictions a client finds while you are still presenting.

## When the brand needs to change

It will. Extending a system is normal; drifting is not. The difference is a record. Add the decision
and the reason to \`governance.decisions\` in brand.json, bump \`meta.version\`, and regenerate the
tokens. A change nobody wrote down becomes an inconsistency the next person has to guess about.
`;
}

/** Write the companion enforcement skill for this brand. */
export async function emitGuardianSkill({ brand, system, dir, brandFile, cliPath }) {
  const contract = await loadContract();
  await mkdir(dir, { recursive: true });
  const files = [];
  const skillPath = path.join(dir, 'SKILL.md');
  await writeFile(skillPath, guardianSkillMd({ brand, system, brandFile, cliPath }));
  files.push(skillPath);

  const rulesPath = path.join(dir, 'rules.json');
  await writeFile(rulesPath, JSON.stringify({
    brand: brand.meta?.name ?? null,
    version: brand.meta?.version ?? null,
    generated: new Date().toISOString(),
    palette: Object.fromEntries(paletteOf(system)),
    fonts: system.type.fonts,
    bannedFonts: BANNED_FONTS,
    bannedWords: (brand.voice?.vocabulary?.avoid ?? []).map((w) => (typeof w === 'string' ? w : w.word)).filter(Boolean),
    // The rules a brand's own guardian skill enforces, read from the contract
    // rather than restated here, so a rule added to the document reaches every
    // brand's rules.json the next time it is emitted.
    slopRules: slopRuleSummary(contract),
    contrastFloors: { bodyText: 4.5, largeText: 3, nonText: 3, focusRing: 3 },
  }, null, 2) + '\n');
  files.push(rulesPath);

  return files;
}

export default { checkFiles, emitGuardianSkill, paletteOf };
