// SSR scenarios for multi-select.test.tsx.
import { MultiSelect } from '.';

export const multiSelects = () => (
  <div>
    <MultiSelect label="Fruit" data={['Apple', 'Banana']} placeholder="Pick some" class="mine" />
    <MultiSelect
      label="Grouped"
      name="food"
      defaultValue={['leek', 'Bread']}
      clearable
      data={[{ group: 'Vegetables', items: [{ value: 'leek', label: 'Leek' }] }, 'Bread']}
    />
    <MultiSelect label="Read only" readOnly data={['Oslo', 'Rome']} defaultValue={['Rome']} error="Required" />
    <MultiSelect label="Disabled" disabled data={['A']} defaultValue={['A']} />
  </div>
);
