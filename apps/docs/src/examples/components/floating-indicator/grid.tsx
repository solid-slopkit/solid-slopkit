import { createSignal, For } from 'solid-js';
import { FloatingIndicator } from '@solid-slopkit/components';

const emoji = ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐'];

export default function Grid() {
  const [parent, setParent] = createSignal<HTMLElement | null>(null);
  const [hovered, setHovered] = createSignal<HTMLElement | null>(null);

  return (
    <div
      ref={setParent}
      onPointerLeave={() => setHovered(null)}
      style={{ position: 'relative', display: 'grid', 'grid-template-columns': 'repeat(3, 3rem)', gap: '0.5rem' }}
    >
      <FloatingIndicator parent={parent()} target={hovered()} />
      <For each={emoji}>
        {(fruit) => (
          <span
            onPointerEnter={(event: PointerEvent) => setHovered(event.currentTarget as HTMLElement)}
            style={{ position: 'relative', display: 'grid', 'place-items': 'center', height: '3rem', 'font-size': '1.5rem' }}
          >
            {fruit}
          </span>
        )}
      </For>
    </div>
  );
}
