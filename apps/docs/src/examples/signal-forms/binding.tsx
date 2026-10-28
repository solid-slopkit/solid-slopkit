import { createStore } from 'solid-js';
import { Checkbox, Code, NumberInput, Select, Stack, Switch, TextInput } from '@solid-slopkit/components';
import { bind, form } from '@solid-slopkit/signal-forms';

export default function Binding() {
  const [model, setModel] = createStore<{
    name: string;
    seats: number | undefined;
    plan: string | null;
    newsletter: boolean;
    darkMode: boolean;
  }>({ name: 'Ada', seats: 3, plan: 'team', newsletter: true, darkMode: false });
  const f = form(model, setModel);

  return (
    <Stack gap={2} style={{ 'max-width': '20rem' }}>
      <TextInput label="Name" {...bind.text(f.name)} />
      <NumberInput label="Seats" {...bind(f.seats)} />
      <Select label="Plan" data={['solo', 'team', 'company']} {...bind(f.plan)} />
      <Checkbox label="Newsletter" {...bind.checked(f.newsletter)} />
      <Switch label="Dark mode" {...bind.checked(f.darkMode)} />
      <Code block>{JSON.stringify(model, null, 2)}</Code>
    </Stack>
  );
}
