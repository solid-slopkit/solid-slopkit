import { createSignal } from 'solid-js';
import { MultiSelect, Stack, Text } from '@solid-slopkit/components';

export default function Options() {
  const [cities, setCities] = createSignal<string[]>(['osl']);

  return (
    <Stack style={{ width: '20rem' }}>
      <MultiSelect
        label="Cities"
        description="Up to three"
        placeholder="Search for cities"
        clearable
        hidePickedOptions
        maxValues={3}
        nothingFoundMessage="No city matches"
        value={cities()}
        onChange={(value) => setCities(value)}
        data={[
          {
            group: 'Nordics',
            items: [
              { value: 'cph', label: 'Copenhagen' },
              { value: 'hel', label: 'Helsinki' },
              { value: 'osl', label: 'Oslo' },
              { value: 'sto', label: 'Stockholm' },
            ],
          },
          {
            group: 'Baltics',
            items: [
              { value: 'rix', label: 'Riga' },
              { value: 'tll', label: 'Tallinn', disabled: true },
              { value: 'vno', label: 'Vilnius' },
            ],
          },
        ]}
      />
      <Text size="sm">Value: {cities().join(', ') || 'none'}</Text>
    </Stack>
  );
}
