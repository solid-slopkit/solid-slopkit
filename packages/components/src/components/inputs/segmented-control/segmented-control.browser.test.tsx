import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { createSignal } from 'solid-js';
import { describe, expect, test, vi } from 'vitest';
import { SegmentedControl } from './segmented-control';

// Rounded, since offsets are whole pixels and bounding rects are not.
const box = (el: Element) => {
  const { left, top, width, height } = el.getBoundingClientRect();
  return { left: Math.round(left), top: Math.round(top), width: Math.round(width), height: Math.round(height) };
};

describe('<SegmentedControl /> in a browser', () => {
  test('the indicator covers the selected item, and follows a click', async () => {
    const { getByRole, getByText } = render(() => (
      <SegmentedControl aria-label="Framework" data={['React', 'Solid', 'Svelte']} transitionDuration={0} />
    ));
    const group = getByRole('radiogroup');
    const indicator = group.querySelector('[data-slot="segmented-control-indicator"]')!;
    const item = (label: string) => getByText(label).closest('[data-slot="segmented-control-item"]')!;

    await expect.poll(() => box(indicator)).toEqual(box(item('React')));

    await userEvent.click(getByText('Svelte'));

    await expect.poll(() => box(indicator)).toEqual(box(item('Svelte')));
    expect(box(item('Svelte')).left).toBeGreaterThan(box(item('React')).left);
  });

  test('mounted hidden, the indicator appears over the selected item once shown, without sliding from the first', async () => {
    const [shown, setShown] = createSignal(false);
    const { getByRole, getByText } = render(() => (
      <div style={{ display: shown() ? 'block' : 'none' }}>
        <SegmentedControl aria-label="Framework" data={['React', 'Solid', 'Svelte']} defaultValue="Svelte" />
      </div>
    ));
    const group = getByRole('radiogroup', { hidden: true });
    const indicator = group.querySelector('[data-slot="segmented-control-indicator"]')!;
    const item = getByText('Svelte').closest('[data-slot="segmented-control-item"]')!;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(group).not.toHaveAttribute('data-ready');

    setShown(true);

    // The default 200 ms transition would still be under way: the first placement must not animate.
    await expect.poll(() => group.hasAttribute('data-ready')).toBe(true);
    expect(box(indicator)).toEqual(box(item));
  });

  test('Tab reaches the selected item, and arrow keys move the selection past disabled items', async () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(() => (
      <SegmentedControl
        aria-label="Framework"
        data={['React', { value: 'Vue', label: 'Vue', disabled: true }, 'Solid']}
        defaultValue="React"
        onChange={onChange}
        transitionDuration={0}
      />
    ));

    await userEvent.tab();
    expect(getByLabelText('React')).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    expect(getByLabelText('Solid')).toHaveFocus();
    expect(getByLabelText('Solid')).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('Solid');

    await userEvent.keyboard('{ArrowLeft}');
    expect(getByLabelText('React')).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('React');
  });

  test('both arrow axes move it, and it wraps around the ends', async () => {
    const { getByLabelText } = render(() => (
      <SegmentedControl aria-label="Framework" data={['React', 'Solid', 'Svelte']} transitionDuration={0} />
    ));

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect(getByLabelText('Solid')).toBeChecked();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(getByLabelText('Svelte')).toBeChecked();
    expect(getByLabelText('Svelte')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(getByLabelText('React')).toBeChecked();
  });

  test('Home and End select the first and last enabled items', async () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(() => (
      <SegmentedControl
        aria-label="Framework"
        data={[{ value: 'React', label: 'React', disabled: true }, 'Solid', 'Svelte', 'Vue']}
        defaultValue="Svelte"
        onChange={onChange}
        transitionDuration={0}
      />
    ));

    await userEvent.tab();
    await userEvent.keyboard('{End}');
    expect(getByLabelText('Vue')).toBeChecked();
    expect(getByLabelText('Vue')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(getByLabelText('Solid')).toBeChecked();
    expect(onChange.mock.calls.map(([value]) => value)).toEqual(['Vue', 'Solid']);
  });

  test('a handled key does not scroll the page', async () => {
    const { getByLabelText } = render(() => (
      <div style={{ height: '300vh' }}>
        <SegmentedControl aria-label="Framework" data={['React', 'Solid']} transitionDuration={0} />
      </div>
    ));

    await userEvent.tab();
    await userEvent.keyboard('{End}{ArrowDown}');

    expect(getByLabelText('React')).toBeChecked();
    expect(window.scrollY).toBe(0);
  });

  test('read-only: arrow keys move focus but the selection stays', async () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(() => (
      <SegmentedControl aria-label="Framework" data={['React', 'Solid']} readOnly onChange={onChange} transitionDuration={0} />
    ));

    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');

    expect(getByLabelText('Solid')).toHaveFocus();
    expect(getByLabelText('React')).toBeChecked();
    expect(getByLabelText('Solid')).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });
});
