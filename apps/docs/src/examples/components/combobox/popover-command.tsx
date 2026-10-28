import { Check, ChevronsUpDown } from '@lucide/solid';
import { createSignal, For, Show } from 'solid-js';
import { Button, Command, Popover } from '@solid-slopkit/components';

const languages = [
  { value: 'go', label: 'Go' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'typescript', label: 'TypeScript' },
];

export default function PopoverCommand() {
  const [opened, setOpened] = createSignal(false);
  const [value, setValue] = createSignal<string>();
  const selected = () => languages.find((language) => language.value === value());
  // Choosing the selected one again clears it.
  const choose = (next: string) => {
    setValue((current) => (current === next ? undefined : next));
    setOpened(false);
  };

  return (
    <Popover opened={opened()} onChange={setOpened} position="bottom-start" offset={4}>
      <Popover.Target>
        {(target) => (
          <Button
            {...target}
            variant="outline"
            rightSection={<ChevronsUpDown />}
            style={{ width: '13rem', 'justify-content': 'space-between' }}
          >
            {selected()?.label ?? 'Select language…'}
          </Button>
        )}
      </Popover.Target>
      <Popover.Dropdown aria-label="Languages" style={{ width: '13rem', padding: 0 }}>
        <Command>
          <Command.Input placeholder="Search language…" size="sm" />
          <Command.List aria-label="Languages">
            <Command.Empty>No language found.</Command.Empty>
            <For each={languages}>
              {(language) => (
                <Command.Item
                  value={language.value}
                  keywords={[language.label]}
                  onSelect={choose}
                  style={{ 'justify-content': 'space-between' }}
                >
                  {language.label}
                  <Show when={value() === language.value}>
                    <Check aria-hidden="true" />
                  </Show>
                </Command.Item>
              )}
            </For>
          </Command.List>
        </Command>
      </Popover.Dropdown>
    </Popover>
  );
}
