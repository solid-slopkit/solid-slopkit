// SSR scenarios for overlay.test.tsx.
import { Overlay } from '.';

export const overlays = () => (
  <div style={{ position: 'relative', height: '120px' }}>
    <p>Behind</p>
    <Overlay />
    <Overlay color="primary" backgroundOpacity={0.3} blur={4} center class="mine">
      <span>On top</span>
    </Overlay>
  </div>
);
