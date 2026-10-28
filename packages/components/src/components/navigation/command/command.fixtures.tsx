// SSR scenarios for command.test.tsx.
import { SlopkitUi } from '../../provider';
import { Command, CommandDialog } from '.';

const Icon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="6" />
  </svg>
);

// Inline: the whole list is rendered on the server.
export const inline = () => (
  <SlopkitUi>
    <Command>
      <Command.Input placeholder="Type a command…" />
      <Command.List>
        <Command.Empty>Nothing found</Command.Empty>
        <Command.Group heading="Pages">
          <Command.Item>
            <Icon />
            Home
          </Command.Item>
          <Command.Item value="docs" keywords={['manual']}>
            Documentation
            <Command.Shortcut>⌘D</Command.Shortcut>
          </Command.Item>
        </Command.Group>
        <Command.Separator />
        <Command.Item disabled>Billing</Command.Item>
      </Command.List>
    </Command>
  </SlopkitUi>
);

// Closed on the server: none of its content is rendered until it opens.
export const dialog = () => (
  <SlopkitUi>
    <main>Page</main>
    <CommandDialog opened={false}>
      <Command.Input />
      <Command.List>
        <Command.Item>
          <Icon />
          Home
        </Command.Item>
      </Command.List>
    </CommandDialog>
  </SlopkitUi>
);
