# NumberInput

A labelled number field: a text input with the `spinbutton` role, formatted for the locale. Arrow keys and the controls step it; leaving the field clamps and rounds it.

```tsx
import { NumberInput } from '@solid-slopkit/components';
```

## Usage

```tsx
const [quantity, setQuantity] = createSignal<number | undefined>(1);

<NumberInput label="Quantity" value={quantity()} onChange={setQuantity} min={1} max={99} />

<NumberInput label="Price" defaultValue={9.5} decimalScale={2} fixedDecimalScale min={0} rightSection={<span>EUR</span>} />
```

- **Value:** a `number`, or `undefined` when the field is empty. Controlled with `value` and `onChange`: passing `value` at all makes it controlled, so `value={undefined}` is a controlled empty field. Uncontrolled, it starts at `defaultValue`. `onChange` fires on each keystroke that changes the number, on each step, and when leaving the field clamps or rounds it.
- **Locale:** the provider's `locale`, or `locale` for this field. While the field isn't focused, the number is shown with the locale's group and decimal separators (`1,234.5`, `1.234,5`); while editing, without groups, so the caret doesn't jump. Digits are always Latin.
- **Typing:** only digits, one decimal separator and a leading minus get in; anything else is dropped where it was typed. A typed `.` becomes the locale's decimal separator, unless `.` groups thousands there (as in German), where it's dropped. Text without a number yet, such as a lone `-`, stays on screen and reports `undefined`.
- **Bounds and precision:** `min` and `max` stop the arrows and controls, and leaving the field clamps to them. `decimalScale` limits the digits after the separator while typing and rounds when leaving; `0` allows whole numbers only. `fixedDecimalScale` pads the shown number to `decimalScale` digits (`2.50`).
- **Negatives:** a minus can be typed when `min` is below zero or unset; `allowNegative` overrides that.
- **Stepping:** Arrow Up and Down add or subtract `step` (1 by default); Page Up and Page Down ten steps. From an empty field, a step goes to 0, or to the bound nearest it. Steps keep the decimals of the value and the step, without binary noise (`0.1 + 0.2` is `0.3`).
- **Controls:** two buttons on the right step up and down; holding one keeps stepping. They're out of the tab order (the arrow keys do the same) and keep the focus where it is. They're disabled at the bounds. `hideControls` hides them; `rightSection` goes before them. Rename them with `incrementLabel` and `decrementLabel`.
- **Screen readers:** the input has `role="spinbutton"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` with the formatted number.
- **Keyboards on phones:** when a minus is allowed, the input asks for the full keyboard (some phones' number pads have no minus); otherwise for a number pad, without a decimal key when `decimalScale` is 0.
- **Props are split** like TextInput's. The input is always `type="text"`.

## Props

Other props are passed to the `input`. The wrapper's props (`label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size`, `id`, `class`, `style`) are TextInput's.

| Prop                | Type                                   | Default                | Description                                     |
| ------------------- | -------------------------------------- | ---------------------- | ----------------------------------------------- |
| `value`             | `number \| undefined`                  | —                      | The number, controlled.                         |
| `defaultValue`      | `number`                               | —                      | The starting number, uncontrolled.              |
| `onChange`          | `(value: number \| undefined) => void` | —                      | Called with the new number.                     |
| `min`               | `number`                               | —                      | The smallest number.                            |
| `max`               | `number`                               | —                      | The largest number.                             |
| `step`              | `number`                               | `1`                    | The amount one step changes it.                 |
| `decimalScale`      | `number`                               | —                      | Most digits after the decimal separator.        |
| `fixedDecimalScale` | `boolean`                              | `false`                | Pads the shown number to `decimalScale` digits. |
| `allowNegative`     | `boolean`                              | `min` below 0 or unset | Whether a minus can be typed.                   |
| `grouping`          | `boolean`                              | `true`                 | Group separators while not focused.             |
| `locale`            | `string`                               | the provider's         | A locale for this field.                        |
| `hideControls`      | `boolean`                              | `false`                | Hides the buttons. Read once.                   |
| `incrementLabel`    | `string`                               | `'Increase'`           | Accessible name of the up button.               |
| `decrementLabel`    | `string`                               | `'Decrease'`           | Accessible name of the down button.             |
| `variant`           | `'outline' \| 'soft' \| 'ghost'`       | `'outline'`            | Visual style of the box.                        |
| `leftSection`       | `JSX.Element`                          | —                      | Content before the input.                       |
| `rightSection`      | `JSX.Element`                          | —                      | Content after the input, before the controls.   |
| `disabled`          | `boolean`                              | `false`                | Disables the input and the controls.            |
| `readOnly`          | `boolean`                              | `false`                | No typing or stepping.                          |
| `ref`               | `Ref<HTMLElement>`                     | —                      | The `input`.                                    |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-number-input`, plus `.slp-input-wrapper`. The box inside is an Input.
- Slots: `[data-slot="number-input-controls"]` (both buttons), `[data-slot="number-input-increment"]`, `[data-slot="number-input-decrement"]`.
