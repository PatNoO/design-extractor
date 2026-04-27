---
name: git-ship
description: "Ship a completed feature or fix end-to-end: commit, push, and open a PR. Use when: shipping a finished feature, sending code for review, committing and pushing a completed change, open a PR."
argument-hint: "Optional: PR description notes"
allowed-tools: Bash(git status), Bash(git diff --stat), Bash(git diff), Bash(git log --oneline *), Bash(git add *), Bash(git commit -m *), Bash(git rev-parse --abbrev-ref HEAD), Bash(git rev-parse --abbrev-ref --symbolic-full-name @{u}), Bash(git fetch origin), Bash(git rebase origin/main), Bash(git push -u origin *), Bash(git push), Bash(gh pr create *), Bash(gh pr view *)
---

# Git Ship — design-extractor

Ships the current branch to remote and opens a PR targeting `main`.
Run each step sequentially — do not skip steps.

The optional argument is: `$ARGUMENTS`

---

## Step 1 — Verify the branch

```bash
git rev-parse --abbrev-ref HEAD
```

- If branch is `main`, **stop** — direct pushes not allowed
- Confirm branch name is appropriate for the change
- Extract a descriptive name if possible for the PR

---

## Step 2 — Sync with main

```bash
git fetch origin
git rebase origin/main
```

If rebase has conflicts, **stop and report to developer**. Never auto-resolve conflicts.

---

## Step 3 — Commit all changes

Follow `.claude/skills/git-commit/SKILL.md` in full:

1. `git status` and `git diff --stat`
2. If working tree is clean, skip to Step 4
3. Stage specific files — never `git add .`
4. Commit with correct format

**If commit fails, stop.**

---

## Step 4 — Push the branch

Follow `.claude/skills/git-push/SKILL.md` in full:

1. Show last 5 commits so user can confirm
2. Verify `[claude]` prefix on all commits — note any that don't
3. Push:
   - No upstream → `git push -u origin <branch>`
   - Upstream set → `git push`
4. Never force-push without explicit user confirmation

**If push fails, stop.**

---

## Step 5 — Open a PR to main

```bash
gh pr create --base main --title "[claude] <Descriptive Title>" --body "<body>"
```

### PR Title
```
[claude] <Title Case Summary of Changes>
```

### PR Body

Draft a clear description of the change:

```markdown
## Summary
<One or two sentences describing what was changed and why.>

### What Was Done
1. <Category 1>: <changes>
2. <Category 2>: <changes>
3. <Category 3>: <changes>

### Files Changed
- `.claude/skills/...` — skill updates
- `references/...` — documentation
- `README.md` — readme updates
- Other files...

### Testing
<How can this be verified? Any manual steps needed?>

### Notes
- <Breaking changes?>
- <Dependencies added?>
- <TODOs or follow-ups?>
```

After PR is created, display the PR URL to the user.

---

## Completion checks

- [ ] Branch is not `main`
- [ ] Synced with `origin/main` via rebase — no conflicts
- [ ] Specific files staged only — no `git add .`
- [ ] Commit follows `[claude]` format
- [ ] No hooks skipped
- [ ] Push succeeded
- [ ] PR created targeting `main` with clear description
- [ ] PR URL displayed to user
