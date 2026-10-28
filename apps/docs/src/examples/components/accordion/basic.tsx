import { CreditCard, RotateCcw, Truck } from '@lucide/solid';
import { Accordion } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Accordion defaultValue="shipping">
      <Accordion.Item value="shipping">
        <Accordion.Control icon={<Truck />}>Shipping</Accordion.Control>
        <Accordion.Panel>
          Orders placed before 2 p.m. leave the same day. Delivery takes two to four working days.
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="returns">
        <Accordion.Control icon={<RotateCcw />}>Returns</Accordion.Control>
        <Accordion.Panel>Return anything unused within 30 days for a full refund.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="payment">
        <Accordion.Control icon={<CreditCard />} disabled>
          Payment
        </Accordion.Control>
        <Accordion.Panel>Cards, bank transfer and invoices.</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
