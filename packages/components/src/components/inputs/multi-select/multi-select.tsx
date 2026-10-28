import { createMemo, createSignal, flush, For, omit, onSettled, Show, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './multi-select.module.css';
import { Combobox, type ComboboxProps } from '../combobox/combobox';
import { createCombobox } from '../combobox/create-combobox';
import { filterGroups, normalizeData, type ComboboxData, type ComboboxGroup, type ComboboxItem } from '../combobox/combobox-data';
import { controlProps, FieldWrapper, type FieldWrapperProps } from '../field';
import { type InputOwnProps } from '../input';
import { useInputWrapper } from '../input-wrapper';
import { Pill } from '../pill';
import { PillsInputBox, PillsInputField } from '../pills-input/pills-input';
import { CloseButton } from '../../button/close-button';
import { callHandler, type ElementProps } from '../../../utils';

/** An option: its value, and the label shown for it (the value when there's none). */
export type MultiSelectItem = ComboboxItem;

/** Options under a heading. */
export type MultiSelectGroup = ComboboxGroup;

/** The options: strings, items, and groups of them, in the order they're shown. */
export type MultiSelectData = ComboboxData;

export interface MultiSelectOwnProps
  extends FieldWrapperProps, Pick<InputOwnProps, 'variant' | 'leftSection' | 'rightSection' | 'disabled'> {
  /** The options. */
  data: MultiSelectData;
  /** The selected values, for a controlled field. */
  value?: readonly string[];
  /** The values it starts with, for an uncontrolled one. Read once. */
  defaultValue?: readonly string[];
  /** Called with the values and their items whenever the selection changes. */
  onChange?: (value: string[], items: MultiSelectItem[]) => void;
  /** Shown in the field while nothing is selected. */
  placeholder?: string;
  /** At most this many values can be selected; the other options are disabled once it's reached. */
  maxValues?: number;
  /** Leaves the selected options out of the dropdown. */
  hidePickedOptions?: boolean;
  /** Shows a button that clears the selection while there is one. */
  clearable?: boolean;
  /** The clear button's accessible name. Defaults to `Clear`. */
  clearLabel?: string;
  /** The first word of each pill's remove button name, followed by its label. Defaults to `Remove`. */
  removeLabel?: string;
  /** Shown in the dropdown when no option matches the search. Defaults to `Nothing found`. */
  nothingFoundMessage?: string;
  /** Submits the values with a form, through a hidden input for each. */
  name?: string;
  /** Shows the values without letting them change. */
  readOnly?: boolean;
  /** Where the dropdown goes and how it animates. */
  comboboxProps?: Pick<ComboboxProps, 'position' | 'offset' | 'matchTargetWidth' | 'transition' | 'transitionDuration'>;
}

export type MultiSelectProps = ElementProps<JSX.InputHTMLAttributes<HTMLInputElement>, MultiSelectOwnProps>;

function ChevronIcon() {
  return (
    <svg
      data-slot="multi-select-chevron"
      class={style.chevron}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      data-slot="multi-select-option-check"
      class={style.check}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function MultiSelectField(props: MultiSelectProps) {
  const wrapper = useInputWrapper();
  const others = omit(
    controlProps(props) as MultiSelectProps,
    'data',
    'value',
    'defaultValue',
    'onChange',
    'placeholder',
    'maxValues',
    'hidePickedOptions',
    'clearable',
    'clearLabel',
    'removeLabel',
    'nothingFoundMessage',
    'name',
    'readOnly',
    'disabled',
    'comboboxProps',
    'variant',
    'leftSection',
    'rightSection',
    'onKeyDown',
    'onInput',
  );

  const groups = createMemo(() => normalizeData(props.data), { name: 'MultiSelect.groups' });
  const items = createMemo(() => groups().flatMap((group) => group.items), { name: 'MultiSelect.items' });

  const [own, setOwn] = createSignal<readonly string[]>(
    untrack(() => props.defaultValue ?? []),
    { name: 'MultiSelect.value' },
  );
  const value = () => props.value ?? own();
  const isSelected = (candidate: string) => value().includes(candidate);
  const itemOf = (candidate: string): MultiSelectItem =>
    items().find((item) => item.value === candidate) ?? { value: candidate, label: candidate, disabled: false };
  const full = () => props.maxValues !== undefined && value().length >= props.maxValues;

  const [query, setQuery] = createSignal('', { name: 'MultiSelect.query' });
  const shown = createMemo(
    () => {
      const filtered = filterGroups(groups(), query());
      if (!props.hidePickedOptions) return filtered;
      return filtered
        .map((group) => ({ ...group, items: group.items.filter((item) => !isSelected(item.value)) }))
        .filter((group) => group.items.length > 0);
    },
    { name: 'MultiSelect.shown' },
  );

  // Closing drops what was typed, so the field never keeps a search nobody acted on.
  const combobox = createCombobox({ onChange: (opened) => !opened && setQuery('') });
  const locked = () => !!props.disabled || !!props.readOnly;

  let field: HTMLInputElement | undefined;
  let setReference: ((element: HTMLElement) => void) | undefined;

  // The dropdown is positioned against, and as wide as, the whole box: it grows as the pills wrap.
  onSettled(() => {
    const box = field?.closest<HTMLElement>('[data-slot="pills-input-box"]');
    if (box) setReference?.(box);
  });

  const setValue = (next: string[]) => {
    if (props.value === undefined) setOwn(next);
    props.onChange?.(next, next.map(itemOf));
  };

  const remove = (gone: string) => setValue(value().filter((other) => other !== gone));

  // Choosing a selected option takes it out; choosing another adds it, unless the limit is reached.
  const pick = (picked: string) => {
    if (isSelected(picked)) remove(picked);
    else if (!full()) setValue([...value(), picked]);
    else return;
    const searched = query() !== '';
    setQuery('');
    flush();
    // The option stays active where it is in the full list, or the first one is, when it's gone from the list.
    if (searched || props.hidePickedOptions) {
      if (!combobox.activate(picked)) combobox.activateFirst();
    }
  };

  const clear = () => {
    setValue([]);
    setQuery('');
    field?.focus();
  };

  const showClear = () => !!props.clearable && value().length > 0 && !locked();

  const onMouseDown = (event: MouseEvent) => {
    const target = event.target as Element;
    // The pills' remove buttons and the clear button keep their own behavior.
    if (event.button !== 0 || locked() || target.closest('button')) return;
    // A press in the field opens it (and places the caret); anywhere else on the box toggles it.
    if (target === field || !combobox.opened()) combobox.open();
    else combobox.close();
  };

  return (
    <>
      <Combobox
        store={combobox}
        onOptionSubmit={pick}
        closeOnOptionSubmit={false}
        position={props.comboboxProps?.position}
        offset={props.comboboxProps?.offset}
        matchTargetWidth={props.comboboxProps?.matchTargetWidth}
        transition={props.comboboxProps?.transition}
        transitionDuration={props.comboboxProps?.transitionDuration}
      >
        <PillsInputBox
          variant={props.variant}
          leftSection={props.leftSection}
          rightSection={
            <Show when={showClear()} fallback={props.rightSection ?? <ChevronIcon />}>
              <CloseButton size="xs" label={props.clearLabel ?? 'Clear'} onClick={clear} data-slot="multi-select-clear" />
            </Show>
          }
          disabled={props.disabled}
          data-read-only={props.readOnly ? '' : undefined}
          onMouseDown={onMouseDown}
        >
          <For each={value()}>
            {(selected) => (
              <Pill
                data-slot="multi-select-pill"
                withRemoveButton={!props.readOnly}
                removeLabel={props.removeLabel}
                onRemove={() => {
                  remove(selected);
                  field?.focus();
                }}
              >
                {itemOf(selected).label}
              </Pill>
            )}
          </For>
          <Combobox.Target>
            {(target) => (
              <PillsInputField
                {...(others as Record<string, unknown>)}
                {...target}
                ref={(element: HTMLInputElement) => {
                  field = element;
                  setReference = target.ref;
                  target.ref(element);
                }}
                type="text"
                autocomplete="off"
                aria-autocomplete="list"
                // The values are the pills, not the text: an empty field doesn't make a required one invalid.
                required={false}
                aria-required={wrapper?.required() ? 'true' : undefined}
                aria-readonly={props.readOnly ? 'true' : undefined}
                readonly={props.readOnly}
                placeholder={value().length === 0 ? props.placeholder : undefined}
                value={query()}
                onInput={(event: InputEvent) => {
                  callHandler(props.onInput, event);
                  setQuery((event.currentTarget as HTMLInputElement).value);
                  if (locked()) return;
                  combobox.open();
                  combobox.activateFirst();
                }}
                onKeyDown={(event: KeyboardEvent) => {
                  callHandler(props.onKeyDown, event);
                  if (event.defaultPrevented || locked()) return;
                  // Backspace in an empty field takes out the last value.
                  if (event.key === 'Backspace' && query() === '' && value().length > 0) {
                    remove(value()[value().length - 1]);
                    return;
                  }
                  target.onKeyDown(event);
                }}
              />
            )}
          </Combobox.Target>
        </PillsInputBox>
        <Combobox.Dropdown>
          <Combobox.Options
            aria-multiselectable="true"
            aria-labelledby={wrapper?.labelId()}
            aria-label={wrapper?.labelId() ? undefined : props['aria-label']}
          >
            <For each={shown()}>
              {(group) => {
                const options = () => (
                  <For each={group.items}>
                    {(item) => (
                      <Combobox.Option
                        value={item.value}
                        selected={isSelected(item.value)}
                        disabled={item.disabled || (full() && !isSelected(item.value))}
                        class={style.option}
                      >
                        <CheckIcon />
                        <span data-slot="multi-select-option-label">{item.label}</span>
                      </Combobox.Option>
                    )}
                  </For>
                );
                return group.group === undefined ? options() : <Combobox.Group label={group.group}>{options()}</Combobox.Group>;
              }}
            </For>
          </Combobox.Options>
          <Show when={shown().length === 0}>
            <Combobox.Empty>{props.nothingFoundMessage ?? 'Nothing found'}</Combobox.Empty>
          </Show>
        </Combobox.Dropdown>
      </Combobox>
      <Show when={props.name}>
        <For each={value()}>{(selected) => <input type="hidden" name={props.name} value={selected} />}</For>
      </Show>
    </>
  );
}

/**
 * A labelled field that picks several values from a list in a dropdown: the selection, from `data`, as pills in a
 * field box, and a text field after them that filters the options. Choosing an option adds it, or takes it out when
 * it's selected, and keeps the dropdown open; Backspace in the empty field takes out the last value. Needs a
 * `<SlopkitUi>` above it.
 */
export function MultiSelect(props: MultiSelectProps) {
  return (
    <FieldWrapper field={props} rootClass="slp-multi-select">
      <MultiSelectField {...props} />
    </FieldWrapper>
  );
}
