# ColorPicker

A color picked on a panel: a saturation and brightness area, a hue slider, an alpha slider for formats with alpha, a preview, and optional swatches.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Pointer**, **Keyboard** and **Screen readers** below.

```tsx
import { ColorPicker } from '@solid-slopkit/components';
```

## Usage

```tsx
const [color, setColor] = createSignal('#1971c2');

<ColorPicker label="Brand color" value={color()} onChange={setColor} swatches={['#e03131', '#2f9e44', '#1971c2']} />

<ColorPicker label="Overlay" format="rgba" defaultValue="rgba(0, 0, 0, 0.5)" />
```

- **Value:** a color string. It reads hex (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`), `rgb()`/`rgba()` and `hsl()`/`hsla()`, and reports in `format`: `hex` (the default), `hexa`, `rgb`, `rgba`, `hsl` or `hsla`. Controlled with `value` and `onChange` (passing `value` at all makes it controlled), or uncontrolled with `defaultValue` (`#000000`). `onChange` runs on every step of a drag; `onChangeEnd` when the user lets go, a key moves a part, or a swatch is picked.
- **Hue that stays:** the picker keeps hue, saturation, brightness and alpha, so dragging to grey or black doesn't lose the hue. A new `value` that draws the color already shown doesn't move it. While controlled, the picker shows your `value`; if you don't apply a change, it keeps its own position until the next `value`.
- **Alpha:** the formats with alpha (`hexa`, `rgba`, `hsla`) add an alpha slider; the others report the opaque color.
- **Pointer:** a press in the area or on a slider moves there and starts a drag.
- **Keyboard:** each part is a tab stop with `role="slider"`. In the area, Left and Right change saturation, Up and Down brightness, Page Up and Page Down brightness by 10, Home and End saturation to 0 and 100. On a slider, the arrows step by 1, Home and End go to the ends. Shift steps by 10.
- **Screen readers:** the area is "Saturation and brightness" and says "Saturation 60%, brightness 80%"; the sliders are "Hue" (in degrees) and "Alpha" (a percentage). Rename them with `saturationLabel`, `hueLabel` and `alphaLabel`. The whole picker is a group named by `label`. Swatches are buttons named by their color, pressed while it's the current one.
- **Size:** `size` sets the panel's width, from 10rem (`xs`) to 18rem (`xl`); `fullWidth` stretches it. `swatchesPerRow` sets the swatch grid (7).
- **Text:** it's an InputWrapper: `label`, `labelSection`, `description`, `error`, `withAsterisk`, `id`.

## Props

Other props are passed to the InputWrapper root.

| Prop                                                                          | Type                                                    | Default                       | Description                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------- | ------------------------------------------------ |
| `value`                                                                       | `string`                                                | —                             | The color, controlled.                           |
| `defaultValue`                                                                | `string`                                                | `'#000000'`                   | The starting color, uncontrolled.                |
| `onChange`                                                                    | `(value: string) => void`                               | —                             | Called on every step, in `format`.               |
| `onChangeEnd`                                                                 | `(value: string) => void`                               | —                             | Called when the user lets go.                    |
| `format`                                                                      | `'hex' \| 'hexa' \| 'rgb' \| 'rgba' \| 'hsl' \| 'hsla'` | `'hex'`                       | The format reported; alpha formats add a slider. |
| `swatches`                                                                    | `string[]`                                              | —                             | Colors to pick with one click.                   |
| `swatchesPerRow`                                                              | `number`                                                | `7`                           | Swatches per row.                                |
| `fullWidth`                                                                   | `boolean`                                               | `false`                       | Stretches the panel.                             |
| `disabled`                                                                    | `boolean`                                               | `false`                       | Disables it.                                     |
| `saturationLabel`                                                             | `string`                                                | `'Saturation and brightness'` | The area's accessible name.                      |
| `hueLabel`                                                                    | `string`                                                | `'Hue'`                       | The hue slider's accessible name.                |
| `alphaLabel`                                                                  | `string`                                                | `'Alpha'`                     | The alpha slider's accessible name.              |
| `label`, `labelSection`, `description`, `error`, `withAsterisk`, `size`, `id` | —                                                       | —                             | InputWrapper's.                                  |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-color-picker`, plus `.slp-input-wrapper`, with `data-full-width` and `data-disabled`.
- Slots: `color-picker-body`, `color-picker-saturation`, `color-picker-hue`, `color-picker-alpha`, `color-picker-thumb`, `color-picker-preview`, `color-picker-swatches`, `color-picker-swatch`.
