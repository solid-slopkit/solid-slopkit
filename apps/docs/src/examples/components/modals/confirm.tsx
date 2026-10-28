import { Button, Group, useModals, useNotifications } from '@solid-slopkit/components';

export default function Confirm() {
  const modals = useModals();
  const notifications = useNotifications();

  const remove = async () => {
    const confirmed = await modals.confirm({
      title: 'Delete project',
      children: 'The project and its history will be deleted. This cannot be undone.',
      labels: { confirm: 'Delete', cancel: 'Keep it' },
      confirmProps: { color: 'error' },
    });
    notifications.show({ message: confirmed ? 'Project deleted.' : 'Kept the project.' });
  };

  const archive = () =>
    modals.openConfirm({
      title: 'Archive project',
      children: 'Archived projects are read-only.',
      labels: { confirm: 'Archive' },
      onConfirm: () => notifications.show({ message: 'Project archived.', color: 'success' }),
    });

  return (
    <Group>
      <Button color="error" variant="soft" onClick={remove}>
        Delete
      </Button>
      <Button variant="soft" onClick={archive}>
        Archive
      </Button>
    </Group>
  );
}
