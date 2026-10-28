---
name: slopkit-theming
description: Theme @solid-slopkit/components apps — change the default look, write a new theme, scope a theme to part of the page, add a light/dark toggle, and customize one component with CSS. Use when changing colors, control sizes or fonts, or adding dark mode.
---

# Theming and color scheme in @solid-slopkit/components

Everything visual in this library comes from CSS custom properties, the **tokens** (`--slp-*`). Components only read tokens, so a theme is just CSS that sets them. There is no JS theme object and nothing to pass to the provider. The light/dark **color scheme** is separate from the theme: a theme supplies values for one or both schemes, and the user's preference picks between them.

Component references (props, selectors, CSS variables) are in `node_modules/@solid-slopkit/components/dist/source/llms.md`.

## Setup

```tsx
import { SlopkitUi } from '@solid-slopkit/components';
import '@solid-slopkit/components/styles/slopkit.css'; // layers, palettes, base styles, color scheme
import '@solid-slopkit/components/styles/default-theme.css'; // the default theme, light and dark
import './theme.css'; // your overrides and themes, after the two above

export function Root() {
  return <SlopkitUi>{/* app */}</SlopkitUi>;
}
```

The stylesheets declare these cascade layers, in order: `slopkit.reset`, `slopkit.base`, `slopkit.themes`, `slopkit.components`, `slopkit.utilities`. Unlayered CSS beats every layer whatever its specificity, so your own rules always win without `!important`.

## The tokens

| Token                                  | What it is                                                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `--slp-color-base-100`, `-200`, `-300` | Surfaces: the page, then slightly darker (light) or lighter (dark) layers.                                     |
| `--slp-color-base-content`             | Text on the base surfaces.                                                                                     |
| `--slp-color-muted`                    | A quiet surface for parts that step back, such as a card footer.                                               |
| `--slp-color-muted-content`            | De-emphasized text (descriptions, `dimmed` Text), readable on `muted` and on every base surface.               |
| `--slp-color-<role>`                   | The eight **color roles**: `primary`, `secondary`, `accent`, `neutral`, `info`, `success`, `warning`, `error`. |
| `--slp-color-<role>-content`           | Text that stays readable on that role's color. Always set it together with the role.                           |
| `--slp-size-field`                     | Unit of control heights (buttons, inputs, tabs, pagination). A medium Button is 8 units tall.                  |
| `--slp-size-selector`                  | Unit of small marks, such as Badge heights.                                                                    |
| `--slp-spacing`                        | Unit of the layout components' spacing props: `p={4}` is 4 units.                                              |
| `--slp-depth`                          | `0` (the default) for flat controls, `1` for a subtle gradient and text shadow on solid buttons.               |
| `--slp-font-family`                    | Body font, and `--slp-font-family-monospace` for keys and code. Set in `slopkit.css`, not in the theme.        |
| `--slp-shadow-xs` … `--slp-shadow-xl`  | Shadows for surfaces and overlays. Set in `slopkit.css`, not in the theme.                                     |
| `--slp-font-size-xs` … `-5xl`          | The type scale components read, each with a `--slp-line-height-<size>`. Set in `slopkit.css`.                  |
| `--slp-heading-size-h1` … `-h6`        | Title sizes, with `--slp-heading-line-height-<order>` and `--slp-heading-weight`. Set in `slopkit.css`.        |
| `--slp-container-size-xs` … `-xl`      | Container max widths, and `--slp-container-padding` for its side padding. Set in `slopkit.css`.                |

A theme sets solid colors only. Components derive soft, outline, hover and pressed tints from each role and its content color with `color-mix()`.

The `color` prop of a component takes a color role and nothing else. There are no palette names or raw colors in props.

There are no radius or border-width tokens: each component owns its corner radius and border width. Change them with a selector on the component (see "Customize one component").

### The default theme's colors

Every role reaches 4.5:1 (WCAG AA) against its content color, and as text on `base-100`, in both schemes; warning as text on a light surface is the one exception. In light the roles are deep shades with white content; in dark they are bright shades with dark content (`#141414`). Warning, a yellow, has the dark content in both. The soft, outline, dash and ghost variants draw the role color as text on the surface, which is why both pairs matter.

## Change the default look

Override tokens in unlayered CSS. Set only what you change; the rest keeps the default theme's values.

```css
:root {
  --slp-color-primary: light-dark(#6741d9, #9775fa);
  --slp-color-primary-content: light-dark(#ffffff, #141414);
  --slp-depth: 1;
}
```

Use `light-dark(<light>, <dark>)` for any color that should differ between schemes, as the default theme does. A plain value applies to both.

## Write a named theme

A theme is a rule on `[data-slp-theme="<name>"]`. Put it in the `slopkit.themes` layer, after the default theme's import, and set `data-slp-theme` on `<html>` for the whole page or on any element for a subtree. Themes nest: the innermost one wins for its subtree.

```css
@layer slopkit.themes {
  [data-slp-theme='ocean'] {
    --slp-color-base-100: light-dark(#f8fbff, #0f1a24);
    --slp-color-base-200: light-dark(#eef5fc, #16232f);
    --slp-color-base-300: light-dark(#dce9f5, #1f3040);
    --slp-color-base-content: light-dark(#0f1a24, #d6e6f5);
    --slp-color-muted: light-dark(#eef5fc, #16232f);
    --slp-color-muted-content: light-dark(#4f6375, #8ea4b8);
    --slp-color-primary: light-dark(#1971c2, #4dabf7);
    --slp-color-primary-content: light-dark(#ffffff, #0f1a24);
    /* …every role you want to differ from the default theme */
  }
}
```

```tsx
<section data-slp-theme="ocean">…</section>
```

Tokens the theme leaves out are inherited from the enclosing theme, usually the default one on `:root`.

### Both schemes, or one

- **A theme for both schemes** writes its colors with `light-dark()` and must **not** set `color-scheme`. The user's preference then picks the scheme.
- **A theme for one scheme** writes plain colors and sets `color-scheme: light` or `color-scheme: dark` in its rule. Inside `slopkit.themes` that wins over the preference, so the surfaces, native scrollbars and form controls never disagree. The user's toggle has no effect under it, so disable or hide your toggle while that theme is active.

```css
@layer slopkit.themes {
  [data-slp-theme='paper'] {
    color-scheme: light;
    --slp-color-base-100: #fffdf7;
    /* … */
  }
}
```

Check contrast in each scheme the theme supports: every role against its content color, every role as text on `base-100` (the soft, outline and ghost variants draw it there), `base-content` against each base color and `muted`, and `muted-content` against `muted` and each base color. Aim for 4.5:1, as the default theme does.

## Color scheme

By default the page follows the OS: `slopkit.css` sets `color-scheme: light dark` on `:root`, and `light-dark()` resolves against it with no JS.

`useColorScheme()` gives the user a choice that persists:

```tsx
import { Button, useColorScheme } from '@solid-slopkit/components';

function SchemeToggle() {
  const scheme = useColorScheme();
  return (
    <Button variant="ghost" shape="square" aria-label="Toggle color scheme" onClick={() => scheme.toggleColorScheme()}>
      <MoonIcon class="icon-light" />
      <SunIcon class="icon-dark" />
    </Button>
  );
}
```

- `colorScheme()` is the stored preference (`'light' | 'dark' | 'auto'`), and `resolvedColorScheme()` is the scheme it resolves to. `setColorScheme(p)`, `toggleColorScheme()` and `clearColorScheme()` change it.
- The preference is stored in localStorage (key `slp-color-scheme`, or the provider's `colorSchemeStorageKey`) and applied as `data-slp-color-scheme` on `<html>`. A head script the provider renders applies it before first paint.
- **With SSR, don't render first-paint UI from the accessors.** The server can't read localStorage, so the server render and the hydrating client both use the default, and the accessors catch up after hydration. Pick anything that must be right immediately, like the toggle's icon above, in CSS:

```css
.icon-dark {
  display: none;
}
:root[data-slp-color-scheme='dark'] .icon-light {
  display: none;
}
:root[data-slp-color-scheme='dark'] .icon-dark {
  display: inline;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-slp-color-scheme]) .icon-light {
    display: none;
  }
  :root:not([data-slp-color-scheme]) .icon-dark {
    display: inline;
  }
}
```

- `defaultColorScheme` on `<SlopkitUi>` sets the preference used when nothing is stored (default `'auto'`).
- `data-slp-color-scheme="light"` or `"dark"` on any element forces that scheme for its subtree, for example a dark hero section on a light page.

## Customize one component

Don't add a theme to restyle one component. Write unlayered CSS against its public selectors, which each component's reference lists:

- the root class, e.g. `.slp-button`;
- state and variant attributes on the root, e.g. `[data-variant='outline']`, `[data-size='lg']`;
- public CSS variables for values that feed several declarations, e.g. `--slp-button-color` and `--slp-button-content`.

```css
.slp-button[data-variant='solid'] {
  font-weight: 600;
}

.checkout .slp-button {
  --slp-button-color: var(--slp-teal-9); /* a one-off color that isn't a color role */
  --slp-button-content: #ffffff;
}
```

Per instance, pass `class` or `style`:

```tsx
<Button style={{ '--slp-button-color': '#087f5b', '--slp-button-content': '#fff' }}>Pay</Button>
```

## Palettes

`slopkit.css` defines 14 palettes of 10 shades for your own CSS and themes: `--slp-gray-0` … `--slp-gray-9`, and the same for `dark`, `red`, `pink`, `grape`, `violet`, `indigo`, `blue`, `cyan`, `teal`, `green`, `lime`, `yellow` and `orange`. Components never read them.

```css
:root {
  --slp-color-accent: light-dark(var(--slp-teal-7), var(--slp-teal-4));
}
```

## Mistakes to avoid

- Setting `color-scheme` in a theme that uses `light-dark()`: it pins the scheme and the toggle stops working.
- Setting a role without its `-content` color: text on solid buttons may become unreadable. In dark the default theme's content colors are dark, so a role you darken needs a white content color again.
- Looking for a radius or border token: there is none. Override the component's `border-radius` with a selector.
- Hard-coding colors in component overrides instead of reading tokens: they won't follow the theme or the scheme.
- Importing a theme before `default-theme.css` and setting it on `<html>`: both rules match `<html>` with the same specificity in the same layer, so the later default theme wins. Import your themes after it.
- Reading `resolvedColorScheme()` to render markup that must be correct on first paint in an SSR app.
