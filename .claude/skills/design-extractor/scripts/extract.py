#!/usr/bin/env python3
"""
design-extractor/scripts/extract.py

Grundläggande design token-extractor.
Anpassas av Claude Code för specifikt repo.

Usage:
  python extract.py --repo /path/to/repo --output ./tokens.json
  python extract.py --repo /path/to/repo --format figma-plugin
"""

import argparse
import json
import re
import os
from pathlib import Path

# ---- Konfiguration (anpassa per repo) ----

TAILWIND_CONFIG_NAMES = ["tailwind.config.js", "tailwind.config.ts", "tailwind.config.cjs"]
TOKEN_FILE_NAMES = ["tokens.js", "tokens.ts", "tokens.json", "theme.js", "theme.ts", 
                    "design-tokens.json", "design-tokens.ts"]
GLOBAL_CSS_NAMES = ["globals.css", "global.css", "variables.css", "base.css"]
COMPONENT_EXTENSIONS = [".tsx", ".jsx", ".vue", ".swift"]
COMPONENT_DIRS = ["components", "src/components", "app/components", "ui", "src/ui"]

# ---- Extraktorer ----

def find_file(repo_root: Path, candidates: list) -> Path | None:
    """Hitta en fil bland möjliga namn."""
    for name in candidates:
        p = repo_root / name
        if p.exists():
            return p
    return None

def extract_css_variables(css_content: str) -> dict:
    """Extrahera CSS custom properties från :root {}."""
    tokens = {}
    # Hitta :root block
    root_match = re.search(r':root\s*\{([^}]+)\}', css_content, re.DOTALL)
    if root_match:
        block = root_match.group(1)
        for match in re.finditer(r'--([^:]+):\s*([^;]+);', block):
            name = match.group(1).strip()
            value = match.group(2).strip()
            tokens[name] = value
    return tokens

def extract_tailwind_colors(config_content: str) -> dict:
    """Enkel extraktion av färger från Tailwind config."""
    colors = {}
    # Leta efter colors objekt (förenklad parser)
    color_section = re.search(r'colors\s*:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}', config_content, re.DOTALL)
    if color_section:
        for match in re.finditer(r"['\"]?(\w+)['\"]?\s*:\s*['\"]?(#[0-9a-fA-F]{3,6})['\"]?", color_section.group(1)):
            colors[match.group(1)] = match.group(2)
    return colors

def scan_components(repo_root: Path) -> list:
    """Skanna efter komponentfiler."""
    components = []
    for comp_dir in COMPONENT_DIRS:
        dir_path = repo_root / comp_dir
        if dir_path.exists():
            for ext in COMPONENT_EXTENSIONS:
                for f in dir_path.rglob(f"*{ext}"):
                    # Hoppa över test-filer och stories
                    if any(skip in f.name for skip in [".test.", ".spec.", ".stories."]):
                        continue
                    components.append(str(f.relative_to(repo_root)))
    return components

def organize_tokens(raw: dict) -> dict:
    """Organisera råa tokens i semantiska kategorier."""
    organized = {
        "colors": {},
        "typography": {},
        "spacing": {},
        "borderRadius": {},
        "shadows": {},
        "other": {}
    }
    
    for key, value in raw.items():
        key_lower = key.lower()
        if any(c in key_lower for c in ["color", "bg", "background", "text", "border", "primary", "secondary", "accent"]):
            organized["colors"][key] = value
        elif any(c in key_lower for c in ["font", "text-size", "typography", "weight", "line-height", "tracking"]):
            organized["typography"][key] = value
        elif any(c in key_lower for c in ["spacing", "padding", "margin", "gap", "space"]):
            organized["spacing"][key] = value
        elif any(c in key_lower for c in ["radius", "rounded", "corner"]):
            organized["borderRadius"][key] = value
        elif any(c in key_lower for c in ["shadow", "elevation"]):
            organized["shadows"][key] = value
        else:
            organized["other"][key] = value
    
    return organized

def to_tokens_studio_format(tokens: dict) -> dict:
    """Konvertera till Tokens Studio JSON format."""
    result = {"global": {}}
    
    for category, values in tokens.items():
        if not values:
            continue
        result["global"][category] = {}
        for name, value in values.items():
            token_type_map = {
                "colors": "color",
                "spacing": "spacing",
                "borderRadius": "borderRadius",
                "shadows": "boxShadow",
                "typography": "other"
            }
            result["global"][category][name] = {
                "value": str(value),
                "type": token_type_map.get(category, "other")
            }
    
    return result

# ---- Main ----

def main():
    parser = argparse.ArgumentParser(description="Extrahera design tokens från repo")
    parser.add_argument("--repo", required=True, help="Sökväg till repo-root")
    parser.add_argument("--output", default="./design-tokens.json", help="Output-fil")
    parser.add_argument("--format", choices=["tokens-studio", "css-vars", "raw"], 
                        default="tokens-studio", help="Output-format")
    parser.add_argument("--summary", action="store_true", help="Skriv ut sammanfattning")
    args = parser.parse_args()
    
    repo_root = Path(args.repo)
    all_tokens = {}
    sources_used = []
    
    # 1. Försök med CSS custom properties
    css_file = find_file(repo_root, [f"src/styles/{n}" for n in GLOBAL_CSS_NAMES] + 
                                    [f"app/{n}" for n in GLOBAL_CSS_NAMES] + 
                                    GLOBAL_CSS_NAMES)
    if css_file:
        css_vars = extract_css_variables(css_file.read_text())
        all_tokens.update(css_vars)
        sources_used.append(f"CSS vars: {css_file.name} ({len(css_vars)} tokens)")
    
    # 2. Försök med Tailwind config
    tailwind_file = find_file(repo_root, TAILWIND_CONFIG_NAMES)
    if tailwind_file:
        tw_colors = extract_tailwind_colors(tailwind_file.read_text())
        all_tokens.update(tw_colors)
        sources_used.append(f"Tailwind: {tailwind_file.name} ({len(tw_colors)} färger)")
    
    # 3. Skanna komponenter
    components = scan_components(repo_root)
    
    # Organisera och konvertera
    organized = organize_tokens(all_tokens)
    
    if args.format == "tokens-studio":
        output = to_tokens_studio_format(organized)
    elif args.format == "css-vars":
        lines = [":root {"]
        for category, values in organized.items():
            for name, value in values.items():
                lines.append(f"  --{name}: {value};")
        lines.append("}")
        output = "\n".join(lines)
    else:
        output = organized
    
    # Spara
    out_path = Path(args.output)
    if args.format == "css-vars":
        out_path.write_text(output)
    else:
        out_path.write_text(json.dumps(output, indent=2, ensure_ascii=False))
    
    if args.summary:
        print("\n=== Design Extractor Sammanfattning ===")
        print(f"Repo: {repo_root}")
        print(f"Källor använda:")
        for s in sources_used:
            print(f"  ✅ {s}")
        if not sources_used:
            print("  ⚠️  Inga automatiska källor hittades – manuell extraktion krävs")
        print(f"\nTokens hittade:")
        for cat, vals in organized.items():
            if vals:
                print(f"  {cat}: {len(vals)} st")
        print(f"\nKomponentfiler hittade: {len(components)}")
        for c in components[:10]:
            print(f"  - {c}")
        if len(components) > 10:
            print(f"  ... och {len(components) - 10} till")
        print(f"\nOutput sparad: {out_path}")
        print("=======================================\n")

if __name__ == "__main__":
    main()
