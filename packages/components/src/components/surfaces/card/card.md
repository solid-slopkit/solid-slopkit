# Card

Content grouped on a surface, built from fixed parts: `Card.Header`, `Card.Image`, `Card.Body` and `Card.Footer`, with `Card.Title` and `Card.Description` for the heading.

```tsx
import { Card } from '@solid-slopkit/components';
```

## Usage

```tsx
<Card>
  <Card.Image src="/norway.jpg" alt="A fjord at dawn" />
  <Card.Header>
    <Card.Title>Norway</Card.Title>
    <Card.Description>Fjords, mountains and the midnight sun.</Card.Description>
    <Badge>New</Badge>
  </Card.Header>
  <Card.Body>
    <Text size="sm">Ten days from Bergen to the Lofoten islands, by train, ferry and on foot.</Text>
  </Card.Body>
  <Card.Footer>
    <Button variant="ghost">Details</Button>
    <Button color="primary">Book</Button>
  </Card.Footer>
</Card>
```

- **Parts:** each one is optional and renders its own element.
  - `Card.Header`: a row; a title at the start and anything after it at the end. With `Card.Title` and `Card.Description` in it, the two stack at the start and each other child (a badge, a close button, a switch) takes a column at the end, aligned to the top.
  - `Card.Title`: the card's heading, a [Title](../../typography/title/title.md) at level 3 that looks like an `h5` (an `h6` in a small card). It takes Title's props: `order` for another level, `size`, `color`, `dimmed`, `weight`. It works in a body too, e.g. for a centered empty state.
  - `Card.Description`: a line under the title, a [Text](../../typography/text/text.md) that is `sm` and dimmed, so it takes the theme's `--slp-color-muted-content`. It takes Text's props, e.g. `size` or `dimmed={false}`.
  - `Card.Image`: a full-bleed `img`, flush with the card's edges and clipped to its corners. It takes the `img` attributes, and `alt` is required (`alt=""` for a decorative image). It's cropped to fit (`object-fit: cover`); set its height with `style` or a selector.
  - `Card.Body`: the main content.
  - `Card.Footer`: a row of actions on a muted strip (`--slp-color-muted` at half strength) below a divider, flush with the card's sides and bottom. The actions sit at the start; give a Button `fullWidth` to fill the row.
- **Variant:** `outline` (a bordered base-100 surface, the default), `soft` (base-200, no border) or `elevated` (base-100 with a shadow).
- **Spacing:** one value spaces the whole card: the gap between the parts, the padding above the first and below the last, and each part's side padding. It is 1rem (4 spacing units). A flush image or footer at an edge replaces the padding there. Set `--slp-card-spacing` to change it.
- **Size:** `sm` tightens the spacing to 0.75rem (3 spacing units) and makes `Card.Title` look like an `h6`. `md` is the default.
- **Text:** the card sets `sm` as its font size, so plain text in it is small; Text and Title keep their own sizes.
- **Orientation:** `horizontal` puts the image in a column on the start side (two fifths of the width) and stacks the header, body and footer beside it. The other parts set the card's height and the image fills it. Use one of each part in a horizontal card. For a layout that changes per breakpoint, switch `orientation` from your own state.
- **Element:** the root is a `div`. Pass `role="article"` with an `aria-label`, or put a heading in the header, when the card stands for a piece of content.
- Card doesn't take style props. Space cards with a Stack, Group or SimpleGrid.

## Props

### Card

Other props are passed to the `div`.

| Prop          | Type                                | Default      | Description                                    |
| ------------- | ----------------------------------- | ------------ | ---------------------------------------------- |
| `variant`     | `'outline' \| 'soft' \| 'elevated'` | `'outline'`  | Surface style.                                 |
| `orientation` | `'vertical' \| 'horizontal'`        | `'vertical'` | `horizontal` puts the image on the start side. |
| `size`        | `'sm' \| 'md'`                      | `'md'`       | `sm` tightens the spacing and the title.       |

### Parts

`Card.Header`, `Card.Body` and `Card.Footer` take the attributes of a `div`; `Card.Image` takes those of an `img`, with `alt` required. `Card.Title` takes Title's props (`order` defaults to `3`, `size` to `'h5'`), and `Card.Description` takes Text's props without `as` (`size` defaults to `'sm'`, `dimmed` to `true`). They are also exported as `CardHeader`, `CardTitle`, `CardDescription`, `CardImage`, `CardBody` and `CardFooter`.

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root class: `.slp-card`, with `data-variant`, `data-orientation` and `data-size`.
- Custom property: `--slp-card-spacing`, the spacing between and around the parts (both sizes).
- Each part is a component with its own root class: `.slp-card-header`, `.slp-card-title`, `.slp-card-description`, `.slp-card-image`, `.slp-card-body`, `.slp-card-footer`. The title and description also keep `.slp-title` and `.slp-text`.
- Examples: `.slp-card { --slp-card-spacing: 1.5rem }` for a roomier card, `.slp-card-image { aspect-ratio: 16 / 9 }`, or `.slp-card[data-orientation='horizontal'] { grid-template-columns: 8rem 1fr }` for a narrower side image.
