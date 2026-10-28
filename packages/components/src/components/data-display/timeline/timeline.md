# Timeline

A sequence of events in order: an `ol` of `Timeline.Item`, joined by a line.

```tsx
import { Timeline } from '@solid-slopkit/components';
```

## Usage

```tsx
<Timeline color="success">
  <Timeline.Item active title="Ordered" bullet={<ShoppingCart aria-hidden="true" />}>
    Monday, 9:40
  </Timeline.Item>
  <Timeline.Item active title="Shipped" bullet={<Truck aria-hidden="true" />}>
    Tuesday, 14:05
  </Timeline.Item>
  <Timeline.Item title="Delivered" bullet={<House aria-hidden="true" />}>
    Expected Friday
  </Timeline.Item>
</Timeline>
```

- **Elements:** an `ol` of `li`, so assistive technology reads the events as an ordered list with their count.
- **Item:** `title` is the event's heading and the children its description, in a muted, smaller text. Both are optional.
- **Bullet:** each item has a circle on the line. `bullet` puts content in it, such as an icon or a number; it's hidden from assistive technology, so the title should say what the event is.
- **Active:** `active` marks an event as reached: its bullet fills with the color, and the line to the next item takes the color when that item is active too. Usually the first few items are active. If the reader needs to know which events are done, say it in the text as well, such as "Shipped on Tuesday".
- **Color:** `color` on the Timeline takes a color role and defaults to `primary`.
- Timeline has no margin; space it with a Stack.

## Props

### Timeline

Other props are passed to the `ol`.

| Prop    | Type                                                                                               | Default     | Description                                  |
| ------- | -------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------- |
| `color` | `'neutral' \| 'primary' \| 'secondary' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'error'` | `'primary'` | Color role of active bullets and their line. |

### Timeline.Item

Other props are passed to the `li`.

| Prop     | Type          | Default | Description                                         |
| -------- | ------------- | ------- | --------------------------------------------------- |
| `title`  | `JSX.Element` | —       | The event's heading.                                |
| `bullet` | `JSX.Element` | —       | Content of the bullet, such as an icon or a number. |
| `active` | `boolean`     | `false` | Marks the event as reached.                         |

## Styling

Write plain CSS against these selectors. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-timeline` on the `ol`, `.slp-timeline-item` on each `li`.
- Slots on each item: `[data-slot="timeline-item-bullet"]`, `[data-slot="timeline-item-content"]`, `[data-slot="timeline-item-title"]`, `[data-slot="timeline-item-body"]`.
- State and variant attributes: `data-color` on the timeline; `data-active` and `data-with-bullet` on an item.
- The line is each item's `::before`, 2px wide. A dashed line: `.slp-timeline-item::before { background: none; border-left: 2px dashed currentColor }`.

CSS variables, set on the timeline or any ancestor:

| Variable                 | Default                            | Description                                  |
| ------------------------ | ---------------------------------- | -------------------------------------------- |
| `--slp-timeline-color`   | `var(--slp-color-<color>)`         | Active color. For a color that isn't a role. |
| `--slp-timeline-content` | `var(--slp-color-<color>-content)` | Icon color in an active bullet.              |
