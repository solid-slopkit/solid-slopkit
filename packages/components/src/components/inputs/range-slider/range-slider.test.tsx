import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { SlopkitUi } from '../../provider';
import { RangeSlider, type RangeSliderValue } from './range-slider';

const renderIn = (ui: () => JSX.Element) => render(() => <SlopkitUi>{ui()}</SlopkitUi>);
const key = (el: HTMLElement, key: string) => {
  fireEvent.keyDown(el, { key });
  flush();
};
const now = (thumb: HTMLElement) => Number(thumb.getAttribute('aria-valuenow'));

describe('<RangeSlider />', () => {
  test('two named thumbs in a group named by the label, with the bar between them', () => {
    const { getByRole, container } = renderIn(() => <RangeSlider label="Price" defaultValue={[20, 80]} class="mine" />);
    const low = getByRole('slider', { name: 'Minimum' });
    const high = getByRole('slider', { name: 'Maximum' });

    expect(getByRole('group', { name: 'Price' })).toContainElement(low);
    expect([now(low), now(high)]).toEqual([20, 80]);
    const bar = container.querySelector<HTMLElement>('[data-slot="slider-bar"]')!;
    expect([bar.style.insetInlineStart, bar.style.width]).toEqual(['20%', '60%']);
    expect(container.querySelector('.slp-range-slider')).toHaveClass('slp-input-wrapper', 'mine');
  });

  test('the thumbs stop at each other, minRange apart', () => {
    const onChange = vi.fn();
    const { getByRole } = renderIn(() => (
      <RangeSlider label="Hours" min={0} max={24} defaultValue={[9, 11]} minRange={1} onChange={onChange} />
    ));
    const low = getByRole('slider', { name: 'Minimum' });
    const high = getByRole('slider', { name: 'Maximum' });

    key(low, 'ArrowRight');
    key(low, 'ArrowRight');
    expect(now(low)).toBe(10);
    key(low, 'End');
    expect(now(low)).toBe(10);
    key(high, 'Home');
    expect(now(high)).toBe(11);
    key(high, 'End');
    expect(onChange).toHaveBeenLastCalledWith([10, 24]);
  });

  test('controlled, with onChangeEnd and thumbLabels', () => {
    const [value, setValue] = createSignal<RangeSliderValue>([10, 20]);
    const onChangeEnd = vi.fn();
    const { getByRole } = renderIn(() => (
      <RangeSlider label="Age" value={value()} onChange={setValue} onChangeEnd={onChangeEnd} thumbLabels={['From', 'To']} />
    ));

    key(getByRole('slider', { name: 'To' }), 'PageUp');

    expect(untrack(value)).toEqual([10, 30]);
    expect(onChangeEnd).toHaveBeenCalledWith([10, 30]);
    expect(now(getByRole('slider', { name: 'To' }))).toBe(30);
  });

  test('name submits both values', () => {
    const { container } = renderIn(() => <RangeSlider label="Price" name="price" defaultValue={[5, 50]} />);

    expect(Array.from(container.querySelectorAll<HTMLInputElement>('input[name="price"]')).map((input) => input.value)).toEqual([
      '5',
      '50',
    ]);
  });

  test('a key step updates it without diagnostics or waste', async () => {
    const { getByRole } = renderIn(() => <RangeSlider label="Price" defaultValue={[20, 80]} />);
    flush();
    const low = getByRole('slider', { name: 'Minimum' });

    const { artifact } = await captureArtifact(() => key(low, 'ArrowRight'), { scenario: 'range-slider-step' });

    expect(now(low)).toBe(21);
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(12);
  });

  test('has no axe violations', async () => {
    const { container } = renderIn(() => (
      <>
        <RangeSlider label="Price" defaultValue={[20, 80]} />
        <RangeSlider
          label="Hours"
          min={0}
          max={24}
          defaultValue={[9, 17]}
          marks={[
            { value: 0, label: '0h' },
            { value: 24, label: '24h' },
          ]}
        />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./range-slider.fixtures.tsx', 'rangeSliders');
  });
});
