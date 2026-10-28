# @solid-slopkit/signal-forms

## 0.2.1

### Patch Changes

- 29c62b7: Reading `$errors()` no longer throws `Cannot read properties of undefined (reading 'length')` when the form was created during a held transition, for example on a lazily loaded page that a guard redirects to during the first page load.

## 0.2.0

### Minor Changes

- d87b5a8: Requires Solid 2.0.0-rc.15 or later (`solid-js` and `@solidjs/web`). A `<select>` bound with `control.select(f)` now selects the Field's value when its options render after the value, for example from a `<For>` over loaded data.

## 0.1.0

### Patch Changes

- efe740e: Adds `bind.nativeSelect(f)` for `NativeSelect`, whose `onChange` stays the native event, and the binding guide now has a row for every `@solid-slopkit/components` input.

## 0.0.1

### Patch Changes

- First release: schema-driven form state for SolidJS 2.x. A Solid store is the model, rules attach to paths, every field's state is a signal, and `bind()` returns the props `@solid-slopkit/components` inputs take. Includes async validation and submission. Ships its LLM references and skills.
