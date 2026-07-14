#!/usr/bin/env node
/**
 * Stop Hook: Session Knowledge Summary
 *
 * Structured preservation of Claude Code conversations.
 * Saves the full dialogue structure (user questions + assistant responses)
 * to the wiki raw layer for later review.
 *
 * Design:
 *   - Preserves full conversation structure, not just summaries
 *   - Focuses on user questions and assistant's detailed responses
 *   - Complex/long responses are kept in full (not truncated)
 *   - No tool usage inventory — only the substantive dialogue matters
 *   - Each session gets its own file, organized by project
 *   - Path: inbox/{project}/logs/{date}-{shortId}-session.md
 *   - Fallback (no project): inbox/sessions/{date}-session-{shortId}.md
 *   - All summaries start with status: unprocessed
 *
 * Exit codes:
 *   0 = success (or non-critical failure — never block)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MAX_STDIN = 2 * 1024 * 1024;
const MIN_USER_MESSAGES = 2;

function getObsidianVaultRoot() {
  if (process.env.OBSIDIAN_VAULT_ROOT) return process.env.OBSIDIAN_VAULT_ROOT;

  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const settingsPath = path.join(projectRoot, '.claude', 'settings.json');
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (settings?.env?.OBSIDIAN_VAULT_ROOT) {
      return settings.env.OBSIDIAN_VAULT_ROOT;
    }
  } catch {}

  return null;
}

const OBSIDIAN_VAULT_ROOT = getObsidianVaultRoot();
const MAX_RESPONSE_LENGTH = 8000;
const MAX_USER_MSG_LENGTH = 2000;
const MAX_FILES_LIST = 30;

// ─── Transcript Parsing ───

function readTranscript(transcriptPath) {
  if (!transcriptPath) return null;
  try {
    return fs.readFileSync(transcriptPath, 'utf8');
  } catch {
    return null;
  }
}

function stripAnsi(str) {
  return String(str || '').replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
}

/**
 * Extract structured dialogue from transcript.
 * Returns an array of turns: { role, content, filesModified }
 */
function extractDialogue(transcriptContent) {
  const lines = transcriptContent.split('\n').filter(Boolean);
  const turns = [];
  const filesModified = [];
  let userCount = 0;

  for (const line of lines) {
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }

    // User messages
    if (entry.type === 'user' || entry.role === 'user' || entry.message?.role === 'user') {
      const rawContent = entry.message?.content ?? entry.content;
      const text = extractText(rawContent);
      const cleaned = stripAnsi(text).trim();
      if (cleaned && cleaned.length > 3) {
        userCount++;
        turns.push({
          role: 'user',
          content: cleaned.slice(0, MAX_USER_MSG_LENGTH),
        });
      }
    }

    // Assistant messages — preserve full text responses
    if (entry.type === 'assistant' && Array.isArray(entry.message?.content)) {
      const textParts = [];
      const entryFiles = [];

      for (const block of entry.message.content) {
        if (block.type === 'text' && block.text) {
          const text = stripAnsi(block.text).trim();
          if (text) {
            textParts.push(text);
          }
        }
        // File modifications from Edit/Write tool calls
        if (block.type === 'tool_use') {
          const toolName = block.name || '';
          const filePath = block.input?.file_path || '';
          if (filePath && (toolName === 'Edit' || toolName === 'Write')) {
            entryFiles.push(filePath);
          }
        }
      }

      if (textParts.length > 0) {
        const fullText = textParts.join('\n\n');
        turns.push({
          role: 'assistant',
          content: fullText.slice(0, MAX_RESPONSE_LENGTH),
        });
      }

      if (entryFiles.length > 0) {
        filesModified.push(...entryFiles);
      }
    }
  }

  return {
    turns,
    filesModified: [...new Set(filesModified)].slice(-MAX_FILES_LIST),
    totalUserMessages: userCount,
  };
}

function extractText(rawContent) {
  if (typeof rawContent === 'string') return rawContent;
  if (Array.isArray(rawContent)) {
    return rawContent
      .filter(c => c && (c.type === 'text' || c.type === 'user_message'))
      .map(c => c.text || c.content || '')
      .join(' ');
  }
  return '';
}

// ─── Output Generation ───

function getDateString() {
  return new Date().toISOString().slice(0, 10);
}

function getTimeString() {
  return new Date().toISOString().slice(11, 19);
}

function getShortId(sessionId) {
  return String(sessionId || '').slice(0, 8) || 'unknown';
}

function getProjectName(cwd) {
  if (!cwd) return 'unknown';
  return path.basename(cwd);
}

function buildFrontmatter(meta) {
  return [
    '---',
    `id: ${meta.date}-session-${meta.shortId}`,
    `created: ${meta.date}T${meta.time}`,
    'status: unprocessed',
    `session_id: ${meta.sessionId || ''}`,
    `project: ${meta.project}`,
    `model: ${meta.modelId || ''}`,
    `tokens_in: ${meta.tokensIn || 0}`,
    `tokens_out: ${meta.tokensOut || 0}`,
    `turns: ${meta.totalTurns}`,
    'tags: [session-summary, auto-generated]',
    '---',
    '',
  ].join('\n');
}

function buildSessionMarkdown(dialogue, meta) {
  const lines = [];

  lines.push(`# 会话记录 ${meta.date} ${meta.time}`);
  lines.push('');

  // Structured dialogue turns
  lines.push('## 对话');
  lines.push('');

  for (const turn of dialogue.turns) {
    if (turn.role === 'user') {
      lines.push(`### 👤 用户`);
      lines.push('');
      lines.push(turn.content);
      lines.push('');
    } else {
      lines.push(`### 🤖 助手`);
      lines.push('');
      lines.push(turn.content);
      lines.push('');
    }
  }

  // Files modified (reference section, minimal)
  if (dialogue.filesModified.length > 0) {
    lines.push('## 修改的文件');
    for (const f of dialogue.filesModified) {
      lines.push(`- ${f}`);
    }
    lines.push('');
  }

  // Stats
  lines.push('## 统计');
  lines.push(`- 对话轮次: ${dialogue.totalUserMessages}`);
  lines.push(`- 修改文件: ${dialogue.filesModified.length}`);

  return lines.join('\n');
}

// ─── File Writing ───

function resolveOutputPath(meta) {
  if (!OBSIDIAN_VAULT_ROOT) {
    return null;
  }

  const inboxSessions = path.join(OBSIDIAN_VAULT_ROOT, 'inbox', 'session_log', 'sessions');
  const inboxProjects = path.join(OBSIDIAN_VAULT_ROOT, 'inbox', 'session_log');
  const project = meta.project;
  if (project && project !== 'unknown') {
    const logsDir = path.join(inboxProjects, project, 'logs');
    const filename = `${meta.date}-${meta.shortId}-session.md`;
    return { dir: logsDir, filePath: path.join(logsDir, filename) };
  }

  const filename = `${meta.date}-session-${meta.shortId}.md`;
  return { dir: inboxSessions, filePath: path.join(inboxSessions, filename) };
}

function writeSessionSummary(dialogue, meta) {
  const resolved = resolveOutputPath(meta);
  if (!resolved) {
    return null;
  }

  const { dir, filePath } = resolved;

  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {
    // Directory may already exist
  }

  const frontmatter = buildFrontmatter(meta);
  const body = buildSessionMarkdown(dialogue, meta);
  fs.writeFileSync(filePath, frontmatter + body + '\n');

  return filePath;
}

// ─── Main ───

function run(rawInput) {
  let input;
  try {
    input = JSON.parse(rawInput.trim());
  } catch {
    return rawInput;
  }

  const transcriptPath = input.transcript_path;
  const sessionId = input.session_id || '';
  const cwd = input.cwd || input.workspace?.current_dir || '';
  const modelId = input.model?.id || '';
  const tokensIn = input.context_window?.total_input_tokens || 0;
  const tokensOut = input.context_window?.total_output_tokens || 0;

  const transcriptContent = readTranscript(transcriptPath);
  if (!transcriptContent) {
    return rawInput;
  }

  const dialogue = extractDialogue(transcriptContent);

  // Skip very short sessions
  if (dialogue.totalUserMessages < MIN_USER_MESSAGES) {
    return rawInput;
  }

  const meta = {
    date: getDateString(),
    time: getTimeString(),
    shortId: getShortId(sessionId),
    sessionId,
    project: getProjectName(cwd),
    modelId,
    tokensIn,
    tokensOut,
    totalTurns: dialogue.turns.length,
  };

  try {
    const writtenPath = writeSessionSummary(dialogue, meta);
    if (writtenPath) {
      process.stderr.write(`[SessionSummary] Written: ${writtenPath}\n`);
    }
  } catch (err) {
    process.stderr.write(`[SessionSummary] Write failed: ${err.message}\n`);
  }

  return rawInput;
}

// ─── Entry Point ───

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  if (raw.length < MAX_STDIN) {
    const remaining = MAX_STDIN - raw.length;
    raw += chunk.substring(0, remaining);
  }
});
process.stdin.on('end', () => {
  try {
    run(raw);
  } catch (err) {
    process.stderr.write(`[SessionSummary] Error: ${err.message}\n`);
  }
  process.exit(0);
});
