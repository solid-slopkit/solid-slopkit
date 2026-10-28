import { createEffect, createSignal, createUniqueId, flush, omit, Show, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './file-input.module.css';
import { callHandler, type ElementProps } from '../../../utils';
import { CloseButton } from '../../button/close-button';
import { controlProps, FieldWrapper, type FieldWrapperProps } from '../field';
import { Input, type InputOwnProps } from '../input';

type FileInputValue<Multiple extends boolean> = Multiple extends true ? File[] : File | null;

export interface FileInputOwnProps<Multiple extends boolean = false>
  extends FieldWrapperProps, Pick<InputOwnProps, 'variant' | 'leftSection' | 'disabled' | 'ref'> {
  /** Lets the user pick several files: the value is then an array. Read once. */
  multiple?: Multiple;
  /** The chosen file (or files), for a controlled field. */
  value?: FileInputValue<Multiple>;
  /** The files at first, for an uncontrolled field. */
  defaultValue?: FileInputValue<Multiple>;
  /** Called with the chosen file (or files), and with `null` (or `[]`) when cleared. Not called on cancel. */
  onChange?: (value: FileInputValue<Multiple>) => void;
  /** File types to offer, as in the input's `accept`: extensions or MIME types. */
  accept?: string;
  /** On phones, opens the camera instead of the files. */
  capture?: 'user' | 'environment';
  /** Submits the files with a form under this name. */
  name?: string;
  /** Shown while no file is chosen. Defaults to `Choose a file`, or `Choose files` with `multiple`. */
  placeholder?: string;
  /** How the chosen files show in the field. Defaults to their names, separated by commas. */
  valueFormat?: (files: File[]) => JSX.Element;
  /** Adds a button that clears the files. Read once. */
  clearable?: boolean;
  /** Accessible name of the clear button. Defaults to `Clear`. */
  clearLabel?: string;
  /** Content after the files, when not clearable. */
  rightSection?: JSX.Element;
}

export type FileInputProps<Multiple extends boolean = false> = ElementProps<
  Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'value' | 'onChange'>,
  FileInputOwnProps<Multiple>
>;

const toArray = (value: File | File[] | null | undefined): File[] =>
  value == null ? [] : Array.isArray(value) ? value : [value];

/**
 * A labelled field for files: it looks like a text field, and its control is a button that opens the browser's
 * file picker and shows the chosen file names. A hidden `input type="file"` keeps the files for a form.
 */
export function FileInput<Multiple extends boolean = false>(props: FileInputProps<Multiple>) {
  let fileInput: HTMLInputElement | undefined;
  const own = props as unknown as FileInputProps<boolean>;
  const others = omit(
    controlProps(own),
    'multiple',
    'value',
    'defaultValue',
    'onChange',
    'accept',
    'capture',
    'name',
    'placeholder',
    'valueFormat',
    'clearable',
    'clearLabel',
    'rightSection',
    'onClick',
    'aria-describedby',
  );
  const multiple = untrack(() => !!own.multiple);
  const clearable = untrack(() => !!own.clearable);
  const valueId = `slp-${createUniqueId()}-value`;

  const controlled = untrack(() => 'value' in own);
  const [state, setState] = createSignal<File[]>(
    untrack(() => toArray(own.defaultValue)),
    { name: 'FileInput.files' },
  );
  const files = () => (controlled ? toArray(own.value) : state());

  const set = (next: File[]) => {
    if (!controlled) setState(next);
    (own.onChange as ((value: File | File[] | null) => void) | undefined)?.(multiple ? next : (next[0] ?? null));
    flush();
  };

  // The hidden input holds the files the field shows, so a form submits them: after a choice the parent didn't
  // apply, after clearing, and for a controlled value set from outside.
  createEffect(files, (list) => {
    if (!fileInput || typeof DataTransfer === 'undefined') return;
    const transfer = new DataTransfer();
    for (const file of list) transfer.items.add(file);
    fileInput.files = transfer.files;
  });

  const onClick = (event: MouseEvent) => {
    callHandler(own.onClick, event);
    if (!event.defaultPrevented) fileInput?.click();
  };

  const onFileChange = () => {
    const chosen = Array.from(fileInput?.files ?? []);
    if (chosen.length > 0) set(chosen);
  };

  const shown = () => {
    const list = files();
    if (list.length === 0)
      return <span class={style.placeholder}>{own.placeholder ?? (multiple ? 'Choose files' : 'Choose a file')}</span>;
    return own.valueFormat ? own.valueFormat(list) : list.map((file) => file.name).join(', ');
  };

  return (
    <FieldWrapper field={own} rootClass={`slp-file-input ${style.fileInput}`}>
      <Input
        {...(others as Record<string, unknown>)}
        as="button"
        type="button"
        // A button can't be required, and the hidden file input can't show the browser's message: `required` only
        // shows the asterisk.
        required={false}
        data-empty={files().length === 0 ? '' : undefined}
        aria-describedby={[own['aria-describedby'], files().length ? valueId : ''].filter(Boolean).join(' ') || undefined}
        onClick={onClick}
        rightSection={
          clearable ? (
            <Show when={files().length > 0 && !own.disabled}>
              <CloseButton size="xs" label={own.clearLabel ?? 'Clear'} onClick={() => set([])} />
            </Show>
          ) : (
            own.rightSection
          )
        }
      >
        <span id={valueId} data-slot="file-input-value" class={style.value}>
          {shown()}
        </span>
      </Input>
      <input
        ref={(el) => (fileInput = el)}
        type="file"
        hidden
        tabindex={-1}
        data-slot="file-input-input"
        name={own.name}
        accept={own.accept}
        multiple={multiple}
        capture={own.capture}
        disabled={own.disabled}
        onChange={onFileChange}
      />
    </FieldWrapper>
  );
}
