# Tokens Studio JSON Format

Tokens Studio is a Figma plugin that reads design tokens from JSON.
Use this format to import tokens directly into Figma.

## Basic structure

```json
{
  "global": {
    "colors": {
      "primary": { "value": "#3B82F6", "type": "color" },
      "background": { "value": "#FFFFFF", "type": "color" },
      "surface": { "value": "#F9FAFB", "type": "color" },
      "text-primary": { "value": "#111827", "type": "color" },
      "text-secondary": { "value": "#6B7280", "type": "color" },
      "border": { "value": "#E5E7EB", "type": "color" },
      "error": { "value": "#EF4444", "type": "color" },
      "success": { "value": "#10B981", "type": "color" }
    },
    "typography": {
      "fontFamily": {
        "sans": { "value": "Inter, system-ui, sans-serif", "type": "fontFamilies" },
        "mono": { "value": "JetBrains Mono, monospace", "type": "fontFamilies" }
      },
      "fontSize": {
        "xs":   { "value": "12", "type": "fontSizes" },
        "sm":   { "value": "14", "type": "fontSizes" },
        "base": { "value": "16", "type": "fontSizes" },
        "lg":   { "value": "18", "type": "fontSizes" },
        "xl":   { "value": "20", "type": "fontSizes" },
        "2xl":  { "value": "24", "type": "fontSizes" },
        "3xl":  { "value": "30", "type": "fontSizes" },
        "4xl":  { "value": "36", "type": "fontSizes" }
      },
      "fontWeight": {
        "normal":   { "value": "400", "type": "fontWeights" },
        "medium":   { "value": "500", "type": "fontWeights" },
        "semibold": { "value": "600", "type": "fontWeights" },
        "bold":     { "value": "700", "type": "fontWeights" }
      }
    },
    "spacing": {
      "1":  { "value": "4",  "type": "spacing" },
      "2":  { "value": "8",  "type": "spacing" },
      "3":  { "value": "12", "type": "spacing" },
      "4":  { "value": "16", "type": "spacing" },
      "6":  { "value": "24", "type": "spacing" },
      "8":  { "value": "32", "type": "spacing" },
      "12": { "value": "48", "type": "spacing" },
      "16": { "value": "64", "type": "spacing" }
    },
    "borderRadius": {
      "none": { "value": "0",    "type": "borderRadius" },
      "sm":   { "value": "4",    "type": "borderRadius" },
      "md":   { "value": "8",    "type": "borderRadius" },
      "lg":   { "value": "12",   "type": "borderRadius" },
      "xl":   { "value": "16",   "type": "borderRadius" },
      "full": { "value": "9999", "type": "borderRadius" }
    }
  }
}
```

## Import instructions

1. Install **Tokens Studio for Figma** plugin
2. Open plugin → choose "Load from file" or paste JSON directly
3. Click "Apply to Figma" to create styles
4. Tokens appear as Figma Styles (colors, text, effects)

## GitHub sync (optional)

Tokens Studio can watch a GitHub repo and sync automatically when `tokens.json` changes.
This is the closest you get to "automatic" sync between code and Figma.
