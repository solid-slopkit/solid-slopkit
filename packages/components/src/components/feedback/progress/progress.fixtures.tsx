// SSR scenarios for progress.test.tsx.
import { Progress } from '.';

export const bars = () => (
  <div>
    <Progress class="mine" value={40} />
    <Progress value={3} max={5} color="success" size="lg" striped label="Steps done" />
    <Progress label="Uploading" />
  </div>
);
