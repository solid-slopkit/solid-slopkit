import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { Carousel } from './carousel';

const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

// Waits until the engine has settled where `check` holds: it animates each step.
async function until(check: () => boolean, timeout = 2000) {
  const start = performance.now();
  while (!check()) {
    if (performance.now() - start > timeout) throw new Error('timed out');
    await frame();
  }
}

const slides = (count: number) =>
  Array.from({ length: count }, (_, index) => <Carousel.Slide style={{ height: '120px' }}>Slide {index + 1}</Carousel.Slide>);

const offset = (slide: Element, viewport: Element, axis: 'x' | 'y' = 'x') =>
  axis === 'x'
    ? slide.getBoundingClientRect().left - viewport.getBoundingClientRect().left
    : slide.getBoundingClientRect().top - viewport.getBoundingClientRect().top;

describe('<Carousel /> in a browser', () => {
  test('slides are slideSize long, spaced by slideGap, and clipped by the viewport', async () => {
    const { container } = render(() => (
      <Carousel aria-label="Photos" slideSize="50%" slideGap={4} style={{ width: '400px' }}>
        {slides(4)}
      </Carousel>
    ));
    await frame();
    const viewport = container.querySelector('[data-slot="carousel-viewport"]')!;
    const [first, second] = container.querySelectorAll('.slp-carousel-slide');

    expect(getComputedStyle(viewport).overflow).toBe('hidden');
    // The gap is padding at each slide's start, and the container is pulled back by one gap: two half slides fill
    // the viewport exactly, their content 16px apart.
    expect(getComputedStyle(second).paddingInlineStart).toBe('16px');
    expect(offset(first, viewport) + 16).toBeCloseTo(0, 0);
    expect(second.getBoundingClientRect().right).toBeCloseTo(viewport.getBoundingClientRect().right, 0);
    expect(offset(second, viewport) - (offset(first, viewport) + first.getBoundingClientRect().width)).toBeCloseTo(0, 0);
    expect(first.getBoundingClientRect().width - 16).toBeCloseTo(192, 0);
  });

  test('the next button moves the slides; the previous one becomes active; at the end next is aria-disabled', async () => {
    const { container, getByRole } = render(() => (
      <Carousel aria-label="Photos" style={{ width: '300px' }}>
        {slides(2)}
      </Carousel>
    ));
    await until(() => getByRole('group', { name: '1 of 2' }) !== null);
    const viewport = container.querySelector('[data-slot="carousel-viewport"]')!;
    const second = getByRole('group', { name: '2 of 2' });
    const next = getByRole('button', { name: 'Next slide' });

    await userEvent.click(next);
    await until(() => Math.abs(offset(second, viewport)) < 1);

    expect(next).toHaveAttribute('aria-disabled', 'true');
    // Hidden, but still focused: the focus doesn't drop to the page.
    expect(next).toHaveFocus();
    expect(getByRole('button', { name: 'Previous slide' })).not.toHaveAttribute('aria-disabled');
  });

  test('arrow keys from inside it step; indicators follow and jump', async () => {
    const { container, getByRole } = render(() => (
      <Carousel aria-label="Photos" withIndicators style={{ width: '300px' }}>
        {slides(3)}
      </Carousel>
    ));
    await until(() => container.querySelectorAll('[data-slot="carousel-indicator"]').length === 3);
    const viewport = container.querySelector('[data-slot="carousel-viewport"]')!;
    const third = getByRole('group', { name: '3 of 3' });

    getByRole('button', { name: 'Go to slide 1' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await until(() => getByRole('button', { name: 'Go to slide 2' }).getAttribute('aria-current') === 'true');

    await userEvent.click(getByRole('button', { name: 'Go to slide 3' }));
    await until(() => Math.abs(offset(third, viewport)) < 1);
    expect(getByRole('button', { name: 'Go to slide 3' })).toHaveAttribute('aria-current', 'true');
  });

  test('vertical: the slides stack in the given height, and ArrowDown steps', async () => {
    const { container, getByRole } = render(() => (
      <Carousel aria-label="Photos" orientation="vertical" style={{ height: '120px', width: '300px' }}>
        {slides(3)}
      </Carousel>
    ));
    await until(() => getByRole('group', { name: '1 of 3' }) !== null);
    const viewport = container.querySelector('[data-slot="carousel-viewport"]')!;
    const second = getByRole('group', { name: '2 of 3' });

    expect(viewport.getBoundingClientRect().height).toBeCloseTo(120, 0);
    expect(offset(second, viewport, 'y')).toBeCloseTo(120, 0);

    getByRole('button', { name: 'Next slide' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    await until(() => Math.abs(offset(second, viewport, 'y')) < 1);
  });

  test('loop: previous from the first slide goes to the last', async () => {
    const onSlideChange: number[] = [];
    const { getByRole } = render(() => (
      <Carousel aria-label="Photos" loop onSlideChange={(index) => onSlideChange.push(index)} style={{ width: '300px' }}>
        {slides(3)}
      </Carousel>
    ));
    await until(() => getByRole('group', { name: '1 of 3' }) !== null);

    await userEvent.click(getByRole('button', { name: 'Previous slide' }));

    expect(onSlideChange).toEqual([2]);
  });
});
