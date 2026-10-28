import { createSignal, createUniqueId, flush, omit, onSettled, Show, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './color-input.module.css';
import { ColorPicker } from '../color-picker';
import { formatColor, hasAlpha, parseColor, type ColorFormat } from '../color-picker/color';
import { controlProps, FieldDropdown, FieldWrapper, type FieldWrapperProps } from '../field';
import { Input, type InputOwnProps } from '../input';
import { useInputWrapper } from '../input-wrapper';
import { ActionIcon } from '../../button/action-icon';
import { ColorSwatch } from '../../data-display/color-swatch';
import { createDismissal, createFloating, createPresence, type FloatingPlacement } from '../../primitives';
import { transitionAttributes, type TransitionName } from '../../utilities/transition/transition-attributes';
import { callHandler, mergeRefs, type ElementProps } from '../../../utils';
import type { SlopSize } from '../../../core';

/** The global the browser's eye dropper is on, where it has one. */
interface EyeDropperConstructor {
  new (): { open: () => Promise<{ sRGBHex: string }> };
}

export interface ColorInputOwnProps
  extends FieldWrapperProps, Pick<InputOwnProps, 'variant' | 'leftSection' | 'rightSection' | 'disabled' | 'readOnly'> {
  /** The color, for a controlled field, in `format`; `''` for none. */
  value?: string;
  /** The color it starts with, for an uncontrolled one. Read once. Defaults to `''`. */
  defaultValue?: string;
  /** Called with the color, in `format`, whenever it changes: typed, picked or dragged; `''` when the field is emptied. */
  onChange?: (value: string) => void;
  /** Called with the color when a change is done: a drag ends, a swatch or the eye dropper picks one, or the field is left. */
  onChangeEnd?: (value: string) => void;
  /** The format of the value. Formats with alpha (`hexa`, `rgba`, `hsla`) add an alpha slider. Defaults to `hex`. */
  format?: ColorFormat;
  /** Colors to pick with one click, under the sliders. */
  swatches?: readonly string[];
  /** Swatches per row. Defaults to 7. */
  swatchesPerRow?: number;
  /** Shows the picker in a dropdown. Defaults to `true`. */
  withPicker?: boolean;
  /** Shows a button that picks a color from the screen, where the browser can. Defaults to `true`. */
  withEyeDropper?: boolean;
  /** The eye dropper button's accessible name. Defaults to `Pick a color from the screen`. */
  eyeDropperLabel?: string;
  /** Hides the swatch of the color in front of the text. */
  hideSwatch?: boolean;
  /** Where the dropdown goes against the field. Defaults to `bottom-start`. */
  position?: FloatingPlacement;
  /** Gap between the field and the dropdown, in px. Defaults to 4. */
  offset?: number;
  /** The dropdown's animation. Defaults to `fade`. */
  transition?: TransitionName;
  /** Duration of the animation, in ms. Defaults to 150. */
  transitionDuration?: number;
}

export type ColorInputProps = ElementProps<JSX.InputHTMLAttributes<HTMLInputElement>, ColorInputOwnProps>;

// The swatch in front of the text, a step or two smaller than the field.
const SWATCH_SIZE: Record<SlopSize, SlopSize> = { xs: 'xs', sm: 'xs', md: 'sm', lg: 'md', xl: 'md' };

function EyeDropperIcon() {
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
      <path d="m2 22 1-1h3l9-9" />
      <path d="M3 21v-3l9-9" />
      <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
    </svg>
  );
}

function ColorInputField(props: ColorInputProps) {
  const wrapper = useInputWrapper();
  const others = omit(
    controlProps(props) as ColorInputProps,
    'value',
    'defaultValue',
    'onChange',
    'onChangeEnd',
    'format',
    'swatches',
    'swatchesPerRow',
    'withPicker',
    'withEyeDropper',
    'eyeDropperLabel',
    'hideSwatch',
    'position',
    'offset',
    'transition',
    'transitionDuration',
    'variant',
    'leftSection',
    'rightSection',
    'disabled',
    'readOnly',
    'onInput',
    'onClick',
    'onKeyDown',
    'onFocusOut',
  );
  const format = () => props.format ?? 'hex';

  const [own, setOwn] = createSignal(
    untrack(() => props.defaultValue ?? ''),
    { name: 'ColorInput.value' },
  );
  const value = () => props.value ?? own();
  // What's typed, while it's being edited; the value, formatted, otherwise.
  const [draft, setDraft] = createSignal<string | undefined>(undefined, { name: 'ColorInput.draft' });

  /** The text as a color in `format`, `''` for an empty one, or `undefined` when it isn't a color. */
  const normalize = (text: string) => {
    if (!text.trim()) return '';
    const parsed = parseColor(text.trim());
    if (!parsed) return undefined;
    return formatColor(hasAlpha(format()) ? parsed : { ...parsed, a: 1 }, format());
  };

  const setValue = (next: string) => {
    if (next === value()) return;
    if (props.value === undefined) setOwn(next);
    props.onChange?.(next);
  };

  // An edit is done: the field shows the value again, which drops a draft that isn't a color.
  const commit = () => {
    // A draft typed in the same task, such as just before a blur, is read once it's applied.
    flush();
    if (draft() === undefined) return;
    setDraft(undefined);
    props.onChangeEnd?.(value());
  };

  const locked = () => !!props.disabled || !!props.readOnly;
  const withPicker = () => props.withPicker ?? true;

  const [opened, setOpened] = createSignal(false, { name: 'ColorInput.opened' });
  let field: HTMLInputElement | undefined;
  let box: HTMLElement | undefined;
  let dropdown: HTMLDivElement | undefined;
  const dropdownId = `slp-color-input-${createUniqueId()}`;

  const open = () => {
    if (withPicker() && !locked()) setOpened(true);
  };
  const close = () => {
    // Focus in the picker goes back to the field rather than to the page.
    if (dropdown?.contains(document.activeElement)) field?.focus();
    setOpened(false);
  };

  const presence = createPresence({ present: opened, element: () => dropdown });
  const floating = createFloating({
    reference: () => box,
    floating: () => dropdown,
    open: presence.mounted,
    placement: () => props.position ?? 'bottom-start',
    offset: () => props.offset ?? 4,
  });
  createDismissal('ColorInput', {
    open: opened,
    elements: () => [box, dropdown],
    onDismiss: close,
  });
  const animation = transitionAttributes(presence, {
    transition: () => props.transition ?? 'fade',
    duration: () => props.transitionDuration ?? 150,
    exitDuration: () => undefined,
    timingFunction: () => 'ease',
  });

  // Focus that leaves both the field and the picker closes it.
  const onFocusOut = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && (box?.contains(next) || dropdown?.contains(next))) return;
    setOpened(false);
  };

  // The eye dropper is shown once hydrated, where the browser has one, so the server render matches.
  const [eyeDropper, setEyeDropper] = createSignal<EyeDropperConstructor | undefined>(undefined, {
    name: 'ColorInput.eyeDropper',
  });
  onSettled(() => {
    // The field box, not the input in it, is what the dropdown sits under.
    box = field?.parentElement ?? undefined;
    const EyeDropper = (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper;
    if (EyeDropper) setEyeDropper(() => EyeDropper);
  });

  const pickFromScreen = async () => {
    const EyeDropper = eyeDropper();
    if (!EyeDropper) return;
    try {
      const { sRGBHex } = await new EyeDropper().open();
      const next = normalize(sRGBHex);
      if (next === undefined) return;
      setDraft(undefined);
      setValue(next);
      props.onChangeEnd?.(next);
    } catch {
      // Escape cancels the eye dropper.
    }
  };

  const rightSection = () =>
    props.rightSection ??
    (eyeDropper() && (props.withEyeDropper ?? true) && !locked() ? (
      <ActionIcon
        variant="ghost"
        size="xs"
        label={props.eyeDropperLabel ?? 'Pick a color from the screen'}
        onClick={() => void pickFromScreen()}
        data-slot="color-input-eye-dropper"
      >
        <EyeDropperIcon />
      </ActionIcon>
    ) : undefined);

  return (
    <>
      <Input
        {...(others as Record<string, unknown>)}
        // A ref is read once.
        ref={mergeRefs(
          (element: HTMLElement) => (field = element as HTMLInputElement),
          untrack(() => props.ref) as (element: HTMLElement) => void,
        )}
        variant={props.variant}
        leftSection={
          props.leftSection ??
          (props.hideSwatch ? undefined : (
            <ColorSwatch
              value={value() || 'transparent'}
              size={SWATCH_SIZE[wrapper?.size() ?? 'md']}
              aria-hidden="true"
              data-slot="color-input-swatch"
            />
          ))
        }
        rightSection={rightSection()}
        disabled={props.disabled}
        readOnly={props.readOnly}
        type="text"
        autocomplete="off"
        spellcheck={false}
        // A text field that opens a dialog is a combobox; without the picker it's a plain text field.
        role={withPicker() ? 'combobox' : undefined}
        aria-haspopup={withPicker() ? 'dialog' : undefined}
        aria-expanded={withPicker() ? (opened() ? 'true' : 'false') : undefined}
        aria-controls={presence.mounted() ? dropdownId : undefined}
        value={draft() ?? value()}
        onInput={(event: InputEvent) => {
          callHandler(props.onInput, event);
          const text = (event.currentTarget as HTMLInputElement).value;
          setDraft(text);
          const next = normalize(text);
          if (next !== undefined) setValue(next);
        }}
        onClick={(event: MouseEvent) => {
          callHandler(props.onClick, event);
          if (!event.defaultPrevented) open();
        }}
        onKeyDown={(event: KeyboardEvent) => {
          callHandler(props.onKeyDown, event);
          if (event.defaultPrevented || event.isComposing) return;
          if (event.key === 'Enter') commit();
          else if (event.key === 'ArrowDown' && !opened() && withPicker() && !locked()) {
            event.preventDefault();
            open();
          }
        }}
        onFocusOut={(event: FocusEvent) => {
          callHandler(props.onFocusOut, event);
          commit();
          onFocusOut(event);
        }}
      />
      <Show when={presence.mounted()}>
        <FieldDropdown
          ref={(element) => (dropdown = element)}
          id={dropdownId}
          slug="color-input"
          class={style.dropdown}
          aria-label={props['aria-label']}
          floating={floating}
          animation={animation}
          onFocusOut={onFocusOut}
        >
          <ColorPicker
            value={value()}
            onChange={(next) => {
              setDraft(undefined);
              setValue(next);
            }}
            onChangeEnd={(next) => props.onChangeEnd?.(next)}
            format={format()}
            swatches={props.swatches}
            swatchesPerRow={props.swatchesPerRow}
            size={wrapper?.size()}
          />
        </FieldDropdown>
      </Show>
    </>
  );
}

/**
 * A labelled text field for a color: the color as text, with a swatch of it in front, and a ColorPicker in a dropdown
 * that opens on a click or ArrowDown. Typing a color in hex, `rgb()` or `hsl()` sets it; leaving the field shows it in
 * `format`. Where the browser has an eye dropper, a button picks a color from the screen. Needs a `<SlopkitUi>` above
 * it.
 */
export function ColorInput(props: ColorInputProps) {
  return (
    <FieldWrapper field={props} rootClass="slp-color-input">
      <ColorInputField {...props} />
    </FieldWrapper>
  );
}
