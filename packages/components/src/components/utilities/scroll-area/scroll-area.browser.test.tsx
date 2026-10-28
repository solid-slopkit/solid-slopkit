import { render } from '@solidjs/testing-library';
import { createSignal, flush } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { ScrollArea, type ScrollAreaProps } from './scroll-area';

function pointer(el: Element, type: string, x: number, y: number) {
  el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, pointerId: 1 }));
}

/** A 200×100 area over 400px of content (a quarter of it visible), unless the content size is given. */
function setup(props: Partial<ScrollAreaProps> = {}, content: { width?: string; height?: string } = {}) {
  const result = render(() => (
    <ScrollArea data-testid="area" style={{ width: '200px', height: '100px' }} {...props}>
      <div style={{ width: content.width ?? 'auto', height: content.height ?? '400px' }}>Content</div>
    </ScrollArea>
  ));
  const area = () => result.getByTestId('area');
  const viewport = () => area().querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
  const bar = (orientation: 'vertical' | 'horizontal') =>
    area().querySelector(`[data-slot="scroll-area-scrollbar"][data-orientation="${orientation}"]`) as HTMLElement;
  const thumb = (orientation: 'vertical' | 'horizontal') => bar(orientation).firstElementChild as HTMLElement;
  const rect = (el: Element) => el.getBoundingClientRect();
  return { ...result, area, viewport, bar, thumb, rect };
}

const settle = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

describe('<ScrollArea /> in a browser', () => {
  test('hides the native scrollbars and draws one along the direction that overflows', async () => {
    const { area, viewport, bar } = setup();
    await settle();

    expect(viewport().offsetWidth - viewport().clientWidth).toBe(0);
    expect(area()).toHaveAttribute('data-overflow-y', '');
    expect(area()).not.toHaveAttribute('data-overflow-x');
    expect(getComputedStyle(bar('vertical')).display).toBe('block');
    expect(getComputedStyle(bar('horizontal')).display).toBe('none');
    expect(Math.round(bar('vertical').getBoundingClientRect().width)).toBe(10);
  });

  test('the viewport is a tab stop only while there is something to scroll', async () => {
    const { viewport } = setup();
    await settle();
    expect(viewport()).toHaveAttribute('tabindex', '0');

    const { viewport: short } = setup({}, { height: '50px' });
    await settle();
    expect(short()).not.toHaveAttribute('tabindex');
  });

  test('the thumb is the visible share of the track and follows the scroll', async () => {
    const { viewport, bar, thumb, rect } = setup({ type: 'always' });
    await settle();

    expect(rect(thumb('vertical')).height).toBeCloseTo(25, 0);
    expect(rect(thumb('vertical')).top - rect(bar('vertical')).top).toBeCloseTo(0, 0);

    viewport().scrollTop = 150;
    await settle();
    expect(rect(thumb('vertical')).top - rect(bar('vertical')).top).toBeCloseTo(37.5, 0);

    viewport().scrollTop = 300;
    await settle();
    expect(rect(thumb('vertical')).bottom).toBeCloseTo(rect(bar('vertical')).bottom, 0);
  });

  test('a thumb is at least 20px long', async () => {
    const { thumb, rect } = setup({ type: 'always' }, { height: '2000px' });
    await settle();

    expect(rect(thumb('vertical')).height).toBeCloseTo(20, 0);
  });

  test('dragging the thumb scrolls by the same share of the range', async () => {
    const { viewport, bar, thumb, rect } = setup({ type: 'always' });
    await settle();
    const start = rect(thumb('vertical'));
    const x = start.left + 4;

    pointer(thumb('vertical'), 'pointerdown', x, start.top + 5);
    expect(bar('vertical')).toHaveAttribute('data-dragging', '');
    pointer(bar('vertical'), 'pointermove', x, start.top + 35);
    // 30px of the thumb's 75px of travel is 40% of the 300px range.
    expect(viewport().scrollTop).toBeCloseTo(120, 0);
    pointer(bar('vertical'), 'pointermove', x, start.top + 500);
    expect(viewport().scrollTop).toBeCloseTo(300, 0);
    pointer(bar('vertical'), 'pointerup', x, start.top + 500);
    expect(bar('vertical')).not.toHaveAttribute('data-dragging');
  });

  test('a press on the track pages toward it', async () => {
    const { viewport, bar, rect } = setup({ type: 'always' });
    await settle();
    const track = rect(bar('vertical'));

    pointer(bar('vertical'), 'pointerdown', track.left + 4, track.bottom - 5);
    // 87.5% of the 100px it shows; the browser rounds the offset to whole pixels.
    expect(Math.abs(viewport().scrollTop - 87.5)).toBeLessThanOrEqual(0.5);
    pointer(bar('vertical'), 'pointerup', track.left + 4, track.bottom - 5);

    await settle();
    pointer(bar('vertical'), 'pointerdown', track.left + 4, track.top + 1);
    expect(viewport().scrollTop).toBeLessThanOrEqual(1);
  });

  test('a wheel over a scrollbar scrolls the content, and passes through at the end', async () => {
    const { viewport, bar } = setup({ type: 'always' });
    await settle();
    const wheel = (deltaY: number) => {
      const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY });
      bar('vertical').dispatchEvent(event);
      return event.defaultPrevented;
    };

    expect(wheel(100)).toBe(true);
    expect(viewport().scrollTop).toBe(100);
    viewport().scrollTop = 300;
    expect(wheel(100)).toBe(false);
  });

  test('the keyboard scrolls the focused viewport', async () => {
    const { viewport } = setup();
    await settle();

    await userEvent.tab();
    expect(viewport()).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect.poll(() => viewport().scrollTop).toBe(300);
  });

  test('with max-height it grows with its content up to that height', async () => {
    const [height, setHeight] = createSignal(50);
    const { getByTestId } = render(() => (
      <ScrollArea data-testid="area" style={{ 'max-height': '100px' }}>
        <div style={{ height: `${height()}px` }} />
      </ScrollArea>
    ));
    const area = getByTestId('area');
    await settle();
    expect(area.getBoundingClientRect().height).toBe(50);
    expect(area).not.toHaveAttribute('data-overflow-y');

    setHeight(400);
    flush();
    await expect.poll(() => area.hasAttribute('data-overflow-y')).toBe(true);
    expect(area.getBoundingClientRect().height).toBe(100);
  });

  test('both directions: the scrollbars leave the corner to each other', async () => {
    const { area, bar, rect } = setup({ type: 'always' }, { width: '600px' });
    await settle();

    expect(area()).toHaveAttribute('data-overflow-x', '');
    expect(area()).toHaveAttribute('data-overflow-y', '');
    expect(rect(area()).bottom - rect(bar('vertical')).bottom).toBeCloseTo(10, 0);
    expect(rect(area()).right - rect(bar('horizontal')).right).toBeCloseTo(10, 0);
  });

  test('scrollbars="y" clips the overflow across and draws no horizontal scrollbar', async () => {
    const { area, viewport } = setup({ scrollbars: 'y' }, { width: '600px' });
    await settle();

    expect(area()).not.toHaveAttribute('data-overflow-x');
    expect(getComputedStyle(viewport()).overflowX).toBe('hidden');
  });

  test('offsetScrollbars pads the content on the side of a shown scrollbar', async () => {
    const { viewport, getByText } = setup({ offsetScrollbars: true, scrollbarSize: 8 });
    await settle();

    expect(getComputedStyle(viewport()).paddingRight).toBe('8px');
    expect(getComputedStyle(viewport()).paddingBottom).toBe('0px');
    expect(getByText('Content').getBoundingClientRect().width).toBe(192);
  });

  test('type="hover" shows them while the pointer is over it, and hides them after the delay', async () => {
    const { area, bar } = setup({ scrollHideDelay: 0 });
    // The mouse stays where an earlier test left it, which may be over the area.
    await userEvent.unhover(area());
    await expect.poll(() => getComputedStyle(bar('vertical')).visibility).toBe('hidden');

    await userEvent.hover(area());
    expect(getComputedStyle(bar('vertical')).visibility).toBe('visible');

    await userEvent.unhover(area());
    await expect.poll(() => getComputedStyle(bar('vertical')).visibility).toBe('hidden');
  });

  test('type="scroll" shows them only while it scrolls', async () => {
    const { area, viewport, bar } = setup({ type: 'scroll', scrollHideDelay: 0 });
    await settle();

    await userEvent.hover(area());
    expect(getComputedStyle(bar('vertical')).visibility).toBe('hidden');

    viewport().scrollTop = 50;
    await expect.poll(() => area().hasAttribute('data-scrolling')).toBe(true);
    expect(getComputedStyle(bar('vertical')).visibility).toBe('visible');
    await expect.poll(() => area().hasAttribute('data-scrolling')).toBe(false);
  });

  test('type="never" draws none, and it still scrolls', async () => {
    const { viewport, bar } = setup({ type: 'never' });
    await settle();

    expect(getComputedStyle(bar('vertical')).display).toBe('none');
    viewport().scrollTop = 100;
    expect(viewport().scrollTop).toBe(100);
  });
});
