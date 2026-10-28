import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Autocomplete } from './autocomplete';

const cities = ['Amsterdam', 'Antwerp', 'Athens', 'Berlin', 'Bern', 'Bratislava'];

function setup() {
  const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());
  const onOptionSubmit = vi.fn();
  const result = render(() => (
    <SlopkitUi>
      <form onSubmit={onSubmit} style={{ padding: '20px', width: '280px' }}>
        <Autocomplete label="City" name="city" data={cities} onOptionSubmit={onOptionSubmit} />
        <button type="submit">Send</button>
      </form>
    </SlopkitUi>
  ));
  const field = () => result.getByRole('combobox', { name: 'City' }) as HTMLInputElement;
  return { ...result, field, onSubmit, onOptionSubmit };
}

describe('<Autocomplete /> in a browser', () => {
  test('typing opens the matches under the field; a click on one fills it in and keeps focus', async () => {
    const { field, getByRole, getAllByRole, onOptionSubmit } = setup();

    await userEvent.click(field());
    await userEvent.keyboard('ber');
    expect(getAllByRole('option').map((option) => option.textContent)).toEqual(['Berlin', 'Bern']);
    const dropdown = document.querySelector('.slp-combobox')!;
    expect(Math.round(dropdown.getBoundingClientRect().width)).toBe(
      Math.round(field().parentElement!.getBoundingClientRect().width),
    );

    await userEvent.click(getByRole('option', { name: 'Bern' }));
    expect(field()).toHaveValue('Bern');
    expect(field()).toHaveFocus();
    expect(onOptionSubmit).toHaveBeenCalledWith('Bern');
  });

  test('Enter with no active suggestion submits the form with the typed text', async () => {
    const { field, onSubmit } = setup();

    await userEvent.click(field());
    await userEvent.keyboard('Ath{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(new FormData(field().form!).get('city')).toBe('Ath');
  });

  test('Enter on an active suggestion fills it in without submitting', async () => {
    const { field, onSubmit } = setup();

    await userEvent.click(field());
    await userEvent.keyboard('an{ArrowDown}{ArrowDown}{Enter}');
    expect(field()).toHaveValue('Antwerp');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('Escape closes it and keeps the text', async () => {
    const { field } = setup();

    await userEvent.click(field());
    await userEvent.keyboard('br{Escape}');
    expect(field()).toHaveAttribute('aria-expanded', 'false');
    expect(field()).toHaveValue('br');
  });
});
