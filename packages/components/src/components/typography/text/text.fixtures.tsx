// SSR scenarios for text.test.tsx.
import { Text } from '.';

export const variants = () => (
  <div>
    <Text>Paragraph</Text>
    <Text size="xs" color="primary" weight="medium" class="mine">
      Small primary
    </Text>
    <Text dimmed truncate>
      Dimmed and truncated
    </Text>
    <Text as="span" lineClamp={2} style={{ color: 'red' }}>
      Inline, clamped
    </Text>
    <Text size="4xl" align="end" tabularNums transform="uppercase">
      $1,240
    </Text>
    <Text as="label" inherit for="x">
      Label
    </Text>
  </div>
);
