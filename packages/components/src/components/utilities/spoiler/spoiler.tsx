import { createSignal, createUniqueId, flush, omit, onSettled, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './spoiler.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { Anchor } from '../../typography/anchor';

export interface SpoilerOwnProps {
  /** Height of the content while it's collapsed, in px. Defaults to 100. */
  maxHeight?: number;
  /** Whether it's expanded, for a controlled spoiler. */
  expanded?: boolean;
  /** Whether it starts expanded, for an uncontrolled one. Read once. */
  defaultExpanded?: boolean;
  /** Called when the control is pressed, or focus goes to content below the fold, with the state it asks for. */
  onChange?: (expanded: boolean) => void;
  /** The control's text while collapsed. Defaults to `Show more`. */
  showLabel?: string;
  /** The control's text while expanded. Defaults to `Show less`. */
  hideLabel?: string;
}

export type SpoilerProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, SpoilerOwnProps>;

/**
 * Content cut to a height, with a control under it that shows the rest and hides it again. The control is there only
 * while the content is taller than `maxHeight`; the height animates in CSS. Uncontrolled by default; pass `expanded`
 * and `onChange` to control it.
 */
export function Spoiler(props: SpoilerProps) {
  const others = omit(
    props,
    'class',
    'style',
    'children',
    'maxHeight',
    'expanded',
    'defaultExpanded',
    'onChange',
    'showLabel',
    'hideLabel',
  );
  const contentId = createUniqueId();
  let content: HTMLDivElement | undefined;
  let body: HTMLDivElement | undefined;

  const [own, setOwn] = createSignal(
    untrack(() => !!props.defaultExpanded),
    { name: 'Spoiler.expanded' },
  );
  const expanded = () => props.expanded ?? own();
  const setExpanded = (next: boolean) => {
    if (props.expanded === undefined) setOwn(next);
    props.onChange?.(next);
    flush();
  };

  // Until it's measured, the content counts as taller than maxHeight: the server render then shows the control, so
  // the cut content can be reached as soon as the page is interactive.
  const [overflowing, setOverflowing] = createSignal(true, { name: 'Spoiler.overflowing' });
  const maxHeight = () => props.maxHeight ?? 100;

  // The full height is what the expanded content's max-height animates to; it's written straight to the element.
  const measure = () => {
    if (!content || !body) return;
    const height = body.offsetHeight;
    content.style.setProperty('--_spoiler-full', `${height}px`);
    setOverflowing(height > maxHeight() + 1);
  };

  onSettled(() => {
    measure();
    if (!body || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    return () => observer.disconnect();
  });

  // Focus on something below the fold would be invisible: show it instead.
  const onFocusIn = (event: FocusEvent) => {
    if (expanded() || !overflowing() || !content) return;
    const target = (event.target as Element).getBoundingClientRect();
    if (target.bottom > content.getBoundingClientRect().bottom + 1) setExpanded(true);
  };

  return (
    <div
      data-expanded={expanded() ? '' : undefined}
      data-overflowing={overflowing() ? '' : undefined}
      class={joinClass(['slp-spoiler', style.spoiler], props.class)}
      style={{ '--_spoiler-max': `${maxHeight()}px`, ...props.style }}
      {...others}
    >
      <div
        ref={(el: HTMLDivElement) => (content = el)}
        id={contentId}
        data-slot="spoiler-content"
        class={style.content}
        onFocusIn={onFocusIn}
      >
        <div ref={(el: HTMLDivElement) => (body = el)} data-slot="spoiler-body">
          {props.children}
        </div>
      </div>
      <Anchor
        as="button"
        type="button"
        underline="hover"
        aria-expanded={expanded() ? 'true' : 'false'}
        aria-controls={contentId}
        data-slot="spoiler-control"
        class={style.control}
        onClick={() => setExpanded(!expanded())}
      >
        {expanded() ? (props.hideLabel ?? 'Show less') : (props.showLabel ?? 'Show more')}
      </Anchor>
    </div>
  );
}
