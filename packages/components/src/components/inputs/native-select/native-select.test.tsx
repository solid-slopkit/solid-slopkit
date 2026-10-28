import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { NativeSelect } from './native-select';

const options = (select: HTMLElement) =>
  Array.from(select.querySelectorAll('option')).map((option) => [option.value, option.textContent, option.disabled]);

describe('<NativeSelect />', () => {
  test('a labelled select in an Input box, with options from data and a hidden chevron', () => {
    const { getByRole, container } = render(() => (
      <NativeSelect label="Framework" data={['Solid', { value: 'vue', label: 'Vue', disabled: true }]} name="fw" class="mine" />
    ));
    const select = getByRole('combobox', { name: 'Framework' });
    const chevron = container.querySelector('[data-slot="native-select-chevron"]')!;

    expect(select.tagName).toBe('SELECT');
    expect(select).toHaveAttribute('name', 'fw');
    expect(options(select)).toEqual([
      ['Solid', 'Solid', false],
      ['vue', 'Vue', true],
    ]);
    expect(chevron).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstElementChild).toHaveClass('slp-native-select', 'slp-input-wrapper', 'mine');
  });

  test('groups become optgroups', () => {
    const { getByRole } = render(() => (
      <NativeSelect label="Country" data={[{ group: 'Europe', items: ['France', 'Germany'] }, 'Elsewhere']} />
    ));
    const select = getByRole('combobox');
    const group = select.querySelector('optgroup')!;

    expect(group).toHaveAttribute('label', 'Europe');
    expect(group.querySelectorAll('option')).toHaveLength(2);
    expect(select.lastElementChild).toHaveTextContent('Elsewhere');
  });

  test('placeholder is a first, disabled option with an empty value', () => {
    const { getByRole } = render(() => <NativeSelect label="Country" placeholder="Pick one" value="" data={['France']} />);
    const select = getByRole('combobox') as HTMLSelectElement;

    expect(options(select)[0]).toEqual(['', 'Pick one', true]);
    expect(select.value).toBe('');
  });

  test('without data, children are the options', () => {
    const { getByRole } = render(() => (
      <NativeSelect label="Size">
        <option value="s">Small</option>
        <option value="m">Medium</option>
      </NativeSelect>
    ));

    expect(options(getByRole('combobox'))).toEqual([
      ['s', 'Small', false],
      ['m', 'Medium', false],
    ]);
  });

  test('controlled with value and onChange', () => {
    const [value, setValue] = createSignal('b');
    const onChange = vi.fn((event: Event) => setValue((event.currentTarget as HTMLSelectElement).value));
    const { getByRole } = render(() => (
      <NativeSelect label="Letter" data={['a', 'b', 'c']} value={value()} onChange={onChange} />
    ));
    const select = getByRole('combobox') as HTMLSelectElement;

    expect(select.value).toBe('b');
    fireEvent.change(select, { target: { value: 'c' } });
    flush();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(select.value).toBe('c');
  });

  test('new data updates the options without diagnostics or waste', async () => {
    const [data, setData] = createSignal(['a', 'b'], { name: 'data' });
    const { getByRole } = render(() => <NativeSelect label="Letter" data={data()} />);
    flush();

    const { artifact } = await captureArtifact(() => setData(['a', 'b', 'c']), { scenario: 'native-select-data' });

    expect(getByRole('combobox').querySelectorAll('option')).toHaveLength(3);
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(3);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <NativeSelect label="Framework" data={['Solid', 'Svelte']} />
        <NativeSelect label="Country" placeholder="Pick one" value="" data={[{ group: 'Europe', items: ['France'] }]} />
        <NativeSelect label="Size" variant="soft" disabled error="Pick a size.">
          <option value="s">Small</option>
        </NativeSelect>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./native-select.fixtures.tsx', 'nativeSelects');
  });
});
