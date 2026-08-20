#!/usr/bin/env node
/**
 * Config Protection Hook
 *
 * Blocks modifications to linter/formatter config files.
 * Agents frequently modify these to make checks pass instead of fixing
 * the actual code. This hook steers the agent back to fixing the source.
 *
 * Exit codes:
 *   0 = allow (not a config file, or first-time creation of one)
 *   2 = block (existing config file modification attempted)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MAX_STDIN = 1024 * 1024;
let raw = '';

const PROTECTED_FILES = new Set([
  // --- Python project configuration ---
  'pyproject.toml',
  'setup.cfg',
  'setup.py',
  'conda-lock.yml',
  'requirements.txt',
  'requirements-dev.txt',
  'requirements-test.txt',
  'Pipfile',
  'Pipfile.lock',
  'pdm.lock',
  'uv.lock',
  '.pre-commit-config.yaml',
  '.pre-commit-config.yml',
  'ruff.toml',
  '.ruff.toml',
  'mypy.ini',
  '.mypy.ini',
  'pytest.ini',
  'conftest.py',
  '.flake8',
  'tox.ini',
  '.python-version',
  // --- Credentials & secrets ---
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
  'credentials.json',
  '.netrc',
  // --- Claude settings ---
  'settings.json', // .claude/settings.json matched by path check below
  // --- JS/TS residual (keep for mixed projects) ---
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.json',
  '.eslintrc.yml',
  '.eslintrc.yaml',
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.cjs',
  '.prettierrc',
  '.prettierrc.js',
  '.prettierrc.cjs',
  '.prettierrc.json',
  '.prettierrc.yml',
  '.prettierrc.yaml',
  'prettier.config.js',
  'prettier.config.cjs',
  'prettier.config.mjs',
  'biome.json',
  'biome.jsonc',
  '.shellcheckrc',
  '.stylelintrc',
  '.stylelintrc.json',
  '.stylelintrc.yml',
  '.markdownlint.json',
  '.markdownlint.yaml',
  '.markdownlintrc'
]);

const PROTECTED_PATH_PATTERNS = [
  /\.claude[\\/]settings\.json$/i,
  /\.env[\\/]/i,
];

function parseInput(inputOrRaw) {
  if (typeof inputOrRaw === 'string') {
    try {
      return inputOrRaw.trim() ? JSON.parse(inputOrRaw) : {};
    } catch {
      return {};
    }
  }

  return inputOrRaw && typeof inputOrRaw === 'object' ? inputOrRaw : {};
}

/**
 * Exportable run() for in-process execution via run-with-flags.js.
 * Avoids the ~50-100ms spawnSync overhead when available.
 */
function run(inputOrRaw, options = {}) {
  if (options.truncated) {
    return {
      exitCode: 2,
      stderr:
        `BLOCKED: Hook input exceeded ${options.maxStdin || MAX_STDIN} bytes. ` +
        'Refusing to bypass config-protection on a truncated payload. ' +
        'Retry with a smaller edit or disable the config-protection hook temporarily.'
    };
  }

  const input = parseInput(inputOrRaw);
  const filePath = input?.tool_input?.file_path || input?.tool_input?.file || '';
  if (!filePath) return { exitCode: 0 };

  const basename = path.basename(filePath);
  if (PROTECTED_FILES.has(basename) || PROTECTED_PATH_PATTERNS.some(p => p.test(filePath))) {
    // Allow first-time creation — there's no existing config to weaken.
    // The hook's purpose is blocking modifications; writing a brand-new
    // config file in a project that has none is a legitimate bootstrap
    // path (e.g. scaffolding ESLint into a fresh repo).
    //
    // Fail closed on any stat error other than ENOENT. Use lstatSync so a
    // symlink at the protected path is treated as present even if its target
    // is missing — a dangling symlink at e.g. .eslintrc.js still represents
    // an existing config entry that an agent should not silently replace.
    // fs.existsSync would swallow EACCES/EPERM as false; lstatSync exposes
    // the error code so we can treat only genuine "path not found" (ENOENT)
    // as absent.
    let exists = true;
    try {
      fs.lstatSync(filePath);
      // lstat succeeded — something (file, dir, or symlink) exists here.
    } catch (err) {
      if (err && err.code === 'ENOENT') {
        exists = false;
      }
      // Any other error (EACCES, EPERM, ELOOP, etc.) leaves exists=true
      // so the guard is never silently weakened.
    }

    if (!exists) {
      return { exitCode: 0 };
    }

    return {
      exitCode: 2,
      stderr:
        `BLOCKED: Modifying ${basename} is not allowed. ` +
        'Fix the source code to satisfy linter/formatter rules instead of ' +
        'weakening the config. If this is a legitimate config change, ' +
        'disable the config-protection hook temporarily.'
    };
  }

  return { exitCode: 0 };
}

module.exports = { run };

// Stdin fallback for spawnSync execution
let truncated = /^(1|true|yes)$/i.test(String(process.env.ECC_HOOK_INPUT_TRUNCATED || ''));
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  if (raw.length < MAX_STDIN) {
    const remaining = MAX_STDIN - raw.length;
    raw += chunk.substring(0, remaining);
    if (chunk.length > remaining) truncated = true;
  } else {
    truncated = true;
  }
});

process.stdin.on('end', () => {
  const result = run(raw, {
    truncated,
    maxStdin: Number(process.env.ECC_HOOK_INPUT_MAX_BYTES) || MAX_STDIN
  });

  if (result.stderr) {
    process.stderr.write(result.stderr + '\n');
  }

  if (result.exitCode === 2) {
    process.exit(2);
  }

  process.stdout.write(raw);
});
