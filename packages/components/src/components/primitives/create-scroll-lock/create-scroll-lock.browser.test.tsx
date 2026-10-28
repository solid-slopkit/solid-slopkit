import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createScrollLock } from './create-scroll-lock';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

function Lock(props: { locked: () => boolean }) {
  createScrollLock({ locked: () => props.locked() });
  return null;
}

function setup(initial = false) {
  const [locked, setLocked] = createSignal(initial, { name: 'locked' });
  const result = render(() => (
    <>
      <div data-testid="tall" style={{ height: '3000px' }} />
      <Lock locked={locked} />
    </>
  ));
  const toggle = (value: boolean) => {
    setLocked(value);
    flush();
  };
  return { ...result, toggle };
}

const root = document.documentElement;
afterEach(() => {
  vi.restoreAllMocks();
  root.removeAttribute('style');
});

describe('createScrollLock', () => {
  test('hides the overflow while locked, and puts it back', () => {
    const { toggle } = setup();
    expect(getComputedStyle(root).overflowY).toBe('visible');

    toggle(true);
    expect(getComputedStyle(root).overflow).toBe('hidden');

    toggle(false);
    expect(root.style.overflow).toBe('');
  });

  // The test browser hides its scrollbars, so a classic one is simulated: the viewport 12px wider than the root.
  const withScrollbar = () => vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(root.clientWidth + 12);

  test('without a scrollbar to make room for, only the overflow changes', () => {
    const { toggle } = setup();

    toggle(true);
    expect(root.style.paddingRight).toBe('');
  });

  test("keeps a classic scrollbar's room as padding, on top of the root's own, and takes it back", () => {
    withScrollbar();
    root.style.paddingRight = '4px';
    const { toggle } = setup();

    toggle(true);
    expect(root.style.paddingRight).toBe('16px');
    expect(root.style.scrollbarGutter).toBe('');

    toggle(false);
    expect(root.style.paddingRight).toBe('4px');
  });

  test('locks add up: the page scrolls again after the last one', () => {
    const first = setup();
    const second = setup();

    first.toggle(true);
    second.toggle(true);
    first.toggle(false);
    expect(root.style.overflow).toBe('hidden');

    second.toggle(false);
    expect(root.style.overflow).toBe('');
  });

  test("the root's own inline styles come back", () => {
    root.style.overflow = 'scroll';
    root.style.paddingRight = '3px';
    const { toggle } = setup();

    toggle(true);
    expect(root.style.overflow).toBe('hidden');
    toggle(false);

    expect(root.style.overflow).toBe('scroll');
    expect(root.style.paddingRight).toBe('3px');
  });

  test('unmounting while locked unlocks', () => {
    const { unmount } = setup(true);
    expect(root.style.overflow).toBe('hidden');

    unmount();
    expect(root.style.overflow).toBe('');
  });

  test('locking and unlocking has no diagnostics', async () => {
    const { toggle } = setup();

    const { artifact } = await captureArtifact(
      () => {
        toggle(true);
        toggle(false);
      },
      { scenario: 'scroll-lock' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(2, { scope: /scrollLock\.locked/ });
  });
});
