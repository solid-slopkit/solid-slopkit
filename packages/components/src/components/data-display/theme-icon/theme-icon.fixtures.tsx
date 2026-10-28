// SSR scenarios for theme-icon.test.tsx.
import { ThemeIcon } from '.';

const Icon = () => <svg aria-hidden="true" viewBox="0 0 24 24" />;

export const icons = () => (
  <div>
    <ThemeIcon class="mine">
      <Icon />
    </ThemeIcon>
    <ThemeIcon color="success" variant="soft" size="lg">
      <Icon />
    </ThemeIcon>
    <ThemeIcon color="error" variant="outline" role="img" aria-label="Error">
      <Icon />
    </ThemeIcon>
  </div>
);
