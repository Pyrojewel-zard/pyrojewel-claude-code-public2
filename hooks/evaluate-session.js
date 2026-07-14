#!/usr/bin/env node
/**
 * Continuous Learning - Session Evaluator
 *
 * Adapted from ECC's evaluate-session.js for personal Python workflow.
 * Now actively extracts learnings from transcript instead of just logging a signal.
 *
 * Runs on Stop hook. Reads transcript_path from stdin JSON.
 * Scans transcript for:
 *   1. Pitfalls — error → fix patterns
 *   2. Patterns — repeated successful approaches
 *   3. Decisions — explicit choices with reasoning
 *
 * Writes extracted learnings to .claude/learnings/ as YAML files.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const {
  ensureDir,
  readFile,
  stripAnsi,
  log
} = require('./lib/utils');

const MAX_STDIN = 1024 * 1024;
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

/**
 * Extract pitfalls from transcript: patterns where an error occurred
 * and then was resolved in subsequent messages.
 */
function extractPitfalls(userMessages, assistantMessages) {
  const pitfalls = [];
  const errorKeywords = ['error', 'failed', 'fail', 'bug', 'broken', 'crash', 'issue', 'problem', 'wrong', 'incorrect', 'not working', 'doesn\'t work', '不行', '出错', '失败', '报错'];

  for (let i = 0; i < userMessages.length; i++) {
    const msg = userMessages[i].toLowerCase();
    const isError = errorKeywords.some(kw => msg.includes(kw));

    if (isError && i + 1 < userMessages.length) {
      // Check if subsequent messages indicate resolution
      const nextMsg = userMessages[i + 1].toLowerCase();
      const resolveKeywords = ['fixed', 'resolved', 'works', 'done', 'success', 'ok', '解决了', '好了', '修好了'];
      const isResolved = resolveKeywords.some(kw => nextMsg.includes(kw));

      if (isResolved) {
        pitfalls.push({
          raw: userMessages[i].slice(0, 150),
          resolution: userMessages[i + 1].slice(0, 150),
        });
      }
    }
  }

  return pitfalls;
}

/**
 * Extract decisions: user messages that explicitly state a choice.
 */
function extractDecisions(userMessages) {
  const decisions = [];
  const decisionKeywords = ['decided', 'decision', 'prefer', 'instead of', 'rather than', 'chose', 'choose', '选择', '决定', '偏好', '不用', '用'];

  for (const msg of userMessages) {
    const lower = msg.toLowerCase();
    if (decisionKeywords.some(kw => lower.includes(kw))) {
      decisions.push(msg.slice(0, 200));
    }
  }

  return decisions;
}

async function main() {
  let transcriptPath = null;
  try {
    const input = JSON.parse(stdinData);
    transcriptPath = input.transcript_path;
  } catch {
    transcriptPath = process.env.CLAUDE_TRANSCRIPT_PATH;
  }

  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    process.exit(0);
  }

  // Parse transcript to check session richness
  const content = readFile(transcriptPath);
  if (!content) process.exit(0);

  const lines = content.split('\n').filter(Boolean);
  const userMessages = [];

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.type === 'user' || entry.role === 'user' || entry.message?.role === 'user') {
        const rawContent = entry.message?.content ?? entry.content;
        const text = typeof rawContent === 'string'
          ? rawContent
          : Array.isArray(rawContent)
            ? rawContent.map(c => (c && c.text) || '').join(' ')
            : '';
        const cleaned = stripAnsi(text).trim();
        if (cleaned && cleaned.length > 5) {
          userMessages.push(cleaned);
        }
      }
    } catch {
      // Skip unparseable lines
    }
  }

  // Detect if session had error→fix patterns or explicit decisions
  const errorKeywords = ['error', 'failed', 'bug', 'broken', 'not working', '不行', '出错', '报错'];
  const decisionKeywords = ['decided', 'prefer', 'instead of', 'rather than', '选择', '决定', '不用'];
  const resolveKeywords = ['fixed', 'resolved', 'works', 'success', '解决了', '修好了'];

  let hasPitfall = false;
  let hasDecision = false;

  for (let i = 0; i < userMessages.length; i++) {
    const lower = userMessages[i].toLowerCase();
    if (errorKeywords.some(kw => lower.includes(kw))) {
      // Check if next message indicates resolution
      if (i + 1 < userMessages.length) {
        const nextLower = userMessages[i + 1].toLowerCase();
        if (resolveKeywords.some(kw => nextLower.includes(kw))) {
          hasPitfall = true;
        }
      }
    }
    if (decisionKeywords.some(kw => lower.includes(kw))) {
      hasDecision = true;
    }
  }

  // Only log a signal — Claude should propose learnings in conversation, not auto-extract
  if (hasPitfall || hasDecision) {
    const parts = [];
    if (hasPitfall) parts.push('error→fix patterns');
    if (hasDecision) parts.push('explicit decisions');
    log(`[ContinuousLearning] Session contains ${parts.join(' + ')}. Consider proposing learnings if valuable.`);
  }

  process.exit(0);
}