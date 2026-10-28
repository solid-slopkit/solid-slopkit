// SSR scenarios for color-picker.test.tsx.
import { ColorPicker } from '.';

export const colorPickers = () => (
  <div>
    <ColorPicker label="Brand color" defaultValue="#1971c2" class="mine" />
    <ColorPicker
      label="Overlay"
      format="rgba"
      value="rgba(0, 0, 0, 0.5)"
      swatches={['#ff0000', '#00ff00', '#0000ff']}
      size="sm"
    />
    <ColorPicker aria-label="Locked" disabled fullWidth />
  </div>
);
