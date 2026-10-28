import { Button } from '@solid-slopkit/components';

export default function Disabled() {
  return (
    <>
      <Button color="primary" disabled>
        Solid
      </Button>
      <Button color="primary" variant="outline" disabled>
        Outline
      </Button>
      <Button color="primary" variant="ghost" disabled>
        Ghost
      </Button>
      <Button color="primary" variant="link" disabled>
        Link
      </Button>
    </>
  );
}
