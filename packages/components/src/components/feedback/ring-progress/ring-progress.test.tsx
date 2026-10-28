import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { RingProgress } from './ring-progress';

const arc = (el: Element) => (el as HTMLElement).style.getPropertyValue('--_ring-value');

describe('<RingProgress />', () => {
  test('a progressbar named "Progress" with its value, a hidden SVG ring, and the children centered in a slot', () => {
    const { getByRole } = render(() => <RingProgress value={40}>40%</RingProgress>);
    const ring = getByRole('progressbar', { name: 'Progress' });

    expect(ring.tagName).toBe('DIV');
    expect(ring).toHaveClass('slp-ring-progress');
    expect(ring).toHaveAttribute('aria-valuenow', '40');
    expect(ring).toHaveAttribute('aria-valuemin', '0');
    expect(ring).toHaveAttribute('aria-valuemax', '100');
    expect(ring).toHaveAttribute('data-color', 'primary');
    expect(ring).toHaveAttribute('data-size', 'md');
    expect(arc(ring)).toBe('40');
    expect(ring.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(ring.querySelector('[data-slot="ring-progress-track"]')).not.toBeNull();
    expect(ring.querySelector('[data-slot="ring-progress-arc"]')).toHaveAttribute('pathLength', '100');
    expect(ring.querySelector('[data-slot="ring-progress-label"]')).toHaveTextContent('40%');
    expect(ring).toHaveAttribute('data-round-caps', '');
    expect(ring.querySelector('[data-slot="ring-progress-arc"]')).toHaveAttribute('r', '44');
    expect(ring.style.getPropertyValue('--_ring-thickness')).toBe('');
  });

  test('thickness sets the stroke and a radius that keeps it inside the box; roundCaps={false} cuts the ends flat', () => {
    const { getAllByRole } = render(() => (
      <>
        <RingProgress value={50} thickness={14} roundCaps={false} />
        <RingProgress value={50} thickness={80} />
      </>
    ));
    const [thick, clamped] = getAllByRole('progressbar');

    expect(thick.style.getPropertyValue('--_ring-thickness')).toBe('14');
    expect(thick.querySelector('[data-slot="ring-progress-track"]')).toHaveAttribute('r', '42');
    expect(thick.querySelector('[data-slot="ring-progress-arc"]')).toHaveAttribute('r', '42');
    expect(thick).not.toHaveAttribute('data-round-caps');
    expect(clamped.style.getPropertyValue('--_ring-thickness')).toBe('48');
    expect(clamped.querySelector('[data-slot="ring-progress-arc"]')).toHaveAttribute('r', '25');
  });

  test('size takes a CSS length, set as the diameter instead of a named size', () => {
    const { getByRole } = render(() => <RingProgress value={50} size="12rem" style={{ color: 'red' }} />);
    const ring = getByRole('progressbar');

    expect(ring).not.toHaveAttribute('data-size');
    expect(ring.style.getPropertyValue('--_ring-size')).toBe('12rem');
    expect(ring.style.getPropertyValue('--_ring-value')).toBe('50');
    expect(ring.style.color).toBe('red');
  });

  test('max sets the range; the value is clamped; zero marks it empty', () => {
    const { getAllByRole } = render(() => (
      <>
        <RingProgress value={3} max={5} />
        <RingProgress value={150} />
        <RingProgress value={0} />
      </>
    ));
    const [steps, over, empty] = getAllByRole('progressbar');

    expect(arc(steps)).toBe('60');
    expect(over).toHaveAttribute('aria-valuenow', '100');
    expect(arc(over)).toBe('100');
    expect(empty).toHaveAttribute('data-empty', '');
    expect(steps).not.toHaveAttribute('data-empty');
  });

  test('without a value it is indeterminate, with no aria-valuenow', () => {
    const { getByRole } = render(() => <RingProgress label="Syncing" />);
    const ring = getByRole('progressbar', { name: 'Syncing' });

    expect(ring).toHaveAttribute('data-indeterminate', '');
    expect(ring).not.toHaveAttribute('aria-valuenow');
  });

  test('aria-labelledby replaces the label; color, size and other props pass through', () => {
    const { getByRole } = render(() => (
      <>
        <span id="caption">Storage</span>
        <RingProgress value={70} aria-labelledby="caption" color="warning" size="xl" id="r" class="mine" />
      </>
    ));
    const ring = getByRole('progressbar', { name: 'Storage' });

    expect(ring).not.toHaveAttribute('aria-label');
    expect(ring).toHaveAttribute('data-color', 'warning');
    expect(ring).toHaveAttribute('data-size', 'xl');
    expect(ring).toHaveAttribute('id', 'r');
    expect(ring).toHaveClass('slp-ring-progress', 'mine');
  });

  test('a new value updates the arc without diagnostics or waste', async () => {
    const [value, setValue] = createSignal(10, { name: 'value' });
    const { getByRole } = render(() => <RingProgress value={value()}>{value()}%</RingProgress>);
    flush();

    const { artifact } = await captureArtifact(() => setValue(55), { scenario: 'ring-progress-value' });

    const ring = getByRole('progressbar');
    expect(ring).toHaveAttribute('aria-valuenow', '55');
    expect(arc(ring)).toBe('55');
    expect(ring).toHaveTextContent('55%');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(6);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <RingProgress value={40}>40%</RingProgress>
        <RingProgress label="Syncing" />
        <span id="caption">Storage</span>
        <RingProgress value={70} aria-labelledby="caption" />
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./ring-progress.fixtures.tsx', 'rings');
  });
});
