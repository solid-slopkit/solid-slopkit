// SSR scenarios for color-scheme.test.tsx.
import { useColorScheme } from '.';

export const probe = () => {
  const scheme = useColorScheme();
  return <p data-testid="probe">{`${scheme.colorScheme()} ${scheme.resolvedColorScheme()}`}</p>;
};
