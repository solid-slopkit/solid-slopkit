import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { Skeleton } from './skeleton';

const rect = (el: Element) => {
  const { width, height } = el.getBoundingClientRect();
  return { width: Math.round(width), height: Math.round(height) };
};

describe('<Skeleton /> in a browser', () => {
  test('around children, it takes their size and hides them, text included', () => {
    const { getByText } = render(() => (
      <div style={{ width: '200px' }}>
        <Skeleton>
          <p style={{ margin: '0', height: '40px' }}>Hidden paragraph</p>
          Loose text
        </Skeleton>
      </div>
    ));
    const paragraph = getByText('Hidden paragraph');
    const skeleton = paragraph.parentElement!;
    const css = getComputedStyle(skeleton);

    expect(rect(skeleton).width).toBe(200);
    expect(rect(skeleton).height).toBeGreaterThan(40);
    expect(getComputedStyle(paragraph).visibility).toBe('hidden');
    expect(css.color).toBe('rgba(0, 0, 0, 0)');
    expect(css.backgroundColor).toMatch(/\/ 0\.1\)$/);
  });

  test('hidden children cannot be focused', async () => {
    const { getByText } = render(() => (
      <>
        <button type="button">Before</button>
        <Skeleton>
          <button type="button">Inside</button>
        </Skeleton>
        <button type="button">After</button>
      </>
    ));
    getByText('Before').focus();

    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(getByText('After'));
  });

  test('without children, style sizes it; circle rounds it', () => {
    const { container } = render(() => (
      <>
        <Skeleton style={{ width: '120px', height: '12px' }} />
        <Skeleton circle style={{ width: '40px', height: '40px' }} />
      </>
    ));
    const [line, circle] = container.querySelectorAll('.slp-skeleton');

    expect(rect(line)).toEqual({ width: 120, height: 12 });
    expect(getComputedStyle(circle).borderTopLeftRadius).toBe('50%');
  });

  test('animate sweeps a shimmer across; visible={false} draws nothing', () => {
    const { container } = render(() => (
      <>
        <Skeleton style={{ height: '12px' }} />
        <Skeleton visible={false}>
          <p>Shown</p>
        </Skeleton>
      </>
    ));
    const [animated, shown] = container.querySelectorAll('.slp-skeleton');

    expect(getComputedStyle(animated, '::after').animationName).toMatch(/slp-skeleton-shimmer/);
    expect(getComputedStyle(shown).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(shown, '::after').content).toBe('none');
    expect(getComputedStyle(shown.firstElementChild!).visibility).toBe('visible');
  });
});
