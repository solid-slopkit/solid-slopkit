# TimeInput

A labelled field for a time of day: the browser's time input in an [Input](../../components/inputs/input/input.md)'s box. For a time written by the provider's locale, with a dropdown, use [TimePicker](../time-picker/time-picker.md).

```tsx
import { TimeInput } from '@solid-slopkit/components/dates';
```

## Usage

```tsx
const [time, setTime] = createSignal('09:30');
<TimeInput label="Start" value={time()} onChange={setTime} minTime="08:00" maxTime="18:00" />;

<TimeInput label="Exact" withSeconds name="exact" />;
```

- **Value:** a string, `HH:mm` in 24 hours, or `HH:mm:ss` with `withSeconds`; `''` for none. Uncontrolled with `defaultValue` (read once, default `''`) or controlled with `value`. `onChange(value)` runs on each change; while the time is incomplete it's `''`.
- **The browser's field:** the browser writes the time by the user's settings (12 or 24 hours), lets each part be typed or stepped with the arrow keys, and may offer its own picker. It doesn't follow the provider's `locale`.
- **Seconds:** `withSeconds` adds them (the input's `step` is 1 second, else 60).
- **Limits:** `minTime` and `maxTime` (`HH:mm` or `HH:mm:ss`) become the input's `min` and `max`. A time outside them makes the input invalid (`:invalid`, `validity.rangeUnderflow`/`rangeOverflow`), so a form won't submit it; the field still takes it.
- **Field:** an `input type="time"`. Other props, such as `name`, `required` or `onBlur`, go to it, so `name` submits `HH:mm`.
- **Label and texts:** `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput. `variant`, the sections, `disabled` and `readOnly` as on Input.
- `class` and `style` go to the root (with the label and texts).

## Props

| Prop           | Type                             | Default     | Description                                       |
| -------------- | -------------------------------- | ----------- | ------------------------------------------------- |
| `value`        | `string`                         | —           | The time, when controlled: `HH:mm` or `HH:mm:ss`. |
| `defaultValue` | `string`                         | `''`        | The time at first, when uncontrolled.             |
| `onChange`     | `(value: string) => void`        | —           | Called with the time on each change.              |
| `withSeconds`  | `boolean`                        | `false`     | Adds the seconds.                                 |
| `minTime`      | `string`                         | —           | The earliest time.                                |
| `maxTime`      | `string`                         | —           | The latest time.                                  |
| `variant`      | `'outline' \| 'soft' \| 'ghost'` | `'outline'` | The box's look.                                   |
| `leftSection`  | `JSX.Element`                    | —           | Content before the time.                          |
| `rightSection` | `JSX.Element`                    | —           | Content after the time.                           |
| `disabled`     | `boolean`                        | `false`     | Disables the field.                               |
| `readOnly`     | `boolean`                        | `false`     | Shows the time without letting it change.         |

Plus `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins. The root class is `.slp-time-input`; the field box is an `.slp-input`, styled as Input's.
