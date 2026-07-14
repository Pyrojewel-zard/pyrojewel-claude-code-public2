#!/usr/bin/env bash
# sync-sources.sh — Fetch upstream updates and merge into fork repos
#
# Usage:
#   bash scripts/sync-sources.sh          # sync all forked repos
#   bash scripts/sync-sources.sh ljg      # sync only ljg-skills
#   bash scripts/sync-sources.sh beamer   # sync only beamer-academic
#   bash scripts/sync-sources.sh manager  # sync only skill_manager
#
# After sync, review changes and decide which skills to migrate:
#   see references/skills-extraction.md for source → target mapping

set -euo pipefail

BASE_DIR="${CLAUDE_SKILL_SOURCES_ROOT:-<source-repos-root>}"

# Repos with upstream: [name, dir, local_branch, upstream_branch]
FORK_REPOS=(
  "ljg|ljg-skills|master|master"
  "beamer|beamer-academic|main|main"
)

# Self-built repos (no upstream, just pull origin)
SELF_REPOS=(
  "manager|skill_manager|main"
)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[sync]${NC} $*"; }
warn() { echo -e "${YELLOW}[sync]${NC} $*"; }
err()  { echo -e "${RED}[sync]${NC} $*" >&2; }

sync_fork() {
  local shortname="$1"
  local dir="$2"
  local local_branch="$3"
  local upstream_branch="$4"
  local repo_path="${BASE_DIR}/${dir}"

  if [ ! -d "${repo_path}/.git" ]; then
    err "${dir}: not a git repo, skipping"
    return 1
  fi

  cd "${repo_path}"

  # Check for upstream remote
  if ! git remote get-url upstream &>/dev/null; then
    err "${dir}: no upstream remote configured, skipping"
    return 1
  fi

  local upstream_url
  upstream_url=$(git remote get-url upstream)
  log "${dir}: fetching from upstream (${upstream_url})"

  git fetch upstream 2>&1 | sed 's/^/  /'

  # Check if there are new commits
  local local_head upstream_head
  local_head=$(git rev-parse "origin/${local_branch}" 2>/dev/null || echo "")
  upstream_head=$(git rev-parse "upstream/${upstream_branch}" 2>/dev/null || echo "")

  if [ "${local_head}" = "${upstream_head}" ]; then
    log "${dir}: already up to date"
    return 0
  fi

  local behind ahead
  behind=$(git rev-list --count "origin/${local_branch}..upstream/${upstream_branch}" 2>/dev/null || echo "0")
  ahead=$(git rev-list --count "upstream/${upstream_branch}..origin/${local_branch}" 2>/dev/null || echo "0")

  log "${dir}: ${behind} commit(s) behind, ${ahead} commit(s) ahead of upstream"

  # Show new commits from upstream
  if [ "${behind}" -gt 0 ]; then
    log "${dir}: new upstream commits:"
    git log --oneline "origin/${local_branch}..upstream/${upstream_branch}" | sed 's/^/    /'
  fi

  # Merge upstream into local branch
  log "${dir}: merging upstream/${upstream_branch} into ${local_branch}"
  git checkout "${local_branch}" 2>&1 | sed 's/^/  /'
  git merge "upstream/${upstream_branch}" 2>&1 | sed 's/^/  /'

  # Push to origin
  log "${dir}: pushing to origin"
  git push origin "${local_branch}" 2>&1 | sed 's/^/  /'

  log "${dir}: sync complete"
}

sync_self() {
  local shortname="$1"
  local dir="$2"
  local local_branch="$3"
  local repo_path="${BASE_DIR}/${dir}"

  if [ ! -d "${repo_path}/.git" ]; then
    err "${dir}: not a git repo, skipping"
    return 1
  fi

  cd "${repo_path}"
  log "${dir}: pulling from origin"
  git checkout "${local_branch}" 2>&1 | sed 's/^/  /'
  git pull origin "${local_branch}" 2>&1 | sed 's/^/  /'
  log "${dir}: sync complete"
}

# Filter by argument
TARGET="${1:-all}"

case "${TARGET}" in
  all)
    for entry in "${FORK_REPOS[@]}"; do
      IFS='|' read -r shortname dir local_branch upstream_branch <<< "${entry}"
      sync_fork "${shortname}" "${dir}" "${local_branch}" "${upstream_branch}"
      echo ""
    done
    for entry in "${SELF_REPOS[@]}"; do
      IFS='|' read -r shortname dir local_branch <<< "${entry}"
      sync_self "${shortname}" "${dir}" "${local_branch}"
      echo ""
    done
    ;;
  ljg)
    IFS='|' read -r shortname dir local_branch upstream_branch <<< "${FORK_REPOS[0]}"
    sync_fork "${shortname}" "${dir}" "${local_branch}" "${upstream_branch}"
    ;;
  beamer)
    IFS='|' read -r shortname dir local_branch upstream_branch <<< "${FORK_REPOS[1]}"
    sync_fork "${shortname}" "${dir}" "${local_branch}" "${upstream_branch}"
    ;;
  manager)
    IFS='|' read -r shortname dir local_branch <<< "${SELF_REPOS[0]}"
    sync_self "${shortname}" "${dir}" "${local_branch}"
    ;;
  *)
    err "Unknown target: ${TARGET}"
    err "Usage: $0 [all|ljg|beamer|manager]"
    exit 1
    ;;
esac

echo ""
log "Sync finished. Review upstream changes, then update skills in pyrojewel_claude_code."
log "See references/skills-extraction.md for source → target mapping and migration instructions."
