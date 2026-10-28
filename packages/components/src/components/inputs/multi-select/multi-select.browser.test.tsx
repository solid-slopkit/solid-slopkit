import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { MultiSelect, type MultiSelectProps } from './multi-select';

const cities = ['Amsterdam', 'Berlin', 'Copenhagen', 'Dublin', 'Edinburgh'];

function setup(props: Partial<MultiSelectProps> = {}) {
  const onChange = vi.fn();
  const result = render(() => (
    <SlopkitUi>
      <div style={{ padding: '20px', width: '280px' }}>
        <button type="button">Before</button>
        <MultiSelect label="Cities" data={cities} placeholder="Pick cities" onChange={onChange} {...props} />
        <button type="button">After</button>
      </div>
    </SlopkitUi>
  ));
  const field = () => result.getByRole('combobox', { name: 'Cities' }) as HTMLInputElement;
  const box = () => field().closest<HTMLElement>('[data-slot="pills-input-box"]')!;
  const dropdown = () => document.querySelector<HTMLElement>('.slp-combobox');
  const pills = () => [...box().querySelectorAll('[data-slot="pill-label"]')].map((pill) => pill.textContent);
  return { ...result, field, box, dropdown, pills, onChange };
}

describe('<MultiSelect /> in a browser', () => {
  test('a click opens it under the box, as wide as it; clicks on options add them and keep it open', async () => {
    const { field, box, dropdown, pills, getByRole } = setup();

    await userEvent.click(field());
    expect(dropdown()!.matches(':popover-open')).toBe(true);
    await expect
      .poll(() => Math.round(dropdown()!.getBoundingClientRect().left))
      .toBe(Math.round(box().getBoundingClientRect().left));
    expect(Math.round(dropdown()!.getBoundingClientRect().width)).toBe(Math.round(box().getBoundingClientRect().width));

    await userEvent.click(getByRole('option', { name: 'Dublin' }));
    await userEvent.click(getByRole('option', { name: 'Berlin' }));
    expect(pills()).toEqual(['Dublin', 'Berlin']);
    expect(field()).toHaveFocus();
    expect(dropdown()!.matches(':popover-open')).toBe(true);
  });

  test('the dropdown moves down as the pills wrap onto a new row', async () => {
    const { field, box, dropdown, getByRole } = setup();

    await userEvent.click(field());
    const height = box().getBoundingClientRect().height;
    for (const city of ['Amsterdam', 'Copenhagen', 'Edinburgh']) await userEvent.click(getByRole('option', { name: city }));

    expect(box().getBoundingClientRect().height).toBeGreaterThan(height);
    await expect
      .poll(() => Math.round(dropdown()!.getBoundingClientRect().top))
      .toBe(Math.round(box().getBoundingClientRect().bottom + 4));
  });

  test('a click on the chevron opens it and focuses the field', async () => {
    const { field, box } = setup();
    const rect = box().getBoundingClientRect();

    await userEvent.click(box(), { position: { x: rect.width - 10, y: rect.height / 2 } });
    expect(field()).toHaveFocus();
    expect(field()).toHaveAttribute('aria-expanded', 'true');
  });

  test('the keyboard: typing filters, Enter adds, Backspace removes, Escape closes, Tab moves on', async () => {
    const { field, pills, getAllByRole, getByText } = setup();

    await userEvent.click(getByText('Before'));
    await userEvent.tab();
    expect(field()).toHaveFocus();
    await userEvent.keyboard('in');
    expect(getAllByRole('option').map((option) => option.textContent)).toEqual(['Berlin', 'Dublin', 'Edinburgh']);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(pills()).toEqual(['Dublin']);
    expect(field()).toHaveValue('');

    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(pills()).toEqual(['Dublin', 'Edinburgh']);
    await userEvent.keyboard('{Backspace}');
    expect(pills()).toEqual(['Dublin']);

    await userEvent.keyboard('{Escape}');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    await userEvent.tab();
    expect(getByText('After')).toHaveFocus();
  });

  test('a form gets every value under the name', async () => {
    const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const { getByRole } = render(() => (
      <SlopkitUi>
        <form onSubmit={onSubmit}>
          <MultiSelect label="Tags" name="tags" required data={['a', 'b', 'c']} defaultValue={['a', 'c']} />
          <button type="submit">Send</button>
        </form>
      </SlopkitUi>
    ));

    await userEvent.click(getByRole('button', { name: 'Send' }));
    expect(onSubmit).toHaveBeenCalled();
    const form = getByRole('button', { name: 'Send' }).closest('form')!;
    expect(new FormData(form).getAll('tags')).toEqual(['a', 'c']);
  });
});
