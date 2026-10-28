# Signal forms (`@solid-slopkit/signal-forms`)

Schema-driven form state for SolidJS 2.x: a Solid store holds the data, Logic Rules are attached to paths in a Schema, and a Field Tree exposes every field's state as signals.

## Language

### The model and its tree

**Model**:
The plain, user-shaped data a form edits, held in a Solid store. The single source of truth: every Field reads from it and writes back to it.
_Avoid_: state, data object, value bag

**Signal Form** (the **Field Tree**):
The reactive structure `form()` returns, mirroring the shape of the Model. Its root is the Field over the whole Model. "Field Tree" names the same structure when the emphasis is on navigating it.
_Avoid_: form model, control tree

**Field**:
One node of the Signal Form, standing for one slice of the Model. Reached by property access (`f.address.street`); its own state is read through `$`-prefixed accessors.
_Avoid_: field node, control, form control

**Leaf**:
A Field over a primitive Model value. It has state but no children.

**Container**:
A Field over an object or array Model value. It has children and its own Aggregate State.
_Avoid_: group (a layout component in components), fieldset, array control

**Field State**:
The reactive facts about a Field, each a `$`-prefixed accessor: `$value`, `$valid`, `$invalid`, `$errors`, `$touched`, `$dirty`, `$disabled`, `$hidden`, `$readonly`, `$pending`, `$submitting`, and the keyed `$metadata(key)`.
_Avoid_: control state, status

**Aggregate State**:
A Container's Field State computed from its descendants: valid only when every child is valid, dirty when any child is dirty.
_Avoid_: rollup, summary state

### Authoring logic

**Schema**:
A reusable, Model-shaped bundle of Logic Rules that can be attached to a Field Tree or a subtree of it.
_Avoid_: config, ruleset, form definition

**Schema Path**:
The handle passed to a schema function, mirroring the Model's shape (`path.address.street`). Logic Rules are attached by pointing at one. It locates a place in the Model while authoring; it is not a live Field.
_Avoid_: selector, key path

**Logic Rule**:
One piece of behavior attached to a Schema Path: a Validator, a condition (`disabled`, `hidden`, `readonly`), a Structure Combinator or Metadata.
_Avoid_: rule, constraint

**Validator**:
A Logic Rule that inspects a field's value (and the rest of the form) and yields zero or more Validation Errors. Named for its intent: `required`, `min`, `max`, `email`, `pattern`, `minLength`, `maxLength`, or the general `validate`.
_Avoid_: check, assertion

**Structure Combinator**:
A Logic Rule that composes Schemas across the tree instead of judging one field: `apply`, `applyWhen`, `applyWhenValue`, `applyEach`.
_Avoid_: modifier, composer

**Validation Error**:
A structured result of a Validator, with a kind, an optional message and the Field it belongs to. The unit an invalid Field reports through `$errors`.
_Avoid_: error message, failure

**Metadata**:
A descriptive value attached to a Field under a typed **Metadata Key**, by the `metadata` Logic Rule or by the built-in Validators, which publish their limits (`MIN`, `MAX`, `MIN_LENGTH`, `MAX_LENGTH`, `PATTERN`, `REQUIRED`). It says something about a field instead of judging its value, so a view can reflect a constraint without re-deriving it. Read through `$metadata(key)`.
_Avoid_: property, attribute, annotation

### Field status

**Touched**:
A Field the user has visited and left (blurred) at least once.
_Avoid_: visited, focused

**Dirty**:
A Field whose value differs from its initial value.
_Avoid_: modified, changed

**Pending**:
A Field with an asynchronous validation in flight.
_Avoid_: loading, validating, busy

**Submitting**:
The form has a `submit` handler in flight. One form-wide fact, read through any Field's `$submitting`. It turns true when a valid form's handler starts and clears when the handler settles.
_Avoid_: saving, posting

**Disabled / Hidden / Readonly**:
Field conditions set by Logic Rules. Disabled excludes a Field from the form's value, submission and validation. Hidden removes it from the view but keeps it in the value. Readonly keeps it visible and submitted but not editable. Hidden and Readonly Fields still count toward validity.
_Avoid_: inactive, off, locked

### Binding to the view

**Control**:
The props that connect a Field to a native element by spread (`<input {...control(f.email)} />`), with typed variants for non-text inputs (`control.checkbox`, `control.number`, `control.select`).
_Avoid_: adapter, accessor

**Binding**:
The props that connect a Field to a component that takes a typed `value` and `onChange(value)`, by spread (`<Select {...bind(f.country)} />`), with variants for `checked` components (`bind.checked`), text inputs (`bind.text`) and `NativeSelect`, which reports the native `change` event (`bind.nativeSelect`). It also carries the Field's `error` once touched, `disabled`, `readOnly` and `required`. The counterpart of a Control for components.
_Avoid_: adapter, wrapper, accessor

**Owner**:
The Solid reactive owner a form's computations are registered under. A form created in a component is torn down with it; there is no explicit dispose.
_Avoid_: scope, context

### Agent docs

**Skill**:
A task-oriented guide for coding agents (`skills/<area>/SKILL.md`), shipped in the package.
_Avoid_: guide, recipe

**LLM reference**:
Handwritten Markdown for agents next to the source, shipped in the package: one guide per topic. `llms.md` is the package's index.
_Avoid_: llms.txt (that is only the index), API docs
