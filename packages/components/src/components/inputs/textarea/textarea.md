# Textarea

A labelled multi-line text field: an [Input](../input/input.md) with a `textarea`, in an [InputWrapper](../input-wrapper/input-wrapper.md). With `autosize`, it grows and shrinks with its text.

```tsx
import { Textarea } from '@solid-slopkit/components';
```

## Usage

```tsx
<Textarea label="Notes" rows={4} />

<Textarea
  label="Message"
  autosize
  minRows={2}
  maxRows={8}
  value={message()}
  onInput={(event) => setMessage(event.currentTarget.value)}
/>
```

- **Props are split** like TextInput's: `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size`, `id`, `class` and `style` go to the wrapper; every other prop goes to the `textarea`.
- **Fixed height:** without `autosize`, `rows` sets the height and the user can drag it taller or shorter.
- **Autosize:** `autosize` fits the height to the text after each keystroke, a new `value`, or a change of width. It never goes below `minRows` (1 by default) and, with `maxRows`, scrolls once it's that tall. The user can't drag it. `autosize` is read once; `minRows` and `maxRows` can change.
- **Measuring:** autosize measures on one shared, hidden textarea with the same text styles and width, so the field doesn't shrink while measuring and the page doesn't jump.
- **Sections:** `leftSection` and `rightSection` stay on the first line.
- **Value:** controlled with `value` and `onInput`, or uncontrolled.

## Props

Other props are passed to the `textarea`.

| Prop           | Type                                   | Default     | Description                                                                 |
| -------------- | -------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `autosize`     | `boolean`                              | `false`     | Fits the height to the text. Read once.                                     |
| `minRows`      | `number`                               | `1`         | With `autosize`, the fewest rows.                                           |
| `maxRows`      | `number`                               | —           | With `autosize`, the most rows; then it scrolls.                            |
| `rows`         | `number`                               | —           | Without `autosize`, the height in rows.                                     |
| `label`        | `JSX.Element`                          | —           | The field's label.                                                          |
| `labelSection` | `JSX.Element`                          | —           | Content at the end of the label's row, such as the current value or a link. |
| `description`  | `JSX.Element`                          | —           | Help text between the label and the field.                                  |
| `error`        | `JSX.Element`                          | —           | Error message; marks the field invalid.                                     |
| `required`     | `boolean`                              | `false`     | Asterisk, and a required textarea.                                          |
| `withAsterisk` | `boolean`                              | `required`  | Shows the asterisk.                                                         |
| `size`         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`      | Size of the label, texts and box.                                           |
| `id`           | `string`                               | generated   | The textarea's id. Read once.                                               |
| `variant`      | `'outline' \| 'soft' \| 'ghost'`       | `'outline'` | Visual style of the box.                                                    |
| `leftSection`  | `JSX.Element`                          | —           | Content before the textarea, on the first line.                             |
| `rightSection` | `JSX.Element`                          | —           | Content after the textarea, on the first line.                              |
| `disabled`     | `boolean`                              | `false`     | Disables the textarea.                                                      |
| `readOnly`     | `boolean`                              | `false`     | Makes the textarea read-only.                                               |
| `class`        | `ClassValue`                           | —           | Classes for the root.                                                       |
| `style`        | `JSX.CSSProperties`                    | —           | Styles for the root.                                                        |
| `ref`          | `Ref<HTMLElement>`                     | —           | The `textarea`.                                                             |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-textarea`, plus `.slp-input-wrapper`, with InputWrapper's slots and attributes.
- The box inside is an Input (`.slp-textarea .slp-input`, with `data-multiline`), and the textarea is its `input-control` slot, with `data-autosize` when autosized.
