# ActionIcon

A button that shows only an icon: a fixed-size square or circle [Button](../button/button.md), named by `label`.

```tsx
import { ActionIcon } from '@solid-slopkit/components';
```

## Usage

```tsx
<ActionIcon label="Edit" onClick={edit}>
  <Pencil />
</ActionIcon>

<ActionIcon label="Delete" variant="soft" color="error" onClick={remove}>
  <Trash2 />
</ActionIcon>

<ActionIcon as="a" href="/settings" label="Settings" shape="circle">
  <Settings />
</ActionIcon>
```

- **Name:** `label` is required and becomes the button's `aria-label`: an icon alone says nothing to a screen reader. Say what the button does ("Edit", "Delete message"), not what the icon shows. Mark the icon `aria-hidden="true"`, or use an icon set that does it for you.
- **Variants:** the Button variants except `link`: `ghost` (the default), `solid`, `soft`, `outline` and `dash`. Ghost suits toolbars, table rows and headers, where a row of filled squares would be heavy; reach for `solid` or `soft` for a lone primary action.
- **Color:** `color` takes a color role. A ghost ActionIcon without one takes the color of the text around it; other variants use the base colors.
- **Size and shape:** `xs` to `xl`, the same heights as Button, so an ActionIcon lines up with a Button of the same size. `square` (the default) or `circle`. The icon is sized to match.
- **State:** `active` forces the pressed look, for a toggle; pair it with `aria-pressed`. `loading` shows a spinner over the icon and blocks interaction. `disabled` disables it.
- **Polymorphic:** `as` renders another element, with Button's rules: a link with `href` stays a link, other elements get a button's role and keys. `as` is read once; set `dynamicAs` to change it later.
- For closing or dismissing, use [CloseButton](../close-button/close-button.md), which has the icon and the name built in.

## Props

Other props, such as `onClick` or `href`, are passed to the rendered element.

| Prop       | Type                                                                                               | Default    | Description                             |
| ---------- | -------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------- |
| `label`    | `string`                                                                                           | required   | Accessible name.                        |
| `variant`  | `'ghost' \| 'solid' \| 'soft' \| 'outline' \| 'dash'`                                              | `'ghost'`  | Visual style.                           |
| `color`    | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | —          | Color role.                             |
| `size`     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | `'md'`     | Size.                                   |
| `shape`    | `'square' \| 'circle'`                                                                             | `'square'` | Shape.                                  |
| `active`   | `boolean`                                                                                          | `false`    | Forces the pressed look.                |
| `loading`  | `boolean`                                                                                          | `false`    | Shows a spinner and blocks interaction. |
| `disabled` | `boolean`                                                                                          | `false`    | Disables it.                            |
| `as`       | `ValidComponent`                                                                                   | `'button'` | Element or component to render.         |
| `children` | `JSX.Element`                                                                                      | —          | The icon.                               |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-action-icon`, plus `.slp-button`. No slots: the icon is a direct child.
- State and variant attributes on the root are Button's: `data-variant`, `data-color`, `data-size`, `data-shape`, `data-pressed`, `data-loading`, `data-disabled`.
- CSS variables are Button's: `--slp-button-color` and `--slp-button-content`.
