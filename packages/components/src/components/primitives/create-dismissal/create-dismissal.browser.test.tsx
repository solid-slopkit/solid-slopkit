import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import type { JSX } from '@solidjs/web';
import { createEffect, createSignal, flush, untrack } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { createDismissal, type DismissReason } from './create-dismissal';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

interface OverlayProps {
  name: string;
  /** Opens it when rendered. */
  initiallyOpen?: boolean;
  closeOnEscape?: boolean;
  closeOnClickOutside?: boolean;
  onDismiss?: (name: string, reason: DismissReason, event: Event) => void;
  children?: JSX.Element;
}

// Where each overlay sits, along the bottom of the viewport, so none covers an anchor or another overlay.
const LEFT: Record<string, number> = { menu: 150, parent: 150, outer: 150, first: 150, child: 300, inner: 300, second: 300 };

/** An anchor and a manual popover rendered right after it, the way the overlay components render in place. */
function Overlay(props: OverlayProps) {
  const [open, setOpen] = createSignal(untrack(() => props.initiallyOpen) ?? false, { name: 'test.open' });
  let anchor: HTMLButtonElement | undefined;
  let panel: HTMLDivElement | undefined;

  createDismissal('Overlay', {
    open,
    elements: () => [anchor, panel],
    onDismiss: (reason, event) => {
      props.onDismiss?.(props.name, reason, event);
      setOpen(false);
      flush();
    },
    closeOnEscape: () => props.closeOnEscape ?? true,
    closeOnClickOutside: () => props.closeOnClickOutside ?? true,
  });

  createEffect(open, (value) => {
    if (value) panel!.showPopover();
    else if (panel!.matches(':popover-open')) panel!.hidePopover();
  });

  return (
    <div>
      <button ref={(el) => (anchor = el)} onClick={() => setOpen((value) => !value)}>
        {`${props.name} anchor`}
      </button>
      <div
        ref={(el) => (panel = el)}
        popover="manual"
        data-testid={props.name}
        style={{ inset: 'auto', bottom: '0', left: `${LEFT[props.name]}px`, margin: '0' }}
      >
        <button>{`${props.name} content`}</button>
        {props.children}
      </div>
    </div>
  );
}

function setup(children: () => JSX.Element) {
  const result = render(() => (
    <SlopkitUi>
      <button>Outside</button>
      {children()}
    </SlopkitUi>
  ));
  const isOpen = (name: string) => result.getByTestId(name).matches(':popover-open');
  return { ...result, isOpen };
}

const press = (key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  document.body.dispatchEvent(event);
  return event;
};

describe('createDismissal', () => {
  test('Escape closes it and is prevented; with nothing open, Escape is left alone', async () => {
    const onDismiss = vi.fn();
    const { isOpen, getByText } = setup(() => <Overlay name="menu" onDismiss={onDismiss} />);

    await userEvent.click(getByText('menu anchor'));
    expect(isOpen('menu')).toBe(true);

    expect(press('Escape').defaultPrevented).toBe(true);
    expect(isOpen('menu')).toBe(false);
    expect(onDismiss).toHaveBeenCalledWith('menu', 'escape', expect.any(KeyboardEvent));

    expect(press('Escape').defaultPrevented).toBe(false);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('a real Escape key press closes the overlay holding focus', async () => {
    const { isOpen, getByText } = setup(() => <Overlay name="menu" />);
    await userEvent.click(getByText('menu anchor'));
    getByText('menu content').focus();

    await userEvent.keyboard('{Escape}');

    expect(isOpen('menu')).toBe(false);
  });

  test('nested: Escape closes the innermost first, then the next', async () => {
    const onDismiss = vi.fn();
    const { isOpen, getByText } = setup(() => (
      <Overlay name="parent" onDismiss={onDismiss}>
        <Overlay name="child" onDismiss={onDismiss} />
      </Overlay>
    ));
    await userEvent.click(getByText('parent anchor'));
    await userEvent.click(getByText('child anchor'));

    press('Escape');
    expect(isOpen('child')).toBe(false);
    expect(isOpen('parent')).toBe(true);

    press('Escape');
    expect(isOpen('parent')).toBe(false);
    expect(onDismiss.mock.calls.map(([name]) => name)).toEqual(['child', 'parent']);
  });

  test('a press outside every overlay closes them all, innermost first', async () => {
    const onDismiss = vi.fn();
    const { isOpen, getByText } = setup(() => (
      <Overlay name="parent" onDismiss={onDismiss}>
        <Overlay name="child" onDismiss={onDismiss} />
      </Overlay>
    ));
    await userEvent.click(getByText('parent anchor'));
    await userEvent.click(getByText('child anchor'));

    await userEvent.click(getByText('Outside'));

    expect(isOpen('child')).toBe(false);
    expect(isOpen('parent')).toBe(false);
    expect(onDismiss.mock.calls.map(([name, reason]) => [name, reason])).toEqual([
      ['child', 'outside'],
      ['parent', 'outside'],
    ]);
  });

  test('a press inside the parent closes only the child; inside the child, nothing', async () => {
    const { isOpen, getByText } = setup(() => (
      <Overlay name="parent">
        <Overlay name="child" />
      </Overlay>
    ));
    await userEvent.click(getByText('parent anchor'));
    await userEvent.click(getByText('child anchor'));

    await userEvent.click(getByText('child content'));
    expect(isOpen('child')).toBe(true);

    await userEvent.click(getByText('parent content'));
    expect(isOpen('child')).toBe(false);
    expect(isOpen('parent')).toBe(true);
  });

  test('a press on the anchor is inside: its own click toggles it closed', async () => {
    const onDismiss = vi.fn();
    const { isOpen, getByText } = setup(() => <Overlay name="menu" onDismiss={onDismiss} />);
    await userEvent.click(getByText('menu anchor'));

    await userEvent.click(getByText('menu anchor'));

    expect(isOpen('menu')).toBe(false);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  test('closeOnEscape off: Escape closes nothing, not even the overlay under it, and is still prevented', async () => {
    const { isOpen, getByText } = setup(() => (
      <Overlay name="parent">
        <Overlay name="child" closeOnEscape={false} />
      </Overlay>
    ));
    await userEvent.click(getByText('parent anchor'));
    await userEvent.click(getByText('child anchor'));

    expect(press('Escape').defaultPrevented).toBe(true);

    expect(isOpen('child')).toBe(true);
    expect(isOpen('parent')).toBe(true);
  });

  test('closeOnClickOutside off: stays open and shields the overlays under it', async () => {
    const { isOpen, getByText } = setup(() => (
      <Overlay name="parent">
        <Overlay name="child" closeOnClickOutside={false} />
      </Overlay>
    ));
    await userEvent.click(getByText('parent anchor'));
    await userEvent.click(getByText('child anchor'));

    await userEvent.click(getByText('Outside'));

    expect(isOpen('child')).toBe(true);
    expect(isOpen('parent')).toBe(true);
  });

  test('an Escape already handled inside, or typed while composing, is ignored', async () => {
    const { isOpen, getByText } = setup(() => <Overlay name="menu" />);
    await userEvent.click(getByText('menu anchor'));

    const handled = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    handled.preventDefault();
    document.body.dispatchEvent(handled);
    press('Escape', { isComposing: true });

    expect(isOpen('menu')).toBe(true);
  });

  test('a touch closes on its click, not its pointerdown, so a scroll can start', async () => {
    const { isOpen, getByText } = setup(() => <Overlay name="menu" />);
    await userEvent.click(getByText('menu anchor'));
    const outside = getByText('Outside');

    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' }));
    expect(isOpen('menu')).toBe(true);

    outside.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(isOpen('menu')).toBe(false);
  });

  test('a keyboard click outside, with no press before it, closes nothing', async () => {
    const { isOpen, getByText } = setup(() => <Overlay name="menu" />);
    await userEvent.click(getByText('menu anchor'));

    getByText('Outside').dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(isOpen('menu')).toBe(true);
  });

  test('a nested provider shares the root order', async () => {
    const { isOpen, getByText } = setup(() => (
      <Overlay name="outer">
        <SlopkitUi locale="de-DE">
          <Overlay name="inner" />
        </SlopkitUi>
      </Overlay>
    ));
    await userEvent.click(getByText('outer anchor'));
    await userEvent.click(getByText('inner anchor'));

    press('Escape');

    expect(isOpen('inner')).toBe(false);
    expect(isOpen('outer')).toBe(true);
  });

  test('closing the parent from outside leaves the order right for the next Escape', async () => {
    const { isOpen, getByText } = setup(() => (
      <>
        <Overlay name="first" initiallyOpen />
        <Overlay name="second" initiallyOpen />
      </>
    ));
    expect(isOpen('first')).toBe(true);

    // The newest closes itself through its anchor; the one opened before it is on top again.
    await userEvent.click(getByText('second anchor'));
    press('Escape');

    expect(isOpen('first')).toBe(false);
  });

  test('Escape on a modal <dialog> that stays open: the browser does not close it either', async () => {
    const [open, setOpen] = createSignal(false);
    let dialog!: HTMLDialogElement;
    render(() => (
      <SlopkitUi>
        {(() => {
          createDismissal('Modal', {
            open,
            elements: () => [dialog],
            onDismiss: () => {},
            closeOnEscape: () => false,
          });
          createEffect(open, (value) => {
            if (value) dialog.showModal();
          });
          return (
            <dialog ref={(el) => (dialog = el)}>
              <button>Inside</button>
            </dialog>
          );
        })()}
      </SlopkitUi>
    ));
    setOpen(true);
    flush();
    expect(dialog.open).toBe(true);

    await userEvent.keyboard('{Escape}');

    expect(dialog.open).toBe(true);
  });

  test('throws without a provider', () => {
    expect(() =>
      render(() => {
        createDismissal('Overlay', { open: () => false, elements: () => [], onDismiss: () => {} });
        return null;
      }),
    ).toThrow('<Overlay> must be rendered inside <SlopkitUi>.');
  });

  test('opening and dismissing has no diagnostics', async () => {
    const { getByText } = setup(() => <Overlay name="menu" />);

    const { artifact } = await captureArtifact(
      async () => {
        await userEvent.click(getByText('menu anchor'));
        press('Escape');
      },
      { scenario: 'dismissal-escape' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(2, { scope: /dismissal\./ });
  });
});
