import { Badge } from '@solid-slopkit/components';

export default function Variants() {
  return (
    <>
      <Badge color="primary">Solid</Badge>
      <Badge color="primary" variant="soft">
        Soft
      </Badge>
      <Badge color="primary" variant="outline">
        Outline
      </Badge>
      <Badge color="primary" variant="dash">
        Dash
      </Badge>
    </>
  );
}
