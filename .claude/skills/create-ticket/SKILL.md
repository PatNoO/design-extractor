---
name: create-ticket
description: "Create a local ticket in Ticket.md. Use when asked to create, open, or add a ticket (e.g. 'Create a ticket for …'). Tickets are stored locally in Ticket.md and never pushed to GitHub."
argument-hint: "Short description of what the ticket is for"
allowed-tools: Bash(mkdir -p), Bash(cat), Bash(echo), Bash(date)
---

# Create Local Ticket — design-extractor

Use this skill to create a well-structured local ticket entry following design-extractor conventions.

**Important**: All tickets are appended to `Ticket.md` in the project root and added to `.gitignore` — tickets never get pushed to GitHub.

The request is: `$ARGUMENTS`

---

## Step 1 — Classify the ticket

| Type | When | Example title |
|------|------|---------------|
| `feature` | New skill, feature, or enhancement | `Add local project formatting to SKILL.md` |
| `bug` | Something broken or incorrect | `Fix lineHeight unit handling in Figma script` |
| `doc` | Documentation work | `Write frame generation reference guide` |
| `refactor` | Technical restructuring | `Extract token scanning to separate module` |
| `spike` | Time-boxed investigation | `Investigate Figma API rate limits` |

---

## Step 2 — Generate ticket entry

Tickets are appended to `Ticket.md` in the project root using this template:

```markdown
## [<TYPE>] <Title>

**Created**: <ISO 8601 datetime>
**Status**: Open
**Priority**: <High / Medium / Low>

### Description
<What is this ticket about? Why does it matter?>

### Acceptance Criteria
- [ ] AC1: <Specific, testable outcome>
- [ ] AC2: <Specific, testable outcome>

### Implementation Notes
- Effort: <XS / S / M / L / XL>
- Dependencies: <Other tickets or "none">

---
```

---

## Step 3 — Append to Ticket.md

If `Ticket.md` doesn't exist, create it with header:

```markdown
# Project Tickets

All tickets are local and never pushed to GitHub.

---
```

Then append the new ticket entry.

---

## Step 4 — Verify .gitignore

Ensure `Ticket.md` is in `.gitignore`:

```
Ticket.md
```

---

## Completion checks

- [ ] Ticket type classified
- [ ] Ticket entry created with all template sections
- [ ] Entry appended to `Ticket.md`
- [ ] `Ticket.md` is in `.gitignore`
- [ ] Ticket title and status displayed to user
