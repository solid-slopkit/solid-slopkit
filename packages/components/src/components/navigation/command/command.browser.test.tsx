import { render } from '@solidjs/testing-library';
import { createSignal, flush, For } from 'solid-js';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { SlopkitUi } from '../../provider';
import { Command } from './command';
import { CommandDialog } from './command-dialog';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const pages = Array.from({ length: 30 }, (_, index) => `Page ${index}`);

describe('<CommandDialog /> in a browser', () => {
  test('the shortcut opens it with focus in the input; the keyboard finds and selects an item; focus goes back', async () => {
    const selected: string[] = [];
    const [opened, setOpened] = createSignal(false);
    const { getByRole, container } = render(() => (
      <SlopkitUi>
        <button type="button">Before</button>
        <CommandDialog opened={opened()} onOpenedChange={setOpened}>
          <Command.Input />
          <Command.List>
            <For each={pages}>{(page) => <Command.Item onSelect={(value) => selected.push(value)}>{page}</Command.Item>}</For>
          </Command.List>
        </CommandDialog>
      </SlopkitUi>
    ));
    flush();
    const before = getByRole('button', { name: 'Before' });
    before.focus();

    const mod = /mac/i.test(navigator.platform) ? 'Meta' : 'Control';
    await userEvent.keyboard(`{${mod}>}k{/${mod}}`);
    await wait(300);
    const dialog = container.querySelector('dialog')!;
    expect(dialog.matches(':modal')).toBe(true);
    expect(getByRole('combobox', { name: 'Search' })).toHaveFocus();

    // The shortcut closes it too, from its own input, and opens it again.
    await userEvent.keyboard(`{${mod}>}k{/${mod}}`);
    await wait(300);
    expect(container.querySelector('dialog')).toBeNull();
    await userEvent.keyboard(`{${mod}>}k{/${mod}}`);
    await wait(300);
    expect(getByRole('combobox', { name: 'Search' })).toHaveFocus();

    // The active item is kept in view as the keyboard moves.
    await userEvent.keyboard('{ArrowUp}');
    const last = getByRole('option', { name: 'Page 29' });
    expect(last).toHaveAttribute('data-active');
    const list = getByRole('listbox').getBoundingClientRect();
    const box = last.getBoundingClientRect();
    expect(box.bottom).toBeLessThanOrEqual(list.bottom + 1);
    expect(box.top).toBeGreaterThanOrEqual(list.top - 1);

    await userEvent.keyboard('Page 1');
    expect(getByRole('option', { name: 'Page 1' })).toHaveAttribute('data-active');
    await userEvent.keyboard('2{Enter}');
    await wait(300);
    expect(selected).toEqual(['Page 12']);
    expect(container.querySelector('dialog')).toBeNull();
    expect(before).toHaveFocus();
  });
});

describe('<Command /> in a browser', () => {
  test('a click keeps focus in the input; groups without a found item and the empty message hide by the search', async () => {
    const selected: string[] = [];
    const { getByRole, container } = render(() => (
      <SlopkitUi>
        <Command>
          <Command.Input />
          <Command.List>
            <Command.Empty>Nothing found</Command.Empty>
            <Command.Group heading="Pages">
              <Command.Item onSelect={(value) => selected.push(value)}>Alpha</Command.Item>
            </Command.Group>
            <Command.Group heading="Settings">
              <Command.Item onSelect={(value) => selected.push(value)}>Beta</Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </SlopkitUi>
    ));
    flush();
    const input = getByRole('combobox', { name: 'Search' });
    const empty = container.querySelector<HTMLElement>('[data-slot="command-empty"]')!;
    const visible = (element: Element) => (element as HTMLElement).checkVisibility();
    await userEvent.click(input);

    await userEvent.click(getByRole('option', { name: 'Beta' }));
    expect(selected).toEqual(['Beta']);
    expect(input).toHaveFocus();
    expect(visible(empty)).toBe(false);

    await userEvent.keyboard('bet');
    expect(visible(getByRole('group', { name: 'Settings' }))).toBe(true);
    expect(visible(container.querySelector('[role="group"]')!)).toBe(false);

    await userEvent.keyboard('x');
    await wait(0);
    expect(visible(empty)).toBe(true);
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });
});
