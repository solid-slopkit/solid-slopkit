# Loader

Shows that something is loading: a `span` with `role="status"`, animated as a spinner, dots or bars.

```tsx
import { Loader } from '@solid-slopkit/components';
```

## Usage

```tsx
<Loader />
<Loader variant="dots" color="primary" size="lg" label="Loading results" />

<Text>
  Saving <Loader />
</Text>
```

- **Element:** a `span` with `role="status"`, named by `label` (`Loading` by default), so assistive technology announces it. Translate the label with the rest of your strings.
- **Variants:** `spinner` (the default), a turning ring with one side clear; `dots`, three dots that rise and fall in turn; `bars`, three bars that stretch in turn.
- **Size:** without `size`, a Loader is 1em, so it matches the text around it. `size` from `xs` to `xl` fixes it at 16, 20, 28, 36 or 48px.
- **Color:** without `color`, it takes the current text color. `color` takes a color role.
- **Reduced motion:** when the user asks for it, the spinner turns slowly and dots and bars pulse in place, so the loader still shows activity.
- Inside something that already says it's busy, such as a region with `aria-busy="true"`, pass `aria-hidden="true"` so it isn't announced twice.

## Props

Other props are passed to the `span`.

| Prop      | Type                                                                                               | Default     | Description                                      |
| --------- | -------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| `variant` | `'spinner' \| 'dots' \| 'bars'`                                                                    | `'spinner'` | Shape of the animation.                          |
| `size`    | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | —           | Fixed size. 1em, following the text, if omitted. |
| `color`   | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | —           | Color role. The current text color if omitted.   |
| `label`   | `string`                                                                                           | `'Loading'` | The accessible name.                             |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-loader`.
- Slots: `[data-slot="loader-part"]`, the three dots or bars. The spinner has none: it's the root's border.
- State and variant attributes on the root: `data-variant`, `data-size`, `data-color`.

CSS variables, set on the loader or any ancestor:

| Variable             | Default                                       | Description                                  |
| -------------------- | --------------------------------------------- | -------------------------------------------- |
| `--slp-loader-color` | `var(--slp-color-<color>)`, or the text color | Loader color. For a color that isn't a role. |
