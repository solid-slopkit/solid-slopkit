import { For } from 'solid-js';
import { Grid } from '@solid-slopkit/components';

const surface = { background: 'var(--slp-color-base-200)', padding: '0.5rem', width: '100%' };
const item = { background: 'var(--slp-color-base-300)', padding: '0.5rem' };

export default function Responsive() {
  return (
    <Grid gutter={{ base: 2, md: 6 }} style={surface}>
      <For each={['a', 'b', 'c', 'd']}>
        {(label) => (
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }} style={item}>
            {label}: {'span={{ base: 12, sm: 6, lg: 3 }}'}
          </Grid.Col>
        )}
      </For>
    </Grid>
  );
}
