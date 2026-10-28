---
name: slopkit-layout
description: Lay out @solid-slopkit/components apps — pick the right layout component (Stack, Group, Flex, SimpleGrid, Grid, Container, Center, AspectRatio, Space, Box), use style props and responsive values, and space components that take no style props. Use when building page structure, an app frame with a sidebar (AppShell), toolbars, forms, card grids or responsive layouts.
---

# Layout and style props in @solid-slopkit/components

Layout is done with layout components, not with margins on every element. Only layout components take **style props**, and each takes its own set: padding, margin and size props (`p*`, `m*`, `w`, `h`, …) are on `Box` alone; `Flex` has the flex props; Stack, Group, SimpleGrid, Grid, Container, Center, AspectRatio and Space each take only the props in the table below. Every other component, like `Button`, takes `class` and `style` like a plain element and is placed by a layout component around it.

Each component's full props are in its reference, linked from `node_modules/@solid-slopkit/components/dist/source/llms.md`. The Box reference documents every style prop.

Layout components must render inside `<SlopkitUi>`: their style props become generated CSS classes that the provider collects. They throw without it (all but Center, which has no style props).

## Pick the component

| You want                                                          | Use                 | Key props (defaults)                                                                   |
| ----------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------- |
| Children in a column with even gaps                               | `Stack`             | `gap` (4), `align` (`stretch`), `justify`                                              |
| Children in a row that wraps, like a toolbar or a button row      | `Group`             | `gap` (4), `align` (`center`), `justify`, `wrap` (`wrap`), `grow`                      |
| Any flex layout, or one that changes direction by breakpoint      | `Flex`              | `direction`, `wrap`, `align`, `justify`, `gap`, `rowGap`, `columnGap` (all responsive) |
| Equal-width columns, like a card grid                             | `SimpleGrid`        | `cols` (1), `spacing` (4), `verticalSpacing` (all responsive)                          |
| Columns of different widths on a 12-column grid                   | `Grid` + `Grid.Col` | `gutter` (4), `columns` (12); `span`, `offset`, `order` on `Grid.Col`                  |
| Page content at a readable max width, centered, with side padding | `Container`         | `size` (`md`), `fluid`                                                                 |
| Content centered both ways                                        | `Center`            | `inline`                                                                               |
| A box that keeps a width/height ratio, like a video or an image   | `AspectRatio`       | `ratio` (1)                                                                            |
| Fixed empty space between two things                              | `Space`             | `w`, `h`                                                                               |
| A div with padding, margin, size or display                       | `Box`               | `p*`, `m*`, `w`, `h`, `mi*`, `ma*`, `display`                                          |

Prefer `Stack` and `Group` gaps over margins on children. Reach for `Box` margins only when gaps can't express it.

## Spacing units

Numbers in spacing and size props are multiples of `--slp-spacing` (`0.25rem` by default): `gap={4}` is 1rem, `p={2}` is 0.5rem. `0` is `0`, and negative margins pull. Size props (`w`, `h`, `maw`, …) also take any CSS length as a string: `w="100%"`, `maw="40rem"`.

A theme changes `--slp-spacing` to make every layout denser or roomier at once, so use numbers rather than rem strings for spacing.

## Responsive values

Props marked responsive take a single value or an object keyed by breakpoint. It's mobile-first: `base` applies at every width, and each key applies from its `min-width` up.

| Key  | `min-width` |
| ---- | ----------- |
| `xs` | `36em`      |
| `sm` | `48em`      |
| `md` | `62em`      |
| `lg` | `75em`      |
| `xl` | `88em`      |

```tsx
<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 2, md: 4 }}>…</SimpleGrid>
<Flex direction={{ base: 'column', md: 'row' }} gap={4}>…</Flex>
<Box display={{ base: 'none', sm: 'block' }}>Hidden on phones</Box>
```

Not responsive: Stack's and Group's own `gap`, `align` and `justify`; Grid's `columns`, `justify` and `align`; Container's `size`; AspectRatio's `ratio`. For a gap that changes by breakpoint, use `Flex` with `direction="column"`.

Breakpoints are fixed; they can't be configured.

## Patterns

**Page shell:**

```tsx
<Box py={8}>
  <Container size="lg">
    <Stack gap={8}>
      <Group justify="space-between">
        <h1>Orders</h1>
        <Button color="primary">New order</Button>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
        <For each={orders()}>{(order) => <OrderCard order={order} />}</For>
      </SimpleGrid>
    </Stack>
  </Container>
</Box>
```

**App frame** with navigation down the side: use `AppShell`, not a Grid. It collapses the sidebar on wide screens (`collapsible="offcanvas" | "icon" | "none"`), turns it into a drawer below 48em, and toggles with ⌘B / Ctrl+B. Lay out the main area's content with the components above. See its reference for groups, menus and rows.

```tsx
<AppShell>
  <AppShell.Sidebar collapsible="icon">
    <AppShell.SidebarContent>
      <nav aria-label="Main">
        <AppShell.Group label="Platform">
          <AppShell.Menu>
            <AppShell.MenuItem>
              <AppShell.MenuButton href="/" icon={<House />} tooltip="Home">
                Home
              </AppShell.MenuButton>
            </AppShell.MenuItem>
          </AppShell.Menu>
        </AppShell.Group>
      </nav>
    </AppShell.SidebarContent>
  </AppShell.Sidebar>
  <AppShell.Main>
    <Box p={3}>
      <AppShell.Trigger />
    </Box>
    <Container size="lg">{props.children}</Container>
  </AppShell.Main>
</AppShell>
```

**Sidebar and content** inside a page, stacked on phones:

```tsx
<Grid gutter={6}>
  <Grid.Col span={{ base: 12, md: 3 }}>
    <Filters />
  </Grid.Col>
  <Grid.Col span={{ base: 12, md: 9 }}>
    <Results />
  </Grid.Col>
</Grid>
```

**Form actions**, filling the row on small screens:

```tsx
<Group justify="flex-end" gap={2}>
  <Button variant="ghost">Cancel</Button>
  <Button color="primary" type="submit">Save</Button>
</Group>

<Group grow>
  <Button variant="outline">Back</Button>
  <Button color="primary">Next</Button>
</Group>
```

**Spacing a component that takes no style props:** wrap it, or let the parent's gap do it.

```tsx
<Box mt={4}>
  <Button>Load more</Button>
</Box>
```

## Precedence

When props overlap, the more specific one wins: a side (`pl`) over its axis (`px`) over the shorthand (`p`), and `rowGap`/`columnGap` over `gap`. This holds at every breakpoint:

```tsx
<Box p={{ base: 2, md: 8 }} pl={2} /> // left padding stays 0.5rem at every width
```

## Mistakes to avoid

- Style props on non-layout components: `<Button mt={4}>` is a type error, on purpose. Wrap the component or use a gap.
- Padding or margin on a layout component other than Box: `<Container py={8}>` and `<Stack p={4}>` are type errors. Wrap it in a `Box`.
- `display="flex"` on Box: Box's `display` excludes the flex values. Use `Flex`.
- Rendering layout components outside `<SlopkitUi>`, for example in a test: they throw (Center aside). Wrap test renders in the provider.
- Rem strings for spacing (`gap="1rem"`): gaps take numbers, and numbers follow the theme's `--slp-spacing`.
- A string value containing `;`, `{`, `}`, `<` or `>`: it's ignored, to keep generated CSS safe.
- Expecting a responsive object on a non-responsive prop (see the list above).
