import { createSignal, omit, Show, untrack } from 'solid-js';
import { type JSX } from '@solidjs/web';
import style from './password-input.module.css';
import { type ElementProps } from '../../../utils';
import { controlProps, FieldWrapper, type FieldWrapperProps } from '../field';
import { Input, type InputOwnProps } from '../input';

export interface PasswordInputOwnProps
  extends FieldWrapperProps, Pick<InputOwnProps, 'variant' | 'leftSection' | 'disabled' | 'readOnly' | 'ref'> {
  /** Whether the password shows as text, for a controlled field. */
  visible?: boolean;
  /** Whether it starts shown, for an uncontrolled field. */
  defaultVisible?: boolean;
  /** Called with the new visibility when the toggle is pressed. */
  onVisibilityChange?: (visible: boolean) => void;
  /** Accessible name of the toggle. Defaults to `'Show password'`; its state is `aria-pressed`. */
  toggleLabel?: string;
}

export type PasswordInputProps = ElementProps<Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'>, PasswordInputOwnProps>;

/**
 * A labelled password field: a TextInput with a toggle that shows the password as text. The toggle is the right
 * section.
 */
export function PasswordInput(props: PasswordInputProps) {
  const others = omit(controlProps(props), 'visible', 'defaultVisible', 'onVisibilityChange', 'toggleLabel');

  // Follows `visible` when controlled. Uncontrolled, it starts at `defaultVisible` and only the toggle changes it.
  const [visible, setVisible] = createSignal(() => props.visible ?? untrack(() => !!props.defaultVisible), {
    name: 'PasswordInput.visible',
  });

  const toggle = () => {
    const next = !visible();
    if (props.visible === undefined) setVisible(next);
    props.onVisibilityChange?.(next);
  };

  return (
    <FieldWrapper field={props} rootClass={`slp-password-input ${style.passwordInput}`}>
      <Input
        {...(others as Record<string, unknown>)}
        type={visible() ? 'text' : 'password'}
        data-visible={visible() ? '' : undefined}
        rightSection={
          <button
            type="button"
            data-slot="password-input-toggle"
            class={style.toggle}
            aria-label={props.toggleLabel ?? 'Show password'}
            aria-pressed={visible() ? 'true' : 'false'}
            disabled={props.disabled}
            onClick={toggle}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M1.5 12C3.8 7.6 7.6 5 12 5s8.2 2.6 10.5 7c-2.3 4.4-6.1 7-10.5 7S3.8 16.4 1.5 12Z" />
              <circle cx="12" cy="12" r="3" />
              <Show when={!visible()}>
                <path d="M3.5 3.5l17 17" />
              </Show>
            </svg>
          </button>
        }
      />
    </FieldWrapper>
  );
}
