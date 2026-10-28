import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Popover } from '../popover';
import { Tooltip, type TooltipProps } from './tooltip';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

function setup(props: Partial<Omit<TooltipProps, 'children'>> = {}) {
  const result = render(() => (
    <SlopkitUi>
      <button>Before</button>
      <div style={{ padding: '80px 160px' }}>
        <Tooltip label="Copy link" transition="none" {...props}>
          {(target) => <button {...target}>Copy</button>}
        </Tooltip>
      </div>
      <button>After</button>
    </SlopkitUi>
  ));
  const target = () => result.getByText('Copy');
  const tooltip = () => result.getByRole('tooltip', { hidden: true });
  const shown = () => tooltip().matches(':popover-open');
  return { ...result, target, tooltip, shown };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('<Tooltip /> in a browser', () => {
  test('hovering the target shows it in the top layer, above the target', async () => {
    const { target, tooltip, shown } = setup();

    await userEvent.hover(target());
    await expect.poll(shown).toBe(true);
    await expect
      .poll(() => Math.round(tooltip().getBoundingClientRect().bottom))
      .toBe(Math.round(target().getBoundingClientRect().top) - 6);
    expect(tooltip()).toHaveAttribute('data-placement', 'top');

    await userEvent.unhover(target());
    await expect.poll(shown).toBe(false);
  });

  test('the pointer can move onto it without hiding it', async () => {
    const { target, tooltip, shown } = setup();

    await userEvent.hover(target());
    await expect.poll(shown).toBe(true);
    await userEvent.hover(tooltip());
    await wait(250);
    expect(shown()).toBe(true);

    await userEvent.unhover(tooltip());
    await expect.poll(shown).toBe(false);
  });

  test('openDelay waits before showing it, and leaving first cancels it', async () => {
    const { target, shown } = setup({ openDelay: 200 });

    await userEvent.hover(target());
    expect(shown()).toBe(false);
    await userEvent.unhover(target());
    await wait(300);
    expect(shown()).toBe(false);

    await userEvent.hover(target());
    await expect.poll(shown, { timeout: 1000 }).toBe(true);
  });

  test('hovered while disabled, it stays hidden once enabled', async () => {
    const [disabled, setDisabled] = createSignal(true);
    const { target, shown } = setup({
      get disabled() {
        return disabled();
      },
    });

    await userEvent.hover(target());
    await userEvent.unhover(target());
    await wait(150);
    setDisabled(false);
    flush();
    await wait(50);
    expect(shown()).toBe(false);

    await userEvent.hover(target());
    await expect.poll(shown).toBe(true);
  });

  test('keyboard focus shows it, and blurring hides it; a click does not', async () => {
    const { target, shown } = setup();

    await userEvent.click(target());
    target().blur();
    await userEvent.unhover(target());
    await expect.poll(shown).toBe(false);

    (document.querySelector('button') as HTMLButtonElement).focus();
    await userEvent.keyboard('{Tab}');
    expect(target()).toHaveFocus();
    await expect.poll(shown).toBe(true);

    await userEvent.keyboard('{Tab}');
    await expect.poll(shown).toBe(false);
  });

  test('Escape hides it, and onChange hears about each change', async () => {
    const onChange = vi.fn();
    const { target, shown } = setup({ onChange });

    (document.querySelector('button') as HTMLButtonElement).focus();
    await userEvent.keyboard('{Tab}');
    expect(target()).toHaveFocus();
    await expect.poll(shown).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(true);

    await userEvent.keyboard('{Escape}');
    await expect.poll(shown).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(target()).toHaveFocus();
  });

  test('inside an open popover, Escape hides the tooltip first', async () => {
    const { getByText, getByRole } = render(() => (
      <SlopkitUi>
        <Popover defaultOpened transition="none">
          <Popover.Target>{(target) => <button {...target}>Open</button>}</Popover.Target>
          <Popover.Dropdown aria-label="Details">
            <Tooltip label="Inner" transition="none">
              {(target) => <button {...target}>Inside</button>}
            </Tooltip>
          </Popover.Dropdown>
        </Popover>
      </SlopkitUi>
    ));
    const tooltip = getByRole('tooltip', { hidden: true });

    await expect.poll(() => getByText('Inside').matches(':focus')).toBe(true);
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}{Tab}');
    await expect.poll(() => tooltip.matches(':popover-open')).toBe(true);

    await userEvent.keyboard('{Escape}');
    await expect.poll(() => tooltip.matches(':popover-open')).toBe(false);
    expect(getByRole('dialog')).toBeVisible();
  });

  test('hovering in and out has no diagnostics', async () => {
    const { target, shown } = setup();
    flush();

    const { artifact } = await captureArtifact(
      async () => {
        await userEvent.hover(target());
        await expect.poll(shown).toBe(true);
        await userEvent.unhover(target());
        await expect.poll(shown).toBe(false);
      },
      { scenario: 'tooltip-hover' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(2, { scope: /dismissal\.layer/ });
  });
});
