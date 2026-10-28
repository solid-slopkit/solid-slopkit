import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Transition, type TransitionProps } from './transition';

function setup(initial: boolean, props: Partial<Omit<TransitionProps, 'mounted' | 'children'>> = {}) {
  const [mounted, setMounted] = createSignal(initial);
  const result = render(() => (
    <Transition mounted={mounted()} {...props}>
      {(transition) => (
        <div {...transition} data-testid="content">
          Content
        </div>
      )}
    </Transition>
  ));
  const toggle = (value: boolean) => {
    setMounted(value);
    flush();
  };
  return { ...result, toggle, content: () => result.queryByTestId('content') };
}

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));
/** Lets the microtasks run that settle an exit with nothing to animate. */
const microtasks = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

describe('<Transition />', () => {
  test('renders the content with the root class, the transition, its status and its timing', () => {
    const { content } = setup(true, { transition: 'slide-down', duration: 300, exitDuration: 100, timingFunction: 'linear' });

    expect(content()).toHaveClass('slp-transition');
    expect(content()).toHaveAttribute('data-transition', 'slide-down');
    expect(content()).toHaveAttribute('data-status', 'open');
    expect(content()!.style.getPropertyValue('--_transition-duration')).toBe('300ms');
    expect(content()!.style.getPropertyValue('--_transition-exit-duration')).toBe('100ms');
    expect(content()!.style.getPropertyValue('--_transition-timing-function')).toBe('linear');
  });

  test('defaults: fade, 200ms both ways, ease', () => {
    const { content } = setup(true);

    expect(content()).toHaveAttribute('data-transition', 'fade');
    expect(content()!.style.getPropertyValue('--_transition-duration')).toBe('200ms');
    expect(content()!.style.getPropertyValue('--_transition-exit-duration')).toBe('200ms');
    expect(content()!.style.getPropertyValue('--_transition-timing-function')).toBe('ease');
  });

  test('not mounted: nothing is rendered', () => {
    const { content } = setup(false);

    expect(content()).toBeNull();
  });

  test('mounting renders it in the starting status, then open a frame later', async () => {
    const onEntered = vi.fn();
    const { content, toggle } = setup(false, { onEntered });

    toggle(true);
    expect(content()).toHaveAttribute('data-status', 'starting');

    await nextFrame();
    expect(content()).toHaveAttribute('data-status', 'open');
    await microtasks();
    expect(onEntered).toHaveBeenCalledTimes(1);
  });

  test('unmounting with nothing to animate removes it before the next frame', async () => {
    const onExited = vi.fn();
    const { content, toggle } = setup(true, { onExited });

    toggle(false);
    await microtasks();

    expect(content()).toBeNull();
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  test('keepMounted: stays in the DOM with display: none while hidden', async () => {
    const { content, toggle } = setup(false, { keepMounted: true });
    expect(content()).toHaveAttribute('data-status', 'closed');
    expect(content()).toHaveStyle({ display: 'none' });

    toggle(true);
    expect(content()!.style.display).toBe('');
    await nextFrame();
    expect(content()).toHaveAttribute('data-status', 'open');

    const element = content();
    toggle(false);
    await microtasks();
    expect(content()).toBe(element);
    expect(content()).toHaveStyle({ display: 'none' });
  });

  test("the child can add its own ref, class and style next to the transition's", () => {
    let mine: HTMLElement | undefined;
    const { getByText } = render(() => (
      <Transition mounted>
        {(transition) => (
          <section
            {...transition}
            ref={[transition.ref, (el: HTMLElement) => (mine = el)]}
            class={[transition.class, 'mine']}
            style={{ ...transition.style, color: 'red' }}
          >
            Content
          </section>
        )}
      </Transition>
    ));
    const section = getByText('Content');

    expect(mine).toBe(section);
    expect(section).toHaveClass('slp-transition', 'mine');
    expect(section.style.color).toBe('red');
    expect(section.style.getPropertyValue('--_transition-duration')).toBe('200ms');
  });

  test('has no axe violations', async () => {
    const { container } = setup(true);

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('mounting and unmounting has no diagnostics or waste', async () => {
    const { toggle } = setup(false);
    flush();

    const { artifact } = await captureArtifact(
      async () => {
        toggle(true);
        await nextFrame();
        toggle(false);
        await microtasks();
      },
      { scenario: 'transition-toggle' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    // presence.mounted recomputes on each status but only changes on two of them; the other two runs are the only waste.
    expect(artifact).toHaveNoWaste({ maxWastedRuns: 2 });
    // The presence's status, its mounted flag and its animation effect, once for each of four statuses.
    expect(artifact).toStayWithinRerunBudget(12, { scope: /presence\./ });
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./transition.fixtures.tsx', 'transitions');
  });
});
