# react-highlight-selector

Text highlighter for React with a customizable color palette, popover actions, and copy support. Select any text inside rendered HTML to highlight it, recolor it, copy it, or remove it — and serialize selections so they can be saved and re-rendered later.

[![npm version](https://img.shields.io/npm/v/react-highlight-selector.svg)](https://www.npmjs.com/package/react-highlight-selector)
[![license](https://img.shields.io/npm/l/react-highlight-selector.svg)](https://github.com/DhyanTD/react-highlight-selector/blob/master/LICENSE)

## Features

- **Highlight any text selection** inside HTML content with a mouse drag
- **Built-in popover** with color palette, delete, and copy actions
- **Custom popover support** — bring your own popover component
- **Multi-instance** — run several independent highlighters on one page via `identifier`
- **Serializable selections** — selections are stored with xpath-range metadata, so you can persist them and rehydrate highlights later from the saved HTML
- **Selection constraints** — enforce min/max selection length
- **TypeScript** — fully typed API

## Installation

```bash
npm install react-highlight-selector
# or
yarn add react-highlight-selector
# or
pnpm add react-highlight-selector
```

Requires **React 18+** (`react` and `react-dom` as peer dependencies).

## Quick start

Wrap your app (or the relevant subtree) in `SelectionProvider`, then render a `Highlighter` with an HTML string and a unique `identifier`:

```tsx
import { SelectionProvider, Highlighter } from 'react-highlight-selector'

const html = `<p>The quick brown fox jumps over the lazy dog. 
Select any part of this text to highlight it.</p>`

function App() {
  return (
    <SelectionProvider>
      <Highlighter
        identifier="doc-1"
        htmlString={html}
        onSelection={(selection) => console.log('highlighted:', selection)}
      />
    </SelectionProvider>
  )
}

export default App
```

Drag-select text inside the rendered content — it gets wrapped in a highlight. Hover a highlight to open the popover: change color, copy the text, or delete the highlight.

## Styling

Highlights are plain `<span>` elements whose appearance is driven by CSS class names. The default wrapper class is `bg-lightgreen relative select-none`, and the default popover swaps in `bg-red`, `bg-yellow`, and `bg-blue`. Define these classes in your stylesheet (or use Tailwind utilities):

```css
.bg-lightgreen { background-color: #15f5ba; }
.bg-red        { background-color: #ff407d; }
.bg-yellow     { background-color: #f5dd61; }
.bg-blue       { background-color: #59d5e0; }

.relative      { position: relative; }
.select-none   { user-select: none; }

/* Popover positioning (popover is rendered inside the highlight span) */
.popover {
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 10;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.15s ease;
}
```

You can override the highlight look per-instance with `selectionWrapperClassName`.

## Examples

### Callbacks: selection, copy, and highlight click

```tsx
<Highlighter
  identifier="article"
  htmlString={articleHtml}
  minSelectionLength={3}
  maxSelectionLength={500}
  onSelection={(selection) => {
    // fired once when the user finishes a new highlight
    console.log(selection.text, selection.meta)
  }}
  onCopy={(selection) => {
    navigator.clipboard.writeText(selection.text)
  }}
  onClickHighlight={(selection, event) => {
    console.log('clicked highlight', selection.id)
  }}
/>
```

### Custom popover

Pass your own component via `PopoverChildren`. It receives the selection plus action handlers:

```tsx
import { PopoverChildrentype } from 'react-highlight-selector'

const MyPopover: PopoverChildrentype = ({
  selection,
  removeSelection,
  updateSelection,
  handleCopy,
  identifier,
}) => (
  <div className="my-popover">
    <span>{selection.text.length} chars</span>
    <button onClick={() => handleCopy?.(selection)}>Copy</button>
    <button
      onClick={() =>
        updateSelection(
          selection.id,
          { ...selection, className: 'bg-blue relative select-none' },
          identifier,
        )
      }
    >
      Make blue
    </button>
    <button onClick={() => removeSelection(selection, identifier)}>Delete</button>
  </div>
)

<Highlighter
  identifier="article"
  htmlString={articleHtml}
  PopoverChildren={MyPopover}
/>
```

### Disable the popover or multi-color palette

```tsx
<Highlighter
  identifier="notes"
  htmlString={notesHtml}
  disablePopover                 // no popover at all
/>
<Highlighter
  identifier="notes-2"
  htmlString={notesHtml}
  disableMultiColorHighlight     // popover shows, but without color swatches
/>
```

### Saving and re-rendering selections

Selections are rehydrated from the input HTML itself: any `<span id="selection-..." data-meta="...">` embedded in `htmlString` is converted back into an active highlight on mount. To persist highlights, serialize the container's HTML (including the highlight spans and their `data-meta` attributes) and feed it back later:

```tsx
// Save: read the rendered container after highlighting
const container = document.getElementById('highlighter-rootdoc-1')
const savedHtml = container?.innerHTML ?? ''

// Restore later: pass the saved HTML right back in
<Highlighter identifier="doc-1" htmlString={savedHtml} />
```

You can also store the structured selections via the `useSelections` hook (below) — each `SelectionType.meta` is an xpath-range serialized range.

### Reading all selections with `useSelections`

Must be used inside `SelectionProvider`. Selections are keyed by each highlighter's `identifier`:

```tsx
import { useSelections } from 'react-highlight-selector'

function SelectionsPanel() {
  const { selections, addSelection, updateSelection, removeSelection } = useSelections()

  return (
    <ul>
      {(selections['doc-1'] ?? []).map((s) => (
        <li key={s.id}>
          {s.text}{' '}
          <button onClick={() => removeSelection(s, 'doc-1')}>remove</button>
        </li>
      ))}
    </ul>
  )
}
```

### Multiple independent highlighters

Give each instance a distinct `identifier`; their selections are tracked separately in the same provider:

```tsx
<SelectionProvider>
  <Highlighter identifier="chapter-1" htmlString={chapterOne} />
  <Highlighter identifier="chapter-2" htmlString={chapterTwo} />
</SelectionProvider>
```

## API

### `<SelectionProvider>`

Context provider that holds all highlight state. Required ancestor of `Highlighter` and `useSelections`.

| Prop       | Type              | Description     |
| ---------- | ----------------- | --------------- |
| `children` | `React.ReactNode` | App/subtree     |

### `<Highlighter>`

| Prop                        | Type                              | Default                                   | Description                                                              |
| --------------------------- | --------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| `htmlString`                | `string`                          | — (required)                              | HTML content to render and make highlightable. Existing `selection-*` spans are rehydrated into highlights. |
| `identifier`                | `string`                          | — (required)                              | Unique key isolating this instance's selections in the provider.         |
| `minSelectionLength`        | `number`                          | `10`                                      | Minimum selected characters required to create a highlight.              |
| `maxSelectionLength`        | `number`                          | —                                         | Maximum selected characters allowed for a highlight.                     |
| `className`                 | `string`                          | —                                         | Class applied to the highlighter's root `<div>`.                         |
| `selectionWrapperClassName` | `string`                          | `'bg-lightgreen relative select-none'`    | Class applied to newly created highlight spans.                          |
| `PopoverClassName`          | `string`                          | —                                         | Class for the popover element (custom hover handling when set).          |
| `PopoverChildren`           | `PopoverChildrentype`             | built-in popover                          | Custom popover component rendered on hover.                              |
| `disablePopover`            | `boolean`                         | `false`                                   | Hide the popover entirely.                                               |
| `disableMultiColorHighlight`| `boolean`                         | `false`                                   | Hide the color swatches in the popover.                                  |
| `onSelection`               | `(selection: SelectionType) => void` | —                                      | Called when a new highlight is created.                                  |
| `onCopy`                    | `(selection: SelectionType) => void` | —                                      | Called from the popover's copy action (enables the copy button).         |
| `onClickHighlight`          | `(selection: SelectionType, event: MouseEvent) => void` | —               | Called when an existing highlight is clicked.                            |
| `onClick`                   | `MouseEventHandler<HTMLDivElement>` | —                                       | Click handler for the root container.                                    |

### `useSelections()`

Returns highlight state and mutators. Throws if used outside `SelectionProvider`.

| Member           | Type                                                                          | Description                     |
| ---------------- | ----------------------------------------------------------------------------- | ------------------------------- |
| `selections`     | `Record<string, SelectionType[]>`                                             | All selections keyed by identifier. |
| `setSelections`  | `Dispatch<SetStateAction<Record<string, SelectionType[]>>>`                   | Replace state directly.         |
| `addSelection`   | `(selection: SelectionType, identifier: string) => Promise<void>`             | Add a selection (deduped by `id`). |
| `updateSelection`| `(id: string, updatedSelection: SelectionType, identifier: string) => Promise<void>` | Replace a selection by `id`. |
| `removeSelection`| `(selection: SelectionType, identifier: string) => void`                      | Remove a selection.             |

### Types

```ts
type SelectionType = {
  id: string                    // e.g. "selection-abc123"
  text: string                  // highlighted text
  meta: string                  // xpath-range serialized range (for rehydration)
  className?: string            // highlight span classes
  startContainerText?: string
  endContainerText?: string
  [key: string]: any            // open for your own fields
}

type PopoverChildrentype = React.FC<{
  selection: SelectionType
  identifier: string
  handleCopy?: (selection: SelectionType) => void
  removeSelection: (selection: SelectionType, identifier: string) => void
  updateSelection: (id: string, updatedSelection: SelectionType, identifier: string) => void
  disableMultiColorHighlight?: boolean
}>

type XpathType = {
  start: string
  end: string
  startOffset: number
  endOffset: number
}
```

### Constants

| Export                            | Value                                  |
| --------------------------------- | -------------------------------------- |
| `defaultColor`                    | `'#15F5BA'`                            |
| `defaultSelectionWrapperClassName`| `'bg-lightgreen relative select-none'` |
| `defaultMinSelectionLength`       | `10`                                   |

## Development commands

| Command              | Description                                                    |
| -------------------- | -------------------------------------------------------------- |
| `npm run build`      | Build both ESM (`dist/esm`) and CJS (`dist/cjs`) outputs.      |
| `npm run build:esm`  | Build ESM output + type declarations with `tsc`.               |
| `npm run build:cjs`  | Build CommonJS output to `dist/cjs`.                           |
| `npm run lint`       | Lint all `js/ts/jsx/tsx` files with ESLint.                    |
| `npm run prettier`   | Format `src`, `tests`, and `example/src` with Prettier.        |
| `npm test`           | Test script placeholder (no tests configured yet).             |
| `npm run prepare`    | Runs automatically on install; builds the package.             |
| `npm run prepublishOnly` | Pre-publish gate: test + prettier + lint.                  |

Typical contributor flow:

```bash
npm install        # installs deps and builds via `prepare`
npm run lint       # check code style
npm run build      # produce dist/
```

## License

MIT © Dhyan T D
