// SSR scenarios for tree.test.tsx.
import { Tree, type TreeNodeData } from '.';

const data: TreeNodeData[] = [
  {
    value: 'src',
    label: 'src',
    children: [
      { value: 'src/app.tsx', label: 'app.tsx' },
      { value: 'src/lib', label: 'lib', children: [{ value: 'src/lib/util.ts', label: 'util.ts' }] },
    ],
  },
  { value: 'package.json', label: 'package.json' },
];

export const trees = () => (
  <div>
    <Tree data={data} aria-label="Files" defaultExpanded={['src']} defaultSelected="src/app.tsx" class="mine" />
    <Tree
      data={data}
      aria-label="Picked files"
      multiple
      defaultSelected={['package.json']}
      color="secondary"
      renderNode={(payload) => (
        <>
          <span>{payload.hasChildren ? 'dir' : 'file'}</span> {payload.node.label}
        </>
      )}
    />
  </div>
);
