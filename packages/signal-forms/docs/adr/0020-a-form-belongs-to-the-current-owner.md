# A form belongs to the current owner

`form()` registers its computations under the current Solid owner and is torn down when that owner is disposed, like `createStore` or `createMemo`. There is no `dispose()` handle. A form created in a component body goes away with the component; a form that outlives components is created under an explicit `createRoot`. Most derived state (Aggregate State, error lists) is a lazy memo, pulled on read, so it needs no teardown at all.

## Considered Options

- **A self-rooting `form()` that returns `dispose()`:** rejected. It would allow forms at module scope, but every caller would manage the lifetime by hand, and "call it in your component" would stop being enough.

## Consequences

- A `form()` at module scope has no owner and leaks. Solid already warns about computations created without an owner, so forms adds no warning of its own.
- Asynchronous validation needs an owner for its work, and the form's owner provides it (ADR 0022).
