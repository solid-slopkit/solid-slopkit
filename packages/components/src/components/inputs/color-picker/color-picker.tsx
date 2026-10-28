import { createEffect, createMemo, createSignal, flush, For, omit, Show, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './color-picker.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { InputWrapper, useInputWrapper, type InputWrapperOwnProps } from '../input-wrapper';
import { formatColor, hasAlpha, hsvToRgb, parseColor, rgbToHsv, sameColor, type ColorFormat, type Hsva } from './color';

export type { ColorFormat };

export interface ColorPickerOwnProps extends Omit<InputWrapperOwnProps, 'labelElement' | 'children'> {
  /** The color, for a controlled picker, in any format the picker reads. */
  value?: string;
  /** The starting color, for an uncontrolled picker. Defaults to `#000000`. */
  defaultValue?: string;
  /** Called with the color while it changes, in `format`. */
  onChange?: (value: string) => void;
  /** Called with the color when the user lets go: a drag ends, a key press, or a swatch. */
  onChangeEnd?: (value: string) => void;
  /** The format `onChange` reports. Formats with alpha (`hexa`, `rgba`, `hsla`) add an alpha slider. Defaults to `hex`. */
  format?: ColorFormat;
  /** Colors to pick with one click, shown under the sliders. */
  swatches?: readonly string[];
  /** Swatches per row. Defaults to 7. */
  swatchesPerRow?: number;
  /** Stretches the picker to the width of its container. */
  fullWidth?: boolean;
  disabled?: boolean;
  /** Accessible name of the saturation and brightness area. Defaults to `Saturation and brightness`. */
  saturationLabel?: string;
  /** Accessible name of the hue slider. Defaults to `Hue`. */
  hueLabel?: string;
  /** Accessible name of the alpha slider. Defaults to `Alpha`. */
  alphaLabel?: string;
}

export type ColorPickerProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, ColorPickerOwnProps>;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Drags on an element: the pointer's position as fractions of the element's width and height, on press and on every
 * move until it's released.
 */
function createDrag(
  target: () => HTMLElement | undefined,
  onMove: (x: number, y: number) => void,
  onEnd: () => void,
  disabled: () => boolean,
) {
  const [dragging, setDragging] = createSignal(false, { name: 'ColorPicker.dragging' });
  const at = (event: PointerEvent) => {
    const rect = target()!.getBoundingClientRect();
    onMove(
      rect.width ? clamp((event.clientX - rect.left) / rect.width, 0, 1) : 0,
      rect.height ? clamp((event.clientY - rect.top) / rect.height, 0, 1) : 0,
    );
  };
  return {
    dragging,
    handlers: {
      onPointerDown: (event: PointerEvent) => {
        if (disabled() || event.button !== 0 || !target()) return;
        event.preventDefault();
        target()!.focus();
        setDragging(true);
        at(event);
        target()!.setPointerCapture?.(event.pointerId);
      },
      onPointerMove: (event: PointerEvent) => {
        if (dragging()) at(event);
      },
      onPointerUp: () => {
        if (!dragging()) return;
        setDragging(false);
        onEnd();
      },
      onLostPointerCapture: () => {
        if (!dragging()) return;
        setDragging(false);
        onEnd();
      },
    },
  };
}

/** Arrow keys: Left/Right and Up/Down by 1, by 10 with Shift; Page Up/Down by 10; Home/End to the ends. */
function stepFor(event: KeyboardEvent): { axis: 'x' | 'y'; by: number } | { axis: 'x'; to: 'min' | 'max' } | undefined {
  const step = event.shiftKey ? 10 : 1;
  switch (event.key) {
    case 'ArrowRight':
      return { axis: 'x', by: step };
    case 'ArrowLeft':
      return { axis: 'x', by: -step };
    case 'ArrowUp':
      return { axis: 'y', by: step };
    case 'ArrowDown':
      return { axis: 'y', by: -step };
    case 'PageUp':
      return { axis: 'y', by: 10 };
    case 'PageDown':
      return { axis: 'y', by: -10 };
    case 'Home':
      return { axis: 'x', to: 'min' };
    case 'End':
      return { axis: 'x', to: 'max' };
  }
  return undefined;
}

function Picker(props: {
  hsva: () => Hsva;
  set: (next: Hsva) => void;
  commit: () => void;
  withAlpha: boolean;
  swatches?: readonly string[];
  swatchesPerRow: number;
  pick: (color: string) => void;
  current: () => string;
  disabled: boolean;
  saturationLabel: string;
  hueLabel: string;
  alphaLabel: string;
}) {
  let area: HTMLDivElement | undefined;
  let hue: HTMLDivElement | undefined;
  let alpha: HTMLDivElement | undefined;
  const wrapper = useInputWrapper();
  const disabled = () => props.disabled;
  const update = (patch: Partial<Hsva>) => {
    props.set({ ...untrack(props.hsva), ...patch });
    flush();
  };

  const commit = () => props.commit();
  const areaDrag = createDrag(
    () => area,
    (x, y) => update({ s: Math.round(x * 100), v: Math.round((1 - y) * 100) }),
    commit,
    disabled,
  );
  const hueDrag = createDrag(
    () => hue,
    (x) => update({ h: Math.round(x * 360) }),
    commit,
    disabled,
  );
  const alphaDrag = createDrag(
    () => alpha,
    (x) => update({ a: Math.round(x * 100) / 100 }),
    commit,
    disabled,
  );

  const onAreaKey = (event: KeyboardEvent) => {
    const move = stepFor(event);
    if (!move || props.disabled) return;
    event.preventDefault();
    const { s, v } = untrack(props.hsva);
    if ('to' in move) update({ s: move.to === 'min' ? 0 : 100 });
    else if (move.axis === 'x') update({ s: clamp(s + move.by, 0, 100) });
    else update({ v: clamp(v + move.by, 0, 100) });
    props.commit();
  };

  const onLineKey = (key: 'h' | 'a', max: number, scale: number) => (event: KeyboardEvent) => {
    const move = stepFor(event);
    if (!move || props.disabled) return;
    event.preventDefault();
    const value = untrack(props.hsva)[key] * scale;
    const next = 'to' in move ? (move.to === 'min' ? 0 : max) : clamp(value + move.by, 0, max);
    update({ [key]: next / scale });
    props.commit();
  };

  const hueColor = () => `hsl(${props.hsva().h} 100% 50%)`;
  const opaque = () => {
    const { r, g, b } = hsvToRgb({ ...props.hsva(), a: 1 });
    return `rgb(${r} ${g} ${b})`;
  };

  return (
    <div
      role="group"
      data-slot="color-picker-body"
      class={style.body}
      aria-labelledby={wrapper?.labelId()}
      aria-describedby={wrapper?.describedBy()}
      style={{ '--_cp-hue': hueColor(), '--_cp-color': opaque() }}
    >
      <div
        ref={(el) => (area = el)}
        role="slider"
        tabindex={props.disabled ? -1 : 0}
        data-slot="color-picker-saturation"
        data-dragging={areaDrag.dragging() ? '' : undefined}
        class={style.saturation}
        aria-label={props.saturationLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(props.hsva().s)}
        aria-valuetext={`Saturation ${Math.round(props.hsva().s)}%, brightness ${Math.round(props.hsva().v)}%`}
        aria-disabled={props.disabled ? 'true' : undefined}
        onKeyDown={onAreaKey}
        {...areaDrag.handlers}
      >
        <span
          data-slot="color-picker-thumb"
          class={style.thumb}
          style={{ left: `${props.hsva().s}%`, top: `${100 - props.hsva().v}%` }}
        />
      </div>
      <div class={style.row}>
        <div class={style.lines}>
          <div
            ref={(el) => (hue = el)}
            role="slider"
            tabindex={props.disabled ? -1 : 0}
            data-slot="color-picker-hue"
            class={`${style.line} ${style.hue}`}
            aria-label={props.hueLabel}
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={Math.round(props.hsva().h)}
            aria-valuetext={`${Math.round(props.hsva().h)} degrees`}
            aria-disabled={props.disabled ? 'true' : undefined}
            onKeyDown={onLineKey('h', 360, 1)}
            {...hueDrag.handlers}
          >
            <span
              data-slot="color-picker-thumb"
              class={style.thumb}
              style={{ left: `${(props.hsva().h / 360) * 100}%`, background: 'var(--_cp-hue)' }}
            />
          </div>
          <Show when={props.withAlpha}>
            <div
              ref={(el) => (alpha = el)}
              role="slider"
              tabindex={props.disabled ? -1 : 0}
              data-slot="color-picker-alpha"
              class={`${style.line} ${style.alpha}`}
              aria-label={props.alphaLabel}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(props.hsva().a * 100)}
              aria-valuetext={`${Math.round(props.hsva().a * 100)}%`}
              aria-disabled={props.disabled ? 'true' : undefined}
              onKeyDown={onLineKey('a', 100, 100)}
              {...alphaDrag.handlers}
            >
              <span data-slot="color-picker-thumb" class={style.thumb} style={{ left: `${props.hsva().a * 100}%` }} />
            </div>
          </Show>
        </div>
        <span
          data-slot="color-picker-preview"
          class={style.preview}
          style={{ '--_cp-preview': props.current() }}
          aria-hidden="true"
        />
      </div>
      <Show when={props.swatches && props.swatches.length > 0}>
        <div
          data-slot="color-picker-swatches"
          class={style.swatches}
          style={{ 'grid-template-columns': `repeat(${props.swatchesPerRow}, 1fr)` }}
        >
          <For each={props.swatches}>
            {(swatch) => (
              <button
                type="button"
                data-slot="color-picker-swatch"
                class={style.swatch}
                style={{ '--_cp-preview': swatch }}
                aria-label={swatch}
                aria-pressed={props.current().toLowerCase() === swatch.toLowerCase() ? 'true' : 'false'}
                disabled={props.disabled}
                onClick={() => props.pick(swatch)}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

/**
 * A color picked on a panel: a saturation and brightness area, a hue slider, an alpha slider for formats with alpha,
 * and swatches. Each part has the `slider` role and keys.
 */
export function ColorPicker(props: ColorPickerProps) {
  const others = omit(
    props,
    'value',
    'defaultValue',
    'onChange',
    'onChangeEnd',
    'format',
    'swatches',
    'swatchesPerRow',
    'fullWidth',
    'disabled',
    'saturationLabel',
    'hueLabel',
    'alphaLabel',
    'class',
    'size',
  );
  const format = () => props.format ?? 'hex';
  const toHsva = (text: string | undefined) => rgbToHsv(parseColor(text ?? '') ?? { r: 0, g: 0, b: 0, a: 1 });

  // The state is HSVA, so the hue and saturation stay put where the color alone can't keep them (grey, black).
  const controlled = untrack(() => 'value' in props);
  const [hsva, setHsva] = createSignal<Hsva>(
    untrack(() => toHsva(controlled ? props.value : props.defaultValue)),
    {
      name: 'ColorPicker.hsva',
    },
  );
  const text = createMemo(() => formatColor(hsvToRgb(hsva()), format()), { name: 'ColorPicker.text' });

  // A new value from outside replaces the state, unless it's the color already shown.
  if (controlled) {
    createEffect(
      () => props.value,
      (value) => {
        const parsed = parseColor(value ?? '');
        if (parsed && !sameColor(parsed, hsvToRgb(untrack(hsva)))) setHsva(rgbToHsv(parsed));
      },
    );
  }

  const set = (next: Hsva) => {
    const before = untrack(text);
    setHsva(next);
    const after = formatColor(hsvToRgb(next), format());
    if (after !== before) props.onChange?.(after);
  };

  const pick = (swatch: string) => {
    const parsed = parseColor(swatch);
    if (!parsed) return;
    set(rgbToHsv(hasAlpha(format()) ? parsed : { ...parsed, a: 1 }));
    flush();
    props.onChangeEnd?.(untrack(text));
  };

  return (
    <InputWrapper
      {...others}
      labelElement="div"
      size={props.size ?? 'md'}
      data-full-width={props.fullWidth ? '' : undefined}
      data-disabled={props.disabled ? '' : undefined}
      class={joinClass(['slp-color-picker', style.colorPicker], props.class)}
    >
      <Picker
        hsva={hsva}
        set={set}
        commit={() => props.onChangeEnd?.(untrack(text))}
        withAlpha={hasAlpha(format())}
        swatches={props.swatches}
        swatchesPerRow={props.swatchesPerRow ?? 7}
        pick={pick}
        current={text}
        disabled={!!props.disabled}
        saturationLabel={props.saturationLabel ?? 'Saturation and brightness'}
        hueLabel={props.hueLabel ?? 'Hue'}
        alphaLabel={props.alphaLabel ?? 'Alpha'}
      />
    </InputWrapper>
  );
}
