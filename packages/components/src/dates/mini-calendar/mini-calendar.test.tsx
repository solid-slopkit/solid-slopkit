import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../test/diagnostics';
import { SlopkitUi } from '../../components/provider';
import { createDay } from '../date';
import { MiniCalendar, type MiniCalendarProps } from './mini-calendar';

// Monday, October 12, 2026.
const october12 = createDay(2026, 9, 12);

// Intl puts thin spaces around the dash of a range.
const range = (text: string) => text.replace(' – ', '\u2009–\u2009');

function setup(props: Partial<MiniCalendarProps> = {}, locale = 'en-US') {
  const result = render(() => (
    <SlopkitUi locale={locale}>
      <MiniCalendar defaultDate={october12} {...props} />
    </SlopkitUi>
  ));
  flush();
  const root = () => result.container.querySelector<HTMLElement>('.slp-mini-calendar')!;
  const list = () => result.getByRole('listbox');
  const days = () => result.getAllByRole('option').map((day) => day.getAttribute('aria-label'));
  const day = (name: string) => result.getByRole('option', { name });
  const tabbable = () => [...list().querySelectorAll('[tabindex="0"]')].map((option) => option.getAttribute('aria-label'));
  const click = (element: Element) => {
    fireEvent.click(element);
    flush();
  };
  const press = (key: string) => {
    fireEvent.keyDown(document.activeElement!, { key });
    flush();
  };
  return { ...result, root, list, days, day, tabbable, click, press };
}

describe('<MiniCalendar />', () => {
  test('a listbox of seven days named after them, between previous and next', () => {
    const { root, list, days, day, getByRole } = setup({ class: 'mine' });

    expect(root()).toHaveClass('slp-mini-calendar', 'mine');
    expect(list()).toHaveAccessibleName(range('October 12 – 18, 2026'));
    expect(list()).toHaveAttribute('aria-orientation', 'horizontal');
    expect(days()).toHaveLength(7);
    expect(days()[0]).toBe('Monday, October 12, 2026');
    expect(day('Monday, October 12, 2026')).toHaveTextContent('Mon12');
    expect(day('Monday, October 12, 2026')).toHaveAttribute('aria-selected', 'false');
    expect(getByRole('button', { name: 'Previous days' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Next days' })).toBeInTheDocument();
    expect(root().querySelector('[data-slot="mini-calendar-range"]')).toHaveAttribute('aria-live', 'polite');
  });

  test('numberOfDays and the locale', () => {
    const { days, list, day } = setup({ numberOfDays: 3 }, 'de-DE');

    expect(days()).toEqual(['Montag, 12. Oktober 2026', 'Dienstag, 13. Oktober 2026', 'Mittwoch, 14. Oktober 2026']);
    expect(list()).toHaveAccessibleName('12.–14. Oktober 2026');
    expect(day('Montag, 12. Oktober 2026')).toHaveTextContent('Mo12');
  });

  test('a click chooses a day', () => {
    const onChange = vi.fn();
    const { day, click } = setup({ onChange });

    click(day('Wednesday, October 14, 2026'));
    expect(onChange).toHaveBeenCalledWith(createDay(2026, 9, 14));
    expect(day('Wednesday, October 14, 2026')).toHaveAttribute('aria-selected', 'true');
    expect(day('Wednesday, October 14, 2026')).toHaveAttribute('data-selected', '');
    // Choosing it again changes nothing.
    click(day('Wednesday, October 14, 2026'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  test('a controlled value shows what the app says; it opens on the value without a date', () => {
    const [value, setValue] = createSignal<Date | null>(createDay(2026, 9, 20));
    const onChange = vi.fn();
    const { day, click, list } = setup({
      defaultDate: undefined,
      get value() {
        return value();
      },
      onChange,
    });

    expect(list()).toHaveAccessibleName(range('October 20 – 26, 2026'));
    click(day('Wednesday, October 21, 2026'));
    expect(onChange).toHaveBeenCalledWith(createDay(2026, 9, 21));
    expect(day('Tuesday, October 20, 2026')).toHaveAttribute('aria-selected', 'true');
    setValue(null);
    flush();
    expect(day('Tuesday, October 20, 2026')).toHaveAttribute('aria-selected', 'false');
  });

  test('previous and next move the strip by its length', () => {
    const onDateChange = vi.fn();
    const { getByRole, click, list } = setup({ onDateChange });

    click(getByRole('button', { name: 'Next days' }));
    expect(list()).toHaveAccessibleName(range('October 19 – 25, 2026'));
    expect(onDateChange).toHaveBeenLastCalledWith(createDay(2026, 9, 19));
    click(getByRole('button', { name: 'Previous days' }));
    click(getByRole('button', { name: 'Previous days' }));
    expect(list()).toHaveAccessibleName(range('October 5 – 11, 2026'));
  });

  test('a controlled date', () => {
    const [date, setDate] = createSignal(october12);
    const onDateChange = vi.fn();
    const { getByRole, click, list } = setup({
      get date() {
        return date();
      },
      onDateChange,
    });

    click(getByRole('button', { name: 'Next days' }));
    expect(onDateChange).toHaveBeenCalledWith(createDay(2026, 9, 19));
    expect(list()).toHaveAccessibleName(range('October 12 – 18, 2026'));
    setDate(createDay(2026, 11, 30));
    flush();
    expect(list()).toHaveAccessibleName(range('December 30, 2026 – January 5, 2027'));
  });

  test('minDate, maxDate and excludeDate disable days; previous and next stop at them', () => {
    const { day, getByRole, click, list } = setup({
      minDate: createDay(2026, 9, 13),
      maxDate: createDay(2026, 9, 24),
      excludeDate: (date) => date.getDay() === 0,
    });

    expect(day('Monday, October 12, 2026')).toBeDisabled();
    expect(day('Tuesday, October 13, 2026')).toBeEnabled();
    expect(day('Sunday, October 18, 2026')).toBeDisabled();
    const previous = getByRole('button', { name: 'Previous days' });
    expect(previous).toHaveAttribute('aria-disabled', 'true');
    click(previous);
    expect(list()).toHaveAccessibleName(range('October 12 – 18, 2026'));
    const next = getByRole('button', { name: 'Next days' });
    click(next);
    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(day('Sunday, October 25, 2026')).toBeDisabled();
  });

  test('marks today once hydrated', () => {
    const { container } = setup({ defaultDate: undefined });
    const today = container.querySelector('[aria-current="date"]');

    expect(today).toHaveAttribute('data-today', '');
    expect(today).toHaveAttribute('aria-label', new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(new Date()));
  });

  test('previousLabel and nextLabel rename the controls', () => {
    const { getByRole } = setup({ previousLabel: 'Früher', nextLabel: 'Später' });
    expect(getByRole('button', { name: 'Früher' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Später' })).toBeInTheDocument();
  });
});

describe('<MiniCalendar />: keyboard', () => {
  test('one day takes Tab: the chosen one, else today, else the first enabled day', () => {
    expect(setup({ defaultValue: createDay(2026, 9, 15) }).tabbable()).toEqual(['Thursday, October 15, 2026']);
    // A week without today.
    expect(setup({ defaultDate: createDay(2031, 2, 3), minDate: createDay(2031, 2, 5) }).tabbable()).toEqual([
      'Wednesday, March 5, 2031',
    ]);
  });

  test('arrows move the focus, past the ends of the strip; Home and End to its first and last day', () => {
    const { day, press, list, tabbable } = setup();

    day('Monday, October 12, 2026').focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(day('Tuesday, October 13, 2026'));
    expect(tabbable()).toEqual(['Tuesday, October 13, 2026']);
    press('ArrowLeft');
    press('ArrowLeft');
    expect(list()).toHaveAccessibleName(range('October 5 – 11, 2026'));
    expect(document.activeElement).toBe(day('Sunday, October 11, 2026'));
    press('Home');
    expect(document.activeElement).toBe(day('Monday, October 5, 2026'));
    press('End');
    expect(document.activeElement).toBe(day('Sunday, October 11, 2026'));
    press('PageDown');
    expect(list()).toHaveAccessibleName(range('October 12 – 18, 2026'));
    expect(document.activeElement).toBe(day('Sunday, October 18, 2026'));
  });

  test('arrows skip disabled days and stop at the limits', () => {
    const { day, press } = setup({ maxDate: createDay(2026, 9, 16), excludeDate: (date) => date.getDate() === 14 });

    day('Tuesday, October 13, 2026').focus();
    press('ArrowRight');
    expect(document.activeElement).toBe(day('Thursday, October 15, 2026'));
    press('ArrowRight');
    press('ArrowRight');
    expect(document.activeElement).toBe(day('Friday, October 16, 2026'));
  });

  test('a move re-runs only the two days it touches; so does a choice', async () => {
    const { day, tabbable } = setup();
    day('Wednesday, October 14, 2026').focus();
    flush();

    const { artifact: move } = await captureArtifact(
      () => {
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
        flush();
      },
      { scenario: 'mini-calendar-arrow' },
    );
    expect(tabbable()).toEqual(['Thursday, October 15, 2026']);
    expect(move).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(move).toHaveNoWaste();
    expect(move).toStayWithinRerunBudget(6);

    const { artifact: choice } = await captureArtifact(
      () => {
        fireEvent.click(day('Thursday, October 15, 2026'));
        flush();
      },
      { scenario: 'mini-calendar-choose' },
    );
    expect(day('Thursday, October 15, 2026')).toHaveAttribute('aria-selected', 'true');
    expect(choice).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(choice).toHaveNoWaste();
    expect(choice).toStayWithinRerunBudget(4);
  });
});

describe('<MiniCalendar />: accessibility and SSR', () => {
  test.each([
    ['plain', {}],
    ['chosen and limited', { defaultValue: createDay(2026, 9, 14), minDate: createDay(2026, 9, 13) }],
  ])('has no axe violations: %s', async (_, props) => {
    const { container } = setup(props);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test.each(['week', 'limited'])('hydrates the server render: %s', async (name) => {
    await expectHydration('./mini-calendar.fixtures.tsx', name);
  });
});
