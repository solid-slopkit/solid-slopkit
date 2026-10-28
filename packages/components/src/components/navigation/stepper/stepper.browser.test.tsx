import { render } from '@solidjs/testing-library';
import { createSignal } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { Stepper, type StepperOrientation } from './stepper';

function setup(orientation: StepperOrientation = 'horizontal') {
  const [active, setActive] = createSignal(1);
  const result = render(() => (
    <div style={{ width: '600px' }}>
      <Stepper active={active()} onStepClick={setActive} orientation={orientation}>
        <Stepper.Step label="Cart">Cart content</Stepper.Step>
        <Stepper.Step label="Address">Address content</Stepper.Step>
        <Stepper.Step label="Payment">Payment content</Stepper.Step>
      </Stepper>
    </div>
  ));
  const steps = () => [...result.container.querySelectorAll<HTMLElement>('[data-slot="stepper-step"]')];
  const icon = (index: number) => steps()[index].querySelector<HTMLElement>('[data-slot="stepper-step-icon"]')!;
  return { ...result, steps, icon };
}

describe('<Stepper /> in a browser', () => {
  test('horizontal: steps in a row joined by lines that fill the width', () => {
    const { steps, container } = setup();
    const lines = [...container.querySelectorAll<HTMLElement>('[data-slot="stepper-separator"]')];

    expect(lines).toHaveLength(2);
    expect(steps()[1].getBoundingClientRect().top).toBe(steps()[0].getBoundingClientRect().top);
    expect(lines[0].getBoundingClientRect().width).toBeGreaterThan(50);
    const last = steps()[2].getBoundingClientRect();
    expect(Math.round(last.right)).toBe(Math.round(container.querySelector('ol')!.getBoundingClientRect().right));
  });

  test('a completed step is filled, the current one outlined, a later one plain; the line after a completed step takes the color', () => {
    const { icon, container } = setup();
    const [first, second] = [...container.querySelectorAll<HTMLElement>('[data-slot="stepper-separator"]')];

    expect(getComputedStyle(icon(0)).backgroundColor).toBe(getComputedStyle(icon(1)).borderTopColor);
    expect(getComputedStyle(icon(1)).backgroundColor).not.toBe(getComputedStyle(icon(0)).backgroundColor);
    expect(getComputedStyle(icon(2)).borderTopColor).not.toBe(getComputedStyle(icon(1)).borderTopColor);
    expect(getComputedStyle(first).backgroundColor).not.toBe(getComputedStyle(second).backgroundColor);
  });

  test('a click on a step makes it current', async () => {
    const { getByRole, getByText } = setup();

    await userEvent.click(getByRole('button', { name: /Payment/ }));
    expect(getByText('Payment content')).toBeVisible();
    expect(getByRole('button', { name: /Payment/ })).toHaveAttribute('aria-current', 'step');
  });

  test('vertical: steps in a column, the line running down from the circle', () => {
    const { steps, icon, container } = setup('vertical');
    const line = container.querySelector<HTMLElement>('[data-slot="stepper-separator"]')!.getBoundingClientRect();
    const circle = icon(0).getBoundingClientRect();

    expect(steps()[1].getBoundingClientRect().top).toBeGreaterThan(steps()[0].getBoundingClientRect().bottom - 1);
    expect(line.height).toBeGreaterThan(line.width);
    expect(Math.round(line.left + line.width / 2)).toBe(Math.round(circle.left + circle.width / 2));
  });
});
