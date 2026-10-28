// The `@solid-slopkit/components/primitives` entry, used the way primitives.md shows: an overlay put together from the
// exported primitives, and the keyboard ones on a toolbar. Each primitive has its own tests next to its source.
import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import type { JSX } from '@solidjs/web';
import { createEffect, createSignal, For } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../components/provider';
import * as primitives from '.';
import { createDismissal, createFloating, createFocusScope, createListNavigation, createPresence, createTypeahead } from '.';
import { NO_DIAGNOSTICS } from '../../test/diagnostics';

// The example from primitives.md.
function Details(props: { label: string; children: JSX.Element }) {
  const [open, setOpen] = createSignal(false, { name: 'Details.open' });
  let button: HTMLButtonElement | undefined;
  let panel: HTMLDivElement | undefined;

  const presence = createPresence({ present: open, element: () => panel });
  const floating = createFloating({
    reference: () => button,
    floating: () => panel,
    open: presence.mounted,
    placement: () => 'bottom-start',
    offset: () => 8,
  });
  createDismissal('Details', { open, elements: () => [button, panel], onDismiss: () => setOpen(false) });
  createFocusScope({ open: () => open() && presence.mounted(), element: () => panel, restoreTarget: () => button });

  createEffect(presence.mounted, (mounted) => {
    if (mounted) {
      panel!.showPopover();
      floating.update();
    } else if (panel!.matches(':popover-open')) panel!.hidePopover();
  });

  return (
    <>
      <button ref={(el) => (button = el)} aria-expanded={open() ? 'true' : 'false'} onClick={() => setOpen(!open())}>
        {props.label}
      </button>
      <div
        ref={(el) => (panel = el)}
        popover="manual"
        role="dialog"
        aria-label={props.label}
        tabindex={-1}
        data-testid="panel"
        data-status={presence.status()}
        data-placement={floating.placement()}
      >
        {props.children}
      </div>
    </>
  );
}

const ITEMS = ['Bold', 'Italic', 'Underline'];

function Toolbar() {
  const [active, setActive] = createSignal(0, { name: 'Toolbar.active' });
  const buttons: HTMLButtonElement[] = [];
  const move = (index: number) => {
    setActive(index);
    buttons[index].focus();
  };
  const navigation = createListNavigation({
    orientation: () => 'horizontal',
    count: () => ITEMS.length,
    current: active,
    onMove: move,
  });
  const typeahead = createTypeahead({
    count: () => ITEMS.length,
    current: active,
    getLabel: (index) => ITEMS[index],
    onMatch: move,
  });
  return (
    <div
      role="toolbar"
      aria-label="Format"
      onKeyDown={(event) => {
        typeahead.onKeyDown(event);
        navigation.onKeyDown(event);
      }}
    >
      <For each={ITEMS}>
        {(item, index) => (
          <button ref={(el) => (buttons[index()] = el)} tabindex={active() === index() ? 0 : -1}>
            {item}
          </button>
        )}
      </For>
    </div>
  );
}

describe('@solid-slopkit/components/primitives', () => {
  test('exports the stable primitives only', () => {
    expect(Object.keys(primitives).sort()).toEqual([
      'createDismissal',
      'createFloating',
      'createFocusScope',
      'createListNavigation',
      'createPresence',
      'createScrollLock',
      'createTypeahead',
      'getTabbables',
    ]);
  });

  test('an overlay put together from them opens, positions, takes focus, and closes on Escape', async () => {
    const { getByRole, getByTestId } = render(() => (
      <SlopkitUi>
        <div style={{ padding: '40px' }}>
          <Details label="Shipping">
            <button>Got it</button>
          </Details>
        </div>
      </SlopkitUi>
    ));
    const button = getByRole('button', { name: 'Shipping' });
    const panel = getByTestId('panel');

    const { artifact } = await captureArtifact(async () => {
      await userEvent.click(button);
      await expect.poll(() => document.activeElement).toBe(getByRole('button', { name: 'Got it' }));
    });
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(panel.matches(':popover-open')).toBe(true);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(() => panel.dataset.status).toBe('open');
    await expect.poll(() => panel.style.top).not.toBe('');
    const anchor = button.getBoundingClientRect();
    expect(panel.getBoundingClientRect().top).toBeCloseTo(anchor.bottom + 8, 0);
    expect(panel.getBoundingClientRect().left).toBeCloseTo(anchor.left, 0);

    await userEvent.keyboard('{Escape}');
    await expect.poll(() => panel.matches(':popover-open')).toBe(false);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(button);
  });

  test('the keyboard primitives move through a toolbar by arrows and by typing', async () => {
    const { getByRole } = render(() => <Toolbar />);
    getByRole('button', { name: 'Bold' }).focus();

    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(getByRole('button', { name: 'Italic' }));
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(getByRole('button', { name: 'Underline' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(getByRole('button', { name: 'Bold' }));
    await userEvent.keyboard('i');
    expect(document.activeElement).toBe(getByRole('button', { name: 'Italic' }));
  });
});
