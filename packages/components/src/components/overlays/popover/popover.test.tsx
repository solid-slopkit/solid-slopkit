import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { SlopkitUi } from '../../provider';
import { Popover } from './popover';

describe('<Popover />', () => {
  test('closed: only the target, with its popup attributes', () => {
    const { getByText, queryByRole } = render(() => (
      <SlopkitUi>
        <Popover>
          <Popover.Target>{(target) => <button {...target}>Open</button>}</Popover.Target>
          <Popover.Dropdown aria-label="Details">Content</Popover.Dropdown>
        </Popover>
      </SlopkitUi>
    ));

    expect(getByText('Open')).toHaveAttribute('aria-haspopup', 'dialog');
    expect(getByText('Open')).toHaveAttribute('aria-expanded', 'false');
    expect(getByText('Open')).not.toHaveAttribute('aria-controls');
    expect(queryByRole('dialog', { hidden: true })).toBeNull();
  });

  test('the dropdown: a manual popover with the root class, slot, status and placement', () => {
    const { getByRole } = render(() => (
      <SlopkitUi>
        <Popover defaultOpened withArrow position="left-end" transition="scale">
          <Popover.Target>{(target) => <button {...target}>Open</button>}</Popover.Target>
          <Popover.Dropdown aria-label="Details" class="mine" style={{ width: '12rem' }}>
            Content
          </Popover.Dropdown>
        </Popover>
      </SlopkitUi>
    ));
    const dropdown = getByRole('dialog', { hidden: true });

    expect(dropdown).toHaveAttribute('popover', 'manual');
    expect(dropdown).toHaveAttribute('tabindex', '-1');
    expect(dropdown).toHaveAttribute('data-slot', 'popover-dropdown');
    expect(dropdown).toHaveAttribute('data-placement', 'left-end');
    expect(dropdown).toHaveAttribute('data-transition', 'scale');
    expect(dropdown).toHaveAttribute('data-status', 'open');
    expect(dropdown).toHaveClass('slp-popover', 'slp-transition', 'mine');
    expect(dropdown.style.width).toBe('12rem');
    expect(dropdown.querySelector('[data-slot="popover-arrow"]')).not.toBeNull();
  });

  test("the target's render function runs once: a signal it reads doesn't rebuild the target", () => {
    const [label, setLabel] = createSignal('One');
    const { getByRole } = render(() => (
      <SlopkitUi>
        <Popover>
          <Popover.Target>
            {(target) => {
              // Read directly, outside any JSX expression.
              const name = label();
              return (
                <button {...target} aria-label={name}>
                  Open
                </button>
              );
            }}
          </Popover.Target>
          <Popover.Dropdown>Content</Popover.Dropdown>
        </Popover>
      </SlopkitUi>
    ));
    flush();
    const target = getByRole('button');

    setLabel('Two');
    flush();
    expect(getByRole('button')).toBe(target);
  });

  test('its parts throw outside a Popover, and Popover throws outside the provider', () => {
    expect(() => render(() => <Popover.Dropdown>Content</Popover.Dropdown>)).toThrow(
      '<Popover.Dropdown> must be rendered inside <Popover>.',
    );
    expect(() =>
      render(() => (
        <Popover>
          <Popover.Target>{(target) => <button {...target}>Open</button>}</Popover.Target>
        </Popover>
      )),
    ).toThrow('<Popover> must be rendered inside <SlopkitUi>.');
  });

  test('hydrates the server render without mismatches or diagnostics: closed', async () => {
    await expectHydration('./popover.fixtures.tsx', 'closed');
  });

  test('hydrates the server render without mismatches or diagnostics: open', async () => {
    await expectHydration('./popover.fixtures.tsx', 'open');
  });
});
