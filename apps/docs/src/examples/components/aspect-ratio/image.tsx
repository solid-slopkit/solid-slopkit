import { For } from 'solid-js';
import { AspectRatio, SimpleGrid } from '@solid-slopkit/components';
import landscape from '../example-landscape.svg';

export default function Image() {
  return (
    <SimpleGrid cols={3} spacing={2} style={{ width: '100%' }}>
      <For
        each={[
          { ratio: 1, label: '1' },
          { ratio: 16 / 9, label: '16 / 9' },
          { ratio: 3 / 4, label: '3 / 4' },
        ]}
      >
        {({ ratio, label }) => (
          <figure style={{ margin: 0 }}>
            <AspectRatio ratio={ratio}>
              <img src={landscape} alt="Mountains at sunset" />
            </AspectRatio>
            <figcaption>ratio={`{${label}}`}</figcaption>
          </figure>
        )}
      </For>
    </SimpleGrid>
  );
}
