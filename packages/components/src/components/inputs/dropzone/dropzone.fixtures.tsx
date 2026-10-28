// SSR scenarios for dropzone.test.tsx.
import { Dropzone } from '.';

export const dropzones = () => (
  <div>
    <Dropzone onDrop={() => {}} accept="image/*" class="mine">
      <Dropzone.Idle>Drop images here, or click to choose</Dropzone.Idle>
      <Dropzone.Accept>Drop to upload</Dropzone.Accept>
      <Dropzone.Reject>Images only</Dropzone.Reject>
    </Dropzone>
    <Dropzone onDrop={() => {}} disabled color="secondary">
      Uploads are paused
    </Dropzone>
    <Dropzone onDrop={() => {}} loading loadingLabel="Uploading">
      Uploading…
    </Dropzone>
    <Dropzone onDrop={() => {}} openOnClick={false} multiple={false}>
      Drop one file
    </Dropzone>
  </div>
);
