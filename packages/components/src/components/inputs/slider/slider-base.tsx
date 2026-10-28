// Shared by Slider and RangeSlider: the track, the bar, the marks and one or more thumbs, with pointer dragging and
// the keyboard. Internal; not exported from the package.
import { createMemo, createSignal, flush, For, Show, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './slider.module.css';
import { useLocale } from '../../provider';
import { useInputWrapper } from '../input-wrapper';
import type { SlopSize } from '../../../core';

export interface SliderMark {
  value: number;
  /** Text under the mark. */
  label?: JSX.Element;
}

export interface SliderBaseProps {
  /** How many thumbs: fixed for a component, so the thumbs are built once. */
  thumbCount: number;
  values: () => readonly number[];
  /** One thumb's value, read on its own so a thumb only updates when its value changes. */
  valueAt: (index: number) => number;
  /** Called with all the values when one changes, and the index of the thumb that moved. */
  onValues: (values: number[], index: number) => void;
  /** Called with all the values when the user lets go: a drag ends, or a key press. */
  onCommit: (values: number[]) => void;
  min: number;
  max: number;
  step: number;
  largeStep: number;
  /** Smallest gap between neighboring thumbs. */
  minRange: number;
  marks?: readonly SliderMark[];
  /** The value bubble over a thumb; `null` shows none. */
  valueLabel?: ((value: number) => JSX.Element) | null;
  valueLabelAlwaysOn: boolean;
  valueText?: (value: number) => string;
  thumbLabels?: readonly (string | undefined)[];
  size: SlopSize;
  disabled: boolean;
  name?: string;
  /** Whether the bar runs from the start to the only thumb (Slider), or between the thumbs (RangeSlider). */
  barFromStart: boolean;
}

/** The props Slider and RangeSlider share, which don't go to the InputWrapper root. */
export const SLIDER_SHARED_KEYS = [
  'min',
  'max',
  'step',
  'largeStep',
  'marks',
  'valueLabel',
  'valueLabelAlwaysOn',
  'valueText',
  'color',
  'disabled',
  'name',
  'class',
  'size',
] as const;

export function SliderBase(props: SliderBaseProps) {
  let track: HTMLDivElement | undefined;
  const thumbs: HTMLDivElement[] = [];
  const wrapper = useInputWrapper();
  const locale = useLocale();
  const [dragging, setDragging] = createSignal<number | undefined>(undefined, { name: 'Slider.dragging' });

  const formatter = createMemo(() => new Intl.NumberFormat(locale(), { maximumFractionDigits: 20 }), {
    name: 'Slider.formatter',
  });
  const text = (value: number) => props.valueText?.(value) ?? formatter().format(value);
  const percent = (value: number) => ((value - props.min) * 100) / (props.max - props.min || 1);
  const places = () => String(props.step).split('.')[1]?.length ?? 0;

  const snap = (value: number) => {
    const stepped = props.min + Math.round((value - props.min) / props.step) * props.step;
    return Number(Math.min(props.max, Math.max(props.min, stepped)).toFixed(places()));
  };

  // Keeps a thumb between its neighbors, at least `minRange` from each.
  const constrain = (values: readonly number[], index: number, value: number) => {
    const low = index > 0 ? values[index - 1] + props.minRange : props.min;
    const high = index < values.length - 1 ? values[index + 1] - props.minRange : props.max;
    return Math.min(high, Math.max(low, value));
  };

  const move = (index: number, value: number) => {
    const current = untrack(props.values);
    const next = [...current];
    next[index] = constrain(current, index, snap(value));
    if (next[index] !== current[index]) props.onValues(next, index);
    // So the next read in the same tick (the next move, the commit) sees the new value.
    flush();
  };

  const valueAt = (clientX: number) => {
    const rect = track!.getBoundingClientRect();
    const ratio = rect.width ? Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) : 0;
    return props.min + ratio * (props.max - props.min);
  };

  // The thumb a press moves: the nearest one; on a tie, the one whose side the press is on.
  const nearest = (value: number) => {
    const values = untrack(props.values);
    let best = 0;
    for (let index = 1; index < values.length; index++) {
      const distance = Math.abs(values[index] - value);
      const bestDistance = Math.abs(values[best] - value);
      if (distance < bestDistance || (distance === bestDistance && value > values[index])) best = index;
    }
    return best;
  };

  const onPointerDown = (event: PointerEvent) => {
    if (props.disabled || event.button !== 0 || !track) return;
    event.preventDefault();
    const value = valueAt(event.clientX);
    const index = nearest(value);
    setDragging(index);
    thumbs[index]?.focus();
    move(index, value);
    track.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    const index = dragging();
    if (index !== undefined) move(index, valueAt(event.clientX));
  };

  const endDrag = () => {
    if (dragging() === undefined) return;
    setDragging(undefined);
    props.onCommit([...untrack(props.values)]);
  };

  const onKeyDown = (index: number, event: KeyboardEvent) => {
    if (props.disabled) return;
    const value = untrack(props.values)[index];
    const moves: Record<string, number> = {
      ArrowRight: value + props.step,
      ArrowUp: value + props.step,
      ArrowLeft: value - props.step,
      ArrowDown: value - props.step,
      PageUp: value + props.largeStep,
      PageDown: value - props.largeStep,
      Home: props.min,
      End: props.max,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    move(index, moves[event.key]);
    props.onCommit([...untrack(props.values)]);
  };

  const bar = () => {
    const values = props.values();
    const start = props.barFromStart ? 0 : percent(values[0]);
    const end = percent(values[values.length - 1]);
    return { 'inset-inline-start': `${start}%`, width: `${end - start}%` };
  };

  const inRange = (value: number) => {
    const values = props.values();
    const start = props.barFromStart ? props.min : values[0];
    return value >= start && value <= values[values.length - 1];
  };

  const indexes = Array.from({ length: untrack(() => props.thumbCount) }, (_, index) => index);

  return (
    <div
      // Several thumbs, each with its own name ("Minimum"), sit in a group named by the field's label.
      role={props.thumbLabels ? 'group' : undefined}
      aria-labelledby={props.thumbLabels ? wrapper?.labelId() : undefined}
      data-slot="slider-root"
      data-size={props.size}
      data-disabled={props.disabled ? '' : undefined}
      data-dragging={dragging() !== undefined ? '' : undefined}
      data-with-marks-labels={props.marks?.some((mark) => mark.label != null) ? '' : undefined}
      class={style.root}
    >
      <div
        ref={(el) => (track = el)}
        data-slot="slider-track"
        class={style.track}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        <div data-slot="slider-bar" class={style.bar} style={bar()} />
        <For each={props.marks ?? []}>
          {(mark) => (
            <div
              data-slot="slider-mark"
              data-filled={inRange(mark.value) ? '' : undefined}
              class={style.mark}
              style={{ 'inset-inline-start': `${percent(mark.value)}%` }}
            >
              <Show when={mark.label != null}>
                <span data-slot="slider-mark-label" class={style.markLabel} aria-hidden="true">
                  {mark.label}
                </span>
              </Show>
            </div>
          )}
        </For>
        <For each={indexes}>
          {(index) => {
            const value = () => props.valueAt(index);
            return (
              <div
                ref={(el) => (thumbs[index] = el)}
                role="slider"
                tabindex={props.disabled ? -1 : 0}
                data-slot="slider-thumb"
                data-index={index}
                data-dragging={dragging() === index ? '' : undefined}
                class={style.thumb}
                style={{ 'inset-inline-start': `${percent(value())}%` }}
                aria-valuemin={props.min}
                aria-valuemax={props.max}
                aria-valuenow={value()}
                aria-valuetext={text(value())}
                aria-orientation="horizontal"
                aria-label={props.thumbLabels?.[index]}
                aria-labelledby={props.thumbLabels ? undefined : wrapper?.labelId()}
                aria-describedby={wrapper?.describedBy()}
                aria-invalid={wrapper?.invalid() ? 'true' : undefined}
                aria-disabled={props.disabled ? 'true' : undefined}
                onKeyDown={(event) => onKeyDown(index, event)}
              >
                <Show when={props.valueLabel !== null}>
                  <span
                    data-slot="slider-value-label"
                    data-always-on={props.valueLabelAlwaysOn ? '' : undefined}
                    class={style.label}
                    aria-hidden="true"
                  >
                    {(props.valueLabel ?? text)(value())}
                  </span>
                </Show>
              </div>
            );
          }}
        </For>
      </div>
      <Show when={props.name}>
        <For each={indexes}>
          {(index) => <input type="hidden" data-slot="slider-input" name={props.name} value={String(props.values()[index])} />}
        </For>
      </Show>
    </div>
  );
}
