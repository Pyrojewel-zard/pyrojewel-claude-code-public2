#!/usr/bin/env bash
# Verify consistency of docs/superpowers/ index and frontmatter.
# Exit 0 if all checks pass, 1 otherwise.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SP_DIR="$REPO_ROOT/docs/superpowers"
INDEX="$SP_DIR/README.md"
ERRORS=0

echo "=== Superpowers Index Verification ==="

# Check 1: Index file exists
if [[ ! -f "$INDEX" ]]; then
  echo "FAIL: $INDEX does not exist"
  exit 1
fi
echo "OK: Index file exists"

# Check 2: Every .md in plans/ and specs/ has YAML frontmatter with status
for dir in plans specs; do
  if [[ ! -d "$SP_DIR/$dir" ]]; then
    echo "SKIP: $SP_DIR/$dir does not exist yet"
    continue
  fi
  while IFS= read -r -d '' f; do
    fname="$(basename "$f")"
    if ! head -1 "$f" | grep -q '^---'; then
      echo "FAIL: $dir/$fname missing YAML frontmatter"
      ERRORS=$((ERRORS + 1))
    else
      # Check status field exists
      if ! grep -q '^status:' "$f"; then
        echo "FAIL: $dir/$fname missing 'status:' in frontmatter"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  done < <(find "$SP_DIR/$dir" -name '*.md' -print0)
done
echo "OK: Frontmatter checks done ($ERRORS errors so far)"

# Check 3: Every file in plans/specs is listed in the index
for dir in plans specs; do
  if [[ ! -d "$SP_DIR/$dir" ]]; then
    continue
  fi
  while IFS= read -r -d '' f; do
    fname="$(basename "$f")"
    if ! grep -q "$fname" "$INDEX"; then
      echo "FAIL: $dir/$fname not listed in README.md index"
      ERRORS=$((ERRORS + 1))
    fi
  done < <(find "$SP_DIR/$dir" -name '*.md' -print0)
done
echo "OK: Index coverage checks done ($ERRORS errors so far)"

# Check 4: No active-status files in archive/
if [[ -d "$SP_DIR/archive" ]]; then
  while IFS= read -r -d '' f; do
    fname="$(basename "$f")"
    [[ "$fname" == ".gitkeep" ]] && continue
    status="$(grep '^status:' "$f" | head -1 | sed 's/status: *//')"
    if [[ "$status" == "active" || "$status" == "draft" ]]; then
      echo "FAIL: archive/$fname has status=$status (should be completed/superseded/abandoned)"
      ERRORS=$((ERRORS + 1))
    fi
  done < <(find "$SP_DIR/archive" -name '*.md' -print0)
fi
echo "OK: Archive status checks done ($ERRORS errors so far)"

# Check 5: Archive files are listed in README index
if [[ -d "$SP_DIR/archive" ]]; then
  while IFS= read -r -d '' f; do
    fname="$(basename "$f")"
    [[ "$fname" == ".gitkeep" ]] && continue
    if ! grep -q "$fname" "$INDEX"; then
      echo "FAIL: archive/$fname not listed in README.md index"
      ERRORS=$((ERRORS + 1))
    fi
  done < <(find "$SP_DIR/archive" -name '*.md' -print0)
fi
echo "OK: Archive coverage checks done ($ERRORS errors so far)"

# Check 6: Evolution-log references exist as files
EVO_LOG="$REPO_ROOT/references/evolution-log.md"
if [[ -f "$EVO_LOG" ]]; then
  while IFS= read -r ref; do
    if [[ -n "$ref" ]]; then
      full_path="$REPO_ROOT/$ref"
      if [[ ! -f "$full_path" ]]; then
        echo "FAIL: evolution-log references $ref but file not found"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  done < <(grep -oP 'docs/superpowers/(plans|archive)/\S+\.md' "$EVO_LOG" 2>/dev/null || true)
  echo "OK: Evolution-log consistency checks done ($ERRORS errors so far)"
else
  echo "SKIP: references/evolution-log.md does not exist"
fi

# Check 7: Non-active plans have completed-date
for dir in plans archive; do
  if [[ ! -d "$SP_DIR/$dir" ]]; then continue; fi
  while IFS= read -r -d '' f; do
    fname="$(basename "$f")"
    status="$(grep '^status:' "$f" | head -1 | sed 's/status: *//')"
    if [[ -n "$status" && "$status" != "active" && "$status" != "draft" ]]; then
      if ! grep -q '^completed-date:' "$f"; then
        echo "FAIL: $dir/$fname status=$status but missing completed-date"
        ERRORS=$((ERRORS + 1))
      fi
    fi
  done < <(find "$SP_DIR/$dir" -name '*.md' -print0)
done
echo "OK: completed-date checks done ($ERRORS errors so far)"

# Summary
echo ""
if [[ $ERRORS -eq 0 ]]; then
  echo "ALL CHECKS PASSED"
  exit 0
else
  echo "$ERRORS CHECK(S) FAILED"
  exit 1
fi
