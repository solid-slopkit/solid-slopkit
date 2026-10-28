import { createMemo, For, omit, onCleanup, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import style from './modals.module.css';
import { Button } from '../../button/button';
import { Modal, type ModalOwnProps } from '../modal';
import { useSlopkitUi } from '../../provider/slopkit-ui';
import type { ModalEntry, ModalStore } from '../../provider/modals';

/** Modal props every modal opened from code starts from; a modal's own settings override them. */
export type ModalsProps = Omit<ModalOwnProps, 'opened' | 'onClose' | 'onExited' | 'title'>;

// The settings that aren't Modal's props.
const OWN = [
  'id',
  'children',
  'onClose',
  'labels',
  'confirmProps',
  'cancelProps',
  'onConfirm',
  'onCancel',
  'closeOnConfirm',
  'closeOnCancel',
] as const;

function ManagedModal(props: { entry: ModalEntry; store: ModalStore; defaults: ModalsProps }) {
  // Each modal keeps its entry for life.
  const { id, kind, settings } = untrack(() => props.entry);
  const store = untrack(() => props.store);
  const modalProps = () => omit(settings(), ...OWN);
  // Rendered again only when the content itself is replaced, not when another setting changes.
  const children = createMemo(() => settings().children, { name: 'modal.children' });
  // Button reads some props once, so the button props are read once too, as plain objects.
  const confirmProps = untrack(() => settings().confirmProps) ?? {};
  const cancelProps = untrack(() => settings().cancelProps) ?? {};
  const content = () => {
    const value = children();
    return typeof value === 'function' ? untrack(value as () => JSX.Element) : value;
  };

  return (
    <Modal
      {...props.defaults}
      {...modalProps()}
      opened={props.entry.opened()}
      onClose={() => store.close(id)}
      // Taken out a microtask later, once the modal's own closing has run: removing it in the same update disposes
      // it while its <dialog> is still modal, and focus can't go back to the inert page under it.
      onExited={() => queueMicrotask(() => store.remove(id))}
    >
      {content()}
      {kind === 'confirm' && (
        <div data-slot="modals-confirm-actions" class={style.actions}>
          {/* Loading and disabled follow update(), for a confirm that waits on a request. */}
          <Button
            variant="ghost"
            {...cancelProps}
            loading={settings().cancelProps?.loading}
            disabled={settings().cancelProps?.disabled}
            onClick={() => store.cancelled(id)}
          >
            {settings().labels?.cancel ?? 'Cancel'}
          </Button>
          <Button
            {...confirmProps}
            loading={settings().confirmProps?.loading}
            disabled={settings().confirmProps?.disabled}
            onClick={() => store.confirmed(id)}
          >
            {settings().labels?.confirm ?? 'Confirm'}
          </Button>
        </div>
      )}
    </Modal>
  );
}

/**
 * Shows the modals opened from code with `useModals()` and the `modals` facade. Render it once, inside
 * `<SlopkitUi>`. Its props are defaults for every one of them, such as `size` or `centered`.
 */
export function Modals(props: ModalsProps) {
  const store = useSlopkitUi('Modals').modals;
  onCleanup(store.attachHost());

  return <For each={store.modals()}>{(entry) => <ManagedModal entry={entry} store={store} defaults={props} />}</For>;
}
