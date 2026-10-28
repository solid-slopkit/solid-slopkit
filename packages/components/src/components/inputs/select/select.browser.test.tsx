import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Select, type SelectProps } from './select';

const cities = ['Amsterdam', 'Berlin', 'Copenhagen', 'Dublin', 'Edinburgh'];

function setup(props: Partial<SelectProps> = {}) {
  const onChange = vi.fn();
  const result = render(() => (
    <SlopkitUi>
      <div style={{ padding: '20px', width: '280px' }}>
        <Select
          label="City"
          data={cities}
          placeholder="Pick a city"
          onChange={onChange}
          leftSection={<span>@</span>}
          {...props}
        />
        <button type="button">After</button>
      </div>
    </SlopkitUi>
  ));
  const field = () => result.getByRole('combobox', { name: 'City' });
  const box = () => field().parentElement!;
  const dropdown = () => document.querySelector<HTMLElement>('.slp-combobox');
  return { ...result, field, box, dropdown, onChange };
}

describe('<Select /> in a browser', () => {
  test('a click opens it under the field box, as wide as the box; a click on an option chooses it', async () => {
    const { field, box, dropdown, onChange, getByRole } = setup();

    await userEvent.click(field());
    expect(dropdown()!.matches(':popover-open')).toBe(true);
    await expect
      .poll(() => Math.round(dropdown()!.getBoundingClientRect().left))
      .toBe(Math.round(box().getBoundingClientRect().left));
    expect(Math.round(dropdown()!.getBoundingClientRect().width)).toBe(Math.round(box().getBoundingClientRect().width));

    await userEvent.click(getByRole('option', { name: 'Dublin' }));
    expect(onChange).toHaveBeenCalledWith('Dublin', expect.anything());
    expect(field()).toHaveTextContent('Dublin');
    expect(field()).toHaveFocus();
    await expect.poll(dropdown).toBeNull();
  });

  test('a click on the chevron opens it too', async () => {
    const { field, box } = setup();
    const rect = box().getBoundingClientRect();

    await userEvent.click(box(), { position: { x: rect.width - 10, y: rect.height / 2 } });
    expect(field()).toHaveAttribute('aria-expanded', 'true');
  });

  test('a click on the label focuses it without opening it', async () => {
    const { field, getByText } = setup();

    await userEvent.click(getByText('City'));
    expect(field()).toHaveFocus();
    expect(field()).toHaveAttribute('aria-expanded', 'false');
  });

  test('the keyboard: Tab in, Enter opens, typing jumps, Enter chooses, Tab moves on', async () => {
    const { field, onChange, getByText } = setup();

    await userEvent.tab();
    expect(field()).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(field()).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('e');
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('Edinburgh', expect.anything());
    await userEvent.keyboard('{ArrowUp}{Escape}');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    expect(field()).toHaveTextContent('Edinburgh');
    await userEvent.tab();
    expect(getByText('After')).toHaveFocus();
  });

  test('a long value is cut with an ellipsis inside the box', () => {
    const { field } = setup({
      data: ['A city with a name much too long for the field'],
      defaultValue: 'A city with a name much too long for the field',
    });
    const value = field().querySelector<HTMLElement>('[data-slot="select-value"]')!;

    expect(value.scrollWidth).toBeGreaterThan(value.clientWidth);
    expect(getComputedStyle(value).textOverflow).toBe('ellipsis');
  });
});
