import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Tabs, type TabsProps } from './tabs';

function setup(props: Partial<TabsProps> = {}) {
  const onChange = vi.fn();
  const result = render(() => (
    <Tabs defaultValue="gallery" onChange={onChange} {...props}>
      <Tabs.List aria-label="Sections">
        <Tabs.Tab value="gallery">Gallery</Tabs.Tab>
        <Tabs.Tab value="messages" rightSection={<span>3</span>}>
          Messages
        </Tabs.Tab>
        <Tabs.Tab value="archive" disabled>
          Archive
        </Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="gallery">Gallery content</Tabs.Panel>
      <Tabs.Panel value="messages">
        Messages content <button type="button">Reply</button>
      </Tabs.Panel>
      <Tabs.Panel value="settings">Settings content</Tabs.Panel>
    </Tabs>
  ));
  flush();
  const tab = (name: string) => result.getByRole('tab', { name: new RegExp(`^${name}`) });
  const key = (name: string, key: string) => {
    fireEvent.keyDown(tab(name), { key });
    flush();
  };
  const selected = () => result.getAllByRole('tab').filter((one) => one.getAttribute('aria-selected') === 'true');
  return { ...result, tab, key, selected, onChange };
}

describe('<Tabs />', () => {
  test('a tablist of tabs, the selected one controlling its labelled panel', async () => {
    const { tab, getByRole, container } = setup({ class: 'mine' });
    await Promise.resolve();
    flush();

    expect(container.querySelector('.slp-tabs')).toHaveClass('mine');
    expect(getByRole('tablist', { name: 'Sections' })).toHaveAttribute('aria-orientation', 'horizontal');
    expect(tab('Gallery')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Messages')).toHaveAttribute('aria-selected', 'false');

    const panel = getByRole('tabpanel', { name: 'Gallery' });
    expect(panel).toHaveTextContent('Gallery content');
    expect(panel).toHaveAttribute('tabindex', '0');
    expect(tab('Gallery')).toHaveAttribute('aria-controls', panel.id);
    // Only the selected panel is rendered, so the other tabs point at nothing.
    expect(tab('Messages')).not.toHaveAttribute('aria-controls');
  });

  test('the selected tab is the one tab stop', () => {
    const { tab } = setup();

    expect(tab('Gallery')).toHaveAttribute('tabindex', '0');
    expect(tab('Messages')).toHaveAttribute('tabindex', '-1');
    expect(tab('Settings')).toHaveAttribute('tabindex', '-1');
  });

  test('a click selects a tab and shows its panel', () => {
    const { tab, queryByText, getByText, onChange } = setup();

    fireEvent.click(tab('Messages'));
    flush();
    expect(onChange).toHaveBeenCalledWith('messages');
    expect(tab('Messages')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Messages')).toHaveAttribute('tabindex', '0');
    expect(getByText('Messages content')).toBeDefined();
    expect(queryByText('Gallery content')).toBeNull();
  });

  test('the arrows move and select, skipping disabled tabs and looping; Home and End', () => {
    const { tab, key, selected } = setup();
    tab('Gallery').focus();

    key('Gallery', 'ArrowRight');
    expect(tab('Messages')).toHaveFocus();
    expect(selected()[0]).toBe(tab('Messages'));
    key('Messages', 'ArrowRight');
    expect(tab('Settings')).toHaveFocus();
    key('Settings', 'ArrowRight');
    expect(tab('Gallery')).toHaveFocus();
    key('Gallery', 'ArrowLeft');
    expect(tab('Settings')).toHaveFocus();
    key('Settings', 'Home');
    expect(selected()[0]).toBe(tab('Gallery'));
    key('Gallery', 'End');
    expect(selected()[0]).toBe(tab('Settings'));
  });

  test('loop={false} stops at the ends', () => {
    const { tab, key } = setup({ loop: false, defaultValue: 'settings' });
    tab('Settings').focus();

    key('Settings', 'ArrowRight');
    expect(tab('Settings')).toHaveFocus();
  });

  test('manual activation: the arrows only move focus; Enter or a click selects', () => {
    const { tab, key, selected, onChange } = setup({ activation: 'manual' });
    tab('Gallery').focus();

    key('Gallery', 'ArrowRight');
    expect(tab('Messages')).toHaveFocus();
    expect(selected()[0]).toBe(tab('Gallery'));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(tab('Messages'));
    flush();
    expect(selected()[0]).toBe(tab('Messages'));
  });

  test('vertical: Up and Down move, Left and Right do not', () => {
    const { tab, key, getByRole } = setup({ orientation: 'vertical' });
    tab('Gallery').focus();

    expect(getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    key('Gallery', 'ArrowRight');
    expect(tab('Gallery')).toHaveFocus();
    key('Gallery', 'ArrowDown');
    expect(tab('Messages')).toHaveFocus();
  });

  test('keys in a panel do nothing to the tabs', () => {
    const { tab, getByRole, selected } = setup({ defaultValue: 'messages' });

    fireEvent.keyDown(getByRole('button', { name: 'Reply' }), { key: 'ArrowRight' });
    flush();
    expect(selected()[0]).toBe(tab('Messages'));
  });

  test('keepMounted keeps the other panels in the DOM, hidden', async () => {
    const { tab, getByText } = setup({ keepMounted: true });
    await Promise.resolve();
    flush();

    expect(getByText('Settings content')).not.toBeVisible();
    expect(getByText('Settings content')).toHaveAttribute('hidden');
    expect(tab('Settings')).toHaveAttribute('aria-controls', getByText('Settings content').id);
    fireEvent.click(tab('Settings'));
    flush();
    expect(getByText('Settings content')).not.toHaveAttribute('hidden');
    expect(getByText('Gallery content')).toHaveAttribute('hidden');
  });

  test('a panel that unmounts takes its tab’s aria-controls with it', async () => {
    const { tab } = setup();
    await Promise.resolve();
    flush();
    expect(tab('Gallery')).toHaveAttribute('aria-controls');

    fireEvent.click(tab('Settings'));
    flush();
    await Promise.resolve();
    flush();
    expect(tab('Gallery')).not.toHaveAttribute('aria-controls');
    expect(tab('Settings')).toHaveAttribute('aria-controls');
  });

  test('with nothing selected, no panel shows and every tab is a tab stop', () => {
    const { tab, queryAllByRole } = setup({ defaultValue: undefined });

    expect(queryAllByRole('tabpanel')).toHaveLength(0);
    expect(tab('Gallery')).toHaveAttribute('tabindex', '0');
    expect(tab('Settings')).toHaveAttribute('tabindex', '0');
  });

  test('controlled: shows value, and only asks to change it', () => {
    const [value, setValue] = createSignal<string | null>('gallery');
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Tabs value={value()} onChange={onChange}>
        <Tabs.List>
          <Tabs.Tab value="gallery">Gallery</Tabs.Tab>
          <Tabs.Tab value="settings">Settings</Tabs.Tab>
        </Tabs.List>
      </Tabs>
    ));
    flush();

    fireEvent.click(getByRole('tab', { name: 'Settings' }));
    flush();
    expect(onChange).toHaveBeenCalledWith('settings');
    expect(getByRole('tab', { name: 'Gallery' })).toHaveAttribute('aria-selected', 'true');

    setValue('settings');
    flush();
    expect(getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true');
  });

  test('ids are safe for values with spaces and punctuation', () => {
    const { getByRole } = render(() => (
      <Tabs defaultValue="a b/c">
        <Tabs.List>
          <Tabs.Tab value="a b/c">Odd</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="a b/c">Odd content</Tabs.Panel>
      </Tabs>
    ));
    flush();

    expect(getByRole('tab').id).not.toMatch(/[\s/]/);
    expect(getByRole('tabpanel', { name: 'Odd' })).toBeDefined();
  });

  test('variant, color, size and orientation are on the root', () => {
    const { container } = setup({ variant: 'pills', color: 'accent', size: 'lg', orientation: 'vertical' });
    const root = container.querySelector('.slp-tabs')!;

    expect(root).toHaveAttribute('data-variant', 'pills');
    expect(root).toHaveAttribute('data-color', 'accent');
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-orientation', 'vertical');
  });

  test('the parts throw outside Tabs', () => {
    expect(() => render(() => <Tabs.Tab value="a">A</Tabs.Tab>)).toThrow('<Tabs.Tab> must be rendered inside <Tabs>.');
  });

  test('has no axe violations', async () => {
    const { container, tab } = setup({ keepMounted: true });
    await Promise.resolve();
    flush();
    expect((await axe.run(container)).violations).toEqual([]);
    fireEvent.click(tab('Messages'));
    flush();
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('moving through the tabs has no diagnostics or waste', async () => {
    const { tab, key } = setup();
    tab('Gallery').focus();

    const { artifact } = await captureArtifact(
      () => {
        key('Gallery', 'ArrowRight');
        key('Messages', 'ArrowRight');
        key('Settings', 'Home');
      },
      { scenario: 'tabs-move' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./tabs.fixtures.tsx', 'tabs');
  });
});
