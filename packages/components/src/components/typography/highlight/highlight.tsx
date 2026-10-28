import { createMemo, For, omit, Show } from 'solid-js';
import { type JSX } from '@solidjs/web';
import { Mark } from '../mark';
import { splitHighlight } from './split-highlight';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor } from '../../../core';

export interface HighlightOwnProps {
  /** The text to search. */
  children: string;
  /** What to highlight: one term or several. Empty terms are ignored. */
  highlight: string | readonly string[];
  /** Color of the marks, from a color role. Defaults to `warning`, like Mark. */
  color?: SlopColor;
  /** Matches only the same case. By default, matching ignores case. */
  caseSensitive?: boolean;
}

export type HighlightProps = ElementProps<JSX.HTMLAttributes<HTMLSpanElement>, HighlightOwnProps>;

/** Text with every match of a term wrapped in a Mark: a `span`. */
export function Highlight(props: HighlightProps) {
  const others = omit(props, 'class', 'children', 'highlight', 'color', 'caseSensitive');
  const segments = createMemo(() => splitHighlight(props.children, props.highlight, props.caseSensitive), {
    name: 'Highlight.segments',
  });

  return (
    <span class={joinClass(['slp-highlight'], props.class)} {...others}>
      {/* Unkeyed: a new term updates the text and the match of each segment in place, instead of recreating them. */}
      <For each={segments()} keyed={false}>
        {(segment) => (
          <Show when={segment().match} fallback={segment().text}>
            <Mark color={props.color ?? 'warning'}>{segment().text}</Mark>
          </Show>
        )}
      </For>
    </span>
  );
}
