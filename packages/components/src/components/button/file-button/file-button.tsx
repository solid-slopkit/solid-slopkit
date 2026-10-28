import { omit } from 'solid-js';
import { type JSX } from '@solidjs/web';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { Button, type ButtonRootProps } from '../button';

export interface FileButtonOwnProps<Multiple extends boolean = false> extends Pick<
  ButtonRootProps,
  'variant' | 'color' | 'size' | 'shape' | 'fullWidth' | 'active' | 'loading' | 'disabled' | 'leftSection' | 'rightSection'
> {
  /** Called with the chosen file, or the chosen files with `multiple`. Not called when the picker is cancelled. */
  onChange: (payload: Multiple extends true ? File[] : File) => void;
  /** Lets the user pick several files. `onChange` then gets an array. */
  multiple?: Multiple;
  /** File types to offer, as in the input's `accept`: extensions or MIME types, e.g. `'image/*,.pdf'`. */
  accept?: string;
  /** On phones, opens the camera instead of the files: `user` for the front one, `environment` for the back. */
  capture?: 'user' | 'environment';
}

// No `type`: the button only opens the picker, so it never submits a form.
export type FileButtonProps<Multiple extends boolean = false> = ElementProps<
  Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>,
  FileButtonOwnProps<Multiple>
>;

/**
 * A Button that opens the browser's file picker and hands the chosen files to `onChange`. The picker is a hidden
 * `input type="file"` next to the button.
 */
export function FileButton<Multiple extends boolean = false>(props: FileButtonProps<Multiple>) {
  let input: HTMLInputElement | undefined;
  const others = omit(props as FileButtonProps<boolean>, 'class', 'onChange', 'multiple', 'accept', 'capture', 'onClick');

  const onClick = (event: MouseEvent) => {
    callHandler(props.onClick, event);
    if (!event.defaultPrevented) input?.click();
  };

  const onInputChange = (event: Event) => {
    const target = event.currentTarget as HTMLInputElement;
    const files = Array.from(target.files ?? []);
    // Cleared, so picking the same file again is a change too.
    target.value = '';
    if (files.length === 0) return;
    const onChange = props.onChange as (payload: File | File[]) => void;
    onChange(props.multiple ? files : files[0]);
  };

  return (
    <>
      <Button {...others} class={joinClass(['slp-file-button'], props.class)} onClick={onClick} />
      <input
        ref={(el) => (input = el)}
        type="file"
        data-slot="file-button-input"
        hidden
        tabindex={-1}
        accept={props.accept}
        multiple={props.multiple}
        capture={props.capture}
        onChange={onInputChange}
      />
    </>
  );
}
