// SSR scenarios for tabs.test.tsx.
import { Tabs } from '.';

export const tabs = () => (
  <div>
    <Tabs defaultValue="one" class="mine">
      <Tabs.List aria-label="Plain">
        <Tabs.Tab value="one" leftSection={<span>*</span>}>
          One
        </Tabs.Tab>
        <Tabs.Tab value="two" disabled>
          Two
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="one">First</Tabs.Panel>
      <Tabs.Panel value="two">Second</Tabs.Panel>
    </Tabs>
    <Tabs defaultValue="b" variant="pills" orientation="vertical" keepMounted color="secondary">
      <Tabs.List aria-label="Kept" grow>
        <Tabs.Tab value="a">A</Tabs.Tab>
        <Tabs.Tab value="b">B</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="a">Panel A</Tabs.Panel>
      <Tabs.Panel value="b">Panel B</Tabs.Panel>
    </Tabs>
  </div>
);
