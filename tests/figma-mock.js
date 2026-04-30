/**
 * Minimal Figma API mock for unit testing plugin scripts.
 * Tracks all node state so tests can assert on it without a real Figma environment.
 */

function makeNode(type) {
  const node = {
    _type: type,
    name: "",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    opacity: 1,
    fills: [],
    strokes: [],
    strokeWeight: 1,
    strokeAlign: "INSIDE",
    effects: [],
    cornerRadius: 0,
    topLeftRadius: 0,
    topRightRadius: 0,
    bottomRightRadius: 0,
    bottomLeftRadius: 0,
    layoutMode: "NONE",
    layoutPositioning: "AUTO",
    layoutSizingHorizontal: "FIXED",
    layoutSizingVertical: "FIXED",
    primaryAxisAlignItems: "MIN",
    counterAxisAlignItems: "MIN",
    itemSpacing: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    clipsContent: false,
    arcData: null,
    parent: null,
    children: [],

    resize(w, h) {
      this.width  = Math.max(w, 1);
      this.height = Math.max(h, 1);
    },

    appendChild(child) {
      child.parent = this;
      this.children.push(child);
    },

    // Text-specific
    characters: "",
    fontSize: 14,
    fontName: { family: "Inter", style: "Regular" },
    letterSpacing: { value: 0, unit: "PIXELS" },
    lineHeight: { unit: "AUTO" },
    textAlignHorizontal: "LEFT",
    textAutoResize: "WIDTH_AND_HEIGHT",
  };
  return node;
}

export function createFigmaMock() {
  const page = makeNode("PAGE");
  page.name = "";
  page.children = [];
  page.appendChild = (child) => {
    child.parent = page;
    page.children.push(child);
  };

  const figma = {
    currentPage: page,

    createFrame()     { return makeNode("FRAME");     },
    createRectangle() { return makeNode("RECTANGLE"); },
    createEllipse()   { return makeNode("ELLIPSE");   },
    createText()      { return makeNode("TEXT");       },
    createLine()      {
      const l = makeNode("LINE");
      l.resize = (w, _h) => { l.width = w; l.height = 0; };
      return l;
    },

    async loadFontAsync() {},

    viewport: {
      scrollAndZoomIntoView() {},
    },
  };

  return { figma, page };
}
