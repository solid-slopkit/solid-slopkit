import { For } from 'solid-js';
import { Carousel } from '@solid-slopkit/components/carousel';

const colors = ['primary', 'secondary', 'accent', 'info', 'success'];

export default function Basic() {
  return (
    <Carousel aria-label="Colors" withIndicators style={{ width: '100%', 'max-width': '32rem' }}>
      <For each={colors}>
        {(color) => (
          <Carousel.Slide>
            <div
              style={{
                display: 'grid',
                'place-items': 'center',
                height: '12rem',
                'border-radius': '1rem',
                background: `var(--slp-color-${color})`,
                color: `var(--slp-color-${color}-content)`,
                'font-size': '1.25rem',
                'font-weight': 600,
              }}
            >
              {color}
            </div>
          </Carousel.Slide>
        )}
      </For>
    </Carousel>
  );
}
