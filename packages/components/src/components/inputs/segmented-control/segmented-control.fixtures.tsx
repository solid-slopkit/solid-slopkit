// SSR scenarios for segmented-control.test.tsx.
import { SegmentedControl } from '.';

export const variants = () => (
  <div>
    <SegmentedControl aria-label="View" data={['List', 'Grid', 'Board']} defaultValue="Grid" class="mine" />
    <SegmentedControl
      aria-label="Size"
      data={[{ value: 's', label: 'Small' }, { value: 'm', label: 'Medium', disabled: true }, 'l']}
      orientation="vertical"
      color="primary"
      size="lg"
      fullWidth
      readOnly
    />
    <SegmentedControl aria-label="Off" data={['a', 'b']} disabled withItemsBorders={false} name="off" />
  </div>
);
