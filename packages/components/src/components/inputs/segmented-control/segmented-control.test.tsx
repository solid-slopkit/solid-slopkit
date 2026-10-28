import { render, fireEvent } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { SegmentedControl } from './segmented-control';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

const radios = (container: HTMLElement) => [...container.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
const checkedValue = (container: HTMLElement) => radios(container).find((input) => input.checked)?.value;

describe('<SegmentedControl />', () => {
  test('renders a radiogroup of labelled radios, selecting the first item by default', () => {
    const { getByRole, getAllByRole, container } = render(() => (
      <SegmentedControl aria-label="Framework" data={['React', 'Solid', 'Vue']} />
    ));
    flush();

    const group = getByRole('radiogroup', { name: 'Framework' });
    expect(group).toHaveAttribute('aria-orientation', 'horizontal');
    expect(group).toHaveAttribute('data-size', 'md');
    expect(getAllByRole('radio').map((radio) => radio.getAttribute('value'))).toEqual(['React', 'Solid', 'Vue']);
    expect(getByRole('radio', { name: 'Solid' })).toBeInTheDocument();
    expect(checkedValue(container)).toBe('React');

    const names = new Set(radios(container).map((input) => input.name));
    expect(names.size).toBe(1);
  });

  test('defaultValue skips to that item; without one, the first enabled item is selected', () => {
    const first = render(() => <SegmentedControl data={['a', 'b', 'c']} defaultValue="c" />);
    flush();
    expect(checkedValue(first.container)).toBe('c');

    const second = render(() => <SegmentedControl data={[{ value: 'a', label: 'A', disabled: true }, 'b', 'c']} />);
    flush();
    expect(checkedValue(second.container)).toBe('b');
  });

  test('uncontrolled: clicking an item selects it and calls onChange', () => {
    const onChange = vi.fn();
    const { getByLabelText, container } = render(() => <SegmentedControl data={['a', 'b']} onChange={onChange} />);
    flush();

    fireEvent.click(getByLabelText('b'));
    flush();

    expect(onChange).toHaveBeenCalledWith('b');
    expect(checkedValue(container)).toBe('b');
    expect(getByLabelText('b').closest('[data-active]')).not.toBeNull();
  });

  test('controlled: follows value, and a change the parent does not apply is undone', () => {
    const onChange = vi.fn();
    const [value, setValue] = createSignal('a');
    const { getByLabelText, container } = render(() => (
      <SegmentedControl data={['a', 'b', 'c']} value={value()} onChange={onChange} />
    ));
    flush();

    // The parent ignores the change.
    fireEvent.click(getByLabelText('b'));
    flush();
    expect(onChange).toHaveBeenCalledWith('b');
    expect(checkedValue(container)).toBe('a');

    setValue('c');
    flush();
    expect(checkedValue(container)).toBe('c');
    expect(getByLabelText('c').closest('[data-active]')).not.toBeNull();
  });

  test('controlled: a parent that applies the change selects the item', () => {
    const [value, setValue] = createSignal('a');
    const { getByLabelText, container } = render(() => (
      <SegmentedControl data={['a', 'b']} value={value()} onChange={setValue} />
    ));
    flush();

    fireEvent.click(getByLabelText('b'));
    flush();
    // oxlint-disable-next-line solid/reactivity -- the test reads the signal's current value on purpose
    expect(value()).toBe('b');
    expect(checkedValue(container)).toBe('b');
  });

  test('readOnly keeps the value and does not call onChange', () => {
    const onChange = vi.fn();
    const { getByLabelText, container } = render(() => <SegmentedControl data={['a', 'b']} readOnly onChange={onChange} />);
    flush();

    fireEvent.click(getByLabelText('b'));
    flush();
    expect(onChange).not.toHaveBeenCalled();
    expect(checkedValue(container)).toBe('a');
  });

  test('disabled disables every radio; a disabled item disables only its own', () => {
    const all = render(() => <SegmentedControl data={['a', 'b']} disabled />);
    flush();
    expect(radios(all.container).every((input) => input.disabled)).toBe(true);
    expect(all.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true');

    const one = render(() => <SegmentedControl data={['a', { value: 'b', label: 'B', disabled: true }]} />);
    flush();
    expect(radios(one.container).map((input) => input.disabled)).toEqual([false, true]);
  });

  test('submits the selected value under name', () => {
    const { container } = render(() => (
      <form>
        <SegmentedControl data={['a', 'b']} defaultValue="b" name="choice" />
      </form>
    ));
    flush();

    expect(new FormData(container.querySelector('form')!).get('choice')).toBe('b');
  });

  test('new data keeps an uncontrolled selection', () => {
    const [data, setData] = createSignal(['a', 'b']);
    const { getByLabelText, container } = render(() => <SegmentedControl data={data()} />);
    flush();

    fireEvent.click(getByLabelText('b'));
    flush();
    setData(['a', 'b', 'c']);
    flush();
    expect(checkedValue(container)).toBe('b');
  });

  test('selecting updates without diagnostics or waste', async () => {
    const { getByLabelText } = render(() => <SegmentedControl data={['a', 'b', 'c']} />);
    flush();

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.click(getByLabelText('c'));
      },
      { scenario: 'segmented-control-select' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2, { scope: /SegmentedControl/ });
  });

  test('an arrow key moves the selection without diagnostics or waste', async () => {
    const { getByLabelText } = render(() => <SegmentedControl data={['a', 'b', 'c']} />);
    flush();
    getByLabelText('a').focus();

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.keyDown(getByLabelText('a'), { key: 'ArrowRight' });
      },
      { scenario: 'segmented-control-arrow' },
    );

    expect(getByLabelText('b')).toBeChecked();
    expect(getByLabelText('b')).toHaveFocus();
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2, { scope: /SegmentedControl/ });
  });

  test('onKeyDown runs first, and preventDefault in it keeps the selection', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(() => (
      <SegmentedControl data={['a', 'b']} onChange={onChange} onKeyDown={(event) => event.preventDefault()} />
    ));
    getByLabelText('a').focus();

    fireEvent.keyDown(getByLabelText('a'), { key: 'ArrowRight' });
    flush();

    expect(getByLabelText('a')).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  test('marks its parts with namespaced slots', () => {
    const { container } = render(() => <SegmentedControl aria-label="View" data={['List', 'Grid']} />);
    flush();
    const slots = (name: string) => container.querySelectorAll(`[data-slot="segmented-control-${name}"]`);

    expect(slots('indicator')).toHaveLength(1);
    expect(slots('item')).toHaveLength(2);
    expect(slots('input')[0]).toHaveAttribute('type', 'radio');
    expect(slots('label')[1]).toHaveTextContent('Grid');
    expect(slots('item')[0]).toHaveAttribute('data-active', '');
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./segmented-control.fixtures.tsx', 'variants');
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <SegmentedControl aria-label="View" data={['List', 'Grid']} />
        <SegmentedControl aria-label="Size" data={['S', 'M', 'L']} orientation="vertical" color="primary" disabled />
      </>
    ));
    flush();

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
