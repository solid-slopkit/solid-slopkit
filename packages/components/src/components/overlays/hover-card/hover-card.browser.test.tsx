import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { flush } from 'solid-js';
import { userEvent } from 'vitest/browser';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { HoverCard, type HoverCardProps } from './hover-card';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

function setup(props: Partial<HoverCardProps> = {}) {
  const result = render(() => (
    <SlopkitUi>
      <button>Before</button>
      <div style={{ padding: '40px 160px 200px' }}>
        <HoverCard transition="none" {...props}>
          <HoverCard.Target>
            {(target) => (
              <a href="#ada" {...target}>
                @ada
              </a>
            )}
          </HoverCard.Target>
          <HoverCard.Dropdown aria-label="Ada's profile">
            <p style={{ margin: 0 }}>Ada Lovelace</p>
            <a href="#follow">Follow</a>
          </HoverCard.Dropdown>
        </HoverCard>
      </div>
      <button>After</button>
    </SlopkitUi>
  ));
  const target = () => result.getByText('@ada');
  const dropdown = () => result.queryByText('Ada Lovelace')?.parentElement ?? null;
  const shown = () => !!dropdown()?.matches(':popover-open');
  return { ...result, target, dropdown, shown };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const tabFromStart = async (presses: number) => {
  (document.querySelector('button') as HTMLButtonElement).focus();
  for (let i = 0; i < presses; i++) await userEvent.keyboard('{Tab}');
};

describe('<HoverCard /> in a browser', () => {
  test('hovering the target shows it in the top layer, below the target', async () => {
    const { target, dropdown, shown } = setup();

    await userEvent.hover(target());
    await expect.poll(shown).toBe(true);
    await expect
      .poll(() => Math.round(dropdown()!.getBoundingClientRect().top))
      .toBe(Math.round(target().getBoundingClientRect().bottom) + 8);

    await userEvent.unhover(target());
    await expect.poll(() => dropdown()).toBeNull();
  });

  test('the pointer can move onto it, and leaving it hides it', async () => {
    const { target, dropdown, shown, getByText } = setup();

    await userEvent.hover(target());
    await expect.poll(shown).toBe(true);
    await userEvent.hover(getByText('Ada Lovelace'));
    await wait(300);
    expect(shown()).toBe(true);

    await userEvent.unhover(getByText('Ada Lovelace'));
    await expect.poll(() => dropdown()).toBeNull();
  });

  test('openDelay waits, and leaving before it cancels showing it', async () => {
    const { target, dropdown, shown } = setup({ openDelay: 200 });

    await userEvent.hover(target());
    expect(dropdown()).toBeNull();
    await userEvent.unhover(target());
    await wait(300);
    expect(dropdown()).toBeNull();

    await userEvent.hover(target());
    await expect.poll(shown, { timeout: 1000 }).toBe(true);
  });

  test('keyboard focus shows it, Tab moves into it, and leaving both hides it', async () => {
    const { target, dropdown, shown, getByText } = setup();

    await tabFromStart(1);
    expect(target()).toHaveFocus();
    await expect.poll(shown).toBe(true);

    await userEvent.keyboard('{Tab}');
    expect(getByText('Follow')).toHaveFocus();
    expect(shown()).toBe(true);

    await userEvent.keyboard('{Tab}');
    expect(getByText('After')).toHaveFocus();
    await expect.poll(() => dropdown()).toBeNull();
  });

  test('focus inside keeps it shown when the pointer leaves', async () => {
    const { target, shown } = setup();

    await tabFromStart(2);
    await expect.poll(shown).toBe(true);
    await userEvent.hover(target());
    await userEvent.unhover(target());
    await wait(300);
    expect(shown()).toBe(true);
  });

  test('Escape closes it and moves focus from inside back to the target, without showing it again', async () => {
    const onChange = vi.fn();
    const { target, dropdown, getByText } = setup({ onChange });

    await tabFromStart(2);
    expect(getByText('Follow')).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await expect.poll(() => dropdown()).toBeNull();
    expect(target()).toHaveFocus();
    await wait(50);
    expect(dropdown()).toBeNull();
    expect(onChange.mock.calls).toEqual([[true], [false]]);
  });

  test('a press outside closes it', async () => {
    const { target, dropdown, shown, getByText } = setup();

    await userEvent.hover(target());
    await expect.poll(shown).toBe(true);
    await userEvent.click(getByText('Before'));

    await expect.poll(() => dropdown()).toBeNull();
  });

  test('open, it has no axe violations', async () => {
    const { target, shown, container } = setup();

    await userEvent.hover(target());
    await expect.poll(shown).toBe(true);

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hovering in and out has no diagnostics', async () => {
    const { target, dropdown, shown } = setup();
    flush();

    const { artifact } = await captureArtifact(
      async () => {
        await userEvent.hover(target());
        await expect.poll(shown).toBe(true);
        await userEvent.unhover(target());
        await expect.poll(() => dropdown()).toBeNull();
      },
      { scenario: 'hover-card-hover' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(2, { scope: /dismissal\.layer/ });
  });
});
