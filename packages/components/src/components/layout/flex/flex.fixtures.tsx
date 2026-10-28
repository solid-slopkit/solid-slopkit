// SSR scenarios for flex.test.tsx.
import { Flex } from '.';

export const styleProps = () => (
  <Flex direction={{ base: 'column', md: 'row' }} gap={{ base: 2, md: 4 }} align="center" justify="space-between" class="mine">
    <Flex display="inline-flex">Nested</Flex>
    <Flex>Plain</Flex>
  </Flex>
);
