import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../components/provider';
import { TimePicker, type TimePickerProps } from './time-picker';

function setup(props: Partial<TimePickerProps> = {}) {
  const values: string[] = [];
  const result = render(() => (
    <SlopkitUi>
      <div style={{ padding: '20px', width: '280px' }}>
        <button type="button">Before</button>
        <TimePicker label="Time" onChange={(value) => values.push(value)} {...props} />
        <button type="button">After</button>
      </div>
    </SlopkitUi>
  ));
  const segment = (name: string) => result.getByRole('spinbutton', { name });
  return { ...result, segment, values };
}

describe('<TimePicker /> in a browser', () => {
  test('typed keys fill the parts and move on; Tab goes through them', async () => {
    const { segment, values, getByRole } = setup();

    await userEvent.click(getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    expect(segment('Hours')).toHaveFocus();
    await userEvent.keyboard('0');
    expect(segment('Hours')).toHaveFocus();
    await userEvent.keyboard('9');
    expect(segment('Minutes')).toHaveFocus();
    await userEvent.keyboard('45');
    expect(segment('AM/PM')).toHaveFocus();
    await userEvent.keyboard('p');
    expect(values.at(-1)).toBe('21:45');
    await userEvent.tab();
    expect(getByRole('button', { name: 'After' })).toHaveFocus();
  });

  test('Left and Right move between parts; Backspace clears one, then goes back', async () => {
    const { segment, values } = setup({ defaultValue: '14:05', format: '24h' });

    await userEvent.click(segment('Minutes'));
    await userEvent.keyboard('{ArrowLeft}');
    expect(segment('Hours')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{Backspace}');
    expect(segment('Minutes')).toHaveValue('--');
    expect(values.at(-1)).toBe('');
    await userEvent.keyboard('{Backspace}');
    expect(segment('Hours')).toHaveFocus();
  });

  test('a click on the label goes to the hours; a click on the box to the first empty part', async () => {
    const { segment, getByText, container } = setup({ format: '24h' });

    await userEvent.click(getByText('Time'));
    expect(segment('Hours')).toHaveFocus();
    await userEvent.keyboard('10');
    const box = container.querySelector<HTMLElement>('.slp-input')!;
    await userEvent.click(box, { position: { x: box.clientWidth - 8, y: box.clientHeight / 2 } });
    expect(segment('Minutes')).toHaveFocus();
  });

  test('every segment fits its text, with border-box sizing and longer day period names', async () => {
    const sizing = document.createElement('style');
    sizing.textContent = '*, *::before, *::after { box-sizing: border-box; }';
    document.head.append(sizing);
    try {
      const { getAllByRole } = render(() => (
        <SlopkitUi locale="ko-KR">
          <TimePicker label="Time" format="12h" withSeconds defaultValue="23:58:59" />
        </SlopkitUi>
      ));
      const inputs = getAllByRole('spinbutton') as HTMLInputElement[];
      for (const input of inputs) expect(input.scrollWidth, input.value).toBeLessThanOrEqual(input.clientWidth);
      // …and no wider than its longest name.
      const period = inputs.at(-1)!;
      expect(period.clientWidth).toBeLessThan(period.scrollWidth + 12);
    } finally {
      sizing.remove();
    }
  });

  test('withDropdown opens columns under the field; an option keeps the focus in the field', async () => {
    const { segment, values, getByRole, container } = setup({ withDropdown: true, defaultValue: '09:30', format: '24h' });

    await userEvent.click(segment('Hours'));
    const dropdown = document.querySelector<HTMLElement>('[data-slot="time-picker-dropdown"]')!;
    expect(dropdown.matches(':popover-open')).toBe(true);
    const box = container.querySelector('.slp-input')!.getBoundingClientRect();
    await expect.poll(() => Math.round(dropdown.getBoundingClientRect().top - box.bottom)).toBe(4);
    // The chosen hour is scrolled into its column.
    const hours = getByRole('listbox', { name: 'Hours' });
    const chosen = hours.querySelector<HTMLElement>('[aria-selected="true"]')!;
    expect(chosen.offsetTop).toBeGreaterThanOrEqual(hours.scrollTop);
    expect(chosen.offsetTop + chosen.offsetHeight).toBeLessThanOrEqual(hours.scrollTop + hours.clientHeight);

    await userEvent.click(getByRole('listbox', { name: 'Minutes' }).querySelector('button:nth-child(46)')!);
    expect(values.at(-1)).toBe('09:45');
    expect(segment('Hours')).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => document.querySelector('[data-slot="time-picker-dropdown"]')).toBeNull();
  });
});
