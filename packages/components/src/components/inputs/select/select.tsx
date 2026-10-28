import { createMemo, createSignal, For, omit, onSettled, Show, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './select.module.css';
import { Combobox, type ComboboxProps } from '../combobox/combobox';
import { createCombobox } from '../combobox/create-combobox';
import { normalizeData, type ComboboxData, type ComboboxGroup, type ComboboxItem } from '../combobox/combobox-data';
import { controlProps, FieldWrapper, type FieldWrapperProps } from '../field';
import { Input, type InputOwnProps } from '../input';
import { useInputWrapper } from '../input-wrapper';
import { createTypeahead } from '../../primitives';
import { callHandler, type ElementProps } from '../../../utils';

/** An option: its value, and the label shown for it (the value when there's none). */
export type SelectItem = ComboboxItem;

/** Options under a heading. */
export type SelectGroup = ComboboxGroup;

/** The options: strings, items, and groups of them, in the order they're shown. */
export type SelectData = ComboboxData;

export interface SelectOwnProps
  extends FieldWrapperProps, Pick<InputOwnProps, 'variant' | 'leftSection' | 'rightSection' | 'disabled'> {
  /** The options. */
  data: SelectData;
  /** The selected value, for a controlled select; `null` for none. */
  value?: string | null;
  /** The value it starts with, for an uncontrolled one. Read once. */
  defaultValue?: string | null;
  /** Called with the value and its item when another option is chosen. */
  onChange?: (value: string, item: SelectItem) => void;
  /** Shown while nothing is selected. */
  placeholder?: string;
  /** Submits the value with a form, through a hidden input. */
  name?: string;
  /** Shows the value without letting it change. */
  readOnly?: boolean;
  /** Where the dropdown goes and how it animates. */
  comboboxProps?: Pick<ComboboxProps, 'position' | 'offset' | 'matchTargetWidth' | 'transition' | 'transitionDuration'>;
}

export type SelectProps = ElementProps<JSX.HTMLAttributes<HTMLElement>, SelectOwnProps>;

function ChevronIcon() {
  return (
    <svg
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
      data-slot="select-option-check"
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

function SelectField(props: SelectProps) {
  const wrapper = useInputWrapper();
  const others = omit(
    controlProps(props) as SelectProps,
    'data',
    'value',
    'defaultValue',
    'onChange',
    'placeholder',
    'name',
    'readOnly',
    'disabled',
    'comboboxProps',
    'variant',
    'leftSection',
    'rightSection',
    'onKeyDown',
    'onMouseDown',
    'onClick',
  );

  const groups = createMemo(() => normalizeData(props.data), { name: 'Select.groups' });
  const items = createMemo(() => groups().flatMap((group) => group.items), { name: 'Select.items' });

  const [own, setOwn] = createSignal<string | null>(
    untrack(() => props.defaultValue ?? null),
    { name: 'Select.value' },
  );
  const value = () => (props.value !== undefined ? props.value : own());
  const selected = createMemo(() => items().find((item) => item.value === value()) ?? null, { name: 'Select.selected' });

  const typeahead = createTypeahead({
    count: () => items().length,
    current: () => {
      const id = combobox.activeId();
      const active = id === undefined ? null : document.getElementById(id);
      return active ? items().findIndex((item) => item.value === active.dataset.value) : -1;
    },
    getLabel: (index) => items()[index]?.label ?? '',
    isDisabled: (index) => !!items()[index]?.disabled,
    onMatch: (index) => {
      combobox.open();
      combobox.activate(items()[index].value);
    },
  });

  const combobox = createCombobox({
    onChange: (opened) => {
      if (!opened) typeahead.reset();
    },
  });

  const locked = () => !!props.disabled || !!props.readOnly;

  // Choosing the selected option again changes nothing, as in a native select.
  const pick = (next: string) => {
    const item = items().find((candidate) => candidate.value === next);
    if (!item || next === value()) return;
    if (props.value === undefined) setOwn(next);
    props.onChange?.(next, item);
  };

  const openFromPointer = () => {
    combobox.open();
    combobox.activateSelected();
  };

  let control: HTMLElement | undefined;
  let setReference: ((element: HTMLElement) => void) | undefined;

  // The dropdown is positioned against, and as wide as, the whole field box rather than the control in it, which
  // the sections make narrower. The box contains the control, so presses on it still count as inside.
  onSettled(() => {
    if (control?.parentElement) setReference?.(control.parentElement);
  });

  return (
    <>
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
          {(target) => {
            const onKeyDown = (event: KeyboardEvent) => {
              callHandler(props.onKeyDown, event);
              if (event.defaultPrevented || locked()) return;
              // Enter and Space open it, and Space chooses the active option, like a click.
              if (event.key === ' ' || (event.key === 'Enter' && !combobox.opened())) {
                event.preventDefault();
                if (!combobox.opened()) {
                  combobox.open();
                  if (!combobox.activateSelected()) combobox.activateFirst();
                } else if (!combobox.submitActive()) combobox.close();
                return;
              }
              typeahead.onKeyDown(event);
              if (!event.defaultPrevented) target.onKeyDown(event);
            };

            return (
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
                rightSection={props.rightSection ?? <ChevronIcon />}
                disabled={props.disabled}
                aria-readonly={props.readOnly ? 'true' : undefined}
                aria-required={wrapper?.required() ? 'true' : undefined}
                onKeyDown={onKeyDown}
                class={style.box}
                as="button"
                type="button"
                required={false}
                // A pointer opens it on press; Enter and Space from the keydown above. A click on the label only
                // focuses it.
                onMouseDown={(event: MouseEvent) => {
                  callHandler(props.onMouseDown, event);
                  if (event.defaultPrevented || event.button !== 0 || locked()) return;
                  if (combobox.opened()) combobox.close();
                  else openFromPointer();
                }}
                onClick={(event: MouseEvent) => {
                  callHandler(props.onClick, event);
                  control?.focus();
                }}
              >
                <span data-slot="select-value" data-placeholder={selected() ? undefined : ''} class={style.value}>
                  {selected()?.label ?? props.placeholder ?? ''}
                </span>
              </Input>
            );
          }}
        </Combobox.Target>
        <Combobox.Dropdown>
          <Combobox.Options
            aria-labelledby={wrapper?.labelId()}
            aria-label={wrapper?.labelId() ? undefined : props['aria-label']}
          >
            <For each={groups()}>
              {(group) => {
                const options = () => (
                  <For each={group.items}>
                    {(item) => (
                      <Combobox.Option
                        value={item.value}
                        selected={item.value === value()}
                        disabled={item.disabled}
                        class={style.option}
                      >
                        <span data-slot="select-option-label">{item.label}</span>
                        <CheckIcon />
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
      <Show when={props.name}>
        <input type="hidden" name={props.name} value={value() ?? ''} />
      </Show>
    </>
  );
}

/**
 * A labelled field that picks one value from a list in a dropdown, and behaves like a native select: the field is a
 * button showing the selection, from `data`, and the options are in a listbox. The arrow keys, Enter, Space, Escape
 * and typing work as in a native select, and the selection can't be cleared from it. Needs a `<SlopkitUi>` above it.
 */
export function Select(props: SelectProps) {
  return (
    <FieldWrapper field={props} rootClass="slp-select">
      <SelectField {...props} />
    </FieldWrapper>
  );
}
