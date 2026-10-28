import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Input } from '../input';
import { Fieldset } from './fieldset';

describe('<Fieldset /> in a browser', () => {
  test('the legend is a caption inside the box, above the fields, which are spaced in a column', () => {
    const { getByRole, getAllByRole } = render(() => (
      <Fieldset legend="Address" style={{ width: '300px' }}>
        <Input aria-label="Street" />
        <Input aria-label="City" />
      </Fieldset>
    ));
    const box = getByRole('group').getBoundingClientRect();
    const legend = getByRole('group').querySelector('legend')!.getBoundingClientRect();
    const [street, city] = getAllByRole('textbox').map((control) => control.closest('.slp-input')!.getBoundingClientRect());

    expect(legend.top).toBeGreaterThan(box.top + 1);
    expect(legend.width).toBe(street.width);
    expect(street.top).toBeGreaterThanOrEqual(legend.bottom + 16);
    expect(city.top).toBe(street.bottom + 16);
  });

  test('a disabled fieldset greys out the Inputs inside like their own disabled', () => {
    const { getAllByRole } = render(() => (
      <>
        <Fieldset legend="Locked" disabled>
          <Input aria-label="By the fieldset" />
        </Fieldset>
        <Input aria-label="By itself" disabled />
      </>
    ));
    const [inside, own] = getAllByRole('textbox').map((control) => getComputedStyle(control.closest('.slp-input')!));

    expect(inside.backgroundColor).toBe(own.backgroundColor);
    expect(inside.cursor).toBe('not-allowed');
  });

  test('ghost has no box', () => {
    const { getByRole } = render(() => (
      <Fieldset legend="Plain" variant="ghost">
        <Input aria-label="Street" />
      </Fieldset>
    ));
    const css = getComputedStyle(getByRole('group'));

    expect([css.paddingTop, css.borderTopWidth, css.backgroundColor]).toEqual(['0px', '0px', 'rgba(0, 0, 0, 0)']);
  });
});
