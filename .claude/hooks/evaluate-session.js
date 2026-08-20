#!/usr/bin/env node
/**
 * Continuous Learning - Session Evaluator
 *
 * Runs on Stop hook. Reads transcript_path from stdin JSON and extracts a
 * small number of reusable learnings into .claude/learnings/*.yml.
 *
 * Extraction targets:
 *   1. Pitfalls — user reports an error/problem, later the thread indicates it
 *      was fixed or a concrete workaround was chosen.
 *   2. Decisions — user explicitly chooses one approach over another.
 *
 * The hook is intentionally conservative:
 * - at most 3 learnings per session
 * - overwrite existing learnings by id instead of creating duplicates
 * - skip very weak or generic patterns
 */

'use strict';

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const {
  ensureDir,
  readFile,
  stripAnsi,
  log
} = require('./lib/utils');

const MAX_STDIN = 1024 * 1024;
const MAX_LEARNINGS_PER_SESSION = 3;
const MIN_TEXT_LEN = 8;

const ERROR_KEYWORDS = [
  'error', 'failed', 'fail', 'bug', 'broken', 'crash', 'issue', 'problem',
  'wrong', 'incorrect', 'not working', 'doesn\'t work', 'blocked',
  '不行', '出错', '失败', '报错', '坏了', '卡住'
];

const RESOLVE_KEYWORDS = [
  'fixed', 'resolved', 'works', 'working', 'success', 'done',
  'switched to', 'use ', 'using ', 'migrated', 'adapted',
  '解决了', '好了', '修好了', '改成', '换成', '用 '
];

const DECISION_KEYWORDS = [
  'prefer', 'instead of', 'rather than', 'chose', 'choose', 'use ',
  'switch to', 'migrate to', 'officially replace',
  '选择', '决定', '偏好', '不用', '改成', '换成', '替代'
];

function safeText(raw) {
  return stripAnsi(String(raw || ''))
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text, max = 180) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function slugify(text) {
  const ascii = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  if (ascii) return ascii;
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 10);
}

function parseTranscriptEntries(content) {
  const lines = content.split('\n').filter(Boolean);
  const entries = [];

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      const role =
        entry.message?.role ||
        entry.role ||
        entry.type ||
        null;

      let rawContent = entry.message?.content ?? entry.content ?? '';
      if (Array.isArray(rawContent)) {
        rawContent = rawContent
          .map(block => {
            if (typeof block === 'string') return block;
            if (block && typeof block.text === 'string') return block.text;
            return '';
          })
          .join(' ');
      }

      const text = safeText(rawContent);
      if (!text || text.length < MIN_TEXT_LEN) continue;

      if (role === 'user' || role === 'assistant') {
        entries.push({ role, text });
      }
    } catch {
      // Ignore malformed lines.
    }
  }

  return entries;
}

function hasAny(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some(keyword => lower.includes(keyword));
}

function extractPitfallLearnings(entries) {
  const learnings = [];

  for (let i = 0; i < entries.length; i++) {
    const current = entries[i];
    if (current.role !== 'user') continue;
    if (!hasAny(current.text, ERROR_KEYWORDS)) continue;

    const window = entries.slice(i + 1, i + 5);
    const resolution = window.find(item => hasAny(item.text, RESOLVE_KEYWORDS));
    if (!resolution) continue;

    const trigger = truncate(current.text, 140);
    const action = truncate(`When this pattern appears, reuse the fix/workaround captured in the same thread: ${resolution.text}`, 220);
    const id = `pitfall-${slugify(`${trigger}-${resolution.text}`)}`;

    learnings.push({
      id,
      confidence: 0.85,
      trigger,
      action,
      source: 'evaluate-session: error-to-fix pattern',
    });
  }

  return learnings;
}

function extractDecisionLearnings(entries) {
  const learnings = [];

  for (const entry of entries) {
    if (entry.role !== 'user') continue;
    if (!hasAny(entry.text, DECISION_KEYWORDS)) continue;

    const text = truncate(entry.text, 180);
    const id = `decision-${slugify(text)}`;
    learnings.push({
      id,
      confidence: 0.75,
      trigger: 'when a similar design/tooling choice appears',
      action: text,
      source: 'evaluate-session: explicit user decision',
    });
  }

  return learnings;
}

function dedupeLearnings(learnings) {
  const seen = new Map();
  for (const learning of learnings) {
    const prev = seen.get(learning.id);
    if (!prev || learning.confidence > prev.confidence) {
      seen.set(learning.id, learning);
    }
  }
  return Array.from(seen.values()).slice(0, MAX_LEARNINGS_PER_SESSION);
}

function serializeLearning(learning) {
  const today = new Date().toISOString().slice(0, 10);
  return [
    `id: ${learning.id}`,
    `confidence: ${learning.confidence.toFixed(2)}`,
    `trigger: ${learning.trigger}`,
    `action: ${learning.action}`,
    `source: ${learning.source}`,
    `created: ${today}`,
    ''
  ].join('\n');
}

function writeLearnings(projectRoot, learnings) {
  if (learnings.length === 0) return [];

  const learningsDir = path.join(projectRoot, '.claude', 'learnings');
  ensureDir(learningsDir);

  const written = [];
  for (const learning of learnings) {
    const filePath = path.join(learningsDir, `${learning.id}.yml`);
    fs.writeFileSync(filePath, serializeLearning(learning), 'utf8');
    written.push(filePath);
  }
  return written;
}

async function main() {
  let transcriptPath = null;
  let cwd = process.cwd();

  try {
    const input = JSON.parse(stdinData);
    if (input && typeof input.transcript_path === 'string') {
      transcriptPath = input.transcript_path;
    }
    if (input && typeof input.cwd === 'string' && input.cwd.length > 0) {
      cwd = input.cwd;
    }
  } catch {
    transcriptPath = process.env.CLAUDE_TRANSCRIPT_PATH || null;
  }

  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    process.exit(0);
  }

  const content = readFile(transcriptPath);
  if (!content) process.exit(0);

  const entries = parseTranscriptEntries(content);
  if (entries.length === 0) process.exit(0);

  const learnings = dedupeLearnings([
    ...extractPitfallLearnings(entries),
    ...extractDecisionLearnings(entries),
  ]);

  if (learnings.length === 0) {
    process.exit(0);
  }

  const written = writeLearnings(cwd, learnings);
  if (written.length > 0) {
    log(`[ContinuousLearning] Wrote ${written.length} learning(s): ${written.map(f => path.basename(f)).join(', ')}`);
  }

  process.exit(0);
}

let stdinData = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  if (stdinData.length < MAX_STDIN) {
    const remaining = MAX_STDIN - stdinData.length;
    stdinData += chunk.substring(0, remaining);
  }
});

process.stdin.on('end', () => {
  main().catch(err => {
    console.error('[ContinuousLearning] Error:', err.message);
    process.exit(0);
  });
});

module.exports = {
  parseTranscriptEntries,
  extractPitfallLearnings,
  extractDecisionLearnings,
  dedupeLearnings,
  writeLearnings,
};
