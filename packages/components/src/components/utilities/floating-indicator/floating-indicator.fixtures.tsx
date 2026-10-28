// SSR scenarios for floating-indicator.test.tsx.
import { createSignal } from 'solid-js';
import { FloatingIndicator } from '.';

export const floatingIndicators = () => {
  const [parent, setParent] = createSignal<HTMLElement | null>(null);
  const [target, setTarget] = createSignal<HTMLElement | null>(null);
  return (
    <div ref={setParent} style={{ position: 'relative', display: 'flex' }}>
      <FloatingIndicator target={target()} parent={parent()} class="mine" />
      <button ref={setTarget} type="button" style={{ position: 'relative' }}>
        One
      </button>
      <button type="button" style={{ position: 'relative' }}>
        Two
      </button>
    </div>
  );
};
