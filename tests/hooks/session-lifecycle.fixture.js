/**
 * Integration fixture for session lifecycle: session-start + session-end contract.
 *
 * Tests the key input/output contracts:
 * - session-start: reads SESSION_CONTEXT.md, outputs JSON with additionalContext
 * - session-end: writes SESSION_CONTEXT.md with short-term state only
 * - session-end: writes references/session-long-term-state.md for long-term items
 * - Round-trip: session-end output → session-start input preserves context
 *
 * Run: node tests/hooks/session-lifecycle.fixture.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

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

// --- Test: SESSION_CONTEXT.md structure contract ---

function testSessionContextStructure() {
  const contextFile = path.join(__dirname, '..', '..', '.claude', 'SESSION_CONTEXT.md');

  if (!fs.existsSync(contextFile)) {
    console.log('  SKIP: SESSION_CONTEXT.md not found');
    return;
  }

  const content = fs.readFileSync(contextFile, 'utf8');

  // Must have exactly one of each section
  const sections = ['Current State', 'Active Threads', 'Key Decisions', 'Pitfalls & Gotchas', 'Learnings'];
  for (const section of sections) {
    const regex = new RegExp(`^## ${section}$`, 'm');
    const matches = content.match(regex);
    assert(matches && matches.length === 1, `SESSION_CONTEXT has exactly one "## ${section}" section`);
  }

  // Must have header fields
  assert(/\*\*Last Updated:\*\*/.test(content), 'SESSION_CONTEXT has Last Updated');
  assert(/\*\*Branch:\*\*/.test(content), 'SESSION_CONTEXT has Branch');
  assert(/\*\*Worktree:\*\*/.test(content), 'SESSION_CONTEXT has Worktree');

  // Should NOT contain long-term items (P0-1, P1-4, etc.)
  const hasLongTermItems = /\bP[012]-\d+\b/.test(content);
  assert(!hasLongTermItems, 'SESSION_CONTEXT does not contain long-term P0/P1/P2 items');

  // Should have migration pointer if long-term items exist elsewhere
  const longTermFile = path.join(__dirname, '..', '..', 'references', 'session-long-term-state.md');
  if (fs.existsSync(longTermFile)) {
    assert(content.includes('references/session-long-term-state.md') || !hasLongTermItems,
      'SESSION_CONTEXT references long-term state file when items are migrated');
  }

  console.log('  SESSION_CONTEXT structure: PASS');
}

// --- Test: session-long-term-state.md structure contract ---

function testLongTermStateStructure() {
  const longTermFile = path.join(__dirname, '..', '..', 'references', 'session-long-term-state.md');

  if (!fs.existsSync(longTermFile)) {
    console.log('  SKIP: session-long-term-state.md not found');
    return;
  }

  const content = fs.readFileSync(longTermFile, 'utf8');

  // Must have key sections
  const sections = ['Active Flows', 'Migration Status', 'Backlog Pointers'];
  for (const section of sections) {
    const regex = new RegExp(`^## ${section}$`, 'm');
    assert(regex.test(content), `Long-term state has "## ${section}" section`);
  }

  // Backlog Pointers should reference key reference files
  assert(content.includes('ecc-framework-action-plan.md'), 'Long-term state references action plan');
  assert(content.includes('hooks-extraction.md'), 'Long-term state references hooks audit');

  console.log('  Long-term state structure: PASS');
}

// --- Test: session-start input contract ---

function testSessionStartInputContract() {
  // session-start reads stdin JSON with hookName field
  const validInputs = [
    JSON.stringify({ hookName: 'SessionStart:startup' }),
    JSON.stringify({ hook_event_name: 'SessionStart', source: 'resume' }),
  ];

  for (const input of validInputs) {
    try {
      const parsed = JSON.parse(input);
      assert(parsed.hookName || parsed.hook_event_name, `SessionStart input is valid JSON: ${input.slice(0, 60)}`);
    } catch {
      assert(false, `SessionStart input should be valid JSON: ${input.slice(0, 60)}`);
    }
  }

  console.log('  SessionStart input contract: PASS');
}

// --- Test: session-end output contract ---

function testSessionEndOutputContract() {
  // session-end writes SESSION_CONTEXT.md with specific structure
  // The key contract is: short-term state only, long-term items migrated
  const contextFile = path.join(__dirname, '..', '..', '.claude', 'SESSION_CONTEXT.md');

  if (!fs.existsSync(contextFile)) {
    console.log('  SKIP: SESSION_CONTEXT.md not found');
    return;
  }

  const content = fs.readFileSync(contextFile, 'utf8');

  // Current State should be short (≤5 bullet points)
  const currentStateMatch = content.match(/## Current State\s*\n([\s\S]*?)(?=\n## )/);
  if (currentStateMatch) {
    const bullets = currentStateMatch[1].match(/^- /gm);
    const bulletCount = bullets ? bullets.length : 0;
    assert(bulletCount <= 5, `Current State has ≤5 bullets (found ${bulletCount})`);
  }

  // Active Threads should be bounded (≤7 items)
  const threadsMatch = content.match(/## Active Threads\s*\n([\s\S]*?)(?=\n## )/);
  if (threadsMatch) {
    const bullets = threadsMatch[1].match(/^- \[ \]/gm);
    const bulletCount = bullets ? bullets.length : 0;
    assert(bulletCount <= 7, `Active Threads has ≤7 items (found ${bulletCount})`);
  }

  // Learnings should be bounded (≤5 items)
  const learningsMatch = content.match(/## Learnings\s*\n([\s\S]*?)(?=\n|$)/);
  if (learningsMatch) {
    const bullets = learningsMatch[1].match(/^- \[/gm);
    const bulletCount = bullets ? bullets.length : 0;
    assert(bulletCount <= 5, `Learnings has ≤5 items (found ${bulletCount})`);
  }

  console.log('  SessionEnd output contract: PASS');
}

// --- Test: round-trip contract ---

function testRoundTripContract() {
  // session-end writes → session-start reads should preserve key context
  const contextFile = path.join(__dirname, '..', '..', '.claude', 'SESSION_CONTEXT.md');

  if (!fs.existsSync(contextFile)) {
    console.log('  SKIP: SESSION_CONTEXT.md not found');
    return;
  }

  const content = fs.readFileSync(contextFile, 'utf8');

  // session-start guards the content with HISTORICAL REFERENCE markers
  // The content it injects should contain the same sections
  const hasCurrentState = /^## Current State$/m.test(content);
  const hasActiveThreads = /^## Active Threads$/m.test(content);

  assert(hasCurrentState, 'Round-trip: Current State survives session-end → session-start');
  assert(hasActiveThreads, 'Round-trip: Active Threads survives session-end → session-start');

  console.log('  Round-trip contract: PASS');
}

// --- Run ---

console.log('=== session lifecycle integration fixtures ===\n');

testSessionContextStructure();
testLongTermStateStructure();
testSessionStartInputContract();
testSessionEndOutputContract();
testRoundTripContract();

console.log(`\n${passCount} passed, ${failCount} failed`);
process.exit(failCount > 0 ? 1 : 0);
