/**
 * Fixture tests for config-protection.js.
 *
 * Verifies:
 * - Protected Python config files (pyproject.toml, ruff.toml) are blocked when they exist
 * - Protected files are allowed on first-time creation (ENOENT)
 * - Non-protected files pass through
 * - Protected path patterns (.claude/settings.json) are blocked
 *
 * Run: node tests/hooks/config-protection.fixture.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const { run } = require('../../.claude/hooks/config-protection');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) { passCount++; } else { failCount++; console.error(`FAIL: ${message}`); }
}

// --- Test: Block existing protected file ---

function testBlockExistingProtected() {
  // Create a temp protected file, then try to edit it
  const tmpDir = path.join(os.tmpdir(), `config-protect-fixture-${process.pid}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const protectedFile = path.join(tmpDir, 'pyproject.toml');
  fs.writeFileSync(protectedFile, '[tool.ruff]\n', 'utf8');

  const input = JSON.stringify({
    tool_name: 'Edit',
    tool_input: { file_path: protectedFile }
  });

  const result = run(input);
  assert(result.exitCode === 2, `pyproject.toml edit blocked (exitCode=${result.exitCode})`);
  assert(result.stderr && result.stderr.includes('BLOCKED'), `pyproject.toml stderr contains "BLOCKED"`);
  console.log('  Block existing pyproject.toml: PASS');

  // Test ruff.toml
  const ruffFile = path.join(tmpDir, 'ruff.toml');
  fs.writeFileSync(ruffFile, 'line-length = 88\n', 'utf8');

  const input2 = JSON.stringify({
    tool_name: 'Edit',
    tool_input: { file_path: ruffFile }
  });

  const result2 = run(input2);
  assert(result2.exitCode === 2, `ruff.toml edit blocked (exitCode=${result2.exitCode})`);
  console.log('  Block existing ruff.toml: PASS');

  // Cleanup
  fs.unlinkSync(protectedFile);
  fs.unlinkSync(ruffFile);
  try { fs.rmdirSync(tmpDir); } catch { /* ignore */ }
}

// --- Test: Allow first-time creation of protected file ---

function testAllowFirstTimeCreation() {
  const tmpDir = path.join(os.tmpdir(), `config-protect-fixture-new-${process.pid}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  // File does NOT exist yet — first-time creation should be allowed
  const newFile = path.join(tmpDir, 'pyproject.toml');

  const input = JSON.stringify({
    tool_name: 'Write',
    tool_input: { file_path: newFile }
  });

  const result = run(input);
  assert(result.exitCode === 0, `pyproject.toml first-time creation allowed (exitCode=${result.exitCode})`);
  console.log('  Allow first-time pyproject.toml creation: PASS');

  try { fs.rmdirSync(tmpDir); } catch { /* ignore */ }
}

// --- Test: Non-protected file passes through ---

function testNonProtectedPassThrough() {
  const input = JSON.stringify({
    tool_name: 'Edit',
    tool_input: { file_path: '/tmp/regular_file.py' }
  });

  const result = run(input);
  assert(result.exitCode === 0, `Non-protected .py file passes through (exitCode=${result.exitCode})`);
  console.log('  Non-protected file pass-through: PASS');
}

// --- Test: Protected path pattern (.claude/settings.json) ---

function testProtectedPathPattern() {
  // .claude/settings.json is matched by PROTECTED_PATH_PATTERNS
  const settingsPath = path.join(process.cwd(), '.claude', 'settings.json');

  // If the file exists, it should be blocked
  if (fs.existsSync(settingsPath)) {
    const input = JSON.stringify({
      tool_name: 'Edit',
      tool_input: { file_path: settingsPath }
    });

    const result = run(input);
    assert(result.exitCode === 2, `.claude/settings.json edit blocked (exitCode=${result.exitCode})`);
    console.log('  Block .claude/settings.json: PASS');
  } else {
    // File doesn't exist — creation allowed
    const input = JSON.stringify({
      tool_name: 'Write',
      tool_input: { file_path: settingsPath }
    });

    const result = run(input);
    assert(result.exitCode === 0, `.claude/settings.json creation allowed (exitCode=${result.exitCode})`);
    console.log('  Allow .claude/settings.json creation: PASS');
  }
}

// --- Test: Credentials files blocked ---

function testCredentialsBlocked() {
  const tmpDir = path.join(os.tmpdir(), `config-protect-fixture-creds-${process.pid}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const envFile = path.join(tmpDir, '.env');
  fs.writeFileSync(envFile, 'SECRET=abc\n', 'utf8');

  const input = JSON.stringify({
    tool_name: 'Edit',
    tool_input: { file_path: envFile }
  });

  const result = run(input);
  assert(result.exitCode === 2, `.env edit blocked (exitCode=${result.exitCode})`);
  console.log('  Block .env: PASS');

  fs.unlinkSync(envFile);
  try { fs.rmdirSync(tmpDir); } catch { /* ignore */ }
}

// --- Run ---

console.log('=== config-protection fixtures ===\n');

testBlockExistingProtected();
testAllowFirstTimeCreation();
testNonProtectedPassThrough();
testProtectedPathPattern();
testCredentialsBlocked();

console.log(`\n${passCount} passed, ${failCount} failed`);
process.exit(failCount > 0 ? 1 : 0);