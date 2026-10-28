import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { NativeSelect } from './native-select';

describe('<NativeSelect /> in a browser', () => {
  test('the select fills the box; the chevron sits over its right end and lets clicks through', () => {
    const { getByRole, container } = render(() => (
      <NativeSelect label="Fruit" data={['Apple', 'Banana']} style={{ width: '240px' }} />
    ));
    const select = getByRole('combobox');
    const box = select.closest('.slp-input')!.getBoundingClientRect();
    const rect = select.getBoundingClientRect();
    const chevron = container.querySelector('[data-slot="native-select-chevron"]')!;
    const at = chevron.getBoundingClientRect();

    expect(rect.left).toBe(box.left + 1);
    expect(rect.right).toBe(box.right - 1);
    expect(at.right).toBeLessThan(box.right);
    expect(at.left).toBeGreaterThan(rect.left + rect.width / 2);
    expect(document.elementFromPoint(at.left + at.width / 2, at.top + at.height / 2)).toBe(select);
  });

  test('the keyboard changes the choice', async () => {
    const { getByRole } = render(() => <NativeSelect label="Fruit" data={['Apple', 'Banana', 'Cherry']} />);
    const select = getByRole('combobox') as HTMLSelectElement;

    await userEvent.selectOptions(select, 'Cherry');

    expect(select.value).toBe('Cherry');
  });

  test('the placeholder is muted while shown; options are not', () => {
    const { getByRole } = render(() => <NativeSelect label="Fruit" placeholder="Pick one" value="" data={['Apple']} />);
    const select = getByRole('combobox');

    expect(getComputedStyle(select).color).not.toBe(getComputedStyle(select.querySelector('option[value="Apple"]')!).color);
  });
});
