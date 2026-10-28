# FileInput

A labelled field for files: it looks like a text field, and its control is a button that opens the browser's file picker and shows the chosen file names. A hidden `input type="file"` keeps the files for a form. For a plain button that hands files to your code, use FileButton.

```tsx
import { FileInput } from '@solid-slopkit/components';
```

## Usage

```tsx
const [resume, setResume] = createSignal<File | null>(null);

<FileInput label="Resume" description="PDF, up to 5 MB." accept=".pdf" value={resume()} onChange={setResume} clearable />

<FileInput label="Photos" multiple accept="image/*" name="photos" />
```

- **Value:** a `File` or `null`, or with `multiple` a `File[]`; the types of `value` and `onChange` follow `multiple`, which is read once. Controlled with `value` and `onChange` (passing `value` at all makes it controlled), or uncontrolled with `defaultValue`. `onChange` isn't called when the picker is cancelled.
- **Showing:** the field shows the chosen names, separated by commas and cut with an ellipsis; `valueFormat` shows them your way (`(files) => \`${files.length} photos\``). With none, it shows `placeholder` (`Choose a file`, or `Choose files`).
- **Clearing:** `clearable` adds a clear button in the right section while there are files (named `Clear`; change it with `clearLabel`). Without it, `rightSection` goes there.
- **Screen readers:** the button is named by `label` and described by the chosen names and the description, so they hear "Resume, button, resume.pdf, PDF, up to 5 MB."
- **Forms:** the hidden file input always holds the files the field shows, also after clearing or a controlled change, so a form submits them under `name`. `required` shows the asterisk only: check for a file when the form is sent.
- **Filters:** `accept` filters the picker only; check the files you get. `capture` opens a phone's camera.
- **Look and wrapper:** Input's `variant` and `leftSection`; InputWrapper's `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size`, `id`. `class` and `style` go to the root; other props go to the button. `onClick` runs before the picker opens; `preventDefault()` keeps it closed.

## Props

Other props are passed to the button.

| Prop                                                                                                                                            | Type                                          | Default                          | Description                                      |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------- | ------------------------------------------------ |
| `multiple`                                                                                                                                      | `boolean`                                     | `false`                          | Several files; the value is an array. Read once. |
| `value`                                                                                                                                         | `File \| null`, or `File[]` with `multiple`   | —                                | The files, controlled.                           |
| `defaultValue`                                                                                                                                  | `File \| null`, or `File[]` with `multiple`   | —                                | The files at first, uncontrolled.                |
| `onChange`                                                                                                                                      | `(value: File \| null)`, or `(value: File[])` | —                                | Called with the chosen or cleared files.         |
| `accept`                                                                                                                                        | `string`                                      | —                                | File types to offer.                             |
| `capture`                                                                                                                                       | `'user' \| 'environment'`                     | —                                | Opens a phone's camera.                          |
| `name`                                                                                                                                          | `string`                                      | —                                | Submits the files with a form.                   |
| `placeholder`                                                                                                                                   | `string`                                      | `Choose a file` / `Choose files` | Shown while empty.                               |
| `valueFormat`                                                                                                                                   | `(files: File[]) => JSX.Element`              | the names                        | How the files show.                              |
| `clearable`                                                                                                                                     | `boolean`                                     | `false`                          | A button that clears the files. Read once.       |
| `clearLabel`                                                                                                                                    | `string`                                      | `'Clear'`                        | The clear button's accessible name.              |
| `variant`, `leftSection`, `rightSection`, `disabled`, `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size`, `id` | —                                             | —                                | Input's and InputWrapper's.                      |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-file-input`, plus `.slp-input-wrapper`. The box is an Input, and the button is its `input-control` slot, with `data-empty` while no file is chosen.
- Slots: `[data-slot="file-input-value"]` (the names or placeholder), `[data-slot="file-input-input"]` (the hidden file input).
