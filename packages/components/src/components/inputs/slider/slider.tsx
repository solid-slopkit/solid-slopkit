import { createSignal, omit, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './slider.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { InputWrapper, type InputWrapperOwnProps } from '../input-wrapper';
import { SLIDER_SHARED_KEYS, SliderBase, type SliderMark } from './slider-base';
import type { SlopColor } from '../../../core';

export type { SliderMark };

export interface SliderSharedProps extends Omit<InputWrapperOwnProps, 'labelElement' | 'children'> {
  /** The smallest value. Defaults to 0. */
  min?: number;
  /** The largest value. Defaults to 100. */
  max?: number;
  /** The amount a step changes the value, and the grid values snap to. Defaults to 1. */
  step?: number;
  /** The amount Page Up and Page Down change the value. Defaults to ten steps. */
  largeStep?: number;
  /** Points on the track, with an optional label under each. */
  marks?: readonly SliderMark[];
  /** The bubble over a thumb, shown while it's hovered, focused or dragged. `null` shows none. Defaults to the value. */
  valueLabel?: ((value: number) => JSX.Element) | null;
  /** Shows the bubble all the time. */
  valueLabelAlwaysOn?: boolean;
  /** The value as screen readers say it. Defaults to the number in the provider's locale. */
  valueText?: (value: number) => string;
  /** Color role of the bar and thumb. Defaults to `primary`. */
  color?: SlopColor;
  disabled?: boolean;
  /** Submits the value with a form, from a hidden input. */
  name?: string;
}

export interface SliderOwnProps extends SliderSharedProps {
  /** The value, for a controlled slider. */
  value?: number;
  /** The starting value, for an uncontrolled slider. Defaults to `min`. */
  defaultValue?: number;
  /** Called with the value while it changes, on every step of a drag. */
  onChange?: (value: number) => void;
  /** Called with the value when the user lets go: a drag ends, or a key press. */
  onChangeEnd?: (value: number) => void;
}

export type SliderProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, SliderOwnProps>;

/**
 * A value picked on a track: a thumb with `role="slider"` that the pointer drags and the keyboard steps, with
 * optional marks and a value bubble.
 */
export function Slider(props: SliderProps) {
  const others = omit(props, ...SLIDER_SHARED_KEYS, 'value', 'defaultValue', 'onChange', 'onChangeEnd');
  const min = () => props.min ?? 0;
  const controlled = untrack(() => 'value' in props);
  const [own, setOwn] = createSignal(
    untrack(() => props.defaultValue ?? min()),
    { name: 'Slider.value' },
  );
  const value = () => (controlled ? (props.value ?? min()) : own());

  return (
    <InputWrapper
      {...others}
      labelElement="div"
      size={props.size ?? 'md'}
      data-color={props.color ?? 'primary'}
      class={joinClass(['slp-slider', style.slider], props.class)}
    >
      <SliderBase
        thumbCount={1}
        values={() => [value()]}
        valueAt={value}
        onValues={([next]) => {
          if (!controlled) setOwn(next);
          props.onChange?.(next);
        }}
        onCommit={([next]) => props.onChangeEnd?.(next)}
        min={min()}
        max={props.max ?? 100}
        step={props.step ?? 1}
        largeStep={props.largeStep ?? (props.step ?? 1) * 10}
        minRange={0}
        marks={props.marks}
        valueLabel={props.valueLabel}
        valueLabelAlwaysOn={!!props.valueLabelAlwaysOn}
        valueText={props.valueText}
        size={props.size ?? 'md'}
        disabled={!!props.disabled}
        name={props.name}
        barFromStart
      />
    </InputWrapper>
  );
}
