/**
 * pen-to-figma converter engine
 *
 * Usage (Node.js module):
 *   import { generateFigmaScript } from "./converter/pen-to-figma.js";
 *   const script = generateFigmaScript(penNodes, "My App");
 *   fs.writeFileSync("figma-plugin.js", script);
 *
 * Usage (CLI):
 *   node converter/pen-to-figma.js pen-nodes.json [pageName]
 *   → writes figma-plugin.js
 */

// ─── Engine template (runs inside Figma console) ──────────

const ENGINE = `
async function loadFonts() {
  const pairs = [
    ["Inter","Regular"],["Inter","Medium"],
    ["Inter","Semi Bold"],["Inter","Bold"],["Inter","Extra Bold"],
  ];
  for (const [family, style] of pairs) {
    try { await figma.loadFontAsync({ family, style }); } catch (_) {}
  }
}

function weightToStyle(w) {
  const n = typeof w === "number" ? w : parseInt(w, 10);
  if (!isNaN(n)) {
    if (n >= 800) return "Extra Bold";
    if (n >= 700) return "Bold";
    if (n >= 600) return "Semi Bold";
    if (n >= 500) return "Medium";
    return "Regular";
  }
  if (w === "700" || w === "bold" || w === "Bold") return "Bold";
  if (w === "600") return "Semi Bold";
  if (w === "500") return "Medium";
  return "Regular";
}

function hex(h) {
  h = h.replace("#", "");
  let r, g, b, a = 1;
  if (h.length === 8) {
    r = parseInt(h.slice(0,2),16)/255; g = parseInt(h.slice(2,4),16)/255;
    b = parseInt(h.slice(4,6),16)/255; a = parseInt(h.slice(6,8),16)/255;
  } else if (h.length === 6) {
    r = parseInt(h.slice(0,2),16)/255; g = parseInt(h.slice(2,4),16)/255;
    b = parseInt(h.slice(4,6),16)/255;
  } else if (h.length === 3) {
    r = parseInt(h[0]+h[0],16)/255; g = parseInt(h[1]+h[1],16)/255;
    b = parseInt(h[2]+h[2],16)/255;
  }
  return { r, g, b, a };
}

function solidPaint(hexStr) {
  const { r, g, b, a } = hex(hexStr);
  return { type: "SOLID", color: { r, g, b }, opacity: a };
}

function linearGradPaint(colors, rotationDeg) {
  const angle = -((rotationDeg || 0) - 90) * (Math.PI / 180);
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const stops = colors.map(c => {
    const { r, g, b, a } = hex(c.color);
    return { position: c.position, color: { r, g, b, a } };
  });
  return {
    type: "GRADIENT_LINEAR",
    gradientTransform: [
      [cos, sin, 0.5 - cos * 0.5 - sin * 0.5],
      [-sin, cos, 0.5 + sin * 0.5 - cos * 0.5]
    ],
    gradientStops: stops
  };
}

function radialGradPaint(colors, center, size) {
  const cx = center?.x ?? 0.5, cy = center?.y ?? 0.5;
  const sw = (size?.width ?? 0.8) / 2, sh = (size?.height ?? 0.8) / 2;
  const stops = colors.map(c => {
    const { r, g, b, a } = hex(c.color);
    return { position: c.position, color: { r, g, b, a } };
  });
  return {
    type: "GRADIENT_RADIAL",
    gradientTransform: [[sw, 0, cx - sw], [0, sh, cy - sh]],
    gradientStops: stops
  };
}

function parseFills(fill) {
  if (!fill) return [];
  const arr = Array.isArray(fill) ? fill : [fill];
  return arr.map(f => {
    if (typeof f === "string") return solidPaint(f);
    if (f.type === "color") return solidPaint(f.color);
    if (f.type === "gradient") {
      if (f.gradientType === "radial") return radialGradPaint(f.colors, f.center, f.size);
      return linearGradPaint(f.colors, f.rotation);
    }
    return solidPaint("#00000000");
  }).filter(Boolean);
}

function parseStrokes(stroke) {
  if (!stroke) return { strokes: [], strokeWeight: 0, strokeAlign: "INSIDE" };
  const fillVal = typeof stroke.fill === "string" ? stroke.fill : "#FFFFFF";
  const { r, g, b, a } = hex(fillVal);
  const thickness = typeof stroke.thickness === "number" ? stroke.thickness : 1;
  const alignMap = { inside: "INSIDE", outside: "OUTSIDE", center: "CENTER" };
  return {
    strokes: [{ type: "SOLID", color: { r, g, b }, opacity: a }],
    strokeWeight: thickness,
    strokeAlign: alignMap[stroke.align] || "INSIDE"
  };
}

function parseEffects(effect) {
  if (!effect) return [];
  const arr = Array.isArray(effect) ? effect : [effect];
  return arr.map(e => {
    if (e.type === "shadow") {
      const { r, g, b, a } = hex(e.color || "#00000040");
      return {
        type: e.shadowType === "inner" ? "INNER_SHADOW" : "DROP_SHADOW",
        color: { r, g, b, a },
        offset: { x: e.offset?.x ?? 0, y: e.offset?.y ?? 4 },
        radius: e.blur ?? 0,
        spread: e.spread ?? 0,
        visible: true,
        blendMode: "NORMAL"
      };
    }
    if (e.type === "blur") return { type: "LAYER_BLUR", radius: e.radius ?? 0, visible: true };
    if (e.type === "background_blur") return { type: "BACKGROUND_BLUR", radius: e.radius ?? 0, visible: true };
    return null;
  }).filter(Boolean);
}

function applyPadding(node, padding) {
  if (padding == null) return;
  if (typeof padding === "number") {
    node.paddingTop = node.paddingRight = node.paddingBottom = node.paddingLeft = padding;
  } else if (padding.length === 2) {
    node.paddingTop = node.paddingBottom = padding[0];
    node.paddingLeft = node.paddingRight = padding[1];
  } else if (padding.length === 4) {
    [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft] = padding;
  }
}

const JUSTIFY = { start:"MIN", center:"CENTER", end:"MAX", space_between:"SPACE_BETWEEN", space_around:"SPACE_BETWEEN" };
const ALIGN   = { start:"MIN", center:"CENTER", end:"MAX" };

function applyAutoLayout(node, d) {
  const layout = d.layout || (d.gap || d.justifyContent || d.alignItems ? "horizontal" : null);
  if (!layout || layout === "none") return;
  node.layoutMode = layout.toUpperCase();
  // Figma resets sizing to HUG when layoutMode is set — re-assert FIXED so applyDynamicSizing can override
  node.layoutSizingHorizontal = "FIXED";
  node.layoutSizingVertical   = "FIXED";
  node.itemSpacing = d.gap || 0;
  applyPadding(node, d.padding);
  node.primaryAxisAlignItems   = JUSTIFY[d.justifyContent] || "MIN";
  node.counterAxisAlignItems   = ALIGN[d.alignItems] || "MIN";
}

function applyCornerRadius(node, cr) {
  if (cr == null) return;
  if (typeof cr === "number") {
    node.cornerRadius = cr;
  } else if (Array.isArray(cr)) {
    node.topLeftRadius     = cr[0] ?? 0;
    node.topRightRadius    = cr[1] ?? 0;
    node.bottomRightRadius = cr[2] ?? 0;
    node.bottomLeftRadius  = cr[3] ?? 0;
  }
}

function applySize(node, w, h) {
  const fw = typeof w === "number" ? w : node.width  || 100;
  const fh = typeof h === "number" ? h : node.height || 100;
  node.resize(Math.max(fw, 1), Math.max(fh, 1));
}

function applyDynamicSizing(node, d) {
  const parentHasLayout = node.parent && node.parent.layoutMode && node.parent.layoutMode !== "NONE";
  const nodeHasLayout   = node.layoutMode && node.layoutMode !== "NONE";
  if (typeof d.width === "string") {
    if (d.width === "fill_container" && parentHasLayout) node.layoutSizingHorizontal = "FILL";
    else if (d.width.startsWith("fit_content") && nodeHasLayout) node.layoutSizingHorizontal = "HUG";
  } else if (d.width == null && nodeHasLayout) {
    node.layoutSizingHorizontal = "HUG";
  }
  if (typeof d.height === "string") {
    if (d.height === "fill_container" && parentHasLayout) node.layoutSizingVertical = "FILL";
    else if (d.height.startsWith("fit_content") && nodeHasLayout) node.layoutSizingVertical = "HUG";
  } else if (d.height == null && nodeHasLayout) {
    node.layoutSizingVertical = "HUG";
  }
}

function applyPosition(node, d, parentNode) {
  const absParent = parentNode && parentNode.layoutMode === "NONE";
  const absChild  = d.layoutPosition === "absolute";
  if (absParent || absChild) {
    if (absChild && parentNode && parentNode.layoutMode !== "NONE") {
      node.layoutPositioning = "ABSOLUTE";
    }
    node.x = d.x ?? 0;
    node.y = d.y ?? 0;
  }
}

async function buildNode(d, parentNode, xOffsetOverride) {
  if (!d || d === "...") return null;
  const t = d.type;

  if (t === "frame" || t === "group") {
    const frame = figma.createFrame();
    frame.name = d.name || d.id || "Frame";
    frame.fills = parseFills(d.fill);
    applySize(frame, d.width, d.height);
    applyAutoLayout(frame, d);
    applyCornerRadius(frame, d.cornerRadius);
    if (d.opacity != null) frame.opacity = d.opacity;
    frame.clipsContent = d.clip === true;
    if (d.stroke) {
      const s = parseStrokes(d.stroke);
      frame.strokes = s.strokes;
      if (s.strokeWeight) frame.strokeWeight = s.strokeWeight;
      frame.strokeAlign = s.strokeAlign;
    }
    if (d.effect) frame.effects = parseEffects(d.effect);
    if (parentNode) {
      parentNode.appendChild(frame);
      applyPosition(frame, d, parentNode);
    } else {
      figma.currentPage.appendChild(frame);
      frame.x = xOffsetOverride ?? 0;
      frame.y = 0;
    }
    if (Array.isArray(d.children)) {
      for (const child of d.children) {
        if (child && child !== "...") await buildNode(child, frame);
      }
    }
    applyDynamicSizing(frame, d);
    return frame;

  } else if (t === "rectangle") {
    const rect = figma.createRectangle();
    rect.name = d.name || d.id || "Rectangle";
    rect.fills = parseFills(d.fill);
    applySize(rect, d.width, d.height);
    applyCornerRadius(rect, d.cornerRadius);
    if (d.opacity != null) rect.opacity = d.opacity;
    if (d.stroke) {
      const s = parseStrokes(d.stroke);
      rect.strokes = s.strokes;
      if (s.strokeWeight) rect.strokeWeight = s.strokeWeight;
      rect.strokeAlign = s.strokeAlign;
    }
    if (d.effect) rect.effects = parseEffects(d.effect);
    if (parentNode) {
      parentNode.appendChild(rect);
      applyPosition(rect, d, parentNode);
      applyDynamicSizing(rect, d);
    }
    return rect;

  } else if (t === "ellipse") {
    const el = figma.createEllipse();
    el.name = d.name || d.id || "Ellipse";
    el.fills = parseFills(d.fill);
    applySize(el, d.width, d.height);
    if (d.opacity != null) el.opacity = d.opacity;
    if (d.stroke) {
      const s = parseStrokes(d.stroke);
      el.strokes = s.strokes;
      if (s.strokeWeight) el.strokeWeight = s.strokeWeight;
      el.strokeAlign = s.strokeAlign;
    }
    if (d.effect) el.effects = parseEffects(d.effect);
    if (d.startAngle != null || d.sweepAngle != null || d.innerRadius) {
      const start = (d.startAngle ?? 0) * (Math.PI / 180);
      const sweep = (d.sweepAngle ?? 360) * (Math.PI / 180);
      el.arcData = { startingAngle: start, endingAngle: start + sweep, innerRadius: d.innerRadius ?? 0 };
    }
    if (parentNode) {
      parentNode.appendChild(el);
      applyPosition(el, d, parentNode);
    }
    return el;

  } else if (t === "text") {
    const txt = figma.createText();
    txt.name = d.name || d.id || "Text";
    const family = d.fontFamily || "Inter";
    const style  = weightToStyle(d.fontWeight ?? "400");
    try { await figma.loadFontAsync({ family, style }); }
    catch (_) { await figma.loadFontAsync({ family: "Inter", style: "Regular" }); }
    txt.fontName  = { family, style };
    txt.fontSize  = d.fontSize ?? 14;
    txt.characters = (typeof d.content === "string" ? d.content : "") || " ";
    txt.fills = parseFills(d.fill);
    if (d.letterSpacing) txt.letterSpacing = { value: d.letterSpacing, unit: "PIXELS" };
    if (d.lineHeight)    txt.lineHeight    = { value: d.lineHeight * 100, unit: "PERCENT" };
    const TALIGN = { left:"LEFT", center:"CENTER", right:"RIGHT", justify:"JUSTIFIED" };
    if (d.textAlign) txt.textAlignHorizontal = TALIGN[d.textAlign] || "LEFT";
    if (d.textGrowth === "fixed-width") {
      txt.textAutoResize = "HEIGHT";
      if (typeof d.width === "number") txt.resize(d.width, txt.height);
    } else if (d.textGrowth === "fixed-width-height") {
      txt.textAutoResize = "NONE";
      if (typeof d.width === "number" && typeof d.height === "number") txt.resize(d.width, d.height);
    } else {
      txt.textAutoResize = "WIDTH_AND_HEIGHT";
    }
    if (d.width === "fill_container" && parentNode && parentNode.layoutMode && parentNode.layoutMode !== "NONE") {
      txt.layoutSizingHorizontal = "FILL";
    }
    if (parentNode) {
      parentNode.appendChild(txt);
      applyPosition(txt, d, parentNode);
    }
    return txt;

  } else if (t === "icon_font") {
    const ic = figma.createEllipse();
    ic.name = d.name || d.iconFontName || "icon";
    const fills = parseFills(d.fill);
    ic.fills = fills.length ? fills : [{ type:"SOLID", color:{r:.95,g:.94,b:1}, opacity:0.4 }];
    const sz = Math.min(d.width ?? 24, d.height ?? 24);
    ic.resize(Math.max(sz, 1), Math.max(sz, 1));
    if (d.effect) ic.effects = parseEffects(d.effect);
    if (parentNode) {
      parentNode.appendChild(ic);
      applyPosition(ic, d, parentNode);
    }
    return ic;

  } else if (t === "path") {
    const p = figma.createRectangle();
    p.name = d.name || d.id || "Path";
    p.fills = parseFills(d.fill);
    applySize(p, d.width ?? 24, d.height ?? 24);
    if (parentNode) {
      parentNode.appendChild(p);
      applyPosition(p, d, parentNode);
    }
    return p;

  } else if (t === "line") {
    const l = figma.createLine();
    l.name = d.name || d.id || "Line";
    if (d.stroke) {
      const s = parseStrokes(d.stroke);
      l.strokes = s.strokes;
      if (s.strokeWeight) l.strokeWeight = s.strokeWeight;
    }
    const w = typeof d.width === "number" ? d.width : 100;
    l.resize(w, 0);
    if (parentNode) {
      parentNode.appendChild(l);
      applyPosition(l, d, parentNode);
    }
    return l;
  }

  return null;
}
`;

// ─── Runner template ───────────────────────────────────────

const RUNNER = (pageName) => `
await loadFonts();
figma.currentPage.name = ${JSON.stringify(pageName)};
const screens = getScreens();
let xOffset = 0;
for (const screen of screens) {
  const frame = await buildNode(screen, null, xOffset);
  if (frame) xOffset += (frame.width || 390) + 40;
}
figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
console.log("✅ " + screens.length + " skärmar importerade!");
`;

// ─── Public API ────────────────────────────────────────────

/**
 * Normalize a pen node tree into the intermediate format the engine expects.
 * Resolves $variable references, inlines ref (component) nodes, maps text/label → content.
 *
 * @param {object} node - Raw pen node
 * @param {object} vars - Flat map of { "$var-name": resolvedValue }
 * @param {Map}    components - Map of id → component node (for ref inlining)
 * @returns {object} Normalized node
 */
export function normalizePenNode(node, vars = {}, components = new Map()) {
  const resolve = (val) => {
    if (typeof val === "string" && val.startsWith("$")) {
      return vars[val.slice(1)] ?? vars[val] ?? val;
    }
    return val;
  };

  const out = { ...node };

  // Inline ref nodes
  if (out.type === "ref") {
    const comp = components.get(out.refId);
    if (comp) {
      Object.assign(out, { ...comp, name: out.name ?? comp.name, x: out.x, y: out.y });
    } else {
      out.type = "frame";
      out.fill = "#CCCCCC20";
      out.width = out.width ?? 100;
      out.height = out.height ?? 100;
    }
    out.type = out.type === "ref" ? "frame" : out.type;
  }

  // Map text/label → content
  if (out.type === "text") {
    out.content = out.content ?? out.text ?? out.label ?? "";
  }

  // Resolve $variable references in fill, stroke, gap, padding
  if (out.fill)   out.fill   = resolve(out.fill);
  if (out.stroke) out.stroke = typeof out.stroke === "object"
    ? { ...out.stroke, fill: resolve(out.stroke.fill) }
    : out.stroke;

  // Infer layout on pill frames that are missing it
  const cr = out.cornerRadius;
  const isPill = typeof cr === "number" ? cr >= 999
    : Array.isArray(cr) ? cr.every(v => v >= 999) : false;
  if (isPill && out.padding != null && Array.isArray(out.children) && out.children.length > 0) {
    if (!out.layout || out.layout === "none") out.layout = "horizontal";
  }

  // Recurse children
  if (Array.isArray(out.children)) {
    out.children = out.children.map(c =>
      c && c !== "..." ? normalizePenNode(c, vars, components) : c
    );
  }

  return out;
}

/**
 * Walk a pen node tree and collect all reusable component nodes into a Map.
 *
 * @param {object[]} nodes
 * @returns {Map<string, object>}
 */
export function collectComponents(nodes) {
  const map = new Map();
  const walk = (node) => {
    if (!node || node === "...") return;
    if (node.reusable && node.type !== "text" && node.id) map.set(node.id, node);
    if (Array.isArray(node.children)) node.children.forEach(walk);
  };
  nodes.forEach(walk);
  return map;
}

/**
 * Generate a complete Figma plugin script from a normalized pen node tree.
 *
 * @param {object[]} screens - Array of normalized top-level screen nodes
 * @param {string}   pageName - Name to give the Figma page
 * @returns {string} Complete JS script ready to paste into the Figma console
 */
export function generateFigmaScript(screens, pageName = "Imported Design") {
  const screensJson = JSON.stringify(screens, null, 2);
  const runner = RUNNER(pageName);
  return `${ENGINE}
function getScreens() {
  return ${screensJson};
}
${runner}`;
}

// ─── CLI entry point ───────────────────────────────────────

if (process.argv[1] && process.argv[1].endsWith("pen-to-figma.js")) {
  import("fs").then(({ readFileSync, writeFileSync }) => {
    const inputPath = process.argv[2];
    const pageName  = process.argv[3] || "Imported Design";
    if (!inputPath) {
      console.error("Usage: node converter/pen-to-figma.js pen-nodes.json [pageName]");
      process.exit(1);
    }
    const nodes  = JSON.parse(readFileSync(inputPath, "utf8"));
    const script = generateFigmaScript(nodes, pageName);
    writeFileSync("figma-plugin.js", script);
    console.log(`✅ Written figma-plugin.js (${nodes.length} screen(s))`);
  });
}
