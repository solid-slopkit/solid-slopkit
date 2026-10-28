import { Box, SimpleGrid, Stack } from '@solid-slopkit/components';
import * as A from './cards/two-a';
import * as B from './cards/two-b';
import * as C from './cards/two-c';

// The second preview page: product and developer tools. Seven equal columns.
export function PageTwo() {
  return (
    <Box w="3000px" p={10}>
      <SimpleGrid cols={7} spacing={10}>
        <Stack gap={10}>
          <A.Column1 />
        </Stack>
        <Stack gap={10}>
          <A.Column2 />
        </Stack>
        <Stack gap={10}>
          <A.Column3 />
        </Stack>
        <Stack gap={10}>
          <B.Column4 />
        </Stack>
        <Stack gap={10}>
          <B.Column5 />
        </Stack>
        <Stack gap={10}>
          <C.Column6 />
        </Stack>
        <Stack gap={10}>
          <C.Column7 />
        </Stack>
      </SimpleGrid>
    </Box>
  );
}
