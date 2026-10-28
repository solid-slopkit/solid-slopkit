import { Check, ChevronsUpDown, CirclePlus } from '@lucide/solid';
import { createSignal, For, Show } from 'solid-js';
import { Avatar, Button, Combobox, createCombobox, Divider, Group, useNotifications } from '@solid-slopkit/components';

const users = [
  { id: '1', username: 'ada' },
  { id: '2', username: 'grace' },
  { id: '3', username: 'linus' },
];

// The action's value can't clash with a user's id.
const CREATE = 'create';

export default function CustomOptions() {
  const notifications = useNotifications();
  const [userId, setUserId] = createSignal<string>();
  const [query, setQuery] = createSignal('');
  const combobox = createCombobox({ onChange: (opened) => opened && setQuery('') });
  const shown = () => users.filter((user) => user.username.includes(query().toLowerCase().trim()));
  const selected = () => users.find((user) => user.id === userId());

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(value) => {
        if (value === CREATE) notifications.show({ message: 'Create a user' });
        else setUserId(value);
      }}
      matchTargetWidth={false}
      position="bottom-start"
    >
      <Combobox.Target>
        {(target) => (
          <Button
            {...target}
            aria-label="User"
            variant="outline"
            rightSection={<ChevronsUpDown />}
            onClick={() => combobox.toggle()}
            style={{ width: '13rem', 'justify-content': 'space-between' }}
          >
            <Show when={selected()} fallback="Select user…">
              {(user) => (
                <Group gap={2}>
                  <Avatar name={user().username} alt="" size="xs" />
                  {user().username}
                </Group>
              )}
            </Show>
          </Button>
        )}
      </Combobox.Target>
      <Combobox.Dropdown style={{ width: '13rem' }}>
        <Combobox.Search
          aria-label="Search user"
          placeholder="Search user…"
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
        />
        <Show when={shown().length === 0}>
          <Combobox.Empty>No user found.</Combobox.Empty>
        </Show>
        <Combobox.Options aria-label="Users">
          <For each={shown()}>
            {(user) => (
              <Combobox.Option value={user.id} selected={userId() === user.id}>
                <Group gap={2}>
                  <Avatar name={user.username} alt="" size="xs" />
                  {user.username}
                  <Show when={userId() === user.id}>
                    <Check size={16} aria-hidden="true" style={{ 'margin-left': 'auto' }} />
                  </Show>
                </Group>
              </Combobox.Option>
            )}
          </For>
          <Divider role="presentation" style={{ margin: '0.25rem 0' }} />
          <Combobox.Option value={CREATE}>
            <Group gap={2}>
              <CirclePlus size={16} aria-hidden="true" />
              Create user
            </Group>
          </Combobox.Option>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
