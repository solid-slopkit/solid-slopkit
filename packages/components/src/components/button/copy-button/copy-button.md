# CopyButton

An [ActionIcon](../action-icon/action-icon.md) that copies `value` to the clipboard, then shows a check and says so for a moment.

```tsx
import { CopyButton } from '@solid-slopkit/components';
```

## Usage

```tsx
<Group gap={2}>
  <Code>npm i @solid-slopkit/components</Code>
  <CopyButton value="npm i @solid-slopkit/components" size="sm" />
</Group>

<CopyButton value={shareUrl()} label="Copy link" copiedLabel="Link copied" variant="soft" />
```

- **Copying:** a press writes `value` to the clipboard with the Clipboard API. `value` is read when it's pressed, so it can change.
- **Confirmation:** after a copy, for `timeout` milliseconds (2000 by default), the copy icon becomes a check, the button turns `success`, its name changes from `label` to `copiedLabel`, and the root gets `data-copied`. A new copy restarts the wait.
- **Name:** `'Copy'` by default, `'Copied'` while confirmed. Say what's copied when the page has more than one ("Copy link", "Copy API key"). The name is the only announcement: screen readers that read a focused button's new name say "Copied"; others say nothing. When a copy matters, confirm it in the page too, from `onCopied`.
- **Errors:** the browser refuses outside a secure context (HTTPS or localhost), without the user's permission in some browsers, or when the API is missing. The button then confirms nothing and calls `onCopyError` with the reason; show the value so it can be copied by hand.
- **Look:** ActionIcon's: `ghost` by default, with `variant`, `color`, `size` and `shape`. `color` applies until a copy; the confirmation is always `success`.
- **Clicks:** `onClick` runs before the copy; `event.preventDefault()` in it skips the copy. `disabled` copies nothing.

## Props

Other props are passed to the `button`.

| Prop          | Type                                                                                               | Default    | Description                                       |
| ------------- | -------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------- |
| `value`       | `string`                                                                                           | required   | The text to copy.                                 |
| `label`       | `string`                                                                                           | `'Copy'`   | Accessible name.                                  |
| `copiedLabel` | `string`                                                                                           | `'Copied'` | Accessible name while the copy is confirmed.      |
| `timeout`     | `number`                                                                                           | `2000`     | How long the confirmation lasts, in milliseconds. |
| `onCopied`    | `(value: string) => void`                                                                          | —          | Called after the text is copied.                  |
| `onCopyError` | `(error: unknown) => void`                                                                         | —          | Called when the browser refuses to copy.          |
| `variant`     | `'ghost' \| 'solid' \| 'soft' \| 'outline' \| 'dash'`                                              | `'ghost'`  | Visual style.                                     |
| `color`       | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | —          | Color role until a copy.                          |
| `size`        | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | `'md'`     | Size.                                             |
| `shape`       | `'square' \| 'circle'`                                                                             | `'square'` | Shape.                                            |
| `disabled`    | `boolean`                                                                                          | `false`    | Disables it.                                      |
| `type`        | `'button' \| 'submit' \| 'reset'`                                                                  | `'button'` | Native type.                                      |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-copy-button`, plus `.slp-action-icon` and `.slp-button`.
- Slots: `[data-slot="copy-button-icon"]`, the copy icon or the check.
- State attributes on the root: `data-copied` while the copy is confirmed, plus Button's (`data-variant`, `data-color`, `data-size`, `data-shape`, `data-disabled`).
- CSS variables are Button's: `--slp-button-color` and `--slp-button-content`. Setting `--slp-button-color` overrides the success color too; scope it with `:not([data-copied])` to keep it.
