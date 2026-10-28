import { Trash2 } from '@lucide/solid';
import { Badge, Button, Group, Text, VisuallyHidden } from '@solid-slopkit/components';

export default function Basic() {
  return (
    <Group>
      <Button variant="soft" color="error">
        <Trash2 size={16} aria-hidden="true" />
        <VisuallyHidden>Delete draft</VisuallyHidden>
      </Button>
      <Text as="span">
        Inbox{' '}
        <Badge>
          3<VisuallyHidden> unread messages</VisuallyHidden>
        </Badge>
      </Text>
    </Group>
  );
}
