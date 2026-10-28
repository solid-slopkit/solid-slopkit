# Scope, and asynchronous validation as the one owned effect

Forms covers: `form()`, `schema()`, the Field Tree and Field State, the Structure Combinators, the synchronous Validators, the conditions, Control and Binding, `submit`, asynchronous validation (`validateAsync`, `validateStandardSchema`) and Metadata.

It does not include a bridge to other form libraries or a validator that issues HTTP requests. Both belong to the app: `validateAsync` takes any async function, so an HTTP check is a few lines on top of it. They are recorded here so nobody adds them back as if they had been forgotten.

## Asynchronous validation

Solid 2's async primitive is the async memo, built for render-time suspense: a pending read that reaches no loading boundary throws. A Field must expose `$pending` and `$errors` as plain accessors that never throw and never hold a boundary. So `validateAsync` is the one owned effect in the library; all other derived state is a lazy memo (ADR 0020).

- The effect's compute phase runs each async rule up to its first `await`, tracking the reads made there, and returns the in-flight promises.
- The effect phase sets Pending and, when the latest run settles, writes the errors into a signal that `$errors` folds in.
- A generation counter drops results of superseded runs (fast typing).
- A `disposed` flag, set from an `onCleanup` on the form's owner (not the effect's own cleanup, which runs between runs), drops results that arrive after teardown.

## Consequences

- Async validation rides Solid's own reactivity and the form's owner; there is no scheduler of forms' own.
- `$pending` and `$errors` are safe to read anywhere, including outside a loading boundary.
