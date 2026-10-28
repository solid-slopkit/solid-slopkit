import { Grid } from '@solid-slopkit/components';

const surface = { background: 'var(--slp-color-base-200)', padding: '0.5rem', width: '100%' };
const item = { background: 'var(--slp-color-base-300)', padding: '0.5rem' };

export default function Offset() {
  return (
    <Grid style={surface}>
      <Grid.Col span={3} style={item}>
        span={'{3}'}
      </Grid.Col>
      <Grid.Col span={3} offset={3} style={item}>
        offset={'{3}'}
      </Grid.Col>
      <Grid.Col span={4} offset={4} style={item}>
        span={'{4}'} offset={'{4}'}
      </Grid.Col>
    </Grid>
  );
}
