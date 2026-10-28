import { Alert } from '@solid-slopkit/components';
import { Info } from '@lucide/solid';

export default function Basic() {
  return (
    <Alert title="Themes are plain CSS" icon={<Info aria-hidden="true" />} role="note">
      Components read only tokens, so a theme restyles all of them at once.
    </Alert>
  );
}
