import { render } from '@solidjs/testing-library';
import { For } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { Indicator, type IndicatorPosition } from './indicator';

const center = (el: Element) => {
  const { left, top, width, height } = el.getBoundingClientRect();
  return { x: Math.round(left + width / 2), y: Math.round(top + height / 2) };
};

const box = { display: 'block', width: '100px', height: '60px' };

describe('<Indicator /> in a browser', () => {
  test('the root hugs the child; the mark is centered on each corner and edge', () => {
    const positions: IndicatorPosition[] = [
      'top-start',
      'top-center',
      'top-end',
      'middle-start',
      'middle-end',
      'bottom-start',
      'bottom-center',
      'bottom-end',
    ];
    const { container } = render(() => (
      <For each={positions}>
        {(position) => (
          <Indicator position={position}>
            <span style={box} />
          </Indicator>
        )}
      </For>
    ));
    const expected: Record<IndicatorPosition, [number, number]> = {
      'top-start': [0, 0],
      'top-center': [50, 0],
      'top-end': [100, 0],
      'middle-start': [0, 30],
      'middle-end': [100, 30],
      'bottom-start': [0, 60],
      'bottom-center': [50, 60],
      'bottom-end': [100, 60],
    };

    for (const root of container.querySelectorAll('.slp-indicator')) {
      const child = root.firstElementChild!.getBoundingClientRect();
      const dot = root.querySelector('[data-slot="indicator-mark"]')!;
      const position = dot.getAttribute('data-position') as IndicatorPosition;
      const { x, y } = center(dot);

      expect(root.getBoundingClientRect().width).toBe(100);
      expect([x - Math.round(child.left), y - Math.round(child.top)], position).toEqual(expected[position]);
    }
  });

  test('offset moves the mark toward the center', () => {
    const { container } = render(() => (
      <Indicator offset={6}>
        <span style={box} />
      </Indicator>
    ));
    const child = container.querySelector('.slp-indicator > span')!.getBoundingClientRect();
    const { x, y } = center(container.querySelector('[data-slot="indicator-mark"]')!);

    expect([x - Math.round(child.left), y - Math.round(child.top)]).toEqual([94, 6]);
  });

  test('a dot is round; a label makes a pill at least as wide as it is tall', () => {
    const { container } = render(() => (
      <>
        <Indicator>
          <span style={box} />
        </Indicator>
        <Indicator label="5">
          <span style={box} />
        </Indicator>
        <Indicator label="999+">
          <span style={box} />
        </Indicator>
      </>
    ));
    const [dot, single, wide] = [...container.querySelectorAll('[data-slot="indicator-mark"]')].map((el) =>
      el.getBoundingClientRect(),
    );

    expect([Math.round(dot.width), Math.round(dot.height)]).toEqual([10, 10]);
    expect([Math.round(single.width), Math.round(single.height)]).toEqual([18, 18]);
    expect(Math.round(wide.height)).toBe(18);
    expect(wide.width).toBeGreaterThan(18);
  });

  test('the mark is the role color, ringed in the surface color; processing animates a ping', () => {
    const { container, getByTestId } = render(() => (
      <>
        <Indicator color="error" processing>
          <span style={box} />
        </Indicator>
        <span data-testid="token" style={{ color: 'var(--slp-color-error)' }} />
      </>
    ));
    const dot = container.querySelector('[data-slot="indicator-mark"]')!;

    expect(getComputedStyle(dot).backgroundColor).toBe(getComputedStyle(getByTestId('token')).color);
    expect(getComputedStyle(dot).boxShadow).toMatch(/0px 0px 0px 2px$/);
    expect(getComputedStyle(dot, '::after').animationName).toMatch(/slp-indicator-ping/);
  });
});
