import { createStore } from 'solid-js';
import { Stack, Textarea } from '@solid-slopkit/components';
import { bind, createMetadataKey, form, MAX_LENGTH, maxLength, metadata } from '@solid-slopkit/signal-forms';

// Metadata says something about a field. The built-in validators publish their limits (MAX_LENGTH,
// MIN, REQUIRED, ...); your own keys carry anything else, such as a hint for the view.
const HINT = createMetadataKey<string>('hint');

export default function Metadata() {
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
