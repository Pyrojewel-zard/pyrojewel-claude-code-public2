/**
 * Fixture tests for evaluate-session.js.
 *
 * Verifies:
 * - decision-like user messages produce learning files
 * - error->resolution patterns produce learning files
 * - duplicate runs overwrite by id instead of exploding file count
 *
 * Run: node tests/hooks/evaluate-session.fixture.js
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  parseTranscriptEntries,
  extractPitfallLearnings,
  extractDecisionLearnings,
  dedupeLearnings,
  writeLearnings,
} = require('../../.claude/hooks/evaluate-session');

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

function buildTranscript(lines) {
  return lines.map(line => JSON.stringify(line)).join('\n');
}

function testDecisionLearning() {
  const transcript = buildTranscript([
    { type: 'user', message: { role: 'user', content: '我们决定用 pyrojewel-beamer-academic 替代 pyrojewel-academic-ppt。' } },
  ]);
  const entries = parseTranscriptEntries(transcript);
  const learnings = extractDecisionLearnings(entries);
  assert(learnings.length >= 1, 'Decision transcript yields at least one learning');
  assert(learnings[0].id.startsWith('decision-'), 'Decision learning id has decision- prefix');
  console.log('  Decision learning extraction: PASS');
}

function testPitfallLearning() {
  const transcript = buildTranscript([
    { type: 'user', message: { role: 'user', content: 'xelatex not working, 报错了。' } },
    { type: 'assistant', message: { role: 'assistant', content: 'Try switching to a valid TeX installation.' } },
    { type: 'user', message: { role: 'user', content: '好了，换成 xelatex 路径后 works 了。' } },
  ]);
  const entries = parseTranscriptEntries(transcript);
  const learnings = extractPitfallLearnings(entries);
  assert(learnings.length >= 1, 'Pitfall transcript yields at least one learning');
  assert(learnings[0].id.startsWith('pitfall-'), 'Pitfall learning id has pitfall- prefix');
  console.log('  Pitfall learning extraction: PASS');
}

function testWriteAndOverwrite() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'eval-session-fixture-'));
  const projectRoot = path.join(tmpRoot, 'project');
  fs.mkdirSync(path.join(projectRoot, '.claude'), { recursive: true });

  const transcript = buildTranscript([
    { type: 'user', message: { role: 'user', content: '我们选择用 o3 instead of gpt-5.5。' } },
  ]);
  const entries = parseTranscriptEntries(transcript);
  const learnings = dedupeLearnings(extractDecisionLearnings(entries));

  const first = writeLearnings(projectRoot, learnings);
  const second = writeLearnings(projectRoot, learnings);

  const learningsDir = path.join(projectRoot, '.claude', 'learnings');
  const files = fs.readdirSync(learningsDir).filter(f => f.endsWith('.yml'));

  assert(first.length === 1, 'First write produces one learning file');
  assert(second.length === 1, 'Second write reports one learning file');
  assert(files.length === 1, 'Repeated write overwrites same file instead of duplicating');
  console.log('  Learning write/overwrite: PASS');
}

console.log('=== evaluate-session fixtures ===\n');

testDecisionLearning();
testPitfallLearning();
testWriteAndOverwrite();

console.log(`\n${passCount} passed, ${failCount} failed`);
process.exit(failCount > 0 ? 1 : 0);
