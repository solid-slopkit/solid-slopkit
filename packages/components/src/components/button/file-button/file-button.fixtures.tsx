// SSR scenarios for file-button.test.tsx.
import { FileButton } from '.';

export const fileButtons = () => (
  <div>
    <FileButton class="mine" onChange={() => {}}>
      Upload
    </FileButton>
    <FileButton multiple accept="image/*" variant="outline" color="primary" leftSection={<span>+</span>} onChange={() => {}}>
      Add photos
    </FileButton>
    <FileButton disabled onChange={() => {}}>
      Locked
    </FileButton>
  </div>
);
