import { Check, ChevronsUpDown } from '@lucide/solid';
import { createSignal, For, Show } from 'solid-js';
import { Button, Combobox, createCombobox } from '@solid-slopkit/components';

const languages = [
  { value: 'go', label: 'Go' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'typescript', label: 'TypeScript' },
];

export default function SearchInDropdown() {
  const [value, setValue] = createSignal<string>();
  const [query, setQuery] = createSignal('');
  const combobox = createCombobox({ onChange: (opened) => opened && setQuery('') });
  const shown = () => languages.filter((language) => language.label.toLowerCase().includes(query().toLowerCase().trim()));
  const selected = () => languages.find((language) => language.value === value());

  return (
    <Combobox store={combobox} onOptionSubmit={setValue} matchTargetWidth={false} position="bottom-start">
      <Combobox.Target>
        {(target) => (
          <Button
            {...target}
            aria-label="Language"
            variant="outline"
            rightSection={<ChevronsUpDown />}
            onClick={() => combobox.toggle()}
            style={{ width: '13rem', 'justify-content': 'space-between' }}
          >
            {selected()?.label ?? 'Select language…'}
          </Button>
        )}
      </Combobox.Target>
      <Combobox.Dropdown style={{ width: '13rem' }}>
        <Combobox.Search
          aria-label="Search language"
          placeholder="Search language…"
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
        />
        <Combobox.Options aria-label="Languages">
          <For each={shown()}>
            {(language) => (
              <Combobox.Option
                value={language.value}
                selected={value() === language.value}
                style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between' }}
              >
                {language.label}
                <Show when={value() === language.value}>
                  <Check size={16} aria-hidden="true" />
                </Show>
              </Combobox.Option>
            )}
          </For>
        </Combobox.Options>
        <Show when={shown().length === 0}>
          <Combobox.Empty>No language found.</Combobox.Empty>
        </Show>
      </Combobox.Dropdown>
    </Combobox>
  );
}
