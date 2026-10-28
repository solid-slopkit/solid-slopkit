import { render } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { Progress } from './progress';

const rect = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  return { width: Math.round(width), height: Math.round(height) };
};
const bar = (el: Element) => el.querySelector('[data-slot="progress-bar"]')!;

describe('<Progress /> in a browser', () => {
  test('the track fills its container; the bar fills the value', () => {
    const { getByRole } = render(() => (
      <div style={{ width: '200px' }}>
        <Progress value={25} />
      </div>
    ));
    const progress = getByRole('progressbar');

    expect(rect(progress)).toEqual({ width: 200, height: 8 });
    expect(rect(bar(progress))).toEqual({ width: 50, height: 8 });
  });

  test('sizes set the height', () => {
    const { getAllByRole } = render(() => (
      <>
        <Progress value={50} size="xs" />
        <Progress value={50} size="sm" />
        <Progress value={50} />
        <Progress value={50} size="lg" />
        <Progress value={50} size="xl" />
      </>
    ));

    expect(getAllByRole('progressbar').map((el) => rect(el).height)).toEqual([4, 6, 8, 12, 16]);
  });

  test('the bar is the role color; --slp-progress-color overrides it', () => {
    const { getAllByRole, getByTestId } = render(() => (
      <>
        <Progress value={50} color="success" />
        <Progress value={50} color="success" style={{ '--slp-progress-color': 'rgb(1, 2, 3)' }} />
        <span data-testid="token" style={{ color: 'var(--slp-color-success)' }} />
      </>
    ));
    const [role, custom] = getAllByRole('progressbar');

    expect(getComputedStyle(bar(role)).backgroundColor).toBe(getComputedStyle(getByTestId('token')).color);
    expect(getComputedStyle(bar(custom)).backgroundColor).toBe('rgb(1, 2, 3)');
  });

  test('indeterminate slides a band; striped draws stripes; animated moves them', () => {
    const { getAllByRole } = render(() => (
      <div style={{ width: '200px' }}>
        <Progress />
        <Progress value={50} striped />
        <Progress value={50} animated />
      </div>
    ));
    const [indeterminate, striped, animated] = getAllByRole('progressbar').map((el) => getComputedStyle(bar(el)));

    expect(indeterminate.width).toBe('80px');
    expect(indeterminate.animationName).toMatch(/slp-progress-slide/);
    expect(striped.backgroundImage).toMatch(/^linear-gradient/);
    expect(striped.animationName).toBe('none');
    expect(animated.animationName).toMatch(/slp-progress-stripes/);
  });
});
