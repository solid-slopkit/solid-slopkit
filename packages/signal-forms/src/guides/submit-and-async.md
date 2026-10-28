# Submit and async

`import { submit, validateAsync, error } from "@solid-slopkit/signal-forms";`

## submit(f, handler)

In order: marks every field touched (so all errors show), waits for async validation to settle, stops if the form is invalid (the handler does not run), then calls `handler(value)` with the form's data, **disabled fields left out**. Call it from an event handler.

- `f.$submitting()` is true while the handler runs, on every field; false when submit was blocked.
- A second `submit()` while one runs (validating or in its handler) is ignored.
- The handler may be async and may return anything (ignored). If it throws, `$submitting` still clears and the rejection reaches the caller.
- The returned promise resolves when the whole call is done, also when blocked.

```tsx
import { createSignal, createStore } from 'solid-js';
import { Button, Stack, Text, TextInput } from '@solid-slopkit/components';
import { bind, form, required, submit } from '@solid-slopkit/signal-forms';

const save = (value: { title: string }) =>
  new Promise<string>((resolve) => setTimeout(() => resolve(`Saved "${value.title}"`), 800));

// submit() touches every field so errors show, stops when the form is invalid, and otherwise runs
// the handler with the form's value (disabled fields left out). $submitting is true while it runs.
export default function SubmitDemo() {
  const [model, setModel] = createStore({ title: '' });
  const f = form(model, setModel, (p) => required(p.title, 'Enter a title'));
  const [result, setResult] = createSignal<string>();

  return (
    <form
      novalidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit(f, async (value) => setResult(await save(value)));
      }}
    >
      <Stack gap={2} style={{ 'max-width': '20rem' }}>
        <TextInput label="Title" {...bind.text(f.title)} />
        <Button type="submit" variant="outline" loading={f.$submitting()}>
          Save
        </Button>
        <Text size="sm">{result() ?? 'Not saved yet.'}</Text>
      </Stack>
    </form>
  );
}
```

## validateAsync(p, fn)

`fn(ctx)` returns a promise of `null` or `error(kind, message?)`. Read every value you depend on **before** the first `await`: reads after it are not tracked, so a later change would not re-run the check. A change while a check runs drops the old result.

- `f.x.$pending()` is true while a check on the field or a descendant is in flight. A disabled field runs no async validators.
- Guard empty values yourself so an empty field does not hit the network.
- **A rejected promise counts as "no error"** and clears `$pending`. Catch network failures inside the validator and return `error(…)` if they should show.
- An async validator starts when its field is first reached: rendered, read in code, or touched by `submit()`, which reaches every field.

```tsx
import { createStore } from 'solid-js';
import { Stack, Text, TextInput } from '@solid-slopkit/components';
import { bind, error, form, required, validateAsync } from '@solid-slopkit/signal-forms';

const TAKEN = ['ada', 'grace', 'linus'];
const lookup = (name: string) => new Promise<boolean>((resolve) => setTimeout(() => resolve(TAKEN.includes(name)), 600));

// An async validator reads the value before its first await; that read is what it tracks. $pending
// is true while a check is in flight, and submit() waits for it before deciding.
export default function AsyncDemo() {
  const [model, setModel] = createStore({ username: '' });
  const f = form(model, setModel, (p) => {
    required(p.username);
    validateAsync(p.username, async (ctx) => {
      const name = ctx.value();
      return name !== '' && (await lookup(name)) ? error('taken', `"${name}" is taken`) : null;
    });
  });

  return (
    <Stack gap={2} style={{ 'max-width': '20rem' }}>
      <TextInput label="Username" {...bind.text(f.username)} />
      <Text size="sm" aria-live="polite">
        {f.username.$pending() ? 'Checking…' : 'Try ada, grace or linus.'}
      </Text>
    </Stack>
  );
}
```
