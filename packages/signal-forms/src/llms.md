# @solid-slopkit/signal-forms

Schema-driven form state for SolidJS 2.x: a Solid store is the model, rules are attached to paths, and a field tree exposes every field's state as signals. It does not depend on `@solid-slopkit/components`, but `bind()` produces exactly the props `@solid-slopkit/components` inputs take.

Before writing a form, read the task guide at `node_modules/@solid-slopkit/signal-forms/skills/signal-forms/SKILL.md`: the rules that prevent the usual mistakes, and a first form. Each link below is a reference for one area. Paths are relative to this file.

## Setup

```bash
pnpm add solid-js @solidjs/web @solid-slopkit/signal-forms
```

```ts
import { form, bind, control, submit, required, email } from '@solid-slopkit/signal-forms';
import { createStore } from 'solid-js'; // the model is a Solid store
```

## API

Entry points: `form(model, setModel, schemaOrFn?)`, `submit(f, handler)`, `bind(f)`, `bind.text(f)`, `bind.checked(f)`, `bind.nativeSelect(f)`, `control(f)`, `control.number(f)`, `control.checkbox(f)`, `control.select(f)`, `schema(fn)`.

Validators (attach to a path): `required`, `min`, `max`, `minLength`, `maxLength`, `email`, `pattern`, `validate`, `validateAsync`, `validateStandardSchema`; build a failure with `error(kind, message?)`.

Conditions: `disabled`, `hidden`, `readonly` (path, optional predicate over the context).

Combinators: `apply`, `applyWhen`, `applyWhenValue`, `applyEach`.

Metadata: `metadata`, `createMetadataKey`, and the keys `MIN`, `MAX`, `MIN_LENGTH`, `MAX_LENGTH`, `PATTERN`, `REQUIRED`.

Types: `Field`, `FieldState`, `SignalForm`, `SubmitHandler`, `Schema`, `SchemaFn`, `SchemaOrFn`, `SchemaPath`, `FieldContext`, `ValidationError`, `Condition`, `MetadataKey`, `StandardSchemaV1`, `ValueBinding`, `TextBinding`, `CheckedBinding`, `NativeSelectBinding`, and the `*ControlProps` of the native adapters.

## References

- [Binding](guides/binding.md): `bind`, `bind.text`, `bind.checked`, `bind.nativeSelect`, `control`; which call and field type fit each `@solid-slopkit/components` input.
- [Validation](guides/validation.md): validators, custom and cross-field rules, errors, Standard Schema.
- [Conditions and combinators](guides/conditions.md): `disabled` / `hidden` / `readonly`, `schema`, `apply`, `applyWhen`, `applyEach`.
- [Submit and async](guides/submit-and-async.md): `submit`, `$submitting`, `validateAsync`, `$pending`.
- [Metadata](guides/metadata.md): `metadata`, `$metadata`, the built-in keys, your own keys.
