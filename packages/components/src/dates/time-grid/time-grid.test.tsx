import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../test/diagnostics';
import { SlopkitUi } from '../../components/provider';
import { getTimeRange } from '../time';
import { TimeGrid, type TimeGridProps } from './time-grid';

const SLOTS = getTimeRange({ start: '09:00', end: '11:30', interval: 30 });

function setup(props: Partial<TimeGridProps> = {}, locale?: string) {
  const onChange = vi.fn();
  const result = render(() => (
    <SlopkitUi locale={locale}>
      <TimeGrid aria-label="Slots" data={SLOTS} onChange={onChange} {...props} />
    </SlopkitUi>
  ));
  flush();
  const time = (name: string) => result.getByRole('button', { name });
  const click = (name: string) => {
    fireEvent.click(time(name));
    flush();
  };
  const shown = () => result.getAllByRole('button').map((button) => button.textContent);
  const pressed = () =>
    result
      .getAllByRole('button')
      .filter((button) => button.getAttribute('aria-pressed') === 'true')
      .map((button) => button.textContent);
  return { ...result, time, click, shown, pressed, onChange };
}

describe('<TimeGrid />', () => {
  test('a labelled group of times written by the locale, three to a row', () => {
    const { getByRole, shown, container } = setup({ class: 'mine' });

    const grid = getByRole('group', { name: 'Slots' });
    expect(grid).toHaveClass('slp-time-grid', 'mine');
    expect(grid.style.getPropertyValue('--_time-grid-columns')).toBe('3');
    expect(shown()).toEqual(['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']);
    expect(container.querySelector('[data-time="09:30"]')).toHaveTextContent('9:30 AM');
  });

  test('format, withSeconds and the locale', () => {
    expect(setup({ data: ['21:05'], format: '24h' }).shown()).toEqual(['21:05']);
    expect(setup({ data: ['21:05:09'], withSeconds: true, format: '12h' }).shown()).toEqual(['9:05:09 PM']);
    expect(setup({ data: ['21:05'] }, 'de-DE').shown()).toEqual(['21:05']);
  });

  test('a click chooses a time; the chosen one is pressed', () => {
    const { click, pressed, onChange } = setup();
    click('10:00 AM');
    expect(onChange).toHaveBeenLastCalledWith('10:00');
    expect(pressed()).toEqual(['10:00 AM']);
    click('10:00 AM');
    expect(onChange).toHaveBeenCalledTimes(1);
    click('11:30 AM');
    expect(pressed()).toEqual(['11:30 AM']);
  });

  test('allowDeselect lets a click on the chosen time clear it', () => {
    const { click, pressed, onChange } = setup({ defaultValue: '10:00', allowDeselect: true });
    click('10:00 AM');
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(pressed()).toEqual([]);
  });

  test('controlled, compared as times: 10:00:00 is 10:00', () => {
    const [value, setValue] = createSignal<string | null>('10:00:00');
    const { click, pressed, onChange } = setup({
      get value() {
        return value();
      },
    });
    expect(pressed()).toEqual(['10:00 AM']);
    click('9:00 AM');
    expect(onChange).toHaveBeenLastCalledWith('09:00');
    expect(pressed()).toEqual(['10:00 AM']);
    setValue('11:00');
    flush();
    expect(pressed()).toEqual(['11:00 AM']);
  });

  test('minTime, maxTime, disableTime and disabled disable times', () => {
    const { time, click, onChange } = setup({ minTime: '09:30', maxTime: '11:00', disableTime: ['10:30'] });
    expect(time('9:00 AM')).toBeDisabled();
    expect(time('9:30 AM')).not.toBeDisabled();
    expect(time('10:30 AM')).toBeDisabled();
    expect(time('11:30 AM')).toBeDisabled();
    expect(time('10:30 AM')).toHaveAttribute('data-disabled');
    click('10:30 AM');
    expect(onChange).not.toHaveBeenCalled();

    const tested = setup({ disableTime: (value) => value.endsWith(':30') });
    expect(tested.getAllByRole('button').filter((button) => (button as HTMLButtonElement).disabled)).toHaveLength(3);
    const all = setup({ disabled: true });
    expect(all.getAllByRole('button').every((button) => (button as HTMLButtonElement).disabled)).toBe(true);
  });

  test('a ref gets the group, and the arrow keys still move between times', () => {
    let ref: HTMLDivElement | undefined;
    const { getByRole, time } = setup({ ref: (element: HTMLDivElement) => (ref = element), format: '24h' });

    expect(ref).toBe(getByRole('group', { name: 'Slots' }));
    time('09:00').focus();
    fireEvent.keyDown(time('09:00'), { key: 'ArrowRight' });
    expect(time('09:30')).toHaveFocus();
  });

  test('one tab stop: the chosen time, else the first enabled one', () => {
    const tabStops = (result: ReturnType<typeof setup>) =>
      result
        .getAllByRole('button')
        .filter((button) => button.tabIndex === 0)
        .map((button) => button.textContent);
    expect(tabStops(setup({ minTime: '09:30' }))).toEqual(['9:30 AM']);
    expect(tabStops(setup({ defaultValue: '11:00' }))).toEqual(['11:00 AM']);
  });

  test('a choice has no diagnostics and re-runs only the times it changes', async () => {
    const { click, time } = setup({ defaultValue: '09:00' });
    time('9:00 AM').focus();
    flush();
    const { artifact } = await captureArtifact(() => click('11:00 AM'), { scenario: 'time-grid-choose' });
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(10);
  });

  test('has no axe violations', async () => {
    const { container } = setup({ defaultValue: '10:00', disableTime: ['10:30'] });
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test.each(['grids', 'german'])('hydrates the server render: %s', async (name) => {
    await expectHydration('./time-grid.fixtures.tsx', name);
  });
});
