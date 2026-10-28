// SSR scenarios for indicator.test.tsx.
import { Indicator } from '.';

export const indicators = () => (
  <div>
    <Indicator class="mine">
      <button type="button">Inbox</button>
    </Indicator>
    <Indicator label="12" color="error" position="bottom-start" offset={4} size="lg">
      <span>Messages</span>
    </Indicator>
    <Indicator processing disabled>
      <span>Hidden mark</span>
    </Indicator>
    {/* A label that isn't shown while disabled must not be created: hydration would look for it in the page. */}
    <Indicator disabled label={<b>3</b>}>
      <span>Hidden label</span>
    </Indicator>
  </div>
);
