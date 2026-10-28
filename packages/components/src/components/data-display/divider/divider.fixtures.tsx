// SSR scenarios for divider.test.tsx.
import { Divider } from '.';

export const orientations = () => (
  <div>
    <p>Above</p>
    <Divider class="mine" />
    <p>Below</p>
    <Divider variant="dashed" color="primary" />
    <div style={{ display: 'flex' }}>
      <span>Left</span>
      <Divider orientation="vertical" variant="dotted" />
      <span>Right</span>
    </div>
  </div>
);
