// SSR scenarios for loading-overlay.test.tsx.
import { LoadingOverlay } from '.';

export const overlays = () => (
  <div>
    <div style={{ position: 'relative', height: '80px' }}>
      <p>Hidden overlay</p>
      <LoadingOverlay visible={false} />
    </div>
    <div style={{ position: 'relative', height: '80px' }}>
      <p>Shown overlay</p>
      <LoadingOverlay visible label="Saving" loaderVariant="dots" class="mine" />
    </div>
    <div style={{ position: 'relative', height: '80px' }}>
      <p>Custom loader</p>
      <LoadingOverlay visible loader={<strong>Almost there</strong>} />
    </div>
  </div>
);
