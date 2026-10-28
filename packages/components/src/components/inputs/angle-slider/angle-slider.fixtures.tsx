// SSR scenarios for angle-slider.test.tsx.
import { AngleSlider } from '.';

export const angleSliders = () => (
  <div>
    <AngleSlider label="Direction" defaultValue={90} class="mine" name="direction" />
    <AngleSlider label="Hue" value={200} step={15} marks={[0, 90, 180, 270]} color="secondary" size="lg" />
    <AngleSlider label="Locked" disabled defaultValue={45} valueLabel={null} />
  </div>
);
