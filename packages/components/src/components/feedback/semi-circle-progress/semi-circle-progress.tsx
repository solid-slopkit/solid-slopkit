import { createMemo, omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './semi-circle-progress.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor, SlopSize } from '../../../core';

export interface SemiCircleProgressOwnProps {
  /** How far along, from 0 to `max`. Without one, the gauge is indeterminate. */
  value?: number;
  /** The value of a full arc. Defaults to `100`. */
  max?: number;
  /** Color role of the arc. Defaults to `primary`. */
  color?: SlopColor;
  /** Width of the gauge. Defaults to `md`. */
  size?: SlopSize;
  /** The accessible name, unless `aria-labelledby` points at a visible one. Defaults to `Progress`. */
  label?: string;
  /** Content centered along the bottom, inside the arc, such as the value. */
  children?: JSX.Element;
}

export type SemiCircleProgressProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, SemiCircleProgressOwnProps>;

/** Shows how far a task has come as a half ring, a gauge: a `div` with `role="progressbar"`. */
export function SemiCircleProgress(props: SemiCircleProgressProps) {
  const mergedProps = mergeDefaultProps(
    { max: 100, color: 'primary' as SlopColor, size: 'md' as SlopSize, label: 'Progress' },
    props,
  );
  const others = omit(mergedProps, 'class', 'style', 'children', 'value', 'max', 'color', 'size', 'label');

  const value = createMemo(() => (props.value == null ? undefined : Math.min(Math.max(props.value, 0), mergedProps.max)), {
    name: 'SemiCircleProgress.value',
  });

  // The arc's length out of 100 (the path's pathLength), as a custom property.
  const styleValue = createMemo(
    () => {
      const current = value();
      if (current === undefined) return props.style;
      const percent = mergedProps.max > 0 ? (current * 100) / mergedProps.max : 0;
      return { ...props.style, '--_semi-value': String(percent) };
    },
    { name: 'SemiCircleProgress.style' },
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
      data-empty={value() === 0 ? '' : undefined}
      class={joinClass(['slp-semi-circle-progress', style.gauge], mergedProps.class)}
      style={styleValue()}
      {...others}
    >
      <svg viewBox="0 0 100 55" aria-hidden="true" class={style.svg}>
        <path data-slot="semi-circle-progress-track" class={style.track} d="M 5 50 A 45 45 0 0 1 95 50" />
        <path data-slot="semi-circle-progress-arc" class={style.arc} d="M 5 50 A 45 45 0 0 1 95 50" pathLength="100" />
      </svg>
      <span data-slot="semi-circle-progress-label" class={style.label}>
        {mergedProps.children}
      </span>
    </div>
  );
}
