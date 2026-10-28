import { render } from '@solidjs/testing-library';
import { createSignal, flush, For } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { FloatingIndicator } from './floating-indicator';

const names = ['One', 'Two', 'Three'];

/** Three buttons in a row, in a parent with a border and padding; the indicator starts on the first. */
function setup(parentStyle: Record<string, string> = {}) {
  const [parent, setParent] = createSignal<HTMLElement | null>(null);
  const [target, setTarget] = createSignal<HTMLElement | null>(null);
  const [wide, setWide] = createSignal(false);
  const buttons: HTMLButtonElement[] = [];
  const result = render(() => (
    <div
      ref={setParent}
      style={{
        position: 'relative',
        display: 'flex',
        gap: '8px',
        padding: '6px',
        border: '3px solid',
        width: 'max-content',
        ...parentStyle,
      }}
    >
      <FloatingIndicator data-testid="indicator" target={target()} parent={parent()} />
      <For each={names}>
        {(name, index) => (
          <button
            ref={(el: HTMLButtonElement) => (buttons[index()] = el)}
            type="button"
            style={{ position: 'relative', width: index() === 0 && wide() ? '160px' : '80px', height: '32px' }}
          >
            {name}
          </button>
        )}
      </For>
    </div>
  ));
  flush();
  setTarget(buttons[0]);
  flush();
  const indicator = () => result.getByTestId('indicator');
  const settle = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  // Where the indicator is, without the transition: its final values.
  const covers = async (button: HTMLElement) => {
    await settle();
    indicator()
      .getAnimations()
      .forEach((animation) => animation.finish());
    const a = indicator().getBoundingClientRect();
    const b = button.getBoundingClientRect();
    return [a.left - b.left, a.top - b.top, a.width - b.width, a.height - b.height].map(Math.round);
  };
  return { ...result, indicator, buttons, setTarget, setWide, covers, settle, parent };
}

describe('<FloatingIndicator /> in a browser', () => {
  test("covers the target, inside the parent's border and padding", async () => {
    const { buttons, covers } = setup();

    expect(await covers(buttons[0])).toEqual([0, 0, 0, 0]);
  });

  test('jumps to its first target, then glides to the next', async () => {
    const { indicator, buttons, setTarget, covers, settle } = setup();
    expect(indicator().getAnimations()).toHaveLength(0);
    await settle();

    setTarget(buttons[2]);
    flush();
    expect(indicator().getAnimations().length).toBeGreaterThan(0);
    expect(await covers(buttons[2])).toEqual([0, 0, 0, 0]);
  });

  test('follows the target when a sibling changes size', async () => {
    const { buttons, setTarget, setWide, covers } = setup();
    setTarget(buttons[1]);
    flush();
    expect(await covers(buttons[1])).toEqual([0, 0, 0, 0]);

    setWide(true);
    flush();
    await expect.poll(() => covers(buttons[1])).toEqual([0, 0, 0, 0]);
  });

  test('covers a target in a parent that has scrolled', async () => {
    const { buttons, setTarget, covers, parent } = setup({ width: '150px', overflow: 'auto' });
    parent()!.scrollLeft = 100;
    setTarget(buttons[2]);
    flush();

    expect(await covers(buttons[2])).toEqual([0, 0, 0, 0]);
  });

  test('hides without a target, and jumps to the next one', async () => {
    const { indicator, buttons, setTarget, covers, settle } = setup();
    await settle();

    setTarget(null);
    flush();
    expect(getComputedStyle(indicator()).visibility).toBe('hidden');

    setTarget(buttons[1]);
    flush();
    expect(getComputedStyle(indicator()).visibility).toBe('visible');
    expect(indicator().getAnimations()).toHaveLength(0);
    expect(await covers(buttons[1])).toEqual([0, 0, 0, 0]);
  });

  test('the targets paint over it, and the pointer goes through it', async () => {
    const { indicator, buttons, settle } = setup();
    await settle();
    const box = buttons[0].getBoundingClientRect();

    expect(getComputedStyle(indicator()).pointerEvents).toBe('none');
    expect(document.elementFromPoint(box.left + 4, box.top + 4)).toBe(buttons[0]);
  });
});
