---
name: git-commit
description: 'Commit message formatting for design-extractor. Use when: committing changes, writing a commit message, staging and committing files, first commit on a branch, subsequent commits.'
argument-hint: 'Optional: commit type (feat|fix|docs|refactor|test|chore) — omit for first commit on branch'
---

# Git Commit Format — design-extractor

All commits made with Claude Code assistance must start with the `[claude]` prefix. This is a strict project rule.

## First Commit on a Branch

Mirror the branch description and use Title Case with model name:

```
[claude] (MODEL_NAME) <Title Case Description>
```

⚠️ Replace `MODEL_NAME` with the **actual Claude model running this session** — never hardcode a model name.
Check which model is active and use that exact name.
Common values: `claude-sonnet-4-6`, `claude-opus-4-6`, `claude-haiku-4-5`

Example (branch `setup/calibrate-skill`, running claude-haiku-4-5):
```
[claude] (claude-haiku-4-5) Calibrate Design Extractor for Project
```

## Subsequent Commits

```
[claude] (MODEL_NAME) [<type>] <imperative description>
```

Examples (using claude-haiku-4-5):
```
[claude] (claude-haiku-4-5) [feat] Add Local Project Formatting section to SKILL.md
[claude] (claude-haiku-4-5) [fix] Correct lineHeight unit handling in Figma script
[claude] (claude-haiku-4-5) [docs] Update README with Quick Start guide
[claude] (claude-haiku-4-5) [refactor] Extract token scanning logic to separate function
[claude] (claude-haiku-4-5) [chore] Add setup-extractor.md workflow guide
```

## Commit Types

| Type | When |
|------|------|
| `feat` | New skill feature, section, or reference guide |
| `fix` | Bug fix or correction in extraction logic |
| `docs` | Documentation updates (README, guides) |
| `refactor` | Restructure SKILL.md or scripts, no behavior change |
| `test` | Test additions or test documentation |
| `chore` | Config, non-src changes, maintenance |

## Multi-Commit Strategy

When changes span multiple concerns, split into focused commits:

1. Run `git status` and `git diff --stat` to survey all changed files
2. Group by feature cohesion — files changed for same reason belong together
3. Order: documentation first, then skill definitions, then references, then scripts
4. Stage each group explicitly with `git add <files>` — never `git add .` when splitting

## Rules

- Prefix is always `[claude] (MODEL_NAME)` — use the actual active model, never hardcode a specific model name
- Never include `Co-Authored-By` footer
- Imperative mood: "Add feature" not "Added feature"
- Subject line under 72 characters — no body, no bullet points
- First commit on branch = no type prefix; all subsequent = type prefix required
- Never skip hooks (`--no-verify`) unless explicitly instructed by the developer
- Stage specific files by name — avoid `git add -A` or `git add .`
