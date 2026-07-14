/**
 * Fixture tests for stop-format-typecheck.js ruff resolution.
 *
 * Tests the resolve-formatter.js module: project root detection,
 * ruff config detection, and ruff binary resolution with .venv fallback.
 *
 * Run: node tests/hooks/stop-format-typecheck.fixture.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { findProjectRoot, hasRuffConfig, resolveRuffBin, clearCaches } = require('../../.claude/hooks/lib/resolve-formatter');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    passCount++;
  } else {
    failCount++;
    console.error(`FAIL: ${message}`);
  }
}

// --- Test: findProjectRoot ---

function testFindProjectRoot() {
  clearCaches();

  // From this project's directory, should find a project root with pyproject.toml or setup.py
  const thisDir = path.resolve(__dirname, '../..');
  const root = findProjectRoot(thisDir);
  assert(typeof root === 'string' && root.length > 0, 'findProjectRoot returns a string');

  // Should find a marker file at the root
  const hasMarker = ['pyproject.toml', 'setup.py', 'setup.cfg', 'ruff.toml', '.ruff.toml']
    .some(m => fs.existsSync(path.join(root, m)));
  assert(hasMarker, `findProjectRoot finds a marker at ${root}`);
}

// --- Test: hasRuffConfig ---

function testHasRuffConfig() {
  clearCaches();

  const thisDir = path.resolve(__dirname, '../..');
  const root = findProjectRoot(thisDir);
  const hasConfig = hasRuffConfig(root);

  // This project should have ruff configured (pyproject.toml [tool.ruff] or ruff.toml)
  assert(typeof hasConfig === 'boolean', 'hasRuffConfig returns boolean');

  // Log result for manual verification
  console.log(`  hasRuffConfig("${root}") = ${hasConfig}`);
}

// --- Test: resolveRuffBin ---

function testResolveRuffBin() {
  clearCaches();

  const thisDir = path.resolve(__dirname, '../..');
  const root = findProjectRoot(thisDir);
  const resolved = resolveRuffBin(root);

  if (resolved) {
    assert(typeof resolved.bin === 'string', 'resolveRuffBin returns { bin: string }');
    assert(Array.isArray(resolved.prefix), 'resolveRuffBin returns { prefix: array }');

    // Check if the resolved binary exists
    const binExists = fs.existsSync(resolved.bin) || resolved.bin === 'ruff';
    assert(binExists, `Resolved ruff binary exists: ${resolved.bin}`);

    // Verify .venv preference: if .venv/bin/ruff exists, it should be preferred
    const venvRuff = path.join(root, '.venv', 'bin', 'ruff');
    if (fs.existsSync(venvRuff)) {
      assert(resolved.bin === venvRuff, `.venv/bin/ruff preferred over global: ${resolved.bin}`);
    }

    console.log(`  resolveRuffBin("${root}") = { bin: "${resolved.bin}", prefix: [${resolved.prefix}] }`);
  } else {
    console.log('  resolveRuffBin: ruff not found (skipping binary checks)');
  }
}

// --- Test: resolveRuffBin without .venv ---

function testResolveRuffBinFallback() {
  clearCaches();

  // Use /tmp as a project root with no .venv
  const tmpRoot = os.tmpdir();
  const resolved = resolveRuffBin(tmpRoot);

  // Should either find ruff on PATH or return null
  if (resolved) {
    assert(resolved.bin === 'ruff' || resolved.bin.endsWith('/ruff') || resolved.bin.endsWith('\\ruff.exe'),
      `Fallback resolves to global ruff: ${resolved.bin}`);
    console.log(`  Fallback: ${resolved.bin}`);
  } else {
    console.log('  Fallback: ruff not on PATH (expected in some environments)');
  }
}

// --- Run ---

console.log('=== stop-format-typecheck ruff resolution fixtures ===\n');

testFindProjectRoot();
testHasRuffConfig();
testResolveRuffBin();
testResolveRuffBinFallback();

console.log(`\n${passCount} passed, ${failCount} failed`);
process.exit(failCount > 0 ? 1 : 0);
