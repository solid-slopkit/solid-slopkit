import { render } from '@solidjs/testing-library';
import { createSignal, flush, For } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { describe, expect, test, vi } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Combobox } from './combobox';
import { createCombobox } from './create-combobox';

const countries = Array.from({ length: 40 }, (_, index) => `Country ${index + 1}`);

/** An input that filters 40 countries and opens on a click or on typing, and a button after it. */
function setup() {
  const [query, setQuery] = createSignal('');
  const onOptionSubmit = vi.fn();
  const result = render(() => {
    const store = createCombobox();
    const shown = () => countries.filter((country) => country.toLowerCase().includes(query().toLowerCase()));
    return (
      <SlopkitUi>
        <div style={{ padding: '20px' }}>
          <Combobox store={store} onOptionSubmit={onOptionSubmit}>
            <Combobox.Target>
              {(target) => (
                <input
                  {...target}
                  aria-label="Country"
                  style={{ width: '240px' }}
                  onClick={() => store.open()}
                  onInput={(event) => {
                    setQuery(event.currentTarget.value);
                    store.open();
                    store.activateFirst();
                  }}
                />
              )}
            </Combobox.Target>
            <Combobox.Dropdown data-testid="dropdown">
              <Combobox.Options aria-label="Countries">
                <For each={shown()}>{(country) => <Combobox.Option value={country}>{country}</Combobox.Option>}</For>
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
          <button type="button">After</button>
        </div>
      </SlopkitUi>
    );
  });
  const input = () => result.getByRole('combobox') as HTMLInputElement;
  const dropdown = () => result.queryByTestId('dropdown');
  return { ...result, input, dropdown, onOptionSubmit };
}

describe('<Combobox /> in a browser', () => {
  test('opens in the top layer under the target, as wide as it', async () => {
    const { input, dropdown } = setup();

    await userEvent.click(input());
    expect(dropdown()!.matches(':popover-open')).toBe(true);
    await expect
      .poll(() => Math.round(dropdown()!.getBoundingClientRect().top))
      .toBe(Math.round(input().getBoundingClientRect().bottom + 4));
    expect(Math.round(dropdown()!.getBoundingClientRect().width)).toBe(Math.round(input().getBoundingClientRect().width));
  });

  test('typing filters and makes the first match active; Enter chooses it, focus stays on the input', async () => {
    const { input, dropdown, onOptionSubmit, getByText } = setup();

    await userEvent.click(input());
    await userEvent.keyboard('2');
    expect(input()).toHaveAttribute('aria-activedescendant', getByText('Country 2').id);
    await userEvent.keyboard('{ArrowDown}');
    expect(input()).toHaveAttribute('aria-activedescendant', getByText('Country 12').id);
    await userEvent.keyboard('{Enter}');

    expect(onOptionSubmit).toHaveBeenCalledWith('Country 12');
    expect(input()).toHaveFocus();
    expect(input()).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(dropdown).toBeNull();
  });

  test('a click on an option chooses it and leaves focus on the input', async () => {
    const { input, onOptionSubmit, getByText } = setup();

    await userEvent.click(input());
    await userEvent.click(getByText('Country 3'));

    expect(onOptionSubmit).toHaveBeenCalledWith('Country 3');
    expect(input()).toHaveFocus();
  });

  test('the active option is scrolled into view in the listbox, and the page stays put', async () => {
    const { input, getByText, getByRole } = setup();
    const before = window.scrollY;

    await userEvent.click(input());
    await userEvent.keyboard('{ArrowUp}');
    const listbox = getByRole('listbox');
    const last = getByText('Country 40').getBoundingClientRect();
    const box = listbox.getBoundingClientRect();

    expect(input()).toHaveAttribute('aria-activedescendant', getByText('Country 40').id);
    expect(listbox.scrollTop).toBeGreaterThan(0);
    expect(last.bottom).toBeLessThanOrEqual(box.bottom + 1);
    expect(window.scrollY).toBe(before);
  });

  test('Escape closes it and keeps focus on the input', async () => {
    const { input, dropdown } = setup();

    await userEvent.click(input());
    await userEvent.keyboard('{Escape}');

    expect(input()).toHaveAttribute('aria-expanded', 'false');
    expect(input()).toHaveFocus();
    await expect.poll(dropdown).toBeNull();
  });

  test('a press outside closes it', async () => {
    const { input, getByText } = setup();

    await userEvent.click(input());
    await userEvent.click(getByText('After'));

    expect(input()).toHaveAttribute('aria-expanded', 'false');
  });

  test('Tab closes it and moves focus on', async () => {
    const { input, getByText } = setup();

    await userEvent.click(input());
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.tab();

    expect(input()).toHaveAttribute('aria-expanded', 'false');
    expect(getByText('After')).toHaveFocus();
  });

  test('a button target: Space opens it from a click handler, the arrows and End move, Enter chooses', async () => {
    const onOptionSubmit = vi.fn();
    const { getByText } = render(() => {
      const store = createCombobox();
      return (
        <SlopkitUi>
          <Combobox store={store} onOptionSubmit={onOptionSubmit}>
            <Combobox.Target>
              {(target) => (
                <button {...target} type="button" onClick={() => store.toggle()}>
                  Size
                </button>
              )}
            </Combobox.Target>
            <Combobox.Dropdown>
              <Combobox.Options aria-label="Sizes">
                <Combobox.Option value="s">Small</Combobox.Option>
                <Combobox.Option value="m">Medium</Combobox.Option>
                <Combobox.Option value="l">Large</Combobox.Option>
              </Combobox.Options>
            </Combobox.Dropdown>
          </Combobox>
        </SlopkitUi>
      );
    });
    const button = getByText('Size');
    button.focus();

    await userEvent.keyboard(' ');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{End}');
    expect(button).toHaveAttribute('aria-activedescendant', getByText('Large').id);
    await userEvent.keyboard('{ArrowUp}{Enter}');
    flush();
    expect(onOptionSubmit).toHaveBeenCalledWith('m');
    expect(button).toHaveFocus();
  });

  describe('with Combobox.Search', () => {
    const fruits = ['Apple', 'Banana', 'Cherry', 'Date'];

    /** A button showing the fruit, a search field in the dropdown, a button under the options, and one after it all. */
    function setupSearch(transitionDuration?: number) {
      const [value, setValue] = createSignal('Cherry');
      const [query, setQuery] = createSignal('');
      const onOptionSubmit = vi.fn((picked: string) => setValue(picked));
      const result = render(() => {
        const store = createCombobox({ onChange: (opened) => opened && setQuery('') });
        const shown = () => fruits.filter((fruit) => fruit.toLowerCase().includes(query().toLowerCase()));
        return (
          <SlopkitUi>
            <Combobox store={store} onOptionSubmit={onOptionSubmit} transitionDuration={transitionDuration}>
              <Combobox.Target>
                {(target) => (
                  <button {...target} type="button" onClick={() => store.toggle()}>
                    {value()}
                  </button>
                )}
              </Combobox.Target>
              <Combobox.Dropdown data-testid="dropdown">
                <Combobox.Search
                  aria-label="Search fruit"
                  value={query()}
                  onInput={(event) => setQuery(event.currentTarget.value)}
                />
                <Combobox.Options aria-label="Fruits">
                  <For each={shown()}>
                    {(fruit) => (
                      <Combobox.Option value={fruit} selected={value() === fruit}>
                        {fruit}
                      </Combobox.Option>
                    )}
                  </For>
                </Combobox.Options>
                <button type="button">Add fruit</button>
              </Combobox.Dropdown>
            </Combobox>
            <button type="button">After</button>
          </SlopkitUi>
        );
      });
      const button = () => result.getAllByRole('combobox')[0];
      const search = () => result.getByRole('combobox', { name: 'Search fruit' }) as HTMLInputElement;
      const dropdown = () => result.queryByTestId('dropdown');
      const option = (name: string) => result.getByRole('option', { name });
      return { ...result, button, search, dropdown, option, onOptionSubmit };
    }

    test('a click opens it with focus in the search field, on the selected option', async () => {
      const { button, search, option } = setupSearch();

      await userEvent.click(button());
      await expect.poll(() => document.activeElement).toBe(search());
      await expect.poll(() => search().getAttribute('aria-activedescendant')).toBe(option('Cherry').id);
      expect(search()).toHaveAttribute('aria-expanded', 'true');
      expect(search()).toHaveAttribute('aria-controls', search().closest('[popover]')!.querySelector('[role="listbox"]')!.id);
    });

    test('typing filters and makes the first match active; the arrows move; Enter chooses and focus goes back', async () => {
      const { button, search, option, dropdown, onOptionSubmit } = setupSearch();

      await userEvent.click(button());
      await expect.poll(() => document.activeElement).toBe(search());
      await userEvent.keyboard('a');
      expect(search()).toHaveAttribute('aria-activedescendant', option('Apple').id);
      await userEvent.keyboard('{ArrowDown}');
      expect(search()).toHaveAttribute('aria-activedescendant', option('Banana').id);
      await userEvent.keyboard('{Enter}');

      expect(onOptionSubmit).toHaveBeenCalledWith('Banana');
      expect(button()).toHaveFocus();
      expect(button()).toHaveAttribute('aria-expanded', 'false');
      await expect.poll(dropdown).toBeNull();
    });

    test('choosing after a search adds no options back while it closes; opening again shows them all', async () => {
      const { button, search, dropdown, getAllByRole } = setupSearch();

      await userEvent.click(button());
      await expect.poll(() => document.activeElement).toBe(search());
      await userEvent.keyboard('ch');
      expect(getAllByRole('option')).toHaveLength(1);
      // Options rendered again while it closes would flash the unfiltered list for as long as it fades out.
      const added: Node[] = [];
      const observer = new MutationObserver((records) => {
        for (const record of records)
          added.push(...[...record.addedNodes].filter((node) => node instanceof Element && node.role === 'option'));
      });
      observer.observe(dropdown()!, { subtree: true, childList: true });
      await userEvent.keyboard('{Enter}');
      await expect.poll(dropdown).toBeNull();
      observer.disconnect();
      expect(added).toEqual([]);

      await userEvent.click(button());
      await expect.poll(() => document.activeElement).toBe(search());
      expect(search()).toHaveValue('');
      expect(getAllByRole('option')).toHaveLength(4);
    });

    test('ArrowUp on the target opens it on the selected option, and focus moves to the search field', async () => {
      const { button, search, option } = setupSearch();

      button().focus();
      await userEvent.keyboard('{ArrowUp}');
      await expect.poll(() => document.activeElement).toBe(search());
      expect(search()).toHaveAttribute('aria-activedescendant', option('Cherry').id);
    });

    test('Escape closes it and focus goes back to the target', async () => {
      const { button, search, dropdown } = setupSearch();

      await userEvent.click(button());
      await expect.poll(() => document.activeElement).toBe(search());
      await userEvent.keyboard('{Escape}');

      expect(button()).toHaveFocus();
      await expect.poll(dropdown).toBeNull();
    });

    test('without an exit animation, Escape still brings focus back to the target', async () => {
      const { button, search, dropdown } = setupSearch(0);

      await userEvent.click(button());
      await expect.poll(() => document.activeElement).toBe(search());
      await userEvent.keyboard('{Escape}');

      expect(dropdown()).toBeNull();
      expect(button()).toHaveFocus();
    });

    test('Tab reaches a button in the dropdown and keeps it open; Tab out of the dropdown closes it', async () => {
      const { button, search, getByText } = setupSearch();

      await userEvent.click(button());
      await expect.poll(() => document.activeElement).toBe(search());
      await userEvent.tab();
      expect(getByText('Add fruit')).toHaveFocus();
      expect(button()).toHaveAttribute('aria-expanded', 'true');
      await userEvent.tab();

      expect(button()).toHaveAttribute('aria-expanded', 'false');
      expect(getByText('After')).toHaveFocus();
    });

    test('a press outside closes it', async () => {
      const { button, search, getByText } = setupSearch();

      await userEvent.click(button());
      await expect.poll(() => document.activeElement).toBe(search());
      await userEvent.click(getByText('After'));

      expect(button()).toHaveAttribute('aria-expanded', 'false');
      expect(getByText('After')).toHaveFocus();
    });
  });
});
