// SSR scenarios for semi-circle-progress.test.tsx.
import { SemiCircleProgress } from '.';

export const gauges = () => (
  <div>
    <SemiCircleProgress class="mine" value={40}>
      40%
    </SemiCircleProgress>
    <SemiCircleProgress value={3} max={5} color="success" size="lg" label="Steps done" />
    <SemiCircleProgress value={0} size="sm" />
    <SemiCircleProgress label="Measuring" />
  </div>
);
