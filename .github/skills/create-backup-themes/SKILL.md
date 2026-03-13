---
name: create-backup-themes
description: Creates backup branches from the remote live theme branches for all 3 stores (US, EU, UK). Use when the user says "create backup", "backup themes", "backup live", "snapshot themes", or asks to back up live branches before a release or deployment.
---

# Create Backup Themes

Creates date-stamped backup branches from the remote `live/*` branches for all 3 stores and pushes them to the remote.

## Backup Branch Naming

| Source Branch   | Backup Branch              |
|-----------------|----------------------------|
| `live/us`       | `backup/us-<MMDDYYYY>`    |
| `live/eu`       | `backup/eu-<MMDDYYYY>`    |
| `live/uk`       | `backup/uk-<MMDDYYYY>`    |

The date uses the **current date** in `MMDDYYYY` format (e.g., `backup/us-03122026` for March 12, 2026).

If a backup for today already exists, an incremental suffix is appended:
- First backup: `backup/us-03122026`
- Second backup: `backup/us-03122026-2`
- Third backup: `backup/us-03122026-3`
- ...and so on

## Instructions

Run the following commands sequentially in a terminal. **Do not run them in parallel.**

### Step 1: Fetch latest remote branches

```bash
git fetch origin
```

### Step 2: Determine today's date stamp

Use the current date in `MMDDYYYY` format. In the terminal:

```bash
DATE_STAMP=$(date +%m%d%Y)
echo "Date stamp: $DATE_STAMP"
```

### Step 3: Resolve backup branch names (handle duplicates)

Before creating branches, check if backup branches with today's date already exist on the remote. If they do, append an incremental suffix (`-2`, `-3`, etc.) to find a unique name.

For each store (`us`, `eu`, `uk`), determine the branch name using this logic:

```
base = backup/<store>-<MMDDYYYY>

If remote branch `base` does NOT exist → use `base`
If remote branch `base` exists → try `base-2`, then `base-3`, etc. until a name is available
```

Run the following to check existing remote backup branches and determine the suffix:

```bash
# Check existing remote backups for today's date
git branch -r | grep "origin/backup/.*-$DATE_STAMP" | sed 's|origin/||' | sort
```

For each store, resolve the final branch name. Example logic per store:

```bash
# For a given STORE (us, eu, uk):
BRANCH="backup/${STORE}-${DATE_STAMP}"
if git branch -r | grep -q "origin/${BRANCH}$"; then
  SUFFIX=2
  while git branch -r | grep -q "origin/${BRANCH}-${SUFFIX}$"; do
    SUFFIX=$((SUFFIX + 1))
  done
  BRANCH="${BRANCH}-${SUFFIX}"
fi
echo "Backup branch for ${STORE}: ${BRANCH}"
```

Repeat this for all 3 stores to determine `BRANCH_US`, `BRANCH_EU`, and `BRANCH_UK`.

### Step 4: Create backup branches from remote live branches

Using the resolved branch names from Step 3:

```bash
git branch $BRANCH_US origin/live/us
git branch $BRANCH_EU origin/live/eu
git branch $BRANCH_UK origin/live/uk
```

### Step 5: Push backup branches to remote

```bash
git push origin $BRANCH_US $BRANCH_EU $BRANCH_UK
```

### Step 6: Clean up local backup branches

After pushing, delete the local backup branches to keep the local repo clean:

```bash
git branch -D $BRANCH_US $BRANCH_EU $BRANCH_UK
```

### Step 7: Confirm success

Report to the user which backup branches were created and pushed, showing the actual resolved names:

```
Backup branches created and pushed to remote:
  - <BRANCH_US>  (from live/us)
  - <BRANCH_EU>  (from live/eu)
  - <BRANCH_UK>  (from live/uk)
```

## Error Handling

- If `git fetch` fails, check network connectivity and authentication.
- If push fails, verify the user has write access to the remote repository.
- Always return to the original branch/state after the operation.