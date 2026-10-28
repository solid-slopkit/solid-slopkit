import { createSignal, For } from 'solid-js';
import { Button, Group, Stack, Timeline } from '@solid-slopkit/components';

const steps = [
  { title: 'Create an account', text: 'Pick a name and a password.' },
  { title: 'Verify your email', text: 'Follow the link we send you.' },
  { title: 'Invite your team', text: 'Add the people you work with.' },
  { title: 'Start a project', text: 'Everything is ready.' },
];

export default function Steps() {
  const [done, setDone] = createSignal(1);

  return (
    <Stack gap={4}>
      <Timeline color="success">
        <For each={steps}>
          {(step, index) => (
            <Timeline.Item active={index() < done()} title={step.title} bullet={index() + 1}>
              {step.text}
            </Timeline.Item>
          )}
        </For>
      </Timeline>
      <Group gap={2}>
        <Button size="sm" variant="outline" onClick={() => setDone((n) => Math.max(n - 1, 0))}>
          Back
        </Button>
        <Button size="sm" onClick={() => setDone((n) => Math.min(n + 1, steps.length))}>
          Next step
        </Button>
      </Group>
    </Stack>
  );
}
