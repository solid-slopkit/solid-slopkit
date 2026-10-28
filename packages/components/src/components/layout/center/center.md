# Center

Centers its content horizontally and vertically: a [Flex](../flex/flex.md) with `align` and `justify` set to `center`.

```tsx
import { Center } from '@solid-slopkit/components';
```

## Usage

```tsx
<Center style={{ height: '8rem' }}>
  <Box p={2}>Centered both ways</Box>
</Center>
```

- **Size:** Center only centers. Give it a size with `style`, `class` or a parent; it takes no `w`/`h` props.
- **Inline:** `inline` makes it `inline-flex`, for centering an icon or a badge inside a line of text.

```tsx
<p>
  Text with an{' '}
  <Center inline style={{ width: '1.5rem', height: '1.5rem' }}>
    ★
  </Center>{' '}
  inline Center in it.
</p>
```

- Must be rendered inside `<SlopkitUi>`.

## Props

Other props are passed to the `div`.

| Prop     | Type      | Default | Description                           |
| -------- | --------- | ------- | ------------------------------------- |
| `inline` | `boolean` | `false` | Uses `inline-flex` instead of `flex`. |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-center`, plus `.slp-flex`.
- No data attributes.
