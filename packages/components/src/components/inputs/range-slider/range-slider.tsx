import { createSignal, omit, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from '../slider/slider.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { InputWrapper } from '../input-wrapper';
import type { SliderSharedProps } from '../slider';
import { SLIDER_SHARED_KEYS, SliderBase } from '../slider/slider-base';

export type RangeSliderValue = [number, number];

export interface RangeSliderOwnProps extends SliderSharedProps {
  /** The range, for a controlled slider. */
  value?: RangeSliderValue;
  /** The starting range, for an uncontrolled slider. Defaults to `[min, max]`. */
  defaultValue?: RangeSliderValue;
  /** Called with the range while it changes, on every step of a drag. */
  onChange?: (value: RangeSliderValue) => void;
  /** Called with the range when the user lets go: a drag ends, or a key press. */
  onChangeEnd?: (value: RangeSliderValue) => void;
  /** The smallest gap between the two thumbs. Defaults to 0: they can meet but not cross. */
  minRange?: number;
  /** The thumbs' accessible names. Defaults to `['Minimum', 'Maximum']`. */
  thumbLabels?: [string, string];
}

export type RangeSliderProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, RangeSliderOwnProps>;

/**
 * A range picked on a track: two thumbs with `role="slider"`, the bar between them. The pointer moves the nearest
 * thumb; the thumbs never cross.
 */
export function RangeSlider(props: RangeSliderProps) {
  const others = omit(
    props,
    ...SLIDER_SHARED_KEYS,
    'value',
    'defaultValue',
    'onChange',
    'onChangeEnd',
    'minRange',
    'thumbLabels',
  );
  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const controlled = untrack(() => 'value' in props);
  // Uncontrolled, each end has its own signal, so moving one thumb doesn't update the other.
  const start = untrack(() => props.defaultValue ?? [min(), max()]);
  const [low, setLow] = createSignal(start[0], { name: 'RangeSlider.low' });
  const [high, setHigh] = createSignal(start[1], { name: 'RangeSlider.high' });
  const valueAt = (index: number) => (controlled ? (props.value ?? [min(), max()])[index] : index === 0 ? low() : high());
  const value = (): RangeSliderValue => [valueAt(0), valueAt(1)];

  return (
    <InputWrapper
      {...others}
      labelElement="div"
      size={props.size ?? 'md'}
      data-color={props.color ?? 'primary'}
      class={joinClass(['slp-range-slider', style.slider], props.class)}
    >
      <SliderBase
        thumbCount={2}
        values={value}
        valueAt={valueAt}
        onValues={(next) => {
          const range = next as RangeSliderValue;
          if (!controlled) {
            setLow(range[0]);
            setHigh(range[1]);
          }
          props.onChange?.(range);
        }}
        onCommit={(next) => props.onChangeEnd?.(next as RangeSliderValue)}
        min={min()}
        max={max()}
        step={props.step ?? 1}
        largeStep={props.largeStep ?? (props.step ?? 1) * 10}
        minRange={props.minRange ?? 0}
        marks={props.marks}
        valueLabel={props.valueLabel}
        valueLabelAlwaysOn={!!props.valueLabelAlwaysOn}
        valueText={props.valueText}
        thumbLabels={props.thumbLabels ?? ['Minimum', 'Maximum']}
        size={props.size ?? 'md'}
        disabled={!!props.disabled}
        name={props.name}
        barFromStart={false}
      />
    </InputWrapper>
  );
}
