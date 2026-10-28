import { For } from 'solid-js';
import { Button } from '@solid-slopkit/components';

const colors = ['neutral', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error'] as const;

export default function Colors() {
  return (
    <>
      <Button>Default</Button>
      <For each={colors}>{(color) => <Button color={color}>{color}</Button>}</For>
    </>
  );
}
