import { Blockquote, Stack } from '@solid-slopkit/components';

export default function Colors() {
  return (
    <Stack gap={4}>
      <Blockquote color="primary" attribution="— Release notes">
        Every component reads only theme tokens, so it follows the theme and the color scheme.
      </Blockquote>
      <Blockquote color="warning" attribution="— Migration guide">
        The default theme's values may still change before the first release.
      </Blockquote>
    </Stack>
  );
}
