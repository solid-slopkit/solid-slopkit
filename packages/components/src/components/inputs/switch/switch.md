# Switch

An on/off switch with a label: a native checkbox with `role="switch"`, drawn as a track with a sliding thumb, next to a label, description and error.

```tsx
import { Switch } from '@solid-slopkit/components';
```

## Usage

```tsx
const [wifi, setWifi] = createSignal(true);

<Switch label="Wi-Fi" description="Join known networks." checked={wifi()} onChange={setWifi} />

<Switch.Group label="Notifications" value={channels()} onChange={setChannels}>
  <Stack gap={2}>
    <Switch value="email" label="Email" />
    <Switch value="sms" label="Text message" />
  </Stack>
</Switch.Group>
```

- **When:** a switch is for a setting that takes effect at once, like a light switch. For a choice that's only applied when a form is sent, use a Checkbox.
- **State:** controlled with `checked` and `onChange`, which gets the new `boolean`; a flip the parent doesn't apply is undone. Uncontrolled, it starts at `defaultChecked`.
- **Screen readers** say "Wi-Fi, switch, on" or "off": the role is `switch`, the state is the checkbox's.
- **Text:** `label` next to the track (`labelPosition="left"` puts it before), `description` and `error` under it. With the label on the left, the text fills the row and the switch sits at its end, as in a settings list; to keep the two together, give the Switch a narrower parent or `width: fit-content`. A click on the label flips it. `error` describes it and marks it invalid.
- **Look:** `color` takes a color role (`primary` by default) for the track when on; the thumb then takes the role's content color. `size` (`xs` to `xl`) sizes the track and text. The thumb slides over 0.15s, at once with reduced motion.
- **Forms:** `name` and `value` are the input's: a switch that's on submits `value` (or `on`).
- **Props:** `class` and `style` go to the root; every other prop goes to the `input`.

## Switch.Group

A labelled group with one value: the array of the `value`s of the switches that are on, in the order they were turned on. It works like Checkbox.Group: `value`, `defaultValue`, `onChange`, `name`, `disabled`, and InputWrapper's `label`, `labelSection`, `description`, `error`, `withAsterisk`, `size`. The switches sit in a `role="group"` named by the label; lay them out yourself.

## Props

### Switch

Other props are passed to the `input`.

| Prop             | Type                                                                                               | Default         | Description                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------- |
| `checked`        | `boolean`                                                                                          | —               | Whether it's on, controlled.                                        |
| `defaultChecked` | `boolean`                                                                                          | `false`         | Whether it starts on, uncontrolled.                                 |
| `onChange`       | `(checked: boolean) => void`                                                                       | —               | Called with the new state.                                          |
| `label`          | `JSX.Element`                                                                                      | —               | The label next to the track.                                        |
| `description`    | `JSX.Element`                                                                                      | —               | Help text under the label.                                          |
| `error`          | `JSX.Element`                                                                                      | —               | Error message; marks it invalid.                                    |
| `value`          | `string`                                                                                           | —               | Submitted when on; the key in a group.                              |
| `size`           | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | group's, `'md'` | Size of the track and text.                                         |
| `color`          | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'`     | Color of the track when on.                                         |
| `labelPosition`  | `'right' \| 'left'`                                                                                | `'right'`       | Which side the label goes; `left` puts the switch at the row's end. |
| `disabled`       | `boolean`                                                                                          | `false`         | Disables it.                                                        |

### Switch.Group

Other props are passed to the InputWrapper root.

| Prop                                                                          | Type                        | Default | Description                               |
| ----------------------------------------------------------------------------- | --------------------------- | ------- | ----------------------------------------- |
| `value`                                                                       | `string[]`                  | —       | The `value`s of the switches that are on. |
| `defaultValue`                                                                | `string[]`                  | `[]`    | The ones on at first, uncontrolled.       |
| `onChange`                                                                    | `(value: string[]) => void` | —       | Called with the new values.               |
| `name`                                                                        | `string`                    | —       | The `name` of every switch.               |
| `disabled`                                                                    | `boolean`                   | `false` | Disables every switch.                    |
| `label`, `labelSection`, `description`, `error`, `withAsterisk`, `size`, `id` | —                           | —       | InputWrapper's.                           |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- **Switch:** root class `.slp-switch`. Slots: `switch-control`, `switch-track` (the input), `switch-thumb`, `switch-text`, `switch-label`, `switch-description`, `switch-error`. Attributes: `data-checked`, `data-disabled`, `data-invalid`, `data-size`, `data-color`, `data-label-position`.
- **Switch.Group:** root classes `.slp-switch-group` and `.slp-input-wrapper`; the switches are in `[data-slot="switch-group-items"]`.

CSS variables, set on a switch or any ancestor:

| Variable               | Default                            | Description        |
| ---------------------- | ---------------------------------- | ------------------ |
| `--slp-switch-color`   | `var(--slp-color-<color>)`         | The track when on. |
| `--slp-switch-content` | `var(--slp-color-<color>-content)` | The thumb when on. |
