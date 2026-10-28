import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { SlopkitUi } from '../../provider';
import { Slider } from './slider';

const renderIn = (ui: () => JSX.Element, locale?: string) => render(() => <SlopkitUi locale={locale}>{ui()}</SlopkitUi>);
const key = (el: HTMLElement, key: string) => {
  fireEvent.keyDown(el, { key });
  flush();
};

describe('<Slider />', () => {
  test('a thumb with role="slider", named by the label, with its value and bounds', () => {
    const { getByRole, container } = renderIn(() => <Slider label="Volume" defaultValue={40} class="mine" />);
    const thumb = getByRole('slider', { name: 'Volume' });

    expect(thumb).toHaveAttribute('tabindex', '0');
    expect(thumb).toHaveAttribute('aria-valuenow', '40');
    expect(thumb).toHaveAttribute('aria-valuemin', '0');
    expect(thumb).toHaveAttribute('aria-valuemax', '100');
    expect(thumb).toHaveAttribute('aria-valuetext', '40');
    expect(thumb.style.insetInlineStart).toBe('40%');
    expect(container.querySelector('.slp-slider')).toHaveClass('slp-input-wrapper', 'mine');
    expect(container.querySelector('[data-slot="slider-bar"]')).toHaveStyle({ width: '40%' });
  });

  test('keys: arrows step, Page Up and Down take ten steps, Home and End go to the ends', () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const { getByRole } = renderIn(() => (
      <Slider label="Volume" defaultValue={50} step={5} onChange={onChange} onChangeEnd={onChangeEnd} />
    ));
    const thumb = getByRole('slider');

    key(thumb, 'ArrowRight');
    expect(thumb).toHaveAttribute('aria-valuenow', '55');
    key(thumb, 'ArrowDown');
    key(thumb, 'PageUp');
    expect(thumb).toHaveAttribute('aria-valuenow', '100');
    key(thumb, 'Home');
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
    key(thumb, 'ArrowLeft');
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
    key(thumb, 'End');

    expect(onChange).toHaveBeenLastCalledWith(100);
    expect(onChangeEnd).toHaveBeenLastCalledWith(100);
  });

  test('values snap to the step grid from min, without float noise', () => {
    const { getByRole } = renderIn(() => <Slider label="Opacity" min={0} max={1} step={0.1} defaultValue={0.2} />);
    const thumb = getByRole('slider');

    key(thumb, 'ArrowRight');

    expect(thumb).toHaveAttribute('aria-valuenow', '0.3');
  });

  test('controlled: it follows value', () => {
    const [value, setValue] = createSignal(10);
    const onChange = vi.fn();
    const { getByRole } = renderIn(() => <Slider label="Volume" value={value()} onChange={onChange} />);
    const thumb = getByRole('slider');

    key(thumb, 'ArrowRight');
    expect(onChange).toHaveBeenCalledWith(11);
    expect(thumb).toHaveAttribute('aria-valuenow', '10');

    setValue(80);
    flush();
    expect(thumb).toHaveAttribute('aria-valuenow', '80');
    expect(untrack(value)).toBe(80);
  });

  test('marks: a dot each, filled up to the value, with labels hidden from screen readers', () => {
    const { container } = renderIn(() => (
      <Slider
        label="Size"
        min={0}
        max={4}
        defaultValue={2}
        marks={[{ value: 0, label: 'XS' }, { value: 2 }, { value: 4, label: 'XL' }]}
      />
    ));
    const marks = Array.from(container.querySelectorAll('[data-slot="slider-mark"]'));

    expect(marks.map((mark) => (mark as HTMLElement).style.insetInlineStart)).toEqual(['0%', '50%', '100%']);
    expect(marks.map((mark) => mark.hasAttribute('data-filled'))).toEqual([true, true, false]);
    expect(container.querySelectorAll('[data-slot="slider-mark-label"]')).toHaveLength(2);
    expect(container.querySelector('[data-slot="slider-mark-label"]')).toHaveAttribute('aria-hidden', 'true');
  });

  test('valueText and the locale say the value; valueLabel sets or hides the bubble', () => {
    const { getAllByRole, container } = renderIn(
      () => (
        <>
          <Slider label="Price" defaultValue={1500} max={2000} valueLabel={(value) => `${value} €`} />
          <Slider label="Temperature" defaultValue={21} valueText={(value) => `${value} degrees`} valueLabel={null} />
        </>
      ),
      'de-DE',
    );
    const [price, temperature] = getAllByRole('slider');

    expect(price).toHaveAttribute('aria-valuetext', '1.500');
    expect(price.querySelector('[data-slot="slider-value-label"]')).toHaveTextContent('1500 €');
    expect(temperature).toHaveAttribute('aria-valuetext', '21 degrees');
    expect(container.querySelectorAll('[data-slot="slider-value-label"]')).toHaveLength(1);
  });

  test('name submits the value; disabled takes it out of the tab order and ignores keys', () => {
    const { getAllByRole, container } = renderIn(() => (
      <>
        <Slider label="Volume" name="volume" defaultValue={30} />
        <Slider label="Locked" disabled defaultValue={70} />
      </>
    ));
    const [, locked] = getAllByRole('slider');

    expect(container.querySelector<HTMLInputElement>('input[name="volume"]')!.value).toBe('30');
    expect(locked).toHaveAttribute('tabindex', '-1');
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    key(locked, 'ArrowRight');
    expect(locked).toHaveAttribute('aria-valuenow', '70');
  });

  test('a key step updates it without diagnostics or waste', async () => {
    const { getByRole } = renderIn(() => <Slider label="Volume" defaultValue={50} />);
    flush();
    const thumb = getByRole('slider');

    const { artifact } = await captureArtifact(() => key(thumb, 'ArrowRight'), { scenario: 'slider-step' });

    expect(thumb).toHaveAttribute('aria-valuenow', '51');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(10);
  });

  test('has no axe violations', async () => {
    const { container } = renderIn(() => (
      <>
        <Slider label="Volume" defaultValue={40} />
        <Slider
          label="Size"
          min={0}
          max={4}
          defaultValue={2}
          marks={[
            { value: 0, label: 'XS' },
            { value: 4, label: 'XL' },
          ]}
        />
        <Slider label="Locked" disabled defaultValue={70} description="Ask an admin." />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./slider.fixtures.tsx', 'sliders');
  });
});
