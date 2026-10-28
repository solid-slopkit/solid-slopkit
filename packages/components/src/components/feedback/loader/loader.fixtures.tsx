// SSR scenarios for loader.test.tsx.
import { Loader } from '.';

export const loaders = () => (
  <div>
    <Loader class="mine" />
    <Loader variant="dots" color="primary" size="lg" label="Loading results" />
    <Loader variant="bars" size="sm" />
  </div>
);
