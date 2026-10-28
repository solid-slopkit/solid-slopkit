import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import type { JSX } from '@solidjs/web';
import { createEffect, createSignal, flush, Show, untrack } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { createFocusScope, getTabbables, type FocusScopeOptions } from './create-focus-scope';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

interface ScopeProps extends Partial<Omit<FocusScopeOptions, 'open' | 'element' | 'restoreTarget'>> {
  name: string;
  open: () => boolean;
  withRestoreTarget?: boolean;
  children?: JSX.Element;
}

// Each scope sits on its own spot along the bottom of the viewport, so none covers another or the triggers.
const LEFT: Record<string, number> = { scope: 150, outer: 150, inner: 350 };

/** A trigger and a manual popover shown while `open`, focus-managed. */
function Scope(props: ScopeProps) {
  let trigger: HTMLButtonElement | undefined;
  let panel: HTMLDivElement | undefined;

  createEffect(
    () => props.open(),
    (open) => {
      if (open) panel!.showPopover();
      else if (panel!.matches(':popover-open')) panel!.hidePopover();
    },
  );

  // Options one by one: spreading the props would read `children` and create them a second time.
  createFocusScope({
    autoFocus: () => props.autoFocus?.() ?? true,
    restoreFocus: () => props.restoreFocus?.() ?? true,
    trap: () => props.trap?.() ?? false,
    open: () => props.open(),
    element: () => panel,
    restoreTarget: untrack(() => props.withRestoreTarget) ? () => trigger : undefined,
  });

  return (
    <div>
      <button ref={(el) => (trigger = el)}>{`${props.name} trigger`}</button>
      <div
        ref={(el) => (panel = el)}
        popover="manual"
        tabindex={-1}
        data-testid={props.name}
        style={{ inset: 'auto', bottom: '0', left: `${LEFT[props.name]}px`, margin: '0' }}
      >
        {props.children}
      </div>
    </div>
  );
}

function setup(content: (open: () => boolean) => JSX.Element, initiallyOpen = false) {
  const [open, setOpen] = createSignal(initiallyOpen);
  const result = render(() => (
    <>
      <button>Before</button>
      <p data-testid="text">Text</p>
      {content(open)}
      <input aria-label="Elsewhere" />
    </>
  ));
  const toggle = async (value: boolean) => {
    setOpen(value);
    flush();
    // Focus moves in once the update has finished.
    await Promise.resolve();
  };
  return { ...result, open, toggle };
}

describe('createFocusScope', () => {
  test('opening focuses the first tabbable element, past disabled, untabbable and hidden ones', async () => {
    const { getByText, toggle } = setup((open) => (
      <Scope name="scope" open={open}>
        <button disabled>Disabled</button>
        <button tabindex={-1}>Untabbable</button>
        <button style={{ display: 'none' }}>Hidden</button>
        <button style={{ visibility: 'hidden' }}>Invisible</button>
        <button>First</button>
        <button>Second</button>
      </Scope>
    ));
    getByText('scope trigger').focus();

    await toggle(true);

    expect(getByText('First')).toHaveFocus();
  });

  test('an element marked data-autofocus comes first', async () => {
    const { getByText, toggle } = setup((open) => (
      <Scope name="scope" open={open}>
        <button>First</button>
        <button data-autofocus>Marked</button>
      </Scope>
    ));

    await toggle(true);

    expect(getByText('Marked')).toHaveFocus();
  });

  test('with nothing tabbable, the container itself takes focus', async () => {
    const { getByTestId, toggle } = setup((open) => (
      <Scope name="scope" open={open}>
        Just text
      </Scope>
    ));

    await toggle(true);

    expect(getByTestId('scope')).toHaveFocus();
  });

  test('autoFocus off: focus stays where it was', async () => {
    const { getByText, toggle } = setup((open) => (
      <Scope name="scope" open={open} autoFocus={() => false}>
        <button>First</button>
      </Scope>
    ));
    getByText('scope trigger').focus();

    await toggle(true);

    expect(getByText('scope trigger')).toHaveFocus();
  });

  test('closing moves focus back to where it was before opening', async () => {
    const { getByText, toggle } = setup((open) => (
      <Scope name="scope" open={open}>
        <button>First</button>
      </Scope>
    ));
    getByText('scope trigger').focus();
    await toggle(true);
    expect(getByText('First')).toHaveFocus();

    await toggle(false);

    expect(getByText('scope trigger')).toHaveFocus();
  });

  test('closing after the user moved focus elsewhere leaves it there', async () => {
    const { getByText, getByLabelText, toggle } = setup((open) => (
      <Scope name="scope" open={open}>
        <button>First</button>
      </Scope>
    ));
    getByText('scope trigger').focus();
    await toggle(true);

    await userEvent.click(getByLabelText('Elsewhere'));
    await toggle(false);

    expect(getByLabelText('Elsewhere')).toHaveFocus();
  });

  test('restoreTarget: where focus goes back when nothing had it before opening', async () => {
    const { getByText, toggle } = setup((open) => (
      <Scope name="scope" open={open} withRestoreTarget>
        <button>First</button>
      </Scope>
    ));
    (document.activeElement as HTMLElement | null)?.blur();
    await toggle(true);

    await toggle(false);

    expect(getByText('scope trigger')).toHaveFocus();
  });

  test('restoreFocus off: focus is not moved back', async () => {
    const { getByText, toggle } = setup((open) => (
      <Scope name="scope" open={open} restoreFocus={() => false}>
        <button>First</button>
      </Scope>
    ));
    getByText('scope trigger').focus();
    await toggle(true);

    await toggle(false);

    expect(getByText('scope trigger')).not.toHaveFocus();
  });

  test('unmounting while open moves focus back', async () => {
    const [mounted, setMounted] = createSignal(true);
    const { getByText, toggle } = setup((open) => (
      <>
        <button>Outside trigger</button>
        <Show when={mounted()}>
          <Scope name="scope" open={open}>
            <button>First</button>
          </Scope>
        </Show>
      </>
    ));
    getByText('Outside trigger').focus();
    await toggle(true);
    expect(getByText('First')).toHaveFocus();

    setMounted(false);
    flush();

    expect(getByText('Outside trigger')).toHaveFocus();
  });

  test('trap: Tab and Shift+Tab wrap around inside', async () => {
    const { getByText, toggle } = setup((open) => (
      <Scope name="scope" open={open} trap={() => true}>
        <button>First</button>
        <button>Last</button>
      </Scope>
    ));
    await toggle(true);

    await userEvent.tab();
    expect(getByText('Last')).toHaveFocus();
    await userEvent.tab();
    expect(getByText('First')).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(getByText('Last')).toHaveFocus();
  });

  test('trap with nothing tabbable: Tab keeps focus on the container', async () => {
    const { getByTestId, toggle } = setup((open) => (
      <Scope name="scope" open={open} trap={() => true}>
        Just text
      </Scope>
    ));
    await toggle(true);

    await userEvent.tab();

    expect(getByTestId('scope')).toHaveFocus();
  });

  test('without a trap, Tab leaves', async () => {
    const { getByText, toggle } = setup((open) => (
      <Scope name="scope" open={open}>
        <button>Only</button>
      </Scope>
    ));
    await toggle(true);

    await userEvent.tab();

    expect(getByText('Only')).not.toHaveFocus();
  });

  test('trap: focus that lands outside is brought back to where it was inside', async () => {
    const { getByText, getByLabelText, toggle } = setup((open) => (
      <Scope name="scope" open={open} trap={() => true}>
        <button>First</button>
        <button>Second</button>
      </Scope>
    ));
    await toggle(true);
    getByText('Second').focus();

    getByLabelText('Elsewhere').focus();
    expect(getByText('Second')).toHaveFocus();

    await userEvent.click(getByLabelText('Elsewhere'));
    expect(getByText('Second')).toHaveFocus();
  });

  test('trap: a click on something that takes no focus brings it back too', async () => {
    const { getByText, getByTestId, toggle } = setup((open) => (
      <Scope name="scope" open={open} trap={() => true}>
        <button>First</button>
      </Scope>
    ));
    await toggle(true);

    await userEvent.click(getByTestId('text'));

    await expect.poll(() => document.activeElement).toBe(getByText('First'));
  });

  test('nested traps: the inner one wraps inside itself; the outer one takes over once it closes', async () => {
    const [innerOpen, setInnerOpen] = createSignal(false);
    const { getByText, toggle } = setup((open) => (
      <Scope name="outer" open={open} trap={() => true}>
        <button>Outer first</button>
        <Scope name="inner" open={innerOpen} trap={() => true}>
          <button>Inner first</button>
          <button>Inner last</button>
        </Scope>
      </Scope>
    ));
    await toggle(true);
    getByText('inner trigger').focus();
    setInnerOpen(true);
    flush();
    await Promise.resolve();
    expect(getByText('Inner first')).toHaveFocus();

    await userEvent.tab();
    await userEvent.tab();
    expect(getByText('Inner first')).toHaveFocus();

    setInnerOpen(false);
    flush();
    expect(getByText('inner trigger')).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(getByText('Outer first')).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(getByText('inner trigger')).toHaveFocus();
  });

  test('opening and closing has no diagnostics', async () => {
    const { getByText, toggle } = setup((open) => (
      <Scope name="scope" open={open} trap={() => true}>
        <button>First</button>
      </Scope>
    ));
    getByText('scope trigger').focus();

    const { artifact } = await captureArtifact(
      async () => {
        await toggle(true);
        await toggle(false);
      },
      { scenario: 'focus-scope-open-close' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(2, { scope: /focusScope\./ });
  });
});

describe('getTabbables', () => {
  test('one radio per group: the checked one, or the first; inert subtrees are left out', () => {
    const { container } = render(() => (
      <div>
        <input type="radio" name="size" aria-label="S" />
        <input type="radio" name="size" aria-label="M" checked />
        <input type="radio" name="color" aria-label="Red" />
        <input type="radio" name="color" aria-label="Blue" />
        <div inert>
          <button>Inert</button>
        </div>
        <a href="#x">Link</a>
        <a>No href</a>
        <div tabindex={0}>Div</div>
      </div>
    ));

    const names = getTabbables(container).map((el) => el.getAttribute('aria-label') ?? el.textContent);

    expect(names).toEqual(['M', 'Red', 'Link', 'Div']);
  });
});
