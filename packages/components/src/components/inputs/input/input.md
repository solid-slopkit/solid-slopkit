# Input

A field box: a control, an `input` by default or any element with `as`, with optional sections on either side. The building block of the text fields; for a labelled field, use it inside an [InputWrapper](../input-wrapper/input-wrapper.md), or use a field component such as TextInput.

```tsx
import { Input } from '@solid-slopkit/components';
```

## Usage

```tsx
<Input aria-label="Search" placeholder="Search…" leftSection={<Search />} />

<Input aria-label="Price" type="number" variant="soft" rightSection={<span>USD</span>} />

<InputWrapper label="Email" description="We never share it." error={emailError()}>
  <Input type="email" value={email()} onInput={(event) => setEmail(event.currentTarget.value)} />
</InputWrapper>
```

- **Props go to the control:** `value`, `onInput`, `placeholder`, `name`, `type` and every other attribute go to the `input`. Only `class` and `style` go to the box, so a width or margin applies to what you see.
- **Variants:** `outline` (the default) has a border on the base surface; `soft` is filled with `base-200` and has no border until it's focused; `ghost` has neither, for fields inside something that already draws a box.
- **Sizes:** `xs` to `xl`, the same heights as Button, so a field and a button of the same size line up. Inside an InputWrapper, the wrapper's `size` is the default.
- **Focus:** the box draws a ring of the primary color while the control has focus, and of the error color when invalid. A mouse down anywhere in the box, sections included, focuses the control, unless it lands on a link, button or other control in a section.
- **Sections:** `leftSection` and `rightSection` hold an icon, a unit or a button. They're at least as wide as the field is tall, and icons are sized to match. Mark icons `aria-hidden="true"`; a button in a section needs its own name.
- **Invalid:** `invalid` draws the error border and sets `aria-invalid`. Inside an InputWrapper it defaults to whether the wrapper has an `error`.
- **States:** `disabled`, `readOnly` and `required` go to the control and mark the box (`data-disabled`, `data-read-only`). `required` defaults to the wrapper's. A control disabled by a disabled `fieldset` around it looks disabled too, without `data-disabled`.
- **Element:** `as` renders another control, such as `'textarea'` or `'select'`. A textarea grows the box, and its sections stay on the first line. `as` is read once.
- **Phones:** on touch screens the control's text is at least 16px, so phones don't zoom in when it's focused.
- **Name:** a lone Input has no label: give it `aria-label`, or put it in an InputWrapper.

## Props

Other props are passed to the control.

| Prop           | Type                                   | Default                          | Description                                      |
| -------------- | -------------------------------------- | -------------------------------- | ------------------------------------------------ |
| `variant`      | `'outline' \| 'soft' \| 'ghost'`       | `'outline'`                      | Visual style.                                    |
| `size`         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | the wrapper's, or `'md'`         | Height and text size.                            |
| `leftSection`  | `JSX.Element`                          | —                                | Content before the control.                      |
| `rightSection` | `JSX.Element`                          | —                                | Content after the control.                       |
| `invalid`      | `boolean`                              | whether the wrapper has an error | Error border and `aria-invalid`.                 |
| `disabled`     | `boolean`                              | `false`                          | Disables the control.                            |
| `readOnly`     | `boolean`                              | `false`                          | Makes the control read-only.                     |
| `required`     | `boolean`                              | the wrapper's                    | Makes the control required.                      |
| `as`           | `ValidComponent`                       | `'input'`                        | Element or component for the control. Read once. |
| `class`        | `ClassValue`                           | —                                | Classes for the box.                             |
| `style`        | `JSX.CSSProperties`                    | —                                | Styles for the box.                              |
| `ref`          | `Ref<HTMLElement>`                     | —                                | The control element.                             |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-input`, on the box.
- Slots: `[data-slot="input-control"]`, `[data-slot="input-left-section"]`, `[data-slot="input-right-section"]`.
- State and variant attributes on the box: `data-variant`, `data-size`, `data-invalid`, `data-disabled`, `data-read-only`, `data-multiline`, `data-with-left-section`, `data-with-right-section`.
- The focus ring is `:focus-within` on the box: `border-color` plus a 1px `box-shadow`.
