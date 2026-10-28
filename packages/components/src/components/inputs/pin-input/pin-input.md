# PinInput

A code split into one field per character, such as a one-time code or a PIN: typing moves to the next field, Backspace goes back, and a pasted or autofilled code spreads over the fields.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Typing** below.

```tsx
import { PinInput } from '@solid-slopkit/components';
```

## Usage

```tsx
<PinInput label="Verification code" description="We sent it by text message." onComplete={(code) => verify(code)} />

<PinInput label="PIN" length={6} mask name="pin" />
```

- **Value:** one string, the characters in order. Controlled with `value` and `onChange` (passing `value` at all makes it controlled), or uncontrolled with `defaultValue`. `onChange` runs after every change; `onComplete` when the last empty field is filled, e.g. to send the code.
- **Typing:** a character fills the field and moves on; typing over a filled field replaces its character. Backspace clears a field, and in an empty field clears the one before and moves there. The arrow keys move between fields. A field selects its character when focused.
- **Paste and autofill:** a pasted code, or one the phone fills from a text message, spreads over the fields from the one it lands in; characters that don't belong are skipped. The first field has `autocomplete="one-time-code"` (turn off with `oneTimeCode={false}`).
- **Characters:** `type="number"` (the default) takes digits and asks phones for a number pad; `alphanumeric` takes letters and digits. `mask` hides them like a password.
- **Length:** `length` fields, 4 by default.
- **Forms:** with `name`, a hidden input submits the whole code.
- **Text:** it's an InputWrapper: `label`, `labelSection`, `description`, `error`, `size`. The fields sit in a `role="group"` named by the label; each field is named "Character 1 of 4", and so on (change it with `fieldLabel`). `error` marks every field invalid.
- **Look:** Input's variants, `outline`, `soft` and `ghost` (an underline). The fields are square, a step taller than a text field of the same size.

## Props

Other props are passed to the InputWrapper root.

| Prop                                                                                      | Type                                        | Default                     | Description                                       |
| ----------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------- | ------------------------------------------------- |
| `length`                                                                                  | `number`                                    | `4`                         | How many characters.                              |
| `type`                                                                                    | `'number' \| 'alphanumeric'`                | `'number'`                  | Which characters it takes.                        |
| `value`                                                                                   | `string`                                    | —                           | The code, controlled.                             |
| `defaultValue`                                                                            | `string`                                    | —                           | The starting code, uncontrolled.                  |
| `onChange`                                                                                | `(value: string) => void`                   | —                           | Called after every change.                        |
| `onComplete`                                                                              | `(value: string) => void`                   | —                           | Called when every field is filled.                |
| `mask`                                                                                    | `boolean`                                   | `false`                     | Hides the characters.                             |
| `oneTimeCode`                                                                             | `boolean`                                   | `true`                      | Lets the browser fill a code from a text message. |
| `name`                                                                                    | `string`                                    | —                           | Submits the code with a form.                     |
| `fieldLabel`                                                                              | `(index: number, length: number) => string` | `Character {n} of {length}` | Each field's accessible name.                     |
| `variant`                                                                                 | `'outline' \| 'soft' \| 'ghost'`            | `'outline'`                 | Visual style of the fields.                       |
| `disabled`                                                                                | `boolean`                                   | `false`                     | Disables every field.                             |
| `readOnly`                                                                                | `boolean`                                   | `false`                     | Makes every field read-only.                      |
| `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size`, `id` | —                                           | —                           | InputWrapper's.                                   |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-pin-input`, plus `.slp-input-wrapper`.
- Slots: `[data-slot="pin-input-fields"]` (the row), `[data-slot="pin-input-field"]` (each field, with `data-variant`, `data-size` and `data-filled`), `[data-slot="pin-input-hidden"]`.
