# Two binding layers: `control()` for native elements, `bind()` for components

A Field reaches the view by spreading props, in one of two layers:

1. **Control** (`control()`, `control.checkbox`, `control.number`, `control.select`) binds a Field to a native element: `<input {...control(f.email)} />`. It deals in DOM events and parses DOM values, so each input type that parses differently has its own variant.
2. **Binding** (`bind()`, `bind.text()`, `bind.checked()`, `bind.nativeSelect()`) returns the props a component with a typed value takes: `value`, `onChange(value)`, `onBlur`, `error`, `disabled`, `readOnly`, `required`, all getters, so a spread tracks the Field. Because the typed value is already the contract (ADR 0016), it needs no variant per component type, only per prop shape: `bind.checked()` for `checked` components (`Checkbox`, `Switch`), and `bind.text()` for the text inputs (`TextInput`, `Textarea`, `PasswordInput`), which pass `value` and `onInput` to their native element, and `bind.nativeSelect()` for `NativeSelect`, whose `onChange` stays the native `change` event (it is the browser's select, and keeps the browser's event). `error` is the first error's message once the Field is Touched (`submit` touches every Field), so a pristine form shows no errors.

Spreading props works the same on elements and components, stays fully typed, renders on the server, and needs no registration.

## Considered Options

- **A `use:` directive:** short, but directives run only on DOM elements, need TypeScript module augmentation, and break when the bundler drops an import that looks unused. Left as possible sugar for plain text inputs.
- **Wrapper components** (`<Field of={…}>`): full control, but verbose, and the wiring moves back into the app.
- **Only `control()`, with components accepting DOM events:** rejected. Components report typed values, and several have no single DOM input to read (`Select`, `MultiSelect`, `ColorPicker`).

## Consequences

- Every binding site is an explicit spread.
- The Field's type must be the type the component reports (`string | null` for `Select`, `number | undefined` for `NumberInput`). A mismatch is a type error, not a coercion.
- The forms tests and docs demos render the real `@solid-slopkit/components` inputs; they are the integration test of the Binding layer.
