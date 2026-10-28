import { Timeline } from '@solid-slopkit/components';

export default function Plain() {
  return (
    <Timeline color="secondary">
      <Timeline.Item active title="0.0.1">
        First release: layout, buttons, typography and data display.
      </Timeline.Item>
      <Timeline.Item title="0.0.2">Inputs.</Timeline.Item>
      <Timeline.Item title="0.0.3">Overlays and navigation.</Timeline.Item>
    </Timeline>
  );
}
