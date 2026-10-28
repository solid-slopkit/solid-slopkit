# FileButton

A [Button](../button/button.md) that opens the browser's file picker and hands the chosen files to `onChange`.

```tsx
import { FileButton } from '@solid-slopkit/components';
```

## Usage

```tsx
const [file, setFile] = createSignal<File>();

<FileButton accept="image/png,image/jpeg" onChange={setFile}>
  Upload a photo
</FileButton>

<FileButton multiple accept=".pdf" variant="outline" onChange={(files) => upload(files)}>
  Add documents
</FileButton>
```

- **Choosing:** a press opens the picker. `onChange` gets the chosen `File`, or a `File[]` with `multiple`; the type follows the prop. It isn't called when the picker is cancelled.
- **Choosing again:** after each choice the input is cleared, so picking the same file again calls `onChange` again. Keep the files you need from `onChange`.
- **Filters:** `accept` takes extensions and MIME types, like the input's (`'image/*'`, `'.pdf,.docx'`). It only filters the picker; check the files you get. `capture` (`'user'` or `'environment'`) opens a phone's camera instead.
- **Forms:** the input has no `name` and is cleared after each choice, so it sends nothing with a form. Upload the files yourself, or append them to a `FormData`.
- **Look:** every Button prop works: `variant`, `color`, `size`, `shape`, `fullWidth`, `loading`, `leftSection`, `rightSection`. For an icon-only FileButton, use `shape="square"` and an `aria-label`. `loading` and `disabled` stop it opening the picker.
- **Element:** a native `button` followed by a hidden `input type="file"`. Only the button is a tab stop and in the accessibility tree. The button's text is its name, so say what's uploaded.
- **Clicks:** `onClick` runs before the picker opens; `event.preventDefault()` in it keeps the picker closed.

## Props

Other props are passed to the `button`.

| Prop       | Type                                                                 | Default  | Description                                        |
| ---------- | -------------------------------------------------------------------- | -------- | -------------------------------------------------- |
| `onChange` | `(file: File) => void`, or `(files: File[]) => void` with `multiple` | required | Called with what was chosen. Not called on cancel. |
| `multiple` | `boolean`                                                            | `false`  | Lets the user pick several files.                  |
| `accept`   | `string`                                                             | —        | File types to offer: extensions or MIME types.     |
| `capture`  | `'user' \| 'environment'`                                            | —        | On phones, opens the front or back camera.         |

Plus Button's `variant`, `color`, `size`, `shape`, `fullWidth`, `active`, `loading`, `disabled`, `leftSection` and `rightSection`. There's no `type` or `as`: it's always a `button type="button"`.

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes on the button: `.slp-file-button`, plus `.slp-button`, with Button's attributes and CSS variables.
- Slots: `[data-slot="file-button-input"]`, the hidden input. It's the button's next sibling, not a child: an input can't go inside a button.
