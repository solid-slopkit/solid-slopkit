import { Highlight, Text } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Text>
      <Highlight highlight="theme">
        A theme sets the color roles and shape tokens. Every Theme supports one or both color schemes.
      </Highlight>
    </Text>
  );
}
