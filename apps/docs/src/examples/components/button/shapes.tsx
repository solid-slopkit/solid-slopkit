import { Button } from '@solid-slopkit/components';
import { Heart, Plus } from '@lucide/solid';

export default function Shapes() {
  return (
    <>
      <Button shape="square" aria-label="Add">
        <Plus />
      </Button>
      <Button shape="circle" aria-label="Add">
        <Plus />
      </Button>
      <Button shape="square" color="primary" variant="soft" aria-label="Like">
        <Heart />
      </Button>
      <Button shape="circle" color="primary" variant="outline" aria-label="Like">
        <Heart />
      </Button>
    </>
  );
}
