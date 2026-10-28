// SSR scenarios for accordion.test.tsx.
import { Accordion } from '.';

export const accordions = () => (
  <div>
    <Accordion defaultValue="one" class="mine">
      <Accordion.Item value="one">
        <Accordion.Control icon={<span>*</span>}>One</Accordion.Control>
        <Accordion.Panel>First</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="two">
        <Accordion.Control disabled>Two</Accordion.Control>
        <Accordion.Panel>Second</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
    <Accordion multiple defaultValue={['a', 'b']} variant="separated" order={4} chevronPosition="left" chevron={<span>v</span>}>
      <Accordion.Item value="a">
        <Accordion.Control>A</Accordion.Control>
        <Accordion.Panel>Panel A</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Control>B</Accordion.Control>
        <Accordion.Panel>Panel B</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  </div>
);
