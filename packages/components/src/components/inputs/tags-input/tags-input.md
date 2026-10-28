# TagsInput

A labelled field of free-text tags, shown as pills: Enter or a comma adds what's typed as a tag, and suggestions can be offered while typing. Built on [PillsInput](../pills-input/pills-input.md) and [Combobox](../combobox/combobox.md).

Keyboard and ARIA behavior are tested, in jsdom and in a real browser; see the Usage notes below.

```tsx
import { TagsInput } from '@solid-slopkit/components';
```

## Usage

```tsx
<TagsInput label="Tags" description="Press Enter to add a tag" placeholder="Add a tag" defaultValue={['design']} />

<TagsInput
  label="Skills"
  value={skills()}
  onChange={setSkills}
  maxTags={5}
  clearable
  data={[
    { group: 'Frontend', items: ['CSS', 'HTML', 'TypeScript'] },
    { group: 'Backend', items: ['Go', 'Rust', { value: 'COBOL', disabled: true }] },
  ]}
/>
```

- **Value:** an array of tags, in the order they were added. Uncontrolled with `defaultValue` (read once), or controlled with `value`. `onChange(tags)` is called whenever one is added or removed.
- **Adding:** Enter adds what's typed, trimmed, and keeps a form from submitting; with nothing typed, Enter submits the form as usual. Typing or pasting one of `splitChars` (default `[',']`) adds what's before it, so a pasted `a, b, c` adds `a` and `b` and leaves `c` in the field. Leaving the field adds what's typed, unless `acceptValueOnBlur={false}`. Empty tags are never added.
- **Duplicates and limits:** a tag that's already there isn't added (`allowDuplicates` lets it be), and `onDuplicate(tag)` is called. `maxTags` stops adding once reached. Text that couldn't be added stays in the field.
- **Removing:** each tag is a [Pill](../pill/pill.md) with a remove button named after it, "Remove design" (`removeLabel` changes the first word), which removes it and focuses the field. Backspace in the empty field removes the last tag. `clearable` adds a button that removes them all (named `clearLabel`, default `Clear`).
- **Suggestions:** `data` takes strings, `{ value, disabled? }` items and `{ group, items }` groups. Those that contain what's typed (ignoring case), without the tags already added, show in a dropdown; it opens while something matches and closes when nothing does. Typing never makes a suggestion active, so Enter adds what was typed; ArrowDown and ArrowUp move to a suggestion, and Enter or a click then adds it. Without `data` there's no dropdown, and the field has no `aria-autocomplete`.
- **Field:** a text field with `role="combobox"` after the tags. `placeholder` shows while there are no tags. A press anywhere else on the box focuses it.
- **Forms:** `name` adds a hidden input per tag, so the form data has every tag under that name. `required` marks the field `aria-required` but doesn't make the text field required, since the tags are the pills.
- **Label and texts:** `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput. The label names the field and the list of suggestions. Without a label, pass `aria-label`.
- **Box:** a PillsInput's box, with `variant`, `leftSection` and `rightSection`; it grows as the tags wrap, and the dropdown follows it. `disabled` and `readOnly` add and remove nothing; `readOnly` hides the remove buttons, and `disabled` disables them.
- **Dropdown:** under the box and as wide as it; `comboboxProps` sets `position`, `offset`, `matchTargetWidth`, `transition` and `transitionDuration`. Needs a `<SlopkitUi>` above it.
- `class` and `style` go to the root (with the label and texts); other props, such as `aria-label` or `onBlur`, go to the field.
- To pick only from a fixed list, use [MultiSelect](../multi-select/multi-select.md).

## Props

| Prop                | Type                                                                     | Default     | Description                                         |
| ------------------- | ------------------------------------------------------------------------ | ----------- | --------------------------------------------------- |
| `value`             | `string[]`                                                               | —           | The tags, when controlled.                          |
| `defaultValue`      | `string[]`                                                               | `[]`        | The tags it starts with, when uncontrolled.         |
| `onChange`          | `(value: string[]) => void`                                              | —           | Called when a tag is added or removed.              |
| `data`              | `TagsInputData`                                                          | —           | Suggestions offered while typing.                   |
| `placeholder`       | `string`                                                                 | —           | Shown while there are no tags.                      |
| `maxTags`           | `number`                                                                 | —           | At most this many tags.                             |
| `allowDuplicates`   | `boolean`                                                                | `false`     | Lets the same tag be added again.                   |
| `onDuplicate`       | `(value: string) => void`                                                | —           | Called with a tag that's already there.             |
| `splitChars`        | `string[]`                                                               | `[',']`     | Characters that end a tag as they're typed.         |
| `acceptValueOnBlur` | `boolean`                                                                | `true`      | Adds what's typed when the field loses focus.       |
| `clearable`         | `boolean`                                                                | `false`     | A button that removes every tag.                    |
| `clearLabel`        | `string`                                                                 | `'Clear'`   | The clear button's name.                            |
| `removeLabel`       | `string`                                                                 | `'Remove'`  | The first word of each pill's remove button's name. |
| `name`              | `string`                                                                 | —           | Submits the tags with a form.                       |
| `readOnly`          | `boolean`                                                                | `false`     | Shows the tags without letting them change.         |
| `disabled`          | `boolean`                                                                | `false`     | Disables the field and the pills.                   |
| `variant`           | `'outline' \| 'soft' \| 'ghost'`                                         | `'outline'` | The box's look.                                     |
| `leftSection`       | `JSX.Element`                                                            | —           | Content before the tags.                            |
| `rightSection`      | `JSX.Element`                                                            | —           | Content after the field.                            |
| `comboboxProps`     | `{ position, offset, matchTargetWidth, transition, transitionDuration }` | —           | The dropdown's position and animation.              |

Plus `label`, `labelSection`, `description`, `error`, `required`, `withAsterisk`, `size` and `id`, as on TextInput.

## Styling

Component rules live in `@layer slopkit.components`, so unlayered CSS wins.

- Root classes: `.slp-tags-input`, plus `.slp-input-wrapper`, with InputWrapper's slots and attributes. The box is a PillsInput's (`[data-slot="pills-input-box"]`, also `.slp-input`), the tags are `.slp-pill`s, and the dropdown a [Combobox](../combobox/combobox.md)'s (`.slp-combobox`, `.slp-combobox-option`, …).
- Slots: `tags-input-pill`, `tags-input-clear`, and PillsInput's `pills-input-content` and `pills-input-field`.
- Attributes on the box: PillsInput's, and `data-read-only` when read only.
- The pills' color: `--slp-pill-color` on `.slp-tags-input`.
