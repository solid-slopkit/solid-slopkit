import { createStore, Show } from 'solid-js';
import { Checkbox, Stack, TextInput, Title } from '@solid-slopkit/components';
import { apply, applyWhen, bind, form, required, schema } from '@solid-slopkit/signal-forms';

type Address = { street: string; city: string };

// A schema is a reusable bundle of rules. apply() attaches it at a path, applyWhen() only while a
// condition holds: the shipping address is validated only when it differs from the billing one.
const addressSchema = schema<Address>((p) => {
  required(p.street, 'Enter a street');
  required(p.city, 'Enter a city');
});

export default function Apply() {
  const [model, setModel] = createStore({
    billing: { street: '', city: '' },
    differentShipping: false,
    shipping: { street: '', city: '' },
  });
  const f = form(model, setModel, (p) => {
    apply(p.billing, addressSchema);
    applyWhen(p.shipping, (ctx) => ctx.valueOf(p.differentShipping), addressSchema);
  });

  return (
    <Stack gap={2} style={{ 'max-width': '20rem' }}>
      <Title order={4}>Billing</Title>
      <TextInput label="Street" {...bind.text(f.billing.street)} />
      <TextInput label="City" {...bind.text(f.billing.city)} />
      <Checkbox label="Ship to a different address" {...bind.checked(f.differentShipping)} />
      <Show when={model.differentShipping}>
        <Title order={4}>Shipping</Title>
        <TextInput label="Street" {...bind.text(f.shipping.street)} />
        <TextInput label="City" {...bind.text(f.shipping.city)} />
      </Show>
    </Stack>
  );
}
