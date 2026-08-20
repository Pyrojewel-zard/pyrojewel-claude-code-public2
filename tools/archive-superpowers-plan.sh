#!/usr/bin/env bash
# ============================================================
# archive-superpowers-plan.sh — Deterministic plan archival
# ============================================================
# Usage:
#   ./tools/archive-superpowers-plan.sh plans/2026-06-01-foo.md --status completed
#   ./tools/archive-superpowers-plan.sh plans/2026-06-01-foo.md --status superseded --superseded-by 2026-06-05-bar.md
#   ./tools/archive-superpowers-plan.sh plans/2026-06-01-foo.md --status abandoned
#
# What it does (deterministic, no LLM):
#   1. Updates frontmatter: status + completed-date + superseded-by
#   2. Moves plan to archive/
#   3. Updates docs/superpowers/README.md index
#   4. Runs verify-superpowers-index.sh
#
# What it does NOT do (requires LLM / plan-evolution-tracker skill):
#   - Generate evolution card
#   - Update references/evolution-log.md
#   - Extract decisions / features / assets

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SP_DIR="$REPO_ROOT/docs/superpowers"
README="$SP_DIR/README.md"
ARCHIVE_DIR="$SP_DIR/archive"
TODAY=$(date +%Y-%m-%d)

# ---------- Parse arguments ----------
PLAN_PATH=""
NEW_STATUS=""
SUPERSEDED_BY=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --status)         NEW_STATUS="$2"; shift 2 ;;
    --superseded-by)  SUPERSEDED_BY="$2"; shift 2 ;;
    -*)               echo "Unknown option: $1"; exit 1 ;;
    *)                PLAN_PATH="$1"; shift ;;
  esac
done

if [[ -z "$PLAN_PATH" || -z "$NEW_STATUS" ]]; then
  echo "Usage: $0 <plan-path> --status <completed|superseded|abandoned> [--superseded-by <file>]"
  exit 1
fi

VALID_STATUSES="completed superseded abandoned"
if ! echo "$VALID_STATUSES" | grep -qw "$NEW_STATUS"; then
  echo "ERROR: status must be one of: $VALID_STATUSES"
  exit 1
fi

# Resolve plan path
if [[ -f "$PLAN_PATH" ]]; then
  PLAN_FILE="$(cd "$(dirname "$PLAN_PATH")" && pwd)/$(basename "$PLAN_PATH")"
elif [[ -f "$SP_DIR/$PLAN_PATH" ]]; then
  PLAN_FILE="$SP_DIR/$PLAN_PATH"
elif [[ -f "$SP_DIR/plans/$PLAN_PATH" ]]; then
  PLAN_FILE="$SP_DIR/plans/$PLAN_PATH"
else
  echo "ERROR: Plan file not found: $PLAN_PATH"
  exit 1
fi

PLAN_BASENAME=$(basename "$PLAN_FILE")
PLAN_TITLE=$(grep '^title:' "$PLAN_FILE" | head -1 | sed 's/title: *//' || echo "$PLAN_BASENAME")
OLD_STATUS=$(grep '^status:' "$PLAN_FILE" | head -1 | sed 's/status: *//' || echo "unknown")

echo "=== Archiving: $PLAN_BASENAME ==="
echo "  Status: $OLD_STATUS -> $NEW_STATUS"

# ---------- Step 1: Update frontmatter ----------
# Update status
sed -i "s/^status:.*/status: $NEW_STATUS/" "$PLAN_FILE"

# Add or update completed-date
if grep -q '^completed-date:' "$PLAN_FILE"; then
  sed -i "s/^completed-date:.*/completed-date: $TODAY/" "$PLAN_FILE"
else
  # Insert after status line
  sed -i "/^status:/a completed-date: $TODAY" "$PLAN_FILE"
fi

# Add superseded-by if provided
if [[ -n "$SUPERSEDED_BY" && "$NEW_STATUS" == "superseded" ]]; then
  if grep -q '^superseded-by:' "$PLAN_FILE"; then
    sed -i "s/^superseded-by:.*/superseded-by: $SUPERSEDED_BY/" "$PLAN_FILE"
  else
    sed -i "/^completed-date:/a superseded-by: $SUPERSEDED_BY" "$PLAN_FILE"
  fi
fi

echo "  Frontmatter updated"

# ---------- Step 2: Move to archive ----------
mkdir -p "$ARCHIVE_DIR"
ARCHIVE_PATH="$ARCHIVE_DIR/$PLAN_BASENAME"

if [[ "$PLAN_FILE" == "$ARCHIVE_PATH" ]]; then
  echo "  Already in archive, skipping move"
else
  mv "$PLAN_FILE" "$ARCHIVE_PATH"
  echo "  Moved to archive/$PLAN_BASENAME"
fi

# ---------- Step 3: Update README.md index ----------
# Remove from Active Plans table (line containing the plan filename)
if grep -q "$PLAN_BASENAME" "$README"; then
  # Remove the row from Active Plans section
  sed -i "/|.*$PLAN_BASENAME.*|/d" "$README"
  echo "  Removed from Active Plans table"
fi

# Add to Archived Plans table
EVO_LINK="[evolution](../../references/evolution-log.md)"
# Find the Archived Plans section and append after header row
if grep -q "### Archived Plans" "$README"; then
  # Check if there's a header row already
  if ! grep -q "^| Plan | Date | Status | Evolution Log |" "$README"; then
    sed -i "/### Archived Plans/a\\| Plan | Date | Status | Evolution Log |\n|------|------|--------|---------------|" "$README"
  fi
  # Append new row after the header separator
  sed -i "/^|------|------|--------|---------------|/a | $PLAN_TITLE | $(grep '^date:' "$ARCHIVE_PATH" | head -1 | sed 's/date: *//') | $NEW_STATUS | $EVO_LINK |" "$README"
  echo "  Added to Archived Plans table"
fi

# ---------- Step 4: Verify ----------
echo ""
echo "=== Running verification ==="
bash "$REPO_ROOT/tools/verify-superpowers-index.sh"

echo ""
echo "=== Archive complete ==="
echo "  Plan: $PLAN_BASENAME"
echo "  Status: $NEW_STATUS"
echo "  Location: archive/$PLAN_BASENAME"
echo ""
echo "NEXT: Run plan-evolution-tracker skill to generate evolution card"
echo "  and update references/evolution-log.md"
