# CloseButton

A square ghost [Button](../button/button.md) with an X icon, for closing or dismissing what it sits in.

```tsx
import { CloseButton } from '@solid-slopkit/components';
```

## Usage

```tsx
<CloseButton onClick={() => setOpen(false)} />
<CloseButton size="sm" label="Remove filter" onClick={removeFilter} />
<CloseButton label="Clear search">
  <Eraser aria-hidden="true" />
</CloseButton>
```

- **Name:** the button is named `'Close'` for screen readers, through `aria-label`. Pass `label` for a name that says what closes or goes away ("Remove filter", "Dismiss message"). The name is an attribute, not text, so a close button inside a live region (an Alert, a Notification) isn't read out with the message.
- **Look:** Button's `ghost` variant and `square` shape: no background until it's hovered or focused, then a light tint. Without `color`, the icon takes the color of the text around it, so it fits on any surface, including a solid one. With `color`, the icon and the tint take the role.
- **Size:** `xs` to `xl`, the same heights as Button, so it lines up with buttons and inputs of the same size. Defaults to `md`.
- **Icon:** the built-in X is an inline SVG that Button sizes. Children replace it, for an icon from your own set; mark it `aria-hidden="true"`.
- **Behavior:** a native `button` with `type="button"`, so it never submits a form by accident. It takes Button's keyboard behavior, focus ring and `disabled`.
- Alert and Notification render one for you when you pass `onClose`.
- For other icon-only actions, use [ActionIcon](../action-icon/action-icon.md).

## Props

Other props, such as `onClick`, are passed to the `button`.

| Prop       | Type                                                                                               | Default    | Description                                                       |
| ---------- | -------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| `label`    | `string`                                                                                           | `'Close'`  | Accessible name.                                                  |
| `size`     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | `'md'`     | Size.                                                             |
| `color`    | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | —          | Color role of the icon and the tint. The text color when omitted. |
| `disabled` | `boolean`                                                                                          | `false`    | Disables the button.                                              |
| `type`     | `'button' \| 'submit' \| 'reset'`                                                                  | `'button'` | Native type.                                                      |
| `children` | `JSX.Element`                                                                                      | an X       | Replaces the icon.                                                |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-close-button`, plus `.slp-button`. The root takes Button's attributes (`data-variant="ghost"`, `data-shape="square"`, `data-size`, `data-color`, `data-disabled`) and its CSS variables (`--slp-button-color`).
- Slots: `[data-slot="close-button-icon"]`, the built-in X. An icon passed as children has no slot.
