---
name: release
description: Manages the Shopify theme release process. Handles creating release branches, merging Jira ticket branches, version bumping, changelog updates, and merging to main. Use when the user says "release", "prepare release", "bump version", "create release", or references retainer ticket IDs (e.g., RET-123). Integrates with Jira MCP and GitHub MCP for ticket/branch discovery.
---

# Release Process

Follow these steps when preparing releases. **Main is the source of truth** — all releases are deployed via CI/CD workflow from main.

---

## Prerequisites

### Ticket ID Format

Tickets can be specified as:
- **Full ID**: `RET-123` (prefix from `.jira-code` file in project root)
- **Number only**: `123`

> **Note**: Ticket IDs are unrelated to PR numbers. Do not look up a PR by ticket number.

### SSH Key Configuration

**CRITICAL**: Configure SSH before any remote git operations.

At the start of the process, detect the SSH key once:

```bash
if [ -f .github-ssh-file ]; then
  SSH_KEY_PATH=$(cat .github-ssh-file)
elif [ -f ~/.github-ssh-file ]; then
  SSH_KEY_PATH=$(cat ~/.github-ssh-file)
fi

# Export once — applies to all subsequent git remote commands in this shell
export GIT_SSH_COMMAND="ssh -i $SSH_KEY_PATH -o IdentitiesOnly=yes"
```

Prepend `export GIT_SSH_COMMAND=...` to every remote git command (`pull`, `push`, `fetch`) if running in a new shell.

### Package Manager Detection

Determine the package manager by checking for lockfiles in the project root:
- `pnpm-lock.yaml` → use **pnpm**
- `yarn.lock` → use **yarn**
- `package-lock.json` or fallback → use **npm**

Use the detected package manager for all `install` commands if needed.

---

## Merge Strategy Reference

This strategy applies everywhere branches are merged.

1. **Fetch** the remote branch:
   ```bash
   git fetch origin {branch-name}
   ```

2. **Assess branch size** — compare commits not yet in main:
   ```bash
   git log main..origin/{branch-name} --oneline
   ```

3. **Small, single-ticket branch** (few commits, all for this ticket) → merge directly:
   ```bash
   git merge origin/{branch-name} --no-edit
   ```

4. **Large or multi-ticket branch** (many commits or references other tickets) → **MUST cherry-pick**:
   ```bash
   # Find commits for the specific ticket
   git log origin/{branch-name} --oneline --grep="{ticket-id}"

   # Cherry-pick only those commits
   git cherry-pick {commit-hash-1} {commit-hash-2}
   ```

> **CRITICAL**: Never merge an entire large branch. Cherry-pick only the commits relevant to the target ticket. Review commit diffs before cherry-picking.

### Resolving Merge Conflicts

When conflicts occur during merge or cherry-pick:
1. Review each conflict carefully and resolve preserving code integrity
2. Complete the merge/cherry-pick (`git merge --continue` or `git cherry-pick --continue`)
3. **Record for the final report**: file path, conflict description, and resolution approach

---

## Release Process

### 1. Identify Branch Names for Tickets

For each ticket in the release list:
- Use **jira-mcp** to get ticket details and **comments**
- Look for PR links in comments (e.g., `https://github.com/barrel/project/pull/54`)
- Use **github-mcp** to get the PR's head branch name
- Common branch formats: `bugfix/RET-123`, `feature/RET-456`, or generic names like `bugfix/ada`

**Validation**:
- Branch names may not match the ticket ID exactly — verify the branch changes are relevant to the ticket
- If a branch/ticket ID seems wrong (different project, typo), read the branch diff to confirm relevance

**CRITICAL**: If ticket comments reference PRs for tickets **not in the release list**, **STOP and ask the user** before including them. Never auto-merge unrequested tickets.

### 2. Sync Main Branch

Ensure you have the latest main:
```bash
git checkout main
git pull origin main
```

### 3. Backup Live Themes

Use the backup script to create date-stamped backups of all live theme branches:
```bash
pnpm backup-themes
```

This creates backup branches for US, EU, and UK stores from their respective `live/*` branches.

### 4. Determine Version Number

Get the current version from main:
```bash
git show main:package.json | grep '"version"'
```

Version bump rules (semantic versioning):
- **Default**: bump PATCH (e.g., 1.2.3 → 1.2.4)
- Bump MINOR for new features (1.2.3 → 1.3.0) — only if user requests
- Bump MAJOR for breaking changes (1.2.3 → 2.0.0) — only if user requests

### 5. Create Release Branch

```bash
git checkout main
git checkout -b release/v{version_number}
```

### 6. Merge Ticket Branches

For each ticket, follow the [Merge Strategy Reference](#merge-strategy-reference).

### 7. Bump Version Numbers

Update version in:
- `package.json` — `version` field
- `config/settings_schema.json` — version if present
- Any other theme version files

### 8. Update CHANGELOG.md

Add an entry for the new version:
```markdown
## [{version}] - {YYYY-MM-DD}

### Added
- RET-123: Feature description

### Fixed
- RET-125: Bug fix description
```

### 9. Commit Version Bump

```bash
git add package.json config/settings_schema.json CHANGELOG.md
git commit -m "Bump version to {version_number}"
```

### 10. Push Release Branch

```bash
git push origin release/v{version_number}
```

### 11. Merge Release to Main (Local Only)

**Do NOT push main** — the user will handle pushing and triggering deployment.

```bash
git checkout main
git merge release/v{version_number} --no-edit
```

### 12. Final Release Report

**Always** end with a comprehensive report. See [Release Report Format](#release-report-format).

Remind the user to:
1. Review the local main branch
2. Push main to trigger the deployment workflow: `git push origin main`

---

## Updating an Existing Release

Use when adding tickets, applying rework, or including fixes before deployment. The version number does **not** change.

### 1. Checkout Release Branch
```bash
git checkout release/v{version_number}
```

### 2. Merge Updated Ticket Branches

Follow the [Merge Strategy Reference](#merge-strategy-reference) for each new or updated ticket.

### 3. Update CHANGELOG.md

Add new tickets under the existing version section:
```markdown
## [{version}] - {YYYY-MM-DD}

### Added
- RET-123: Original feature
- RET-126: New feature added to release

### Fixed
- RET-125: Original bug fix
- RET-127: Additional bug fix
```

### 4. Commit Changelog
```bash
git add CHANGELOG.md
git commit -m "Update changelog for adding {ticket-ids}"
```

### 5. Push Updated Release Branch
```bash
git push origin release/v{version_number}
```

### 6. Merge to Main (Local Only)

**Do NOT push main** — the user will handle pushing.

```bash
git checkout main
git merge release/v{version_number} --no-edit
```

### 7. Updated Release Report

Provide an updated report covering both previously included and newly added tickets. See [Release Report Format](#release-report-format).

---

## Release Report Format

Always provide this report at the end of a release or release update.

```
## Release Report: v{version}

### Successfully Merged Tickets
1. **RET-123**: Fix cart calculation bug
   - Branch: bugfix/RET-123
   - Method: Direct merge

2. **RET-124**: Add new payment gateway
   - Branch: feature/updates
   - Method: Cherry-picked commits abc123, def456

### Merge Conflicts (if any)
- **assets/bundle.cart.js**
  - Conflict: Both tickets modified the cart calculation function
  - Resolution: Kept RET-124's implementation which subsumes RET-123's fix

### Summary
- Release Version: v{version}
- Total Tickets: {count}
- Release Branch: release/v{version}
- Main Status: Merged locally (NOT pushed)

### Next Steps
1. Review the local main branch
2. When ready to deploy, push main: `git push origin main`
3. The CI/CD workflow will automatically deploy to themes
```

**Required sections**:
- **Merged Tickets**: ticket ID, title, branch name, merge method (merge vs cherry-pick)
- **Merge Conflicts** (if any): file path, conflict description, resolution, follow-up concerns
- **Summary**: version, ticket count, branch name, main branch status
- **Next Steps**: clear instructions for user to review and deploy

---

## Troubleshooting

| Issue | Resolution |
|-------|------------|
| **Branch not found** | Check Jira ticket comments for PR links. Use jira-mcp to find the correct PR/branch. |
| **Branch seems unrelated** | Read the branch diff to verify changes match the ticket. Branch names can be misleading. |
| **Complex merge conflicts** | Consult the ticket author. Document the conflict and resolution for the release report. |
| **Version uncertainty** | Default to PATCH bump. Only bump MINOR/MAJOR when explicitly requested. |
