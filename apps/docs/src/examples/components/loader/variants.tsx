import { Loader } from '@solid-slopkit/components';

export default function Variants() {
  return (
    <>
      <Loader size="lg" color="primary" />
      <Loader size="lg" color="primary" variant="dots" />
      <Loader size="lg" color="primary" variant="bars" />
    </>
  );
}
