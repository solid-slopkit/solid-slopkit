import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { SemiCircleProgress } from './semi-circle-progress';

const part = (el: Element, slot: string) => el.querySelector(`[data-slot="semi-circle-progress-${slot}"]`)!;
const rect = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  return [Math.round(width), Math.round(height)];
};

describe('<SemiCircleProgress /> in a browser', () => {
  test('sizes set the width; the height is a little over half of it', () => {
    const { getAllByRole } = render(() => (
      <div style={{ display: 'flex', 'align-items': 'start' }}>
        <SemiCircleProgress value={50} size="xs" />
        <SemiCircleProgress value={50} size="sm" />
        <SemiCircleProgress value={50} />
        <SemiCircleProgress value={50} size="lg" />
        <SemiCircleProgress value={50} size="xl" />
      </div>
    ));

    expect(getAllByRole('progressbar').map(rect)).toEqual([
      [64, 35],
      [88, 48],
      [128, 70],
      [176, 97],
      [224, 123],
    ]);
  });

  test('the arc length follows the value, from the left end', () => {
    const { getByRole } = render(() => <SemiCircleProgress value={50} />);
    const arcPath = part(getByRole('progressbar'), 'arc') as SVGPathElement;

    expect(getComputedStyle(arcPath).strokeDasharray).toBe('50px, 100px');
    // The path runs from the left end, over the top, to the right end.
    expect(arcPath.getPointAtLength(0).x).toBeCloseTo(5);
    expect(arcPath.getPointAtLength(arcPath.getTotalLength() / 2).y).toBeCloseTo(5);
  });

  test('the arc is the role color, over a muted track; zero draws no arc', () => {
    const { getAllByRole, getByTestId } = render(() => (
      <>
        <SemiCircleProgress value={50} color="success" />
        <SemiCircleProgress value={0} />
        <span data-testid="token" style={{ color: 'var(--slp-color-success)' }} />
      </>
    ));
    const [colored, empty] = getAllByRole('progressbar');

    expect(getComputedStyle(part(colored, 'arc')).stroke).toBe(getComputedStyle(getByTestId('token')).color);
    expect(getComputedStyle(part(colored, 'track')).stroke).toMatch(/\/ 0\.1\)$/);
    expect(getComputedStyle(part(empty, 'arc')).strokeOpacity).toBe('0');
  });

  test('children sit centered along the bottom; indeterminate sweeps a band', () => {
    const { getAllByRole, getByText } = render(() => (
      <>
        <SemiCircleProgress value={40}>40%</SemiCircleProgress>
        <SemiCircleProgress />
      </>
    ));
    const [labeled, indeterminate] = getAllByRole('progressbar');
    const gauge = labeled.getBoundingClientRect();
    const text = getByText('40%').getBoundingClientRect();

    expect(Math.round(text.left + text.width / 2)).toBe(Math.round(gauge.left + gauge.width / 2));
    expect(Math.round(text.bottom)).toBe(Math.round(gauge.bottom));
    expect(getComputedStyle(part(indeterminate, 'arc')).animationName).toMatch(/slp-semi-circle-progress-sweep/);
  });
});
