# pen-to-figma Health Check

Run this before using the skill on a real .pen file to confirm everything is wired up.

## Step 1 — Converter engine

```bash
node tests/converter.test.js
```

Expected: `✅ All converter tests passed`

If tests fail: the engine is broken. Check recent changes to `converter/pen-to-figma.js`.

## Step 2 — Pencil MCP

Call `get_editor_state` via the Pencil MCP tool.

Expected: returns editor state (even if no file is open — that's fine).

If it errors: the Pencil MCP server is not configured. Ask the user to install and connect it before proceeding.

## Step 3 — End-to-end test (optional)

If the test suite file exists:

```bash
node tests/run.js
```

Expected: 13 assertions pass. Requires `Test Design/DailyDone-figma-plugin.js` to exist.
If that file is missing, skip this step — `converter.test.js` is sufficient.

## No calibration needed

Unlike `design-extractor`, `pen-to-figma` does not need project-specific calibration.
The `.pen` format is standardized — once the health check passes, the skill is ready for any pen file.
