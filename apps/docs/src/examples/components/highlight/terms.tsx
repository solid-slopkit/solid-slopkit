import { Highlight, Text } from '@solid-slopkit/components';

export default function Terms() {
  return (
    <>
      <Text>
        <Highlight highlight={['color role', 'color']} color="info">
          A color role names the purpose a color serves; the theme decides the color.
        </Highlight>
      </Text>
      <Text>
        <Highlight highlight="Theme" caseSensitive color="success">
          Theme matches here, but theme does not.
        </Highlight>
      </Text>
    </>
  );
}
