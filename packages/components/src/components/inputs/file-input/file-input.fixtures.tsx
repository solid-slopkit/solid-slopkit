// SSR scenarios for file-input.test.tsx.
import { FileInput } from '.';

export const fileInputs = () => (
  <div>
    <FileInput label="Resume" description="PDF, up to 5 MB." accept=".pdf" class="mine" />
    <FileInput label="Photos" multiple clearable name="photos" variant="soft" />
    <FileInput label="Locked" disabled placeholder="Not now" error="Uploads are paused." />
  </div>
);
