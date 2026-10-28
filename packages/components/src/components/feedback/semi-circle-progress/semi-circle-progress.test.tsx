import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { SemiCircleProgress } from './semi-circle-progress';

const arc = (el: Element) => (el as HTMLElement).style.getPropertyValue('--_semi-value');

describe('<SemiCircleProgress />', () => {
  test('a progressbar named "Progress" with its value, a hidden SVG arc, and the children in a slot', () => {
    const { getByRole } = render(() => <SemiCircleProgress value={40}>40%</SemiCircleProgress>);
    const gauge = getByRole('progressbar', { name: 'Progress' });

    expect(gauge.tagName).toBe('DIV');
    expect(gauge).toHaveClass('slp-semi-circle-progress');
    expect(gauge).toHaveAttribute('aria-valuenow', '40');
    expect(gauge).toHaveAttribute('aria-valuemin', '0');
    expect(gauge).toHaveAttribute('aria-valuemax', '100');
    expect(gauge).toHaveAttribute('data-color', 'primary');
    expect(gauge).toHaveAttribute('data-size', 'md');
    expect(arc(gauge)).toBe('40');
    expect(gauge.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(gauge.querySelector('[data-slot="semi-circle-progress-track"]')).not.toBeNull();
    expect(gauge.querySelector('[data-slot="semi-circle-progress-arc"]')).toHaveAttribute('pathLength', '100');
    expect(gauge.querySelector('[data-slot="semi-circle-progress-label"]')).toHaveTextContent('40%');
  });

  test('max sets the range; the value is clamped; zero marks it empty', () => {
    const { getAllByRole } = render(() => (
      <>
        <SemiCircleProgress value={3} max={5} />
        <SemiCircleProgress value={150} />
        <SemiCircleProgress value={0} />
      </>
    ));
    const [steps, over, empty] = getAllByRole('progressbar');

    expect(arc(steps)).toBe('60');
    expect(over).toHaveAttribute('aria-valuenow', '100');
    expect(arc(over)).toBe('100');
    expect(empty).toHaveAttribute('data-empty', '');
  });

  test('without a value it is indeterminate, with no aria-valuenow', () => {
    const { getByRole } = render(() => <SemiCircleProgress label="Measuring" />);
    const gauge = getByRole('progressbar', { name: 'Measuring' });

    expect(gauge).toHaveAttribute('data-indeterminate', '');
    expect(gauge).not.toHaveAttribute('aria-valuenow');
  });

  test('aria-labelledby replaces the label; color, size and other props pass through', () => {
    const { getByRole } = render(() => (
      <>
        <span id="caption">CPU</span>
        <SemiCircleProgress value={70} aria-labelledby="caption" color="warning" size="xl" id="g" class="mine" />
      </>
    ));
    const gauge = getByRole('progressbar', { name: 'CPU' });

    expect(gauge).not.toHaveAttribute('aria-label');
    expect(gauge).toHaveAttribute('data-color', 'warning');
    expect(gauge).toHaveAttribute('data-size', 'xl');
    expect(gauge).toHaveAttribute('id', 'g');
    expect(gauge).toHaveClass('slp-semi-circle-progress', 'mine');
  });

  test('a new value updates the arc without diagnostics or waste', async () => {
    const [value, setValue] = createSignal(10, { name: 'value' });
    const { getByRole } = render(() => <SemiCircleProgress value={value()}>{value()}%</SemiCircleProgress>);
    flush();

    const { artifact } = await captureArtifact(() => setValue(55), { scenario: 'semi-circle-progress-value' });

    const gauge = getByRole('progressbar');
    expect(gauge).toHaveAttribute('aria-valuenow', '55');
    expect(arc(gauge)).toBe('55');
    expect(gauge).toHaveTextContent('55%');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(6);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <SemiCircleProgress value={40}>40%</SemiCircleProgress>
        <SemiCircleProgress label="Measuring" />
        <span id="caption">CPU</span>
        <SemiCircleProgress value={70} aria-labelledby="caption" />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./semi-circle-progress.fixtures.tsx', 'gauges');
  });
});
