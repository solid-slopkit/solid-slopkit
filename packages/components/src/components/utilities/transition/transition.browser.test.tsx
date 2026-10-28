import { render } from '@solidjs/testing-library';
import { createSignal, flush, For } from 'solid-js';
import { describe, expect, test, vi } from 'vitest';
import { Transition, type TransitionName } from './transition';

function setup(transition: TransitionName, initial = false) {
  const [mounted, setMounted] = createSignal(initial);
  const onEntered = vi.fn();
  const onExited = vi.fn();
  const result = render(() => (
    <Transition mounted={mounted()} transition={transition} duration={120} onEntered={onEntered} onExited={onExited}>
      {(attributes) => (
        <div {...attributes} data-testid="content" style={{ ...attributes.style, width: '100px', height: '40px' }}>
          Content
        </div>
      )}
    </Transition>
  ));
  const toggle = (value: boolean) => {
    setMounted(value);
    flush();
  };
  return { ...result, toggle, onEntered, onExited, content: () => result.queryByTestId('content') };
}

describe('<Transition /> in a browser', () => {
  test('fades in from transparent, and calls onEntered once it has', async () => {
    const { content, toggle, onEntered } = setup('fade');

    toggle(true);
    expect(getComputedStyle(content()!).opacity).toBe('0');

    await expect.poll(() => content()!.getAttribute('data-status')).toBe('open');
    expect(content()!.getAnimations()).toHaveLength(1);
    await expect.poll(() => onEntered.mock.calls.length).toBe(1);
    expect(getComputedStyle(content()!).opacity).toBe('1');
  });

  test('stays rendered while it fades out, then unmounts and calls onExited', async () => {
    const { content, toggle, onExited } = setup('fade', true);
    // A transition needs a computed style to start from.
    expect(getComputedStyle(content()!).opacity).toBe('1');

    toggle(false);
    expect(content()).toHaveAttribute('data-status', 'ending');
    expect(content()!.getAnimations()).toHaveLength(1);

    await expect.poll(() => content()).toBeNull();
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  test('exitDuration sets the exit transition', () => {
    const [mounted, setMounted] = createSignal(true);
    const { getByText } = render(() => (
      <Transition mounted={mounted()} duration={120} exitDuration={40}>
        {(attributes) => <div {...attributes}>Content</div>}
      </Transition>
    ));
    // Four properties with the same duration are reported as one.
    expect(getComputedStyle(getByText('Content')).transitionDuration).toBe('0.12s');

    setMounted(false);
    flush();

    expect(getComputedStyle(getByText('Content')).transitionDuration).toBe('0.04s');
  });

  test('each preset starts from its hidden styles', () => {
    const presets: [TransitionName, Partial<CSSStyleDeclaration>][] = [
      ['fade-up', { translate: '0px 16px' }],
      ['fade-down', { translate: '0px -16px' }],
      ['fade-left', { translate: '16px' }],
      ['fade-right', { translate: '-16px' }],
      ['scale', { scale: '0' }],
      ['scale-x', { scale: '0 1' }],
      ['scale-y', { scale: '1 0' }],
      ['pop', { scale: '0.9' }],
      ['slide-up', { translate: '0px 100%' }],
      ['slide-down', { translate: '0px -100%' }],
      ['slide-left', { translate: '100%' }],
      ['slide-right', { translate: '-100%' }],
      ['rotate-left', { rotate: '15deg' }],
      ['rotate-right', { rotate: '-15deg' }],
    ];
    const [mounted, setMounted] = createSignal(false);
    const { getByTestId } = render(() => (
      <For each={presets}>
        {([name]) => (
          <Transition mounted={mounted()} transition={name}>
            {(attributes) => (
              <div {...attributes} data-testid={name} style={{ ...attributes.style, width: '100px', height: '40px' }} />
            )}
          </Transition>
        )}
      </For>
    ));

    setMounted(true);
    flush();

    for (const [name, expected] of presets) {
      const computed = getComputedStyle(getByTestId(name));
      expect({ name, opacity: computed.opacity }).toEqual({ name, opacity: '0' });
      for (const [property, value] of Object.entries(expected)) {
        expect({ name, [property]: computed[property as 'translate'] }).toEqual({ name, [property]: value });
      }
    }
  });

  test('none: no hidden styles, so it shows and hides at once', async () => {
    const { content, toggle } = setup('none');

    toggle(true);
    expect(getComputedStyle(content()!).opacity).toBe('1');

    toggle(false);
    await expect.poll(() => content()).toBeNull();
  });
});
