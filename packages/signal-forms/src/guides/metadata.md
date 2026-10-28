# Metadata

`import { metadata, createMetadataKey, MAX_LENGTH, REQUIRED } from "@solid-slopkit/signal-forms";`

Metadata says something _about_ a field instead of judging its value. The view reads it with `f.x.$metadata(key)`, reactively; it is `undefined` when nothing is declared.

| Key                         | Published by                  | Type      | Several on one field                       |
| --------------------------- | ----------------------------- | --------- | ------------------------------------------ |
| `REQUIRED`                  | `required()`                  | `boolean` | any true                                   |
| `MIN` / `MAX`               | `min()` / `max()`             | `number`  | most restrictive (larger min, smaller max) |
| `MIN_LENGTH` / `MAX_LENGTH` | `minLength()` / `maxLength()` | `number`  | most restrictive                           |
| `PATTERN`                   | `pattern()`                   | `RegExp`  | the last declared                          |

Your own keys: `createMetadataKey<T>(description?, reduce?)` makes a typed key (its object identity is the key). `metadata(p.x, KEY, value)` attaches a value; the value may be a function of the field's context and is then reactive. `reduce` combines several values declared on one field; without it the last wins. To store a function as the value, wrap it: `() => fn`. `bind()` uses `REQUIRED` for its `required` prop.

```tsx
import { createStore } from 'solid-js';
import { Stack, Textarea } from '@solid-slopkit/components';
import { bind, createMetadataKey, form, MAX_LENGTH, maxLength, metadata } from '@solid-slopkit/signal-forms';

// Metadata says something about a field. The built-in validators publish their limits (MAX_LENGTH,
// MIN, REQUIRED, ...); your own keys carry anything else, such as a hint for the view.
const HINT = createMetadataKey<string>('hint');

export default function MetadataDemo() {
  const [model, setModel] = createStore({ bio: '' });
  const f = form(model, setModel, (p) => {
    maxLength(p.bio, 80);
    metadata(p.bio, HINT, (ctx) => (ctx.value().length === 0 ? 'A sentence about you.' : 'Keep it short.'));
  });

  return (
    <Stack gap={2} style={{ 'max-width': '20rem' }}>
      <Textarea
        label="Bio"
        description={`${f.bio.$metadata(HINT)} ${model.bio.length} / ${f.bio.$metadata(MAX_LENGTH)} characters`}
        {...bind.text(f.bio)}
      />
    </Stack>
  );
}
```
