import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush, For } from 'solid-js';
import axe from 'axe-core';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { SlopkitUi } from '../../provider';
import { Command, type CommandProps } from './command';
import { CommandDialog, type CommandDialogProps } from './command-dialog';

// Settles the microtasks the command and the dialog wait for, as in jsdom where nothing animates.
const settle = async () => {
  flush();
  for (let tick = 0; tick < 4; tick++) await Promise.resolve();
  flush();
};

const selected: string[] = [];
const select = (value: string) => selected.push(value);

const Items = () => (
  <>
    <Command.Item onSelect={select}>Home</Command.Item>
    <Command.Item value="docs" keywords={['guide', 'manual']} onSelect={select}>
      Documentation
      <Command.Shortcut>⌘D</Command.Shortcut>
    </Command.Item>
    <Command.Separator />
    <Command.Group heading="Settings">
      <Command.Item onSelect={select}>Profile</Command.Item>
      <Command.Item disabled onSelect={select}>
        Billing
      </Command.Item>
      <Command.Item onSelect={select}>Security</Command.Item>
    </Command.Group>
  </>
);

function queries(result: ReturnType<typeof render>) {
  const input = () => result.getByRole('combobox', { hidden: true }) as HTMLInputElement;
  const items = () => [...result.container.querySelectorAll<HTMLElement>('[role="option"]')];
  const shown = () => items().filter((item) => !item.hidden);
  const labels = () => shown().map((item) => item.firstChild!.textContent);
  const active = () => items().find((item) => item.hasAttribute('data-active'));
  const current = () => active()?.firstChild?.textContent;
  const type = async (value: string) => {
    fireEvent.input(input(), { target: { value } });
    await settle();
  };
  const key = async (name: string, init: KeyboardEventInit = {}) => {
    fireEvent.keyDown(input(), { key: name, ...init });
    await settle();
  };
  return { input, items, shown, labels, active, current, type, key };
}

async function setup(props: Partial<CommandProps> = {}) {
  const result = render(() => (
    <SlopkitUi>
      <Command {...props}>
        <Command.Input placeholder="Type a command…" />
        <Command.List>
          <Command.Empty>Nothing found</Command.Empty>
          <Items />
        </Command.List>
      </Command>
    </SlopkitUi>
  ));
  await settle();
  return { ...result, ...queries(result) };
}

afterEach(() => {
  selected.length = 0;
  vi.restoreAllMocks();
});

describe('<Command />', () => {
  test('an input that controls a listbox of items, in their groups', async () => {
    const { input, labels, container, getByRole } = await setup();

    expect(container.querySelector('.slp-command')).toHaveAttribute('data-slot', 'command');
    expect(input()).toHaveAttribute('aria-label', 'Search');
    expect(input()).toHaveAttribute('placeholder', 'Type a command…');
    expect(input()).toHaveAttribute('aria-expanded', 'true');
    expect(input().closest('[data-slot="command-input"]')).not.toBeNull();
    const listbox = getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-label', 'Suggestions');
    expect(input()).toHaveAttribute('aria-controls', listbox.id);
    expect(labels()).toEqual(['Home', 'Documentation', 'Profile', 'Billing', 'Security']);

    const group = getByRole('group', { name: 'Settings' });
    expect(group).toHaveAttribute('data-slot', 'command-group');
    expect(group.querySelectorAll('[role="option"]')).toHaveLength(3);
    expect(container.querySelector('[data-slot="command-shortcut"]')).toHaveTextContent('⌘D');
    expect(getByRole('option', { name: /Billing/ })).toHaveAttribute('aria-disabled', 'true');
    expect(container.querySelector('[data-slot="command-separator"]')).toHaveAttribute('aria-hidden', 'true');
  });

  test('typing hides the items it does not find, by every word of the value or keywords; separators hide too', async () => {
    const { type, labels, container, items } = await setup();
    const separator = () => container.querySelector('[data-slot="command-separator"]')!;

    await type('manual');
    expect(labels()).toEqual(['Documentation']);
    expect(separator()).toHaveAttribute('hidden');
    await type('SEC');
    expect(labels()).toEqual(['Security']);
    await type('nope');
    expect(labels()).toEqual([]);
    // Hidden, not removed: the order stays as written.
    expect(items()).toHaveLength(5);
    await type('');
    expect(labels()).toHaveLength(5);
    expect(separator()).not.toHaveAttribute('hidden');
  });

  test('the first item is active; the arrows move, skipping disabled ones and looping; a new search starts over', async () => {
    const { key, active, current, input, type } = await setup();

    expect(current()).toBe('Home');
    expect(active()).toHaveAttribute('aria-selected', 'true');
    expect(input()).toHaveAttribute('aria-activedescendant', active()!.id);

    await key('ArrowDown');
    await key('ArrowDown');
    expect(current()).toBe('Profile');
    await key('ArrowDown');
    expect(current()).toBe('Security');
    expect(input()).toHaveAttribute('aria-activedescendant', active()!.id);
    await key('ArrowDown');
    expect(current()).toBe('Home');
    await key('ArrowUp');
    expect(current()).toBe('Security');
    expect(document.querySelectorAll('[aria-selected="true"]')).toHaveLength(1);

    await type('o');
    expect(current()).toBe('Home');
    await type('pro');
    expect(current()).toBe('Profile');
  });

  test('loop: false stops at the ends', async () => {
    const { key, current } = await setup({ loop: false });
    await key('ArrowUp');
    expect(current()).toBe('Home');
  });

  test('Enter selects the active item with its value; so does a click; a disabled one does nothing', async () => {
    const { key, getByRole } = await setup();
    await key('ArrowDown');
    await key('Enter');
    expect(selected).toEqual(['docs']);

    fireEvent.click(getByRole('option', { name: /Billing/ }));
    fireEvent.click(getByRole('option', { name: /Profile/ }));
    expect(selected).toEqual(['docs', 'Profile']);
  });

  test('the pointer over an item makes it active, unless it is disabled', async () => {
    const { current, getByRole } = await setup();
    fireEvent.pointerMove(getByRole('option', { name: /Profile/ }));
    flush();
    expect(current()).toBe('Profile');
    fireEvent.pointerMove(getByRole('option', { name: /Billing/ }));
    flush();
    expect(current()).toBe('Profile');
  });

  test('a custom filter, and shouldFilter: false', async () => {
    const custom = await setup({ filter: (value, search) => value.startsWith(search) });
    await custom.type('Pro');
    expect(custom.labels()).toEqual(['Profile']);
    custom.unmount();

    const none = await setup({ shouldFilter: false });
    await none.type('zzz');
    expect(none.labels()).toHaveLength(5);
  });

  test('a controlled search and value', async () => {
    const [search, setSearch] = createSignal('e');
    const [value, setValue] = createSignal<string | undefined>('Security');
    const onSearchChange = vi.fn((next: string) => setSearch(next));
    const onValueChange = vi.fn((next: string | undefined) => setValue(next));
    const { labels, type, input, current, key } = await setup({
      get search() {
        return search();
      },
      onSearchChange,
      get value() {
        return value();
      },
      onValueChange,
    });
    expect(labels()).toEqual(['Home', 'Documentation', 'Profile', 'Security']);
    expect(current()).toBe('Security');

    await key('ArrowUp');
    expect(onValueChange).toHaveBeenLastCalledWith('Profile');

    setValue('docs');
    await settle();
    expect(current()).toBe('Documentation');

    await type('pro');
    expect(onSearchChange).toHaveBeenCalledWith('pro');
    expect(input().value).toBe('pro');
    expect(labels()).toEqual(['Profile']);
  });

  test('items that come later: the first is made active; removing the active one moves to the next', async () => {
    const [items, setItems] = createSignal<string[]>([]);
    const result = render(() => (
      <SlopkitUi>
        <Command shouldFilter={false}>
          <Command.Input />
          <Command.List>
            <For each={items()}>{(item) => <Command.Item>{item}</Command.Item>}</For>
          </Command.List>
        </Command>
      </SlopkitUi>
    ));
    await settle();
    const { current, input } = queries(result);
    expect(input()).not.toHaveAttribute('aria-activedescendant');

    setItems(['Alpha', 'Beta']);
    await settle();
    expect(current()).toBe('Alpha');

    setItems(['Beta']);
    await settle();
    expect(current()).toBe('Beta');
  });

  test('parts outside <Command> throw', () => {
    expect(() => render(() => <Command.Item>Lost</Command.Item>)).toThrow('<Command.Item> must be rendered inside <Command>.');
  });

  test('has no axe violations, with items found and without', async () => {
    const { container, type } = await setup();
    expect((await axe.run(container)).violations).toEqual([]);
    await type('nope');
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('typing and moving have no diagnostics; moving re-runs no item', async () => {
    const { type, key } = await setup();
    const { artifact } = await captureArtifact(
      async () => {
        await type('s');
        await type('se');
        await key('ArrowDown');
        await key('ArrowUp');
      },
      { scenario: 'command' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    // Each search checks each of the 5 items once; moving touches the items' elements, not their scopes.
    expect(artifact).toStayWithinRerunBudget(10, { scope: /^Command\.Item\.hidden$/ });
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./command.fixtures.tsx', 'dialog');
    await expectHydration('./command.fixtures.tsx', 'inline');
  });
});

describe('<CommandDialog />', () => {
  function setupDialog(props: Partial<CommandDialogProps> = {}) {
    const [opened, setOpened] = createSignal(false);
    const onOpenedChange = vi.fn((next: boolean) => setOpened(next));
    const result = render(() => (
      <SlopkitUi>
        <CommandDialog opened={opened()} onOpenedChange={onOpenedChange} {...props}>
          <Command.Input />
          <Command.List>
            <Items />
          </Command.List>
        </CommandDialog>
      </SlopkitUi>
    ));
    flush();
    const dialog = () => result.container.querySelector('dialog');
    const open = async () => {
      setOpened(true);
      await settle();
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await settle();
    };
    return { ...result, ...queries(result), dialog, open, setOpened, onOpenedChange };
  }

  test('closed, it renders nothing; open, a modal named "Command menu" around the command', async () => {
    const { dialog, open, input } = setupDialog();
    expect(dialog()).toBeNull();
    await open();
    expect(dialog()).toHaveClass('slp-command-dialog', 'slp-modal');
    expect(dialog()).toHaveAttribute('aria-label', 'Command menu');
    expect(dialog()).toHaveAttribute('data-size', 'lg');
    expect(dialog()!.querySelector('[data-slot="modal-header"]')).toBeNull();
    expect(input().closest('.slp-command')).not.toBeNull();
  });

  test('selecting an item asks it to close, unless closeOnSelect is false', async () => {
    const closing = setupDialog();
    await closing.open();
    await closing.key('Enter');
    expect(selected).toEqual(['Home']);
    expect(closing.onOpenedChange).toHaveBeenLastCalledWith(false);
    await settle();
    expect(closing.dialog()).toBeNull();
    closing.unmount();

    const staying = setupDialog({ closeOnSelect: false });
    await staying.open();
    await staying.key('Enter');
    expect(staying.onOpenedChange).not.toHaveBeenCalled();
  });

  test('each opening starts with an empty search', async () => {
    const { open, type, setOpened, input } = setupDialog();
    await open();
    await type('home');
    setOpened(false);
    await settle();
    await open();
    expect(input().value).toBe('');
  });

  test('Ctrl+K asks it to open and close, from anywhere; another shortcut, or none, can be set', async () => {
    const { dialog, onOpenedChange, unmount } = setupDialog();
    fireEvent.keyDown(document.body, { key: 'k', code: 'KeyK', ctrlKey: true });
    await settle();
    expect(onOpenedChange).toHaveBeenLastCalledWith(true);
    expect(dialog()).not.toBeNull();
    fireEvent.keyDown(document.body, { key: 'k', code: 'KeyK', ctrlKey: true });
    await settle();
    expect(onOpenedChange).toHaveBeenLastCalledWith(false);
    fireEvent.keyDown(document.body, { key: 'k', code: 'KeyK', ctrlKey: true, shiftKey: true });
    fireEvent.keyDown(document.body, { key: 'k', code: 'KeyK' });
    expect(onOpenedChange).toHaveBeenCalledTimes(2);
    unmount();

    const custom = setupDialog({ shortcut: ['/', 'alt+P'] });
    fireEvent.keyDown(document.body, { key: 'π', code: 'KeyP', altKey: true });
    expect(custom.onOpenedChange).toHaveBeenLastCalledWith(true);
    custom.unmount();

    const none = setupDialog({ shortcut: null });
    fireEvent.keyDown(document.body, { key: 'k', code: 'KeyK', ctrlKey: true });
    expect(none.onOpenedChange).not.toHaveBeenCalled();
  });

  test('Command props pass through, and it has no axe violations', async () => {
    const { open, type, labels, container } = setupDialog({ filter: (value, search) => value.startsWith(search) });
    await open();
    await type('Se');
    expect(labels()).toEqual(['Security']);
    expect((await axe.run(container)).violations).toEqual([]);
  });
});
