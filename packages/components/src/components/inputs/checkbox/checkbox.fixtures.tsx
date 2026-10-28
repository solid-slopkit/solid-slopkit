// SSR scenarios for checkbox.test.tsx.
import { Checkbox } from '.';

export const checkboxes = () => (
  <div>
    <Checkbox label="Accept the terms" class="mine" />
    <Checkbox label="Newsletter" description="Once a month." defaultChecked color="success" size="lg" />
    <Checkbox label="Select all" indeterminate />
    <Checkbox label="Required" error="You have to accept this." />
    <Checkbox aria-label="No label" disabled checked />
    <Checkbox.Group label="Toppings" description="Pick any." defaultValue={['cheese']} name="toppings">
      <Checkbox value="cheese" label="Cheese" />
      <Checkbox value="olives" label="Olives" />
    </Checkbox.Group>
    <Checkbox.Card value="pro" defaultChecked>
      <strong>Pro</strong> Everything in Free, and more.
    </Checkbox.Card>
  </div>
);
