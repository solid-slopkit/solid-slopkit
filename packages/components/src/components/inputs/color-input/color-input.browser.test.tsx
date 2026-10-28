import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { ColorInput, type ColorInputProps } from './color-input';

function setup(props: Partial<ColorInputProps> = {}) {
  const onChange = vi.fn();
  const result = render(() => (
    <SlopkitUi>
      <div style={{ padding: '20px', width: '280px' }}>
        <button type="button">Before</button>
        <ColorInput label="Color" defaultValue="#ff0000" withEyeDropper={false} onChange={onChange} {...props} />
        <button type="button">After</button>
      </div>
    </SlopkitUi>
  ));
  const field = () => result.getByRole('combobox', { name: 'Color' }) as HTMLInputElement;
  const dropdown = () => document.querySelector<HTMLElement>('[data-slot="color-input-dropdown"]');
  return { ...result, field, dropdown, onChange };
}

describe('<ColorInput /> in a browser', () => {
  test('a click opens the picker under the field box, in the top layer', async () => {
    const { field, dropdown } = setup();

    await userEvent.click(field());
    expect(dropdown()!.matches(':popover-open')).toBe(true);
    const box = field().parentElement!.getBoundingClientRect();
    await expect.poll(() => Math.round(dropdown()!.getBoundingClientRect().left)).toBe(Math.round(box.left));
    expect(Math.round(dropdown()!.getBoundingClientRect().top)).toBe(Math.round(box.bottom + 4));
  });

  test('Tab moves into the picker and keeps it open; Escape closes it and returns to the field', async () => {
    const { field, getByRole } = setup();

    await userEvent.click(field());
    await userEvent.tab();
    expect(getByRole('slider', { name: 'Saturation and brightness' })).toHaveFocus();
    expect(field()).toHaveAttribute('aria-expanded', 'true');

    await userEvent.keyboard('{Escape}');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    expect(field()).toHaveFocus();
  });

  test('tabbing past the picker closes it', async () => {
    const { field, getByText } = setup();

    await userEvent.click(field());
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    expect(getByText('After')).toHaveFocus();
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('a press in the picker area changes the color and keeps it open; a press outside closes it', async () => {
    const { field, getByRole, getByText, onChange } = setup();

    await userEvent.click(field());
    const area = getByRole('slider', { name: 'Saturation and brightness' });
    await userEvent.click(area, { position: { x: 5, y: 5 } });
    expect(onChange).toHaveBeenCalled();
    expect(field()).toHaveValue(onChange.mock.lastCall![0]);
    expect(field()).toHaveAttribute('aria-expanded', 'true');

    // Above the field: the open picker covers what's under it.
    await userEvent.click(getByText('Before'));
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('typing a color updates the swatch and the picker; leaving formats it', async () => {
    const { field, getByText, container } = setup();
    const swatch = container.querySelector<HTMLElement>('[data-slot="color-input-swatch"]')!;

    await userEvent.tripleClick(field());
    await userEvent.keyboard('hsl(120, 100%, 25%)');
    expect(getComputedStyle(swatch).getPropertyValue('--_swatch-color')).toBe('#008000');
    await userEvent.click(getByText('Before'));
    expect(field()).toHaveValue('#008000');
  });
});
