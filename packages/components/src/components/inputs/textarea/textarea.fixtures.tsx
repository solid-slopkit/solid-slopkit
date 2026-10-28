// SSR scenarios for textarea.test.tsx.
import { Textarea } from '.';

export const textareas = () => (
  <div>
    <Textarea label="Notes" rows={4} placeholder="Anything else?" class="mine" />
    <Textarea label="Message" description="Up to five lines." autosize minRows={2} maxRows={5} value={'One\nTwo'} />
    <Textarea label="Bio" error="Too long." variant="soft" />
  </div>
);
