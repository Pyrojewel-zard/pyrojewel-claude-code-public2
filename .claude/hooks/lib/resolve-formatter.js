/**
 * Shared formatter/linter resolution utilities with caching.
 *
 * Adapted from ECC's resolve-formatter.js for Python/ruff workflow.
 * Replaces Biome/Prettier detection with ruff format + ruff check.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── Caches (per-process, cleared on next hook invocation) ───────────
const projectRootCache = new Map();
const ruffBinCache = new Map();

// ── Config file lists (single source of truth) ─────────────────────

const RUFF_CONFIGS = ['ruff.toml', '.ruff.toml'];

const PROJECT_ROOT_MARKERS = [
  'pyproject.toml',
  'setup.py',
  'setup.cfg',
  ...RUFF_CONFIGS
];

// ── Public helpers ──────────────────────────────────────────────────

/**
 * Walk up from `startDir` until a directory containing a known project
 * root marker (pyproject.toml, setup.py, ruff config) is found.
 * Returns `startDir` as fallback when no marker exists above it.
 *
 * @param {string} startDir - Absolute directory path to start from
 * @returns {string} Absolute path to the project root
 */
function findProjectRoot(startDir) {
  if (projectRootCache.has(startDir)) return projectRootCache.get(startDir);

  let dir = startDir;
  while (dir !== path.dirname(dir)) {
    for (const marker of PROJECT_ROOT_MARKERS) {
      if (fs.existsSync(path.join(dir, marker))) {
        projectRootCache.set(startDir, dir);
        return dir;
      }
    }
    dir = path.dirname(dir);
  }

  projectRootCache.set(startDir, startDir);
  return startDir;
}

/**
 * Check if ruff is configured in the project (ruff.toml, .ruff.toml,
 * or [tool.ruff] in pyproject.toml).
 *
 * @param {string} projectRoot - Absolute path to the project root
 * @returns {boolean}
 */
function hasRuffConfig(projectRoot) {
  for (const cfg of RUFF_CONFIGS) {
    if (fs.existsSync(path.join(projectRoot, cfg))) return true;
  }

  try {
    const pyprojectPath = path.join(projectRoot, 'pyproject.toml');
    if (fs.existsSync(pyprojectPath)) {
      const content = fs.readFileSync(pyprojectPath, 'utf8');
      if (/\[tool\.ruff\]/.test(content)) return true;
    }
  } catch {
    // Malformed pyproject.toml — continue
  }

  return false;
}

/**
 * Resolve the ruff binary, preferring the local virtualenv installation
 * over the global PATH to match the project's Python environment.
 *
 * Search order:
 * 1. .venv/bin/ruff (standard venv)
 * 2. venv/bin/ruff
 * 3. Global PATH `ruff`
 *
 * @param {string} projectRoot - Absolute path to the project root
 * @returns {{ bin: string, prefix: string[] } | null}
 */
function resolveRuffBin(projectRoot) {
  if (ruffBinCache.has(projectRoot)) return ruffBinCache.get(projectRoot);

  const isWin = process.platform === 'win32';
  const venvDirs = ['.venv', 'venv'];
  const binDir = isWin ? 'Scripts' : 'bin';
  const binName = isWin ? 'ruff.exe' : 'ruff';

  for (const venv of venvDirs) {
    const localBin = path.join(projectRoot, venv, binDir, binName);
    if (fs.existsSync(localBin)) {
      const result = { bin: localBin, prefix: [] };
      ruffBinCache.set(projectRoot, result);
      return result;
    }
  }

  // Fallback: check if ruff is available on PATH
  try {
    const { execFileSync } = require('child_process');
    const whichCmd = isWin ? 'where' : 'which';
    execFileSync(whichCmd, ['ruff'], { encoding: 'utf8', timeout: 3000 });
    const result = { bin: 'ruff', prefix: [] };
    ruffBinCache.set(projectRoot, result);
    return result;
  } catch {
    // ruff not found on PATH
  }

  ruffBinCache.set(projectRoot, null);
  return null;
}

/**
 * Clear all caches. Useful for testing.
 */
function clearCaches() {
  projectRootCache.clear();
  ruffBinCache.clear();
}

module.exports = {
  findProjectRoot,
  hasRuffConfig,
  resolveRuffBin,
  clearCaches
};
