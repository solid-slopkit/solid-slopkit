import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { RingProgress } from './ring-progress';

const part = (el: Element, slot: string) => el.querySelector(`[data-slot="ring-progress-${slot}"]`)!;

describe('<RingProgress /> in a browser', () => {
  test('sizes set the diameter; the ring fills it', () => {
    const { getAllByRole } = render(() => (
      <div style={{ display: 'flex', 'align-items': 'start' }}>
        <RingProgress value={50} size="xs" />
        <RingProgress value={50} size="sm" />
        <RingProgress value={50} />
        <RingProgress value={50} size="lg" />
        <RingProgress value={50} size="xl" />
      </div>
    ));
    const rings = getAllByRole('progressbar');

    expect(rings.map((el) => Math.round(el.getBoundingClientRect().width))).toEqual([40, 56, 80, 112, 144]);
    expect(rings.map((el) => Math.round(el.getBoundingClientRect().height))).toEqual([40, 56, 80, 112, 144]);
    expect(Math.round(rings[2].querySelector('svg')!.getBoundingClientRect().width)).toBe(80);
  });

  test('the arc length follows the value; it starts at the top', () => {
    const { getByRole } = render(() => <RingProgress value={25} />);
    const ring = getByRole('progressbar');
    const css = getComputedStyle(part(ring, 'arc'));

    expect(css.strokeDasharray).toBe('25px, 100px');
    expect(getComputedStyle(ring.querySelector('svg')!).rotate).toBe('-90deg');
  });

  test('the arc is the role color, over a muted track; zero draws no arc', () => {
    const { getAllByRole, getByTestId } = render(() => (
      <>
        <RingProgress value={50} color="success" />
        <RingProgress value={0} />
        <span data-testid="token" style={{ color: 'var(--slp-color-success)' }} />
      </>
    ));
    const [colored, empty] = getAllByRole('progressbar');

    expect(getComputedStyle(part(colored, 'arc')).stroke).toBe(getComputedStyle(getByTestId('token')).color);
    expect(getComputedStyle(part(colored, 'track')).stroke).toMatch(/\/ 0\.1\)$/);
    expect(getComputedStyle(part(empty, 'arc')).strokeOpacity).toBe('0');
  });

  test('children sit in the center; indeterminate turns a quarter arc', () => {
    const { getAllByRole, getByText } = render(() => (
      <>
        <RingProgress value={40}>40%</RingProgress>
        <RingProgress />
      </>
    ));
    const [labeled, indeterminate] = getAllByRole('progressbar');
    const ring = labeled.getBoundingClientRect();
    const text = getByText('40%').getBoundingClientRect();

    expect(Math.round(text.left + text.width / 2)).toBe(Math.round(ring.left + ring.width / 2));
    expect(Math.round(text.top + text.height / 2)).toBe(Math.round(ring.top + ring.height / 2));
    expect(getComputedStyle(part(indeterminate, 'arc')).animationName).toMatch(/slp-ring-progress-turn/);
    expect(getComputedStyle(part(indeterminate, 'arc')).strokeDasharray).toBe('25px, 100px');
  });

  test('a CSS length size, a thicker flat stroke, and stacked children', () => {
    const { getByRole, getByText } = render(() => (
      <RingProgress value={50} size="12rem" thickness={14} roundCaps={false}>
        <span>$24,000</span>
        <span>80%</span>
      </RingProgress>
    ));
    const ring = getByRole('progressbar');
    const arc = getComputedStyle(part(ring, 'arc'));

    expect(Math.round(ring.getBoundingClientRect().width)).toBe(192);
    expect([arc.strokeWidth, arc.strokeLinecap]).toEqual(['14px', 'butt']);
    expect(getComputedStyle(part(ring, 'track')).strokeWidth).toBe('14px');
    const value = getByText('$24,000').getBoundingClientRect();
    const percent = getByText('80%').getBoundingClientRect();
    expect(Math.round(percent.top)).toBe(Math.round(value.bottom));
    expect(Math.round(percent.left + percent.width / 2)).toBe(Math.round(value.left + value.width / 2));
  });

  test('round caps by default', () => {
    const { getByRole } = render(() => <RingProgress value={50} />);

    expect(getComputedStyle(part(getByRole('progressbar'), 'arc')).strokeLinecap).toBe('round');
  });
});
