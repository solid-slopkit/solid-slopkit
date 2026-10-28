# Box

A `div` with padding, margin, size and display style props. The base of the layout components.

```tsx
import { Box } from '@solid-slopkit/components';
```

## Usage

```tsx
<Box p={4}>Padded by 1rem</Box>
<Box px={8} py={2} mb={4}>Padded and spaced</Box>
<Box w="100%" maw={80} mx="auto">Centered, at most 20rem wide</Box>
<Box p={{ base: 2, sm: 4, lg: 8 }}>Responsive padding</Box>
```

- **Element:** always renders a `div`. There is no `as` prop.
- **Style props:** see [Style props](#style-props) below. Numbers are spacing units, so `p={4}` is 1rem with the default theme.
- **Display:** `display` takes `'none'`, `'block'`, `'inline'`, `'inline-block'`, `'grid'`, `'inline-grid'` or `'contents'`, per breakpoint. For flex layouts use [Flex](../flex/flex.md).

```tsx
<Box display={{ base: 'none', sm: 'block' }}>Hidden below sm</Box>
```

- **Style:** `class` works as on a plain `div`. `style` takes an object with kebab-case keys (`{ 'max-width': '20rem' }`), not a CSS string, like every component's.
- **Provider:** Box must be rendered inside `<SlopkitUi>`, which collects the generated CSS. It throws otherwise.
- Only layout components take style props, and each takes its own set (see [Style props](#style-props)). Other components such as `Button` take none; wrap them in a Box or space them with a Stack or Group.

## Props

Other props are passed to the `div`.

| Prop                                    | Type                                                                                                        | Default | Description                                                                             |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| `p`, `px`, `py`, `pt`, `pr`, `pb`, `pl` | `ResponsiveValue<number>`                                                                                   | —       | Padding, in spacing units.                                                              |
| `m`, `mx`, `my`, `mt`, `mr`, `mb`, `ml` | `ResponsiveValue<number \| 'auto'>`                                                                         | —       | Margin, in spacing units. Negative values pull, `'auto'` centers.                       |
| `w`, `h`, `miw`, `maw`, `mih`, `mah`    | `ResponsiveValue<number \| string>`                                                                         | —       | Width, height and their min/max. Numbers are spacing units, strings are any CSS length. |
| `display`                               | `ResponsiveValue<'none' \| 'block' \| 'inline' \| 'inline-block' \| 'grid' \| 'inline-grid' \| 'contents'>` | —       | CSS `display`.                                                                          |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-box`.
- No data attributes.

## Style props

Style props set one CSS property each. They are resolved at runtime into a generated class (`slp-s-<hash>`) whose CSS is added once by `<SlopkitUi>`, inside `@layer slopkit.components`. Components with the same resolved values share a class. Props are reactive: pass a signal read and the class updates.

### Spacing scale

A number is a multiple of `--slp-spacing` (`0.25rem` by default): `4` becomes `calc(var(--slp-spacing) * 4)`, which is 1rem. `0` becomes `0`. Fractions and negative numbers work the same way.

### Box props

Accepted by Box. Stack, Group and Center don't take these; nest a Box for spacing and size.

| Prop      | CSS property                                                     | Value                                                                                      |
| --------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `p`       | `padding-top`, `padding-right`, `padding-bottom`, `padding-left` | spacing units                                                                              |
| `px`      | `padding-left`, `padding-right`                                  | spacing units                                                                              |
| `py`      | `padding-top`, `padding-bottom`                                  | spacing units                                                                              |
| `pt`      | `padding-top`                                                    | spacing units                                                                              |
| `pr`      | `padding-right`                                                  | spacing units                                                                              |
| `pb`      | `padding-bottom`                                                 | spacing units                                                                              |
| `pl`      | `padding-left`                                                   | spacing units                                                                              |
| `m`       | `margin-top`, `margin-right`, `margin-bottom`, `margin-left`     | spacing units or `'auto'`                                                                  |
| `mx`      | `margin-left`, `margin-right`                                    | spacing units or `'auto'`                                                                  |
| `my`      | `margin-top`, `margin-bottom`                                    | spacing units or `'auto'`                                                                  |
| `mt`      | `margin-top`                                                     | spacing units or `'auto'`                                                                  |
| `mr`      | `margin-right`                                                   | spacing units or `'auto'`                                                                  |
| `mb`      | `margin-bottom`                                                  | spacing units or `'auto'`                                                                  |
| `ml`      | `margin-left`                                                    | spacing units or `'auto'`                                                                  |
| `w`       | `width`                                                          | spacing units or a CSS string                                                              |
| `h`       | `height`                                                         | spacing units or a CSS string                                                              |
| `miw`     | `min-width`                                                      | spacing units or a CSS string                                                              |
| `maw`     | `max-width`                                                      | spacing units or a CSS string                                                              |
| `mih`     | `min-height`                                                     | spacing units or a CSS string                                                              |
| `mah`     | `max-height`                                                     | spacing units or a CSS string                                                              |
| `display` | `display`                                                        | `'none' \| 'block' \| 'inline' \| 'inline-block' \| 'grid' \| 'inline-grid' \| 'contents'` |

The more specific prop wins: a side (`pl`) over its axis (`px`) over the shorthand (`p`).

```tsx
<Box p={2} pl={10} /> // padding 0.5rem, left 2.5rem
```

### Flex props

Accepted by [Flex](../flex/flex.md). Stack and Group take non-responsive `gap`, `align`, `justify` (and Group `wrap`) with their own defaults.

| Prop        | CSS property            | Value                                                                                                                                                          |
| ----------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `display`   | `display`               | `'flex' \| 'inline-flex' \| 'none'`. Defaults to `flex`.                                                                                                       |
| `direction` | `flex-direction`        | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'`                                                                                                       |
| `wrap`      | `flex-wrap`             | `'nowrap' \| 'wrap' \| 'wrap-reverse'`                                                                                                                         |
| `align`     | `align-items`           | `'normal' \| 'stretch' \| 'center' \| 'start' \| 'end' \| 'flex-start' \| 'flex-end' \| 'baseline'` or any CSS string                                          |
| `justify`   | `justify-content`       | `'normal' \| 'start' \| 'end' \| 'center' \| 'flex-start' \| 'flex-end' \| 'space-between' \| 'space-around' \| 'space-evenly' \| 'stretch'` or any CSS string |
| `gap`       | `row-gap`, `column-gap` | spacing units                                                                                                                                                  |
| `rowGap`    | `row-gap`               | spacing units                                                                                                                                                  |
| `columnGap` | `column-gap`            | spacing units                                                                                                                                                  |

`rowGap` and `columnGap` win over `gap`.

Other layout components have their own style props, documented with each component: SimpleGrid (`cols`, `spacing`, `verticalSpacing`), Grid (`gutter`, `columns`, `justify`, `align`), Grid.Col (`span`, `offset`, `order`), Container (`size`), AspectRatio (`ratio`).

### Responsive values

Every style prop on Box and Flex takes either a single value or an object of breakpoints:

```tsx
<Box p={{ base: 2, sm: 4, lg: 8 }} />            // 0.5rem, 1rem from 48em, 2rem from 75em
<Flex direction={{ base: 'column', md: 'row' }} />
<Box display={{ base: 'none', sm: 'block' }} />
```

Keys are `base`, `xs`, `sm`, `md`, `lg` and `xl`. Mobile-first: `base` applies at every width, and each breakpoint applies from its `min-width` up until a larger key overrides it. Breakpoints are fixed:

| Key  | `min-width` |
| ---- | ----------- |
| `xs` | `36em`      |
| `sm` | `48em`      |
| `md` | `62em`      |
| `lg` | `75em`      |
| `xl` | `88em`      |

Each prop carries its value up through the breakpoints before the specificity rule applies, so a more specific prop keeps winning at every width:

```tsx
<Box p={{ md: 8 }} pl={2} /> // left padding is 0.5rem at every width
```

### String values

A string value is used as-is, for example `w="100%"` or `w="calc(100% - 2rem)"`. A string containing `;`, `{`, `}`, `<` or `>` is ignored.
