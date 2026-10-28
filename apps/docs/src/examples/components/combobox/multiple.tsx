import { createSignal, For } from 'solid-js';
import { Combobox, createCombobox, Stack, Text, TextInput } from '@solid-slopkit/components';

const toppings = ['Basil', 'Mozzarella', 'Mushrooms', 'Olives', 'Onion', 'Pepperoni', 'Pineapple'];

export default function Multiple() {
  const combobox = createCombobox();
  const [picked, setPicked] = createSignal<string[]>([]);
  const toggle = (topping: string) =>
    setPicked((list) => (list.includes(topping) ? list.filter((item) => item !== topping) : [...list, topping]));

  return (
    <Stack style={{ width: '16rem' }}>
      <Combobox store={combobox} onOptionSubmit={toggle} closeOnOptionSubmit={false}>
        <Combobox.Target>
          {(target) => (
            <TextInput
              {...target}
              label="Toppings"
              readOnly
              value={picked().length === 0 ? '' : `${picked().length} chosen`}
              placeholder="Choose toppings"
              onClick={() => combobox.toggle()}
            />
          )}
        </Combobox.Target>
        <Combobox.Dropdown>
          <Combobox.Options aria-label="Toppings" aria-multiselectable="true">
            <For each={toppings}>
              {(topping) => (
                <Combobox.Option value={topping} selected={picked().includes(topping)}>
                  {picked().includes(topping) ? '✓ ' : ''}
                  {topping}
                </Combobox.Option>
              )}
            </For>
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
      <Text size="sm">{picked().join(', ') || 'Nothing yet'}</Text>
    </Stack>
  );
}
