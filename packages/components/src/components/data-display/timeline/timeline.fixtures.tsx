// SSR scenarios for timeline.test.tsx.
import { Timeline } from '.';

const Icon = () => <svg aria-hidden="true" viewBox="0 0 24 24" />;

export const timelines = () => (
  <Timeline class="mine" color="success">
    <Timeline.Item active title="Ordered" bullet={<Icon />}>
      Monday
    </Timeline.Item>
    <Timeline.Item active title="Shipped" bullet="2" />
    <Timeline.Item title="Delivered">Expected Friday</Timeline.Item>
  </Timeline>
);
