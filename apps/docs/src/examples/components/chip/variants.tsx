import { Chip, Group } from '@solid-slopkit/components';

export default function Variants() {
  return (
    <Group>
      <Chip defaultChecked>Soft</Chip>
      <Chip defaultChecked variant="outline">
        Outline
      </Chip>
      <Chip defaultChecked variant="filled">
        Filled
      </Chip>
      <Chip defaultChecked variant="filled" color="success">
        Success
      </Chip>
      <Chip>Off</Chip>
    </Group>
  );
}
