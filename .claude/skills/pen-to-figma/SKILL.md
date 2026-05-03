# pen-to-figma

Convert any `.pen` file into a paste-ready Figma plugin script.

## What this skill does

1. Reads the pen file structure via Pencil MCP tools
2. Resolves design variables to their current values
3. Inlines reusable component instances
4. Generates a `figma-plugin.js` script
5. User pastes it into the Figma console → design appears

## Trigger

User types `/pen-to-figma` (optionally with a file path or page name).

---

## Steps to follow

### Step 0 — Verify prerequisites

Before starting, confirm the skill is operational:

1. Check converter engine exists:
   ```bash
   ls converter/pen-to-figma.js
   ```
   If missing, the skill cannot generate output — stop and report.

2. Run converter unit tests:
   ```bash
   node tests/converter.test.js
   ```
   All tests must pass before proceeding. If any fail, the engine is broken — report the failure and do not continue.

3. Confirm Pencil MCP is reachable by calling `get_editor_state`. If it errors, the user needs to configure the Pencil MCP server first.

---

### Step 1 — Find the pen file

Call `get_editor_state` to check if a pen file is already open in Pencil.

If no file is open and the user didn't provide a path, ask them to either:
- Open the file in Pencil and re-run the skill, or
- Provide the path to the `.pen` file

### Step 2 — Read variables

Call `get_variables` to fetch all design variables (colors, spacing, etc.).
Build a flat map: `{ "$variable-name": resolvedValue }` using the default/light theme.

### Step 3 — Read the node tree

Call `batch_get` to read all screens (top-level frames) and their descendants.

Use a pattern like `**` or `*` to get all nodes. If the file is large (>50 screens),
ask the user if they want to convert specific screens.

For each node, capture all properties relevant to the Figma engine:
- `id`, `name`, `type`
- `x`, `y`, `width`, `height`, `opacity`
- `fill` (hex string, gradient object, or $variable reference)
- `stroke` (object with `fill`, `thickness`, `align`)
- `effect` (array of shadow/blur effects)
- `cornerRadius` (number or [tl, tr, br, bl] array)
- `layout` ("horizontal" | "vertical" | "none")
- `gap`, `padding`, `justifyContent`, `alignItems`
- `layoutPosition` ("absolute" for absolutely-positioned children)
- `clip` (boolean)
- `children` (recursive)

For text nodes, also capture:
- `content` (the text string — pen may call this `text` or `label`)
- `fontFamily`, `fontWeight`, `fontSize`
- `letterSpacing`, `lineHeight` (as multiplier, e.g. 1.5)
- `textAlign` ("left" | "center" | "right" | "justify")
- `textGrowth` ("auto" | "fixed-width" | "fixed-width-height")

For icon_font nodes, capture:
- `iconFontName` (the icon identifier, e.g. "home", "check_circle")
- `fill`, `width`, `height`

For `ref` nodes (component instances), note the `refId` — the converter inlines these.

### Step 4 — Resolve variables

Replace any `$variable-name` string values with their resolved values from the variable map.

### Step 5 — Normalize the node tree

Apply these normalizations to produce the intermediate format:

| Pen property | Engine property | Notes |
|---|---|---|
| `text` or `label` | `content` | Text node content field |
| `lineHeight: 1.5` | `lineHeight: 1.5` | Keep as multiplier (engine converts to PERCENT) |
| `cornerRadius: [8,8,0,0]` | `cornerRadius: [8,8,0,0]` | Pass arrays through as-is |
| `fill: "$color-primary"` | `fill: "#2563EB"` | Resolve variable |
| `ref` node | Inline as `frame` | Copy component definition, apply overrides |

Pill/badge frames (cornerRadius ≥ 999 with padding and children) MUST have a layout set.
If they don't have `layout` set, add `"layout": "horizontal"` to avoid them rendering as circles in Figma.

### Step 6 — Generate the script

Read `converter/pen-to-figma.js` to understand the `generateFigmaScript` function.

Then call it (or replicate its logic inline) to produce the complete Figma script:
- Wrap the ENGINE template + screen data JSON + runner code
- Pass the page name (default: the pen file name without extension)

Write the output to `figma-plugin.js` (or a name derived from the pen file, e.g. `MyApp-figma-plugin.js`).

> The unit tests run in Step 0 already verified the engine produces valid scripts. No additional validation step is needed — the converter is deterministic given valid normalized input.

### Step 7 — Report to user

Tell the user:
1. The output file path
2. How many screens were found
3. Any warnings (unresolved variables, ref nodes that couldn't be inlined, SVG paths that were simplified)
4. Instructions:
   ```
   Open Figma → Plugins → Development → Open Console
   Paste the contents of figma-plugin.js → press Enter
   ```

---

## Known limitations

- **Icons**: `icon_font` nodes render as labeled text `[icon_name]`, not real icons.
  To get real icons: install Material Symbols or Lucide font in Figma first.
- **SVG paths**: Complex vector paths render as placeholder rectangles with the correct fill.
- **Script nodes**: Procedurally generated content (`script` type) is skipped.
- **Image fills**: Not supported — nodes with image fills render as empty rectangles.

---

## Example output format

The generated `figma-plugin.js` follows this structure:
```js
// Engine helpers (loadFonts, buildNode, color/layout utils)
...

// Screen data
function getScreens() {
  return [ /* normalized pen nodes as JSON */ ];
}

// Runner
await loadFonts();
figma.currentPage.name = "My App";
const screens = getScreens();
let xOffset = 0;
for (const screen of screens) {
  const frame = await buildNode(screen, null, xOffset);
  if (frame) xOffset += (frame.width || 390) + 40;
}
figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
console.log("✅ N screen(s) imported!");
```

---

## Testing the output

After generating, the user should validate in Figma:

1. All screens are visible and the right size
2. Colors and fills match the pen design
3. Layout (spacing, alignment) looks correct
4. Icons show as `[icon_name]` labels — acceptable for structure review
5. Text content is correct

If something looks wrong, the user can share a screenshot and you can:
- Read the `figma-plugin.js` output
- Find the problematic node in the pen data
- Fix the normalization and regenerate
