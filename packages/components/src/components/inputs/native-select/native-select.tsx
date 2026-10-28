import { createEffect, createMemo, For, omit, Show, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './native-select.module.css';
import { mergeRefs, type ElementProps } from '../../../utils';
import { controlProps, FieldWrapper, type FieldWrapperProps } from '../field';
import { Input, type InputOwnProps } from '../input';

export interface NativeSelectItem {
  value: string;
  label?: string;
  disabled?: boolean;
}

export interface NativeSelectGroup {
  /** The group's label, shown above its options. */
  group: string;
  items: readonly (string | NativeSelectItem)[];
}

export type NativeSelectData = readonly (string | NativeSelectItem | NativeSelectGroup)[];

export interface NativeSelectOwnProps
  extends FieldWrapperProps, Pick<InputOwnProps, 'variant' | 'leftSection' | 'disabled' | 'ref'> {
  /** The options: a string is both value and label; a `group` becomes an `optgroup`. Without it, pass `option`s as children. */
  data?: NativeSelectData;
  /** A first option with the value `''`, shown until something is chosen. It can't be chosen again. */
  placeholder?: string;
  children?: JSX.Element;
}

export type NativeSelectProps = ElementProps<
  Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, 'multiple' | 'size'>,
  NativeSelectOwnProps
>;

const toItem = (item: string | NativeSelectItem): NativeSelectItem => (typeof item === 'string' ? { value: item } : item);

// `selected` comes from the select's value: a select's own `value` is set before its options exist, and the server
// render has only the options to say which one is chosen.
function Option(props: { item: string | NativeSelectItem; selected: (value: string) => boolean }) {
  const item = () => toItem(props.item);
  return (
    <option value={item().value} disabled={item().disabled} selected={props.selected(item().value)}>
      {item().label ?? item().value}
    </option>
  );
}

/**
 * A labelled native `select` in an Input box, with a chevron. The browser draws the list, so it works the same as
 * any select on every device, including phones' own pickers.
 */
export function NativeSelect(props: NativeSelectProps) {
  let select: HTMLSelectElement | undefined;
  const others = omit(controlProps(props), 'data', 'placeholder', 'children', 'value', 'ref');
  // Read once: options come from `data` or from children.
  const fromData = untrack(() => props.data !== undefined);
  const data = createMemo(() => props.data ?? [], { name: 'NativeSelect.data' });
  const selected = (value: string) => props.value !== undefined && String(props.value) === value;

  // Options passed as children can't be marked selected from here: set the value once they're in place.
  createEffect(
    () => props.value,
    (value) => {
      if (select && value !== undefined) select.value = String(value);
    },
    { name: 'NativeSelect.value' },
  );

  return (
    <FieldWrapper field={props} rootClass={`slp-native-select ${style.nativeSelect}`}>
      <Input
        {...(others as Record<string, unknown>)}
        as="select"
        // A ref is read once.
        ref={mergeRefs(
          (el: HTMLElement) => (select = el as HTMLSelectElement),
          untrack(() => props.ref),
        )}
        rightSection={
          <svg
            data-slot="native-select-chevron"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        }
      >
        <Show when={props.placeholder !== undefined}>
          <option value="" disabled selected={selected('')}>
            {props.placeholder}
          </option>
        </Show>
        {fromData ? (
          <For each={data()}>
            {(entry) =>
              typeof entry === 'object' && 'group' in entry ? (
                <optgroup label={entry.group}>
                  <For each={entry.items}>{(item) => <Option item={item} selected={selected} />}</For>
                </optgroup>
              ) : (
                <Option item={entry} selected={selected} />
              )
            }
          </For>
        ) : (
          props.children
        )}
      </Input>
    </FieldWrapper>
  );
}
