import { createSignal, For } from 'solid-js';
import { Button, Group, Stack, Text } from '@solid-slopkit/components';
import { Carousel, type EmblaCarouselType } from '@solid-slopkit/components/carousel';

const steps = ['Pick a plan', 'Add your team', 'Connect a repo', 'Deploy'];

export default function Api() {
  const [api, setApi] = createSignal<EmblaCarouselType>();
  const [index, setIndex] = createSignal(0);

  return (
    <Stack gap={3} style={{ width: '100%', 'max-width': '28rem' }}>
      <Carousel aria-label="Setup" withControls={false} apiRef={setApi} onSlideChange={setIndex}>
        <For each={steps}>
          {(step) => (
            <Carousel.Slide>
              <div
                style={{
                  display: 'grid',
                  'place-items': 'center',
                  height: '8rem',
                  'border-radius': '1rem',
                  background: 'var(--slp-color-base-200)',
                  'font-size': '1.125rem',
                }}
              >
                {step}
              </div>
            </Carousel.Slide>
          )}
        </For>
      </Carousel>
      <Group justify="space-between">
        <Button variant="outline" size="sm" disabled={index() === 0} onClick={() => api()?.scrollPrev()}>
          Back
        </Button>
        <Text size="sm" dimmed>
          Step {index() + 1} of {steps.length}
        </Text>
        <Button size="sm" disabled={index() === steps.length - 1} onClick={() => api()?.scrollNext()}>
          Next
        </Button>
      </Group>
    </Stack>
  );
}
