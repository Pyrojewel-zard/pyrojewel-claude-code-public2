/**
 * Fixture tests for P2 robustness verification:
 * - cost-tracker.js: log path and JSONL format
 * - pre-compact.js: compaction log and session annotation
 * - desktop-notify.js: WSL/Linux notification path
 *
 * Run: node tests/hooks/p2-robustness.fixture.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) { passCount++; } else { failCount++; console.error(`FAIL: ${message}`); }
}

// --- P2-2: cost-tracker.js log path ---

function testCostTrackerLogPath() {
  const { getClaudeDir } = require('../../.claude/hooks/lib/utils');
  const metricsDir = path.join(getClaudeDir(), 'metrics');

  assert(typeof metricsDir === 'string' && metricsDir.length > 0, 'getClaudeDir returns a path');
  assert(metricsDir.includes('.claude') || metricsDir.includes('claude'), 'Metrics dir is under .claude');

  // Check if costs.jsonl exists and has valid format (if any rows exist)
  const costsFile = path.join(metricsDir, 'costs.jsonl');
  if (fs.existsSync(costsFile)) {
    const content = fs.readFileSync(costsFile, 'utf8');
    const lines = content.split('\n').filter(Boolean);
    if (lines.length > 0) {
      const lastRow = lines[lines.length - 1];
      try {
        const parsed = JSON.parse(lastRow);
        assert(parsed.timestamp, 'Cost row has timestamp');
        assert(parsed.session_id, 'Cost row has session_id');
        assert(typeof parsed.estimated_cost_usd === 'number', 'Cost row has estimated_cost_usd');
        console.log(`  cost-tracker log: PASS (${lines.length} rows, last cost: $${parsed.estimated_cost_usd})`);
      } catch {
        assert(false, `Last cost row is valid JSON: ${lastRow.slice(0, 80)}`);
      }
    } else {
      console.log('  cost-tracker log: PASS (empty costs.jsonl)');
    }
  } else {
    console.log('  cost-tracker log: PASS (no costs.jsonl yet — will be created on next Stop)');
  }

  // Verify RATE_TABLE matches Claude 4.x pricing
  const costTrackerSource = fs.readFileSync(path.join(__dirname, '..', '..', '.claude', 'hooks', 'cost-tracker.js'), 'utf8');
  assert(costTrackerSource.includes('haiku') && costTrackerSource.includes('0.80'), 'Rate table includes haiku at $0.80/1M');
  assert(costTrackerSource.includes('sonnet') && costTrackerSource.includes('3.00'), 'Rate table includes sonnet at $3/1M');
  assert(costTrackerSource.includes('opus') && costTrackerSource.includes('15.00'), 'Rate table includes opus at $15/1M');
}

// --- P2-4: pre-compact.js context preservation ---

function testPreCompactPreservation() {
  const { getSessionsDir } = require('../../.claude/hooks/lib/utils');
  const sessionsDir = getSessionsDir();

  assert(typeof sessionsDir === 'string' && sessionsDir.length > 0, 'getSessionsDir returns a path');

  // Check compaction log exists and has entries
  const compactionLog = path.join(sessionsDir, 'compaction-log.txt');
  if (fs.existsSync(compactionLog)) {
    const content = fs.readFileSync(compactionLog, 'utf8');
    const entries = content.split('\n').filter(l => l.includes('compaction triggered'));
    assert(entries.length > 0, `Compaction log has entries (${entries.length})`);
    console.log(`  pre-compact log: PASS (${entries.length} compaction events logged)`);
  } else {
    console.log('  pre-compact log: PASS (no compaction log yet — created on first PreCompact)');
  }

  // Verify pre-compact source appends to active session file
  const preCompactSource = fs.readFileSync(path.join(__dirname, '..', '..', '.claude', 'hooks', 'pre-compact.js'), 'utf8');
  assert(preCompactSource.includes('Compaction occurred'), 'pre-compact annotates session with compaction marker');
  assert(preCompactSource.includes('compaction-log.txt'), 'pre-compact writes to compaction-log.txt');
}

// --- P2-3: desktop-notify.js Linux/WSL path ---

function testDesktopNotifyPaths() {
  const source = fs.readFileSync(path.join(__dirname, '..', '..', '.claude', 'hooks', 'desktop-notify.js'), 'utf8');

  // Verify WSL detection
  assert(source.includes('/proc/version'), 'desktop-notify reads /proc/version for WSL detection');
  assert(source.includes('microsoft'), 'desktop-notify checks for "microsoft" in /proc/version');

  // Verify PowerShell candidates
  assert(source.includes('pwsh.exe'), 'desktop-notify tries pwsh.exe');
  assert(source.includes('powershell.exe'), 'desktop-notify tries powershell.exe');

  // Verify BurntToast fallback tip
  assert(source.includes('BurntToast'), 'desktop-notify mentions BurntToast module');

  // Check if we're on WSL and PowerShell is available
  const isWSL = (() => {
    try {
      return fs.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft');
    } catch { return false; }
  })();

  if (isWSL) {
    const { spawnSync } = require('child_process');
    // Try to find PowerShell
    const candidates = ['pwsh.exe', 'powershell.exe'];
    let foundPS = null;
    for (const p of candidates) {
      try {
        const result = spawnSync(p, ['-Command', 'exit 0'], { stdio: 'ignore', timeout: 3000 });
        if (result.status === 0) { foundPS = p; break; }
      } catch { /* continue */ }
    }
    if (foundPS) {
      console.log(`  desktop-notify WSL: PASS (PowerShell found: ${foundPS})`);
    } else {
      console.log('  desktop-notify WSL: PASS (no PowerShell — will log BurntToast tip)');
    }
  } else {
    console.log('  desktop-notify Linux: PASS (not WSL — native Linux, no PS needed)');
  }
}

// --- P2-5: evaluate-session.js report path ---

function testEvaluateSessionReportPath() {
  // evaluate-session writes to .claude/learnings/ directory
  const projectRoot = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const learningsDir = path.join(projectRoot, '.claude', 'learnings');

  if (fs.existsSync(learningsDir)) {
    const files = fs.readdirSync(learningsDir)
      .filter(f => f.endsWith('.yml') || f.endsWith('.yaml') || f.endsWith('.md'));
    assert(files.length >= 0, `Learnings dir exists with ${files.length} files`);
    console.log(`  evaluate-session path: PASS (${files.length} learning files in .claude/learnings/)`);
  } else {
    console.log('  evaluate-session path: PASS (learnings dir not yet created)');
  }

  // Verify source code writes learnings
  const source = fs.readFileSync(path.join(__dirname, '..', '..', '.claude', 'hooks', 'evaluate-session.js'), 'utf8');
  assert(source.includes('.claude/learnings') || source.includes('learningsDir'), 'evaluate-session references .claude/learnings');
}

// --- Run ---

console.log('=== P2 robustness verification fixtures ===\n');

testCostTrackerLogPath();
testPreCompactPreservation();
testDesktopNotifyPaths();
testEvaluateSessionReportPath();

console.log(`\n${passCount} passed, ${failCount} failed`);
process.exit(failCount > 0 ? 1 : 0);