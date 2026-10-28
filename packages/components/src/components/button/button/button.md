# Button

Triggers an action. Its look comes entirely from theme tokens.

```tsx
import { Button } from '@solid-slopkit/components';
```

## Usage

```tsx
<Button color="primary">Save</Button>
<Button color="primary" variant="outline">Cancel</Button>
<Button variant="ghost" shape="square" aria-label="Add"><Plus /></Button>
```

- **Variants:** `solid` is the default. `soft`, `outline` and `dash` switch to the solid look on hover and focus. The `outline` and `dash` borders are a faded text color: half the accent with a `color`, a fifth of the text color without one. `ghost` only gets a light tint. `link` looks like a link.
- **Colors:** `color` takes a color role. Without it the button uses the base surface colors. Every variant works with every color.
- **Sizes:** `xs` to `xl`. Heights are multiples of `--slp-size-field`, so a theme can make every control denser or roomier at once.
- **Shapes:** `square` and `circle` are fixed-width, for a single icon. Give them an `aria-label`.
- **Sections:** `leftSection` and `rightSection` place content, usually icons, around the label. Icons are sized to match the button.

```tsx
<Button leftSection={<Download />}>Download</Button>
<Button color="primary" rightSection={<ArrowRight />}>Continue</Button>
```

- **Loading:** `loading` shows a spinner over the content and blocks interaction, but keeps the colors. Sets `aria-busy`.
- **Active:** `active` forces the pressed look, for toggle buttons. Pair it with `aria-pressed`.

```tsx
const [bold, setBold] = createSignal(false);

<Button
  variant="ghost"
  shape="square"
  active={bold()}
  aria-label="Bold"
  aria-pressed={bold() ? 'true' : 'false'}
  onClick={() => setBold((value) => !value)}
>
  <Bold />
</Button>;
```

- **Polymorphic:** `as` renders another element. A link with `href` stays a link. Other elements get `role="button"`, a tab stop, and a button's keys: Enter presses on key down, Space on key up. `disabled` becomes `aria-disabled` on them, and they then ignore clicks and keys.

```tsx
<Button as="a" href="/settings">
  Settings
</Button>
```

## Props

Other props are passed to the rendered element.

| Prop           | Type                                                                                               | Default     | Description                                               |
| -------------- | -------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------- |
| `variant`      | `'solid' \| 'soft' \| 'outline' \| 'dash' \| 'ghost' \| 'link'`                                    | `'solid'`   | Visual style.                                             |
| `color`        | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | —           | Color role. Base colors when omitted.                     |
| `size`         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                                                             | `'md'`      | Size.                                                     |
| `shape`        | `'default' \| 'square' \| 'circle'`                                                                | `'default'` | Square and circle are fixed-width, for icon-only buttons. |
| `fullWidth`    | `boolean`                                                                                          | `false`     | Fills the container width.                                |
| `active`       | `boolean`                                                                                          | `false`     | Forces the pressed look.                                  |
| `loading`      | `boolean`                                                                                          | `false`     | Shows a spinner and blocks interaction.                   |
| `disabled`     | `boolean`                                                                                          | `false`     | Disables the button.                                      |
| `leftSection`  | `JSX.Element`                                                                                      | —           | Content before the label.                                 |
| `rightSection` | `JSX.Element`                                                                                      | —           | Content after the label.                                  |
| `as`           | `ValidComponent`                                                                                   | `'button'`  | Element or component to render.                           |
| `type`         | `string`                                                                                           | `'button'`  | Native type. Only applied to buttons and inputs.          |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-button`.
- No slots: Button renders no inner elements of its own. Sections and the label are direct children.
- State and variant attributes on the root: `data-variant`, `data-color`, `data-size`, `data-shape`, `data-disabled`, `data-loading`, `data-pressed`, `data-full-width`, `data-with-left-section`, `data-with-right-section`.

CSS variables, set on the button or any ancestor. A value that maps to one declaration, such as the corner radius, has no variable: use a selector (`.slp-button { border-radius: 0 }`).

| Variable               | Default                            | Description                                                                                                                         |
| ---------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `--slp-button-color`   | `var(--slp-color-<color>)`         | Accent color: the background for solid, text and border for the other variants. Use it for a one-off color that isn't a color role. |
| `--slp-button-content` | `var(--slp-color-<color>-content)` | Text color on a solid accent background.                                                                                            |

```tsx
<Button style={{ '--slp-button-color': '#7048e8', '--slp-button-content': '#fff' }}>Brand color</Button>
```
