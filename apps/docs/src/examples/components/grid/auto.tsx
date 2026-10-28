import { Grid } from '@solid-slopkit/components';

const surface = { background: 'var(--slp-color-base-200)', padding: '0.5rem', width: '100%' };
const item = { background: 'var(--slp-color-base-300)', padding: '0.5rem' };

export default function Auto() {
  return (
    <>
      <Grid style={surface}>
        <Grid.Col span="auto" style={item}>
          span="auto"
        </Grid.Col>
        <Grid.Col span={6} style={item}>
          span={'{6}'}
        </Grid.Col>
        <Grid.Col span="auto" style={item}>
          span="auto"
        </Grid.Col>
      </Grid>
      <Grid style={surface}>
        <Grid.Col span="content" style={item}>
          span="content"
        </Grid.Col>
        <Grid.Col span="auto" style={item}>
          span="auto" takes the rest
        </Grid.Col>
      </Grid>
    </>
  );
}
