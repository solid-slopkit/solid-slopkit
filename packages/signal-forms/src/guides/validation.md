# Validation

`import { required, minLength, validate, error, validateStandardSchema } from "@solid-slopkit/signal-forms";`

Rules are attached to a path inside the schema function passed to `form()`. Several rules on one path all run; their errors are listed in the order declared. A disabled field reports no errors.

| Validator                                     | Fails when                                                                  | Error kind    |
| --------------------------------------------- | --------------------------------------------------------------------------- | ------------- |
| `required(p, message = 'Required')`           | the value is empty: `null`, `undefined`, `""` or `[]`                       | `required`    |
| `min(p, n, message?)` / `max(p, n, message?)` | a present number is below `n` / above `n`; `p` must be a `number` path      | `min` / `max` |
| `minLength(p, n, message?)`                   | a non-empty string or array is shorter than `n`                             | `minLength`   |
| `maxLength(p, n, message?)`                   | a string or array is longer than `n`                                        | `maxLength`   |
| `email(p, message?)`                          | a non-empty string is not a plausible email                                 | `email`       |
| `pattern(p, re, message?)`                    | a non-empty string does not match `re`                                      | `pattern`     |
| `validate(p, fn)`                             | `fn(ctx)` returns an error spec                                             | yours         |
| `validateAsync(p, fn)`                        | the promise from `fn(ctx)` resolves to an error spec (see Submit and async) | yours         |
| `validateStandardSchema(p, schema)`           | a Standard Schema reports issues (zod, valibot, arktype)                    | `standard`    |

## Custom and cross-field rules

`validate(p.x, (ctx) => …)` returns `null` when fine, `error(kind, message?)` for a failure, or an array of them. `ctx.value()` is this field's value; `ctx.valueOf(p.other)` reads any other field. Both are reactive.

```tsx
import { createStore } from 'solid-js';
import { PasswordInput, Stack, TextInput } from '@solid-slopkit/components';
import { bind, email, error, form, maxLength, minLength, pattern, required, validate } from '@solid-slopkit/signal-forms';

// Built-in validators, a custom one, and a cross-field one that reads another field with valueOf().
export default function ValidationDemo() {
  const [model, setModel] = createStore({ username: '', email: '', password: '', confirm: '' });
  const f = form(model, setModel, (p) => {
    required(p.username);
    minLength(p.username, 3);
    maxLength(p.username, 12);
    pattern(p.username, /^[a-z0-9_]*$/, 'Lowercase letters, digits and _ only');

    required(p.email);
    email(p.email);

    validate(p.password, (ctx) => (/\d/.test(ctx.value()) ? null : error('digit', 'Add at least one digit')));
    validate(p.confirm, (ctx) => (ctx.value() === ctx.valueOf(p.password) ? null : error('match', 'Passwords do not match')));
  });

  return (
    <Stack gap={2} style={{ 'max-width': '20rem' }}>
      <TextInput label="Username" {...bind.text(f.username)} />
      <TextInput label="Email" {...bind.text(f.email)} />
      <PasswordInput label="Password" {...bind.text(f.password)} />
      <PasswordInput label="Confirm password" {...bind.text(f.confirm)} />
    </Stack>
  );
}
```

## Errors

`f.x.$errors()` is a list of `{ kind, field, message? }`, where `field` is the path of the field the error belongs to. A leaf reports its own errors; a container reports its own plus every enabled descendant's. `$valid()` / `$invalid()` derive from it. `bind()` shows the first message once the field is touched.

## Standard Schema

Any `~standard` schema works with no adapter (the interface is vendored; there is no schema dependency). Each issue lands on the field its path locates, relative to the value you validated, with kind `standard`. Sync and async schemas both work; an async one makes the field pending. It settles on the next reactive flush, not on the first read.

```ts
form(model, setModel, (p) => {
  validateStandardSchema(p.address, AddressSchema); // issues land on f.address.street, …
});
```
