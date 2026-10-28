import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { afterEach, describe, expect, test, vi, type Mock } from 'vitest';
import type { EmblaOptionsType } from 'embla-carousel';
import { expectHydration } from '../../test/ssr';
import { NO_DIAGNOSTICS } from '../../test/diagnostics';
import { Carousel } from './carousel';

interface FakeEngine {
  options: Record<string, unknown>;
  plugins: unknown[];
  destroyed: boolean;
  on: (event: string, listener: (api: unknown) => void) => FakeEngine;
  off: () => FakeEngine;
  selectedScrollSnap: () => number;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
  scrollSnapList: () => number[];
  slideNodes: () => HTMLElement[];
  scrollTo: Mock<(index: number) => void>;
  scrollNext: Mock<() => void>;
  scrollPrev: Mock<() => void>;
  reInit: Mock<(options: Record<string, unknown>) => void>;
  destroy: () => void;
}

// jsdom lays nothing out, so the engine can't measure anything: a stand-in steps through one snap per slide and
// emits the events the carousel listens to. The real engine is tested in the browser project.
const fake = vi.hoisted(() => {
  type Listener = () => void;
  const engines: FakeEngine[] = [];
  function create(root: HTMLElement, options: Record<string, unknown> = {}, plugins: unknown[] = []): FakeEngine {
    const listeners: Record<string, Listener[]> = {};
    const slides = () => Array.from(root.firstElementChild!.children) as HTMLElement[];
    let index = (options.startIndex as number) ?? 0;
    const emit = (event: string) => listeners[event]?.forEach((listener) => listener());
    const last = () => slides().length - 1;
    const engine: FakeEngine = {
      options,
      plugins,
      destroyed: false,
      on(event: string, listener: (api: unknown) => void) {
        (listeners[event] ??= []).push(() => listener(engine));
        return engine;
      },
      off: () => engine,
      selectedScrollSnap: () => index,
      canScrollPrev: () => !!engine.options.loop || index > 0,
      canScrollNext: () => !!engine.options.loop || index < last(),
      scrollSnapList: () => slides().map((_, i) => i),
      slideNodes: slides,
      scrollTo: vi.fn((next: number) => {
        index = next;
        emit('select');
      }),
      scrollNext: vi.fn(() => {
        index = index === last() ? 0 : index + 1;
        emit('select');
      }),
      scrollPrev: vi.fn(() => {
        index = index === 0 ? last() : index - 1;
        emit('select');
      }),
      reInit: vi.fn((next: Record<string, unknown>) => {
        engine.options = next;
        emit('reInit');
      }),
      destroy: () => {
        engine.destroyed = true;
      },
    };
    engines.push(engine);
    return engine;
  }
  return { engines, create };
});

vi.mock('embla-carousel', () => ({ default: fake.create }));

const engine = () => fake.engines.at(-1)!;

const slides = (count = 3) => Array.from({ length: count }, (_, index) => <Carousel.Slide>Slide {index + 1}</Carousel.Slide>);

afterEach(() => {
  fake.engines.length = 0;
  vi.restoreAllMocks();
});

describe('<Carousel />', () => {
  test('a named section of slides, each a group named by its place once the engine runs', () => {
    const { getByRole, getAllByRole, container } = render(() => (
      <Carousel aria-label="Featured" class="mine">
        {slides()}
      </Carousel>
    ));
    flush();
    const root = container.querySelector('section')!;

    expect(root).toHaveClass('slp-carousel', 'mine');
    expect(root).toHaveAttribute('aria-roledescription', 'carousel');
    expect(root).toHaveAttribute('aria-label', 'Featured');
    expect(root).toHaveAttribute('data-orientation', 'horizontal');
    const groups = getAllByRole('group');
    expect(groups.map((group) => group.getAttribute('aria-label'))).toEqual(['1 of 3', '2 of 3', '3 of 3']);
    expect(groups[0]).toHaveAttribute('aria-roledescription', 'slide');
    expect(groups[0]).toHaveClass('slp-carousel-slide');
    const containerEl = container.querySelector('[data-slot="carousel-container"]')!;
    expect(containerEl).toHaveAttribute('aria-live', 'polite');
    expect(getByRole('button', { name: 'Next slide' })).toHaveAttribute('aria-controls', containerEl.id);
    expect(getByRole('button', { name: 'Previous slide' })).toHaveAttribute('aria-disabled', 'true');
  });

  test('the engine starts on the viewport with the props as options; emblaOptions win', () => {
    const plugin = { name: 'test' };
    render(() => (
      <Carousel
        aria-label="Photos"
        orientation="vertical"
        align="center"
        loop
        slidesToScroll="auto"
        dragFree
        draggable={false}
        initialSlide={1}
        emblaOptions={{ duration: 40, align: 'end' }}
        plugins={[plugin as never]}
      >
        {slides()}
      </Carousel>
    ));
    flush();

    expect(engine().options).toEqual({
      axis: 'y',
      align: 'end',
      loop: true,
      slidesToScroll: 'auto',
      dragFree: true,
      watchDrag: false,
      duration: 40,
      startIndex: 1,
    });
    expect(engine().plugins).toEqual([plugin]);
  });

  test('the buttons step through the slides; at the ends they turn aria-disabled; onSlideChange', () => {
    const onSlideChange = vi.fn();
    const { getByRole } = render(() => (
      <Carousel aria-label="Photos" onSlideChange={onSlideChange}>
        {slides()}
      </Carousel>
    ));
    flush();
    const previous = getByRole('button', { name: 'Previous slide' });
    const next = getByRole('button', { name: 'Next slide' });

    fireEvent.click(next);
    flush();
    expect(onSlideChange).toHaveBeenLastCalledWith(1);
    expect(previous).not.toHaveAttribute('aria-disabled');
    expect(previous).not.toBeDisabled();

    fireEvent.click(next);
    flush();
    expect(next).toHaveAttribute('aria-disabled', 'true');
    expect(next).toHaveAttribute('data-disabled', '');
    fireEvent.click(next);
    expect(engine().scrollNext).toHaveBeenCalledTimes(2);

    fireEvent.click(previous);
    flush();
    expect(engine().scrollPrev).toHaveBeenCalledTimes(1);
    expect(onSlideChange).toHaveBeenLastCalledWith(1);
  });

  test('loop: both buttons stay enabled', () => {
    const { getByRole } = render(() => (
      <Carousel aria-label="Photos" loop>
        {slides()}
      </Carousel>
    ));
    flush();

    expect(getByRole('button', { name: 'Previous slide' })).not.toHaveAttribute('aria-disabled');
  });

  test('indicators: one per step, the current one marked, a click scrolls to it', () => {
    const { getAllByRole } = render(() => (
      <Carousel aria-label="Photos" withIndicators withControls={false}>
        {slides()}
      </Carousel>
    ));
    flush();
    const indicators = getAllByRole('button');

    expect(indicators.map((button) => button.getAttribute('aria-label'))).toEqual([
      'Go to slide 1',
      'Go to slide 2',
      'Go to slide 3',
    ]);
    expect(indicators[0]).toHaveAttribute('aria-current', 'true');

    fireEvent.click(indicators[2]);
    flush();
    expect(engine().scrollTo).toHaveBeenCalledWith(2);
    expect(indicators[0]).not.toHaveAttribute('aria-current');
    expect(indicators[2]).toHaveAttribute('aria-current', 'true');
    expect(indicators[2]).toHaveAttribute('data-active', '');
  });

  test('the arrow keys step, along the orientation; not while typing', () => {
    const { container, getByRole } = render(() => (
      <>
        <Carousel aria-label="Across">{slides()}</Carousel>
        <Carousel aria-label="Down" orientation="vertical">
          <Carousel.Slide>
            <input aria-label="Note" />
          </Carousel.Slide>
          <Carousel.Slide>Two</Carousel.Slide>
        </Carousel>
      </>
    ));
    flush();
    const [across, down] = fake.engines;
    const [first, second] = container.querySelectorAll('section');

    fireEvent.keyDown(first, { key: 'ArrowRight' });
    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(across.scrollNext).toHaveBeenCalledTimes(1);
    expect(across.scrollPrev).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(second, { key: 'ArrowDown' });
    fireEvent.keyDown(second, { key: 'ArrowRight' });
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowUp' });
    expect(down.scrollNext).toHaveBeenCalledTimes(1);
    expect(down.scrollPrev).not.toHaveBeenCalled();
  });

  test('changed options go to the running engine; unmounting destroys it', () => {
    const [loop, setLoop] = createSignal(false);
    const { unmount } = render(() => (
      <Carousel aria-label="Photos" loop={loop()}>
        {slides()}
      </Carousel>
    ));
    flush();

    setLoop(true);
    flush();
    expect(fake.engines).toHaveLength(1);
    expect(engine().reInit).toHaveBeenCalledWith(expect.objectContaining({ loop: true }) as EmblaOptionsType);

    unmount();
    expect(engine().destroyed).toBe(true);
  });

  test('apiRef gets the engine', () => {
    const apiRef = vi.fn();
    render(() => (
      <Carousel aria-label="Photos" apiRef={apiRef}>
        {slides()}
      </Carousel>
    ));
    flush();

    expect(apiRef).toHaveBeenCalledWith(engine());
  });

  test('every built-in string is a prop', () => {
    const { getByRole, getAllByRole, container } = render(() => (
      <Carousel
        aria-label="Fotos"
        withIndicators
        previousLabel="Vorige"
        nextLabel="Volgende"
        indicatorLabel={(index, count) => `Naar ${index + 1}/${count}`}
        slideLabel={(index, count) => `Dia ${index + 1} van ${count}`}
        roleDescription="diavoorstelling"
        slideRoleDescription="dia"
      >
        {slides(2)}
      </Carousel>
    ));
    flush();

    expect(container.querySelector('section')).toHaveAttribute('aria-roledescription', 'diavoorstelling');
    expect(getAllByRole('group')[1]).toHaveAttribute('aria-label', 'Dia 2 van 2');
    expect(getAllByRole('group')[1]).toHaveAttribute('aria-roledescription', 'dia');
    expect(getByRole('button', { name: 'Vorige' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Volgende' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Naar 2/2' })).toBeInTheDocument();
  });

  test('slide size and gap set the layout variables', () => {
    const { container } = render(() => (
      <Carousel aria-label="Photos" slideSize="50%" slideGap={4}>
        {slides()}
      </Carousel>
    ));
    const root = container.querySelector('section')!;

    expect(root.style.getPropertyValue('--_carousel-slide-size')).toBe('50%');
    expect(root.style.getPropertyValue('--_carousel-slide-gap')).toBe('calc(var(--slp-spacing) * 4)');
  });

  test('a slide throws outside a Carousel', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(() => <Carousel.Slide>x</Carousel.Slide>)).toThrow(
      '<Carousel.Slide> must be rendered inside <Carousel>.',
    );
  });

  test('stepping re-renders only what changes, without diagnostics', async () => {
    const { getByRole } = render(() => (
      <Carousel aria-label="Photos" withIndicators>
        {slides(5)}
      </Carousel>
    ));
    flush();
    const next = getByRole('button', { name: 'Next slide' });

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.click(next);
        flush();
      },
      { scenario: 'carousel-next' },
    );

    expect(getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute('aria-current', 'true');
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
    expect(artifact).toStayWithinRerunBudget(8);
  });

  test('has no axe violations', async () => {
    const { container } = render(() => (
      <>
        <Carousel aria-label="Photos" withIndicators>
          {slides()}
        </Carousel>
        <Carousel aria-label="Vertical" orientation="vertical" loop style={{ height: '200px' }}>
          {slides(2)}
        </Carousel>
      </>
    ));
    flush();
    fireEvent.click(container.querySelector('[data-slot="carousel-next"]')!);
    flush();

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    // The hydrated half runs the real engine in this jsdom window, which lacks the observers and media queries it
    // calls: stand-ins that never fire. It measures nothing, which doesn't matter for hydration.
    class Observer {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal('ResizeObserver', Observer);
    vi.stubGlobal('IntersectionObserver', Observer);
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    await expectHydration('./carousel.fixtures.tsx', 'carousels');
    vi.unstubAllGlobals();
  });
});
