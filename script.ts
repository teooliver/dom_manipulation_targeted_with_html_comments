// A "component" is the group of elements sitting between a pair of HTML comments:
//
//   <!-- c_id:abc -->
//   <h1>Title</h1>
//   <p>Text</p>
//   <!-- /c_id:abc -->

type ComponentId = string;
type Styles = Partial<CSSStyleDeclaration>;

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Finding a component
// ---------------------------------------------------------------------------

function openingCommentText(id: ComponentId): string {
  return `c_id:${id}`;
}

function closingCommentText(id: ComponentId): string {
  return `/c_id:${id}`;
}

function isCommentWithText(node: Node, text: string): boolean {
  return node instanceof Comment && node.data.trim() === text;
}

function findCommentWithText(text: string): Comment | null {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);

  let comment = walker.nextNode();
  while (comment !== null) {
    if (isCommentWithText(comment, text)) return comment as Comment;
    comment = walker.nextNode();
  }

  return null;
}

// Returns the elements sitting between <!-- c_id:<id> --> and <!-- /c_id:<id> -->
function findComponentElements(id: ComponentId): HTMLElement[] {
  const openingComment = findCommentWithText(openingCommentText(id));
  if (openingComment === null) {
    console.warn(`No component found for c_id:${id}`);
    return [];
  }

  const elements: HTMLElement[] = [];

  let node = openingComment.nextSibling;
  while (node !== null) {
    if (isCommentWithText(node, closingCommentText(id))) return elements;
    if (node instanceof HTMLElement) elements.push(node);
    node = node.nextSibling;
  }

  console.warn(`No closing comment found for c_id:${id}`);
  return elements;
}

// ---------------------------------------------------------------------------
// Highlighting a component
// ---------------------------------------------------------------------------

// Outline marks the modified component without affecting layout (unlike border)
const HIGHLIGHT_STYLES: Styles = {
  outline: "2px dashed blue",
  outlineOffset: "2px",
  position: "absolute",
  pointerEvents: "none",
};

// Returns the smallest box, in page coordinates, that covers all the elements
function getBoxAround(elements: HTMLElement[]): Box {
  const rects = elements.map((element) => element.getBoundingClientRect());

  const top = Math.min(...rects.map((rect) => rect.top));
  const left = Math.min(...rects.map((rect) => rect.left));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  const right = Math.max(...rects.map((rect) => rect.right));

  return {
    top: top + window.scrollY,
    left: left + window.scrollX,
    width: right - left,
    height: bottom - top,
  };
}

function createHighlightBox(): HTMLElement {
  const highlightBox = document.createElement("div");
  Object.assign(highlightBox.style, HIGHLIGHT_STYLES);
  document.body.appendChild(highlightBox);
  return highlightBox;
}

// There is a single highlight box, which moves to whichever component is
// currently highlighted. It floats above the page, so the component's own
// elements are left untouched
const highlightBox = createHighlightBox();
let highlightedComponentId: ComponentId | null = null;

function showHighlightBox(): void {
  highlightBox.style.display = "block";
}

function hideHighlightBox(): void {
  highlightBox.style.display = "none";
}

// Nothing is highlighted until a component is chosen
hideHighlightBox();

// Moves and resizes the highlight box so it covers every element of the
// highlighted component
function updateHighlightBox(): void {
  if (highlightedComponentId === null) {
    hideHighlightBox();
    return;
  }

  const elements = findComponentElements(highlightedComponentId);
  if (elements.length === 0) {
    hideHighlightBox();
    return;
  }

  const box = getBoxAround(elements);

  Object.assign(highlightBox.style, {
    top: `${box.top}px`,
    left: `${box.left}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
  });
  showHighlightBox();
}

// Draws one outline around the whole component, replacing any previous highlight
function highlightComponent(id: ComponentId): void {
  highlightedComponentId = id;
  updateHighlightBox();
}

function removeHighlight(): void {
  highlightedComponentId = null;
  updateHighlightBox();
}

// Elements move when the window is resized, so the highlight box must follow
window.addEventListener("resize", updateHighlightBox);

// ---------------------------------------------------------------------------
// Styling a component
// ---------------------------------------------------------------------------

// Applies the given styles to the component wrapped by the comments with that id
function styleComponent(id: ComponentId, styles: Styles = {}): HTMLElement[] {
  const elements = findComponentElements(id);
  if (elements.length === 0) return elements;

  elements.forEach((element) => Object.assign(element.style, styles));
  highlightComponent(id);
  return elements;
}

// Example
// styleComponent("GaIIzybDxh75uy5Bh5K6U", { color: "tomato", fontFamily: "sans-serif" });
