/**
 * Tests for the pen-to-figma converter engine.
 * Validates normalization logic and script generation without touching Figma or pen files.
 */

import { normalizePenNode, collectComponents, generateFigmaScript } from "../converter/pen-to-figma.js";

let passed = 0;
let failed = 0;

function assert(condition, label, detail = "") {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? " — " + detail : ""}`);
    failed++;
  }
}

console.log("\n🔧 Converter unit tests\n");

// ── 1. Basic node passthrough ─────────────────────────────

console.log("1. Basic node normalization");

const frameNode = {
  type: "frame", id: "abc", name: "Screen",
  width: 390, height: 844, fill: "#0F0F14",
  layout: "vertical", gap: 16, padding: 24,
  children: []
};
const out1 = normalizePenNode(frameNode);
assert(out1.type === "frame",    "type preserved");
assert(out1.name === "Screen",   "name preserved");
assert(out1.width === 390,       "width preserved");
assert(out1.fill === "#0F0F14",  "fill preserved");
assert(out1.layout === "vertical", "layout preserved");
assert(out1.gap === 16,          "gap preserved");

// ── 2. Text node content field mapping ───────────────────

console.log("\n2. Text node content mapping");

const textWithText = normalizePenNode({ type: "text", text: "Hello", fontSize: 16 });
assert(textWithText.content === "Hello", "pen `text` field maps to `content`");

const textWithLabel = normalizePenNode({ type: "text", label: "World", fontSize: 12 });
assert(textWithLabel.content === "World", "pen `label` field maps to `content`");

const textWithContent = normalizePenNode({ type: "text", content: "Direct", fontSize: 14 });
assert(textWithContent.content === "Direct", "pen `content` field preserved as-is");

// ── 3. Variable resolution ────────────────────────────────

console.log("\n3. Variable resolution");

const vars = { "color-primary": "#2563EB", "spacing-lg": 24 };

const nodeWithVars = normalizePenNode(
  { type: "frame", fill: "$color-primary", gap: 16 },
  vars
);
assert(nodeWithVars.fill === "#2563EB", "$variable in fill resolved to value");
assert(nodeWithVars.gap === 16,         "non-variable values unchanged");

const textWithVarFill = normalizePenNode(
  { type: "text", fill: "$color-primary", content: "hi" },
  vars
);
assert(textWithVarFill.fill === "#2563EB", "text fill variable resolved");

// ── 4. Ref node inlining ──────────────────────────────────

console.log("\n4. Ref node inlining");

const components = new Map([
  ["comp1", { type: "frame", id: "comp1", name: "Button", width: 120, height: 40, fill: "#2563EB", reusable: true }]
]);

const refNode = { type: "ref", refId: "comp1", name: "Primary Button", x: 10, y: 20 };
const inlined = normalizePenNode(refNode, {}, components);
assert(inlined.type === "frame",          "ref inlined as frame");
assert(inlined.name === "Primary Button", "ref name overrides component name");
assert(inlined.fill === "#2563EB",        "ref inherits component fill");
assert(inlined.x === 10,                  "ref x position applied");

const unknownRef = normalizePenNode({ type: "ref", refId: "unknown", name: "Ghost" }, {}, new Map());
assert(unknownRef.type === "frame",       "unknown ref falls back to empty frame");
assert(unknownRef.fill === "#CCCCCC20",   "unknown ref gets placeholder fill");

// ── 5. collectComponents ──────────────────────────────────

console.log("\n5. collectComponents");

const tree = [
  { type: "frame", id: "screen1", name: "Home", reusable: false,
    children: [
      { type: "frame", id: "btn1", name: "Button", reusable: true, children: [] },
      { type: "text",  id: "txt1", content: "Hello" }
    ]
  },
  { type: "frame", id: "comp2", name: "Card", reusable: true, children: [] }
];

const collected = collectComponents(tree);
assert(!collected.has("screen1"), "non-reusable frame not collected");
assert(collected.has("btn1"),     "nested reusable frame collected");
assert(collected.has("comp2"),    "top-level reusable frame collected");
assert(!collected.has("txt1"),    "text node not collected as component");

// ── 6. Children recursion ────────────────────────────────

console.log("\n6. Children recursion");

const nested = normalizePenNode({
  type: "frame", name: "Parent",
  children: [
    { type: "text", text: "Label", fontSize: 14 },
    { type: "frame", name: "Child", children: [
      { type: "text", label: "Nested", fontSize: 12 }
    ]}
  ]
});
assert(nested.children.length === 2,                       "2 children preserved");
assert(nested.children[0].content === "Label",             "text child normalized");
assert(nested.children[1].children[0].content === "Nested","nested text normalized");

// ── 7. Pill frame layout inference ───────────────────────

console.log("\n7. Pill frame passthrough (layout preserved)");

const pill = normalizePenNode({
  type: "frame", name: "Badge", cornerRadius: 999,
  padding: [4, 8], layout: "horizontal",
  justifyContent: "center", alignItems: "center",
  children: [{ type: "text", content: "Active" }]
});
assert(pill.layout === "horizontal",        "pill frame layout preserved");
assert(pill.cornerRadius === 999,           "pill cornerRadius preserved");

// ── 8. generateFigmaScript output structure ───────────────

console.log("\n8. generateFigmaScript output");

const screens = [
  { type: "frame", name: "Home", width: 390, height: 844, fill: "#0F0F14", children: [] }
];
const script = generateFigmaScript(screens, "Test App");

assert(typeof script === "string",                       "output is a string");
assert(script.includes("figma.currentPage.name"),        "sets page name");
assert(script.includes("Test App"),                      "page name embedded");
assert(script.includes("async function buildNode"),      "engine buildNode present");
assert(script.includes("async function loadFonts"),      "engine loadFonts present");
assert(script.includes("function getScreens"),           "getScreens present");
assert(script.includes('"Home"'),                        "screen name in output");
assert(script.includes('"#0F0F14"'),                     "fill color in output");
assert(script.includes("await loadFonts()"),             "runner calls loadFonts");
assert(script.includes("screens.length"),                "runner loops screens");

// ── 9. Script is syntactically valid JS ───────────────────

console.log("\n9. Generated script is valid JS");

// Wrap in async function to allow await
const wrapped = `(async () => { ${script} })()`;
let syntaxOk = true;
try {
  new Function(wrapped); // syntax check only
} catch (e) {
  syntaxOk = false;
  console.log("     syntax error:", e.message.slice(0, 80));
}
assert(syntaxOk, "generated script has no syntax errors");

// ── Summary ───────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log("❌ Tests failed");
  process.exit(1);
} else {
  console.log("✅ All converter tests passed");
}
