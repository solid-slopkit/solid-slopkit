import { createSignal } from 'solid-js';
import { Spoiler, Stack, Switch, Text } from '@solid-slopkit/components';

export default function Controlled() {
  const [expanded, setExpanded] = createSignal(false);

  return (
    <Stack style={{ width: '100%' }}>
      <Switch label="Show the full changelog" checked={expanded()} onChange={setExpanded} />
      <Spoiler maxHeight={48} expanded={expanded()} onChange={setExpanded}>
        <Text>2.3: faster search, and the export keeps your column order.</Text>
        <Text>2.2: dark mode for the reports.</Text>
        <Text>2.1: shared folders.</Text>
        <Text>2.0: the new editor.</Text>
      </Spoiler>
    </Stack>
  );
}
