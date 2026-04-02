#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Create date-stamped backup branches from live/* for all stores
# Usage: bash create-backup-themes.sh
# ============================================================

STORES=("us" "eu" "uk")

echo "Fetching latest remote branches..."
git fetch origin

DATE_STAMP=$(date +%m%d%Y)
echo "Date stamp: $DATE_STAMP"

declare -A BACKUP_BRANCHES

for STORE in "${STORES[@]}"; do
  BRANCH="backup/${STORE}-${DATE_STAMP}"

  if git branch -r | grep -q "origin/${BRANCH}$"; then
    SUFFIX=2
    while git branch -r | grep -q "origin/${BRANCH}-${SUFFIX}$"; do
      SUFFIX=$((SUFFIX + 1))
    done
    BRANCH="${BRANCH}-${SUFFIX}"
  fi

  BACKUP_BRANCHES[$STORE]="$BRANCH"
  echo "Resolved backup branch for ${STORE}: ${BRANCH}"
done

echo ""
echo "Creating local backup branches from remote live branches..."
for STORE in "${STORES[@]}"; do
  BRANCH="${BACKUP_BRANCHES[$STORE]}"
  git branch "$BRANCH" "origin/live/${STORE}"
  echo "  Created: ${BRANCH} (from origin/live/${STORE})"
done

echo ""
echo "Pushing backup branches to remote..."
PUSH_ARGS=()
for STORE in "${STORES[@]}"; do
  PUSH_ARGS+=("${BACKUP_BRANCHES[$STORE]}")
done
git push origin "${PUSH_ARGS[@]}"

echo ""
echo "Cleaning up local backup branches..."
for STORE in "${STORES[@]}"; do
  git branch -D "${BACKUP_BRANCHES[$STORE]}"
done

echo ""
echo "Backup branches created and pushed to remote:"
for STORE in "${STORES[@]}"; do
  echo "  - ${BACKUP_BRANCHES[$STORE]}  (from live/${STORE})"
done
