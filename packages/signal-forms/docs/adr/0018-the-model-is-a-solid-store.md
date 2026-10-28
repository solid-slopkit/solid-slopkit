# The Model is a Solid store

The source of truth for a form is a Solid store and its setter: `form(model, setModel, schema?)`. A Leaf reads straight from the store, which is already reactive per property, and writes through the setter. Forms keeps no copy of the data and no per-field signals of its own.

In Solid 2 a store setter is a draft-mutation function, `setModel(d => { d.a.b.c = v })`, not the path-argument form. A Leaf's write closes over its own path and mutates the draft there, and the store still updates only what changed.

## Considered Options

- **One signal per field, sliced out of a root value:** rejected. That machinery exists to get per-field reactivity out of a coarse root value, which is exactly what a store already provides. Rebuilding it would duplicate the platform and bring back coarse invalidation.
- **Forms owns the data and exposes a getter:** rejected. The app could no longer share the Model with code outside the form, or reset it with its own setter.

## Consequences

- Fields expose the value through an accessor (`$value`, ADR 0019), so consumers never handle store paths directly.
- Nested objects and arrays are reactive per property without extra work. Inserting, removing or reordering array items follows the store's reconciliation, not a diff of forms' own.
