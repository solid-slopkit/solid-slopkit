import { createSignal, flush, For, omit, Show, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './angle-slider.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { InputWrapper, useInputWrapper, type InputWrapperOwnProps } from '../input-wrapper';
import type { SlopColor } from '../../../core';

export interface AngleSliderOwnProps extends Omit<InputWrapperOwnProps, 'labelElement' | 'children'> {
  /** The angle in degrees, from 0 (top) clockwise, for a controlled dial. */
  value?: number;
  /** The starting angle, for an uncontrolled dial. Defaults to 0. */
  defaultValue?: number;
  /** Called with the angle while it changes, on every step of a drag. */
  onChange?: (value: number) => void;
  /** Called with the angle when the user lets go: a drag ends, or a key press. */
  onChangeEnd?: (value: number) => void;
  /** The step in degrees, and the grid angles snap to. Defaults to 1. */
  step?: number;
  /** The step for Page Up and Page Down. Defaults to 15. */
  largeStep?: number;
  /** Angles to mark with a dot on the ring. */
  marks?: readonly number[];
  /** The text in the middle; `null` shows none. Defaults to the angle with a degree sign. */
  valueLabel?: ((value: number) => JSX.Element) | null;
  /** The angle as screen readers say it. Defaults to `90 degrees`. */
  valueText?: (value: number) => string;
  /** Color role of the thumb and the filled arc. Defaults to `primary`. */
  color?: SlopColor;
  disabled?: boolean;
  /** Submits the angle with a form, from a hidden input. */
  name?: string;
}

export type AngleSliderProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, AngleSliderOwnProps>;

/** The angle, in [0, 360), wrapped and snapped to the step. */
function normalize(angle: number, step: number) {
  const places = String(step).split('.')[1]?.length ?? 0;
  const snapped = Number((Math.round(angle / step) * step).toFixed(places));
  return ((snapped % 360) + 360) % 360;
}

function Dial(props: {
  value: () => number;
  set: (value: number) => void;
  commit: () => void;
  step: number;
  largeStep: number;
  marks?: readonly number[];
  valueLabel?: ((value: number) => JSX.Element) | null;
  valueText: (value: number) => string;
  disabled: boolean;
}) {
  let dial: HTMLDivElement | undefined;
  const wrapper = useInputWrapper();
  const [dragging, setDragging] = createSignal(false, { name: 'AngleSlider.dragging' });

  const angleAt = (event: PointerEvent) => {
    const rect = dial!.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    return (Math.atan2(dx, -dy) * 180) / Math.PI;
  };

  const move = (angle: number) => {
    const next = normalize(angle, props.step);
    if (next !== untrack(props.value)) {
      props.set(next);
      flush();
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (props.disabled || event.button !== 0 || !dial) return;
    event.preventDefault();
    dial.focus();
    setDragging(true);
    move(angleAt(event));
    dial.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (dragging()) move(angleAt(event));
  };

  const endDrag = () => {
    if (!dragging()) return;
    setDragging(false);
    props.commit();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (props.disabled) return;
    const value = untrack(props.value);
    const moves: Record<string, number> = {
      ArrowRight: value + props.step,
      ArrowUp: value + props.step,
      ArrowLeft: value - props.step,
      ArrowDown: value - props.step,
      PageUp: value + props.largeStep,
      PageDown: value - props.largeStep,
      Home: 0,
      End: 360 - props.step,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    move(moves[event.key]);
    props.commit();
  };

  return (
    <div
      ref={(el) => (dial = el)}
      role="slider"
      tabindex={props.disabled ? -1 : 0}
      data-slot="angle-slider-dial"
      data-dragging={dragging() ? '' : undefined}
      class={style.dial}
      style={{ '--_angle': `${props.value()}deg` }}
      aria-valuemin={0}
      aria-valuemax={360 - props.step}
      aria-valuenow={props.value()}
      aria-valuetext={props.valueText(props.value())}
      aria-labelledby={wrapper?.labelId()}
      aria-describedby={wrapper?.describedBy()}
      aria-invalid={wrapper?.invalid() ? 'true' : undefined}
      aria-disabled={props.disabled ? 'true' : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onKeyDown={onKeyDown}
    >
      <For each={props.marks ?? []}>
        {(mark) => <span data-slot="angle-slider-mark" class={style.mark} style={{ '--_mark': `${mark}deg` }} />}
      </For>
      <span data-slot="angle-slider-thumb" class={style.thumb} />
      <Show when={props.valueLabel !== null}>
        <span data-slot="angle-slider-label" class={style.label} aria-hidden="true">
          {(props.valueLabel ?? ((value: number) => `${value}°`))(props.value())}
        </span>
      </Show>
    </div>
  );
}

/**
 * An angle picked on a dial: a circle with `role="slider"`, 0° at the top and clockwise, with a thumb on its ring
 * that the pointer drags around the center and the keyboard steps. It wraps around.
 */
export function AngleSlider(props: AngleSliderProps) {
  const others = omit(
    props,
    'value',
    'defaultValue',
    'onChange',
    'onChangeEnd',
    'step',
    'largeStep',
    'marks',
    'valueLabel',
    'valueText',
    'color',
    'disabled',
    'name',
    'class',
    'size',
  );
  const controlled = untrack(() => 'value' in props);
  const [own, setOwn] = createSignal(
    untrack(() => normalize(props.defaultValue ?? 0, props.step ?? 1)),
    {
      name: 'AngleSlider.value',
    },
  );
  const value = () => (controlled ? normalize(props.value ?? 0, props.step ?? 1) : own());

  return (
    <InputWrapper
      {...others}
      labelElement="div"
      size={props.size ?? 'md'}
      data-color={props.color ?? 'primary'}
      data-disabled={props.disabled ? '' : undefined}
      class={joinClass(['slp-angle-slider', style.angleSlider], props.class)}
    >
      <Dial
        value={value}
        set={(next) => {
          if (!controlled) setOwn(next);
          props.onChange?.(next);
        }}
        commit={() => props.onChangeEnd?.(untrack(value))}
        step={props.step ?? 1}
        largeStep={props.largeStep ?? 15}
        marks={props.marks}
        valueLabel={props.valueLabel}
        valueText={props.valueText ?? ((angle) => `${angle} degrees`)}
        disabled={!!props.disabled}
      />
      <Show when={props.name}>
        <input type="hidden" name={props.name} value={String(value())} data-slot="angle-slider-input" />
      </Show>
    </InputWrapper>
  );
}
