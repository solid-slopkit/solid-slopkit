// SSR scenarios for number-formatter.test.tsx.
import { SlopkitUi } from '../../provider';
import { NumberFormatter } from '.';

export const numbers = () => (
  <SlopkitUi locale="de-DE">
    <p>
      <NumberFormatter class="mine" value={1234567.891} />
    </p>
    <p>
      <NumberFormatter value={9.5} options={{ style: 'currency', currency: 'EUR' }} />
    </p>
    <p>
      <NumberFormatter value={0.256} options={{ style: 'percent' }} locale="en-US" suffix=" done" />
    </p>
    <p>
      <NumberFormatter value={null} />
    </p>
  </SlopkitUi>
);
