import { For } from 'solid-js';
import { Radio, SimpleGrid, Text } from '@solid-slopkit/components';

const options = [
  { value: 'standard', title: 'Standard', text: '3 to 5 working days. Free.' },
  { value: 'express', title: 'Express', text: 'Next working day. €9.' },
  { value: 'pickup', title: 'Pick up', text: 'From the shop, today. Free.' },
];

export default function Card() {
  return (
    <Radio.Group label="Delivery" defaultValue="standard" style={{ width: '100%' }}>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={3}>
        <For each={options}>
          {(option) => (
            <Radio.Card value={option.value}>
              <Text weight="semibold">{option.title}</Text>
              <Text size="sm" dimmed>
                {option.text}
              </Text>
            </Radio.Card>
          )}
        </For>
      </SimpleGrid>
    </Radio.Group>
  );
}
