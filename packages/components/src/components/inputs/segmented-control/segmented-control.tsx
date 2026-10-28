import { createEffect, createMemo, createSignal, createUniqueId, flush, For, omit, onSettled, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './segmented-control.module.css';
import { callHandler, mergeDefaultProps, mergeRefs, type Ref, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import type { SlopColor, SlopSize } from '../../../core';
import { createListNavigation } from '../../primitives';

export interface SegmentedControlItem<T extends string = string> {
  value: T;
  label: JSX.Element;
  disabled?: boolean;
}

export type SegmentedControlOrientation = 'horizontal' | 'vertical';

export interface SegmentedControlOwnProps<T extends string = string> {
  /** The options: a string is used as both value and label. */
  data: readonly (T | SegmentedControlItem<T>)[];
  /** The selected value, for a controlled control. */
  value?: T;
  /** The initially selected value, for an uncontrolled control. Defaults to the first enabled item. */
  defaultValue?: T;
  /** Called with the newly selected value. */
  onChange?: (value: T) => void;
  /** Name of the radio inputs, for forms. Defaults to a unique id. */
  name?: string;
  /** Disables every item. */
  disabled?: boolean;
  /** Shows the value but does not let the user change it. */
  readOnly?: boolean;
  /** Stretches to the width of its container, sharing it between the items. */
  fullWidth?: boolean;
  /** Defaults to `horizontal`. */
  orientation?: SegmentedControlOrientation;
  /** Defaults to `md`. */
  size?: SlopSize;
  /** Indicator color. Without one the indicator is the base surface color. */
  color?: SlopColor;
  /** Separators between the items. Defaults to `true`. */
  withItemsBorders?: boolean;
  /** Indicator animation, in milliseconds. Defaults to `200`. */
  transitionDuration?: number;
  /** Indicator easing. Defaults to `ease`. */
  transitionTimingFunction?: string;
  ref?: Ref<HTMLDivElement>;
}

export type SegmentedControlProps<T extends string = string> = ElementProps<
  JSX.HTMLAttributes<HTMLDivElement>,
  SegmentedControlOwnProps<T>
>;

function toItem<T extends string>(item: T | SegmentedControlItem<T>): SegmentedControlItem<T> {
  return typeof item === 'string' ? { value: item, label: item } : item;
}

/**
 * A row of options of which one is selected, with an indicator that slides to the selection. Each option is a
 * native radio input, so the value is submitted with a form; arrow keys, Home and End move the selection.
 */
export function SegmentedControl<T extends string = string>(props: SegmentedControlProps<T>) {
  let root: HTMLDivElement | undefined;
  let indicator: HTMLDivElement | undefined;

  const mergedProps = mergeDefaultProps(
    {
      size: 'md',
      orientation: 'horizontal',
      withItemsBorders: true,
      transitionDuration: 200,
      transitionTimingFunction: 'ease',
    },
    props as SegmentedControlProps<T>,
  );

  const others = omit(
    mergedProps,
    'ref',
    'class',
    'data',
    'value',
    'defaultValue',
    'onChange',
    'name',
    'disabled',
    'readOnly',
    'fullWidth',
    'orientation',
    'size',
    'color',
    'withItemsBorders',
    'transitionDuration',
    'transitionTimingFunction',
    'onKeyDown',
  );

  const id = createUniqueId();
  const items = createMemo(() => props.data.map(toItem), { name: 'SegmentedControl.items' });

  // Follows `value` when controlled. Uncontrolled, it starts at `defaultValue` or the first enabled item and is
  // only changed by the user: neither is tracked, so new `data` does not reset the selection.
  const [value, setValue] = createSignal<T | undefined>(
    () =>
      mergedProps.value ??
      untrack(() => mergedProps.defaultValue ?? (items().find((item) => !item.disabled) ?? items()[0])?.value),
    { name: 'SegmentedControl.value' },
  );

  const inputs = () => Array.from(root?.querySelectorAll<HTMLInputElement>(`.${style.input}`) ?? []);

  // Arrows in either axis, as in a native radio group, plus Home and End, which radios don't have. The keys are
  // handled here rather than by the browser, so a read-only control only moves focus.
  const navigation = createListNavigation({
    orientation: () => 'both',
    count: () => items().length,
    current: () => inputs().indexOf(document.activeElement as HTMLInputElement),
    isDisabled: (index) => !!mergedProps.disabled || !!items()[index]?.disabled,
    onMove: (index) => {
      inputs()[index]?.focus();
      select(items()[index].value);
    },
  });

  const onKeyDown = (event: KeyboardEvent) => {
    callHandler(props.onKeyDown, event);
    navigation.onKeyDown(event);
  };

  // The browser checks a clicked radio before we decide. When the value did not change (controlled and not
  // updated by the parent, or read-only), put the checks back.
  function syncInputs() {
    const current = value();
    for (const input of root?.querySelectorAll<HTMLInputElement>(`.${style.input}`) ?? []) {
      input.checked = input.value === current;
    }
  }

  function select(next: T) {
    if (!mergedProps.readOnly) {
      if (mergedProps.value === undefined) setValue(() => next);
      mergedProps.onChange?.(next);
    }
    flush();
    syncInputs();
  }

  // Moves the indicator over the active item. The first placement is not animated: transitions only apply once
  // the root has `data-ready`, which is set after the indicator has been placed and laid out. A control that is
  // not laid out (mounted in a hidden tab, a closed modal) has nothing to measure: it waits for the resize
  // observer, so the indicator doesn't start in the first item's corner and slide over once shown.
  function placeIndicator() {
    if (!root || !indicator) return;
    const active = root.querySelector<HTMLElement>(`.${style.control}[data-active]`);
    if (!active) {
      indicator.style.display = 'none';
      return;
    }
    if (active.offsetWidth === 0 && active.offsetHeight === 0) return;
    indicator.style.display = '';
    indicator.style.width = `${active.offsetWidth}px`;
    indicator.style.height = `${active.offsetHeight}px`;
    indicator.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    if (!root.hasAttribute('data-ready')) {
      void indicator.offsetWidth;
      root.setAttribute('data-ready', '');
    }
  }

  createEffect(
    () => [value(), items(), mergedProps.size, mergedProps.orientation, mergedProps.fullWidth],
    () => placeIndicator(),
    { name: 'SegmentedControl.indicator' },
  );

  // Labels and the container can change size without any prop changing: fonts loading, a parent resizing.
  onSettled(() => {
    if (!root || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => placeIndicator());
    observer.observe(root);
    return () => observer.disconnect();
  });

  return (
    <div
      ref={mergeRefs(
        (el: HTMLDivElement) => (root = el),
        untrack(() => mergedProps.ref),
      )}
      role="radiogroup"
      aria-orientation={mergedProps.orientation}
      aria-disabled={mergedProps.disabled ? 'true' : undefined}
      data-orientation={mergedProps.orientation}
      data-size={mergedProps.size}
      data-color={mergedProps.color}
      data-full-width={mergedProps.fullWidth ? '' : undefined}
      data-disabled={mergedProps.disabled ? '' : undefined}
      data-read-only={mergedProps.readOnly ? '' : undefined}
      data-with-items-borders={mergedProps.withItemsBorders ? '' : undefined}
      class={joinClass(['slp-segmented-control', style.root], mergedProps.class)}
      {...others}
      onKeyDown={onKeyDown}
    >
      <div
        ref={(el) => (indicator = el)}
        class={style.indicator}
        data-slot="segmented-control-indicator"
        style={{
          'transition-duration': `${mergedProps.transitionDuration}ms`,
          'transition-timing-function': mergedProps.transitionTimingFunction,
        }}
      />
      <For each={items()} keyed={(item) => item.value}>
        {(item, index) => {
          const inputId = () => `${id}-${index()}`;
          const active = () => item().value === value();
          const disabled = () => !!mergedProps.disabled || !!item().disabled;

          return (
            <div
              class={style.control}
              data-slot="segmented-control-item"
              data-active={active() ? '' : undefined}
              data-disabled={disabled() ? '' : undefined}
            >
              <input
                class={style.input}
                data-slot="segmented-control-input"
                type="radio"
                id={inputId()}
                name={mergedProps.name ?? id}
                value={item().value}
                checked={active()}
                disabled={disabled()}
                onChange={() => select(item().value)}
              />
              <label class={style.label} data-slot="segmented-control-label" for={inputId()}>
                {item().label}
              </label>
            </div>
          );
        }}
      </For>
    </div>
  );
}
