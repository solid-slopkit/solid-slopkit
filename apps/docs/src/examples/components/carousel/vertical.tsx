import { For } from 'solid-js';
import { Paper, Text } from '@solid-slopkit/components';
import { Carousel } from '@solid-slopkit/components/carousel';

const quotes = ['Ship small, ship often.', 'Name things for what they do.', 'Measure before you tune.'];

export default function Vertical() {
  return (
    <Carousel
      aria-label="Quotes"
      orientation="vertical"
      loop
      withIndicators
      style={{ width: '100%', 'max-width': '28rem', height: '9rem' }}
    >
      <For each={quotes}>
        {(quote) => (
          <Carousel.Slide>
            <Paper surface="base-200" style={{ display: 'grid', 'place-items': 'center', height: '100%' }}>
              <Text size="lg">{quote}</Text>
            </Paper>
          </Carousel.Slide>
        )}
      </For>
    </Carousel>
  );
}
