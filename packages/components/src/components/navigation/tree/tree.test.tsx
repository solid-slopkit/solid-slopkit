import { fireEvent, render } from '@solidjs/testing-library';
import { captureArtifact } from '@solidjs/diagnostics';
import { createSignal, flush } from 'solid-js';
import axe from 'axe-core';
import { describe, expect, test, vi } from 'vitest';
import { expectHydration } from '../../../../test/ssr';
import { NO_DIAGNOSTICS } from '../../../../test/diagnostics';
import { Tree, type TreeNodeData, type TreeProps } from './tree';

const data: TreeNodeData[] = [
  {
    value: 'src',
    label: 'src',
    children: [
      { value: 'src/app.tsx', label: 'app.tsx' },
      {
        value: 'src/components',
        label: 'components',
        children: [
          { value: 'src/components/button.tsx', label: 'button.tsx' },
          { value: 'src/components/badge.tsx', label: 'badge.tsx' },
        ],
      },
    ],
  },
  { value: 'docs', label: 'docs', children: [{ value: 'docs/intro.md', label: 'intro.md' }] },
  { value: 'package.json', label: 'package.json' },
  { value: 'readme', label: 'README.md' },
];

function setup(props: Partial<Omit<TreeProps, 'data'>> = {}) {
  const onExpandedChange = vi.fn();
  const onSelectedChange = vi.fn();
  const result = render(() => (
    <Tree
      aria-label="Files"
      onExpandedChange={onExpandedChange}
      onSelectedChange={onSelectedChange}
      {...(props as TreeProps)}
      data={data}
    />
  ));
  flush();
  const item = (name: string) => result.getByRole('treeitem', { name: new RegExp(`^${name.replace('.', '\\.')}`) });
  const visible = () =>
    result.getAllByRole('treeitem').map((element) => element.querySelector('[data-slot="tree-label"]')!.textContent);
  const key = (name: string, key: string) => {
    fireEvent.keyDown(item(name), { key });
    flush();
  };
  const click = (name: string) => {
    fireEvent.click(item(name).querySelector('[data-slot="tree-node"]')!);
    flush();
  };
  return { ...result, item, visible, key, click, onExpandedChange, onSelectedChange };
}

describe('<Tree />', () => {
  test('a tree of treeitems with their level, position and state; collapsed children are not rendered', () => {
    const { getByRole, item, visible } = setup({ class: 'mine' });

    expect(getByRole('tree', { name: 'Files' })).toHaveClass('slp-tree', 'mine');
    expect(visible()).toEqual(['src', 'docs', 'package.json', 'README.md']);
    expect(item('src')).toHaveAttribute('aria-expanded', 'false');
    expect(item('src')).toHaveAttribute('aria-level', '1');
    expect(item('src')).toHaveAttribute('aria-posinset', '1');
    expect(item('src')).toHaveAttribute('aria-setsize', '4');
    expect(item('src')).toHaveAttribute('aria-selected', 'false');
    expect(item('package.json')).not.toHaveAttribute('aria-expanded');
  });

  test('expanded children are in a group, one level down', () => {
    const { item, visible, getAllByRole } = setup({ defaultExpanded: ['src', 'src/components'] });

    expect(visible()).toEqual(['src', 'app.tsx', 'components', 'button.tsx', 'badge.tsx', 'docs', 'package.json', 'README.md']);
    expect(item('src')).toHaveAttribute('aria-expanded', 'true');
    expect(item('button.tsx')).toHaveAttribute('aria-level', '3');
    expect(item('badge.tsx')).toHaveAttribute('aria-posinset', '2');
    expect(item('badge.tsx')).toHaveAttribute('aria-setsize', '2');
    expect(getAllByRole('group')).toHaveLength(2);
    expect(item('src').querySelector(':scope > [role="group"]')).toContainElement(item('app.tsx'));
  });

  test('one tab stop: the first node, then the one last focused', () => {
    const { item } = setup();
    expect(item('src')).toHaveAttribute('tabindex', '0');
    expect(item('docs')).toHaveAttribute('tabindex', '-1');

    item('docs').focus();
    flush();
    expect(item('docs')).toHaveAttribute('tabindex', '0');
    expect(item('src')).toHaveAttribute('tabindex', '-1');
  });

  test('the tab stop starts on the selected node when it is visible', () => {
    const { item } = setup({ defaultSelected: 'package.json' });
    expect(item('package.json')).toHaveAttribute('tabindex', '0');
  });

  test("collapsing the focused node's parent moves the tab stop to a visible node", () => {
    const { item, click } = setup({ defaultExpanded: ['src'] });
    item('app.tsx').focus();
    flush();
    expect(item('app.tsx')).toHaveAttribute('tabindex', '0');

    click('src');
    expect(item('src')).toHaveAttribute('tabindex', '0');
  });

  test('a click selects a node and expands or collapses one with children', () => {
    const { click, item, visible, onSelectedChange, onExpandedChange } = setup();

    click('src');
    expect(item('src')).toHaveAttribute('aria-selected', 'true');
    expect(item('src')).toHaveAttribute('aria-expanded', 'true');
    expect(onSelectedChange).toHaveBeenLastCalledWith('src');
    expect(onExpandedChange).toHaveBeenLastCalledWith(['src']);

    click('app.tsx');
    expect(item('app.tsx')).toHaveAttribute('aria-selected', 'true');
    expect(item('src')).toHaveAttribute('aria-selected', 'false');
    expect(onSelectedChange).toHaveBeenLastCalledWith('src/app.tsx');

    click('src');
    expect(visible()).toEqual(['src', 'docs', 'package.json', 'README.md']);
    expect(onExpandedChange).toHaveBeenLastCalledWith([]);
  });

  test('multiple: a click toggles each node in the selection', () => {
    const { click, item, getByRole, onSelectedChange } = setup({ multiple: true, defaultSelected: ['readme'] });

    expect(getByRole('tree')).toHaveAttribute('aria-multiselectable', 'true');
    click('package.json');
    expect(onSelectedChange).toHaveBeenLastCalledWith(['readme', 'package.json']);
    click('README.md');
    expect(onSelectedChange).toHaveBeenLastCalledWith(['package.json']);
    expect(item('README.md')).toHaveAttribute('aria-selected', 'false');
  });

  test('Up and Down move through the visible nodes, without looping; Home and End', () => {
    const { item, key } = setup({ defaultExpanded: ['src'] });
    item('src').focus();

    key('src', 'ArrowDown');
    expect(item('app.tsx')).toHaveFocus();
    key('app.tsx', 'ArrowDown');
    expect(item('components')).toHaveFocus();
    key('components', 'ArrowDown');
    expect(item('docs')).toHaveFocus();
    key('docs', 'End');
    expect(item('README.md')).toHaveFocus();
    key('README.md', 'ArrowDown');
    expect(item('README.md')).toHaveFocus();
    key('README.md', 'Home');
    expect(item('src')).toHaveFocus();
    key('src', 'ArrowUp');
    expect(item('src')).toHaveFocus();
  });

  test('Right expands a node, then moves to its first child; Left collapses it, or moves to the parent', () => {
    const { item, key, visible } = setup();
    item('src').focus();

    key('src', 'ArrowRight');
    expect(item('src')).toHaveAttribute('aria-expanded', 'true');
    expect(item('src')).toHaveFocus();
    key('src', 'ArrowRight');
    expect(item('app.tsx')).toHaveFocus();
    key('app.tsx', 'ArrowRight');
    expect(item('app.tsx')).toHaveFocus();
    key('app.tsx', 'ArrowLeft');
    expect(item('src')).toHaveFocus();
    key('src', 'ArrowLeft');
    expect(item('src')).toHaveAttribute('aria-expanded', 'false');
    expect(visible()).toEqual(['src', 'docs', 'package.json', 'README.md']);
    key('src', 'ArrowLeft');
    expect(item('src')).toHaveFocus();
  });

  test('Enter and Space do what a click does', () => {
    const { item, key, onSelectedChange } = setup();
    item('docs').focus();

    key('docs', 'Enter');
    expect(item('docs')).toHaveAttribute('aria-expanded', 'true');
    expect(onSelectedChange).toHaveBeenLastCalledWith('docs');
    key('docs', ' ');
    expect(item('docs')).toHaveAttribute('aria-expanded', 'false');
  });

  test('* expands every sibling with children', () => {
    const { item, key, onExpandedChange } = setup();
    item('package.json').focus();

    key('package.json', '*');
    expect(onExpandedChange).toHaveBeenLastCalledWith(['src', 'docs']);
    expect(item('src')).toHaveAttribute('aria-expanded', 'true');
    expect(item('docs')).toHaveAttribute('aria-expanded', 'true');
  });

  test('typing jumps to the next visible node whose label starts with it, skipping collapsed ones', () => {
    vi.useFakeTimers();
    const { item, key } = setup();
    item('src').focus();

    key('src', 'a');
    expect(item('src')).toHaveFocus();
    vi.advanceTimersByTime(600);
    key('src', 'p');
    expect(item('package.json')).toHaveFocus();
    vi.advanceTimersByTime(600);
    key('package.json', 'd');
    expect(item('docs')).toHaveFocus();
    vi.useRealTimers();
  });

  test('keys in a node that comes from renderNode stay there', () => {
    const { getByRole, container } = render(() => (
      <Tree data={data} aria-label="Files" renderNode={(payload) => <input aria-label={`Rename ${payload.node.value}`} />} />
    ));
    const input = getByRole('textbox', { name: 'Rename src' });
    input.focus();
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    flush();
    expect(container.querySelector('[data-value="src"]')).toHaveAttribute('aria-expanded', 'false');
  });

  test('controlled: shows expanded and selected, and only asks to change them', () => {
    const [expanded, setExpanded] = createSignal<string[]>(['docs']);
    const [selected, setSelected] = createSignal<string | null>('docs/intro.md');
    const onExpandedChange = vi.fn();
    const onSelectedChange = vi.fn();
    const { getByRole } = render(() => (
      <Tree
        data={data}
        aria-label="Files"
        expanded={expanded()}
        onExpandedChange={onExpandedChange}
        selected={selected()}
        onSelectedChange={onSelectedChange}
      />
    ));
    flush();
    const item = (name: string) => getByRole('treeitem', { name: new RegExp(`^${name}`) });

    expect(item('intro.md')).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(item('src').querySelector('[data-slot="tree-node"]')!);
    flush();
    expect(onExpandedChange).toHaveBeenCalledWith(['docs', 'src']);
    expect(onSelectedChange).toHaveBeenCalledWith('src');
    expect(item('src')).toHaveAttribute('aria-expanded', 'false');
    expect(item('intro.md')).toHaveAttribute('aria-selected', 'true');

    setExpanded(['src']);
    setSelected('src');
    flush();
    expect(item('src')).toHaveAttribute('aria-expanded', 'true');
    expect(item('src')).toHaveAttribute('aria-selected', 'true');
  });

  test('renderNode replaces the label and sees the state', () => {
    const { getByRole } = render(() => (
      <Tree
        data={data}
        aria-label="Files"
        defaultExpanded={['docs']}
        renderNode={(payload) => (
          <span>
            {payload.node.value}:{payload.level}:{payload.expanded ? 'open' : 'closed'}:{payload.hasChildren ? 'dir' : 'file'}
          </span>
        )}
      />
    ));
    expect(getByRole('treeitem', { name: 'docs:1:open:dir docs/intro.md:2:closed:file' })).toBeDefined();
    expect(getByRole('treeitem', { name: 'src:1:closed:dir' })).toBeDefined();
  });

  test('has no axe violations, collapsed and expanded', async () => {
    const { container, click } = setup({ defaultSelected: 'readme' });
    expect((await axe.run(container)).violations).toEqual([]);
    click('src');
    click('components');
    expect((await axe.run(container)).violations).toEqual([]);
  });

  test('moving, expanding and selecting have no diagnostics or waste', async () => {
    const { item, key, click } = setup();
    item('src').focus();
    flush();

    const { artifact } = await captureArtifact(
      () => {
        key('src', 'ArrowRight');
        key('src', 'ArrowDown');
        key('app.tsx', 'Enter');
        click('docs');
      },
      { scenario: 'tree-navigate' },
    );

    expect(artifact).toHaveNoDiagnostics(NO_DIAGNOSTICS);
    expect(artifact).toHaveNoWaste();
  });

  test('hydrates the server render without mismatches or diagnostics', async () => {
    await expectHydration('./tree.fixtures.tsx', 'trees');
  });
});
