import { ChevronDown } from '@lucide/solid';
import { createSignal, For } from 'solid-js';
import { Button, Combobox, createCombobox } from '@solid-slopkit/components';

const groups = [
  { label: 'Fruit', items: ['Apple', 'Banana', 'Cherry'] },
  { label: 'Vegetables', items: ['Carrot', 'Leek', 'Pepper'] },
];

export default function ButtonTarget() {
  const combobox = createCombobox();
  const [value, setValue] = createSignal('Banana');

  return (
    <Combobox store={combobox} onOptionSubmit={setValue} matchTargetWidth={false} position="bottom-start">
      <Combobox.Target>
        {(target) => (
          <Button
            {...target}
            aria-label="Produce"
            variant="outline"
            rightSection={<ChevronDown />}
            onClick={() => combobox.toggle()}
          >
            {value()}
          </Button>
        )}
      </Combobox.Target>
      <Combobox.Dropdown style={{ 'min-width': '12rem' }}>
        <Combobox.Options aria-label="Produce">
          <For each={groups}>
            {(group) => (
              <Combobox.Group label={group.label}>
                <For each={group.items}>
                  {(item) => (
                    <Combobox.Option value={item} selected={value() === item} disabled={item === 'Leek'}>
                      {item}
                    </Combobox.Option>
                  )}
                </For>
              </Combobox.Group>
            )}
          </For>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
