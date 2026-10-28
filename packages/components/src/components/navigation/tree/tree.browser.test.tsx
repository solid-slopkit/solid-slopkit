import { render } from '@solidjs/testing-library';
import { userEvent } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import { Tree, type TreeNodeData } from './tree';

const data: TreeNodeData[] = [
  {
    value: 'src',
    label: 'src',
    children: [{ value: 'src/lib', label: 'lib', children: [{ value: 'src/lib/util.ts', label: 'util.ts' }] }],
  },
  { value: 'package.json', label: 'package.json' },
];

describe('<Tree /> in a browser', () => {
  test('one tab stop; a click focuses the node, and the keyboard takes it from there', async () => {
    const { getByRole, getByText } = render(() => (
      <>
        <button type="button">Before</button>
        <Tree data={data} aria-label="Files" />
        <button type="button">After</button>
      </>
    ));
    const item = (name: string) => getByRole('treeitem', { name: new RegExp(`^${name}`) });

    await userEvent.click(getByText('Before'));
    await userEvent.tab();
    expect(item('src')).toHaveFocus();
    await userEvent.tab();
    expect(getByText('After')).toHaveFocus();

    await userEvent.click(getByText('package.json'));
    expect(item('package.json')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowDown}');
    expect(item('util.ts')).toHaveFocus();
  });

  test('each level is indented by the offset, and the focus ring is on the row', async () => {
    const { getByRole } = render(() => <Tree data={data} aria-label="Files" defaultExpanded={['src', 'src/lib']} />);
    const row = (name: string) =>
      getByRole('treeitem', { name: new RegExp(`^${name}`) }).querySelector<HTMLElement>('[data-slot="tree-node"]')!;
    const indent = (name: string) => parseFloat(getComputedStyle(row(name)).paddingLeft);

    expect(indent('lib') - indent('src')).toBe(20);
    expect(indent('util.ts') - indent('lib')).toBe(20);

    getByRole('treeitem', { name: /^src/ }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(getComputedStyle(row('lib')).outlineStyle).toBe('solid');
    expect(getComputedStyle(getByRole('treeitem', { name: /^lib/ })).outlineStyle).toBe('none');
  });
});
