// SSR scenarios for grid.test.tsx.
import { Grid } from '.';

export const columns = () => (
  <Grid gutter={{ base: 2, md: 6 }} grow justify="center" class="mine">
    <Grid.Col span={{ base: 12, md: 6 }}>a</Grid.Col>
    <Grid.Col span={4} offset={{ md: 2 }} order={2}>
      b
    </Grid.Col>
    <Grid.Col span="auto">c</Grid.Col>
    <Grid.Col span="content">d</Grid.Col>
  </Grid>
);
