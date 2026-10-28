import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { LoadingOverlay } from './loading-overlay';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

function setup() {
  const [visible, setVisible] = createSignal(false);
  const onClick = vi.fn();
  const result = render(() => (
    <div data-testid="parent" style={{ position: 'relative', width: '300px', height: '160px' }}>
      <button onClick={onClick}>Save</button>
      <LoadingOverlay visible={visible()} transitionDuration={200} />
    </div>
  ));
  const overlay = () => result.container.querySelector<HTMLElement>('.slp-loading-overlay');
  const toggle = (value: boolean) => {
    setVisible(value);
    flush();
  };
  return { ...result, overlay, toggle, onClick };
}

// Jumps the running fade to its end, so nothing waits on the clock (and a loaded machine can't be too slow for it).
// Waits only for the state the fade is in, not for time to pass.
async function finishFade(overlay: () => HTMLElement | null, status: 'open' | 'ending') {
  await expect.poll(() => overlay()?.getAttribute('data-status'), { timeout: 10_000 }).toBe(status);
  for (const animation of overlay()!.getAnimations()) animation.finish();
}

describe('<LoadingOverlay /> in a browser', () => {
  test('fades in over its parent, with the loader in the middle, and catches the pointer', async () => {
    const { overlay, toggle, onClick, getByText, getByTestId, getByRole } = setup();

    toggle(true);
    expect(getComputedStyle(overlay()!).opacity).toBe('0');
    await finishFade(overlay, 'open');
    expect(getComputedStyle(overlay()!).opacity).toBe('1');

    const parent = getByTestId('parent').getBoundingClientRect();
    const box = overlay()!.getBoundingClientRect();
    expect([box.width, box.height]).toEqual([parent.width, parent.height]);
    const loader = getByRole('status').getBoundingClientRect();
    expect(Math.abs(loader.left + loader.width / 2 - (box.left + box.width / 2))).toBeLessThan(1);
    expect(Math.abs(loader.top + loader.height / 2 - (box.top + box.height / 2))).toBeLessThan(1);

    expect(getComputedStyle(getByRole('status')).animationName).not.toBe('none');

    await userEvent.click(getByText('Save'), { force: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  test('in the base surface color, at its opacity, blurred', async () => {
    const { overlay, toggle } = setup();

    toggle(true);
    const computed = getComputedStyle(overlay()!);
    expect(computed.backdropFilter).toBe('blur(2px)');
    expect(computed.backgroundColor).toMatch(/\/ 0\.7\)$/);
  });

  test('fades out, then unmounts', async () => {
    const { overlay, toggle } = setup();
    toggle(true);
    await finishFade(overlay, 'open');
    expect(getComputedStyle(overlay()!).opacity).toBe('1');

    toggle(false);
    expect(overlay()).not.toBeNull();
    await finishFade(overlay, 'ending');
    await expect.poll(overlay, { timeout: 10_000 }).toBeNull();
  });

  test('showing and hiding has no diagnostics', async () => {
    const { overlay, toggle } = setup();

    const { artifact } = await captureArtifact(
      async () => {
        toggle(true);
        await finishFade(overlay, 'open');
        toggle(false);
        await finishFade(overlay, 'ending');
        await expect.poll(overlay, { timeout: 10_000 }).toBeNull();
      },
      { scenario: 'loading-overlay-toggle' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
  });
});
