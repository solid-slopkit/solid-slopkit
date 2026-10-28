# Skeleton

A placeholder for content that is loading: a `div`. Around children, it takes their size and hides them until `visible` is false; without children, size it with `style`.

```tsx
import { Skeleton } from '@solid-slopkit/components';
```

## Usage

```tsx
// Shaped like what will load:
<Stack gap={2} aria-busy={loading()}>
  <Skeleton circle style={{ width: '2.5rem', height: '2.5rem' }} />
  <Skeleton style={{ height: '0.75rem', width: '60%' }} />
  <Skeleton style={{ height: '0.75rem' }} />
</Stack>

// Around the real content, which keeps its size and shows when loading ends:
<Skeleton visible={loading()}>
  <Text>{profile()?.bio}</Text>
</Skeleton>
```

- **Element:** a `div`, a block. Without children it has no height: give it one with `style`, and a width if it shouldn't fill the line.
- **Around content:** while `visible`, the children keep their size but are hidden, so the placeholder has the shape of what's coming and nothing moves when it arrives. With `visible={false}`, the children show and the Skeleton is a plain `div`.
- **Circle:** `circle` rounds it, for an avatar or an icon.
- **Animation:** a shimmer sweeps across while visible. `animate={false}` keeps it still, and so does the user's reduced-motion setting.
- **Accessibility:** while visible, a Skeleton is hidden from assistive technology, and the content inside it can't be focused. Mark the region that's loading with `aria-busy="true"`, and announce the result if it matters.
- Skeleton has no margin. Its color follows the base text color, so it works in both color schemes and on any surface.

## Props

Other props are passed to the `div`.

| Prop      | Type      | Default | Description                                             |
| --------- | --------- | ------- | ------------------------------------------------------- |
| `visible` | `boolean` | `true`  | Shows the placeholder. With `false`, the children show. |
| `animate` | `boolean` | `true`  | Sweeps a shimmer across the placeholder.                |
| `circle`  | `boolean` | `false` | Rounds the placeholder into a circle.                   |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-skeleton`. No slots.
- State and variant attributes on the root: `data-visible`, `data-animate`, `data-circle`.
- The shimmer is the root's `::after`. Corners are 6px: `.slp-skeleton { border-radius: 2px }` changes them.
