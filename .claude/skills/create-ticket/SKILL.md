---
name: create-ticket
description: "Create a local ticket as a .md file. Use when asked to create, open, or add a ticket (e.g. 'Create a ticket for …'). Tickets are stored locally and never pushed to GitHub."
argument-hint: "Short description of what the ticket is for"
allowed-tools: Bash(mkdir -p), Bash(ls)
---

# Create Local Ticket — design-extractor

Use this skill to create a well-structured local ticket file following design-extractor conventions.

**Important**: All ticket files are stored in `.tickets/` and added to `.gitignore` — they never get pushed to GitHub.

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

## Step 2 — Generate ticket filename

Use format: `<TIMESTAMP>-<TYPE>-<SLUG>.md`

Where:
- `TIMESTAMP` = `YYYY-MM-DD-HHMMSS` (UTC)
- `TYPE` = `feature`, `bug`, `doc`, `refactor`, or `spike`
- `SLUG` = URL-safe short description (kebab-case, max 30 chars)

Example:
```
2026-04-27-144530-feature-local-project-formatting.md
```

---

## Step 3 — Create `.tickets/` directory if needed

```bash
mkdir -p .tickets
```

---

## Step 4 — Draft the ticket fields

All tickets use this template structure:

```markdown
# [<TYPE>] <Title>

**Created**: <ISO 8601 datetime>
**Status**: Open
**Priority**: <High / Medium / Low>

## Description
<What is this ticket about? Why does it matter?>

## Acceptance Criteria
- [ ] AC1: <Specific, testable outcome>
- [ ] AC2: <Specific, testable outcome>
- [ ] AC3: <Specific, testable outcome>

## Implementation Notes
- Module: <Which skill or file?>
- Effort: <XS / S / M / L / XL>
- Dependencies: <Other tickets or "none">
- Blocked by: <Issues or "none">

## Related Files
- Link or list files affected

## Edge Cases to Handle
- [ ] <Case 1>
- [ ] <Case 2>

## Comments
<Any additional context or notes>
```

---

## Step 5 — Write and save the ticket file

Create the file at `.tickets/<FILENAME>` with the following sections filled in:

### Title
- Feature: `<Verb> <Subject>` — e.g. `Add Local Project Formatting to SKILL.md`
- Bug: `Fix <what's broken>` — e.g. `Fix lineHeight Unit Handling in Figma Script`
- Doc: `<Subject>` — e.g. `Write Frame Generation Reference`
- Refactor: `<Action> <Subject>` — e.g. `Extract Token Scanning to Module`
- Spike: `Investigate <Question>` — e.g. `Investigate Figma API Rate Limits`

### Priority
- **High**: Blocking other work or critical for project goals
- **Medium**: Important but not blocking (default)
- **Low**: Nice-to-have enhancement

### Effort Estimate
- **XS**: 15 minutes
- **S**: 30–60 minutes
- **M**: 2–4 hours
- **L**: Half day
- **XL**: Full day or more

---

## Step 6 — Confirm ticket created

After creating the ticket, display:

```
✅ Ticket created: .tickets/<FILENAME>

Title: <Title>
Type: <Type>
Priority: <Priority>
Status: Open
```

---

## Step 7 — Add to .gitignore if needed

Verify `.tickets/` is in `.gitignore` — it should be. If not, add:

```
.tickets/
```

And commit this change separately.

---

## Ticket File Locations

All tickets are stored in: `.tickets/<TIMESTAMP>-<TYPE>-<SLUG>.md`

To list all open tickets:
```bash
ls -la .tickets/
```

To view a specific ticket:
```bash
cat .tickets/<FILENAME>.md
```

To mark a ticket complete, add to the file:
```markdown
**Status**: Complete ✅
**Completed**: <ISO 8601 datetime>
```

---

## Completion checks

- [ ] Ticket type classified
- [ ] Filename follows `<TIMESTAMP>-<TYPE>-<SLUG>.md` format
- [ ] `.tickets/` directory created
- [ ] Ticket file created with all template sections
- [ ] `.tickets/` is in `.gitignore`
- [ ] Ticket filename and summary displayed to user
