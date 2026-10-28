# ColorInput

A labelled text field for a color: the color as text, a swatch of it in front, a [ColorPicker](../color-picker/color-picker.md) in a dropdown, and an eye dropper where the browser has one.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Picker** below.

```tsx
import { ColorInput } from '@solid-slopkit/components';
```

## Usage

```tsx
<ColorInput label="Brand color" placeholder="Pick a color" defaultValue="#1971c2" />

<ColorInput
  label="Overlay"
  format="rgba"
  value={color()}
  onChange={setColor}
  swatches={['#e03131', '#2f9e44', '#1971c2']}
/>
```

- **Value:** the color as text, in `format`: `hex` (the default), `hexa`, `rgb`, `rgba`, `hsl` or `hsla`; `''` for none. Uncontrolled with `defaultValue` (read once, default `''`), or controlled with `value`. `onChange(value)` runs on every change, a drag's every step included; `onChangeEnd(value)` when one is done: a drag ends, a key moves a part of the picker, a swatch or the eye dropper picks a color, or the field is left or Enter is pressed after typing.
- **Typing:** the field reads hex (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`), `rgb()`/`rgba()` and `hsl()`/`hsla()`. As soon as the text reads as a color, it's the value, in `format`; the text stays as typed until the field is left (or Enter), then shows the value. Text that isn't a color changes nothing and is replaced by the value on leaving. An empty field is `''`. Formats without alpha drop it.
- **Picker:** a click on the field, or ArrowDown, opens it under the field box (`position`, default `bottom-start`; `offset`, default 4). It's a `dialog` named by the label, in the top layer, right after the field in the tab order: Tab moves into it, and its area, sliders and swatches work as in ColorPicker. Escape and a press outside close it, and so does focus leaving both the field and the picker; Escape inside it returns focus to the field. `swatches` and `swatchesPerRow` go to the picker; formats with alpha add its alpha slider. `withPicker={false}` leaves the field, the swatch and the eye dropper.
- **Field:** a text `input` with `role="combobox"`, `aria-haspopup="dialog"` and `aria-expanded` (a plain text field without the picker), `autocomplete="off"` and no spellcheck. Other props, such as `name`, `placeholder` or `onBlur`, go to it, so `name` submits the text.
- **Swatch:** a [ColorSwatch](../../data-display/color-swatch/color-swatch.md) of the value in the left section, hidden from screen readers; `hideSwatch` removes it, and `leftSection` replaces it.
- **Eye dropper:** where the browser has an `EyeDropper`, a button in the right section (named `eyeDropperLabel`, default `Pick a color from the screen`) picks a color from the screen. It's added once hydrated, so the server render matches. `withEyeDropper={false}` removes it, and `rightSection` replaces it.
- **Label and texts:** `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput. `size` also sizes the swatch and the picker.
- **Box:** an [Input](../input/input.md)'s box, with `variant`. `disabled` and `readOnly` keep the picker closed and hide the eye dropper.
- **Animation:** `transition` (default `fade`) and `transitionDuration` (ms, default 150). None under `prefers-reduced-motion`. Needs a `<SlopkitUi>` above it.
- `class` and `style` go to the root (with the label and texts).

## Props

| Prop                 | Type                                                    | Default                          | Description                                       |
| -------------------- | ------------------------------------------------------- | -------------------------------- | ------------------------------------------------- |
| `value`              | `string`                                                | —                                | The color, when controlled; `''` for none.        |
| `defaultValue`       | `string`                                                | `''`                             | The color it starts with, when uncontrolled.      |
| `onChange`           | `(value: string) => void`                               | —                                | Called on every change, in `format`.              |
| `onChangeEnd`        | `(value: string) => void`                               | —                                | Called when a change is done.                     |
| `format`             | `'hex' \| 'hexa' \| 'rgb' \| 'rgba' \| 'hsl' \| 'hsla'` | `'hex'`                          | The format of the value.                          |
| `swatches`           | `string[]`                                              | —                                | Colors to pick with one click, in the picker.     |
| `swatchesPerRow`     | `number`                                                | `7`                              | Swatches per row.                                 |
| `withPicker`         | `boolean`                                               | `true`                           | Shows the picker in a dropdown.                   |
| `withEyeDropper`     | `boolean`                                               | `true`                           | Shows the eye dropper, where the browser has one. |
| `eyeDropperLabel`    | `string`                                                | `'Pick a color from the screen'` | The eye dropper button's name.                    |
| `hideSwatch`         | `boolean`                                               | `false`                          | Hides the swatch in front of the text.            |
| `readOnly`           | `boolean`                                               | `false`                          | Shows the color without letting it change.        |
| `disabled`           | `boolean`                                               | `false`                          | Disables the field.                               |
| `variant`            | `'outline' \| 'soft' \| 'ghost'`                        | `'outline'`                      | The box's look.                                   |
| `leftSection`        | `JSX.Element`                                           | the swatch                       | Content before the text.                          |
| `rightSection`       | `JSX.Element`                                           | the eye dropper                  | Content after the text.                           |
| `position`           | `FloatingPlacement`                                     | `'bottom-start'`                 | Where the dropdown goes against the field.        |
| `offset`             | `number`                                                | `4`                              | Gap between the field and the dropdown, in px.    |
| `transition`         | `TransitionName`                                        | `'fade'`                         | The dropdown's animation.                         |
| `transitionDuration` | `number`                                                | `150`                            | Duration of the animation, in ms.                 |

Plus `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-color-input`. The field box is an `.slp-input`.
- Slots: `color-input-swatch` (a `.slp-color-swatch`), `color-input-eye-dropper`.
- The dropdown: `.slp-color-input-dropdown` (`[data-slot="color-input-dropdown"]`), with `data-placement`, `data-status` and `data-transition`, holding a `.slp-color-picker`.
