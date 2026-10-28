import { createMemo, createSignal, flush, For, omit, onSettled, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { Combobox, type ComboboxProps } from '../combobox/combobox';
import { createCombobox } from '../combobox/create-combobox';
import {
  filterGroups,
  normalizeData,
  type ComboboxData,
  type ComboboxGroup,
  type NormalizedGroup,
} from '../combobox/combobox-data';
import { controlProps, FieldWrapper, type FieldWrapperProps } from '../field';
import { Input, type InputOwnProps } from '../input';
import { useInputWrapper } from '../input-wrapper';
import { callHandler, type ElementProps } from '../../../utils';

/** A suggestion: the text it fills the field with. A disabled one can't be chosen. */
export interface AutocompleteItem {
  value: string;
  disabled?: boolean;
}

/** Suggestions under a heading. */
export type AutocompleteGroup = ComboboxGroup<string | AutocompleteItem>;

/** The suggestions: strings, items, and groups of them, in the order they're shown. */
export type AutocompleteData = ComboboxData<string | AutocompleteItem>;

export interface AutocompleteOwnProps
  extends FieldWrapperProps, Pick<InputOwnProps, 'variant' | 'leftSection' | 'rightSection' | 'disabled' | 'readOnly'> {
  /** The suggestions. */
  data: AutocompleteData;
  /** The text, for a controlled field. */
  value?: string;
  /** The text it starts with, for an uncontrolled one. Read once. */
  defaultValue?: string;
  /** Called with the text whenever it changes: typed, or filled in from a suggestion. */
  onChange?: (value: string) => void;
  /** Called with a suggestion's value when it's chosen. */
  onOptionSubmit?: (value: string) => void;
  /** At most this many suggestions are shown. */
  limit?: number;
  /** Where the dropdown goes and how it animates. */
  comboboxProps?: Pick<ComboboxProps, 'position' | 'offset' | 'matchTargetWidth' | 'transition' | 'transitionDuration'>;
}

export type AutocompleteProps = ElementProps<JSX.InputHTMLAttributes<HTMLInputElement>, AutocompleteOwnProps>;

/** The first `limit` items, across the groups, without the groups left empty. */
function limitGroups(groups: NormalizedGroup[], limit: number | undefined): NormalizedGroup[] {
  if (limit === undefined) return groups;
  let left = Math.max(0, limit);
  const limited: NormalizedGroup[] = [];
  for (const group of groups) {
    if (left === 0) break;
    const items = group.items.slice(0, left);
    left -= items.length;
    limited.push({ ...group, items });
  }
  return limited;
}

function AutocompleteField(props: AutocompleteProps) {
  const wrapper = useInputWrapper();
  const others = omit(
    controlProps(props) as AutocompleteProps,
    'data',
    'value',
    'defaultValue',
    'onChange',
    'onOptionSubmit',
    'limit',
    'comboboxProps',
    'variant',
    'leftSection',
    'rightSection',
    'disabled',
    'readOnly',
    'onKeyDown',
    'onClick',
    'onInput',
  );

  const [own, setOwn] = createSignal(
    untrack(() => props.defaultValue ?? ''),
    { name: 'Autocomplete.value' },
  );
  const value = () => props.value ?? own();

  const groups = createMemo(() => normalizeData(props.data), { name: 'Autocomplete.groups' });
  // The suggestions that contain what's typed; all of them while the field is empty.
  const shown = createMemo(() => limitGroups(filterGroups(groups(), value()), props.limit), { name: 'Autocomplete.shown' });
  const hasSuggestions = () => shown().some((group) => group.items.length > 0);

  const combobox = createCombobox();
  const locked = () => !!props.disabled || !!props.readOnly;

  const setValue = (next: string) => {
    if (props.value === undefined) setOwn(next);
    props.onChange?.(next);
  };

  const pick = (next: string) => {
    setValue(next);
    props.onOptionSubmit?.(next);
  };

  let control: HTMLElement | undefined;
  let setReference: ((element: HTMLElement) => void) | undefined;

  // The dropdown is positioned against, and as wide as, the whole field box rather than the input in it.
  onSettled(() => {
    if (control?.parentElement) setReference?.(control.parentElement);
  });

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={pick}
      position={props.comboboxProps?.position}
      offset={props.comboboxProps?.offset}
      matchTargetWidth={props.comboboxProps?.matchTargetWidth}
      transition={props.comboboxProps?.transition}
      transitionDuration={props.comboboxProps?.transitionDuration}
    >
      <Combobox.Target>
        {(target) => (
          <Input
            {...(others as Record<string, unknown>)}
            {...target}
            ref={(element: HTMLElement) => {
              control = element;
              setReference = target.ref;
              target.ref(element);
            }}
            variant={props.variant}
            leftSection={props.leftSection}
            rightSection={props.rightSection}
            disabled={props.disabled}
            readOnly={props.readOnly}
            type="text"
            autocomplete="off"
            aria-autocomplete="list"
            aria-required={wrapper?.required() ? 'true' : undefined}
            value={value()}
            onInput={(event: InputEvent) => {
              callHandler(props.onInput, event);
              setValue((event.currentTarget as HTMLInputElement).value);
              // The suggestions follow the new text before deciding whether there are any.
              flush();
              if (locked()) return;
              // Typing never makes a suggestion active: Enter keeps what was typed until the arrows move to one.
              if (hasSuggestions()) {
                combobox.open();
                combobox.clearActive();
              } else combobox.close();
            }}
            onClick={(event: MouseEvent) => {
              callHandler(props.onClick, event);
              if (!event.defaultPrevented && !locked() && hasSuggestions()) combobox.open();
            }}
            onKeyDown={(event: KeyboardEvent) => {
              callHandler(props.onKeyDown, event);
              if (event.defaultPrevented || locked()) return;
              // Nothing to open onto.
              if (!combobox.opened() && !hasSuggestions() && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) return;
              target.onKeyDown(event);
            }}
          />
        )}
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options aria-labelledby={wrapper?.labelId()} aria-label={wrapper?.labelId() ? undefined : props['aria-label']}>
          <For each={shown()}>
            {(group) => {
              const options = () => (
                <For each={group.items}>
                  {(item) => (
                    <Combobox.Option value={item.value} disabled={item.disabled}>
                      {item.label}
                    </Combobox.Option>
                  )}
                </For>
              );
              return group.group === undefined ? options() : <Combobox.Group label={group.group}>{options()}</Combobox.Group>;
            }}
          </For>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

/**
 * A labelled text field with suggestions: what's typed is the value, and the suggestions from `data` that contain it
 * are offered in a dropdown to fill it in. The arrows move to a suggestion and Enter fills it in; otherwise Enter keeps
 * what was typed. Needs a `<SlopkitUi>` above it.
 */
export function Autocomplete(props: AutocompleteProps) {
  return (
    <FieldWrapper field={props} rootClass="slp-autocomplete">
      <AutocompleteField {...props} />
    </FieldWrapper>
  );
}
