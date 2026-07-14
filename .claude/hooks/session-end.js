#!/usr/bin/env node
/**
 * Stop Hook (Session End) - Persist learnings during active sessions
 *
 * Adapted from ECC's session-end.js for personal Python workflow.
 * Obsidian sync moved to separate hook: session-knowledge-summary.js.
 *
 * Runs on Stop events (after each response). Extracts a meaningful summary
 * from the session transcript (via stdin JSON transcript_path) and updates a
 * session file for cross-session continuity.
 */

const path = require('path');
const fs = require('fs');
const {
  getSessionsDir,
  getDateString,
  getTimeString,
  getSessionIdShort,
  sanitizeSessionId,
  getProjectName,
  ensureDir,
  readFile,
  writeFile,
  runCommand,
  stripAnsi,
  log
} = require('./lib/utils');

const SUMMARY_START_MARKER = '<!-- ECC:SUMMARY:START -->';
const SUMMARY_END_MARKER = '<!-- ECC:SUMMARY:END -->';
const SESSION_SEPARATOR = '\n---\n';

/**
 * Extract a meaningful summary from the session transcript.
 * Reads the JSONL transcript and pulls out key information:
 * - User messages (tasks requested)
 * - Tools used
 * - Files modified
 */
function extractSessionSummary(transcriptPath) {
  const content = readFile(transcriptPath);
  if (!content) return null;

  const lines = content.split('\n').filter(Boolean);
  const userMessages = [];
  const toolsUsed = new Set();
  const filesModified = new Set();
  let parseErrors = 0;

  for (const line of lines) {
    try {
      const entry = JSON.parse(line);

      // Collect user messages (first 200 chars each)
      if (entry.type === 'user' || entry.role === 'user' || entry.message?.role === 'user') {
        // Support both direct content and nested message.content (Claude Code JSONL format)
        const rawContent = entry.message?.content ?? entry.content;
        const text = typeof rawContent === 'string'
          ? rawContent
          : Array.isArray(rawContent)
            ? rawContent.map(c => (c && c.text) || '').join(' ')
            : '';
        const cleaned = stripAnsi(text).trim();
        if (cleaned) {
          userMessages.push(cleaned.slice(0, 200));
        }
      }

      // Collect tool names and modified files (direct tool_use entries)
      if (entry.type === 'tool_use' || entry.tool_name) {
        const toolName = entry.tool_name || entry.name || '';
        if (toolName) toolsUsed.add(toolName);

        const filePath = entry.tool_input?.file_path || entry.input?.file_path || '';
        if (filePath && (toolName === 'Edit' || toolName === 'Write')) {
          filesModified.add(filePath);
        }
      }

      // Extract tool uses from assistant message content blocks (Claude Code JSONL format)
      if (entry.type === 'assistant' && Array.isArray(entry.message?.content)) {
        for (const block of entry.message.content) {
          if (block.type === 'tool_use') {
            const toolName = block.name || '';
            if (toolName) toolsUsed.add(toolName);

            const filePath = block.input?.file_path || '';
            if (filePath && (toolName === 'Edit' || toolName === 'Write')) {
              filesModified.add(filePath);
            }
          }
        }
      }
    } catch {
      parseErrors++;
    }
  }

  if (parseErrors > 0) {
    log(`[SessionEnd] Skipped ${parseErrors}/${lines.length} unparseable transcript lines`);
  }

  if (userMessages.length === 0) return null;

  return {
    userMessages: userMessages.slice(-10), // Last 10 user messages
    toolsUsed: Array.from(toolsUsed).slice(0, 20),
    filesModified: Array.from(filesModified).slice(0, 30),
    totalMessages: userMessages.length
  };
}

// Read hook input from stdin (Claude Code provides transcript_path via stdin JSON)
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
  runMain();
});

function runMain() {
  main().catch(err => {
    console.error('[SessionEnd] Error:', err.message);
    process.exit(0);
  });
}

function getSessionMetadata() {
  const branchResult = runCommand('git rev-parse --abbrev-ref HEAD');

  return {
    project: getProjectName() || 'unknown',
    branch: branchResult.success ? branchResult.output : 'unknown',
    worktree: process.cwd()
  };
}

function extractHeaderField(header, label) {
  const match = header.match(new RegExp(`\\*\\*${escapeRegExp(label)}:\\*\\*\\s*(.+)$`, 'm'));
  return match ? match[1].trim() : null;
}

function buildSessionHeader(today, currentTime, metadata, existingContent = '') {
  const headingMatch = existingContent.match(/^#\s+.+$/m);
  const heading = headingMatch ? headingMatch[0] : `# Session: ${today}`;
  const date = extractHeaderField(existingContent, 'Date') || today;
  const started = extractHeaderField(existingContent, 'Started') || currentTime;

  return [
    heading,
    `**Date:** ${date}`,
    `**Started:** ${started}`,
    `**Last Updated:** ${currentTime}`,
    `**Project:** ${metadata.project}`,
    `**Branch:** ${metadata.branch}`,
    `**Worktree:** ${metadata.worktree}`,
    ''
  ].join('\n');
}

function mergeSessionHeader(content, today, currentTime, metadata) {
  const separatorIndex = content.indexOf(SESSION_SEPARATOR);
  if (separatorIndex === -1) {
    return null;
  }

  const existingHeader = content.slice(0, separatorIndex);
  const body = content.slice(separatorIndex + SESSION_SEPARATOR.length);
  const nextHeader = buildSessionHeader(today, currentTime, metadata, existingHeader);
  return `${nextHeader}${SESSION_SEPARATOR}${body}`;
}

async function main() {
  // Parse stdin JSON to get transcript_path; fall back to env var on missing,
  // empty, or non-string values as well as on malformed JSON.
  let transcriptPath = null;
  try {
    const input = JSON.parse(stdinData);
    if (input && typeof input.transcript_path === 'string' && input.transcript_path.length > 0) {
      transcriptPath = input.transcript_path;
    }
  } catch {
    // Malformed stdin: fall through to the env-var fallback below.
  }
  if (!transcriptPath) {
    const envTranscriptPath = process.env.CLAUDE_TRANSCRIPT_PATH;
    if (typeof envTranscriptPath === 'string' && envTranscriptPath.length > 0) {
      transcriptPath = envTranscriptPath;
    }
  }

  const sessionsDir = getSessionsDir();
  const today = getDateString();
  // Derive shortId from transcript_path UUID when available, using the SAME
  // last-8-chars convention as getSessionIdShort(sessionId.slice(-8)). This keeps
  // backward compatibility for normal sessions (the derived shortId matches what
  // getSessionIdShort() would have produced from the same UUID), while making
  // every session map to a unique filename based on its own transcript UUID.
  //
  // Without this, a parent session and any `claude -p ...` subprocess spawned by
  // another Stop hook share the project-name fallback filename, and the subprocess
  // overwrites the parent's summary. See issue #1494 for full repro details.
  let shortId = null;
  if (transcriptPath) {
    const m = path.basename(transcriptPath).match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.jsonl$/i);
    if (m) {
      // Run through sanitizeSessionId() for byte-for-byte parity with
      // getSessionIdShort(sessionId.slice(-8)).
      shortId = sanitizeSessionId(m[1].slice(-8).toLowerCase());
    }
  }
  if (!shortId) { shortId = getSessionIdShort(); }
  const sessionFile = path.join(sessionsDir, `${today}-${shortId}-session.tmp`);
  const sessionMetadata = getSessionMetadata();

  ensureDir(sessionsDir);

  const currentTime = getTimeString();

  // Try to extract summary from transcript
  let summary = null;

  if (transcriptPath) {
    if (fs.existsSync(transcriptPath)) {
      summary = extractSessionSummary(transcriptPath);
    } else {
      log(`[SessionEnd] Transcript not found: ${transcriptPath}`);
    }
  }

  if (fs.existsSync(sessionFile)) {
    const existing = readFile(sessionFile);
    let updatedContent = existing;

    if (existing) {
      const merged = mergeSessionHeader(existing, today, currentTime, sessionMetadata);
      if (merged) {
        updatedContent = merged;
      } else {
        log(`[SessionEnd] Failed to normalize header in ${sessionFile}`);
      }
    }

    // If we have a new summary, update only the generated summary block.
    // This keeps repeated Stop invocations idempotent and preserves
    // user-authored sections in the same session file.
    if (summary && updatedContent) {
      const summaryBlock = buildSummaryBlock(summary);

      if (updatedContent.includes(SUMMARY_START_MARKER) && updatedContent.includes(SUMMARY_END_MARKER)) {
        updatedContent = updatedContent.replace(
          new RegExp(`${escapeRegExp(SUMMARY_START_MARKER)}[\\s\\S]*?${escapeRegExp(SUMMARY_END_MARKER)}`),
          summaryBlock
        );
      } else {
        // Migration path for files created before summary markers existed.
        updatedContent = updatedContent.replace(
          /## (?:Session Summary|Current State)[\s\S]*?$/,
          `${summaryBlock}\n\n### Notes for Next Session\n-\n\n### Context to Load\n\`\`\`\n[relevant files]\n\`\`\`\n`
        );
      }
    }

    if (updatedContent) {
      writeFile(sessionFile, updatedContent);
    }

    log(`[SessionEnd] Updated session file: ${sessionFile}`);
  } else {
    // Create new session file
    const summarySection = summary
      ? `${buildSummaryBlock(summary)}\n\n### Notes for Next Session\n-\n\n### Context to Load\n\`\`\`\n[relevant files]\n\`\`\``
      : `## Current State\n\n[Session context goes here]\n\n### Completed\n- [ ]\n\n### In Progress\n- [ ]\n\n### Notes for Next Session\n-\n\n### Context to Load\n\`\`\`\n[relevant files]\n\`\`\``;

    const template = `${buildSessionHeader(today, currentTime, sessionMetadata)}${SESSION_SEPARATOR}${summarySection}
`;

    writeFile(sessionFile, template);
    log(`[SessionEnd] Created session file: ${sessionFile}`);
  }

  // Write project-level SESSION_CONTEXT.md (single-file overwrite for cross-session continuity)
  writeSessionContext(sessionMetadata, summary);

  process.exit(0);
}

function buildSummarySection(summary) {
  let section = '## Session Summary\n\n';

  // Tasks (from user messages — collapse newlines and escape backticks to prevent markdown breaks)
  section += '### Tasks\n';
  for (const msg of summary.userMessages) {
    section += `- ${msg.replace(/\n/g, ' ').replace(/`/g, '\\`')}\n`;
  }
  section += '\n';

  // Files modified
  if (summary.filesModified.length > 0) {
    section += '### Files Modified\n';
    for (const f of summary.filesModified) {
      section += `- ${f}\n`;
    }
    section += '\n';
  }

  // Tools used
  if (summary.toolsUsed.length > 0) {
    section += `### Tools Used\n${summary.toolsUsed.join(', ')}\n\n`;
  }

  section += `### Stats\n- Total user messages: ${summary.totalMessages}\n`;

  return section;
}

function buildSummaryBlock(summary) {
  return `${SUMMARY_START_MARKER}\n${buildSummarySection(summary).trim()}\n${SUMMARY_END_MARKER}`;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Write project-level SESSION_CONTEXT.md for cross-session continuity.
 * This is a single-file overwrite model: each Stop replaces the file with
 * the latest state. session-start.js reads this file to restore context.
 *
 * Structure:
 *   - Current State: auto-extracted from recent user messages
 *   - Active Threads: preserved from existing file (manual + auto)
 *   - Key Decisions: preserved from existing file
 *   - Pitfalls & Gotchas: preserved from existing file
 *   - Learnings: summary of .claude/learnings/ directory
 */
function writeSessionContext(metadata, summary) {
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const contextFile = path.join(projectRoot, '.claude', 'SESSION_CONTEXT.md');

  // Read existing context to preserve manual sections
  let existing = {};
  try {
    if (fs.existsSync(contextFile)) {
      const content = readFile(contextFile) || '';
      existing.activeThreads = extractSection(content, 'Active Threads');
      existing.keyDecisions = extractSection(content, 'Key Decisions');
      existing.pitfalls = extractSection(content, 'Pitfalls & Gotchas');
    }
  } catch {
    // Start fresh if unreadable
  }

  const now = new Date().toISOString();
  const lines = [
    `# Session Context — ${metadata.project}`,
    '',
    `**Last Updated:** ${now}`,
    `**Branch:** ${metadata.branch}`,
    `**Worktree:** ${metadata.worktree}`,
    '',
    '## Current State',
    '',
  ];

  if (summary && summary.userMessages.length > 0) {
    // Use the last 5 user messages as current state indicators
    const recent = summary.userMessages.slice(-5);
    for (const msg of recent) {
      lines.push(`- ${msg.replace(/\n/g, ' ').replace(/`/g, '\\`')}`);
    }
  } else {
    lines.push('- [No recent activity recorded]');
  }

  lines.push('');
  lines.push('## Active Threads');
  lines.push('');

  // Split threads into short-term (session) and long-term (flow/backlog)
  const LONG_TERM_TAG = '[long]';
  const LONG_TERM_PATTERN = /\bP[012]-\d+\b/;
  let shortTermThreads = [];
  let longTermThreads = [];

  if (existing.activeThreads) {
    const allThreads = existing.activeThreads.split('\n').filter(l => l.trim());
    for (const thread of allThreads) {
      if (thread.includes(LONG_TERM_TAG) || LONG_TERM_PATTERN.test(thread)) {
        longTermThreads.push(thread);
      } else {
        shortTermThreads.push(thread);
      }
    }
  }

  if (shortTermThreads.length > 0) {
    lines.push(shortTermThreads.join('\n'));
  } else {
    lines.push('<!-- List unfinished tasks and open questions here -->');
    lines.push('- ');
  }

  if (longTermThreads.length > 0) {
    lines.push('');
    lines.push('**长期条目已迁移至** `references/session-long-term-state.md`');
  }

  lines.push('');
  lines.push('## Key Decisions');
  lines.push('');
  if (existing.keyDecisions) {
    lines.push(existing.keyDecisions);
  } else {
    lines.push('<!-- Document architectural choices made in this project -->');
    lines.push('- ');
  }

  lines.push('');
  lines.push('## Pitfalls & Gotchas');
  lines.push('');
  if (existing.pitfalls) {
    lines.push(existing.pitfalls);
  } else {
    lines.push('<!-- Record things that broke, workarounds, non-obvious constraints -->');
    lines.push('- ');
  }

  // Append learnings summary if available
  const learningsSummary = summarizeLearnings(projectRoot);
  if (learningsSummary) {
    lines.push('');
    lines.push('## Learnings');
    lines.push('');
    lines.push(learningsSummary);
  }

  lines.push('');

  try {
    ensureDir(path.dirname(contextFile));
    writeFile(contextFile, lines.join('\n'));
    log(`[SessionEnd] Updated SESSION_CONTEXT.md`);

    // Write long-term state if there are long-term threads
    if (longTermThreads.length > 0) {
      writeLongTermState(
        path.join(projectRoot, 'references', 'session-long-term-state.md'),
        longTermThreads
      );
    }
  } catch (err) {
    log(`[SessionEnd] Failed to write SESSION_CONTEXT.md: ${err.message}`);
  }
}

function extractSection(content, heading) {
  const regex = new RegExp(`^##\\s+${escapeRegExp(heading)}\\s*\\n+([\\s\\S]+?)(?:\\n##\\s+|$)`, 'm');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

function summarizeLearnings(projectRoot) {
  const learningsDir = path.join(projectRoot, '.claude', 'learnings');
  if (!fs.existsSync(learningsDir)) return '';

  try {
    const files = fs.readdirSync(learningsDir)
      .filter(f => f.endsWith('.yml') || f.endsWith('.yaml') || f.endsWith('.md'))
      .sort();

    if (files.length === 0) return '';

    const lines = [];
    for (const file of files.slice(0, 10)) {
      const filePath = path.join(learningsDir, file);
      try {
        const content = readFile(filePath) || '';
        // Extract id and action from YAML frontmatter
        const idMatch = content.match(/^id:\s*(.+)$/m);
        const actionMatch = content.match(/^action:\s*(.+)$/m);
        const confMatch = content.match(/^confidence:\s*(.+)$/m);
        if (idMatch) {
          const id = idMatch[1].trim();
          const conf = confMatch ? confMatch[1].trim() : '?';
          const action = actionMatch ? actionMatch[1].trim() : '(no action)';
          lines.push(`- [${conf}] ${id}: ${action}`);
        }
      } catch {
        // Skip unreadable files
      }
    }
    return lines.join('\n');
  } catch {
    return '';
  }
}

/**
 * Write long-term state to references/session-long-term-state.md.
 * Preserves manually-edited sections (Migration Status) while updating
 * Active Flows and Backlog Pointers.
 */
function writeLongTermState(filePath, threads) {
  const sections = ['Active Flows', 'Migration Status', 'Backlog Pointers'];
  let existing = {};

  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, 'utf8');
    for (const section of sections) {
      const regex = new RegExp(`^## ${section}\\s*\\n([\\s\\S]*?)(?=^## |$)`, 'm');
      const match = raw.match(regex);
      if (match) {
        existing[section] = match[1].trim();
      }
    }
  }

  const activeFlows = threads.map(t => t.replace(/\[long\]\s*/, '').replace(/^- \[ \]\s*/, '- [ ] ')).join('\n');

  const content = `# Session Long-Term State

Long-term flow/migration status extracted from SESSION_CONTEXT.md.
Maintained by session-end.js, read by session-start.js.

---

## Active Flows

${activeFlows}

## Migration Status

${existing['Migration Status'] || '<!-- ECC adaptation, skill migration, etc. -->'}

## Backlog Pointers

- \`references/ecc-framework-action-plan.md\` — ECC 框架 P0/P1/P2 执行单
- \`references/hooks-extraction.md\` — Hook adaptation audit (2026-06-02)
- \`references/agents-extraction.md\` — Agent installation audit (2026-06-02)
- \`references/rules-extraction.md\` — Rule extraction audit (2026-06-02)
- \`references/flow-map.md\` — Flow/repo map
- \`references/skill-map.md\` — Skill source tracking
`;

  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    log(`[SessionEnd] Updated long-term state: ${filePath}`);
  } catch (err) {
    log(`[SessionEnd] Failed to write long-term state: ${err.message}`);
  }
}
