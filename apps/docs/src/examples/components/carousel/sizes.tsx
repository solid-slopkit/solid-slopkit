import { For } from 'solid-js';
import { Paper, Text, Title } from '@solid-slopkit/components';
import { Carousel } from '@solid-slopkit/components/carousel';

const trips = [
  { title: 'Lisbon', days: 4 },
  { title: 'Kyoto', days: 9 },
  { title: 'Reykjavík', days: 6 },
  { title: 'Oaxaca', days: 7 },
  { title: 'Tbilisi', days: 5 },
  { title: 'Hobart', days: 8 },
];

export default function Sizes() {
  return (
    <Carousel aria-label="Trips" slideSize="45%" slideGap={4} style={{ width: '100%', 'max-width': '36rem' }}>
      <For each={trips}>
        {(trip) => (
          <Carousel.Slide>
            <Paper withBorder style={{ height: '100%' }}>
              <Title order={4}>{trip.title}</Title>
              <Text size="sm" dimmed>
                {trip.days} days
              </Text>
            </Paper>
          </Carousel.Slide>
        )}
      </For>
    </Carousel>
  );
}
