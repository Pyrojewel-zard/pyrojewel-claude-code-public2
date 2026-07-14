#!/usr/bin/env node
/**
 * Stop Hook: Batch format and lint all Python files edited this response
 *
 * Adapted from ECC's stop-format-typecheck.js for Python/ruff workflow.
 * Replaces Biome/Prettier formatting + tsc typecheck with ruff format + ruff check.
 *
 * Reads the accumulator written by post-edit-accumulator.js and processes all
 * edited files in one pass: groups files by project root for a single ruff
 * invocation per root. The accumulator is cleared on read so repeated
 * Stop calls do not double-process files.
 *
 * Per-batch timeout is proportional to the number of batches so the total
 * never exceeds the Stop hook budget (90 s reserved for overhead).
 */

'use strict';

const crypto = require('crypto');
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { findProjectRoot, hasRuffConfig, resolveRuffBin } = require('./lib/resolve-formatter');

const MAX_STDIN = 1024 * 1024;
// Total ms budget reserved for all batches (leaves headroom below the 300s Stop timeout)
const TOTAL_BUDGET_MS = 270_000;

// Characters cmd.exe treats as separators/operators when shell: true is used.
const UNSAFE_PATH_CHARS = /[&|<>^%!\s()]/;

/** Parse the accumulator text into a deduplicated array of file paths. */
function parseAccumulator(raw) {
  return [...new Set(raw.split('\n').map(l => l.trim()).filter(Boolean))];
}

function getAccumFile() {
  const raw =
    process.env.CLAUDE_SESSION_ID ||
    crypto.createHash('sha1').update(process.cwd()).digest('hex').slice(0, 12);
  const sessionId = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
  return path.join(os.tmpdir(), `ecc-edited-${sessionId}.txt`);
}

/**
 * Run `ruff format` on a batch of Python files.
 * If ruff is configured in the project, format in-place; otherwise skip.
 */
function formatBatch(projectRoot, files, timeoutMs) {
  const resolved = resolveRuffBin(projectRoot);
  if (!resolved) return;

  const existingFiles = files.filter(f => fs.existsSync(f));
  if (existingFiles.length === 0) return;

  const args = [...resolved.prefix, 'format', ...existingFiles];

  try {
    if (process.platform === 'win32' && resolved.bin.endsWith('.exe')) {
      if (existingFiles.some(f => UNSAFE_PATH_CHARS.test(f))) {
        process.stderr.write('[Hook] stop-format-typecheck: skipping format batch — unsafe path chars\n');
        return;
      }
      const result = spawnSync(resolved.bin, args, { cwd: projectRoot, shell: true, stdio: 'pipe', timeout: timeoutMs });
      if (result.error) throw result.error;
    } else {
      execFileSync(resolved.bin, args, { cwd: projectRoot, stdio: ['pipe', 'pipe', 'pipe'], timeout: timeoutMs });
    }
  } catch (err) {
    const output = (err.stderr || err.stdout || '').toString();
    if (output) {
      process.stderr.write(`[Hook] ruff format errors:\n${output}\n`);
    }
  }
}

/**
 * Run `ruff check --fix` on a batch of Python files.
 * Reports lint errors for files that were edited this session.
 */
function lintBatch(projectRoot, files, timeoutMs) {
  const resolved = resolveRuffBin(projectRoot);
  if (!resolved) return;

  const existingFiles = files.filter(f => fs.existsSync(f));
  if (existingFiles.length === 0) return;

  // Run ruff check with --fix to auto-fix safe issues, but report remaining errors
  const args = [...resolved.prefix, 'check', '--fix', ...existingFiles];

  let stdout = '';
  let stderr = '';
  let failed = false;

  try {
    if (process.platform === 'win32' && resolved.bin.endsWith('.exe')) {
      const result = spawnSync(resolved.bin, args, { cwd: projectRoot, shell: true, stdio: 'pipe', timeout: timeoutMs });
      if (result.error) return;
      if (result.status !== 0) {
        stdout = result.stdout || '';
        stderr = result.stderr || '';
        failed = true;
      }
    } else {
      execFileSync(resolved.bin, args, { cwd: projectRoot, stdio: ['pipe', 'pipe', 'pipe'], timeout: timeoutMs });
    }
  } catch (err) {
    stdout = (err.stdout || '').toString();
    stderr = (err.stderr || '').toString();
    failed = true;
  }

  if (!failed) return;

  // Filter lint output to only show errors in edited files
  const lines = (stdout + stderr).split('\n');
  const relevantLines = lines
    .filter(line => {
      for (const filePath of existingFiles) {
        if (line.includes(filePath) || line.includes(path.basename(filePath))) return true;
      }
      return false;
    })
    .slice(0, 15);

  if (relevantLines.length > 0) {
    process.stderr.write(`[Hook] ruff check errors:\n`);
    relevantLines.forEach(line => process.stderr.write(line + '\n'));
  }
}

function main() {
  const accumFile = getAccumFile();

  let raw;
  try {
    raw = fs.readFileSync(accumFile, 'utf8');
  } catch {
    return; // No accumulator — nothing edited this response
  }

  try { fs.unlinkSync(accumFile); } catch { /* best-effort */ }

  const files = parseAccumulator(raw);
  if (files.length === 0) return;

  // Group Python files by project root
  const byProjectRoot = new Map();
  for (const filePath of files) {
    if (!/\.pyi?$/.test(filePath)) continue;
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) continue;
    const root = findProjectRoot(path.dirname(resolved));
    if (!byProjectRoot.has(root)) byProjectRoot.set(root, []);
    byProjectRoot.get(root).push(resolved);
  }

  // Distribute the budget evenly across all batches (format + lint per root = 2 batches per root)
  const totalBatches = byProjectRoot.size * 2;
  const perBatchMs = totalBatches > 0 ? Math.floor(TOTAL_BUDGET_MS / totalBatches) : 60_000;

  for (const [root, batch] of byProjectRoot) {
    formatBatch(root, batch, perBatchMs);
    lintBatch(root, batch, perBatchMs);
  }
}

/**
 * Exported so run-with-flags.js uses require() instead of spawnSync,
 * letting the 300s hooks.json timeout govern the full batch.
 *
 * @param {string} rawInput - Raw JSON string from stdin (Stop event payload)
 * @returns {string} The original input (pass-through)
 */
function run(rawInput) {
  try {
    main();
  } catch (err) {
    process.stderr.write(`[Hook] stop-format-typecheck error: ${err.message}\n`);
  }
  return rawInput;
}

if (require.main === module) {
  let stdinData = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    if (stdinData.length < MAX_STDIN) stdinData += chunk.substring(0, MAX_STDIN - stdinData.length);
  });
  process.stdin.on('end', () => {
    process.stdout.write(run(stdinData));
    process.exit(0);
  });
}

module.exports = { run, parseAccumulator };
