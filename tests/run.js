import { readFileSync } from "fs";
import { createFigmaMock } from "./figma-mock.js";

// ─── Run the plugin script with mock ──────────────────────

async function runPlugin() {
  const { figma, page } = createFigmaMock();

  const src = readFileSync(
    new URL("../Test Design/DailyDone-figma-plugin.js", import.meta.url),
    "utf8"
  );

  // Wrap in async function so top-level await works
  const wrapped = `(async () => {\n${src}\n})()`;
  const fn = new Function("figma", "console", `return ${wrapped}`);
  await fn(figma, console);

  return page;
}

// ─── Helpers ───────────────────────────────────────────────

function walk(node, fn) {
  fn(node);
  for (const child of node.children || []) walk(child, fn);
}

function findAll(root, predicate) {
  const results = [];
  walk(root, (n) => { if (predicate(n)) results.push(n); });
  return results;
}

// ─── Assertions ────────────────────────────────────────────

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

// ─── Tests ─────────────────────────────────────────────────

async function runTests() {
  console.log("\n📐 Running DailyDone Figma plugin tests...\n");

  const page = await runPlugin();
  const screens = page.children;

  // ── 1. Screen count ──────────────────────────────────────
  console.log("1. Screen count");
  assert(screens.length === 7, "7 screens created", `got ${screens.length}`);

  const screenNames = screens.map((s) => s.name);
  for (const name of ["Home — Habit List", "Habit Detail", "Create Habit Sheet", "Stats Screen", "Profile Screen", "Splash Screen", "Empty + Error States"]) {
    assert(screenNames.includes(name), `Screen exists: "${name}"`);
  }

  // ── 2. Screen dimensions ─────────────────────────────────
  console.log("\n2. Screen dimensions (390×844)");
  for (const screen of screens) {
    assert(screen.width === 390 && screen.height === 844,
      `${screen.name}: 390×844`, `got ${screen.width}×${screen.height}`);
  }

  // ── 3. No frame with justifyContent/alignItems missing layout ──
  console.log("\n3. Layout inference — no row frames missing layoutMode");
  const badLayout = findAll({ children: screens }, (n) => {
    if (n._type !== "FRAME") return false;
    const hasAlignProps = n.primaryAxisAlignItems !== "MIN" || n.counterAxisAlignItems !== "MIN";
    const missingLayout = n.layoutMode === "NONE";
    return hasAlignProps && missingLayout;
  });
  assert(badLayout.length === 0,
    "All frames with alignment props have layoutMode set",
    badLayout.length > 0 ? `${badLayout.length} offenders: ${badLayout.slice(0,3).map(n=>n.name).join(", ")}` : "");

  // ── 4. No FILL sizing on non-layout parents ───────────────
  console.log("\n4. FILL sizing only on layout children");
  const badFill = findAll({ children: screens }, (n) => {
    const isFill = n.layoutSizingHorizontal === "FILL" || n.layoutSizingVertical === "FILL";
    const parentNoLayout = !n.parent || n.parent.layoutMode === "NONE";
    return isFill && parentNoLayout;
  });
  assert(badFill.length === 0,
    "No FILL sizing on children of non-layout parents",
    badFill.length > 0 ? `${badFill.length} offenders: ${badFill.slice(0,3).map(n=>n.name).join(", ")}` : "");

  // ── 5. Absolute positioned elements present ───────────────
  console.log("\n5. Absolute positioned elements (tab bars, FAB)");
  const home = screens.find((s) => s.name === "Home — Habit List");
  const tabBar = home?.children.find((c) => c.name === "Tab Bar Container");
  const fab    = home?.children.find((c) => c.name === "FAB");
  assert(!!tabBar, "Home: Tab Bar Container exists");
  assert(tabBar?.layoutPositioning === "ABSOLUTE", "Home: Tab Bar has layoutPositioning=ABSOLUTE");
  assert(tabBar?.y === 762, `Home: Tab Bar y=762`, `got y=${tabBar?.y}`);
  assert(!!fab, "Home: FAB exists");
  assert(fab?.layoutPositioning === "ABSOLUTE", "Home: FAB has layoutPositioning=ABSOLUTE");

  // ── 6. Tab pills exist and have correct height ───────────
  console.log("\n6. Tab pills present");
  const tabPills = findAll({ children: screens }, (n) => n.name && (n.name.toLowerCase().includes("tabpill") || n.name === "Tab Pill"));
  assert(tabPills.length === 3, `3 tab pills found`, `got ${tabPills.length}`);
  for (const pill of tabPills) {
    assert(pill.height === 62, `${pill.name}: height=62`, `got ${pill.height}`);
  }

  // ── 7. Key fills are not empty ────────────────────────────
  console.log("\n7. Key fills applied");
  const homeFrame = screens.find((s) => s.name === "Home — Habit List");
  assert(homeFrame?.fills.length > 0, "Home screen has background fill");
  assert(homeFrame?.fills[0]?.color?.b > 0.07, "Home screen fill is dark blue-ish");

  const splash = screens.find((s) => s.name === "Splash Screen");
  assert(splash?.fills.length > 0, "Splash screen has background fill");

  // ── 8. Create Habit Sheet body has children ───────────────
  console.log("\n8. Create Habit Sheet content");
  const sheet = screens.find((s) => s.name === "Create Habit Sheet");
  const sheetBody = findAll({ children: sheet?.children || [] }, (n) => n.name === "sheetBody")[0];
  assert(!!sheetBody, "sheetBody exists");
  assert((sheetBody?.children?.length || 0) >= 3, "sheetBody has ≥3 sections",
    `got ${sheetBody?.children?.length}`);

  // ── 9. Top-level habit rows in home are horizontal ────────
  console.log("\n9. Habit rows are horizontal");
  const habitList = findAll({ children: home?.children || [] }, (n) => n.name === "habitsList")[0];
  const habitRows = (habitList?.children || []).filter((n) => n._type === "FRAME");
  assert(habitRows.length >= 5, `≥5 habit rows in Home`, `got ${habitRows.length}`);
  for (const row of habitRows) {
    assert(row.layoutMode === "HORIZONTAL", `${row.name}: layoutMode=HORIZONTAL`, `got ${row.layoutMode}`);
  }

  // ── 10. Icon nodes are ellipses ───────────────────────────
  console.log("\n10. Icons rendered as ellipses");
  const icons = findAll({ children: screens }, (n) =>
    n._type === "ELLIPSE" && n.width <= 48 && n.fills.length > 0
  );
  assert(icons.length > 20, `>20 icon ellipses across all screens`, `got ${icons.length}`);

  // ── 11. Progress ring arc is correct ──────────────────────
  console.log("\n11. Progress ring arc");
  const ringFill = findAll({ children: screens }, (n) => n.name === "ringFill")[0];
  assert(!!ringFill, "ringFill ellipse exists");
  assert(!!ringFill?.arcData, "ringFill has arcData");
  if (ringFill?.arcData) {
    const { startingAngle, endingAngle } = ringFill.arcData;
    // sweepAngle -220° = -220*π/180 ≈ -3.84, so endingAngle < startingAngle (CW arc)
    assert(endingAngle < startingAngle,
      `Arc is clockwise (end < start)`,
      `start=${startingAngle.toFixed(2)}, end=${endingAngle.toFixed(2)}`);
    const arcDeg = Math.abs(endingAngle - startingAngle) * (180 / Math.PI);
    assert(Math.abs(arcDeg - 220) < 1,
      `Arc span is 220°`, `got ${arcDeg.toFixed(1)}°`);
  }

  // ── 12. Linear gradients have correct transform ───────────
  console.log("\n12. Gradient direction (rotation 135° → diagonal)");
  const splashBg = findAll({ children: screens }, (n) => n.name === "logoRing")[0];
  assert(!!splashBg, "logoRing exists on Splash");
  const grad = splashBg?.fills?.[0];
  assert(grad?.type === "GRADIENT_LINEAR", "logoRing has linear gradient fill");
  if (grad?.gradientTransform) {
    // For 135° pen rotation: Figma angle = -(135-90) = -45°, cos(-45)≈0.707, sin(-45)≈-0.707
    const [[a, b]] = grad.gradientTransform;
    assert(a > 0.5 && b < -0.5,
      `Gradient goes top-left to bottom-right (135°)`,
      `transform[0]=[${a.toFixed(2)},${b.toFixed(2)}]`);
  }

  // ── 13. Pill/badge frames have layout ────────────────────
  console.log("\n13. Pill frames (cornerRadius:999) have layout set");
  const pillFrames = findAll({ children: screens }, (n) =>
    n._type === "FRAME" &&
    n.cornerRadius === 999 &&
    (n.paddingTop > 0 || n.paddingLeft > 0) &&
    n.children.length > 0
  );
  const pillsWithoutLayout = pillFrames.filter(n => n.layoutMode === "NONE");
  assert(pillsWithoutLayout.length === 0,
    "All pill frames have layout set",
    pillsWithoutLayout.length > 0
      ? `${pillsWithoutLayout.length} missing layout: ${pillsWithoutLayout.slice(0,5).map(n=>n.name).join(", ")}`
      : "");

  // ── Summary ───────────────────────────────────────────────
  console.log(`\n${"─".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.log("❌ Tests failed");
    process.exit(1);
  } else {
    console.log("✅ All tests passed");
  }
}

runTests().catch((err) => {
  console.error("💥 Test runner crashed:", err);
  process.exit(1);
});
