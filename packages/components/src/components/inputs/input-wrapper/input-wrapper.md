# InputWrapper

A label, description and error around a field. The field inside, such as an [Input](../input/input.md), gets the ids, the invalid state and the size from it, so the texts are wired for screen readers without passing ids around.

```tsx
import { InputWrapper } from '@solid-slopkit/components';
```

## Usage

```tsx
<InputWrapper label="Email" description="We never share it." error={emailError()} required>
  <Input type="email" />
</InputWrapper>
```

- **Order:** label, description, field, error. Each text is rendered only when it has content.
- **Label section:** `labelSection` puts content at the end of the label's row, on its baseline: a link (`Forgot password?`), a count, or a slider's current value. The label and the section then share a row. The section sits outside the `label`, so it isn't part of the field's accessible name; hide a visual duplicate of the value with `aria-hidden`. Plain text in it takes the label's size.
- **Wiring:** the label's `for` points at the control's id, which is generated unless you pass `id` here. The control's `aria-describedby` lists the description and the error, after any ids you pass on the control yourself.
- **Error:** `error` shows a message under the field and marks the field invalid (`aria-invalid`, the error border). `error={true}` marks it invalid without a message, e.g. when a message elsewhere covers several fields. The message isn't a live region: it's read when the field is focused, not announced as you type.
- **Required:** `required` adds an asterisk after the label, hidden from screen readers, and makes the control `required`, which screen readers announce. `withAsterisk` shows the asterisk without `required`, for your own validation; `withAsterisk={false}` hides it.
- **Size:** `size` sizes the label and texts and is the field's default size.
- **Groups:** `labelElement="div"` renders the label as a `div`, for a group of controls such as radios, which can't be labelled with `for`. The group then points at the label itself: read `useInputWrapper()` for `labelId()` and `describedBy()`.
- **Your own field:** a custom control reads `useInputWrapper()` too: `id`, `labelId()`, `describedBy()`, `invalid()`, `required()` and `size()`. Outside a wrapper it returns `undefined`.

## Props

Other props are passed to the root `div`.

| Prop           | Type                                   | Default    | Description                                                                 |
| -------------- | -------------------------------------- | ---------- | --------------------------------------------------------------------------- |
| `label`        | `JSX.Element`                          | —          | The field's label.                                                          |
| `labelSection` | `JSX.Element`                          | —          | Content at the end of the label's row, such as the current value or a link. |
| `description`  | `JSX.Element`                          | —          | Help text between the label and the field.                                  |
| `error`        | `JSX.Element`                          | —          | Error message under the field; marks it invalid. `true`: no message.        |
| `required`     | `boolean`                              | `false`    | Asterisk, and a required control.                                           |
| `withAsterisk` | `boolean`                              | `required` | Shows the asterisk.                                                         |
| `size`         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`     | Text size, and the field's default size.                                    |
| `id`           | `string`                               | generated  | The control's id. Read once.                                                |
| `labelElement` | `'label' \| 'div'`                     | `'label'`  | `div` for a group of controls. Read once.                                   |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-input-wrapper`.
- Slots: `[data-slot="input-wrapper-label"]`, `[data-slot="input-wrapper-required"]` (the asterisk), `[data-slot="input-wrapper-label-row"]` and `[data-slot="input-wrapper-label-section"]` (only with a `labelSection`), `[data-slot="input-wrapper-description"]`, `[data-slot="input-wrapper-error"]`.
- State attributes on the root: `data-size`, `data-invalid`.
- The error text is the error role mixed 40% toward the text color, so small text stays readable on light and dark surfaces.
