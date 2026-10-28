// SSR scenarios for select.test.tsx.
import { Select } from '.';

export const selects = () => (
  <div>
    <Select label="Fruit" data={['Apple', 'Banana']} placeholder="Pick one" class="mine" />
    <Select
      label="Grouped"
      name="food"
      defaultValue="leek"
      data={[{ group: 'Vegetables', items: [{ value: 'leek', label: 'Leek' }] }, 'Bread']}
    />
    <Select label="Invalid" data={['Oslo', 'Rome']} defaultValue="Rome" error="Required" />
    <Select label="Disabled" disabled data={['A']} />
  </div>
);
