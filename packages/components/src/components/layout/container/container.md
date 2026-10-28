# Container

Centers its content horizontally, with a max width and inline padding. Wrap a page, or each full-width section of one, so content lines up on the same edges and never touches the screen edge.

```tsx
import { Container } from '@solid-slopkit/components';
```

## Usage

```tsx
<Container>…</Container>
<Container size="lg">…</Container>
<Container size="30rem">…</Container>
<Container fluid>…</Container>
```

- **Size:** a preset from `xs` to `xl`, spacing units, or any CSS length. It sets `max-width` and is the outer width, padding included. The default is `md`. `size` is not responsive.
- **Fluid:** `fluid` drops the max width and keeps the padding.
- **Width:** the container is `width: 100%` with auto inline margins, so it also fills its parent up to the max width inside a flex container.
- **Style props:** only `size`. Container does not take Box's spacing, size or display props.

## Props

Other props are passed to the rendered `div`.

| Prop    | Type                                                       | Default | Description                                          |
| ------- | ---------------------------------------------------------- | ------- | ---------------------------------------------------- |
| `size`  | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| number \| string` | `'md'`  | Max width: a preset, spacing units, or a CSS length. |
| `fluid` | `boolean`                                                  | `false` | Full width, ignoring `size`. The padding stays.      |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-container`.

CSS variables. The presets are set on `:root` in `slopkit.css`; override them there or in a theme to change every container. `--slp-container-padding` is a theme token too, and can also be set on a container or any ancestor.

| Variable                  | Default                        | Description                    |
| ------------------------- | ------------------------------ | ------------------------------ |
| `--slp-container-size-xs` | `33.75rem`                     | Width of `size="xs"` (540px).  |
| `--slp-container-size-sm` | `45rem`                        | Width of `size="sm"` (720px).  |
| `--slp-container-size-md` | `60rem`                        | Width of `size="md"` (960px).  |
| `--slp-container-size-lg` | `71.25rem`                     | Width of `size="lg"` (1140px). |
| `--slp-container-size-xl` | `82.5rem`                      | Width of `size="xl"` (1320px). |
| `--slp-container-padding` | `calc(var(--slp-spacing) * 4)` | Inline padding.                |

```tsx
<Container style={{ '--slp-container-padding': '0' }}>…</Container>
```
