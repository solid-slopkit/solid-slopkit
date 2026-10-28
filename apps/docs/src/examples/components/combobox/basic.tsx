import { createSignal, For, Show } from 'solid-js';
import { Combobox, createCombobox, TextInput } from '@solid-slopkit/components';

const countries = [
  'Austria',
  'Belgium',
  'Croatia',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Ireland',
  'Italy',
  'Latvia',
  'Netherlands',
  'Norway',
  'Poland',
  'Portugal',
  'Spain',
  'Sweden',
];

export default function Basic() {
  const combobox = createCombobox();
  const [query, setQuery] = createSignal('');
  const shown = () => countries.filter((country) => country.toLowerCase().includes(query().toLowerCase().trim()));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(country) => {
        setQuery(country);
        combobox.clearActive();
      }}
    >
      <Combobox.Target>
        {(target) => (
          <TextInput
            {...target}
            label="Country"
            placeholder="Start typing"
            autocomplete="off"
            aria-autocomplete="list"
            value={query()}
            onClick={() => combobox.open()}
            onInput={(event) => {
              setQuery(event.currentTarget.value);
              combobox.open();
              combobox.activateFirst();
            }}
            style={{ width: '16rem' }}
          />
        )}
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options aria-label="Countries">
          <For each={shown()}>{(country) => <Combobox.Option value={country}>{country}</Combobox.Option>}</For>
        </Combobox.Options>
        <Show when={shown().length === 0}>
          <Combobox.Empty>No country matches</Combobox.Empty>
        </Show>
      </Combobox.Dropdown>
    </Combobox>
  );
}
