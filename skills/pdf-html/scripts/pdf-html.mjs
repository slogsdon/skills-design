#!/usr/bin/env node
/**
 * pdf-html.mjs — per-canvas PDF export via headless Chromium.
 *
 * Targets the same .canvas / [class*="canvas-"] / .scene conventions as
 * screenshot-html.mjs but calls page.pdf() instead of element.screenshot().
 * Preview-backdrop styles (dark body background, padding, gap) are stripped
 * via injected CSS before each render so the PDF contains only the canvas.
 *
 * Height is auto-measured from each canvas's rendered bounding box; no
 * --height flag is needed or accepted.
 */
import { readdir, mkdir, stat, writeFile, access } from 'node:fs/promises';
import { join, resolve, relative, dirname, extname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { argv, exit, stderr, stdout } from 'node:process';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const SCRIPT_PACKAGE_JSON = join(SCRIPT_DIR, 'package.json');
const LOCAL_PLAYWRIGHT_CLI = join(SCRIPT_DIR, 'node_modules', '.bin', 'playwright');

// ── Bootstrap helpers (mirrored from screenshot-html.mjs) ────────────────────

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
        name: 'pdf-html-skill',
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

// ── Canvas targeting ─────────────────────────────────────────────────────────

const ARTIFACT_SELECTOR = '.canvas, [class*="canvas-"]:not(.canvas-label), .scene';

/**
 * CSS injected before PDF generation to strip the preview-backdrop body styles
 * that design-* skills add for browser preview (dark background, padding, gap).
 * The .canvas-label chip is also hidden — it is for human preview, not the PDF.
 */
const ISOLATION_CSS = `
  html, body {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
    gap: 0 !important;
    min-height: 0 !important;
  }
  .canvas-label { display: none !important; }
`;

// ── CLI argument parsing ──────────────────────────────────────────────────────

function parseArgs(args) {
  const opts = { dir: '.', output: null, width: 1920, fullPage: false };
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--output' || arg === '-o') {
      opts.output = args[i + 1];
      i += 1;
    } else if (arg === '--width' || arg === '-w') {
      opts.width = Number.parseInt(args[i + 1], 10);
      i += 1;
    } else if (arg === '--full-page') {
      opts.fullPage = true;
    } else if (arg === '--help' || arg === '-h') {
      stdout.write(
        'Usage: node scripts/pdf-html.mjs <dir> [--output <dir>] [--width <px>] [--full-page]\n' +
        '\n' +
        'Exports .canvas / [class*="canvas-"] / .scene elements from design-* HTML\n' +
        'artifacts to single-page PDFs sized to each canvas\'s exact pixel dimensions.\n' +
        'Height is auto-measured from the rendered DOM; no --height flag is accepted.\n',
      );
      exit(0);
    } else if (arg === '--height') {
      stderr.write(
        '--height is not supported: PDF height is auto-measured from each canvas\'s rendered\n' +
        'bounding box. Remove --height and re-run.\n',
      );
      exit(2);
    } else if (arg.startsWith('--')) {
      stderr.write(`Unknown flag: ${arg}\n`);
      exit(2);
    } else {
      positional.push(arg);
    }
  }
  if (positional[0]) opts.dir = positional[0];
  if (!Number.isFinite(opts.width) || opts.width <= 0) {
    stderr.write('--width must be a positive integer\n');
    exit(2);
  }
  return opts;
}

// ── File discovery ────────────────────────────────────────────────────────────

async function findHtmlFiles(root) {
  const out = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      // Skip hidden dirs, node_modules, and both output subdirectories.
      if (
        entry.name.startsWith('.') ||
        entry.name === 'node_modules' ||
        entry.name === 'screenshots' ||
        entry.name === 'pdfs'
      ) continue;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.html') {
        out.push(full);
      }
    }
  }
  await walk(root);
  return out.sort();
}

// ── Target metadata ───────────────────────────────────────────────────────────

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function deriveTargetMetadata(handle) {
  return handle.evaluate((el) => {
    const id = el.id || '';
    const classes = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean);
    if (id && id.startsWith('scene-')) {
      return { id, classes, hint: id, isScene: true, sceneName: id.slice('scene-'.length) };
    }
    const canvasClasses = classes.filter((c) => c === 'canvas' || c.startsWith('canvas-'));
    let hint = '';
    if (canvasClasses.length > 0) {
      const modifier = canvasClasses.find((c) => c !== 'canvas');
      hint = modifier || canvasClasses[0];
    } else {
      hint = id || classes[0] || 'artifact';
    }
    return { id, classes, hint, isScene: false, sceneName: null };
  });
}

// ── Token-load guard (mirrored from screenshot-html.mjs) ─────────────────────

async function checkTokens(page, rel) {
  const failedStyles = [];
  page.on('requestfailed', (req) => {
    const t = req.resourceType();
    if (t === 'stylesheet' || /\.css(\?|$)/i.test(req.url())) {
      failedStyles.push({ url: req.url(), reason: req.failure()?.errorText || 'failed' });
    }
  });
  page.on('response', (resp) => {
    const req = resp.request();
    const t = req.resourceType();
    if ((t === 'stylesheet' || /\.css(\?|$)/i.test(req.url())) && resp.status() >= 400) {
      failedStyles.push({ url: req.url(), reason: `HTTP ${resp.status()}` });
    }
  });
  return failedStyles;
}

async function warnIfTokensMissing(page, rel, failedStyles) {
  const tokensMissing = await page.evaluate(() => {
    const el = document.querySelector('.canvas, [class*="canvas-"], .scene');
    if (!el) return false;
    if (!/var\(\s*--[\w-]+/.test(document.documentElement.innerHTML)) return false;
    const cs = getComputedStyle(el);
    const probes = [
      '--color-surface', '--color-bg', '--color-background',
      '--color-ink', '--color-text', '--color-fg',
      '--color-primary', '--color-accent',
    ];
    return probes.every((n) => cs.getPropertyValue(n).trim() === '');
  });

  if (failedStyles.length > 0 || tokensMissing) {
    stderr.write(`  ${rel} ⚠ design tokens may not have loaded — PDF may show fallback styles.\n`);
    for (const fs of failedStyles) {
      stderr.write(`    failed CSS: ${fs.url} (${fs.reason})\n`);
    }
    if (tokensMissing && failedStyles.length === 0) {
      stderr.write(`    no probed tokens (--color-surface, --color-ink, etc.) had values, despite var(--*) usage.\n`);
    }
    stderr.write(`    Likely cause: a relative @import (e.g. '../tokens.css') doesn't resolve from this directory.\n`);
    stderr.write(`    Fix: run the script against the artifact's native folder so relative imports resolve.\n`);
  }
}

// ── Collect top-level artifact handles from an already-loaded page ────────────

async function collectTopLevel(page) {
  const handles = await page.locator(ARTIFACT_SELECTOR).elementHandles();
  const topLevel = [];
  for (const handle of handles) {
    const isNested = await handle.evaluate((el, sel) => {
      let p = el.parentElement;
      while (p) {
        if (p.matches(sel)) return true;
        p = p.parentElement;
      }
      return false;
    }, ARTIFACT_SELECTOR);
    if (!isNested) {
      topLevel.push(handle);
    } else {
      await handle.dispose();
    }
  }
  return topLevel;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs(argv.slice(2));
  const inputDir = resolve(opts.dir);

  let inputStat;
  try {
    inputStat = await stat(inputDir);
  } catch {
    stderr.write(`Input directory not found: ${inputDir}\n`);
    exit(1);
  }
  if (!inputStat.isDirectory()) {
    stderr.write(`Input path is not a directory: ${inputDir}\n`);
    exit(1);
  }

  const outputDir = resolve(opts.output ?? join(inputDir, 'pdfs'));
  await mkdir(outputDir, { recursive: true });

  const { chromium } = await ensurePlaywright();
  const files = await findHtmlFiles(inputDir);
  if (files.length === 0) {
    stdout.write(`No .html files found under ${inputDir}\n`);
    return;
  }

  stdout.write(`Found ${files.length} HTML file(s). Output: ${outputDir}\n`);

  let browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    const msg = String(err && err.message || '');
    if (/Executable doesn'?t exist|playwright install/i.test(msg)) {
      stdout.write(`Chromium binary missing. Running 'playwright install chromium' (one-time)…\n`);
      await ensureChromium();
      browser = await chromium.launch();
    } else {
      throw err;
    }
  }

  // PDF rendering ignores deviceScaleFactor — omit it.
  // Viewport width only needs to be ≥ widest canvas; height is irrelevant since
  // page.pdf() measures the rendered DOM, not the viewport scroll area.
  const context = await browser.newContext({
    viewport: { width: opts.width, height: 900 },
  });

  let totalPdfs = 0;
  let totalFallbacks = 0;

  try {
    for (const file of files) {
      const rel = relative(inputDir, file);
      const stem = basename(file).replace(/\.html$/i, '');
      const fileUrl = pathToFileURL(file).href;

      // ── Discovery pass: one page load to collect canvas metadata ──────────
      // We need target count and hints before we can name the output files.
      // The actual PDF is generated in a fresh page per target (avoids DOM
      // mutation state leaking between canvases).

      let targetMetas = [];

      if (!opts.fullPage) {
        const discoverPage = await context.newPage();
        const failedStyles = checkTokens(discoverPage, rel);
        try {
          await discoverPage.goto(fileUrl, { waitUntil: 'networkidle' });
          await discoverPage.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});
          await warnIfTokensMissing(discoverPage, rel, await failedStyles);

          const topLevel = await collectTopLevel(discoverPage);
          for (const handle of topLevel) {
            targetMetas.push(await deriveTargetMetadata(handle));
            await handle.dispose();
          }
        } catch (err) {
          stderr.write(`  ${rel} FAILED to load (discovery): ${err.message}\n`);
          await discoverPage.close();
          continue;
        }
        await discoverPage.close();
      }

      // ── Resolve output filenames ───────────────────────────────────────────

      const targets = [];

      if (opts.fullPage || targetMetas.length === 0) {
        targets.push({ meta: null, outName: `${stem}.pdf`, index: -1, isFallback: !opts.fullPage });
      } else {
        const slugCounts = new Map();
        for (const meta of targetMetas) {
          const slug = slugify(meta.hint || 'artifact');
          slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
        }
        const slugSeen = new Map();

        for (let i = 0; i < targetMetas.length; i += 1) {
          const meta = targetMetas[i];
          const baseSlug = slugify(meta.hint || 'artifact');
          const total = slugCounts.get(baseSlug) || 1;
          const seen = (slugSeen.get(baseSlug) || 0) + 1;
          slugSeen.set(baseSlug, seen);

          const isOnly = targetMetas.length === 1;
          let outName;
          if (isOnly && (baseSlug === 'canvas' || baseSlug === '')) {
            outName = `${stem}.pdf`;
          } else if (total > 1) {
            outName = `${stem}--${baseSlug}-${seen}.pdf`;
          } else {
            outName = `${stem}--${baseSlug}.pdf`;
          }
          targets.push({ meta, outName, index: i, isFallback: false });
        }
      }

      // ── PDF generation: fresh page per target ─────────────────────────────
      // Loading the page fresh for each canvas avoids isolation CSS leaking
      // across targets (which matters for multi-canvas files like business cards).

      for (const { meta, outName, index, isFallback } of targets) {
        const outPath = join(outputDir, outName);
        await mkdir(dirname(outPath), { recursive: true });

        const page = await context.newPage();
        try {
          await page.goto(fileUrl, { waitUntil: 'networkidle' });
          await page.evaluate(() => document.fonts && document.fonts.ready).catch(() => {});

          if (isFallback || meta === null) {
            // Full-page PDF — measure scroll dimensions and render everything.
            const dims = await page.evaluate(() => ({
              w: document.documentElement.scrollWidth,
              h: document.documentElement.scrollHeight,
            }));
            await page.pdf({
              path: outPath,
              printBackground: true,
              width: dims.w + 'px',
              height: dims.h + 'px',
            });
            totalPdfs += 1;
            if (isFallback) totalFallbacks += 1;
            stdout.write(`  ${rel} → ${outName} (full-page${isFallback ? ', fallback' : ''})\n`);

          } else {
            // Canvas-targeted PDF.

            // Navigate scene hash before isolation so the correct state is active.
            if (meta.isScene && meta.sceneName) {
              await page.evaluate((name) => { window.location.hash = '#' + name; }, meta.sceneName);
              await page.waitForTimeout(50);
            }

            // Strip preview-backdrop: dark body bg, padding, gap, canvas-label chip.
            await page.addStyleTag({ content: ISOLATION_CSS });

            // If multiple canvases, hide non-targets so they don't appear in the PDF.
            await page.evaluate(({ targetIdx, sel }) => {
              const topLevel = [];
              document.querySelectorAll(sel).forEach((el) => {
                let nested = false;
                let p = el.parentElement;
                while (p) {
                  if (p.matches(sel)) { nested = true; break; }
                  p = p.parentElement;
                }
                if (!nested) topLevel.push(el);
              });

              topLevel.forEach((el, i) => {
                if (i !== targetIdx) {
                  el.style.display = 'none';
                } else {
                  el.style.margin = '0';
                }
              });
            }, { targetIdx: index, sel: ARTIFACT_SELECTOR });

            // Re-collect handles after DOM mutation so bounding boxes are fresh.
            const topLevel = await collectTopLevel(page);
            const targetHandle = topLevel[index];

            if (!targetHandle) {
              stderr.write(`  ${rel} ✗ ${outName} (target not found at index ${index}, skipped)\n`);
              for (const h of topLevel) await h.dispose();
              continue;
            }

            const box = await targetHandle.boundingBox();
            for (const h of topLevel) await h.dispose();

            if (!box || box.width === 0 || box.height === 0) {
              stderr.write(`  ${rel} ✗ ${outName} (target has no layout, skipped)\n`);
              continue;
            }

            await page.pdf({
              path: outPath,
              printBackground: true,
              width: Math.round(box.width) + 'px',
              height: Math.round(box.height) + 'px',
            });
            totalPdfs += 1;
            stdout.write(`  ${rel} → ${outName} (${Math.round(box.width)}×${Math.round(box.height)})\n`);
          }
        } catch (err) {
          stderr.write(`  ${rel} ✗ ${outName} FAILED: ${err.message}\n`);
        } finally {
          await page.close();
        }
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  stdout.write(`\nDone. ${totalPdfs} PDF(s)`);
  if (totalFallbacks > 0) stdout.write(` (${totalFallbacks} full-page fallback(s))`);
  stdout.write('.\n');
}

main().catch((err) => {
  stderr.write(`${err.stack ?? err.message ?? err}\n`);
  exit(1);
});
