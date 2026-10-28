# PasswordInput

A labelled password field: a [TextInput](../text-input/text-input.md) with a toggle that shows the password as text.

```tsx
import { PasswordInput } from '@solid-slopkit/components';
```

## Usage

```tsx
<PasswordInput label="Password" autocomplete="current-password" />

<PasswordInput label="New password" description="At least 12 characters." autocomplete="new-password" />
```

- **Toggle:** a button in the right section shows the password as text and hides it again. It's named "Show password" and its state is `aria-pressed`, so screen readers say "Show password, toggle button, pressed" while it's shown. Rename it with `toggleLabel`. It's a tab stop after the field; pressing it doesn't clear what was typed.
- **Visibility:** uncontrolled, it starts hidden, or shown with `defaultVisible`. Controlled, `visible` decides and `onVisibilityChange` gets the new state on each press, e.g. to show two fields together.
- **Autocomplete:** pass `autocomplete="current-password"` on a sign-in form and `"new-password"` on a sign-up or change form, so password managers fill or suggest the right thing.
- **Props are split** like TextInput's. There's no `type` (it's `password`, or `text` while shown) and no `rightSection` (the toggle is there); `leftSection` works.
- `disabled` disables the toggle too.

## Props

Other props are passed to the `input`. The wrapper's props (`label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size`, `id`, `class`, `style`) are TextInput's.

| Prop                 | Type                             | Default           | Description                             |
| -------------------- | -------------------------------- | ----------------- | --------------------------------------- |
| `visible`            | `boolean`                        | —                 | Whether it shows as text, controlled.   |
| `defaultVisible`     | `boolean`                        | `false`           | Whether it starts shown, uncontrolled.  |
| `onVisibilityChange` | `(visible: boolean) => void`     | —                 | Called with the new state when toggled. |
| `toggleLabel`        | `string`                         | `'Show password'` | Accessible name of the toggle.          |
| `variant`            | `'outline' \| 'soft' \| 'ghost'` | `'outline'`       | Visual style of the box.                |
| `leftSection`        | `JSX.Element`                    | —                 | Content before the input.               |
| `disabled`           | `boolean`                        | `false`           | Disables the input and the toggle.      |
| `readOnly`           | `boolean`                        | `false`           | Makes the input read-only.              |
| `ref`                | `Ref<HTMLElement>`               | —                 | The `input`.                            |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-password-input`, plus `.slp-input-wrapper`. The box inside is an Input.
- Slots: `[data-slot="password-input-toggle"]`, inside the Input's right section.
- The input has `data-visible` while the password is shown.
