# Schema logic is plain functions; the host layer is Solid-native

Forms has two layers. The **authoring layer** describes what a form checks and when: `form`, `schema`, the Validators (`required`, `min`, `max`, `email`, `pattern`, `minLength`, `maxLength`, `validate`), the conditions (`disabled`, `hidden`, `readonly`) and the Structure Combinators (`apply`, `applyWhen`, `applyWhenValue`, `applyEach`). These are short, intent-named, pure functions attached to Schema Paths, and they don't touch the DOM or Solid's reactivity. The **host layer** connects that logic to Solid: where the data lives (ADR 0018), how a Field is read (ADR 0019), its lifetime (ADR 0020) and how it reaches an input (ADR 0021). It is built on Solid's own primitives.

Keeping the two apart means the authoring vocabulary stays small and stable, while everything that depends on how Solid works can follow Solid.

## Considered Options

- **`create*` names for the authoring functions** (`createRequired`), the usual Solid naming: rejected. `required` and `min` are pure rule descriptions, not primitives that own reactive state, so the `create` prefix would say something false about them.
- **One layer, with validation and binding in the same objects:** rejected. Validation would then depend on DOM events, and a Schema couldn't be reused across views or tested without rendering.

## Consequences

- The only names an author sees beyond the authoring functions are the host's: `control`, `bind` and the `$`-prefixed Field State.
- The authoring layer can be tested without rendering anything.
