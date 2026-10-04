# How it works

This project targets parts of a page using HTML comments (otherwise called
"HTML markers") instead of ids, classes or wrapper elements. A "component" is whatever sits between a pair of matching
comments, and `script.js` can find that component by id, style it, and draw an
outline around it.

## Marking a component

A component is wrapped in an opening and a closing comment that share the same
id:

```html
<!-- c_id:Fy1La3PDAKo49BSpZyPyx -->
<p>First paragraph.</p>
<p>Second paragraph.</p>
<!-- /c_id:Fy1La3PDAKo49BSpZyPyx -->
```

- The opening comment is `c_id:<id>`, the closing one is `/c_id:<id>`.
- A component can contain one element or several.
- The comments add nothing to the rendered page, so marking a component never
  changes the layout.

## Using the script

`script.js` is loaded at the end of `<body>`, so the whole page exists by the
time it runs.

```js
styleComponent("Fy1La3PDAKo49BSpZyPyx", { color: "tomato" });
```

- The first argument is the component id.
- The second is an optional object of styles, using the JavaScript camelCase
  names (`backgroundColor`, not `background-color`).
- It returns the elements it styled. If the id is not found, it returns an empty
  array and logs a warning in the console.

Calling it with only an id outlines the component without changing its styles.

## Finding the component

`findComponentElements(id)` does the lookup in two steps:

1. **Find the opening comment.** Comments cannot be reached with
   `querySelector`, so the script uses a `TreeWalker` with
   `NodeFilter.SHOW_COMMENT` to visit every comment node in `<body>` until one
   reads `c_id:<id>`.
2. **Collect what follows.** From that comment it walks forward through
   `nextSibling`, keeping every element node, until it reaches the comment that
   reads `/c_id:<id>`. Text nodes (the whitespace between tags) are skipped.

If the closing comment is missing, it logs a warning and returns whatever
elements it collected up to the end of the parent.

## Applying styles

`styleComponent` copies the styles object onto the `style` of each element in
the component with `Object.assign`. They end up as inline styles, on every
element between the two comments.

## Drawing the outline

The outline shows which component was modified. It has to satisfy two things:

- **It must not move anything.** That is why it is an `outline` and not a
  `border`: an outline takes up no space.
- **It must be one box around the whole component**, even when the component is
  several elements.

Putting an outline on each element gives one box per element, and wrapping the
elements in a new container would change their relationship with the rest of the
page. So the outline is drawn on a separate element instead:

1. `highlightComponent(id)` creates an empty `<div>` and appends it to `<body>`.
   It is `position: absolute`, so it sits out of the page flow, and
   `pointer-events: none`, so clicks pass through to the component underneath.
2. `positionHighlight(id)` reads `getBoundingClientRect()` for each element of
   the component and takes the smallest top/left and the largest bottom/right.
   That gives the one rectangle that covers all of them. The scroll position is
   added so the box is placed in page coordinates and scrolls with the content.
3. The look of the outline comes from the `HIGHLIGHT_STYLES` constant.

Each component gets one highlight box, kept in the `highlights` map by id.
Calling `styleComponent` again for the same id reuses and repositions the
existing box rather than adding another.

## Limitations

- **Repositioning.** Highlight boxes are repositioned when the window is
  resized, but not when the page content changes afterwards. Call
  `styleComponent` again for that id to reposition its box.
- **Siblings only.** The opening and closing comments must share the same
  parent, because the lookup walks siblings.
- **Elements only.** Text placed directly between the comments, with no tag
  around it, is not styled and is not included in the outline.
- **First match wins.** If two components use the same id, only the first one is
  found.
