import { createMemo, omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './progress.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor, SlopSize } from '../../../core';

export interface ProgressOwnProps {
  /** How far along, from 0 to `max`. Without one, the bar is indeterminate. */
  value?: number;
  /** The value of a full bar. Defaults to `100`. */
  max?: number;
  /** Color role of the bar. Defaults to `primary`. */
  color?: SlopColor;
  /** Height of the track. Defaults to `md`. */
  size?: SlopSize;
  /** Draws diagonal stripes on the bar. */
  striped?: boolean;
  /** Moves the stripes. Implies `striped`. */
  animated?: boolean;
  /** The accessible name, unless `aria-labelledby` points at a visible one. Defaults to `Progress`. */
  label?: string;
}

export type ProgressProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, ProgressOwnProps>;

/** Shows how far a task has come: a `div` with `role="progressbar"`, a track and a bar. */
export function Progress(props: ProgressProps) {
  const mergedProps = mergeDefaultProps(
    { max: 100, color: 'primary' as SlopColor, size: 'md' as SlopSize, label: 'Progress' },
    props,
  );
  const others = omit(mergedProps, 'class', 'style', 'value', 'max', 'color', 'size', 'striped', 'animated', 'label');

  const value = createMemo(() => (props.value == null ? undefined : Math.min(Math.max(props.value, 0), mergedProps.max)), {
    name: 'Progress.value',
  });

  // Any fraction, so it goes in a custom property rather than a data-attribute selector.
  const styleValue = createMemo(
    () => {
      const current = value();
      if (current === undefined) return props.style;
      const percent = mergedProps.max > 0 ? (current * 100) / mergedProps.max : 0;
      return { ...props.style, '--_progress-value': `${percent}%` };
    },
    { name: 'Progress.style' },
  );

  return (
    <div
      role="progressbar"
      aria-label={props['aria-labelledby'] ? undefined : mergedProps.label}
      aria-valuemin={0}
      aria-valuemax={mergedProps.max}
      aria-valuenow={value()}
      data-color={mergedProps.color}
      data-size={mergedProps.size}
      data-indeterminate={value() === undefined ? '' : undefined}
      data-striped={mergedProps.striped || mergedProps.animated ? '' : undefined}
      data-animated={mergedProps.animated ? '' : undefined}
      class={joinClass(['slp-progress', style.progress], mergedProps.class)}
      style={styleValue()}
      {...others}
    >
      <div data-slot="progress-bar" class={style.bar} />
    </div>
  );
}
