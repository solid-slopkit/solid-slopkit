import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createEffect, createSignal, flush, untrack } from 'solid-js';
import { describe, expect, test, vi } from 'vitest';
import { createPresence, type Presence } from './create-presence';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

/** Lets the microtasks run that settle a presence with nothing to animate, short of a frame. */
const microtasks = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

const STYLES = `
  .fade { transition: opacity 150ms linear; }
  .fade[data-status='starting'], .fade[data-status='ending'] { opacity: 0; }
  @keyframes presence-test-out { to { opacity: 0; } }
  .keyframes[data-status='ending'] { animation: presence-test-out 150ms linear; }
  @keyframes presence-test-spin { to { rotate: 1turn; } }
  .spinning, .spinning-child > span { animation: presence-test-spin 1s linear infinite; }
  .slow-child > span { transition: opacity 2s linear; }
  .slow-child[data-status='ending'] > span { opacity: 0; }
  dialog.backdrop::backdrop { transition: opacity 150ms linear; }
  dialog.backdrop[data-status='ending']::backdrop { opacity: 0; }
`;

interface HarnessProps {
  present: () => boolean;
  class?: string;
  onEntered?: () => void;
  onExited?: () => void;
  onPresence?: (presence: Presence) => void;
}

/** A manual popover kept in the top layer while the presence is mounted. */
function Harness(props: HarnessProps) {
  let el: HTMLDivElement | undefined;
  const presence = createPresence({
    present: () => props.present(),
    element: () => el,
    onEntered: () => props.onEntered?.(),
    onExited: () => props.onExited?.(),
  });
  untrack(() => props.onPresence)?.(presence);

  createEffect(presence.mounted, (mounted) => {
    if (mounted) el!.showPopover();
    else if (el!.matches(':popover-open')) el!.hidePopover();
  });

  return (
    <>
      <style>{STYLES}</style>
      <div ref={(node) => (el = node)} popover="manual" class={props.class} data-testid="box" data-status={presence.status()}>
        <span>Box</span>
      </div>
    </>
  );
}

function setup(initial: boolean, props: Omit<HarnessProps, 'present' | 'onPresence'> = {}) {
  const [present, setPresent] = createSignal(initial);
  let presence!: Presence;
  const result = render(() => <Harness present={present} onPresence={(p) => (presence = p)} {...props} />);
  const box = result.getByTestId('box');
  const toggle = (value: boolean) => {
    setPresent(value);
    flush();
  };
  return { box, presence: () => presence, toggle, isOpen: () => box.matches(':popover-open') };
}

describe('createPresence', () => {
  test('starts open or closed without animating', () => {
    const open = setup(true, { class: 'fade' });
    expect(open.presence().status()).toBe('open');
    expect(open.isOpen()).toBe(true);
    expect(open.box.getAnimations()).toHaveLength(0);

    const closed = setup(false, { class: 'fade' });
    expect(closed.presence().status()).toBe('closed');
    expect(closed.presence().mounted()).toBe(false);
    expect(closed.isOpen()).toBe(false);
  });

  test('opening: one starting frame, then open, and the transition runs from the starting styles', async () => {
    const onEntered = vi.fn();
    const { box, presence, toggle, isOpen } = setup(false, { class: 'fade', onEntered });

    toggle(true);
    expect(presence().status()).toBe('starting');
    expect(presence().mounted()).toBe(true);
    expect(isOpen()).toBe(true);
    expect(getComputedStyle(box).opacity).toBe('0');

    await expect.poll(() => presence().status()).toBe('open');
    expect(box.getAnimations()).toHaveLength(1);
    expect(onEntered).not.toHaveBeenCalled();

    await expect.poll(() => onEntered.mock.calls.length).toBe(1);
    expect(getComputedStyle(box).opacity).toBe('1');
  });

  test('closing: stays in the top layer while the exit transition runs, then closes', async () => {
    const onExited = vi.fn();
    const { box, presence, toggle, isOpen } = setup(true, { class: 'fade', onExited });

    toggle(false);
    expect(presence().status()).toBe('ending');
    expect(presence().mounted()).toBe(true);
    expect(isOpen()).toBe(true);
    expect(box.getAnimations()).toHaveLength(1);

    await expect.poll(() => presence().status()).toBe('closed');
    expect(isOpen()).toBe(false);
    expect(onExited).toHaveBeenCalledTimes(1);
  });

  test('waits for an exit keyframe animation too', async () => {
    const { presence, toggle, isOpen } = setup(true, { class: 'keyframes' });

    toggle(false);
    expect(presence().status()).toBe('ending');
    expect(isOpen()).toBe(true);

    await expect.poll(() => presence().status()).toBe('closed');
    expect(isOpen()).toBe(false);
  });

  test('with nothing to animate, it closes before the next frame and opens on the next frame', async () => {
    const onExited = vi.fn();
    const onEntered = vi.fn();
    const { presence, toggle, isOpen } = setup(true, { onExited, onEntered });

    toggle(false);
    await microtasks();
    expect(presence().status()).toBe('closed');
    expect(isOpen()).toBe(false);
    expect(onExited).toHaveBeenCalledTimes(1);

    toggle(true);
    await expect.poll(() => presence().status()).toBe('open');
    expect(onEntered).toHaveBeenCalledTimes(1);
  });

  test('animations that never end, and those of its children, are not waited for', async () => {
    const spinning = setup(true, { class: 'spinning' });
    spinning.toggle(false);
    await microtasks();
    expect(spinning.presence().status()).toBe('closed');

    const child = setup(true, { class: 'slow-child' });
    child.toggle(false);
    await microtasks();
    expect(child.presence().status()).toBe('closed');
  });

  test('reopening while it closes goes back to open without closing', async () => {
    const onExited = vi.fn();
    const { box, presence, toggle, isOpen } = setup(true, { class: 'fade', onExited });

    toggle(false);
    await new Promise((resolve) => setTimeout(resolve, 50));
    toggle(true);

    expect(presence().status()).toBe('open');
    expect(isOpen()).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(presence().status()).toBe('open');
    expect(onExited).not.toHaveBeenCalled();
    expect(getComputedStyle(box).opacity).toBe('1');
  });

  test('closing during the starting frame closes before the next frame', async () => {
    const { presence, toggle, isOpen } = setup(false, { class: 'fade' });

    toggle(true);
    toggle(false);
    await microtasks();

    expect(presence().status()).toBe('closed');
    expect(isOpen()).toBe(false);
  });

  test("a modal dialog's ::backdrop transition is waited for", async () => {
    const [present, setPresent] = createSignal(true);
    let dialog!: HTMLDialogElement;
    let presence!: Presence;
    render(() => {
      presence = createPresence({ present, element: () => dialog });
      createEffect(presence.mounted, (mounted) => {
        if (mounted) dialog.showModal();
        else dialog.close();
      });
      return (
        <>
          <style>{STYLES}</style>
          <dialog ref={(node) => (dialog = node)} class="backdrop" data-status={presence.status()}>
            Dialog
          </dialog>
        </>
      );
    });

    setPresent(false);
    flush();

    expect(presence.status()).toBe('ending');
    expect(dialog.open).toBe(true);
    await expect.poll(() => presence.status()).toBe('closed');
    expect(dialog.open).toBe(false);
  });

  test('opening and closing has no diagnostics', async () => {
    const { presence, toggle } = setup(false, { class: 'fade' });

    const { artifact } = await captureArtifact(
      async () => {
        toggle(true);
        await expect.poll(() => presence().status()).toBe('open');
        toggle(false);
        await expect.poll(() => presence().status()).toBe('closed');
      },
      { scenario: 'presence-open-close' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    // The status, the mounted flag and the animation effect, once for each of four statuses.
    expect(artifact).toStayWithinRerunBudget(12, { scope: /presence\./ });
    // mounted recomputes on each status but only changes on two of them.
    expect(artifact).toHaveNoWaste({ maxWastedRuns: 2 });
  });
});
