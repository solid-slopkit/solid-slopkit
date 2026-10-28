import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { Affix, type AffixProps } from './affix';

function setup(props: Partial<AffixProps> = {}, parentStyle: Record<string, string> = {}) {
  const onClick = vi.fn();
  const result = render(() => (
    <div style={{ height: '3000px', ...parentStyle }}>
      <Affix data-testid="affix" {...props}>
        <button style={{ width: '120px', height: '40px' }} onClick={onClick}>
          Back to top
        </button>
      </Affix>
    </div>
  ));
  const affix = () => result.getByTestId('affix');
  const box = () => affix().getBoundingClientRect();
  return { ...result, affix, box, onClick };
}

const viewport = () => ({ width: document.documentElement.clientWidth, height: window.innerHeight });

describe('<Affix /> in a browser', () => {
  test('in the top layer, as big as its content, 20px from the bottom right corner', () => {
    const { affix, box } = setup();

    expect(affix().matches(':popover-open')).toBe(true);
    expect([Math.round(box().width), Math.round(box().height)]).toEqual([120, 40]);
    expect(Math.round(viewport().width - box().right)).toBe(20);
    expect(Math.round(viewport().height - box().bottom)).toBe(20);
  });

  test('stays put while the page scrolls, and its content can be clicked', async () => {
    const { box, onClick, getByText } = setup();
    const before = box().top;

    window.scrollTo(0, 800);
    expect(box().top).toBe(before);
    await userEvent.click(getByText('Back to top'));
    expect(onClick).toHaveBeenCalledTimes(1);
    window.scrollTo(0, 0);
  });

  test('stays fixed to the viewport inside a transformed, clipped parent', () => {
    const { box } = setup({ position: 'top-left', offset: 8 }, { transform: 'translateX(40px)', overflow: 'hidden' });

    expect([Math.round(box().left), Math.round(box().top)]).toEqual([8, 8]);
  });

  test.each([
    ['top-right', (box: DOMRect) => [Math.round(viewport().width - box.right), Math.round(box.top)]],
    ['bottom-left', (box: DOMRect) => [Math.round(box.left), Math.round(viewport().height - box.bottom)]],
    [
      'bottom',
      (box: DOMRect) => [Math.round(box.left - (viewport().width - box.right)), Math.round(viewport().height - box.bottom)],
    ],
  ] as const)('at %s', (position, measure) => {
    const { box } = setup({ position, offset: 12 });

    const [first, second] = measure(box());
    expect(second).toBe(12);
    expect(first).toBe(position === 'bottom' ? 0 : 12);
  });
});
