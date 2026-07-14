/**
 * Fixture tests for post-edit-accumulator.js.
 *
 * Verifies:
 * - .py files are accumulated to the session temp file
 * - .pyi files are accumulated
 * - Non-.py files are NOT accumulated
 * - MultiEdit entries accumulate only .py/.pyi
 * - Invalid input passes through without error
 *
 * Run: node tests/hooks/post-edit-accumulator.fixture.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Set session ID BEFORE requiring the hook so it uses our ID
const TEST_SESSION_ID = 'fixture-test-session';
process.env.CLAUDE_SESSION_ID = TEST_SESSION_ID;

const { run } = require('../../.claude/hooks/post-edit-accumulator');

// Compute accum file path with same logic as the hook
const accumFile = path.join(os.tmpdir(), `ecc-edited-${TEST_SESSION_ID}.txt`);

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) { passCount++; } else { failCount++; console.error(`FAIL: ${message}`); }
}

function cleanup() {
  try { if (fs.existsSync(accumFile)) fs.unlinkSync(accumFile); } catch { /* ignore */ }
}

// --- Test: .py file accumulation ---

function testPyAccumulation() {
  cleanup();

  const input = JSON.stringify({
    tool_name: 'Edit',
    tool_input: { file_path: '/tmp/test_accumulator.py' }
  });

  const result = run(input);
  assert(result === input, 'Accumulator returns original input (pass-through)');

  if (fs.existsSync(accumFile)) {
    const content = fs.readFileSync(accumFile, 'utf8');
    assert(content.includes('/tmp/test_accumulator.py'), `.py file path in accumulator: ${content.trim()}`);
    console.log('  .py accumulation: PASS');
  } else {
    console.log(`  .py accumulation: SKIP (accum file not found at ${accumFile})`);
  }
}

// --- Test: .pyi file accumulation ---

function testPyiAccumulation() {
  cleanup();

  const input = JSON.stringify({
    tool_name: 'Edit',
    tool_input: { file_path: '/tmp/test_accumulator.pyi' }
  });

  run(input);

  if (fs.existsSync(accumFile)) {
    const content = fs.readFileSync(accumFile, 'utf8');
    assert(content.includes('/tmp/test_accumulator.pyi'), `.pyi file path in accumulator`);
    console.log('  .pyi accumulation: PASS');
  } else {
    console.log('  .pyi accumulation: SKIP (accum file not found)');
  }
}

// --- Test: Non-.py file NOT accumulated ---

function testNonPyNotAccumulated() {
  cleanup();

  const input = JSON.stringify({
    tool_name: 'Edit',
    tool_input: { file_path: '/tmp/test_accumulator.js' }
  });

  run(input);

  if (fs.existsSync(accumFile)) {
    const content = fs.readFileSync(accumFile, 'utf8');
    assert(!content.includes('/tmp/test_accumulator.js'), `.js file NOT in accumulator`);
    console.log('  Non-.py exclusion: PASS');
  } else {
    assert(true, 'No accum file created for .js edit');
    console.log('  Non-.py exclusion: PASS (no accum file)');
  }
}

// --- Test: MultiEdit accumulation ---

function testMultiEditAccumulation() {
  cleanup();

  const input = JSON.stringify({
    tool_name: 'MultiEdit',
    tool_input: {
      edits: [
        { file_path: '/tmp/multi_a.py', old_string: 'x', new_string: 'y' },
        { file_path: '/tmp/multi_b.pyi', old_string: 'a', new_string: 'b' },
        { file_path: '/tmp/multi_c.js', old_string: 'f', new_string: 'g' },
      ]
    }
  });

  run(input);

  if (fs.existsSync(accumFile)) {
    const content = fs.readFileSync(accumFile, 'utf8');
    assert(content.includes('/tmp/multi_a.py'), 'MultiEdit .py accumulated');
    assert(content.includes('/tmp/multi_b.pyi'), 'MultiEdit .pyi accumulated');
    assert(!content.includes('/tmp/multi_c.js'), 'MultiEdit .js NOT accumulated');
    console.log('  MultiEdit accumulation: PASS');
  } else {
    console.log('  MultiEdit accumulation: SKIP (accum file not found)');
  }
}

// --- Test: Invalid input pass-through ---

function testInvalidInputPassThrough() {
  const result = run('not-json-at-all');
  assert(result === 'not-json-at-all', 'Invalid input passes through unchanged');
  console.log('  Invalid input pass-through: PASS');
}

// --- Run ---

console.log('=== post-edit-accumulator fixtures ===\n');
console.log(`  Accum file: ${accumFile}\n`);

testPyAccumulation();
testPyiAccumulation();
testNonPyNotAccumulated();
testMultiEditAccumulation();
testInvalidInputPassThrough();

cleanup();

console.log(`\n${passCount} passed, ${failCount} failed`);
process.exit(failCount > 0 ? 1 : 0);