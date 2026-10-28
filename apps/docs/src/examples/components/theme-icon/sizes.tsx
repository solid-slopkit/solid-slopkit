import { ThemeIcon } from '@solid-slopkit/components';
import { Rocket } from '@lucide/solid';

export default function Sizes() {
  return (
    <>
      <ThemeIcon size="xs" color="primary" variant="soft">
        <Rocket aria-hidden="true" />
      </ThemeIcon>
      <ThemeIcon size="sm" color="primary" variant="soft">
        <Rocket aria-hidden="true" />
      </ThemeIcon>
      <ThemeIcon size="md" color="primary" variant="soft">
        <Rocket aria-hidden="true" />
      </ThemeIcon>
      <ThemeIcon size="lg" color="primary" variant="soft">
        <Rocket aria-hidden="true" />
      </ThemeIcon>
      <ThemeIcon size="xl" color="primary" variant="soft">
        <Rocket aria-hidden="true" />
      </ThemeIcon>
    </>
  );
}
