import { Button } from '@solid-slopkit/components';

export default function Variants() {
  return (
    <>
      <Button color="primary">Solid</Button>
      <Button color="primary" variant="soft">
        Soft
      </Button>
      <Button color="primary" variant="outline">
        Outline
      </Button>
      <Button color="primary" variant="dash">
        Dash
      </Button>
      <Button color="primary" variant="ghost">
        Ghost
      </Button>
      <Button color="primary" variant="link">
        Link
      </Button>
    </>
  );
}
