---
name: create-backup-themes
description: Creates backup branches from the remote live theme branches for all 3 stores (US, EU, UK). Use when the user says "create backup", "backup themes", "backup live", "snapshot themes", or asks to back up live branches before a release or deployment. Supports --update-persistent to also reset the persistent backup/us, backup/eu, backup/uk branches.
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

## General Backup Branches (optional)

When the `--update-persistent` flag is passed, the script also resets the persistent (undated) backup branches to match the current live branches:

| Source Branch   | General Backup Branch |
|-----------------|-----------------------|
| `live/us`       | `backup/us`           |
| `live/eu`       | `backup/eu`           |
| `live/uk`       | `backup/uk`           |

These branches are force-pushed, replacing whatever was there before.

## Instructions

Run the backup script using the pnpm task:

```bash
pnpm backup-themes
```

Or run the script directly:

```bash
# Date-stamped backups only
bash .github/skills/create-backup-themes/scripts/create-backup-themes.sh

# Date-stamped backups + reset persistent backup branches
bash .github/skills/create-backup-themes/scripts/create-backup-themes.sh --update-persistent
```

The script performs the following operations automatically:

1. **Fetches latest remote branches** (`git fetch origin`)
2. **Determines today's date stamp** in `MMDDYYYY` format
3. **Resolves backup branch names** for all 3 stores (US, EU, UK), handling duplicate names by appending incremental suffixes (`-2`, `-3`, etc.)
4. **Creates local backup branches** from remote `live/*` branches
5. **Pushes backup branches** to the remote repository
6. **Cleans up local backup branches** after successful push
7. **Reports success** with the actual branch names created
8. *(If `--update-persistent`)* **Resets `backup/us`, `backup/eu`, `backup/uk`** to their respective `live/*` branches via force-push, then cleans up local copies

The script output will show which backup branches were created and pushed.

## Error Handling

The script uses `set -euo pipefail` for strict error handling and will exit immediately if any step fails.

- If `git fetch` fails, check network connectivity and authentication.
- If push fails, verify the user has write access to the remote repository.
- The script automatically cleans up local backup branches after successful push.