# Carousel

Slides in a row (or a column) that the user moves through by dragging, with the previous and next buttons, the arrow keys, or the indicators. The slides lay out with CSS, also on the server; the engine, `embla-carousel`, starts in the browser.

It lives in its own entry, because `embla-carousel` is an optional peer dependency. Install it next to the package:

```sh
pnpm add embla-carousel
```

```tsx
import { Carousel } from '@solid-slopkit/components/carousel';
```

## Usage

```tsx
<Carousel aria-label="Featured trips" slideSize="70%" slideGap={4} withIndicators>
  <For each={trips}>
    {(trip) => (
      <Carousel.Slide>
        <Image src={trip.photo} alt={trip.title} />
      </Carousel.Slide>
    )}
  </For>
</Carousel>
```

- **Slides:** `Carousel.Slide` children, each a `div`. `slideSize` is a CSS length or percentage of the carousel (`100%` by default, `'50%'` for two at a time); `slideGap` is the space between them in spacing units. For a size per breakpoint, override `.slp-carousel-slide`'s `flex-basis` in your CSS with media queries. A slide throws outside a Carousel.
- **Moving:** drag (off with `draggable={false}`), the previous and next buttons (`withControls`, on by default), the indicators (`withIndicators`, one per step, off by default), or the arrow keys while the focus is inside it: Left and Right, or Up and Down when vertical. Not while typing in a field.
- **Steps:** `slidesToScroll` slides per step (`auto` for as many as fit), resting at `align` (`start`, `center`, `end`). `loop` goes on from the last to the first. `dragFree` lets a drag glide and stop anywhere. `initialSlide` is read once. `onSlideChange(index)` gets the selected step.
- **Vertical:** `orientation="vertical"` stacks the slides; give the carousel a height (`style={{ height: '20rem' }}`).
- **Engine:** `emblaOptions` passes any other engine option and wins over the props; changing an option re-initializes the running engine. `plugins` (read once) takes engine plugins, e.g. `embla-carousel-autoplay`. `apiRef` gets the engine's API once it runs, to scroll from your own controls (`api.scrollTo(2)`). The types `EmblaCarouselType`, `EmblaOptionsType` and `EmblaPluginType` are re-exported.
- **Screen readers:** a `section` with `aria-roledescription="carousel"`: name it with `aria-label` or `aria-labelledby`. Each slide is a `group` with `aria-roledescription="slide"`, named `2 of 5` once the engine runs. The slides' container is a polite live region, and the buttons and indicators point at it with `aria-controls`; the current indicator has `aria-current`. At an end, the previous or next button gets `aria-disabled` and hides, but keeps the focus.
- **Strings:** `previousLabel` (`Previous slide`), `nextLabel` (`Next slide`), `indicatorLabel(index, count)` (`Go to slide 2`), `slideLabel(index, count)` (`2 of 5`), `roleDescription` (`carousel`), `slideRoleDescription` (`slide`).
- `class`, `style` and other props go to the root `section`; `onKeyDown` runs first, and `preventDefault()` keeps the arrow keys from stepping.

## Props

Other props are passed to the root `section`.

| Prop                   | Type                                       | Default            | Description                                        |
| ---------------------- | ------------------------------------------ | ------------------ | -------------------------------------------------- |
| `orientation`          | `'horizontal' \| 'vertical'`               | `'horizontal'`     | Which way the slides run. Vertical needs a height. |
| `slideSize`            | `string`                                   | `'100%'`           | Each slide's size along the carousel.              |
| `slideGap`             | `number`                                   | `0`                | Space between slides, in spacing units.            |
| `align`                | `'start' \| 'center' \| 'end'`             | `'start'`          | Where the selected slide rests.                    |
| `loop`                 | `boolean`                                  | `false`            | From the last slide on to the first.               |
| `slidesToScroll`       | `number \| 'auto'`                         | `1`                | Slides per step.                                   |
| `dragFree`             | `boolean`                                  | `false`            | A drag glides and stops anywhere.                  |
| `draggable`            | `boolean`                                  | `true`             | Slides can be dragged.                             |
| `initialSlide`         | `number`                                   | `0`                | The slide shown first. Read once.                  |
| `emblaOptions`         | `EmblaOptionsType`                         | —                  | More engine options; they win.                     |
| `plugins`              | `EmblaPluginType[]`                        | —                  | Engine plugins. Read once.                         |
| `apiRef`               | `(api: EmblaCarouselType) => void`         | —                  | Gets the engine's API in the browser.              |
| `onSlideChange`        | `(index: number) => void`                  | —                  | Called with the selected step.                     |
| `withControls`         | `boolean`                                  | `true`             | Previous and next buttons.                         |
| `withIndicators`       | `boolean`                                  | `false`            | A button per step.                                 |
| `previousLabel`        | `string`                                   | `'Previous slide'` | The previous button's name.                        |
| `nextLabel`            | `string`                                   | `'Next slide'`     | The next button's name.                            |
| `indicatorLabel`       | `(index: number, count: number) => string` | `Go to slide 2`    | An indicator's name.                               |
| `slideLabel`           | `(index: number, count: number) => string` | `2 of 5`           | A slide's name.                                    |
| `roleDescription`      | `string`                                   | `'carousel'`       | What assistive tech calls the carousel.            |
| `slideRoleDescription` | `string`                                   | `'slide'`          | What assistive tech calls a slide.                 |

`Carousel.Slide` takes a `div`'s props.

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-carousel` (with `data-orientation`), `.slp-carousel-slide`.
- Slots: `[data-slot="carousel-viewport"]` (clips the slides), `[data-slot="carousel-container"]` (the row of slides), `[data-slot="carousel-slide"]` (each slide), `[data-slot="carousel-controls"]`, `[data-slot="carousel-previous"]` and `[data-slot="carousel-next"]` (ActionIcons, with `data-disabled` at an end), `[data-slot="carousel-indicators"]`, `[data-slot="carousel-indicator"]` (with `data-active` for the current step; the bar is its `::before`).
- No public custom properties: the slide size and gap are props, or `flex-basis` and `padding-inline-start` on `.slp-carousel-slide` (with a matching negative `margin-inline-start` on the container).
