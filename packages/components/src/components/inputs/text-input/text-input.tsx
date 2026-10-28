import { type JSX } from '@solidjs/web';
import { type ElementProps } from '../../../utils';
import { controlProps, FieldWrapper, type FieldWrapperProps } from '../field';
import { Input, type InputOwnProps } from '../input';

export interface TextInputOwnProps
  extends FieldWrapperProps, Pick<InputOwnProps, 'variant' | 'leftSection' | 'rightSection' | 'disabled' | 'readOnly' | 'ref'> {}

export type TextInputProps = ElementProps<JSX.InputHTMLAttributes<HTMLInputElement>, TextInputOwnProps>;

/**
 * A labelled one-line text field: an Input in an InputWrapper. `label`, `labelSection`, `description`, `error`, `required`, `size`,
 * `id`, `class` and `style` go to the wrapper; every other prop goes to the `input`.
 */
export function TextInput(props: TextInputProps) {
  return (
    <FieldWrapper field={props} rootClass="slp-text-input">
      <Input {...(controlProps(props) as Record<string, unknown>)} />
    </FieldWrapper>
  );
}
