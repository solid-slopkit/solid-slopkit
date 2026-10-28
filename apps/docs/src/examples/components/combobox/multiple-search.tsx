import { Check, ChevronsUpDown } from '@lucide/solid';
import { createSignal, For, Show } from 'solid-js';
import { Button, Combobox, createCombobox, Group } from '@solid-slopkit/components';

const languages = [
  { value: 'go', label: 'Go' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'typescript', label: 'TypeScript' },
];

export default function MultipleSearch() {
  const [picked, setPicked] = createSignal<string[]>([]);
  const [query, setQuery] = createSignal('');
  const combobox = createCombobox({ onChange: (opened) => opened && setQuery('') });
  const toggle = (value: string) =>
    setPicked((list) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]));
  const shown = () => languages.filter((language) => language.label.toLowerCase().includes(query().toLowerCase().trim()));
  // In the order of the list, not the order they were picked.
  const label = () =>
    languages
      .filter((language) => picked().includes(language.value))
      .map((language) => language.label)
      .join(', ');

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={toggle}
      closeOnOptionSubmit={false}
      matchTargetWidth={false}
      position="bottom-start"
    >
      <Combobox.Target>
        {(target) => (
          <Button
            {...target}
            aria-label="Languages"
            variant="outline"
            rightSection={<ChevronsUpDown />}
            onClick={() => combobox.toggle()}
            style={{ width: '17.5rem', 'justify-content': 'space-between' }}
          >
            <span style={{ overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }}>
              {label() || 'Select languages…'}
            </span>
          </Button>
        )}
      </Combobox.Target>
      <Combobox.Dropdown style={{ width: '17.5rem' }}>
        <Combobox.Search
          aria-label="Search language"
          placeholder="Search language…"
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
        />
        <Show when={shown().length === 0}>
          <Combobox.Empty>No language found.</Combobox.Empty>
        </Show>
        <Combobox.Options aria-label="Languages" aria-multiselectable="true">
          <For each={shown()}>
            {(language) => {
              const checked = () => picked().includes(language.value);
              return (
                <Combobox.Option value={language.value} selected={checked()}>
                  <Group gap={2}>
                    {/* A box that fills when the option is picked. */}
                    <span
                      aria-hidden="true"
                      style={{
                        display: 'inline-grid',
                        'place-items': 'center',
                        width: '1rem',
                        height: '1rem',
                        'border-radius': '0.25rem',
                        border: `1px solid ${checked() ? 'var(--slp-color-primary)' : 'color-mix(in oklab, var(--slp-color-base-content) 30%, transparent)'}`,
                        'background-color': checked() ? 'var(--slp-color-primary)' : 'transparent',
                        color: 'var(--slp-color-primary-content)',
                      }}
                    >
                      <Show when={checked()}>
                        <Check size={12} stroke-width={3} />
                      </Show>
                    </span>
                    {language.label}
                  </Group>
                </Combobox.Option>
              );
            }}
          </For>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
