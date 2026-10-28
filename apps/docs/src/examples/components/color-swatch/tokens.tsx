import { For } from 'solid-js';
import { ColorSwatch } from '@solid-slopkit/components';

const roles = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'];

export default function Tokens() {
  return (
    <For each={roles}>
      {(role) => <ColorSwatch value={`var(--slp-color-${role})`} size="lg" role="img" aria-label={role} title={role} />}
    </For>
  );
}
