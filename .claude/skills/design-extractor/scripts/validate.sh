#!/bin/bash
# validate.sh — checks figma-import.js for known bad patterns
# Usage: bash validate.sh figma-import.js
# Exit 0 = all checks passed. Exit 1 = at least one violation found.

FILE="${1:-figma-import.js}"
ERRORS=0

fail() {
  echo "❌ FAIL: $1"
  ERRORS=$((ERRORS + 1))
}

pass() {
  echo "✅ PASS: $1"
}

if [ ! -f "$FILE" ]; then
  echo "Error: file not found: $FILE"
  exit 2
fi

echo "Validating: $FILE"
echo "---"

# Rule 6 — lineHeight MULTIPLIER
if grep -q 'unit.*MULTIPLIER\|MULTIPLIER.*unit' "$FILE"; then
  fail "Rule 6: lineHeight uses MULTIPLIER unit (must be PIXELS, PERCENT, or AUTO)"
else
  pass "Rule 6: lineHeight unit is valid"
fi

# Rule 7 — async IIFE
if grep -qE '\(async\s*\(\s*\)\s*=>' "$FILE"; then
  fail "Rule 7: async IIFE detected — use top-level await instead"
else
  pass "Rule 7: no async IIFE"
fi

# Rule 8 — synchronous page setter
if grep -qE 'figma\.currentPage\s*=' "$FILE"; then
  fail "Rule 8: figma.currentPage = used (must use setCurrentPageAsync)"
else
  pass "Rule 8: page switching uses setCurrentPageAsync"
fi

# Rule 9a — figma.notify
if grep -q 'figma\.notify(' "$FILE"; then
  fail "Rule 9: figma.notify() found (use console.log instead)"
else
  pass "Rule 9a: no figma.notify"
fi

# Rule 9b — figma.closePlugin
if grep -q 'figma\.closePlugin(' "$FILE"; then
  fail "Rule 9: figma.closePlugin() found (must not close plugin from console)"
else
  pass "Rule 9b: no figma.closePlugin"
fi

# Rule 5 — system fonts used as font family values (not in comments)
# Greps for patterns that indicate actual font family usage, not comment references
FONT_ERRORS=0
for font in "SF Pro" "-apple-system" "BlinkMacSystemFont"; do
  if grep -qF -- "$font" "$FILE"; then
    fail "Rule 5: system font '$font' found — map to Inter or Roboto"
    FONT_ERRORS=$((FONT_ERRORS + 1))
  fi
done
# system-ui: only flag when used as a font family value (inside quotes in font objects)
if grep -qE 'family.*"system-ui"|family.*'"'"'system-ui'"'"'' "$FILE"; then
  fail "Rule 5: 'system-ui' used as font family — map to Inter"
  FONT_ERRORS=$((FONT_ERRORS + 1))
fi
if [ $FONT_ERRORS -eq 0 ]; then
  pass "Rule 5: no unmapped system fonts"
fi

# Rule 1 — page count (should be exactly 2 createPage calls)
PAGE_COUNT=$(grep -c 'figma\.createPage()' "$FILE" 2>/dev/null || echo 0)
if [ "$PAGE_COUNT" -gt 2 ]; then
  fail "Rule 1: $PAGE_COUNT figma.createPage() calls found (max 2 allowed)"
elif [ "$PAGE_COUNT" -eq 0 ]; then
  fail "Rule 1: no figma.createPage() calls found — script may be incomplete"
else
  pass "Rule 1: page count is $PAGE_COUNT (≤ 2)"
fi

# Structure — runPhase helper
if ! grep -q 'runPhase' "$FILE"; then
  fail "Structure: runPhase helper not found — script lacks resilient error handling"
else
  pass "Structure: runPhase helper present"
fi

# Structure — progress logging
if ! grep -qE 'console\.log.*\[1/4\]' "$FILE"; then
  fail "Structure: phase progress logging missing ([1/4] pattern not found)"
else
  pass "Structure: phase progress logging present"
fi

echo "---"
if [ $ERRORS -eq 0 ]; then
  echo "All checks passed."
  exit 0
else
  echo "$ERRORS check(s) failed."
  exit 1
fi
