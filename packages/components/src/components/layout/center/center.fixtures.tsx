// SSR scenarios for center.test.tsx.
import { Center } from '.';

export const blockAndInline = () => (
  <Center class="mine" style={{ height: '5rem' }}>
    <span>
      Text with an <Center inline>*</Center> inside
    </span>
  </Center>
);
