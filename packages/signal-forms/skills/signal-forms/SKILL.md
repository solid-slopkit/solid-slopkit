---
name: slopkit-signal-forms
description: Build forms with @solid-slopkit/signal-forms — a Solid store as the model, rules in a schema function (required, email, validate, validateAsync, Standard Schema), conditions (disabled, hidden, readonly), submit, and binding fields to @solid-slopkit/components inputs or native elements. Use when writing or changing a form, its validation or its submit handling.
---

# Signal forms with @solid-slopkit/signal-forms

`form(model, setModel, schemaFn)` turns a Solid store into a field tree: `f.address.street` is a field with its value, errors and conditions as signals. Rules are attached to paths in the schema function, `bind()` spreads a field onto an input, and `submit()` validates and hands over the value.

The API and the references for each area are linked from `node_modules/@solid-slopkit/signal-forms/dist/source/llms.md`.

## Rules that prevent the usual mistakes

**Solid 2.x**

- A component function runs once. Never destructure props. There are no hooks.
- `createStore` comes from `solid-js`. Its setter is a **draft mutation**: `setModel((draft) => { draft.address.city = 'Rome'; })`, not `setModel('address', 'city', 'Rome')`.
- Read `node_modules/solid-js/CHEATSHEET.md` before writing reactive code.

**The model and the form**

- `form(model, setModel, schemaFn?)` returns the field tree. Call it **in a component body**: it lives under the current owner and is disposed with it. Never at module scope.
- The tree mirrors the model: `f.address.street`, `f.items[0].sku`. The root `f` is a field over the whole model, so `f.$valid()` is the form's validity. A field over a primitive is a leaf; over an object or array it is a container and aggregates its descendants.
- State is read through `$`-prefixed accessors, each a signal: `$value()`, `$set(next)`, `$dirty()`, `$touched()`, `$markTouched()`, `$reset()`, `$errors()`, `$valid()`, `$invalid()`, `$disabled()`, `$hidden()`, `$readonly()`, `$pending()`, `$metadata(key)`, `$submitting()`. A model key that itself starts with `$` collides with them: avoid it.
- **Write only from event handlers or effects** (`$set`, a binding's `onChange`, the store setter), never while rendering: Solid forbids writes in an owned scope.

**Rules go in the schema function**

- `form(model, setModel, (p) => { required(p.name); })`: `p` is a _path_ mirroring the model, only a locator. It is not a field and has no `$` state. The function runs once.
- The same function shape is `schema<T>((p) => { … })` for a reusable bundle, attached with `apply`.

**Binding**

- Slopkit components: `<Select label="Plan" {...bind(f.plan)} />`. Text inputs (`TextInput`, `Textarea`, `PasswordInput`) take `bind.text(f.name)`, `Checkbox`, `Switch` and `Chip` take `bind.checked(f.on)`, `NativeSelect` takes `bind.nativeSelect(f.plan)`. For a dropdown, prefer `Select` with `bind()`: it is themed, and `NativeSelect` is only for the browser's own picker. Native elements: `<input {...control(f.name)} />` with `control.number`, `control.checkbox`, `control.select`.
- **Spread the binding object whole.** Its props are getters; destructuring `const { value } = bind(f.x)` reads once and freezes.
- The field's type must be the type the component reports: `string | null` for `Select`, `string` for `Radio.Group`, `number | undefined` for `NumberInput`, `string[]` for `MultiSelect`, `TagsInput` and `Checkbox.Group`. The binding reference has a row for every ui input. A mismatch is a type error.
- `bind()` shows `error` only once the field is **touched** (left once, or after `submit`). Override with an `error` prop after the spread.

**Validation and conditions**

- Only `disabled` takes a field out of validation and out of the submitted value. `hidden` and `readonly` fields still count toward validity, still block `submit`, and are submitted. To drop the rules of a field that does not apply, attach them with `applyWhen`.
- `minLength`, `email`, `pattern`, `min`, `max` skip empty values: pair them with `required`.
- `submit(f, handler)` touches every field, waits for async validation, stops if invalid, and otherwise calls `handler(value)` with disabled fields left out. A second call while one runs is ignored. Call it from an event handler.
- An async validator must read the values it depends on **before** its first `await`. A rejected promise counts as "no error": catch failures inside and return `error(…)`.

## A first form

```tsx
import { createSignal, createStore } from 'solid-js';
import { Button, Stack, Text, TextInput } from '@solid-slopkit/components';
import { bind, email, form, required, submit } from '@solid-slopkit/signal-forms';

// The Model is a plain store. form() takes the store and its setter, plus a schema function
// that attaches rules to paths. bind() spreads a Field onto a slopkit input.
export default function UsageDemo() {
  const [model, setModel] = createStore({ name: '', email: '' });
  const f = form(model, setModel, (p) => {
    required(p.name, 'Enter your name');
    required(p.email, 'Enter your email');
    email(p.email);
  });
  const [sent, setSent] = createSignal<string>();

  return (
    <form
      novalidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit(f, (value) => setSent(JSON.stringify(value)));
      }}
    >
      <Stack gap={2} style={{ 'max-width': '20rem' }}>
        <TextInput label="Name" {...bind.text(f.name)} />
        <TextInput label="Email" {...bind.text(f.email)} />
        <Button type="submit" variant="outline">
          Sign up
        </Button>
        <Text size="sm">{sent() ?? 'Nothing submitted yet.'}</Text>
      </Stack>
    </form>
  );
}
```

## Field state

```tsx
import { createStore } from 'solid-js';
import { Code, Stack, TextInput } from '@solid-slopkit/components';
import { bind, form, minLength, required } from '@solid-slopkit/signal-forms';

// Every Field exposes its state through `$`-prefixed accessors. Each one is a signal:
// read it in JSX and only that text updates.
export default function FieldStateDemo() {
  const [model, setModel] = createStore({ username: '' });
  const f = form(model, setModel, (p) => {
    required(p.username);
    minLength(p.username, 3, 'At least 3 characters');
  });
  const state = () => ({
    $value: f.username.$value(),
    $touched: f.username.$touched(),
    $dirty: f.username.$dirty(),
    $valid: f.username.$valid(),
    $errors: f.username.$errors().map((e) => e.kind),
  });

  return (
    <Stack gap={2} style={{ 'max-width': '20rem' }}>
      <TextInput label="Username" {...bind.text(f.username)} />
      <Code block>{JSON.stringify(state(), null, 2)}</Code>
    </Stack>
  );
}
```
