import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { SlopkitUi } from '../../provider';
import { Tooltip, type TooltipProps } from './tooltip';

function setup(props: Partial<Omit<TooltipProps, 'children'>> = {}) {
  const result = render(() => (
    <SlopkitUi>
      <Tooltip label="Copy link" {...props}>
        {(target) => <button {...target}>Copy</button>}
      </Tooltip>
    </SlopkitUi>
  ));
  return {
    ...result,
    target: () => result.getByText('Copy'),
    tooltip: () => result.getByRole('tooltip', { hidden: true }),
  };
}

describe('<Tooltip />', () => {
  test('always rendered: a manual popover with role tooltip, which describes the target', () => {
    const { target, tooltip } = setup();

    expect(tooltip().tagName).toBe('SPAN');
    expect(tooltip()).toHaveAttribute('popover', 'manual');
    expect(tooltip()).toHaveTextContent('Copy link');
    expect(tooltip().id).toMatch(/^slp-tooltip-/);
    expect(target()).toHaveAttribute('aria-describedby', tooltip().id);
    expect(tooltip()).toHaveAttribute('data-status', 'closed');
    expect(tooltip().style.display).toBe('none');
  });

  test('its root class, defaults, and the props passed to it', () => {
    const { tooltip } = setup({ class: 'mine', style: { width: '8rem' }, 'data-testid': 'tip' } as never);

    expect(tooltip()).toHaveClass('slp-tooltip', 'slp-transition', 'mine');
    expect(tooltip()).toHaveAttribute('data-color', 'neutral');
    expect(tooltip()).toHaveAttribute('data-placement', 'top');
    expect(tooltip()).toHaveAttribute('data-transition', 'fade');
    expect(tooltip()).toHaveAttribute('data-testid', 'tip');
    expect(tooltip().style.width).toBe('8rem');
    expect(tooltip().querySelector('[data-slot="tooltip-arrow"]')).toBeNull();
  });

  test('controlled: shown while opened, with the color, position and arrow', () => {
    const [opened, setOpened] = createSignal(true);
    const { getByRole } = render(() => (
      <SlopkitUi>
        <Tooltip label="Saved" opened={opened()} color="success" position="right-end" withArrow transition="scale">
          {(target) => <button {...target}>Save</button>}
        </Tooltip>
      </SlopkitUi>
    ));
    const tooltip = getByRole('tooltip', { hidden: true });

    expect(tooltip).toHaveAttribute('data-status', 'open');
    expect(tooltip).toHaveAttribute('data-color', 'success');
    expect(tooltip).toHaveAttribute('data-placement', 'right-end');
    expect(tooltip).toHaveAttribute('data-transition', 'scale');
    expect(tooltip.querySelector('[data-slot="tooltip-arrow"]')).not.toBeNull();

    setOpened(false);
    flush();
    expect(tooltip).not.toHaveAttribute('data-status', 'open');
  });

  test('disabled: never shown, even when opened', () => {
    const { tooltip } = setup({ opened: true, disabled: true });

    expect(tooltip()).toHaveAttribute('data-status', 'closed');
  });

  test('throws outside the provider', () => {
    expect(() => render(() => <Tooltip label="Alone">{(target) => <button {...target}>Copy</button>}</Tooltip>)).toThrow(
      '<Tooltip> must be rendered inside <SlopkitUi>.',
    );
  });

  test('has no axe violations, shown and hidden', async () => {
    const { container } = render(() => (
      <SlopkitUi>
        <Tooltip label="Hidden">{(target) => <button {...target}>One</button>}</Tooltip>
        <Tooltip label="Shown" opened withArrow>
          {(target) => <button {...target}>Two</button>}
        </Tooltip>
      </SlopkitUi>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./tooltip.fixtures.tsx', 'tooltips');
  });
});
