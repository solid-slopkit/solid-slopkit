import { createContext, createSignal, createUniqueId, flush, omit, onCleanup, untrack, useContext } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './chip.module.css';
import { mergeRefs, type ElementProps, type Ref } from '../../../utils';
import { joinClass } from '../../../style-props';
import { InputWrapper, useInputWrapper, type InputWrapperOwnProps } from '../input-wrapper';
import type { SlopColor, SlopSize } from '../../../core';

export type ChipVariant = 'outline' | 'soft' | 'filled';

// ---------------------------------------------------------------------------------------------------------------
// Group context

interface ChipGroupContextValue {
  multiple: boolean;
  isChecked: (value: string) => boolean;
  choose: (value: string) => void;
  name: () => string;
  disabled: () => boolean;
  size: () => SlopSize | undefined;
  /** Adds a chip's way to put its input back to what it shows; returns the removal. */
  register: (sync: () => void) => () => void;
  sync: () => void;
}

// `null` rather than `undefined`: a context without a provider and without a default value throws when read.
const ChipGroupContext = createContext<ChipGroupContextValue | null>(null);

// ---------------------------------------------------------------------------------------------------------------
// Chip

export interface ChipOwnProps {
  /** Whether it's on, for a controlled chip outside a group. */
  checked?: boolean;
  /** Whether it starts on, for an uncontrolled chip outside a group. */
  defaultChecked?: boolean;
  /** Called with the new state when it's toggled. */
  onChange?: (checked: boolean) => void;
  /** The chip's key in a Chip.Group, and what a form submits. */
  value?: string;
  /** How it looks when on. Defaults to `soft`. */
  variant?: ChipVariant;
  /** Color role when on. Defaults to `primary`. */
  color?: SlopColor;
  /** Defaults to the group's, or `md`. */
  size?: SlopSize;
  disabled?: boolean;
  /** The chip's text, which is also its accessible name. */
  children?: JSX.Element;
  class?: JSX.ClassValue | JSX.RemoveAttribute;
  style?: JSX.CSSProperties;
  /** The hidden `input`. */
  ref?: Ref<HTMLInputElement>;
}

export type ChipProps = ElementProps<
  Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'defaultChecked' | 'onChange' | 'value' | 'size'>,
  ChipOwnProps
>;

/**
 * A pill-shaped toggle: a `label` around a hidden native checkbox, or a radio in a single-choice Chip.Group. On, it
 * shows a check and takes the color.
 */
export function Chip(props: ChipProps) {
  let input: HTMLInputElement | undefined;
  const group = useContext(ChipGroupContext);
  const others = omit(
    props,
    'class',
    'style',
    'ref',
    'checked',
    'defaultChecked',
    'onChange',
    'value',
    'variant',
    'color',
    'size',
    'disabled',
    'children',
    'name',
  );
  const [own, setOwn] = createSignal(
    untrack(() => !!props.defaultChecked),
    { name: 'Chip.checked' },
  );
  const checked = () => (group ? props.value !== undefined && group.isChecked(props.value) : (props.checked ?? own()));
  const disabled = () => !!props.disabled || !!group?.disabled();

  // A change the parent didn't apply is undone. A radio's check has moved from one chip to another, so in a group
  // every chip puts its input back.
  const sync = () => {
    if (input) input.checked = untrack(checked);
  };
  if (group) onCleanup(group.register(sync));

  const onChange = (event: Event) => {
    const next = (event.currentTarget as HTMLInputElement).checked;
    if (group) {
      if (props.value !== undefined) group.choose(props.value);
    } else if (props.checked === undefined) setOwn(next);
    props.onChange?.(next);
    flush();
    if (group) group.sync();
    else sync();
  };

  return (
    <label
      data-checked={checked() ? '' : undefined}
      data-disabled={disabled() ? '' : undefined}
      data-variant={props.variant ?? 'soft'}
      data-color={props.color ?? 'primary'}
      data-size={props.size ?? group?.size() ?? 'md'}
      class={joinClass(['slp-chip', style.chip], props.class)}
      style={props.style}
    >
      <input
        ref={mergeRefs(
          (el: HTMLInputElement) => (input = el),
          untrack(() => props.ref),
        )}
        type={group && !group.multiple ? 'radio' : 'checkbox'}
        data-slot="chip-input"
        class={style.input}
        checked={checked()}
        value={props.value}
        name={props.name ?? group?.name()}
        disabled={disabled()}
        onChange={onChange}
        {...others}
      />
      {/* Always there and hidden by CSS while off, so a change re-runs only the attributes. */}
      <svg
        data-slot="chip-icon"
        class={style.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12.5 10 17.5 19 7" />
      </svg>
      <span data-slot="chip-label" class={style.label}>
        {props.children}
      </span>
    </label>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Chip.Group

export interface ChipGroupOwnProps<Multiple extends boolean = false> extends Omit<
  InputWrapperOwnProps,
  'labelElement' | 'children'
> {
  /** Lets several chips be on: the value is then an array. Read once. */
  multiple?: Multiple;
  /** The value, for a controlled group: the chosen chip's, or with `multiple`, the array of the ones that are on. */
  value?: Multiple extends true ? readonly string[] : string | undefined;
  /** The starting value, for an uncontrolled group. */
  defaultValue?: Multiple extends true ? readonly string[] : string;
  /** Called with the new value. */
  onChange?: (value: Multiple extends true ? string[] : string) => void;
  /** The `name` of every chip. Defaults to a generated one. */
  name?: string;
  /** Disables every chip in the group. */
  disabled?: boolean;
  /** Chips. They wrap onto new lines. */
  children?: JSX.Element;
}

export type ChipGroupProps<Multiple extends boolean = false> = ElementProps<
  JSX.HTMLAttributes<HTMLDivElement>,
  ChipGroupOwnProps<Multiple>
>;

function ChipGroupItems(props: { multiple: boolean; invalid: boolean; label?: string; children: JSX.Element }) {
  const wrapper = useInputWrapper();
  return (
    <div
      role={props.multiple ? 'group' : 'radiogroup'}
      data-slot="chip-group-items"
      class={style.items}
      aria-label={props.label}
      aria-labelledby={wrapper?.labelId()}
      aria-describedby={wrapper?.describedBy()}
      aria-invalid={props.invalid ? 'true' : undefined}
    >
      {props.children}
    </div>
  );
}

/**
 * A group of chips with one value. Single-choice by default: the chips are radios, and the value is the chosen
 * one's. With `multiple`, they're checkboxes, and the value is the array of the ones that are on.
 */
export function ChipGroup<Multiple extends boolean = false>(props: ChipGroupProps<Multiple>) {
  const own = props as unknown as ChipGroupProps<boolean>;
  const others = omit(
    own,
    'multiple',
    'value',
    'defaultValue',
    'onChange',
    'name',
    'disabled',
    'children',
    'class',
    'size',
    'aria-label',
  );
  const multiple = untrack(() => !!own.multiple);
  const generatedName = `slp-${createUniqueId()}`;
  const controlled = untrack(() => 'value' in own);
  const [state, setState] = createSignal<string | readonly string[] | undefined>(
    untrack(() => own.defaultValue ?? (multiple ? [] : undefined)),
    { name: 'ChipGroup.value' },
  );
  const value = () => (controlled ? own.value : state());
  const syncs = new Set<() => void>();

  const context: ChipGroupContextValue = {
    multiple,
    isChecked: (item) => {
      const current = value();
      return multiple ? ((current as readonly string[] | undefined) ?? []).includes(item) : current === item;
    },
    choose: (item) => {
      let next: string | string[];
      if (multiple) {
        const current = (value() as readonly string[] | undefined) ?? [];
        next = current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item];
      } else {
        if (value() === item) return;
        next = item;
      }
      if (!controlled) setState(next);
      (own.onChange as ((value: string | string[]) => void) | undefined)?.(next);
    },
    name: () => own.name ?? generatedName,
    disabled: () => !!own.disabled,
    size: () => own.size,
    register: (sync) => {
      syncs.add(sync);
      return () => syncs.delete(sync);
    },
    sync: () => {
      for (const sync of syncs) sync();
    },
  };

  return (
    <InputWrapper {...others} labelElement="div" size={own.size ?? 'md'} class={joinClass(['slp-chip-group'], own.class)}>
      <ChipGroupContext value={context}>
        <ChipGroupItems
          multiple={multiple}
          label={own['aria-label'] as string | undefined}
          invalid={own.error != null && own.error !== false}
        >
          {own.children}
        </ChipGroupItems>
      </ChipGroupContext>
    </InputWrapper>
  );
}

Chip.Group = ChipGroup;
