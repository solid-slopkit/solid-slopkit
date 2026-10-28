import { Calculator, Calendar, CreditCard, Settings, Smile, User } from '@lucide/solid';
import { Command, useNotifications } from '@solid-slopkit/components';

export default function Inline() {
  const notifications = useNotifications();
  const run = (value: string) => notifications.show({ message: `Selected ${value}` });

  return (
    <Command style={{ 'max-width': '28rem' }}>
      <Command.Input placeholder="Type a command or search…" />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        <Command.Group heading="Suggestions">
          <Command.Item onSelect={run}>
            <Calendar />
            Calendar
          </Command.Item>
          <Command.Item keywords={['emoji', 'smiley']} onSelect={run}>
            <Smile />
            Search emoji
          </Command.Item>
          <Command.Item disabled>
            <Calculator />
            Calculator
          </Command.Item>
        </Command.Group>
        <Command.Separator />
        <Command.Group heading="Settings">
          <Command.Item onSelect={run}>
            <User />
            Profile
            <Command.Shortcut>⌘P</Command.Shortcut>
          </Command.Item>
          <Command.Item onSelect={run}>
            <CreditCard />
            Billing
            <Command.Shortcut>⌘B</Command.Shortcut>
          </Command.Item>
          <Command.Item onSelect={run}>
            <Settings />
            Settings
            <Command.Shortcut>⌘S</Command.Shortcut>
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command>
  );
}
