import { Stack, Text, VisuallyHidden } from '@solid-slopkit/components';

export default function Heading() {
  return (
    <section aria-labelledby="results-heading">
      <VisuallyHidden as="h2" id="results-heading">
        Search results
      </VisuallyHidden>
      <Stack gap={1}>
        <Text>Theming: a theme sets every token.</Text>
        <Text>Color roles: eight named purposes a color serves.</Text>
      </Stack>
    </section>
  );
}
