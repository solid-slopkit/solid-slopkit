import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, untrack } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { AngleSlider } from './angle-slider';

const key = (el: HTMLElement, key: string) => {
  fireEvent.keyDown(el, { key });
  flush();
};

describe('<AngleSlider />', () => {
  test('a dial with role="slider", named by the label, said in degrees', () => {
    const { getByRole, container } = render(() => <AngleSlider label="Direction" defaultValue={90} class="mine" />);
    const dial = getByRole('slider', { name: 'Direction' });

    expect(dial).toHaveAttribute('aria-valuenow', '90');
    expect(dial).toHaveAttribute('aria-valuemin', '0');
    expect(dial).toHaveAttribute('aria-valuemax', '359');
    expect(dial).toHaveAttribute('aria-valuetext', '90 degrees');
    expect(dial.style.getPropertyValue('--_angle')).toBe('90deg');
    expect(container.querySelector('[data-slot="angle-slider-label"]')).toHaveTextContent('90°');
    expect(container.firstElementChild).toHaveClass('slp-angle-slider', 'mine');
  });

  test('keys step it and wrap around 0 and 360', () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const { getByRole } = render(() => <AngleSlider label="Direction" onChange={onChange} onChangeEnd={onChangeEnd} />);
    const dial = getByRole('slider');

    key(dial, 'ArrowLeft');
    expect(dial).toHaveAttribute('aria-valuenow', '359');
    key(dial, 'ArrowRight');
    expect(dial).toHaveAttribute('aria-valuenow', '0');
    key(dial, 'PageUp');
    expect(dial).toHaveAttribute('aria-valuenow', '15');
    key(dial, 'End');
    expect(dial).toHaveAttribute('aria-valuenow', '359');
    key(dial, 'Home');

    expect(onChange).toHaveBeenLastCalledWith(0);
    expect(onChangeEnd).toHaveBeenLastCalledWith(0);
  });

  test('values snap to the step and wrap: 370 is 10', () => {
    const { getAllByRole } = render(() => (
      <>
        <AngleSlider label="A" defaultValue={370} />
        <AngleSlider label="B" defaultValue={100} step={45} />
      </>
    ));
    const [a, b] = getAllByRole('slider');

    expect(a).toHaveAttribute('aria-valuenow', '10');
    expect(b).toHaveAttribute('aria-valuenow', '90');
    expect(b).toHaveAttribute('aria-valuemax', '315');
  });

  test('controlled: it follows value', () => {
    const [value, setValue] = createSignal(30);
    const onChange = vi.fn();
    const { getByRole } = render(() => <AngleSlider label="Direction" value={value()} onChange={onChange} />);
    const dial = getByRole('slider');

    key(dial, 'ArrowRight');
    expect(onChange).toHaveBeenCalledWith(31);
    expect(dial).toHaveAttribute('aria-valuenow', '30');

    setValue(270);
    flush();
    expect(dial).toHaveAttribute('aria-valuenow', '270');
    expect(untrack(value)).toBe(270);
  });

  test('marks, valueText, valueLabel, name and disabled', () => {
    const { getByRole, container } = render(() => (
      <AngleSlider
        label="Wind"
        defaultValue={180}
        marks={[0, 90, 180, 270]}
        valueText={(value) => (value === 180 ? 'South' : `${value}°`)}
        valueLabel={(value) => `${value} deg`}
        name="wind"
        disabled
      />
    ));
    const dial = getByRole('slider');

    expect(container.querySelectorAll('[data-slot="angle-slider-mark"]')).toHaveLength(4);
    expect(dial).toHaveAttribute('aria-valuetext', 'South');
    expect(container.querySelector('[data-slot="angle-slider-label"]')).toHaveTextContent('180 deg');
    expect(container.querySelector<HTMLInputElement>('input[name="wind"]')!.value).toBe('180');
    expect(dial).toHaveAttribute('tabindex', '-1');
    key(dial, 'ArrowRight');
    expect(dial).toHaveAttribute('aria-valuenow', '180');
  });

  test('a key step updates it without diagnostics or waste', async () => {
    const { getByRole } = render(() => <AngleSlider label="Direction" defaultValue={10} />);
    flush();
    const dial = getByRole('slider');

    const { artifact } = await captureArtifact(() => key(dial, 'ArrowRight'), { scenario: 'angle-slider-step' });

    expect(dial).toHaveAttribute('aria-valuenow', '11');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(8);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <AngleSlider label="Direction" defaultValue={90} />
        <AngleSlider label="Hue" defaultValue={200} marks={[0, 90, 180, 270]} />
        <AngleSlider label="Locked" disabled defaultValue={45} />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./angle-slider.fixtures.tsx', 'angleSliders');
  });
});
