import { createSignal } from 'solid-js';
import { Button, Spoiler, Stack, Text } from '@solid-slopkit/components';

const sentence = 'Each line adds to the note. ';

export default function Fits() {
  const [count, setCount] = createSignal(1);

  return (
    <Stack align="start" style={{ width: '100%' }}>
      <Button variant="outline" onClick={() => setCount((value) => value + 4)}>
        Add text
      </Button>
      <Spoiler maxHeight={72} showLabel="Read the whole note" hideLabel="Show less of the note">
        <Text>{sentence.repeat(count())}</Text>
      </Spoiler>
    </Stack>
  );
}
