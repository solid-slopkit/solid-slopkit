import { createStore, Show } from 'solid-js';
import { Checkbox, Select, Stack, Switch, Text, TextInput } from '@solid-slopkit/components';
import { bind, disabled, form, hidden, readonly } from '@solid-slopkit/signal-forms';

export default function Conditions() {
  const [model, setModel] = createStore<{
    kind: string | null;
    company: string;
    useCoupon: boolean;
    coupon: string;
    locked: boolean;
    reference: string;
  }>({ kind: 'personal', company: '', useCoupon: false, coupon: '', locked: false, reference: 'INV-1' });
  const f = form(model, setModel, (p) => {
    hidden(p.company, (ctx) => ctx.valueOf(p.kind) !== 'business');
    disabled(p.coupon, (ctx) => !ctx.valueOf(p.useCoupon));
    readonly(p.reference, (ctx) => ctx.valueOf(p.locked));
  });

  return (
    <Stack gap={2} style={{ 'max-width': '20rem' }}>
      <Select label="Account" data={['personal', 'business']} {...bind(f.kind)} />
      <Show when={!f.company.$hidden()}>
        <TextInput label="Company" {...bind.text(f.company)} />
      </Show>
      <Checkbox label="I have a coupon" {...bind.checked(f.useCoupon)} />
      <TextInput label="Coupon" {...bind.text(f.coupon)} />
      <Switch label="Lock the reference" {...bind.checked(f.locked)} />
      <TextInput label="Reference" {...bind.text(f.reference)} />
      <Text size="sm">A disabled field is left out of the submitted value; a hidden or readonly one is not.</Text>
    </Stack>
  );
}
