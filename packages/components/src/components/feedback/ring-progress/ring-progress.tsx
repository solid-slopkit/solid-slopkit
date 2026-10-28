import { createMemo, omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './ring-progress.module.css';
import { mergeDefaultProps, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { SIZES, type SlopColor, type SlopSize } from '../../../core';

export interface RingProgressOwnProps {
  /** How far along, from 0 to `max`. Without one, the ring is indeterminate. */
  value?: number;
  /** The value of a full ring. Defaults to `100`. */
  max?: number;
  /** Color role of the arc. Defaults to `primary`. */
  color?: SlopColor;
  /** Diameter of the ring: a size from `xs` to `xl`, or a CSS length such as `'12rem'`. Defaults to `md`. */
  size?: SlopSize | (string & {});
  /** Width of the stroke, in hundredths of the diameter. Defaults to `10`. */
  thickness?: number;
  /** Rounds the arc's ends. Defaults to `true`; `false` cuts them flat. */
  roundCaps?: boolean;
  /** The accessible name, unless `aria-labelledby` points at a visible one. Defaults to `Progress`. */
  label?: string;
  /** Content centered in the ring, such as the percentage. Several children stack in a column. */
  children?: JSX.Element;
}

export type RingProgressProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, RingProgressOwnProps>;

/** Shows how far a task has come as a ring: a `div` with `role="progressbar"`, with content in its center. */
export function RingProgress(props: RingProgressProps) {
  const mergedProps = mergeDefaultProps(
    {
      max: 100,
      color: 'primary' as SlopColor,
      size: 'md' as SlopSize | (string & {}),
      thickness: 10,
      roundCaps: true,
      label: 'Progress',
    },
    props,
  );
  const others = omit(
    mergedProps,
    'class',
    'style',
    'children',
    'value',
    'max',
    'color',
    'size',
    'thickness',
    'roundCaps',
    'label',
  );

  const value = createMemo(() => (props.value == null ? undefined : Math.min(Math.max(props.value, 0), mergedProps.max)), {
    name: 'RingProgress.value',
  });

  const namedSize = () => (SIZES as readonly string[]).includes(mergedProps.size);
  // Kept inside the 100-unit box, so the stroke never clips at the edge.
  const thickness = () => Math.min(Math.max(mergedProps.thickness, 1), 48);

  // As custom properties: the arc's length out of 100 (the circle's pathLength), the stroke width, and a size that
  // isn't one of the named ones.
  const styleValue = createMemo(
    () => {
      const current = value();
      const vars: Record<string, string> = {};
      if (current !== undefined) vars['--_ring-value'] = String(mergedProps.max > 0 ? (current * 100) / mergedProps.max : 0);
      if (mergedProps.thickness !== 10) vars['--_ring-thickness'] = String(thickness());
      if (!namedSize()) vars['--_ring-size'] = mergedProps.size;
      return Object.keys(vars).length ? { ...props.style, ...vars } : props.style;
    },
    { name: 'RingProgress.style' },
  );

  return (
    <div
      role="progressbar"
      aria-label={props['aria-labelledby'] ? undefined : mergedProps.label}
      aria-valuemin={0}
      aria-valuemax={mergedProps.max}
      aria-valuenow={value()}
      data-color={mergedProps.color}
      data-size={namedSize() ? mergedProps.size : undefined}
      data-round-caps={mergedProps.roundCaps ? '' : undefined}
      data-indeterminate={value() === undefined ? '' : undefined}
      data-empty={value() === 0 ? '' : undefined}
      class={joinClass(['slp-ring-progress', style.ring], mergedProps.class)}
      style={styleValue()}
      {...others}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true" class={style.svg}>
        <circle data-slot="ring-progress-track" class={style.track} cx="50" cy="50" r={49 - thickness() / 2} />
        <circle data-slot="ring-progress-arc" class={style.arc} cx="50" cy="50" r={49 - thickness() / 2} pathLength="100" />
      </svg>
      <span data-slot="ring-progress-label" class={style.label}>
        {mergedProps.children}
      </span>
    </div>
  );
}
