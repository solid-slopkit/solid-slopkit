import { createSignal, For } from 'solid-js';
import { Button, Pill, Stack } from '@solid-slopkit/components';

const all = ['Berlin', 'Lisbon', 'Oslo', 'Prague', 'Vienna'];

export default function Removable() {
  const [cities, setCities] = createSignal(all);

  return (
    <Stack align="start">
      <Pill.Group>
        <For each={cities()}>
          {(city) => (
            <Pill withRemoveButton onRemove={() => setCities((list) => list.filter((other) => other !== city))}>
              {city}
            </Pill>
          )}
        </For>
      </Pill.Group>
      <Button variant="outline" size="sm" disabled={cities().length === all.length} onClick={() => setCities(all)}>
        Reset
      </Button>
    </Stack>
  );
}
