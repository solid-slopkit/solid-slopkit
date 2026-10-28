# Binding

`import { bind, control } from "@solid-slopkit/signal-forms";`

A binding connects a field to a view element. There are two layers.

## bind(): slopkit components

`bind(f.x)` returns `{ value, onChange(value), onBlur, error, disabled, readOnly, required }`, all getters. Spread the whole object onto a component that takes a typed `value` and `onChange(value)`. Three variants cover the other inputs: `bind.text(f.x)` returns `onInput` instead of `onChange`, for the text inputs that pass `value` and `onInput` to their native element; `bind.checked(f.x)` returns `checked` instead of `value`; and `bind.nativeSelect(f.x)` returns an `onChange` that takes the native `change` event, for `NativeSelect`.

| Prop                         | Value                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| `value` / `checked`          | the field's value                                                                         |
| `onChange(value)`, `onInput` | `$set(value)`; `onInput` and the native select's `onChange` read the element's `value`    |
| `onBlur()`                   | `$markTouched()`                                                                          |
| `error`                      | the first error's message (`true` if it has none) once the field is touched; else `false` |
| `disabled`                   | `$disabled()`, including from a container above                                           |
| `readOnly`                   | `$readonly()`                                                                             |
| `required`                   | true when a `required()` rule is attached                                                 |

The field's type must be the type the component reports. Every input of `@solid-slopkit/components` and its `dates` entry:

| Component                                                                                       | Call                     | Field type                     |
| ----------------------------------------------------------------------------------------------- | ------------------------ | ------------------------------ |
| `TextInput`, `Textarea`, `PasswordInput`                                                        | `bind.text(f.x)`         | `string`                       |
| `Autocomplete`, `JsonInput`, `PinInput`, `ColorInput`, `ColorPicker`, `TimeInput`, `TimePicker` | `bind(f.x)`              | `string`                       |
| `Select`                                                                                        | `bind(f.x)`              | `string \| null`               |
| `NativeSelect`                                                                                  | `bind.nativeSelect(f.x)` | `string`                       |
| `SegmentedControl`, `Radio.Group`, `Chip.Group`                                                 | `bind(f.x)`              | `string`                       |
| `MultiSelect`, `TagsInput`, `Checkbox.Group`, `Switch.Group`, `Chip.Group multiple`             | `bind(f.x)`              | `string[]`                     |
| `NumberInput`                                                                                   | `bind(f.x)`              | `number \| undefined`          |
| `Slider`, `AngleSlider`, `Rating`                                                               | `bind(f.x)`              | `number`                       |
| `RangeSlider`                                                                                   | `bind(f.x)`              | `[number, number]`             |
| `Checkbox`, `Switch`, `Chip`                                                                    | `bind.checked(f.x)`      | `boolean`                      |
| `FileInput` (`FileInput multiple`)                                                              | `bind(f.x)`              | `File \| null` (`File[]`)      |
| `DateInput`, `DateTimePicker`, `DatePickerInput`, `MonthPickerInput`, `YearPickerInput`         | `bind(f.x)`              | `Date \| null`                 |
| The picker inputs with `type="multiple"`                                                        | `bind(f.x)`              | `Date[]`                       |
| The picker inputs with `type="range"`                                                           | `bind(f.x)`              | `[Date \| null, Date \| null]` |

`NativeSelect` is the browser's own select: its `onChange` is the DOM event, so it takes `bind.nativeSelect`, which reads the chosen option and refuses the edit while the field is read-only (a select has no native `readonly`). For a themed dropdown, use `Select` with `bind()`.

A mismatch is a type error. `NumberInput` reports `undefined` when it is empty, so model that field as `number | undefined`; `min()` and `max()` skip an empty value, so pair them with `required()`.

Props after the spread win: `<TextInput {...bind.text(f.name)} error={f.name.$errors()[0]?.message} />` shows the error before the field is touched.

```tsx
import { createStore } from 'solid-js';
import { Checkbox, Code, NumberInput, Select, Stack, Switch, TextInput } from '@solid-slopkit/components';
import { bind, form } from '@solid-slopkit/signal-forms';

// bind() works on any input that takes a typed `value` and `onChange(value)`. The Field's type
// must be what the component reports: Select gives `string | null`, NumberInput `number | undefined`.
// Text inputs pass `onInput` to their element, so they use bind.text(); Checkbox and Switch take
// `checked`, so they use bind.checked().
export default function BindingDemo() {
  const [model, setModel] = createStore<{
    name: string;
    seats: number | undefined;
    plan: string | null;
    newsletter: boolean;
    darkMode: boolean;
  }>({ name: 'Ada', seats: 3, plan: 'team', newsletter: true, darkMode: false });
  const f = form(model, setModel);

  return (
    <Stack gap={2} style={{ 'max-width': '20rem' }}>
      <TextInput label="Name" {...bind.text(f.name)} />
      <NumberInput label="Seats" {...bind(f.seats)} />
      <Select label="Plan" data={['solo', 'team', 'company']} {...bind(f.plan)} />
      <Checkbox label="Newsletter" {...bind.checked(f.newsletter)} />
      <Switch label="Dark mode" {...bind.checked(f.darkMode)} />
      <Code block>{JSON.stringify(model, null, 2)}</Code>
    </Stack>
  );
}
```

## control(): native elements

`control(f.x)` spreads `value`, DOM-event handlers, `disabled` and `readonly` onto a plain element (`readonly` is the attribute; slopkit components take `readOnly`, which `bind` gives them). Checkboxes and selects have no native `readonly`, so their handlers refuse the edit and restore the element. For `NativeSelect`, use `bind.nativeSelect(f.x)`, which also carries the field's error and conditions.

| Call                    | Element      | Field type                  |
| ----------------------- | ------------ | --------------------------- |
| `control(f.x)`          | text input   | `string`                    |
| `control.number(f.x)`   | number input | `number` (`NaN` when empty) |
| `control.checkbox(f.x)` | checkbox     | `boolean`                   |
| `control.select(f.x)`   | select       | `string`                    |

```tsx
import { createStore } from 'solid-js';
import { Code, Stack } from '@solid-slopkit/components';
import { control, form } from '@solid-slopkit/signal-forms';

// For plain DOM elements, control() spreads value and DOM-event handlers. Each type has an
// adapter: control (text), control.number, control.checkbox, control.select.
export default function NativeControlDemo() {
  const [model, setModel] = createStore({ name: 'Ada', age: 36, agree: false, color: 'green' });
  const f = form(model, setModel);

  return (
    <Stack gap={2} style={{ 'max-width': '20rem' }}>
      <label>
        Name <input {...control(f.name)} />
      </label>
      <label>
        Age <input type="number" {...control.number(f.age)} />
      </label>
      <label>
        <input type="checkbox" {...control.checkbox(f.agree)} /> Agree
      </label>
      <label>
        Color{' '}
        <select {...control.select(f.color)}>
          <option value="red">red</option>
          <option value="green">green</option>
        </select>
      </label>
      <Code block>{JSON.stringify(model, null, 2)}</Code>
    </Stack>
  );
}
```
