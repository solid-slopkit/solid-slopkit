import { For } from 'solid-js';
import { Checkbox, SimpleGrid, Text } from '@solid-slopkit/components';

const plans = [
  { value: 'backups', title: 'Daily backups', text: 'Kept for 30 days.' },
  { value: 'support', title: 'Priority support', text: 'An answer within four hours.' },
  { value: 'domain', title: 'Custom domain', text: 'Serve it from your own address.' },
];

export default function Card() {
  return (
    <Checkbox.Group label="Add-ons" defaultValue={['backups']} style={{ width: '100%' }}>
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={3}>
        <For each={plans}>
          {(plan) => (
            <Checkbox.Card value={plan.value}>
              <Text weight="semibold">{plan.title}</Text>
              <Text size="sm" dimmed>
                {plan.text}
              </Text>
            </Checkbox.Card>
          )}
        </For>
      </SimpleGrid>
    </Checkbox.Group>
  );
}
