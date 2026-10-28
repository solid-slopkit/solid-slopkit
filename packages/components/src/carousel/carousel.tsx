import {
  createContext,
  createEffect,
  createProjection,
  createSignal,
  createUniqueId,
  For,
  omit,
  onCleanup,
  Show,
  untrack,
  useContext,
} from 'solid-js';
import { type JSX } from '@solidjs/web';
import EmblaCarousel, { type EmblaCarouselType, type EmblaOptionsType, type EmblaPluginType } from 'embla-carousel';
import style from './carousel.module.css';
import { callHandler, type ElementProps } from '../utils';
import { joinClass } from '../style-props';
import { ActionIcon } from '../components/button/action-icon';

export type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType };

export type CarouselOrientation = 'horizontal' | 'vertical';

export type CarouselAlign = 'start' | 'center' | 'end';

export interface CarouselOwnProps {
  /** The slides: Carousel.Slide elements. */
  children?: JSX.Element;
  /** Which way the slides run. A vertical carousel needs a height. Defaults to `horizontal`. */
  orientation?: CarouselOrientation;
  /** Size of each slide along the carousel, as a CSS length or percentage of it. Defaults to `100%`. */
  slideSize?: string;
  /** Space between slides, in spacing units. Defaults to 0. */
  slideGap?: number;
  /** Where a slide rests when it's the selected one. Defaults to `start`. */
  align?: CarouselAlign;
  /** Goes from the last slide on to the first, and back. */
  loop?: boolean;
  /** How many slides one step moves, or `auto` for as many as fit. Defaults to 1. */
  slidesToScroll?: number | 'auto';
  /** A drag glides on and stops anywhere, instead of resting on a slide. */
  dragFree?: boolean;
  /** Slides can be dragged with the pointer. Defaults to `true`. */
  draggable?: boolean;
  /** The slide shown first. Defaults to 0. Read once. */
  initialSlide?: number;
  /** More options for the carousel engine; they win over the props above. */
  emblaOptions?: EmblaOptionsType;
  /** Engine plugins, e.g. autoplay. Read once. */
  plugins?: EmblaPluginType[];
  /** Gets the engine's API once it's running in the browser, to scroll from your own controls. */
  apiRef?: (api: EmblaCarouselType) => void;
  /** Called with the index of the selected step when it changes. */
  onSlideChange?: (index: number) => void;
  /** Shows previous and next buttons over the slides. Defaults to `true`. */
  withControls?: boolean;
  /** Shows a button per step under the slides, the current one marked. Defaults to `false`. */
  withIndicators?: boolean;
  /** Accessible name of the previous button. Defaults to `'Previous slide'`. */
  previousLabel?: string;
  /** Accessible name of the next button. Defaults to `'Next slide'`. */
  nextLabel?: string;
  /** Accessible name of an indicator. Defaults to `Go to slide 2`. */
  indicatorLabel?: (index: number, count: number) => string;
  /** Accessible name of a slide. Defaults to `2 of 5`. */
  slideLabel?: (index: number, count: number) => string;
  /** What assistive tech calls the carousel. Defaults to `'carousel'`. */
  roleDescription?: string;
  /** What assistive tech calls a slide. Defaults to `'slide'`. */
  slideRoleDescription?: string;
}

export type CarouselProps = ElementProps<JSX.HTMLAttributes<HTMLElement>, CarouselOwnProps>;

interface CarouselContextValue {
  /** The slide elements, in order, once the engine runs. */
  slides: () => readonly HTMLElement[];
  slideLabel: (index: number, count: number) => string;
  roleDescription: () => string;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

const editable = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

// Functions, so each button gets its own elements.
const icons = {
  previous: () => <path d="m15 18-6-6 6-6" />,
  next: () => <path d="m9 18 6-6-6-6" />,
};

function ControlIcon(props: { control: keyof typeof icons }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {icons[props.control]()}
    </svg>
  );
}

/**
 * Slides in a row (or a column) that the user moves through by dragging, with the previous and next buttons, the
 * arrow keys, or the indicators. A `section` with `aria-roledescription="carousel"`; name it with `aria-label`. The
 * slides lay out with CSS on the server; the engine, `embla-carousel`, starts in the browser.
 */
export function Carousel(props: CarouselProps) {
  const others = omit(
    props,
    'class',
    'style',
    'children',
    'orientation',
    'slideSize',
    'slideGap',
    'align',
    'loop',
    'slidesToScroll',
    'dragFree',
    'draggable',
    'initialSlide',
    'emblaOptions',
    'plugins',
    'apiRef',
    'onSlideChange',
    'withControls',
    'withIndicators',
    'previousLabel',
    'nextLabel',
    'indicatorLabel',
    'slideLabel',
    'roleDescription',
    'slideRoleDescription',
    'onKeyDown',
  );
  const containerId = `slp-carousel-${createUniqueId()}`;
  const plugins = untrack(() => props.plugins);
  const initialSlide = untrack(() => props.initialSlide ?? 0);
  const vertical = () => props.orientation === 'vertical';
  let viewport: HTMLDivElement | undefined;
  let api: EmblaCarouselType | undefined;

  const [selected, setSelected] = createSignal(initialSlide, { name: 'Carousel.selected' });
  const [canPrevious, setCanPrevious] = createSignal(!!untrack(() => props.loop) || initialSlide > 0, {
    name: 'Carousel.canPrevious',
  });
  const [canNext, setCanNext] = createSignal(true, { name: 'Carousel.canNext' });
  const [snapCount, setSnapCount] = createSignal(0, { name: 'Carousel.snapCount' });
  const [slides, setSlides] = createSignal<readonly HTMLElement[]>([], { name: 'Carousel.slides' });

  // The selected step as a set of one key: a change re-runs only the two indicators it concerns.
  let previous = -1;
  const current = createProjection<Record<number, true>>(
    (draft) => {
      const next = selected();
      delete draft[previous];
      draft[next] = true;
      previous = next;
    },
    {},
    { name: 'Carousel.current' },
  );

  const syncSelection = (engine: EmblaCarouselType) => {
    setSelected(engine.selectedScrollSnap());
    setCanPrevious(engine.canScrollPrev());
    setCanNext(engine.canScrollNext());
  };

  const syncSlides = (engine: EmblaCarouselType) => {
    setSnapCount(engine.scrollSnapList().length);
    setSlides(engine.slideNodes());
    syncSelection(engine);
  };

  // Starts the engine in the browser, and hands it the options again when they change.
  createEffect(
    () => ({
      axis: vertical() ? ('y' as const) : ('x' as const),
      align: props.align ?? 'start',
      loop: !!props.loop,
      slidesToScroll: props.slidesToScroll ?? 1,
      dragFree: !!props.dragFree,
      watchDrag: props.draggable ?? true,
      ...props.emblaOptions,
    }),
    (options) => {
      if (!viewport) return;
      if (api) {
        api.reInit(options);
        return;
      }
      const engine = EmblaCarousel(viewport, { ...options, startIndex: initialSlide }, plugins);
      api = engine;
      engine.on('reInit', syncSlides);
      // oxlint-disable-next-line solid/reactivity -- an engine event: it reads the callback when it fires
      engine.on('select', () => {
        syncSelection(engine);
        props.onSlideChange?.(engine.selectedScrollSnap());
      });
      syncSlides(engine);
      untrack(() => props.apiRef)?.(engine);
    },
    { name: 'Carousel.engine' },
  );
  onCleanup(() => api?.destroy());

  const onKeyDown = (event: KeyboardEvent) => {
    callHandler(props.onKeyDown, event);
    if (event.defaultPrevented || !api || editable(event.target)) return;
    const back = vertical() ? 'ArrowUp' : 'ArrowLeft';
    const forward = vertical() ? 'ArrowDown' : 'ArrowRight';
    if (event.key !== back && event.key !== forward) return;
    event.preventDefault();
    if (event.key === back) api.scrollPrev();
    else api.scrollNext();
  };

  const context: CarouselContextValue = {
    slides,
    slideLabel: (index, count) => props.slideLabel?.(index, count) ?? `${index + 1} of ${count}`,
    roleDescription: () => props.slideRoleDescription ?? 'slide',
  };

  const control = (which: 'previous' | 'next') => {
    const enabled = () => (which === 'previous' ? canPrevious() : canNext());
    return (
      <ActionIcon
        variant="solid"
        shape="circle"
        size="sm"
        data-slot={`carousel-${which}`}
        class={style.control}
        label={which === 'previous' ? (props.previousLabel ?? 'Previous slide') : (props.nextLabel ?? 'Next slide')}
        aria-controls={containerId}
        // Not `disabled`: a button that disables itself at the end would drop the focus.
        aria-disabled={enabled() ? undefined : 'true'}
        data-disabled={enabled() ? undefined : ''}
        onClick={() => {
          if (!enabled()) return;
          if (which === 'previous') api?.scrollPrev();
          else api?.scrollNext();
        }}
      >
        <ControlIcon control={which} />
      </ActionIcon>
    );
  };

  return (
    <section
      aria-roledescription={props.roleDescription ?? 'carousel'}
      data-orientation={vertical() ? 'vertical' : 'horizontal'}
      class={joinClass(['slp-carousel', style.carousel], props.class)}
      style={{
        '--_carousel-slide-size': props.slideSize ?? '100%',
        '--_carousel-slide-gap': `calc(var(--slp-spacing) * ${props.slideGap ?? 0})`,
        ...props.style,
      }}
      {...others}
      onKeyDown={onKeyDown}
    >
      <div ref={(el) => (viewport = el)} data-slot="carousel-viewport" class={style.viewport}>
        <div id={containerId} data-slot="carousel-container" class={style.container} aria-live="polite">
          <CarouselContext value={context}>{props.children}</CarouselContext>
        </div>
      </div>
      <Show when={props.withControls ?? true}>
        <div data-slot="carousel-controls" class={style.controls}>
          {control('previous')}
          {control('next')}
        </div>
      </Show>
      <Show when={(props.withIndicators ?? false) && snapCount() > 1}>
        <div data-slot="carousel-indicators" class={style.indicators}>
          <For each={Array.from({ length: snapCount() }, (_, index) => index)}>
            {(index) => (
              <button
                type="button"
                data-slot="carousel-indicator"
                class={style.indicator}
                aria-label={props.indicatorLabel?.(index, snapCount()) ?? `Go to slide ${index + 1}`}
                aria-controls={containerId}
                aria-current={current[index] === true ? 'true' : undefined}
                data-active={current[index] === true ? '' : undefined}
                onClick={() => api?.scrollTo(index)}
              />
            )}
          </For>
        </div>
      </Show>
    </section>
  );
}

export type CarouselSlideProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>>;

/** One slide: a `div` with `role="group"`, named `2 of 5` once the carousel runs. */
export function CarouselSlide(props: CarouselSlideProps) {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('<Carousel.Slide> must be rendered inside <Carousel>.');
  const others = omit(props, 'class');
  let element: HTMLDivElement | undefined;

  const label = () => {
    const list = context.slides();
    const index = element ? list.indexOf(element) : -1;
    return index < 0 ? undefined : context.slideLabel(index, list.length);
  };

  return (
    <div
      ref={(el) => (element = el)}
      role="group"
      aria-roledescription={context.roleDescription()}
      aria-label={label()}
      data-slot="carousel-slide"
      class={joinClass(['slp-carousel-slide', style.slide], props.class)}
      {...others}
    />
  );
}

Carousel.Slide = CarouselSlide;
