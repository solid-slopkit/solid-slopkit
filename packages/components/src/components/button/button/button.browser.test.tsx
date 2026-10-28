import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { Button } from './button';

describe('<Button /> in a browser', () => {
  test('Tab reaches buttons in order and skips disabled ones; Enter and Space press them', async () => {
    const onSave = vi.fn();
    const onDiv = vi.fn();
    const { getByRole } = render(() => (
      <>
        <Button onClick={onSave}>Save</Button>
        <Button disabled>Disabled</Button>
        <Button as="div" disabled>
          Disabled div
        </Button>
        <Button as="div" onClick={onDiv}>
          Div
        </Button>
      </>
    ));

    await userEvent.tab();
    expect(getByRole('button', { name: 'Save' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onSave).toHaveBeenCalledTimes(2);

    await userEvent.tab();
    expect(getByRole('button', { name: 'Div' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onDiv).toHaveBeenCalledTimes(2);
  });

  test('Space on a role="button" element does not scroll the page', async () => {
    const { getByRole } = render(() => (
      <div style={{ height: '300vh' }}>
        <Button as="div">Div</Button>
      </div>
    ));
    getByRole('button', { name: 'Div' }).focus();

    await userEvent.keyboard(' ');
    expect(window.scrollY).toBe(0);
  });

  test('a medium button is 8 field units tall, and focus shows an outline', async () => {
    const { getByRole } = render(() => <Button color="primary">Save</Button>);
    const button = getByRole('button', { name: 'Save' });

    expect(button.getBoundingClientRect().height).toBe(32);
    await userEvent.tab();
    expect(getComputedStyle(button).outlineStyle).toBe('solid');
  });

  test('outline and dash borders are a faded text color: a fifth of the base text, or half the accent', () => {
    const probe = (color: string) => <span data-probe style={{ color }} />;
    const { getByRole, container } = render(() => (
      <>
        <Button variant="outline">Base</Button>
        <Button variant="dash" color="primary">
          Primary
        </Button>
        <Button variant="outline" style={{ '--slp-button-color': 'rgb(200, 0, 0)' }}>
          Custom
        </Button>
        {probe('color-mix(in oklab, var(--slp-color-base-content) 20%, transparent)')}
        {probe('color-mix(in oklab, var(--slp-color-primary) 50%, transparent)')}
        {probe('color-mix(in oklab, rgb(200, 0, 0) 50%, transparent)')}
        {probe('var(--slp-color-primary)')}
      </>
    ));
    const [baseBorder, primaryBorder, customBorder, primary] = [...container.querySelectorAll('[data-probe]')].map(
      (el) => getComputedStyle(el).color,
    );
    const css = (name: string) => getComputedStyle(getByRole('button', { name }));

    expect(css('Base').borderTopColor).toBe(baseBorder);
    expect(css('Primary').borderTopColor).toBe(primaryBorder);
    expect(css('Primary').borderTopStyle).toBe('dashed');
    expect(css('Custom').borderTopColor).toBe(customBorder);
    // The text keeps the full color.
    expect(css('Primary').color).toBe(primary);
  });
});
