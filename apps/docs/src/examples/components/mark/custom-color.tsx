import { Mark, Text } from '@solid-slopkit/components';

export default function CustomColor() {
  return (
    <Text>
      A one-off color goes through the <Mark style={{ '--slp-mark-color': '#e64980' }}>custom property</Mark>.
    </Text>
  );
}
