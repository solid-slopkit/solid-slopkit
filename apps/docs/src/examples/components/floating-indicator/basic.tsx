import { createSignal, For } from 'solid-js';
import { FloatingIndicator } from '@solid-slopkit/components';

const periods = ['Day', 'Week', 'Month', 'Year'];

export default function Basic() {
  const [parent, setParent] = createSignal<HTMLElement | null>(null);
  const [active, setActive] = createSignal(0);
  // In a signal, so the indicator finds a button that's created after it.
  const [buttons, setButtons] = createSignal<HTMLButtonElement[]>([]);
  const keep = (index: number, el: HTMLButtonElement) =>
    setButtons((list) => {
      const next = [...list];
      next[index] = el;
      return next;
    });

  return (
    <div
      ref={setParent}
      role="group"
      aria-label="Period"
      style={{
        position: 'relative',
        display: 'flex',
        padding: '4px',
        'border-radius': '0.75rem',
        'background-color': 'var(--slp-color-base-200)',
      }}
    >
      <FloatingIndicator parent={parent()} target={buttons()[active()]} />
      <For each={periods}>
        {(period, index) => (
          <button
            ref={(el: HTMLButtonElement) => keep(index(), el)}
            type="button"
            aria-pressed={active() === index() ? 'true' : 'false'}
            onClick={() => setActive(index())}
            style={{
              position: 'relative',
              padding: '0.375rem 1rem',
              border: 0,
              background: 'none',
              color: 'inherit',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            {period}
          </button>
        )}
      </For>
    </div>
  );
}
