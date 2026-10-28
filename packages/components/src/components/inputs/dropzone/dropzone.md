# Dropzone

An area that takes files dropped on it, and opens the file picker when clicked. It checks the files against `accept`, the sizes, the count and your `validator`, hands the ones that pass to `onDrop` and the rest to `onReject`. While files are dragged over it, it shows whether it would take them. For a field that keeps the chosen files, use FileInput; for a plain button, FileButton.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Keyboard and screen readers** below.

```tsx
import { Dropzone } from '@solid-slopkit/components';
```

## Usage

```tsx
<Dropzone
  accept="image/*"
  maxSize={5 * 1024 ** 2}
  onDrop={(files) => upload(files)}
  onReject={(rejections) => notifications.show({ color: 'error', message: `${rejections.length} files skipped` })}
  loading={uploading()}
>
  <Dropzone.Idle>Drop images here, or click to choose</Dropzone.Idle>
  <Dropzone.Accept>Release to upload</Dropzone.Accept>
  <Dropzone.Reject>Images up to 5 MB only</Dropzone.Reject>
</Dropzone>
```

- **Files:** `onDrop` gets the files that pass every check, and `onReject` gets `{ file, errors }` for each one that fails. It's not called when none pass (or none fail). The zone keeps no files; upload or store them yourself. Picked files go through the same checks as dropped ones.
- **Checks:** `accept` takes extensions and MIME types like an input's (`'image/*,.pdf'`), error `invalid-type`; `maxSize` and `minSize` in bytes, `too-large` and `too-small`. Without `multiple` (it defaults to `true`), or over `maxFiles`, the whole drop is rejected, `too-many-files`. `validator(file)` returns your own code (or several) to reject a file, nothing to take it. Each file gets every code that applies.
- **Drag state:** `Dropzone.Idle`, `Dropzone.Accept` and `Dropzone.Reject` show their children only in their state; they throw outside a Dropzone. Before the drop a browser tells only the count and the MIME types, so the state comes from those: with an extension in `accept`, files of any type show Accept, and the drop decides. Drags without files (text, links) are left alone.
- **Keyboard and screen readers:** by default the zone is a button (`role="button"`, in the tab order), named by its content; click, Enter and Space open the picker. Don't put other interactive content in it then. With `openOnClick={false}` it's a plain area that takes drops only; put your own button in it and open the picker with the function `openRef` gives you.
- **Disabled and loading:** `disabled` takes no files, doesn't open the picker and leaves the tab order (`aria-disabled`). `loading` covers the zone with a LoadingOverlay (named by `loadingLabel`, `Loading` by default), sets `aria-busy` and takes no files. Both still keep the browser from opening a file dropped on the zone.
- **Look:** a dashed box on the base surface; while it would take the dragged files, the edge and a tint take the `color` role (`primary` by default), and the error role while it wouldn't. Children are free content: lay them out yourself (e.g. a Group with an icon and text).
- `class`, `style` and other props go to the root `div`; `onClick` and `onKeyDown` run first, and `preventDefault()` keeps the picker closed. The element's own drop event isn't forwarded. `inputRef` gets the hidden file input.

## Props

Other props are passed to the root `div`.

| Prop           | Type                                                       | Default     | Description                                                  |
| -------------- | ---------------------------------------------------------- | ----------- | ------------------------------------------------------------ |
| `onDrop`       | `(files: File[]) => void`                                  | —           | Required. The files that pass every check.                   |
| `onReject`     | `(rejections: { file: File; errors: string[] }[]) => void` | —           | The files that fail a check, and why.                        |
| `accept`       | `string`                                                   | —           | File types it takes: extensions or MIME types.               |
| `multiple`     | `boolean`                                                  | `true`      | Several files at once; without it, several are rejected.     |
| `maxFiles`     | `number`                                                   | —           | At most this many in one drop.                               |
| `maxSize`      | `number`                                                   | —           | Largest file, in bytes.                                      |
| `minSize`      | `number`                                                   | —           | Smallest file, in bytes.                                     |
| `validator`    | `(file: File) => string \| string[] \| null \| undefined`  | —           | Your own check; return error codes to reject.                |
| `openOnClick`  | `boolean`                                                  | `true`      | Click, Enter and Space open the picker; a button. Read once. |
| `openRef`      | `(open: () => void) => void`                               | —           | Gets the function that opens the picker.                     |
| `disabled`     | `boolean`                                                  | `false`     | Takes no files.                                              |
| `loading`      | `boolean`                                                  | `false`     | A loader over the zone; takes no files.                      |
| `loadingLabel` | `string`                                                   | `'Loading'` | The loader's accessible name.                                |
| `color`        | `SlopColor`                                                | `primary`   | Color role while it would take the files.                    |
| `inputRef`     | `Ref<HTMLInputElement>`                                    | —           | The hidden file input.                                       |

`Dropzone.Idle`, `Dropzone.Accept` and `Dropzone.Reject` take `children` only and render no element of their own.

Error codes: `invalid-type`, `too-large`, `too-small`, `too-many-files`, plus your validator's.

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-dropzone`, with `data-color`, and `data-accept` or `data-reject` while files are dragged over, `data-disabled`, `data-loading`. It's `position: relative` and has `role="button"` unless `openOnClick={false}`.
- Slots: `[data-slot="dropzone-input"]` (the hidden file input), `[data-slot="dropzone-loader"]` (the LoadingOverlay, while `loading`).
- Custom properties: `--slp-dropzone-color` (edge, tint and focus ring while it would take the files; defaults to `color`'s token), `--slp-dropzone-reject-color` (edge and tint while it wouldn't; defaults to the error role).
