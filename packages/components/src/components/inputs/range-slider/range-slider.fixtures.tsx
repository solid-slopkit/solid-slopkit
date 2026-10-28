// SSR scenarios for range-slider.test.tsx.
import { RangeSlider } from '.';

export const rangeSliders = () => (
  <div>
    <RangeSlider label="Price" defaultValue={[20, 80]} class="mine" name="price" />
    <RangeSlider
      label="Hours"
      min={0}
      max={24}
      value={[9, 17]}
      minRange={1}
      marks={[
        { value: 0, label: '0h' },
        { value: 24, label: '24h' },
      ]}
    />
  </div>
);
