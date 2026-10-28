import { createSignal } from 'solid-js';
import { NativeSelect, Text } from '@solid-slopkit/components';

export default function Groups() {
  const [city, setCity] = createSignal('');

  return (
    <div style={{ width: '100%', 'max-width': '20rem' }}>
      <NativeSelect
        label="City"
        placeholder="Pick a city"
        value={city()}
        onChange={(event) => setCity(event.currentTarget.value)}
        data={[
          { group: 'Europe', items: ['Lisbon', 'Prague', { value: 'kyiv', label: 'Kyiv' }] },
          { group: 'Asia', items: ['Osaka', 'Seoul'] },
        ]}
      />
      <Text size="sm" dimmed style={{ 'margin-top': '0.5rem' }}>
        Chosen: {city() || 'nothing yet'}
      </Text>
    </div>
  );
}
