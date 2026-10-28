# Accordion

Sections whose content shows and hides under their headings: one open at a time, or several.

```tsx
import { Accordion } from '@solid-slopkit/components';
```

## Usage

```tsx
<Accordion defaultValue="shipping">
  <Accordion.Item value="shipping">
    <Accordion.Control icon={<Truck />}>Shipping</Accordion.Control>
    <Accordion.Panel>Orders placed before 2 p.m. leave the same day.</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value="returns">
    <Accordion.Control>Returns</Accordion.Control>
    <Accordion.Panel>Return anything within 30 days.</Accordion.Panel>
  </Accordion.Item>
</Accordion>

<Accordion multiple value={open()} onChange={setOpen} variant="separated">…</Accordion>
```

- **Parts:** `Accordion.Item` (with a `value`) holds an `Accordion.Control` and an `Accordion.Panel`. Items go in an `Accordion`, controls and panels in an item; they throw outside.
- **Value:** one item open at a time by default: `value` and `defaultValue` are a string or `null`, and `onChange(value)` gets the opened item's value, or `null` when the open one closes. With `multiple` (read once), several can be open: `value` and `defaultValue` are arrays, and `onChange(values)` gets the array. Uncontrolled with `defaultValue` (read once), or controlled with `value`.
- **Control:** a `button` with `aria-expanded` and `aria-controls`, inside a heading (`h3`; `order` sets the level from 2 to 6, to fit the page's outline). A click toggles its item. `icon` goes before the label; it and the chevron are hidden from screen readers, so the name is the label. `disabled` keeps the item as it is. Other props go to the `button`.
- **Panel:** a `region` labelled by its control. It grows from zero to its height as it opens and shrinks back as it closes, in CSS, so nothing is measured and the server render is final. Closed, it stays in the DOM with `visibility: hidden`: its content keeps its state, and is out of the tab order and the accessibility tree. Other props go to its `div`.
- **Keyboard:** Tab moves through the controls and the open panels' content; Up and Down move between the controls, Home and End to the first and last, skipping disabled ones and looping (`loop={false}` stops at the ends). Enter and Space toggle.
- **Chevron:** at the `right` of each control (`chevronPosition="left"` puts it first). It turns half a circle as the item opens; `disableChevronRotation` keeps it still. `chevron` replaces it with your own element, one per control.
- **Look:** `variant` is `divided` (a line under each item, the default), `bordered` (one rounded box with lines between the items) or `separated` (a card for each item, with a gap; an open one is lifted onto the base surface).
- **Animation:** 200ms, set with `--slp-accordion-transition-duration`. None under `prefers-reduced-motion`.
- The values become part of the ids, so any string works, spaces included.

## Props

| Prop                     | Type                                              | Default     | Description                                  |
| ------------------------ | ------------------------------------------------- | ----------- | -------------------------------------------- |
| `multiple`               | `boolean`                                         | `false`     | Lets several items be open. Read once.       |
| `value`                  | `string \| null`, or `string[]` with `multiple`   | —           | The open item or items, when controlled.     |
| `defaultValue`           | `string \| null`, or `string[]` with `multiple`   | none        | The open item or items at first.             |
| `onChange`               | `(value: string \| null)`, or `(value: string[])` | —           | Called when an item opens or closes.         |
| `variant`                | `'divided' \| 'bordered' \| 'separated'`          | `'divided'` | How the items are drawn.                     |
| `order`                  | `2 \| 3 \| 4 \| 5 \| 6`                           | `3`         | The heading level of the controls.           |
| `chevronPosition`        | `'left' \| 'right'`                               | `'right'`   | Which side of the control the chevron is on. |
| `chevron`                | `JSX.Element`                                     | a chevron   | Replaces the chevron.                        |
| `disableChevronRotation` | `boolean`                                         | `false`     | Keeps the chevron still.                     |
| `loop`                   | `boolean`                                         | `true`      | Whether the arrows wrap around.              |

Accordion passes other props to its `div`. Accordion.Item: `value` (required). Accordion.Control: `icon`, `disabled`.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-accordion` (`[data-slot="accordion"]`, with `data-variant`), `.slp-accordion-item` (with `data-value` and `data-opened`), `.slp-accordion-control` (with `data-opened`, `data-disabled`, `data-chevron-position`, and `data-rotate` unless the rotation is off), `.slp-accordion-panel` (with `data-opened`).
- Slots: `accordion-heading` around the control; `accordion-chevron`, `accordion-icon`, `accordion-label` in the control; `accordion-panel-body` in the panel, which clips while it moves and holds the padding.
- Custom properties, on the accordion or an ancestor: `--slp-accordion-radius` (the box's and cards' corners, `0.75rem`), `--slp-accordion-transition-duration` (`200ms`).
