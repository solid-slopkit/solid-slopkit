import { createSignal } from 'solid-js';
import { Button, Collapse, Group, Paper, Stack, Text } from '@solid-slopkit/components';

export default function Controlled() {
  const [opened, setOpened] = createSignal(false);

  return (
    <Stack>
      <Group>
        <Button variant="outline" onClick={() => setOpened(true)}>
          Open
        </Button>
        <Button variant="outline" onClick={() => setOpened(false)}>
          Close
        </Button>
      </Group>
      <Paper withBorder padding="none">
        <Collapse icon="plus" opened={opened()} onChange={setOpened}>
          <Collapse.Title>Return policy</Collapse.Title>
          <Collapse.Content>
            <Text>Return any item within 30 days for a full refund. Return shipping is on us.</Text>
          </Collapse.Content>
        </Collapse>
      </Paper>
    </Stack>
  );
}
