import { AspectRatio, Center } from '@solid-slopkit/components';

export default function Content() {
  return (
    <AspectRatio ratio={21 / 9} style={{ width: '100%' }}>
      <Center style={{ background: 'var(--slp-color-base-300)' }}>ratio={'{21 / 9}'}: any element, such as an iframe</Center>
    </AspectRatio>
  );
}
