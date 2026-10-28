// SSR scenarios for color-swatch.test.tsx.
import { ColorSwatch } from '.';

export const swatches = () => (
  <div>
    <ColorSwatch class="mine" value="#7048e8" />
    <ColorSwatch value="rgb(0 0 0 / 40%)" size="lg" role="img" aria-label="Black at 40%" />
    <ColorSwatch value="var(--slp-color-primary)" style={{ 'border-radius': '4px' }}>
      <svg aria-hidden="true" viewBox="0 0 24 24" />
    </ColorSwatch>
  </div>
);
