import { Button, useModals } from '@solid-slopkit/components';

const save = () => new Promise((resolve) => setTimeout(resolve, 1500));

export default function Async() {
  const modals = useModals();

  const open = () => {
    const id = modals.openConfirm({
      title: 'Publish',
      children: 'Publish the draft to everyone?',
      labels: { confirm: 'Publish' },
      // Stays open while the request runs, with the button loading.
      closeOnConfirm: false,
      onConfirm: async () => {
        modals.update(id, { confirmProps: { loading: true }, cancelProps: { disabled: true } });
        await save();
        modals.close(id);
      },
    });
  };

  return <Button onClick={open}>Publish</Button>;
}
