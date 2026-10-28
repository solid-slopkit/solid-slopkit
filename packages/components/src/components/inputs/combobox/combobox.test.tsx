import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, For } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { SlopkitUi } from '../../provider';
import { Combobox, type ComboboxProps } from './combobox';
import { createCombobox, type ComboboxOptions, type ComboboxStore } from './create-combobox';

const fruits = ['Apple', 'Banana', 'Cherry', 'Date'];

/** An input that filters the fruits as you type, and a value picked from them. */
function setup(options: ComboboxOptions = {}, props: Partial<ComboboxProps> = {}, disabled: string[] = []) {
  let store!: ComboboxStore;
  const [value, setValue] = createSignal<string | null>(null);
  const [query, setQuery] = createSignal('');
  const onOptionSubmit = vi.fn((picked: string) => setValue(picked));
  const result = render(() => {
    store = createCombobox(options);
    const shown = () => fruits.filter((fruit) => fruit.toLowerCase().includes(query().toLowerCase()));
    return (
      <SlopkitUi>
        <Combobox store={store} onOptionSubmit={onOptionSubmit} {...props}>
          <Combobox.Target>
            {(target) => (
              <input
                {...target}
                aria-label="Fruit"
                onInput={(event) => {
                  setQuery(event.currentTarget.value);
                  store.open();
                  store.activateFirst();
                }}
              />
            )}
          </Combobox.Target>
          <Combobox.Dropdown data-testid="dropdown">
            <Combobox.Options aria-label="Fruits">
              <For each={shown()}>
                {(fruit) => (
                  <Combobox.Option value={fruit} selected={value() === fruit} disabled={disabled.includes(fruit)}>
                    {fruit}
                  </Combobox.Option>
                )}
              </For>
            </Combobox.Options>
            {shown().length === 0 && <Combobox.Empty>Nothing found</Combobox.Empty>}
          </Combobox.Dropdown>
        </Combobox>
      </SlopkitUi>
    );
  });
  flush();
  const input = () => result.getByRole('combobox') as HTMLInputElement;
  // jsdom treats [popover] as hidden: the listbox and options are queried with `hidden`.
  const listbox = () => result.queryByRole('listbox', { hidden: true });
  const option = (name: string) => result.getByText(name) as HTMLElement;
  const key = (key: string, init: KeyboardEventInit = {}) => {
    fireEvent.keyDown(input(), { key, ...init });
    flush();
  };
  return { ...result, store, input, listbox, option, key, value, onOptionSubmit };
}

describe('<Combobox />', () => {
  test('the target is a closed combobox, and the dropdown is not rendered', () => {
    const { input, listbox } = setup();

    expect(input()).toHaveAttribute('role', 'combobox');
    expect(input()).toHaveAttribute('aria-haspopup', 'listbox');
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    expect(input()).not.toHaveAttribute('aria-controls');
    expect(input()).not.toHaveAttribute('aria-activedescendant');
    expect(listbox()).toBeNull();
  });

  test('open renders the dropdown with a listbox the target controls', () => {
    const { store, input, listbox, getByTestId, option } = setup();

    store.open();
    flush();
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(getByTestId('dropdown')).toHaveClass('slp-combobox');
    expect(getByTestId('dropdown')).toHaveAttribute('popover', 'manual');
    expect(listbox()).toHaveClass('slp-combobox-options');
    expect(input()).toHaveAttribute('aria-controls', listbox()!.id);
    expect(option('Apple')).toHaveAttribute('role', 'option');
    expect(option('Apple')).toHaveClass('slp-combobox-option');
    expect(option('Apple')).toHaveAttribute('aria-selected', 'false');
  });

  test('ArrowDown opens it on the first option and moves down, looping', () => {
    const { input, option, key } = setup();

    key('ArrowDown');
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(input()).toHaveAttribute('aria-activedescendant', option('Apple').id);
    expect(option('Apple')).toHaveAttribute('data-active', '');

    key('ArrowDown');
    expect(input()).toHaveAttribute('aria-activedescendant', option('Banana').id);
    expect(option('Apple')).not.toHaveAttribute('data-active');
    key('ArrowUp');
    key('ArrowUp');
    expect(input()).toHaveAttribute('aria-activedescendant', option('Date').id);
  });

  test('ArrowUp opens it on the last option; with loop off, it stops at the ends', () => {
    const { input, option, key } = setup({ loop: () => false });

    key('ArrowUp');
    expect(input()).toHaveAttribute('aria-activedescendant', option('Date').id);
    key('ArrowDown');
    expect(input()).toHaveAttribute('aria-activedescendant', option('Date').id);
  });

  test('opening starts on the selected option', () => {
    const { input, option, key } = setup();
    key('ArrowDown');
    key('ArrowDown');
    key('ArrowDown');
    key('Enter');

    key('ArrowDown');
    expect(option('Cherry')).toHaveAttribute('aria-selected', 'true');
    expect(option('Cherry')).toHaveAttribute('data-selected', '');
    expect(input()).toHaveAttribute('aria-activedescendant', option('Cherry').id);
  });

  test('activate(value) makes the option with that value active, unless it is disabled', () => {
    const { store, input, option } = setup({}, {}, ['Banana']);
    store.open();
    flush();

    expect(option('Cherry')).toHaveAttribute('data-value', 'Cherry');
    expect(store.activate('Cherry')).toBe(true);
    expect(input()).toHaveAttribute('aria-activedescendant', option('Cherry').id);
    expect(store.activate('Banana')).toBe(false);
    expect(store.activate('Kiwi')).toBe(false);
    expect(input()).toHaveAttribute('aria-activedescendant', option('Cherry').id);
  });

  test('disabled options are skipped and cannot be chosen', () => {
    const { input, option, key, onOptionSubmit } = setup({}, {}, ['Banana']);

    key('ArrowDown');
    key('ArrowDown');
    expect(input()).toHaveAttribute('aria-activedescendant', option('Cherry').id);
    expect(option('Banana')).toHaveAttribute('aria-disabled', 'true');

    fireEvent.click(option('Banana'));
    expect(onOptionSubmit).not.toHaveBeenCalled();
  });

  test('Enter chooses the active option and closes; without one it does nothing', () => {
    const { input, key, onOptionSubmit, value } = setup();

    key('Enter');
    expect(onOptionSubmit).not.toHaveBeenCalled();

    key('ArrowDown');
    key('ArrowDown');
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    input().dispatchEvent(enter);
    flush();
    expect(enter.defaultPrevented).toBe(true);
    expect(onOptionSubmit).toHaveBeenCalledWith('Banana');
    expect(value()).toBe('Banana');
    expect(input()).toHaveAttribute('aria-expanded', 'false');
  });

  test('a click on an option chooses it; closeOnOptionSubmit={false} keeps it open', () => {
    const { store, input, option, onOptionSubmit } = setup({}, { closeOnOptionSubmit: false });
    store.open();
    flush();

    fireEvent.click(option('Date'));
    flush();
    expect(onOptionSubmit).toHaveBeenCalledWith('Date');
    expect(input()).toHaveAttribute('aria-expanded', 'true');
  });

  test('the pointer over an option makes it active, without a key', () => {
    const { store, input, option } = setup();
    store.open();
    flush();

    fireEvent.pointerMove(option('Cherry'));
    flush();
    expect(input()).toHaveAttribute('aria-activedescendant', option('Cherry').id);
  });

  test('Home and End move in a button target, and leave a text field alone', () => {
    const { store, input, option, key } = setup();
    store.open();
    flush();

    key('End');
    expect(input()).not.toHaveAttribute('aria-activedescendant');

    let buttonStore!: ComboboxStore;
    const { getByText } = render(() => {
      buttonStore = createCombobox();
      return (
        <SlopkitUi>
          <Combobox store={buttonStore}>
            <Combobox.Target>{(target) => <button {...target}>Pick</button>}</Combobox.Target>
            <Combobox.Dropdown>
              <Combobox.Options aria-label="Letters">
                <Combobox.Option value="a">A</Combobox.Option>
                <Combobox.Option value="b">B</Combobox.Option>
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        </SlopkitUi>
      );
    });
    buttonStore.open();
    flush();
    const button = getByText('Pick');
    fireEvent.keyDown(button, { key: 'End' });
    flush();
    expect(button).toHaveAttribute('aria-activedescendant', getByText('B').id);
    fireEvent.keyDown(button, { key: 'Home' });
    flush();
    expect(button).toHaveAttribute('aria-activedescendant', getByText('A').id);
    expect(option('Apple')).toBeDefined();
  });

  test('Alt+ArrowDown opens without an active option; Alt+ArrowUp and Tab close', () => {
    const { input, key } = setup();

    key('ArrowDown', { altKey: true });
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(input()).not.toHaveAttribute('aria-activedescendant');
    key('ArrowUp', { altKey: true });
    expect(input()).toHaveAttribute('aria-expanded', 'false');

    key('ArrowDown');
    key('Tab');
    expect(input()).toHaveAttribute('aria-expanded', 'false');
  });

  test('typing filters the options; the active one goes with them, and Empty shows when none match', async () => {
    const { input, option, getByText, queryByText } = setup();

    fireEvent.input(input(), { target: { value: 'an' } });
    flush();
    expect(input()).toHaveAttribute('aria-activedescendant', option('Banana').id);
    expect(queryByText('Apple')).toBeNull();

    fireEvent.input(input(), { target: { value: 'zz' } });
    flush();
    await Promise.resolve();
    expect(input()).not.toHaveAttribute('aria-activedescendant');
    expect(getByText('Nothing found')).toHaveClass('slp-combobox-empty');
  });

  test('controlled: follows opened, and only asks to change it', () => {
    const [opened, setOpened] = createSignal(false);
    const onChange = vi.fn();
    const { input, key } = setup({ opened, onChange });

    key('ArrowDown');
    expect(onChange).toHaveBeenCalledWith(true);
    expect(input()).toHaveAttribute('aria-expanded', 'false');

    setOpened(true);
    flush();
    expect(input()).toHaveAttribute('aria-expanded', 'true');
  });

  test('a group is named by its label', () => {
    const { getByRole, getByText } = render(() => {
      const store = createCombobox({ defaultOpened: true });
      return (
        <SlopkitUi>
          <Combobox store={store}>
            <Combobox.Target>{(target) => <input {...target} aria-label="Food" />}</Combobox.Target>
            <Combobox.Dropdown>
              <Combobox.Options aria-label="Food">
                <Combobox.Group label="Fruit">
                  <Combobox.Option value="apple">Apple</Combobox.Option>
                </Combobox.Group>
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        </SlopkitUi>
      );
    });
    flush();
    const group = getByRole('group', { hidden: true });

    expect(group).toHaveClass('slp-combobox-group');
    expect(group).toHaveAttribute('aria-labelledby', getByText('Fruit').id);
    expect(getByText('Fruit')).toHaveAttribute('data-slot', 'combobox-group-label');
  });

  test("the target's render function runs once: a signal it reads doesn't rebuild the target", () => {
    const [label, setLabel] = createSignal('One');
    const { getByRole } = render(() => {
      const store = createCombobox();
      return (
        <SlopkitUi>
          <Combobox store={store}>
            <Combobox.Target>
              {(target) => {
                // Read directly, outside any JSX expression.
                const name = label();
                return <input {...target} aria-label={name} />;
              }}
            </Combobox.Target>
          </Combobox>
        </SlopkitUi>
      );
    });
    flush();
    const input = getByRole('combobox');

    setLabel('Two');
    flush();
    expect(getByRole('combobox')).toBe(input);
  });

  test('the parts throw outside a Combobox, and a Combobox without a store throws', () => {
    expect(() => render(() => <Combobox.Options aria-label="Alone" />)).toThrow(/inside <Combobox>/);
    expect(() => render(() => <Combobox store={{} as ComboboxStore} />)).toThrow(/createCombobox/);
  });

  test('has no axe violations, closed and open with an active and a selected option', async () => {
    const { container, key } = setup();
    let results = await axe.run(container);
    expect(results.violations).toEqual([]);

    key('ArrowDown');
    key('Enter');
    key('ArrowDown');
    key('ArrowDown');
    results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });

  test('moving through the options has no diagnostics or waste', async () => {
    const { key } = setup();
    key('ArrowDown');

    const { artifact } = await captureArtifact(
      () => {
        key('ArrowDown');
        key('ArrowDown');
        key('ArrowUp');
      },
      { scenario: 'combobox-move' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
  });

  test('opening, filtering and choosing have no diagnostics', async () => {
    const { input, key } = setup();

    const { artifact } = await captureArtifact(
      () => {
        key('ArrowDown');
        fireEvent.input(input(), { target: { value: 'b' } });
        flush();
        key('Enter');
      },
      { scenario: 'combobox-choose' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
  });

  test('Combobox.Search is a combobox in the dropdown that controls the listbox, without axe violations or diagnostics', async () => {
    let store!: ComboboxStore;
    const [query, setQuery] = createSignal('');
    const result = render(() => {
      store = createCombobox();
      const shown = () => fruits.filter((fruit) => fruit.toLowerCase().includes(query().toLowerCase()));
      return (
        <SlopkitUi>
          <Combobox store={store}>
            <Combobox.Target>
              {(target) => (
                <button {...target} type="button" aria-label="Fruit">
                  Apple
                </button>
              )}
            </Combobox.Target>
            <Combobox.Dropdown>
              <Combobox.Search value={query()} onInput={(event) => setQuery(event.currentTarget.value)} />
              <Combobox.Options aria-label="Fruits">
                <For each={shown()}>{(fruit) => <Combobox.Option value={fruit}>{fruit}</Combobox.Option>}</For>
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        </SlopkitUi>
      );
    });
    store.open();
    flush();
    const search = result.getByRole('combobox', { name: 'Search', hidden: true }) as HTMLInputElement;
    const listbox = result.getByRole('listbox', { hidden: true });

    expect(search.closest('[data-slot="combobox-search"]')).toHaveClass('slp-combobox-search');
    expect(search).toHaveAttribute('aria-expanded', 'true');
    expect(search).toHaveAttribute('aria-controls', listbox.id);
    expect(search).toHaveAttribute('aria-autocomplete', 'list');

    const { artifact } = await captureArtifact(
      () => {
        fireEvent.input(search, { target: { value: 'a' } });
        flush();
        fireEvent.keyDown(search, { key: 'ArrowDown' });
        flush();
      },
      { scenario: 'combobox-search' },
    );
    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(search).toHaveAttribute('aria-activedescendant', result.getByText('Banana').id);
    const results = await axe.run(result.container);
    expect(results.violations).toEqual([]);
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./combobox.fixtures.tsx', 'comboboxes');
  });
});
