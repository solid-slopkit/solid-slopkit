import { createMemo, createSignal, flush, For, omit, onSettled, Show, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { Combobox, type ComboboxProps } from '../combobox/combobox';
import { createCombobox } from '../combobox/create-combobox';
import { filterGroups, normalizeData, type ComboboxData, type ComboboxGroup } from '../combobox/combobox-data';
import { controlProps, FieldWrapper, type FieldWrapperProps } from '../field';
import { type InputOwnProps } from '../input';
import { useInputWrapper } from '../input-wrapper';
import { Pill } from '../pill';
import { PillsInputBox, PillsInputField } from '../pills-input/pills-input';
import { CloseButton } from '../../button/close-button';
import { callHandler, type ElementProps } from '../../../utils';

/** A suggestion: the tag it adds. A disabled one can't be chosen. */
export interface TagsInputItem {
  value: string;
  disabled?: boolean;
}

/** Suggestions under a heading. */
export type TagsInputGroup = ComboboxGroup<string | TagsInputItem>;

/** The suggestions: strings, items, and groups of them, in the order they're shown. */
export type TagsInputData = ComboboxData<string | TagsInputItem>;

export interface TagsInputOwnProps
  extends FieldWrapperProps, Pick<InputOwnProps, 'variant' | 'leftSection' | 'rightSection' | 'disabled'> {
  /** The tags, for a controlled field. */
  value?: readonly string[];
  /** The tags it starts with, for an uncontrolled one. Read once. */
  defaultValue?: readonly string[];
  /** Called with the tags whenever one is added or removed. */
  onChange?: (value: string[]) => void;
  /** Suggestions offered in a dropdown while typing. Without them there's no dropdown. */
  data?: TagsInputData;
  /** Shown in the field while there are no tags. */
  placeholder?: string;
  /** At most this many tags; nothing more is added once it's reached. */
  maxTags?: number;
  /** Lets the same tag be added more than once. Defaults to `false`. */
  allowDuplicates?: boolean;
  /** Called with a tag that wasn't added because it's already there. */
  onDuplicate?: (value: string) => void;
  /** Typing or pasting one of these adds what's before it as a tag. Defaults to `[',']`. */
  splitChars?: readonly string[];
  /** Adds what's typed when the field loses focus. Defaults to `true`. */
  acceptValueOnBlur?: boolean;
  /** Shows a button that removes every tag while there are any. */
  clearable?: boolean;
  /** The clear button's accessible name. Defaults to `Clear`. */
  clearLabel?: string;
  /** The first word of each pill's remove button name, followed by its tag. Defaults to `Remove`. */
  removeLabel?: string;
  /** Submits the tags with a form, through a hidden input for each. */
  name?: string;
  /** Shows the tags without letting them change. */
  readOnly?: boolean;
  /** Where the dropdown goes and how it animates. */
  comboboxProps?: Pick<ComboboxProps, 'position' | 'offset' | 'matchTargetWidth' | 'transition' | 'transitionDuration'>;
}

export type TagsInputProps = ElementProps<JSX.InputHTMLAttributes<HTMLInputElement>, TagsInputOwnProps>;

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function TagsInputField(props: TagsInputProps) {
  const wrapper = useInputWrapper();
  const others = omit(
    controlProps(props) as TagsInputProps,
    'value',
    'defaultValue',
    'onChange',
    'data',
    'placeholder',
    'maxTags',
    'allowDuplicates',
    'onDuplicate',
    'splitChars',
    'acceptValueOnBlur',
    'clearable',
    'clearLabel',
    'removeLabel',
    'name',
    'readOnly',
    'disabled',
    'comboboxProps',
    'variant',
    'leftSection',
    'rightSection',
    'onKeyDown',
    'onInput',
    'onClick',
    'onBlur',
  );

  const [own, setOwn] = createSignal<readonly string[]>(
    untrack(() => props.defaultValue ?? []),
    { name: 'TagsInput.value' },
  );
  const value = () => props.value ?? own();
  const [query, setQuery] = createSignal('', { name: 'TagsInput.query' });

  const groups = createMemo(() => normalizeData(props.data ?? []), { name: 'TagsInput.groups' });
  // The suggestions that contain what's typed, without the tags already added.
  const shown = createMemo(
    () => {
      const filtered = filterGroups(groups(), query());
      if (props.allowDuplicates) return filtered;
      return filtered
        .map((group) => ({ ...group, items: group.items.filter((item) => !value().includes(item.value)) }))
        .filter((group) => group.items.length > 0);
    },
    { name: 'TagsInput.shown' },
  );
  const hasSuggestions = () => shown().length > 0;

  const combobox = createCombobox();
  const locked = () => !!props.disabled || !!props.readOnly;

  let field: HTMLInputElement | undefined;
  let setReference: ((element: HTMLElement) => void) | undefined;
  // The Combobox target's key handler, for the field's own.
  let target: { onKeyDown: (event: KeyboardEvent) => void } | undefined;

  // The dropdown is positioned against, and as wide as, the whole box: it grows as the tags wrap.
  onSettled(() => {
    const box = field?.closest<HTMLElement>('[data-slot="pills-input-box"]');
    if (box) setReference?.(box);
  });

  const setValue = (next: string[]) => {
    if (props.value === undefined) setOwn(next);
    props.onChange?.(next);
  };

  /** Adds the tags that are new, up to the limit. Returns whether all of them were added (or were empty). */
  const add = (raw: readonly string[]) => {
    const next = [...value()];
    let all = true;
    for (const tag of raw.map((text) => text.trim()).filter(Boolean)) {
      if (props.maxTags !== undefined && next.length >= props.maxTags) all = false;
      else if (!props.allowDuplicates && next.includes(tag)) {
        props.onDuplicate?.(tag);
        all = false;
      } else next.push(tag);
    }
    if (next.length !== value().length) setValue(next);
    return all;
  };

  const remove = (index: number) => setValue(value().filter((_, other) => other !== index));

  // What's typed becomes a tag; it stays in the field when it couldn't be added, so it isn't lost.
  const commit = () => {
    if (add([query()])) setQuery('');
  };

  const pick = (suggestion: string) => {
    add([suggestion]);
    setQuery('');
  };

  const clear = () => {
    setValue([]);
    setQuery('');
    field?.focus();
  };

  const showClear = () => !!props.clearable && value().length > 0 && !locked();

  const onInput = (event: InputEvent) => {
    callHandler(props.onInput, event);
    const input = event.currentTarget as HTMLInputElement;
    let text = input.value;
    const splitChars = props.splitChars ?? [','];
    if (!locked() && splitChars.length > 0) {
      const parts = text.split(new RegExp(splitChars.map(escapeRegExp).join('|')));
      if (parts.length > 1) {
        // The last part is still being typed; the ones before it are tags.
        text = parts.pop()!;
        add(parts);
        // Set on the element too: the signal may already hold this text, and then wouldn't update it.
        input.value = text;
      }
    }
    setQuery(text);
    flush();
    if (locked()) return;
    // Typing never makes a suggestion active: Enter adds what was typed until the arrows move to one.
    if (hasSuggestions()) {
      combobox.open();
      combobox.clearActive();
    } else combobox.close();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    callHandler(props.onKeyDown, event);
    if (event.defaultPrevented || locked() || event.isComposing) return;
    if (event.key === 'Backspace' && query() === '' && value().length > 0) {
      remove(value().length - 1);
      return;
    }
    // Enter adds what's typed, unless the arrows moved to a suggestion; with nothing typed it submits a form as usual.
    if (event.key === 'Enter' && !(combobox.opened() && combobox.activeId()) && query().trim()) {
      event.preventDefault();
      commit();
      combobox.close();
      return;
    }
    // Nothing to open onto.
    if (!combobox.opened() && !hasSuggestions() && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) return;
    target?.onKeyDown(event);
  };

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
        <PillsInputBox
          variant={props.variant}
          leftSection={props.leftSection}
          rightSection={
            <Show when={showClear()} fallback={props.rightSection}>
              <CloseButton size="xs" label={props.clearLabel ?? 'Clear'} onClick={clear} data-slot="tags-input-clear" />
            </Show>
          }
          disabled={props.disabled}
          data-read-only={props.readOnly ? '' : undefined}
        >
          <For each={value()}>
            {(tag, index) => (
              <Pill
                data-slot="tags-input-pill"
                withRemoveButton={!props.readOnly}
                removeLabel={props.removeLabel}
                onRemove={() => {
                  remove(index());
                  field?.focus();
                }}
              >
                {tag}
              </Pill>
            )}
          </For>
          <Combobox.Target>
            {(attributes) => {
              target = attributes;
              return (
                <PillsInputField
                  {...(others as Record<string, unknown>)}
                  {...attributes}
                  ref={(element: HTMLInputElement) => {
                    field = element;
                    setReference = attributes.ref;
                    attributes.ref(element);
                  }}
                  type="text"
                  autocomplete="off"
                  aria-autocomplete={props.data ? 'list' : undefined}
                  // The tags are the pills, not the text: an empty field doesn't make a required one invalid.
                  required={false}
                  aria-required={wrapper?.required() ? 'true' : undefined}
                  aria-readonly={props.readOnly ? 'true' : undefined}
                  readonly={props.readOnly}
                  placeholder={value().length === 0 ? props.placeholder : undefined}
                  value={query()}
                  onInput={onInput}
                  onKeyDown={onKeyDown}
                  onClick={(event: MouseEvent) => {
                    callHandler(props.onClick, event);
                    if (!event.defaultPrevented && !locked() && hasSuggestions()) combobox.open();
                  }}
                  onBlur={(event: FocusEvent) => {
                    callHandler(props.onBlur, event);
                    if (!locked() && (props.acceptValueOnBlur ?? true)) commit();
                  }}
                />
              );
            }}
          </Combobox.Target>
        </PillsInputBox>
        <Combobox.Dropdown>
          <Combobox.Options
            aria-labelledby={wrapper?.labelId()}
            aria-label={wrapper?.labelId() ? undefined : props['aria-label']}
          >
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
      <Show when={props.name}>
        <For each={value()}>{(tag) => <input type="hidden" name={props.name} value={tag} />}</For>
      </Show>
    </>
  );
}

/**
 * A labelled field of free-text tags, shown as pills: Enter, or a comma, adds what's typed as a tag, and Backspace
 * in the empty field removes the last one. `data` offers suggestions in a dropdown while typing. Needs a
 * `<SlopkitUi>` above it.
 */
export function TagsInput(props: TagsInputProps) {
  return (
    <FieldWrapper field={props} rootClass="slp-tags-input">
      <TagsInputField {...props} />
    </FieldWrapper>
  );
}
