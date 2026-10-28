import { createSignal, onCleanup, type Accessor } from 'solid-js';

export interface Clipboard {
  /** Whether a copy succeeded within the last `timeout` milliseconds. */
  copied: Accessor<boolean>;
  /** Writes the text to the clipboard. Resolves to whether it worked; a failure leaves `copied` false. */
  copy: (text: string) => Promise<boolean>;
}

export interface ClipboardOptions {
  /** How long `copied` stays true, in milliseconds. Read on each copy. */
  timeout?: () => number;
  /** Called after the text is written. */
  onCopied?: (text: string) => void;
  /** Called when the browser refuses, e.g. outside a secure context or without permission. */
  onError?: (error: unknown) => void;
}

/**
 * Copies text to the clipboard and remembers, for a while, that it did. A new copy restarts the wait; disposing the
 * owner clears it. Nothing touches the clipboard until `copy` is called, so it's safe to create on the server.
 */
export function createClipboard(options: ClipboardOptions = {}): Clipboard {
  const [copied, setCopied] = createSignal(false, { name: 'clipboard.copied' });
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;

  onCleanup(() => {
    disposed = true;
    clearTimeout(timer);
  });

  const copy = async (text: string) => {
    clearTimeout(timer);
    try {
      if (!navigator.clipboard) throw new Error('The Clipboard API is not available here.');
      await navigator.clipboard.writeText(text);
    } catch (error) {
      if (!disposed) setCopied(false);
      options.onError?.(error);
      return false;
    }
    if (disposed) return true;
    setCopied(true);
    timer = setTimeout(() => setCopied(false), options.timeout?.() ?? 2000);
    options.onCopied?.(text);
    return true;
  };

  return { copied, copy };
}
