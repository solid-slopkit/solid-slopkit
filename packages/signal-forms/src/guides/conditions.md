# Conditions and combinators

`import { disabled, hidden, readonly, schema, apply, applyWhen, applyWhenValue, applyEach } from "@solid-slopkit/signal-forms";`

## Conditions

`disabled(p, predicate?)`, `hidden(p, predicate?)`, `readonly(p, predicate?)`: the predicate takes the same context as a validator (`ctx.value()`, `ctx.valueOf(p.other)`) and is reactive; omitted means always true. A field is in a condition when a rule on it says so or a container above it is. `bind()` and `control()` carry `disabled` and `readonly` to the input; **removing a hidden field from the view is yours**: `<Show when={!f.x.$hidden()}>`.

| Condition  | View                  | In the submitted value | Validated                                               |
| ---------- | --------------------- | ---------------------- | ------------------------------------------------------- |
| `disabled` | not editable          | left out               | no: its errors do not count and never block a container |
| `hidden`   | yours to remove       | kept                   | yes                                                     |
| `readonly` | visible, not editable | kept                   | yes                                                     |

A hidden or readonly field with an error blocks `submit`. If a field is hidden because it does not apply, attach its rules with `applyWhen`, or disable it as well.

```tsx
import { createStore, Show } from 'solid-js';
import { Checkbox, Select, Stack, Switch, Text, TextInput } from '@solid-slopkit/components';
import { bind, disabled, form, hidden, readonly } from '@solid-slopkit/signal-forms';

// Conditions are rules like any other: a predicate over the model, re-evaluated when it changes.
export default function ConditionsDemo() {
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
```

## Reusable schemas: schema, apply, applyWhen, applyWhenValue

- `schema<T>((p) => { … })` builds a bundle of rules for a type.
- `apply(path, schemaOrFn)` attaches it at a path, every rule rebased under that path.
- `applyWhen(path, (ctx) => boolean, schemaOrFn)` attaches it only while the condition holds (validators and conditions alike).
- `applyWhenValue(path, (value) => boolean, schemaOrFn)` is the same with a predicate over the value at that path.

```tsx
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

export default function ApplyDemo() {
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
```

## Arrays: applyEach

`applyEach(p.items, (item) => { … })` runs the function once as a template for every element, including ones added later. Reach an element with `f.items[i]`. Change the array with the store setter (`push`, `splice` on the draft).

```tsx
import { createStore, For } from 'solid-js';
import { Button, Group, Stack, TextInput } from '@solid-slopkit/components';
import { applyEach, bind, email, form, required } from '@solid-slopkit/signal-forms';

// applyEach() runs a schema for every item of an array, and for items added later. Items are
// reached by index: f.contacts[i].
export default function ArrayDemo() {
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
```
