import { Check, ChevronsUpDown } from '@lucide/solid';
import { createEffect, createMemo, createSignal, For, isPending, Loading, Show } from 'solid-js';
import { Button, Combobox, createCombobox, Loader } from '@solid-slopkit/components';

const languages = [
  'Ada',
  'Clojure',
  'COBOL',
  'Crystal',
  'Dart',
  'Elixir',
  'Elm',
  'Erlang',
  'F#',
  'Fortran',
  'Gleam',
  'Go',
  'Haskell',
  'Java',
  'JavaScript',
  'Julia',
  'Kotlin',
  'Lua',
  'Nim',
  'OCaml',
  'Odin',
  'Pascal',
  'Perl',
  'PHP',
  'Prolog',
  'Python',
  'R',
  'Racket',
  'Ruby',
  'Rust',
  'Scala',
  'Scheme',
  'Swift',
  'TypeScript',
  'Zig',
];

/** Stands in for a request to a server: the matches, after a delay. */
function searchLanguages(query: string): Promise<string[]> {
  const words = query.toLowerCase().trim();
  return new Promise((resolve) =>
    setTimeout(() => resolve(languages.filter((language) => language.toLowerCase().includes(words)).slice(0, 8)), 600),
  );
}

export default function AsyncSearch() {
  const [value, setValue] = createSignal<string>();
  const [query, setQuery] = createSignal('');
  const combobox = createCombobox({ onChange: (opened) => opened && setQuery('') });
  // A new request each time the query changes. The options shown stay until its answer lands.
  const results = createMemo(() => searchLanguages(query()), { name: 'AsyncSearch.results' });
  // Once an answer lands, the first match is active, as with options filtered on the spot. Just after the effect: the
  // store's methods render pending changes first, which they can't do while effects run.
  createEffect(results, () => {
    queueMicrotask(() => combobox.opened() && combobox.activateFirst());
  });

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
            {value() ?? 'Select language…'}
          </Button>
        )}
      </Combobox.Target>
      <Combobox.Dropdown style={{ width: '13rem' }}>
        <Combobox.Search
          aria-label="Search language"
          placeholder="Search language…"
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
          rightSection={
            <Show when={isPending(() => results())}>
              <Loader size="xs" label="Searching" />
            </Show>
          }
        />
        <Loading fallback={<Combobox.Empty>Searching…</Combobox.Empty>}>
          <Combobox.Options aria-label="Languages">
            <For each={results()}>
              {(language) => (
                <Combobox.Option
                  value={language}
                  selected={value() === language}
                  style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'space-between' }}
                >
                  {language}
                  <Show when={value() === language}>
                    <Check size={16} aria-hidden="true" />
                  </Show>
                </Combobox.Option>
              )}
            </For>
          </Combobox.Options>
          <Show when={results().length === 0}>
            <Combobox.Empty>No language found.</Combobox.Empty>
          </Show>
        </Loading>
      </Combobox.Dropdown>
    </Combobox>
  );
}
