# Fields are reached by property; their state is `$`-prefixed

A Field is reached by plain property access over the Model's keys, `f.address.street`, and exposes its own state through `$`-prefixed accessors: `f.email.$value()`, `f.email.$valid()`, `f.email.$errors()`. A Container has the same accessors for its Aggregate State (`f.address.$valid()`).

The Model has arbitrary user keys (ADR 0018), and keys like `value`, `label` or `errors` are common in key/value editors and option rows. If navigation and state shared bare names, `f.value` could mean either a child named `value` or the field's value, silently. One `$` keeps navigation reading like the data and separates state with one visible character.

## Considered Options

- **A callable Field** (`f.email().value()`): no collision, but two calls per read.
- **A state namespace** (`f.email.$.value()`): no collision, but a wrapper object and an extra hop on every read.
- **`$`-prefixed accessors:** chosen. One character, no wrapper. It collides only with a Model key that itself starts with `$`.

## Consequences

- A Model key starting with `$` collides with Field State. This is documented, not guarded.
- Writing uses a companion accessor, `$set(next)`. It works on a Leaf, on a Container (replacing the subtree) and on the root (replacing the Model). Views write through a Control or Binding (ADR 0021); `$set` is the imperative route. Both write outside owned scopes (from handlers or effects), as Solid 2 requires.
