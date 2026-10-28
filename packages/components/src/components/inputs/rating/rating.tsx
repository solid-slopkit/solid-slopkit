import { createMemo, createSignal, createUniqueId, flush, For, omit, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './rating.module.css';
import { type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { InputWrapper, useInputWrapper, type InputWrapperOwnProps } from '../input-wrapper';
import type { SlopColor } from '../../../core';

export interface RatingOwnProps extends Omit<InputWrapperOwnProps, 'labelElement' | 'children'> {
  /** The rating, for a controlled field; 0 is none. */
  value?: number;
  /** The starting rating, for an uncontrolled field. */
  defaultValue?: number;
  /** Called with the new rating. */
  onChange?: (value: number) => void;
  /** How many stars. Defaults to 5. */
  count?: number;
  /** Parts of a star that can be chosen: 2 for halves. Defaults to 1. */
  fractions?: number;
  /** Shows the rating without letting it change: an image named by `readOnlyLabel`. */
  readOnly?: boolean;
  /** Choosing the current rating again sets it back to 0. */
  allowClear?: boolean;
  /** Color role of the filled stars. Defaults to `warning`. */
  color?: SlopColor;
  /** The `name` of the radios, for forms. Defaults to a generated one. */
  name?: string;
  disabled?: boolean;
  /** Each choice's accessible name. Defaults to `1 star`, `2.5 stars`, … */
  itemLabel?: (value: number) => string;
  /** The read-only rating's accessible name. Defaults to `Rated 3.5 out of 5`. */
  readOnlyLabel?: (value: number, count: number) => string;
}

export type RatingProps = ElementProps<JSX.HTMLAttributes<HTMLDivElement>, RatingOwnProps>;

// A five-pointed star with rounded points, drawn on its own outline.
const STAR = '12,2 14.65,8.36 21.51,8.91 16.28,13.39 17.88,20.09 12,16.5 6.12,20.09 7.72,13.39 2.49,8.91 9.35,8.36';

function Star(props: { fill: number }) {
  return (
    <span data-slot="rating-star" data-filled={props.fill >= 1 ? '' : props.fill > 0 ? 'partial' : undefined} class={style.star}>
      <svg class={style.empty} viewBox="0 0 24 24" aria-hidden="true">
        <polygon points={STAR} />
      </svg>
      <svg
        class={style.full}
        style={{ '--_rating-fill': `${Math.round(props.fill * 1000) / 10}%` }}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <polygon points={STAR} />
      </svg>
    </span>
  );
}

const defaultItemLabel = (value: number) => `${value} ${value === 1 ? 'star' : 'stars'}`;
const defaultReadOnlyLabel = (value: number, count: number) => `Rated ${value} out of ${count}`;

function RatingStars(props: {
  value: () => number;
  choose: (value: number) => void;
  count: number;
  fractions: number;
  readOnly: boolean;
  allowClear: boolean;
  name: string;
  disabled: boolean;
  itemLabel: (value: number) => string;
  readOnlyLabel: (value: number, count: number) => string;
  ariaLabel?: string;
}) {
  let root: HTMLDivElement | undefined;
  const wrapper = useInputWrapper();
  const [hover, setHover] = createSignal<number | undefined>(undefined, { name: 'Rating.hover' });
  const shown = () => hover() ?? props.value();
  const stars = createMemo(() => Array.from({ length: props.count }, (_, index) => index + 1), { name: 'Rating.stars' });
  const parts = createMemo(
    () => {
      const fractions = props.fractions;
      return Array.from({ length: fractions }, (_, index) => (index + 1) / fractions);
    },
    { name: 'Rating.parts' },
  );
  const fill = (star: number) => Math.min(1, Math.max(0, shown() - (star - 1)));

  // A choice a controlled parent didn't apply is undone: the browser has already moved the check.
  const pick = (value: number) => {
    props.choose(value);
    for (const input of root?.querySelectorAll<HTMLInputElement>('input') ?? []) {
      input.checked = Number(input.value) === untrack(props.value);
    }
  };

  if (untrack(() => props.readOnly)) {
    // oxlint-disable-next-line solid/components-return-once -- read-only is decided once by the caller
    return (
      <div
        role="img"
        data-slot="rating-stars"
        class={style.stars}
        aria-label={props.ariaLabel ?? props.readOnlyLabel(props.value(), props.count)}
        aria-labelledby={props.ariaLabel ? undefined : wrapper?.labelId()}
      >
        <For each={stars()}>{(star) => <Star fill={fill(star)} />}</For>
      </div>
    );
  }

  return (
    <div
      ref={(el) => (root = el)}
      role="radiogroup"
      data-slot="rating-stars"
      class={style.stars}
      aria-label={props.ariaLabel}
      aria-labelledby={wrapper?.labelId()}
      aria-describedby={wrapper?.describedBy()}
      aria-invalid={wrapper?.invalid() ? 'true' : undefined}
      onPointerLeave={() => setHover(undefined)}
    >
      <For each={stars()}>
        {(star) => (
          <span data-slot="rating-item" class={style.item}>
            <Star fill={fill(star)} />
            <For each={parts()}>
              {(part) => {
                const value = star - 1 + part;
                return (
                  <label
                    class={style.part}
                    style={{ left: `${(part - 1 / props.fractions) * 100}%`, width: `${100 / props.fractions}%` }}
                    onPointerEnter={() => !props.disabled && setHover(value)}
                  >
                    <input
                      type="radio"
                      data-slot="rating-input"
                      class={style.input}
                      name={props.name}
                      value={String(value)}
                      checked={props.value() === value}
                      disabled={props.disabled}
                      aria-label={props.itemLabel(value)}
                      onChange={() => pick(value)}
                      // A click on the chosen star changes nothing for the browser; it clears it when allowed.
                      onClick={() => {
                        if (props.allowClear && untrack(props.value) === value) pick(0);
                      }}
                    />
                  </label>
                );
              }}
            </For>
          </span>
        )}
      </For>
    </div>
  );
}

/**
 * A star rating. Choosing: a `radiogroup` of hidden native radios, one per star or part of a star, so the arrow
 * keys move it. Read-only: the stars as one image.
 */
export function Rating(props: RatingProps) {
  const others = omit(
    props,
    'value',
    'defaultValue',
    'onChange',
    'count',
    'fractions',
    'readOnly',
    'allowClear',
    'color',
    'name',
    'disabled',
    'itemLabel',
    'readOnlyLabel',
    'class',
    'size',
    'aria-label',
  );
  const generatedName = `slp-${createUniqueId()}`;
  const controlled = untrack(() => 'value' in props);
  const [own, setOwn] = createSignal(
    untrack(() => props.defaultValue ?? 0),
    { name: 'Rating.value' },
  );
  const value = () => (controlled ? (props.value ?? 0) : own());

  const choose = (next: number) => {
    if (next === value()) return;
    if (!controlled) setOwn(next);
    props.onChange?.(next);
    flush();
  };

  return (
    <InputWrapper
      {...others}
      labelElement="div"
      size={props.size ?? 'md'}
      data-color={props.color ?? 'warning'}
      data-read-only={props.readOnly ? '' : undefined}
      data-disabled={props.disabled ? '' : undefined}
      class={joinClass(['slp-rating', style.rating], props.class)}
    >
      <RatingStars
        value={value}
        choose={choose}
        count={props.count ?? 5}
        fractions={props.fractions ?? 1}
        readOnly={untrack(() => !!props.readOnly)}
        allowClear={!!props.allowClear}
        name={props.name ?? generatedName}
        disabled={!!props.disabled}
        itemLabel={props.itemLabel ?? defaultItemLabel}
        readOnlyLabel={props.readOnlyLabel ?? defaultReadOnlyLabel}
        ariaLabel={props['aria-label'] as string | undefined}
      />
    </InputWrapper>
  );
}
