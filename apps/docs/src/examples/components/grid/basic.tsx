import { Grid } from '@solid-slopkit/components';

const surface = { background: 'var(--slp-color-base-200)', padding: '0.5rem', width: '100%' };
const item = { background: 'var(--slp-color-base-300)', padding: '0.5rem' };

export default function Basic() {
  return (
    <Grid style={surface}>
      <Grid.Col span={4} style={item}>
        span={'{4}'}
      </Grid.Col>
      <Grid.Col span={4} style={item}>
        span={'{4}'}
      </Grid.Col>
      <Grid.Col span={4} style={item}>
        span={'{4}'}
      </Grid.Col>
      <Grid.Col span={8} style={item}>
        span={'{8}'}
      </Grid.Col>
      <Grid.Col span={4} style={item}>
        span={'{4}'}
      </Grid.Col>
    </Grid>
  );
}
