import { Check } from '@lucide/solid';
import { Button, Group, useNotifications } from '@solid-slopkit/components';

export default function Basic() {
  const notifications = useNotifications();

  return (
    <Group>
      <Button
        variant="soft"
        onClick={() =>
          notifications.show({
            title: 'Saved',
            message: 'Your changes are saved.',
            color: 'success',
            icon: <Check aria-hidden="true" />,
          })
        }
      >
        Save
      </Button>
      <Button
        variant="soft"
        color="error"
        onClick={() =>
          notifications.show({ title: 'Not saved', message: 'The server is unreachable.', color: 'error', role: 'alert' })
        }
      >
        Fail
      </Button>
      <Button variant="ghost" onClick={() => notifications.clean()}>
        Close all
      </Button>
    </Group>
  );
}
