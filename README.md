# design-extractor

> **Status: Early Beta** — core extraction works, but the skill is still being tested across different frameworks and project structures. Expect rough edges. Feedback and bug reports are welcome via [Issues](../../issues).

**A Claude Code skill that reads your codebase and generates a ready-to-run Figma script — tokens, components and frames in a single paste.**

---

## The Problem

Every time you change a color, spacing value or component in code, Figma drifts out of sync. Keeping design tools aligned with the real codebase is slow, manual work — and it usually doesn't happen.

## The Solution

`design-extractor` is a Claude Code skill that bridges that gap automatically. Point it at any repo and it delivers a single JavaScript file. Paste that file into the Figma console and your entire design system appears: color styles, typography, component library, and page frames at both mobile and desktop sizes — built from the actual values in your code.

```
1.  Claude Code runs the skill against your repo
2.  Generates figma-import.js
3.  Open Figma → Plugins → Development → Open Console
4.  Paste → Enter
5.  Done
```

**One paste. One Enter. Done.**

---

## How It Works

The skill runs in four stages:

| Stage | What happens |
|-------|-------------|
| **1. Identify** | Detects the framework (Next.js, Tailwind, SwiftUI, Vue…) and locates token sources |
| **2. Extract** | Pulls colors, typography, spacing, border radius and shadows from config files and CSS |
| **3. Scan** | Finds UI components (Button, Card, Input…) and maps their variants and states |
| **4. Generate** | Produces a single `figma-import.js` that creates everything in Figma automatically |

---

## Installation

Copy the skill into your project:

```bash
# Inside any project where you want to use it
mkdir -p .claude/skills
cp -r design-extractor .claude/skills/
```

Once the folder is in place, Claude Code picks it up automatically.

## Quick Start

1. **Install** the skill into your project (see Installation above)
2. **Ask Claude Code**:
   > "Generate figma-import.js for this project"
3. Claude Code will:
   - Scan your codebase
   - Extract design tokens, components, and page layouts
   - Generate a ready-to-run `figma-import.js` script
4. **Run in Figma**:
   - Open Figma → Plugins → Development → Open Console
   - Paste the script → Press Enter
   - Your entire design system appears automatically ✨

## Skill File Structure

The skill includes:

| File/Folder | Purpose |
|---|---|
| `SKILL.md` | Main skill definition with all extraction rules and Figma API constraints |
| `references/` | Detailed guides for patterns, templates, and generation logic |
| `scripts/extract.py` | Standalone Python utility for pre-extracting tokens |
| `setup-extractor.md` | Workflow for adapting the skill to a new codebase |

## Usage

### For Projects Using This Skill

Simply tell Claude Code what you need:

> "Generate figma-import.js for this project"

Or trigger the skill directly with the slash command:

> `/design-extractor`

Claude Code reads the skill, scans your repo and delivers the script. No flags, no configuration needed.

### For Customizing the Skill

The skill works out of the box, but for best results you can calibrate it to your specific framework and styling approach. This is a one-time setup — just tell Claude Code:

> "Run setup-extractor.md for this project"

Claude Code will automatically:
1. Scan your project (framework, styling, component structure)
2. Write the results into `SKILL.md` as a "Local Project Formatting" section
3. Use those rules for all future extractions — no further action needed

**You don't edit anything manually.** The setup workflow handles it all.

---

## What Gets Customized

- **Framework** (React, Vue, Svelte, Next.js, SwiftUI, etc.)
- **Styling approach** (Tailwind, CSS Modules, Styled Components, CSS-in-JS)
- **Component folder structure** (where to scan for components)
- **Code generation rules** (naming conventions, file format, output structure)

---

## Key Features

### Framework detection

The skill identifies the stack by looking for known signals:

| Signal | Framework |
|--------|-----------|
| `tailwind.config.js/ts` | Tailwind CSS |
| `*.module.css`, `styles/` | CSS Modules |
| `styled-components`, `emotion` | CSS-in-JS |
| `tokens.js`, `theme.js`, `design-tokens.*` | Explicit token file |
| `*.swift`, `Color+Extensions.swift` | SwiftUI |
| `variables.css`, `:root { --` | CSS Custom Properties |

### Token extraction (priority order)

1. Explicit token file (`theme.js`, `tokens.json`) — read directly
2. Tailwind config — `colors`, `fontFamily`, `fontSize`, `spacing`, `borderRadius`
3. CSS custom properties — `:root { --color-primary: ... }`
4. CSS-in-JS theme object
5. Hardcoded values collected from component files

### Component scanning

Scans `components/`, `src/components/`, `ui/` and similar directories for React, SwiftUI and Vue primitives. Reads variant definitions from `cva()` / `tv()` calls, Storybook stories, and prop destructuring patterns to document all visual states.

### Frame generation

Reads every route in the app:
- **Next.js App Router** — `app/**/page.tsx`
- **Next.js Pages** — `pages/**/*.tsx`
- **React Router** — `App.tsx` / `router.tsx`
- **SwiftUI** — `*View.swift`
- **HTML/CSS** — all `.html` files

Maps Tailwind layout signals to Figma Auto Layout:

| CSS / Tailwind | Figma |
|----------------|-------|
| `flex flex-col` | `layoutMode: VERTICAL` |
| `flex flex-row` | `layoutMode: HORIZONTAL` |
| `space-y-4` | `itemSpacing: 16` |
| `p-6` | `padding: 24` all sides |
| `px-4 py-2` | `paddingLeft/Right: 16`, `paddingTop/Bottom: 8` |

### Supported frameworks

| Framework | Tokens | Components | Frames |
|-----------|--------|------------|--------|
| Next.js + Tailwind | Automatic | Automatic | Automatic |
| React + CSS Modules | Good | Good | Good |
| HTML/CSS | CSS vars | Manual scan | Per `.html` file |
| SwiftUI | Color extensions | Views | Scenes |
| Vue | Automatic | Automatic | Automatic |
| C++ / Qt | Manual | `.ui` files | Widget tree |

---

## Business Logic

### Figma free plan: 3-page hard limit

Figma's free tier allows a maximum of 3 pages per file. A naive implementation that creates one page per route hits this limit immediately on any real app.

The skill enforces a strict 2-page rule:

```
Page 1: "🧩 Components"  → all components side by side
Page 2: "📐 Frames"      → all page frames, desktop + mobile, positioned horizontally
```

Frames sit next to each other with an 80px gap — never on separate Figma pages. This constraint is baked into the generation rules and cannot be overridden.

### lineHeight: no MULTIPLIER units

Figma's plugin API rejects `{ unit: "MULTIPLIER" }` for text styles. The skill converts any multiplier-based line-height from the source code to `PERCENT` before writing to Figma:

```javascript
// Source: lineHeight: 1.5
// Output:
style.lineHeight = { unit: "PERCENT", value: 150 };
```

### No placeholders — real values only

Every color, spacing and font in the generated frames references the extracted tokens directly. Generic placeholder rectangles are prohibited.

---

## The `extract.py` script

A standalone Python utility for pre-extracting tokens outside of Claude Code:

```bash
python .claude/skills/design-extractor/scripts/extract.py \
  --repo /path/to/your/repo \
  --output ./design-tokens.json \
  --format tokens-studio \
  --summary
```

Outputs Tokens Studio JSON, raw CSS custom properties, or a plain object. The `--summary` flag prints a human-readable report of what was found.

---

## Output

Every run delivers:

1. **`figma-import.js`** — the combined, ready-to-run script
2. **`design-system-summary.md`** — what was extracted and any gaps flagged
3. Three-line instructions for running the script in Figma

---

## Key principles

- **Read-only** — never modifies the source repo
- **Graceful assumptions** — uses technical values when semantic names are missing
- **Transparent gaps** — explicitly flags what could not be extracted automatically
- **Portable output** — the generated script has no dependency on the original repo

---

## License

MIT — see [LICENSE](LICENSE)
