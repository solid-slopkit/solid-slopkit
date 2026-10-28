import { omit, Show } from 'solid-js';
import { type JSX } from '@solidjs/web';
import { callHandler, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';
import { createClipboard } from '../../primitives';
import { ActionIcon, type ActionIconShape, type ActionIconVariant } from '../action-icon';
import type { SlopColor, SlopSize } from '../../../core';

export interface CopyButtonOwnProps {
  /** The text to copy. */
  value: string;
  /** Accessible name. Defaults to `'Copy'`. */
  label?: string;
  /** Accessible name while the copy is confirmed. Defaults to `'Copied'`. */
  copiedLabel?: string;
  /** How long the confirmation lasts, in milliseconds. Defaults to 2000. */
  timeout?: number;
  /** Called after the text is copied. */
  onCopied?: (value: string) => void;
  /** Called when the browser refuses to copy, e.g. outside a secure context. */
  onCopyError?: (error: unknown) => void;
  /** Visual style. Defaults to `ghost`. */
  variant?: ActionIconVariant;
  /** Color role. While the copy is confirmed, the button is `success`. */
  color?: SlopColor;
  /** Defaults to `md`. */
  size?: SlopSize;
  /** Defaults to `square`. */
  shape?: ActionIconShape;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export type CopyButtonProps = ElementProps<JSX.ButtonHTMLAttributes<HTMLButtonElement>, CopyButtonOwnProps>;

/** An ActionIcon that copies `value` to the clipboard, then shows a check and says so for a moment. */
export function CopyButton(props: CopyButtonProps) {
  const others = omit(props, 'class', 'value', 'label', 'copiedLabel', 'timeout', 'onCopied', 'onCopyError', 'color', 'onClick');
  const clipboard = createClipboard({
    timeout: () => props.timeout ?? 2000,
    onCopied: (value) => props.onCopied?.(value),
    onError: (error) => props.onCopyError?.(error),
  });

  const onClick = (event: MouseEvent) => {
    callHandler(props.onClick, event);
    if (!event.defaultPrevented) void clipboard.copy(props.value);
  };

  return (
    <ActionIcon
      {...others}
      label={clipboard.copied() ? (props.copiedLabel ?? 'Copied') : (props.label ?? 'Copy')}
      color={clipboard.copied() ? 'success' : props.color}
      data-copied={clipboard.copied() ? '' : undefined}
      class={joinClass(['slp-copy-button'], props.class)}
      onClick={onClick}
    >
      <Show when={clipboard.copied()} fallback={<CopyIcon />}>
        <CheckIcon />
      </Show>
    </ActionIcon>
  );
}

function CopyIcon() {
  return (
    <svg
      data-slot="copy-button-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {/* Two sheets: the front one whole, the one behind showing only above and to the left of it. */}
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      data-slot="copy-button-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
    </svg>
  );
}
