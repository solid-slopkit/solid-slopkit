import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { flush } from 'solid-js';
import axe from 'axe-core';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { ScrollArea, type ScrollAreaProps } from './scroll-area';

function setup(props: Partial<ScrollAreaProps> = {}) {
  const result = render(() => (
    <ScrollArea data-testid="area" {...props}>
      <p>Content</p>
    </ScrollArea>
  ));
  const area = () => result.getByTestId('area');
  const slot = (name: string) => area().querySelector(`[data-slot="scroll-area-${name}"]`) as HTMLElement;
  return {
    ...result,
    area,
    viewport: () => slot('viewport'),
    bars: () => [...area().querySelectorAll('[data-slot="scroll-area-scrollbar"]')] as HTMLElement[],
  };
}

describe('<ScrollArea />', () => {
  afterEach(() => vi.useRealTimers());

  test('renders a root, a viewport with the content, and a scrollbar per direction', () => {
    const { area, viewport, bars, getByText } = setup({ class: 'mine' });

    expect(area().tagName).toBe('DIV');
    expect(area()).toHaveClass('slp-scroll-area', 'mine');
    expect(viewport().parentElement).toBe(area());
    expect(getByText('Content').parentElement).toHaveAttribute('data-slot', 'scroll-area-content');
    expect(getByText('Content').parentElement?.parentElement).toBe(viewport());
    expect(bars().map((bar) => bar.getAttribute('data-orientation'))).toEqual(['vertical', 'horizontal']);
    for (const bar of bars()) {
      expect(bar).toHaveAttribute('aria-hidden', 'true');
      expect(bar.firstElementChild).toHaveAttribute('data-slot', 'scroll-area-thumb');
    }
  });

  test('defaults: hover, both directions, 10px scrollbars, 800ms delay, nothing overflowing', () => {
    const { area, viewport } = setup();

    expect(area()).toHaveAttribute('data-type', 'hover');
    expect(area()).toHaveAttribute('data-scrollbars', 'xy');
    expect(area()).not.toHaveAttribute('data-offset-scrollbars');
    expect(area()).not.toHaveAttribute('data-overflow-x');
    expect(area()).not.toHaveAttribute('data-overflow-y');
    expect(area().style.getPropertyValue('--_scroll-area-size')).toBe('10px');
    expect(area().style.getPropertyValue('--_scroll-area-hide-delay')).toBe('800ms');
    expect(viewport()).not.toHaveAttribute('tabindex');
  });

  test('props become attributes and custom properties, and style merges', () => {
    const { area } = setup({
      type: 'always',
      scrollbars: 'y',
      scrollbarSize: 6,
      scrollHideDelay: 300,
      offsetScrollbars: true,
      style: { height: '100px' },
    });

    expect(area()).toHaveAttribute('data-type', 'always');
    expect(area()).toHaveAttribute('data-scrollbars', 'y');
    expect(area()).toHaveAttribute('data-offset-scrollbars', '');
    expect(area().style.getPropertyValue('--_scroll-area-size')).toBe('6px');
    expect(area().style.getPropertyValue('--_scroll-area-hide-delay')).toBe('300ms');
    expect(area().style.height).toBe('100px');
  });

  test('ref gets the root and viewportRef the viewport', () => {
    let root: HTMLDivElement | undefined;
    let scroller: HTMLDivElement | undefined;
    const { area, viewport } = setup({ ref: (el) => (root = el), viewportRef: (el) => (scroller = el) });

    expect(root).toBe(area());
    expect(scroller).toBe(viewport());
  });

  test('scrolling reports the position and marks it scrolling until it stops', () => {
    vi.useFakeTimers();
    const onScrollPositionChange = vi.fn();
    const { area, viewport } = setup({ onScrollPositionChange });

    viewport().scrollTop = 40;
    viewport().scrollLeft = 12;
    fireEvent.scroll(viewport());
    flush();
    expect(onScrollPositionChange).toHaveBeenLastCalledWith({ x: 12, y: 40 });
    expect(area()).toHaveAttribute('data-scrolling', '');

    vi.advanceTimersByTime(150);
    flush();
    expect(area()).not.toHaveAttribute('data-scrolling');
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <ScrollArea style={{ height: '50px' }}>
          <p>One</p>
        </ScrollArea>
        <ScrollArea type="always" scrollbars="x" offsetScrollbars>
          <p>Two</p>
        </ScrollArea>
      </>
    ));

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('scrolling has no diagnostics or waste, and re-runs only the scrolling attribute', async () => {
    vi.useFakeTimers();
    const { viewport } = setup();
    flush();

    const { artifact } = await captureArtifact(
      () => {
        for (let step = 1; step <= 5; step++) {
          viewport().scrollTop = step * 10;
          fireEvent.scroll(viewport());
          flush();
        }
        vi.advanceTimersByTime(150);
        flush();
      },
      { scenario: 'scroll-area-scroll' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(2);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./scroll-area.fixtures.tsx', 'scrollAreas');
  });
});
