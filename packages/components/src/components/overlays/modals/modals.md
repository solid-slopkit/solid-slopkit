# Modals

Open modals from code, without keeping their state yourself, and ask the user to confirm. `<Modals>` shows them; `useModals()` and the `modals` facade open them.

```tsx
import { Modals, useModals, modals } from '@solid-slopkit/components';
```

## Setup

Render the host once, inside `<SlopkitUi>`. Its props are every modal's defaults:

```tsx
<SlopkitUi>
  <App />
  <Modals centered />
</SlopkitUi>
```

## Usage

```tsx
const modals = useModals();

// Content as a function renders inside the modal, under the provider.
const id = modals.open({ title: 'Rename project', children: () => <RenameForm onDone={() => modals.close(id)} /> });

// Resolves true when confirmed, false when closed any other way.
if (
  await modals.confirm({
    title: 'Delete project',
    children: 'This cannot be undone.',
    labels: { confirm: 'Delete' },
    confirmProps: { color: 'error' },
  })
) {
  await deleteProject();
}

// Stays open while a request runs.
const confirmId = modals.openConfirm({
  title: 'Publish',
  closeOnConfirm: false,
  onConfirm: async () => {
    modals.update(confirmId, { confirmProps: { loading: true }, cancelProps: { disabled: true } });
    await publish();
    modals.close(confirmId);
  },
});
```

- **Hook:** `useModals()` returns `open(settings) → id`, `openConfirm(settings) → id`, `confirm(settings) → Promise<boolean>`, `update(id, settings)`, `close(id)`, `closeAll()` and `modals` (an accessor of the open ones). It reaches the nearest `<SlopkitUi>`; a nested provider shares its root's modals. It throws outside a provider.
- **Facade:** `modals.open / openConfirm / confirm / update / close / closeAll`, importable anywhere, through the most recently mounted `<SlopkitUi>`. On the server it does nothing (with a dev-mode warning), and `confirm` resolves `false`. Inside components, prefer the hook.
- **Settings:** a [Modal](../modal/modal.md)'s props (`title`, `size`, `centered`, `fullScreen`, `closeOnEscape`, …, not `opened`, `onClose` or `onExited`), overriding the host's, plus `children`, `id`, `class` and `onClose` (called once it has gone).
- **Content:** pass a function (`children: () => <Form />`) for components and anything reactive: it's rendered inside the modal, under the provider, and disposed with it. JSX created in an event handler has no owner, so a component that needs the provider would throw there. Plain text can be passed as is. `update` keeps the content unless `children` itself is replaced.
- **Confirm:** the content, then a cancel and a confirm [Button](../../button/button/button.md) (`labels`: `'Cancel'`, `'Confirm'`). `onConfirm` when the confirm button is pressed; `onCancel` when it's closed any other way (the cancel button, the close button, Escape, the backdrop, `close`). `closeOnConfirm` / `closeOnCancel` (default `true`). `confirmProps` / `cancelProps` are Button props, read when it opens, except `loading` and `disabled`, which follow `update`.
- **Stacking:** a modal opened while another is open goes on top; Escape and the backdrop close the top one, and focus goes back to where it was in the one under it.
- Without a mounted `<Modals>`, opening warns in development and closes at once (a confirm resolves `false`).

## Props

`<Modals>` takes a [Modal](../modal/modal.md)'s props, except `opened`, `onClose`, `onExited` and `title`, as defaults for every modal.

## Styling

Each is a Modal: `.slp-modal` and its slots. A confirm modal's buttons are in `[data-slot="modals-confirm-actions"]`, after the content. Component rules live in `@layer slopkit.components`, so unlayered CSS wins.
