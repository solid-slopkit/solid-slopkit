# Flex

A `div` that is a flex container, with responsive flex style props. For spacing and size, nest it in or around a [Box](../box/box.md).

```tsx
import { Flex } from '@solid-slopkit/components';
```

## Usage

```tsx
<Flex gap={2}>
  <Box p={2}>a</Box>
  <Box p={2}>b</Box>
</Flex>
<Flex justify="space-between" align="center">…</Flex>
<Flex wrap="wrap" gap={2} rowGap={4}>…</Flex>
```

- **Flex props:** `direction`, `wrap`, `align` (`align-items`), `justify` (`justify-content`), `gap`, `rowGap` and `columnGap`. Gaps are in spacing units, and `rowGap` / `columnGap` win over `gap`. Without props, Flex is a plain `display: flex` row.
- **Responsive:** every prop takes a value or a breakpoint object. See [Style props](../box/box.md#style-props).

```tsx
<Flex direction={{ base: 'column', sm: 'row' }} gap={{ base: 2, md: 4 }}>
  …
</Flex>
```

- **Display:** Flex is `display: flex` unless `display` says otherwise: `'inline-flex'`, or `'none'` to hide it at some breakpoints.

```tsx
<Flex display={{ base: 'none', sm: 'flex' }} gap={2}>
  Hidden below sm
</Flex>
```

- **No spacing or size props:** Flex doesn't take `p`, `m`, `w` and the like. Wrap it in a Box, or put a Box inside.
- For a fixed column or row with a default gap, [Stack](../stack/stack.md) and [Group](../group/group.md) are shorter. Use Flex when the layout changes per breakpoint.
- Must be rendered inside `<SlopkitUi>`.

## Props

Other props are passed to the `div`.

| Prop        | Type                                                                      | Default  | Description                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `direction` | `ResponsiveValue<'row' \| 'column' \| 'row-reverse' \| 'column-reverse'>` | —        | `flex-direction`.                                                                                                                                                                  |
| `wrap`      | `ResponsiveValue<'nowrap' \| 'wrap' \| 'wrap-reverse'>`                   | —        | `flex-wrap`.                                                                                                                                                                       |
| `align`     | `ResponsiveValue<FlexAlign>`                                              | —        | `align-items`. `'normal' \| 'stretch' \| 'center' \| 'start' \| 'end' \| 'flex-start' \| 'flex-end' \| 'baseline'` or any CSS string.                                              |
| `justify`   | `ResponsiveValue<FlexJustify>`                                            | —        | `justify-content`. `'normal' \| 'start' \| 'end' \| 'center' \| 'flex-start' \| 'flex-end' \| 'space-between' \| 'space-around' \| 'space-evenly' \| 'stretch'` or any CSS string. |
| `gap`       | `ResponsiveValue<number>`                                                 | —        | `row-gap` and `column-gap`, in spacing units.                                                                                                                                      |
| `rowGap`    | `ResponsiveValue<number>`                                                 | —        | `row-gap`, in spacing units. Wins over `gap`.                                                                                                                                      |
| `columnGap` | `ResponsiveValue<number>`                                                 | —        | `column-gap`, in spacing units. Wins over `gap`.                                                                                                                                   |
| `display`   | `ResponsiveValue<'flex' \| 'inline-flex' \| 'none'>`                      | `'flex'` | Overrides `display: flex`.                                                                                                                                                         |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-flex`. Stack, Group and Center render a Flex, so they carry it too.
- No data attributes.
