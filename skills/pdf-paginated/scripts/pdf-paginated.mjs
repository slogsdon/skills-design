#!/usr/bin/env node
/**
 * pdf-paginated.mjs — multi-page (paginated) PDF export via headless Chromium.
 *
 * Sibling to pdf-html.mjs. Where pdf-html renders each .canvas to a single
 * auto-height page (right for artifacts/audit reports), this renders a
 * document-flow HTML page to a PAGINATED PDF at a real paper size (Letter/A4),
 * with a running folio footer (title · page X / Y). Right for long-form
 * documents: essays, field guides, specs — anything meant to be read or printed
 * as pages rather than one tall canvas.
 *
 * No .canvas targeting — the whole document flows across pages. Page size and
 * margins come from page.pdf({format, margin}); the footer is a Chromium
 * headerTemplate/footerTemplate.
 */
import { readdir, mkdir, stat, writeFile, access } from 'node:fs/promises';
import { join, resolve, relative, dirname, extname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { argv, exit, stderr, stdout } from 'node:process';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const SCRIPT_PACKAGE_JSON = join(SCRIPT_DIR, 'package.json');
const LOCAL_PLAYWRIGHT_CLI = join(SCRIPT_DIR, 'node_modules', '.bin', 'playwright');

// ── Bootstrap helpers (mirrored from pdf-html.mjs) ───────────────────────────

function runCommand(cmd, args, cwd = SCRIPT_DIR) {
  return new Promise((res, rej) => {
    const child = spawn(cmd, args, { cwd, stdio: 'inherit' });
    child.on('exit', (code) => (code === 0 ? res() : rej(new Error(`${cmd} ${args.join(' ')} exited ${code}`))));
    child.on('error', rej);
  });
}

async function fileExists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function ensureSkillPackageJson() {
  if (await fileExists(SCRIPT_PACKAGE_JSON)) return;
  await writeFile(
    SCRIPT_PACKAGE_JSON,
    JSON.stringify(
      {
        name: 'pdf-paginated-skill',
        private: true,
        version: '0.0.0',
        description: 'Auto-generated to anchor Playwright install to the skill scripts dir.',
      },
      null,
      2,
    ) + '\n',
  );
}

async function ensureChromium() {
  await runCommand(LOCAL_PLAYWRIGHT_CLI, ['install', 'chromium']);
}

async function ensurePlaywright() {
  try {
    return await import('playwright');
  } catch (err) {
    const msg = String(err && err.message || '');
    const missing =
      (err && (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'MODULE_NOT_FOUND'))
      || /Cannot find package 'playwright'|Cannot find module 'playwright'/.test(msg);
    if (!missing) throw err;
    stdout.write(`Playwright not found. Installing into ${SCRIPT_DIR}/node_modules (one-time)…\n`);
    await ensureSkillPackageJson();
    await runCommand('npm', [
      'install',
      `--prefix=${SCRIPT_DIR}`,
      '--no-audit',
      '--no-fund',
      '--loglevel=error',
      'playwright',
    ]);
    await ensureChromium();
    return await import('playwright');
  }
}

// ── CLI argument parsing ──────────────────────────────────────────────────────

function parseArgs(args) {
  const opts = { dir: '.', output: null, format: 'Letter', margin: '0.9in', footer: true, bleed: null };
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--output' || arg === '-o') { opts.output = args[i + 1]; i += 1; }
    else if (arg === '--format' || arg === '-f') { opts.format = args[i + 1]; i += 1; }
    else if (arg === '--margin' || arg === '-m') { opts.margin = args[i + 1]; i += 1; }
    else if (arg === '--bleed') { opts.bleed = args[i + 1]; i += 1; }
    else if (arg === '--no-footer') { opts.footer = false; }
    else if (arg === '--help' || arg === '-h') {
      stdout.write(
        'Usage: node scripts/pdf-paginated.mjs <dir> [--output <dir>] [--format Letter|A4] [--margin <css>] [--bleed <color>] [--no-footer]\n' +
        '\n' +
        'Renders document-flow HTML to a PAGINATED PDF at a real paper size, with a\n' +
        'running folio footer (title · page X / Y). For long-form documents (essays,\n' +
        'field guides, specs). For single-canvas artifacts use pdf-html.mjs instead.\n' +
        '\n' +
        '--bleed <color>: full-bleed page surface. Sets top/left/right margins to 0 so\n' +
        'the HTML background reaches every edge (the HTML owns its own text insets via\n' +
        'padding), and paints the footer strip <color> so it matches. Use when the page\n' +
        'has a committed background color (e.g. cream) that must not float on white.\n',
      );
      exit(0);
    }
    else if (arg.startsWith('--')) { stderr.write(`Unknown flag: ${arg}\n`); exit(2); }
    else { positional.push(arg); }
  }
  if (positional[0]) opts.dir = positional[0];
  return opts;
}

// ── File discovery ────────────────────────────────────────────────────────────

async function findHtmlFiles(root) {
  const out = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.name.startsWith('.') ||
        entry.name === 'node_modules' ||
        entry.name === 'screenshots' ||
        entry.name === 'pdfs'
      ) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && extname(entry.name).toLowerCase() === '.html') out.push(full);
    }
  }
  await walk(root);
  return out.sort();
}

// ── Folio footer (Chromium print template — needs explicit inline font-size) ──

// Folio footer (Chromium print template — needs explicit inline font-size).
// `bleed` paints the whole strip that color + fills its full height, so a
// committed page background reaches the bottom edge instead of floating on white.
function footerTemplate(bleed) {
  const bar = bleed
    ? `height:0.55in; background:${bleed}; -webkit-print-color-adjust:exact; print-color-adjust:exact;`
    : '';
  return `
  <div style="width:100%; box-sizing:border-box; ${bar} font-family:'JetBrains Mono','SFMono-Regular',Menlo,monospace; font-size:8px; letter-spacing:0.06em; color:#62686f; padding:0 0.95in; display:flex; justify-content:space-between; align-items:center;">
    <span class="title" style="text-transform:uppercase;"></span>
    <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
  </div>`;
}
// A plain colored strip that fills a page margin (top or bottom) so a
// full-bleed background reaches every page edge with no white band.
function stripTemplate(color) {
  return `<div style="width:100%; height:0.55in; margin:0; background:${color}; -webkit-print-color-adjust:exact; print-color-adjust:exact;"></div>`;
}
const EMPTY_TEMPLATE = '<div></div>';

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs(argv.slice(2));
  const inputDir = resolve(opts.dir);

  let inputStat;
  try { inputStat = await stat(inputDir); }
  catch { stderr.write(`Input directory not found: ${inputDir}\n`); exit(1); }
  if (!inputStat.isDirectory()) { stderr.write(`Input path is not a directory: ${inputDir}\n`); exit(1); }

  const outputDir = resolve(opts.output ?? join(inputDir, 'pdfs'));
  await mkdir(outputDir, { recursive: true });

  const { chromium } = await ensurePlaywright();
  const files = await findHtmlFiles(inputDir);
  if (files.length === 0) { stdout.write(`No .html files found under ${inputDir}\n`); return; }

  stdout.write(`Found ${files.length} HTML file(s). Format: ${opts.format}. Output: ${outputDir}\n`);

  let browser;
  try { browser = await chromium.launch(); }
  catch (err) {
    const msg = String(err && err.message || '');
    if (/Executable doesn'?t exist|playwright install/i.test(msg)) {
      stdout.write(`Chromium binary missing. Running 'playwright install chromium' (one-time)…\n`);
      await ensureChromium();
      browser = await chromium.launch();
    } else throw err;
  }

  const context = await browser.newContext();
  // Bleed mode: zero left/right margins so the HTML background reaches the side
  // edges, and paint the top + bottom margin strips the bleed color so every page
  // gets a per-page colored inset (no white bands, no text jammed to the edge on
  // continuation pages). The HTML owns only its left/right text insets (padding).
  const margin = opts.bleed
    ? { top: '0.55in', right: '0', bottom: '0.55in', left: '0' }
    : { top: opts.margin, right: opts.margin, bottom: opts.margin, left: opts.margin };
  const headerTpl = opts.bleed ? stripTemplate(opts.bleed) : EMPTY_TEMPLATE;
  const footerTpl = opts.bleed
    ? (opts.footer ? footerTemplate(opts.bleed) : stripTemplate(opts.bleed))
    : (opts.footer ? footerTemplate(null) : EMPTY_TEMPLATE);
  const showHF = Boolean(opts.bleed) || opts.footer;
  let total = 0;

  try {
    for (const file of files) {
      const rel = relative(inputDir, file);
      const stem = basename(file).replace(/\.html$/i, '');
      const fileUrl = pathToFileURL(file).href;
      const outPath = join(outputDir, `${stem}.pdf`);

      const page = await context.newPage();
      try {
        await page.goto(fileUrl, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
        await page.pdf({
          path: outPath,
          format: opts.format,
          printBackground: true,
          margin,
          displayHeaderFooter: showHF,
          headerTemplate: headerTpl,
          footerTemplate: footerTpl,
        });
        total += 1;
        stdout.write(`  ${rel} → ${stem}.pdf (${opts.format}, paginated)\n`);
      } catch (err) {
        stderr.write(`  ${rel} ✗ FAILED: ${err.message}\n`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  stdout.write(`\nDone. ${total} PDF(s).\n`);
}

main().catch((err) => {
  stderr.write(`${err.stack ?? err.message ?? err}\n`);
  exit(1);
});
