import { render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import type { JSX } from '@solidjs/web';
import { createEffect, createSignal, flush, untrack } from 'solid-js';
import { describe, expect, onTestFinished, test } from 'vitest';
import { createFloating, type FloatingOptions, type FloatingPlacement } from './create-floating';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';

// Rounded, since positions come out fractional.
const box = (el: Element) => {
  const { left, top, right, bottom, width } = el.getBoundingClientRect();
  return {
    left: Math.round(left),
    top: Math.round(top),
    right: Math.round(right),
    bottom: Math.round(bottom),
    width: Math.round(width),
  };
};

interface HarnessProps extends Partial<Omit<FloatingOptions, 'reference' | 'floating' | 'arrow' | 'open'>> {
  open: () => boolean;
  anchorStyle?: JSX.CSSProperties;
  floatingWidth?: number;
  withArrow?: boolean;
  onFloating?: (floating: ReturnType<typeof createFloating>) => void;
}

/** An anchor and a manual popover that's shown while `open` is true. */
function Harness(props: HarnessProps) {
  let anchor: HTMLButtonElement | undefined;
  let floatingEl: HTMLDivElement | undefined;
  let arrowEl: HTMLDivElement | undefined;

  // Shown before it's positioned, the way an overlay component orders it.
  createEffect(
    () => props.open(),
    (open) => {
      if (open) floatingEl!.showPopover();
      else if (floatingEl!.matches(':popover-open')) floatingEl!.hidePopover();
    },
  );

  const floating = createFloating({
    ...props,
    reference: () => anchor,
    floating: () => floatingEl,
    arrow: untrack(() => props.withArrow) ? () => arrowEl : undefined,
  });
  untrack(() => props.onFloating)?.(floating);

  return (
    <>
      <button
        ref={(el) => (anchor = el)}
        data-testid="anchor"
        style={{ position: 'absolute', top: '200px', left: '150px', width: '80px', height: '30px', ...props.anchorStyle }}
      >
        Anchor
      </button>
      <div
        ref={(el) => (floatingEl = el)}
        popover="manual"
        data-testid="floating"
        data-placement={floating.placement()}
        style={{ width: `${props.floatingWidth ?? 100}px`, height: '40px', padding: '0', border: '0' }}
      >
        {props.withArrow && (
          <div ref={(el) => (arrowEl = el)} data-testid="arrow" style={{ position: 'absolute', width: '8px', height: '8px' }} />
        )}
      </div>
    </>
  );
}

const placed = (placement: FloatingPlacement, extra: Partial<HarnessProps> = {}) =>
  render(() => <Harness open={() => true} placement={() => placement} offset={() => 8} {...extra} />);

describe('createFloating', () => {
  test('bottom: below the anchor, past the offset, centered on it', async () => {
    const { getByTestId } = placed('bottom');
    const anchor = box(getByTestId('anchor'));

    await expect.poll(() => box(getByTestId('floating')).top).toBe(anchor.bottom + 8);
    expect(box(getByTestId('floating')).left).toBe(anchor.left + (80 - 100) / 2);
    expect(getByTestId('floating')).toHaveAttribute('data-placement', 'bottom');
  });

  test('top-start: above the anchor, starting edges lined up', async () => {
    const { getByTestId } = placed('top-start');
    const anchor = box(getByTestId('anchor'));

    await expect.poll(() => box(getByTestId('floating')).bottom).toBe(anchor.top - 8);
    expect(box(getByTestId('floating')).left).toBe(anchor.left);
  });

  test('right-end and left: beside the anchor', async () => {
    const right = placed('right-end');
    let anchor = box(right.getByTestId('anchor'));
    await expect.poll(() => box(right.getByTestId('floating')).left).toBe(anchor.right + 8);
    expect(box(right.getByTestId('floating')).bottom).toBe(anchor.bottom);
    right.unmount();

    const left = placed('left');
    anchor = box(left.getByTestId('anchor'));
    await expect.poll(() => box(left.getByTestId('floating')).right).toBe(anchor.left - 8);
  });

  test('flips to the other side when its own has no room, and reports the side it took', async () => {
    let floating!: ReturnType<typeof createFloating>;
    const { getByTestId } = placed('bottom', {
      anchorStyle: { position: 'fixed', top: 'auto', bottom: '10px' },
      onFloating: (f) => (floating = f),
    });
    const anchor = box(getByTestId('anchor'));

    await expect.poll(() => box(getByTestId('floating')).bottom).toBe(anchor.top - 8);
    expect(floating.placement()).toBe('top');
    expect(getByTestId('floating')).toHaveAttribute('data-placement', 'top');
  });

  test('flip off: stays on its side', async () => {
    const { getByTestId } = placed('bottom', {
      anchorStyle: { position: 'fixed', top: 'auto', bottom: '10px' },
      flip: () => false,
    });
    const anchor = box(getByTestId('anchor'));

    await expect.poll(() => box(getByTestId('floating')).top).toBe(anchor.bottom + 8);
  });

  test('shifts along its side to keep the padding from the viewport edge', async () => {
    const { getByTestId } = placed('bottom', { anchorStyle: { left: '0px' }, floatingWidth: 200, padding: () => 12 });

    await expect.poll(() => box(getByTestId('floating')).left).toBe(12);
  });

  test('sameWidth: as wide as the anchor', async () => {
    const { getByTestId } = placed('bottom-start', { sameWidth: () => true });

    await expect.poll(() => box(getByTestId('floating')).width).toBe(80);
  });

  test('the arrow points at the anchor center, kept off the corners by arrowPadding', async () => {
    const centered = placed('bottom-start', { withArrow: true });
    const anchor = box(centered.getByTestId('anchor'));
    // The arrow is 8px wide, so its center is 4px past its left edge.
    await expect.poll(() => box(centered.getByTestId('arrow')).left + 4).toBe(anchor.left + 40);
    centered.unmount();

    const padded = placed('bottom-start', {
      withArrow: true,
      anchorStyle: { width: '4px' },
      arrowPadding: () => 6,
    });
    await expect.poll(() => box(padded.getByTestId('arrow')).left - box(padded.getByTestId('floating')).left).toBe(6);
  });

  test('follows the anchor when it moves, and stops once closed', async () => {
    const [open, setOpen] = createSignal(true);
    const { getByTestId } = render(() => <Harness open={open} placement={() => 'bottom-start'} />);
    const anchorEl = getByTestId('anchor');
    const floatingEl = getByTestId('floating');
    await expect.poll(() => box(floatingEl).left).toBe(150);

    anchorEl.style.left = '170px';
    await expect.poll(() => box(floatingEl).left).toBe(170);

    setOpen(false);
    flush();
    anchorEl.style.left = '190px';
    window.dispatchEvent(new Event('resize'));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(floatingEl.style.left).toBe('170px');
  });

  test('a new placement repositions it while open', async () => {
    const [placement, setPlacement] = createSignal<FloatingPlacement>('bottom');
    const { getByTestId } = render(() => <Harness open={() => true} placement={placement} />);
    const anchor = box(getByTestId('anchor'));
    await expect.poll(() => box(getByTestId('floating')).top).toBe(anchor.bottom);

    setPlacement('top');
    flush();

    await expect.poll(() => box(getByTestId('floating')).bottom).toBe(anchor.top);
    expect(getByTestId('floating')).toHaveAttribute('data-placement', 'top');
  });

  describe('scrolling the window', () => {
    // Taller than the viewport, so the window scrolls. Added after rendering, below what's rendered.
    const tallPage = () => {
      const spacer = document.createElement('div');
      spacer.style.height = '3000px';
      document.body.append(spacer);
      onTestFinished(() => {
        spacer.remove();
        window.scrollTo(0, 0);
      });
    };

    // Read right after scrolling, before any scroll event: what the browser paints while the page scrolls off the
    // main thread. Only a position that already moves with the anchor stays lined up.
    const scrolledInSync = (getByTestId: (id: string) => HTMLElement) => {
      const tops: number[] = [];
      for (const y of [120, 260, 40]) {
        window.scrollTo(0, y);
        tops.push(box(getByTestId('floating')).top - box(getByTestId('anchor')).bottom);
      }
      return tops;
    };

    test('moves with an anchor in the page, in the same frame', async () => {
      const { getByTestId } = placed('bottom');
      tallPage();
      const anchor = box(getByTestId('anchor'));
      await expect.poll(() => box(getByTestId('floating')).top).toBe(anchor.bottom + 8);
      expect(getByTestId('floating').style.position).toBe('absolute');

      expect(scrolledInSync(getByTestId)).toEqual([8, 8, 8]);
    });

    test.each([
      ['fixed', { position: 'fixed' }],
      ['sticky', { position: 'sticky', top: '0px' }],
    ] as const)('stays put with a %s anchor, pinned to the viewport', async (_, anchorStyle) => {
      const { getByTestId, container } = placed('bottom', { anchorStyle });
      // A sticky element sticks only within its parent, so that has to stay on screen.
      container.style.height = '3000px';
      tallPage();
      await expect.poll(() => box(getByTestId('floating')).top).toBe(box(getByTestId('anchor')).bottom + 8);
      expect(getByTestId('floating').style.position).toBe('fixed');

      expect(scrolledInSync(getByTestId)).toEqual([8, 8, 8]);
    });

    test('stays lined up with an anchor in a scroll container once the window scrolls', async () => {
      const { getByTestId } = render(() => (
        <div style={{ 'margin-top': '100px', height: '150px', overflow: 'auto' }}>
          <div style={{ position: 'relative', height: '400px' }}>
            <Harness open={() => true} placement={() => 'bottom-start'} anchorStyle={{ top: '20px', left: '30px' }} />
          </div>
        </div>
      ));
      tallPage();
      await expect.poll(() => box(getByTestId('floating')).top).toBe(box(getByTestId('anchor')).bottom);

      expect(scrolledInSync(getByTestId)).toEqual([0, 0, 0]);
    });
  });

  test('hidden while the anchor is scrolled out of its container', async () => {
    const open = () => true;
    let scroller!: HTMLDivElement;
    let anchor!: HTMLButtonElement;
    let floatingEl!: HTMLDivElement;
    render(() => {
      createEffect(open, () => floatingEl.showPopover());
      createFloating({ reference: () => anchor, floating: () => floatingEl, open });
      return (
        <>
          <div ref={(el) => (scroller = el)} style={{ height: '100px', overflow: 'auto' }}>
            <button ref={(el) => (anchor = el)}>Anchor</button>
            <div style={{ height: '500px' }} />
          </div>
          <div ref={(el) => (floatingEl = el)} popover="manual">
            Floating
          </div>
        </>
      );
    });
    await expect.poll(() => floatingEl.style.top).not.toBe('');
    expect(floatingEl.style.visibility).toBe('');

    scroller.scrollTop = 300;

    await expect.poll(() => floatingEl.style.visibility).toBe('hidden');
  });

  test('opening and closing has no diagnostics', async () => {
    const [open, setOpen] = createSignal(false);
    render(() => <Harness open={open} />);
    flush();

    const { artifact } = await captureArtifact(
      async () => {
        setOpen(true);
        flush();
        await new Promise((resolve) => requestAnimationFrame(resolve));
        setOpen(false);
        flush();
      },
      { scenario: 'floating-open-close' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toStayWithinRerunBudget(2, { scope: /floating\.position/ });
  });
});
