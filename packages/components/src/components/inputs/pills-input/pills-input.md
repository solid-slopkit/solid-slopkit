# PillsInput

A field box that holds pills and a text field after them, in rows that wrap. It's the base of MultiSelect and TagsInput; use it directly for a field of values they don't cover.

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see **Focus** below.

```tsx
import { Pill, PillsInput } from '@solid-slopkit/components';
```

## Usage

```tsx
const [tags, setTags] = createSignal(['design']);
const [draft, setDraft] = createSignal('');

<PillsInput label="Tags" description="Press Enter to add a tag">
  <For each={tags()}>
    {(tag) => (
      <Pill withRemoveButton onRemove={() => setTags((list) => list.filter((other) => other !== tag))}>
        {tag}
      </Pill>
    )}
  </For>
  <PillsInput.Field
    value={draft()}
    onInput={(event) => setDraft(event.currentTarget.value)}
    onKeyDown={(event) => {
      if (event.key === 'Enter' && draft().trim()) {
        event.preventDefault();
        setTags((list) => [...list, draft().trim()]);
        setDraft('');
      }
    }}
  />
</PillsInput>;
```

- **Parts:** put [Pill](../pill/pill.md)s and one `PillsInput.Field` in it, in the order they show. The pills take its size and disabled state; a pill's own `size` wins.
- **Box:** an [Input](../input/input.md)'s box (`.slp-input`), with its border, focus ring, `variant` (`outline`, `soft`, `ghost`), `leftSection` and `rightSection`. With one row it's exactly as tall as an Input of the same size; more pills wrap onto more rows and it grows. The sections stay on the first row.
- **Field:** an `input` that fills the rest of the row, and takes a row of its own when less than 4rem is left. It takes the PillsInput's `id`, so the label names it, and the description, error and `required` state. Other props go to it: `value`, `placeholder`, `onKeyDown`, `ref`, …. It throws outside a PillsInput.
- **Label and texts:** `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput. `error` marks the box invalid, as does `invalid`.
- **Focus:** a press anywhere on the box that isn't a button or a field focuses the field. Each pill's remove button is a tab stop before the field.
- **Behavior is yours:** adding a value on Enter or a comma, removing the last one on Backspace, and the values themselves belong to the component built on it. It renders what you give it.
- **Disabled:** dims the box, disables the field and every pill's remove button.
- `class` and `style` go to the root (with the label and texts); other props go to the box.

## Props

| Prop           | Type                                   | Default     | Description                                                                 |
| -------------- | -------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `label`        | `JSX.Element`                          | —           | The label, which names the field.                                           |
| `labelSection` | `JSX.Element`                          | —           | Content at the end of the label's row, such as the current value or a link. |
| `description`  | `JSX.Element`                          | —           | A hint under the label.                                                     |
| `error`        | `JSX.Element \| boolean`               | —           | An error under the box, which marks it invalid.                             |
| `required`     | `boolean`                              | `false`     | An asterisk, and `required` on the field.                                   |
| `withAsterisk` | `boolean`                              | `required`  | Shows the asterisk without `required`.                                      |
| `size`         | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`      | The box, the field and the pills.                                           |
| `id`           | `string`                               | generated   | The field's id.                                                             |
| `variant`      | `'outline' \| 'soft' \| 'ghost'`       | `'outline'` | The box's look.                                                             |
| `leftSection`  | `JSX.Element`                          | —           | Content before the pills, usually an icon.                                  |
| `rightSection` | `JSX.Element`                          | —           | Content after the field: an icon or a button.                               |
| `invalid`      | `boolean`                              | `error`     | Marks the box invalid.                                                      |
| `disabled`     | `boolean`                              | `false`     | Disables the field and the pills.                                           |

PillsInput.Field takes an `input`'s props, except `id`.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-pills-input` (the field with its label and texts), plus `.slp-input-wrapper`, with InputWrapper's slots and attributes; `.slp-pills-input-field`. The box is also `.slp-input`, and takes Input's selectors.
- Slots: `pills-input-box`, `pills-input-content` (the rows of pills and the field), `pills-input-field`, and Input's `input-left-section` and `input-right-section`.
- Attributes on the box: Input's (`data-variant`, `data-size`, `data-invalid`, `data-disabled`, `data-with-left-section`, `data-with-right-section`).
