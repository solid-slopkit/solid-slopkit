import { createSignal } from 'solid-js';
import { Accordion, Stack, Text } from '@solid-slopkit/components';

export default function Multiple() {
  const [open, setOpen] = createSignal<string[]>(['account']);

  return (
    <Stack>
      <Accordion multiple value={open()} onChange={setOpen} variant="separated" chevronPosition="left">
        <Accordion.Item value="account">
          <Accordion.Control>Account</Accordion.Control>
          <Accordion.Panel>Your name, email and password.</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="notifications">
          <Accordion.Control>Notifications</Accordion.Control>
          <Accordion.Panel>What we email you about, and how often.</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="billing">
          <Accordion.Control>Billing</Accordion.Control>
          <Accordion.Panel>Your plan, invoices and payment method.</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Text size="sm">Open: {open().join(', ') || 'none'}</Text>
    </Stack>
  );
}
