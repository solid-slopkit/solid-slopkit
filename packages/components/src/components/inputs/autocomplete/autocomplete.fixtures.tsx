// SSR scenarios for autocomplete.test.tsx.
import { Autocomplete } from '.';

export const autocompletes = () => (
  <div>
    <Autocomplete label="Fruit" data={['Apple', 'Banana']} placeholder="Type a fruit" class="mine" />
    <Autocomplete
      label="Grouped"
      name="food"
      defaultValue="Le"
      data={[{ group: 'Vegetables', items: ['Leek', { value: 'Lettuce', disabled: true }] }, 'Bread']}
      error="Pick one"
    />
    <Autocomplete label="Disabled" disabled data={['A']} />
  </div>
);
