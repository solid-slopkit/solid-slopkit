// SSR scenarios for json-input.test.tsx.
import { JsonInput } from '.';

export const jsonInputs = () => (
  <div>
    <JsonInput label="Config" defaultValue={'{"theme": "dark"}'} formatOnBlur class="mine" />
    <JsonInput label="Payload" autosize minRows={3} placeholder="{}" error="The server rejected it." />
  </div>
);
