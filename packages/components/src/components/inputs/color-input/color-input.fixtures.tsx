// SSR scenarios for color-input.test.tsx.
import { ColorInput } from '.';

export const colorInputs = () => (
  <div>
    <ColorInput label="Color" placeholder="Pick a color" class="mine" />
    <ColorInput label="Overlay" name="overlay" format="rgba" defaultValue="rgba(0, 0, 0, 0.5)" swatches={['#000000']} />
    <ColorInput label="Plain" withPicker={false} hideSwatch defaultValue="#ffffff" error="Required" />
    <ColorInput label="Disabled" disabled defaultValue="#868e96" />
  </div>
);
