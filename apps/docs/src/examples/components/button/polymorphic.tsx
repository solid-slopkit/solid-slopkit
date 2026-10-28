import { Button } from '@solid-slopkit/components';
import { ArrowRight } from '@lucide/solid';

export default function Polymorphic() {
  return (
    <>
      <Button as="a" href="#polymorphic" rightSection={<ArrowRight />}>
        Link styled as a button
      </Button>
      <Button as="div" color="primary" variant="soft">
        Div with button role
      </Button>
    </>
  );
}
