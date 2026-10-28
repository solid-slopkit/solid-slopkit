import { Box, Grid, Stack } from '@solid-slopkit/components';
import * as A from './cards/one-a';
import * as B from './cards/one-b';
import * as C from './cards/one-c';

// The first preview page: a finance and home dashboard. Six columns of seven; the third is twice as wide. The board
// is wider than the screen on purpose, and the canvas scrolls.
export function PageOne() {
  return (
    <Box w="3000px" p={10}>
      <Grid columns={7} gutter={10} align="start">
        <Grid.Col span={1}>
          <Stack gap={10}>
            <A.Column1 />
          </Stack>
        </Grid.Col>
        <Grid.Col span={1}>
          <Stack gap={10}>
            <A.Column2 />
          </Stack>
        </Grid.Col>
        <Grid.Col span={2}>
          <Stack gap={10}>
            <B.Column3 />
          </Stack>
        </Grid.Col>
        <Grid.Col span={1}>
          <Stack gap={10}>
            <B.Column4 />
          </Stack>
        </Grid.Col>
        <Grid.Col span={1}>
          <Stack gap={10}>
            <C.Column5 />
          </Stack>
        </Grid.Col>
        <Grid.Col span={1}>
          <Stack gap={10}>
            <C.Column6 />
          </Stack>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
