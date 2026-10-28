import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../components/provider';
import { getTimeRange } from '../time';
import { TimeGrid } from './time-grid';

describe('<TimeGrid /> in a browser', () => {
  test('arrows move across and between rows, skipping disabled times; Enter chooses', async () => {
    const values: (string | null)[] = [];
    const { getByRole } = render(() => (
      <SlopkitUi>
        <button type="button">Before</button>
        <TimeGrid
          aria-label="Slots"
          format="24h"
          data={getTimeRange({ start: '09:00', end: '11:30', interval: 30 })}
          disableTime={['10:30']}
          onChange={(value) => values.push(value)}
        />
        <button type="button">After</button>
      </SlopkitUi>
    ));
    const time = (name: string) => getByRole('button', { name });

    await userEvent.click(getByRole('button', { name: 'Before' }));
    await userEvent.tab();
    expect(time('09:00')).toHaveFocus();
    // 09:00 09:30 10:00 / 10:30 11:00 11:30, with 10:30 disabled.
    await userEvent.keyboard('{ArrowDown}');
    expect(time('09:00')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    expect(time('11:00')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(time('11:30')).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(time('10:00')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(time('09:00')).toHaveFocus();
    await userEvent.keyboard('{End}{Enter}');
    expect(values).toEqual(['11:30']);
    expect(time('11:30')).toHaveAttribute('aria-pressed', 'true');
    await userEvent.tab();
    expect(getByRole('button', { name: 'After' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(time('11:30')).toHaveFocus();
  });

  test('the chosen time is filled; columns lay the times out', async () => {
    const { getByRole } = render(() => (
      <SlopkitUi>
        <div style={{ width: '300px' }}>
          <TimeGrid aria-label="Slots" format="24h" columns={2} data={['09:00', '10:00', '11:00']} defaultValue="10:00" />
        </div>
      </SlopkitUi>
    ));
    const [first, second, third] = ['09:00', '10:00', '11:00'].map((name) => getByRole('button', { name }));
    expect(first.getBoundingClientRect().top).toBe(second.getBoundingClientRect().top);
    expect(third.getBoundingClientRect().top).toBeGreaterThan(first.getBoundingClientRect().top);
    await expect.poll(() => getComputedStyle(second).backgroundColor).not.toBe(getComputedStyle(first).backgroundColor);
  });
});
