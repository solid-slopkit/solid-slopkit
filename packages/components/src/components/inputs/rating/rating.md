# Rating

A star rating. Choosing, it's a `radiogroup` of hidden native radios, one per star or part of a star, so the arrow keys move it; read-only, it's the stars as one image.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Pointer** and **Keyboard** below.

```tsx
import { Rating } from '@solid-slopkit/components';
```

## Usage

```tsx
<Rating label="Your rating" value={rating()} onChange={setRating} />

<Rating label="Half stars" fractions={2} defaultValue={3.5} />

<Rating readOnly value={product.average} />
```

- **Value:** a number from 0 (none) to `count` (5 by default). Controlled with `value` and `onChange` (passing `value` at all makes it controlled, and a choice the parent doesn't apply is undone), or uncontrolled with `defaultValue`.
- **Parts:** `fractions={2}` lets the left and right halves of a star be chosen (3.5); `fractions={4}`, quarters. Each part is its own radio.
- **Pointer:** hovering previews the rating under the pointer; leaving shows the value again. `allowClear` lets a click on the current rating set it back to 0.
- **Keyboard:** Tab reaches the chosen star (or the first), and the arrow keys move the rating one part at a time.
- **Names:** each radio is named by its value, `1 star`, `2.5 stars`; change it with `itemLabel`. The group is named by `label` or `aria-label`.
- **Read-only:** `readOnly` (read once) draws the stars without radios, as `role="img"` named `Rated 4.3 out of 5` (change it with `readOnlyLabel`, or name it with `aria-label`). Any value draws: 4.3 fills 30% of the fifth star.
- **Look:** `color` takes a color role for the filled stars, `warning` by default. `size` from `xs` (1rem stars) to `xl` (2.5rem).
- **Forms:** the radios share a `name` (generated unless you pass one), so the chosen value is submitted.
- **Text:** it's an InputWrapper: `label`, `labelSection`, `description`, `error`, `size`.

## Props

Other props are passed to the InputWrapper root.

| Prop                                                                                        | Type                                                                                               | Default               | Description                                   |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------- | --------------------------------------------- |
| `value`                                                                                     | `number`                                                                                           | —                     | The rating, controlled; 0 is none.            |
| `defaultValue`                                                                              | `number`                                                                                           | `0`                   | The starting rating, uncontrolled.            |
| `onChange`                                                                                  | `(value: number) => void`                                                                          | —                     | Called with the new rating.                   |
| `count`                                                                                     | `number`                                                                                           | `5`                   | How many stars.                               |
| `fractions`                                                                                 | `number`                                                                                           | `1`                   | Parts of a star that can be chosen.           |
| `readOnly`                                                                                  | `boolean`                                                                                          | `false`               | Shows the rating as an image. Read once.      |
| `allowClear`                                                                                | `boolean`                                                                                          | `false`               | Choosing the current rating clears it.        |
| `color`                                                                                     | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'warning'`           | Color of the filled stars.                    |
| `name`                                                                                      | `string`                                                                                           | generated             | The radios' `name`.                           |
| `disabled`                                                                                  | `boolean`                                                                                          | `false`               | Disables it.                                  |
| `itemLabel`                                                                                 | `(value: number) => string`                                                                        | `1 star`, `2.5 stars` | Each radio's accessible name.                 |
| `readOnlyLabel`                                                                             | `(value: number, count: number) => string`                                                         | `Rated 4.3 out of 5`  | The read-only image's accessible name.        |
| `label`, `labelSection`, `description`, `error`, `withAsterisk`, `size`, `id`, `aria-label` | —                                                                                                  | —                     | InputWrapper's; `aria-label` names the stars. |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-rating`, plus `.slp-input-wrapper`, with `data-color`, `data-read-only` and `data-disabled`.
- Slots: `[data-slot="rating-stars"]` (the group or image), `[data-slot="rating-item"]` (a star with its radios), `[data-slot="rating-star"]` (with `data-filled`: empty, `partial`, or full), `[data-slot="rating-input"]`.

CSS variables, set on the rating or any ancestor:

| Variable             | Default                    | Description       |
| -------------------- | -------------------------- | ----------------- |
| `--slp-rating-color` | `var(--slp-color-<color>)` | The filled stars. |
