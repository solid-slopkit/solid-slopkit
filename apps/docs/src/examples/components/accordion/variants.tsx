import { Plus } from '@lucide/solid';
import { Accordion } from '@solid-slopkit/components';

export default function Variants() {
  return (
    <Accordion variant="bordered" chevron={<Plus />} order={4}>
      <Accordion.Item value="what">
        <Accordion.Control>What is it?</Accordion.Control>
        <Accordion.Panel>A set of components for SolidJS 2, styled with plain CSS.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="how">
        <Accordion.Control>How do I install it?</Accordion.Control>
        <Accordion.Panel>From npm: pnpm add @solid-slopkit/components.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="why">
        <Accordion.Control>Why plain CSS?</Accordion.Control>
        <Accordion.Panel>So your own unlayered CSS always wins, without specificity fights.</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
