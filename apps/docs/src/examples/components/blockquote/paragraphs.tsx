import { Blockquote, Stack, Text } from '@solid-slopkit/components';

export default function Paragraphs() {
  return (
    <Blockquote attribution="— A style guide">
      <Stack gap={2}>
        <Text>Write short sentences. Say one thing in each.</Text>
        <Text>Prefer the plain word to the clever one.</Text>
      </Stack>
    </Blockquote>
  );
}
