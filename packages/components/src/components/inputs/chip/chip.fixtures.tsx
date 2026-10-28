// SSR scenarios for chip.test.tsx.
import { Chip } from '.';

export const chips = () => (
  <div>
    <Chip class="mine">Alone</Chip>
    <Chip defaultChecked variant="filled" color="success">
      On
    </Chip>
    <Chip.Group label="Size" defaultValue="m">
      <Chip value="s">Small</Chip>
      <Chip value="m">Medium</Chip>
    </Chip.Group>
    <Chip.Group multiple aria-label="Tags" defaultValue={['solid']} size="sm">
      <Chip value="solid">Solid</Chip>
      <Chip value="css" disabled>
        CSS
      </Chip>
    </Chip.Group>
  </div>
);
