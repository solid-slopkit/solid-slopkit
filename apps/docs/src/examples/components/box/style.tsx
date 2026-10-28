import { Box } from '@solid-slopkit/components';

export default function Style() {
  return (
    <Box class="my-box" style={{ padding: '1rem', border: '1px dashed currentColor', 'max-width': '20rem' }}>
      Style as an object, with kebab-case keys
    </Box>
  );
}
