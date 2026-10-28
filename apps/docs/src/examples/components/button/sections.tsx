import { For } from 'solid-js';
import { Button } from '@solid-slopkit/components';
import { ArrowRight, Download } from '@lucide/solid';

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export default function Sections() {
  return (
    <For each={sizes}>
      {(size) => (
        <div style={{ display: 'flex', gap: '0.5rem', 'flex-wrap': 'wrap', 'align-items': 'center' }}>
          <Button size={size} leftSection={<Download />}>
            Download
          </Button>
          <Button size={size} color="primary" rightSection={<ArrowRight />}>
            Continue
          </Button>
          <Button size={size} variant="outline" leftSection={<Download />} rightSection={<ArrowRight />}>
            Both
          </Button>
        </div>
      )}
    </For>
  );
}
