#!/usr/bin/env bash
# ============================================================
# pyrojewel-beamer-academic  —  Weekly Meeting Append & Compile
# ============================================================
# Usage:
#   ./weekly_append.sh "content to append"               # Append to this week's MD
#   ./weekly_append.sh "content" --compile                # Append + compile beamer PDF
#   ./weekly_append.sh "content" --output-dir DIR         # Override output dir
#   ./weekly_append.sh "content" --week 2026-06-02        # Target a specific Monday
#
# Output:
#   {weekly_dir}/2026-06-02.md          —  append-only weekly markdown
#   {weekly_dir}/2026-06-02_beamer.tex  —  beamer source (regenerated each time)
#   {weekly_dir}/2026-06-02_beamer.pdf  —  compiled beamer PDF

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPILE_SCRIPT="$SCRIPT_DIR/compile.sh"

# ---------- Parse arguments ----------
CONTENT=""
DO_COMPILE=false
OUTPUT_DIR_ARG=""
TARGET_MONDAY=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --compile)    DO_COMPILE=true; shift ;;
    --output-dir)
      OUTPUT_DIR_ARG="$2"; shift 2 ;;
    --output-dir=*) OUTPUT_DIR_ARG="${1#--output-dir=}"; shift ;;
    --week)
      TARGET_MONDAY="$2"; shift 2 ;;
    --week=*) TARGET_MONDAY="${1#--week=}"; shift ;;
    -h|--help)
      echo "Usage: $0 \"content\" [--compile] [--output-dir DIR] [--week YYYY-MM-DD]"
      exit 0 ;;
    *)
      if [[ -z "$CONTENT" ]]; then
        CONTENT="$1"; shift
      else
        CONTENT="$CONTENT $1"; shift
      fi ;;
  esac
done

if [[ -z "$CONTENT" ]]; then
  echo "ERROR: No content provided. Usage: $0 \"content to append\" [--compile]"
  exit 1
fi

# ---------- Resolve this week's Monday ----------
get_monday() {
  local ref_date="${1:-}"
  if [[ -n "$ref_date" ]]; then
    date -d "$ref_date" +"%Y-%m-%d" 2>/dev/null || {
      echo "ERROR: Invalid date: $ref_date" >&2; exit 1; }
  else
    # Today's Monday (ISO: Monday=1, so %u gives 1-7)
    date -d "this Monday" +"%Y-%m-%d"
  fi
}

MONDAY=$(get_monday "$TARGET_MONDAY")
YEAR=$(date -d "$MONDAY" +"%Y")
ISO_WEEK=$(date -d "$MONDAY" +"W%V")

echo "=== Week starting: $MONDAY (ISO: $ISO_WEEK) ==="

# ---------- Resolve output directory ----------
resolve_output_dir() {
  local explicit_dir="${1:-}"

  # Priority 1: explicit user path
  if [[ -n "$explicit_dir" ]]; then
    mkdir -p "$explicit_dir"
    (cd "$explicit_dir" && pwd)
    return
  fi

  # Priority 2: OBSIDIAN_VAULT_ROOT weekly meeting folder
  if [[ -n "${OBSIDIAN_VAULT_ROOT:-}" && -d "$OBSIDIAN_VAULT_ROOT" ]]; then
    local weekly_rel="${WEEKLY_MEETING_REL:-weekly}"
    local target="$OBSIDIAN_VAULT_ROOT/$weekly_rel/${YEAR}_${ISO_WEEK}"
    mkdir -p "$target"
    echo "$target"
    return
  fi

  # Priority 3: local fallback
  local fallback="$SKILL_ROOT/output/${YEAR}_${ISO_WEEK}"
  mkdir -p "$fallback"
  echo "WARNING: OBSIDIAN_VAULT_ROOT not set; output to $fallback" >&2
  echo "$fallback"
}

OUTPUT_DIR=$(resolve_output_dir "$OUTPUT_DIR_ARG")
echo "  Output directory: $OUTPUT_DIR"

# ---------- Append to weekly markdown ----------
MD_FILE="$OUTPUT_DIR/${MONDAY}.md"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")

if [[ ! -f "$MD_FILE" ]]; then
  # New week: create with header
  cat > "$MD_FILE" << MDEOF
# 周会记录 — ${MONDAY} 周（${ISO_WEEK}）

> 自动生成于 $(date +"%Y-%m-%d %H:%M")

---

MDEOF
  echo "  Created new weekly file: $MD_FILE"
fi

# Append content with timestamp separator
cat >> "$MD_FILE" << MDEOF

## $(date +"%Y-%m-%d %H:%M")

$CONTENT

---
MDEOF

echo "  Appended to: $MD_FILE"

# ---------- Compile beamer (optional) ----------
if $DO_COMPILE; then
  TEX_FILE="$OUTPUT_DIR/${MONDAY}_beamer.tex"

  # Generate beamer .tex from the accumulated markdown
  # The SKILL.md agent is responsible for generating proper beamer content;
  # here we just provide the scaffolding if the .tex doesn't exist yet.
  if [[ ! -f "$TEX_FILE" ]]; then
    echo "  WARNING: $TEX_FILE not found. Run the beamer generation step first."
    echo "  The agent should generate this file based on $MD_FILE content."
  else
    echo "  Compiling beamer: $TEX_FILE"
    bash "$COMPILE_SCRIPT" "$TEX_FILE" --full --output-dir "$OUTPUT_DIR"
  fi
fi

echo "=== Done: $MD_FILE ==="
