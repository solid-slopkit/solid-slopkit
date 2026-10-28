import { createSignal, For } from 'solid-js';
import { ColorSwatch } from '@solid-slopkit/components';
import { Check } from '@lucide/solid';

const colors = [
  { name: 'Grape', value: '#7048e8' },
  { name: 'Teal', value: '#0c8599' },
  { name: 'Orange', value: '#f76707' },
  { name: 'Pink', value: '#d6336c' },
];

export default function Picker() {
  const [selected, setSelected] = createSignal('Grape');

  return (
    <div role="group" aria-label="Label color" style={{ display: 'flex', gap: '0.5rem' }}>
      <For each={colors}>
        {(color) => (
          <button
            type="button"
            aria-label={color.name}
            aria-pressed={selected() === color.name ? 'true' : 'false'}
            onClick={() => setSelected(color.name)}
            style={{ padding: '0', border: '0', background: 'none', 'border-radius': '50%', cursor: 'pointer' }}
          >
            <ColorSwatch value={color.value} size="lg" style={{ color: '#fff' }}>
              {selected() === color.name && <Check aria-hidden="true" />}
            </ColorSwatch>
          </button>
        )}
      </For>
    </div>
  );
}
