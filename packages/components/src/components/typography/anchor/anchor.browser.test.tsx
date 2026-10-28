import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { Anchor } from './anchor';

describe('<Anchor /> in a browser', () => {
  test('takes the surrounding size, the primary color, and an underline', () => {
    const { getByRole, getByTestId } = render(() => (
      <p style={{ 'font-size': '14px', 'line-height': '20px' }}>
        Read the <Anchor href="#terms">terms</Anchor>.
        <span data-testid="token" style={{ color: 'var(--slp-color-primary)' }} />
      </p>
    ));
    const css = getComputedStyle(getByRole('link', { name: 'terms' }));

    expect([css.fontSize, css.lineHeight]).toEqual(['14px', '20px']);
    expect(css.color).toBe(getComputedStyle(getByTestId('token')).color);
    expect(css.textDecorationLine).toBe('underline');
  });

  test('underline="hover" underlines on hover only, and "never" not at all', async () => {
    const { getByRole } = render(() => (
      <>
        <Anchor href="#a" underline="hover">
          Hover
        </Anchor>{' '}
        <Anchor href="#b" underline="never">
          Never
        </Anchor>
      </>
    ));
    const hover = getByRole('link', { name: 'Hover' });

    expect(getComputedStyle(hover).textDecorationLine).toBe('none');
    await userEvent.hover(hover);
    expect(getComputedStyle(hover).textDecorationLine).toBe('underline');
    await userEvent.hover(getByRole('link', { name: 'Never' }));
    expect(getComputedStyle(getByRole('link', { name: 'Never' })).textDecorationLine).toBe('none');
  });

  test('Tab focuses it with a visible outline, and Enter follows it', async () => {
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    const { getByRole } = render(() => (
      <Anchor href="#next" onClick={onClick}>
        Next
      </Anchor>
    ));
    const link = getByRole('link', { name: 'Next' });

    await userEvent.tab();
    expect(link).toHaveFocus();
    expect(getComputedStyle(link).outlineStyle).toBe('solid');

    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
