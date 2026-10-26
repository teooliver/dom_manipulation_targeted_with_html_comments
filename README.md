# DOM manipulation targeted with HTML comments

A small experiment in targeting parts of a page using HTML comments instead of
ids, classes or wrapper elements.

A "component" is whatever sits between a pair of matching comments:

```html
<!-- c_id:Fy1La3PDAKo49BSpZyPyx -->
<p>First paragraph.</p>
<p>Second paragraph.</p>
<!-- /c_id:Fy1La3PDAKo49BSpZyPyx -->
```

The script finds a component by its id, and can style its elements or draw an
outline around the whole group. Because comments render nothing, marking a
component never changes the page layout.

## What the demo does

`index.html` is a simple page whose headings, paragraphs and button are each
wrapped in a pair of `c_id` comments. At the top of the page there is a row of
cards, one per component id. Hovering a card draws a dashed outline around the
matching component; moving the mouse away removes it.

## Running it

You need [Node.js](https://nodejs.org) to compile the TypeScript.

```sh
npm install
npm run build
```

Then open `index.html` in a browser.

While working on the script, `npm run watch` recompiles on every save.

## Project structure

| Path            | What it is                                                  |
| --------------- | ----------------------------------------------------------- |
| `index.html`    | The demo page: the cards and the comment-wrapped components |
| `script.ts`     | Finds, highlights and styles components                     |
| `cards.ts`      | Makes the cards highlight their component on hover          |
| `dist/`         | Compiled JavaScript loaded by the page. Generated, not in git |
| `tsconfig.json` | TypeScript compiler settings                                |
| `docs/`         | Longer notes on how the approach works                      |

## How the script is organised

The code is split into four parts. The first three are sections of `script.ts`
and the last one is `cards.ts`:

1. **Finding a component**: walks the page's comment nodes to find the opening
   comment, then collects every element up to the closing comment.
2. **Highlighting a component**: positions a single floating box over the
   component's elements. The box sits above the page, so the elements
   themselves are not modified.
3. **Styling a component**: `styleComponent(id, styles)` applies inline styles
   to every element of a component and highlights it.
4. **Component cards**: any element with a `data-component-id` attribute
   highlights that component on hover.

## Using it

Add a card for a component:

```html
<li class="card" data-component-id="Fy1La3PDAKo49BSpZyPyx">Fy1La3PDAKo49BSpZyPyx</li>
```

Style a component from the script:

```ts
styleComponent("GaIIzybDxh75uy5Bh5K6U", { color: "tomato", fontFamily: "sans-serif" });
```

Highlight or clear a highlight directly:

```ts
highlightComponent("Fy1La3PDAKo49BSpZyPyx");
removeHighlight();
```

## Limitations

- The opening and closing comments must be siblings (share the same parent).
- Only the first component with a given id is found, so ids should be unique.
- The highlight follows window resizes, but not other layout changes such as
  content being added to the page.
