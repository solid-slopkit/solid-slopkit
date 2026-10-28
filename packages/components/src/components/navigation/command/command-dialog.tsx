import { omit, onSettled } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './command.module.css';
import { Command, CommandSelectContext, type CommandOwnProps } from './command';
import { Modal, type ModalOwnProps } from '../../overlays/modal';
import { matchesShortcut, type ElementProps } from '../../../utils';
import { joinClass } from '../../../style-props';

export interface CommandDialogOwnProps
  extends Omit<ModalOwnProps, 'onClose' | 'title' | 'withCloseButton' | 'closeButtonLabel'>, CommandOwnProps {
  /** Called when it asks to open or close: the shortcut, Escape, a press on the backdrop, or a selected item. */
  onOpenedChange?: (opened: boolean) => void;
  /**
   * The key press that opens and closes it, such as `'mod+K'` (⌘K on Apple devices, Ctrl+K elsewhere), or several.
   * `null` turns it off. Defaults to `'mod+K'`.
   */
  shortcut?: string | readonly string[] | null;
  /** Whether selecting an item closes it. Defaults to `true`. */
  closeOnSelect?: boolean;
}

export type CommandDialogProps = ElementProps<JSX.DialogHtmlAttributes<HTMLDialogElement>, CommandDialogOwnProps>;

/**
 * A Command in a modal, for a palette over the whole app. Controlled by `opened` and `onOpenedChange`; the shortcut
 * (⌘K or Ctrl+K) asks it to open or close from anywhere on the page. Its children are the Command's parts.
 */
export function CommandDialog(props: CommandDialogProps) {
  // The shortcut works anywhere on the page, also in a field.
  onSettled(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) return;
      const shortcut = props.shortcut === undefined ? 'mod+K' : props.shortcut;
      if (shortcut === null) return;
      const shortcuts = typeof shortcut === 'string' ? [shortcut] : shortcut;
      if (!shortcuts.some((one) => matchesShortcut(event, one))) return;
      event.preventDefault();
      props.onOpenedChange?.(!props.opened);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  const others = omit(
    props,
    'class',
    'children',
    'onOpenedChange',
    'shortcut',
    'closeOnSelect',
    'search',
    'onSearchChange',
    'value',
    'onValueChange',
    'filter',
    'shouldFilter',
    'loop',
  );

  const close = () => props.onOpenedChange?.(false);

  return (
    <Modal
      size="lg"
      aria-label="Command menu"
      {...others}
      class={joinClass(['slp-command-dialog', style.dialog], props.class)}
      onClose={close}
      withCloseButton={false}
    >
      {/* Rendered while it's open, so each opening starts with an empty search. */}
      <CommandSelectContext value={() => (props.closeOnSelect ?? true) && close()}>
        <Command
          search={props.search}
          onSearchChange={props.onSearchChange}
          value={props.value}
          onValueChange={props.onValueChange}
          filter={props.filter}
          shouldFilter={props.shouldFilter}
          loop={props.loop}
        >
          {props.children}
        </Command>
      </CommandSelectContext>
    </Modal>
  );
}
