import { createMemo, omit, Show } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './timeline.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor } from '../../../core';

export interface TimelineOwnProps {
  /** Color role of active bullets and the line between them. Defaults to `primary`. */
  color?: SlopColor;
}

export interface TimelineItemOwnProps {
  /** The event's heading. */
  title?: JSX.Element;
  /** Content of the bullet, such as an icon or a number. Without one, the bullet is a plain circle. */
  bullet?: JSX.Element;
  /** Marks the event as reached: a filled bullet, and a colored line to the next active event. */
  active?: boolean;
}

export type TimelineProps = ElementProps<JSX.OlHTMLAttributes<HTMLOListElement>, TimelineOwnProps>;
export type TimelineItemProps = ElementProps<JSX.LiHTMLAttributes<HTMLLIElement>, TimelineItemOwnProps>;

const hasContent = (value: JSX.Element) => value != null && value !== false;

/** One event: an `li` with a bullet on the line, a title and a description. */
export function TimelineItem(props: TimelineItemProps) {
  const others = omit(props, 'class', 'children', 'title', 'bullet', 'active');

  // Read once: a JSX prop is a getter that creates its elements on every read. Both are always shown when present.
  const title = createMemo(() => props.title, { name: 'Timeline.Item.title' });
  const bullet = createMemo(() => props.bullet, { name: 'Timeline.Item.bullet' });

  return (
    <li
      data-active={props.active ? '' : undefined}
      data-with-bullet={hasContent(bullet()) ? '' : undefined}
      class={joinClass(['slp-timeline-item', style.item], props.class)}
      {...others}
    >
      <span data-slot="timeline-item-bullet" class={style.bullet} aria-hidden="true">
        {bullet()}
      </span>
      <div data-slot="timeline-item-content" class={style.content}>
        <Show when={hasContent(title())}>
          <div data-slot="timeline-item-title" class={style.title}>
            {title()}
          </div>
        </Show>
        <div data-slot="timeline-item-body" class={style.body}>
          {props.children}
        </div>
      </div>
    </li>
  );
}

/** A sequence of events in order: an `ol` of Timeline.Item, joined by a line. */
export function Timeline(props: TimelineProps) {
  const mergedProps = mergeDefaultProps({ color: 'primary' as SlopColor }, props);
  const others = omit(mergedProps, 'class', 'color');

  return <ol data-color={mergedProps.color} class={joinClass(['slp-timeline', style.timeline], mergedProps.class)} {...others} />;
}

Timeline.Item = TimelineItem;
