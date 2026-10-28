# Space

Empty space between elements, for one-off gaps where a margin or a `Stack` would be awkward.

```tsx
import { Space } from '@solid-slopkit/components';
```

## Usage

```tsx
<Box>First block</Box>
<Space h={8} />
<Box>Second block</Box>

<Flex>
  <Box>First</Box>
  <Space w={{ base: 2, md: 12 }} />
  <Box>Second</Box>
</Flex>
```

- **Vertical:** `h` adds space between blocks.
- **Horizontal:** `w` adds space in a row. Space never shrinks in a flex container (`flex-shrink: 0`).
- **Values:** spacing units (`4` is `calc(var(--slp-spacing) * 4)`, 1rem by default) or any CSS length, like Box's `w` and `h`.
- **Style props:** only `w` and `h`, which take a value per breakpoint. See [style props](../box/box.md#style-props). Space takes no other style props.

## Props

Other props are passed to the rendered `div`.

| Prop | Type                                | Default | Description                            |
| ---- | ----------------------------------- | ------- | -------------------------------------- |
| `h`  | `ResponsiveValue<number \| string>` | —       | Height: spacing units or a CSS length. |
| `w`  | `ResponsiveValue<number \| string>` | —       | Width: spacing units or a CSS length.  |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-space`.
