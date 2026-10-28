# TextInput

A labelled one-line text field: an [Input](../input/input.md) in an [InputWrapper](../input-wrapper/input-wrapper.md).

```tsx
import { TextInput } from '@solid-slopkit/components';
```

## Usage

```tsx
const [name, setName] = createSignal('');

<TextInput label="Name" value={name()} onInput={(event) => setName(event.currentTarget.value)} />

<TextInput
  label="Email"
  type="email"
  description="We send the receipt here."
  error={emailError()}
  required
  leftSection={<Mail aria-hidden="true" />}
/>
```

- **Props are split:** `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size`, `id`, `class` and `style` go to the InputWrapper, the root of the field. Every other prop goes to the `input`: `value`, `onInput`, `onChange`, `type`, `name`, `placeholder`, `autocomplete`, `ref`, ….
- **Wiring:** the label points at the input, the input is described by the description and the error, and `error` marks it invalid. See InputWrapper.
- **Look:** Input's `variant` (`outline`, `soft`, `ghost`), `leftSection` and `rightSection`. `size` sizes the label, texts and box together.
- **Value:** controlled with `value` and `onInput`, or uncontrolled: leave `value` out and read the input, e.g. through a form. `onInput` fires on every keystroke, `onChange` when the field loses focus.
- **Type:** `type` is the input's (`text` by default, or `email`, `url`, `tel`, `search`, …). For passwords use PasswordInput, for numbers NumberInput.
- **No label:** without `label`, give it an `aria-label`.

## Props

Other props are passed to the `input`.

| Prop           | Type                                   | Default     | Description                                                                 |
| -------------- | -------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `label`        | `JSX.Element`                          | —           | The field's label.                                                          |
| `labelSection` | `JSX.Element`                          | —           | Content at the end of the label's row, such as the current value or a link. |
| `description`  | `JSX.Element`                          | —           | Help text between the label and the field.                                  |
| `error`        | `JSX.Element`                          | —           | Error message; marks the field invalid.                                     |
| `required`     | `boolean`                              | `false`     | Asterisk, and a required input.                                             |
| `withAsterisk` | `boolean`                              | `required`  | Shows the asterisk.                                                         |
| `size`         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`      | Size of the label, texts and box.                                           |
| `id`           | `string`                               | generated   | The input's id. Read once.                                                  |
| `variant`      | `'outline' \| 'soft' \| 'ghost'`       | `'outline'` | Visual style of the box.                                                    |
| `leftSection`  | `JSX.Element`                          | —           | Content before the input.                                                   |
| `rightSection` | `JSX.Element`                          | —           | Content after the input.                                                    |
| `disabled`     | `boolean`                              | `false`     | Disables the input.                                                         |
| `readOnly`     | `boolean`                              | `false`     | Makes the input read-only.                                                  |
| `class`        | `ClassValue`                           | —           | Classes for the root.                                                       |
| `style`        | `JSX.CSSProperties`                    | —           | Styles for the root.                                                        |
| `ref`          | `Ref<HTMLElement>`                     | —           | The `input`.                                                                |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-text-input`, plus `.slp-input-wrapper`, with InputWrapper's slots and attributes.
- The box inside is an Input: `.slp-text-input .slp-input`, with Input's slots (`input-control`, `input-left-section`, `input-right-section`) and attributes.
