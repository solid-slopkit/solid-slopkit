import { createStore, For } from 'solid-js';
import { Button, Group, Stack, TextInput } from '@solid-slopkit/components';
import { applyEach, bind, email, form, required } from '@solid-slopkit/signal-forms';

export default function Array() {
  const [model, setModel] = createStore({ contacts: [{ name: 'Ada', email: 'ada@example.com' }] });
  const f = form(model, setModel, (p) => {
    applyEach(p.contacts, (contact) => {
      required(contact.name);
      required(contact.email);
      email(contact.email);
    });
  });

  return (
    <Stack gap={2} style={{ 'max-width': '26rem' }}>
      <For each={model.contacts}>
        {(_, index) => (
          <Group align="flex-start" wrap="nowrap">
            <TextInput label="Name" {...bind.text(f.contacts[index()]!.name)} />
            <TextInput label="Email" {...bind.text(f.contacts[index()]!.email)} />
            <Button
              variant="outline"
              aria-label={`Remove contact ${index() + 1}`}
              onClick={() =>
                setModel((draft) => {
                  draft.contacts.splice(index(), 1);
                })
              }
            >
              Remove
            </Button>
          </Group>
        )}
      </For>
      <div>
        <Button
          variant="outline"
          onClick={() =>
            setModel((draft) => {
              draft.contacts.push({ name: '', email: '' });
            })
          }
        >
          Add contact
        </Button>
      </div>
    </Stack>
  );
}
