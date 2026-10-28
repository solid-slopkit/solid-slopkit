import { For } from 'solid-js';
import { Grid } from '@solid-slopkit/components';

const surface = { background: 'var(--slp-color-base-200)', padding: '0.5rem', width: '100%' };
const item = { background: 'var(--slp-color-base-300)', padding: '0.5rem' };

export default function Grow() {
  return (
    <Grid grow style={surface}>
      <For each={['a', 'b', 'c', 'd', 'e']}>
        {(label) => (
          <Grid.Col span={4} style={item}>
            {label}: span={'{4}'}
          </Grid.Col>
        )}
      </For>
    </Grid>
  );
}
