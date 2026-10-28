import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Stepper, type StepperProps } from './stepper';

function setup(props: Partial<StepperProps> = {}) {
  const [active, setActive] = createSignal(props.active ?? 1);
  const result = render(() => (
    <Stepper aria-label="Checkout" {...props} active={active()}>
      <Stepper.Step label="Cart" description="Review the items">
        Cart content
      </Stepper.Step>
      <Stepper.Step label="Address">Address content</Stepper.Step>
      <Stepper.Step label="Payment" icon={<svg data-testid="card" />}>
        Payment content
      </Stepper.Step>
      <Stepper.Completed>All done</Stepper.Completed>
    </Stepper>
  ));
  flush();
  const steps = () => [...result.container.querySelectorAll<HTMLElement>('[data-slot="stepper-step"]')];
  const states = () => steps().map((step) => step.dataset.state);
  const content = () => result.container.querySelector('[data-slot="stepper-content"]')!.textContent;
  const go = (index: number) => {
    setActive(index);
    flush();
  };
  return { ...result, steps, states, content, go };
}

describe('<Stepper />', () => {
  test('an ordered list of steps, the current one marked; its content under them', () => {
    const { container, steps, states, content, getByText } = setup({ class: 'mine' });

    expect(container.querySelector('.slp-stepper')).toHaveClass('mine');
    expect(container.querySelector('ol')!.children).toHaveLength(3);
    expect(states()).toEqual(['completed', 'current', 'upcoming']);
    expect(steps()[1].querySelector('[aria-current="step"]')).not.toBeNull();
    expect(content()).toBe('Address content');
    expect(getByText('Review the items')).toBeDefined();
  });

  test('the circle holds the number, a check mark once completed, or the icon', () => {
    const { steps, getByTestId } = setup();

    expect(steps()[0].querySelector('svg')).not.toBeNull();
    expect(steps()[0].querySelector('[data-slot="stepper-step-number"]')).toBeNull();
    expect(steps()[1].querySelector('[data-slot="stepper-step-number"]')).toHaveTextContent('2');
    expect(getByTestId('card')).toBeDefined();
  });

  test('a completed step says so to screen readers', () => {
    const { steps } = setup();
    expect(steps()[0]).toHaveTextContent('Cart, Completed');
    expect(steps()[1]).not.toHaveTextContent('Completed');
  });

  test('changing active moves the marks and the content', () => {
    const { states, content, go } = setup();

    go(2);
    expect(states()).toEqual(['completed', 'completed', 'current']);
    expect(content()).toBe('Payment content');
    go(0);
    expect(states()).toEqual(['current', 'upcoming', 'upcoming']);
    expect(content()).toBe('Cart content');
  });

  test('past the last step, every step is completed and Stepper.Completed shows', () => {
    const { states, content, go, container } = setup();

    go(3);
    expect(states()).toEqual(['completed', 'completed', 'completed']);
    expect(content()).toBe('All done');
    expect(container.querySelector('.slp-stepper')).toHaveAttribute('data-completed');
  });

  test('without onStepClick the steps are not buttons', () => {
    const { queryAllByRole } = setup();
    expect(queryAllByRole('button')).toHaveLength(0);
  });

  test('with onStepClick the steps are buttons that call it with their index', () => {
    const onStepClick = vi.fn();
    const { getAllByRole } = setup({ onStepClick });

    expect(getAllByRole('button')).toHaveLength(3);
    fireEvent.click(getAllByRole('button')[0]);
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  test('allowNextStepsSelect={false}: only the completed and current steps are buttons', () => {
    const { getAllByRole, steps } = setup({ onStepClick: () => {}, allowNextStepsSelect: false });

    expect(getAllByRole('button')).toHaveLength(2);
    expect(steps()[2].querySelector('button')).toBeNull();
  });

  test("a step's allowStepSelect wins over the stepper's rule", () => {
    const { getAllByRole } = render(() => (
      <Stepper active={0} onStepClick={() => {}}>
        <Stepper.Step label="One" allowStepSelect={false} />
        <Stepper.Step label="Two" />
      </Stepper>
    ));
    expect(getAllByRole('button').map((button) => button.textContent)).toEqual(['2Two']);
  });

  test('loading shows a loader in the circle; a step takes its own color', () => {
    const { container } = render(() => (
      <Stepper active={0} color="secondary">
        <Stepper.Step label="One" loading color="error" />
      </Stepper>
    ));

    expect(container.querySelector('[data-slot="stepper-step-icon"] .slp-loader')).not.toBeNull();
    expect(container.querySelector('[data-slot="stepper-step"]')).toHaveAttribute('data-color', 'error');
    expect(container.querySelector('.slp-stepper')).toHaveAttribute('data-color', 'secondary');
  });

  test('completedIcon replaces the check mark', () => {
    const { getByTestId } = render(() => (
      <Stepper active={1}>
        <Stepper.Step label="One" completedIcon={<svg data-testid="done" />} />
        <Stepper.Step label="Two" />
      </Stepper>
    ));
    expect(getByTestId('done')).toBeDefined();
  });

  test('has no axe violations, plain and clickable', async () => {
    const { container } = setup();
    expect((await axe.run(container)).violations).toEqual([]);
    const clickable = setup({ onStepClick: () => {} });
    expect((await axe.run(clickable.container)).violations).toEqual([]);
  });

  test('moving between steps has no diagnostics', async () => {
    const { go } = setup();

    const { artifact } = await captureArtifact(
      () => {
        go(2);
        go(3);
        go(0);
      },
      { scenario: 'stepper-move' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./stepper.fixtures.tsx', 'steppers');
  });
});
