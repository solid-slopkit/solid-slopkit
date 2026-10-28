// SSR scenarios for slider.test.tsx.
import { Slider } from '.';

export const sliders = () => (
  <div>
    <Slider label="Volume" defaultValue={40} class="mine" />
    <Slider
      label="Size"
      min={0}
      max={4}
      step={1}
      value={2}
      marks={[
        { value: 0, label: 'XS' },
        { value: 2, label: 'M' },
        { value: 4, label: 'XL' },
      ]}
      color="success"
      size="lg"
      name="size"
    />
    <Slider label="Locked" disabled defaultValue={70} valueLabel={null} />
  </div>
);
